# Editorial roadmap

What is published, what it is for, and when it needs looking at again.

**This is not a keyword list.** Topics arrive as editorial packages written
elsewhere; this file tracks what exists, what state it is in, and what the data
says about gaps. Nothing here is a commitment to publish.

Status: `live` · `needs-update` · `proposed` · `blocked`

---

## Published

| Cluster | Topic | Status | Type | Next review | URL (ca) |
| --- | --- | --- | --- | --- | --- |
| Nature | Mushroom conditions | live | **recurrent, weekly in season** | every Monday, Sep–Nov | `/ca/natura/bolets-catalunya-condicions/` |
| Nature | Autumn colour | live | seasonal | weekly, Oct–Nov | `/ca/natura/colors-tardor-catalunya/` |
| Agenda | What's on this weekend | live | **recurrent, weekly** | every Thursday | `/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/` |
| Agenda | Sitges Film Festival | live | annual | when the schedule is published; after 18 Oct 2026 | `/ca/agenda/festival-sitges-guia/` |
| Day trips | 12 trips by train | live | evergreen | Jan 2027, or when Rodalies lines change | `/ca/escapades/catalunya-sense-cotxe-tren/` |
| Day trips | Beyond Montserrat | live | evergreen | Jan 2027 | `/ca/escapades/escapades-barcelona-mes-enlla-montserrat/` |
| Culture | Lesser-known Gaudí | live | evergreen | when Finca Güell reopens | `/ca/cultura/gaudi-obres-menys-conegudes/` |
| Villages | 10 medieval villages | live | evergreen | Mar 2027 | `/ca/pobles/pobles-medievals-catalunya/` |
| Food | Autumn food fairs | live | seasonal | Sep 2027, dates re-verified | `/ca/gastronomia/fires-gastronomiques-tardor-catalunya/` |
| Traditions | The Castanyada | live | seasonal | Oct 2027 | `/ca/tradicions/castanyada-catalunya/` |
| Barcelona | Tourist traps | live | evergreen | Jan 2027 | `/ca/barcelona/barcelona-trampes-turistes-alternatives/` |
| Places | 15 surprising places | live | evergreen | Mar 2027 | `/ca/llocs/llocs-sorprenents-catalunya/` |
| Plans | Rainy-day plans | live | evergreen | Nov 2026, before the wet season | `/ca/plans/que-fer-catalunya-quan-plou/` |
| Practical | **Public holiday calendar** | live 24 Sep 2026 | utility + **recurrent annual** | When the local-holiday dataset is published, or the 2028 order appears | `/ca/guies/calendari-laboral-catalunya/` |

All fourteen exist in ca, es and en.

### The one that matters most

The **mushroom report is 48% of all clicks**. It is not the best-written piece
here; it is the one that is updated. That is the lesson worth generalising: a
page that carries a dated, sourced figure and gets refreshed beats a better
article that sits still.

---

## Planned — batch of 2026-09-24

Ten topics, prioritised. **Status for all ten: `planned`.** Nothing is written,
no URL exists, no placeholder is published, and none of these appears in the
sitemap. The architecture is prepared; the editorial packages arrive separately.

