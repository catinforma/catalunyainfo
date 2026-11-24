# Runbook: ¿Dónde ha tocado el Gordo? (22 December 2026)

Pages: `/es/donde-ha-tocado-el-gordo/`, `/ca/on-ha-tocat-la-loteria-de-nadal/`,
`/en/spanish-christmas-lottery-results/`, the checker `/es/comprobar-loteria-navidad/`,
`/ca/comprovar-loteria-nadal/`, `/en/check-spanish-christmas-lottery-ticket/` (with
its JSON `/data/loteria-navidad.json`), plus `<provincia>/` and
`<provincia>/<municipio>/` pages that exist **only** once the committed
snapshot (`src/lib/programmatic/gordo/snapshot.json`, `null` until the day)
lists a point of sale there. Code: `src/lib/programmatic/gordo/` and
`src/lib/programmatic/lottery-check/` (checker: programme, engine, copy). Script:
`scripts/gordo-snapshot.py`. Tests: `tests/gordo-navidad.test.ts`,
`tests/lottery-check.test.ts` (fixtures in `tests/fixtures/gordo/` are TEST DATA).

## Before the day

- Deploy this code once and publish `gordo-navidad gordo-navidad-links`, then
  IndexNow the three hubs (commands below).
- When SELAE publishes the 2026 Christmas dossier (2025's: 16 Dec) with the
  start time, fill `DRAW_TIME_2026` in `src/lib/content/batch02/loteria-nadal.ts`
  (the hub reads it too), deploy, publish `loteria-nadal gordo-navidad`.

## The checker ("Comprobar Lotería de Navidad"), before the day

- First go-live: deploy, publish `comprobar-loteria` (the three pages and the
  JSON; `gordo-navidad` republishes the hubs with their new link), then
  `python3 scripts/indexnow-sitemap.py /es/comprobar-loteria-navidad/ /ca/comprovar-loteria-nadal/ /en/check-spanish-christmas-lottery-ticket/`.
  The lottery guide's new link line goes out with `loteria-nadal` **after the
  1 Dec review** of its 13 Nov body change (docs/SEO_EXPERIMENTS.md).
- Until the snapshot has a Gordo the page shows no form: what the checker will
  do, the 2026 programme per décimo and per euro, the derived-prize rules and
  the official ways to check.
- **Confirm the programme by 14 Dec** (a test fails from then): the counts and
  amounts are SELAE's 2026 programme (read 31 Oct); the wording of which
  numbers win aproximaciones, centenas, terminaciones and reintegro comes from
  the last programme the BOE published (BOE-A-2010-19540; none since 2011) and
  is shown as "pendiente de confirmar". On the owner's PC, open
  https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/programas%20de%20premios/PROGRAMAS_PREMIOS_CUARTO_TRIMESTRE_2026_SABADOS.pdf
  (Christmas page, p. 12 in 2026), or run `fetch` there (it now saves
  `programa.pdf`), copy the directory to the server and run
  `python3 -I scripts/gordo-snapshot.py programme --dir <dir>`: every line must say
  `ok`. If the text matches `QUOTE` in `src/lib/programmatic/lottery-check/programme.ts`
  (with 99.999 for 84.999), set `PROGRAMME_CONFIRMED` there (the command prints the
  line), gate, deploy, publish `comprobar-loteria`. If it differs, change the
  engine and its tests to the 2026 wording first.

## Readiness check, 13 Nov 2026: SELAE blocks the VPS

On 13 Nov 2026 every SELAE URL answered **HTTP 403 "Access Denied" (Akamai)**
to the production VPS (84.46.242.202), with a browser User-Agent: the
`buscadorSorteos` draw record (2025 query), `/es/loteria-nacional`, the help
pages and the PDFs on both `www.loteriasyapuestas.es` and `www.selae.es`
(WebFetch got 403 too). `fetch` will therefore fail on the server on 22 Dec
unless the block lifts. Re-tested 20 Nov 2026: still 403 (the Lotería
Nacional page, the Q4 2026 and Q1 2027 programme PDFs, `buscadorSorteos` for
22 Dec 2026, selae.es's press room; WebFetch 403 too), and a BOE search found
no 2026 programme resolution. Do not try to get round the block. Plan:

1. ~18-20 Dec: re-test from the server
   (`curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0" "https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&celebrados=true&fechaInicioInclusiva=20251222&fechaFinInclusiva=20251222"`).
2. If still 403, on the day the owner (or the PC agent) runs
   `python3 -I scripts/gordo-snapshot.py fetch --year 2026 --dir <dir>` on the
   Windows PC (residential IP), or saves the URLs from a browser as
   `draw.json` and `prize-<ordinal>.html` (and, for the checker, the Lista
   Oficial as `lista-oficial.pdf` once it is out, and `pedrea.txt` if the draw
   record carries no pedrea: see "The checker on the day"), and copies the
   directory to the server (`scp -r <dir> claude@84.46.242.202:~/gordo/`);
   then run `build` and the rest of the steps below on the server.
3. Loteries de Catalunya (La Grossa, 31 Dec) answered 403 to the server the
   same day: plan its results the same way. The La Grossa (31 Dec) and El
   Niño (6 Jan) checkers have their own runbook: docs/GROSSA_NINO_RUNBOOK.md
   (`gordo-snapshot.py ... --game grossa|nino`).

The page code does not depend on the fetch: until `snapshot.json` changes,
the hubs keep their pre-draw state, and from 23 Dec `tests/loteria-nadal.test.ts`
fails while `RESULTS_2026` is null (from 24 Dec while the Catalan points of
sale of the top three prizes are null).

## Official sources (SELAE only)

- Numbers: SELAE's draw record,
  `https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&celebrados=true&fechaInicioInclusiva=20261222&fechaFinInclusiva=20261222`
  (the script falls back to `celebrados=false` while the draw is open).
- Points of sale, one page per prize ("PUNTOS DE VENTA RELACIONADOS"):
  `https://www.loteriasyapuestas.es/es/premios/{primer|segundo|tercer|cuarto|quinto}-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-2026`
  (404 until SELAE publishes each one).
- The Lista Oficial de Premios PDF (afternoon) is the only list valid for
  payment; its URL appears in the draw record (`urlListadoOficial`).
- No BOE resolution exists for the 2026 programme (last one: 2010,
  BOE-A-2010-19540; re-checked 18 Nov 2026: none after 5 March 2011). SELAE's
  press room answers 403 to scripts: read it in a browser if needed.
- The checker's pedrea: the draw record's one list of five-digit `decimo`
  entries besides the top prizes (the script discovers the key and prints it on
  `fetch`; the format could not be seen from the server in Nov 2026), checked
  against the Lista Oficial PDF (`urlListadoOficial`; 2025's was
  `.../listas%20de%20premios/SM_LISTAOFICIAL.A2025.S102.pdf`, and `fetch` also
  tries `SM_LISTAOFICIAL.A2026.S102.pdf`).

## Live feed: the numbers go out WITHOUT a deploy (24 Nov 2026)

A deploy takes ~9 min, purges the whole CDN and is banned 22 Dec 07:00-15:00
(docs/HIGH_TRAFFIC_RUNBOOK.md). So the checker (`/data/loteria-navidad.json`)
and the live numbers box on the three hubs read their numbers at request time
from a file, not from the build:

- File: `$LOTTERY_LIVE_DIR/navidad.json` (default
  `/srv/catalunyainfo/live/lottery/`, owned by the deploy user, so writing a
  file needs no root; deliberately not under the root-owned `shared/` that holds
  the env file; `grossa.json`, `nino.json` for the other two). It is the same snapshot `build` writes into the repository, with
  `--out`. Code: `src/lib/programmatic/lottery-live/` (feed.ts, feeds.ts).
- The route validates it with the committed snapshot's own validator (SELAE
  hosts only, five-digit strings with their zeros, counts that follow the
  programme, no test data). A bad file is refused and the last good one keeps
  being served; the JSON says so in `warning` (`invalid`, `regressed`,
  `unreadable`) and `feed` says `live`, `committed` or `none`.
- A draw only grows: a file with FEWER numbers than the one served is refused
  (`regressed`). To correct a wrong number or take the feed down, delete the
  file first (that resets the state), then write the right one.
- The richer of the live file and the committed snapshot is served (equal: the
  newer `readAt`), so the post-draw deploy never goes backwards. After it the
  live file may stay.
- The answer is cached 30 s at Cloudflare (`s-maxage=30, stale-while-revalidate=60`)
  and 15 s in browsers; the visitor's page asks again every minute on the
  draw day until all numbers are in. Nothing to purge: a new file is on screen
  in about a minute.
- The page always renders the checker; the phase text is the clock plus the
  data: before the draw day "pendiente: el sorteo es el 22 de diciembre",
  on the day with no numbers "pendiente: todavía no hemos cargado números
  oficiales", with some numbers "hasta ahora (leídos a las HH:MM)", with all
  "todos", the day after with none "no están cargados: comprueba en SELAE".
  The link to SELAE is always there. No draw start time is needed.
- If the feed fails in the visitor's browser, the numbers already shown stay
  with a warning and the time they were read.

What still needs a deploy (do it after 15:00 on 22 Dec, one deploy): the
server-rendered tables of the numbers (pedrea by thousand), the page titles and
descriptions that name the Gordo, the province and municipality pages with
points of sale, the sitemap and the home-page cards. They were never the
peak's need; the first screen (numbers, checker, official link) is live.

### One-off setup (by 14 Dec; the date guard fails from 18 Dec)

```bash
sudo install -d -m 755 -o deploy -g deploy /srv/catalunyainfo/live /srv/catalunyainfo/live/lottery
# the service only reads it; the files must stay world-readable (a 600 file is reported as "unreadable")
sudo -u deploy sh -c 'echo probe > /srv/catalunyainfo/live/lottery/.probe && rm /srv/catalunyainfo/live/lottery/.probe'   # the account that writes on the day can write as deploy
curl -s -H 'Host: www.catalunyainfo.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3000/data/loteria-navidad.json   # "feed":"none" (or committed), "available":false
curl -sI https://www.catalunyainfo.com/data/loteria-navidad.json | grep -i -E "cache-control|cf-cache-status"           # s-maxage=30; HIT on the 2nd
```

Then fill `LIVE_FEED_CHECKED` in `src/lib/programmatic/lottery-live/feed.ts`
(who, when, how). The deploy that ships this code has to be done before 21
Dec ("last for the lottery by 21 Dec"); until it is, the old static JSON
(`s-maxage=300`) is what production serves.

### Dry run (13-14 Dec, any quiet hour)

Write a file by hand into a scratch directory and point a local instance at it
(`LOTTERY_LIVE_DIR=<scratch> npm run start`), or run `tests/lottery-live.test.ts`,
which does exactly this against the route. Never put test data in the
production directory: the validator refuses it.

## On 22 December (repeat every 30-60 min as SELAE adds pages)

**Numbers: no deploy, no commit, no `npm test`.** On the server, or on the
owner's PC and then `scp` (SELAE answers 403 to the server, see above):

```bash
D=~/gordo/run-$(date +%H%M)          # a NEW directory each time, outside the repo
python3 -I scripts/gordo-snapshot.py fetch --year 2026 --dir "$D"
L=/srv/catalunyainfo/live/lottery        # owned by deploy
python3 -I scripts/gordo-snapshot.py build --year 2026 --dir "$D" --out "$D/navidad.json"   # REFUSED = nothing written
sudo -u deploy cp "$D/navidad.json" "$L/navidad.json.new" && sudo -u deploy mv "$L/navidad.json.new" "$L/navidad.json"   # copy then rename: the service never sees half a file (as the deploy user, no sudo needed)
curl -s -H 'Host: www.catalunyainfo.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3000/data/loteria-navidad.json | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["feed"], d["warning"], d["available"], d["complete"], d["readAt"], d["draw"]["first"] if d["draw"] else None)'
```

On screen in about a minute (Cloudflare 30 s plus the visitor's 60 s poll).
Repeat as numbers come out: each run overwrites the file with a snapshot that
holds at least as many numbers.

**After 15:00 only** (outside the peak window), once the Lista Oficial and the
points of sale are in: one deploy with the final snapshot, the old procedure,
now only for the server-rendered pages. The old chain before 15:00 purges the
CDN and loads the origin at the peak: do not run it.

From the main checkout (`~/catinfov2`, up to date with `origin/main`):

```bash
python3 -I scripts/gordo-snapshot.py build --year 2026 --dir "$D"   # writes snapshot.json; REFUSED = nothing written
npm test > /tmp/x.log 2>&1; grep -q "^ℹ fail 0$" /tmp/x.log && npx tsc --noEmit && echo GATE-OK
git add src/lib/programmatic/gordo/snapshot.json scripts/data/gordo-locality-aliases.json
git commit -m "Gordo 2026: SELAE snapshot $(date +%H:%M)" && git push
sudo -u deploy catalunyainfo-deploy main
sudo -u deploy bash /srv/catalunyainfo/current/ops/vps/publish.sh gordo-navidad   # retry up to 3x on "-> 500"; also revalidates + purges the checker and its JSON
python3 scripts/indexnow-sitemap.py /es/donde-ha-tocado-el-gordo/ /ca/on-ha-tocat-la-loteria-de-nadal/ /en/spanish-christmas-lottery-results/ /es/comprobar-loteria-navidad/ /ca/comprovar-loteria-nadal/ /en/check-spanish-christmas-lottery-ticket/
```

### The checker on the day

- `build` prints `pedrea: N (draw record, <key>)` or `(pedrea.txt)` and, with
  `lista-oficial.pdf` (or `.txt`) in the directory, `all N numbers are on the
  Lista Oficial`. It REFUSES a pedrea with repeats, a top-prize number (a list
  of every extraction is fine once it holds all top numbers drawn so far: they
  are left out), more than 1,794 numbers, several candidate lists, or a number
  missing from the official list. WARNING while fewer than 1,794 are in: the
  checker then answers "not among the numbers published so far", never "no
  prize".
- If the pedrea is refused or missing and the Gordo must go out now:
  `build ... --no-pedrea` (the checker says the list is not in yet), then fix
  the pedrea on the next run.
- If the draw record has no pedrea list: make `pedrea.txt` (one five-digit
  number per line) from the Lista Oficial, e.g.
  `pdftotext -layout "$D/lista-oficial.pdf" - | grep -oE '(^|[^0-9])[0-9]{5}([^0-9]|$)' | grep -oE '[0-9]{5}' | sort -u > "$D/pedrea.txt"`,
  then check by eye that it is 1,794 numbers (1,807 with the top ones) before
  `build`: the list may also print derived prizes or page furniture, and
  `build` refuses anything that does not add up. If the PDF prints the numbers
  by thousand (only the last three digits), do not guess: build with
  `--no-pedrea`.
- Verify: `curl -s https://www.catalunyainfo.com/data/loteria-navidad.json | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["available"], d["complete"], d["readAt"], len(d["draw"]["pedrea"] or []))'`;
  type the Gordo, one of its neighbours and three pedrea numbers into
  `/es/comprobar-loteria-navidad/` and compare with SELAE's own checker in a
  browser.

- `build` prints one line per prize and WARNINGs. "matches no single INE
  municipality" = SELAE wrote a locality that is not a municipality name: it is
  listed with SELAE's spelling and gets no page. To give it a page, add an
  entry to `scripts/data/gordo-locality-aliases.json` **only after** checking
  in the INE Nomenclátor (https://www.ine.es/nomen2/index.do) that it is an
  entity of that municipality, with where/when you checked in `source`.
  Seen in 2023-2025 (not verified, do not add blind): LAS PALMAS GC, PALMA DE
  MALLORCA, SAN LORENZO DEL ESCORIAL, VECINDARIO, GERNIKA, VIELHA.
- "province ... is unknown": SELAE used a new spelling; add it to
  `PROVINCE_LABELS` in the script.
- If SELAE blocks the script (HTTP 403): open the same URLs in a browser and
  save them into a new directory as `draw.json` and `prize-<ordinal>.html`,
  then run `build` on it.
- The Catalan guide: `python3 -I scripts/gordo-snapshot.py catalonia` prints
  `RESULTS_2026` for `loteria-nadal.ts` (once all 13 numbers are out; fix any
  WARNING by hand), then gate, deploy, publish `loteria-nadal`.

## Verify

```bash
curl -s https://www.catalunyainfo.com/data/loteria-navidad.json | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["feed"], d["warning"], d["draw"]["first"])'   # the live feed; the number keeps its zeros
curl -s https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/ | grep -c "<GORDO NUMBER>"   # only after the post-15:00 deploy: the server-rendered HTML
curl -s -o /dev/null -w "%{http_code}\n" https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/<provincia>/   # 200 for a listed province
curl -s -o /dev/null -w "%{http_code}\n" https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/no-existe/    # 404
curl -s https://www.catalunyainfo.com/sitemap.xml | grep -c "donde-ha-tocado-el-gordo"
```

Compare two or three outlets against SELAE's own prize page by hand.

## Roll back

Live numbers: delete `/srv/catalunyainfo/live/lottery/navidad.json`, then
curl the ORIGIN (not the public URL, which Cloudflare may answer from its copy
for 30 s) until it says `"feed":"committed"` or `"none"`:

```bash
curl -s -H 'Host: www.catalunyainfo.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:3000/data/loteria-navidad.json | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["feed"], d["warning"])'
```

The state resets on that first request that finds the file missing. The page is
then back to the committed snapshot ("pending" before the draw), within about a
minute for visitors. **To correct a wrong number, do NOT write the corrected
file until that curl shows `committed`/`none`**: a corrected file with fewer
numbers than the one still held would be refused as `regressed`. After the
curl, write the new file as in "On 22 December".

Server-rendered pages: set `snapshot.json` back to the previous commit (or `null`: every province and
municipality page 404s again and leaves the sitemap, and the checker goes back
to its pre-draw page), gate, deploy, publish `gordo-navidad`.
