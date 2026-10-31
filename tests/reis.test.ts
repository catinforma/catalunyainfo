import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { mock, test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { CHRISTMAS_TRADITIONS } from "../src/lib/content/batch02/christmas-traditions.ts";
import { ANNOUNCED_2026, DAYS, PAST, dateYear, dayDate } from "../src/lib/content/batch02/festive.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import {
  ANNOUNCED_2027,
  BARCELONA_2026,
  BARCELONA_HOSTS,
  FESTIVE_PARADE_DAY,
  IGUALADA_DECLARATION,
  PARADE_DAY,
  PARADE_WEEKDAY,
  REIS,
  REIS_AS_OF,
  REIS_DAY,
  REIS_META,
  REIS_WATCH,
  SCHOOL_CHRISTMAS,
  SEASON_2027,
  SHOP_DAYS,
  TOWNS,
  TRANSPORT_2026,
  buildReisBody,
  isStale,
  paradeProblems,
  reisDescription,
  reisLead,
  reisSeoTitle,
  reisSources,
  stopsTable,
  townRows,
  townsIntro,
  type Announced2027,
  type Parade,
} from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { OPENING_2027, SHOPS } from "../src/lib/content/batch02/shops.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { CATALONIA_HOLIDAYS } from "../src/lib/content/holidays/payload.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";

/**
 * Cavalcada de Reis 2027 (31 Oct 2026): the Three Kings parade in Barcelona
 * and the larger towns.
 *
 * What it must never do: print a 2027 time or route no council has published,
 * pass last year's times off as this year's, type a date a shared module
 * already holds, render differently depending on the day it is built, or
 * still say "not announced" after the parade has happened.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(REIS.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(REIS.editions[locale].blocks);
const ROOT = new URL("..", import.meta.url);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([
  ...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...christmasFairsPaths().map((p) => p.path),
]);

const EMPTY_TOWNS: Announced2027["towns"] = { girona: null, lleida: null, tarragona: null, reus: null, sabadell: null, mataro: null, badalona: null, igualada: null };
const NONE: Announced2027 = { barcelona: null, towns: EMPTY_TOWNS };

/** A plausible 2027 Barcelona announcement: last year's shape with a 2027 date (never real data). */
const BCN_2027: Parade = {
  ...BARCELONA_2026,
  date: "2027-01-05",
  time: "17:45",
  arrival: { time: "16:15", place: "Portal de la Pau" },
  stops: [
    { time: "17:45", place: "Parc de la Ciutadella" },
    { time: "18:20", place: "Passeig de Colom amb Via Laietana" },
    { time: "20:55", place: "Avinguda de Francesc Ferrer i Guàrdia" },
  ],
  endTime: "20:55",
  url: "https://ajuntament.barcelona.cat/premsa/2027/01/02/cavalcada-de-reis-2027/",
  read: "2027-01-02",
};
/** The November-style announcement: time and arrival, no route yet. */
const BCN_PROGRAMME: Parade = {
  date: "2027-01-05",
  time: "18:00",
  arrival: { time: "16:30", place: "Portal de la Pau" },
  end: "Font Màgica de Montjuïc",
  url: "https://ajuntament.barcelona.cat/premsa/2026/11/12/programa-de-nadal/",
  read: "2026-11-12",
};
const GIRONA_2027: Parade = {
  date: "2027-01-05",
  time: "18:15",
  start: "Camp de Mart",
  end: "plaça de l'U d'Octubre de 2017",
  url: "https://web.girona.cat/nadal/reis/cavalcada",
  read: "2026-12-20",
};

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths", () => {
  const expected: Record<Locale, string> = { ca: "guies/cavalcada-de-reis-barcelona", es: "guias/cabalgata-de-reyes-barcelona", en: "guides/three-kings-parade-barcelona" };
  for (const locale of LOCALES) {
    const edition = REIS.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1500, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.reis[locale]);
    assert.equal(edition.path, REIS_META[locale].path);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    // A filled page is valid too.
    const filled = buildReisBody(locale, { barcelona: BCN_2027, towns: { ...EMPTY_TOWNS, girona: GIRONA_2027 } });
    assert.ok(bodySchema.safeParse(filled).success, `${locale}: filled body`);
  }
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.reis[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
    assert.ok(!christmasFairsPaths().some((p) => p.path === `/${locale}/${path}/`), path);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.reis[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155, carry 2027 and the searched words, before and after Barcelona publishes", () => {
  const words: Record<Locale, RegExp> = { ca: /^Cavalcada de Reis 2027 Barcelona/, es: /^Cabalgata de Reyes 2027 Barcelona/, en: /^Three Kings Parade 2027 Barcelona/ };
  const asked: Record<Locale, RegExp> = { ca: /horari i recorregut/, es: /horario y recorrido/, en: /times and route/ };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = REIS.editions[locale];
    for (const slot of [null, BCN_2027, BCN_PROGRAMME]) {
      const t = reisSeoTitle(locale, slot);
      const d = reisDescription(locale, slot);
      assert.ok(t.length > 20 && t.length <= 60, `${locale} title ${t.length}: ${t}`);
      assert.ok(d.length > 80 && d.length <= 155, `${locale} description ${d.length}: ${d}`);
      assert.match(t, words[locale]);
      assert.match(d, /2027/);
    }
    assert.equal(seoTitle, reisSeoTitle(locale, ANNOUNCED_2027.barcelona));
    assert.equal(seoDescription, reisDescription(locale, ANNOUNCED_2027.barcelona));
    assert.match(title, /2027/);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    // Answer first: the pending snippet names the day; the filled one, the time.
    assert.match(reisSeoTitle(locale, null), asked[locale]);
    assert.ok(reisDescription(locale, null).includes(dayDate(PARADE_DAY, locale, false)), `${locale}: the day in the description`);
    assert.ok(reisSeoTitle(locale, BCN_2027).includes(BCN_2027.time), `${locale}: the time in the title`);
    assert.ok(reisDescription(locale, BCN_2027).includes(BCN_2027.time), `${locale}: the time in the description`);
  }
});

