import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { DECEMBER_BRIDGE, MONDAY_7_REGIONS, SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import {
  COLUMN_DAYS,
  DECEMBER_BRIDGE_SPAIN,
  MONDAY_7,
  MONDAY_7_WORKING,
  SPAIN_BRIDGE_EXPIRES,
  SPAIN_BRIDGE_VERIFIED,
  SPAIN_DAYS,
  SPAIN_OPTIONS,
  cell,
  columnHeader,
  holidayRows,
  isHolidayIn,
  isOffIn,
  leaveWords,
  nextDecemberRun,
  optionGroups,
  optionRows,
  runIn,
  shortName,
} from "../src/lib/content/batch02/december-bridge-spain.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { BOE_2026, BOE_2026_ROWS, REGION_WIDE_LOCAL, boeRegionsOn2026 } from "../src/lib/programmatic/holidays/boe-2026.ts";
import { BOE_2027_ROWS, REGIONS, REGION_NAME, boeRegionsOn, type BoeCode, type Region } from "../src/lib/programmatic/holidays/boe-2027.ts";
import { spainPaths } from "../src/lib/programmatic/spain-2027/paths.ts";

/**
 * The December bridge, Christmas and Reyes in every community of Spain
 * (6 Nov 2026). What it must never do: print a cell the BOE does not say,
 * type a weekday that does not match its date, link out of its language, or
 * keep answering after Reyes 2027.
 */

const ROOT = join(import.meta.dirname, "..");
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(DECEMBER_BRIDGE_SPAIN.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(DECEMBER_BRIDGE_SPAIN.editions[locale].blocks);

/** The BOE table as read on 6 Nov 2026, row by row (same layout as the 2027 fixture). */
function parseFixture(file: string, year: number): { date: string; name: string; marks: Partial<Record<Region, BoeCode>> }[] {
  const source = readFileSync(join(ROOT, "tests/fixtures/holidays", file), "utf8");
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const rows: { date: string; name: string; marks: Partial<Record<Region, BoeCode>> }[] = [];
  let month = -1;
  for (const line of source.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length !== 20) continue;
    const head = cells[0]!;
    if (months.includes(head)) {
      month = months.indexOf(head);
      continue;
    }
    const m = /^(\d{1,2}) (.+)\.$/.exec(head);
    if (!m) continue;
    const marks: Partial<Record<Region, BoeCode>> = {};
    REGIONS.forEach((r, i) => {
      const code = cells[i + 1];
      if (code) marks[r] = code as BoeCode;
    });
    rows.push({ date: `${year}-${String(month + 1).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`, name: m[2]!, marks });
  }
  return rows;
}

const FIXTURE_2026 = parseFixture("boe-a-2025-21667.txt", 2026);
const FIXTURE_2027 = parseFixture("boe-a-2026-21254.txt", 2027);
const onIn = (rows: typeof FIXTURE_2026, iso: string) => REGIONS.filter((r) => rows.some((row) => row.date === iso && row.marks[r]));

/* -------------------------------------------------------------------------- */
/* The data is the BOE's                                                      */
/* -------------------------------------------------------------------------- */

test("BOE 2026: the module is the table as read, with the codes, and the resolution is the one the page cites", () => {
  assert.equal(FIXTURE_2026.length, 36);
  assert.deepEqual(BOE_2026_ROWS.map((r) => ({ date: r.date, name: r.name, marks: r.marks })), FIXTURE_2026);
  const fixture = readFileSync(join(ROOT, "tests/fixtures/holidays/boe-a-2025-21667.txt"), "utf8");
  assert.match(fixture, /^BOE-A-2025-21667/);
  assert.match(fixture, /la fiesta del día\s26 de diciembre \(Sant Esteve\) queda sustituida por la de\s17 de junio/);
  assert.equal(BOE_2026.url, "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667");
  // Every community has twelve days in the BOE, as the resolution says; the cities differ.
  for (const r of REGIONS.filter((x) => x !== "CE" && x !== "ML" && x !== "CN")) {
    assert.equal(new Set(BOE_2026_ROWS.filter((row) => row.marks[r]).map((row) => row.date)).size, 12, r);
  }
});

test("Navarra's 3 December is in its own resolution, not in the BOE, and is a Thursday", () => {
  const navarra = readFileSync(join(ROOT, "tests/fixtures/holidays/navarra-resolucion-390-2025.txt"), "utf8");
  assert.match(navarra, /–3 de diciembre: San Francisco Javier\./);
  assert.match(navarra, /BON núm\. 129, de 30\.6\.2025/);
  assert.deepEqual(REGION_WIDE_LOCAL.map((d) => [d.region, d.date]), [["NC", "2026-12-03"]]);
  assert.equal(REGION_WIDE_LOCAL[0]!.source.url, "https://bon.navarra.es/es/anuncio/-/texto/2025/129/11");
  assert.deepEqual(boeRegionsOn2026("2026-12-03"), []);
  assert.equal(weekdayIndex("2026-12-03"), 4);
  assert.equal(isHolidayIn("NC", "2026-12-03"), true);
  assert.equal(isHolidayIn("MD", "2026-12-03"), false);
});

test("every cell of the table is what the two BOE fixtures say", () => {
  const fixtureOn = (iso: string) => (iso.startsWith("2026") ? onIn(FIXTURE_2026, iso) : onIn(FIXTURE_2027, iso));
  for (const iso of COLUMN_DAYS) {
    for (const region of REGIONS) {
      const expected = fixtureOn(iso).includes(region);
      assert.equal(isHolidayIn(region, iso), expected, `${region} ${iso}`);
      for (const locale of LOCALES) assert.equal(/^\*\*/.test(cell(region, iso, locale)), expected, `${region} ${iso} ${locale}`);
    }
  }
  // Spelled out, so a change in a fixture shows up as a diff here too.
  assert.deepEqual(MONDAY_7, ["AN", "AR", "AS", "CB", "CL", "EX", "MD", "MC", "RI", "ML"]);
  assert.deepEqual(MONDAY_7_WORKING, ["IB", "CN", "CM", "CT", "GA", "NC", "PV", "VC", "CE"]);
  for (const iso of [SPAIN_DAYS.immaculada, SPAIN_DAYS.christmas]) assert.equal(boeRegionsOn2026(iso).length, 19, iso);
  assert.deepEqual(boeRegionsOn2026(SPAIN_DAYS.stStephen), ["IB", "CT"]);
  for (const iso of [SPAIN_DAYS.newYear, SPAIN_DAYS.epiphany]) assert.equal(boeRegionsOn(iso).length, 19, iso);
  // Neither Christmas Eve, New Year's Eve nor Sunday 6 December is a row of the 2026 list.
  for (const iso of [SPAIN_DAYS.christmasEve, SPAIN_DAYS.newYearsEve, SPAIN_DAYS.constitution]) assert.deepEqual(boeRegionsOn2026(iso), [], iso);
  // The Catalan bridge page names the same ten.
  assert.deepEqual(MONDAY_7.map((r) => REGION_NAME[r].es), MONDAY_7_REGIONS.es);
  // Aran is the only exception printed in a cell.
  assert.equal(cell("CT", SPAIN_DAYS.stStephen, "es"), "**Festivo** (en Arán, no)");
  assert.equal(cell("MD", SPAIN_DAYS.stStephen, "es"), "No festivo");
  assert.equal(cell("CT", SPAIN_DAYS.monday, "es"), "Laborable");
  assert.equal(holidayRows("es").length, 19);
});

test("the six columns are on the weekdays the headers print", () => {
  assert.deepEqual(COLUMN_DAYS.map(weekdayIndex), [1, 2, 5, 6, 5, 3]);
  assert.deepEqual(COLUMN_DAYS.map((iso) => columnHeader(iso, "es")), ["Lun. 7 dic.", "Mar. 8 dic.", "Vie. 25 dic.", "Sáb. 26 dic.", "Vie. 1 ene. 2027", "Mié. 6 ene. 2027"]);
  assert.deepEqual(COLUMN_DAYS.map((iso) => columnHeader(iso, "en")), ["Mon 7 Dec", "Tue 8 Dec", "Fri 25 Dec", "Sat 26 Dec", "Fri 1 Jan 2027", "Wed 6 Jan 2027"]);
  assert.deepEqual(COLUMN_DAYS.map((iso) => columnHeader(iso, "ca")), ["Dl. 7 des.", "Dt. 8 des.", "Dv. 25 des.", "Ds. 26 des.", "Dv. 1 gen. 2027", "Dc. 6 gen. 2027"]);
});

/* -------------------------------------------------------------------------- */
/* Bridges                                                                    */
/* -------------------------------------------------------------------------- */

test("days off and leave are computed per community, and every leave day is a working day there", () => {
  assert.deepEqual(runIn("MD", "2026-12-08"), { from: "2026-12-05", to: "2026-12-08", days: 4 });
  assert.deepEqual(runIn("CT", "2026-12-08"), { from: "2026-12-08", to: "2026-12-08", days: 1 });
  assert.deepEqual(runIn("CT", "2026-12-08", ["2026-12-07"]), { from: "2026-12-05", to: "2026-12-08", days: 4 });
  assert.deepEqual(runIn("NC", "2026-12-08", ["2026-12-04", "2026-12-07"]), { from: "2026-12-03", to: "2026-12-08", days: 6 });
  assert.deepEqual(runIn("IB", "2026-12-25"), { from: "2026-12-25", to: "2026-12-27", days: 3 });
  assert.deepEqual(runIn("GA", "2027-01-06", ["2027-01-04", "2027-01-05"]), { from: "2027-01-01", to: "2027-01-06", days: 6 });
  assert.throws(() => runIn("CT", "2026-12-07"), /not a day off/);
  for (const option of SPAIN_OPTIONS) {
    for (const group of optionGroups(option)) {
      for (const region of group.regions) for (const day of group.leave) assert.equal(isOffIn(region, day), false, `${option.id} ${region} ${day}`);
    }
  }
  const rows = optionRows("es");
  assert.deepEqual(
    rows.map((r) => [r[0], r[1], r[2]!.split(" ")[0], r[3]]),
    [
      ["Puente de diciembre", "Donde el lunes 7 es festivo", "Ninguno", "4 días"],
      ["Puente de diciembre", "Donde el lunes 7 es laborable", "1", "4 días"],
      ["Puente de diciembre en Navarra", "Navarra", "2", "6 días"],
      ["Semana del puente", "Donde el lunes 7 es festivo", "3", "9 días"],
      ["Semana del puente", "Donde el lunes 7 es laborable", "4", "9 días"],
      ["Navidad", "Toda España", "Ninguno", "3 días"],
      ["Semana de Navidad", "Toda España", "4", "9 días"],
      ["Año Nuevo", "Toda España", "Ninguno", "3 días"],
      ["De Navidad a Año Nuevo", "Toda España", "4", "10 días"],
      ["Puente de Reyes", "Toda España", "2", "6 días"],
      ["Reyes hasta el fin de semana", "Toda España", "2", "5 días"],
      ["Las fiestas enteras", "Toda España", "10", "19 días"],
    ],
  );
  assert.equal(leaveWords(["2026-12-07", "2026-12-09", "2026-12-10", "2026-12-11"], "es"), "4 (lunes 7 y del miércoles 9 al viernes 11 de diciembre)");
  assert.equal(leaveWords(["2027-01-04", "2027-01-05"], "en"), "2 (Monday 4 and Tuesday 5 January)");
  assert.equal(leaveWords([], "ca"), "Cap");
  // December 2027: 6 and 8 December are national holidays ("*") in every column of the 2027 list.
  for (const iso of ["2027-12-06", "2027-12-08"]) assert.ok(BOE_2027_ROWS.some((r) => r.date === iso && Object.keys(r.marks).length === 19 && Object.values(r.marks).every((c) => c === "*")), iso);
  assert.deepEqual(nextDecemberRun(), { from: "2027-12-04", to: "2027-12-08", days: 5 });
});

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links                                                      */
/* -------------------------------------------------------------------------- */

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...spainPaths(),
]);

