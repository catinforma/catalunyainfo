# Review: cluster 2, calendars (rankings push, 26 Oct 2026)

Reviewer: cluster agent 2 (read-only). Data: GSC 27 Sep – 24 Oct (input-2-calendars.json, `scripts/gsc-page.py`, page×query pulls), **URL Inspection API run today**, live pages fetched today, WebSearch (US, indicative only). Every new fact below has a URL, a verbatim quote and the date I read it. Anything else is marked UNVERIFIED and must not be printed.

## The finding that matters most: Google has not seen most of this cluster's recent edits

URL Inspection, 26 Oct 2026 (`lastCrawlTime`, all "Submitted and indexed", canonical = ours):

| URL | Last crawl | What Google is missing |
|---|---|---|
| /es/guias/calendario-laboral-cataluna/ | **25 Sep** | everything since: 20 Oct FAQ, 23 Oct BOE section and new title. Impressions **0–5/day since 16 Oct** (was 60–220/day) |
| /en/guides/catalonia-public-holidays/ | **25 Sep** | same |
| /es/agenda/que-hacer-este-fin-de-semana-cataluna/ | **25 Sep** | the 7 Oct evergreen rewrite. Google still has the page dated "19 y 20 septiembre" |
| /en/guides/is-today-a-holiday-in-catalonia/ | 6 Oct | daily answer, 20 Oct lastmod change |
| /es/guias/es-festivo-hoy-cataluna/ | 9 Oct | position 9–10 → 36–48 from 13 Oct |
| /es/guias/calendario-escolar-cataluna/ | 9 Oct | 20 Oct "answer first" lead and 23 Oct 2026-2027 title |
| /en/guides/clock-change-spain/ | 12 Oct 23:32 UTC | **the 14 Oct and 26 Oct titles** |
| /ca/guies/canvi-hora-catalunya/ | 13 Oct 16:12 UTC | **the 14 Oct and 26 Oct titles** |
| /es/guias/cambio-hora-espana/ | 14 Oct 02:23 UTC | **the 14 Oct and 26 Oct titles** (commit b0677bd is 14 Oct 10:39 UTC) |
| /ca/guies/calendari-laboral-catalunya/ | 22 Oct | the 23 Oct sprint changes |
| CA school, EN school, CA/ES local, all shops, CA/EN weekend | 20–26 Oct | up to date |

Three consequences:

1. **The 14 Oct clock-change experiment was never shown to searchers.** No edition was recrawled after the title change went live, so the 26 Oct outcome ("no lift… with the date in the title… searchers had nothing left to click for") measured the *old* title. It is one of the three readings behind the 26 Oct lesson "titles do not move CTR at 7–10". The owner should annotate that entry: clock change **unreadable (not indexed)**, not negative. The other two readings (Sitges, parking) are outside this cluster; check their `lastCrawlTime` against the change date before relying on the lesson.
2. **The 23 Oct sprint windows for ES/EN work calendar and ES school calendar have not started.** "Measure on 20 Nov" assumes Google saw the change on 23 Oct. Start each page's 28-day window at its first recrawl after the deploy, not at the deploy.
3. **Backlog #6 is still open.** The ES calendar is still on its 25 Sep crawl, so the owner action from 20 Oct (Request indexing) either did not happen or was not acted on by Google.

**Owner action today (P0, no code):** in GSC, use URL Inspection → *Request indexing* on these URLs, in this order (about 10 a day per property): ES calendar, ES today, CA clock, EN clock, ES clock, CA calendar, EN calendar, ES school, ES weekend (after the agenda fix below is deployed), EN today. While in GSC, also check *Removals* and *Manual actions* for the ES calendar. A drop from position 1–9 to no impressions at all while the page stays "indexed" is unusual, and those two screens rule out the simple causes. If the ES calendar still has no impressions 7 days after it is recrawled, escalate as a separate investigation. Do not edit the page meanwhile.

## Summary

