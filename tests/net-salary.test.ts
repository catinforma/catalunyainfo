import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, NET_LOCALES, NET_SLUG, TABLE_SALARIES, fillFigures, money, netSalaryEditions, netSalaryPath, parseAmount, percent, readHash, smiDeductionNote, writeHash } from "../src/lib/programmatic/net-salary/copy.ts";
import { DEFAULT_INPUT, calculateNetSalary, round2, scale, smiDeduction, trunc2, workReduction, type SalaryInput } from "../src/lib/programmatic/net-salary/engine.ts";
import { REGIONS, regionById } from "../src/lib/programmatic/net-salary/regions.ts";
import { AEAT_VALIDATION, IRPF, SALARY_RULES_AS_OF, SALARY_RULES_UNTIL, SALARY_RULES_YEAR, SMI_DEDUCTION, SOCIAL_SECURITY, SOURCES } from "../src/lib/programmatic/net-salary/rules-2026.ts";
import { netSalarySitemapEntries } from "../src/lib/programmatic/net-salary/sitemap.ts";

/**
 * The net salary calculator 2026 (lib/programmatic/net-salary/): the engine
 * against the AEAT's own retention service, the algorithm's worked example
 * and hand-checked cases, Social Security, the community rule, the browser
 * helpers, the pages, and the date guard for the 2027 rules.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const calc = (over: Partial<SalaryInput> = {}) => calculateNetSalary({ ...DEFAULT_INPUT, ...over });

interface AeatCase {
  id: string;
  input: SalaryInput;
  cotizacionesSent: number;
  aeat: { rate: number; annual: number; base: number; minimum: number };
}
const FIXTURE = JSON.parse(read("tests/fixtures/net-salary-aeat-2026.json")) as { calledOn: string; cases: AeatCase[] };

/* -------------------------------------------------------------------------- */
/* The AEAT's own calculation                                                 */
/* -------------------------------------------------------------------------- */

test("AEAT service: every recorded case gives the AEAT's rate, annual withholding, base and minimum", () => {
  assert.equal(FIXTURE.cases.length, AEAT_VALIDATION.cases, "AEAT_VALIDATION.cases is printed on the page");
  assert.equal(FIXTURE.calledOn, AEAT_VALIDATION.date);
  for (const c of FIXTURE.cases) {
    const r = calculateNetSalary(c.input);
    // The service was sent our own contributions: they must not have drifted since.
    assert.equal(r.ss.annual, c.cotizacionesSent, `${c.id}: contributions changed since the AEAT check — re-run it`);
    assert.equal(r.irpf.rate, c.aeat.rate, `${c.id}: rate`);
    assert.equal(r.irpf.annual, c.aeat.annual, `${c.id}: annual withholding`);
    assert.equal(round2(r.irpf.base), c.aeat.base, `${c.id}: base`);
    assert.equal(r.irpf.minimum, c.aeat.minimum, `${c.id}: personal and family minimum`);
  }
});

test("AEAT service cases cover every branch the calculator offers", () => {
  const ids = FIXTURE.cases.map((c) => c.id).join(" ");
  for (const needle of ["exempt", "limit43", "short-contract", "solidarity", "top-rate", "s1-", "s2-", "under3", "age-65", "age-75", "disability-33", "disability-65", "ceuta", "melilla", "la-palma", "mobility", "housing", "fixed-term", "madrid"]) {
    assert.ok(ids.includes(needle), needle);
  }
  // The page says "de 12.000 a 350.000 €".
  const grosses = FIXTURE.cases.map((c) => c.input.gross);
  assert.equal(Math.min(...grosses), 12000);
  assert.equal(Math.max(...grosses), 350000);
});

/* -------------------------------------------------------------------------- */
/* The algorithm's own example and hand-checked cases                         */
/* -------------------------------------------------------------------------- */

