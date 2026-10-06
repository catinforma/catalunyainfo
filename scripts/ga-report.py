"""Quick GA4 pull for the weekly review.

Lives in the repo rather than the session scratchpad, which does not survive.
Read-only: it runs reports, it never writes to the property.
"""
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
TOKEN = os.path.expanduser(r"~\.config\gcloud-oauth\analytics-token.json")
PROP = "properties/554310792"

creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
data = build("analyticsdata", "v1beta", credentials=creds, cache_discovery=False)


def run(name, dims, mets, days=9, limit=20):
    r = data.properties().runReport(property=PROP, body={
        "dateRanges": [{"startDate": "%ddaysAgo" % days, "endDate": "today"}],
        "dimensions": [{"name": d} for d in dims],
        "metrics": [{"name": m} for m in mets],
        "limit": limit}).execute()
    print("--- %s  [%s]" % (name, ", ".join(mets)))
    for row in r.get("rows", []):
        print("   ", " | ".join(v["value"] for v in row["dimensionValues"]).ljust(48),
              "  ".join(v["value"] for v in row["metricValues"]))
    if not r.get("rows"):
        print("    no data")


run("per day", ["date"], ["activeUsers", "sessions", "screenPageViews"], 9, 12)
run("pages", ["pagePath"], ["screenPageViews", "userEngagementDuration"], 9, 14)
run("channel", ["sessionDefaultChannelGroup"], ["activeUsers", "sessions"], 9, 10)
run("device", ["deviceCategory"], ["activeUsers"], 9, 5)
