import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, calcPath, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { GIFT_CALCULATOR, GIFT_CALC_COPY, GIFT_FAMILY, GIFT_KIND_LABEL, GIFT_OF_INHERITANCE, INHERITANCE_OF, giftEditions, giftFormLabels, giftNote, giftRelationLabel } from "../src/lib/programmatic/gift-tax/copy.ts";
import { calculateGift, calculateGiftOk, giftGroupOf, giftInputOf, giftKinship, type GiftNote } from "../src/lib/programmatic/gift-tax/engine.ts";
import { GIFT_EXAMPLES, GIFT_RULES, giftDefaultInput, giftExample, giftFaq, giftMeta, giftSitemapEntries } from "../src/lib/programmatic/gift-tax/page.ts";
import { GIFT_PROFILES } from "../src/lib/programmatic/gift-tax/profiles.ts";
import { ANDALUCIA_GIFT_QUOTE, ANDALUCIA_GIFT_RULES, ANDALUCIA_GIFT_SOURCES } from "../src/lib/programmatic/gift-tax/regions/andalucia.ts";
import { CATALONIA_GIFT_QUOTE, CATALONIA_GIFT_RULES, CATALONIA_GIFT_SOURCES } from "../src/lib/programmatic/gift-tax/regions/catalonia.ts";
import { MADRID_GIFT_QUOTE, MADRID_GIFT_RULES, MADRID_GIFT_SOURCES } from "../src/lib/programmatic/gift-tax/regions/madrid.ts";
import { ACCUMULATION_YEARS, GIFT_STATE_QUOTE, GIFT_STATE_SOURCES, RULES_AS_OF, RULES_UNTIL, STATE_DEADLINE_WORKING_DAYS, STATE_FIRST_BRACKET } from "../src/lib/programmatic/gift-tax/regions/state.ts";
import { GIFT_KINDS, GIFT_REGION_IDS, GIFT_RELATIONS, type GiftRules } from "../src/lib/programmatic/gift-tax/regions/types.ts";
import { VALENCIA_GIFT_DATES, VALENCIA_GIFT_QUOTE, VALENCIA_GIFT_RULES, VALENCIA_GIFT_SOURCES } from "../src/lib/programmatic/gift-tax/regions/valencia.ts";
import { ISD_LOCALES } from "../src/lib/programmatic/inheritance-tax/copy.ts";

/**
 * The four gift tax calculators (lib/programmatic/gift-tax): every figure
 * against the quoted words of each law, the engine against the agencies'
 * own worked examples (the ATC's cases 1-8 and 11, the Comunidad de
 * Madrid's two, the Agencia Tributaria de Andalucía's two) and against hand
 * calculations done outside the engine (Python Decimal, half-up, from the
 * quoted scales, 19 Nov 2026), the formal requirements, the pages, and the
 * date from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
/** "250.000" / "402.678,11" as the bulletins print them. */
const es = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

const C = CATALONIA_GIFT_RULES;
const M = MADRID_GIFT_RULES;
const A = ANDALUCIA_GIFT_RULES;
const V = VALENCIA_GIFT_RULES;
const pay = (rules: GiftRules, partial: Parameters<typeof giftInputOf>[0]) => calculateGiftOk(rules, giftInputOf(partial));

/* ------------------------------------------------------------------ rules */

test("state rules for gifts are in the words of Ley 29/1987, RD 1629/1991 and Ley 22/2009", () => {
  assert.match(GIFT_STATE_QUOTE.taxpayer, /el donatario/);
  assert.match(GIFT_STATE_QUOTE.base, /el valor neto de los bienes y derechos adquiridos/);
  assert.match(GIFT_STATE_QUOTE.noReductions, /la base liquidable coincidirá, en todo caso, con la imponible/);
  assert.match(GIFT_STATE_QUOTE.accumulation, /dentro del plazo de tres años/);
  assert.equal(ACCUMULATION_YEARS, 3);
  assert.match(GIFT_STATE_QUOTE.accumulation, /el tipo medio correspondiente a la base liquidable teórica/);
  assert.match(GIFT_STATE_QUOTE.averageRate, /hasta dos decimales/);
  assert.match(GIFT_STATE_QUOTE.deadline, /treinta días hábiles/);
  assert.equal(STATE_DEADLINE_WORKING_DAYS, 30);
  assert.match(GIFT_STATE_QUOTE.realEstate, /donaciones de bienes inmuebles, cuando éstos radiquen/);
  assert.match(GIFT_STATE_QUOTE.otherAssets, /donde el donatario tenga su residencia habitual/);
});

