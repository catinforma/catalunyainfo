---
name: growth-snapshot
description: Compact Search Console + GA4 numbers for catalunyainfo.com (goal pace, daily trend, top pages, CTR-below-curve pages, rising queries, striking-distance queries, one page's queries, URL families, audience). Use instead of the GSC/GA4 MCP tools whenever you need site numbers — same data, a small table instead of raw JSON.
---

# growth-snapshot

Run from the repo root with the Python that has the Google libraries:

```bash
PY=~/.local/share/pipx/venvs/mcp-search-console/bin/python
$PY scripts/snapshot.py pace                 # 1M-impressions goal 30 Oct-15 Nov: so far, need/day
$PY scripts/snapshot.py daily 14             # GSC per day + GA4 sessions
$PY scripts/snapshot.py families 7           # impressions/CTR by URL family
$PY scripts/snapshot.py ctr 14 300           # pages with CTR < 60% of the site's curve at their position
$PY scripts/snapshot.py rising 3 30          # queries and pages: last 3 days vs the 3 before
$PY scripts/snapshot.py gaps 14 40           # query->page at position 8-30, by impressions
$PY scripts/snapshot.py page <substr> 14     # one page or family: per day + top 30 queries
$PY scripts/snapshot.py pages 7 30           # top pages with expected CTR
$PY scripts/snapshot.py audience 28          # GA4: device, country, city, language, channel, hour
```

- GSC lags ~2 days and the last day is partial; use `pace`'s "last full day".
- Tokens: `~/.config/mcp-gsc/token.json` (GSC) and gcloud ADC (GA4); on Windows the AppData paths are tried too.
- Use the MCP tools only for what the script lacks (URL inspection, sitemaps, realtime).
