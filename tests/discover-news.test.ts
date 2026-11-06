import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// Absolute URLs and robots directives are built for production only.
process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
delete process.env.DATABASE_URL;

const jsonld = await import("../src/lib/seo/jsonld.ts");
const author = await import("../src/lib/content/author.ts");
const images = await import("../src/lib/seo/discover-images.ts");
const feeds = await import("../src/lib/seo/feeds.ts");
const feedPaths = await import("../src/lib/seo/feed-paths.ts");
const { NEWS_CYCLE_ENTRY_KEYS, isNewsArticle } = await import("../src/lib/seo/news-cycle.ts");
const { buildMetadata } = await import("../src/lib/seo/metadata.ts");
const { OWNER, aboutCopy } = await import("../src/lib/content/pages/institutional.ts");
const { IMAGES, IMAGE_BY_KEY } = await import("../src/lib/content/images.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");
const { sectionPath } = await import("../src/lib/i18n/routes.ts");
const { SITE } = await import("../src/lib/site.ts");

import type { EntryDetail, EntrySummary, MediaView } from "../src/lib/content/types.ts";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const ORIGIN = "https://www.catalunyainfo.com";
type Json = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const LICENSED = IMAGES.find((image) => image.license === "CC BY-SA 4.0" && image.width === 1920 && image.height === 1440)!;
const UNLICENSED = IMAGES.find((image) => !image.license)!;

function media(url: string, width = 1920, height = 1280): MediaView {
  return { id: "m1", url, width, height, blurDataUrl: null, alt: "Alt", caption: null, credit: "Someone", creditUrl: null, license: null, focalX: 0.5, focalY: 0.5 };
}

function entry(overrides: Partial<EntryDetail> = {}): EntryDetail {
  return {
    entryId: "e1",
    translationId: "t1",
    type: "guide",
    locale: "es",
    title: "Huelga general del 11 de noviembre",
    path: "guias/huelga-11-noviembre",
    href: "/es/guias/huelga-11-noviembre/",
    excerpt: "Qué funciona.",
    hero: media(LICENSED.url, LICENSED.width, LICENSED.height),
    publishedAt: new Date("2026-10-29T19:00:00Z"),
    updatedAt: new Date("2026-11-05T11:00:00Z"),
    lastVerifiedAt: new Date("2026-11-05T11:00:00Z"),
    readingMinutes: 5,
    category: null,
    authorName: null,
    isFeatured: false,
    key: "guide-general-strike-11-november-2026",
    status: "published",
    body: [],
    noindex: false,
    canonicalUrl: null,
    seoTitle: null,
    seoDescription: null,
    og: null,
    author: null,
    tags: [],
    categories: [],
    sources: [],
    related: [],
    translations: {},
    place: null,
    event: null,
    route: null,
    isDemo: false,
    breadcrumbs: [],
    ...overrides,
  };
}

function summary(overrides: Partial<EntrySummary> = {}): EntrySummary {
  const { key: _key, ...rest } = entry();
  void _key;
  return { ...rest, ...overrides } as EntrySummary;
}

/* -------------------------------------------------------------------------- */
/* Article JSON-LD                                                            */
/* -------------------------------------------------------------------------- */

test("guides and articles name the founder as a Person author, with his author page and profiles", () => {
  for (const locale of LOCALES) {
    for (const type of ["guide", "article", "news"] as const) {
      const node = jsonld.articleSchema(entry({ type, locale, key: null }));
      const person = node.author as Json;
      assert.equal(person["@type"], "Person", `${type}/${locale}`);
      assert.equal(person.name, OWNER.name);
      assert.equal(person.url, `${ORIGIN}${sectionPath("authors", locale)}${author.SITE_AUTHOR_SLUG}/`);
      assert.deepEqual(person.sameAs, [OWNER.links.portfolio, OWNER.links.github, OWNER.links.linkedin]);
      assert.equal(person["@id"], jsonld.SITE_AUTHOR_NODE_ID);
      // The publisher is still the Organization.
      assert.equal((node.publisher as Json)["@type"], "Organization");
    }
  }
  assert.equal(author.siteAuthorPath("ca"), "/ca/autors/marti-aguilera/");
  assert.equal(author.siteAuthorPath("es"), "/es/autores/marti-aguilera/");
  assert.equal(author.siteAuthorPath("en"), "/en/authors/marti-aguilera/");
});

