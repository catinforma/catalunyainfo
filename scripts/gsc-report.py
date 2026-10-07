"""Quick Search Console pull for the weekly review.

Lives in the repo rather than the session scratchpad, which does not survive.
Read-only: it queries search analytics, it never writes to the property.
Token comes from scripts/google-auth.py.
"""
import os
import sys
from datetime import date, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
TOKEN = os.path.expanduser(r"~\.config\gcloud-oauth\google-token.json")
SITE = "sc-domain:catalunyainfo.com"
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 28

creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
gsc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
# Search Console data lags ~2 days.
end = date.today() - timedelta(days=2)
start = end - timedelta(days=DAYS - 1)


def run(name, dims, limit=20):
    r = gsc.searchanalytics().query(siteUrl=SITE, body={
        "startDate": start.isoformat(), "endDate": end.isoformat(),
        "dimensions": dims, "rowLimit": limit}).execute()
    print("--- %s  [clicks  impressions  ctr  position]" % name)
    for row in r.get("rows", []):
        print("   ", " | ".join(row.get("keys", ["all"]))[:70].ljust(70),
              "%5d %7d %5.1f%% %5.1f" % (row["clicks"], row["impressions"],
                                         row["ctr"] * 100, row["position"]))
    if not r.get("rows"):
        print("    no data")


print("%s  %s .. %s" % (SITE, start, end))
run("total", [], 1)
run("per day", ["date"], DAYS)
run("queries", ["query"], 25)
run("pages", ["page"], 25)
run("country", ["country"], 8)
run("device", ["device"], 5)
for s in gsc.sitemaps().list(siteUrl=SITE).execute().get("sitemap", []):
    print("--- sitemap", s["path"], "submitted", s.get("lastSubmitted", "?")[:10],
          "errors", s.get("errors", 0), "warnings", s.get("warnings", 0))
