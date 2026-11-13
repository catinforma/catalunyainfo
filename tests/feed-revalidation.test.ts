import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const { SITEMAP_AND_FEED_REVALIDATIONS, SITEMAP_AND_FEED_URLS } = await import("../src/lib/seo/feed-paths.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");

// Next's own code for the tags a cached route entry carries.
const require = createRequire(import.meta.url);
const { getImplicitTags } = require("next/dist/server/lib/implicit-tags.js") as {
  getImplicitTags: (page: string, pathname: string, fallback?: unknown) => Promise<{ tags: string[] }>;
};
const { NEXT_CACHE_IMPLICIT_TAG_ID } = require("next/dist/lib/constants.js") as { NEXT_CACHE_IMPLICIT_TAG_ID: string };
const { removeTrailingSlash } = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js") as {
  removeTrailingSlash: (path: string) => string;
};

/** The tag revalidatePath(path, type) expires (next/dist/server/web/spec-extension/revalidate.js). */
function revalidatePathTag(path: string, type?: "page" | "layout"): string {
  const tag = `${NEXT_CACHE_IMPLICIT_TAG_ID}${removeTrailingSlash(path)}`;
  return type ? `${tag}${tag.endsWith("/") ? "" : "/"}${type}` : tag;
}

// Route file and request pathname of each cached document. With trailingSlash:
// true the pathname ends in a slash: the 13 Nov release's .meta files read
// "_N_T_/layout,_N_T_/sitemap.xml/layout,_N_T_/sitemap.xml/route,_N_T_/sitemap.xml/".
const DOCUMENTS = [
  { page: "/sitemap.xml/route", pathname: "/sitemap.xml/" },
  { page: "/news-sitemap.xml/route", pathname: "/news-sitemap.xml/" },
  ...LOCALES.map((locale) => ({ page: "/(public)/[locale]/feed.xml/route", pathname: `/${locale}/feed.xml/` })),
];

test("the 13 Nov bug: revalidatePath with the literal URL misses a route handler's cache entry", async () => {
  const { tags } = await getImplicitTags("/sitemap.xml/route", "/sitemap.xml/");
  assert.ok(tags.includes("_N_T_/sitemap.xml/"), `unexpected tags: ${tags.join(",")}`);
  assert.ok(!tags.includes(revalidatePathTag("/sitemap.xml")), "if this matches again, Next changed and the literal form works");
});

test("every publish revalidation reaches the sitemap, the news sitemap and each feed", async () => {
  const expired = SITEMAP_AND_FEED_REVALIDATIONS.map(([path, type]) => revalidatePathTag(path, type));
  for (const doc of DOCUMENTS) {
    const { tags } = await getImplicitTags(doc.page, doc.pathname);
    assert.ok(expired.some((tag) => tags.includes(tag)), `${doc.pathname} (${tags.join(",")}) is reached by none of ${expired.join(",")}`);
  }
  // Never the root layout: that would expire every page on the site.
  assert.ok(!expired.includes(`${NEXT_CACHE_IMPLICIT_TAG_ID}/layout`));
});

test("the CDN purge still names the public URLs", () => {
  assert.deepEqual([...SITEMAP_AND_FEED_URLS], ["/sitemap.xml", "/ca/feed.xml", "/es/feed.xml", "/en/feed.xml", "/news-sitemap.xml"]);
});

test("no caller revalidates the sitemap or a feed by its literal URL any more", () => {
  for (const file of ["src/app/api/admin/publish/route.ts", "src/app/api/cron/publish-scheduled/route.ts", "src/lib/admin/actions.ts"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /revalidate(Path)?\("\/sitemap\.xml"\)|FEED_PATHS/, file);
    assert.match(source, /revalidateSitemapAndFeeds\(\)/, file);
  }
});
