# Infrastructure & Container Licence Inventory

> Specification §11, instruction §5. Maintained by hand — container images are not resolved by a
> lockfile, so this is reviewed when an image tag changes.
>
> Last reviewed: 2026-09-17.

## Container images

| Component | Image | Version | Licence | Commercial use |
| --- | --- | --- | --- | --- |
| Website runtime | `node` | 24-alpine | MIT (Node.js) | Permitted |
| API runtime | `python` | 3.12-slim-bookworm | PSF-2.0 | Permitted |
| CMS runtime | `node` | 22-alpine | MIT | Permitted |
| Database | `pgvector/pgvector` | pg16 | PostgreSQL Licence (BSD-style) | Permitted |
| Reverse proxy | `nginx` | 1.29-alpine | 2-clause BSD | Permitted |
| Cache *(profile)* | `redis` | 7.4-alpine | BSD-3-Clause | Permitted — see note |
| Object storage *(profile)* | `minio/minio` | RELEASE.2025-04-22 | **AGPL-3.0** | Permitted — see note |
| Dev mail capture | `axllent/mailpit` | v1.27 | MIT | Permitted (development only) |

## Observability images

| Component | Image | Licence | Commercial use |
| --- | --- | --- | --- |
| Prometheus | `prom/prometheus` | Apache-2.0 | Permitted |
| Grafana | `grafana/grafana` | **AGPL-3.0** | Permitted — see note |
| Loki | `grafana/loki` | **AGPL-3.0** | Permitted — see note |
| Promtail | `grafana/promtail` | **AGPL-3.0** | Permitted — see note |
| Node exporter | `prom/node-exporter` | Apache-2.0 | Permitted |
| Postgres exporter | `prometheuscommunity/postgres-exporter` | Apache-2.0 | Permitted |
| cAdvisor | `gcr.io/cadvisor/cadvisor` | Apache-2.0 | Permitted |
| Error tracking | `glitchtip/glitchtip` | MIT | Permitted |

## Development and CI tooling

| Component | Licence | Notes |
| --- | --- | --- |
| Docker Engine, Docker Compose | Apache-2.0 | Docker **Desktop** is separately licensed and may require a paid subscription for larger organisations — Engine on Linux does not |
| GitLab CE | MIT | Community Edition. GitLab EE is a separate, commercial licence |
| Playwright | Apache-2.0 | |
| Ansible | GPL-3.0 | Used as a separate tool, never linked into shipped code |
| Certbot | Apache-2.0 | |

## Notes on the copyleft entries

### Grafana, Loki and Promtail — AGPL-3.0

AGPL extends copyleft to users who interact with the software **over a network**, which is what
distinguishes it from GPL.

**Acceptable here** because these run as internal observability tooling, bound to `127.0.0.1`, and
are not offered as a service to third parties.

**Would need review** if NEVIX embedded Grafana in a client-facing product or exposed a
dashboard to clients as part of a paid service. Recorded now so it is a known boundary rather than
a late discovery.

### MinIO — AGPL-3.0

Same reasoning. Profile-gated and not used in the MVP ([ADR-008](../architecture/adr/ADR-008-deferred-infrastructure.md)).
Serving MinIO's own S3 API to a third party as a product feature would be the trigger for review.

### Redis — BSD-3-Clause

Redis 7.4 as used here is BSD-3-Clause. Redis Ltd. moved later releases to RSALv2/SSPL, which are
**not** OSI-approved open-source licences. The image tag is pinned for that reason.

If Redis is ever upgraded past 7.4, check the licence of the target version before doing so. Valkey
(BSD-3-Clause, a Linux Foundation fork) is the drop-in alternative if the licence becomes a
problem.

### Ansible — GPL-3.0

Used as a standalone automation tool. Playbooks are data consumed by Ansible, not derivative works
linked into shipped software, so GPL obligations do not extend to the application.

## Fonts and brand assets

| Asset | Source | Licence |
| --- | --- | --- |
| Manrope (body copy) | Google Fonts, self-hosted by `next/font` at build time | SIL Open Font License 1.1 |
| Sora (headings) | Google Fonts, self-hosted by `next/font` at build time | SIL Open Font License 1.1 |
| NEVIX logo, mark, wordmark, app icon, brand boards, photographs and team cards — the originals in `brand-assets/nevix/` and `brand-assets/logo-summary.png`, and everything derived from them in `apps/web/public/brand/`, `apps/web/public/team/` and the app icons | Supplied with the project | **Proprietary — NEVIX.** Not open source. Shown on the site, including as downloads on `/brand`, but not licensed for reuse or redistribution. |

The OFL permits embedding and self-hosting. `next/font` downloads the files at build time, so no
request reaches a font CDN at runtime — which is also what allows `font-src 'self'` in the Content
Security Policy.

## Review checklist

When changing an image tag:

1. Check the licence **at the new version**, not the one you remember
2. If it is copyleft, confirm the usage still matches the reasoning above
3. Update this file with the new version and the review date
4. If a licence has become non-open-source (the Redis case), treat it as an architecture decision
   and record an ADR
