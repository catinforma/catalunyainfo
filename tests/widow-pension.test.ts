import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { MINIMUMS_2026, MINIMUM_INCOME_LIMIT_2026, PNC_2026_ANNUAL } from "../src/lib/programmatic/pensions-2027/rules.ts";
import { SMI_2026 } from "../src/lib/programmatic/smi/rules.ts";
import { CALC_COPY, WP_LOCALES, euros, perMonth, whole, widowEditions, widowPath } from "../src/lib/programmatic/widow-pension/copy.ts";
import { access, calculate, calculateOk, widowCase, type WidowInput } from "../src/lib/programmatic/widow-pension/engine.ts";
import { DEFAULT_INPUT, examples, headline, widowFaq, widowMeta, widowSitemapEntries } from "../src/lib/programmatic/widow-pension/page.ts";
import {
  BURDENS_CEILING_SS,
  BURDEN_THRESHOLD,
  COMPLEMENT_CAP,
  CONVALIDATION_RECHECK_BY,
  INCOME_LIMIT,
  LGSS_ANCHOR,
  MAX_PENSION,
  OFFICIAL_PROCEDURE,
  QUOTE,
  RDL31_CHECKED,
  RDL31_STATUS,
  REMARRIAGE_INCOME_LIMIT,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  WIDOW_MINIMUMS,
  burdensCeiling,
  minimumRow,
} from "../src/lib/programmatic/widow-pension/rules.ts";

/**
 * "Pensión de viudedad: requisitos y cuánto se cobra"
 * (lib/programmatic/widow-pension/): LGSS arts. 217 and 219 to 223 (as
 * worded on 18 Nov 2026, art. 221.2 by RDL 31/2026), Decreto 3158/1966 art.
 * 31, RD 900/2018, Orden 13/02/1967 art. 11 and the 2026 minimums of RD
 * 241/2026 (read from the pensions-2027 module); the engine on worked cases;
 * the page, its links and the days the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const run = (p: Partial<WidowInput>) => calculateOk(widowCase(p));

/* ------------------------------------------------------------------ rules */

test("percentages: 52 % (art. 31.1), 60 % (RD 900/2018), 70 % (art. 31.2), quoted as the BOE prints them", () => {
  assert.match(QUOTE.d31_1, /será del 52 por ciento\.$/);
  assert.match(QUOTE.rd900_3, /el porcentaje del 60 por ciento\.$/);
  assert.match(QUOTE.d31_2, /será del 70 por 100\.$/);
  assert.match(QUOTE.d31_2limit, /pensión mínima de viudedad en función de la edad del pensionista/);
  assert.match(QUOTE.d31_2limit, /como mínimo, el 50 por 100 del total de los ingresos/);
  assert.match(QUOTE.d31_2burdens, /hijos menores de veintiséis años[^]*el 75 por 100 del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias/);
  assert.match(QUOTE.rd900a, /65 años/);
  assert.match(QUOTE.rd900_7, /de resultar más favorable, no pudiendo acumularse/);
  assert.match(QUOTE.ssCeiling, /con cargas familiares/);
});

test("access rules: 500 days in 5 years, 15 years without alta, none for accidents; art. 221.2 as worded by RDL 31/2026", () => {
  assert.match(QUOTE.art219alta, /quinientos días, dentro de los cinco años/);
  assert.match(QUOTE.art219noAlta, /quince años/);
  assert.match(QUOTE.art219accident, /accidente, sea o no de trabajo, o una enfermedad profesional, no se exigirá ningún período previo/);
  assert.match(QUOTE.art219_2, /con un año de antelación[^]*hijos comunes[^]*superado los dos años/);
  assert.match(QUOTE.art221cohabitation, /certificado de empadronamiento[^]*no inferior a cinco años\.$/);
  assert.match(QUOTE.art221registration, /antelación mínima de dos años/);
  assert.match(QUOTE.art221children, /hijos en común únicamente será exigible[^]*al menos dos años ininterrumpidos/);
  assert.match(QUOTE.art221children2021, /solo deberán acreditar la constitución de la pareja de hecho/);
  assert.match(QUOTE.art222, /duración de dos años\.$/);
  assert.match(QUOTE.art220comp, /pensión compensatoria[^]*se disminuirá hasta alcanzar la cuantía de esta última/);
  assert.match(QUOTE.art223end, /contraiga matrimonio o constituya una pareja de hecho/);
  assert.match(QUOTE.o11a, /sesenta y un años/);
  assert.match(QUOTE.o11c, /dos veces el importe, en cómputo anual, del salario mínimo/);
});

