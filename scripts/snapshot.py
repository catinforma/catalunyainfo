"""Compact Search Console + GA4 snapshots: small tables instead of raw API JSON.

Read-only. Built to keep agent context small: every command prints at most a
few dozen short lines. Works on the VPS (Linux) and on the owner's Windows PC.

    PY=~/.local/share/pipx/venvs/mcp-search-console/bin/python   # has the Google libs
    $PY scripts/snapshot.py pace                 # 1M-impressions goal (30 Oct - 15 Nov)
    $PY scripts/snapshot.py daily [days]         # GSC per day (+ GA4 sessions)
    $PY scripts/snapshot.py pages [days] [n]     # top pages, with CTR vs the site's curve
    $PY scripts/snapshot.py ctr [days] [minImpr] # pages far below the site's CTR-by-position curve
    $PY scripts/snapshot.py rising [days] [n]    # queries/pages: last N days vs the N before
    $PY scripts/snapshot.py gaps [days] [n]      # queries with impressions at pos > 8 (striking distance)
    $PY scripts/snapshot.py page <substr> [days] # one page (or family): per-day + top queries
    $PY scripts/snapshot.py audience [days]      # GA4: device, country, city, language, age, gender, channel
    $PY scripts/snapshot.py families [days]      # impressions by URL family (/es/festivos/dia/, ...)
    $PY scripts/snapshot.py channel [days]       # GA4: WhatsApp channel visits (utm whatsapp / channel), per day + pages
    $PY scripts/snapshot.py landing [start end]  # GA4: pages/session by landing-page family + "next useful step" and town-hub clicks
    $PY scripts/snapshot.py towns [start end]    # per-town pages (holidays, fairs, elections): GSC, GA4 views/session, town-hub clicks

GSC data lags ~2 days; the last day is partial. Dates are Europe/Madrid.
"""
import os
import re
import sys
from collections import defaultdict
from datetime import date, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SITE = "sc-domain:catalunyainfo.com"
GA_PROPERTY = "properties/554310792"
HOST = "https://www.catalunyainfo.com"
GOAL_START, GOAL_END, GOAL = date(2026, 10, 30), date(2026, 11, 15), 1_000_000


def _first(paths):
    for p in paths:
        p = os.path.expanduser(p)
        if os.path.exists(p):
            return p
    sys.exit("no token found in: " + ", ".join(paths))


def _home(*parts):
    return os.path.join(os.path.expanduser("~"), *parts)


def gsc():
    tok = _first([
        _home(".config", "mcp-gsc", "token.json"),                       # Linux (mcp-gsc server)
        _home(".config", "gcloud-oauth", "google-token.json"),           # scripts/google-auth.py
        _home("AppData", "Local", "mcp-gsc", "mcp-gsc", "token.json"),   # Windows (mcp-gsc server)
    ])
    return build("searchconsole", "v1", cache_discovery=False, credentials=Credentials.from_authorized_user_file(tok))


def ga():
    tok = _first([
        _home(".config", "gcloud", "application_default_credentials.json"),
        _home(".config", "gcloud-oauth", "analytics-token.json"),
    ])
    return build("analyticsdata", "v1beta", cache_discovery=False, credentials=Credentials.from_authorized_user_file(tok))


def q(svc, start, end, dims, limit=25000, filters=None):
    body = {"startDate": str(start), "endDate": str(end), "dimensions": dims, "rowLimit": limit, "dataState": "all"}
    if filters:
        body["dimensionFilterGroups"] = [{"filters": filters}]
    return svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get("rows", [])


def short(url):
    return url.replace(HOST, "")


def window(days):
    end = date.today()
    return end - timedelta(days=days - 1), end


def curve(rows):
    """Site's own expected CTR per rounded position (impression-weighted), pos 1..20."""
    acc = defaultdict(lambda: [0, 0])
    for r in rows:
        b = min(20, max(1, round(r["position"])))
        acc[b][0] += r["clicks"]
        acc[b][1] += r["impressions"]
    return {b: (c / i if i else 0) for b, (c, i) in acc.items()}


