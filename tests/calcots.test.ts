import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  CALCOFEST_2026,
  CALCOTS,
  CALCOTS_VERIFIED,
  FESTA_2027,
  PAST_2026,
  PROGRAMME_2027,
  buildCalcotsBody,
  calcotsLead,
  programmeProblems,
  type ProgrammeNotice,
} from "../src/lib/content/batch02/calcots.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { FOODFAIRS } from "../src/lib/content/features/foodfairs.ts";
import { FEATURES } from "../src/lib/content/features/publish.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Calçots and the Valls Calçotada 2027 (checked 26 Oct 2026 against the
 * festival organiser, the Ajuntament de Valls, the IGP regulator, the
 * Generalitat, Rodalies and Monbus). The guards: both questions answered in
 * the lead, no 2027 price or programme printed before the organisers publish
 * one, the figures the official documents disagree on left out, and the
 * one-sentence link from the food-fairs guide in place.
 *
 * Not in batch02.test.ts's list because it carries no second photograph
 * (no new images this round); the structural checks are repeated here.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);
const GOOD: ProgrammeNotice = { published: "2027-01-20", url: "https://festacalcotadavalls.cat/premsa/presentada-la-45a-gran-festa/" };

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on evergreen registry paths", () => {
  for (const locale of LOCALES) {
    const edition = CALCOTS.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1000, `${locale} is thin`);
    assert.equal(edition.path, B2_PATHS.calcots[locale]);
    assert.match(edition.path, /^(tradicions|tradiciones|traditions)\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
});

test("the new paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === CALCOTS.editions[locale].path).length, 1, locale);
  }
});

test("titles fit in 60 characters, descriptions in 155, and both carry the question and the year", () => {
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = CALCOTS.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30);
    assert.match(seoTitle, /Calçotada de Valls 2027/);
    assert.match(seoTitle, /calçot/);
    assert.match(title, /2026-2027/);
    assert.match(seoDescription, /31 (de gener|de enero|January) (de )?2027/);
  }
});

