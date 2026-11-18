import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PAY_DATES } from "../src/lib/content/batch02/pay-dates.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALC_COPY, RA_LOCALES, TYPE_LABEL, coef, retirementEditions, retirementPath, whole, ymText } from "../src/lib/programmatic/retirement-age/copy.ts";
import { addMonths, calculate, calculateOk, fullMonths, monthsUntil, ordinaryDate, person, RETIREMENT_TYPES } from "../src/lib/programmatic/retirement-age/engine.ts";
import { DEFAULT_INPUT, delayTable, examples, headline, retirementFaq, retirementMeta, retirementSitemapEntries } from "../src/lib/programmatic/retirement-age/page.ts";
import {
  COLUMNS,
  EARLY_MAX_MONTHS,
  EARLY_MIN_CONTRIBUTION,
  INVOLUNTARY_COEFFICIENTS,
  LGSS_ANCHOR,
  OFFICIAL_TOOLS,
  PHASE_IN,
  QUOTE,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  VOLUNTARY_COEFFICIENTS,
  activeShareFor,
  coefficient,
  columnFor,
  delayBonus,
  phaseInRow,
  toMonths,
  ym,
} from "../src/lib/programmatic/retirement-age/rules.ts";

/**
 * "¿A qué edad me puedo jubilar?" (lib/programmatic/retirement-age/): LGSS
 * art. 205.1 and DT 7ª (the phase-in table cell by cell), arts. 207 and 208
 * (early retirement and their monthly coefficient tables), art. 210.2 (the
 * delay bonus) and art. 214 (active retirement); the engine on worked
 * examples; the page, its links and the day the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const AS_OF = RULES_AS_OF;

/** "35 años y 3 meses o más." / "Menos de 36 años." / "36 o más años." / "65 años y 1 mes." → months. */
function cellMonths(cell: string): number {
  const m = /(\d+)(?: o más)? años(?: y (\d+) mes(?:es)?)?/.exec(cell);
  assert.ok(m, cell);
  return Number(m[1]) * 12 + Number(m[2] ?? 0);
}

/* ------------------------------------------------------------------ rules */

test("art. 205.1.a and DT 7ª: 67, or 65 with 38 years 6 months from 2027; the table's numbers are its own cells", () => {
  assert.match(QUOTE.art205a, /sesenta y siete años de edad, o sesenta y cinco años cuando se acrediten treinta y ocho años y seis meses de cotización/);
  assert.match(QUOTE.art205count, /años y meses completos/);
  assert.match(QUOTE.art205b, /quince años, de los cuales al menos dos/);
  assert.equal(PHASE_IN.length, 15);
  assert.deepEqual(PHASE_IN.map((r) => r.year), [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]);
  for (const row of PHASE_IN) {
    assert.equal(cellMonths(row.cells[1]), toMonths(row.threshold), `${row.year} threshold`);
    assert.equal(cellMonths(row.cells[3]), toMonths(row.threshold), `${row.year} "Menos de"`);
    assert.equal(row.cells[2], "65 años.", `${row.year}`);
    assert.equal(cellMonths(row.cells[4]), toMonths(row.age), `${row.year} age`);
    assert.ok(row.cells[3].startsWith("Menos de "), `${row.year}`);
  }
  assert.equal(PHASE_IN.at(-1)!.cells[0], "A partir del año 2027");
  // 2026 and 2027, the rows the page leads with.
  assert.deepEqual([phaseInRow(2026).threshold, phaseInRow(2026).age], [ym(38, 3), ym(66, 10)]);
  assert.deepEqual([phaseInRow(2027).threshold, phaseInRow(2027).age], [ym(38, 6), ym(67)]);
  assert.deepEqual(phaseInRow(2040), phaseInRow(2027));
  // The requirements never fall from one year to the next (the engine relies on it).
  for (let i = 1; i < PHASE_IN.length; i++) {
    assert.ok(toMonths(PHASE_IN[i]!.threshold) >= toMonths(PHASE_IN[i - 1]!.threshold));
    assert.ok(toMonths(PHASE_IN[i]!.age) > toMonths(PHASE_IN[i - 1]!.age));
  }
});

