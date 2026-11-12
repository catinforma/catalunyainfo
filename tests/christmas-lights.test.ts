import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS, SANTA_LLUCIA_2026 } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA, christmasBarcelonaDescription, christmasBarcelonaTitle } from "../src/lib/content/batch02/christmas-barcelona.ts";
import {
  CHRISTMAS_LIGHTS,
  CHRISTMAS_LIGHTS_AS_OF,
  CHRISTMAS_LIGHTS_META,
  buildChristmasLightsBody,
  lightsDescription,
  lightsSources,
  lightsTitle,
  townRows,
} from "../src/lib/content/batch02/christmas-lights.ts";
import {
  LIGHTS_TOWNS,
  LIGHTS_TOWNS_AS_OF,
  SEASONS,
  announcedTowns,
  switchOnProblems,
  type LightsTown,
} from "../src/lib/content/batch02/christmas-lights-towns.ts";
import {
  ANNOUNCED_2026,
  LIGHTS_PLAN_2026,
  LIGHTS_SWITCH_ON_CHECKED,
  MOBILITY_2025,
  PAST,
  SWITCH_ON_HISTORY,
  dayDate,
  dayList,
  lightingHours2025,
  type Announcements,
} from "../src/lib/content/batch02/festive.ts";
import { B2_PATHS, B2_TITLES, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { shortDate, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";

/**
 * Christmas lights switch-on 2026 (4 Nov 2026): Barcelona from festive.ts,
 * 25 towns from christmas-lights-towns.ts, each row from its council's own
 * page.
 *
 * What it must never do: print a 2026 date nobody official published, show
 * a 2025 date without its year, cite a press cutting for a town, copy a
 * Barcelona fact instead of reading festive.ts, or touch the titles of the
 * two pages that link to it (they are inside the 3 Nov measurement window).
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(CHRISTMAS_LIGHTS.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks);
const ROOT = new URL("..", import.meta.url);
const NONE: Announcements = { lightsSwitchOn: null, pessebre: null, santJaume: null, newYearShow: null, cavalcada: null };
/** A plausible announcement (never real data), to see the page switch. */
const GOOD: Announcements = {
  ...NONE,
  lightsSwitchOn: {
    date: "2026-11-21",
    time: "18:00",
    place: { ca: "el passeig de Gràcia", es: "el paseo de Gràcia", en: "Passeig de Gràcia" },
    who: { ca: "l'alcalde", es: "el alcalde", en: "the mayor" },
    until: "2027-01-06",
    hours: { ca: "de 17:30 a 1:00", es: "de 17:30 a 1:00", en: "17:30 to 1:00" },
    url: "https://ajuntament.barcelona.cat/premsa/2026/11/10/llums/",
  },
};

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)), ...christmasFairsPaths().map((p) => p.path)]);

/** The 25 towns the brief asked for. */
const TOWNS = [
  "Badalona", "Blanes", "Castelldefels", "Cornellà de Llobregat", "El Prat de Llobregat", "Figueres", "Girona", "Granollers", "Igualada",
  "L'Hospitalet de Llobregat", "Lleida", "Manresa", "Mataró", "Olot", "Reus", "Rubí", "Sabadell", "Sant Cugat del Vallès",
  "Santa Coloma de Gramenet", "Sitges", "Tarragona", "Terrassa", "Tortosa", "Vic", "Vilanova i la Geltrú",
];

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths, with and without Barcelona's date", () => {
  const expected: Record<Locale, string> = { ca: "guies/encesa-llums-nadal-barcelona", es: "guias/encendido-luces-navidad-barcelona", en: "guides/barcelona-christmas-lights" };
  for (const locale of LOCALES) {
    const edition = CHRISTMAS_LIGHTS.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1200, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.christmasLights[locale]);
    assert.equal(edition.path, CHRISTMAS_LIGHTS_META[locale].path);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(bodySchema.safeParse(buildChristmasLightsBody(locale, GOOD)).success, `${locale}: announced body`);
  }
  assert.equal(CHRISTMAS_LIGHTS.key, "christmasLights");
  assert.ok(B2_TITLES.christmasLights, "a related-rail title");
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.christmasLights[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
    assert.ok(!christmasFairsPaths().some((p) => p.path === `/${locale}/${path}/`), path);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.christmasLights[locale]), locale);
});

