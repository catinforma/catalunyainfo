# Runbook: ¿Dónde ha tocado el Gordo? (22 December 2026)

Pages: `/es/donde-ha-tocado-el-gordo/`, `/ca/on-ha-tocat-la-loteria-de-nadal/`,
`/en/spanish-christmas-lottery-results/`, plus `<provincia>/` and
`<provincia>/<municipio>/` pages that exist **only** once the committed
snapshot (`src/lib/programmatic/gordo/snapshot.json`, `null` until the day)
lists a point of sale there. Code: `src/lib/programmatic/gordo/`. Script:
`scripts/gordo-snapshot.py`. Test: `tests/gordo-navidad.test.ts` (fixture in
`tests/fixtures/gordo/` is TEST DATA).

## Before the day

- Deploy this code once and publish `gordo-navidad gordo-navidad-links`, then
  IndexNow the three hubs (commands below).
- When SELAE publishes the 2026 Christmas dossier (2025's: 16 Dec) with the
  start time, fill `DRAW_TIME_2026` in `src/lib/content/batch02/loteria-nadal.ts`
  (the hub reads it too), deploy, publish `loteria-nadal gordo-navidad`.

## Official sources (SELAE only)

- Numbers: SELAE's draw record,
  `https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&celebrados=true&fechaInicioInclusiva=20261222&fechaFinInclusiva=20261222`
  (the script falls back to `celebrados=false` while the draw is open).
- Points of sale, one page per prize ("PUNTOS DE VENTA RELACIONADOS"):
  `https://www.loteriasyapuestas.es/es/premios/{primer|segundo|tercer|cuarto|quinto}-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-2026`
  (404 until SELAE publishes each one).
- The Lista Oficial de Premios PDF (afternoon) is the only list valid for
  payment; its URL appears in the draw record (`urlListadoOficial`).
- No BOE resolution exists for the 2026 programme (last one: 2010). SELAE's
  press room answers 403 to scripts: read it in a browser if needed.

## On 22 December (repeat every 30-60 min as SELAE adds pages)

From the main checkout (`~/catinfov2`, up to date with `origin/main`):

```bash
D=~/gordo/run-$(date +%H%M)          # a NEW directory each time, outside the repo
python3 -I scripts/gordo-snapshot.py fetch --year 2026 --dir "$D"
python3 -I scripts/gordo-snapshot.py build --year 2026 --dir "$D"   # writes snapshot.json; REFUSED = nothing written
npm test > /tmp/x.log 2>&1; grep -q "^ℹ fail 0$" /tmp/x.log && npx tsc --noEmit && echo GATE-OK
git add src/lib/programmatic/gordo/snapshot.json scripts/data/gordo-locality-aliases.json
git commit -m "Gordo 2026: SELAE snapshot $(date +%H:%M)" && git push
sudo -u deploy catalunyainfo-deploy main
sudo -u deploy bash /srv/catalunyainfo/current/ops/vps/publish.sh gordo-navidad   # retry up to 3x on "-> 500"
python3 scripts/indexnow-sitemap.py /es/donde-ha-tocado-el-gordo/ /ca/on-ha-tocat-la-loteria-de-nadal/ /en/spanish-christmas-lottery-results/
```

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
curl -s https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/ | grep -c "<GORDO NUMBER>"
curl -s -o /dev/null -w "%{http_code}\n" https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/<provincia>/   # 200 for a listed province
curl -s -o /dev/null -w "%{http_code}\n" https://www.catalunyainfo.com/es/donde-ha-tocado-el-gordo/no-existe/    # 404
curl -s https://www.catalunyainfo.com/sitemap.xml | grep -c "donde-ha-tocado-el-gordo"
```

Compare two or three outlets against SELAE's own prize page by hand.

## Roll back

Set `snapshot.json` back to the previous commit (or `null`: every province and
municipality page 404s again and leaves the sitemap), gate, deploy, publish
`gordo-navidad`.
