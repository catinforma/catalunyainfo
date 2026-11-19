import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { IPREM_ANNUAL } from "../src/lib/programmatic/iprem/rules.ts";
import { PNC_2026_ANNUAL, PNC_RENT_SUPPLEMENT_2026 } from "../src/lib/programmatic/pensions-2027/rules.ts";
import { widowPath } from "../src/lib/programmatic/widow-pension/copy.ts";
import { CALC_COPY, NC_LOCALES, euros, ncEditions, ncPath, perMonth } from "../src/lib/programmatic/non-contributory-pension/copy.ts";
import { calculate, calculateOk, checks, pncCase, rentOutcome, workCompatibility, type PncInput } from "../src/lib/programmatic/non-contributory-pension/engine.ts";
import { DEFAULT_INPUT, examples, headline, ncFaq, ncMeta, ncSitemapEntries, workExamples } from "../src/lib/programmatic/non-contributory-pension/page.ts";
import {
  FREE_INCOME,
  LGSS_ANCHOR,
  MINIMUM_ANNUAL,
  OFFICIAL_PROCEDURE,
  PNC_ANNUAL,
  PNC_PAYMENTS,
  QUOTE,
  RENT_SUPPLEMENT,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  THIRD_PERSON_ANNUAL,
  WORK_LIMIT,
  householdLimit,
  individualAmount,
  monthly,
} from "../src/lib/programmatic/non-contributory-pension/rules.ts";

/**
 * "Pensión no contributiva: requisitos y cuánto se cobra"
 * (lib/programmatic/non-contributory-pension/): LGSS arts. 363 to 372 (as
 * worded on 19 Nov 2026, art. 363.1.d with Ley 4/2026), the 2026 amounts of
 * RDL 3/2026 art. 2.5 and RD 241/2026 art. 21 (read from the pensions-2027
 * module), RD 357/1991 and RD 1191/2012; every derived figure against the
 * IMSERSO's 2026 guide; the engine on worked cases; the page, its links and
 * the day the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const run = (p: Partial<PncInput>) => calculateOk(pncCase(p));

/* ------------------------------------------------------------------ rules */

test("the law, quoted: ages, residence, 65 %, income, the unit, 70 %, 2,5, 35 %, 25 %, 50 %, effects", () => {
  assert.match(QUOTE.art363a, /mayor de dieciocho y menor de sesenta y cinco años/);
  assert.match(QUOTE.art363b, /durante cinco años, de los cuales dos deberán ser inmediatamente anteriores/);
  assert.match(QUOTE.art363c, /igual o superior al 65 por ciento\.$/);
  assert.match(QUOTE.art363d, /sea inferior al importe, también en cómputo anual/);
  assert.match(QUOTE.art369, /sesenta y cinco años[^]*diez años entre la edad de dieciséis años y la edad de devengo[^]*dos deberán ser consecutivos e inmediatamente anteriores/);
  assert.match(QUOTE.art363_2, /el 70 por ciento de dicha cifra por el número de convivientes, menos uno\.$/);
  assert.match(QUOTE.art363_3, /dos veces y media/);
  assert.match(QUOTE.art363_4, /matrimonio o por lazos de parentesco de consanguinidad hasta el segundo grado\.$/);
  assert.match(QUOTE.art364_2, /no excedan del 35 por ciento[^]*que excedan de tal porcentaje/);
  assert.match(QUOTE.art364_3, /disminuyendo en igual cuantía cada una de las pensiones\.$/);
  assert.match(QUOTE.art364_4, /como mínimo, del 25 por ciento/);
  assert.match(QUOTE.art364_6, /igual o superior al 75 por ciento[^]*equivalente al 50 por ciento/);
  assert.match(QUOTE.art366, /cuatro años[^]*indicador público de renta de efectos múltiples, excluidas las pagas extraordinarias y la pensión de incapacidad no contributiva/);
  assert.match(QUOTE.art365, /día primero del mes siguiente/);
  assert.match(QUOTE.art371, /día primero del mes siguiente/);
  assert.match(QUOTE.art363compensation, /indemnizaciones por responsabilidad civil por daños personales/);
  assert.match(QUOTE.rd357pay, /catorce pagas[^]*junio y noviembre\.$/);
  assert.match(QUOTE.rd1191e, /no sea inferior a un año[^]*180 días inmediatamente anteriores\.$/);
  // RD 357/1991 art. 14.2 (1991) deducts all income; the law's 35 % prevails, as IMSERSO's guide applies it.
  assert.match(QUOTE.rd357old, /se deducirán, en su caso, las rentas o ingresos anuales computables/);
  assert.match(QUOTE.imsersoFree, /35 por 100/);
});