def fmt(r, w=70):
    return "%s %6d %8d %5.1f%% %5.1f" % (short(r["keys"][0])[:w].ljust(w), r["clicks"], r["impressions"],
                                          100 * r["ctr"], r["position"])


HEAD = "%s %6s %8s %6s %5s" % ("".ljust(70), "clicks", "impr", "ctr", "pos")


def cmd_pace(_):
    s = gsc()
    rows = q(s, GOAL_START, date.today(), ["date"])
    tot = sum(r["impressions"] for r in rows)
    clicks = sum(r["clicks"] for r in rows)
    last_full = rows[-2] if len(rows) > 1 else rows[-1]
    days_left = (GOAL_END - date.today()).days + 1
    need = max(0, GOAL - tot) / max(1, days_left)
    print("goal 1M impr %s..%s | so far %s impr, %s clicks, CTR %.2f%%" % (
        GOAL_START, GOAL_END, f"{tot:,}", f"{clicks:,}", 100 * clicks / max(1, tot)))
    print("last full day %s: %s impr | days left (incl. today) %d | need %s/day" % (
        last_full["keys"][0], f"{last_full['impressions']:,}", days_left, f"{need:,.0f}"))


def cmd_daily(a):
    days = int(a[0]) if a else 14
    start, end = window(days)
    rows = q(gsc(), start, end, ["date"])
    sess = {}
    try:
        r = ga().properties().runReport(property=GA_PROPERTY, body={
            "dateRanges": [{"startDate": str(start), "endDate": str(end)}], "dimensions": [{"name": "date"}],
            "metrics": [{"name": "sessions"}]}).execute()
        sess = {x["dimensionValues"][0]["value"]: x["metricValues"][0]["value"] for x in r.get("rows", [])}
    except Exception as e:  # GA4 optional
        print("(GA4 unavailable: %s)" % str(e)[:80])
    print("date        clicks    impr    ctr   pos  ga4sess")
    for r in rows:
        d = r["keys"][0]
        print("%s %7d %8d %5.2f%% %5.1f %7s" % (d, r["clicks"], r["impressions"], 100 * r["ctr"], r["position"],
                                                  sess.get(d.replace("-", ""), "-")))


def cmd_pages(a):
    days = int(a[0]) if a else 7
    n = int(a[1]) if len(a) > 1 else 30
    start, end = window(days)
    rows = q(gsc(), start, end, ["page"])
    cv = curve(rows)
    print("%s..%s  %d pages with impressions" % (start, end, len(rows)))
    print(HEAD, " exp")
    for r in sorted(rows, key=lambda r: -r["impressions"])[:n]:
        exp = cv.get(min(20, max(1, round(r["position"])))), 0
        print(fmt(r), " %4.1f%%" % (100 * (exp[0] or 0)))


def cmd_ctr(a):
    days = int(a[0]) if a else 14
    min_impr = int(a[1]) if len(a) > 1 else 300
    start, end = window(days)
    rows = q(gsc(), start, end, ["page"])
    cv = curve(rows)
    out = []
    for r in rows:
        if r["impressions"] < min_impr or r["position"] > 20:
            continue
        exp = cv.get(min(20, max(1, round(r["position"]))), 0)
        if exp and r["ctr"] < 0.6 * exp:
            lost = int(r["impressions"] * exp - r["clicks"])
            out.append((lost, r, exp))
    print("%s..%s  CTR < 60%% of site curve, impr >= %d (sorted by clicks lost)" % (start, end, min_impr))
    print(HEAD, " exp  lost")
    for lost, r, exp in sorted(out, key=lambda x: -x[0])[:40]:
        print(fmt(r), " %4.1f%% %5d" % (100 * exp, lost))


