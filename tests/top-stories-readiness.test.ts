import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Absolute URLs and robots directives are built for production only.
process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
delete process.env.DATABASE_URL;

const dates = await import("../src/lib/seo/article-dates.ts");
const cards = await import("../src/lib/seo/cards.ts");
const jsonld = await import("../src/lib/seo/jsonld.ts");
const { buildMetadata } = await import("../src/lib/seo/metadata.ts");
const { formatDateAndTime } = await import("../src/lib/format.ts");
const { electionsHubMetadata } = await import("../src/lib/programmatic/elections/metadata.ts");
const electionPages = await import("../src/lib/programmatic/elections/pages.ts");
const gordoCopy = await import("../src/lib/programmatic/gordo/copy.ts");
const gordoData = await import("../src/lib/programmatic/gordo/data.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");

import type { EntryDetail } from "../src/lib/content/types.ts";

/**
 * Top Stories / Discover readiness (18 Nov 2026): dates that match between the
 * markup and the page and only move when the content does, and share cards for
 * the news-night hubs without a photograph. Google's texts quoted in
 * lib/seo/article-dates.ts and lib/seo/cards.ts.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/* -------------------------------------------------------------------------- */
/* Days and instants                                                          */
/* -------------------------------------------------------------------------- */

test("madridDay: the Madrid calendar day, across midnight and the clock change", () => {
  assert.equal(dates.madridDay(new Date("2026-11-17T23:30:00Z")), "2026-11-18");
  assert.equal(dates.madridDay(new Date("2026-11-17T22:59:59Z")), "2026-11-17");
  assert.equal(dates.madridDay(new Date("2026-07-17T22:30:00Z")), "2026-07-18");
});

test("articleDates: a verification stamp is a day, a real instant keeps its time", () => {
  const published = new Date("2026-11-17T12:00:00Z");
  const verifiedNoon = new Date("2026-11-18T10:00:00Z"); // "2026-11-18T12:00:00+02:00", as batch02 stores it

  const stamp = dates.articleDates({ publishedAt: published, updatedAt: verifiedNoon, lastVerifiedAt: verifiedNoon });
  assert.equal(stamp.modifiedTimeKnown, false);
  assert.equal(stamp.modifiedIso, "2026-11-18");
  assert.equal(stamp.publishedIso, "2026-11-17T12:00:00.000Z");
  assert.equal(stamp.showModified, true, "a later day is worth showing, without a time");

  const real = new Date("2026-11-18T08:41:00Z");
  const instant = dates.articleDates({ publishedAt: published, updatedAt: real, lastVerifiedAt: verifiedNoon });
  assert.equal(instant.modifiedTimeKnown, true);
  assert.equal(instant.modifiedIso, "2026-11-18T08:41:00.000Z");

  // Same day as the publication and no real time: "updated 17 Nov" says nothing.
  const sameDay = dates.articleDates({ publishedAt: new Date("2026-11-17T08:00:00Z"), updatedAt: new Date("2026-11-17T10:00:00Z"), lastVerifiedAt: new Date("2026-11-17T10:00:00Z") });
  assert.equal(sameDay.showModified, false);

  // Updated at publication: one date, the publication's, with its time.
  const once = dates.articleDates({ publishedAt: published, updatedAt: published, lastVerifiedAt: new Date("2026-11-17T10:00:00Z") });
  assert.equal(once.showModified, false);
  assert.equal(once.modifiedTimeKnown, true);
  assert.equal(once.modifiedIso, once.publishedIso);
});

test("formatDateAndTime: date, time and zone in each language", () => {
  const at = new Date("2026-11-17T12:00:00Z");
  assert.equal(formatDateAndTime(at, "es"), "17 de noviembre de 2026, 13:00 CET");
  assert.match(formatDateAndTime(at, "ca"), /^17 de novembre de(l)? 2026, 13:00 CET$/);
  assert.equal(formatDateAndTime(at, "en"), "17 November 2026, 13:00 CET");
  assert.match(formatDateAndTime(new Date("2026-07-01T07:05:00Z"), "es"), /09:05 CEST$/);
});

/* -------------------------------------------------------------------------- */
/* The publishers' rule: dateModified moves only with the verified content    */
/* -------------------------------------------------------------------------- */

const PUBLISHED = new Date("2026-11-17T12:00:00Z");
const NOON = (day: string) => new Date(`${day}T12:00:00+02:00`);
const edition = (lead: string) => dates.editionFingerprint({ title: "Huelga 19 de noviembre", excerpt: "x", seoTitle: null, seoDescription: null, body: [{ type: "paragraph", text: lead }] });

