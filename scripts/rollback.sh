#!/usr/bin/env bash
#
# Roll back to the previously deployed image tag (instruction §79: rollback documentation exists).
#
#   ./scripts/rollback.sh                 # roll back to the recorded previous tag
#   ./scripts/rollback.sh --to abc1234    # roll back to a specific tag
#   ./scripts/rollback.sh --list          # show available tags
#
# Rolling back CODE is safe. Rolling back a DATABASE MIGRATION is not automatic and is not done
# here — if the release included a destructive migration, restore from the pre-deploy backup
# instead. See docs/deployment/rollback.md.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STATE_FILE=".deploy-history"
TARGET_TAG=""
LIST=false

while [ $# -gt 0 ]; do
  case "$1" in
    --to)   TARGET_TAG="$2"; shift 2 ;;
    --list) LIST=true; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

if [ "$LIST" = true ]; then
  echo "Deploy history (most recent last):"
  [ -f "$STATE_FILE" ] && cat "$STATE_FILE" || echo "  none recorded"
  echo
  echo "Locally available images:"
  docker images --format '  {{.Repository}}:{{.Tag}}' | grep -E 'nevix/(web|api)' | sort -u || true
  exit 0
fi

if [ -z "$TARGET_TAG" ]; then
  [ -f "$STATE_FILE" ] || { echo "No deploy history at $STATE_FILE. Use --to <tag>." >&2; exit 1; }
  TARGET_TAG=$(tail -2 "$STATE_FILE" | head -1 | awk '{print $2}')
  [ -z "$TARGET_TAG" ] && { echo "Could not determine the previous tag. Use --to <tag>." >&2; exit 1; }
  log "Previous tag from history: ${TARGET_TAG}"
fi

CURRENT_TAG="${IMAGE_TAG:-$(tail -1 "$STATE_FILE" 2>/dev/null | awk '{print $2}')}"

cat <<CONFIRM

  Rolling back
    from: ${CURRENT_TAG:-unknown}
      to: ${TARGET_TAG}

  This reverts application CODE only. If the release you are backing out of applied a
  database migration, this will leave the schema ahead of the code. Check the migration
  history before continuing — docs/deployment/rollback.md.

CONFIRM

read -r -p "Type ROLLBACK to continue: " CONFIRM_WORD
[ "$CONFIRM_WORD" = "ROLLBACK" ] || { echo "Aborted."; exit 1; }

log "Taking a safety backup before the rollback..."
./scripts/backup-database.sh --label "pre-rollback-${TARGET_TAG}" || {
  log "WARNING: backup failed. Continuing would leave no recovery point."
  read -r -p "Continue without a backup? Type YES: " FORCE
  [ "$FORCE" = "YES" ] || exit 1
}

log "Deploying ${TARGET_TAG}..."
export IMAGE_TAG="$TARGET_TAG"

# Migrations are skipped: the older code expects the older schema, and re-running `upgrade head`
# would immediately re-apply what is being rolled back.
RUN_MIGRATIONS=false docker compose up -d --remove-orphans

log "Waiting for health..."
sleep 20

HEALTHY=true
docker compose exec -T api curl --fail --silent http://127.0.0.1:8000/api/v1/health >/dev/null \
  || { log "ERROR: API is not healthy"; HEALTHY=false; }
docker compose exec -T web wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ 2>/dev/null \
  || { log "ERROR: web is not healthy"; HEALTHY=false; }

if [ "$HEALTHY" = false ]; then
  log "Rollback completed but the services are not healthy. Investigate before retrying."
  docker compose ps
  exit 1
fi

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ${TARGET_TAG} rollback" >> "$STATE_FILE"

log "Rollback to ${TARGET_TAG} complete and healthy."
