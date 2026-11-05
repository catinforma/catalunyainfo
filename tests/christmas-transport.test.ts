import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { mock, test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  ANNOUNCED_2026_27,
  CHRISTMAS_TRANSPORT,
  OPERATORS,
  TRANSPORT_DAYS,
  TRANSPORT_NADAL_AS_OF,
  TRANSPORT_NADAL_META,
  TRANSPORT_NADAL_REREAD_BY,
  TRANSPORT_URLS,
  announcedProblems,
  buildTransportBody,
  christmasTransportMention,
  dayItems,
  metroLine,
  needsReread,
  operatorByKey,
  operatorProblems,
  tramDay,
  tramLine,
  type Announced,
  type OperatorKey,
} from "../src/lib/content/batch02/christmas-transport.ts";
import { DAYS, PAST, dateYear } from "../src/lib/content/batch02/festive.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { REIS } from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, B2_TITLES, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { metroDay } from "../src/lib/content/metro/tonight.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";

/**
 * Transport over Christmas, New Year and Reis 2026-27 (5 Nov 2026).
 *
 * What it must never do: print last season's hours as this season's, print a
 * 2026-27 time no operator has published, cite anything but the operators'
 * own pages, read the clock, or still show last season's lines after the
 * operators have published (the re-read test fails from 18 December 2026).
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(CHRISTMAS_TRANSPORT.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(CHRISTMAS_TRANSPORT.editions[locale].blocks);
const ROOT = new URL("..", import.meta.url);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([
  ...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...christmasFairsPaths().map((p) => p.path),
]);
const OFFICIAL = /(^|\.)(tmb\.cat|barcelona\.cat|atm\.cat|govern\.cat|gencat\.cat|fgc\.cat|tram\.cat|renfe\.com|amb\.cat|ambmobilitat\.cat)$/;
const NONE: Record<OperatorKey, Announced | null> = { metro: null, tmbBus: null, nitbus: null, rodalies: null, fgc: null, tram: null };
/** A plausible Rodalies 2026-27 notice (never real data). */
const RODALIES_2027: Announced = {
  url: "https://rodalies.gencat.cat/ca/detalls/article/12_15_Nadal",
  read: "2026-12-15",
  days: { christmasEve: { ca: "servei fins a les 22:30", es: "servicio hasta las 22:30", en: "service until 22:30" } },
};

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths", () => {
  const expected: Record<Locale, string> = {
    ca: "guies/transport-nadal-cap-d-any-barcelona",
    es: "guias/transporte-navidad-nochevieja-barcelona",
    en: "guides/barcelona-public-transport-christmas-new-year",
  };
  for (const locale of LOCALES) {
    const edition = CHRISTMAS_TRANSPORT.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1200, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.christmasTransport[locale]);
    assert.equal(edition.path, TRANSPORT_NADAL_META[locale].path);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    // A page with a filled slot is valid too.
    assert.ok(bodySchema.safeParse(buildTransportBody(locale, { ...NONE, rodalies: RODALIES_2027 })).success, `${locale}: filled body`);
  }
  assert.equal(CHRISTMAS_TRANSPORT.key, "christmasTransport");
  for (const locale of LOCALES) assert.match(B2_TITLES.christmasTransport[locale], /2026-27/);
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.christmasTransport[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
    assert.ok(!christmasFairsPaths().some((p) => p.path === `/${locale}/${path}/`), path);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.christmasTransport[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155, with the season and the searched words; the 2025 figures carry their year", () => {
  const words: Record<Locale, RegExp[]> = {
    ca: [/metro/i, /Nadal/, /Cap d'Any/],
    es: [/metro/i, /Navidad/, /Nochevieja/],
    en: [/metro/i, /Christmas/, /New Year/],
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = CHRISTMAS_TRANSPORT.editions[locale];
    assert.ok(seoTitle.length > 20 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}: ${seoTitle}`);
    assert.ok(seoDescription.length > 80 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}: ${seoDescription}`);
    assert.match(seoTitle, /2026/);
    for (const w of words[locale]) assert.match(seoTitle, w, `${locale}: ${w}`);
    assert.match(title, /2026-27/);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    // The description's train hours are last season's: their year is printed.
    assert.match(seoDescription, /\(2025\)/, `${locale}: the 2025 label`);
    assert.ok(seoDescription.includes("23:00"), `${locale}: Christmas Eve's metro close`);
  }
});

/* -------------------------------------------------------------------------- */
/* Sources and links                                                          */
/* -------------------------------------------------------------------------- */

