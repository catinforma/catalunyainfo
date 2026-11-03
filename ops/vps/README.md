# CatalunyaInfo on a VPS: runbook

Moves www.catalunyainfo.com from Vercel Hobby to a self-managed **Contabo Cloud
VPS 4** (4 vCPU, 8 GB RAM, 100 GB SSD, EU, Ubuntu 24.04 LTS). The reason is
Vercel Hobby's ISR-write allowance (200K / 30 days), which is close to running
out and would pause the account. On a VPS ISR writes cost nothing.

```
visitor ─▶ [Cloudflare, optional] ─▶ Caddy :443 (TLS, HTTP/3, zstd/gzip, apex→www)
                                       └─▶ Next.js standalone 127.0.0.1:3000  (systemd, user deploy)
                                             ├─▶ Supabase Postgres (eu-west-1), as today
                                             └─▶ ISR cache on local disk
systemd timer 23:05 UTC ─▶ GET /api/cron/publish-scheduled/   (was the Vercel cron)
```

The whole setup takes about an hour over SSH. **Nothing in this folder changes
the Vercel deployment.** Vercel stays live, and remains the rollback, until the
DNS moves.

| File | Installed as | What it is |
| --- | --- | --- |
| `provision.sh` | run once as root | users, SSH, ufw, fail2ban, upgrades, swap, Node 24, Caddy, layout, units |
| `deploy.sh` | `/usr/local/bin/catalunyainfo-deploy` | build and release a commit, health checks, automatic rollback |
| `catalunyainfo.service` | `/etc/systemd/system/` | the Next.js standalone server |
| `catalunyainfo-cron.service` / `.timer` | `/etc/systemd/system/` | the daily job that replaces the Vercel cron |
| `cron-publish-scheduled.sh` | `/usr/local/bin/catalunyainfo-cron` | calls the cron endpoint with the bearer token |
| `Caddyfile` | `/etc/caddy/Caddyfile` | TLS, redirects, compression, reverse proxy |
| `env.production.example` | `/srv/catalunyainfo/shared/.env.production` (first run only) | every variable the app reads, with placeholders |

---

## Quick sequence (details in the numbered sections)

```bash
# 1. Provision. On your machine, from a checkout of the repository (Git Bash):
git archive HEAD ops/vps | ssh root@<VPS_IP> 'rm -rf /root/catalunyainfo-ops && mkdir -p /root/catalunyainfo-ops && tar -x -C /root/catalunyainfo-ops --strip-components=2'
ssh root@<VPS_IP> 'bash /root/catalunyainfo-ops/provision.sh --admin-user <admin>'
# 2. In a SECOND terminal: ssh deploy@<VPS_IP>, then ssh <admin>@<VPS_IP> 'sudo -n true'
# 3. GitHub: add the printed public key as a read-only Deploy key
# 4. Secrets, on the server:  ssh <admin>@<VPS_IP>  then  sudoedit /srv/catalunyainfo/shared/.env.production
# 5. Deploy:  ssh deploy@<VPS_IP>, then inside `tmux new -As deploy`:  catalunyainfo-deploy main
#    then:    ssh <admin>@<VPS_IP> 'sudo bash /srv/catalunyainfo/current/ops/vps/provision.sh --files-only'
# 6. Test on the preview hostname; run the 14-day checks (section 7)
# 7. Cut over DNS (section 8), Vercel kept as the rollback
# 8. Only after 2. worked: ssh <admin>@<VPS_IP> 'sudo bash /srv/catalunyainfo/current/ops/vps/provision.sh --disable-root-login'
```

---

## 0. Before you start

- **SSH key.** Contabo gives root a password by e-mail. If no key was added when
  the server was ordered, add one now: `ssh-copy-id root@<VPS_IP>`, then confirm
  `ssh root@<VPS_IP>` logs in without asking for a password. `provision.sh`
  turns password login off and refuses to run if root has no key.
- **Snapshot.** If the Contabo panel offers one, take a snapshot of the clean
  server before provisioning and another after the first good deploy.
- **Have at hand, not in a chat:** the Supabase connection string, your local
  `.cron-secret`, the GA4 measurement id, and GitHub admin access to
  `catinforma/catalunyainfo` (to add a deploy key).
- **Note the VPS IPv4 (and IPv6).** `<VPS_IP>` below is the IPv4 address.

## 1. Provision (about 15 minutes)

`provision.sh` runs as root and can be re-run safely. It:

1. updates the system and installs git, ufw, fail2ban, unattended-upgrades,
   libjemalloc2 (for sharp), sysstat and fio (for the trial checks);
2. sets the timezone to **Europe/Madrid** and turns on `sar` history;
3. adds a swap file (**4 GB if RAM ≤ 4 GB, else 2 GB**: 2 GB on the VPS 4) and
   sets swappiness to 10;
4. creates **`deploy`** (key-only, no password). It may only run
   `systemctl restart catalunyainfo` and read the env file through sudo;
5. with `--admin-user NAME`, creates an admin account with full sudo, key-only
   login and NOPASSWD sudo (the password is locked). It becomes the way in once
   root login is off;
6. **SSH:** keys only (`PasswordAuthentication no`), with **root still allowed
   by key** (`PermitRootLogin prohibit-password`); see "Lock-out order" below;
7. **ufw:** allows 22/tcp, 80/tcp, 443/tcp and 443/udp (HTTP/3) and denies
   everything else, so port 3000 is never public;
8. **fail2ban:** an sshd jail reading the journal (5 failures in 10 min, 1 h ban);
9. **unattended-upgrades:** Ubuntu security updates daily, no automatic reboot;
10. **Node.js 24 LTS** from NodeSource (package.json `engines`: `node >=22.6.0`;
    the tests rely on `--experimental-strip-types`, available since 22.6);
11. **Caddy** from its official apt repository;
12. the layout under `/srv/catalunyainfo` (below), and an env file copied from
    the template (root:root 600, never overwritten afterwards);
