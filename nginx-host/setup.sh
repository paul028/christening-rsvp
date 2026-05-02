#!/usr/bin/env bash
# Run this on the production VM to install (or re-issue) host-level nginx +
# Let's Encrypt certs for the three Danya RSVP subdomains.
#
# Single source of truth: GUEST_URL + ADMIN_URL + BASE_URL in `.env`.
#
# Designed to co-exist with other nginx configs already on the host (e.g.
# the erb-young deploy). Cert issuance uses certbot --webroot rather than
# --nginx, so we never auto-edit other projects' configs.
#
# Re-run safely: idempotent for installed packages and already-issued
# certs.
#
# Pre-requisite: A-records for all three subdomains point at this VM's
# external IP; otherwise the HTTP-01 challenge can't validate.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../.env}"
TEMPLATE="$SCRIPT_DIR/danya.conf.template"

[[ -f "$ENV_FILE" ]] || { echo "ERROR: $ENV_FILE missing" >&2; exit 1; }
[[ -f "$TEMPLATE" ]] || { echo "ERROR: $TEMPLATE missing" >&2; exit 1; }

# Pull URL vars without sourcing .env (which would execute arbitrary
# shell). Strip surrounding quotes if any.
read_env() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'"
}

GUEST_URL="$(read_env GUEST_URL)"
ADMIN_URL="$(read_env ADMIN_URL)"
BASE_URL="$(read_env BASE_URL)"
[[ -n "$GUEST_URL" ]] || { echo "ERROR: GUEST_URL not set in $ENV_FILE" >&2; exit 1; }
[[ -n "$ADMIN_URL" ]] || { echo "ERROR: ADMIN_URL not set in $ENV_FILE" >&2; exit 1; }
[[ -n "$BASE_URL"  ]] || { echo "ERROR: BASE_URL not set in $ENV_FILE"  >&2; exit 1; }

# Strip scheme and trailing slash to get bare hostnames.
strip_scheme() {
    echo "$1" | sed -e 's|^https\?://||' -e 's|/.*$||'
}

GUEST_HOST="$(strip_scheme "$GUEST_URL")"
ADMIN_HOST="$(strip_scheme "$ADMIN_URL")"
BACKEND_HOST="$(strip_scheme "$BASE_URL")"

DOMAINS=("$GUEST_HOST" "$ADMIN_HOST" "$BACKEND_HOST")
EMAIL="$(read_env CERTBOT_EMAIL)"
EMAIL="${EMAIL:-admin@example.com}"

WEBROOT=/var/www/certbot
RENDERED=/etc/nginx/sites-available/danya.conf

echo ""
echo "Configuring nginx for:"
echo "  Guest host:   $GUEST_HOST"
echo "  Admin host:   $ADMIN_HOST"
echo "  Backend host: $BACKEND_HOST"
echo "  Cert email:   $EMAIL"
echo ""

# ── 1. Install nginx + certbot ────────────────────────────────
apt-get update -y
apt-get install -y nginx certbot

mkdir -p "$WEBROOT"
chown -R www-data:www-data "$WEBROOT"

# ── 2. Render an HTTP-only init config ────────────────────────
# Just the port-80 redirect blocks plus the /.well-known/acme-challenge
# location used for HTTP-01 validation. No port-443 blocks yet — the
# certs they reference don't exist on first run, which would fail
# nginx -t.
cat > "$RENDERED" <<EOF
# Auto-generated init config for cert issuance. Replaced with the full
# template by setup.sh after certbot succeeds.

server {
    listen 80;
    server_name $GUEST_HOST;
    location /.well-known/acme-challenge/ { root $WEBROOT; }
    location / { return 301 https://\$host\$request_uri; }
}

server {
    listen 80;
    server_name $ADMIN_HOST;
    location /.well-known/acme-challenge/ { root $WEBROOT; }
    location / { return 301 https://\$host\$request_uri; }
}

server {
    listen 80;
    server_name $BACKEND_HOST;
    location /.well-known/acme-challenge/ { root $WEBROOT; }
    location / { return 301 https://\$host\$request_uri; }
}
EOF

ln -sf "$RENDERED" /etc/nginx/sites-enabled/danya.conf
nginx -t
systemctl reload nginx

# ── 3. Obtain a single SAN certificate covering all three domains ──
# Stored under /etc/letsencrypt/live/$GUEST_HOST/ (the first -d arg).
# The nginx template references that same path from all three server
# blocks. Idempotent: certbot's --keep-until-expiring makes re-runs a
# no-op while the existing cert is still valid.
certbot certonly --webroot -w "$WEBROOT" \
    --cert-name "$GUEST_HOST" \
    -d "$GUEST_HOST" -d "$ADMIN_HOST" -d "$BACKEND_HOST" \
    --non-interactive \
    --agree-tos \
    --keep-until-expiring \
    -m "$EMAIL"

# ── 4. Render full template (port 80 + 443 with SSL) ─────────
sed -e "s|{{GUEST_HOST}}|$GUEST_HOST|g" \
    -e "s|{{ADMIN_HOST}}|$ADMIN_HOST|g" \
    -e "s|{{BACKEND_HOST}}|$BACKEND_HOST|g" \
    "$TEMPLATE" > "$RENDERED"
nginx -t
systemctl reload nginx

# ── 5. Verify auto-renew is set up ───────────────────────────
# certbot installs a systemd timer automatically on Debian/Ubuntu.
systemctl status certbot.timer --no-pager || true

echo ""
echo "✓ Done. Live:"
echo "  https://$GUEST_HOST"
echo "  https://$ADMIN_HOST"
echo "  https://$BACKEND_HOST"
