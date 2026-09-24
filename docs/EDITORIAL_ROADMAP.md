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

All thirteen exist in ca, es and en.

### The one that matters most

The **mushroom report is 48% of all clicks**. It is not the best-written piece
here; it is the one that is updated. That is the lesson worth generalising: a
page that carries a dated, sourced figure and gets refreshed beats a better
article that sits still.

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
