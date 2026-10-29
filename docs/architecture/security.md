# Security Architecture

> Specification §22 (security architecture), §18 (authentication), §75 (CORS), §76 (database).
> The threat analysis lives in [`../security/threat-model.md`](../security/threat-model.md); this
> is the control inventory.

## 1. Layers

```
  Internet
     │  TLS 1.2 / 1.3 only
  ┌──▼────────────────────────────────────────────────┐
  │ NGINX — security headers, rate limits, size caps  │
  │         blocks /admin, /metrics, /docs publicly   │
  └──┬────────────────────────────────────────────────┘
     │
  ┌──▼────────────────────────────────────────────────┐
  │ APPLICATION                                       │
  │  Next.js  — proxy allow-list, CSP, server-only    │
  │  FastAPI  — Pydantic validation, bearer auth,     │
  │             rate limits, upload verification      │
  └──┬────────────────────────────────────────────────┘
     │
  ┌──▼────────────────────────────────────────────────┐
  │ DATA — internal network, no egress, no host port  │
  └───────────────────────────────────────────────────┘
```

## 2. Transport

| Control | Setting |
| --- | --- |
| TLS | 1.2 and 1.3 only; modern cipher suite |
| HTTP | 301 to HTTPS, except the ACME challenge path |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| OCSP stapling | Enabled |
| Session tickets | Disabled (forward secrecy) |

## 3. Security headers

Defined once in `apps/web/lib/security-headers.mjs` and applied at **both** the Nginx edge and the
application, so a misconfigured proxy cannot silently drop them.

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | See below |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Permissions-Policy` | Camera, microphone, geolocation, payment and 10 more denied |
| `Strict-Transport-Security` | Production only |

Nginx uses `add_header ... always`, so the headers are present on error responses too — which is
exactly where clickjacking and sniffing protection still matter.

### Content Security Policy

```
default-src 'self'; base-uri 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
object-src 'none'; frame-src 'none'; frame-ancestors 'none';
form-action 'self'; manifest-src 'self'; worker-src 'self' blob:;
upgrade-insecure-requests
```

`script-src` includes `'unsafe-inline'`. This is a measured decision with verification behind it —
see [ADR-010](./adr/ADR-010-csp-unsafe-inline.md). The compensating control that matters most is
`connect-src 'self'`: an injected script cannot exfiltrate to an external host.

**No external origin appears anywhere in the policy.** No analytics, no CDN, no font host.

## 4. Authentication and authorisation

| Surface | Control |
| --- | --- |
| Public pages | None required |
| Public API | None; rate limited |
| Admin API | Bearer token, `secrets.compare_digest` |
| CMS | Strapi roles; admin panel IP-restricted |
| Future portal | Keycloak / OIDC (specification §18) |

**A missing admin key disables the admin API rather than opening it.** With no `ADMIN_API_KEY`,
`/api/v1/admin/*` returns 404. This inversion is deliberate: a missing secret must never mean "no
authentication required".

Four independent controls sit between the internet and the admin API: Nginx returns 404 on the
public host; the Next.js proxy allow-list excludes the path; the route requires a bearer token;
and the token is absent by default.

## 5. Input validation

Every endpoint validates with Pydantic, `extra="forbid"`, so an unknown field is rejected rather
than ignored. Client-side Zod schemas mirror them and are treated purely as a UX affordance.

Specific hardening worth naming:

- **Single-line fields reject CR, LF, U+2028 and U+2029.** `name` and `organization` reach an email
  Subject and Reply-To display name, where an embedded newline is header injection. The email layer
  sanitises headers independently, so neither check is a single point of failure.
- **`attachment_url` accepts only `/uploads/...`.** An arbitrary URL would be an SSRF vector and a
  way to place a hostile link in a staff inbox.
- **Link-heavy message bodies are rejected** as spam before a human reads them.
- **Admin search escapes `%`, `_` and `\`**, so a literal `%` cannot behave as a wildcard.

## 6. Uploads

Applied in order: uploads enabled → declared type on the allow-list → extension not blocked →
**magic-number check against the declared type** → size enforced while streaming → filename
generated, never derived from client input.

A renamed executable declaring `image/png` is rejected at the magic-number check and nothing is
written to disk. Tested.

## 7. Secrets

| Rule | Enforcement |
| --- | --- |
| Never in Git | `.gitignore`, `npm run audit:secrets`, gitleaks in CI |
| Never in the browser bundle | `lib/env.ts` client/server split; `getServerEnv()` throws in a browser; `lib/cms` imports `server-only` |
| Never in logs | structlog redaction processor, applied globally |
| Never in error responses | Generic messages; detail keyed by request id in the log |
| Strong in production | Startup fails on a short `SECRET_KEY`, `DEBUG=true`, wildcard CORS, or default database credentials |

## 8. Data protection

- **IP addresses stored as HMAC-SHA256**, keyed by `SECRET_KEY`. The raw address is never written.
- **Audit trail** on lead creation, status change, note addition and *viewing* — access to personal
  data is itself auditable (specification §18).
- **`internal_notes` never leaves the admin API.**
- **Backups verified at creation** and restorable into a scratch database on demand.

## 9. Network

**Stale — describes the removed Docker topology.** Docker, the Nginx reverse proxy and the
monitoring stack have been removed from the project and not yet replaced (see
[ADR-005](./adr/ADR-005-docker-compose.md)). The requirements below still hold and must be
re-established by whatever replaces them:

- PostgreSQL must have **no public port mapping**
- The database must have no route to the internet
- Only the reverse proxy should publish ports (80, 443)
- Any monitoring service must bind to `127.0.0.1` only

## 10. Verification

| Check | Command | Gate |
| --- | --- | --- |
| Committed secrets | `npm run audit:secrets` | CI, blocking |
| Full-history secrets | gitleaks | CI, blocking |
| npm advisories | `npm audit --audit-level=high` | CI, blocking |
| Python advisories | `pip-audit --strict` | CI, blocking |
| Licence compliance | `node scripts/generate-license-inventory.mjs --check` | CI |
| Security headers | Asserted in the pytest suite | CI |
| Auth and upload controls | 55 backend tests | CI |
| Accessibility | axe-core over 35 routes | `npm run audit:pages` |

Current state: **0 npm vulnerabilities, 0 committed secrets, lint and type checks clean.**
