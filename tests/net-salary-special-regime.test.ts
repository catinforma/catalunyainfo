import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, COMPARE_SALARIES, NET_LOCALES, money, readHash, specialFigures, writeHash } from "../src/lib/programmatic/net-salary/copy.ts";
import { DEFAULT_INPUT, breakEvenGross, calculateNetSalary, calculateSpecialRegime, compareRegimes, specialRegimeTax, type SalaryInput } from "../src/lib/programmatic/net-salary/engine.ts";
import { REGIONS, regionById } from "../src/lib/programmatic/net-salary/regions.ts";
import { AEAT_EXAMPLES, NON_RESIDENT, REGISTRATION_LINKS, SPECIAL_QUOTES, SPECIAL_REGIME, SPECIAL_REGIME_AS_OF, SPECIAL_REGIME_RECHECK_BY, SPECIAL_SOURCES } from "../src/lib/programmatic/net-salary/special-regime.ts";

/**
 * The special regime for posted workers ("Beckham law", art. 93 LIRPF) in the
 * net salary calculator: the art. 93 scale against the AEAT's own modelo 151
 * examples, worked examples computed by hand from the rules, the comparison
 * with the standard withholding, the pages' words and the yearly re-check.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const input = (over: Partial<SalaryInput> = {}): SalaryInput => ({ ...DEFAULT_INPUT, ...over });

/* -------------------------------------------------------------------------- */
/* The rule                                                                   */
/* -------------------------------------------------------------------------- */

test("special regime: the art. 93 LIRPF figures, as read on 18 Nov 2026", () => {
  assert.equal(SPECIAL_REGIME.rate, 24);
  assert.equal(SPECIAL_REGIME.topRate, 47);
  assert.equal(SPECIAL_REGIME.threshold, 600000);
  assert.equal(SPECIAL_REGIME.followingYears, 5);
  assert.equal(SPECIAL_REGIME.priorNonResidentYears, 5);
  assert.equal(SPECIAL_REGIME.optionMonths, 6);
  assert.equal(SPECIAL_REGIME.residenceDays, 183);
  assert.equal(SPECIAL_REGIME.exclusionMonths, 1, "the pages write 'one month' / 'un mes'");
  assert.deepEqual([...SPECIAL_REGIME.waiverMonths], [11, 12], "the pages write November and December");
  assert.deepEqual({ ...NON_RESIDENT }, { general: 24, euEea: 19 });
  // The quotes printed on the page say the same as the constants.
  assert.match(SPECIAL_QUOTES.art93, /durante los cinco períodos impositivos siguientes$/);
  assert.match(SPECIAL_QUOTES.art116, /^en el plazo máximo de seis meses desde la fecha de inicio de la actividad que conste en el alta en la Seguridad Social en España/);
  assert.ok(SPECIAL_QUOTES.art9.includes(`más de ${SPECIAL_REGIME.residenceDays} días, durante el año natural`));
});

test("special regime: the AEAT's own modelo 151 examples (750,000 € → 214,500 €; 200,000 € → 48,000 €)", () => {
  assert.equal(AEAT_EXAMPLES.length, 2);
  for (const { base, tax } of AEAT_EXAMPLES) assert.equal(specialRegimeTax(base).annual, tax, String(base));
  const big = specialRegimeTax(750000);
  assert.equal(big.upToThreshold, 144000, "Hasta 600.000 al 24 por 100: 144.000 euros");
  assert.equal(big.above, 70500, "Resto: 150.000 al 47 por 100: 70.500 euros");
});

test("special regime: 24 % up to 600,000 €, 47 % only on the excess", () => {
  assert.deepEqual(specialRegimeTax(0), { upToThreshold: 0, above: 0, annual: 0, rate: 0 });
  assert.equal(specialRegimeTax(30000).annual, 7200);
  assert.equal(specialRegimeTax(30000).rate, 24);
  assert.equal(specialRegimeTax(600000).annual, 144000);
  assert.equal(specialRegimeTax(600001).annual, 144000.47);
  // 700,000 €: 144,000 + 100,000 × 47 % = 191,000 €, 27.29 % on average.
  assert.deepEqual(specialRegimeTax(700000), { upToThreshold: 144000, above: 47000, annual: 191000, rate: 27.29 });
  assert.equal(specialRegimeTax(-5).annual, 0);
});

