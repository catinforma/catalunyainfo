# Submit sitemap URLs to IndexNow (Bing, Yandex...) filtered by path prefix.
# The publish route pings IndexNow only for database pages; programmatic
# routes (festius, eleccions...) are static and need this after a deploy.
# Usage: python scripts/indexnow-sitemap.py /ca/festius/ /es/festivos/ ...
import json, re, sys, urllib.request

HOST = "www.catalunyainfo.com"
KEY = "1b9cd1c5da114656a9bd9c3cc29740c6"  # public by design: served at /<key>.txt

prefixes = sys.argv[1:]
if not prefixes:
    sys.exit("usage: indexnow-sitemap.py <path prefix> [...]")
sitemap = urllib.request.urlopen(f"https://{HOST}/sitemap.xml", timeout=60).read().decode()
urls = [u for u in re.findall(r"<loc>([^<]+)</loc>", sitemap) if any(u.startswith(f"https://{HOST}{p}") for p in prefixes)]
if not urls:
    sys.exit("no sitemap URL matches those prefixes")
body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls[:10000]}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"content-type": "application/json; charset=utf-8"})
try:
    status = urllib.request.urlopen(req, timeout=30).status
except urllib.error.HTTPError as e:
    status = e.code
print(f"submitted {len(urls)} URLs, IndexNow status {status}")