13. a **GitHub deploy key** for `deploy` (it prints the public half). GitHub's
    host key is checked against its published fingerprint;
14. installs the units, the Caddyfile, the cron script, `catalunyainfo-deploy`
    and the sudoers rule, then validates the Caddyfile and reloads Caddy.

```
/srv/catalunyainfo                    deploy   755
├── repo.git/                         deploy   bare clone, created by the first deploy
├── releases/<UTC time>-<sha>/        deploy   one export + build per deploy (newest 3 kept)
├── current -> releases/...           deploy   switched atomically by deploy.sh
└── shared/                           root     755
    ├── .env.production               root     600   secrets
    └── cache/images/                 deploy   optimised images, kept across releases
```

### Lock-out order (do not skip)

1. Run `provision.sh` **in a session you keep open**.
2. In a **second terminal**: `ssh deploy@<VPS_IP>` must log in with your key;
   `sudo -n -l` lists only the two restart rules and the `cat` rule.
3. Also from a second terminal: `ssh <admin>@<VPS_IP>` and `sudo -n true`
   (no error means full sudo works).
4. Only then, at the very end (section 9):
   `sudo bash /srv/catalunyainfo/current/ops/vps/provision.sh --disable-root-login`.
   It refuses unless an account other than `deploy` has full sudo and a key,
   because `deploy`'s sudo is deliberately too narrow to administer the server.
   Keep the session open and test `ssh <admin>@<VPS_IP>` again afterwards.

If you are ever locked out, Contabo's VNC console still accepts root with its
password at the console (password login is only disabled for SSH).

## 2. GitHub deploy key

`provision.sh` prints a `ssh-ed25519 …` **public** key at the end. Add it at
GitHub → `catinforma/catalunyainfo` → Settings → Deploy keys → Add deploy key,
with **"Allow write access" unchecked**. To print it again:
`sudo cat /home/deploy/.ssh/github_deploy.pub`. If the repository is public,
skip this step and deploy with
`REPO_URL=https://github.com/catinforma/catalunyainfo.git catalunyainfo-deploy`.

## 3. Secrets: where the owner fills them

Only on the server, in `/srv/catalunyainfo/shared/.env.production` (root:root,
mode 600). Never in a chat, an issue, a commit or a screenshot.

```bash
ssh <admin>@<VPS_IP>
sudoedit /srv/catalunyainfo/shared/.env.production
```

`env.production.example` documents every variable: what it is, whether the
build, the running server or both read it, and which are secret. The values
that matter:

| Variable | Where the value comes from |
| --- | --- |
| `APP_DATABASE_URL` | Supabase → Project Settings → Database → Connection string, **transaction pooler** (port 6543) with `?sslmode=require`. Vercel stores it as Sensitive, so it cannot be read back there. |
| `CRON_SECRET` | Your local `.cron-secret`, so existing publish commands keep working. Paste it with no trailing newline. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Vercel → Settings → Environment Variables (Production), or GA4 → Admin → Data streams. Left empty, analytics stop silently. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true`, as in production today. |
| `SITE_ENV` | `production` |
| `DATABASE_POOL_MAX` | `5` |
| `RESEND_API_KEY`, `CONTACT_*`, `ADSENSE_PUBLISHER_ID` | Optional, as on Vercel today (production's `/ads.txt` is a 404 now). |
| `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` | Optional: the Cloudflare cache purge (section 10). The token is a Cache Purge-only token for this zone. |

How the file is read:

- **systemd** reads it as root when the service starts, which is why it can be
  root-only.
- **`deploy.sh`** needs the build-time values (the database URL, so
  `generateStaticParams` can list every page and the prerendered pages carry
  real content, and the `NEXT_PUBLIC_*` values, which are inlined). It reads
  the file through one exact sudo rule (`sudo -n /usr/bin/cat <that file>`),
  logged in the auth log, and exports the values only into the build's
  environment. The root ownership guards against accidental exposure; it is not
  a boundary against `deploy`, which runs the app and therefore sees its
  environment anyway.
- `deploy.sh` refuses to build if a value is still `CHANGE_ME`, if
  `NODE_ENV`/`PORT`/`HOSTNAME`/`NEXT_OUTPUT`/`VERCEL_*` are set there, or if no
  database URL is set.

**After a change:** run-time variables need `sudo systemctl restart
catalunyainfo` (and nothing more for the cron). Build-time variables
(`NEXT_PUBLIC_*`, `SITE_ENV`, the database URL, `ADSENSE_PUBLISHER_ID`) need a
new deploy: `catalunyainfo-deploy`.

## 4. First deploy

```bash
ssh deploy@<VPS_IP>
tmux new -As deploy                  # a dropped connection then cannot cut a deploy in half
catalunyainfo-deploy main            # or a tag / commit SHA
```

What `deploy.sh` does, as `deploy`:

1. `git fetch` into the bare clone `/srv/catalunyainfo/repo.git` and resolves
   the ref to a commit;
2. exports that commit (`git archive`, no `.git`) into
   `releases/<UTC time>-<short sha>` and writes `REVISION`;
3. loads the env file (above), then `npm ci --include=dev` and
   `npm run build` with `NEXT_OUTPUT=standalone`, under `nice`/`ionice` so the
   live site keeps priority. On the VPS 4 the build takes a few minutes;
4. assembles the standalone bundle: copies `public/` and `.next/static/` into
   `.next/standalone/` (the build does not), checks `drizzle/` is there for
   `/api/admin/migrate`, and symlinks `.next/cache/images` to the shared image
   cache;
5. switches `current` atomically (`ln -s` to a temporary name, then
   `mv -T`, a rename(2)) and runs `sudo systemctl restart catalunyainfo`.
   Caddy holds requests for up to 20 s while Node restarts, so visitors wait
   1–3 s rather than seeing a 502;
6. runs the health checks on `127.0.0.1:3000` with `Host: www.catalunyainfo.com`:
   `/ca/` (waits up to 60 s), `/es/`, `/en/`, `/robots.txt`, `/sitemap.xml`,
   `/llms.txt` → 200; `/` → 307; and **indexing**: with the switch on, `/ca/`
   must carry no `X-Robots-Tag` and robots.txt must list the sitemap, while any
   other host must be noindex;
7. if a check fails: switches back to the previous release, restarts, checks
   again, and renames the bad release `*.failed`. If the build itself fails,
   the live site is never touched;
8. keeps the newest 3 good releases (always including the live one) and the
   newest failed one.

Then, as the admin, once, to enable the daily timer now that a release exists:

```bash
sudo bash /srv/catalunyainfo/current/ops/vps/provision.sh --files-only
systemctl list-timers catalunyainfo-cron.timer
```

Other commands: `catalunyainfo-deploy --list` (`*` marks the live release),
`catalunyainfo-deploy --rollback` (to the previous good release), and
`cat /srv/catalunyainfo/current/REVISION`.

### Why standalone, built on the server

- `output: "standalone"` emits `server.js` plus only the traced dependencies
  (about 150 MB). It was checked locally: `node .next/standalone/server.js`
  serves `/ca/`, `/es/`, `/en/` with 200, `/` with 307, robots.txt and the
  sitemap, and AVIF/WebP through sharp. The switch is in `next.config.ts` and
  only applies when `NEXT_OUTPUT=standalone`, which only `deploy.sh` sets, so
  Vercel's build is unchanged (a test asserts this). The same switch turns off
  Next's own gzip so that Caddy compresses (zstd/gzip).
- Also checked locally, with Caddy 2.11.7 running this Caddyfile's `next_app`
  block in front of `server.js`: `/ca/` is served with zstd (48 KB down to
  10 KB) or gzip, images are passed through uncompressed, and the Host-based
  noindex works through the proxy. A request sent while Node was stopped got a
  200 once Node was back, 2.5 s later, instead of a 502.
- 8 GB of RAM is plenty to build next to the running site (the service is
  capped at 3 GB), so build-on-server is the default.

### Alternative for a small-RAM server: build in GitHub Actions, rsync the result

Described only; no workflow file is in the repository. On a 2–4 GB server the
build competes with the live site for memory. Instead:

1. Add a workflow (on `workflow_dispatch`, or on push to `main`) running on
   `ubuntu-24.04` (same glibc and CPU architecture as the server, so sharp's
   prebuilt `linux-x64` binary in the bundle is the right one), with Node 24.
2. Store the **build-time** variables as GitHub Actions secrets
   (`APP_DATABASE_URL`, `NEXT_PUBLIC_ALLOW_INDEXING`, `SITE_ENV`,
   `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `ADSENSE_PUBLISHER_ID`). The database must
   accept connections from GitHub's runners (Supabase does by default).
