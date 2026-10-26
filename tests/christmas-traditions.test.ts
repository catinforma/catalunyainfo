import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import {
  ANNOUNCED_TRADITIONS,
  ARAN_DAY,
  CHRISTMAS_TRADITIONS,
  PASTORETS_2025,
  TRADITIONS_VERIFIED,
  TRADITION_DAYS,
  buildChristmasTraditionsBody,
  pastoretsSentence,
  range,
  santaLluciaSentence,
  seasonSpanProblems,
  type SeasonSpan,
  type TraditionAnnouncements,
} from "../src/lib/content/batch02/christmas-traditions.ts";
import { dayDate } from "../src/lib/content/batch02/festive.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, isCovered, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Catalan Christmas traditions. Same structural checks as the batch-02 suite
 * (it has one photograph, not two, so it is not in that suite's list), plus
 * the rules this page was written under: every day it names is checked
 * against the Generalitat's holiday calendar, nothing unannounced is given a
 * 2026 date, last season is always labelled, and no origin date is printed
 * where the official sources disagree.
 */

const A = CHRISTMAS_TRADITIONS;
const NONE: TraditionAnnouncements = { santaLlucia: null, pastorets: null };
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);
const PUBLISHED = new Set(
  [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
);

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links                                                      */
/* -------------------------------------------------------------------------- */

test("three editions that validate, are substantial and sit on the registry paths", () => {
  for (const locale of LOCALES) {
    const edition = A.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    const words = wordCount(text(edition.blocks));
    assert.ok(words > 1200, `${locale} has only ${words} words`);
    assert.equal(edition.path, B2_PATHS.christmasTraditions[locale]);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    // Under the section the other tradition pages use.
    assert.equal(edition.path.split("/")[0], B2_PATHS.christmas[locale].split("/")[0]);
  }
});

test("the new paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === A.editions[locale].path).length, 1, locale);
  }
});

test("titles fit in 60 characters and descriptions in 155, in the searched words and with the year", () => {
  const words: Record<Locale, RegExp[]> = {
    ca: [/tradicions de nadal/i, /tió/, /caganer/],
    es: [/tradiciones de navidad/i, /tió/, /caganer/],
    en: [/catalan christmas traditions/i, /caga tió/i, /caganer/],
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = A.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 170, `${locale} excerpt ${excerpt.length}`);
    assert.match(seoTitle, /2026/);
    for (const word of words[locale]) assert.match(seoTitle, word, `${locale}: ${seoTitle}`);
    assert.match(title, /caganer/);
    assert.match(title, /Sant Esteve/);
    assert.match(seoDescription, /2026/);
  }
});

test("the lead answers the question: tió, caganer and Sant Esteve with its 2026 date", () => {
  for (const locale of LOCALES) {
    const first = A.editions[locale].blocks[0] as { type: string; lead?: boolean; text: string };
    assert.equal(first.type, "paragraph");
    assert.equal(first.lead, true);
    assert.match(first.text, /tió/);
    assert.match(first.text, /caganer/);
    assert.match(first.text, /Sant Esteve/);
    assert.ok(first.text.includes(dayDate(TRADITION_DAYS.santEsteve, locale)), `${locale}: ${first.text}`);
  }
});

test("internal links stay in their language, end in a slash, point at published pages and reach the siblings", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(A.editions[locale].blocks);
    const links = [...json.matchAll(/\]\((\/[^)]*)\)/g)].map((match) => match[1] ?? "");
    assert.ok(links.length >= 10, `${locale}: only ${links.length} internal links`);
    for (const href of links) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    for (const key of ["christmasBarcelona", "christmas", "pessebres", "newYear", "shops", "workCalendar"] as const) {
      assert.ok(links.includes(`/${locale}/${B2_PATHS[key][locale]}/`), `${locale}: no link to ${key}`);
    }
    assert.ok(!links.includes(`/${locale}/${B2_PATHS.christmasTraditions[locale]}/`), `${locale}: links to itself`);
    assert.doesNotMatch(json, /aerobusbcn/i);
  }
});