test("2026 amounts: the pensions-2027 table (RD 241/2026 anexo I), never typed again; the SMI thresholds", () => {
  for (const id of ["widowCharges", "widow65", "widow60", "widowUnder60"] as const) assert.equal(WIDOW_MINIMUMS[id], MINIMUMS_2026.find((m) => m.id === id)!.single, id);
  assert.deepEqual(WIDOW_MINIMUMS, { widowCharges: 17_592.4, widow65: 13_106.8, widow60: 12_262.6, widowUnder60: 9931.6 });
  assert.equal(INCOME_LIMIT, MINIMUM_INCOME_LIMIT_2026.single);
  assert.equal(INCOME_LIMIT, 9442);
  assert.equal(COMPLEMENT_CAP, PNC_2026_ANNUAL);
  // 75 % of 12 SMI months (1.221 €) and twice the yearly SMI (17.094 €).
  assert.equal(BURDEN_THRESHOLD, 10_989);
  assert.equal(REMARRIAGE_INCOME_LIMIT, SMI_2026.annual * 2);
  assert.equal(REMARRIAGE_INCOME_LIMIT, 34_188);
  // The 70 % ceiling: income limit + the age's minimum (BOE), or + the family-burdens minimum (Seguridad Social page).
  assert.equal(burdensCeiling(59), 19_373.6);
  assert.equal(burdensCeiling(60), 21_704.6);
  assert.equal(burdensCeiling(65), 22_548.8);
  assert.equal(BURDENS_CEILING_SS, 27_034.4);
  const src = read("src/lib/programmatic/widow-pension/rules.ts");
  for (const figure of ["17592", "17_592", "13106", "13_106", "12262", "12_262", "9931", "9442", "8803", "3359", "1221"]) assert.ok(!src.includes(figure), `rules.ts types ${figure}: read it from pensions-2027 or smi`);
  assert.equal(minimumRow(40, true, false), "widowCharges");
  assert.equal(minimumRow(70, false, false), "widow65");
  assert.equal(minimumRow(50, false, true), "widow65");
  assert.equal(minimumRow(62, false, false), "widow60");
  assert.equal(minimumRow(59, false, false), "widowUnder60");
});

