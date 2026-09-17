#!/usr/bin/env bash
#
# PostgreSQL backup (specification §24.1, instruction §50).
#
#   ./scripts/backup-database.sh
#   ./scripts/backup-database.sh --label pre-deploy-abc1234
#
# Run daily from cron:
#   0 2 * * * cd /opt/vastrix && ./scripts/backup-database.sh >> /var/log/vastrix-backup.log 2>&1
#
# Important: a backup is a hypothesis until it has been restored. `restore-database.sh --verify`
# restores into a scratch database and checks the result; run it on a schedule, not only when
# something has already gone wrong. Do not tick the backup item in the launch checklist until a
# restore has actually been performed (docs/deployment/backup-and-restore.md).
#
# Every dump is verified immediately with `pg_restore --list`, so a truncated or corrupt file is
# detected at backup time rather than during an incident.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/vastrix}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
LABEL=""
COMPOSE="${COMPOSE:-docker compose}"

while [ $# -gt 0 ]; do
  case "$1" in
    --label) LABEL="-$2"; shift 2 ;;
    --dir)   BACKUP_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

: "${POSTGRES_USER:?POSTGRES_USER is not set. Is .env present?}"
: "${POSTGRES_DB:=vastrix}"

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

backup_one() {
  local database="$1"
  local target="${BACKUP_DIR}/${database}-${TIMESTAMP}${LABEL}.dump"

  log "Backing up ${database}..."

  # Custom format (-Fc): compressed, and restorable selectively with pg_restore.
  if ! $COMPOSE exec -T postgres pg_dump \
        -U "$POSTGRES_USER" -d "$database" \
        --format=custom --compress=9 --no-owner --no-privileges \
      > "$target"; then
    log "ERROR: pg_dump failed for ${database}"
    rm -f "$target"
    return 1
  fi

  # A dump that cannot be listed cannot be restored. Checking now converts a silent failure into
  # a loud one, while there is still a good backup to fall back on.
  if ! $COMPOSE exec -T postgres pg_restore --list < "$target" > /dev/null 2>&1; then
    log "ERROR: ${database} dump failed verification and has been discarded"
    rm -f "$target"
    return 1
  fi

  local size
  size=$(du -h "$target" | cut -f1)
  log "  ${target} (${size}) verified"
}

FAILED=0
backup_one "$POSTGRES_DB" || FAILED=1
backup_one "${CMS_DATABASE_NAME:-vastrix_cms}" || FAILED=1

# --- Uploaded files -----------------------------------------------------------------------------
# The database records an attachment_url; without the files themselves a restore is incomplete.
log "Backing up uploaded files..."
UPLOADS_ARCHIVE="${BACKUP_DIR}/uploads-${TIMESTAMP}${LABEL}.tar.gz"
if $COMPOSE exec -T api tar -czf - -C /var/lib/vastrix uploads > "$UPLOADS_ARCHIVE" 2>/dev/null; then
  log "  ${UPLOADS_ARCHIVE} ($(du -h "$UPLOADS_ARCHIVE" | cut -f1))"
else
  log "  WARNING: upload backup failed or there are no uploads yet"
  rm -f "$UPLOADS_ARCHIVE"
fi

CMS_ARCHIVE="${BACKUP_DIR}/cms-uploads-${TIMESTAMP}${LABEL}.tar.gz"
if $COMPOSE exec -T cms tar -czf - -C /srv/cms/public uploads > "$CMS_ARCHIVE" 2>/dev/null; then
  log "  ${CMS_ARCHIVE} ($(du -h "$CMS_ARCHIVE" | cut -f1))"
else
  log "  WARNING: CMS media backup failed or there is no media yet"
  rm -f "$CMS_ARCHIVE"
fi

# --- Retention ----------------------------------------------------------------------------------
# Pre-deploy snapshots are kept regardless of age: they are the thing you want when a migration
# turns out to be wrong weeks later.
log "Pruning backups older than ${RETENTION_DAYS} days (pre-deploy snapshots are kept)..."
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name '*.dump' -o -name '*.tar.gz' \) \
     -mtime "+${RETENTION_DAYS}" ! -name '*pre-deploy*' -print -delete || true

# --- Off-host copy --------------------------------------------------------------------------------
# Specification §24.1: backup storage must be separate from the primary server. A backup on the
# same disk does not survive the failure it exists for.
if [ -n "${BACKUP_REMOTE_TARGET:-}" ]; then
  log "Copying to ${BACKUP_REMOTE_TARGET}..."
  if rsync -az --delete-after \
        --include='*.dump' --include='*.tar.gz' --exclude='*' \
        "${BACKUP_DIR}/" "${BACKUP_REMOTE_TARGET}/"; then
    log "  Off-host copy complete"
  else
    log "  ERROR: off-host copy failed — backups exist only on this host"
    FAILED=1
  fi
else
  log "WARNING: BACKUP_REMOTE_TARGET is not set. Backups are only on this host, which means"
  log "         they will not survive a disk or host failure (specification §24.1)."
fi

if [ "$FAILED" -ne 0 ]; then
  log "Backup finished WITH ERRORS"
  exit 1
fi

log "Backup complete."
