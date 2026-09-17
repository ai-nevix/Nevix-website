# Backup and Restore

> Specification §24.1, instruction §50.
>
> **A backup is a hypothesis until it has been restored.** Instruction §50 is explicit: do not
> claim backups are reliable until a restore procedure has actually been tested. The restore log
> at the bottom of this page is the record of that, and the launch checklist item stays unticked
> until it has an entry.

## 1. What is backed up

| Item | Mechanism | Frequency | Retention |
| --- | --- | --- | --- |
| `vastrix` database | `pg_dump --format=custom --compress=9` | daily + pre-deploy | 30 days; pre-deploy kept indefinitely |
| `vastrix_cms` database | same | daily + pre-deploy | same |
| API uploads volume | `tar -czf` | daily | 30 days |
| CMS media volume | `tar -czf` | daily | 30 days |
| `.env` | **manual, out of band** | on change | — |
| TLS certificates | **manual, out of band** | on renewal | — |

`.env` is deliberately excluded from the automated job. It is the one file whose compromise
compromises everything else, so it belongs in a password manager or secrets vault, not alongside
the data it protects.

Restoring the database without the uploads volume gives you `attachment_url` values pointing at
files that no longer exist — which is why both are in the same job.

## 2. Taking a backup

```bash
cd /opt/vastrix

./scripts/backup-database.sh                              # routine
./scripts/backup-database.sh --label pre-deploy-abc1234   # before a release
./scripts/backup-database.sh --dir /mnt/backup            # alternative target
```

**Every dump is verified immediately** with `pg_restore --list`. A truncated or corrupt file is
discarded and reported at backup time, rather than discovered during an incident.

### Scheduling

```cron
0 2 * * * cd /opt/vastrix && ./scripts/backup-database.sh >> /var/log/vastrix-backup.log 2>&1
```

### Off-host copies

```bash
# In .env
BACKUP_REMOTE_TARGET=backup@storage.example.com:/backups/vastrix
```

Specification §24.1 requires backup storage separate from the primary server. The script warns
loudly when this is unset, because a backup on the same disk does not survive the failure it
exists for.

## 3. Verifying a restore — do this monthly

```bash
./scripts/restore-database.sh --verify
```

This restores the most recent dump into a **scratch database**, checks the schema and row counts,
prints the migration revision, and drops the scratch database. Production is untouched.

```
  Restored tables:      5
  Lead records:         42
  Migration revision:   b243a5478478

  RESTORE VERIFIED.
```

Then add a line to the log at the bottom of this file. The log is the evidence; an unlogged
verification did not happen as far as an auditor is concerned.

## 4. Restoring for real

> **Destructive.** This replaces live data. Every enquiry received since the dump was taken is
> lost.

```bash
./scripts/restore-database.sh --file /var/backups/vastrix/vastrix-20260917-020000.dump --production
```

The script requires two explicit confirmations, then:

1. Takes a **safety dump** of the current database first — in case the restore is itself the
   mistake
2. Stops `api`, `cms` and `web` so nothing holds a connection
3. Restores with `--clean --if-exists --exit-on-error`
4. Restarts the services and waits for health
5. Reports where the safety dump was left

### Restoring uploads

```bash
docker compose stop api
docker run --rm -v vastrix_api-uploads:/data -v /var/backups/vastrix:/backup alpine \
  sh -c "rm -rf /data/* && tar -xzf /backup/uploads-20260917-020000.tar.gz -C /data --strip-components=1"
docker compose start api
```

## 5. Disaster recovery — rebuilding from nothing

Assumes the host is gone and you have the backups and `.env`.

```bash
# 1. New host: Docker Engine + Compose
# 2. Restore the repository and configuration
git clone <repository> /opt/vastrix && cd /opt/vastrix
# Restore .env from the password manager — NOT from the backup target
chmod 600 .env

# 3. Start only the database
docker compose up -d postgres
sleep 20

# 4. Create the databases
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres \
  -c "CREATE DATABASE vastrix;" -c "CREATE DATABASE vastrix_cms;"

# 5. Restore both
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d vastrix \
  --no-owner --no-privileges --exit-on-error < /path/to/vastrix-*.dump
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d vastrix_cms \
  --no-owner --no-privileges --exit-on-error < /path/to/vastrix_cms-*.dump

# 6. Restore the media volumes (see §4)

# 7. Reissue TLS certificates, then bring everything up
./scripts/issue-certificates.sh vastrix.ai
docker compose up -d

# 8. Verify
curl -f https://vastrix.ai/
curl -f https://api.vastrix.ai/api/v1/health
```

**Realistic recovery time:** 30–60 minutes on a prepared host, dominated by image builds and DNS
propagation. Measure it during a drill rather than trusting this estimate.

## 6. Recovery objectives

| Objective | Target | Basis |
| --- | --- | --- |
| RPO (data loss) | ≤ 24 hours | Daily backups. Reduce the interval if enquiry volume makes a day's loss unacceptable. |
| RTO (downtime) | ≤ 2 hours | Single host, manual rebuild. |

Both are **stated targets, not measured results**, until a drill has been performed. Record the
measured figures here once it has.

## 7. Restore verification log

Every verified restore gets a line. An empty table means the backups are unproven, and the
pre-launch checklist item must stay unticked.

| Date | Performed by | Dump tested | Method | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| _(none yet)_ | | | | | Add the first entry before production launch |

## 8. Known gaps

- **No point-in-time recovery.** Daily dumps only; WAL archiving is not configured. Worth adding
  if the acceptable data loss window drops below a day.
- **Backup restoration is manual.** No automated drill — the monthly `--verify` run is the
  compensating control, and it only works if someone actually runs it.
- **Off-host copy is optional.** It is a warning, not an error, so a deployment can run without
  it. That is deliberate for a first install and should be closed before launch.
