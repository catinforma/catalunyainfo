import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { addMonths, cents, serviceMonths } from "../src/lib/programmatic/employment/dates.ts";
import { compareDismissals, dismissalPay } from "../src/lib/programmatic/employment/dismissal.ts";
import { PAY_DATES_PATH, money, parseAmount } from "../src/lib/programmatic/employment/paths.ts";
import { CALCULATORS_ROOT, CALC_KEYS, CALC_LOCALES, calcEditions, calcPath, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import {
  DURATION_SCALE,
  IPREM_MONTHLY,
  RULES_AS_OF,
  RULES_VALID_UNTIL,
  SMI_ANNUAL,
  SMI_MONTHLY,
  SUBSIDY_MONTHLY,
} from "../src/lib/programmatic/employment/rules.ts";
import { defaultPendingDays, extraPeriods, settlement } from "../src/lib/programmatic/employment/settlement.ts";
import { benefitDays, benefitLimits, unemploymentBenefit } from "../src/lib/programmatic/employment/unemployment.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { PAY_DATES } from "../src/lib/content/batch02/pay-dates.ts";

/**
 * Employment calculators (lib/programmatic/employment/): dismissal pay,
 * final settlement and unemployment benefit. Every expected figure below was
 * worked out by hand from the rule quoted in rules.ts; the SEPE figures are
 * SEPE's own (Cuantías anuales and its FAQ example, read 13 Nov 2026).
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const today = new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the 2026 figures (IPREM, SMI, 2026 bases) are only valid to 31 Dec 2026 — re-read them for 2027", () => {
  assert.ok(RULES_AS_OF <= today, `RULES_AS_OF ${RULES_AS_OF} is in the future`);
  assert.ok(
    today <= RULES_VALID_UNTIL,
    `It is ${today}: re-read the IPREM (PGE ${new Date().getUTCFullYear()} or its prorogation; SEPE "Cuantías anuales"), the SMI (new Real Decreto), the maximum contribution base and the worker's rate (new Orden de cotización), and arts. 49, 53, 56, DT 11ª ET and 269–270 LGSS on the BOE consolidated texts; then update rules.ts, RULES_AS_OF and RULES_VALID_UNTIL.`,
  );
});

test("the 2026 figures are the ones read on the official texts", () => {
  assert.equal(IPREM_MONTHLY, 600);
  assert.equal(SMI_MONTHLY, 1221);
  assert.equal(SMI_ANNUAL, 1221 * 14);
  assert.deepEqual([...SUBSIDY_MONTHLY], [600 * 0.95, 600 * 0.9, 600 * 0.8]);
});

/* -------------------------------------------------------------------------- */
/* Months of service                                                          */
/* -------------------------------------------------------------------------- */

test("months of service: whole months from the first day, any part of a month counts as one", () => {
  assert.deepEqual(serviceMonths("2018-03-01", "2026-11-30"), { months: 105, whole: 105, extraDays: 0 });
  assert.deepEqual(serviceMonths("2020-01-15", "2026-11-13"), { months: 82, whole: 81, extraDays: 30 });
  assert.equal(serviceMonths("2026-01-01", "2026-01-01").months, 1);
  assert.equal(serviceMonths("2024-01-31", "2024-02-28").months, 1); // 31 Jan + 1 month = 29 Feb (leap year), so 28 Feb is still the first month
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2023-01-31", 1), "2023-02-28");
  assert.equal(serviceMonths("2026-05-01", "2026-04-30").months, 0);
});

/* -------------------------------------------------------------------------- */
/* Dismissal pay                                                              */
/* -------------------------------------------------------------------------- */

test("unfair dismissal, contract after 12 Feb 2012: 33 days a year by months", () => {
  // 1 Mar 2018 – 30 Nov 2026: 8 years 9 months = 105 months → 33 × 105 / 12 = 288.75 days; 30,000 / 365 a day.
  const r = dismissalPay({ type: "unfair", start: "2018-03-01", end: "2026-11-30", annualSalary: 30_000 });
  assert.equal(r.rule, "33");
  assert.equal(r.days, 288.75);
  assert.equal(r.amount, 23_732.88);
  assert.equal(r.capped, false);
  // A part month counts: 15 Jan 2020 – 13 Nov 2026 is 81 months and 30 days → 82 months → 225.5 days; 100 €/day.
  const p = dismissalPay({ type: "unfair", start: "2020-01-15", end: "2026-11-13", dailySalary: 100 });
  assert.equal(p.days, 225.5);
  assert.equal(p.amount, 22_550);
});

test("unfair dismissal, contract before 12 Feb 2012: 45 days a year before, 33 after (DT 11ª)", () => {
  // 15 Jan 2008 – 11 Feb 2012: 48 months + 28 days → 49 months → 183.75 days. 12 Feb 2012 – 13 Nov 2026: 177 months + 2 days → 178 → 489.5 days.
  const r = dismissalPay({ type: "unfair", start: "2008-01-15", end: "2026-11-13", dailySalary: 100 });
  assert.equal(r.rule, "45+33");
  assert.deepEqual(
    r.tranches.map((t) => [t.from, t.to, t.months, t.daysPerYear, t.days]),
    [
      ["2008-01-15", "2012-02-11", 49, 45, 183.75],
      ["2012-02-12", "2026-11-13", 178, 33, 489.5],
    ],
  );
  assert.equal(r.days, 673.25);
  assert.equal(r.capDays, 720);
  assert.equal(r.amount, 67_325);
});

test("DT 11ª cap: 720 days, or the pre-2012 days when more, never above 42 months (1,260 days)", () => {
  // 1 Jan 1995 – 11 Feb 2012: 205 months + 11 days → 206 → 772.5 days alone: that is the cap.
  const a = dismissalPay({ type: "unfair", start: "1995-01-01", end: "2026-11-13", dailySalary: 100 });
  assert.equal(a.capDays, 772.5);
  assert.equal(a.capped, true);
  assert.equal(a.days, 772.5);
  assert.equal(a.amount, 77_250);
  // 1 Jan 1980: 386 months before 2012 → 1,447.5 days → capped at 42 months.
  const b = dismissalPay({ type: "unfair", start: "1980-01-01", end: "2026-11-13", dailySalary: 100 });
  assert.equal(b.capDays, 1260);
  assert.equal(b.days, 1260);
  // Only post-2012 service: 264 months → 726 days → 720 (24 months).
  const c = dismissalPay({ type: "unfair", start: "2012-03-01", end: "2034-02-28", dailySalary: 100 });
  assert.equal(c.rawDays, 726);
  assert.equal(c.days, 720);
  assert.equal(c.capped, true);
});

test("objective dismissal and ERE: 20 days a year by months, max 12 months' pay", () => {
  // 1 Sep 2015 – 13 Nov 2026: 134 months + 13 days → 135 → 225 days; 28,000 / 365 a day.
  const r = dismissalPay({ type: "objective", start: "2015-09-01", end: "2026-11-13", annualSalary: 28_000 });
  assert.equal(r.days, 225);
  assert.equal(r.amount, 17_260.27);
  // 1 Jan 2000 – 13 Nov 2026: 323 months → 538.33 days → 360.
  const cap = dismissalPay({ type: "objective", start: "2000-01-01", end: "2026-11-13", annualSalary: 28_000 });
  assert.equal(cap.rawDays, 538.33);
  assert.equal(cap.days, 360);
  assert.equal(cap.amount, cents((360 * 28_000) / 365));
});

test("end of a fixed-term contract: the proportional part of 12 days a year, by calendar days, no cap", () => {
  // 1 Jan – 30 Jun 2026: 181 days → 12 × 181 / 365 = 5.95 days; 100 €/day → 595.07 €.
  const r = dismissalPay({ type: "temporary", start: "2026-01-01", end: "2026-06-30", dailySalary: 100 });
  assert.equal(r.serviceDays, 181);
  assert.equal(r.days, 5.95);
  assert.equal(r.amount, 595.07);
  assert.equal(r.capDays, null);
});

test("dismissal: same inputs compared, and nothing computed without dates in order and a salary", () => {
  const all = compareDismissals({ start: "2015-09-01", end: "2026-11-13", annualSalary: 28_000 });
  assert.equal(all.unfair.amount, 28_479.45); // 371.25 days
  assert.equal(all.objective.amount, 17_260.27);
  assert.ok(all.temporary.amount < all.objective.amount);
  assert.equal(dismissalPay({ type: "unfair", start: "2026-11-14", end: "2026-11-13", annualSalary: 28_000 }).valid, false);
  assert.equal(dismissalPay({ type: "unfair", start: "2020-01-01", end: "2026-11-13", annualSalary: 0 }).amount, 0);
});

/* -------------------------------------------------------------------------- */
/* Final settlement                                                           */
/* -------------------------------------------------------------------------- */

test("settlement: last month's days, extra payments not prorated (annual accrual), unused vacation", () => {
  const r = settlement({ start: "2024-03-04", end: "2026-11-13", monthly: 2000, extrasProrated: false, accrual: "annual", vacationPerYear: 30, vacationTaken: 18, reason: "none" });
  // 13 days × 2000 / 30.
  assert.equal(r.pendingDays, 13);
  assert.equal(r.salary, 866.67);
  // Summer: 1 Jul 2026 – 13 Nov = 136 of 365 days; Christmas: 1 Jan – 13 Nov = 317 of 365.
  assert.deepEqual(r.extras.map((e) => [e.which, e.accruedDays, e.periodDays, e.amount]), [
    ["summer", 136, 365, 745.21],
    ["christmas", 317, 365, 1736.99],
  ]);
  // Vacation: 30 × 317 / 365 = 26.05 earned − 18 taken = 8.05 days × 2000 / 30.
  assert.equal(r.vacation.earned, 26.05);
  assert.equal(r.vacation.pending, 8.05);
  assert.equal(r.vacation.amount, 536.67);
  assert.equal(r.settlementTotal, 3885.54);
  assert.equal(r.total, 3885.54);
  assert.equal(r.dismissal, null);
});

test("settlement: semester accrual, prorated extras, a start inside the period, more vacation taken than earned", () => {
  assert.deepEqual(extraPeriods("2026-11-13", "semester"), [{ which: "christmas", from: "2026-07-01", to: "2026-12-31" }]);
  assert.deepEqual(extraPeriods("2026-03-31", "annual").map((p) => p.from), ["2025-07-01", "2026-01-01"]);
  const sem = settlement({ start: "2024-03-04", end: "2026-11-13", monthly: 2000, extrasProrated: false, accrual: "semester", vacationPerYear: 30, vacationTaken: 0, reason: "none" });
  assert.equal(sem.extrasTotal, 1478.26); // 2000 × 136 / 184
  const pro = settlement({ start: "2024-03-04", end: "2026-11-13", monthly: 2000, extrasProrated: true, accrual: "annual", vacationPerYear: 30, vacationTaken: 0, reason: "none" });
  assert.equal(pro.extras.length, 0);
  const late = settlement({ start: "2026-09-01", end: "2026-11-13", monthly: 1500, extrasProrated: false, accrual: "annual", vacationPerYear: 30, vacationTaken: 10, reason: "none" });
  assert.deepEqual(late.extras.map((e) => e.accruedDays), [74, 74]); // both counted from 1 Sep
  assert.equal(late.vacation.earned, 6.08); // 30 × 74 / 365
  assert.ok(late.vacation.amount < 0);
});

test("settlement: last day of the month pays a whole month; dismissal pay and missing notice are added", () => {
  assert.equal(defaultPendingDays("2026-11-30"), 30);
  assert.equal(defaultPendingDays("2026-12-31"), 30);
  assert.equal(defaultPendingDays("2027-02-28"), 30);
  assert.equal(defaultPendingDays("2026-11-13"), 13);
  const r = settlement({ start: "2015-09-01", end: "2026-11-13", monthly: 2000, extrasProrated: false, accrual: "annual", vacationPerYear: 30, vacationTaken: 30, reason: "objective", noticeMissing: true });
  // Annual salary 2000 × 14 = 28,000 → the objective case above; notice 15 × 28,000 / 365.
  assert.equal(r.annualSalary, 28_000);
  assert.equal(r.dismissal?.amount, 17_260.27);
  assert.equal(r.notice, 1150.68);
  assert.equal(r.total, cents(r.settlementTotal + 17_260.27));
});

/* -------------------------------------------------------------------------- */
/* Unemployment benefit                                                       */
/* -------------------------------------------------------------------------- */

test("duration: the art. 269.1 scale, and SEPE's own example (420 days contributed → 120 days)", () => {
  assert.equal(benefitDays(420), 120);
  assert.equal(benefitDays(359), 0);
  assert.equal(benefitDays(360), 120);
  assert.equal(benefitDays(1079), 300);
  assert.equal(benefitDays(1080), 360);
  assert.equal(benefitDays(2159), 660);
  assert.equal(benefitDays(2160), 720);
  assert.equal(benefitDays(5000), 720);
  // Every row: 180-day steps of contributions, 60-day steps of benefit, one third.
  DURATION_SCALE.forEach(([from, days], i) => {
    assert.equal(from, 360 + 180 * i);
    assert.equal(days, 120 + 60 * i);
  });
});

test("limits: SEPE's 2026 figures (560 / 749 minimum, 1,225 / 1,400 / 1,575 maximum), scaled for part-time", () => {
  assert.deepEqual(benefitLimits(0), { min: 560, max: 1225 });
  assert.deepEqual(benefitLimits(1), { min: 749, max: 1400 });
  assert.deepEqual(benefitLimits(2), { min: 749, max: 1575 });
  assert.deepEqual(benefitLimits(0, 50), { min: 280, max: 612.5 });
});

test("amount: 70 % for 180 days then 60 %, within the limits; SS share 4.85 % of the base", () => {
  const r = unemploymentBenefit({ contributedDays: 2200, monthlyBase: 2000, children: 0 });
  assert.equal(r.durationDays, 720);
  assert.deepEqual(r.phases.map((p) => [p.fromDay, p.toDay, p.raw, p.monthly, p.limit]), [
    [1, 180, 1400, 1225, "max"],
    [181, 720, 1200, 1200, null],
  ]);
  assert.equal(r.total, 1225 * 6 + 1200 * 18);
  assert.equal(r.ssMonthly, 97);
  // One child: the maximum is 1,400, so the first 180 days are not cut.
  assert.equal(unemploymentBenefit({ contributedDays: 2200, monthlyBase: 2000, children: 1 }).phases[0]!.monthly, 1400);
  // A low base: both phases lifted to the minimum.
  const low = unemploymentBenefit({ contributedDays: 600, monthlyBase: 700, children: 0 });
  assert.equal(low.durationDays, 180);
  assert.equal(low.phases.length, 1);
  assert.deepEqual([low.phases[0]!.raw, low.phases[0]!.monthly, low.phases[0]!.limit], [490, 560, "min"]);
  assert.equal(low.total, 560 * 6);
  // Below 360 days: no contributory benefit; the next row is named.
  const none = unemploymentBenefit({ contributedDays: 300, monthlyBase: 2000, children: 0 });
  assert.equal(none.eligible, false);
  assert.equal(none.total, 0);
  assert.equal(none.nextBracketAt, 360);
  // The base never exceeds the 2026 maximum contribution base.
  const top = unemploymentBenefit({ contributedDays: 2200, monthlyBase: 9000, children: 2 });
  assert.equal(top.baseMonthly, 5101.2);
  assert.equal(top.baseCapped, true);
  assert.equal(top.ssMonthly, cents(5101.2 * 0.0485));
});

/* -------------------------------------------------------------------------- */
/* Paths, pages, links                                                        */
/* -------------------------------------------------------------------------- */

test("nine pages on unique paths under the calculators folder of each language, each with its route file", () => {
  const all = CALC_KEYS.flatMap((k) => CALC_LOCALES.map((l) => calcPath(k, l)));
  assert.equal(new Set(all).size, 9);
  for (const k of CALC_KEYS) {
    for (const l of CALC_LOCALES) {
      assert.equal(calcPath(k, l), `/${l}/${CALCULATORS_ROOT[l]}/${calculatorSlugs(k)[l]}/`);
      const file = join(APP, CALCULATORS_ROOT[l], calculatorSlugs(k)[l], "page.tsx");
      assert.ok(existsSync(file), `missing ${file}`);
      const src = readFileSync(file, "utf8");
      assert.match(src, new RegExp(`locale !== "${l}"\\) notFound\\(\\)`), `${file} must 404 in other languages`);
      assert.match(src, /dynamicParams = true/, `${file}: dynamicParams must stay true (self-hosted NoFallbackError)`);
    }
  }
});

test("sitemap lists the nine pages with reciprocal hreflang", () => {
  const sitemap = readFileSync(join(ROOT, "src", "app", "sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.employmentSitemapEntries\(\)/);
  for (const k of CALC_KEYS) assert.deepEqual(Object.keys(calcEditions(k)).sort(), ["ca", "en", "es"]);
});

test("the unemployment calculator and the pay-dates guide link each other, in every language", () => {
  for (const l of CALC_LOCALES) {
    assert.equal(PAY_DATES_PATH[l], `/${l}/${B2_PATHS.payDates[l]}/`);
    const body = JSON.stringify(PAY_DATES.editions[l].blocks);
    assert.ok(body.includes(`](${calcPath("unemployment", l)})`), `${l}: the pay-dates guide does not link the calculator`);
  }
  const page = readFileSync(join(ROOT, "src", "components", "programmatic", "employment", "UnemploymentPage.tsx"), "utf8");
  assert.match(page, /PAY_DATES_PATH\[locale\]/);
});

test("amount input: Spanish and English number writing", () => {
  assert.equal(parseAmount("28.000"), 28000);
  assert.equal(parseAmount("28.000,50"), 28000.5);
  assert.equal(parseAmount("28000,5"), 28000.5);
  assert.equal(parseAmount("28,000.50"), 28000.5);
  assert.equal(parseAmount("82.19"), 82.19);
  assert.equal(parseAmount("2 000 €"), 2000);
  assert.equal(parseAmount("abc"), 0);
  assert.equal(parseAmount("-5"), 0);
  assert.equal(money(28479.45, "es").replace(/\s/g, " "), "28.479,45 €");
  assert.equal(money(28479.45, "en"), "€28,479.45");
  assert.equal(money(1225, "es").replace(/\s/g, " "), "1.225,00 €"); // grouped like SEPE, not "1225,00 €"
  assert.equal(money(1225, "ca").replace(/\s/g, " "), "1.225,00 €");
});
