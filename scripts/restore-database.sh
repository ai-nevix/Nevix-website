#!/usr/bin/env bash
#
# PostgreSQL restore (specification §24.1, instruction §50).
#
#   ./scripts/restore-database.sh --verify                  # restore the latest into a scratch DB
#   ./scripts/restore-database.sh --file <dump>             # restore into a scratch DB
#   ./scripts/restore-database.sh --file <dump> --production  # DESTRUCTIVE: replace live data
#
# `--verify` is the mode that matters. Specification §24.1 requires testing restoration, and
# instruction §50 says not to claim backups are reliable until a restore has actually been
# performed. Running this weekly is what turns "we have backups" into a statement of fact.
#
# Production restore requires two explicit confirmations because it destroys current data.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/nevix}"
COMPOSE="${COMPOSE:-docker compose}"
DUMP_FILE=""
MODE="verify"

while [ $# -gt 0 ]; do
  case "$1" in
    --file)       DUMP_FILE="$2"; shift 2 ;;
    --verify)     MODE="verify"; shift ;;
    --production) MODE="production"; shift ;;
    --dir)        BACKUP_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

: "${POSTGRES_USER:?POSTGRES_USER is not set. Is .env present?}"
: "${POSTGRES_DB:=nevix}"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

if [ -z "$DUMP_FILE" ]; then
  DUMP_FILE=$(find "$BACKUP_DIR" -maxdepth 1 -name "${POSTGRES_DB}-*.dump" -type f \
              | sort | tail -1)
  [ -z "$DUMP_FILE" ] && { echo "No dump found in $BACKUP_DIR" >&2; exit 1; }
  log "Using the most recent dump: $DUMP_FILE"
fi

[ -f "$DUMP_FILE" ] || { echo "Not found: $DUMP_FILE" >&2; exit 1; }

log "Checking the dump is readable..."
$COMPOSE exec -T postgres pg_restore --list < "$DUMP_FILE" > /dev/null \
  || { log "ERROR: dump is corrupt or truncated"; exit 1; }
log "  Dump is valid."

# =================================================================================================
# Verify mode — restores into a scratch database and leaves production untouched
# =================================================================================================
if [ "$MODE" = "verify" ]; then
  SCRATCH="nevix_restore_check_$(date -u +%s)"
  log "Restoring into scratch database ${SCRATCH}..."

  cleanup() {
    log "Dropping ${SCRATCH}..."
    $COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d postgres \
      -c "DROP DATABASE IF EXISTS ${SCRATCH};" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT

  $COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d postgres \
    -c "CREATE DATABASE ${SCRATCH};" >/dev/null

  $COMPOSE exec -T postgres pg_restore \
    -U "$POSTGRES_USER" -d "$SCRATCH" --no-owner --no-privileges --exit-on-error \
    < "$DUMP_FILE" >/dev/null

  log "Verifying the restored schema and data..."

  TABLES=$($COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$SCRATCH" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
  LEADS=$($COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$SCRATCH" -tAc \
    "SELECT count(*) FROM leads;" 2>/dev/null || echo "0")
  REVISION=$($COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$SCRATCH" -tAc \
    "SELECT version_num FROM alembic_version;" 2>/dev/null || echo "none")

  echo
  echo "  Restored tables:      ${TABLES// /}"
  echo "  Lead records:         ${LEADS// /}"
  echo "  Migration revision:   ${REVISION// /}"
  echo

  # Four application tables plus alembic_version. Fewer means a partial restore.
  if [ "${TABLES// /}" -lt 5 ]; then
    log "ERROR: expected at least 5 tables; the restore looks incomplete."
    exit 1
  fi

  log "RESTORE VERIFIED. Record the date in docs/deployment/backup-and-restore.md."
  exit 0
fi

# =================================================================================================
# Production mode — destructive
# =================================================================================================
cat <<WARNING

  ============================================================================
   DESTRUCTIVE OPERATION

   This REPLACES the contents of the live '${POSTGRES_DB}' database.
   Every enquiry received since the dump was taken will be lost.

   Dump:     ${DUMP_FILE}
   Database: ${POSTGRES_DB}
  ============================================================================

WARNING

read -r -p "Type the database name to continue: " CONFIRM_DB
[ "$CONFIRM_DB" = "$POSTGRES_DB" ] || { echo "Aborted."; exit 1; }

read -r -p "Type RESTORE to confirm: " CONFIRM_WORD
[ "$CONFIRM_WORD" = "RESTORE" ] || { echo "Aborted."; exit 1; }

# A safety dump of the current state, in case the restore is itself the mistake.
SAFETY="${BACKUP_DIR}/pre-restore-$(date -u +%Y%m%d-%H%M%S).dump"
log "Taking a safety dump of the current database to ${SAFETY}..."
$COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --format=custom --compress=9 --no-owner --no-privileges > "$SAFETY"

log "Stopping the services that hold connections..."
$COMPOSE stop api cms web

log "Restoring..."
$COMPOSE exec -T postgres pg_restore \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --clean --if-exists --no-owner --no-privileges --exit-on-error \
  < "$DUMP_FILE"

log "Restarting services..."
$COMPOSE start web api cms

log "Waiting for health..."
sleep 15
$COMPOSE exec -T api curl --fail --silent http://127.0.0.1:8000/api/v1/health >/dev/null \
  && log "API is healthy." \
  || { log "ERROR: API is not healthy after the restore. Safety dump: ${SAFETY}"; exit 1; }

log "Restore complete. Safety dump retained at ${SAFETY}."
