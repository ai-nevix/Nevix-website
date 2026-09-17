# Threat Model

> Specification §22 (security architecture), instruction §74 (threat model), §32 (security
> controls).
>
> Reviewed: 2026-09-17. Re-review before any production launch and after any change to
> authentication, uploads, or the Content Security Policy.

## 1. What is being protected

| Asset | Sensitivity | Where it lives |
| --- | --- | --- |
| Enquiry records (name, email, organisation, requirement) | Personal data | `leads` table |
| Uploaded attachments | Potentially commercially sensitive | API volume / MinIO |
| Newsletter subscribers | Personal data | `newsletter_subscribers` |
| Admin API key | Credential | Environment only |
| Database credentials | Credential | Environment only |
| CMS write access | Content integrity | Strapi tokens |
| Published content | Reputational — see §7 | CMS / `content/` |

## 2. Trust boundaries

```
  UNTRUSTED                     │ SEMI-TRUSTED        │ TRUSTED
  ──────────────────────────────┼─────────────────────┼──────────────────────
  Visitor browser               │ Nginx               │ internal network
  Form input, uploads, headers  │ Next.js SSR         │ PostgreSQL
  Search queries                │ Next.js API proxy   │ Redis / MinIO
                                │ FastAPI             │ Prometheus / Loki
                                │ Strapi              │
```

Everything crossing left-to-right is validated. The `internal` Docker network is declared
`internal: true`, so it has **no route to the internet** — an exploited dependency in the data
tier cannot exfiltrate directly.

## 3. Threats and mitigations

### 3.1 Cross-site scripting (XSS)

| Vector | Mitigation |
| --- | --- |
| Enquiry text echoed back | React escapes all interpolated content. The enquiry is never rendered in a public page. |
| CMS article body | `components/sections/markdown.tsx` emits **React elements, never HTML**. A `<script>` in an article body renders as literal characters. This matters once the CMS is writable by non-engineers. |
| JSON-LD injection | `components/seo/json-ld.tsx` escapes `<` before serialising — the standard inline-JSON-LD escape. |
| Notification email rendered in a webmail client | `email_templates.py` HTML-escapes every interpolated value. An enquiry body is attacker-controlled text arriving in a staff inbox. |
| Third-party script compromise | No third-party scripts exist ([ADR-009](../architecture/adr/ADR-009-no-analytics.md)). |

**Residual risk.** `script-src` includes `'unsafe-inline'` — unavoidable with prerendered Next.js;
see [ADR-010](../architecture/adr/ADR-010-csp-unsafe-inline.md) for the verification and the
compensating controls. The key one: `connect-src 'self'` means an injected script **cannot
exfiltrate to an external host**.

### 3.2 Cross-site request forgery (CSRF)

Not applicable to the public endpoints: they are unauthenticated, hold no session, and the API
client sends `credentials: 'omit'`. The proxy deliberately does not forward cookies or the
`Authorization` header to the backend.

The admin API uses a bearer token, not a cookie, so a cross-site request cannot carry credentials
implicitly. `form-action 'self'` blocks form-post hijacking.

### 3.3 SQL injection