test("an author set in the CMS is kept, and pages without a byline get none", () => {
  const cms = { id: "a1", slug: "jane-doe", name: "Jane Doe", jobTitle: "Editor", bio: null, expertise: null, links: { x: "https://x.com/jane" }, avatar: null };
  const node = jsonld.articleSchema(entry({ author: cms }));
  assert.deepEqual(node.author, { "@type": "Person", name: "Jane Doe", url: `${ORIGIN}/es/autores/jane-doe/`, jobTitle: "Editor", sameAs: ["https://x.com/jane"] });
  assert.equal(author.withByline(entry({ author: cms })).author, cms);
  assert.equal(author.withByline(entry({ type: "page" })).author, null);
  assert.equal(author.withByline(entry({ type: "place" })).author, null);
  assert.equal(author.withByline(entry()).author?.name, OWNER.name);
});

test("NewsArticle only for news entries and the dated-event guides; Article for the rest", () => {
  assert.equal(jsonld.articleSchema(entry())["@type"], "NewsArticle");
  assert.equal(jsonld.articleSchema(entry({ key: "guide-barcelona-metro-hours" }))["@type"], "Article");
  assert.equal(jsonld.articleSchema(entry({ key: null }))["@type"], "Article");
  assert.equal(jsonld.articleSchema(entry({ type: "news", key: null }))["@type"], "NewsArticle");
  assert.equal(isNewsArticle({ type: "guide", key: undefined }), false);
});

test("every news-cycle key is a published spec's entryKey", () => {
  const sources = filesUnder(join(SRC, "lib", "content")).map((file) => readFileSync(file, "utf8")).join("\n");
  for (const key of NEWS_CYCLE_ENTRY_KEYS) {
    assert.ok(sources.includes(`entryKey: "${key}"`), `${key}: no spec publishes it`);
  }
});

test("dateModified is the verification date, never before datePublished", () => {
  const node = jsonld.articleSchema(entry());
  assert.equal(node.datePublished, "2026-10-29T19:00:00.000Z");
  assert.equal(node.dateModified, "2026-11-05T11:00:00.000Z");
  assert.ok(String(node.dateModified) >= String(node.datePublished));
  // A row whose updated_at predates its publication is clamped to it, not moved forward to now.
  const early = jsonld.articleSchema(entry({ updatedAt: new Date("2026-10-01T00:00:00Z") }));
  assert.equal(early.dateModified, early.datePublished);
  // No publication date: dateModified alone, as stored.
  const undated = jsonld.articleSchema(entry({ publishedAt: null }));
  assert.equal(undated.datePublished, undefined);
  assert.equal(undated.dateModified, "2026-11-05T11:00:00.000Z");
});

test("a licensed photograph is declared as 16:9, 4:3 and 1:1 crops, each at least 1,200 px wide", () => {
  const image = jsonld.articleSchema(entry()).image as Json[];
  assert.ok(Array.isArray(image), "image must be an array");
  assert.deepEqual(image.map((i) => i.url), [
    `${ORIGIN}/img/16x9/${LICENSED.key}.jpg`,
    `${ORIGIN}/img/4x3/${LICENSED.key}.jpg`,
    `${ORIGIN}/img/1x1/${LICENSED.key}.jpg`,
  ]);
  const ratios = [16 / 9, 4 / 3, 1];
  image.forEach((node, index) => {
    assert.equal(node["@type"], "ImageObject");
    assert.ok(Number(node.width) >= 1200, `${node.url}: ${node.width} px`);
    assert.ok(Math.abs(Number(node.width) / Number(node.height) - ratios[index]!) < 1e-9, String(node.url));
    assert.ok(Number(node.width) * Number(node.height) > 300_000);
    assert.equal(node.creditText, LICENSED.credit);
    assert.equal(node.license, "https://creativecommons.org/licenses/by-sa/4.0/");
    assert.equal(node.acquireLicensePage, LICENSED.creditUrl);
  });
  // The og image wins over the hero, as it always did.
  const og = jsonld.articleSchema(entry({ og: media(UNLICENSED.url) })).image as Json;
  assert.equal(Array.isArray(og), false, "an unlicensed illustration keeps its single ImageObject");
  assert.equal(og.url, `${ORIGIN}${UNLICENSED.url}`);
  // A CMS upload outside the manifest: single ImageObject, as before.
  const upload = jsonld.articleSchema(entry({ hero: media("https://abc.public.blob.vercel-storage.com/x.webp") })).image as Json;
  assert.equal(upload.url, "https://abc.public.blob.vercel-storage.com/x.webp");
  assert.equal(jsonld.articleSchema(entry({ hero: null })).image, undefined);
});

