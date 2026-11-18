# High-traffic runbook: 29N election night, 22 Dec lottery

Targets: 30,000+ sessions on Sunday 29 Nov 2026 (peak 20:00–23:00, results
from 20:00) and 100,000 on Tuesday 22 Dec (draw ~09:00–14:00). That is 20–100×
a normal day, arriving in minutes, not spread over the day.

One VPS (4 vCPU, 8 GB), Caddy, one Next.js standalone process on
127.0.0.1:3000 (`MemoryMax=3G`, heap `--max-old-space-size=2048`), local
PostgreSQL, Cloudflare Free in front (cache rules in `ops/vps/README.md` §10).
Written 18 Nov 2026 from that day's Caddy logs, `curl` against Cloudflare and a
localhost load test (§5).

## 1. What reaches the origin (measured 18 Nov 2026)

Everything in Caddy's access log got past Cloudflare: a Cloudflare HIT never
reaches the VPS. 18 Nov, 00:00–12:35, 46,615 requests:

| Class | Share | p50 | p95 | Next cache | Notes |
| --- | --- | --- | --- | --- | --- |
| RSC prefetch (`_rsc` / `rsc: 1`) | **41%** (55% from 08:00 to 12:00) | 24 ms | 242 ms | 86% HIT, 12% STALE | Never cached by Cloudflare (rule 3). 86% were for the targets of sitewide links (homes, menu hubs, footer, author page) |
| HTML | 20% | 62 ms | 503 ms | 53% HIT, 44% MISS | 60% from bots (Meta's `meta-externalagent`, ShapBot, OAI-SearchBot, bingbot, Googlebot). MISS = town pages rendered on first request after a deploy |
| Redirects / 304 | 17% | 5 ms | 53 ms | | Favicon / manifest revalidations, trailing-slash 308s |
| Images (`/_next/image`, `/img/`) | 17% | 92 ms | 474 ms | 98% HIT | Bypassed at Cloudflare on purpose (AVIF/WebP `Vary`) |
| Static, other, API | 5% | | | | |

No 5xx all day. Cloudflare, sampled with `curl -sI` twice per URL (§3): the
election hubs, the guides (strikes, lottery guide) and the home pages answer
`cf-cache-status: HIT` from the second request at a given Cloudflare colo
(each colo fills on its own, so a third request may still MISS elsewhere).
The polls page answers `DYNAMIC` (never cached, by design).

Cache-Control the origin sends (Cloudflare rule 2 obeys it; empty query only):

| Pages | Cache-Control | At Cloudflare |
| --- | --- | --- |
| Election hubs, comarca and town pages (from release 4c7895a, 18 Nov) | `s-maxage=300, stale-while-revalidate=…` | 5 min, purged on publish/deploy |
| Home pages | `s-maxage=3600, …` | 1 h |
| Guides / articles (`[...slug]`) | `s-maxage=86400, …` | 1 day, purged on publish |
| Gordo pages, holiday town pages (static) | `s-maxage=31536000` | until the next purge (deploy or publish) |
| Polls page, search | `private, no-store` + `Cloudflare-CDN-Cache-Control: no-store` | never |

During a deploy (`next build` on the same 4 cores, ~10 min) the origin slowed
down measurably: HTML p95 1,029 ms and RSC p95 574 ms in the 30 minutes of the
18 Nov 12:32 deploy, about twice the day's figures, and one `curl` timed out
at 15 s. **A deploy also purges all of Cloudflare.** Hence rule 1 below.

## 2. Before the day

- **No deploy and no `npm test` on the VPS from 2 h before a peak until it
  ends** (29 Nov 18:00–24:00; 22 Dec 07:00–15:00). Last code deploy for 29N by
  Saturday 28 Nov evening; last for the lottery by 21 Dec.
- Publishing a group is fine but purges and regenerates its pages: one group at
  a time, only what changed.
- After the last deploy, check the edge (§3, "Cloudflare") on the pages of the
  night: `/es/elecciones/`, `/ca/eleccions/`, `/en/elections/`, two town pages,
  the strikes hub, the home pages; for 22 Dec `/es/donde-ha-tocado-el-gordo/`,
  `/ca/on-ha-tocat-la-loteria-de-nadal/`, `/en/spanish-christmas-lottery-results/`
  and `/es/guias/loteria-de-navidad/`.
- Polls page (LOREG 69.7): 24 Nov 00:05 and 29 Nov 21:05, curl the three URLs:
  no figures, `cf-cache-status` never `HIT`. Inside the window the proxy
  serves the static blackout route (`src/lib/programmatic/polls/routing.ts`).
- Re-run the load test (§5) once after the last deploy, at an off-peak hour.
- Owner: decide the Cloudflare levers in §4 now and prepare them **disabled**,
  so turning one on during the night is a toggle, not an edit.

## 3. What to watch, from the VPS

Run each every few minutes during the peak. Thresholds are where to act (§4).

| What | Command | Act when |
| --- | --- | --- |
| CPU load (4 cores) | `uptime`; `sar -u 5 3` (sysstat is on) | load average above 6 for 5+ min, or idle under 15% |
| Memory | `systemctl show catalunyainfo -p MemoryCurrent`; `free -m` | service above 2.5 GB (limit 3G, heap 2 GB) or swap growing |
| OOM / restarts | `sudo journalctl -k --since "1 hour ago" \| grep -i oom`; `systemctl show catalunyainfo -p NRestarts -p ActiveEnterTimestamp` | any |
| 5xx, origin req/s, latency per class | `sudo tail -n 50000 /var/log/caddy/catalunyainfo.access.log \| python3 -I scripts/origin-mix.py --minutes 10` | any 5xx burst; HTML p95 > 1,000 ms or RSC p95 > 800 ms for 10 min |
| App errors | `sudo journalctl -u catalunyainfo --since "10 min ago" \| grep -i -E "error\|timeout\|cdn-purge"` | repeated errors, `cdn-purge … failed` |
| PostgreSQL | `sudo -u postgres psql -Atc "select state, count(*) from pg_stat_activity group by 1"` | many `active` for minutes |
| Cloudflare | `curl -sI https://www.catalunyainfo.com/es/elecciones/ \| grep -i -E "cf-cache-status\|age\|cache-control"` (twice) | second answer not `HIT`; owner: dashboard → Caching → percent cached |

`scripts/origin-mix.py` also takes a whole day:
`sudo zcat -f /var/log/caddy/catalunyainfo.access*.log* | python3 -I scripts/origin-mix.py --day 2026-11-29`.

## 4. Emergency levers, cheapest first

**a. Cloudflare "Cache Everything" for the hot paths (owner, dashboard, ~2 min).**
Caching → Cache Rules → new rule, placed **before** rule 3 (the bypass must stay
last: for conflicting settings the last matching rule wins, which keeps RSC
requests, `/api/`, `/admin`, cookies and the polls page uncached):

```
(http.host eq "www.catalunyainfo.com" and (
  starts_with(http.request.uri.path, "/es/elecciones/")
  or starts_with(http.request.uri.path, "/ca/eleccions/")
  or starts_with(http.request.uri.path, "/en/elections/")
))
```

(for 22 Dec: `/es/donde-ha-tocado-el-gordo/`, `/ca/on-ha-tocat-la-loteria-de-nadal/`,
`/en/spanish-christmas-lottery-results/`, `/es/guias/loteria-de-navidad/`.)
→ Eligible for cache; Edge TTL **"Ignore cache-control header and use this
TTL": 300 s** (the pages' own ISR interval: shorter only adds origin
refreshes, longer delays the 20:00 phase change); Browser TTL: respect origin;
Cache key → Query string → **Ignore query string**, if the plan offers it.
What it adds over rule 2, which already caches these pages for 5 min: links
shared with `?utm_…` / `?fbclid=…` (WhatsApp, social) stop reaching the
origin one by one, and the TTL no longer depends on what Next sends.
Freshness: at most 5 min stale, as now; purge-by-URL still works (the key is
the bare URL). Check: `curl -sI
'https://www.catalunyainfo.com/es/elecciones/?utm_source=x'` twice → `HIT`;
`curl -sI -H 'rsc: 1' …/es/elecciones/` → never `HIT`. Turn it off the day
after.