test("titles fit in 60 and descriptions in 155, Barcelona and the searched words first, before and after the announcement", () => {
  const words: Record<Locale, RegExp> = {
    ca: /^Encesa de llums de Nadal 2026 a Barcelona/,
    es: /^Encendido (de )?luces (de )?Navidad 2026 (en )?Barcelona/,
    en: /^Barcelona Christmas lights switch-on 2026/,
  };
  const answer: Record<Locale, RegExp> = {
    ca: /^L'encesa de llums de Barcelona 2026 encara no té data \(2025: 22 de novembre, 18:00, passeig de Gràcia\)\./,
    es: /^El encendido de luces de Barcelona 2026 aún no tiene fecha \(2025: 22 de noviembre, 18:00, paseo de Gràcia\)\./,
    en: /^Barcelona's 2026 lights switch-on has no date yet \(2025: 22 November, 18:00, Passeig de Gràcia\)\./,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = CHRISTMAS_LIGHTS.editions[locale];
    for (const facts of [NONE, GOOD]) {
      const t = lightsTitle(locale, facts);
      const d = lightsDescription(locale, facts);
      assert.ok(t.length > 30 && t.length <= 60, `${locale} title ${t.length}: ${t}`);
      assert.ok(d.length > 90 && d.length <= 155, `${locale} description ${d.length}: ${d}`);
      assert.match(t, words[locale]);
    }
    assert.equal(seoTitle, lightsTitle(locale, ANNOUNCED_2026));
    assert.equal(seoDescription, lightsDescription(locale, ANNOUNCED_2026));
    if (!ANNOUNCED_2026.lightsSwitchOn) assert.match(seoDescription, answer[locale]);
    // Announced: the day goes into the title and the weekday into the snippet.
    assert.ok(lightsTitle(locale, GOOD).includes(shortDate("2026-11-21", locale)), `${locale}: the date in the title`);
    assert.ok(lightsDescription(locale, GOOD).includes(dayDate("2026-11-21", locale)), `${locale}: the date in the description`);
    assert.ok(title.length > seoTitle.length, `${locale}: the H1 says more than the title`);
    assert.ok(excerpt.length <= 200);
  }
});

test("the page is honest about the towns: 'dates' in the title only when a town has one, and the snippet names them", () => {
  const empty = LIGHTS_TOWNS.map((t) => ({ ...t, y2026: null }));
  assert.doesNotMatch(lightsTitle("ca", NONE, empty), /dates/);
  assert.doesNotMatch(lightsTitle("es", NONE, empty), /fechas/);
  assert.match(lightsDescription("ca", NONE, empty), /Girona/);
  const dated = announcedTowns();
  if (dated.length) {
    assert.match(lightsTitle("ca", NONE), /: dates$/);
    assert.ok(lightsDescription("ca", NONE).includes(dated[0]!.name), "the first dated town in the snippet");
  }
});

/* -------------------------------------------------------------------------- */
/* Barcelona: read from festive.ts                                            */
/* -------------------------------------------------------------------------- */

test("with no 2026 date, the lead says so with the check date and gives 2025 and 2024 with their years", () => {
  // 12 Nov 2026: the City Council's note of 9 Nov was read; the check date moved with it.
  const checked: Record<Locale, string> = { ca: "comprovat el 12 de novembre de 2026", es: "comprobado el 12 de noviembre de 2026", en: "checked on 12 November 2026" };
  assert.equal(LIGHTS_SWITCH_ON_CHECKED, "2026-11-12");
  for (const locale of LOCALES) {
    const first = (buildChristmasLightsBody(locale, NONE)[0] as { text: string }).text;
    assert.ok(first.includes(checked[locale]), `${locale}: ${first}`);
    assert.ok(first.includes(dayDate(PAST.lights2025.switchOn, locale)), `${locale}: 2025's day with its year`);
    assert.ok(first.includes(dayDate(PAST.lights2024.switchOn, locale)), `${locale}: 2024's day with its year`);
    assert.match(first, /18:00/);
  }
});