/* -------------------------------------------------------------------------- */
/* Organization, author page                                                  */
/* -------------------------------------------------------------------------- */

test("the Organization keeps its founder (the same Person node) and lists only its own profiles as sameAs", () => {
  for (const locale of LOCALES) {
    const org = jsonld.organizationSchema(locale);
    const founder = org.founder as Json;
    assert.equal(founder["@type"], "Person");
    assert.equal(founder.name, OWNER.name);
    assert.equal(founder["@id"], jsonld.SITE_AUTHOR_NODE_ID);
    assert.equal(founder.url, `${ORIGIN}${author.siteAuthorPath(locale)}`);
    for (const link of Object.values(OWNER.links)) assert.ok((founder.sameAs as string[]).includes(link));
    if (SITE.sameAs.length === 0) assert.equal("sameAs" in org, false, "no invented profiles");
    else assert.deepEqual(org.sameAs, [...SITE.sameAs]);
    for (const url of (org.sameAs as string[] | undefined) ?? []) {
      assert.ok(!Object.values(OWNER.links).includes(url as never), "the founder's profiles are not the publication's");
    }
  }
});

test("the author page is a ProfilePage of the same Person, built only from the about page's words", () => {
  for (const locale of LOCALES) {
    const profile = jsonld.siteAuthorProfileSchema(locale);
    assert.equal(profile["@type"], "ProfilePage");
    assert.equal(profile.url, `${ORIGIN}${author.siteAuthorPath(locale)}`);
    const person = profile.mainEntity as Json;
    assert.equal(person["@id"], jsonld.SITE_AUTHOR_NODE_ID);
    assert.equal(person.description, author.SITE_AUTHOR_SUMMARY[locale]);
    assert.ok(author.SITE_AUTHOR_SUMMARY[locale].includes(OWNER.name));
    assert.ok(author.SITE_AUTHOR_SUMMARY[locale].length <= 165, `${locale}: summary is the meta description`);

    // Every heading and paragraph is the about page's, word for word.
    const about = aboutCopy(locale);
    const aboutTexts = new Set([about.lead, ...[about.who, about.what, about.how, about.ai, about.funding, about.help].flatMap((s) => [s.heading, ...s.paragraphs])]);
    const { intro, method } = author.siteAuthorBlocks(locale);
    for (const block of [...intro, ...method]) {
      if (block.type === "paragraph" && block.lead) {
        assert.equal(block.text, author.SITE_AUTHOR_SUMMARY[locale]);
        continue;
      }
      assert.ok(block.type === "heading" || block.type === "paragraph");
      assert.ok(aboutTexts.has(block.text), `${locale}: "${block.text.slice(0, 60)}" is not on the about page`);
    }
    // The method section links the editorial policy; the who section his profiles.
    const all = [...intro, ...method].map((b) => ("text" in b ? b.text : "")).join("\n");
    assert.ok(all.includes(`/${locale}/legal/`), `${locale}: editorial policy link`);
    for (const link of Object.values(OWNER.links)) assert.ok(all.includes(link), `${locale}: ${link}`);
  }
});

test("the catch-all route renders, prerenders and indexes the founder's page in the three languages", () => {
  const page = readFileSync(join(SRC, "app", "(public)", "[locale]", "[...slug]", "page.tsx"), "utf8");
  assert.match(page, /slug: siteAuthorPath\(locale\)/, "prerendered");
  assert.match(page, /resolution\.slug === SITE_AUTHOR_SLUG/, "rendered from code");
  assert.match(page, /entry: withByline\(entry\)/, "every entry gets its byline before render, metadata and JSON-LD");
  // The founder's page metadata carries no noindex.
  const metaBlock = page.slice(page.indexOf("if (resolution.slug === SITE_AUTHOR_SLUG) {"), page.indexOf("const found = await getAuthorBySlug"));
  assert.doesNotMatch(metaBlock, /noindex/);
  const sitemap = readFileSync(join(SRC, "app", "sitemap.ts"), "utf8");
  assert.match(sitemap, /absoluteUrl\(siteAuthorPath\(locale\)\)/, "listed in the sitemap");
  // The byline the article header shows links to the author page.
  const article = readFileSync(join(SRC, "components", "pages", "EntryArticle.tsx"), "utf8");
  assert.match(article, /\{t\.meta\.by\}[\s\S]{0,80}sectionPath\("authors", locale\)\}\$\{entry\.author\.slug\}/);
});