If "Ignore query string" is not available: Rules → Transform Rules → Rewrite
URL, same paths and `not any(http.request.uri.args.names[*] eq "_rsc")`,
query → rewrite to empty. Analytics reads the `utm_` values in the browser, so
they are not lost.

**b. Challenge aggressive crawlers during the peak (owner, Security → WAF →
Custom rules, Managed Challenge or Block, 18:00–24:00 only).** Bots were 60% of
origin HTML on 18 Nov. Candidates: `meta-externalagent` (Meta's AI crawler,
4,600 requests on 18 Nov; not `facebookexternalhit`, the link-preview bot,
which shares need) and `ShapBot` (2,900). Never Googlebot, Bingbot or the
search bots the crawler policy welcomes (`src/lib/seo/robots-rules.ts`).
Plus a **rate-limiting rule** (Security → WAF → Rate limiting rules; the Free
plan allows one, with short windows): requests per IP to paths without
`/_next/` above ~60 in 10 s → Managed Challenge. A sweep like the one in §5
(430 town pages in 4 minutes from one client) trips it; a reader never does.
Verified bots are exempt if the rule adds `not cf.client.bot`.

**c. Raise the ISR intervals (code + deploy: before the day, never at the
peak).** Election routes have `export const revalidate = 300` (hub, comarca,
town pages, all three languages, under `src/app/(public)/[locale]/eleccions|elecciones|elections/`);
600–900 s halves the regenerations; Cloudflare follows, since it obeys
`s-maxage`. Homes 3600, guides 86400, gordo pages static (refreshed by the
deploy that commits the snapshot, `docs/GORDO_NAVIDAD_RUNBOOK.md`).