test("2026 amounts: read from pensions-2027 (RDL 3/2026, RD 241/2026), never typed again; the quotes print the same figures", () => {
  assert.equal(PNC_ANNUAL, PNC_2026_ANNUAL);
  assert.equal(PNC_ANNUAL, 8803.2);
  assert.equal(RENT_SUPPLEMENT, PNC_RENT_SUPPLEMENT_2026);
  assert.equal(RENT_SUPPLEMENT, 525);
  assert.equal(PNC_PAYMENTS, 14);
  assert.ok(QUOTE.rdl3.includes(`${euros(PNC_ANNUAL, "es").replace(" €", "")} euros`), QUOTE.rdl3);
  assert.ok(QUOTE.rd241pnc.includes(`${euros(PNC_ANNUAL, "es").replace(" €", "")} euros anuales`));
  assert.ok(QUOTE.rd241rent.includes(`${euros(RENT_SUPPLEMENT, "es").replace(" €", "")} euros anuales`));
  assert.ok(QUOTE.imsersoPay.includes(euros(PNC_ANNUAL, "es")));
  assert.ok(QUOTE.gencatAmount.includes(euros(monthly(PNC_ANNUAL), "ca")) && QUOTE.gencatAmount.includes(euros(monthly(MINIMUM_ANNUAL), "ca")));
  assert.ok(QUOTE.imsersoFree.includes(euros(FREE_INCOME, "es")));
  // Numeric literals of the amounts appear nowhere in the module's code (quotes and comments aside).
  for (const file of ["rules.ts", "engine.ts", "page.ts", "copy.ts"]) {
    const code = read(`src/lib/programmatic/non-contributory-pension/${file}`).replace(/\/\*[^]*?\*\/|\/\/.*$/gm, "").replace(/"(?:[^"\\]|\\.)*"/g, '""');
    for (const n of ["8803", "8_803", "525", "3081", "2200", "4401", "16003", "7200"]) assert.ok(!new RegExp(`\\b${n}\\b`).test(code), `${file} types ${n}`);
  }
});

test("derived figures equal the IMSERSO's 2026 guide: 35 %, 25 %, 50 %, the work limit, monthly amounts", () => {
  assert.equal(FREE_INCOME, 3081.12);
  assert.equal(MINIMUM_ANNUAL, 2200.8);
  assert.equal(THIRD_PERSON_ANNUAL, 4401.6);
  assert.equal(WORK_LIMIT, IPREM_ANNUAL + PNC_ANNUAL);
  assert.equal(WORK_LIMIT, 16_003.2);
  assert.deepEqual([monthly(PNC_ANNUAL), monthly(MINIMUM_ANNUAL), monthly(THIRD_PERSON_ANNUAL), monthly(PNC_ANNUAL + THIRD_PERSON_ANNUAL)], [628.8, 157.2, 314.4, 943.2]);
  // Several beneficiaries in one unit (art. 364.1).
  assert.deepEqual([2, 3, 4, 5].map(individualAmount), [7482.72, 7042.56, 6822.48, 6690.43]);
  assert.deepEqual([2, 3, 4, 5].map((n) => monthly(individualAmount(n))), [534.48, 503.04, 487.32, 477.89]);
});