def cmd_rising(a):
    days = int(a[0]) if a else 7
    n = int(a[1]) if len(a) > 1 else 30
    s = gsc()
    end = date.today() - timedelta(days=1)  # skip the partial day
    mid = end - timedelta(days=days)
    beg = mid - timedelta(days=days)
    for dim in ("query", "page"):
        now = {r["keys"][0]: r for r in q(s, mid + timedelta(days=1), end, [dim])}
        bef = {r["keys"][0]: r for r in q(s, beg + timedelta(days=1), mid, [dim])}
        diff = sorted(((now[k]["impressions"] - bef.get(k, {}).get("impressions", 0), k) for k in now), reverse=True)
        print("--- %s rising: %s..%s vs previous %d days   [Δimpr  impr  clicks  pos]" % (dim, mid + timedelta(days=1), end, days))
        for d, k in diff[:n]:
            r = now[k]
            print("  %+7d %7d %5d %5.1f  %s" % (d, r["impressions"], r["clicks"], r["position"], short(k)[:80]))


def cmd_gaps(a):
    days = int(a[0]) if a else 14
    n = int(a[1]) if len(a) > 1 else 40
    start, end = window(days)
    rows = q(gsc(), start, end, ["query", "page"])
    rows = [r for r in rows if r["position"] > 8 and r["position"] <= 30]
    print("%s..%s  striking distance (pos 8-30), by impressions   [impr clicks pos  query -> page]" % (start, end))
    for r in sorted(rows, key=lambda r: -r["impressions"])[:n]:
        print("  %6d %4d %5.1f  %s -> %s" % (r["impressions"], r["clicks"], r["position"], r["keys"][0][:55],
                                            short(r["keys"][1])[:60]))


def cmd_page(a):
    sub = a[0]
    days = int(a[1]) if len(a) > 1 else 14
    start, end = window(days)
    s = gsc()
    f = [{"dimension": "page", "operator": "contains", "expression": sub}]
    print("pages containing %r  %s..%s" % (sub, start, end))
    for r in q(s, start, end, ["date"], filters=f):
        print("  %s %6d %7d %5.1f%% %5.1f" % (r["keys"][0], r["clicks"], r["impressions"], 100 * r["ctr"], r["position"]))
    print("--- queries")
    for r in sorted(q(s, start, end, ["query"], filters=f), key=lambda r: -r["impressions"])[:30]:
        print("  %6d %7d %5.1f%% %5.1f  %s" % (r["clicks"], r["impressions"], 100 * r["ctr"], r["position"], r["keys"][0][:80]))


def cmd_families(a):
    days = int(a[0]) if a else 7
    start, end = window(days)
    rows = q(gsc(), start, end, ["page"])
    fam = defaultdict(lambda: [0, 0, 0])
    for r in rows:
        parts = short(r["keys"][0]).strip("/").split("/")
        key = "/" + "/".join(parts[:3 if len(parts) > 3 and parts[2] in ("dia", "day", "comarca") else 2]) + "/"
        f = fam[key]
        f[0] += r["clicks"]; f[1] += r["impressions"]; f[2] += 1
    tot = sum(v[1] for v in fam.values()) or 1
    print("%s..%s  family                         pages  clicks     impr  share   ctr" % (start, end))
    for k, (c, i, p) in sorted(fam.items(), key=lambda x: -x[1][1])[:25]:
        print("  %-40s %5d %7d %8d %5.1f%% %5.2f%%" % (k[:40], p, c, i, 100 * i / tot, 100 * c / max(1, i)))


def cmd_audience(a):
    days = int(a[0]) if a else 28
    svc = ga()
    rng = [{"startDate": "%ddaysAgo" % days, "endDate": "yesterday"}]
    for dim in ("deviceCategory", "country", "city", "language", "userAgeBracket", "userGender",
                "newVsReturning", "sessionDefaultChannelGroup", "hour"):
        try:
            r = svc.properties().runReport(property=GA_PROPERTY, body={
                "dateRanges": rng, "dimensions": [{"name": dim}],
                "metrics": [{"name": "activeUsers"}, {"name": "sessions"}, {"name": "engagementRate"}],
                "orderBys": [{"metric": {"metricName": "activeUsers"}, "desc": True}], "limit": 12}).execute()
        except Exception as e:
            print("--- %s: %s" % (dim, str(e)[:80]))
            continue
        rows = r.get("rows", [])
        tot = sum(int(x["metricValues"][0]["value"]) for x in rows) or 1
        print("--- %s" % dim)
        for x in rows:
            u = int(x["metricValues"][0]["value"])
            print("  %-28s users %6d (%4.1f%%)  sess %6s  engaged %4.0f%%" % (
                x["dimensionValues"][0]["value"][:28], u, 100 * u / tot, x["metricValues"][1]["value"],
                100 * float(x["metricValues"][2]["value"])))


