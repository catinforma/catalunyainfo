import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { EURIBOR_SNAPSHOT } from "../src/lib/programmatic/euribor/data.ts";
import { CALC_COPY, MORTGAGE_LOCALES, REVISION_COPY, centsText, mortgageEditions, mortgagePath, rateText, signedCents } from "../src/lib/programmatic/mortgage/copy.ts";
import { amortise, annuity, computeMortgage, computeRevision, parseAmount, parsePct, parseWhole, ratePeriods, roundCents, variableRate, type MortgageInput } from "../src/lib/programmatic/mortgage/engine.ts";
import { mortgageMeta, mortgageSitemapEntries } from "../src/lib/programmatic/mortgage/page.ts";
import { EARLY_REPAYMENT, QUOTE, RULES_AS_OF, RULES_REREAD_BY } from "../src/lib/programmatic/mortgage/rules.ts";

/**
 * The mortgage calculator (lib/programmatic/mortgage/): French amortisation
 * to the cent on known examples (expected figures computed independently
 * with Python's Decimal, half-up to the cent: see the comment on each), the
 * variable and mixed periods, the 0 % floor of Ley 5/2019 art. 21.4, the
 * revision calculator, input parsing, the page words, the routes and the
 * date guard on the legal texts.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);

const base: MortgageInput = { kind: "fixed", amount: 150_000, years: 25, fixedPct: 3, fixedYears: 5, euriborPct: 3.239, spreadPct: 0.75, initialPct: 2.5, initialMonths: 0 };

/* -------------------------------------------------------------------------- */
/* Date guard                                                                 */
/* -------------------------------------------------------------------------- */

test("date guard: Ley 5/2019 and Orden EHA/2899/2011 are re-read by RULES_REREAD_BY", () => {
  assert.ok(RULES_AS_OF <= today(), "RULES_AS_OF in the future");
  assert.ok(today() < RULES_REREAD_BY, `From ${RULES_REREAD_BY}: re-read Ley 5/2019 arts. 14, 15, 21, 23, 25 and Orden EHA/2899/2011 arts. 21-22 in the BOE (mortgage/rules.ts), then move RULES_AS_OF and RULES_REREAD_BY.`);
});

/* -------------------------------------------------------------------------- */
/* French amortisation, to the cent                                           */
/* -------------------------------------------------------------------------- */

test("annuity: the textbook instalments (150,000 € at 3 % over 25 years = 711.32 €; 200,000 € at 2.5 % over 30 years = 790.24 €)", () => {
  assert.equal(annuity(15_000_000, 3, 300), 71_132);
  assert.equal(annuity(20_000_000, 2.5, 360), 79_024);
  assert.equal(annuity(1_200_000, 0, 12), 100_000);
  assert.equal(annuity(10_000_000, 0, 120), 83_333);
  assert.equal(roundCents(0.5), 1);
  assert.equal(roundCents(2.49), 2);
  assert.equal(roundCents(2.5 - 1e-9), 3, "binary noise just under a half cent still rounds up");
});

test("fixed 150,000 € at 3 % over 25 years: totals and year 1 to the cent", () => {
  // Decimal reference: last instalment 710.01, total paid 213,394.69, interest 63,394.69; year 1 interest 4,444.03, capital 4,091.81, outstanding 145,908.19.
  const s = amortise(15_000_000, 300, [{ from: 1, annualPct: 3 }]);
  assert.equal(s.rows.length, 300);
  assert.equal(s.rows[0]!.interest, 37_500);
  assert.equal(s.rows[0]!.principal, 33_632);
  assert.equal(s.rows.at(-1)!.payment, 71_001);
  assert.equal(s.rows.at(-1)!.balance, 0);
  assert.equal(s.totalPaid, 21_339_469);
  assert.equal(s.totalInterest, 6_339_469);
  assert.deepEqual(s.years[0], { year: 1, paid: 853_584, interest: 444_403, principal: 409_181, balance: 14_590_819 });
  assert.equal(s.years.length, 25);
  assert.equal(s.rows.reduce((a, r) => a + r.principal, 0), 15_000_000);
});

test("fixed 200,000 € at 2.5 % over 30 years", () => {
  // Decimal reference: 790.24, last 791.19, total 284,487.35, interest 84,487.35, year 1 interest 4,948.27.
  const r = computeMortgage({ ...base, amount: 200_000, years: 30, fixedPct: 2.5 });
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.schedule.periods[0]!.payment, 79_024);
  assert.equal(r.schedule.rows.at(-1)!.payment, 79_119);
  assert.equal(r.schedule.totalPaid, 28_448_735);
  assert.equal(r.schedule.totalInterest, 8_448_735);
  assert.equal(r.schedule.years[0]!.interest, 494_827);
});

