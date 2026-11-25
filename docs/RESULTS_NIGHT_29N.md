# Runbook: results night, general election of Sun 29 Nov 2026

Written 25 Nov 2026 (ci-enginyeria + ci-revisio). Design and research behind it:
`docs/elections-live-results.md`. No secrets in this file.

## 0. What the site does on the night (state on 25 Nov)

| Surface | On the night | Needs a deploy? |
| --- | --- | --- |
| Hub, comarca, town pages (ca/es/en), strip, guides | Switch by clock: 20:00 polls closed, 21:00 Canary Islands close and poll blackout ends, 30 Nov "after", 8 Dec "over". Routes revalidate every 60 s. | No |
| **Figures** (seats, votes, %, turnout, "escrutinio provisional" with % counted) | **None.** The live block (`src/lib/programmatic/elections/live/`) is a tested prototype wired to no page, route, timer or Caddy rule, and no data source exists (see 2). Pages show the "pending" line with links to the Interior election site and Infoelectoral, or the results site once `ELECTION_NIGHT_RESULTS_URL` is set. | Only to set the URL |
| Official town table (`elections:29n import`) | Only from Interior's **final** file `02202611_MUNI.zip`, which is published after the general count (4-7 Dec; the 2023 file was dated 4 months after the vote). The importer refuses anything not marked "Datos oficiales" = S. | Yes |

So on Sunday night the realistic outcome is **link-out only**. Never type
figures in, never hand-edit `snapshot.ts`, never scrape a results site.

## 1. Before the night (head, 26-28 Nov)

1. **26 Nov 14:00 onwards, in a browser** (scripts get 403): read Interior's
   notes (interior.gob.es, lamoncloa.gob.es Interior list,
   29neleccionesgenerales.es, Infoelectoral) for "resultados". Is a public
   results site announced? A download channel for it? Reuse terms?
   (`resultados.29neleccionesgenerales.es` answered 401 on 24 Nov: not public.)
2. Update `RESULTS_SITE_CHECKED` in `src/lib/programmatic/elections/results-night.ts`
   with the read date, the line the pages print and the test that fails until
   it is re-read (the head's task, not a worker's).
3. If a site is announced: set `ELECTION_NIGHT_RESULTS_URL` and
   `ELECTION_NIGHT_RESULTS_SOURCE` exactly as the note gives them, `curl` it and
   grep "resultados", run
   `node --test --experimental-strip-types --import ./tests/register-alias.mjs tests/results-night.test.ts tests/election-29n-flow.test.ts`,
   deploy, then publish the guides that print it:
   `ssh deploy@<server> 'bash /srv/catalunyainfo/current/ops/vps/publish.sh election-night election-results voting'`.
   **Freeze: nothing deployed after Sun 29 Nov 19:00.**
4. Decision on live figures (go/no-go list: `docs/elections-live-results.md` 2.9).
   Without a source with municipality granularity, reuse terms and a parsed real
   file, it is **no-go**. Do not start wiring on the 28th.
5. Check Cloudflare caching of the election HTML (read 25 Nov: `cache-control:
   s-maxage=60, stale-while-revalidate=31535940`, `cf-cache-status: HIT`
   on the second request):
   `curl -sI https://www.catalunyainfo.com/ca/eleccions/sabadell/ | grep -i -E 'cache|age'`
   (twice). Expect at most ~60 s edge lag plus one stale hit per route while
   Next regenerates in the background.
6. Rehearse the checks (no production): see 5.

## 2. Gaps and risks (read 25 Nov)

- **No import path for the night.** The only importer is the official final
  file. The live pipeline (adapter, checks, versioned files, render model,
  revalidation paths) is built and tested but has no real-source adapter, no
  ingest script, no timer, no page component, no route, no Caddy rule and no
  ca/es/en copy for "escrutinio provisional / X % escrutado". Wiring it is a
  feature (about a day), not a fix, and needs a source first.
- **Timing, if ever wired:** a systemd timer every 2 min was designed
  (installed disabled, enabled by hand about 19:50). Today there is no timer:
  a manual step would be the only way, and `elections:29n import` needs a
  deploy (the snapshot is compiled code), i.e. minutes, not seconds.
