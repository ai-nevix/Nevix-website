# ADR-008 — Redis, Celery, MinIO and pgvector deferred behind compose profiles

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11, §20, §32; instruction §6

## Context

The specification's stack table names Redis, Celery, MinIO and pgvector. Instruction §6 is equally
clear that they should not all be switched on for the first release:

> "Redis, Celery, MinIO, pgvector, Keycloak and AI inference infrastructure should only be
> actively used where their functionality is required."

The MVP has no cache pressure, no background jobs, no media volume and no vector search.

## Decision

Each was provisioned in `docker-compose.yml` behind a profile, and inactive by default. Docker has
since been removed from the project (see [ADR-005](./ADR-005-docker-compose.md)) and no
replacement deployment method has been chosen, so these services currently have no provisioning at
all — the triggers below still apply to whenever each is actually added.

pgvector needs no profile at all: the PostgreSQL image used, `pgvector/pgvector:pg16`, ships the
extension with the database, so enabling it is a one-line migration regardless of deployment
method.

## Why provisioned rather than omitted

Writing the compose service now, while the architecture is fresh, costs almost nothing. Retrofitting
it later means rediscovering the network topology, the credential wiring and the health-check
semantics under time pressure. The profile makes the cost of *running* it opt-in while keeping the
cost of *adding* it near zero.

## Alternatives considered

**Run everything from day one** — matches the stack table literally. Rejected: four more containers
to operate, back up, patch and debug, for no current benefit. Each would also need a secret, and
unused secrets tend to be weak ones.

**Omit entirely, add when needed** — cleanest compose file. Rejected because the integration
details are exactly what gets lost between now and then.

## The triggers, written down in advance

| Service | Add it when |
| --- | --- |
| **Redis** | The API runs more than one replica and rate limits must be shared — with in-memory counters, N replicas means N× the effective limit. Also: CMS response caching under real traffic. |
| **Celery** | Email sending starts blocking request latency, or scheduled work appears (report generation, re-indexing). |
| **MinIO** | Uploads outgrow the host disk, or more than one host needs shared access to media. |
| **pgvector** | The AI assistant lands (specification §19) and needs semantic retrieval. |
| **Keycloak** | The client portal introduces user accounts (specification §32, stage 3). |

Writing these down is the point of the ADR: each is a defensible reason to add the service, and
until one is true, the absence is also defensible.

## Consequences

**Good.** Five containers in production instead of nine. Less to secure, less to patch, less to
reason about during an incident.

**Costs.** The profiles are not exercised by default, so a stale image reference or a broken
health check in one of them would not be caught until someone enables it. Mitigated by keeping the
profile definitions simple and by the fact that enabling one is a deliberate, attended action.

**A real constraint today.** Rate limiting is in-memory. With a single API container that is
correct; the moment a second replica is added it becomes wrong, which is why the Redis trigger is
stated in terms of replicas rather than traffic.
