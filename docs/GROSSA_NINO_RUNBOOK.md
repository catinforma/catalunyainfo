# Runbook: La Grossa de Cap d'Any checker (31 Dec 2026) and El Niño checker (6 Jan 2027)

Pages (evergreen URLs, same family as the Christmas checker in
`docs/GORDO_NAVIDAD_RUNBOOK.md`):

| Draw | ca | es | en | JSON (noindex) |
| --- | --- | --- | --- | --- |
| La Grossa de Cap d'Any (Loteries de Catalunya) | `/ca/comprovar-la-grossa-cap-d-any/` | `/es/comprobar-la-grossa-cap-d-any/` | `/en/check-la-grossa-ticket/` | `/data/grossa-cap-d-any.json` |
| El Niño (SELAE) | `/ca/comprovar-loteria-nen/` | `/es/comprobar-loteria-nino/` | `/en/check-el-nino-lottery-ticket/` | `/data/loteria-nino.json` |

Code: `src/lib/programmatic/grossa-check/` and `src/lib/programmatic/nino-check/`
(programme, engine, copy, data; each with a `snapshot.json` that is `null`
until the day). Pages: `src/components/programmatic/{grossa,nino}-check/`.
Script: `scripts/gordo-snapshot.py ... --game grossa|nino`. Tests:
`tests/grossa-check.test.ts`, `tests/nino-check.test.ts` (fixtures in
`tests/fixtures/grossa/` and `tests/fixtures/nino/` are TEST DATA).
Publish groups: `comprobar-grossa`, `comprobar-nino` (pages + JSON, IndexNow
for the pages).

Both official sites answer **403 to the VPS** (re-tested 19 Nov 2026):
www.loteriasyapuestas.es, www.selae.es, www.loteriesdecatalunya.cat and
api.loteriesdecatalunya.cat. Do not try to get round the block: the owner's
PC (residential IP) or a browser does those fetches. Exception:
**www.loteriesdecatalunya.info answers 200 from the server**, and its press
notes carried the eight Grossa numbers on 31 December in 2024 and 2025
(`2024_GCA_Numeros_premiats.pdf`, `2025_GCA_Numeros_Premiats.pdf`).

## Go-live (now)

```bash
# after merge + push to origin main (check it succeeded)
sudo -u deploy catalunyainfo-deploy main
sudo -u deploy bash /srv/catalunyainfo/current/ops/vps/publish.sh comprobar-grossa comprobar-nino gordo-navidad   # retry a group up to 3x on "-> 500"
python3 scripts/indexnow-sitemap.py /ca/comprovar-la-grossa-cap-d-any/ /es/comprobar-la-grossa-cap-d-any/ /en/check-la-grossa-ticket/ /es/comprobar-loteria-nino/ /ca/comprovar-loteria-nen/ /en/check-el-nino-lottery-ticket/
```

`gordo-navidad` republishes the gordo hubs and the Christmas checker, which
now link both checkers. The two guides that link them are database articles
and wait for their measurement windows (docs/SEO_EXPERIMENTS.md):

- `loteria-nadal` (Christmas guide, El Niño paragraph): only **after the 1 Dec
  review** of its 13 Nov body change. Same for `gordo-navidad-links`, which
  republishes that guide too.
- `grossa` (La Grossa guide, "how to check" list): only **after the 8 Dec
  review** of its 17 Nov title (or with the draw-time update, whichever is
  later).

## La Grossa de Cap d'Any, before 31 December

- Nothing to load: the prizes and rules are DOGC 9640 annex 3 (read 19 Nov
  2026) in `grossa-check/programme.ts`; the tests check them against the
  guide's table, the tax calculator and the DOGC's 61.59 %.
- Draw time: when Loteries de Catalunya announces it (2024: press note of
  19 Dec), fill `DRAW_TIME_2026` in `src/lib/content/batch02/grossa.ts`
  (both the guide and the checker read it), gate, deploy, publish `grossa
  comprobar-grossa`. A test fails from 20 Dec while it is missing.

## La Grossa de Cap d'Any, on 31 December (repeat every 30-60 min)

On the server, from `~/catinfov2` (`git pull --ff-only` first):

