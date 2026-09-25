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