test("arts. 207 and 208 (Ley 21/2021): monthly coefficients, 48 and 24 rows, four columns, as printed", () => {
  assert.match(QUOTE.perMonth, /por cada mes o fracción de mes/);
  assert.match(QUOTE.fiction, /de haber seguido cotizando/);
  assert.match(QUOTE.art207a, /inferior en cuatro años/);
  assert.match(QUOTE.art207c, /33 años/);
  assert.match(QUOTE.art208a, /inferior en dos años/);
  assert.match(QUOTE.art208b, /treinta y cinco años/);
  assert.match(QUOTE.art318d, /205; 206 y 206 bis; 208;/);
  assert.doesNotMatch(QUOTE.art318d, /207/);
  assert.deepEqual(EARLY_MAX_MONTHS, { involuntary: 48, voluntary: 24 });
  assert.deepEqual(EARLY_MIN_CONTRIBUTION, { involuntary: ym(33), voluntary: ym(35) });
  for (const [kind, rows, max] of [["involuntary", INVOLUNTARY_COEFFICIENTS, 48], ["voluntary", VOLUNTARY_COEFFICIENTS, 24]] as const) {
    assert.deepEqual(rows.map(([m]) => m), Array.from({ length: max }, (_, i) => max - i), kind);
    for (let i = 0; i < rows.length; i++) {
      const [, v] = rows[i]!;
      // A longer career never cuts more; an extra month never cuts less.
      for (let c = 1; c < 4; c++) assert.ok(v[c]! <= v[c - 1]!, `${kind} ${rows[i]![0]}`);
      if (i > 0) for (let c = 0; c < 4; c++) assert.ok(v[c]! < rows[i - 1]![1][c]!, `${kind} ${rows[i]![0]} col ${c}`);
    }
  }
  // The corners the FAQ quotes, and two rows checked by hand against the BOE.
  assert.deepEqual(INVOLUNTARY_COEFFICIENTS[0], [48, [30, 28, 26, 24]]);
  assert.deepEqual(VOLUNTARY_COEFFICIENTS[0], [24, [21, 19, 17, 13]]);
  assert.deepEqual(INVOLUNTARY_COEFFICIENTS.find(([m]) => m === 21)![1], [12.57, 12, 11.38, 10]);
  assert.deepEqual(VOLUNTARY_COEFFICIENTS.find(([m]) => m === 21)![1], [12.57, 12, 11.43, 10]);
  // Columns: under 38 y 6 m, to 41 y 6 m, to 44 y 6 m, then more.
  assert.equal(columnFor(toMonths(ym(38, 5))), "under-38-6");
  assert.equal(columnFor(toMonths(ym(38, 6))), "38-6-to-41-6");
  assert.equal(columnFor(toMonths(ym(41, 6))), "41-6-to-44-6");
  assert.equal(columnFor(toMonths(ym(44, 6))), "44-6-plus");
  assert.deepEqual(COLUMNS.length, 4);
  assert.equal(coefficient("voluntary", 24, toMonths(ym(36))), 21);
  assert.equal(coefficient("voluntary", 25, toMonths(ym(36))), null);
  assert.match(QUOTE.art210_4, /0,50 por ciento por cada trimestre/);
});

test("art. 210.2 (RDL 11/2024): 4 % per full year, 2 % for more than 6 months from the second full year; art. 214 shares", () => {
  assert.match(QUOTE.art210_2a, /4 por ciento por cada año completo cotizado/);
  assert.match(QUOTE.art210_2aHalf, /A partir del segundo año completo de demora, .* superiores a 6 meses e inferiores a un año, .* 2 por ciento adicional/);
  assert.match(QUOTE.art210_2, /período mínimo de cotización establecido en el artículo 205\.1\.b\)/);
  const bonus = Object.fromEntries([0, 6, 11, 12, 18, 19, 24, 30, 31, 36, 42, 43, 60].map((m) => [m, delayBonus(m)]));
  assert.deepEqual(bonus, { 0: 0, 6: 0, 11: 0, 12: 4, 18: 4, 19: 4, 24: 8, 30: 8, 31: 10, 36: 12, 42: 12, 43: 14, 60: 20 });
  // The Revista de la Seguridad Social's example: 2 years and 7 months of delay = 4 + 4 + 2.
  assert.equal(delayBonus(31), 10);
  assert.match(QUOTE.art214a, /45 por ciento/);
  assert.match(QUOTE.art214e, /100 por ciento/);
  assert.deepEqual([11, 12, 24, 36, 48, 60, 84].map(activeShareFor), [null, 45, 55, 65, 80, 100, 100]);
  assert.deepEqual(delayTable().find((r) => r.months === 31), { months: 31, bonus: 10, active: 55 });
});

