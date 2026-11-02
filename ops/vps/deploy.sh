#!/usr/bin/env bash
# =============================================================================
# CatalunyaInfo: build and release a commit on this server.
# Installed as /usr/local/bin/catalunyainfo-deploy by provision.sh.
#
# Run as the `deploy` user:
#   catalunyainfo-deploy                 deploy origin's main
#   catalunyainfo-deploy <ref>           a branch, tag or commit SHA
#   catalunyainfo-deploy --rollback      switch back to the previous release
#   catalunyainfo-deploy --list          list releases (* = live)
#
# Steps: fetch -> export the commit to releases/<UTC time>-<sha> -> npm ci ->
# npm run build (standalone, with the env file's build-time variables) ->
# assemble the standalone bundle -> atomic switch of `current` -> restart ->
# health checks -> automatic rollback to the previous release if they fail ->
# keep the newest 3 releases.
#
# Environment overrides: REPO_URL, KEEP_RELEASES, ALLOW_BUILD_WITHOUT_DB=1.
# =============================================================================
set -Eeuo pipefail
umask 022

APP_DIR=/srv/catalunyainfo
RELEASES="$APP_DIR/releases"
SHARED="$APP_DIR/shared"
REPO="$APP_DIR/repo.git"
CURRENT="$APP_DIR/current"
ENV_FILE="$SHARED/.env.production"
IMAGE_CACHE="$SHARED/cache/images"
SERVICE=catalunyainfo.service
REPO_URL="${REPO_URL:-https://github.com/catinforma/catalunyainfo.git}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
APP_URL=http://127.0.0.1:3000
CANONICAL_HOST=www.catalunyainfo.com

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '  \033[32mok\033[0m  %s\n' "$*"; }
warn() { printf '\033[1;33mWARN: %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

[[ $(id -un) == deploy ]] || die "run as the deploy user (sudo -iu deploy), not $(id -un)"

# One deploy at a time.
exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || die "another deploy is running"

live_release() { readlink -f "$CURRENT" 2>/dev/null || true; }

# Good releases, newest first (failed builds are renamed *.failed).
good_releases() {
  find "$RELEASES" -mindepth 1 -maxdepth 1 -type d ! -name '*.failed' -printf '%f\n' | sort -r
}

switch_to() { # absolute release dir
  ln -sfn "$1" "$APP_DIR/.current.tmp"
  mv -Tf "$APP_DIR/.current.tmp" "$CURRENT"   # rename(2): atomic
}

restart() {
  sudo -n /usr/bin/systemctl restart "$SERVICE" || die "sudo restart refused: check /etc/sudoers.d/catalunyainfo-deploy"
}

# ---------------------------------------------------------------------------
# Environment file: same syntax as systemd's EnvironmentFile (KEY=value, whole
# line comments, optional surrounding quotes). Only `deploy` reads it, through
# the one sudo rule that allows it; values are exported for the build only.
# ---------------------------------------------------------------------------
load_env() {
  local content line key value n=0
  local skip_re='^[[:space:]]*([#;].*)?$'
  local pair_re='^([A-Za-z_][A-Za-z0-9_]*)=(.*)$'
  local dq_re='^"(.*)"$' sq_re="^'(.*)'$"
  content=$(sudo -n /usr/bin/cat "$ENV_FILE") || die "cannot read $ENV_FILE via sudo (does it exist? provision.sh creates it)"
  while IFS= read -r line || [[ -n $line ]]; do
    line=${line%$'\r'}
    [[ $line =~ $skip_re ]] && continue
    if [[ ! $line =~ $pair_re ]]; then
      die "$ENV_FILE: unparseable line (KEY=value expected, no 'export', no spaces around =)"
    fi
    key=${BASH_REMATCH[1]}; value=${BASH_REMATCH[2]}
    if [[ $value =~ $dq_re || $value =~ $sq_re ]]; then value=${BASH_REMATCH[1]}; fi
    case $key in
      NODE_ENV|PORT|HOSTNAME|NEXT_OUTPUT|VERCEL_*)
        die "$ENV_FILE sets $key: remove it (the unit and deploy.sh own it; see env.production.example)" ;;
      *) ;;
    esac
    [[ $value == CHANGE_ME ]] && die "$ENV_FILE: $key is still CHANGE_ME"
    export "$key=$value"
    n=$((n + 1))
  done <<<"$content"
  ok "$n variables loaded from $ENV_FILE"
}