test("sources: official hosts over https, read on the as-of day; BOE ids and article anchors", () => {
  const hosts = new Set(["www.boe.es", "www.seg-social.es"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.lgss.url, /BOE-A-2015-11724$/);
  assert.match(SOURCES.lgss.ref, /11\/11\/2026/);
  assert.match(SOURCES.rdl31.url, /BOE-A-2026-21872$/);
  assert.match(SOURCES.ley21.url, /BOE-A-2021-21652$/);
  assert.match(SOURCES.d3158.url, /BOE-A-1966-21116#atreintayuno$/);
  assert.match(SOURCES.rd1795.url, /BOE-A-2003-23712$/);
  assert.match(SOURCES.rd900.url, /BOE-A-2018-10397$/);
  assert.match(SOURCES.orden1967.url, /BOE-A-1967-2876#a11$/);
  assert.match(SOURCES.rd241.url, /BOE-A-2026-6977$/);
  for (const href of Object.values(LGSS_ANCHOR)) assert.ok(href.startsWith(`${SOURCES.lgss.url}#`), href);
  for (const href of Object.values(OFFICIAL_PROCEDURE)) assert.ok(["www.seg-social.es", "prestaciones.seg-social.es", "sede.seg-social.gob.es"].includes(new URL(href).host), href);
});

test(`date guard: re-read the 2027 minimums, the income limit and the SMI before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Widow's pension: from 1 Jan 2027 the 2026 minimums (RD 241/2026), the 9.442 € income limit, the non-contributory and maximum pensions and the SMI no longer apply. When the 2027 revaluation norm and SMI decree are in the BOE, update pensions-2027 (OFFICIAL_2027) and smi, re-read the LGSS (arts. 57, 59, 60, 217-223, DT 13ª, DT 48ª), Decreto 3158/1966 art. 31, RD 900/2018, Orden 13/02/1967 art. 11 and the Seguridad Social pages; run the scratchpad verify-quotes script; then move RULES_AS_OF and RULES_UNTIL.",
  );
});

test(`RDL 31/2026 (parejas de hecho with children): re-read its convalidación before ${CONVALIDATION_RECHECK_BY}`, () => {
  assert.ok(RDL31_CHECKED >= RULES_AS_OF);
  if (RDL31_STATUS === "pending") {
    assert.ok(
      today() < CONVALIDATION_RECHECK_BY,
      "RDL 31/2026 (BOE-A-2026-21872) needed the Congress's convalidación within 30 days of 20 Oct 2026. Look in the BOE for the 'Resolución … convalidación' (or derogación); set RDL31_STATUS and RDL31_CHECKED here, the page's 'Convalidación pendiente' paragraph and FAQ, and the sick-leave module's CONVALIDATION_RECHECK_BY note. If repealed, art. 221.2 returns to the Ley 21/2021 wording (QUOTE.art221children2021).",
    );
  }
});

/* ----------------------------------------------------------------- engine */

test("access: the deceased's contributions (art. 219.1), spouses (219.2), parejas de hecho (221.2), divorce (220.1), temporal (222)", () => {
  assert.equal(access(widowCase({ status: "pensioner" })).kind, "pension");
  assert.equal(access(widowCase({ status: "alta-500" })).kind, "pension");
  assert.equal(access(widowCase({ status: "no-alta-15" })).kind, "pension");
  assert.deepEqual(access(widowCase({ status: "alta-short", cause: "common" })), { kind: "none", reason: "contributions", articles: ["217.1", "219.1"] });
  assert.equal(access(widowCase({ status: "alta-short", cause: "accident" })).kind, "pension");
  assert.equal(access(widowCase({ status: "alta-short", cause: "work" })).kind, "pension");
  // Without alta an accident does not replace the 15 years.
  assert.equal(access(widowCase({ status: "no-alta-short", cause: "accident" })).kind, "none");
  // Spouse: the year of marriage only when the common illness came first.
  assert.deepEqual(access(widowCase({ illnessBefore: true, marriageCondition: false })), { kind: "temporal", reason: "marriage", articles: ["219.2", "222"] });
  assert.equal(access(widowCase({ illnessBefore: true, marriageCondition: true })).kind, "pension");
  assert.equal(access(widowCase({ illnessBefore: true, marriageCondition: false, cause: "accident" })).kind, "pension");
  // Parejas de hecho, RDL 31/2026: with children 2 years on the padrón, no registration.
  const partner = (p: Partial<WidowInput>) => access(widowCase({ relationship: "partner", ...p }));
  assert.equal(partner({ commonChildren: true, cohabitation: "2-to-5", registration: "none" }).kind, "pension");
  assert.deepEqual(partner({ commonChildren: true, cohabitation: "under-2" }), { kind: "none", reason: "partner-cohabitation", articles: ["221.2"] });
  assert.equal(partner({ commonChildren: false, cohabitation: "5-plus", registration: "2-plus" }).kind, "pension");
  assert.deepEqual(partner({ commonChildren: false, cohabitation: "5-plus", registration: "under-2" }), { kind: "temporal", reason: "registration", articles: ["221.2", "222"] });
  assert.equal(partner({ commonChildren: false, cohabitation: "5-plus", registration: "none" }).kind, "none");
  assert.deepEqual(partner({ commonChildren: false, cohabitation: "2-to-5", registration: "2-plus" }), { kind: "none", reason: "partner-cohabitation", articles: ["221.2"] });
  // Separated or divorced.
  const sep = (p: Partial<WidowInput>) => access(widowCase({ relationship: "separated", ...p }));
  assert.equal(sep({ compensatory: true }).kind, "pension");
  assert.deepEqual(sep({ compensatory: true, remarried: true }), { kind: "none", reason: "remarried", articles: ["220.1"] });
  assert.deepEqual(sep({ compensatory: false, genderViolence: false }), { kind: "none", reason: "compensatory", articles: ["220.1", "DT 13ª"] });
  assert.equal(sep({ compensatory: false, genderViolence: true }).kind, "pension");
});

test("percentage: 60 % with the four RD 900/2018 conditions, 70 % with burdens, main income and the ceiling; never both", () => {
  // The page's default: 66, a pensioner's widow, no income, base 1.600 € → 60 % = 960 € a month, above the 65+ minimum.
  const d = calculateOk(DEFAULT_INPUT);
  assert.equal(d.percent, 60);
  assert.deepEqual([d.amount!.monthly, d.amount!.annual, d.complement!.status], [960, 13_440, "none-needed"]);
  for (const p of [{ otherPension: true }, { workIncome: true }, { otherIncome: 9442.01 }, { age: 64 }]) assert.equal(run(p).percent, 52, JSON.stringify(p));
  assert.equal(run({ otherIncome: 9442 }).percent, 60);
  // 70 %: 42, burdens, no income, base 1.900 € → 1.330 € a month, 18.620 € a year within 19.373,60 €.
  const b = run({ age: 42, familyBurdens: true, otherIncome: 0, baseReguladora: 1900 });
  assert.equal(b.percent, 70);
  assert.deepEqual([b.amount!.monthly, b.amount!.annual, b.amount!.reducedBy313], [1330, 18_620, false]);
  // 31.3: with 3.000 € of income the 70 % is cut to 19.373,60 − 3.000 = 16.373,60 € (still above 52 %), then topped up to the burdens minimum.
  const r = run({ age: 42, familyBurdens: true, otherIncome: 3000, workIncome: true, baseReguladora: 1900 });
  assert.deepEqual([r.percent, r.amount!.annual, r.amount!.reducedBy313], [70, 16_373.6, true]);
  assert.deepEqual([r.complement!.status, r.total!.annual], ["full", 17_592.4]);
  // When the cut 70 % falls below 52 %, the 52 % applies.
  const low = run({ age: 45, familyBurdens: true, otherIncome: 6000, workIncome: true, baseReguladora: 2000 });
  assert.deepEqual([low.burdens.met, low.percent, low.amount!.annual], [true, 52, 14_560]);
  // Between the BOE ceiling and the Seguridad Social's: "check", the certain rate stays 52 %.
  const check = run({ age: 40, familyBurdens: true, otherIncome: 22_000, workIncome: true, baseReguladora: 2400 });
  assert.deepEqual([check.burdens.income, check.burdens.mainSource, check.burdens.possible, check.percent], ["check", true, true, 52]);
  // Same income, a lower base: the 70 % pension (19.600 €) would not be half of all income.
  const notMain = run({ age: 40, familyBurdens: true, otherIncome: 22_000, workIncome: true, baseReguladora: 2000 });
  assert.deepEqual([notMain.burdens.mainSource, notMain.burdens.possible], [false, false]);
  assert.equal(run({ age: 40, familyBurdens: true, otherIncome: 28_000, workIncome: true }).burdens.income, "over");
  // Without a base the main-source test is unknown unless there is no other income.
  const nb = run({ age: 40, familyBurdens: true, otherIncome: 5000, workIncome: true, baseReguladora: null });
  assert.deepEqual([nb.burdens.mainSource, nb.burdens.possible, nb.percent], [null, true, 52]);
  assert.equal(run({ age: 40, familyBurdens: true, otherIncome: 0, baseReguladora: null }).percent, 70);
});

test("amount: 14 or 12 payments, the maximum pension, the compensatory pension, the minimum complement and its cap", () => {
  const work = run({ status: "alta-short", cause: "work", age: 50, baseReguladora: 2400 });
  assert.deepEqual([work.amount!.payments, work.amount!.monthly, work.amount!.annual], [12, 1248, 14_976]);
  const max = run({ baseReguladora: 6000 });
  assert.deepEqual([max.amount!.cappedByMaximum, max.amount!.annual, max.amount!.monthly], [true, MAX_PENSION.annual, MAX_PENSION.monthly]);
  const div = run({ relationship: "separated", age: 63, compensatory: true, compensatoryAnnual: 6000, baseReguladora: 1600 });
  assert.deepEqual([div.amount!.cappedByCompensatory, div.amount!.annual, div.amount!.monthly, div.complement!.status], [true, 6000, 428.57, "compensatory"]);
  // Full complement: 70, 1.200 € of interest, base 1.400 € → 840 € + 96,20 € = 936,20 € (the 65+ minimum).
  const full = run({ age: 70, otherIncome: 1200, baseReguladora: 1400 });
  assert.deepEqual([full.percent, full.amount!.monthly, full.complement], [60, 840, { status: "full", annual: 1346.8, monthly: 96.2 }]);
  assert.equal(full.total!.monthly, 936.2);
  // Partial (RD 241/2026 art. 9.2): 12.000 € of income → 9.442 + 13.106,80 − 12.000 − 7.280 = 3.268,80 €.
  const part = run({ age: 66, otherIncome: 12_000, baseReguladora: 1000 });
  assert.deepEqual(part.complement, { status: "partial", annual: 3268.8, monthly: 233.49 });
  assert.equal(run({ age: 66, otherIncome: 25_000, baseReguladora: 1000 }).complement!.status, "over-limit");
  // The complement never exceeds the non-contributory pension (LGSS art. 59.4).
  const tiny = run({ age: 50, status: "alta-500", baseReguladora: 50 });
  assert.equal((tiny.complement as { annual: number }).annual, COMPLEMENT_CAP);
  assert.ok(tiny.total!.annual < WIDOW_MINIMUMS.widowUnder60);
  assert.equal(run({ otherPension: true }).complement!.status, "other-pension");
  // The prestación temporal: same amount, no complement.
  const tmp = run({ illnessBefore: true, marriageCondition: false, age: 50, baseReguladora: 500 });
  assert.deepEqual([tmp.access.kind, tmp.complement!.status, tmp.floor.status], ["temporal", "temporal", "temporal"]);
  // Without a base: the floor the minimum guarantees.
  assert.deepEqual(run({ baseReguladora: null, age: 67 }).floor, { status: "full", annual: 13_106.8, monthly: 936.2 });
  assert.deepEqual(run({ baseReguladora: null, age: 67, otherIncome: 10_000 }).floor, { status: "partial", annual: 12_548.8, monthly: 896.34 });
});

test("invalid input: each reason, and words for it in every language", () => {
  assert.deepEqual(calculate(widowCase({ age: Number.NaN })), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate(widowCase({ age: 13 })), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate(widowCase({ otherIncome: -1 })), { status: "invalid", reason: "income" });
  assert.deepEqual(calculate(widowCase({ baseReguladora: 0 })), { status: "invalid", reason: "base" });
  assert.deepEqual(calculate(widowCase({ baseReguladora: Number.NaN })), { status: "invalid", reason: "base" });
  assert.deepEqual(calculate(widowCase({ compensatoryAnnual: -5 })), { status: "invalid", reason: "compensatory" });
  assert.equal(calculate(widowCase({ baseReguladora: null })).status, "ok");
  for (const l of WP_LOCALES) {
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
    for (const r of Object.values(CALC_COPY[l].invalid)) assert.ok(r.trim(), l);
  }
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry 52, 60, 70 % and the 2026 minimums; three editions", () => {
  const h = headline();
  for (const l of WP_LOCALES) {
    const m = widowMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length} ${m.description}`);
    for (const p of [52, 60, 70]) assert.ok(m.description.includes(whole(p, l)), `${l}: ${p}`);
    assert.ok(m.description.includes(euros(h.minUnder60, l)) && m.description.includes(euros(h.minCharges, l)), l);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
  }
  assert.equal(widowMeta("es").title, "Pensión de viudedad: requisitos y cuánto se cobra");
  assert.deepEqual([h.minUnder60, h.min60, h.min65, h.minCharges], [709.4, 875.9, 936.2, 1256.6]);
  assert.deepEqual(widowEditions(), { ca: "/ca/calculadores/pensio-viduitat/", es: "/es/calculadoras/pension-viudedad/", en: "/en/calculators/spain-widows-pension/" });
  const entries = widowSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.widowSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: widowEditions\(\)/);
  const work = HUB_GROUPS.find((g) => g.id === "work")!.cards.map((c) => c.key);
  assert.equal(work[work.indexOf("widow-pension") - 1], "pensions-2027");
  assert.equal(work[work.indexOf("pensions-2027") - 1], "retirement-age");
  assert.ok(CALCULATOR_USE_IDS.includes("widow-pension"));
  assert.deepEqual(CALCULATOR_NEXT["widow-pension"], ["pay-dates", "pensions-2027"]);
  assert.equal(searchShortcuts("es", "pensión de viudedad")[0]?.href, widowPath("es"));
  assert.equal(searchShortcuts("ca", "pensió de viduïtat")[0]?.href, widowPath("ca"));
  assert.equal(searchShortcuts("en", "widow's pension")[0]?.href, widowPath("en"));
  // Plain pension searches still go to the pension increase first.
  assert.notEqual(searchShortcuts("es", "pensiones")[0]?.href, widowPath("es"));
});