test("sources: official hosts over https, read on the as-of day; BOE ids and article anchors", () => {
  const hosts = new Set(["www.boe.es", "www.seg-social.es", "revista.seg-social.es"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.lgss.url, /BOE-A-2015-11724$/);
  assert.match(SOURCES.lgss.ref, /11\/11\/2026/);
  assert.match(SOURCES.ley21.url, /BOE-A-2021-21652$/);
  assert.match(SOURCES.rdl11.url, /BOE-A-2024-26917$/);
  assert.match(SOURCES.rd416.url, /BOE-A-2026-11474$/);
  for (const href of Object.values(LGSS_ANCHOR)) assert.ok(href.startsWith(`${SOURCES.lgss.url}#`), href);
  assert.equal(new URL(OFFICIAL_TOOLS.simulator).host, "prestaciones.seg-social.es");
  assert.equal(new URL(OFFICIAL_TOOLS.tuss).host, "portal.seg-social.gob.es");
});

test(`date guard: re-read the LGSS, DT 7ª, arts. 207, 208, 210 and the Seguridad Social pages before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Retirement age: on 1 Jan 2027 the last row of DT 7ª (65 with 38 years 6 months, otherwise 67) starts to apply. Re-read the BOE consolidated LGSS (its 'última actualización'), DT 7ª, arts. 205, 207, 208, 210, 214, 215 and 318, the Seguridad Social requirement, early-retirement and amount pages and the Revista guides; run the scratchpad verify script (every QUOTE, both coefficient tables, the DT 7ª cells, every URL); update rules.ts and the page's words, then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("dates de fecha a fecha: the last day of the month when the day does not exist (Seguridad Social)", () => {
  assert.match(QUOTE.ssDateToDate, /el último día del mes/);
  assert.equal(addMonths("1960-08-31", 66 * 12 + 10), "2027-06-30");
  assert.equal(addMonths("1960-02-29", 67 * 12), "2027-02-28");
  assert.equal(addMonths("2026-11-18", -24), "2024-11-18");
  assert.equal(fullMonths("2026-01-31", "2026-02-28"), 1);
  assert.equal(fullMonths("2026-11-18", "2026-12-17"), 0);
  assert.equal(monthsUntil("2026-11-18", "2030-06-20"), 44);
  assert.equal(monthsUntil("2028-06-20", "2030-06-20"), 24);
});

test("ordinary age: the year the age is reached; the 65 rule with the contributions of that day", () => {
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result]));
  // 35 years now and still contributing: 38 years 7 months at 65 (2030), so 65.
  assert.equal(ex["rule-65"]!.ordinary.date, "2030-06-20");
  assert.equal(ex["rule-65"]!.ordinary.via, "65");
  assert.deepEqual(ex["rule-65"]!.at65, { date: "2030-06-20", threshold: ym(38, 6), contributed: toMonths(ym(38, 7)), met: true });
  // 30 years: 32 years 3 months at 65, so 67.
  assert.equal(ex["age-67"]!.ordinary.date, "2031-03-10");
  assert.equal(ex["age-67"]!.ordinary.via, "full");
  // Born 15 Feb 1960: 66 y 10 m on 15 Dec 2026, inside the 2026 row. Born 15 Apr 1960: it would fall in 2027, which asks for 67.
  assert.equal(ex["dec-2026"]!.ordinary.date, "2026-12-15");
  assert.deepEqual(ex["dec-2026"]!.ordinary.age, ym(66, 10));
  assert.equal(ex["apr-1960"]!.ordinary.date, "2027-04-15");
  assert.deepEqual(ex["apr-1960"]!.ordinary.age, ym(67));
  // The same 37 years: 65 if contributions go on (41 y 10 m at 65), 67 if they stop.
  assert.equal(ex.keeps!.ordinary.date, "2031-10-01");
  assert.equal(ex.stops!.ordinary.date, "2033-10-01");
  assert.equal(ex.stops!.delay.status, "none");
  // Reaching 38 y 6 m after 65 but before 67: the day it is reached.
  // Born 1 Jan 1962 with 37 y 6 m: 37 y 7 m at 65 (1 Jan 2027), 38 y 6 m twelve months after the calculation, at 65 and 10 months.
  const late = ordinaryDate("1962-01-01", { anchor: AS_OF, base: toMonths(ym(37, 6)), grows: true });
  assert.equal(late.via, "65");
  assert.equal(late.date, addMonths(AS_OF, 12));
  assert.deepEqual(late.age, ym(65, 10));
  // Already reached: from the day of the calculation.
  assert.equal(calculateOk(person("1959-01-10", 40), AS_OF).ordinary.reached, true);
});

test("early retirement: the earliest day, the months before the reference age and the coefficient of its column", () => {
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result]));
  const long = ex["long-career"]!;
  assert.equal(long.ordinary.date, "2032-09-10");
  assert.deepEqual(long.early.involuntary, { status: "ok", date: "2028-09-10", age: ym(61), now: false, reference: "2032-09-10", monthsAhead: 48, contributed: toMonths(ym(39, 9)), column: "38-6-to-41-6", coefficient: 28 });
  assert.deepEqual(long.early.voluntary, { status: "ok", date: "2030-09-10", age: ym(63), now: false, reference: "2032-09-10", monthsAhead: 24, contributed: toMonths(ym(41, 9)), column: "41-6-to-44-6", coefficient: 17 });
  // 30 years: 33 (involuntary) on 18 Nov 2029, 16 months before 67; 35 (voluntary) only after 67.
  const late = ex["age-67"]!;
  assert.equal(late.early.involuntary.status === "ok" && late.early.involuntary.date, "2029-11-18");
  assert.equal(late.early.involuntary.status === "ok" && late.early.involuntary.monthsAhead, 16);
  assert.equal(late.early.involuntary.status === "ok" && late.early.involuntary.coefficient, 7.33);
  assert.deepEqual(late.early.voluntary, { status: "none", reason: "contribution" });
  // The default: voluntary at 63 with 24 months and the first column (21 %).
  const d = calculateOk(DEFAULT_INPUT, AS_OF).early.voluntary;
  assert.equal(d.status === "ok" && d.coefficient, 21);
  // Without contributions and under the minimum, no early retirement; already at the ordinary age, none needed.
  assert.deepEqual(calculateOk(person("1966-01-01", 30, 0, false), AS_OF).early.voluntary, { status: "none", reason: "contribution" });
  assert.deepEqual(calculateOk(person("1959-01-10", 40), AS_OF).early.involuntary, { status: "none", reason: "past" });
});

test("minimum period and delay: 15 years at the ordinary age, then 4 % per year contributed", () => {
  const short = calculateOk(person("1964-01-01", 8), AS_OF);
  assert.equal(short.minimum.met, false);
  assert.equal(short.minimum.from, addMonths(AS_OF, toMonths(ym(7))));
  assert.deepEqual(short.delay.status, "none");
  const d31 = calculateOk({ ...DEFAULT_INPUT, type: "delayed", delayMonths: 31 }, AS_OF).delay;
  assert.deepEqual(d31, { status: "ok", date: "2033-01-20", age: ym(67, 7), months: 31, bonus: 10, activeShare: 55 });
});

test("invalid input: each reason, and words for it in every language", () => {
  const bad = (p: Partial<ReturnType<typeof person>>) => calculate({ ...DEFAULT_INPUT, ...p }, AS_OF);
  assert.deepEqual(bad({ birth: "1965-02-30" }), { status: "invalid", reason: "birth" });
  assert.deepEqual(bad({ birth: "2027-01-01" }), { status: "invalid", reason: "birth" });
  assert.deepEqual(bad({ birth: "1947-12-31" }), { status: "invalid", reason: "too-old" });
  assert.deepEqual(bad({ birth: "2012-01-01" }), { status: "invalid", reason: "too-young" });
  assert.deepEqual(bad({ years: Number.NaN }), { status: "invalid", reason: "years" });
  assert.deepEqual(bad({ years: 2.5 }), { status: "invalid", reason: "years" });
  assert.deepEqual(bad({ months: 12 }), { status: "invalid", reason: "months" });
  assert.deepEqual(bad({ years: 50 }), { status: "invalid", reason: "too-much" });
  assert.deepEqual(bad({ type: "delayed", delayMonths: 0 }), { status: "invalid", reason: "delay" });
  assert.equal(bad({ type: "ordinary", delayMonths: 0 }).status, "ok");
  for (const l of RA_LOCALES) {
    for (const r of Object.values(CALC_COPY[l].invalid)) assert.ok(r.trim(), l);
    for (const t of RETIREMENT_TYPES) assert.ok(TYPE_LABEL[t][l].trim(), `${t} ${l}`);
  }
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry 67, 65 and 38 years 6 months; three editions", () => {
  for (const l of RA_LOCALES) {
    const m = retirementMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length} ${m.description}`);
    assert.ok(m.description.includes(ymText(ym(67), l)) && m.description.includes(ymText(ym(38, 6), l)) && m.description.includes(whole(4, l)), l);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
    assert.ok(CALC_COPY[l].delayHalfYear.includes(whole(2, l)), l);
  }
  assert.deepEqual(retirementEditions(), { ca: "/ca/calculadores/edat-jubilacio/", es: "/es/calculadoras/edad-jubilacion/", en: "/en/calculators/spain-retirement-age/" });
  const entries = retirementSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.retirementSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: retirementEditions\(\)/);
  const work = HUB_GROUPS.find((g) => g.id === "work")!.cards.map((c) => c.key);
  assert.equal(work[work.indexOf("retirement-age") + 1], "pensions-2027");
  assert.ok(CALCULATOR_USE_IDS.includes("retirement-age"));
  assert.deepEqual(CALCULATOR_NEXT["retirement-age"], ["pensions-2027", "pay-dates"]);
  assert.equal(searchShortcuts("es", "edad de jubilación")[0]?.href, retirementPath("es"));
  assert.equal(searchShortcuts("ca", "jubilació")[0]?.href, retirementPath("ca"));
  assert.equal(searchShortcuts("en", "retirement age")[0]?.href, retirementPath("en"));
});