| # | Topic | Cluster | Type | Season | Languages | Status |
| --- | --- | --- | --- | --- | --- | --- |
| ~~P01~~ | ~~Catalan public holiday calendar~~ | Practical | utility + **recurrent annual** | — | ca/es/en | **published 24 Sep 2026** |
| ~~P02~~ | ~~Tourist tax in Barcelona and Catalonia~~ | Barcelona practical | utility + commercial | Evergreen; re-verify when rates change | ca/es/en | **published 25 Sep 2026** |
| P03 | Barcelona airport to the centre: metro, train, Aerobús or taxi | Barcelona practical | evergreen + commercial | Evergreen | ca/es/en (**EN lead**) | planned |
| P04 | The Ripollès: what to see, villages, routes | Destinations | **destination hub** | Evergreen, peaks autumn/winter | ca/es/en | planned |
| P05 | T-casual, T-dia or Hola Barcelona: which card is cheaper | Barcelona practical | utility + commercial | Evergreen; re-verify at each fare change | ca/es/en (**EN/ES lead**) | planned |
| P06 | Setcases in a day | Destinations | destination | Evergreen, peaks winter | ca/es/en | planned |
| P07 | Barcelona LEZ: which vehicles may enter, and foreign plates | Barcelona practical | practical + commercial | Evergreen, **high regulatory churn** | ca/es/en (**EN lead**) | planned |
| P08 | Christmas markets in Catalonia | Traditions | seasonal + **recurrent annual** | Oct–Dec, updated weekly in season | ca/es/en | planned |
| P09 | Cerdanya without a car | Day trips | evergreen destination/practical | Evergreen | ca/es/en | planned |
| P10 | Snow in Catalonia: resort conditions this week | Nature | **recurrent seasonal** | Dec–Mar | ca/es/en | planned |

### Cannibalisation check

Run against Search Console, 28 days to 24 September 2026, query × page. Three
real conflicts, one of them serious.

#### Serious: P04 and P06 collide with the mushroom report

The weekly mushroom report **already holds the Ripollès toponyms**, at the top:

| Query | Page currently ranking | Position |
| --- | --- | --- |
| `ripolles` / `ripollès` | `/en/nature/mushroom-season-catalonia/` | **1** |
| `setcases` | `/es/naturaleza/setas-cataluna-condiciones/` | **2** |
| `set cases` | `/es/naturaleza/setas-cataluna-condiciones/` | 4 |
| `mollo` | `/en/nature/mushroom-season-catalonia/` | 2 |
| `castellar den hug` | `/en/nature/mushroom-season-catalonia/` | 7 |
| `la quar` / `quar` | `/ca/natura/bolets-catalunya-condicions/` | 1–2 |
| `bolets vall d'en bas` | `/ca/natura/bolets-catalunya-condicions/` | 30 |

This is not a reason to drop P04 and P06 — it is the reason they were proposed.
But two pages competing for `setcases` is worse than one, and the incumbent is
the best-performing page on the site.

**How to avoid it.** Keep the intents disjoint and make the relationship
explicit:

- The mushroom report answers *"where are conditions good right now"*. It
  mentions places as **zones**, never as destinations. It must not grow a
  "what to see in Setcases" section.
- P06 answers *"what do I do in Setcases for a day"*. It must not carry a
  mushroom-conditions table.
- P04 is a **hub**: it links out to P06, to future village pages, and to the
  mushroom report for the seasonal question. Hubs are the right home for a
  toponym; a weekly conditions report is not.
- Cross-link both ways at publication, and re-check position for `setcases`
  and `ripollès` 28 days after P06 goes live. If the mushroom page loses
  position without P06 gaining it, the intents are not disjoint enough.

#### Moderate: P09 overlaps the existing car-free guide

`/ca/escapades/catalunya-sense-cotxe-tren/` already owns the "without a car"
framing across three languages, and `riu de cerdanya` currently ranks on the
English mushroom page at position 3.

P09 is narrower — one region, and about what is genuinely reachable rather than
a list of twelve trips — so it should win on specificity. Requirement: P09 must
not restate the twelve destinations, and the car-free guide should link to it
as the Cerdanya deep-dive rather than absorbing it.

#### Moderate: P03 and P05 will both describe Barcelona fares

Both need to mention metro and Aerobús prices. Split by the question asked:

- **P03** answers *"how do I get from the airport to my hotel"* — a journey
  decision, compared by terminal, destination, party size and hour.
- **P05** answers *"which ticket should I buy for my stay"* — a purchase
  decision, compared by number of journeys.

P03 should state the airport fare and link to P05 for the wider comparison.
P05 should cover the airport case in one line and link to P03.

#### Minor: P08 and the weekly agenda

