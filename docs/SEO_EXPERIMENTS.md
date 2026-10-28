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
