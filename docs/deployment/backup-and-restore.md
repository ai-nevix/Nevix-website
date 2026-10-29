# Backup and Restore

> Specification §24.1, instruction §50.
>
> **A backup is a hypothesis until it has been restored.** Instruction §50 is explicit: do not
> claim backups are reliable until a restore procedure has actually been tested.

**Stale.** This document described `scripts/backup-database.sh` and
`scripts/restore-database.sh`, both of which drove `docker compose exec postgres ...`. Those
scripts and Docker have been removed from the project (see
[ADR-005](../architecture/adr/ADR-005-docker-compose.md)). No replacement backup mechanism has
been chosen yet — **the project currently has no working backup or restore process.**

Requirements that still hold regardless of mechanism:

- Back up both the `nevix` and `nevix_cms` databases, plus the API upload directory and CMS media
  directory — restoring the database without the files leaves `attachment_url` values pointing at
  nothing.
- Verify every dump immediately after taking it (e.g. `pg_restore --list`).
- Store a copy off-host; a backup on the same disk does not survive the failure it exists for.
- Test a real restore periodically, into a scratch database, before trusting the backups.
- Recovery objectives: RPO ≤ 24 hours, RTO ≤ 2 hours were the prior targets — re-confirm them once
  a mechanism exists.

Rewrite this document with real commands once a backup mechanism is in place, and do not tick the
launch checklist's backup item until a restore has actually been performed.