**d. Restart the app if memory runs away.** `sudo systemctl restart catalunyainfo`:
1–3 s, Caddy retries the dial for 20 s, so visitors wait rather than get a
502. The in-memory revalidation state is lost: re-run the last publish
(`ops/vps/README.md` §11).

**e. Roll back a bad release.** `sudo -u deploy catalunyainfo-deploy --rollback`.
It purges all of Cloudflare too, so only for a broken release, not for load.

Not levers: deploying at the peak (cold Cloudflare, 10 min of CPU), publishing
many groups at once, running builds or tests on the VPS, a second Node process
(the ISR cache and revalidation are per process, README §11).

## 5. Load test (localhost only, never through Cloudflare)

`ab` (ApacheBench) is installed. Straight to the standalone server, with the
headers Caddy sends, so Cloudflare, Caddy and the visitors' bandwidth are out of
it and the result is the app's own capacity. The live site is served by the
same single Node process, so a load test **delays real visitors while it
runs**. Rules: off-peak; no deploy, build, `tsc` or test run in progress
(`pgrep -fa '^(/usr/bin/)?node .*(--test|tsc --noEmit)|^sh -c next build'`
empty: a plain `pgrep -f "node --test"` also matches other sessions' waiting
shells); start at `-c 5`; `-c 20` only for a few seconds; stop if `uptime`
passes 4.

```bash
H='-H Host:www.catalunyainfo.com -H X-Forwarded-Proto:https -H Accept-Encoding:gzip'
ab -q -k -n 300 -c 5  $H http://127.0.0.1:3000/es/elecciones/
ab -q -k -n 300 -c 5  $H http://127.0.0.1:3000/es/elecciones/barcelona/
# only if the box is quiet, a few seconds each:
ab -q -k -n 600 -c 20 $H http://127.0.0.1:3000/es/elecciones/
ab -q -k -n 600 -c 20 $H http://127.0.0.1:3000/es/elecciones/barcelona/
```