test("three valid editions on the registry paths, the Spanish one the fullest", () => {
  const minWords: Record<Locale, number> = { es: 1500, ca: 700, en: 1000 };
  for (const locale of LOCALES) {
    const edition = DECEMBER_BRIDGE_SPAIN.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > minWords[locale], `${locale} is thin: ${wordCount(body(locale))}`);
    assert.equal(edition.path, B2_PATHS.decemberBridgeSpain[locale]);
    assert.match(edition.path, /^(guias|guies|guides)\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
  assert.equal(B2_PATHS.decemberBridgeSpain.es, "guias/puente-diciembre-espana");
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].map((p) => p[locale]);
    assert.equal(all.filter((p) => p === B2_PATHS.decemberBridgeSpain[locale]).length, 1, locale);
  }
});

test("titles: the year, the day and the answer in under 60 characters; descriptions list the ten", () => {
  const title: Record<Locale, RegExp> = {
    es: /^Puente de diciembre 2026: lunes 7 festivo en 9 comunidades$/,
    ca: /^Pont de desembre 2026: dilluns 7 festiu en 9 comunitats$/,
    en: /^Is 7 December 2026 a holiday in Spain\? Yes, in 9 regions$/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title: h1 } = DECEMBER_BRIDGE_SPAIN.editions[locale];
    assert.ok(seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.match(seoTitle, title[locale]);
    assert.match(h1, /2026|7 December/);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30);
    for (const r of MONDAY_7) {
      const name = locale === "ca" && r === "RI" ? "la Rioja" : shortName(r, locale);
      assert.ok(seoDescription.includes(name), `${locale}: description misses ${name}`);
    }
    for (const r of MONDAY_7_WORKING) assert.ok(!seoDescription.includes(shortName(r, locale)), `${locale}: description names ${r}`);
  }
});