# ---------------------------------------------------------------------------
# Health checks against the local Node server (no Caddy, no DNS involved).
# ---------------------------------------------------------------------------
# curl prints 000 itself when it cannot connect; `|| true` keeps set -e quiet.
http_status() { # path [host]
  curl -s -o /dev/null -w '%{http_code}' --max-time 30 -H "Host: ${2:-$CANONICAL_HOST}" "$APP_URL$1" || true
}
header_of() { # path header [host]
  { curl -s -D - -o /dev/null --max-time 30 -H "Host: ${3:-$CANONICAL_HOST}" "$APP_URL$1" || true; } \
    | tr -d '\r' | awk -v h="$(tr '[:upper:]' '[:lower:]' <<<"$2")" -F': ' 'tolower($1) == h {print $2}'
}

health_check() {
  local i code failed=0 path
  for i in $(seq 1 60); do
    code=$(http_status /ca/)
    [[ $code == 200 ]] && break
    sleep 1
  done
  [[ $code == 200 ]] || { warn "/ca/ answered $code after 60 s"; return 1; }
  ok "/ca/ 200 after ${i}s"

  for path in /es/ /en/ /robots.txt /sitemap.xml /llms.txt; do
    code=$(http_status "$path")
    if [[ $code == 200 ]]; then ok "$path 200"; else warn "$path answered $code"; failed=1; fi
  done
  # The locale redirect runs in the proxy (src/proxy.ts).
  code=$(http_status /)
  if [[ $code == 307 ]]; then ok "/ 307 (locale redirect)"; else warn "/ answered $code, expected 307"; failed=1; fi

  # Indexing must match the switch, and only on the canonical host. This is the
  # check that catches a server noindexing itself (or a preview inviting
  # crawlers).
  local robots_tag other_tag robots_txt
  robots_tag=$(header_of /ca/ X-Robots-Tag)
  other_tag=$(header_of /ca/ X-Robots-Tag preview.invalid)
  robots_txt=$(curl -s --max-time 30 -H "Host: $CANONICAL_HOST" "$APP_URL/robots.txt" || true)
  if [[ ${NEXT_PUBLIC_ALLOW_INDEXING:-} == true ]]; then
    if [[ -z $robots_tag ]]; then ok "www /ca/ indexable (no X-Robots-Tag)"; else warn "www /ca/ sends X-Robots-Tag: $robots_tag although indexing is on"; failed=1; fi
    if grep -q '^Sitemap:' <<<"$robots_txt"; then ok "robots.txt invites crawlers, with the sitemap"; else warn "robots.txt has no Sitemap line although indexing is on"; failed=1; fi
  else
    warn "NEXT_PUBLIC_ALLOW_INDEXING is not true: the site is noindex (www sends: ${robots_tag:-nothing})"
  fi
  if [[ $other_tag == *noindex* ]]; then ok "other hosts noindex"; else warn "a non-canonical host is indexable"; failed=1; fi

  return "$failed"
}

