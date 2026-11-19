import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, calcPath, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, NOTE_TEXT, PV_LOCALES, coef, deadlineText, fromDay, pvEditions, untilDay } from "../src/lib/programmatic/plusvalia/copy.ts";
import { addMonths, calculate, calculateOk, inputOf, periodHeld, tableFor, type PvNote } from "../src/lib/programmatic/plusvalia/engine.ts";
import { DEFAULT_INPUT, EXAMPLES, example, pvFaq, pvMeta, pvSitemapEntries } from "../src/lib/programmatic/plusvalia/page.ts";
import {
  BARCELONA,
  DEADLINE,
  DEVENGO_MAX,
  DEVENGO_MIN,
  MAX_BONUS,
  MAX_RATE,
  MAX_REDUCING_COEFFICIENT,
  MAX_YEARS,
  NEW_TABLE_FROM,
  QUOTE,
  RDL29_CONVALIDATED,
  REVALUATION_REDUCTION,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  TABLES,
  TABLE_WINDOWS,
} from "../src/lib/programmatic/plusvalia/rules.ts";

/**
 * The plusvalía municipal calculator (lib/programmatic/plusvalia/): every
 * figure against the quoted words of the TRLRHL and the decree-laws, the
 * coefficient tables against the BOE as printed, the engine against our hand
 * calculations, the page, the registry and the date from which the rules
 * must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
/** "0,15 0,15 0,14 …" as the BOE prints a table, into numbers. */
const boe = (s: string) => s.trim().split(/\s+/).map((x) => Number(x.replace(",", ".")));
const notes = (r: ReturnType<typeof calculateOk>): PvNote[] => r.notes;

/* ------------------------------------------------------------------ rules */

test("the limits are in the words of the law (arts. 107, 108, 110)", () => {
  assert.match(QUOTE.rate, new RegExp(`exceder del ${MAX_RATE} por ciento`));
  assert.match(QUOTE.bonus, new RegExp(`hasta el ${MAX_BONUS} por ciento de la cuota íntegra`));
  assert.match(QUOTE.bonus, /por causa de muerte a favor de los descendientes y adoptados, los cónyuges y los ascendientes y adoptantes/);
  assert.match(QUOTE.reducingCoefficient, new RegExp(`máximo del ${MAX_REDUCING_COEFFICIENT} por ciento`));
  assert.match(QUOTE.revaluationMax, new RegExp(`porcentaje máximo el ${REVALUATION_REDUCTION.maxPercent} por ciento`));
  assert.equal(MAX_YEARS, 20);
  assert.match(QUOTE.base, /periodo máximo de veinte años/);
  assert.match(QUOTE.fullYears, /años completos/);
  assert.match(QUOTE.fullYears, /se prorrateará el coeficiente anual teniendo en cuenta el número de meses completos/);
  assert.match(QUOTE.ordinanceExcess, /se aplicará este directamente/);
  assert.match(QUOTE.realGain, /se tomará como base imponible el importe de dicho incremento de valor/);
  assert.equal(DEADLINE.interVivosWorkingDays, 30);
  assert.match(QUOTE.deadlineInterVivos, /treinta días hábiles/);
  assert.equal(DEADLINE.mortisCausaMonths, 6);
  assert.equal(DEADLINE.mortisCausaMaxMonths, 12);
  assert.match(QUOTE.deadlineMortisCausa, /seis meses prorrogables hasta un año/);
  assert.match(QUOTE.optional, /podrán establecer y exigir/);
});

