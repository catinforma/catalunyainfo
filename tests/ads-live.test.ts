import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { AD_FEED_LAYOUT_KEY, AD_FREE_PATHS, AD_SLOTS, ADS_LIVE, adClient, allowsAdUnits, isAdFreePath } from "../src/lib/ads/config.ts";
import { MAX_UNITS_PER_PAGE, UNIT_HEIGHT, planInArticle, unitBudget } from "../src/lib/ads/placement.ts";
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
  for (const id of [AD_SLOTS.middle, AD_SLOTS.middle2, AD_SLOTS.end, AD_SLOTS.top, AD_SLOTS.feed]) assert.match(id, /^\d{10}$/);
  assert.ok(AD_SLOTS.side === null || /^\d{10}$/.test(AD_SLOTS.side));
  // Owner's ids, 24 Nov 2026: ci-dalt, ci-mig-2, ci-portada.
  assert.equal(AD_SLOTS.top, "2586819556");
  assert.equal(AD_SLOTS.middle2, "7647574549");
  assert.equal(AD_SLOTS.feed, "8576552379");
  assert.equal(AD_FEED_LAYOUT_KEY, "-6t+ed+2i-1n-4w");
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
  // In-article units: planned by lib/ads/placement.ts, after the first section, every ~2 screens, five units at most.
  assert.match(src, /planInArticle\(\{ headings: body\.map\(topOf\), units, viewport, budget \}\)/);
  assert.match(src, /unitBudget\(boxes\.length \+ \(sideBox \? 1 : 0\)\)/);
  assert.match(src, /const slot = i === picks\[0\] \? AD_SLOTS\.middle : AD_SLOTS\.middle2/);
  // Never inside a table, list or block; never before the sources heading (only the headings above it are candidates).
  assert.match(src, /h2s\.slice\(0, h2s\.indexOf\(sources\)\)/);
  assert.match(src, /closest\("table, ul, ol, details"\)/);
  // The server boxes: top = ci-dalt (display auto, full-width responsive), feed = ci-portada (in-feed with its layout key).
  assert.match(src, /ins\.dataset\.adSlot = AD_SLOTS\.top;[^]*ins\.dataset\.adFormat = "auto";\s*ins\.dataset\.fullWidthResponsive = "true"/);
  assert.match(src, /ins\.dataset\.adSlot = AD_SLOTS\.feed;[^]*ins\.dataset\.adLayoutKey = AD_FEED_LAYOUT_KEY/);
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
  assert.match(read("../src/app/globals.css"), /\.ci-ad-top,\s*\.ci-ad-home-top \{[^}]*min-height: calc\(var\(--ci-ad-h\) \+ var\(--ci-ad-chrome\)\)/);
});

/* --- 24 Nov 2026 (night), owner: "more ads, even if they annoy; revenue matters" --- */

const read = (f: string) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");
const P = "components/programmatic/";

test("the home pages: top, one in-feed card in the first headlines grid, end", () => {
  const home = read("app/(public)/[locale]/page.tsx");
  assert.match(home, /<AdSlot kind="home-feed"/);
  assert.match(home, /i === 1 && key === feedKey/);
  // Not on the event list, and only in a grid with enough cards around it.
  assert.match(home, /s\.key !== "events" && s\.items\.length > 2/);
  const css = read("app/globals.css");
  assert.match(css, /\.ci-ad-home-feed \{[^}]*min-height: 300px/);
  assert.match(read("components/AdSlot.tsx"), /"top" \| "home-top" \| "home-feed" \| "home-end"/);
});

const TEMPLATES: Record<string, number> = {
  // Catalan town holiday pages: after the first answer block (answer, table, lead), after the "next step", before the live box.
  [`${P}holidays/MunicipalityPage.tsx`]: 1,
  [`${P}holidays/EnglishTownPage.tsx`]: 1,
  // Spain 2027: community, hub, bridges (es + ca/en), city (es + ca/en), day pages.
  [`${P}spain-2027/pages.tsx`]: 3,
  [`${P}spain-2027/pages-intl.tsx`]: 3,
  [`${P}spain-2027/city-page.tsx`]: 1,
  [`${P}spain-2027/city-page-intl.tsx`]: 1,
  [`${P}spain-2027/days.tsx`]: 1,
  // Christmas fairs (town), Rodalies line, fuel and reservoir pages.
  [`${P}christmas-fairs/TownPage.tsx`]: 1,
  [`${P}rodalies/LinePage.tsx`]: 1,
  [`${P}fuel/FuelHubPage.tsx`]: 1,
  [`${P}fuel/FuelPlacePage.tsx`]: 1,
  [`${P}fuel/SpainPages.tsx`]: 1,
  [`${P}reservoirs/ReservoirPages.tsx`]: 2,
  // Calculators: after the tool, before the explanation.
  [`${P}net-salary/NetSalaryPage.tsx`]: 1,
  [`${P}mortgage/MortgagePage.tsx`]: 1,
  [`${P}extra-pay/ExtraPayPage.tsx`]: 1,
  [`${P}inheritance-tax/InheritanceTaxPage.tsx`]: 1,
  [`${P}home-purchase-tax/HomeTaxPage.tsx`]: 1,
  [`${P}plusvalia/PlusvaliaPage.tsx`]: 1,
  [`${P}smi/SmiPage.tsx`]: 1,
  [`${P}euribor/EuriborPage.tsx`]: 1,
  [`${P}ipc/IpcPage.tsx`]: 1,
  [`${P}iprem/IpremPage.tsx`]: 1,
  [`${P}retirement-age/RetirementAgePage.tsx`]: 1,
  [`${P}working-days/WorkingDaysPage.tsx`]: 1,
};