`/{locale}/agenda/…this-weekend/` lists whatever is on, and in December that
includes Christmas markets. No structural conflict — one is a weekly listing,
the other a seasonal hub — provided the agenda links to P08 rather than
reproducing the market list.

#### No conflict

P01, P02, P07 and P10 have no existing page and no query currently ranking
against them.

### Notes carried from the brief

- **P01, P08, P10** keep one URL across years. No `-2027` slugs.
- **P07** has the highest regulatory churn on this list. `last_verified_at`
  and `review_due_at` are mandatory, and the page should state the date the
  rules were checked in the body, not only in the furniture.
- **P10** publishes nothing until official seasonal sources are available.
  Snow depths and lift openings are exactly the kind of figure that must never
  be inferred.
- **P08** has four Christmas-market illustrations already supplied and
  currently unused, held back in a previous batch because they did not match
  the articles they were named for. They belong here.

---

## Gaps the data points at

From Search Console, 10–24 September 2026. These are queries where the site
already appears without having a page for them — not guesses.

| Signal | Evidence | Note |
| --- | --- | --- |
| `mapa bolets catalunya 2026` | pos 4.4, 8 impr, 1 click | Ranks on the report, which has no map |
| `predicció bolets catalunya` | pos 20, 10 impr, 0 clicks | Same page, different intent |
| `bolets vall d'en bas` | pos 30, 3 impr | Place-level mushroom intent |
| Toponyms: Ripollès, la Quar, Molló, Castellar de n'Hug, Cerdanya, Vall d'Aran | pos 1–7, 1 impr each | No destination pages exist |
| `sitges film festival 2026 schedule / programme / tickets` | ~45 impr, pos 7–10 | Page exists; title fixed 24 Sep, see `SEO_EXPERIMENTS.md` |
| `catalunya informacio` | 51 impr, pos 11.5, **0 clicks** | Home page. Intent unclear — probably news |

### Empty sections

- **Routes** — no content, no route entries. The data model supports distance,
  duration, elevation, difficulty, start point and official source; none of it
  may be invented.
- **News** — empty by choice. Version 1 was rejected for auto-generated news.
  Any return here has to be genuinely useful and genuinely edited.
- **Destinations** — three articles claim the hub by category, but there is no
  destination *page* for any place. The toponym signals above suggest this is
  where the next real growth is.

---

## Mix, as a guardrail

Roughly: 30% recurrent/seasonal, 30% commercial-intent travel, 20% evergreen,
10% practical high-value, 10% current affairs.

These are not targets to hit. They exist to stop the site drifting back into a
news aggregator, which is what got version 1 rejected.

---

## Blocked

| Item | Blocked on |
| --- | --- |
| Any commercial activity (ads, affiliate, sponsorship) | Publisher legal identity — see `LEGAL_PAGES.md` |
| Personalised ads to EEA/UK readers | A Google-certified CMP with IAB TCF |
| Routes hub | First real route package, with verified geodata |
| Author pages | Real author identities |

---

## Demand the mushroom report is already surfacing and not serving

Recorded 29 September 2026, from the per-page query report for
`/ca/natura/bolets-catalunya-condicions/` and `/es/naturaleza/setas-cataluna-condiciones/`.

That report is the best-performing page on the site: 90 of the site's 179
clicks across ca and es, position 3.8 in Spanish. It wins the generic terms and
loses the specific ones — and the specific ones are where the roadmap's next
work should come from, because the demand is measured rather than guessed.

| Query | Position | Note |
| --- | --- | --- |
| `bolets vall d'en bas` | 30.3 | Comarca-level, we barely rank |
| `predicció bolets catalunya` | 16.4 | Our own subject, page 2 |
| `quants dies després de ploure surten els bolets` | 59 | A real question, unanswered on the page |
| `mapa bolets catalunya 2026` | 7.1 | A map is asked for by name |
| `on trobar bolets aquesta setmana` | 6.2 | Same page, weaker than the generic term |

Two conclusions, and neither is "write ten more articles":