test("Catalonia: every figure is in the words of the Codi tributari (arts. 632-20, 632-21, 633-2) and the Reglament", () => {
  const h = C.home!;
  assert.match(CATALONIA_GIFT_QUOTE.home, new RegExp(`reducció del ${h.percent}%.*reducció màxima de ${es(h.cap)} euros, límit que es fixa en ${es(h.capDisability)} euros.*igual o superior al ${h.capDisabilityFrom}%`));
  assert.match(CATALONIA_GIFT_QUOTE.homeAge, /no pot tenir més de trenta-sis anys, llevat que tingui un grau de discapacitat igual o superior al 65%/);
  assert.equal(h.maxAge, 36);
  assert.equal(h.ageWaivedFrom, 65);
  assert.match(CATALONIA_GIFT_QUOTE.homeIncome, /a 36\.000 euros/);
  assert.match(CATALONIA_GIFT_QUOTE.homeSixMonths, /en el termini de sis mesos/);
  assert.match(CATALONIA_GIFT_QUOTE.homeCash, /en el termini d'un mes a comptar del lliurament dels diners/);
  assert.match(CATALONIA_GIFT_QUOTE.reducedScale, /a favor de contribuents dels grups I i II/);
  assert.match(CATALONIA_GIFT_QUOTE.reducedScaleDeed, /escriptura pública o sentència judicial/);
  assert.match(CATALONIA_GIFT_QUOTE.reducedScaleMonth, /En el termini d'un mes a comptar de la data de lliurament del bé/);
  assert.deepEqual(C.reducedScale, [{ from: 0, quota: 0, rate: 5 }, { from: 200_000, quota: 10_000, rate: 7 }, { from: 600_000, quota: 38_000, rate: 9 }]);
  assert.match(CATALONIA_GIFT_QUOTE.deadline, /en el termini d'un mes comptador des de la data d'atorgament de l'acte/);
  assert.deepEqual(C.deadline, { months: 1 });
  assert.equal(C.bonus, null);
  assert.equal(C.kinship, null);
});

test("Madrid: every figure is in the words of Decreto Legislativo 1/2010 (arts. 22 bis, 25.2)", () => {
  const h = M.home!;
  assert.match(MADRID_GIFT_QUOTE.cash, new RegExp(`reducción del 100 por cien de la donación recibida, con el límite máximo de ${es(h.cap)} euros`));
  assert.match(MADRID_GIFT_QUOTE.cash, /grupos I o II.*colateral de segundo grado por consanguinidad/);
  assert.match(MADRID_GIFT_QUOTE.cashPurpose, /en el plazo de un año desde la donación.* vivienda que tenga la consideración de habitual/);
  assert.match(MADRID_GIFT_QUOTE.cashDocument, new RegExp(`superior a ${es(h.deedAbove!)} euros`));
  const b = M.bonus!;
  assert.match(MADRID_GIFT_QUOTE.smallGift, new RegExp(`no supere los ${es(b.smallGiftMax!)} euros aplicarán una bonificación del 100 por cien`));
  assert.match(MADRID_GIFT_QUOTE.smallGiftNoFiling, /no estarán obligados a presentar autoliquidación/);
  assert.match(MADRID_GIFT_QUOTE.bonusGroupsIandII, new RegExp(`bonificación del ${b.groupsIandII} por ciento`));
  assert.match(MADRID_GIFT_QUOTE.bonusGroupIII, new RegExp(`grupo III.*bonificación del ${b.groupIII} por ciento`));
  assert.match(MADRID_GIFT_QUOTE.publicDocument, new RegExp(`superior a ${es(b.deedAbove)} euros`));
  assert.match(MADRID_GIFT_QUOTE.fundsOrigin, /el origen de los fondos donados esté debidamente justificado/);
  assert.match(MADRID_GIFT_QUOTE.agencyDeadline, /30 días hábiles/);
  assert.deepEqual(M.deadline, { workingDays: 30 });
});

test("Andalucía: every figure is in the words of Ley 5/2021 (arts. 32, 33, 40, 68) and the ATRIAN guide", () => {
  const h = A.home!;
  assert.match(ANDALUCIA_GIFT_QUOTE.cashHome, new RegExp(`reducción propia del ${h.percent}% del importe de la base imponible`));
  assert.match(ANDALUCIA_GIFT_QUOTE.homeGift, new RegExp(`pleno dominio de un inmueble.*reducción propia del ${h.percent}%`));
  assert.match(ANDALUCIA_GIFT_QUOTE.homeCap, new RegExp(`base máxima de la reducción será ${es(h.cap)} euros.* no podrá exceder de ${es(h.capDisability)} euros`));
  assert.match(ANDALUCIA_GIFT_QUOTE.cashHomeWho, /Ser menor de 35 años/);
  assert.equal(h.maxAge, 34);
  assert.match(ANDALUCIA_GIFT_QUOTE.cashHomePrior, /primer tramo de la escala establecida por el artículo 22/);
  assert.equal(h.priorWealthMax, STATE_FIRST_BRACKET);
  const b = A.bonus!;
  assert.match(ANDALUCIA_GIFT_QUOTE.bonus, new RegExp(`Grupos I y II.*bonificación del ${b.groupsIandII}% en la cuota tributaria derivada de adquisiciones inter vivos`));
  assert.match(ANDALUCIA_GIFT_QUOTE.bonusDocument, new RegExp(`superior a ${es(b.deedAbove)} euros`));
  assert.match(ANDALUCIA_GIFT_QUOTE.bonusCash, new RegExp(`superior a ${es(b.fundsOriginAbove)} euros.*plazo máximo de un mes`));
  assert.match(ANDALUCIA_GIFT_QUOTE.deadline, /será de dos meses a contar desde el día siguiente a la fecha del devengo/);
  assert.deepEqual(A.deadline, { months: 2 });
  assert.match(ANDALUCIA_GIFT_QUOTE.guideExampleResult, /12\.620/);
  assert.match(ANDALUCIA_GIFT_QUOTE.guideExamplePay, /126,2 euros/);
  assert.match(ANDALUCIA_GIFT_QUOTE.guideAccumulationPay, /14,73 euros/);
});

test("Comunitat Valenciana: every figure is in the words of Ley 13/1997 (arts. 10 bis, 12 bis, 12 ter)", () => {
  const k = V.kinship!;
  assert.match(VALENCIA_GIFT_QUOTE.kinship, new RegExp(`hijos o adoptados menores de 21 años: ${es(k.under21.base)} euros, más ${es(k.under21.perYear)} euros.*exceder de ${es(k.under21.max)} euros`));
  assert.match(VALENCIA_GIFT_QUOTE.kinship, new RegExp(`por el cónyuge, padres o adoptantes: ${es(k.adult)} euros`));
  assert.match(VALENCIA_GIFT_QUOTE.kinship, /nietos de 21 o más años: 100\.000 euros\. – Adquisiciones por abuelos: 100\.000 euros/);
  assert.match(VALENCIA_GIFT_QUOTE.kinshipFiveYears, /cinco años inmediatamente anteriores/);
  const d = V.disability!;
  assert.match(VALENCIA_GIFT_QUOTE.disability, new RegExp(`reducción a la base imponible de ${es(d.from65)} euros.* reducción de ${es(d.from33)} euros`));
  assert.match(VALENCIA_GIFT_QUOTE.smallDigital, /no exceda de 4\.000 euros.*documentos firmados digitalmente/);
  const b = V.bonus!;
  assert.match(VALENCIA_GIFT_QUOTE.bonusLead, new RegExp(`bonificación del ${b.groupsIandII} por 100`));
  assert.match(VALENCIA_GIFT_QUOTE.bonusDirect, /cónyuge, padres, adoptantes, hijos o adoptados del donante\. Igual bonificación resultará aplicable a los nietos y a los abuelos/);
  assert.match(VALENCIA_GIFT_QUOTE.bonusGroupIIILead, new RegExp(`bonificación del ${b.groupIII} por 100`));
  assert.match(VALENCIA_GIFT_QUOTE.bonusGroupIII, /colaterales consanguíneos de segundo y tercer grado/);
  assert.match(VALENCIA_GIFT_QUOTE.bonusGroupIIINext, new RegExp(`bonificación del ${VALENCIA_GIFT_DATES.groupIIIBonusNext} por 100`));
  assert.match(VALENCIA_GIFT_QUOTE.deadline, /en el de un mes, contado desde el día en que se cause el acto/);
  assert.deepEqual(V.deadline, { months: 1 });
  assert.match(VALENCIA_GIFT_QUOTE.atvNoExtension, /no en el de donaciones/);
});

test("the reduced Catalan scale adds up: each row's quota is the row before plus its rate, to the cent", () => {
  const rows = C.reducedScale!;
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1]!;
    assert.equal(Math.round((prev.quota + ((rows[i]!.from - prev.from) * prev.rate) / 100) * 100) / 100, rows[i]!.quota);
  }
});

test("every source is an official one, over https, read on the rules' date", () => {
  const sources = [...Object.values(GIFT_STATE_SOURCES), ...Object.values(CATALONIA_GIFT_SOURCES), ...Object.values(MADRID_GIFT_SOURCES), ...Object.values(ANDALUCIA_GIFT_SOURCES), ...Object.values(VALENCIA_GIFT_SOURCES)];
  for (const src of sources) {
    assert.match(src.url, /^https:\/\/(www\.boe\.es|portaljuridic\.gencat\.cat|atc\.gencat\.cat|www\.comunidad\.madrid|www\.juntadeandalucia\.es|atv\.gva\.es)\//, src.url);
    if ("urlCa" in src && src.urlCa) assert.match(src.urlCa, /^https:\/\/atv\.gva\.es\/va\//, src.urlCa);
    if ("urlEs" in src && src.urlEs) assert.match(src.urlEs, /^https:\/\/atc\.gencat\.cat\/es\//, src.urlEs);
    assert.equal(src.read, RULES_AS_OF);
  }
});

test(`date guard: the four communities' gift rules are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF < RULES_UNTIL);
  // The Valencian 50 % for group III starts after the guard: the page announces it, the calculator applies the 25 %.
  assert.ok(RULES_UNTIL < VALENCIA_GIFT_DATES.groupIIIBonusNextFrom);
  assert.ok(
    today() < RULES_UNTIL,
    "Gift tax: re-read the Codi tributari (Portal Jurídic, Títol III cap. II-III) and Decret 414/2011, the BOE consolidated texts (BOCM-m-2010-90068 arts. 22-26, BOE-A-2021-17915 arts. 32-40 and 68, BOE-A-1998-8202 arts. 10 bis-12 ter), the 2027 budget and fiscal-measures laws (DOGC, BOCM, BOJA, DOGV) and the agencies' pages; update gift-tax/regions/*.ts, then move RULES_AS_OF and RULES_UNTIL in gift-tax/regions/state.ts.",
  );
});

/* ----------------------------------------------------------------- engine */

test("the agencies' own worked examples come out to the cent", () => {
  let n = 0;
  for (const region of GIFT_REGION_IDS) {
    for (const e of GIFT_EXAMPLES[region].filter((x) => x.official)) {
      const r = calculateGiftOk(GIFT_RULES[region], e.input);
      assert.equal(r.quotaTributaria, e.official!.quota, `${region} ${e.id} quota`);
      assert.equal(r.toPay, e.official!.toPay, `${region} ${e.id} to pay`);
      n++;
    }
  }
  assert.equal(n, 13);
  // The ATC's printed steps: reduced scale, the 38.000 € and 60.000 € reductions, the coefficient, the 5,40 % average rate.
  assert.equal(giftExample("catalonia", "atc-1").scaleUsed, "reduced");
  assert.equal(giftExample("catalonia", "atc-2").scaleUsed, "general");
  assert.equal(giftExample("catalonia", "atc-4").reductions[0]!.amount, 38_000);
  assert.equal(giftExample("catalonia", "atc-5").reductions[0]!.amount, 60_000);
  assert.equal(giftExample("catalonia", "atc-6").quotaIntegra, 6_800);
  assert.equal(giftExample("catalonia", "atc-6").coefficient, 1.5882);
  assert.equal(giftExample("catalonia", "atc-11").accumulation!.averageRate, 5.4);
  assert.match(CATALONIA_GIFT_QUOTE.atcExample11, /5,40 %/);
  // Madrid: the 200.000 € home and the 16,9 % rate of the accumulated garage.
  assert.match(MADRID_GIFT_QUOTE.agencyExample, /200\.000 €.* cuota tributaria de 31\.621,21 €.* solo pagaría 316,21 €/);
  assert.equal(giftExample("madrid", "official-garage").accumulation!.theoreticalQuota, 41_405.98);
  assert.equal(giftExample("madrid", "official-garage").accumulation!.averageRate, 16.9);
  assert.match(MADRID_GIFT_QUOTE.agencyAccumulationRate, /41\.405,98\/ 245\.000 = 16,9 %/);
  assert.match(MADRID_GIFT_QUOTE.agencyAccumulationResult, /16,90 €/);
  // Andalucía: the 12.620 € cuota and the 9,82 % average rate.
  assert.equal(giftExample("andalucia", "official-100k").quotaIntegra, 12_620);
  assert.equal(giftExample("andalucia", "official-accumulated").accumulation!.averageRate, 9.82);
});

test("hand-calculated cases come out to the cent (Python Decimal from the quoted scales)", () => {
  const cases: [GiftRules, Parameters<typeof giftInputOf>[0], { bl: number; qt: number; bonus: number; pay: number }][] = [
    [C, { relation: "child", age: 35, amount: 100_000 }, { bl: 100_000, qt: 5_000, bonus: 0, pay: 5_000 }],
    [C, { relation: "child", age: 35, amount: 700_000 }, { bl: 700_000, qt: 47_000, bonus: 0, pay: 47_000 }],
    [C, { relation: "grandchild", age: 30, amount: 50_000, forHome: true }, { bl: 2_500, qt: 125, bonus: 0, pay: 125 }],
    [M, { relation: "child", age: 35, amount: 100_000 }, { bl: 100_000, qt: 12_407.03, bonus: 12_282.96, pay: 124.07 }],
    [M, { relation: "child", age: 35, amount: 50_000, publicDeed: false }, { bl: 50_000, qt: 4_944.22, bonus: 0, pay: 4_944.22 }],
    [M, { relation: "child", age: 35, amount: 8_000, publicDeed: false }, { bl: 8_000, qt: 612, bonus: 605.88, pay: 6.12 }],
    [M, { relation: "sibling", age: 50, amount: 50_000 }, { bl: 50_000, qt: 7_852.41, bonus: 3_926.21, pay: 3_926.2 }],
    [M, { relation: "unrelated", age: 40, amount: 30_000 }, { bl: 30_000, qt: 5_298.6, bonus: 0, pay: 5_298.6 }],
    [M, { relation: "child", age: 30, amount: 300_000, forHome: true }, { bl: 50_000, qt: 4_944.22, bonus: 4_894.78, pay: 49.44 }],
    [M, { relation: "sibling", age: 50, amount: 50_000, priorWealth: 403_500 }, { bl: 50_000, qt: 8_244.98, bonus: 4_122.49, pay: 4_122.49 }],
    [A, { relation: "child", age: 30, amount: 120_000, forHome: true }, { bl: 1_200, qt: 84, bonus: 83.16, pay: 0.84 }],
    [A, { relation: "child", age: 30, amount: 200_000, forHome: true }, { bl: 51_500, qt: 5_230, bonus: 5_177.7, pay: 52.3 }],
    [A, { relation: "child", age: 30, amount: 3_000, publicDeed: false, fundsOrigin: false }, { bl: 3_000, qt: 210, bonus: 207.9, pay: 2.1 }],
    [A, { relation: "child", age: 30, amount: 20_000, publicDeed: false }, { bl: 20_000, qt: 1_620, bonus: 0, pay: 1_620 }],
    [A, { relation: "nephew", age: 40, amount: 50_000 }, { bl: 50_000, qt: 7_530, bonus: 0, pay: 7_530 }],
    [A, { relation: "unrelated", age: 40, amount: 50_000 }, { bl: 50_000, qt: 9_538, bonus: 0, pay: 9_538 }],
    [V, { relation: "child", age: 30, amount: 300_000 }, { bl: 200_000, qt: 31_852.81, bonus: 31_534.28, pay: 318.53 }],
    [V, { relation: "grandchild", age: 15, amount: 200_000 }, { bl: 52_000, qt: 5_230.75, bonus: 5_178.44, pay: 52.31 }],
    [V, { relation: "child", age: 30, amount: 50_000, publicDeed: false }, { bl: 50_000, qt: 4_975.75, bonus: 0, pay: 4_975.75 }],
    [V, { relation: "sibling", age: 60, amount: 100_000 }, { bl: 100_000, qt: 19_832.71, bonus: 4_958.18, pay: 14_874.53 }],
    [V, { relation: "affinity", age: 60, amount: 100_000 }, { bl: 100_000, qt: 19_832.71, bonus: 0, pay: 19_832.71 }],
    [V, { relation: "unrelated", age: 50, amount: 300_000, disability: 65 }, { bl: 60_000, qt: 12_589.6, bonus: 12_463.7, pay: 125.9 }],
    [V, { relation: "unrelated", age: 50, amount: 100_000 }, { bl: 100_000, qt: 24_975.08, bonus: 0, pay: 24_975.08 }],
    [V, { relation: "child", age: 30, amount: 300_000, disability: 33 }, { bl: 80_000, qt: 9_257.54, bonus: 9_164.96, pay: 92.58 }],
  ];
  for (const [rules, input, want] of cases) {
    const r = pay(rules, input);
    const label = `${rules.id} ${input.relation} ${input.age} ${input.amount}`;
    assert.deepEqual({ bl: r.baseLiquidable, qt: r.quotaTributaria, bonus: r.bonus, pay: r.toPay }, want, label);
  }
});

test("groups and Valencian kinship reductions follow the state's art. 20.2.a and art. 10 bis.2.a", () => {
  assert.equal(giftGroupOf("child", 20), "I");
  assert.equal(giftGroupOf("grandchild", 21), "II");
  assert.equal(giftGroupOf("grandparent", 80), "II");
  assert.equal(giftGroupOf("nephew", 10), "III");
  assert.equal(giftGroupOf("affinity", 40), "III");
  assert.equal(giftGroupOf("distant", 40), "IV");
  assert.equal(giftKinship(V, "grandchild", 15), 148_000);
  assert.equal(giftKinship(V, "child", 5), 156_000);
  assert.equal(giftKinship(V, "spouse", 60), 100_000);
  assert.equal(giftKinship(V, "sibling", 40), 0);
  assert.equal(giftKinship(M, "child", 30), 0);
});

test("the excess rule just above a prior-wealth bracket (Catalonia, ATC note; Ley 29/1987 art. 22.2)", () => {
  const r = pay(C, { relation: "child", age: 35, amount: 275_000, priorWealth: 500_100 });
  assert.equal(r.coefficient, 1.1);
  assert.equal(r.excess, 1_425);
  assert.equal(r.quotaTributaria, 15_350);
  assert.equal(pay(C, { relation: "child", age: 35, amount: 275_000, priorWealth: 1_000_000 }).excess, 0);
});

const notes = (rules: GiftRules, partial: Parameters<typeof giftInputOf>[0]): GiftNote[] => pay(rules, partial).notes;

test("formal requirements: public document, origin of cash and the thresholds of each community", () => {
  // Catalonia: no deed, general scale.
  assert.ok(notes(C, { relation: "child", age: 35, amount: 100_000, publicDeed: false }).includes("reduced-scale-deed"));
  assert.equal(pay(C, { relation: "sibling", age: 40, amount: 80_000 }).scaleUsed, "general");
  // Madrid: up to 10.000 € in three years a private document keeps the 99 %; above, it does not.
  assert.equal(pay(M, { relation: "child", age: 30, amount: 10_000, publicDeed: false }).bonusRule, "groups-i-ii");
  assert.equal(pay(M, { relation: "child", age: 30, amount: 10_000.01, publicDeed: false }).bonusRule, "none");
  assert.ok(notes(M, { relation: "child", age: 30, amount: 6_000, previousGifts: 5_000, publicDeed: false }).includes("bonus-deed"));
  // Madrid: cash without the origin of the funds loses the rebate, a home does not need it.
  assert.ok(notes(M, { relation: "child", age: 30, amount: 50_000, fundsOrigin: false }).includes("bonus-funds"));
  assert.equal(pay(M, { relation: "child", age: 30, amount: 50_000, kind: "home", fundsOrigin: false }).bonusPct, 99);
  // Madrid: up to 1.000 € in three years, 100 % for anyone and nothing to file.
  const small = pay(M, { relation: "unrelated", age: 40, amount: 800, publicDeed: false, fundsOrigin: false });
  assert.equal(small.bonusRule, "small");
  assert.equal(small.toPay, 0);
  assert.ok(small.notes.includes("small-gift"));
  assert.equal(pay(M, { relation: "unrelated", age: 40, amount: 800, previousGifts: 300 }).bonusRule, "none");
  // Andalucía: 5.000 € in three years is the line.
  assert.equal(pay(A, { relation: "child", age: 30, amount: 5_000, publicDeed: false, fundsOrigin: false }).bonusPct, 99);
  assert.equal(pay(A, { relation: "child", age: 30, amount: 5_000.01, publicDeed: false }).bonusRule, "none");
  assert.ok(notes(A, { relation: "child", age: 30, amount: 20_000, fundsOrigin: false }).includes("bonus-funds"));
  assert.equal(pay(A, { relation: "nephew", age: 30, amount: 20_000 }).bonusRule, "none");
  // Valencia: no public document, no reduction and no rebate (one note says both).
  const priv = notes(V, { relation: "child", age: 30, amount: 50_000, publicDeed: false });
  assert.ok(priv.includes("reductions-deed"));
  assert.ok(!priv.includes("bonus-deed"));
  assert.ok(notes(V, { relation: "child", age: 30, amount: 150_000, fundsOrigin: false }).includes("reductions-funds"));
  // Valencia: 99 % for any donee with a 65 % disability (or mental 33 %), 25 % only for blood collaterals.
  assert.equal(pay(V, { relation: "unrelated", age: 40, amount: 300_000, disability: 33, mentalDisability: true }).bonusRule, "disability");
  assert.equal(pay(V, { relation: "nephew", age: 40, amount: 100_000 }).bonusPct, 25);
  assert.equal(pay(V, { relation: "affinity", age: 40, amount: 100_000 }).bonusRule, "none");
  // The rebate is only on what is declared on time.
  assert.ok(notes(V, { relation: "child", age: 30, amount: 300_000 }).includes("declared-on-time"));
});

test("the habitual-home reductions: who, how old, which gift, the caps", () => {
  // Catalonia: descendants up to 36, unless a 65 % disability (then 120.000 € cap).
  assert.ok(notes(C, { relation: "child", age: 37, amount: 50_000, forHome: true }).includes("home-age"));
  const disabled = pay(C, { relation: "child", age: 40, amount: 200_000, forHome: true, disability: 65 });
  assert.equal(disabled.reductions[0]!.amount, 120_000);
  assert.ok(notes(C, { relation: "sibling", age: 30, amount: 50_000, forHome: true }).includes("home-relation"));
  assert.ok(notes(C, { relation: "child", age: 30, amount: 50_000, forHome: true, kind: "other" }).includes("home-kind"));
  const noDeed = notes(C, { relation: "child", age: 30, amount: 50_000, forHome: true, publicDeed: false });
  assert.ok(noDeed.includes("home-deed") && noDeed.includes("reduced-scale-deed"));
  // Madrid: cash only, groups I-II and siblings, 250.000 € cap, a public document above 10.000 €.
  assert.equal(pay(M, { relation: "sibling", age: 40, amount: 100_000, forHome: true }).baseLiquidable, 0);
  assert.ok(notes(M, { relation: "nephew", age: 40, amount: 100_000, forHome: true }).includes("home-relation"));
  assert.ok(notes(M, { relation: "child", age: 30, amount: 300_000, forHome: true }).includes("home-capped"));
  assert.ok(notes(M, { relation: "child", age: 30, amount: 50_000, forHome: true, publicDeed: false }).includes("home-deed"));
  assert.equal(pay(M, { relation: "child", age: 30, amount: 9_000, forHome: true, publicDeed: false }).baseLiquidable, 0);
  // Andalucía: under 35 or disabled, prior wealth in the first bracket, the home itself needs the deed.
  assert.ok(notes(A, { relation: "child", age: 35, amount: 100_000, forHome: true }).includes("home-age"));
  assert.equal(pay(A, { relation: "child", age: 40, amount: 300_000, forHome: true, disability: 33 }).reductions[0]!.amount, 247_500);
  assert.ok(notes(A, { relation: "child", age: 30, amount: 100_000, forHome: true, priorWealth: 402_678.12 }).includes("home-prior"));
  assert.ok(notes(A, { relation: "child", age: 30, amount: 100_000, forHome: true, kind: "home", publicDeed: false }).includes("home-deed"));
  assert.equal(pay(A, { relation: "child", age: 30, amount: 100_000, forHome: true, publicDeed: false, fundsOrigin: false }).reductions[0]!.amount, 99_000);
  // Valencia has no general home reduction: the flag changes nothing.
  assert.deepEqual(pay(V, { relation: "child", age: 30, amount: 300_000, forHome: true }).reductions.map((r) => r.id), ["kinship"]);
});

test("invalid inputs are named, never computed", () => {
  const ok = giftInputOf({ relation: "child", age: 30, amount: 100_000 });
  assert.deepEqual(calculateGift(M, { ...ok, amount: 0 }), { status: "invalid", reason: "amount" });
  assert.deepEqual(calculateGift(M, { ...ok, amount: Number.NaN }), { status: "invalid", reason: "amount" });
  assert.deepEqual(calculateGift(C, { ...ok, age: 12.5 }), { status: "invalid", reason: "age" });
  assert.deepEqual(calculateGift(A, { ...ok, priorWealth: -1 }), { status: "invalid", reason: "prior" });
  assert.deepEqual(calculateGift(V, { ...ok, previousGifts: Number.NaN }), { status: "invalid", reason: "previous" });
});

/* ------------------------------------------------------------------- page */

test("the pages: three editions each in the registry, route files, titles and descriptions that fit, FAQ and labels complete", () => {
  assert.deepEqual(giftEditions("catalonia"), { ca: "/ca/calculadores/impost-donacions-catalunya/", es: "/es/calculadoras/impuesto-donaciones-cataluna/", en: "/en/calculators/catalonia-gift-tax/" });
  assert.deepEqual(giftEditions("madrid"), { ca: "/ca/calculadores/impost-donacions-madrid/", es: "/es/calculadoras/impuesto-donaciones-madrid/", en: "/en/calculators/madrid-gift-tax/" });
  assert.deepEqual(giftEditions("andalucia"), { ca: "/ca/calculadores/impost-donacions-andalusia/", es: "/es/calculadoras/impuesto-donaciones-andalucia/", en: "/en/calculators/andalusia-gift-tax/" });
  assert.deepEqual(giftEditions("valencia"), { ca: "/ca/calculadores/impost-donacions-comunitat-valenciana/", es: "/es/calculadoras/impuesto-donaciones-comunidad-valenciana/", en: "/en/calculators/valencia-gift-tax/" });
  for (const region of GIFT_REGION_IDS) {
    const rules = GIFT_RULES[region];
    assert.equal(rules.calculatorId, GIFT_CALCULATOR[region]);
    for (const l of ISD_LOCALES) {
      const id = GIFT_CALCULATOR[region];
      assert.equal(giftEditions(region)[l], calcPath(id, l));
      const route = join("src", "app", "(public)", "[locale]", CALCULATORS_ROOT[l], calculatorSlugs(id)[l], "page.tsx");
      assert.ok(existsSync(join(ROOT, route)), route);
      const src = read(route);
      assert.match(src, /^export const dynamicParams = true;$/m);
      assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
      const m = giftMeta(region, l);
      assert.ok(m.title.length <= 60, `${region} ${l} title: ${m.title.length}`);
      assert.ok(m.description.length <= 160, `${region} ${l} description: ${m.description.length} ${m.description}`);
      assert.ok(!/NaN|undefined/.test(m.description), m.description);
      const faq = giftFaq(region, l);
      assert.ok(faq.length >= 8);
      for (const f of faq) assert.ok(f.q.trim() && f.a.trim() && !/NaN|undefined/.test(f.a), `${region} ${l}: ${f.q}`);
      const p = GIFT_PROFILES[region];
      for (const list of [p.changes[l], p.limits[l], p.requirements[l]]) assert.ok(list.length >= 3 && list.every((x) => x.trim()));
      assert.ok(p.reductionsNote[l].trim() && p.bonusNote[l].trim());
      for (const q of Object.values(p.quotes).flat()) assert.ok(q.text.trim() && q.href.startsWith("https://") && (q.cite || q.label?.[l]));
      // The notes each community's engine can produce.
      const all: GiftNote[] = ["accumulated"];
      if (rules.reducedScale) all.push("reduced-scale-deed");
      if (rules.bonus) all.push("bonus-deed", "bonus-funds", "declared-on-time");
      if (rules.bonus?.smallGiftMax) all.push("small-gift");
      if (rules.kinship) all.push("reductions-deed", "reductions-funds", "five-years", "mental-as-65");
      if (rules.home) all.push("home-kind", "home-relation", "home-deed", "home-capped", "home-conditions");
      if (rules.home?.maxAge) all.push("home-age");
      if (rules.home?.priorWealthMax) all.push("home-prior");
      for (const note of all) assert.ok(giftNote(note, rules, l).trim() && !/NaN|undefined/.test(giftNote(note, rules, l)), `${region} ${l} ${note}`);
      for (const r of GIFT_RELATIONS) assert.ok(giftRelationLabel(region, r, l).trim());
      const f = giftFormLabels(region, l);
      assert.ok(f.deed.trim() && f.funds.trim());
      assert.equal(f.home === null, rules.home === null);
    }
  }
  for (const l of ISD_LOCALES) {
    for (const k of GIFT_KINDS) assert.ok(GIFT_KIND_LABEL[k][l].trim());
    assert.ok(Object.values(GIFT_CALC_COPY[l].invalid).every((t) => t.trim()));
  }
  // The descriptions carry the engine's figures.
  assert.match(giftMeta("catalonia", "es").description, /15\.250 €.*35\.750 €/);
  assert.match(giftMeta("madrid", "es").description, /124,07 €/);
  assert.match(giftMeta("andalucia", "es").description, /126,20 €/);
  assert.match(giftMeta("valencia", "es").description, /318,53 €/);
  // The server renders each page's first example.
  assert.equal(calculateGiftOk(C, giftDefaultInput("catalonia")).toPay, 15_250);
  assert.equal(calculateGiftOk(V, giftDefaultInput("valencia")).toPay, 318.53);
  const entries = giftSitemapEntries();
  assert.equal(entries.length, 12);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
});

test("the pages are wired: hub cards in the taxes group, analytics ids, YMYL disclaimer, model 651 links, gift and inheritance pages link each other", () => {
  const taxes = HUB_GROUPS.find((g) => g.id === "taxes")!;
  for (const region of GIFT_REGION_IDS) {
    const card = taxes.cards.find((c) => c.key === GIFT_CALCULATOR[region]);
    assert.equal(card?.scope, region);
    assert.equal(card?.checked, RULES_AS_OF);
    assert.ok(CALCULATOR_USE_IDS.includes(GIFT_CALCULATOR[region]));
    // The same community's inheritance calculator, both ways.
    assert.equal(GIFT_OF_INHERITANCE[INHERITANCE_OF[region]], GIFT_CALCULATOR[region]);
    // The agency's form 651 page is linked.
    assert.match(`${GIFT_PROFILES[region].file.name} ${GIFT_PROFILES[region].file.ref}`, /651/);
  }
  assert.deepEqual(GIFT_FAMILY.map((f) => f.id), ["gift-tax-catalonia", "gift-tax-madrid", "gift-tax-andalucia", "gift-tax-valencia"]);
  const body = read("src/components/programmatic/gift-tax/GiftTaxBody.tsx");
  assert.match(body, /<GiftTaxCalculator locale=\{locale\} rules=\{rules\} initial=\{giftDefaultInput\(region\)\} \/>/);
  assert.match(body, /Estimació orientativa per a una donació/);
  assert.match(body, /Estimación orientativa para una donación/);
  assert.match(body, /An estimate for one gift/);
  assert.match(body, /profile\.info/);
  assert.match(body, /profile\.file/);
  assert.match(body, /<GiftByRegion current=\{region\} locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/gift-tax/GiftByRegion.tsx"), /INHERITANCE_OF\[current\]/);
  assert.match(read("src/components/programmatic/inheritance-tax/InheritanceByRegion.tsx"), /GIFT_OF_INHERITANCE\[current\]/);
  assert.match(read("src/components/programmatic/gift-tax/GiftTaxCalculator.tsx"), /useCalculatorUse\(rules\.calculatorId/);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.giftSitemapEntries\(\)/);
  // The client gets the numbers as a prop, never the quotes.
  assert.doesNotMatch(read("src/components/programmatic/gift-tax/GiftTaxCalculator.tsx"), /profiles|regions\/(catalonia|madrid|andalucia|valencia)/);
});