test("server-rendered top box on the programmatic templates, each with its page path (allowsAdUnits)", () => {
  for (const [file, count] of Object.entries(TEMPLATES)) {
    const src = read(file);
    const n = (src.match(/<AdSlot kind="top" locale=(?:\{[^}]+\}|"[a-z]{2}") path=\{[^\n]+\} \/>/g) ?? []).length;
    assert.equal(n, count, file);
    assert.match(src, /from "@\/components\/AdSlot"/, file);
  }
});

test("the top box never stands above the H1 or the lead: it comes inside the body, after the first answer block", () => {
  for (const file of Object.keys(TEMPLATES)) {
    const src = read(file);
    const first = src.indexOf('<AdSlot kind="top"');
    assert.ok(first > src.indexOf('className="ci-prose'), `${file}: box inside the body`);
  }
  const muni = read(`${P}holidays/MunicipalityPage.tsx`);
  assert.ok(muni.indexOf('<AdSlot kind="top"') > muni.indexOf("firstScreenOrder(locale).map"), "after answer, table and lead");
  assert.ok(muni.indexOf('<AdSlot kind="top"') > muni.indexOf("<NextStep"), "after the next step");
  assert.ok(muni.indexOf('<AdSlot kind="top"') < muni.indexOf('<h2 id="avui">'), "before the live box");
  const en = read(`${P}holidays/EnglishTownPage.tsx`);
  assert.ok(en.indexOf('<AdSlot kind="top"') > en.indexOf('<p className="ci-lead">'), "after the lead");
  const day = read(`${P}spain-2027/days.tsx`);
  assert.ok(day.indexOf('<AdSlot kind="top"') > day.indexOf("ci-today-answer"), "after the dated answer");
});

