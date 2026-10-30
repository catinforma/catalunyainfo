import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA, buildChristmasBarcelonaBody, christmasBarcelonaDescription, lightsLead } from "../src/lib/content/batch02/christmas-barcelona.ts";
import {
  ANNOUNCED_2026,
  ANNOUNCEMENTS_CHECKED,
  DAYS,
  FESTIVE_VERIFIED,
  METRO_DAYS,
  PAST,
  announcementProblems,
  dayDate,
  metroRows,
  span,
  type Announcement,
  type Announcements,
} from "../src/lib/content/batch02/festive.ts";
import { NEW_YEAR, buildNewYearBody, newYearLead } from "../src/lib/content/batch02/new-year.ts";
import { B2_PATHS, withReadNext, type B2Article } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, shortDate, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { metroDay } from "../src/lib/content/metro/tonight.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Christmas in Barcelona and New Year's Eve: dated-fact pages fed by one
 * constant (festive.ts). The guards: nothing from 2025 is printed as this
 * year's, an unannounced date is said to be unannounced, an announced one
 * replaces that line, and a mistyped or unofficial announcement is refused.
 *
 * These two articles are not in batch02.test.ts's list because they carry no
 * second photograph (the brief for this round: no images); the structural
 * checks that list runs are repeated here.
 */

const ARTICLES: B2Article[] = [CHRISTMAS_BARCELONA, NEW_YEAR];
const NONE: Announcements = { lightsSwitchOn: null, pessebre: null, santJaume: null, newYearShow: null, cavalcada: null };
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links                                                      */
/* -------------------------------------------------------------------------- */

test("both pages have three valid, substantial editions on evergreen registry paths", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${article.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(edition.blocks)) > 600, `${article.key}/${locale} is thin`);
      assert.equal(edition.path, B2_PATHS[article.key][locale]);
      assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
      assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    }
  }
});

test("the new paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].map((paths) => paths[locale]);
    for (const article of ARTICLES) {
      assert.equal(all.filter((path) => path === article.editions[locale].path).length, 1, `${article.key}/${locale}`);
    }
  }
});

test("titles fit in 60 characters, descriptions in 155, and both name the year", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, excerpt } = article.editions[locale];
      assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${article.key}/${locale} title ${seoTitle.length}`);
      assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${article.key}/${locale} description ${seoDescription.length}`);
      assert.ok(excerpt.length > 30);
      assert.match(seoTitle, /2026/);
    }
  }
});

test("sources are https, untracked, and the reader sees the check date", () => {
  for (const article of ARTICLES) {
    assert.ok(article.sources.length >= 10, article.key);
    for (const source of article.sources) {
      assert.match(source.url, /^https:\/\//, source.url);
      assert.ok(!/[?&]utm_/.test(source.url), source.url);
      assert.ok(!/aerobusbcn/i.test(source.url), source.url);
    }
    assert.equal(article.verifiedAt, FESTIVE_VERIFIED);
    for (const locale of LOCALES) {
      assert.match(text(article.editions[locale].blocks), /25 (d'octubre|de octubre|October) (de )?2026/, `${article.key}/${locale}`);
    }
  }
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  const published = new Set(
    [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)].flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  );
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const json = JSON.stringify(article.editions[locale].blocks);
      assert.ok(!/aerobusbcn/i.test(json));
      for (const match of json.matchAll(/\]\((\/[^)]*)\)/g)) {
        const href = match[1] ?? "";
        assert.ok(href.startsWith(`/${locale}/`), `${article.key}/${locale} links to ${href}`);
        assert.ok(href.endsWith("/"), href);
        assert.ok(published.has(href), `${article.key}/${locale}: ${href} is not a published path`);
      }
    }
  }
});

