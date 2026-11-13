import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PAY_DATES } from "../src/lib/content/batch02/pay-dates.ts";
import { CALCULATORS, CALCULATORS_ROOT, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { calculatorCard } from "../src/lib/programmatic/calculators/hub.ts";
import { SUBSIDY_MONTHLY } from "../src/lib/programmatic/employment/rules.ts";
import { CALC_COPY, SUB_LOCALES, readHash, subsidyEditions, subsidyPath, writeHash } from "../src/lib/programmatic/unemployment-subsidy/copy.ts";
import { DEFAULT_INPUT, REASONS, checkSubsidy, exhaustedMonths, insufficientMonths, phasesFor, type SubsidyInput } from "../src/lib/programmatic/unemployment-subsidy/engine.ts";
import {
  CAE_SHARES,
  IMV_SINGLE_MONTHLY,
  INCOME_LIMIT,
  IPREM_MONTHLY,
  OVER52_SHARE,
  QUOTE,
  SEPE_AMOUNTS_2026,
  SEPE_INCOME_LIMIT_2026,
  SMI_MONTHLY,
  SOURCES,
  SS_IMV_2026,
  SUBSIDY_RULES_AS_OF,
  SUBSIDY_RULES_UNTIL,
  imvGuaranteed,
  monthlyAmount,
} from "../src/lib/programmatic/unemployment-subsidy/rules.ts";
import { subsidySitemapEntries } from "../src/lib/programmatic/unemployment-subsidy/sitemap.ts";

/**
 * "Subsidio por desempleo 2026" (lib/programmatic/unemployment-subsidy/): the
 * LGSS arts. 274–280 and DA 57ª–58ª as reformed by RDL 2/2024, checked case by
 * case against the BOE tables, the 2026 figures against what SEPE and the
 * Seguridad Social publish, and the date guards.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const check = (patch: Partial<SubsidyInput>) => checkSubsidy({ ...DEFAULT_INPUT, ...patch });
/** Alone, no income: the simplest applicant. */
const alone: Partial<SubsidyInput> = { familyMembers: 0, ownIncome: 0, householdIncome: 0 };

/* -------------------------------------------------------------------------- */
/* 2026 figures                                                               */
/* -------------------------------------------------------------------------- */

test("figures: IPREM 600, SMI 1.221, income limit 75 % of the SMI without extra payments = 915,75 € (SEPE)", () => {
  assert.equal(IPREM_MONTHLY, 600);
  assert.equal(SMI_MONTHLY, 1221);
  assert.equal(INCOME_LIMIT, 915.75);
  assert.equal(INCOME_LIMIT, SEPE_INCOME_LIMIT_2026);
  // Not 75 % of SMI × 14 / 12 (1.068,38 €): art. 275 excludes the two extra payments.
  assert.notEqual(INCOME_LIMIT, Math.round(((SMI_MONTHLY * 14) / 12) * 0.75 * 100) / 100);
  assert.match(QUOTE.art275_1, /75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias/);
});

test("figures: 95 / 90 / 80 % of IPREM = 570 / 540 / 480 € (SEPE), over 52 480 €, and the paro page quotes the same", () => {
  assert.deepEqual(phasesFor(30).map((p) => p.monthly), [...SEPE_AMOUNTS_2026]);
  assert.equal(monthlyAmount(OVER52_SHARE), 480);
  assert.deepEqual([...SUBSIDY_MONTHLY], [...SEPE_AMOUNTS_2026]);
  assert.match(QUOTE.art278, /95 por ciento durante los ciento ochenta primeros días, el 90 por ciento desde el día ciento ochenta y uno al día trescientos sesenta, y el 80 por ciento/);
});

test("figures: CAE table of art. 282.3 gives SEPE's euros (480/450/420/360 … 120/90/60/30)", () => {
  const euros = CAE_SHARES.map((r) => [r.full, r.part75, r.part50, r.partLow].map((s) => monthlyAmount(s)));
  assert.deepEqual(euros[0], [480, 450, 420, 360]);
  assert.deepEqual(euros[1], [360, 300, 270, 240]);
  assert.deepEqual(euros[2], [240, 210, 180, 150]);
  assert.deepEqual(euros[3], [180, 150, 120, 90]);
  assert.deepEqual(euros[4], [120, 90, 60, 30]);
});

test("figures: IMV 2026 from Ley 19/2021 art. 13 and RDL 3/2026 = what the Seguridad Social page prints", () => {
  assert.equal(IMV_SINGLE_MONTHLY, SS_IMV_2026.single);
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => imvGuaranteed(n)), [...SS_IMV_2026.scale]);
  assert.deepEqual([2, 3, 4, 5].map((n) => imvGuaranteed(n, true)), [...SS_IMV_2026.monoparental]);
  assert.equal(imvGuaranteed(9), SS_IMV_2026.scale[4]); // capped at 220 %
});

