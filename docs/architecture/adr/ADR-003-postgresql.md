# ADR-003 — PostgreSQL as the single database engine

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11, §16 (data model), §76 (database security)

## Context

Three things need persistence: application data (leads, contact events, newsletter subscribers,
site settings), CMS content, and — eventually — vector embeddings for the AI layer.

## Decision

One PostgreSQL 16 instance, with separate databases for the application and for Strapi. The image
is `pgvector/pgvector:pg16`, so the vector extension is present but not enabled: turning it on is a
migration, not a rebuild.

The database must publish no port and have no route to the internet. This was previously enforced
by an `internal: true` Docker network; Docker has since been removed from the project (see
[ADR-005](./ADR-005-docker-compose.md)) and the isolation needs to be re-established by whatever
replaces it.

## Alternatives considered

**SQLite** — genuinely sufficient for the current write volume, and simpler to back up. Rejected
because the specification names PostgreSQL, because concurrent writes from the API and the CMS
would contend, and because migrating later is more work than starting correctly.

**Separate database servers for the app and the CMS** — better isolation, but doubles the
operational surface: two backup jobs, two upgrade paths, two sets of credentials, on a single host
that has neither the load nor the isolation requirement to justify it.

**A dedicated vector database** — premature. pgvector in the existing instance avoids a second
system until the knowledge base outgrows it.

## Consequences

**Good.** One engine to back up, tune and upgrade. JSONB for audit metadata. Real enum and
constraint support. The AI layer has a home without new infrastructure.

**Costs.** The application and the CMS share an instance, so a runaway query in one affects the
other. Acceptable at this scale; the trigger for splitting them is in the table below.

**Test note.** The unit suite runs against SQLite for speed, which is only possible because the
models avoid PostgreSQL-only constructs (JSONB is declared as a dialect variant of JSON; enums are
stored as strings). That could hide a PostgreSQL-specific migration problem, so CI runs the full
migration history — up, down, and up again — against real PostgreSQL in a separate job, and
`alembic check` fails the build if the models and migrations have drifted.

## Revisit when

| Trigger | Response |
| --- | --- |
| CMS load affects application latency | Split into separate instances |
| Read volume outgrows one instance | Add a read replica |
| Knowledge base outgrows pgvector | Evaluate a dedicated vector store |