```bash
D=~/grossa/run-$(date +%H%M)          # a NEW directory each time, outside the repo
python3 -I scripts/gordo-snapshot.py fetch --game grossa --year 2026 --dir "$D"
python3 -I scripts/gordo-snapshot.py build --game grossa --year 2026 --dir "$D"   # writes grossa-check/snapshot.json; REFUSED = nothing written
npm test > /tmp/grossa-gate.log 2>&1; grep -q "^ℹ fail 0$" /tmp/grossa-gate.log && npx tsc --noEmit -p . && echo GATE-OK
git add src/lib/programmatic/grossa-check/snapshot.json
git commit -m "La Grossa 2026: snapshot $(date +%H:%M)" && git push
sudo -u deploy catalunyainfo-deploy main
sudo -u deploy bash /srv/catalunyainfo/current/ops/vps/publish.sh comprobar-grossa
python3 scripts/indexnow-sitemap.py /ca/comprovar-la-grossa-cap-d-any/ /es/comprobar-la-grossa-cap-d-any/ /en/check-la-grossa-ticket/
```

What `fetch` saves: `premsa-index.html` (the press notes list), `premsa.pdf`
(the `2026_GCA_..._Numeros_premiats` PDF, once listed), `resultats.html` and
`draw.json` (403 from the server), `manifest.json`.

What `build` reads, in order: `premsa.pdf` (or `premsa.txt`) — the eight
numbers from its table, checked against the row labels (Primer, Segon,
Tercer, Quart, Cinquè) and the prose ("El primer premi, amb el número …");
`numbers.txt` if a person typed it (must agree with the note); then every
number must be in `resultats.html` / `draw.json` when they are there. It
REFUSES repeats, last year's numbers, another year's note, more than eight.

**If the press note is not out yet** (2024 and 2025: dated 31 December, no time
printed), the owner opens these in a browser on the PC and saves them into a
new folder, then copies it (`scp -r <folder> claude@84.46.242.202:~/grossa/`)
and `build` runs on it:

- https://www.loteriesdecatalunya.cat/resultats/grossa/ → save the page as
  `resultats.html`, and type `numbers.txt` from it:

  ```
  # copied from https://www.loteriesdecatalunya.cat/resultats/grossa/ at HH:MM by <who>
  first NNNNN
  second NNNNN
  third NNNNN
  fourth NNNNN NNNNN
  fifth NNNNN NNNNN NNNNN
  ```
  (replace every NNNNN with the official number, five digits, leading zeros
  kept; fourth and fifth in draw order; leave a line out while that prize is
  not drawn yet: `build` refuses anything that is not five digits.)
- https://api.loteriesdecatalunya.cat/web/lagrossa/rest/dgs/v1/games/LAGROSSACAT/draws/?drawingDate=2026-12-31
  → save as `draw.json` (optional cross-check).
- https://www.loteriesdecatalunya.info/ca/sobre-loteries/publicitat/premsa/ →
  the `2026_GCA_…Numeros_premiats` PDF as `premsa.pdf`, when listed.

