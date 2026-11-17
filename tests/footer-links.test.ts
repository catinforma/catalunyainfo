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
  assert.match(footer, /<Link href=\{sectionPath\("legal", locale\)\}>\{t\.nav\.legal\}<\/Link>/);
  for (const locale of ["ca", "es", "en"] as const) {
    assert.ok(allSystemPaths(locale).includes(sectionPath("legal", locale)), `${locale}: the legal index is a real system page`);
  }
});