test("each coefficient table is the BOE's, by effective date (RDL 8/2023, 9/2024, 16/2025, 29/2026)", () => {
  // As printed in the BOE consolidated text of art. 107.4 (versions of 29-12-2023, 25-12-2024, 25-12-2025 and 8-10-2026).
  assert.deepEqual(TABLES["rdl8-2023"].values, boe("0,15 0,15 0,14 0,14 0,16 0,18 0,19 0,20 0,19 0,15 0,12 0,10 0,09 0,09 0,09 0,09 0,10 0,13 0,17 0,23 0,40"));
  assert.deepEqual(TABLES["rdl9-2024"].values, boe("0,16 0,15 0,15 0,15 0,16 0,18 0,20 0,22 0,23 0,21 0,16 0,13 0,11 0,10 0,10 0,10 0,10 0,12 0,16 0,22 0,35"));
  assert.deepEqual(TABLES["rdl16-2025"].values, TABLES["rdl9-2024"].values);
  assert.deepEqual(TABLES["rdl29-2026"].values, boe("0,17 0,16 0,16 0,17 0,17 0,19 0,21 0,23 0,24 0,25 0,22 0,18 0,14 0,12 0,11 0,11 0,11 0,11 0,13 0,20 0,30"));
  for (const t of Object.values(TABLES)) assert.equal(t.values.length, MAX_YEARS + 1, t.id);
  assert.match(QUOTE.rdl8, /Con efectos desde el día 1 de enero de 2024/);
  assert.match(QUOTE.rdl9, /Con efectos desde el día 1 de enero de 2025/);
  assert.match(QUOTE.rdl16, /Con efectos desde el día 1 de enero de 2026/);
  assert.match(QUOTE.rdl29, /Con efectos desde el 1 de diciembre de 2026/);
  assert.equal(NEW_TABLE_FROM, "2026-12-01");
  assert.match(QUOTE.rdl16Derogation, /acordó derogar el Real Decreto-ley 16\/2025/);
  assert.match(QUOTE.rdl29Convalidation, /acordó convalidar el Real Decreto-ley 29\/2026/);
  assert.equal(RDL29_CONVALIDATED, "2026-11-12");
  // The page says the new maxima rise for every period up to 16 years and fall from 17 on.
  const old = TABLES["rdl8-2023"].values;
  const neu = TABLES["rdl29-2026"].values;
  for (let i = 0; i <= 16; i++) assert.ok(neu[i]! > old[i]!, `period ${i}`);
  for (let i = 17; i <= 20; i++) assert.ok(neu[i]! < old[i]!, `period ${i}`);
});

