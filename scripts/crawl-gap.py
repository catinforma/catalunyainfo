# Google last-crawl date vs sitemap lastmod for every sitemap URL (URL Inspection API).
# Usage: python scripts/crawl-gap.py out.json   (GSC token as in growth-pull.py; ~2000 inspections/day quota)
import json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
sys.stdout.reconfigure(encoding="utf-8")
SITE = "sc-domain:catalunyainfo.com"
tok = next(os.path.expanduser(p) for p in (r"~\.config\gcloud-oauth\google-token.json", r"~\AppData\Local\mcp-gsc\mcp-gsc\token.json") if os.path.exists(os.path.expanduser(p)))
creds = Credentials.from_authorized_user_file(tok)
sm = urllib.request.urlopen("https://www.catalunyainfo.com/sitemap.xml", timeout=60).read().decode()
entries = []
for u in re.findall(r"<url>(.*?)</url>", sm, re.S):
    loc = re.search(r"<loc>(.*?)</loc>", u).group(1)
    lm = re.search(r"<lastmod>(.*?)</lastmod>", u)
    entries.append((loc, lm.group(1)[:10] if lm else ""))

def inspect(e):
    loc, lastmod = e
    svc = build("searchconsole", "v1", cache_discovery=False, credentials=creds)
    try:
        r = svc.urlInspection().index().inspect(body={"inspectionUrl": loc, "siteUrl": SITE}).execute()
        ir = r["inspectionResult"]["indexStatusResult"]
        return {"url": loc, "lastmod": lastmod, "crawled": (ir.get("lastCrawlTime") or "")[:10], "coverage": ir.get("coverageState", ""), "verdict": ir.get("verdict", "")}
    except Exception as ex:
        return {"url": loc, "lastmod": lastmod, "crawled": "", "coverage": "ERR " + str(ex)[:80], "verdict": ""}

with ThreadPoolExecutor(5) as ex:
    rows = list(ex.map(inspect, entries))
json.dump(rows, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "inspected")
