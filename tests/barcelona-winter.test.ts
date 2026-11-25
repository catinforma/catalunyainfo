import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, slugifyAnchor, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { BARCELONA_WINTER, BARCELONA_WINTER_GUIDE, BARCELONA_WINTER_SOURCES, WINTER_HOLIDAYS, buildBarcelonaWinterBody } from "../src/lib/content/batch02/barcelona-winter.ts";
import { CARNIVAL } from "../src/lib/content/batch02/carnival.ts";
import { CLIMATE, monthAnchor } from "../src/lib/content/batch02/climate.ts";
import { ANNOUNCED_2027 } from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import { OPENING_2027 } from "../src/lib/content/batch02/shops.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const today = new Date().toISOString().slice(0, 10);
const W = BARCELONA_WINTER;
const json = (locale: Locale) => JSON.stringify(BARCELONA_WINTER_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(BARCELONA_WINTER_GUIDE.editions[locale].blocks);
const lead = (locale: Locale) => (BARCELONA_WINTER_GUIDE.editions[locale].blocks[0] as { text: string }).text;
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);

test("winter hub: dates come from the shared modules and fall on the weekdays the page says", () => {
  assert.deepEqual(WINTER_HOLIDAYS, ["2027-01-01", "2027-01-06"], "only 1 and 6 January are holidays in Jan-Feb 2027");
  assert.equal(weekdayIndex(OPENING_2027.general[0]), 0);
  assert.equal(weekdayIndex(W.santAntoni), 0, "17 January 2027 is a Sunday: the council's rule then gives the next Saturday");
  assert.equal(W.tresTombs, "2027-01-23");
  assert.equal(weekdayIndex(W.tresTombs), 6);
  assert.equal(weekdayIndex(W.santaEulalia), 5);
  assert.equal(CARNIVAL.dijousGras, "2027-02-04");
  assert.equal(CARNIVAL.ashWednesday, "2027-02-10");
  assert.equal(weekdayIndex(W.santaEulalia2026.from), 4);
});

test("winter hub: three editions render, valid, same shape, year-free paths, hreflang trio", () => {
  const shape = (locale: Locale) => (BARCELONA_WINTER_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  assert.equal(BARCELONA_WINTER_GUIDE.key, "barcelonaWinter");
  assert.deepEqual(
    LOCALES.map((l) => b2href("barcelonaWinter", l)),
    ["/ca/guies/barcelona-gener-febrer/", "/es/guias/barcelona-enero-febrero/", "/en/guides/barcelona-in-january-february/"],
  );
  for (const locale of LOCALES) {
    const edition = BARCELONA_WINTER_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.barcelonaWinter[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/);
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1100, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"));
    assert.deepEqual(buildBarcelonaWinterBody(locale), edition.blocks);
    assert.ok(edition.seoTitle.length <= 65, `${locale} seoTitle ${edition.seoTitle.length}`);
    assert.ok(edition.seoDescription.length > 60 && edition.seoDescription.length <= 165, `${locale} description ${edition.seoDescription.length}`);
    assert.match(json(locale), /"type":"faq"/);
  }
});

test("winter hub: the lead answers first and the derived date says it is derived", () => {
  assert.match(lead("en"), /two public holidays/);
  assert.match(lead("en"), /Friday 1 January/);
  assert.match(lead("en"), /Wednesday 6 January/);
  assert.match(lead("ca"), /divendres 1 de gener/);
  assert.match(lead("es"), /miércoles 6 de enero/);
  assert.match(text("en"), /by that rule/);
  assert.match(text("ca"), /amb aquesta regla/);
  assert.match(text("es"), /con esa regla/);
  for (const locale of LOCALES) assert.match(text(locale), /2027 programme|programa del 2027|programa de 2027/, locale);
});

test("winter hub: pending items are still pending in the modules the page relies on", () => {
  assert.equal(ANNOUNCED_2027.barcelona, null, "Barcelona Reis 2027 got announced: print it, then move asOf");
});

test("winter hub: weather anchors exist in the weather guide, links stay in the language", () => {
  for (const locale of LOCALES) {
    const climateJson = JSON.stringify(CLIMATE.editions[locale].blocks);
    for (const i of [0, 1]) {
      assert.ok(links(locale).includes(`${b2href("climate", locale)}#${monthAnchor(locale, i)}`), `${locale} month ${i} anchor linked`);
      assert.ok(climateJson.includes(`"id":"${monthAnchor(locale, i)}"`), `${locale}: weather guide has anchor ${monthAnchor(locale, i)}`);
    }
    for (const href of links(locale).filter((h) => h.startsWith("/"))) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href}`);
      assert.match(href, /\/$|\/#/);
    }
    for (const key of ["barcelonaDecember", "climate", "winterSales", "shops", "reis", "carnival", "calcots", "christmasTransport", "transport"] as const) {
      assert.ok(links(locale).some((h) => h.startsWith(b2href(key, locale))), `${locale}: links ${key}`);
    }
  }
  assert.equal(slugifyAnchor("Barcelona in January"), monthAnchor("en", 0));
});

test("winter hub: sources are https and unique, hero has credit, agenda links are the agenda's", () => {
  const urls = BARCELONA_WINTER_SOURCES.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    assert.match(url, /^https:\/\//);
    assert.doesNotMatch(url, /aerobus/i);
  }
  const hero = IMAGES.find((i) => i.key === BARCELONA_WINTER_GUIDE.heroKey);
  assert.ok(hero?.credit && hero.license, "hero has credit and licence");
  for (const locale of LOCALES) assert.match(json(locale), /agenda\.cultura\.gencat\.cat\/ca\/activitat\.html\/\d+/);
});

test("winter hub: linked from December and the weather guide; route has both groups", () => {
  for (const locale of LOCALES) {
    const target = `](${b2href("barcelonaWinter", locale)})`;
    assert.ok(JSON.stringify(BARCELONA_DECEMBER.editions[locale].blocks).includes(target), `December ${locale}`);
    assert.ok(JSON.stringify(CLIMATE.editions[locale].blocks).includes(target), `weather ${locale}`);
  }
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("barcelona-gener-febrer"\)\) published\.push\(await publishB2Article\(BARCELONA_WINTER_GUIDE\)\)/);
  assert.match(route, /wants\("barcelona-gener-febrer-links"\)/);
});

test("date guard: Barcelona's pending items are re-read by rereadBy", () => {
  assert.ok(W.asOf < W.rereadBy);
  assert.ok(
    today < W.rereadBy || W.asOf >= W.rereadBy,
    `From ${W.rereadBy}: re-read the Generalitat's 2027 municipal shop days (Barcelona), barcelona.cat/santaeulalia, the Tres Tombs and Carnival pages, ATM 2027 fares and the Reis programme; fill the day table and move BARCELONA_WINTER.asOf.`,
  );
});

test("date guard: the page speaks of 1 and 3 January as ahead of us, so it is rewritten before rollBy", () => {
  assert.ok(today < W.rollBy, `${W.rollBy} has come: rewrite the January part in the past tense or roll the page to 2028 (review 2027-01-20)`);
});