test("editionUpdatedAt: first publish on the verification day is the publication", () => {
  const at = dates.editionUpdatedAt({ now: new Date("2026-11-17T12:05:00Z"), publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-17"), fingerprint: edition("a"), previous: null });
  assert.equal(at.toISOString(), PUBLISHED.toISOString());
});

test("editionUpdatedAt: the same page re-sent does not move", () => {
  const previous = { updatedAt: new Date("2026-11-17T15:20:00Z"), fingerprint: edition("a") };
  const at = dates.editionUpdatedAt({ now: new Date("2026-11-18T19:23:00Z"), publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-18"), fingerprint: edition("a"), previous });
  assert.equal(at.toISOString(), previous.updatedAt.toISOString());
});

test("editionUpdatedAt: the 00:05 switch ('mañana' -> 'hoy') with the verification pinned does not move it", () => {
  const previous = { updatedAt: new Date("2026-11-17T15:20:00Z"), fingerprint: edition("Mañana, jueves 19") };
  const at = dates.editionUpdatedAt({ now: new Date("2026-11-18T23:05:00Z"), publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-17"), fingerprint: edition("Hoy, jueves 19"), previous });
  assert.equal(at.toISOString(), previous.updatedAt.toISOString());
});

test("editionUpdatedAt: content changed and verified today is dated by this publish, to the minute", () => {
  const now = new Date("2026-11-18T17:42:10Z");
  const previous = { updatedAt: new Date("2026-11-17T12:00:00Z"), fingerprint: edition("Adif: pendientes") };
  const at = dates.editionUpdatedAt({ now, publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-18"), fingerprint: edition("Adif: 75 %"), previous });
  assert.equal(at.toISOString(), now.toISOString());
  // Same day, a second change: dated again.
  const later = new Date("2026-11-18T20:10:00Z");
  const again = dates.editionUpdatedAt({ now: later, publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-18"), fingerprint: edition("Adif: 75 % y 50 %"), previous: { updatedAt: at, fingerprint: edition("Adif: 75 %") } });
  assert.equal(again.toISOString(), later.toISOString());
});

test("editionUpdatedAt: a check from an earlier day not yet recorded keeps its day, never 'now'", () => {
  const previous = { updatedAt: new Date("2026-11-17T12:00:00Z"), fingerprint: edition("a") };
  const at = dates.editionUpdatedAt({ now: new Date("2026-11-20T09:00:00Z"), publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-19"), fingerprint: edition("b"), previous });
  assert.equal(at.toISOString(), NOON("2026-11-19").toISOString());
});

test("editionUpdatedAt: never before the publication, never after now", () => {
  const now = new Date("2026-11-17T12:30:00Z");
  const early = dates.editionUpdatedAt({ now, publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-10"), fingerprint: edition("a"), previous: { updatedAt: new Date("2026-11-01T00:00:00Z"), fingerprint: edition("a") } });
  assert.equal(early.toISOString(), PUBLISHED.toISOString());
  const future = dates.editionUpdatedAt({ now, publishedAt: PUBLISHED, verifiedAt: NOON("2026-11-17"), fingerprint: edition("a"), previous: { updatedAt: new Date("2026-11-30T00:00:00Z"), fingerprint: edition("a") } });
  assert.equal(future.toISOString(), now.toISOString());
});

test("editionFingerprint: a body read back from jsonb (keys reordered) is the same page", () => {
  const written = { title: "T", excerpt: "E", seoTitle: "S", seoDescription: null, body: [{ type: "paragraph", text: "x", extra: undefined }, { type: "list", items: ["a", "b"] }] };
  const readBack = { seoDescription: null, seoTitle: "S", body: [{ text: "x", type: "paragraph" }, { items: ["a", "b"], type: "list" }], excerpt: "E", title: "T" };
  assert.equal(dates.editionFingerprint(written), dates.editionFingerprint(readBack));
  assert.notEqual(dates.editionFingerprint(written), dates.editionFingerprint({ ...readBack, title: "T2" }));
});

test("both code publishers use the rule; none stamps a translation 'updated now' on a re-send", () => {
  for (const path of ["src/lib/content/publish-article.ts", "src/lib/content/pages/publish.ts"]) {
    const source = read(path);
    assert.match(source, /editionUpdatedAt\(/, path);
    assert.match(source, /editionFingerprint\(previous\)/, path);
    assert.doesNotMatch(source, /noindex: false,[\s\S]{0,200}updatedAt: now/, `${path}: translation values still stamp now`);
  }
});

/* -------------------------------------------------------------------------- */
/* Markup, Open Graph and the page say the same thing                         */
/* -------------------------------------------------------------------------- */

function entry(overrides: Partial<EntryDetail> = {}): EntryDetail {
  return {
    entryId: "e1", translationId: "t1", type: "guide", locale: "es", title: "Huelga 19 de noviembre", path: "guias/huelga-19-noviembre",
    href: "/es/guias/huelga-19-noviembre/", excerpt: "Qué hay.", hero: null, publishedAt: PUBLISHED, updatedAt: new Date("2026-11-18T08:41:00Z"),
    lastVerifiedAt: NOON("2026-11-18"), readingMinutes: 5, category: null, authorName: null, isFeatured: false,
    key: "guide-strike-19-november-2026-spain", status: "published", body: [], noindex: false, canonicalUrl: null, seoTitle: null,
    seoDescription: null, og: null, author: null, tags: [], categories: [], sources: [], related: [], translations: {}, place: null,
    event: null, route: null, isDemo: false, breadcrumbs: [], ...overrides,
  };
}

test("NewsArticle dates = article:*_time = the <time datetime> values", () => {
  for (const e of [entry(), entry({ updatedAt: NOON("2026-11-18") })]) {
    const d = dates.articleDates(e);
    const node = jsonld.articleSchema(e);
    assert.equal(node["@type"], "NewsArticle");
    assert.equal(node.isAccessibleForFree, true);
    assert.equal(node.datePublished, d.publishedIso);
    assert.equal(node.dateModified, d.modifiedIso);
    const og = buildMetadata({ locale: "es", path: e.href, title: e.title, type: "article", publishedTime: d.publishedIso, modifiedTime: d.modifiedIso }).openGraph as Record<string, unknown>;
    assert.equal(og.publishedTime, d.publishedIso);
    assert.equal(og.modifiedTime, d.modifiedIso);
  }
  const page = read("src/app/(public)/[locale]/[...slug]/page.tsx");
  assert.match(page, /publishedTime: articleDates\(entry\)\.publishedIso/);
  assert.match(page, /modifiedTime: articleDates\(entry\)\.modifiedIso/);
});

test("the article header shows those instants: date and time on news pages, between the H1 and the text", () => {
  const header = read("src/components/pages/EntryArticle.tsx");
  assert.match(header, /const dates = articleDates\(entry\)/);
  assert.match(header, /<time dateTime=\{dates\.publishedIso \?\? undefined\}>/);
  assert.match(header, /<time dateTime=\{dates\.modifiedIso\}>/);
  assert.match(header, /news \? formatDateAndTime\(published, locale\)/);
  assert.match(header, /news && dates\.modifiedTimeKnown/);
  // H1 before the dates, dates before the body.
  assert.ok(header.indexOf("<h1") < header.indexOf("dates.publishedIso") && header.indexOf("dates.publishedIso") < header.indexOf("<BlockRenderer"));
});

/* -------------------------------------------------------------------------- */
/* Share cards for the news-night hubs                                        */
/* -------------------------------------------------------------------------- */

test("cards: one per hub and language, 1200 x 675, the hub's own H1", () => {
  const all = cards.allCards();
  assert.equal(all.length, 2 * LOCALES.length);
  assert.ok(cards.CARD_WIDTH >= 1200 && cards.CARD_WIDTH * 9 === cards.CARD_HEIGHT * 16, "Discover: at least 1200 px wide, 16:9");
  for (const locale of LOCALES) {
    assert.equal(cards.cardContent("elections", locale).title, electionPages.hubMeta(locale).h1);
    assert.equal(cards.cardContent("gordo", locale).title, gordoCopy.hubMeta(locale, gordoData.SNAPSHOT).h1);
    assert.match(cards.cardContent("gordo", locale).dateLine, /22/);
    assert.match(cards.cardContent("elections", locale).dateLine, /29/);
  }
});

test("cards: the route serves only the current hash, from the registry, never request text", () => {
  for (const { family, file, locale } of cards.allCards()) {
    const found = cards.resolveCard(family, file);
    assert.ok(found, `${family}/${file}`);
    assert.equal(found.locale, locale);
    assert.equal(cards.cardPath(family, locale), `/card/${family}/${file}`);
  }
  assert.equal(cards.resolveCard("gordo", "es-0000000000.png"), null);
  assert.equal(cards.resolveCard("gordo", "xx-0000000000.png"), null);
  assert.equal(cards.resolveCard("strikes", "es-0000000000.png"), null);
  assert.equal(cards.resolveCard("gordo", "es-abc.png?x=1"), null);
  const route = read("src/app/card/[family]/[file]/route.tsx");
  assert.match(route, /resolveCard\(family, file\)/);
  assert.match(route, /status: 404/);
  assert.doesNotMatch(route, /searchParams/);
});

test("cards: the elections and Gordo hubs share their card instead of the site-wide one", () => {
  for (const locale of LOCALES) {
    const og = electionsHubMetadata(locale).openGraph as { images: { url: string; width: number; height: number }[] };
    assert.equal(og.images[0]!.url, `https://www.catalunyainfo.com${cards.cardPath("elections", locale)}`);
    assert.equal(og.images[0]!.width, 1200);
    assert.equal(og.images[0]!.height, 675);
  }
  assert.match(read("src/components/programmatic/gordo/routes.tsx"), /gordoHubTranslations\(\), cardImage\("gordo", locale\)\)/);
});
