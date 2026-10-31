import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { mock, test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  AGENDA_DECEMBER,
  BARCELONA_DECEMBER,
  BARCELONA_DECEMBER_AS_OF,
  BARCELONA_DECEMBER_META,
  BCN_LOCAL_DAYS,
  BCN_SHOP_DAYS,
  DECEMBER_HOLIDAYS,
  L2_WORKS,
  METRO_PROSE,
  TORRE_DEL_SURO_2026,
  buildBarcelonaDecemberBody,
  dayLabel,
  keyDateRows,
  pendingItems,
} from "../src/lib/content/batch02/barcelona-december.ts";
import { CHRISTMAS, SANTA_LLUCIA_2025 } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { ANNOUNCED_TRADITIONS, seasonSpanProblems, type TraditionAnnouncements } from "../src/lib/content/batch02/christmas-traditions.ts";
import { CLIMATE, climateMonth, WINTER_START } from "../src/lib/content/batch02/climate.ts";
import { BRIDGE_DAYS, DECEMBER_BRIDGE, SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { ANNOUNCED_2026, DAYS, PAST, SWITCH_ON_HISTORY, announcementProblems, dayDate, type Announcements } from "../src/lib/content/batch02/festive.ts";
import { GROSSA_DRAW_DATE } from "../src/lib/content/batch02/grossa.ts";
import { MARATO } from "../src/lib/content/batch02/marato.ts";
import { KNOWN } from "../src/lib/content/batch02/pessebres.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { TOWNS_NOV_DEC } from "../src/lib/content/batch02/shops.ts";
import { SKI, SKI_OPENING_2026 } from "../src/lib/content/batch02/ski.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, shortDate, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { agendaPageUrl } from "../src/lib/content/pessebres/agenda.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";

/**
 * Barcelona in December 2026 (31 Oct 2026): the dated hub for the month.
 *
 * What it must never do: type a date a shared module already holds, print a
 * 2026 date nobody official has published (the lights, Santa Llúcia, the New
 * Year's Eve show), give last year's dates as this year's, put a weekday next
 * to the wrong day, or render differently depending on the day it is built.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(BARCELONA_DECEMBER.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(BARCELONA_DECEMBER.editions[locale].blocks);
const ROOT = new URL("..", import.meta.url);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([
  ...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...christmasFairsPaths().map((p) => p.path),
]);

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the evergreen registry paths", () => {
  const expected: Record<Locale, string> = { ca: "guies/barcelona-al-desembre", es: "guias/barcelona-en-diciembre", en: "guides/barcelona-in-december" };
  for (const locale of LOCALES) {
    const edition = BARCELONA_DECEMBER.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1200, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.barcelonaDecember[locale]);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.barcelonaDecember[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
    assert.ok(!christmasFairsPaths().some((p) => p.path === `/${locale}/${path}/`), path);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.barcelonaDecember[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155, carry the year and the searched words", () => {
  const words: Record<Locale, RegExp> = {
    ca: /^Què fer a Barcelona al desembre 2026/,
    es: /^Qué hacer en Barcelona en diciembre 2026/,
    en: /^Barcelona in December 2026/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = BARCELONA_DECEMBER.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200);
    assert.match(seoTitle, words[locale]);
    assert.match(title, words[locale]);
    // Answer first: the snippet names the holidays and La Marató's day.
    assert.match(seoDescription, /\b8(th)?\b.*\b25(th)?\b.*\b26(th)?\b/, locale);
    assert.match(seoDescription, /La Marató/, locale);
    assert.ok(seoDescription.includes(String(climateMonth(11).high).replace(".", locale === "en" ? "." : ",")), `${locale}: December high from the climate table`);
  }
  assert.equal(BARCELONA_DECEMBER.editions.en.title, "Barcelona in December 2026: what's on, holidays and what's open");
});

test("sources are https and untracked, never aerobusbcn, and the reader sees the check date", () => {
  assert.ok(BARCELONA_DECEMBER.sources.length >= 20);
  const urls = new Set<string>();
  for (const source of BARCELONA_DECEMBER.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.ok(!/aerobusbcn/i.test(source.url), source.url);
    assert.ok(!urls.has(source.url), `duplicate source ${source.url}`);
    urls.add(source.url);
  }
  // The climate and ski sources were found in their own modules, not dropped.
  for (const part of ["valoresclimatologicos?l=0076", "efemerides_extremos", "X4_2010-2025", "astronomia.ign.es", "baqueira-beret-activa", "lamolina/estacio/informacio-tecnica", L2_WORKS.url]) {
    assert.ok([...urls].some((url) => url.includes(part)), part);
  }
  assert.equal(BARCELONA_DECEMBER.verifiedAt, BARCELONA_DECEMBER_AS_OF);
  for (const locale of LOCALES) {
    assert.match(body(locale), /31 (d'octubre|de octubre|October) (de )?2026/, locale);
    assert.ok(!/aerobusbcn/i.test(json(locale)));
  }
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    // The pages being built in parallel (Loteria de Nadal, Ponts 2027) are not linked.
    assert.doesNotMatch(json(locale), /loteria-de-nadal|loteria-navidad|christmas-lottery|ponts-2027|puentes-2027/i, locale);
  }
});

test("no link is wrapped in bold: the inline renderer would print it as text", () => {
  for (const locale of LOCALES) assert.doesNotMatch(json(locale), /\*\*\[[^\]]+\]\([^)]+\)\*\*/, locale);
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = BARCELONA_DECEMBER.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("no new photograph: the hero is the Christmas markets guide's file with its exact alt and caption", () => {
  assert.equal(BARCELONA_DECEMBER.heroKey, CHRISTMAS.heroKey);
  assert.ok(BARCELONA_DECEMBER.heroKey && IMAGE_BY_KEY.has(BARCELONA_DECEMBER.heroKey));
  assert.deepEqual(BARCELONA_DECEMBER.heroAlt, CHRISTMAS.heroAlt);
  assert.deepEqual(BARCELONA_DECEMBER.heroCaption, CHRISTMAS.heroCaption);
  assert.equal(BARCELONA_DECEMBER.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!BARCELONA_DECEMBER.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("an FAQ in the searchers' words", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Què fer a Barcelona al desembre del 2026?", "Quins dies són festius a Barcelona al desembre del 2026?", "Quin temps fa a Barcelona al desembre?", "Obren les botigues els diumenges de desembre a Barcelona?", "Quan s'encenen els llums de Nadal de Barcelona el 2026?", "Quan és la Fira de Santa Llúcia 2026?"],
    es: ["¿Qué hacer en Barcelona en diciembre de 2026?", "¿Qué días son festivos en Barcelona en diciembre de 2026?", "¿Qué tiempo hace en Barcelona en diciembre?", "¿Abren las tiendas los domingos de diciembre en Barcelona?", "¿Cuándo encienden las luces de Navidad en Barcelona en 2026?", "¿Cuándo es la Fira de Santa Llúcia 2026?"],
    en: ["What is there to do in Barcelona in December 2026?", "What are the public holidays in Barcelona in December 2026?", "What is the weather like in Barcelona in December?", "Are shops open on Sundays in Barcelona in December?", "When are the Barcelona Christmas lights switched on in 2026?", "When is the Santa Llúcia Christmas market in 2026?"],
  };
  for (const locale of LOCALES) {
    const faq = BARCELONA_DECEMBER.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string }[] };
    for (const question of questions[locale]) assert.ok(faq.items.some((item) => item.question === question), `${locale}: ${question}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Dates come from the shared modules                                         */
/* -------------------------------------------------------------------------- */

test("December's holidays are the Catalonia calendar's: 8, 25 and 26; 6, 7, 24 and 31 are not", () => {
  assert.deepEqual([...DECEMBER_HOLIDAYS], [BRIDGE_DAYS.immaculada, DAYS.christmas, DAYS.santEsteve]);
  for (const iso of DECEMBER_HOLIDAYS) assert.ok(holidayOn(iso), iso);
  for (const iso of [BRIDGE_DAYS.constitution, BRIDGE_DAYS.monday, DAYS.christmasEve, DAYS.newYearsEve]) assert.equal(holidayOn(iso), null, iso);
  assert.equal(weekdayIndex(BRIDGE_DAYS.constitution), 0, "6 December 2026 is a Sunday");
  for (const locale of LOCALES) {
    const leadText = text(BARCELONA_DECEMBER.editions[locale].blocks.slice(0, 1));
    for (const iso of DECEMBER_HOLIDAYS) assert.ok(leadText.includes(holidayOn(iso)!.name[locale]), `${locale}: ${iso} in the lead`);
  }
});

test("Barcelona's shop days and local holidays are the holiday engine's (Resolució EMT/4342/2025, Ordre EMT/208/2025)", () => {
  const bcn = municipalityBySlug("barcelona")!;
  assert.deepEqual([...BCN_SHOP_DAYS], bcn.shops.filter((d) => d.startsWith("2026-12")));
  assert.deepEqual([...BCN_SHOP_DAYS], ["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"]);
  assert.ok(!TOWNS_NOV_DEC.some((t) => t.town === "Barcelona"), "Barcelona keeps the default days");
  assert.deepEqual([...BCN_LOCAL_DAYS], bcn.local);
  assert.ok(!BCN_LOCAL_DAYS.some((d) => d.startsWith("2026-12")), "no local holiday in December");
  // Never "open" on Christmas or Sant Esteve.
  for (const iso of [DAYS.christmas, DAYS.santEsteve]) assert.ok(!BCN_SHOP_DAYS.includes(iso));
});

test("La Marató, La Grossa, the ski openings, the nativity and school are the modules' own dates", () => {
  for (const locale of LOCALES) {
    const leadText = text(BARCELONA_DECEMBER.editions[locale].blocks.slice(0, 1));
    assert.ok(leadText.includes(dayDate(MARATO.date, locale, false)), `${locale}: La Marató in the lead`);
    assert.ok(leadText.includes(dayDate(GROSSA_DRAW_DATE, locale, false)), `${locale}: La Grossa in the lead`);
    const days = keyDateRows(locale).map((row) => row[0]);
    for (const iso of [MARATO.date, GROSSA_DRAW_DATE, SKI_OPENING_2026.fgc, TORRE_DEL_SURO_2026.date, BRIDGE_DAYS.schoolChristmasFrom, WINTER_START.date, ...BCN_SHOP_DAYS, ...DECEMBER_HOLIDAYS]) {
      assert.ok(days.includes(dayLabel(iso, undefined, locale)), `${locale}: ${iso} has a row`);
    }
    assert.ok(days.includes(dayLabel(BRIDGE_DAYS.saturday, BRIDGE_DAYS.immaculada, locale)), `${locale}: the bridge row`);
  }
  // The ski dates are the ski guide's table.
  const ski = text(SKI.editions.ca.blocks);
  for (const iso of Object.values(SKI_OPENING_2026)) {
    const day = dayDate(iso, "ca");
    assert.ok(ski.includes(day.charAt(0).toUpperCase() + day.slice(1)), `ski guide: ${iso}`);
  }
  // The nativity is pessebres.ts's Torre del Suro row.
  const torre = KNOWN.find((k) => k.name.includes("Torre del Suro"))!;
  assert.match(torre.dates!.ca, /^21 de desembre de 2026 a les 18 h/);
  assert.equal(TORRE_DEL_SURO_2026.url, torre.url);
});

test("the weather figures are the climate guide's December row and its source periods", () => {
  const w = climateMonth(11);
  const climate = CLIMATE.editions.ca.blocks.find((b) => b.type === "table") as { rows: string[][] };
  const december = climate.rows[11]!;
  assert.equal(december[0], "Desembre");
  const c = (v: number) => v.toFixed(1).replace(".", ",");
  assert.deepEqual(december.slice(1), [c(w.mean), c(w.high), c(w.low), String(w.rain), c(w.rainDays), `${w.humidity} %`, String(w.sun)]);
  assert.ok(text(CLIMATE.editions.ca.blocks).includes(`21 de desembre de 2026 a les ${WINTER_START.time}`), "winter start is the climate guide's");
  for (const locale of LOCALES) {
    const f = (v: number) => (locale === "en" ? v.toFixed(1) : v.toFixed(1).replace(".", ","));
    const b = body(locale);
    for (const value of [w.high, w.low, w.mean, w.cityHigh, w.cityLow, w.recordHigh, w.recordLow]) assert.ok(b.includes(`${f(value)} °C`) || b.includes(`${f(value)} i`) || b.includes(`${f(value)} y`) || b.includes(`${f(value)} and`), `${locale}: ${value}`);
    for (const value of [w.rain, w.sun, w.humidity]) assert.ok(b.includes(String(value)), `${locale}: ${value}`);
    assert.match(b, /AEMET, 1981-2010/, locale);
    assert.match(b, /2010-2025/, locale);
    assert.doesNotMatch(b, /1991-2020/, `${locale}: no 1991-2020 claim`);
  }
});

test("last year's Santa Llúcia dates are the Christmas markets guide's", () => {
  const markets = text(CHRISTMAS.editions.ca.blocks);
  assert.ok(markets.includes(`del ${shortDate(SANTA_LLUCIA_2025.from, "ca")} fins al ${shortDate(SANTA_LLUCIA_2025.to, "ca")}`));
  assert.equal(SANTA_LLUCIA_2025.from.slice(0, 4), "2025");
});

test("the metro sentences say what TMB's standing rules compute", () => {
  assert.equal(METRO_PROSE.christmasEve, "eleven");
  assert.equal(METRO_PROSE.newYearsEve, "allNight");
  const said: Record<Locale, RegExp[]> = {
    ca: [/tanca a les 23:00/, /tota la nit/],
    es: [/cierra a las 23:00/, /toda la noche/],
    en: [/closes at 23:00/, /all night/],
  };
  for (const locale of LOCALES) for (const pattern of said[locale]) assert.match(body(locale), pattern, locale);
});

test("the L2 works come from the City Council's note: trains back on Friday 4 December at 5:00", () => {
  assert.match(L2_WORKS.url, /^https:\/\/ajuntament\.barcelona\.cat\/premsa\/2026\/10\/29\//);
  assert.equal(weekdayIndex(L2_WORKS.until), 4);
  assert.equal(weekdayIndex(L2_WORKS.back), 5);
  for (const locale of LOCALES) {
    assert.ok(json(locale).includes(L2_WORKS.url), locale);
    assert.match(body(locale), /La Pau/, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Not announced is said, never guessed                                       */
/* -------------------------------------------------------------------------- */

const NONE: Announcements = { lightsSwitchOn: null, pessebre: null, santJaume: null, newYearShow: null, cavalcada: null };
const NO_TRADITIONS: TraditionAnnouncements = { santaLlucia: null, pastorets: null };
const LIGHTS = { date: "2026-11-21", time: "18:00", url: "https://ajuntament.barcelona.cat/premsa/2026/11/01/encesa/" };
const FAIR = { from: "2026-11-27", to: "2026-12-23", url: "https://firadesantallucia.cat/calendari.php" };

test("while the lights and Santa Llúcia are unannounced, the page says so and gives last year's dates with their year", () => {
  if (ANNOUNCED_2026.lightsSwitchOn || ANNOUNCED_TRADITIONS.santaLlucia) return;
  const pending: Record<Locale, RegExp> = { ca: /encara no/i, es: /aún no/i, en: /not (been )?announced yet|has not announced/i };
  for (const locale of LOCALES) {
    const items = pendingItems(locale);
    assert.ok(items.length >= 5, locale);
    const lights = items[0]!;
    assert.match(lights, pending[locale]);
    for (const s of SWITCH_ON_HISTORY) assert.ok(lights.includes(dayDate(s.date, locale)), `${locale}: ${s.date} with its year`);
    const fair = items[1]!;
    assert.match(fair, /Santa Llúcia/);
    assert.match(fair, pending[locale]);
    assert.match(fair, /2025/);
    const keyFacts = BARCELONA_DECEMBER.editions[locale].blocks.find((b) => b.type === "keyFacts") as { items: { value: string }[] };
    assert.ok(keyFacts.items.filter((i) => pending[locale].test(i.value)).length >= 3, `${locale}: key facts say "not announced"`);
  }
});

test("past dates are never printed as 2026's", () => {
  const past = [PAST.lights2023.switchOn, PAST.lights2024.switchOn, PAST.lights2025.switchOn, SANTA_LLUCIA_2025.from, SANTA_LLUCIA_2025.to, PAST.pessebre2025.from];
  for (const locale of LOCALES) {
    const b = body(locale) + " " + text(buildBarcelonaDecemberBody(locale, NONE, NO_TRADITIONS, null));
    for (const iso of past) {
      assert.notEqual(iso.slice(0, 4), "2026");
      assert.ok(!new RegExp(`\\b${shortDate(iso, locale)},? (de )?2026`).test(b), `${locale}: ${iso} printed as 2026`);
    }
    // No 2026 Santa Llúcia or switch-on date is invented.
    assert.doesNotMatch(b, /Santa Llúcia[^.]*(fins al|hasta el|until) 23 (de desembre|de diciembre|December) (de )?2026/, locale);
  }
});

test("an announced date moves from 'still to be announced' into the day-by-day table by itself", () => {
  assert.deepEqual(announcementProblems(LIGHTS), []);
  assert.deepEqual(seasonSpanProblems(FAIR), []);
  for (const locale of LOCALES) {
    const facts: Announcements = { ...NONE, lightsSwitchOn: LIGHTS };
    const traditions: TraditionAnnouncements = { ...NO_TRADITIONS, santaLlucia: FAIR };
    const rows = keyDateRows(locale, facts, traditions, { time: "13:00", source: { name: "x", url: "https://www.loteriesdecatalunya.cat/", publisher: "Loteries de Catalunya" } });
    assert.ok(rows.some((r) => r[0] === dayLabel(LIGHTS.date, undefined, locale) && r[1]!.includes("18:00")), `${locale}: lights row`);
    assert.ok(rows.some((r) => r[0] === dayLabel(FAIR.from, FAIR.to, locale) && /Santa Llúcia/.test(r[1]!)), `${locale}: Santa Llúcia row`);
    assert.ok(rows.some((r) => r[0] === dayLabel(GROSSA_DRAW_DATE, undefined, locale) && r[1]!.includes("13:00")), `${locale}: La Grossa time`);
    // Rows stay in date order.
    const firstDays = rows.map((r) => r[0]);
    assert.equal(firstDays[0], dayLabel(LIGHTS.date, undefined, locale));
    const items = pendingItems(locale, facts, traditions, { time: "13:00", source: { name: "x", url: "https://www.loteriesdecatalunya.cat/", publisher: "x" } });
    assert.ok(!items.some((i) => /llums|luces|lights|Santa Llúcia|Grossa/.test(i)), `${locale}: no longer pending`);
    const built = text(buildBarcelonaDecemberBody(locale, facts, traditions, null));
    assert.ok(built.includes(dayDate(LIGHTS.date, locale)) || built.includes(dayDate(LIGHTS.date, locale, false)), locale);
  }
});

test("ski openings are never promised", () => {
  const must: Record<Locale, RegExp> = { ca: /si la meteorologia i la neu ho permeten/, es: /siempre que las condiciones meteorológicas y de nieve lo permitan/, en: /weather and snow permitting/ };
  for (const locale of LOCALES) {
    assert.match(body(locale), must[locale], locale);
    assert.doesNotMatch(body(locale), /hi haurà neu|habrá nieve|there will be snow|garantit|garantizad|guaranteed/i, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* The cultural agenda items                                                  */
/* -------------------------------------------------------------------------- */

test("every agenda item has an official agenda page, a December 2026 date, and is labelled with its source; no prices", () => {
  assert.ok(AGENDA_DECEMBER.length >= 5);
  for (const item of AGENDA_DECEMBER) {
    const url = agendaPageUrl(item.codi);
    assert.ok(url, item.codi);
    assert.match(item.from, /^2026-12-\d{2}$/, item.name);
    if (item.to) assert.ok(item.to >= item.from && item.to.startsWith("2026-12"), item.name);
    if (item.time) assert.match(item.time, /^([01]\d|2[0-3]):[0-5]\d$/, item.name);
    for (const locale of LOCALES) {
      assert.ok(json(locale).includes(`](${url})`), `${locale}: ${item.name} links its agenda page`);
      assert.ok(body(locale).includes(item.name), `${locale}: ${item.name}`);
    }
  }
  for (const locale of LOCALES) assert.doesNotMatch(body(locale), /€|\beuros?\b/i, `${locale}: a price is printed`);
});

/* -------------------------------------------------------------------------- */
/* Weekdays and the clock                                                     */
/* -------------------------------------------------------------------------- */

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, Record<string, string>> = {
    ca: { novembre: "11", desembre: "12", gener: "01" },
    es: { noviembre: "11", diciembre: "12", enero: "01" },
    en: { november: "11", december: "12", january: "01" },
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const b = body(locale).toLowerCase();
    const pattern = new RegExp(
      `\\b(${weekdays[locale].join("|")}),? (?:the )?(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])(?:(?: de | d'| )(${Object.keys(months[locale]).join("|")})(?:,? (?:de |del )?(\\d{4}))?)?`,
      "gu",
    );
    for (const match of b.matchAll(pattern)) {
      const month = match[3] ? months[locale][match[3]]! : "12";
      const year = match[4] ?? (month === "01" ? "2027" : "2026");
      const iso = `${year}-${month}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked > 120, `only ${checked} weekday mentions checked`);
});

test("the server HTML does not depend on the clock: no clock read, same body on any day", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/barcelona-december.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia\(/, "the module reads the clock");
  const stored = Object.fromEntries(LOCALES.map((l) => [l, JSON.stringify(BARCELONA_DECEMBER.editions[l].blocks)]));
  for (const now of ["2026-12-24T23:30:00Z", "2027-06-01T10:00:00Z", "2025-01-01T00:00:00Z"]) {
    mock.timers.enable({ apis: ["Date"], now: Date.parse(now) });
    try {
      for (const locale of LOCALES) assert.equal(JSON.stringify(buildBarcelonaDecemberBody(locale)), stored[locale], `${locale} at ${now}`);
    } finally {
      mock.timers.reset();
    }
  }
  for (const locale of LOCALES) assert.deepEqual(BARCELONA_DECEMBER_META[locale].seoTitle, BARCELONA_DECEMBER.editions[locale].seoTitle);
});

/* -------------------------------------------------------------------------- */
/* Links into the page and the publish route                                  */
/* -------------------------------------------------------------------------- */

test("the Christmas in Barcelona page, the weather guide and the December bridge each link here exactly once", () => {
  for (const locale of LOCALES) {
    const here = `](/${locale}/${B2_PATHS.barcelonaDecember[locale]}/)`;
    for (const article of [CHRISTMAS_BARCELONA, CLIMATE, DECEMBER_BRIDGE]) {
      const count = JSON.stringify(article.editions[locale].blocks).split(here).length - 1;
      assert.equal(count, 1, `${article.key}/${locale} -> barcelonaDecember: ${count} links`);
    }
  }
});

test("the publish route has the page's group and the links group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ BARCELONA_DECEMBER \} from "@\/lib\/content\/batch02\/barcelona-december";/);
  assert.match(route, /wants\("barcelona-december"\)\) published\.push\(await publishB2Article\(BARCELONA_DECEMBER\)\)/);
  const links = route.slice(route.indexOf('wants("barcelona-december-links")'));
  for (const article of ["CHRISTMAS_BARCELONA", "CLIMATE", "DECEMBER_BRIDGE"]) assert.match(links.slice(0, 400), new RegExp(`publishB2Article\\(${article}\\)`), article);
});
