#!/usr/bin/env bash
# =============================================================================
# CatalunyaInfo: provision a fresh Ubuntu 24.04 LTS server (Contabo Cloud VPS 4).
#
# Run as root from a copy of the ops/vps folder (README "1. Provision"):
#
#   bash provision.sh                        first run: everything below
#   bash provision.sh --admin-user NAME      also create a full-sudo admin
#                                            (key-only), the root path once
#                                            root login is disabled
#   bash provision.sh --files-only           reinstall only the units,
#                                            Caddyfile, scripts and sudoers
#                                            (after changing ops/vps)
#   bash provision.sh --disable-root-login   LAST step, only after deploy and
#                                            admin logins are verified
#
# Idempotent: re-running converges to the same state. It never overwrites
# /srv/catalunyainfo/shared/.env.production once that file exists.
#
# Lock-out safety, in order:
#   1. Password SSH login is disabled only if an authorized key exists for root
#      (or for the sudo user that ran this), and those keys are copied to
#      `deploy` first.
#   2. Root keeps KEY login (PermitRootLogin prohibit-password) until you have
#      verified, from a second terminal, that `deploy` (and the admin user) can
#      log in.
#   3. --disable-root-login refuses unless another account with full sudo and
#      an authorized key exists; otherwise you would be left with only the
#      provider's VNC console.
# =============================================================================
set -Eeuo pipefail

APP_DIR=/srv/catalunyainfo
DEPLOY_USER=deploy
NODE_MAJOR=24
ENV_FILE="$APP_DIR/shared/.env.production"
SSHD_DROPIN=/etc/ssh/sshd_config.d/00-catalunyainfo.conf
SUDOERS_FILE=/etc/sudoers.d/catalunyainfo-deploy
# GitHub's published SSH host key fingerprint (ed25519). Verify it at
# https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints
GITHUB_ED25519_FP="SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

MODE=full
ADMIN_USER=""
DISABLE_ROOT_LOGIN=no

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWARN: %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }
trap 'die "failed at line $LINENO: $BASH_COMMAND"' ERR

usage() { sed -n '2,32p' "${BASH_SOURCE[0]}"; exit "${1:-0}"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --admin-user) ADMIN_USER="${2:?--admin-user needs a name}"; shift 2 ;;
    --files-only) MODE=files; shift ;;
    --disable-root-login) DISABLE_ROOT_LOGIN=yes; shift ;;
    -h|--help) usage 0 ;;
    *) warn "unknown argument: $1"; usage 1 ;;
  esac
done

[[ $EUID -eq 0 ]] || die "run as root (or with sudo)"
[[ -z $ADMIN_USER || $ADMIN_USER =~ ^[a-z][a-z0-9_-]{0,30}$ ]] || die "invalid --admin-user name"
[[ $ADMIN_USER != "$DEPLOY_USER" && $ADMIN_USER != root ]] || die "--admin-user must not be root or $DEPLOY_USER"
for f in Caddyfile catalunyainfo.service catalunyainfo-cron.service catalunyainfo-cron.timer \
         cron-publish-scheduled.sh deploy.sh env.production.example; do
  [[ -f "$SCRIPT_DIR/$f" ]] || die "missing $SCRIPT_DIR/$f: copy the whole ops/vps folder"
  ! grep -q $'\r' "$SCRIPT_DIR/$f" || die "$f has Windows (CRLF) line endings: copy it from a git checkout (.gitattributes keeps ops/vps LF) or run: sed -i 's/\r\$//' $SCRIPT_DIR/*"
done

