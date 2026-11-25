import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { REIS } from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { SHOPS, OPENING_2027 } from "../src/lib/content/batch02/shops.ts";
import { WINTER_SALES, WINTER_SALES_GUIDE, WINTER_SALES_SOURCES, buildWinterSalesBody } from "../src/lib/content/batch02/winter-sales.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const today = new Date().toISOString().slice(0, 10);
const json = (locale: Locale) => JSON.stringify(WINTER_SALES_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(WINTER_SALES_GUIDE.editions[locale].blocks);
const lead = (locale: Locale) => (WINTER_SALES_GUIDE.editions[locale].blocks[0] as { text: string }).text;
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);

test("winter sales: the facts come from one module and agree with the shops guide's 2027 days", () => {
  assert.equal(WINTER_SALES.firstSunday, "2027-01-03");
  assert.equal(weekdayIndex(WINTER_SALES.firstSunday), 0, "3 January 2027 is a Sunday");
  assert.equal(WINTER_SALES.firstSunday, OPENING_2027.general[0]);
  assert.equal(WINTER_SALES.defaultSunday, OPENING_2027.municipalDefault[0]);
  assert.equal(weekdayIndex(WINTER_SALES.defaultSunday), 0);
  assert.deepEqual(WINTER_SALES.lastRecommendation, { published: "2022-12-02", from: { month: 1, day: 7 }, to: { month: 3, day: 30 } });
  assert.deepEqual(WINTER_SALES.consumer, { originalPriceDays: 30, onlineDays: 14, complaintDays: 30, stockMonths: 1 });
});

test("winter sales: three editions render, valid, same shape, year-free paths", () => {
  assert.equal(WINTER_SALES_GUIDE.key, "winterSales");
  const shape = (locale: Locale) => (WINTER_SALES_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const edition = WINTER_SALES_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.winterSales[locale]);
    assert.ok(edition.path.startsWith(locale === "ca" ? "guies/" : locale === "es" ? "guias/" : "guides/"));
    assert.doesNotMatch(edition.path, /\d{4}/);
    assert.ok(B2_TITLES.winterSales[locale].length > 20);
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 900, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"));
    assert.deepEqual(buildWinterSalesBody(locale), edition.blocks);
    assert.ok(edition.seoTitle.length > 10 && edition.seoTitle.length <= 65, `${locale} seoTitle ${edition.seoTitle.length}`);
    assert.ok(edition.seoDescription.length > 60 && edition.seoDescription.length <= 165, `${locale} description ${edition.seoDescription.length}`);
    assert.match(edition.title, /2027/);
  }
});

test("winter sales: hreflang cluster is reciprocal (one entry, three editions, each under its own locale)", () => {
  const hrefs = LOCALES.map((l) => b2href("winterSales", l));
  assert.equal(new Set(hrefs).size, 3);
  assert.deepEqual(hrefs, ["/ca/guies/rebaixes-hivern-catalunya/", "/es/guias/rebajas-invierno-cataluna/", "/en/guides/winter-sales-barcelona-catalonia/"]);
  assert.deepEqual(Object.keys(WINTER_SALES_GUIDE.editions).sort(), ["ca", "en", "es"]);
  assert.equal(WINTER_SALES_GUIDE.entryKey, "guide-winter-sales-catalonia");
});

test("winter sales: the lead says what the law says and prints no invented start or end date", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/no tenen una data d'inici ni de final fixada per la llei/, /diumenge 3 de gener/, /2 de desembre de 2022/, /7 de gener/, /30 de març/],
    es: [/no tienen una fecha de inicio ni de fin fijada por ley/, /domingo 3 de enero/, /2 de diciembre de 2022/, /7 de enero/, /30 de marzo/],
    en: [/no start or end date set by law/, /Sunday 3 January/, /2 December 2022/, /7 January/, /30 March/],
  };
  for (const locale of LOCALES) {
    for (const re of must[locale]) assert.match(lead(locale), re, `${locale}: ${re}`);
    // The "7 Jan - 6 Mar" figure of the media is not official: never in the lead or the key facts.
    const keyFacts = JSON.stringify(WINTER_SALES_GUIDE.editions[locale].blocks.slice(0, 2));
    assert.doesNotMatch(keyFacts, /6 de març|6 de marzo|6 March/, `${locale}: 6 March is not an official end`);
  }
});