test("sources are the operators' own pages, https, untracked, listed once, never aerobusbcn; the reader sees the check date", () => {
  const urls = new Set<string>();
  assert.ok(CHRISTMAS_TRANSPORT.sources.length >= 10);
  for (const source of CHRISTMAS_TRANSPORT.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_|aerobusbcn/i.test(source.url), source.url);
    assert.ok(OFFICIAL.test(new URL(source.url).host), `${source.url} is not an operator's site`);
    assert.ok(!urls.has(source.url), `duplicate source ${source.url}`);
    urls.add(source.url);
  }
  for (const op of OPERATORS) {
    for (const n of op.notices) assert.ok(urls.has(n.url), `${op.key}: notice ${n.url} is a source`);
    for (const fact of Object.values(op.days)) assert.ok(urls.has(fact!.url), `${op.key}: ${fact!.url} is a source`);
  }
  for (const url of [TRANSPORT_URLS.tmbHours, TRANSPORT_URLS.tramFaq]) assert.ok(urls.has(url), url);
  assert.equal(CHRISTMAS_TRANSPORT.verifiedAt, TRANSPORT_NADAL_AS_OF);
  for (const locale of LOCALES) assert.ok(body(locale).includes(dateYear(TRANSPORT_NADAL_AS_OF, locale)), `${locale}: the check date`);
});