test("algorithm page 29: the scale on a base of 24,000.00 is 5,365.50", () => {
  assert.equal(round2(scale(24000)), 5365.5);
  assert.equal(scale(0), 0);
  assert.equal(scale(12450), 2365.5);
  assert.equal(round2(scale(300000)), 125901.5);
  // Every row's cuota is the previous row's plus its band.
  for (let i = 1; i < IRPF.scale.length; i++) {
    const [from, cuota] = IRPF.scale[i]!;
    const [pFrom, pCuota, pRate] = IRPF.scale[i - 1]!;
    assert.equal(round2(pCuota + ((from - pFrom) * pRate) / 100), cuota, `row ${i}`);
  }
});

test("hand check: 30,000 € in Catalonia, single, no children, open-ended, 14 payments", () => {
  const r = calc();
  // SS: 2,500 € base × 6.50 % = 162.50 € a month.
  assert.equal(r.ss.baseMonthly, 2500);
  assert.equal(r.ss.monthly, 162.5);
  assert.equal(r.ss.annual, 1950);
  // RNT 28,050; no reduction (> 19,747.50); − 2,000 → base 26,050.
  assert.equal(r.irpf.netIncome, 28050);
  assert.equal(r.irpf.workReduction, 0);
  assert.equal(r.irpf.base, 26050);
  // 4,225.50 + 5,850 × 30 % = 5,980.50; minimum 5,550 × 19 % = 1,054.50; 4,926.
  assert.equal(r.irpf.cuota1, 5980.5);
  assert.equal(r.irpf.cuota2, 1054.5);
  assert.equal(r.irpf.cuota, 4926);
  assert.equal(r.irpf.rate, 16.42);
  assert.equal(r.irpf.annual, 4926);
  assert.equal(r.net.annual, 23124);
  // 2,142.86 − 351.86 − 162.50; extras without contributions.
  assert.equal(r.net.perPayment, 1628.5);
  assert.equal(r.net.extraPayment, 1791);
  assert.equal(r.net.monthlyAverage, 1927);
  assert.equal(r.effectiveRate, 22.92);
});

test("hand check: 16,500 € (situation 3) — work reduction second band and the 43 % limit", () => {
  const r = calc({ gross: 16500 });
  // RNT 15,427.50: 7,302 − 1.75 × 575.50 = 6,294.875 → 6,294.88.
  assert.equal(workReduction(15427.5), 6294.88);
  assert.equal(r.irpf.limited, true);
  // Limit (16,500 − 15,876) × 0.43 = 268.32 → 1.6261 % → 1.62 %.
  assert.equal(round2(r.irpf.cuota), 268.32);
  assert.equal(r.irpf.rate, 1.62);
  assert.equal(calc({ gross: 16500, contract: "short" }).irpf.rate, 2);
});

test("rounding helpers: REDONDEAR1 rounds 0.005 up, TRUNCAR never loses a cent to binary noise", () => {
  assert.equal(round2(0.005), 0.01);
  assert.equal(round2(6294.875), 6294.88);
  assert.equal(trunc2(17.85964523), 17.85);
  assert.equal(trunc2((4926 / 30000) * 100), 16.42);
  assert.equal(trunc2(0.1 + 0.2), 0.3);
});

/* -------------------------------------------------------------------------- */
/* Social Security                                                            */
/* -------------------------------------------------------------------------- */