test("household limits (art. 363.2-3) equal the IMSERSO's 2026 tables, 2 to 10 members, with and without a parent or child, and with the third-person complement", () => {
  const plain = [14_965.44, 21_127.68, 27_289.92, 33_452.16, 39_614.4, 45_776.64, 51_938.88, 58_101.12, 64_263.36];
  const first = [37_413.6, 52_819.2, 68_224.8, 83_630.4, 99_036, 114_441.6, 129_847.2, 145_252.8, 160_658.4];
  const third = [22_448.16, 31_691.52, 40_934.88, 50_178.24, 59_421.6, 68_664.96, 77_908.32, 87_151.68, 96_395.04];
  const thirdFirst = [56_120.4, 79_228.8, 102_337.2, 125_445.6, 148_554, 171_662.4, 194_770.8, 217_879.2, 240_987.6];
  for (let m = 2; m <= 10; m++) {
    assert.equal(householdLimit(m, false), plain[m - 2], `m=${m}`);
    assert.equal(householdLimit(m, true), first[m - 2], `m=${m} first degree`);
    assert.equal(householdLimit(m, false, true), third[m - 2], `m=${m} third person`);
    assert.equal(householdLimit(m, true, true), thirdFirst[m - 2], `m=${m} third person, first degree`);
  }
});