test("every external link in the body goes to an operator's own page, and none is tracked", () => {
  for (const locale of LOCALES) {
    const links = [...json(locale).matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
    assert.ok(links.length >= 20, `${locale}: only ${links.length} sourced lines`);
    for (const href of links) {
      assert.match(href, /^https:\/\//, href);
      assert.ok(OFFICIAL.test(new URL(href).host), `${locale}: ${href}`);
      assert.ok(!/[?&]utm_|aerobusbcn/i.test(href), href);
    }
  }
});

test("internal links stay in their language, end in a slash and point at a published path; the day guides are linked", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    for (const key of ["hours", "newYear", "reis", "strikes"] as const) {
      assert.ok(json(locale).includes(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale}: links ${key}`);
    }
  }
});

test("New Year's Eve, the metro-hours guide and the Reis page link here once each, in the body", () => {
  for (const locale of LOCALES) {
    const here = `](/${locale}/${B2_PATHS.christmasTransport[locale]}/)`;
    for (const article of [NEW_YEAR, HOURS, REIS]) {
      const edition = article.editions[locale];
      const count = JSON.stringify(edition.blocks).split(here).length - 1;
      assert.equal(count, 1, `${article.key}/${locale} -> christmasTransport: ${count} links`);
      assert.ok(!edition.seoTitle.includes("christmasTransport") && !edition.seoDescription.includes(here), `${article.key}/${locale}: snippet untouched`);
    }
    assert.ok(christmasTransportMention(locale).includes(here), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* The facts                                                                  */
/* -------------------------------------------------------------------------- */

test("every operator row is publishable: own hosts, last season's notices, the right year per day", () => {
  assert.deepEqual(OPERATORS.map((o) => o.key), ["metro", "tmbBus", "nitbus", "rodalies", "fgc", "tram"]);
  for (const op of OPERATORS) assert.deepEqual(operatorProblems(op), [], op.key);
  // The validator refuses press, another year's label and aerobus.
  const fgc = operatorByKey("fgc");
  const eve = fgc.days.christmasEve!;
  assert.ok(operatorProblems({ ...fgc, days: { christmasEve: { ...eve, url: "https://www.lavanguardia.com/fgc-nadal" } } }).length > 0, "press");
  assert.ok(operatorProblems({ ...fgc, days: { christmasEve: { ...eve, year: 2026 } } }).length > 0, "wrong year");
  assert.ok(operatorProblems({ ...fgc, days: { christmasEve: { ...eve, url: "https://www.aerobusbcn.com/x" } } }).length > 0, "aerobus");
  assert.ok(operatorProblems({ ...fgc, notices: [{ ...fgc.notices[0]!, published: "2024-12-19" }] }).length > 0, "an older notice");
});

test("while no operator has published, every last-season line says its year and 'per confirmar', and no line claims 2026-27", () => {
  if (Object.values(ANNOUNCED_2026_27).some(Boolean)) return;
  const pending: Record<Locale, string> = { ca: "per confirmar", es: "por confirmar", en: "to be confirmed" };
  for (const locale of LOCALES) {
    for (const day of TRANSPORT_DAYS) {
      for (const item of dayItems(day, locale)) {
        assert.ok(!/\*\* \(2026-27\)/.test(item), `${locale} ${day}: a 2026-27 line without a notice: ${item}`);
        if (/\((2025|2026), /.test(item)) assert.ok(item.includes(pending[locale]), `${locale} ${day}: ${item}`);
      }
    }
    assert.ok(body(locale).includes(pending[locale]), locale);
  }
  // Every last-season fact appears with its year on the day it describes.
  for (const op of OPERATORS) {
    for (const [day, fact] of Object.entries(op.days)) {
      const items = dayItems(day as never, "ca").join(" ");
      assert.ok(items.includes(fact!.text.ca) && items.includes(`(${fact!.year}`), `${op.key} ${day}`);
    }
  }
});

test("metro and tram lines are the standing timetables applied to the 2026-27 days", () => {
  // TMB: 24 Dec closes 23:00; 26 Dec 2026 is a Saturday (all night); 31 Dec all night; 1 Jan runs on and closes 2:00 (Friday).
  assert.equal(metroDay(DAYS.christmasEve).close, "eleven");
  assert.equal(weekdayIndex(DAYS.santEsteve), 6);
  assert.equal(metroDay(DAYS.santEsteve).close, "allNight");
  assert.equal(metroDay(DAYS.newYearsEve).close, "allNight");
  assert.deepEqual(metroDay(DAYS.newYear), { date: DAYS.newYear, opensAtFive: false, close: "two" });
  assert.equal(metroDay(DAYS.reisEve).close, "two");
  assert.equal(metroDay(DAYS.reis).close, "midnight");
  assert.equal(metroLine(DAYS.christmasEve, "ca"), "obre a les 5:00 i tanca a les 23:00");
  // TRAM FAQ: 24 Dec 5:00-22:30; the eve of 1 January all night; Fridays, Saturdays and eves 2:00; else midnight.
  assert.equal(tramDay(DAYS.christmasEve).close, "tenThirty");
  assert.equal(tramDay(DAYS.christmas).close, "two");
  assert.equal(tramDay(DAYS.santEsteve).close, "two");
  assert.equal(tramDay(DAYS.newYearsEve).close, "allNight");
  assert.deepEqual(tramDay(DAYS.newYear), { opensAtFive: false, close: "two" });
  assert.equal(tramDay(DAYS.reis).close, "midnight");
  assert.equal(tramLine(DAYS.christmasEve, "en"), "opens at 5:00 and closes at 22:30");
  for (const locale of LOCALES) {
    const leadText = text(CHRISTMAS_TRANSPORT.editions[locale].blocks.slice(0, 1));
    assert.ok(leadText.includes("23:00"), `${locale}: Christmas Eve in the lead`);
    const table = CHRISTMAS_TRANSPORT.editions[locale].blocks.find((b) => b.type === "table") as unknown as { rows: string[][] };
    assert.equal(table.rows.length, TRANSPORT_DAYS.length, `${locale}: one metro row per day`);
  }
});

test("filling an operator's 2026-27 slot replaces its line for the days it covers, and only its own site is accepted", () => {
  const rod = operatorByKey("rodalies");
  assert.deepEqual(announcedProblems({ ...RODALIES_2027, read: TRANSPORT_NADAL_AS_OF }, rod), []);
  assert.ok(announcedProblems({ ...RODALIES_2027, read: TRANSPORT_NADAL_AS_OF, url: "https://www.elperiodico.com/rodalies-nadal" }, rod).length > 0, "press");
  assert.ok(announcedProblems({ ...RODALIES_2027, read: "2026-10-01" }, rod).length > 0, "read before the first check");
  assert.ok(announcedProblems({ ...RODALIES_2027, read: TRANSPORT_NADAL_AS_OF, days: {} }, rod).length > 0, "no day");
  for (const locale of LOCALES) {
    const items = dayItems("christmasEve", locale, { ...NONE, rodalies: RODALIES_2027 });
    const line = items.find((i) => i.includes(RODALIES_2027.url));
    assert.ok(line && line.includes("(2026-27)") && line.includes(RODALIES_2027.days.christmasEve![locale]), `${locale}: the 2026-27 line`);
    assert.ok(!items.some((i) => i.includes(rod.days.christmasEve!.text[locale])), `${locale}: last season's line is gone`);
    // Days the notice does not cover keep last season's line.
    assert.ok(dayItems("santEsteve", locale, { ...NONE, rodalies: RODALIES_2027 }).some((i) => i.includes(rod.days.santEsteve!.text[locale])), locale);
  }
  for (const [key, slot] of Object.entries(ANNOUNCED_2026_27)) {
    if (slot) assert.deepEqual(announcedProblems(slot, operatorByKey(key as OperatorKey)), [], key);
  }
});

test("last season's publication days are the notices' own, and the page prints them", () => {
  assert.equal(operatorByKey("fgc").notices[0]!.published, "2025-12-18");
  assert.equal(operatorByKey("rodalies").notices[0]!.published, "2025-12-16");
  assert.equal(operatorByKey("nitbus").notices[0]!.published, "2025-12-05");
  assert.equal(operatorByKey("tmbBus").notices[0]!.published, PAST.tmbChristmas2025.published);
  for (const locale of LOCALES) {
    for (const iso of ["2025-12-05", "2025-12-16", "2025-12-18", PAST.tmbChristmas2025.published]) assert.ok(body(locale).includes(dateYear(iso, locale)), `${locale}: ${iso}`);
  }
});

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, Record<string, string>> = { ca: { desembre: "12", gener: "01" }, es: { diciembre: "12", enero: "01" }, en: { december: "12", january: "01" } };
  let checked = 0;
  for (const locale of LOCALES) {
    const b = body(locale).toLowerCase();
    const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (\\d{1,2})(?![\\d:])(?: de | d'| )(${Object.keys(months[locale]).join("|")})(?:,? (?:de |del )?(\\d{4}))?`, "gu");
    for (const match of b.matchAll(pattern)) {
      const month = months[locale][match[3]!]!;
      const year = match[4] ?? (month === "01" ? "2027" : "2026");
      const iso = `${year}-${month}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked > 30, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* Clock, freshness, hero, route                                              */
/* -------------------------------------------------------------------------- */

test("the server HTML does not depend on the clock: no clock read, same body on any day", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/christmas-transport.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia\(/, "the module reads the clock");
  const stored = Object.fromEntries(LOCALES.map((l) => [l, JSON.stringify(CHRISTMAS_TRANSPORT.editions[l].blocks)]));
  for (const now of ["2026-12-24T22:30:00Z", "2027-01-01T03:00:00Z", "2025-06-01T10:00:00Z"]) {
    mock.timers.enable({ apis: ["Date"], now: Date.parse(now) });
    try {
      for (const locale of LOCALES) assert.equal(JSON.stringify(buildTransportBody(locale)), stored[locale], `${locale} at ${now}`);
    } finally {
      mock.timers.reset();
    }
  }
});

test("re-read the operators: from 18 December 2026 TRANSPORT_NADAL_AS_OF must be on or after that day", () => {
  assert.equal(TRANSPORT_NADAL_REREAD_BY, "2026-12-18");
  assert.equal(needsReread("2026-12-17"), false);
  assert.equal(needsReread("2026-12-18"), true);
  assert.equal(needsReread("2026-12-18", "2026-12-18"), false);
  const today = madridDate(new Date());
  assert.ok(TRANSPORT_NADAL_AS_OF <= today, `TRANSPORT_NADAL_AS_OF (${TRANSPORT_NADAL_AS_OF}) is in the future`);
  assert.equal(
    needsReread(today),
    false,
    `On ${today} the Christmas transport page was last read on ${TRANSPORT_NADAL_AS_OF}. Re-read each operator's watch page (TMB press room, ATM press releases, Rodalies news, the Generalitat press room for FGC, tram.cat), fill ANNOUNCED_2026_27 in src/lib/content/batch02/christmas-transport.ts with what is out, move TRANSPORT_NADAL_AS_OF, and publish ?only=transport-nadal.`,
  );
});

test("no new photograph: the hero is the metro-hours guide's file with its exact alt and caption", () => {
  assert.equal(CHRISTMAS_TRANSPORT.heroKey, HOURS.heroKey);
  assert.ok(CHRISTMAS_TRANSPORT.heroKey && IMAGE_BY_KEY.has(CHRISTMAS_TRANSPORT.heroKey));
  assert.deepEqual(CHRISTMAS_TRANSPORT.heroAlt, HOURS.heroAlt);
  assert.deepEqual(CHRISTMAS_TRANSPORT.heroCaption, HOURS.heroCaption);
  assert.equal(CHRISTMAS_TRANSPORT.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!CHRISTMAS_TRANSPORT.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = CHRISTMAS_TRANSPORT.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string } | undefined;
    for (const link of box?.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("the publish route registers `transport-nadal` and `transport-nadal-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ CHRISTMAS_TRANSPORT \} from "@\/lib\/content\/batch02\/christmas-transport";/);
  assert.match(route, /wants\("transport-nadal"\)\) published\.push\(await publishB2Article\(CHRISTMAS_TRANSPORT\)\)/);
  assert.match(route, /wants\("transport-nadal-links"\)\) published\.push\(await publishB2Article\(NEW_YEAR\), await publishB2Article\(HOURS\)\)/);
});
