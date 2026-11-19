import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, calcPath, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { ISD_LOCALES } from "../src/lib/programmatic/inheritance-tax/copy.ts";
import { RELATIONS } from "../src/lib/programmatic/inheritance-tax/engine.ts";
import { calculateRegional, calculateRegionalOk, cents, regionalInputOf, regionalQuota } from "../src/lib/programmatic/inheritance-tax/regional-engine.ts";
import { INHERITANCE_FAMILY, REGIONAL_CALC_COPY, REGIONAL_RELATION_LABEL, REGION_CALCULATOR, regionEditions, regionalNote } from "../src/lib/programmatic/inheritance-tax/regional-copy.ts";
import { REGION_EXAMPLES, REGION_RULES, regionDefaultInput, regionExample, regionFaq, regionMeta, regionSitemapEntries } from "../src/lib/programmatic/inheritance-tax/regional-page.ts";
import { ANDALUCIA_DATES, ANDALUCIA_QUOTE, ANDALUCIA_RULES, ANDALUCIA_SOURCES } from "../src/lib/programmatic/inheritance-tax/regions/andalucia.ts";
import { MADRID_DATES, MADRID_QUOTE, MADRID_RULES, MADRID_SOURCES } from "../src/lib/programmatic/inheritance-tax/regions/madrid.ts";
import { REGION_PROFILES } from "../src/lib/programmatic/inheritance-tax/regions/profiles.ts";
import { DEADLINE, RULES_AS_OF, RULES_UNTIL, STATE_GROUP_III, STATE_HOME_CAP, STATE_INSURANCE_MAX, STATE_QUOTE, STATE_SOURCES } from "../src/lib/programmatic/inheritance-tax/regions/state.ts";
import { REGION_IDS, type RegionRules } from "../src/lib/programmatic/inheritance-tax/regions/types.ts";
import { VALENCIA_DATES, VALENCIA_QUOTE, VALENCIA_RULES, VALENCIA_SOURCES } from "../src/lib/programmatic/inheritance-tax/regions/valencia.ts";

/**
 * The Madrid, Andalucía and Comunitat Valenciana inheritance tax calculators
 * (lib/programmatic/inheritance-tax/regions/ and regional-*.ts): every figure
 * against the quoted words of each law, the engine against the Comunidad de
 * Madrid's published figure and against hand calculations done outside the
 * engine (Python Decimal, half-up, from the quoted scales, 19 Nov 2026), the
 * pages, and the date from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
/** "16.000" / "9.195,49" as the bulletins print them. */
const es = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

const M = MADRID_RULES;
const A = ANDALUCIA_RULES;
const V = VALENCIA_RULES;
const pay = (rules: RegionRules, partial: Parameters<typeof regionalInputOf>[0]) => calculateRegionalOk(rules, regionalInputOf(partial));

/* ------------------------------------------------------------------ rules */

test("state figures are in the words of Ley 29/1987 art. 20.2 and RD 1629/1991", () => {
  assert.match(STATE_QUOTE.groupIII, new RegExp(`por afinidad, ${es(STATE_GROUP_III)} euros`));
  assert.match(STATE_QUOTE.groupIV, /no habrá lugar a reducción/);
  assert.match(STATE_QUOTE.insurance, new RegExp(`límite de ${es(STATE_INSURANCE_MAX)} euros`));
  assert.match(STATE_QUOTE.home, new RegExp(`límite de ${es(STATE_HOME_CAP)} euros para cada sujeto pasivo`));
  assert.match(STATE_QUOTE.insuranceAccumulates, /se acumularán al valor de los bienes y derechos que integren la porción hereditaria/);
  assert.match(STATE_QUOTE.deadline, /en el de seis meses, contados desde el día del fallecimiento/);
  assert.match(STATE_QUOTE.extension, /dentro de los cinco primeros meses/);
  assert.deepEqual(DEADLINE, { months: 6, extensionMonths: 6, askWithinMonths: 5 });
  assert.match(STATE_QUOTE.residence, /cinco años inmediatos anteriores/);
  assert.match(STATE_QUOTE.connection, /donde el causante tenga su residencia habitual/);
});

