#!/usr/bin/env python3
"""List the templated pages for src/lib/seo/low-demand.ts (11 Nov 2026, extended 17 Nov).

Reads the live sitemap and Search Console impressions per page over the last
90 full days, and prints the paths of the phase-1 rule: holiday municipality
and comarca pages and election comarca pages under 10 impressions, plus every
fuel page below the hub, and (phase 2) election town pages under 10. 17 Nov:
also the English town pages (/en/holidays/<town>/), with the audit's bar of
0 clicks and under 10 impressions (pass the window in days as the first
argument to read them on 28 days, as the audit did). Run with the Python that
has the Google libraries:

  ~/.local/share/pipx/venvs/mcp-search-console/bin/python scripts/low-demand.py [days]

The sitemap no longer lists the pages already on the list: to re-read them,
compare against LOW_DEMAND_PATHS as well (pages that gained impressions leave).
The rule groups of LOW_DEMAND_RULES (Spain 2027 in ca/en, 11N city pages) and
the expired date pages are never in the sitemap; their keep lists are re-read
by hand at the review (docs/SEO_EXPERIMENTS.md, 17 Nov 2026).
"""
import os
import re
import sys
import urllib.request
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))
import snapshot as s  # noqa: E402

HOST = "https://www.catalunyainfo.com"
days = int(sys.argv[1]) if len(sys.argv) > 1 else 90
end = date.today() - timedelta(days=1)
start = end - timedelta(days=days - 1)
body = {"startDate": str(start), "endDate": str(end), "dimensions": ["page"], "rowLimit": 25000, "dataState": "all"}
stats = {r["keys"][0]: (r["clicks"], r["impressions"]) for r in s.gsc().searchanalytics().query(siteUrl=s.SITE, body=body).execute().get("rows", [])}
req = urllib.request.Request(f"{HOST}/sitemap.xml", headers={"User-Agent": "catalunyainfo-low-demand"})
urls = re.findall(r"<loc>([^<]+)</loc>", urllib.request.urlopen(req).read().decode())
for u in urls:
    p = u[len(HOST):]
    c, i = stats.get(u, (0, 0))
    fuel = re.match(r"^/(ca/benzineres|es/gasolineras)/((comarca|provincia)/)?[^/]+/$", p)
    # Town pages sit one level below the hub; "2027", "dia", "day" and "comarca" are the only other
    # first segments (the town Ponts is a town page: 11 Nov skipped it by mistake).
    muni = re.match(r"^/(ca/festius|es/festivos)/(?!(2027|dia|comarca)/)[^/]+/$", p)
    english = re.match(r"^/en/holidays/(?!(2027|day)/)[^/]+/$", p)
    comarca = re.match(r"^/(ca/festius|es/festivos|ca/eleccions|es/elecciones)/comarca/[^/]+/$", p)
    election = re.match(r"^/(ca/eleccions|es/elecciones)/[^/]+/$", p)
    if fuel or ((muni or comarca or election) and i < 10) or (english and c == 0 and i < 10):
        print(p)
print(f"# {start}..{end}", file=sys.stderr)