test("the Christmas in Barcelona guide links to this page once, in every language", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(CHRISTMAS_BARCELONA.editions[locale].blocks);
    const href = `](/${locale}/${B2_PATHS.christmasTraditions[locale]}/)`;
    assert.equal(json.split(href).length - 1, 1, locale);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = A.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("sources are official https pages and the reader sees the check date", () => {
  assert.ok(A.sources.length >= 15);
  for (const source of A.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.doesNotMatch(source.url, /aerobusbcn/i);
  }
  // The two holiday orders and the national table are among them.
  for (const id of ["documentId=1013204", "documentId=1040896", "BOE-A-2025-21667"]) {
    assert.ok(A.sources.some((source) => source.url.includes(id)), id);
  }
  assert.equal(A.verifiedAt, TRADITIONS_VERIFIED);
  const day: Record<Locale, RegExp> = { ca: /26 d'octubre de 2026/, es: /26 de octubre de 2026/, en: /26 October 2026/ };
  for (const locale of LOCALES) assert.match(text(A.editions[locale].blocks), day[locale], locale);
});

test("no new photograph: the hero is the nativity-figures file, with that file's own wording", () => {
  assert.ok(A.heroKey && IMAGE_BY_KEY.has(A.heroKey));
  assert.equal(A.heroKey, CHRISTMAS.secondaryKey);
  assert.deepEqual(A.heroAlt, CHRISTMAS.secondaryAlt);
  assert.deepEqual(A.heroCaption, CHRISTMAS.secondaryCaption);
  assert.equal(A.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!A.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"), locale);
  }
});

test("the publish route has a 'nadal-tradicions' group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("nadal-tradicions"\)\) published\.push\(await publishB2Article\(CHRISTMAS_TRADITIONS\)\)/);
});

/* -------------------------------------------------------------------------- */
/* Days and holidays                                                          */
/* -------------------------------------------------------------------------- */

test("every day the page names is the Generalitat's, on the weekday printed", () => {
  const D = TRADITION_DAYS;
  // Ordre EMT/66/2025 (2026) and Ordre EMT/52/2026 (2027).
  for (const iso of [D.immaculada, D.nadal, D.santEsteve, D.reis]) assert.ok(holidayOn(iso), `${iso} should be a holiday`);
  for (const iso of [D.nitDeNadal, D.reisEve, D.santEsteveNextYear]) {
    assert.ok(isCovered(iso), `${iso} is outside the published calendars`);
    assert.equal(holidayOn(iso), null, `${iso} should not be a holiday`);
  }
  assert.deepEqual(
    [D.immaculada, D.nitDeNadal, D.nadal, D.santEsteve, D.reisEve, D.reis, D.santEsteveNextYear].map(weekdayIndex),
    [2, 4, 5, 6, 2, 3, 0],
  );
  // Art. 1.b: in Aran, Sant Esteve is replaced by the Festa d'Aran on Wednesday 17 June 2026.
  assert.equal(ARAN_DAY, "2026-06-17");
  assert.equal(weekdayIndex(ARAN_DAY), 3);
});

test("the holiday sentences print those days, and say Aran is the exception", () => {
  const expected: Record<Locale, string[]> = {
    ca: ["dissabte 26 de desembre de 2026", "dimecres 17 de juny de 2026", "dimecres 6 de gener de 2027", "dimarts 8 de desembre", "dijous 24 de desembre"],
    es: ["sábado 26 de diciembre de 2026", "miércoles 17 de junio de 2026", "miércoles 6 de enero de 2027", "martes 8 de diciembre", "jueves 24 de diciembre"],
    en: ["Saturday 26 December 2026", "Wednesday 17 June 2026", "Wednesday 6 January 2027", "Tuesday 8 December", "Thursday 24 December"],
  };
  const aran: Record<Locale, RegExp> = { ca: /excepte a l'Aran/, es: /salvo en Arán/, en: /except in Aran/ };
  const notEveryYear: Record<Locale, RegExp> = { ca: /2027, el 26 de desembre és diumenge/, es: /2027, el 26 de diciembre es domingo/, en: /2027, 26 December is a Sunday/ };
  const balears: Record<Locale, RegExp> = { ca: /Illes Balears/, es: /Illes Balears/, en: /Balearic Islands/ };
  for (const locale of LOCALES) {
    const body = text(A.editions[locale].blocks);
    for (const phrase of expected[locale]) assert.ok(body.includes(phrase), `${locale}: missing "${phrase}"`);
    assert.match(body, aran[locale]);
    assert.match(body, notEveryYear[locale]);
    assert.match(body, balears[locale]);
    // The 24th is a working day, never called a holiday.
    assert.match(body, /dia feiner|laborable|working day/);
  }
});

/* -------------------------------------------------------------------------- */
/* Announcements: Santa Llúcia and the Pastorets season                       */
/* -------------------------------------------------------------------------- */

const GOOD_FAIR: SeasonSpan = { from: "2026-11-27", to: "2026-12-23", url: "https://firadesantallucia.cat/calendari.php" };
const GOOD_SEASON: SeasonSpan = { from: "2026-12-12", to: "2027-02-07", url: "https://www.pastoretsdecatalunya.cat/2026/12/01/temporada/" };

test("a well-formed organiser announcement is accepted, a bad one refused", () => {
  assert.deepEqual(seasonSpanProblems(GOOD_FAIR), []);
  assert.deepEqual(seasonSpanProblems(GOOD_SEASON), []);
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, from: "2026-11-31" }).length > 0, "impossible date");
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, from: "27/11/2026" }).length > 0, "not ISO");
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, from: "2025-11-28", to: "2025-12-23" }).length > 0, "last year's dates pasted");
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, to: "2026-11-20" }).length > 0, "ends before it starts");
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, url: "http://firadesantallucia.cat/" }).length > 0, "not https");
  assert.ok(seasonSpanProblems({ ...GOOD_FAIR, url: "https://firadesantallucia.cat/?utm_source=x" }).length > 0, "tracking");
});

