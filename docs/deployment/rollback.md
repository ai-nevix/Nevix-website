# Rollback

> Instruction §79 (rollback documentation), specification §21.

## 1. Decide what kind of rollback this is

This is the first question, and getting it wrong is how a bad deploy becomes a bad incident.

| Situation | Action |
| --- | --- |
| Bad code, **no migration** in the release | `./scripts/rollback.sh` — about a minute |
| Bad code, **additive migration** (new nullable column, new table) | `./scripts/rollback.sh` — the old code ignores the new column |
| Bad code, **destructive migration** (dropped or renamed column, changed type) | **Do not roll back code alone.** Restore from the pre-deploy backup |
| Data corruption | Restore from backup — see [backup-and-restore.md](./backup-and-restore.md) |
| A dependency outage (SMTP, CMS) | Not a rollback. The application degrades by design |

### How to tell which kind of migration you shipped

```bash
git diff <previous-tag>..<current-tag> -- apps/api/app/db/migrations/versions/
```

Look for `op.drop_column`, `op.drop_table`, `op.alter_column` with a type change, or a `NOT NULL`
added to an existing column. Any of those makes the release destructive.

## 2. Rolling back code

```bash
cd /opt/vastrix

./scripts/rollback.sh --list            # what is available
./scripts/rollback.sh                   # to the previously recorded tag
./scripts/rollback.sh --to abc1234      # to a specific tag
```

The script takes a safety backup first, deploys the target tag with `RUN_MIGRATIONS=false`, waits,
and verifies health. Migrations are skipped deliberately: the older code expects the older schema,
and re-running `upgrade head` would immediately re-apply what you are backing out.

It requires typing `ROLLBACK` to confirm, and appends to `.deploy-history`.

## 3. Rolling back a destructive migration

There is no safe automated path. Restore instead:

```bash
# 1. Stop traffic
docker compose stop web api

# 2. Restore the pre-deploy backup
./scripts/restore-database.sh \
  --file /var/backups/vastrix/vastrix-<timestamp>-pre-deploy-<sha>.dump \
  --production

# 3. Deploy the previous image tag
IMAGE_TAG=<previous-sha> RUN_MIGRATIONS=false docker compose up -d

# 4. Verify
curl -f https://vastrix.ai/api/v1/health
curl -f https://vastrix.ai/
```

**Anything written between the backup and the rollback is lost.** For this site that means
enquiries. Before restoring, check whether any arrived in that window:

```bash
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d vastrix -tAc \
  "SELECT reference, email, created_at FROM leads WHERE created_at > '<backup-time>' ORDER BY created_at;"
```

Export them first if there are any. Losing a customer enquiry silently is worse than a slow
rollback.

## 4. From CI

`rollback:production` is a manual job on the default branch. It runs `scripts/rollback.sh` on the
host and smoke-tests afterwards. Use it when you are not at a terminal; the CLI is faster when you
are.

## 5. Verifying a rollback

```bash
curl -f https://vastrix.ai/api/v1/health      # 200, status "ok"
curl -f https://vastrix.ai/                   # 200
curl -f https://vastrix.ai/services           # 200
curl -f https://vastrix.ai/sitemap.xml        # 200
docker compose ps                             # all healthy
docker compose logs --tail=50 api
```

Then confirm the thing that prompted the rollback is actually gone. A rollback that leaves the
symptom in place means the diagnosis was wrong.

## 6. After a rollback

1. Leave production on the known-good tag. Do not re-deploy to "try again".
2. Reproduce the failure on staging.
3. Fix it, with a test that would have caught it.
4. Deploy through the normal pipeline.
5. Write down what happened and what changed as a result.

## 7. Practise it

**Roll back on staging at least once before you need to in production.** An untested rollback is a
plan, not a capability — and the moment you need it is the worst moment to discover a missing
environment variable.

| Date | Environment | Performed by | Time taken | Notes |
| --- | --- | --- | --- | --- |
| _(none yet)_ | | | | Rehearse before production launch |
