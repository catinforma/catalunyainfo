import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, calcPath, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, ISD_LOCALES, NOTE_TEXT, RELATION_LABEL, fromDay, isdEditions, sinceDay } from "../src/lib/programmatic/inheritance-tax/copy.ts";
import { RELATIONS, calculate, calculateOk, coefficientOf, groupOf, inputOf, kinshipReduction, scaleQuota, weightedBonus } from "../src/lib/programmatic/inheritance-tax/engine.ts";
import { ATC_EXAMPLES, ATC_HOME_EXAMPLES, DEFAULT_INPUT, OWN_EXAMPLES, isdFaq, isdMeta, isdSitemapEntries } from "../src/lib/programmatic/inheritance-tax/page.ts";
import {
  BONUS_GROUP_I,
  BONUS_GROUP_II,
  COEFFICIENTS,
  CODE_CONSOLIDATED_FROM,
  DEADLINE,
  DISABILITY,
  ELDERLY,
  GENDER_VIOLENCE_BONUS_FROM,
  HOME,
  INSURANCE,
  KINSHIP,
  KINSHIP_GROUP_I,
  QUOTE,
  RULES_AS_OF,
  RULES_UNTIL,
  SCALE,
  SOURCES,
  SPOUSE_BONUS,
} from "../src/lib/programmatic/inheritance-tax/rules.ts";

/**
 * The Catalan inheritance tax calculator (lib/programmatic/inheritance-tax/):
 * every figure against the quoted words of the Codi tributari de Catalunya,
 * the engine against the ATC's six worked examples and three home examples
 * and against our hand calculations from the quoted scale, the page, and the
 * date from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
/** "275.000" as the DOGC prints it. */
const dogc = (n: number) => n.toLocaleString("de-DE");

/* ------------------------------------------------------------------ rules */