/* -------------------------------------------------------------------------- */
/* Art. 277.1: after exhausting the benefit                                   */
/* -------------------------------------------------------------------------- */

test("art. 277.1: the BOE table, row by row", () => {
  assert.equal(exhaustedMonths(30, 360, false), 6); // < 45, no RF, ≥ 360
  assert.equal(exhaustedMonths(30, 300, false), 0); // < 45, no RF, < 360: no subsidy
  assert.equal(exhaustedMonths(44, 359, false), 0);
  assert.equal(exhaustedMonths(45, 120, false), 6); // 45 is not "menor de 45"
  assert.equal(exhaustedMonths(50, 720, false), 6);
  assert.equal(exhaustedMonths(25, 120, true), 24); // RF, any age, 120 days
  assert.equal(exhaustedMonths(25, 180, true), 30); // RF, ≥ 180 days
  assert.equal(exhaustedMonths(60, 720, true), 30);
});

test("default example: 47, 360 days exhausted, partner + child, 1.200 € at home → RF, 30 months, 15.300 €", () => {
  const r = checkSubsidy(DEFAULT_INPUT);
  assert.equal(r.status, "eligible");
  assert.equal(r.kind, "exhausted");
  assert.equal(r.perHead, 400);
  assert.ok(r.familyOk && r.ownIncomeOk);
  assert.equal(r.months, 30);
  assert.deepEqual(r.phases.map((p) => [p.fromMonth, p.toMonth, p.monthly, p.total]), [
    [1, 6, 570, 3420],
    [7, 12, 540, 3240],
    [13, 30, 480, 8640],
  ]);
  assert.equal(r.total, 15300);
  assert.equal(r.firstMonthly, 570);
});

test("income test: own income or family responsibilities (art. 274.2: «o bien, alternativamente»)", () => {
  // Own income above the limit, but 2.000 € for a family of three = 666,67 € a head: RF, so eligible.
  const rf = check({ ownIncome: 1500, householdIncome: 2000, familyMembers: 2 });
  assert.equal(rf.status, "eligible");
  assert.ok(!rf.ownIncomeOk && rf.familyOk);
  // Both above: refused.
  const none = check({ ownIncome: 1500, householdIncome: 3000, familyMembers: 2 });
  assert.equal(none.status, "not-eligible");
  assert.ok(none.reasons.includes("income"));
  // The limit itself passes («no superen»); one cent over does not.
  assert.equal(check({ ...alone, ownIncome: 915.75, age: 50 }).status, "eligible");
  assert.equal(check({ ...alone, ownIncome: 915.76, age: 50 }).status, "not-eligible");
  // Alone there are no family responsibilities, whatever the household figure says.
  const solo = check({ ...alone, householdIncome: 100, age: 50 });
  assert.equal(solo.familyOk, false);
  assert.equal(solo.months, 6);
  // Under 45, alone, 240-day benefit: no subsidy.
  const young = check({ ...alone, age: 30, exhaustedDays: 240 });
  assert.equal(young.status, "not-eligible");
  assert.ok(young.reasons.includes("young-short"));
});

/* -------------------------------------------------------------------------- */
/* Art. 277.2: insufficient contributions                                     */
/* -------------------------------------------------------------------------- */

test("art. 277.2: 90 → 3, 120 → 4, 150 → 5, 180 → 6 or 21 with RF; < 90 none; ≥ 360 contributory", () => {
  assert.equal(insufficientMonths(89, false), 0);
  assert.equal(insufficientMonths(90, false), 3);
  assert.equal(insufficientMonths(90, true), 3);
  assert.equal(insufficientMonths(149, true), 4);
  assert.equal(insufficientMonths(150, false), 5);
  assert.equal(insufficientMonths(180, false), 6);
  assert.equal(insufficientMonths(359, true), 21);
  const c = (contributedDays: number, patch: Partial<SubsidyInput> = alone) => check({ situation: "insufficient", age: 30, contributedDays, ...patch });
  assert.equal(c(60).status, "not-eligible");
  assert.equal(c(200).months, 6);
  assert.equal(c(200).total, 6 * 570);
  assert.equal(c(200, {}).months, 21); // the default family: RF
  assert.equal(c(200, {}).total, 6 * 570 + 6 * 540 + 9 * 480);
  const contributory = c(400);
  assert.equal(contributory.status, "contributory");
  assert.ok(contributory.reasons.includes("contributory"));
});

