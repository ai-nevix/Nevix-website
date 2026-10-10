# API Reference

Base URL: `https://api.nevix.ai/api/v1`
Interactive docs: `http://localhost:8000/docs` in development (disabled in production).

> Specification §17. Schemas are generated from the Pydantic models in `apps/api/app/schemas`, so
> the OpenAPI document cannot drift from the implementation.

## Conventions

**Versioning.** Every endpoint is under `/api/v1/`. A breaking change means `/v2`, not a silent
alteration.

**Errors.** Every failure returns the same envelope:

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

`details` is keyed by field name so a form can highlight the right input. `request_id` is also
returned as `X-Request-ID` on every response and appears in the server logs — quote it in a support
conversation.

**Rate limiting.** Per client IP. A 429 includes `Retry-After`.

**How the website calls this.** Through a same-origin proxy at `/api/backend/*`, which forwards an
allow-list of public paths only. Administrative endpoints are not on that list and are therefore
not reachable from a browser at all.

---

## Public endpoints

### `GET /health`

Process and dependency health. Returns 503 when degraded, so a load balancer can act on the status
code without parsing the body.

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "database": { "status": "ok" },
    "email": { "status": "ok", "detail": "configured" },
    "uploads": { "status": "ok", "detail": "enabled" }
  }
}
```

No response ever contains a connection string, a credential or an exception message — asserted by a
test.

### `GET /health/live` · `GET /health/ready`

Liveness deliberately touches no dependency; readiness checks the database. See
[backend.md §4](../architecture/backend.md) for why that distinction matters.

---

### `POST /contact`

Submit a project enquiry. **Rate limit: 5/hour per IP.**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.org",
  "organization": "Example Organisation",
  "service_interest": "Automation",
  "industry": "Manufacturing",
  "requirement": "We process about two thousand supplier invoices a month by hand.",
  "timeline": "3-6 months",
  "budget": "$50k - $150k",
  "attachment_url": "/uploads/abc123.pdf",
  "consent": true,
  "source": "/services/automation"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | 2–120 chars. Newlines rejected — header-injection vector |
| `email` | yes | Validated |
| `organization` | no | ≤160 chars |
| `service_interest` | yes | One of the six categories, or `Not sure yet` |
| `industry` | no | One of seven values |
| `requirement` | yes | 20–5000 chars; link-heavy bodies rejected as spam |
| `timeline`, `budget` | no | Enumerated |
| `attachment_url` | no | **Must be `/uploads/...`** from `POST /uploads` |
| `consent` | yes | Must be `true` |
| `website` | no | Honeypot. Must be empty |

**201 Created**

```json
{
  "id": "0193e4a7-...",
  "reference": "VX-A7K2M9",
  "message": "Thank you — your enquiry has been received. Your reference is VX-A7K2M9.",
  "notification_sent": true
}
```

`notification_sent` is honest: `false` when SMTP is unconfigured or unreachable. The enquiry is
recorded either way — losing a lead because a mail server was down would be the worse failure.

A submission that trips the honeypot or the per-IP threshold also returns 201. It is stored flagged
as spam rather than rejected; see [backend.md §6](../architecture/backend.md) for the reasoning.

**422** — validation failed, with per-field `details`.
**429** — rate limited.

### `POST /leads`

Alias of `/contact`, listed in specification §17. Shares one implementation so the two cannot
diverge.

---

### `POST /newsletter`

Begin double opt-in. **Rate limit: 5/hour per IP.**

```json
{ "email": "reader@example.org", "consent": true, "source": "footer" }
```

**202 Accepted** — the subscription is not active until the recipient follows the confirmation
link.

The response is **identical** for a new and an existing address, so this endpoint cannot be used to
test whether a given address is subscribed.

### `POST /newsletter/confirm`

```json
{ "token": "<from the confirmation email>" }
```

Tokens are single-use: confirming clears the token, so the link cannot be replayed.

---

### `POST /uploads`

Multipart upload of an enquiry attachment. **Rate limit: 10/hour per IP. Max 10 MB.**

Accepted: PDF, Word, Excel, CSV, plain text, PNG, JPEG.

**201 Created**

```json
{
  "url": "/uploads/x7Kq2M9pR4tY.pdf",
  "filename": "requirements.pdf",
  "content_type": "application/pdf",
  "size_bytes": 248193
}
```

Pass `url` as `attachment_url` on `POST /contact`. The stored filename is generated; `filename` is
the sanitised original, shown to a reviewer only.

**400** — content does not match the declared type (magic-number check)
**413** — too large
**415** — type not accepted

---

### `GET /site-config`

Public configuration and feature flags. Only an explicit list of keys is returned — the settings
table is never dumped wholesale, so adding an internal setting cannot accidentally publish it.

### `GET /search?q=<query>&limit=<n>`

Searches approved public content. **Rate limit: 60/min.** `q` is 2–120 characters; `limit` caps at
50.

The website performs its own in-process search over CMS content, which is faster and always in
sync. This endpoint exists so non-browser clients — and, later, the NEVIX AI assistant retrieving
approved public knowledge — have the same view through a stable contract. It currently returns an
empty result set rather than a partial one; returning half the corpus and calling it a search
result would be worse than returning nothing.

---

## Administrative endpoints

**Not reachable from a browser.** Nginx returns 404 for `/api/v1/admin` on the public host, and the
website's proxy allow-list excludes the path. Access is from the internal network or over a VPN.

**Authentication:** `Authorization: Bearer <ADMIN_API_KEY>`.

**With no `ADMIN_API_KEY` configured, these endpoints return 404 — not "open".**

### `GET /admin/leads`

| Query | Default | Notes |
| --- | --- | --- |
| `page` | 1 | |
| `page_size` | 25 | **Capped at 100** so one call cannot request the whole table |
| `status` | — | `new`, `reviewing`, `qualified`, `contacted`, `closed`, `spam` |
| `search` | — | Name, email, organisation or reference. Wildcards escaped |

Responses exclude `ip_hash` and `user_agent`: they exist for abuse correlation, not routine
display.

### `GET /admin/leads/{id}`

Retrieves one lead **and records a `VIEWED` audit event**. Access to personal data is itself
auditable (specification §18).

### `PATCH /admin/leads/{id}`

```json
{ "status": "qualified", "internal_notes": "Discovery call booked." }
```

Only these two fields are mutable. The submitted content of an enquiry is a record of what the
enquirer actually wrote and is deliberately immutable — any other field returns 422.

A status change writes a `STATUS_CHANGED` audit event with the old and new values.

---

## Status codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 202 | Accepted — pending confirmation |
| 400 | Malformed request |
| 401 | Missing or invalid credentials |
| 404 | Not found, or the endpoint is disabled |
| 413 | Payload too large |
| 415 | Unsupported media type |
| 422 | Validation failed — see `details` |
| 429 | Rate limited — see `Retry-After` |
| 500 | Internal error — quote `request_id` |
| 502 | Backend unreachable through the proxy |
| 503 | Degraded — a dependency is down |