# ---------------------------------------------------------------------------
# --list / --rollback
# ---------------------------------------------------------------------------
case "${1:-}" in
  --list)
    live=$(live_release)
    find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | while read -r r; do
      [[ $RELEASES/$r == "$live" ]] && echo "* $r" || echo "  $r"
    done
    exit 0 ;;
  --rollback)
    live=$(live_release)
    target=""
    while read -r r; do
      [[ $RELEASES/$r < $live ]] && { target="$RELEASES/$r"; break; }
    done < <(good_releases)
    [[ -n $target ]] || die "no older release to roll back to"
    log "Rolling back: $(basename "$live") -> $(basename "$target")"
    load_env
    switch_to "$target"
    restart
    if health_check; then log "Rolled back to $(basename "$target")"; exit 0; fi
    die "rolled back, but the health checks fail too: journalctl -u catalunyainfo -n 100"
    ;;
  -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
  -*) die "unknown option $1" ;;
  *) ;;   # a ref to deploy
esac

REF="${1:-main}"
START=$(date +%s)

# ---------------------------------------------------------------------------
# 1. Fetch and export the commit
# ---------------------------------------------------------------------------
log "Fetching $REPO_URL"
avail_kb=$(df --output=avail -k "$APP_DIR" | tail -1)
(( avail_kb > 3 * 1024 * 1024 )) || die "less than 3 GB free on $APP_DIR"
if [[ ! -d $REPO ]]; then
  git clone --bare --quiet "$REPO_URL" "$REPO"
fi
git --git-dir="$REPO" fetch --quiet --prune --force origin '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*'
SHA=$(git --git-dir="$REPO" rev-parse --verify --quiet "$REF^{commit}") || die "unknown ref: $REF"
NAME="$(date -u +%Y%m%dT%H%M%SZ)-${SHA:0:7}"
DIR="$RELEASES/$NAME"
PREVIOUS=$(live_release)
ok "$REF = $SHA ($(git --git-dir="$REPO" log -1 --format='%s' "$SHA" | cut -c1-70))"

mkdir -p "$DIR"
git --git-dir="$REPO" archive --format=tar "$SHA" | tar -x -C "$DIR"
echo "$SHA" > "$DIR/REVISION"

fail_build() {
  warn "$1"
  mv "$DIR" "$DIR.failed" 2>/dev/null || true
  die "build failed; release kept as $(basename "$DIR").failed for inspection. The live site was not touched."
}

# ---------------------------------------------------------------------------
# 2. Build
# ---------------------------------------------------------------------------
log "Loading build-time environment"
load_env
if [[ -z ${APP_DATABASE_URL:-}${DATABASE_URL:-}${POSTGRES_URL:-}${POSTGRES_URL_NON_POOLING:-} ]]; then
  # Pages prerendered without a database bake empty states for a day.
  [[ ${ALLOW_BUILD_WITHOUT_DB:-} == 1 ]] || die "no database URL in $ENV_FILE (set ALLOW_BUILD_WITHOUT_DB=1 only for a throwaway test)"
  warn "building WITHOUT a database"
fi
printf '  SITE_ENV=%s  NEXT_PUBLIC_ALLOW_INDEXING=%s  GA4=%s  ADSENSE=%s\n' \
  "${SITE_ENV:-<unset>}" "${NEXT_PUBLIC_ALLOW_INDEXING:-<unset>}" \
  "$([[ -n ${NEXT_PUBLIC_GA4_MEASUREMENT_ID:-} ]] && echo set || echo EMPTY)" \
  "$([[ -n ${ADSENSE_PUBLISHER_ID:-} ]] && echo set || echo empty)"

cd "$DIR"
unset NODE_ENV                       # npm ci must install devDependencies
export NEXT_TELEMETRY_DISABLED=1
export NEXT_OUTPUT=standalone        # next.config.ts: output standalone, compress off

log "npm ci"
nice -n 10 npm ci --include=dev --no-audit --no-fund --loglevel=error || fail_build "npm ci failed"

log "npm run build (standalone)"
BUILD_START=$(date +%s)
nice -n 10 ionice -c 2 -n 7 npm run build || fail_build "next build failed"
ok "built in $(( $(date +%s) - BUILD_START ))s"