| Article (ca/es/en) | Impr. 28 d | Best position (main query) | Priority | Earliest edit | P0 |
|---|---|---|---|---|---|
| Work calendar 2027 | 3,723 (ES 1,924 · CA 1,604 · EN 195) | ES `calendario laboral cataluña 2027` 1.0 before collapse; CA `calendari laboral 2027 catalunya` 10.0 | **5** | 20 Nov (body/title). Recrawl request now | yes (indexing, owner) |
| Is today a holiday | 922 (ES 708 · CA 145 · EN 69) | CA `avui es festiu a catalunya` 4.6; ES `hoy es festivo en cataluña` 9.3 | **4** | 4 Nov (P0 text fix now) | **yes**: wrong Easter claim |
| Clock change | 10,024 (CA 7,289 · EN 2,492 · ES 243) | CA `quan canvien l'hora` 5.7, `canvi d'hora` 7.5; EN 8–10 | **4** (seasonal: act before March) | 23 Nov (titles deployed 26 Oct) | yes (indexing, owner) |
| School calendar | 1,678 (CA 981 · ES 697 · EN 0) | CA `inici de curs` 4.8, `ordre edf/66/2026` 7.3; ES `hoy hay cole en cataluña` 6.3 | 3 | 20 Nov | no |
| Local holidays | 53 (CA 49 · EN 4 · ES 0) | n/a (too few queries) | 2 (→ 4 when the 2027 order is out) | 17 Nov; 2027 data when published | no |
| Shops open on holidays | 146 (EN 74 · CA 72 · ES 0) | n/a (seasonal, Nov–Dec) | 2 | 21 Nov | no |
| Weekend agenda | 38 (CA 24 · EN 8 · ES 6) | CA `què fer a catalunya` 8.7; `que fer aquest cap de setmana` 22.8 | 1 | 4 Nov (P0 code fix now) | **yes**: events outside Catalonia live |

Earliest-edit rule: last commit + 28 days, or the SEO_EXPERIMENTS freeze if later. P0 factual fixes go in now.

---

## 1. Work calendar 2027
`src/lib/content/holidays/copy.ts`, `publish.ts`, `payload.ts`. Last commit 23 Oct, so earliest edit **20 Nov**. CA title freeze (22 Oct) is over, but its body changed on 23 Oct.

**Demand.** CA: `calendari laboral 2027 catalunya` 10.0, `divendres sant 2027` 10.2 (37 impressions), `pasqua florida 2027` 9.8, `ponts 2027` 9.7, `dies festius catalunya 2027` 10.0, `dilluns de pasqua 2027` 7.1. Ignore `festivitats` (41, generic). ES before 16 Oct: `calendario laboral cataluña 2027` 1.0, `calendari laboral 2027 catalunya` 8.8, `festivos catalunya 2027` 9.2, `30 octubre festivo` 7.7–8.2 (93 impressions over the period); `calendario laboral` 56 is Spain-wide (wrong intent). EN: thin. `catalonia holidays` at 61 means "vacation" (intent mismatch), and `public holidays barcelona 2027` sits at 9.5.

**Live page.** The first sentence lists all 12 dates with the order and the BOE. It has a national-vs-Catalan section, bridges, an ICS download, Barcelona's local holidays and a FAQ. It is complete and correct (see verified list).

**Competition** (`calendario laboral 2027 cataluña`, `barcelona public holidays 2027`):
- News outlets (ara.cat, rtvc, esdiario) win on **freshness**: they published on 13 Oct when the BOE list came out, and Google only knows our 25 Sep copy.
- diainternacionalde.com and officeholidays win on **format**: a calendar grid and per-town pages.
- conesalegal and barcelona.com win EN on **links**.

Our content gap is small. The gap Google sees is **staleness**, and a recrawl fixes it.

