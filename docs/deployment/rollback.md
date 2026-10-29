# Rollback

> Instruction §79 (rollback documentation), specification §21.

**Stale.** This document described rolling back via `scripts/rollback.sh`, which drove
`docker compose`. Both the script and Docker have been removed from the project (see
[ADR-005](../architecture/adr/ADR-005-docker-compose.md)). No replacement deployment method has
been chosen yet, so there is currently no defined rollback procedure.

The parts of this document that remain true regardless of deployment mechanism:

- Decide whether the release included a migration, and whether it was additive or destructive,
  before rolling back — a destructive migration cannot be undone by rolling back code alone.
- A destructive migration requires restoring from a pre-deploy backup, not a code rollback.
- Check for data written between the backup and the restore (e.g. new leads) before restoring,
  and export it first.

Rewrite the procedural steps once a deployment method and backup mechanism are chosen.