test("the table windows run without gaps from 2024 to 2027, and the derogations bring the 2024 table back", () => {
  assert.equal(TABLE_WINDOWS[0]!.from, DEVENGO_MIN);
  assert.equal(TABLE_WINDOWS.at(-1)!.to, DEVENGO_MAX);
  for (let i = 1; i < TABLE_WINDOWS.length; i++) {
    const prev = TABLE_WINDOWS[i - 1]!;
    const next = TABLE_WINDOWS[i]!;
    const dayAfter = new Date(Date.parse(`${prev.to}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    assert.equal(next.from, dayAfter, `${prev.to} → ${next.from}`);
  }
  const at = (d: string) => tableFor(d)?.id;
  assert.equal(at("2024-06-30"), "rdl8-2023");
  assert.equal(at("2025-01-22"), "rdl9-2024");
  assert.equal(at("2025-01-23"), "rdl8-2023");
  assert.equal(at("2026-01-27"), "rdl16-2025");
  assert.equal(at("2026-01-28"), "rdl8-2023");
  assert.equal(at("2026-11-30"), "rdl8-2023");
  assert.equal(at("2026-12-01"), "rdl29-2026");
  assert.equal(at("2027-06-01"), "rdl29-2026");
  assert.equal(at("2023-12-31"), undefined);
  assert.equal(TABLES["rdl9-2024"].derogatedFrom, "2025-01-23");
  assert.equal(TABLES["rdl16-2025"].derogatedFrom, "2026-01-28");
});

test("Barcelona's ordinance 1.3: 30 %, 95 %, three years, and the 2024 maxima except 0,05 under a year", () => {
  assert.equal(QUOTE.bcnRate, `El tipus impositiu és del ${BARCELONA.rate}%.`);
  assert.match(QUOTE.bcnBonus, new RegExp(`${BARCELONA.bonus}% de bonificació en la quota`));
  assert.match(QUOTE.bcnKeep, /durant els tres anys següents/);
  assert.equal(BARCELONA.keepYears, 3);
  assert.equal(BARCELONA.coefficients[0], 0.05);
  assert.deepEqual(BARCELONA.coefficients.slice(1), TABLES["rdl8-2023"].values.slice(1));
  assert.match(QUOTE.bcnAutomatic, /seran d'aplicació automàtica/);
  assert.match(QUOTE.bcnInForce, /a partir de l’1 de gener de 2025/);
});

test("every quote and source is filled in, every source an https URL read on the rules date", () => {
  for (const [k, q] of Object.entries(QUOTE)) assert.ok(q.trim().length > 20, k);
  for (const [k, s] of Object.entries(SOURCES)) {
    assert.match(s.url, /^https:\/\//, k);
    assert.equal(s.read, RULES_AS_OF, k);
  }
});

test(`date guard: the plusvalía coefficients are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF < RULES_UNTIL);
  assert.ok(
    today() < RULES_UNTIL,
    "Plusvalía municipal: re-read art. 107.4 TRLRHL in the BOE consolidated text (BOE-A-2004-4214): did a 2027 budget law or decree-law update the maximum coefficients, and did the Congress convalidate it? Add the table and its window to rules.ts (TABLES, TABLE_WINDOWS), re-check Barcelona's ordinance 1.3 for 2027, then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("the period counts full years, and full months under a year (art. 107.4)", () => {
  assert.deepEqual(periodHeld("2012-03-10", "2026-03-09"), { years: 13, months: 0 });
  assert.deepEqual(periodHeld("2012-03-10", "2026-03-10"), { years: 14, months: 0 });
  assert.deepEqual(periodHeld("2012-03-10", "2026-11-19"), { years: 14, months: 0 });
  assert.deepEqual(periodHeld("2026-03-10", "2026-12-15"), { years: 0, months: 9 });
  assert.deepEqual(periodHeld("2026-03-10", "2026-12-09"), { years: 0, months: 8 });
  assert.deepEqual(periodHeld("2026-01-31", "2026-02-28"), { years: 0, months: 1 });
  assert.deepEqual(periodHeld("2024-02-29", "2025-02-28"), { years: 1, months: 0 });
  assert.deepEqual(periodHeld("2026-03-20", "2026-03-25"), { years: 0, months: 0 });
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
});

test("our worked cases, by hand from the quoted tables at 30 %", () => {
  // 14 years, sold 19-11-2026: RDL 8/2023 0,09 × 60.000 = 5.400 → 1.620; real (320.000 − 200.000) × 60/150 = 48.000 → 14.400.
  const nov = example("sale-14y-nov");
  assert.equal(nov.years, 14);
  assert.equal(nov.table.id, "rdl8-2023");
  assert.equal(nov.coefficient, 0.09);
  assert.equal(nov.objective.base, 5_400);
  assert.equal(nov.objective.cuotaLiquida, 1_620);
  assert.equal(nov.realGain, 48_000);
  assert.equal(nov.real?.cuotaLiquida, 14_400);
  assert.equal(nov.chosen, "objective");
  assert.equal(nov.toPay, 1_620);
  // The same flat on 15-12-2026: RDL 29/2026 0,11 → 6.600 → 1.980.
  const dec = example("sale-14y-dec");
  assert.equal(dec.table.id, "rdl29-2026");
  assert.equal(dec.coefficient, 0.11);
  assert.equal(dec.objective.base, 6_600);
  assert.equal(dec.toPay, 1_980);
  // 3 years: 0,17 × 90.000 = 15.300 → 4.590; real (265.000 − 250.000) × 0,5 = 7.500 → 2.250, the lower.
  const r = example("sale-3y-real");
  assert.equal(r.years, 3);
  assert.equal(r.objective.base, 15_300);
  assert.equal(r.objective.cuotaLiquida, 4_590);
  assert.equal(r.realGain, 7_500);
  assert.equal(r.chosen, "real");
  assert.equal(r.toPay, 2_250);
  assert.ok(notes(r).includes("real-lower"));
  // A loss: not subject (art. 104.5), nothing to pay, the transfer still to declare.
  const loss = example("sale-loss");
  assert.equal(loss.years, 19);
  assert.equal(loss.objective.base, 14_000);
  assert.equal(loss.notSubject, true);
  assert.equal(loss.chosen, "none");
  assert.equal(loss.toPay, 0);
  assert.ok(notes(loss).includes("no-gain"));
  // An inheritance after 28 years: 20+ → 0,30 × 50.000 = 15.000 → 4.500, 95 % off → 225.
  const inh = example("inheritance-home");
  assert.equal(inh.years, 28);
  assert.ok(notes(inh).includes("capped-20"));
  assert.equal(inh.coefficient, 0.3);
  assert.equal(inh.objective.cuotaIntegra, 4_500);
  assert.equal(inh.objective.bonus, 4_275);
  assert.equal(inh.toPay, 225);
  // 9 months: 0,17 × 9 / 12 = 0,1275 × 40.000 = 5.100 → 1.530.
  const m = example("months");
  assert.equal(m.months, 9);
  assert.equal(Math.round(m.coefficient * 10_000), 1_275);
  assert.equal(m.objective.base, 5_100);
  assert.equal(m.toPay, 1_530);
  assert.deepEqual(DEFAULT_INPUT, EXAMPLES.find((e) => e.id === "sale-14y-dec")!.input);
});

test("the council's coefficient: a lower one applies, a higher one is cut to the maximum, under a year it is prorated", () => {
  const base = { acquired: "2012-03-10", transferred: "2026-12-15", landValue: 60_000 };
  const lower = calculateOk(inputOf({ ...base, councilCoefficient: 0.09 }));
  assert.equal(lower.coefficient, 0.09);
  assert.equal(lower.maxCoefficient, 0.11);
  assert.equal(lower.toPay, 1_620);
  const higher = calculateOk(inputOf({ ...base, councilCoefficient: 0.2 }));
  assert.equal(higher.coefficient, 0.11);
  assert.equal(higher.councilCapped, true);
  assert.ok(higher.notes.includes("council-above-max"));
  const months = calculateOk(inputOf({ acquired: "2026-03-10", transferred: "2026-12-15", landValue: 40_000, councilCoefficient: 0.12 }));
  assert.equal(Math.round(months.coefficient * 10_000), 900);
});

test("rate, share, rebate and the derogated windows", () => {
  const base = { acquired: "2012-03-10", transferred: "2026-12-15", landValue: 60_000 };
  assert.equal(calculateOk(inputOf({ ...base, rate: 15 })).toPay, 990);
  assert.equal(calculateOk(inputOf({ ...base, sharePct: 50 })).toPay, 990);
  // The rebate is only for inheritances (art. 108.4).
  const sale = calculateOk(inputOf({ ...base, bonusPct: 95 }));
  assert.equal(sale.toPay, 1_980);
  assert.ok(sale.notes.includes("bonus-inheritance-only"));
  // 1-27 January 2026: the RDL 16/2025 table, flagged.
  const jan = calculateOk(inputOf({ ...base, transferred: "2026-01-20" }));
  assert.equal(jan.table.id, "rdl16-2025");
  assert.equal(jan.years, 13);
  assert.equal(jan.coefficient, 0.1);
  assert.ok(jan.notes.includes("derogated-window"));
  // 2027: today's table, flagged.
  assert.ok(calculateOk(inputOf({ ...base, transferred: "2027-03-01" })).notes.includes("future-table"));
  // Same price in and out: no increase, not subject.
  assert.equal(calculateOk(inputOf({ ...base, totalValue: 150_000, acquisitionValue: 200_000, transferValue: 200_000 })).notSubject, true);
  // Without the total value the real method is not worked out.
  const noTotal = calculateOk(inputOf({ ...base, acquisitionValue: 200_000, transferValue: 320_000 }));
  assert.equal(noTotal.realGain, null);
  assert.ok(noTotal.notes.includes("real-missing"));
});

test("invalid inputs answer with a reason", () => {
  const ok = { acquired: "2012-03-10", transferred: "2026-12-15", landValue: 60_000 };
  const reason = (p: Partial<Parameters<typeof inputOf>[0]>) => {
    const r = calculate(inputOf({ ...ok, ...p }));
    return r.status === "invalid" ? r.reason : "ok";
  };
  assert.equal(reason({}), "ok");
  assert.equal(reason({ acquired: "" }), "dates");
  assert.equal(reason({ acquired: "2026-02-30" }), "dates");
  assert.equal(reason({ acquired: "2026-12-15" }), "order");
  assert.equal(reason({ acquired: "2010-01-01", transferred: "2023-12-31" }), "range");
  assert.equal(reason({ transferred: "2028-01-01" }), "range");
  assert.equal(reason({ landValue: 0 }), "land");
  assert.equal(reason({ totalValue: 50_000 }), "total");
  assert.equal(reason({ sharePct: 0 }), "share");
  assert.equal(reason({ rate: 31 }), "rate");
  assert.equal(reason({ rate: 0 }), "rate");
  assert.equal(reason({ councilCoefficient: 12 }), "coefficient");
  assert.equal(reason({ bonusPct: 96 }), "bonus");
  assert.equal(reason({ acquisitionValue: -1 }), "values");
  for (const l of PV_LOCALES) for (const k of Object.keys(CALC_COPY.es.invalid) as (keyof typeof CALC_COPY.es.invalid)[]) assert.ok(CALC_COPY[l].invalid[k].trim(), `${l} ${k}`);
  for (const l of PV_LOCALES) for (const n of Object.keys(NOTE_TEXT) as PvNote[]) assert.ok(NOTE_TEXT[n][l].trim(), `${l} ${n}`);
});

/* ------------------------------------------------------------------- page */

test("page: titles, descriptions, FAQ and dates in three languages", () => {
  for (const l of PV_LOCALES) {
    const m = pvMeta(l);
    assert.ok(m.title.length <= 60, `${l}: ${m.title}`);
    assert.ok(m.description.length <= 200, `${l}: ${m.description.length}`);
    assert.match(m.description, /1\.980|1,980/);
    assert.equal(pvFaq(l).length, 8);
    for (const f of pvFaq(l)) assert.ok(f.q.endsWith("?") && f.a.length > 60, `${l}: ${f.q}`);
  }
  assert.equal(coef(0.09, "es"), "0,09");
  assert.equal(coef(0.1275, "en"), "0.1275");
  assert.equal(fromDay("2026-12-01", "ca"), "des de l'1 de desembre de 2026");
  assert.equal(untilDay("2026-11-30", "es"), "hasta el 30 de noviembre de 2026");
  assert.match(deadlineText("sale", "2026-12-15", "es"), /30 días hábiles desde el 15 de diciembre de 2026/);
  assert.match(deadlineText("inheritance", "2026-12-15", "en"), /6 months from 15 December 2026, extendable to one year/);
  const entries = pvSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.ok(e.alternates?.languages?.["x-default"]?.endsWith("/en/calculators/spain-plusvalia-tax/"));
});

test("registry: slugs, routes, hub card, calculator_use id, next step and search shortcut", () => {
  assert.deepEqual(calculatorSlugs("plusvalia"), { es: "plusvalia-municipal", ca: "plusvalua-municipal", en: "spain-plusvalia-tax" });
  assert.deepEqual(pvEditions(), { ca: calcPath("plusvalia", "ca"), es: calcPath("plusvalia", "es"), en: calcPath("plusvalia", "en") });
  for (const l of PV_LOCALES) {
    const file = join(ROOT, "src", "app", "(public)", "[locale]", CALCULATORS_ROOT[l], calculatorSlugs("plusvalia")[l], "page.tsx");
    assert.ok(existsSync(file), file);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`<PlusvaliaRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
  }
  const card = HUB_GROUPS.find((g) => g.id === "housing")!.cards.find((c) => c.key === "plusvalia")!;
  assert.equal(card.scope, "spain");
  assert.equal(card.checked, RULES_AS_OF);
  assert.ok((CALCULATOR_USE_IDS as readonly string[]).includes("plusvalia"));
  assert.deepEqual(CALCULATOR_NEXT.plusvalia, ["home-purchase-tax", "inheritance-tax"]);
  assert.equal(searchShortcuts("es", "plusvalía")[0]?.href, "/es/calculadoras/plusvalia-municipal/");
  assert.equal(searchShortcuts("ca", "plusvàlua")[0]?.href, "/ca/calculadores/plusvalua-municipal/");
  // The home-purchase tax page and the inheritance tax pages link it.
  for (const f of ["src/components/programmatic/home-purchase-tax/HomeTaxPage.tsx", "src/components/programmatic/inheritance-tax/InheritanceTaxPage.tsx", "src/components/programmatic/inheritance-tax/RegionalInheritanceTaxBody.tsx"]) {
    assert.match(read(f), /calcPath\("plusvalia", locale\)/, f);
  }
  // The page is in the sitemap and llms.txt.
  assert.match(read("src/app/sitemap.ts"), /\.\.\.pvSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: pvEditions\(\)/);
});
