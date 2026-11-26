#!/usr/bin/env bash
# Warm the most-searched election town pages on the local origin after a deploy,
# before the Cloudflare purge (26 Nov 2026, docs/SEO_EXPERIMENTS.md "29N town
# pages: warm the top 150 after a deploy").
#
# A release starts with an empty ISR cache (only 20 towns per language are
# prerendered), so after the purge every town page is a MISS that renders on
# the request: 0.16-0.42 s each on the one Node thread (3.4 s for the first
# one in a fresh process), measured 26 Nov on a copy of the live build. Once a
# page is in the cache, a STALE request is answered from it (0.02-0.03 s) and
# regenerated in the background. Warming the pages people search for most
# keeps the first visitors after a purge off the render queue.
#
#   warm-elections.sh [list]   default list: warm-elections.txt next to this script
#
# Env: APP_URL (loopback only; default http://127.0.0.1:3000), CANONICAL_HOST,
# WARM_TOP_N (default 150), WARM_BUDGET_S (default 60: stops after that many
# seconds), WARM_PAUSE (seconds between requests, default 0.1). Sequential, one
# request at a time, so it never queues renders behind visitors' requests.
# Informational only: always exits 0.
set -uo pipefail

LIST=${1:-"$(dirname "${BASH_SOURCE[0]}")/warm-elections.txt"}
APP_URL=${APP_URL:-http://127.0.0.1:3000}
CANONICAL_HOST=${CANONICAL_HOST:-www.catalunyainfo.com}
WARM_TOP_N=${WARM_TOP_N:-150}
WARM_BUDGET_S=${WARM_BUDGET_S:-60}
WARM_PAUSE=${WARM_PAUSE:-0.1}

# The origin on this machine only: this must never become a crawl of production through Cloudflare.
case $APP_URL in
  http://127.0.0.1:* | http://localhost:*) ;;
  *) echo "  warm-elections: APP_URL must be the local origin (got $APP_URL); skipped"; exit 0 ;;
esac
[[ -r $LIST ]] || { echo "  warm-elections: no list at $LIST; skipped"; exit 0; }

start=$SECONDS
done_n=0 ok=0 slow=0 failed=0
while IFS= read -r path; do
  path=${path%%#*}
  path=${path//[[:space:]]/}
  [[ -n $path ]] || continue
  # Town pages only, exactly as the list is written: /ca/eleccions/<slug>/, /es/elecciones/<slug>/, /en/elections/<slug>/.
  [[ $path =~ ^/(ca/eleccions|es/elecciones|en/elections)/[a-z0-9-]+/$ ]] || { echo "  warm-elections: skipped $path"; continue; }
  (( done_n < WARM_TOP_N )) || break
  if (( SECONDS - start >= WARM_BUDGET_S )); then
    echo "  warm-elections: budget of ${WARM_BUDGET_S}s reached"
    break
  fi
  out=$(curl -s -o /dev/null -w '%{http_code} %{time_total}' --max-time 20 -H "Host: $CANONICAL_HOST" "$APP_URL$path" || true)
  code=${out%% *}
  secs=${out##* }
  done_n=$((done_n + 1))
  if [[ $code == 200 ]]; then ok=$((ok + 1)); else failed=$((failed + 1)); echo "  warm-elections: $path ${out:-000}"; fi
  [[ ${secs%%.*} =~ ^[0-9]+$ ]] && (( ${secs%%.*} >= 1 )) && slow=$((slow + 1))
  sleep "$WARM_PAUSE"
done < "$LIST"

echo "  warm-elections: $done_n town pages in $((SECONDS - start))s ($ok ok, $failed failed, $slow took 1 s or more)"
exit 0
