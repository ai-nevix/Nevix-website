# Deployment Architecture

> Specification §20 (deployment), §20.1 (initial topology), §25 (environments).
> See [ADR-005](./adr/ADR-005-docker-compose.md).

**Stale.** This document described the Docker Compose topology: one Linux host running Nginx,
the web/api/cms containers, PostgreSQL, and profile-gated Redis/MinIO/workers, plus a monitoring
stack under `docker-compose.monitoring.yml`. Docker has been removed from the project (see
[ADR-005](./adr/ADR-005-docker-compose.md)) because it was consuming enough host memory to starve
other processes during development. `infra/` (Nginx config, Prometheus/Grafana/Loki config) and
the Docker-driven deploy/backup/rollback scripts under `scripts/` were removed with it.

No replacement deployment method has been chosen. Until one is, there is no documented way to:

- reverse-proxy or terminate TLS for the three hostnames (`nevix.ai`, `api.nevix.ai`,
  `cms.nevix.ai`)
- build or run the web/api/cms services in production
- back up or restore the database and uploads
- roll back a bad release

Requirements that still apply regardless of mechanism (specification §20, §25, §76):

- PostgreSQL must not be reachable from outside the host.
- Staging must not be indexed (`NEXT_PUBLIC_ENV != production`).
- Production deploys require manual approval and must not run blindly from every branch.
- A backup must be taken before running a migration in production.

Rewrite this document once a deployment method is chosen (candidates considered when Docker was
removed: bare-metal + systemd, a managed PaaS — the latter would need revisiting the self-hosting
requirement in specification §11).