test("Madrid: every figure is in the words of Decreto Legislativo 1/2010 (arts. 21, 24, 25)", () => {
  const k = M.kinship;
  assert.match(MADRID_QUOTE.kinshipLead, /sustituyen a las análogas del Estado/);
  assert.match(MADRID_QUOTE.groupI, new RegExp(`${es(k.groupI.base)} euros, más ${es(k.groupI.perYear)} euros por cada año menos de veintiuno .* exceder de ${es(k.groupI.max)} euros`));
  assert.match(MADRID_QUOTE.groupII, new RegExp(`adoptantes, ${es(k.groupII)} euros`));
  assert.match(MADRID_QUOTE.groupIII, new RegExp(`por afinidad, ${es(k.groupIII)} euros`));
  assert.equal(k.groupIIIOrigin, "region");
  assert.match(MADRID_QUOTE.disability, new RegExp(`reducción de ${es(M.disability.from33)} euros .* 33 por 100. La reducción será de ${es(M.disability.from65)} euros`));
  assert.match(MADRID_QUOTE.insurance, new RegExp(`100 por 100, con un límite de ${es(M.insurance.max)} euros`));
  assert.match(MADRID_QUOTE.home, new RegExp(`reducción del ${M.home.percent} por 100 con el límite de ${es(M.home.capPerHeir)} euros para cada sujeto`));
  assert.match(MADRID_QUOTE.home, /cinco años siguientes/);
  assert.equal(M.home.keepYears, 5);
  assert.match(MADRID_QUOTE.excess, /se reducirá en el importe del exceso/);
  assert.equal(M.excessRule, true);
  assert.match(MADRID_QUOTE.bonusGroupsIandII, new RegExp(`grupos I y II .* bonificación del ${M.bonus.groupsIandII} por ciento`));
  assert.match(MADRID_QUOTE.bonusGroupIII, new RegExp(`grupo III .* bonificación del ${M.bonus.groupIII} por ciento`));
  assert.equal(M.bonus.groupIIIScope, "group");
  assert.match(MADRID_QUOTE.agencyGroupIII, /a partir del 1 de julio de 2025/);
  assert.equal(MADRID_DATES.bonusFrom, "2025-07-01");
  assert.equal(M.deathsFrom, MADRID_DATES.bonusFrom);
  assert.match(MADRID_QUOTE.partners, /se asimilarán a cónyuges los miembros de uniones de hecho/);
  // Art. 24: the printed coefficients.
  assert.deepEqual(
    M.coefficients.map((r) => [r.upTo, r.groupsIandII, r.groupIII, r.groupIV]),
    [[403_000, 1, 1.5882, 2], [2_008_000, 1.05, 1.6676, 2.1], [4_021_000, 1.1, 1.7471, 2.2], [null, 1.2, 1.9059, 2.4]],
  );
});

test("Andalucía: every figure is in the words of Ley 5/2021 (arts. 27-29, 38, 39) and the ATRIAN guide", () => {
  const k = A.kinship;
  assert.match(ANDALUCIA_QUOTE.kinship, /Grupo I: adquisiciones por descendientes y adoptados menores de 21 años, 1\.000\.000 de euros/);
  assert.match(ANDALUCIA_QUOTE.kinship, /Grupo II: .* adoptantes, 1\.000\.000 euros/);
  assert.match(ANDALUCIA_QUOTE.kinship, new RegExp(`Grupo III: .* por afinidad, ${es(k.groupIII)} euros`));
  assert.deepEqual(k.groupI, { base: 1_000_000, perYear: 0, max: 1_000_000 });
  assert.equal(k.groupII, 1_000_000);
  assert.match(ANDALUCIA_QUOTE.disability, new RegExp(`a\\) ${es(A.disability.from33)} euros, si el grado de discapacidad fuera igual o superior al 33% e inferior al 65%. b\\) ${es(A.disability.from65)} euros`));
  assert.match(ANDALUCIA_QUOTE.disability, /compatible con la mejora de la reducción estatal .* por personas con parentesco/);
  assert.match(ANDALUCIA_QUOTE.home, new RegExp(`será del ${A.home.percent}%`));
  assert.match(ANDALUCIA_QUOTE.homeConditions, /tres años siguientes/);
  assert.equal(A.home.keepYears, 3);
  // Only the percentage is Andalusian: the limit stays the state's, as the guide says.
  assert.equal(A.home.capPerHeir, STATE_HOME_CAP);
  assert.equal(A.home.capOrigin, "state");
  assert.match(ANDALUCIA_QUOTE.homeCapGuide, new RegExp(es(STATE_HOME_CAP)));
  assert.equal(A.insurance.max, STATE_INSURANCE_MAX);
  assert.match(ANDALUCIA_QUOTE.insuranceGuide, new RegExp(`límite de ${es(STATE_INSURANCE_MAX)} €`));
  assert.match(ANDALUCIA_QUOTE.bonus, new RegExp(`Grupos I y II .* bonificación del ${A.bonus.groupsIandII}%`));
  assert.equal(A.bonus.groupIII, 0);
  assert.deepEqual(A.coefficients, [{ upTo: null, groupsIandII: 1, groupIII: 1.5, groupIV: 1.9 }]);
  assert.match(ANDALUCIA_QUOTE.coefficientGuide, /depende solamente del grado de parentesco/);
  assert.match(ANDALUCIA_QUOTE.inForce, /1 de enero de 2022/);
  assert.equal(ANDALUCIA_DATES.consolidatedFrom, "2022-01-01");
});