/* -------------------------------------------------------------------------- */
/* Worked examples, computed by hand from the rules                           */
/* -------------------------------------------------------------------------- */

test("worked example: 30,000 €, 14 payments, open-ended — the special regime leaves 2,274 € less than standard withholding", () => {
  // Social Security (Orden PJC/297/2026): 2,500 €/month × 6.50 % = 162.50 €/month, 1,950 €/year — same in both regimes.
  // Special: 24 % × 30,000 = 7,200 €. Net: 30,000 − 1,950 − 7,200 = 20,850 €.
  // Per payment: 30,000 / 14 × 0.76 = 1,628.57 (extra) − 162.50 = 1,466.07 (ordinary).
  const r = calculateSpecialRegime(input());
  assert.equal(r.supported, true);
  assert.equal(r.ss.annual, 1950);
  assert.equal(r.tax.annual, 7200);
  assert.equal(r.net.annual, 20850);
  assert.equal(r.net.perPayment, 1466.07);
  assert.equal(r.net.extraPayment, 1628.57);
  assert.equal(r.effectiveRate, 30.5);
  // Standard (AEAT algorithm, checked against the AEAT service): 4,926 € withheld, 23,124 € net.
  const c = compareRegimes(input());
  assert.equal(c.standard.irpf.annual, 4926);
  assert.equal(c.standard.net.annual, 23124);
  assert.equal(c.difference, -2274);
});

test("worked example: 100,000 €, 12 payments — capped Social Security, 24,000 € of tax, 8,110 € more than standard withholding", () => {
  // Base capped at 5,101.20 €: 239.76 + 79.07 + 5.10 + 7.65 = 331.58 €/month; solidarity on 8,333.33 €/month:
  // 510.12 × 0.19 % + 2,040.48 × 0.21 % + 681.53 × 0.24 % = 6.89 €/month. 338.47 × 12 = 4,061.64 €/year.
  const r = calculateSpecialRegime(input({ gross: 100000, payments: 12 }));
  assert.equal(r.ss.annual, 4061.64);
  assert.equal(r.tax.annual, 24000);
  assert.equal(r.net.annual, 71938.36);
  // 100,000 / 12 × 0.76 − 338.47 = 5,994.86.
  assert.equal(r.net.perPayment, 5994.86);
  assert.equal(r.net.extraPayment, null);
  const c = compareRegimes(input({ gross: 100000, payments: 12 }));
  assert.equal(c.standard.irpf.annual, 32110);
  assert.equal(c.difference, 32110 - 24000);
});

test("worked example: 700,000 € — 47 % on the 100,000 € above the threshold", () => {
  const r = calculateSpecialRegime(input({ gross: 700000 }));
  assert.equal(r.tax.annual, 191000);
  assert.equal(r.tax.rate, 27.29);
  assert.equal(r.net.annual, Math.round((700000 - r.ss.annual - 191000) * 100) / 100);
});

/* -------------------------------------------------------------------------- */
/* Invariants                                                                 */
/* -------------------------------------------------------------------------- */

