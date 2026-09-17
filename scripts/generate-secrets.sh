#!/usr/bin/env bash
#
# Generates every secret the VASTRIX stack needs (instruction §32, §45).
#
#   ./scripts/generate-secrets.sh            # print to stdout
#   ./scripts/generate-secrets.sh --write    # append to .env, refusing to overwrite a set value
#
# Values come from the OS CSPRNG via `openssl rand`. Never reuse a secret between environments:
# a staging compromise must not grant production access.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
WRITE=false

[ "${1:-}" = "--write" ] && WRITE=true

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required." >&2
  exit 1
fi

secret() { openssl rand -base64 "${1:-48}" | tr -d '\n=' | tr '+/' '-_'; }

APP_KEY_1=$(secret 32); APP_KEY_2=$(secret 32)
APP_KEY_3=$(secret 32); APP_KEY_4=$(secret 32)

GENERATED=$(cat <<EOF
# Generated $(date -u +"%Y-%m-%dT%H:%M:%SZ") by scripts/generate-secrets.sh
# Treat this file as a credential. It must never be committed.

SECRET_KEY=$(secret 48)
ADMIN_API_KEY=$(secret 48)

POSTGRES_PASSWORD=$(secret 32)

CMS_APP_KEYS=${APP_KEY_1},${APP_KEY_2},${APP_KEY_3},${APP_KEY_4}
CMS_API_TOKEN_SALT=$(secret 32)
CMS_ADMIN_JWT_SECRET=$(secret 48)
CMS_TRANSFER_TOKEN_SALT=$(secret 32)
CMS_JWT_SECRET=$(secret 48)

REDIS_PASSWORD=$(secret 32)
MINIO_ROOT_PASSWORD=$(secret 32)
GRAFANA_ADMIN_PASSWORD=$(secret 24)
GLITCHTIP_SECRET_KEY=$(secret 48)
EOF
)

if [ "$WRITE" = false ]; then
  echo "$GENERATED"
  echo
  echo "# Re-run with --write to append these to .env" >&2
  exit 0
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$REPO_ROOT/.env.example" "$ENV_FILE"
  echo "Created .env from .env.example"
fi

# Refuse to replace a value that is already set: silently rotating a production secret would
# lock the application out of its own database.
CONFLICTS=()
while IFS= read -r line; do
  [[ "$line" =~ ^[A-Z_]+= ]] || continue
  key="${line%%=*}"
  if grep -qE "^${key}=.+" "$ENV_FILE"; then
    CONFLICTS+=("$key")
  fi
done <<< "$GENERATED"

if [ ${#CONFLICTS[@]} -gt 0 ]; then
  echo "These values are already set in .env and will NOT be changed:" >&2
  printf '  %s\n' "${CONFLICTS[@]}" >&2
  echo >&2
  echo "Clear a value manually if you intend to rotate it, and read" >&2
  echo "docs/deployment/rollback.md first — rotating POSTGRES_PASSWORD requires a database change too." >&2
fi

WROTE=0
while IFS= read -r line; do
  [[ "$line" =~ ^[A-Z_]+= ]] || continue
  key="${line%%=*}"
  grep -qE "^${key}=.+" "$ENV_FILE" && continue

  if grep -qE "^#?\s*${key}=" "$ENV_FILE"; then
    # Replace the empty placeholder in place, keeping the file's documentation order.
    tmp=$(mktemp)
    awk -v k="$key" -v repl="$line" '
      $0 ~ "^#?[ ]*" k "=" && !done { print repl; done=1; next }
      { print }
    ' "$ENV_FILE" > "$tmp"
    mv "$tmp" "$ENV_FILE"
  else
    echo "$line" >> "$ENV_FILE"
  fi
  WROTE=$((WROTE + 1))
done <<< "$GENERATED"

chmod 600 "$ENV_FILE"

echo "Wrote $WROTE secret(s) to .env and set its mode to 600."
echo
echo "Still required before deploying:"
echo "  POSTGRES_USER, NEXT_PUBLIC_SITE_URL, SMTP_* and EMAIL_NOTIFY_TO"
echo
echo "Verify nothing is committed:  npm run audit:secrets"