**Smallest change (20 Nov, only if position has not recovered after the recrawl):**
- Add nothing yet. The 23 Oct body (BOE section, national vs Catalan, 30 Oct FAQ) is exactly what the competition has, and Google has not read it.
- On 20 Nov, replace the 30 October FAQ item (past by then) with one for the next date-shaped query. GSC shows `8 diciembre festivo` and `26 diciembre festivo` among the 166-query tail. Paste-ready, facts from the Generalitat 2026 page (below):
  - ca: **És festiu el 7 de desembre?** «No a tot Catalunya. El 2026 el 6 de desembre cau en diumenge i no és a la llista de festius; el dimarts 8 de desembre sí que ho és. Qui demani el dilluns 7 fa pont de dissabte 5 a dimarts 8. A Barcelona, el Consell d'Educació Municipal proposa que les escoles no facin classe el 7.»
  - es: **¿Es festivo el 7 de diciembre?** «No en toda Cataluña. En 2026 el 6 de diciembre cae en domingo y no está en la lista de festivos; el martes 8 de diciembre sí lo es. Quien pida el lunes 7 hace puente de sábado 5 a martes 8. En Barcelona, el Consell d'Educació Municipal propone que las escuelas no tengan clase el 7.»
  - en: **Is 7 December a holiday?** "Not across Catalonia. In 2026, 6 December falls on a Sunday and is not on the holiday list; Tuesday 8 December is. Taking Monday 7 off gives a four-day break from Saturday 5 to Tuesday 8. In Barcelona, the municipal education council proposes that schools close on the 7th."
  - Sources: Generalitat 2026 list; CEMB PDF (both below).
- **Internal links in:** ES has very few contextual ES links. The ES school calendar, local holidays and shops pages already link to it. The editorially right addition is from the ES today page (eligible 4 Nov), whose last section already ends with "tenemos el calendario laboral completo". Leave it. The real lever is the recrawl.

**Verified correct (26 Oct):**
- 12 dates of 2027 and the Aran swap. Source: https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/ «Són festes laborals a Catalunya durant l'any 2027: 1 de gener, … 6 de gener, … 26 de març, … 29 de març, … 1 de maig, … 24 de juny, … 11 de setembre, … 12 d'octubre, … 1 de novembre, … 6 de desembre, … 8 de desembre, … 25 de desembre» and «Al territori d'Aran, la festa del dia 29 de març (Pasqua Florida) queda substituïda per la de 17 de juny (Festa d'Aran)». No page date shown.
- Barcelona's 2027 local holidays. Source: https://ajuntament.barcelona.cat/calendarifestius/ca/ «17 de maig Dilluns de Pasqua Granada (L)», «24 de setembre Mare de Déu de la Mercè». No page date shown.
- "Nine of twelve national" and BOE of 13 Oct. Corroborated by Garrigues and INAP summaries (secondary). The BOE URL is in the page sources; it was not re-read today.

## 2. Is today a holiday?
`src/lib/content/holidays/today-publish.ts`. Last commit 7 Oct; titles frozen to 3 Nov. Earliest edit **4 Nov**. **P0 text fix now.**

**P0: wrong fact live in all three editions.** "Tres d'aquests dotze es mouen cada any perquè depenen de la Pasqua: Divendres Sant, Dilluns de Pasqua Florida i, segons l'any, alguna altra data vinculada. La resta són fixos." (es/en equivalents.) Only **two** of the twelve depend on Easter. "La resta són fixos" is also wrong: the list changes from year to year. The page's own table shows it: 26 Dec is on the 2026 list, and 1 Nov and 6 Dec are on the 2027 list.