export DEBIAN_FRONTEND=noninteractive
# needrestart: restart affected services automatically instead of prompting.
export NEEDRESTART_MODE=a
APT_OPTS=(-y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Install a file only if it changed; return 0 if it changed, 1 if not.
install_if_changed() { # src dest mode
  local src=$1 dest=$2 mode=$3
  if [[ -f $dest ]] && cmp -s "$src" "$dest"; then return 1; fi
  install -o root -g root -m "$mode" "$src" "$dest"
  echo "  installed $dest"
  return 0
}

# Every public key that may log in today: root's, plus the sudo user's if
# provision.sh was started through sudo (e.g. a provider's `ubuntu` user).
collect_keys() {
  local out=$1 home
  : > "$out"
  [[ -s /root/.ssh/authorized_keys ]] && cat /root/.ssh/authorized_keys >> "$out"
  if [[ -n ${SUDO_USER:-} && $SUDO_USER != root ]]; then
    home=$(getent passwd "$SUDO_USER" | cut -d: -f6)
    [[ -s $home/.ssh/authorized_keys ]] && cat "$home/.ssh/authorized_keys" >> "$out"
  fi
  # Keep only key lines, de-duplicated.
  grep -E '^(ssh-|ecdsa-|sk-)' "$out" | sort -u > "$out.clean" || true
  mv "$out.clean" "$out"
}

# Merge keys into a user's authorized_keys (never removes existing ones).
install_keys() { # user keyfile
  local user=$1 keys=$2 home
  home=$(getent passwd "$user" | cut -d: -f6)
  install -d -o "$user" -g "$user" -m 700 "$home/.ssh"
  touch "$home/.ssh/authorized_keys"
  cat "$home/.ssh/authorized_keys" "$keys" | grep -E '^(ssh-|ecdsa-|sk-)' | sort -u > "$home/.ssh/authorized_keys.new" || true
  install -o "$user" -g "$user" -m 600 "$home/.ssh/authorized_keys.new" "$home/.ssh/authorized_keys"
  rm -f "$home/.ssh/authorized_keys.new"
}

has_key() { # user
  local home
  home=$(getent passwd "$1" | cut -d: -f6) || return 1
  [[ -s $home/.ssh/authorized_keys ]] && grep -qE '^(ssh-|ecdsa-|sk-)' "$home/.ssh/authorized_keys"
}

write_sshd_dropin() { # PermitRootLogin value
  local tmp
  tmp=$(mktemp)
  cat > "$tmp" <<EOF
# Managed by ops/vps/provision.sh. Files in sshd_config.d are read before
# sshd_config and the first value wins, so the 00- prefix beats the provider's
# 50-cloud-init.conf (which may enable passwords).
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
PermitRootLogin $1
MaxAuthTries 4
LoginGraceTime 30
X11Forwarding no
EOF
  if install_if_changed "$tmp" "$SSHD_DROPIN" 644; then
    # 24.04 socket-activates sshd; `sshd -t` needs this directory either way.
    install -d -m 755 /run/sshd
    sshd -t || { rm -f "$SSHD_DROPIN"; die "sshd rejected the new config; it was removed"; }
    # Existing sessions survive a reload. A not-yet-started (socket-activated)
    # daemon reads the file when it starts.
    systemctl try-reload-or-restart ssh.service
  fi
  rm -f "$tmp"
}

# A login with full root rights other than root itself: in the sudo group or
# with a sudoers rule, able to sudo (NOPASSWD or a real password), with a key.
full_sudo_with_key() { # user
  local user=$1 rights
  has_key "$user" || return 1
  rights=$(sudo -n -l -U "$user" 2>/dev/null) || return 1
  if grep -qE 'NOPASSWD: ALL$' <<<"$rights"; then return 0; fi
  grep -qE '\(ALL( : ALL)?\) ALL$' <<<"$rights" && [[ $(passwd -S "$user" | awk '{print $2}') == P ]]
}

# ---------------------------------------------------------------------------
# Config files from ops/vps (also the whole of --files-only)
# ---------------------------------------------------------------------------
install_files() {
  log "Installing systemd units, Caddyfile, scripts and sudoers"
  local units_changed=no

  install_if_changed "$SCRIPT_DIR/catalunyainfo.service"      /etc/systemd/system/catalunyainfo.service 644 && units_changed=yes
  install_if_changed "$SCRIPT_DIR/catalunyainfo-cron.service" /etc/systemd/system/catalunyainfo-cron.service 644 && units_changed=yes
  install_if_changed "$SCRIPT_DIR/catalunyainfo-cron.timer"   /etc/systemd/system/catalunyainfo-cron.timer 644 && units_changed=yes
  install_if_changed "$SCRIPT_DIR/cron-publish-scheduled.sh"  /usr/local/bin/catalunyainfo-cron 755 || true
  install_if_changed "$SCRIPT_DIR/deploy.sh"                  /usr/local/bin/catalunyainfo-deploy 755 || true

  if [[ $units_changed == yes ]]; then
    systemctl daemon-reload
    if systemctl is-active --quiet catalunyainfo.service; then
      warn "catalunyainfo.service changed: it takes effect at the next restart (next deploy, or: systemctl restart catalunyainfo)"
    fi
  fi
  systemctl enable catalunyainfo.service >/dev/null 2>&1
  # The timer calls the app, so it is only switched on once a release exists.
  if [[ -e $APP_DIR/current ]]; then
    systemctl enable --now catalunyainfo-cron.timer >/dev/null 2>&1
  else
    echo "  catalunyainfo-cron.timer installed; enabled automatically by the first"
    echo "  provision.sh --files-only run after the first deploy"
  fi

  # sudo for `deploy`: restart the app, and read the env file for builds
  # (exact commands and arguments; nothing else).
  local tmp
  tmp=$(mktemp)
  cat > "$tmp" <<EOF
# Managed by ops/vps/provision.sh.
# deploy may restart the app, and read the root-only env file so that
# 'next build' gets the build-time variables (README "Secrets").
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart catalunyainfo.service, /usr/bin/systemctl restart catalunyainfo
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/bin/cat $ENV_FILE
EOF
  visudo -cqf "$tmp" || die "generated sudoers file is invalid"
  install_if_changed "$tmp" "$SUDOERS_FILE" 440 || true
  rm -f "$tmp"

  # Caddy
  if [[ ! -f /etc/caddy/Caddyfile.dist && -f /etc/caddy/Caddyfile ]] && ! grep -q 'CatalunyaInfo' /etc/caddy/Caddyfile; then
    cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.dist
  fi
  # `caddy validate` runs as root and may open the log file: create it owned
  # by caddy first, or the real (unprivileged) Caddy could not append to it.
  install -d -o caddy -g caddy -m 755 /var/log/caddy
  [[ -e /var/log/caddy/catalunyainfo.access.log ]] \
    || install -o caddy -g caddy -m 640 /dev/null /var/log/caddy/catalunyainfo.access.log
  caddy validate --adapter caddyfile --config "$SCRIPT_DIR/Caddyfile" >/dev/null 2>&1 \
    || { caddy validate --adapter caddyfile --config "$SCRIPT_DIR/Caddyfile"; die "Caddyfile does not validate"; }
  if install_if_changed "$SCRIPT_DIR/Caddyfile" /etc/caddy/Caddyfile 644; then
    if systemctl is-active --quiet caddy; then systemctl reload caddy; else systemctl enable --now caddy; fi
  fi
}

if [[ $MODE == files ]]; then
  install_files
  log "Done (--files-only)"
  exit 0
fi

# ---------------------------------------------------------------------------
# --disable-root-login (separate, final step)
# ---------------------------------------------------------------------------
if [[ $DISABLE_ROOT_LOGIN == yes ]]; then
  log "Disabling root SSH login"
  admin_ok=""
  # Every account with a login shell, except root and deploy.
  for u in $(getent passwd | awk -F: '$3 >= 1000 && $3 < 60000 {print $1}'); do
    [[ $u == "$DEPLOY_USER" ]] && continue
    full_sudo_with_key "$u" && admin_ok=$u && break
  done
  [[ -n $admin_ok ]] || die "no account other than '$DEPLOY_USER' has full sudo and an SSH key.
Create one first (bash provision.sh --admin-user NAME), log in with it from a
second terminal, check 'sudo -n true', and only then re-run this."
  echo "  full-sudo account with a key: $admin_ok"
  write_sshd_dropin no
  log "Root login disabled. Keep this session open and test 'ssh $admin_ok@<server>' now."
  exit 0
fi

# ---------------------------------------------------------------------------
# 0. Sanity
# ---------------------------------------------------------------------------
# shellcheck source=/dev/null
. /etc/os-release
[[ ${ID:-} == ubuntu && ${VERSION_ID:-} == 24.04 ]] || warn "written for Ubuntu 24.04; this is ${PRETTY_NAME:-unknown}"

KEYS=$(mktemp)
collect_keys "$KEYS"
[[ -s $KEYS ]] || die "no SSH public key in /root/.ssh/authorized_keys${SUDO_USER:+ or ~$SUDO_USER/.ssh/authorized_keys}.
Add yours first (ssh-copy-id root@<server>) and check you can log in with it;
this script disables password login."
echo "SSH keys that will be able to log in: $(wc -l < "$KEYS")"

# ---------------------------------------------------------------------------
# 1. Packages, timezone, swap
# ---------------------------------------------------------------------------
log "Updating the system"
apt-get update -q
apt-get "${APT_OPTS[@]}" upgrade
apt-get "${APT_OPTS[@]}" install \
  ca-certificates curl gnupg git rsync jq ufw fail2ban python3-systemd \
  unattended-upgrades libjemalloc2 sysstat fio

log "Timezone Europe/Madrid"
timedatectl set-timezone Europe/Madrid

# sar history every 10 minutes (CPU steal over the 14-day trial: sar -u).
sed -i 's/^ENABLED="false"/ENABLED="true"/' /etc/default/sysstat
systemctl enable --now sysstat >/dev/null 2>&1

log "Swap"
mem_kb=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)
# <= 4.5 GiB of reported RAM counts as a "4 GB" plan (the kernel reserves some).
if (( mem_kb <= 4718592 )); then swap_gb=4; else swap_gb=2; fi
if swapon --show=NAME --noheadings | grep -q .; then
  echo "  swap already active: $(swapon --show=NAME,SIZE --noheadings | tr '\n' ' ')"
