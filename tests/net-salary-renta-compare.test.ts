import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CATALAN_SCALE, INCOME_TAX_YEAR, scaleTax, taxExample } from "../src/lib/content/batch02/income-tax.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { NET_LOCALES, TABLE_SALARIES, money, percent } from "../src/lib/programmatic/net-salary/copy.ts";
import { DEFAULT_INPUT, calculateNetSalary } from "../src/lib/programmatic/net-salary/engine.ts";
import {
  COMPARE_GROSS,
  FAQ_GROSS,
  MADRID_MINIMUM,
  MADRID_SCALE,
  MADRID_SCALE_PRINTED,
  QUICK_GROSS,
  REGIONAL_SOURCES,
  REGIONAL_TAX_AS_OF,
  REGIONAL_TAX_REREAD_BY,
  quickAnswer,
  quickAnswers,
  regionalCopy,
  regionalRow,
  regionalRows,
  rentaText,
  searcherFaq,
} from "../src/lib/programmatic/net-salary/renta-compare.ts";
import { SALARY_RULES_YEAR, SOCIAL_SECURITY } from "../src/lib/programmatic/net-salary/rules-2026.ts";

/**
 * Net salary page, 27 Nov 2026: the "X € brutos = Y € netos" sentences, the
 * Catalonia vs Madrid annual-return table and the FAQ entries added in the
 * searchers' words (lib/programmatic/net-salary/renta-compare.ts).
 */

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const calc = (gross: number, payments: 12 | 14) => calculateNetSalary({ ...DEFAULT_INPUT, gross, payments });

test("quick answers: every amount is a row of the table, and each sentence carries the engine's figures", () => {
  for (const g of QUICK_GROSS) assert.ok(TABLE_SALARIES.includes(g), String(g));
  for (const g of COMPARE_GROSS) assert.ok(TABLE_SALARIES.includes(g), String(g));
  for (const l of NET_LOCALES) {
    const list = quickAnswers(l);
    assert.equal(list.length, QUICK_GROSS.length);
    for (const q of list) {
      const r14 = calc(q.gross, 14);
      const r12 = calc(q.gross, 12);
      assert.equal(q.anchor, `neto-${q.gross}`);
      for (const v of [money(q.gross, l, 0), money(r14.net.perPayment, l), money(r14.net.extraPayment!, l), money(r12.net.perPayment, l), money(r14.net.annual, l)]) {
        assert.ok(q.text.includes(v), `${l} ${q.gross}: ${v} in «${q.text}»`);
      }
      // The SMI-deduction mark only where the table has it.
      assert.equal(q.text.includes("†"), r14.smiDeduction.applies, `${l} ${q.gross}`);
    }
  }
});

test("12 vs 14 payments: same year, extras without contributions, net grows with gross", () => {
  let last12 = 0;
  let last14 = 0;
  for (const g of TABLE_SALARIES) {
    const r12 = calc(g, 12);
    const r14 = calc(g, 14);
    assert.equal(r12.net.annual, r14.net.annual, String(g));
    assert.equal(r12.net.extraPayment, null);
    const extra = r14.net.extraPayment!;
    // Payments are rounded to the cent one by one: the year adds up within a few cents.
    assert.ok(Math.abs(r12.net.perPayment * 12 - r12.net.annual) < 0.1, `12: ${g}`);
    assert.ok(Math.abs(r14.net.perPayment * 12 + extra * 2 - r14.net.annual) < 0.1, `14: ${g}`);
    assert.ok(extra > r14.net.perPayment, `extra > ordinary: ${g}`);
    assert.ok(r12.net.perPayment > r14.net.perPayment, `12 > 14 per payslip: ${g}`);
    assert.ok(r12.net.perPayment > last12 && r14.net.perPayment > last14, `monotonic: ${g}`);
    last12 = r12.net.perPayment;
    last14 = r14.net.perPayment;
  }
});

test("Madrid scale: the BOE's cuota column rebuilds from the bands; minimum 5,956.65 €", () => {
  assert.deepEqual(
    MADRID_SCALE.map((b) => scaleTax(MADRID_SCALE, b.from)),
    [...MADRID_SCALE_PRINTED],
  );
  assert.deepEqual(MADRID_SCALE.map((b) => b.rate), [8.5, 10.7, 12.8, 17.4, 20.5]);
  assert.equal(MADRID_MINIMUM, 5956.65);
  assert.match(REGIONAL_SOURCES.madrid.url, /^https:\/\/www\.boe\.es\/buscar\/act\.php\?id=BOCM-m-2010-90068$/);
  assert.match(REGIONAL_SOURCES.catalonia.ref, /BOE-A-2025-10270/);
});