test("the two pages link to each other, and the markets guide and the Barcelona hub link to the Christmas page", () => {
  for (const locale of LOCALES) {
    const hub = `](/${locale}/${B2_PATHS.christmasBarcelona[locale]}/)`;
    const nye = `](/${locale}/${B2_PATHS.newYear[locale]}/)`;
    assert.ok(JSON.stringify(CHRISTMAS_BARCELONA.editions[locale].blocks).includes(nye), `hub -> nye ${locale}`);
    assert.ok(JSON.stringify(NEW_YEAR.editions[locale].blocks).includes(hub), `nye -> hub ${locale}`);
    assert.ok(JSON.stringify(CHRISTMAS.editions[locale].blocks).includes(hub), `markets -> hub ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(hub), `barcelona hub -> hub ${locale}`);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const before = article.editions[locale].blocks;
      const after = withReadNext([...before], locale);
      assert.equal(after.length - before.length, 1, `${article.key}/${locale}: long enough for a box`);
      const related = before[before.length - 1] as { items?: string[] };
      const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
      for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
        assert.ok(related.items?.some((item) => item.includes(link)), `${article.key}/${locale}: ${link}`);
      }
    }
  }
});

test("no new photograph: the hero is a file already in the manifest, and there is no body image", () => {
  for (const article of ARTICLES) {
    assert.ok(article.heroKey && IMAGE_BY_KEY.has(article.heroKey), article.key);
    assert.equal(article.secondaryKey, undefined, article.key);
    for (const locale of LOCALES) {
      assert.ok((article.heroAlt?.[locale] ?? "").length > 15);
      assert.ok((article.heroCaption?.[locale] ?? "").length > 15);
      assert.ok(!article.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The announcement constant                                                  */
/* -------------------------------------------------------------------------- */

const GOOD: Announcement = { date: "2026-11-26", time: "18:30", url: "https://ajuntament.barcelona.cat/premsa/2026/11/01/llums/" };

test("a well-formed official announcement is accepted", () => {
  assert.deepEqual(announcementProblems(GOOD), []);
  assert.deepEqual(announcementProblems({ date: "2026-12-13", until: "2027-01-05", url: "https://www.barcelona.cat/nadal/ca" }), []);
  assert.deepEqual(announcementProblems({ date: "2026-12-31", url: "https://noticies.tmb.cat/sala-de-premsa/x" }), []);
});

test("a mistyped, out-of-season, press-cutting or tracked announcement is refused", () => {
  assert.ok(announcementProblems({ ...GOOD, date: "2026-11-31" }).length > 0, "impossible date");
  assert.ok(announcementProblems({ ...GOOD, date: "26/11/2026" }).length > 0, "not ISO");
  assert.ok(announcementProblems({ ...GOOD, date: "2025-11-22" }).length > 0, "last year's date pasted");
  assert.ok(announcementProblems({ ...GOOD, until: "2026-11-20" }).length > 0, "ends before it starts");
  assert.ok(announcementProblems({ ...GOOD, time: "6:30 pm" }).length > 0, "time format");
  assert.ok(announcementProblems({ ...GOOD, url: "https://viajes.nationalgeographic.com.es/a/x" }).length > 0, "not official");
  assert.ok(announcementProblems({ ...GOOD, url: "http://ajuntament.barcelona.cat/premsa/" }).length > 0, "not https");
  assert.ok(announcementProblems({ ...GOOD, url: "https://ajuntament.barcelona.cat/premsa/?utm_source=x" }).length > 0, "tracking");
  assert.ok(announcementProblems({ ...GOOD, url: "https://barcelona.cat.example.com/" }).length > 0, "look-alike host");
});

test("every filled field of ANNOUNCED_2026 passes the checks", () => {
  for (const [key, value] of Object.entries(ANNOUNCED_2026)) {
    if (value) assert.deepEqual(announcementProblems(value), [], key);
  }
});

/* -------------------------------------------------------------------------- */
/* Not announced -> said so; announced -> printed                             */
/* -------------------------------------------------------------------------- */

test("with nothing announced, both leads say so in every language", () => {
  const pending = /encara no ha anunciat|aún no ha anunciado|has not announced/;
  for (const locale of LOCALES) {
    assert.match(lightsLead(locale, NONE), pending, `lights ${locale}`);
    assert.match(newYearLead(locale, NONE), pending, `nye ${locale}`);
  }
  // The published pages are built from ANNOUNCED_2026; while it is empty they must say the same.
  if (!ANNOUNCED_2026.lightsSwitchOn) {
    for (const locale of LOCALES) assert.match(text(CHRISTMAS_BARCELONA.editions[locale].blocks.slice(0, 1)), pending);
  }
  if (!ANNOUNCED_2026.newYearShow) {
    for (const locale of LOCALES) assert.match(text(NEW_YEAR.editions[locale].blocks.slice(0, 1)), pending);
  }
});

test("an announced date replaces the 'not announced' line, with the right weekday", () => {
  const facts: Announcements = {
    lightsSwitchOn: GOOD,
    pessebre: { date: "2026-12-12", until: "2027-01-05", url: "https://www.barcelona.cat/nadal/ca" },
    santJaume: { date: "2026-11-26", until: "2027-01-05", url: "https://www.barcelona.cat/nadal/ca" },
    newYearShow: { date: "2026-12-31", time: "23:50", place: { ca: "avinguda de la Reina Maria Cristina", es: "avenida de la Reina Maria Cristina", en: "Avinguda de la Reina Maria Cristina" }, url: "https://www.barcelona.cat/nadal/ca/campanades-de-cap-dany" },
    cavalcada: { date: "2027-01-05", time: "18:00", url: "https://www.barcelona.cat/nadal/ca/els-reis-dorient" },
  };
  for (const locale of LOCALES) {
    const lights = lightsLead(locale, facts);
    assert.ok(lights.includes(dayDate("2026-11-26", locale)), `${locale}: ${lights}`);
    assert.doesNotMatch(lights, /encara no|aún no|not announced/);
    const hub = text(buildChristmasBarcelonaBody(locale, facts));
    assert.ok(hub.includes(span("2026-12-12", "2027-01-05", locale)), `${locale}: pessebre range`);
    assert.ok(hub.includes(dayDate("2027-01-05", locale)), `${locale}: cavalcada`);
    const nye = newYearLead(locale, facts);
    assert.ok(nye.includes(dayDate("2026-12-31", locale)) && nye.includes("23:50"), `${locale}: ${nye}`);
    assert.doesNotMatch(text(buildNewYearBody(locale, facts)), /encara no s'ha anunciat|aún no se ha anunciado|not announced yet/i);
  }
  assert.equal(weekdayIndex("2026-11-26"), 4);
  assert.match(dayDate("2026-11-26", "en"), /^Thursday 26 November 2026$/);
  assert.match(dayDate("2026-11-26", "ca"), /^dijous 26 de novembre de 2026$/);
});

test("the Christmas snippet answers 'when are the lights switched on' and the leads carry the announcements check date (30 Oct 2026)", () => {
  assert.equal(ANNOUNCEMENTS_CHECKED, "2026-10-30");
  assert.ok(ANNOUNCEMENTS_CHECKED >= FESTIVE_VERIFIED);
  const notYet: Record<Locale, RegExp> = {
    ca: /^Encesa de llums de Nadal de Barcelona 2026: encara sense data oficial \(el 2025, dissabte 22 de novembre\)/,
    es: /^Encendido de luces de Navidad de Barcelona 2026: aún sin fecha oficial \(en 2025, sábado 22 de noviembre\)/,
    en: /^Barcelona Christmas lights 2026: switch-on date not announced yet \(2025: Saturday 22 November\)/,
  };
  const checked: Record<Locale, RegExp> = { ca: /comprovat el 30 d'octubre de 2026/, es: /comprobado el 30 de octubre de 2026/, en: /checked on 30 October 2026/ };
  for (const locale of LOCALES) {
    for (const description of [christmasBarcelonaDescription(locale, NONE), christmasBarcelonaDescription(locale, { ...NONE, lightsSwitchOn: GOOD })]) {
      assert.ok(description.length > 60 && description.length <= 155, `${locale}: ${description.length} ${description}`);
    }
    assert.match(christmasBarcelonaDescription(locale, NONE), notYet[locale], locale);
    assert.ok(christmasBarcelonaDescription(locale, { ...NONE, lightsSwitchOn: GOOD }).includes(dayDate(GOOD.date, locale)), locale);
    assert.equal(CHRISTMAS_BARCELONA.editions[locale].seoDescription, christmasBarcelonaDescription(locale));
    if (!ANNOUNCED_2026.lightsSwitchOn) assert.match(text(CHRISTMAS_BARCELONA.editions[locale].blocks.slice(0, 1)), checked[locale], locale);
    if (!ANNOUNCED_2026.newYearShow) assert.match(text(NEW_YEAR.editions[locale].blocks.slice(0, 1)), checked[locale], locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Nothing from last season printed as this season's                          */
/* -------------------------------------------------------------------------- */

test("every 2024 or 2025 date is printed with its own year, never with 2026", () => {
  const past = [
    PAST.lights2024.announced,
    PAST.lights2024.switchOn,
    PAST.lights2025.announced,
    PAST.lights2025.switchOn,
    PAST.programme2025.published,
    PAST.pessebre2025.from,
    PAST.santJaume2025.from,
    PAST.concert2025,
    PAST.newYearOps2024.published,
    PAST.newYearOps2025.published,
  ];
  let checked = 0;
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const body = text(buildChristmasBarcelonaBody(locale, NONE)) + " " + text(buildNewYearBody(locale, NONE)) + " " + text(article.editions[locale].blocks);
      for (const iso of past) {
        const day = shortDate(iso, locale);
        assert.ok(!new RegExp(`\\b${day} (de )?2026`).test(body), `${locale}: ${day} printed as 2026`);
        for (const sentence of sentences(body).filter((s) => new RegExp(`(^|\\D)${day}(?!\\d)`).test(s))) {
          checked += 1;
          assert.match(sentence, /2024|2025/, `${locale}: "${sentence}" gives ${day} without its year`);
        }
      }
    }
  }
  // The guard must actually meet those dates, or it proves nothing.
  assert.ok(checked > 60, `only ${checked} sentences checked`);
  // And it would catch one printed bare.
  const bare = sentences("Les llums s'encenen el 22 de novembre. El 2025 també.").filter((s) => /22 de novembre/.test(s));
  assert.doesNotMatch(bare[0] ?? "", /2024|2025/);
});

test("no 2026 switch-on, nativity or New Year's Eve date is printed while none is announced", () => {
  for (const locale of LOCALES) {
    const hub = text(buildChristmasBarcelonaBody(locale, NONE));
    const nye = text(buildNewYearBody(locale, NONE));
    // A November 2026 date anywhere would be an invented switch-on date.
    assert.doesNotMatch(hub + nye, /\b\d{1,2} (de )?(novembre|noviembre|November)( de)? 2026/i, locale);
    // Nor a 2026-27 time for the show: the only show times are 2025's, in sentences that say so.
    for (const sentence of sentences(nye).filter((s) => /23:50/.test(s))) assert.match(sentence, /2025/, `${locale}: ${sentence}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Holidays and metro                                                         */
/* -------------------------------------------------------------------------- */

test("the holidays named are the Generalitat's, on the weekdays printed", () => {
  for (const iso of [DAYS.christmas, DAYS.santEsteve, DAYS.newYear, DAYS.reis]) assert.ok(holidayOn(iso), iso);
  for (const iso of [DAYS.christmasEve, DAYS.newYearsEve, DAYS.reisEve]) assert.equal(holidayOn(iso), null, iso);
  assert.deepEqual([DAYS.christmas, DAYS.santEsteve, DAYS.newYear, DAYS.reis].map(weekdayIndex), [5, 6, 5, 3]);
  const en = text(CHRISTMAS_BARCELONA.editions.en.blocks);
  assert.match(en, /Friday 25 and Saturday 26 December 2026/);
  assert.match(en, /Friday 1 and Wednesday 6 January 2027/);
});

test("the metro table follows TMB's standing rules and the FAQ agrees with it", () => {
  assert.equal(metroDay(DAYS.christmasEve).close, "eleven");
  assert.equal(metroDay(DAYS.christmas).close, "two");
  assert.equal(metroDay(DAYS.santEsteve).close, "allNight");
  assert.equal(metroDay(DAYS.newYearsEve).close, "allNight");
  assert.equal(metroDay(DAYS.newYear).opensAtFive, false);
  assert.equal(metroDay(DAYS.reis).close, "midnight");
  const rows = metroRows("en");
  assert.equal(rows.length, METRO_DAYS.length);
  assert.match(rows[0]?.[2] ?? "", /closes at 23:00/);
  assert.match(rows[3]?.[2] ?? "", /runs all night/);
  const faqText = JSON.stringify(CHRISTMAS_BARCELONA.editions.en.blocks.find((b) => b.type === "faq"));
  assert.match(faqText, /opens at 5:00 on Friday 25 December 2026 and closes at 2:00/);
});

test("the NYE page says the metro runs all night and names Espanya as the nearest station", () => {
  for (const locale of LOCALES) {
    const body = text(NEW_YEAR.editions[locale].blocks);
    assert.match(body, /43 (hores|horas|hours)/, locale);
    assert.match(body, /Espanya \(L1( i| y|,) L3\)/, locale);
    assert.match(body, /1909/, locale);
  }
});

test("the shop rule matches Llei 18/2017: closed on 25 and 26 December and 1 and 6 January", () => {
  const phrase: Record<Locale, RegExp> = {
    ca: /tancades el 25 i 26 de desembre i l'1 i el 6 de gener/i,
    es: /cerradas el 25 y 26 de diciembre y el 1 y 6 de enero/i,
    en: /closed on 25 and 26 December and 1 and 6 January/i,
  };
  for (const locale of LOCALES) assert.match(text(CHRISTMAS_BARCELONA.editions[locale].blocks), phrase[locale], locale);
});