Paste-ready replacement (lines 117 / 148 / 179):
- ca: «Dos d'aquests dotze canvien de data cada any perquè depenen de la Pasqua: Divendres Sant i Dilluns de Pasqua Florida. La llista tampoc no és sempre la mateixa: el 2026 hi ha el 15 d'agost i el 26 de desembre; el 2027, quan tots dos cauen en diumenge, no hi són, i en canvi hi ha l'1 de novembre i el 6 de desembre.»
- es: «Dos de esos doce cambian de fecha cada año porque dependen de la Pascua: Viernes Santo y Lunes de Pascua Florida. La lista tampoco es siempre la misma: en 2026 incluye el 15 de agosto y el 26 de diciembre; en 2027, cuando ambos caen en domingo, no están, y en cambio sí lo están el 1 de noviembre y el 6 de diciembre.»
- en: "Two of the twelve change date every year because they follow Easter: Good Friday and Easter Monday. The list itself also changes: 2026 includes 15 August and 26 December; in 2027, when both fall on a Sunday, they are not on it, and 1 November and 6 December are."
- Sources: https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/ «Són festes laborals a Catalunya durant l'any 2026: 1 de gener, … 6 de gener, … 3 d'abril, … 6 d'abril, … 1 de maig, … 24 de juny, … 15 d'agost, … 11 de setembre, … 12 d'octubre, … 8 de desembre, … 25 de desembre, … 26 de desembre» (read 26 Oct 2026), plus the 2027 page above.
- Better still, render this sentence from `calendar.ts` so it cannot go stale in 2028.

**P1: verify or soften.** "Quan un festiu cau en diumenge, la normativa preveu el trasllat al dilluns següent en determinats casos". The wording is vague and no source is cited. Check it against Estatuto de los Trabajadores art. 37.2 and RD 2001/1983 before 4 Nov, or cut the clause. UNVERIFIED as written.

**Demand.** CA `avui es festiu a catalunya` 4.6 (14 impressions, the only click), `avui es festiu?` 4.9. ES `hoy es festivo en cataluña` 9.3 (60), `es festivo hoy en cataluña` 11.6, `mañana es festivo` 56.3 (28), `festivos hoy` 13.3. Ignore `festividades` (89.9). From 13 Oct, ES fell to 36–48 per day. The last crawl was 9 Oct, so Google holds a page that answers for 9 Oct.

**Live page.** The first screen answers well: "No, hoy no es festivo en Cataluña", tomorrow, the next holiday with a countdown, and **today's local holidays by town** (13 municipalities today). No competitor has that last part.

**Competition** (`es festivo hoy en cataluña`):
- okdiario and ara.cat win on **freshness**: dated articles on the day.
- absentify wins on **format**: a full-year list.

We win on format already. We lose on crawl freshness (fixed by the recrawl request) and authority.

**Smallest change (4 Nov):**
- Turn the "Mañana: No" cell into a full rendered sentence that names the date, so `mañana es festivo` (56) has a matching passage. Example of the rendered output: «Mañana, martes 27 de octubre, no es festivo en Cataluña.» / «Demà, dimarts 27 d'octubre, no és festiu a Catalunya.» / "Tomorrow, Tuesday 27 October, is not a public holiday in Catalonia." Computed from `calendar.ts`, like today's answer.
- Bump `CALENDAR_VERIFIED_AT` after re-reading the Generalitat pages (done today: both lists match). The page still says "Verificado el 6 oct".
- **Internal link in:** from the metro hours page, a strong page (ES 1,347 impressions, position 10.5). Its schedule depends on whether tomorrow is a holiday. Source page `/es/guias/horarios-metro-barcelona/` (hours.ts line 139), earliest **20 Nov** (edited 23 Oct, title frozen to 14 Nov). New `tableNote`:
  - es: «De la página de horarios de TMB. Un festivo de lunes a jueves cierra a medianoche. Si no sabes si mañana es festivo, lo decimos cada día en [¿es festivo hoy en Cataluña?](/es/guias/es-festivo-hoy-cataluna/).»
  - ca: «De la pàgina d'horaris de TMB. Un festiu de dilluns a dijous tanca a mitjanit. Si no saps si demà és festiu, ho diem cada dia a [és festiu avui a Catalunya?](/ca/guies/es-festiu-avui-catalunya/).»
  - en: "From TMB's hours page. A public holiday falling Monday to Thursday follows the midnight closing. Not sure whether tomorrow is a holiday? We answer it daily in [is today a holiday in Catalonia?](/en/guides/is-today-a-holiday-in-catalonia/)."