test("page: one static route per language, a 404 in the others, the tables, examples and YMYL pieces in the HTML", () => {
  const routes = { es: "calculadoras/pension-viudedad", ca: "calculadores/pensio-viduitat", en: "calculators/spain-widows-pension" } as const;
  for (const l of WP_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<WidowPensionRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/widow-pension/WidowPensionPage.tsx");
  assert.match(page, /<MoreCalculators current="widow-pension" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="widow-pension" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<WidowPensionCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} asOf=\{RULES_AS_OF\} \/>/);
  // Server-rendered: the percentages, minimums, partners and examples tables.
  assert.match(page, /pctRows\.map/);
  assert.match(page, /WIDOW_MINIMUM_IDS\.map/);
  assert.match(page, /table\(partnerCols, partnerRows\)/);
  assert.match(page, /examples\(\)\.map/);
  // YMYL: disclaimer with the official procedure, the rules date, the FAQ schema, every procedure link.
  assert.match(page, /SOURCES\.ssWidow\.url/);
  for (const k of ["portal", "form", "appointment", "howTo"]) assert.match(page, new RegExp(`OFFICIAL_PROCEDURE\\.${k}`));
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /RDL31_CHECKED/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /pensionPath\(locale\)/);
  assert.match(page, /calcPath\("retirement-age", locale\)/);
  assert.match(page, /PAY_DATES_PATH\[locale\]/);
  const calc = read("src/components/programmatic/widow-pension/WidowPensionCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("widow-pension"/);
  // Never asks for an ID or Social Security number.
  assert.doesNotMatch(calc, /\bdni\b|\bnie\b|\bnss\b|afiliaci/i);
});

