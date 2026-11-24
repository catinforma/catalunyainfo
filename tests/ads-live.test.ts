import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { AD_FREE_PATHS, AD_SLOTS, ADS_LIVE, adClient, allowsAdUnits, isAdFreePath } from "../src/lib/ads/config.ts";
import { contentSecurityPolicy } from "../src/lib/security-headers.ts";

/*
 * AdSense went live on 24 Nov 2026 (lib/ads/config.ts). These pin the rules
 * the owner agreed to: Google's certified consent tool, few units, none above
 * the answer, none on the REE PVPC pages.
 */

test("no ad on the pages that show Red Eléctrica PVPC data", () => {
  assert.deepEqual([...AD_FREE_PATHS].sort(), [
    "/ca/avui/",
    "/ca/preu-llum/",
    "/ca/preu-llum/dema/",
    "/en/electricity-price-spain/",
    "/en/electricity-price-spain/tomorrow/",
    "/en/today/",
    "/es/hoy/",
    "/es/precio-luz/",
    "/es/precio-luz/manana/",
  ]);
  assert.ok(isAdFreePath("/es/precio-luz"));
  assert.ok(isAdFreePath("/es/precio-luz/?x=1"));
  assert.ok(!isAdFreePath("/es/precio-butano/"));
  for (const p of AD_FREE_PATHS) assert.ok(!allowsAdUnits(p), p);
});

test("units: none on the legal pages; allowed on content pages and, since 24 Nov (owner), the home pages", () => {
  for (const p of ["/ca/legal/privacitat/", "/es/legal/cookies/"]) assert.ok(!allowsAdUnits(p), p);
  for (const p of ["/ca/", "/es/", "/en/"]) assert.ok(allowsAdUnits(p), p);
  for (const p of ["/es/guias/huelgas-espana/", "/es/festivos/2027/", "/ca/calculadores/sou-net/"]) assert.ok(allowsAdUnits(p), p);
});

test("slots and client", () => {
  assert.equal(ADS_LIVE, true);
  assert.match(AD_SLOTS.middle, /^\d{10}$/);
  assert.match(AD_SLOTS.end, /^\d{10}$/);
  assert.ok(AD_SLOTS.side === null || /^\d{10}$/.test(AD_SLOTS.side));
  assert.equal(adClient("pub-1234567890123456"), "ca-pub-1234567890123456");
  assert.equal(adClient(null), null);
});

test("the CSP opens to HTTPS only while ads are live, and keeps the rest closed", () => {
  const on = contentSecurityPolicy(false, true);
  const off = contentSecurityPolicy(false, false);
  for (const dir of ["script-src", "frame-src", "connect-src", "style-src", "font-src"]) {
    const d = on.split("; ").find((x) => x.startsWith(dir))!;
    assert.match(d, / https:( |$)/, `${dir} open with ads`);
    assert.doesNotMatch(off.split("; ").find((x) => x.startsWith(dir))!, / https:( |$)/, `${dir} closed without ads`);
  }
  for (const keep of ["object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"]) {
    assert.ok(on.includes(keep), keep);
  }
  assert.doesNotMatch(on, /http:|data: 'unsafe-eval'|script-src[^;]*data:/);
});

test("the runtime follows the placement rules", () => {
  const src = readFileSync(new URL("../src/components/AdsRuntime.tsx", import.meta.url), "utf8");
  // In-article units: after the first section (never above the answer), past half a screen, a screen apart.
  assert.match(src, /if \(body\.length >= 2 && chars >= 2000\) candidates\.push\(body\[1\]!\)/);
  assert.match(src, /if \(body\.length >= 5 && chars >= 3000\)/);
  assert.match(src, /if \(top > half && far\(top\)\)/);
  assert.match(src, /Math\.abs\(t - top\) > viewport\) && endTop - top > viewport/);
  // REE guard and pause.
  assert.match(src, /pauseAdRequests = paused \? 1 : 0/);
  assert.match(src, /if \(window\.__ciAdsActive\) window\.location\.reload\(\)/);
  // Script injected after hydration, not in the server HTML.
  assert.match(src, /document\.head\.append\(s\)/);
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.ci-ad:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\)/);
});

test("measurement waits for Google's consent tool when ads are live", () => {
  const gate = readFileSync(new URL("../src/components/ConsentGate.tsx", import.meta.url), "utf8");
  assert.match(gate, /if \(cmp\) return measurementId \? <CmpMeasurement/);
  assert.match(gate, /signals\?\.analytics_storage !== "granted"\) return null/);
  const client = readFileSync(new URL("../src/lib/ads/client.ts", import.meta.url), "utf8");
  assert.match(client, /s === CONSENT_MODE_GRANTED \? "granted" : "denied"/);
});

test("server-rendered slots: top of every article and two on the home page, boxes in the HTML (no layout shift)", () => {
  const read = (f: string) => readFileSync(new URL(f, import.meta.url), "utf8");
  assert.match(read("../src/components/pages/EntryArticle.tsx"), /<AdSlot kind="top" locale=\{locale\} path=\{entry\.href\} \/>/);
  const home = read("../src/app/(public)/[locale]/page.tsx");
  assert.match(home, /<AdSlot kind="home-top"/);
  assert.match(home, /<AdSlot kind="home-end"/);
  assert.match(read("../src/components/AdsRuntime.tsx"), /querySelectorAll<HTMLElement>\("\[data-ci-ad\]"\)/);
  assert.match(read("../src/app/globals.css"), /\.ci-ad-top,\s*\.ci-ad-home-top \{\s*min-height: 250px/);
});
