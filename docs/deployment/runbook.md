# Operations Runbook

> Specification §24, instruction §48.

**Stale.** This runbook described a Docker Compose deployment — `docker compose ps/logs/restart`,
Prometheus/Grafana/Loki under `infra/monitoring/`, and the backup/rollback scripts under
`scripts/`. Docker has been removed from the project (see
[ADR-005](../architecture/adr/ADR-005-docker-compose.md)), along with `infra/` and the
`backup-database.sh` / `restore-database.sh` / `rollback.sh` / `issue-certificates.sh` scripts it
referenced. No replacement deployment method or monitoring stack has been chosen yet, so none of
the previous incident procedures apply.

Rewrite this runbook once a deployment method is chosen.