test("variable 180,000 € over 30 years: 2.5 % for 12 months, then Euribor 3.239 + 0.75 = 3.989 %", () => {
  // Decimal reference: 711.22, then 853.81 from month 13 on 175,918.81; last 855.35; total 305,662.06; interest 125,662.06.
  const r = computeMortgage({ ...base, kind: "variable", amount: 180_000, years: 30, initialPct: 2.5, initialMonths: 12 });
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.deepEqual(r.periods, [
    { from: 1, annualPct: 2.5 },
    { from: 13, annualPct: 3.989 },
  ]);
  assert.deepEqual(
    r.schedule.periods.map((p) => [p.from, p.to, p.annualPct, p.payment]),
    [
      [1, 12, 2.5, 71_122],
      [13, 360, 3.989, 85_381],
    ],
  );
  assert.equal(r.schedule.years[0]!.balance, 17_591_881);
  assert.equal(r.schedule.rows.at(-1)!.payment, 85_535);
  assert.equal(r.schedule.totalPaid, 30_566_206);
  assert.equal(r.schedule.totalInterest, 12_566_206);
});

test("mixed 250,000 € over 25 years: 2.2 % for 5 years, then Euribor 3.239 + 0.9 = 4.139 %", () => {
  // Decimal reference: 1,084.15 then 1,290.12; last 1,288.95; total 374,676.63; interest 124,676.63; year 1 capital 7,585.97.
  const r = computeMortgage({ ...base, kind: "mixed", amount: 250_000, years: 25, fixedPct: 2.2, fixedYears: 5, spreadPct: 0.9 });
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.deepEqual(
    r.schedule.periods.map((p) => [p.from, p.payment]),
    [
      [1, 108_415],
      [61, 129_012],
    ],
  );
  assert.equal(r.schedule.rows.at(-1)!.payment, 128_895);
  assert.equal(r.schedule.totalPaid, 37_467_663);
  assert.equal(r.schedule.totalInterest, 12_467_663);
  assert.equal(r.schedule.years[0]!.principal, 758_597);
});

test("variable without initial months: one period at Euribor + spread; a negative sum is floored at 0 % (Ley 5/2019 art. 21.4)", () => {
  const plain = ratePeriods({ ...base, kind: "variable" });
  assert.ok("periods" in plain);
  if ("periods" in plain) assert.deepEqual(plain.periods, [{ from: 1, annualPct: 3.989 }]);
  assert.deepEqual(variableRate(-0.5, 0.3), { annualPct: 0, floored: true });
  assert.deepEqual(variableRate(3.239, 0.75), { annualPct: 3.989, floored: false });
  const r = computeMortgage({ ...base, kind: "variable", amount: 100_000, years: 10, euriborPct: -0.5, spreadPct: 0.3 });
  assert.equal(r.status, "ok");
  if (r.status === "ok") {
    assert.equal(r.floored, true);
    assert.equal(r.schedule.totalInterest, 0);
    assert.equal(r.schedule.totalPaid, 10_000_000);
    assert.equal(r.schedule.periods[0]!.payment, 83_333);
    assert.equal(r.schedule.rows.at(-1)!.payment, 83_373);
  }
});

test("invalid input is named, never computed", () => {
  assert.deepEqual(computeMortgage({ ...base, amount: 500 }), { status: "invalid", reason: "amount" });
  assert.deepEqual(computeMortgage({ ...base, years: 41 }), { status: "invalid", reason: "years" });
  assert.deepEqual(computeMortgage({ ...base, years: Number.NaN }), { status: "invalid", reason: "years" });
  assert.deepEqual(computeMortgage({ ...base, fixedPct: Number.NaN }), { status: "invalid", reason: "rate" });
  assert.deepEqual(computeMortgage({ ...base, kind: "mixed", fixedYears: 25 }), { status: "invalid", reason: "fixedYears" });
  assert.deepEqual(computeMortgage({ ...base, kind: "variable", initialMonths: 300 }), { status: "invalid", reason: "initialMonths" });
});

/* -------------------------------------------------------------------------- */
/* Revision                                                                   */
/* -------------------------------------------------------------------------- */

test("revision: 120,000 € left over 20 years, spread 0.8; Euribor 2.172 → 3.247 (September 2025 → September 2026)", () => {
  // Decimal reference: 663.84 at 2.972 %, 730.15 at 4.047 %.
  const r = computeRevision({ balance: 120_000, monthsLeft: 240, spreadPct: 0.8, oldEuriborPct: 2.172, newEuriborPct: 3.247 });
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.oldPct, 2.972);
  assert.equal(r.newPct, 4.047);
  assert.equal(r.oldPayment, 66_384);
  assert.equal(r.newPayment, 73_015);
  assert.equal(r.monthly, 6_631);
  assert.equal(r.yearly, 79_572);
  assert.equal(signedCents(r.monthly, "es"), "+66,31 €");
  assert.equal(signedCents(-r.monthly, "en"), "−€66.31");
  assert.deepEqual(computeRevision({ balance: 120_000, monthsLeft: 0, spreadPct: 0.8, oldEuriborPct: 2, newEuriborPct: 3 }), { status: "invalid", reason: "months" });
  assert.deepEqual(computeRevision({ balance: 12, monthsLeft: 10, spreadPct: 0.8, oldEuriborPct: 2, newEuriborPct: 3 }), { status: "invalid", reason: "balance" });
});