test("examples and FAQ: every figure from the engine and the rules; eight questions per language", () => {
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result]));
  assert.equal(examples().length, 8);
  assert.deepEqual([ex["married-52"]!.percent, ex["married-52"]!.amount!.monthly], [52, 936]);
  assert.deepEqual([ex["retired-60"]!.percent, ex["retired-60"]!.total!.monthly], [60, 936.2]);
  assert.deepEqual([ex["burdens-70"]!.access.kind, ex["burdens-70"]!.percent, ex["burdens-70"]!.amount!.monthly], ["pension", 70, 1330]);
  assert.deepEqual([ex.divorced!.amount!.monthly, ex.divorced!.amount!.cappedByCompensatory], [428.57, true]);
  assert.deepEqual([ex.temporal!.access.kind, ex.temporal!.amount!.monthly], ["temporal", 1040]);
  assert.deepEqual([ex["work-accident"]!.access.kind, ex["work-accident"]!.amount!.payments, ex["work-accident"]!.amount!.monthly], ["pension", 12, 1248]);
  assert.equal(ex["partner-none"]!.access.kind, "none");
  assert.deepEqual([ex["no-base"]!.percent, ex["no-base"]!.amount, ex["no-base"]!.floor], [60, null, { status: "full", annual: 13_106.8, monthly: 936.2 }]);
  const h = headline();
  for (const l of WP_LOCALES) {
    const faq = widowFaq(l);
    assert.equal(faq.length, 8, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 8, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const p of [52, 60, 70]) assert.ok(all.includes(whole(p, l)), `${l}: ${p}`);
    for (const m of [h.minUnder60, h.minCharges]) assert.ok(all.includes(perMonth(m, l)), `${l}: ${m}`);
    for (const e of [INCOME_LIMIT, REMARRIAGE_INCOME_LIMIT, burdensCeiling(59)]) assert.ok(all.includes(euros(e, l)), `${l}: ${e}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
  }
});

test("links both ways: the 2027 pension page and the retirement-age page link the calculator in ca, es and en", () => {
  assert.match(read("src/components/programmatic/pensions-2027/PensionPage.tsx"), /calcPath\("widow-pension", locale\)/);
  assert.match(read("src/components/programmatic/retirement-age/RetirementAgePage.tsx"), /calcPath\("widow-pension", locale\)/);
});