## 3. Clock change
`src/lib/content/batch02/clock-change.ts`. The March titles went live on 26 Oct, so earliest edit **23 Nov**. Plan the body change for **23 Nov – 1 Mar**, ahead of the 28 Mar peak.

**Demand.** CA is the site's largest page: `canvi d'hora` 2,121 impressions at 7.5, `canvi hora` 469 at 6.9, `canvi horari` 394 at 7.2, `quan canvien l'hora` 298 at 5.7, `proxim canvi d'hora` 5.8. EN: `when do the clocks change in spain` 214 at 9.9, `do the clocks go back in barcelona` 27 at 9.0. ES: `cambio de hora` 36.5 is a national query owned by national media (authority). The ES page also picks up Catalan queries at 7–9.

**Live page.** The first screen answers: "Pròxim canvi d'hora: diumenge 28 de març de 2027 … Falten 153 dies", with the table to 2031. It is correct.

**Competition** (`canvi d'hora`, `when do the clocks change in spain`):
- 3cat, naciodigital, democrata, thelocal and majorcadailybulletin win on **freshness**: a new dated article each change, with the year in the URL and title.
- They also win on **authority**.

Our format is better (a computed box and dates to 2031). The two gaps are recrawl freshness, which made the 14 Oct title invisible, and authority.

**Smallest change (23 Nov or later, before 1 Mar):**
- Replace the first FAQ item, which answers October 2026 (past), with the next change. Facts are from C/2026/1660.
  - ca: **Quan és el pròxim canvi d'hora?** «El diumenge 28 de març del 2027: a les 02:00 seran les 03:00 i dormirem una hora menys. El següent és el diumenge 31 d'octubre del 2027, quan es retardarà una hora.»
  - es: **¿Cuándo es el próximo cambio de hora?** «El domingo 28 de marzo de 2027: a las 02:00 serán las 03:00 y dormiremos una hora menos. El siguiente es el domingo 31 de octubre de 2027, cuando se retrasará una hora.»
  - en: **When is the next clock change in Spain?** "Sunday 28 March 2027: at 02:00 the clocks go forward to 03:00, so you lose an hour. The one after is Sunday 31 October 2027, when they go back an hour."
- EN only: add a FAQ for `do the clocks go back in barcelona` (9.0). «**Do the clocks change in Barcelona?** Yes. Barcelona is on Spain's mainland time and changes with the rest of the EU: forward on Sunday 28 March 2027, back on Sunday 31 October 2027.»
- **In early March:** re-check the BOE for a Spanish order for 2027–2031 (none found today; the page says so correctly) and the Council file. Then bump `VERIFIED`, which still reads 12 Oct. Freshness is what the news results beat us on.
- Internal links in: already in place from mushrooms and autumn (ca/es/en). Nothing to add.

**Verified (26 Oct).** https://www.boe.es/doue/2026/1660/Z00001-00001.pdf (DOUE C/2026/1660, 18.3.2026): «en 2027: los domingos 28 de marzo y 31 de octubre, — en 2028: los domingos 26 de marzo y 29 de octubre, — en 2029: … 25 de marzo y 28 de octubre, — en 2030: … 31 de marzo y 27 de octubre, — en 2031: … 30 de marzo y 26 de octubre». The table matches. No BOE order for 2027–2031 was found (search, 26 Oct), so "el BOE encara no n'ha publicat l'ordre" is still true.

## 4. School calendar
`src/lib/content/school/publish.ts`. Last commit 23 Oct, so earliest edit **20 Nov**.

**Demand.** CA: `ordre edf/66/2026` 7.3, `inici de curs` 4.8, `vacances de nadal` 6.8, `calendari escolar 2027-2028` 8.5, `calendari escolar` 17.2. ES: `hoy hay cole en cataluña` 6.3, `hoy hay instituto` 7.7. Generic ES queries (`calendario escolar` 26, `año escolar` 49, `lectivo` 40) are Spain-wide: intent mismatch, ignore. EN: no impressions.

