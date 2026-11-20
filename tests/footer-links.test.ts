import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { seasonalFooterLinks } = await import("../src/lib/nav/footer.ts");
const { christmasFairsSitemapEntries } = await import("../src/lib/programmatic/christmas-fairs/sitemap.ts");
const { allSystemPaths, sectionPath } = await import("../src/lib/i18n/routes.ts");

/**
 * Site audit, 17 Nov 2026 (click depth from the home pages): the Christmas
 * fairs hub was 3 clicks deep and its town pages 4; the legal index was
 * linked from nowhere. The footer now links both.
 */

const ORIGIN = "https://www.catalunyainfo.com";

/**
 * Load, 18 Nov 2026 (Caddy logs): RSC prefetches were 41% of origin requests,
 * about four in five for the targets of links on every page. Cloudflare never
 * caches RSC payloads, so the sitewide links prefetch on intent (header,
 * wordmark, breadcrumbs) or not at all (footer, byline).
 */
test("sitewide links: no viewport prefetch in the header, wordmark, breadcrumbs, footer and byline", () => {
  const read = (path: string) => readFileSync(new URL(`../src/components/${path}`, import.meta.url), "utf8");
  for (const file of ["SiteHeader.tsx", "Wordmark.tsx", "Breadcrumbs.tsx"]) {
    const text = read(file);
    assert.doesNotMatch(text, /from "next\/link"/, `${file}: use IntentLink`);
    assert.match(text, /<IntentLink\b/, file);
  }
  assert.match(read("nav/IntentLink.tsx"), /prefetch=\{intent \? null : false\}/);
  const footerLinks = read("SiteFooter.tsx").match(/<Link\b[^>]*>/g) ?? [];
  assert.ok(footerLinks.length >= 8, "footer links found");
  for (const tag of footerLinks) assert.match(tag, /prefetch=\{false\}/, tag);
  const byline = read("pages/EntryArticle.tsx").match(/<Link\b[^>]*sectionPath\("authors"[^>]*>/g) ?? [];
  assert.equal(byline.length, 2, "both author links");
  for (const tag of byline) assert.match(tag, /prefetch=\{false\}/, tag);
});

test("footer: the Christmas fairs hub in season (2 Nov - 6 Jan), in every language, and only then", () => {
  const sitemap = new Set(christmasFairsSitemapEntries().map((e) => e.url));
  for (const locale of ["ca", "es", "en"] as const) {
    for (const day of ["2026-11-02", "2026-11-17", "2026-12-31", "2027-01-06"]) {
      const links = seasonalFooterLinks(locale, day);
      assert.equal(links.length, 1, `${locale} ${day}`);
      assert.ok(sitemap.has(`${ORIGIN}${links[0]!.href}`), `${links[0]!.href} is the hub the fairs sitemap lists`);
    }
    for (const day of ["2026-11-01", "2027-01-07", "2027-06-15"]) assert.deepEqual(seasonalFooterLinks(locale, day), [], `${locale} ${day}`);
  }
  assert.equal(seasonalFooterLinks("es", "2026-11-17")[0]!.label, "Mercados de Navidad");
});

test("footer: the seasonal links and the legal index are rendered", () => {
  const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
  assert.match(footer, /seasonalFooterLinks\(locale\)\.map/);
  assert.match(footer, /<Link (?:prefetch=\{false\} )?href=\{sectionPath\("legal", locale\)\}>\{t\.nav\.legal\}<\/Link>/);
  for (const locale of ["ca", "es", "en"] as const) {
    assert.ok(allSystemPaths(locale).includes(sectionPath("legal", locale)), `${locale}: the legal index is a real system page`);
  }
});

/**
 * 20 Nov 2026: the live-data pages were linked from no header, footer or
 * homepage since 12 Nov; Google had never seen /es/avisos/ (URL inspection).
 * The footer's "live data" column links each hub from every page.
 */
test("footer: the live-data column links every live hub that exists in that language, with searched anchors", async () => {
  const { LIVE_FOOTER_TITLE, liveFooterLinks } = await import("../src/lib/nav/footer.ts");
  const { rodaliesSitemap } = await import("../src/lib/programmatic/rodalies/pages.ts");
  const { reservoirSitemapEntries } = await import("../src/lib/programmatic/reservoirs/pages.ts");
  const { fuelSitemapEntries } = await import("../src/lib/programmatic/fuel/sitemap.ts");
  const { pvpcSitemapEntries } = await import("../src/lib/programmatic/pvpc/pages.ts");
  const { butaneSitemapEntries } = await import("../src/lib/programmatic/butane/page.ts");
  const { warningsSitemapEntries } = await import("../src/lib/programmatic/warnings/page.ts");
  const { todaySitemapEntries } = await import("../src/lib/programmatic/today/page.ts");
  const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
  const listed = new Set(
    [
      ...rodaliesSitemap(),
      ...reservoirSitemapEntries(),
      ...fuelSitemapEntries(),
      ...pvpcSitemapEntries("2026-11-20"),
      ...butaneSitemapEntries("2026-11-20"),
      ...warningsSitemapEntries(Date.parse("2026-11-20T12:00:00Z")),
      ...todaySitemapEntries(),
    ].map((e) => e.url),
  );
  const expected = { ca: 7, es: 7, en: 7 } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const links = liveFooterLinks(locale);
    assert.equal(links.length, expected[locale], locale);
    assert.ok(LIVE_FOOTER_TITLE[locale], locale);
    for (const link of links) {
      assert.ok(link.href.startsWith(`/${locale}/`), link.href);
      assert.ok(listed.has(`${ORIGIN}${link.href}`), `${link.href} is a sitemap URL`);
      assert.ok(!isLowDemandPath(link.href), `${link.href} is indexable`);
      assert.ok(link.label.length >= 8, link.label);
    }
  }
  assert.equal(liveFooterLinks("en").find((l) => l.key === "fuel")?.href, "/en/fuel-prices-catalonia/", "the English fuel hub");
  assert.deepEqual(
    liveFooterLinks("es").map((l) => l.href),
    ["/es/rodalies/", "/es/precio-luz/", "/es/gasolineras/", "/es/embalses/", "/es/avisos/", "/es/precio-butano/", "/es/hoy/"],
  );
  const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
  assert.match(footer, /liveFooterLinks\(locale\)\.map/);
  assert.match(footer, /lg:grid-cols-5/, "five columns on wide screens");
});
