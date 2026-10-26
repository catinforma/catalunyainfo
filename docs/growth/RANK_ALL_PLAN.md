# Rankings push — every article (plan of 26 Oct 2026)

Goal: move every article towards position 1 for the queries it already gets, so clicks and CTR follow.

## What the data says (research_notes/rank-all/inventory.csv from `scripts/rank-inventory.py`, GSC 27 Sep–24 Oct)

- 189 article URLs (63 articles × ca/es/en) plus 21 legal pages (out of scope).
- 65 URLs have ≥100 impressions; 21 have none.
- **161 of 189 were edited between 23 and 25 Oct** (page-1 sprints). Their measurement windows end 20–21 Nov.
- Five experiments were read today (SEO_EXPERIMENTS.md, 26 Oct): **titles do not move CTR at positions 7–10; position does.** `donde hay setas ahora` at 1.4 converts at 22.6 %; pages at 7–10 convert at 0.3–3 %.

## Rules (from the repo and the seo-audit skill)

1. Re-editing a page inside 3–4 weeks of its last edit resets Google's evaluation and makes the result unreadable. Frozen titles stay frozen.
2. Every new fact needs an official source and a date (verify-official-source skill); nothing is invented.
3. The lever for pages at 5–30 is position: answer more of the query cluster than the top three, keep the page fresh, and link to it from pages that already rank.

## Phases

### A — now (26 Oct)
- **A1 · Read the due experiments.** Done: five outcomes recorded, lesson logged.
- **A2 · Review every article.** Seven read-only agents, one per cluster, apply the rankings-push method to every article in all three languages: queries and positions, what the top results answer that we do not, freshness, missing format (table, steps, tool), internal links in, and facts to verify. Output: one action file per cluster with ready-to-apply changes and the **earliest date each page may be edited**.
- **A3 · Site-wide levers that change no article body:**
  - internal links from the strongest pages to striking-distance pages (only where editorially right);
  - ~~the nine content sections that return 404 (`/ca/natura/` …)~~ **decided against (26 Oct):** nothing on the site links to them (breadcrumbs already skip the level), so the 404s cost nothing; 27 hub pages of 3–6 entries each would be thin, and the guides hub already lists every article.
- **A4 · Pages eligible now** (not edited for ≥14 days, no frozen title): apply A2's changes immediately.

### B — from each page's date (7–21 Nov)
Apply A2's per-page changes in batches as each window closes, oldest first; one change set per page; log each in DECISION_LOG with the queries to watch.

### C — measure (weekly)
`python scripts/rank-inventory.py` + `scripts/gsc-compare.py`: per page, position on its named queries. Two rounds without movement → stop editing that page; the limit is authority, not content.

### D — authority (owner)
A young domain is limited by links more than content. Owner actions: Bing Webmaster Tools + sitemap; real social profiles for `sameAs`; listing in official tourism/municipal directories where eligible; outreach to local media for the data pages (mushroom report, snow depth, election results).

## Deploy blockers (owner)
Production deploys need the owner's Vercel account; check ISR writes before each deploy.