**Live page.** The first screen answers: start, end, Christmas and Easter dates, then "Hoy es periodo lectivo… Vacaciones de Navidad dentro de 57 días". It also has Barcelona's CEMB days. Correct.

**Competition** (`calendario escolar cataluña 2026-2027`, `calendari escolar 2026-2027`):
- 3cat and betevé win on **authority and freshness**.
- laboral-social (PDF) and town PDFs (El Prat, Girona) win on **format**: a printable, local version.

The missing section is **other towns' recommended free days** (the CEM days). The searches show town-level PDFs ranking.

**Smallest change (20 Nov):**
- Add Girona next to Barcelona only after confirming it. The Girona PDF lists **five** "Dia de lliure disposició recomanat pel CEM" (30 Oct, 7 Dec, 5 Feb, 8 Feb, 17 May), but the order allows four. Confirm with the Ajuntament de Girona (Educació) which four apply before printing. **UNVERIFIED**, do not publish yet. Source to check: https://www.girona.cat/adminwebs/docs/c/a/calendari_escolar_26-27.pdf.
- Bump `SCHOOL_VERIFIED_AT`. The page shows "Verificado el 7 oct" with no "Actualizado" line, although the body changed on 20 and 23 Oct.
- Main lever: recrawl of ES (9 Oct copy).

**Verified (26 Oct).**
- CEMB PDF, «aprovada al plenari ordinari del Consell celebrat el 10 de juny de 2026»: «Divendres, 30 d'octubre de 2026 … Dilluns, 7 de desembre de 2026 … Dilluns, 8 de febrer de 2027 … Divendres, 14 de maig de 2027». Matches the page.
- Girona PDF: «Dimarts 8: Inici de les classes», «Dilluns 21 [desembre]: Darrer dia lectiu», «Divendres 8 [gener]: Represa de les classes», «Dissabte 20 [març]: Inici de les vacances de Setmana Santa», «Dimarts 30: Represa», «Dilluns 21 [juny]: Darrer dia lectiu». These match the Ordre EDF/66/2026 dates on the page.

## 5. Local holidays
`src/lib/content/holidays/local-publish.ts`, `local.ts`. Last commit 20 Oct, so earliest edit **17 Nov** (experiment measured 4 Nov).

**Demand.** Nearly none on the page itself (CA 49, ES 0, EN 4). The town-specific long tail (`30 octubre festivo`, Salou etc.) lands on the ES calendar FAQ instead, by design. ES was crawled 25 Oct: indexed but invisible.

**Live page.** A full 2026 table of 1,398 municipalities with search. It says 2027 data will be added when published.

**Competition** (`festius locals 2026 [municipi]`): DOGC and Diputació PDFs, comarcal pages and diarimes win on **authority and per-town URLs**. Our single table is the right format but one URL per 1,398 towns.

**Smallest change:**
- 17 Nov: one line so the page does not contradict the calendar page, which already gives Barcelona 2027.
  - ca: «Barcelona ja ha aprovat les seves del 2027: el 17 de maig (Pasqua Granada) i el 24 de setembre (la Mercè).»
  - es: «Barcelona ya ha aprobado las suyas de 2027: el 17 de mayo (Pascua Granada) y el 24 de septiembre (la Mercè).»
  - en: "Barcelona has already approved its 2027 days: 17 May (Whit Monday) and 24 September (La Mercè)."
  - Source: ajuntament.barcelona.cat/calendarifestius (quote in §1).
- **The real opportunity (priority 4 when it lands):** the 2027 local-holiday order. Per a secondary source (cido.diba.cat), the 2026 one was Ordre EMT/208/2025 of 11 December, published in December 2025 (UNVERIFIED against the DOGC). Watch the DOGC from early December and ship the 2027 table the day it appears, with the order number and date. Treat it as a factual-data refresh, which may go in inside the window. `festius locals 2027` demand peaks in Dec–Jan, and being first matters more than anything else on this page.

## 6. Shops open on Sundays and holidays
`src/lib/content/batch02/shops.ts`. Last commit 24 Oct (round 2), so earliest edit **21 Nov**.