test("special regime: same Social Security as the standard result; payments add up", () => {
  for (let gross = 10000; gross <= 750000; gross += 2500) {
    for (const contract of ["open-ended", "fixed-term"] as const) {
      const std = calculateNetSalary(input({ gross, contract }));
      const sp = calculateSpecialRegime(input({ gross, contract }));
      assert.deepEqual(sp.ss, std.ss, `${gross} ${contract}`);
    }
    const r14 = calculateSpecialRegime(input({ gross }));
    const r12 = calculateSpecialRegime(input({ gross, payments: 12 }));
    assert.equal(r14.net.annual, r12.net.annual);
    assert.ok(Math.abs(r14.net.perPayment * 12 + r14.net.extraPayment! * 2 - r14.net.annual) <= 0.07 + 1e-9, `${gross}: 14 payments`);
    assert.ok(Math.abs(r12.net.perPayment * 12 - r12.net.annual) <= 0.06 + 1e-9, `${gross}: 12 payments`);
  }
});

test("special regime: no regional scale, no family allowances; Navarra and the Basque Country unsupported", () => {
  const base = calculateSpecialRegime(input({ gross: 80000 }));
  for (const region of REGIONS) {
    const r = calculateSpecialRegime(input({ gross: 80000, region: region.id }));
    if (region.regime === "foral") assert.equal(r.supported, false, region.id);
    else {
      assert.equal(r.supported, true, region.id);
      // Ceuta, Melilla and La Palma too: art. 114.2.b RIRPF lists no such deduction.
      assert.equal(r.tax.annual, base.tax.annual, region.id);
      assert.equal(r.net.annual, base.net.annual, region.id);
    }
  }
  for (const over of [{ children: 3, childrenUnder3: 1 }, { age: "75plus" as const }, { disability: "65" as const }, { family: 2 as const }, { mobility: true }, { housingLoan: true }]) {
    assert.equal(calculateSpecialRegime(input({ gross: 80000, ...over })).tax.annual, base.tax.annual, JSON.stringify(over));
  }
});

test("break-even: one crossing; single 57,564 €, two children 61,973 € (2026 rules)", () => {
  for (const over of [{}, { children: 2 }]) {
    let flips = 0;
    let prev: boolean | null = null;
    for (let gross = 15000; gross <= 600000; gross += 250) {
      const better = compareRegimes(input({ gross, ...over })).difference > 0;
      if (prev !== null && better !== prev) flips++;
      prev = better;
    }
    assert.equal(flips, 1, JSON.stringify(over));
    const be = breakEvenGross(input(over))!;
    assert.ok(compareRegimes(input({ gross: be, ...over })).difference > 0);
    assert.ok(compareRegimes(input({ gross: be - 1, ...over })).difference <= 0);
  }
  assert.equal(breakEvenGross(DEFAULT_INPUT), 57564);
  assert.equal(breakEvenGross(input({ children: 2 })), 61973);
});

/* -------------------------------------------------------------------------- */
/* Browser helpers, words, pages                                              */
/* -------------------------------------------------------------------------- */

test("hash: e=1 turns the special regime on and off; the default stays unchanged", () => {
  const known = (id: string) => Boolean(regionById(id));
  assert.ok(!writeHash(DEFAULT_INPUT).includes("e=1"));
  const on = input({ specialRegime: true });
  assert.ok(writeHash(on).includes("e=1"));
  assert.equal(readHash(writeHash(on), DEFAULT_INPUT, known).specialRegime, true);
  assert.equal(readHash("#b=30000", on, known).specialRegime, false);
});

test("calculator words: the special regime in every locale, with the rule's figures", () => {
  for (const l of NET_LOCALES) {
    const t = CALC_COPY[l];
    const f = specialFigures(l);
    assert.match(t.regimeOptions.special, /Beckham/);
    assert.equal(t.compareCols.length, 3);
    const a = t.specialAssumptions(f);
    assert.equal(a.length, 5, l);
    assert.ok(a[1]!.includes(f.rate) && a[1]!.includes(f.top) && a[1]!.includes(money(SPECIAL_REGIME.threshold, l, 0)), l);
    assert.ok(a[0]!.includes(String(SPECIAL_REGIME.optionMonths)), l);
    assert.ok(t.differenceMore(money(10, l)).includes(money(10, l)));
    assert.ok(t.differenceLess(money(10, l)).includes(money(10, l)));
  }
  const client = read("src/components/programmatic/net-salary/NetSalaryCalculator.tsx");
  assert.match(client, /calculateSpecialRegime\(input\)/);
  assert.match(client, /update\(\{ specialRegime: e\.target\.value === "special" \}\)/);
  assert.ok(!client.includes("SpecialRegimeSections"), "the page sections stay on the server");
});