/* -------------------------------------------------------------------------- */
/* Crops                                                                      */
/* -------------------------------------------------------------------------- */

test("open licences only: CC0, CC BY, CC BY-SA, public domain, GFDL", () => {
  for (const ok of ["CC0", "CC BY 2.0", "CC BY 4.0", "CC BY-SA 3.0", "CC BY-SA 3.0 es", "CC BY-SA 4.0", "PD", "Public domain", "GFDL"]) {
    assert.ok(images.isOpenLicence(ok), ok);
  }
  for (const no of ["CC BY-NC 4.0", "CC BY-ND 4.0", "CC BY-NC-SA 4.0", "All rights reserved", "", null, undefined]) {
    assert.ok(!images.isOpenLicence(no), String(no));
  }
  assert.equal(images.licenceUrl("CC BY-SA 3.0 es"), "https://creativecommons.org/licenses/by-sa/3.0/es/");
  assert.equal(images.licenceUrl("CC BY 2.0"), "https://creativecommons.org/licenses/by/2.0/");
  assert.equal(images.licenceUrl("CC0"), "https://creativecommons.org/publicdomain/zero/1.0/");
  assert.equal(images.licenceUrl("PD"), null);
  // Every licence in the manifest is either open or absent (AI illustrations).
  for (const image of IMAGES) assert.ok(!image.license || images.isOpenLicence(image.license), `${image.key}: ${image.license}`);
});

test("crops are exact ratios inside the original, never upscaled, and only offered at 1,200 px or more", () => {
  assert.deepEqual(images.cropSize(1920, 1280, "16x9"), { width: 1920, height: 1080 });
  assert.deepEqual(images.cropSize(1920, 1280, "4x3"), { width: 1704, height: 1278 });
  assert.deepEqual(images.cropSize(1920, 1280, "1x1"), { width: 1280, height: 1280 });
  for (const image of IMAGES) {
    const crops = images.discoverCrops(image);
    if (!images.isOpenLicence(image.license)) {
      assert.equal(crops.length, 0, image.key);
      continue;
    }
    for (const crop of crops) {
      assert.ok(crop.width >= 1200 && crop.width <= image.width && crop.height <= image.height, `${image.key} ${crop.ratio}`);
      const [rw, rh] = images.CROP_RATIOS[crop.ratio];
      assert.equal(crop.width * rh, crop.height * rw, `${image.key} ${crop.ratio}`);
      assert.equal(crop.url, `/img/${crop.ratio}/${image.key}.jpg`);
    }
    // 16:9 first: og:image and the feed take it.
    if (crops.length > 0) assert.equal(crops[0]!.ratio, "16x9", image.key);
  }
});

