import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { AD_FEED_LAYOUT_KEY, AD_FREE_PATHS, AD_SLOTS, ADS_LIVE, adClient, allowsAdUnits, isAdFreePath } from "../src/lib/ads/config.ts";
import { MAX_UNITS_PER_PAGE, MAX_UNITS_WITH_RAIL, RAIL_CHROME, RAIL_MIN_TEXT, RAIL_MIN_VIEWPORT, RAIL_TWO_MIN_TEXT, UNIT_HEIGHT, isCalculatorToolPath, planInArticle, railCount, railUnitHeight, unitBudget } from "../src/lib/ads/placement.ts";
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
  assert.match(src, /unitBudget\(boxes\.length \+ \(sideBox \? 1 : 0\) \+ rails\.length, rails\.length \? MAX_UNITS_WITH_RAIL : undefined\)/);
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
  // Chrome (on every box) = border 1px + padding 0.5rem + label 1.25rem + label margin 0.5rem.
  assert.match(css, /\.ci-ad \{\s*--ci-ad-chrome: calc\(1px \+ 2\.25rem\);/);
  // 100vw up to 30rem (measured 25 Nov 2026: Google fills a phone's full-width unit square), 250px up to 48rem, 280px from 48rem.
  assert.match(css, /--ci-ad-h: 250px;\s*--ci-ad-min: var\(--ci-ad-h\);\s*min-height: calc\(var\(--ci-ad-h\) \+ var\(--ci-ad-chrome\)\)/);
  assert.match(css, /@media \(max-width: 30rem\) \{\s*\.ci-ad-top,\s*\.ci-ad-home-top \{\s*--ci-ad-h: 100vw;/);
  assert.match(css, /@media \(min-width: 48rem\) \{\s*\.ci-ad-top,\s*\.ci-ad-home-top \{\s*--ci-ad-h: 280px;/);
  assert.match(css, /\.ci-ad-label \{[^}]*line-height: 1\.25rem;/);
  assert.match(css, /\.ci-ad-top ins\.adsbygoogle,\s*\.ci-ad-home-top ins\.adsbygoogle \{\s*height: var\(--ci-ad-h\);/);
  // Unfilled: the top boxes keep their space and lose the label; every other box collapses.
  assert.match(css, /\.ci-ad\.ci-ad-top:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\),\s*\.ci-ad\.ci-ad-home-top:has\([^)]*\) \{\s*display: block;/);
  assert.match(css, /\.ci-ad-top:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\) \.ci-ad-label,[^{]*\{\s*visibility: hidden;/);
  assert.match(css, /\.ci-ad:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\) \{\s*display: none;/);
});

test("CLS: every <ins> sits in a .ci-ad-slot wrapper, because Google zeroes min-height on the <ins>'s parent", () => {
  const css = read("app/globals.css");
  const slot = read("components/AdSlot.tsx");
  const runtime = read("components/AdsRuntime.tsx");
  // Server boxes carry the wrapper; fillSlots appends the <ins> into it (not into the <aside>).
  assert.match(slot, /<div className="ci-ad-slot" \/>/);
  assert.match(runtime, /\(box\.querySelector<HTMLElement>\("\.ci-ad-slot"\) \?\? box\)\.append\(ins\)/);
  // Units built in the browser (middle, end, side) wrap it too.
  assert.match(runtime, /box\.append\(caption, slotOf\(ins\)\)/);
  assert.match(runtime, /slot\.className = "ci-ad-slot"/);
  // The in-article planner measures the box, not the wrapper.
  assert.match(runtime, /slots\.map\(\(ins\) => ins\.closest<HTMLElement>\("\.ci-ad"\) \?\? ins\)/);
  // Google zeroes min-height on every ancestor of the <ins> that has one (the <aside> included), so the
  // reservation is repeated as a ::before in the wrapper's single grid cell, shared with the <ins>.
  assert.doesNotMatch(css, /\.ci-ad-slot \{[^}]*min-height/);
  assert.match(css, /\.ci-ad-slot \{\s*display: grid;\s*grid-template-columns: minmax\(0, 1fr\);[^}]*height: auto !important;/);
  assert.match(css, /\.ci-ad-slot::before \{\s*content: "";\s*grid-area: 1 \/ 1;\s*height: var\(--ci-ad-min\);/);
  assert.match(css, /\.ci-ad-slot > ins\.adsbygoogle \{\s*grid-area: 1 \/ 1;/);
  // Ad area per kind (the box's chrome is outside the wrapper): default 280, end 320, top = --ci-ad-h, feed card, side none.
  assert.match(css, /\.ci-ad \{\s*--ci-ad-min: calc\(280px - var\(--ci-ad-chrome\)\);/);
  assert.match(css, /--ci-ad-min: calc\(320px - var\(--ci-ad-chrome\)\);/);
  assert.match(css, /--ci-ad-min: var\(--ci-ad-h\);/);
  assert.match(css, /--ci-ad-min: calc\(300px - 3rem - 2px\);/);
  assert.match(css, /\.ci-ad-side \{[^}]*--ci-ad-min: 0px;/);
  // In-article units reserve a phone-sized box before the fill (fluid unit: about 1.04 x the screen width).
  assert.match(css, /@media \(max-width: 30rem\) \{\s*\.ci-ad-middle \{\s*--ci-ad-min: 105vw;\s*min-height: calc\(105vw \+ var\(--ci-ad-chrome\)\);/);
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

test("key-facts grid caps the label column so a long label cannot squeeze the value (25 Nov 2026)", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.ci-facts \{\s*display: grid;[\s\S]{0,300}grid-template-columns: fit-content\(45%\) minmax\(0, 1fr\);/);
});

/* --- 25 Nov 2026, owner: "a les calculadores hi ha molt espai lliure en ordinador, posali mes anuncis" --- */

test("calculator right rail: only on calculator tool pages, never on REE or legal pages, hub excluded", () => {
  for (const p of ["/es/calculadoras/premios-loteria/", "/ca/calculadores/sou-net/", "/en/calculators/net-salary-spain/", "/es/calculadoras/paro"]) {
    assert.ok(isCalculatorToolPath(p), p);
    assert.ok(allowsAdUnits(p), p);
  }
  for (const p of ["/es/calculadoras/", "/ca/calculadores/", "/en/calculators/", "/es/guias/huelgas-espana/", "/es/precio-luz/", "/es/calculadoras/a/b/", "/es/legal/cookies/"]) assert.ok(!isCalculatorToolPath(p), p);
  // The rail is placed only after allowsAdUnits (REE and legal pages return before placeUnits).
  for (const p of AD_FREE_PATHS) assert.ok(!isCalculatorToolPath(p) || !allowsAdUnits(p), p);
  const src = read("components/AdsRuntime.tsx");
  assert.match(src, /if \(!allowsAdUnits\(pathname\)\) return;[^]*placeUnits\(client, locale, home, pathname, cleanup\)/);
});

test("calculator right rail: one unit on a long text column, two on a very long one, the page cap stays 5 (6 with the rail)", () => {
  assert.equal(railCount(RAIL_MIN_TEXT - 1), 0);
  assert.equal(railCount(RAIL_MIN_TEXT), 1);
  assert.equal(railCount(RAIL_TWO_MIN_TEXT - 1), 1);
  assert.equal(railCount(RAIL_TWO_MIN_TEXT), 2);
  assert.equal(MAX_UNITS_PER_PAGE, 5);
  assert.equal(MAX_UNITS_WITH_RAIL, 6);
  // Top box + end + two rails leaves two in-article units; never more than six in all.
  assert.equal(unitBudget(4, MAX_UNITS_WITH_RAIL), 2);
  assert.equal(unitBudget(6, MAX_UNITS_WITH_RAIL), 0);
  assert.equal(unitBudget(5), 0);
  // 300x600 on a normal screen; shorter on a small one; none under 250 px of room.
  assert.equal(railUnitHeight(900), 600);
  // The label and padding (36 px) are subtracted too, so the sticky box fits short viewports.
  assert.equal(RAIL_CHROME, 36);
  assert.equal(railUnitHeight(600), 600 - 96 - 24 - 36);
  assert.equal(railUnitHeight(406), 250);
  assert.equal(railUnitHeight(405), null);
  assert.equal(railUnitHeight(300), null);
  for (const vh of [500, 600, 700, 768, 900, 1200]) {
    const h = railUnitHeight(vh);
    if (h) assert.ok(96 + RAIL_CHROME + h <= vh, `a ${h} px rail unit fits a ${vh} px viewport`);
  }
});

test("calculator right rail: existing slot only, desktop only, out of the text flow, new CSS classes", () => {
  const src = read("components/AdsRuntime.tsx");
  // The "ci-lateral" slot, no new id; nothing is requested below the breakpoint.
  assert.match(src, /railUnits\(prose, client, sideSlot, label, count, height\)/);
  assert.match(src, /window\.matchMedia\(`\(min-width: \$\{RAIL_MIN_VIEWPORT \/ 16\}rem\)`\);[^]*if \(wide\.matches\) rails = placeRail/);
  assert.equal(RAIL_MIN_VIEWPORT, 1100);
  // Not on pages that already have the article sidebar.
  assert.match(src, /sideSlot && !aside && isCalculatorToolPath\(path\)/);
  const css = read("app/globals.css");
  assert.match(css, /\.ci-rail \{\s*display: none;\s*\}/);
  assert.match(css, /@media \(min-width: 68\.75rem\) \{\s*\.ci-rail-host \{\s*position: relative;/);
  assert.match(css, /\.ci-rail \{\s*display: block;\s*position: absolute;[^}]*width: 300px/);
  assert.match(css, /\.ci-rail-unit \{\s*position: sticky;\s*top: 6rem;/);
  assert.match(css, /\.ci-rail-unit:has\(ins\.adsbygoogle\[data-ad-status="unfilled"\]\)/);
  // 38rem column + 300px + two gutters fit in 68.75rem (1100px).
  assert.ok(38 * 16 + 300 + 2 * 20 <= 1100);
});

test("calculator right rail: follows the layout (host, window resize) and is placed or removed when the window crosses 1100 px", () => {
  const src = read("components/AdsRuntime.tsx");
  // Drift: the host is observed as well as the text column, the window resize re-lays the rail, and stop() cleans both up.
  assert.match(src, /ro\?\.observe\(prose\);\s*ro\?\.observe\(host\);/);
  assert.match(src, /window\.addEventListener\("resize", layout\)/);
  assert.match(src, /window\.removeEventListener\("resize", layout\)/);
  // Crossing 1100 px: a change listener places a missing rail (within the cap of six) or removes it; it is removed on navigation.
  assert.match(src, /wide\.addEventListener\("change", onChange\)/);
  assert.match(src, /placeRail\(MAX_UNITS_WITH_RAIL - used\)/);
  assert.match(src, /if \(!wide\.matches\) \{\s*railStop\?\.\(\);/);
  assert.match(src, /wide\.removeEventListener\("change", onChange\)/);
  // A late rail asks for its ads, one request per unit.
  assert.match(src, /for \(let i = 0; i < late\.length; i\+\+\) adsQueue\(\)\.push\(\{\}\)/);
});