test("social security: 6.50 % open-ended, 6.55 % fixed-term, capped at the maximum base, solidarity above it", () => {
  const s = SOCIAL_SECURITY.rates;
  assert.equal(round2(s.commonContingencies + s.unemploymentOpenEnded + s.vocationalTraining + s.intergenerationalEquity), 6.5);
  assert.equal(round2(s.commonContingencies + s.unemploymentFixedTerm + s.vocationalTraining + s.intergenerationalEquity), 6.55);
  assert.equal(calc({ gross: 40000, contract: "fixed-term" }).ss.annual, round2(round2((40000 / 12) * 0.047) * 12 + round2((40000 / 12) * 0.016) * 12 + round2((40000 / 12) * 0.001) * 12 + round2((40000 / 12) * 0.0015) * 12));
  // The short contract pays the fixed-term unemployment rate too.
  assert.equal(calc({ contract: "short" }).ss.annual, calc({ contract: "fixed-term" }).ss.annual);

  const atMax = calc({ gross: SOCIAL_SECURITY.maxBaseMonthly * 12 });
  assert.equal(atMax.ss.baseMonthly, 5101.2);
  assert.ok(!atMax.ss.lines.some((l) => l.key === "solidarity"));
  const high = calc({ gross: 100000 });
  assert.equal(high.ss.baseMonthly, 5101.2);
  assert.equal(high.ss.capped, true);
  // 8,333.33 a month: 510.12 × 0.19 % + 2,040.48 × 0.21 % + 681.53 × 0.24 % = 6.89.
  assert.equal(high.ss.lines.find((l) => l.key === "solidarity")?.monthly, 6.89);
  // Every line but solidarity is the same as at the cap.
  assert.equal(high.ss.lines.filter((l) => l.key !== "solidarity").reduce((a, l) => a + l.annual, 0), atMax.ss.annual);
  assert.equal(calc({ gross: 15000 }).ss.belowMinimum, true);
  assert.equal(calc({ gross: 17200 }).ss.belowMinimum, false);
});

test("social security figures are the Orden PJC/297/2026 ones", () => {
  assert.equal(SOCIAL_SECURITY.maxBaseMonthly, 5101.2);
  assert.equal(SOCIAL_SECURITY.minBaseMonthly, 1424.4);
  assert.deepEqual(SOCIAL_SECURITY.solidarity.map(([to, r]) => [to, r]), [
    [5611.32, 0.19],
    [7651.8, 0.21],
    [Infinity, 0.24],
  ]);
  assert.equal(SOURCES.contributions.ref, "BOE-A-2026-7296");
});

/* -------------------------------------------------------------------------- */
/* Communities                                                                */
/* -------------------------------------------------------------------------- */

test("communities: 15 common-regime, identical result in every one; Ceuta, Melilla, La Palma reduced; Navarra and Basque Country unsupported", () => {
  const common = REGIONS.filter((r) => r.regime === "common");
  assert.equal(common.length, 15);
  assert.deepEqual(REGIONS.filter((r) => r.regime === "ceuta-melilla").map((r) => r.id).sort(), ["ceuta", "la-palma", "melilla"]);
  assert.deepEqual(REGIONS.filter((r) => r.regime === "foral").map((r) => r.id).sort(), ["navarra", "pais-vasco"]);
  assert.equal(new Set(REGIONS.map((r) => r.id)).size, REGIONS.length);
  for (const over of [{}, { gross: 18000 }, { gross: 65000, family: 2 as const, children: 2 }, { gross: 24000, age: "75plus" as const }]) {
    const base = calc({ ...over, region: "cataluna" });
    for (const r of common) {
      const x = calc({ ...over, region: r.id });
      assert.equal(x.net.annual, base.net.annual, r.id);
      assert.equal(x.irpf.rate, base.irpf.rate, r.id);
    }
  }
  const ceuta = calc({ region: "ceuta" });
  assert.equal(ceuta.irpf.reducedByCeuta, true);
  assert.ok(ceuta.irpf.rate < calc().irpf.rate);
  assert.equal(calc({ region: "navarra" }).supported, false);
  assert.equal(calc({ region: "pais-vasco" }).supported, false);
  assert.equal(calc({ region: "cataluna" }).supported, true);
});

/* -------------------------------------------------------------------------- */
/* Invariants                                                                 */
/* -------------------------------------------------------------------------- */