test("sources are https and official, and the reader sees the check date", () => {
  assert.equal(DECEMBER_BRIDGE_SPAIN.verifiedAt, SPAIN_BRIDGE_VERIFIED);
  assert.equal(SPAIN_BRIDGE_VERIFIED, "2026-11-06");
  const urls = DECEMBER_BRIDGE_SPAIN.sources.map((s) => s.url);
  assert.ok(urls.includes("https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667"));
  assert.ok(urls.includes("https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254"));
  for (const url of urls) {
    assert.match(url, /^https:\/\/(www\.boe\.es|bon\.navarra\.es|bomemelilla\.es|portaldogc\.gencat\.cat)\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
  }
  for (const locale of LOCALES) assert.match(body(locale), /6 (de novembre|de noviembre|November) (de )?2026/, locale);
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
  }
});

test("cross-links: the Spain page sends Catalan readers to the Catalan page (and /es/festivos/2027/), and the Catalan page links back once", () => {
  for (const locale of LOCALES) {
    const catalan = `](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`;
    assert.ok(json(locale).includes(catalan), `spain -> catalan ${locale}`);
    const spain = `](/${locale}/${B2_PATHS.decemberBridgeSpain[locale]}/)`;
    assert.equal(JSON.stringify(DECEMBER_BRIDGE.editions[locale].blocks).split(spain).length - 1, 1, `catalan -> spain ${locale}: exactly one link`);
  }
  assert.ok(json("es").includes("](/es/festivos/2027/)"), "es -> Spain 2027 hub");
  assert.ok(json("es").includes("](/es/festivos/2027/puentes/)"), "es -> Spain 2027 bridges");
  assert.match(body("es"), /En Cataluña el lunes 7 es laborable/);
  assert.match(body("ca"), /A Catalunya, no: el 7 és feiner/);
  assert.match(body("en"), /Monday the 7th is a working day in Catalonia/);
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = DECEMBER_BRIDGE_SPAIN.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("no new photograph: the hero is the Catalan bridge page's file with its exact alt and caption", () => {
  assert.equal(DECEMBER_BRIDGE_SPAIN.heroKey, DECEMBER_BRIDGE.heroKey);
  assert.ok(DECEMBER_BRIDGE_SPAIN.heroKey && IMAGE_BY_KEY.has(DECEMBER_BRIDGE_SPAIN.heroKey));
  assert.deepEqual(DECEMBER_BRIDGE_SPAIN.heroAlt, SHOPS.secondaryAlt);
  assert.deepEqual(DECEMBER_BRIDGE_SPAIN.heroCaption, SHOPS.secondaryCaption);
  assert.equal(DECEMBER_BRIDGE_SPAIN.secondaryKey, undefined);
});

/* -------------------------------------------------------------------------- */
/* What the page says                                                         */
/* -------------------------------------------------------------------------- */

test("the FAQ answers the searched questions (FAQPage), in the page's words", () => {
  const questions: Record<Locale, string[]> = {
    es: [
      "¿Es festivo el 7 de diciembre de 2026?",
      "¿El 6 de diciembre de 2026 se traslada al lunes?",
      "¿Es festivo el 8 de diciembre de 2026?",
      "¿Qué días son festivos en diciembre de 2026?",
      "¿Es festivo el 26 de diciembre de 2026?",
      "¿Es festivo el 6 de enero de 2027?",
      "¿Hay puente de Reyes en 2027?",
      "¿Cuántos días hay que pedir para el puente de diciembre?",
    ],
    ca: ["El 7 de desembre de 2026 és festiu?", "El 26 de desembre de 2026 és festiu?"],
    en: ["Is 7 December 2026 a holiday in Spain?", "Is 26 December a holiday in Spain?", "Is 6 January 2027 a holiday in Spain?"],
  };
  for (const locale of LOCALES) {
    const items = (DECEMBER_BRIDGE_SPAIN.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
    for (const q of questions[locale]) assert.ok(items.some((i) => i.question === q), `${locale}: ${q}`);
    for (const item of items) assert.ok(item.answer.length > 20, `${locale}: ${item.question}`);
  }
});

test("the lead answers: Monday 7 is a holiday in nine communities and Melilla, named, and a working day in the other nine", () => {
  const must: Record<Locale, RegExp[]> = {
    es: [/^El lunes 7 de diciembre de 2026 es festivo en nueve comunidades autónomas y Melilla/, /del sábado 5 al martes 8 de diciembre sin pedir ningún día/, /el 7 es laborable/],
    ca: [/^El dilluns 7 de desembre de 2026 és festiu en nou comunitats autònomes i Melilla/, /A Catalunya, no/],
    en: [/^Monday 7 December 2026 is a public holiday in nine regions and Melilla/, /the 7th is a working day/],
  };
  for (const locale of LOCALES) {
    const leadText = text(DECEMBER_BRIDGE_SPAIN.editions[locale].blocks.slice(0, 1));
    for (const pattern of must[locale]) assert.match(leadText, pattern, `${locale}: ${pattern}`);
    for (const r of [...MONDAY_7, ...MONDAY_7_WORKING].filter((x) => x !== "ML" && x !== "CE" && (locale === "ca" ? MONDAY_7.includes(x) : true))) {
      assert.ok(leadText.includes(REGION_NAME[r][locale]), `${locale}: lead misses ${r}`);
    }
  }
});

test("never says the 7th is a holiday everywhere, or Christmas Eve, New Year's Eve or the 26th everywhere", () => {
  const forbidden = [
    /7 de diciembre (de 2026 )?es festivo en toda España/i,
    /lunes 7 es festivo en toda España/i,
    /dilluns 7 és festiu a tot Espanya/i,
    /7 December (2026 )?is a (public )?holiday (everywhere|across|in all of) Spain/i,
    /(24|31) de diciembre (es|son) festivos? en toda/i,
    /26 de diciembre es festivo en toda/i,
    /pendiente de confirmar/i,
  ];
  for (const locale of LOCALES) for (const pattern of forbidden) assert.doesNotMatch(body(locale), pattern, `${locale}: ${pattern}`);
});

test("every weekday printed next to a day of the month matches the date (December 2026 unless January follows)", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, [RegExp, RegExp]> = {
    ca: [/desembre/, /gener/],
    es: [/diciembre/, /enero/],
    en: [/december/, /january/],
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const plain = body(locale).toLowerCase();
    const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (?:the )?(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])`, "gu");
    for (const match of plain.matchAll(pattern)) {
      const rest = plain.slice(match.index + match[0].length, match.index + match[0].length + 120).split(/[.;?]/)[0] ?? "";
      const dec = rest.search(months[locale][0]);
      const jan = rest.search(months[locale][1]);
      const month = jan >= 0 && (dec < 0 || jan < dec) ? "2027-01" : "2026-12";
      const iso = `${month}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}" read as ${iso}`);
      checked += 1;
    }
  }
  assert.ok(checked > 150, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* Publish and expiry                                                         */
/* -------------------------------------------------------------------------- */

test("publish groups: puente-diciembre-espana publishes the page, -links the Catalan page", () => {
  const route = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(route, /wants\("puente-diciembre-espana"\)\) published\.push\(await publishB2Article\(DECEMBER_BRIDGE_SPAIN\)\)/);
  assert.match(route, /wants\("puente-diciembre-espana-links"\)\) published\.push\(await publishB2Article\(DECEMBER_BRIDGE\)\)/);
});

test("as of: the page answers December 2026 to Reyes 2027 only; from 10 January 2027 retire it or rewrite it for December 2027", () => {
  assert.equal(SPAIN_BRIDGE_EXPIRES, "2027-01-09");
  const today = madridDate(new Date());
  assert.ok(SPAIN_BRIDGE_VERIFIED <= today, `SPAIN_BRIDGE_VERIFIED (${SPAIN_BRIDGE_VERIFIED}) is in the future`);
  assert.ok(
    today <= SPAIN_BRIDGE_EXPIRES,
    `On ${today} the Spain-wide December bridge page (src/lib/content/batch02/december-bridge-spain.ts) still answers December 2026 and Reyes 2027. Rewrite it for December 2027 from BOE-A-2026-21254 (the 2027 list, holidays/boe-2027.ts) and the 2028 list for January once it is in the BOE, move SPAIN_BRIDGE_VERIFIED and SPAIN_BRIDGE_EXPIRES, deploy and publish \`puente-diciembre-espana\`; or retire it.`,
  );
});
