import assert from "node:assert/strict";
import { test } from "node:test";

import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { CHRISTMAS_LIGHTS } from "../src/lib/content/batch02/christmas-lights.ts";
import { seasonItem, seasonLinks, type SeasonKey } from "../src/lib/content/batch02/christmas-season-links.ts";
import { ANNOUNCED_2026_27 } from "../src/lib/content/batch02/christmas-transport.ts";
import { ANNOUNCED_2026, DAYS, PAST, dateYear } from "../src/lib/content/batch02/festive.ts";
import { NEW_YEAR, NEW_YEAR_CHECKED, TMB_NYE_NOTICE_2025, tmbNoticeSentence } from "../src/lib/content/batch02/new-year.ts";
import { b2href, type B2Article, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { metroDay } from "../src/lib/content/metro/tonight.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 25 Nov 2026, December demand: the Christmas-season guides link each other with
 * the words people search, and the New Year's Eve guide says, with a read date,
 * what TMB has and has not published for 24 and 31 December.
 */

const body = (article: B2Article, locale: (typeof LOCALES)[number]) => JSON.stringify(article.editions[locale].blocks);
const links = (article: B2Article, locale: (typeof LOCALES)[number], key: B2Key) => body(article, locale).split(`](${b2href(key, locale)})`).length - 1;

test("New Year's Eve guide links the December hub, the lights guide and the holiday-today hub, once each, under a season heading", () => {
  for (const locale of LOCALES) {
    for (const key of ["barcelonaDecember", "christmasLights", "holidayToday"] as const) {
      assert.equal(links(NEW_YEAR, locale, key), 1, `${locale} ${key}`);
    }
    const blocks = NEW_YEAR.editions[locale].blocks;
    const at = blocks.findIndex((b) => b.type === "list" && JSON.stringify(b).includes(b2href("christmasLights", locale)));
    assert.equal(blocks[at - 1]!.type, "heading", `${locale}: the list sits under its own H2`);
    assert.ok(at < blocks.findIndex((b) => b.type === "faq"), `${locale}: before the FAQ`);
    // Reis, shops and the markets hub were already linked from the guide.
    for (const key of ["reis", "shops", "christmas"] as const) assert.ok(links(NEW_YEAR, locale, key) >= 1, `${locale} ${key}`);
  }
});

test("New Year's Eve guide keeps exactly one link to the transport page (the transport tests hold it to one)", () => {
  for (const locale of LOCALES) assert.equal(links(NEW_YEAR, locale, "christmasTransport"), 1, locale);
});

test("the other season pages send readers on: December hub to holiday-today and transport, shops to New Year's Eve and Reis, lights to shops", () => {
  for (const locale of LOCALES) {
    assert.equal(links(BARCELONA_DECEMBER, locale, "holidayToday"), 1, `${locale} december -> holidayToday`);
    assert.equal(links(BARCELONA_DECEMBER, locale, "christmasTransport"), 1, `${locale} december -> transport`);
    assert.ok(links(SHOPS, locale, "newYear") >= 1 && links(SHOPS, locale, "reis") >= 1, `${locale} shops -> new year, reis`);
    assert.ok(links(CHRISTMAS_LIGHTS, locale, "shops") >= 1, `${locale} lights -> shops`);
  }
});

test("anchors use the searched words, never the page title, and carry no date of their own", () => {
  const words: Record<SeasonKey, Record<(typeof LOCALES)[number], RegExp>> = {
    barcelonaDecember: { ca: /^\[què fer a Barcelona al desembre del 2026\]/, es: /^\[qué hacer en Barcelona en diciembre de 2026\]/, en: /^\[what to do in Barcelona in December 2026\]/ },
    christmasLights: { ca: /^\[encesa de llums de Nadal 2026/, es: /^\[encendido de luces de Navidad 2026/, en: /^\[Barcelona Christmas lights 2026/ },
    christmas: { ca: /^\[mercats i fires de Nadal/, es: /^\[mercados y ferias de Navidad/, en: /^\[Christmas markets in Catalonia/ },
    reis: { ca: /^\[Cavalcada de Reis 2027\]/, es: /^\[Cabalgata de Reyes 2027\]/, en: /^\[Three Kings parade 2027\]/ },
    shops: { ca: /^\[botigues obertes els diumenges de desembre/, es: /^\[tiendas abiertas en los domingos de diciembre/, en: /^\[shops open on December Sundays/ },
    holidayToday: { ca: /^\[és festiu avui a Catalunya\?\]/, es: /^\[¿es festivo hoy en Cataluña\?\]/, en: /^\[is today a holiday in Catalonia\?\]/ },
    newYear: { ca: /^\[Cap d'Any a Barcelona 2026\]/, es: /^\[Nochevieja en Barcelona 2026\]/, en: /^\[New Year's Eve in Barcelona 2026\]/ },
  };
  for (const locale of LOCALES) {
    for (const key of Object.keys(words) as SeasonKey[]) {
      const item = seasonItem(key, locale);
      assert.match(item, words[key][locale], `${locale} ${key}`);
      assert.ok(item.includes(`](${b2href(key, locale)})`), `${locale} ${key}: href`);
      // No time of day and no 2026 day in the anchor or gloss (1 January is a fixed day); the linked page owns them.
      assert.doesNotMatch(item.replace(/\]\([^)]*\)/, "]"), /\b\d{1,2}[:.]\d{2}\b|\b(?:[2-9]|[1-3]\d)(?:º)? (?:de |of )?(?:desembre|diciembre|December|gener|enero|January|novembre|noviembre|November)\b/i, `${locale} ${key}`);
    }
    assert.equal(seasonLinks(locale, ["christmasLights"]).length, 2, "an H2 and a list");
  }
});

test("TMB notices: the 2026 special service is said to be unpublished only while it is, with the read date and last year's two notices labelled with their year", () => {
  assert.equal(ANNOUNCED_2026_27.metro, null, "TMB's 2026-27 metro notice is filled: rewrite tmbNoticeSentence from it");
  assert.equal(metroDay(DAYS.christmasEve).close, "eleven", "the 24 December 23:00 claim comes from TMB's standing timetable");
  assert.equal(metroDay(DAYS.newYearsEve).close, "allNight");
  assert.equal(TMB_NYE_NOTICE_2025, "2025-12-30");
  assert.equal(PAST.tmbChristmas2025.published, "2025-12-23");
  for (const locale of LOCALES) {
    const sentence = tmbNoticeSentence(locale);
    assert.ok(sentence.includes(dateYear(NEW_YEAR_CHECKED, locale)), `${locale}: read date`);
    assert.ok(sentence.includes(dateYear(PAST.tmbChristmas2025.published, locale)) && sentence.includes(dateYear(TMB_NYE_NOTICE_2025, locale)), `${locale}: last year's notices`);
    assert.match(sentence, /23:00/);
    assert.ok(body(NEW_YEAR, locale).includes(JSON.stringify(sentence).slice(1, -1)), `${locale}: the sentence is in the body`);
  }
});

test("re-read: from 23 December 2026 the 'TMB has not published' sentence must have been re-read that day or later (or TMB's notice is in)", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(NEW_YEAR_CHECKED <= today, `NEW_YEAR_CHECKED (${NEW_YEAR_CHECKED}) is in the future`);
  if (today >= "2026-12-23" && ANNOUNCED_2026_27.metro === null && !ANNOUNCED_2026.newYearShow) {
    assert.ok(
      NEW_YEAR_CHECKED >= "2026-12-23",
      `On ${today} the New Year's Eve guide says TMB has not published its 2026 Christmas Eve hours (last year: 23 Dec) but was last read on ${NEW_YEAR_CHECKED}. Read https://noticies.tmb.cat/sala-de-premsa and https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus, fill ANNOUNCED_2026_27.metro in christmas-transport.ts if the notice is out, move NEW_YEAR_CHECKED, publish ?only=nye.`,
    );
  }
});
