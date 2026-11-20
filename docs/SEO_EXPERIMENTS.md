# SEO experiments

A log of deliberate changes made to influence search performance, so that what
worked can be told apart from what merely coincided with something else.

## How to use this

One entry per change. Record the hypothesis **before** the outcome is known,
because a hypothesis written afterwards is a description, not a prediction.

Rules that keep the log honest:

- **Do not change a title again inside 28 days.** Position and CTR move on
  their own, and two changes inside one measurement window make both
  unmeasurable.
- **Change one thing.** A title and a description rewritten together cannot be
  attributed.
- **Record the baseline as a range, not a number.** Daily CTR on tens of
  impressions is noise.
- **A negative result is a result.** Reverting is fine; deleting the entry is
  not.

Baselines come from Search Console via MCP, over the 14 days before the change.

---

## 2026-09-24 — English Sitges guide: title answered the wrong question

**URL:** `/en/events/sitges-film-festival-guide/`

**Observation.** Search Console, 10–24 September, page × query:

| Query | Impressions | Position | Clicks |
| --- | --- | --- | --- |
| sitges film festival 2026 | 8 | 9.0 | 0 |
| sitges film festival 2026 schedule | 7 | 7.0 | 0 |
| sitges film festival 2026 program | 6 | 8.2 | 0 |
| sitges film festival 2026 tickets | 4 | 9.5 | 0 |
| sitges festival 2026 | 4 | 7.5 | 0 |
| sitges film festival 2026 lineup | 3 | 10.7 | 0 |
| when is sitges film festival 2026 | 2 | 9.0 | 0 |
| sitges film festival dates | 2 | 9.0 | 0 |
| sitges film festival 2026 dates | 12 | 8.2 | 1 |

About 45 impressions in page-one positions, one click. Every query asks for
**dates, schedule, programme, tickets or line-up**.

**Diagnosis.** Not a ranking problem and not a content problem: the guide
already gives the verified dates (8–18 October 2026, 59th edition), explains
how passes differ from single tickets, and states that the full schedule is not
published yet. The title said none of that.

Before:

```
Sitges Film Festival 2026: a first-timer's guide
The 59th Sitges Film Festival runs 8–18 October 2026. Venues, passes,
getting there by train, and what has actually been announced.
```

After:

```
Sitges Film Festival 2026: dates, venues and tickets
Sitges Film Festival 2026 runs 8-18 October, the 59th edition. Dates, venues,
how passes work, getting there by train, and what is confirmed so far.
```

**Hypothesis.** Leading with the dates matches the dominant intent, so CTR
rises from ~2% toward the 4–8% the Catalan and Spanish pages already get at
similar positions. Position should not move much; if it drops, the change was
not the cause.

**Caveat on timing.** The festival runs 8–18 October, so interest rises sharply
on its own over the next fortnight. Compare CTR at a given position, not raw
clicks, or the festival will take the credit.

**Measure on:** 2026-10-08 (14 days) and 2026-10-22 (28 days).

**Outcome (read 26 Oct, scripts/gsc-compare.py):** no lift. Named queries (dates/schedule/tickets/programme/lineup) 10–23 Sep: 50 impressions, 1 click (2.0%); 25 Sep–22 Oct: 66 impressions, 1 click (1.5%). Position stayed at 9–10 throughout. The title now matched the intent, and it made no difference at position 9: the limit was the position, not the title. The festival ended on 18 Oct.

---

## 2026-09-24 — public holiday calendar published

**URLs:** `/ca/guies/calendari-laboral-catalunya/` and the es/en equivalents.

Not an experiment on an existing page, recorded here because it has a
measurement schedule attached and a clear prediction.

**Prediction.** The page targets a seasonal, recurring query that peaks from
now to January. Nothing on the site currently ranks for it, so any impression
is new coverage rather than a reallocation.

**Measure at:** 1 October (7 days, indexing and first queries), 22 October
(28 days, first performance), 23 December (90 days, near the seasonal peak).

**Do not change the title before 22 October** unless a factual error appears.
Position on a brand-new page is unstable for the first fortnight, and a change
inside that window makes the whole thing unreadable.

**Outcome (read 26 Oct):** ES position 34.5 (25 Sep–8 Oct) → 14.3 (9–24 Oct), clicks 4 → 10; CA flat at position 9.6–10.0, 4 → 5 clicks on 640 → 1,035 impressions; EN ~110 impressions at position 10–11, 1 → 0 clicks. Coverage came, clicks did not: every edition sits at the bottom of page 1 or on page 2, where CTR is under 1%. Next lever is position (content and links), not the title.

---

## 2026-09-25 — tourist tax guide published, with a calculator

**URLs:** `/ca/guies/taxa-turistica-barcelona-catalunya/`,
`/es/guias/tasa-turistica-barcelona-cataluna/`,
`/en/guides/barcelona-catalonia-tourist-tax/`.

Recorded here because it has a measurement schedule and two predictions that
can be wrong.

**Prediction 1 — coverage.** Nothing on the site ranks for any tourist-tax
query today, and the roadmap's cannibalisation check found no existing page
competing for the intent. Any impression is therefore new coverage, not a
reallocation from `/en/barcelona/barcelona-tourist-traps-alternatives/`. If
that page's impressions fall while these rise, the check was wrong and that is
worth knowing.

**Prediction 2 — the English edition leads.** The query is asked in English by
people budgeting a trip from abroad. If ca/es outperform en at 28 days, the
assumption behind the English-lead pages in the roadmap (P03, P05) needs
revisiting before those are written.

**What is deliberately not on the page.** The editorial package supplied a
Barcelona surcharge of €6 from 1 April 2027. It could not be verified against
the Agència Tributària de Catalunya, and the evidence suggests it is the
rest-of-Catalonia five-star rate read off the wrong row. No Barcelona rate is
published for dates after 31 March 2027, and the calculator declines them
rather than guessing. If a competitor outranks us on "barcelona tourist tax
2027" with a figure we would not assert, that is the intended trade.

**Measure at:** 2 October (7 days, indexing), 23 October (28 days, first
performance and the en/ca/es split), 24 December (90 days).

**Do not change any of the three titles before 23 October.**

**Outcome (read 26 Oct):** Prediction 1 (new coverage) held. Prediction 2 (the English edition leads) was **wrong**: 9–24 Oct ES 647 impressions at position 9.2, EN 165 at 6.5, CA 170 at 6.7. Spanish-language demand is four times the English. Revisit the English-lead assumption behind P03/P05. CTR is 0.3–1.8% everywhere: again a position problem.

---

## 2026-09-29 — read before judging any CTR number on this site

Not an experiment. A measurement warning, recorded because two scheduled
readings (Sitges on 8 October, the holiday calendar on 22 October) are both
due to be judged on CTR, and site-wide CTR here is not measuring what it
appears to measure.

**What the per-page query reports show.** Queries attributed to our own pages,
15–29 September:

| Page | Query | Position | Clicks |
| --- | --- | --- | --- |
| `/en/events/sitges-film-festival-guide/` | `d'acord` | 4 | 0 |
| `/en/events/sitges-film-festival-guide/` | `japanise` | 4 | 0 |
| `/en/events/sitges-film-festival-guide/` | `check again` | 5 | 0 |
| `/en/events/sitges-film-festival-guide/` | `si` | 4 | 0 |
| `/en/events/sitges-film-festival-guide/` | `oct 10` | 3 | 0 |
| `/en/nature/mushroom-season-catalonia/` | `avui` | 4 | 0 |
| `/en/nature/mushroom-season-catalonia/` | `demà` | 3 | 0 |
| `/ca/natura/bolets-catalunya-condicions/` | `las dos cosas` | 3 | 0 |
| `/ca/natura/bolets-catalunya-condicions/` | `para ir mañana` | 6 | 0 |

`d'acord` is "OK". `check again`, `si`, `las dos cosas`, `para ir mañana` are
not things a person types into a search box. They are conversational
fragments, they sit at positions 2–6, and they never get clicked.

**Reading.** These are consistent with AI-generated fan-out sub-queries rather
than human searches. Supporting evidence: GA4 reports a distinct **AI
Assistant** channel with 5 users and 10 sessions in nine days, which is real
traffic from the same systems.

**Consequence.** Site-wide CTR mixes two populations with different
denominators, and the AI-side one grew fast through September. That is enough
on its own to explain the headline decline from 11.2% on 17 September to 2.5%
on 27 September without any page getting worse. The English pages are hit
hardest, because their genuine query base is the thinnest, so the fragments are
a larger share of the total.

**Therefore, for every reading from here on:**

- Judge a title change on its **named, intentful queries** in the per-page
  query report, never on the page's aggregate CTR.
- For Sitges on 8 October that means `sitges film festival 2026 dates`,
  `... schedule`, `... tickets`, `... programme`, `... lineup` — the set listed
  in the 24 September entry — and nothing else.
- Do not "fix" a page whose aggregate CTR fell while its named queries held.
  There is nothing there to fix.

**Healthy, for contrast.** `donde hay setas ahora en cataluña 2026`: position
1.5, CTR 16.7%. `bolets catalunya 2026`: position 2.5, CTR 33%. When a real
query meets a page that answers it, this site converts perfectly well.

---

## 2026-10-06 — a page for the question the calendar was not answering

**URLs:** `/ca/guies/es-festiu-avui-catalunya/`,
`/es/guias/es-festivo-hoy-cataluna/`,
`/en/guides/is-today-a-holiday-in-catalonia/`

**Observation.** Search Console, the week to 6 October, every query containing
`festiv`: **166 distinct queries**, of which roughly 145 are the same question
about one particular day.

| Query | Position | Clicks |
| --- | --- | --- |
| `el dia 30 de octubre es festivo` | 6.4 | 0 |
| `30 octubre es festivo` | 5.0 | 0 |
| `festivo 30 octubre` | 6.7 | 0 |
| `12 de octubre es festivo en catalunya` | 56.5 | 0 |
| `el lunes es festivo en catalunya` | 49 | 0 |
| `manana es festivo en catalunya` | 46.5 | 0 |
| `es festivo en catalunya hoy` | 57.5 | 0 |
| `1 de junio es festivo` | 78 | 0 |
| `proximos dias festivos` | 65 | 0 |

**Diagnosis.** Not a ranking problem and not a content problem. The year-planner
calendar is correct, complete and already ranks top-ten when the date asked
about is near. It is answering a different question. A year planner serves
somebody booking leave in January; these people want a yes or a no about one
day, and a twelve-row table of next year's dates does not give it to them.

The two calendar pages carried **772 impressions in one week for four clicks**,
and this long tail is what moved the site's average position from 8.9 to 14.2
between 22 September and 6 October. The impressions are real and the intent is
unserved.

**Action.** A separate page, not a change to the planner. Different intent,
different URL, and the two link to each other. The planner keeps the bridges
and the ICS download; the new page carries neither, and a test enforces that.

**Hypothesis.** A page whose first element is the sentence "No, today is not a
public holiday in Catalonia" will take the date-shaped queries the planner
surfaces for and loses. Specifically: the planner's own CTR should recover as
these queries move off it, and the new page should pick up clicks at a CTR far
above 0.5%, because the query is binary and the answer is visible in the
snippet.

**Caveat on attribution.** Catalonia's national day on 12 October falls inside
the first measurement window, so October is a high-interest month by itself.
Compare the share of festive-query impressions that convert, not raw clicks.

**Measure at:** 13 October (7 days, indexing and first queries), 3 November
(28 days, after both 12 October and 1 November have passed), 6 January (90
days, across the Christmas cluster).

**Do not change any of the three titles before 3 November.**

**Outcome:** _pending_

---

## 2026-10-07 — weekend guide made evergreen; local holidays page; title budget

**Weekend guide** (`/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/` and
es/en). Old title: *"Què fer aquest cap de setmana a Catalunya: 25 plans | 19 i
20 setembre"*, on 7 October. New title, no date: *"Què fer aquest cap de
setmana a Catalunya"*. The body now reads the official agenda live. Same URL.
Hypothesis: the page starts ranking for `que fer aquest cap de setmana`
(position 26-71 before, with a stale page) now that it is about the current
weekend. **Measure 21 October and 4 November.** Do not touch the title before
4 November.

**Local holidays** (`/ca/guies/festius-locals-catalunya/` and es/en). New.
Targets the town-specific long tail of the 166 weekly `festiv` queries.
**Measure 14 October, 4 November.**

**Title budget.** The brand suffix is dropped where it would push a title past
60 characters. Every page inside a logged window above is exempt until its
date. Expect small CTR movement on the affected pages from 8 October onwards;
it is a site-wide change and cannot be attributed to any one page.

**Outcome:** _pending_

---

## 2026-10-11 — titles that promise the answer the query asks for

Search Console, 27 Sep – 11 Oct (data to 8 Oct):

| Page | Query | Pos | Impr | Clicks |
| --- | --- | --- | --- | --- |
| CA parking | preu zona blava barcelona | 1.9 | 18 | 0 |
| CA parking | preu zona verda barcelona | 1.0 | 3 | 0 |
| CA mushrooms | mapa bolets catalunya 2026 | 11.8 | 30 | 0 |
| CA mushrooms | on trobar bolets aquesta setmana (2026) | 4–7.5 | 21 | 0 |
| EN transport | barcelona metro pass / public transport pass | 19–23 | 10 | 0 |

**Change.**
- Parking, all three editions: the price range goes into the title and description
  (blue €1.15–3.75/h, green €1.40–4.25/h, re-checked on areaverda.cat on 11 Oct);
  the year comes out of the title. A searcher asking "preu" at position 1–2 was shown
  a title that said "preus" and gave none.
- CA mushrooms: "Bolets a Catalunya: mapa de condicions aquesta setmana" — the words
  the queries use. Not "on hi ha bolets": the page measures conditions, never presence.
- EN transport: "metro" in the title, which every real query uses. Most of this page's
  impressions are AI fan-out fragments ("3 dagen", "4 tage", "48h") at positions 1–6;
  ignore them when reading its CTR.

**Measure on 25 Oct** (14 days): clicks on the queries above; parking CA/ES CTR at
position ≤3 should be well above 0.

**Outcome (read 26 Oct, 27 Sep–10 Oct vs 12–24 Oct):** Mushrooms CA **positive**: map/this-week queries 54 → 195 impressions, 0 → 5 clicks; `mapa bolets catalunya 2026` position 11.8 → 7.2. Parking **unreadable**: the ES page was last crawled on 30 Sep, so Google never showed the 11 Oct title; the CA page's last crawl is 24 Oct, after the 23 Oct body rewrite, so whether the 11 Oct title was ever shown before then is unknown (0 clicks before and after). Transport EN **unreadable**: the title changed again on 18 Oct.


## 2026-10-14 — Clock change: the date in the title

**Before.** "Canvi d'hora: quan és el pròxim i calendari fins al 2031". First day live:
171 impressions, 1 click, position 5.7, on queries like "canvi d'hora 2026", "quan es
canvia l'hora". The title promised the answer instead of giving it.

**Change.** All three titles name Sunday 25 October ("dormim una hora més" / "clocks go
back"). `tests/clock-change.test.ts` fails once that date passes, so the title is
rewritten to the March change and republished.

**Measure on 24 Oct** (the peak is the week of the change): CTR on the CA/ES page.

**Outcome (read 26 Oct, corrected the same day): unreadable.** URL inspection: the CA page was last crawled on 13 Oct, before the title was deployed (14 Oct), and the three editions all on 12–14 Oct. The 15–24 Oct numbers (6,824 impressions, 19 clicks, 0.3%) measured the **old** title. No conclusion about the date in the title can be drawn from them.


## 2026-10-17 — Mesa electoral and metro hours: the answer in the title

**Before.** "Miembro de mesa electoral: qué hacer, cuánto se cobra y excusas" and
"Horario del metro de Barcelona y del NitBus" (and ca/en equivalents).
GSC 11-17 Oct: "cuánto pagan por estar en mesa electoral 2026" 39 impressions at
position 8.9, 0 clicks; a long tail of "a qué hora abre/cierra el metro" at
positions 10-13, 0 clicks.

**Change (commit b831189).** Mesa: "Mesa electoral 2026: se cobran 75 €, excusas y
qué hacer" (ca/en equivalents). Metro: "Horario metro Barcelona: de 5:00 a 24:00,
viernes hasta las 2:00" (ca/en equivalents). Logged late, on 18 Oct.

**Frozen until 14 Nov** (28 days). Note the 29 Nov election will raise mesa demand
on its own; compare CTR at equal positions, not clicks.

## 2026-10-18 — Barcelona transport passes (EN): the number of days in the title

**Before.** "Barcelona metro pass 2026: T-casual, T-dia or Hola BCN?". GSC 20 Sep-17
Oct: 1,419 impressions, 26 clicks (CTR 1.8 %), position 7.6. The queries are a
long multilingual tail of durations ("3 days", "3 tage", "4 giorni", "48h",
"5 days pass"), one or two impressions each; the page never said what a given
number of days costs.

**Change (branch `sprint/2026-10-19-perf-and-season`, commit 041d054 + title
commit).** Body: a "what 1 to 5 days cost" table in all three editions,
computed from the fare table. EN title only: "Barcelona transport pass for 1 to
5 days: 2026 prices". ca/es titles unchanged (their impressions are too few to
read).

**Deployed 19 Oct 2026; frozen until 16 Nov 2026** (28 days).
Compare CTR at equal positions; the body change can also move position, so
report both.

## 2026-10-24 — Home brand: x-default → `/` and the brand's two spellings (scheduled)

Prepared on branch `sprint/2026-10-24-home-brand`, **not to be deployed before
24 October 2026** (after the tourist-tax reading of 23 Oct, as the candidate
below required).

**Observation.** `catalunya info` 90 impressions / 28 d at position 6.6 for the
site's own name. Tech audit 20 Oct (research_notes/tech_audit_2026-10-20.md §3):
Google chose `/` as canonical of `/ca/` while our hreflang named `/en/` as
x-default; the two-word spelling "Catalunya Info" appeared nowhere, and the
Organization/WebSite markup had no `alternateName`.

**Change.** Home cluster only: `x-default` → `/` (metadata and sitemap). Site
schema: `alternateName` ["Catalunya Info", "catalunyainfo.com"], `url` with its
trailing slash, retired SearchAction removed. Titles untouched.

**Hypothesis.** Position for `catalunya info`, `catalunyainfo` and
`catalunya informacio` improves, and the URL Google shows settles on one of
`/`, `/ca/`, `/es/`, `/en/` per language rather than rotating.

**Measure on 21 Nov** (28 days): position and ranking URL for those queries by
country and language.

**Outcome:** _pending_

## 2026-10-23 — Page-1 sprint: titles and bodies for the queries each page loses

Branch `sprint/2026-10-23-page1`. Baseline: Search Console 26 Sep – 22 Oct
(`reports/growth-graph/`, `scripts/growth-pull.py`): 74 of 174 articles on page 1
(page and its top query at position 10 or better), 32 almost, 25 on page 2,
27 further, 16 with no impressions. Research: `research_notes/page1/*.md`.

**Changed together** (one release, so read per page, not per change):

| Page | Title change | Body change | Query and position before |
| --- | --- | --- | --- |
| Calendar 2027 ES/EN | "12 festivos" / "dates and long weekends" | BOE national list, national vs Catalan, FAQ incl. 30 Oct | calendario laboral 2027 43, festivos catalunya 2027 9, 30 octubre festivo 7.5 |
| School calendar | "2026-2027" in all three | 2025-2026 archive, CEMB source | calendario escolar 25, calendario escolar 2025 42 |
| Tourist tax | "Barcelona i/y Catalunya: tarifes/tarifas i calculadora"; EN "(city tax)" | headings phrased as the question | tasa turistica barcelona 22, city tax barcelona 38-47 |
| Airport ES/CA/EN | "autobús" (ES/CA), "bus" (EN) | bus 46, night buses, answer-first lead | autobus aeropuerto barcelona centro 41, airport to city centre 60-69 |
| ZBE ES/EN | ES "Autorización ZBE…: cómo pedirla"; EN "(LEZ)" | hours, fees, day permits, fine | como pedir autorización 11, lez barcelona 49 |
| T-casual CA/ES | "preu/precio per/por zones" | zone 1-7 table | t casual 24, t casual 3 zonas precio 28 |
| Tibidabo | "entradas / tickets … funicular" | funicular fares, discounts, parking | tibidabo funicular 50, tibidabo tickets 25 |
| Núria | "horaris / horarios / timetable" | low-season timetable, single fares | cremallera de nuria horaris 86 |
| Free museums | "diumenges i primer diumenge" etc. | full city list | sunday free museums barcelona 47 |
| Castanyada | "quan és, on anar-hi" | only dated 2026 events (P0 fix) | castanyada 60, castanyeres 64 |
| Metro hours | none (frozen to 14 Nov) | today's hours block | a qué hora cierra el metro hoy 10.4 |

Site-wide in the same release: related cards topped up from the category
(articles linked from 2-4 pages before), seasonal homepage tools.

**Measure on 20 Nov** (28 days): per page, position and clicks for the queries
above; the count of articles on page 1 against 74. Castanyada and school
calendar change with the season, so read their queries, not their totals.

**Outcome:** _pending_

## 2026-10-24 — Page-1 sprint, round 2: the pages round 1 did not touch

Branch `sprint/2026-10-24-page1-b`. Baseline: Search Console 28 days to 23 Oct
(`scripts/growth-pull.py`): of 216 sitemap URLs, 112 at position 10 or better
over the last 7 days, 69 below, 35 with no impressions (most of them legal
pages). Per-page queries were the brief; pages edited on 23 Oct or under a
frozen title were left alone.

**Changed together** (titles in the words of each page's top queries, an
answer-first lead, the missing facts re-checked against the operator, FAQ):

| Page | Query and position before |
| --- | --- |
| Parking ES (title) + all (body) | como funciona la zona verde 22, zona azul barcelona 33 |
| Zoo & Aquarium ES/CA | horario zoo 12.6, precio entradas zoo 17 |
| Boqueria / markets ES | la boqueria horario 9.5, page 11.8 |
| Reservoirs ES/CA/EN | embalses catalunya 13.5, estat embassaments 42 |
| Barcelona Card vs Hola EN/ES | page 10-15 |
| Cruise port ES/CA | page 22 / 10 |
| Beaches ES/EN | page 17-21 / none |
| Ski resorts ES/CA/EN | estaciones de esquí de cataluña 58, esquí catalunya 63 |
| Snow without skiing | rutes hivern catalunya 67 |
| Setcases | setcases que ver 14, setcases 28 |
| Ripollès (lead now Ripoll) | ripoll 46-51, ripolles 57-64 |
| Cerdanya without a car | page 9-17 |
| Sitges by train ES/CA/EN | barcelona sitges tren 18, barcelona to sitges train 23 |
| Tarragona EN | page 16-20 |
| Montserrat guide ES/CA/EN | cremallera de montserrat horarios 15-35, montserrat rack railway 32 |
| Girona by train | tren barcelona girona 41 |
| Figueres / Dalí | como ir al museo dali desde barcelona 47, figueres museum tickets 42 |
| Day trips by train EN | page 20-30 |
| Andorra by bus EN | page 10-11 |
| PortAventura ES/CA | portaventura barcelona 50, portaventura horaris 41 |
| Christmas markets | none (ES unknown to Google) |
| Shops open on holidays | none (ES discovered, not crawled) |
| Medieval villages CA/ES | pobles medievals de catalunya 56, pueblos medievales 77 |
| Beyond Montserrat, traps, surprising places | none / 20 |
| Autumn food fairs | page 6-16 |

Site-wide in the same release: related cards ranked by subject (full-text
match on title and excerpt) before category; reservoir reading date with the
year; Ripollès live leak fixed (editor's note and raw link code on the page)
and a test that blocks the class.

**Measure on 21 Nov** (28 days): the same count as round 1 (pages at 10 or
better over 7 days, against 112 of 216), and per page the queries above.

**Outcome:** _pending_

---

## 2026-10-26 — Clock change: titles move to the March change (scheduled)

Prepared on branch `sprint/2026-10-26-clock-march`, **not to be deployed before
Monday 26 October 2026**: `tests/clock-change.test.ts` fails on this branch until
25 October has passed, by design.

**Change.** SEO title and description, all three editions, from Sunday 25
October 2026 to Sunday 28 March 2027 (date from Communication C/2026/1660, already
cited on the page). Same pattern as the 14 Oct entry: the date in the title.

**Measure on 23 Nov** (28 days): impressions and CTR at equal position. Demand
falls sharply after the change, so judge CTR, never clicks. The next peak is the
week before 28 March 2027.

## 2026-10-26 — what five readings say: titles do not move CTR below position 5

Read together, the five experiments due between 22 and 25 October suggest,
**with only two of them readable** (corrected 26 Oct after checking crawl dates:
the clock-change and ES parking titles were never crawled):

- A title that names the answer did not raise CTR at position 9 (Sitges, the one
  readable negative). Where a title helped (mushroom map, crawled 25 Oct),
  position improved too.
- **Before reading any experiment, check the page's last crawl date in URL
  inspection.** A change Google has not crawled has not been tested. Several
  pages here go two to four weeks between crawls.
- The pages that convert are the ones at positions 1–4: `donde hay setas ahora`
  at 1.4 converts at 22.6 %; `como votar` at 5.2 at 10.7 %.
- So the next round goes after **position**: content that answers more of the
  query cluster than the top three, freshness, and internal links from the
  pages that already rank. Title changes are the exception, not the tool.

---

## 2026-10-26 — New page: calçot season and the Valls Calçotada 2027

Round 4 (December/January seasonal pages), publish group `calcots`. A new
trilingual guide, `/ca/tradicions/calcotada-valls-temporada-calcots/`,
`/es/tradiciones/calcotada-valls-temporada-calcots/`,
`/en/traditions/calcotada-valls-calcot-season/`. Titles in the words of the
query with the year ("Calçotada de Valls 2027: data/fecha i/y temporada de
calçots", "Calçotada de Valls 2027: date and calçot season"); the lead answers
both questions (season November-April; Sunday 31 January 2027, 45th edition).
Facts checked on 26 Oct 2026 against the festival organiser, the Ajuntament de
Valls, the IGP regulator, the Generalitat, Rodalies and Monbus; the 2027
programme, price and tasting pack are not published, and the page says so.
One sentence linking to it was added to the autumn food-fairs guide (body only,
no title change; that page is inside the 24 Oct window, so read its queries,
not its totals).

**Prediction.** Indexed within 2-3 weeks; by the measure date the ES and CA
pages show impressions for "calçotada valls 2027" / "festa calçotada valls"
variants at position 10 or better, and "temporada calçots" variants inside the
top 20. EN impressions stay small. Demand for the festival date peaks in
January, so a low November count is not a failure.

**Measure 28 days after publish** (published 27 Oct -> 24 Nov): impressions,
position and clicks per query family (festival date / season / IGP and "how to
eat"). Read again in the week after 31 January 2027, and update the page when
the 2027 programme appears (`PROGRAMME_2027` in `batch02/calcots.ts`).

---

## 2026-10-26 — Catalan Christmas traditions page (new, publish group `nadal-tradicions`)

**What.** New trilingual page: `/ca/tradicions/tradicions-de-nadal-catalunya/`,
`/es/tradiciones/tradiciones-navidad-cataluna/`,
`/en/traditions/catalan-christmas-traditions/`. One question per tradition (what
the tió is and when it is made to "poo", the caganer, the pessebre, the Missa
del Gall, els Pastorets, the Christmas food, whether Sant Esteve is a holiday),
answered in the first lines, with the 2026 holidays from the DOGC orders. Mostly
evergreen; the Fira de Santa Llúcia and the Pastorets season are "not announced
yet" lines that switch to dates when `ANNOUNCED_TRADITIONS` is filled. One link
added from the Christmas in Barcelona guide's traditions section. The same
section lost two contested claims (caganer "only in Catalan and Valencian
nativity scenes, Baroque"; Pastorets "18th century"), which the Ajuntament's
Cultura Popular pages contradict. After the events (8 and 13 Dec 2026, 31 Jan
2027) the round-4 pages still read as upcoming: republish them with past-tense
copy, and drop the "el 2026 només és festiu el dimarts 8" sentence from the 2027
holiday guide once 8 Dec has passed.

**Prediction.** No impressions before indexing (1-4 weeks at the current crawl
rate). By the measure date: impressions for "caga tió", "caganer", "catalan
christmas traditions", "qué es el tió", "tradiciones navidad cataluña" and
"sant esteve festiu 2026", with the long-tail "what is / qué es" queries at
position 20 or better. Demand peaks in December, so the 28-day reading is about
indexing and position, not clicks; a second reading in early January.

**Measure** 28 days after publish (if published on 26 Oct, on 23 Nov 2026), then again on
4 Jan 2027: position and impressions per query above, and clicks over 1-31 Dec.

---

## 2026-10-26 — Round 4: December bridge 2026 and La Marató 2026 (new pages)

Branch `sprint/2026-10-30-round4`. Two new trilingual pages, each answering
one dated question in its first two lines, facts re-read on 26 Oct 2026 from
the DOGC, the BOE, the CEMB and 3Cat:

| Page | Publish group | Answer in the lead | Queries aimed at |
| --- | --- | --- | --- |
| `/ca/guies/pont-desembre-catalunya/` (+ es `guias/puente-diciembre-cataluna`, en `guides/december-long-weekend-catalonia`) | `pont-desembre` | only Tue 8 Dec is a holiday; the 6th is a Sunday, the 7th a working day (local holiday in 42 towns) | pont desembre 2026, puente diciembre 2026 cataluña, 7 diciembre festivo cataluña, december holidays catalonia |
| `/ca/guies/la-marato-tv3-3cat/` (+ es `guias/la-marato-tv3-3cat`, en `guides/la-marato-tv3-telethon`) | `marato` | Sun 13 Dec 2026, neurodegenerative and neuromuscular diseases, 35th edition | la marató 2026, marató tv3 2026, marató 3cat, bizum marató |

Links added to existing pages (one sentence each, nothing else changed): the
2027 holiday calendar (bridges intro) -> bridge page; Christmas in Barcelona
("more Christmas events") -> La Marató. Both are inside their 23-25 Oct
windows, so read those pages' own queries as unaffected unless clicks to the
new pages show up in their exits.

**Prediction.** Both enter at position 10 or better for their main query
within 28 days of publishing (the 29N candidates page entered at 5.1 on day
one); demand peaks late November to 8 December (bridge) and 1-13 December
(Marató), so clicks before mid-November will be small.

**Measure** 28 days after publishing (if published on 30 Oct: 27 Nov 2026):
position and clicks per query above, per language. Re-check the Marató page
weekly from mid-November on https://www.3cat.cat/tv3/marato/ and add the
programme times and the donation phone number once 3Cat publishes them.

**Outcome:** _pending_

## 2026-10-27 — New page: strikes hub "Vaga avui a Catalunya: què funciona" (publish group `strikes`)

x10 engines, week 1 (research §B2 #7). One evergreen URL per language, a dated
section per strike: `/ca/guies/vaga-avui-catalunya/`, `/es/guias/huelga-hoy-cataluna/`,
`/en/guides/strike-barcelona-catalonia-today/`. Data in
`src/lib/content/batch02/strikes.ts` (typed list + `STRIKES_AS_OF`), facts read
on 27 Oct 2026 from SEMAF, Rodalies, Ouigo, CCOO, UGT, CGT, USTEC, the BOE and
the DOGC. On that day: Renfe drivers 29 Oct (Rodalies 66% peak / 33% rest),
Ouigo drivers 30 Oct and 2 Nov (71%, every Barcelona train runs), general
strike 11 Nov (minimum services not yet published).

Links added to existing pages (one sentence each, body only, titles
untouched, group `strikes-links`): metro hours (tips list; title frozen to
14 Nov) and transport passes (closing paragraph; EN title frozen to 16 Nov).
Read those two pages' queries as unaffected unless exits to the hub show up.

**Queries aimed at:** vaga avui, huelga hoy cataluña, vaga general 11 novembre,
huelga general 11 noviembre, huelga renfe 29 octubre, serveis mínims vaga,
barcelona strike today.

**Measure** on 24 Nov 2026 (28 days; the 11 Nov week is the peak): position and
clicks per query and language. Indexing lag may miss 11N itself; the page is
built to keep the URL for the next strikes.

**Outcome:** _pending_

## 2026-10-28 — Election cluster: the answers in the body, inside the title windows (deliberate)

Branch `worktree-agent-ad7e6cb4a4b3cd9b2`, publish groups `mesa` and `voting`.
**Body only**: no title, SEO title or description changed, and
`tests/election-cluster.test.ts` pins all six editions to what main serves.

**Why this breaks the one-change-per-window rule on purpose.** The mesa ca/es
title is frozen to 14 Nov (17 Oct entry) and the how-to-vote titles changed on
24 Oct (window to 21 Nov). Demand for both peaks in the fortnight before the
29 Nov vote. Waiting for 21 Nov would leave eight days, less than the two to
four weeks between crawls measured on 26 Oct, so the change would land after
the peak. The cost is that the 14 Nov (mesa) and 21 Nov (voting) readings will
measure title and body together: record them as such, never as title results.

**Observation** (Search Console, 28 days to 27 Oct, as given in the brief):

| Page | Query | Impressions | Position | Clicks |
| --- | --- | --- | --- | --- |
| Mesa ES | cuando se cobra por estar en una mesa electoral 2026 | 75 | 9.1 | 0 |
| Mesa ES | cuanto pagan por estar en mesa electoral 2026 | 66 | 9.1 | n/a |
| Mesa ES | cuanto te dan por ir a la mesa electoral | n/a | n/a | n/a |
| Voting ES | próximas elecciones en cataluña 2026 | n/a | 4.0 | n/a |
| Voting ES | cuándo son las elecciones en cataluña | n/a | 6.4–9.4 | n/a |
| Voting ES | donde tengo que ir a votar 2026 | n/a | 6.1 | n/a |
| Voting CA | quan són les properes eleccions a catalunya | n/a | 10.4 | n/a |
| Voting EN | how to vote 2026 spain general election | n/a | 4.7 | n/a |
| Voting EN | 2026 spain general election how to register to vote | n/a | 5.9 | n/a |

**Change** (facts re-read on 28 Oct 2026 from the BOE, the official 29N mesa
manual, the INE and the Junta Electoral Central;
`research_notes/growth-round3/election-cluster-2026-10-28.md`):

- **Mesa (ca/es/en).** The lead gives the amount (75 €, Orden INT/650/2026,
  which applies to every election held after 27 June 2026; the same figure is
  in the 29N manual the Council of Ministers approved on 27 Oct) and when it is
  paid: no official rule sets the day or method, the order's preamble says such
  payments are still mostly made in cash, and the reader is told to ask the
  Junta Electoral de Zona. "How much" and "when is it paid" are now two
  headings; three FAQ entries use the queries' own wording. The draw note adds
  that a Junta Electoral de Zona can authorise an earlier draw (JEC Acuerdos
  243, 272, 273, 299 and 300/2026).
- **Voting (ca/es/en).** New first section, "next elections": 29 Nov 2026, then
  municipal elections *expected* on 23 May 2027 (LOREG art. 42.3; decree issued
  29 Mar and published 30 Mar 2027, the wording of the results hub), no
  Parlament date. "Where do I vote?" moved to second place and rebuilt around
  the INE's official finder, the census card (2–10 Nov) and the final list of
  tables and venues (from 19 Nov). One link to the per-municipality results
  hub. The EN lead answers the registration question. FAQ in the queries'
  words. The MiDNI line now cites JEC Acuerdo 295/2026 (22 Oct): still
  suspended, to be lifted for MiDNI only once Interior confirms a QR reader at
  every table. **Watch the JEC sessions and update that line when it happens.**

**Hypothesis.** The lever is position, not CTR (26 Oct entry): a page that
answers the exact question in its first lines and under its own heading moves
from 5–10 into the top 3. Prediction: by 25 Nov at least five of the nine
queries above sit at position 3 or better on the 7-day average, and "cuando se
cobra por estar en una mesa electoral 2026" moves from 9.1 to 5 or better.

**Check first:** the last-crawl date of both ES URLs in URL inspection. A body
Google has not crawled has not been tested.

**Measure on 25 Nov** (peak) and **6 Dec** (after the vote): position and
clicks per query above, per language.

---

## 2026-10-28 — Page-1 push: calendars and holidays (work calendar, school calendar, "is it a holiday today")

Owner decision of 28 Oct: windows and frozen titles lifted for these pages.
Baseline: `research_notes/x10/rank-inventory-28oct.json` (GSC 28 days to 27 Oct)
plus GSC query × page for the school and holiday queries. Facts re-read on 28 Oct
on treball.gencat.cat (2026 and 2027 calendars), Barcelona's calendar, the
Ordre EDF/66/2026 PDF, the CEMB proposal PDF and the local open data (no 2027
rows yet); fact pack in `research_notes/calendars-holidays-28oct.md`.

| Page (publish group) | Title before -> after | Body added | Target queries, position now (28 d) |
| --- | --- | --- | --- |
| `/es/guias/calendario-laboral-cataluna/` (`holidays`) | unchanged ("Calendario laboral 2027 Cataluña: 12 festivos y puentes"); description now lists the Easter dates | Semana Santa 2027 table, Barcelona section titled "Calendario laboral Barcelona 2027", local days 2027 (not out yet) -> 11 town pages + `/es/festivos/`, 2026 calendar with the December date pages linked, FAQ (puentes 2027, 14 days in Barcelona, when the local order comes, 7 Dec), link to the school calendar | calendario laboral cataluña 2027 1.0, calendario laboral 2027 catalunya 9.3, festivos catalunya 2027 9.2, festivos 2027 catalunya 10.4, calendario laboral barcelona 2027 23.4 (page 24.1, 7 d 10.9) |
| `/ca/guies/calendari-laboral-catalunya/` (`holidays`) | "Calendari laboral 2027 Catalunya: festius i ponts" -> "…: festius, ponts i Pasqua" | same module | calendari laboral 2027 catalunya 10.1, divendres sant 2027 10.1, pasqua florida 2027 9.6, dilluns de pasqua 2027 5.1, ponts 2027 9.6, festius catalunya 2027 15.6, festes locals catalunya 2027 4.7 |
| `/en/guides/catalonia-public-holidays/` (`holidays`) | "Catalonia public holidays 2027: dates and long weekends" -> "Barcelona & Catalonia public holidays 2027: all dates" (H1 adds Barcelona) | same module | public holidays barcelona 2027 9.5, holidays barcelona 2027 11 (page 9.4, 161 impressions) |
| `/es/guias/calendario-escolar-cataluna/` (`school-calendar`) | "Calendario escolar Cataluña 2026-2027: fechas clave" -> "…: vacaciones y festivos"; H1 now carries 2026-2027 | Christmas 2026-27 answer above the fold, table of every day without school, Barcelona 2026-27 (local + CEMB days with reasons, long weekends), FAQ in query wording, links to town pages; now linked from the ES work calendar and "es festivo hoy" | calendario escolar cataluña 28.2, calendario escolar 2026-2027 catalunya 36, calendario escolar cataluña 26 27 49, hoy hay cole en cataluña 6.3 (page 26.2, 7 d 30.9) |
| CA / EN school editions (`school-calendar`) | "Calendari escolar Catalunya 2026-2027: dates clau" -> "Calendari escolar 2026-2027 Catalunya: vacances i festius"; "…: term dates" -> "…: holidays and term dates" | same module | calendari escolar 2027-2028 8.4, vacances escolars setmana santa 2027 7.3, vacances escolars nadal 2026 9.3 |
| `/es/guias/es-festivo-hoy-cataluna/` (`holiday-today` + deploy for the block) | "¿Es festivo hoy en Cataluña? Respuesta y próximos festivos" -> "¿Hoy es festivo en Cataluña? Hoy, mañana y en tu municipio"; CA "…Avui, demà i al teu municipi"; EN "Is today a holiday in Barcelona and Catalonia? Live answer" | live block: "¿Dónde es festivo hoy?" heading, each town linked to its engine page (INE match), "¿Mañana es festivo?", upcoming holidays linked to the date pages, list of the date questions still ahead; body: "¿Es festivo hoy en tu municipio?" with the 11 largest towns and the hub | hoy es festivo en cataluña 9.3 (7 d 4.6), es festivo hoy en cataluña 11.6, festivos hoy 11.3, festivo hoy cataluña 10.2, mañana es festivo 56.5, donde es festivo hoy 65 (page 23.7, 7 d 42.2: dragged by "festividades" at 85) |

**Why the ES school page lagged** (CA at 5-10): last crawled 9 Oct, so the 23 Oct
title was never seen; its only referring URL was the CA edition; most of its
impressions are Spain-wide generic queries at 30-60; and the Spanish results lead
with a list of the year's days off, which the page only had in prose.

**Prediction.** ES school page into the top 10 for "calendario escolar cataluña
2026-2027" variants once recrawled (it now has two ranking ES referrers); ES work
calendar's Catalonia queries from 9-10 to 5-7; "hoy es festivo en cataluña" holds
top 5 and town pages start receiving clicks from the today page.

**Measure on 28 Nov 2026** (28 days): per page, position and clicks for the
queries above; check the last-crawl date first (rule of 26 Oct). Demand rises in
the first week of December (bridge) and around 22 Dec (school holidays).

---

## 2026-10-28 — Page-1 push, Barcelona practical cluster (owner lifted the freezes)

Owner decision of 28 Oct: "every page on page 1, now"; the 28-day windows and
frozen titles were lifted for these pages (metro hours ca/es were frozen to
14 Nov). Positions below are Search Console, 28 days to 27 Oct
(`research_notes/x10/rank-inventory-28oct.json`). Every new fact was read on
the official page on 28 Oct 2026 and the page's `verifiedAt` moved to that day.
Changed together per page (title, H1, answer-first lead, query-worded H2s,
tables, FAQ), so read per page, not per change.

| Page | Old title → new title | Target queries and position now |
| --- | --- | --- |
| Parking ES (+CA) | "Zona azul y verde Barcelona: precio, horario y cómo funciona" → "Zona verde y azul Barcelona: cómo funciona, precio y horario"; CA "Preu zona blava i verda Barcelona: de 1,15 a 4,25 €/h" → "Zona blava i verda Barcelona: preu, horari i com funciona" | como funciona la zona verde en barcelona 22.2, horario zona azul barcelona 21.8, zona azul barcelona 29.9, zona verde barcelona agosto 18.8, precio zona verde barcelona no residentes 12.4, preu zona blava barcelona 14.4 (lands on ES) |
| Metro hours ES/CA | "Horario metro Barcelona: de 5:00 a 24:00, viernes hasta las 2:00" → "Horario metro Barcelona hoy: a qué hora abre y cierra"; CA "Horari metro Barcelona: 5:00 a 24:00, divendres fins a les 2:00" → "Horari metro Barcelona avui: a quina hora obre i tanca" (EN unchanged) | horario metro 9.9, a que hora abre el metro 10.2, a que hora cierra el metro 13.5, a qué hora cierra el metro hoy 10.4, horario metro viernes 11.6, horario metro domingo 15.4, hay metro toda la noche hoy 8.5, horari metro divendres 9.1, tranvía barcelona horario 53.5 |
| Transport passes ES/CA | "T-casual Barcelona 2026: precio por zonas y Hola BCN" → "T-casual 2026: precio por zonas y tarjetas metro Barcelona"; CA "T-casual Barcelona 2026: preu per zones i Hola BCN" → "Preus targetes TMB 2026: T-casual per zones, T-dia i T-usual" (EN frozen to 16 Nov, unchanged) | t casual 22.2, tarjeta casual precio 22.2, t casual 1 zona precio 21.5, t casual 3 zonas precio 28.3, tarjeta 10 viajes barcelona 27.5, tarjetas metro barcelona 2026 11, hola barcelona vs t casual 8, preus targetes tmb 29, que zona es ocata 49 |
| ZBE EN/CA | "Barcelona low emission zone (LEZ): foreign car rules" → "Barcelona low emission zone (LEZ): foreign cars, hours, fees"; CA "ZBE Barcelona amb cotxe estranger: registre, preu i horari" → "ZBE Barcelona: quins cotxes hi entren, horari i registre" | barcelona low emission zone 26.1, lez barcelona 49, barcelona low emission zone map 16, zbe barcelona foreign car 9 |
| Airport ES/EN/CA | "Aeropuerto de Barcelona al centro: autobús, metro y tren" → "Bus aeropuerto Barcelona centro: 46, nitbus, metro y tren R2"; EN "Barcelona airport to city centre: Aerobús, bus, metro, train" → "Barcelona airport bus to city centre: 46, night bus, metro"; CA → "Aeroport Barcelona al centre: bus 46, nitbus, metro i tren" | autobus aeropuerto barcelona centro 43.8, bus aeropuerto barcelona centro 53.1, tren aeropuerto 58.6, barcelona airport bus to city centre 57.1, aeroport billet 36; new long tail with no impressions yet: bus 46 aeropuerto horario, autobús nocturno aeropuerto barcelona, metro L9 aeropuerto precio, R2 Nord aeropuerto horario. The operator's fares were removed (Aena/AMB name the express bus but publish no fare) |
| Cruise port EN/ES | "Barcelona cruise port to city centre: shuttle, taxi, walk" → "Barcelona cruise port to city centre: Cruise Bus €3.50, taxi"; ES "Muelle Adosado Barcelona: terminales de cruceros y Cruise Bus" → "Moll Adossat Barcelona: terminales de cruceros y cómo llegar" | cruise bus barcelona ticket 6.9, cruise bus barcelona price 11.8, how much is taxi from barcelona cruise port to city centre 8.3, barcelona cruise port taxi 51.2, moll adossat 30, de donde salen los cruceros en barcelona 43, como llegar al puerto de barcelona para embarcar 67 |
| Zoo & Aquarium ES/CA | titles unchanged; body: Flexiticket, Zoo Club, acuario wording | horario zoo 15.7, zoo horario 11.3, precio entrada zoo 14.5, horario del acuario 12.5, precio entrada aquarium 8, a qué hora cierra el zoo 34.5 |
| Free museums ES/CA (+EN body) | "Museos gratis en Barcelona: domingos y primer domingo" → "Museos gratis en Barcelona hoy: MNAC, Picasso y domingos"; CA → "Museus gratis a Barcelona avui: MNAC, Picasso i diumenges" (EN kept: 7-day 7.9) | mnac entradas gratis 12.4, mnac entradas gratis domingo 9.4, mnac gratis sabado 9.7, cuando es gratis el mnac 9, museos gratis hoy 11.2, cuando es el dia de los museos gratis 8, sunday free museums barcelona 47.1, museus gratis barcelona dijous 34 |
| Boqueria ES | title unchanged; H1 "Horario de la Boqueria y de los mercados de Barcelona: días, festivos y normas"; Sunday/holiday openings | la boqueria barcelona horario 9.5, mercado boqueria horario 16, boqueria horario festivos 4, boqueria horarios 42 |
| Tibidabo EN/ES | "Tibidabo tickets, opening days and how to get there" → "Tibidabo tickets and prices 2026, hours and how to get there"; ES "Tibidabo: entradas, calendario y cómo subir en funicular" → "Tibidabo 2026: precio de la entrada, horario y cómo llegar" | tibidabo tickets 20.8, tibidabo tickets price 11.5, tibidabo funicular 50.3, tibibus 17.5, cuanto vale la entrada al tibidabo 20.8, tibidabo horario 19, funicular tibidabo horario 39.5 |

Factual fixes shipped with it: metro "opens at 5:00 every day" (not on Sunday);
"Aerobús runs 24 hours" removed; night buses N17/N18 every 15 min (AMB), not
"midnight-05:00 every 20-30 min"; Museu del Disseny also free on the first
Sunday; Tibidabo funicular €3.95 is for over-60s, not over-65s; cruise MSC row
no longer "taxi only"; terminal C last cruise 30 Oct 2026.

Publish groups: `parking`, `hours`, `transport`, `zbe` (new), `airport`,
`barcelona-hub` (one row lost the operator fare), `cruiseport`,
`family-markets`, `museums`, `hills`.

Not reached in this round: weather month by month ES, Sagrada Família/Park
Güell/Casa Batlló tickets EN, Spotify Camp Nou museum ES, Barcelona Card vs
Hola ES, rainy day EN.

**Measure on 28 Nov 2026**: per page, position and clicks for the queries
above, and for the airport the four long-tail transport queries.

---

## 2026-10-28 — Page-1 push, day trips, nature and destinations cluster

Owner decision of 28 Oct: "every page on page 1, now"; the 28-day windows
are lifted for these pages, so several changes land together on each page
(title, lead, H2s, facts, FAQs, links). Read results per page, not per
change. Branch `sprint/2026-10-28-page1-daytrips`; positions are Search
Console 28-day page × query (rank-inventory-28oct.json); every new fact was
re-read on the official source on 28 Oct 2026 (fact packs in
research_notes/page1-28oct/).

| Page | Old title → new title | Target queries (position now) | What else changed |
| --- | --- | --- | --- |
| `/es/escapadas/vall-de-nuria-cremallera/` (+ca) | Cremallera de Núria: horarios, precios y billetes → **Cremallera Vall de Núria 2026: precios y horarios** (ca: …horaris i preus) | cuanto cuesta el cremallera de nuria 10.4, precio cremallera nuria ida y vuelta 9.8, precio cremallera vall de núria 10.8, cremallera núria gratis 9.3, cremallera vall de nuria 41, cremallera de nuria horaris 85 (CA query on the ES page) | Price in the first line; free riders, 2026-27 forfait status, annual pass, Nov 2025 pattern; strikes-hub and Ripollès links; linked from the trains feature |
| `/es/escapadas/sitges-desde-barcelona-tren/`, `/en/day-trips/sitges-from-barcelona-by-train/` | unchanged (already in query words) | tren barcelona sitges 16.6, barcelona sitges tren 18.9, trenes a sitges 15.1, horario tren sitges barcelona 32.5, barcelona to sitges train 24.1, last train from barcelona to sitges 9.7 | Fixed first pattern train (6:06, not 6:36); return-direction H2; T-casual 3 zones (34.70 €); linked from the Sitges film festival guide (EN 9.4) |
| `/es/guias/embalses-cataluna-hoy/`, `/ca/guies/embassaments-catalunya-avui/` | Embalses de Catalunya hoy: nivel y reservas de agua (ACA) → **live: "Embalses de Catalunya hoy: al 78,3 % (ACA, 27/10)"** (stored fallback: …nivel de los pantanos (ACA)); ca: Estat dels embassaments de Catalunya avui: nivell (ACA) → **live: "Estat dels embassaments de Catalunya avui: 78,3 % (27/10)"** | embalses catalunya 15.0, embalses cataluña 24.8, pantanos catalunya hoy 10.5, capacidad de los pantanos en cataluña 30.5; estat embassaments 38.4, nivell embassaments 20.7 | Title computed in generateMetadata from the ACA reading (src/lib/content/live-title.ts); capacity FAQ; linked from the climate guide (ES 10.7) |
| `/es/guias/estaciones-esqui-cataluna/` (+ca, en) | Estaciones de esquí de Cataluña 2026-27: forfaits y pistas → **Estaciones de esquí Cataluña 2026-27: apertura y forfait** | estaciones de esquí de cataluña 57.6, pistas de esqui cataluña 57.8 (head terms, not the target); long tail: apertura 2026-2027, forfait precio, pistas abiertas (no impressions yet) | Official snow-report links, child day prices, FGC early birds to 8 Dec, Guils discount worded as applied |
| `/es/escapadas/portaventura-desde-barcelona/`, `/ca/escapades/portaventura-des-de-barcelona/` | PortAventura desde Barcelona: horarios, apertura y tren → **PortAventura desde Barcelona: horarios y calendario 2026** (ca: horaris i calendari 2026) | como ir a port aventura desde barcelona 25, horarios tren port aventura 47.5, calendario port aventura 70, cuando cierran port aventura 50.5; portaventura horaris 41, horari port aventura 58.5 | Standard "from 43 €" first (37 € was the Halloween promo); closure 7 Jan–19 Feb in the lead; 10-minute walk (Renfe) |
| `/en/day-trips/montserrat-without-a-tour-from-barcelona/`, `/es/escapadas/montserrat-por-libre-desde-barcelona/` (+ca) | Montserrat rack railway or cable car: times and fares → **Montserrat cable car or rack railway: 2026 times and fares**; es: Montserrat por libre: cremallera y Aeri… → **Cremallera y teleférico de Montserrat: horarios y precios**; ca adds 2026 | montserrat cable car 27.2, montserrat cable car or rack train 15, monistrol vila station 8; cremallera de montserrat horarios 15, horario cremallera de montserrat 42.8, teleferico montserrat 58.5, cremallera montserrat gratis 27; aeri montserrat horaris 31.5 | Aeri table fixed (1 Nov, 7 Dec); free and station FAQs; Trans/Tot rules |
| `/es/escapadas/figueres-museo-dali-desde-barcelona/`, `/en/day-trips/figueres-dali-museum-from-barcelona/` | Cómo ir al Museo Dalí desde Barcelona: tren y entradas → **…: tren, precio, horario**; en: Barcelona to Dalí Museum by train: tickets and hours → **Barcelona to Dalí Museum, Figueres: train, tickets, hours** | como ir al museo dali desde barcelona 42.1, museo dali barcelona 56.2, figueres museo dali precio 61; figueres museum tickets 39.3, barcelona to dali museum train 21, figueres vilafant to dali museum 18.2 | 25 min on foot from Vilafant (Foundation), bus/car, Dalí + La Pedrera ticket, dated hours |
| `/ca/guies/on-veure-neu-catalunya-sense-esquiar/`, `/es/guias/donde-ver-nieve-cataluna-sin-esquiar/` | On veure neu a Catalunya sense esquiar: rutes d'hivern → **Rutes d'hivern a Catalunya: on veure neu sense esquiar**; es → **Dónde ver nieve en Cataluña sin esquiar: sitios y rutas** | rutes hivern catalunya 66.8, on hi ha neu a catalunya 36; donde ver nieve en cataluña 28, sitios de nieve en cataluña 35 | H2s in the query words |
| `/es/destinos/setcases/` (+ca, en) | Qué ver en Setcases: pueblo, miradores, rutas y Vallter → **Qué ver en Setcases y alrededores: qué hacer en un día** | setcases que ver 13.6, que ver en setcases 9.9, que ver en setcases y alrededores 13.3, que hacer en setcases 16.5; en: setcases 10.2 | What-to-do FAQ |
| `/es/destinos/ripolles/` (+ca, en) | Ripoll y el Ripollès: qué ver, monasterio y pueblos → **Ripoll y la comarca del Ripollès: qué ver y pueblos** | comarca del ripolles 86, comarca de ripoll 29, pueblos bonitos cerca de ripoll 26.5, visitar ripoll 46.5; en: ripoll 51 | Comarca section (Idescat: 19 municipalities, 956.6 km², 25,914) and villages table; linked from Núria |
| `/es/escapadas/girona-desde-barcelona-tren/` | unchanged | tren barcelona girona 47.4, trenes barcelona girona 49.3, tren a girona desde barcelona 24 | Train section moved up to follow the lead; Renfe "desde" fares |
| `/en/day-trips/barcelona-day-trips-by-train/` | Day trips from Barcelona by train: 12 towns, times, fares → **Best day trips from Barcelona by train: 12 towns, fares** | day trips from barcelona by train 41.3, best day trips from barcelona by train 32.5 | none |
| `/en/day-trips/tarragona-from-barcelona-by-train/` | unchanged | barcelona to tarragona train 48.6, tarragona combined ticket 30.5 | Last train back fixed (21:56 to 1 Nov, 22:26 from 2 Nov); "free days" → open days |
| `/en/traditions/christmas-markets-catalonia/` | Christmas markets Barcelona 2026: Santa Llúcia & Catalonia → **Barcelona Christmas markets 2026: Santa Llúcia, Catalonia** | barcelona christmas market 80 | Answer-first lead, European Capital of Christmas 2026, two new 2026 fairs, Tarragona/Reus/Girona 2025 references, Christmas page links; linked from the Barcelona hub intro |
| `/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/` (+es, en) | Què fer aquest cap de setmana a Catalunya → **live: "Què fer aquest cap de setmana a Catalunya (30 oct–1 nov)"** | que fer aquest cap de setmana 23.4, què fer aquest cap de setmana 27.2, on anar aquest cap de setmana 14.7 | Title dated from weekendWindow(), the agenda block's own window |

Not touched on purpose: medieval villages (ES/CA), surprising places (ES) and
lesser-known Gaudí (ES/EN) already sit at 6–9 on the 7-day reading after their
late-October edits; editing them now would only reset that.

**Prediction.** The fact-led long tail (prices, "cuándo cierra", "gratis",
station questions, "comarca del Ripollès", "que ver en setcases y
alrededores") reaches positions 1–10 on most pages; the head terms (cremallera
de núria 41, estaciones de esquí 57, museo dali barcelona 56, tren barcelona
girona 47) move less, because resort, operator and booking sites own them.
The live reservoir and weekend titles should raise CTR at the same position.

**Measure** on 28 Nov 2026 (28 days): position and clicks per target query and
language, with `scripts/rank-inventory.py`; record pages that did not move as
authority-limited per RANK_ALL_PLAN rule C.

**Outcome:** _pending_

## 2026-10-28 — Page-1 push, Barcelona sights and weather (weather by month, Gaudí tickets, Camp Nou, Hola vs Barcelona Card)

The pages the Barcelona practical round did not reach. Owner decision of
28 Oct: windows and frozen titles lifted. Positions are Search Console, 28
days to 27 Oct (`research_notes/x10/rank-inventory-28oct.json`; EN weather
queries pulled from GSC for 30 Sep-27 Oct because the inventory has no row
for it). Every new fact was read on the official page on 28 Oct 2026 and
`verifiedAt` moved to that day (climate, monuments, campnou, cards).
Changed together per page, so read per page, not per change.

| Page | Old title → new title | Target queries and position now |
| --- | --- | --- |
| Weather by month ES (+CA body, EN body) | "Tiempo y clima en Barcelona mes a mes: temperaturas y lluvia" → "Clima y tiempo en Barcelona por meses: temperatura y lluvia"; H1 "…mes a mes: clima, temperaturas y lluvia". CA and EN titles kept (EN is growing: "barcelona temperature by month" 8.0, "barcelona weather august" 3, "barcelona weather january" 6.9, "coldest month in barcelona" 5.6) | el tiempo mensual en barcelona 20.5, barcelona clima por mes 20, clima en barcelona en octubre 40, barcelona clima enero 49, clima barcelona enero 59, clima de barcelona en septiembre 77, temperatura barcelona marzo 72, cual es el mes mas frio en barcelona 11, cuando comienza el invierno en barcelona 11, temperatura barcelona invierno 12, cuando empiezan a bajar las temperaturas 88, en que mes llueve mas 7 (page 9.1, 7 d 10.7) |
| Gaudí tickets EN (+ES/CA body) | "Sagrada Familia, Park Güell, Casa Batlló tickets: 2026 prices" → "Sagrada Familia tickets price 2026, Park Güell & Casa Batlló"; H1s in all three now "…tickets 2026: prices and opening hours". ES/CA titles kept | casa batllo entrance fee 42; no other named query yet (page 9.5, 7 d 11.8). Long tail aimed at: sagrada familia tickets price, sagrada familia opening hours, sagrada familia tower tickets, park guell tickets price, park guell opening hours, casa batllo entrance fee |
| Camp Nou ES (+CA/EN body) | "Visita Spotify Camp Nou: precio desde 28 €, horario y cómo ir" → "Museo del Barça y visita Camp Nou: precio, horario, cómo ir"; H1 "Museo del Barça y visita al Spotify Camp Nou: precio, horario y cómo llegar". CA/EN titles kept | camp nou museo horario 11, museo del barça como llegar 7, visita spotify camp nou 25, ir a camp nou 47 (page 9.2, 7 d 8.4) |
| Barcelona Card vs Hola ES (+CA/EN body) | "Hola Barcelona o Barcelona Card: precios y cuál compensa" → "Hola Barcelona Travel Card 2026: precios y cuándo compensa"; H1 "Hola Barcelona Travel Card o Barcelona Card: precios 2026 y cuál compensa". CA/EN titles kept | hola card barcelona 11, hola barcelona travel card conviene 9, hola barcelona card 15, hola card 15, barcelona hola 20, hola barcelona travel card 29, hola card barcellona 43 (page 9.8, 7 d 9.2) |
| Rainy day EN | unchanged (7 d 6.5, improving); one sentence linking the weather page | things to do in the rain near me 10, things to do in barcelona on a rainy day 51 |

**Body changes.** Weather: AEMET 0076 is still 1981-2010 (station page "Periodo:
1981-2010", AEMET help page "periodo de referencia 1981-2010"; no 1991-2020
station table on aemet.es, Meteocat's 1991-2020 climatologies "en elaboració"),
so the page says so in a callout and an FAQ; mean-temperature column and year
row; a Meteocat el Raval 2010-2025 table (city centre); twelve "Barcelona en
enero…" sections with AEMET's monthly record highs and lows; FAQ for "en qué
mes llueve más", "cuándo empiezan a bajar las temperaturas", "temperatura en
invierno", August and December. Gaudí: Sagrada Família price grid (seniors,
under-30s, companions) and April–September hours, evacuation 15 minutes before
closing, metro/bus; Park Güell price list, resident-only hours, how to get
there; Casa Batlló other tickets, disability discount, ticket office 21:00.
Camp Nou: product table (8 tickets), November special hours, buses, booths,
accessibility. Cards: Hola online price €11.25, voucher swapped at any metro
machine within 180 days, Barcelona Card terms ("consecutive days, not 24-hour
periods"), collection offices, Picasso/MNAC free slots corrected (no "in
winter").

**Internal links.** Cards → monuments (body); Christmas in Barcelona (ES 5.5)
→ Camp Nou and monuments (one sentence after the holiday sights table); rainy
day → weather; weather → rainy day; monuments → cards.

Publish groups: `climate`, `monuments`, `campnou`, `cards`, `christmas-bcn`,
`rainy`. Dated content to revisit: Camp Nou November special hours (past after
17 Nov); Museum Flexible "until 28 February 2027"; La Pedrera winter hours to
25 Feb 2027; AEMET records page (updated 30 Sep 2026) and a 1991-2020 table if
AEMET publishes one.

**Measure on 28 Nov 2026**: per page, position and clicks for the queries
above; for the weather ES page, the month queries ("clima barcelona enero",
"clima en barcelona en octubre") are the test of the month sections.

**Outcome:** _pending_

## 2026-10-29 — New page: 11 November general strike (publish group `strike-11n`)

Why: the strikes hub got 136 Google clicks on 28 Oct from the Renfe strike of
the 29th; a general strike draws far more, and the hub's title ("Vaga avui a
Catalunya") does not carry the date people type. A page of its own:
`/ca/guies/vaga-general-11-novembre/`, `/es/guias/huelga-general-11-noviembre/`,
`/en/guides/general-strike-11-november-spain/`. Data in
`src/lib/content/batch02/strike-11n.ts` (one minimum-services slot per sector,
`STRIKE_11N_AS_OF`), facts re-read on 29 Oct 2026 on ccoo.es, 11n.cat, ugt.es,
ugt.cat, cgtcatalunya.cat, sindicat.net, the BOE, the DOGC and Treball's strike
pages. On that day no minimum services had been published.

SEO titles: ca "Vaga general 11 de novembre: serveis mínims i què funciona"
(58), es "Huelga general 11 de noviembre 2026: servicios mínimos" (54), en
"General strike 11 November 2026 in Spain: what runs" (51).

Link added: the hub's 11N section gains one fact line linking here (body only,
hub titles untouched). The group republishes both pages, because every 11N
update (the order coming out, the day after) touches both.

**Cannibalisation risk:** the hub's description names "vaga general l'11 de
novembre" and it already ranks. Read both pages' queries together; if Google
alternates them for the 11N queries, keep the dedicated page as the target
and leave the hub's 11N section short.

**Queries aimed at:** vaga general 11 novembre, serveis mínims vaga 11
novembre, hi ha escola 11N, huelga general 11 noviembre 2026, servicios
mínimos 11 noviembre, hay colegio 11N, hay metro 11 noviembre, general strike
spain 11 november.

**Measure** on 18 Nov 2026 (the week after the strike) and again on 26 Nov
(28 days): position and clicks per query and language for both this page and
the hub.

**Outcome:** _pending_

---

## 2026-10-30 — Top-3 push, evergreen utilities (calendars, "is it a holiday", town template, Barcelona practical)

Owner decision of 28 Oct ("every page in the top 3"): windows and frozen
titles lifted for these pages; several were edited on 28 Oct and are edited
again here (Google had not recrawled most of them: ES school calendar last
crawled 9 Oct, ES "festivo hoy" 28 Oct 02:22 before that day's deploy, metro
EN/ES 13 Oct, parking/tax/shops ES 24-26 Oct). Positions are Search Console,
28 days to 29 Oct (`research_notes/x10/top3-inventory-30oct.json` plus GSC
page × query pulls). Every new fact was read on the official source on
30 Oct 2026 and `verifiedAt` moved to that day. Several things change per
page (title, description, lead, H2s, FAQ, links), so read per page.

**What is new in this round: live snippets.** Three pages now compute their
`<title>` and meta description at render time (`src/lib/content/live-title.ts`,
`liveEntryDescription`), rebuilt nightly by the cron because their blocks are
day-dependent:

- school calendar: the title names the next break (Christmas until 7 Jan,
  then Easter, then the last day, then the next start), the description the
  next weekday off for every school (8 Dec) and the breaks;
- "is today a holiday": the title names the next Catalonia-wide holiday
  counting today ("Próximo festivo: 8 de diciembre"), so a snippet crawled
  before a holiday is still right on the day; it never says "today is not a
  holiday".

| Page (publish group) | Old title → new title | Target queries, position now | What changed |
| --- | --- | --- | --- |
| `/ca/guies/calendari-escolar-catalunya/` (`school-calendar`) | "Calendari escolar 2026-2027 Catalunya: vacances i festius" → live "Calendari escolar 2026-27 Catalunya: Nadal del 22/12 al 7/1"; description live "Pròxim festiu escolar: dimarts 8 de desembre. Nadal: del 22 de desembre al 7 de gener…" | page 4.7-4.8 with ~430 impressions/day and ~1 % CTR (7 d: 2,195 / 18); vacances de nadal 5.0, vacances de nadal 2026 8, vacances nadal escoles 2026 9, dema hi ha escola a catalunya 5.4, dies de lliure disposició 5.5, inici de curs 4.6, quantes setmanes té un curs escolar 5.5, setmana santa 2027 catalunya escolar 7.4, setmana santa 2028 catalunya 6.5, calendari escolar 2027-2028 8.4, ordre edf/66/2026 7.8, festius escolars catalunya 2026 9 | Block: today and tomorrow (weekend / holiday / break / school day) and the next weekday off for everyone. H2s "Ordre EDF/66/2026: com es fixa…", "Dies de lliure disposició i festius locals", "Calendari escolar 2027-2028 i 2028-2029". 7 Dec bridge paragraph + FAQ; school-day count (183 in the general calendar, 177 per school), weeks, Easter 2028, last day before Christmas. Order re-read: consecutive free days need consell escolar + serveis territorials; gradual P3-P5 start; shared bus routes choose the same days |
| `/es/guias/calendario-escolar-cataluna/` (`school-calendar`) | "Calendario escolar Cataluña 2026-2027: vacaciones y festivos" → live "Calendario escolar 2026-27 Cataluña: Navidad 22/12-7/1" | page 27 (7 d): its impressions are Spain-wide head terms (calendario escolar 24, año escolar 54.6, lectivo 38.5, "cuándo empiezan las clases" 40-90); Catalonia ones: calendario escolar cataluña 28.2, hoy hay cole en cataluña 6.3, hoy hay instituto 7.7, calendario escolar 2027-2028 9.2, calendario escolar 2025-26 7.2 | Why it lags: last crawled 9 Oct and its only referring URL is the CA edition. Now linked from all 300 ES town pages (anchor "Calendario escolar 2026-2027") and the snippet names the answer. Request indexing first |
| `/en/guides/catalonia-school-calendar/` (`school-calendar`) | "Catalonia school calendar 2026-2027: holidays and term dates" → live "Catalonia school calendar 2026-27: Christmas 22 Dec–7 Jan" | page 4.3 (312 impressions), barcelona school holidays 2027 6.5 | same module |
| `/es/guias/calendario-laboral-cataluna/` (`holidays`) | title kept ("Calendario laboral 2027 Cataluña: 12 festivos y puentes"); description → "Los 12 festivos 2027 en Cataluña: 1 y 6 de enero, 26 y 29 de marzo, … 6, 8 y 25 dic. Y los puentes." | page 10.0 (1,655 / 14 clicks); calendario laboral cataluña 2027 1.0, calendario laboral 2027 catalunya 9.5, festivos catalunya 2027 9.3, festivos 2027 catalunya 10.1, calendari laboral 2027 catalunya 8.6 (CA query on the ES page); "30 de octubre es festivo" 6-8 (expired) | Working days 2027 (252; 250 with two local days) as key fact + FAQ; the past 30 Oct FAQ → "¿El lunes 2 de noviembre es festivo?" linked to the 1 Nov date page |
| `/ca/guies/calendari-laboral-catalunya/` (`holidays`) | title kept ("Calendari laboral 2027 Catalunya: festius, ponts i Pasqua"); description lists all twelve dates | page 9.5; calendari laboral 2027 catalunya 9.6, divendres sant 2027 10, ponts 2027 9.6, pasqua florida 2027 9.2, dilluns de pasqua 2027 5.1, festius catalunya 2027 15.6, festes locals catalunya 2027 5 | same; town pages now link it as "Calendari laboral 2027 de Catalunya" |
| `/es/guias/es-festivo-hoy-cataluna/` (`holiday-today`) | "¿Hoy es festivo en Cataluña? Hoy, mañana y en tu municipio" → live "¿Hoy es festivo en Cataluña? Próximo festivo: 8 de diciembre" (CA "Avui és festiu a Catalunya? Pròxim festiu: 8 de desembre", EN "Is today a holiday in Barcelona and Catalonia? Next: 8 Dec") | page 21.8 (dragged by "festividades" 85.5 and "mañana es festivo" 54.1); hoy es festivo en cataluña 9.1 (14 d 7.1), es festivo hoy en cataluña 11.2, festivos hoy 10.1 (14 d 2.6), festivo hoy cataluña 10.1, hoy es fiesta en cataluña 12.5, donde es festivo hoy en cataluña 5.3, hoy es festivo 17.1 | FAQ in the query words (hoy, mañana, dónde es festivo hoy, Barcelona) linking the 11 Nov, 30 Nov and 7 Dec date pages with their counts |
| Town template `/es/festivos/<town>/`, `/ca/festius/<town>/` (static, ships with the deploy) | "Festivos locales Girona 2026 y 2027: qué días son festivo" → "Festivos locales Girona 2026 y 2027: ¿hoy es festivo?"; CA "…: quins dies són festa" → "…: avui és festiu?" | Girona page 7.4 (hoy es festivo en girona 9.6, hoy es fiesta en girona 9.1, mañana es festivo en girona 9); Barcelona 10.0 (el lunes 2 de noviembre es festivo en barcelona 8.2, el lunes es festivo en barcelona 9.5); Tarragona 8.2 (festivos tarragona 2027 5.8, calendario laboral tarragona 2027 9.8, festivos locales tarragona 2027 7.3); calendario laboral reus 2027 4.9, badalona 2027 8.8, mataro 2027 6.1, festivos granollers 2027 7.4 | Description: both local dates first, then "Calendario laboral 2027, si hoy o mañana es festivo". New FAQ + FAQPage JSON-LD: hoy, mañana, calendario laboral 2027 (Aran-aware; local 2027 pending), and the next two asked working days with a date page (2 Nov, 11 Nov…) answered yes / some nuclei / no from the DOGC snapshot. Links: school calendar in "En la escuela", shop-opening guide in the shops section, year in the guide anchors |
| `/en/guides/barcelona-weather-by-month/` (`climate`) | "Barcelona weather by month: temperatures, rain, sunshine" → "Barcelona weather and temperature by month (°C and °F)" | page 6.4 (1,461 / 2 clicks); temperature by month 8.6, weather january 7.6, weather by month 9.2, weather august 3, coldest month in barcelona 4.5, by month celsius 10.5, winter temperature 9.1 | Coldest/warmest/wettest month with °C/°F in the description and lead; °F throughout; humidity column (AEMET 0076, 67-73 %) |
| `/en/guides/barcelona-metro-hours/` (`hours`) | "Barcelona metro hours: 5:00 to midnight, Fridays until 2:00" → "Barcelona metro hours: closes 12am, 2am Fri, all night Sat" | page 6.4; today metro closing time 10.8, last metro in barcelona 7.5, does the barcelona metro run all night 4.4, is barcelona metro 24 hours 8.3, how late does barcelona metro run 7.4, nitbus barcelona 8.2 | Last-metro answer first; "What time is the last metro" / "Does it run 24 hours" H2s; seven outer stations 5:00-24:00 every day (TMB); NitBus frequency corrected |
| `/es/guias/horarios-metro-barcelona/` (`hours`) | title kept ("Horario metro Barcelona hoy: a qué hora abre y cierra") | page 10.5; horario metro 9.9, a que hora cierra el metro 12.8, horario metro viernes 11.6, horario metro domingo 15.4, hay metro toda la noche hoy 8.5, hasta que hora funciona el metro 9.7 | "Último metro" H2, station row, FAQ |
| `/en/guides/barcelona-transport-passes/` (`transport`) | "Barcelona transport pass for 1 to 5 days: 2026 prices" → "Barcelona transport pass 2026: T-casual €13, 1 to 5 days" | page 7.5; barcelona transport pass 17.9, t casual barcelona 10.5, t-dia barcelona 7, hola barcelona travel card price 9.2 | Zone table, T-familiar/T-grup, Hola vs T-casual computed, FAQ (TMB fares re-read) |
| `/es/guias/tarjetas-transporte-barcelona/` (`transport`) | "T-casual 2026: precio por zonas y tarjetas metro Barcelona" → "Precio T-casual Barcelona 2026: 13 € (1 zona) y 25,50 € (2)" | page 8.3 (683 / 0 clicks); t casual 19.6, tarjeta de metro barcelona precios 2026 12.8, precio t casual 16.8, precio t casual 2026 10, t casual 2 zonas precio 2026 9.7 | Price in title and description |
| `/en/guides/barcelona-zoo-aquarium-tickets/` (`family-markets`) | "Barcelona Zoo tickets and prices 2026: €23, Aquarium €30" → "Barcelona Zoo & Aquarium tickets 2026: Zoo €23, Aquarium €30" | page 7.9; zoo tickets 9.7, zoo prices 8.6, aquarium tickets price 9.5, aquarium and zoo tickets 10.6, aquarium family ticket 9 | Answer-first lead (no stale Aquarium hours), family pack, companion rule |
| `/es/guias/aparcar-barcelona-zona-azul-verde/` (`parking`) | "Zona verde y azul Barcelona: cómo funciona, precio y horario" → "Zona azul y verde Barcelona: cómo funciona, horario y precio" | page 8.5 (1,615 / 2 clicks); como funciona la zona verde en barcelona 21.9, horario zona azul barcelona 16.8, precio zona azul barcelona 9.2, zona azul barcelona precio hora 10.8, zona verde trinitat vella 9, parquimetro en barcelona 17.2 | Day-by-day "when you pay" table, maximum stay per rate, zone 36 Trinitat Vella (from 9 Nov), AREA map, card-only meters; linked from Christmas in Barcelona |
| `/ca/guies/aparcar-barcelona-zona-blava-verda/` (`parking`) | "Zona blava i verda Barcelona: preu, horari i com funciona" → "Preu zona blava i verda Barcelona: 1,15-4,25 €/h i horari" | page 5.3; preu zona blava barcelona 4.9, preu zona verda barcelona 5.8, preu zona verda barcelona no residents 7.6, zona blava barcelona diumenge 6 | same module |
| `/es/guias/tasa-turistica-barcelona-cataluna/` (`tourist-tax`; CA title too) | "Tasa turística Barcelona y Cataluña: tarifas y calculadora" → "Tasa turística Barcelona 2026: 6 a 12 € por persona y noche" (CA "Taxa turística Barcelona 2026: de 6 a 12 € per persona i nit") | page 7.3 (1,263 / 6); tasa turistica barcelona 12.5, cuanto es la tasa turistica en barcelona 9.6, cuanto cuesta la tasa turistica en barcelona 8.6, tasa turistica catalunya 9.5, taxa turistica barcelona 10.3 (on ES), impuesto turistico barcelona 17 | Range in the first line; seven municipal surcharges since 1 Oct 2026 (ATC); gaming-area hotel rate; FAQ |
| `/es/guias/tiendas-abiertas-festivos-cataluna/` (`shops`; CA body) | "Tiendas abiertas en domingos y festivos en Cataluña 2026-27" → "Domingos y festivos de apertura 2026 en Cataluña y Barcelona" | ES 5.6, CA 5.9; domingos y festivos de apertura 2026 3.3, festivos y domingos de apertura 2026 4.0, domingos de apertura 2026 4.3, festivos apertura cataluña 2026 7.2, festivos que abren los centros comerciales 2026 8.2, horarios comerciales cataluña 7.3; CA festius obertura comercial 2026 8 | Days left in 2026 first; table of the 30 towns whose Nov-Dec days differ; malls section; 300 m² exemptions restored (Llei 3/2023 art. 83 re-added art. 37.1.j-k after STC 117/2022; BOE consolidated text checked 30 Oct) |

**Not done on purpose.** A live "tonight" title for metro hours: a stale
snippet would say the wrong closing time on another day; the static title
now carries the full rule (midnight, Friday 2:00, Saturday all night).
Head terms left alone: "calendario escolar", "calendario laboral",
"festividades", "zona azul barcelona", "tasa turistica barcelona" at 12-85.

**Prediction.** CA school calendar CTR from ~1 % to 3 %+ at the same
position (the snippet now names Christmas and the next day off); ES school
calendar into the top 10 for its Catalonia queries once recrawled with 300
new internal links; "hoy es festivo en cataluña" into the top 5; town pages
take clicks on "festivos <town> 2027" / "calendario laboral <town> 2027" in
December when the 2027 local order appears; price-in-title pages (passes ES,
tourist tax, zoo, weather) gain CTR at positions 7-10.

**Measure on 30 Nov 2026** (28 days): per page, position and clicks for the
queries above, with `scripts/rank-inventory.py`; check the last-crawl date
first. Demand peaks to read separately: 7 Dec bridge, 22 Dec school break,
the DOGC local-holiday order for 2027 (mid-December).

## 2026-10-30 — Top-3 push, news cycle: strikes, elections, Christmas (owner lifted the freezes)

Why: the owner's 28 Oct decision ("every page in the top 3"). These pages peak
in the next four weeks (11N, 29N, the lights switch-on, Santa Llúcia, the
December bridge). Positions below are the 7-day GSC positions in
`research_notes/x10/top3-inventory-30oct.json`. Every new fact was read on
30 Oct 2026 on the organiser's or the official page; nothing press-only.

**Strikes hub** (`strikes`, republished by `strike-11n`). 7,029 impr. ES at 5.9.
- Titles: ca "Vaga avui a Catalunya: què funciona i serveis mínims" → "Vaga
  avui i demà a Catalunya: què funciona i serveis mínims"; es "Huelga hoy en
  Cataluña: qué funciona y servicios mínimos" → "Huelga hoy y mañana en
  Cataluña: qué funciona y calendario"; en "Strike in Barcelona and Catalonia
  today: what runs" → "Barcelona strike today: trains, metro and what runs".
  Descriptions now name the strike in progress first ("Huelgas: médicos desde
  el 28 de octubre, Renfe el 10 y el 12 de noviembre, huelga general el 11…").
- Body: lead answers "is there a strike today" (strikes under way on the as-of
  day), then "coming up", then whether metro, bus and FGC are touched; new
  "what runs" table, one row per service. New entries: Metges de Catalunya's
  indefinite doctors' strike since 28 Oct (Treball order of 22 Oct, e-Tauler
  654506) and SEMAF's Renfe drivers' strike on 10 (full) and 12 Nov (partial),
  SEMAF notice 2026-51. 29 Oct now cites the order itself (e-Tauler 654526).
  Left out: Ouigo 6/9 Nov and 4/8 Dec (no readable official source).
- Target queries and positions now: huelga hoy 8.4, hoy hay huelga 5.8,
  mañana hay huelga 7.8, huelga mañana 9.1, vaga hoy 6.4, hay vaga mañana en
  cataluña 2.6, huelga cataluña 6.6, train strike barcelona 8.8, strike
  barcelona today 2.5, vaga avui 6.0, vaga renfe catalunya 9.5. Dated queries
  (vaga 29 octubre 8.9) are left to fade.

**11N page** (`strike-11n`): as of 30 Oct; SEMAF's 10 and 12 Nov strikes in
the lead, key facts, Rodalies/long-distance sections and FAQ; the doctors'
strike in the health section. Titles unchanged. Targets: huelga general 11
noviembre barcelona (6.7 on the hub), serveis mínims vaga 11 novembre (2.2 on
the hub).

**How to vote** (`voting`). ES 3,291 impr. at 5.5, EN 1,936 at 5.4 (1.4% CTR).
- Titles: ca "Properes eleccions a Catalunya: 29N, on i com votar" → "Properes
  eleccions a Catalunya: quan són i on votar el 29N"; es "Próximas elecciones
  en Cataluña: 29N, dónde y cómo votar" → "Próximas elecciones en Cataluña:
  cuándo son y dónde votar"; en "How to vote in Spain's 2026 general election
  (29 November)" → "Spain general election 2026: how to vote, register,
  dates". Descriptions state the date, hours and "sin DNI ni Cl@ve".
- Body: INE finder linked in the lead with what it asks for; FAQs "dónde voto
  con el DNI" (ca/es/en), EN key dates and polls' hours.
- Targets: próximas elecciones en cataluña 2026 4.0, cuando son las elecciones
  en cataluña 6.4, cuándo son las próximas elecciones en cataluña 6.3, donde
  tengo que ir a votar 2026 6.4, donde voto el 29 de noviembre 8.3, donde voto
  dni 2026 7.8, quan son les proximes eleccions a catalunya 10.2, 2026 spain
  general election how to register to vote 6.2, 2026 spain general election
  dates 8.2.

**Candidates** (`candidates`). ES 2,419 impr. at 4.8 (18% CTR: ES and EN titles
kept). ca "Candidats eleccions generals 2026 a Barcelona i Catalunya" →
"Candidats i llistes electorals 2026 a Barcelona i Catalunya". Lead links the
BOE of 28 Oct (BOE-A-2026-22607, filed lists); first FAQ "qui es presenta /
cuáles son los candidatos". Targets: llistes electorals 2026 5.7,
candidatures eleccions generals 2026 5.8, qui es presenta a les eleccions
generals 4.3, cuales son los candidatos para las elecciones 2026 7.2.

**Christmas in Barcelona** (`christmas-bcn`; `nye` too, its "not announced"
line now carries 30 Oct). ES 2,189 impr., 38 clicks at 5.9.
- Titles: ca "Nadal a Barcelona 2026: encesa de llums i què obre" → "Encesa
  de llums de Nadal Barcelona 2026: quan és i què obre"; es "Navidad en
  Barcelona 2026: encendido de luces y qué abre" → "Luces de Navidad Barcelona
  2026: cuándo es el encendido"; en "Christmas in Barcelona 2026: lights and
  what's open" → "Barcelona Christmas lights 2026: switch-on date, what's
  open". Description built from ANNOUNCED_2026 ("aún sin fecha oficial (en
  2025, sábado 22 de noviembre)" until the date is out).
- Nothing announced on 30 Oct (press room, barcelona.cat/nadal); the leads now
  say "comprobado el 30 de octubre".
- Targets: encendido luces navidad barcelona 2026 6.2, cuando encienden las
  luces de navidad en barcelona 2026 5.5, encesa llums nadal barcelona 2026
  6.3 (ES page) / 8.0 (CA page), encesa de llums barcelona 2026 6.3, luces
  navidad barcelona 2026 9.6.

**Christmas markets** (`christmas`): ca "Mercats de Nadal Catalunya 2026:
Santa Llúcia i dates" → "Fires i mercats de Nadal Catalunya 2026: dates i
llocs"; es "Mercados de Navidad Cataluña 2026: Santa Llúcia y fechas" →
"Mercados navideños Cataluña 2026: fechas y Santa Llúcia". Santa Llúcia line
dated 30 Oct (organiser still shows 2025). Targets: fires de nadal catalunya
2026 6.4, mercados navideños cataluña 2026 6.2, fires nadal catalunya 2026 7.8
(ES page, a CA query: the CA title now carries "fires").

**La Marató** (`marato`): CA 657 impr., 4 clicks at 6.1. ca "La Marató de TV3
2026: quan és, causa i com fer un donatiu" → "La Marató de TV3 2026: 13 de
desembre, causa i donatius"; es "La Marató de TV3 2026: cuándo es, causa y
cómo donar" → "La Marató de TV3 2026: 13 de diciembre, causa y cómo donar".
Targets: marató tv3 2026 7.8, marato tv3 2026 7.7, marató tv3 2026 data 4.4.

**December bridge** (`pont-desembre`): titles kept ("only the 8th" would be
wrong in the 43 towns where Monday 7 is a local holiday); ca/es descriptions
list 8, 25 and 26 December, Purísima named; FAQ "¿Cuándo es el puente de la
Purísima de 2026?". Targets: puente de la purisima 2026 5.2, festivos
diciembre 2026 5.3, cuando es el puente de diciembre 7.3, pont de desembre
2026 5.7.

**Measure** on 30 Nov 2026 (position, CTR and clicks per target query and
language; for the strikes pages also the week of 9-13 Nov).

**Outcome:** _pending_

## 2026-10-30 — CTR sweep: pages whose CTR is under half the site's own curve (wave 3)

Input: `research_notes/x10/ctr-sweep-30oct.json`, the site's CTR by position
over 28 days (4: 7.3 %, 5: 7.3 %, 6: 3.0 %, 7: 1.7 %, 8: 1.8 %, 9: 0.8 %)
and the pages under half of it, plus `top3-inventory-30oct.json`. The lever
is the snippet: title and description state the specific answer, then the
lead. Owner decision of 28 Oct: freezes lifted (mesa ca/es was frozen to
14 Nov). Positions are 28-day (7-day where marked). Every new fact was read
on the official source on 30 Oct 2026.

| Page (publish group) | Old title → new title | Target queries, position now | What changed |
| --- | --- | --- | --- |
| `/en/nature/fall-colors-catalonia/` (`autumn`) | "Catalonia fall colors 2026: best places and timing" → "Catalonia fall colors 2026: where to see them in November" | page 4.1, 406 impr., 3.4 % vs 7.3 % expected; queries anonymised ("when does foliage start", "now?", "esta semana" at 1) | Description and first line name the windows still open (Salenques late Oct-early Nov, Val d'Aran tourism board; Bonabé and Sant Joan to the first half of Nov, Alt Pirineu park, both re-read) and the late forests near Barcelona. Status block (ca/es/en) re-dated 30 Oct, framed "late Oct + first half of Nov"; XEMA minimums re-read (latest day 24 Oct). FAQ (ca/es/en): when foliage starts, near Barcelona, "are they out now" |
| `/en/guides/spain-election-night-results/` (`election-night`) | "Spain election results 29 November: times and the count" → "Spain general election results 2026: what time, where" | page 5.0, 281 impr., 2.1 %; 2026 spain general election results 5.2, spain elections 2026 results 5, spain election results 2026 4.6, "at what time the polls open … 29th november" 5.8, when is the spain election 4 | Polls 9:00-20:00 in the description, lead, timeline (ca/es/en) and FAQ (29neleccionesgenerales.es "voto presencial"). Interior still announces no results site or time (29-N page and 29neleccionesgenerales.es checked 30 Oct): the page says so, no link added |
| `/ca/guies/temps-barcelona-mes-a-mes/` (`climate`) | "Temps i clima a Barcelona mes a mes: temperatures i pluja" → "Temps a Barcelona mes a mes: temperatures mitjanes i pluja" | page 4.6, 176 impr., 1.1 %; temps a barcelona 6, temps barcelona ahir 8.5, temperatures barcelona 12 (live-weather intent) | Description opens with November (17,3/8,6 °C) and December (14,3/5,7 °C); lead opens with the Jan-Aug range and links the Meteocat municipal forecast for "el temps d'avui" |
| `/es/guias/tiempo-barcelona-mes-a-mes/` (`climate`) | title kept ("Clima y tiempo en Barcelona por meses: temperatura y lluvia") | page 8.6, 183 impr., 0 clicks; temperatura barcelona 4.5, cual es el mes mas frio 11, cuando comienza el invierno 11, en que mes llueve mas 7 | Same description and lead pattern, AEMET municipal forecast linked |
| `/es/guias/festivos-locales-cataluna/` (`local-holidays`; ca/en body too) | "Festivos locales de Cataluña por municipio" → "Festivos locales Cataluña 2026 por municipio: busca el tuyo" (CA "Festius locals Catalunya 2026 per municipi: busca el teu") | ES page 5.7, 359 impr. since 25 Oct, 0.8 %; queries anonymised; CA 5.2 | Lead links /es/festivos/ and the six largest towns' pages; a paragraph gives the busiest local days left in 2026 (11 Nov: 50 places, 30 Nov: 38, 7 Dec: 45, from the DOGC snapshot the date pages use) with links to each date page; 2027 order said to be pending |
| `/en/day-trips/portaventura-from-barcelona/` (`portaventura`) | "PortAventura from Barcelona: opening times, tickets, train" → "PortAventura opening dates 2026-27 and train from Barcelona" | page 7.6 (7 d 9.4), 527 impr.; ouverture portaventura 2027 1, when is portaventura open 1, horario portaventura octubre 2026 1, how to get to portaventura from barcelona 7.7, "are they open in january" 4 | Description lists the season (daily to 6 Jan; closed 7 Jan-19 Feb; weekends from 20 Feb; daily from 18 Mar). Park feed re-read Oct 2026-Apr 2027, unchanged; FAQ "Is PortAventura open in January 2027?" |
| `/en/guides/parking-in-barcelona-blue-green-zones/` (`parking`) | "Barcelona street parking prices: €1.15 to €4.25 an hour" → "Barcelona blue and green zone parking: hours, prices, rules" | page 6.0, 186 impr., 0.5 %; green zone parking barcelona 5, barcelona parking zones 42 | Description: blue Mon-Fri 9:00-20:00, visitors 1-2 h in green, Sundays free away from the beach (AREA facts re-read by the parking push the same day) |
| `/en/guides/barcelona-catalonia-tourist-tax/` (`tourist-tax`) | "Barcelona tourist tax (city tax): rates and calculator" → "Barcelona tourist tax 2026: €6 to €12 per person per night" | page 6.5, 215 impr., 1.4 %; barcelona tourist tax calculator 4 | Range, €5 city surcharge, 7-night cap and age exemption in the description, computed from the rate table |
| `/es/naturaleza/setas-cataluna-condiciones/`, `/ca/natura/bolets-catalunya-condicions/` (`mushrooms`) | ES/EN titles kept; CA "Bolets a Catalunya: mapa de condicions aquesta setmana" → "Mapa bolets Catalunya 2026: on trobar-ne aquesta setmana" | ES 4.7 (donde hay setas ahora en cataluña 2026 1.4, 168 clicks; mapa bolets catalunya 2026 7.9, a CA query on the ES page, 232 impr.); CA 6.2 (on trobar bolets aquesta setmana 2026 8.1, mapa bolets catalunya 2026 9.1, previsio bolets catalunya 8.3) | Description now live per refresh: reading date + wettest zones (`liveDescription`, ≤ 155); the lead is that dated answer. ES intro links the CA page. Data pipeline untouched |
| `/en/guides/polling-station-duty-spain/`, `/ca/guies/membre-mesa-electoral/`, `/es/guias/miembro-mesa-electoral/` (`mesa`) | ca "…2026: es cobren 75 €, excuses i què fer" → "Membre de mesa electoral 2026: 75 €, sorteig i excuses"; es "…: se cobran 75 €, excusas y qué hacer" → "Mesa electoral 2026: se cobran 75 €, sorteo y excusas"; EN title kept | EN 3.5 (7 d), 389 impr., 1 %: its queries are Spanish ("cuanto pagan" 3, "cuanto se cobra por mesa electoral" 3); CA 5.1, ES 8.3 | Descriptions lead with the draw (31 Oct-4 Nov), 3-day notice, 7 days to object (JEC calendar re-read), €75 tax-free. The draw starts on 31 Oct |
| `/en/guides/la-boqueria-barcelona-markets/` (`family-markets`) | "La Boqueria opening hours and Barcelona market times" → "La Boqueria opening hours 2026: Mon–Sat 8:00–20:30" | 7 d 9.2, 264 impr., 0 clicks; la boqueria barcelona opening hours 10.6, is la boqueria open on sundays 6, what time does la boqueria close 9.8 | Description answers Sundays/holidays (Ajuntament market page re-read) |
| EN Christmas markets (`christmas`), December bridge (`pont-desembre`), La Marató (`marato`) | "Barcelona Christmas markets 2026: Santa Llúcia, Catalonia" → "Barcelona Christmas markets 2026: dates, Santa Llúcia fair"; "December 2026 public holidays in Catalonia: 6, 7 and 8 Dec" → "…: 8, 25 and 26 Dec"; "La Marató 2026 (TV3 telethon): date, cause, how to donate" → "La Marató 2026: TV3 telethon on 13 December, how to donate" | EN titles the news-cycle push left unchanged | Descriptions state the answer like the ca/es ones (Santa Llúcia not out, 2025 dates; Monday 7 a working day except in 43 towns) |

**Not done on purpose.** Live (render-time) descriptions for the climate
pages: they are not day-dependent pages the cron revalidates; the static
description names November and December and should be revisited in January.
"Quants dies després de ploure surten els bolets" (CA, 21.7): no official
source could be read today, so no answer was added. EN candidates (5.2,
2.5 %): its impressions are `site:boe.es` operator queries, not readers.

**Prediction.** Fall colors EN and election night EN back to the curve
(≥ 7 % at 4-5); CA climate and ES local holidays ≥ 3 %; PortAventura EN,
parking EN, tourist tax EN, Boqueria EN ≥ 2 % at 6-9; "mapa bolets
catalunya 2026" moves from the ES to the CA page.

**Measure on 30 Nov 2026** (28 days): position, CTR and clicks per page and
per target query; for the mushroom pages, which page the CA queries land on.

**Outcome:** _pending_

## 2026-10-30 — CTR sweep wave 4 (7-day data)

Input: Search Console, 23-30 Oct 2026 (`dataState: all`), page and
page × query; list and dispositions in
`research_notes/x10/ctr-sweep-wave4-30oct.json`. Seven days, not 28, because
many pages only started ranking this week. The curve is the site's own,
page-level (every page's clicks over its impressions, by rounded position,
pooled where a later position beat an earlier one): 1: 16.7 %, 2: 13.8 %,
3: 7.2 %, 4-5: 6.3 %, 6: 3.8 %, 7: 1.0 %, 8: 0.8 %, 9-12: 0.6 %. The
query-level curve is useless here: anonymised queries carry most clicks
(page × query rows hold 340 of ~2,500).

**The shortlist (≥ 80 impressions, position ≤ 10, CTR under half the curve)
has 32 pages, and 30 are not touched**, because the 30 Oct entries above
(merged, not deployed: Google has not seen those titles) already rewrote
them, or another agent owns them (Christmas lights ca/es, La Marató,
`src/lib/programmatic/elections/`), or the clock-change titles moved to March
on 26 Oct. For each rewritten page the pending title was compared with the
7-day queries; only one still missed them. The JSON gives the reason per page.

| Page (publish group) | Title served → title merged 30 Oct (never served) → new | Baseline 7 d: impr. / clicks / position / CTR, curve | Target queries (7 d) | What changed |
| --- | --- | --- | --- | --- |
| `/en/guides/how-to-vote-catalonia/` (`voting`) | "How to vote in Spain's 2026 general election (29 November)" → "Spain general election 2026: how to vote, register, dates" → **"Spain general election 29 Nov 2026: how to vote, register"** | 2,059 / 31 / 5.5 / 1.5 %; curve 5.1 % | 2026 spain general election how to register to vote 85 at 6.3, … dates 79 at 8.2, how to vote 2026 spain general election 70 at 4.5, … polling stations 16 at 3.6, spain election date 13, when are the elections in spain 9, when is the election in spain 7; plus "como votar / cadastro para / inscription aux pilihan raya umum sepanyol 2026" 103 at 3.5, 57 at 4.6, 6 at 1.8 (searchers from abroad) | Why again: the merged title swapped the date for the word "dates", and date/"when" queries are the largest family (~150 impr.). Description → "Sunday 29 November, polls 9:00-20:00. Only Spanish citizens can vote; no sign-up, the roll is automatic. Find your polling station; postal vote by 19 Nov." (was "Spain votes on Sunday 29 November 2026 (Royal Decree 806/2026): no registration step…"). Lead's first sentence: date, hours, only Spanish citizens vote (EU and other foreign residents cannot); CERA deadlines in the key dates. Register section opens with who can vote (LOREG art. 2.1). FAQs: "When is the 2026 Spain general election?", "Can foreigners or EU citizens vote in Spain's general election?" (moved up from "Can foreigners vote in Catalonia?"), "How do I find my polling station…" (was "Where do I vote on 29 November?"), "How do Spaniards living abroad vote (CERA)?". ca/es untouched |
| `/ca/guies/botigues-obertes-festius-catalunya/` (`shops`) | "Botigues obertes en festius i diumenges a Catalunya 2026-27" (kept by the top-3 push) → **"Festius i diumenges d'obertura 2026 a Catalunya i Barcelona"** | 336 / 6 / 5.8 / 1.8 %; curve 4.4 % | festius obertura comercial 2026 5.7, festius oberts catalunya 2026 8.3, festius comerços oberts 2026 8, diumenges oberts 2026 10, botigues obertes avui a barcelona 2026 7.5 (2-3 impr. each; the rest anonymised) | Title in the searchers' words, like the ES title of the top-3 push. Description and lead already answer (top-3 push, not deployed); one FAQ first: "Quins festius d'obertura comercial queden el 2026?" (29 Nov; 6, 8, 13, 20, 27 Dec; the 30 towns that differ, counted from `TOWNS_NOV_DEC`). No new facts |

**Facts (voting EN), read on 30 Oct 2026:** RD 806/2026 arts. 2, 4, 5 (BOE-A-2026-20742); LOREG art. 2.1 ("El derecho de sufragio corresponde a los españoles mayores de edad"); Interior's notes of 20 Oct (guide: "Pueden votar todos los españoles mayores de edad inscritos en el censo electoral", 9:00-20:00; postal vote until 19 Nov, hand in before 25 Nov; CERA by post to the consulate by 24 Nov, ballot box 21-26 Nov; CERA voters in Spain via Correos until 19 Nov); the JEC calendar PDF (postal request 6 Oct-19 Nov, voter hands in 10-25 Nov, CERA 75.10 and 75.4, temporarily abroad 6-31 Oct, reflection 28 Nov); INE cid=1700 (finder, roll of "españoles mayores de edad") and cid=383 (EU citizens: municipal 23 May 2027, declaration by 30 Dec 2026). Conflict left as it was: CERA ballot download "2 a 7 de noviembre" (JEC) / "hasta el 7" (Interior) against the INE's "hasta el 26 de noviembre"; no new copy repeats it. `VERIFIED` stays 28 Oct: the JEC's sessions after 22 Oct (MiDNI) and the DOGC paid-time-off order were unreadable from here.

**Not done on purpose.**
- "Is it a holiday" (ES): "viernes 30 de octubre es festivo" (calendario laboral, 7.0) and "el lunes 2 de noviembre es festivo en barcelona" (town page, 8.3) are dated queries that expire before a recrawl after the 31 Oct deploy; the town template and the work calendar already got the 2 Nov answer in the top-3 push. "hoy es festivo" lands on town pages (Girona 4.3) and on the "es festivo hoy" page at 11.8; "mañana es festivo" sits at 23-73, a ranking problem a title cannot fix.
- EN weather by month: the merged title and description already say "temperature by month" and name January (13.6/4.7 °C, 56/40 °F) and August.
- EN election night and candidates: wave 3's title already says "Spain general election results 2026"; the candidates page's impressions are `site:boe.es` queries.
- EN shops: 130 impr., 0 clicks at 5.6, but its queries are anonymised fragments ("sunday open?", "y consum"), so nothing says the title misses.

**Prediction.** EN how-to-vote CTR from 1.5 % to 4 %+ at 5-6 as polling day
nears, with clicks on the "register" and "dates" queries (zero now). CA shops
≥ 3.5 % at the same position, with its peak in the week of 29 Nov.

**Measure** on 26 Nov 2026 (the EN voting page before polling day; this
page's demand ends on 29 Nov) and on 30 Nov (28 days): position, CTR and
clicks per page and per target query. Check the last crawl date first.

## 2026-10-30 — Seasonal top-3 push: Barcelona lights, La Marató, Christmas fairs

Goal: move three seasonal clusters from positions 5-9 into the top 3 and lift
CTR. This builds on the news-cycle push and the CTR sweep above (merged, not
deployed; they deploy on 31 Oct), so the "old" titles below are those two
entries' new ones and the baselines were earned under the titles before them.
Facts read on the official pages on 30 Oct 2026 in the afternoon
(`research_notes/seasonal-top3-30oct.md`).

**Baseline, GSC 2-30 Oct 2026** (impressions / clicks / average position):

- Lights: "encendido luces navidad barcelona 2026" 247/1/6.3, "cuando
  encienden las luces de navidad en barcelona 2026" 242/1/5.5, "encesa llums
  nadal barcelona 2026" 163/3/7.3 (ES page 71 at 6.3, CA page 99 at 8.0),
  "encesa de llums barcelona 2026" 107/1/6.3, "encendido de luces barcelona
  2026" 93/0/6.0, "luces navidad barcelona 2026" 50/0/9.6. Cluster 1,375
  impressions, 12 clicks.
- La Marató: "marato tv3 2026" 113/0/8.3, "marató tv3 2026" 105/0/7.7, "la
  marato 2026" 62/0/7.8, "marató tv3 2026 data" 46/0/4.4, "la marató 2026"
  36/0/5.3. Cluster 548 impressions, 0 clicks.
- Christmas fairs: "fires de nadal catalunya 2026" 70/5/6.4 (CA markets
  guide).

**SERP check (30 Oct).** For the lights queries the pages above us promise the
time and the place as well as the date: "Encendido de las luces de Navidad
2026 en Barcelona: horarios y novedades del espectáculo inaugural", "…lugar,
fecha y horario". Ours promised "cuándo es" / "què obre". No one has an
official 2026 date.

**Barcelona lights** (`christmas-bcn`; `marato` republishes it too).
- Still not announced: press room home (latest items 29-30 Oct, none on
  Christmas), the `nadal-2026` tag (latest 9 Jul) and barcelona.cat/nadal
  ("es tornarà a actualitzar al voltant del mes de novembre del 2026"). In
  2023, 2024 and 2025 the date was public by 23 October.
- New verified pattern, from the City Council's notes: Thursday 23 Nov 2023,
  Thursday 28 Nov 2024 and Saturday 22 Nov 2025, all on Passeig de Gràcia at
  18:00 (the October announcements of 2023 and 2025 said 18:30; the press
  calls of the week, 18:00); 2025 pressed by Jaume Collboni and the mayor of
  Bethlehem, 2024 by two young people from "Veus contra el racisme" (not
  named, one was 16), 2023 presided by the mayor.
- Titles: ca "Encesa de llums de Nadal Barcelona 2026: quan és i què obre" →
  "Encesa de llums de Nadal Barcelona 2026: data, hora i lloc"; es "Luces de
  Navidad Barcelona 2026: cuándo es el encendido" → "Encendido luces Navidad
  Barcelona 2026: fecha, hora y lugar"; en kept ("Barcelona Christmas lights
  2026: switch-on date, what's open"). Once `ANNOUNCED_2026.lightsSwitchOn`
  is filled the title becomes the date ("Encesa de llums Barcelona 2026:
  dimecres 25 de novembre"), like the description.
- Descriptions: "…encara sense data oficial (el 2025, dissabte 22 de
  novembre). Carrers il·luminats, pessebre i què obre." → "…(el 2025,
  dissabte 22 de novembre, a les 18:00 al passeig de Gràcia). Què obre."
  (es/en the same).
- Body: the lead's second sentence gives the three-year pattern; a table of
  the last three switch-ons; FAQ "A quina hora és l'encesa", "On es fa", "Qui
  encén els llums" (ca/es/en), each saying 2026 is pending.

**La Marató** (`marato`). Re-read: 2026 hub (13 Dec, 35th, no start time),
donation page (Bizum 33333, no phone number), volunteering (to 10:00 on
10 Nov). Titles kept (they already give 13 December). H1 ca "La Marató de
3Cat 2026: quan és, a què es dedica i com fer un donatiu" → "La Marató de TV3
2026: diumenge 13 de desembre, a què es dedica i com fer un donatiu" (es/en
alike). Descriptions ca/es "La Marató de 3Cat 2026 és el diumenge 13 de
desembre…" → "La Marató de TV3 2026 és…" (the searched words). Lead opens
"La Marató de TV3 2026 és el diumenge 13 de desembre". FAQ: "Quan és La
Marató de TV3 2026?", "A quina hora comença" (not published, about fifteen
hours live), "On es pot veure", "Com puc ser voluntari".

**Christmas fairs** (`christmas`). Titles kept. Descriptions ca "Fires de
Nadal Catalunya 2026: dates oficials, com l'Avet d'Espinelves…" → "Fires de
Nadal Catalunya 2026: 41 amb data oficial, com l'Avet d'Espinelves…"; es
"…fechas oficiales…" → "…41 con fecha oficial…". Lead opens with the count
(the fairs family's, the same the hub shows) and links the hub; first FAQ
"Quines fires de Nadal hi ha a Catalunya el 2026?"; FAQ on the bridge; 15
fairs on the bridge and 19 on La Marató's weekend, both pages linked.

**Internal links.** Lights → bridge; Marató → fairs hub; bridge → fairs hub;
markets guide → Marató and bridge; shops (strongest December page, ES 1,172
impressions) → lights and bridge; fairs hub → bridge and Marató; 41 fair town
pages → bridge. Anchors to the lights page read "encesa de llums" /
"encendido de luces"; `B2_TITLES` labels for the lights, Marató and (EN)
bridge pages rewritten, the EN bridge one no longer saying "6, 7 and 8
December".

**Prediction.** Lights ca/es into the top 3 for "encendido luces navidad
barcelona 2026" and "encesa llums nadal barcelona 2026" once the date is out
and the title carries it; before that, CTR ≥ 3 % at the same position. La
Marató CA ≥ 3 % CTR on "marató tv3 2026" by early December. "fires de nadal
catalunya 2026" ≥ 10 % CTR at ≤ 5.

**Follow-up.** Fill `ANNOUNCED_2026.lightsSwitchOn` (date, time, place, who,
press-room URL) when barcelona.cat publishes it, expected early to mid
November, and republish `christmas-bcn` (`nye` too if the New Year's Eve or
parade fields are filled at the same time). Re-read 3Cat for
the Marató start time and phone number from late November.

**Measure on 30 Nov 2026** (and 14 Dec for La Marató): position, CTR and
clicks per query above, per language.

## 2026-10-30 — Council-approved 2027 local holidays on town pages

**URLs:** `/ca/festius/<town>/`, `/es/festivos/<town>/`, `/en/holidays/<town>/`
for 46 towns (static, ships with the deploy; no publish group). Comarca pages
and the three hubs change their 2027 paragraph.

**Observation.** "festivos <town> 2027", "calendario laboral <town> 2027" and
"festius <town> 2027" already land on the town pages at 3-10, and those pages
said the 2027 local days were "not published yet": the DOGC order comes in
mid-December (the 2026 one on 17 Dec 2025). Many councils fixed their 2027
days months ago, by plenary, mayoral decree or Junta de Govern Local, and
publish them on their own sites.

**Change.** `src/lib/programmatic/holidays/council-2027.ts`: 46 councils'
2027 days, each read on the council's own channel on 30 Oct 2026 (plenary
minutes, agreement summaries, seu electrònica calendars, a decree in the
Gaseta Municipal), with the quote, the act and its date. Press was used only
to find sources. 32 of the 68 towns over 20,000 people (Barcelona,
L'Hospitalet, Badalona, Lleida, Mataró, Reus, Girona, Cornellà, Sant Boi,
Rubí, Manresa, Granollers, Figueres, Esplugues, Blanes, Vilafranca, Ripollet,
Olot, Sant Adrià, Montcada, Tortosa, Sant Joan Despí, Premià de Mar, Sant
Vicenç dels Horts, Molins de Rei, Sant Andreu de la Barca, Palafrugell,
Vila-seca, Amposta, Sant Just Desvern, Banyoles, Roses), 10 of the 29 English
towns, and 14 smaller ones (Caldes de Montbui, la Llagosta, Premià de Dalt,
Alella, Cervera, Sant Fost, Vidreres, Artés, Capellades, Castellbell i el
Vilar, Castellví de Rosanes, la Llacuna, Riudarenes, Pau).

The pages give the days labelled "aprovats per l'Ajuntament (ple del …),
pendents de l'ordre del DOGC" / "aprobados por el Ayuntamiento (…),
pendientes de la orden del DOGC" / "approved by the council (…), pending the
DOGC order" ("fixats per l'Ajuntament, segons el seu web" where the page
names no act): a line under the lead, then in the 2027 section the answer,
the source link and the 2027 table with the two days marked pending, the
FAQ answer, the Dataset (description, coverage 2026/2027, council page in
`isBasedOn`). The status box is unchanged. When `prepare2027` writes
`local-2027.json`, the order wins everywhere and the council file is ignored.

Title pattern, only where it fits 60 characters (otherwise the old title
stays and the description, which now leads with 2027, carries the dates):

```
Festius Girona 2026 i 2027: 26 de juliol i 29 d'octubre
Festivos Granollers 2026 y 2027: 7 de mayo y 27 de agosto
Festivos Barcelona 2026-2027: 17 de mayo y 24 de septiembre
Blanes public holidays 2026 and 2027: 30 March and 26 July
```

Too long for the dates, L'Hospitalet keeps "Festivos locales L'Hospitalet de
Llobregat 2026 y 2027" and the description says "Festivos de L'Hospitalet de
Llobregat en 2027: 17 de mayo y 24 de septiembre, ya aprobados. En 2026: 25
de mayo y 24 de septiembre."

Dated titles: 33 CA, 30 ES, 9 EN of the 46 / 10. This is the second title
change on these pages today (the top-3 push above set "…: ¿hoy es festivo?");
Google has not recrawled most of them since, so it counts as one change.

**Baseline** (Search Console, ES pages, 16-30 Oct 2026, `dataState: all`):

| Page | Impr. | Clicks | Pos. | 2027 queries (impr., pos.) |
| --- | --- | --- | --- | --- |
| /es/festivos/barcelona/ | 1,283 | 6 | 9.3 | festius locals barcelona 2027 (2, 8.5), festivos barcelona 2027 (1, 11) |
| /es/festivos/girona/ | 890 | 2 | 7.4 | calendario laboral girona 2027 (1, 8) |
| /es/festivos/lleida/ | 323 | 1 | 7.1 | calendario laboral lleida 2027 (3, 8.3) |
| /es/festivos/reus/ | 171 | 3 | 6.2 | calendario laboral reus 2027 (8, 4.9), festivos reus 2027 (6, 3.2) |
| /es/festivos/granollers/ | 120 | 4 | 6.4 | festivos granollers 2027 (7, 7.4) |
| /es/festivos/badalona/ | 115 | 2 | 7.0 | calendario laboral badalona 2027 (10, 8.8), festivos badalona 2027 (6, 8.5) |
| /es/festivos/mataro/ | 112 | 4 | 6.1 | calendario laboral mataro 2027 (9, 6.3), festivos mataro 2027 (4, 5.5) |
| /es/festivos/manresa/ | — | — | — | calendario laboral manresa 2027 (5, 5.8), festivos manresa 2027 (4, 8.8) |

Control: Tarragona (627 impr., 8.0; no council source found) keeps the old
title.

**Prediction.** CTR on the 2027 queries of the dated-title pages above the
control's at the same position, and rising with December demand; the
"calendario laboral <town> 2027" queries move up a position or two as the
pages now answer them.

**Measure on 30 Nov 2026** and again after the DOGC order: per page, 2027
queries' clicks and CTR against Tarragona and the towns with no council data.
After the order, check the `COUNCIL DIFFERS` lines `prepare2027` prints.

**Outcome:** _pending_

## 2026-10-31 — Striking-distance push (positions 8–20)

Owner's ask: "puja les pàgines que estan abaix de posició". Below position 8 the
problem is relevance and depth, not the title, so the lever here is substance:
what the top three results answer and we did not.

**Shortlist.** Search Console, `dataState: all`, 28 days (3-31 Oct) and 7 days
(25-31 Oct), page and page × query. Pages with ≥ 60 impressions and an average
position of 8-20, ranked by impressions × (expected CTR at position 3 − CTR).
The site's own page-level curve puts position 3 at 4.0 % on 2,554 impressions,
under position 4 (7.4 %), so 3-4 are pooled: 6.5 %. Full list with a reason per
page: `research_notes/x10/striking-31oct.json`.

**42 pages qualify; 41 are not touched.** 32 were rewritten on 28 or 30 Oct
(entries above, not yet deployed, so the data measures the old pages; the mesa
page is also in the election cluster). The ES ZBE page was rewritten in commit
9146e3b on 30 Oct for exactly its "autorización diaria ZBE" queries, though no
entry logs it. Of the rest: the home page, two programmatic pages
(`/es/festivos/`, Barcelona town page), two election-results pages (other
agents) and three seasonal pages past their date (Castanyada EN, both Sitges
festival guides). For every rewritten page the 28-day queries were read
against the pending rewrite; none shows an intent the rewrite missed. The ones
that look low are dragged by queries no page can win ("festividades" 85.6,
"calendario laboral" 59.8, the expired "30 octubre festivo").

The one untouched page with the highest score is the clock-change guide, so its
three editions were worked. Two more pages sit in the band but under 60
impressions, with rising or head-term demand. Neither is in the 28/30 Oct
entries, so they were added as an extension.

| Page (publish group) | Baseline 28 d: impr. / clicks / CTR / position (7 d position) | What changed |
| --- | --- | --- |
| `/en/guides/clock-change-spain/` (`clock-change`) | 3,095 / 2 / 0.06 % / 8.5 (8.4). "when do the clocks change in spain" 231 at 9.9, "when do clocks change in spain" 160 at 9.7, "do the clocks go back in barcelona" 42 at 8.7 | Title "Spain clock change: clocks go forward on Sunday 28 March 2027" (61) → **"When do the clocks change in Spain? Next: 28 March 2027"** (55). H1 → "When do the clocks change in Spain? Dates to 2031 and what happens". Description names Easter Sunday and CET. The lead opens with the next change, the last one and the one after. New section and table, **time difference with the UK, the Canary Islands and the US**: the UK and the Canaries are an hour behind all year; the US gap shrinks by an hour from 14 to 28 March and from 31 Oct to 7 Nov 2027. CET/CEST named. FAQs: "Do the clocks go back in Barcelona?", "What time zone is Barcelona in?", "Is the March 2027 clock change on Easter Sunday?". Links out to the weather-by-month page and the 2027 holidays guide |
| `/ca/guies/canvi-hora-catalunya/` (`clock-change`) | 7,856 / 23 / 0.29 % / 7.0 (7.1); "canvi d'hora" 2,227 at 7.5, 385 impressions of named queries at 8-20 | Title trimmed (62 → 54): "Canvi d'hora 2027: diumenge 28 de març, una hora menys". H1 "Canvi d'hora: quan canvien l'hora, dates fins al 2031 i si s'acabarà". The same lead, section and FAQs (Setmana Santa, "Quina hora té Catalunya?") |
| `/es/guias/cambio-hora-espana/` (`clock-change`) | 289 / 1 / 0.35 % / 26.3 (33.6), outside the band | Title kept. H1 "Cambio de hora: cuándo se cambia la hora, fechas hasta 2031 y si se acabará". The same lead, section and FAQs |
| `/en/day-trips/andorra-from-barcelona-by-bus/` (`andorra`; ca/es too) | 48 / 0 / 0 % / 8.6 (8.2); "barcelona to andorra bus" 6 at 20.7 (ES 25 at 5.1, CA 6 at 5.7) | Title kept (already the query). H1 "Barcelona to Andorra bus: timetables, fares, from the airport, customs". The lead names both operators, the frequencies and the fare. Direct Bus's airport departures (T1 ground floor, bays 7-12; T2 between B and C) are in the table. New H2s **"Barcelona airport to Andorra by bus"** and **"Where the bus arrives in Andorra"** (Estació Nacional d'Autobusos; Direct Bus's Sant Julià stop). Andbus's €33/€56 is now labelled as the airport fare, because its fare table is headed that way. Holiday-timetable caveat (24, 25, 31 Dec, 1 Jan). Two FAQs. ALSA and FlixBus are still out: neither site gave route data |
| `/ca/tradicions/pessebres-vivents-catalunya/` (`pessebres`; es/en too) | 46 / 1 / 2.2 % / 13.4, all in its first week (ES 77 at 5.6, EN 13 at 3.3) | Answer-first lead: the first two of the season (Corbera from 28 Nov, the Pessebre dels Estels at the Masia de Castelló on 5, 6, 12 and 13 Dec) and every one with dates. Two nativities added to the table from their own sites: **Sant Fost de Campsentelles** (13 Dec to 10 Jan, online, adults €10) and the **Pessebre dels Estels** (from 16:30, half-hour slots, €15/€10). FAQ "Quin és el primer pessebre vivent del 2026?". The "near Barcelona" FAQ now gives this season's dates. The four "not yet published" were re-read and are still last season's |

**Internal links added to these pages.**
- Work calendar, Easter 2027 section (ca/es/en, `holidays`): one sentence linking the clock change ("canvi d'hora" / "cambio de hora" / "clocks change in Spain"). It is printed only while Easter Sunday is also the March change: computed, and tested.
- Weather by month, winter paragraph (ca/es/en, `climate`): "quan és el canvi d'hora" / "cuándo es el cambio de hora" / "when the clocks change in Spain".
- Airport to city centre related rail (`airport`) and Cerdanya without a car related rail (`batch02-c`): the Andorra guide. Its rail label is now "Barcelona to Andorra bus: timetable and fares" (ca/es alike).
- The nativity guide was already linked from four Christmas pages, so none were added.

**Facts, read on 31 Oct 2026** (pack in `research_notes/striking-31oct-facts.md`):
- RD 236/2002 arts. 2-3 (Canary Islands at 01:00/02:00 local).
- C/2026/1660 (28 March and 31 October 2027, 01:00 UTC).
- EP procedure 2018/0332(COD): "Awaiting Council's 1st reading position".
- GOV.UK clock change dates.
- NIST US DST rule (2027 dates computed and tested).
- Generalitat 2027 calendar (26 and 29 March).
- Andbus and Direct Bus timetables.
- Govern d'Andorra on the Estació Nacional d'Autobusos.
- Agencia Tributaria (updated 23 Sep 2026; its Andorra section names no age limit, its third-country section says under-17s get no allowance, and the page keeps the stricter rule).
- Grandvalira ("Open from 4 December").
- pessebreviventsantfost.cat and masiacastello.cat.

**Not done on purpose.**
- Calçotada de Valls (CA 43 impressions at 14.1): published 27 Oct and still settling (ES already 4.8), and it already answers the 2027 date.
- The clock-change page's 26 Oct title experiment is overlapped: its EN and CA titles change again inside 28 days, under the owner's 28 Oct lifting of the windows. Read the 23 Nov measurement as a combined one.

**Prediction.**
- EN clock-change page from 8.5 into the top 5 for "when do the clocks change in spain" and "do the clocks go back in barcelona" by the March peak. Demand is near zero until then, so judge position, not clicks.
- CA "canvi d'hora" from 7.5 to ≤ 5.
- "barcelona to andorra bus" from 20.7 onto page 1.
- The CA nativity page from 13.4 into the top 10 as December demand arrives.

**Measure on 28 Nov 2026** (position per page and per query above; check the
last crawl date first), and again for the clock change in the week of 21 March
2027.

**Outcome:** _pending_

## 2026-10-31 — Language-mismatch fixes

**Question.** English is a much larger share of impressions than of clicks.
Is part of that an English searcher being shown our Spanish or Catalan page
(or a Spanish searcher the Catalan one, or the reverse)?

**Method.** Search Console, 3-31 Oct 2026, `dataState: all`, query × page ×
country. Each query was classified by word lists (en/es/ca function words
and the site's topic words: when/open/holiday/strike, cuándo/festivo/huelga,
quan/festiu/vaga…), orthography (ñ, -ción; l·l, ç, l', ny) and the country
only to break ties. Proper nouns carry no language (Barcelona, Tibidabo, TV3,
Marató, party names). A mismatch is EN query → /es/ or /ca/ page, ES → /ca/,
CA → /es/. Scripts are in the session scratchpad, not the repo.

**Read this first: the coverage.** Query rows cover 35,380 of the 125,606
page impressions (28 %). Page × country is no better: once a second dimension
is added, Search Console returns only the rows with a query, the same 35,380.
The other 72 % cannot be split by language or country.

**What the data says.**
- Query language: ES 15,571 impressions / 371 clicks, CA 11,027 / 158,
  EN 4,715 / 21, unclassified 3,910 / 37, other languages 157 / 0.
- **English queries already land on English pages:** 4,660 of 4,715
  impressions (98.8 %). EN → /es/ or /ca/ is 55 impressions and 0 clicks in
  four weeks.
- All mismatches: 2,158 impressions / 56 clicks on 111 pages. CA → ES
  1,835 / 55, ES → CA 268 / 1, EN → ES 47 / 0, EN → CA 8 / 0.
- **CA → ES is not a click leak.** Catalan queries shown the Spanish page
  click at 3.0 %, more than Catalan queries shown the Catalan page (1.1 %).
- The English gap is real but has another cause. EN pages are 19.0 % of
  impressions and 8.4 % of clicks (CTR 1.30 %, against 3.72 % ES and 2.59 %
  CA). At page positions 4-10, EN converts 1.4 %, CA 2.6 % and ES 4.2 %. The
  biggest EN pages show it: clock change 3,095 / 2 at 8.5, weather by month
  1,849 / 3 at 6.6, metro hours 1,655 / 4 at 6.2. These are English queries
  on English pages, so the cause is intent and the SERP, not language. All
  three were retitled on 28-31 Oct.
- 417 EN-page impressions (1 click) come from operator and AI fan-out
  queries: `site.boe.es "806/2026" "elecciones"`, and Malay or Portuguese
  "pilihan raya umum sepanyol 2026". They inflate the EN election pages'
  impressions.

**Top mismatched pages and why most were left alone.** Of the top 30, 24 had
been retitled on 28-31 Oct, either the page itself or its edition in the
query's language, and Google has not seen those titles yet. They are:
- strikes, Christmas in Barcelona and Christmas markets;
- school calendars, parking and tourist tax;
- metro, T-casual, clock change, PortAventura, Núria and the airport;
- the town holiday template, the free museums and Dalí;
- the CA work calendar, whose 28 Oct title starts with the Catalan query
  word for word ("calendari laboral 2027 catalunya", 63 impressions on the ES
  page);
- the CA mushroom page, retitled "Mapa bolets Catalunya 2026" on 30 Oct for
  exactly the query ("mapa bolets catalunya 2026", 253 impressions on the ES
  page).

Tibidabo (rank 22) is fixed below on its CA side. The other two pages fixed
below sit just outside the top 30; they are the next ones with a coherent
query pattern and no edit inside the window.

Others were left alone for these reasons:
- **Castanyada** ES (560 / 17, "castanyada 2026") and CA (77 / 0, "cuando es
  la castañada"): ranks 1 and 6. The festival is 31 Oct-1 Nov, so a fix that
  ships on 1 Nov would serve nobody until October 2027.
- **December bridge:** the CA page already wins its query ("pont de desembre
  2026": CA 78 impressions at 5.1, ES 11 at 8.3).
- **Sitges** CA/EN and **Zoo** ES already carry their searchers' words.
- **/es/elecciones/abrera/** ("aliança catalana abrera") is a party name,
  not a language signal.
- **The home page** is a brand experiment.

**Changed (title, H1 and, for Boqueria, the first words of the lead; nothing
else):**

| Page (publish group) | Old → new search title | Baseline 3-31 Oct |
| --- | --- | --- |
| `/en/guides/barcelona-card-vs-hola-barcelona/` (`cards`) | "Barcelona Card vs Hola Barcelona: prices, which is worth it" → "Hola Barcelona Travel Card 2026: prices, is it worth it?"; H1 now starts "Hola Barcelona Travel Card or Barcelona Card" (the ES wording of 28 Oct) | EN page 88 impr., 0 clicks, 8.9; "hola barcelona travel card worth it" 4 at 26, "is the hola barcelona card worth it" 2 at 10; 9 EN "hola (barcelona) (travel) card" / "bcn travel card" impressions landed on the ES cards (5) and T-casual (4) pages |
| `/ca/guies/tibidabo-parc-atraccions-com-arribar/` (`hills`) | "Tibidabo: entrades, calendari i com pujar-hi en funicular" → "Tibidabo 2026: preus de l'entrada, horaris i com arribar-hi" (the ES title of 28 Oct, in Catalan); H1 to match | CA page 33 impr., 0 clicks, 7.7; 10 CA impressions ("preus tibidabo", "tibidabo horaris", "horari tibidabo 2026", "tibidabo calendari", "t2a tibidabo") on the ES page |
| `/ca/guies/mercat-boqueria-mercats-barcelona/` (`family-markets`) | "La Boqueria i els mercats de Barcelona: horaris i normes" → "Mercat de la Boqueria: horari (dl–ds 8:00–20:30) i normes"; H1 "Horari del Mercat de la Boqueria i dels mercats de Barcelona…"; lead "El Mercat de la Boqueria obre…" | CA page 34 impr., 0 clicks, 7.6; 10 CA "mercat de (la) boqueria" impressions on the EN (7) and ES (3) pages; the CA page had none of them |

The hours in the Boqueria title are already in the page's own table, which
the market institute checked on 28 Oct. No new facts. `tests/batch02.test.ts`
pins the three titles.

**hreflang / sitemap check: no defect found.**
- Live sitemap (1,762 URLs, deployed 30 Oct): every alternate is listed,
  every cluster is reciprocal and self-referencing, and x-default is
  consistent.
- Live HTML of `/es/elecciones/abrera/`, `/es/festivos/vic/` and
  `/ca/guies/pont-desembre-catalunya/` agrees with the sitemap, and each
  alternate links back.
- The 4,333 programmatic sitemap entries on main, including the undeployed
  EN holiday towns, elections tranche 3 and Christmas fairs, are clean. New
  test `tests/hreflang-clusters.test.ts` checks them across families.

**Programmatic families without an English edition (deferred: no expansion
this week, ISR-write budget).** Counts are on main. The demand figures are
query rows on the live ca/es-only pages, 3-31 Oct.

| Family | ca/es URLs without EN | EN pages | Measured EN demand on the ca/es pages |
| --- | --- | --- | --- |
| Holidays (towns + comarques) | 931 + 931 | 41 (29 towns, hub, date pages) | 602 live URLs: 12,726 impr. / 270 clicks; EN-language query impressions 0; from outside Spain 24 |
| Elections (towns + comarques) | 960 + 960 | 31 (30 towns + hub) | 540 live URLs: 2,401 / 127; EN-language 2 ("primary in gava"); outside Spain 0 |
| Fuel | 75 + 75 | 0 | live since 28 Oct, 0 impressions |
| Christmas fairs | 39 + 39 | 3 | not deployed |
| Rodalies lines | 19 + 19 | hub only | 38 live URLs: 14 impr.; EN-language 0 |
| Weekend by zone | 12 + 12 | 0 | live since 28 Oct, 0 impressions |

Nothing measured asks for more English town pages yet. Re-check the 29 EN
holiday towns (live from 1 Nov) before adding any.

**Prediction.** For the queries above, the right-language URL takes most of
the impressions: CA Tibidabo and CA Boqueria for the Catalan queries, EN
cards for "hola barcelona travel card". Clicks stay in single figures, since
these are small queries. The site-wide EN CTR gap will not move from this.
That needs the EN-page intent work already shipped on 28-31 Oct.

**Measure on 28 Nov 2026**: per query, impressions by page language
(wrong-language share against the baseline above), position and clicks. Use
the same classifier.

**Outcome:** _pending_

## 2026-11-02 — Holiday date pages for 2027

**URLs:** 69 new, 23 dates x ca/es/en: `/ca/festius/dia/<d>-2027/`,
`/es/festivos/dia/<d>-2027/`, `/en/holidays/day/<d>-2027/` (code routes, built
at deploy; ship with the deploy). The 34 date pages are now linked from the
three hubs, every town and comarca page, the sitemap (102 date URLs, hreflang
ca/es/en + x-default) and `llms.txt`, all through `DATE_PAGES`.

**Observation** (Search Console, 6 Oct - 1 Nov 2026). `/es/festivos/dia/...`
took 9,331 impressions and 278 clicks across 8 pages, about 1,170 impressions
a page against about 114 for a town page. Queries shaped "es festivo el X",
"és festiu el X" and "is X a holiday" total 6,179 impressions. Each date page
peaks in the days before its date. The 2027 searches are next: Easter, the
"puentes", and the days people expect to be holidays and are not.

**Change.** Tranche 4 of the date engine (`dates-2027.ts`), one template for
all 23 dates, answer first in the H1's own terms:

- **Every Catalonia-wide day of 2027**, read from `regionalDays(2027)`
  (Ordre EMT/52/2026), not retyped: 26 and 29 Mar, 1 May, 24 Jun, 11 Sep,
  12 Oct, 1 Nov, 6 and 8 Dec, 25 Dec (1 and 6 Jan already had pages). The
  three Saturdays (1 May, 11 Sep, 25 Dec) answer "Sí, però cau en dissabte"
  and say the order moves none of them to Monday.
- **Working days people ask about:** 5 Jan, 19 Mar (Sant Josep), 25 Mar
  (Dijous Sant), 23 Apr (Sant Jordi), 15 Aug (a Sunday), 2 Nov, 7 Dec,
  24 Dec, 26 Dec (Sant Esteve: a Sunday, and not in the 2027 order, unlike
  2026), 31 Dec.
- **Local days several of the largest towns share** (council-approved,
  pending the DOGC order): 17 May (17 towns and 5 villages, Barcelona,
  L'Hospitalet, Badalona, Mataró…), 29 Jun (Reus, Rubí, Figueres, Premià de
  Dalt), 24 Sep (Barcelona, L'Hospitalet, Montcada, Sant Joan Despí). The box
  reads "Festa local". When `local-2027.json` is written the pages switch to
  the order (`nextYearPlacesOn`, the town pages' `councilApproved2027`), drop
  "pendent"/"almenys" and cite the order.

Each page: the answer naming the order; Catalonia against the rest of Spain
from the BOE's 2027 list (BOE-A-2026-21254, transcribed in `boe-2027.ts`,
table kept as a test fixture: e.g. 25 Mar is a holiday everywhere except
Catalonia and the Valencian Community; 19 Mar in Galicia, Madrid, Murcia,
Navarre and the Valencian Community; 16 Aug in six communities); the days
around it; one sentence with one link, to the Easter 2027 guide (19-29 Mar),
the Reis parade (5 Jan) or Ponts 2027 (the rest), with the long weekend the
day makes computed by `holidays/bridges.ts`; the towns with a local holiday,
each linked; shops (Llei 18/2017 art. 36.2.d closing days by date, so 26 Dec
2027 is closed though not a holiday; Ordre EMT/89/2026's eight general days);
schools (Ordre EDF/66/2026). FAQPage (the H1 and the three section
questions, as printed) and Dataset JSON-LD, plus the breadcrumbs. The 2026
pages keep their title, markup and copy.

Title: the H1 question plus the day's name when it fits 60 characters:

```
¿Es festivo el 23 de abril de 2027 en Cataluña? Sant Jordi
¿Es festivo el 25 de marzo de 2027 en Cataluña? Jueves Santo
És festiu el 26 de desembre de 2027 a Catalunya? Sant Esteve
Is 26 March 2027 a public holiday in Catalonia? Good Friday
```

Linking in: the Ponts 2027 table links each holiday's day to its page, one
link per row, and its Barcelona list links 17 May and 24 Sep (publish group
`ponts-2027`); the Easter 2027 day table links 25, 26 and 29 Mar and its
Pasqua Granada paragraph gains one sentence linking 17 May (publish group
`setmana-santa-2027`). Code pages (deploy only): hubs, town and comarca pages
list the date questions by year; the "es festivo hoy" block shows the next
12 instead of all of them; the English town table answers the 2027 dates
from the council data (or says they are not published yet) and no longer
flags a strike on every date with a notice (only 11 Nov 2026 has one).

**Baseline.** 0 impressions for every 2027 date URL (new). Reference: the
2026 date pages, about 1,170 impressions a page over 27 days.

**Prediction.** Each 2027 page gets little before January, then rises in the
weeks before its date, as the 2026 pages did. The first to show: 19 and
25 Mar (Easter searches start in February), then 23 Apr and 17 May. The
Saturday holidays and 26 Dec (Sant Esteve) take the "no/sí, però" queries the
guides do not answer in their titles. The guides keep their own queries; the
date pages should not take "puentes 2027" or "semana santa 2027".

**Measure on 1 Feb 2027** (first window with Easter demand) and on 1 Apr
2027: per date page, impressions, clicks, position, against the 2026 pages'
curve; the Easter and Ponts guides' own queries before and after, for
cannibalisation.

**Outcome:** _pending_

## 2026-11-03 — CTR sweep: pages far below the site's CTR-by-position curve

**Why now.** Owner priority: 1M impressions 30 Oct–15 Nov with the highest CTR
possible. For this sweep the owner lifted the 28-day title freeze, so pages
changed on 30–31 Oct are changed again here. That means two changes overlap in
one window, which is accepted. Several things change together on some pages.
Read the outcome per page, and treat it as a sweep, not a clean A/B.

**Baseline.** Search Console, 21 Oct–3 Nov 2026 (`snapshot.py page … 14`):
impressions, CTR, position, against the curve from `snapshot.py ctr` (pos 5 ≈
6.0 %, pos 6 ≈ 3.2 %, pos 7 ≈ 1.2 %, pos 8 ≈ 0.6 %).

### Holiday town pages (`/es/festivos/<town>/`, `/ca/festius/<town>/`, ~1,830 pages; deploy, no group)

Baseline: 30.6k impressions a week, CTR 1.7 % at pos 6–8. Lleida 1,781 at
0.2 %, Girona 1,686 at 0.2 %, Terrassa 1,251 at 0.4 %, Badalona 960 at 0.5 %,
Sant Boi 552 at 0 %. Most impressions come from "hoy / mañana es festivo en
<town>" (pos 8–10), then "festivos <town> 2027" and "calendario laboral <town>
2027". The title asked the question last, or, in council towns, listed the
2027 days as if they were both years'.

- **Title:** the question first, in the searchers' words, then the years.
  2027 appears only where the page has the town's 2027 days (council-2027.ts
  or the DOGC order). The H1 follows the same rule.
  - Lleida: "Festivos Lleida 2026 y 2027: 11 de mayo y 29 de septiembre" →
    "¿Hoy o mañana es festivo en Lleida? Festivos 2026 y 2027"
  - Terrassa: "Festivos locales Terrassa 2026 y 2027: ¿hoy es festivo?" →
    "¿Hoy o mañana es festivo en Terrassa? Festivos locales 2026"
  - Girona (ca): "Festius Girona 2026 i 2027: 26 de juliol i 29 d'octubre" →
    "Avui o demà és festiu a Girona? Festius 2026 i 2027"
- **Description:** the town's days (2027's first where they exist), then the
  next holiday, dated.
  - Terrassa: "…2 de abril y 6 de julio. Calendario laboral 2027, si hoy o
    mañana es festivo y tiendas abiertas." → "…2 de abril y 6 de julio.
    Próximo festivo: martes 8 de diciembre (la Inmaculada). Si hoy o mañana
    es festivo."
  - Badalona: "…En 2026: 11 y 25 de mayo." → "Festivos locales de Badalona
    en 2027: 11 y 17 de mayo, aprobados por el Ayuntamiento. En 2026: 11 y 25
    de mayo. Próximo festivo: 8 de diciembre."
- **First screen:** a static first line, "Próximo festivo en Terrassa: martes
  8 de diciembre de 2026 (la Inmaculada, en toda Cataluña)". The live
  today/tomorrow box moves up, above the 2027, nuclei and correction notes.
  The box gets `data-nosnippet`, so a crawl-day "Sí: hoy es festivo" is never
  quoted on another day.
- **Staying true:** the nightly cron now revalidates every town page the
  night after each of its holidays (`holidayRefreshPaths`, same pattern as
  the weekend pages), so "next holiday" never names a past day.

### Holiday date page `/es/festivos/dia/7-diciembre-2026/` (deploy)

Baseline: 791 impressions, 3.5 % at pos 5.1 (curve 6 %). "donde es festivo
el 7 de diciembre de 2026" got 26 impressions at 6.0 and no clicks. The
title is kept (date-page rule: the question, then at most the day's name).

- Description: "No: … laborable en Cataluña. Es fiesta local en 43 municipios
  y 2 núcleos: la lista, tiendas, escuelas y el puente del 8." → "No: …
  laborable en Cataluña. Dónde es festivo: en 43 municipios y 2 núcleos, como
  Sant Boi de Llobregat. La lista y el puente."

### Christmas in Barcelona, ca/es/en (group `christmas-bcn`)

Baseline: ES 4,980 impressions at 1.1 %, pos 6.2. CA 1,141 at 0.9 %. EN 258
at 4.7 %. Top queries: "cuando encienden las luces de navidad en barcelona
2026" (610, pos 6.1), "encendido luces navidad barcelona 2026" (439), "encesa
llums nadal barcelona 2026" (332, pos 8.1).

Re-checked 3 Nov: no 2026 date. The press room search and the `nadal-2026`
tag show only the 9 Jul lighting plan. barcelona.cat/nadal still says it will
be updated "al voltant del mes de novembre del 2026". The printed check date
stays 30 Oct, because the test refuses any November 2026 date on these pages.

The pending titles promised "data, hora i lloc" / "fecha, hora y lugar", a
2026 date the page cannot give.

- **Titles**
  - es: "Encendido luces Navidad Barcelona 2026: fecha, hora y lugar" →
    "Encendido luces Navidad Barcelona 2026: fecha por confirmar"
  - ca: "…: data, hora i lloc" → "…: data per confirmar"
  - en: "Barcelona Christmas lights 2026: switch-on date, what's open" →
    "Barcelona Christmas lights 2026: streets, switch-on date TBC"
- **Descriptions**
  - es: → "¿Cuándo encienden las luces de Navidad en Barcelona 2026? Aún sin
    fecha (2025: sábado 22 de noviembre, 18:00). Previstos 130 km de calles
    con luces."
  - ca: → "Encesa de llums de Nadal Barcelona 2026: encara sense data oficial
    (el 2025, dissabte 22 de novembre, 18:00). Previstos 130 km de carrers amb
    llums."
  - en: → "When are Barcelona's Christmas lights switched on in 2026? No
    official date yet (2025: Saturday 22 November, 18:00). 130 km of lit
    streets planned."
- **H1 (ca/es):** "…: data / fecha, pessebre…" → "…: quan / cuándo, pessebre…".
  The lead already says that no date is announced.
- When `ANNOUNCED_2026.lightsSwitchOn` is filled, the title and description
  switch to the date by themselves.

### School calendar, Catalan (live title; deploy)

Baseline: 4,073 impressions at 1.1 %, pos 4.9 (curve 6 %). About 95 % of
queries are anonymous. The visible ones are "vacances (escolars) de nadal
2026" (pos 8–9.5) and "calendari escolar 2026 2027 catalunya" (9.2). CTR was
already rising after 30 Oct, from 0.9 % to 1.6–1.8 %, so only the
Christmas-phase wording changes.

- Title: "Calendari escolar 2026-27 Catalunya: Nadal del 22/12 al 7/1" →
  "Calendari escolar 2026-2027: vacances de Nadal 22/12-7/1"
- The description and the lead are kept. The lead already gives the start,
  end, Christmas and Easter dates.

### Other guides (one line each; exact strings are in each file's header comment)

- **`/ca/guies/la-marato-tv3-3cat/`** (group `marato`). Baseline 1,672 at
  0.4 %, pos 6.3.
  - Title: "…: 13 de desembre, causa i donatius" → "…: 13 de desembre,
    voluntaris i donatius".
  - The description now gives the volunteer pre-registration deadline (10
    Nov, 3cat.cat). The key facts gain a line for it.
  - **Replace that sentence after 10 Nov.**
- **`/ca/guies/botigues-obertes-festius-catalunya/`** (group `shops`).
  Baseline 1,013 at 2.4 %, pos 4.9.
  - The description now opens with "Botigues obertes diumenges i festius
    2026: a Barcelona queden…".
  - The title is kept.
- **`/en/guides/barcelona-metro-hours/`** (group `hours`). Baseline 1,628 at
  0.2 %, pos 6.1.
  - The description now opens with "Is the Barcelona metro 24 hours? Not
    every night…".
  - The title is kept.
- **`/es/guias/aparcar-barcelona-zona-azul-verde/`** (group `parking`).
  Baseline 5,268 at 0.2 %, pos 8.1.
  - Title: "Zona azul y verde Barcelona: cómo funciona, horario y precio" →
    "Horario zona azul y verde Barcelona: cuándo se paga y precio".
  - The description and lead now open with the hours.
  - The CA description is aligned (CA baseline 1,438 at 1.0 %).
- **`/es/guias/semana-santa-2027-cataluna/` and its CA edition** (group
  `setmana-santa-2027`). Baseline ES 646 at 3.3 %, CA 362 at 1.7 %.
  - The description and the first sentence now name the week, "del 21 al 28
    de marzo".
  - Titles are kept.
- **`/ca/guies/pont-desembre-catalunya/`** (group `pont-desembre`). Baseline
  469 at 3.0 %, pos 4.6.
  - Title: "Pont de desembre 2026 a Catalunya: quins dies són festius" →
    "Pont de desembre 2026 a Catalunya: festiu el dimarts 8".

**Skipped, because a snippet can't fix them.**

- `/en/guides/barcelona-weather-by-month/`: queries sit at pos ~8.9, and it
  gets 0 clicks even at pos 3–4. The answer is shown in the SERP.
- `/en/guides/clock-change-spain/`: demand ended with the 25 Oct change, and
  queries were at pos 10–11.
- `/es/guias/tasa-turistica-barcelona-cataluna/` and
  `/es/guias/tarjetas-transporte-barcelona/`: the titles already answer, and
  the main queries rank 7–12.
- `/es/guias/festivos-locales-cataluna/`: the 30 Oct title took CTR from about
  1.0 % to 2.6 %. Left alone to measure.
- `/en/guides/catalonia-school-calendar/`: its queries are one-word noise
  ("si", "en barcelona", "??").

**Prediction.** Town pages: CTR moves toward the curve at pos 6–8 (≥ 1.5 % on
the "hoy/mañana es festivo en <town>" queries, from ≈ 0). Christmas ES: CTR ≥
2 % on the switch-on queries while no date is out. Parking ES and metro EN:
the only measurable change will be at the positions where they already rank.

**Measure on 15 Nov 2026 (interim) and 1 Dec 2026.** For each page above:
impressions, clicks, CTR and position, over the window since this deploy and
publish, against this baseline. For the town family, use the five towns
listed in the baseline plus the family total from `snapshot.py families`.

## 2026-11-03 — 11N and strikes hub: Catalan query wording, language line, answer-first snippets (groups `strikes`, `strike-11n`)

Why: Search Console, 21 Oct-3 Nov 2026 (`scripts/snapshot.py page …`). The
Catalan queries on the 11N page sit at position ~10 and land more on the
Spanish edition than on the Catalan one, because hreflang follows the Google
interface language: "vaga 11 novembre" 341 impr. at 10.1 on ES vs 180 at 9.4
on CA; "vaga general 11 novembre" 259 at 10.5 on ES vs 118 at 9.9 on CA;
"vaga 11 novembre 2026" 79 at 7.0 on CA. ES page's own leaders: "servicios
minimos huelga 11 de noviembre" 202 at 5.5 (7.9% CTR), "huelga general 11
noviembre barcelona" 130 at 4.1, "huelga general 11 noviembre horario" 44 at
8.4, "manifestacion 11 de noviembre 2026" 26 at 7.6 and "manifestacion 11
noviembre barcelona" 23 at 9.4 (no click: the page had no time or place).
Hub: "huelga hoy" 170 at 7.5, "hoy hay huelga" 68, "vaga hoy" 67, "mañana
hay huelga" 54, "huelga general 11 noviembre barcelona" 93 at 7.3.

Changes:
- 11N CA title: "Vaga general 11 de novembre: serveis mínims i què funciona"
  → "Vaga general 11 novembre 2026: serveis mínims i què funciona" (60): the
  searched words and the year, as the ES title already has. H1 unchanged
  (grammatical "de l'11 de novembre").
- 11N descriptions (pending state) name the services instead of "who sets
  them, when": ca "…Serveis mínims encara no publicats: Rodalies, metro, bus,
  escoles i sanitat." (150); es "…Servicios mínimos aún no publicados: metro,
  Rodalies, bus, colegios y sanidad." (155); en "…Minimum services not out
  yet: Barcelona metro, Rodalies, buses, schools, hospitals." (150).
- Hub descriptions: the closing line says "today" ("Què funciona avui i
  serveis mínims oficials." / "Qué funciona hoy y servicios mínimos." /
  "What runs in Barcelona today and official minimum services."); Ouigo's
  2 Nov strike is past, so the names are doctors, Renfe 10/12 Nov, 11N.
- Both pages, three editions: a visible "En català · En castellano · In
  English" line right under the key facts (new `languageLinks` block, drawn
  from the published translations with `hreflang`/`lang`; the WIP helper of
  2 Nov, b9bd695, reviewed and reworked from Markdown links into the block).
- 11N first screen: the lead names the services whose minimum services are
  pending; key facts reordered (day, hours, minimum services, schools, the
  Barcelona march, 10/12 Nov, who calls it, who is called out); new key fact
  and FAQ "where and when is the demonstration": 17.30 h, Jardinets de
  Gràcia, from the Sindicat de Llogateres de Catalunya's own notice (20 Oct),
  printed as theirs; CCOO and UGT still give no time or place.

**Prediction.** CA page above the ES page for "vaga 11 novembre" / "vaga
general 11 novembre" (from ~10 to top 5) and more Catalan clicks reaching the
CA edition via the line; ES "manifestacion 11 noviembre barcelona" starts
clicking; hub CTR on "huelga hoy" up a point at the same position.

**Measure** with the 29 Oct entry (18 Nov and 26 Nov): per edition, position
and clicks for the queries above, and the CA/ES split of the Catalan queries.

## 2026-11-03 — Election pages: "right now" answers in the snippet and first screen (owner lifted the freezes)

Why: election pages are the second traffic source, the owner's goal is 1M
impressions by 15 Nov with maximum CTR, and demand has moved to questions
about today: the mesa draw ends on 4 Nov and notices run to 7 Nov; the
postal-vote request closes on 19 Nov; the proclaimed candidate lists came out
in today's BOE. The freezes logged above (mesa ca/es to 14 Nov, the 28-day
rule for the 30 Oct changes) are lifted for these pages by the owner's
priority. Titles and descriptions change together (against the "one thing"
rule, knowingly): attribution is per page, not per field. Baselines are
`scripts/snapshot.py page <substr> 14`, 21 Oct-3 Nov 2026 (3 Nov partial).
Every new fact was read on 3 Nov 2026 on the BOE, the JEC, Interior's 29N
site and guide note, the INE, Correos or the DOGC; the facts and URLs are in
the header comments of `mesa.ts`, `voting.ts`, `candidates.ts` and
`election-night.ts`.

| Page (publish group) | Old title → new title | Baseline, 14 d | Target queries now | What changed |
| --- | --- | --- | --- | --- |
| `/en/guides/polling-station-duty-spain/` (`mesa`) | "Polling-station duty in Spain 2026: €75 pay, excuses, time off" → "Polling-station duty in Spain (mesa electoral): €75, excuses" | 1,327 impr., 10 clicks, pos 3.2, 0.8 % | Spanish follow-up fragments (cuanto pagan? 7 at 4.1, te pagan? 5, como se cobra 2 at 3.0, cuando se sabe si te ha tocado mesa electoral 1 at 2) | "mesa electoral" in the title for those Spanish fragments; description: notice by 7 Nov, 7 days to object to the Junta Electoral de Zona, online with Cl@ve, €75, 5 h off on Mon 30 Nov |
| `/es/guias/miembro-mesa-electoral/` (`mesa`) | "Mesa electoral 2026: se cobran 75 €, sorteo y excusas" → "Mesa electoral 2026: si te ha tocado, plazo de excusa y 75 €" | 630 impr., 27 clicks, pos ~8, 4.3 % | orden int/650/2026 12 at 6.6, mesa electoral catalunya 6 at 11, miembro de mesa 4 at 44, que tengo que hacer si soy miembro de mesa 1 at 8, excusas mesa electoral 1 at 14 | Description: "Notificación hasta el 7 de noviembre; luego, 7 días para excusarte ante la Junta Electoral de Zona, también en línea. Dieta de 75 € y 5 h menos el lunes." |
| `/ca/guies/membre-mesa-electoral/` (`mesa`) | "Membre de mesa electoral 2026: 75 €, sorteig i excuses" → "Membre de mesa electoral 2026: si t'ha tocat, excusa i 75 €" | 1,135 impr., 45 clicks, pos ~6, 4.0 % | sorteo mesa electoral girona 4 at 7.8, mesa electoral barcelona 2026 3 at 9, sorteig mesa electoral catalunya 3 at 7 | Description as es |
| `/en/guides/how-to-vote-catalonia/` (`voting`) | "Spain general election 29 Nov 2026: how to vote, register" → "2026 Spain general election (29 Nov): how to vote, register" | 4,668 impr., 62 clicks, pos 5.4, 1.3 % | 2026 spain general election how to register to vote 240 at 7.1, how to vote 2026 spain general election 224 at 4.3, 2026 spain general election dates 140 at 8.7, where to vote 52 at 5.7, spain election date 30 at 9.0, 2026 spain general election polling stations 24 at 3.8 | Title opens with the queries' own "2026 spain general election", keeps the date; description "Sunday 29 Nov, 9:00-20:00. Only Spanish citizens can vote; the roll is automatic. Find your polling station, ID rules; postal vote request by 19 Nov." |
| `/es/guias/como-votar-elecciones-cataluna/` (`voting`) | "Próximas elecciones en Cataluña: cuándo son y dónde votar" → "Próximas elecciones en Cataluña: 29N, cuándo y dónde votar" | 7,919 impr., 414 clicks, pos ~5.7, 5.2 % (daily CTR 7-11 % on 21-28 Oct, 1.3-4 % on 30 Oct-2 Nov while impressions doubled; whether the 30 Oct title or the new "cuándo son" demand caused it is not known) | próximas elecciones en cataluña 2026 210 at 3.2, cuando son las elecciones en cataluña 198 at 6.8, proximas elecciones cataluña 121 at 5.9, cuándo son las elecciones en cataluña 105 at 6.5, donde tengo que ir a votar 2026 26 at 6.5 | "29N" back in the title (the pre-30 Oct title had it); description gives the general (29 Nov, 9-20 h) and expected municipal (23 May 2027) dates, the finder without DNI and 19 Nov |
| `/ca/guies/com-votar-eleccions-catalunya/` (`voting`) | "Properes eleccions a Catalunya: quan són i on votar el 29N" → "Quan són les properes eleccions a Catalunya? 29N i on votar" | 1,086 impr., 21 clicks, pos ~7, 1.9 % | quan son les proximes eleccions a catalunya 13 at 10.4, quan son les properes eleccions a catalunya 9 at 8.2, eleccions catalunya quan son 4 at 8 | Title is the query; H1 follows; description as es |
| `/en/guides/spain-general-election-candidates-catalonia/` (`candidates`) | "Spain general election 2026: candidates in Barcelona" → "Spain general election 2026 candidates: Barcelona, Catalonia" | 409 impr., 10 clicks, pos ~5, 2.4 %; almost nothing since 29 Oct; queries are `site:boe.es` operators | 2026 spain general election dates 6 at 7.5, next catalan election 3 at 5.3 | Description: final lists proclaimed in the BOE on 3 Nov, every Congress and Senate candidate, appeals by 12 Nov. ca/es titles kept (es converts at 10-22 %); ca/es descriptions now say "proclamades/proclamadas (BOE del 3 de novembre/noviembre)" |
| `/en/guides/spain-election-night-results/` (`election-night`) | "Spain general election results 2026: what time, where" → "Spain general election results 2026: what time on 29 Nov" | 1,040 impr., 28 clicks, pos 4.9, 2.7 % | election results 43 at 8.3, 2026 spain general election results 33 at 5.6, spain elections 2026 results 13 at 5.4, when do election results come out 5 at 3.6 | Description: polls 9:00-20:00, Canaries 21:00, 2023 count from 21:00, official count 4-7 Dec. ca/es titles kept, descriptions now give the times (20:00, 21:00 in 2023, 4-7 Dec) instead of listing the topics |

**Body, same day.** Mesa (ca/es/en): the lead answers "have I been drawn"
(only by the notice, due by 7 Nov), the 7 days to object to the Junta
Electoral de Zona (paper or Interior's Cl@ve platform, JEC Instrucción
2/2023), the €75 and its unknown payment date, Monday's five hours and the
offence; a key-facts block under it ("Si te ha tocado: lo que tienes que saber
hoy") repeats them one line each; new: over-65s can decline in the same 7
days, a late notice is still valid, only the Junta can relieve you, night
shifts; FAQs "¿Qué tengo que hacer si me ha tocado mesa electoral?" and
"¿Puedo presentar la excusa por internet?". Voting (ca/es/en): postal vote
with LOREG art. 72 (tenth day before, 19 Nov), Correos opening hours for the
25 Nov hand-in, Correos' new e-mail confirmation; MiDNI still suspended at
3 Nov (JEC sessions of 26 and 29 Oct read); DOGC voter-leave order still not
out (in 2023 it came 16 days before the vote); FAQ on paid hours to vote.
Candidates: lead and FAQ say the proclaimed lists are out (BOE-A-2026-23103),
and the live block's parser reads all four provinces from that item.
Election night: still no results site (checked 3 Nov), no link added.

**Prediction.** EN how-to-vote to ≥ 3 % at 5-6 by 15 Nov; EN mesa ≥ 2 % (its
Spanish fragments are AI-mode follow-ups and may stay near zero); ES/CA mesa
≥ 6 % while notices and excuses run (to 14 Nov); ES how-to-vote back to ≥ 5 %
at the same position; EN election night ≥ 4 % in the last week.

**Measure on 15 Nov 2026** (owner's goal date; 12 days after deploy) **and on
1 Dec 2026** (after polling day): position, CTR and clicks per page and per
target query; check the last crawl date of each URL first.

**Outcome:** _pending_

## 2026-11-03 — Holidays head pages: 2027 leads the work calendar; "is today a holiday" answers with dates (groups `holidays`, `holiday-today`; owner lifted the freezes)

Why: the two head pages of the holidays cluster sit at 12-13 with CTR under
1 % while their queries grow, and the owner's goal is 1M impressions by 15 Nov
with maximum CTR. The 28-day rule for the 28/30 Oct changes on these pages is
lifted by that priority. Titles, descriptions and first screens change
together (against the "one thing" rule, knowingly): attribution is per page.
Baselines are `scripts/snapshot.py page <substr> 28|14`, to 3 Nov 2026
(3 Nov partial).

Facts re-read on 3 Nov 2026: the Generalitat's 2027 calendar page (the twelve
dates and weekdays; Aran swaps 29 Mar for 17 Jun), Portal Jurídic (Ordre
EMT/52/2026, DOGC 9637, 1 Apr 2026), the BOE list BOE-A-2026-21254 (the same
twelve for Cataluña; Jueves Santo not marked), the Generalitat's 2026 page
(8, 25 and 26 Dec still to come; Aran keeps 17 Jun instead of 26 Dec) and
Barcelona's calendar (17 May and 24 Sep 2027). All unchanged; `LAST_VERIFIED`
and `CALENDAR_VERIFIED_AT` moved to 2026-11-03. Open data b4eh-r8up: 0 rows
for 2027 local days on 3 Nov, so "not published yet" stays.

| Page (publish group) | Old title → new title | Baseline | Target queries now | What changed |
| --- | --- | --- | --- | --- |
| `/es/guias/calendario-laboral-cataluna/` (`holidays`) | "Calendario laboral 2027 Cataluña: 12 festivos y puentes" → "Calendario laboral 2027 Cataluña y Barcelona: festivos"; description → "Los 12 festivos 2027 en Cataluña: 1 y 6 ene, … 6, 8 y 25 dic. Barcelona: 17 may y 24 sep. Y los de 2026." | 28 d: 3,996 impr., CTR 0.8 %, pos 12.7; 14 d: 2,814 impr., 21 clicks (0.75 %) | calendari laboral 2027 catalunya 65 at 8.7 (CA query, 4.6 %), festivos catalunya 2027 43 at 9.2, calendario laboral cataluña 2027 42 at 1.0 (0 clicks), calendario laboral 2027 catalunya 36 at 9.5, festivos 2027 catalunya 28 at 10.2, calendario 2027 catalunya con festivos 19 at 8.8, calendario laboral barcelona 2027 12 at 23.0 | Barcelona in the title for the rising "calendario laboral 2027 barcelona"; "puentes" dropped from the title (the bridges page owns those queries). First screen: the lead sentence, then the 2027 table (date linked to its `/es/festivos/dia/…-2027/` page, weekday, name; Barcelona's two days under it, linked to `/es/festivos/barcelona/`), then "Los últimos festivos de 2026" (martes 8, viernes 25, sábado 26 dic, each linked to its date page; lunes 7 not a holiday; link to the full 2026 table, which stays lower down). Bridges, key facts and the rest follow. The one-day bridge is now dated "7 de diciembre de 2027" so it cannot be read as this year's |
| `/ca/guies/calendari-laboral-catalunya/` (`holidays`) | title kept ("Calendari laboral 2027 Catalunya: festius, ponts i Pasqua": already front-loaded, and the Pasqua rule stays for "divendres sant 2027" / "pasqua florida 2027"); description → "Els 12 festius 2027 a Catalunya: 1 i 6 gen, 26 i 29 març (Pasqua), … 6, 8 i 25 des. Últims del 2026: 8, 25 i 26 des." | 28 d: 1,617 impr., 10 clicks (0.6 %); 14 d: 674 impr., 6 clicks (0.9 %), pos 8-13 | calendari laboral 2027 catalunya 18 at 9.6, calendari laboral catalunya 2027 13 at 9.7, divendres sant 2027 13 at 10.2, pasqua florida 2027 11 at 7.3, festius catalunya 2027 7 at 15.6, ponts 2027 7 at 9.3 | Same first screen as es (`/ca/festius/dia/…-2027/`, `/ca/festius/barcelona/`) |
| `/en/guides/catalonia-public-holidays/` (`holidays`) | title kept ("Barcelona & Catalonia public holidays 2027: all dates"); description → "Catalonia's 12 public holidays in 2027: 1 & 6 Jan, … 6, 8 & 25 Dec. Barcelona adds 17 May and 24 Sep." | ~9 impr./day, 0 clicks | public holidays barcelona 2027 (1) | Same first screen (`/en/holidays/day/…-2027/`, `/en/holidays/barcelona/`) |
| `/es/guias/es-festivo-hoy-cataluna/` (`holiday-today` + deploy) | live "¿Hoy es festivo en Cataluña? Próximo festivo: 8 de diciembre" → live "¿Es festivo hoy en Cataluña? Próximo festivo: 8 de diciembre" (the H1's and the owner's word order); live description now names the next three: "Próximo festivo en toda Cataluña: martes 8 de diciembre (la Inmaculada). Después, 25 y 26 de diciembre. Si hoy o mañana es festivo y dónde es fiesta local." ("toda" dropped on a day Aran does not keep). Stored fallback "¿Hoy es festivo en Cataluña? Hoy, mañana y en tu municipio" → "¿Es festivo hoy en Cataluña? Hoy, mañana y próximos festivos" | 28 d: 1,417 impr., CTR 0.3 %, pos 12.8; 14 d: 1,419 impr., 4 clicks | hoy es festivo en cataluña 162 at 8.2, es festivo hoy en cataluña 49 at 8.8, hoy es festivo 36 at 16.3, festivos hoy 24 at 10.1, es fiesta hoy en cataluña 19 at 10.8, mañana es festivo 57 at 53.6 (all 0 clicks) | The live block is now the first thing on the page (the lead moved under it). Its first screen is dated, so the static HTML stays true between rebuilds: "No: hoy, martes 3 de noviembre, no es festivo en Cataluña."; "¿Mañana es festivo? No — miércoles 4 de noviembre"; "Próximos festivos": martes 8 dic, viernes 25 dic, sábado 26 dic (excepto en Arán), each linked to its date page; no "dentro de N días" (a count goes stale at midnight, a date does not). A year with no published order gets neither yes nor no. Link to the 2027 work calendar right under it. Aran's 2027 swap (29 Mar) now flagged in the upcoming table too |
| `/ca/guies/es-festiu-avui-catalunya/` (`holiday-today` + deploy) | live title kept ("Avui és festiu a Catalunya? Pròxim festiu: 8 de desembre": already the CA searchers' order, "avui es festiu a catalunya"); live description names the next three ("… Després, 25 i 26 de desembre. Si avui o demà és festiu i on és festa local avui."); stored fallback "…Avui, demà i al teu municipi" → "Avui és festiu a Catalunya? Avui, demà i pròxims festius" | 14 d: 212 impr., 0 clicks, pos 4-6 | avui es festiu a catalunya 15 at 4.7, avui es festiu? 15 at 4.5, quina festa es avui 7 at 6.4, dema es festiu a catalunya 3 at 5.7 | Same block |
| `/en/guides/is-today-a-holiday-in-catalonia/` (`holiday-today` + deploy) | live title kept ("Is today a holiday in Barcelona and Catalonia? Next: 8 Dec"); live description names the next three | ~1 impr./day | is today a holiday in catalonia 4 at 8.8 | Same block |

**How "true between rebuilds" works.** The page is cached for a day
(`revalidate = 86400`) and the nightly cron (`5 23 * * *` UTC: 00:05 in Madrid
in winter, 01:05 in summer) revalidates every page with a `holidayToday` block;
the next visit regenerates it. Between midnight and that visit an old copy can
be served, so every first-screen sentence names its date
(`src/lib/content/holidays/today-answer.ts`, tested for every day of 2026 and
2027) and the live title and description only name holidays, never "today is
not one". The cron schedule was not touched.

**Prediction.** ES work calendar from 0.8 % to ≥ 2 % at 10-12 and into the top
10 for "calendario laboral 2027 barcelona" (now 23); CA work calendar ≥ 2 % on
"calendari laboral 2027 catalunya" / "divendres sant 2027"; ES "is today a
holiday" ≥ 2 % on "hoy es festivo en cataluña" / "es festivo hoy en cataluña"
at 8-9, with a spike around 8 Dec. The 2027 date pages gain clicks from the
two pages' new links in the first screen.

**Measure on 15 Nov 2026** (owner's goal date) **and on 1 Dec 2026**: per page,
impressions, CTR and position for the queries above (`scripts/snapshot.py page
calendario-laboral 14`, `calendari-laboral`, `es-festivo-hoy`, `es-festiu-avui`),
and clicks on `/es/festivos/dia/*-2027/` referred from these pages; check the
last crawl date of each URL first.

---

## 2026-11-03 — Shops open on Sundays and holidays: 29N and Christmas on the first screen (group `shops`, owner request)

Why: the ES edition is one of the strongest pages (4,145 impressions on
31 Oct-2 Nov, pos ~5) and its demand comes in waves around the dates people
ask about. The 1 Nov wave is over; the next are Sunday 29 November (general
election day), the December Sundays, 8 December, Christmas and Reis. The
owner asked for those dates on the first screen and in the snippet. This is
inside the 28-day window of the 30 Oct titles (ES top-3 push, CA wave 4) and
of today's CA description from the CTR sweep, and title and description
change together: knowingly against both rules, by the owner's priority.
Measure the page against the baseline below, not field by field.

Baseline, `scripts/snapshot.py page <substr> 14`, 21 Oct-3 Nov (impressions
start on 25 Oct for ES; 3 Nov partial):

| Edition | Impressions | Clicks | CTR | Position | Visible queries |
| --- | --- | --- | --- | --- | --- |
| ES `/es/guias/tiendas-abiertas-festivos-cataluna/` | 5,699 | 272 | 4.8 % | ~5 | tiendas abiertas hoy en barcelona 2026 83 at 6.4 (1.2 %); tiendas abiertas 1 noviembre barcelona 45 at 4.2; domingo 1 de noviembre abren las tiendas 44 at 4.2; apertura festivos 35 at 5.9; festivos apertura cataluña 2026 29 at 6.3; tiendas abiertas mañana en barcelona 2026 24 at 5.4; centros comerciales abiertos hoy 17 at 3.1; tiendas abiertas domingo barcelona 2026 14 at 6.3 |
| CA `/ca/guies/botigues-obertes-festius-catalunya/` | 1,013 | 24 | 2.4 % | ~4.5 | botigues obertes avui a barcelona 2026 22 at 6.1; diumenges botigues obertes 2026 17 at 7.2; festius oberts catalunya 2026 7; botigues obertes diumenge barcelona (2026) 6+6 at 6-7 |
| EN `/en/guides/shops-open-sundays-holidays-catalonia/` | 293 | 2 | 0.7 % | ~5.5 | barcelona shops open on sunday 3 at 8.3; are shops open in barcelona on sunday / today 1 each; the rest are fragments |

Titles and descriptions (old → new):

- ES: "Domingos y festivos de apertura 2026 en Cataluña y Barcelona" →
  **"Tiendas abiertas en Barcelona: domingo 29 nov y diciembre"**.
  Description: "Festivos de apertura que quedan en 2026: 29 de noviembre y 6,
  8, 13, 20 y 27 de diciembre. Los 30 municipios…" → "Domingo 29 de
  noviembre, día de elecciones: sí pueden abrir en Barcelona y Cataluña. En
  diciembre, 6, 8, 13, 20 y 27; 25 y 26, no. 30 municipios cambian."
- CA: "Festius i diumenges d'obertura 2026 a Catalunya i Barcelona" →
  **"Botigues obertes a Barcelona: diumenge 29 nov i desembre"**.
  Description: "Botigues obertes diumenges i festius 2026: a Barcelona queden
  el 29 de novembre…" (today's sweep) → "Diumenge 29 de novembre, dia
  d'eleccions: sí que poden obrir a Barcelona i Catalunya. Al desembre, 6, 8,
  13, 20 i 27; 25 i 26, no. 30 municipis canvien."
- EN: "Shops open on Sundays in Barcelona & Catalonia: 2026-27" →
  **"Are shops open on Sunday in Barcelona? 29 Nov and December"**.
  Description: "Shop opening days left in 2026: 29 November and…" → "Sunday
  29 November, election day: yes, shops may open in Barcelona and Catalonia.
  In December: 6, 8, 13, 20 and 27, not 25-26. The 30 towns that differ."

What changed on the page (all three editions; facts and URLs in the header
comment of `src/lib/content/batch02/shops.ts`, every one read on 3 Nov):

- Lead answers 29N first ("Sí: el domingo 29 de noviembre, día de las
  elecciones generales, las tiendas pueden abrir…"), then the December days,
  the closing days (25-26 Dec, 1 and 6 Jan) and the first 2027 day (3 Jan).
- New first table "date → can shops open? (Catalonia / Barcelona / official
  basis)" from Sundays 8-22 Nov to 10 Jan 2027, replacing the "days left in
  2026" table. Exceptions are computed from `TOWNS_NOV_DEC` (Gironella,
  Martorell and Salt on 29 Nov; Riells i Viabrea and Terrassa on 6 Dec; 21
  towns on 8 Dec; Olot on 13 Dec; Gironella on 27 Dec). 24 and 31 Dec and
  5 Jan are working days (Ordre EMT/66/2025, Ordre EMT/52/2026); 25-26 Dec
  and 1 and 6 Jan are closed by Llei 18/2017 art. 36.2.d; 3 Jan 2027 is a
  general day (Ordre EMT/89/2026); 10 Jan 2027 is the default day, pending
  for Barcelona.
- New section "29 de noviembre, día de elecciones: qué tiendas abren": the
  election is not a closing day (art. 36.2.d lists them), large stores and
  shopping centres included, up to four paid hours to vote (RD 605/1999 art.
  13), link to the how-to-vote guide.
- 2027: the DOGC list of municipal days and swaps is not out (every DOGC
  title from 14 Oct to 3 Nov scanned); precedent 27 Nov 2025 (Resolució
  EMT/4342/2025). Barcelona's 2027 days are not on its commerce page or in
  the DOGC. The food retailers' swap list (Ordre EMT/89/2026 art. 6.3) is not
  out either.
- FAQ: 29N first in ES/EN (second in CA, whose first FAQ is pinned by a
  test), new "24 and 31 December", the 1 November FAQ now in the past tense
  plus the 2027 rule (1 Nov 2027 is a general day councils may not swap).
- Not done: the retail promotion of Friday 27 November is not named (the
  tests forbid it; 27 Nov is an ordinary working day and adds nothing to the
  table).

**Prediction.** ES CTR ≥ 6 % at the same position (~5) in the week before
29 Nov, with "tiendas abiertas … barcelona" queries above 3 %; CA ≥ 4 %; EN
≥ 2 % if its impressions pass ~150 a week. Impressions should rise in the
29 Nov week and again from 4 Dec; a CTR drop on "domingos y festivos de
apertura 2026" (the old title's words) would be the cost to watch.

**Measure on 15 Nov 2026 and on 1 Dec 2026**: per edition and per query
(ES `tiendas-abiertas`, CA `botigues-obertes`, EN `shops-open`); check the
last crawl date first. **Revisit after 29 Nov**: the title names a past
date from 30 Nov (next: the December Sundays and 8 Dec), and after the DOGC
publishes the 2027 municipal list (add Barcelona's 2027 days, the 10 Jan
row and the 2027 table).

## 2026-11-03 — Christmas cluster: Santa Llúcia 2026 is out, titles and snippets give it (groups `christmas`, `nadal-tradicions`, `barcelona-december`, `pessebres`, `reis-2027`; fairs family by deploy)

Why: the Generalitat's Agenda Cultural de Catalunya published the Fira de
Santa Llúcia that morning (activity 2026110300020, open data rhpv-yr4f):
**27 Nov – 23 Dec 2026, 10–21 h**, Avinguda de la Catedral, organiser
Associació Fira de Santa Llúcia. firadesantallucia.cat still showed 2025, so
every page credits the agenda, not "the organisers". The descriptions said
"Santa Llúcia, encara sense dates", which became false. The CA and EN titles
were last changed on 30 Oct; the owner's lifted freeze (see the CTR sweep
above) is used again here, so those two overlap the 30 Oct window. Titles and
descriptions change together: read it per page.

Baseline, `snapshot.py page mercat 28` (CA markets guide; 7–14 Oct ≈ 0, so
effectively 21 Oct–2 Nov): ~890 impr., 37 clicks, 4.2 %, pos 5–8. Top
queries: fires de nadal catalunya 2026 104 / 6 clicks / 6.8; mercats de nadal
a catalunya 2026 35 / 5.2; fires nadal catalunya 2026 34 / 0 / 5.7; mercats
nadal catalunya 2026 33 / 5 clicks / 5.4; fira santa llúcia barcelona 2026
(+ variants) ~15 at 8–11. ES (`mercados-navidad`, guide + hub): mercados
navideños cataluña 2026 78 / 2 / 7.7; mercadillos navideños cataluña 2026 16
/ 8.2. EN guide: barcelona christmas market 5 at 80. Pessebres: ~10–20 impr.
per edition (belen viviente cataluña 7 at 6.0, belenes vivientes 2026 6 at
7.7, pessebres vivents catalunya 2026 3–4 at 6–8).

| Page (group) | Old → new | What the snippet now promises |
| --- | --- | --- |
| `/ca/tradicions/mercats-de-nadal-catalunya/` (`christmas`) | title "Fires i mercats de Nadal Catalunya 2026: dates i llocs" → "Fires i mercats de Nadal Catalunya 2026: dates, Santa Llúcia"; description "…43… com l'Avet d'Espinelves (28 de novembre-8 de desembre). Santa Llúcia, encara sense dates." → "Fires de Nadal Catalunya 2026: 43 amb data oficial. Santa Llúcia (Barcelona): del 27 de novembre al 23 de desembre de 2026, de 10 a 21 h." | the count and Santa Llúcia's dates and hours |
| `/es/tradiciones/mercados-navidad-cataluna/` (`christmas`) | title kept ("Mercados navideños Cataluña 2026: fechas y Santa Llúcia"); description "…como el Avet de Espinelves… Santa Llúcia, aún sin fechas." → "Mercados navideños Cataluña 2026: 43 con fecha oficial. Santa Llúcia (Barcelona): del 27 de noviembre al 23 de diciembre de 2026, de 10 a 21 h." | as ca |
| `/en/traditions/christmas-markets-catalonia/` (`christmas`) | title "Barcelona Christmas markets 2026: dates, Santa Llúcia fair" → "Barcelona Christmas markets 2026: Santa Llúcia from 27 Nov"; description "Fira de Santa Llúcia 2026 dates not published yet (2025: 28 Nov–23 Dec…)" → "Fira de Santa Llúcia 2026: 27 Nov–23 Dec, 10:00–21:00, by Barcelona Cathedral. Sagrada Família fair: dates not out yet. Every Catalan market with dates." | the 2026 dates and hours |
| `/ca/tradicions/pessebres-vivents-catalunya/` (`pessebres`; es/en) | titles kept; descriptions "Calendari … llegit cada dia de l'agenda…" (the agenda still lists no 2026-27 nativity) → "Pessebres vivents 2026-27 amb data oficial: Corbera (des del 28 de novembre), Tona, les Torres de Fals, l'Espluga, la Torre del Suro… i el calendari diari." (es/en alike) | the nine dated nativities instead of an empty calendar |
| `/ca/fires-de-nadal/barcelona/` (+ es, en; new, deploy) | — → "Fira de Santa Llúcia de Barcelona 2026: dates i lloc" / "Feria de Santa Llúcia de Barcelona 2026: fechas y lugar" / "Barcelona Christmas market 2026: dates and place" | new town page from the agenda row; long agenda names lose their street ("… a l'Avinguda de la Catedral…") in headings so the town fits in 60 |

Unchanged titles, checked against their queries: Barcelona in December
("festius desembre 2026", "eventos barcelona diciembre 2026": already
answered), Christmas traditions, Reis (Barcelona's 2027 programme is not out),
La Marató and Christmas in Barcelona (changed today by other work). Body,
same day: Santa Llúcia's dates, hours and source in the markets guide (lead,
table, section, two FAQs), the traditions page and the December hub (table,
key facts, fairs paragraph; "still undated" now lists only the lights and New
Year's Eve). Links added: markets → Barcelona in December, Reis, fairs
Barcelona page; traditions → Barcelona in December; pessebres → traditions,
Christmas in Barcelona, Barcelona in December, Reis; Reis → markets,
pessebres; December hub → fairs Barcelona page; fairs hub and town pages →
Reis (and Barcelona in December on the hub and Barcelona's page).

**Prediction.** CA markets guide ≥ 5 % CTR at ≤ 6 by 15 Nov with "fira santa
llúcia 2026" variants entering the top 5; EN guide starts to show for
"santa llucia christmas market 2026"; the new Barcelona fairs page indexed and
ranking for "fira de santa llúcia 2026" by 20 Nov.

**Measure on 17 Nov 2026** (14 days) **and 1 Dec 2026**, per page and per
query; check the last crawl first. If firadesantallucia.cat publishes other
dates, the agenda-sourced dates go and this entry records it.

**Outcome:** _pending_

## Candidates not yet run

Recorded so they are not lost, and so they are not all started at once.

- **`/en/day-trips/barcelona-day-trips-by-train/`** — "what are the best day
  trips from barcelona" sits at position 3 with 1 impression; "barcelona day
  trips by train" at position 10. Too little data to act on. Revisit once
  impressions pass ~50.
- **Home page.** `catalunya informacio` gave 51 impressions at position 11.5
  with zero clicks over 14 days, and the same query ranks `/`, `/ca/` and
  `/en/` simultaneously. Two separate problems — intent mismatch and three URLs
  competing — and the second should be understood before the first is touched.

  **The second is now understood** (URL inspection, 25 September). `/ca/` comes
  back as *"Duplicate, Google chose different canonical than user"*: our
  canonical says `/ca/`, Google's says `/`. The cause is the language
  negotiation in `src/proxy.ts` — `/` answers 307, and a *temporary* redirect
  leaves the redirecting URL as the canonical one, which is exactly what 307
  means. The 307 itself is correct and must stay: the destination depends on
  `Accept-Language`, so a 308 would have a browser cache one visitor's language
  for every later visitor.

  That leaves one lever worth trying and one not worth trying:

  - **Worth trying:** point `x-default` at `/` instead of `/en/`. It currently
    claims the English page is the default, while Google has independently
    decided `/` is. Aligning the two costs nothing and may consolidate the
    cluster.
  - **Not worth trying:** forcing `/ca/` to win. It is the Catalan edition of a
    trilingual site; `/` is genuinely the language-neutral entry point.

  Still one change at a time, and not in the same window as the tourist tax
  measurement.
- **`/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/`** — ranks 16–47 for
  several "cap de setmana" variants. That is a ranking problem, not a CTR one;
  a title change would not fix it.

### 2026-11-03 (main session) — ES December bridge title gives the answer

- /es/guias/puente-diciembre-cataluna/: "Puente de diciembre 2026 en Cataluña: qué días son festivos" → "Puente de diciembre 2026 en Cataluña: festivo el martes 8" (same pattern as CA since 3 Nov). Description unchanged. GSC 21 Oct–3 Nov: "festivos diciembre 2026" 97 impr pos 5.2 0 clicks, "festivos de diciembre 2026" 33 pos 5.6 0 clicks; page CTR 2.3% at pos 5.6. Measure 15 Nov and 1 Dec (`snapshot.py page puente-diciembre 14`). Publish group: pont-desembre.

## 2026-11-04 — Election town pages: "Mesa electoral a/en <town>" with the town's Junta Electoral de Zona (body only; deploy, no publish group)

**What changed.** Every election town page (`/ca/eleccions/<town>/`,
`/es/elecciones/<town>/`, 947 each, and the 30 `/en/elections/<town>/`) gets a
compact section before the polling places: H2 "Mesa electoral a <town>" /
"Mesa electoral en <town>" / "Polling-station duty (mesa electoral) in
<town>"; a lead (draw closed 4 Nov, notice by 7 Nov, 7 days to file an excuse
with the named JEZ); rows for notice, excuse (Cl@ve platform, to 14 Nov if
notified on the 7th, 65+ may decline), €75 and 5 hours off on Monday 30 Nov;
the town's **Junta Electoral de Zona** with the JEC directory's address and
tap-to-call phones, and a line on its judicial district; a link to the mesa
guide. Also a facts row ("Excuses de mesa (29N)") and a FAQ item ("Si m'ha
tocat mesa el 29N a <town>, on presento l'excusa?"), which also lands in the
page's FAQPage JSON-LD. Titles and descriptions untouched (3 Nov change,
commit 6b827d9, still measuring). Code: `src/lib/programmatic/elections/mesa-duty.ts`,
`jez.json` (19.8 KB, one line, built by `scripts/elections-jez.py`),
`ElectionMesaSection.tsx`; facts imported from `MESA_29N` in `mesa.ts`
(guide output byte-identical, so no `mesa` publish).

**A correction to the brief, from the law.** The JEZ is not simply "the
partit judicial's head town": LOREG art. 8.3 seats each JEZ in the head town
of the districts of art. 8.6, "los de las Elecciones Locales de 1979".
Catalonia has 49 judicial districts but 31 JEZ, and 200 towns file elsewhere
than their current district: Sant Boi, el Prat → l'Hospitalet; Santa Coloma
de Gramenet → Barcelona; Mollet → Granollers. The page names the JEZ and
explains the difference. Mapping: Generalitat register vevv-8fvw
(PARTIT_ELECTORAL), 947/947 equal to the JEC's own per-municipality pages
and, for the district, to Justícia's 772x-hgsh.

**Why.** "mesa electoral (29n) <town>" is the fastest-rising election query
family since the draw (31 Oct–4 Nov) and lands on these pages, which had no
answer for someone who has been drawn. Baseline, `scripts/snapshot.py page
/eleccions/ 14` and `page /elecciones/ 14` (GSC, 3 Nov partial):

| Family | 2 Nov | 3 Nov |
| --- | --- | --- |
| /ca/eleccions/ | 7,248 impr., 273 clicks, 3.8 %, pos 5.4 | 5,751 impr., 274 clicks, 4.8 %, pos 4.7 |
| /es/elecciones/ | 6,964 impr., 461 clicks, 6.6 %, pos 4.2 | 8,240 impr., 718 clicks, 8.7 %, pos 3.9 |

Mesa queries in the two top-30 lists (22 Oct–4 Nov): 1,843 impr., 69 clicks,
**3.7 %**. ES: santa coloma de gramenet 261 at 2.3 (8.4 %), hospitalet 200 at
7.9 (0.5 %), matadepera 111 at 4.7, sant boi 98 at 3.7, el prat 87 at 3.3,
mollet 78 at 2.7, martorell 57 at 2.2 (12.3 %), salou 37 at 1.4 (13.5 %). CA:
matadepera 239 at 6.1 (**0.4 %**), vacarisses 43 at 5.0 (0), santa coloma 36,
cardedeu 27, figueres 22 (all ≈ 0). `rising` (28 Oct–3 Nov vs the 7 days
before): mesa electoral matadepera +357, santa coloma +225, hospitalet +205.

**Prediction.** Demand peaks while notices arrive (to ~7 Nov) and fades after
the last excuse day (14 Nov). With the answer and the JEZ in the body (and in
the snippet Google builds for these queries): mesa-query CTR on the two
families from 3.7 % to **≥ 6 %**, average position from ~4.5 to **≤ 3.5**, CA
mesa queries off ~0 % to ≥ 2 % (their title still says "on votar", so the
ceiling is lower); hospitalet (pos 7.9) into the top 5. Risk: the section sits
above the polling places, so "on votar" queries could lose a little CTR;
watch "on votar"/"dónde votar" + town at equal position.

**Measure on 11 Nov 2026** (a week after deploy, still inside the excuse
window) **and on 17 Nov** (after it): `snapshot.py page /eleccions/ 14`,
`page /elecciones/ 14`, filter "mesa electoral"; check the last crawl of
matadepera, santa-coloma-de-gramenet, l-hospitalet-de-llobregat first. A test
fails from 1 Dec 2026 to force the section's removal after polling day.


## 2026-11-04 — New page: Christmas lights switch-on 2026, Barcelona and 25 towns (groups `llums-nadal`, `llums-nadal-links`; deploy first)

**URLs (new, year-free):** `/ca/guies/encesa-llums-nadal-barcelona/`,
`/es/guias/encendido-luces-navidad-barcelona/`,
`/en/guides/barcelona-christmas-lights/`.

**Why.** Lights queries are the fastest-rising family on the site, and the
only pages answering them are the general Christmas pages, whose titles are
inside the 3 Nov window. Search Console, 22 Oct–4 Nov (`snapshot.py page … 14`):

- CA `/ca/guies/nadal-a-barcelona/`: "encesa llums nadal barcelona 2026" 378
  impr / 3 clicks / 0.8 % / pos 8.2; "encesa de llums barcelona 2026" 290 / 1 /
  pos 8.0; "encesa llums barcelona 2026" 68 / 0 / 6.8; "encesa llums nadal
  2026" 31 / 0 / 6.8.
- ES `/es/guias/navidad-en-barcelona/`: "cuando encienden las luces de navidad
  en barcelona 2026" 703 / 2 / pos 6.3; "encendido luces barcelona 2026" 502 /
  1 / 5.9; "encendido luces navidad barcelona 2026" 482 / 2 / 6.9; "encendido
  de luces barcelona 2026" 265 / 1 / 6.1; "luces navidad barcelona 2026" 118 /
  1 / 9.3; plus the Catalan query again, 98 / 2 / 6.8.
- Brief's 7-day view: "encesa llums nadal barcelona 2026" 311 at 8.3, "encesa
  de llums barcelona 2026" 206 at 8.7, "luces navidad barcelona 2026" 69 at
  9.1; about 3,000 impressions of lights queries a week at 0.5 % CTR.
- `rising 7` (28 Oct–3 Nov vs the 7 days before): "encendido luces barcelona
  2026" +455, "cuando encienden las luces…" +365, "encesa llums nadal barcelona
  2026" +306, "encesa de llums barcelona 2026" +198.
- Town-level lights queries ("encesa llums nadal <town> 2026", "encendido luces
  navidad <town>"): 0 impressions, because no page of ours has them. In 2025
  the councils announced between 12 and 25 November, so these peak mid–late
  November.

**Facts checked today (official pages only).** Barcelona: still no 2026 date.
Checked the press room home, its searches for "llums nadal" and "encesa" (newest
2026 items 8–9 Jul), the `nadal-2026` tag, and barcelona.cat/nadal (still the
2025 edition, "s'actualitzarà al voltant del mes de novembre"). So
`ANNOUNCED_2026.lightsSwitchOn` stays null. The new `LIGHTS_SWITCH_ON_CHECKED`
in festive.ts is 4 Nov. Towns: none of the 25 councils had published 2026. 22
have their 2025 date on their own site, and Sant Cugat only its 2024 date. Vic
and Rubí have none (Rubí's site blocks every automated request). Fact pack:
`research_notes/llums-nadal-2026.md`; each row's URL and quote are in
`christmas-lights-towns.ts`.

**What the page does.**

- **Title**, Barcelona and the searched words first, 53–58 characters.
  - ca: "Encesa de llums de Nadal 2026 a Barcelona i Catalunya"
  - es: "Encendido de luces de Navidad 2026 en Barcelona y Cataluña"
  - en: "Barcelona Christmas lights switch-on 2026 and other towns"
  - ": dates" / ": fechas" is added on its own once a town has a 2026 date. It is
    left out today, because no 2026 date exists.
  - Once Barcelona announces, the title becomes the date, e.g. "Encesa de llums
    de Nadal 2026 a Barcelona: 21 de novembre".
- **Description**, answer first. "L'encesa de llums de Barcelona 2026 encara no
  té data (2025: 22 de novembre, 18:00, passeig de Gràcia). També Girona,
  Tarragona, Lleida i 22 municipis més." Once towns publish, it switches to
  "Ja tenen data Girona, …".
- **Body.** The lead gives Barcelona's answer, then a line on the towns. Key
  facts cover day, time, place, who, streets (130 km), nightly hours (2025) and
  until when (2025). Below that:
  - the language line;
  - the last three switch-ons table and the 2025 road closure;
  - the 2026 streets from the 9 Jul plan;
  - a town table of 26 rows (Barcelona first), with a 2026 column ("per
    confirmar") and a 2025 column labelled with its year, plus a council link
    on each row;
  - day-trip links (Girona, Figueres, Sitges, Tarragona);
  - a section linking the markets guide (Santa Llúcia 27 Nov–23 Dec 2026), Nadal
    a Barcelona, the living nativities, Barcelona in December and Reis;
  - an FAQ of 9 questions, including Girona, Tarragona and Lleida.
- **Barcelona's facts all come from festive.ts.** The 2025 nightly hours were
  added there as `PAST.lights2025.hours`, from the note of 16 Oct 2025.

**Links in (body only; titles and descriptions untouched, test-locked).**

- Christmas in Barcelona (ca/es/en): one sentence in the lights section. The
  2025 hours line there now comes from festive.ts. It said "les vigílies de
  festiu"; the City Council's note lists 24, 25 and 31 December and 5 January.
- Christmas markets guide (ca/es/en): one sentence in "I la resta de ciutats?".
- Both go out with `llums-nadal-links`. This is a body change on two pages
  inside the 3 Nov window: read their CTR with that in mind.

**Risk.** The new page competes with Christmas in Barcelona for the same
Barcelona queries. Read the outcome as the two URLs added together on the
lights queries, not the new page alone. If by 20 Nov the impressions are split
with no gain in combined clicks, the hub's lights wording is the thing to move
once its window closes (17 Nov).

**Prediction.**

- By 15 Nov the new page is indexed and in the top 10 for "encesa llums nadal
  barcelona 2026" and "encendido luces navidad barcelona 2026".
- Combined CTR of the two URLs on the lights queries goes from ~0.5 % to
  ≥ 1.5 %.
- The new page collects ≥ 1,500 impressions in its first 10 days, including its
  first town-level queries once councils announce (around 15–25 Nov).
- The big step comes the day Barcelona publishes, when the title and snippet
  switch to the date.

**Measure** on 17 Nov and 1 Dec 2026: `snapshot.py page encesa-llums 14`,
`page encendido-luces 14`, `page barcelona-christmas-lights 14`, plus the lights
queries on `page nadal-a-barcelona 14` / `page navidad-en-barcelona 14`. Check
the last crawl first.

**Follow-up.** When Barcelona publishes, fill `ANNOUNCED_2026.lightsSwitchOn`
and move `LIGHTS_SWITCH_ON_CHECKED`, then publish `llums-nadal` (plus
`christmas-bcn`, `nye` and `barcelona-december`). Re-read each town's `watch`
page around 15–25 Nov, fill `y2026`, move `LIGHTS_TOWNS_AS_OF`, then deploy and
publish `llums-nadal`. Girona's press room (web.girona.cat) returned 502 all day
on 4 Nov, so re-check it.

**Outcome:** _pending_

## 2026-11-04 — Strike guides: Renfe 10/12 Nov and education 26 Nov get pages of their own (groups `strikes`, `strike-11n`)

Why: date-named strike queries land on the generic hub around position 9
and are not clicked: "vaga 29 octubre" gave the ES hub 169 impressions at
8.9 with 0 clicks, "vaga 29 octubre 2026" 35 at 8.5, "vaga rodalies
29 octubre" 20 at 8.8 (CA hub). The 11N page shows what a page titled in the
searched words does: 19,076 impressions on ES in five days at 9.7 % CTR, against
4.6 % for the hub. The next two called strikes people search by name get the
same treatment before their peaks (Renfe: 9-10 Nov; education: 24-26 Nov).
Early signals: "proximas huelgas de renfe" 26 at 7.2 (ES hub), "vaga educacio
novembre" 25 at 3.8 (CA 11N page).

What changed:

- **New pages**, rendered from their entries in `strikes.ts` (field `guide`;
  module `strike-guides.ts`), so the strike watch's edits reach them with
  `?only=strikes`; titles and descriptions are built from the entry's dates
  and minimum-services status (a day called off or minimum services out
  rewrite them; tests/strike-guides.test.ts):
  - Renfe/Rodalies 10 and 12 Nov: `/ca/guies/vaga-renfe-rodalies-novembre/`
    **"Vaga Renfe 10 i 12 novembre 2026: Rodalies i serveis mínims"**;
    `/es/guias/huelga-renfe-rodalies-noviembre/` **"Huelga Renfe 10 y 12
    noviembre: Rodalies y servicios mínimos"**;
    `/en/guides/renfe-rodalies-strike-november/` **"Renfe strike 10 and 12
    November 2026: Rodalies and what runs"**.
  - Education 26 Nov: `/ca/guies/vaga-educacio-novembre/` **"Vaga educació
    26 novembre 2026: escoles i serveis mínims"**;
    `/es/guias/huelga-educacion-noviembre/` **"Huelga educación Cataluña 26 de
    noviembre: servicios mínimos"**;
    `/en/guides/catalonia-teachers-strike-november/` **"Catalonia teachers'
    strike 26 November: are schools open?"**.
  - Answer first: lead (days, what it is, what it touches, minimum-services
    status and who sets them), key facts (who calls it, days and hours,
    affects / not affected, minimum services), then minimum services with
    who sets them and where they appear (Treball's list and the DOGC; the
    Ministry of Transport's rail list for long distance), a service-by-service
    table, the 19 Rodalies lines' live pages (Renfe) or the school day (26N),
    what to do, other strikes those days, FAQ.
- **Hub** (body only; titles and descriptions frozen since 3 Nov): each of the
  two cards ends with a link to its guide.
- **11N page** (body only; titles frozen): the Rodalies paragraph links the
  Renfe guide and now reads whether Renfe's minimum services are out from
  `strikes.ts`; the schools section names the 26 Nov strike from its entry and
  links its guide; both guides join the related rail.
- **Publish groups**: `strikes` now republishes the hub and both guides;
  `strike-renfe` and `strike-educacio` publish one guide each. Go-live:
  deploy, then `strikes strike-11n`.

Facts re-verified on 4 Nov 09:33-10:10 (SEMAF feed and notices 2026-51/52,
Treball's list, DOGC 9787 via its summary API, the Ministry's rail list,
Rodalies, USTEC·STEs, CGT Ensenyament): nothing new, so no fact and not
STRIKES_AS_OF changed. Minimum services pending for both strikes. The 26 Nov
strike is called in the unions' own communiqués of 28 Oct; no registered
call, hours or staff are public yet, and the page says so.

Baseline, `scripts/snapshot.py page <substr> 14`, 22 Oct-4 Nov (4 Nov
empty, 3 Nov partial); the new URLs start at 0:

| Page | Impressions | Clicks | CTR | Position |
| --- | --- | --- | --- | --- |
| ES hub `/es/guias/huelga-hoy-cataluna/` | 19,375 | 897 | 4.6 % | 5.4-5.9 |
| CA hub `/ca/guies/vaga-avui-catalunya/` | 2,988 | 127 | 4.3 % | 4.9-6.4 |
| ES 11N `/es/guias/huelga-general-11-noviembre/` | 19,076 | 1,858 | 9.7 % | 4.9-6.1 |
| CA 11N `/ca/guies/vaga-general-11-novembre/` | 7,172 | 654 | 9.1 % | 4.3-6.3 |
| EN 11N `/en/guides/general-strike-11-november-spain/` | 2,829 | 177 | 6.3 % | 3.9-5.0 |

Prediction: by 15 Nov the Renfe guide (three editions) collects 4,000-8,000
impressions, most on 9-10 Nov, at position 6 or better and CTR 8 % or more
(the 11N analogue), and Renfe date queries ("huelga renfe 10 noviembre",
"vaga renfe 10 novembre", "huelga rodalies noviembre") rank it rather than
the hub; the hub keeps "huelga hoy" and its total does not fall more than
10 % on 9-12 Nov against 28-30 Oct. The education guide collects 300-1,000
impressions by 15 Nov (its peak falls after the goal window) and is measured
again on 27 Nov. Wrong if the Renfe guide is under 1,500 impressions by
15 Nov or its CTR is below the hub's. Measure on 11, 15 and 27 Nov:
`snapshot.py page renfe-rodalies 14` (all three Renfe editions), `page
vaga-educacio 14`, `page huelga-educacion 14`, `page teachers-strike 14`,
and the hub pages for cannibalisation.

## 2026-11-04 — Sitewide alert strip: every page links the 11N and Renfe strike pages (then 29N), in its own language (deploy only, no publish group)

What changed (code only; no title, description or body of any page):

- A strip under the header of every public page (`components/NewsAlerts.tsx`,
  rendered by `SiteHeader`, outside the sticky header): one line per active
  alert, in the page's language, linking that language's edition. Data and
  rules in `src/lib/alerts/news-alerts.ts`; tests in `tests/news-alerts.test.ts`.
  - 4 Nov 00:00 → 12 Nov 00:00 (Madrid): **"Vaga general el dimecres 11 de
    novembre: què funciona i serveis mínims"** / "Huelga general el miércoles
    11 de noviembre: qué funciona y servicios mínimos" / "General strike on
    Wednesday 11 November: what runs and minimum services" → the 11N page.
  - 4 Nov 00:00 → 13 Nov 00:00: **"Vaga de Renfe el dimarts 10 i el dijous 12
    de novembre: Rodalies i serveis mínims"** (es/en alike) → the Renfe guide.
  - 13 Nov 00:00 → 30 Nov 00:00: **"Eleccions generals el diumenge 29 de
    novembre: on i com votar"** / "Elecciones generales el domingo 29 de
    noviembre: dónde y cómo votar" / "General election on Sunday 29 November:
    how and where to vote" → the how-to-vote guide (`voting`).
- Days and ends come from `strikes.ts` (the entries' `dates`; a day called off
  moves the end and the wording, a removed entry drops its line) and from
  `GENERAL_ELECTION_DAY`. The copy names the day and never says "today".
- No line on the page it links to (compared with the page's own path).
- Expiry on static pages: the server renders only the lines active at render
  time; an inline script at the top of `<body>` (root layout, no client
  bundle) hides any line past its end before the strip is parsed, and the
  whole strip when none is left, also after client-side navigation. The
  29N line appears on static pages built from 13 Nov (next deploy) and on
  content pages within a day (ISR).

Why: the 11N pages are the site's biggest traffic driver, but for the Catalan
head queries both sit outside the top 8 (table). The ~2,000 election, holiday
and fair town pages and the guides that Google crawls every day had no link
to them; the strip gives each page one link per alert, with the searched
words in the anchor ("vaga general … 11 de novembre", "vaga de Renfe …
novembre"), and sends readers there in the week of the strikes.

Baseline, `scripts/snapshot.py page <substr> 14`, 22 Oct-4 Nov (4 Nov
partial; the pages began on 30 Oct):

| Page | Impressions | Clicks | CTR | Position (daily) |
| --- | --- | --- | --- | --- |
| ES 11N `/es/guias/huelga-general-11-noviembre/` | 20,202 | 1,955 | 9.7 % | 4.9-6.1 |
| CA 11N `/ca/guies/vaga-general-11-novembre/` | 7,708 | 705 | 9.1 % | 4.3-6.2 |
| EN 11N `/en/guides/general-strike-11-november-spain/` | 2,981 | 181 | 6.1 % | 3.9-5.2 |

2-3 Nov alone: ES 16,697 impressions / 1,637 clicks; CA 6,966 / 618.

| Query (14 days) | CA page: impr. / pos. | ES page: impr. / pos. |
| --- | --- | --- |
| vaga general 11 novembre | 2,304 / 8.4 (CTR 1.2 %) | 708 / 9.9 |
| vaga 11 novembre | 286 / 9.4 | 818 / 9.9 |
| vaga 11 novembre 2026 | 123 / 6.9 | — |
| vaga general 11 de novembre | 7 / 10.7 | 25 / 9.4 |

Prediction: from the first deploy with the strip, Google recrawls the town
pages within 2-4 days. By 10 Nov the CA 11N page averages position 6.0 or
better for "vaga general 11 novembre" (from 8.4) and 7.0 or better for "vaga
11 novembre" (from 9.4), and its share of the impressions of those two
queries against the ES page rises (it takes over "vaga 11 novembre", where
the ES page has 74 % of impressions today). CTR on those queries rises from
1.2 % to 4 % or more with the better position. The ES page holds position
5-6 overall. Totals will rise anyway with the 9-11 Nov peak, so the test is
the per-query position, not the totals. Wrong if, on 8-10 Nov, the CA page
is still at 8.0 or worse for "vaga general 11 novembre". Measure on 8, 11
and 15 Nov: `snapshot.py page vaga-general-11 7`, `page huelga-general-11
7`, `page general-strike-11 7` and the Renfe guide (`page renfe-rodalies 7`,
prediction in the section above). Confounders: the 3 Nov change to both 11N
pages (Catalan query wording, language line, snippets; section of that day)
and the 4 Nov strike guides are in the same window.

Rollback: remove `<NewsAlerts …/>` from `SiteHeader` and deploy (the expiry
script alone renders nothing visible).

## 2026-11-04 — New page: Gran Recapte d'Aliments 2026, 13-14 November (groups `gran-recapte`, `gran-recapte-links`; deploy first)

What was added: one guide in three languages on year-free URLs,
`/ca/guies/gran-recapte-aliments/`, `/es/guias/gran-recapte-alimentos/`,
`/en/guides/gran-recapte-food-drive-catalonia/` (module
`src/lib/content/batch02/gran-recapte.ts`, AS_OF 2026-11-04, sources in its
header). Answer first: the title carries both days ("Gran Recapte 2026: 13 i
14 de novembre, com fer-te voluntari" / "13 y 14 de noviembre, cómo ser
voluntario" / "13–14 November food drive, how to help", all ≤ 60), the
description gives the weekdays (Friday 13, Saturday 14) plus Bizum 33596;
the lead and key facts answer when, where, what to give, how to volunteer,
the Bizum code and the Mercadona / El Corte Inglés / Consum money-only rule.
Sections for the participating chains (31 named from the organisers' logos,
the shop list PDF), Barcelona's six municipal markets, foods (the Tarragona
food bank's list), volunteering (shift, coordinator, group, app, no published
deadline), money donations (online, Bizum, phone, transfer without copying
the IBAN, tax relief), what it is, and 2025 results (5.2 M€ equivalent,
17,500 volunteers). Nine-question FAQ. Hero reused (Santa Caterina market
roof, CC BY 2.0, the markets guide's exact alt and caption).

Links in (body only; titles and descriptions untouched): one sentence at the
end of La Marató's volunteering section and one tip in the Barcelona markets
guide, both from `granRecapteMention()`. Go-live: deploy, then publish
`gran-recapte`, then `gran-recapte-links` (La Marató and the markets guide).

Why: the Gran Recapte is Catalonia's biggest food collection (18th edition,
more than 2,000 collection points) and its searches ("gran recapte 2026",
"gran recapte voluntari", "gran recapte supermercats", "gran recapte bizum")
peak in the campaign week, 9-14 Nov, inside the 15 Nov goal window. No page
of ours answered them. The organisers' own site does not put the days, the
chains and the Bizum code on one screen, and their facts are spread over five
sites; that one-screen answer is what this page offers.

Facts: only the organisers' pages (granrecapte.org, acatbal.org, the four
food banks), read on 4 Nov 2026. Left out because the sources disagree or say
nothing: the volunteer target (15,000 vs 17,000), the 2025 tonnage (1,556 t
vs 1,341,766 kg), any collection hours, a volunteer deadline. A test fails
from 20 Nov (GRAN_RECAPTE_REFRESH_BY) until the page is re-read after the
campaign for the 2026 results.

Baseline, `scripts/snapshot.py page recapte 28` (28 days to 4 Nov): 0 impressions
on any URL; no "gran recapte" query in `gaps 28`. Linking pages, 22 Oct-4
Nov: La Marató (`page la-marato 14`) about 2,600 impressions at position
5.5-6.8; the Boqueria and markets guide (`page boqueria 14`) 636 impressions.

Prediction: by 15 Nov the three editions collect 1,500-5,000 impressions,
two thirds on ES and CA, most on 10-14 Nov, with "gran recapte 2026" at
position 8-15 (the organisers and the press hold the top) and the long tail
("gran recapte supermercats", "gran recapte mercadona", "gran recapte bizum",
"gran recapte voluntari") at position 8 or better, CTR 2-5 %. After 14 Nov
impressions fall by more than 70 % within a week, then return with "gran
recapte 2027" next autumn on the same URLs. Wrong if the page has under 500
impressions by 15 Nov or is not indexed by 9 Nov. Measure on 9, 12, 15 and
20 Nov: `snapshot.py page gran-recapte 14` (all three editions; the EN slug
contains it too) and `page la-marato 14` (the sentence must not move
La Marató's position).


## 2026-11-04 — Council-approved 2027 local holidays: 302 more towns (118 → 420), titles and descriptions held

**URLs:** `/ca/festius/<town>/` and `/es/festivos/<town>/` for 302 more towns,
plus `/en/holidays/<town>/` for the seven of them with an English page
(Sabadell, Salou, Lloret de Mar, Sitges, Castell-Platja d'Aro, Calonge i Sant
Antoni, l'Ametlla de Mar). These are static pages that ship with the deploy.
The new data also changes other pages:
- the three hubs and the comarca pages (the count and the towns);
- the 2027 date pages' local lists (17 May now reads "almenys a 83 municipis i 13 nuclis");
- Ponts 2027, because Sabadell enters its 12-town table (publish group
  `ponts-2027`);
- Setmana Santa 2027, because more local days now fall in the Easter window
  (publish group `setmana-santa-2027`).

**Why.** "calendario laboral <town> 2027" and "festius locals 2027 <town>" are
growing. Town holiday pages are about 10 % of the site's impressions. In the
14 days to 3 Nov the 799 towns with no 2027 data took 12,760 impressions on
their ES/CA pages, Tarragona 2,458 of them. Their 2027 queries sat at
position 7.3, against 6.3 for the 118 towns that already had council data.
The work went down that list, biggest first.

**Method.** Every source is official: the council's own site, or its own
folder on the AOC e-seu.
- **AOC index of plenary minutes.** The AOC publishes an open-data index of
  plenary minutes (`dadesobertes.seu-e.cat/csv/agn-ag-actes-de-ple.csv`,
  143k rows). Each acta sits in the council's own folder,
  `media.seu-e.cat/acteca/<entity>/`. The entity code is the INE code plus a
  check digit, and it was checked against the town every time.
- **Where most came from.** That index gave 266 of the 302 towns. The
  other 36 came from council pages, plenary news and certificates (a
  "web" act where the page names none).
- **Bulletins.** The BOPB keyword search, a crawl of the 2026 BOP Girona issue
  lists and the BOPT search found nothing new (only la Bisbal, already in).
  The Generalitat's 2027 local order is not out.
- **Checking.** Every source was re-fetched on 4 Nov and checked by script:
  both dates, "2027" and a local-holiday keyword in one window, the town's
  name, and the plenary date. The flagged ones, and the ones whose dates sit
  in an image, were read by hand.
- **Left out.**
  - Towns whose days exist only per nucleus, as in the 2026 order: les
    Franqueses del Vallès, Avinyonet del Penedès, Naut Aran, les Avellanes i
    Santa Linya, Gimenells i el Pla de la Font, Ribera d'Urgellet, Josa i
    Tuixén, Fígols i Alinyà, Montellà i Martinet, la Vansa i Fórnols.
  - Partial or contradictory acts: Tavertet's "1 d'abril, Dijous Sant",
    weekday mismatches in Garriguella and la Vilella Alta, three days in
    Cabrera de Mar, "de 2026" in Balsareny and Aiguaviva, a Sunday in la Vall
    de Boí, unclear session dates in Bell-lloc and Santa Bàrbara, Arbolí's
    decree-or-plenary wording, and Teia's vote with no dates published.
  - Wrong-town files in the index: les Piles, Castellserà, Pujalt,
    l'Espunyola.
  - Pages unreachable or scanned with no text: Darnius, la Palma de Cervelló,
    el Lloar.

**Titles held.** The town pages' 3 Nov retitle is still in its measurement
window. For these towns the title, the H1 and the meta description therefore
stay byte for byte what they were (`COUNCIL_2027_METADATA_HELD` in
`council-2027.ts`, `councilForMetadata` in `data.ts`; a test compares each
with the no-council form). Only the body changes:
- the line under the lead;
- the 2027 section, and the table with the two days marked pending;
- the FAQ answer;
- the Dataset (coverage 2026/2027, the council's act in `isBasedOn`).

The 118 earlier towns keep their dated titles. Emptying the set after the
window puts 2027 in the new towns' titles too.

**Easter guide wording.** A local day on a working day of Holy Week was a
test failure ("needs its own wording"). Several councils now keep Holy
Thursday (Manlleu, Vacarisses, Talamanca…) and Granera keeps Holy Wednesday.
The day table's Holy Thursday row and the key fact now say "Feiner a
Catalunya…; festa local a …, pendent del DOGC" in ca/es/en. The list item
gives the dates either way (`holyWeekLocal` in `easter-2027.ts`).

**Baseline** (Search Console, ES+CA town pages, 21 Oct–3 Nov 2026,
`dataState: all`):

| Group | Towns | Page impr. | Clicks | 2027-query impr. | 2027-query pos. |
| --- | --- | --- | --- | --- | --- |
| Added today | 302 | 5,450 | 236 | 87 | 5.3 |
| Still without data (control) | 497 | 7,310 | 222 | 246 | 7.5 |
| Council data before today | 118 | 26,012 | 457 | 929 | 6.3 |

Largest added by impressions:
- Salou 1,063 at 5.3;
- Viladecans 384;
- Gavà 338;
- Sant Feliu de Llobregat 335 ("festivos sant feliu de llobregat 2027" at
  2.0);
- Martorell 293 (2027 queries 27 impr. at 4.2);
- Lloret de Mar 288;
- Sitges 281 (13 at 4.1);
- Salt 227;
- Valls 203;
- Castell-Platja d'Aro 174.

Largest by population: Sabadell, whose CA page took 100 impressions at 7.6,
its "festes locals sabadell 2027" at 9.0.

Still without official data: Tarragona (the 19 June 2026 Ple had "Proposar…
les festes locals… per a l'any 2027" on its agenda, but no acta or dates are
published), Terrassa, Igualada, Cambrils, Santa Coloma de Gramenet (its site
answers 403), Calella, Pineda de Mar, Sant Quirze del
Vallès, Mollerussa, Esparreguera, la Seu d'Urgell, Calafell and Sant Pere de
Ribes.

**Prediction.** The titles do not change, so any CTR change comes from
position.
- The added towns' 2027 queries gain one to two positions by 30 Nov, as
  their pages now answer them in the body, the FAQ and the Dataset. The
  still-uncovered towns do not.
- The added towns' 2027-query impressions grow faster than the control
  group's as December demand builds.
- "Hoy / mañana es festivo en <town>" does not move.

**Measure on 30 Nov 2026** (`snapshot.py`, the three groups above), and
again after the DOGC order (`prepare2027` prints COUNCIL DIFFERS). From
1 Dec, once the retitle window closes, empty `COUNCIL_2027_METADATA_HELD` and
measure that change on its own.

**Outcome:** _pending_

---

## 2026-11-05 — Ranking push before the Nov–Jan peaks: work calendar, school calendar (es), ski, "is today a holiday" (body only; deploy, then groups `holidays`, `holiday-today`, `school-calendar`, `ski`, `snow-now`)

A ranking problem, not CTR: four pages with real demand sit at 12–24. No
title, description or H1 changed (the work calendar and holiday-today pages
were retitled on 3 Nov; the ski and ES school titles are not the cause, see
below). Data: GSC 22 Oct–4 Nov 2026 (`dataState: all`), query × page over the
whole property, URL Inspection on 5 Nov, Caddy access log 3–5 Nov.

Common finding: Googlebot spent 7,305 hits in ~2 days on the election and
holiday programmatic pages and 48 on all guides together. The guides are
recrawled rarely, so body changes reach the index late; last crawls: ES school
9 Oct, ski (es) 12 Oct, work calendar (es) 26 Oct, holiday-today (es) 28 Oct.
Canonicals are self, hreflang ca/es/en/x-default reciprocal on all four
(every alternate is printed twice, sitewide: harmless, logged as a follow-up).

### Work calendar `/es/guias/calendario-laboral-cataluna/` (+ ca, en; group `holidays`)

- **Baseline**: 3,251 impr., 23 clicks, pos 12.2 (ca 665 at 9.5).
- **Diagnosis**: no cannibalisation. It is the only URL of ours for the
  Catalonia-wide 2027 queries (186 impr. at 8.7: "calendario 2027 catalunya
  con festivos" 25 at 8.8, "calendario laboral 2027 catalunya" 22 at 9.7,
  "calendario 2027 con festivos catalunya" 16 at 9.8, "festivos 2027
  catalunya" 14 at 10.1); town pages own "calendario laboral <town> 2027".
  The 12.2 is dragged by Spain-wide queries ("calendario laboral" 70,
  "calendario laboral 2027" 47, "festividades" 65) and "30 de octubre es
  festivo" date questions (7.3). Content gap: "calendario 2027 … con festivos"
  asks for the year laid out by month; the page had a list of twelve dates.
- **Change**: new H2 "Calendario 2027 mes a mes: festivos y días laborables"
  (ca/en equivalents) right after the key facts: one row per month with its
  holidays (weekday, day, name; each linked to its `/festivos/dia/…-2027/`
  page) and the Monday–Friday working days left (19, 20, 21, 22, 21, 21, 22,
  22, 22, 20, 21, 21 = 252, computed from the same twelve dates; test). Note:
  Barcelona's 17 May and 24 Sep each take one more working day; in Aran 29 Mar
  is a working day and 17 Jun a holiday (from `aranSwap`).
- **Prediction**: the 2027 Catalonia queries from 8.7 to 5–7 by 1 Dec; ≥ 1 %
  CTR on them.
- **Measure 1 Dec 2026 and 8 Jan 2027**: `snapshot.py page calendario-laboral 14`,
  the cat2027 bucket above (queries matching cataluñ/catal + 2027).

### School calendar `/es/guias/calendario-escolar-cataluna/` (group `school-calendar`)

- **Baseline**: 830 impr., 0 clicks, pos 24.3 (ca 4,582 at 4.9).
- **Diagnosis**: not technically broken (indexed, self-canonical, hreflang
  reciprocal, ca/es copy at parity, linked from the ES home, town pages, date
  pages, work calendar, "es festivo hoy", 11N strike). Two causes:
  1. Google's copy is from **9 Oct** (URL Inspection, 5 Nov; only referrer
     known to Google: the ca edition), so none of the 23–30 Oct answer-first
     work is indexed. The ca page was crawled on 5 Nov.
  2. The 24.3 vs 4.9 is a query-mix artefact: 255 of the 337 named ES
     impressions are Spain-wide generic queries at 47 ("calendario escolar"
     30, "año escolar" 64, "ciclo lectivo" 46, "calendario escolar 2025" 48)
     where a Catalonia page cannot rank; the Catalonia ones are 82 at 30
     ("calendario escolar cataluña" 28, "calendario escolar 2026 cataluña"
     36, but "hoy hay cole en cataluña" 7.5). The ca 4.9 comes from Catalan
     Christmas queries with weak competition. No URL of ours competes.
- **Change**: the first-screen Christmas callout says "Vacaciones de Navidad
  2026-2027 en los colegios de Cataluña" (es only; ca's title is under the
  3 Nov test). The live title stays: Google has not seen it yet, so it cannot
  be the cause. The lever that matters is a recrawl: **owner to request
  indexing for this URL in GSC** (no API for it).
- **Prediction**: once recrawled, "calendario escolar cataluña 2026-2027"
  variants into the top 10 and "vacaciones de navidad 2026 cataluña" visible;
  the page average stays > 15 because of the generic queries.
- **Measure 28 Nov 2026** (and 23 Dec): last crawl date first, then the
  Catalonia bucket (`pq.py`-style: queries with catal/cataluñ/barcelona/cole).

### Ski resorts `/es/guias/estaciones-esqui-cataluna/` (+ ca, en; groups `ski`, `snow-now`; homepage by deploy)

- **Baseline**: es 257 impr., 5 clicks, pos 23.7; ca 81 at 9.8; en 143 at 5.6.
- **Diagnosis**: the ES page is not worse than ca/en. The head queries sit at
  55–62 in all three languages ("estaciones de esquí de cataluña" 60, "pistas
  de esqui cataluña" 60, "esquí catalunya" 59; ca "pistes esqui catalunya" 80;
  en "catalonia ski resorts" 8.8 on 6 impr.); ca and en averages come from
  anonymous long-tail rows, es simply has the visible head demand. A 3-week-old
  page, last crawled 12 Oct, not linked from the homepage before 15 Nov.
  Snow guides, Núria, the December pages link it 2–4 times each.
- **Change** (facts re-read 5 Nov on each operator's site,
  `research_notes/ski-opening-5nov.md`): Vall de Núria's ski calendar on
  PIRINEU365 now shows 2026-27 — opens Fri 4 Dec 2026 (4–8 Dec, 12–13 Dec,
  daily from 19 Dec), last day 4 Apr 2027 — in the table, lead, FAQ (new
  question per language) and the Pyrenees snow guide's FAQ. Baqueira (28 Nov),
  the other FGC calendars unchanged; Masella, Port del Comte and Tavascan
  still "sin fecha anunciada". Baqueira's 1.300 € early season pass ended on
  1 Nov: 1.400 €. `VERIFIED` 2026-11-05. Homepage strip: ski from 1 Nov
  instead of 15 Nov (`home-tools.ts`).
- **Prediction**: head queries from ~60 into the top 30 by 10 Dec as the
  season opens (demand peaks 28 Nov–8 Dec); the opening-date queries
  ("cuándo abre baqueira/la molina/vall de núria") top 10.
- **Measure 10 Dec 2026**: `snapshot.py page esqui 14` and the head bucket
  (esqu|pista|ski) per language; re-read Masella / Núria / FGC notes ~20 Nov.

### "Is today a holiday" `/es/guias/es-festivo-hoy-cataluna/` (+ ca, en; group `holiday-today`)

- **Baseline**: 1,450 impr., 4 clicks, pos 12.5.
- **Diagnosis**: the Catalonia queries rank 7.8 (309 impr.: "hoy es festivo
  en cataluña" 108 at 7.5). The average is dragged by "festividades" (52 at 75)
  and "mañana es festivo" (36 at 52). Cannibalisation: "es festivo hoy en
  cataluña" took 139 impr. on `/es/festivos/dia/1-noviembre-2026/` (9.1) vs 36
  here (7.4), around 1 Nov — right on the day, left alone; "mañana es festivo"
  is spread over this page (52), Tarragona (28), Lleida (7.2), Reus (8.6),
  Girona (5.6), Barcelona (35) and the work calendar (73). This page answered
  "mañana" only in a `<dt>` of the live box, and its FAQ answers for "¿hoy…?"
  and "¿mañana…?" just pointed at the box (also in the FAQPage JSON-LD).
- **Change**: first H2 of the body is now "¿Mañana es festivo en Cataluña?"
  (ca "Demà és festiu a Catalunya?", en "Is tomorrow a holiday in
  Catalonia?"): the rule, then the next four eves as a list, each with its
  year ("**lunes 7 de diciembre de 2026**: víspera de la Inmaculada (martes
  8 de diciembre)", … 24, 25 — San Esteban "excepto en Arán" — and 31 Dec),
  then the local-days pointer to `/es/festivos/`. FAQ: "¿Hoy es festivo…?"
  now names the next three holidays with their dates; "¿Mañana es festivo…?"
  names the next four eves. Dated with the year, so the stored copy stays
  true after each date passes (test walks every week of 2026–2027).
- **Prediction**: "mañana es festivo (en cataluña)" from 52 to ≤ 15 for this
  page by 9 Dec, with a spike on 7 Dec; "hoy es festivo en cataluña" holds 7–8.
- **Measure 9 Dec 2026** (after the 7 Dec eve) and **8 Jan 2027** (after
  24/31 Dec and 5 Jan): queries containing "mañana" for this URL vs town pages.

## 2026-11-05 — Shops at Christmas: December-first shops guide with a 947-town table, and "Obertura comercial a Nadal" on the town holiday pages (group `shops`; deploy first)

**Why.** Strike traffic ends on 12 Nov. The shops cluster is the next seasonal
demand: "tiendas abiertas domingo <town>", "botigues obertes 8 de desembre",
"supermercados abiertos 26 diciembre". Until now the guide's first screen
answered 29N and the November Sundays. The town pages listed the year's ten
opening days (most of them already past) and said nothing about Christmas.
Official data covers every town: Resolució EMT/4342/2025 lists 77 councils by
name, and its preamble sets the ten days of the other 870 (Ordre EMT/77/2025,
arts. 1 and 6). Re-read on 5 Nov, with no 2027 municipal list in the DOGC up to
núm. 9788 (research_notes/x10/obertura-comercial-nadal-2026.md).

**Change (titles, descriptions and H1s unchanged).**
- Shops guide (ca/es/en): the lead answers December first (6, 8, 13, 20, 27;
  25-26 and 1/6 Jan closed), with 29N kept in it. The date table runs from 29N
  (row kept) to 10 Jan. Every row names its sources, each with a check date.
  The November Sundays become one sentence. A paragraph on Saturday 26 Dec:
  a holiday in Catalonia (not Aran) and the Balearic Islands only, per
  BOE-A-2025-21667, and a closing day by law. The brief's "Catalonia-only"
  was wrong for 2026. New section "Botigues obertes per Nadal al teu
  municipi": block `shopsChristmas`, a filterable, server-rendered table of
  all 947 municipalities with their 29 Nov-31 Dec days. FAQ: 6 December and
  supermarkets on 26 December. Groups: `shops` (after the deploy, so the new
  block type exists).
- Town pages /ca/festius/<town>/ and /es/festivos/<town>/ (917 towns × 2):
  a section "Obertura comercial a Nadal a <town>" / "Apertura comercial en
  Navidad en <town>" after the shops section. One row per Sunday and holiday
  from 6 Dec to 6 Jan, plus the town's December local holidays and extra days:
  open, swapped by the council, local holiday that is not an opening day,
  closed by law, or 3 Jan pending. It also covers 24/31 Dec and the art. 37
  exemptions, a tourist-municipality caveat (Barcelona: ZGAT 15 May-15 Sep
  only) and the source with its check date. Deploy only. The section hides
  itself on builds after 6 Jan 2027.

**Baseline (GSC, `snapshot.py`).**

| Page / family | Window | Clicks | Impr. | CTR | Pos. |
| --- | --- | ---: | ---: | ---: | ---: |
| /es/guias/tiendas-abiertas-festivos-cataluna/ | 23 Oct-4 Nov | 279 | 6,217 | 4.5% | ~5.1 |
| same, after the 1 Nov peak | 2-4 Nov | 19 | 988 | 1.9% | 5.5-5.9 |
| /ca/guies/botigues-obertes-festius-catalunya/ | 23 Oct-4 Nov | 25 | 1,044 | 2.4% | ~4.9 |
| /es/festivos/ (family) | 30 Oct-5 Nov | 575 | 31,223 | 1.84% | |
| /ca/festius/ (family) | 30 Oct-5 Nov | 374 | 8,908 | 4.20% | |

December queries have almost no impressions yet. Only one, "26 de desembre",
shows on the CA guide. The ES guide's top queries are "hoy" and 1 Nov ones.

**Prediction.**
- Shops guide ES: 5-8 Dec (bridge weekend) takes at least 4,000 impressions at
  position ≤ 5.5, more than the 31 Oct-1 Nov peak (3,729). CTR on the
  "8 diciembre" and "domingo 6 diciembre" queries is ≥ 4%.
- Town-name shop queries ("tiendas abiertas domingo sabadell", "botigues
  obertes terrassa") reach the guide: at least 30 distinct town names in its
  queries by 15 Dec (there are about 2 today).
- Town pages: at least 50 /es/festivos/<town>/ pages get a shop query
  ("tiendas", "abiertas", "botigues", "obertes") by 15 Dec. The family's CTR
  does not fall below 1.8%.
- "supermercados abiertos 26 diciembre" and "botigues obertes 26 de
  desembre" give the ES and CA guides impressions from 20 Dec.

**Measure.** `snapshot.py page tiendas-abiertas-festivos-cataluna 14`, the same
for `botigues-obertes-festius-catalunya`, `snapshot.py families 7`, and the
GSC query filter on /es/festivos/ for tiendas|abiertas|botigues|obertes.
Measure on 20 Nov (indexing), 10 Dec (after the bridge) and 28 Dec (after
Sant Esteve).

**Follow-ups.** The DOGC 2027 municipal list (expected ~16-30 Nov 2026; check
weekly) fills 3 and 10 Jan per town and Barcelona's 2027 days. Its staleness
test (tests/shops-christmas.test.ts) fails on 1 Jan 2027. Tourist-municipality
declarations (BOP, art. 38) are not covered.

## 2026-11-05 — Reis 2027 in 21 towns (body only) and a new page: transport over Christmas, New Year and Reis 2026-27 (groups `reis-2027`, `transport-nadal`, `transport-nadal-links`; deploy first)

**Why now.** Both families peak from 20 December to 6 January. Google needs the
URLs and sections indexed and ranked before then; the strike traffic ends on
12 November.

### Reis: the existing page grows from 8 towns to 21 (no new URL, title and description untouched)

**Baseline** (Search Console, 22 Oct–4 Nov, from the brief and `snapshot.py page
… 14`): `/es/guias/cabalgata-de-reyes-barcelona/` 365 impressions at pos 5.2,
CTR 5.6–7.3 % on 3–4 Nov; its queries are mostly generic ("cuando es la
cabalgata de reyes 2027" 13 at 4.9, "cabalgata reyes magos 2027" 10 / 2 clicks
at 5.6, "cabalgata de reyes 2027" 9 at 5.2, "cavalcada de reis 2027" 9 at 4.8),
then Barcelona's ("cabalgata de reyes barcelona 2027" 8 at 5.0). CA
`/ca/guies/cavalcada-de-reis-barcelona/` 69, EN
`/en/guides/three-kings-parade-barcelona/` 6. Per-town queries ("cabalgata
reyes 2027 <town> horario recorrido"): 0 impressions so far; they spike on 2–5
January and councils publish routes in late December.

**Decision: extend, not a hub.** The ES page already ranks at ~5 for the
generic 2027 queries and its H1 already says "y Cataluña". A second
"Cabalgatas de Reyes 2027 en Cataluña" page would compete for the same head
terms and split links. So the towns go on the same URL: a table of 21 towns
(alphabetical) and one H3 section per town, each with the 2026 start time and
place, route, end, Kings' arrival, the council's page linked, 2027 "per
confirmar" and a link to where that council will publish. If a town's own
demand proves large in January, split it off then.

**Added (5 Nov, council sites only):** Terrassa, Sant Cugat, Rubí, Granollers,
Mollet, L'Hospitalet, Cornellà, Sant Boi (time only), El Prat, Castelldefels
(2027 date confirmed), Manresa, Vic, Figueres. Left out, with the reason on the
page: Santa Coloma (its site keeps no 2026 times), Viladecans (bot wall),
Vilanova i la Geltrú (only an undated page). The first eight towns and
Barcelona were re-read: nothing 2027 beyond Barcelona's participant sign-ups
(19 Oct–23 Nov), now in the Barcelona section. `REIS_AS_OF` → 5 Nov. Tests fail
from 22 Dec 2026 and again from 2 Jan 2027 until the councils are re-read.

**Prediction.** ES page holds pos ≤ 6 on the generic queries (no cannibal
page). From 20 Dec, town queries appear for at least 10 of the 21 towns, at
pos ≤ 15 by 2 Jan; page impressions 2–5 Jan ≥ 3× the 22 Oct–4 Nov fortnight.

### New page: transport over Christmas, New Year and Reis 2026-27

**URLs (new, year-free):** `/ca/guies/transport-nadal-cap-d-any-barcelona/`,
`/es/guias/transporte-navidad-nochevieja-barcelona/`,
`/en/guides/barcelona-public-transport-christmas-new-year/`.

**Titles:** "Horaris metro, bus i Rodalies per Nadal i Cap d'Any 2026" / "Horarios
metro, bus y Rodalies en Navidad y Nochevieja 2026" / "Barcelona metro and train
hours: Christmas & New Year 2026". Descriptions answer first (Christmas Eve:
metro to 23:00, Rodalies and FGC to ~23:00 in 2025; New Year's Eve: metro, FGC
and tram all night).

**Baseline.** `/es/guias/horarios-metro-barcelona/` 1.2k impressions at pos
10.5, 0 clicks; `/en/guides/barcelona-metro-hours/` 1.75k at 0.2 %;
`/es/guias/nochevieja-barcelona/` 359 ("fin de año 2026 barcelona" 11 at 5.5,
"nochevieja barcelona 2026" 11 at 7.9), `/ca/guies/cap-d-any-barcelona/` 199.
Holiday transport queries ("metro 24 diciembre barcelona", "metro nochevieja",
"rodalies nochevieja", "fgc cap d'any"): 0 so far; this property has no
December 2025 data to size them.

**What it says.** Metro and tram: each operator's standing timetable applied to
the 2026-27 days by code (26 Dec 2026 is a Saturday: metro all night).
TMB bus, NitBus, Rodalies, FGC, TRAM: last season's official notices (TMB 23 and
30 Dec 2025, 5 Jan 2026; ATM 5 Dec 2025; FGC via govern.cat 18 Dec 2025;
Rodalies 16 Dec 2025), each with its year and "per confirmar" until the
operator publishes 2026-27's (`ANNOUNCED_2026_27`). A test fails from 18 Dec
2026 until the page is re-read.

**Links in (body only; titles and descriptions untouched):** one sentence each
in the New Year's Eve guide (after the metro table) and the metro-hours guide
("Christmas and New Year" line; its EN description is in the 3 Nov window), out
with `transport-nadal-links`; one clause in the Reis page's 5–6 January
transport paragraph, out with `reis-2027`.

**Prediction.** Indexed by 20 Nov. From 18 Dec, ranking ≤ 10 for "metro
nochevieja barcelona", "horario metro 24 diciembre barcelona" and "fgc cap d'any"
variants; ≥ 2,000 impressions 20 Dec–6 Jan across the three editions at CTR ≥ 3 %.
The metro-hours and NYE pages keep their positions (the new page targets the
day-specific queries, not "horario metro barcelona").

**Measure on 20 Nov 2026** (indexing: `inspect_url_enhanced` on the three new
URLs), **28 Dec 2026** and **8 Jan 2027** (`snapshot.py page
transport-nadal 14`, `page transporte-navidad 14`, `page
barcelona-public-transport 14`, `page cabalgata-de-reyes 14`, `page
cavalcada-de-reis 14`; town queries with `gaps 14 40`).

## 2026-11-05 — New page: school free days 2026-2027 town by town, "is there school on 7 December?" (groups `lliure-disposicio`, `lliure-disposicio-links`; deploy first)

**URLs (new, year-free):** `/ca/guies/dies-lliure-disposicio-escoles/`,
`/es/guias/dias-libre-disposicion-colegios/`,
`/en/guides/catalonia-school-free-days/`. Plus a short body section
"Dies de lliure disposició escolar 2026-27" / "Días de libre disposición
escolar 2026-27" on the CA/ES holiday pages of the towns with data
(`/ca/festius/<town>/`, `/es/festivos/<town>/`), and one body sentence in the
December bridge guide linking the page.

**Why.** Strike traffic (about 60% of impressions) ends after 12 Nov; this is a
source for late November and early December. 8 Dec 2026 is a Tuesday, so most
councils put a school free day on Monday the 7th, and parents search for it.
- `/es/guias/puente-diciembre-cataluna/`: 5.6k impressions in 14 days and
  rising (22 Oct–4 Nov: 79 → 1,214 a day; CTR 1.1–2.7%, position 5–6). Its
  queries include "el 7 de diciembre es festivo en cataluña" (49 at 1.5),
  "7 y 8 de diciembre es festivo" (26), "el 7 de diciembre es festivo en
  barcelona" (14). The page could only say "it depends on the school;
  Barcelona proposes it".
- Free-day queries today: about 25 impressions in 14 days ("proposta de dies
  festius de lliure disposició pel curs 2026 2027" 7 at 5.4, "dia lliure
  disposicio escoles" 4 at 9.8). No page of ours answered them.
- Town holiday pages, 30 Oct–5 Nov (`snapshot.py families 7`): `/es/festivos/`
  31,222 impressions at 1.84% CTR (570 pages); `/ca/festius/` 8,907 at 4.20%.
  The section adds the query family "días de libre disposición 2026-2027
  <town>" / "hay cole el 7 de diciembre <town>" without touching titles,
  descriptions or H1s (still inside the 4 Nov window).

**Facts (official sources only, read 5 Nov 2026).** Rules: Ordre EDF/66/2026,
section 2.4 b-e (four days per course over three terms; the municipal school
council sets the days "que convindria que adoptessin tots els centres del
mateix municipi"; a local holiday on a non-school day may be added). Towns:
the 100 most populous were searched. 36 have a published set: Barcelona,
Lleida, Tarragona, Mataró, Girona, Vilanova i la Geltrú, el Prat, Granollers,
Mollet, Vic and 26 more. All 36 put a free day on Monday 7 December. Another 64
had published nothing on any council page. The page lists them as "not
published" with the council's link. In Sant Boi, Castelldefels and Amposta,
7 December is a local holiday anyway. Big gaps: l'Hospitalet, Terrassa,
Badalona, Sabadell, Santa Coloma, Reus, Sant Cugat, Cornellà and Manresa.
Terrassa, Santa Coloma and Sabadell block scripts, so check them in a browser.
Every row's quote was re-checked by script against the text at its URL. Some
calendars carry their dates only as coloured cells, so I read them visually:
Montcada, Cambrils, Salt, Tarragona, Granollers, Vilanova, Sant Quirze,
Lliçà d'Amunt and Parets, plus Tàrrega's JPEG. Fact pack:
`research_notes/x10/lliure-disposicio-2026-27.md`.

**Baseline** (GSC, 22 Oct–4 Nov unless stated): the bridge page above; the
town-page families above; free-day queries ~25 impressions, 1 click.

**Prediction.**
- The new ES page reaches top 5 for "hay cole el 7 de diciembre", "días de
  libre disposición 2026-2027" and "<town> días de libre disposición" by
  25 Nov, and takes 3–8k impressions between 20 Nov and 9 Dec, peaking in the
  week of 30 Nov.
- The bridge page's CTR does not fall (the link is in the body; its title is
  unchanged).
- Town pages with the section (36 towns) gain free-day and "7 de
  diciembre" queries that the towns without it do not; the families' CTR moves
  little before December.

**Measure on 26 Nov and 10 Dec 2026** (`snapshot.py page dias-libre-disposicion
14`, `page dies-lliure-disposicio 14`, `page puente-diciembre-cataluna 14`, and
the town families split by towns with/without data). Re-read the councils by
1 Dec (`FREE_DAYS_REREAD_BY`; a test fails from that day) and again before
Carnaval (4–9 Feb 2027).

## 2026-11-05 — New page: postal vote for 29N (`vot-correu`), and the mesa guides answer "me ha tocado mesa" first (`mesa`, `voting`; deploy first)

**Why.** Two election demands with a deadline inside the next fortnight.

1. *Postal vote.* Requests close on Thursday 19 November (LOREG 72.a; JEC calendar; Correos; Interior; INE). The how-to-vote guide's "Voto por correo" section showed in Google as a sitelink (`#voto-por-correo`): 637 impressions, 0 clicks, position 6.4, 23 Oct–4 Nov. The queries behind it are "cuándo son las elecciones en cataluña" and the like, so it is a sitelink, not postal-vote demand. Postal-vote queries themselves barely reach the site: "postal vote spain" 3 impressions at 8.3, "vot per correu eleccions generals 2026" 1 at 9, "votar por correo" 1 at 3. We had no page that could rank for "voto por correo 29N".
2. *Mesa.* The draw ended on 4 November and notices run to 7 November. "mesa electoral 29n <town>" now brings thousands of impressions to town election pages (Santa Coloma 234 at 2.0, L'Hospitalet 282 at 7.8, Sant Boi 158 at 3.9, Matadepera 282 at 6.3). The guides get the generic questions: "orden int/650/2026" 17 at 6.5 with no click, "donde presentar alegaciones mesa electoral" 3 at 9.7, "suplente mesa electoral cobran", "si te toca en la mesa electoral al día siguiente tienes fiesta", "sorteo mesa electoral girona/barcelona".

**Change.**
- New page on year-free URLs, ca/es/en: `/ca/guies/vot-per-correu/`, `/es/guias/voto-por-correo/`, `/en/guides/postal-vote-spain/` (`postal-vote.ts`, group `vot-correu`).
  - Answer first: the lead gives the deadline (19 Nov), where (Correos, in person with original ID, or online with a certificate or electronic DNI), when the papers arrive (9–22 Nov), the hand-in deadline (25 Nov) and "you can no longer vote in person". Then a five-step block.
  - Sections: can I still vote in person (no; the census "C" from the official mesa manual), applying in person, online (Cl@ve is listed by none of Correos, Interior or the INE), when the papers arrive and what if you are out, how to vote and hand it in, calendar, who can, abroad (ERTA closed 31 Oct; CERA by 24 Nov or 21–26 Nov at the consulate). Nine FAQs.
  - Every fact was read on 5 Nov in LOREG 72–73 (BOE API), the JEC calendar PDF, Correos, Interior's 29N page, INE cid=1700, JEC Instrucción 5/2023, RD 806/2026 and the 29N mesa manual.
  - The copy changes with the date. `POSTAL_AS_OF` picks "open" (to 19 Nov), "closed" (20–29 Nov: hand it in by 25 Nov) or "over" (from 30 Nov). Titles, descriptions, lead, first step and the deadline FAQ change with it. `tests/postal-vote.test.ts` fails from 20 Nov, and again from 30 Nov, until `POSTAL_AS_OF` is moved and the page republished.
- How-to-vote guide (body only; titles and descriptions untouched): the "Voto por correo" heading stays, so the sitelink anchor stays. The section is now one paragraph with a link to the new page. The warning callout near the top and the related rail (first item, so also the read-next box) link there too.
- The election hub, until the 29N results are in, and the town pages' "Si has de votar" line link to the new page. Both are code routes: deploy only.
- Mesa guides ca/es/en (body only; titles frozen since 3 Nov):
  - The lead, first key fact and draw FAQ now say the draw is over (31 Oct–4 Nov).
  - New key fact and FAQ on what to bring (the notification and the manual, which asks to be brought; 8:00, substitutes too, attendance slip).
  - The excuse key fact says "al·legació / alegación".
  - New FAQs: where to file the alegaciones, whether substitutes are paid, what Orden INT/650/2026 says.
  - `VERIFIED` moves to 5 Nov.

**Baseline** (GSC, 23 Oct–4 Nov 2026):
- Postal-vote queries: under 10 impressions in total, 0 clicks.
- The how-to-vote guide's postal sitelink: 637 impressions, 0 clicks.
- `/es/guias/miembro-mesa-electoral/`: 928 impressions, 38 clicks (4.1%), position ~7.7.
- `/ca/guies/membre-mesa-electoral/`: 1,772 impressions, 73 clicks (4.1%), position ~6.1.

**Prediction.**
- The postal page is indexed within three days of publishing. Between publishing and 19 Nov it takes at least 1,500 impressions and 60 clicks across ca/es/en, mostly Spanish "voto por correo 29N / elecciones generales / plazo" queries, at position 10 or better.
- After 19 Nov its demand falls to the "can I still / where do I hand it in" questions; the "closed" copy should keep CTR at or above 3%.
- Mesa guides: CTR moves from 4.1% to at least 5% at a similar position. "orden int/650/2026" gets its first clicks. The questions the new FAQs answer gain one to two positions.
- Caveat: the titles changed on 3 Nov, so the mesa effect cannot be separated from that title change. The 3 Nov entry's measure dates (15 Nov, 1 Dec) cover both.

**Measure** with `snapshot.py page voto-por-correo 7`, `page vot-per-correu 7`, `page postal-vote 7` and `page mesa-electoral 14`:
- 12 Nov (first read);
- 20 Nov (after the deadline; move `POSTAL_AS_OF` that day);
- 1 Dec (final, with the mesa title test).

**Outcome:** _pending_

## 2026-11-05 — New page: official 29N polls (CIS, CEO) for Catalonia, with a server-side LOREG 69.7 blackout (group `candidates` for the link; deploy first)

**What.** `/ca/guies/enquestes-eleccions-generals-catalunya/`,
`/es/guias/encuestas-elecciones-generales-cataluna/`,
`/en/guides/spain-general-election-polls-catalonia/`: the vote and seat
estimates for Catalonia from the two public pollsters only, each with its
LOREG art. 69.1 technical sheet (who ran and commissioned it with address,
universe, sample, margin, sampling, mode, fieldwork, the question and its
non-response) and links to the official report, questionnaire, sheet and
microdata. In on 5 Nov: CEO BOP 2a onada 2026 (REO 1169, 14 Oct), Congrés,
Catalonia total (the CEO publishes no provinces). Pending slots: CIS
pre-electoral 3584 (in fieldwork, no date; 2023's had seats per province) and
the CEO's third wave. Fact pack: research_notes/x10/enquestes-29n.md.

**Not a DB guide.** Published guides are static/ISR (revalidate 86400), so a
cached copy could carry figures into the blackout. The page is a code route
(`app/(public)/[locale]/internal-polls/`, `force-dynamic`; the guide URLs rewrite to
it as internal search does, so no route folder shadows `guies/`), and the figures pass through one gate, `pollsPageData(now)`
(src/lib/programmatic/polls/data.ts), read after `await connection()`. From 24
Nov 00:00 to 29 Nov 21:00 Madrid the gate returns no poll at all: the HTML
and RSC payload have no figure, no report link, no technical sheet; the page
keeps the law, when figures return and the official results links.
Title, description, OG, JSON-LD and the sitemap never carry figures, at any
date. `Cache-Control: private, no-cache, no-store` + `CDN-Cache-Control` and
`Cloudflare-CDN-Cache-Control: no-store` on every response (next.config.ts),
plus a Cloudflare bypass line in ops/vps/README.md section 10. A client island
reloads open tabs at 24 Nov 00:00. tests/polls-blackout.test.ts: the brief's
five timestamps plus 20:59/21:00, structural emptiness, only data.ts imports
figures.ts, headers, route config, staleness (fails 18 Nov unless re-read).
The end is 21:00, not the brief's 20:00: Canary polls close at 21:00
peninsular and the JEC bars estimates there before then (Acuerdos 458/1999,
99/2005).

**Titles** (no figures): ca "Enquestes eleccions generals 2026 a Catalunya:
CIS i CEO", es "Encuestas elecciones generales 2026 en Cataluña: CIS y CEO",
en "Spain election polls 2026 in Catalonia: CIS and CEO".

**Links in (body only; election page titles of 3 Nov untouched):** one
paragraph in the candidates guide after the onward links (group
`candidates`), one intro paragraph on the election hubs `/ca/eleccions/`,
`/es/elecciones/`, `/en/elections/` (deploy). The candidates guide stays
procedural: its neutrality test now skips exactly that one pointer block.

**Baseline.** No poll queries in the candidates guide's 14-day queries (5 Nov:
"elecciones cataluña 2026" 75 impressions at 6.5, "candidatos elecciones
cataluña" 24 at 4.1, no "encuesta"). The ES candidates guide: 5.8k
impressions, 833 clicks in 14 days at 5.2 (brief).

**Prediction.** Indexed by 14 Nov. When the CIS pre-electoral is out (before
24 Nov), top 10 for "encuesta cis cataluña", "cis escaños barcelona",
"enquesta ceo congrés" and ≥ 1,500 impressions across the three editions by
23 Nov at CTR ≥ 3 %. Near zero 24–29 Nov by design; a second, smaller peak on
29–30 Nov ("encuesta vs resultados").

**Measure on 14 Nov** (`inspect_url_enhanced` on the three URLs), **23 Nov**
and **2 Dec 2026** (`snapshot.py page encuestas-elecciones 14`, `page
enquestes-eleccions 14`, `page election-polls 14`). On 24 Nov 00:05 and 29 Nov
21:05: curl the three URLs and check no figure in the HTML and no
`cf-cache-status: HIT`.

**Outcome:** _pending_

## 2026-11-06 — Spanish election guides speak for all of Spain (groups `mesa`, `voting`; rails and town pages follow) and MiDNI is valid again

**Why.** The 29N general election is Spain-wide and national election demand is several times Catalonia's, but the ES guides were framed for Catalonia. GSC (28 days to 5 Nov) shows national queries reaching them only at the edge of page 1:

- `/es/guias/miembro-mesa-electoral/` (every rule on it is national: LOREG 26–28 and 143, Orden INT/650/2026, RD 605/1999): "cuándo se cobra por estar en una mesa electoral 2026" 75 impressions at 9.1; about ten "cuánto cobra(n) … mesa electoral (2026)" variants at 8–13; "excusas mesa electoral" at 12; "donde presentar alegaciones mesa electoral" at 9.7; "suplente mesa electoral cobran" at 59.5; "miembro de mesa" at 53. Baseline 14 d (24 Oct–6 Nov): 988 impressions, 41 clicks.
- `/es/guias/como-votar-elecciones-cataluna/`: national "dónde votar / dónde voto el 29 de noviembre" (18 at 7.5, 15 at 8.3), "dónde tengo que votar 2026" 27 at 6.9, "dónde voto dni 2026" 12 at 7.8, "horario votaciones 29 noviembre" 7 at 8.0, "horario para votar este domingo 2026" 10 at 5.9. But 3,388 of its 3,783 visible query impressions are Catalan ("cuándo son las elecciones en Cataluña", "próximas elecciones cataluña", at 6.0). Baseline 14 d: 10,172 impressions, 374 clicks; Catalan bucket 3,229 at 6.1; where/hours/29N buckets 149 at ~8.
- `/es/guias/voto-por-correo/` is national already and was published on 5 Nov (no data): untouched.

**Change.**

| Page (group) | Old title → new title | What else |
| --- | --- | --- |
| `/es/guias/miembro-mesa-electoral/` (`mesa`) | "Mesa electoral 2026: si te ha tocado, plazo de excusa y 75 €" → "Mesa electoral 29N: cuánto se cobra (75 €), excusas y plazos" | H1 "Mesa electoral en las elecciones generales del 29 de noviembre: cuánto se cobra, excusas válidas y qué pasa si no vas"; description "Elecciones generales 29N, en toda España: 75 € de dieta, 7 días desde la notificación para excusarte ante la Junta Electoral de Zona y 5 h menos el lunes."; lead opens with "las reglas son las mismas en toda España"; headings "Excusas válidas para no ir a la mesa electoral y cómo presentarlas", "Qué pasa si no te presentas a la mesa electoral"; new section "Si te ha tocado mesa en Cataluña" (31 JEZ from jez.json and LOREG art. 8, link to the town pages; the DOGC voter-leave detail moved there); the voters' four paid hours cited to RD 605/1999 art. 13 (BOE, re-read 6 Nov). |
| `/es/guias/como-votar-elecciones-cataluna/` (`voting`) | "Próximas elecciones en Cataluña: 29N, cuándo y dónde votar" → "Elecciones 29 de noviembre: dónde votar y horario \| Cataluña" | H1 "Elecciones generales del 29 de noviembre: dónde votar, horario y qué documento llevar (y próximas elecciones en Cataluña)"; description "Domingo 29 de noviembre, de 9 a 20 h, en toda España. Mira dónde votas sin DNI; vale el DNI caducado y también MiDNI. Voto por correo hasta el 19."; lead national first (LOREG 84.1 hours, 85.1 ID, re-read 6 Nov), "próximas elecciones en Cataluña" kept in the lead, the first section, the FAQ and the town pages' anchor "cómo votar en Cataluña"; ID heading names "DNI caducado, MiDNI"; new FAQ "¿Se puede votar con el DNI caducado?". |
| ES rail anchor for the mesa guide (`B2_TITLES.mesa.es`) | "Miembro de mesa electoral: qué hacer" → "Mesa electoral 29N: cuánto se cobra, excusas y plazos" | On the 947 ES town pages (deploy) and the rails of `voting`, `candidates`, `election-night`, `vot-correu`, `municipal-results` (republish to refresh). |

**MiDNI (all three editions of `voting`, body only).** The JEC lifted the MiDNI suspension in its session of 5 Nov 2026 (Acuerdo 334/2026, repeated in 342/2026: every table gets a device to check the app's temporary QR code, opened in front of the table; MiDGT stays suspended), and Interior's 29N "voto presencial" page lists MiDNI as valid. That is the JEC text the 22 Oct note waited for, so the copy says MiDNI is valid, with the agreement linked. Nothing changes on the postal-vote page (Acuerdo 94/2026 also covered MiDNI at Correos; 334/2026 does not mention it).

**Not done.** No separate pages for "cuánto cobra un miembro de mesa", "excusas válidas" or "qué pasa si no te presentas": the mesa guide answers each in a section and an FAQ and is the page Google ranks for those queries, so a new page would split it. No national "cómo votar" page: it would repeat the how-to-vote guide.

**Prediction.** Mesa ES: national pay/excuse queries from 8–13 to top 6 and the page from ~70 to 150+ impressions a day by 15 Nov. How-to-vote ES: the where/hours/29N buckets from ~8 to ≤ 6 by 15 Nov and up sharply in the last week; the Catalan bucket holds within one position (6.1 ± 1).

**Revert rule.** On 12 Nov and 15 Nov, `snapshot.py page como-votar-elecciones-cataluna 7` split by intent: if the Catalan bucket ("cuándo son / próximas elecciones … Cataluña") has lost more than two positions and the national buckets have not gained, restore the 3 Nov ES title and H1 (description and lead may stay).

**Measure** on 12 Nov, 15 Nov and 1 Dec 2026 (`snapshot.py page miembro-mesa-electoral 7`, `page como-votar-elecciones-cataluna 7`, and the intent split used above).

**Outcome:** _pending_

## 2026-11-06 — CTR sweep on durable pages: titles that promise what the snippet cannot list (deploy; groups `lliure-disposicio-links`, `parking`, `hours`, `tourist-tax`)

**Why.** The owner wants a durable base, not only event spikes. Site curve
(GSC 29 Oct–4 Nov): position 1–2 14.5 %, 3–4 6.8 %, 5–7 4.0 %, 8–10 0.6 %.
The 3 Nov sweep put the answer in some titles ("festivo el martes 8",
"vacances de Nadal 22/12-7/1"). Measured on 6 Nov, those pages lost clicks
at the same position: ES December bridge 2.3 % → 1.4 % at 5.7 (4,656 →
1,789 impressions); CA school calendar 1.1 % → 0.2 % at 5.1 (4,072 → 495).
Pages whose titles carry the whole answer sit far below the curve: EN metro
hours 0.3 %, CA parking 0.8 %. Pages whose titles ask the question do well:
11 Nov date page 11 % at 3.0. Hypothesis: a title gets clicks when it
promises the per-town or per-date detail, or "today's" answer, that a
snippet cannot hold. The concrete answer moves to (or stays in) the
description.

**How the pages were picked.** `snapshot.py ctr 14 300`, `ctr 7 150`, `pages
7 60`, and a click gap of impressions × (curve − CTR). Pages at 1–7 only.
Each page was split into before and after 4 Nov (`page … 14`).

**Excluded:**
- the 11N strike pages and city pages (another agent);
- election guides: mesa, how-to-vote, vot-correu and polls;
- `/es/festivos/2027/`;
- the EN transport passes (frozen to 16 Nov);
- pages changed 5 Nov: shops, "is today a holiday", work calendar ES;
- the town holiday template: it is working since 3 Nov (Tarragona 0.9 →
  4.1 %, Mataró 2.5 → 8.0 %, Reus 2.1 → 7.3 %);
- La Marató CA (improving, 0.5 → 1.1 %);
- Christmas BCN CA (improving).

**Skipped, with reasons:**
- Christmas BCN ES: CTR fell, 1.0 → 0.4 %, but so did position, 6.4 → 7.7,
  and the dedicated lights page (4 Nov) now takes these queries. Nothing
  true can be promised until the council gives a date.
- Easter 2027: ES is at 3.0 %, near the curve. The test keeps the holiday
  days in the title on purpose.
- Tourist tax ES: neither the "calculadora" title (before 30 Oct) nor the
  range title moved it; its queries sit at 9–11.
- EN weather by month: Google's weather box answers it.
- Calendario laboral ES, festivos Barcelona, aparcar ES, tarjetas ES,
  horarios metro ES: position 8+, so a ranking problem, not a CTR one.

Baseline is Search Console, 24 Oct–6 Nov (14 days; `snapshot.py page …
14`).

| Page (group) | Before → after | Baseline and query evidence |
| --- | --- | --- |
| `/es/guias/puente-diciembre-cataluna/` (`lliure-disposicio-links`; or `pont-desembre`, which also republishes the holiday guide) | T: "Puente de diciembre 2026 en Cataluña: festivo el martes 8" → "Puente de diciembre 2026 Cataluña: festivos y qué días pedir". D: "…El 6 cae en domingo y el lunes 7 es laborable, salvo en 43 municipios." → "Festivos de diciembre 2026 en Cataluña: martes 8 (la Purísima), 25 y 26. El lunes 7 es laborable salvo en 43 municipios: qué días pedir y si hay colegio." | 6,445 impr., 132 clicks (2.0 %), pos 5.7. After 3 Nov: 1.4 %. Queries: festivos diciembre 2026 (223, pos 5.1, 0 clicks); puente de diciembre 2026 (233, 6.3, 3.4 %); festivos de/en diciembre 2026 (116, 5.5, 0) |
| `/ca/guies/pont-desembre-catalunya/` (same) | T: "Pont de desembre 2026 a Catalunya: festiu el dimarts 8" → "Pont de desembre 2026 a Catalunya: festius i dies a demanar". D: → "Festius de desembre 2026 a Catalunya: dimarts 8 (la Immaculada), 25 i 26. Dilluns 7, feiner llevat de 43 municipis: quins dies demanar i si hi ha escola." | 666 impr., 2.6 %, pos 4.8. After 3 Nov: 1.8 %. Queries: pont de desembre 2026 (119, 6.7, 0) |
| `/ca/guies/calendari-escolar-catalunya/` (live title, deploy) | Title before Christmas: "Calendari escolar 2026-2027: vacances de Nadal 22/12-7/1" → "Calendari escolar 2026-2027: festius i lliure disposició". The live description already opens "Pròxim festiu escolar: dimarts 8 de desembre. Nadal: del 22 de desembre al 7 de gener." | 4,567 impr., 1.0 %, pos 4.9. After 3 Nov: 0.2 %. 95 % of queries hidden. Visible: vacances (escolars) nadal 2026 (pos 7.5–8.2, 0 clicks); festius escolars catalunya 2026 (8.9, 0) |
| `/es/festivos/dia/7-diciembre-2026/`, `/ca/festius/dia/7-desembre-2026/` (deploy) | "¿Es festivo el 7 de diciembre de 2026 en Cataluña?" → "… Dónde sí"; CA "… On sí ho és". The 45 places are listed on the page | ES 1,204 impr., 2.7 %, pos 5.2. Queries: donde es festivo el 7 de diciembre de 2026 (36, 6.2, 0); el 7 de diciembre de 2026 es festivo (51, 5.6, 0). CA 74 impr. at 4.1 |
| `/es/festivos/dia/8-diciembre-2026/`, `/ca/festius/dia/8-desembre-2026/` (deploy) | "¿Es festivo el 8 de diciembre de 2026 en Cataluña?" → "… Qué abre"; CA "… Què obre". The shops section lists the towns where shops may not open | ES 217 impr., 2.8 %, pos 4.3. CA 70 impr., 0 clicks, 5.8 |
| `/ca/guies/aparcar-barcelona-zona-blava-verda/` (`parking`) | "Preu zona blava i verda Barcelona: 1,15-4,25 €/h i horari" → "Zona blava i verda Barcelona 2026: horari, dissabte i preu". Description kept (3 Nov, prices and hours) | 1,743 impr., 0.8 %, pos 5.6. Queries: horari zona blava barcelona (20, 7.2, 0); preu zona verda barcelona no residents (14, 6.6, 0). The only clicks: zona blava barcelona dissabte / diumenge (1 click each from 7 and 6 impr.) |
| `/en/guides/barcelona-metro-hours/` (`hours`) | "Barcelona metro hours: closes 12am, 2am Fri, all night Sat" → "Barcelona metro hours today: last train and night buses". Description kept (3 Nov, the three closing times). The page's metroTonight block gives tonight's answer | 1,593 impr., 0.3 %, pos 6.1. Queries: is barcelona metro 24 hours (15, 7.1, 0); today metro closing time (12, 9.2, 0); nitbus barcelona (9, 8.9, 0) |
| `/en/guides/barcelona-catalonia-tourist-tax/` (`tourist-tax`) | "Barcelona tourist tax 2026: €6 to €12 per person per night" → "Barcelona city tax 2026: €6-€12 a night, with calculator" (range still computed from rates.ts). Description kept | 559 impr., 0.9 %, pos 5.4. Queries: barcelona city tax (29, 7.3, 0); city tax barcelona (26, 5.1, 1 click) |

The lead's first sentence repeats none of these titles, so leads are
unchanged. No fact changed. Every date and count in the new strings was
already on the page with its source: Ordre EMT/66/2025, EMT/208/2025,
EDF/66/2026, AREA, TMB and rates.ts.

**Expected gain**, at today's demand: about +125–250 clicks a week.

| Page | Impressions a week | CTR now → target | Clicks a week |
| --- | --- | --- | --- |
| ES bridge | ~3,200 | 1.4–2.0 % → 3–4 % | +40–70 |
| CA school | ~2,300 | 0.2–1.0 % → 2.5–4 % | +35–80 |
| CA parking | ~870 | 0.8 % → 2.5 % | +15 |
| EN metro | ~800 | 0.3 % → 2 % | +14 |
| ES 7 Dec | ~600 | 2.7 % → 4 % | +8 |
| EN city tax | ~280 | 0.9 % → 3 % | +6 |
| CA bridge, 8 Dec pages | small | — | +5 |

The 7 and 8 December pages count most in the week before those days. In
2026, the 1 November page had 9.6k impressions in its last week.

**Revert rule.** Check on day 7 after the deploy and publish. Use
`snapshot.py page <path> 7` against the 14-day baseline above. Revert a page
to its old title (and description, where changed) in either case:
- its clicks fell at equal or higher impressions;
- its position dropped more than 1.5 with no CTR gain.

Read the 7/8 December pages at equal distance from the date, against the
1 November curve, not against the baseline. Then measure again on 1 Dec.

**Outcome:** _pending_

## 8 Nov 2026 — 11N guide: title and description announce the Barcelona march

- Evidence (GSC 3–8 Nov): ES page /es/guias/huelga-general-11-noviembre/ fell from ~900 clicks/day (pos 5.7) to 219 on 6 Nov and 64 on 7 Nov (pos 7.6, impressions −70 %), as national media ramped up before the strike. Top query it still shows for: "manifestacion 11 noviembre barcelona", 3,564 impr., pos 6.6, CTR 1.6 %; the body already had the march (17.30 h, Jardinets de Gràcia, Sindicat de Llogateres) but neither title nor description said so.
- Change: seoTitle ca "Vaga general 11 novembre: serveis mínims i manifestació", es "Huelga 11 noviembre: servicios mínimos y manifestación" (en unchanged); "published" descriptions in ca/es/en now lead with the day and the Barcelona march, then the published minimum services.
- Check 12–13 Nov with `snapshot.py page /es/guias/huelga-general-11-noviembre/ 7`: CTR on the march queries and on "huelga general 11 noviembre". Revert the title if total clicks per impression fell.

## 10 Nov 2026 — Christmas family CTR check: no retitle (data below)

`snapshot.py ctr 14 100` and `pages 14 400`, 28 Oct–10 Nov. Christmas pages
below the CTR curve, and why none is retitled today:
- `/es/guias/navidad-en-barcelona/` 0.7 % at 6.8 (5,272 impr): its queries
  are all "cuándo se encienden las luces"; the lights page (4 Nov) takes them,
  and nothing true can be promised until the council gives a 2026 date (same
  reason as on 6 Nov). Retitle with the date once `ANNOUNCED_2026` has it.
- La Marató CA 0.8 % at 6.5: the title already has date, volunteering and
  donations, and the queries are about "voluntariat" and "tema" at 8–9, so this
  is a ranking problem. It was also in the 6 Nov sweep, whose day-7 check is 13 Nov.
- Fair pages (Espinelves 0.8 % at 8.2, Canyelles, Cardedeu): the title is
  already the fair's own name ("Feria del Abeto de Espinelves 2026: fechas y
  lugar") and they rank at 8–10, so again a ranking problem.
- Lottery CA 5.6 %, Christmas markets CA 4.1 %, fairs hub CA 5.1 %: on or
  near the curve.

Next look: 13 Nov (the 6 Nov sweep's day-7 check), then the lights date.

## 11 Nov 2026 — 29N election guides: snippets in the queries' own words for the last fortnight, facts re-dated, guides linked to each other (groups `voting`, `mesa`, `election-night`, `vot-correu`, `candidates`)

**Why.** 29N is the next traffic peak (searches peak 2–3 days before and on
the night). Three EN guides rank on page 1 with CTR far under the curve, and
the ES how-to-vote guide loses most of its biggest query. The 3 Nov and 6 Nov
titles (above) are inside their 28-day window: changed again knowingly, on
the owner's priority, with a day-7 revert rule below. Titles and descriptions
change together (attribution per page, not per field). Candidates titles are
untouched (ES converts at 13–16 %).

**Baseline** (`snapshot.py page <substr> 14`, 29 Oct–11 Nov 2026, 11 Nov
partial; clicks, impressions, CTR, mean position):

| Page | 14 d | Queries the snippet must match |
| --- | --- | --- |
| `/en/guides/how-to-vote-catalonia/` | 160 / 10,259 / 1.6 % / 5.7 | "2026 spain general election how to register to vote" 1,243 at 7.0 (0.1 %), "how to vote 2026 spain general election" 1,122 at 4.0 (0.4 %), "where to vote" 397 at 6.2, "2026 spain general election dates" 295 at 9.3 (0 clicks), "spain election date" 54 at 9.3 |
| `/es/guias/como-votar-elecciones-cataluna/` | 320 / 14,315 / 2.2 % / 6.2 | the top 30 queries are all Catalan "when": "cuando son las elecciones en cataluña" 889 at 6.7 (0.3 %), "proximas elecciones cataluña" 547 at 6.3, "cuando hay elecciones en cataluña" 278 at 4.2, "cuándo son las próximas elecciones en cataluña" 242 at 6.6; national "dónde votar / horario" queries are under the top 30 |
| `/ca/guies/com-votar-eleccions-catalunya/` | 36 / 1,530 / 2.4 % / 6.8 | "quan son les proximes eleccions a catalunya" 21 at 6.8, "quan son les eleccions autonomiques a catalunya" 7 at 5.6 |
| `/en/guides/polling-station-duty-spain/` | 48 / 3,970 / 1.2 % / 2.9 | Spanish AI-mode fragments ("cuanto pagan" 31 at 3.2, "cuanto te pagan", "se cobra?", "que pasa si no me presento") |
| `/es/guias/miembro-mesa-electoral/` | 53 / 1,366 / 3.9 % / 7.9 | "orden int/650/2026" 16 at 6.4, "los suplentes de mesa electoral cobran" 3 at 8.7 |
| `/ca/guies/membre-mesa-electoral/` | 139 / 3,597 / 3.9 % / 6.3 | "com saber si m'ha tocat taula electoral" 6 at 9.8, "quan es cobra" 2 at 1.5 |
| `/en/guides/spain-election-night-results/` | 94 / 4,338 / 2.2 % / 6.4 | "election results" 590 at 9.4, "2026 spain general election results" 149 at 5.9, "when do election results come out" 24 at 6.7 |
| `/es/guias/noche-electoral-resultados-escrutinio/` | 14 / 457 / 3.1 % / 6.0 | "cuando salen los resultados de las elecciones" 40 at 7.0, "a que hora salen los resultados de las elecciones" 5 at 5.4 |
| `/ca/guies/nit-electoral-resultats-escrutini/` | 2 / 155 / 1.3 % / 6.3 | "escrutini eleccions generals" 4 at 7.8 |
| `/ca/guies/vot-per-correu/` | 21 / 768 / 2.7 % / 6.4 | "fins quan es pot demanar el vot per correu" 47 at 8.2 (0 clicks), "quan es pot demanar el vot per correu" 8 at 8.4 |

**Change: titles** (old → new; descriptions in each module's META, every claim
already in the body).

| Page (group) | Old → new title |
| --- | --- |
| how-to-vote EN (`voting`) | "2026 Spain general election (29 Nov): how to vote, register" → "2026 Spain general election dates, how to vote and register" |
| how-to-vote ES (`voting`) | "Elecciones 29 de noviembre: dónde votar y horario \| Cataluña" → "¿Cuándo son las elecciones en Cataluña? Generales 29N y próximas" (description: generals 29N 9–20 h, municipal 23 May 2027 expected, no Parlament election called, "dónde votar") |
| how-to-vote CA (`voting`) | title kept ("Quan són les properes eleccions a Catalunya? 29N i on votar", already the query); description now answers it the same way as ES |
| mesa EN (`mesa`) | "Polling-station duty in Spain (mesa electoral): €75, excuses" → "Polling station duty in Spain, 29 Nov: €75, 8:00 start, time off" |
| mesa ES (`mesa`) | "Mesa electoral 29N: cuánto se cobra (75 €), excusas y plazos" → "Mesa electoral 29N: me ha tocado, cuánto se cobra y qué hacer" |
| mesa CA (`mesa`) | "Membre de mesa electoral 2026: si t'ha tocat, excusa i 75 €" → "M'ha tocat mesa electoral el 29N: quant es cobra i què fer" |
| election night EN (`election-night`) | "Spain general election results 2026: what time on 29 Nov" → "Spain general election results 2026: when they come out" |
| election night ES (`election-night`) | "Resultados elecciones 29 de noviembre: hora y escrutinio" → "Resultados elecciones 29 de noviembre: a qué hora salen" |
| election night CA (`election-night`) | "Resultats eleccions 29 de novembre: hora i escrutini" → "Resultats eleccions 29 de novembre: a quina hora surten" |
| postal vote CA, "open" phase (`vot-correu`) | "Vot per correu 29N: demana'l fins al 19 de novembre" → "Vot per correu 29N: fins quan es pot demanar i com enviar-lo" (19 Nov stays in the description); ES/EN untouched |

Mesa descriptions move from the excuse window (notices ended 7 Nov, last
excuses 14 Nov) to what the people already drawn ask: 8:00 with the notice,
€75, five hours off on Monday 30 Nov, and the 7-day excuse rule.

**Change: body facts** (each read on 11 Nov 2026 on the primary source;
quotes and URLs in the modules' header comments and source names):
- Paid time off to vote, Catalonia: the Generalitat's 29N order is still not
  in the DOGC (summary API, issues 9787–9792, 4–11 Nov). The "not yet" lines in
  `voting` (ca/es/en body + FAQ) and `mesa` (ca/es/en) are re-dated to 11 Nov.
- Interior's 29N "voto presencial" page: people whose work keeps them away
  from home should be able to vote by post "y cuenten para ello con permiso de
  hasta cuatro horas libres para poder solicitarlo". New line in `voting`
  (working-that-day item) and `vot-correu` ("who can"), ca/es/en.
- Correos' postal-vote page: whoever hands in a vote for someone else brings
  the authorisation, a photocopy of the voter's ID "y su propio documento
  oficial acreditativo". `vot-correu` hand-in item and FAQ, ca/es/en. Dates
  19 Nov / 25 Nov unchanged (Correos, Interior, INE cid=1700 re-read).
- Results site: still none announced (29neleccionesgenerales.es home and
  "voto presencial" page, 11 Nov; the JEC's last published session is 5 Nov).
  The "checked on" dates on `election-night` move to 11 Nov; the official
  site's home is added as a source with that date. No link to a results site.
- Not added, because no primary source says it: whether the voter card is
  needed to vote, Correos' extended opening hours, a results start time.

**Change: links** (rendered per language by `b2link`/`pollsPath`, so ca→ca,
es→es, en→en; the "internal links stay inside their own language" test holds):
how-to-vote → polls page (onward links); election night → polls page (polls
section) and postal vote (rail); mesa → postal vote (rail); candidates →
postal vote (rail). Candidates stays linked exactly once from how-to-vote and
election night (its test). Every election guide now reaches how-to-vote,
postal vote, mesa, election night and candidates in its own language.

**Prediction** (by 18 Nov, day 7, and 30 Nov):
- EN how-to-vote ≥ 3 % at a similar position; first clicks on "2026 spain
  general election dates".
- ES how-to-vote: "cuando son las elecciones en cataluña" from 0.3 % to ≥ 2 %
  at ±1 position, page CTR ≥ 3.5 %.
- EN mesa ≥ 2.5 % at ≤ 3.5; ES/CA mesa ≥ 4.5 % as the demand moves to the day
  itself (27–29 Nov).
- EN election night ≥ 3.5 % before 28 Nov; ES/CA rise mainly on 28–30 Nov.
- CA postal: first clicks on "fins quan es pot demanar el vot per correu"
  before 19 Nov.

**Revert rule (day 7 = 18 Nov 2026).** For each retitled page, run
`snapshot.py page <path> 7` (11–17 Nov) and compare with the 14-day baseline
above at a similar mean position (±1): if clicks per 1,000 impressions fell,
or the main target query lost more than two positions, restore that page's
old title and description from the table (git history of this commit). For
ES how-to-vote, also split by intent: if the national "dónde votar / horario
29 noviembre" bucket lost more than two positions while the Catalan "cuándo
son" bucket did not gain CTR, restore the 6 Nov title. Do not retitle any of
these pages again before 30 Nov whatever the result, except by this rule.

**Measure:** 18 Nov (day 7, revert rule), 28 Nov (pre-peak) and 2 Dec
(after polling day), with `snapshot.py page <path> 7` for each URL above.

## 11 Nov 2026 — CTR retitles: pages at 3–8 far below the curve get titles in the query's words that promise the table (deploy; groups `puente-diciembre-espana-links`, `shops`, `climate`, `marato`, `setmana-santa-2027`)

**Why.** `snapshot.py page … 14` (29 Oct–11 Nov), with each page split at
6/7 Nov from the same API. Two causes, applied page by page. Either the
snippet already gives the whole answer (dates or figures in the title *and*
the description), or the title lacks the words people search ("purísima",
"domingo", "january", "vacances de Nadal"). The 6 Nov hypothesis stands. The
answer stays in the description. The title names what a snippet cannot hold:
the day-by-day table, the date table, the monthly table, the donation and
tax answers. No title gives the answer, and none promises anything the page
lacks.

**Excluded (hard rules or mid-experiment):** the 11N and strike pages, every
election page, `aparcar-*`, metro hours, tourist tax, `lliure-disposicio` and
the Christmas lights page.

**Skipped, with reasons:**
- Castanyada ca/es: the season is over.
- `/es/guias/navidad-en-barcelona/` (+ ca, en): since 5 Nov it gets almost no
  impressions (984 a day → 0–3). Its "encendido de luces" queries moved to
  the lights page, which is off limits. Nothing to retitle.
- ES school calendar `/es/guias/calendario-escolar-cataluna/`: it sits at
  position 16–21, so this is a ranking problem. The large "vacaciones de
  navidad 2026" numbers under `calendario-escolar` belong to the Spain-wide
  pages of 6 Nov. Its live title changes anyway, because one function builds
  the CA/ES/EN live title.
- Weather CA/ES: 0–40 impressions in 14 days. Their snippets give the coming
  months on purpose (30 Oct). Unchanged.
- EN Marató title: it already says "how to donate". Only its description
  changes.

**Supersedes the 6 Nov entry for two pages.** The ES/CA December bridge and
the CA school calendar were in the 6 Nov sweep (day-7 check 13 Nov), and
neither gained. The ES bridge went from 2.1 % at 5.7 to 1.7 % at 6.1 (from
7 Nov the new Spain-wide page took 12.9k national impressions). CA school
went from 1.0 % to 1.1 % at 5.0–5.1. For these pages, this entry's check
replaces the 13 Nov one.

| Page (group) | Before → after | Baseline (29 Oct–11 Nov) and query evidence |
| --- | --- | --- |
| `/es/guias/puente-diciembre-cataluna/` (`puente-diciembre-espana-links`; or `lliure-disposicio-links` / `pont-desembre`, all three republish this page) | T: "Puente de diciembre 2026 Cataluña: festivos y qué días pedir" → "Puente de diciembre 2026 (Purísima) en Cataluña, día a día". D: "…El lunes 7 es laborable salvo en 43 municipios: qué días pedir y si hay colegio." → "Festivos de diciembre 2026 en Cataluña: martes 8 (la Purísima), 25 y 26. El lunes 7, solo en 43 municipios: tabla día a día, qué pedir, colegios y tráfico." | 266 clicks / 13,839 impr. (1.9 %), pos 5.9; 29 Oct–6 Nov 2.1 % at 5.7, 7–11 Nov 1.7 % at 6.1. Queries 7–11 Nov: puente de la purisima 2026 (277, 4.5, 0 clicks); festivos diciembre 2026 (235, 5.2, 0); puente de diciembre 2026 (776, 7.2, 1.2 %); cuando es el puente de diciembre (215, 6.9, 1.4 %) |
| `/ca/guies/pont-desembre-catalunya/` (same) | T: "Pont de desembre 2026 a Catalunya: festius i dies a demanar" → "Pont de desembre 2026 (Puríssima) a Catalunya, dia a dia". D: "…Dilluns 7, feiner llevat de 43 municipis: quins dies demanar i si hi ha escola." → "…Dilluns 7, només en 43 municipis: taula dia a dia, què demanar, escola i trànsit." | 26 / 988 (2.6 %), pos 5.2. pont de desembre 2026 (159, 7.5, 0); pont (de la) purissima 2026 (~30, 5–7, 0) |
| `/en/guides/december-long-weekend-catalonia/` (same) | T: "December 2026 public holidays in Catalonia: 8, 25 and 26 Dec" → "December 2026 holidays in Catalonia: the bridge day by day". D: → "Holidays on Tuesday 8, Friday 25 and Saturday 26 December 2026; Monday 7 only in 43 towns. Day-by-day table, days to take off, schools, shops, traffic." | ~20 impr.; follows ca/es (owner rule) |
| `/es/guias/tiendas-abiertas-festivos-cataluna/` (`shops`) | T: "Tiendas abiertas en Barcelona: domingo 29 nov y diciembre" → "Tiendas abiertas domingo y festivos Barcelona: fecha a fecha". D: "Domingo 29 de noviembre, día de elecciones: sí pueden abrir… 30 municipios cambian." → "Domingo 29 de noviembre (elecciones) y 6, 8, 13, 20 y 27 de diciembre: pueden abrir; 25 y 26, no. Tabla fecha a fecha y los 30 municipios que cambian." | 360 / 13,030 (2.8 %), pos 5.7; 29 Oct–6 Nov 4.4 % at 5.1 (1 Nov peak), 7–11 Nov 1.2 % at 6.4. tiendas abiertas hoy en barcelona 2026 (143, 7.9, 0.7 %); tiendas abiertas domingo barcelona (70, 10.8, 1.4 %); tiendas abiertas mañana en barcelona 2026 (65, 6.0, 0); este domingo abren las tiendas en barcelona 2026 (28, 5.6, 0) |
| `/ca/guies/botigues-obertes-festius-catalunya/` (same) | T: "Botigues obertes a Barcelona: diumenge 29 nov i desembre" → "Botigues obertes diumenges i festius a Barcelona, dia a dia". D: → "Diumenge 29 de novembre (eleccions) i 6, 8, 13, 20 i 27 de desembre: poden obrir; 25 i 26, no. Taula dia a dia i els 30 municipis que canvien." | 37 / 1,505 (2.5 %), pos 5.3. diumenges botigues obertes 2026 (31, 7.8, 1 click); botigues obertes avui a barcelona 2026 (24, 6.5, 0); botigues obertes diumenge (16, 6.0, 0) |
| `/en/guides/shops-open-sundays-holidays-catalonia/` (same) | T: "Are shops open on Sunday in Barcelona? 29 Nov and December" → "Are shops open on Sundays in Barcelona? Date-by-date table". D: → "Shops may open on Sunday 29 November (election day) and on 6, 8, 13, 20 and 27 December, not on 25-26. Date-by-date table and the 30 towns that differ." | 9 / 505 (1.8 %), pos 6.1; "are shops open in barcelona on sunday" at 9–11 |
| `/en/guides/barcelona-weather-by-month/` (`climate`) | T: "Barcelona weather and temperature by month (°C and °F)" → "Barcelona weather by month: temperature, January to December". D: "Coldest: January, highs of 13.6 °C… Wettest: October, 91 mm…" → "Month by month: highs, lows, rain days, sunshine and records, in °C and °F. January highs of 13.6 °C (56 °F), August 28.5 °C (83 °F). AEMET averages." | 21 / 6,246 (0.3 %), pos 7.3. barcelona weather january (763, 8.9, 0); barcelona weather august (565, 7.4, 0); barcelona weather by month (313, 8.7, 1 click); barcelona temperature by month (239, 9.2, 0) |
| `/ca/guies/calendari-escolar-catalunya/` (live title: deploy only) | Live title until 7 Jan: "Calendari escolar 2026-2027: festius i lliure disposició" → "Vacances de Nadal 2026 i calendari escolar 2026-27 Catalunya". ES "Calendario escolar 2026-27 Cataluña: Navidad 22/12-7/1" → "Vacaciones de Navidad 2026: calendario escolar de Cataluña". EN "…: Christmas 22 Dec–7 Jan" → "Christmas school holidays 2026: Catalonia school calendar". The live description is unchanged (it gives the dates) | CA 40 / 3,877 (1.0 %), pos 5.0; 29 Oct–6 Nov 1.0 % at 5.0, 7–11 Nov 1.1 % at 5.1. 95 % of queries hidden. Visible: vacances escolars nadal 2026 (17, 8.1, 0); quan comencen les vacances de nadal (13, 2.6, 0); vacances de nadal 2026 (13, 7.4, 0). ES at 16–21 |
| `/ca/guies/la-marato-tv3-3cat/` (`marato`) | T: "La Marató de TV3 2026: 13 de desembre, voluntaris i donatius" → "La Marató TV3 2026: 13 de desembre, com donar i desgravar". D: "…Voluntaris: preinscripció fins al 10 de novembre." (now past) → "Diumenge 13 de desembre a TV3, per a les malalties neurodegeneratives i neuromusculars. Qui la presenta, on veure-la, Bizum 33333 i quant desgrava donar." | 28 / 3,968 (0.7 %), pos 6.5. marató tv3 2026 (399, 8.6, 0); marato tv3 2026 (451, 8.9, 1 click); marató tv3 2026 data (384, 5.6, 1 click); la marato 2026 (376, 8.6, 0) |
| `/es/guias/la-marato-tv3-3cat/` (same) | T: "La Marató de TV3 2026: 13 de diciembre, causa y cómo donar" → "La Marató TV3 2026: 13 de diciembre, cómo donar y desgravar". D: → "Domingo 13 de diciembre en TV3, para las enfermedades neurodegenerativas y neuromusculares. Quién la presenta, dónde verla, Bizum 33333 y cuánto desgrava." | 12 / 868 (1.4 %), pos 6.8, nearly all before 7 Nov (1 impression since): mostly ranking |
| `/en/guides/la-marato-tv3-telethon/` (same) | Title kept. D: "La Marató de 3Cat 2026, Catalonia's TV3 telethon, is on Sunday 13 December… How to watch and donate." → "TV3 telethon on Sunday 13 December, for neurodegenerative and neuromuscular diseases. Who presents it, where to watch, Bizum code 33333 and the tax relief." | small |
| `/es/guias/semana-santa-2027-cataluna/` (`setmana-santa-2027`) | T: "Semana Santa 2027 en Cataluña: festivos 26 y 29 de marzo" → "Semana Santa 2027 en Cataluña día a día: festivos y colegios". D unchanged (the week, 26 and 29, the school break) | 51 / 2,955 (1.7 %), pos 5.9; 1–5 Nov 2.7 % at 5.4, 6–11 Nov 0.5 % at 6.5. semana santa 2027 catalunya (740, 5.8, 0.7 %); semana santa 2027 cataluña (219, 5.2, 0.5 %); semana santa 2027 festivos cataluña (37, 6.2, 0) |
| `/ca/guies/setmana-santa-2027-catalunya/` (same) | T: "Setmana Santa 2027 a Catalunya: festius 26 i 29 de març" → "Setmana Santa 2027 a Catalunya dia a dia: festius i escoles". D unchanged | 25 / 2,249 (1.1 %), pos 6.3. setmana santa 2027 (539, 8.3, 0); setmana santa 2027 catalunya (507, 5.5, 0.8 %); quan es setmana santa 2027 (162, 6.5, 0.6 %) |
| `/en/guides/easter-2027-catalonia/` (same) | T: "Easter 2027 in Catalonia and Barcelona: 26 and 29 March" → "Easter 2027 in Catalonia and Barcelona, day by day". D unchanged | ~30 impr. |

First paragraphs are unchanged: each lead already answers in the query's
words. No fact changed. Every date and figure in the new strings was already
on the page with its source:
- the bridge's 43 towns: Ordre EMT/66/2025 and EMT/208/2025;
- its traffic section: the SCT's 2026 operations calendar;
- the shops' 30 towns: Ordre EMT/77/2025 and Resolució EMT/4342/2025;
- weather: AEMET 0076 normals;
- school: Ordre EDF/66/2026;
- Marató: 3Cat's donation page and Ley 49/2002 art. 19;
- Easter: Ordre EMT/52/2026.

Tests that pinned the old strings now pin the new ones (`december-pages`,
`batch02`, `school-calendar`, `easter-2027`). The Easter test now requires
the two holidays in the description and "day by day" in the title.

**Expected gain**, at today's demand: about +60–120 clicks a week. Most of it
comes from the ES bridge (rising into December) and ES shops (29N and
December).

**Revert rule.** Check on day 7 after the deploy and publish (18 Nov if both
go out on 11 Nov). Use `snapshot.py page <path> 7` against the 14-day
baseline above. Revert a page to its old title (and description, where
changed) in either case:
- its clicks fell at equal or higher impressions;
- its position dropped more than 1.5 with no CTR gain.

Bridge, shops and school demand rises into December, so compare CTR at equal
position, not raw clicks. Read the ES bridge against the Spain-wide page's
share of the same queries. If the CA Marató page is reverted, do not restore
its old description, because the volunteer deadline (10 Nov) is past.

**Outcome (day-7 review, 18 Nov 2026).** GSC full days only: the last full day is 16 Nov (17 Nov partial). The deploy went out
on 11 Nov at ~20:30, so "after" = 12–16 Nov (5 days), against this entry's 14-day baseline (29 Oct–11 Nov). Because several
baselines straddle earlier snippet changes, the 6–11 Nov stretch is shown too. Figures: clicks / impressions / CTR / position,
then per day. Pulled with `snapshot.py page <path> 14|21` and a date-bounded page×query pull from the same API.

| Page | Baseline 29 Oct–11 Nov | 6–11 Nov | After 12–16 Nov | Rule | Decision |
| --- | --- | --- | --- | --- | --- |
| ES bridge `puente-diciembre-cataluna` | 288 / 15,034 / 1.9 % / 5.9 (20.6 clicks, 1,074 impr./day) | 158 / 8,527 / 1.9 % / 6.1 | 45 / 2,241 / 2.0 % / 6.3 (9.0, 448/day) | Clicks fell on 58 % fewer impressions; −0.4 | Not triggered: keep. No action today (brief: the bridge reviews on 25 Nov with the 17 Nov lead wording) |
| CA bridge `pont-desembre-catalunya` | 21 / 1,015 / 2.1 % / 5.0 (1.5, 73/day) | 7 / 365 / 1.9 % / 5.1 | 11 / 735 / 1.5 % / 6.7 (2.2, 147/day) | Page average −1.7 with lower CTR: the literal "position" condition holds. Query level it does not: "pont de desembre 2026" 7.4 → 7.5, "pont de la purissima 2026" 6.0 → 5.3 (24 → 473 impressions); the average fell because new, lower queries came in | Not acted on (25 Nov review). The 25 Nov reviewer should judge it by query, not by page average |
| EN bridge | 2 / 333 / 0.6 % / 4.1 | 0 / 32 | 0 / 53 / 3.8 | Too small | Keep |
| ES shops `tiendas-abiertas-festivos-cataluna` | 362 / 13,477 / 2.7 % / 5.8 (25.9, 963/day) | 92 / 7,603 / 1.2 % / 6.3 | 57 / 3,636 / 1.6 % / 6.3 (11.4, 727/day) | Clicks fell on 25 % fewer impressions (the 1 Nov peak is in the baseline); −0.5. Against 6–11 Nov: +0.4 points at equal position | **Keep.** The 13 Nov queue's live description needs CTR < 1.5 % at ≤ 6.5: not met (1.6 %). The 16 Nov H2 reviews on 25 Nov |
| CA shops `botigues-obertes-festius-catalunya` | 38 / 1,665 / 2.3 % / 5.3 (2.7, 119/day) | 15 / 806 / 1.9 % / 6.1 | 2 / 418 / 0.5 % / 7.1 (0.4, 84/day) | Position −1.8 with no CTR gain (the daily position went 5.6 → 6.4 → 7.6 → 7.1 → 8.7 over 12–16 Nov) | **Reverted** to the 3 Nov title and description (entry of 18 Nov below) |
| EN shops | 9 / 571 / 1.6 % / 6.2 | 4 / 317 / 1.3 % / 6.5 | 4 / 113 / 3.5 % / 6.2 | — | Keep |
| EN weather `barcelona-weather-by-month` | 23 / 6,958 / 0.3 % / 7.3 (1.6, 497/day) | — | 11 / 2,596 / 0.4 % / 8.6 (2.2, 519/day) | Clicks up at higher impressions; −1.3 (under 1.5) with a CTR gain | **Keep.** So the 13 Nov plan holds: apply `docs/patches/weather-month-h3-19nov.patch` on 19 Nov (it still applies cleanly on 18 Nov). The slide to 8.0–9.3 (10.6 on partial 17 Nov) is the ranking problem the patch targets |
| CA school calendar (live title) | 40 / 4,188 / 1.0 % / 5.0 (2.9, 299/day) | 8 / 1,129 / 0.7 % / 5.1 | 2 / 1,004 / 0.2 % / 6.6 (0.4, 201/day) | Position −1.6 with no CTR gain. A step on the first day: 4.7–5.1 on 9–11 Nov, then 6.4–7.5 on 12–16 Nov. Against 6–11 Nov, clicks also fell at higher impressions | **Reverted** in ca/es/en (one function builds all three: ES 1 / 376 at 15.9, EN 0 / 90 at 5.8, was 4 / 234 at 5.2) |
| CA Marató | 29 / 4,203 / 0.7 % / 6.5 (2.1, 300/day) | — | 2 / 534 / 0.4 % / 7.2 (0.4, 107/day) | Impressions −64 %. "… tv3 2026" queries ran 92–180 a day to 10 Nov and 19–32 a day from 11 Nov, the day before the new title could show (volunteer sign-up closed on 10 Nov). −0.7 | Not triggered: keep the 11 Nov title over the old one. But there is no gain, so the 13 Nov queued title goes out (entry of 18 Nov below) |
| ES Marató | 12 / 876 / 1.4 % / 6.8 | — | 4 / 139 / 2.9 % / 5.6 | Gain (on 4 clicks) | Keep over the old title; follows CA in the queued title (owner rule, one hypothesis) |
| ES Easter `semana-santa-2027-cataluna` | 52 / 3,423 / 1.5 % / 6.0 (3.7, 245/day) | 8 / 1,802 / 0.4 % / 6.5 | 2 / 1,191 / 0.2 % / 7.1 (0.4, 238/day) | Clicks fell at equal impressions: **triggered**. Against 6–11 Nov also lower (0.44 → 0.17 %, −0.6) | **Reverted**, together with the 13 Nov queued description revert (entry of 18 Nov below) |
| CA Easter `setmana-santa-2027-catalunya` | 25 / 2,562 / 1.0 % / 6.3 (1.8, 183/day) | 4 / 1,213 / 0.3 % / 6.5 | 3 / 1,016 / 0.3 % / 6.9 (0.6, 203/day) | Clicks fell at higher impressions: **triggered** | **Reverted** (same) |
| EN Easter | ~30 impr. | — | 0 / 18 / 4.2 | Too small | Reverted with ca/es (same hypothesis) |

## 11 Nov 2026 — After 11N: next strikes on the strip, an "upcoming" block on the 11N pages, and the Renfe guide follows the next rail strike (deploy; groups `strikes`, `strike-11n`, `strike-11n-cities`)

Why: the 11N pages took ~150,000 impressions; from 12 Nov 06:30 they speak in
the past and their readers have nowhere to go next. Facts read on 11 Nov on
the official sources (headers of `strikes.ts`, `strike-guides.ts`): SEMAF
withdrew the Renfe stoppages of Thu 12 Nov on 10 Nov and called a new strike
on Mon 23 Nov, keeping 17 Nov "en todo el sector" (semaf.org notice of 10 Nov;
Renfe's service notices: 12 Nov "conforme a la programación habitual"); no
minimum services yet for 17, 19 or 23 Nov (Ministry of Transport rail list:
newest the 6 Nov resolution for 10/12 Nov and the 11N ones; Departament
d'Empresa i Treball list: newest entry 11 Nov, meat industry) nor for the
26 Nov education strike (still "anunciada" by USTEC·STEs); for the 10 Nov
strike they came out four (Ministry, 6 Nov) and five (Generalitat, 5 Nov)
days before. `STRIKES_AS_OF` 2026-11-05 → 2026-11-11 (Metges de Catalunya
re-read too: strike still on).

What changed:

1. **Sitewide strip** (`src/lib/alerts/news-alerts.ts`, entry of 4 Nov above),
   date-driven, each line until midnight after its last day, never two lines
   to one page: from 12 Nov "Vaga de trens el dimarts 17 i el dijous 19 de
   novembre: Renfe, Adif i serveis mínims" (→ Renfe guide; until 19 Nov), then
   "Vaga de maquinistes el dilluns 23 de novembre: Renfe, Rodalies i serveis
   mínims" (→ Renfe guide; 20–23 Nov), "Vaga a l'educació a Catalunya el
   dijous 26 de novembre: hi ha escola?" (→ education guide; 12–26 Nov) and
   the 29N line, which now starts on 12 Nov instead of 13 Nov (es/en alike).
   The Renfe line ends with 10 Nov (12 Nov withdrawn).
2. **"Properes vagues i dates" / "Próximas huelgas y fechas" / "Upcoming
   strikes and dates"** under the answer of the 11N pages (ca/es/en), the 13
   city pages and the Spain page (ca/es/en): the same lines as the strip, as
   of each page's own as-of date (identical in the upcoming, day and past
   states), plus the strikes hub (Catalan hub on the 11N page, Spain calendar
   on the city and Spain pages). Titles of those pages untouched.
3. **Renfe guide titles** (`/ca/guies/vaga-renfe-rodalies-novembre/`,
   `/es/guias/huelga-renfe-rodalies-noviembre/`,
   `/en/guides/renfe-rodalies-strike-november/`): the URL has no day, so the
   guide now follows the next rail strike (`guideEntry`: 10 Nov, then 17/19,
   then 23 Nov). Old → new:
   - ca "Vaga Renfe 10 i 12 novembre 2026: Rodalies i serveis mínims" →
     "Vaga Renfe i Adif 17 i 19 novembre: Rodalies i mínims"
   - es "Huelga Renfe 10 y 12 noviembre: Rodalies y servicios mínimos" →
     "Huelga Renfe y Adif 17 y 19 noviembre: Rodalies y mínimos"
   - en "Renfe strike 10 and 12 November 2026: Rodalies and what runs" →
     "Renfe and Adif strike 17 and 19 November 2026: what runs"
   Reason: the 10 Nov strike is over and the 12th was withdrawn; the guide's
   head queries carry no day ("huelga renfe noviembre 2026" 694 impr. at 10.0,
   CTR 0.4 %; "vaga renfe" 313 at 8.9; "huelga rodalies" 148 at 8.1; "vaga
   rodalies novembre" 28 at 3.2), so they fit the next strike; "Adif" because
   the 19th is Adif's only (SCF), "Rodalies" kept for the Rodalies queries.
   From 20 Nov the default wording takes over ("Vaga Renfe 23 novembre 2026:
   Rodalies i serveis mínims").
   **Education guide: checked, no retitle.** It ranks 2–5 for its queries
   ("vaga 26 novembre" 191 impr. at 4.7, 7.3 %; ES "vaga 26 de noviembre"
   188 at 3.6, 11.7 %; "vaga educacio novembre" 96 at 6.9, 10.4 %), on the
   CTR curve; the strip and the 11N block are its change.

Baseline, `snapshot.py page <substr> 14`, 29 Oct–11 Nov (11 Nov partial;
pages live from 4 Nov):

| Page | 4–10 Nov impr. | Clicks | CTR | Position |
| --- | --- | --- | --- | --- |
| Renfe guide ca `vaga-renfe-rodalies` | 2,893 | 332 | 11.5 % | 3.4–7.9 |
| Renfe guide es `huelga-renfe-rodalies` | 13,387 | 1,123 | 8.4 % | 5.1–8.0 |
| Renfe guide en `renfe-rodalies-strike` | 1,026 | 67 | 6.5 % | 4.6–6.4 |
| Education ca `vaga-educacio-novembre` (6–11 Nov) | 2,527 | 208 | 8.2 % | 3.8–4.5 |
| Education es `huelga-educacion-noviembre` (6–11 Nov) | 2,718 | 215 | 7.9 % | 3.9–4.5 |

Prediction: on 12–18 Nov (with the 17 Nov peak) the ES Renfe guide ranks 8
or better for "huelga renfe noviembre 2026" (from 10.0) with CTR ≥ 3 %, and
gets impressions for "huelga renfe 17 noviembre" / "huelga trenes 17
noviembre" (none today: the hub has them at 6–11); the education guides keep
position 3–5 and gain impressions after 12 Nov from the strip and the 11N
pages; GA4 shows referrals from the 11N pages to the three targets. Wrong if
the Renfe guide's 12–18 Nov impressions are below its 4–10 Nov ones despite
the 17 Nov peak.

**Day-7 revert rule (18 Nov):** run `snapshot.py page vaga-renfe-rodalies 7`,
`page huelga-renfe-rodalies 7`, `page renfe-rodalies-strike 7`. For each
edition whose 12–18 Nov CTR is below half its 4–10 Nov CTR (ca 11.5 %, es
8.4 %, en 6.5 %) at a position no more than 2 places worse, revert that
edition's wording: remove its language from `RENFE.titlesFor` in
`strike-guides.ts` (the default template gives "Vaga Renfe 17 i 19 novembre:
Rodalies i serveis mínims" and so on), then publish `strikes`. The strip and
the 11N block stay (body links only); remove the block from the three
builders if the 11N pages' CTR falls more than 30 % against 12 Nov.

Confounders: the 11N pages switch to "past" the same morning (timer, 12 Nov
06:30); the 29N line on the strip moved a day earlier; the education strike
may be registered and get minimum services before 18 Nov.

## 11 Nov 2026 — ¿Dónde ha tocado el Gordo? Spain-wide Christmas lottery results hub, provinces and towns from SELAE (new; groups `gordo-navidad`, `gordo-navidad-links`)

**What.** New code-route family, three editions: `/es/donde-ha-tocado-el-gordo/`,
`/ca/on-ha-tocat-la-loteria-de-nadal/`, `/en/spanish-christmas-lottery-results/`.
Before the draw it explains when and how the draw runs, how SELAE publishes the
winners and the points of sale, how to check a décimo officially and where to
collect (tax: one line plus a link to the lottery guide). On 22 Dec it becomes
the results page, and `<provincia>/` and `<provincia>/<municipio>/` pages appear
for every place SELAE lists, rendered on first request from the committed
snapshot (`scripts/gordo-snapshot.py`, runbook `docs/GORDO_NAVIDAD_RUNBOOK.md`).
No snapshot = hubs only, nothing else in the sitemap. The lottery guide gained
one sentence linking the hub in each edition (`gordo-navidad-links`). Queries
seen on the guide (28 d to 11 Nov): "loteria de nadal 2026" 48 imp, "la grossa
de nadal 2026" 46 (pos 7.8) + variants ~40: the Catalan pages use SELAE's
Catalan name ("loteria de Nadal") and say it is not La Grossa de Cap d'Any.
**Measure** from 23 Dec with `snapshot.py page donde-ha-tocado 7` (and
`on-ha-tocat`, `christmas-lottery-results`).

## 2026-11-12 — Answer-first layout: summary under the byline, boxes after the body (first group; review 2026-11-19)

**Why.** Composition benchmark of 23 publisher pages
(`research_notes/x10/composition-benchmark-nov2026.md`): the leaders put a
bullet summary or a one-line answer straight under the H1 and keep
recirculation, "last verified" and "upcoming" boxes after the body. Ours put a
TOC, "de un vistazo", "Última verificación", "Próximas huelgas y fechas" and
"Lee también" before the first section (Sevilla 11N: first section at
2,502 px on a Pixel 7) and the Spain 2027 calendar listed its dates at
4,170 px.

**What changed (render time, no republish).**

- Switch: `src/lib/layout/answer-first.ts` (`ANSWER_FIRST_ENTRY_KEYS`,
  `ANSWER_FIRST_KEY_PREFIXES`). Order on those pages: title → byline, date,
  "Verificado" chip, "Añádenos como fuente preferida en Google" (Preferred
  Sources deeplink) → share bar → summary (the page's own keyFacts block as
  3–5 bullets, the rest in a closed `<details>`; the lead when there is no
  keyFacts block) → closed "En esta página" → photo (32vw on phones) → body →
  the moved boxes, in their original order → sources, share, feedback,
  related → "Lo más leído" (GA4, dated, `scripts/most-read.py`).
- Programmatic holiday pages (all of them, not switched): the date list is
  the first block under the title on `/es/festivos/2027/`, `/ca/festius/2027/`,
  `/en/holidays/2027/`, every community and city page under them, and every
  Catalan town page (`/ca/festius/<town>/`, `/es/festivos/<town>/`,
  `/en/holidays/<town>/`); the lead follows the list.
- Sitewide: header one row of 56 px (was 69 px; 115 px before 5f644b8);
  homepage opens with four tiles (strikes, holidays, elections, school
  calendar), the school card no longer repeated in "Útil ahora mismo", the
  desktop lead card no longer repeated in the grids.

**First group (answer-first switch).** strike-11n `/ca/guies/vaga-general-11-novembre/`
(+ es, en); the Spain-wide 11N page `/ca/guies/vaga-general-11-novembre-espanya/`
(+ es, en); the 11N city pages `/es/guias/huelga-general-11-noviembre-<city>/`
(+ ca, en editions); strikes hubs `/ca/guies/vaga-avui-catalunya/`,
`/es/guias/huelga-hoy-cataluna/`, `/en/guides/strike-barcelona-catalonia-today/`
and `/es/guias/huelgas-espana/` (+ ca, en); Renfe guide
`/ca/guies/vaga-renfe-rodalies-novembre/` (+ es, en); calendari laboral
`/ca/guies/calendari-laboral-catalunya/` (+ es, en); és festiu avui
`/ca/guies/es-festiu-avui-catalunya/` (+ es, en); ponts 2027
`/ca/guies/ponts-2027-catalunya/` (+ es, en); December bridge
`/ca/guies/pont-desembre-catalunya/` and `/es/guias/puente-diciembre-espana/`
(+ other editions).

**Measured on the dev server (Pixel 7, 412×915, y in CSS px).** Sevilla 11N:
answer (summary) 497, first section 1,253 (was: lead 621, first section 2,502).
Strikes hub ca: summary 497, first section 2,183 (was 2,837). Renfe es:
summary 534, first section 1,770 (2,522). `/ca/festius/2027/` dates 396
(4,170); `/es/festivos/2027/` 396 (4,176); Girona town page 2026 list 359
(1,245). Home ca: first utility tile 225 (660).

**Metrics to compare (7 days after vs 7 days before, per page family and
device).** GA4 (property 554310792): engagement rate and bounce rate by
device category, average engagement time per session, views per session.
Search Console: clicks, CTR and average position per page (`snapshot.py page
<path> 7`). Compare against a control family that kept the old layout (e.g.
`/ca/guies/calendari-escolar-catalunya/`, the mesa and voting guides).

**Decision rule (19 Nov).** Extend the switch to every DB article if mobile
engagement rate on the first group is not lower than before by more than
3 points and average engagement time does not fall by more than 10 %, with
GSC CTR within its normal band at the same position. Otherwise revert the
switch (empty the two arrays: a deploy, no republish).

**Confounders.** The 11N pages are past-tense since 12 Nov 06:30 and lose
demand whatever the layout; the Renfe strike (17/19 Nov) and the education
strike (26 Nov) rise in the same week; the header and homepage changes are
sitewide, so they move the control family too.

**Outcome (review run 18 Nov, data to 17 Nov):** strikes kept; the five holiday
guides taken out of the switch; not extended to other articles; the Spanish
town pages answer "hoy / mañana" before the table. See the entry "2026-11-18 —
Answer-first review" at the end of this file.

## 2026-11-12 — December bridge, Spain-wide: the 7 December yes/no title, the Catalan page hands national readers on, a strip line after 29N (deploy; groups `puente-diciembre-espana`, `puente-diciembre-espana-links`)

**Why.** GSC 30 Oct–12 Nov (`snapshot.py page …`, a query→page breakdown):

- Queries containing "7 de diciembre": 6,169 impressions, 266 clicks. 4,602 of
  them land on the Spain-wide page `/es/guias/puente-diciembre-espana/` (5.0 %
  at 6.3). Its clicks come from the "dónde / en qué comunidades" queries (at
  2.6–4.3, CTR 10–37 %). The yes/no ones sit at 6–10 with about 1 %: "el 7 de
  diciembre de 2026 es festivo" 362 at 6.5 (0.8 %), "es festivo el 7 de
  diciembre de 2026" 300 at 6.7 (1.0 %), "el 7 de diciembre es festivo" 142
  at 9.7, "7 de diciembre es festivo" 129 at 9.5 (0), "el lunes 7 de
  diciembre es festivo" 124 at 8.5 (0), "lunes 7 de diciembre es festivo" 113
  at 9.1 (0). About 2,100 impressions in 10 days, 3.5 weeks before the day.
- Queries containing "puente": 7,538 impressions; 5,907 land on the *Catalan*
  page `/es/guias/puente-diciembre-cataluna/` (1.5 % at 6.8) with national
  wording: "puente de diciembre 2026" 1,018 at 6.8, "puente de la purisima
  2026" 353 at 5.1 (0 clicks), "festivos diciembre 2026" 285 at 4.5 (0). The
  Spain page gets 1,379 of them at 8.7 (0.4 %). The Catalan page linked the
  Spain page once, in its sixth section.
- 7 days to 12 Nov: Spain page ES 495 clicks / 13,473 impr. (3.7 %, 6.8);
  Catalan page ES 146 / 8,285 (1.8 %, 6.1); `/es/festivos/dia/7-diciembre-2026/`
  78 / 1,641 (4.8 %, 4.6); `/es/festivos/dia/8-diciembre-2026/` 1 / 488
  (0.2 %, 6.3); EN Spain page 12 / 511; CA Spain page 6 / 101.

**What changed.**

1. **ES title of the Spain page** (`SPAIN_BRIDGE_META.es.seoTitle`, group
   `puente-diciembre-espana`): "Puente de diciembre 2026: lunes 7 festivo en
   9 comunidades" → "¿Es festivo el 7 de diciembre de 2026? Sí, en 9
   comunidades" (59 characters), the question the yes/no queries ask, as the
   EN edition already does ("Is 7 December 2026 a holiday in Spain? Yes, in 9
   regions"). H1, description (the ten places) and body unchanged; the H1
   still says "Puente de diciembre 2026". CA title kept (101 impressions).
   Not in any title window (the page is new since 6 Nov and was not in the
   6 or 11 Nov sweeps).
2. **Spain page body, all three editions**: one sentence in the Christmas
   section linking the Spain-wide school calendar hub ("vacaciones de Navidad
   2026": ~4,000 impressions in 14 days on the community school pages at
   6–9, CTR 0.1–0.6 %). No date in the sentence.
3. **Catalan bridge page, ca/es/en** (`decemberBridge`, group
   `puente-diciembre-espana-links`, or `pont-desembre` / `lliure-disposicio-links`):
   an "¿No vives en Cataluña?" box right after the "De dónde salen estas
   fechas" note: where Monday 7 is a holiday (the BOE's ten, same list as the
   "rest of Spain" section) and a link to the Spain page. Title and
   description untouched (11 Nov window, day 7 = 18 Nov).
4. **Date pages** (deploy only): 7, 8, 25 and 26 December 2026 (ca/es/en)
   list the Spain page among their guides ("Dónde es festivo el 7 de diciembre
   en España, comunidad por comunidad").
5. **Sitewide strip** (deploy only): a line "Puente de diciembre: dónde es
   festivo el lunes 7 de diciembre" (ca/en alike) from 30 Nov 00:00 (the end
   of election day) to the end of 8 Dec, linking the Spain page. Static pages
   carry it only after a deploy on or after 30 Nov.

**Facts.** No new fact: the ten places come from BOE-A-2025-21667 (already
in `boe-2026.ts` and `MONDAY_7_REGIONS`, read 6 Nov and 27 Oct 2026); the
school sentence names no date.

**Confounders.** The Spain page and the Catalan page are both in the
answer-first first group (12 Nov, review 19 Nov): leave the ES Spain page out
of that review's CTR comparison, or read it against this entry. The Catalan
ES page's 11 Nov retitle is still in its window: the new box is body only and
the first paragraph is unchanged. Demand rises steeply into 4–8 Dec, so
compare CTR at equal position, not clicks.

**Prediction (day 7 = 19 Nov if deployed 12 Nov, then 2 Dec).** The ES Spain
page's yes/no queries ("es festivo el 7 de diciembre…", "el 7 de diciembre
de 2026 es festivo", "lunes 7 de diciembre es festivo") reach CTR ≥ 3 % at
position ≤ 7 (from ~1 % at 6.5–9.7), while the "dónde / en qué comunidades"
queries keep CTR ≥ 10 %. The Spain page's share of "puente de diciembre
2026" impressions grows against the Catalan page's.

**Revert rule (19 Nov).** `snapshot.py page /es/guias/puente-diciembre-espana/ 7`
against the 7-day baseline above. Revert the ES title (restore the "Was:"
string in the code comment and the test) if page CTR falls at equal or better
position, or if the "dónde / en qué comunidades" queries drop below 6 % CTR.
The box, the links and the strip line stay (body and links only).

**Outcome:** _pending_

## 2026-11-12 — Christmas lights: Barcelona's 2026 date is out (26 Nov), four towns too; the 4 Nov entry's pre-registered switch (deploy; groups `llums-nadal`, `christmas-bcn`, `barcelona-december`)

**Not a new title test.** The 4 Nov lights entry planned this step: "The big
step comes the day Barcelona publishes, when the title and snippet switch to
the date", and its follow-up says to fill `ANNOUNCED_2026.lightsSwitchOn`. The
lights page and the Christmas in Barcelona hub build their titles and
descriptions from that field, so both switch together. The hub is still in its
3 Nov window (check 17 Nov). Its pending title, "data per confirmar", became
false on 9 Nov, so it cannot be kept. Read the 17 Nov check of both pages
against this entry, not against the 3 Nov baseline.

**Facts (official, read 12 Nov 2026).**
- Barcelona: the City Council press note of 9 Nov 2026,
  https://ajuntament.barcelona.cat/premsa/2026/11/09/barcelona-llums-de-nadal-arrenca-amb-lencesa-de-lenllumenat-nadalenc-el-26-de-novembre/
  - Thursday 26 November on Passeig de Gràcia, stage between Rosselló and
    Diagonal.
  - The show starts at 18:00 and the lights come on at 18:30.
  - The lights stay on until 6 January: 17:30–1:00 Sunday to Thursday, and
    until 2:00 on Fridays, Saturdays and 24, 25 and 31 Dec and 5 Jan.
  - "Prop de 140 km" of lit streets.
  - The note names nobody who switches the lights on, so that field stays
    "per confirmar".
- Towns, each from its council's own page:
  - Badalona, general switch-on Friday 20 Nov at 18:00 (note of 10 Nov 2026).
  - Igualada, Friday 27 Nov in plaça de l'Ajuntament, no start time given
    (note of 10 Nov).
  - Rubí, Friday 27 Nov, "prevista" (note of 20 Oct).
  - Terrassa, Saturday 28 Nov at 18:00, Raval de Montserrat (Christmas site
    iCal, modified 11 Nov).
- The other councils:
  - 19 others were re-read and have no 2026 date yet.
  - Santa Coloma (403) and Vilanova (no answer) could not be read. They keep
    their 4 Nov check, and the table says so (`LIGHTS_TOWNS_NOT_REREAD`).

**What changes.**
- **Lights page (ca/es/en):**
  - The title gives the date, e.g. "Encesa de llums de Nadal 2026 a
    Barcelona: 26 de novembre".
  - The description gives the day and the lights-on time with the show's
    start, then the four dated towns.
  - The lead uses the correct Catalan contraction ("al passeig").
  - The key facts give time, place, about 140 km, the 2026 hours and the
    end date. So do the FAQ, the Barcelona row and the four town rows.
- **Hub (ca/es/en):**
  - Title "Encesa de llums Barcelona 2026: dijous 26 de novembre" (es "…: 26
    de noviembre", en "…: switch-on 26 November").
  - The description and lead give the date at 18:30.
  - The FAQ answers time (18:00 show, 18:30 lights), place and the end date.
- **December hub:** the lights line gives the date and about 140 km (body
  only; its title and description do not use it). Its link now points to the
  dedicated lights page, anchor "l'encesa de llums de Nadal 2026 a Barcelona i
  Catalunya" (es/en alike). Before, it pointed to the Christmas hub, which
  shared the lights queries with the lights page. This consolidates the
  queries on the lights page.
- New `Announcement` fields: `lightsOn`, `placeAt` and `km`. They are
  validated, and tests are in `tests/christmas-lights-2026.test.ts`.

**Baseline, 5–11 Nov (GSC):**
- `/ca/guies/encesa-llums-nadal-barcelona/`: 24 clicks / 1,249 impr. (1.9 %),
  pos 6.3.
- `/es/guias/encendido-luces-navidad-barcelona/`: 17 / 1,205 (1.4 %), pos 7.0.
- `/en/guides/barcelona-christmas-lights/`: 8 / 365 (2.2 %), pos 7.0.
- Hubs: `/ca/guies/nadal-a-barcelona/` dropped to 0–40 impr./day after 5 Nov
  (its lights queries moved to the lights page). Same for
  `/es/guias/navidad-en-barcelona/`.
- Main queries, 28 days:
  - encesa llums nadal barcelona 2026: 467 at 8.5 on the hub, 136 at 8.8 on
    the lights page;
  - encesa de llums barcelona 2026: 264 at 6.8;
  - encendido luces barcelona 2026: 94 at 9.5;
  - encendido de luces barcelona 2026: 65 at 8.5.

**Prediction.** Demand peaks in the two weeks before 26 Nov.
- By 19 Nov (day 7 after deploy and publish), the three lights pages
  together reach CTR ≥ 4 % at position ≤ 6.5, up from 1.4–2.2 % at 6.3–7.0.
- By 26 Nov they gain ≥ 1,500 clicks in total. The town queries ("encesa
  llums <town> 2026") start landing for the four dated towns.

**Revert rule (19 Nov, `snapshot.py page encesa-llums 7`, `page encendido-luces 7`,
`page barcelona-christmas-lights 7`).** The facts stay whatever happens: they
are official. If CTR falls at equal or better position, test a title without
the date, keeping the date in the description. Give that a 7-day window, and
log it.

**Re-read** the 19 councils still "per confirmar", plus Santa Coloma and
Vilanova, around 18–20 Nov. In 2025 most announced between 12 and 25 Nov.
Then fill `y2026`, move `LIGHTS_TOWNS_AS_OF`, deploy and publish `llums-nadal`.

**Outcome:** _pending_

## 13 Nov 2026 — 29N results night: one switch for the official results site, postal and results lines on the strip, "is 29/30 Nov a holiday" answers (deploy; groups `election-night`, `election-results`, later `voting`, `mesa`)

**Why.** The election is a Spanish general election (Congress and Senate),
Sunday 29 Nov 2026, called by RD 806/2026 (BOE 248, 6 Oct 2026; read on
boe.es 13 Nov: campaign 13 Nov 0:00 to 27 Nov 24:00, Cortes meet 23 Dec).
Demand on the election families is past its first peak (the mesa draw: 22.5k
impressions/day on 2 Nov, 6.3k on 10 Nov) and returns for the deadlines
(postal request 19 Nov, hand-in 25 Nov) and for the night itself. The night
is when "resultados elecciones" and "resultados <town>" peak; the site may
show no figure it cannot verify, so every page needs to say, in the same
words, when the figures come out, who publishes them and where, and carry
the official link the moment Interior names it, from one place.

**Titles.** None changed. The guides are inside the 11 Nov window (day 7 =
18 Nov, no retitle before 30 Nov) and the town pages inside the 3 Nov one.
The coordinator's CTR list of 13 Nov (EN how-to-vote 1.9 % at 5.7, EN mesa
1.2 % at 3.0, EN election night 2.1 % at 6.4, ES how-to-vote anchors
#voto-por-correo / #calendario ~1,500 impressions at 6.2, 0 clicks) is all
inside the 11 Nov window, so it is left to that entry's revert rule. The
anchor impressions come from the "cuándo son las elecciones en Cataluña"
queries (GSC, 28 d), which the anchors cannot answer; nothing to fix in them.

**What changed.**
- `src/lib/programmatic/elections/results-night.ts` (new): the one switch,
  `ELECTION_NIGHT_RESULTS_URL` (null) and `ELECTION_NIGHT_RESULTS_SOURCE`
  (the official note naming it; a test requires it and an official host:
  lamoncloa.gob.es, interior.gob.es, 29neleccionesgenerales.es), and
  `resultsNightLine(locale)`: voting ends at 20:00 (LOREG 88.1; Canaries
  21:00 peninsular), Interior publishes the provisional count that night
  (LOREG 98.2), official result from the provincial boards' general count
  4–7 Dec (JEC 29N calendar PDF, read 13 Nov) and the BOE. No link while
  null; checked 13 Nov (29neleccionesgenerales.es home: no results link;
  Infoelectoral 403 to scripts). `model.ts` re-exports it; INTERIOR_CHECKED
  is 13 Nov.
- Town pages (all, ca/es/en; deploy): the slot's results line is that
  paragraph plus the election-night guide. Hubs `/ca/eleccions/`,
  `/es/elecciones/`, `/en/elections/` (deploy): the same paragraph in the
  intro until the 29N file is in.
- `election-night` (group): the "not yet" sentences, EN lead, EN FAQ and the
  note read the switch; dates move to 13 Nov; once set, the site and the note
  join the sources. Language line ("En català · En castellano · In
  English") under the lead.
- `election-results` (Congress guide; group `election-results`): the 29N
  paragraph after the lead is the shared line plus the night guide and the
  town pages; LOREG and JEC calendar as sources.
- `voting` (group; publish on 20 Nov, after the answer-first review, since
  it is that experiment's control): FAQ "¿El 29 de noviembre es festivo? ¿Y
  el lunes 30?" (Sunday; RD 806/2026 declares no holiday, Catalan 2026
  calendar has none on 29/30 Nov; up to 4 paid hours, RD 605/1999 art. 13;
  mesa full paid day + 5 h off Monday 30 Nov, LOREG 28.1; 30 Nov date page
  for Sant Andreu towns) and "¿Qué es la jornada de reflexión?" (28 Nov;
  LOREG 53; polls ban 24–28 Nov), ca/es/en. DOGC voter-leave order still not
  out: issues 9792–9794 (11–13 Nov) read on the summary API; "not yet" lines
  re-dated in `voting` and `mesa`. Language line under the lead (voting) and
  under the key facts (mesa): EN mesa ranks at 3.0 for Spanish fragments
  ("cuanto pagan", "se cobra?").
- Strip (`news-alerts.ts`, deploy): `postal-vote-request` (13–19 Nov, "Voto
  por correo: se puede pedir hasta el jueves 19 de noviembre"),
  `postal-vote-deliver` (20–25 Nov, "se entrega en Correos hasta el miércoles
  25"), both from POSTAL_29N (Correos and Interior re-read 13 Nov);
  `election-results-29n` (28–30 Nov, to the night guide), before the
  December bridge line so phones show it on 30 Nov. Lines with a future
  start reach static pages only at the next deploy on or after that start:
  deploy on/after 20 Nov and on 28 Nov.

**Baseline** (GSC 14 d to 13 Nov, partial last day; clicks / impressions /
CTR / position): `/es/elecciones/` family 2,233 / 41,395 / 5.4 % / 4.6;
`/ca/eleccions/` 1,398 / 42,238 / 3.3 % / 5.5; `/en/elections/` 13 / 498 /
2.6 % / 5.2; election night ES 16 / 534 / 3.0 % / 6.1, CA 1 / 106 / 0.9 % /
8.0, EN 92 / 4,385 / 2.1 % / 6.6; Congress results ES 11 / 254 / 4.3 % / 9.4,
CA 2 / 25, EN 0 / 81; postal vote ES 17 / 391 / 4.3 % / 6.8, CA 22 / 1,038 /
2.1 % / 6.4, EN 18 / 453 / 4.0 % / 3.9.

**Prediction.** Postal guide clicks (3 editions) from ~4/day to ≥ 15/day on
14–19 Nov (strip links from ~3,000 pages, deadline demand). Election night
and Congress results: ≥ 3× their 14-day impressions on 28–30 Nov alone, CTR
≥ 4 % ES/EN. Town families: on 29–30 Nov, "resultados/resultats <town>"
queries appear with CTR ≥ 3 % (the slot says honestly where the figures
are). EN mesa CTR ≥ 2 % at similar position after the 20 Nov publish.

**Measure:** 20 Nov (postal, `snapshot.py page voto-por-correo 7` etc.), 2 Dec
(night guides, families, `rising 3 40` on 29 Nov–1 Dec). Revert rule: none for
titles (unchanged); if the strip's postal lines coincide with a fall in
engagement on strike pages, move them after the strike lines' end.

## 2026-11-13 — Rail strike of 17 Nov across Spain: a Spain-wide page, Rodalies minimum services out, the 11N pages for the rest of Spain hand on to it (deploy; groups `strikes`, `strike-11n-cities`)

**Why.** GSC 7–13 Nov (`qsearch` over rail-strike queries): ~2,480 impressions
a week, most in Spanish and Spain-wide: "huelga renfe noviembre 2026" 347 at
pos 10.0, "huelga de trenes noviembre 2026" 100 at 8.3, "huelga renfe que
trenes afecta" 63 at 9.7, plus Cercanías by city ("huelga cercanias sevilla"
26, "malaga" 22+19, "zaragoza" 17, "huelga renfe alicante" 15). They landed on
the Renfe guide, which is about Rodalies. On 12 Nov the 17 Nov strike grew:
the Generalitat's order of that day (e-Tauler 658536) lists registered calls
at Grupo Renfe by FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and
SFF-CGT, 00:00–23:59, all staff, on top of Adif's works council, SCF (17 and
19) and SEMAF at other operators. Same shape as 11N, whose Spain-wide pages
drew ~6,400 Google sessions on 9 Nov (Murcia page alone 16,678 impressions
10–12 Nov). No query with "17 noviembre" yet (GSC lags 2 days; the all-union
call was news on 12 Nov).

**What changed.**
- New page `railStrike17n` (`strike-rail-17n.ts`): `/es/guias/huelga-trenes-17-noviembre/`,
  `/ca/guies/vaga-trens-17-novembre/`, `/en/guides/spain-rail-strike-17-november/`.
  Every fact from the Spain and Catalan entries; Cercanías table with Renfe's
  14 networks + Rodalies; the 10 Nov Ministry figures printed only while the
  17th's resolution is out, labelled "not the 17th's". In `strikes` (so the
  strike watch republishes it) and its own group `huelga-trenes-17n`.
- Rodalies minimum services for 17 Nov in `strikes.ts` (66 % peak
  06:00–09:30 and 17:00–20:30, 33 % rest) → hub, Renfe guide, strip text unchanged.
- The "upcoming strikes" list on the 11N Spain page and the 13 city pages
  (hub `strikesSpain`) now links the 17 Nov line to the Spain page
  (`SPAIN_NEXT_TARGETS` in strike-11n.ts); the Catalan 11N page and the
  sitewide strip keep the Rodalies guide. The Renfe guide gains one
  "outside Catalonia" sentence linking the Spain page while it covers 17 Nov.
- Spain hub: 17 Nov entry lists the six unions and links the new page; meat
  strike 12–13 Nov called off (UGT FICA 12 Nov). `STRIKES_AS_OF` and
  `STRIKES_SPAIN_AS_OF` → 2026-11-13 after re-reading every source.
- **Not in the answer-first switch** on purpose: the 19 Nov review compares
  the existing set; the new page stays on the classic layout.

**Prediction.** By 18 Nov (day after the strike, `snapshot.py page huelga-trenes 5`):
the three editions ≥ 3,000 impressions and ≥ 150 clicks in total, ES position
≤ 8 for "huelga trenes 17 noviembre" / "huelga renfe 17 noviembre"; the
Renfe guide keeps its Catalan queries (no cannibalisation: its ES title says
"Rodalies", this one "en España").

**Revert rule.** If by 18 Nov the Spain page has < 300 impressions while the
Renfe guide gains the Spain-wide queries, drop the 11N retarget (empty
`SPAIN_NEXT_TARGETS`) and fold the network table into the Renfe guide.

**Re-check.** Ministry rail list (transportes.gob.es) and Renfe press room on
13–16 Nov: when the resolution for 17/19 is out, put its figures in the Spain
entry (status `official`, minimum services `published`, the Ministry PDF in
`sources`) and in the Catalan entry's text, move both as-ofs, publish `strikes`.

**Outcome:** _pending_

## 13 Nov 2026 — Evergreen pages far below the CTR curve: no change, every one is inside a window (dated queue)

`snapshot.py ctr 28 300` and `page <path> 28`, 17 Oct–13 Nov (data to 11 Nov;
12 Nov partial). Each page's live `<title>` was fetched on 13 Nov: every
change logged above is live, so every window below is running. Nothing is
edited. Note that the 28-day baselines below were measured before the
11 Nov retitles, which had about one day of data.

| Page | 28 d clicks / impr. / CTR / pos | Window (entry) | Diagnosis from its queries | Proposal, earliest date |
| --- | --- | --- | --- | --- |
| `/en/guides/barcelona-weather-by-month/` | 24 / 7,880 / 0.3 % / 7.2 | 11 Nov retitle; revert check 18 Nov, window to 9 Dec | Month queries rank 7–9: "barcelona weather january" 836 at 8.8, "august" 653 at 7.2, "by month" 386 at 9.0. Where it ranks top, Google answers from the page: "average temperature in barcelona in january" 118 at 1.4, 0 clicks. Mostly a ranking problem. The page already has one H3 per month ("Barcelona in January") | 19 Nov, body only, if the 18 Nov check keeps the title: month H3s in the query's words ("Barcelona weather in January") plus a jump list of the 12 months under the lead, in ca/es/en. No new figures (AEMET 0076). Title not before 9 Dec |
| `/ca/guies/canvi-hora-catalunya/` | 21 / 7,230 / 0.3 % / 7.1 | 31 Oct; measure 28 Nov | 90 % of impressions came 17–25 Oct (event); now 20–80 a day. "canvi d'hora" 2,114 at 7.6, "quan canvien l'hora" 227 at 6.3. The title gives the whole answer ("2027: diumenge 28 de març") | 29 Nov, before the March 2027 peak: a question title that promises the table, e.g. "Quan canvien l'hora? Canvi d'hora 2027 i dates fins al 2031". 28 March 2027 goes in the description. Dates already on the page (C/2026/1660). Same for EN (`clock-change-spain`, 3,326 impr. at 0.1 %) |
| `/ca/guies/calendari-escolar-catalunya/` | 56 / 6,225 / 0.9 % / 5.0 | 11 Nov live title; 18 Nov / 9 Dec | 95 % of queries hidden. Three titles since 30 Oct, and CTR is flat (1.0 → 1.1 %). The live description gives the full answer (8 Dec, Christmas 22 Dec–7 Jan) | Test the description, not the title: a live description that promises the town-by-town free days and "demà hi ha escola?", with the dates kept in the lead. 9 Dec, or 19 Nov if the 18 Nov rule reverts the title |
| `/es/guias/tiendas-abiertas-festivos-cataluna/` | 383 / 14,215 / 2.7 % / 5.8 | 11 Nov; 18 Nov / 9 Dec | Ranking slipped, not only CTR. Queries containing "tiendas" were at 6.8 before 7 Nov (2.6 %) and 9.0 from 7 Nov (0.2 %). No other page of ours takes them. The demand is "hoy / mañana / este domingo" | On 18 Nov, if CTR < 1.5 % at ≤ 6.5: a live description naming the next opening Sunday from the existing table (the `liveEntryDescription` mechanism). Otherwise treat it as a ranking problem |
| `/es/guias/navidad-en-barcelona/` | 61 / 6,671 / 0.9 % / 6.5 | 12 Nov (lights date) | Since 5 Nov, 0–3 impressions a day: its lights queries went to the lights page, as intended | None |
| `/es/tradiciones/castanyada-cataluna/` | 161 / 7,083 / 2.3 % / 6.5 | 31 Oct | Season over | Late Sept 2027, with the 2027 events |
| `/en/guides/barcelona-metro-hours/` | 8 / 4,226 / 0.2 % / 6.8 | 6 Nov; day-7 check 13 Nov, window to 4 Dec | The 10–11 Nov jump (to ~700 a day) is generic "today metro closing time" / "tomorrow metro timings" on 11N. That is strike demand, which the strike pages own. Barcelona queries: under 40 impressions each, at 6–11 | None |
| `/ca/guies/la-marato-tv3-3cat/` | 33 / 4,535 / 0.7 % / 6.5 | 11 Nov; 18 Nov | Head queries at 8–8.6 ("marató tv3 2026" 464 at 8.5): ranking. "marató tv3 2026 data" 413 at 5.6 with 1 click: the title gives the date | On 18 Nov, if no gain, and only once 3Cat publishes the schedule and presenters: "La Marató 2026: horari, presentadors i com donar". The date stays in the description. Before 1 Dec (the peak is 10–13 Dec) |
| `/es/guias/tasa-turistica-barcelona-cataluna/` | 21 / 3,678 / 0.6 % / 7.3 | 30 Oct; measure 30 Nov | "tasa turistica barcelona" 200 at 11.0, "cuanto es la tasa…" 73 at 9.5: ranking, not CTR | No retitle. After 30 Nov, ranking work against the top 3 |
| `/ca/guies/aparcar-barcelona-zona-blava-verda/` | 21 / 2,747 / 0.8 % / 5.8 | 6 Nov; day-7 check 13 Nov, window to 4 Dec | Weekend queries convert (dissabte/diumenge 12–20 %); price and hours queries do not | None before 4 Dec. Keep the weekend in the title whatever the 13 Nov check says |
| `/es/guias/semana-santa-2027-cataluna/` + CA | 52 / 3,370 / 1.5 % / 6.0; 25 / 2,511 / 1.0 % / 6.3 | 11 Nov; 18 Nov | Position held: "santa 2027" queries ES 6.0 → 6.5, CA 6.6 → 6.6 (before/after 6 Nov). But CTR fell: ES 1.2 → 0.4 %, CA 0.9 → 0.1 %, daily 2–3.5 % → 0.3–0.8 %. No other page of ours takes the queries. The drop starts 4–6 Nov, when the 3 Nov description and first sentence ("del 21 al 28 de marzo", the whole answer) were picked up | On 18 Nov, if CTR has not recovered: take the week range out of the description and give the two holidays plus "colegios día a día". This reverts the 3 Nov description, not the 11 Nov title |
| `/en/guides/barcelona-transport-passes/` | 45 / 3,601 / 1.2 % / 7.4 | 30 Oct; measure 30 Nov | "t casual barcelona" 53 at 8.6, the rest at 8–15: ranking | No retitle |
| `/es/festivos/lleida/`, `/es/festivos/terrassa/` (template) | 10 / 2,954 / 0.3 % / 7.5; 8 / 1,915 / 0.4 % / 7.4 | 3 Nov; measure 15 Nov and 1 Dec | Every named query at 8–10 ("hoy es festivo en lleida" 49 at 8.8, "festivos lleida 2027" 49 at 8.3): ranking. No Spain 2027 city page competes (the `/es/festivos/2027/<comunidad>/<ciudad>/` pages cover other communities) | Read the 1 Dec measurement. Then, if ranking is still 8+, work the body: the next holiday and its date, the DOGC 2027 order when it is out (mid-December). Not the title |

**Outcome:** no change; queue for 18 Nov, 28–30 Nov and 1 Dec.

**18 Nov rows, done 18 Nov 2026** (numbers in the 11 Nov entry's outcome, GSC 12–16 Nov):
- EN weather: the title is kept (0.3 → 0.4 % at 7.3 → 8.6), so the 19 Nov body patch goes ahead as planned. Title not before 9 Dec.
- CA school calendar: the 18 Nov rule reverts the title (5.0 → 6.6, 0.2 %). The description test moves from 19 Nov to **25 Nov**,
  after the revert's own day-7 reading, so that two snippet changes are not read together.
- ES shops: 1.6 % at 6.3, so "CTR < 1.5 % at ≤ 6.5" is not met: no live description. Treated as ranking. The CA edition is reverted
  by the 11 Nov rule.
- La Marató CA: no gain (0.7 → 0.4 %). 3Cat had published the schedule (10 Nov news) and the presenters (2 Oct). Both were re-read
  18 Nov, so the queued title is applied in ca/es/en.
- Semana Santa ES/CA: CTR has not recovered (0.2 / 0.3 %), so the 3 Nov description is reverted. The 11 Nov title is reverted too,
  because the 11 Nov rule fired. Together this is the 31 Oct snippet, a single test (entry of 18 Nov below).


## 2026-11-13 — Two evergreen flagships: the padró (new) and Carnival 2027 (new), from the demand research (groups `padro`, `padro-links`, `carnaval`, `carnaval-links`; deploy first)

**Why.** The owner: too much of the site is strikes and calendars, and he
doesn't know what else people ask for. The research
(`research_notes/evergreen-demand-nov2026.md`) ranked the non-event demand.
These two came first among the ones the site could win now:
- **Padró / empadronament.** "empadronamiento" + "padron" ≈ 8,000 searches a
  week in Catalonia, flat all year (Trends 5 y, "festivos" anchor). The site
  had nothing. The results page is expat blogs and gestorías that contradict
  each other; none quotes the law or the council.
- **Carnival 2027.** "carnaval 2026" peaked at ≈37,000 searches in Catalonia
  in the week of 8–14 Feb 2026, and "carnaval sitges" at ≈3,700 a week in
  February. It is a date-answer query, the family this site already wins.
  The site had no page. Publishing in November gives it 10 weeks to rank
  before the late-January ramp.

**What was added.**

*Padró.* Three editions on year-free URLs:
- `/ca/guies/empadronament-padro-barcelona-catalunya/`
- `/es/guias/empadronarse-padron-barcelona-cataluna/`
- `/en/guides/padron-registration-barcelona-catalonia/`

Module `src/lib/content/batch02/padro.ts`; PADRO_AS_OF 2026-11-13, sources and
quotes in its header.
- The answer comes first: free, at your own town hall, no rental contract or
  legal residence needed, at most 3 months, and the council is silent → you
  are registered.
- Six key facts and Barcelona step by step (online with an electronic
  signature, or at an OAC).
- Tables: ID by nationality; proof of address by situation (seven rows, from
  the council's procedure sheet); renewal (2 / 5 years); four more cities
  (L'Hospitalet, Girona, Lleida, Tarragona).
- Sections: registering without a contract (2020 BOE instructions plus the
  council), children, volante vs certificado, and why to do it now (CatSalut
  TSI; EU citizens must be on the padró by 30 Dec 2026 to vote on 23 May 2027).
- Nine-question FAQ.
- Hero reused: Barcelona City Hall at night (CC BY-SA 3.0).

*Carnival 2027.* Three editions:
- `/ca/tradicions/carnaval-catalunya/`
- `/es/tradiciones/carnaval-cataluna/`
- `/en/traditions/carnival-catalonia/`

Module `src/lib/content/batch02/carnival.ts`; CARNIVAL_AS_OF 2026-11-13.
- Dates are computed from the 2027 calendar's Easter: 4–10 Feb.
- The lead answers when, "is it a holiday" (no, except in 26 towns) and
  "is there school on Monday 8" (a free day in 29 of the 36 towns we track,
  Barcelona included), plus the Sitges parades (Sun 7, Tue 9, VisitSitges).
- Tables:
  - the week day by day (Sitges, Vilanova, Barcelona);
  - local holidays in the week, from the council acts and labelled pending
    the DOGC; they switch to the order automatically;
  - school free days in the week.
- Short sections on Sitges, Vilanova, Solsona, Platja d'Aro and Barcelona,
  each from the organiser's own page. Six-question FAQ.
- `PROGRAMMES_2027` holds the slot for each organiser's 2027 programme.
- Hero reused: Sitges seafront (CC BY-SA 4.0).

**Links in** (body only; no title or description touched):
- foreign-vote guide: the "not on the padrón yet?" item links the padró page;
- Barcelona hub: a new "Living in Barcelona" group with the padró;
- Sitges day trip: one sentence with the 2027 Carnival dates, in the town section;
- calçots guide: Carnival added to its related rail.

The school free-days page mentions Carnival but is inside the 6 Nov title
window, so it got no link. Add one after that window closes.

**Go-live.** Deploy, then publish `padro` and `carnaval`, then `padro-links`
(the foreign-vote guide and the hub) and `carnaval-links` (Sitges and calçots).
IndexNow the six new URLs.

**Baseline** (GSC, 17 Oct–13 Nov):
- padró/empadronament queries: 2 impressions, 0 clicks, no page;
- carnival queries: 37 impressions ("carnaval sallent 2027" etc. on town
  holiday pages), 0 clicks, no page;
- linking pages:
  - `/es/escapadas/sitges-desde-barcelona-tren/`: 457 impressions at 17.5, 1 click;
  - `/en/day-trips/sitges-from-barcelona-by-train/`: 663 at 11.7, 6 clicks;
  - `/ca/tradicions/calcotada-valls-temporada-calcots/`: 470 at 8.8, 5 clicks;
  - the hub and the foreign-vote guide: under 30 impressions each.

**Prediction.**

*Padró:*
- Indexed by 27 Nov.
- By 15 Jan 2027 (28 days): 2,000–6,000 impressions across the three
  editions, two thirds ES; CTR 2–4 %.
- The long tail reaches position ≤ 10: "empadronarse sin contrato",
  "empadronamiento barcelona documentos", "empadronarse sin papeles",
  "padron barcelona online", "how to get padron barcelona".
- The head term "empadronamiento barcelona" stays at 10–20 behind the
  Ajuntament.
- It is wrong if the pages have under 500 impressions by 15 Jan or are not
  indexed by 4 Dec.

*Carnival:*
- Indexed by 4 Dec.
- Under 2,000 impressions until 15 Jan (no demand yet).
- From 25 Jan to 10 Feb: 10,000–40,000 impressions, CTR 3–6 %. "carnaval 2027
  cataluña", "cuando es carnaval 2027", "carnaval sitges 2027" and "es festivo
  el lunes de carnaval" at position ≤ 8.
- It is wrong if the page is under 5,000 impressions in that window.
- The Sitges and calçots pages must not lose position (the added sentence and
  link are not about their queries).

**Measure:**
- 4 Dec: indexing (`batch_url_inspection`, six URLs).
- 15 Jan 2027: `snapshot.py page empadron 28`, `page padron 28` and `page carnaval 28`.
- 27 Jan, 3 Feb, 12 Feb: `snapshot.py page carnaval 14`, `page carnival 14`,
  `page sitges 14`.

**Upkeep** (tests fail until done):
- from 25 Jan 2027, until every organiser's 2027 programme is read into
  `PROGRAMMES_2027` (republish `carnaval`);
- from 11 Feb 2027, until the page moves to 2028;
- from 13 Feb 2027 (PADRO_REREAD_BY), until the Barcelona sheet, BOE and
  CatSalut are re-read.

When the DOGC 2027 local-holiday order is parsed (expected mid-December),
republish `carnaval`: the table switches source by itself.

**Outcome:** _pending_


## 2026-11-13 — Evergreen wave 2: the TSI health card (new) and Montserrat cable car vs rack railway (body upgrade, same URL) (groups `tsi`, `tsi-links`, `montserrat`, `montserrat-links`; deploy first)

**Why.** Items 3 and 9 of `research_notes/evergreen-demand-nov2026.md`.
- **TSI.** "tarjeta sanitaria" ≈ 2,700 searches a week in Catalonia; "catsalut"
  peaks in Nov–Jan. The site had no page. The SERP is papelea,
  soynomadadigital, nimextranjeria, shbarcelona and expat blogs. They
  disagree on whether you can apply online, and some print rules no official
  page gives (a photo, a one-year expiry). CatSalut's own answer is spread
  over a dozen pages, in Catalan only. The page needs the padró first, so the
  two guides link both ways.
- **Montserrat (EN).** About 30 phrasings of "cable car or rack railway" sit
  at positions 22–37. We already have a page for this intent
  (`montserratFree`), so it is upgraded in place; no new URL.

**What was added.**

*TSI.* Three editions on year-free URLs:
- `/ca/guies/targeta-sanitaria-tsi-catalunya/`
- `/es/guias/tarjeta-sanitaria-tsi-cataluna/`
- `/en/guides/health-card-tsi-catalonia/`

Module `src/lib/content/batch02/tsi.ts`; TSI_AS_OF 2026-11-13, quotes in its
header.
- The answer comes first: the padró; apply online or at the CAP; a
  provisional receipt with the CIP by email; the card posted free.
- Two tables by situation: Social Security (5 rows) and everyone else (9 rows:
  EHIC visitors, S1, non-working legal residents at the INSS, undocumented,
  asylum, "segon nivell", conveni especial at €60/€157 a month, moving from
  another region, returning).
- Royal Decree 180/2026 (in force 13 Mar 2026): no minimum time on the padró,
  a provisional document on applying, 3 months then positive silence, no
  expiry. CatSalut's November 2025 page still says "more than three months";
  the page prints the conflict.
- Also: documents, five steps, the provisional receipt and the digital TSI, a
  timings table, a renewal / lost card / moving / changing CAP table, free
  choice of CAP (10 working days, after a year), La Meva Salut, and a
  nine-question FAQ.
- Hero reused: Barcelona from the Bunkers del Carmel (CC BY-SA 4.0).

*Montserrat.* Same URLs; **titles and descriptions unchanged**, because the
28 Oct title window runs to 28 Nov. Body only:
- A comparison table straight after the facts: cable car, rack railway, car,
  coach × from Barcelona, connection, total time, combined tickets, price.
- A "by situation" table and an "up one way, down the other" section (two
  singles cost €19).
- Accessibility (FGC: accessible; the Aeri publishes nothing, so its phone
  number), the sanctuary opening hours and the Escolania, a "by car" key
  fact, and six new FAQs.
- Re-verified 13 Nov: FGC GTFS (version 10 Nov), the Aeri calendar,
  Turistren and the shop prices. Nothing in the existing tables changed.
- The Autocars Julià coach is named, but its time and fare are not printed:
  the operator's site did not answer, and Montserrat Visita's page also
  carries stale FGC times.
- MONTSERRAT_REREAD_BY 2027-01-01: the fares and the Aeri calendar end on
  31 Dec 2026.

**Links in** (body only; no title or description touched):
- padró guide: the TSI sentence links the TSI guide, which is also added to
  its related rail;
- Barcelona hub: TSI added under "Living in Barcelona", and the EN Montserrat
  item now reads "Montserrat: cable car or rack railway";
- EN anchors to Montserrat in the query's words:
  - Beyond Montserrat: "Montserrat cable car or rack railway: which to take,
    times and fares";
  - Christmas in Barcelona: "Montserrat by cable car or rack railway".

**Go-live.**
1. Deploy, then publish `tsi` and `tsi-links` (padró and hub).
2. Publish `montserrat` and `montserrat-links` (the Beyond Montserrat feature
   and Christmas in Barcelona).
3. IndexNow the three TSI URLs and the three Montserrat URLs.

Publishing `montserrat` on or after 29 Nov keeps the 28 Oct entry's
measurement clean. Publishing now folds this upgrade into that window (the
28 Oct entry already reads per page, not per change). Main session's call.

**Baseline** (GSC, 17 Oct–13 Nov):
- TSI: no page. The whole paperwork cluster (padró, NIE, TIE, TSI) had 12
  impressions from July to November.
- `/en/day-trips/montserrat-without-a-tour-from-barcelona/`: 1,360
  impressions, 0 clicks, weighted position 34.8. The spike was 830 + 241
  impressions on 9–10 Nov at 38.5. Top queries:
  - "montserrat cable car" 36 at 33.7;
  - "montserrat cable car or rack train" 31 at 24.6;
  - "montserrat rack railway or cable car" 26 at 26.5;
  - "rack railway vs cable car montserrat" 23 at 22.6;
  - "montserrat cable car vs rack railway" 22 at 24.0.
- ES edition: 115 impressions at 29.8. CA edition: 46 at 7.1.

**Prediction.**

*TSI:*
- Indexed by 4 Dec.
- By 15 Jan 2027 (28 days): 1,500–5,000 impressions across the three
  editions, mostly ES; CTR 2–4%.
- Long tail at position ≤ 10: "cómo pedir la tarjeta sanitaria en cataluña",
  "tarjeta sanitaria sin papeles cataluña", "tsi online catsalut", "health
  card catalonia", "targeta sanitària duplicat", "canviar de CAP".
- "tarjeta sanitaria" alone stays behind CatSalut.
- Wrong if under 400 impressions by 15 Jan, or not indexed by 11 Dec.

*Montserrat:*
- 28 days after the publish date, the EN "cable car vs rack railway" queries
  move from 22–37 to 8–15.
- EN impressions rise 50–150% (more queries at page-2 positions).
- First clicks: at least 10 in 28 days.
- Wrong if the median position of the five queries above is still above 20.
- The ES and CA editions must not fall: the ES head terms stay at 15–45, CA
  holds ≤ 10.

**Measure:**
- 4 Dec: indexing (`batch_url_inspection`, three TSI URLs).
- 15 Jan 2027: `snapshot.py page tarjeta-sanitaria 28`,
  `page health-card-tsi 28` and `page targeta-sanitaria 28`.
- Publish date + 28 days: `snapshot.py page montserrat-without-a-tour 28` and
  `page montserrat-por-libre 28`.

**Upkeep** (tests fail until done):
- from 1 Jan 2027 (MONTSERRAT_REREAD_BY), until the 2027 Turistren and Aeri
  fares and the Aeri 2027 calendar are read in;
- from 13 Feb 2027 (TSI_REREAD_BY), until every source in `tsi.ts` is re-read.

**Outcome:** _pending_

## 13 Nov 2026 — Montserrat EN upgrade published inside the 28 Oct title window (decision)

The EN Montserrat page had 1,360 impressions in 28 days at position 34.8 and 0 clicks: a title test cannot read anything at page 4, so the content upgrade (comparison table, which-to-choose, FAQ) ships now instead of 29 Nov. The 28 Oct title entry is closed as inconclusive; the upgrade's own entry above carries the baseline and review dates.

## 2026-11-13 — Evergreen wave 3: snow without skiing and calçots at home (body upgrades, same URLs) (groups `neu`, `calcots`; deploy first)

**Why.** Items 6 and 8 of `research_notes/evergreen-demand-nov2026.md`.
- **Snow.** "nieve" averages about 22k searches a week in Catalonia in January.
  The site already had a page for the intent (`/es/guias/donde-ver-nieve-cataluna-sin-esquiar/`
  + ca, en), so it is upgraded in place; no new URL. The 13 Nov SERP
  (escapadarural, barcelonaurbana, escapadaambnens, guiarepsol, salir.com)
  lists the same resorts. None of them gives the R3 cuts, the 2026-27 prices,
  the chain and 3PMSF tyre rules, or the avalanche bulletin.
- **Calçots.** "calçots" gets about 5–7k searches a week in Jan–Feb. The
  page targets "calçotada valls", and the generic intent (at home, per person,
  sauce, where to buy) is not served. The SERP (hola.com, naciodigital, 3cat,
  surtdecasa, barcelo.com) disagrees on calçots per person (8.7, 10–20, 25,
  up to 50), and none prints the organiser's sauce for four.

**Titles and descriptions unchanged on both pages.** The snow page is inside
the 28 Oct window (to 28 Nov) and the calçots page inside its 26 Oct
publication measurement (24 Nov). Tests pin the snow titles and descriptions.

**What was added.**

*Snow* (module moved from `pyrenees.ts` to `src/lib/content/batch02/snow-trips.ts`;
`pyrenees.ts` re-exports `SNOW`; SNOW_AS_OF 2026-11-13, quotes in the header):
- The lead answers first: Núria and La Molina by train, the 2026-27 opening
  dates, and the R3 and chain warnings. Then key facts.
- By train:
  - TreNatura €40.20 / €30.70, as published, not valid on November weekdays;
  - Núria 2026 fares, plus the 2026-27 telefèric inclusion;
  - La Molina sightseeing gondola 2026-27, €20 / €10, with last rides and
    accessibility;
  - Bus Natura days (no dates published).
- An R3 section:
  - Barcelona–La Garriga is cut, with the R4 plus buses, at 50% of the
    January service and no end date;
  - the new La Garriga–Figaró cut, 16 Nov–14 Dec;
  - ticket validity on the buses.
- The places table now has 9 rows: Aran and Rasos de Peguera are added.
- Per-place updates: Núria parc lúdic and snowcat dates, La Molina sledging
  run, Masella (nothing published), Vallter online-only on high-season days
  and the P5/P6 car parks, Espot, Port Ainé and Boí Taüll details, and
  Baqueira's 11 Nov news (28 Nov–4 Apr).
- Chains and winter tyres:
  - RGV art. 12.5.2;
  - **3PMSF on every axle for vehicles up to 3,500 kg since 30 May 2026**
    (Orden PJC/528/2026);
  - textile socks not named in the rules;
  - motorway rule (RGC 32.2);
  - Protecció Civil's advice, 012 and the MCT, NEUCAT.
- Avalanches and weather:
  - the ICGC bulletin, daily from 1 Dec, and Lauegi for Aran;
  - the European scale, which counts a snowshoer as a light load;
  - Protecció Civil's 90% figure;
  - Meteocat's Pyrenees forecast and InfoGruixNEU.
- An eight-question FAQ: four existing questions updated, four new (Núria
  cost, La Molina gondola, chains, avalanches).
- Prices with no season label on their page are left out.

*Calçots* (`calcots.ts`, CALCOTS_VERIFIED 2026-11-13, every source re-read):
- Key fact "20 to 35 per person" (Cambra de Comerç).
- The season section gets the IGP's 27 Oct 2026 harvest note.
- "Where to buy IGP calçots": a link to the IGP growers' list. No names or
  phone numbers are copied.
- "Calçotada at home: what you need" (Cambra's list).
- The sauce for four with the Cambra's exact quantities.
- "Other ways to eat calçots": the Ajuntament's dishes and the IGP recipes.
- Three FAQs: per person, sauce, where to buy.
- The 2027 programme is still unpublished. Checked 13 Nov.

**Go-live.** Deploy (the `neu` group is new in the route). Then publish
`neu` and `calcots` (the latter also republishes the food-fairs feature, as
before), then IndexNow the six URLs.

**Baseline** (GSC, 17 Oct–13 Nov, 28 days):
- `/es/guias/donde-ver-nieve-cataluna-sin-esquiar/`: 78 impressions at 6.1,
  4 clicks ("donde hay nieve en cataluña" 6 at 7.8).
- `/ca/guies/on-veure-neu-catalunya-sense-esquiar/`: 98 at 29.1, 6 clicks
  ("rutes hivern catalunya" 32 at 61.2).
- `/en/guides/where-to-see-snow-catalonia-without-skiing/`: 37 at 7.2, 0 clicks.
- calçots:
  - `/ca/tradicions/calcotada-valls-temporada-calcots/`: 487 at 8.8, 5 clicks;
  - es: 116 at 5.5, 5 clicks;
  - en: 96 at 5.2, 1 click;
  - "temporada calçots" 4 at 61.5.

**Prediction.**
- *Snow:* by 15 Jan 2027 (28 days), 3,000–10,000 impressions across the three
  editions (the demand starts in December). The ES and EN "nieve/snow near
  Barcelona", "sin coche/by train", "cadenas" and "raquetas" long tail reaches
  position ≤ 10. "nieve cataluña" alone stays behind Meteocat and the resorts.
  Wrong if under 1,000 impressions by 15 Jan.
- *Calçots:* by 15 Feb 2027, "calçots per persona / por persona", "salsa
  calçots" and "calçotada a casa / en casa" reach position ≤ 10. The page's
  impressions rise 3–5× over January's festival-date demand alone. The
  "calçotada valls 2027" queries must not fall below position 8.

**Measure:**
- 15 Jan 2027: `snapshot.py page ver-nieve 28`, `page veure-neu 28`,
  `page where-to-see-snow 28`.
- 15 Feb 2027: `snapshot.py page calcotada 28`.

**Upkeep** (tests fail until done):
- from 23 Nov 2026 (CALCOTS_REREAD_BY 2026-11-22): rewrite the Calçofest
  section in the past tense, re-read the press room for the 2027 programme,
  move the date (next: about 8 Jan 2027, when the 2026 advance sale opened)
  and republish `calcots`;
- from 16 Dec 2026 (SNOW_REREAD_BY 2026-12-15): re-read the R3 notices (the
  Figaró cut ends on 14 Dec), the FGC fares (labelled "temporada 2026"), the
  ski-bus and Bus Natura dates and Masella, then republish `neu`.

## 2026-11-13 — Christmas fairs: 2026 editions checked on the organisers' pages, the confirmed days in two titles, Barcelona's snippet held (deploy; groups `christmas`, `barcelona-december`)

**Why.** Peak season starts in two weeks and the town pages rank 8–10 for
"fira santa llucia canyelles 2026" (483 impr., 0 clicks, ES page) and
"espinelves navidad" (332, 0). The pages gave the Generalitat calendar's
dates without saying whether the organiser had confirmed the 2026 edition.

**Data checked (13 Nov 2026, curl with a browser user agent + grep; quotes in
`christmas-fairs/organisers.ts`).** Snapshot rebuilt (calendar updated 9 Nov,
agenda 12 Nov; one change: la Pobla de Segur's place). Of the 30 towns with
the most impressions (28 days):
- confirmed on the organiser's page, same dates as the calendar: Espinelves,
  Cardedeu (http only: its https certificate is the host's), Olot (Normativa
  2026 PDF), Arbúcies, Banyoles (Sunday mornings only), Balaguer, Tivissa,
  Tàrrega, Berga, Ascó; already confirmed and re-read: Canyelles (21–22 Nov,
  calendar still 28–29), Vic, Figueres, both Vilamajors, Cubelles, Altafulla,
  les Masies, Garriguella (9–14 h), Roquetes;
- the organiser gives other dates: Ripoll 5–8 Dec (calendar 5–6); Caldes de
  Montbui opening evening Fri 4 Dec 18–20 h, then 5–8 Dec 10–20 h. The weekend
  pages pick up both corrections too (`weekend/corrections.ts`);
- not confirmed (page shows 2025 or no year): Manresa, Sant Celoni, Solsona,
  Vallirana, Sant Feliu de Guíxols, Valls, Martorell, l'Arboç, Balsareny,
  Montgat, la Pobla de Segur. Their pages keep the calendar's dates and say
  "Edició 2026 encara sense confirmar per l'organitzador" with the page read;
- Barcelona: Sagrada Família 21 Nov–23 Dec, 10–21 h, and Nadal al Port (Moll
  de la Fusta) 27 Nov–6 Jan, 11–23 h, both from the Ajuntament's Guia BCN;
  Santa Llúcia stays 27 Nov–23 Dec 10–21 h (agenda; firadesantallucia.cat and
  barcelona.cat/nadal still show 2025);
- Girona: council agenda, 27 Nov 2026–5 Jan 2027, 10.30–21 h, closed 25–26 Dec
  and 1 Jan: new town page (ca/es/en; Girona is in EN_TOWNS). Lleida,
  Tarragona, Granollers, Sitges stay pending.

**Page changes.** Every fair card: "confirmed on the official page" or "not
yet confirmed by the organiser", hours when the page gives them, the quote.
The lead adds one sentence when all of the town's fairs are confirmed or all
unconfirmed. The "open today" box skips closed days (Girona 25 Dec says it
reopens Sunday 27). Markets guide (`christmas`): Sagrada Família and Girona
rows, sections, leads and FAQs give the 2026 dates; the EN description said
"Sagrada Família fair: dates not out yet", now false, so it becomes
"Sagrada Família fair: 21 Nov–23 Dec" inside the 3 Nov window (fact fix; title
untouched). Barcelona in December (`barcelona-december`): the same sentence.

**Barcelona's title held.** With three fairs the template would retitle
`/…/barcelona/` to "Fires de Nadal a Barcelona 2026: dates i llocs", inside
the 3 Nov window (reads 17 Nov and 1 Dec). `SNIPPET_HOLDS` keeps the title and
description on Santa Llúcia until 1 Dec; a test fails from 2 Dec to remove it
(then log the retitle here).

**Title experiment: the confirmed days in the title (Canyelles, Espinelves;
`DATED_TITLE_TOWNS`).** Outside any window (template titles since 1 Nov; the
10 Nov note decided no retitle on site-curve grounds). Changed because the
queries ask for the date and the answer is now confirmed by the councils.

| Page | Old → new | Baseline (28 d to 12 Nov: clicks / impr. / CTR / pos) |
| --- | --- | --- |
| `/ca/fires-de-nadal/canyelles/` | "Fira de Santa Llúcia de Canyelles 2026: dates i lloc" → "Fira de Santa Llúcia de Canyelles 2026: 21 i 22 de novembre" | 4 / 459 / 0.9 % / 8.4 |
| `/es/mercados-navidad/canyelles/` | "Feria de Santa Llúcia de Canyelles 2026: fechas y lugar" → "Feria de Santa Llúcia de Canyelles 2026: 21–22 nov." | 34 / 1,835 / 1.9 % / 7.9 |
| `/ca/fires-de-nadal/espinelves/` | "Fira de l'Avet d'Espinelves 2026: dates i lloc" → "Fira de l'Avet d'Espinelves 2026: 28 nov. – 8 des." | 6 / 1,127 / 0.5 % / 8.8 |
| `/es/mercados-navidad/espinelves/` | "Feria del Abeto de Espinelves 2026: fechas y lugar" → "Feria del Abeto de Espinelves 2026: 28 nov. – 8 dic." | 15 / 1,852 / 0.8 % / 8.2 |

Queries (family, 28 d): fira santa llucia canyelles 2026 483 / 0 / 10.2 (ES)
and 84 / 0 / 9.8 (CA); fira canyelles 2026 107 / 1 / 9.5; espinelves navidad
332 / 0 / 9.2; fira de l'avet d'espinelves 2026 177 / 1 / 8.9 (CA); fira
espinelves 2026 139 / 0 / 10.7 (ES) and 101 / 0 / 10.6 (CA).

**Prediction.** CTR on the four pages at least doubles at equal position
(Canyelles ES ≥ 3.5 %, Espinelves ES ≥ 1.6 %), and the date queries get their
first clicks. **Review 20 Nov** (day 7 after deploy, `snapshot.py page
/es/mercados-navidad/canyelles/ 7` and the other three; Canyelles' fair is
21–22 Nov, so read it before demand ends) **and 27 Nov** (Espinelves opens 28
Nov). Revert a page to "dates i lloc" if its CTR is below baseline at the same
or better position. Body and description unchanged on these pages.

**Upkeep.** Unconfirmed fairs: a test fails when one still to come was last
read more than 10 days ago (re-read ~20 Nov; move any that publish to
`ORGANISER_FAIRS`). Snapshot: re-run Mon/Thu (`npm run christmasfairs:snapshot
-- build`).


## 2026-11-13 — Evergreen wave 3: NIE, TIE and the EU registration certificate (new) (groups `nie-tie`, `nie-tie-links`; deploy first)

**Why.** Item 7 of `research_notes/evergreen-demand-nov2026.md`: "cita nie"
≈ 3,200 searches a week in Catalonia (peak in May), "tie" ≈ 3,000 (ambiguous).
The site had no page. GSC (120 days to 13 Nov): not one NIE/TIE query, so the
URLs are new and nothing is cannibalised. The SERP is law firms, gestorías,
expat blogs and the Ministry. Read on 13 Nov:
- one sends readers to other provinces "with less demand" (RD 240/2007 art. 7.5
  says the province where you live);
- one says fingerprints within "30 working days" (RD 1155/2024 art. 209.1:
  apply within one month);
- blogs still print €10.30 for the EU certificate (now €12) or pay the TIE
  with another fee code;
- none prints the June 2025 fee order or an official office list per
  province.

**What was added.** Three editions on year-free URLs:
- `/ca/guies/nie-tie-barcelona-catalunya/`
- `/es/guias/nie-tie-barcelona-cataluna/`
- `/en/guides/nie-tie-barcelona-catalonia/`

Module `src/lib/content/batch02/nie-tie.ts`; NIE_TIE_AS_OF 2026-11-13, every
quote in its header, fact pack `research_notes/nie-tie-nov2026.md`.
- The answer comes first: NIE = number, TIE = card for non-EU nationals with
  a permit over six months, EU citizens get the registration certificate
  (with the NIE); forms EX-15 / EX-17 / EX-18; Police with cita previa; fee
  790-012 at €9.84 / €12 / €16.08.
- "Which one you need" table (8 situations, incl. EU family card EX-19,
  relatives of Spaniards EX-24, Brexit TIE).
- The law: RD 1155/2024 (in force 20 May 2025) arts. 205 and 209; RD 240/2007
  arts. 7, 8, 10.
- Six steps; how the appointment system works (Police vs Immigration Office;
  Barcelona office appointments by email to citabarcelona@correo.gob.es, exact
  subject, no attachments — from the Sub-delegation's note).
- Fee table from Orden PJC/617/2025, matching the Police fee table on 13 Nov.
- Office table for the four provinces (Delegación del Gobierno + Police
  locator), with the Tortosa address conflict printed.
- Timings table, six common mistakes, padró/TSI section, "when to ask the
  office" callout, 9 FAQs.
- Not printed (no official source we could read): waiting times, TIE delivery
  time, photo sizes, services per Barcelona police office, the automatic
  fingerprint appointment pilot. inclusion.gob.es and interior.gob.es return
  403 (not bypassed); sede.policia.gob.es times out from the VPS and was read
  through WebFetch.
- Hero reused: Passeig de Gràcia (CC BY-SA 4.0).

**Links in** (body only): padró guide (TSI paragraph + related rail), TSI
guide (documents paragraph + related rail), Barcelona hub ("Living in
Barcelona"). The new page links both back.

**Go-live.**
1. Deploy, then publish `nie-tie` and `nie-tie-links` (padró, TSI, hub).
2. IndexNow the three URLs.

**Baseline:** no page; 0 NIE/TIE impressions in GSC (120 days to 13 Nov).

**Prediction.**
- Indexed by 4 Dec.
- By 15 Jan 2027: 1,000–4,000 impressions across the three editions; CTR
  2–4%; long tail at ≤ 10 ("tasa 790 012 nie importe", "certificado de
  registro ciudadano ue barcelona", "nie tie diferencia", "oficina extranjería
  tarragona", "tie fingerprints barcelona").
- "cita nie barcelona" itself stays behind the Ministry and the law firms.
- Wrong if under 300 impressions by 15 Jan, or not indexed by 11 Dec.

**Measure:**
- 4 Dec: indexing (`batch_url_inspection`, three URLs).
- 15 Jan 2027: `snapshot.py page nie-tie 28`.

**Upkeep** (test fails until done): from 15 Jan 2027 (NIE_TIE_REREAD_BY) —
fees can change on 1 January (Orden PJC/617/2025 art. 1.2): re-read the BOE
order, the Police fee table and the office pages, then move NIE_TIE_AS_OF.

**Outcome:** _pending_

## 2026-11-13 — Tourist tax: the 1 April 2027 figures and cruise passengers; transport fares as a dated table (body only; deploy, then groups `tourist-tax`, `transport`)

**Windows respected.** Tourist tax ca/es/en titles and descriptions are
measured until 30 Nov (6 Nov sweep): unchanged, body only. Transport EN
title frozen to 16 Nov: unchanged, body only (one dated sentence).

**Tourist tax (read 13 Nov 2026 on the ATC tariff, taxable-event and
accrual pages; Barcelona Ordenança fiscal 2.2, BOPB 2-2-2026).** Every
1 April 2027 figure is fixed in law: Barcelona = unchanged Generalitat
rate + 6 € (then 7 € from 1 Apr 2028, 8 € from 1 Apr 2029); rest of
Catalonia = Llei 2/2026 rates; and new on the ATC page, a "a partir de
l'01.04.2027" column for six of the seven municipal surcharges (Sant Just
Desvern keeps one open-ended column). New on the page: a dated Barcelona
table from 1 April 2027, the municipal 2027 table, a cruise section (transit
passengers pay at the call; boarding at the start or leaving at the end of
the trip does not accrue it; > 12 h vs ≤ 12 h; Castelldefels / El Prat
cruise surcharges) and an FAQ "do cruise passengers pay". The calculator
already priced by date; tests now pin 31 Mar / 1 Apr 2027, 2028 and 2029.
No Barcelona ordinance change for 2027 on the Ajuntament's tax page.

**Transport (read 13 Nov 2026).** TMB's 2026 table unchanged; ATM home page
"En vigor les tarifes de 2026", no 2027 fares in its press room (latest note
9 Nov); RDL 17/2025 aid runs 1 Jan–31 Dec 2026, no 2027 extension announced.
Code: `FARES_2026` / `FARES_2027 = null` / `CURRENT_FARES` in
transport-cards/rates.ts; the zone table, airport ticket and selector read
it. A drift test lists every euro figure in the transport prose that is not
in the current table, so the January swap is: fill FARES_2027, point
CURRENT_FARES, fix what the test lists, publish `transport`.

**Date guards.** tests/transport-fares.test.ts fails from 16 Dec 2026 and
again from 15 Jan 2027 until FARES_AS_OF is moved past them (ATM approved
2026 fares on 19 Dec 2025). tests/tourist-tax.test.ts fails from 1 Mar 2027
until the ATC is re-read, and from 1 Apr 2027 until the page leads with the
2027 period.

**Expected:** "tasa turistica barcelona 2027", "taxa turistica 2027",
"tasa turistica cruceros barcelona" long tail; measure with the 30 Nov read.

## 2026-11-13 — December peaks: La Marató programme and Christmas-lottery tax gaps (body only; deploy, then groups `marato` and `loteria-nadal`)

**Baseline (GSC 17 Oct–13 Nov, `snapshot.py page … 28`).** La Marató CA:
"marató tv3 2026" 464 impr. at 8.5, "marato tv3 2026" 291 at 8.2, "marató tv3
2026 data" 419 at 5.6 (1 click), "la marato 2026" 230 at 8.5, volunteer
variants ~120 at 8–9; ES "marato tv3 2026" 201 at 9.7. Lottery CA guide: "la
grossa de nadal 2026" 59 at 7.9 plus variants ~45, "loteria de nadal 2026" 54
at 7.4, "quant val un decim" 16 at 2.7. Gordo hubs: no impressions yet.

**What changed (no title, H1 or description touched; the Marató title waits
for the 18 Nov check of the 11 Nov entry).**
- La Marató ca/es/en: 3Cat's news of 10 Nov 2026 (read 13 Nov) gives the
  programme: TV3 9.30–14.30 from the Torre de Collserola and 16.00–1.00 from
  the Parc Audiovisual de Catalunya (Terrassa); Catalunya Ràdio from 8.00
  (Universitat de Lleida); donation line 900 21 50 50 on 13 Dec. Lead, key
  facts, "when / what time" H2, new "what is on" H2 (40+ testimonies,
  reporters, match at Nou Sardenya on Esport3, InfoK special 7 Dec, audience
  places full), album H2 (22nd, on sale 29 Nov only, CD 12 €, tracks), FAQs
  "what time", "where", "phone", "album". Tests now pin the announced times
  and number instead of forbidding them.
- Lottery guide ca/es/en: participaciones (AEAT: the 40,000 € split by share;
  the collector must prove the split; quarter-share Gordo example 100,000 →
  82,000 €), BOE consolidated text re-read 13 Nov (DA 33ª.2 unchanged since
  2018), non-residents' treaty refund, DA 33ª.8; FAQ "La Grossa de Nadal i la
  loteria de Nadal són el mateix?" (+ es/en) and a heading in the searched
  words ("La loteria de Nadal no és La Grossa").

**Not done.** No 2026 draw time (SELAE has published none; its whole site
answered 403 to the server on 13 Nov — see the runbook), no computed claim
deadline, no claim that "La Grossa de Nadal" does not exist (Loteries de
Catalunya unreadable from the server).

**Prediction.** Marató CA "marató tv3 2026" variants from 8–8.6 to ≤ 6 by
1 Dec, with "a quina hora / horari / telèfon" long tail appearing; lottery
"la grossa de nadal 2026" CTR > 0 at the same position.

**Measure** on 1 Dec (`page la-marato 14`, `page loteria 14`) and 14 Dec.

## 2026-11-13 — 2027 leave planner, "Com aprofitar les vacances el 2027" (new tool, ca/es/en; ships with the deploy; group `ponts-2027` for the guide's link)

**What.** An interactive planner: the reader picks a Catalan town (917 with a
page), all of Catalonia, a Spanish city (129) or community, and 1–25 days of
leave; it returns the breaks to book, ranked by days off per day of leave,
with dates, plus the longest single block the same leave buys. Optional
"I also work Saturdays". No competitor in ca/es does it per town with
official data.

- URLs: `/ca/festius/2027/aprofitar-vacances/`,
  `/es/festivos/2027/aprovechar-vacaciones/`, `/en/holidays/2027/leave-planner/`
  (static folders beside the 2027 calendar, like the widget page; sitemap +
  hreflang, x-default en). Hash state `#p=<place>&d=<days>&s=1&c=1`; town and
  city pages link with `#p=<slug>`.
- Logic: `src/lib/programmatic/leave-2027/optimizer.ts` (pure; DP over the
  blocks of leave, each break built around a holiday on a working day, ≥ 3
  working days between breaks, deterministic ties), data from the holiday
  engine (`places.ts`: Ordre EMT/52/2026, Aran swap, BOE-A-2026-21254 per
  community, city bulletins, Ceuta/Melilla agreements). Council-approved
  2027 local days (420 towns) count only when the reader ticks the box,
  labelled "pending the DOGC order" (same rule as the .ics feeds). Default
  server render: Barcelona, 5 days → 22 days off in 5 bridges (Catalonia-wide
  days only), so the page answers without JavaScript.
- Tests: `tests/leave-2027.test.ts` (6–8 Dec bridge, brute-force check for
  1–3 days, no holiday/weekend ever booked on every distinct place calendar,
  tie-breaks, data statuses, paths, links).

**Links in:** every Catalan town page (ca/es/en), every Spanish city page
(es/ca/en), the Spain 2027 hubs and long-weekend pages (static, ship with
the deploy); the Catalonia long weekends guide `ponts-2027` in ca/es/en
(body paragraph under "Amb quants dies de vacances…", DB entry: publish
`ponts-2027` after the deploy). No title changed anywhere.

**Go-live.**
1. Deploy (the three pages are static routes, no DB entry).
2. Publish `ponts-2027`.
3. IndexNow the three planner URLs.

**Baseline:** no page. Queries it targets ("cómo aprovechar los festivos
2027", "puentes 2027", "ponts 2027", "con 5 días de vacaciones…") peak
Dec–Jan; the bridges guides keep "ponts/puentes 2027".

**Prediction.**
- Indexed by 4 Dec.
- By 31 Jan 2027: 2,000–8,000 impressions across the three editions, CTR
  3–6%, mostly es; engaged sessions longer than the bridges guide's
  (interaction).
- Must not cannibalise `/ca/guies/ponts-2027-catalunya/` and
  `/es/guias/puentes-2027-cataluna/`: if their clicks drop > 20% while the
  planner gains the same queries, differentiate titles (after their window).
- Wrong if under 500 impressions by 31 Jan, or not indexed by 11 Dec.

**Measure:**
- 4 Dec: indexing (`batch_url_inspection`, three URLs).
- 8 Jan 2027 (review date): `snapshot.py page aprovechar-vacaciones 28`,
  `page aprofitar-vacances 28`, `page leave-planner 28`; bridges guides
  same window; GA4 engagement on the three paths.
- 31 Jan 2027: outcome.

**Upkeep / date guards** (tests fail until done):
- 16 Jan 2027: the DOGC 2027 local order must be parsed into
  `local-2027.json` (`prepare2027`); the planner then counts every town's
  local days with no edit, and the council box disappears. Redeploy, and
  republish `ponts-2027`.
- 1 Nov 2027: build the 2028 edition (same code, new year).
- Spanish city statuses follow `CITIES_AS_OF` (recheck every 21 days).

**Outcome:** _pending_

## 2026-11-13 — "¿Cuándo empiezan las vacaciones de Navidad 2026?" for all of Spain: the hub becomes the comparison table, every community page answers first (deploy; groups `calendario-escolar-espana`, `calendario-escolar-espana-links`)

**Why.** GSC 10–12 Nov vs the 3 days before: "cuando empiezan las
vacaciones de navidad 2026" +164 to 279 impressions at 6.2 (2 clicks).
Google answers the Spain-wide query with the reader's community page, not
the hub: 28 d, queries containing "vacaciones de navidad" → Andalucía 872
impr. at 7.4 (2 clicks), Madrid 448 at 8.0 (2), Valenciana 237 at 8.9 (0),
hub 204 at 8.3 (0), Castilla y León 168 at 6.1, then 13 other community
pages. Demand grows daily until ~20 Dec. No new page: the hub
(/es/guias/calendario-escolar-espana/, /ca/guies/calendari-escolar-espanya/,
/en/guides/spain-school-calendar/) already compared the 19 calendars, so it
was upgraded instead of duplicated.

**Baseline (GSC, `snapshot.py page <path> 7`, 7–12 Nov).** Hub ES 864 impr. /
5 clicks (0.6 %), pos 7.2–11.0; its top queries "cuando empiezan las
vacaciones de navidad 2026" 43 at 6.0, "vacaciones de navidad 2026" 36 at
7.4, "cuando son las vacaciones de navidad 2026" 21 at 7.8 (all 0 clicks).
Hub CA 7 impr. (first on 12 Nov), EN 0. Andalucía 2,611 / 8 (0.3 %) at
7.4–8.0 ("cuando dan las vacaciones de navidad 2026" 152 at 6.2, 0 clicks);
Madrid 1,177 / 3 (0.3 %) at 7.8–8.9 ("cuando empiezan…" 100 at 7.2, 0);
Valenciana 758 / 2 at 6.2–8.9 ("cuando empiezan…" 63 at 5.9, 0).

**Facts re-read 13 Nov 2026** (official texts, curl + pdftotext): the
Christmas sentence of the orders of Aragón (BOA 88, 2026-2027 section),
Asturias, Baleares, Canarias, Cantabria (list of days), Castilla y León,
Castilla-La Mancha (Orden 79/2026, art. 4 c: "desde el día 23/12/2026 hasta
el 08/01/2027"), Ceuta, Valenciana, Extremadura, Madrid, Melilla, Murcia,
Navarra, País Vasco, and the 7 Andalusian provincial resolutions: all match
data.ts. Not re-readable from the server: Galicia (xunta.gal answers 500 on
every path) and La Rioja (BOR 403, Cloudflare); both keep their 6 Nov
reading. Jaén's 2026/2027 resolution is still not on the Junta's portal
(searched the portal, the Delegación's page and the news items: only Cádiz,
Córdoba, Almería, Huelva and Sevilla appear): stays "por confirmar".

**What changed (body + hub description; no title touched anywhere).**
- Community pages ×18 ×3 languages: the lead opens with "**Vacaciones de
  Navidad 2026-27 en <comunidad>: del … al … (vuelta a clase el …)**. El
  último día de clase es el …". Andalucía: the return per province (7 Jan
  Almería/Granada/Málaga, 8 Córdoba/Huelva, 11 Cádiz/Sevilla; Jaén por
  confirmar). País Vasco: "como mínimo … (vuelta como pronto el …)". A new
  paragraph right under the Christmas section links the hub's table.
- Hub ×3: bold answer first ("en la mayoría de comunidades el último día de
  clase es el martes 22 de diciembre, y se vuelve a clase entre el 7 y el 11
  de enero", then who finishes earlier/later, Andalusian provinces named).
  Christmas and Easter tables now: Comunidad | Último día de clase | Primer
  día sin clase | Vuelta a clase | Fuente (one official link per row; the
  provincial page where provinces differ). Andalucía's cells give the
  provinces' alternatives ("7, 8 u 11 de enero") instead of "según la
  provincia". FAQ: the "cuándo empiezan" answer lists every first and last
  day by community; new "¿Cuándo se vuelve al colegio después de Navidad?".
- Hub description (live, `liveHubDescription`, until the last community is
  back on 11 Jan): ES "Vacaciones de Navidad 2026 en los colegios: último día
  de clase el 21, 22 o 23 de diciembre, según la comunidad, y vuelta entre el
  7 y el 11 de enero." (ca/en alike). Before: "Calendario escolar 2026-2027
  en 19 comunidades y ciudades autónomas, con la orden oficial de cada una…".
  No window was open on the hub.
- Catalan guide (`school-calendar` page, ca/es/en): its Christmas box adds
  one sentence with the Spain-wide days and the hub link. Body only: its
  description test (11 Nov entry, to 9 Dec) and title are untouched.

**Prediction.** Hub ES: "cuando empiezan/dan/son las vacaciones de navidad
2026" from 6–8 to ≤ 5 and CTR from 0 % to ≥ 2 % by 27 Nov; community pages
keep their positions and CTR rises above 0.5 % (Madrid, Valenciana at 0 %
today) as the snippet now carries the return day.

**Review** 20 Nov (day 7: `page calendario-escolar-espana 7`, `page
calendario-escolar-madrid 7`, `page calendario-escolar-andalucia 7`) and
27 Nov. Revert rule for the hub description: if its CTR at a comparable
position is below the 7–12 Nov 0.6 % on 27 Nov, go back to the calendar
wording. Date guards: Jaén resolution (re-search the portal on 20 Nov);
the hub description switches itself off on 11 Jan 2027; the Catalan box
line only shows while the guide is on 2026-2027.

**Outcome:** _pending_

## 2026-11-13 — Work calendar 2027, December bridge, Spain 2027 cities: body answers and internal links, no title touched (deploy; groups `pont-desembre`, `puente-diciembre-espana`)

**Why.** GSC 28 d to 12 Nov (`snapshot.py page …`, a page→query breakdown):

- `/es/guias/calendario-laboral-cataluna/` 1,759 impr. (ca 202): "calendario
  2027 catalunya con festivos" 53 at 8.8, "calendario laboral 2027 catalunya"
  40 at 10.0, "calendari laboral 2027 catalunya" 26 at 8.7, "puentes 2027
  catalunya" 19 at 9.8, "festivos 2027 catalunya" 18 at 10.3; daily position
  11.8–19 since 31 Oct (dragged by Spain-wide "calendario laboral" at 56 and
  expired "30 de octubre" queries). Top results (diainternacionalde,
  fedratecalc, absentify, ara.cat) give the 12 days and Barcelona's; the
  guide gave every 2027 answer except the other towns' local days, and its
  local section still said "a 3 de noviembre … ninguna".
- "festivos puente diciembre": 1,202 impr., 0.3 % CTR (689 at 9.2 on the
  Catalan ES page, 513 at 10.5 on the Spain page).
- `/es/festivos/2027/` family: ~1,000–2,000 impr./day at 8–9.6 since 8 Nov;
  "festivos vigo 2027" 69 at 9.8, "calendario laboral paterna 2027" 30 at 6.6.
  City pages opened with the full 14-row calendar; the city's two days were
  only rows in it and the paragraph after it.

**What changed (body and links only).**

1. Work calendar ca/es/en (`holidays` via `pont-desembre`): the local-days H2
   becomes "Festes locals del 2027 de les grans ciutats" (es/en alike): order
   status re-read 13 Nov (Generalitat open data b4eh-r8up: newest year 2026),
   420 councils with approved days, a table of the 15 largest towns (council
   days with weekday, "acuerdo no encontrado" for Terrassa, Tarragona and
   Santa Coloma, 2026 days alongside, each linked to its town page), and the
   town calendar feeds ("Afegeix al teu calendari", Barcelona's linked at
   `#afegeix-calendari`). The 2027 table note and the line under the .ics
   download point to it; the FAQ "when are the local days published" gives
   the council count. `LOCAL_ORDER_CHECKED` test fails 4 Dec; the build stops
   if `local-2027.json` gets the DOGC order before the section is rewritten.
2. Holiday hub (ca/es/en) and every town page (ca/es/en): one sentence in the
   body linking the work calendar ("calendari laboral 2027 de Catalunya", mes
   a mes, dies feiners, ponts). Deploy only.
3. Spain December bridge ca/es/en (`puente-diciembre-espana`): the summary box
   opens with "Festivos del puente de diciembre" (Monday 7 in 9 communities +
   Melilla, Tuesday 8 everywhere), "Puente de 4 días sin pedir ninguno" (Sat
   5–Tue 8, where), and where the 7th is a working day, with Catalonia linked
   ("solo es festivo el martes 8"). CA edition gets the box too.
4. Catalan December bridge ca/es/en (`pont-desembre`): the "¿No vives en
   Cataluña?" box links the Spain page as "los festivos del puente de
   diciembre 2026 en cada comunidad". First paragraph unchanged.
5. Spain 2027 city pages es/ca/en (129 × 3, deploy only): a first line above
   the calendar table: "**Fiestas locales de Vigo en 2027: el lunes 29 de
   marzo y el lunes 16 de agosto.** Las publica el DOG núm. 204…; 14
   festivos". Pending cities: "aún sin publicar", where and when expected,
   2026 days, "Boletines consultados el 6 de noviembre de 2026".

**Facts re-read 13 Nov.** Vigo: Xunta open data calendario-laboral-2027 CSV
(29 Mar, 16 Aug, INE 36057); the DOG HTML answered 500. Telde: BOC 168/3035
("TELDE. 24 de junio … 17 de noviembre"). Valencian 2027 local list: not in
the DOGV up to núm. 10493 (13 Nov), scanned through the DOGV API (the 2026
list, DOGV 10238 of 14 Nov 2025, is found by the same scan) — Paterna stays
pending. Aragón (precedent 20 Nov), Navarra (2 Dec), Cantabria, Castilla-La
Mancha, Madrid (11–12 Dec): not re-read; `CITIES_AS_OF` unchanged.

**Confounders.** Answer-first review 19 Nov (the work calendar and both
bridge pages are in the first group); Spain bridge title window to 19 Nov;
Catalan ES bridge retitle window to 18 Nov. Demand rises into 4–8 Dec and
Nov–Jan for 2027: compare position at equal query, not clicks.

**Prediction.** By 1 Dec: Catalan 2027 queries on the work calendar from
8.7–10.3 to ≤ 7; "festivos puente diciembre" ≤ 7 on one of the two bridge
pages with CTR > 1 %; `/es/festivos/2027/` city queries ("festivos <city>
2027") from 8–10 to ≤ 7.

**Measure 20 Nov and 1 Dec**: `snapshot.py page calendario-laboral 7`,
`page puente-diciembre 7`, `page festivos/2027 7` (+ the scratch page→query
breakdown).

**Outcome:** _pending_

## 2026-11-13 — 11N pages for the rest of Spain: "Y ahora en <ciudad>" hands past-event readers to their own community's evergreen pages; related rail off Catalonia (deploy; group `strike-11n-cities`)

**Why.** GSC 7–13 Nov: the past 11N city pages still draw large impressions
from readers who live in those cities: Sevilla 71.6k, Zaragoza 41k, Alicante
36k, Murcia 28.6k, Málaga 21k, Vigo 16k, Las Palmas 15k, A Coruña 14k,
Valladolid 12k, Palma 10.7k, plus Madrid, Valencia and the Spain page. Their
onward links were the strike (upcoming block, moved to the end by the
answer-first layout) and a related rail / "Lee también" box pointing at the
Catalan 11N page and the Catalan strikes hub, pages about somewhere else.
The traffic dies with the event; the readers' next questions (school
holidays, 2027 holidays, the December bridge, shops in December) have
evergreen pages of ours for their own community and city.

**What changed** (`strike-11n-next.ts`, wired into `strike-11n-cities.ts` and
`strike-11n-spain.ts`; titles, descriptions and excerpts untouched, so the
11N title entries of 29 Oct, 8 Nov and 11 Nov are not disturbed):
1. **"Y ahora en Sevilla: colegio, festivos y diciembre"** (ca "I ara a …:
   escola, festius i desembre", en "Next for …: school, holidays and
   December"), H2 + 6 links, only once the strike is past
   (`strikePhase(asOf) === "past"`). Stored after the upcoming block, so it
   renders right under the lead that says the strike is over and above the
   minimum-services section. Per city: the community's school calendar
   2026-27 (`/es/guias/calendario-escolar-<comunidad>/`), the city's 2027
   holidays (`/es/festivos/2027/<comunidad>/<ciudad>/`), the leave planner
   with the city picked (`…/aprovechar-vacaciones/#p=<comunidad>/<ciudad>&d=5`,
   the picker's own ids), the Spain December bridge, shops open in December
   (Spain) and the Spain strikes hub; ca/en link their own editions. The
   Spain page gets the Spain-wide versions (school hub with the Christmas
   table, `/es/festivos/2027/`, the planner, same last three), under its table.
   The 17N rail page stays in the upcoming block (it already links it).
2. **Related rail of the 13 city pages** (and so their "Lee también" box):
   Catalan 11N page + "Huelga hoy en Cataluña" → the Spain-wide 11N page +
   "Huelgas en España". The Catalan 11N page stays in the other-cities list;
   the Catalan 11N page itself (`strike-11n.ts`) is unchanged.
3. Not changed: the site header's "Festivos" / "Calendario escolar" items
   still point at the Catalan pages on every page (global nav, out of scope).

Tests (`tests/strike-11n-cities.test.ts`): every link in the block resolves
to a path the site builds (B2/feature registries, school-spain `regionPath` /
`HUB_PATHS`, the 2027 calendar's sitemap helpers `spainPaths` /
`editionPaths`, `leaveEditions`), the planner id is one `plannerData` knows
and opens that city's page, 5–6 links, no Catalan target, block absent before
and on the day; the related rail carries the Spain pages and no Catalan ones.

**Baseline.** GA4 sessions from these pages to the targets are not measurable
with `scripts/snapshot.py` (no referrer / next-page command), so GSC 7–13 Nov
(13 Nov partial), `snapshot.py page <path> 7`, clicks / impressions:

| Target | Clicks | Impr. |
| --- | --- | --- |
| `/es/guias/calendario-escolar-espana/` | 5 | 864 |
| `…-andalucia/` (Sevilla, Málaga) | 8 | 2,613 |
| `…-madrid/` | 3 | 1,178 |
| `…-comunidad-valenciana/` (Valencia, Alicante) | 2 | 758 |
| `…-murcia/` | 0 | 349 |
| `…-galicia/` (Vigo, A Coruña) | 1 | 330 |
| `…-aragon/` | 0 | 0 |
| `/es/festivos/2027/andalucia/sevilla/` | 1 | 58 |
| `/es/festivos/2027/aragon/zaragoza/` | 0 | 46 |
| `/es/festivos/2027/comunidad-valenciana/alicante/` | 1 | 30 |
| `/es/festivos/2027/murcia/murcia/` | 0 | 16 |
| `/es/festivos/2027/aprovechar-vacaciones/` (new 13 Nov) | 0 | 0 |
| `/es/guias/puente-diciembre-espana/` | 495 | 13,767 |
| `/es/guias/tiendas-abiertas-diciembre-espana/` | 0 | 0 |
| `/es/guias/huelgas-espana/` | 64 | 2,234 |
| Source: `/es/guias/huelga-general-11-noviembre-*` (13 cities + Spain) | 16,214 | 283,216 |
| Source: `/en/guides/general-strike-11-november-*` (incl. the Catalan EN page) | 462 | 10,009 |
| Source: `/ca/guies/vaga-general-11-novembre-*` | 5 | 109 |

**Prediction.** Internal links move impressions little; the honest readings
are (a) GA4 page views of the targets with `pageReferrer` containing
`huelga-general-11-noviembre-` (run once, ad hoc, on 27 Nov for 14–26 Nov:
≥ 300 sessions in total would mean the block is used), and (b) GSC: the
community school pages and the five 2027 city pages above gain impressions
faster than the school pages of communities with no 11N city (Asturias,
Cantabria, Navarra…), at equal query. Wrong if (a) is under 100.

**Revert rule (27 Nov).** If the block gets under 100 referred sessions and
the 11N city pages' engagement rate falls against 7–13 Nov, drop it
(`cityNextBlocks` / `spainNextBlocks` calls) and republish
`strike-11n-cities`. The related-rail change stays (it only stops pointing at
the wrong region).

**Confounders.** Answer-first review 19 Nov (these pages are in it); the 11N
pages decay anyway; the 17N rail strike and 29N election bring their own
traffic; Christmas-holiday demand rises into December.

**Review 27 Nov 2026. Outcome:** _pending_

## 2026-11-13 — Core Web Vitals check on 10 templates; font fallback fix (deploy; no group)

**Field data: none available from the server.** The keyless PageSpeed
Insights API v5 answered 429 on every request (`quota_limit_value: "0"`,
`defaultPerDayPerProject`: the anonymous quota is gone, not just used up);
PSI refuses OAuth, and the CrUX API needs a key. The site sends no RUM
(no web-vitals reporting to GA4). So the numbers below are **lab**, not
CrUX p75. Get field data from pagespeed.web.dev in a browser (no quota there)
or from a PSI/CrUX API key, and from Search Console → Core Web Vitals.

**Lab method** (Playwright Chromium 130 on the VPS against production,
13 Nov ~11:00–12:30, release 925cf2d): 412×823 at DPR 1.75, mobile, cache
off, 1.6 Mbps / 150 ms RTT, CPU throttle ×2 (this VPS runs JS about 3× slower
than a desktop, so ×2 here is roughly a mid-range Android; ×4 over-throttled),
consent card left open as a first visit sees it. 2–5 loads per page; the VPS
link is lossy (see the Contabo note), so the spread between runs is wide and
only repeatable effects were acted on.

| Template | URL | LCP (lab, range) | LCP element | CLS | Notes |
| --- | --- | --- | --- | --- | --- |
| Home | /ca/ | 1.9–3.0 s | lead paragraph | 0 | ~205 KB of `?_rsc=` viewport prefetches |
| Strike guide | /es/guias/huelga-general-11-noviembre-sevilla/ | 1.8–5.1 s | H1 | 0 | FCP = LCP; long hydration task |
| Town holidays | /es/festivos/barcelona/ | 3.5–4.5 s | **consent card text** | 0 | page's own lead paints at 2.4–3.3 s |
| Spain 2027 city | /es/festivos/2027/madrid/madrid/ | 2.6–3.7 s | lead paragraph | **0.062** | font swap re-wraps the H2 (fixed here) |
| School calendar hub | /es/guias/calendario-escolar-espana/ | 2.1–4.2 s | hero image | 0 | hero preloaded, AVIF |
| 2027 leave planner | /es/festivos/2027/aprovechar-vacaciones/ | 1.7–2.9 s | lead paragraph | 0 | checkbox tap 120–128 ms (INP-good) |
| Christmas fair town | /es/mercados-navidad/barcelona/ | 1.6–2.2 s | lead paragraph | 0.003 | FairStatus line, negligible |
| Fuel prices | /es/gasolineras/ | 2.0–3.2 s | lead paragraph | 0 | |
| Election town | /es/elecciones/sabadell/ | 3.6–4.5 s | **consent card text** | 0 | |
| NIE guide | /es/guias/nie-tie-barcelona-cataluna/ | 2.0–4.4 s | hero image (640w AVIF, 68 KB) | 0 | LCP waits for the main-thread task, not the download |

Every page ships ~157–179 KB of JS (transfer) and preloads 108 KB of fonts;
TTFB from the VPS is 60–150 ms (Cloudflare HIT), up to ~1 s on a lossy run.

**What was tested and not changed (no effect shown):**
- Viewport prefetch of `next/link` (`?_rsc=`, bypassed by Cloudflare rule 3,
  so it also reaches origin): blocking it changed neither LCP nor TBT beyond
  the noise (3 interleaved rounds × 4 pages). Not a CWV problem; left as is.
- Leave planner: interactions stay under 200 ms in the lab (click 120–128 ms,
  handler 22–41 ms); the optimizer takes 6–58 ms per call in Node here. Note
  for whoever edits it: LeavePlanner.tsx says "the React Compiler memoises
  these", but the compiler is **not** enabled (no `reactCompiler` in
  next.config.ts), so each change recomputes the plan and re-renders the
  ~1,060 `<option>`s. Fine today; first thing to memoise if INP turns poor.
- Hero images: already preloaded at high priority, AVIF, `sizes="100vw"`
  correct for a full-bleed figure.

**Not ours to change (owner decision):** on town-holiday and election pages
the consent card's paragraph is the largest text on the first screen, so it
becomes the LCP element and LCP is when the card renders after hydration
(3.5–4.5 s lab vs 2.4–3.3 s for the page's own lead). The banner was not
touched. If field LCP on those templates is poor, this is the first
suspect; any change is the owner's call (look, behaviour and AEPD wording).

**The change** (`src/lib/fonts.ts`, test `tests/fonts.test.ts`): removed the
`fallback: [...]` lists from both next/font calls. With Turbopack (Next
16.3.5) a `fallback` list replaces the automatic metric-matched fallback
instead of following it, so production had **no** "Fraunces Fallback" /
"IBM Plex Sans Fallback" `@font-face` (prod CSS `2qv2t_3ccnbny.css`:
`--font-fraunces:"Fraunces", ui-serif, Georgia, serif`) and
`adjustFontFallback: true` did nothing. Verified with a throwaway `next dev`
app: with the list, no fallback face; without it, `"Fraunces", "Fraunces
Fallback"` with `src: local(Times New Roman); size-adjust: 115.45%;
ascent-override: 84.71%; descent-override: 22.09%` and Plex with Arial at
101.17% / 101.32% / 27.18% (same values as `capsize-font-metrics.json`). The
generic families still follow from `--font-display` / `--font-sans` in
globals.css. No title, description, AdSense, consent or verification code
touched.

**Evidence in lab.** Fonts held 2.5 s so the swap lands after first paint,
prod CSS served as is vs rewritten to what the fix emits (with Liberation
Serif/Sans, metric clones of Times New Roman/Arial), 2 runs each: Spain 2027
Madrid swap CLS **0.0624 → 0.0003** (the H2 "Calendario laboral 2027 de
Madrid" no longer goes from one line to two and pushes the table 28 px);
the other nine templates 0.0002 → 0.0001 (wordmark only).

**Hypothesis.** Lab CLS on the Spain 2027 city pages (129 cities × ca/es/en,
plus any page whose headings re-wrap on swap) goes to ~0 for readers on iOS,
macOS and Windows. **Android is unchanged**: it has no Times New Roman/Arial
for `local()`, so the fallback face is skipped and the swap behaves as
before (a hand-tuned Noto Serif face would be the next step, not verifiable
here because Noto Serif is not installed on the VPS).

**Re-test after deploy:**
1. `curl -s https://www.catalunyainfo.com/es/festivos/2027/madrid/madrid/ | grep -o '/_next/static/chunks/[^"]*\.css'`
   then grep that CSS for `Fraunces Fallback` and `size-adjust:115.45%`.
2. PSI mobile (pagespeed.web.dev or the API with a key) on the 10 URLs in the
   table, CLS and LCP element first: https://pagespeed.web.dev/analysis?url=https://www.catalunyainfo.com/es/festivos/2027/madrid/madrid/&form_factor=mobile
3. Search Console → Core Web Vitals (mobile), from ~11 Dec (28-day window).

**Revert rule.** If the deployed CSS lacks the fallback faces, or any of the
10 pages shows new CLS > 0.05 in PSI from the font swap, put the two
`fallback` lists back (one-line revert of the fonts.ts hunk).

**Review 11 Dec 2026. Outcome:** _pending_

## 2026-11-13 — Live-data pages: the official figure, its time and the comparisons in the server HTML (reservoirs, Rodalies, fuel; deploy only, no title or description touched)

**Why.** The live tools are the hardest pages to copy, and they sat on page 2.
GSC 17 Oct–13 Nov (28 days, `snapshot.py page <family> 28` and page × query):

| Page | Impr. | Pos. | Top queries (impr. @ pos.) |
| --- | --- | --- | --- |
| `/es/guias/embalses-cataluna-hoy/` | 237 | 15.4 | embalses cataluña 40 @ 17.1, embalses catalunya 37 @ 19.1 |
| `/es/embalses/` | 163 | 11.6 | embalses cataluña 95 @ 11.2, embalses catalunya 29 @ 10.1 |
| `/ca/guies/embassaments-catalunya-avui/` | 255 | 15.7 | estat embassaments 20 @ 27.1, embassaments catalunya 11 @ 27.4 |
| `/ca/embassaments/` | 181 | 9.9 | embassaments catalunya 32 @ 9.7, estat embassaments 7 @ 21.3 |
| `/es/embalses/sau/` (+ susqueda, la-baells) | 411 (+174, 112) | 12.1 (10.9, 10.2) | pantano de sau hoy 87 @ 9.5, pantano de susqueda hoy 74 @ 9.6 |
| `/en/reservoirs/` | 87 | 5.9 | water reserves catalunya 7 @ 6.0 |
| `/es/rodalies/` | 113 | 14.3 | scattered (rodalies hoy 12, retrasos rodalies hoy 48) |
| `/es/rodalies/r2-sud/` (+ r4, r1, r2-nord) | 395 (+364, 362, 357) | 9.4 (11.6, 11.6, 11.9) | r2 sud 60 @ 8.6 |
| `/es/gasolineras/`, `/ca/benzineres/` (hubs) | 5, 5 | 8.6, 14.6 | — (place pages noindex since 11 Nov, `low-demand.ts`) |

What the HTML (what Googlebot's first pass and a no-JS reader get) said on
13 Nov, read with curl:
- **Reservoir hub and the 27 reservoir pages**: static since 28 Oct; "nivel
  hoy" printed the **28 Oct** snapshot ("Datos de la ACA leídos el
  28/10/2026; la lectura del día se carga en el navegador"). Cache-Control
  `s-maxage=31536000`: Cloudflare kept that until the next deploy's purge.
- **Rodalies hub and 38 line pages**: no notice at all, only "los avisos se
  cargan aquí cuando el navegador tiene JavaScript".
- **Fuel hubs and pages**: the loading skeleton, i.e. "Precios en vigor a las
  00:00 del 00/00/0000" and "Precio mediano … 0,000 €/l".
- **Reservoir guide**: already server-rendered (78.1 %, reading of 11 Nov,
  `s-maxage=10800`), but no year-ago figure and no link from its table to
  the reservoir pages.

Competitors (WebSearch, 13 Nov): reservoirs = dated news stories (ara.cat,
iagua, ecoticias; the newest figure in the snippets was January) and data
pages (iagua.es/data, embalses.net per the module notes); Rodalies = news
items and the official status page; fuel = aggregators (carwow, carnovo,
motor.es, casacochecurro) that print the cheapest station, its price and
"actualizado hoy" in the HTML. The query asks for a number with its date
(and for Rodalies, "is my line running"); we had the number only after
JavaScript.

**Which URL owns which query.** Reservoirs: the guide owns the head query
("embalses cataluña / embassaments catalunya / estat dels embassaments":
the total and Ter-Llobregat; its title already carries the live % and is in
the window of the 28 Oct entry until 25 Nov); the hub is the "one by one"
table and says so in its first line, giving the guide's own total with a
link to it; each reservoir page owns "pantano de X hoy". Google currently
ranks the hub higher for the head term (11.2 vs 17.1): see the review rule.

**What changed** (code only: ships with the deploy, no publish group):
1. **Reservoirs** (`lib/programmatic/reservoirs/server.ts`; routes
   `revalidate = 10800`, `dynamicParams = true`): the HTML renders the ACA's
   latest reading (same validation as `/api/reservoirs/levels/`), else the
   snapshot's with its own date. First line on each reservoir page: "**El
   embalse de Sau está al 69,6 %** (dato de la ACA del 11/11/2026): 115,46 hm³
   de 165,81. Desde el 04/11/2026, −2,0 puntos; hace un año, el 11/11/2025,
   estaba al 55,0 %." Header: "Dato de la ACA del 11/11/2026 · consultado el
   13/11/2026 a las 12:18" (the ACA portal's HTTP Date, not the build time).
   Hub: fullest/lowest + the guide's total and link; table gains "cambio en
   una semana" and "hace un año (dd/mm/aaaa)". Year-ago = the same rules as
   today's report on the four days up to date − 365 (`loadReservoirsYearAgo`);
   no comparison when the ACA has no clean day. The "last year" paragraph no
   longer calls the 28 Oct snapshot "the latest reading". Dataset JSON-LD
   gets `dateModified` = the reading date, only when the render read the ACA.
2. **Reservoir guide block** (`components/blocks/ReservoirLevels.tsx`, all
   three languages): year-ago total ("Hace un año (11 de noviembre de 2025)
   estaban al 72,9 % (ahora, +5,2 puntos)"), a "hace un año" column, each
   reservoir name links its page, "Datos consultados en la ACA: 13/11/2026,
   12:18 h". Guide title/description untouched.
3. **Rodalies** (`lib/programmatic/rodalies/server.ts`; routes
   `revalidate = 300`, `dynamicParams = true`): the notices read at render
   are in the HTML, under "leídos a las 12:18 h (13/11/2026)" and with
   absolute publication times (a cached copy never says "hoy"); first line
   "**9 avisos activos** en Rodalies a las 12:18 h del 13 de noviembre de 2026:
   R1, R2, …" / "**R2 Sud: 1 aviso activo** a las …". Same sources and
   15-minute rule as the API; a stale or failed read keeps the old fallback.
   The browser re-reads after mount as before.
4. **Fuel** (`lib/programmatic/fuel/server.ts`, one memoised read of the
   Ministry list per process every 10 min; routes `revalidate = 1800`,
   `dynamicParams = true`): the ten cheapest per product with the Ministry's
   timestamp in the HTML, and a first line "Gasolina 95 más barata de
   Barcelona: **1,399 €/l** en TAMOIL (CALLE TUCUMAN, 2). Diésel más barato:
   …". Only the page's ranking travels in the props, not the 1,500 stations.
   Dataset `dateModified` = the Ministry's timestamp. The noindex of the
   place pages (`low-demand.ts`, AdSense) is **not** changed: the head queries
   ("gasolineras baratas barcelona" 60 @ 30, "gasolineras bonarea" …) land on
   those pages, so the fuel lever is re-indexing them, owner's decision after
   AdSense (the 0,000 skeleton they showed is gone).
5. Cache: Cloudflare rule 2 follows the origin's Cache-Control, so the edge
   copy now expires with the ISR interval (10800 / 300 / 1800) instead of a
   year; deploy still purges everything.

**Prediction.** Reservoir pages (Sau, Susqueda, la Baells) and the R-line
pages move from 9–12 into 5–8 for "pantano de X hoy" / "rX" within 28 days,
as Google recrawls and sees a dated figure in the first line; CTR up at
equal position on the reservoir pages (a number in the snippet). The fuel
hubs gain little (their queries go to the noindex pages). Wrong if the
reservoir and line pages' average position is unchanged (±1) on 11 Dec.

**Review rules.** 27 Nov (14 days): curl the three families and check the
HTML still carries a reading/notices/prices with a time no older than the
ISR interval plus a margin (`grep -c "consultado el\|leídos a las\|Precios en
vigor"`); GSC per page as in the table. 25 Nov (end of the guide's title
window): if the hub still outranks the guide for "embalses cataluña" by more
than 3 positions, retitle the guide to its supporting angle (Ter-Llobregat /
Barcelona water, how to read the figures) and give the hub the live-% title,
logging a new entry. 11 Dec (28 days): outcome.

**Confounders.** Rain (reservoir news peaks), Rodalies strikes 17/19/23 Nov
(the strike guides own those queries and also contain "rodalies"), the
answer-first review of 19 Nov, AdSense decision on fuel indexing.

**Review 27 Nov 2026 / 11 Dec 2026. Outcome:** _pending_

## 2026-11-13 — Living nativities 2026-27 re-read on every organiser's page; Christmas traditions answer the searched questions first (body only; deploy, then groups `pessebres`, `nadal-tradicions`)

**Why.** December demand. The nativity table still showed four "pending"
nativities read on 3 Nov, and the traditions page ranks 4-5 for countdown
and "dia de Nadal" queries it did not answer in its first line.

**Baseline, `snapshot.py page <pattern> 28` (17 Oct – 13 Nov 2026).**
- `/ca/tradicions/pessebres-vivents-catalunya/`: 268 impr. / 8 clicks;
  pessebres vivents catalunya 2026 25 at 8.8; pessebre vivent 6 at 63.8.
- `/es/tradiciones/belenes-vivientes-cataluna/`: 446 / 20; belenes vivientes
  2026 44 / 2 clicks at 5.8; belen viviente cataluña 23 at 6.0; pessebres
  vivents catalunya 2026 11 at 6.5.
- `/en/traditions/living-nativity-scenes-catalonia/`: ~29 / 1 (pattern
  "nativity").
- `/ca/tradicions/tradicions-de-nadal-catalunya/`: 568 / 4; quan queda per
  nadal 10 at 4.0, quan falta per nadal 8 at 4.8, dia de nadal 7 at 11.3,
  nadal a catalunya 7 at 7.0, festa de nadal 4 at 15.0, cuando se (hace)
  caga el tio 1+1 at 7-9.
- `/es/tradiciones/tradiciones-navidad-cataluna/`: 149 / 0; navidades
  cataluña 9 at 64, tio caganer 6 at 21, navidad catalana 5 at 62.
- `/en/traditions/catalan-christmas-traditions/`: 14 / 0.

**Windows.** Traditions: the 26 Oct new-page entry measures on 23 Nov.
Nativities: descriptions changed 3 Nov (measure 17 Nov and 1 Dec). Both
inside a window, so **no title or description touched**; body only.

**What changed.**
- Nativities (KNOWN, every entry now with `readOn` 13 Nov and the page's
  quote): Bàscara (elpessebre.cat: 20, 25-27 Dec, 1-3 Jan, 19 h), els Prats
  de Rei (55th: 20, 26, 27 Dec, 1, 3, 6 Jan, 18.30 h; the agenda says 21 Dec,
  the note says so) and Peralada (43rd: 25-27 Dec, 1-3 Jan, 18.30 h, €6/€3)
  are now dated; Rupit says "2026 no confirmat" (page still 2025-26). This
  season's prices and times where the page gives them (Corbera €17/€12,
  sessions 18/19/20 h; Tona 18-20 h, €10/€3, box office; Torres de Fals
  €15/€12/€6 — its old times are no longer on the page and were dropped;
  Sant Fost €10/€4/€6; Sant Guim tickets "properament"). Lead: first day,
  Estels, "most between 19 Dec and 10 Jan", the dated towns. "Cal entrada"
  section and the price FAQ give this season's adult range (€6–€17, Torre
  del Suro free). Link to the fairs hub. Castellar de n'Hug and l'Arboç:
  no living nativity in the agenda and no official page, not listed.
- Traditions: the lead opens with the three days ("la Nit de Nadal és
  dijous 24 de desembre de 2026 … Nadal, divendres 25 … Sant Esteve,
  dissabte 26") and names tió, caganer, Missa del Gall, escudella, canelons
  and the grapes; ES lead says "La Navidad catalana". New paragraph right
  after it (`plansLine`): lights switch-on 26 Nov, the fairs hub with Santa
  Llúcia 27 Nov–23 Dec, living nativities from 28 Nov, Barcelona in
  December. Key facts gain Cap d'Any (Thursday 31 Dec, working day; 1 Jan
  holiday). Caganer section: "not the tió" (the "tio caganer" query). Cap
  d'Any section quotes the council's grapes page (new source).

**Prediction.** By 1 Dec: CA traditions page in the top 3 for "quan falta
per nadal" / "dia de nadal" variants (4-11 now), CTR > 2 %; ES "tio
caganer" inside the top 10. Nativities: ES "belenes vivientes 2026" ≤ 5
with CTR ≥ 5 %, CA "pessebres vivents catalunya 2026" ≤ 6.

**Date guards.** `recheck` nativities (Rupit dates, Sant Guim ticket sale)
re-read every 10 days until 19 Dec (test fails otherwise: next by 23 Nov);
the 2026-27 table fails a test from 15 Jan 2027 (after-season pass).

**Review 1 Dec 2026, 4 Jan 2027. Outcome:** _pending_

## 2026-11-13 — Net salary calculator 2026, "Calculadora de sueldo neto 2026" (new tool, Spain-wide, es/ca/en; first of the calculators family; ships with the deploy, no group)

**What.** Gross annual salary → net pay for 2026 anywhere in Spain: worker's
Social Security (Orden PJC/297/2026: 4.70 + 1.55/1.60 + 0.10 + MEI 0.15, base
max 5,101.20 €/month, solidarity bands above it) and IRPF withholding with the
AEAT "Algoritmo de cálculo del tipo de retención 2026" (version of 10 Sep
2026; the only change vs the January one is La Palma, RDL 23/2026). Inputs:
gross, 12/14 payments, community (15 common-regime + Ceuta, Melilla, La
Palma; Navarra and País Vasco shown as "not supported" with the foral
offices' links), age band, family situation 1/2/3, children under 25 and
under 3, whole/half, disability, contract (open-ended / fixed-term ≥ 1 year /
under 1 year), geographic mobility, pre-2013 mortgage. Output: net per
ordinary payslip and per extra payment, net a year, SS line by line, IRPF
rate and amount, effective rate, and the notes that apply (exempt, 43 %
limit, 2 % floor, Ceuta, cap).

- URLs: `/es/calculadoras/sueldo-neto/`, `/ca/calculadores/sou-net/`,
  `/en/calculators/net-salary-spain/` (static folders under the new
  calculators roots, `lib/programmatic/calculators/paths.ts`; no hub yet —
  a test fails if a `page.tsx` appears at the root by accident; sitemap +
  hreflang, x-default en like the HTML; llms.txt entry). Hash state
  `#b=…&n=…&r=…` so a result can be shared.
- Server HTML (no JS): the 30,000 € Catalonia example (1,628.50 € × 12 +
  1,791.00 € × 2 = 23,124 € net; 16.42 %), a table of 17 gross salaries
  (15k–100k) in 12 and 14 payments, the worked example step by step, why
  the community does not change the payslip (one state scale for
  withholding; the regional scale only in the Renta), rates and scale
  tables, 5 FAQ (FAQPage + WebApplication JSON-LD), dated sources,
  limitations.
- Validation: 39 cases sent on 13 Nov 2026 to the AEAT's own retention web
  service (PRET-R200, documented in espeSWRET_2026.pdf, no login): rate,
  annual amount, base and minimum equal in all 39
  (`tests/fixtures/net-salary-aeat-2026.json`, `tests/net-salary.test.ts`,
  which also holds the algorithm's worked example, hand checks, SS,
  community invariance, monotonic net 8k–200k).

**Baseline:** 0 (no page; the site has no salary or tax tool). Queries:
"calculadora sueldo neto", "sueldo neto 2026", "de bruto a neto", "30000
brutos cuanto es neto", "calculadora nomina" — very high Spain-wide demand
all year, dominated by large finance/HR sites; peaks in January (new pay,
new tables).

**Prediction.**
- Indexed by 27 Nov.
- By 15 Jan 2027: 3,000–15,000 impressions across the three editions,
  mostly es, average position 25–45 for the head terms and top 10 for long
  tail ("30000 brutos cuanto es neto en cataluña", "sueldo neto ceuta");
  CTR 1–3 %.
- Wrong if under 1,000 impressions by 15 Jan, or not indexed by 4 Dec.

**Measure:**
- 27 Nov: indexing (`batch_url_inspection`, three URLs).
- 15 Dec (review date) and 15 Jan 2027: `snapshot.py page sueldo-neto 28`,
  `page sou-net 28`, `page net-salary-spain 28`; GA4 engagement on the
  three paths.

**Upkeep / date guards** (tests fail until done):
- 1 Jan 2027: load the 2027 AEAT algorithm and the 2027 contribution rules
  (Orden de cotización, or the decree-law that sets the bases while it is
  pending) into a `rules-2027.ts`, re-run the AEAT service check (new
  `PER` code), retitle to 2027. Until then the page stays 2026 — in
  December, that is correct.
- If the AEAT publishes a third 2026 version, re-read it and re-run the
  check.

**Change, 13 Nov 2026 (same day, before any measurement; title and
description untouched):** body only. (1) The net-by-gross table now lists
every 1,000 € from 15,000 to 60,000 € (+70k, 80k, 100k), 14 and 12 payments,
compact (no per-amount pages). (2) SMI deduction section `#smi` + note in the
result for gross < 20,048.45 € with withholding: DA 61.ª LIRPF (RDL 5/2026
art. 28; 590.89 € up to 17,094 €, −0.2 per euro above) is applied in the
Renta, not in withholding (AEAT algorithm 10-09-2026 and RIRPF art. 85 leave
it out; the AEAT service withholds 3.06 % / 523.08 € at the SMI). No refund
figure: it depends on the regional scale. (3) Engine fix: exempt pay on a
contract under one year still gets the 2 % floor (0.80 % Ceuta/Melilla/La
Palma), as the AEAT service returns. AEAT check now 44 cases. The SMI page
shows the 2026 SMI net (12/14 payments) with the same explanation.

**Outcome:** _pending_

## 2026-11-13 — Employment calculators: dismissal pay, final settlement (finiquito), unemployment benefit (paro) — new tools, ca/es/en (ships with the deploy; group `pagos` for the pay-dates link)

**What.** Three calculators, Spain-wide, each on its own URL beside the
net-salary calculator (same folders; the hub is built separately):

- `/es/calculadoras/indemnizacion-despido/`, `/ca/calculadores/indemnitzacio-acomiadament/`,
  `/en/calculators/severance-pay-spain/` — unfair (33 days/year; 45 before
  12 Feb 2012 with the DT 11ª caps 720 days / 42 months), objective or ERE
  (20 days, 12 months), end of fixed-term contract (12 days); dates + gross
  annual or daily salary; the three cases side by side.
- `/es/calculadoras/finiquito/`, `/ca/calculadores/quitanca-finiquito/`,
  `/en/calculators/final-settlement-spain/` — last month's days, accrued extra
  payments (yearly or half-yearly accrual, or prorated), unused vacation
  (30 calendar days default, editable), optional dismissal pay and the 15
  days' notice of an objective dismissal.
- `/es/calculadoras/paro/`, `/ca/calculadores/atur/`,
  `/en/calculators/unemployment-benefit-spain/` — LGSS art. 269 duration
  scale, 70 % / 60 % (art. 270.2: unchanged by RDL 2/2024, which reformed the
  subsidios), 2026 limits from IPREM 600 € + 1/6 (560/749 min, 1,225/1,400/1,575
  max = SEPE "Cuantías anuales"), part-time scaling, SS deduction 4.85 % of
  the base. Linked both ways with `/es/guias/cuando-se-cobra-paro-pension/`
  (and its ca/en editions: republish group `pagos` after the deploy).

Engines pure TS in `src/lib/programmatic/employment/` (rules.ts quotes every
figure, read 13 Nov 2026 on BOE consolidated ET/LGSS, SEPE, Orden PJC/297/2026,
RD 126/2026); tests `tests/employment-calculators.test.ts` with hand-worked
cases and SEPE's own example (420 days → 120). Server-rendered example on each
page (works without JS); breadcrumb JSON-LD only (no FAQPage: not eligible).
Sitemap + reciprocal hreflang (x-default en), llms.txt entries.

**Baseline.** 0 impressions, 0 clicks (new URLs).

**Prediction.** High-demand evergreen Spanish queries ("calcular finiquito",
"calculadora paro", "indemnización por despido") are dominated by big
publishers and the SEPE simulator; realistic: indexed within 7 days, first
impressions on long-tail ("indemnización despido antes de 2012 45 días",
"paro 1500 días cotizados cuánto cobro", "finiquito pagas extra semestral")
within 2–3 weeks; by 15 Jan 2027 ≥ 1,000 impressions/week across the nine
URLs, average position < 30 on the ES pages, CTR ≥ 1.5 %. January (dismissals
after the holidays, new IPREM/SMI) should lift demand.

**Date guards.** `RULES_VALID_UNTIL` 2026-12-31: a test fails from 1 Jan 2027
until IPREM (PGE 2027 or prorogation), SMI 2027, the 2027 maximum base and
worker rate (Orden de cotización 2027) and the ET/LGSS articles are re-read
and `RULES_AS_OF` moves. The pay-dates guide keeps its own PAY_DATES_AS_OF.

**Review 27 Nov 2026 (indexing, first queries), 15 Jan 2027 (prediction).
Outcome:** _pending_

## 2026-11-13 — New tool: "Actualizar el alquiler" (rent update with the INE's IRAV and IPC), es + ca + en (deploy only; no publish group)

**Why.** Spain-wide, every-month question ("cuánto me pueden subir el
alquiler", "IRAV octubre", "actualizar renta IPC") with an official answer
that changes on the INE's release day, and a legal regime that changed three
times in 2026 (RDL 8/2026 2 % cap, repealed 30 Apr; RDL 26/2026, one day;
RDL 29/2026 from 8 Oct, validated by the Congress 12 Nov, BOE 13 Nov 2026:
the IRAV cap now covers contracts signed before 26 May 2023 too). Housing
finance queries carry high RPM; nothing on the site targets them.

**URLs.** `/es/calculadoras/actualizar-alquiler/` (primary),
`/ca/calculadores/actualitzar-lloguer/`, `/en/calculators/rent-increase-spain/`.
Static folders; no calculators hub page (sibling calculators are other
agents' work). Sitemap (`rentSitemapEntries`, x-default = en as in the page
head), hreflang through `buildMetadata` translations, llms.txt entry.

**Data.** INE JSON API, read on the server once a day (`revalidate = 86400`,
8 s timeout, `lib/programmatic/rent-update/server.ts`), falling back per
series to the committed snapshot (`snapshot.json`, `npm run rent:snapshot --
build`), which the page then dates:
- IPC290750 "Nacional. Índice general. Variación anual." (base 2025, table
  76125; same rates as the old base-2021 IPC251856 for Jun 2022 – Dec 2025);
- IRAV1 (table 72975), first month Nov 2024, released 2 Jan 2025;
- IGC1 (table 10802), snapshot only, for the 2023 cap.
Release days from the INE's calendar (`PUBLICACIONFECHA_PUBLICACION/8, 654,
417`, flash "Avance" skipped): the month applied is the last one released on
the anniversary (LAU art. 18.1); a month not yet released is never shown —
the calculator says which month will apply and the INE's scheduled day.

**Rules (BOE consolidated texts, read 13 Nov 2026; `rules.ts`).** LAU art.
18 (RDL 29/2026 wording) and DA 11; Ley 12/2023 DT 4 (original and RDL
29/2026 wordings); RDL 6/2022 art. 46 (2023: IGC, 0–2 % band of Ley 2/2015
annex; 2024: 3 %); RDL 7/2019 IPC cap for pre-2023 contracts signed from 6
Mar 2019; RDL 8/2026 art. 2 (22 Mar – 29 Apr 2026, 2 %); LAU art. 4.3
(commercial: the contract, no cap). INE IRAV page quoted for the definition.
Catalonia: the Generalitat's rent-limit pages linked (latest resolutions
TER/3739/2026 and TER/3740/2026, DOGC 9775, 19 Oct 2026); not computed —
it limits the starting rent of new contracts, not the annual update.

**Page.** Server-rendered answer for today (lead from the engine: "si tu
contrato se actualiza hoy… IRAV de octubre de 2026: 2,57 %… 1.000 € pasa a
1.025,70 €"), the calculator with that example worked out (works without
JS), last 12 months of IPC and IRAV with release days, rules by kind of
contract, which month counts, notice (art. 18.2), IRAV definition, Catalonia,
sources, YMYL disclaimer. Title carries the latest figures: "Actualizar el
alquiler: IRAV 2,57 % e IPC 4,9 % de octubre" (changes on each INE release).

**Prediction.** Indexed within 2 weeks; by 15 Dec (after the 15 Dec IRAV
release) ES page with impressions for "irav" / "actualizar alquiler" /
"subida alquiler 2026|2027" queries, top 20 for at least one; January 2027
(annual IPC talk) the biggest month.

**Date guards.** `RENT_RULES_REVIEW_BY = 2027-01-01` (tests/rent-update.test.ts
fails from then until rules.ts is re-read: new decree-laws, the 2027
regime). `LAST_UPDATE = 2027-12-31` (calculator range). Snapshot staleness
does not fail a test (the live read covers it); refresh it monthly with
`npm run rent:snapshot -- check`.

**Review 15 Dec 2026, 20 Jan 2027. Outcome:** _pending_

## 2026-11-13 — "Precio de la luz hoy y mañana (PVPC)", Spain-wide live page (new family, es/ca/en; ships with the deploy, no publish group)

**What.** Today's and tomorrow's PVPC 2.0TD price for every hour, read from
Red Eléctrica and printed in the server HTML: the answer first (cheapest and
dearest hour, daily average, the current hour, today vs yesterday), an SVG
bar chart coloured by 2.0TD period with the current hour ringed, the 24-row
table, a Ceuta/Melilla table (their periods start an hour later), when
tomorrow is published, what the PVPC is and who has it, punta/llano/valle
schedule, what the price includes, the 15-minute market note and the bono
social links. Demand (research_notes/spain-utilities-opportunities-nov2026.md
row 4): "precio luz" 269k + "precio luz hoy" 167k + "tarifa luz" 66k +
"precio luz mañana" 23k + "pvpc" 11k a month (overlapping, ×0.5–1.5), a daily
habit; competitors are comparators/lead-gen and none states when tomorrow's
price is published.

- URLs: `/es/precio-luz/`, `/es/precio-luz/manana/`, `/ca/preu-llum/`,
  `/ca/preu-llum/dema/`, `/en/electricity-price-spain/`,
  `/en/electricity-price-spain/tomorrow/` (sitemap + hreflang, x-default en,
  lastModified = today 00:00 Madrid, changefreq hourly).
- Data: REData `GET https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=<yesterday>T00:00&end_date=<tomorrow>T23:59&time_trunc=hour`,
  series id `1001` ("PVPC"), €/MWh, one value per hour with the Madrid offset
  on each instant (24/day; 23 on 29 Mar 2026, 25 on 25 Oct 2026, both
  checked). Since 1 Oct 2025 the spot series (id 600) has 96 quarter-hours a
  day; the PVPC is still hourly. REData has no PVPC for Canarias/Baleares/
  Ceuta/Melilla (geo_ids 8742–8745 return 400): the e·sios daily file
  `https://api.esios.ree.es/archives/70/download_json?locale=es&date=<d>`
  (open, no token) has `PCB` (Península, Canarias, Baleares — equal to REData)
  and `CYM` (Ceuta y Melilla); used for the CYM column only, when PCB matches.
  Publication: "antes de las 20 h 15 de cada día" (PO 14.12, BOE-A-2023-15276
  §4); REData showed last-update 20:46 on 24 Oct, 28 Mar and 12 Nov 2026.
- Caching: routes `revalidate = 900`; one read per process memoised 5 min
  (failure 1 min) for all six pages + metadata + `/api/pvpc/today/`; fetches
  through the data cache (revalidate 900), 20 s timeout each (first TLS
  connect from the VPS took 5–11 s). Fallback: last good answer in memory and
  in `/srv/catalunyainfo/shared/cache/pvpc-last-good.json`
  (`PVPC_SNAPSHOT_FILE`); a held day is printed only for its own date; no
  day → "no hemos podido leer…" + e·sios link, never a figure.
- Structured data: BreadcrumbList + Dataset (creator Red Eléctrica,
  temporalCoverage = the day shown, dateModified = REE's last-update of the
  series) only when the page prints that day's prices.
- "Avui a Catalunya" (`/ca/avui/`, `/es/hoy/`, `/en/today/`): new item "Quant
  costa la llum avui?" (current hour, cheapest hour, average; client island on
  `/api/pvpc/today/`, CDN 5 min; refuses another day's prices).
- Reuse terms: REE legal notice §5.1 allows publishing its data "for
  information only, and not for commercial purposes", naming REE as source,
  unaltered, with the last-update date. The pages do all three. **Owner
  decision before ads run on these URLs:** ask REE for written authorisation
  or keep them ad-free.
- Tests: `tests/pvpc.test.ts` (committed REE samples in
  `tests/fixtures/pvpc/`: parser, DST days, periods incl. holidays and
  Ceuta/Melilla, cheapest/dearest/average, fallback and restart, fake-fetch
  upstream, routes' revalidate literal, Dataset, brief API).

**Baseline:** 0 (no page; GSC has no PVPC query for the site).

**Prediction.**
- Indexed within 7 days of the deploy (IndexNow the six URLs).
- The head ("precio luz", "precio luz hoy") is authority-bound (Selectra,
  tarifaluzhora, OMIE/REE, big media): expect positions 30–60 in December.
  The long tail ("precio luz mañana", "a qué hora se publica el precio de la
  luz", "pvpc ceuta", "precio luz hoy por horas", Catalan "preu llum avui")
  is where page 1 is possible.
- By 15 Jan 2027: 3,000–15,000 impressions/28 days across the six URLs, CTR
  1–3%, mostly es; "mañana" queries peak 20:00–23:00 (GA4 hour report).
- Wrong if under 1,000 impressions/28 days by 15 Jan, or not indexed by
  27 Nov.

**Measure:**
- 20 Nov: `batch_url_inspection` on the six URLs (rendered HTML must show
  the prices and the chart); Rich Results test: Dataset valid, no errors.
- 27 Nov (review 1): `snapshot.py page precio-luz 14`, `page preu-llum 14`,
  `page electricity-price-spain 14`; check `journalctl -u catalunyainfo` for
  REE timeouts; check the kept file exists and is from today.
- 15 Jan 2027 (review 2): outcome; if the "mañana" page beats the hub on
  CTR, move the "hacia las 20:15" answer into the hub's title.

**Upkeep:** none daily (automatic). Check yearly that series 1001 still exists
and that the PVPC is still hourly (a quarter-hour PVPC would change the
table: the parser rejects a day whose hours do not match, so the page falls
back instead of printing wrong rows). If CNMC changes the 2.0TD periods,
update `periods.ts` (Circular 3/2020 art. 7.3).

**Outcome:** _pending_

## 2026-11-13 — New tool: "Subida de las pensiones 2027" (INE CPI average, LGSS art. 58), es + ca + en (deploy; republish group `pagos`)

**Why.** Research row 3 (research_notes/spain-utilities-opportunities-nov2026.md):
"subida pensiones" index 223–249 from October to January, ~40–60k/month
addressable with "pensiones"/"jubilación"; the top 5 are all estimates (no
Seguridad Social, no calculator). The figure is set by the INE's November CPI
(flash 27 Nov, final 15 Dec 2026) and then the BOE; nobody shows which month
is still missing.

**URLs.** `/es/calculadoras/subida-pensiones-2027/` (primary),
`/ca/calculadores/pujada-pensions-2027/`, `/en/calculators/spain-pension-increase-2027/`.
Static folders; entry `pensions-2027` in `lib/programmatic/calculators/paths.ts`.
Sitemap (`pensionSitemapEntries`, x-default = en), hreflang via `buildMetadata`
translations, llms.txt entry. Pay-dates guide (`/es/guias/cuando-se-cobra-paro-pension/`
+ ca/en) links to it from its pensions section and the page links back:
**republish group `pagos`** after the deploy.

**Data.** INE IPC290750 (annual rate, base 2025) through the rent-update
loader (`fetchLiveSeries("ipc")`, once a day, 8 s timeout) with the
rent-update snapshot as dated fallback; a month is never shown before its
INE release day. On 13 Nov 2026: Dec 2025–Oct 2026 = 2.9, 2.3, 2.3, 3.4, 3.2,
3.2, 3.2, 3.6, 4.3, 4.9, 4.9 → **provisional mean 3.47 % (11 of 12 months)**,
November pending. The engine reproduces 2024 3.8 %, 2025 2.8 % and 2026 2.7 %
(RDL 3/2026) from the same series. States: provisional → flash (hand-typed
`NOVEMBER_FLASH` from the INE press release; not in the API) → final (INE API,
automatic on 15 Dec) → official (`OFFICIAL_2027`, from the BOE). Rounding to
one decimal as RDL 3/2026 ("expresado con un decimal"); the law does not say.
Scenario table "which November figure gives which increase" (pure arithmetic:
3.2–4.3 → 3.5 %, 4.4–5.5 → 3.6 %…), labelled not a forecast.

**Law (BOE, read 13 Nov 2026).** LGSS art. 58.2–58.3 (Ley 21/2021 + RDL 2/2023
wording; the brief said "Ley 20/2021": it is **Ley 21/2021**), art. 62 (PNC at
least the same %), DA 53ª (2027 minimums up to the two-adult poverty line;
amounts by each year's norm). No "paguilla": old LGSS 1994 art. 48.1.2 quoted
("pago único, antes del 1 de abril"), current art. 58 has no deviation payment.
2026 figures: RDL 3/2026 (BOE-A-2026-2548, 4 Feb 2026, validated 26 Feb; RDL
16/2025 not validated, repealed 28 Jan) and RD 241/2026 (BOE-A-2026-6977):
2.7 %, max 3.359,60 €/month, gender gap 36,90 €/month, minimums table (anexo
I), income limits 9.442 / 11.013 €, PNC 8.803,20 €/year (628,80 × 14), rent
supplement 525 €; IPREM 600 €/month (Ley 31/2022 DA 90ª, prorogued; shared
constant with the employment calculators).

**Page.** Answer-first lead (rule, provisional 3,47 %, 1.000 € → 1.034,70 €,
"falta el IPC de noviembre: adelantado 27 nov, definitivo 15 dic"), calculator
(monthly gross, 14 or 12 payments → 2027 monthly/annual and rises; works
without JS), 12-month CPI table with release days and the mean, scenarios,
the law quoted, paguilla, official vs pending, 2026 minimums table, PNC/IPREM,
pay dates link, sources, YMYL "simulación orientativa" + Seguridad Social link.
Title by state: "Subida pensiones 2027: 3,47 % provisional (falta noviembre)".

**Date guards (tests/pensions-2027.test.ts).** From 28 Nov 2026: NOVEMBER_FLASH
must be typed in. From 15 Dec 2026: the snapshot must have November 2026
(`npm run rent:snapshot -- build`). From 1 Feb 2027 (`OFFICIAL_DUE`):
OFFICIAL_2027 (percentage, norm, 2027 minimums, PNC) from the BOE.

**Prediction.** Indexed within a week; impressions for "subida pensiones 2027"
from the 27 Nov flash; top 10 for at least one "subida pensiones 2027" query
by 15 Dec; January 2027 the biggest month.

**Review 1 Dec 2026, 20 Dec 2026, 15 Jan 2027. Outcome:** _pending_

---

## 2026-11-13 — Spain 2027 city pages: 147 more towns (20,000+ inhabitants), each from its 2027 bulletin (deploy; group `calendario-2027-espana`)

**Why.** The calendar long tail already ranks for mid-size cities outside
Catalonia with no other page of the same depth: GSC 31 Oct–13 Nov,
`/festivos/2027/` family 630–1,965 impr./day since 8 Nov at 7.7–9.6
("calendario laboral alcobendas 2027" 61 at 9.1, "calendario laboral
torrelavega 2027" 58 at 8.2, "calendario laboral marbella 2027" 38 at 9.6,
"festivos valdemoro 2027" 38 at 6.7, "calendario laboral pinto 2027" 34 at
6.4). Demand for "festivos <town> 2027" peaks Dec–Jan. Pages existed only
for capitals and 50,000+ towns (129).

**Selection rule** (`src/lib/programmatic/spain-2027/cities-more.ts` header):
every municipality outside Catalonia, Ceuta and Melilla with 20,000–49,999
inhabitants (INE padrón 1 Jan 2025, RD 1117/2025), plus any smaller town named
in a holiday query in GSC 1 Aug–12 Nov 2026 (one: Castilleja de la Cuesta, "es
festivo hoy en castilleja de la cuesta"; other small-town matches were Catalan
towns or "Todos los Santos"). A page only where the community's official 2027
list is out and gives the town's two days; never 2026 days, never guessed.

**What changed.** 147 city pages × es/ca/en (441 URLs), same template and
depth as the first 129 (BOE + regional days, the two local days with the
bulletin and its line, bridges, leave planner preselected, .ics feed,
embed widget), sitemap + hreflang automatic:

| Community | Added | Source |
|---|---|---|
| Andalucía | 58 | BOJA núm. 210, 29.10.2026 (each row also in the Junta's work-calendar API; Lepe: BOJA "10 DEMAYO" kept, API lacks it) |
| Canarias | 20 | BOC núm. 168, 21.8.2026 |
| Murcia | 16 | BORM núm. 171, 27.7.2026 (printed weekdays checked) |
| Galicia | 15 | DOG núm. 204, 26.10.2026 (Xunta open data agrees) |
| País Vasco | 14 | BOB núm. 181, 22.9.2026; BOG núm. 187, 1.10.2026 |
| Illes Balears | 10 | BOIB núm. 122, 29.9.2026 (Menorca included) |
| Castilla y León | 6 | BOP Burgos 145, León 144, Valladolid 129 |
| Extremadura | 4 | DOE núm. 207, 27.10.2026 |
| Asturias | 3 | BOPA núm. 110, 10.6.2026 |
| La Rioja | 1 | BOR núm. 160, 21.8.2026 |

No page: Arcos de la Frontera (not in the BOJA list) and Cangas (the DOG's
19 March is already San José in Galicia; Xunta data has only 30 Aug). Waiting
for their community's 2027 list (no page, `WAITING_TOWNS`): Comunitat
Valenciana 53, Madrid 13, Castilla-La Mancha 10, Cantabria 3, Navarra 3,
Aragón 1 — 83 towns, slugs fixed in advance.

**Baseline.** The 147 towns: 0 impressions (no page; GSC 1 Aug–12 Nov, no
query names them outside Catalonia's own towns). Family: 7–12 Nov
630–1,965 impr./day, 81 clicks, position 7.7–9.6.

**Prediction.** By 15 Dec: ≥ 60 of the 147 pages with impressions; queries
"festivos <town> 2027" / "calendario laboral <town> 2027" for them at ≤ 10
median position; family impressions/day up ≥ 25 % over the 129-page trend at
equal date. Risk to watch: if fewer than 20 pages get any impression by
15 Jan, the wave is thin for Google and goes into `low-demand.ts` (noindex)
at the January review.

**Date guards.** `WAITING_RECHECK_BY` 20 Nov (test fails until the six pending
communities are re-read: DOGV daily, BOA ~20 Nov, BON ~2 Dec, BOC/DOCM/BOCM
~11–12 Dec); a community that flips to "published" in sources.ts fails the
test until its waiting towns become rows. Core `CITIES_RECHECK_BY` 27 Nov
unchanged.

**Measure 1 Dec, 15 Dec, 15 Jan**: `snapshot.py page /festivos/2027/ 14`
and the per-town query pull (scratch `sp27x/pull.py`).

**Outcome:** _pending_

## 2026-11-13 — New tool: "Calculadora de días hábiles" (working days and deadlines with regional and local holidays), es + ca + en (deploy; republish group `holidays`)

**What.** `/es/calculadoras/dias-habiles/` (primary), `/ca/calculadores/dies-habils/`,
`/en/calculators/working-days-spain/`. Two modes: last day of a plazo (N días
hábiles / naturales / meses from the notification) and working days between
two dates. Three rule sets, each from the BOE consolidated text read on
13 Nov 2026 and quoted on the page: administrative (Ley 39/2015 art. 30:
day after notification, Sat/Sun/holidays inhábiles, months to the same day
or the month's last, inhábil last day moves on, 30.6 two places), judicial
(LOPJ 182–183/185, LEC 130.2/133: also August and 24 Dec–6 Jan — added by
LO 14/2022, not LO 1/2025; days only; LEC 135.5 15:00 grace day shown apart)
and job working days (optional Saturdays). Places: all of Spain, each
community, every Catalan town (2026 DOGC local days; 2027 only once the DOGC
order is parsed — council-approved days NOT counted) and the Spanish cities
with a page (2027 bulletin days; 2026 local days where held; Canarias island
days; Navarra 3 Dec). Each result says what is counted for the place.
Engine `src/lib/programmatic/working-days/` (pure, no `Date`), registry
`working-days` in calculators/paths.ts + hub card (holidays group).

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 2:
~40k searches/month flat ("días hábiles", "días naturales", "plazo
administrativo", "calculadora días"), "días inhábiles" peaks in December.
No Spanish tool applies community and local holidays; we hold them.

**Links (body only, no titles changed).** Catalan work calendar guide
(`/es/guias/calendario-laboral-cataluna/` + ca/en, new paragraph after the
leave-planner line: publish group `holidays`), Spain 2027 work calendar hubs
(`/es/festivos/2027/`, `/ca/festius/2027/`, `/en/holidays/2027/`, deploy),
leave planner "more" list (deploy). Sitemap + hreflang (x-default en) +
llms.txt.

**Baseline.** 0 impressions for the three URLs (new).

**Prediction.** By 15 Jan: es page indexed, ≥ 1,000 impressions in 28 days,
"calculadora días hábiles" and "días hábiles <ciudad>" top-20; peak with the
"días inhábiles 2027" December searches.

**Date guards.** `AGE_2027_RECHECK_BY` 31 Dec 2026 (test fails while
`AGE_2027` is null: look for the AGE 2027 calendar of días inhábiles in the
BOE — the 2026 one was BOE-A-2025-23702, 24 Nov 2025 — fill it and an annex
check like `AGE_2026_ANNEX`); `RULES_RECHECK_BY` 13 May 2027 (re-read the
articles, refresh tests/fixtures/working-days/boe-articles.txt);
`COVER_EXTEND_BY` 15 Nov 2027 (add 2028 lists). The DOGC 2027 local order
(~mid-Dec) flows in with the next deploy after `local-2027.json` is updated.

**Measure 1 Dec, 15 Dec, 15 Jan**: `snapshot.py page /calculadoras/dias-habiles/ 14`.

## 2026-11-13 — "Precio de la bombona de butano hoy", Spain-wide (new page, es/ca/en; ships with the deploy, no publish group)

**Why.** Research row 11 (research_notes/spain-utilities-opportunities-nov2026.md):
"precio butano" ~13k/month, peaks Jan (index 149), Mar (144), Nov–Dec
(129–141). Competitors (endesa blog, OCU, press) each cover one revision and
disagree on the rule; none links every BOE resolution. Fact pack:
research_notes/butano-precio-nov2026.md (gitignored).

- URLs: `/es/precio-butano/`, `/ca/preu-buta/`, `/en/butane-price-spain/`
  (sitemap + hreflang, x-default en; lastModified = last revision or tax
  month). Hub card in the calculators hub "live" group right after the PVPC
  card; the PVPC pages link it and it links them back (energía en casa),
  plus fuel and calculators; llms.txt entry.
- Facts (all BOE/INE, read 13 Nov 2026): rule = Orden IET/389/2015 (as
  amended by TED/211/2025; ITC/2608/2009 is superseded): revised every two
  months, effective the **third Tuesday** of Jan/Mar/May/Jul/Sep/Nov, **±5 %**
  cap per revision, butane only since Mar 2025. RDL 25/2026 art. 3: pre-tax
  ceiling **127,7838 c€/kg** (= May 2022, "19,55 euros por envase" on the
  peninsula) until 30 Jun 2027. In force: **123,4447 c€/kg** since 15 Sep
  2026 (BOE-A-2026-19115) → **18,90 €** per 12.5 kg with taxes (Península +
  Baleares: hydrocarbons tax 15 €/t in Nov per RDL 25/2026 art. 14 and INE
  Sep CPI 10.2 %; VAT 21 %); 0 €/t in December (INE Oct CPI 16.1 %, art. 15)
  → 18,67 € at the same pre-tax price. History: 17 resolutions Jan 2024–Sep
  2026, each linked; all published the Monday before (observed, printed as
  practice, not as a rule). Operators with home delivery: BOE-A-2026-13564.
  Bono social térmico from RDL 15/2018 + bonosocial.gob.es. No price is
  forecast; the page prints only the range the rules allow (117,27–127,78).
- Caching: routes `revalidate = 3600`, figures in
  `src/lib/programmatic/butane/data.ts` (no DB, no fetch).

**Date guards (tests/butane.test.ts).**
- From **18 Nov 2026** the test fails until the 17 Nov resolution is one new
  line in `REVISIONS` (or the date in `NO_RESOLUTION` if the BOE publishes
  none). Same every revision (next 19 Jan 2027). On 17 Nov itself, until the
  line is in and deployed, the page says the revision is in force and does
  not call the old price today's.
- From **1 Jan 2027** the test fails until `TAX_PERIODS` gets the 2027
  hydrocarbons tax rate and VAT for butane (no with-tax price is printed for
  an uncovered day).
- 16 Nov (BOE Monday): enter the line, deploy; the page shows "nuevo precio
  desde el martes" until Tuesday 00:00, then switches within the hour.

**Baseline:** 0 (no page).

**Prediction.** Indexed within 7 days (IndexNow the three URLs). Head
"precio butano" is media-bound: positions 15–40 in December; long tail
("precio bombona butano noviembre 2026", "cuándo sube el butano", "próxima
revisión butano", "tope butano 19,55") page 1 possible. By 31 Jan 2027:
2,000–8,000 impressions/28 days (January peak), CTR 2–4 %. Wrong if under
500 impressions/28 days by 31 Jan.

**Measure:** 20 Nov `batch_url_inspection` (rendered price + table);
1 Dec and 25 Jan `snapshot.py page precio-butano 14` (+ preu-buta,
butane-price-spain).

## 2026-11-13 — Two reference pages: "Salario mínimo (SMI) 2027" and "IPC hoy: último dato y calendario del INE", es + ca + en (deploy only; no publish group)

**What.** New hub group "Datos oficiales" (`official`) in the calculators
family, both pages in the registry (`calculators/paths.ts`) so the hub,
"Más calculadoras", sitemap (+hreflang, x-default en) and llms.txt carry them:

- `/es/calculadoras/salario-minimo-2027/`, `/ca/calculadores/salari-minim-2027/`,
  `/en/calculators/spain-minimum-wage-2027/` (lib/programmatic/smi/). SMI 2026
  from RD 126/2026 (BOE-A-2026-3815, 19 Feb 2026): 1.221 €/month in 14
  payments, 17.094 €/year (1.424,50 € in 12), 40,70 €/day, 9,55 €/hour
  domestic work, 57,82 €/day fixed-term ≤120 days. History 2018–2026, every
  figure read from each decree's BOE XML (tests parse three of them). 2027
  status from official documents only: CAASMI report 3 Nov 2026 (+4,9 %,
  1.281 €), Ministry of Labour draft RD in public hearing 5–16 Nov 2026
  (+5,3 %: 1.286 €/month, 18.004 €/year, 42,87 €/day, 10,06 €/h), social
  dialogue 4 Nov; not approved, not in the BOE (BOE open-data search empty,
  13 Nov). No press figure printed. Part-time / 12-vs-14 calculator; "neto
  del SMI" opens the net salary calculator with its existing hash preset
  (`#b=17094&n=14`).
  **The page changes the day the BOE publishes the 2027 decree**: routes
  revalidate hourly and `smi/boe.ts` asks the BOE legislation search, then
  today's BOE summary, and reads the amounts from the decree XML with sanity
  checks (yearly = monthly × 14, daily ≈ monthly ÷ 30, ≥ 2026 and ≤ +25 %);
  if they do not parse it links the decree and prints no figure.
- `/es/calculadoras/ipc/`, `/ca/calculadores/ipc/`, `/en/calculators/spain-inflation-cpi/`
  (lib/programmatic/ipc/): INE API once a day (IPC290750, IPC290752,
  IPC292510 core, IPC292512) + release calendar 8, committed snapshot
  fallback (`npm run ipc:snapshot -- build`). October 2026 (INE 13 Nov):
  4,9 % annual, +0,6 % monthly, core 3,1 %. Last 24 months; calendar rows from
  the INE (next: flash 27 Nov, final 15 Dec; the INE has not published its
  2027 calendar yet, rows appear by themselves). A value is shown only once
  its final release day has come, never one the calendar does not date.
  Links pensions 2027, rent update, SMI.

**Why.** research_notes/spain-utilities-opportunities-nov2026.md rows 5–6:
"smi"+"salario mínimo" ≈ 90k/month (150–200k Jan–Feb, SERP = news with
contradictory figures, no BOE); "ipc" 113k/month (~220k in January).

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Jan 2027: SMI es page in the top 10 for "salario mínimo
2027" / "smi 2027" (≥ 3k impressions in the 28 days after the BOE decree);
IPC es page ≥ 1k impressions/month by the 15 Jan release, position ≤ 15 for
"ipc último dato" / "calendario ipc".

**Date guards.** `STATUS_RECHECK_BY` 1 Dec 2026 (re-read Ministry hearing /
Council of Ministers / BOE); `OFFICIAL_2027_DUE` 15 Jan 2027 (fill
`OFFICIAL_2027` in smi/rules.ts from the BOE decree; the live page already
shows it); IPC snapshot ≤ 62 days old; from 10 Jan 2027 the snapshot must hold
the INE's 2027 calendar.

**Note for the net salary calculator owner.** At 17.094 € (14 payments) the
engine withholds ~523 €/year IRPF; RDL 5/2026 art. 28 (convalidated,
BOE-A-2026-6483) rewrote LIRPF DA 61ª so SMI earners do not pay IRPF. The SMI
page quotes the decree and links the calculator but prints no net figure;
check whether the AEAT 2026 withholding algorithm applies that deduction.

**Measure 1 Dec, 15 Jan, 15 Feb**: `snapshot.py page /calculadoras/salario-minimo-2027/ 28`, `snapshot.py page /calculadoras/ipc/ 28`.

**Outcome:** _pending_

## 2026-11-13 — New tool: "Letras del Tesoro: próximas subastas, último tipo y calculadora", es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/letras-del-tesoro/`, `/ca/calculadores/lletres-del-tresor/`,
`/en/calculators/spain-treasury-bills/` (lib/programmatic/treasury-bills/), in
the calculators registry and hub group "Datos oficiales" (after SMI and IPC),
sitemap (+hreflang, x-default en) and llms.txt.

- Results: the Tesoro Público's own HTML (no CSV/XLS/JSON of the current year:
  the "histórico de subastas" XLSX stops at 2025). Routes revalidate every 3 h
  and parse "Resultado de últimas subastas · Letras" live; a column is only
  accepted if dates are in order and the average/minimum prices equal the Orden
  ECM/2/2026 art. 14 formula for the published rates, else the committed
  snapshot (`npm run letras:snapshot -- build`: latest table + one detail page
  per past auction, all 44 Letras results of 2026, each with its source URL).
  Latest shown: 3 m 2,652 % (10 Nov), 6 m 2,822 % (3 Nov), 9 m 2,936 %
  (10 Nov), 12 m 3,045 % (3 Nov; price 97,014, issue 6 Nov 2026 → 5 Nov 2027).
- Calendar: typed from the Tesoro's 2026 PDF (created 3 Dec 2025; includes Jan
  2027), checked by a test against its pdftotext; requests by 14:00 on the
  "Peticiones" day for Cuenta Directa investors, BdE notice for branch payment
  rules (2 % / 100 % deposit, transfer by 14:00 the working day before).
- Calculator (server-rendered 10.000 € × 12 m, client re-runs): price, paid,
  repaid, gross, TAE-equivalent, savings-scale IRPF (19–30 %, LIRPF 66/76 as
  amended by Ley 7/2024; the Tesoro's own tax page still says 28 % — we follow
  the BOE), BdE 1,5 ‰ fee (0,90–200 €). No retención (RIRPF 75.3.b, AEAT
  manual 2025), art. 96.2.c filing threshold. Neutral: no bank/broker named or
  linked (test allows only official hosts).

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 8:
"letras del tesoro" ≈ 24k/month, Jan–Feb index 144–150; tesoro.es not in the
top 5, stale pages (2016 Q&A, 2023 calendar) rank.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es page ≥ 2k impressions/28 days and position
≤ 15 for "letras del tesoro" / "subasta letras del tesoro" / "calendario
letras del tesoro 2027".

**Date guards.** Each auction: test fails 3 days after a scheduled auction until
the snapshot holds its result (live page already shows it) — next: 1 Dec (6/12
m) → fails 4 Dec; 9 Dec (3/9 m) → 12 Dec. `CALENDAR_2027_DUE` 15 Dec 2026: type
the 2027 PDF into calendar.ts (the server already links it if it appears on
tesoro.es's home). `RULES_REREAD_BY` 15 Jan 2027 (savings scale, BdE fee, the
2027 Orden de creación de Deuda). After 19 Jan 2027 without CALENDAR_2027 the
page says the next auction is not in the published calendar.

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/letras-del-tesoro/ 28`.

**Outcome:** _pending_

## 2026-11-13 — New tool: "¿Cuándo me toca pasar la ITV?" (RD 920/2017 art. 6 + official fee per community), es + ca + en (deploy only; no publish group)

**What.** New hub group "Coche y transporte" (`vehicle`) in the calculators
family; the tool is in the registry (`calculators/paths.ts`, id `itv`) so the
hub, "Más calculadoras", sitemap (+hreflang, x-default en) and llms.txt carry it:
`/es/calculadoras/itv/`, `/ca/calculadores/itv/`, `/en/calculators/itv-spain/`
(lib/programmatic/itv/, components/programmatic/itv/).

- Calculator (pure engine `itv/engine.ts`, tests/itv.test.ts): vehicle
  category + first registration (+ optional last ITV and the expiry it
  replaced) → next due date, the 30-day window that keeps it, the next four
  dates. Server-rendered on a fixed example (car 15 Mar 2019, last ITV 20 Feb
  2025, expiry 15 Mar 2025 → before 15 Mar 2027); days-left only in the browser.
- Rules read in the BOE on 13 Nov 2026, quoted verbatim: RD 920/2017
  (BOE-A-2017-12841) art. 6.1 table (it is in art. 6, not annex I), 6.2
  historic (RD 892/2024), 6.3–6.4, 6.5 30-day rule, 6.9 ten days, 11.2, 11.8,
  12.1 V-19 sticker, 12.2, 14.7 c), 19.1, annex II "Fecha próxima
  inspección"; Ley de Tráfico (BOE-A-2015-11722) art. 76.o grave → 200 €
  (80.1), 100 € paid within 20 days (94); not in the points annex II.
- Our reading, printed on the page: band by age on the day the new validity
  starts (anniversary included); when a stricter band starts inside a
  validity the result warns and points to the report. The 30-day rule is
  not applied to the first ITV (the text says "inspección anterior").
- Fees per community (itv/prices.ts), only from bulletins / regional
  governments / public ITV companies: Cataluña (Ordre IUE/361/2010 maximums,
  DOGC 30.6.2010, sin IVA ni taxa), Andalucía (VEIASA, BOJA 2014/2016),
  Aragón (BOA 31.12.2025), Asturias (BOPA 26.12.2025), Illes Balears
  (Mallorca BOIB 4.4.2020, Eivissa BOIB 25.8.2026), Canarias (BOC 4.2.2026),
  Cantabria (BOC 23.12.2025), Castilla-La Mancha (DOCM 30.12.2025), Castilla
  y León (BOCYL 22.12.2025), Comunitat Valenciana (GVA/SITVAL from 1.1.2023),
  Extremadura (Junta stations, DOE 30.9.2026), País Vasco (BOPV 10.12.2025),
  Melilla (BOME 19.12.2025). "No publicado oficialmente": Galicia, Madrid,
  Murcia, Navarra (2021 base only), La Rioja (BOR unreadable from the
  server), Ceuta. DGT fee 4,18 € as printed by GVA/VEIASA/Melilla tables
  (DGT page itself unreachable from the VPS: re-check).

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 10:
"itv" ~518k/month (mostly station-seeking) + "cita itv" 160k; SERP has
contradictory prices and no per-region table citing official tariffs.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 1 Mar 2027 (before the Jun–Jul peak): es page ≥ 1k
impressions/28 days, top 20 for "cuándo pasar la itv" / "precio itv
[comunidad]".

**Date guards.** `PRICES_REREAD_BY` 1 Feb 2027 (re-read every community's
2027 tariff; most publish Dec–Jan) and `ITV_REREAD_BY` 1 Jun 2027 (RD 920/2017
and Ley de Tráfico). Open: Asturias (itvasa.es), Valencia (sitval.com),
Mallorca (itv.mallorca.es) and La Rioja booking pages refused connections
from the VPS, so no station link printed for them yet; check from a browser.

**Measure 15 Jan, 1 Mar, 1 Jun 2027**: `snapshot.py page /calculadoras/itv/ 28`.

## 2026-11-13 — New tool: "Cuota de autónomos 2026 (y 2027)", es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/cuota-autonomos/`, `/ca/calculadores/quota-autonoms/`,
`/en/calculators/spain-self-employed-contributions/` (lib/programmatic/self-employed/),
in the calculators registry (after net salary) and hub group "Trabajo y sueldo",
sitemap (+hreflang, x-default en) and llms.txt.

- Rules (all read 13 Nov 2026 in the BOE / Seguridad Social): the 15 bands of
  Orden PJC/297/2026 art. 18.1 (BOE-A-2026-7296) = the 2025 tables kept by
  RDL 3/2026 art. 3.4 (BOE-A-2026-2548, convalidated BOE-A-2026-4668) "hasta la
  aprobación de la correspondiente Ley de Presupuestos", max base 5.101,20 €;
  rate 31,50 % (CC 28,30, CP 1,30, cese 0,90, FP 0,10 — arts. 18.2 and 37.5–6 —
  and MEI 0,90). Earnings: LGSS 308.1.c — IRPF net + own cuotas, −7 % generic
  (3 % for art. 305.2 b/e corporate, who also have the 1.424,40 € group-7 floor).
  Tarifa plana: LETA art. 38 ter (12 + 12 months under the SMI 17.094 €;
  24 + 36 special); 2026 total "88,64 €" quoted from the TGSS Import@ss guide
  (80 € + MEI), not recomputed. Regularisation: LGSS 308.1.c 3.ª–4.ª.
- 2027: no official tables (no PGE, RDL or Orden with 2027 bands); page says
  "Pendiente" in all three languages; only the MEI 1 % (LGSS DT 43.ª) is quoted.
- Calculator: server-rendered default (30.000 € income, 6.000 € expenses →
  general band 5, 380,88 €/month), client recompute + URL hash; optional chosen
  base → regularisation estimate (pay/refund), tarifa plana first/extension.
  Links the official Import@ss simulator. YMYL disclaimer.

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 13:
"cuota autónomos" 9k + "cuota autónomos 2026" 2.6k + "tarifa plana autónomos"
2.5k ≈ 14k/month; Jan index 192; competitors print unofficial 2027 drafts.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es page ≥ 2k impressions/28 days, position
≤ 20 for "cuota autónomos 2026" / "tramos autónomos" / "cuota autónomos 2027".

**Date guards.** `STATUS_2027_RECHECK_BY` 15 Dec 2026 (re-read the BOE for a
late-December RDL / PGE / Orden with 2027 bands; fill `STATUS_2027` or move the
date). `RULES_UNTIL` 1 Jan 2027: load rules-2027 (MEI 1 %, tables, tarifa plana)
or state which 2026 rules keep applying and why.

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/cuota-autonomos/ 28`.

**Outcome:** _pending_

## 2026-11-13 — New tool: "Calculadora de baja laboral" (incapacidad temporal), es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/baja-laboral/`, `/ca/calculadores/baixa-laboral/`,
`/en/calculators/sick-leave-pay-spain/` (lib/programmatic/sick-leave/), in the
calculators registry (after unemployment) and hub group "Trabajo y sueldo",
sitemap (+hreflang, x-default en) and llms.txt.

- Rules (all read 13 Nov 2026 in the BOE / Seguridad Social): LGSS arts. 169–176
  (BOE-A-2015-11724, update of 11 Nov 2026), both texts: in force (Ley 6/2024)
  and from 1 Dec 2026 (RDL 31/2026, BOE-A-2026-21872, DF 4.ª.2). Common
  illness / non-work accident: days 1–3 nothing, 60 % days 4–20 (RD 53/1980),
  75 % from day 21 (D 3158/1966 art. 2.1); employer bears days 4–15, INSS/mutua
  from 16 (art. 173.1; pago delegado). Professional: salary on day 1, 75 % from
  day 2. 365 + 180, end at 545 days (arts. 169, 174). Base reguladora: base of
  the month before (D 1646/1972 art. 13) until 30 Nov 2026; from 1 Dec 2026 the
  month before last (new art. 171.2); ÷ 30; professional + overtime/365; max
  base 5.101,20 € (Orden PJC/297/2026 art. 2.1). Special cases: menstruation,
  pregnancy termination / week 39, donation 100 % (Ley 6/2024, SS percentages);
  from 1 Dec 2026 also menopause and gender-violence injuries, all paid from the
  day after (art. 173.1 new; DT 1.ª). IRPF: Ley 35/2006 art. 17.2.a).1.ª.
- RDL 31/2026 not yet convalidated in the BOE (sumarios 22 Oct–13 Nov checked).
- Not in the LGSS: any flexible / part-time return from sick leave; page silent.
- Calculator: server-rendered default (common, 1.800 € base, 30 days from
  1 Dec 2026 → 1.062 €: 432 employer + 630 INSS/mutua), client recompute + URL
  hash, days ⇄ end date, gross-salary helper (÷ 12, capped), optional convenio
  top-up % and start day, day-by-day band table with payer. YMYL disclaimer.

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 21:
"baja médica" 21.7k/month, flat; the 1 Dec 2026 change of the base month is
new and competitors still print the old rule.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es page ≥ 3k impressions/28 days, position
≤ 20 for "calculadora baja laboral" / "cuánto se cobra de baja".

**Date guards.** `CONVALIDATION_RECHECK_BY` 28 Nov 2026 (BOE: convalidación or
derogación of RDL 31/2026; update the reform section). `RULES_UNTIL` 1 Jan 2027
(2027 maximum base for bajas from 1 Mar 2027; re-read LGSS 169–176).

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/baja-laboral/ 28`.

**Outcome:** _pending_

## 2026-11-13 — Two housing tools: "Euríbor hoy" (official monthly figure) and "Calculadora de hipoteca" (with revision), es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/euribor-hoy/`, `/ca/calculadores/euribor-avui/`,
`/en/calculators/euribor-today/` and `/es/calculadoras/hipoteca/`,
`/ca/calculadores/hipoteca/`, `/en/calculators/mortgage-calculator-spain/`
(registry ids `euribor`, `mortgage`; hub group "housing"; sitemap, hreflang,
llms.txt). Code: lib/programmatic/euribor/, lib/programmatic/mortgage/,
components/programmatic/{euribor,mortgage}/.
- Data: Banco de España Boletín Estadístico table 19.1, `be1901.csv` (series
  D_1NBAF472 Euríbor 1 año, D_1T9H0000 IRPH entidades, D_1T9H0010 vivienda
  1–5 años zona euro, D_1T9H0011 IRS 5 años, D_1NBAF572 €STR 1 año,
  D_1T9H0004 deuda 2–6 años; BOE days from D_1TFECHABOE/2/4), read once a day
  (revalidate 86400). A month shows only from its BOE day. Committed snapshot
  (`npm run euribor:snapshot -- build`) checks every value since Jan 2024
  against the BOE resolution text (101 resolutions, all matched on 13 Nov) and
  keeps their BOE-A ids for the links; live CSV only adds months after it.
- Latest shown on 13 Nov 2026: Euríbor octubre 2026 = 3,239 % (BOE 4 Nov 2026,
  BOE-A-2026-23168); septiembre 3,247 %; octubre 2025 2,187 %. IRPH septiembre
  3,189 % (BOE 20 Oct, BOE-A-2026-21866); IRPH octubre due ~18–21 Nov.
- Licence decision: monthly official figures only. The daily Euribor is EMMI
  data (terms of use forbid commercial redistribution without a licence; the
  BdE daily table ti_1_7.csv carries the same EMMI note) — not used. Monthly
  figures: Orden EHA/2899/2011 art. 27.2 (published monthly by the BdE in the
  BOE) + BdE legal notice (faithful reproduction and calculations, citing
  "Banco de España").
- Mortgage calculator: French amortisation in cents (tests to the cent vs a
  Decimal reference: 150.000 € 3 % 25 a = 711,32 €; 200.000 € 2,5 % 30 a =
  790,24 €; variable, mixed, 0 % floor art. 21.4), yearly table, total
  interest; revision calculator (old vs new instalment on today's balance)
  on both pages. Ley 5/2019 arts. 14, 15, 21, 23, 25 and Orden EHA/2899/2011
  arts. 21–22 quoted from the BOE. Example inputs labelled as examples; no
  lender named, no affiliate link; "no es asesoramiento financiero".

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 17:
"euríbor" 89k/month + "hipoteca" 205k + "calculadora hipoteca" 5.6k; SERP held
by lead-gen brokers with stale "hoy" posts and disagreeing provisional
averages; BdE not in the top 5. Highest-RPM topic of the list.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es Euríbor page ≥ 5k impressions/28 days and
position ≤ 20 for "euribor hoy" / "euribor octubre 2026" style queries (the
title carries the month and figure); mortgage page ≥ 1k impressions/28 days.

**Date guards.** `tests/euribor.test.ts`: snapshot > 40 days old fails (next
rebuild after the BOE of early December: run `npm run euribor:snapshot --
build` ~3–5 Dec, commit, deploy); snapshot that misses the month before last
after the 10th fails; `RULES_REREAD_BY` 13 May 2027 (euribor and mortgage
rules: Orden art. 27, BdE notice, EMMI terms, Ley 5/2019).

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/euribor-hoy/ 28` and `/calculadoras/hipoteca/`.

## 2026-11-13 — New tool: "Impuestos al comprar vivienda: ITP o IVA + AJD por comunidad", es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/impuestos-compra-vivienda/`, `/ca/calculadores/impostos-compra-habitatge/`,
`/en/calculators/spain-home-purchase-taxes/` (lib/programmatic/home-purchase-tax/), in the
calculators registry (after rent update) and hub group "Vivienda", sitemap (+hreflang,
x-default en) and llms.txt.

- Second-hand home: ITP at each territory's general rate or scale and the reduced rates /
  bonificaciones for young buyers, large families, disability, habitual/first home, VPO and
  price caps, each with its article and the law's words (quotes mechanically checked as exact
  substrings of the saved official text); conditions the calculator cannot check (income limits,
  mortgage share, time to move in) are printed with the result; benefits that hang on facts it
  does not ask (rural parishes, depopulated towns, victims, single-parent) are listed, never applied.
- New home: IVA 10 % / 4 % special-regime VPO (LIVA art. 91, consolidated 07/10/2026; RDL
  26/2026 rewrote 91.Dos.1.6.º with the same first paragraph and was not convalidated on
  2 Oct 2026) + the deed's AJD per community. Canarias: IGIC 7 / 5 / 3 / 0 % (DLeg 1/2025).
  Basque territories: first delivery of a home exempt from AJD; IVA via Concierto art. 26;
  Navarre via Convenio art. 32.
- Mortgage AJD: lender is the taxpayer (TRLITP art. 29, RDL 17/2018). Notary and registry:
  RD 1426/1989 and RD 1427/1989 scales quoted, no computed totals. Base: reference value
  (TRLITP art. 10.2) explained; the engine uses the typed price.
- Laws read 13 Nov 2026 (BOE consolidated texts unless noted): Andalucía Ley 5/2021; Aragón
  DLeg 1/2005; Asturias DLeg 2/2014; Baleares DLeg 1/2014; Canarias DLeg 1/2009; Cantabria
  DLeg 62/2008 (Ley 5/2026); CLM Ley 8/2013 (Ley 1/2026); CyL DLeg 1/2013; Cataluña DLeg 1/2024
  (+ Ley 11/2026 read in the DOGC); Valencia Ley 13/1997 (Leyes 5/2025, 5/2026); Extremadura
  DLeg 1/2018 (Ley 2/2026); Galicia DLeg 1/2011; Madrid DLeg 1/2010; Murcia DLeg 1/2010
  (Ley 3/2025); La Rioja Ley 10/2017; Navarra DFLeg 129/1999; Álava NF 11/2003, Bizkaia
  NF 1/2011, Gipuzkoa NF 18/1987 (Diputaciones' consolidated texts). Ceuta/Melilla: state
  rates with the 50 % bonificación (TRLITP arts. 11, 31.2, 57 bis); IPSI on new homes: Melilla
  4 % / 0,5 % VPO from the ordinance in BOME 5857 (4-5-2021, no later consolidated text:
  page says confirm with the city); Ceuta 0,5 % on the first sale of new homes (ordinance art.
  33.tres, BOCCE extraordinario 16 of 8-5-2025).
- State rule added for every common-regime territory: first-transfer deed of a VPO with
  calificación definitiva exempt from AJD (TRLITP art. 45.I.B.12.c).
- 21 territories, 188 benefits; 'manual' benefits (rural towns, victims, single-parent,
  surface limits) are listed but never applied.
- Server-rendered default: Cataluña, 250.000 €, second-hand → 10 % = 25.000 € (art. 641-1.1).

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 18: "itp" 36k/month,
flat demand; guiafiscal.es has a 17-region calculator; the others print rates without the law.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 1 Mar 2027: es page ≥ 3k impressions/28 days, position ≤ 20 for
"calculadora itp", "itp cataluña", "impuestos compra vivienda".

**Date guard.** `COMMUNITIES_REREAD_BY` 1 Feb 2027 (as-of.ts; tests/home-purchase-tax.test.ts):
January budget / fiscal-measures laws often change ITP and AJD from 1 January (watch: Castilla
y León announced 2027 cuts with no law yet; Murcia runs a rolled-over 2025 budget; Bizkaia's
2026 tax-measures norm pending in the Juntas Generales; Aragón housing bill). Re-read every
law, regenerate communities-data.ts, move COMMUNITIES_AS_OF / COMMUNITIES_REREAD_BY.

**Measure 15 Jan, 1 Mar, 1 Jun 2027**: `snapshot.py page /calculadoras/impuestos-compra-vivienda/ 28`.

**Outcome:** _pending_

## 2026-11-13 — New tool: "Permisos laborales 2026: días que te corresponden" (reference + calculator), es + ca + en (deploy only; no publish group)

**What.** `/es/calculadoras/permisos-laborales/`, `/ca/calculadores/permisos-laborals/`,
`/en/calculators/spain-paid-leave/` (lib/programmatic/paid-leave/), in the
calculators registry (after sick leave) and hub group "Trabajo y sueldo",
sitemap (+hreflang, x-default en) and llms.txt.

- Rules (read 13 Nov 2026 in the BOE consolidated Estatuto de los Trabajadores,
  BOE-A-2015-11430, update of 21 Oct 2026; LGSS BOE-A-2015-11724, update of
  11 Nov 2026; Seguridad Social birth-benefit page): art. 37.3 (RDL 5/2023 art.
  127.3): marriage / partnership 15 días naturales; relative's serious
  accident/illness, hospitalisation or surgery with home rest 5 días; death
  2 días, +2 with travel; moving house 1 día; public duty, antenatal exams,
  organ-donation steps "el tiempo indispensable"; work unreachable (authorities,
  catastrophe, weather) up to 4 days (RDL 8/2024, Ley 6/2024). Art. 37.9 force
  majeure: hours equal to 4 days/year paid. Art. 37.4 nursing hour to 9 months
  (12 with both parents; LGSS 183–185 benefit). Art. 38.1: ≥ 30 días naturales.
  Art. 48.4 (RDL 9/2025, BOE-A-2025-15741, convalidated BOE-A-2025-17999):
  19 weeks = 6 mandatory + 11 until 12 months + 2 until age 8 (single parent
  32 = 6 + 22 + 4); DT única: the 2 extra weeks for births from 2 Aug 2024,
  requestable from 1 Jan 2026. Paid by the INSS at 100 % of the base
  reguladora (LGSS art. 179.1), IRPF-exempt except Navarre (SS page). Art. 48
  bis parental leave 8 weeks until age 8: suspension (art. 45.1.o), art. 45.2
  "exonera ... de remunerar"; no LGSS benefit → unpaid by law.
- Natural vs working days: only 37.3.a and 38.1 say "naturales"; 37.3.b, b bis,
  c say only "días"; "hábiles"/"laborables" appear nowhere in art. 37.3 (the
  brief's RDL 5/2023 "días hábiles" rule is not in the BOE text). The page says
  so, shows both counts and does not summarise case law. The ET does not say
  when a leave starts either; the calculator asks for the first day.
- Calculator: event + first day → days and last day (consecutive) and, for the
  "días" leaves, the Monday-to-Friday count with national + regional holidays
  (working-days engine; 20 places, ~4 KB; 2026–2027 only, otherwise refused).
  Birth: date of birth → mandatory end, flexible window to the first birthday,
  end if taken in a row, 2 weeks to age 8, nursing to 9/12 months, parental to 8.
  Server-rendered default: 5 days from Thu 3 Dec 2026 → Mon 7 Dec consecutive;
  Fri 11 Dec working days in Madrid (es), Thu 10 Dec in Catalonia (ca/en).
  URL hash, YMYL disclaimer, convenio section.

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 22:
"días de vacaciones" 18.7k + "permiso paternidad" 8.6k + "permisos
retribuidos" 3k a month; competitors still print "16 semanas" and none
separates the legal minimum from the convenio.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es page ≥ 2k impressions/28 days, position
≤ 20 for "permisos retribuidos 2026" / "días por fallecimiento familiar" /
"permiso nacimiento 19 semanas".

**Date guards.** `tests/paid-leave.test.ts`: `RULES_UNTIL` 1 Jan 2027 (re-read
ET arts. 37, 38, 45, 48, 48 bis, LGSS 177–185 and the SS page; move the
example dates and the title year; the working-day count only covers 2026–2027).

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/permisos-laborales/ 28`.

## 2026-11-13 — New tool: "Subsidio por desempleo 2026: quién lo cobra, cuánto y cuánto tiempo" (checker + IMV 2026), es + ca + en (deploy; republish group `pagos`)

**What.** `/es/calculadoras/subsidio-desempleo/`, `/ca/calculadores/subsidi-atur/`,
`/en/calculators/spain-unemployment-subsidy/` (lib/programmatic/unemployment-subsidy/),
in the calculators registry (after unemployment) and hub group "Trabajo y sueldo",
sitemap (+hreflang, x-default en) and llms.txt. Linked both ways with the paro
calculator (page + "menos de 360 días" note) and from the pay-dates guide
(`cuando-se-cobra-paro-pension`, all three editions: needs `pagos` republished).

- Rules (read 13 Nov 2026): LGSS arts. 274–282 and DA 57ª–59ª, BOE consolidated
  text (update 11/11/2026), as worded by RDL 2/2024 (BOE-A-2024-10235), for
  subsidies from 1 Nov 2024. Income test art. 275: own rents of the previous
  month, or family-unit rents per head, ≤ 75 % of the SMI «excluida la parte
  proporcional de dos pagas extraordinarias» = 915,75 € (SEPE prints the same;
  NOT 1.221 × 14 / 12). Amount art. 278: 95/90/80 % of IPREM 600 € = 570/540/480 €;
  over 52 80 % = 480 € (art. 280.4). Duration art. 277.1 (6; RF 24 with a
  120-day benefit, 30 with ≥ 180; under 45 without RF needs a ≥ 360-day benefit)
  and 277.2 (90/120/150/180 days → 3/4/5/6 months, 21 with RF). Over 52 (art.
  280): retirement requirements except age (art. 205.1.b: 15 years, 2 in the
  last 15) + 6 years of unemployment contributions + own income only; until the
  ordinary retirement age (SEPE); SEPE pays retirement contributions (280.9).
  Emigrants DA 57ª 18 months; victims DA 58ª 30/20/10 months. CAE art. 282.3
  (quarters 80…20 % IPREM full time; 180 days). Prison release: special access
  removed by RDL 2/2024 (preamble quoted) → "consulta en el SEPE".
- IMV section (no eligibility calculator): Ley 19/2021 art. 13 + Anexo I and
  RDL 3/2026 art. 2.5 (PNC 8.803,20 €/year, convalidated) → 733,60 € a month for
  one adult, scale 953,68 … 1.613,92 €, monoparental 1.115,07 … 1.775,31 € (all
  equal to the Seguridad Social IMV page, test); CAPI 115 / 80,50 / 57,50 €
  quoted from the Seguridad Social page (the consolidated law still prints
  100/70/50). Links: official IMV simulator, SEPE e-office.
- Checker: server-rendered default (47, 360-day benefit exhausted, partner +
  child, 1.200 € at home → RF, 30 months, 15.300 €), client recompute + URL hash.
  Anything it cannot evaluate (other situations, unknown over-52 records,
  emigrant without the abroad requirement known, 3 earlier RAI) → "consulta en
  el SEPE". YMYL disclaimer; not covered: subsidio agrario / renta agraria,
  fijos discontinuos, subsidies started before 1 Nov 2024, IRPF.

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 12:
"subsidio 52 años" 21k + "subsidio desempleo" 20k + "ingreso mínimo vital" 26k
≈ 67k/month, flat (IMV peaks in January); the SERP has contradictory scales
("480 € sin cambios" vs 570/540/480) and no BOE table in the top 5.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 15 Feb 2027: es page ≥ 3k impressions/28 days, position
≤ 20 for "subsidio desempleo 2026" / "subsidio mayores de 52".

**Date guards.** `SUBSIDY_RULES_UNTIL` 1 Jan 2027 (tests/unemployment-subsidy.test.ts):
re-read IPREM 2027 (PGE or decree-law), SMI 2027 (income limit) and the PNC/IMV
2027 amounts (revaluation decree-law, Seguridad Social page), and LGSS 274–282.
The paro calculator's `RULES_VALID_UNTIL` (31 Dec 2026) guards the shared IPREM/SMI.

**Measure 15 Dec, 1 Feb, 15 Feb**: `snapshot.py page /calculadoras/subsidio-desempleo/ 28`.

**Outcome:** _pending_

## 2026-11-16 — Top-3 push, Barcelona practical + Christmas + EN: the fair's days in the first line, Gran Recapte after the campaign, the weather patch held for 19 Nov (deploy; groups `gran-recapte`, `gran-recapte-links`)

Owner, 16 Nov: "hem de pujar rang, hem de sortir top 3 mínim, millora-ho tot".
Inventory: `snapshot.py gaps 14 120`, `ctr 14 300`, `pages 14 600` and
`page <pattern> 14` (3–16 Nov). Every page in scope at position 3.5–15 with
≥150 impressions was checked against its window in this log. Only what is due
today or has no window was changed; titles and descriptions untouched.

| Page (14 d: clicks / impr. / pos) | Window | Decision today |
| --- | --- | --- |
| `/es/guias/aparcar-barcelona-zona-azul-verde/` (32 / 8,906 / 7.8), CA (17 / 2,171 / 5.6) | ES title 3 Nov (to 1 Dec), CA title 6 Nov (to 4 Dec), body measure 28/30 Nov | No change. Body re-read against areaverda.cat (blue and green "tipos de plazas", Zone 36 news) on 16 Nov: hours, Saturday and beach rules identical to the page. The page already leads with the hours; top results (parclick, highmotor) give less. "horario zona azul barcelona" 66 at 10.6 is authority, not content |
| `/es/guias/tarjetas-transporte-barcelona/` (9 / 5,376 / 8.4) | title 30 Oct (to 27 Nov) | No change. "t casual 1 zona" 92 at **4.4, 0 clicks** and "tarjeta t casual barcelona" 23 at 3.5, 0: the title gives the whole answer (13 € / 25,50 €), the 6 Nov hypothesis. **Proposal 28 Nov:** "T-casual Barcelona 2026: precio por zonas y cuándo compensa", prices kept in the description |
| `/en/guides/barcelona-weather-by-month/` (26 / 7,220 / 7.9) | 11 Nov title, check 18 Nov, window to 9 Dec | Not applied: the 19 Nov plan needs the 18 Nov check first. **Ready patch** `docs/patches/weather-month-h3-19nov.patch` (`git apply`): month H3s "Barcelona weather in January" / "El tiempo en Barcelona en enero" / "El temps a Barcelona al gener" with the old anchor ids, and a 12-month jump line under the lead in ca/es/en; no figure changes. Tests (`batch02`) and tsc pass with it. Then deploy + group `climate` |
| `/en/guides/barcelona-transport-passes/` (23 / 3,292 / 7.5) | 30 Oct, measure 30 Nov | No change |
| `/en/guides/barcelona-metro-hours/` (7 / 3,093 / 7.5) | 6 Nov, window to 4 Dec | No change (the 10–11 Nov jump was strike demand) |
| `/es/guias/horarios-metro-barcelona/` (2 / 1,051 / 11.9) | 28/30 Oct, measure 28 Nov | No change |
| Tourist tax ES (13 / 2,156 / 7.8), EN (27 / 2,439 / 7.3), CA | measure 30 Nov; ranking work "after 30 Nov" | No change |
| La Marató CA (28 / 3,338 / 6.7), ES | 11 Nov title, check 18 Nov | One body sentence only (the Gran Recapte mention, below) |
| Christmas lights ES (31 / 2,040 / 6.9), CA (32 / 1,546 / 6.4), EN | 12 Nov, review 19 Nov | No change. **Cannibalisation:** "cuando encienden las luces de navidad en barcelona 2026" lands on the hub `/es/guias/navidad-en-barcelona/` (216 at 9.0), "encesa llums nadal barcelona 2026" splits between the lights page (166 at 9.0) and `/ca/guies/nadal-a-barcelona/` (137 at 9.7). The hub's title carries the lights date since 12 Nov. **Proposal for the hub's 17 Nov check:** owner URL = the lights page; give the hub a title that is not about the lights (e.g. "Nadal a Barcelona 2026: fires, llums i què fer, dia a dia") and keep the date in its description |
| `/es/mercados-navidad/espinelves/` (17 / 3,049 / 8.5), CA (8 / 1,305 / 9.0); Canyelles ES (40 / 2,591 / 8.2), CA (8 / 699 / 8.5) | 13 Nov title test, review 20 Nov (Espinelves also 27 Nov), "body unchanged" | Not touched: the new lead below is held on these two towns (`LEAD_HOLDS`) |
| Other fair towns: Cardedeu CA (1 / 471 / 7.9) and ES (6 / 225 / 6.4), Caldes ES (17 / 477 / 5.8), Arbúcies ES (8 / 351 / 6.5), Vic ES (7 / 349 / 7.1) and CA (5 / 309 / 6.0), Olot CA (14 / 350 / 4.7), Manresa ES (10 / 201 / 4.8), Ripoll ES (21 / 172 / 5.8), Banyoles CA (11 / 190 / 4.1) | template titles since 1 Nov; no body window | **Changed: lead** (below) |
| Christmas markets guide ES (59 / 2,457 / 7.4), CA (49 / 1,283 / 6.3) | 3 Nov, 13 Nov body | No change |
| Traditions CA (2 / 494 / 6.8), living nativities ES (12 / 439 / 5.9), CA (5 / 224 / 8.6) | review 23 Nov / 1 Dec | No change |
| Gran Recapte ES (40 / 2,529 / 6.3), CA (37 / 1,918 / 6.4), EN (1 / 176 / 4.1) | 4 Nov title (to 2 Dec); refresh due after 14 Nov | **Changed: body** (below) |
| Montserrat EN (`/en/day-trips/montserrat-without-a-tour-from-barcelona/`, 38.7) | 13 Nov upgrade, measure publish + 28 d | No change: the upgrade has had three days |
| Day trips EN (Sitges 520 at 12.1, PortAventura 429 at 8.2, Núria 381 at 7.5, Figueres 179 at 12.5, Andorra 151 at 7.4), nature (bolets, colors: 4.6–5.5) | 28 Oct sprint, measure 28 Nov | No change |

**1. Fair town pages: the first sentence gives the days (deploy, no group).**
The 13 Nov entry found the queries ask for the date ("fira <town> 2026"); the
lead said only "<town> té una fira de Nadal amb data oficial aquesta
temporada". Now `townDatesLine` opens the lead: "Fira de Nadal i del Torró
Artesà de Cardedeu 2026: del divendres 11 al diumenge 13 de desembre, Centre
de la Vila." (es/en alike; several fairs as a list, Barcelona's three included —
its `SNIPPET_HOLDS` covers only title and description). Tense-free, from the
page's own dates; the confirmation note still follows. No title, description
or other block changed. Canyelles (08043) and Espinelves (17063) keep the old
lead until 20 Nov (`LEAD_HOLDS`; a test fails from 21 Nov: after the review,
empty the list, deploy, log). Event JSON-LD checked: name, start/end, Place
with PostalAddress, URL only when it is the organiser's own; valid.
*Prediction:* by 30 Nov, at equal position, the changed towns' CTR rises on
"fira <town> 2026" queries (Google quotes the first line for date queries);
read `page fires-de-nadal 14` and `page mercados-navidad 14` without the two
held towns. Revert the lead if their combined CTR falls at equal position.

**2. Gran Recapte after the campaign (groups `gran-recapte`, then
`gran-recapte-links`).** Re-read 16 Nov: granrecapte.org home, press and
donation pages (Bizum 33596 and 900 898 076 still listed), transparency (2025
figures unchanged; no 2026 results), acatbal.org/el-gran-recapte/ ("Durant la
campanya i fins a mitjans de desembre, també es poden fer donacions
econòmiques a través del web"). The lead is past tense ("va ser / fue / took
place on Friday 13 and Saturday 14 November"), then what can still be done
(online until mid-December, Bizum, phone), then "no 2026 results yet". The
volunteer sentences keep their 4 Nov reading date (`GRAN_RECAPTE_FIRST_READ`).
AS_OF 16 Nov. New guard: `GRAN_RECAPTE_RESULTS_RECHECK_BY` 30 Nov. The
mentions on La Marató (volunteering section) and the markets guide (tip) were
present-tense ("que també busca voluntaris"): now past, with the online
donation line. Titles and descriptions untouched (4 Nov window; the title
does not state a false fact). **Proposal 2 Dec**, when the window ends: a
title about the results or "Gran Recapte 2027" once the organisers publish.

**Not done:** no 2026 Gran Recapte figures (none published; the 2025 tonnage
still disagrees between granrecapte.org and acatbal.org); no lights re-read
(due 18–20 Nov); no parking, transport, metro or tourist-tax body change (all
inside measurement windows that close 27 Nov–4 Dec).

**Review:** 20 Nov (lead hold, with the Canyelles/Espinelves title test),
30 Nov (fair leads, Gran Recapte results guard).

**Weather patch, decided 18 Nov 2026:** the 18 Nov check keeps the EN title (CTR 0.3 → 0.4 %, position 7.3 → 8.6, under the
1.5 revert threshold), so **apply `docs/patches/weather-month-h3-19nov.patch` on 19 Nov**. `git apply --check` passed on 18 Nov
on top of the 18 Nov changes, which do not touch `climate.ts`. Then deploy and publish `climate`, and IndexNow the three
weather URLs. Baseline for the patch is the EN page on 12–16 Nov: 11 / 2,596 / 0.4 % / 8.6 ("barcelona weather by month" 167 at
10.4, "august" 149 at 9.3, "temperature by month" 133 at 9.8, "january" 115 at 9.6). Read it on 26 Nov and 9 Dec with
`snapshot.py page barcelona-weather-by-month 7`, by query and at equal query.

## 2026-11-16 — 17N rail strike: answer first with the official minimum services, the description carries them, 19N and 23N sections; strikes hubs answer "mañana" and each day of the week (deploy; group `strikes`)

**Observation.** GSC 14–16 Nov (`snapshot.py page huelga-trenes 3`): the 17N
pages took 15,974 impressions at position 6.6–7.1 with 1.1–2.0 % CTR
("huelga renfe 17 noviembre (2026)" 2,583 at 6.8–7.4, "huelga adif 17
noviembre" 518 at 7.7, "huelga 17 noviembre" 455 at 6.9, "servicios minimos
renfe 17 noviembre" 32 at 5.7, "huelga renfe 17 noviembre 2026 servicios
minimos" 35 at 4.7). The description (13 Nov) promised "servicios mínimos …
red por red" before any figure was out, and the lead opened with the union
list. Spain hub `/es/guias/huelgas-espana/`: "huelga 20 noviembre 2026" 842 at
9.5, "el viernes hay huelga" (+variants) ~420 at 7.6–9.0, "huelga 19
noviembre (2026)" ~170 at 6.0–10.5, 0–1 clicks each. Catalan hub
`/es/guias/huelga-hoy-cataluna/`: "huelga mañana / mañana hay huelga / hay
huelga mañana" ~340 at 4.5–6.2, 0 clicks. Top results checked by WebSearch
(16 Nov): news pages, most still on older strikes; none carries the 12 Nov
Ministry figures with Iryo/Ouigo and Rodalies together.

**What changed.**
- `/es/guias/huelga-trenes-17-noviembre/` (+ ca, en; `strike-rail-17n.ts`):
  lead now "Sí: el martes 17 de noviembre de 2026 hay huelga de trenes…" with
  the official figures in the first lines (Cercanías 75/50, Bilbao and San
  Sebastián 50/25, MD 65 %, AVE/LD 72 %, Iryo 70 %, Ouigo 65,38 %, Rodalies
  66/33; metro, bus, tram and FGC not called out) and "el jueves 19 … con
  servicios mínimos aún pendientes". When `STRIKES_AS_OF` is the 17th the lead
  and the first FAQ say "Hoy, martes 17…" (no relative day before that, test).
  New H2 "Jueves 19 de noviembre: huelga en Adif (circulación)" (SCF only, no
  call at Renfe/Iryo/Ouigo, minimum services "pendientes" with the Ministry
  list; `ADIF_MS_PUBLISHED` kept in step with the Spain entry by a test). The
  "Después" H2 becomes "Lunes 23 de noviembre: huelga de maquinistas (SEMAF)"
  with the entry's scope and "por confirmar". FAQ: first answer carries the
  figures; "¿Qué servicios mínimos hay en Renfe el 17?"; new "¿Hay huelga de
  trenes el 23 de noviembre?" from the 23N entry.
- **Description only** (title untouched): "Sí, el martes 17 hay huelga en
  Renfe y Adif (0 a 23.59 h). Servicios mínimos: Cercanías 75 % en hora punta y
  50 %, Media Distancia 65 %, AVE 72 %." (ca leads with Rodalies 66/33; en
  likewise); "Hoy martes 17, …" variant on the 17th. Inside the 28-day window
  of a page first published on 13 Nov: allowed because the old text promised
  figures that did not exist yet and the event ends on the 19th, so a 28-day
  window cannot be measured anyway; one field changed.
- Spain hub (`strikes-spain.ts`): one FAQ per remaining day of the week with
  a strike ("¿Hay huelga el viernes 20 de noviembre?" → student strike, not a
  labour strike; 17 and 19 with status and minimum services), from the entries.
- Catalan hub (`strikes.ts`): when a strike falls on the day after the as-of,
  the lead opens "Mañana, martes 17 de noviembre, hay huelga (fuentes
  oficiales revisadas el lunes 16…): …" with its Rodalies minimum services.

**Prediction.** 17–18 Nov (`snapshot.py page huelga-trenes 3`): ES CTR on
"huelga renfe 17 noviembre*" ≥ 3 % (from 1.2–1.3 %), position ≤ 6; Spain hub
"el viernes hay huelga / huelga 20 noviembre" CTR > 1 %; Catalan hub "huelga
mañana" ≥ 1 click a day.

**To do on 17 Nov after 00:00.** Re-read the sources, move `STRIKES_AS_OF` /
`STRIKES_SPAIN_AS_OF` to 2026-11-17 (the 17N page then says "hoy", the
Catalan hub's "Mañana" line drops), deploy, publish `strikes`. When the
Ministry publishes Adif's resolution (17/19): Spain entry text + `ADIF_MS_PUBLISHED`.

**Outcome:** _pending_

## 2026-11-16 — 29N: town pages answer "censo electoral <town>" and "mesa electoral 29N <town>"; candidates guide answers "qué partidos se presentan"; ES how-to-vote lead answers its title (body only; deploy, groups `candidates`, `voting`)

**Observation.** GSC 10–16 Nov. `/es/elecciones/<town>/` (6,672 impressions,
4.9 %, position 5.6): the visible queries are "censo electoral <town>"
(Badalona 16 at 7.1, Santa Coloma 15 at 6.7, Ripollet 11 at 7.5, Cornellà 10
at 6.3, Mataró 9 at 4.6, Rubí, Viladecans, Reus, Vilanova) and "mesa electoral
(29n) <town>" (Viladecans 12 at 7.8, Santa Coloma 8 at 9.0, Cornellà 6 at 9.0,
Cerdanyola, El Vendrell, L'Hospitalet 4 at 13), almost all 0 clicks; the
section was "Qué es el censo electoral" (a definition, the town's figure in
the second sentence) and the polling H2 "Dónde votar el 29N en <town>".
Candidates ES (4,394 impressions, 11.6 %, 5.0–6.7): "partidos politicos en
cataluña 2026" 17 at 6.6, "partidos que se presentan en cataluña" 11 at 6.4,
"partidos políticos catalanes 2026" 7 at 7.4, "elecciones cataluña
candidatos" 29 at 5.4 (0 clicks), "candidatos a los que puedo votar viviendo
en barcelona" 12 at 9.0. How-to-vote ES: "cuando son las elecciones en
cataluña" 309 at 7.7 (0.3 %), "cuando hay elecciones en cataluña" 151 at 7.8,
"proximas elecciones cataluña" 148 at 6.7: the 11 Nov title asks "¿Cuándo
son las elecciones en Cataluña?" but the lead answered it in its last sentence.

**What changed (no title or description).**
- Town pages, ca/es/en (`elections/model.ts`, `polling.ts`): census section
  retitled "Censo electoral de <town>" / "Cens electoral de <town>" /
  "Electoral roll (censo electoral) of <town>", first paragraph gives the
  roll at the 2023 general election and the 2023 municipal one (snapshot
  counts) and points to the census card and the INE's mesa/local lookup for
  where to vote; polling H2 → "Dónde votar el 29N en <town>: locales y mesas electorales".
- Candidates guide, ca/es/en: one paragraph with the proclaimed Congress lists
  per province (11/10/10/13; BOE-A-2026-23103, Interior CERA ballots re-read
  13 Nov), no party named (the page's rule); FAQ "¿Qué partidos se presentan
  a las elecciones generales en Cataluña?" and "¿A qué candidatos puedo votar
  si vivo en Barcelona?".
- How-to-vote ES lead now opens "Las próximas elecciones en Cataluña son las
  generales del domingo 29 de noviembre…; las siguientes, las municipales,
  previstas para el 23 de mayo de 2027, y no hay elecciones al Parlament
  convocadas" (ca already did). Confound: the 11 Nov title test's day-7
  review (18 Nov) now also sees this lead; read it as title + lead.

No poll figure added anywhere (blackout from 24 Nov 00:00).

**Prediction.** By 27 Nov (`snapshot.py page /es/elecciones/ 7`, filter
"censo electoral" / "mesa electoral"): those queries ≥ 2 % CTR and position
≤ 6; candidates ES "partidos … cataluña" queries ≤ 5; how-to-vote ES "cuando
son las elecciones en cataluña" CTR ≥ 1 %.

## 2026-11-16 — Holidays family: 15 Nov interim readings, the 6 Nov day-7 check (8 Dec reverted), and three gap fixes in the body (deploy; groups `shops`, `puente-diciembre-espana`)

Owner, 16 Nov: "hem de pujar rang, top 3 mínim, millora-ho tot". Scope: holidays, calendars, bridges, shops and school pages (ca/es/en).
GSC 3–16 Nov (`snapshot.py pages 14 600`, `ctr 14 300`, `gaps 14 120`, `page <path> 14`, plus a query×page split before/after a date;
15–16 Nov partial). Every title window in this family is still open: the 11 Nov retitles review 18 Nov, the Spain bridge and
answer-first 19 Nov, school Spain 20 Nov, work-calendar and town titles to 1 Dec. **So no title or description changed here except
the one revert the 6 Nov rule orders.**

### 1. Overdue readings (recorded, no action unless stated)

- **6 Nov sweep, day-7 check (was due 13 Nov), 7 and 8 December date pages.** Named queries, per day, 24 Oct–6 Nov vs 7–16 Nov:
  - `/es/festivos/dia/7-diciembre-2026/`: 1.1 → 3.4 clicks, 56 → 138 impressions, position 6.3 → 5.3. **Keep** "… Dónde sí" / "… On sí ho és".
  - `/es/festivos/dia/8-diciembre-2026/`: 0.4 → 0 clicks on 6 → 66 impressions, position 4.8 → 7.3 (14 d: 3 clicks / 1,183, 0.3 %).
    Both revert conditions hold (clicks fell at higher impressions; position −2.5 with no CTR gain). **Reverted** to the bare question,
    es "¿Es festivo el 8 de diciembre de 2026 en Cataluña?" and ca "És festiu el 8 de desembre de 2026 a Catalunya?" (CA had ~1
    impression a day and no signal of its own; reverted with ES because it was the same hypothesis). The queries are national
    ("8 de diciembre es festivo" 149 at 7.6, "8 diciembre festivo" 120 at 8.6); the body already says "y en el resto de España".
    Deploy only. **Review 30 Nov** (`snapshot.py page /es/festivos/dia/8-diciembre-2026/ 7`), read at equal distance from the date.
- **3 Nov CTR sweep, 15 Nov interim** (14 d to 16 Nov; baselines in that entry):
  - Town family `/es/festivos/` 1,013 clicks / 48,612 impr. (2.08 %, baseline 1.7 %); `/ca/festius/` 812 / 23,274 (3.49 %).
  - Lleida es 9 / 1,450 (0.6 %, was 0.2 %) at 7.5; Terrassa es 5 / 795 (0.6 %, was 0.4 %) at 7.3; Badalona es 9 / 881 (1.0 %, was 0.5 %)
    at 6.9; Girona ca 1 / 199 (0.5 %, was 0.2 %), es 5 / 369 (1.4 %) at 6.8; Sant Boi ca 2 / 255 (0.8 %, was 0 %), es 2 / 142 (1.4 %).
    Small gains, every page still at 7–8. Ranking, not CTR, as the 13 Nov queue says: read again on 1 Dec, then work the body.
  - The family dipped to position 13.4 on Sat 14 Nov and recovered on the 15th (7.6). `/es/festivos/barcelona/` reads 32–53 on 14–16 Nov
    on 16–133 impressions a day. URL Inspection 16 Nov: indexed, self-canonical, crawled 13 Nov, Breadcrumbs + Dataset valid. Not a
    fault on our side. Its "hoy es festivo en barcelona" demand fell after 11N. Re-read on 20 Nov with complete days.
- **3 Nov holidays head pages, 15 Nov reading.** ES work calendar 17 / 2,818 (0.6 %), page position 23.4. That number comes from the
  Spain-wide head terms ("calendario laboral" 59 at 49, "festividades" at 85). The Catalonia 2027 queries hold at 8.7–10.3
  ("calendario 2027 catalunya con festivos" 36 at 8.7). CA work calendar 6 / 279 (2.2 %) at 10.8. ES "es festivo hoy" 1 / 369 at 24.8
  (was 1,450 / 14 d on 5 Nov): its "hoy es festivo en cataluña" impressions went to the date and town pages. No change; 1 Dec as planned.
- **3 Nov shops and ES bridge, 15 Nov reading.** Superseded by the 11 Nov retitles (day 7 = 18 Nov, not touched).
  Numbers for that review:
  - shops ES 167 / 11,913 (1.4 %) at 6.2, CA 20 / 1,300 (1.5 %), EN 11 / 495 (2.2 %);
  - Catalan bridge ES 235 / 13,241 (1.8 %) at 6.1, CA 16 / 1,093, EN 0 / 154 at 4.6.
- **For the 19 Nov Spain-bridge review (not acted on).**
  - `/es/guias/puente-diciembre-espana/` per day: 1,618 named impressions at 7.1 (7–11 Nov) → 112 at 14.6 (12–16 Nov), clicks 56.6 → 0.8.
  - Demand fell too. Over the same split the 7 Dec date page went 158 → 114 at equal position, and the Catalan ES bridge page
    965 → 180 at 6.8 → 7.4. The 8–11 Nov peak was a news-driven spike.
  - The Spain page's position loss (7 → 15) starts on the day of its 12 Nov retitle and answer-first switch. The 19 Nov reviewer
    should weigh a revert of the ES title on position, not only on CTR, although the revert rule as written does not cover that.

### 2. Gaps fixed (body and links only)

| Page (group) | Gap (GSC 3–16 Nov / competitors) | Change |
| --- | --- | --- |
| `/es/guias/tiendas-abiertas-festivos-cataluna/` + ca, en (`shops`) | A new cluster appeared on 14–15 Nov (2,061 and 3,092 impr./day). "cuando empiezan a abrir las tiendas los domingos" 365 at 7.4, "cuando abren las tiendas los domingos" 229 at 9.4, plus 92, 83, 49, 47 and 46 variants, all at 6–11 with 0 clicks. The page answered only "qué domingos". The leading answer elsewhere (barcelonaurbana) gives "el próximo domingo es el 29 de noviembre". The guide never linked the Spain-wide shops page. | First H2 (after the verified callout, before the date table): "¿Cuándo empiezan a abrir las tiendas los domingos en Navidad?" / "Quan comencen a obrir les botigues els diumenges per Nadal?" / "When do shops start opening on Sundays for Christmas?". It answers 29 Nov first (except Gironella, Martorell, Salt), then 6, 13, 20 and 27 Dec and Tuesday 8. It adds the ten-a-year rule, 3 Jan 2027 as the first day of 2027, and a link to the Spain-wide page. Every fact was already on the page (Ordre EMT/77/2025, Resolució EMT/4342/2025, Ordre EMT/89/2026). Lead, title and description are unchanged. |
| `/es/guias/tiendas-abiertas-diciembre-espana/` (linked from `shops` and `puente-diciembre-espana`) | URL Inspection 16 Nov: **"Discovered – currently not indexed", never crawled**. Its only referrers were its own ca/en editions. Meanwhile the national shop queries land on the Catalan guide. | It is now the owner of the Spain-wide December shop queries. It is linked from the shops guide (above) and from the Spain bridge page (below) in all three languages. Nothing on the page itself changed. |
| `/es/guias/puente-diciembre-espana/` + ca, en (`puente-diciembre-espana`) | 14.8k impressions, the family's largest page. It had nothing on whether shops open on the bridge, a sub-answer the news results carry. It did not link the 2027 leave planner or the working-days calculator. | New H2 "¿Abren las tiendas en el puente de diciembre?" (ca/en alike), built from the Ministry table already in `shops-spain-december.ts` (`bridgeShopsParagraph`). It gives the regions where shops may open on Sunday 6, Monday 7 and Tuesday 8, plus a caveat: Catalan, Extremaduran and Navarrese councils add their own days, and in Barcelona and most Catalan towns the 8th is one of them. Madrid is free; Canarias goes by island. It ends with the link to the Spain shops page. In "¿Y en 2027?" a sentence now links `/es/festivos/2027/aprovechar-vacaciones/` and `/es/calculadoras/dias-habiles/` (ca/en paths alike). |
| 2027 date pages with a 2026 twin (`/es/festivos/dia/7-diciembre-2027/` etc., deploy) | Cannibalisation: "el 7 de diciembre es festivo en cataluña" took 100 impressions at 3.7 on the **2027** page against 107 at 2.3 on the 2026 page, and "el 7 de diciembre es festivo en barcelona" took 32 at 6.2 there. Searchers want the coming one. | Right under the 2027 answer: "¿Buscas el de 2026? [¿Es festivo el 7 de diciembre de 2026 en Cataluña?]" (ca "Busques el 2026?", en "Looking for 2026?"). It is built by `sameDayIn2026()` in `holidays/paths.ts` and appears only where the same day has a 2026 page (1 Nov; 7, 8, 24, 25, 26 and 31 Dec). The 2026 page owns the query; the 2027 page hands it on. |

**Structured data.** Live check on 16 Nov of 25 pages in the family (both bridges, the 4 shops pages, Barcelona es/en, the hub, the 7 and
8 Dec 2026 and 7 Dec 2027 date pages, `/es/festivos/2027/` and Vigo, the planner, días hábiles, the work calendar, the CA school
calendar, the Andalucía and Spain school pages, "es festivo hoy", local holidays and puentes 2027).
- Every page has a BreadcrumbList.
- FAQPage appears only where the page prints the same FAQ.
- No Event markup anywhere. All JSON-LD parses.
- Nothing to fix.

**Not done, with reasons.**
- No title or description touched beyond the 8 Dec revert: every page is inside a window (see the dates above).
- School community pages, e.g. Andalucía at 0.3 % at 8.1 on 3,426 impressions, Madrid at 0.2 % at 10.0: their body changed on 13 Nov
  and the review is on 20 Nov.
- Spain 2027 city pages ("festivos vigo 2027" 136 at 10.8, Alcobendas at 9.3): their first line changed on 13 Nov, measured on 20 Nov and 1 Dec.
- The DOGC 2027 municipal shop-opening list is not out as far as search shows (precedent 27 Nov 2025). The guide's "a 5 de
  noviembre" lines stay true and were not re-dated, because the DOGC itself was not re-read today.
- Competitor SERPs: the web search tool is US-located and returns Colombian results for "puente de diciembre 2026" and "festivos puente
  diciembre". The gaps above come from our own query data and the Spanish results it did return.

**Prediction.**
- Shops ES: the "cuándo empiezan a abrir … domingos" queries move from 7–10 to ≤ 6, with CTR > 2 % in the week before 29 Nov.
- The ES Spain shops page gets crawled and indexed by 25 Nov, and shows for "tiendas abiertas 8 de diciembre" style queries outside Catalonia.
- The 2027 7 Dec page's share of "el 7 de diciembre es festivo en cataluña" falls below a third by 1 Dec.

**Review 25 Nov.** Run `batch_url_inspection` on `/es/guias/tiendas-abiertas-diciembre-espana/`, then `snapshot.py page
tiendas-abiertas-festivos-cataluna 7` for the "cuando empiezan" queries, and the 7 Dec query split by page. **Review again 2 Dec.**

**Go-live.** Deploy first: the date pages and the `bridgeShopsParagraph` helper ship with the code. Then publish `shops` and
`puente-diciembre-espana`, and send IndexNow for the two shops URLs and the Spain bridge URLs (ca/es/en).

**Outcome:** _pending_

---

## 2026-11-17 — What visitors search on the site: town 2027 days (Tona, Monistrol and 7 more towns without 2026 days), site search answers directly, farmers' markets guide, bridge/Carnival/Easter body wording (deploy; groups `pont-desembre`, `carnaval`, `setmana-santa-2027`, `mercats-pages`)

Owner, 17 Nov: "mira què volen els nostres visitants, millora-ho tot". Evidence: GA4 site search (28 d) and GSC 14–16 Nov.

**1. Council-approved 2027 days.** "festiu local de monistrol de montserrat 2027" was searched 3 times on the site, and
"festivos adicionales Tona" too.
- Tona: Ple of 25 Jun 2026 (17 May, 30 Nov). The town page gives the days in the line under the lead and first in the 2027
  section, labelled "aprovats per l'Ajuntament (ple …), pendents de l'ordre del DOGC", with the acta linked.
- Monistrol de Montserrat had **no page** (404). The 2026 order lists it with "proposta no formulada". Its Ple of 25 Jun 2026
  proposes 20 Jan and 26 Jul 2027.
- New: a council left out of the 2026 order whose 2027 days are known gets a page at the usual town URL
  (`unlistedTowns` in data.ts, `UnlistedTownPage.tsx`, ca/es; in the sitemap; linked from the hub list and the comarca page).
  The 2027 days and their label come first, then the source, the 2027 table and the 2026 fact. 8 towns: Cerdanyola del Vallès,
  Barberà del Vallès, Torelló, Argentona, Santa Eulàlia de Ronçana, Gironella, Calaf, Monistrol de Montserrat. Their titles are
  new: "Festius locals <town> 2027", with no window to respect.
- Top-200 towns by GSC impressions (28 d) without council data: 50. Added 5 (Tona, Cambrils, Cassà de la Selva, la Selva del Camp,
  Santa Susanna). 39 have no official 2027 publication found (AOC actes, BOP, web). Skipped 5: Tarragona and Santa Perpètua (acta
  lists the item without dates), Santa Coloma and Terrassa (council site 403, press only), les Franqueses (days per nucleus).
- The new listed towns are in `COUNCIL_2027_METADATA_HELD`: the town-title window runs to 1 Dec. Body only.
- Read date for all entries: 17 Nov. Quotes are in the comments above each entry.

**2. Site search.** The CMS search sorted only by date and saw no programmatic page. "metro barcelona" put the Spain strikes
hub first, "FGC" a strike page, "monistrol de montserrat" the Christmas lottery, "mercats agraris de Catalunya" nothing.
- New `search-shortcuts.ts`: in-memory "Pàgines directes" above the results, with no external service. It covers town holiday
  pages (+ unlisted towns), Spain 2027 cities, weekend zones, calculators, and curated synonyms (metro/TMB, FGC, Rodalies/Renfe,
  T-casual, strikes, Montserrat, Sitges, Girona, Tarragona, bridge, Easter, Carnival, shops, farmers' markets).
- `searchEntries` is now ranked: title A, excerpt B, body C, `ts_rank_cd`. When every word together matches nothing, it falls
  back to any word.
- The search pages are noindex, so this is no SEO change; it is measured in GA4 `view_search_results` followed by a page view.

**3. New guide: farmers' markets and the Venda de Proximitat label** (ca/es/en; group `mercats-pages`).
- Source: the Departament d'Agricultura producer list (Excel, 2,410 producers at 2 Jul 2026), its Q&A PDF (5 May 2026), the logo
  guide and DL 21/2025. No official list of markets exists, so no market days are printed; producers' personal data stays off the
  page.
- Re-read the Excel by 17 Feb 2027 (test). Review 8 Dec with `snapshot.py page mercats-de-pages 14`.

**4. Body wording on pages at 5–8 (titles untouched: every one is in a window, reviews 18–19 Nov).**
- `/ca/guies/pont-desembre-catalunya/` (+es/en). "pont de la purissima 2026": 480 impressions at 5.3, 0 clicks (14 d). The lead and
  the first key fact now name it: "El pont de la Puríssima del 2026 té, a Catalunya, un únic festiu: el dimarts 8 de desembre (la
  Puríssima o Immaculada)" (es "Purísima", en "(la Puríssima)"). The rest of the lead is unchanged.
- `/ca/tradicions/carnaval-catalunya/` (ca only). "carnestoltes 2027" 69 at 6.9, "quan es carnestoltes 2027" 33 at 6.1,
  "dijous llarder 2027" 11. The lead says "El Carnestoltes (Carnaval) 2027 … (Dijous Gras o Dijous Llarder)", and the H2 is now
  "Quan és el Carnestoltes 2027". es/en unchanged (their queries say "carnaval").
- `/ca/guies/setmana-santa-2027-catalunya/` (+es/en). "dia de la mona 2027" 54 at 4.1. The key-facts label is now "Dilluns de
  Pasqua (dia de la mona)". The lead is unchanged: it already answers "quan és".
- Confounder: the 11 Nov title change on the bridge and Easter pages (day-7 review 18 Nov) and the answer-first review (19 Nov).
  These are wording changes inside the first screen; read them together with those reviews, not apart.

**Prediction.**
- "pont de la purissima 2026" gets a first click and moves to ≤ 5 by 25 Nov.
- "carnestoltes 2027" moves to ≤ 5 by 1 Dec.
- Monistrol and Tona: their 2027 queries show impressions on the town pages by 1 Dec.

**Review 25 Nov and 1 Dec.** Run `snapshot.py page pont-desembre-catalunya 7`, `page carnaval 14`, `page santa-2027 7`,
`page monistrol 14`, and GA4 site search on the same queries.

**Go-live.** Deploy first (new routes, search, the guide's module). Then publish `pont-desembre`, `carnaval`,
`setmana-santa-2027` and `mercats-pages`. IndexNow for the 16 unlisted town URLs, Tona's two and the 3 guide URLs.

## 2026-11-17 — New pages: "¿Hay huelga el jueves 19 / el viernes 20 de noviembre?", es + ca + en; SMU doctors' strike and Bizkaia cleaning strike added to both hubs (deploy; groups `huelgas-espana`, `strikes`, `huelga-19-20n`)

**Observation.** GSC 14–16 Nov: "huelga 20 noviembre 2026" 877 impressions at 9.6 (0.5 % CTR), "el viernes hay huelga" 259 at 8.9,
"este viernes hay huelga" 91, "huelga renfe 19 noviembre" 491 at 8.4, "huelga 19 noviembre 2026" 436 at 6.6, all landing on
`/es/guias/huelgas-espana/`, whose first screen is the whole week. Sources re-read on 17 Nov (~10:30 UTC) found two strikes the
hubs did not list: the Sindicato Médicos Unidos doctors' strike (08:00 16 Nov – 08:00 28 Nov, every region's public health service +
INGESA; preaviso of 4 Nov; Generalitat order of 13 Nov; marches on 19 Nov 18:00 in 20 cities) and ELA's Bizkaia building-cleaning
strike (17–20 Nov; Ministry air resolution of 13 Nov for Bilbao airport). Madrid's state schools are on an open-ended strike since
14 Oct (CCOO/UGT, CSIF; CSIF stoppages 9–11 h and 17–19 h on 20 Nov).

**What changed.**
- New `/es/guias/huelga-19-noviembre/`, `/ca/guies/vaga-19-novembre/`, `/en/guides/spain-strike-19-november/` and
  `/es/guias/huelga-20-noviembre/`, `/ca/guies/vaga-20-novembre/`, `/en/guides/spain-strike-20-november/`
  (`strike-days-1920n.ts`). First line answers "¿Hay huelga el jueves 19 / viernes 20?" with who, where, hours and minimum
  services; 19: no Renfe call (Adif SCF only), SMU marches table; 20: students (whole school day, from 3.º ESO), "¿hay clase?".
  Tense from `STRIKES_SPAIN_AS_OF` (before / "Hoy" / past).
- Spain hub: new entries `huelga-medicos-smu-2026-11-16`, `huelga-limpieza-bizkaia-2026-11-17`; the student entry now says the
  whole school day; "Día a día" line under the week table links both day pages (until their day passes); the doctors FAQ starts
  with the SMU strike. Title and description code untouched (the description lists the week's labels, so it changes with the data).
- Catalan hub: new entry `vaga-metges-smu-2026-11-16`; the paragraph under the answer links the day pages; ranges of 3+ days print
  as "des del … fins al …". 17N page: links both day pages.
- `STRIKES_AS_OF` / `STRIKES_SPAIN_AS_OF` 2026-11-17 with VERIFIED = AS_OF again (the 17N timer branch is merged).

**Prediction.** By 23 Nov (`snapshot.py page huelga-19-noviembre 5`, `huelga-20-noviembre 5`): the day pages rank ≤ 6 for
"huelga 19 noviembre" / "huelga 20 noviembre 2026" with CTR ≥ 3 %; the hub's CTR on those queries rises above 1 %.

**Review 23 Nov.** After the 20th the pages switch to past tense by themselves only when the as-of moves; past 1 Dec, consider
noindexing them or leaving them as records.

**Outcome:** _pending_

## 2026-11-17 — AI-search readiness and trust: complete llms.txt, Organization `sameAs`, methodology on the calculators hub, trust pages describe the real workflow (deploy; groups `editorial-policy`, `about-page`, `corrections-page`)

**Observation.** "huelga renfe": 1,680 impressions 20 Oct–17 Nov on `/es/guias/huelga-trenes-17-noviembre/` at 3.8 (9 clicks),
plus 277 + 277 + 159 on its `#servicios-minimos`, `#quien-convoca` and `#cercanias` fragments at 10.1 with 0 clicks: the passages
are shown (AI Overview / jump links) and answered in place. GA4 28 days to 17 Nov: AI Assistant channel 546 users, 666 sessions
(2.3 %, engaged 49 %). Caddy access logs 14–16 Nov: OAI-SearchBot 4,602 requests (3,087 × 200, 1,399 × 304), GPTBot 1,702
(1,691 × 200), PerplexityBot 1,667 (1,627 × 200), ChatGPT-User 741, Claude-User 135, Applebot 240, MistralAI-User 67,
DuckAssistBot 64, meta-webindexer 4,743; the 404s under "ClaudeBot", "Perplexity-User" and "CCBot" are scanners probing `.env`
files with spoofed agents, not those crawlers. curl with 12 AI/search user agents on 17 Nov: 200 on a guide, `/llms.txt` and the
about page (Cloudflare lets them through; robots.txt is ours, `*` allows all, no AI group). llms.txt listed only the 100 most
recently published guides per language (`listEntries` caps a call at 100): 13 of the 102 Spanish guides in the sitemap were
missing, among them the zona azul/verde guide (3,654 impressions 11–17 Nov), the 2026 work calendar, transport cards and the
tourist tax; its summary still said "Catalonia" only, and it named no trust page. `SITE.sameAs` was empty although the WhatsApp
channel exists and names catalunyainfo.com back. The about page and editorial policy said "nothing is published automatically"
and "everything goes through human review before publication"; the corrections page promised "a second person reviews it". The
site names one person, its text and code are drafted by AI agents, live data and timed strike switches publish on their own.

**What changed.**
- `/llms.txt`: every published guide (paged, deduplicated by URL); new summary (Spain-wide strikes, holidays, calculators, live
  data; every variable figure from the official source with its reading date); two families it lacked (Spain 2027 work calendar
  es/ca/en; Spain strikes hub); new section "About this site and how we verify" (about, author page, editorial policy, sources,
  corrections, contact, WhatsApp channel). `lib/seo/llms.ts`, `app/llms.txt/route.ts`; tests in `llms-and-metadata.test.ts`.
- Organization JSON-LD `sameAs`: the WhatsApp channel only (`WHATSAPP_CHANNEL` in `lib/site.ts`, read by `lib/share/channel.ts`).
  The founder's profiles stay on his Person node.
- Calculator `WebApplication` nodes (net salary, self-employed, sick pay, subsidy, paid leave): `publisher` = the Organization @id.
- Calculators hub (es/ca/en): "Cómo hacemos las calculadoras" section linking the editorial policy.
- Editorial policy (ca/es/en): new section "Calculadoras: cómo las hacemos y qué no son" (general rule from the BOE or regional
  bulletin, article and reading date cited, cases not covered; checked against the authority's own algorithm where one exists, e.g.
  net salary vs the Tax Agency's withholding calculation; yearly rules expire in code and a test fails until re-read; estimate, not
  advice). AI section rewritten to what is true: AI assistants draft much of the text and code under the founder's rules; AI is never
  a source; dated facts carry a re-read test; live data updates automatically and is not reviewed each time; the founder sets the
  rules and answers for the site; generated images labelled. Lead names the calculators. `verifiedAt` 2026-11-17.
- About (ca/es/en): AI paragraphs to the same effect; lead and "what we do" name the calculators and live data. The author page
  reuses these words (code-rendered: changes on deploy). `verifiedAt` 2026-11-17.
- Corrections (ca/es/en): "a second person reviews it" → "we check it again from scratch against the official source and reply in
  writing with the reason". New publish group `corrections-page`.
- Test `institutional-pages.test.ts`: no trust page may promise per-page human review, "published automatically" or a second
  reviewer; about and editorial policy must disclose AI drafting and automatic live data.
- Facts: SMI 2027 draft table caption said the hearing "is" open after 16 Nov while the lead said "was" (live page); now the same
  switch as the lead. New `tests/fact-consistency.test.ts` ties the copies of SMI 2026, max/min contribution base 2026, IPREM
  shares and subsidy amounts (incl. the calculators hub card) to their source modules. No other disagreement found in 18 facts.
- Titles and descriptions: untouched.

**Prediction.** By 15 Dec: GA4 AI Assistant sessions per 28 days above 666 (same window length); OAI-SearchBot and ChatGPT-User
fetch at least 5 of the 13 guides llms.txt now adds (access log); "catalunyainfo" brand queries unchanged or up.

**Review 15 Dec.** `snapshot.py audience 28` (AI Assistant row), access-log count of OAI-SearchBot/ChatGPT-User hits on
`/es/guias/aparcar-barcelona-zona-azul-verde/`, `/es/guias/calendario-laboral-cataluna/`, `/es/guias/tarjetas-transporte-barcelona/`,
`/es/guias/tasa-turistica-barcelona-cataluna/` (and ca/en twins). No revert rule for the trust wording: it states facts.

**Go-live.** Deploy (llms.txt, JSON-LD, hub, SMI caption, author page). Publish `editorial-policy`, `about-page` and
`corrections-page` only after the owner has read the new AI wording.

## 2026-11-17 — Programmatic families audit for AdSense: 680 thin or finished variants out of the index (rules in `low-demand.ts`), two template blocks cut (deploy only; no publish group)

**Why.** The AdSense review is pending and rejects "low-value content" and scaled content abuse; the programmatic families are the
largest page count and also large traffic assets. Each family was measured on uniqueness and demand before deciding (skills
programmatic-seo and seo-audit, house rules first: no data added that we do not already hold from the official sources).

**Method.**
- Uniqueness: ~20 live pages per family (stratified by impressions: top, middle, bottom), `<main>` only (header, footer, nav,
  scripts out), the page's own place name replaced by a placeholder so swapped-name sentences count as template; 5-word shingles;
  a shingle is template when it appears on ≥ 30 % of the other sampled pages. "Unique" = share of words covered only by
  page-specific shingles. Scripts and samples: session scratchpad `pseo-audit-a82c-scripts/` (uniq.py, simulate.py).
- Demand: GSC per page, 28 days 2026-10-21..2026-11-17 (and 90 days), live sitemap of 17 Nov (3,413 URLs).
- One bar for every page decided on data: **noindex only with 0 clicks and < 10 impressions in the 28 days.** The past event
  (11N) is decided on its after-event days instead.

**Families (indexed = in the sitemap on 17 Nov; impressions / clicks of the indexed pages, 28 d).**

| Family | URLs | Indexed | Impr. / clicks | Unique (median page-specific words) | Decision |
| --- | --- | --- | --- | --- | --- |
| Town holidays ca/es `/ca/festius/<t>/`, `/es/festivos/<t>/` | ~1,860 | 664 | 94,729 / 2,281 | es 17.0 % (402 of ~2,450), ca 19.1 %; the noindexed ones 12.0 % | Keep. Trim the 34-link "¿Es festivo…?" block to the next 12 dates (→ ~18.8 %). Noindex `/es/festivos/ponts/` (0 in 90 d; the 11 Nov script skipped every slug "ponts"). The 9 zero-impression indexed pages are the councils added today (Monistrol, Cerdanyola…): kept. |
| Town holidays EN `/en/holidays/<t>/` (since 30 Oct) | 29 | 29 → 15 | 634 / 9 | 13.3 % (median 10.7 %), the lowest | **Noindex 14** (0 clicks, < 10 impr.; 51 impr. between them, at positions 2–17: low demand, not low rank). |
| Comarca holidays | 86 | 14 | 496 / 10 | 44.2 % | Keep; date block trimmed too. |
| Date pages `/…/dia/<d>/` (Catalonia) | 102 | 102 → 99 | 28,740 / 937 (es 25,301 / 877) | 48.5 % | Keep; **new rule: out of the index 14 days after the date** (1 Nov 2026 page: 5,242 impr. on the day, 14/day ten days later). 1 Nov ×3 leave now, 11 Nov ×3 on 25 Nov. |
| Spain 2027 cities `/es/festivos/2027/<c>/<city>/` | 828 | 828 → 292 | es 13,163 / 125; ca 107 / 2; en 409 / 8 | 65.5 % (885 words; BOE + regional bulletins) | ES: keep (147 towns live since 13 Nov; 15 Jan rule of 13 Nov stands). **CA: rule `spain-2027-ca`**, 274 of 276 out. **EN: rule `spain-2027-en`**, 262 of 276 out; kept the 14 with a click or ≥ 10 impr. (Marbella, Mazarrón, Bilbao, Ibiza, Palma…). |
| Spain 2027 communities and days | 57 + 81 | 138 → 52 | es 540 / 2 and 993 / 7; ca+en 239 / 3 | 43 % / 55 % | ES keep. CA/EN in the two rules (Catalonia's own page kept; 4 more kept: 3 on a click, 1 on 12 impr.). The ca/en day pages also competed with Catalonia's `/ca/festius/dia/<d>-2027/`, `/en/holidays/day/<d>-2027/`. |
| Election towns | ~1,920 | 912 (ca 485, es 397, en 30) | 94,076 / 3,892 (+ 5,133 / 299 on the 1,012 noindexed) | indexed 41.7 %, noindexed 31.1 %, EN 55.7 % | **No change** (owner decision on re-indexing; 29N in 12 days). EN: 15 of 30 under 10 impr. — re-read after 29N. |
| Christmas fairs | 92 | 92 | 16,556 / 430 | 31.6 % (231 of 740) | Keep all (season starts; 19 zero-impression pages are mostly new or re-read on 13 Nov). The ~200-word method note moved off the town pages to the hub (#ci-xmas-guide) with a two-sentence pointer (→ ~38.5 %). |
| Fuel (place, comarca, province, chain) | 148 | 0 | (2,403 / 11 before 11 Nov) | 45.7 % (live prices) | No change: noindexed since 11 Nov, re-index the top ones after AdSense approval (owner). |
| Reservoirs | 27 | 27 | 2,139 / 5 | 42.6 % (live ACA figures) | Keep (small, unique official data). |
| Rodalies lines | 38 | 38 | 4,744 / 43 | 25.6 % (station tables shared between lines count as template) | Keep (live notices + station list per line). |
| Weekend zones | 22 | 22 | 1,229 / 18 | 36.1 % | Keep. |
| 11N strike city pages | 43 | 43 → 3 | 288,426 / 17,222, **all before 13 Nov**; since then 0 clicks/day, ~250 impr./day at ~9 for "¿cuándo es la próxima huelga?" | 41.5 % (4,400 words each) | **Rule `strike-11n-cities`**: the 13 cities × es/ca/en + the ES Spain page (0 impr. ever) out. Kept: main 11N guides, EN Spain page and city index, CA Spain page. The strikes hub answers the residual queries. |
| Calculators | 54 | 54 | 1,561 / 27 (live since 13 Nov) | 91 % | Keep. |

**What changed (code).**
- `src/lib/seo/low-demand.ts`: `LOW_DEMAND_RULES` (pattern + `keep` list: `spain-2027-ca`, `spain-2027-en`,
  `strike-11n-cities`), `expiredDatePage` (date pages 14 days after their date), 15 paths added to the list (14 EN towns +
  Ponts); `LOW_DEMAND_AS_OF` 2026-11-17. `isLowDemandPath` covers all three, so robots meta, sitemap, share bar and the widget's
  attribution follow. Sitemap 3,413 → 2,733 URLs (simulated on the 17 Nov sitemap).
- `scripts/low-demand.py`: the "ponts" bug fixed; English town pages read with the 0-clicks / < 10 bar (`[days]` argument).
- Town and comarca pages: `DateQuestions upcoming={12}` + "Todas las fechas" link to the hub's list (the hub and the date pages
  still list every date). Fair town pages: `GuidanceShort` instead of `Guidance` (the hub keeps the full note; each page keeps its
  own sources list).
- Hubs already link every family's top-15 pages by clicks (checked: festivos/festius, holidays EN, 2027 hub, fairs, calculators,
  reservoirs, Rodalies, weekend, elections), so no hub link was added.
- Not changed: titles, descriptions, election pages, fuel, AdSense/consent/verification code. Hreflang still lists noindexed
  alternates (ignored by Google; the Spain-wide clusters' x-default is the EN edition): follow-up, drop low-demand alternates in
  `buildAlternates` and the family sitemap builders together with their tests.

**Baseline (28 d to 17 Nov).** Groups taken out: ca/en Spain 2027 622 pages, 421 impr., 0 clicks; EN towns 51 impr., 0 clicks;
11N 40 pages, 0 clicks 13–17 Nov. Families kept: town holidays ca/es 94,729 / 2,281 (CTR 2.4 %), date pages 28,740 / 937, fairs
16,556 / 430, Spain 2027 ES 13,163 / 125 + 1,533 / 9.

**Prediction.**
- By 1 Dec: GSC coverage shows the 680 as "Excluded by noindex tag"; site clicks lose < 5/day from them (0 in their last 5 days).
- Town pages ca/es: family position and CTR within ± 0.3 / ± 0.3 pt of the baseline on 1 Dec (the trimmed block is below the
  fold); upcoming date pages keep their impressions (they stay linked from every town page).
- Fair town pages: no position loss on "fira de nadal <town>" queries by 1 Dec.

**Confounders.** 12 Nov answer-first first group includes the 11N city pages (review 19 Nov): they had no organic clicks from 13 Nov,
so that review reads the main 11N guides and hubs. 16 Nov fair first-line change (the method-note cut is further down the page).
Seasonal rise of holiday and fair demand from late November.

**Review.** 1 Dec (`snapshot.py families 14`, `page /es/festivos/ 14`, `page mercados-navidad 14`, GSC coverage for 10 sample
URLs per rule). **10 Dec = `LOW_DEMAND_REVIEW_BY`** (test fails): re-read the list and both `keep` lists on December data with
`scripts/low-demand.py 28`; a noindexed page that clears the bar leaves the list. 15 Jan: Spain 2027 ES rule of 13 Nov. After
29N: EN election town pages (15 under the bar) to the owner.

**Go-live.** Deploy only (all pages concerned are code routes or rendered on request; deploy.sh purges Cloudflare). No publish
group, no IndexNow (the URLs leave the sitemap).

## 2026-11-17 — Technical SEO audit of the live site: hreflang clusters without noindex editions, FAQ markup = visible questions, Christmas fairs two clicks deep, calculators linked from town pages (deploy only; no group; no title or description touched)

**Observation.** `npm run site:audit` (extended today: sitemap + news sitemap + llms.txt + every linked page, 4 requests in flight,
browser UA) crawled 5,911 pages on 17 Nov ~12:20 UTC (3,413 sitemap URLs, 2,498 noindex low-demand pages). Clean: 0 broken internal
links, 0 internal links to redirects, 0 orphans, 0 noindex or non-canonical URLs in the sitemap, 0 indexable pages missing from it,
canonical = self and one H1 everywhere, 0 invalid JSON-LD, 0 images without alt, 0 mixed content, OG/Twitter complete, html lang and
hreflang/sitemap agreement 100 %, llms.txt 394/394 URLs live and indexable, median response 264 ms. Defects:
- **hreflang to noindex editions:** 400 sitemap URLs (2,506 pages in all) listed a low-demand (noindex) sibling as an alternate, in
  the HTML and in the sitemap's xhtml:link: the low-demand list is per language (e.g. `/ca/eleccions/pineda-de-mar/` indexed,
  `/es/elecciones/pineda-de-mar/` noindex). Families: election towns 232, holiday towns 151 (English editions included), comarques 17.
- **FAQPage not visible:** 12 Spain-2027 day pages (Jueves/Viernes Santo, Lunes de Pascua, Corpus; es/ca/en) marked up
  "¿Es festivo el Jueves Santo de 2027?" while the H1 reads "… de 2027 (25 de marzo)?".
- **Click depth:** the Christmas fairs hubs at 3 and their town pages at 4 (84 sitemap URLs) since the homepage strip of seasonal
  tools left (12 Nov); the legal index (`/ca/legal/`, `/es/legal/`, `/en/legal/`) linked from nowhere reachable.
- **Calculators as an island:** 14 of the 19 Spanish calculators had no link from outside the calculators family (hub + "More
  calculators"); GSC URL inspection on 17 Nov: finiquito, hipoteca and the EN net salary calculator "URL is unknown to Google";
  the sitemap was last downloaded on 13 Nov 00:34 (resubmitted today 12:41 UTC).
- `JsonLd.tsx` escaped `<` with `"<"`, which in TS source is `<` itself (a no-op): a `</script>` in any string value would have
  closed the element.

**What changed.**
- `lib/seo/metadata.ts` `indexableCluster` / `indexableSitemapLanguages`: noindex (low-demand) editions are left out of every hreflang
  cluster, in the HTML and in the sitemap; a low-demand page lists no alternates (it keeps its self canonical); an x-default that
  pointed at a noindex edition falls back to en, then ca, then the page.
- `spain-2027/day-copy*.ts`: the first FAQ question is the H1 as printed.
- Footer: "Fires de Nadal / Mercados de Navidad / Christmas markets" (fairs hub) from 2 Nov to 6 Jan (the homepage's SEASONAL
  window; `lib/nav/footer.ts`); the "Legal" heading links the legal index.
- Town holiday pages (ca/es/en) and Spain 2027 city pages: one line to the working-days calculator with the place picked
  (`#p=<place>`), next to the leave planner's.
- `JsonLd.tsx`: `jsonForScript` escapes `<`, U+2028, U+2029.
- Not touched (inside windows): 59 titles over 65 characters, all in families changed on 13 Nov (Spain school calendars, review
  20/27 Nov; calculators, review 15 Dec; PVPC EN) and 14 calculator descriptions cut with "…" at 165 characters.

**Baseline (GSC 21 Oct–17 Nov).** `/es/mercados-navidad/` 37 pages 10,163 impressions 2.43 % CTR; `/ca/fires-de-nadal/` 36 pages
7,455 impressions 3.00 %; `/es/calculadoras/` 16 pages 1,272 impressions 1.26 %; `dias-habiles` a handful of impressions, 0 clicks.

**Prediction.** By 15 Dec: `site:audit` shows 0 hreflang-target-not-indexable, 0 jsonld-faq-not-visible and no sitemap URL deeper
than 3 clicks; URL inspection finds every calculator indexed; the fairs town pages' last crawl is within 7 days.

**Review 15 Dec** (`npm run site:audit`, `crawl-gap.py out.json urls.txt` on the 50-URL sample, `snapshot.py families 28`).

**Outcome:** _pending_

## 2026-11-17 — Measurement events, accessibility audit (axe + keyboard) and lab CWV on 15 templates (deploy only; no publish group)

**Analytics.** Tracking plan and owner steps in `docs/ANALYTICS.md` ("Tracking plan"). New events through `track()` (consent
first): `calculator_use` (first result change by the visitor, once per tab session per tool; 21 tools), `whatsapp_channel_click`
(`link_context` article_box/daily_box/footer), `internal_search` (term length + results count; the term already reaches GA4 via
enhanced measurement's `view_search_results`), `outbound_official_source_click` (host only; source lists + official domains),
`ics_subscribe_click` (`method` apple/google/download). `share` (= share_click) and `useful_feedback` (= page_feedback) were live
already and keep their names. The AI-referral channel is a GA4 admin setting: GA4's default group already has "AI Assistant"
(chatgpt.com 624 sessions in 28 days); the custom-group steps for the leftovers and for `utm_source=share` are in ANALYTICS.md.
**Owner, before deploy:** register the event-scoped custom dimension `calculator_id`.

**Accessibility.** axe-core 4.11 (Playwright Chromium 130 on the VPS, production, consent decided) on 15 templates × phone
(Pixel 7) and desktop (1366 px) × light and dark = 60 runs: **0 violations**. 18 more templates on the phone, light + dark:
3 rules. Plus a 320 px reflow check, the consent card and the open phone menu (0 violations, nothing changed there), and a
keyboard walk of the 21 calculator pages (focus order, visible focus, sticky header, results driven by keyboard).

| Severity | Issue | Where | Fix |
| --- | --- | --- | --- |
| Critical | Two code boxes with no label (axe `label`) | 2027 widget page (`EmbedBuilder.tsx`) | named by their headings (`aria-labelledby`) |
| Serious | Below 378 px the wordmark ran over "CA"; at 320 px the menu button sat 14 px off-screen and every page scrolled sideways (WCAG 1.4.10) — screen widths 320–377 px are about a quarter of mobile users in GA4 | header, every page | wordmark scales with the viewport and gives way (`globals.css`), language links and menu never shrink; mark only below 342 px |
| Serious | Two stacked source links 18 px tall with no gap (axe `target-size`, 2.5.8) | ITV fee table | 8 px between them |
| Moderate | Ticket selector: results change silently (4.1.3), title h3 before any h2 (axe `heading-order`) | transport cards guide | `role="status"` line with the cheapest ticket; h2 |
| Moderate | "Thanks" after "Was this useful?" lands in a live region created with it, so it is usually not announced | every article | status paragraph mounted from the start |

Not changed: Chrome's own date-picker button has no site focus ring (browser UI); axe "incomplete" contrast items are the
aria-hidden alert arrows and the PVPC chart labels (computed ≥ 4.5:1). Guards: `tests/a11y-fixes.test.ts`.

**Performance (lab only; no field data from the server).** Two methods on the VPS against production, 17 Nov 13:50–14:30:
(a) Lighthouse 12.8.2 mobile, 15 templates × 6 runs, CPU multiplier 2 instead of 4 because the VPS benchmark index was 250–1,190
(other agents building; Lighthouse's own warning). Its simulated LCP is 2.9–4.2 s everywhere, but the **observed** LCP equals FCP
in 74 of 78 runs on 13 templates, and in 0 of 12 on the town and election pages, where the card paints after hydration: Lantern counts every
font and JS request that starts before the paint, so read (b) instead. (b) Playwright with DevTools throttling, the 13 Nov setup (412×823 @1.75, 1.6 Mbps / 150 ms, CPU ×2,
cache off), 3 runs per state, first visit (card up) and decided (necessary-only cookie) interleaved:

| Template | LCP first visit (median, range) | LCP decided | LCP element (first visit) | 13 Nov, first visit |
| --- | --- | --- | --- | --- |
| Town holidays `/ca/festius/sabadell/` | 3.84 s (3.57–5.15) | 2.40 s (2.02–2.63) | **consent card text** | 3.5–4.5 s (Barcelona, es) |
| Election town `/ca/eleccions/sabadell/` | 3.70 s (2.71–3.77) | 1.90 s (1.72–2.05) | **consent card text** | 3.6–4.5 s (es) |
| Spain 2027 city `/es/festivos/2027/madrid/madrid/` | 2.21 s (2.06–2.37) | 1.96 s | lead paragraph | 2.6–3.7 s, CLS 0.062 → now 0 |
| Home `/es/` | 2.24 s (1.95–2.53) | 1.92 s | lead paragraph | 1.9–3.0 s (/ca/) |
| Net salary calculator | 2.57 s (1.80–3.92) | 2.08 s | lead paragraph | — |
| Work calendar guide | 2.64 s (2.52–3.24) | 2.44 s | lead paragraph | — |

CLS 0–0.003 on all 15 templates (Lighthouse) and 0 in (b) except one first-visit run on the town page (0.028). TTFB 70–180 ms
(Cloudflare). Page weight 360–475 KB, home 640–670 KB. JS: ~165–180 KB transfer on every page; each calculator adds only its own
9–16 KB chunk (all three languages' copy included; splitting it would save ~5 KB, not worth it). The legacy-polyfill chunk is
`noModule`. Long tasks are React/Next hydration (react-dom and router chunks), not site code: TBT after FCP 130–460 ms decided,
up to ~1.2 s on a first visit, noisy on this host.

**Change:** home and section hubs ask phones for thumbnail-sized card images (`EntryCard` `phoneThumb`, `sizes` …10rem instead of
92vw). Home, four hub thumbnails (104 px squares): 117 KB → 37 KB at DPR 1.75 and 265 KB → 73 KB at DPR 3 (Playwright,
production images, HTML rewritten). No LCP change expected (the thumbnails are below the fold and lazy); fewer bytes on a phone.
Test `tests/hub-thumbnails.test.ts`.

**Owner decision (numbers only, nothing changed):** on town-holiday and election-town pages the consent card's paragraph is the
LCP element on a first visit, +1.4 s (town) and +1.8 s (election) over the same page with the card answered. Elsewhere the page's
own lead is larger, and the card costs ~0.2–0.5 s.

**Review.** After the deploy: DebugView checklist in ANALYTICS.md; 24 Nov: `calculator_use` per tool vs page views of each
calculator, `whatsapp_channel_click` by `link_context`, share of `internal_search` with `results_count` 0. Field CWV: Search
Console's Core Web Vitals report (28-day window) from ~15 Dec.

**Outcome:** _pending_

## 2026-11-17 — Top-3 wave on unowned pages: La Grossa's pending title answers "when, what time, how much", Easter 2027 hands on to Carnival 2027, the Letras calendar heading; 25 other pages left alone (deploy; groups `grossa`, `setmana-santa-2027`)

Owner, 17 Nov: top 3. Inventory: `snapshot.py pages 14 700`, `ctr 14 300`, `gaps 14 500`, `rising 3 60` and page×query pulls
(4–17 Nov; 17 Nov partial). Out of scope (other owners or dated reviews): strikes, December bridge + shops (25 Nov), Barcelona
weather (19 Nov patch), Canyelles/Espinelves (20 Nov), elections (26 Nov), today's lottery-prize and paga-extra calculators.
Every page with ≥120 impressions at 4–15.5 was checked against this log. Most are inside a window with a dated review, or
already answer their queries in the first lines.

**Left alone (14 d clicks / impr. / pos; the reason).**

| Page | Baseline | Why no change today |
| --- | --- | --- |
| Parking ES (`aparcar-barcelona-zona-azul-verde`), CA | 30 / 8,769 / 7.9; 17 / 2,145 / 5.6 | The "rising" +660 is the two Saturdays (7 and 14 Nov: 1,364 and 1,218 impr.). Hours, weekend, prices and zone 36 Trinitat Vella are already in the body (30 Oct, re-read 16 Nov). Titles to 1/4 Dec, body measure 30 Nov |
| Barcelona holidays ES (`/es/festivos/barcelona/`) | 18 / 5,520 / 11.1 | "hoy es festivo en barcelona" variants (~600 impr. at 7–9, 0 clicks) are answered: next holiday in the first line, JS today/tomorrow box, FAQ. Town-template title window to 1 Dec |
| T-casual ES, EN | 7 / 4,659 / 8.5; 20 / 3,307 / 7.6 | "t casual 1 zona" 86 at 4.0, 0 clicks: the title gives the price (zero-click). 28 Nov proposal (16 Nov entry) stands |
| Semana Santa 2027 ES, CA | 27 / 3,658 / 6.5; 15 / 2,927 / 6.7 | 18 Nov review (13 Nov queue) and the 17 Nov first-screen wording. Only a link far below the lead added (change 2) |
| School calendar Andalucía | 9 / 3,603 / 8.2 | It ranks for Spain-wide "cuándo dan las vacaciones de navidad 2026" (208 at 6.5) that the hub targets: the 13 Nov entry's 20 Nov review decides |
| La Marató CA; lights ES/CA/EN; tourist tax EN/ES; metro EN | — | 18 Nov, 19 Nov, 30 Nov and 4 Dec reviews already logged |
| Spain 2027 cities (family) | ~18k impr. / 0.9 % / ~9 | 13 Nov lead, measure 20 Nov and 1 Dec |
| Carnival 2027 ES, CA | 15 / 657 / 10.1; 10 / 607 / 5.0 | New 13 Nov; CA lead changed this morning. The page answers Dijous Gras, Ash Wednesday, "is it a holiday" and schools. The ES average is pulled down by Spain-wide "cuando es carnaval" (25–65). No body change; links in (change 2) |
| 17 May 2027 date page ES, CA | 4 / 586 / 5.2; 7 / 302 / 5.4 | "17 de mayo 2027 es festivo" 68 at 4.2, 0 clicks. The description says nothing about Galicia, which is where the day is a regional holiday, but the 2027 date pages are in their 2 Nov window (measure 1 Feb 2027). Proposal for that review: the "local" description names the regions where the day is a holiday, as the working-day branch already does |
| SMI 2027, butano, días hábiles, TSI (rising) | 6 / 326 / 7.0 … | New pages; queries mostly anonymised. SMI's lead already answers "¿está aprobado?" |
| Vilassar de Mar ES, CA (rising) | 6 / 897 / 4.5 | The spike was its 16 Nov local holiday, now past |
| L2 closure ES/EN/CA, ZBE EN/ES, cruise port EN | ≤ 971 | Event over (L2: 18 impr. on 16 Nov) or too thin and spread across queries |

**Christmas hub, the 17 Nov check (12 Nov entry; 16 Nov proposal to take the lights off its title): no change.** The 14-day query
totals that pointed to cannibalisation ("cuando encienden las luces de navidad en barcelona 2026" 88 at 10.4 on
`/es/guias/navidad-en-barcelona/`) come from 4 Nov: the ES hub had 732 impressions that day and 0–4 a day since 5 Nov. The CA hub
has 9–40 a day, of which ~150 in 14 days are lights queries at 7–10, against ~700 on the lights page. Google already sends the
lights queries to the lights page, so retitling the hub would change nothing measurable before 26 Nov. Re-read after the switch-on.

**1. La Grossa de Cap d'Any 2026 (ca/es/en; no window: no entry since publication on 30 Oct). Pending title only.**
- Queries, 14 d: "la grossa de cap d'any 2026" 207 at 7.7 (2 clicks), "la grossa de cap d'any" 64 at 7.1, "grossa de cap d'any 2026"
  33 at 7.6, "la grossa cap d any 2026" 33 at 8.0, "la grossa 2026" (ES) 27 at 7.2, "…premis", "cuanto vale", "donde se cobra", "cuando
  es la grossa". No query asks for results: the draw is on 31 Dec.
- Before: "La Grossa de Cap d'Any 2026: resultats, premis i hora". After: "La Grossa de Cap d'Any 2026: dia, hora i premis del
  sorteig" (es "…: día, hora y premios del sorteo", en "…: draw date, time and prizes"). The news pages that rank for the draw
  title it the same way (Nació Digital: "La Grossa de Cap d'Any 2025: dia, hora, premis…"). The results title ("Resultats La
  Grossa de Cap d'Any 2026: números premiats") still takes over by itself when RESULTS_2026 is filled. Description, H1 and lead
  wording unchanged.
- Fact refresh, no new claim: the "time not announced yet (date)" sentences now carry `DRAW_TIME_CHECKED` = 17 Nov. Read that day:
  https://www.loteriesdecatalunya.info/ca/sobre-loteries/publicitat/premsa/ lists no 2026 Cap d'Any note; the newest is "La Grossa
  de La Diada 2026: Números premiats" (2024's time came in "La Grossa de Cap d'Any 2024: Presentadors", 19 Dec). The game page
  answered 403 to the server, so `GROSSA_AS_OF` (30 Oct, every other fact) does not move. New guard: from 20 Dec
  (`DRAW_TIME_RECHECK_BY`) a test fails while the time is still missing and the check is older.
- Baseline: CA 9 / 1,437 / 0.6 % / 8.4; ES 25 / 884 / 2.8 % / 7.8; EN under 120.
- Prediction: by 1 Dec, at equal or better position, CTR on the "la grossa de cap d'any 2026" variants above 1.5 % (CA) and the
  head query at ≤ 6. Demand climbs into 31 Dec, so compare CTR at equal position, not clicks. Revert to the old pending title if
  CTR falls at equal position by 8 Dec.

**2. Easter 2027 → Carnival 2027 (ca/es/en; body only, group `setmana-santa-2027`).** Carnival 2027 (new 13 Nov, rising +514 ES
/ +414 CA in three days) had no link from the strongest 2027 page on the site, Easter 2027 (6.6k impr. in 14 days). One sentence
after the Passion plays, in the traditions section, far below the lead: Carnival moves with Easter (Ash Wednesday 46 days before
Easter Sunday), with the 2027 week from Dijous Gras, Thursday 4 February, to Ash Wednesday, 10 February. The dates are
`CARNIVAL.dijousGras` / `.ashWednesday`, computed from the calendar's Easter, not retyped. Anchors: "Carnaval 2027 a Catalunya" / "Carnaval 2027 en
Cataluña" / "Carnival 2027 in Catalonia". Confounder: the Easter page's 18 Nov review. A link at the end of the body does not
touch its title, snippet or lead.
- Prediction: by 1 Dec, "carnaval 2027 catalunya" on the ES page from 5.5 to ≤ 4 and "carnestoltes 2027" (CA) from 6.9 to ≤ 5,
  read with the 17 Nov entry's carnival review.

**3. Letras del Tesoro (es/ca/en; body only, ships with the deploy).** Calendar queries are most of the visible set: "calendario
letras del tesoro 2026 pdf" 15 at 8.2, "proxima subasta letras del tesoro" 11 at 8.6, "calendario letras del tesoro 2027" 9 at
10.2, "calendario subastas letras del tesoro 2027" 6 at 4.2. The section was headed "Próximas subastas de Letras del Tesoro". It is
now "Calendario de subastas de Letras del Tesoro: próximas fechas" (ca "Calendari de subhastes de lletres del Tresor: properes
dates", en "Spanish Treasury bill auction calendar: next dates"), with the same `#proximas-subastas` anchor. Its intro links the
Tesoro's official 2026 PDF (already in the sources and the lead line). The 2027 sentence (published in December, link to the
Tesoro's calendar page) was already there. Title, description and lead untouched (new page, 13 Nov window).
- Baseline: 6 / 392 / 1.5 % / 7.1 (first impressions 14 Nov).
- Prediction: by 1 Dec, the "calendario … letras" queries at ≤ 6. Read with the 15 Dec measure of the 13 Nov entry.

**Go-live.** Deploy (Letras is a route; the code for 1–2 ships with it), then publish `grossa` and `setmana-santa-2027`. IndexNow:
`/ca/guies/la-grossa-cap-d-any/ /es/guias/la-grossa-fin-de-ano/ /en/guides/la-grossa-new-years-eve-lottery/
/ca/guies/setmana-santa-2027-catalunya/ /es/guias/semana-santa-2027-cataluna/ /en/guides/easter-2027-catalonia/
/es/calculadoras/letras-del-tesoro/ /ca/calculadores/lletres-del-tresor/ /en/calculators/spain-treasury-bills/`.

**Review 1 Dec** (`snapshot.py page la-grossa 14`, `page carnaval 14`, `page letras-del-tesoro 14`, `page lletres-del-tresor 14`)
and 8 Dec (Grossa revert rule).

## 2026-11-17 — Lottery prize tax calculator, "cuánto se queda Hacienda del Gordo" (new tool, Spain-wide, es/ca/en; ships with the deploy) + gordo hub body links (review 2026-12-29)

**URLs.** `/es/calculadoras/premios-loteria/` (primary), `/ca/calculadores/premis-loteria/`,
`/en/calculators/spain-lottery-prize-tax/`. Calculators family (`CALCULATORS` id `lottery-tax`), new hub group
"Lotería y premios", sitemap and llms.txt entries. One page per language, no variants.

**What.** The special levy of Ley 35/2006, DA 33ª (BOE consolidated text of 11/11/2026, read 17 Nov): 40,000 € exempt
per décimo, 20 % of the rest withheld when paid, shared décimos and participaciones split the exempt part by share
(33ª.2), the 0.50 € stake rule, not in the IRPF base (33ª.8). Presets: Christmas 2026 (SELAE programme read
31 Oct; SELAE answers 403 since 13 Nov), El Niño 2027 first prize only, La Grossa de Cap d'Any 2026 (DOGC 9640, read
17 Nov). Server-rendered answer: lead with the Gordo figures (72,000 € withheld, 328,000 € net, 82,000 € for a 5 €
share), a table of every preset, worked examples (incl. the AEAT's 100,000 € example), FAQ (7, FAQPage JSON-LD),
non-residents (modelo 210), modelos 136/230, YMYL disclaimer with the AEAT link. `RULES_UNTIL` 2027-01-01 test guard.

**Titles (new pages, no baseline).** es "Calculadora de premios de lotería: cuánto se queda Hacienda"; ca "Calculadora
de premis de loteria: quant se'n queda Hisenda"; en "Spanish lottery prize tax calculator: El Gordo after tax".
Descriptions lead with the Gordo figures.

**Gordo hub (body only, no title or description change).** `/es/donde-ha-tocado-el-gordo/`,
`/ca/on-ha-tocat-la-loteria-de-nadal/`, `/en/spanish-christmas-lottery-results/`: the tax paragraph now gives the net
per Gordo décimo and links the calculator; the FAQ answer "¿Cuánto paga el Gordo?" adds the net figure; the
province and municipality pages (from the 22 Dec snapshot) link the calculator instead of the guide for tax.
The hub's own window ("measure from 23 Dec") is untouched: titles unchanged. The lottery guide
(`loteria-nadal`) is NOT touched: its tax-section body change of 13 Nov is measured on 1 Dec.

**Baseline (GSC, 14 days to 17 Nov).** Gordo hubs: 27 impressions, 3 clicks (pos 3–21). Lottery pages: no
tax queries yet ("quant val un decim de loteria de nadal" 18 imp, pos 2.7, is the closest). Demand is seasonal: the
queries ("cuánto se queda Hacienda del Gordo", "cuánto cobra un décimo del Gordo", "calculadora premios lotería")
peak 22–23 Dec.

**Hypothesis.** A dated, official-source calculator page indexed before mid-December ranks top 10 for the Hacienda
queries on draw day; the hub link carries draw-day visitors to it.

**Review.** 2026-12-29 (`snapshot.py page premios-loteria 7`, `page premis-loteria 7`,
`page spain-lottery-prize-tax 7`; queries containing hacienda/hisenda/tax). Before then, 1 Dec: indexed? (URL
inspection.)

## 2026-11-17 — New tool: "Paga extra de Navidad 2026: cuánto cobrarás neto y cuándo" (calculator), es + ca + en (deploy; republish group `pagos`)

**What.** `/es/calculadoras/paga-extra/`, `/ca/calculadores/paga-extra/`,
`/en/calculators/christmas-extra-pay-spain/` (lib/programmatic/extra-pay/), in the
calculators registry right after net salary, hub group "Trabajo y sueldo" (card after
net salary), sitemap (+hreflang, x-default en), llms.txt and `calculator_use`
(`extra-pay`). Linked from the net salary page (body paragraph under the salary table)
and from the three editions of the pay-dates guide (`cuando-se-cobra-paro-pension`,
extras section: needs `pagos` republished); the page links back to that guide and to
the finiquito calculator. No existing title or description touched.

- Rules (read 17 Nov 2026 in the BOE consolidated texts; fact pack
  research_notes/paga-extra-navidad-2026.md): ET art. 31 (two extras, one "con ocasión
  de las fiestas de Navidad"; amount by convenio; may be prorated in 12) and 29.1 (date
  agreed or by custom) — update 21/10/2026; LGSS art. 147.1 ("percepciones de
  vencimiento superior al mensual se prorratearán a lo largo de los doce meses") and
  46.1 (pensions: extras accrued in June and November) — update 11/11/2026; Orden
  PJC/297/2026 art. 1.1 rule two (proportional part of the gratificaciones in each
  month's base, annual ÷ 12 for monthly pay) and art. 29.2 (complementary settlement);
  RIRPF arts. 82.5ª (rate applied to every payment), 83.2.1ª (rate on the year's
  expected pay) and 87 (regularisations) — update 07/10/2026. Seguridad Social's own
  "Bases y tipos 2026" page states the prorating rule only for household employees, so
  the general rule is quoted from the BOE.
- Calculator: annual or monthly gross, 14 or 12 (prorated) payments, optional convenio
  amount (default one month = monthly, or annual ÷ 14), accrual period yearly (1 Jan–31
  Dec) or half-yearly (1 Jul–31 Dec), start date for new hires (calendar days, like the
  finiquito tool), withholding from the payslip or estimated with the net salary engine
  (AEAT 2026 algorithm; foral regions → payslip rate only). Outputs gross, earned part,
  IRPF, net, 0 € Social Security with the reason and the contribution already paid on
  the extra inside the monthly bases (6.50 % of it; not shown above the 5,101.20 € cap).
  Server-rendered default = the net salary page's example: 30,000 € in 14 payments →
  2,142.86 € gross, 16.42 %, 1,791.00 € net (test: equals the net salary engine's
  `extraPayment`). Worked examples: September hire 716.24 € (yearly) / 1,420.81 €
  (half-yearly); prorated 178.57 € a month. Links: AEAT Servicio de Cálculo de
  Retenciones (R261), REGCON. YMYL disclaimer; no payment day printed (convenio).

**Why.** December spike for "paga extra", "cuánto cobraré de paga extra", "paga extra
neta", "paga extra prorrateada", "cuándo se cobra la paga extra de Navidad"; the net
salary page already answers the 14-payment net but nothing on the site covered the
new-hire proportional part or why the extra carries no Social Security.

**Baseline.** New URLs: 0 impressions.

**Prediction.** By 31 Dec 2026: es page ≥ 3k impressions in December, position ≤ 20 for
"paga extra navidad" / "calcular paga extra" / "paga extra neta".

**Date guard.** `EXTRA_PAY_RULES_UNTIL` 1 Jan 2027 (tests/extra-pay.test.ts, with
`SALARY_RULES_UNTIL`): move the page to the 2027 rules (net salary rules-2027, AEAT
"R27x" simulator link, re-read ET 29/31, LGSS 46/147, the 2027 contribution order,
RIRPF 82/83/87), then EXTRA_PAY_YEAR / AS_OF / UNTIL.

**Measure 1 Dec, 15 Dec, 8 Jan 2027**: `snapshot.py page /calculadoras/paga-extra/ 28`
(+ `/calculadores/paga-extra/`, `/calculators/christmas-extra-pay-spain/`); GA4
`calculator_use` with `calculator_id` = `extra-pay`.

## 2026-11-17 (evening) — Strikes 19N/20N/23N/26N: the day pages take the searched words, both hubs and the Renfe guide hand the "19/20 noviembre" queries to them, the 23N Rodalies order is in, "mañana" wording for 18–23 Nov (deploy; groups `strikes`, `huelgas-espana`, `huelga-19-20n`, `huelga-trenes-17n`)

**Observation (GSC, 14 days to ~15 Nov, from the owner).** "huelga 20 noviembre 2026" → `/es/guias/huelgas-espana/` 1,031
impressions at 9.5 (7 clicks); "huelga renfe 19 noviembre" → `/es/guias/huelga-renfe-rodalies-noviembre/` 529 at 8.3;
"huelga renfe 19 noviembre 2026" → huelgas-espana 268 at 9.2; "huelga renfe noviembre 2026" 696 at 10.0; "huelga mañana" /
"mañana hay huelga" ~260 each at 8 (Catalan hub). The day pages (`/es/guias/huelga-19-noviembre/`, `-20-`) went live at 11:00
today, not known to Google yet.

**Sources re-read 17 Nov ~16:00–17:10 CET** (research_notes/x10/strikes-wave-17nov-factpack.md; curl + grep log in the session
scratchpad). NEW: Generalitat Ordre EMT/ /2026 of 16 Nov (e-Tauler 659191, Treball's list 17 Nov): SEMAF at Grupo Renfe on 23
Nov, 0.01–23.59, all drivers, registered 11 Nov; Rodalies/Regionals 66 % at peak (06:00–09:30, 17:00–20:30), 33 % the rest. 21N
march: 12:00, plaça d'Urquinaona (USTEC·STEs and CGT Ensenyament, 17 Nov). Sindicato de Estudiantes: 24 mobilisation points at
12:00 on 20N. STILL PENDING: Ministry resolution for Adif 17/19 (`ADIF_MS_PUBLISHED` stays false; SCFCOM 37 says Adif staff follow
minimum services "determinados por la Secretaría de estado … y la Circular de Dirección General nº 5 del 13-11-2026", unpublished);
Ministry resolution for the rest of Renfe on 23N; any 26N education order (Treball, e-Tauler). No BOE strike order 13–17 Nov.

**What changed.**
- **Day pages (new since 11:00, so no window):** H1 and title open with the searched words. es "¿Hay huelga el jueves 19 de
  noviembre de 2026? Adif, médicos, limpieza y educación en Madrid" → H1 "Huelga 19 de noviembre de 2026: Adif (no Renfe),
  médicos, limpieza en Bizkaia y Madrid", title "¿Hay huelga el 19 de noviembre? Adif, Renfe y médicos" → "Huelga 19 de
  noviembre de 2026: Adif (no Renfe) y médicos"; 20N title "¿Hay huelga el viernes 20 de noviembre? Estudiantes y más" →
  "Huelga 20 de noviembre de 2026: estudiantes y médicos" (H1 "… estudiantes, médicos y Madrid. ¿Hay clase?"); ca "Vaga 19/20
  de novembre de 2026: …", en "Spain strike 19/20 November 2026: …". New "eve" state (as-of = the day before): lead "Mañana,
  jueves 19 de noviembre, hay huelga, pero no general: … Fuentes revisadas el miércoles 18…", description "Mañana jueves 19: …",
  first FAQ "¿Hay huelga mañana, jueves 19…?" (and "¿… hoy …?" on the day). 20N: table of the students' 24 mobilisation points at
  12 h + FAQ "¿Dónde son las manifestaciones de estudiantes del 20 de noviembre?". Descriptions otherwise unchanged.
- **Anchors** (`B2_TITLES.strike19n/20n`, every link to the day pages): "Huelga del 19 de noviembre de 2026: Adif (no Renfe),
  médicos y limpieza", "Huelga del 20 de noviembre de 2026: estudiantes, médicos y Madrid" (ca/en alike).
- **Spain hub (body only; title and description code untouched):** the "Día a día" links move from under the week table to
  right under the week summary (second paragraph); the rail entry's section links the 19N page, the SMU entry's the 19N page
  (marches), the students' entry's the 20N page, each only until its day has passed. 23N entry: "official" (Generalitat order,
  cited through Treball's list), title "huelga de maquinistas del Grupo Renfe (SEMAF)", label "maquinistas de Renfe (SEMAF)",
  hours 0.01–23.59, Rodalies 66/33, Cercanías/MD/AVE "por confirmar". The description lists this week's labels only, so it
  does not change before 23 Nov (from then the 23N label reads "maquinistas de Renfe (SEMAF)").
- **Renfe guide (title untouched):** while it covers 17/19 Nov, two lines under the "Fuera de Cataluña" paragraph: "¿Hay huelga
  de Renfe el 19 de noviembre? Solo Adif (circulación)" → 19N page, and the 20th → 20N page (each until its day). Lead: "Mañana,
  jueves 19…, es día de huelga (fuentes revisadas el 18…): huelga ferroviaria solo del personal de circulación de Adif…" on the
  18th, "Hoy, jueves 19…: …" on the 19th; generic "Mañana, <day>, es día de huelga" on any eve (22 Nov for the 23rd).
  **Description (data-driven, changes with the entry's `msShort`):** "Martes 17 y jueves 19 de noviembre de 2026: huelga
  ferroviaria: Grupo Renfe, Adif y maquinistas. Rodalies: 66% en hora punta y 33% el resto del día." → "17 y 19 de noviembre de
  2026: huelga ferroviaria: Grupo Renfe, Adif y maquinistas. Rodalies el 17: 66% en hora punta y 33% el resto; el 19, solo
  Adif." Reason: the old line printed the 17th's Rodalies figures as if they applied on the 19th (Renfe is not called that day).
  From 20 Nov it covers 23N: "23 de noviembre de 2026: huelga de maquinistas del Grupo Renfe (SEMAF). Rodalies: 66% en hora
  punta y 33% el resto del día. Rodalies: líneas y qué hacer."
- **Catalan hub (`strikes.ts`, body only; description labels unchanged):** entry `dayNotes` — the "Mañana, jueves 19" line on the
  18th (and the "en curso" line on the 19th) say "huelga ferroviaria solo del personal de circulación de Adif … Renfe … no está
  convocada. Servicios mínimos de Adif: pendientes de publicar" instead of the 17th's 66/33. 23N entry: published (66/33, order of
  16 Nov), title "vaga de maquinistes del Grup Renfe (SEMAF)". 26N entry: 21N march at 12 h in Urquinaona; still "Aún no se han
  publicado" (checked 17 Nov).
- **17N page:** on the 18th/19th the lead labels its figures "del martes 17" and adds "Mañana/Hoy, jueves 19, paran solo los
  responsables de circulación de Adif (SCF)…"; **description dated variant for 18–19 Nov only** ("Jueves 19: solo paran los
  responsables de circulación de Adif (SCF), no Renfe. Martes 17: Cercanías 75 % en hora punta y 50 %, AVE 72 %.") because
  "Sí, el martes 17 hay huelga" becomes false on the 18th; the 16 Nov description is untouched on the 17th and the "after"
  one from the 20th. Inside the 16 Nov entry's window: tense fix for two days, same reasoning as that entry (event ends 19th).

**Baseline / prediction / review.**
- 20 Nov (`snapshot.py page huelga-19-noviembre 3`, `page huelga-renfe-rodalies 3`): the 19N page gets impressions for "huelga
  (renfe) 19 noviembre (2026)" at ≤ 8; the Renfe guide keeps "huelga renfe noviembre 2026" (696 at 10.0) without losing CTR.
- 23 Nov (`snapshot.py page huelga-20-noviembre 5`, `page huelgas-espana 7`): "huelga 20 noviembre 2026" lands on the 20N page
  at ≤ 6 with CTR ≥ 3 % (hub baseline 1,031 at 9.5, 0.7 %); hub CTR on those queries > 1 %. Catalan hub "huelga mañana" ≥ 1
  click/day on 18, 22 Nov.
- **Revert rule:** if by 23 Nov the hub still gets > 60 % of "huelga 20 noviembre 2026" impressions and the 20N page < 100, put
  the day-pages line back under the week table and restore the question-form titles (`strike-days-1920n.ts` git history).

**Confounders:** the 18 Nov day-7 check of the 11 Nov Renfe-guide retitle (this deploy changes its description and body on the
last day of that window: read 12–17 Nov for it); the 19 Nov answer-first review (the Spain hub's second paragraph changes);
the as-of switches 18–23 Nov; any Ministry resolution for Adif or 23N published meanwhile.

**Outcome:** _pending_

---

## 2026-11-18 — Day-7 reviews of the 11 Nov retitles: Easter 2027 back to its 31 Oct snippet, La Marató's queued title, CA shops and the school calendar reverted (deploy; groups `setmana-santa-2027`, `marato`, `shops`)

Reviews due 18 Nov (`grep "18 Nov"`): the 11 Nov CTR retitles (bridge, shops, EN weather, school calendar, Marató, Easter) and the
13 Nov queue rows. The readings and the rule for each page are under the 11 Nov entry's outcome. GSC full days only, last full day
16 Nov. **Not reviewed here** (out of this brief): the strike entries (29 Oct/3 Nov 11N measures, the Renfe-guide day-7 rule, the
17N Spain-page rule), the 11 Nov election-guide rule (26 Nov) and the bridge pages (25 Nov). Calculators were not touched.

### 1. Semana Santa 2027: why CTR is near zero at position 6–7

`snapshot.py page santa-2027 14` (5–18 Nov, partial days included): "semana santa 2027 catalunya" 1,312 impressions at 6.5, 0.2 %;
"setmana santa 2027 catalunya" 1,123 at 6.3, 0 clicks. The site's own curve expects 4.1 % at position 7 (`ctr 14 300`).

- **When it broke.** The daily CTR (both editions) was 2.1–2.9 % at 5.3–5.9 from 1 to 5 Nov, and 0.0–0.8 % at 6.1–7.2 from 6 Nov.
  Per edition: ES 44 / 1,621 / 2.7 % / 5.4 (1–5 Nov), then 8 / 1,802 / 0.4 % / 6.5 (6–11 Nov), then 2 / 1,191 / 0.2 % / 7.1
  (12–16 Nov). CA: 21 / 1,349 / 1.6 % / 6.2, then 4 / 1,213 / 0.3 % / 6.5, then 3 / 1,016 / 0.3 % / 6.9. The break follows the
  3 Nov deploy (17:45, group published the same evening) by 2–3 days. That deploy put the week, "del 21 al 28 de marzo", first in
  both the description and the lead. The position loss (about −1) is far too small to explain a fall from 2.7 % to 0.2 %.
- **What our snippet says.** Live HTML on 18 Nov (curl): ES "Semana Santa 2027: del 21 al 28 de marzo. Festivos: Viernes Santo 26 y
  Lunes de Pascua 29 (el Jueves Santo, no). Colegios: del 20 al 29 de marzo." The CA one is the same. Every answer the head query
  asks for sits in the first 40 characters, so the snippet answers the query on the results page. The 11 Nov titles carry no date
  ("día a día: festivos y colegios"). They changed nothing: 0.2 / 0.3 %.
- **What the results page answers.** It could not be observed. Google served its "tráfico inusual" page to the server's IP on
  18 Nov (Playwright, google.es, two queries), and this was not worked around. The WebSearch tool is US-located and not
  representative. Indirect evidence that the answer is on the page itself: where we rank 2–4 we get no clicks either ("semana santa
  cataluña 2027" 29 at 3.2, "dia de la mona 2027" 41 at 4.0, "cuando es semana santa en 2027 en cataluña" 17 at 4.1; 14 d).
- **Cannibalisation: minor, not the cause.** hreflang is reciprocal (ca/es/en, x-default en) and each page is self-canonical
  (curl 18 Nov). Each head query goes mostly to the right edition, 12–16 Nov: "semana santa 2027 catalunya" ES 474 at 7.0 vs CA
  81 at 7.6 (85 % right), "setmana santa 2027 catalunya" CA 385 at 5.8 vs ES 106 at 7.7 (78 % right). Both editions collapsed on
  the same days, so the split did not cause the fall. "setmana santa 2027" (no region) is on CA only, at 9.8: that is ranking.
- **Diagnosis.** A full answer in the first words of the snippet, possibly on top of a direct answer from Google. Only a
  return to the snippet that last worked can tell these apart.

### 2. Change: Easter 2027 back to its 31 Oct snippet (ca/es/en; group `setmana-santa-2027`)

Two logged rules both fire today. The 11 Nov day-7 rule reverts the title: clicks fell at equal or higher impressions in both
editions. The 13 Nov queue reverts the 3 Nov description ("take the week range out … give the two holidays"). Together they restore
the state of 31 Oct–3 Nov, the only one measured at 1.6–2.7 %. This is one test of one hypothesis: the "week first" snippet killed
the clicks. The lead's 3 Nov week clause goes too, so Google cannot rebuild the same snippet from the first sentence.

| Edition | Title | Description | Lead |
| --- | --- | --- | --- |
| CA | "Setmana Santa 2027 a Catalunya dia a dia: festius i escoles" → "Setmana Santa 2027 a Catalunya: festius 26 i 29 de març" | "Setmana Santa 2027: del 21 al 28 de març. Festius: …" → "Divendres Sant i Dilluns de Pasqua (26 i 29 de març) són festius; el Dijous Sant, no. Vacances escolars del 20 al 29 de març. Botigues, ponts i la Passió." | "la Setmana Santa del 2027, del 21 al 28 de març, té dos festius" → "la Setmana Santa del 2027 té dos festius" |
| ES | "… día a día: festivos y colegios" → "Semana Santa 2027 en Cataluña: festivos 26 y 29 de marzo" | → "Viernes Santo y Lunes de Pascua (26 y 29 de marzo) son festivos; el Jueves Santo, no. Vacaciones escolares del 20 al 29 de marzo. Tiendas y puentes." | same, without "del 21 al 28 de marzo" |
| EN | "Easter 2027 in Catalonia and Barcelona, day by day" → "Easter 2027 in Catalonia and Barcelona: 26 and 29 March" | unchanged (never had the week) | unchanged (never had it) |

The week stays on the page in the key facts (Palm Sunday 21, Easter Sunday 28 March). The 17 Nov items are kept: the "dia de la
mona" key-fact label and the Carnival link. **No fact changed.** All of them were re-read on 18 Nov with curl and grep:
treball.gencat.cat calendari-festes-2027 "26 de març, divendres", "29 de març, dilluns" (Ordre EMT/52/2026), and the Ordre
EDF/66/2026 PDF (DOGC 27.4.2026) "Setmana Santa: del 20 de març al 29 de març de 2027, ambdós inclosos".
`tests/easter-2027.test.ts` pins the restored strings. It also forbids "21 al/to 28" in the title, the description and the lead.

**New baseline (12–16 Nov):** ES 2 / 1,191 / 0.2 % / 7.1; CA 3 / 1,016 / 0.3 % / 6.9; EN 0 / 18 / 4.2. Head queries: ES "semana
santa 2027 catalunya" 474 at 7.0 (0 clicks); CA "setmana santa 2027 catalunya" 385 at 5.8 (0); CA "setmana santa 2027" 101 at 9.8.
**Prediction:** within 7 days of pickup, ES CTR ≥ 1.2 % and CA ≥ 0.8 % at position ≤ 7.5, half of the 1–5 Nov levels.
**Review 26 Nov and 2 Dec** with `snapshot.py page santa-2027 14` and a page×query split. Find the pickup from the daily break and
read only the days after it.
- Keep if the prediction holds.
- If both editions stay ≤ 0.5 % at equal position, the snippet is not the cause: the results page answers the date itself. Keep
  the restored strings (the best measured). Run no further snippet test on this page before 1 Feb 2027 (demand peaks Feb–Mar), and
  move the work to ranking (CA "setmana santa 2027" at 9.8, ES head query at 7).
- In between: hold, and re-read on 2 Dec.
- In both reviews, also check the share of the wrong edition on each head query (ES 22 %, CA 15 % today). Above a third, look at
  internal links.

### 3. La Marató: the 13 Nov queued title (ca/es/en; group `marato`)

The 11 Nov rule does not fire, but CA gained nothing: 0.7 → 0.4 % at 6.5 → 7.2 on 64 % fewer impressions, because demand fell after
the volunteer deadline (10 Nov). The 13 Nov precondition is met: 3Cat has published the schedule and the presenters. Re-read 18 Nov
(curl + grep): the 10 Nov news says "El programa de televisió començarà a les 9.30 des de la Torre de Collserola, on s'allargarà
fins a les 14.30, i es reprendrà a les 16.00 des del Parc Audiovisual de Catalunya, a Terrassa, fins a la 1.00" and "Raquel Sans i
Miki Núñez conduiran La Marató a TV3". The presenters video has uploadDate 2026-10-02. Both are already in the body (13 Nov).
- CA "La Marató TV3 2026: 13 de desembre, com donar i desgravar" → "La Marató TV3 2026: horari, presentadors i com donar"
- ES "… 13 de diciembre, cómo donar y desgravar" → "La Marató TV3 2026: horario, presentadores y cómo donar"
- EN "La Marató 2026: TV3 telethon on 13 December, how to donate" → "La Marató TV3 2026: schedule, presenters and how to donate"

"TV3" stays, because it is in the queries. The descriptions are unchanged and open with the date ("Diumenge 13 de desembre a TV3…"),
as the queue asked. ES had gained (1.4 → 2.9 %, on 4 clicks), but it follows CA: same hypothesis, owner rule.
**Baseline (12–16 Nov):** CA 2 / 534 / 0.4 % / 7.2; ES 4 / 139 / 2.9 % / 5.6; EN 0 / 11. "marató tv3 2026 data" 70 at 8.4.
**Prediction:** by 2 Dec, "a quina hora / horari / presentadors" queries appear and CA CTR is > 1 % at ≤ 7.
**Review 25 Nov and 2 Dec** (`snapshot.py page la-marato 7`). Revert an edition to its 11 Nov title if its CTR falls at equal
position (±0.5). Demand climbs into 13 Dec, so compare CTR, not clicks. Confounder: the 13 Nov body update (measure 1 Dec).

### 4. CA shops: reverted by the rule (group `shops`)

Position 5.3 → 7.1 with CTR 2.3 → 0.5 % (rule: more than −1.5 with no CTR gain).
- Title: "Botigues obertes diumenges i festius a Barcelona, dia a dia" → back to "Botigues obertes a Barcelona: diumenge 29 nov i
  desembre".
- Description back to "Diumenge 29 de novembre, dia d'eleccions: sí que poden obrir a Barcelona i Catalunya. Al desembre, 6, 8, 13,
  20 i 27; 25 i 26, no. 30 municipis canvien." It has the same dates and the same count as the live one; no new fact.

ES and EN keep the 11 Nov strings (they pass). Baseline CA 2 / 418 / 0.5 % / 7.1. **Read 25 Nov** with the 16 Nov shops review.
Keep the revert if the position is back to ≤ 6. Otherwise it is ranking, and there is no further snippet change before 29 Nov.

### 5. School calendar: live title reverted (deploy only)

CA moved from 5.0 to 6.6 on the first day (CTR 0.7–1.0 → 0.2 %), so the rule fires. `liveSchoolTitle` is restored for all three
editions, because one function builds them:
- CA "Calendari escolar 2026-2027: festius i lliure disposició" (6 Nov)
- ES "Calendario escolar 2026-27 Cataluña: Navidad 22/12-7/1"
- EN "Catalonia school calendar 2026-27: Christmas 22 Dec–7 Jan"

Baseline CA 2 / 1,004 / 0.2 % / 6.6; ES 1 / 376 / 15.9; EN 0 / 90 / 5.8. **Review 25 Nov.** Keep the revert if CA is back to ≤ 5.5,
and run the 13 Nov description test (town free days, "demà hi ha escola?") that day, not on 19 Nov.

### 6. Kept

ES shops, EN shops, EN weather (patch on 19 Nov: see the 16 Nov entry), ES/EN bridge, ES Marató over its old title. The CA
bridge's page-average trigger is a query-mix effect and goes to its 25 Nov review.

**Tests.** `npx tsc --noEmit -p .` has one error, in `tests/strike-days-1920n.test.ts` (strike constants, not touched here).
`npm test`: 2,328 tests. The only failures are the date guards already due today, all out of this brief: polls staleness ×2
(elections), strikes as-of ×3. Logs: scratchpad `reviews-18n-tsc.log`, `reviews-18n-test2.log`.

**Go-live.** Deploy first: the school title is code, and publish reads the deployed modules. Then publish `setmana-santa-2027`,
`marato` and `shops`. `marato` also republishes the Barcelona Christmas guide, whose module is unchanged since 13 Nov.
IndexNow: `/ca/guies/setmana-santa-2027-catalunya/ /es/guias/semana-santa-2027-cataluna/ /en/guides/easter-2027-catalonia/
/ca/guies/la-marato-tv3-3cat/ /es/guias/la-marato-tv3-3cat/ /en/guides/la-marato-tv3-telethon/
/ca/guies/botigues-obertes-festius-catalunya/ /ca/guies/calendari-escolar-catalunya/ /es/guias/calendario-escolar-cataluna/
/en/guides/catalonia-school-calendar/`.

**Outcome:** _pending_ (26 Nov / 2 Dec Easter; 25 Nov / 2 Dec Marató; 25 Nov CA shops and school)

## 2026-11-18 — Top Stories / Discover readiness: dates with real times that move only with the content, free-access flag, share cards for the Gordo and elections hubs (deploy only; no publish group; no title, description or lead touched)

**Why.** Media take the news-like strike queries through Top Stories and Discover; we had 0 Discover and 0 Google News
impressions in 28 days (GSC `type=discover|googleNews`, 21 Oct–17 Nov) and 3 News-tab impressions. Live audit, 18 Nov
(strike day pages 19N/20N ca/es/en, both strike hubs, 17N rail page, education 26N, election-night and postal-vote guides,
lottery guide, Gordo hub, elections hub, PVPC, butane, Rodalies): `max-image-preview:large` in robots and googlebot on all;
NewsArticle with headline ≤ 95 chars, Person author with `url` to the author page, publisher with logo, 16:9/4:3/1:1 crops
≥ 1,280 px on every news guide; canonical and hreflang clusters correct; news sitemap valid (19N/20N listed with their real
publication date); TTFB 0.1–0.4 s, hero preloaded with `fetchpriority=high`. Gaps, against Google's own texts:
- Google News, "Best practices for your article pages": "articles need to show both a clear, visible date and time …
  between the headline and the article text". The header showed dates only, and on phones a page never updated showed only
  the "Verificado" stamp (the publication date was hidden below `md`).
- Search Central, "Add a byline date": "Ensure that the date (and optional time and timezone) match between the equivalent
  user-visible and structured values". `dateModified` carried a time the publishers invented (verification days stored as
  noon, e.g. `2026-11-17T10:00:00Z`), and `<time datetime>` used the UTC day.
- Google News best practices: "it's against our guidelines to artificially freshen a story when the publisher didn't add
  significant information". `updated_at` was recomputed on every re-send; institutional pages were stamped "now" on each
  publish.
- Discover: "Avoid using generic images (for example, your site logo) in the schema.org markup or og:image meta tag" and
  images "at least 1200 px wide", "16x9". The Gordo hub (22 Dec night) and the elections hub (29N night) shared the
  site-wide brand card.

**Changes.**
- `src/lib/seo/article-dates.ts` (new): one source for `datePublished`/`dateModified`, `article:*_time` and the header's
  `<time datetime>`; a time is stated only when real (an update equal to the stored verification stamp is a bare day,
  `2026-11-17`). `editionUpdatedAt`: identical re-send → unchanged; content changed and verified today → the instant of
  this publish; changed with an older verification (the 00:05 "mañana"→"hoy" switch, a layout box) → unchanged; never
  before publication or after now. Used by `publish-article.ts` (every code-published guide) and `pages/publish.ts`.
- `EntryArticle` header: news-cycle pages (NewsArticle) show "Publicado el 17 de noviembre de 2026, 13:00 CET" /
  "Actualizado el …, 09:41 CET" (time only when real); phones always get one date (update, else publication). Same in
  ca/es/en (`formatDateAndTime`).
- Article/NewsArticle: `isAccessibleForFree: true` (listed in the same Google News best practices).
- `src/lib/seo/cards.ts` + `/card/<family>/<locale>-<hash>.png` (ImageResponse, as `/social-card.png`): 1200 × 675 card with
  the hub's own H1, the event date (draw 22 Dec / election 29 Nov) and the brand, for `/ca/on-ha-tocat-la-loteria-de-nadal/`,
  `/es/donde-ha-tocado-el-gordo/`, `/en/spanish-christmas-lottery-results/`, `/ca/eleccions/`, `/es/elecciones/`,
  `/en/elections/`. Text from the registry only; the hash changes with the H1 (draw night), unknown hashes 404.

**Not changed (windows / owner).** Titles, descriptions and leads of every strike, election and lottery page (open windows
from 16–17 Nov). Finding left for the strike owner after the 23 Nov window: the leads say "Fuentes revisadas el <as-of>",
which the 00:05 timer moves without a re-check; the page's verified constant (`*_VERIFIED`) is the honest value.

**Baseline (GSC, 7 days to 17 Nov, web):** "huelga 19 noviembre 2026" 71 clicks / 1,750 impr / pos 8.1; "huelga renfe 19
noviembre" 35 / 884 / 9.0; "huelga 20 noviembre 2026" 7 / 1,051 / 9.6; "mañana hay huelga" 1 / 190 / 8.5. Discover 0 / 0,
Google News 0 / 0 (28 days).

**Prediction.** Eligibility, not ranking: first Discover or News impressions within 3 weeks of the deploy on a news night
(23N/26N strikes, 29N); no change in web position from this alone.

**Review 2026-12-02** (`news-surfaces`: GSC `type=discover` and `type=googleNews` by page, 18 Nov–1 Dec; Rich Results Test on
the 19N page and the Spain hub; spot-check that a strike re-send at 00:05 left `dateModified` unchanged). Second look
2026-12-29 for the Gordo card (draw night). **Revert rule:** if Search Console reports date errors on Article items, put the
full ISO instant back for unknown times (`modifiedIso`), keep the rest.

## 2026-11-18 — Calendario laboral 2027, Spain cities: every day by layer with its source in the first lines, the six pending lists re-read, searched titles armed for 2 Dec, community pages lead to their searched cities (deploy; group `calendario-2027-espana`)

**Why.** "festivos <ciudad> 2027" / "calendario laboral <ciudad> 2027" peaks in December and January, and the city pages
already get it before the season: GSC 5–18 Nov (`snapshot.py page 2027 14`, `gaps 14 60`, plus a query×page pull) —
"festivos vigo 2027" 136 at 10.8, "calendario laboral torrelavega 2027" 106 at 8.5, "festivos alcobendas 2027" 92 at 9.4,
"calendario laboral alcobendas 2027" 80 at 8.9, "calendario laboral marbella 2027" 78 at 9.0, "festivos valdemoro 2027" 60 at
7.2, "calendario laboral paterna 2027" 57 at 6.7, "calendario laboral gandia 2027" 57 at 8.7. Every one at 6–11: page one, not
top 3. Gaps found on the page: the first line gave only the 2 local days; the national and regional days were rows of the
table with a "Tipo" column and no date or text of their own; pending pages said "Boletines consultados el 6 de noviembre"
(12 days old in a season that moves weekly); the title said "Festivos locales X" or "Calendario laboral X: festivos", never
both forms; the community pages (hub and communities at 17–70 for head terms, 655 impressions) listed their cities only at
the bottom.

**Inventory (18 Nov).** `/es/festivos/2027/`: hub, puentes, 19 communities, 27 day pages, 276 city pages (129 capitals and
50,000+, 147 of 20,000+; 223 with their 2027 days published, 51 pending, 2 left out of the published list: Burgos and
Valladolid, `status2027` "missing"); same in `/ca/festius/2027/` and `/en/holidays/2027/`. ES all indexable; ca/en noindex by rules
`spain-2027-ca`/`-en` except Catalonia, hubs, tools and the keep lists. Sources: BOE-A-2026-21254 (13.10.2026) for national +
regional days; each community's decree (sources.ts); local days from each community's (or province's) 2027 bulletin — 10
communities plus Ceuta and Melilla published, 6 pending (+ Catalonia's DOGC order, its own engine, mid-December).

**Facts re-read 18 Nov (the six pending lists).** Every issue of each bulletin through 18 Nov, by its own summary, searched
for "fiestas locales / laborales / de carácter local / calendario de fiestas"; the same search finds each 2026 list on its day.
None has the 2027 list: BOA núm. 223, DOGV núm. 10496, BOC núm. 222, DOCM núm. 221, BOCM núm. 277, BON núm. 230 (all of
18.11.2026). Recorded in `PENDING_CHECKS` (sources.ts), fact pack `research_notes/spain-2027-pending-local-lists-2026-11-18.md`.
No council act found for the pending cities with demand (Alcobendas, Torrelavega, Gandia, Benidorm, Paterna, Sagunto):
nothing printed from councils, nothing guessed from 2026. **Newly verified: none published. Still pending: all six.**

**What changed.**
1. City pages es/ca/en (276 × 3): under the answer line, a layers block — "Comunes a toda España (9): vie 1 ene … (BOE de 13 de
   octubre de 2026, BOE-A-2026-21254)" / "Además, en <comunidad> (n): … (Decreto …, boletín, y BOE)" / "Fiesta insular" in
   Canarias / "Locales de <ciudad> (2): … (DOG núm. 204, de 26.10.2026)" or "pendientes de publicación en el BOCM (consultado
   hasta el BOCM núm. 277, de 18.11.2026)"; Navarra shows 3 December as known and the other as pending. Every day of the
   table is in exactly one layer (test). Weekday on every date.
2. Pending cities: answer line "Boletines consultados el 18 de noviembre de 2026 (hasta el <bulletin núm.>)", the local
   section adds "no está en ningún número publicado hasta el …", footer read date 18 Nov (`cityReadOn`); community status
   lines and the hub's status list name the issue too. Sitemap lastModified of the family → 18 Nov (`latestReading`).
3. Community pages es/ca/en: under the calendar table, "Festivos locales de 2027 por ciudad:" with the most searched city
   pages (`SEARCHED_CITIES`, GSC 5–18 Nov, ≥ 50 impressions, up to 6; Castilla-La Mancha falls back to its 4 largest), each
   with its days or "Pendiente (2026: …)", and an anchor to the full table.
4. **Titles (es only), armed for 2 Dec, not live now:** `CITY_TITLES_FROM = 2026-12-02` in `city-copy.ts`. From that day the
   next build or `calendario-2027-espana` publish renders "Festivos Vigo 2027: calendario laboral, 29 mar y 16 ago" /
   "Festivos Alcobendas 2027: calendario laboral" (pending) / "Festivos Pontevedra 2027: 10 feb y 29 mar" where 60 characters
   do not fit both. Held because the 13 Nov first-line change on these pages is measured on 20 Nov and 1 Dec. Descriptions
   unchanged (they already say "calendario laboral" and the days; one thing at a time). ca/en titles unchanged (mostly
   noindex).
5. `low-demand.ts` keep lists (same bar, GSC 22 Oct–18 Nov: a click or ≥ 10 impressions), city pages with their 2027 days:
   + `/en/holidays/2027/basque-country/san-sebastian/` (14 at 3.3), `/en/holidays/2027/andalusia/torremolinos/` (11 at 6.0),
   `/en/holidays/2027/extremadura/merida/` (1 click), `/ca/festius/2027/illes-balears/sant-antoni-de-portmany/` (1 click).
   Held although over the bar (no 2027 local days yet): EN Pamplona 11, Benidorm 10, Burgos 10. Left to the 10 Dec review:
   EN day pages 8 Dec (18), 6 Dec (14), 29 Mar (11), 19 Mar (10), EN Andalusia (12).
6. 2026 → 2027 links: already in place for every place that has a 2026 page outside Catalonia (11N city pages "Y ahora en
   <ciudad>" → the city's 2027 page; school-calendar community pages and the Spain December bridge → community 2027 pages;
   Catalan town pages carry their own 2027 days). Nothing added.
7. Date guards: `WAITING_RECHECK_BY` 20 → 25 Nov (DOGV past its 14 Nov precedent; BOA due 20 Nov; BON 2 Dec).
   `STATUS_RECHECK_BY` and `CITIES_RECHECK_BY` stay 27 Nov. Test `tests/spain-2027-laboral-18nov.test.ts`.

**Baseline (GSC 5–18 Nov, 14 d; 18 Nov partial).** ES city pages: 15,270 impressions, 137 clicks, CTR 0.90 %, position 9.4
(impression-weighted); published 8,994 / 52 / 0.58 % / 9.1; pending 6,247 / 85 / 1.36 % / 9.7. ES hub + communities + days:
655 / 2 / 17.2. Named queries as in "Why". The four ca/en pages kept today: 14, 11, 3 and 2 impressions (28 d), 2 clicks.

**Prediction.** By 15 Dec (equal-query comparison; demand grows into December so clicks alone mean little): the eight named
queries median position from ~8.9 to ≤ 6, at least three of them ≤ 3; ES city family CTR ≥ 1.5 % at equal position band.
After the 2 Dec title switch: CTR on "calendario laboral <ciudad> 2027" queries for published cities up ≥ 30 % at equal
position (13–28 Dec vs 17 Nov–1 Dec). Pending cities: when their list is published, the page flips to the days the same day
(data update), which will dominate any title effect for those 51 pages.

**Review.** 2 Dec (title switch day: confirm the 1 Dec reading of the 13 Nov entry is logged; if that reading says hold,
move `CITY_TITLES_FROM`), 15 Dec, 15 Jan (with the 13 Nov 147-towns rule). `snapshot.py page /festivos/2027/ 14` and the
query×page pull; `page /holidays/2027/ 28` for the four kept ca/en pages. **Revert rule (titles):** if by 16 Dec published
cities lose ≥ 1 position at equal query with no CTR gain, set `CITY_TITLES_FROM` far ahead (old titles come back).

**Confounders.** 13 Nov first-line change (its 20 Nov reading covers 13–19 Nov, before this deploy); 19 Nov answer-first
review; any community publishing its list (BOA ~20 Nov, BON ~2 Dec, BOC/DOCM/BOCM ~11–12 Dec, DOGV any day) changes those
pages' answer, title and layers on its own; seasonal demand.

**Go-live.** Deploy first (code pages), then publish `calendario-2027-espana`; IndexNow prefixes `/es/festivos/2027/`,
`/ca/festius/2027/`, `/en/holidays/2027/`. On or after 2 Dec, one more publish of `calendario-2027-espana` (or any deploy)
renders the new titles.

## 2026-11-18 — "Siguiente paso útil": one onward box right after the answer, six families, ca/es/en (deploy only; no publish group; no title, description or lead touched)

**Observation (GA4, property 554310792).** 4–17 Nov: 24,784 sessions, 27,590 page views, **1.113 views per session**;
17 Nov alone 1,236 sessions, 1,341 views (1.085). Visitors land from Google, read one answer and leave. The 15 landing pages
with most sessions are all strike pages but one:

| # | Landing page | Sessions | Views/session |
| --- | --- | --- | --- |
| 1 | /es/guias/huelga-general-11-noviembre-sevilla | 2,429 | 1.081 |
| 2 | /es/guias/huelga-general-11-noviembre | 1,937 | 1.089 |
| 3 | /ca/guies/vaga-general-11-novembre | 1,525 | 1.118 |
| 4 | /es/guias/huelga-general-11-noviembre-zaragoza | 1,315 | 1.085 |
| 5 | /es/guias/huelga-renfe-rodalies-noviembre | 1,274 | 1.155 |
| 6 | /es/guias/huelga-trenes-17-noviembre | 1,242 | 1.109 |
| 7 | /es/guias/huelga-general-11-noviembre-alicante | 1,054 | 1.067 |
| 8 | /es/guias/huelga-general-11-noviembre-malaga | 832 | 1.096 |
| 9 | /es/guias/candidatos-elecciones-generales-cataluna | 735 | 1.195 |
| 10 | /en/guides/general-strike-11-november-spain | 692 | 1.223 |
| 11 | /es/guias/huelga-general-11-noviembre-vigo | 669 | 1.102 |
| 12 | /es/guias/huelga-hoy-cataluna | 664 | 1.096 |
| 13 | /es/guias/huelga-general-11-noviembre-valladolid | 663 | 1.078 |
| 14 | /ca/guies/vaga-educacio-novembre | 561 | 1.062 |
| 15 | /es/guias/huelga-general-11-noviembre-murcia | 518 | 1.041 |

(Excluded: "(not set)", 1,113 sessions with no page view.) Top page of the other families: holidays
/es/guias/puente-diciembre-espana 273 sessions (1.015), Christmas /ca/tradicions/mercats-de-nadal-catalunya 44 (1.273),
Barcelona practical /en/guides/barcelona-catalonia-tourist-tax 34 (1.029), calculators 28 sessions in all (launched 13 Nov).

**Baseline by landing-page family** (`snapshot.py landing 2026-11-04 2026-11-17`, regexes `LANDING_FAMILIES` in the script;
a session can count under two landing pages, so the rows add up to 25,476 sessions):

| Family | Sessions 4–17 Nov | Views/session 4–17 Nov | Views/session 11–17 Nov | Page views 4–17 Nov |
| --- | --- | --- | --- | --- |
| Strikes | 17,854 | 1.100 | 1.102 | 19,469 |
| Elections | 2,576 | 1.193 | 1.153 | 3,050 |
| Holidays (guides, date and town pages) | 2,171 | 1.270 | 1.317 | 2,741 |
| Christmas (fairs, lights) | 436 | 1.216 | 1.200 | 529 |
| Barcelona practical | 153 | 1.098 | 1.105 | 188 |
| Calculators | 28 | 1.179 | 1.179 | 39 |
| Other | 1,062 | 1.313 | 1.257 | 1,574 |

**Change.** A compact box, "Siguiente paso útil" / "Següent pas útil" / "Next useful step" (`components/NextStep.tsx`; the
tip-callout colours of "Lee también"), right after the answer: under the answer-first summary, else after the key facts,
else after the lead; on the programmatic pages after their answer block. 1–3 links, each anchor the target page's own title
(or the sentence that already links it lower on the page), in the page's language; never the page itself. Links only, no
fact of its own. Rules and dates in `lib/engagement/next-step.ts` (+ `-towns.ts`, `-calculators.ts`); tests
`tests/next-step.test.ts` (every target a path the site builds, all three languages, no past strike day, anchors = titles).

| Family | Pages | The box (as of 18 Nov) |
| --- | --- | --- |
| Strikes, Catalonia | hub, 11N, Renfe, education guides | Rodalies live (`/rodalies/`), then the next two strike days (19N, 20N; from 21 Nov the Renfe 23N and education 26N guides), by `STRIKES_AS_OF` like the pages; then the hubs |
| Strikes, rest of Spain | 11N Spain + 13 city pages, Spain hub, 17N rail, 19N/20N | the next two strike days (19N, 20N), then the Spain strikes calendar |
| Elections | candidates, how to vote, mesa, postal vote, results night, the town election pages | to 19 Nov: postal vote + "¿Dónde voto?" section; 20–29 Nov: "¿Dónde voto?" + results night; after: results night. Town pages (polling places already on them): postal vote while open, results night |
| Holidays | town pages | the 2027 leave planner with the town picked, then the town's Christmas fair page while its season is on, else working days with the town picked |
| Holidays | December bridge, shops, work calendar 2027, bridges 2027, is-today, Easter 2027, school free days; date pages | one seasonal page (bridge → school free days / shops in December by community; shops → bridge; to 8 Dec) + the 2027 leave planner (work calendar and bridges: + working days); date pages: the December bridge (2026 days, to 8 Dec) or the 2027 bridges, + the planner |
| Christmas fairs | guide, hub, town pages; lights guides | lights switch-on, then the December bridge (Barcelona: what's on in December, then the lights); lights → the fairs guide + Barcelona in December; nothing after 7 Jan |
| Calculators | every tool (20) + the leave planner | 1–2 related tools (net salary → extra pay, SMI; dismissal ↔ settlement + dole; dole → subsidy, settlement; mortgage → purchase taxes; IPC → rent update, pensions; …; never one the line just above already links), with the hub card's question as a note; the prize-tax tool → the Christmas lottery guide; ITV in English → the calculators hub (no English fuel page) |
| Barcelona practical | transport cards, airport, parking, ZBE, tourist tax, weather | transport → airport + Rodalies live; airport → transport + Rodalies; parking ↔ ZBE; tourist tax → transport + airport; weather → Barcelona in December (to 31 Dec) + transport |

**Measurement.** Clicks in the box are `related_content_click` with `link_context: "next_step"` (registered dimension),
`link_url` = target path, `locale`; wired in `lib/analytics/clicks.ts` from the box's `data-ci-placement` (docs/ANALYTICS.md).
No GA4 configuration added. Server-rendered plain links: no JavaScript, no layout shift (static HTML; on the fair pages the
box sits below the browser-filled status line, which already moved what follows it).

**Hypothesis.** Readers who got their answer take the one step offered: views per session rise in every family with enough
traffic (strikes, elections, holidays) by at least +0.03 over the 4–17 Nov baseline, and the box gets ≥ 2 clicks per 100
page views of its family. Calculators (28 sessions) and Barcelona practical (153) are too small to read views per session:
read their clicks only.

**Review: 2 Dec 2026** (14 days after the deploy). `snapshot.py landing 2026-11-18 2026-12-01` against the table above
(views/session per family, the "clicks" and "clk/100v" columns), and GA4 Explore on `related_content_click` by Page path ×
Link URL for which links work. Rule per family: < 1 click per 100 page views and views/session not above baseline → drop
that family's box (one line in `next-step.ts` or the template); ≥ 3 per 100 → extend the same step to the family's next
pages (Spain 2027 city pages, school calendars).

**Confounders.** The mix moves on its own: the 11N/17N strike traffic is past its peak, election traffic rises to 29N and
its postal-vote step ends on 19 Nov, Christmas searches grow through December; so compare within families, not the site
total. The answer-first review of 19 Nov reads strike and holiday pages that get the box under their summary from this
deploy (read that review on its own window, to 18 Nov). The strike as-of switches move the strike boxes most days. The
"Lee también" boxes stay as they were. GA4 counts consenting visitors only (both windows alike). Static pages (town
holidays, town elections, fairs) pick their dated links at deploy; the fair and English town pages by the day the fairs
were last read (they never read the clock).

**Deploy.** Deploy only: the box is drawn by the templates, nothing is stored in a body, so no publish group is needed.

**Outcome:** _pending_

## 18 Nov 2026 — 29N election-day layer on the hubs, comarca and town pages; EN how-to-vote answers "how to register" first; census inclusion facts (deploy; groups `voting`, `election-results`)

**Why.** Target 30,000 sessions on 29 Nov (docs/MEDIA_PLAN.md). The election family is page 1 but rarely top 3, and the EN
vote queries click at 0.2–0.4 % at positions 4.7–5.8. Titles, descriptions and leads of the election guides are inside the
11 Nov and 16 Nov windows (reviews 18 and 26–27 Nov): **none touched here**; body and layout only.

**Baseline (GSC 5–18 Nov, 14 d, 18 Nov partial; `snapshot.py page <substr> 14`).**
- `/en/guides/how-to-vote-catalonia/`: 146 clicks / 7,852 impr. / 1.86 % / 6.0. "2026 spain general election how to register
  to vote" 1,602 at 5.8 (3 clicks), "how to vote 2026 spain general election" 1,294 at 4.7 (5), "… dates" 203 at 9.8 (0),
  "… polling stations" 89 at 5.7 (0). Gap: the lead answers registration, but the first H2 under it was "Next elections in
  Catalonia" (the ca/es intent) and "Do I need to register…" was the 7th H2; nothing on moves after the roll closed, turning
  18, or what to do if missing from the list.
- `/es/guias/como-votar-elecciones-cataluna/`: 179 / 10,893 / 1.64 % / 6.5 ("cuando son las elecciones en cataluña" 787 at
  7.1, 0.3 %); `/ca/guies/com-votar-eleccions-catalunya/`: 47 / 1,884 / 2.49 % / 6.8.
- Pages containing "elecci" (es guides + 947 town pages + hub): 3,632 / 70,457 / 5.15 % / 5.9; town queries "mesa electoral
  29n <town>", "censo electoral <town>" at 4–9.

**What changed.**
1. **Election-day layer** (`src/lib/programmatic/elections/election-day.ts`, `ElectionDayCallout`): the ca/es/en hubs, the
   ca/es comarca pages and every town page lead with a server-rendered block by phase, Madrid time: eve (Sat 28: tomorrow's
   hours, ID, where, help line, reflection day), polling (Sun 29 00:00–19:59: 9–20 h and the 20:00 rule, original DNI /
   passport / licence, MiDNI, the INE lookup, on town pages a link to the town's BOP polling places, 900 343 232 from 8 to
   20 h, certificación censal específica, four paid hours, mesa at 8:00, results from 20:00), count (20:00–23:59: the
   official results site as a button once `ELECTION_NIGHT_RESULTS_URL` is set, provisional vs 4–7 Dec count), after (30 Nov–
   7 Dec: provisional vs official, mesa members' five hours on Mon 30). Deterministic: `electionPhase(instant)`, called on the
   server at render time, never the reader's clock. Tests: `tests/election-day.test.ts` (28 Nov, 29 Nov 10:30, 29 Nov 20:30,
   30 Nov, every boundary).
2. **Load:** the 8 election routes go from `revalidate = false` (Cloudflare `s-maxage=31536000`) to `revalidate = 300`, so each
   phase reaches the origin cache and Cloudflare within ~5–10 min without a deploy, a purge-everything (the purge switches to
   whole-zone above 600 URLs) or a timer at 20:00. Back to `false` after 8 Dec (the test fails until then). Town links in the
   hub (~300 visible), comarca tables and town sibling lists no longer prefetch (each prefetch is an uncached RSC request to
   the origin).
3. **EN how-to-vote body order:** registration → where → hours and ID → calendar → postal → next elections (ca/es keep
   "next elections" first, registration moves up after "where"). New registration lines in all three editions: roll closed
   1 Aug 2026 with changes reported by 30 July (a later move is not on it); turning 18 by 29 Nov (LOREG 35.3, 85.2); the
   certificación censal específica and the help line's polling-day hours (INE cid=1700); the deadlines already set (claims
   12–19 Oct, ERTA 31 Oct, postal 19 Nov).
4. **Town pages "censo electoral <town>":** the census section's second paragraph says which roll is used (1 Aug / 30 Jul) and
   the turning-18 rule, ca/es/en.
5. **Results site:** still not announced. Re-read 18 Nov: 29neleccionesgenerales.es home, "Enlaces de interés", sitemap
   (lastmod 3 Nov), no results link; lamoncloa.gob.es timed out, interior.gob.es and infoelectoral 403. `RESULTS_SITE_CHECKED`
   2026-11-13 → 2026-11-18 (the "checked on" date in the town, hub and Congress-results lines). Re-check from a browser on or
   after 26 Nov (test).

Sources read 18 Nov 2026 (curl + grep): LOREG consolidated text (BOE, arts. 28.1, 35.3, 80.1, 84.1, 85.1–3, 88.1, 98.2);
INE 29N page cid=1700; Interior's 29N "voto presencial" page; Correos postal-vote page (19 / 25 Nov); JEC 29N calendar PDF
(4–7 Dec general count, 28 Nov reflection day).

**Prediction.** By 27 Nov (`snapshot.py page how-to-vote-catalonia 7`): "how to register to vote" and "how to vote 2026 spain
general election" ≥ 1 % CTR and position ≤ 4; "… polling stations" ≤ 5. 29 Nov: election family sessions ≥ 15,000 (GA4),
no origin error spike (`journalctl -u catalunyainfo`), `cf-cache-status: HIT` on the hubs.

**Review.** 26 Nov with the 11/16 Nov entries (equal-query, 7 d before vs after the deploy); 30 Nov for the day itself
(`snapshot.py daily 3`, `page /elecciones/ 3`). **Revert rule:** if the EN page loses ≥ 1.5 positions on the two named
queries at equal impressions by 26 Nov with no CTR gain, restore the old section order (one line in `body()`).

**Confounders.** 11 Nov titles and 16 Nov ES lead (same pages), news cycle in the last campaign week, 24 Nov polls ban,
the 19 Nov postal deadline (the "request by 19 Nov" warning box changes on 20 Nov, separate task).

**Go-live.** Deploy (code routes), then publish `voting` and `election-results`. IndexNow prefixes: `/ca/eleccions/`,
`/es/elecciones/`, `/en/elections/`, `/ca/guies/com-votar-eleccions-catalunya/`, `/es/guias/como-votar-elecciones-cataluna/`,
`/en/guides/how-to-vote-catalonia/`. Checks after deploy: `curl -sI https://www.catalunyainfo.com/es/elecciones/ | grep -i
cache-control` must say `s-maxage=300`; on 28 Nov 00:10 and 29 Nov 00:10 / 20:10, `curl -s <town URL> | grep -o 'data-phase="[a-z]*"'`.

**Outcome:** _pending_

## 2026-11-18 (afternoon) — Strikes: SCF calls off the 19 Nov Adif strike; "Fuentes revisadas" now prints the verification date; CIS pre-electoral in on the polls page (deploy; groups `strikes`, `huelgas-espana`, `huelga-19-20n`, `huelga-trenes-17n`)

**Why now.** Five dated guards failed on main: the nightly timer had moved `STRIKES_AS_OF` / `STRIKES_SPAIN_AS_OF` to 18 Nov while
`*_VERIFIED` stayed 17 Nov, and the strike leads printed "Fuentes revisadas el <as-of>" although nobody had re-read the sources.

**Sources re-read 18 Nov 2026 (afternoon; curl with a browser UA; fact pack research_notes/x10/strikes-18nov-factpack.md).**
- NEW — SCF, SCFCOM 38 (17 Nov, 22:25), https://www.scf.es/com38/: "SCF ha acordado la desconvocatoria para el día 19" (call-off
  agreement PDF linked there, scanned). The 19 Nov Adif strike is off; no rail strike is left on the 19th.
- Ministry of Transport rail list (https://www.transportes.gob.es/transporte-terrestre/resoluciones-de-servicios-minimos-ferroviarios,
  answered 200 today): newest still the 12 Nov Grupo Renfe resolution (17N). No Adif resolution for 17 or 19 Nov
  (`ADIF_MS_PUBLISHED` stays false: never published), none for the rest of Renfe on 23N. Air list (aviacion-civil page): newest the
  17N ones and ELA Bizkaia. Press room: 17 Nov note on the urgent processing of the RD 929/2020 change (traffic-control rest
  times), no strike content.
- SEMAF nº 2026-35 (17 Nov): "afrontamos el 23 de noviembre como la próxima jornada de movilización" (23N kept).
- Departament d'Empresa i Treball list: newest 17/11 (23N Renfe order); newest 100 e-Tauler edicts (16–18 Nov): no 26N
  education order. USTEC·STEs / CGT Ensenyament: nothing new on 26N (no hours). Metges de Catalunya: newest item 17 Nov, no
  call-off. SMU: no call-off, marches 19 Nov 18:00. Sindicato de Estudiantes: 20N kept. BOE 18 Nov: no strike order.

**What changed (ca, es, en).**
- **19N day page — correctness fix inside its first days** (published 17 Nov 13:00): H1 "Huelga 19 de noviembre de 2026: Adif (no
  Renfe), médicos, limpieza en Bizkaia y Madrid" → "Huelga 19 de noviembre de 2026: médicos, limpieza en Bizkaia y Madrid; Adif,
  desconvocada"; title "Huelga 19 de noviembre de 2026: Adif (no Renfe) y médicos" → "Huelga 19 de noviembre de 2026: médicos;
  Adif, desconvocada" (ca "Vaga 19 de novembre de 2026: metges; Adif, desconvocada", en "Spain strike 19 November 2026: doctors;
  Adif called off"); descriptions, excerpt, lead, FAQ and "lo que no hay ese día" say there is no rail strike (SCF's call-off
  printed from `SPAIN_NOT_HAPPENING`, linked). Anchors `B2_TITLES.strike19n` alike. Reason: the old wording announced a strike
  that is not happening.
- **Rail entry 17/19 → 17 only** (both hubs): dates, short, label ("Trens/Trenes/Trains on 17 November"), facts (SCF's quote),
  `msShort` ("…; el 19, desconvocada"), Adif part of the minimum-services text ("sin resolución publicada"). Data-driven effects:
  the entry is past from the 18th, so the **17N page** shows its `after` lead/description (scheduled for the 20th, now from the
  18th; its dated 18–19 Nov description variant is removed) and keeps a "Jueves 19: huelga en Adif, desconvocada" section until
  the 19th; the **Renfe guide** covers the 23 Nov SEMAF strike from the 18th instead of the 20th (its own data-driven title,
  "Huelga Renfe 23 de noviembre: Rodalies y servicios mínimos"); the alert-strip line for 17N ends on the 17th and the 23N line
  starts on the 18th. Bug fixed on the way: the guide's "when" key fact did not read the 23N entry's "Día y horas" label.
- **Honesty fix (allowed inside any window, no title/description wording change):** every "fonts revisades / fuentes
  revisadas / sources checked / consultat el / revisada" line and every `{checked}` now prints the verification date
  (`STRIKES_VERIFIED`, `STRIKES_SPAIN_VERIFIED`, the earlier of the two on the day and 17N pages) — never a later as-of day:
  hub leads and "what runs" note, the guides' "consultat el", the Spain hub, the 19N/20N leads, the /hoy/ page and the WhatsApp
  draft's staleness warning. The four constants are typed `string` (the tsc `never` error at tests/strike-days-1920n.test.ts:228).
- **Polls page (body only, title untouched):** CIS study 3584 (avance of 12 Nov) in, with its provincial seat ranges for
  Catalonia and the LOREG technical sheet; CEO third wave still not announced (re-check by 20 Nov). Force-dynamic: ships with
  the deploy.

**Baseline / review.** 20 Nov with the 17 Nov entry's readings (`snapshot.py page huelga-19-noviembre 3`, `page
huelga-renfe-rodalies 3`): expect "huelga renfe 19 noviembre" CTR to hold or rise on the 19N page with "desconvocada" in the
title. No revert rule: the old title is false.

**Go-live.** Deploy, then publish `strikes`, `huelgas-espana` (both also republish the 19N/20N pages), `huelga-trenes-17n`;
IndexNow prefixes `/es/guias/huelga-`, `/ca/guies/vaga-`, `/en/guides/spain-strike-19-november`,
`/en/guides/spain-rail-strike-17-november`, `/en/guides/renfe-rodalies-strike-november`, `/en/guides/strike-barcelona-catalonia-today`,
`/es/guias/huelgas-espana`, `/ca/guies/vagues-espanya`, `/en/guides/strikes-spain`.

## 2026-11-18 — "Bono social eléctrico: ¿tienes derecho?", eligibility checker, es + ca + en (new page; deploy only, no publish group)

**Why.** Research row 19 (research_notes/spain-utilities-opportunities-nov2026.md): "bono social" ≈ 39k/month in
Spain, March index 135, October 113. The SERP (consumoresponde, comunidad.madrid, papernest, MITECO #4) **contradicts
itself on the discount** (42.5/57.5 vs 35/50) and has **no household-income checker**. Both figures are "right": 35/50 is
the permanent rule (RD 897/2017 art. 6.3, which is all the BOE consolidated text shows), 42.5/57.5 is 2026 only (RDL
7/2026 art. 1, after RDL 16/2025 and RDL 2/2026, which set the same rates, were repealed by Congress on 27 Jan and 26 Feb
2026). The page says so. Fact pack: research_notes/bono-social-electrico-nov2026.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/bono-social-electrico/` (primary), `/ca/calculadores/bo-social-electric/`,
  `/en/calculators/bono-social-electricity-spain/` (sitemap + hreflang, x-default en; llms.txt entry; site-search
  shortcut "bono social"; `calculator_use` id `bono-social`). Registry `CALCULATORS` id `bono-social`; new hub group
  `energy` ("Luz y energía en casa") right before the live group (PVPC, butane). Next step under the tool: PVPC, butane.
- Facts (all read 18 Nov 2026, curl + grep; every quote checked verbatim against the downloaded texts): RD 897/2017 arts.
  2, 3, 4, 5.1, 6.3, 6.4, 8.2, 9, 12 and Annex I (BOE-A-2017-11505, última actualización 28/01/2026); RDL 7/2026 arts. 1
  and 4 (BOE-A-2026-6544; validated 26 Mar 2026, BOE-A-2026-7125); RDL 8/2021 art. 4.1; Orden ETU/943/2017 art. 4.1
  (income = general + savings taxable base); IPREM 600 €/month, 8,400 € in 14 payments (Ley 31/2022 DA 90ª, still
  applied: SEPE "Cuantías anuales" 2026; MITECO). MITECO's FAQ euro examples (12,600 / 19,320 / 23,520; +8,400 special;
  half for severe; 16,800 large family; 8,400 minimum pensioners) are test fixtures. kWh caps 1,587 / 2,222 / 2,698 /
  4,761 (MITECO monthly 132 / 185 / 224 / 396), most favourable row. Reference suppliers: name + phone from MITECO only
  (their sites: two 403, one 404, not linked).
- Server-rendered: the checker on 2 adults + 2 minors + 20,000 €, the discount table, the income table (8 households,
  with and without a special circumstance), the kWh table, 8 worked examples, 7-question FAQ + FAQPage JSON-LD, YMYL
  disclaimer with MITECO's requirements link, sources, limits.
- Links: the PVPC pages (bono social paragraph + related links) and the butane page (bono social térmico paragraph +
  related links) now link the checker, and it links both back. The PVPC pages' MITECO link
  (`/es/energia/energia-electrica/bono-social.html`) answered **404**: replaced by MITECO's requirements page. Body only:
  no title or description touched on the PVPC or butane pages.

**Date guard (tests/bono-social.test.ts).** From **31 Dec 2026** the test fails: that day the 42.5/57.5 discount and the
no-cut-off guarantee (RDL 7/2026 arts. 1 and 4) end. Re-read the BOE for an extension decree-law (late December is when
the previous ones came) and the 2027 IPREM; until one is published, the page already says 35/50 from 1 Jan 2027 "if not
extended", so the text is right on either side of the date but must be updated the day the BOE speaks.

**Baseline:** 0 (no page; the PVPC pages carry one bono social paragraph).

**Prediction.** Indexed within 7 days (IndexNow the three URLs). The head "bono social" is navigational/government-bound:
positions 8–20 by mid-December; long tail page 1 possible ("bono social 2026 descuento", "bono social requisitos ingresos",
"bono social familia monoparental", "límite ingresos bono social 2026", "bono social 42,5"). January brings a "bono social
2027" wave if the rates change. By 13 Jan 2027: 3,000–10,000 impressions/28 days, CTR 2–5 %. Wrong if under 800
impressions/28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered checker + tables); 16 Dec and 13 Jan 2027 `snapshot.py page
bono-social-electrico 28` (+ bo-social-electric, bono-social-electricity-spain); PVPC pages' related-link clicks to it in
the 2 Dec next-step review. **Review: 2026-12-16.**

**Confounders.** The PVPC pages' 27 Nov review reads the same body plus one more paragraph and link (no title change). Any
late-December decree-law on the bono social will move searches and force a page update inside the window.

**Deploy.** Deploy only (static, nothing in the database): no publish group. IndexNow prefixes:
`/es/calculadoras/bono-social-electrico/`, `/ca/calculadores/bo-social-electric/`,
`/en/calculators/bono-social-electricity-spain/`, plus the re-crawl of `/es/precio-luz/`, `/ca/preu-llum/`,
`/en/electricity-price-spain/`, `/es/precio-butano/`, `/ca/preu-buta/`, `/en/butane-price-spain/` and the calculators hubs.

## 2026-11-18 — Calendario laboral 2027: 11 more towns of 20,000+ from their council's own minutes, before their community's list (deploy; group `calendario-2027-espana`)

**Why.** Row 1 of `research_notes/spain-utilities-opportunities-nov2026.md` ("calendario laboral <ciudad> 2027", tier A,
peaks Dec–Jan). The "~400 more towns" of that note (13 Nov) is out of date: INE padrón 1 Jan 2025 (RD 1117/2025, the 56
province CSVs re-read today) has 432 municipalities of 20,000+; 70 are Catalan (own engine), 2 are Ceuta and Melilla, 276
already had a page, so the whole gap was the 85 towns of `WAITING_TOWNS` (83 in the six communities whose list is not
out, 2 left out of a published list). Nothing else is missing at 20,000+.

**Facts read 18 Nov.** The six pending bulletins, today's issue each, by their own summary ("fiestas locales /
laborales / calendario de fiestas"; the same search finds the 2026 list on its day): DOGV 10496, BOA 223, BOCM 277, DOCM
221, BON 230, BOC 222 — none has the 2027 list (as the morning reading, `PENDING_CHECKS`). Arcos de la Frontera: no BOJA
211–223 adds it. Cangas: no DOG 205–221 corrects its 19 March. So no regional bulletin to transcribe. Second route the
brief allows: the council's own act. For the 83 towns, the plenary minutes on each council's site (four read-only
research agents found candidates; every one re-read here with curl + pdftotext, quote, item, vote and signature checked):

| Town (community) | Act | Days |
|---|---|---|
| Puertollano (CM) | Acta Pleno 25.6.2026, p. 5 | 13 May, 8 Sep |
| Burjassot (VC) | Acta Pleno 31.3.2026, p. 3 | 16 Aug, 30 Sep |
| Santa Pola (VC) | Acta Pleno 28.5.2026, p. 3 | 16 Jul, 8 Sep |
| Ontinyent (VC) | Acta Ple 28.5.2026, p. 3 | 23 Aug, 22 Nov |
| Villena (VC) | Borrador acta Pleno 25.6.2026 (signed 22.7), pp. 10–11 | 5 Apr, 10 Sep |
| Manises (VC) | Acta Pleno 30.7.2026 (video-acta platform linked from manises.es), p. 9 | 5 Apr, 19 Jul |
| Crevillent (VC) | Acta Pleno 28.7.2026, p. 12 | 25 Mar, 4 Oct |
| Vinaròs (VC) | Esborrany acta Ple 18.6.2026 (signed 29.7), p. 14 | 20 Jan, 24 Jun |
| Novelda (VC) | Acta Pleno 7.5.2026, p. 17 | 5 Apr, 22 Jul |
| Alboraya (VC) | Acta 6/2026 Pleno 25.6.2026 (video-acta linked from alboraya.es), pp. 2–3 | 5 Apr, 10 Jul (Sat) |
| Llíria (VC) | Acta Pleno 26.3.2026 (approved 30.4), p. 2 | 5 Apr, 29 Sep |

URLs, items, expedientes and votes in the header of `src/lib/programmatic/spain-2027/cities-council.ts`. No day is a
BOE holiday of its community (test). **Not used:** agendas only (Mislata, Algemesí, Catarroja, Riba-roja, Onda,
L'Alfàs, San Fernando de Henares, Torrelodones), an extract without dates (Galapagar, adopted 3.11.2026), council news
posts (Alcázar de San Juan, Valdepeñas, Almansa, Calatayud, Burriana, Villajoyosa), a stale council page (San Fernando
de Henares' "28 y 31 de mayo de 2027" links the 2025 BOCM list). **Still unpublished (no page):** Comunitat Valenciana 43
towns (DOGV, 2026 precedent 14 Nov), Madrid 13 (BOCM ~12 Dec), Castilla-La Mancha 9 (DOCM ~12 Dec), Cantabria 3 (BOC
~11 Dec), Navarra 3 (BON ~2 Dec), Aragón 1 (BOA ~20 Nov).

**What changed.**
1. New status `"council"` (`cities-data.ts`), rows in `cities-council.ts` (11 towns × es/ca/en = 33 URLs), out of
   `WAITING_TOWNS` (85 → 72). Same template as the other city pages: layers block (BOE common days, community days with
   decree, local days), weekday on every date, bridges, FAQ, leave planner and working-days links, .ics, widget. Every
   place a bulletin would be named says instead "Las aprobó el Pleno del Ayuntamiento el <fecha>; falta que las publique
   el DOGV (consultado hasta el DOGV núm. 10496, de 18.11.2026)"; captions and list lines "(aprobadas por el
   Ayuntamiento)"; the source is the minutes, linked. ca/en the same.
2. Counting tools follow the Catalan council precedent (`council-2027.ts`): the .ics feed, the widget and the
   working-days calculator leave the council's days out until the bulletin (`officialCalendar`, `bulletinLocal2027`);
   the leave planner carries them apart with a new status `"k"` and counts them only when the box is ticked (copy
   ca/es/en: "pendientes del boletín de la comunidad").
3. No 2026 page exists for these towns (outside Catalonia only the 11N strike cities had one), so no 2026 → 2027 link.
4. Indexing: ES indexable (no rule matches); ca/en noindex by the existing `spain-2027-ca` / `spain-2027-en` patterns,
   no keep-list change. Titles follow `cityTitle` (the 2 Dec switch applies to them too).
5. Tests: `tests/spain-2027-council-towns.test.ts` (each town cites the minutes on the council's own host with the
   session date; community still pending, so the day it publishes the test fails until the town is transcribed from the
   bulletin into `cities-more.ts`; 20,000+, unique, out of the waiting list; days off the BOE ones, printed weekdays;
   copy says "pendiente"; tools exclude the days; sitemap and indexing). Existing city, ICS and planner tests taught the
   new status.

**Baseline.** The 11 URLs: 0 impressions (no page until today). Family as in the entry above (ES city pages 5–18 Nov:
15,270 impr., 137 clicks, position 9.4).

**Prediction.** By 15 Dec: ≥ 6 of the 11 ES pages with impressions; their "festivos / calendario laboral <town> 2027"
queries at ≤ 10 median position. When the DOGV / DOCM list comes out, ≥ 10 of 11 match the council's days (a mismatch is
logged and the bulletin wins).

**Review 2026-12-02** (`snapshot.py page /festivos/2027/ 14`, the 11 paths; re-read the six bulletins: any published list
moves its council towns to `cities-more.ts` the same day), then 15 Dec and 15 Jan with the 13 Nov rule (fewer than 3 of
the 11 with impressions by 15 Jan → noindex them in `low-demand.ts`). Date guards already running: `WAITING_RECHECK_BY`
25 Nov, `STATUS_RECHECK_BY` / `CITIES_RECHECK_BY` 27 Nov.

**Go-live.** Deploy (new static params for the 11 slugs in es/ca/en, the planner's status "k"), then publish
`calendario-2027-espana`; IndexNow prefixes `/es/festivos/2027/`, `/ca/festius/2027/`, `/en/holidays/2027/`.

**Outcome:** _pending_


## 2026-11-18 — New live page: "Avisos ara a Catalunya" / "Avisos hoy en Cataluña" / "Warnings in Catalonia now" (ca/es/en; ships with the deploy) + a compact item on the today page (review 2026-12-16)

**URLs.** `/ca/avisos/`, `/es/avisos/` (one folder, `app/(public)/[locale]/avisos`), `/en/warnings/`. ISR every
300 s (`revalidate = 300`, literal = `SERVER_REVALIDATE_SECONDS` in `lib/programmatic/warnings/server.ts`, test-guarded);
`/api/warnings/now/` (force-dynamic, `s-maxage=300`) feeds the new "Hi ha avisos oficials?" item on `/ca/avui/`,
`/es/hoy/`, `/en/today/` (browser island, like PVPC/Rodalies). Sitemap (hourly lastmod), llms.txt, hub "Live data" card.

**Sources and licences (checked 18 Nov 2026 from the VPS, all keyless).**

| Source | Endpoint | Format / rate | Licence (quoted) | Used |
| --- | --- | --- | --- | --- |
| AEMET Meteoalerta, Catalonia (area 69) | `https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC69_RSS.xml` → tar.gz bundle → CAP 1.2 files (offered at aemet.es/es/rss_info/avisos/cat) | RSS + CAP XML; CloudFront max-age 60; AEMET issues 07:30–09:00, 10:30–11:30, reviews 17:00–19:00, 23:50 D+3 | Nota legal: "permiten la reutilización … para fines comerciales y no comerciales"; cite "© AEMET" or "Información elaborada por la Agencia Estatal de Meteorología"; "Debe mencionarse la fecha de la última actualización"; "No se puede indicar … que AEMET … participa, patrocina, o apoya" | yes |
| Servei Català de Trànsit incidents | `https://www.gencat.cat/transit/opendata/incidenciesRSS.xml` (open-data entry `uyam-bs37`, update "Contínua"; GML twin `incidenciesGML.xml`) | RSS, Catalan; Last-Modified every ~15 min | Llicència oberta d'ús d'informació – Catalunya: cite "Generalitat de Catalunya. Departament de [nom departament]. [organisme autònom…]"; "S'ha d'informar de la darrera data d'actualització"; "No es pot alterar el contingut" | yes |
| Protecció Civil plans in pre-alert/alert/emergency | `https://analisi.transparenciacatalunya.cat/resource/wj9c-j6vf.json` | Socrata JSON, update "Variable"; empty = no plan ("Quan no hi ha cap pla d'emergència activat, el conjunt de dades és buit") | same Generalitat licence (attribution "Direcció General de Protecció Civil") | yes |
| Meteocat SMP warnings | `api.meteo.cat` | JSON API, **key required** (403 without; registration at apidocs.meteocat.gencat.cat "Plans i registre") | — | **no: owner action** |
| AEMET OpenData API | `opendata-api.aemet.es` | **key required** (registration with email) | — | not needed (RSS/CAP are keyless) |
| DGT DATEX II | nap.dgt.es | keyless | — | no: Catalonia's roads are SCT's competence |

**What the page prints.** Answer first (AEMET in force / coming up with the highest level, Protecció Civil plans, SCT
incident and closure counts), then tables: AEMET warnings in force and coming up (level chip + word, phenomenon, AEMET zone
verbatim, province from the zone code, from–to in Madrid time, AEMET's Spanish text verbatim with probability); Protecció
Civil plans (empty state with the dataset's last update); SCT traffic incidents, works with the road closed, other works in
a `<details>`. Each section ends with the attribution the licence asks for and the source's own update time. Empty states:
"No hi ha avisos en vigor segons l'AEMET a les HH:MM" (es/en equivalents). Failure: "No hem pogut llegir … a les HH:MM" +
link, never "no warnings". Held reads (source down) only while recent (AEMET/Protecció Civil 3 h, SCT 45 min) and printed
with their time; AEMET files older than 18 h and SCT feeds older than 60 min are not current. Kept file
`/srv/catalunyainfo/shared/cache/warnings-last-good.json` (`WARNINGS_SNAPSHOT_FILE`). No committed snapshot of warnings on
purpose (it would be stale by definition); committed: the guidance, AEMET's level definitions (quoted from its guide, our
translation in ca/en) and the plan glossary from Protecció Civil's `wfei-fjk5` (INUNCAT inundacions, NEUCAT nevades,
VENTCAT vent…).

**Titles (new pages, no baseline; static, no figures — a cached snippet with a count would go stale).** ca "Avisos ara
a Catalunya: AEMET, trànsit i Protecció Civil"; es "Avisos hoy en Cataluña: AEMET, tráfico y Protección Civil"; en
"Warnings in Catalonia now: weather, roads, civil protection".

**Links in (body only, no title/description change).** Today page item (static, ships with the deploy). Snow guide
"Abans de sortir / Antes de salir / Before you set off" list (group `snow-now`, which also republishes `ski` and the snow
trips guide unchanged). Rainy-day guide, the "Avisos i previsió" line (group `rainy`). **Not** the Barcelona weather-by-month
guide (`climate`): its EN title window runs to 9 Dec and the 19 Nov H3 patch (`docs/patches/weather-month-h3-19nov.patch`)
must apply cleanly and be measured alone — add the link after 9 Dec. The new page links to it.

**Hypothesis.** Winter queries ("avisos meteocat", "alerta neu", "avís groc vent", "estat carreteres", "incidències
trànsit", "avisos aemet cataluña", "carreteras cortadas cataluña") on storm and snow days reach a page that answers in its
first line from the official feeds; returning users from the today page.

**Review.** 2026-12-16 (`snapshot.py page avisos 14`, `page warnings 14`; queries with avis|alert|aemet|meteocat|neu|
nieve|trànsit|tráfico|carreter); 1 Dec: indexed? (URL inspection). Ops check after deploy: the HTML of `/ca/avisos/` shows
the three source lines with times < 10 min old; `/api/warnings/now/` 200.

**Owner actions.** (1) Meteocat SMP warnings: request an API key at https://apidocs.meteocat.gencat.cat/ ("Plans i
registre"; needs the owner's email) — then they can be added next to AEMET's. (2) None needed for AEMET (RSS/CAP keyless),
SCT or Protecció Civil.

**Go-live.** Deploy (new routes, API, today page, hub card, sitemap, llms.txt ship with it), then publish `snow-now`,
`rainy`; IndexNow prefixes `/ca/avisos/`, `/es/avisos/`, `/en/warnings/`, `/ca/avui/`, `/es/hoy/`, `/en/today/`,
`/ca/guies/neu-pirineu-avui`, `/es/guias/nieve-pirineo-hoy`, `/en/guides/snow-pyrenees-today`,
`/ca/plans/que-fer-catalunya-quan-plou`, `/es/planes/que-hacer-cataluna-cuando-llueve`, `/en/things-to-do/catalonia-rainy-day`,
`/es/calculadoras/`, `/ca/calculadores/`, `/en/calculators/`.

## 2026-11-18 — New page: "Comprobar Lotería de Navidad 2026" (number checker, es/ca/en; deploy, then group `comprobar-loteria`; review 2026-12-29)

**URLs.** `/es/comprobar-loteria-navidad/` (primary), `/ca/comprovar-loteria-nadal/`,
`/en/check-spanish-christmas-lottery-ticket/`; evergreen (same URLs for 2027). Code route family
`src/lib/programmatic/lottery-check/`, sitemap (+hreflang, x-default en), llms.txt (with the gordo hub, which was
missing), `calculator_use` id `lottery-check`. Data: `/data/loteria-navidad.json` (noindex, `s-maxage=300`, purged by
`comprobar-loteria` and `gordo-navidad`), built from the committed gordo snapshot, which now carries the pedrea.

**What.** Before the draw: what the checker will do, the 17 prize categories of SELAE's 2026 programme (read 31 Oct;
15,304 prizes, 14 M€ per series) per décimo, per euro and net after the levy, the derived-prize rules quoted from
BOE-A-2010-19540 (the BOE has published no Lotería Nacional programme since March 2011; "pendiente de confirmar" until
SELAE's 2026 wording is read: `PROGRAMME_CONFIRMED`, test fails from 14 Dec), the draw, collecting, official ways to
check, FAQ (6, FAQPage JSON-LD). From the 22 Dec snapshot: the checker (number + amount played → every prize, per
décimo/euro, net), the 13 drawn prizes, the derived ones and the full pedrea grouped by thousand. Never "no prize"
before all 1,807 numbers are in.

**Titles (new pages, no baseline).** es "Comprobar Lotería de Navidad 2026: décimo, pedrea y premios"; ca "Comprovar la
Loteria de Nadal 2026: dècim, pedrea i premis"; en "Check your Spanish Christmas Lottery ticket 2026 (El Gordo)". Titles
stay the same on draw day; the description switches by design to lead with the Gordo's number (like the gordo hub).

**Links (body only, no title or description change).** Gordo hub ca/es/en: one sentence under "how to check a décimo"
(hub window "measure from 23 Dec" untouched). Prize tax calculator: related list + next-step box (checker first).
Lottery guide: one line in "how to check" — **publish `loteria-nadal` only after its 1 Dec review** (13 Nov body change).

**Baseline.** 0 impressions (new). Demand is the year's peak on 22 Dec ("comprobar lotería de navidad", "comprobar
décimo", "números premiados lotería navidad 2026", "pedrea").

**Hypothesis.** Indexed by mid-December, the page ranks top 10 for "comprobar lotería navidad" / "pedrea lotería navidad
2026" on draw day and the hub and calculator pass their visitors to it (views/session on the lottery family ≥ 1.3).

**Review 2026-12-29** (`snapshot.py page comprobar-loteria 7`, `page comprovar-loteria 7`, `page check-spanish-christmas 7`;
GA4 `calculator_use` `lottery-check`). Before then: 1 Dec indexed? (URL inspection), 14 Dec programme confirmed.

## 2026-11-18 — Pillar E (links): embeddable 2026 calendar + two calculator widgets, "embed this" boxes, and the local-holiday data report with CSV, ca/es/en (deploy; groups `festius-locals-dades`, `widgets-calculadores`, `calendari-2027-widget`) (review 2026-12-16, links 2027-02-18)

**Why.** `docs/MEDIA_PLAN.md` pillar E: the media beat us on authority. Earned links need assets other sites want on
their pages. Outreach is drafted in `docs/OUTREACH_PLAN.md` and nothing has been sent (house rule: the owner approves
each message).

**New URLs (indexable).**
- Data report: `/ca/festius/dades-festius-locals/`, `/es/festivos/datos-festivos-locales/`,
  `/en/holidays/local-holidays-data/` (lib/programmatic/holidays/report.ts). Every figure is computed from the 2026
  DOGC order snapshot (Ordre EMT/208/2025 + EMT/3/2026, Idescat PMH 2025) and the 433 councils' 2027 approvals
  (`council-2027.ts`), which switch to the order automatically once `local-2027.json` is parsed. Ranked bar list
  (HTML, colours validated with the dataviz script) + table, weekday, month, comarca and nuclei tables, a 2027
  section, CSV download, "how to cite" code, sources, method, and Dataset JSON-LD (CC BY 4.0, `distribution`). In the
  sitemap with hreflang and in llms.txt. Linked from the three holiday hubs (one line each, no title or description
  change) and from the widget page.
- CSV: `/data/festius-locals-catalunya-2026-2027.csv` (3,649 rows, BOM, a source and URL on every row, `Link:
  rel=canonical` pointing to the report and `rel=license` CC BY 4.0). Not in the sitemap.

**Computed findings (to quote in outreach).** 2026: 917 municipalities with local holidays, 1,772 own local days on 201
different dates. Whit Monday, 25 May, is a local holiday in 139 municipalities, home to 3.6 M people (44.5 % of
Catalonia). 24 Sep is a local holiday in 10 municipalities with 2.2 M people. 61.9 % of local holidays fall on a Monday or
a Friday. August has the most local holidays (289, 16.3 %). 30 councils made no proposal. 2027 so far: 433 councils (81.3 %
of the population) have approved their days. Whit Monday (17 May) leads again with 87.

**Widgets (noindex, `indexifembedded`, canonical to the source page).**
- `/embed/<l>/2026/<municipi>/`: the 2026 DOGC calendar for every Catalan town, next to the existing 2027 one. The
  builder on `…/2027/al-teu-web/` gains a year picker, with 2026 for Catalan towns only.
- `/embed/<l>/calc/net-salary/` and `/embed/<l>/calc/working-days/[<place id>/]`: GET forms answered on the server with
  the same engines as the calculator pages. No script, no cookie, no analytics. Default views are CDN-cacheable for a
  day; results are `private, no-store`.
- Headers: `EMBED_CALC_SOURCE` adds `form-action 'self'` on `/embed/*/calc/*` only. Every other path keeps
  `X-Frame-Options: DENY` and `frame-ancestors 'none'` (tests/embed-widgets.test.ts).
- Change to the 2027 widget: it now carries `<link rel="canonical">` to its attribution page. The 11 Nov build said "no
  canonical" (task brief of 18 Nov). Watch in GSC that the town pages are not dropped, i.e. that no noindex is inherited.

**"Embed this" boxes (body only, no title or description touched).** Every town and city page: the
`WidgetPlaceLink` line becomes a folded box with that place's iframe + link code and a copy button. The net salary pages
(ca/es/en) and working-days pages (ca/es/en) get a folded box. The working-days box has a place picker, so a council can
embed its own town.

**Baseline.** New pages: 0 impressions. Referring domains: the GSC Links report is UI-only (the API does not expose it).
The owner notes the "Top linking sites" count on deploy day. /embed/ requests: count by Referer origin in the Caddy
access log (the browser sends origin only).

**Prediction.** By 16 Dec, the report is indexed in all three languages and shows impressions on "festius locals" queries.
By 18 Feb 2027, at least 5 new referring domains to the report, the widget pages or the town pages (embeds + citations),
counting only after owner-approved outreach.

**Review 2026-12-16** (URL inspection of the three report URLs; `snapshot.py page dades-festius-locals 28`,
`page datos-festivos-locales 28`, `page local-holidays-data 28`; check that the 2027 town pages kept their impressions
after the canonical change). **Links review 2027-02-18** (GSC Links: referring domains; Caddy /embed/ referers).
When the 2027 DOGC order is parsed: deploy, then run `festius-locals-dades` again (the copy switches to "dogc" by itself).

**Go-live.** Deploy, then publish `festius-locals-dades`, `widgets-calculadores`, `calendari-2027-widget`. IndexNow
prefixes: `/ca/festius/dades-festius-locals/`, `/es/festivos/datos-festivos-locales/`,
`/en/holidays/local-holidays-data/`. The groups already ping their own paths. The town pages' box is a body-only change
and needs no ping.

**Outcome:** _pending_

**Correction 18 Nov 2026 (main session):** the embed widgets (2026/2027 calendars, calculator embeds) carry NO `rel=canonical` after all. They stay `noindex, indexifembedded`; the attribution link alone points to the source page. Reason: Google has said noindex combined with rel=canonical can pass the noindex to the canonical target, which would risk the town and calculator pages. The 11 Nov build had avoided it for that reason.

## 2026-11-18 — Town hubs: each municipality's holiday, Christmas fair and election pages link each other, the holiday page leads (deploy only; no publish group; no title, description or lead touched)

**Observation (GSC 22 Oct–18 Nov, `snapshot.py towns 2026-10-22 2026-11-18`; GA4 to 17 Nov, consenting visitors only).**
A town has up to three pages that did not know each other: holidays (`/ca/festius/<town>/`, `/es/festivos/<town>/`, 29
in `/en/holidays/`), Christmas fairs (44 towns) and elections (947 in ca/es, 30 in en). Before this change the holiday
page linked the fair only through the next-step box (in season) and never the election page; the election page linked
neither; the fair page linked the holiday page inside one sentence only when a fair day was a local holiday.

Strongest page per town, measured: of the 943 towns with impressions, the **election** page leads in 609 by impressions
(634 by clicks), the holiday page in 317 (288), the fair page in 17 (21). That is the 29N run-up: across the families the
holiday pages already carry more impressions (105,983 vs 101,499) and lead in more towns in the latest 14 days (365 of
943, 4–17 Nov) than over 28 (317). Example, `snapshot.py page /mataro/ 28`: holidays 90 clicks / 2,468 impressions, the
election page 13 / 613. **Hub = the holiday page**: the only family with demand all year (2027 calendar queries peak in
December–January), the one that holds the 2027 days, the today/tomorrow box and the .ics feed, and a hub that does not
flip once election demand ends in the first week of December.

**Baseline per family** (pages = URLs with impressions; position = impression-weighted average; v/sess = GA4 views per
session of sessions that landed on that family's town pages):

| Family | Pages | Clicks | Impr. | CTR | Pos. | GA4 sess. | v/sess | | 4–17 Nov: clicks | Impr. | Pos. | GA4 sess. | v/sess |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Holidays ca | 829 | 1,154 | 34,322 | 3.36 % | 6.0 | 517 | 1.354 | | 819 | 24,677 | 6.0 | 432 | 1.405 |
| Holidays es | 781 | 1,480 | 70,998 | 2.08 % | 6.7 | 653 | 1.355 | | 880 | 35,451 | 6.6 | 523 | 1.403 |
| Holidays en | 26 | 9 | 663 | 1.36 % | 8.2 | 5 | 1.400 | | 6 | 399 | 6.9 | 4 | 1.000 |
| Fairs ca | 37 | 185 | 6,740 | 2.74 % | 6.6 | 90 | 1.233 | | 157 | 5,877 | 6.7 | 82 | 1.195 |
| Fairs es | 37 | 263 | 10,621 | 2.48 % | 7.2 | 163 | 1.209 | | 232 | 9,600 | 7.3 | 152 | 1.178 |
| Fairs en | 3 | 11 | 220 | 5.00 % | 8.6 | 16 | 1.000 | | 10 | 198 | 9.1 | 16 | 1.000 |
| Elections ca | 890 | 1,616 | 50,682 | 3.19 % | 5.6 | 651 | 1.204 | | 978 | 27,483 | 5.7 | 486 | 1.212 |
| Elections es | 848 | 2,643 | 50,188 | 5.27 % | 4.8 | 1,059 | 1.183 | | 1,219 | 25,012 | 5.2 | 648 | 1.207 |
| Elections en | 25 | 23 | 629 | 3.66 % | 5.2 | 13 | 1.385 | | 18 | 412 | 5.4 | 13 | 1.385 |

**Change.** A compact, server-rendered list "<Town>: tot el que hi ha a CatalunyaInfo" / "…: todo lo que hay en
CatalunyaInfo" / "…: everything on CatalunyaInfo" (`components/TownHub.tsx`, rules in `lib/engagement/town-hub.ts`), low on
the page: after the FAQ, i.e. after the answer and the next-step box, before the sibling-town lists. Items, in this order,
each only if the page exists for the town in that language and is indexable (`isLowDemandPath`), and never the current
page's own family: the holiday page (its H1) with jump links "calendari 2027" (`#festius-2027`) and "és festiu avui o
demà?" (`#avui`); the fair page (its H1) while one of its fairs is still to end; the election page ("On votar el 29N a X:
locals electorals i meses" to 29 Nov, then the page's H1 "Resultats de les eleccions a X"); the working-days calculator
with the town picked (`#p=<town>`; towns with days in the order); the .ics feed through the holiday page's subscribe box
(`#afegeix-calendari`; the feed itself is noindex, so it is never linked from the block). Shown only when another family's
page is in it. `prefetch={false}` on every link (no RSC prefetch burst at the origin on 29N).

| Page family | Pages with the block (indexable) | Links to |
| --- | --- | --- |
| Holidays ca / es / en | 478 (282) / 394 (252) / 29 (15) | election page (891 pages), fair page (84), working days (886) |
| Fairs ca / es / en | 42 / 39 / 2 (all indexable) | holiday page + 2027/today anchors + .ics box (67), election page (80), working days (77) |
| Elections ca / es / en | 359 (288) / 326 (258) / 16 (16) | holiday page + 2027/today anchors (678) + .ics box (662), fair page (90), working days (679) |

1,685 pages carry it (1,194 of them indexable), for 599 municipalities; the other towns have no second indexable page
(both their holiday and election pages are noindex low-demand pages, `low-demand.ts`, review 10 Dec). The sets follow
the low-demand list automatically: when the 10 Dec review moves a page in or out of the index, the blocks change with
the next deploy. Weight: 414–949 bytes of HTML per block (rendered), about as much again in the RSC payload: ≤ 2 KB raw,
≤ 0.5 % of a 390 KB election page (test guard: markup ≤ 1.2 KB on every page).

**Structured data.** The three families already described the town as a Place (Dataset `spatialCoverage` on the holiday
and election pages, Event `location` on the fair pages); each now carries the same `@id`,
`https://www.catalunyainfo.com/#municipality-<INE>` (`townPlaceId` in `lib/seo/jsonld.ts`). Nothing added beyond what each
node said (no coordinates, no population). BreadcrumbList: already consistent (same slug and same town name in every
family and language, now held by `tests/town-hub.test.ts`); not changed.

**Measurement.** Clicks in the block are `related_content_click` with `link_context: "town_hub"` (added to the closed list
`RELATED_LINK_CONTEXTS`; `docs/ANALYTICS.md`). `snapshot.py towns [start end]` (new) prints the table above plus the
`town_hub` clicks per family; `snapshot.py landing` gained a "hub" column.

**Hypothesis.** (1) Readers who land on one town page take the next town page: views per session on landings in the
holiday and election town pages rise by ≥ 0.05 over the 4–17 Nov column, and the block gets ≥ 1 click per 100 page views
on each family with ≥ 300 landed sessions. (2) Internal links between a town's indexable pages help the weaker one: more
fair and election town pages with impressions, holiday town position not worse by more than 0.3.

**Review: 9 Dec 2026** (`snapshot.py towns 2026-11-25 2026-12-08` against the 4–17 Nov column; GA4 Explore,
`related_content_click` with link_context `town_hub`, Page path × Link URL, for which items are used). Rules per family:
< 0.5 clicks per 100 page views and v/sess not above baseline → drop that family's items (one condition in
`town-hub.ts`); the holiday→election item is due to change anyway after 29N (its anchor becomes the results H1 on 30 Nov).
If the today/2027 jump links get < 10 % of the block's clicks, drop them (bytes). Re-read with the low-demand review of
10 Dec, which changes which pages the block may link.

**Confounders.** 29N moves election traffic up to 29 Nov and down after; December moves holidays and fairs up; the
next-step box (live since 18 Nov, review 2 Dec) also adds onward links on the same pages, so read the `town_hub` clicks,
not only v/sess. Static pages (holidays, fairs) choose their dated items at deploy; the fair and English town pages by the
day the fairs were last read. GA4 counts consenting visitors only.

**Deploy.** Deploy only: the templates draw the block, nothing is stored in a body, no publish group. IndexNow afterwards
for the changed families (the script takes sitemap URLs only, so noindex pages are left out): `/ca/festius/`,
`/es/festivos/`, `/en/holidays/`, `/ca/fires-de-nadal/`, `/es/mercados-navidad/`, `/en/christmas-markets/`,
`/ca/eleccions/`, `/es/elecciones/`, `/en/elections/`.

**Outcome:** _pending_

## 2026-11-18 — "Salario medio en España 2026" (INE EAES + EPA deciles), finder, chart, tables and CSV, es + ca + en (new page; deploy only, no publish group; review 2026-12-16)

**Why.** Research row 15 (research_notes/spain-utilities-opportunities-nov2026.md): "salario medio" ≈ 15.5k + "tabla
salarial" ≈ 12.8k searches/month in Spain, flat all year (January index 143 for "tabla salarial"). The SERP mixes a 2017
article, Eurostat-vs-INE figures that disagree and a CCOO PDF; ine.es is barely visible and nobody has a per-community
tool. Media pillars C (money tools) and E (linkable original-data asset: tables + CSV with "Fuente: INE").

- URLs: `/es/calculadoras/salario-medio/` (primary), `/ca/calculadores/salari-mitja/`, `/en/calculators/average-salary-spain/`
  (sitemap + hreflang, x-default en; llms.txt entry built from the snapshot; site-search shortcut "salario medio",
  "sueldo medio", "tabla salarial"…; `calculator_use` id `average-salary`). Registry `CALCULATORS` id `average-salary`;
  hub group `official`, card after the SMI. Next step under the finder: net salary, SMI. CSV: `/datos/salario-medio-ine.csv`.
- Data (INE Tempus3 JSON API, reachable from the VPS; read 18 Nov 2026; `npm run salary:snapshot -- build|check`,
  scripts/average-salary-snapshot.ts → src/lib/programmatic/average-salary/snapshot.json + public/datos/salario-medio-ine.csv):
  - EAES (Encuesta Anual de Estructura Salarial), year **2024**, released **28 May 2026** (calendar 163, "Definitivos 2024"):
    tables 28191 (mean, P10, P25, median, P75, P90 by community × sex), 28201 (community × sex × age band), 28192
    (community × sex × sector), 28193 (community × sex × occupation level: INE note "Alta 1,2 y 3; Media 4,5,6,7 y 0; Baja 8 y
    9"), 28189 (Spain, 5-year age bands), 28185 (CNAE-09 sections), 28186 (CNO-11 groups), 28187 (full/part-time). English
    labels from INE's own EN API. Modal wage (16,520.18 €, 3.8 %) parsed from the press release (Prensa/es/EAES2024.htm), not in
    the API. Headline checked against the press release: mean 29,540.26 €, median 24,497.17 €, women 26,904.90 €, men
    32,057.55 €, +5.3 %, País Vasco 35,170.28 € … Extremadura 24,979.44 €. The INE calendar lists **no date for EAES 2025** yet.
  - EPA, Decil de salarios del empleo principal, year **2024**, released **14 Nov 2025** (calendar 348): tables 66252 (decile
    lower limits and means) and 66237 (means by working time). Monthly gross = yearly ÷ 12, extras prorated (INE methodology
    nota_epa_decil.pdf and the press release dsEPA2024). **2025 deciles scheduled for 25 Nov 2026.**
  - INE's "-" sign (100–500 observations) kept as a flag (*), missing cells (<100 observations) shown as "—"; nothing filled in
    or rounded beyond INE's decimals. Licence CC BY 4.0 (INE aviso legal, "Reutilización…"); every CSV row says "Fuente: INE".
- Server-rendered: key figures, the finder (default Spain, both sexes, 30,000 €: percentile band and EPA decile 7), ranked
  HTML bar chart by community (one hue, national-mean line), 17 tables (community, age, sector, occupation, working time,
  deciles; women/men versions in `<details>`), mean vs median vs mode, gross vs net (net-salary engine estimate, linked with
  `#b=` prefill), why the lag (INE quote), why other figures differ, the "tabla salarial de tu convenio" answer (REGCON public
  search, verified 200), CSV + citation, 7-question FAQ (FAQPage JSON-LD), Dataset JSON-LD with the CSV as DataDownload,
  sources, limits, YMYL disclaimer.
- Links: the net salary pages (after the extra-pay line) and the SMI pages (under the history table) link it; body only, no
  title or description touched on either (their windows are unaffected).

**Date guards (tests/average-salary.test.ts).** Fails from **26 Nov 2026** (the day after INE's scheduled EPA 2025 deciles):
run `npm run salary:snapshot -- build`, check the deciles table/finder/FAQ, commit snapshot + CSV, redeploy. EAES: fails
from **15 Jan 2027** (`EAES_CALENDAR_RECHECK_BY`) unless a rebuild has recorded INE's date for EAES 2025; once recorded, fails
the day after that date.

**Baseline:** 0 (no page; GSC 22 Oct–18 Nov: no "salario medio / mediano / tabla salarial" query on any calculator page).

**Prediction.** Indexed within 7 days (IndexNow). The head "salario medio" is contested (news, INE, Eurostat explainers):
positions 8–20 by mid-December; long tail on page 1 possible ("salario medio por comunidad autónoma", "salario medio
cataluña 2024", "salario mediano españa", "salario medio por edad", "decil salarial", "salario medio hostelería").
"tabla salarial" is mostly convenio intent: impressions, low CTR. By 13 Jan 2027: 3,000–12,000 impressions/28 days, CTR
1.5–4 %. Wrong if under 800 impressions/28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered tables); 16 Dec and 13 Jan 2027 `snapshot.py page salario-medio 28`
(+ salari-mitja, average-salary-spain); CSV hits in the access log; referring domains in GSC Links by March 2027.
**Review: 2026-12-16.**

**Confounders.** The EPA 2025 deciles (25 Nov) change the deciles table inside the window; the net salary page's 15 Dec
review reads one more body paragraph and link (no title change); the SMI 2027 decree may move "salario" searches in
December–January.

**Deploy.** Deploy only (static, nothing in the database): no publish group. IndexNow prefixes:
`/es/calculadoras/salario-medio/`, `/ca/calculadores/salari-mitja/`, `/en/calculators/average-salary-spain/`, plus the
re-crawl of `/es/calculadoras/sueldo-neto/`, `/ca/calculadores/sou-net/`, `/en/calculators/net-salary-spain/`,
`/es/calculadoras/salario-minimo-2027/`, `/ca/calculadores/salari-minim-2027/`, `/en/calculators/spain-minimum-wage-2027/`
and the calculators hubs `/es/calculadoras/`, `/ca/calculadores/`, `/en/calculators/`.

**Outcome:** _pending_

## 2026-11-18 — CTR sweep outside the windows: no page qualifies, so nothing is retitled; a dated queue for 28 Nov–4 Dec (no deploy, no publish group)

**Brief.** Site CTR fell from 5–6 % (2–9 Nov) to 2–3 %, and 66 % of impressions sit at positions 6–10. The brief: raise CTR on
pages that are **not** inside a measurement window. Out of scope (other work or dated reviews): strikes 19N/20N/23N/26N,
elections (26 Nov), December bridge + shops (25 Nov), Semana Santa 2027, La Marató and the school calendar (25–26 Nov), the
weather patch (19 Nov), calculators launched in the last 7 days.

**Data.** `snapshot.py ctr 14 300` and `pages 14 80`, 5–18 Nov 2026 (18 Nov partial). The `ctr` command prints only 40 rows and
includes `#fragment` URLs, so the full list was rebuilt with the same curve and the same rule (CTR < 60 % of the site curve at
the page's rounded position, ≥ 300 impressions, position ≤ 20) without fragments: 101 pages. Each was matched to this log by
slug, and by family for templates. The site curve in this window: pos 5 5.3 %, 6 4.8 %, 7 4.1 %, 8 2.1 %, 9 0.6 %, 10 0.8 %.

**Why the site CTR fell: the event pages, not the snippets.** Page-level GSC, event pages = strikes and elections
(URL contains huelga|vaga|strike|eleccion|election|vot|mesa|candidat|poll…):

| Week | Site | Event pages (share of impr.) | Other pages | Other pages at 6–10 |
| --- | --- | --- | --- | --- |
| 26 Oct–1 Nov | 2.94 % | 5.55 % (29 %) | 1.86 % | 1.44 % (76.8k impr.) |
| 2–8 Nov | 5.04 % | 6.30 % (70 %) | 2.04 % | 1.49 % (97.6k) |
| 11–17 Nov | 2.66 % | 3.61 % (55 %) | 1.48 % | 1.13 % (99.3k) |

The 5–6 % days were the event pages (11N and 17N strikes, 29N) at 6.3 % CTR with 70 % of impressions. Without them the site
ran at 1.9–2.0 % before and during the peak. The non-event drop since (2.04 → 1.48 %) is about 40 % mix: impressions at 11+
went from 10.6k to 22.7k a week (new pages: calculators, Spain 2027 cities), and those at 1–5 fell. At the 2–8 Nov bucket
CTRs, the 11–17 Nov mix gives 1.81 %. The rest is lower CTR inside the buckets: at 6–10, 1.49 → 1.13 %. No snippet
change can recover the event share.

**Candidates (≥ 300 impr., CTR < 60 % of the curve), outside the excluded families, and their windows.** None is free.

| Page (14 d clicks / impr. / CTR / pos; clicks lost vs curve) | Window (entry) | Earliest change |
| --- | --- | --- |
| Parking ES `aparcar-barcelona-zona-azul-verde` (29 / 8,647 / 0.3 % / 7.8; 154) | title 3 Nov, to 1 Dec; body measure 30 Nov | 1 Dec |
| Gran Recapte ES (40 / 2,610 / 1.5 % / 6.3; 86) and CA (38 / 1,963 / 1.9 % / 6.4; 56) | new 4 Nov, to 2 Dec; body 16 Nov | 2 Dec (proposal in the 16 Nov entry) |
| Parking CA `aparcar-barcelona-zona-blava-verda` (19 / 2,114 / 0.9 % / 5.6; 83) | title 6 Nov, to 4 Dec | 4 Dec |
| Christmas lights ES (33 / 2,491 / 1.3 % / 7.1; 69), CA (36 / 1,662 / 2.2 % / 6.5; 44), EN (9 / 518 / 1.7 % / 7.1) | 12 Nov; review 19 Nov (lights owner) | after the 19 Nov review |
| Metro hours EN (6 / 3,120 / 0.2 % / 7.6; 60) | title 6 Nov, to 4 Dec | 4 Dec |
| Transport passes EN (21 / 3,348 / 0.6 % / 7.6; 50); T-casual ES (5 / 4,076 / 0.1 % / 8.6; 19) | 30 Oct; measure 30 Nov (ES proposal 28 Nov, 16 Nov entry) | 28 Nov (ES), 30 Nov (EN) |
| Christmas markets guide ES (51 / 2,381 / 2.1 % / 7.4; 47) | 3 Nov, to 1 Dec; 13 Nov body | 1 Dec |
| Town holiday template: Vilassar (44), Sant Celoni (32), Mataró (26), Badalona (24), Terrassa (24), Barcelona ES (18) and CA (25), Lleida (19), Lloret, Manresa, Vilanova, El Prat, Balaguer, Vic, Granollers… | 3 Nov family change; measure 1 Dec | 1 Dec |
| 2027 date pages: 7 Dec 2027 (11 / 912 / 1.2 % / 4.8; 36), 17 May 2027 (4 / 573 / 0.7 % / 5.3; 26), 29 Mar 2027 ES/CA | new 2 Nov (to 30 Nov); measure 1 Feb 2027 | 30 Nov |
| Clock change CA (3 / 634 / 0.5 % / 5.7; 27), EN (1 / 957 / 0.1 % / 8.3; 19) | 31 Oct; measure 28 Nov | 29 Nov (proposal in the 13 Nov queue) |
| Tourist tax ES (14 / 1,923 / 0.7 % / 8.1; 27) | 30 Oct; measure 30 Nov | no retitle: ranking (13 Nov queue) |
| Carnival 2027 CA (10 / 751 / 1.3 % / 5.1; 29) | new 13 Nov; CA lead 17 Nov | 15 Dec |
| La Grossa CA (9 / 1,441 / 0.6 % / 8.2; 21) | title 17 Nov; review 1 Dec, revert rule 8 Dec | 15 Dec (8 Dec only to revert) |
| Reis ES (8 / 490 / 1.6 % / 6.6), CA (9 / 396 / 2.3 % / 6.6) | new 31 Oct (to 28 Nov); 5 Nov body, measure 28 Dec | 28 Nov, title switch is pre-registered |
| Fair towns (Canyelles, Cardedeu, Vic, Arbúcies…), traditions CA, living nativities ES, Christmas transport ES | 13 Nov titles/leads, 16 Nov fair leads, new 5 Nov; reviews 20 Nov–1 Dec | 3–14 Dec (28 days) |
| Castanyada ES (4 / 676 / 0.6 % / 6.0) | season over (13 Nov queue) | Sept 2027 |
| Ski CA (10 / 540 / 1.9 % / 5.2), ZBE ES (4 / 338 / 1.2 % / 8.5), LEZ EN (3 / 372 / 0.8 % / 7.8) | 28 Oct titles and group bodies, measure 28 Nov (ski body 5 Nov, measure 10 Dec) | 28 Nov; ZBE and ski queries rank 10–60 (ranking) |

**The only pages with no entry: the L2 closure, ES/EN/CA** (`l2-metro-cortada-la-pau-gorg`: 12 / 1,020 / 1.2 % / 6.1;
`barcelona-metro-l2-closure`: 1 / 544 / 0.2 % / 5.1; CA 9 / 301 / 3.0 % / 5.3). **Not changed.** The title already answers
the query in its words ("L2 metro cortada La Pau–Gorg hasta el 3 de diciembre"). The named queries are at 6.6–8.0 ("l2 cortada"
34 at 8.0, "l2 tallada" 19 at 6.6). Demand is ending: 227 impressions on 9 Nov, 20 on 17 Nov. The closure ends on 3 Dec
(TMB notice in `l2-closure.ts`).

**Not done, on purpose.** No window was broken to hit a count of pages. The task rule (no title, description or lead
change inside an open window) and this log's 28-day rule leave nothing to change on 18 Nov. Barcelona's press room
was read on 18 Nov (search "cavalcada", tag "reis"): the newest Cavalcada de Reis notes are from 2 and 5 Jan 2026, with no 2027
programme, so the Reis page's pre-registered switch (`ANNOUNCED_2027.barcelona`) stays null.

**Dated queue (query evidence 5–18 Nov; each proposal uses only facts already printed on the page).**
- **28 Nov, Reis ES/CA/EN.** "cabalgata de reyes 2027" 33 at 4.6 (1 click), "cavalcada de reis 2027" 21 at 8.7 on ES and
  29 at 8.1 on CA, "cuando es la cabalgata de reyes 2027" 7 at 5.7. The description already gives "la tarde del martes
  5 de enero". No retitle. Re-read Barcelona's press room; fill `ANNOUNCED_2027.barcelona` when it publishes (the title and
  description switch by themselves).
- **29 Nov, clock change CA/EN** (13 Nov proposal, unchanged). New evidence: the CA queries are now all 2027 and all
  0 clicks at 2.7–6.2 ("canvi d'hora 2027" 27 at 6.2, "canvi hora 2027" 23 at 3.9, "canvi horari estiu 2027" 15 at
  2.7). The title gives the whole answer, the zero-click pattern of the 6 Nov entry. EN: "when do (the) clocks change in
  spain" 40 at 8.6–9.3, ranking.
- **30 Nov, EN transport passes.** "t casual barcelona" 113 at 8.9, "t-casual barcelona" 36 at 9.0, "t casual card
  barcelona" 20 at 7.7, all 0 clicks. The live title opens "Barcelona transport pass 2026". Proposal: "T-casual Barcelona
  2026: zone prices and which pass to buy" (58). The zone table and the "which to buy" comparison are on the page; the
  €13 and Hola prices stay in the description. Pair it with the ES T-casual proposal of 28 Nov, so that both editions stop
  putting the full price in the title.
- **30 Nov, 2027 date pages (ES; CA/EN alike), one description each.**
  - **17 May 2027:** "17 de mayo 2027 es festivo" gets 75 impressions at 4.8 and 0 clicks; its variants add ~60 more at
    3.6–5.8, also 0 clicks. The searchers are mostly outside Catalonia. The page already says "Fuera de Cataluña, en
    cambio, es festivo en Galicia, Ceuta y Melilla" (BOE) and "fiesta local al menos en 84 municipios". Proposal: "No en
    toda Cataluña: el lunes 17 de mayo de 2027 es fiesta local en al menos 84 municipios, como Barcelona. Fuera, festivo
    en Galicia, Ceuta y Melilla." (151; the count is the page's own variable). This is the 17 Nov entry's idea, brought
    forward from 1 Feb because the 28-day window ends 30 Nov.
  - **7 Dec 2027:** Google gives it the undated 2026-intent queries ("el 7 de diciembre es festivo en cataluña" 105 at 4.6,
    1 click). Proposal: name the 2026 answer in the description: "…¿Este año? El lunes 7 de diciembre de 2026 también,
    salvo en <the 2026 page's count> municipios". 30 Nov is the start of that day's peak.
- **1 Dec, town holiday template (ES/CA), with the 3 Nov measurement.** Towns with 2027 days now get mostly "festivos
  <town> 2027" / "calendario laboral <town> 2027" queries, at 8–10, 0–2 clicks: Lleida 50 at 8.1 and 22 at 10.3;
  Badalona 54 at 9.5 and 52 at 8.5. The title leads with "¿Hoy o mañana es festivo en <town>?". Barcelona is the
  exception: "hoy es festivo en barcelona" 128 at 8.3. Proposal for towns with council or DOGC 2027 days: "Festivos
  Lleida 2027: calendario laboral y fiestas locales" (58), CA "Festius Lleida 2027: calendari laboral i festes locals"
  (54). This is the same pattern as the Spain cities' 2 Dec titles (18 Nov entry). Keep the today/tomorrow wording on
  Barcelona and in the description. Remove the 4 Nov title hold in the same change.
- **1 Dec, parking ES.** The named queries are at 9–10 ("horario zona azul barcelona" 69 at 10.4, "zona verde trinitat
  vella" 44 at 9.4), and the title is already in their words: this is ranking. The one CTR-shaped query, "la zona azul se
  paga los domingos" (11 at 5.6), is answered by the description ("Domingo gratis fuera de la playa"). No retitle.
- **1 Dec, Christmas markets ES.** ~290 "fira (de) santa llúcia barcelona 2026" impressions at 9.4–10.4 land on the guide.
  The Barcelona fair page is held to 2 Dec (`SNIPPET_HOLDS`); its release, not the guide's title, is the lever.
- **2 Dec, Gran Recapte:** demand is gone (1,053 impressions on 13 Nov, 9–82 a day since 16 Nov). Keep the 16 Nov
  proposal (results or 2027 title, once the organisers publish).
- **4 Dec, parking CA and metro hours EN.** Parking CA: "preu zona blava barcelona" 24 at 4.0 with 0 clicks, because the
  description gives the prices; the weekend queries click (5–20 %). Keep the weekend in the title (13 Nov note). Metro EN:
  "barcelona metro hours" 49 at 10.3, "is barcelona metro 24 hours" 19 at 6.2, 0 clicks; the description answers it.
  Ranking, plus the strike-day generic queries of 10–11 Nov. No retitle.

**Expected gain if the queue is applied:** small. The 30 Nov–1 Dec items (town template, 2027 dates, passes) lose
~300–400 clicks a fortnight against the curve. Most of their named queries rank 8–10, so a snippet recovers only part
of that. Two of the town figures (Vilassar, Sant Celoni) are spikes from local holidays that have passed. The big levers
are position (8–10 → 5–7) and the event calendar, not snippets.

**Review:** none (nothing changed). The queue's own dates are above. Each item is logged as a new entry, with its
baseline, when it is applied.

## 2026-11-18 — "Multas de tráfico: plazos, descuento del 50 % y recursos", deadline calculator, es + ca + en (new page; deploy only, no publish group) (review 2026-12-16)

**Why.** Research row 24 (research_notes/spain-utilities-opportunities-nov2026.md): "multas dgt" ≈ 25k/month + "puntos dgt"
≈ 13.5k, summer index 112–130. The SERP (ro-des PDF, cronista, diariodeavisos 2023, deia; sede.dgt ~#12) has **no deadline
calculator** and **disagrees on which fines lose the 50 %**. All three lists are "real": the law since 21 Mar 2022 (art. 93.2
as worded by Ley 18/2021) excludes art. 77 h, j, n, ñ, o, p, q, r, s, t; the SCT page (29.10.2024) gives the 2015 list (8,
no s/t); the DGT page (26/07/2023) only four groups. The page prints the law and says why. Fact pack:
research_notes/multas-dgt-nov2026.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/multas-trafico/` (primary), `/ca/calculadores/multes-transit/`, `/en/calculators/traffic-fines-spain/`
  (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut "multa(s) dgt", "puntos carnet"…; `calculator_use`
  id `traffic-fines`). Registry `CALCULATORS` id `traffic-fines`; hub card in the `vehicle` group after the ITV. Next step:
  ITV, working days; the ITV's next step now offers the fines tool first, then fuel.
- Calculator inputs: stage (denuncia / resolución sancionadora / providencia de apremio), channel (on the spot, post, DEV
  opened, DEV unopened, TEU), date, amount, type (leve / grave / muy grave / don't know), points, art. 93.2 case, day of the
  offence (optional), community (holidays). Outputs: last day with 50 % and the amount, alegaciones, naming the driver, what
  follows under art. 95.4 (DGT's 45 days), surcharges 5/10/20 %, prescription, points back; resolution: 15 days to pay,
  reposición in one month; apremio: the 20th or the 5th (LGT art. 62.5). We never ask for plate, ID or file number.
- Rules (read 18 Nov 2026, curl + grep; all 60 quotes and the 22 annex II rows checked verbatim against the downloads):
  RDL 6/2015 consolidated (BOE-A-2015-11722, última actualización 26/06/2026) arts. 63-65, 71, 77, 80-81, 83.1, 84, 89-96, 110,
  112, annexes II and IV; Ley 39/2015 arts. 30.2/30.5/30.6 and 43.2; LGT arts. 28 and 62.5; LGP art. 10.1; LJCA art. 46.1;
  Orden INT/914/2024 arts. 3-4 (course = 4 points; the Act's art. 65.4 caps at 6); DGT pages (45 days, AEAT 20 %, TEU
  date = publication, 10 days to identify vs the Act's 20, no instalments); SCT pay and appeals pages (ATC collects); ATC
  (10 % / 20 %).
- Where sources disagree, the stricter one is computed and the other shown: TEU counted from publication (DGT) with art. 91's
  +20 as the later reading; last day on a Saturday/Sunday/holiday: the 20th natural day is the "safe" day, the art. 30.5
  move is the legal one (no DGT/SCT page says it), with national + regional holidays from the working-days data (local ones
  not counted: page links the working-days calculator); identification: law's 20 days with the DGT's "10" flagged.
- Server-rendered: the calculator on a letter received 18 Nov 2026 (day 20 = 8 Dec, national holiday → 9 Dec), official
  services list (DGT pay/appeal/DEV/TEU/points via dgt.es links, SCT pay), deadlines table (11 rows with articles), 50 % and
  exclusions, notification table, holiday rule, doing nothing, apremio table, amounts table, annex IV speeding table with the
  50 % amounts, annex II points table, prescription, who fines (DGT / SCT / councils), 8 worked examples, 8-question FAQ +
  FAQPage JSON-LD, YMYL disclaimer, sources, limits.
- Links (body only, no title or description touched): ITV pages (ca/es/en) one line after the 50 % quote in "ITV caducada";
  fuel pages (ca/es) "Si vas amb cotxe / Si vas en coche" list gains the fines tool.
- Not verified: sede.dgt.gob.es does not answer from the VPS (curl timeout, connection refused); its services are linked
  through dgt.es's own `/.galleries/enlaces/sede/…` links (302 to the sede, checked). SCT has no English page (404): en links
  the es page.

**Date guard (tests/traffic-fines.test.ts).** From **18 May 2027** the test fails: re-read the consolidated Ley de Tráfico
(its "última actualización"), Ley 39/2015 art. 30, LGT 28/62.5, the Orden INT/914/2024 and the DGT/SCT pages. Holiday data
coverage ends 31 Dec 2027 (working-days guard `COVER_EXTEND_BY`); after it the tool still gives the 20th day and the weekend,
without the moved day.

**Baseline:** 0 (no page; the ITV pages carry one paragraph on the ITV fine and its 50 %).

**Prediction.** Indexed within 7 days (IndexNow). The heads "multas dgt" / "puntos dgt" are navigational (DGT sede): positions
10–25 by mid-December; long tail on page 1 possible ("plazo pagar multa 50 %", "multa último día festivo", "multas sin
descuento 50", "cuándo prescribe una multa de tráfico", "multa tablón edictal plazo", "recuperar puntos 2 años"). By 13 Jan
2027: 2,000–8,000 impressions/28 days, CTR 2–5 %. Wrong if under 600 impressions/28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered calculator + tables); 16 Dec and 13 Jan 2027 `snapshot.py page
multas-trafico 28` (+ multes-transit, traffic-fines-spain); `calculator_use` `traffic-fines`; ITV pages' next-step clicks to it.
**Review: 2026-12-16.**

**Confounders.** The ITV pages get one more body link and a changed next-step box (ITV review windows 15 Jan / 1 Mar 2027 read
the same body plus this line). Any DGT campaign or Christmas traffic news moves "multas" searches.

**Deploy.** Deploy only (static, nothing in the database): no publish group. IndexNow prefixes:
`/es/calculadoras/multas-trafico/`, `/ca/calculadores/multes-transit/`, `/en/calculators/traffic-fines-spain/`, plus the
re-crawl of `/es/calculadoras/itv/`, `/ca/calculadores/itv/`, `/en/calculators/itv-spain/`, `/es/gasolineras/`,
`/ca/benzineres/` and the three calculators hubs.

## 2026-11-18 — "¿Está mi municipio en zona tensionada?", checker + full list by region, es + ca + en (new page; deploy only, no publish group)

**Why.** Research row 23 (research_notes/spain-utilities-opportunities-nov2026.md): "ley de vivienda" ≈ 15k/month +
"zona tensionada" ≈ 6.3k/month (YoY +58 %), April–May index 147–155, December 54. The SERP (spotahome, cronista,
diaridetarragona, rtvc, bbvamijubilacion) is 2024-era, **contradicts itself on the large-landlord threshold (5 vs 10
homes)**, has no MIVAU/SERPAVI in the top 5 and **no list by municipality with dates**. Both thresholds are right: more
than 10 homes or 1,500 m² is the general rule (Ley 12/2023 art. 3 k), and each declaration may lower it to 5 or more; the
page shows what each declaration chose, from the BOE. Fact pack: research_notes/zona-tensionada-nov2026.md (gitignored,
worktree copy).

- URLs: `/es/calculadoras/zona-tensionada/` (primary), `/ca/calculadores/zona-tensionada/`,
  `/en/calculators/spain-rent-control-areas/` (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut
  "zona tensionada", "ley de vivienda"…; `calculator_use` id `zona-tensionada`). Registry id `zona-tensionada`; hub
  group `housing`, right after the rent-update card. Next step under the tool: rent update, CPI; the rent-update page's
  next step now opens with this tool and its Catalonia section links it (body only, no title touched).
- Data: `src/lib/programmatic/zona-tensionada/declarations.json`, built by `scripts/zonas-tensionadas-snapshot.ts`
  (`build` / `check`) from the Ministry of Housing's 10 quarterly lists in the BOE (BOE-A-2024-5214, 2024-20576,
  2025-1721, 2025-8636, 2025-15728 + errata 2025-20246, 2025-21901, 2026-2448, 2026-9175, 2026-16532, 2026-23088), read as
  XML, every date checked against the Ministry's page "Consultar zonas de mercado residencial tensionado", plus DOGC
  TER/3739/2026 and TER/3740/2026 (19 Oct 2026) and INE codes (register 1 Jan 2026). 374 rows: Catalonia 271 listed
  (140 from 16 Mar 2024 to 16 Mar 2027: 118 extended by the Generalitat, 22 not; 131 from 10 Oct 2024 to 10 Oct 2027)
  + 53 declared by the Generalitat and awaiting a BOE list; Basque Country 21; Navarre 21; Galicia 2; Asturias 6 areas
  in 5 councils. All 70 declaration/memoria/BOE URLs answered 200 except Navarre's memoria (404, not linked).
- Rules (read 18 Nov 2026, 24 quotes checked verbatim): Ley 12/2023 arts. 3 k (as amended by RDL 29/2026), 18, 31.3
  (consolidated 07/10/2026); LAU arts. 10.3, 17.6, 17.7, 17.9, DT 7ª (consolidated 13/11/2026); RDL 29/2026 (validated
  12 Nov 2026, BOE-A-2026-23755) DF 6ª; BOE-A-2024-5213 (index system, upper value); Generalitat FAQ (the limit applies
  from the day after the BOE list; the index is the Ministry's).
- Server-rendered: the checker on Barcelona, what changes for a tenant (quotes), the 5-or-10 table per declaration, how
  long a zone lasts and the Catalan 2027 case, the full list by region and declaration (one page, no page per town), how a
  zone is declared, the index (link to SERPAVI's lookup, not scraped), 8-question FAQ + FAQPage JSON-LD, YMYL disclaimer,
  sources, limits.

**Date guards (tests/zona-tensionada.test.ts).** From **16 Dec 2026** (RECHECK_BY): re-run the script's `check` — the
Ministry's 4th-quarter list will make the 53 Catalan towns effective from its next day and date the extension of the 118.
For each zone, from its last day minus 14 days (first: **2 Mar 2027**, for the 140 Catalan towns ending 16 Mar 2027).
RULES_UNTIL 2027-12-31 (RDL 29/2026 DF 6ª).

**Baseline:** 0 (no page; the rent-update page carried one Catalonia paragraph with Generalitat links).

**Prediction.** Indexed within 7 days (IndexNow the three URLs). Heads "ley de vivienda" and "zona tensionada" are
news/government-bound: positions 8–20 by mid-December; long tail page 1 possible ("zona tensionada [town]", "municipios
zona tensionada cataluña", "zonas tensionadas 2027", "gran tenedor 5 viviendas", "lleida zona tensionada", "zona
tensionada prorroga"). The March 2027 Catalan expiry and the BOE list of the 53 should bring a wave. By 13 Jan 2027:
2,000–8,000 impressions/28 days, CTR 2–5 %. Wrong if under 600 impressions/28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered checker + list); 16 Dec and 13 Jan 2027 `snapshot.py page
zona-tensionada 28` (+ spain-rent-control-areas); rent-update page's next-step clicks to it in the 2 Dec next-step review.
**Review: 2026-12-16.**

**Confounders.** The rent-update page's body gained one link and its next step changed (no title change). The Ministry's
4th-quarter list and the Catalan expiry will move searches and force data updates inside the window.

**Found, not fixed (owner).** RDL 29/2026 DF 6ª caps yearly rent updates from 8 Oct 2026 to 31 Dec 2027 at 2 % without a
new agreement (none if the rent is above the index); the rent-update calculator (rent-update/rules.ts, engine) applies the
IRAV from 8 Oct 2026 and does not model DF 6ª. This page quotes DF 6ª.

**Deploy.** Deploy only (static, nothing in the database): no publish group. IndexNow prefixes:
`/es/calculadoras/zona-tensionada/`, `/ca/calculadores/zona-tensionada/`, `/en/calculators/spain-rent-control-areas/`,
plus the re-crawl of `/es/calculadoras/actualizar-alquiler/`, `/ca/calculadores/actualitzar-lloguer/`,
`/en/calculators/rent-increase-spain/` and the calculators hubs.

## 2026-11-18 — Net salary calculator: special regime for posted workers ("Beckham law") mode and sections for people moving to Spain, ca/es/en (body only, inside the 13 Nov window; ships with the deploy, no publish group)

**Window.** The three net-salary pages launched on 13 Nov (entry above, review 15 Dec). Title, description, H1 and
lead are **untouched**; only the body and the calculator change.

**What.**
- Calculator: a new select "Income tax regime" / "Régimen del IRPF" / "Règim de l'IRPF": standard (the AEAT algorithm,
  unchanged) or "Special regime for posted workers (Beckham law)". The special one shows both side by side (net per
  payslip, extra payment, net a year, Social Security, income tax with rate, total rate), the difference, and five
  stated assumptions; hash `e=1`. Engine: `calculateSpecialRegime`, `compareRegimes`, `breakEvenGross`
  (`lib/programmatic/net-salary/engine.ts`, rules in `special-regime.ts`).
- Rules (BOE consolidated texts and AEAT pages read 18 Nov 2026; fact pack `research_notes/beckham-special-regime-nov2026.md`):
  LIRPF art. 93 (Ley 28/2022 DF 3.5 wording, from 1 Jan 2023): option for the residence year + the next 5; not resident
  in the 5 previous tax years; employment contract / posting / remote work, director, entrepreneur, highly qualified
  (>40 %); no PE income; family members (93.3); 24 % up to 600,000 €, 47 % above (93.2.e.1º); withholding 24 %, 47 %
  on the excess from the same payer (93.2.f, RIRPF 114.3). Base = gross pay (TRLIRNR art. 24.1 "importe íntegro"); only
  donations, foreign tax credit (≤30 %) and withholding reduce it (RIRPF 114.2.b). One scale for all Spain: modelo 151
  applies the art. 93 scale and splits 50 % State / 50 % region (instructions, boxes 19–23). Modelo 149 within
  6 months of the activity start date in the Social Security registration (RIRPF 116.1.a, **verified**); certificate
  within 10 working days (119.4); waiver in Nov–Dec before the year (117), exclusion reported within one month (118),
  no re-entry. Residence: LIRPF art. 9.1 (>183 days), art. 2; non-residents TRLIRNR art. 25.1.a (24 %, 19 % EU/EEA).
  Social Security: unchanged (same contributions; keeping home Social Security not modelled).
- Worked examples (tests/net-salary-special-regime.test.ts): 30,000 €, 14 payments: tax 7,200 €, net 20,850 €
  (1,466.07 € × 12 + 1,628.57 € × 2), 2,274 € less than standard withholding (4,926 €); 100,000 €, 12 payments: SS
  4,061.64 €, tax 24,000 €, net 71,938.36 €, +8,110 € vs standard (32,110 €); 700,000 €: 191,000 € (27.29 %). AEAT
  cross-check: the modelo 151 instructions' examples (750,000 € → 214,500 €; 200,000 € → 48,000 €). Break-even, single:
  57,564 €; two children: 61,973 € (one crossing, tested).
- Page sections, same content in the three languages (`components/programmatic/net-salary/SpecialRegimeSections.tsx`):
  `#tax-spain` (answer-first table, 9 salaries 30k–700k, both regimes), `#beckham` (who, what you pay, how to opt in and
  how long, BOE quotes in Spanish, AEAT links), `#residency` (183 days, IRNR rates), `#nie` (NIE: cita previa
  extranjería on mptmd.sede.gob.es + our NIE/TIE guide; NUSS on Import@ss; padrón and TSI guides). Order: right after the
  calculator in English; after the regions section in es/ca. 7 FAQ entries added to the FAQPage (first in English, last
  in es/ca); sources and limits extended; llms.txt description extended.
- Also: the disability select listed "33 %" before "None" (Object.keys order); fixed to the natural order.

**Baseline.** GSC 22 Oct–18 Nov: the net-salary URLs have 0 impressions (EN page "URL is unknown to Google" on 17 Nov).
English site queries are elections, weather, city tax; no tax/salary query yet. Demand estimate (opportunities note,
row 25, geo ES only): "income tax spain" 3.9k, "beckham law" 1.2k a month; worldwide larger, not anchored.

**Prediction.** Once indexed, the EN page gets impressions for "spain income tax calculator", "salary after tax spain",
"beckham law calculator", "how much tax will i pay in spain" (positions 20–50 at first: expat blogs and law firms rank);
by 15 Jan 2027: ≥300 impressions on EN Beckham/tax queries. Wrong if under 100 by 15 Jan with the page indexed.

**Measure.** 27 Nov indexing (already in the 13 Nov entry); 16 Dec and 15 Jan 2027: `snapshot.py page net-salary-spain 28`
(queries containing tax, beckham, after tax), `page sueldo-neto 28` ("ley beckham", "régimen especial desplazados"),
`page sou-net 28`; GA4 `calculator_use` (net-salary) on the EN path. **Review: 2026-12-16.**

**Confounders.** Same window as the 13 Nov launch and the 18 Nov average-salary link; January pay season; the 2027 rules
update on 1 Jan (titles move to 2027 then).

**Upkeep / date guards.** `SPECIAL_REGIME_RECHECK_BY` = 1 Jan 2027 (tests fail until art. 93 LIRPF, RIRPF 113–120,
TRLIRNR 24–25 and the AEAT 149/151 pages are re-read), next to `SALARY_RULES_UNTIL`. Noted for the 2027 engine: RDL
38/2026 (BOE 18 Nov 2026) moves the DA 61.ª deduction into withholding from 1 Jan 2027 (new RIRPF art. 85.3).

**Deploy.** Static (nothing in the database): deploy only, no publish group. IndexNow prefixes:
`/en/calculators/net-salary-spain/`, `/es/calculadoras/sueldo-neto/`, `/ca/calculadores/sou-net/`.

**Outcome:** _pending_

---

## 2026-11-18 — Position-loss diagnosis, 22 Oct–4 Nov vs 5–18 Nov: a core update and the 12 Nov holiday layout explain most of it; four body fixes for cannibalisation, freshness and a lost homepage link (deploy; groups `pont-desembre`, `christmas`)

**Brief.** The CTR sweep found that ~40 % of the non-event CTR fall (2.04 → 1.48 %) is impressions moving to 11+.
Find the pages and queries that lost position and why, and fix the causes in the body only (no title, description or
lead; no redirect or noindex). Out of scope: strikes and elections pages, calculators launched in the last 7 days.

**Data.** GSC API, query × page, page, query and page × date, A = 22 Oct–4 Nov, B = 5–18 Nov (18 Nov partial),
paginated past 25k rows. Scripts in the session scratchpad (`posloss/`: `pull.py`, `analyse2.py`, `matched.py`,
`step.py`), on `scripts/snapshot.py`'s `gsc()`. Event URLs (strike, election, vote, polls) excluded. Query × page pairs
with ≥ 200 impressions in both windows are almost all event pairs: GSC anonymises most of the long tail. So the list is
built at page level (≥ 200 impressions, lost ≥ 3 or crossed ≤ 10 → ≥ 11). Each page was then checked on the same
queries in both windows (mix-free: weighted by min(A, B) impressions) and day by day.

**Finding 1: a step on 13–14 Nov, in the Spanish edition, during Google's core update.** Google's Search Status
Dashboard lists the "November 2026 core update" from 10 Nov (no completion message on 18 Nov). On 14 Nov, 24 of 259
non-event pages (≥ 100 impressions on 5–12 Nov) fell ≥ 5 positions (median 14–17 Nov vs 5–12 Nov), and 6 improved.
They were almost all `/es/`: /es/festivos 6 of 80, /es/guias 9 of 71, /es/rodalies 5 of 8, against 0 of 33 /ca/guies,
0 of 28 /ca/festius and 1 of 30 /en/guides. No event page moved. URL inspection, 18 Nov: Barcelona holidays, the work
calendar, the today-holiday guide, metro hours, R4 and Tarragona are all "Submitted and indexed", user canonical =
Google canonical; metro hours and R4 were last crawled on 13 Oct and 30 Oct.

**Finding 2: the pages with the 12 Nov answer-first layout fell hardest** (entry of 12 Nov, review 19 Nov; commit
d2a328b moved the date list above the lead on every holiday town page and reordered the work calendar, today-holiday,
ponts 2027 and December-bridge guides). Median position 5–12 Nov → 14–17 Nov: `/es/festivos/barcelona/` 9.1 → 34.7
(Google crawled it on 13 Nov 05:47, after the deploy), `/es/guias/calendario-laboral-cataluna/` 18.9 → 49.1,
`/es/guias/es-festivo-hoy-cataluna/` 17.7 → 49.0, `/es/festivos/tarragona/` 8.1 → 16.7, `/es/guias/puente-diciembre-espana/`
6.7 → 10.1. Pages without that layout also fell (metro hours 11.3 → 22.8, R4 11.5 → 37.4), and the Catalan editions with
the same layout did not. So the layout is not proven to be the cause, but it is the clearest page-level difference.
The Spanish town page's dominant queries are "hoy es festivo en barcelona" (204 impr. in B at 8.0), "hoy es festivo",
"mañana es festivo", "el lunes es festivo en barcelona". Its first screen is now the full 2026 table, most of it past;
the "today" answer comes after it. The Catalan queries ("festius barcelona", "festius locals barcelona 2027") are
answered by the table. **Handed to the 19 Nov review, not changed here**: the layout is that entry's lever, and a
second change on the same pages would make both unreadable.

**Finding 3: the 12 Nov homepage change removed the "Útil ara mateix" card grid** (owner request, 8cb8cf1): about 20
homepage links in each edition. Three of its targets are among the losers: the today-holiday guide (above), free
museums ES 15.5 → 30.4 (A → B) and the reservoirs guide ES 26.3 → 45.4 (median, 14 Nov step).

**Finding 4: the 17 Nov pSEO cleanup is not the cause.** The step came on 14 Nov, three days before. The only overlap:
the date pages of 1 and 2 Nov, which left the index on 15–16 Nov (`expiredDatePage`), link the today-holiday guide,
the work calendar, metro hours and shops. They are `noindex, follow`, so the links are still followed. No loser
depends on links from the Spain 2027 ca/en, 11N city or English town pages.

**Loser list (A → B, page level; clicks A/B).**

| Page | Impr. A → B | Pos. A → B | Cause |
| --- | --- | --- | --- |
| /es/festivos/barcelona/ | 4,736 → 5,320 | 9.8 → 11.3 | 14 Nov step on the 12 Nov layout page; "hoy" intent vs table-first screen. 19 Nov review |
| /es/guias/calendario-laboral-cataluna/ (+ CA 9.4 → 10.8) | 3,325 → 2,473 | 12.4 → 26.9 | Mix: its 30 Oct queries ("viernes 30 de octubre es festivo", 6–9) ended; + 14 Nov step (layout page). "calendari laboral 2027" moved to town pages (Vic 6.3). No change |
| /es/guias/es-festivo-hoy-cataluna/ | 1,460 → 368 | 12.7 → 26.2 | Cannibalisation: "hoy es festivo en cataluña" split from 9 Nov between it (7.5 → 12.1), /es/hoy/ (9.4), the December bridge page (9.3) and Barcelona's page; lost homepage link; layout page. **Fixed (today page)** |
| /es/guias/horarios-metro-barcelona/ (+ CA 11.2 → 14.8) | 1,267 → 965 | 10.5 → 13.0 | Generic "a qué hora abre/cierra el metro" 8.4 → 15.7; Google's copy is from 13 Oct; facts re-read on TMB on 18 Nov, unchanged. No page-level cause found: not changed |
| /es/guias/tiendas-abiertas-festivos-cataluna/ | 11,973 (B) | 5.1 → 6.3 (top-10 share 90 → 73 %) | "tiendas abiertas hoy en barcelona 2026" 6.4 → 10.5 on the November Sundays. Five logged changes since 30 Oct; review 25 Nov. Handed over, not changed |
| /es/rodalies/r2/, r2-sud, r2-nord, ca editions | 133 → 295 (R2) | 10.2 → 16.5 (R2), 8.2 → 11.4 (R2 Sud) | Cannibalisation: "r2" over six of our URLs, all at 17–29 in B. Intent: Adif works on the R2 since 12 Nov. **Fixed** |
| /ca/fires-de-nadal/ vs /ca/tradicions/mercats-de-nadal-catalunya/ | 318 → 849 (hub) | "fires de nadal catalunya 2026": hub 3.1 → 6.0 | Cannibalisation, alternating daily 2–13 Nov (hub 2–7, guide 7–10). **Fixed (guide body)** |
| /es/guias/museos-gratis-barcelona/ (+ EN 14.6 → 19.5) | 312 → 155 | 15.5 → 30.4 | Lost homepage link (12 Nov); "museos gratis hoy" 7.9 → 11.8. **Fixed (link from the bridge page)** |
| /ca/embassaments/ vs /ca/guies/embassaments-catalunya-avui/; /es/embalses/sau/, susqueda | 73 → 271; 111 → 464 | 8.9 → 12.2; 11.1 → 14.0 | Cannibalisation hub vs guide ("embassaments catalunya": hub 10 → 13.8, guide 23–34); lost homepage link (guide). The 13 Nov live-data entry's 25 Nov review decides hub vs guide: structural, listed for the owner |
| /es/guias/zoo-aquarium-barcelona/, Boqueria ES/EN, Tibidabo EN | 355, 203, 480, 457 | 9.9 → 13.6, 10.0 → 15.4, 10.3 → 11.7, 11.6 → 15.9 | First screens answer the query with current official facts (zoo hours to 20 Dec, Boqueria Mon–Sat 8:00–20:30); 14 Nov step. Tibidabo EN back to 8.6–12.5 since 13 Nov. Not changed |
| /es/escapadas/sitges-desde-barcelona-tren/, Núria ES, cruise port ES | 265, 336, 218 | 16.9 → 25.8, 14.4 → 18.8, 20.2 → 27.9 | Page 2–3, no named cause (the EN Sitges page ranks better). The R2 works do not affect the R2 Sud (Rodalies notice). Not changed |
| /en/day-trips/montserrat-without-a-tour-from-barcelona/ | 165 → 2,474 | 14.6 → 37.4 | Mix: new head queries ("montserrat cable car" 419 at 35.8) from 9 to 15 Nov. Not a loss |
| /en/guides/barcelona-airport-to-city-centre/, /es/escapadas/figueres-museo-dali-desde-barcelona/ | 448 → 497, 157 → 225 | 69.7 → 74.3, 54.6 → 59.6 | Authority (positions 55–75). Not changed |
| / | 232 → 235 | 8.4 → 13.2 | Homepage; owner's layout decision. Not changed |

Query-level, ≥ 200 impressions: "hoy es festivo" 9.0 → 13.0 (Barcelona's page), "encendido luces barcelona 2026"
6.1 → 9.4 (moved from the Christmas guide to the new lights page, which the 19 Nov lights review owns), "tiendas
abiertas hoy en barcelona 2026" 6.4 → 10.6 (shops, above).

**What changed (body only; no title, description, lead, redirect or noindex).**

1. **December bridge, Catalonia** (`/ca/guies/pont-desembre-catalunya/`, `/es/guias/puente-diciembre-cataluna/`,
   `/en/guides/december-long-weekend-catalonia/`), "Qué hacer en el puente" list. (a) *Freshness:* the page said
   Santa Llúcia's 2026 dates "aún no se han publicado". Generalitat Agenda Cultural, activity 2026110300020, read
   18 Nov ("Darrera actualització: 17/11/2026"): "Inici: 27/11/2026 Fi: 23/12/2026 Horari: de 10 a 21 h", Avinguda de
   la Catedral. Now: 27 Nov–23 Dec, 10–21 h, "open all through the long weekend". `BRIDGE_SANTA_LLUCIA` must equal
   `SANTA_LLUCIA_2026` (tests/position-loss-18nov.test.ts). (b) *Lost homepage link:* new item "Museos gratis": Sunday
   6 Dec is the first Sunday. MNAC "Horaris i preus", read 18 Nov: "Tots els dissabtes a partir de les 15 h, cada
   primer diumenge de mes i jornades de portes obertes l'entrada al museu és gratuïta, però cal reservar entrada
   anticipada en línia"; winter Sundays 10–15 h. Barcelona City Council, "Diumenges de museu sense passar per
   taquilla", read 18 Nov: Picasso "Entrada gratuïta el primer diumenge de mes (amb reserva prèvia)"; MUHBA "A tots els
   centres, excepte al Park Güell, … gratuïta tot el dia el primer diumenge de mes". The item links the free-museums
   guide ("museos gratis en Barcelona"). The bridge page is the strongest related page (12,285 impr. ES in B).
   Three sources added.
2. **Christmas markets guide** (`/ca/tradicions/mercats-de-nadal-catalunya/` + es, en). *Cannibalisation with
   `/ca/fires-de-nadal/` (+ es, en):* the H2 "Mercats de Nadal amb dates del 2026 confirmades" (the hub's job) becomes
   "Fires de Nadal dels pobles: on és la llista sencera" / "Ferias de Navidad de los pueblos: dónde está la lista
   completa" / "Town Christmas fairs: where the full list is". Its intro says the guide follows the big markets and
   links the hub first: "totes les fires de Nadal del 2026 per data i municipi". The duplicate hub sentence after the
   list is gone. The list, table, lead and titles are unchanged.
3. **Rodalies R2, R2 Nord, R2 Sud** (`/ca|es/rodalies/r2/`, `r2-nord/`, `r2-sud/`; English hub `/en/rodalies/`).
   *Cannibalisation + intent:* under the live notices, "¿R2, R2 Nord o R2 Sud?": which R2 the page is, the other two
   linked with their routes, the four stations all three share (from the committed snapshot, read 28 Oct). Plus the
   works, from Rodalies' notice "R2: Modificación temporal del servicio entre Gavà y Castelldefels por obras de Adif"
   (updated 09.11.2026, read 18 Nov): "Desde el jueves 12 de noviembre y hasta el 14 de diciembre … los trenes de la
   relación Granollers Centre – Castelldefels iniciarán y finalizarán su recorrido en Gavà … podrán continuar su
   trayecto con los trenes de la R2 Sud". English: the same note, without links to other editions, in "Before you
   travel". `tests/rodalies-r2-family.test.ts` fails from 15 Dec 2026, when the works sentence must go.
4. **Today page** (`/ca/avui/`, `/es/hoy/`, `/en/today/`). *Cannibalisation with the today-holiday guide:* in the
   holiday item, the guide's link now comes first, in the query's words: "¿Es festivo hoy en Cataluña? Hoy, mañana y
   en cada municipio" (ca "És festiu avui a Catalunya? Avui, demà i a cada municipi", en "Is today a holiday in
   Catalonia? Today, tomorrow and in every town"). It was second, as "¿Es festivo hoy? (todos los municipios)".

**Baseline (GSC, clicks / impressions / CTR / position; A = 22 Oct–4 Nov, B = 5–18 Nov).**

| Page | A | B |
| --- | --- | --- |
| /es/guias/puente-diciembre-cataluna/ | 119 / 5,667 / 2.1 % / 5.7 | 229 / 12,285 / 1.9 % / 6.1 |
| /ca/guies/pont-desembre-catalunya/ | 16 / 658 / 2.4 % / 4.8 | 19 / 1,481 / 1.3 % / 6.1 |
| /en/guides/december-long-weekend-catalonia/ | 2 / 281 / 0.7 % / 3.9 | 0 / 112 / 0 % / 4.2 |
| /es/guias/museos-gratis-barcelona/ | 2 / 312 / 0.6 % / 15.5 | 2 / 155 / 1.3 % / 30.4 |
| /ca/guies/museus-gratis-barcelona/ | 1 / 59 / 1.7 % / 14.2 | 1 / 98 / 1.0 % / 7.8 |
| /en/guides/free-museums-barcelona/ | 3 / 130 / 2.3 % / 14.6 | 4 / 443 / 0.9 % / 19.5 |
| /ca/tradicions/mercats-de-nadal-catalunya/ | 38 / 997 / 3.8 % / 6.6 | 52 / 1,289 / 4.0 % / 6.3 |
| /es/tradiciones/mercados-navidad-cataluna/ | 40 / 959 / 4.2 % / 7.2 | 51 / 2,381 / 2.1 % / 7.4 |
| /ca/fires-de-nadal/ | 16 / 318 / 5.0 % / 4.8 | 33 / 849 / 3.9 % / 5.9 |
| /es/mercados-navidad/ · /en/christmas-markets/ | – · 0 / 12 | 3 / 159 / 10.8 · 3 / 96 / 11.0 |
| /es/rodalies/r2/ · r2-nord · r2-sud | 1/133/10.2 · 3/154/11.0 · 1/179/8.2 | 1/295/16.5 · 5/461/13.0 · 2/385/11.4 |
| /ca/rodalies/r2/ · r2-nord · r2-sud | 0/53/12.9 · 0/43/13.8 · 3/67/10.7 | 0/92/15.8 · 1/108/13.1 · 1/130/19.1 |
| /es/guias/es-festivo-hoy-cataluna/ | 4 / 1,460 / 0.3 % / 12.7 | 1 / 368 / 0.3 % / 26.2 |
| /ca/guies/es-festiu-avui-catalunya/ | 0 / 242 / 0 % / 5.4 | 1 / 60 / 1.7 % / 7.0 |
| /es/hoy/ | 2 / 51 / 6.5 | 0 / 67 / 8.1 |

Query baselines: "fires de nadal catalunya 2026" (B: hub 156 at 6.0, guide 52 at 7.8); "hoy es festivo en cataluña"
(B: guide 42 at 12.1, /es/hoy/ 16 at 9.4, December bridge 21 at 9.3); "r2" (B: R2 Nord 136 at 21.8, R2 Sud 108 at
17.4, R2 107 at 29.3).

**Hypotheses.** (1) With one primary page per query, "fires de nadal catalunya 2026" settles on the hub at ≤ 5, and
the daily alternation stops. (2) "hoy es festivo en cataluña" goes back to one URL (the guide) at ≤ 10. (3) The R2
pages stop splitting "r2"; each of R2, R2 Nord and R2 Sud gets back to ≤ 12 on its own named queries. (4) The museums
guide ES climbs back from 30 toward 15 with the bridge link, on the "museos gratis" queries. (5) No position loss on the
bridge page from the two list items. Confounder for all five: the core update is still rolling out. Compare each
page against the 14 Nov step pages left unchanged (metro hours, zoo, R4) as a control.

**Not changed, on purpose, and decisions for the owner.**
- **Holiday layout (19 Nov review):** evidence above. Proposal for that review: on the Spanish town pages, put the
  "¿hoy/mañana es festivo en <town>?" line above the date table (ES only, where the queries are "hoy").
- **Shops (25 Nov review):** "tiendas abiertas hoy en barcelona 2026" 6.4 → 10.5 on the November Sundays. Add it
  to that review; no sixth change inside its window.
- **Structural (not done; owner decision):** (a) reservoirs: merge `/ca|es|en/…/embassaments-catalunya-avui/` into the
  live hubs `/ca/embassaments/` etc. with a 301 (they split "embassaments catalunya"), at the 25 Nov review; (b) a
  compact row of text links on the homepage for the utilities the 12 Nov grid removal dropped (today-holiday guide,
  free museums, reservoirs, shops, transport, airport…), with no cards; (c) nothing to redirect for the R2 pages or
  the fairs pair: they serve different intents, and links are the right lever.

**Publish.** Deploy (R2 pages, Rodalies hub, today page are code routes), then groups `pont-desembre` and
`christmas`. IndexNow prefixes: `/ca/guies/pont-desembre-catalunya/ /es/guias/puente-diciembre-cataluna/
/en/guides/december-long-weekend-catalonia/ /ca/tradicions/mercats-de-nadal-catalunya/
/es/tradiciones/mercados-navidad-cataluna/ /en/traditions/christmas-markets-catalonia/ /ca/rodalies/ /es/rodalies/
/en/rodalies/ /ca/avui/ /es/hoy/ /en/today/`.

**Review:** 25 Nov 2026 (7 days) and 2 Dec 2026 (14 days), counted from 18 Nov; from the publish day if it goes
live later. Same scripts, query × page per day for the three query baselines above. Revert any item whose page loses
> 1.5 positions with no gain on its target query.

## 2026-11-18 — Rent-update calculator: correctness fix, the 2 % cap of RDL 29/2026 DF 6ª (8 Oct 2026 – 31 Dec 2027), ca/es/en (body + engine; lead figures corrected; title and description untouched; deploy only, no publish group)

**Window.** The three rent-update pages launched on 13 Nov (entry above, review 15 Dec 2026 and 20 Jan 2027). Title,
description and H1 are **untouched**. The lead is computed by the engine and printed a wrong figure ("la subida máxima es
el IRAV de octubre de 2026: 2,57 % … 1.000 € pasa a 1.025,70 €"), so it gets the minimal correctness fix allowed inside
any window (precedent: the 19N correction, 18 Nov): it now says the 2 % and 1.020,00 €. Not an SEO experiment; the 15 Dec
review reads it as a confounder.

**The bug (YMYL).** The engine applied the IRAV cap from 8 Oct 2026 but ignored RDL 29/2026, disposición final sexta,
flagged in the zona-tensionada entry above ("Found, not fixed").

**What the BOE says (read 18 Nov 2026, curl + grep).** RDL 29/2026 (BOE-A-2026-20823, BOE núm. 249 of 7 Oct 2026, in
force 8 Oct per DF 11ª.1; consolidated text "Última actualización publicada el 13/11/2026", DF 6ª only in its original
wording). DF 6ª: «La persona arrendataria de un contrato de alquiler de vivienda sujeto a la Ley 29/1994 […] cuya renta
deba ser actualizada porque se cumpla la correspondiente anualidad de vigencia dentro del periodo comprendido entre la
entrada en vigor de este real decreto-ley y el 31 de diciembre de 2027, podrá negociar con el arrendador la actualización
anual de la renta con sujeción a las siguientes condiciones: a) En el caso de que la renta sea superior al límite máximo
del precio aplicable conforme al sistema de índices de precios de referencia, no procederá la aplicación de incremento
alguno de la renta. b) En los demás casos, el incremento de la renta será el que resulte del nuevo pacto entre las partes.
En ausencia de este nuevo pacto entre las partes, el incremento de la renta a aplicar no podrá ser superior al dos por
ciento.» (the full text is in `rules.ts` DF6_QUOTE). Validation: Resolución de 12 de noviembre de 2026 (BOE-A-2026-23755,
BOE núm. 283 of 13 Nov): «la Diputación Permanente del Congreso de los Diputados … acordó convalidar el Real Decreto-ley
29/2026». Scope: every housing lease under the LAU (art. 2: vivienda habitual, rooms included), any signing date, by the
day the yearly update falls due; no large/small-landlord distinction; shops and other uses outside. The consolidated
LAU art. 18 (13/11/2026) does not carry DF 6ª (standalone provision); art. 18.1 still says «En todo caso» the update cannot
exceed the IRAV, so the two caps stack and the lower binds. RDL 26/2026 (BOE-A-2026-20266, in force 1 Oct 2026 only,
repealed BOE-A-2026-20526) had the identical DF 6ª, so 1 Oct 2026 gets it too. RDL 28/2026, repealed the same 12 Nov
(BOE-A-2026-23754), has no rent-update rule. The "límite máximo" is the upper value of the state index (BOE-A-2024-5213,
SERPAVI).

**What changed (ca, es, en).**
- Engine: caps `two` (2 %, negotiable by a new agreement of any landlord and tenant; note `newAgreement`) and `noIncrease`
  (0 %, when the new input `aboveIndex` is set; not negotiable), by update day (`df6Decree`: rdl26 on 1 Oct 2026, rdl29
  8 Oct 2026 – 31 Dec 2027). IRAV/IPC/IGC/3 %/RDL 8 paths unchanged outside the window; commercial leases unchanged.
- Calculator: checkbox "la renta supera el límite del índice de referencia" (with the SERPAVI lookup link) shown only for
  housing updates in the window; result line "Tope del 2 % por el RDL 29/2026 hasta el 31/12/2027 …" with its BOE link.
- Body: new H2 "El tope del 2 % hasta el 31 de diciembre de 2027" with the DF 6ª quote, BOE, validation and SERPAVI links;
  the "qué límite" cases; a 5-question FAQ (+ FAQPage JSON-LD); sources (DF 6ª anchor, validation, BOE-A-2024-5213, RDL
  26/2026, SERPAVI); disclaimer; llms.txt entry.
- Worked examples (tests/rent-update.test.ts): 1,000 € on the IRAV — 7 Oct 2026 2.47 % → 1,024.70 €; 8 Oct 2026 2 % →
  1,020 €; 30 Sep 2.47 %, 1 Oct 2 %, 2 Oct 2.47 %; 20 Nov 2026 (IRAV Oct 2.57 %) 2 % → 1,020 €; above the index → 0 %;
  fixed 1.5 % → 1.5 %; 31 Dec 2027 2 % (hypothetical fixture), 1 Jan 2028 out of range.

**Baseline (GSC, 12–18 Nov).** `/es/calculadoras/actualizar-alquiler/`: 3 clicks / 101 impressions, daily position
6–33 (top query "ipc alquiler", 5 impr at 60). CA and EN: 0 impressions.

**Date guards.** DF6_RECHECK_BY **2026-12-16** (re-read the consolidated RDL 29/2026, LAU, Ley 12/2023 and compare their
"Última actualización" in `BOE_CONSOLIDATED`); DF6_END_RECHECK **2027-12-17** (before the cap ends: extension, a law
replacing it, the 2028 regime); RENT_RULES_REVIEW_BY 2027-01-01 unchanged.

**Deploy.** Deploy only (static routes, nothing in the database): no publish group. IndexNow prefixes:
`/es/calculadoras/actualizar-alquiler/ /ca/calculadores/actualitzar-lloguer/ /en/calculators/rent-increase-spain/`.

**Review:** with the launch entry, 15 Dec 2026 and 20 Jan 2027.

## 2026-11-18 — Answer-first review (the 19 Nov review, run a day early): strikes kept, the holiday guides reverted, Spanish town pages answer "hoy / mañana" before the table (deploy only; no publish group; no title, description or H1 touched)

**Data.** GSC API (`page × date`, complete; `query × page` for mix-free position; `page × device` is only a sample:
GSC drops most page × device rows on these pages, e.g. 4,635 of the ES town pages' 20,669 impressions in the before
window) and GA4 property 554310792 (landing page × device: sessions, engaged sessions, engagement time, views).
**Before = 5–11 Nov (7 days); after = 13–17 Nov (5 days).** 13–16 Nov are final in GSC; 17 Nov is complete (all 24
hourly buckets) but still "fresh" data; 18 Nov is partial and left out; 12 Nov (the deploy day) is left out. GA4 13–17
Nov are full days. Per-day averages, so the windows compare. Jump-link URLs (`…/#section`, 5.7 % of impressions) left
out. Scripts in the session scratchpad (`lr19/pull.py`, `analyse.py`, `analyse2.py`, `analyse3.py`), on
`scripts/snapshot.py`'s `gsc()`/`ga()`.

**Rules.** For the switch, the 12 Nov rule as written (mobile engagement rate not down > 3 points, engagement time not
down > 10 %, CTR within its band at the same position), per family; "band" defined before looking as clicks ÷
expected clicks (the site's own page-level curve at each page's rounded position, per window) after ≥ 0.75 × before;
plus a position check the entry lacked (mix-free position not > 2 worse than the same-language non-event pages). The
12 Nov entry has no rule for the town pages (commit d2a328b: date table first), so one was written before the numbers:
fail if the edition's mix-free position is > 2 worse than the same-language date pages (`/xx/festivos/dia/`), or
mobile engagement rate falls > 3 points, or engagement time > 10 %; under 1,000 impressions in either window = no
verdict, keep. On a fail: **adjust** (answer first) if the temporal queries ("hoy", "mañana", weekday, "es festivo…")
lost ≥ 2 positions more than the list queries ("festivos <town> 2026/2027"), else **revert**.

**GSC, page level, per day (clicks · impressions · CTR · position · CTR ratio to curve), before → after.**

| Family | Before 5–11 Nov | After 13–17 Nov | Mix-free Δ pos |
| --- | --- | --- | --- |
| Strikes, switched, live (2 hubs ca/es/en + Renfe) | 339 · 9,467 · 3.58 % · 7.3 · 1.14 | 305 · 7,491 · 4.08 % · 7.4 · 1.58 | −0.3 |
| Strikes, switched, 11N pages (event over 12 Nov) | 2,951 · 54,471 · 5.42 % · 6.6 | 2.2 · 873 · 0.25 % · 8.8 | +1.1 |
| Holiday guides, switched, es (5 guides) | 97.9 · 3,596 · 2.72 % · 7.5 · 0.65 | 11.4 · 938 · 1.22 % · 14.8 · 0.68 | **+4.8** |
| Holiday guides, switched, ca | 3.6 · 116 · 3.09 % · 6.2 · 0.59 | 3.0 · 231 · 1.30 % · 6.7 · 0.36 | −0.3 |
| — work calendar (all editions) | 2.0 · 259 · 0.77 % · 18.4 | 0.6 · 139 · 0.43 % · 45.2 | es +14.8 |
| — today-holiday guide | 0.3 · 44 · 15.5 | 0 · 21 · 47.0 | es +34.2 |
| — bridges + ponts 2027 | 100.9 · 3,494 · 2.89 % · 6.4 · 0.63 | 13.8 · 1,024 · 1.35 % · 8.1 · 0.55 | es +2.6 (Cat.), +4.4 (Spain) |
| Town pages es (`/es/festivos/<town>/`) | 71.3 · 2,953 · 2.41 % · 6.3 · 0.54 | 42.8 · 1,820 · 2.35 % · 7.6 · 0.67 | **+6.7** |
| Town pages ca (`/ca/festius/<town>/`) | 63.1 · 1,864 · 3.39 % · 5.9 · 0.67 | 42.0 · 1,568 · 2.68 % · 6.3 · 0.80 | −0.3 |
| Town pages en | 0.7 · 32 · 6.9 | 0.2 · 16 · 5.6 | n/a |
| Spain 2027 pages es (table first too) | 8.7 · 985 · 0.88 % · 9.1 | 13.4 · 1,651 · 0.81 % · 10.4 | +0.4 |
| Control (entry): school calendar + mesa + voting, es | 27.4 · 634 · 4.33 % · 8.3 | 2.6 · 176 · 1.48 % · 10.4 | +3.1 (ca +2.3, en +0.6) |
| Control: date pages es (`/es/festivos/dia/`) | 59.9 · 1,180 · 5.07 % · 4.5 | 9.6 · 844 · 1.14 % · 6.2 | +1.1 |
| Control: other non-event pages es / ca / en | 80.4 · 6,928 · 1.16 % · 8.4 (es) | 78.8 · 6,508 · 1.21 % · 10.5 (es) | +1.3 / +0.7 / −0.5 |

Town pages by query intent (mix-free): **es temporal +20.0** (weight 233) vs **es list +1.9** (645); ca list −0.3
(468; ca temporal 7 impressions); ES date pages temporal +1.2, list +0.8. `/es/festivos/barcelona/`, per query
(impressions @ position, window totals): "hoy es festivo en barcelona" 116 @ 8.1 → 6 @ 10.8, "mañana es festivo"
94 @ 9.7 → 20 @ 64.5, "hoy es festivo" 82 @ 9.2 → 9 @ 43.6, "festivo hoy" 24 @ 9.6 → 4 @ 36.0, while "festius barcelona"
17 @ 7.7 → 20 @ 7.8. Daily median position 5–11 → 14–17 Nov: Barcelona es 9.1 → 34.7 (13 Nov 9.7, 14 Nov 53.3, then
36.0, 33.5, 26.0), Barcelona ca 7.4 → 7.3, Tarragona es 7.4 → 16.7, work calendar es 19.1 → 49.1, today guide es
14.0 → 49.0. GSC device sample (position, mobile / desktop): ES town 8.9 → 10.2 / 12.2 → 25.6; ES holiday guides
7.7 → 11.6 / 10.4 → 34.0; ES other pages 8.4 → 9.9 / 22.1 → 31.4 (desktop fell everywhere in the Spanish edition).

Robustness: without the 13–14 Nov step days (after = 15–17 Nov) the picture is the same: ES town pages +5.5
(temporal +24.9, list +1.9), CA town pages 0.0, ES date pages +1.3, other ES pages +1.1, ES holiday guides +4.4. The ES
town family's daily position is back at 5.5–7.6 on 15–17 Nov only because list queries carry most impressions. The
temporal loss is mostly Barcelona's (other towns +4.5, on a weight of 26), the page with the "hoy / mañana" demand.

**GA4, landing page, mobile (sessions/day · engagement rate · engagement time per session · views per session).**

| Family | Before | After |
| --- | --- | --- |
| Strikes, live hubs + Renfe | 133.6 · 52.3 % · 36.0 s | 149.0 · 53.3 % · 34.1 s |
| Strikes, 11N pages | 1,244 · 60.7 % · 40.2 s | 18.6 · 9.7 % · 1.4 s |
| Holiday guides (all) | 34.9 · 51.2 % · 27.2 s · 1.08 | 7.8 · 46.2 % · 23.4 s · 1.08 |
| Holiday guides es | 32.7 · 51.1 % · 27.4 s | 6.0 · 46.7 % · 21.7 s |
| Town pages es | 17.6 · 47.2 % · 24.1 s · 1.12 | 13.2 · 42.4 % · 35.2 s · 1.33 |
| Town pages ca | 11.1 · 52.6 % · 23.2 s · 1.06 | 9.6 · 50.0 % · 22.8 s · 1.19 |
| Control: date pages es | 27.1 · 52.6 % · 27.7 s | 5.6 · 60.7 % · 24.3 s |
| Control: school + mesa + voting | 25.4 · 60.7 % · 70.9 s | 7.6 · 63.2 % · 83.7 s |
| Control: other pages es | 41.6 · 55.3 % · 34.3 s | 55.2 · 62.0 % · 34.9 s |

Desktop, for the record: holiday guides 71.7 → 72.4 % (45.8 → 61.2 s); town pages es 80.6 → 65.5 %, ca 67.4 → 77.4 %.
The work calendar and today guides have under 1 GA4 session a day: their verdict rests on GSC.

**Core update and other confounders.** Google's "November 2026 core update" started on 10 Nov and has no completion
message on 18 Nov: it overlaps both windows (10–11 Nov are in "before") and is the largest confounder. Across it, the
Spanish edition drifted about one position (other ES pages +1.3, ES date pages +1.1), the Catalan one less (+0.7),
the English not at all (−0.5). The Catalan editions with the same layout did not fall (town pages −0.3, holiday guides
−0.3); the Spanish ones did (+6.7, +4.8), far beyond the Spanish drift, and on the temporal queries above all. That
points at the layout, but it is not proof: the update can re-rank generic "hoy es festivo" intents by itself. Also:
"hoy / mañana" demand fell after 11N, and the 8–11 Nov news spike ended (the Spain bridge page; compare position, not
clicks); the Spain bridge page's ES title changed on 12 Nov; the 12 Nov homepage lost its "Útil ara mateix" grid (a
link to the today guide); the work calendar's body changed on 13 Nov (group `holidays`); the database moved to the VPS
on the evening of 12 Nov; today's diagnosis fixes (the today page now links the today guide first) ship with the same
deploy.

**Decision, per family.**

- **Strikes: keep.** The live pages pass every test (mobile engagement +1.0 point, time −5 %, CTR ratio 1.14 → 1.58,
  position −0.3). The 11N pages cannot be read: the event ended on 12 Nov (the confounder the entry named). **Not
  extended to every DB article:** the rule extends only when the first group passes, and its holiday half failed.
- **Holiday guides (work calendar, today-holiday, ponts 2027, both December bridges; ca/es/en): revert.** Mobile
  engagement −5.0 points (es −4.4), engagement time −14 % (es −21 %), mix-free position es +4.8 against +1.3 for the
  other Spanish pages. CTR stays in band (es 0.65 → 0.68). The weakest part of the evidence is the bridges: the Catalan
  ES bridge page held its position (6.1 → 6.2) and CTR (1.84 → 1.91 %). Reverted in every edition: the switch is per
  entry, and the Catalan editions' data is too thin to keep them apart (CTR ratio 0.59 → 0.36 on ~3 clicks a day).
- **Town pages es: adjust** (rule fails on position, +6.7 against the ES date pages' +1.1, and on mobile engagement,
  −4.8 points; the temporal queries lost 18 positions more than the list queries).
- **Town pages ca: keep** the table first (−0.3 against the CA date pages' +0.3; mobile engagement −2.6 points, time −2 %).
- **Town pages en: keep, no verdict** (222 and 79 impressions).
- **Spain 2027 pages (table first, not under the rule): keep** (+0.4; engagement up; list-intent pages).

**What changed.**

1. `src/lib/layout/answer-first.ts`: the five holiday keys leave `ANSWER_FIRST_ENTRY_KEYS` (listed in
   `ANSWER_FIRST_REVERTED_KEYS`). Those pages render as before 12 Nov: photo, then the stored body (work calendar:
   the 2027 lead, then the 2027 table; today guide: the live "¿Es festivo hoy?" box, then its lead). They lose the
   summary box, the "Añádenos como fuente preferida" link and "Lo más leído"; the "Siguiente paso útil" box goes back
   into the body (after the lead). Strike pages unchanged.
2. **How the town page computes "hoy" (unchanged):** in the browser only. `HolidayStatus` (client component) reads
   the clock in Europe/Madrid after hydration; the server HTML carries a fallback note under `data-nosnippet`. The
   static first line names the next holiday from `todayInCatalonia()` at render time. Pages render on their first
   request (the 20 largest at deploy) and the nightly cron rebuilds each one the day after each of its holidays
   (`holidayRefreshPaths`, with the Cloudflare purge).
3. **Spanish town pages, new first screen** (`src/lib/programmatic/holidays/first-screen.ts`, switch
   `TODAY_FIRST = { ca: false, es: true }`, used by `MunicipalityPage.tsx`):
   (a) a server-rendered answer from the same render date and the same rebuilds, e.g. Barcelona on 18 Nov:
   "**¿Es festivo hoy o mañana en Barcelona?** Hasta el **martes 8 de diciembre de 2026** no hay ningún festivo en
   Barcelona: es el próximo (la Inmaculada, en toda Cataluña)." It names dates, never "hoy", so it holds on every day
   the cached page can be served (render day to the next holiday) and in a snippet read later; on a holiday it says
   "Sí: el martes 8 de diciembre de 2026 es festivo en Barcelona (…). El siguiente: viernes 25 de diciembre de 2026
   (…)"; where next year's local days are not out, it names only the next Catalonia-wide day, with the caveat;
   towns whose nuclei have days of their own say so.
   (b) then "Todos los festivos de 2026 en <town>" with only the days still ahead, and the past ones in a closed
   `<details>` ("Festivos de 2026 que ya han pasado (n)", muted; the full table when either half is empty).
   (c) then the lead (the town's local days and the order), the next step, the live box, as before.
   Catalan and English town pages are unchanged. `holidayLabel` in `copy.ts` is now exported.
4. Tests: `tests/holiday-first-screen.test.ts` (order per edition; the page renders from `firstScreenOrder` before
   the next step and the live box; the English page keeps the table first; Barcelona's answer on 18 Nov and on a
   holiday; for a sample of towns and every render day 18 Nov–31 Dec, the answer agrees with `status.ts` on every day
   the cached page is served; the unpublished-local caveat; nothing dropped when past rows collapse);
   `tests/answer-first.test.ts` (holiday guides out of the switch); `tests/next-step.test.ts` (placement regex).

**New baseline (after window, 13–17 Nov, per day).** ES town family 42.8 clicks · 1,820 impressions · 2.35 % · 7.6;
CA town family 42.0 · 1,568 · 2.68 % · 6.3; `/es/festivos/barcelona/` 0.8 · 148 · 0.54 % · 23.7 (median 14–17 Nov
34.7); `/es/festivos/tarragona/` 0 · 14 · 21.3 (median 16.7); `/es/guias/calendario-laboral-cataluna/` 0.4 · 117 ·
0.34 % · 51.8 (median 49.1); `/es/guias/es-festivo-hoy-cataluna/` 0 · 18 · 55.1 (median 49.0);
`/es/guias/puente-diciembre-cataluna/` 8.8 · 461 · 1.91 % · 6.2; `/es/guias/puente-diciembre-espana/` 1.4 · 326 ·
0.43 % · 11.8; `/es/guias/puentes-2027-cataluna/` 0.8 · 17 · 8.6; ES date pages 9.6 · 844 · 1.14 % · 6.2; other ES
pages 78.8 · 6,508 · 1.21 % · 10.5. GA4 mobile: ES town pages 13.2 sessions · 42.4 % · 35.2 s; ES holiday guides 6.0 ·
46.7 % · 21.7 s. Query baselines: the Barcelona ES queries listed above (after-window values).

**Prediction and rule for the next reviews.** (1) ES town pages: the temporal queries' mix-free position improves by
≥ 3 against 13–17 Nov, and the family's change is no worse than the ES date pages' by > 1.5. Revert (`TODAY_FIRST.es =
false`, a deploy) if it is worse by > 1.5, or if ES town mobile engagement falls > 3 points below 42.4 %. If the ES
temporal queries recover, the 3 Dec review decides whether the Catalan edition gets the same first screen. (2)
Holiday guides: their ES mix-free position is no worse than the other ES pages' by > 2. If they keep falling with the
old layout, the layout was not the cause: log it, and bring them back only with a new first group. Read both against
the core update's completion date if Google posts it.

**Publish.** Deploy only: the switch is applied at render time and the town pages are code routes; **no publish
group**. IndexNow after the deploy: `python scripts/indexnow-sitemap.py /es/festivos/ /ca/guies/calendari-laboral-catalunya/
/es/guias/calendario-laboral-cataluna/ /en/guides/catalonia-public-holidays/ /ca/guies/es-festiu-avui-catalunya/
/es/guias/es-festivo-hoy-cataluna/ /en/guides/is-today-a-holiday-in-catalonia/ /ca/guies/ponts-2027-catalunya/
/es/guias/puentes-2027-cataluna/ /en/guides/long-weekends-2027-catalonia/ /ca/guies/pont-desembre-catalunya/
/es/guias/puente-diciembre-cataluna/ /en/guides/december-long-weekend-catalonia/ /ca/guies/pont-desembre-espanya/
/es/guias/puente-diciembre-espana/ /en/guides/december-holidays-spain/` (`/es/festivos/` also sends the unchanged
date and 2027 pages; the script has no exclude).

**Review:** 26 Nov 2026 (7 days) and 3 Dec 2026 (14 days), counted from a 19 Nov deploy; from the deploy day if it
goes live later. Same scripts; query × page for the Barcelona and Tarragona ES temporal queries.

**Outcome:** _pending_

## 2026-11-18 — Weekend pages: this weekend's agenda server-rendered by day and type from official open data (Ajuntament de Barcelona + Generalitat), English hub and Barcelona page (body only; titles, descriptions and leads untouched; deploy only, no publish group)

**Why.** The weekend hubs and zone pages rendered the agenda in the browser (`WeekendLive`), so their HTML had no
activities. GSC 22 Oct–18 Nov: `cap-de-setmana` family 9 clicks / 608 impressions, `fin-de-semana` 16 / 1,118;
"que fer aquest cap de setmana" 73 impr. pos 23.8, "agenda cap de setmana" 58 / 27.5, "què fer a barcelona aquest cap de
setmana" 7 / 16.4, "plans cap de setmana barcelona" 9 / 7.9; ES Barcelona queries on `/es/fin-de-semana/barcelona/`
at the bottom: "eventos barcelona este fin de semana" 12 / 69.7, "¿qué eventos hay este fin de semana en barcelona?"
11 / 75.8, "qué hacer en barcelona este fin de semana" 8 / 69.1; "que hacer este fin de semana en cataluña" 15 / 34.7.
The fairs-near-a-town queries already sit at 7–10 ("pueblos con ferias este fin de semana cerca de terrassa" 64 / 7.0).
Weekends are the site's weak days (GA4 Sat 14 Nov 673 sessions, Sun 15 Nov 583, against ~1,100 on weekdays).

**Sources** (checked from the VPS 18 Nov 2026, keyless):
- Ajuntament de Barcelona, Open Data BCN `agenda-diaria`, resource "agenda ampliada" (ffa6d773-…), daily, CKAN
  datastore SQL; CC BY 4.0 + Open Data BCN terms: "Font de les dades: Ajuntament de Barcelona", last update date,
  transformations identified, images excluded. 602 activities ≤ 45 days overlap 20–22 Nov; 494 after the timetable
  rules. Item page: `guia.barcelona.cat/{ca,es,en}/detall/<slug>_<register_id>.html`.
- Generalitat, Agenda Cultural de Catalunya `rhpv-yr4f` (Departament de Cultura), Llicència oberta d'ús d'informació -
  Catalunya: cite "Generalitat de Catalunya. Departament de Cultura" and the last update (Last-Modified). 232
  activities for 20–22 Nov after the existing rules. Item page: `agenda.cultura.gencat.cat/ca/activitat.html/<codi>`.
- No official Christmas-programme dataset in either catalogue (searched "nadal"); Christmas fairs come from our own
  `christmas-fairs` family and link its town pages.

**What changed.**
1. `lib/programmatic/weekend/agenda-{list,upstream,server,copy}.ts`: one read per source per hour (memo, Next data
   cache, 15 s timeout), kept file `/srv/catalunyainfo/shared/cache/weekend-agenda-last-good.json`, committed
   fallback `agenda-snapshot.json` (`npm run weekend:agenda-snapshot`); a read of another weekend is never shown.
   Window = `weekendWindow(today)` (Fri–Sun, holiday Thu/Mon included), past days dropped on Sat/Sun.
2. Grouping by day (one-day activities) and "all weekend or several days", then type (fairs and markets, with
   children, music, exhibitions, theatre/dance/circus, other), free and the Ajuntament's "Recomanem" picks first, 4
   per group (3 in "several days"), "+N more" links to Guia Barcelona / Agenda Cultural. Per item: title, venue,
   district or town, time and price text as published (truncated with "…"), "free" only when the price text says so
   with no amount, official page link. Timetable "Dies" cells read mechanically (weekdays, ranges, dates, "excepte",
   "tancat"): e.g. "Indiana Stones" (7 and 28 Nov) and term courses are left out. No descriptions, no images.
3. Pages: `/ca/cap-de-setmana/`, `/es/fin-de-semana/` (+ every zone) now render the list on the server and
   regenerate hourly (`revalidate = 3600`, was `false`); Barcelona uses the Ajuntament's agenda + the Generalitat's
   Barcelona items it lacks (542 activities for 20–22 Nov); other zones keep the MIN_EVENTS guardrail (wider zone list
   below). New "Christmas fairs open this weekend" block linking our town pages (Barcelona Sagrada Família 21 Nov,
   Canyelles 21–22 Nov this weekend). New English pages `/en/weekend/` and `/en/weekend/barcelona/` (hreflang ca/es/en,
   x-default en); other zones stay ca/es (no English demand). `WeekendLive` removed; `/api/weekend/agenda/` kept.
4. Body copy: guidance "Es llegeix en directe…" → "cada hora; a Barcelona s'hi suma l'agenda de l'Ajuntament";
   attribution lines per licence. **Not touched:** hub/zone titles, descriptions, H1s and leads (zone pages shipped
   28 Oct: window to 25 Nov), the evergreen `/agenda/que-fer-aquest-cap-de-setmana-catalunya/` (title window to 28 Nov).

**Prediction.** HTML with dated, official items lifts the weekend family on weekend days: (1) ES Barcelona queries
("qué hacer / eventos en barcelona este fin de semana") from ~70 to ≤ 30 on `/es/fin-de-semana/barcelona/`; (2) "que
fer aquest cap de setmana" ≤ 15 on the CA family; (3) family impressions on Sat+Sun ≥ 1.5× the 14–15 Nov weekend;
(4) `/en/weekend/barcelona/` indexed and showing for "things to do in barcelona this weekend". Confounders: the 29N
election weekend (28–29 Nov) and the Christmas-fair season starting (more fair demand regardless).

**Follow-ups after the window (from 26 Nov):** the Barcelona zone description/lead still say "amb l'agenda oficial
de la Generalitat" — add the Ajuntament if the review keeps the change; consider dating the EN Barcelona title
differently only after its own 28 days.

**IndexNow after the deploy:** `python scripts/indexnow-sitemap.py /ca/cap-de-setmana/ /es/fin-de-semana/ /en/weekend/`.

**Review:** 2 Dec 2026, after two weekends (21–22 and 28–29 Nov; GSC lags ~2 days): `snapshot.py page
cap-de-setmana 14`, `page fin-de-semana 14`, `page en/weekend 14`, `daily 14` (Sat/Sun sessions vs 14–15 Nov).
Revert path: `revalidate = false` + the `WeekendLive` island (git history) if positions fall or weekend renders error.

**Outcome:** _pending_

## 2026-11-18 — "¿A qué edad me puedo jubilar?", retirement age calculator, es + ca + en (new page; deploy, then republish group `pagos`) (review 2026-12-16)

**Why.** Research row 3 (research_notes/spain-utilities-opportunities-nov2026.md): "jubilación" ≈ 129k/month (head),
"edad de jubilación" ≈ 5.6k, "calcular pensión" ≈ 3.5k (×0.5–1.5). The pensions-2027 page answers the January increase,
not *when*; 1 Jan 2027 is the day DT 7ª reaches its last row (67, or 65 with 38 years 6 months), so "edad de jubilación
2027" peaks now. Fact pack: research_notes/edad-jubilacion-nov2026.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/edad-jubilacion/` (primary), `/ca/calculadores/edat-jubilacio/`, `/en/calculators/spain-retirement-age/`
  (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut "jubilación", "edad de jubilación", "retirement";
  `calculator_use` id `retirement-age`). Registry `CALCULATORS` id `retirement-age`; hub card in the `work` group right
  before the 2027 pension increase. Next step: pensions 2027, pay dates.
- Inputs: date of birth, years + months contributed so far, keep contributing yes/no, type (ordinary / early involuntary /
  early voluntary / delayed + months of delay). Outputs: the day the ordinary age is reached and why (65 rule or the row's
  full age), the 65-rule check at the 65th birthday, the 15-year minimum, the earliest involuntary and voluntary early date
  with months ahead, column and coefficient, the delay bonus and the jubilación activa share. No pension amount (needs the
  person's bases): links the Seguridad Social simulator, pensions 2027 and pay dates. Never asks for ID or NSS.
- Rules (read 18 Nov 2026, curl + grep; 25 quotes verbatim, the 75 DT 7ª cells and both coefficient tables (48 + 24 rows ×
  4 columns) compared cell by cell with the BOE download; 15 URLs 200): LGSS consolidated (BOE-A-2015-11724, última
  actualización 11/11/2026) arts. 205.1, 206, 206 bis, 207, 208, 210.2–210.4, 214, 215, 318.d and DT 7ª; Ley 21/2021
  (monthly coefficients since 2022 — the brief's "per quarter" is the old rule; the quarter survives only as the art. 210.4
  cap); RDL 11/2024 (4 % + 2 % half-year, from 1 Apr 2025); RD 416/2026 (flexible/mixed, 28 Aug 2026); Seguridad Social
  requisitos (date-to-date count), cuantía, early-retirement, partial and active pages; Revista SS 30/09/2026 (legal age
  report, same "situation continues" premise) and 27/05/2025.
- Readings flagged on the page: the table row is the year the age is reached (15/02/1960 → 66 y 10 m on 15 Dec 2026;
  15/04/1960 → 67 on 15 Apr 2027); early retirement measured against the age "de haber seguido cotizando"; the 2 % for >6
  months only after two full years (stricter; SS example 2 y 7 m = 10 % fits); 38 y 6 m reached between 65 and 67 → that day.
- Server-rendered: calculator on a person born 20/06/1965 with 35 years (65 on 20 Jun 2030 via 38 y 7 m), DT 7ª table
  (es verbatim, ca/en translated from the same numbers), how it is counted, involuntary/voluntary requirements, both
  coefficient tables, delay table, active/partial, lower ages, 7 worked examples, 8-question FAQ + FAQPage JSON-LD, YMYL
  disclaimer with the official simulator, sources, limits.
- Links (body only, no title or description touched): pay-dates guide pensions section, ca/es/en (DB article → republish
  `pagos`); pensions-2027 page "cobro" section, ca/es/en.

**Date guard (tests/retirement-age.test.ts).** From **1 Jan 2027** the test fails: re-read the consolidated LGSS ("última
actualización"), DT 7ª, arts. 205/207/208/210/214/215/318, the Seguridad Social pages; re-run the scratchpad verify script;
move RULES_AS_OF / RULES_UNTIL.

**Baseline:** 0 (no page). The pensions-2027 page's "jubilación" impressions (if any) are its own.

**Prediction.** Indexed within 7 days (IndexNow). Head "jubilación" is navigational (seg-social.es): no target. Long tail on
page 1–2 by mid-December: "edad de jubilación 2027", "a qué edad me puedo jubilar", "jubilación a los 65 con 38 años y 6
meses", "coeficientes reductores jubilación anticipada", "jubilación anticipada voluntaria 63". By 13 Jan 2027:
3,000–10,000 impressions/28 days, CTR 2–5 %. Wrong if under 1,000 impressions/28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered tables); 16 Dec and 13 Jan 2027 `snapshot.py page edad-jubilacion 28`
(+ edat-jubilacio, spain-retirement-age); `calculator_use` `retirement-age`; next-step clicks from it.
**Review: 2026-12-16.**

**Confounders.** The pay-dates guide and the pensions-2027 page each gain one body line (their next-step boxes unchanged);
the 1 Jan 2027 change and the pension revaluation news move "jubilación" searches in December–January.

**Deploy.** Deploy, then publish group `pagos` (pay-dates guide body). IndexNow prefixes: `/es/calculadoras/edad-jubilacion/`,
`/ca/calculadores/edat-jubilacio/`, `/en/calculators/spain-retirement-age/`, plus the re-crawl of
`/es/calculadoras/subida-pensiones-2027/`, `/ca/calculadores/pujada-pensions-2027/`, `/en/calculators/spain-pension-increase-2027/`,
`/es/guias/cuando-se-cobra-paro-pension/`, `/ca/guies/quan-es-cobra-atur-pensio/`,
`/en/guides/unemployment-benefit-pension-payment-dates-spain/` and the three calculators hubs.

---

## 2026-11-18 — "IPREM 2026": the figures in force from the BOE, history 2004–2026, 2027, common limits and a multiples calculator, es + ca + en (new page; deploy only, no publish group) (review 2026-12-16)

**Why.** Research row 12 (research_notes/spain-utilities-opportunities-nov2026.md, subsidios / IPREM) and row 19 (bono social
thresholds in IPREM): IPREM thresholds decide the unemployment subsidy, bono social, justicia gratuita and housing aid, and
searches spike every January. The site already used the IPREM in four modules (paro, subsidio, bono social, pensions) with
two separate `600` constants; it had no page answering "IPREM 2026". Fact pack: research_notes/iprem-2026.md (gitignored).

- URLs: `/es/calculadoras/iprem/` (primary), `/ca/calculadores/iprem/`, `/en/calculators/iprem-spain/` (no year in the slug:
  each January's figures go to the same URL). Sitemap + hreflang (x-default en), llms.txt entry, site-search shortcut
  "iprem", `calculator_use` id `iprem`. Registry `CALCULATORS` id `iprem`; hub card in the `official` group right after
  the SMI. Next step: bono social, unemployment subsidy.
- Figures (read 18 Nov 2026, curl + grep; every amount and quote checked by tests/iprem.test.ts against the verbatim
  passages in tests/fixtures/boe-iprem-provisions.json): 2026 = Ley 31/2022 DA 90ª (BOE-A-2022-22128) «a) El IPREM
  diario, 20 euros. b) El IPREM mensual, 600 euros. c) El IPREM anual, 7.200 euros», d) 8.400 € (14 payments); no budget
  act for 2024, 2025, 2026 or 2027 in the BOE's legislation search, so CE art. 134.4 / LGP art. 38.1 extend it; SEPE
  "Cuantías anuales" 2026: «IPREM fijado en: Ley 31/2022», 600,00 € / 7.200,00 €. History: RDL 3/2004 art. 2.2 (Jul–Dec 2004)
  and the budget acts 2005–2018 and 2021–2023 (each act's own DA, as published; 2008's 14-payment figure 7.131,80 €);
  2019, 2020, 2024, 2025 left blank ("budget extended, no BOE text sets an amount"). 2027: Cortes dissolved by RD 806/2026
  (BOE 6 Oct; elections 29 Nov; new chambers 23 Dec), Orden HAC/557/2026 only sets drafting rules: the page says the
  2023 figure stays until a new budget act is published and prints no forecast.
- Limits in IPREM multiples, each quoted from its own rule: bono social (RD 897/2017 art. 3, the bono social module's
  engine), justicia gratuita (Ley 1/1996 arts. 3.1 and 5.1, on the 12-payment IPREM as the Generalitat's tràmit prints
  it: 14.400 / 18.000 / 21.600 / 36.000 €), State Housing Plan 2026-2030 rent aid (RD 326/2026 arts. 8.2.b and 116.1.c,
  14 payments: 42.000 / 46.200 / 50.400 €), subsidio (LGSS arts. 278, 280.4) and paro limits (art. 270.3). The subsidy's
  income test is 75 % of the SMI (art. 275.1), shown as NOT the IPREM.
- Calculator: any multiple → month, day, year in 12 and 14 payments; "my income is x times the IPREM" (rounded down)
  against six common limits. Server-rendered on 1.5 × and 12,000 €.
- Refactor: `src/lib/programmatic/iprem/rules.ts` is the one source. employment/rules.ts, unemployment-subsidy/rules.ts and
  bono-social/rules.ts re-export from it (no literal of their own); bono-social engine/page/copy, BonoSocialPage,
  SubsidyPage, PensionPage, UnemploymentPage and llms.ts import it; the hardcoded "8.400 €", "600 €" strings now read it.
  Outputs identical (tests assert the old strings and values).
- Links (body only, no title, description or H1 touched): bono social page (after the art. 3.2.a quotes), unemployment
  subsidy page (after the art. 278 quote), SMI page (history section, "no confundir con el IPREM").

**Date guard (tests/iprem.test.ts).** From **1 Jan 2027** the test fails: re-read the BOE (a 2027 budget act or any rule
fixing the IPREM) and SEPE "Cuantías anuales", add the 2027 row, move `IPREM_RECHECK_FROM`. The paro, subsidy, bono social
and pensions modules follow automatically.

**Baseline:** 0 (no page). The SMI, bono social and subsidy pages carry one extra body link each (their own windows read
the same body plus this line).

**Prediction.** Indexed within 7 days (IndexNow). "iprem 2026" / "iprem" are dominated by SEPE, BOE and news: positions
8–20 by mid-December; long tail on page 1 possible ("iprem 14 pagas", "1,5 veces iprem", "iprem 2027", "iprem justicia
gratuita", "iprem anual 2026"). January lift when people look for "iprem 2027". By 13 Jan 2027: 1,500–6,000 impressions /
28 days, CTR 2–5 %. Wrong if under 500 impressions / 28 days by 13 Jan.

**Measure:** 25 Nov `batch_url_inspection` (rendered tables + calculator); 16 Dec and 13 Jan 2027 `snapshot.py page
calculadoras/iprem 28` (+ calculadores/iprem, iprem-spain); `calculator_use` `iprem`; next-step clicks to bono social and
subsidy. **Review: 2026-12-16.**

**Confounders.** 29N general election and a new government's budget plans move "presupuestos 2027" news; any decree-law
touching the IPREM would change the page the day it is read.

**Deploy.** Deploy only (static, nothing in the database): no publish group. IndexNow prefixes: `/es/calculadoras/iprem/`,
`/ca/calculadores/iprem/`, `/en/calculators/iprem-spain/`, plus the re-crawl of `/es/calculadoras/bono-social-electrico/`,
`/ca/calculadores/bo-social-electric/`, `/en/calculators/bono-social-electricity-spain/`, `/es/calculadoras/subsidio-desempleo/`,
`/ca/calculadores/subsidi-atur/`, `/en/calculators/spain-unemployment-subsidy/`, `/es/calculadoras/salario-minimo-2027/`,
`/ca/calculadores/salari-minim-2027/`, `/en/calculators/spain-minimum-wage-2027/` and the three calculators hubs.

**Outcome:** _pending_

## 2026-11-19 — Barcelona weather by month: month H3s in the query's words applied (docs/patches/weather-month-h3-19nov.patch; group `climate`)

Applied as planned in the 13 Nov entry and confirmed by the 18 Nov check (title kept: 0.3 → 0.4 % CTR at 7.3 → 8.6). Body only: each month's H3 reads "Barcelona weather in January" / "El tiempo en Barcelona en enero" / "El temps a Barcelona al gener"; the old anchor ids are kept. No new figures (AEMET 0076). Title not before 9 Dec. **Review 26 Nov and 3 Dec**: `snapshot.py page barcelona-weather-by-month 7` — month queries ("barcelona weather january/august/by month") at ≤ 6 is the target; revert if the page loses > 1.5 positions on the month queries with no CTR gain.

## 2026-11-19 — Licensed place photos: 25 towns, the Espinelves fair, three hubs and Sau get a real photograph instead of the site card (deploy only; no publish group; no title, description, lead or H1 touched) (review 2026-12-16)

**Why.** Discover (Google, "Get on Discover"): "Include compelling, high-quality images … at least 1200 px wide …
enabled by the max-image-preview:large setting"; "Avoid using generic images (for example, your site logo) in the
schema.org markup or og:image meta tag". Live audit, 18 Nov (og:image of the top 600 pages by GSC impressions, 22 Oct–18
Nov): the DB guides already carry a licensed Commons crop; the generic `/social-card.png` sits on the code routes — town
holiday pages (`/es/festivos/barcelona/`, 10,071 impressions, is the site's top photo-less page), election town pages,
Christmas-fair towns (Espinelves 4,641, Canyelles 3,839), date pages, the holiday / fair / reservoir hubs, Sau, Rodalies
lines, calculators. Discover 0, Google News 0 in 28 days.

**What changed.**
- `src/lib/content/place-photos.ts` (new): `TOWN_PHOTOS` (keyed by the slug the holiday, election and fair families share),
  `FAIR_PHOTOS` (the fair itself; wins on the fair page and is the only photo that goes into its Event `image`),
  `HUB_PHOTOS` (holidays, fairs, reservoirs), `RESERVOIR_PHOTOS` (Sau). Alt text and caption in ca/es/en, written from
  the file's own Commons description and categories (subject checked on each one).
- `src/components/PlacePhoto.tsx` (new): `next/image`, `loading="lazy"`, width/height from the manifest (no CLS), caption +
  "Foto: <author, linked to the Commons file page> (Wikimedia Commons) · <licence, linked to the deed>".
- Placement, always below the answer: ca/es town page after the first screen and the live "today" box (the 19 Nov ES
  first screen — answer, table, lead, next step — is untouched); EN town page after the dates and the today box; election
  pages after the 29N slot, mesa and polling places; fair pages after the fair cards and the next step; hubs after the
  dated questions / calendars / fair list / levels table; Sau after today's reading and the facts.
- `og:image` / `twitter:image`: the 16:9 crop `/img/16x9/<key>.jpg` (≥ 1,200 px; 1,824–1,920 px here). JSON-LD: a standalone
  `ImageObject` (contentUrl, creator, creditText, license, acquireLicensePage) in each page's graph — these pages carry no
  Article/NewsArticle markup, so `articleImage` is not involved; the Espinelves Event gets `image` (16:9, 4:3, 1:1).
- 22 new files via the pipeline (`npm run images:commons -- pick` → `npm run images:import`): 1,920 px WebP, 110–406 KB,
  5.8 MB in all; 8 photos already in the repo reused (Barcelona city hall, Girona Onyar, Terrassa Vapor Aymerich, Figueres
  Dalí museum, Borges Blanques gegants, Santa Llúcia fair, Sau ×2). Every Commons page and licence deed answered 200 (curl,
  19 Nov).
- Licences (30 photos): CC BY-SA 4.0 (11), CC BY-SA 3.0 (8), CC0 (4), CC BY-SA 2.0 (3), CC BY 2.0 (2), CC BY 3.0 (2). No NC/ND.
- Tests: `tests/place-photos.test.ts` (licence open, author, Commons source page, manifest ≥ 1,600 px, 16:9 crop ≥ 1,200 px
  served by the crop route, alt and caption in ca/es/en, WebP ≤ 512 KB, the slugs are real pages, og:image/twitter:image,
  ImageObject fields, Event image only for a photo of the fair, lazy figure placed after the answer on every family).

**Towns:** Barcelona, Lleida, Tarragona, Terrassa, Badalona, Girona, Sant Boi de Llobregat, Mataró, Reus, Vic, el Prat de
Llobregat, Manresa, Rubí, Vilanova i la Geltrú, Vilassar de Mar, l'Hospitalet de Llobregat, Matadepera, Sant Celoni,
Figueres, Santa Coloma de Gramenet, Salou, Lloret de Mar, Viladecans, Castelldefels, Canyelles (castle; its fair page too).

**Left without a photograph (and why).** Date pages (7 Dec 2026 5,168 impressions, 11 Nov 2026, 8 Dec 2026, 7 Dec 2027,
17 May 2027): the subject is a calendar day, nothing to photograph honestly. Calculators (SMI 2027, Letras del Tesoro): no
place. Canyelles' Fira de Santa Llúcia: no file of the fair on Commons (owner photo needed); the castle stands in. Rodalies
line pages, Spain 2027 city pages, Susqueda, Caldes de Montbui / Cardedeu fairs: below the top ~40, next batch. The AI
illustrations on the castanyada, bolets and autumn-colour guides are untouched (DB articles, own groups).

**Baseline (GSC, 22 Oct–18 Nov, 28 days; 147 target URLs with impressions: the 25 towns' holiday, election and fair pages
in every edition, Espinelves, the 9 hubs and Sau).** Web 1,472
clicks / 88,507 impressions. Image search: 0 impressions on the target URLs (site 17,347 impressions, 45 clicks). Discover:
0 (site 0). Google News: 0.

**Prediction.** First Discover impressions on town/fair pages during the December peak (fairs 28 Nov–13 Dec, 29N election
night, the 6–8 Dec bridge); Image-search impressions on the target URLs > 0 within 2 weeks of the crawl. Web position: no
change expected from the photo alone.

**Confounders.** The ES town pages' first-screen test (19 Nov, reviews 26 Nov and 3 Dec): the photo is below that first
screen, but a thumbnail in mobile results can move CTR — read those reviews with this date in mind. Town hubs (18 Nov,
review 9 Dec), next-step boxes (review 2 Dec), the 29N election and the Christmas fair season all move the same pages.

**Measure.** GSC Search Analytics `type=discover` and `type=image` by page (`snapshot.gsc()`; the 147 target URLs vs the
rest of the site), 19 Nov–15 Dec; Rich Results Test on `/es/mercados-navidad/espinelves/` (Event image) and one town page; a spot check
of `/img/16x9/<key>.jpg` (200, image/jpeg) after the deploy. **Review: 2026-12-16** (Discover / Image search impressions).
**Revert rule:** if Search Console reports image or Event errors, drop the ImageObject / Event `image` and keep the figure.

**Deploy.** Deploy only (code routes + static files): no publish group. IndexNow after the deploy:
`python scripts/indexnow-sitemap.py /ca/festius/barcelona/ /es/festivos/barcelona/ /en/holidays/barcelona/ /ca/eleccions/barcelona/
/es/elecciones/barcelona/ /en/elections/barcelona/ /ca/fires-de-nadal/barcelona/ /es/mercados-navidad/barcelona/
/en/christmas-markets/barcelona/ /ca/festius/lleida/ /es/festivos/lleida/ /en/holidays/lleida/ /ca/eleccions/lleida/
/es/elecciones/lleida/ /en/elections/lleida/ /ca/festius/tarragona/ /es/festivos/tarragona/ /en/holidays/tarragona/
/ca/eleccions/tarragona/ /es/elecciones/tarragona/ /en/elections/tarragona/ /ca/festius/terrassa/ /es/festivos/terrassa/
/en/holidays/terrassa/ /ca/eleccions/terrassa/ /es/elecciones/terrassa/ /en/elections/terrassa/ /ca/festius/badalona/
/es/festivos/badalona/ /en/holidays/badalona/ /ca/eleccions/badalona/ /es/elecciones/badalona/ /en/elections/badalona/
/ca/festius/girona/ /es/festivos/girona/ /ca/eleccions/girona/ /es/elecciones/girona/ /en/elections/girona/
/ca/fires-de-nadal/girona/ /es/mercados-navidad/girona/ /en/christmas-markets/girona/ /ca/festius/sant-boi-de-llobregat/
/es/festivos/sant-boi-de-llobregat/ /ca/eleccions/sant-boi-de-llobregat/ /es/elecciones/sant-boi-de-llobregat/
/ca/festius/mataro/ /es/festivos/mataro/ /en/holidays/mataro/ /es/elecciones/mataro/ /en/elections/mataro/ /ca/festius/reus/
/es/festivos/reus/ /en/holidays/reus/ /ca/eleccions/reus/ /es/elecciones/reus/ /en/elections/reus/ /ca/festius/vic/
/es/festivos/vic/ /ca/eleccions/vic/ /es/elecciones/vic/ /ca/fires-de-nadal/vic/ /es/mercados-navidad/vic/
/en/christmas-markets/vic/ /ca/festius/el-prat-de-llobregat/ /es/festivos/el-prat-de-llobregat/
/ca/eleccions/el-prat-de-llobregat/ /es/elecciones/el-prat-de-llobregat/ /ca/festius/manresa/ /es/festivos/manresa/
/ca/eleccions/manresa/ /es/elecciones/manresa/ /ca/fires-de-nadal/manresa/ /es/mercados-navidad/manresa/ /ca/festius/rubi/
/es/festivos/rubi/ /ca/eleccions/rubi/ /es/elecciones/rubi/ /ca/festius/vilanova-i-la-geltru/ /es/festivos/vilanova-i-la-geltru/
/ca/eleccions/vilanova-i-la-geltru/ /es/elecciones/vilanova-i-la-geltru/ /ca/festius/vilassar-de-mar/
/es/festivos/vilassar-de-mar/ /es/elecciones/vilassar-de-mar/ /ca/festius/l-hospitalet-de-llobregat/
/es/festivos/l-hospitalet-de-llobregat/ /en/holidays/l-hospitalet-de-llobregat/ /ca/eleccions/l-hospitalet-de-llobregat/
/es/elecciones/l-hospitalet-de-llobregat/ /en/elections/l-hospitalet-de-llobregat/ /ca/festius/matadepera/
/es/festivos/matadepera/ /ca/eleccions/matadepera/ /es/elecciones/matadepera/ /ca/festius/sant-celoni/ /es/festivos/sant-celoni/
/ca/eleccions/sant-celoni/ /es/elecciones/sant-celoni/ /ca/fires-de-nadal/sant-celoni/ /es/mercados-navidad/sant-celoni/
/ca/festius/figueres/ /es/festivos/figueres/ /ca/eleccions/figueres/ /es/elecciones/figueres/ /ca/fires-de-nadal/figueres/
/es/mercados-navidad/figueres/ /en/christmas-markets/figueres/ /ca/festius/santa-coloma-de-gramenet/
/es/festivos/santa-coloma-de-gramenet/ /ca/eleccions/santa-coloma-de-gramenet/ /es/elecciones/santa-coloma-de-gramenet/
/en/elections/santa-coloma-de-gramenet/ /ca/festius/salou/ /es/festivos/salou/ /en/holidays/salou/ /ca/eleccions/salou/
/es/elecciones/salou/ /en/elections/salou/ /ca/festius/lloret-de-mar/ /es/festivos/lloret-de-mar/ /en/holidays/lloret-de-mar/
/ca/eleccions/lloret-de-mar/ /es/elecciones/lloret-de-mar/ /en/elections/lloret-de-mar/ /es/festivos/viladecans/
/ca/eleccions/viladecans/ /es/elecciones/viladecans/ /ca/festius/castelldefels/ /es/festivos/castelldefels/
/ca/eleccions/castelldefels/ /es/elecciones/castelldefels/ /ca/eleccions/canyelles/ /es/elecciones/canyelles/
/ca/fires-de-nadal/canyelles/ /es/mercados-navidad/canyelles/ /ca/fires-de-nadal/espinelves/ /es/mercados-navidad/espinelves/
/ca/embassaments/ /es/embalses/ /en/reservoirs/` (137 town pages, every noindex sibling left out; the reservoir prefixes
also send the other eight reservoirs, unchanged). The holiday and fair hubs are not sent: their prefix would re-send every
town page; they are crawled daily.

---

## 2026-11-19 — "Pensión de viudedad: requisitos y cuánto se cobra", calculator es + ca + en (new page; deploy only, no publish group) (review 2026-12-17)

**Why.** "pensión de viudedad" ≈ 12.5k searches a month (owner brief, 18 Nov 2026); the site had the 2026 viudedad minimums
only as four rows of the pensions-2027 table and no page answering "requisitos" or "cuánto se cobra". Fact pack:
research_notes/pension-viudedad-factpack.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/pension-viudedad/` (primary), `/ca/calculadores/pensio-viduitat/`, `/en/calculators/spain-widows-pension/`
  (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut "viudedad", "viuda", "viudo", "viduïtat", "vídua",
  "vidu", "widow"; `calculator_use` id `widow-pension`). Registry `CALCULATORS` id `widow-pension`; hub card in the `work`
  group right after the 2027 pension increase (retirement age → pensions 2027 → widow's pension). Next step: pay dates,
  pensions 2027.
- Inputs: relationship (married / pareja de hecho / separated-divorced-former partner) with its own questions (illness before
  the wedding + a year/children/2 years; common children, cohabitation on the padrón, registration; remarried, compensatory
  pension + annual amount, gender violence), the deceased's situation (pensioner / alta with or without 500 days / no alta
  with or without 15 years) and cause (common / non-work accident / work accident or occupational illness), the survivor's
  age, 65 % disability, family burdens, other income a year, work income, other public pension, base reguladora (optional).
  Outputs: pension / prestación temporal / none with the article; 52, 60 or 70 % and why (or "could be 70 %"); the amount
  in 14 (12 for work accidents) payments with the art. 57 maximum and the compensatory cap; the 2026 minimum row, the
  complement (full, partial, over the limit, capped at the PNC) or, without a base, the floor the minimum guarantees.
- Rules (read 18 Nov 2026, curl + grep; 49 quotes verbatim, checked by a scratchpad script against the downloaded BOE and
  Seguridad Social texts): LGSS consolidated (BOE-A-2015-11724, última actualización 11/11/2026) arts. 57, 59, 60, 216, 217,
  219, 220, 221 (apartado 2 as worded by **RDL 31/2026 art. 1.10, in force 21/10/2026**: with common children only 2 years'
  cohabitation by padrón and no registration; before, Ley 21/2021: with children only the 2-year registration), 222, 223,
  228–230, DT 13ª (RDL 31/2026 art. 1.18) and DT 48ª; Decreto 3158/1966 art. 31 (52 % RD 1795/2003; 70 %, 31.3, 31.4);
  RD 900/2018 (60 %, art. 2 a–d, art. 7); Orden 13/02/1967 art. 11 (remarriage: >61, 75 %, 2 × SMI = 34.188 €); RD 241/2026
  anexo I and art. 9 (minimums 709,40 / 875,90 / 936,20 / 1.256,60 € a month; 9.442 €; partial complement; residence, PNC
  cap); SMI 2026 via the smi module (75 % → 10.989 € per member). Seguridad Social pages (causantes/beneficiarios, cuantía,
  efectos, compatibilidades, extinción, solicitudes, prestación temporal, presentación de solicitudes, form PDF 11/08/2026).
  The 2026 amounts are imported from pensions-2027 and smi (a test fails if rules.ts types one).
- Conflicts and readings flagged on the page: the 70 % income ceiling — BOE "en función de la edad" (19.373,60 / 21.704,60 /
  22.548,80 €) vs the SS page's "con cargas familiares" (27.034,40 €): BOE applied, "check" between the two; 31.2's income
  test excludes the pension, 31.3 then cuts it (kept only if above 60/52 %); complement added after the 31.3 cut; no
  temporal benefit for an unregistered childless pareja de hecho; compensatory pension compared per year and no complement
  when the viudedad is cut to it (RD 241/2026 art. 9.9 sentence sits in the Clases Pasivas paragraph); no complement for
  the prestación temporal (no text gives one). The SS cuantía page still shows 2025 figures (9.193 €, 24.979,4 €): not printed.
- **RDL 31/2026 convalidación pending**: no resolution in the BOE summaries 22 Oct–19 Nov 2026 (RDL 29/2026's came 13 Nov).
  The page says so; test fails from 28 Nov 2026 (`CONVALIDATION_RECHECK_BY`, shared with sick-leave) while `RDL31_STATUS`
  is "pending".
- Server-rendered: calculator on a 66-year-old pensioner's widow (60 % of 1.600 € = 960 € a month), percentages table,
  2026 minimums table, deceased/spouse/partner (before-after table)/divorce/temporal/base reguladora/compatibility/apply
  sections with quotes, 8 worked examples, 8-question FAQ + FAQPage JSON-LD, YMYL disclaimer with the SS procedure, the
  Portal de Prestaciones, form and appointment links, sources, limits and readings.
- Links (body only, no title or description touched): pensions-2027 page minimums section and retirement-age page "¿Y
  cuánto cobraré?" list link the new page, ca/es/en; the new page links both and the pay-dates guide.

**Date guards (tests/widow-pension.test.ts).** From **1 Jan 2027** (2027 minimums, income limit, PNC, maximum and SMI) and
from **28 Nov 2026** while the convalidación is unread.

**Baseline:** 0 (no page). The pensions-2027 page's "viudedad" impressions (if any) are its own.

**Prediction.** Indexed within 7 days (IndexNow). Head "pensión de viudedad" is dominated by seg-social.es and big media: no
top-3 target. Long tail on page 1–2 by mid-December: "pensión de viudedad requisitos", "cuánto se cobra de viudedad",
"pensión de viudedad pareja de hecho", "viudedad 70 %", "pensión mínima de viudedad 2026", "prestación temporal de
viudedad". By 14 Jan 2027: 5,000–15,000 impressions/28 days, CTR 1.5–4 %. Wrong if under 1,500 impressions/28 days by 14 Jan.

**Measure:** 26 Nov `batch_url_inspection` (rendered tables); 17 Dec and 14 Jan 2027 `snapshot.py page pension-viudedad 28`
(+ pensio-viduitat, spain-widows-pension); `calculator_use` `widow-pension`; next-step clicks from it.
**Review: 2026-12-17.**

**Confounders.** The pensions-2027 and retirement-age pages each gain one body link; the January 2027 revaluation news and
the RDL 31/2026 vote move "viudedad" searches in late November–January.

**Deploy.** Deploy only (code routes, nothing in the database: no publish group). IndexNow prefixes:
`/es/calculadoras/pension-viudedad/`, `/ca/calculadores/pensio-viduitat/`, `/en/calculators/spain-widows-pension/`, plus the
re-crawl of `/es/calculadoras/subida-pensiones-2027/`, `/ca/calculadores/pujada-pensions-2027/`,
`/en/calculators/spain-pension-increase-2027/`, `/es/calculadoras/edad-jubilacion/`, `/ca/calculadores/edat-jubilacio/`,
`/en/calculators/spain-retirement-age/` and the three calculators hubs.

**Outcome:** _pending_

## 2026-11-19 — Post-wave technical audit of the live site: calculators registry gaps, ca/en Spain-2027 anchors, llms.txt without noindex pages, no hreflang on noindex pages (deploy only; no group; no title, description, lead or H1 touched)

**Observation.** `npm run site:audit` on 19 Nov 11:38–11:58 UTC (3 in flight, browser UA, cache kept): 5,982 URLs (2,783 sitemap,
3,196 noindex), plus an offline pass on the same responses for #fragment targets, every `<img>` of the page, HTML over 500 KB
and every JSON-LD node. The live release changed from cd16383 to 102943e a few minutes in (the widow's pension trio was then missing from the sitemap read at the start; it is in it now); the four school-calendar URLs that
failed (one timeout, one empty 200 during the cutover) and 13 slow answers (cold cache) were re-fetched: all 200, 0.1–0.7 s.
Clean: 0 broken internal links, 0 links to redirects, 0 orphans, sitemap 2,786 URLs all 200 + indexable + self-canonical,
sitemap hreflang 100 % reciprocal, HTML = sitemap hreflang, one H1 everywhere, 11,957 JSON-LD blocks parse with 0 errors,
0 images without alt or width/height, 0 duplicate descriptions, OG images 86/86. Defects:
- **Anchors:** the ca/en Spain-2027 city pages (287) linked their community page at `#puentes` / `#locales` (the Spanish ids);
  the ca/en community pages print `#ponts` / `#locals` (64 distinct targets). The 2,724 `/…/2027/al-teu-web/#<town>` links are
  the widget picker's hash state (EmbedBuilder), not anchors.
- **llms.txt:** 43 of 536 URLs were noindex: the finished 11N city pages (low-demand list) and the "Is it a holiday on…" tool
  line opening on 1 Nov 2026, a date page past its 14 grace days.
- **hreflang on noindex pages:** `/ca/autors/`, `/es/autores/`, `/en/authors/` (noindex, empty author index) named each other.
- **Calculators registry (27 tools):** hub cards, llms.txt, sitemap (84 = 28 × 3 with the hub) complete; the site search could
  not find 7 tools by name (dismissal, finiquito, subsidy, sick leave, paid leave, home-purchase taxes, lottery tax); the
  pensions 2027 page had no "Más calculadoras" block and no hub breadcrumb; the new lottery checker had no hub card.

**What changed.** `city-page-intl.tsx` links `#ponts` / `#locals`; `buildLlmsTxt` / `liveTools` leave out low-demand pages and
open the date tool on the first date still indexed (`firstIndexableDatePage`); `buildMetadata` lists no alternates on a page
marked `noindex`; search shortcuts for the 7 tools + a lottery topic (checker, then the Gordo hub); pensions page: hub
breadcrumb + `MoreCalculators`; hub lottery group: the checker card. Tests: every registry tool has a search shortcut and a
"More calculators" block with the hub breadcrumb; city-page anchors exist on the community page; llms.txt and noindex rules.

**Not touched (windows or structural), for the owner.** 58 titles over 65 characters (13 Nov/18 Nov families); duplicate titles
"Martí Aguilera · CatalunyaInfo" (ca/es/en, a name) and "Política editorial · CatalunyaInfo" (ca/es, the same words);
6 Article headlines over 110 characters (= their titles); Article without image on the farmers' markets guides (CMS, no
licensed photo yet); 31 HowTo blocks (rich result retired, harmless); 9 pages over 500 KB, two thirds RSC payload
(home-purchase taxes 772 KB: `clientCommunities()` props; average salary 600 KB; local-holidays guide 565 KB).

**Prediction.** By 3 Dec: `site:audit` + the anchor pass show 0 missing #fragment targets outside the widget hash, llms.txt
0 noindex URLs, 0 hreflang-target-not-indexable. **Review 2026-12-03.**

**Deploy.** Deploy only (code routes, no database page changed: no publish group). IndexNow prefixes: `/es/calculadoras/`,
`/ca/calculadores/`, `/en/calculators/` (hub + pensions page), `/ca/festius/2027/`, `/en/holidays/2027/` (city pages' links).

## 2026-11-19 — New pages: "Comprovar La Grossa de Cap d'Any 2026" and "Comprobar Lotería del Niño 2027" (number checkers, ca/es/en; deploy, then groups `comprobar-grossa comprobar-nino gordo-navidad`) (review 2027-01-07 and 2027-01-13)

**URLs.** La Grossa: `/ca/comprovar-la-grossa-cap-d-any/` (primary), `/es/comprobar-la-grossa-cap-d-any/`,
`/en/check-la-grossa-ticket/`. El Niño: `/es/comprobar-loteria-nino/` (primary), `/ca/comprovar-loteria-nen/`,
`/en/check-el-nino-lottery-ticket/`. Evergreen (same URLs next season). Code route families
`src/lib/programmatic/grossa-check/` and `nino-check/`, sitemap (+hreflang, x-default en), llms.txt, `calculator_use` ids
`grossa-check` and `nino-check`. Data `/data/grossa-cap-d-any.json` and `/data/loteria-nino.json` (noindex,
`s-maxage=300`), each from its own committed snapshot, `null` until the draw. Runbook `docs/GROSSA_NINO_RUNBOOK.md`.

**What.** La Grossa: the full prize structure of DOGC 9640 (8.4.2026) annex 3, read 19 Nov 2026 through the DOGC API —
five digits, last four/three/two, last digit (first prize) and the numbers either side for each of the eight extractions —
and the rule for derived prizes quoted verbatim (8.2: only the highest category per extraction; 8.3: different
extractions add up; 8.1 repeats), checked arithmetically against the DOGC's 61.59 % (615,875 € per 1,000,000 € series);
90-day claim period quoted from Resolució ECO/425/2022; worked examples on the real 2025 numbers, labelled 2025. El Niño:
only what SELAE published and we read (Wed 6 Jan 2027, 20 € décimo, first prize 2,000,000 € a la serie = 200,000 € a
décimo, 168,000 € net); the derived-prize rules quoted from the last El Niño programme the BOE published
(BOE-A-2010-20031, for 2011), labelled "pendiente de confirmar", none of its amounts printed; the 2027 programme goes
into `programme-2027.json` once SELAE's PDF is read (a test fails from **28 Dec** while it is null). Both: server-rendered
pre-draw content, client-side checker on the static JSON after the draw, results tables, FAQ (6, FAQPage JSON-LD),
tax via the lottery-tax engine and links to the calculator.

**Titles (new pages, no baseline).** ca "Comprovar La Grossa de Cap d'Any 2026: bitllet i premis"; es "Comprobar La Grossa
de Cap d'Any 2026: billete y premios"; en "Check La Grossa de Cap d'Any 2026 ticket: prizes and tax". es "Comprobar
Lotería del Niño 2027: décimo y premios"; ca "Comprovar la Loteria del Nen 2027 (El Niño): dècim i premis"; en "Check
your El Niño lottery ticket 2027 (Spain, 6 January)". Titles stay on the day; descriptions switch by design to lead with
the first prize's number.

**Links (body only; no title or description touched anywhere).** Gordo hubs ca/es/en: one sentence in "how the draw
works" (hub window "measure from 23 Dec" untouched; ships with `gordo-navidad`). Christmas checker: two related links
(page of 18 Nov, review 29 Dec: body only). Prize tax calculator: two related links (17 Nov page, review 29 Dec: body
only). **Held for their windows:** the La Grossa guide gains one "how to check" bullet — publish `grossa` only after its
**8 Dec** review (17 Nov title change); the Christmas guide's El Niño paragraph gains one sentence — publish
`loteria-nadal` (or `gordo-navidad-links`) only after its **1 Dec** review (13 Nov body change).

**Baseline (GSC 6–19 Nov, the La Grossa guide).** "comprovar la grossa" 12 impressions at 18.1, no click; the guide's
head "la grossa de cap d'any 2026" 221 at 8.1 (0.9 %). No page targets El Niño yet (only the tax calculator's preset).

**Hypothesis.** Indexed by mid-December (IndexNow at go-live), the checkers rank top 10 for "comprovar la grossa" /
"comprobar grossa cap d'any" on 31 Dec and "comprobar lotería del niño" / "comprobar décimo niño" on 6 Jan, and take
visitors from the guide, the gordo hub and the Christmas checker (views/session on the lottery family ≥ 1.3 on those
days). Wrong if either checker has under 200 impressions on its draw day.

**Measure.** 1 Dec: indexed? (URL inspection of the six URLs). 28 Dec: El Niño programme read. Review **2027-01-07**
(`snapshot.py page comprovar-la-grossa 7`, `page comprobar-la-grossa 7`, `page check-la-grossa 7`; GA4 `calculator_use`
`grossa-check`) and **2027-01-13** (`page comprobar-loteria-nino 7`, `page comprovar-loteria-nen 7`, `page check-el-nino 7`;
`nino-check`).

**Confounders.** The La Grossa guide's 17 Nov title test (measured 1 and 8 Dec) and its results title on 31 Dec; the gordo
hub and Christmas checker on 22 Dec; Reyes-day news traffic on 6 Jan.

**Deploy.** Deploy, then `publish.sh comprobar-grossa comprobar-nino gordo-navidad`. IndexNow prefixes:
`/ca/comprovar-la-grossa-cap-d-any/ /es/comprobar-la-grossa-cap-d-any/ /en/check-la-grossa-ticket/
/es/comprobar-loteria-nino/ /ca/comprovar-loteria-nen/ /en/check-el-nino-lottery-ticket/`, plus the re-crawl of
`/es/donde-ha-tocado-el-gordo/ /ca/on-ha-tocat-la-loteria-de-nadal/ /en/spanish-christmas-lottery-results/
/es/comprobar-loteria-navidad/ /ca/comprovar-loteria-nadal/ /en/check-spanish-christmas-lottery-ticket/
/es/calculadoras/premios-loteria/ /ca/calculadores/premis-loteria/ /en/calculators/spain-lottery-prize-tax/`.

**Outcome:** _pending_

---

## 2026-11-19 — "Pensión no contributiva: requisitos y cuánto se cobra", calculator es + ca + en (new page; deploy only, no publish group) (review 2026-12-17)

**Why.** Owner brief (19 Nov 2026): PNC de jubilación e incapacidad, Spain-wide demand and managed in Catalonia by the
Generalitat. The site had the 2026 PNC only as two lines of the pensions-2027 page. Fact pack:
research_notes/pension-no-contributiva-factpack.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/pension-no-contributiva/` (primary), `/ca/calculadores/pensio-no-contributiva/`,
  `/en/calculators/spain-non-contributory-pension/` (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut
  "no contributiva", "no contributives", "pnc", "non contributory", placed before "jubilacion" and "pension"; `calculator_use`
  id `non-contributory-pension`). Registry `CALCULATORS` id `non-contributory-pension`; hub card in the `work` group right
  after the widow's pension. Next step: pensions 2027, IPREM.
- Inputs: type (retirement / invalidity), age, disability % and third-person need (≥ 75 %), years of legal residence, the
  last 2 years in Spain, members of the unidad económica (1–12), a parent or child among them, beneficiaries in the unit,
  own income, the other members' income, renting + the four rent-supplement conditions. Outputs: eligible or not with the
  article of each unmet condition, the household limit, the amount in 14 payments with each step (shared amount, 35 % rule,
  household cut, 25 % floor, +50 %), whether the 525 € rent supplement may apply.
- Rules (read 19 Nov 2026, curl + grep; 53 quotes verbatim, checked by a scratchpad script against the downloaded BOE,
  IMSERSO and Generalitat texts; 20 URLs answer 200, imserso.es only to a browser user agent): LGSS consolidated
  (BOE-A-2015-11724, última actualización 11/11/2026) arts. 363 (363.1.d new paragraph by **Ley 4/2026, BOE-A-2026-20528,
  in force 23/10/2026**: civil-liability compensation not counted), 364, 365, 366, 367.3, 368, 369, 370, 371, 372; RDL 3/2026
  (BOE-A-2026-2548) art. 2.5 and RD 241/2026 (BOE-A-2026-6977) art. 21.1 (8.803,20 €) and 21.2 (525,00 €); RD 357/1991
  (BOE-A-1991-7270) arts. 10.2, 14.1; RD 1191/2012 (BOE-A-2012-10476) art. 2 and DA única. Every derived figure equals the
  IMSERSO "Guía resumen de las PNC 2026": 628,80 / 157,20 / 314,40 / 943,20 € a month; 3.081,12 € (35 %); household limits
  2–10 members (14.965,44 … 64.263,36; × 2,5: 37.413,60 … 160.658,40; third person 22.448,16 … ); 2–5 beneficiaries
  (7.482,72 / 7.042,56 / 6.822,48 / 6.690,43); work limit 16.003,20 € = IPREM (iprem module) + PNC. Amounts imported from
  pensions-2027 and iprem (a test fails if the module types one).
- Conflicts and readings on the page: RD 357/1991 art. 14.2 (1991: all own income deducted) vs LGSS art. 364.2 (only above
  35 %) — the law and IMSERSO applied; other beneficiaries taken at the full share (conservative) and their PNC not counted
  as unit income; no household cut when everyone in the unit is a beneficiary (364.3); third-person limits ×1.5 and the
  complement added after the cuts (IMSERSO guide; the LGSS is silent); pareja de hecho not in art. 363.4 (ask). The brief's
  "full amount minus income" is not the law: only income above 35 % is deducted.
- Catalonia: Generalitat (Departament de Drets Socials i Inclusió, Direcció General de Prestacions Socials) tràmits 512,
  511, 8170 and 7282 (pages dated 18.05.2026) linked as the official procedure; the Catalan complementary benefit is quoted
  (up to 119,67 € a month) but not computed.
- Links (body only, no title or description touched): the pensions-2027 PNC section, the widow's pension closing links, the
  IPREM page (after the subsidy links), the unemployment-subsidy page's IMV section and the retirement-age list link the
  new page, ca/es/en; the new page links all five.

**Date guard (tests/non-contributory-pension.test.ts).** From **1 Jan 2027** (2027 PNC, rent supplement, IPREM).

**Baseline (GSC, last 28 days to 19 Nov).** No page targets it: the pensions-2027 page shows "tabla de pensiones no contributivas
2027" with 1 impression at 74.

**Prediction.** Indexed within 7 days (IndexNow). The head "pensión no contributiva" is held by imserso.es, seg-social.es
and big media: no top-3 target. Long tail on page 1–2 by mid-December: "pensión no contributiva 2026", "requisitos pensión
no contributiva", "límite ingresos pensión no contributiva unidad familiar", "pensión no contributiva viviendo con hijos",
"complemento alquiler pensión no contributiva", "pensió no contributiva Catalunya". By 14 Jan 2027: 3,000–10,000
impressions/28 days, CTR 1.5–4 %. Wrong if under 1,000 impressions/28 days by 14 Jan.

**Measure:** 26 Nov `batch_url_inspection` (rendered tables); 17 Dec and 14 Jan 2027 `snapshot.py page
pension-no-contributiva 28` (+ pensio-no-contributiva, spain-non-contributory-pension); `calculator_use`
`non-contributory-pension`; next-step clicks from it. **Review: 2026-12-17.**

**Confounders.** Five pages each gain one body link; the January 2027 revaluation news (and the 2027 PNC amount) moves
"no contributiva" searches in late December–January.

**Deploy.** Deploy only (code routes, nothing in the database: no publish group). IndexNow prefixes:
`/es/calculadoras/pension-no-contributiva/`, `/ca/calculadores/pensio-no-contributiva/`,
`/en/calculators/spain-non-contributory-pension/`, plus the re-crawl of `/es/calculadoras/subida-pensiones-2027/`,
`/ca/calculadores/pujada-pensions-2027/`, `/en/calculators/spain-pension-increase-2027/`, `/es/calculadoras/pension-viudedad/`,
`/ca/calculadores/pensio-viduitat/`, `/en/calculators/spain-widows-pension/`, `/es/calculadoras/iprem/`,
`/ca/calculadores/iprem/`, `/en/calculators/iprem-spain/`, `/es/calculadoras/subsidio-desempleo/`,
`/ca/calculadores/subsidi-atur/`, `/en/calculators/spain-unemployment-subsidy/`, `/es/calculadoras/edad-jubilacion/`,
`/ca/calculadores/edat-jubilacio/`, `/en/calculators/spain-retirement-age/` and the three calculators hubs.

## 2026-11-19 — "Impost de successions a Catalunya: calculadora", ca + es + en (new page; deploy only, no publish group) (review 2026-12-17)

**Why.** Home ground and high value: the Catalan inheritance tax has no page on the site (calculators family had the
home-purchase taxes but nothing for heirs). Fact pack: research_notes/isd-catalunya-nov2026.md (gitignored, worktree copy).

- URLs: `/ca/calculadores/impost-successions-catalunya/` (primary), `/es/calculadoras/impuesto-sucesiones-cataluna/`,
  `/en/calculators/catalonia-inheritance-tax/` (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut
  "sucesiones", "successions", "herencia", "inheritance tax", "isd"; `calculator_use` id `inheritance-tax`). Registry id
  `inheritance-tax`; hub card in the `housing` group after the home-purchase taxes (scope `catalonia`). Next step: widow's
  pension, home-purchase taxes. The home-purchase tax page links it (one sentence, body only).
- Rules (read 19 Nov 2026 through the Portal Jurídic/DOGC document API): **Llei 19/2010 is repealed** (DD 12 of Decret
  legislatiu 1/2024); the rules are the Codi tributari de Catalunya, llibre sisè, consolidated text in force since
  14/07/2026: arts. 631-2 (kinship), 631-3 (disability), 631-4 (75+), 631-5 (insurance), 631-17/18/19 (home: 95 %, 500.000 €
  shared, 180.000 € floor, collaterals > 65 with 2 years together, keep 5 years), 633-1 (scale 7-32 %), 633-3
  (coefficients), 633-4 (99 % spouse/partner; 1 bis gender-violence victims' descendants/ascendants from 27/06/2025, DL
  5/2025; weighted bonus by base imposable for the rest of groups I-II; rounding 633-4.5), 634-1/2/3, 682-1. Llei 11/2026
  (2026 budget measures) did not touch these; no decree-law since 5 May 2026. State: Llei 29/1987 art. 22.2 (excess rule,
  applied by the ATC), RD 1629/1991 arts. 67-68 (6 months + 6). ATC pages read the same day; no ATC simulator exists for
  this tax (link: model 650 help program, 2026 version of 29 Oct 2026).
- Tested against the ATC's six worked examples (571,62 € / 0 / 12.896,18 € / 5,32 € / 0 / 348,37 €) and its three
  habitual-home examples (218.500 / 250.000 / 180.000 €), plus four hand-calculated cases. One flagged reading: group II's
  table prints 35,88 % at 2.000.000 € while the 633-4.5 rounding gives 35,87 %; the engine follows the rule.
- YMYL: disclaimer (estimate; the ATC self-assessment, model 650, is the official calculation) under the tool and at the
  foot; `RULES_UNTIL` 2027-01-01 (tests/inheritance-tax.test.ts fails from then until the 2027 budget law is read).

**Baseline (GSC 23 Oct–19 Nov 2026).** 0 impressions for any query containing "sucesion", "successi", "inheritance",
"herencia" or "herència": the site has never ranked for the topic.

**Hypothesis.** Indexed within a week of IndexNow, the three editions reach ≥ 300 impressions in the 28 days to the review,
mostly "impuesto de sucesiones cataluña" / "impost de successions" / "calculadora sucesiones cataluña", top-20 average
position, and ≥ 30 % of sessions with a `calculator_use`. Wrong if fewer than 100 impressions by 17 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, three URLs). Review **2026-12-17**: `snapshot.py page impost-successions 28`,
`page impuesto-sucesiones 28`, `page catalonia-inheritance-tax 28`; GA4 `calculator_use` `inheritance-tax`.

**Confounders.** None on these URLs (new). A January 2027 rule change (Catalan 2027 budget law) would force a body update
during the window: log it here if it happens.

**Deploy.** Deploy only (static route; no publish group). IndexNow prefixes: `/ca/calculadores/impost-successions-catalunya/
/es/calculadoras/impuesto-sucesiones-cataluna/ /en/calculators/catalonia-inheritance-tax/`, plus the re-crawl of the hub
and the linking page: `/ca/calculadores/ /es/calculadoras/ /en/calculators/ /ca/calculadores/impostos-compra-habitatge/
/es/calculadoras/impuestos-compra-vivienda/ /en/calculators/spain-home-purchase-taxes/`.

**Outcome:** _pending_

## 2026-11-19 — "Impuesto de sucesiones" in Madrid, Andalucía and the Comunidad Valenciana, es + ca + en (3 new pages × 3 editions; deploy only, no publish group) + hub section "Impuesto de sucesiones por comunidad" (review 2026-12-17)

**Why.** Spain-wide demand for "impuesto de sucesiones Madrid / Andalucía / Comunidad Valenciana" is large and the site only
had Catalonia. One calculator page per community, nothing thinner for the rest (no pages for other communities). Fact pack:
research_notes/inheritance-tax-spain.md (gitignored, worktree copy).

- URLs (es primary): `/es/calculadoras/impuesto-sucesiones-madrid/`, `/es/calculadoras/impuesto-sucesiones-andalucia/`,
  `/es/calculadoras/impuesto-sucesiones-comunidad-valenciana/`; `/ca/calculadores/impost-successions-madrid/`,
  `/ca/calculadores/impost-successions-andalusia/`, `/ca/calculadores/impost-successions-comunitat-valenciana/`;
  `/en/calculators/madrid-inheritance-tax/`, `/en/calculators/andalusia-inheritance-tax/`, `/en/calculators/valencia-inheritance-tax/`.
  Sitemap + hreflang (x-default en), llms.txt, site-search shortcuts ("sucesiones madrid", "sucesiones andalucia",
  "sucesiones comunidad valenciana"…), `calculator_use` ids `inheritance-tax-madrid|andalucia|valencia`, next step
  (widow's pension, home-purchase taxes). Registry ids in calculators/paths.ts.
- Hub (/es/calculadoras/ + ca/en): new group `taxes` titled "Impuesto de sucesiones por comunidad" with a one-line intro
  (the deceased's residence decides) and four cards: Cataluña (moved from `housing`), Madrid, Andalucía, Comunidad
  Valenciana. Hub title/description unchanged. Each of the four pages links the other three ("El impuesto de sucesiones
  en otras comunidades"), the Catalan page included (one block, body only).
- Rules read 19 Nov 2026 (BOE consolidated texts, curl + grep): Madrid DL 1/2010 arts. 21 (in force 01/07/2026, Ley
  3/2026, same figures), 23, 24, 25.1 (99 % I-II; 50 % group III from 01/07/2025, Ley 2/2025), 26; Andalucía Ley 5/2021
  arts. 26-29, 37-39 (unchanged since 01/01/2022; home 99 % with the state 122.606,47 € cap, insurance state 9.195,49 €);
  Valencia Ley 13/1997 arts. 10 (in force 11/08/2026, Ley 5/2026, same figures), 11-12 (01/01/2024), 12 bis (99 % I-II;
  99 % disability ≥65 % or mental ≥33 %; 25 % blood collaterals from 01/06/2026, 50 % from 01/06/2027), 12 ter/quáter;
  group III, IV and insurance = state (ATV form 650 instructions). State: Ley 29/1987 arts. 20-22, RD 1629/1991 arts. 39,
  67, 68, Ley 22/2009 arts. 28, 32, 48.
- Tests: Madrid's own published figure (cuota íntegra 1.250 € → 12,50 €) to the cent; no official simulator exists for
  any of the three (Madrid computes inside the Oficina Virtual; Andalucía's old simulator domain is parked; the ATV only
  simulates property/vehicle values), so 17 cases hand-calculated outside the engine (Python Decimal, half-up) plus the
  excess rule at 403.500 € (Madrid) and 391.000 € (Valencia). `RULES_UNTIL` 2027-01-01 (tests/inheritance-tax-regions.test.ts).

**Baseline (GSC 23 Oct–19 Nov 2026).** 0 impressions for any query containing "sucesion", "successi", "inheritance",
"herencia" or "herència" (same check as the Catalan entry above, same day): no ranking for the topic anywhere.

**Hypothesis.** Indexed within a week of IndexNow; the nine URLs reach ≥ 1,000 impressions in the 28 days to the review,
mostly the three Spanish editions on "impuesto de sucesiones madrid|andalucía|comunidad valenciana" and "calculadora
sucesiones …", and ≥ 25 % of sessions with a `calculator_use`. Wrong if fewer than 300 impressions by 17 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, the three es URLs). Review **2026-12-17**: `snapshot.py page
impuesto-sucesiones 28`, `page impost-successions 28`, `page inheritance-tax 28`; GA4 `calculator_use` for the three ids;
the hub's own clicks before/after the new group (`snapshot.py page /es/calculadoras/ 28`).

**Confounders.** The Catalan page went live the same day (shared queries "impuesto de sucesiones"). January 2027 budget
laws (Madrid, Andalucía, Valencia) may change the rules inside the window: the date guard fails on 1 Jan 2027; log any
body update here.

**IndexNow after deploy:** `python scripts/indexnow-sitemap.py /es/calculadoras/impuesto-sucesiones- /ca/calculadores/impost-successions-
/en/calculators/madrid-inheritance-tax/ /en/calculators/andalusia-inheritance-tax/ /en/calculators/valencia-inheritance-tax/
/en/calculators/catalonia-inheritance-tax/`, plus the hub `/ca/calculadores/ /es/calculadoras/ /en/calculators/`.

**Outcome:** _pending_

## 2026-11-19 — "Impuesto de donaciones" in Cataluña, Madrid, Andalucía and the Comunidad Valenciana, es + ca + en (4 new pages × 3 editions; deploy only, no publish group) + hub section renamed "Impuesto de sucesiones y donaciones por comunidad" (review 2026-12-17)

**Why.** "impuesto de donaciones <comunidad>" and "donación de padres a hijos" have strong Spain-wide demand and the site
had only the inheritance side. One calculator page per community, the same four as the inheritance family, nothing
thinner for the rest. Fact pack: research_notes/gift-tax-spain.md (gitignored, worktree copy).

- URLs (es primary): `/es/calculadoras/impuesto-donaciones-cataluna/`, `/es/calculadoras/impuesto-donaciones-madrid/`,
  `/es/calculadoras/impuesto-donaciones-andalucia/`, `/es/calculadoras/impuesto-donaciones-comunidad-valenciana/`;
  `/ca/calculadores/impost-donacions-catalunya/`, `/ca/calculadores/impost-donacions-madrid/`,
  `/ca/calculadores/impost-donacions-andalusia/`, `/ca/calculadores/impost-donacions-comunitat-valenciana/`;
  `/en/calculators/catalonia-gift-tax/`, `/en/calculators/madrid-gift-tax/`, `/en/calculators/andalusia-gift-tax/`,
  `/en/calculators/valencia-gift-tax/`. Sitemap + hreflang (x-default en), llms.txt, site-search shortcuts ("donaciones
  madrid", "donaciones andalucia", "donaciones comunidad valenciana", bare "donaciones"/"donacion padres a hijos" →
  Cataluña), `calculator_use` ids `gift-tax-catalonia|madrid|andalucia|valencia`, next step (home-purchase taxes,
  mortgage). Registry ids in calculators/paths.ts.
- Hub (/es/calculadoras/ + ca/en): group `taxes` retitled "Impuesto de sucesiones y donaciones por comunidad" (ca
  "Impost de successions i donacions per comunitat", en "Inheritance and gift tax by region"), intro now also says a
  gift pays where the property is or the donee lives; four gift cards after the four inheritance ones. Hub title and
  description unchanged. Cross-links: each gift page links the other three and the same community's inheritance
  calculator; each inheritance page (Catalan one included, via InheritanceByRegion) links its community's gift page.
- Rules read 19 Nov 2026 (curl + grep; Portal Jurídic API for Catalonia, BOE consolidated texts with version history):
  Catalonia Codi tributari arts. 632-20/21 (first home 95 %, max 60.000/120.000, ≤36 years, IRPF ≤36.000, six months
  since 27/06/2025), 633-1, 633-2 (reduced 5/7/9 % for groups I-II with deed, deed within one month of handing over
  cash), 633-3, no rebate; deadline one month (Decret 414/2011 art. 10.b). Madrid DL 1/2010 arts. 22 bis (cash for home
  100 % up to 250.000), 23, 24, 25.2 (from 01/07/2025: 100 % ≤1.000 € in 3 years; 99 % I-II; 50 % III; public document
  above 10.000 €; cash origin stated); deadline 30 working days (RD 1629/1991 art. 67.1.b, Madrid page). Andalucía Ley
  5/2021 arts. 32/33 (home 99 %, base ≤150.000/250.000, <35, prior wealth ≤402.678,11), 37, 38, 40 (from 01/01/2026:
  document and cash origin above 5.000 €), 68.1 (two months). Valencia Ley 13/1997 arts. 10 bis.2 (100.000 / up to
  156.000; disability 240.000/120.000), 11, 12, 12 bis (99 % direct family and disability; 25 % blood collaterals from
  01/06/2026, 50 % from 01/06/2027), 12 ter (one month). State: Ley 29/1987 arts. 5, 9, 20.5, 22.2, 24, 30; RD 1629/1991
  arts. 46.b, 67.1.b; Ley 22/2009 arts. 28, 32. Only Madrid uses the 30-working-day deadline.
- Tests (tests/gift-tax.test.ts): the agencies' own worked examples to the cent — ATC cases 1-8 and 11 (15.250;
  35.750; 15.250; 100; 1.500; 10.799,76; 7.305,72; 11.400; 2.700), Comunidad de Madrid (316,21; accumulation 16,9 % →
  16,90), Agencia Tributaria de Andalucía guide (126,20; accumulation 9,82 % → 14,73); Valencia publishes none; 24
  cases hand-calculated outside the engine (Python Decimal, half-up); thresholds (10.000 €, 5.000 €, 1.000 €), home
  conditions and caps, the excess rule at 500.100 € (Catalonia). `RULES_UNTIL` 2027-01-01.

**Baseline (GSC 23 Oct–19 Nov 2026).** 0 impressions for any page containing "donac" (`snapshot.py page donac 28`,
`page donacions 28`): no ranking for the topic.

**Hypothesis.** Indexed within a week of IndexNow; the twelve URLs reach ≥ 1,500 impressions in the 28 days to the review,
mostly the four Spanish editions on "impuesto de donaciones madrid|andalucía|cataluña|comunidad valenciana" and
"donación padres a hijos …", and ≥ 25 % of sessions with a `calculator_use`. Wrong if fewer than 400 impressions by 17 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, the four es URLs). Review **2026-12-17**: `snapshot.py page
impuesto-donaciones 28`, `page impost-donacions 28`, `page gift-tax 28`; GA4 `calculator_use` for the four ids; the
inheritance pages' clicks before/after the cross-link (`snapshot.py page impuesto-sucesiones 28`).

**Confounders.** The inheritance pages went live the same day and share the hub group. January 2027 budget laws of the
four communities may change the rules inside the window: the date guard fails on 1 Jan 2027; log any body update here.

**IndexNow after deploy:** `python scripts/indexnow-sitemap.py /es/calculadoras/impuesto-donaciones- /ca/calculadores/impost-donacions-
/en/calculators/catalonia-gift-tax/ /en/calculators/madrid-gift-tax/ /en/calculators/andalusia-gift-tax/ /en/calculators/valencia-gift-tax/`,
plus the hub and the inheritance pages that gained the link: `/ca/calculadores/ /es/calculadoras/ /en/calculators/
/es/calculadoras/impuesto-sucesiones- /ca/calculadores/impost-successions- /en/calculators/catalonia-inheritance-tax/
/en/calculators/madrid-inheritance-tax/ /en/calculators/andalusia-inheritance-tax/ /en/calculators/valencia-inheritance-tax/`.

**Outcome:** _pending_

---

## 2026-11-19 — "Gastos de compraventa de vivienda: notaría y Registro", calculator es + ca + en (new page; deploy only, no publish group) (review 2026-12-17)

**Why.** Owner brief (19 Nov 2026): "gastos de compraventa de vivienda / gastos de notaría / gastos de registro". The
home-purchase tax page printed the two aranceles but said "no lo calculamos". Fact pack:
research_notes/gastos-compraventa-factpack.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/gastos-compraventa-vivienda/` (primary), `/ca/calculadores/despeses-compravenda-habitatge/`,
  `/en/calculators/spain-home-buying-costs/` (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut
  "gastos compraventa", "gastos notaria", "notaria", "notario", "registro de la propiedad", "despeses compravenda",
  "notary fees", "land registry", placed before "itp"; `calculator_use` id `home-purchase-costs`). Registry `CALCULATORS`
  id `home-purchase-costs`; hub card in `housing` right after the purchase taxes. Next step: purchase taxes, mortgage.
  The purchase-tax and mortgage next-step boxes now include it (tax: costs + mortgage, was mortgage + Euribor; mortgage:
  taxes + costs), and both pages gain one body link (no title or description touched).
- Inputs: region, price (≤ 6.010.121,04 €, the notary's free limit), new/second-hand, folios of the deed (default 20,
  printed as an example, not an average), simple copies, buyers in pro indiviso (1–4), who pays the deed (legal split /
  agreed), mortgage yes/no, VPO (+ ≤ 90 m² and only home for a developer's sale), the tax profile (age, habitual, first
  home, large family, disability). Outputs: notary deed (scale, 50 % VPO, 5 % rebaja, matrix folios), authorised copy,
  simple copies, registry presentation + registration (shares, 1 % cap, 50 % VPO, two 5 % rebajas), IVA 21 % by payer,
  the purchase taxes from the home-purchase tax engine (same JSON fetch, no duplication), buyer total, seller share.
- Rules (read 19 Nov 2026 in the BOE, curl + grep; 65 quotes verbatim, checked by a scratchpad script against the
  downloaded texts, and the 29 rendered blockquotes of each edition checked again): RD 1426/1989 (BOE-A-1989-28111,
  consolidated 17/11/2011) números 1.1.f, 2.1 (90,151816 € to 6.010,12; 4,5 / 1,50 / 1 / 0,5 / 0,3 ‰; free above
  6.010.121,04; 5 % rebaja), 2.2 (25 % loans; 50 % VPO resales, letra e), 2.3, 4 (3,005061 €/folio, half from the 12th;
  copia simple 0,601012), 7 (3,005061 € per written side from the 5th folio), normas 1ª, 2ª, 6ª, 9ª, 10ª; RD 1427/1989
  (BOE-A-1989-28112, consolidated 17/11/2011) números 1 (6,010121 €), 2.1 (24,040484 €; 1,75 / 1,25 / 0,75 / 0,30 /
  0,20 ‰; min 24,040484, max 2.181,673939; 5 % rebaja; 2.1.g cancellations), 2.4.b (50 % VPO resales), 2.5, 3.3, 4.1.f,
  normas 1ª, 2ª (pro indiviso, 1 % cap; spouses in community one base), 6ª, 8ª; RD 1612/2011 (BOE-A-2011-17962);
  RDL 8/2010 DA 8ª (BOE-A-2010-8228); RDL 6/2000 (BOE-A-2000-11836) art. 35.1 (optional notary discount up to 10 %, not
  applied) and art. 36.1 (registry −5 % on "la compraventa de viviendas", after the rebaja); Ley 41/1980 art. 8
  (BOE-A-1980-15958, wording of RDL 6/2000 art. 37) + DGRN Instruction 22 May 2002 (BOE-A-2002-12290) arts. 5 and 11
  (60,047119 € / 24,016444 € up to 90 m², only home); Código Civil art. 1455; TRLITP arts. 8 and 29; Ley 5/2019 art.
  14.1.e (BOE-A-2019-3814, consolidated 07/10/2026); LIVA art. 90 (21 %) and art. 3 (no IVA in Canarias, Ceuta,
  Melilla: IGIC/IPSI not computed); Reglamento Notarial art. 155 (four planas per pliego: two sides per folio); Código
  civil de Cataluña art. 231-10.2 (separación de bienes by default → couples buying half each are a pro indiviso).
  BOE API: none of these norms is repealed (vigencia_agotada N).
- Readings flagged on the page: folios counted on both sides and copies as long as the matrix (reader's estimate);
  Ley 41/1980's "derechos de matriz" applied to the scale and first copy, not to matrix folios (estimate on the high
  side); the VPO fixed amount counted wholly in the buyer's total; presentation entry not reduced. Gestoría and tasación
  have no official price and are never estimated; the mortgage deed's notary, registration, gestoría and AJD are the
  bank's (no amount computed: the buyer does not pay them).
- Worked examples (tests/purchase-costs.test.ts): 250.000 € second-hand Catalonia, 20 folios, 1 simple copy → notary
  scale 383,44 (364,26 after 5 %), matrix folios 96,16, deed 460,42 (seller), copy 46,58, simple 12,02; registry scale
  201,21 → 181,59 + 6,01; IVA 51,70 buyer / 96,69 seller; ITP 25.000 (tax engine) → buyer 25.297,90, seller 557,11.
  Also 200.000 € new Madrid → 21.631,53; 300.000 € two buyers → registration 308,83 vs 195,13; 150.000 € VPO resale →
  10.671,60; 120.000 € new VPO ≤ 90 m² → 60,05 + 24,02 → 4.901,72.

**Date guard (tests/purchase-costs.test.ts).** From **1 Jan 2027** (re-read the aranceles and the norms above).

**Baseline (GSC, 28 days to 19 Nov).** No page targets the topic: 0 impressions for any "notar", "registr", "gastos
compraventa" query in `/calculadoras/` (`snapshot.py page /calculadoras/ 28`); the purchase-tax page itself has 0.

**Prediction.** Indexed within 7 days (IndexNow). Heads ("gastos de notaría", "gastos compraventa vivienda") are held by
notariado.org, registradores.org, banks and portals: no top-3 target. Long tail on page 1–2 by mid-December: "gastos
notaría compraventa 200.000 euros", "quién paga la notaría comprador o vendedor", "gastos registro propiedad
compraventa", "arancel notarial compraventa", "despeses notaria compravenda". By 17 Dec: ≥ 1,000 impressions/28 days for
the three URLs, ≥ 20 % of sessions with `calculator_use`. Wrong if under 300 impressions/28 days by 17 Dec.

**Measure:** 26 Nov URL inspection (the es URL, rendered tables); 17 Dec and 14 Jan 2027 `snapshot.py page
gastos-compraventa 28` (+ despeses-compravenda, spain-home-buying-costs); `calculator_use` `home-purchase-costs`;
next-step clicks from and to the purchase-tax and mortgage pages. **Review: 2026-12-17.**

**Confounders.** The purchase-tax and mortgage pages gain a body link and a next-step change the same day; any January
2027 decree on aranceles moves the figures (the date guard fails on 1 Jan 2027).

**Deploy.** Deploy only (code routes, nothing in the database: no publish group). IndexNow prefixes:
`/es/calculadoras/gastos-compraventa-vivienda/`, `/ca/calculadores/despeses-compravenda-habitatge/`,
`/en/calculators/spain-home-buying-costs/`, plus the re-crawl of `/es/calculadoras/impuestos-compra-vivienda/`,
`/ca/calculadores/impostos-compra-habitatge/`, `/en/calculators/spain-home-purchase-taxes/`, `/es/calculadoras/hipoteca/`,
`/ca/calculadores/hipoteca/`, `/en/calculators/mortgage-calculator-spain/` and the three calculators hubs.

## 2026-11-19 — "Plusvalía municipal: calculadora por los dos métodos", es + ca + en (new page; deploy only, no publish group) (review 2026-12-17)

**Why.** research_notes/spain-utilities-opportunities-nov2026.md row 18: "plusvalía" ≈ 35k searches/month and the
calculators that rank lack the 2026 coefficient history; per-municipality rates stay out of scope (only Barcelona's,
quoted). Fact pack: research_notes/plusvalia-municipal-nov2026.md (gitignored, worktree copy).

- URLs: `/es/calculadoras/plusvalia-municipal/` (primary), `/ca/calculadores/plusvalua-municipal/`,
  `/en/calculators/spain-plusvalia-tax/` (sitemap + hreflang, x-default en; llms.txt entry; site-search shortcut
  "plusvalía", "plusvàlua", "iivtnu"; `calculator_use` id `plusvalia`). Registry id `plusvalia`; hub card in the
  `housing` group after the home-purchase taxes (scope `spain`). Next step: home-purchase taxes, Catalan inheritance tax.
  Linked from the home-purchase tax page (who pays, art. 106) and the four inheritance tax pages (heir's deadline).
- Rules (read 19 Nov 2026 with curl from the BOE API and diario XML): TRLRHL (RDL 2/2004, BOE-A-2004-4214, consolidated
  text of 7 Oct 2026) arts. 59.2, 104.1, 104.3, 104.5, 105.1.c, 106, 107.1-107.5, 108.1-108.4, 109.1, 110.1-110.6, as
  reformed by RDL 26/2021 (context: STC 182/2021, BOE 25-11-2021). Maximum coefficients by devengo date: RDL 8/2023 art.
  24 (from 1-1-2024; back in force from 23-1-2025 and 28-1-2026), RDL 9/2024 art. 9 and RDL 16/2025 art. 18 (same table;
  in force only 1-22 Jan 2025 and 1-27 Jan 2026, derogated by Congress), RDL 29/2026 art. 10 from 1 Dec 2026
  (convalidated 12 Nov 2026, BOE-A-2026-23755). No 2027 update published. Barcelona: ordenança fiscal 1.3 (BOP
  23-12-2024, unchanged by the 2026 modification): 30 %, own coefficients (0,05 under a year), 95 % habitual-home rebate,
  automatic application of legal updates; IMH procedure with its own estimate. ORGT quoted from its homepage only.
- Every quote is checked as a substring of the downloaded official text; the engine is tested on six hand-calculated
  cases (1.620 / 1.980 / 2.250 / 0 / 225 / 1.530 € at 30 %).
- YMYL: disclaimer (the council's assessment or self-assessment is the official amount; no state simulator, Barcelona's
  linked) under the tool and at the foot; `RULES_UNTIL` 2027-01-01 (tests/plusvalia.test.ts fails from then until art.
  107.4 is re-read for 2027).

**Baseline (GSC 22 Oct–18 Nov 2026).** 0 impressions for any query containing "plusv": the site has never ranked for
the topic.

**Hypothesis.** Indexed within a week of IndexNow, the three editions reach ≥ 500 impressions in the 28 days to the
review, mostly "plusvalía municipal" / "calculadora plusvalía" / "coeficientes plusvalía 2026|diciembre", top-20 average
position, and ≥ 30 % of sessions with a `calculator_use`. Wrong if fewer than 150 impressions by 17 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, three URLs). 2 Dec: queries naming the December coefficients. Review
**2026-12-17**: `snapshot.py page plusvalia-municipal 28`, `page plusvalua-municipal 28`, `page spain-plusvalia-tax 28`;
GA4 `calculator_use` `plusvalia`.

**Confounders.** The 1 Dec 2026 coefficient change itself (news demand); a 2027 update in late December would force a
body update during the window: log it here if it happens.

**Deploy.** Deploy only (static route; no publish group). IndexNow prefixes: `/es/calculadoras/plusvalia-municipal/
/ca/calculadores/plusvalua-municipal/ /en/calculators/spain-plusvalia-tax/`, plus the hub and the pages that gained the
link: `/es/calculadoras/ /ca/calculadores/ /en/calculators/ /es/calculadoras/impuestos-compra-vivienda/
/ca/calculadores/impostos-compra-habitatge/ /en/calculators/spain-home-purchase-taxes/ /es/calculadoras/impuesto-sucesiones-
/ca/calculadores/impost-successions- /en/calculators/catalonia-inheritance-tax/ /en/calculators/madrid-inheritance-tax/
/en/calculators/andalusia-inheritance-tax/ /en/calculators/valencia-inheritance-tax/`.

**Outcome:** _pending_

## 2026-11-19 — "Impuesto de sucesiones por comunidad 2026: comparativa" of the 21 territories, es + ca + en (new page + CSV; deploy only, no publish group) (review 2026-12-17)

**Why.** "¿Dónde se paga menos impuesto de sucesiones?", "impuesto de sucesiones por comunidad 2026", "comparativa
sucesiones comunidades": one authoritative comparison instead of 13 thin pages (house rule), and a linkable
original-data asset with a CC BY 4.0 CSV (docs/MEDIA_PLAN.md, pillar E). Fact packs: research_notes/isd-por-comunidad/
(gitignored, worktree copy).

- URLs: `/es/calculadoras/impuesto-sucesiones-por-comunidad/` (primary), `/ca/calculadores/impost-successions-per-comunitat/`,
  `/en/calculators/spain-inheritance-tax-by-region/`; CSV `/data/impuesto-sucesiones-por-comunidad-2026.csv` (Link header:
  canonical es page + licence). Registry id `inheritance-tax-by-region`; first card of the hub's `taxes` group, whose
  intro now names the comparison; sitemap + hreflang (x-default en); llms.txt entry; site-search shortcut ("sucesiones por
  comunidad", "comparativa sucesiones", "dónde se paga menos sucesiones", "successions per comunitat", "inheritance tax by
  region"); next step: plusvalía municipal, widow's pension. Linked from the "other regions" block of the four inheritance
  and four gift calculators (gifts link to `#donaciones`). No `calculator_use`: no inputs (sortable table only), excluded in
  tests/analytics-events.test.ts like the IPC page.
- Content: per territory (15 common-regime communities; Ceuta and Melilla under Ley 29/1987 with art. 23 bis — 99 % for
  groups I-II, 50 % for the rest, not a flat 50 %; Álava NF 11/2005, Bizkaia NF 4/2015, Gipuzkoa NF 2/2022 — NF 3/1990 is
  repealed — and Navarra DFLeg 250/2002, groups I-II basics) the group II reductions, the group I-II rebate, the
  habitual-home reduction, siblings (group III), and parent→child gifts (benefit + formal requirement), each cell with
  article, in-force date and source link; the law's words per cell in collapsible sections; a verification note for the
  12 territories with an open point (texts not downloadable, ambiguous rules, announced 2027 changes). No cell is
  "pendiente de verificar" today; the component and CSV support it.
- Rules read 19 Nov 2026 by four research agents and checked: BOE consolidated texts (Aragón, Asturias, Baleares, Canarias,
  Cantabria, Castilla-La Mancha, Castilla y León, Extremadura, Galicia, Murcia, La Rioja, Navarra), the amending 2024-2026
  laws, the diputaciones' consolidated foral texts, the BOIB (Orden 13/2026) and the ACAT's gift page; the four built
  communities reuse their calculators' quoted rules. Every quote is a mechanically checked substring of the downloaded
  official text (scripts in research_notes/isd-por-comunidad/tools/).
- Worked example (only child, 30, 300.000 € net incl. a 150.000 € home he did not live in, no prior wealth): 0 € in 12
  territories (Andalucía, Aragón, Asturias, Baleares, Cantabria, Castilla-La Mancha, Castilla y León, Extremadura, Galicia,
  Álava, Bizkaia, Gipuzkoa), 17,22 € Canarias, 59,55 € C. Valenciana, 233,34 € Madrid, 234,46 € Murcia, La Rioja, Ceuta and
  Melilla, 1.000 € Navarra, 1.946,25 € Cataluña. The four built communities go through their own engines; the rest through
  the quoted rules; tests/inheritance-compare.test.ts checks all 21 against independent hand calculations and that every
  figure applied appears in the quotes.
- YMYL: disclaimer under the lead and at the foot, links to the four communities' calculators and each agency;
  `RULES_UNTIL` 2027-01-01 (tests/inheritance-compare.test.ts fails from then until the 21 texts are re-read).

**Baseline (GSC 23 Oct–19 Nov 2026).** 0 impressions for any query containing "sucesion", "successions", "herencia" or
"inheritance" (the four inheritance calculators were also built on 19 Nov and are not live yet).

**Hypothesis.** Indexed within a week of IndexNow; ≥ 300 impressions across the three editions in the 28 days to the
review, mostly "impuesto de sucesiones por comunidad", "dónde se paga menos impuesto de sucesiones", "comparativa impuesto
sucesiones", at a top-20 average position; ≥ 1 referring domain citing the page or the CSV by 31 Jan 2027 (pillar E).
Wrong if fewer than 100 impressions by 17 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, three URLs). Review **2026-12-17**: `snapshot.py page
impuesto-sucesiones-por-comunidad 28`, `page impost-successions-per-comunitat 28`, `page spain-inheritance-tax-by-region
28`; next-step clicks to and from the eight calculators; GSC Links report for the page and the CSV (31 Jan 2027).

**Confounders.** The eight inheritance and gift calculators launch in the same deploy and link the page; any 2027 budget
law (most apply from 1 January) forces a body update inside the window — log it here; Castilla y León's announced 2027
cuts.

**Deploy.** Deploy only (static routes, nothing in the database: no publish group). IndexNow prefixes:
`/es/calculadoras/impuesto-sucesiones- /ca/calculadores/impost-successions- /en/calculators/spain-inheritance-tax-by-region/
/es/calculadoras/impuesto-donaciones- /ca/calculadores/impost-donacions- /en/calculators/catalonia-inheritance-tax/
/en/calculators/madrid-inheritance-tax/ /en/calculators/andalusia-inheritance-tax/ /en/calculators/valencia-inheritance-tax/
/en/calculators/catalonia-gift-tax/ /en/calculators/madrid-gift-tax/ /en/calculators/andalusia-gift-tax/
/en/calculators/valencia-gift-tax/` (the hubs `/es/calculadoras/ /ca/calculadores/ /en/calculators/` are prefixes of every
calculator: ping them only together with the rest of the deploy's calculators).

**Outcome:** _pending_

## 2026-11-19 — "Qué hacer cuando fallece un familiar: trámites y plazos", guide es + ca + en (new; deploy, then group `fallecimiento`) (review 2026-12-17)

**Why.** Steady, non-seasonal demand ("trámites fallecimiento", "certificado de últimas voluntades", "certificado de
seguros de cobertura de fallecimiento", "plazo impuesto sucesiones", "pensión de viudedad cómo solicitar"). This week's
calculators (inheritance tax in four communities + the 21-territory comparison, gift tax, plusvalía, widow's pension,
home buying costs) had no page that puts the steps in order and links them.

**What was added.** Three editions on year-free URLs:
- `/es/guias/que-hacer-cuando-fallece-un-familiar/`
- `/ca/guies/que-cal-fer-quan-mor-un-familiar/`
- `/en/guides/what-to-do-when-someone-dies-spain/`

Module `src/lib/content/batch02/death-steps.ts` (DEATH_STEPS_AS_OF 2026-11-19, every quote in its header; fact pack
`research_notes/death-steps-nov2026.md`), test `tests/death-steps.test.ts`.
- Answer first: lead + an 18-row checklist with dates relative to the death, each row with its rule.
- First hours: Ley 20/2011 arts. 62–67 (medical certificate compulsory, hospital reports electronically, elsewhere "a la
  mayor brevedad posible", licence "en el plazo que reglamentariamente se establezca"); Ministry of Justice: the funeral
  company usually reports it; Catalonia: Decret 297/1997 art. 11.1 (not before 24 h) and 35.1 (conservation after 48 h);
  ET art. 37.3.b bis (2 days + 2).
- Certificates (Ministry of Justice e-office): death (at once if online), últimas voluntades and seguros (from 15 working
  days, tasa 006; insurance usually 24 h, max 7 working days); Ley 20/2005 arts. 2–7 (5 years, beneficiary check). The
  law says "quince días", the e-office 15 working days: the later date is printed. Fee amount NOT printed (no official
  page read shows it).
- Estate: CC 657, 658, 912, 1003, 1005 (30 natural days → accepted), 1010, 1014, 1023; Ley del Notariado 55–56
  (declaración de herederos, ≥ 20 working days).
- Catalonia (book four, consolidated version incl. Llei 13/2026, in force 4 Feb 2027 — quoted articles unchanged): legítima
  1/4 (451-5) vs 2/3 (CC 808), quarta vidual (452-1), intestate usufruct + 1-year commutation (442-3, 442-5.2), no
  deadline to accept (461-12.1) but 2-month interpellation → repudiation, inventory 6 months incl. private inventory filed
  with the tax (461-15), vecindad civil (CC 9.8, 16.1).
- Taxes: ISD 6 months + 6 asked within 5 (RD 1629/1991 arts. 67–68, ATC), plusvalía 6 months extendable to 1 year
  (TRLRHL 110.2.b), deceased's IRPF (LIRPF 13, LGT 39).
- Social Security: LGSS 216, 218, 224, 230, 53.1; auxilio 46,50 €; orphan 20 %; widow's pension effects (3 months).
- Banks: Banco de España guidance (no withdrawals before adjudication except all heirs, funeral, prior debits; indistinta
  vs mancomunada) + LISD art. 8.1.a; "no law freezes accounts" and no deadline in the rules read.
- "Plazos que la ley no fija" list, YMYL disclaimer (warning callout), 13 FAQs, verified line, related calculators.
- No hero (noPhotoReason: bereavement guide).

**Links.** Out: all ten calculators it ties together + pay-dates guide + working-days calculator. In (body only, small
paragraph, no title changes): InheritanceByRegion (Catalonia, Madrid, Andalucía, Valencia inheritance pages), GiftByRegion
(four gift pages), the comparison ("Qué norma se aplica"), plusvalía (deadline list, inheritance item), widow's pension
("Cómo se solicita"). Site search: new topic (not the bare "fallecimiento", so "permiso por fallecimiento" still opens
the paid-leave calculator). Sitemap and llms.txt list it once published (database entry).

**Baseline (GSC 23 Oct–19 Nov 2026).** 0 impressions: no query containing fallec-/defunc-/últimas voluntades/herencia/
viudedad/death among the site's top 25,000 queries. New URLs, nothing cannibalised.

**Hypothesis.** Indexed within a week of IndexNow; ≥ 500 impressions across the three editions in the 28 days to the
review, long tail first ("certificado de últimas voluntades cuándo se puede pedir", "certificado seguros cobertura
fallecimiento", "plazo plusvalía herencia", "auxilio por defunción cuantía", "legítima cataluña"); next-step clicks from
the guide to the calculators. Wrong if under 150 impressions by 17 Dec or not indexed by 3 Dec.

**Measure.** 26 Nov: indexed? (URL inspection, three URLs). Review **2026-12-17**: `snapshot.py page
que-hacer-cuando-fallece-un-familiar 28`, `page que-cal-fer-quan-mor-un-familiar 28`, `page
what-to-do-when-someone-dies-spain 28`; GA4 related_content_click from the guide and from the calculators' new link.

**Upkeep** (test fails until done): from 15 Jan 2027 (DEATH_STEPS_REREAD_BY) re-read the ISD/plusvalía articles, LGSS
and the Seguridad Social pages (auxilio amount), the Ministry of Justice certificate pages and book four after Llei
13/2026 (in force 4 Feb 2027), then move DEATH_STEPS_AS_OF. RDL 31/2026 (art. 224 wording) needs convalidation by 28 Nov:
if repealed, the under-21/under-25 rule quoted is the same in both wordings.

**Deploy.** Deploy (route code + calculators' back-links), then publish group `fallecimiento`. IndexNow prefixes:
`/es/guias/que-hacer-cuando-fallece-un-familiar/ /ca/guies/que-cal-fer-quan-mor-un-familiar/
/en/guides/what-to-do-when-someone-dies-spain/` plus the changed calculators: `/es/calculadoras/impuesto-sucesiones-
/ca/calculadores/impost-successions- /es/calculadoras/impuesto-donaciones- /ca/calculadores/impost-donacions-
/en/calculators/catalonia-inheritance-tax/ /en/calculators/madrid-inheritance-tax/ /en/calculators/andalusia-inheritance-tax/
/en/calculators/valencia-inheritance-tax/ /en/calculators/spain-inheritance-tax-by-region/ /en/calculators/catalonia-gift-tax/
/en/calculators/madrid-gift-tax/ /en/calculators/andalusia-gift-tax/ /en/calculators/valencia-gift-tax/
/es/calculadoras/plusvalia-municipal/ /ca/calculadores/plusvalua-municipal/ /en/calculators/spain-plusvalia-tax/
/es/calculadoras/pension-viudedad/ /ca/calculadores/pensio-viduitat/ /en/calculators/spain-widows-pension/`.

**Outcome:** _pending_


## 2026-11-19 — Calculators top-5 push: SMI 2027 typed in from today's BOE, the kinship table, which pensions rise, 15 working days, WebApplication on 12 tools, two links in (body only; deploy, then groups `pagos`, `calendario-2027-espana`) (review 2026-12-03 and 2026-12-17)

**Observation.** The calculators family moved from ~27 to ~10 in a week (GSC 6–19 Nov, 19 Nov partial: ES 34 clicks / 3,562
impressions / 1.0 % / ~12; CA 25 / 1,065 / 2.3 % / ~6; EN 2 / 141 / ~10). Page × query pull at 4.5–20.5
(`calc_pages.py` on the snapshot.py auth; most impressions are anonymised). No calculator query is in `gaps 14 80` (strikes fill
it). Each calculator with impressions was read against its live first screen and body:

| Calculator (14 d, ca+es+en: clicks / impr. / pos) | Queries at 5–20 (impr., pos) | Gap | Change |
| --- | --- | --- | --- |
| SMI 2027 — 11 / 957 / 7.4 | "smi 1286" 4 · 9.0; "salario minimo cataluña 2026" 3 · 5.7; "salario mínimo 2027 españa en 12 pagas" 2 · 9.5; "smi catalunya" 2 · 5.5; "cuando lo publicaran" / "cuando se publica" 1 · 6–9; CA "salari minim interprofessional 2027" 17 · 8.3 | The BOE published RD 1013/2026 this morning; the page flipped to "official" by itself (13 Nov design) but its body still said "2027 no vale para tu nómina hasta que salga en el BOE", "el proyecto prevé…", "Historia de 2018 a 2026". No "is it the same in Catalonia" answer; no "when is it first paid" | 1 |
| Pensions 2027 — 20 / 480 / 8.2 | CA "pujada pensions 2027" 45 · 8.2, "quan pujaran les pensions (el) 2027" 9 · 8.5; "cuanto sube la brecha de genero en 2027" 4 · 10.0; "subida pensiones 2027 incapacidad permanente" 3 · 20.0 | Lead answers "January"; nothing says which pensions rise or what the gender-gap supplement becomes | 2 |
| Paid leave — 3 / 304 / 7.6 | "tabla de permisos por fallecimiento cataluña" 5 · 9.4; "grados de consanguinidad días de permiso" 1 · 15; "dias de permiso por boda" 1 · 18; CA "estatut dels treballadors 2026 catalunya" 3 · 9.3 | Table and FAQ say "hasta segundo grado" but never who that is | 3 |
| Working days — 3 / 472 / 8.1 | "dias laborables" 5 · 14.0; "15 dias habiles" 2 · 18.5; "dias habiles 2027" / "calendario dias habiles 2027" 2 · 6.5–8; "dias habiles noviembre 2026" 2 · 8.0 | Monthly 2026/2027 table already there; examples only for 10 and 5 days | 4 |
| Letras del Tesoro — 12 / 898 / 7.3 | Calendar queries (17 Nov change, review 1 Dec); CA "lletres del tresor a 12 mesos" 20 · 9.8 | The CA lead already gives 3,045 % at 12 months | none (window) |
| Subsidy — 2 / 215 | "cuanto es el subsidio", "subsidio 2026" 1–2 · 10–11 | Lead gives 570/540/480 € | none |
| Paro — 3 / 243 / 23.7 | "tabla de paro por dias cotizados" 1 · 14; "paro por un año trabajado" 1 · 13 | Official table in the body; ES average pulled down by queries at 35–60 | none |
| IPC — 1 / 197 | "ipc octubre 2026 catalunya" ES 4 · 9.0 + 3 · 10.7, CA 6 · 8.0; "cuando se publica el proximo ipc" 2 · 9.0 | Catalonia's CPI is not on the page (only national series) | proposal below |
| Rent update 4 / 128 / 18.0; ITV 1 / 185 / 21.1; self-employed 0 / 157; net salary 1 / 132 | One-impression queries ("ipc alquileres 2025", "cuanto cuesta la itv", "trams autonoms 2026", "calculadora sueldo neto barcelona") | Each is answered (price table, tramos table, region section) | none |

**What changed (ca/es/en, body only; no title, description, lead or H1 touched).**
1. **SMI 2027** (`smi/rules.ts`, `SmiPage.tsx`). `OFFICIAL_2027` = Real Decreto 1013/2026, de 18 de noviembre (BOE-A-2026-24189,
   BOE 19 Nov 2026), read in its XML today: art. 1 42,87 €/day or 1.286 €/month, art. 3.1 18.004 €/year, art. 4.1 60,88 € per day,
   art. 4.2 10,06 €/hour, final provision three in force 1 Jan 2027 (= the draft's figures). Fixture
   `tests/fixtures/boe-smi-2027-rd1013.xml`; a test checks the parser reads `OFFICIAL_2027` from it and both new quotes are in it. The
   page no longer depends on the hourly BOE answer. Body: the "what is not official" line says 2027 is in the BOE and applies from
   1 January; the "when is it approved" paragraph drops "el proyecto prevé"; new H3 "¿Desde cuándo se cobra el SMI de 2027?" (from
   the January 2027 payslip, no backdated rise this time, quoting final provision three); after the 2027 table, "the same all over
   Spain, Catalonia included", quoting final provision one (art. 149.1.7.ª CE); the draft row says the decree kept its amounts;
   "Historia del SMI de 2018 a 2027"; the disclaimer dates the amounts 19 Nov. No 2027 net figure: the IRPF and contribution rules
   for 2027 are not published (the 2026 net table stays).
2. **Pensions 2027** (`PensionPage.tsx`): one paragraph under the art. 58.2 quote: it covers every contributory pension
   (permanent disability, widow's, orphan's, family members) and the gender-gap supplement the article names, 36,90 € in 2026
   (RDL 3/2026) × the page's own rate ("unos 38,18 €" at today's provisional 3,47 %, recomputed with each INE release);
   non-contributory pensions by the Budget Act (art. 62, already quoted further down).
3. **Paid leave** (`paid-leave/rules.ts`, `PaidLeavePage.tsx`): H3 "¿Quién es familiar hasta segundo grado?" under the leave table:
   spouse/partner, 1st (parents, children), 2nd (grandparents, grandchildren, siblings), 3rd (great-grandparents, uncles, nephews),
   4th (first cousins) against 2 (4) days for a death and 5 for illness/hospitalisation; Código Civil arts. 918 and 919 quoted
   (BOE-A-1889-4763, read today; fixture `boe-codigo-civil-915-919.txt`, test). Affinity: the page says the Statute covers in-laws up
   to the 2nd degree but no law says how that degree is counted (no official table found; third-party tables not used) and points to
   the collective agreement.
4. **Working days** (`working-days/page.ts`, `WorkingDaysPage.tsx`): a fourth example from the engine: 15 días hábiles notified
   30 Nov 2026 end Wed 23 Dec in Madrid and Tue 22 Dec in Barcelona; 15 calendar days, Tue 15 Dec (hand-checked in the test).
5. **Structured data**: `calculatorAppSchema()` in `lib/seo/jsonld.ts` (the same WebApplication shape the 22 other calculators wrote
   inline: free Offer, publisher = Organization, name = H1, description = meta description, no rating) added next to the
   BreadcrumbList on SMI, Letras, working days, pensions 2027, dismissal, finiquito, paro, rent update, ITV, mortgage and home-purchase
   taxes. Left without one: IPC and Euríbor (reference figures, no tool), average salary and the 21-territory comparison (Dataset).
   FAQPage stays only where the questions are printed (net salary, paid leave, subsidy, self-employed, sick leave, rent update).
   New `tests/calculators-jsonld.test.ts` fails if a registry tool's component has no WebApplication.
6. **Links in** (one each, descriptive anchor; no strike, election or holiday-guide page touched — the strongest holiday pages
   already link the working-days calculator and the leave planner):
   - Pay-dates guide (`batch02/pay-dates.ts`, DB article, group `pagos`; 14 d ES 2 / 184 / 21.0, CA 1 / 28 / 4.5, EN 4 / 196 / 3.7):
     a bullet "nor sick leave: as a rule your employer pays it in your payslip («pago delegado»)" → "Calcula cuánto cobras de baja
     laboral" / "Calcula quant cobres de baixa laboral" / "Work out your sick pay in Spain" (sick leave 0 / 178 / 27.8, its "quan es
     cobra estan de baixa" at 11). It already linked paro, subsidy, pensions, retirement, extra pay and net salary.
   - Spain 2027 community pages (19 × 3, ~750 impr. / 14 d ES): under "Qué cambia respecto al resto de España", the working-days
     calculator with that community picked (`#p=<slug>/all`, Catalonia `#p=catalunya`): "Plazos en días hábiles en la Comunidad de
     Madrid: calcula el último día con sus festivos". Hub and city pages already had theirs; a test checks every community value
     exists in the picker in all three languages.

**Not changed / queued.** IPC: Catalonia's CPI (INE's table by community) would answer "ipc octubre 2026 catalunya" (~13 impr. at
8–11, ES + CA): needs a new INE series in `ipc/series.ts`, the snapshot and tests — proposal for the 15 Dec IPC release. Paro: a
"one year contributed = 4 months" sentence would repeat the official table already in the body. SMI 2027 net: wait for the 2027
withholding rules.

**Confounders.** SMI: today's BOE flip changed its title and lead by design (13 Nov entry) — read the SMI page against the 13 Nov
entry's 1 Dec measure, not as this entry's effect alone. Letras: 17 Nov calendar heading (review 1 Dec); only its JSON-LD changes
here. The 13 Nov calculator windows (titles to 15 Dec) are untouched.

**Prediction.** By 3 Dec: "salari minim interprofessional 2027" (CA) ≤ 6 and the SMI ES page ≥ 2 % CTR at equal position; paid
leave "tabla de permisos por fallecimiento" ≤ 6; pensions CA "pujada pensions 2027" ≤ 6; sick leave enters the top 20 for "cuánto se
cobra de baja" variants. By 17 Dec: calculators family ES position ≤ 8 and CTR ≥ 2 %; Search Console shows the WebApplication
items without errors (no rich result expected).

**Review 2026-12-03 and 2026-12-17**: `snapshot.py page calculadoras 14`, `page calculadores 14`, `page calculators 14`,
`page salario-minimo-2027 14`, `page permisos-laborales 14`, `page pujada-pensions-2027 14`, `page baja-laboral 14`,
`page dias-habiles 14`, `page cuando-se-cobra-paro-pension 14`. Revert rule: a section whose page loses ≥ 2 positions at equal
impressions by 17 Dec comes out.

**Deploy.** Deploy (calculator routes and the Spain 2027 templates are code), then publish groups `pagos` (pay-dates guide body)
and `calendario-2027-espana` (community pages). IndexNow prefixes: `/es/calculadoras/ /ca/calculadores/ /en/calculators/
/es/guias/cuando-se-cobra-paro-pension/ /ca/guies/quan-es-cobra-atur-pensio/ /en/guides/unemployment-benefit-pension-payment-dates-spain/
/es/festivos/2027/ /ca/festius/2027/ /en/holidays/2027/`.

## 2026-11-19 (night) — New pages: "Huelga 23 de noviembre de 2026" (SEMAF at Renfe, Correos, doctors) and "Huelga 26 de noviembre de 2026" (education in Catalonia, doctors, Madrid), es + ca + en; linked from both hubs, the Renfe and education guides and the 19N/20N pages (deploy; groups `strikes`, `huelgas-espana`, `huelga-23-26n`) (review 2026-11-24 and 2026-11-27)

**Why.** The 19N/20N day pages took their dates' queries from the Spain hub within a day (GSC 18 Nov: `/es/guias/huelga-20-noviembre/`
17,557 impressions at 7.0; 19 Nov 9,105 at 6.9). The next two big strike days had no page of their own. Baseline (GSC 13–19 Nov):
on the education guide `/es/guias/huelga-educacion-noviembre/` "vaga 26 novembre" 567 impressions at 5.1 (28 clicks), "vaga 26 de
noviembre" 236 at 7.2, "huelga 26 noviembre 2026" 115 at 6.9 (1 click), "huelga 26 noviembre" 59 at 8.0, "huelga dia 26 de
noviembre" 14 at 8.5; on the Spain hub "el 26 de noviembre hay huelga" 40 at 8.4 and "huelga 23 noviembre 2026" 12 at 10.1 (the
23rd's demand has not started yet; "huelga renfe 19 noviembre" reached 1,542 at 8.1 on the Renfe guide in the same week).

**Sources re-read 19 Nov 2026, 23:10–23:40 CET** (curl with a browser UA; fact pack `research_notes/x10/strike-days-2326-factpack.md`
in the worktree, gitignored; downloads in the session scratchpad).
- Generalitat, Ordre EMT/ /2026 of 16 Nov (e-Tauler API, edict 659191): "La situació de vaga presentada pel sindicat SEMAF a
  l'empresa Grupo Renfe, que està prevista per al dia 23 de novembre, de 0.01 a 23.59 hores, i que afecta tot el col·lectiu de
  maquinistes"; ACTIU, not amended, withdrawn 15 Dec. Treball's list: newest entry still that order (17/11/2026).
- Ministry of Transport rail list (answered 200 today): newest still the resolution of 12 Nov for the 17th; "23 de noviembre": 0
  hits. Air list: newest the 17N ones and ELA Bizkaia; SAERCO/Groundforce/Outsmart to 30 Nov. Press room: newest 19-11-2026 (winter
  roads), nothing on the 23rd. **The rest of Renfe (Cercanías outside Catalonia, Media Distancia, AVE, Larga Distancia) stays
  "pendiente / por confirmar".** Basque Government list: no order for the 23rd (it set the 17th's Cercanías Bilbao/San Sebastián
  by order of 13 Nov).
- Renfe: no 23N notice (seven slug variants under grupo.renfe.com …/2026/11/ → "no existe"; press room, renfe.com and its Rodalies
  page are script pages with no strike text). Rodalies: no 23N notice on the alterations list (the unlisted 11_23_Vaga_23 page still
  links the 17N PDFs: not used).
- SEMAF nº 2026-36 (19 Nov): "Al mismo tiempo que permanece vigente la conflictividad, desde SEMAF estamos trabajando y negociando…
  Continuamos trabajando y negociando" (bad-weather protocol agreed; no call-off); nº 2026-35 (17 Nov): "afrontamos el 23 de
  noviembre como la próxima jornada de movilización"; nº 2026-37 (19 Nov) is about FGC elections.
- BOE 19 Nov, Orden INT/1239/2026 (BOE-A-2026-24259): Correos strike in Madrid 00:00 23 Nov – 24:00 27 Nov and in Cádiz, Córdoba,
  Huelva, Málaga and Sevilla to 24:00 25 Nov (Sindicato Libre de Correos y Telecomunicaciones); offices 1/2/3 staff per shift;
  delivery up to 50 % "del día 23 al 25 … coincidiendo con la admisión del voto por correo". Only strike order in that BOE; the
  20 Nov BOE was not out yet.
- 26 Nov: CGT Ensenyament (18 Nov): "El pròxim dijous 26 de novembre us convoquem a la vaga juntament amb l'Assemblea Educativa de
  Catalunya i els sindicats CNT, COS, Intersindical i USTEC"; its notice: "Tota Catalunya", "de les 00:00 hores i fins les 24:00",
  "exclusivament durant la jornada laboral de cada professional". USTEC·STEs (18 Nov): "El 26N hi ha convocada una vaga a
  l'educació". **No order for the 26th** on Treball's list or in the newest 100 e-Tauler edicts (17–19 Nov): "pendientes".
- Unchanged and re-read: SMU ("convocada del día 16 al 27 de noviembre", newest items 19 Nov, no call-off), Metges de Catalunya
  (newest 18 Nov, no call-off), CSIF Educación Madrid (stoppages "20, 24, 26 y 30 de noviembre", 9:00–11:00 and 17:00–19:00: none on
  the 23rd, one on the 26th), CCOO Madrid ("la huelga indefinida docente").
- `STRIKES_VERIFIED` / `STRIKES_SPAIN_VERIFIED` were already 2026-11-19 (the ~12:00 full re-read): unchanged.

**What changed.**
- New `strike-days-2326n.ts`: `/es/guias/huelga-23-noviembre/`, `/ca/guies/vaga-23-novembre/`, `/en/guides/spain-strike-23-november/`
  and `/es/guias/huelga-26-noviembre/`, `/ca/guies/vaga-26-novembre/`, `/en/guides/spain-strike-26-november/`, built like 19N/20N
  (single source of truth: SPAIN_STRIKES, SPAIN_OPEN_STRIKES, STRIKES). H1 "Huelga 23 de noviembre de 2026: Renfe y Rodalies
  (SEMAF), Correos y médicos", title "Huelga 23 de noviembre de 2026: Renfe, Rodalies y Correos" (ca "Vaga 23 de novembre de 2026:
  Renfe, Rodalies i Correus", en "Spain strike 23 November 2026: Renfe, Rodalies, Correos"); H1 "Huelga 26 de noviembre de 2026:
  educación en Cataluña, médicos y Madrid. ¿Hay clase?", title "Huelga 26 de noviembre de 2026: educación en Cataluña" (ca "Vaga 26
  de novembre de 2026: educació a Catalunya", en "Spain strike 26 November 2026: Catalonia schools, doctors"). Lead answers first
  with the minimum services (Rodalies 66 % 6:00–9:30 / 17:00–20:30, 33 % the rest; Ministry part and school order "aún no
  publicados el jueves 19…"); before / "Mañana" (22 and 25 Nov) / "Hoy" / past from `STRIKES_SPAIN_AS_OF`. 23N: table of trains
  (who sets what), SEMAF still on (2026-36 quoted), what to do. 26N: "¿Hay clase?" with the CGT notice's groups and a table of what
  runs in Catalonia. Both: every strike of the day with its section, Madrid, airports, Catalonia, "lo que no hay", 5 FAQs each.
  `MINISTRY_23N_PUBLISHED = false` and the 26N copy are pinned to the entries by a test: when the Ministry or Treball publishes,
  the test fails until the copy is rewritten.
- Links in (body only, no title or description touched): both hubs' "Día a día" line (`STRIKE_DAY_PAGES` now has 23 and 26 Nov;
  second paragraph on the Spain hub, under the answer on the Catalan hub); the Spain hub's Renfe 23N and Correos sections; the Renfe
  guide and the education guide get one line right under the answer (new `strike-day-links.ts`; anchors "Huelga de Renfe del 23 de
  noviembre en toda España: AVE, Cercanías y el resto del día", "Huelga 26 de noviembre de 2026: educación, médicos, Correos y
  Madrid", ca/en alike) until the day; the 19N/20N pages' closing list adds the 23N page. Day pages link back to the Spain and
  Catalan hubs, the Renfe / education guide and each other. Next-step boxes: the day page wins over the guide on its day
  (19/20/23/26 read from `STRIKE_DAY_PAGES`).
- Publish: groups `strikes` and `huelgas-espana` now also publish the two pages; new group `huelga-23-26n` (both on their own).
  `NEWS_CYCLE_ENTRY_KEYS`: `guide-strike-23-november-2026-spain`, `guide-strike-26-november-2026-spain`.

**Prediction.** 23N page ranks ≤ 5 for "huelga 23 noviembre 2026" and "huelga renfe 23 noviembre" (either it or the Renfe guide
in the top 3) by the 23rd, CTR ≥ 5 %; ca page ≤ 5 for "vaga rodalies 23 novembre". 26N page ≤ 5 for "huelga 26 noviembre 2026"
(baseline 6.9 on the education guide) and the site's combined clicks on the "26 noviembre / 26 novembre" family above the 13–19 Nov
week.

**Risk / revert rule.** The 26N page overlaps the education guide ("vaga 26 novembre" 567 at 5.1). If on 27 Nov the education guide
and the 26N page together get fewer clicks on that family than the guide alone did in 13–19 Nov (28 clicks on "vaga 26 novembre"),
drop the 26N line from the education guide and the 26N link from the Catalan hub's "Día a día" line (keep the page). Same rule for
the Renfe guide and "huelga renfe 23 noviembre" on 24 Nov.

**Review 2026-11-24** (`snapshot.py page huelga-23-noviembre 3`, `page vaga-23-novembre 3`, `page huelga-renfe-rodalies 3`) and
**2026-11-27** (`page huelga-26-noviembre 3`, `page vaga-26-novembre 3`, `page huelga-educacion 7`). After 1 Dec, decide noindex or
leave as records (as for 19N/20N).

**Tests.** `npx tsc --noEmit -p .` clean; `npm test` 2834/2834 pass at 23:48 CET (session scratchpad `strike-days-2326-test-2.log`;
the first run, `strike-days-2326-test.log`, had one failure: the huelgas-espana route regex in `tests/strikes-spain.test.ts`, now
widened to 19/20/23/26). New
`tests/strike-days-2326n.test.ts`; `tests/next-step.test.ts` (the 21 Nov case: the 23N day page now wins over the Renfe guide).
After the 00:05 timer moves `STRIKES_AS_OF` / `STRIKES_SPAIN_AS_OF` to 20 Nov, the as-of discipline guards (VERIFIED = AS_OF)
fail until the next re-read: expected.

**Go-live.** Deploy, then publish `strikes` and `huelgas-espana` (or `huelga-23-26n` alone, but the hubs and guides carry the new
links only with `strikes`). IndexNow prefixes `/es/guias/huelga-`, `/ca/guies/vaga-`, `/en/guides/spain-strike-`,
`/en/guides/renfe-rodalies-strike-november`, `/en/guides/catalonia-teachers-strike-november`,
`/en/guides/strike-barcelona-catalonia-today`, `/es/guias/huelgas-espana`, `/ca/guies/vagues-espanya`, `/en/guides/strikes-spain`.
Before the 23rd: re-read the Ministry's rail list and Renfe daily; when the resolution is out, update the 23N entries in both data
files, set `MINISTRY_23N_PUBLISHED`, rewrite the 23N copy, publish `strikes`.

**Outcome:** _pending_

## 2026-11-20 — Barcelona practical evergreen guides: parking rates dated to the 2026 ordinance, T-casual where-to-buy, three tourist-tax FAQs, every Sitges train, the hub links the tourist tax (body only; deploy, then groups `parking`, `transport`, `tourist-tax`, `coast-trips`, `barcelona-hub`) (review 2026-12-04 and 2026-12-18)

Owner goal: top 3 on many non-strike queries, traffic from many pages all year. Inventory: `snapshot.py gaps 14 400`,
`pages 14 600` and `page <url> 14` (7–20 Nov). Pages picked: the Barcelona/Catalonia practical guides with the most
impressions at positions 4–15.

**Windows checked (this log), and what that left.**
- Parking ES title 3 Nov (to 1 Dec; the 3 Nov description and lead open with the hours), CA title 6 Nov (to 4 Dec);
  transport EN/ES/CA titles 28–30 Oct (measure 27–30 Nov); tourist tax ca/es/en 30 Oct / 6 Nov (measure 30 Nov); Sitges title
  unchanged since 28 Oct. **No title, description, lead or H1 touched on any page.** Body changes only, as the owner allows:
  the 30 Nov / 1 Dec / 4 Dec title reads of these pages must use the baseline below and note this body change.
- **Metro hours (`hours`, ca/es/en) and the zoo (`zoo`) are the control of the 18 Nov position-loss entry ("the 14 Nov step
  pages left unchanged (metro hours, zoo, R4)"), reviewed 25 Nov and 2 Dec: that window is open, so both are untouched, body
  included, and no new links point at them.** Queue below.
- Not touched: `/en/guides/barcelona-weather-by-month/` and the town holiday pages (open windows), strikes files.

**Baseline (GSC 7–20 Nov, clicks / impressions / CTR / position).**

| URL | Baseline | Top queries (impr. at pos., 0 clicks unless noted) |
| --- | --- | --- |
| `/es/guias/aparcar-barcelona-zona-azul-verde/` | 27 / 8,060 / 0.3 % / 7.7 | zona verde trinitat vella 81 at 10.3; horario zona azul barcelona 69 at 10.5; zona azul barcelona horario 28 at 11.0; ~50 "zona verde sábado" variants at 8–10; hasta que hora es/se paga la zona azul 16 at 13–17 |
| `/ca/guies/aparcar-barcelona-zona-blava-verda/` | 20 / 2,073 / 1.0 % / 5.6 | preu zona blava barcelona 51 at 5.3 (on the ES URL); horari zona blava barcelona 27 at 7.8 (1 click); horari zona verda barcelona festius 8 at 7.1 |
| `/en/guides/parking-in-barcelona-blue-green-zones/` | 1 / 76 / 1.3 % / 7.2 | — |
| `/en/guides/barcelona-transport-passes/` | 20 / 3,394 / 0.6 % / 7.6 | t casual barcelona 124 at 8.9; t-casual barcelona 39 at 9.1; t casual card barcelona 21 at 7.8; barcelona metro tickets price 8 at 8.8 |
| `/es/guias/tarjetas-transporte-barcelona/` | 3 / 3,098 / 0.1 % / 8.7 | t casual 1 zona 87 at 2.3; t casual 40 at 15.4; t casual precio 38 at 8.2; la t casual se puede compartir 6 at 9.8 |
| `/ca/guies/targetes-transport-barcelona/` | 1 / 235 / 0.4 % / 9.9 | preu t casual 2026 8 at 7.4 (1 click) |
| `/en/guides/barcelona-catalonia-tourist-tax/` | 21 / 1,881 / 1.1 % / 8.1 | barcelona city tax 124 at 7.6 (2 clicks); city tax barcelona 90 at 11.2; barcelona tourist tax 38 at 17.9; how much is city tax in barcelona 19 at 4.7; what is city tax in barcelona 7 at 5.3; barcelona hotel city tax 12 at 5.8 |
| `/es/guias/tasa-turistica-barcelona-cataluna/` | 12 / 1,699 / 0.7 % / 8.3 | tasa turistica barcelona 108 at 11.7; cuanto es la tasa turistica en barcelona 40 at 9.6; tasa turistica cataluña 17 at 24.3 |
| `/ca/guies/taxa-turistica-barcelona-catalunya/` | 1 / 164 / 0.6 % / 6.5 | tasa turistica barcelona 16 at 11.0 |
| `/en/day-trips/sitges-from-barcelona-by-train/` | 3 / 624 / 0.5 % / 14.1 | barcelona to sitges 78 at 21.8; barcelona to sitges train 71 at 27.0; barcelona sitges trein 12 at 9.2; last train from barcelona to sitges 8 at 9.5 |
| `/es/escapadas/sitges-desde-barcelona-tren/` | 0 / 219 / 0 % / 26.2 | sitges barcelona tren, tren barcelona sitges, trenes a sitges 25 each at 23–29 |
| `/ca/escapades/sitges-des-de-barcelona-tren/` | 0 / 12 / 0 % / 8.2 | — |
| `/ca/guies/barcelona-guia-practica/` + ES | 0 / 24 / 0 % / 10.9 | — (EN hub: 0 impressions) |

**Verified on 20 Nov 2026 (curl + grep; downloads in their own scratchpad directories, parsed with `python3 -I`).**
- AREA: ES "tipos de plazas" azul/verde (every rate, hour, maximum unchanged); Zone 36 news ("632 new Green Area spaces in Zone
  36 and 136 spaces resulting from the overlap with Zone 20, all identified with green road markings", 231 AREA Motorcycle, 29
  AREA DUM, "09/11/2026: Activation"); delimitation page ("Actualmente AREA se divide en 36 zonas de residentes"; the green page
  still says 35, written before Zone 36).
- Ajuntament, Ordenança fiscal 3.12 (normativa/2026-11/3.12-taxa-estacionament-regulat-vehicles.pdf; BOPB 2-2-2026, CVE
  202610021075): "aprovada definitivament pel Plenari del Consell Municipal en data 30 de gener de 2026, començarà a regir a
  partir de la seva publicació al BOPB"; annex A base (Blava A 2,50 / B 2,25, Verda A 3,00 / B 2,75 €/h) + "per tipus de
  vehicle" (Eco +0,00, C +0,75, B +1,00, resta +1,25); A.2.1 "Per episodi de contaminació ... 2 euros/hora ... excepte en els
  'Eco' i els 'cero emisiones'", Monday to Friday from 7:00 the day after; annex E zero-emission 1,15–1,50 €/h; G rounding
  down to 5 cents. AREA's own page exempts only zero-emission cars: both printed. No general weekday-holiday rule anywhere:
  the FAQ says so.
- TMB "Prices in force from 15 January 2026" (every cell unchanged); ATM home "En vigor les tarifes de 2026", press room
  latest note 9 Nov 2026 (no 2027 fares; 2026 approved 19 Dec 2025); ATM T-casual page "Where can I buy a T-casual?" (app,
  self-service machines, official sales points, cardboard card +€1) and "you can still reach the airport by public transport
  using the Rodalies de Catalunya train network or by bus"; transportes.gob.es press room to 20 Nov: no 2027 RDL 17/2025
  extension.
- ATC "Quota tributària, tarifes i recàrrecs municipals": Barcelona, rest of Catalonia, special rate, the seven municipal
  surcharges and cruise rows unchanged; Barcelona's ordinance index still lists the 2-2-2026 Ordenança fiscal 2.2.
- Rodalies planner API (`/api/timetables`) for Tue 24, Sat 28, Sun 29 Nov, Sants/Passeig de Gràcia/França ↔ Sitges; R2 PDF
  "01/9/2026" for the last departures (23:36, 0:06 from Sants; 0:00 PdG; 23:49 França); fares page (4 zones 5,50 €; monthly
  20 € "fins al 31/12/2026"); planner prices (single 5,50, Bonotren 35,80, T-casual 34,70 €).

**What changed (body only).**
1. **Parking** ca/es/en (`barcelona-practical.ts`, group `parking`). New H2 "De dónde salen las tarifas de 2026 y desde cuándo
   rigen": ordinance 3.12, approved 30 Jan, BOPB 2 Feb 2026; base per zone + label supplement, read back out of the label tables
   (`rateParts()` throws if a supplement differs by zone); zero-emission range; rounding; the pollution-episode +2 €/h. Zone 36
   in the past tense, with the 136 overlap spaces, 29 DUM spaces and AREA's zone map; H2 "Zona verde de Trinitat Vella (zona
   36), en marcha desde el 9 de noviembre". 35 → 36 resident zones. Four FAQs in the query words: "¿Hasta qué hora se paga la
   zona azul?", "¿Se paga la zona verde los sábados?", "¿…en festivos?", "¿Por qué la zona azul cuesta 2 € más algunos días?".
   Sources: the 2026 ordinance PDF replaces the 2021 one; delimitation page and Zone 36 map added. Verified 20 Nov.
2. **Transport passes** ca/es/en (group `transport`). H2 "¿Dónde se compra la T-casual?" (ATM); the airport FAQ adds Rodalies
   and bus; ES/CA FAQ renamed "¿Se puede compartir la T-casual?"; zones paragraph adds Barcelona–Sitges = 3 zones (34,70 €) with
   a link to the Sitges guide; related list adds the tourist tax and Sitges. As-of sentence 13 → 20 Nov; `FARES_AS_OF` and the
   2026 table's `verifiedAt` 2026-11-20 (the 16 Dec / 15 Jan re-check guards stand).
3. **Tourist tax** ca/es/en (`tourist-tax/copy.ts`, `publish.ts`, `rates.ts`; group `tourist-tax`). Dates 13 → 20 Nov
   (`LAST_VERIFIED`, key facts, table notes). FAQs "What is the city tax in Barcelona?", "Is the city tax included in the hotel
   price?", "Is there a tourist tax in Sitges, Girona or Tarragona?" (ca/es equivalents), figures from the rate table. The
   closing line now links the transport passes, the airport guide and Sitges (it linked only two features).
4. **Sitges** ca/es/en (`coast-trips.ts`, group `coast-trips`; Tarragona republished unchanged, keeps 28 Oct). New table
   "Barcelona-Sants ↔ Sitges: every R2 Sud train" (7 rows: weekday vs weekend, both directions, the weekday morning extras
   back to Barcelona); FAQs "How do I get from Barcelona to Sitges?" and "What time is the first train…?"; a "staying the
   night" line linking the tourist tax (Sitges is not on the ATC surcharge list) and the transport passes; related adds
   transport. `SITGES_VERIFIED` 2026-11-20; table note dated to the 24/28/29 Nov planner reads.
5. **Barcelona hub** ca/es/en (group `barcelona-hub`). The tourist tax guide had no line: added under "Arriving" ("€6 to €12
   per person per night in Barcelona until 31 March 2027 …").

**Hypotheses.** (1) Parking ES: "horario zona azul barcelona" 10.5 → ≤ 8 and the "sábado"/"hasta qué hora" family into the
top 8, by matching FAQs; "zona verde trinitat vella" 10.3 → ≤ 7 with the dated Zone 36 section. (2) Transport EN/ES: "t casual
barcelona" 8.9 → ≤ 7 (where-to-buy answers the card/ticket intent). (3) Tourist tax EN: "city tax barcelona" 11.2 → ≤ 8 and
"what is city tax in barcelona" ≤ 4, with one click a week from the new FAQs; ES "tasa turistica barcelona" 11.7 → ≤ 9. (4)
Sitges EN: "barcelona to sitges train" 27.0 → ≤ 15 and "barcelona to sitges" 21.8 → ≤ 15; ES "tren barcelona sitges" 22.9
→ ≤ 15. It is wrong if none of the four moves by 18 Dec. Confounder: the core update of 13–14 Nov is still settling.

**Revert rule.** Any page that loses > 1.5 positions (14-day average) with no gain on its target queries at the 18 Dec read:
revert that page's new section (keep the date refreshes, which are facts).

**Review 2026-12-04 (14 days) and 2026-12-18 (28 days)**, counted from the publish day: `snapshot.py page aparcar-barcelona 14`,
`page transport-passes 14`, `page tarjetas-transporte 14`, `page tourist-tax 14`, `page tasa-turistica 14`, `page sitges 14`,
query × page for the baseline queries above.

**Queue (not done, dated).**
- **3 Dec, metro hours and zoo** (after the 2 Dec control review): re-read TMB's metro/NitBus hours and zoobarcelona.cat
  prices and hours, then body only: an "every line, first and last train" table on the metro page if TMB's line pages give it,
  and on the zoo page a dated price table (online vs door, children, Zoo + Aquarium) if the zoo lists one. Their FAQs already use
  the query words ("What time does the Barcelona metro close?", "How much is Barcelona Zoo?"), so position, not wording, is the
  gap. Titles stay in their own windows (metro EN to 4 Dec).
- **ZBE/LEZ** (ES 307 at 8.3, EN 370 at 7.9): 28 Oct window measured 28 Nov; its queries rank 10–60 (18 Nov entry). Next push
  after that read.

**Publish.** Deploy (the content is code), then groups `parking transport tourist-tax coast-trips barcelona-hub`. IndexNow
prefixes: `/ca/guies/aparcar-barcelona-zona-blava-verda/ /es/guias/aparcar-barcelona-zona-azul-verde/
/en/guides/parking-in-barcelona-blue-green-zones/ /ca/guies/targetes-transport-barcelona/ /es/guias/tarjetas-transporte-barcelona/
/en/guides/barcelona-transport-passes/ /ca/guies/taxa-turistica-barcelona-catalunya/ /es/guias/tasa-turistica-barcelona-cataluna/
/en/guides/barcelona-catalonia-tourist-tax/ /ca/escapades/sitges-des-de-barcelona-tren/ /es/escapadas/sitges-desde-barcelona-tren/
/en/day-trips/sitges-from-barcelona-by-train/ /ca/guies/barcelona-guia-practica/ /es/guias/barcelona-guia-practica/
/en/guides/barcelona-practical-guide/`.

**Tests.** New `tests/bcn-practical-20nov.test.ts` (ordinance date and decomposition, Zone 36 live, where-to-buy, the new FAQs,
links, the Sitges table, Tarragona keeps its date, the hub link); `tests/batch02.test.ts` verified-date pins for parking and
transport moved to 2026-11-20. `npx tsc --noEmit -p .` clean; eslint clean on the changed files; the covering tests
(batch02, transport-fares, tourist-tax, title-budget, home-tools, b2-sources-unique, article-photo, rodalies, carnival and the
new file) 157/157. `npm test` 2838/2844: the 6 failures are date guards outside this change (postal-vote `POSTAL_AS_OF`
2026-11-05; strike-days-1920n ×3 and strikes-hub / strikes-spain as-of 19 vs 20 Nov), not touched here.

## 20 Nov 2026 — December bridge cluster: one page per question, the Monday-7 table from the regional bulletins, the 7/8 December date pages hand the national question on, shops and school FAQs in the searched words (deploy; groups `puente-diciembre-espana`, `pont-desembre`, `calendario-escolar-espana`; `shops` and `school-calendar` not before 26 Nov)

**Brief.** Owner: top 3 on many non-strike queries. Cluster: the December bridge (5–8 Dec 2026), "¿es festivo el 7/8 de diciembre?",
shops on December Sundays and holidays, "¿cuándo empiezan las vacaciones de Navidad?". **No title, description or lead touched**:
every page here is inside a window (Catalan bridge 11 Nov retitle + 17 Nov lead + 18 Nov body, reviews 25 Nov / 1–2 Dec; Spain
bridge 12 Nov ES title; 7 Dec date title from the 6 Nov sweep, 8 Dec revert 16 Nov → review 30 Nov; shops 25 Nov review and the
18 Nov entry's "no sixth change inside its window"; CA school title revert 18 Nov → 25 Nov; Spain school leads 13 Nov → 20/27 Nov).
Body and links only.

**Baseline** (`snapshot.py page <url> 14`, 7–20 Nov 2026, 20 Nov partial; clicks / impressions / CTR / position):

| URL | 14 d | Named queries (impr. at pos., clicks) |
| --- | --- | --- |
| /es/guias/puente-diciembre-espana/ | 504 / 16,184 / 3.1 % / 7.6 (8.3–18 a day since 12 Nov) | festivos puente diciembre 530 at 10.6 (2); el 7 de diciembre es festivo 144 at 9.8 (1); 7 de diciembre es festivo 131 at 9.7 (0); el lunes 7 de diciembre es festivo 124 at 8.5 (0); 7 y 8 de diciembre es festivo 104 at 9.2 (2); festivo 7 de diciembre 89 at 8.1 (0); que comunidades pasan el 6 de diciembre al lunes 52 at 8.2 (3); donde es festivo el 7 de diciembre de 2026 733 at 6.6 (48) |
| /ca/guies/pont-desembre-espanya/ · /en/guides/december-holidays-spain/ | 8 / 223 / 3.6 % / 5.7 · 12 / 544 / 2.2 % / 3.6 | small |
| /es/guias/puente-diciembre-cataluna/ | 199 / 11,830 / 1.7 % / 6.2 | festivos puente diciembre 689 at 9.3 (2); puente de la purisima 2026 794 at 6.1 (0); puente de diciembre 2026 767 at 7.2 (10); puente de diciembre 246 at 9.1 (3) |
| /ca/guies/pont-desembre-catalunya/ · /en/guides/december-long-weekend-catalonia/ | 18 / 4,055 / 0.4 % / 6.7 · 0 / 122 / 4.3 | pont de la purissima 2026 1,120 at 6.4 (0) |
| /es/festivos/dia/7-diciembre-2026/ | 132 / 4,379 / 3.0 % / 4.9 | el 7 de diciembre es festivo en cataluña 132 at 2.1 (14); 7 de diciembre es festivo 131 at 7.4 (3); el 7 de diciembre es festivo 108 at 7.0 (0); lunes 7 de diciembre es festivo 98 at 6.0 (2) |
| /es/festivos/dia/8-diciembre-2026/ | 6 / 1,699 / 0.4 % / 7.2 | 8 de diciembre es festivo 265 at 8.0 (0); 8 diciembre festivo 189 at 9.0 (0); el 8 de diciembre es festivo 168 at 7.6 (0) |
| /ca/festius/dia/7-desembre-2026/ · 8-desembre · /en/holidays/day/7-december-2026/ · 8-december | 3 / 113 · 1 / 82 · 2 / 135 · 0 / 21 | small |
| /es/festivos/2027/ (hub + community + city pages) | 186 / 22,123 / 0.8 % / 9.5 | family; the new line is on the hub and community pages |
| /es/guias/tiendas-abiertas-festivos-cataluna/ | 159 / 15,072 / 1.1 % / 6.7 | cuando empiezan a abrir las tiendas los domingos 456 at 7.4 (0); cuando abren las tiendas los domingos 287 at 9.8 (0); domingos abiertos 2026 48 at 8.2 (0) |
| /ca/guies/botigues-obertes-festius-catalunya/ · /en/guides/shops-open-sundays-holidays-catalonia/ | 19 / 1,292 / 1.5 % / 6.4 · 8 / 431 / 1.9 % / 6.4 | |
| /es/guias/calendario-escolar-andalucia/ | 9 / 4,037 / 0.2 % / 8.3 | cuando dan las vacaciones de navidad 2026 218 at 6.7 (0); cuando son… 2026 145 at 7.8 (0); cuando empiezan… en los colegios 20 at 7.9 |
| /es/guias/calendario-escolar-madrid/ | 3 / 2,072 / 0.1 % / 10.3 | cuando empiezan las vacaciones de navidad 2026 175 at 7.7 (0); … en los colegios 50 at 8.6 (0) |
| /es/guias/calendario-escolar-comunidad-valenciana/ | 4 / 1,362 / 0.3 % / 8.9 | cuando empiezan… 2026 115 at 6.6 (0) |
| /es/guias/calendario-escolar-espana/ (hub) | 6 / 1,055 / 0.6 % / 10.0 | cuando empiezan las vacaciones de navidad 2026 47 at 6.4 (0) |
| /ca/guies/calendari-escolar-catalunya/ · /es/…-cataluna/ · /en/… | 13 / 2,841 / 0.5 % / 6.1 · 3 / 1,170 / 15.3 · 4 / 322 / 5.4 | vacances de nadal 26 at 7.0; quan comencen les vacances de nadal 17 at 4.5 |

**Cannibalisation, decided.** "festivos puente diciembre" sat on both bridge pages (9.3 Catalan, 10.6 Spain); the yes/no "7 de
diciembre es festivo" queries on the Spain page (8–10) and on the 7 Dec date page (6–7.4). Intent per page:
- **Spain page** owns the national questions: "festivos puente diciembre", "¿el (lunes) 7 de diciembre es festivo?", "7 y 8 de
  diciembre", "qué comunidades pasan el 6 al lunes", "dónde es festivo el 7".
- **Catalan bridge page** owns Catalonia ("puente de diciembre 2026 cataluña", "pont de la Puríssima"); the **7 Dec date page**
  owns "¿el 7 de diciembre es festivo en Cataluña / en <town>?" (43 towns + 2 nuclei); the **8 Dec date page** owns "¿el 8 de
  diciembre es festivo?" (national yes, plus what opens in Catalonia).
- Fixed by anchors and hand-offs, not by removing content: every internal anchor to the Catalan page now says "en Cataluña / a
  Catalunya / in Catalonia" (rail label `B2_TITLES.decemberBridge`, date-page guide label, work-calendar link); every anchor to
  the Spain page says "festivos del puente de diciembre … en cada comunidad"; each page links the one that owns the other question.

**What changed (ca/es/en everywhere).**
1. **Spain page** (`december-bridge-spain.ts`, group `puente-diciembre-espana`): the "6 de diciembre cae en domingo" H2 now asks
   "¿qué comunidades lo pasan al lunes?" (ca "quines comunitats el passen al dilluns?", en "which regions move it to Monday?")
   and is followed by a **table of the ten places with Monday 7 off and the 2026 calendar each published in its own bulletin**
   (`MONDAY_7_RULES`). FAQ +3 in the searched words: "¿Son festivos el 7 y el 8 de diciembre de 2026?", "¿Qué comunidades pasan
   el 6 de diciembre al lunes?", "¿Qué días son festivos en el puente de diciembre de 2026?" (ca/en equivalents). "Si vives en
   Cataluña" links the 7 Dec date page ("la lista de municipios de Cataluña con fiesta el 7 de diciembre") and the 8 Dec one
   ("qué abre el 8 de diciembre en Cataluña"). Sources +8 regional instruments; check date 6 → 20 Nov.
2. **Catalan bridge page** (`december-bridge.ts`, group `pont-desembre`): the 7 December section links the 7 Dec date page
   ("la lista de municipios donde el 7 de diciembre es fiesta local"); the two Spain links read "los festivos del puente de
   diciembre … comunidad por comunidad". Lead, title, description and the "¿No vives en Cataluña?" box are unchanged.
3. **7 and 8 December date pages** (`dates.ts`, `DatePage.tsx`, deploy): under the answer, "¿Y en el resto de España?" + the
   Spain page ("Dónde es festivo el lunes 7 de diciembre de 2026, comunidad por comunidad" / "Los festivos del puente de diciembre
   2026 en cada comunidad"), the same line the 2027 pages already carry. 8 December: a note under the answer, "Es fiesta nacional
   en toda España, que ninguna comunidad puede cambiar: la relación … la marca en las diecisiete comunidades autónomas y en Ceuta y
   Melilla", and where Monday 7 is a holiday. Answers (leads) and titles unchanged.
4. **Spain 2027 hub and community pages** (`DecemberBridgeLine.tsx` + `decemberBridgeLine()`, deploy; es + ca/en editions): one
   line "¿Y este diciembre?" with the community's own answer from the 2026 BOE rows (Monday 7 holiday or working day; Navarra's
   3 December; Catalonia links its own page), linking the Spain page. Returns nothing after 8 Dec 2026; static pages drop it at
   the next deploy or revalidation after that day.
5. **Spain school pages** (`school-spain/body.ts`, group `calendario-escolar-espana`; 18 communities + hub × 3): the "¿Hay clase
   el 7 de diciembre?" answers link the Spain bridge page; the first FAQ question now reads "¿Cuándo empiezan las vacaciones de
   Navidad 2026 en los colegios de <comunidad>?" (ca "a les escoles de …"). No date changed (13 Nov reading).
6. **Catalan school guide** (`school/publish.ts`, group `school-calendar`): the "¿Hay cole el lunes 7 de diciembre?" answer links
   the Catalan bridge page (2026-27 only).
7. **Shops** (`shops.ts`, group `shops`): FAQ +2 after the December Sundays one: "¿Qué domingos abren las tiendas en 2026?" and
   "¿Cuándo abren las tiendas los domingos en Cataluña?" (ca/en alike). Same dates as the page's 2026 calendar section.

**Facts read 20 Nov 2026** (curl + grep / pdftotext; skill verify-official-source):
- BOE-A-2025-21667 (txt.php): row "7 Lunes siguiente al Día de la Constitución Española" "**" in ten columns; "8 Inmaculada
  Concepción" "*" in all nineteen; legend "Fiesta Nacional no sustituible (*)"; doc.php "Referencias posteriores" empty.
  BOE-A-2026-21254: "1 Año Nuevo" "*" ×19, "6 Epifanía del Señor" "**" ×19.
- Regional 2026 calendars (the 7 December line of each is quoted in the `MONDAY_7_RULES` comment): Andalucía Decreto 101/2025
  (BOJA 93, 19.5.2025), Aragón Decreto 70/2025 (BOA 135, 16.7.2025), Asturias Decreto 35/2025 (BOPA 57, 24.3.2025; **no December
  line**: it only swaps San José/Santiago for 8 Sept, so the row says the day comes from the BOE list), Cantabria Orden
  IND/37/2025 (BOC 147, 1.8.2025), Castilla y León Decreto 9/2025 (BOCYL 103, 2.6.2025), Extremadura Decreto 40/2025 (DOE 94,
  19.5.2025), Madrid Decreto 75/2025 (BOCM 229, 25.9.2025), Murcia Resolución DG Trabajo (BORM 163, 17.7.2025), Melilla Acuerdo of
  19.9.2025 (BOME 6315, 3.10.2025). **La Rioja not read**: larioja.org answers 403 (Cloudflare challenge) to the server; its row
  cites the BOE list and the table note says so. A research subagent did the first pass; all nine were re-downloaded and grepped
  by hand the same day. Also read, not printed: Canarias Decreto 61/2025, Castilla-La Mancha Decreto 44/2025 and Galicia Decreto
  46/2025 swap the Monday / 6 December for 30 May, Corpus Christi and 24 June.
- Ordre EMT/77/2025 (DOGC 9421, 27.5.2025) art. 1 "4 de gener. 15 d'agost. 12 d'octubre. 29 de novembre. 6, 13, 20 i 27 de
  desembre." and art. 6 defaults "11 de gener i … 8 de desembre"; Resolució EMT/4342/2025 (DOGC 9551, 27.11.2025) Barcelona "4 i
  11 de gener. 15 d'agost. 12 d'octubre. 29 de novembre. 6, 8, 13, 20 i 27 de desembre." The DOGC 2027 municipal shop list was
  **not** re-read, so the page's "a 5 de noviembre" sentence is untouched.
- Jaén 2026-27 school calendar (13 Nov date guard, due today): juntadeandalucia.es searched again, still not published; stays
  "por confirmar".

**Prediction.** By the bridge: "festivos puente diciembre" settles on one URL (the Spain page) at ≤ 7 with CTR > 1 %, the
Catalan page's share of it below a third; the Spain page's yes/no 7 December queries reach ≤ 7; "que comunidades pasan el 6 de
diciembre al lunes" ≤ 5; "8 de diciembre es festivo" on the 8 Dec page gets its first clicks at ≤ 7. Shops: "cuando abren las
tiendas los domingos" from 9.8 to ≤ 7 within 10 days of the publish. School: "cuando empiezan las vacaciones de navidad en los
colegios" ≤ 7 on Madrid and Andalucía; the hub's share of the national query grows.

**Revert rule.** Revert a body/link item if its page loses > 1.5 positions mix-free (same queries, both windows) with no gain on
its target query. The anchor relabels and the date-page hand-offs stay unless the 7 Dec date page loses its "en cataluña"
queries (today 2.1–2.9).

**Confounders.** Core update (from 10 Nov, no completion notice); demand climbing steeply to 4–8 Dec (compare position and CTR at
equal query, not clicks); the 25 Nov bridge and shops reviews, the 30 Nov 8 Dec title review, the 26 Nov / 3 Dec answer-first
reviews; the sitewide strip line to the Spain page from 30 Nov.

**Review.** Bridge and date pages: **4 Dec** (14 days) and **8 Dec 2026** (the bridge): `snapshot.py page puente-diciembre 7`,
`page /es/festivos/dia/7-diciembre-2026/ 7`, `page /es/festivos/dia/8-diciembre-2026/ 7`, plus a query × page split for
"festivos puente diciembre" and the 7 December yes/no queries. School: **4 Dec** and **18 Dec**. Shops: **10 Dec** (14 days after
a 26 Nov publish).

**Go-live.** Deploy first (date pages, `DatePage.tsx`, Spain 2027 pages, guide labels; publish reads the deployed modules).
Then publish **`puente-diciembre-espana`**, **`pont-desembre`** (also republishes the work-calendar guide with the relabelled link)
and **`calendario-escolar-espana`**. **`shops` and `school-calendar` on or after 26 Nov**, once the 25 Nov shops and CA school
reviews have read their windows. IndexNow after the deploy and groups: `python scripts/indexnow-sitemap.py /es/guias/puente-diciembre-
/ca/guies/pont-desembre- /en/guides/december-holidays-spain/ /en/guides/december-long-weekend-catalonia/
/es/festivos/dia/7-diciembre-2026/ /es/festivos/dia/8-diciembre-2026/ /ca/festius/dia/7-desembre-2026/
/ca/festius/dia/8-desembre-2026/ /en/holidays/day/7-december-2026/ /en/holidays/day/8-december-2026/ /es/festivos/2027/
/ca/festius/2027/ /en/holidays/2027/ /es/guias/calendario-escolar- /ca/guies/calendari-escolar- /en/guides/spain-school-calendar/
/en/guides/andalusia-school-calendar/ /en/guides/madrid-school-calendar/ /en/guides/valencian-community-school-calendar/`; on
26 Nov add `/es/guias/tiendas-abiertas-festivos-cataluna/ /ca/guies/botigues-obertes-festius-catalunya/
/en/guides/shops-open-sundays-holidays-catalonia/ /en/guides/catalonia-school-calendar/`.

**Tests.** New `tests/december-cluster-20nov.test.ts` (date-page hand-offs, the 8 Dec national note, anchor wording, Catalan
page → 7 Dec date page, school guide → bridge, the two shops questions with the order's dates, the 2027-page line per community
and its end date). Updated: `december-bridge-spain.test.ts` (check date 20 Nov, regional hosts, the Monday-7 table: only the BOE's
ten, official links, La Rioja on the BOE list, Asturias "silent"; new FAQ questions; date pages published), `december-pages.test.ts`
(date pages published), `school-calendar-spain-i18n.test.ts` (bridge link allowed and required, "en los colegios" question).

## 2026-11-20 — Christmas fairs and seasonal events: Canyelles' programme, shuttle buses and parking before its weekend; the 13 Nov title test read; organisers' programmes on five more fair pages, same-weekend links, twelve towns' lights dates (deploy; then group `llums-nadal`) (review 2026-11-23, 2026-11-27, 2026-12-04)

**Why.** The fair pages sit at position 8–11 with almost no clicks on the date queries, and the sub-queries Google now
shows for them are "cómo llegar", "cómo llegar y aparcar", "horarios exactos", "como llegar desde barcelona". The
pages gave the dates and the Rodalies stations; local media and the councils give hours, programme, buses and parking.

### 1. Canyelles (`/ca/fires-de-nadal/canyelles/`, `/es/mercados-navidad/canyelles/`; no English page: Canyelles is not in `EN_TOWNS`)

**Baseline (GSC, `snapshot.py page <path> 14`, 7–20 Nov; the last two days partial).**

| Page | 7–13 Nov (old title) | 14–20 Nov (dated title) | 14 d |
| --- | --- | --- | --- |
| `/es/mercados-navidad/canyelles/` | 27 / 1,347 / 2.0 % / 8.2 | 11 / 971 / 1.1 % / 8.2 | 38 / 2,318 / 1.6 % / 8.2 |
| `/ca/fires-de-nadal/canyelles/` | 2 / 307 / 0.7 % / 8.9 | 8 / 413 / 1.9 % / 8.0 | 10 / 720 / 1.4 % / 8.4 |

Queries (14 d): fira santa llucia canyelles 2026 630 / 0 / 10.4 (ES) and 112 / 0 / 9.7 (CA); fira canyelles 2026 67 / 0
/ 10.0; feria canyelles 2026 64 / 2 / 6.7; santa llucia canyelles 2026 62 / 0 / 7.1; fira de santa llucia canyelles 2026
54 / 0 / 9.5 (ES) and 103 / 0 / 9.4 (CA); fira de nadal canyelles 2026 60 / 0 / 9.3 (CA); fira santa llúcia canyelles
como llegar 11 / 0 / 7.4.

**The 13 Nov title test, day-7 read (due today).** ES: 2.0 % → 1.1 % at the same position (8.2); CA: 0.7 % → 1.9 % at
8.9 → 8.0. Against the 28-day baseline the ES page is below (1.9 %) but at a worse position (7.9 → 8.2), so the revert
rule ("below baseline at the same or better position") does not fire; CA beats it. **Decision: titles kept** (the fair
is tomorrow; the dated title is the answer to the query). Canyelles' test is closed; Espinelves' reads again on 27 Nov.

**Data checked (20 Nov 2026, curl with a browser user agent; every linked file opened; quotes and file list in
`christmas-fairs/organisers.ts`, `CANYELLES_DETAILS`).** Ajuntament de Canyelles: the fair page ("La 24a edició de la Fira
de Santa Llúcia se celebra el 21 i 22 de novembre de 2026"; agenda "Dis. 21 Nov, 2026 (9:00 - 21:00)", "Diu. 22 Nov,
2026 (9:00 - 21:00)"), the news of 16 Nov (more than 350 stalls; new: a mapping on the castle front and a magic games
area), the presentation of 11 Nov (brought forward a week because of the 29 Nov general election; La Petita Santa
Llúcia 28–29 Nov; parking areas and the free shuttle), the carols news (17 h, Santa Magdalena), the programme leaflet
(PDF), the map and the two bus timetables (PNG). The fair's web app, linked from the council's page: "Aparcaments
gratuïts", the same shuttle times, advance tickets (entradium.com) for Park Noël, the Castell dels Contes Màgics and the
Patge Reial Vibó only; no price anywhere, and no page says entry is free, so the page says neither.

**What changed.**
- Fair card: hours "dissabte i diumenge, de 9 a 21 h"; read date 20 Nov.
- New section "Programa i horaris 2026" (es "Programa y horarios", en "Programme and times"): why the dates differ from
  the calendar (the election), the day-by-day programme (opening 9 h, welcome and the Ambaixador del Nadal at 12 h,
  piromusical 20 h on Saturday; tions and drawing prizes 11.30 h on Sunday; carols 17 h and live music both days; the
  children's spaces 9–20 h), what is new, tickets, La Petita Santa Llúcia, and the seven official files.
- "Com arribar-hi" becomes "Com arribar a la fira: bus llançadora gratuït i aparcament" and opens with the two free
  shuttle lines (Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès, every two hours 9–19 h; Sitges – Sant Pere
  de Ribes – Canyelles, 10, 13, 16 h, back 13.30, 16.30, 21 h), the train from Barcelona to the shuttle stops (R2 Sud to
  Vilanova, R4 to Vilafranca: repo Rodalies snapshot), free parking around the old town (castle, school, C-15z),
  accessible parking (Av. del Raval, C-15z) and the urban minibus. The station/Mou-te paragraph follows.
- Lead: `LEAD_HOLDS` drops Canyelles (its review is done), so the first sentence gives the days ("Fira de Santa Llúcia
  de Canyelles 2026: dissabte 21 i diumenge 22 de novembre, Nucli i casc antic."). Espinelves' hold is renewed to 27 Nov.
- Description (ca/es; outside any window since today's review): "Fira de Santa Llúcia de Canyelles: 21 i 22 de novembre
  de 2026. De 9 a 21 h, amb bus llançadora gratuït des de Vilanova, Vilafranca i Sitges." (es "…De 9 a 21 h, con bus
  lanzadera gratis desde Vilanova, Vilafranca y Sitges."). Was "…(Nucli i casc antic). Dates oficials, com arribar-hi i
  què obre aquells dies." Title unchanged.
- Event JSON-LD: `startDate` 2026-11-21T09:00:00+01:00, `endDate` 2026-11-22T21:00:00+01:00, `organizer` Ajuntament de
  Canyelles (its fair page), `description`; `eventStatus` stays EventScheduled (Google's EventRescheduled means "to a
  later date"; this one moved earlier). No `image`: there is no licensed photo of the fair (owner photo needed).

**Prediction.** The ES page's clicks on 21–22 Nov exceed its 14–15 Nov (0 clicks on 522 impressions) at equal position,
and "como llegar" / "aparcar" sub-queries get clicks. **Review 2026-11-23** (`snapshot.py page /mercados-navidad/canyelles/
3`, the fair weekend) and **2026-12-04** (14 days; demand ends with the fair, so this read is for the 2027 template).

**Go-live (Canyelles, ship before Saturday 21 Nov).** Town pages are static code routes: deploy only, no publish group.
IndexNow prefixes `/ca/fires-de-nadal/canyelles/ /es/mercados-navidad/canyelles/`. The hubs' "revisat el" date moves to
20 Nov with the same deploy (data date, not a copy change).

### 2. Reads due in this cluster, and pages re-read with nothing new

**Christmas lights, the 12 Nov retitle (day-7 read, due 19 Nov; `snapshot.py page <path> 14`, 13–19 Nov vs the 5–11 Nov
baseline).** CA 3.1 % at 6.7 (was 1.9 % at 6.3); ES 0.8 % at 7.3 (1.4 % at 7.0); EN 1.5 % at 7.5 (2.2 % at 7.0). ES and EN
lost CTR but also position, so the 12 Nov rule ("CTR falls at equal or better position") does not fire; CA doubled. **Titles
kept.** 14 d (7–20 Nov): CA 24 / 1,209 / 2.0 % / 6.8, ES 37 / 2,884 / 1.3 % / 7.1, EN 7 / 390 / 1.8 % / 7.3. Queries: encesa
de llums barcelona 2026 152 / 1 / 7.7, encesa llums nadal barcelona 2026 109 / 0 / 9.8, encendido luces barcelona 2026 94 / 0
/ 9.5, encendido luces navidad hospitalet 2026 34 / 4 / 7.9.

**La Marató** (`/ca/guies/la-marato-tv3-3cat/`, 14 d 17 / 2,108 / 0.8 % / 6.8; "marató tv3 2026 data" 280 / 0 / 7.3, "marato
tv3 2026" 76 / 1 / 9.2; title window 18 Nov → reads 25 Nov and 2 Dec). Re-read 20 Nov with curl: the 2026 hub (13 December,
35th edition, 271.9 M€ since 1992, unchanged) and the volunteering site ("Tancat el període de preinscripcions", no direct
registration announced). Nothing new to print: no change.

**Gran Recapte** (ES 40 / 2,647 / 1.5 % / 6.3, CA 35 / 1,784 / 2.0 % / 6.5; "gran recapte 2026" 231 / 2 / 8.4 ES and 128 / 1 /
10.4 CA; title window to 2 Dec). Re-read 20 Nov: granrecapte.org home and 2026 page (no results), acatbal.org/el-gran-recapte/
(its counters are still headed "Dades del 2025"; online donations "fins a mitjans de desembre"). No
2026 figures published: no change; `GRAN_RECAPTE_RESULTS_RECHECK_BY` (30 Nov) stands.

### 3. Every fair town page: "the same weekend" links; the hub links the programmes (ca/es/en)

- New list on each town page, above "Altres fires de Nadal a prop": "Altres fires de Nadal el mateix cap de setmana" (es "Otras
  ferias de Navidad el mismo fin de semana", en "Other Christmas markets the same weekend"; towns whose fairs span several weekends:
  "…els mateixos caps de setmana i festius"). Other towns' fairs open on one of this town's Saturdays, Sundays or Catalonia-wide
  holidays (`outingDays`, closed days excluded), first shared day first, short fairs before the month-long markets, then same
  comarca, same province, larger town; one per town, at most 8 (English: English towns only). Towns in that list leave the
  "a prop" list, so no link appears twice. Examples: Canyelles → Barcelona (Sagrada Família opens 21 Nov); Cardedeu → Sant Pere
  de Vilamajor, Manresa, Valls, Banyoles, Tàrrega…; Arbúcies → Olot, Sant Feliu de Guíxols, Ripoll, Sant Celoni, Caldes…
- Hub, "Totes les fires, per data": a fair whose organiser programme was read gets "· programa i com arribar-hi" linking to its
  town page's `#com-arribar` (today Canyelles; the others below as they get `details`).
- Not on Espinelves: `BODY_HOLDS` (organisers.ts) keeps its body as it was until its 27 Nov title read (see 4).
- No title, description or lead changes from this item.

### 4. Organisers' programmes on the most-searched fair pages (body only; titles, descriptions and leads untouched)

Each read on 20 Nov 2026 with curl (browser user agent) on the organiser's own pages, programme PDFs rendered to images where
the text layer is garbled; quotes and file lists in `christmas-fairs/organisers.ts` above each `*_DETAILS`. Same blocks as
Canyelles ("Programa i horaris 2026", what is new, tickets, official files; "Com arribar-hi" opens with the organiser's own
access lines when it gives any). No snippet line: these towns' descriptions and leads are in the 16 Nov lead test, so the
programme read date is not counted in the lead's "revisat el" (`lastChecked`), which stays 13 Nov.

| Page (14 d, 7–20 Nov: clicks / impr. / CTR / pos) | Source | Added |
| --- | --- | --- |
| Barcelona `/es/mercados-navidad/barcelona/` 3 / 364 / 0.8 % / 8.8; `/ca/fires-de-nadal/barcelona/` 0 / 65 / 7.7 (both shown from 16 Nov). "fira santa llucia barcelona 2026" 90 / 1 / 10.1 on the ES markets guide and 35 / 0 / 10.0 here | firadesantallucia.cat (now "© … 2026"): home, calendari, activitats ("Programació provisional a 2 de novembre"), noticies, com_arribar; Guia BCN (Sagrada Família) | Santa Llúcia: 211 stalls (181 Christmas, 30 crafts), daily 10–21 h, 240 years since 1786, the new star on the 14 m tree, the giant tió's days and hours, the Diada on 12 Dec; metro L1/L3/L4 stops, buses 17, 19, 40, 45, 120, Bicing, the two car parks. Sagrada Família: 70+ stalls, daily 10–21 h, the new Firetaventura Solidària. Event: times 10:00–21:00 (+01:00); Santa Llúcia's organiser and URL = the Associació's site. Title and description still held on Santa Llúcia by `SNIPPET_HOLDS` (to 1 Dec) |
| Cardedeu CA 2 / 506 / 0.4 % / 8.2, ES 4 / 252 / 1.6 % / 7.3; "fira nadal cardedeu 2026" 159 / 0 / 9.2, "fira de nadal cardedeu 2026" 140 / 1 / 8.7 | firadenadal.cat (http only) `programa.pdf` (16 Nov) and `llibret.pdf` (12 Nov) | Fire lit at Sant Hilari on 8 Dec; inauguration Fri 11 at 19.30 h; Sat/Sun from 10 h, gospel, xocolatada, escudella, sardanes, tió, magic, closing 20.30 h; torró demos 4 € (6 € for two), chocolate talk 3 € (4 €); nativity scene to 5 Jan. **Conflict printed:** Friday opening 19 h (home page, booklet) vs 18 h (programme) |
| Arbúcies ES 5 / 304 / 1.6 % / 6.9 (CA no impressions); "fira del tio arbucies 2026" 128 / 0 / 8.6 | Programme leaflet linked by visitarbucies.com as "Programa de la Fira del Tió 2026" (PDF, 18 Nov); 2026 stallholder rules | Sat 10–19 h, Sun 10–18 h (rules: stalls close Sun 15 h, "pot variar": both printed); giant nativity scene from Fri 4, 19.30 h; "Anem a buscar el tió!" 11 h (5 € / 25 € with tió, QR booking); concerts; lights switch-on Correllums Sat 18.15 h; gimcana; parking marked on the map, no price |
| Caldes de Montbui ES 24 / 602 / 4.0 % / 6.0, CA 9 / 292 / 3.1 % / 5.9; "fira nadal caldes de montbui 2026" 126 / 4 / 8.0 | visiteucaldes.cat `PROGRAMA_MERCAT_NADAL_2026.pdf` (30 Oct) and "Com arribar" | Opening Fri 4 at 18 h with the free first caldo and the devils, the market's 40th year; 5–8 Dec 10–20 h; caldo / lentils / carn d'olla times and prices (1 €, 1 €, 2 €, cup 1 €); sardanes, tió, workshops, rain plan; Sagalés e9, 202, 203 from Barcelona |
| Espinelves ES 12 / 2,481 / 0.5 % / 8.7, CA 5 / 875 / 0.6 % / 9.3 (positions 10 → 13–30 on the espinelves queries from 16 Nov) | firadelavet.cat ("ORGANITZA: Ajuntament d'Espinelves"), map 2026 | **Written but held** (`BODY_HOLDS`, to 27 Nov, "body unchanged" in the 13 Nov entry): hours (Saturdays, holidays and Mon 7 Dec 10–20 h, weekdays 10–18 h), opening 28 Nov 16.30 h (Avet d'Or to Eudald Carbonell), concert 29 Nov, Cursa de l'Avet 8 Dec, street bands 11/13/17 h, children's programme, the 45-years exhibition, parking areas and the toll barrier on the map (no price published) |

**Espinelves, for the owner.** The 13 Nov title test has lost its basis: since 16 Nov both Espinelves pages fell from ~9.7 to
13–30 on every espinelves query (ES 288 and 232 impressions on 14–15 Nov, 1–12 a day since; no other URL of ours took them), so a 27 Nov CTR read "at
equal position" is not possible. The fair opens on 28 Nov. Recommendation: close the test now, delete the one `BODY_HOLDS`
line and the `LEAD_HOLDS` line for 17063 (the tests say exactly that), deploy; then the dated lead, the programme and the
same-weekend links go live before the opening. Left held here because the entry says "body unchanged" and that is the
owner's call.

**Prediction.** By 4 Dec, at equal position, the town queries with "como llegar", "horario", "programa" start taking clicks on
the five pages, and "fira santa llucia barcelona 2026" moves to the Barcelona fair page (title already names it).
**Review 2026-12-04** (`snapshot.py page /mercados-navidad/<town>/ 14` and `page /fires-de-nadal/<town>/ 14`); Cardedeu and
Arbúcies also the Monday after their fair (7 and 14 Dec).

### 5. Christmas lights page: eight more towns dated, Barcelona's 26 Nov closures and metro (ca/es/en; group `llums-nadal`)

The 12 Nov entry's pre-registered re-read ("around 18–20 Nov … fill `y2026`, move `LIGHTS_TOWNS_AS_OF`, deploy and publish
`llums-nadal`"). Titles kept after the read in 2; the description and lead list the dated towns by design, so they now name
twelve instead of four ("Ja tenen data Badalona, Castelldefels i més").

- **Towns (each council's own page, the date sentence grepped, 20 Nov 2026):** Girona 27 Nov, plaça de Catalunya (council
  traffic notice; no time for the act); Olot 28 Nov, plaça Major, 18:30 (lights 19 h); Granollers 27 Nov 18:30, plaça de la
  Porxada (note of 17 Nov); L'Hospitalet 26 Nov 18 h, plaça de l'Ajuntament (council flyer on lh-on.cat, linked from l-h.cat's
  home page, so `hosts` accepts lh-on.cat and the row cites both); El Prat 21 Nov 18:30, plaça de Catalunya; Mataró 27 Nov
  18:30, Espai Firal del Nou Parc Central; Manresa 27 Nov 17:30, Plaça de Nadal; Castelldefels Sat 21 Nov 18 h, plaça de
  l'Església. No 2026 date yet: Figueres, Blanes, Vic, Sant Cugat, Tarragona, Tortosa, Lleida, Sitges, Cornellà, Vilanova (read
  with its invalid certificate accepted). Not readable: Sabadell (404 on its Christmas pages), Reus (Cloudflare), Santa Coloma
  (403): `LIGHTS_TOWNS_NOT_REREAD` keeps 12 Nov, 12 Nov and 4 Nov; the table note now lists them in one shorter clause (the
  400-character note limit). `LIGHTS_TOWNS_AS_OF` 20 Nov.
- **Barcelona:** City Council press note of 20 Nov 2026, "Afectacions a la mobilitat per l'acte d'encesa de llums de Nadal del
  proper dijous, 26 de novembre" (`MOBILITY_2026`): new paragraph "Com arribar-hi el dijous 26" (whole Passeig de Gràcia closed
  Diagonal–Gran Via from 14 h, cross streets too except Diagonal, Aragó, Diputació, Gran Via; metro entrances in the area closed
  from 17 h, the council suggests Catalunya (L1, L3), Fontana (L3) or Verdaguer (L4, L5); buses 22, 24, 7, V15, Nitbus and Bus
  Turístic diverted 23–27 Nov). The note puts the act "entre el carrer de Provença i l'avinguda Diagonal"; the 9 Nov note's
  stage "entre Rosselló i Diagonal" stays in the lead (the stage is inside that stretch). Still nobody named who switches them
  on. `LIGHTS_SWITCH_ON_CHECKED` 20 Nov. A test fails from 27 Nov: the paragraph must go or turn past tense.
- Tests: `tests/christmas-lights-2026.test.ts` (twelve towns, the note, the date guard), `tests/christmas-lights.test.ts` (check
  date; the "2025 day printed as 2026" guard now skips a day that is also an official 2026 date, e.g. 27 Nov is L'Hospitalet
  2025 and Girona 2026).

**Prediction.** By 27 Nov the town queries land ("encendido luces navidad hospitalet 2026" 34 / 4 / 7.9 already; El Prat,
Girona, Granollers, Mataró), and "encesa llums nadal barcelona 2026" (109 / 0 / 9.8) gets clicks with the closures and metro
answer. **Review 2026-11-27** (`snapshot.py page encesa-llums 7`, `page encendido-luces 7`, `page barcelona-christmas-lights 7`)
and **2026-12-04** (14 d).

### Go-live (items 3–5) and tests

- **Deploy** (town pages, hub and Event markup are code routes), then **publish group `llums-nadal`** (the lights page is a
  published article). No other group: the markets guide, Christmas in Barcelona, Barcelona in December, La Marató and Gran
  Recapte are not changed.
- **IndexNow prefixes:** `/ca/fires-de-nadal/canyelles/ /es/mercados-navidad/canyelles/ /ca/fires-de-nadal/barcelona/
  /es/mercados-navidad/barcelona/ /en/christmas-markets/barcelona/ /ca/fires-de-nadal/cardedeu/ /es/mercados-navidad/cardedeu/
  /ca/fires-de-nadal/arbucies/ /es/mercados-navidad/arbucies/ /ca/fires-de-nadal/caldes-de-montbui/
  /es/mercados-navidad/caldes-de-montbui/ /ca/guies/encesa-llums-nadal-barcelona/ /es/guias/encendido-luces-navidad-barcelona/
  /en/guides/barcelona-christmas-lights/` (every other town page only gains the same-weekend list: let the sitemap carry them).
- **Date guards added:** `BODY_HOLDS` (fails from 28 Nov), `LEAD_HOLDS` Espinelves renewed to 27 Nov (fails from 28 Nov), the
  lights mobility paragraph (fails from 27 Nov).
- **Owner only:** a licensed photo of the Canyelles fair (its Event has no `image`); the Espinelves decision above.

**Outcome:** _pending_

## 2026-11-20 — Espinelves hold closed early (body + lead now ship; title kept)

The 13 Nov title test on `/ca/fires-de-nadal/espinelves/` and `/es/mercados-navidad/espinelves/` ("…2026: 28 nov. – 8 des./dic.", body and description unchanged) can't be read any more: from 16 Nov the espinelves queries moved from ~9 to 13–30 and impressions fell from 300–600/day (7–15 Nov) to 3–58/day (16–20 Nov) (`snapshot.py page espinelves 14`). ES 12 / 2,481 / 0.5 % / 8.7, CA 5 / 875 / 0.6 % / 9.3 (GSC 7–20 Nov), against the 13 Nov baselines of 15 / 1,852 / 0.8 % / 8.2 (ES) and 6 / 1,127 / 0.5 % / 8.8 (CA). The fair opens on 28 Nov, so waiting for the 27 Nov read would leave one day of demand. `BODY_HOLDS` (organisers.ts) and `LEAD_HOLDS` (copy.ts) are emptied, so the organiser's programme, the same-weekend links and the dated lead (written 20 Nov, see the fairs entry above) go out with this deploy. The dated title stays: it is the answer to "fira espinelves 2026". **Review 27 Nov and 4 Dec** (`snapshot.py page espinelves 7`): if positions haven't come back to ≤ 10, look at the SERP for what wins and rework the page. IndexNow `/ca/fires-de-nadal/espinelves/ /es/mercados-navidad/espinelves/`.

## 2026-11-20 — Postal vote: "closed" copy on (requests ended 19 Nov) and hand-in deadline moved to Thursday 26 Nov, 14:00 (JEC Acuerdo 418/2026), ca + es + en (deploy, then group `vot-correu`) (review 2026-11-26 with the elections review, then 2026-11-30)

**Why.** `POSTAL_AS_OF` was still 2026-11-05, so the guide kept telling people to apply "fins al dijous 19 de novembre" after the
deadline. Re-reading the sources today found a real change: the Junta Electoral Central extended the hand-in deadline by one day.

**Sources re-read 20 Nov 2026** (curl; quotes in the original, full list in the header comment of `postal-vote.ts`):
- JEC Acuerdo 418/2026, session of 19 Nov (expediente 320/518): "esta Junta acuerda ampliar el plazo de depósito del voto por
  correo hasta el 26 de noviembre de 2026, para todos los electores que se encuentren en España y en los horarios habituales de
  apertura de las oficinas de Correos, y como máximo hasta las 14:00 horas". It changes nothing else: "no procede adoptar en este
  momento ninguna otra medida adicional".
- Correos: "hasta el 26 de noviembre de 2026 a las 14:00h"; the request was "hasta el día 19 de noviembre de 2026".
- Interior (29N postal page): "(Ampliado hasta el día 26 de noviembre de 2026 por Acuerdo JEC 418/2026, de 19 de noviembre)".
- INE cid=1700: residents and ERTA "antes de las 14 horas del día 26 de noviembre"; papers still sent 9–22 Nov; CERA voters who
  are in Spain still "no más tarde del día 25 de noviembre" to the provincial board (the page prints that, the stricter reading);
  the 900 343 232 line runs "de lunes a viernes, no festivos, de 9:00 a 14:00 horas".
- Orden INT/1239/2026 (BOE-A-2026-24259, 19 Nov): Correos strike in Madrid 23–27 Nov and in Cádiz, Córdoba, Huelva, Málaga and
  Sevilla 23–25 Nov; post offices open "en el horario habitual" to accept postal votes and hand out the voting papers.
- LOREG arts. 72–73 (consolidated text, last update 02/07/2026) and the JEC calendar PDF (5 Oct): unchanged.

**Baseline** (GSC, 14–20 Nov, 20 Nov partial; clicks / impressions / CTR / position):
- `/ca/guies/vot-per-correu/`: 11 / 1,613 / 0.7 % / 7.5. Queries: "fins quan es pot demanar el vot per correu" 36 at 8.5, "fins
  quin dia es pot votar per correu" 25 at 8.6, "fins quan es pot votar per correu" 22 at 9.0, "fins quin dia es pot demanar el vot
  per correu" 14 at 8.1, "termini vot per correu" 9 at 8.6, "fins quan puc votar per correu" 8 at 8.4.
- `/es/guias/voto-por-correo/`: 2 / 318 / 0.6 % / 9.1 (most impressions come from "cuándo son las elecciones en Cataluña" queries).
- `/en/guides/postal-vote-spain/`: 2 / 36 / 5.6 % / 6.4.

**What changed** (`src/lib/content/batch02/postal-vote.ts`, ca/es/en):
- `POSTAL_AS_OF` 2026-11-20: the "closed" copy shows. Its title, description, lead, first step and deadline FAQ were written on
  5 Nov for this switch (5 Nov entry); the only edits to them are the facts: hand-in "dimecres 25" → "dijous 26 de novembre, com a
  molt a les 14 h" (es "jueves 26 … como máximo a las 14 h", en "Thursday 26 November, 14:00 at the latest") and "ja no pots /
  ya no puedes votar en persona" in the second person.
  - CA title "Vot per correu 29N: lliura'l fins al 26 de novembre"; ES "Voto por correo 29N: entrégalo hasta el 26 de noviembre";
    EN "Postal vote, Spain 29 Nov election: hand it in by 26 Nov". Descriptions start with "requests closed on 19 Nov" and give
    "Thursday 26, 14:00 (extended)".
- `POSTAL_29N.deliverBy` 2026-11-26 (new `deliverByLaw` 2026-11-25 keeps the LOREG day). The sitewide strip's
  `postal-vote-deliver` line reads it: "Voto por correo: se entrega en Correos hasta el jueves 26 de noviembre", shown to the end of
  the 26th (`news-alerts.ts` itself not touched; it reaches static pages at the next deploy).
- Body: the hand-in step, list item, calendar row, FAQ "Fins quan puc enviar el vot per correu?" and the ERTA line say 26 Nov,
  14:00, with the JEC agreement linked; CERA in Spain: 25 Nov to the provincial board (INE). Closed copy only: a line on the Correos
  strike in Madrid and Andalusia with Orden INT/1239/2026, and a second FAQ "No m'han arribat les paperetes: què faig?" (Correos
  notice → collect at the office, INE tracking, 900 343 232 weekdays 9–14 h, no in-person vote once accepted). The INE phone hours
  are also in the "if they do not arrive" item. Check dates move to 20 Nov; JEC agreement and BOE order join the sources.
- "Open" copy left as it was live (never renders again for 29N). Tests: `tests/postal-vote.test.ts` (26 Nov Thursday, law day
  25 Nov, 14:00 allowed as a clock time, new closed-copy test) and `tests/news-alerts.test.ts` (strip window and text).

**Prediction.** CA guide CTR from 0.7 % to ≥ 2 % at similar position on 20–26 Nov: the snippet now answers both "fins quan es pot
demanar" (closed on the 19th) and "fins quan es pot votar per correu" (26th, 14:00), which no other result says with the hour.

**Review 2026-11-26** (with the elections review: `snapshot.py page vot-per-correu 7`, `page voto-por-correo 7`, `page
postal-vote 7`). No revert rule for titles (the phase switch is scheduled). **2026-11-30:** `tests/postal-vote.test.ts` fails until
`POSTAL_AS_OF` moves past polling day (copy "over").

**Go-live.** Deploy (the strip line and the page code), then publish `vot-correu`. IndexNow prefixes `/ca/guies/vot-per-correu`,
`/es/guias/voto-por-correo`, `/en/guides/postal-vote-spain`.

## 2026-11-20 — Calendario laboral 2027, Spain cities: Cantabria's list (BOC núm. 224) and the Comunitat Valenciana's three provincial lists (BOP Alicante, Castellón, Valencia) are in, Parla and Fuenlabrada from their Pleno minutes, the four other lists re-read; pending pages answer "¿cuáles son los festivos locales de <ciudad> en 2027?" (deploy; group `calendario-2027-espana`)

**Why.** GSC 7–20 Nov (`snapshot.py gaps 14 400`, `page /es/festivos/2027/ 14`, `pages 14 3000`): every city query of the family
sits at 8.5–11, page one but not top 3 — "festivos vigo 2027" 136 at 10.8, "calendario laboral torrelavega 2027" 122 at 8.6,
"calendario laboral marbella 2027" 103 at 8.9, "festivos alcobendas 2027" 92 at 9.4, "calendario laboral alcobendas 2027" 80 at
8.9, "calendario laboral gandia 2027" 59 at 8.8, "calendario laboral benidorm 2027" 58 at 9.3, "festivos parla 2027" 54 at 9.1,
"festivos marbella 2027" 54 at 9.3, "festivos locales alcobendas 2027" 50 at 9.2, "festivos alcorcón 2027" 47 at 10.1. People
want the city's two local days, which local media print the day the bulletin does. ES city-page impressions by community (14 d):
Andalucía 4,406, Madrid 3,853, Comunitat Valenciana 2,674, Canarias 1,955, Galicia 1,211, Cantabria 307.

**Facts read 20 Nov (official sources only; fact pack `research_notes/spain-2027-local-lists-2026-11-20.md`; every URL with curl, 200).**
1. **Cantabria, out today**: BOC núm. 224, de 20.11.2026, CVE-2026-9104, "Resolución por la que se dispone la publicación del
   calendario de fiestas nacionales, autonómicas y locales … para el año 2027" (boc.cantabria.es `verAnuncioAction.do?idAnuBlob=443286`).
   Its 12 national + regional days match the BOE column day by day. Torrelavega «SAN ROQUE 16 AGOSTO / SAN CIPRIANO 16 SEPTIEMBRE»;
   Santander «VIRGEN DEL MAR 17 MAYO / SANTOS MÁRTIRES EMETERIO Y CELEDONIO 30 AGOSTO»; Castro-Urdiales 24 Jun and 30 Nov; Camargo
   24 Jun and 16 Jul; Piélagos 16 Jul and 8 Sep.
2. **Comunitat Valenciana, out in the provincial bulletins, not the DOGV** (the 18 Nov reading searched only the DOGV, where the 2026
   list was): each Dirección Territorial de Vivienda, Empleo, Juventud e Igualdad approved its province's 2027 calendar and ordered
   it published "en el Boletín Oficial de la Provincia" — BOP de Alicante nº 210, de 4.11.2026 (edicto 8352); BOP de Castellón núm.
   136, de 10.11.2026 (04772-2026); BOP de Valencia núm. 224, de 20.11.2026 (2026/14547: the 19 Nov issue, núm. 223, omitted the
   annex). The Generalitat's labour page (habitatge.gva.es/es/web/dg-trabajo/calendario-laboral, "Calendario laboral 2027") lists
   the three with its own copies, which the pages cite (as Castilla y León's cite the Junta's copies). All 68 towns with a page
   transcribed and cross-checked by script against the parsed annexes: 0 differences. E.g. Gandia «5 de abril, Sant Vicent Ferrer;
   4 de octubre, Sant Francesc de Borja-Fira de Gandia»; Benidorm «15 y 16 de noviembre»; Paterna 5 Apr and 30 Aug; San Vicente del
   Raspeig 5–6 Apr; Orihuela 17 Jul and 8 Sep; Elda 8–9 Sep; Alcoy 24 and 26 Apr; Valencia 22 Jan and 5 Apr. The 10 towns that had a
   page from their council's minutes (18 Nov) get exactly the council's days. Dénia: the BOP gives the EATIM of La Xara and Jesús
   Pobre their own days (zoned row). Not yet re-checked on the BOP portals themselves.
3. **Madrid, council minutes** (rule of `cities-council.ts`: the Pleno's own minutes on the council's site, both dates and the vote;
   never press, news posts or agendas). Parla: acta del Pleno ordinario de 8.10.2026, punto 2, p. 7, unanimidad — «FIESTAS DEL AGUA:
   … lunes 14 de junio. FIESTAS PATRONALES: … lunes 13 de septiembre.» (sede.ayuntamientoparla.es). Fuenlabrada: acta del Pleno
   de 1.10.2026, punto 4º, pp. 38-39, unanimidad (26) — «el martes 9 de marzo y el martes 14 de septiembre» (plenos.ayto-fuenlabrada.es).
   Printed "aprobadas por el Ayuntamiento, pendientes del BOCM"; .ics, widget and working-days calculator leave them out. **Not
   enough, still pending**: Madrid city (the Pleno's "Acuerdos" of 29.9.2026 give 15 May and 9 Nov but no vote), San Sebastián de
   los Reyes (unsigned minutes behind a browser check), Pozuelo (signed extract, not minutes), Torrejón (Junta de Gobierno), Las Rozas
   (video-acta machine transcript); Alcobendas, Alcorcón, Pinto (council sites block or time out), Valdemoro, Tres Cantos, Coslada,
   Rivas, Aranjuez, Collado Villalba (agenda or "aprobada" only, no dates online).
4. **Still pending** — every issue since 18 Nov through today's, by each bulletin's own summary, searched for "fiestas locales /
   laborales / carácter local / calendario de fiestas" (each 2026 list found by the same search on its day): BOCM núm. 279, BOA núm.
   225 (past its 20 Nov 2025 precedent), DOCM núm. 223, BON núm. 232, all of 20.11.2026; DOGV núm. 10498 has nothing either.
5. **Re-read**: Vigo, DOG núm. 204 «57. Vigo: 29 de marzo, 16 de agosto.»; Marbella, BOJA núm. 210 «MARBELLA 11 DE JUNIO 19 DE
   OCTUBRE» (rows `readOn` 20 Nov); the 11 council minutes on pages (all 200, both dates) → `COUNCIL_READ_ON` 20 Nov.

**What changed.**
1. Data (`sources.ts`, `cities-data.ts`, `cities-more.ts`, `cities-council.ts`): Cantabria `local` → published (BOC 224); the
   Comunitat Valenciana `local` → published with three `parts` (bulletin link → the Generalitat's labour page; `how` and `note`
   rewritten in es/ca/en: "for 2027 not in the DOGV but in each province's bulletin"). 17 core cities pending → published (Santander,
   Torrelavega, and the 15 Valencian ones); Parla, Fuenlabrada pending → "council" (new `councilCity`, same rule and labelling as the
   20,000+ towns). 20,000+ rows: + Castro-Urdiales, Camargo, Piélagos and 43 Valencian towns that were in `WAITING_TOWNS` (no page
   until today, as the file's own publication-day procedure says), + the 10 Valencian council towns moved to the bulletin
   (`LIST_READ_ON`). **46 new city pages × es/ca/en** (ca/en noindex by `spain-2027-ca`/`-en`). `PENDING_CHECKS`/`PENDING_READ_ON`
   → 20 Nov (four lists); `WAITING_RECHECK_BY` 25 → 27 Nov. Nothing taken from 2026 or from press.
2. **Titles, descriptions, leads and answer lines change by data, not by code**, on the 19 core pages whose status moved (as the
   18 Nov entry anticipated: a list coming out flips the page). E.g. Torrelavega "Calendario laboral Torrelavega 2027: festivos" →
   "Festivos locales Torrelavega 2027: 16 ago y 16 sep" (from 2 Dec "Festivos Torrelavega 2027: 16 ago y 16 sep": the 60-char limit
   drops "calendario laboral", the top query; H1 and description keep it — owner may want to look at it on 2 Dec); Benidorm →
   "Festivos locales Benidorm 2027: 15 y 16 de noviembre"; Gandia → "Festivos locales Gandia 2027: 5 de abril y 4 de octubre";
   Parla → "Festivos locales Parla 2027: 14 de junio y 13 de septiembre" with "(aprobadas por el Ayuntamiento)" in the description.
   No title/description/lead template touched.
3. Pending city pages (es/ca/en; 32 ES pages + 2 "missing"), body only: the first FAQ question is the searched one — "¿Cuáles son
   los festivos locales de Alcobendas en 2027?" / "Quins són els festius locals d'Alcobendas el 2027?" / "What are Alcobendas's
   local holidays in 2027?" — answered first: "Aún no son oficiales: el BOCM todavía no ha publicado la lista de 2027 (consultado
   hasta el BOCM núm. 279, de 20.11.2026). La de 2026 salió el 12 de diciembre de 2025 (BOCM núm. 296, de 12.12.2025). Cuando se
   publiquen, esta página dará las fechas con su fuente." (Navarra: 3 Dec known, the other pending; Burgos/Valladolid: the list
   leaves them out.) Replaces "¿Se conocen ya…? No. …". The local section's H2 names the city: "Fiestas locales de Alcobendas en
   2027: aún no publicadas" (ca/en alike). Answer line, lead, layers block, titles and descriptions of these pages untouched.
4. `low-demand.ts` `spain-2027-en` keep list (same bar as 18 Nov, city pages with their 2027 days): + Santander (12 impr. at 5.2),
   Benidorm (15 at 8.7, held on 18 Nov), Castellón de la Plana (12 at 11.8), Torrevieja (11 at 6.2).
5. Tests: new `tests/spain-2027-laboral-20nov.test.ts`; `spain-2027-laboral-18nov`, `spain-cities-2027`, `spain-cities-2027-more`,
   `spain-2027-council-towns`, `spain-holidays-2027` moved to the 20 Nov reading.

**Baseline (GSC 7–20 Nov, 14 d; 20 Nov partial), ES city pages** (impressions / clicks / position): Torrelavega 263 / 2 / 8.7;
Santander 44 / 0 / 22.6; Paterna 322 / 4 / 7.2; Benidorm 275 / 5 / 8.5; Gandia 273 / 8 / 8.1; Vila-real 256 / 11 / 6.7; Sagunto
247 / 3 / 6.9; San Vicente del Raspeig 242 / 3 / 8.1; Orihuela 212 / 4 / 8.1; Elda 169 / 2 / 8.0; Torrent 153 / 3 / 7.3; Alicante
136 / 1 / 17.3; Valencia 84 / 0 / 21.1; Parla 268 / 1 / 8.4; Fuenlabrada 37 / 1 / 12.7; Alcobendas 575 / 5 / 9.3; Alcorcón 348 / 1 /
18.6; Pinto 327 / 2 / 7.2; Valdemoro 317 / 4 / 7.6; Vigo 368 / 1 / 11.4; Marbella 372 / 1 / 8.6. Groups: the 15 Valencian core
pages 2,674 / 46 / 9.0; Cantabria's two 307 / 2 / 10.7; Parla + Fuenlabrada 305 / 2 / 8.9; still pending (29 with impressions)
4,071 / 53 / 10.3; already published before today (188) 11,490 / 63 / 8.9. EN Santander 12 / 0 / 5.2, EN Benidorm 15 / 0 / 8.7.

**Prediction.** By 4 Dec at equal query: the flipped pages' "festivos|calendario laboral <ciudad> 2027" queries (Torrelavega, Gandia,
Benidorm, Paterna, San Vicente, Orihuela, Elda, Parla) median position from ~8.6 to ≤ 5, at least three ≤ 3, CTR ≥ 3 %; Santander,
Alicante, Valencia, Elche pages (now 14–23) ≤ 10. Pending pages: "festivos locales <ciudad> 2027" queries ≥ 1 position better
than now (Alcobendas 50 at 9.2), from the FAQ and H2 alone.

**Review 2026-12-04** (14 days; the 2 Dec title switch falls inside, so read 20 Nov–1 Dec separately):
`snapshot.py page /es/festivos/2027/comunidad-valenciana/ 14`, `page /es/festivos/2027/cantabria/ 14`, `page /es/festivos/2027/madrid/ 14`,
`gaps 14 400 | grep 2027`. **Revert rule (FAQ question):** if pending pages lose ≥ 1 position on "festivos <ciudad> 2027" at equal
query while published ones hold, put back "¿Se conocen ya los festivos locales de 2027 de <ciudad>?".

**Confounders.** 13 Nov first-line change (read 20 Nov and 1 Dec); the 2 Dec title switch (`CITY_TITLES_FROM`); the four lists
still to come (BON ~2 Dec, BOCM/DOCM ~11–12 Dec, BOA any day); seasonal demand rising into December.

**Go-live.** Deploy (data is code; 46 new city routes × 3), then publish `calendario-2027-espana`. IndexNow prefixes
`/es/festivos/2027/`, `/ca/festius/2027/`, `/en/holidays/2027/`. Next re-read of the four lists by 27 Nov (`WAITING_RECHECK_BY`;
`STATUS_RECHECK_BY`, `CITIES_RECHECK_BY` also 27 Nov). When the BOCM list is out, Parla and Fuenlabrada go back to `published`.

**Tests.** `npx tsc --noEmit -p .` clean; the 19 holiday-family test files 234/234; `npm test` 2842/2848 — the 6 failures are
date guards outside this change that fired today (`postal-vote` POSTAL_AS_OF; `strike-days-1920n` ×3 incl. the strikes as-of
discipline, `strikes-hub`, `strikes-spain`), same 6 before this change.

**Outcome:** _pending_

## 2026-11-20 — 29N cluster, body only: how-to-vote and the strip say the postal hand-in moved to 26 Nov, 14:00; when the Parliament's term ends; election night answers "when is the election" and "where to see the results"; town pages say how to check the roll, ca + es + en (deploy, then groups `voting`, `election-night`) (review 2026-11-26 and 2026-12-02)

**Why.** Last week before the biggest traffic day of the month (29 Nov, target 30,000 sessions). Queries at positions 4–15 in
`snapshot.py gaps 14 400` and `page … 14` (7–20 Nov) where the page that should win does not say the answer in the searcher's
words. Titles, descriptions and leads of the election guides are inside the 11 and 16 Nov windows (review 26 Nov) and the town
pages inside the 3 Nov one: **none touched**; body only.

**Baseline** (GSC 7–20 Nov, 14 d, 20 Nov partial; clicks / impressions / CTR / position):
- `/en/guides/how-to-vote-catalonia/`: 139 / 7,162 / 1.9 % / 6.3. "2026 spain general election how to register to vote" 1,654 at
  5.6, "how to vote 2026 spain general election" 1,288 at 5.4, "2026 spain general election dates" 157 at 10.0 (0 clicks),
  "… polling stations" 95 at 6.2, "spain election date" 25 at 9.7.
- `/en/guides/spain-election-night-results/`: 113 / 4,457 / 2.5 % / 6.9. "election results" 315 at 8.9, "2026 spain general
  election results" 192 at 6.5 (0 clicks), and date queries landing here instead of on how-to-vote: "spain election" 71 at 10.3,
  "when is the spanish election" 65 at 9.6, "spain elections" 57 at 10.8, "when is spanish election" 52 at 9.3, "when is spain
  election" 27 at 10.7, "when is the election in spain" 27 at 9.8.
- `/es/guias/como-votar-elecciones-cataluna/`: 150 / 9,317 / 1.6 % / 6.7. "cuando son las elecciones en cataluña" 624 at 7.3
  (0.3 %), "elecciones catalunya cuando son" 302 at 8.2, "proximas elecciones cataluña" 302 at 7.0, "cuando son las elecciones
  catalanas" 65 at 7.8. `/ca/guies/com-votar-eleccions-catalunya/`: 42 / 1,823 / 2.3 % / 6.9 ("eleccions catalunya quan son" 35
  at 7.2).
- `/es/guias/noche-electoral-resultados-escrutinio/`: 15 / 475 / 3.2 % / 7.1; `/ca/guies/nit-electoral-resultats-escrutini/`:
  1 / 81 / 1.2 % / 9.0.
- Town families: `/es/elecciones/` 773 / 15,107 / 5.1 % / 5.7; `/ca/eleccions/` 585 / 16,134 / 3.6 % / 6.0. "censo electoral
  mataro" 33 at 5.9, "… badalona" 31 at 7.5, "… santa coloma de gramenet" 22 at 7.2 (0 clicks each), "mesa electoral 29n <town>"
  at 3–9.

**What changed** (each fact read on 20 Nov 2026 on the primary source; quotes in the modules' header comments):
1. `voting` (how-to-vote, `voting.ts`, body): the warning box under "Where do I vote?" now says requests closed on 19 Nov and the
   vote goes to Correos by Thursday 26 Nov, 14:00 at the latest (JEC Acuerdo 418/2026), linking the postal guide with "what to do
   if the papers have not arrived"; the postal paragraph, calendar row, "until when" and "key dates" FAQs, the ERTA line (INE:
   before 14:00 on 26 Nov) and the CERA-in-Spain lines say the same in the past tense. Correos and Interior source names re-dated,
   JEC 418/2026 added. **The three leads still say "hand it in by 25 November"** (true, conservative, inside the window).
2. `voting`, "next elections": the Parlament row and a new FAQ in query words ("¿Cuándo son las próximas elecciones catalanas al
   Parlament?", "Quan són les properes eleccions al Parlament de Catalunya?", "When is the next Catalan parliament election?"):
   none called; the term ends four years after the 12 May 2024 vote, on 12 May 2028, unless brought forward (Statute of Autonomy,
   art. 66: "La legislatura finaliza por expiración del mandato legal al cumplirse los cuatro años de la fecha de las
   elecciones"; BOE consolidated text, added to sources). Calendar H2 says "dates": "2026 Spain general election dates: the full
   calendar" / "Fechas de las elecciones generales del 29 de noviembre: el calendario completo" / "Dates de les eleccions generals
   del 29 de novembre: el calendari complet". The one hub link now reads "town's election page, with its polling places and past
   results" (all 947 towns carry their 29N polling places).
3. `election-night` (`election-night.ts`, body): H2 "Where to see the 2026 Spain general election results" / "Dónde ver los
   resultados de las elecciones generales del 29N" / "On veure els resultats de les eleccions generals del 29N"; two FAQs after
   the first: "Where can I see the 2026 Spain general election results?" (Interior's results site and app, link once
   `ELECTION_NIGHT_RESULTS_URL` is set; 29neleccionesgenerales.es home re-read 20 Nov: no results link) and "When is the Spanish
   general election?" (Sunday 29 Nov, 9:00–20:00, campaign, reflection day) with a descriptive link to how-to-vote ("2026 Spain
   general election dates and how to vote"), so the date queries have a path to the page that should win them.
4. Town pages (`model.ts`, all 947 × ca/es, 30 × en; deploy): the census section gets "How to check you are on the roll": with
   Cl@ve on the INE's roll lookup, without it at the town hall or 900 343 232; the certificación censal específica up to polling
   day (INE cid=1700, read 20 Nov).
5. Tests: `tests/election-cluster.test.ts` (four new), `tests/batch02.test.ts` (calendar expects "26 November, 14:00").

**Prediction** (7 d after the deploy vs the 7 d before, equal-query): EN night page's date queries either move to how-to-vote or
gain CTR; "2026 spain general election dates" ≤ 8 on how-to-vote; "cuando son las elecciones catalanas / en cataluña" CTR ≥ 1 %;
"censo electoral <town>" CTR > 0 on the 20 largest towns.

**Review 2026-11-26** with the elections review (`snapshot.py page how-to-vote-catalonia 7`, `page spain-election-night-results
7`, `page como-votar-elecciones-cataluna 7`) and **2026-12-02** (`page /elecciones/ 7`, `page /eleccions/ 7`). Revert rule: if the
EN night page loses ≥ 2 positions on "election results" / "2026 spain general election results" at equal impressions, drop the
"When is…" FAQ from it. Confounders: the 18 Nov EN section order and election-day layer, the 26 Nov title review, the news cycle.

**Go-live.** Deploy (town pages, strip), then publish `voting` and `election-night` (and `vot-correu`, entry above). IndexNow
prefixes `/ca/guies/com-votar-eleccions-catalunya`, `/es/guias/como-votar-elecciones-cataluna`, `/en/guides/how-to-vote-catalonia`,
`/ca/guies/nit-electoral-resultats-escrutini`, `/es/guias/noche-electoral-resultados-escrutinio`,
`/en/guides/spain-election-night-results`, `/ca/eleccions/`, `/es/elecciones/`, `/en/elections/`.

**Outcome:** _pending_

## 2026-11-20 — How-to-vote leads: postal hand-in 25 → 26 Nov, 14:00 (factual correction inside the window)

JEC Acuerdo 418/2026 (session of 19 Nov) extended the postal-vote deposit "hasta el 26 de noviembre de 2026 … y como máximo hasta las 14:00 horas" (re-read 20 Nov on juntaelectoralcentral.es). The three how-to-vote leads (`/ca/guies/com-votar-eleccions-catalunya/`, `/es/guias/como-votar-elecciones-cataluna/`, `/en/guides/how-to-vote-catalonia/`) still said "fins al 25 / hasta el 25 / by 25 November". A wrong deadline overrides the lead window: only that clause changes ("fins al 26 a les 14 h / hasta el 26 a las 14 h / by 26 November at 14:00"); title, description and the rest of the lead untouched. Read the open lead/title tests on these pages with this one-clause change noted. Publish group `voting`.
