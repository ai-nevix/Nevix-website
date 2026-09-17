# CMS

Self-hosted Strapi Community Edition 5.

> Specification §15 (CMS), §16 (content entities), instruction §29.
> See [ADR-004](./adr/ADR-004-strapi-cms.md) and
> [ADR-006](./adr/ADR-006-content-provider-abstraction.md).

## 1. Role

Strapi owns marketing content so that publishing an insight or correcting service copy needs
neither a code change nor a deployment (specification §3).

It does **not** own application data. Leads, contact events and newsletter subscribers belong to
the API.

## 2. Content model

Eleven content types, generated from the specification's data model by
`apps/cms/scripts/generate-content-types.py`.

```
Service Category ──1:N──► Service ──M:N──► Solution ──M:N──► Industry
                                │                              ▲
                                ├──M:N──► Case Study ──N:1─────┘
                                └──M:N──► Product

Author ──1:N──► Insight ──N:1──► Insight Category

FAQ                      (standalone, reusable)
Site Settings            (single type)
```

Six shared components: `seo`, `faq-item`, `step`, `list-item`, `outcome`, `social-link`.

Two fields are governance controls rather than presentation:

- **`case-study.kind`** — `demo` renders the "Demo Case Study" banner everywhere the study appears
  and sets `noIndex`. Promoting to `approved` is a deliberate editorial act requiring permission
  and evidence (catalogue §16, specification §31).
- **`product.isPlaceholder`** — keeps a concept out of the sitemap and out of search results.

The `outcome` component has an `evidence` field. It is optional in the schema and required by
process: a case study cannot be marked `approved` with an outcome that has no evidence, and the
content test suite asserts this.

## 3. Roles

| Role | Permissions |
| --- | --- |
| Administrator | Full configuration and user management |
| Editor | Create, edit and publish |
| Author | Create drafts, edit own content |
| Public | `find` / `findOne` on published content only |

## 4. API tokens

**The website's token must be read-only.**

Create it in the admin under *Settings → API Tokens* with **Read-only** access, and set it as
`CMS_API_TOKEN`. A full-access token in the frontend environment would let a frontend bug — or
anyone who can read the environment — modify published content.

The seed script uses a **separate write token** which is meant to be revoked immediately after
seeding. This is in the checklist below because "temporary" tokens are the ones that survive
longest.

## 5. Going live with Strapi

The site ships with `CONTENT_PROVIDER=local`, serving the typed content in `apps/web/content`.
Switching to Strapi:

```bash
# 1. Start the CMS
docker compose up -d cms

# 2. Create the first admin user at https://cms.vastrix.ai/admin

# 3. Create a FULL-ACCESS token, used once for seeding

# 4. Seed from the committed content — idempotent, matches on slug
cd apps/cms
STRAPI_URL=https://cms.vastrix.ai STRAPI_ADMIN_TOKEN=<write-token> npm run seed

# 5. Review and publish the entries (they are created as drafts)

# 6. Grant find/findOne to the Public role, or issue a READ-ONLY token

# 7. Point the website at the CMS
#    CONTENT_PROVIDER=strapi
#    CMS_URL=https://cms.vastrix.ai
#    CMS_API_TOKEN=<read-only-token>
docker compose up -d --build web

# 8. REVOKE the write token from step 3
```

Step 8 is not optional.

## 6. Frontend integration

All reads go through `apps/web/lib/cms`, never from a component (specification §30). The provider
interface has two implementations and components cannot tell which is active, which is what makes
the switch above a configuration change rather than a refactor.

Strapi's `{ data, attributes }` envelope is flattened inside the provider, so its response shape
never leaks into the application. Both v4 (nested `attributes`) and v5 (flattened) shapes are
handled.

**Failure behaviour.** A CMS request that fails raises `ContentUnavailableError`, which renders an
explicit "content temporarily unavailable" state — not an empty page that looks intentional.
`STRAPI_FALLBACK_TO_LOCAL=true` degrades to local content instead, and is **off by default**:
silently serving different content than the CMS holds is a worse failure than an honest error,
because nobody notices it.

Requests carry an 8-second timeout and ISR caching tagged `cms`.

## 7. Security

- Admin panel is a privileged interface. The Nginx configuration carries a commented IP allow-list
  for `/admin`; apply it, or restrict at the firewall, before exposing the CMS publicly.
- Secrets from the environment; Strapi refuses to start without `APP_KEYS`.
- Its own database (`vastrix_cms`) on the shared PostgreSQL instance.
- CORS defaults to empty — the website reads server-side, so no browser origin needs access.
- CSP, HSTS and frameguard set by Strapi's security middleware as well as by Nginx.
- Media uploads capped at 64 MB.

## 8. Backups

The CMS database and `public/uploads` are both covered by `scripts/backup-database.sh`. Content
without its media is an incomplete restore, which is why the uploads archive is part of the same
job.