/* -------------------------------------------------------------------------- */
/* Art. 280: over 52                                                          */
/* -------------------------------------------------------------------------- */

test("art. 280: over 52 with both records and own income in limit → 480 € to retirement, contributions paid", () => {
  const r = check({ ...alone, age: 55, retirementRecord: "yes", unemploymentYears: "yes" });
  assert.equal(r.status, "eligible");
  assert.equal(r.kind, "over52");
  assert.equal(r.months, null);
  assert.equal(r.total, null);
  assert.equal(r.firstMonthly, 480);
  assert.ok(r.retirementContribution);
  // Also from insufficient contributions (≥ 90 days).
  assert.equal(check({ ...alone, situation: "insufficient", contributedDays: 100, age: 52, retirementRecord: "yes", unemploymentYears: "yes" }).kind, "over52");
  // 51 does not qualify: general subsidy.
  assert.equal(check({ ...alone, age: 51, retirementRecord: "yes", unemploymentYears: "yes" }).kind, "exhausted");
});

test("art. 280: unknown records → general subsidy plus 'consulta' note; a 'no' → general; own income over the limit → general by RF", () => {
  const unknown = check({ ...alone, age: 55 });
  assert.equal(unknown.kind, "exhausted");
  assert.ok(unknown.reasons.includes("over52-unknown"));
  const no = check({ ...alone, age: 55, retirementRecord: "no", unemploymentYears: "yes" });
  assert.ok(no.reasons.includes("over52-record-no"));
  // Own 1.000 € (over), family of 3 with 1.500 € (500 a head): no over-52, but the general subsidy with RF.
  const rf = check({ age: 55, ownIncome: 1000, householdIncome: 1500, familyMembers: 2, retirementRecord: "yes", unemploymentYears: "yes" });
  assert.equal(rf.kind, "exhausted");
  assert.equal(rf.months, 30);
  assert.ok(rf.reasons.includes("over52-income"));
});

/* -------------------------------------------------------------------------- */
/* DA 57ª, DA 58ª and the cases the tool does not decide                       */
/* -------------------------------------------------------------------------- */

test("DA 57ª emigrants: 18 months; 'no sé' or family-only income → consulta en el SEPE", () => {
  const e = (patch: Partial<SubsidyInput>) => check({ situation: "emigrant", age: 40, ...patch });
  assert.equal(e({ ...alone, workedAbroad: "yes" }).months, 18);
  assert.equal(e({ ...alone, workedAbroad: "yes" }).total, 6 * 570 + 6 * 540 + 6 * 480);
  assert.equal(e({ ...alone, workedAbroad: "unknown" }).status, "check-sepe");
  assert.equal(e({ ...alone, workedAbroad: "no" }).status, "not-eligible");
  assert.equal(e({ workedAbroad: "yes", ownIncome: 1200, householdIncome: 1500, familyMembers: 2 }).status, "check-sepe");
});

test("DA 58ª victims: 30 / 20 / 10 months by earlier RAI; three → consulta; family test when there is family", () => {
  const v = (patch: Partial<SubsidyInput>) => check({ situation: "victim", age: 35, ...patch });
  assert.equal(v({ ...alone }).months, 30);
  assert.equal(v({ ...alone, priorRai: 1 }).months, 20);
  assert.equal(v({ ...alone, priorRai: 2 }).months, 10);
  assert.equal(v({ ...alone, priorRai: 3 }).status, "check-sepe");
  // With children, family responsibilities decide even if own income is over the limit.
  assert.equal(v({ ownIncome: 1000, householdIncome: 1000, familyMembers: 2 }).status, "eligible");
  assert.equal(v({ ownIncome: 1000, householdIncome: 3000, familyMembers: 2 }).status, "not-eligible");
});

test("other situations (prison release, resignation, self-employed) → consulta en el SEPE, never a guess", () => {
  const r = check({ situation: "other" });
  assert.equal(r.status, "check-sepe");
  assert.deepEqual(r.reasons, ["other-situation"]);
  assert.equal(r.phases.length, 0);
  assert.match(QUOTE.rdl2Prison, /liberadas de prisión/);
});

test("every reason has words in every language", () => {
  for (const l of SUB_LOCALES) for (const reason of REASONS) assert.ok(CALC_COPY[l].reason[reason]?.length, `${l}: ${reason}`);
});