test("sources are https, untracked, official and listed once; the reader sees the check date", () => {
  const urls = new Set<string>();
  assert.ok(REIS.sources.length >= 20);
  for (const source of REIS.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.ok(!urls.has(source.url), `duplicate source ${source.url}`);
    urls.add(source.url);
    const host = new URL(source.url).host;
    assert.match(host, /(^|\.)(barcelona\.cat|dtibcn\.cat|tmb\.cat|gencat\.cat|boe\.es|girona\.cat|paeria\.cat|tarragona\.cat|reus\.cat|sabadell\.cat|mataro\.cat|badalona\.cat|igualada\.cat)$/, `${host} is not an official source`);
  }
  for (const town of TOWNS) {
    assert.ok(urls.has(town.past.url), `${town.name}: its 2026 page is a source`);
    if (town.news2027) assert.ok(urls.has(town.news2027.url), `${town.name}: its 2027 news is a source`);
  }
  for (const url of [BARCELONA_2026.url, PAST.programme2025.url, TRANSPORT_2026.url, IGUALADA_DECLARATION.url]) assert.ok(urls.has(url), url);
  // A filled slot's page goes in first.
  assert.equal(reisSources({ barcelona: BCN_2027, towns: EMPTY_TOWNS })[0]?.url, BCN_2027.url);
  assert.equal(REIS.verifiedAt, REIS_AS_OF);
  for (const locale of LOCALES) assert.ok(body(locale).includes(dateYear(REIS_AS_OF, locale)), `${locale}: the check date`);
});

