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

**Outcome:** _pending_

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

**Outcome:** _pending_