test("an announced date replaces the 'not announced' lead, the key facts and the Barcelona row", () => {
  const notYet: Record<Locale, RegExp> = { ca: /encara no ha anunciat/, es: /aún no ha anunciado/, en: /has not announced/ };
  for (const locale of LOCALES) {
    const blocks = buildChristmasLightsBody(locale, GOOD);
    const first = (blocks[0] as { text: string }).text;
    assert.doesNotMatch(first.split(".")[0]!, notYet[locale], locale);
    assert.ok(first.includes(dayDate("2026-11-21", locale)), `${locale}: ${first}`);
    assert.ok(first.includes(GOOD.lightsSwitchOn!.url), `${locale}: links the announcement`);
    const facts = JSON.stringify(blocks[1]);
    assert.ok(facts.includes("18:00") && facts.includes(GOOD.lightsSwitchOn!.who![locale]) && facts.includes(GOOD.lightsSwitchOn!.hours![locale]), locale);
    const row = townRows(locale, LIGHTS_TOWNS, GOOD)[0]!;
    assert.equal(row[0], "Barcelona");
    assert.match(row[1]!, /^\*\*.*2026/, `${locale}: ${row[1]}`);
    assert.ok(row[3]!.includes(GOOD.lightsSwitchOn!.url), locale);
  }
  assert.equal(weekdayIndex("2026-11-21"), 6);
});

test("Barcelona's facts are festive.ts's: history, plan, hours, mobility, every URL a source", () => {
  const sources = new Set(CHRISTMAS_LIGHTS.sources.map((s) => s.url));
  for (const url of [PAST.lights2025.url, PAST.lights2024.url, LIGHTS_PLAN_2026.url, MOBILITY_2025.url, ...SWITCH_ON_HISTORY.flatMap((s) => [s.callUrl, s.reportUrl])]) {
    assert.ok(sources.has(url), `${url} is a source`);
  }
  for (const locale of LOCALES) {
    const b = body(locale);
    // The history table capitalises the day ("Dissabte 22 de novembre de 2025").
    for (const s of SWITCH_ON_HISTORY) assert.ok(b.toLowerCase().includes(dayDate(s.date, locale).toLowerCase()), `${locale}: ${s.date}`);
    assert.ok(b.includes(`${LIGHTS_PLAN_2026.km}`) && b.includes(`${PAST.lights2025.km} km`), locale);
    // The 2025 hours until 2026's are announced; then 2026's, as the note gives them.
    const hours = ANNOUNCED_2026.lightsSwitchOn?.hours?.[locale] ?? lightingHours2025(locale);
    assert.ok(b.includes(hours), `${locale}: the lighting hours`);
  }
});

test("the 2025 nightly hours read like the City Council's note of 16 Oct 2025", () => {
  assert.deepEqual(PAST.lights2025.hours, { on: "17:30", offSundayToThursday: "1:00", offFridaySaturday: "2:00", lateDays: ["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-05"] });
  assert.equal(lightingHours2025("ca"), "de les 17:30 a la 1:00 de diumenge a dijous, i de les 17:30 a les 2:00 els divendres, els dissabtes i els dies 24, 25 i 31 de desembre i 5 de gener");
  assert.equal(dayList(["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-05"], "en"), "24, 25 and 31 December and 5 January");
  assert.equal(dayList(["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-05"], "es"), "24, 25 y 31 de diciembre y 5 de enero");
});

/* -------------------------------------------------------------------------- */
/* Towns                                                                      */
/* -------------------------------------------------------------------------- */

