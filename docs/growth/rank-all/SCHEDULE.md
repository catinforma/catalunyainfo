# Rank-all — phase B schedule (from the 26 Oct reviews)

Every article was reviewed on 26 Oct 2026 (`review-1…7-*.md` in this folder: diagnosis, queries, competitors, paste-ready ca/es/en text with official sources). P0 factual fixes went in on branch `sprint/2026-10-26-p0-fixes`. Everything else waits for its page's window (last edit + 28 days, or a later SEO_EXPERIMENTS freeze).

**Before applying anything on a date below:** check the page's last crawl date in URL inspection (SEO_EXPERIMENTS, 26 Oct). Re-verify any figure the review marks "re-check on the day".

## Watches (dated facts, any day)

| From | Page | Check | Review |
|---|---|---|---|
| 28 Oct, 3 Nov | Candidates (29N) | the live block renders the BOE lists for all four provinces; if not, P0 | 1 |
| 31 Oct–7 Nov | Mesa | the members' manual: if it states when/how the €75 is paid, quote it | 1 |
| any day | Voting, mesa | DOGC order on voters' paid leave; add number, date, hours | 1 |
| ~26 Nov | Election night | Interior's 29N results site/app note; add link and start time | 1 |
| 27 Oct, twice weekly; daily 10–28 Nov | Christmas markets | organisers' 2026 dates (watch list in the guide's fact pack) | 6 |
| daily | Snow depth, ski | resort opening dates (FGC, Masella, Port del Comte) | 6 |
| early Jan 2027 | Cruise port | WTC terminal closure at end of 2026 | 3 |
| December | Local holidays | the 2027 local-holiday DOGC order: publish the full table | 2 |

## Dated content changes

| Date | Page(s) | Change | Review |
|---|---|---|---|
| 2 Nov | Ski guide | Baqueira season pass 1,300 → 1,400 € (if not already written with its window) | 6 |
| 3 Nov | Castanyada | post-festival state: Castanyada 2027 is Sunday 31 Oct; 2026 table "edició passada" | 7 |
| 4 Nov | Is today a holiday | full "tomorrow" sentence; link in from ES metro hours | 2 |
| 4 Nov | Weekend agenda | weekend dates in the lead sentence | 2 |
| 4 Nov | Sitges festival | remaining evergreen clean-up (body) | 7 |
| 17 Nov | Mushroom report | FAQ "how many days after rain" (CTFC handbook p. 53); zones map | 6 |
| 17 Nov | Autumn colours | rest of the review | 6 |
| 17 Nov | Local holidays | Barcelona 2027 days | 2 |
| 18 Nov | Ski guide | remove Guils "25% until 17 Nov" | 6 |
| 20 Nov | Work calendar | 7 December FAQ (replaces 30 Oct one); 29N paid-hours link sentence to voting | 1, 2 |
| 20 Nov | School calendar, metro hours, tourist tax, airport, Núria, Tibidabo, Montjuïc, free museums, Castanyada | per review | 2, 3, 4, 5, 7 |
| 21 Nov | Transport passes, parking, ZBE, cruise port (rest), weather, Barcelona Card, mesa, Parliament/general/municipal results, zoo, markets, monuments, Camp Nou, beaches, PortAventura, Sitges, Montserrat (rest), Figueres, Cerdanya (rest), Girona, Andorra, Tarragona, reservoirs, rainy day, trains, Gaudí, medieval villages, surprising places, tourist traps, beyond Montserrat, food fairs | per review | 1, 3, 4, 5, 6, 7 |
| 22 Nov | Voting, election night, candidates, Christmas in BCN, New Year's Eve, snow depth, nativity scenes, ski, snow without skiing, Setcases, Ripollès, Barcelona hub | per review | 1, 3, 4, 6 |
| 23 Nov | Clock change | next-change FAQ; EN "do the clocks go back in barcelona" FAQ; act before 1 Mar | 2 |
| 23 Nov | Masella price 730 → 840 € | | 6 |
| 28–29 Nov | Food fairs | "2026 dates for reference" state | 7 |
| 9 Dec | Alp2500 price 950 → 1,090 € | | 6 |

## Owner decision pending

**Election pages before 21 Nov.** Demand for voting and mesa peaks with the draw (31 Oct–4 Nov) and before the 19 Nov postal deadline, i.e. before their windows close. Option: allow body-only additions now (no title changes; mesa ca/es titles frozen to 14 Nov), accepting that the 23–24 Oct sprint reading for these two pages becomes unreadable. Review 1 has the text ready.

## Measuring

Weekly: `python scripts/rank-inventory.py research_notes/rank-all` and `python scripts/gsc-compare.py <page> <before> <after> <query-regex>`. Two rounds without movement on a page → stop editing it; the limit is authority (see RANK_ALL_PLAN, phase D).