/* -------------------------------------------------------------------------- */
/* Parsing and words                                                          */
/* -------------------------------------------------------------------------- */

test("typed input: Spanish and English number formats", () => {
  assert.equal(parseAmount("150.000"), 150_000);
  assert.equal(parseAmount("150000"), 150_000);
  assert.equal(parseAmount("150.000,50"), 150_000.5);
  assert.equal(parseAmount("150,000.50"), 150_000.5);
  assert.equal(parseAmount("1500,5"), 1500.5);
  assert.ok(Number.isNaN(parseAmount("abc")));
  assert.equal(parsePct("3,239"), 3.239);
  assert.equal(parsePct("−0,5 %"), -0.5);
  assert.equal(parseWhole("25"), 25);
  assert.ok(Number.isNaN(parseWhole("2.5")));
  assert.equal(rateText(3.989, "es"), "3,989 %");
  assert.equal(rateText(2.5, "en"), "2.5%");
  assert.equal(rateText(0, "ca"), "0 %");
  assert.equal(centsText(71_132, "es"), "711,32 €");
  assert.equal(centsText(71_132, "en"), "€711.32");
});

test("copy: every language has every string; the law quoted word for word from the BOE", () => {
  for (const l of MORTGAGE_LOCALES) {
    for (const [k, v] of Object.entries(CALC_COPY[l])) if (typeof v === "string") assert.ok(v.trim(), `${l} ${k}`);
    for (const [k, v] of Object.entries(REVISION_COPY[l])) if (typeof v === "string") assert.ok(v.trim(), `${l} ${k}`);
  }
  assert.match(QUOTE.fein, /tendrá la consideración de oferta vinculante/);
  assert.match(QUOTE.art14, /antelación mínima de diez días naturales/);
  assert.equal(QUOTE.noNegative, "El interés remuneratorio en dichas operaciones no podrá ser negativo.");
  assert.deepEqual(EARLY_REPAYMENT.fixed, { firstYears: 10, firstCapPct: 2, afterCapPct: 1.5 });
});

test("page: titles and descriptions fit; neutral (no lender named, no affiliate link), disclaimer present", () => {
  for (const l of MORTGAGE_LOCALES) {
    const m = mortgageMeta(l, EURIBOR_SNAPSHOT.series);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}: ${m.description}`);
  }
  const files = ["src/components/programmatic/mortgage/MortgagePage.tsx", "src/components/programmatic/mortgage/MortgageCalculator.tsx", "src/components/programmatic/mortgage/RevisionCalculator.tsx", "src/lib/programmatic/mortgage/copy.ts", "src/components/programmatic/euribor/EuriborPage.tsx"];
  const banks = /\b(Santander|BBVA|CaixaBank|Sabadell|Bankinter|ING|Abanca|Unicaja|Kutxabank|Ibercaja|iAhorro|HelpMyCash|Rankia|idealista)\b/;
  for (const f of files) {
    const src = read(f);
    assert.doesNotMatch(src, banks, f);
    assert.doesNotMatch(src, /rel="sponsored"|[?&]utm_/, f);
  }
  const page = read("src/components/programmatic/mortgage/MortgagePage.tsx");
  assert.match(page, /no asesoramiento financiero/);
  assert.match(page, /<MoreCalculators current="mortgage" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\),/);
});

test("routes: one static route per language, daily revalidation, never dynamicParams = false; sitemap and llms.txt", () => {
  assert.deepEqual(mortgageEditions(), { es: "/es/calculadoras/hipoteca/", ca: "/ca/calculadores/hipoteca/", en: "/en/calculators/mortgage-calculator-spain/" });
  for (const l of MORTGAGE_LOCALES) {
    const src = readFileSync(join(APP, CALCULATORS_ROOT[l], mortgagePath(l).split("/")[3]!, "page.tsx"), "utf8");
    assert.match(src, new RegExp(`const LOCALE = "${l}";`));
    assert.match(src, /^export const revalidate = 86400;$/m);
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /loadEuriborData\(\)/);
  }
  const entries = mortgageSitemapEntries(EURIBOR_SNAPSHOT.series);
  assert.equal(entries.length, 3);
  for (const x of entries) assert.deepEqual(Object.keys(x.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.mortgageSitemapEntries\(EURIBOR_SNAPSHOT\.series\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: mortgageEditions\(\)/);
});