test("the crop route serves only declared crops, as JPEG at the declared size, cacheable", async () => {
  const route = await import("../src/app/img/[ratio]/[file]/route.ts");
  const call = (ratio: string, file: string) => route.GET(new Request(`${ORIGIN}/img/${ratio}/${file}`), { params: Promise.resolve({ ratio, file }) });
  const crop = images.discoverCrops(LICENSED).find((c) => c.ratio === "4x3")!;
  const response = await call("4x3", `${LICENSED.key}.jpg`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.match(response.headers.get("cache-control") ?? "", /^public, .*s-maxage=\d+/);
  const bytes = Buffer.from(await response.arrayBuffer());
  const { default: sharp } = await import("sharp");
  const meta = await sharp(bytes).metadata();
  assert.equal(meta.format, "jpeg");
  assert.equal(meta.width, crop.width);
  assert.equal(meta.height, crop.height);

  assert.equal((await call("4x3", `${UNLICENSED.key}.jpg`)).status, 404, "unlicensed");
  assert.equal((await call("3x2", `${LICENSED.key}.jpg`)).status, 404, "unknown ratio");
  assert.equal((await call("4x3", `${LICENSED.key}.webp`)).status, 404, "not a declared file");
  assert.equal((await call("4x3", "..%2Fsecret.jpg")).status, 404, "traversal");
  assert.equal((await call("4x3", "nope.jpg")).status, 404, "unknown key");
  assert.equal(images.manifestImage(`${ORIGIN}${LICENSED.url}`), IMAGE_BY_KEY.get(LICENSED.key));
});

/* -------------------------------------------------------------------------- */
/* Robots meta, head links                                                    */
/* -------------------------------------------------------------------------- */

test("indexable pages allow large image previews in robots and googlebot, and link this language's feed", () => {
  for (const locale of LOCALES) {
    const meta = buildMetadata({ locale, path: `/${locale}/x/`, title: "X" });
    const robots = meta.robots as Json;
    assert.equal(robots["max-image-preview"], "large");
    assert.equal((robots.googleBot as Json)["max-image-preview"], "large");
    assert.equal(robots.index, true);
    const types = (meta.alternates as Json).types as Record<string, { url: string; title: string }[]>;
    assert.deepEqual(types["application/rss+xml"], [{ url: `${ORIGIN}/${locale}/feed.xml`, title: feedPaths.feedTitle(SITE.name, locale) }]);
    // Canonical and hreflang are untouched.
    assert.equal((meta.alternates as Json).canonical, `${ORIGIN}/${locale}/x/`);
  }
  const hidden = buildMetadata({ locale: "ca", path: "/ca/x/", title: "X", noindex: true }).robots as Json;
  assert.equal(hidden.index, false);
  const signed = buildMetadata({ locale: "ca", path: "/ca/x/", title: "X", authorLink: { name: OWNER.name, path: "/ca/autors/marti-aguilera/" } });
  assert.deepEqual(signed.authors, [{ name: OWNER.name, url: `${ORIGIN}/ca/autors/marti-aguilera/` }]);
});

/* -------------------------------------------------------------------------- */
/* RSS and the Google News sitemap                                            */
/* -------------------------------------------------------------------------- */

/**
 * Minimal XML well-formedness: one root, every tag closed in order, every
 * attribute quoted, and no raw `&` or `<` in text.
 */
function assertWellFormed(xml: string): string {
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n'), "XML declaration");
  const body = xml.slice(xml.indexOf("?>") + 2);
  const stack: string[] = [];
  let root = "";
  const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g;
  let last = 0;
  for (const match of body.matchAll(tag)) {
    const text = body.slice(last, match.index);
    assert.doesNotMatch(text, /<|&(?!(?:amp|lt|gt|quot|apos);)/, `raw markup in text: ${text.slice(0, 60)}`);
    last = (match.index ?? 0) + match[0].length;
    const [, closing, name = "", , selfClosing] = match;
    if (closing) {
      assert.equal(stack.pop(), name, `</${name}> closes the wrong element`);
    } else if (!selfClosing) {
      if (stack.length === 0) {
        assert.equal(root, "", "a single root element");
        root = name;
      }
      stack.push(name);
    }
  }
  assert.equal(body.slice(last).trim(), "", "nothing after the root");
  assert.deepEqual(stack, [], "every element closed");
  return root;
}

function elements(xml: string, name: string): string[] {
  return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "g"))].map((m) => m[1] ?? "");
}

const RFC822 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;

function feedItemFixture(i: number, updated: string, published = "2026-10-01T10:00:00Z") {
  return {
    title: `Guía ${i} & <más>`,
    url: `${ORIGIN}/es/guias/g${i}/`,
    description: `Qué "hay" ${i}`,
    publishedAt: new Date(published),
    updatedAt: new Date(updated),
    author: OWNER.name,
    category: "Servicios",
    image: { url: `${ORIGIN}/img/16x9/k${i}.jpg`, width: 1920, height: 1080, type: "image/jpeg", credit: "A & B" },
  };
}