test("invariants: payments add up to the annual net; net never falls when gross rises (open-ended contract)", () => {
  for (let gross = 8000; gross <= 200000; gross += 250) {
    const r14 = calc({ gross });
    const r12 = calc({ gross, payments: 12 });
    assert.equal(r14.net.annual, r12.net.annual, `${gross}: 12 vs 14`);
    assert.ok(Math.abs(r14.net.perPayment * 12 + r14.net.extraPayment! * 2 - r14.net.annual) <= 0.07 + 1e-9, `${gross}: 14 payments`);
    assert.ok(Math.abs(r12.net.perPayment * 12 - r12.net.annual) <= 0.06 + 1e-9, `${gross}: 12 payments`);
    assert.equal(round2(gross - r14.ss.annual - r14.irpf.annual), r14.net.annual);
    if (gross > 8000) {
      const prev = calc({ gross: gross - 250 });
      assert.ok(r14.net.annual >= prev.net.annual, `${gross}: net fell from ${prev.net.annual} to ${r14.net.annual}`);
    }
  }
  // Children, age and disability can only lower withholding.
  const base = calc({ gross: 42000 });
  for (const over of [{ children: 1 }, { children: 3, childrenUnder3: 1 }, { age: "65to74" as const }, { disability: "33" as const }, { mobility: true }]) {
    assert.ok(calc({ gross: 42000, ...over }).irpf.annual <= base.irpf.annual, JSON.stringify(over));
  }
});

test("inputs: situation 1 without children is situation 3; under-3 never exceeds children; bad numbers are zero", () => {
  assert.equal(calc({ family: 1, children: 0 }).input.family, 3);
  assert.equal(calc({ children: 1, childrenUnder3: 4 }).input.childrenUnder3, 1);
  assert.equal(calc({ gross: Number.NaN }).net.annual, 0);
  assert.equal(calc({ gross: -5 }).input.gross, 0);
});

/* -------------------------------------------------------------------------- */
/* Browser helpers                                                            */
/* -------------------------------------------------------------------------- */

test("money and percent are deterministic and grouped", () => {
  assert.equal(money(1628.5, "es"), "1.628,50 €");
  assert.equal(money(30000, "ca", 0), "30.000 €");
  assert.equal(money(1628.5, "en"), "€1,628.50");
  assert.equal(money(125901.5, "es"), "125.901,50 €");
  assert.equal(percent(16.42, "es"), "16,42 %");
  assert.equal(percent(16.42, "en"), "16.42%");
  assert.equal(fillFigures("{max} / {min} / {housing}", "es"), "5.101,20 € / 1.424,40 € / 33.007,20 €");
});

test("parseAmount reads what people type", () => {
  const cases: [string, number][] = [
    ["30000", 30000],
    ["30.000", 30000],
    ["30,000", 30000],
    ["30 000 €", 30000],
    ["1.250.000", 1250000],
    ["30.000,50", 30000.5],
    ["30,000.50", 30000.5],
    ["1500,5", 1500.5],
    ["1500.5", 1500.5],
    ["", 0],
    ["abc", 0],
  ];
  for (const [text, value] of cases) assert.equal(parseAmount(text), value, text);
});

test("the URL hash round-trips every input and ignores junk", () => {
  const s: SalaryInput = { gross: 41500, payments: 12, region: "madrid", age: "65to74", family: 2, children: 3, childrenUnder3: 1, childrenWhole: true, disability: "33mobility", contract: "short", mobility: true, housingLoan: true };
  assert.deepEqual(readHash(writeHash(s), DEFAULT_INPUT, (id) => Boolean(regionById(id))), s);
  assert.deepEqual(readHash(writeHash(DEFAULT_INPUT), DEFAULT_INPUT, (id) => Boolean(regionById(id))), DEFAULT_INPUT);
  const junk = readHash("#b=-4&n=13&r=atlantis&f=9&h=99&c=x", DEFAULT_INPUT, (id) => Boolean(regionById(id)));
  assert.deepEqual(junk, DEFAULT_INPUT);
});

