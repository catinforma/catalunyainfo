#!/usr/bin/env bash
# Installed as /usr/local/bin/catalunyainfo-cron by provision.sh and run by
# catalunyainfo-cron.service (DynamicUser, env from the root-only env file).
#
# Calls the daily housekeeping endpoint with the same bearer token Vercel Cron
# sends. The header goes to curl on stdin (-H @-), so the secret never appears
# in a process list, a command line or the journal.
set -Eeuo pipefail

: "${CRON_SECRET:?CRON_SECRET is not set in /srv/catalunyainfo/shared/.env.production}"
url="${CRON_URL:-http://127.0.0.1:3000/api/cron/publish-scheduled/}"

# --retry covers a restart in progress (connection refused) and 5xx answers;
# the endpoint is idempotent, so retrying is safe. --fail-with-body prints the
# JSON error and exits non-zero, which marks the unit failed in systemctl.
printf 'Authorization: Bearer %s\n' "$CRON_SECRET" |
  curl --fail-with-body --silent --show-error \
    --max-time 300 --retry 3 --retry-delay 20 --retry-connrefused \
    --header @- "$url"
echo