test("page: one static route per language, a 404 in the others, the tables, examples and YMYL pieces in the HTML", () => {
  const routes = { es: "calculadoras/edad-jubilacion", ca: "calculadores/edat-jubilacio", en: "calculators/spain-retirement-age" } as const;
  for (const l of RA_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<RetirementAgeRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/retirement-age/RetirementAgePage.tsx");
  assert.match(page, /<MoreCalculators current="retirement-age" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="retirement-age" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<RetirementAgeCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} asOf=\{RULES_AS_OF\} \/>/);
  // Server-rendered: the DT 7ª table, both coefficient tables, the delay table and the examples.
  assert.match(page, /PHASE_IN\.map/);
  assert.match(page, /coefTable\(INVOLUNTARY_COEFFICIENTS/);
  assert.match(page, /coefTable\(VOLUNTARY_COEFFICIENTS/);
  assert.match(page, /delayTable\(\)\.map/);
  assert.match(page, /examples\(\)\.map/);
  // YMYL: disclaimer with the official simulator, the rules date, FAQ schema; no amount estimate, links instead.
  assert.match(page, /OFFICIAL_TOOLS\.simulator/);
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /pensionPath\(locale\)/);
  assert.match(page, /PAY_DATES_PATH\[locale\]/);
  const calc = read("src/components/programmatic/retirement-age/RetirementAgeCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("retirement-age"/);
  // Never asks for an ID or Social Security number.
  assert.doesNotMatch(calc, /dni|nie|nss|afiliaci/i);
});

test("examples and FAQ: every figure from the engine and the rules; eight questions per language", () => {
  const es = retirementFaq("es");
  assert.deepEqual(es.map((f) => f.q).slice(0, 3), ["¿Cuál es la edad de jubilación en 2027?", "¿Y en 2026?", "¿Cuántos años hay que cotizar para jubilarse?"]);
  const h = headline();
  for (const l of RA_LOCALES) {
    const faq = retirementFaq(l);
    assert.equal(faq.length, 8, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 8, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const p of [h.y2027.age, h.y2027.threshold, h.y2026.age, h.y2026.threshold, h.voluntaryMin, h.involuntaryMin, h.minimum]) assert.ok(all.includes(ymText(p, l)), `${l}: ${ymText(p, l)}`);
    for (const c of [21, 13, 30, 24]) assert.ok(all.includes(coef(c, l)), `${l}: ${c}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
  }
  assert.equal(examples().length, 7);
  for (const { result } of examples()) assert.equal(result.asOf, RULES_AS_OF);
});

test("links both ways: the pay-dates guide and the 2027 pension page link the calculator in ca, es and en", () => {
  for (const l of RA_LOCALES) assert.ok(JSON.stringify(PAY_DATES.editions[l].blocks).includes(`](${retirementPath(l)})`), l);
  assert.match(read("src/components/programmatic/pensions-2027/PensionPage.tsx"), /calcPath\("retirement-age", locale\)/);
});
