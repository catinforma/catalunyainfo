import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { buildLlmsTxt } = await import("../src/lib/seo/llms.ts");
const { b2href } = await import("../src/lib/content/batch02/shared.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");
const { MARKETS_LOCALES, marketsHubPath, marketsTownPath, MARKET_TOWN_SLUGS } = await import("../src/lib/programmatic/weekly-markets/paths.ts");
const { weeklyMarketsSitemapEntries } = await import("../src/lib/programmatic/weekly-markets/sitemap.ts");

/**
 * 25 Nov 2026 integration of the weekly markets, winter sales and
 * "Barcelona in January and February" pages: sitemap, llms.txt, hubs, and at
 * least three contextual inlinks each (no orphans). The two guides are
 * published rows (sitemap and llms.txt read them from the database), so what
 * the code can hold is the publish group, the hub listing and the inlinks.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const B2_DIR = "src/lib/content/batch02";
const SOURCES = [
  ...readdirSync(join(ROOT, B2_DIR)).filter((f) => f.endsWith(".ts")).map((f) => `${B2_DIR}/${f}`),
  "src/lib/content/holidays/today-publish.ts",
];

/** Files, other than the page's own and the key registry, that link the guide by key. */
function inlinkFiles(key: string, own: string): string[] {
  return SOURCES.filter((file) => !file.endsWith(`/${own}.ts`) && !file.endsWith("/shared.ts") && read(file).includes(`"${key}"`));
}

test("markets: hubs and towns are in the sitemap with the three editions and x-default to English", () => {
  const entries = weeklyMarketsSitemapEntries();
  const urls = entries.map((e) => e.url);
  for (const locale of MARKETS_LOCALES) {
    assert.ok(urls.some((u) => u.endsWith(marketsHubPath(locale))), `hub ${locale}`);
    for (const slug of MARKET_TOWN_SLUGS) assert.ok(urls.some((u) => u.endsWith(marketsTownPath(locale, slug))), `${slug} ${locale}`);
  }
  for (const entry of entries) {
    const languages = (entry.alternates?.languages ?? {}) as Record<string, string>;
    assert.deepEqual(Object.keys(languages).sort(), ["ca", "en", "es", "x-default"], entry.url);
    assert.equal(languages["x-default"], languages.en);
    assert.ok(entry.lastModified instanceof Date && !Number.isNaN(entry.lastModified.getTime()), entry.url);
  }
});

test("markets: llms.txt names the hub in the three languages with one line", () => {
  const txt = buildLlmsTxt("https://www.catalunyainfo.com", "CatalunyaInfo", {}, "2026-11-25");
  const lines = txt.split("\n").filter((l) => l.includes(marketsHubPath("ca")));
  assert.equal(lines.length, 1);
  for (const locale of MARKETS_LOCALES) assert.ok(lines[0]!.includes(marketsHubPath(locale)), locale);
});

test("markets: reached from the weekend hubs, the town hubs and the farmers'-market guide", () => {
  for (const file of ["src/components/blocks/WeekendAgenda.tsx", "src/components/programmatic/weekend/HubPage.tsx", "src/components/programmatic/weekend/ZonePage.tsx", "src/components/programmatic/weekend/EnglishWeekend.tsx"]) {
    assert.match(read(file), /MarketsContextLine/, file);
  }
  assert.match(read("src/lib/engagement/town-hub.ts"), /family: "markets"/);
  assert.match(read(`${B2_DIR}/farmers-markets.ts`), /marketsTownPath/);
});

test("winter pages: each has the publish group and at least three contextual inlinks from other pages", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /wants\("rebaixes"\)/);
  assert.match(route, /wants\("barcelona-gener-febrer"\)/);
  for (const [key, own] of [["winterSales", "winter-sales"], ["barcelonaWinter", "barcelona-winter"]] as const) {
    for (const locale of LOCALES) assert.match(b2href(key, locale), /^\/(ca|es|en)\/.+\/$/);
    const files = inlinkFiles(key, own);
    assert.ok(files.length >= 3, `${key}: ${files.length} inlinking files (${files.join(", ")})`);
  }
});

test("winter pages: the Barcelona hub lists the January-February guide, the sales guide and it link each other", () => {
  const hub = read(`${B2_DIR}/barcelona-hub.ts`);
  assert.equal((hub.match(/\["barcelonaWinter"/g) ?? []).length, 3, "one item per language");
  assert.ok(read(`${B2_DIR}/winter-sales.ts`).includes('"barcelonaWinter"'));
  assert.ok(read(`${B2_DIR}/barcelona-winter.ts`).includes('"winterSales"'));
  assert.ok(read(`${B2_DIR}/shops.ts`).includes('"barcelonaWinter"'));
});
