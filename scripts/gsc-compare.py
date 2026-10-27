"""Before/after reading for one SEO experiment, query by query.

Read-only. Token from scripts/google-auth.py.

    python scripts/gsc-compare.py <page-substring> <before-start> <before-end> <after-start> <after-end> [query-regex]

Prints, for the page (all locales matching the substring), totals for both
windows and the per-query rows matching the optional regex, so a title change
is judged on the named queries it was meant for (see SEO_EXPERIMENTS.md,
2026-09-29), not on aggregate CTR.
"""
import os
import re
import sys
from collections import defaultdict

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

page, b0, b1, a0, a1 = sys.argv[1:6]
pattern = re.compile(sys.argv[6], re.I) if len(sys.argv) > 6 else None
TOKEN = os.path.expanduser(r"~\.config\gcloud-oauth\google-token.json")
gsc = build("searchconsole", "v1", credentials=Credentials.from_authorized_user_file(
    TOKEN, ["https://www.googleapis.com/auth/webmasters.readonly"]), cache_discovery=False)
where = [{"filters": [{"dimension": "page", "operator": "contains", "expression": page}]}]


def pull(start, end):
    rows = gsc.searchanalytics().query(siteUrl="sc-domain:catalunyainfo.com", body={
        "startDate": start, "endDate": end, "dimensions": ["query"], "dimensionFilterGroups": where,
        "rowLimit": 5000}).execute().get("rows", [])
    total = gsc.searchanalytics().query(siteUrl="sc-domain:catalunyainfo.com", body={
        "startDate": start, "endDate": end, "dimensionFilterGroups": where}).execute().get("rows", [{}])[0]
    return {r["keys"][0]: r for r in rows}, total


before, tb = pull(b0, b1)
after, ta = pull(a0, a1)
days_b = (int(b1[-2:]) - int(b0[-2:])) if b0[:7] == b1[:7] else None


def fmt(t):
    if not t:
        return "      0 impr      0 clicks"
    return "%7d impr %6d clicks  ctr %5.1f%%  pos %5.1f" % (t.get("impressions", 0), t.get("clicks", 0),
                                                          100 * t.get("ctr", 0), t.get("position", 0))


print(f"page ~ {page}")
print(f"  before {b0}..{b1}: {fmt(tb)}")
print(f"  after  {a0}..{a1}: {fmt(ta)}")
if pattern:
    agg = defaultdict(lambda: [0, 0, 0.0, 0, 0, 0.0])
    keys = sorted({q for q in list(before) + list(after) if pattern.search(q)},
                  key=lambda q: -(after.get(q, {}).get("impressions", 0) + before.get(q, {}).get("impressions", 0)))
    print(f"  named queries /{pattern.pattern}/: {len(keys)}")
    sums = [0, 0, 0, 0]
    for q in keys[:25]:
        b, a = before.get(q, {}), after.get(q, {})
        sums[0] += b.get("impressions", 0); sums[1] += b.get("clicks", 0)
        sums[2] += a.get("impressions", 0); sums[3] += a.get("clicks", 0)
        print("    %-52s before %4d/%3d @%5.1f   after %4d/%3d @%5.1f" % (
            q[:52], b.get("impressions", 0), b.get("clicks", 0), b.get("position", 0),
            a.get("impressions", 0), a.get("clicks", 0), a.get("position", 0)))
    for q in keys[25:]:
        b, a = before.get(q, {}), after.get(q, {})
        sums[0] += b.get("impressions", 0); sums[1] += b.get("clicks", 0)
        sums[2] += a.get("impressions", 0); sums[3] += a.get("clicks", 0)
    ctr = lambda c, i: (100 * c / i) if i else 0
    print("  named total: before %d impr %d clicks (%.1f%%)   after %d impr %d clicks (%.1f%%)" % (
        sums[0], sums[1], ctr(sums[1], sums[0]), sums[2], sums[3], ctr(sums[3], sums[2])))
