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

**Outcome:** _pending_

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

**Outcome:** _pending_

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

**Outcome:** _pending_

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

## 2026-10-14 — Clock change: the date in the title

**Before.** "Canvi d'hora: quan és el pròxim i calendari fins al 2031". First day live:
171 impressions, 1 click, position 5.7, on queries like "canvi d'hora 2026", "quan es
canvia l'hora". The title promised the answer instead of giving it.

**Change.** All three titles name Sunday 25 October ("dormim una hora més" / "clocks go
back"). `tests/clock-change.test.ts` fails once that date passes, so the title is
rewritten to the March change and republished.

**Measure on 24 Oct** (the peak is the week of the change): CTR on the CA/ES page.

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