test("copy: every locale has every string; percentages in the words match the rules", () => {
  const keys = Object.keys(CALC_COPY.es).sort();
  for (const l of NET_LOCALES) assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), keys, l);
  assert.equal(IRPF.limitRate, 0.43);
  assert.equal(IRPF.ceutaFactor, 0.4);
  assert.equal(IRPF.minRateShortContract, 2);
  for (const l of NET_LOCALES) {
    assert.match(CALC_COPY[l].limited, /43/);
    assert.match(CALC_COPY[l].ceuta, /60/);
  }
  const page = read("src/components/programmatic/net-salary/NetSalaryPage.tsx");
  assert.ok(!/\b(5\.101|1\.424|33\.007|6,50|16,42)\b/.test(page), "no figure typed into the page: compute it");
  // The client component imports nothing server-side.
  const client = read("src/components/programmatic/net-salary/NetSalaryCalculator.tsx");
  assert.match(client, /^"use client";/);
  assert.ok(!client.includes("@/lib/site"));
});

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

test("pages: one static folder per language under the calculators root", () => {
  assert.deepEqual(netSalaryEditions(), {
    ca: "/ca/calculadores/sou-net/",
    es: "/es/calculadoras/sueldo-neto/",
    en: "/en/calculators/net-salary-spain/",
  });
  assert.deepEqual(calculatorSlugs("net-salary"), NET_SLUG);
  for (const locale of NET_LOCALES) {
    assert.ok(netSalaryPath(locale).startsWith(`/${locale}/${CALCULATORS_ROOT[locale]}/`));
    const source = readFileSync(join(APP, CALCULATORS_ROOT[locale], NET_SLUG[locale], "page.tsx"), "utf8");
    assert.match(source, /^export const revalidate = false;$/m);
    assert.match(source, /^export const dynamicParams = true;$/m);
    assert.match(source, new RegExp(`if \\(locale !== "${locale}"\\) notFound\\(\\);`));
    assert.match(source, new RegExp(`<NetSalaryRoute locale="${locale}" />`));
  }
});

test("sitemap: the three pages, reciprocal hreflang, x-default English like the HTML", () => {
  const entries = netSalarySitemapEntries();
  assert.equal(entries.length, 3);
  const urls = entries.map((e) => e.url);
  for (const e of entries) {
    const languages = e.alternates?.languages as Record<string, string>;
    assert.deepEqual(Object.keys(languages).sort(), ["ca", "en", "es", "x-default"]);
    for (const href of Object.values(languages)) assert.ok(urls.includes(href), href);
    assert.equal(languages["x-default"], languages.en);
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.netSalarySitemapEntries\(\)/);
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the rules' as-of date is not in the future and sources are dated in the rules year", () => {
  assert.equal(SALARY_RULES_YEAR, 2026);
  assert.ok(Date.parse(`${SALARY_RULES_AS_OF}T00:00:00Z`) <= Date.now(), "SALARY_RULES_AS_OF in the future");
  for (const s of Object.values(SOURCES)) assert.ok(s.date.startsWith(String(SALARY_RULES_YEAR)), s.ref);
});

test("date guard: from 1 January 2027 the calculator needs the 2027 AEAT algorithm and contribution order", () => {
  // On 1 January the 2026 withholding algorithm and Orden PJC/297/2026 stop applying. Load the AEAT's
  // "Algoritmo de cálculo del tipo de retención 2027" (sede.agenciatributaria.gob.es/Sede/Retenciones.shtml),
  // the 2027 Orden de cotización (BOE) — or, until it is out, the decree-law that sets the 2027 bases —
  // into a rules-2027.ts, re-run the AEAT service check (PER for 2027), and move the page to 2027.
  assert.ok(Date.now() < Date.parse(`${SALARY_RULES_UNTIL}T00:00:00Z`), "Net salary calculator: load the 2027 AEAT algorithm and contribution rules");
});

/* -------------------------------------------------------------------------- */
/* The SMI deduction (DA 61.ª LIRPF, RDL 5/2026 art. 28): Renta, not payroll  */
/* -------------------------------------------------------------------------- */