test("winter sales: rights come with the Consum page's numbers, and the State paragraph cites art. 25", () => {
  for (const locale of LOCALES) {
    assert.match(text(locale), /30/, locale);
    assert.match(text(locale), /14/, locale);
    assert.match(text(locale), /(Llei 7\/1996|Ley 7\/1996|Law 7\/1996)/, locale);
    assert.match(text(locale), /(Reial decret llei 20\/2012|Real Decreto-ley 20\/2012|Royal Decree-law 20\/2012)/, locale);
    assert.match(json(locale), /"type":"faq"/);
  }
});

test("winter sales: internal links stay in the language, end in a slash; shops and holidays are linked", () => {
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("/"))) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/);
    }
    for (const key of ["shops", "barcelonaDecember", "newYear", "reis", "holidayToday"] as const) {
      assert.ok(links(locale).includes(b2href(key, locale)), `${locale}: links ${key}`);
    }
  }
});

test("winter sales: sources are https, unique, carry a bulletin ref, and no aggregator", () => {
  const urls = WINTER_SALES_SOURCES.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const source of WINTER_SALES_SOURCES) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.ref, `${source.name}: needs a bulletin or publication date`);
    assert.doesNotMatch(source.url, /aerobus|segre|elnacional|pixidia/i);
  }
  assert.match(urls.join(" "), /boe\.es.*consum\.gencat\.cat.*ccam\.gencat\.cat/);
  assert.equal(WINTER_SALES_GUIDE.verifiedAt, WINTER_SALES.asOf);
});

test("winter sales: the pages that link to it do, and the route has both groups", () => {
  assert.ok(IMAGES.some((image) => image.key === WINTER_SALES_GUIDE.heroKey));
  for (const locale of LOCALES) {
    const target = `](${b2href("winterSales", locale)})`;
    for (const [name, article] of [["shops", SHOPS], ["Barcelona in December", BARCELONA_DECEMBER], ["New Year", NEW_YEAR], ["Reis", REIS]] as const) {
      assert.ok(JSON.stringify(article.editions[locale].blocks).includes(target), `${name} ${locale}`);
    }
  }
  const holidayToday = readFileSync(new URL("../src/lib/content/holidays/today-publish.ts", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(holidayToday.includes(`](${b2href("winterSales", locale)})`), `holiday-today ${locale}`);
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("rebaixes"\)\) published\.push\(await publishB2Article\(WINTER_SALES_GUIDE\)\)/);
  assert.match(route, /wants\("rebaixes-links"\)/);
});

test("date guard: the Generalitat's pages are re-read for a 2027 recommendation by rereadBy", () => {
  assert.ok(WINTER_SALES.asOf < WINTER_SALES.rereadBy);
  assert.ok(
    today < WINTER_SALES.rereadBy || WINTER_SALES.asOf >= WINTER_SALES.rereadBy,
    `From ${WINTER_SALES.rereadBy}: re-read consum.gencat.cat/ca/els-meus-drets/rebaixes/, ccam.gencat.cat news and govern.cat for the Consell Assessor's 2027 recommendation (Llei 18/2017 art. 20.6; due before 30 Sept 2026). If published, print its dates in the lead and key facts (ca/es/en); then move WINTER_SALES.asOf/rereadBy.`,
  );
});

test("date guard: the page speaks of 3 January as ahead of us, so it is rewritten before rollBy", () => {
  assert.equal(WINTER_SALES.rollBy, WINTER_SALES.firstSunday);
  assert.ok(today < WINTER_SALES.rollBy, `${WINTER_SALES.rollBy} has come: rewrite the lead, table and FAQ in the past tense with the dates the sales really started, or roll the page to 2028 (ticket O2, review 2027-01-20)`);
});