3. Steps: `npm ci`, then `NEXT_OUTPUT=standalone npm run build`, then copy
   `public` and `.next/static` into `.next/standalone` as `deploy.sh` does.
4. Rsync over SSH as `deploy` (key in an Actions secret, with the server's host
   key pinned in `known_hosts`), into a new directory:
   `rsync -a --delete .next/standalone/ deploy@<VPS_IP>:/srv/catalunyainfo/releases/<name>/.next/standalone/`,
   plus `ops/vps/` and a `REVISION` file next to it.
5. Over SSH, run the second half of `deploy.sh`: the image-cache symlink,
   switch, restart, health checks, rollback, prune. The simplest route is a
   `--prebuilt <name>` mode in `deploy.sh` that skips fetch, `npm ci` and
   build; it does not exist yet.

The runtime secrets (`CRON_SECRET`, `RESEND_API_KEY`) stay on the server only.

## 5. Test before the cutover

Production traffic stays on Vercel throughout.

1. **On the server** (as `deploy`):
   ```bash
   curl -sI -H 'Host: www.catalunyainfo.com' http://127.0.0.1:3000/ca/ | grep -iE '^HTTP|x-robots|cache-control'
   curl -s  -H 'Host: www.catalunyainfo.com' http://127.0.0.1:3000/robots.txt | head
   journalctl -u catalunyainfo -n 50 --no-pager
   ```
2. **Preview hostname with a real certificate:** add a DNS record
   `A vps <VPS_IP>` (DNS only, with no Cloudflare proxy), uncomment the
   `vps.catalunyainfo.com` block at the end of `/etc/caddy/Caddyfile`, and run
   `sudo systemctl reload caddy`. Then browse `https://vps.catalunyainfo.com/ca/`:
   pages, images, search, a few content pages, `/admin` login (the Server
   Actions CSRF check depends on `X-Forwarded-Host`). Everything there is
   noindex because the host is not www. (Editing the installed Caddyfile is
   fine for this; the next `--files-only` puts the repository version back.)
3. **Or an SSH tunnel,** with no DNS involved:
   `ssh -L 3000:127.0.0.1:3000 deploy@<VPS_IP>`, then open http://localhost:3000/ca/.
4. **The cron job.** First look at `/admin`: the dashboard lists published
   pages whose review date has passed. The job sets those to `needs_update`,
   and **a `needs_update` page is no longer public** (the public queries
   require `published`). That is by design, but see the open question on
   whether the Vercel cron has been running. When the list is as intended:
   ```bash
   sudo systemctl start catalunyainfo-cron.service
   journalctl -u catalunyainfo-cron -n 20 --no-pager   # {"ok":true,"published":…}
   ```
   It is idempotent. Running on both Vercel and the VPS does no harm.

Before the cutover, Caddy logs failed ACME attempts for `www` and the apex,
because their DNS still points at Vercel. That is expected and harmless: Caddy
backs off and falls back to the staging CA.

## 6. Logs