test("sources: official hosts over https, read on the as-of day; BOE ids and article anchors", () => {
  const hosts = new Set(["www.boe.es", "imserso.es", "tramits.gencat.cat", "dretssocials.gencat.cat"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.lgss.url, /BOE-A-2015-11724$/);
  assert.match(SOURCES.lgss.ref, /11\/11\/2026/);
  assert.match(SOURCES.ley4.url, /BOE-A-2026-20528#df-12$/);
  assert.match(SOURCES.rdl3.url, /BOE-A-2026-2548#a2$/);
  assert.match(SOURCES.rd241.url, /BOE-A-2026-6977$/);
  assert.match(SOURCES.rd357.url, /BOE-A-1991-7270$/);
  assert.match(SOURCES.rd1191.url, /BOE-A-2012-10476$/);
  for (const href of Object.values(LGSS_ANCHOR)) assert.ok(href.startsWith(`${SOURCES.lgss.url}#a3`), href);
  for (const href of Object.values(OFFICIAL_PROCEDURE)) assert.ok(hosts.has(new URL(href).host), href);
});

test(`date guard: re-read the 2027 PNC, rent supplement and IPREM before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Non-contributory pension: from 1 Jan 2027 the 2026 PNC (8.803,20 €), its 25 %/35 %/50 % figures, the household limits, the 525 € rent supplement and the 2026 IPREM no longer apply. When the 2027 revaluation norm is in the BOE, update pensions-2027 (OFFICIAL_2027: pncAnnual, and the rent supplement) and iprem, re-read the LGSS arts. 363-372, RD 1191/2012, the IMSERSO's 2027 guide and the Generalitat's tràmits; run the scratchpad verify_quotes.py; then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("eligibility: each condition with its article, both types", () => {
  const failed = (p: Partial<PncInput>) => checks(pncCase(p)).filter((c) => !c.ok).map((c) => `${c.id} ${c.article}`);
  assert.deepEqual(failed({}), []);
  assert.deepEqual(failed({ age: 64, residenceYears: 40 }), ["age 369.1"]);
  assert.deepEqual(failed({ residenceYears: 9.9 }), ["residence 369.1"]);
  assert.deepEqual(failed({ lastTwoYears: false }), ["recent 369.1"]);
  assert.deepEqual(failed({ ownIncome: 8803.2 }), ["own-income 363.1.d"]);
  assert.deepEqual(failed({ ownIncome: 8803.19 }), []);
  // Invalidity: 18 to 64, 65 %, 5 years.
  const inv = (p: Partial<PncInput>) => failed({ type: "invalidity", age: 40, disability: 65, residenceYears: 5, ...p });
  assert.deepEqual(inv({}), []);
  assert.deepEqual(inv({ disability: 64 }), ["disability 363.1.c"]);
  assert.deepEqual(inv({ age: 17, residenceYears: 5 }), ["age 363.1.a"]);
  assert.deepEqual(inv({ age: 65 }), ["age 363.1.a"]);
  assert.deepEqual(inv({ residenceYears: 4 }), ["residence 363.1.b"]);
  // The unit: everyone's income below the limit ("inferior").
  assert.deepEqual(failed({ members: 2, householdIncome: 14_965.44 }), ["household 363.2"]);
  assert.deepEqual(failed({ members: 2, householdIncome: 14_965.43 }), []);
  assert.deepEqual(failed({ members: 2, firstDegree: true, householdIncome: 37_413.59 }), []);
  assert.deepEqual(failed({ members: 3, ownIncome: 3000, householdIncome: 18_127.68 }), ["household 363.2"]);
  // Suggestions: 65+ asks for retirement; under 65 with 65 % for invalidity.
  assert.equal(run({ type: "invalidity", age: 66, disability: 70 }).suggest, "retirement");
  assert.equal(run({ type: "retirement", age: 50, disability: 70, residenceYears: 30 }).suggest, "invalidity");
  assert.equal(run({}).suggest, null);
});

test("amount: the 35 % rule, the shared amount, the household cut, the 25 % floor and the third-person complement", () => {
  const d = calculateOk(DEFAULT_INPUT);
  assert.deepEqual([d.eligible, d.amount!.annual, d.amount!.monthly], [true, 8803.2, 628.8]);
  // Own income up to 35 % is free; above, deducted euro for euro.
  assert.equal(run({ ownIncome: 3081.12 }).amount!.annual, 8803.2);
  assert.deepEqual([run({ ownIncome: 5000 }).amount!.ownCut, run({ ownIncome: 5000 }).amount!.annual, run({ ownIncome: 5000 }).amount!.monthly], [1918.88, 6884.32, 491.74]);
  // Two beneficiaries and nobody else: no household cut (art. 364.3 needs non-beneficiaries).
  const couple = run({ members: 2, beneficiaries: 2, ownIncome: 4000 });
  assert.deepEqual([couple.amount!.full, couple.amount!.ownCut, couple.amount!.householdCut, couple.amount!.annual], [7482.72, 918.88, 0, 6563.84]);
  // Living with a daughter earning 30.000 €: 30.000 + 8.803,20 − 37.413,60 = 1.389,60 € cut.
  const daughter = run({ type: "invalidity", age: 45, disability: 70, residenceYears: 20, members: 2, firstDegree: true, householdIncome: 30_000 });
  assert.deepEqual([daughter.limit, daughter.amount!.householdCut, daughter.amount!.annual, daughter.amount!.monthly], [37_413.6, 1389.6, 7413.6, 529.54]);
  // The cut below 25 % → the floor.
  const floor = run({ members: 2, householdIncome: 14_000 });
  assert.deepEqual([floor.amount!.householdCut, floor.amount!.floorApplied, floor.amount!.annual, floor.amount!.monthly], [7837.76, true, 2200.8, 157.2]);
  // Third person: + 50 %, after the cuts; not for retirement nor under 75 %.
  assert.deepEqual([run({ type: "invalidity", age: 30, disability: 80, thirdPerson: true, residenceYears: 30 }).amount!.annual, run({ type: "invalidity", age: 30, disability: 80, thirdPerson: true, residenceYears: 30 }).amount!.monthly], [13_204.8, 943.2]);
  assert.equal(run({ type: "invalidity", age: 30, disability: 74, thirdPerson: true, residenceYears: 30 }).amount!.complement, 0);
  assert.equal(run({ thirdPerson: true, disability: 90 }).amount!.complement, 0);
  // With the complement the unit's limit is the IMSERSO's (C × 1,5): 20.000 € of a parent's income still qualifies.
  const t = run({ type: "invalidity", age: 30, disability: 80, thirdPerson: true, residenceYears: 30, members: 2, householdIncome: 20_000 });
  assert.deepEqual([t.eligible, t.limit, t.amount!.householdCut, t.amount!.pension, t.amount!.complement, t.amount!.thirdPersonHousehold], [true, 22_448.16, 6355.04, 2448.16, 4401.6, true]);
  assert.equal(run({ type: "invalidity", age: 30, disability: 70, residenceYears: 30, members: 2, householdIncome: 20_000 }).eligible, false);
  assert.equal(run({ age: 64, residenceYears: 40 }).amount, null);
});

test("rent supplement (RD 241/2026 art. 21.2, RD 1191/2012 art. 2): may apply, why not, one per flat", () => {
  assert.deepEqual(run({ renting: true }).rent, { status: "may", annual: 525, shared: false });
  assert.deepEqual(run({ renting: true, members: 2, beneficiaries: 2 }).rent, { status: "may", annual: 525, shared: true });
  assert.deepEqual(run({}).rent, { status: "not-renting" });
  assert.deepEqual(run({ renting: true, ownsHome: true, landlordKin: true, rentHolder: false, rentHabitual: false }).rent, { status: "no", reasons: ["not-holder", "owns-home", "kin", "not-habitual"] });
  assert.deepEqual(rentOutcome(pncCase({ renting: true }), false), { status: "no-pension" });
  assert.deepEqual(run({ renting: true, age: 60, residenceYears: 40 }).rent, { status: "no-pension" });
});

test("work with the invalidity pension (art. 366): up to the IPREM + the PNC, cut above, suspended at zero", () => {
  assert.deepEqual(workCompatibility(PNC_ANNUAL, 6000), { pension: 8803.2, cut: 0, suspended: false });
  assert.deepEqual(workCompatibility(PNC_ANNUAL, 10_000), { pension: 6003.2, cut: 2800, suspended: false });
  assert.deepEqual(workCompatibility(PNC_ANNUAL, WORK_LIMIT), { pension: 0, cut: 8803.2, suspended: true });
  assert.equal(workExamples().length, 3);
});

test("invalid input: each reason, and words for it in every language", () => {
  assert.deepEqual(calculate(pncCase({ age: Number.NaN })), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate(pncCase({ age: 66.5 })), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate(pncCase({ disability: 101 })), { status: "invalid", reason: "disability" });
  assert.deepEqual(calculate(pncCase({ residenceYears: 68 })), { status: "invalid", reason: "residence" });
  assert.deepEqual(calculate(pncCase({ members: 0 })), { status: "invalid", reason: "members" });
  assert.deepEqual(calculate(pncCase({ members: 2, beneficiaries: 3 })), { status: "invalid", reason: "beneficiaries" });
  assert.deepEqual(calculate(pncCase({ ownIncome: -1 })), { status: "invalid", reason: "income" });
  assert.deepEqual(calculate(pncCase({ householdIncome: Number.NaN })), { status: "invalid", reason: "income" });
  for (const l of NC_LOCALES) {
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
    for (const r of Object.values(CALC_COPY[l].invalid)) assert.ok(r.trim(), l);
  }
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry 628,80 and 157,20 €; three editions; hub, registry, search", () => {
  const h = headline();
  for (const l of NC_LOCALES) {
    const m = ncMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length} ${m.description}`);
    assert.ok(m.description.includes(euros(h.monthly, l)) && m.description.includes(euros(h.minMonthly, l)), l);
    assert.ok(m.h1.length <= 90, `${l} h1: ${m.h1.length}`);
  }
  assert.equal(ncMeta("es").title, "Pensión no contributiva 2026: requisitos y cuánto se cobra");
  assert.deepEqual(ncEditions(), { ca: "/ca/calculadores/pensio-no-contributiva/", es: "/es/calculadoras/pension-no-contributiva/", en: "/en/calculators/spain-non-contributory-pension/" });
  const entries = ncSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.ncSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: ncEditions\(\)/);
  const work = HUB_GROUPS.find((g) => g.id === "work")!.cards.map((c) => c.key);
  assert.equal(work[work.indexOf("non-contributory-pension") - 1], "widow-pension");
  assert.ok(CALCULATOR_USE_IDS.includes("non-contributory-pension"));
  assert.deepEqual(CALCULATOR_NEXT["non-contributory-pension"], ["pensions-2027", "iprem"]);
  for (const [l, q] of [["es", "pensión no contributiva"], ["es", "pensión no contributiva de jubilación"], ["es", "PNC"], ["ca", "pensió no contributiva"], ["en", "non-contributory pension"]] as const) {
    assert.equal(searchShortcuts(l, q)[0]?.href, ncPath(l), q);
  }
  // The neighbours keep their own searches.
  assert.equal(searchShortcuts("es", "pensión de viudedad")[0]?.href, widowPath("es"));
  assert.notEqual(searchShortcuts("es", "pensiones")[0]?.href, ncPath("es"));
  assert.notEqual(searchShortcuts("es", "edad de jubilación")[0]?.href, ncPath("es"));
});