1. **Question-shaped queries have no home.** "How many days after rain do
   mushrooms appear" is a genuine question with a genuine answer, and the page
   does not answer it in a form Google can lift. An FAQ section on the existing
   report costs one payload edit.
2. **Comarca-level demand is real and unserved.** `vall d'en bas`, `berguedà`.
   The report already models seven condition zones; the gap is that no URL
   addresses a comarca by name.

Both build on a page that already has authority, which is a different and
cheaper proposition than starting a new topic from zero.

**Not started. No URLs, no placeholders.** Recorded so the next package can be
chosen from evidence.

---

## Growth sprint 01 — prepared, not published (29 September 2026)

Architecture built so an editorial package can be dropped in. **No URLs were
created, no placeholders exist, and every registry below ships empty.**

| Item | Status | What exists in code | What is missing |
| --- | --- | --- | --- |
| Mushroom zone pilot — Vall d'en Bas | `prepared` | `src/lib/content/mushroom-zones/` — types, publish-time guard, empty registry, publisher wired to `?only=mushroom-zones` | The editorial package |
| Conditions by comarca | `prepared` | `conditionsMap` block, renderer, closed level vocabulary, no coordinate field | Verified Meteocat data per comarca |
| Barcelona transport cards | `prepared` | `src/lib/content/transport-cards/types.ts` — ticket, validity, fare and profile model, empty registry | ATM fares, verified |
| Barcelona airport → city centre | `planned` | — | The editorial package |
| Christmas markets in Catalonia | `planned` | — | Confirmed dates from each organiser |
| Snow and ski conditions | `planned` | — | Official station data source |

### Vall d'en Bas: why this one, and why only this one

`bolets vall d'en bas` sits at position 30.3 with its own impressions, and
`bergueda`, `setcases`, `ripolles` and `riu de cerdanya` all surface against
the master report. The master is a Catalonia-wide page: it appears for those
queries and answers none of them.

**One pilot, measured 14 to 28 days before a second zone exists.** The
registry is an array, so adding six comarques at once would cost nothing and
would be the wrong thing to do — six thin pages competing with the page that
currently earns 45% of the site's clicks. Scale only on evidence: the pilot
must earn impressions, queries of its own, and a position, and the master must
not lose ground.

A zone page is not the master with a place name substituted in. The master
answers *"what are conditions like in Catalonia"*; a zone page answers *"what
is the situation here and what do I need to know before going"* — local
weather record, habitat, municipal rules, safety, access.

### What the guard refuses to publish

In `mushroom-zones/guard.ts`, enforced at publish time, throwing rather than
warning:

- **Coordinates in any notation** — decimal pairs, degrees-minutes, UTM-looking
  grid references, map pin links.
- **Any claim that mushrooms are present.** Rainfall is measured and may be
  published; fruiting is inferred and may not. "Conditions are favourable" is a
  statement about weather. "There are mushrooms" is a statement about a place
  nobody checked.
- **Promises** — *hi trobaràs*, *encontrarás*, *you will find*, *guaranteed*.
- **Picking directions and secret spots.**
- **A missing link back to the master**, a missing source, a non-https source,
  a missing verification date, or a year in the slug.

### Christmas markets — why it is on the roadmap in September

Seasonal content has to be indexed before the peak, and this site's own data
shows why: the holiday calendar was published on 24 September and took until
26 September to be indexed at all, on a resubmitted sitemap. A Christmas page
published in late November would reach the index after the traffic.

Perennial URL, no year in the slug, so the same page serves 2027. **No dates
are published until each organiser has confirmed them** — last year's dates
reprinted as this year's is the exact kind of error that costs a reader a trip.

### Snow — the winter equivalent of the mushroom report

The mushroom report works because it is recurrent, dated, and honest about
uncertainty. Snow conditions have the same shape and the same season boundary.

Model to build when the source is settled: station, open or closed, official
snow depth, slopes open, access roads, official webcam, source, `verified_at`.
**No figure published until an official source is identified** — a ski
station's own marketing depth is not a measurement.