else
  [[ -f /swapfile ]] || fallocate -l "${swap_gb}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  echo "  /swapfile ${swap_gb}G active (RAM $((mem_kb / 1024)) MiB)"
fi
grep -qE '^/swapfile\s' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
printf 'vm.swappiness=10\n' > /etc/sysctl.d/90-catalunyainfo.conf
sysctl -q --system

# ---------------------------------------------------------------------------
# 2. Users and SSH
# ---------------------------------------------------------------------------
log "User '$DEPLOY_USER'"
# No usable password ('*', not the '!' lock): SSH keys only, and sudo only
# for the NOPASSWD rules in $SUDOERS_FILE.
new_login_user() { # user comment
  id "$1" >/dev/null 2>&1 && return 0
  useradd --create-home --shell /bin/bash --comment "$2" "$1"
  usermod -p '*' "$1"
}
new_login_user "$DEPLOY_USER" "CatalunyaInfo deploy"
# journal access without sudo (journalctl -u catalunyainfo).
usermod -aG systemd-journal "$DEPLOY_USER"
install_keys "$DEPLOY_USER" "$KEYS"

if [[ -n $ADMIN_USER ]]; then
  log "Admin user '$ADMIN_USER' (full sudo, key-only)"
  new_login_user "$ADMIN_USER" "Server admin"
  usermod -aG sudo,systemd-journal,adm "$ADMIN_USER"
  install_keys "$ADMIN_USER" "$KEYS"
  # Password is locked (key-only login), so sudo cannot ask for one.
  tmp=$(mktemp)
  printf '# Managed by ops/vps/provision.sh\n%s ALL=(ALL:ALL) NOPASSWD: ALL\n' "$ADMIN_USER" > "$tmp"
  visudo -cqf "$tmp" || die "admin sudoers invalid"
  install -o root -g root -m 440 "$tmp" "/etc/sudoers.d/90-$ADMIN_USER"
  rm -f "$tmp"
