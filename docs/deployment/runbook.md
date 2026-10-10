# Operations Runbook

> Specification §24, instruction §48. Paired with `infra/monitoring/prometheus/rules/nevix-alerts.yml`
> — each alert's `runbook` annotation points at a section here.

## Quick reference

```bash
cd /opt/nevix

docker compose ps                      # what is running, and whether it is healthy
docker compose logs -f --tail=100 api  # follow one service
docker compose restart api             # restart one service
docker compose up -d                   # reconcile to the compose file
./scripts/backup-database.sh           # back up now
./scripts/rollback.sh --list           # deploy history
```

Monitoring binds to loopback only. To reach it:

```bash
ssh -L 3001:127.0.0.1:3001 -L 9090:127.0.0.1:9090 user@host
# Grafana    http://localhost:3001
# Prometheus http://localhost:9090
```

---

## api-down

**Alert:** `ApiDown` — Prometheus cannot scrape the API for 2 minutes.
**Impact:** The contact form fails. Enquiries are being lost. Treat as urgent.

```bash
docker compose ps api
docker compose logs --tail=200 api
```

| Symptom in the logs | Cause | Action |
| --- | --- | --- |
| `Invalid production configuration` | A required variable is missing or invalid | Fix `.env`, then `docker compose up -d api` |
| `connection refused` to postgres | Database down | See [database-down](#database-down) |
| `Migrations failed after 10 attempts` | Migration error | Inspect, fix, or roll back |
| Container restarting repeatedly | Crash on startup | Read the traceback in the logs |
| Nothing — the container is healthy | Network or Prometheus problem | `docker compose exec api curl -f localhost:8000/api/v1/health` |

If the cause is not obvious within a few minutes, roll back to the last known-good tag and
diagnose afterwards. Restoring service comes first.

---

## high-error-rate

**Alert:** `HighErrorRate` — over 5% of requests returning 5xx for 5 minutes.

```bash
docker compose logs --tail=500 api | grep -F '"status": 5'
```

In Grafana, filter Loki to `{container="nevix-api"} |= "unhandled_exception"`.

Common causes: connection-pool exhaustion after a traffic spike; an unhandled exception introduced
by the last deploy; SMTP timeouts blocking request handlers.

Every error response carries a `request_id`. Take one from a user report and search the logs for
it to follow the request across Nginx, Next.js and FastAPI.

---

## database-down

**Alert:** `PostgresDown`.

```bash
docker compose ps postgres
docker compose logs --tail=200 postgres
docker compose exec postgres pg_isready -U "$POSTGRES_USER"
```

| Symptom | Action |
| --- | --- |
| `No space left on device` | See [disk-full](#disk-full) — the most common cause |
| `database system was not properly shut down` | Usually self-recovering; watch the log |
| Container will not start | Check volume permissions; do **not** delete the volume |
| Out of memory | Check host memory; reduce `DATABASE_POOL_SIZE` |

**Never delete the `postgres-data` volume to "fix" a startup problem.** That volume is the data.

---

## disk-full

**Alerts:** `DiskSpaceLow` (15% remaining), `DiskSpaceCritical` (5%).

PostgreSQL stops accepting writes when the disk fills, so this becomes an outage rather than a
warning.

```bash
df -h
du -sh /var/lib/docker/* /var/backups/nevix 2>/dev/null | sort -h | tail

docker image prune -a --filter "until=168h"
docker system df
ls -la /var/backups/nevix
```

Backups are capped at 30 days, but pre-deploy snapshots are kept indefinitely by design. If those
are the problem, move them off-host rather than deleting them.

---

## slow-responses

**Alert:** `SlowResponses` — p95 latency above 2 seconds for 10 minutes.

```bash
# Long-running queries
docker compose exec postgres psql -U "$POSTGRES_USER" -d nevix -c \
  "SELECT pid, now()-query_start AS duration, state, left(query,100)
   FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 10;"

# Connection saturation
docker compose exec postgres psql -U "$POSTGRES_USER" -d nevix -c \
  "SELECT count(*) FROM pg_stat_activity;"

docker stats --no-stream
```

If SMTP is slow, contact submissions will be slow — notification email is sent inline. The
structural fix is the Celery profile
([ADR-008](../architecture/adr/ADR-008-deferred-infrastructure.md)); the immediate mitigation is to
unset `SMTP_HOST`, which degrades to recording the lead without notifying.

---

## container-restart-loop

**Alert:** `ContainerRestartLoop` — more than three restarts in 15 minutes.

```bash
docker compose ps
docker inspect nevix-api --format '{{.State.Health.Status}} {{.RestartCount}}'
docker inspect nevix-api --format '{{.State.OOMKilled}}'
docker compose logs --tail=100 <service>
```

Usual causes: a failing health check, a missing environment variable, or an OOM kill.

---

## certificate-expiry

**Alert:** `TlsCertificateExpiringSoon` — under 30 days remaining.

```bash
echo | openssl s_client -servername nevix.ai -connect nevix.ai:443 2>/dev/null \
  | openssl x509 -noout -dates

./scripts/issue-certificates.sh nevix.ai --renew
docker compose exec nginx nginx -s reload
```

Thirty days is enough notice to find out why the automated renewal stopped working — which is the
actual failure. Certificates do not expire unexpectedly; renewals fail silently.

---

## Routine maintenance

| Task | Frequency | Command |
| --- | --- | --- |
| **Verify a restore** | **monthly** | `./scripts/restore-database.sh --verify` |
| Review dependency advisories | monthly | `npm audit`, `pip-audit` |
| Apply host security updates | monthly | `apt update && apt upgrade` |
| Prune Docker images | monthly | `docker image prune -a --filter "until=720h"` |
| Review the dummy-data checklist | quarterly | `docs/dummy-data/replacement-checklist.md` |
| Rehearse a rollback on staging | quarterly | `./scripts/rollback.sh` |
| Regenerate licence inventories | on dependency change | `npm run licenses:inventory` |

The monthly restore verification is the one that matters most. Everything else on this list
degrades gracefully if skipped; an unverified backup fails at exactly the wrong moment.