def cmd_channel(a):
    """GA4: visits from the WhatsApp channel's daily post (utm_source=whatsapp, utm_medium=channel)."""
    days = int(a[0]) if a else 28
    svc = ga()
    rng = [{"startDate": "%ddaysAgo" % days, "endDate": "today"}]
    flt = {"andGroup": {"expressions": [
        {"filter": {"fieldName": "sessionSource", "stringFilter": {"value": "whatsapp"}}},
        {"filter": {"fieldName": "sessionMedium", "stringFilter": {"value": "channel"}}}]}}
    mets = [{"name": "sessions"}, {"name": "activeUsers"}, {"name": "engagementRate"}]
    for dims, n in ((["date"], days), (["sessionManualAdContent"], 5), (["landingPage"], 15)):
        r = svc.properties().runReport(property=GA_PROPERTY, body={
            "dateRanges": rng, "dimensions": [{"name": d} for d in dims], "metrics": mets,
            "dimensionFilter": flt, "limit": n,
            "orderBys": [{"dimension": {"dimensionName": "date"}}] if dims == ["date"]
            else [{"metric": {"metricName": "sessions"}, "desc": True}]}).execute()
        rows = r.get("rows", [])
        print("--- %s (whatsapp / channel, last %d days)" % (dims[0], days))
        if not rows:
            print("  (no sessions yet)")
        for x in rows:
            print("  %-60s sess %5s  users %5s  engaged %4.0f%%" % (
                x["dimensionValues"][0]["value"][:60], x["metricValues"][0]["value"],
                x["metricValues"][1]["value"], 100 * float(x["metricValues"][2]["value"])))


# Landing-page families for pages per session (docs/SEO_EXPERIMENTS.md, 18 Nov 2026, "Next useful step").
# First match wins, so the order matters (the leave planner lives under /festius/, the lights are Christmas).
LANDING_FAMILIES = [
    ("strikes", r"/(guias|guies|guides)/[^/]*(huelga|vag[au]|strike)"),
    ("elections", r"elecci|election|candidat|votar|vot-per-correu|voto-por-correo|postal-vote|mesa-electoral|polling"),
    ("christmas", r"mercados-navidad|mercats-de-nadal|christmas-markets|fires-de-nadal|llums-nadal|luces-navidad|christmas-lights|nadal-a-barcelona|navidad-en-barcelona|christmas-in-barcelona"),
    ("calculators", r"/(calculadoras|calculadores|calculators)(/|$)|/2027/(aprofitar-vacances|aprovechar-vacaciones|leave-planner)"),
    ("holidays", r"/(festivos|festius|holidays)(/|$)|puente|pont-|bridge|long-weekend|calendari|calendar|tiendas-abiertas|botigues|shops-open|festiu|festivo|holiday|lliure-disposicio|libre-disposicion|school-free|setmana-santa|semana-santa|easter"),
    ("barcelona", r"tarjetas-transporte|targetes-transport|transport-passes|aparcar|parking|zbe|low-emission|tasa-turistica|taxa-turistica|tourist-tax|aeropuerto|aeroport|airport|tiempo-barcelona|temps-barcelona|weather"),
]


def landing_family(path):
    if path in ("(not set)", ""):
        return "(no landing page)"
    for name, rx in LANDING_FAMILIES:
        if re.search(rx, path):
            return name
    return "other"


def _ga_rows(svc, body):
    rows, offset = [], 0
    while True:
        r = svc.properties().runReport(property=GA_PROPERTY, body=dict(body, limit=10000, offset=offset)).execute()
        got = r.get("rows", [])
        rows += got
        if len(got) < 10000:
            return rows
        offset += 10000