Every query goes through SQLAlchemy with bound parameters; no string-built SQL exists. The admin
search escapes `%`, `_` and `\` explicitly, so a literal `%` cannot behave as a wildcard and return
every record — with a test asserting it.

### 3.4 Authentication and authorisation bypass

| Threat | Mitigation |
| --- | --- |
| Guessing the admin key | 48 bytes of CSPRNG output; compared with `secrets.compare_digest` so timing reveals nothing |
| Missing key means open access | **Inverted:** no `ADMIN_API_KEY` ⇒ admin routes return **404**. A missing secret must never mean "no authentication required". |
| Reaching admin endpoints from a browser | The Next.js proxy forwards an **allow-list of public paths only**. `/api/v1/admin/*` is not on it. |
| Reaching admin endpoints from the internet | Nginx returns 404 for `/api/v1/admin` on the public host |
| Privilege escalation via the update endpoint | Only `status` and `internal_notes` are mutable; `extra="forbid"` rejects anything else, with a test |
| Undetected access to personal data | Viewing a lead writes a `VIEWED` audit event (specification §18) |

**Defence in depth:** four independent controls stand between the internet and the admin API.

### 3.5 File upload abuse

| Threat | Mitigation |
| --- | --- |
| Executable disguised as an image | **Magic-number verification** against the declared type. A renamed executable declaring `image/png` is rejected and nothing is written. Tested. |
| Path traversal via filename | The stored filename is **generated**; client input is never a path component. Tested with `../../../../etc/passwd.png`. |
| Oversized upload | Enforced while streaming, not from `Content-Length`. Nginx caps at 12 MB, the app at 10 MB. Tested. |
| Stored XSS via SVG or HTML | Both on the blocked-extension list and absent from the MIME allow-list |
| Arbitrary URL in `attachment_url` | The schema accepts only `/uploads/...` — an external URL would be an SSRF vector and a way to place a hostile link in a staff inbox. Tested. |
| Filling the disk | Rate limit of 10/hour per IP; disk-space alerting at 15% and 5% |

### 3.6 Rate-limit bypass and abuse

- Two layers: Nginx (10/min on forms) and FastAPI (5/hour per IP on contact)
- Client IP taken from `X-Forwarded-For` **only because** the service is never exposed directly —
  Nginx rewrites the header and the container network does not route to the API from outside. This
  assumption is recorded in `app/core/security.py`; **if the topology changes, revisit it**, because
  a spoofable client IP defeats rate limiting entirely.
- Honeypot field plus a minimum time-on-form check
- A per-IP daily threshold in the service layer catches submissions slow enough to stay under the
  request limiter
- Spam is flagged, not rejected — see `backend.md` §6 for why

**Known limitation:** in-memory counters. With more than one API replica the effective limit
multiplies by the replica count. The Redis trigger is documented in
[ADR-008](../architecture/adr/ADR-008-deferred-infrastructure.md).

### 3.7 Credential leakage

| Threat | Mitigation |
| --- | --- |
| Secrets in Git | `.gitignore`, `npm run audit:secrets` in CI, gitleaks over full history |
| Secrets in the browser bundle | `lib/env.ts` splits client and server config; `getServerEnv()` throws if called in a browser; `lib/cms` imports `server-only` so a client import is a build error |
| Secrets in logs | A structlog processor redacts credential-shaped keys **wherever in the codebase they were added** — not left to discipline at each call site |
| Secrets in error responses | Generic messages only; detail goes to the log under a request id |
| Weak secrets in production | Startup fails if `SECRET_KEY` is short, `DEBUG=true`, or the database URL still holds development credentials |

### 3.8 Server-side request forgery (SSRF)

The only user-supplied value that could become a URL is `attachment_url`, constrained to
`/uploads/...`. The CMS URL comes from configuration, never from a request. `next/image` remote
patterns are built from configured hosts, never wildcarded.

### 3.9 Denial of service

Nginx: connection limits per IP, request-size caps, and client header/body timeouts that drop
slowloris-style connections. Upstream timeouts prevent a slow backend exhausting worker
connections. Database pool bounded. Search queries capped at 120 characters and 50 results. Admin
pagination capped at 100 so an authenticated caller cannot request the whole table.

**Not mitigated:** volumetric network-layer DDoS. That requires upstream capacity and is out of
scope for a single host — noted rather than implied to be covered.

### 3.10 Dependency vulnerabilities

`npm audit --audit-level=high` and `pip-audit --strict` both block the pipeline. Version-pinned
lockfiles. During this build, npm flagged a critical advisory in the initially selected Next.js
version; it was upgraded before anything else was written. Current state: **0 vulnerabilities**.

### 3.11 Misconfigured CORS

`cors_origins` rejects `*` in a validator — the application will not start with it. The default is
empty, because the website calls through a same-origin proxy and needs no cross-origin access.

### 3.12 Exposed admin interfaces and monitoring

| Surface | Control |
| --- | --- |
| FastAPI `/docs`, `/redoc`, `/openapi.json` | Disabled in production by the app, and 404'd by Nginx |
| `/metrics` | Not proxied publicly; scraped over the internal network |
| Prometheus, Grafana, Loki, GlitchTip | Bound to `127.0.0.1` — an SSH tunnel or VPN is required, not merely a password |
| Strapi `/admin` | Commented IP allow-list in the Nginx config; **apply before public exposure** |
| PostgreSQL | No published port at all |

### 3.13 Container and host

Non-root users in every application image. Multi-stage builds so no compiler or dev dependency
reaches the runtime image. Pinned base image tags. Health checks with restart policies. `.dockerignore`
excludes `.env` and tests.

## 4. Accepted risks

Recorded explicitly rather than left implicit:

| Risk | Why accepted | Revisit when |
| --- | --- | --- |
| `script-src 'unsafe-inline'` | Incompatible with prerendering; exfiltration blocked by `connect-src` ([ADR-010](../architecture/adr/ADR-010-csp-unsafe-inline.md)) | Next.js supports build-time nonces, or any user-supplied HTML is rendered |
| Single host — no HA | Specification §20.1; mitigated by tested restore and rehearsed rollback | An availability target a single host cannot meet |
| In-memory rate limits | One API replica today | A second replica is added |
| App and CMS share a database instance | Operationally simpler at this scale | CMS load affects application latency |
| No WAF | Application-layer validation and rate limiting in place | Sustained targeted attack traffic |
| No volumetric DDoS protection | Out of scope for a single host | Traffic profile changes |

## 5. Pre-launch security checklist

- [ ] All secrets generated with `scripts/generate-secrets.sh`, none reused between environments
- [ ] `ADMIN_API_KEY` set (or deliberately absent to keep the admin API disabled)
- [ ] `DEBUG=false`, `APP_ENV=production`
- [ ] `CORS_ORIGINS` empty or an exact list
- [ ] TLS issued; HTTPS redirect and HSTS verified
- [ ] Strapi `/admin` IP-restricted or behind a VPN
- [ ] Monitoring ports confirmed unreachable from the internet
- [ ] `npm run audit:secrets` and gitleaks clean
- [ ] `npm audit` and `pip-audit` clean
- [ ] **A restore has actually been performed** — not assumed
- [ ] Rollback rehearsed at least once
- [ ] Security headers verified on a live response, including on an error response

## 6. Incident response

1. **Contain** — `docker compose stop <service>`; the reverse proxy can serve a maintenance page.
2. **Preserve** — snapshot logs and database *before* remediating. `docker compose logs --since` and
   a `pg_dump`.
3. **Assess** — request ids in the logs correlate an event across Nginx, Next.js and FastAPI.
4. **Remediate** — patch, rotate, redeploy. Rotating `SECRET_KEY` invalidates existing `ip_hash`
   correlation; rotating `POSTGRES_PASSWORD` requires a database-side change too.
5. **Recover** — restore from backup if data integrity is in doubt; `scripts/restore-database.sh`
   takes a safety dump first.
6. **Review** — record what happened and what changed as a result.

Runbook: [`../deployment/runbook.md`](../deployment/runbook.md).
