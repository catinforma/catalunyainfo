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

/**
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md, "internal links to the pages the
 * November core update hit"): four evergreen pages had no link from the
 * homepage, header or footer since 12 Nov. The footer's "most searched"
 * group links them from every page, in every language.
 */
test("footer: 'most searched' links the four pages that lost their sitewide link, indexable and in the sitemap, in every language", async () => {
  const { FREQUENT_FOOTER_TITLE, frequentFooterLinks } = await import("../src/lib/nav/footer.ts");
  const { municipalityPath, holidayFamilyPaths } = await import("../src/lib/programmatic/holidays/paths.ts");
  const { rodaliesSitemap } = await import("../src/lib/programmatic/rodalies/pages.ts");
  const { GUIDES } = await import("../src/lib/programmatic/holidays/links.ts");
  const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
  const sitemap = new Set(rodaliesSitemap().map((e) => e.url));
  const holidayPaths = new Set(holidayFamilyPaths().map((p) => p.path));
  const expected = {
    ca: ["/ca/guies/es-festiu-avui-catalunya/", "/ca/festius/barcelona/", "/ca/guies/horaris-metro-barcelona/", "/ca/rodalies/r4/"],
    es: ["/es/guias/es-festivo-hoy-cataluna/", "/es/festivos/barcelona/", "/es/guias/horarios-metro-barcelona/", "/es/rodalies/r4/"],
    en: ["/en/guides/is-today-a-holiday-in-catalonia/", "/en/holidays/barcelona/", "/en/guides/barcelona-metro-hours/", "/en/rodalies/r4/"],
  } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const links = frequentFooterLinks(locale);
    assert.ok(FREQUENT_FOOTER_TITLE[locale], locale);
    assert.deepEqual(links.map((l) => l.href), expected[locale], locale);
    assert.ok(links.length >= 4 && links.length <= 6, "the footer is on every page: 4 to 6 links");
    assert.equal(new Set(links.map((l) => l.href)).size, links.length, "one link per target");
    for (const link of links) {
      assert.ok(!isLowDemandPath(link.href), `${link.href} is indexable`);
      assert.ok(link.label.length >= 12 && !/^(aquí|here|click|clic|más|more)/i.test(link.label), link.label);
    }
    assert.equal(links[1]!.href, municipalityPath(locale, "barcelona"), "the hand-written Barcelona path is the town page's");
    assert.ok(holidayPaths.has(links[1]!.href), `${links[1]!.href} is in the holidays family`);
    assert.equal(links[0]!.href, GUIDES.holidayToday[locale]);
    assert.equal(links[2]!.href, GUIDES.metroHours[locale]);
    assert.ok(sitemap.has(`${ORIGIN}${links[3]!.href}`), `${links[3]!.href} is a sitemap URL`);
  }
  assert.equal(frequentFooterLinks("es")[0]!.label, "¿Es festivo hoy o mañana en Cataluña?");
  const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
  assert.match(footer, /frequentFooterLinks\(locale\)\.map/);
  const code = readFileSync("src/lib/nav/footer.ts", "utf8");
  assert.doesNotMatch(code, /from "@\/lib\/programmatic\/holidays\/paths"/, "the footer must not pull the holiday snapshot into every page");
});

/** The same day: links from pages that are not the homepage, one per target per page. */
test("internal links to the pages hit by the November core update: Útil ahora, Barcelona page, holidays hub, today page, Spain 2027 Catalonia", () => {
  const read = (path: string) => readFileSync(path, "utf8");
  assert.match(read("src/lib/engagement/useful-now.ts"), /b\("hours", locale\)/, "strike pages' Útil ahora links the metro hours guide");
  assert.match(read("src/components/programmatic/holidays/MunicipalityPage.tsx"), /m\.slug === "barcelona" \? \(\["metroHours"\]/);
  assert.match(read("src/components/programmatic/holidays/HubPage.tsx"), /"shops", "metroHours", "school"/);
  assert.match(read("src/components/programmatic/today/TodayPage.tsx"), /href: l\.holidays\.barcelona/);
  assert.match(read("src/components/programmatic/spain-2027/pages.tsx"), /GUIDES\.workCalendar\.es[\s\S]*GUIDES\.holidayToday\.es/);
  assert.match(read("src/components/programmatic/spain-2027/pages-intl.tsx"), /GUIDES\.workCalendar\.ca[\s\S]*GUIDES\.holidayToday\.en/);
});