fi

log "SSH: keys only; root keeps key login for now"
grep -qiE '^\s*Include\s+/etc/ssh/sshd_config\.d/\*\.conf' /etc/ssh/sshd_config \
  || warn "/etc/ssh/sshd_config does not Include sshd_config.d/*.conf: add 'Include /etc/ssh/sshd_config.d/*.conf' at its top"
if [[ -f $SSHD_DROPIN ]] && grep -q '^PermitRootLogin no' "$SSHD_DROPIN"; then
  echo "  root login already disabled; keeping it so"
  write_sshd_dropin no
else
  write_sshd_dropin prohibit-password
fi
rm -f "$KEYS"

# ---------------------------------------------------------------------------
# 3. Firewall, fail2ban, unattended upgrades
# ---------------------------------------------------------------------------
log "Firewall (ufw): 22, 80, 443"
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp comment 'SSH' >/dev/null
ufw allow 80/tcp comment 'HTTP (ACME + redirect)' >/dev/null
ufw allow 443/tcp comment 'HTTPS' >/dev/null
ufw allow 443/udp comment 'HTTP/3 (Caddy)' >/dev/null
ufw --force enable >/dev/null
ufw status verbose | sed 's/^/  /'

log "fail2ban (sshd jail)"
cat > /etc/fail2ban/jail.d/catalunyainfo.local <<'EOF'
# Managed by ops/vps/provision.sh
[DEFAULT]
backend = systemd
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
EOF
systemctl enable fail2ban >/dev/null 2>&1
systemctl restart fail2ban