The lottery guide (same day, once all eight are in):
`python3 -I scripts/gordo-snapshot.py guide --game grossa` prints
`RESULTS_2026` for `src/lib/content/batch02/grossa.ts` (fill `firstSoldIn`
by hand from the note's "Població" column, or leave `null`), set
`GROSSA_AS_OF = "2026-12-31"`, gate, deploy, publish `grossa`.

Verify: `curl -s https://www.catalunyainfo.com/data/grossa-cap-d-any.json`
(`available: true`, eight numbers); type the first prize, one of its
neighbours and a number ending in its last four digits into the page and
compare with Loteries de Catalunya's own checker.

From 1 Jan 2027 `tests/grossa-check.test.ts` fails while the committed
snapshot is still `null`.

## El Niño, before 6 January: the 2027 programme (by 28 December)

Only the date (Wed 6 Jan 2027), the 20 € décimo and the first prize
(2,000,000 € a la serie) are known, from SELAE's Lotería Nacional page read
on 31 Oct 2026. The rest of the 2027 programme is in SELAE's PDF
https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/programas%20de%20premios/PROGRAMAS_PREMIOS_PRIMER_TRIMESTRE_2027_SABADOS.pdf
(a web search lists the file; 403 to the server). From **28 Dec**
`tests/nino-check.test.ts` fails while
`src/lib/programmatic/nino-check/programme-2027.json` is `null`.

1. Owner's PC: open that URL in a browser and save it as `programa.pdf` in a
   new folder (or run `python -I scripts\gordo-snapshot.py fetch --game nino
   --year 2027 --dir C:\nino\prog` there), then `scp -r` the folder to
   `~/nino/prog` on the server.
2. Transcribe the El Niño page into `programme-2027.json`, in the shape of
   `BOE_2011` in `nino-check/programme.ts` (ids: `first`/`second`/`third`,
   `x5`/`x4`/`x3`/`x2`/`x1` for extractions by digits, `approx-<top>`,
   `hundred-<top>`, `end<digits>-<top>`; `count` per series, `perBillete` per
   200 € billete; `prizesPerSeries`, `eurosPerSeries` as printed; `source`
   with the PDF URL and its "Madrid, …" line; `confirmed` with who/when).
   Every figure, nothing from the press.
3. `python3 -I scripts/gordo-snapshot.py programme --game nino --dir ~/nino/prog`:
   every line must say `ok`. Then `npm test` (the JSON is validated on load:
   counts must follow the rules, totals must add up, first prize 2,000,000 €).
4. If the 2027 page's wording of the derived prizes differs from the BOE's
   2011 text (QUOTE in programme.ts), change the engine and its tests first.
5. Gate, deploy, publish `comprobar-nino`. The page then prints the whole
   programme and drops "pendiente de confirmar".

## El Niño, on 6 January (repeat every 30-60 min)

On the owner's PC (SELAE blocks the server):

```
python -I scripts\gordo-snapshot.py fetch --game nino --year 2027 --dir C:\nino\run-1330
scp -r C:\nino\run-1330 claude@84.46.242.202:~/nino/
```

`fetch` saves `draw.json` (SELAE's draw record:
https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&celebrados=true&fechaInicioInclusiva=20270106&fechaFinInclusiva=20270106,
falling back to `celebrados=false` while the draw is open), `programa.pdf`
and, once SELAE links it (`urlListadoOficial`), `lista-oficial.pdf`. If the
script is blocked on the PC too, save the same URLs from a browser under
those names. Then on the server:

```bash
D=~/nino/run-1330
python3 -I scripts/gordo-snapshot.py build --game nino --year 2027 --dir "$D"   # writes nino-check/snapshot.json
npm test > /tmp/nino-gate.log 2>&1; grep -q "^ℹ fail 0$" /tmp/nino-gate.log && npx tsc --noEmit -p . && echo GATE-OK
git add src/lib/programmatic/nino-check/snapshot.json
git commit -m "El Niño 2027: SELAE snapshot $(date +%H:%M)" && git push
sudo -u deploy catalunyainfo-deploy main
sudo -u deploy bash /srv/catalunyainfo/current/ops/vps/publish.sh comprobar-nino
python3 scripts/indexnow-sitemap.py /es/comprobar-loteria-nino/ /ca/comprovar-loteria-nen/ /en/check-el-nino-lottery-ticket/
```

`build` takes the named top prizes (`primerPremio`, `segundoPremio`,
`tercerosPremios`) and discovers every other list of `decimo` entries by
length (5, 4, 3, 2 and 1 digits; the key names were never seen from the
server). It REFUSES two lists of one length, more extractions than the
programme has, a kind the programme lacks, another draw's record, or a
missing `programme-2027.json`. Fallback: type `extracciones.txt` from SELAE's
official list, one line per kind with the numbers as SELAE prints them
(`first NNNNN`, `second NNNNN`, `third NNNNN` if the programme has one, `x5`
five-digit extractions, `x4`, `x3`, `x2` with four, three and two digits,
`x1` the one-digit reintegro extractions), next to `draw.json` (for the draw
id) or with `--draw-id`.

Verify: `curl -s https://www.catalunyainfo.com/data/loteria-nino.json`
(`available: true`); type the first prize, a neighbour and a number ending in
its last digit into the page and compare with SELAE's checker in a browser.

From 7 Jan 2027 `tests/nino-check.test.ts` fails while the committed
snapshot is still `null`.

## Roll back

Set the game's `snapshot.json` back to `null` (or the previous commit): the
page goes back to its pre-draw state. Gate, deploy, publish the group.