test("every filled field of ANNOUNCED_TRADITIONS passes the checks", () => {
  for (const [key, value] of Object.entries(ANNOUNCED_TRADITIONS)) {
    if (value) assert.deepEqual(seasonSpanProblems(value), [], key);
  }
});

test("ranges spell the years and elide Catalan before 1 and 11", () => {
  assert.equal(range("2025-12-13", "2026-02-01", "ca"), "del 13 de desembre de 2025 a l'1 de febrer de 2026");
  assert.equal(range("2025-12-13", "2026-02-01", "es"), "del 13 de diciembre de 2025 al 1 de febrero de 2026");
  assert.equal(range("2025-12-13", "2026-02-01", "en"), "13 December 2025 to 1 February 2026");
  assert.equal(range("2026-11-27", "2026-12-23", "ca"), "del 27 de novembre al 23 de desembre de 2026");
  assert.equal(range("2026-11-27", "2026-12-23", "en"), "27 November to 23 December 2026");
});

test("with nothing announced the page says so; an announcement replaces that line", () => {
  const pending = /encara no s'han anunciat|aún no se han anunciado|have not been announced/;
  const notPresented = /encara no s'ha presentat|aún no se ha presentado|has not been presented/;
  const announced: TraditionAnnouncements = { santaLlucia: GOOD_FAIR, pastorets: GOOD_SEASON };
  for (const locale of LOCALES) {
    assert.match(santaLluciaSentence(locale, NONE), pending, locale);
    assert.match(pastoretsSentence(locale, NONE), notPresented, locale);
    const now = text(buildChristmasTraditionsBody(locale, announced));
    assert.ok(now.includes(range(GOOD_FAIR.from, GOOD_FAIR.to, locale)), `${locale}: fair dates`);
    assert.ok(now.includes(range(GOOD_SEASON.from, GOOD_SEASON.to, locale)), `${locale}: season dates`);
    assert.doesNotMatch(now, pending, locale);
    assert.doesNotMatch(now, notPresented, locale);
  }
  // The published page follows ANNOUNCED_TRADITIONS.
  if (!ANNOUNCED_TRADITIONS.santaLlucia) {
    for (const locale of LOCALES) assert.match(text(A.editions[locale].blocks), pending, locale);
  }
  if (!ANNOUNCED_TRADITIONS.pastorets) {
    for (const locale of LOCALES) assert.match(text(A.editions[locale].blocks), notPresented, locale);
  }
});

test("no 2026 date for the fair or the Pastorets is printed while none is announced", () => {
  for (const locale of LOCALES) {
    const body = text(buildChristmasTraditionsBody(locale, NONE));
    // Any November 2026 date would be an invented Santa Llúcia opening.
    assert.doesNotMatch(body, /\b\d{1,2} (de )?(novembre|noviembre|November)( de)? 2026/i, locale);
    // Last season's days appear only in sentences that carry their year.
    let checked = 0;
    for (const day of [/29 (de )?(novembre|noviembre|November)/, /1 (de )?(febrer|febrero|February)/]) {
      for (const sentence of sentences(body).filter((s) => day.test(s))) {
        checked += 1;
        assert.match(sentence, /2025|2026/, `${locale}: "${sentence}"`);
      }
    }
    assert.ok(checked >= 2, `${locale}: only ${checked} sentences checked`);
  }
  assert.equal(PASTORETS_2025.from.slice(0, 4), "2025");
});

/* -------------------------------------------------------------------------- */
/* What the page must not claim                                               */
/* -------------------------------------------------------------------------- */

test("no origin date where the official sources disagree", () => {
  // Caganer: "època del barroc" vs "final del segle XVII o principi del XVIII";
  // pessebre: 1223 vs the 14th century; Pastorets: 18th century vs medieval;
  // the nativity-makers' association: 1863 vs 1858/1860. None is printed.
  const origins = /barroc|baroque|barroco|1223|segle XVI|siglo XVI|1[4-8]th century|1863|Carlemany|Carlomagno|Charlemagne/i;
  for (const locale of LOCALES) {
    const body = text(A.editions[locale].blocks);
    const at = body.search(origins);
    assert.equal(at, -1, `${locale}: ${body.slice(Math.max(0, at - 60), at + 60)}`);
    // Nor that the caganer exists only in Catalonia.
    assert.doesNotMatch(body, /només es troba|solo se encuentra|found only|only found/i, locale);
  }
});