test("Comunitat Valenciana: every figure is in the words of Ley 13/1997 (arts. 10, 12 bis) and the ATV's instructions", () => {
  const k = V.kinship;
  assert.match(VALENCIA_QUOTE.lead, /reducciones análogas a las aprobadas por el Estado/);
  assert.match(VALENCIA_QUOTE.groupI, new RegExp(`${es(k.groupI.base)} euros, más ${es(k.groupI.perYear)} euros por cada año menos de 21 .* exceder de ${es(k.groupI.max)} euros`));
  assert.match(VALENCIA_QUOTE.groupII, new RegExp(`adoptantes, ${es(k.groupII)} euros`));
  // Groups III and IV and life insurance: the state's, as the ATV applies them.
  assert.equal(k.groupIII, STATE_GROUP_III);
  assert.equal(k.groupIIIOrigin, "state");
  assert.match(VALENCIA_QUOTE.atvGroupIII, new RegExp(`${es(STATE_GROUP_III)} euros`));
  assert.match(VALENCIA_QUOTE.atvStateReduction, /Grupos I y II de parentesco no se aplicará cuando el causante tenga su residencia habitual en la Comunitat Valenciana/);
  assert.equal(V.insurance.max, STATE_INSURANCE_MAX);
  assert.match(VALENCIA_QUOTE.atvInsurance, new RegExp(`límite de ${es(STATE_INSURANCE_MAX)} euros`));
  assert.match(VALENCIA_QUOTE.atvInstructionsLaw, /1 de enero de 2017/);
  assert.match(VALENCIA_QUOTE.disability, new RegExp(`reducción de ${es(V.disability.from33)} euros, .* intelectual o mental .* será de ${es(V.disability.from65)} euros`));
  assert.equal(V.disability.mentalFrom33As65, true);
  assert.match(VALENCIA_QUOTE.home, new RegExp(`límite de ${es(V.home.capPerHeir)} euros para cada sujeto pasivo, una reducción del ${V.home.percent} por 100`));
  assert.match(VALENCIA_QUOTE.home, /cinco años siguientes/);
  assert.match(VALENCIA_QUOTE.bonusGroupsIandII, new RegExp(`bonificación del ${V.bonus.groupsIandII} por 100 .* grupos I y II`));
  assert.match(VALENCIA_QUOTE.bonusDisability, /igual o superior al 65 por 100, o un grado de discapacidad intelectual o mental .* 33 por 100/);
  assert.equal(V.bonus.disability, 99);
  assert.match(VALENCIA_QUOTE.bonusGroupIII, new RegExp(`bonificación del ${V.bonus.groupIII} por 100 .* colaterales de segundo o tercer grado por consanguinidad`));
  assert.equal(V.bonus.groupIIIScope, "blood-collaterals");
  assert.match(VALENCIA_QUOTE.bonusGroupIIIFrom, /Con efectos desde el 1 de junio de 2026/);
  assert.equal(VALENCIA_DATES.groupIIIBonusFrom, "2026-06-01");
  assert.equal(V.deathsFrom, VALENCIA_DATES.groupIIIBonusFrom);
  assert.match(VALENCIA_QUOTE.bonusGroupIIINextFrom, /Con efectos desde el 1 de junio de 2027/);
  assert.match(VALENCIA_QUOTE.bonusGroupIIINext, new RegExp(`bonificación del ${VALENCIA_DATES.groupIIIBonusNext} por 100`));
  assert.match(VALENCIA_QUOTE.atvExcess, /El ajuste de la cuota sólo se practicará/);
  assert.equal(V.excessRule, true);
  assert.match(VALENCIA_QUOTE.deadline, /en el de seis meses/);
  assert.match(VALENCIA_QUOTE.partners, /Se asimilan a cónyuges los miembros de parejas de hecho/);
  assert.deepEqual(
    V.coefficients.map((r) => [r.upTo, r.groupsIandII, r.groupIII, r.groupIV]),
    [[390_657.87, 1, 1.5882, 2], [1_965_309.58, 1.05, 1.6676, 2.1], [3_936_629.28, 1.1, 1.7471, 2.2], [null, 1.2, 1.9059, 2.4]],
  );
});