test("page: one static route per language, a 404 in the others, the tables, examples and YMYL pieces in the HTML", () => {
  const routes = { es: "calculadoras/pension-no-contributiva", ca: "calculadores/pensio-no-contributiva", en: "calculators/spain-non-contributory-pension" } as const;
  for (const l of NC_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<NcPensionRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/non-contributory-pension/NcPensionPage.tsx");
  assert.match(page, /<MoreCalculators current="non-contributory-pension" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="non-contributory-pension" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<NcPensionCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} asOf=\{RULES_AS_OF\} \/>/);
  // Server-rendered tables: amounts, requirements, unit limits (plain and third person), work, examples.
  for (const t of ["amountRows.map", "table(reqCols, reqRows)", "unitRows,", "table(unitCols, thirdRows, thirdCaption)", "table(workCols, workRows", "examples().map"]) assert.ok(page.includes(t), t);
  // YMYL: disclaimer with the official procedure (Generalitat; IMSERSO list for other regions), the rules date, the FAQ schema.
  for (const k of ["catRetirement", "catInvalidity", "catRent", "catInfo", "where"]) assert.match(page, new RegExp(`OFFICIAL_PROCEDURE\\.${k}`));
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  // Links out: pensions 2027, widow's pension, IPREM, the IMV section, retirement age.
  for (const l of ["pensionPath(locale)", 'calcPath("widow-pension", locale)', "ipremPath(locale)", "subsidyPath(locale)}#ingreso-minimo-vital", 'calcPath("retirement-age", locale)']) assert.ok(page.includes(l), l);
  assert.match(read("src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx"), /<h2 id="ingreso-minimo-vital">/);
  const calc = read("src/components/programmatic/non-contributory-pension/NcPensionCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("non-contributory-pension"/);
  assert.doesNotMatch(calc, /\bdni\b|\bnie\b|\bnss\b|afiliaci/i);
});

test("examples and FAQ: every figure from the engine and the rules; eight questions per language", () => {
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result]));
  assert.equal(examples().length, 8);
  assert.deepEqual([ex.alone!.amount!.monthly, ex.alone!.rent.status], [628.8, "may"]);
  assert.equal(ex["own-income"]!.amount!.monthly, 491.74);
  assert.equal(ex.couple!.amount!.monthly, 534.48);
  assert.equal(ex["with-daughter"]!.amount!.monthly, 529.54);
  assert.deepEqual([ex["with-brother"]!.eligible, ex["with-brother"]!.checks.find((c) => !c.ok)!.id], [false, "household"]);
  assert.equal(ex["third-person"]!.amount!.monthly, 943.2);
  assert.deepEqual([ex.minimum!.amount!.floorApplied, ex.minimum!.amount!.monthly], [true, 157.2]);
  assert.deepEqual([ex.residence!.eligible, ex.residence!.checks.find((c) => !c.ok)!.id], [false, "residence"]);
  const h = headline();
  for (const l of NC_LOCALES) {
    const faq = ncFaq(l);
    assert.equal(faq.length, 8, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 8, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const m of [h.monthly, h.minMonthly, h.coupleMonthly, h.thirdMonthly]) assert.ok(all.includes(perMonth(m, l)), `${l}: ${m}`);
    for (const e of [PNC_ANNUAL, FREE_INCOME, MINIMUM_ANNUAL, WORK_LIMIT, RENT_SUPPLEMENT, householdLimit(2, false), householdLimit(2, true)]) assert.ok(all.includes(euros(e, l)), `${l}: ${e}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
  }
});

test("links in: the pensions-2027, widow's pension, IPREM, unemployment subsidy (IMV) and retirement-age pages", () => {
  for (const f of [
    "src/components/programmatic/pensions-2027/PensionPage.tsx",
    "src/components/programmatic/widow-pension/WidowPensionPage.tsx",
    "src/components/programmatic/iprem/IpremPage.tsx",
    "src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx",
    "src/components/programmatic/retirement-age/RetirementAgePage.tsx",
  ]) {
    assert.match(read(f), /calcPath\("non-contributory-pension", locale\)/, f);
  }
});
