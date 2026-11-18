# Competing with the media — plan from 18 Nov 2026

Owner, 18 Nov 2026: "només nosaltres podem fer que aquesta pàgina sigui gran i competeixi amb mitjans… només esforç i treball… planteja-ho i fes-ho."

Where we stand (GSC 5–18 Nov, query×page): 66 % of impressions at positions 6–10, 4.5 % at 1–3; average 8.6. GA4 ~1,100 sessions/day without a strike spike, 1.08 views/session, 90 % new users.

The media beat us on authority, Top Stories and Discover. We beat them on precision, official data, speed of update, tools and the long tail no newsroom serves. The plan plays where we can win first, then attacks their ground.

House rules still apply to every item (`.claude/product-marketing.md`): official sources, no mass AI text, ca/es/en, no outreach or contact without the owner's OK, no new costs, AdSense/consent untouched.

## Pillars

| # | Pillar | What wins | Measure |
|---|---|---|---|
| A | **Service news first** | Strike, transport, weather-alert, election-night and lottery-night pages published before the media, with the official order/table in the HTML; Top Stories and Discover readiness (NewsArticle, real authorship, `max-image-preview:large`, 1200 px images, fresh `dateModified`, news sitemap) | Top Stories/Discover clicks (GSC search appearance + Discover report), position on "huelga X" day queries |
| B | **Live data nobody else has** | Rodalies, reservoirs, fuel, PVPC, butane already live; add official alerts (Meteocat/AEMET warnings, SCT traffic incidents), "what is open today", air quality — pages people bookmark and come back to | returning users, sessions/day on live pages |
| C | **Spain-wide money tools** | 20+ calculators → 40, each the top-3 answer for its long tail; yearly rule updates guarded by tests (1 Jan 2027) | calculator impressions/position, calculator_use events |
| D | **Every municipality** | 947 town hubs: holidays 2026/2027, fairs, elections 29N results, working days, links between them — substance per town, noindex where thin | town-page clicks, coverage |
| E | **Authority (links)** | Linkable assets: embeddable holiday calendar / calculator widgets with an attribution link, original data reports from official datasets. Outreach list drafted for the owner — nothing sent without approval | referring domains (GSC Links) |
| F | **Retention** | Next-step blocks (pages/session), WhatsApp channel CTA, ICS subscriptions, installable app manifest | views/session, returning users |

## Queue (waves of ≤ 4 agents, pick by expected clicks)

1. A — Top Stories/Discover readiness audit + fixes. *(launched 18 Nov)*
2. F — next-step blocks. *(running 18 Nov)*
3. D/C — Spain calendario laboral 2027 push. *(running 18 Nov)*
4. Due reviews 18 Nov (Semana Santa 2027 CTR). *(running 18 Nov)*
5. A — 29N election night: results pages load-tested, live from the official feed, ready 26 Nov.
6. B — official alerts page (Meteocat/AEMET warnings in force, SCT incidents), licences checked first.
7. E — embeddable widgets (holidays per town, 2 calculators) + attribution link; draft outreach list for the owner.
8. C — next calculators from `research_notes/spain-utilities-opportunities-nov2026.md` (IRPF/renta, IPREM, cuota autónomos 2027, sueldo neto per amount pages only with demand).
9. A — Christmas lottery night (22 Dec) and El Niño: runbook `docs/GORDO_NAVIDAD_RUNBOOK.md`, SELAE fetch from the owner's PC if the VPS stays blocked.
10. D — town hubs: link 2026/2027 holidays, fair, elections and working days per town.

## Targets (goals, not results)
- 15 Dec: 2,500 sessions/day on a day without a strike; average position ≤ 7.0; views/session ≥ 1.25.
- 31 Jan 2027: 5,000 sessions/day without a strike; average position ≤ 6.0.
Review every Monday with `scripts/snapshot.py daily 14` and `families 7`; log in `docs/SEO_EXPERIMENTS.md`.