# ---------------------------------------------------------------------------
# 3. Assemble the standalone bundle
# ---------------------------------------------------------------------------
log "Assembling .next/standalone"
SA="$DIR/.next/standalone"
[[ -f $SA/server.js ]] || fail_build "no .next/standalone/server.js: was NEXT_OUTPUT=standalone honoured?"
# server.js serves these itself, but the build does not copy them.
cp -a public "$SA/public"
mkdir -p "$SA/.next"
cp -a .next/static "$SA/.next/static"
# /api/admin/migrate reads ./drizzle at runtime. File tracing includes it today;
# copy it anyway if a future change stops that.
[[ -d $SA/drizzle ]] || cp -a drizzle "$SA/drizzle"
# Optimised images survive releases (keyed by source URL + size + format; LRU
# capped by Next at 50% of the free disk). Pages do not: see README "ISR".
mkdir -p "$SA/.next/cache" "$IMAGE_CACHE"
rm -rf "$SA/.next/cache/images"
ln -s "$IMAGE_CACHE" "$SA/.next/cache/images"
ok "bundle $(du -sh "$SA" | cut -f1)"

# ---------------------------------------------------------------------------
# 4. Switch, restart, check; roll back on failure
# ---------------------------------------------------------------------------
log "Switching current -> $NAME"
switch_to "$DIR"
restart

log "Health checks"
if health_check; then
  log "Live: $NAME (previous: ${PREVIOUS:+$(basename "$PREVIOUS")}${PREVIOUS:-none}) in $(( $(date +%s) - START ))s"
else
  warn "health checks failed for $NAME"
  journalctl -u "$SERVICE" -n 60 --no-pager 2>/dev/null || true
  if [[ -n $PREVIOUS && -d $PREVIOUS && $PREVIOUS != "$DIR" ]]; then
    log "Rolling back to $(basename "$PREVIOUS")"
    switch_to "$PREVIOUS"
    restart
    mv "$DIR" "$DIR.failed" || true
    if health_check; then
      die "deploy of $SHA failed and was rolled back to $(basename "$PREVIOUS"); the failed release is $NAME.failed"
    fi
    die "deploy failed AND the rollback fails its checks: journalctl -u catalunyainfo -n 200"
  fi
  die "first deploy failed its health checks and there is nothing to roll back to: journalctl -u catalunyainfo -n 200"
fi

# ---------------------------------------------------------------------------
# 5. Prune: newest $KEEP_RELEASES good releases (always including the live
#    one) and the newest failed one.
# ---------------------------------------------------------------------------
live=$(live_release)
mapfile -t good < <(good_releases)
for r in "${good[@]:$KEEP_RELEASES}"; do
  [[ $RELEASES/$r == "$live" ]] && continue
  rm -rf "${RELEASES:?}/$r" && echo "  pruned $r"
done
mapfile -t failed < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -name '*.failed' -printf '%f\n' | sort -r)
for r in "${failed[@]:1}"; do
  rm -rf "${RELEASES:?}/$r" && echo "  pruned $r"
done

if ! systemctl is-enabled --quiet catalunyainfo-cron.timer 2>/dev/null; then
  warn "the daily timer is not enabled yet. As root: bash $DIR/ops/vps/provision.sh --files-only"
fi
# Installed copies of ops/vps files that differ from this commit's.
stale=()
while read -r src dest; do
  cmp -s "$DIR/ops/vps/$src" "$dest" 2>/dev/null || stale+=("$src")
done <<EOF
deploy.sh /usr/local/bin/catalunyainfo-deploy
cron-publish-scheduled.sh /usr/local/bin/catalunyainfo-cron
catalunyainfo.service /etc/systemd/system/catalunyainfo.service
catalunyainfo-cron.service /etc/systemd/system/catalunyainfo-cron.service
catalunyainfo-cron.timer /etc/systemd/system/catalunyainfo-cron.timer
Caddyfile /etc/caddy/Caddyfile
EOF
if (( ${#stale[@]} )); then
  warn "installed copies differ from this commit (${stale[*]}). As root: bash $DIR/ops/vps/provision.sh --files-only"
fi