test("CLS: the top box reserves the ad plus its own label, rule and padding; the ins has an explicit height; it never collapses", () => {
  const css = read("app/globals.css");
  // 250 px on phones, 280 px from 48rem; chrome = border 1px + padding 0.5rem + label 1.25rem + label margin 0.5rem.
  assert.match(css, /--ci-ad-h: 250px;\s*--ci-ad-chrome: calc\(1px \+ 2\.25rem\);/);
  assert.match(css, /@media \(min-width: 48rem\) \{\s*\.ci-ad-top,\s*\.ci-ad-home-top \{\s*--ci-ad-h: 280px;/);
  assert.match(css, /\.ci-ad-top \.ci-ad-label,\s*\.ci-ad-home-top \.ci-ad-label \{\s*line-height: 1\.25rem;/);
  assert.match(css, /\.ci-ad-top ins\.adsbygoogle,\s*\.ci-ad-home-top ins\.adsbygoogle \{\s*height: var\(--ci-ad-h\);/);
  // Unfilled: the top boxes keep their space and lose the label; every other box collapses.
  assert.match(css, /\.ci-ad\.ci-ad-top:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\),\s*\.ci-ad\.ci-ad-home-top:has\([^)]*\) \{\s*display: block;/);
  assert.match(css, /\.ci-ad-top:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\) \.ci-ad-label,[^{]*\{\s*visibility: hidden;/);
  assert.match(css, /\.ci-ad:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\) \{\s*display: none;/);
});

/** The local files a route page renders from (its `@/…` imports, followed through the programmatic code). */
function routeClosure(entry: string): string[] {
  const seen = new Set<string>();
  const todo = [entry];
  while (todo.length) {
    const file = todo.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const m of read(file).matchAll(/from "@\/([^"]+)"/g)) {
      const base = m[1]!;
      if (!/^(components\/programmatic|lib\/programmatic|app\/\(public\))/.test(base)) continue;
      for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
        try {
          read(`${base}${ext}`);
          todo.push(`${base}${ext}`);
          break;
        } catch {
          /* next extension */
        }
      }
    }
  }
  return [...seen];
}

test("no ad box on the REE routes (PVPC today and tomorrow, /hoy, /avui, /today), by route and through what they render", () => {
  const routes = [
    "app/(public)/[locale]/hoy/page.tsx",
    "app/(public)/[locale]/avui/page.tsx",
    "app/(public)/[locale]/today/page.tsx",
    "app/(public)/[locale]/precio-luz/page.tsx",
    "app/(public)/[locale]/precio-luz/manana/page.tsx",
    "app/(public)/[locale]/preu-llum/page.tsx",
    "app/(public)/[locale]/preu-llum/dema/page.tsx",
    "app/(public)/[locale]/electricity-price-spain/page.tsx",
    "app/(public)/[locale]/electricity-price-spain/tomorrow/page.tsx",
  ];
  const urls = ["/es/hoy/", "/ca/avui/", "/en/today/", "/es/precio-luz/", "/es/precio-luz/manana/", "/ca/preu-llum/", "/ca/preu-llum/dema/", "/en/electricity-price-spain/", "/en/electricity-price-spain/tomorrow/"];
  for (const u of urls) {
    assert.ok(isAdFreePath(u), u);
    assert.ok(!allowsAdUnits(u), u);
    assert.ok(!allowsAdUnits(u.slice(0, -1)), `${u} without the slash`);
  }
  let files = 0;
  for (const route of routes) {
    for (const f of routeClosure(route)) {
      files++;
      assert.doesNotMatch(read(f), /AdSlot/, `${route} renders ${f}`);
    }
  }
  assert.ok(files > 15, `the closure walked ${files} files`);
  // The home-page grid is the only place AdSlot sits in app/ pages.
  assert.match(read(`${P}today/TodayPage.tsx`), /<main/);
});

test("placement: first unit after the first section, then every ~2 screens, five at most", () => {
  const viewport = 800;
  // Twelve sections, 700 px each, first heading at 300.
  const headings = Array.from({ length: 12 }, (_, i) => 300 + i * 700);
  const picks = planInArticle({ headings, units: [], viewport, budget: 4 });
  assert.equal(picks[0], 1, "the first goes before the second H2 (after the first section)");
  for (let k = 1; k < picks.length; k++) {
    const apart = headings[picks[k]!]! - headings[picks[k - 1]!]! + UNIT_HEIGHT;
    assert.ok(apart >= 2 * viewport - 1, `~2 screens apart (${apart})`);
  }
  assert.equal(picks.length, 4);
  // Budget: the page's total never goes over five (top box + end + side leave two).
  assert.equal(MAX_UNITS_PER_PAGE, 5);
  assert.equal(unitBudget(3), 2);
  assert.equal(unitBudget(7), 0);
  assert.deepEqual(planInArticle({ headings, units: [], viewport, budget: 0 }), []);
});

test("placement: keeps 0.75 of a screen from the top box and the end unit, nothing above the answer", () => {
  const viewport = 800;
  const headings = [200, 500, 1000, 3000, 5000, 7000];
  // A server box at 450-700: the headings at 500 and 1000 are too close (need 600 px of text).
  const picks = planInArticle({ headings, units: [{ top: 450, bottom: 700 }], viewport, budget: 3 });
  assert.ok(!picks.includes(1) && !picks.includes(2), `${picks}`);
  for (const i of picks) assert.ok(headings[i]! - 700 >= 0.75 * viewport, `gap after the box at heading ${i}`);
  // An end unit at 5200: the heading at 5000 is too close, the one at 3000 is not.
  const near = planInArticle({ headings, units: [{ top: 5200, bottom: 5500 }], viewport, budget: 5 });
  assert.ok(!near.includes(4), `${near}`);
  assert.ok(near.includes(3));
  // Nothing before the second heading, ever: the answer comes first.
  assert.ok(!planInArticle({ headings: [100, 150], units: [], viewport, budget: 5 }).includes(0));
});

test("placement on a small viewport (360x640 phone): same rules, tighter pixels", () => {
  const viewport = 640;
  const headings = Array.from({ length: 14 }, (_, i) => 500 + i * 650);
  const picks = planInArticle({ headings, units: [{ top: 700, bottom: 1016 }], viewport, budget: 3 });
  assert.ok(picks.length > 0 && picks.length <= 3, `${picks}`);
  // The box at 700-1016 pushes the first unit to a heading at least 0.75 screen (480 px) below it, and past half a screen.
  assert.ok(headings[picks[0]!]! - 1016 >= 0.75 * viewport, `${headings[picks[0]!]}`);
  assert.ok(headings[picks[0]!]! > 0.5 * viewport);
  for (let k = 1; k < picks.length; k++) {
    const between = headings[picks[k]!]! - headings[picks[k - 1]!]!;
    assert.ok(between >= 0.75 * viewport, "0.75 of a screen of text between units");
    assert.ok(between + UNIT_HEIGHT >= 2 * viewport - 1, "~2 screens top to top");
  }
  // A short page (two screens) gets at most one unit, and nothing when the only room is above half a screen.
  assert.ok(planInArticle({ headings: [200, 400, 900], units: [], viewport, budget: 3 }).length <= 2);
  assert.deepEqual(planInArticle({ headings: [100, 250], units: [], viewport, budget: 3 }), []);
});