def cmd_landing(a):
    """GA4: pages per session by landing-page family, and clicks on the "next useful step" box and the town hub list.

    snapshot.py landing [start end]   ISO dates; default the 14 days to yesterday.
    """
    if len(a) >= 2:
        start, end = a[0], a[1]
    else:
        end_d = date.today() - timedelta(days=1)
        start, end = str(end_d - timedelta(days=13)), str(end_d)
    svc = ga()
    rng = [{"startDate": start, "endDate": end}]
    fam = defaultdict(lambda: [0, 0, 0])
    for x in _ga_rows(svc, {"dateRanges": rng, "dimensions": [{"name": "landingPage"}],
                            "metrics": [{"name": "sessions"}, {"name": "screenPageViews"}]}):
        f = fam[landing_family(x["dimensionValues"][0]["value"])]
        f[0] += int(x["metricValues"][0]["value"])
        f[1] += int(x["metricValues"][1]["value"])
        f[2] += 1
    views = defaultdict(int)
    for x in _ga_rows(svc, {"dateRanges": rng, "dimensions": [{"name": "pagePath"}], "metrics": [{"name": "screenPageViews"}]}):
        views[landing_family(x["dimensionValues"][0]["value"])] += int(x["metricValues"][0]["value"])
    clicks = defaultdict(int)
    hub = defaultdict(int)  # the town hub list (components/TownHub.tsx), since 18 Nov 2026
    try:
        for x in _ga_rows(svc, {
                "dateRanges": rng, "dimensions": [{"name": "pagePath"}, {"name": "customEvent:link_context"}],
                "metrics": [{"name": "eventCount"}],
                "dimensionFilter": {"filter": {"fieldName": "eventName", "stringFilter": {"value": "related_content_click"}}}}):
            ctx = x["dimensionValues"][1]["value"]
            if ctx in ("next_step", "town_hub"):
                (clicks if ctx == "next_step" else hub)[landing_family(x["dimensionValues"][0]["value"])] += int(x["metricValues"][0]["value"])
    except Exception as e:  # the event may have no rows yet
        print("(next_step clicks unavailable: %s)" % str(e)[:80])
    tot = svc.properties().runReport(property=GA_PROPERTY, body={
        "dateRanges": rng, "metrics": [{"name": "sessions"}, {"name": "screenPageViews"}]}).execute()["rows"][0]["metricValues"]
    ps, pv_all = int(tot[0]["value"]), int(tot[1]["value"])
    ts = sum(v[0] for k, v in fam.items())
    tv = sum(v[1] for k, v in fam.items())
    print("%s..%s  GA4 property: %d sessions, %d views, %.3f views/session" % (start, end, ps, pv_all, pv_all / ps if ps else 0))
    print("  by landing page (a session can count under two): %d sessions, %d views, %.3f" % (ts, tv, tv / ts if ts else 0))
    print("%-18s %8s %8s %7s %6s %10s %7s %8s %7s" % ("family", "sess", "views", "v/sess", "pages", "pageviews", "clicks", "clk/100v", "hub"))
    for k in sorted(fam, key=lambda k: -fam[k][0]):
        s, v, n = fam[k]
        pv, c = views.get(k, 0), clicks.get(k, 0)
        print("%-18s %8d %8d %7.3f %6d %10d %7d %8.2f %7d" % (k, s, v, v / s if s else 0, n, pv, c, 100 * c / pv if pv else 0, hub.get(k, 0)))


# Per-town pages of the three town families (town hubs, 18 Nov 2026: lib/engagement/town-hub.ts).
TOWN_FAMILIES = [
    ("holidays-ca", r"^/ca/festius/(?!dia/|comarca/|2027/)([a-z0-9-]+)/$"),
    ("holidays-es", r"^/es/festivos/(?!dia/|comarca/|2027/)([a-z0-9-]+)/$"),
    ("holidays-en", r"^/en/holidays/(?!day/|2027/)([a-z0-9-]+)/$"),
    ("fairs-ca", r"^/ca/fires-de-nadal/([a-z0-9-]+)/$"),
    ("fairs-es", r"^/es/mercados-navidad/([a-z0-9-]+)/$"),
    ("fairs-en", r"^/en/christmas-markets/([a-z0-9-]+)/$"),
    ("elections-ca", r"^/ca/eleccions/(?!comarca/)([a-z0-9-]+)/$"),
    ("elections-es", r"^/es/elecciones/(?!comarca/)([a-z0-9-]+)/$"),
    ("elections-en", r"^/en/elections/([a-z0-9-]+)/$"),
]