test("Catalonia vs Madrid: same withholding, final tax from the guide's engine, Catalonia higher and the gap grows", () => {
  let lastDiff = 0;
  for (const row of regionalRows()) {
    // Withholding does not depend on the common-regime region (one AEAT scale).
    const cat = calculateNetSalary({ ...DEFAULT_INPUT, gross: row.gross, region: "cataluna" });
    const mad = calculateNetSalary({ ...DEFAULT_INPUT, gross: row.gross, region: "madrid" });
    assert.equal(cat.irpf.annual, mad.irpf.annual);
    assert.equal(row.withheld, cat.irpf.annual);
    // Parity with the income-tax guide (same base, State and Catalan cuota).
    const t = taxExample(row.gross);
    assert.equal(row.totalCatalonia, t.total);
    assert.equal(row.state, t.state);
    assert.equal(row.base, t.base);
    assert.ok(row.madrid < row.catalonia, String(row.gross));
    assert.ok(row.difference > lastDiff, String(row.gross));
    assert.equal(Math.round((row.totalCatalonia - row.totalMadrid) * 100) / 100, row.difference);
    assert.equal(Math.round((row.gross - row.socialSecurity - row.totalCatalonia) * 100) / 100, row.netCatalonia);
    lastDiff = row.difference;
  }
  // Hand check of 30,000 €: base 26,050 €; Madrid: 1,739.53 + (26,050 − 19,004.63) × 12.8 % = 2,641.34,
  // minus the scale on 5,956.65 (506.33) = 2,135.01.
  const r = regionalRow(30000);
  assert.equal(r.base, 26050);
  assert.equal(r.madrid, 2135.01);
  assert.equal(r.withheld, 4926);
  assert.equal(r.totalCatalonia, 4958.75);
});

test("Catalonia vs Madrid copy: figures and scales from the data, in three languages", () => {
  const r = regionalRow(FAQ_GROSS);
  for (const l of NET_LOCALES) {
    const c = regionalCopy(l);
    const text = c.paras.join(" ");
    for (const v of [money(r.totalCatalonia, l), money(r.totalMadrid, l), money(r.difference, l), money(r.withheld, l), money(MADRID_MINIMUM, l)]) {
      assert.ok(text.includes(v), `${l}: ${v}`);
    }
    assert.ok(text.includes(percent(CATALAN_SCALE[CATALAN_SCALE.length - 1]!.rate, l, 1)), l);
    assert.ok(text.includes(percent(MADRID_SCALE[0]!.rate, l, 1)), l);
    assert.ok(c.faqTail.includes(money(r.difference, l)), l);
    assert.equal(c.cols.length, 6);
    assert.ok(c.guideHref.startsWith(`/${l}/`), l);
  }
  assert.equal(rentaText(32.75, "es"), `a pagar ${money(32.75, "es")}`);
  assert.equal(rentaText(-10, "ca"), `a retornar ${money(10, "ca")}`);
  assert.equal(rentaText(-10, "en"), `a refund of ${money(10, "en")}`);
});

test("FAQ in the searchers' words: 30,000 € net, Social Security 2026 with MEI and employer share, minimum withholding, self-employed link", () => {
  const ex = calc(FAQ_GROSS, 14);
  const S = SOCIAL_SECURITY;
  for (const l of NET_LOCALES) {
    const f = searcherFaq(l);
    assert.ok(f.first.q.includes(money(FAQ_GROSS, l, 0)), l);
    assert.ok(f.first.a.startsWith(quickAnswer(FAQ_GROSS, l).text), l);
    assert.equal(f.rest.length, 3);
    const [ss, min, se] = f.rest as [typeof f.first, typeof f.first, typeof f.first];
    assert.ok(ss.a.includes(percent(6.5, l)) && ss.a.includes(percent(6.55, l)), `${l}: 6.50 / 6.55`);
    assert.ok(ss.a.includes(percent(S.rates.intergenerationalEquity, l)) && ss.a.includes("MEI"), l);
    assert.ok(ss.a.includes(money(ex.ss.monthly, l)) && ss.a.includes(money(S.maxBaseMonthly, l)), l);
    assert.ok(ss.a.includes(percent(30.65, l)), `${l}: employer 23.60 + 5.50 + 0.20 + 0.60 + 0.75`);
    assert.ok(min.a.includes(money(15876, l, 0)) && min.a.includes(percent(2, l)), l);
    assert.equal(se.link?.href, calcPath("self-employed", l));
    for (const e of [f.first, ...f.rest]) assert.ok(!/undefined|NaN/.test(e.q + e.a), l);
  }
});

test("page: quick list above the table, Catalonia-Madrid section, FAQ entries in the FAQPage, sources listed", () => {
  const page = read("src/components/programmatic/net-salary/NetSalaryPage.tsx");
  assert.match(page, /<a href=\{`#\$\{q\.anchor\}`\}>/);
  assert.match(page, /id=\{`neto-\$\{gross\}`\}/);
  assert.ok(page.indexOf("quickAnswersIntro(locale)") < page.indexOf('className="ci-local-table"'));
  assert.match(page, /<h2 id="cataluna-madrid">\{rc\.h2\}<\/h2>/);
  assert.match(page, /\[sFaq\.first, \.\.\.faq, \.\.\.sFaq\.rest\]/);
  assert.match(page, /mainEntity: allFaq\.map/);
  assert.match(page, /\$\{rc\.faqTail\}/);
  assert.match(page, /REGIONAL_SOURCES\.catalonia, REGIONAL_SOURCES\.madrid\]/);
  assert.match(page, /<Link href=\{f\.link\.href\}>/);
});

test("date guard: Catalan and Madrid scales re-read before 15 Jan 2027 (a 2027 tax law can change them)", () => {
  assert.equal(REGIONAL_TAX_AS_OF, "2026-11-27");
  assert.equal(INCOME_TAX_YEAR, SALARY_RULES_YEAR);
  assert.ok(
    Date.now() < Date.parse(`${REGIONAL_TAX_REREAD_BY}T00:00:00Z`),
    "Re-read the Catalan scale (art. 611-1 Codi tributari, BOE-A-2025-10270 and later DOGC laws) and Madrid's DLeg 1/2010 arts. 1-2 (BOE consolidated BOCM-m-2010-90068) for 2027, update renta-compare.ts and the dates",
  );
});