test("every reduction is in the words of the Codi tributari (arts. 631-2 to 631-18)", () => {
  assert.match(QUOTE.groupI, new RegExp(`${dogc(KINSHIP_GROUP_I.base)}, més ${dogc(KINSHIP_GROUP_I.perYear)} euros per cada any de menys de vint-i-un`));
  assert.match(QUOTE.groupI, new RegExp(`límit de ${dogc(KINSHIP_GROUP_I.max)} euros`));
  assert.match(QUOTE.groupII, new RegExp(`Cònjuge: ${dogc(KINSHIP.spouse)} euros`));
  assert.match(QUOTE.groupII, new RegExp(`Fill o filla: ${dogc(KINSHIP.child)} euros`));
  assert.match(QUOTE.groupII, new RegExp(`Resta de descendents: ${dogc(KINSHIP.descendant)} euros`));
  assert.match(QUOTE.groupII, new RegExp(`Ascendents: ${dogc(KINSHIP.ascendant)} euros`));
  assert.match(QUOTE.groupIII, new RegExp(`${dogc(KINSHIP.groupIII)} euros`));
  assert.equal(KINSHIP.groupIV, 0);
  assert.match(QUOTE.groupIV, /no s'aplica cap reducció/);
  assert.match(QUOTE.disability, new RegExp(`superior al 33% s'aplica una reducció de ${dogc(DISABILITY.from33)} euros`));
  assert.match(QUOTE.disability, new RegExp(`superior al 65%, la reducció és de ${dogc(DISABILITY.from65)} euros`));
  assert.match(QUOTE.elderly, new RegExp(`setanta-cinc anys o més s'aplica una reducció de ${dogc(ELDERLY.amount)} euros`));
  assert.equal(ELDERLY.age, 75);
  assert.match(QUOTE.elderly, /incompatible amb la reducció per discapacitat/);
  assert.match(QUOTE.insurance, new RegExp(`reducció del ${INSURANCE.percent}%, amb un límit de ${dogc(INSURANCE.max)} euros`));
  assert.match(QUOTE.insuranceOnce, /única per subjecte passiu/);
  assert.match(QUOTE.home, new RegExp(`reducció del ${HOME.percent}% del valor de l'habitatge habitual`));
  assert.match(QUOTE.home, new RegExp(`límit de ${dogc(HOME.sharedCap)} euros pel valor conjunt`));
  assert.match(QUOTE.home, new RegExp(`no pot ésser de menys de ${dogc(HOME.individualFloor)} euros`));
  assert.match(QUOTE.homeCollaterals, /més grans de seixanta-cinc anys/);
  assert.equal(HOME.collateralAgeOver, 65);
  assert.match(QUOTE.homeCollaterals, /dos anys anteriors/);
  assert.match(QUOTE.homeKeep, /cinc anys següents/);
  assert.equal(HOME.keepYears, 5);
});

test("the scale of art. 633-1 adds up: each row's quota is the lower slices at their rates", () => {
  assert.deepEqual(
    SCALE.map((r) => r.rate),
    [7, 11, 17, 24, 32],
  );
  for (let i = 1; i < SCALE.length; i++) {
    const prev = SCALE[i - 1]!;
    assert.equal(SCALE[i]!.quota, prev.quota + ((SCALE[i]!.from - prev.from) * prev.rate) / 100, `row ${i}`);
    assert.equal(scaleQuota(SCALE[i]!.from).quota, SCALE[i]!.quota);
  }
});

test("the coefficients of art. 633-3 and the bonus tables of art. 633-4 are the printed ones, and their averages add up", () => {
  assert.deepEqual(
    COEFFICIENTS.map((r) => [r.upTo, r.groupsIandII, r.groupIII, r.groupIV]),
    [
      [500_000, 1, 1.5882, 2],
      [2_000_000, 1.1, 1.5882, 2],
      [4_000_000, 1.15, 1.5882, 2],
      [null, 1.2, 1.5882, 2],
    ],
  );
  assert.equal(SPOUSE_BONUS, 99);
  assert.match(QUOTE.spouseBonus, /bonificació del 99% de la quota tributària/);
  assert.match(QUOTE.genderViolenceBonus, /bonificació del 99 %/);
  assert.match(QUOTE.groupBonus, /per a cada tram de base imposable/);
  for (const table of [BONUS_GROUP_I, BONUS_GROUP_II]) {
    for (let i = 1; i < table.length; i++) {
      const prev = table[i - 1]!;
      assert.equal(table[i]!.from, prev.from + prev.width!, `slice ${i}`);
      // The printed average at each threshold is the weighted average of the slices below, to two decimals. One
      // exception: group II at 2.000.000 € is exactly 35,875 %, which the table prints 35,88 but the rounding rule
      // of 633-4.5 (a thousandth of 5 keeps the hundredth) makes 35,87; the engine follows the rule.
      const label = `${table === BONUS_GROUP_I ? "I" : "II"} at ${table[i]!.from}`;
      if (table === BONUS_GROUP_II && table[i]!.from === 2_000_000) {
        assert.equal(table[i]!.avg, 35.88);
        assert.equal(weightedBonus(table, table[i]!.from), 35.87, label);
      } else {
        assert.equal(weightedBonus(table, table[i]!.from), table[i]!.avg, label);
      }
    }
    assert.equal(table.at(-1)!.width, null);
  }
  assert.deepEqual(BONUS_GROUP_I.map((s) => s.marginal), [99, 97, 95, 90, 80, 70, 60, 50, 40, 25, 20]);
  assert.deepEqual(BONUS_GROUP_II.map((s) => s.marginal), [60, 55, 50, 45, 40, 35, 30, 25, 20, 10, 0]);
});

test("the rounding of art. 633-4.5: a thousandth of 5 or less keeps the hundredth, above 5 rounds it up", () => {
  assert.match(QUOTE.bonusRounding, /si la mil·lèsima és igual o inferior a 5, es manté la centèsima/);
  // ATC case 1: (100.000 × 60 % + 20.000 × 55 %) / 120.000 = 59,1666… → 59,17.
  assert.equal(weightedBonus(BONUS_GROUP_II, 120_000), 59.17);
  // ATC case 6 (the son): 40,9615… → 40,96.
  assert.equal(weightedBonus(BONUS_GROUP_II, 1_300_000), 40.96);
  // 100.000 × 60 % + 1.000 × 55 % over 101.000 = 59,9504… → thousandth 0 → 59,95.
  assert.equal(weightedBonus(BONUS_GROUP_II, 101_000), 59.95);
  // 100.000 × 60 % + 2.000 × 55 % over 102.000 = 59,90196… → 59,90 (thousandth 1).
  assert.equal(weightedBonus(BONUS_GROUP_II, 102_000), 59.9);
});

test("deadline: six months, six more if asked within five (RD 1629/1991 arts. 67-68, as the ATC says)", () => {
  assert.deepEqual(DEADLINE, { months: 6, extensionMonths: 6, askWithinMonths: 5 });
  assert.match(QUOTE.deadlineAtc, /és de sis mesos des de la data de defunció/);
  assert.match(QUOTE.extensionAtc, /cinc primers mesos .* sis mesos més/);
  assert.match(QUOTE.deadlineBoe, /en el de seis meses, contados desde el día del fallecimiento/);
  assert.match(QUOTE.extensionBoe, /dentro de los cinco primeros meses/);
  assert.match(QUOTE.dl5InForce, /als tres mesos de l'endemà de la publicació/);
  assert.equal(GENDER_VIOLENCE_BONUS_FROM, "2025-06-27");
});

test("every source is an official one, over https, read on the rules' date", () => {
  for (const src of Object.values(SOURCES)) {
    assert.match(src.url, /^https:\/\/(portaljuridic\.gencat\.cat|atc\.gencat\.cat|www\.boe\.es)\//, src.url);
    if ("urlEs" in src && src.urlEs) assert.match(src.urlEs, /^https:\/\/atc\.gencat\.cat\/es\//, src.urlEs);
    assert.equal(src.read, RULES_AS_OF);
  }
  // The rules are the Codi tributari's, not the repealed Llei 19/2010.
  assert.match(SOURCES.code.url, /eli\/es-ct\/dlg\/2024\/03\/12\/1$/);
  assert.match(SOURCES.llei19.ref, /derogada/);
  assert.ok(CODE_CONSOLIDATED_FROM <= RULES_AS_OF);
});

test(`date guard: the inheritance tax rules are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF < RULES_UNTIL);
  assert.ok(
    today() < RULES_UNTIL,
    "Catalan inheritance tax: re-read the Codi tributari de Catalunya, llibre sisè, Títol III (portaljuridic.gencat.cat, document 980772: a consolidated version after 14/07/2026?), the 2027 budget and fiscal-measures law and any decree-law in the DOGC, and the ATC's herències pages (reductions, bonificació, tarifa, examples); update rules.ts, then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("groups: descendants under 21 are group I, the spouse group II at any age, in-laws group III, cousins and strangers group IV", () => {
  assert.equal(groupOf("child", 20), "I");
  assert.equal(groupOf("child", 21), "II");
  assert.equal(groupOf("descendant", 5), "I");
  assert.equal(groupOf("spouse", 19), "II");
  assert.equal(groupOf("ascendant", 80), "II");
  assert.equal(groupOf("collateral", 40), "III");
  assert.equal(groupOf("affinity", 40), "III");
  assert.equal(groupOf("distant", 40), "IV");
  assert.equal(groupOf("unrelated", 40), "IV");
  // 631-2 a): 100.000 + 12.000 per year under 21, capped at 196.000.
  assert.equal(kinshipReduction("child", 20), 112_000);
  assert.equal(kinshipReduction("child", 15), 172_000);
  assert.equal(kinshipReduction("child", 13), 196_000);
  assert.equal(kinshipReduction("child", 0), 196_000);
  assert.equal(kinshipReduction("descendant", 30), 50_000);
  assert.equal(kinshipReduction("ascendant", 60), 30_000);
});

test("the ATC's six worked examples come out to the cent", () => {
  assert.equal(ATC_EXAMPLES.length, 6);
  for (const e of ATC_EXAMPLES) {
    const r = calculateOk(e.input);
    assert.equal(r.baseLiquidable, e.official.baseLiquidable, `${e.id}: base liquidable`);
    assert.equal(r.quotaTributaria, e.official.quotaTributaria, `${e.id}: quota tributària`);
    assert.equal(r.toPay, e.official.toPay, `${e.id}: a pagar`);
  }
  // Case 1 in detail: 1.400 € gross tax, 59,17 %, 828,38 € off.
  const son = calculateOk(ATC_EXAMPLES[0]!.input);
  assert.deepEqual([son.quotaIntegra, son.coefficient, son.bonusPct, son.bonus], [1_400, 1, 59.17, 828.38]);
  // Case 3: 8.120 € × 1,5882, no bonus.
  const brother = calculateOk(ATC_EXAMPLES[2]!.input);
  assert.deepEqual([brother.quotaIntegra, brother.bonusRule], [8_120, "none"]);
  // Case 6 (widow): 31.670 € × 1,1 (prior wealth 600.000 €) = 34.837 €, 99 % off.
  const widow = calculateOk(ATC_EXAMPLES[5]!.input);
  assert.deepEqual([widow.quotaIntegra, widow.coefficient, widow.excess, widow.bonus], [31_670, 1.1, 0, 34_488.63]);
  // Case 2: kinship 30.000 + 75 or over 275.000 + insurance 25.000 on a 150.000 € base.
  const mother = calculateOk(ATC_EXAMPLES[1]!.input);
  assert.deepEqual(
    mother.reductions.map((r) => [r.id, r.amount]),
    [
      ["kinship", 30_000],
      ["elderly", 275_000],
      ["insurance", 25_000],
    ],
  );
  assert.equal(mother.baseImposable, 150_000);
});

test("the ATC's three habitual-home examples: 218.500 €, 250.000 € and the 180.000 € floor", () => {
  for (const e of ATC_HOME_EXAMPLES) {
    const r = calculateOk(e.input);
    assert.equal(r.reductions.find((x) => x.id === "home")?.amount, e.official, e.id);
  }
});

test("our own cases, worked by hand from the quoted scale", () => {
  const by = Object.fromEntries(OWN_EXAMPLES.map((e) => [e.id, calculateOk(e.input)]));
  // Son of 15, 300.000 €: 172.000 off → 128.000; 3.500 + 78.000 × 11 % = 12.080; group I bonus 97 % (99, 97, 95 on three 100.000 slices) → 11.717,60; 362,40.
  assert.deepEqual([by["child-15"]!.baseLiquidable, by["child-15"]!.quotaIntegra, by["child-15"]!.bonusPct, by["child-15"]!.toPay], [128_000, 12_080, 97, 362.4]);
  // Daughter of 50, 400.000 € with half of a 300.000 € home: 100.000 + 142.500 off → 157.500; 14.500 + 7.500 × 17 % = 15.775; bonus 52,5 % → 8.281,88; 7.493,12.
  assert.deepEqual([by["daughter-home"]!.baseLiquidable, by["daughter-home"]!.quotaIntegra, by["daughter-home"]!.bonusPct, by["daughter-home"]!.toPay], [157_500, 15_775, 52.5, 7_493.12]);
  // Niece of 45, 200.000 €: 8.000 off → 192.000; 14.500 + 42.000 × 17 % = 21.640; × 1,5882 = 34.368,65; no bonus.
  assert.deepEqual([by.niece!.baseLiquidable, by.niece!.quotaIntegra, by.niece!.toPay], [192_000, 21_640, 34_368.65]);
  // Unrelated friend, 100.000 €: no reduction; 3.500 + 50.000 × 11 % = 9.000; × 2 = 18.000.
  assert.deepEqual([by.friend!.baseLiquidable, by.friend!.quotaIntegra, by.friend!.toPay], [100_000, 9_000, 18_000]);
});

test("disability and 75 or over are never both; disability 65 % wins", () => {
  const both = calculateOk(inputOf({ relation: "ascendant", age: 80, disability: 65, share: 1_000_000 }));
  assert.deepEqual(both.reductions.map((r) => [r.id, r.amount]), [
    ["kinship", 30_000],
    ["disability", 650_000],
  ]);
  assert.ok(both.notes.includes("elderly-with-disability"));
  // Group III at 80 gets no age reduction (it is group II's), but disability applies to everyone.
  const sibling = calculateOk(inputOf({ relation: "collateral", age: 80, disability: 33, share: 500_000 }));
  assert.deepEqual(sibling.reductions.map((r) => r.id), ["kinship", "disability"]);
});

test("life insurance: added to the base for everyone, reduced only for the direct line", () => {
  const child = calculateOk(inputOf({ relation: "child", age: 40, share: 0, insurance: 60_000 }));
  assert.equal(child.baseImposable, 60_000);
  assert.equal(child.reductions.find((r) => r.id === "insurance")?.amount, 25_000);
  const nephew = calculateOk(inputOf({ relation: "collateral", age: 40, share: 0, insurance: 60_000 }));
  assert.equal(nephew.baseImposable, 60_000);
  assert.equal(nephew.reductions.find((r) => r.id === "insurance"), undefined);
  assert.ok(nephew.notes.includes("insurance-relation"));
});

test("home reduction: collaterals only over 65 and two years together; in-laws not applied", () => {
  const base = { share: 300_000, homeValue: 300_000 };
  assert.ok(calculateOk(inputOf({ relation: "collateral", age: 70, livedTogether: true, ...base })).reductions.some((r) => r.id === "home"));
  assert.ok(calculateOk(inputOf({ relation: "collateral", age: 70, livedTogether: false, ...base })).notes.includes("home-collateral"));
  assert.ok(calculateOk(inputOf({ relation: "collateral", age: 65, livedTogether: true, ...base })).notes.includes("home-collateral"));
  assert.ok(calculateOk(inputOf({ relation: "affinity", age: 70, livedTogether: true, ...base })).notes.includes("home-relation"));
  assert.ok(calculateOk(inputOf({ relation: "unrelated", age: 70, livedTogether: true, ...base })).notes.includes("home-relation"));
});

test("the excess rule (Llei 29/1987 art. 22.2) just above a prior-wealth bracket", () => {
  assert.deepEqual(coefficientOf("II", 500_000), { coefficient: 1, lower: null });
  assert.deepEqual(coefficientOf("II", 500_000.01), { coefficient: 1.1, lower: { coefficient: 1, upTo: 500_000 } });
  assert.equal(coefficientOf("IV", 10_000_000).coefficient, 2);
  // 4.900.000 € base liquidable: 153.000 + 4.100.000 × 32 % = 1.465.000; × 1,1 = 1.611.500, but only 100.000 € above the 500.000 bracket.
  const r = calculateOk(inputOf({ relation: "child", age: 40, share: 5_000_000, priorWealth: 600_000 }));
  assert.equal(r.quotaIntegra, 1_465_000);
  assert.equal(r.excess, 46_500);
  assert.equal(r.quotaTributaria, 1_565_000);
  // Group III has one coefficient: no excess.
  assert.equal(calculateOk(inputOf({ relation: "collateral", age: 40, share: 5_000_000, priorWealth: 600_000 })).excess, 0);
});

test("invalid inputs are named, never computed", () => {
  const ok = inputOf({ relation: "child", age: 30, share: 100_000 });
  assert.deepEqual(calculate({ ...ok, share: Number.NaN }), { status: "invalid", reason: "share" });
  assert.deepEqual(calculate({ ...ok, share: 0 }), { status: "invalid", reason: "nothing" });
  assert.deepEqual(calculate({ ...ok, age: 30.5 }), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate({ ...ok, homeValue: 100_000, homeHeirPct: 0 }), { status: "invalid", reason: "home-pct" });
  assert.deepEqual(calculate({ ...ok, homeValue: 300_000 }), { status: "invalid", reason: "home-above-share" });
  assert.deepEqual(calculate({ ...ok, priorWealth: -1 }), { status: "invalid", reason: "prior" });
});

/* ------------------------------------------------------------------- page */

test("the page: three editions in the registry, route files, titles and descriptions that fit", () => {
  assert.deepEqual(isdEditions(), { ca: "/ca/calculadores/impost-successions-catalunya/", es: "/es/calculadoras/impuesto-sucesiones-cataluna/", en: "/en/calculators/catalonia-inheritance-tax/" });
  for (const l of ISD_LOCALES) {
    assert.equal(isdEditions()[l], calcPath("inheritance-tax", l));
    assert.ok(existsSync(join(ROOT, "src", "app", "(public)", "[locale]", CALCULATORS_ROOT[l], calculatorSlugs("inheritance-tax")[l], "page.tsx")));
    const m = isdMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length}`);
    assert.match(m.description, /571[,.]62/);
    const faq = isdFaq(l);
    assert.ok(faq.length >= 6);
    for (const f of faq) assert.ok(f.q.trim() && f.a.trim() && !/NaN|undefined/.test(f.a), f.q);
    for (const r of RELATIONS) assert.ok(RELATION_LABEL[r][l].trim());
    for (const text of Object.values(NOTE_TEXT)) assert.ok(text[l].trim());
    assert.ok(Object.values(CALC_COPY[l].invalid).every((t) => t.trim()));
  }
  assert.equal(sinceDay("2026-07-14", "ca"), "des del 14 de juliol de 2026");
  assert.equal(fromDay("2027-01-01", "ca"), "a partir de l'1 de gener de 2027");
  assert.equal(sinceDay("2026-07-14", "en"), "since 14 July 2026");
  // The server renders the ATC's case 1.
  assert.equal(calculateOk(DEFAULT_INPUT).toPay, 571.62);
  const entries = isdSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
});

test("the page is wired: hub card in the housing group, analytics id, YMYL disclaimer and official links, home-purchase tax links it", () => {
  const card = HUB_GROUPS.find((g) => g.id === "housing")!.cards.find((c) => c.key === "inheritance-tax");
  assert.equal(card?.scope, "catalonia");
  assert.equal(card?.checked, RULES_AS_OF);
  assert.ok(CALCULATOR_USE_IDS.includes("inheritance-tax"));
  const page = read("src/components/programmatic/inheritance-tax/InheritanceTaxPage.tsx");
  assert.match(page, /<InheritanceTaxCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} \/>/);
  assert.match(page, /SOURCES\.atcHelpProgram/);
  assert.match(page, /Estimació orientativa/);
  assert.match(page, /Estimación orientativa/);
  assert.match(page, /An estimate for one heir/);
  assert.match(read("src/components/programmatic/inheritance-tax/InheritanceTaxCalculator.tsx"), /useCalculatorUse\("inheritance-tax"/);
  assert.match(read("src/components/programmatic/home-purchase-tax/HomeTaxPage.tsx"), /calcPath\("inheritance-tax", locale\)/);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.isdSitemapEntries\(\)/);
});
