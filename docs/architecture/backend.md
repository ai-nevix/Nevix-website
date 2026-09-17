# Backend Architecture

`apps/api` — FastAPI, Pydantic v2, SQLAlchemy 2 (async), Alembic, PostgreSQL.

> Specification §14 (backend engineering), §17 (API), §18 (auth), §22 (security).

## 1. Scope

The backend owns **application data only**: leads, contact events, newsletter subscribers,
uploads and public site configuration. Marketing content belongs to the CMS and is deliberately
not duplicated here (specification §16).

## 2. Layering

```
app/api/v1/*.py       routes        — HTTP only: parse, delegate, shape the response
app/services/*.py     business logic — decides what happens
app/repositories/*.py data access    — every query lives here
app/models/*.py       ORM            — table definitions
app/schemas/*.py      wire contract  — Pydantic request/response models
app/core/*.py         config, logging, security primitives
```

The rule from specification §14 is enforced, not aspirational: **no route handler contains a
query, and no repository contains a business decision.** A route reads a request, calls a service,
and returns a schema. That is what makes the logic testable without HTTP and what keeps the spam
rules, the audit-event writes and the notification policy in one readable place.

## 3. Endpoints

| Method | Path | Auth | Rate limit |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | public | default |
| GET | `/api/v1/health/live` | public | — |
| GET | `/api/v1/health/ready` | public | — |
| POST | `/api/v1/contact` | public | 5/hour per IP |
| POST | `/api/v1/leads` | public | 5/hour per IP |
| POST | `/api/v1/newsletter` | public | 5/hour per IP |
| POST | `/api/v1/newsletter/confirm` | public | 5/hour per IP |
| POST | `/api/v1/uploads` | public | 10/hour per IP |
| GET | `/api/v1/site-config` | public | default |
| GET | `/api/v1/search` | public | 60/min |
| GET | `/api/v1/admin/leads` | **admin** | default |
| GET | `/api/v1/admin/leads/{id}` | **admin** | default |
| PATCH | `/api/v1/admin/leads/{id}` | **admin** | default |

`/leads` is an alias of `/contact` because specification §17 lists both; they share one
implementation so they cannot diverge.

## 4. Health checks, and why there are three

- **`/health`** — full check, including the database. Returns 503 when degraded, so a load
  balancer can act on the status code without parsing the body.
- **`/health/live`** — liveness. Deliberately touches **no** dependency. A liveness probe that
  checks the database will restart a perfectly healthy process during a database outage, turning a
  recoverable incident into a restart loop.
- **`/health/ready`** — readiness. Checks the database, because a process that cannot reach it
  should not receive traffic.

No response contains a connection string, a credential or an exception message; a test asserts
this.

## 5. Error envelope

Every failure returns the same shape (specification §14):

```json
{
  "error": {
    "code": "validation_error",
    "message": "Some of the details provided were not valid.",
    "details": { "email": ["Enter a valid email address"] },
    "request_id": "a1b2c3d4e5f6g7h8"
  }
}
```

`details` is keyed by field name so the contact form can highlight the right input.
`request_id` is returned on every response as `X-Request-ID` and appears in the logs, so a user
report maps to a log entry without exposing anything about the failure.

Handlers are registered for `RequestValidationError`, `RateLimitExceeded`, `HTTPException` and a
catch-all `Exception`. The catch-all logs the traceback and returns a generic message — a stack
trace never reaches a visitor (instruction §52).

## 6. Security

| Control | Implementation |
| --- | --- |
| Input validation | Pydantic on every endpoint, `extra="forbid"` so unknown fields are rejected |
| Rate limiting | slowapi, per client IP; Redis-backed when the cache profile is enabled |
| Admin auth | Bearer token, `secrets.compare_digest` so a wrong key cannot be found by timing |
| **Admin disabled by default** | No `ADMIN_API_KEY` means the admin routes return **404**, not "open" |
| IP handling | Stored as an HMAC-SHA256 hash keyed by `SECRET_KEY`; the raw address is never persisted |
| Upload validation | Magic-number check against the declared type; generated filename; streamed size limit |
| Header injection | Single-line fields reject CR, LF, U+2028 and U+2029 at the schema boundary, and the email layer sanitises headers independently |
| Log redaction | A structlog processor strips any credential-shaped key, wherever in the codebase it was added |
| CORS | Never `*` — the application refuses to start with a wildcard |
| Production hardening | Startup fails if `DEBUG=true`, `SECRET_KEY` is short, or the database URL still holds the development credentials |

### Spam handling, and why it is silent

A submission that trips the honeypot or the per-IP threshold is stored with `status=SPAM` and the
caller receives an **ordinary success response**.

Two reasons. Telling an automated submitter it was detected only helps it adapt. And if the
detection is wrong, a rejected submission would have discarded a real enquiry with no record —
this way the lead is still in the database and can be reclassified.

### Uploads

Controls applied in order: uploads enabled → declared type on the allow-list → extension not
blocked → **leading bytes match the declared type** → size enforced while streaming, not from the
`Content-Length` header → filename generated, never derived from client input.

A renamed executable declaring `image/png` is rejected at the magic-number check and nothing is
left on disk. There is a test for exactly that.

## 7. Email

Best-effort by design. If SMTP is unconfigured or unreachable, the enquiry is still recorded and
the visitor still gets a confirmation — the response reports `notification_sent: false` honestly,
and the attempt is written as a contact event.

Losing a lead because a mail server was down would be the worse failure.

## 8. Observability

- **Structured JSON logs** with timestamp, service, level, request id, method, path, status and
  latency
- **Never logged:** passwords, tokens, API keys, database URLs, or the enquiry body. Enforced by a
  redaction processor rather than by discipline at each call site
- **Prometheus metrics** at `/metrics` — bound on the app, blocked by Nginx on the public host,
  scraped over the internal network only
- **Audit events** on lead creation, status change, note addition and *viewing* — access to
  personal data is itself auditable (specification §18)

## 9. Database

See [`database.md`](./database.md). Four tables, UUID primary keys, Alembic migrations applied by
the container entrypoint before the server starts.

## 10. Testing

**55 tests** covering contact submission and validation, spam handling, admin authentication and
authorisation, audit events, health endpoints, newsletter double opt-in, uploads (including
magic-number rejection, oversize and path traversal), search, and security headers.

The suite runs on SQLite for speed. That is only sound because the models avoid PostgreSQL-only
constructs, so CI additionally runs the migration history up, down and up again against real
PostgreSQL, plus `alembic check` for model drift.

All flows were also verified manually against a real PostgreSQL 16.4 instance during the build.
