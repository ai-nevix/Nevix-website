# Monitoring and Logging

> Specification §24 (observability, logging, backup), instruction §48, §49.

**Stale.** This document described a Prometheus/Grafana/Loki/GlitchTip stack provisioned through
`docker-compose.monitoring.yml`, with alert rules in `infra/monitoring/prometheus/rules/`. Docker
has been removed from the project (see
[ADR-005](./adr/ADR-005-docker-compose.md)), and `infra/` was removed with it, so none of this
stack currently exists.

Requirements that still apply regardless of what replaces it:

- Dashboards and metrics endpoints must not be exposed on a public interface (instruction §48).
- Structured, redacted logging (no passwords, tokens, API keys, session secrets, database URLs or
  enquiry content in logs) and a per-request correlation id.
- Alerting only on conditions an operator would actually act on.

Rewrite this document once a replacement monitoring/logging stack is chosen.