def town_family(path):
    path = path.split("?")[0].split("#")[0]
    if not path.endswith("/"):  # GA4 paths carry no trailing slash; GSC URLs do
        path += "/"
    for name, rx in TOWN_FAMILIES:
        m = re.match(rx, path)
        if m:
            return name, m.group(1)
    return None, None


def cmd_towns(a):
    """GSC + GA4 for the per-town pages: clicks, impressions, average position, pages; views per session
    by landing page; town_hub clicks; and which family is each town's strongest.

    snapshot.py towns [start end]   ISO dates; default the 28 days to today (GSC) / yesterday (GA4).
    """
    if len(a) >= 2:
        start, end = a[0], a[1]
    else:
        s0, e0 = window(28)
        start, end = str(s0), str(e0)
    fam = defaultdict(lambda: [0, 0, 0.0, 0])
    town = defaultdict(lambda: defaultdict(lambda: [0, 0]))
    for r in q(gsc(), start, end, ["page"]):
        name, slug = town_family(short(r["keys"][0]))
        if not name:
            continue
        f = fam[name]
        f[0] += r["clicks"]; f[1] += r["impressions"]; f[2] += r["position"] * r["impressions"]; f[3] += 1
        t = town[slug][name.split("-")[0]]
        t[0] += r["clicks"]; t[1] += r["impressions"]
    ga_end = min(end, str(date.today() - timedelta(days=1)))
    sess = defaultdict(lambda: [0, 0])
    hub = defaultdict(int)
    try:
        svc = ga()
        rng = [{"startDate": start, "endDate": ga_end}]
        for x in _ga_rows(svc, {"dateRanges": rng, "dimensions": [{"name": "landingPage"}],
                                "metrics": [{"name": "sessions"}, {"name": "screenPageViews"}]}):
            name, _ = town_family(x["dimensionValues"][0]["value"])
            if name:
                sess[name][0] += int(x["metricValues"][0]["value"])
                sess[name][1] += int(x["metricValues"][1]["value"])
        for x in _ga_rows(svc, {
                "dateRanges": rng, "dimensions": [{"name": "pagePath"}, {"name": "customEvent:link_context"}],
                "metrics": [{"name": "eventCount"}],
                "dimensionFilter": {"filter": {"fieldName": "eventName", "stringFilter": {"value": "related_content_click"}}}}):
            name, _ = town_family(x["dimensionValues"][0]["value"])
            if name and x["dimensionValues"][1]["value"] == "town_hub":
                hub[name] += int(x["metricValues"][0]["value"])
    except Exception as e:  # GA4 optional
        print("(GA4 unavailable: %s)" % str(e)[:80])
    print("GSC %s..%s, GA4 to %s" % (start, end, ga_end))
    print("%-13s %5s %6s %7s %6s %5s %7s %6s %6s" % ("family", "pages", "clicks", "impr", "ctr", "pos", "ga-sess", "v/sess", "hubclk"))
    for name, _ in TOWN_FAMILIES:
        c, i, w, n = fam[name]
        s, v = sess[name]
        print("%-13s %5d %6d %7d %5.2f%% %5.1f %7d %6.3f %6d" % (name, n, c, i, 100 * c / max(1, i), w / max(1, i), s, v / s if s else 0, hub[name]))
    win = defaultdict(int)
    for fs in town.values():
        win[max(fs.items(), key=lambda kv: (kv[1][1], kv[1][0]))[0]] += 1
    print("towns with impressions: %d; strongest family by impressions: %s" % (len(town), dict(win)))


CMDS = {k[4:]: v for k, v in globals().items() if k.startswith("cmd_")}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in CMDS:
        sys.exit(__doc__)
    CMDS[sys.argv[1]](sys.argv[2:])
