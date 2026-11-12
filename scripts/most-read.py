"""Writes src/lib/content/most-read.json: the most-read pages of each edition.

"El més llegit / Lo más leído / Most read" at the end of the answer-first
articles (src/components/MostRead.tsx) is read from this file, never from a
guess. Source: GA4 property 554310792, screen page views over the last 7 full
days (Europe/Madrid), one list per edition (/ca/, /es/, /en/).

Only pages that answer 200 on the live site right now are kept (no redirects,
no 404s), and only content pages: not the home pages, not query strings, not
the admin or API. The title is the page's H1 as the live site serves it at
refresh time (GA4's page title can be an older SEO title).

The file carries its own `asOf` (the last day counted); the page prints it,
and tests/most-read.test.ts fails when it is more than 14 days old, so the
block cannot quietly go stale. Refresh weekly:

    PY=~/.local/share/pipx/venvs/mcp-search-console/bin/python
    $PY -I scripts/most-read.py            # then commit the JSON and deploy

Auth is the same as scripts/snapshot.py (ADC or gcloud-oauth token).
"""
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

GA_PROPERTY = "properties/554310792"
HOST = "https://www.catalunyainfo.com"
LOCALES = ("ca", "es", "en")
PER_LOCALE = 5
DAYS = 7
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "lib", "content", "most-read.json")
# Cloudflare answers 403 to bare Python user agents.
UA = "Mozilla/5.0 (compatible; CatalunyaInfo most-read refresh; +https://www.catalunyainfo.com/)"


def _first(paths):
    for p in paths:
        p = os.path.expanduser(p)
        if os.path.exists(p):
            return p
    sys.exit("no token found in: " + ", ".join(paths))


def ga():
    tok = _first([
        "~/.config/gcloud/application_default_credentials.json",
        "~/.config/gcloud-oauth/analytics-token.json",
    ])
    return build("analyticsdata", "v1beta", cache_discovery=False, credentials=Credentials.from_authorized_user_file(tok))


def is_content(path, locale):
    if not path.startswith(f"/{locale}/") or "?" in path or "#" in path:
        return False
    rest = path[len(locale) + 2:].strip("/")
    # The home page, the admin and the API are not "articles".
    return bool(rest) and not rest.startswith(("admin", "api")) and path.endswith("/")


def live_h1(path):
    """The page's H1 as the live site serves it now, or None if it is not a 200 at that URL."""
    req = urllib.request.Request(HOST + path, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            if res.status != 200 or res.geturl().rstrip("/") != (HOST + path).rstrip("/"):
                return None
            page = res.read().decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError):
        return None
    m = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
    if not m:
        return None
    return html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() or None


def main():
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=DAYS - 1)
    report = ga().properties().runReport(property=GA_PROPERTY, body={
        "dateRanges": [{"startDate": start.isoformat(), "endDate": end.isoformat()}],
        "dimensions": [{"name": "pagePath"}],
        "metrics": [{"name": "screenPageViews"}],
        "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
        "limit": 400,
    }).execute()
    rows = [
        {"path": r["dimensionValues"][0]["value"], "views": int(r["metricValues"][0]["value"])}
        for r in report.get("rows", [])
    ]

    items = {}
    for locale in LOCALES:
        picked = []
        for row in rows:
            if len(picked) >= PER_LOCALE:
                break
            if not is_content(row["path"], locale):
                continue
            title = live_h1(row["path"])
            if not title:
                print("skip (not 200 on the live site, or no H1):", row["path"], file=sys.stderr)
                continue
            picked.append({"path": row["path"], "title": title})
        items[locale] = picked
        print(locale, len(picked), file=sys.stderr)

    data = {
        "source": f"GA4 {GA_PROPERTY}, screenPageViews, {start.isoformat()} to {end.isoformat()}",
        "from": start.isoformat(),
        "asOf": end.isoformat(),
        "items": items,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("wrote", os.path.normpath(OUT), file=sys.stderr)


if __name__ == "__main__":
    main()
