#!/usr/bin/env bash
#
# Issues or renews Let's Encrypt certificates using the webroot challenge (specification §22).
#
#   ./scripts/issue-certificates.sh nevix.ai
#   ./scripts/issue-certificates.sh nevix.ai --renew
#   ./scripts/issue-certificates.sh nevix.ai --staging   # rehearse without burning rate limits
#
# Webroot rather than standalone, so Nginx keeps serving throughout. The ACME challenge path is the
# only route exempt from the HTTPS redirect (infra/nginx/snippets/acme-challenge.conf).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DOMAIN="${1:-}"
RENEW=false
STAGING=false

shift || true
while [ $# -gt 0 ]; do
  case "$1" in
    --renew)   RENEW=true; shift ;;
    --staging) STAGING=true; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <domain> [--renew] [--staging]" >&2
  exit 1
fi

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

CERT_EMAIL="${CERT_EMAIL:-${SITE_CONTACT_EMAIL:-}}"
if [ -z "$CERT_EMAIL" ]; then
  echo "Set CERT_EMAIL in .env so Let's Encrypt can send expiry warnings." >&2
  exit 1
fi

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

SUBDOMAINS=(-d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" -d "cms.$DOMAIN")

STAGING_FLAG=()
if [ "$STAGING" = true ]; then
  # Let's Encrypt rate-limits failed production attempts aggressively. Rehearse here first.
  STAGING_FLAG=(--staging)
  log "Using the Let's Encrypt STAGING environment — these certificates are NOT trusted."
fi

ACTION="certonly"
[ "$RENEW" = true ] && ACTION="renew"

log "Ensuring the ACME webroot exists..."
docker compose exec -T nginx mkdir -p /var/www/certbot 2>/dev/null || true

log "Running certbot ($ACTION) for $DOMAIN..."

docker run --rm \
  -v "$REPO_ROOT/infra/nginx/certs:/etc/letsencrypt" \
  -v nevix_certbot-webroot:/var/www/certbot \
  certbot/certbot:latest \
  "$ACTION" \
  --webroot --webroot-path=/var/www/certbot \
  --email "$CERT_EMAIL" \
  --agree-tos --no-eff-email \
  --keep-until-expiring \
  --non-interactive \
  "${STAGING_FLAG[@]}" \
  "${SUBDOMAINS[@]}"

# Nginx reads the certificates from a flat path; certbot writes them under live/<domain>/.
LIVE="$REPO_ROOT/infra/nginx/certs/live/$DOMAIN"
TARGET="$REPO_ROOT/infra/nginx/certs/$DOMAIN"

if [ -d "$LIVE" ]; then
  mkdir -p "$TARGET"
  cp -L "$LIVE/fullchain.pem" "$TARGET/fullchain.pem"
  cp -L "$LIVE/privkey.pem"   "$TARGET/privkey.pem"
  cp -L "$LIVE/chain.pem"     "$TARGET/chain.pem"
  chmod 600 "$TARGET/privkey.pem"
  log "Certificates copied to $TARGET"
fi

log "Reloading Nginx..."
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload

log "Verifying..."
sleep 2
if echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null \
     | openssl x509 -noout -dates; then
  log "Certificate is live."
else
  log "Could not verify over the network. Check DNS and the firewall."
fi

cat <<NEXT

Add automatic renewal to cron:

  0 3 * * 1 cd $REPO_ROOT && ./scripts/issue-certificates.sh $DOMAIN --renew >> /var/log/nevix-certs.log 2>&1

Prometheus alerts 30 days before expiry (TlsCertificateExpiringSoon), which is the backstop for a
renewal that has silently stopped working.
NEXT
