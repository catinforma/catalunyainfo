"""Pull Search Console and GA4 into one JSON file for the growth graph.

Read-only. Tokens: scripts/google-auth.py (or the mcp-gsc server token) for
Search Console, analytics-token.json for GA4.

    python scripts/growth-pull.py [out.json]
"""
import json
import os
import sys
from datetime import date, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SITE = "sc-domain:catalunyainfo.com"
PROP = "properties/554310792"
OUT = sys.argv[1] if len(sys.argv) > 1 else "reports/growth-graph/data.json"

def token(*paths):
    return next(os.path.expanduser(p) for p in paths if os.path.exists(os.path.expanduser(p)))


# Search Console: the google-auth.py token, else the one the mcp-gsc server keeps.
gsc = build("searchconsole", "v1", cache_discovery=False, credentials=Credentials.from_authorized_user_file(
    token(r"~\.config\gcloud-oauth\google-token.json", r"~\AppData\Local\mcp-gsc\mcp-gsc\token.json")))
ga = build("analyticsdata", "v1beta", cache_discovery=False, credentials=Credentials.from_authorized_user_file(
    token(r"~\.config\gcloud-oauth\analytics-token.json"), ["https://www.googleapis.com/auth/analytics.readonly"]))

end = date.today() - timedelta(days=1)


def gsc_rows(dims, days, limit=25000):
    start = end - timedelta(days=days - 1)
    rows, offset = [], 0
    while True:
        r = gsc.searchanalytics().query(siteUrl=SITE, body={
            "startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": dims,
            "rowLimit": limit, "startRow": offset, "dataState": "all"}).execute()
        batch = r.get("rows", [])
        rows += [dict(zip(dims, row["keys"]), clicks=row["clicks"], impressions=row["impressions"],
                      ctr=row["ctr"], position=row["position"]) for row in batch]
        if len(batch) < limit:
            return rows
        offset += limit


def ga_rows(dims, mets, days, limit=10000):
    r = ga.properties().runReport(property=PROP, body={
        "dateRanges": [{"startDate": "%ddaysAgo" % days, "endDate": "yesterday"}],
        "dimensions": [{"name": d} for d in dims], "metrics": [{"name": m} for m in mets],
        "limit": limit}).execute()
    return [dict(zip(dims, [v["value"] for v in row["dimensionValues"]]),
                 **{m: float(v["value"]) for m, v in zip(mets, row["metricValues"])})
            for row in r.get("rows", [])]


data = {
    "generated": date.today().isoformat(),
    "gsc": {
        "daily": gsc_rows(["date"], 90),
        "query_page_28": gsc_rows(["query", "page"], 28),
        "page_28": gsc_rows(["page"], 28),
        "page_7": gsc_rows(["page"], 7),
        "country_28": gsc_rows(["country"], 28),
        "device_28": gsc_rows(["device"], 28),
    },
    "ga4": {
        "daily_channel": ga_rows(["date", "sessionDefaultChannelGroup"], ["sessions", "activeUsers", "screenPageViews"], 60),
        "landing_28": ga_rows(["landingPagePlusQueryString", "sessionDefaultChannelGroup"],
                              ["sessions", "engagedSessions", "averageSessionDuration", "screenPageViewsPerSession"], 28),
        "source_28": ga_rows(["sessionSource", "sessionMedium"], ["sessions", "engagedSessions"], 28),
        "country_28": ga_rows(["country", "language"], ["sessions"], 28),
        "device_28": ga_rows(["deviceCategory"], ["sessions", "engagementRate"], 28),
    },
}
os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
print(OUT, {k: len(v) for part in ("gsc", "ga4") for k, v in data[part].items()})
