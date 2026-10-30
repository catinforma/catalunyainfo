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
