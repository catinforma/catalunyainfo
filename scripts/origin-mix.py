#!/usr/bin/env python3
"""What reaches the origin: request mix, status, latency, from Caddy's JSON access log.

Read-only, standard library only. Everything in Caddy's log got past Cloudflare
(a Cloudflare HIT never reaches the VPS), so this is the origin's load.

    sudo tail -n 50000 /var/log/caddy/catalunyainfo.access.log | python3 -I scripts/origin-mix.py --minutes 15
    sudo zcat -f /var/log/caddy/catalunyainfo.access*.log* | python3 -I scripts/origin-mix.py --day 2026-11-29

Classes: html, rsc-prefetch / rsc-nav (`_rsc` or the `rsc: 1` header),
image (/_next/image, /img/), static (/_next/static), redirect, api, other.
`next` is X-Nextjs-Cache (HIT/STALE/MISS from Next's ISR cache; absent on
dynamic renders). See docs/HIGH_TRAFFIC_RUNBOOK.md.
"""
import argparse
import collections
import datetime
import json
import sys
import time

ap = argparse.ArgumentParser()
ap.add_argument("--minutes", type=float, help="only the last N minutes")
ap.add_argument("--day", help="only this local (Madrid) date, YYYY-MM-DD")
ap.add_argument("--tz-offset", type=float, default=1.0, help="hours from UTC for --day (CET = 1)")
ap.add_argument("--top", type=int, default=10)
args = ap.parse_args()

tz = datetime.timezone(datetime.timedelta(hours=args.tz_offset))
since = time.time() - args.minutes * 60 if args.minutes else None


def header(headers, name):
    for key, value in (headers or {}).items():
        if key.lower() == name:
            return value[0] if isinstance(value, list) and value else value
    return None


def pct(values, p):
    if not values:
        return float("nan")
    values = sorted(values)
    return values[min(len(values) - 1, int(round(p / 100 * (len(values) - 1))))]


n = collections.Counter()
dur = collections.defaultdict(list)
nextc = collections.defaultdict(collections.Counter)
status = collections.Counter()
slow = collections.defaultdict(list)
errors = collections.Counter()
first = last = None

for line in sys.stdin:
    try:
        r = json.loads(line)
    except ValueError:
        continue
    if r.get("msg") != "handled request":
        continue
    ts = r.get("ts", 0)
    if since and ts < since:
        continue
    if args.day and datetime.datetime.fromtimestamp(ts, tz).strftime("%Y-%m-%d") != args.day:
        continue
    req = r.get("request", {})
    if req.get("host") != "www.catalunyainfo.com":
        continue
    first = ts if first is None else min(first, ts)
    last = ts if last is None else max(last, ts)
    path, _, query = req.get("uri", "").partition("?")
    rh = req.get("headers", {})
    resp = r.get("resp_headers", {}) or {}
    st = int(r.get("status", 0))
    d = float(r.get("duration", 0.0))
    ctype = (header(resp, "content-type") or "").split(";")[0]
    if path.startswith("/_next/static/"):
        c = "static"
    elif path.startswith("/_next/image") or path.startswith("/img/"):
        c = "image"
    elif "_rsc=" in query or header(rh, "rsc") == "1":
        prefetch = header(rh, "next-router-prefetch") == "1" or header(rh, "next-router-segment-prefetch")
        c = "rsc-prefetch" if prefetch else "rsc-nav"
    elif path.startswith("/api/"):
        c = "api"
    elif 300 <= st < 400:
        c = "redirect"
    elif ctype == "text/html":
        c = "html"
    else:
        c = "other"
    n[c] += 1
    dur[c].append(d)
    nextc[c][header(resp, "x-nextjs-cache") or "-"] += 1
    status[f"{st // 100}xx"] += 1
    if st >= 500 or st == 0:
        errors[(st, path)] += 1
    if c in ("html", "rsc-prefetch", "rsc-nav", "api"):
        slow[(c, path)].append(d)

total = sum(n.values())
if not total:
    sys.exit("no www requests in the selection")
span = max(1.0, (last - first)) if first is not None else 1.0
print(f"{total} requests over {span / 60:.1f} min = {total / span:.1f} req/s at the origin;  status {dict(status)}")
print(f"{'class':13} {'n':>7} {'share':>6} {'p50 ms':>7} {'p95 ms':>7} {'p99 ms':>7}  next cache")
for c, count in n.most_common():
    d = dur[c]
    print(f"{c:13} {count:7d} {100 * count / total:5.1f}% {1000 * pct(d, 50):7.0f} {1000 * pct(d, 95):7.0f} {1000 * pct(d, 99):7.0f}  {dict(nextc[c].most_common(4))}")
if errors:
    print("5xx / aborted:", errors.most_common(args.top))
print(f"top {args.top} paths by total origin time (html, rsc, api):")
for (c, path), d in sorted(slow.items(), key=lambda kv: -sum(kv[1]))[: args.top]:
    print(f"  {sum(d):7.1f}s  n={len(d):5d}  p95 {1000 * pct(d, 95):5.0f} ms  {c:12} {path}")
