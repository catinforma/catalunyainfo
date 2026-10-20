"""Search Console, one page: impressions per day and the queries behind them.

Read-only. Token from scripts/google-auth.py.

    python scripts/gsc-page.py <url-substring> [days]
"""
import os
import sys
from datetime import date, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
TOKEN = os.path.expanduser(r"~\.config\gcloud-oauth\google-token.json")
SITE = "sc-domain:catalunyainfo.com"
PAGE = sys.argv[1]
DAYS = int(sys.argv[2]) if len(sys.argv) > 2 else 28

gsc = build("searchconsole", "v1", credentials=Credentials.from_authorized_user_file(TOKEN, SCOPES),
            cache_discovery=False)
end = date.today() - timedelta(days=2)
start = end - timedelta(days=DAYS - 1)
where = [{"filters": [{"dimension": "page", "operator": "contains", "expression": PAGE}]}]


def run(name, dims, limit):
    r = gsc.searchanalytics().query(siteUrl=SITE, body={
        "startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": dims,
        "dimensionFilterGroups": where, "rowLimit": limit}).execute()
    print("--- %s  [clicks  impressions  ctr  position]" % name)
    for row in r.get("rows", []):
        print("   ", " | ".join(row.get("keys", ["all"]))[:70].ljust(70),
              "%5d %7d %5.1f%% %5.1f" % (row["clicks"], row["impressions"], row["ctr"] * 100, row["position"]))
    if not r.get("rows"):
        print("    no data")


print("%s  pages containing %r  %s .. %s" % (SITE, PAGE, start, end))
run("per day", ["date"], DAYS)
run("queries", ["query"], 30)