test("SMI deduction: the law's amounts (590.89 up to 17,094; −0.2 per euro above; nothing from 20,048.45)", () => {
  assert.deepEqual({ ...SMI_DEDUCTION }, { full: 590.89, fullUpTo: 17094, endBelow: 20048.45, slope: 0.2, otherIncomeMax: 6500, returnYear: 2026 });
  assert.equal(smiDeduction(0), 0);
  assert.equal(smiDeduction(12000), 590.89);
  assert.equal(smiDeduction(17094), 590.89);
  assert.equal(smiDeduction(18000), 409.69);
  assert.equal(smiDeduction(20048), 0.09);
  assert.equal(smiDeduction(20048.45), 0);
  assert.equal(smiDeduction(30000), 0);
  // Letter b) meets zero exactly at the limit: no jump.
  assert.ok(Math.abs(SMI_DEDUCTION.full - SMI_DEDUCTION.slope * (SMI_DEDUCTION.endBelow - SMI_DEDUCTION.fullUpTo)) < 0.005);
});

test("SMI deduction: the AEAT's own service withholds at the SMI, so withholding does not include it", () => {
  const smi = FIXTURE.cases.find((c) => c.id === "smi-2026-17094-da61")!;
  assert.equal(smi.input.gross, SMI_DEDUCTION.fullUpTo);
  assert.equal(smi.aeat.annual, 523.08);
  assert.equal(smi.aeat.rate, 3.06);
  const end = FIXTURE.cases.find((c) => c.id === "da61-phaseout-end-20048")!;
  assert.ok(end.aeat.annual > 0);
  // So the engine keeps withholding as the AEAT does and only flags the deduction.
  const r = calc({ gross: SMI_DEDUCTION.fullUpTo });
  assert.equal(r.irpf.annual, 523.08);
  assert.deepEqual(r.smiDeduction, { deduction: 590.89, full: true, applies: true });
});

test("SMI deduction note: in the result when something is withheld below 20,048.45 €, never above or when exempt or foral", () => {
  for (const l of NET_LOCALES) {
    const full = smiDeductionNote(calc({ gross: 17094 }), l)!;
    assert.ok(full.includes(money(523.08, l)) && full.includes(money(590.89, l)) && full.includes(money(17094, l, 0)), l);
    assert.match(full, /61/);
    assert.match(full, /5\/2026/);
    const mid = smiDeductionNote(calc({ gross: 18000 }), l)!;
    assert.ok(mid.includes(money(409.69, l)) && mid.includes(money(20048.45, l)) && mid.includes("20"), l);
    assert.notEqual(mid, full);
    assert.equal(smiDeductionNote(calc({ gross: 20048.45 }), l), null);
    assert.equal(smiDeductionNote(calc({ gross: 30000 }), l), null);
    // Exempt (situation 2 at the SMI): nothing withheld, nothing to get back.
    assert.equal(smiDeductionNote(calc({ gross: 17094, family: 2 }), l), null);
    assert.equal(smiDeductionNote(calc({ gross: 17094, region: "navarra" }), l), null);
  }
  // Short contracts: the 2 % floor withholds even under the exempt threshold.
  assert.ok(calc({ gross: 12000, contract: "short" }).smiDeduction.applies);
  const client = read("src/components/programmatic/net-salary/NetSalaryCalculator.tsx");
  assert.match(client, /smiDeductionNote\(r, locale\)/);
});

test("net-by-gross table: every 1,000 € from 15,000 to 60,000 €, in 14 and 12 payments, server-rendered", () => {
  for (let g = 15000; g <= 60000; g += 1000) assert.ok(TABLE_SALARIES.includes(g), String(g));
  assert.deepEqual([...TABLE_SALARIES].sort((a, b) => a - b), [...TABLE_SALARIES]);
  const page = read("src/components/programmatic/net-salary/NetSalaryPage.tsx");
  assert.match(page, /r12\.net\.perPayment/);
  assert.match(page, /r14\.net\.perPayment/);
  assert.match(page, /id="smi"/);
  // Net grows with gross along the table.
  let last = 0;
  for (const g of TABLE_SALARIES) {
    const n = calc({ gross: g }).net.annual;
    assert.ok(n > last, String(g));
    last = n;
  }
});