test("pages: the expat sections in all three editions, English first; FAQ, sources and limits", async () => {
  const page = read("src/components/programmatic/net-salary/NetSalaryPage.tsx");
  assert.match(page, /\{expatFirst \? expatSections : null\}/);
  assert.match(page, /\{expatFirst \? null : expatSections\}/);
  assert.match(page, /const expatFirst = locale === "en";/);
  assert.match(page, /mainEntity: allFaq\.map/);
  assert.match(page, /<SpecialRegimeSources locale=\{locale\} \/>/);
  assert.match(page, /specialRegimeLimit\(locale\)/);
  const sections = read("src/components/programmatic/net-salary/SpecialRegimeSections.tsx");
  for (const id of ["tax-spain", "beckham", "residency", "nie"]) assert.match(sections, new RegExp(`<h2 id="${id}">`), id);
  assert.ok(!/\b(600[.,]000|57[.,]564|61[.,]973|214[.,]500|48[.,]000|7[.,]200)\b/.test(sections), "no figure typed into the sections: compute it");
  // The calculator links to the section.
  assert.match(read("src/components/programmatic/net-salary/NetSalaryCalculator.tsx"), /href="#beckham"/);
  const { specialRegimeFaq, FAQ_GROSS } = await import("../src/lib/programmatic/net-salary/special-copy.ts");
  const c = compareRegimes(input({ gross: FAQ_GROSS }));
  for (const l of NET_LOCALES) {
    const faq = specialRegimeFaq(l);
    assert.equal(faq.length, 7, l);
    assert.ok(faq[0]!.q.includes(money(FAQ_GROSS, l, 0)), l);
    assert.ok(faq[0]!.a.includes(money(c.standard.irpf.annual, l)) && faq[0]!.a.includes(money(c.special.tax.annual, l)), l);
  }
  assert.ok(COMPARE_SALARIES.some((g) => g > SPECIAL_REGIME.threshold), "the table shows the 47 % band");
});

test("sources: official only (BOE, AEAT, Seguridad Social, Ministry e-office), dated, read on the as-of date", () => {
  for (const s of Object.values(SPECIAL_SOURCES)) {
    assert.match(s.url, /^https:\/\/(www\.boe\.es|sede\.agenciatributaria\.gob\.es)\//, s.url);
    assert.ok(Date.parse(`${s.date}T00:00:00Z`) <= Date.parse(`${SPECIAL_REGIME_AS_OF}T00:00:00Z`), s.name);
  }
  assert.match(REGISTRATION_LINKS.nuss, /^https:\/\/portal\.seg-social\.gob\.es\//);
  assert.match(REGISTRATION_LINKS.foreignersAppointment, /^https:\/\/mptmd\.sede\.gob\.es\//);
});

test("date guard: the special regime's rules are re-read every year with the 2027 rules (from 1 January 2027)", () => {
  assert.ok(Date.parse(`${SPECIAL_REGIME_AS_OF}T00:00:00Z`) <= Date.now(), "SPECIAL_REGIME_AS_OF in the future");
  // Re-read LIRPF art. 93 (consolidated BOE-A-2006-20764: check its "Última actualización" line), RIRPF arts. 113-120,
  // TRLIRNR arts. 24-25 and the AEAT modelo 149/151 pages; update special-regime.ts, SPECIAL_REGIME_AS_OF and this date.
  assert.ok(Date.now() < Date.parse(`${SPECIAL_REGIME_RECHECK_BY}T00:00:00Z`), "Special regime (Beckham law): re-read art. 93 LIRPF and arts. 113-120 RIRPF for 2027");
});
