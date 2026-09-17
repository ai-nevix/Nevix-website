# Monitoring and Logging

> Specification §24 (observability, logging, backup), instruction §48, §49.

## 1. Stack

```
FastAPI /metrics ──────► Prometheus ──┐
node-exporter ─────────►              ├──► Grafana
cadvisor ──────────────►              │    (loopback only)
postgres-exporter ─────►              │
                                      │
container stdout ──► Promtail ──► Loki┘

unhandled exceptions ─────────────────► GlitchTip (loopback only)
```

**Nothing is published to a public interface.** Every port binds to `127.0.0.1`:

```bash
ssh -L 3001:127.0.0.1:3001 -L 9090:127.0.0.1:9090 user@host
```

Instruction §48 requires that dashboards are not publicly exposed. Binding to loopback means they
are unreachable even if authentication is later misconfigured — a stronger guarantee than a
password.

## 2. Metrics

`prometheus-fastapi-instrumentator` exposes `/metrics` on the API. Nginx returns 404 for that path
on the public host; Prometheus scrapes it over the internal network.

| Source | Provides |
| --- | --- |
| `vastrix-api` | Request rate, latency histogram, status codes by endpoint |
| `node-exporter` | CPU, memory, disk, filesystem, network |
| `cadvisor` | Per-container CPU, memory, restart counts |
| `postgres-exporter` | Connections, transaction rate, database size |

Retention: 30 days.

## 3. Logging

Structured JSON throughout, from Nginx, Next.js and FastAPI alike, so one format is enough.

Every API log line carries: `time`, `service`, `level`, `event`, `environment`, `version`, and —
inside a request — `request_id`, `method`, `path`, `status`, `latency_ms`.

### Redaction

Redaction is a **structlog processor**, not a convention. Any key that looks like a credential —
password, secret, token, api_key, authorization, cookie, session, database_url and more — is
replaced with `[redacted]` before the record is rendered, recursively, wherever in the codebase it
was added.

"Remember not to log the password" is not a control. This is.

Never logged, by design: passwords, tokens, API keys, session secrets, database URLs, or the
content of an enquiry.

### Labels versus fields

Promtail promotes only `level` to a Loki label. `request_id` and `path` are deliberately left in
the log line: a label per request id would create a new stream per request and destroy Loki's
performance. They remain fully searchable.

Retention: 30 days.

### Correlating a request

Every response carries `X-Request-ID`, and the same id appears in the Nginx, Next.js and FastAPI
log lines. Given an id from a user report:

```logql
{container=~"vastrix-.*"} |= "a1b2c3d4e5f6g7h8"
```

That returns the full path of one request across all three services.

## 4. Alerts

Defined in `infra/monitoring/prometheus/rules/vastrix-alerts.yml`. Each carries a `runbook`
annotation pointing at [`../deployment/runbook.md`](../deployment/runbook.md).

| Alert | Condition | Severity |
| --- | --- | --- |
| `ApiDown` | No scrape for 2m | critical |
| `HighErrorRate` | >5% 5xx for 5m | critical |
| `SlowResponses` | p95 >2s for 10m | warning |
| `PostgresDown` | `pg_up == 0` for 2m | critical |
| `PostgresConnectionsHigh` | >80% of max for 5m | warning |
| `DiskSpaceLow` / `DiskSpaceCritical` | <15% / <5% | warning / critical |
| `HighMemoryUsage` | >90% for 10m | warning |
| `ContainerRestartLoop` | >3 restarts in 15m | critical |
| `TlsCertificateExpiringSoon` | <30 days | warning |

Every alert is one an operator would act on. Alerts that fire without a clear action are noise,
and noisy alerting is how real alerts come to be ignored.

`TlsCertificateExpiringSoon` deserves a note: certificates do not expire unexpectedly — renewals
fail silently. Thirty days is enough notice to find out why.

## 5. Error tracking

GlitchTip, self-hosted, with open registration and organisation creation **disabled** — an
error-tracking instance holds stack traces and request context, which is not public information.

The frontend error boundary surfaces `error.digest` to the visitor as a reference. It correlates to
the server log without disclosing anything about the failure.

## 6. Health checks

| Endpoint | Checks | Used by |
| --- | --- | --- |
| `/api/v1/health` | Database, email config, uploads. 503 when degraded | Monitoring, smoke tests |
| `/api/v1/health/live` | Nothing — process liveness only | Container health check |
| `/api/v1/health/ready` | Database | Orchestration |

Liveness deliberately touches no dependency. A liveness probe that checks the database restarts a
healthy process during a database outage, turning a recoverable incident into a restart loop.

## 7. What is not covered

Stated rather than implied:

- **No uptime monitoring from outside the host.** If the host is unreachable, nothing alerts —
  Prometheus is on the same machine. Add an external check (Uptime Kuma, or a hosted probe) before
  relying on this for availability.
- **No alert delivery configured.** Alertmanager routing to email, Slack or PagerDuty needs to be
  set up; the rules exist but currently only surface in the Prometheus UI.
- **No distributed tracing.** Request ids provide correlation, which is sufficient for three
  services on one host.
- **No log-based alerting.** Loki rules are not configured; alerting is metric-based.

The first two are the gaps that matter for production readiness.