| What | Where |
| --- | --- |
| Next.js (stdout/stderr, render errors) | `journalctl -u catalunyainfo -f` (deploy can read it without sudo) |
| Daily job | `journalctl -u catalunyainfo-cron`, `systemctl list-timers catalunyainfo-cron.timer` |
| Access log (JSON, 50 MiB × 10, 14 days) | `sudo tail -f /var/log/caddy/catalunyainfo.access.log \| jq -c '{ts,status,uri:.request.uri,host:.request.host,d:.duration}'` |
| Caddy itself (certificates, reloads) | `journalctl -u caddy` |
| Deploys | terminal output; `catalunyainfo-deploy --list`; `releases/*/REVISION` |
| SSH, bans | `journalctl -u ssh`, `sudo fail2ban-client status sshd` |
| Updates | `/var/log/unattended-upgrades/`, `/var/log/apt/history.log` |
| OOM kills, disk errors | `journalctl -k \| grep -iE 'oom\|i/o error'` |
| CPU and steal history | `sar -u` (today), `sar -u -f /var/log/sysstat/saDD` (day DD) |

## 7. The 14-day withdrawal window: what to check

Check the exact withdrawal terms in the Contabo contract first (consumer or
business customer). Measure on several days, at quiet hours and in the evening
peak (20:00–23:00). Write the numbers down; decide before day 12.