test("the 25 towns the brief named, once each, every filled slot official and well formed", () => {
  assert.deepEqual([...LIGHTS_TOWNS].map((t) => t.name).sort((a, b) => a.localeCompare(b, "ca")), [...TOWNS].sort((a, b) => a.localeCompare(b, "ca")));
  assert.equal(new Set(LIGHTS_TOWNS.map((t) => t.key)).size, LIGHTS_TOWNS.length);
  for (const town of LIGHTS_TOWNS) {
    assert.deepEqual(switchOnProblems(town, 2026), [], town.name);
    assert.deepEqual(switchOnProblems(town, 2025), [], town.name);
    assert.deepEqual(switchOnProblems(town, 2024), [], town.name);
    assert.match(town.watch, /^https:\/\//, town.name);
    assert.ok(town.hosts.test(new URL(town.watch).host), `${town.name}: the watch page is the council's`);
    for (const slot of [town.y2026, town.y2025, town.y2024]) {
      if (!slot) continue;
      assert.doesNotMatch(slot.url, /aerobusbcn|facebook|instagram|twitter|x\.com|escapadaambnens/i, slot.url);
      assert.ok(slot.read <= LIGHTS_TOWNS_AS_OF, `${town.name}: read after AS_OF`);
    }
  }
  // Almost every town has an official date of some year; the gaps are few and known (Vic, Rubí on 4 Nov 2026).
  const undated = LIGHTS_TOWNS.filter((t) => !t.y2026 && !t.y2025 && !t.y2024).map((t) => t.name);
  assert.ok(undated.length <= 3, `too many towns with no official date: ${undated.join(", ")}`);
  assert.ok(LIGHTS_TOWNS.filter((t) => t.y2026 || t.y2025).length >= 21);
});

test("4 Nov 2026: no council had published 2026; the 2025 dates the councils gave", () => {
  // The facts read that day (research_notes/llums-nadal-2026.md). A later re-read moves AS_OF and may fill y2026.
  if ((LIGHTS_TOWNS_AS_OF as string) !== "2026-11-04") return;
  assert.equal(announcedTowns().length, 0);
  const y25 = Object.fromEntries(LIGHTS_TOWNS.filter((t) => t.y2025).map((t) => [t.key, `${t.y2025!.date} ${t.y2025!.time ?? "-"}`]));
  assert.deepEqual(y25, {
    girona: "2025-11-28 18:00", figueres: "2025-11-28 18:00", olot: "2025-11-28 19:30", blanes: "2025-11-28 18:00",
    terrassa: "2025-11-29 18:00", sabadell: "2025-11-28 18:00", granollers: "2025-12-01 18:00",
    tarragona: "2025-11-28 18:30", reus: "2025-11-27 18:45", tortosa: "2025-11-28 18:15", lleida: "2025-11-28 -", sitges: "2025-11-28 17:30",
    badalona: "2025-11-21 18:00", hospitalet: "2025-11-27 18:00", "santa-coloma": "2025-11-28 -", cornella: "2025-11-29 18:30", "el-prat": "2025-11-20 18:30",
    mataro: "2025-11-28 19:00", manresa: "2025-11-28 -", igualada: "2025-11-28 -", vilanova: "2025-11-28 -", castelldefels: "2025-11-22 -",
  });
  assert.equal(LIGHTS_TOWNS.find((t) => t.key === "sant-cugat")?.y2024?.date, "2024-11-29");
  // Weekdays the councils printed: Thursday 27 (Reus, L'Hospitalet), Saturday 29 (Terrassa, Cornellà), Monday 1 December (Granollers).
  assert.equal(weekdayIndex("2025-11-27"), 4);
  assert.equal(weekdayIndex("2025-11-29"), 6);
  assert.equal(weekdayIndex("2025-12-01"), 1);
  assert.equal(weekdayIndex("2024-11-29"), 5);
});

test("the town validator refuses a press cutting, a typo, last year's date as this year's and a stale read", () => {
  const town: LightsTown = { key: "x", name: "X", hosts: /(^|\.)x\.cat$/, watch: "https://www.x.cat/noticies", y2026: null, y2025: null };
  const ok = { date: "2026-11-27", time: "18:00", url: "https://www.x.cat/noticies/llums", read: LIGHTS_TOWNS_AS_OF };
  assert.deepEqual(switchOnProblems({ ...town, y2026: ok }, 2026), []);
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, url: "https://www.elperiodico.com/llums" } }, 2026).length > 0, "a newspaper");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, date: "2026-11-31" } }, 2026).length > 0, "impossible date");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, date: "2025-11-28" } }, 2026).length > 0, "2025's date in the 2026 slot");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, time: "18.00" } }, 2026).length > 0, "time format");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, url: "http://www.x.cat/a" } }, 2026).length > 0, "not https");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, url: "https://www.x.cat/a?utm_source=x" } }, 2026).length > 0, "tracking");
  assert.ok(switchOnProblems({ ...town, y2026: { ...ok, read: "2099-01-01" } }, 2026).length > 0, "read in the future of AS_OF");
  assert.deepEqual(SEASONS[2026], { from: "2026-11-01", to: "2026-12-24" });
});

