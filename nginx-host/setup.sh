#!/usr/bin/env bash
# Run this on the production VM to install (or re-issue) host-level nginx +
# Let's Encrypt certs for whatever hostnames live in the VM's `.env`.
#
# Single source of truth: GUEST_URL + ADMIN_URL + BASE_URL in `.env`.
#
# Re-run safely: idempotent for installed packages and already-issued
# certs.
#
# Pre-requisite: A-records for all three subdomains point at this VM's
# external IP; otherwise certbot can't validate.

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

echo ""
echo "Configuring nginx for:"
echo "  Guest host:   $GUEST_HOST"
echo "  Admin host:   $ADMIN_HOST"
echo "  Backend host: $BACKEND_HOST"
echo "  Cert email:   $EMAIL"
echo ""

# ── 1. Install nginx + certbot ────────────────────────────────
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

# ── 2. Render template + drop in place ────────────────────────
RENDERED=/etc/nginx/sites-available/danya.conf
sed -e "s|{{GUEST_HOST}}|$GUEST_HOST|g" \
    -e "s|{{ADMIN_HOST}}|$ADMIN_HOST|g" \
    -e "s|{{BACKEND_HOST}}|$BACKEND_HOST|g" \
    "$TEMPLATE" > "$RENDERED"
ln -sf "$RENDERED" /etc/nginx/sites-enabled/danya.conf
rm -f /etc/nginx/sites-enabled/default

# Temporarily strip SSL directives so nginx can start before certs exist.
# certbot --nginx will add them back in step 3.
sed 's/listen 443 ssl;/listen 443;/g; /ssl_certificate/d; /include.*options-ssl/d; /ssl_dhparam/d' \
    "$RENDERED" > /tmp/danya-http-only.conf
cp /tmp/danya-http-only.conf "$RENDERED"
nginx -t && systemctl reload nginx

# ── 3. Obtain certificates (single batched request) ──────────
CERTBOT_D_ARGS=()
for DOMAIN in "${DOMAINS[@]}"; do
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        echo "✓ $DOMAIN already has a cert — skipping"
        continue
    fi
    CERTBOT_D_ARGS+=(-d "$DOMAIN")
done

if [ "${#CERTBOT_D_ARGS[@]}" -gt 0 ]; then
    certbot certonly --nginx \
        "${CERTBOT_D_ARGS[@]}" \
        --non-interactive \
        --agree-tos \
        -m "$EMAIL"
else
    echo "All domains already certificated — nothing to request."
fi

# ── 4. Restore full SSL config from the template ─────────────
sed -e "s|{{GUEST_HOST}}|$GUEST_HOST|g" \
    -e "s|{{ADMIN_HOST}}|$ADMIN_HOST|g" \
    -e "s|{{BACKEND_HOST}}|$BACKEND_HOST|g" \
    "$TEMPLATE" > "$RENDERED"
nginx -t && systemctl reload nginx

# ── 5. Auto-renew ─────────────────────────────────────────────
systemctl status certbot.timer --no-pager || true

echo ""
echo "✓ Done. Live:"
echo "  https://$GUEST_HOST"
echo "  https://$ADMIN_HOST"
echo "  https://$BACKEND_HOST"