test("sources are official https pages, untracked, and the reader sees the check date", () => {
  assert.ok(CALCOTS.sources.length >= 15);
  for (const source of CALCOTS.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.ok(!/aerobusbcn/i.test(source.url), source.url);
  }
  const hosts = new Set(CALCOTS.sources.map((source) => new URL(source.url).hostname));
  for (const host of ["festacalcotadavalls.cat", "www.valls.cat", "www.calcotdevalls.com", "agricultura.gencat.cat", "rodalies.gencat.cat"]) {
    assert.ok(hosts.has(host), `no source from ${host}`);
  }
  assert.equal(CALCOTS.verifiedAt, "2026-10-26");
  assert.equal(CALCOTS_VERIFIED, CALCOTS.verifiedAt);
  for (const locale of LOCALES) {
    assert.match(text(CALCOTS.editions[locale].blocks), /26 (d'octubre|de octubre|October) (de )?2026/, locale);
  }
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  const published = new Set(
    [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  );
  for (const locale of LOCALES) {
    const json = JSON.stringify(CALCOTS.editions[locale].blocks);
    assert.ok(!/aerobusbcn/i.test(json));
    let internal = 0;
    for (const match of json.matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      internal += 1;
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(published.has(href), `${locale}: ${href} is not a published path`);
    }
    assert.ok(internal >= 6, `${locale}: only ${internal} internal links`);
  }
});

test("the food-fairs guide links to the new page in every language, and the new page links back", () => {
  for (const locale of LOCALES) {
    const target = `](/${locale}/${B2_PATHS.calcots[locale]}/)`;
    assert.ok(JSON.stringify(FOODFAIRS.editions[locale].blocks).includes(target), `food fairs -> calcots ${locale}`);
    const back = `](/${locale}/${ARTICLE_PATHS.foodfairs[locale]}/)`;
    assert.ok(JSON.stringify(CALCOTS.editions[locale].blocks).includes(back), `calcots -> food fairs ${locale}`);
  }
});

test("the publish group republishes the guide and the food-fairs feature it is linked from", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("calcots"\)\) published\.push\(await publishB2Article\(CALCOTS\), \.\.\.\(await publishFeatures\(4, 5\)\)\)/);
  // The slice is by index, so it must still be the food-fairs guide.
  assert.equal(FEATURES[4], FOODFAIRS);
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = CALCOTS.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("no new photograph: the hero is the rail guide's file with its own alt and caption, and there is no body image", () => {
  assert.ok(CALCOTS.heroKey && IMAGE_BY_KEY.has(CALCOTS.heroKey));
  assert.equal(CALCOTS.heroKey, TRAINS.heroKey);
  assert.match(IMAGE_BY_KEY.get(CALCOTS.heroKey)?.license ?? "", /^CC BY-SA|^CC BY|^CC0/);
  assert.deepEqual(CALCOTS.heroAlt, TRAINS.heroAlt);
  assert.deepEqual(CALCOTS.heroCaption, TRAINS.heroCaption);
  assert.equal(CALCOTS.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!CALCOTS.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* The answer first                                                           */
/* -------------------------------------------------------------------------- */

test("the lead answers both questions: the season and the 2027 date", () => {
  const season: Record<Locale, RegExp> = { ca: /de novembre a abril/, es: /de noviembre a abril/, en: /from November to April/ };
  const date: Record<Locale, RegExp> = {
    ca: /diumenge 31 de gener de 2027/,
    es: /domingo 31 de enero de 2027/,
    en: /Sunday 31 January 2027/,
  };
  for (const locale of LOCALES) {
    const first = CALCOTS.editions[locale].blocks[0] as { type: string; lead?: boolean; text: string };
    assert.equal(first.type, "paragraph");
    assert.equal(first.lead, true);
    assert.match(first.text, season[locale], locale);
    assert.match(first.text, date[locale], locale);
    assert.match(first.text, /45/, locale);
  }
});

test("the dates are the right weekdays: last Sunday of January 2027, Saturday 21 November 2026", () => {
  assert.equal(weekdayIndex(FESTA_2027.date), 0);
  // Last Sunday of the month: a week later is already February.
  const nextWeek = new Date(`${FESTA_2027.date}T12:00:00Z`);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  assert.equal(nextWeek.getUTCMonth(), 1);
  // The 2026 edition was the last Sunday of January 2026 too.
  assert.equal(weekdayIndex(PAST_2026.festa), 0);
  assert.equal(PAST_2026.festa, "2026-01-25");
  assert.equal(weekdayIndex(CALCOFEST_2026.date), 6);
  // The 2026 milestones come before the 2026 festival, in order.
  assert.ok(PAST_2026.advanceSale < PAST_2026.presented && PAST_2026.presented < PAST_2026.festa);
});

/* -------------------------------------------------------------------------- */
/* Not published -> said so; published -> linked                              */
/* -------------------------------------------------------------------------- */

test("while the 2027 programme is unpublished, the page says so and links the press room", () => {
  const pending: Record<Locale, RegExp> = {
    ca: /encara no s'han publicat/,
    es: /aún no se han publicado/,
    en: /have not been published yet/,
  };
  for (const locale of LOCALES) {
    assert.match(calcotsLead(locale, null), pending[locale], locale);
    assert.ok(JSON.stringify(buildCalcotsBody(locale, null)).includes("](https://festacalcotadavalls.cat/premsa/)"), `${locale}: press room`);
  }
  if (!PROGRAMME_2027) {
    for (const locale of LOCALES) assert.match(text(CALCOTS.editions[locale].blocks.slice(0, 1)), pending[locale]);
  }
});

test("a published programme replaces the 'not published' lines with the link", () => {
  for (const locale of LOCALES) {
    const lead = calcotsLead(locale, GOOD);
    assert.ok(lead.includes(`](${GOOD.url})`), lead);
    assert.match(lead, /20 (de gener|de enero|January) (de )?2027/);
    const body = text(buildCalcotsBody(locale, GOOD));
    assert.doesNotMatch(
      body,
      /encara no s'han publicat|aún no se han publicado|have not been published yet|Encara no publicats|Aún no publicados|Not published yet|encara no és públic|aún no es público|not public yet|encara no s'ha|aún no se ha|has not been|Not yet|El que encara no se sap|Lo que aún no se sabe|What is not known yet/,
      locale,
    );
    assert.ok(JSON.stringify(buildCalcotsBody(locale, GOOD)).includes(`](${GOOD.url})`));
  }
});

test("a mistyped, stale, unofficial or tracked programme notice is refused", () => {
  assert.deepEqual(programmeProblems(GOOD), []);
  assert.deepEqual(programmeProblems({ published: "2026-12-10", url: "https://www.valls.cat/la-ciutat/noticies/9000-gran-festa" }), []);
  assert.ok(programmeProblems({ ...GOOD, published: "2027-02-30" }).length > 0, "impossible date");
  assert.ok(programmeProblems({ ...GOOD, published: "21/01/2027" }).length > 0, "not ISO");
  assert.ok(programmeProblems({ ...GOOD, published: "2026-01-21" }).length > 0, "last year's presentation pasted");
  assert.ok(programmeProblems({ ...GOOD, published: "2027-02-01" }).length > 0, "after the festival");
  assert.ok(programmeProblems({ ...GOOD, url: "http://festacalcotadavalls.cat/premsa/" }).length > 0, "not https");
  assert.ok(programmeProblems({ ...GOOD, url: "https://www.diaridetarragona.com/valls/calcotada" }).length > 0, "press, not the organiser");
  assert.ok(programmeProblems({ ...GOOD, url: "https://festacalcotadavalls.cat.example.com/" }).length > 0, "look-alike host");
  assert.ok(programmeProblems({ ...GOOD, url: "https://festacalcotadavalls.cat/?utm_source=x" }).length > 0, "tracking");
  assert.throws(() => calcotsLead("ca", { ...GOOD, published: "2026-01-21" }), /PROGRAMME_2027 refused/);
  if (PROGRAMME_2027) assert.deepEqual(programmeProblems(PROGRAMME_2027), []);
});

/* -------------------------------------------------------------------------- */
/* What the page must not claim                                               */
/* -------------------------------------------------------------------------- */

test("no 2027 price, and every price on the page is tied to its own year or event", () => {
  for (const locale of LOCALES) {
    const body = text(CALCOTS.editions[locale].blocks);
    for (const sentence of sentences(body).filter((s) => /€/.test(s))) {
      assert.doesNotMatch(sentence, /2027/, `${locale}: "${sentence}" pairs a price with 2027`);
      assert.match(sentence, /2026|Calçofest|Calçotada popular|1\.500|1,500/, `${locale}: "${sentence}" gives a price without its year`);
    }
  }
});

test("the figures official documents disagree on are left out, and so are commercial lists", () => {
  for (const locale of LOCALES) {
    const body = text(CALCOTS.editions[locale].blocks);
    // Stem diameter and bunch sizes differ between the Generalitat page, the
    // IGP site and the older specification; the advance 2026 price too.
    assert.doesNotMatch(body, /1[,.]5 (i|y|and) 2[,.]7|1[,.]7 (i|y|and) 2[,.]5|diàmetre|diámetro|diameter/i, locale);
    assert.doesNotMatch(body, /12, 25|25 (o|or) 50/, locale);
    assert.doesNotMatch(body, /14[,.]50|14 €|€14/, locale);
    // No restaurants, hotels or shops (the Calçofest note lists some; we do not).
    assert.doesNotMatch(body, /Casa Fèlix|Fèlix Hotel|La Licorera|Cal Ganxo|Masia del Pla|Xup-Xup/, locale);
    // No departure times: the only clock times are the festival programme's.
    for (const sentence of sentences(body).filter((s) => /\b([01]?\d|2[0-3]):[0-5]\d\b/.test(s))) {
      assert.match(sentence, /2026|Calçofest|calçotada popular|popular calçotada/i, `${locale}: "${sentence}"`);
    }
  }
});

test("Calçofest is printed only with what the council's note states", () => {
  const day: Record<Locale, RegExp> = {
    ca: /dissabte 21 de novembre de 2026/,
    es: /sábado 21 de noviembre de 2026/,
    en: /Saturday 21 November 2026/,
  };
  for (const locale of LOCALES) {
    const body = text(CALCOTS.editions[locale].blocks);
    assert.match(body, day[locale], locale);
    assert.match(body, /13:00/, locale);
    assert.match(body, /1[.,]500/, locale);
    // The concert and bus prices change week by week; they are not printed.
    assert.doesNotMatch(body, /48 ?€|€48|28 ?€|€28|35 ?€|€35/, locale);
  }
});