test("the town table: Barcelona first, then every town; 2025 dates carry their year, 2026 cells a 2026 date or 'to be confirmed'", () => {
  const pending: Record<Locale, string> = { ca: "Per confirmar", es: "Por confirmar", en: "To be confirmed" };
  for (const locale of LOCALES) {
    const rows = townRows(locale);
    assert.equal(rows.length, LIGHTS_TOWNS.length + 1);
    assert.equal(rows[0]![0], "Barcelona");
    const has = (cell: string, iso: string) => cell.toLowerCase().includes(dayDate(iso, locale).toLowerCase());
    for (const [name, y26, y25, source] of rows) {
      const town = LIGHTS_TOWNS.find((t) => t.name === name);
      const slot26 = name === "Barcelona" ? ANNOUNCED_2026.lightsSwitchOn : town?.y2026;
      if (slot26) assert.ok(has(y26!, slot26.date), `${locale} ${name}: ${y26}`);
      else assert.equal(y26, pending[locale], `${locale} ${name}`);
      const slot25 = name === "Barcelona" ? { date: PAST.lights2025.switchOn } : town?.y2025;
      if (slot25) {
        assert.ok(has(y25!, slot25.date), `${locale} ${name}: ${y25}`);
        assert.match(y25!, /2025/, `${locale} ${name}`);
        assert.doesNotMatch(y25!, /2026/, `${locale} ${name}`);
      } else if (town?.y2024) {
        assert.ok(y25!.includes(`2024: ${dayDate(town.y2024.date, locale).replace(/^./, (c) => c.toUpperCase())}`), `${locale} ${name}: ${y25}`);
        assert.doesNotMatch(y25!, /2025|2026/, `${locale} ${name}`);
      }
      if (slot26 || slot25 || town?.y2024) assert.ok(source!.includes("](https://"), `${locale} ${name}: a source link`);
      else assert.equal(source, "—", `${locale} ${name}`);
    }
  }
});

test("no 2026 date is printed that no official page gave: only the towns' own, the check date, the plan and Santa Llúcia", () => {
  const allowed = new Set<string>([
    LIGHTS_SWITCH_ON_CHECKED,
    LIGHTS_TOWNS_AS_OF,
    CHRISTMAS_LIGHTS_AS_OF,
    LIGHTS_PLAN_2026.presented,
    PAST.lights2025.until,
    SANTA_LLUCIA_2026.from,
    SANTA_LLUCIA_2026.to,
    ...(ANNOUNCED_2026.lightsSwitchOn ? [ANNOUNCED_2026.lightsSwitchOn.date] : []),
    ...LIGHTS_TOWNS.flatMap((t) => (t.y2026 ? [t.y2026.date] : [])),
  ]);
  const months: Record<Locale, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  let seen = 0;
  for (const locale of LOCALES) {
    const raw = `${body(locale)} ${CHRISTMAS_LIGHTS.editions[locale].seoTitle} ${CHRISTMAS_LIGHTS.editions[locale].seoDescription}`;
    const pattern = locale === "en" ? /\b(\d{1,2}) ([A-Z][a-z]+) 2026\b/g : /\b(\d{1,2}) (?:de |d')([a-zç]+) de 2026\b/g;
    for (const [whole, day, month] of raw.matchAll(pattern)) {
      const m = months[locale].indexOf(month!);
      if (m < 0) continue;
      const iso = `2026-${String(m + 1).padStart(2, "0")}-${day!.padStart(2, "0")}`;
      seen++;
      assert.ok(allowed.has(iso), `${locale}: "${whole}" is not an official 2026 date of this page`);
    }
    // Santa Llúcia's range ("del 27 de novembre al 23 de desembre de 2026") is printed whole.
    assert.ok(body(locale).includes(shortDate(SANTA_LLUCIA_2026.from, locale)), locale);
  }
  assert.ok(seen >= 6, `the guard met only ${seen} dates`);
});

test("every Barcelona or town 2024/2025 date in the prose sits in a sentence that names its year", () => {
  const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);
  const past = [
    PAST.lights2024.announced,
    PAST.lights2024.switchOn,
    PAST.lights2025.announced,
    PAST.lights2025.switchOn,
    ...LIGHTS_TOWNS.flatMap((t) => [t.y2025?.date, t.y2024?.date].filter((d): d is string => Boolean(d))),
  ];
  const official2026 = new Set([SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, ...LIGHTS_TOWNS.flatMap((t) => (t.y2026 ? [t.y2026.date] : []))].map((iso) => iso.slice(5)));
  let checked = 0;
  for (const locale of LOCALES) {
    // Prose only: the table is checked cell by cell above.
    const prose = text(CHRISTMAS_LIGHTS.editions[locale].blocks.filter((b) => b.type !== "table"));
    for (const iso of past) {
      const day = shortDate(iso, locale);
      assert.ok(!new RegExp(`\\b${day} (de )?2026`).test(prose), `${locale}: ${day} printed as 2026`);
      for (const sentence of sentences(prose).filter((s) => new RegExp(`(^|\\D)${day}(?!\\d)`).test(s))) {
        // The same day can be an official 2026 date of this page (Santa Llúcia opens on 27 November 2026,
        // Reus switched on on 27 November 2025): such a sentence prints it with 2026, which is right.
        // Or names 2026 before the list ("ja han publicat la data del 2026: ..., Terrassa (28 de novembre)").
        if (official2026.has(iso.slice(5)) && (new RegExp(`${day}[^.]*2026`).test(sentence) || new RegExp(`2026( date)?:[^.]*${day}`).test(sentence))) continue;
        checked++;
        assert.match(sentence, /2024|2025/, `${locale}: "${sentence}" gives ${day} without its year`);
      }
    }
  }
  assert.ok(checked > 20, `only ${checked} sentences checked`);
});