test("each RSS feed is well-formed RSS 2.0, newest modification first, with real dates", () => {
  const items = Array.from({ length: 60 }, (_, i) => feedItemFixture(i, new Date(Date.UTC(2026, 9, 1 + (i % 30), i % 24)).toISOString()));
  const xml = feeds.buildRss({
    locale: "es",
    siteName: SITE.name,
    homeUrl: `${ORIGIN}/es/`,
    selfUrl: `${ORIGIN}/es/feed.xml`,
    description: "La guía",
    items,
  });
  assert.equal(assertWellFormed(xml), "rss");
  assert.match(xml, /<rss version="2\.0" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
  const channel = elements(xml, "channel")[0]!;
  for (const required of ["title", "link", "description"]) assert.ok(elements(channel, required).length > 0, `channel ${required}`);
  assert.match(channel, /<atom:link href="https:\/\/www\.catalunyainfo\.com\/es\/feed\.xml" rel="self" type="application\/rss\+xml"\/>/);
  assert.equal(elements(channel, "language")[0], "es");

  const blocks = elements(xml, "item");
  assert.equal(blocks.length, feeds.FEED_SIZE, "capped at FEED_SIZE");
  const updated = blocks.map((b) => Date.parse(elements(b, "atom:updated")[0]!));
  for (let i = 1; i < updated.length; i++) assert.ok(updated[i - 1]! >= updated[i]!, "ordered by dateModified");
  // lastBuildDate is the newest item's modification, not the render time.
  assert.equal(Date.parse(elements(channel, "lastBuildDate")[0]!), updated[0]);
  for (const block of blocks) {
    assert.ok(elements(block, "title")[0]!.includes("&amp; &lt;más&gt;"), "escaped title");
    const link = elements(block, "link")[0]!;
    assert.equal(elements(block, "guid")[0], link);
    assert.match(elements(block, "pubDate")[0]!, RFC822);
    assert.ok(Date.parse(elements(block, "atom:updated")[0]!) >= Date.parse(elements(block, "pubDate")[0]!));
    assert.equal(elements(block, "dc:creator")[0], OWNER.name);
    assert.match(block, /<media:content url="[^"]+\.jpg" medium="image" type="image\/jpeg" width="1920" height="1080">/);
  }
  // An empty feed is still valid.
  assert.equal(assertWellFormed(feeds.buildRss({ locale: "ca", siteName: SITE.name, homeUrl: `${ORIGIN}/ca/`, selfUrl: `${ORIGIN}/ca/feed.xml`, description: "x", items: [] })), "rss");
});

test("feed items carry the byline, the 16:9 crop of a licensed photo, and never a date before publication", () => {
  const guide = feeds.feedItem(summary({ hero: media(LICENSED.url, LICENSED.width, LICENSED.height) }));
  assert.equal(guide.author, OWNER.name);
  assert.equal(guide.url, `${ORIGIN}/es/guias/huelga-11-noviembre/`);
  assert.equal(guide.image?.url, `${ORIGIN}/img/16x9/${LICENSED.key}.jpg`);
  assert.equal(guide.image?.type, "image/jpeg");
  assert.ok(guide.image!.width >= 1200);
  const page = feeds.feedItem(summary({ type: "page", hero: media(UNLICENSED.url, UNLICENSED.width, UNLICENSED.height) }));
  assert.equal(page.author, null);
  assert.equal(page.image?.url, `${ORIGIN}${UNLICENSED.url}`, "unlicensed illustration: the file as it is, no crop");
  const early = feeds.feedItem(summary({ updatedAt: new Date("2026-01-01T00:00:00Z") }));
  assert.equal(early.updatedAt.getTime(), early.publishedAt.getTime());
});

test("the Google News sitemap is well-formed and lists only pieces published or modified in the last 48 hours", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  const row = (i: number, updated: string, published = "2026-10-29T19:00:00Z") => ({
    url: `${ORIGIN}/ca/guies/g${i}/`,
    locale: "ca" as const,
    title: `Vaga ${i} & serveis`,
    publishedAt: new Date(published),
    updatedAt: new Date(updated),
  });
  const xml = feeds.buildNewsSitemap(SITE.name, [
    row(1, "2026-11-05T11:00:00Z"), // modified 25 h ago: listed
    row(2, "2026-11-04T11:00:00Z"), // 49 h ago: out
    row(3, "2026-11-06T09:00:00Z", "2026-11-06T09:00:00Z"), // new today
    row(4, "2026-11-07T09:00:00Z", "2026-11-07T09:00:00Z"), // scheduled, not yet published: out
  ], now);
  assert.equal(assertWellFormed(xml), "urlset");
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9" xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9">/);
  const urls = elements(xml, "url");
  assert.deepEqual(urls.map((u) => elements(u, "loc")[0]), [`${ORIGIN}/ca/guies/g3/`, `${ORIGIN}/ca/guies/g1/`]);
  for (const url of urls) {
    const news = elements(url, "news:news")[0]!;
    const publication = elements(news, "news:publication")[0]!;
    assert.equal(elements(publication, "news:name")[0], SITE.name);
    assert.equal(elements(publication, "news:language")[0], "ca");
    assert.match(elements(news, "news:publication_date")[0]!, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.ok(elements(news, "news:title")[0]!.includes("&amp;"));
  }
  // The real publication date, not the modification.
  assert.equal(elements(urls[1]!, "news:publication_date")[0], "2026-10-29T19:00:00.000Z");
  // A quiet day: an empty, valid urlset.
  assert.equal(assertWellFormed(feeds.buildNewsSitemap(SITE.name, [], now)), "urlset");
  // Never more than 1,000 entries.
  const many = Array.from({ length: 1200 }, (_, i) => row(i, "2026-11-06T10:00:00Z"));
  assert.equal(elements(feeds.buildNewsSitemap(SITE.name, many, now), "url").length, feeds.NEWS_SITEMAP_MAX);
});

