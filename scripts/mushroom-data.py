"""Meteocat figures for the weekly mushroom report.

Pulls daily XEMA readings from the Generalitat open-data portal (Socrata) and
prints rainfall per station and comarca for the periods the report quotes.
Read-only and keyless. Source: Servei Meteorològic de Catalunya.

    python scripts/mushroom-data.py 2026-09-01 2026-10-06 [recent_days]
"""
import json
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, timedelta

DAILY = "https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json"
STATIONS = "https://analisi.transparenciacatalunya.cat/resource/yqwd-vj5e.json"
PPT, TMIN = "1300", "1002"  # daily accumulated precipitation, daily minimum


def get(url, **params):
    q = urllib.parse.urlencode(params)
    with urllib.request.urlopen(url + "?" + q, timeout=60) as r:
        return json.load(r)


def daily(var, start, end):
    rows, offset = [], 0
    while True:
        page = get(DAILY, **{
            "$select": "codi_estacio,data_lectura,valor",
            "$where": "codi_variable='%s' AND data_lectura between '%sT00:00:00' and '%sT00:00:00'"
                      % (var, start, end),
            "$limit": 50000, "$offset": offset})
        rows += page
        if len(page) < 50000:
            return rows
        offset += 50000


start, end = sys.argv[1], sys.argv[2]
recent = int(sys.argv[3]) if len(sys.argv) > 3 else 7
recent_from = (date.fromisoformat(end) - timedelta(days=recent - 1)).isoformat()

meta = {s["codi_estacio"]: s for s in get(STATIONS, **{"$limit": 5000})}
total, last, days = defaultdict(float), defaultdict(float), defaultdict(set)
by_month = defaultdict(lambda: defaultdict(float))
for r in daily(PPT, start, end):
    c, d, v = r["codi_estacio"], r["data_lectura"][:10], float(r["valor"])
    total[c] += v
    by_month[c][d[:7]] += v
    days[c].add(d)
    if d >= recent_from:
        last[c] += v
tmin = defaultdict(list)
for r in daily(TMIN, recent_from, end):
    tmin[r["codi_estacio"]].append(float(r["valor"]))

months = sorted({m for c in by_month for m in by_month[c]})
print("Meteocat XEMA, %s .. %s; recent = last %d days from %s" % (start, end, recent, recent_from))
print("comarca | station | alt | " + " | ".join(months) + " | total | recent | mean Tmin recent | days")
for c in sorted(total, key=lambda c: (meta.get(c, {}).get("nom_comarca", "?"), -total[c])):
    m = meta.get(c, {})
    t = tmin.get(c)
    print(" | ".join([m.get("nom_comarca", "?"), m.get("nom_estacio", c), m.get("altitud", "?")]
                     + ["%.1f" % by_month[c][mo] for mo in months]
                     + ["%.1f" % total[c], "%.1f" % last[c],
                        "%.1f" % (sum(t) / len(t)) if t else "-", str(len(days[c]))]))
