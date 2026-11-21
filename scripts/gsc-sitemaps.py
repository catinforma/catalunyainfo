# Search Console sitemaps: the report (submitted vs indexed, last read by Google, errors) and the resubmission.
#
#   python scripts/gsc-sitemaps.py list            read-only: what Google last read, when, and how many URLs it took
#   python scripts/gsc-sitemaps.py submit --yes    sitemaps.submit for /sitemap.xml and /news-sitemap.xml
#
# Resubmitting is how a sitemap is "pinged" now: Google retired the /ping endpoint (2023) and ignores IndexNow;
# what it honours is an accurate <lastmod>, which it reads when it next fetches the sitemap. A submit asks it to
# fetch the file again soon. Run it once after a deploy that moved many lastmod dates (docs/SEO_EXPERIMENTS.md,
# 21 Nov 2026); it is harmless to repeat, but there is no point doing it more than once a day.
#
# Same token as snapshot.py. On the VPS:
#   ~/.local/share/pipx/venvs/mcp-search-console/bin/python -I scripts/gsc-sitemaps.py list
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

sys.stdout.reconfigure(encoding="utf-8")
SITE = "sc-domain:catalunyainfo.com"
SITEMAPS = (
    "https://www.catalunyainfo.com/sitemap.xml",
    "https://www.catalunyainfo.com/news-sitemap.xml",
)
TOKENS = (
    os.path.join("~", ".config", "mcp-gsc", "token.json"),
    os.path.join("~", ".config", "gcloud-oauth", "google-token.json"),
    os.path.join("~", "AppData", "Local", "mcp-gsc", "mcp-gsc", "token.json"),
)


def service():
    tok = next((os.path.expanduser(p) for p in TOKENS if os.path.exists(os.path.expanduser(p))), None)
    if not tok:
        sys.exit("no GSC token in: " + ", ".join(TOKENS))
    return build("searchconsole", "v1", cache_discovery=False, credentials=Credentials.from_authorized_user_file(tok))


def report(svc):
    rows = svc.sitemaps().list(siteUrl=SITE).execute().get("sitemap", [])
    for s in rows:
        contents = ", ".join(
            f"{c.get('type')}: submitted {c.get('submitted', '?')}, indexed {c.get('indexed', 'n/a')}" for c in s.get("contents", [])
        )
        print(s["path"])
        print(f"  submitted {s.get('lastSubmitted', '-')[:19]}  last read {s.get('lastDownloaded', '-')[:19]}  pending {s.get('isPending')}")
        print(f"  errors {s.get('errors', 0)}  warnings {s.get('warnings', 0)}  {contents}")
    if not rows:
        print("no sitemaps registered for", SITE)


def main():
    args = sys.argv[1:]
    if not args or args[0] not in ("list", "submit"):
        sys.exit(__doc__ or "usage: gsc-sitemaps.py list | submit --yes")
    svc = service()
    if args[0] == "submit":
        if "--yes" not in args:
            sys.exit("submit needs --yes (it asks Google to re-read both sitemaps)")
        for feed in SITEMAPS:
            svc.sitemaps().submit(siteUrl=SITE, feedpath=feed).execute()
            print("submitted", feed)
    report(svc)


main()