test("each scale adds up: every row's printed quota is the row before plus its rate, to the cent", () => {
  for (const rules of [M, A, V]) {
    assert.equal(rules.scale[0]!.from, 0);
    assert.equal(rules.scale[0]!.quota, 0);
    for (let i = 1; i < rules.scale.length; i++) {
      const prev = rules.scale[i - 1]!;
      const row = rules.scale[i]!;
      assert.ok(row.from > prev.from, `${rules.id} row ${i}`);
      const expected = cents(prev.quota + ((row.from - prev.from) * prev.rate) / 100);
      // Madrid and Valencia print some quotas a cent off the recomputed one; the engine uses the printed figure, as the agencies' tables do.
      assert.ok(Math.abs(expected - row.quota) <= 0.011, `${rules.id} row ${i}: ${expected} vs ${row.quota}`);
    }
  }
  assert.deepEqual(M.scale.map((r) => r.rate), [7.65, 8.5, 9.35, 10.2, 11.05, 11.9, 12.75, 13.6, 14.45, 15.3, 16.15, 18.7, 21.25, 25.5, 29.75, 34]);
  assert.deepEqual(A.scale.map((r) => r.rate), [7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26]);
  assert.deepEqual(V.scale.map((r) => r.rate), [7.65, 8.5, 9.35, 10.2, 11.05, 11.9, 12.75, 13.6, 14.45, 15.3, 16.15, 18.7, 21.25, 25.5, 29.75, 34]);
  // A base exactly on a row edge takes the row below (Andalucía: 200.000 € → 31.620 €).
  assert.equal(regionalQuota(A.scale, 200_000).quota, 31_620);
  assert.equal(cents(8_826.445), 8_826.45);
});

