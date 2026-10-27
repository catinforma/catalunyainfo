# x10 plan (27 Oct 2026)

Owner goal: a very large jump in position, CTR, clicks and brand. Research behind it (gitignored, read by absolute path):
`research_notes/x10/competitors-and-scale.md` (competitors, demand floors from Trends calibrated on our GSC, open-data opportunities) and the GSC/GA4 analysis summarised below.

## Where we are (GSC/GA4, 28 days to 26 Oct)

- 26 Oct: 7,368 impressions, 317 clicks (record). Without the clock-change pages the real base is ~7k/day and rising.
- 52% of clicks are elections, 20% mushrooms, 8% Castanyada: all end by mid-December.
- Only 2% of impressions are at positions 1-3; 59% at 6-10. CTR: positions 1-3 on "tool" queries convert 10-23%; 6-10 convert ~1.2%.
- Audience: Spain 81-90%, 62% of sessions from Catalonia, mobile 63%, 1.22 pages per session. EN is 27% of impressions but 12% of clicks. AI assistants 13 sessions/day and rising; Bing 9% of sessions.
- Crawl is the bottleneck (~20 URLs/day re-read); Discover: 0.

## What wins (competitor read)

We win where no single owner holds the SERP and the answer changes weekly or yearly (mushrooms, candidates, how-to-vote, holidays, reservoirs, snow today). We lose head terms owned by official bodies, brands or commercial sellers (airport, ski, Tibidabo, Dalí). So: more "right now" and "per place" answers from official open data, not more head-term guides.

## Engines (in build order)

1. **Holiday engine** (week 1): per-municipality local holidays (top 100, ca/es) from `b4eh-r8up`, "is it a holiday today/tomorrow" computed in the browser, date pages for 7-8 Dec, 25-26 Dec, 1 and 6 Jan; swap in 2027 within 48 h of the DOGC order (expected late Nov - mid Dec). Peaks: December and January.
2. **Strikes hub** (week 1): "Vaga avui: què funciona" ca/es/en, one evergreen URL, a dated section per strike; 11 Nov general strike once minimum services are official.
3. **Election results per municipality** (weeks 1-2): top 100 ca/es + EN top 10 from Generalitat data, 29N slot filled from Interior; all 947 by March 2027 for the 23 May 2027 municipal elections (~250k searches in one week, the biggest single opportunity).
4. **Rodalies live per line** (week 2): static guidance + client-side Renfe GTFS-RT alerts (CC BY 4.0).
5. **Fuel prices today** (week 3): comarques, cities, bonÀrea/Esclatoil; MITECO API, table client-side.
6. **Mountain / ski weather now** (week 3), **weekend per province/coast** (week 4), **reservoir per reservoir** (week 4).
7. **2027 seasonal**: Reis 2027 (when the programme is out), festes majors, beaches, Pla Alfa by April-May 2027.

Architecture for every template (research §B1): own route, `revalidate = false`, committed JSON snapshot (no database at render), on-demand revalidation only when the source changes, deterministic HTML (dataset date only), "today" logic in the browser, live data client-side through a CDN-cached route handler. Roll out in tranches of 100-200 URLs linked from pages that already rank. Doorway guardrail: a page ships only with data specific to that place plus original guidance; small places stay on the existing single page.

## CTR and brand

- Position is the CTR lever (titles do not move CTR below position 5). Top-3 pushes on pages whose 28-day windows close (RANK_ALL_PLAN.md, from 7 Nov).
- Live pages show the reading date in the title/description where the query is "today" (mushrooms model).
- Pages per session 1.22: every template links to the next useful action (today's holiday -> shops open -> transport).
- Brand: consistent CatalunyaInfo name and logo; owner actions: Bing Webmaster Tools + sitemap, real social profiles for `sameAs`, Google signals in GA4 if consent allows, outreach to local media for the data pages.

## Owner decision pending

Extending two or three families (holidays, mushrooms) to all of Spain is the only route to x10 within months (Spain ~6x Catalonia) but changes the site's identity. Until decided: Catalonia only.

## Expectations (honest)

Next 4 weeks: ~1.5-2.5x on normal days; peak days (29-30 Nov, 7-8 Dec, 5-6 Jan) 15-30k impressions. Sustained x10: May-August 2027 (municipal elections + summer), if the municipality templates are indexed by March 2027.

## Measure every Monday

GSC impressions/clicks/position by template (route prefix), share of each tranche crawled/indexed (`scripts/crawl-gap.py`), CTR by position bucket, GA4 pages/session. Two flat rounds on a template -> stop adding tranches to it.