/* -------------------------------------------------------------------------- */
/* Sources, links, photo, FAQ                                                 */
/* -------------------------------------------------------------------------- */

test("sources are https, untracked, listed once; every town row and every external link is one; no aerobusbcn", () => {
  const urls = new Set<string>();
  for (const source of CHRISTMAS_LIGHTS.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_|aerobusbcn/i.test(source.url), source.url);
    assert.ok(!urls.has(source.url), `duplicate source ${source.url}`);
    urls.add(source.url);
  }
  for (const town of LIGHTS_TOWNS) {
    for (const slot of [town.y2026, town.y2025, town.y2024]) {
      if (!slot) continue;
      assert.ok(urls.has(slot.url), `${town.name}: ${slot.url}`);
      if (slot.alsoUrl) assert.ok(urls.has(slot.alsoUrl), `${town.name}: ${slot.alsoUrl}`);
    }
  }
  for (const locale of LOCALES) {
    assert.ok(!/aerobusbcn/i.test(json(locale)));
    for (const [, href] of json(locale).matchAll(/\]\((https?:[^)]+)\)/g)) assert.ok(urls.has(href!), `${locale}: ${href} is not a listed source`);
  }
  assert.deepEqual(lightsSources(GOOD)[0]?.url, GOOD.lightsSwitchOn!.url, "the announcement goes first once it exists");
  assert.equal(CHRISTMAS_LIGHTS.verifiedAt, CHRISTMAS_LIGHTS_AS_OF);
});