test("every source is an official one, over https, read on the rules' date", () => {
  const sources = [...Object.values(STATE_SOURCES), ...Object.values(MADRID_SOURCES), ...Object.values(ANDALUCIA_SOURCES), ...Object.values(VALENCIA_SOURCES)];
  for (const src of sources) {
    assert.match(src.url, /^https:\/\/(www\.boe\.es|www\.comunidad\.madrid|www\.juntadeandalucia\.es|atv\.gva\.es|www\.gva\.es)\//, src.url);
    if ("urlCa" in src && src.urlCa) assert.match(src.urlCa, /^https:\/\/(atv\.gva\.es\/va\/|www\.gva\.es\/)/, src.urlCa);
    assert.equal(src.read, RULES_AS_OF);
  }
  assert.match(MADRID_SOURCES.law.url, /BOCM-m-2010-90068$/);
  assert.match(ANDALUCIA_SOURCES.law.url, /BOE-A-2021-17915$/);
  assert.match(VALENCIA_SOURCES.law.url, /BOE-A-1998-8202$/);
});

test(`date guard: the three communities' rules are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF < RULES_UNTIL);
  // The Valencian 50 % for group III starts after the guard: the pages announce it, the calculator applies the 25 %.
  assert.ok(RULES_UNTIL < VALENCIA_DATES.groupIIIBonusNextFrom);
  assert.ok(
    today() < RULES_UNTIL,
    "Inheritance tax Madrid/Andalucía/Valencia: re-read the BOE consolidated texts (BOCM-m-2010-90068 arts. 21-26, BOE-A-2021-17915 arts. 26-39, BOE-A-1998-8202 arts. 10-12 quáter), the 2027 budget and fiscal-measures laws of each community (BOCM, BOJA, DOGV), and the agencies' pages; update regions/*.ts, then move RULES_AS_OF and RULES_UNTIL in regions/state.ts.",
  );
});

/* ----------------------------------------------------------------- engine */

test("Madrid's own example: a cuota íntegra of 1.250 € leaves 12,50 € to pay", () => {
  assert.match(MADRID_QUOTE.agencyExample, /cuota íntegra de 1\.250 € .* deberá ingresar 12,50 €/);
  const e = REGION_EXAMPLES.madrid.find((x) => x.official)!;
  const r = calculateRegionalOk(M, e.input);
  assert.deepEqual(e.official, { quotaIntegra: 1_250, toPay: 12.5 });
  assert.equal(r.quotaIntegra, e.official!.quotaIntegra);
  assert.equal(r.toPay, e.official!.toPay);
  assert.equal(r.baseLiquidable, 15_537.2);
});

test("hand-calculated cases come out to the cent (Python Decimal from the quoted scales)", () => {
  const cases: [RegionRules, Parameters<typeof regionalInputOf>[0], { bl: number; ci: number; qt: number; bonus: number; pay: number }][] = [
    [M, { relation: "child", age: 30, share: 300_000 }, { bl: 284_000, ci: 51_350.98, qt: 51_350.98, bonus: 50_837.47, pay: 513.51 }],
    [M, { relation: "child", age: 15, share: 200_000 }, { bl: 160_000, ci: 23_121.21, qt: 23_121.21, bonus: 22_890, pay: 231.21 }],
    [M, { relation: "collateral", age: 60, share: 150_000 }, { bl: 142_000, ci: 19_752.36, qt: 31_370.7, bonus: 15_685.35, pay: 15_685.35 }],
    [M, { relation: "collateral", age: 60, share: 100_000 }, { bl: 92_000, ci: 11_115.03, qt: 17_652.89, bonus: 8_826.45, pay: 8_826.44 }],
    [M, { relation: "unrelated", age: 50, share: 100_000 }, { bl: 100_000, ci: 12_407.03, qt: 24_814.06, bonus: 0, pay: 24_814.06 }],
    [M, { relation: "child", age: 50, share: 400_000, homeValue: 300_000, homeHeirPct: 50 }, { bl: 261_000, ci: 45_485.98, qt: 45_485.98, bonus: 45_031.12, pay: 454.86 }],
    [A, { relation: "child", age: 30, share: 1_200_000 }, { bl: 200_000, ci: 31_620, qt: 31_620, bonus: 31_303.8, pay: 316.2 }],
    [A, { relation: "child", age: 40, share: 600_000 }, { bl: 0, ci: 0, qt: 0, bonus: 0, pay: 0 }],
    [A, { relation: "child", age: 50, share: 1_300_000, homeValue: 250_000 }, { bl: 177_393.53, ci: 27_098.71, qt: 27_098.71, bonus: 26_827.72, pay: 270.99 }],
    [A, { relation: "collateral", age: 45, share: 100_000 }, { bl: 90_000, ci: 11_020, qt: 16_530, bonus: 0, pay: 16_530 }],
    [A, { relation: "unrelated", age: 50, share: 100_000 }, { bl: 100_000, ci: 12_620, qt: 23_978, bonus: 0, pay: 23_978 }],
    [V, { relation: "child", age: 30, share: 300_000 }, { bl: 200_000, ci: 31_852.81, qt: 31_852.81, bonus: 31_534.28, pay: 318.53 }],
    [V, { relation: "child", age: 40, share: 400_000, homeValue: 300_000, homeHeirPct: 50 }, { bl: 157_500, ci: 22_821.56, qt: 22_821.56, bonus: 22_593.34, pay: 228.22 }],
    [V, { relation: "collateral", age: 60, share: 100_000 }, { bl: 92_006.54, ci: 11_196.6, qt: 17_782.44, bonus: 4_445.61, pay: 13_336.83 }],
    [V, { relation: "affinity", age: 60, share: 100_000 }, { bl: 92_006.54, ci: 11_196.6, qt: 17_782.44, bonus: 0, pay: 17_782.44 }],
    [V, { relation: "unrelated", age: 50, share: 100_000 }, { bl: 100_000, ci: 12_487.54, qt: 24_975.08, bonus: 0, pay: 24_975.08 }],
    [V, { relation: "unrelated", age: 50, share: 300_000, disability: 65 }, { bl: 60_000, ci: 6_294.8, qt: 12_589.6, bonus: 12_463.7, pay: 125.9 }],
  ];
  for (const [rules, input, want] of cases) {
    const r = pay(rules, input);
    const label = `${rules.id} ${input.relation} ${input.age} ${input.share}`;
    assert.deepEqual({ bl: r.baseLiquidable, ci: r.quotaIntegra, qt: r.quotaTributaria, bonus: r.bonus, pay: r.toPay }, want, label);
  }
});

test("the excess rule just above a prior-wealth bracket (Madrid art. 24.2; Valencia, ATV apartado Q); none in Andalucía", () => {
  const mad = pay(M, { relation: "collateral", age: 60, share: 100_000, priorWealth: 403_500 });
  assert.equal(mad.coefficient, 1.6676);
  assert.equal(mad.excess, 382.53);
  assert.equal(mad.quotaTributaria, 18_152.89);
  assert.equal(mad.toPay, 9_076.44);
  const val = pay(V, { relation: "collateral", age: 60, share: 100_000, priorWealth: 391_000 });
  assert.equal(val.excess, 546.88);
  assert.equal(val.quotaTributaria, 18_124.57);
  assert.equal(val.toPay, 13_593.43);
  // Far above the edge the coefficient applies in full.
  assert.equal(pay(M, { relation: "collateral", age: 60, share: 100_000, priorWealth: 1_000_000 }).excess, 0);
  const and = pay(A, { relation: "collateral", age: 60, share: 100_000, priorWealth: 5_000_000 });
  assert.equal(and.coefficient, 1.5);
  assert.equal(and.excess, 0);
});

test("rebates: Madrid's 50 % covers all of group III; Valencia's 25 % only blood collaterals, its 99 % any disabled heir; Andalucía none for III", () => {
  assert.equal(pay(M, { relation: "affinity", age: 60, share: 100_000 }).bonusPct, 50);
  assert.equal(pay(M, { relation: "distant", age: 60, share: 100_000 }).bonusRule, "none");
  assert.equal(pay(V, { relation: "collateral", age: 60, share: 100_000 }).bonusPct, 25);
  assert.equal(pay(V, { relation: "affinity", age: 60, share: 100_000 }).bonusRule, "none");
  const mental = pay(V, { relation: "unrelated", age: 50, share: 300_000, disability: 33, mentalDisability: true });
  assert.equal(mental.bonusRule, "disability");
  assert.ok(mental.reductions.some((r) => r.id === "disability" && r.amount === V.disability.from65));
  assert.ok(mental.notes.includes("mental-as-65"));
  // Elsewhere the mental flag changes nothing.
  assert.equal(pay(M, { relation: "unrelated", age: 50, share: 300_000, disability: 33, mentalDisability: true }).reductions.find((r) => r.id === "disability")!.amount, M.disability.from33);
  assert.equal(pay(A, { relation: "collateral", age: 45, share: 100_000 }).bonusRule, "none");
  assert.equal(pay(A, { relation: "collateral", age: 45, share: 100_000, disability: 65 }).bonusRule, "none");
  // Group I in Madrid: 16.000 + 4.000 per year under 21, capped at 48.000.
  assert.equal(pay(M, { relation: "child", age: 5, share: 300_000 }).reductions[0]!.amount, 48_000);
  assert.equal(pay(V, { relation: "child", age: 10, share: 300_000 }).reductions[0]!.amount, 156_000);
  assert.equal(pay(V, { relation: "child", age: 18, share: 300_000 }).reductions[0]!.amount, 124_000);
});

test("life insurance and the home: added to the base, reduced only for the direct line; per-heir caps", () => {
  const son = pay(M, { relation: "child", age: 30, share: 100_000, insurance: 50_000 });
  assert.equal(son.baseImposable, 150_000);
  assert.equal(son.reductions.find((r) => r.id === "insurance")!.amount, 9_200);
  const niece = pay(V, { relation: "collateral", age: 30, share: 100_000, insurance: 50_000 });
  assert.equal(niece.baseImposable, 150_000);
  assert.ok(!niece.reductions.some((r) => r.id === "insurance"));
  assert.ok(niece.notes.includes("insurance-relation"));
  assert.equal(pay(A, { relation: "ascendant", age: 70, share: 100_000, insurance: 5_000 }).reductions.find((r) => r.id === "insurance")!.amount, 5_000);
  // Andalucía: 99 % of a 250.000 € home is 247.500 €, capped at the state's 122.606,47 €.
  const home = pay(A, { relation: "child", age: 50, share: 1_300_000, homeValue: 250_000 });
  assert.deepEqual(home.home, { value: 250_000, theoretical: 247_500, cap: STATE_HOME_CAP });
  assert.ok(home.notes.includes("home-capped"));
  // Collaterals: over 65 and two years together, otherwise nothing.
  assert.ok(pay(M, { relation: "collateral", age: 70, share: 200_000, homeValue: 100_000, livedTogether: true }).reductions.some((r) => r.id === "home"));
  assert.ok(pay(M, { relation: "collateral", age: 60, share: 200_000, homeValue: 100_000, livedTogether: true }).notes.includes("home-collateral"));
  assert.ok(pay(V, { relation: "affinity", age: 70, share: 200_000, homeValue: 100_000, livedTogether: true }).notes.includes("home-relation"));
});

test("invalid inputs are named, never computed", () => {
  const ok = regionalInputOf({ relation: "child", age: 30, share: 100_000 });
  assert.deepEqual(calculateRegional(M, { ...ok, share: Number.NaN }), { status: "invalid", reason: "share" });
  assert.deepEqual(calculateRegional(M, { ...ok, share: 0 }), { status: "invalid", reason: "nothing" });
  assert.deepEqual(calculateRegional(A, { ...ok, age: 12.5 }), { status: "invalid", reason: "age" });
  assert.deepEqual(calculateRegional(V, { ...ok, homeValue: 50_000, homeHeirPct: 0 }), { status: "invalid", reason: "home-pct" });
  assert.deepEqual(calculateRegional(V, { ...ok, homeValue: 500_000 }), { status: "invalid", reason: "home-above-share" });
  assert.deepEqual(calculateRegional(M, { ...ok, priorWealth: -1 }), { status: "invalid", reason: "prior" });
});

/* ------------------------------------------------------------------- page */

test("the pages: three editions each in the registry, route files, titles and descriptions that fit, FAQ and labels complete", () => {
  assert.deepEqual(regionEditions("madrid"), { ca: "/ca/calculadores/impost-successions-madrid/", es: "/es/calculadoras/impuesto-sucesiones-madrid/", en: "/en/calculators/madrid-inheritance-tax/" });
  assert.deepEqual(regionEditions("andalucia"), { ca: "/ca/calculadores/impost-successions-andalusia/", es: "/es/calculadoras/impuesto-sucesiones-andalucia/", en: "/en/calculators/andalusia-inheritance-tax/" });
  assert.deepEqual(regionEditions("valencia"), { ca: "/ca/calculadores/impost-successions-comunitat-valenciana/", es: "/es/calculadoras/impuesto-sucesiones-comunidad-valenciana/", en: "/en/calculators/valencia-inheritance-tax/" });
  for (const region of REGION_IDS) {
    assert.equal(REGION_RULES[region].calculatorId, REGION_CALCULATOR[region]);
    for (const l of ISD_LOCALES) {
      const id = REGION_CALCULATOR[region];
      assert.equal(regionEditions(region)[l], calcPath(id, l));
      const route = join("src", "app", "(public)", "[locale]", CALCULATORS_ROOT[l], calculatorSlugs(id)[l], "page.tsx");
      assert.ok(existsSync(join(ROOT, route)), route);
      const src = read(route);
      assert.match(src, /^export const dynamicParams = true;$/m);
      assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
      const m = regionMeta(region, l);
      assert.ok(m.title.length <= 60, `${region} ${l} title: ${m.title.length}`);
      assert.ok(m.description.length <= 160, `${region} ${l} description: ${m.description.length}`);
      assert.ok(!/NaN|undefined/.test(m.description), m.description);
      const faq = regionFaq(region, l);
      assert.ok(faq.length >= 8);
      for (const f of faq) assert.ok(f.q.trim() && f.a.trim() && !/NaN|undefined/.test(f.a), `${region} ${l}: ${f.q}`);
      const p = REGION_PROFILES[region];
      for (const list of [p.changes[l], p.limits[l]]) assert.ok(list.length >= 3 && list.every((x) => x.trim()));
      assert.ok(p.reductionsNote[l].trim() && p.bonusNote[l].trim());
      for (const q of Object.values(p.quotes).flat()) assert.ok(q.text.trim() && q.href.startsWith("https://") && (q.cite || q.label?.[l]));
      for (const note of ["insurance-relation", "home-relation", "home-collateral", "home-capped", "mental-as-65", "declared-on-time"] as const) assert.ok(regionalNote(note, REGION_RULES[region], l).trim());
    }
  }
  for (const l of ISD_LOCALES) {
    for (const r of RELATIONS) assert.ok(REGIONAL_RELATION_LABEL[r][l].trim());
    assert.ok(Object.values(REGIONAL_CALC_COPY[l].invalid).every((t) => t.trim()));
  }
  // The descriptions carry the engine's figures.
  assert.match(regionMeta("madrid", "es").description, /513,51 €/);
  assert.match(regionMeta("andalucia", "es").description, /316,20 €/);
  assert.match(regionMeta("valencia", "es").description, /318,53 €/);
  // The server renders each page's first example.
  assert.equal(calculateRegionalOk(M, regionDefaultInput("madrid")).toPay, 513.51);
  assert.equal(regionExample("valencia", "brother").toPay, 13_336.83);
  const entries = regionSitemapEntries();
  assert.equal(entries.length, 9);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
});

test("the pages are wired: hub cards in the taxes group, analytics ids, YMYL disclaimer, official links, the four pages link each other", () => {
  const taxes = HUB_GROUPS.find((g) => g.id === "taxes")!;
  for (const region of REGION_IDS) {
    const card = taxes.cards.find((c) => c.key === REGION_CALCULATOR[region]);
    assert.equal(card?.scope, region);
    assert.equal(card?.checked, RULES_AS_OF);
    assert.ok(CALCULATOR_USE_IDS.includes(REGION_CALCULATOR[region]));
  }
  const body = read("src/components/programmatic/inheritance-tax/RegionalInheritanceTaxBody.tsx");
  assert.match(body, /<RegionalInheritanceTaxCalculator locale=\{locale\} rules=\{rules\} initial=\{regionDefaultInput\(region\)\} \/>/);
  assert.match(body, /Estimació orientativa per a un hereu/);
  assert.match(body, /Estimación orientativa para un heredero/);
  assert.match(body, /An estimate for one heir/);
  assert.match(body, /profile\.info/);
  assert.match(body, /profile\.file/);
  assert.match(body, /<InheritanceByRegion current=\{rules\.calculatorId\}/);
  assert.match(read("src/components/programmatic/inheritance-tax/RegionalInheritanceTaxCalculator.tsx"), /useCalculatorUse\(rules\.calculatorId/);
  assert.match(read("src/components/programmatic/inheritance-tax/InheritanceTaxPage.tsx"), /<InheritanceByRegion current="inheritance-tax" locale=\{locale\} \/>/);
  assert.deepEqual(INHERITANCE_FAMILY.map((f) => f.id), ["inheritance-tax", "inheritance-tax-madrid", "inheritance-tax-andalucia", "inheritance-tax-valencia"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.isdRegionSitemapEntries\(\)/);
  // The client gets the numbers as a prop, never the quotes.
  assert.doesNotMatch(read("src/components/programmatic/inheritance-tax/RegionalInheritanceTaxCalculator.tsx"), /regions\/(profiles|madrid|andalucia|valencia)/);
});
