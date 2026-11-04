# Election night 29N: live provisional results on the town pages

Research and design, 4 Nov 2026. **Prototype only: nothing here is wired to a
page, a route, a timer or Caddy.** Code: `src/lib/programmatic/elections/live/`
(behind `ELECTION_LIVE_RESULTS=on`, which nothing reads yet), tests:
`tests/election-live.test.ts`.

Official sources only. Where a page could not be read today it says so, with
the date it was last read and by whom. No format below is guessed: where the
format is not public, the document says that and stops.

---

## 0. Bottom line

1. **There is no public, documented, licensed feed of the night count.** Interior
   publishes the provisional count (LOREG art. 98.2) on a results website it
   commissions for each election (Indra held the count-and-dissemination
   contracts in 2023 and 2024, see 1.4) and, separately, in a **data
   repository for accredited media** whose file format is described only in a
   document handed to those media.
2. **For 29N the media repository is announced; registration closed on
   Wed 28 Oct at 15:00.** URL and credentials reach accredited media by email
   on Tue 17 Nov; tests on Wed 18 Nov. It carries turnout by municipality and
   the provisional Congress and Senate count, as plain-text files with field
   separators. **The owner must ask the Secretaría de Estado de Comunicación
   now whether catalunyainfo.com can still be accredited** (for 23J Interior
   extended the deadline once). This is the only channel built for automated
   reuse on the night.
3. **The public results website for 29N has not been announced** (checked
   4 Nov: 29neleccionesgenerales.es has no results section, sitemap of 3 Nov;
   by precedent the note comes 2-3 days before polling, so ~26-27 Nov).
   Its internal JSON (recorded from 2023 and 2024 archive captures on 18 Oct;
   the Wayback Machine refused this server today, section 1.3) is
   undocumented, comes with no published reuse terms and sits behind bot
   protection. Building on it is a **no-go unless** the 2026 site publishes a
   download channel and terms that allow it.