test("internal links stay in their language, end in a slash and point at a published path; none is bold", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    assert.doesNotMatch(json(locale), /\*\*\[[^\]]+\]\([^)]+\)\*\*/, locale);
    for (const key of ["christmasTraditions", "shops", "hours", "bridges2027", "girona", "tarragona"] as const) {
      assert.ok(json(locale).includes(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale}: links ${key}`);
    }
    assert.ok(json(locale).includes(`](/${locale}/${TOOL_PATHS.school[locale]}/)`), `${locale}: links the school calendar`);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = REIS.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("no new photograph: the hero is the shops guide's file with its exact alt and caption", () => {
  assert.equal(REIS.heroKey, SHOPS.heroKey);
  assert.ok(REIS.heroKey && IMAGE_BY_KEY.has(REIS.heroKey));
  assert.deepEqual(REIS.heroAlt, SHOPS.heroAlt);
  assert.deepEqual(REIS.heroCaption, SHOPS.heroCaption);
  assert.equal(REIS.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!REIS.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("an FAQ in the searchers' words", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["A quina hora és la Cavalcada de Reis 2027 a Barcelona?", "Quin és el recorregut de la Cavalcada de Reis de Barcelona?", "On arriben els Reis a Barcelona?", "Quan és la Cavalcada de Reis 2027 a Girona?", "El 6 de gener de 2027 és festiu?", "Obren les botigues el dia de Reis?"],
    es: ["¿A qué hora es la Cabalgata de Reyes 2027 en Barcelona?", "¿Cuál es el recorrido de la Cabalgata de Reyes de Barcelona?", "¿Dónde llegan los Reyes Magos a Barcelona?", "¿Cuándo es la Cabalgata de Reyes 2027 en Girona?", "¿El 6 de enero de 2027 es festivo?", "¿Abren las tiendas el día de Reyes?"],
    en: ["What time is the Three Kings parade in Barcelona in 2027?", "What is the route of the Barcelona Three Kings parade?", "Where do the Three Kings arrive in Barcelona?", "When is the 2027 Three Kings parade in Girona?", "Is 6 January 2027 a public holiday?", "Are shops open on Three Kings' Day?"],
  };
  for (const locale of LOCALES) {
    const faq = REIS.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    for (const question of questions[locale]) assert.ok(faq.items.some((item) => item.question === question), `${locale}: ${question}`);
    for (const item of faq.items) assert.ok(item.answer.length > 20, `${locale}: ${item.question} has an empty answer`);
  }
});

/* -------------------------------------------------------------------------- */
/* Dates come from the shared modules                                         */
/* -------------------------------------------------------------------------- */

test("6 January is Ordre EMT/52/2026's holiday and the parade is the Tuesday before it, as festive.ts says", () => {
  assert.ok(CATALONIA_HOLIDAYS.some((h) => h.date === REIS_DAY));
  assert.equal(REIS_DAY, "2027-01-06");
  assert.equal(holidayOn(REIS_DAY)?.scope, "catalonia");
  assert.equal(weekdayIndex(REIS_DAY), 3, "6 January 2027 is a Wednesday");
  assert.equal(PARADE_DAY, "2027-01-05");
  assert.equal(PARADE_WEEKDAY, 2, "5 January 2027 is a Tuesday");
  assert.equal(holidayOn(PARADE_DAY), null, "5 January is a working day");
  assert.equal(PARADE_DAY, FESTIVE_PARADE_DAY);
  assert.equal(REIS_DAY, DAYS.reis);
  for (const locale of LOCALES) {
    const leadText = text(REIS.editions[locale].blocks.slice(0, 1));
    assert.ok(leadText.includes(dayDate(PARADE_DAY, locale)), `${locale}: the parade day in the lead`);
    assert.ok(leadText.includes(dayDate(REIS_DAY, locale, false)), `${locale}: the holiday in the lead`);
    assert.ok(body(locale).includes(holidayOn(REIS_DAY)!.name[locale]), `${locale}: the holiday's name`);
  }
});

test("the school holidays are Ordre EDF/66/2026's and the shop days Ordre EMT/89/2026's", () => {
  const year = SCHOOL_YEARS.find((y) => y.label === "2026-2027")!;
  assert.deepEqual([SCHOOL_CHRISTMAS.from, SCHOOL_CHRISTMAS.to], year.christmas);
  assert.equal(SCHOOL_CHRISTMAS.to, "2027-01-07");
  // The page says children are still on holiday on the 5th and the 6th.
  assert.ok(SCHOOL_CHRISTMAS.from <= PARADE_DAY && REIS_DAY <= SCHOOL_CHRISTMAS.to);
  assert.equal(SHOP_DAYS.reisIsOpeningDay, (OPENING_2027.general as readonly string[]).includes(REIS_DAY));
  assert.equal(SHOP_DAYS.reisIsOpeningDay, false);
  assert.deepEqual([...SHOP_DAYS.before], OPENING_2027.general.filter((d) => d.startsWith("2027-01") && d < REIS_DAY));
  assert.equal(SHOP_DAYS.municipalJanuary, OPENING_2027.municipalDefault[0]);
  for (const locale of LOCALES) {
    const b = body(locale);
    assert.ok(b.includes(dayDate(SCHOOL_CHRISTMAS.from, locale)) && b.includes(dayDate(SCHOOL_CHRISTMAS.to, locale)), `${locale}: school dates`);
    for (const iso of SHOP_DAYS.before) assert.ok(b.includes(dayDate(iso, locale, false)), `${locale}: ${iso}`);
    assert.ok(b.includes(dayDate(SHOP_DAYS.municipalJanuary!, locale, false)), `${locale}: the default municipal day`);
  }
});