log "Unattended security upgrades"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
cat > /etc/apt/apt.conf.d/52catalunyainfo-unattended <<'EOF'
// Managed by ops/vps/provision.sh. Ubuntu security updates only (the
// default origins); Node.js and Caddy are upgraded by hand (README "Updating").
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
// No surprise reboots: /var/run/reboot-required is checked by hand.
Unattended-Upgrade::Automatic-Reboot "false";
EOF
systemctl enable --now unattended-upgrades >/dev/null 2>&1

# ---------------------------------------------------------------------------
# 4. Node.js 24 LTS (NodeSource) and Caddy (official repo)
# ---------------------------------------------------------------------------
install -d -m 755 /etc/apt/keyrings

log "Node.js $NODE_MAJOR (NodeSource); package.json engines: node >=22.6.0"
if [[ ! -s /etc/apt/keyrings/nodesource.gpg ]]; then
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
fi
chmod 644 /etc/apt/keyrings/nodesource.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
  > /etc/apt/sources.list.d/nodesource.list
# Prefer NodeSource's nodejs over Ubuntu's (18.x) whatever the version numbers.
printf 'Package: nodejs\nPin: origin deb.nodesource.com\nPin-Priority: 600\n' > /etc/apt/preferences.d/nodesource

log "Caddy (official apt repository)"
if [[ ! -s /usr/share/keyrings/caddy-stable-archive-keyring.gpg ]]; then
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
fi
chmod 644 /usr/share/keyrings/caddy-stable-archive-keyring.gpg
# Same lines as https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt
cat > /etc/apt/sources.list.d/caddy-stable.list <<'EOF'
deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main
EOF

apt-get update -q
apt-get "${APT_OPTS[@]}" install nodejs caddy

node_version=$(node --version)
[[ $node_version == v${NODE_MAJOR}.* ]] || die "expected Node $NODE_MAJOR, got $node_version"
echo "  node $node_version, npm $(npm --version), $(caddy version | cut -d' ' -f1)"

