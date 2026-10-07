"""One-off OAuth login for the read-only Google reports.

Opens the browser, asks for read-only Search Console and GA4 access, and saves
one token that both gsc-report.py and ga-report.py use. Run it again only if the
token is revoked or expires.
"""
import os
import shutil
from google_auth_oauthlib.flow import InstalledAppFlow

DIR = os.path.expanduser(r"~\.config\gcloud-oauth")
CLIENT = os.path.join(DIR, "client_secret.json")
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly",
          "https://www.googleapis.com/auth/analytics.readonly"]

creds = InstalledAppFlow.from_client_secrets_file(CLIENT, SCOPES).run_local_server(port=0, open_browser=False)
token = os.path.join(DIR, "google-token.json")
with open(token, "w") as f:
    f.write(creds.to_json())
# ga-report.py reads its own path; same token, both scopes.
shutil.copyfile(token, os.path.join(DIR, "analytics-token.json"))
print("saved", token)