4. **Reuse terms:** Infoelectoral's Aviso legal allows commercial and
   non-commercial reuse with attribution ("Origen de los datos: Ministerio del
   Interior"), the date of the last update, no distortion and no implied
   endorsement; its open data are CC BY 4.0. Whether those terms cover the
   night website or the media repository is **not stated anywhere I could
   read**.
5. **Recommended architecture** (section 2), ready to receive whichever source
   is confirmed: systemd timer -> standalone ingest script -> checked,
   atomically swapped per-town JSON on local disk -> Caddy serves the JSON,
   a client island polls it -> throttled `revalidatePath` of the changed towns'
   literal URLs for the HTML. No database anywhere on the night path.
6. **Most likely outcome without media accreditation: link-out only**, which
   the pages already do (`ELECTION_NIGHT_RESULTS_URL`, model.ts).

---

## 1. Research

### 1.1 Legal frame (BOE)

- LOREG (https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672), art. 98.2:
  a copy of each polling station's return goes to the Administration's
  representative "a los solos efectos de facilitar la información provisional
  sobre los resultados de la elección que ha de proporcionar el Gobierno".
  Art. 88.1: voting ends at 20:00. Art. 103: the general count starts on the
  fifth day (JEC calendar: 4-7 Dec 2026). Art. 108.6: official results in the
  BOE within forty days. Art. 166.1.a: in the Senate each voter may mark up to
  three candidates in a province such as Barcelona, so Senate percentages of
  "valid votes" are meaningless (the render model shows votes only).
- Real Decreto 806/2026 (https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742):
  Barcelona 32, Girona 6, Lleida 4, Tarragona 6 deputies (used by the checks).
- Infoelectoral FAQ (read 18 Oct 2026, research_notes/blog-batch-03/election_night_29n.md):
  "En las elecciones de ámbito estatal el Ministerio del Interior centraliza los
  resultados de la votación y en la noche electoral difunde los resultados
  escrutados en las Mesas, una vez finalizada la votación a las 20 horas."
  The provisional count excludes the vote from abroad (CERA).

### 1.2 How Interior published the 2023 and 2024 night counts

**General election, 23 July 2023**

- Public site: **https://resultados.generales23j.es** and the app "23J
  Elecciones Generales 2023". Source: Interior's note on La Moncloa, 20 Jul 2023,
  https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/paginas/2023/200723-seguimiento-resultados-elecciones-generales-23j.aspx
  (read today): the site "estará disponible a partir de las 13.00 horas de
  mañana"; "Desde las 21 horas, tras el cierre de los colegios electorales en
  Canarias, la página web y la aplicación móvil" show results; they "permitirán
  acceder tanto al total nacional como a su desglose por comunidades autónomas
  y provincias", split into Congreso and Senado; data updated "a medida que se
  vaya disponiendo de más información". **No refresh interval, no municipality
  level, no download channel and no reuse terms are stated in the note.**
- Media repository: Interior notes "Dispositivo de recepción de resultados
  provisionales para las elecciones generales del 23 de julio de 2023"
  (https://www.interior.gob.es/opencms/es/detalle/articulo/Dispositivo-de-recepcion-de-resultados-provisionales-para-las-elecciones-generales-del-23-de-julio-de-2023/)
  and "Ampliado el plazo de acceso al dispositivo..."
  (https://www.interior.gob.es/opencms/en/detail-pages/article/Ampliado-el-plazo-de-acceso-al-dispositivo-de-recepcion-de-resultados-provisionales-para-las-elecciones-generales-del-23-de-julio-de-2023/).
  Both pages answer scripts with a Cloudflare challenge (HTTP 403 "Just a
  moment...", today); their content below is from search-engine excerpts of
  the pages, **to be re-read in a browser**: a "ruta de acceso informativo a
  los datos electorales provisionales" for media to build their pages and
  graphics in real time; contents "avances de participación (total estatal,
  por comunidad, provincia y municipio)", "recuento provisional para el
  Congreso y el Senado" and auxiliary candidacy files; files updated at the
  same moment results are sent to every other channel; plain-text files with
  field separators so any outlet can process them; tests on Sat 8 Jul 2023;
  registration through the Secretaría de Estado de Comunicación.
- Final data: `02202307_MUNI.zip` in Infoelectoral's download area
  (https://infoelectoral.interior.gob.es/estaticos/docxl/apliextr/02202307_MUNI.zip),
  fixed-width files described in FICHEROS.doc, data dated November 2023. Already
  parsed by `src/lib/programmatic/elections/interior.ts`. Municipalities are
  coded by **INE code**: province (2 digits) + municipality (3 digits), the
  same five digits as `Municipality.code` in our snapshot; CERA counted per
  province, outside any municipality.

**European election, 9 June 2024**

- Public site: **https://resultados.eleccioneseuropeas2024.es** (Interior note
  of 6 Jun 2024,
  https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/paginas/2024/060624-seguimiento-resultados-elecciones-europeas-9j.aspx,
  read 18 Oct 2026 by the earlier research; it timed out today): results
  "se cargarán a partir de las 23:00 horas" (EU-wide embargo), turnout at
  14:00 and 18:00; a link to an "Aviso legal" whose text could not be read.
  Spain is a single constituency, so seats are national only.
- Media repository: note "Dispositivo de recepción de resultados provisionales
  de las elecciones europeas del 9 de junio"
  (https://www.interior.gob.es/opencms/en/detail-pages/article/Dispositivo-de-recepcion-de-resultados-provisionales-de-las-elecciones-europeas-del-9-de-junio/),
  same Cloudflare challenge; same plain-text-files arrangement per the excerpt.

### 1.3 What the results websites served (Wayback Machine)

**Not re-verified today.** Every request from this server to
web.archive.org (CDX API and page captures) answered HTTP 429 "Too Many
Requests" from 16:10 to 16:51 on 4 Nov (repeated attempts, the last two 15 min
apart; IPv6 and archive.org itself timed out); `WebFetch` cannot reach
archive.org at all. Re-run from another network (the owner's PC) before the
dry run: `https://web.archive.org/cdx/search/cdx?url=resultados.generales23j.es/*&output=txt&collapse=urlkey`
and the same for `resultados.eleccioneseuropeas2024.es`. What follows is what the
earlier research recorded from Internet Archive captures on 18 Oct 2026
(research_notes/blog-batch-03/election_night_29n.md, section 1d), marked as
an observation, not an official statement:

- Both https://resultados.generales23j.es (2023) and
  https://resultados.eleccioneseuropeas2024.es (2024) were single-page apps
  that loaded JSON from an internal path, `/backend-difu/...`, for example
  `.../backend-difu/scope/data/getScopeData/<scopeId>/...`.
- A 23J capture of 23 Jul 2023 20:03 UTC (22:03 in Madrid) carried the share
  of polling stations counted (69.15 % at that moment), census, votes,
  turnout and, per party, a seats value ("cargos"), each with a `pro`
  (provisional) and a `def` (definitive) key.
- Both sites had a `/es/descargas` page whose content was not recoverable;
  the 23J site linked `assets/files/congreso.pdf` and `senado.pdf` (24 Jul
  2023 captures, not read). The 23J robots.txt capture returned an HTML page.
- `resultados.generales23j.es` no longer resolves; the 2024 domain redirects
  to `eleccioneseuropeas2024.es`, which answered a script with 403.

What is therefore **unknown**: the exact field names and nesting of that
JSON, how scopes are numbered (whether the municipality part is the INE
code), whether municipality scopes existed for Catalan towns, the refresh
cadence, and whether `/descargas` offered data files. The Moncloa notes speak
only of national, regional and provincial totals. **No parser was written for
that JSON**: I have not seen it, and the task's rule is not to invent a
format. The prototype's normalised shape (`LiveCount`: INE code, polling
stations counted/total, counted %, census, voters, blank, null, votes per
candidacy code, seats only where published) is what the 2023 JSON is
recorded to carry and what the media repository is announced to carry
(municipal turnout, Congress and Senate count, candidacy files), so an
adapter for either is a pure function from their format into it.

### 1.4 Who builds the night count (BOE contract notices)

- 2023: framework AM/ESCRUTINIO PROVISIONAL/01/2022 "Servicios necesarios
  para la obtención y difusión provisional de los datos del escrutinio...",
  Indra Soluciones Tecnologías de la Información, awarded 24 Feb 2023, one
  offer, 11,000,000 EUR (BOE-B-2023-9035,
  https://www.boe.es/diario_boe/txt.php?id=BOE-B-2023-9035, read today).
- 2024: EPE/11/2024 "Servicios de escrutinio provisional de los resultados
  electorales y su difusión...", Indra Soluciones Tecnologías de la
  Información, 9,000,000 EUR, awarded 29 Feb 2024
  (BOE-B-2024-11865, https://www.boe.es/diario_boe/txt.php?id=BOE-B-2024-11865, read today).
- New 4-year framework AM/ESCRUTINIO/01/2026 (BOE-B-2026-31526, 29 Sep 2026,
  https://www.boe.es/diario_boe/txt.php?id=BOE-B-2026-31526, read today):
  "obtención y difusión provisional de los datos del escrutinio... desarrollo
  de una web del proceso"; 46.06 M EUR, 3 operators; economic offers open
  18 Dec 2026, so it is **not** the 29N contract. Its technical specification
  on the contracting platform might describe the dissemination formats, but
  the document server rejected scripted downloads ("Request Rejected") today.
  Who runs 29N is not published in what I could read.

### 1.5 What Interior has announced for 29N (as of 4 Nov 2026)

- **Media repository: announced.** Interior note "Dispositivo de recepción de
  resultados provisionales para las Elecciones Generales del 29 de noviembre
  de 2026"
  (https://www.interior.gob.es/opencms/en/detail-pages/article/Dispositivo-de-recepcion-de-resultados-provisionales-para-las-Elecciones-Generales-del-29-de-noviembre-de-2026/,
  Cloudflare challenge today; from search-engine excerpts, re-read in a
  browser): a web-based repository of provisional data, **one connection per
  media outlet**; turnout "total estatal, por comunidad, provincia y
  municipio", "recuento provisional para el Congreso y el Senado", candidacy
  files; files updated at the same time as the provisional results are sent;
  plain-text field-separated files described in a descriptive document;
  outlets had to send a contact name, email and phone to the Secretaría de
  Estado de Comunicación **before Wed 28 Oct, 15:00**; URL and credentials by
  email on **Tue 17 Nov**; tests **Wed 18 Nov**. No extension found today.
- **Public results website: not announced.** 29neleccionesgenerales.es
  (Interior's official election site, presented 20 Oct) read today: sections
  Información general, Formaciones políticas, Información Mesas,
  Accesibilidad; no results page, no link; `/es/sitemap.xml` (206 URLs,
  lastmod 3 Nov) has none. Infoelectoral's 29-N page answered scripts with a
  challenge today (last read 3 Nov by the election-night guide: nothing on
  results). Interior's 20 Oct guide note on La Moncloa: no results site.

### 1.6 Reuse terms

- **Infoelectoral Aviso legal** (https://infoelectoral.interior.gob.es/es/aviso-legal/;
  challenge today, quotes as read 18 Oct 2026): "Las presentes condiciones
  generales permiten la reutilización de los documentos sometidos a ellas para
  fines comerciales y no comerciales."; "Está prohibido desnaturalizar el
  sentido de la información."; "Debe citarse la fuente... "Origen de los datos:
  Ministerio del Interior""; "Debe mencionarse la fecha de la última
  actualización..."; no suggestion that Interior "participa, patrocina o apoya
  la reutilización"; Interior "no garantiza la continuidad en la puesta a
  disposición de los documentos reutilizables". Infoelectoral open data:
  CC BY 4.0.
- **Night website:** its own "Aviso legal" (2024) could not be read; robots.txt
  not retrievable. **Automated reuse of the night site is not authorised by
  anything I could read.**
- **Media repository:** built for media to publish from ("elaborar sus
  informaciones y gráficos en tiempo real", per the excerpts), but its terms
  sit in the accreditation and the descriptive document, neither public.
  If accredited, get the reuse conditions (attribution, redistribution of
  per-town figures) in writing before go.
- interior.gob.es robots.txt (read 18 Oct): disallows named AI crawlers; the
  Content-Signal is `search=yes, ai-train=no, use=reference`. Our ingest is
  not an AI crawler, but scripted access to interior.gob.es and Infoelectoral
  is challenged by Cloudflare anyway: **never solve or bypass a challenge.**

---

## 2. Design

### 2.1 Architecture in five lines

1. **Source:** the accredited media repository (one bulk download per cycle,
   never per-town requests); else the public site only if it publishes a
   download channel and terms that allow automated reuse; else link-out.
2. **Ingest:** a systemd timer every 2 min (29 Nov 19:55 to 30 Nov ~03:00)
   runs a standalone Node script, outside the Next server: fetch -> adapter ->
   `checkSnapshot` + `checkProgress` -> atomic swap of per-town JSON under
   `/srv/catalunyainfo/shared/live/g2026/`; any failure keeps the last good set.
3. **Serve:** Caddy serves `/live/g2026/towns/<ine>.json` from disk with a 30 s
   Cache-Control; a client island on the town page polls it every 60 s and
   renders `buildLiveView` (Node and the database never see these requests).
4. **HTML:** the script then POSTs the changed INE codes to a local-only route
   that `revalidatePath`s their literal ca/es/en URLs (throttled: once per town
   per 10 min), so the server HTML, crawlers and no-JS readers get the figures too.
5. **Fallback:** feed stalled 15 min -> notice with the last Interior update
   time and the official link; no data -> today's link-out copy; kill switch =
   flag off + timer off.

### 2.2 Ingest: systemd timer, not the cron route

The existing cron route (`/api/cron/publish-scheduled/`) is a daily job that
runs inside the Next process and touches Supabase. The night job must not do
either: a fetch hanging on the lossy Contabo network (16-28 % packet loss
measured 3 Nov) must not hold a Node request, and nothing on the night path
may depend on the database.

- `catalunyainfo-live-results.timer`: `OnCalendar=*-*-* *:00/2:00`,
  `AccuracySec=5s`, **installed disabled**; enabled by hand on 29 Nov at 19:50,
  disabled on 30 Nov after the count reaches 100 % (or 08:00).
- `catalunyainfo-live-results.service`: `Type=oneshot`, `User=deploy`,
  `TimeoutStartSec=90s` (a run never overlaps the next), `ReadWritePaths=/srv/catalunyainfo/shared/live`,
  credentials from a root-only file (like the cron's `EnvironmentFile`).
- The script (`scripts/elections-live.ts`, to be written once the source is
  known) refuses to run outside the window unless `--force`; fetches with a
  20 s timeout, conditional GET (ETag/Last-Modified) when offered, a
  descriptive User-Agent; on 403/429/5xx backs off (skip the next 1, 2, 4
  cycles); never retries a challenge.
- One run = one bulk download. 947 per-town requests every 2 min would be
  abusive and is excluded.

### 2.3 Storage: local files, never the database

```
/srv/catalunyainfo/shared/live/g2026/
  v/20261129T214202/              one directory per accepted update
     snapshot.json                the full LiveSnapshot (for checkProgress and audits)
     towns/08187.json ...         947 LiveTownFile, ~3 KB each, ~1 KB compressed (test: < 4 KB)
     meta.json                    source, timestamps, counted %, per province
  current -> v/20261129T214202    symlink, swapped atomically (rename(2))
  last-error.json                 why the latest run was refused, if it was
```

A run writes a whole new `v/<stamp>/`, fsyncs, then renames a temporary
symlink over `current`: readers see the old set or the new one, never half.
Keep the last 20 versions (rollback = point `current` back). The raw download
is kept beside each version for the audit trail. Supabase is not used: the
link drops connections (pooler connects 1-7 s on 3-4 Nov) and a DB write
would add a failure mode for no benefit.

### 2.4 Rendering without a rebuild

Next 16.3.5 docs read (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`,
`revalidateTag.md`, `02-guides/how-revalidation-works.md`,
`03-file-conventions/02-route-segment-config/dynamicParams.md`):

- In a Route Handler `revalidatePath(path)` "marks the path for
  revalidation. The revalidation is done on the next visit"; a literal path
  refreshes one page; no trailing slash needed. Single self-hosted instance:
  "The default file-system cache handles consistency automatically."
- `revalidateTag` needs `cacheTag` inside `'use cache'` or tagged `fetch`;
  the town pages use neither (no `cacheComponents`), so literal
  `revalidatePath` is the tool.
- The three town routes export `revalidate = false` and
  **`dynamicParams = true`** (20 prerendered per locale, the rest on first
  request). The lesson "never `revalidatePath` a `dynamicParams = false`
  route, it 404s" therefore does not bite; a test now pins `dynamicParams =
  true` on all three files.

Wiring (later, not in this commit):

1. A server component `LiveResults` in the town page, rendered only when
   `liveResultsEnabled()`: reads `current/towns/<ine>.json` with
   `readFile` in try/catch (`parseTownFile` returns null on anything odd),
   calls `buildLiveView(file, new Date())`, renders the table. Plus a client
   island that polls `/live/g2026/towns/<ine>.json` every 60 s (only between
   29 Nov 19:55 and 30 Nov 08:00 by the browser clock) and re-renders with the
   same pure `buildLiveView`.
2. A route `src/app/api/cron/elections-live/route.ts` (Caddy already answers
   404 to `/api/cron/*` from outside; CRON_SECRET bearer, constant-time
   compare as in publish-scheduled): body = changed INE codes; `livePaths()`
   maps them to literal URLs; `revalidatePath` each; Cloudflare purge in
   `after()` as the other routes do.
3. Caddy, before `reverse_proxy`: a matcher for exactly
   `/live/g2026/towns/*.json` and `/live/g2026/meta.json`, `uri strip_prefix
   /live/g2026`, `root * /srv/catalunyainfo/shared/live/g2026/current`,
   `file_server`, `header Cache-Control "public, max-age=30"`. Only the town
   files and meta are exposed, never `snapshot.json` or the raw download
   (the media repository's terms may not allow redistributing it). Same
   origin, so no CORS header; the CSP's `connect-src 'self'` covers the fetch.

### 2.5 What the block shows

| When (Madrid) | Phase (`buildLiveView`) | Shows |
| --- | --- | --- |
| Until 29 Nov 19:59 | `before-close` | Today's 29N slot, unchanged; files on disk are ignored even if present |
| From 20:00, no usable data | `awaiting` | "Polls closed; Interior's provisional count appears as polling stations report" + official link once announced. Files stamped before 20:00 (the 18 Nov media tests) or for another date (the 2023 replay) are refused |
| Data in, < 100 % counted | `counting` | Table: list, votes, % of valid votes, the province's provisional seats beside each list (only if the source gives them), blank, null, turnout; "X % of polling stations counted"; "Provisional count, Ministry of the Interior, updated HH:MM"; no CERA; not official |
| 100 % counted | `counted` | Same, still labelled provisional; the general count 4-7 Dec and the BOE are the official result |
| Feed stalled >= 15 min | `feedDown = true` | Last good figures plus "We could not update since HH:MM: see Interior's official site" |
| After the general count | (existing importer) | `npm run elections:29n -- import 02202611_MUNI.zip` replaces the block with the final file |

Never: figures before 20:00, polls or projections, our own seat calculation,
"who is winning" wording, colours implying blocs. Attribution on every block:
"Origen de los datos: Ministerio del Interior" + Interior's own update time.

### 2.6 Load

- Today: ~105k document GETs in 33 h (Caddy log 3-4 Nov), about 1 per second;
  busiest minute 656 documents (3 Nov 10:51); busiest minute for election
  pages 537 (10:54), which looks like a crawler (not checked).
- Capacity: one Node process (`server.js` is single-threaded; 3 of 4 cores
  idle), 277 req/s for cached pages (2 Nov benchmark). Caddy serving a 3 KB
  static file does thousands per second on one core (not measured here).
- Night budget: 10 000 open tabs polling every 60 s = 167 req/s of JSON, all on
  Caddy (and on Cloudflare once proxied, `max-age=30`). HTML: ISR hits only;
  revalidation throttled to <= 1 924 renders per 10 min (~3/s).
- **Prerequisite:** every page render calls `nonEmptySections` (SiteHeader,
  SiteFooter) which queries Supabase. Re-renders on the night would wait on
  the pooler. Give it a 10-minute in-process memo before wiring.
- Cloudflare (if the NS switch has happened): bypass the HTML cache for
  `/ca/eleccions/*`, `/es/elecciones/*`, `/en/elections/*` from 19:30 to
  08:00 instead of purging ~1 900 URLs per cycle (purge-everything is limited
  to 5 per minute on Free); cache `/live/*` per its Cache-Control.

### 2.7 Fallback and failure modes

| Failure | Behaviour |
| --- | --- |
| Source unreachable, 403/429/5xx, challenge | Keep `current`; back off; `feedDown` after 15 min; never bypass |
| Download parses but a check fails (arithmetic, missing towns, counted % going back, timestamp going back, wrong date) | Refuse the update, write `last-error.json`, keep `current` |
| Town file missing or corrupt | `parseTownFile` -> null -> `awaiting` copy; the page never throws |
| Ingest script crashes | systemd logs; the next tick retries; same as stalled |
| Node restarts | Pages served from the ISR cache; JSON keeps flowing from Caddy |
| Wrong figures published | Flag off (one env var + restart) or point `current` back a version; revalidate |

### 2.8 Dry run on 2023 data

1. **Done (tests):** the official 2023 file (7-town fixture,
   `tests/fixtures/interior/02202307/`) through `fromInteriorFinal` ->
   `checkSnapshot` (0 problems) -> `townFile` -> `buildLiveView`. Sabadell:
   PSC 39,729 votes, 38.89 % of valid votes, turnout 66.35 %, Barcelona's 32
   seats beside the lists; the 7 towns equal the Generalitat data already on
   the pages, field by field.
   The same fixture through the file writer, with the dry-run script:
   `node --experimental-strip-types --import ./tests/register-alias.mjs scripts/elections-live-replay.ts tests/fixtures/interior/02202307 --out <scratch>`
   -> "7 towns, 4 provinces: every check passed ... 7 town files, 37309 bytes
   ... 7 towns changed -> 19 page URLs to revalidate" (256 ms); a second run:
   "0 towns changed". Code: `scripts/elections-live-replay.ts`,
   `scripts/lib/live-files.ts` (versioned directories + atomic `current` swap).
2. **Before 20 Nov:** the same script on the full `02202307_MUNI.zip` (all
   947 towns, every INE code expected) into a scratch directory; measure run
   time, files and bytes. Never `--out` under /srv (the script refuses).
3. **Night rehearsal on a second port** (`next start -p 3100` from a release
   copy, never production): a fake feed plays a sequence of snapshots into a
   scratch live dir; then kill it (`feedDown` after 15 min), corrupt a file,
   play a step back (refused), play a 2023 file against the 2026 clock
   (refused). Partial-count steps only from real archived captures (1.3) or
   clearly labelled synthetic data that never leaves the scratch dir.
4. **Load check**: a short `autocannon` run on the JSON through Caddy and on
   an ISR page, off-peak, with production on the same box.
5. **18 Nov (only if accredited):** connect to Interior's test feed, run the
   real adapter with `--dry-run` into scratch, confirm the render gate
   refuses the test data, save a few test files as fixtures.

### 2.9 Go / no-go, ~26 Nov (when Interior's note appears)

Go only if every line holds:

- [ ] A source exists for the night with municipality granularity: media
      credentials received 17 Nov and the 18 Nov test passed, **or** the
      29N results site publishes a download/data channel.
- [ ] Its terms allow automated reuse (accreditation conditions, or the
      site's Aviso legal), with attribution "Origen de los datos: Ministerio
      del Interior" and the update time.
- [ ] Its format is documented and an adapter parses real files from it
      (saved as fixtures) with tests: INE codes for municipalities, the
      source's own candidacy codes and names, a counted-stations field.
- [ ] The checks' assumptions hold on real files from that source (voters =
      lists + blank + null; a province's towns never exceed its row; counted
      share never goes back), or the checks are adjusted to what its
      documentation says, with the reason written down.
- [ ] All 947 INE codes map to our pages (`livePaths`, 0 unknown).
- [ ] The results site URL is copied from Interior's own note and put in
      `ELECTION_NIGHT_RESULTS_URL` (independently of this feature).
- [ ] Wiring merged and deployed by Fri 27 Nov with the flag off; no deploy
      on 29 Nov; the 2-port rehearsal passed; timer installed, disabled.
- [ ] `nonEmptySections` memo in place (no DB on night re-renders).
- [ ] Cloudflare bypass rule for the election paths prepared (if proxied).
- [ ] Someone on watch 20:00-02:00 with the rollback steps written down.

Anything missing -> **no-go: link-out only** (the pages already say Interior
has not announced its site; switch that line to the official link on the
night).

### 2.10 Risks

- **No licensed feed** (media registration closed 28 Oct; the public site's
  JSON undocumented and unlicensed): the feature may never get a source.
- **Format unknown until 17 Nov at best**; the adapter must be written and
  tested in ~9 days, or in hours if only the public site's channel appears
  on ~26 Nov.
- **Bot protection**: interior.gob.es and Infoelectoral already challenge
  scripts; the 2024 results domain did too.
- **Network**: Contabo packet loss; fetch failures must degrade to the last
  good figures, never to wrong ones.
- **Load**: one Node process; Cloudflare in front still pending.
- **Legal/editorial**: figures before 20:00 (gated in code), provisional
  seats read as final (labels), Senate percentages (not shown), CERA (not in
  the night count), implying Interior endorses us (attribution wording).
- **Test data leak** from the 18 Nov media tests (refused by timestamp and
  date gates; tested).