1. **CPU steal** (another tenant's load taking your vCPUs):
   ```bash
   vmstat 1 60          # column "st"
   mpstat -P ALL 1 60   # column "%steal", per vCPU
   sar -u               # 10-minute history since provisioning
   ```
   Average steal below 2–3% is good; sustained above 5% is a warning; above 10%,
   or bursts during builds, is a reason to withdraw.
2. **CPU consistency:** `sudo apt install sysbench`, then
   `sysbench cpu --threads=4 --time=30 run` morning and evening. "events per
   second" should not vary by more than about 15%. The build time `deploy.sh`
   prints is a real-world benchmark too.
3. **Disk:**
   ```bash
   cd /srv && sudo fio --name=rand --filename=/srv/fio.test --size=2G --rw=randrw --rwmixread=70 \
     --bs=4k --iodepth=32 --ioengine=libaio --direct=1 --runtime=60 --time_based --group_reporting
   sudo fio --name=seq --filename=/srv/fio.test --size=2G --rw=write --bs=1M --iodepth=8 \
     --ioengine=libaio --direct=1 --runtime=30 --time_based
   sudo rm /srv/fio.test
   ```
   Look at IOPS and the completion-latency percentiles: p99 under ~10 ms, and
   random reads in the thousands of IOPS or better.
4. **Response times.** On the server (no network), a cached ISR page should take
   well under 20 ms:
   `for i in $(seq 10); do curl -s -o /dev/null -w '%{time_starttransfer}\n' -H 'Host: www.catalunyainfo.com' http://127.0.0.1:3000/ca/; done`.
   From a machine in Catalonia, compare the preview host with Vercel:
   ```bash
   for u in https://vps.catalunyainfo.com/ca/ https://www.catalunyainfo.com/ca/; do
     for i in $(seq 10); do curl -s -o /dev/null -w "%{time_connect} %{time_appconnect} %{time_starttransfer}\n" "$u"; done; echo; done
   ```
   An uncached, database-bound request (internal search goes to Supabase in
   Ireland every time) shows the database latency:
   `curl -s -o /dev/null -w '%{time_total}\n' 'https://vps.catalunyainfo.com/ca/cerca/?q=montserrat'`.
5. **Load test.** On the server, against Node directly, which measures the app
   rather than your home connection:
   ```bash
   npx -y autocannon -c 50 -d 30 -H 'Host=www.catalunyainfo.com' http://127.0.0.1:3000/ca/
   ```
   In a second terminal, watch `vmstat 1` (steal, swap) and
   `systemctl status catalunyainfo` (memory). Expect zero errors, a p99 in the
   tens of milliseconds for cached pages, and no swapping. Repeat with
   `-c 10 -d 30` on a content page and on `/ca/cerca/?q=x`. Do not load-test
   www while it points at Vercel.
6. **Memory and stability:** `free -h`, `uptime`, the service's memory and peak
   (`systemctl status catalunyainfo | grep Memory`), and `journalctl -k` free
   of OOM or I/O errors after a few days.

## 8. DNS cutover (Cloudflare planned), with Vercel as the rollback

DNS today is at **Spaceship** (`docs/DEPLOYMENT.md`): `A @ 216.198.79.1`
(Vercel), `CNAME www → …vercel-dns-017.com`, `TXT _vercel`, and
`TXT google-site-verification` (**never delete**: Search Console). Export the
full zone from Spaceship first and keep it: there may be more records (mail,
Resend DKIM).

### 8a. Move DNS to Cloudflare, still pointing at Vercel (days before; nothing visible changes)

1. Cloudflare → Add a domain → `catalunyainfo.com` → Free plan. Compare the
   imported records with the Spaceship export, one by one. Set **every record to
   "DNS only"** (grey cloud) for now.
2. Before switching the nameservers, set the zone options from section 10 (SSL
   Full (strict), Always Use HTTPS off, AI-bot blocking and managed robots.txt
   off, and so on), so that nothing changes later by surprise.
3. At Spaceship: if **DNSSEC** is on, turn it off first and wait a day. Then
   replace the nameservers with Cloudflare's two.
4. Wait until Cloudflare shows the zone as **Active** and
   `nslookup -type=NS catalunyainfo.com 8.8.8.8` returns Cloudflare (allow up
   to 48 h). The site is still on Vercel throughout.
5. **Lower the TTL:** set `@` and `www` to TTL **1 min** (DNS-only records allow
   it). Wait at least the old TTL before 8b.

(If Cloudflare is postponed, do 8b on Spaceship: lower the TTL there to the
minimum it offers, a day ahead.)

### 8b. Switch (about 15 minutes, at a quiet hour such as 07:00 on a weekday)

1. Deploy the same commit Vercel serves: `catalunyainfo-deploy <sha>` (green
   health checks). Make no CMS publishes during the window.
2. In Cloudflare DNS, still **DNS only**:
   - `@`: edit the A record → `<VPS_IP>`;
   - `www`: delete the CNAME and add `A www <VPS_IP>`;
   - IPv6 (AAAA) only if `curl -6 https://vps.catalunyainfo.com/ca/` works from
     outside; otherwise add it later.
3. About a minute later, on the server: `sudo systemctl restart caddy` (a
   restart, not a reload: it forces an immediate certificate attempt) and
   watch `journalctl -u caddy -f` until both names report "certificate obtained
   successfully". Visitors whose resolvers switched in that first minute may
   see a TLS error briefly.
4. **Verify from outside** (no `x-vercel-id` header means the VPS answered):
   ```bash
   curl -sI https://www.catalunyainfo.com/ca/ | grep -iE '^HTTP|x-vercel|x-robots|strict-transport'   # 200, no x-vercel-id, no x-robots-tag
   curl -sI 'https://catalunyainfo.com/ca/?x=1' | grep -iE '^HTTP|location'      # 308 → https://www.catalunyainfo.com/ca/?x=1
   curl -sI http://www.catalunyainfo.com/ca/ | grep -iE '^HTTP|location'          # 308 → https
   curl -sI https://www.catalunyainfo.com/ | grep -iE '^HTTP|location|vary'        # 307 → /ca/ (or your language)
   curl -s  https://www.catalunyainfo.com/robots.txt | grep -i sitemap
   curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/sitemap.xml
   curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/1b9cd1c5da114656a9bd9c3cc29740c6.txt   # IndexNow key
   ```
   In a browser: a few content pages, images, the cookie banner (GA4 loads
   after consent), the contact form, and an `/admin` login.
5. Search Console: URL Inspection → "Test live URL" on the home page and two
   guides. In the following days, watch Settings → Crawl stats → Host status.
6. Run a publish command with the trailing slash (`/api/admin/publish/`, since
   `trailingSlash: true` answers the bare path with a 308), for example:
   `curl -X POST -H "Authorization: Bearer $(cat .cron-secret)" "https://www.catalunyainfo.com/api/admin/publish/?only=pages"`.
   The 60-second limit is gone: Caddy allows up to 5 minutes.
7. **Legal pages:** `src/lib/content/pages/operator.ts` (PROCESSORS: "Vercel
   Inc.", Paris), `legal.ts` (host "Vercel Inc.") and `privacy.ts` ("Paris
   region") must name Contabo (Germany) and, once proxied, Cloudflare. Deploy
   that content change the same day. It was deliberately not made yet, because
   it would be untrue while Vercel serves the site.

### 8c. Rollback (any time while Vercel is kept)

In Cloudflare DNS (or Spaceship), DNS only:
`A @ 216.198.79.1` and `CNAME www d624581fbef5aff0.vercel-dns-017.com` (or
`cname.vercel-dns.com`). With a 1-minute TTL, traffic is back on Vercel within
minutes. Vercel re-issues its certificate if it lapsed while DNS pointed away;
allow a minute.

Keep Vercel as the rollback for at least 2 weeks: do not remove the domain from
the Vercel project and do not delete the project or its variables. Vercel's
cron keeps running there; the job is idempotent, so that does no harm. After
the window: remove `crons` from `vercel.json` (or pause the project), and
consider disconnecting Vercel's Git integration so pushes stop building there.

### 8d. Turn on the Cloudflare proxy (after 1–3 stable days)

1. Caddy already holds valid Let's Encrypt certificates; check that SSL mode is
   **Full (strict)**.
2. Uncomment `trusted_proxies` and `client_ip_headers` in the Caddyfile's
   global block (check the ranges at https://www.cloudflare.com/ips/) and run
   `sudo systemctl reload caddy`.
3. Turn on the orange cloud for `@` and `www`, then repeat the checks in 8b.4.
   A `cf-ray` header now appears.
4. Rollback: switch the records back to DNS only (the VPS keeps serving), or
   point them at Vercel as in 8c.

## 9. Finish

- `--disable-root-login` (section 1, "Lock-out order").
- Remove the `vps` DNS record and comment the preview block out again.
- Take a Contabo snapshot.

## 10. Cloudflare (free) settings

Zone settings, set **before** the proxy is on:

| Setting | Value | Why |
| --- | --- | --- |
| SSL/TLS mode | **Full (strict)** | Caddy has real certificates. "Flexible" would loop with Caddy's HTTPS redirect. |
| Always Use HTTPS | **Off** | Caddy already redirects; leaving it off keeps Let's Encrypt HTTP-01 renewals through Cloudflare straightforward. |
| HSTS (Cloudflare) | Off | Next sends `Strict-Transport-Security` itself. |
| AI Crawl Control / "Block AI bots" / managed robots.txt | **Off** | The crawler policy lives in `src/lib/seo/robots-rules.ts` (Google-Extended welcome, ChatGPT/Bing search bring readers). New zones may block AI crawlers by default. |
| Bot Fight Mode | Off | It can challenge legitimate crawlers and monitoring. |
| Email Address Obfuscation (Scrape Shield) | **Off** | It rewrites HTML and injects a script that the CSP blocks. |
| Rocket Loader | **Off** | It breaks React hydration and the CSP. |
| Web Analytics automatic injection | **Off** | It injects a beacon the CSP blocks and the privacy policy does not mention. |
| HTTP/3, Brotli/zstd to visitors | On (defaults) | |

**Cache rules** (Caching → Cache Rules), created in this order. Cloudflare
applies every matching rule in order and, for conflicting settings, the last
matching rule wins, so the bypass goes **last**:

1. **Next static assets:** `starts_with(http.request.uri.path, "/_next/static/")`
   → Eligible for cache. Edge TTL: use the origin's Cache-Control (Next sends
   `public, max-age=31536000, immutable` on hashed files). Browser TTL: respect
   origin.
2. **Pages (HTML), only once the purge token is set** (below):
   ```
   (http.host eq "www.catalunyainfo.com" and http.request.uri.query eq "")
   ```
   → Eligible for cache. Edge TTL: **"Use cache-control header if present,
   bypass cache if not"**. Browser TTL: respect origin. Leave the cache key at
   its defaults (a custom key would stop purge-by-URL from matching) and add no
   request-method condition (Cloudflare evaluates cache rules during a purge
   with the method `PURGE`). Next sends `s-maxage=<revalidate>,
   stale-while-revalidate=…` on ISR/static pages and `private, no-store` on
   dynamic ones, so this caches exactly what Next says is shareable: 1 h for the
   home pages, a day for content (Cloudflare does not serve stale past
   `s-maxage`). Cloudflare does not hear `revalidatePath`; the purge does that
   job (below). **Only requests without a query string**: a `?utm_source=…` or
   `?fbclid=…` copy would be a separate cache entry that no purge-by-URL
   reaches; this way the bare URL is the only copy there is, and links with
   tracking parameters are served by the origin (from Next's ISR cache).
3. **Bypass:**
   ```
   (http.request.uri.path eq "/")
   or starts_with(http.request.uri.path, "/admin")
   or starts_with(http.request.uri.path, "/api/")
   or starts_with(http.request.uri.path, "/_next/image")
   or http.cookie contains "ci_session"
   or any(http.request.uri.args.names[*] eq "_rsc")
   or any(lower(http.request.headers.names[*])[*] eq "rsc")
   ```
   → **Bypass cache**. `/` is a per-language redirect (`Vary: Accept-Language,
   Cookie`, which Cloudflare ignores). `/_next/image` negotiates AVIF/WebP on
   `Accept` (`Vary: Accept`, ignored on the free plan), so a cached AVIF could
   reach a WebP-only client; the image optimiser's disk cache on the origin
   makes this cheap anyway. **The last two lines are the RSC bypass.** Client
   navigations and prefetches fetch an RSC payload from the *same path*, marked
   by an `rsc: 1` header and `?_rsc=<hash>`, where the hash covers the client's
   router headers (`next-router-state-tree`, `next-router-prefetch`, …), so its
   values cannot be enumerated and therefore cannot be purged by URL. Cloudflare
   ignores `Vary: rsc, next-router-*`, so these variants are simply never
   stored. The `rsc` header test also covers a request that sends the header
   without `_rsc`, which would otherwise be cached under the page's own key (an
   RSC payload served as the HTML). Client-side navigations therefore always
   reach the origin, which answers them from its ISR cache.

Without rule 2, Cloudflare caches only static files by extension and never
HTML, which is the safe starting point. **Rule 2 is safe once
`CLOUDFLARE_API_TOKEN` is set and a publish has shown `cdnPurge.ok: true`.** If
the token is ever removed, revoked or expires, turn rule 2 off first: pages
would otherwise stay stale for up to a day after each publish.

### Cloudflare purge (`src/lib/cdn/purge.ts`, `deploy.sh`)

Off by default: without `CLOUDFLARE_API_TOKEN` every purge is a no-op that
reports `{"skipped": true, "reason": "no-token"}` and `deploy.sh` behaves as
before.

**The token.** Cloudflare → My Profile → API Tokens → Create Token → Custom
token:
- Permissions: **Zone · Cache Purge · Purge**, and nothing else;
- Zone Resources: **Include · Specific zone · catalunyainfo.com**;
- optional, recommended: Client IP Address Filtering = the VPS's IP (the only
  place it is used), and an expiry date you will remember.

Put it in the env file with the zone id (`sudoedit
/srv/catalunyainfo/shared/.env.production`): `CLOUDFLARE_ZONE_ID=52705f5d3f9f9e7ca73726b78b245459`
and `CLOUDFLARE_API_TOKEN=<token>`, then `sudo systemctl restart catalunyainfo`.
`deploy.sh` reads the same file through its existing sudo rule (`sudo -n
/usr/bin/cat` of that file); no new sudoers rule is needed. The token reaches
`curl` on stdin and is never printed or logged.

**What is purged** (always `https://www.catalunyainfo.com/...` with the trailing
slash; files such as `/sitemap.xml` without it; the apex and `http://` are Caddy
redirects that are never cached):

| Trigger | Purged |
| --- | --- |
| `POST /api/admin/publish/?only=<group>` (`publish.sh`) | every URL it revalidates: each edition, its locale home, its section hub, `/sitemap.xml`. The JSON answer carries `cdnPurge`; `publish.sh` prints it |
| Nightly job (`/api/cron/publish-scheduled/`) | the weekend pages and holiday town pages it rebuilds, newly published entries with their homes and the sitemap, the day-dependent pages and the three homes. `cdnPurge` in the JSON |
| CMS save or status change, redirect saved | the same paths it revalidates, after the response |
| `catalunyainfo-deploy` (also `--rollback`, and the automatic rollback) | **everything**, once the release passes its health checks: a release changes every page's build id and chunk names |

Details: batches of 30 URLs (Cloudflare's table now allows 100 per call on
Free, at 800 URLs/s; 30 works under either), three calls in flight, 8 s timeout
each. Above 600 URLs (the town pages after a Catalonia-wide holiday are ~1,900)
one purge-everything replaces the batches (that kind of purge is limited to 5
per minute on Free, bursts of 25). `revalidatePath` in a route handler only
takes effect once the handler returns, so a visitor reaching Cloudflare in that
gap could re-cache the old page; the routes therefore purge again right after
the response (`after()`). A failed purge never fails the publish: it is logged
as `[cdn-purge] … failed` (`journalctl -u catalunyainfo | grep cdn-purge`) and
reported in the JSON. Re-run the publish, or purge by hand (Caching →
Configuration → Purge Cache).

Purge by prefix, hostname and tag are now listed for the Free plan too
(Cloudflare docs, Sep 2026), but are not used: a prefix such as `/ca/<section>/`
would also purge every article under it, and with the RSC variants never
cached, exact URLs are enough.

**Turning it on, in order:** (1) deploy this commit and run `provision.sh
--files-only` (it installs the new `deploy.sh`); (2) token and zone id in the
env file, restart; (3) publish one small group and check `cdnPurge` shows
`"ok": true`; (4) create rule 2 and the extended rule 3 above; (5) check: two
`curl -sI https://www.catalunyainfo.com/ca/ | grep -i cf-cache-status` in a row
give `MISS` then `HIT`; after a publish of a page, the next request for it is a
`MISS`; `curl -sI -H 'rsc: 1' https://www.catalunyainfo.com/ca/` and any URL
with `?_rsc=x` answer `BYPASS` (or `DYNAMIC`), never `HIT`.

Optional hardening once proxied: restrict ufw's 80/443 to Cloudflare's ranges.
The cost is that turning the proxy off then needs those ports reopened first.

## 11. ISR on a single self-hosted instance

**Where the cache lives.** The standalone server's `distDir` is
`/srv/catalunyainfo/current/.next/standalone/.next`:

| Content | Path |
| --- | --- |
| Prerendered and regenerated pages (HTML, RSC payload, metadata, segments) | `.next/server/app/<path>.html`, `.rsc`, `.meta`, `.segments/` |
| Static route handlers (`/llms.txt`, `/ads.txt`) | `.next/server/app/<path>.body` |
| `fetch` cache | `.next/cache/fetch-cache/` |
| Optimised images | `.next/cache/images/` → symlink to `shared/cache/images/` |
| Revalidation state (`revalidatePath` / tags) | **in memory** in the Node process |

An in-memory LRU of 50 MB sits in front of the disk (Next's default).

**It must be writable by the service user.** The release is built by `deploy`
and the service runs as `deploy`, with `ReadWritePaths=/srv/catalunyainfo` in
an otherwise read-only filesystem (`ProtectSystem=strict`). If the service is
ever moved to its own user, give that user write access to the release's
`.next` and to `shared/cache`, or every regeneration fails to save. Next keeps
serving, but it re-renders on every request.

**It is per release, so a deploy starts cold, as on Vercel.** Each release
starts from what its build prerendered: with the database present, that is
every published page, fresh as of the build. Pages not prerendered are rendered
on their first request and then cached.

**Keep it across releases?**
- **Pages: no.** Their HTML and RSC payloads reference that build's JavaScript
  chunks and build ID. Serving them from a new release risks hydration errors
  and 404s on chunks, and would hide the deploy's own changes.
- **Optimised images: yes, and `deploy.sh` does it** (symlink to
  `shared/cache/images`). Entries are keyed by source URL, width, quality and
  format, which do not depend on the build, so re-encoding AVIF on every deploy
  would only waste CPU. Risks: an image replaced at the *same* URL stays cached
  for up to `minimumCacheTTL` (30 days), the same as on Vercel; the project
  convention of a new filename per upload avoids it. Disk use is bounded by
  Next's LRU (`images.maximumDiskCacheSize`, by default 50% of the free disk at
  start-up). One process at a time, so no concurrent writers.
- **fetch cache: no.** Little to gain, and it could hand a new release data
  cached under old code.

**`revalidatePath` from the publish endpoints works on a single instance.**
`/api/admin/publish` and `/api/cron/publish-scheduled` run in the same Node
process that serves the pages. The call marks the paths' tags expired in that
process's memory, and the next request regenerates the page and rewrites it on
disk. That matches Next's self-hosting guide: with one instance the default
file-system cache is consistent with no extra configuration. Caveats:
1. The invalidation is in memory. If the service restarts *between* a publish
   and the next visit to a revalidated page, that page serves its old disk copy
   until its revalidate window (1 day for content). Re-run the publish (it is
   idempotent) or let the nightly job catch up. A deploy is not affected,
   because it prerenders from the database.
2. Run exactly **one** Node process. A second instance (cluster mode, a second
   unit) would need a shared cache handler, because invalidations would not
   reach it.
3. A CDN that caches HTML (Cloudflare rule 2) is not purged by
   `revalidatePath`. Every caller of `revalidatePath` also purges the same URLs
   at Cloudflare once `CLOUDFLARE_API_TOKEN` is set; see section 10.

Revalidation writes cost nothing here, so the one-day revalidate in
`[...slug]/page.tsx` could be shortened later if fresher pages help. That is a
separate decision, not part of the move.

## 12. Updating

| Task | How |
| --- | --- |
| Deploy a new version | `ssh deploy@<VPS_IP> catalunyainfo-deploy` (main) or `… catalunyainfo-deploy <sha>` |
| Roll back the app | `catalunyainfo-deploy --rollback` |
| Publish code-shipped content | as today, with the trailing slash: `POST https://www.catalunyainfo.com/api/admin/publish/?only=<group>` with the bearer token |
| Database migrations | as today, `POST /api/admin/migrate/` with the bearer token (it reads `drizzle/*.sql`, which is in the bundle) |
| Change `ops/vps` files | commit, deploy, then `sudo bash /srv/catalunyainfo/current/ops/vps/provision.sh --files-only` (deploy.sh warns when the installed copies differ) |
| Change a secret | `sudoedit …/.env.production`, then restart (run-time) or redeploy (build-time); section 3 |
| Purge Cloudflare's cache | automatic with `CLOUDFLARE_API_TOKEN` (publishes, nightly job, deploys; section 10); by hand: Cloudflare → Caching → Configuration → Purge Cache |
| Rotate `CRON_SECRET` | new value in the env file, restart, then update your `.cron-secret` (and Vercel's, while it is the rollback) |
| OS packages | security updates are automatic. Monthly: `sudo apt update && sudo apt full-upgrade`, which also brings Node 24.x patches and Caddy, then `sudo systemctl restart catalunyainfo`; reboot if `/var/run/reboot-required` exists |
| Next Node LTS | change `NODE_MAJOR` in `provision.sh`, re-run it, then redeploy |
| Service limits | `sudo systemctl edit catalunyainfo` (a drop-in survives `--files-only`) |

## 13. Vercel-specific behaviour: findings and changes

| Item | Finding | Action |
| --- | --- | --- |
| `x-vercel-*` request headers | None read anywhere in `src/`. | None |
| Geolocation headers (`x-vercel-ip-country`, …) | None. Locale = `Accept-Language` + the `ci_locale` cookie. | None |
| `VERCEL_ENV` in `next.config.ts` | `INDEXING_ALLOWED` required `VERCEL_ENV === "production"`. **On the VPS that is undefined, so every page would have sent `X-Robots-Tag: noindex`**, while robots.txt (already falling back to `NODE_ENV`) invited crawlers. | **Fixed**: uses `deployEnv()` |
| `VERCEL_ENV` in `src/proxy.ts` | Same strict check in `isIndexableRequest` (responses the proxy builds, such as `/`). | **Fixed**: uses `deployEnv()` |
| `deployEnv()` / `indexingAllowed()` (`src/lib/site.ts`) | Already treated "no VERCEL_ENV + NODE_ENV=production" as production. | Added the explicit `SITE_ENV` (production/preview/development) when `VERCEL_ENV` is absent. On Vercel, `VERCEL_ENV` is always set and still wins. |
| `VERCEL_URL`, `VERCEL_BRANCH_URL` | Used by `siteOrigin()` only outside production. On the VPS, production → `https://www.catalunyainfo.com`. `VERCEL_PROJECT_PRODUCTION_URL` is not used. | None |
| robots.txt host check (`src/app/robots.ts`) | Reads `Host`. Caddy and Cloudflare pass it through unchanged. Verified: www → crawlable with sitemap; any other host → `Disallow: /`. | None |
| Proxy runtime | Next 16's proxy defaults to the Node.js runtime and runs in `next start`/standalone with no Vercel API. It reads env at run time (`NEXT_PUBLIC_*` are inlined at build). Verified: `/` → 307 with `Vary: Accept-Language, Cookie`. | None |
| `X-Forwarded-*` | Next uses `X-Forwarded-Proto` for absolute redirect URLs and `X-Forwarded-Host`/`Host` for the Server Actions CSRF check. Caddy sends them. | Caddyfile |
| Apex → www | A Vercel domain redirect (308, path and query kept, HSTS). `next.config.ts`'s own fallback rule drops the trailing slash (`/ca?x=1`, an extra hop). | Caddy replicates Vercel's redirect exactly |
| `vercel.json` cron | `5 23 * * *` is **UTC** (Vercel crons always are) = 00:05 CET / 01:05 CEST. | systemd timer `23:05:00 UTC` |
| Cron path and `trailingSlash: true` | Production answers `/api/cron/publish-scheduled` (as registered in `vercel.json`) with **308** to the slashed path. As far as I know, Vercel Cron does not follow redirects, so **the nightly job may not be running on Vercel**; to confirm, look in Vercel's logs for the 23:05 UTC invocations. | The VPS timer calls the slashed URL. `vercel.json` left unchanged (the brief: no Vercel changes); open question |
| `vercel.json` `regions: ["cdg1"]` | Function region, Paris. | Contabo EU; database latency to Supabase Ireland, see section 7.4 |
| Image optimisation | Vercel's optimiser is replaced by Next's built-in one with sharp: verified AVIF/WebP negotiation, `Vary: Accept`, disk cache HIT. `remotePatterns` lists `*.public.blob.vercel-storage.com`, but no code uses Vercel Blob (images are in `public/images`). | jemalloc in the unit; image cache shared across releases |
| Vercel's CDN | Rewrote ISR `Cache-Control` to `public, max-age=0, must-revalidate` and purged on revalidate. Self-hosted Next sends `s-maxage=…, stale-while-revalidate=…`, which only matters if Cloudflare caches HTML. | Section 10 |
| `maxDuration = 60` (`/api/admin/publish`) | Vercel only; ignored here. The `?only=` slicing still works. | Caddy write timeout 330 s |
| `DATABASE_POOL_MAX=1` | Sized for serverless. | 5 on the VPS |
| CSP `connect-src *.vercel-insights.com` | Leftover; no Vercel Analytics package. Harmless. | None |
| Legal pages | Name Vercel Inc. (Paris) as host/processor. | Update at cutover (8b.7) |

Code changes (commits on this branch): `src/lib/site.ts` (`SITE_ENV`),
`next.config.ts` (`deployEnv()` for indexing; standalone + `compress: false`
behind `NEXT_OUTPUT=standalone`), `src/proxy.ts` (`deployEnv()`),
`tests/security.test.ts` (an environment matrix asserting that robots.txt and
the X-Robots-Tag rules agree in every Vercel and self-hosted environment, and
that the standalone switch is off unless requested), and `.gitattributes`
(`ops/vps/**` stays LF, so a Windows checkout cannot break the scripts).

## CMS access and publishing (since 2 Nov 2026)

`/admin` (and `/administrador`) is not public: Caddy redirects it to a joke
image, and `/api/admin/*` and `/api/cron/*` answer 404 from the internet.

- **CMS:** open a tunnel and browse locally:
  `ssh -L 3000:127.0.0.1:3000 marti@<server>` then `http://localhost:3000/admin/`.
- **Publishing content groups:**
  `ssh deploy@<server> 'bash /srv/catalunyainfo/current/ops/vps/publish.sh strikes voting'`.
- **Daily job:** the timer already calls `http://127.0.0.1:3000/api/cron/publish-scheduled/`.