/* -------------------------------------------------------------------------- */
/* URL hash                                                                   */
/* -------------------------------------------------------------------------- */

test("hash: round trip and bad values ignored", () => {
  const s: SubsidyInput = { ...DEFAULT_INPUT, situation: "insufficient", contributedDays: 150, age: 53, retirementRecord: "yes", unemploymentYears: "no", familyMembers: 1, ownIncome: 300, householdIncome: 1300.5 };
  assert.deepEqual(readHash(writeHash(s), DEFAULT_INPUT), { ...s, exhaustedDays: DEFAULT_INPUT.exhaustedDays });
  const v: SubsidyInput = { ...DEFAULT_INPUT, situation: "victim", priorRai: 2, workedAbroad: "unknown" };
  assert.deepEqual(readHash(writeHash(v), DEFAULT_INPUT), { ...v, exhaustedDays: DEFAULT_INPUT.exhaustedDays });
  assert.deepEqual(readHash("#s=zz&e=-4&m=abc&r=-1&i=9", DEFAULT_INPUT), { ...DEFAULT_INPUT });
});

/* -------------------------------------------------------------------------- */
/* Routes, registry, sitemap, links                                           */
/* -------------------------------------------------------------------------- */

test("routes: registry slugs, one static route per language, sitemap with hreflang and x-default en", () => {
  assert.deepEqual(subsidyEditions(), { ca: "/ca/calculadores/subsidi-atur/", es: "/es/calculadoras/subsidio-desempleo/", en: "/en/calculators/spain-unemployment-subsidy/" });
  assert.ok(CALCULATORS.some((c) => c.id === "unemployment-subsidy"));
  for (const l of SUB_LOCALES) {
    assert.ok(subsidyPath(l).startsWith(`/${l}/${CALCULATORS_ROOT[l]}/`));
    const file = join(ROOT, "src", "app", "(public)", "[locale]", ...subsidyPath(l).split("/").filter(Boolean).slice(1), "page.tsx");
    assert.ok(existsSync(file), file);
    const page = readFileSync(file, "utf8");
    assert.match(page, new RegExp(`return \\[\\{ locale: "${l}" \\}\\]`));
    assert.match(page, /export const dynamicParams = true;/);
  }
  const entries = subsidySitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/spain-unemployment-subsidy/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.subsidySitemapEntries\(\)/);
  assert.equal(calculatorCard("unemployment-subsidy").checked, SUBSIDY_RULES_AS_OF);
});

test("links both ways: paro calculator ↔ subsidy, pay-dates guide → subsidy (every language), subsidy → pay dates and paro", () => {
  for (const l of SUB_LOCALES) assert.ok(JSON.stringify(PAY_DATES.editions[l].blocks).includes(`](${subsidyPath(l)})`), `${l}: pay-dates guide`);
  assert.match(read("src/components/programmatic/employment/UnemploymentPage.tsx"), /calcPath\("unemployment-subsidy", locale\)/);
  assert.match(read("src/components/programmatic/employment/UnemploymentCalculator.tsx"), /calcPath\("unemployment-subsidy", locale\)/);
  const page = read("src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx");
  assert.match(page, /PAY_DATES_PATH\[locale\]/);
  assert.match(page, /calcPath\("unemployment", locale\)/);
  assert.equal(calcPath("unemployment", "es"), "/es/calculadoras/paro/");
});

test("sources: official only (BOE, SEPE, Seguridad Social), each with the day it was read", () => {
  for (const s of Object.values(SOURCES)) {
    assert.match(s.url, /^https:\/\/(www\.boe\.es|www\.sepe\.es|www\.seg-social\.es)\//, s.url);
    assert.equal(s.date, SUBSIDY_RULES_AS_OF);
  }
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: rules read in the past", () => {
  assert.ok(Date.parse(`${SUBSIDY_RULES_AS_OF}T00:00:00Z`) <= Date.now(), "SUBSIDY_RULES_AS_OF in the future");
});

test("date guard: IPREM, SMI and IMV amounts are the 2026 ones — re-read from 1 Jan 2027", () => {
  assert.ok(
    Date.now() < Date.parse(`${SUBSIDY_RULES_UNTIL}T00:00:00Z`),
    "Subsidio por desempleo: re-read the IPREM 2027 (PGE or decree-law; SEPE 'Cuantías anuales'), the SMI 2027 (75 % → income limit), the PNC/IMV 2027 amounts (revaluation decree-law; Seguridad Social IMV page) and arts. 274-282 LGSS; then update rules.ts and SUBSIDY_RULES_AS_OF/UNTIL.",
  );
});
