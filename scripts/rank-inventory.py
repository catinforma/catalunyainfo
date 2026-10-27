"""Inventory of every article URL for a rankings push.

For each article URL in the live sitemap: Search Console clicks, impressions,
CTR, position and top queries (28 days), the source file that publishes it, the
date that file was last committed, and every docs/SEO_EXPERIMENTS.md heading
that mentions it. Read-only. Token from scripts/google-auth.py.

    python scripts/rank-inventory.py research_notes/rank-all
"""
import csv
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import defaultdict
from datetime import date, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

OUT = sys.argv[1] if len(sys.argv) > 1 else "research_notes/rank-all"
SITE = "sc-domain:catalunyainfo.com"
ORIGIN = "https://www.catalunyainfo.com"
TOKEN = os.path.expanduser(r"~\.config\gcloud-oauth\google-token.json")

xml = urllib.request.urlopen(ORIGIN + "/sitemap.xml", timeout=60).read().decode("utf-8")
urls = [u.replace(ORIGIN, "") for u in re.findall(r"<loc>([^<]+)</loc>", xml)]
articles = [u for u in urls if re.fullmatch(r"/(ca|es|en)/[^/]+/[^/]+/", u)]

gsc = build("searchconsole", "v1", credentials=Credentials.from_authorized_user_file(
    TOKEN, ["https://www.googleapis.com/auth/webmasters.readonly"]), cache_discovery=False)
end = date.today() - timedelta(days=2)
start = end - timedelta(days=27)
rows, offset = [], 0
while True:
    page = gsc.searchanalytics().query(siteUrl=SITE, body={
        "startDate": start.isoformat(), "endDate": end.isoformat(),
        "dimensions": ["page", "query"], "rowLimit": 25000, "startRow": offset}).execute().get("rows", [])
    rows += page
    if len(page) < 25000:
        break
    offset += 25000
totals = {r["keys"][0].replace(ORIGIN, ""): r for r in gsc.searchanalytics().query(siteUrl=SITE, body={
    "startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": ["page"], "rowLimit": 5000}).execute().get("rows", [])}
queries = defaultdict(list)
for r in rows:
    page, q = r["keys"]
    queries[page.replace(ORIGIN, "")].append((q, r["impressions"], r["clicks"], r["position"]))

experiments = open("docs/SEO_EXPERIMENTS.md", encoding="utf-8").read()
sections = re.split(r"\n(?=## )", experiments)


def source_file(path):
    rel = path.split("/", 2)[2].strip("/")  # after /<locale>/
    hit = subprocess.run(["git", "grep", "-l", "-F", f'"{rel}"', "--", "src/lib/content"],
                         capture_output=True, text=True).stdout.split()
    # Registries list every path; the article lives in the file that is not one.
    registries = ("shared.ts", "home-tools.ts", "links.ts", "related", "routes.ts")
    own = [h for h in hit if not h.endswith(registries)]
    return (own or hit or [""])[0]


def last_commit(f):
    if not f:
        return ""
    return subprocess.run(["git", "log", "-1", "--format=%cs", "--", f], capture_output=True, text=True).stdout.strip()


inventory = []
for u in articles:
    t = totals.get(u, {})
    slug = u.rstrip("/").split("/")[-1]
    mentions = [s.split("\n", 1)[0].lstrip("# ").strip() for s in sections if slug in s]
    f = source_file(u)
    qs = sorted(queries.get(u, []), key=lambda x: -x[1])[:8]
    inventory.append({
        "url": u,
        "locale": u.split("/")[1],
        "impressions": int(t.get("impressions", 0)),
        "clicks": int(t.get("clicks", 0)),
        "ctr": round(100 * t.get("ctr", 0), 1),
        "position": round(t.get("position", 0), 1),
        "source": f,
        "last_commit": last_commit(f),
        "experiments": " | ".join(mentions),
        "top_queries": "; ".join(f"{q} ({i} @ {p:.1f})" for q, i, c, p in qs),
    })

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "inventory.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=list(inventory[0].keys()))
    w.writeheader()
    w.writerows(sorted(inventory, key=lambda r: -r["impressions"]))
with open(os.path.join(OUT, "inventory.json"), "w", encoding="utf-8") as fh:
    json.dump(inventory, fh, ensure_ascii=False, indent=1)
print(f"{len(inventory)} article URLs, {start}..{end}; written to {OUT}/inventory.csv")
