#!/usr/bin/env bash
# Publish content groups on the server itself (the endpoint is not public).
#   ssh deploy@<server> 'bash /srv/catalunyainfo/current/ops/vps/publish.sh strikes voting'
# Reads CRON_SECRET from the root-only env file through the deploy user's
# sudo rule; the secret goes to curl on stdin, never on a command line.
set -Eeuo pipefail
[[ $# -gt 0 ]] || { echo "usage: publish.sh GROUP [GROUP...]" >&2; exit 1; }
secret=$(sudo -n cat /srv/catalunyainfo/shared/.env.production | sed -n 's/^CRON_SECRET=//p' | head -1)
[[ -n $secret ]] || { echo "CRON_SECRET missing in the env file" >&2; exit 1; }
for group in "$@"; do
  [[ $group =~ ^[a-z0-9-]+$ ]] || { echo "$group -> skipped (bad name)"; continue; }
  code=$(printf 'Authorization: Bearer %s\n' "$secret" |
    curl --silent --output /tmp/publish-"$group".json --write-out '%{http_code}' \
      --max-time 300 --request POST --header @- \
      --header 'Host: www.catalunyainfo.com' --header 'X-Forwarded-Proto: https' \
      "http://127.0.0.1:3000/api/admin/publish/?only=$group")
  echo "$group -> $code"
done