Read "Requests per second", "Failed requests" and the 95% line of "Percentage
of the requests served within a certain time". While it runs, the live
latency is in Caddy's log (`scripts/origin-mix.py --minutes 2`); `ab` itself
never appears there.

**Results, 18 Nov 2026, 13:19–13:21, release eed28d8** (Next cache HIT on
every request; 1-min load 2.5–3.7 before each run, other agents' jobs on the
box; 0 failed, 0 non-2xx):

| Page | Size (uncompressed) | `-c 5` | `-c 20` |
| --- | --- | --- | --- |
| `/es/elecciones/` (hub) | 392 KB | 49 req/s, p50 70 ms, **p95 274 ms**, p99 656 ms | 67 req/s, p50 257 ms, **p95 465 ms**, p99 1,610 ms |
| `/es/elecciones/barcelona/` (town) | 378 KB | 67 req/s, p50 61 ms, **p95 134 ms**, p99 405 ms | 63 req/s, p50 276 ms, **p95 542 ms**, p99 639 ms |

What it means:
- **The origin's ceiling is about 50–70 pages/s** for these pages even from
  the cache: throughput does not grow from 5 to 20 concurrent, latency does.
  It is one Node process (README §11), and each page is ~380–390 KB of HTML
  before Caddy compresses it (Caddy's compression comes on top).
- **Cloudflare is what makes the night possible.** HTML for the election and
  lottery pages must come from Cloudflare (rule 2; lever 4a for query
  strings). What cannot: client-side navigations and prefetches (RSC, never
  cached). Since 18 Nov the sitewide links prefetch only on intent, which
  should remove most of the 41% of origin requests that RSC prefetches were
  that day; check with `scripts/origin-mix.py` after the deploy.
- The `-c 20` runs held live requests up: during each ~10 s run a handful of
  real visitors waited 2–6 s (Caddy log). Do not repeat them near a peak.
- Not measured: the polls page under load. Single requests to its dynamic
  render took 0.3–1.6 s on the busy box against 0.03–0.15 s for the cached
  hub, which is why it is static during the blackout now.

Also seen on 18 Nov right after the 13:10 restart: one client with a desktop
Chrome user agent requested ~430 `/es/festivos/<town>/` pages in 4 minutes,
nearly all Next MISS (town pages not prerendered render on first request),
and live HTML p95 went above 5 s for a minute. A deploy before a peak invites
exactly that, and it is what lever 4b and a rate limit are for.

## 6. Code changes made with this runbook (18 Nov 2026)

- Sitewide links no longer prefetch on entering the viewport: header menu,
  wordmark and breadcrumbs prefetch on intent (hover, focus, touch;
  `src/components/nav/IntentLink.tsx`, the "Hover-triggered prefetch"
  pattern of the Next 16 prefetching guide); footer and article byline use
  `prefetch={false}` (the guide's "Disabled prefetch"). Clicks still
  navigate client-side. Guard: `tests/footer-links.test.ts`.
- Polls page: static during the LOREG 69.7 window. The proxy reads the clock
  per request and rewrites the three public URLs to
  `/<locale>/internal-polls/blackout/` (prerendered, figure-free, cannot
  import the figures) from 24 Nov 00:00 to 29 Nov 21:00; outside the window
  the force-dynamic route renders per request as before, and if the proxy
  did not run that route's own clock check still applies.
  `src/lib/programmatic/polls/routing.ts`, tests in
  `tests/polls-blackout.test.ts` (every boundary, matcher compiled with
  Next's own compiler).
- HTML cache headers: no change needed. Next already sends
  `s-maxage=<revalidate>, stale-while-revalidate=…` on every ISR page;
  Cloudflare rule 2 obeys it; every `revalidatePath` caller (publish, the
  nightly job, CMS saves) purges the same URLs and a deploy purges
  everything (README §10). Verified 18 Nov: MISS then HIT, `s-maxage=300` on
  the election pages.
- `scripts/origin-mix.py`: the origin request mix and latency from Caddy's
  log (§3).