test("Barcelona's publication dates are festive.ts's, and its 2026 parade is always labelled 2026", () => {
  assert.equal(BARCELONA_2026.url, PAST.cavalcada2026.url);
  assert.equal(BARCELONA_2026.published, PAST.cavalcada2026.route);
  assert.equal(BARCELONA_2026.date, "2026-01-05");
  for (const locale of LOCALES) {
    const b = body(locale);
    assert.ok(b.includes(dateYear(PAST.programme2025.published, locale)), `${locale}: 2025 programme date`);
    assert.ok(b.includes(dateYear(PAST.cavalcada2026.route, locale)), `${locale}: 2026 route date`);
    // The 2026 timetable is captioned with its year while 2027's is missing.
    const table = stopsTable(locale, null) as unknown as { caption: string; rows: string[][] };
    assert.match(table.caption, /2026/);
    assert.deepEqual(table.rows.map((r) => r[0]), BARCELONA_2026.stops!.map((s) => s.time));
  }
});

test("TMB's transport facts are 2026's, said to be 2026's, and no 2027 metro time is printed", () => {
  assert.match(TRANSPORT_2026.url, /^https:\/\/noticies\.tmb\.cat\//);
  assert.equal(TRANSPORT_2026.published, "2026-01-05");
  for (const locale of LOCALES) {
    const b = body(locale);
    assert.ok(b.includes(dateYear(TRANSPORT_2026.published, locale)), `${locale}: TMB's note is dated`);
    assert.ok(b.includes(TRANSPORT_2026.metroUntil), locale);
    assert.doesNotMatch(b, /2027[^.]*(metro|TMB)[^.]*(2:00|02:00)/i, `${locale}: a 2027 metro time`);
  }
});

/* -------------------------------------------------------------------------- */
/* The towns                                                                  */
/* -------------------------------------------------------------------------- */

test("each town is the 5 January 2026 parade from its council's own site; Terrassa is left out", () => {
  assert.deepEqual(TOWNS.map((t) => t.key), ["girona", "lleida", "tarragona", "reus", "sabadell", "mataro", "badalona", "igualada"]);
  for (const town of TOWNS) {
    const p = town.past;
    assert.equal(p.date, "2026-01-05", town.name);
    assert.match(p.time, /^([01]\d|2[0-3]):[0-5]\d$/, town.name);
    assert.ok(town.hosts.test(new URL(p.url).host), `${town.name}: ${p.url}`);
    assert.ok(town.hosts.test(new URL(town.watch).host), `${town.name}: watch ${town.watch}`);
    for (const s of p.sources) assert.ok(town.hosts.test(new URL(s.url).host) || /dogc\.gencat\.cat$/.test(new URL(s.url).host), `${town.name}: ${s.url}`);
    if (town.news2027) {
      assert.ok(town.hosts.test(new URL(town.news2027.url).host), town.name);
      assert.ok(town.news2027.published <= REIS_AS_OF, town.name);
    }
    for (const locale of LOCALES) assert.ok(body(locale).includes(town.name), `${locale}: ${town.name}`);
  }
  for (const locale of LOCALES) assert.match(body(locale), /Terrassa/, `${locale}: says why Terrassa is missing`);
  assert.ok(!TOWNS.some((t) => t.key === ("terrassa" as never)));
});

test("Igualada's declaration is the DOGC's Acord GOV/166/2016 and the page names it", () => {
  assert.match(IGUALADA_DECLARATION.url, /^https:\/\/dogc\.gencat\.cat\//);
  assert.equal(weekdayIndex(IGUALADA_DECLARATION.published), 4);
  for (const locale of LOCALES) assert.match(body(locale), /GOV\/166\/2016/, locale);
});

test("towns table: last year's facts labelled 2026, and 2027 'not published' until a slot is filled", () => {
  for (const locale of LOCALES) {
    const rows = townRows(locale, NONE);
    assert.equal(rows.length, TOWNS.length);
    for (const [i, row] of rows.entries()) {
      const town = TOWNS[i]!;
      assert.equal(row[0], town.name);
      assert.ok(!row[3]!.includes(":"), `${locale}: ${town.name} has a 2027 time without a slot`);
    }
    const filled = townRows(locale, { barcelona: null, towns: { ...EMPTY_TOWNS, girona: GIRONA_2027 } });
    assert.ok(filled[0]![3]!.includes(GIRONA_2027.time), `${locale}: Girona's 2027 time`);
    assert.ok(townsIntro(locale, { barcelona: null, towns: { ...EMPTY_TOWNS, girona: GIRONA_2027 } }).includes("Girona"));
    const built = buildReisBody(locale, { barcelona: null, towns: { ...EMPTY_TOWNS, girona: GIRONA_2027 } });
    assert.ok(JSON.stringify(built).includes(`](${GIRONA_2027.url})`), `${locale}: Girona's 2027 source is linked`);
    assert.ok(text(built).includes(dayDate(GIRONA_2027.date, locale)), `${locale}: Girona's 2027 day`);
  }
});

/* -------------------------------------------------------------------------- */
/* The slots                                                                  */
/* -------------------------------------------------------------------------- */

test("while Barcelona has not published, the page says so and gives 2026's times with their year", () => {
  if (ANNOUNCED_2027.barcelona) return;
  const pending: Record<Locale, RegExp> = { ca: /encara no/i, es: /aún no/i, en: /not (been )?(published|announced) yet|has not published/i };
  for (const locale of LOCALES) {
    const leadText = reisLead(locale, null);
    assert.match(leadText, pending[locale]);
    assert.match(leadText, /2026/);
    for (const t of [BARCELONA_2026.time, BARCELONA_2026.arrival!.time!, BARCELONA_2026.endTime!]) assert.ok(leadText.includes(t), `${locale}: ${t} from the 2026 data`);
    const keyFacts = REIS.editions[locale].blocks.find((b) => b.type === "keyFacts") as { items: { value: string }[] };
    assert.ok(keyFacts.items.some((i) => pending[locale].test(i.value)), `${locale}: the start time says "not announced"`);
  }
});

test("filling ANNOUNCED_2027.barcelona switches the title, description, lead, key facts, timetable and FAQ by itself", () => {
  for (const locale of LOCALES) {
    for (const slot of [BCN_2027, BCN_PROGRAMME]) {
      const announced: Announced2027 = { barcelona: slot, towns: EMPTY_TOWNS };
      assert.notEqual(reisSeoTitle(locale, slot), reisSeoTitle(locale, null));
      assert.notEqual(reisDescription(locale, slot), reisDescription(locale, null));
      const leadText = reisLead(locale, slot);
      assert.ok(leadText.includes(slot.time), `${locale}: lead time`);
      assert.ok(leadText.includes(dayDate(slot.date, locale)), `${locale}: lead day`);
      assert.ok(leadText.includes(slot.url), `${locale}: lead source`);
      assert.doesNotMatch(leadText, /encara no n'ha publicat l'horari|aún no ha publicado el horario|has not published the times/, `${locale}: still pending`);
      const blocks = buildReisBody(locale, announced);
      const keyFacts = blocks.find((b) => b.type === "keyFacts") as { items: { value: string }[] };
      assert.ok(keyFacts.items.some((i) => i.value === slot.time), `${locale}: key fact time`);
      const faq = blocks.find((b) => b.type === "faq") as { items: { answer: string }[] };
      assert.ok(faq.items[0]!.answer.includes(slot.time), `${locale}: FAQ time`);
    }
    // The timetable moves to 2027 only when 2027's stops are published.
    const t2027 = stopsTable(locale, BCN_2027) as unknown as { caption: string; rows: string[][] };
    assert.match(t2027.caption, /2027/);
    assert.deepEqual(t2027.rows.map((r) => r[0]), BCN_2027.stops!.map((s) => s.time));
    const tProgramme = stopsTable(locale, BCN_PROGRAMME) as unknown as { caption: string };
    assert.match(tProgramme.caption, /2026/);
  }
});

test("paradeProblems accepts a council's own 2027 page and refuses typos, last year's date and other hosts", () => {
  const bcnHosts = BARCELONA_HOSTS;
  assert.ok(bcnHosts.test("ajuntament.barcelona.cat") && bcnHosts.test("www.barcelona.cat") && !bcnHosts.test("barcelona.cat.example.com"));
  assert.deepEqual(paradeProblems(BCN_2027, bcnHosts), []);
  assert.deepEqual(paradeProblems(BCN_PROGRAMME, bcnHosts), []);
  assert.deepEqual(paradeProblems(GIRONA_2027, TOWNS[0]!.hosts), []);
  const bad = (patch: Partial<Parade>) => paradeProblems({ ...BCN_2027, ...patch }, bcnHosts);
  assert.ok(bad({ date: "2026-01-05" }).length, "last year's date");
  assert.ok(bad({ date: "2027-02-30" }).length, "impossible date");
  assert.ok(bad({ date: "2027-01-07" }).length, "after Reis");
  assert.ok(bad({ time: "6 pm" }).length, "time format");
  assert.ok(bad({ arrival: { time: "4:30", place: "Portal de la Pau" } }).length, "arrival time format");
  assert.ok(bad({ url: "https://www.lavanguardia.com/local/barcelona/cavalcada.html" }).length, "press");
  assert.ok(bad({ url: "https://www.escapadaambnens.com/cavalcada-reis-barcelona-2027" }).length, "aggregator");
  assert.ok(bad({ url: "http://ajuntament.barcelona.cat/premsa/x/" }).length, "http");
  assert.ok(bad({ url: "https://ajuntament.barcelona.cat/premsa/x/?utm_source=x" }).length, "tracking");
  assert.ok(bad({ stops: [{ time: "19:00", place: "A" }, { time: "18:00", place: "B" }] }).length, "stops out of order");
  assert.ok(bad({ read: "2026-01-02" }).length, "read before the page existed");
  assert.ok(paradeProblems(GIRONA_2027, bcnHosts).length, "Girona's page is not Barcelona's");
  assert.equal(SEASON_2027.to, REIS_DAY);
});

test("every filled slot is publishable, REIS_AS_OF has moved to its read date, and festive.ts says the same for Barcelona", () => {
  const bcnHosts = BARCELONA_HOSTS;
  const filled: { name: string; slot: Parade; hosts: RegExp }[] = [];
  if (ANNOUNCED_2027.barcelona) filled.push({ name: "Barcelona", slot: ANNOUNCED_2027.barcelona, hosts: bcnHosts });
  for (const town of TOWNS) {
    const slot = ANNOUNCED_2027.towns[town.key];
    if (slot) filled.push({ name: town.name, slot, hosts: town.hosts });
  }
  for (const { name, slot, hosts } of filled) {
    assert.deepEqual(paradeProblems(slot, hosts), [], name);
    assert.ok(REIS_AS_OF >= slot.read, `${name} was read on ${slot.read}: move REIS_AS_OF (${REIS_AS_OF}) to at least that day`);
  }
  // The other Christmas pages read festive.ts's cavalcada: the two must agree.
  const bcn = ANNOUNCED_2027.barcelona;
  const fest = ANNOUNCED_2026.cavalcada;
  if (bcn || fest) {
    assert.ok(bcn && fest, "fill both ANNOUNCED_2027.barcelona (reis.ts) and ANNOUNCED_2026.cavalcada (festive.ts)");
    assert.equal(fest.date, bcn.date);
    assert.equal(fest.time, bcn.time);
    assert.equal(fest.url, bcn.url);
  }
});

test("staleness: the page is stale only after Reis while Barcelona's slot is empty", () => {
  assert.equal(isStale("2026-12-31", null), false);
  assert.equal(isStale("2027-01-05", null), false);
  assert.equal(isStale(REIS_DAY, null), false);
  assert.equal(isStale("2027-01-07", null), true);
  assert.equal(isStale("2027-01-07", BCN_2027), false);
});

test("the Barcelona 2027 slot is filled after the parade (fill ANNOUNCED_2027.barcelona, move REIS_AS_OF, publish ?only=reis-2027)", () => {
  const today = madridDate(new Date());
  assert.ok(REIS_AS_OF <= today, `REIS_AS_OF (${REIS_AS_OF}) is in the future`);
  assert.equal(
    isStale(today),
    false,
    `On ${today} the 5 January 2027 parade is over but ANNOUNCED_2027.barcelona is still null. Fill it in src/lib/content/batch02/reis.ts from the City Council's page (${REIS_WATCH.barcelonaPage}), fill festive.ts ANNOUNCED_2026.cavalcada to match, move REIS_AS_OF, and publish ?only=reis-2027.`,
  );
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
    ca: { desembre: "12", gener: "01" },
    es: { diciembre: "12", enero: "01" },
    en: { december: "12", january: "01" },
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const filled = text(buildReisBody(locale, { barcelona: BCN_2027, towns: { ...EMPTY_TOWNS, girona: GIRONA_2027 } }));
    for (const b of [body(locale).toLowerCase(), filled.toLowerCase()]) {
      const pattern = new RegExp(
        `\\b(${weekdays[locale].join("|")}),? (\\d{1,2})(?![\\d:])(?: de | d'| )(${Object.keys(months[locale]).join("|")})(?:,? (?:de |del )?(\\d{4}))?`,
        "gu",
      );
      for (const match of b.matchAll(pattern)) {
        const month = months[locale][match[3]!]!;
        const year = match[4] ?? (month === "01" ? "2027" : "2026");
        const iso = `${year}-${month}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 40, `only ${checked} weekday mentions checked`);
});

test("the server HTML does not depend on the clock: no clock read, same body on any day", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/reis.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia\(/, "the module reads the clock");
  const stored = Object.fromEntries(LOCALES.map((l) => [l, JSON.stringify(REIS.editions[l].blocks)]));
  for (const now of ["2026-12-24T23:30:00Z", "2027-01-05T17:00:00Z", "2027-06-01T10:00:00Z", "2025-01-01T00:00:00Z"]) {
    mock.timers.enable({ apis: ["Date"], now: Date.parse(now) });
    try {
      for (const locale of LOCALES) {
        assert.equal(JSON.stringify(buildReisBody(locale)), stored[locale], `${locale} at ${now}`);
        assert.equal(reisSeoTitle(locale), REIS.editions[locale].seoTitle, `${locale} title at ${now}`);
      }
    } finally {
      mock.timers.reset();
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Links into the page and the publish route                                  */
/* -------------------------------------------------------------------------- */

test("Christmas in Barcelona, New Year's Eve, Christmas traditions and Barcelona in December each link here exactly once", () => {
  for (const locale of LOCALES) {
    const here = `](/${locale}/${B2_PATHS.reis[locale]}/)`;
    for (const article of [CHRISTMAS_BARCELONA, NEW_YEAR, CHRISTMAS_TRADITIONS, BARCELONA_DECEMBER]) {
      const count = JSON.stringify(article.editions[locale].blocks).split(here).length - 1;
      assert.equal(count, 1, `${article.key}/${locale} -> reis: ${count} links`);
    }
  }
});

test("the publish route has the page's group and the links group, after the last batch02 group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ REIS \} from "@\/lib\/content\/batch02\/reis";/);
  assert.match(route, /wants\("reis-2027"\)\) published\.push\(await publishB2Article\(REIS\)\)/);
  const links = route.slice(route.indexOf('wants("reis-2027-links")'));
  for (const article of ["CHRISTMAS_BARCELONA", "NEW_YEAR", "CHRISTMAS_TRADITIONS", "BARCELONA_DECEMBER"]) assert.match(links.slice(0, 400), new RegExp(`publishB2Article\\(${article}\\)`), article);
  assert.ok(route.indexOf('wants("reis-2027")') > route.indexOf('wants("batch02-c")'), "after the last batch02 group");
});