**Demand.** Out of season: 72/74 impressions CA/EN, ES 0, which is normal before November. Real query: `botigues obertes avui` 43.

**Live page.** The first screen answers that 1 Nov is not an opening day except l'Ametlla del Vallès and Mollet, and lists the remaining 2026 days (29 Nov; 6, 8, 13, 20, 27 Dec) plus 2027. It is precise and sourced (Resolució EMT/4342/2025, Ordre EMT/89/2026).

**Competition** (`tiendas abiertas domingos y festivos barcelona 2026`): enterat.com wins on **format**: "Centros comerciales abiertos HOY", a live per-day answer plus named malls. The Ajuntament wins on authority.

**Smallest change (21 Nov, before the first opening Sunday on 29 Nov):**
- A day-dependent "today" line, like `holidayToday`, rendered from the data already on the page. Example rendered output: «Avui, diumenge 29 de novembre, les botigues poden obrir a Barcelona i als municipis sense llista pròpia (calendari general).» / «Hoy, domingo 29 de noviembre, las tiendas pueden abrir en Barcelona y en los municipios sin lista propia (calendario general).» / "Today, Sunday 29 November, shops may open in Barcelona and in towns without their own list (general calendar)." On other days: «Avui no és dia d'obertura comercial; el pròxim és …». Add it to `day-dependent.ts` so the sitemap lastmod follows.
- When the DOGC publishes the 2027 municipal days (the page says last year's list came out on 27 Nov), update the 2027 table and Barcelona's two days the same day (factual refresh).

## 7. Weekend agenda
`src/lib/content/weekend/evergreen.ts`, `agenda.ts`. Last commit 7 Oct; title frozen to 4 Nov. Earliest edit **4 Nov**. **P0 code fix now.**

**P0: live now.** The CA page currently lists events outside Catalonia as plans "a Catalunya": «Taula rodona … Escola Municipal de Mallorquí de Manacor» and «Exposició "De claror i de cor" — Biblioteca Can Sales» (fetched 26 Oct). The fix is already committed: **67a4c19** "the Catalan agenda no longer lists events outside Catalonia" (`isInCatalonia`), on main. It is **not deployed**. Deploy it, republish the weekend guide, then check that neither Manacor nor Can Sales appears on any of the three editions.

**Demand.** Tiny: `que fer aquest cap de setmana` 22.8, `què fer a catalunya` 8.7. ES has the stale 25 Sep copy in Google.

**Competition** (`què fer aquest cap de setmana a catalunya`): naciodigital ("25 i 26 d'octubre") and escapadaambnens win on **freshness** (date in title/H1, weekly URL) and **curation** (10–25 hand-picked plans, themed for Castanyada/Halloween). We have a raw list of 168 events.

**Smallest change (4 Nov):** server-render the weekend dates into the lead sentence, without touching the title. Example: «Agenda del cap de setmana del 6 al 8 de novembre: 168 activitats en 64 municipis, 34 de gratuïtes.» This is already computed in the block header; move it to the first paragraph. Then request indexing for ES. Priority stays 1: this page is limited by authority and by the curation format, and a two-line edit will not change that.

---

## Verified-correct list (26 Oct 2026)
- 2026 and 2027 Catalonia-wide holidays and the Aran swaps (Generalitat pages above). These match `calendar.ts` and `payload.ts`.
- Barcelona 2026/2027 local holidays (Ajuntament).
- Clock-change dates 2027–2031 (C/2026/1660).
- CEMB 2026-2027 days (CEMB PDF).
- School-year dates (Girona PDF corroborates Ordre EDF/66/2026).
- The today page's answers for 26 Oct ("no", next 8 Dec, 43 days) are correct.

## UNVERIFIED (do not print)
- Girona's four CEM days (the PDF lists five).
- Ordre EMT/208/2025 date (secondary source only).
- Any 2027 local holidays except Barcelona.
- The Sunday-holiday "trasllat" rule as worded on the today page.
