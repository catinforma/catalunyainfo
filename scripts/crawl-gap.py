# Google's view of our URLs through the URL Inspection API: index coverage, last crawl vs sitemap lastmod,
# Google-selected vs declared canonical, robots/fetch state.
#
#   python scripts/crawl-gap.py out.json                 every sitemap URL (~2000 inspections/day quota)
#   python scripts/crawl-gap.py out.json urls.txt        only the URLs in urls.txt (one per line, # comments)
#
# GSC token as in snapshot.py (Linux mcp-gsc token, scripts/google-auth.py token, Windows mcp-gsc token).
# On the VPS: ~/.local/share/pipx/venvs/mcp-search-console/bin/python -I scripts/crawl-gap.py out.json urls.txt
import json, os, re, sys, urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
sys.stdout.reconfigure(encoding="utf-8")
SITE = "sc-domain:catalunyainfo.com"
TOKENS = (
    os.path.join("~", ".config", "mcp-gsc", "token.json"),
    os.path.join("~", ".config", "gcloud-oauth", "google-token.json"),
    os.path.join("~", "AppData", "Local", "mcp-gsc", "mcp-gsc", "token.json"),
)
tok = next((os.path.expanduser(p) for p in TOKENS if os.path.exists(os.path.expanduser(p))), None)
if not tok:
    sys.exit("no GSC token in: " + ", ".join(TOKENS))
creds = Credentials.from_authorized_user_file(tok)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"}
sm = urllib.request.urlopen(urllib.request.Request("https://www.catalunyainfo.com/sitemap.xml", headers=UA), timeout=60).read().decode()
lastmods = {}
for u in re.findall(r"<url>(.*?)</url>", sm, re.S):
    loc = re.search(r"<loc>(.*?)</loc>", u).group(1)
    lm = re.search(r"<lastmod>(.*?)</lastmod>", u)
    lastmods[loc] = lm.group(1)[:10] if lm else ""

if len(sys.argv) > 2:
    wanted = [l.strip() for l in open(sys.argv[2], encoding="utf-8") if l.strip() and not l.startswith("#")]
else:
    wanted = list(lastmods)


def inspect(loc):
    svc = build("searchconsole", "v1", cache_discovery=False, credentials=creds)
    row = {"url": loc, "inSitemap": loc in lastmods, "lastmod": lastmods.get(loc, "")}
    try:
        r = svc.urlInspection().index().inspect(body={"inspectionUrl": loc, "siteUrl": SITE}).execute()
        ir = r["inspectionResult"]["indexStatusResult"]
        row.update({
            "verdict": ir.get("verdict", ""),
            "coverage": ir.get("coverageState", ""),
            "indexing": ir.get("indexingState", ""),
            "robots": ir.get("robotsTxtState", ""),
            "fetch": ir.get("pageFetchState", ""),
            "crawled": (ir.get("lastCrawlTime") or "")[:10],
            "crawledAs": ir.get("crawledAs", ""),
            "googleCanonical": ir.get("googleCanonical", ""),
            "userCanonical": ir.get("userCanonical", ""),
            "referrers": len(ir.get("referringUrls", []) or []),
            "sitemaps": ir.get("sitemap", []) or [],
        })
    except Exception as ex:
        row.update({"verdict": "", "coverage": "ERR " + str(ex)[:120]})
    return row


with ThreadPoolExecutor(4) as ex:
    rows = list(ex.map(inspect, wanted))
json.dump(rows, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "inspected")
for state, n in Counter(r["coverage"] for r in rows).most_common():
    print("%4d  %s" % (n, state))
for r in rows:
    if r.get("googleCanonical") and r.get("userCanonical") and r["googleCanonical"] != r["userCanonical"]:
        print("canonical differs:", r["url"], "->", r["googleCanonical"])
