#!/usr/bin/env python3
"""List the templated pages for src/lib/seo/low-demand.ts (11 Nov 2026).

Reads the live sitemap and Search Console impressions per page over the last
90 full days, and prints the paths of the phase-1 rule: holiday municipality
and comarca pages and election comarca pages under 10 impressions, plus every
fuel page below the hub. Run with the Python that has the Google libraries:

  ~/.local/share/pipx/venvs/mcp-search-console/bin/python scripts/low-demand.py

The sitemap no longer lists the pages already on the list: to re-read them,
compare against LOW_DEMAND_PATHS as well (pages that gained impressions leave).
"""
import os
import re
import sys
import urllib.request
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))
import snapshot as s  # noqa: E402

HOST = "https://www.catalunyainfo.com"
end = date.today() - timedelta(days=1)
start = end - timedelta(days=89)
body = {"startDate": str(start), "endDate": str(end), "dimensions": ["page"], "rowLimit": 25000, "dataState": "all"}
stats = {r["keys"][0]: r["impressions"] for r in s.gsc().searchanalytics().query(siteUrl=s.SITE, body=body).execute().get("rows", [])}
req = urllib.request.Request(f"{HOST}/sitemap.xml", headers={"User-Agent": "catalunyainfo-low-demand"})
urls = re.findall(r"<loc>([^<]+)</loc>", urllib.request.urlopen(req).read().decode())
for u in urls:
    p = u[len(HOST):]
    i = stats.get(u, 0)
    fuel = re.match(r"^/(ca/benzineres|es/gasolineras)/((comarca|provincia)/)?[^/]+/$", p)
    muni = re.match(r"^/(ca/festius|es/festivos)/[^/]+/$", p) and not re.match(r".*/(2027|dia|ponts|puentes)/$", p)
    comarca = re.match(r"^/(ca/festius|es/festivos|ca/eleccions|es/elecciones)/comarca/[^/]+/$", p)
    if fuel or ((muni or comarca) and i < 10):
        print(p)
print(f"# {start}..{end}", file=sys.stderr)
