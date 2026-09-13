# Search Console

## Status

| Item | State |
| --- | --- |
| Property verified | **Not yet** — pending the production deploy of v2 |
| Sitemap submitted | Not yet |
| Indexing enabled | **No** — `NEXT_PUBLIC_ALLOW_INDEXING` is `false` |
| MCP access from this session | **Not available** |

This file contains **no** coverage numbers, query data, CTR or position figures.
No Search Console MCP server is connected to this session, and the standing
instruction is not to invent them. The only Google MCP available here is
`google-ads-mcp`, which is Google Ads — a different product.

Everything below is the procedure to follow, written so it can be executed
directly once access exists.

## Property setup

**Use a Domain property** (`catalunyainfo.com`), verified by DNS TXT record.
It covers the apex, `www` and every subdomain and protocol in one place, which
is what you want when the apex redirects to `www`. A URL-prefix property would
need separate entries and would miss the apex's redirect behaviour.

A `google-site-verification` TXT record already exists on the apex from the v1
setup, and it survived the hosting change. Check whether it corresponds to a
Domain property that is still verified before setting up a new one — if it is,
there is nothing to do for verification.

If DNS verification is not possible, the fallback is the HTML tag method:
set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and add it to the metadata in
`(public)/[locale]/layout.tsx` under `verification.google`.

Add both `https://www.catalunyainfo.com/` and `https://catalunyainfo.com/` as
URL-prefix properties **as well**, temporarily — they make it easy to confirm the
apex → www redirect is being followed and that the apex is not accumulating its
own index entries.

## Sitemap

One sitemap, at `https://www.catalunyainfo.com/sitemap.xml`, generated and
revalidated hourly and on publish.

Submit it once, after indexing is enabled. Do not resubmit on every publish —
`lastmod` is accurate and Google recrawls on its own.

It will be **empty** until `NEXT_PUBLIC_ALLOW_INDEXING=true`, by design.
Submitting it before there is content would report an empty sitemap.

## Launch sequence

Run in this order. Steps 1–3 are the prerequisites; do not skip ahead.

1. **Content exists.** At least the trust pages plus one complete cluster, in
   Catalan. `npm run audit:readiness` must not say `NOT READY`.
2. **Enable indexing.** `NEXT_PUBLIC_ALLOW_INDEXING=true` in Vercel →
   **Production only**. Redeploy.
3. **Confirm the switch worked**, before telling Google anything:
   ```bash
   curl -s  https://www.catalunyainfo.com/robots.txt          # Allow, + Sitemap:
   curl -sI https://www.catalunyainfo.com/ca/ | grep -i x-robots-tag   # absent
   curl -s  https://www.catalunyainfo.com/sitemap.xml | head -20       # populated
   ```
4. **Verify the Domain property** via DNS TXT.
5. **Submit the sitemap.**
6. **URL Inspection on one page per language.** The thing to check is the
   *rendered HTML*: it must contain the `<h1>` and the body text. This is the
   direct regression test for version 1's failure.
7. **Request indexing** for the three locale homepages and the cluster's hub.
   Nothing else — bulk requests achieve nothing.

## What to watch, and what it means

| Report | What to look for | What it would mean |
| --- | --- | --- |
| **Pages → Not indexed** | `Crawled – currently not indexed` on new guides | Google saw it and judged it not worth indexing. The content needs to be better, not the markup. |
| | `Discovered – currently not indexed` | Crawl budget or perceived low value. Improve internal linking from hubs. |
| | `Duplicate, Google chose different canonical` | Our canonical is being overridden — check the reported alternative |
| | `Soft 404` on any hub | An empty listing page got into the index. The sitemap already excludes empty hubs; check why it was crawled. |
| | **`Not found (404)` / `Gone (410)`** rising to ~42 | Correct and expected. The version-1 articles being dropped. |
| **International Targeting** | hreflang errors | Most often a missing return tag — impossible here, since alternates are derived from the database |
| **Core Web Vitals** | URLs failing LCP/INP/CLS | Field data. Only appears with enough traffic. |
| **Performance** | Queries with impressions but low CTR | The title and meta description are not matching the intent |
| | Pages with position 8–20 | The best improvement targets: real demand, nearly there |

## The migration, specifically

The v1 URLs and what should happen in Search Console:

| URLs | Expected |
| --- | --- |
| 42 × `/article/*.html` | Move to **Gone (410)**. Do not "fix" this — it is the intended outcome. |
| 9 category hubs, `/calendari/` | **Page with redirect**, then the new hub indexed |
| `/sobre-nosaltres.html`, `/contacte.html`, `/legal/*` | **Page with redirect** |
| Apex URLs | **Page with redirect** to www |

**Check before assuming.** If the Performance report shows any `/article/*` URL
still carrying real impressions or referring links, that specific row in
`migration/redirects.csv` can be changed from `410` to a `308` pointing at the
best equivalent new page, then `npm run build:redirects` and redeploy. The CSV is
the source of truth; the edge follows it.

## Once MCP access exists

Run these, in this order, and record the output here with a date:

1. `sites.list` — confirm which properties this account can read.
2. `searchanalytics.query` on `page` dimension, last 3 months, for the **old**
   property — to find any v1 URL worth rescuing before the 410s finish. This is
   the one genuinely time-sensitive query.
3. `searchanalytics.query` on `query` dimension — what the old site ranked for,
   as an input to the content plan.
4. `sitemaps.list` / `sitemaps.submit`.
5. `urlInspection.index.inspect` on one URL per language — checking
   `indexStatusResult.robotsTxtState`, `.indexingState`, `.pageFetchState`, and
   that `userCanonical` equals `googleCanonical`.

Until then, this section stays empty rather than speculative.

## Log

| Date | Action | Result |
| --- | --- | --- |
| 2026-09-13 | Audited v1 live site by HTTP | 42 thin articles, client-rendered homepage, no `<h1>`, apex→www 307 |
| 2026-09-13 | Domain moved to the v2 project | Reclaimed by `_vercel` TXT proof at Spaceship. `www` serves v2, apex 308s to `www`, v1 is gone. Indexing still **off**, so the whole domain is `noindex` — expect catalunyainfo.com to be deindexed over the coming weeks. That is intended for the 42 removed articles; the homepage returns once content is published and the switch is flipped. |
| | *(next entry: property verification)* | |