- **Partial counts and turnout:** `turnout = voters / electorate`. If a source
  gives the whole census with a partial count, turnout reads low until 100 %.
  The adapter for the real source must supply the census of the tables counted
  (or the page must label it); decide when the format is known.
- **Source slow or down:** designed behaviour is last good figures kept and,
  after 15 min without a successful fetch, `feedDown` (notice with the last
  Interior update time and the official link); a refused update never replaces
  files. With no source at all, the fallback is the pending line.
- **Provisional vs official:** night figures are Interior's provisional count
  (LOREG art. 98.2); the official result is the general count of the provincial
  boards (4-7 Dec, arts. 103.1 and 107.2) and the BOE (art. 108.6). The pages
  say so on the night, from 30 Nov in the past tense, and "over" from 8 Dec.
  The final-file table is labelled official, from the file's date.
- **Cache:** town pages revalidate every 60 s and Cloudflare caches the HTML
  for the same 60 s. The importer step (snapshot) is only visible after a deploy
  (which purges Cloudflare when the token is set).
- **After the night:** `node scripts/election-layer-end.mjs` on 8 Dec
  (`tests/election-day.test.ts` fails until then).

## 3. On the night (head, Sun 29 Nov, no deploys)

1. 19:55: `curl -sI https://www.catalunyainfo.com/ca/eleccions/barcelona/` (200),
   open ca/es/en hubs and one town in a browser: pre-close copy.
2. 20:00-21:00: pages show "closed, except the Canary Islands (until 21:00)";
   no figure anywhere. After 21:00 the poll blackout ends.
3. Watch the official site in a browser. If it appears and is not yet in
   `ELECTION_NIGHT_RESULTS_URL`: do NOT deploy; link-out stays as is. (If the
   freeze is lifted by the owner, the URL change is the only allowed edit.)
4. Watch `journalctl -u catalunyainfo -n 50 --no-pager` and Caddy 5xx rate.

## 4. Final file (from about 4-7 Dec, head only)

Download `02202611_MUNI.zip` in a browser: Infoelectoral download area,
Convocatoria = Congreso, Fecha = Noviembre 2026, row "29 de Noviembre de 2026
(Municipio)". Then, from the repo root:

```
npm run elections:29n -- import ~/Downloads/02202611_MUNI.zip --dry-run --preview sabadell
npm run elections:29n -- import ~/Downloads/02202611_MUNI.zip
npm test; npx tsc --noEmit -p .
```

Compare two or three figures with the download area's own tables; any refusal
means stop and read the message. Commit `src/lib/programmatic/elections/snapshot.ts`
only, deploy with `catalunyainfo-deploy`, then check
`/ca/eleccions/sabadell/`, `/es/elecciones/girona/`, `/en/elections/salou/`.
`npm run elections:29n -- status` says whether the slot is filled.

## 5. Dry runs that exist (no production data)

```
node --test --experimental-strip-types --import ./tests/register-alias.mjs \
  tests/election-live.test.ts tests/election-night-partial.test.ts \
  tests/election-29n-import.test.ts tests/results-night.test.ts tests/election-29n-flow.test.ts
node --experimental-strip-types --import ./tests/register-alias.mjs \
  scripts/elections-live-replay.ts tests/fixtures/interior/02202307 --out <scratch dir>
```

`election-night-partial.test.ts` plays synthetic 37 %, 62 % and 100 % updates
(2023 fixture counts cut down) through checks, versioned files and the render
model: provisional at every step, % counted travels with the figures, repeated
update changes no page, a step back is refused, a stalled feed keeps the last
figures. `elections-live-replay.ts` refuses `--out` under `/srv`.

## 6. Rollback

- Wrong link or wording shipped: revert the commit, deploy, publish the groups
  in 1.3. Last resort: `catalunyainfo-deploy --rollback` (previous release).
- Wrong final-file import: `git revert` the snapshot commit and deploy; the
  slot returns to the empty state ("results will appear when...").
- Live block (if it is ever wired): flag `ELECTION_LIVE_RESULTS` off plus
  restart, or point `current` back one version (design 2.7).