test("the feed routes answer real XML without a database, and an unknown locale is a 404", async () => {
  const feed = await import("../src/app/(public)/[locale]/feed.xml/route.ts");
  const response = await feed.GET(new Request(`${ORIGIN}/ca/feed.xml`), { params: Promise.resolve({ locale: "ca" }) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/rss\+xml/);
  assert.equal(assertWellFormed(await response.text()), "rss");
  assert.equal((await feed.GET(new Request(`${ORIGIN}/xx/feed.xml`), { params: Promise.resolve({ locale: "xx" }) })).status, 404);

  const news = await import("../src/app/news-sitemap.xml/route.ts");
  const sitemap = await news.GET();
  assert.match(sitemap.headers.get("content-type") ?? "", /^application\/xml/);
  assert.equal(assertWellFormed(await sitemap.text()), "urlset");
});

/* -------------------------------------------------------------------------- */
/* Wiring: robots.txt, caching, revalidation                                  */
/* -------------------------------------------------------------------------- */

test("robots.txt names the news sitemap; feeds are shareable in caches and revalidated by every publish", async () => {
  const robots = readFileSync(join(SRC, "app", "robots.ts"), "utf8");
  assert.match(robots, /sitemap: \[absoluteUrl\("\/sitemap\.xml"\), absoluteUrl\(NEWS_SITEMAP_PATH\)\]/);
  assert.equal(feedPaths.NEWS_SITEMAP_PATH, "/news-sitemap.xml");
  assert.deepEqual([...feedPaths.FEED_PATHS], ["/ca/feed.xml", "/es/feed.xml", "/en/feed.xml", "/news-sitemap.xml"]);

  // next.config: the last Cache-Control rule matching each feed URL is public with an s-maxage.
  const { default: config } = await import("../next.config.ts");
  const { getPathMatch } = (await import("next/dist/shared/lib/router/utils/path-match.js")).default as {
    getPathMatch: (source: string, options: Json) => (path: string) => unknown;
  };
  const rules = (await config.headers!()) as { source: string; headers: { key: string; value: string }[] }[];
  for (const path of feedPaths.FEED_PATHS) {
    const values = rules
      .filter((rule) => getPathMatch(rule.source, { strict: true, removeUnnamedParams: true })(path))
      .flatMap((rule) => rule.headers.filter((h) => h.key.toLowerCase() === "cache-control").map((h) => h.value));
    const last = values.at(-1) ?? "";
    assert.match(last, /^public, max-age=0, s-maxage=\d+, stale-while-revalidate=\d+$/, path);
    assert.doesNotMatch(last, /private|no-store/, path);
  }

  // Regenerated by path after a publish: dynamicParams must stay true (self-hosted NoFallbackError).
  const route = readFileSync(join(SRC, "app", "(public)", "[locale]", "feed.xml", "route.ts"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(route, /^export const dynamicParams = true;$/m);
  assert.match(route, /^export const revalidate = \d+;$/m);
  for (const file of [join(SRC, "app", "api", "admin", "publish", "route.ts"), join(SRC, "app", "api", "cron", "publish-scheduled", "route.ts"), join(SRC, "lib", "admin", "actions.ts")]) {
    assert.match(readFileSync(file, "utf8"), /FEED_PATHS/, `${file}: feeds revalidated (and purged) with the sitemap`);
  }
});

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : full.endsWith(".ts") ? [full] : [];
  });
}