---

## Editorial batch 02 — published 29 September 2026

Nine guides, 27 editions, nine Commons photographs. All URLs perennial.

| # | Article | CA / ES / EN | Cluster |
| --- | --- | --- | --- |
| 01 | Barcelona transport passes | ✓ | Barcelona Practical |
| 02 | Low-emission zone, foreign vehicles | ✓ | Barcelona Practical |
| 03 | Girona by train | ✓ | Day trips |
| 04 | Montserrat without a tour | ✓ | Day trips |
| 05 | Ripollès hub | ✓ | Destinations |
| 06 | Setcases | ✓ | Destinations |
| 07 | Cerdanya without a car | ✓ | Day trips |
| 08 | Street parking | ✓ | Barcelona Practical |
| 09 | **Christmas markets** | **deferred** | Seasonal |
| 10 | Snow without skiing | ✓ | Seasonal |

### What was verified, and what changed as a result

Every variable figure was re-checked against the operator before publishing.

| Figure | Package | Published | Source |
| --- | --- | --- | --- |
| T-casual, 1 zone | 13 € | 13 € | TMB fares page |
| T-dia, 1 zone | 12 € | 12 € | TMB fares page |
| T-usual, 1 zone | 22,80 € | 22,80 € | TMB fares page |
| ZBE verification | "up to 15 days" | **15 working days** | AMB registry FAQ |
| AREA blue, rate A | 1,25–3,75 €/h | Full five-label table | AREA (B:SM) |
| AREA green, rate A | 1,50–4,25 €/h | Full five-label table | AREA (B:SM) |
| FGC mountain destinations | Six, named | Confirmed | FGC / Pirineu365 |
| La Creueta walk | ~300 m, ~50 m gain | Confirmed | Ripollès Turisme |

Press coverage of January's fare rise reported 12,99 €, 11,95 € and 22,77 €.
Those were pre-approval projections; TMB publishes the round figures, and the
operator's own page wins.

### Four things deliberately not published

- **The Hola Barcelona fare.** TMB publishes the card's coverage but not its
  price on the fares page. The prices circulating are resellers'. The card
  appears in the comparison with what it includes and an explicit "not priced
  here".
- **The rack railway's "more than 600 m" height gain.** The line climbs from
  Monistrol de Montserrat to the monastery, which is nearer 540 m, and no
  operator page states 600.
- **Service frequencies for the rack railway and the cable car.** Neither
  operator publishes a fixed year-round headway; both vary by season.
- **Article 09, Christmas markets, in full.** See below.

### Why the Christmas markets article was deferred

The package's own rule for it is: *no market goes in until a date has been
published by an administration or a reliable organiser.* That rule could not be
satisfied on 29 September:

- The Diputació de Barcelona's local-fairs agenda runs to October 2026 and has
  no November or December entries yet.
- The Generalitat's 2026 fairs calendar does not expose those listings.
- Press results for those municipalities return **2025** dates.

Publishing the supplied table would have meant republishing last year's dates
as this year's, which is the precise error the article exists to avoid. The
component it needs — the `calendar` block, with dates, municipality, scope and
an ICS download — already exists, so this is now a payload and not a build.

**Re-check from mid-October**, weekly. The seasonal window still allows it: the
holiday calendar published on 24 September was indexed by the 26th.

### Internal linking map, as built

- **Barcelona Practical** — transport ⇄ ZBE ⇄ parking, all three cross-linked,
  plus the existing tourist tax and tourist-traps guides.
- **Day trips** — Girona ⇄ Montserrat ⇄ Cerdanya, each into the existing
  car-free rail guide.
- **Ripollès** — hub ⇄ Setcases, both into the mushroom report and the snow
  guide.
- **Seasonal** — snow ⇄ Cerdanya ⇄ Ripollès.

Audit after publishing: 0 broken, 0 orphans, 0 cross-language leaks.
