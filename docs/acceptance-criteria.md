# Acceptance Criteria

Specification §30, tracked verbatim with current status and the evidence behind each.

**Legend:** ✅ met and verified · ⚠️ met in code, not verifiable in this environment ·
⬜ blocked on information or a production environment

| # | Criterion | Status | Evidence |
| --- | --- | :---: | --- |
| 1 | All primary routes work on desktop and mobile | ✅ | 60 Playwright tests across desktop (1440) and mobile (Pixel 7); 116 routes prerender |
| 2 | Homepage communicates the four core pillars clearly | ✅ | Pillar strip in the hero plus a dedicated "What we do" section; positioning lines verbatim from catalogue §1, asserted by a content test |
| 3 | Every published service has approved content and a CTA | ✅ | 35 services, each with capabilities and use cases from the catalogue and a context-carrying CTA |
| 4 | CMS-backed content updatable without frontend code changes | ⚠️ | 11 Strapi content types and a seed script exist; **Strapi has not been started in this environment** |
| 5 | Contact submissions validated, rate-limited and recorded | ✅ | 55 backend tests; verified end to end against real PostgreSQL 16.4 |
| 6 | No secrets exposed in browser bundles or Git | ✅ | `npm run audit:secrets` clean; `lib/env.ts` client/server split; `server-only` on the CMS layer; gitleaks in CI |
| 7 | HTTPS enforced | ⚠️ | Nginx 301 redirect and HSTS configured; **not exercised — no TLS termination in this environment** |
| 8 | Production deployment reproducible with documented Docker configuration | ⚠️ | Dockerfiles, compose files and deployment docs written; **Docker is not installed here, so no image has been built** |
| 9 | Backups configured and restoration tested | ⬜ | Scripts written with a `--verify` mode; **no restore has been performed.** Blocking for launch |
| 10 | Critical APIs have automated tests | ✅ | 55 pytest tests covering contact, admin, newsletter, uploads, health, security headers |
| 11 | Keyboard and accessibility blockers resolved | ✅ | axe-core over 35 routes × 3 viewports: 31 violations found, all fixed; Radix primitives for focus management |
| 12 | SEO metadata exists on indexable pages | ✅ | Unique title and description per page, canonicals, sitemap, robots, JSON-LD; asserted by content tests |
| 13 | Images optimised and meaningful images have alt text | ✅ | AVIF/WebP via `next/image`; brand artwork derived as WebP and transparent PNG by `scripts/derive-brand-assets.mjs`, kept current by `npm run brand:check`; axe reports no missing alt text |
| 14 | Public claims comply with approved company information | ✅ | 42 content tests enforce specification §31 and catalogue §16 — **verified by injecting violations and confirming they fail** |
| 15 | Health checks and logging available | ✅ | Three health endpoints; structured JSON logs with global credential redaction |
| 16 | Dependency versions and licences recorded | ✅ | 485 npm + 60 Python packages inventoried at resolved versions; CI gate on unrecognised licences |
| 17 | Deployment and rollback documentation exists | ✅ | `docs/architecture/deployment.md`, `docs/deployment/rollback.md`, `runbook.md` |

**Met and verified: 12 of 17.**

---

## The five that are not ticked

### ⚠️ Verifiable only in a deployed environment

Docker Engine is not installed on this workstation, so three criteria are implemented but unproven:

- **#4 CMS** — schemas and seed script are written; Strapi has never been started
- **#7 HTTPS** — Nginx configuration is complete; no certificate has been issued
- **#8 Docker** — Dockerfiles and compose files are written; no image has been built

These are stated as unverified rather than assumed to work. First deployment should treat them as
the first things to check — see the smoke tests in
[`deployment.md §4`](./architecture/deployment.md).

### ⬜ #9 Backups — genuinely blocking

Instruction §50 is explicit: *"Do not claim backups are reliable until a restore procedure has
actually been tested."*

The scripts exist, including a `--verify` mode that restores into a scratch database. **No restore
has been run.** The log in
[`backup-and-restore.md §7`](./deployment/backup-and-restore.md) is empty, and should stay empty
until someone runs it for real.

---

## Also outstanding — content, not engineering

12 registered placeholders remain, tracked in
[`dummy-data/registry.md`](./dummy-data/registry.md). Blocking for public launch:

- **DD-004** verified phone number and registered office address (email confirmed)
- **DD-005** registered legal entity
- **DD-006** counsel-reviewed legal pages
- **DD-010** NEVIX social profile URLs (the current links still point to the former-name profiles)

Full gate: [`dummy-data/replacement-checklist.md`](./dummy-data/replacement-checklist.md).

---

## Quality gate (instruction §79)

| Item | Status |
| --- | :---: |
| Frontend builds | ✅ 116 routes |
| Backend runs | ✅ verified against PostgreSQL 16.4 |
| Database works | ✅ migrations up/down/up, no model drift |
| CMS works | ⚠️ not started in this environment |
| Contact form works | ✅ end to end |
| Content routing works | ✅ 60 E2E tests |
| Responsive layouts work | ✅ no overflow at 390/834/1440 |
| Mobile navigation works | ✅ E2E on Pixel 7 |
| SEO metadata exists | ✅ |
| Sitemap works | ✅ excludes `noIndex` content |
| Robots works | ✅ disallows all outside production |
| 404 works | ✅ with navigation intact |
| Error handling works | ✅ no stack traces reach a visitor |
| Accessibility checks pass | ✅ 0 axe violations |
| Lint passes | ✅ |
| TypeScript passes | ✅ strict |
| Tests pass | ✅ 55 + 42 + 60 |
| Docker builds | ⚠️ not runnable here |
| Docker Compose starts | ⚠️ not runnable here |
| Nginx configuration works | ⚠️ not runnable here |
| Environment variables documented | ✅ |
| No secrets committed | ✅ |
| Dummy-data registry complete | ✅ audited in CI |
| Licence inventory complete | ✅ |
| Deployment documentation complete | ✅ |
| Rollback documentation exists | ✅ |
| Backup strategy documented | ✅ (restore untested — see #9) |
| Security review completed | ✅ threat model written |
| Repository structure documented | ✅ |