test("internal links stay in their language, end in a slash, point at a published path, and reach the markets, Christmas in Barcelona and nativity pages", () => {
  for (const locale of LOCALES) {
    for (const blocks of [CHRISTMAS_LIGHTS.editions[locale].blocks, buildChristmasLightsBody(locale, GOOD)]) {
      const raw = JSON.stringify(blocks);
      for (const [, href] of raw.matchAll(/\]\((\/[^)]*)\)/g)) {
        assert.ok(href!.startsWith(`/${locale}/`), `${locale} links to ${href}`);
        assert.ok(href!.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href!), `${locale}: ${href} is not a published path`);
      }
      assert.doesNotMatch(raw, /\*\*\[[^\]]+\]\([^)]+\)\*\*/, locale);
    }
    for (const key of ["christmas", "christmasBarcelona", "pessebres", "barcelonaDecember", "reis"] as const) {
      assert.ok(json(locale).includes(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale}: links ${key}`);
    }
  }
});

test("the Christmas in Barcelona page and the markets guide link here in the body, with their titles and descriptions untouched", () => {
  const frozen: Record<Locale, { hub: string; markets: string }> = {
    ca: { hub: "Encesa de llums de Nadal Barcelona 2026: data per confirmar", markets: "Fires i mercats de Nadal Catalunya 2026: dates, Santa Llúcia" },
    es: { hub: "Encendido luces Navidad Barcelona 2026: fecha por confirmar", markets: "Mercados navideños Cataluña 2026: fechas y Santa Llúcia" },
    en: { hub: "Barcelona Christmas lights 2026: streets, switch-on date TBC", markets: "Barcelona Christmas markets 2026: Santa Llúcia from 27 Nov" },
  };
  for (const locale of LOCALES) {
    const link = `](/${locale}/${B2_PATHS.christmasLights[locale]}/)`;
    assert.ok(JSON.stringify(CHRISTMAS_BARCELONA.editions[locale].blocks).includes(link), `hub -> lights ${locale}`);
    assert.ok(JSON.stringify(CHRISTMAS.editions[locale].blocks).includes(link), `markets -> lights ${locale}`);
    if (!ANNOUNCED_2026.lightsSwitchOn) assert.equal(CHRISTMAS_BARCELONA.editions[locale].seoTitle, frozen[locale].hub);
    assert.equal(CHRISTMAS_BARCELONA.editions[locale].seoTitle, christmasBarcelonaTitle(locale));
    assert.equal(CHRISTMAS_BARCELONA.editions[locale].seoDescription, christmasBarcelonaDescription(locale));
    assert.equal(CHRISTMAS.editions[locale].seoTitle, frozen[locale].markets);
  }
  // The names the hub's sentence gives are rows of the table.
  for (const name of ["Girona", "Tarragona", "Lleida", "Reus", "Sabadell", "Tortosa"]) assert.ok(LIGHTS_TOWNS.some((t) => t.name === name), name);
});

test("the read-next box only repeats links from the related rail; the language line sits under the key facts", () => {
  for (const locale of LOCALES) {
    const before = CHRISTMAS_LIGHTS.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    assert.equal(before.filter((b) => b.type === "languageLinks").length, 1, locale);
    assert.equal(before[2]?.type, "languageLinks", locale);
  }
});

test("no new photograph: the hero is the shops guide's CC BY-SA file with its exact alt and caption", () => {
  assert.equal(CHRISTMAS_LIGHTS.heroKey, SHOPS.heroKey);
  const image = CHRISTMAS_LIGHTS.heroKey ? IMAGE_BY_KEY.get(CHRISTMAS_LIGHTS.heroKey) : undefined;
  assert.ok(image, "the hero is in the manifest");
  assert.match(image!.license ?? "", /^(CC0|CC BY|CC BY-SA|PD|GFDL)\b/);
  assert.deepEqual(CHRISTMAS_LIGHTS.heroAlt, SHOPS.heroAlt);
  assert.deepEqual(CHRISTMAS_LIGHTS.heroCaption, SHOPS.heroCaption);
  assert.equal(CHRISTMAS_LIGHTS.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!CHRISTMAS_LIGHTS.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("an FAQ in the searchers' words, answered in plain text, including the provincial capitals", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Quan és l'encesa de llums de Nadal de Barcelona 2026?", "A quina hora s'encenen els llums de Nadal a Barcelona?", "On es fa l'encesa de llums de Barcelona?", "Qui encén els llums de Nadal de Barcelona?", "Fins quan estan encesos els llums de Nadal a Barcelona?", "Quan és l'encesa de llums de Nadal de Girona 2026?"],
    es: ["¿Cuándo es el encendido de luces de Navidad de Barcelona 2026?", "¿A qué hora se encienden las luces de Navidad en Barcelona?", "¿Dónde es el encendido de luces de Barcelona?", "¿Quién enciende las luces de Navidad de Barcelona?", "¿Hasta cuándo están encendidas las luces de Navidad en Barcelona?", "¿Cuándo es el encendido de luces de Navidad de Tarragona 2026?"],
    en: ["When are Barcelona's Christmas lights switched on in 2026?", "What time is the Barcelona Christmas lights switch-on?", "Where is the Barcelona Christmas lights switch-on?", "Who switches on Barcelona's Christmas lights?", "Until when are Barcelona's Christmas lights on?", "When is the Christmas lights switch-on in Lleida in 2026?"],
  };
  for (const locale of LOCALES) {
    for (const blocks of [CHRISTMAS_LIGHTS.editions[locale].blocks, buildChristmasLightsBody(locale, GOOD)]) {
      const block = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
      for (const question of questions[locale]) assert.ok(block.items.some((item) => item.question === question), `${locale}: ${question}`);
      for (const item of block.items) {
        assert.ok(item.answer.length > 30, `${locale}: ${item.question} has an empty answer`);
        assert.doesNotMatch(item.answer, /\]\(|\*\*/, `${locale}: ${item.question} carries markdown`);
      }
    }
  }
});

test("the publish route registers the page and its links group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ CHRISTMAS_LIGHTS \} from "@\/lib\/content\/batch02\/christmas-lights";/);
  assert.match(route, /wants\("llums-nadal"\)\) published\.push\(await publishB2Article\(CHRISTMAS_LIGHTS\)\)/);
  assert.match(route, /wants\("llums-nadal-links"\)\) published\.push\(await publishB2Article\(CHRISTMAS_BARCELONA\), await publishB2Article\(CHRISTMAS\)\)/);
});
