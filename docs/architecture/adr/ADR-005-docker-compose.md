# ADR-005 — Docker Compose, not Kubernetes

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §20.1, instruction §6

## Context

The specification is unusually direct on this point:

> "Start with one Linux server and Docker Compose if traffic is modest. Do not introduce
> Kubernetes merely for appearance."

## Decision

Docker Compose on a single Linux host, with Nginx terminating TLS. Optional services are gated
behind compose profiles so the MVP runs five containers and no more.

## Alternatives considered

**Kubernetes / K3s** — solves problems of scale, isolation and independent deployment cadence. We
have none of those: one application, one database, one CMS, one team. What it would add is a daily
cost — manifests to maintain, an upgrade treadmill, an extra layer in every debugging session, and
a dependency on cluster expertise during an incident.

**Bare metal with systemd** — fewer moving parts still, but loses reproducible environments and
makes rollback a manual exercise.

**A managed platform** (Vercel, Railway) — contradicts the self-hosting requirement in
specification §11.

## Consequences

**Good.** A developer runs the whole stack with one command. Production and local differ by an
override file rather than by architecture. Rollback is an image tag. There is one place to look
when something is wrong.

**Costs.** A single host is a single point of failure. That is addressed by the things that
actually reduce risk at this scale — a tested restore, a rehearsed rollback, health checks and
alerting — rather than by orchestration.

**Zero-downtime deploys are not provided.** `docker compose up -d` restarts containers, so there is
a brief gap. For a marketing site that is acceptable; the alternative is a load balancer and two
replicas, which is a decision to make when it matters rather than now.

## Revisit when

Write down the trigger in advance, so moving is an evidence-based decision:

- more services than one compose file describes clearly
- teams that need to deploy independently of each other
- workloads with genuinely different scaling profiles
- isolation requirements a single host cannot satisfy
- an availability target that a single host demonstrably cannot meet