# ---------------------------------------------------------------------------
# 5. Directory layout
# ---------------------------------------------------------------------------
#   /srv/catalunyainfo                deploy  (deploy.sh switches `current` here)
#   ├── repo.git                      deploy  bare mirror, created by deploy.sh
#   ├── releases/<UTC time>-<sha>     deploy  one checkout + build per deploy
#   ├── current -> releases/...       deploy  the live release
#   └── shared                        root    755
#       ├── .env.production           root    600   secrets (never in git)
#       └── cache/images              deploy  Next image cache, kept across releases
log "Directories under $APP_DIR"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$APP_DIR" "$APP_DIR/releases"
install -d -o root -g root -m 755 "$APP_DIR/shared"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$APP_DIR/shared/cache" "$APP_DIR/shared/cache/images"
if [[ ! -e $ENV_FILE ]]; then
  install -o root -g root -m 600 "$SCRIPT_DIR/env.production.example" "$ENV_FILE"
  echo "  created $ENV_FILE from the template: fill it in (sudoedit $ENV_FILE)"
else
  chown root:root "$ENV_FILE"; chmod 600 "$ENV_FILE"
  echo "  $ENV_FILE exists: left as is (owner/mode re-asserted)"
fi

# ---------------------------------------------------------------------------
# 6. GitHub deploy key for `deploy` (read-only access to the repository)
# ---------------------------------------------------------------------------
log "GitHub deploy key"
DEPLOY_HOME=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)
if [[ ! -f $DEPLOY_HOME/.ssh/github_deploy ]]; then
  sudo -u "$DEPLOY_USER" ssh-keygen -q -t ed25519 -N "" -C "deploy@$(hostname)-catalunyainfo" -f "$DEPLOY_HOME/.ssh/github_deploy"
fi
if ! grep -q 'github_deploy' "$DEPLOY_HOME/.ssh/config" 2>/dev/null; then
  cat >> "$DEPLOY_HOME/.ssh/config" <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
  chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh/config"; chmod 600 "$DEPLOY_HOME/.ssh/config"
fi
if ! sudo -u "$DEPLOY_USER" ssh-keygen -F github.com -f "$DEPLOY_HOME/.ssh/known_hosts" >/dev/null 2>&1; then
  scan=$(ssh-keyscan -t ed25519 github.com 2>/dev/null)
  fp=$(ssh-keygen -lf - <<<"$scan" | awk '{print $2}')
  [[ $fp == "$GITHUB_ED25519_FP" ]] || die "github.com host key fingerprint $fp does not match the published $GITHUB_ED25519_FP"
  echo "$scan" >> "$DEPLOY_HOME/.ssh/known_hosts"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh/known_hosts"; chmod 644 "$DEPLOY_HOME/.ssh/known_hosts"
fi

# ---------------------------------------------------------------------------
# 7. Units, Caddyfile, scripts, sudoers
# ---------------------------------------------------------------------------
install_files

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
log "Provisioning complete"
cat <<EOF

Next steps (README.md has the details):

  1. From a SECOND terminal, keeping this one open:
       ssh $DEPLOY_USER@<server>          must log in with your key
       sudo -n -l                         must list only the restart/cat rules
     ${ADMIN_USER:+  ssh $ADMIN_USER@<server> && sudo -n true}
  2. Add this PUBLIC key as a read-only Deploy key on GitHub
     (catinforma/catalunyainfo -> Settings -> Deploy keys -> Add, no write access):

$(sed 's/^/       /' "$DEPLOY_HOME/.ssh/github_deploy.pub")

  3. Fill the secrets ON THE SERVER:  sudoedit $ENV_FILE
  4. As $DEPLOY_USER:  catalunyainfo-deploy main
  5. As root:  bash $SCRIPT_DIR/provision.sh --files-only   (enables the daily timer)
  6. Only after 1. works: --admin-user (if none yet), then --disable-root-login.
EOF
[[ -f /var/run/reboot-required ]] && warn "a reboot is required (kernel/libc update): reboot before the first deploy"
exit 0
