import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { electionsSitemap } = await import("../src/lib/programmatic/elections/pages.ts");
const { holidaySitemapEntries } = await import("../src/lib/programmatic/holidays/paths.ts");
const { fuelSitemapEntries } = await import("../src/lib/programmatic/fuel/sitemap.ts");
const { rodaliesSitemap } = await import("../src/lib/programmatic/rodalies/pages.ts");
const { reservoirSitemapEntries } = await import("../src/lib/programmatic/reservoirs/pages.ts");
const { weekendSitemapEntries } = await import("../src/lib/programmatic/weekend/sitemap.ts");
const { todaySitemapEntries } = await import("../src/lib/programmatic/today/page.ts");
const { christmasFairsSitemapEntries } = await import("../src/lib/programmatic/christmas-fairs/sitemap.ts");

/**
 * Language mismatch audit, 31 Oct 2026. Each family tests its own hreflang;
 * this checks the clusters across all of them at once, the way Google reads
 * the sitemap: every alternate is itself a sitemap URL, lists the page back
 * under the page's language, and the whole cluster agrees on x-default. On
 * that day the live sitemap (1,762 URLs) and these 4,333 programmatic entries
 * had no defect; the test keeps it that way as families gain English pages.
 */
test("programmatic sitemap: every hreflang cluster is reciprocal, self-referencing and agrees on x-default", () => {
  type Entry = { url: string; alternates?: { languages?: Record<string, string> } };
  const entries = [
    ...electionsSitemap(),
    ...holidaySitemapEntries(),
    ...fuelSitemapEntries(),
    ...rodaliesSitemap(),
    ...reservoirSitemapEntries(),
    ...weekendSitemapEntries(),
    ...todaySitemapEntries(),
    ...christmasFairsSitemapEntries(),
  ] as Entry[];
  const clusters = new Map<string, Record<string, string>>();
  for (const e of entries) {
    assert.ok(!clusters.has(e.url), `listed twice: ${e.url}`);
    clusters.set(e.url, e.alternates?.languages ?? {});
  }
  assert.ok(clusters.size > 4000, `${clusters.size} URLs`);

  const defects: string[] = [];
  for (const [url, languages] of clusters) {
    const locale = url.match(/^https:\/\/www\.catalunyainfo\.com\/(ca|es|en)\//)?.[1];
    if (!locale) { defects.push(`no locale prefix: ${url}`); continue; }
    if (languages[locale] !== url) defects.push(`not self-referencing: ${url}`);
    if (!languages["x-default"] || !clusters.has(languages["x-default"])) defects.push(`x-default missing or not listed: ${url}`);
    for (const [hreflang, href] of Object.entries(languages)) {
      if (hreflang === "x-default") continue;
      if (!href.startsWith(`https://www.catalunyainfo.com/${hreflang}/`)) defects.push(`${hreflang} points at another locale: ${url} -> ${href}`);
      const back = clusters.get(href);
      if (!back) { defects.push(`alternate not in the sitemap: ${url} -> ${href}`); continue; }
      if (back[locale] !== url) defects.push(`not reciprocal: ${url} -> ${href}`);
      if (back["x-default"] !== languages["x-default"]) defects.push(`x-default differs: ${url} / ${href}`);
    }
  }
  assert.deepEqual(defects.slice(0, 10), [], `${defects.length} defects`);
});
