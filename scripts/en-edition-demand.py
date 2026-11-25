"""Evidence for opening an English edition of a Christmas-market town or a weekend zone.

Read-only. Same credentials as scripts/snapshot.py.

    PY=~/.local/share/pipx/venvs/mcp-search-console/bin/python
    $PY -I scripts/en-edition-demand.py [days]        # default 28

Per town / zone, over the window (GSC lags 2 days; GA4 to yesterday):
  - en_impr   impressions of English-language queries (heuristic below) on any page of that town/zone (ca, es, en)
  - en_page   impressions of the existing /en/ page of that town/zone (any query)
  - ai        GA4 "AI Assistant" sessions landing on the town's/zone's ca/es/en family pages
  - ai_en     the same, browser language English
  - en_lang   sessions of any channel with browser language English landing on the ca/es pages

Threshold used on 25 Nov 2026 (docs/SEO_EXPERIMENTS.md): open an English edition only if
en_impr >= 50 in 28 days, or ai_en >= 10 in 28 days, or en_lang >= 10 in 28 days, on the
ca/es/en pages of that town or zone. Re-run on the review date.
"""
import os
import re
import sys
from collections import defaultdict
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import snapshot as S  # noqa: E402

FAIR_RX = re.compile(r"/(?:fires-de-nadal|mercados-navidad|christmas-markets)/([^/?#]+)")
WEEKEND_RX = re.compile(r"/(?:cap-de-setmana|fin-de-semana|weekend)/([^/?#]+)")
# weekend slugs that differ per language -> one zone key
ZONE_ALIAS = {"pirineo": "pirineu", "costa-dorada": "costa-daurada", "provincia-de-barcelona": "provincia-de-barcelona"}

EN_WORDS = re.compile(r"\b(christmas|xmas|market|markets|weekend|things to do|what to do|events|fair|fairs|festival|visit|trip|from barcelona|near me|in december|best|opening|dates|hours|tickets|how to|where|when|the|and|to|of|for|with|free|activities|lights)\b", re.I)
LOCAL_WORDS = re.compile(r"\b(mercat|mercado|mercados|fires|feria|ferias|navidad|nadal|fin de semana|cap de setmana|que hacer|què fer|de|del|la|el|els|les|en|a|per|para|horari|horario|belén|pessebre|pesebre|hoy|avui|este|aquest)\b", re.I)


def english_query(q):
    return bool(EN_WORDS.search(q)) and not LOCAL_WORDS.search(q)


def key_of(path):
    for kind, rx in (("fair", FAIR_RX), ("weekend", WEEKEND_RX)):
        m = rx.search(path)
        if m:
            return kind, ZONE_ALIAS.get(m.group(1), m.group(1))
    return None


def main():
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 28
    end = date.today() - timedelta(days=2)
    start = end - timedelta(days=days - 1)
    stats = defaultdict(lambda: defaultdict(int))
    g = S.gsc()
    for sub in ("/fires-de-nadal/", "/mercados-navidad/", "/christmas-markets/", "/cap-de-setmana/", "/fin-de-semana/", "/en/weekend/"):
        rows = S.q(g, start, end, ["page", "query"], 25000, [{"dimension": "page", "operator": "contains", "expression": sub}])
        for r in rows:
            page, query = r["keys"]
            k = key_of(S.short(page))
            if not k:
                continue
            if english_query(query):
                stats[k]["en_impr"] += r["impressions"]
            if "/en/" in page:
                stats[k]["en_page"] += r["impressions"]
    ga = S.ga()
    gend = date.today() - timedelta(days=1)
    body = {"dateRanges": [{"startDate": str(gend - timedelta(days=days - 1)), "endDate": str(gend)}],
            "dimensions": [{"name": "landingPage"}, {"name": "language"}, {"name": "sessionDefaultChannelGroup"}],
            "metrics": [{"name": "sessions"}], "limit": 100000}
    for r in ga.properties().runReport(property=S.GA_PROPERTY, body=body).execute().get("rows", []):
        path, lang, ch = (d["value"] for d in r["dimensionValues"])
        k = key_of(path)
        if not k:
            continue
        n = int(r["metricValues"][0]["value"])
        en = lang.lower().startswith("en")
        if ch == "AI Assistant":
            stats[k]["ai"] += n
            if en:
                stats[k]["ai_en"] += n
        if en and not path.startswith("/en/"):
            stats[k]["en_lang"] += n
    print(f"window GSC {start}..{end}, GA4 to {gend}  (threshold: en_impr>=50 or ai_en>=10 or en_lang>=10)")
    print(f"{'kind':8s} {'town/zone':26s} {'en_impr':>7s} {'en_page':>7s} {'ai':>4s} {'ai_en':>5s} {'en_lang':>7s}  open?")
    for k, a in sorted(stats.items(), key=lambda kv: -(kv[1]["en_impr"] + kv[1]["ai_en"] + kv[1]["en_lang"] + kv[1]["en_page"]))[:40]:
        go = a["en_impr"] >= 50 or a["ai_en"] >= 10 or a["en_lang"] >= 10
        print(f"{k[0]:8s} {k[1]:26s} {a['en_impr']:7d} {a['en_page']:7d} {a['ai']:4d} {a['ai_en']:5d} {a['en_lang']:7d}  {'YES' if go else 'no'}")


if __name__ == "__main__":
    main()
