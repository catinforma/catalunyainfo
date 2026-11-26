import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CALC_LOCALES } from "../src/lib/programmatic/calculators/paths.ts";
import { serviceMonths } from "../src/lib/programmatic/employment/dates.ts";
import { EXAMPLE_END, EXAMPLE_SALARY, EXAMPLE_YEARS, dismissalExampleCopy, startFor, yearsRows } from "../src/lib/programmatic/employment/dismissal-examples.ts";
import { REFORM_2012, RULES_AS_OF } from "../src/lib/programmatic/employment/rules.ts";

/**
 * The dismissal page's examples by years worked (26 Nov 2026). Hand checks:
 * 24.000 € / 365 = 65,7534… € a day; unfair 33 days a year, objective 20,
 * fixed-term 12 (ET arts. 56.1, 53.1.b, 49.1.c, re-read on boe.es 26 Nov 2026).
 */

const daily = EXAMPLE_SALARY / 365;
const eur = (days: number) => Math.round(days * daily * 100) / 100;

test("every example is whole years of service, after the 2012 reform, ending on the rules' date", () => {
  assert.equal(EXAMPLE_END, RULES_AS_OF);
  for (const y of EXAMPLE_YEARS) {
    const start = startFor(y);
    assert.ok(start >= REFORM_2012, `${y} years start ${start}`);
    const s = serviceMonths(start, EXAMPLE_END);
    assert.equal(s.months, 12 * y, `${y} years`);
    assert.equal(s.extraDays, 0);
  }
  assert.equal(startFor(1), "2025-11-14");
});

test("the table: 33 and 20 days per year, amounts = days × 24.000/365, no cap reached", () => {
  const rows = yearsRows();
  assert.deepEqual(rows.map((r) => [r.years, r.unfair.days, r.objective.days]), [
    [1, 33, 20],
    [2, 66, 40],
    [3, 99, 60],
    [5, 165, 100],
    [10, 330, 200],
    [14, 462, 280],
  ]);
  for (const r of rows) {
    assert.equal(r.unfair.amount, eur(r.unfair.days));
    assert.equal(r.objective.amount, eur(r.objective.days));
  }
  // 1 year: 2.169,86 € unfair, 1.315,07 € objective; a one-year fixed-term contract: 12 days, 789,04 €.
  assert.equal(rows[0]!.unfair.amount, 2169.86);
  assert.equal(rows[0]!.objective.amount, 1315.07);
  assert.equal(rows[0]!.temporary.days, 12);
  assert.equal(rows[0]!.temporary.amount, 789.04);
  assert.equal(rows[5]!.unfair.amount, 30378.08);
});

test("the questions are worded as the searches, carry the engine's figures, and are the same count in the three languages", () => {
  const want = { es: ["2.169,86", "10.849,32", "6.575,34", "21.698,63", "13.150,68", "789,04"], ca: ["2.169,86", "10.849,32", "6.575,34", "21.698,63", "13.150,68", "789,04"], en: ["2,169.86", "10,849.32", "6,575.34", "21,698.63", "13,150.68", "789.04"] } as const;
  for (const locale of CALC_LOCALES) {
    const c = dismissalExampleCopy(locale);
    assert.equal(c.faq.length, 4);
    assert.equal(new Set(c.faq.map((f) => f.q)).size, 4);
    const text = c.faq.map((f) => f.a).join(" ");
    for (const piece of want[locale].slice(1)) assert.ok(text.includes(piece), `${locale}: ${piece}`);
    assert.ok(c.note.includes("18"), `${locale}: objective cap after 18 years`);
    for (const f of c.faq) assert.ok(f.q.endsWith("?") && f.a.length > 80, f.q);
  }
  assert.match(dismissalExampleCopy("es").faq[0]!.q, /^¿Cuántos días por año corresponden en un despido improcedente\?$/);
  assert.match(dismissalExampleCopy("es").faq[1]!.q, /despido procedente/);
});

test("page wiring: the table under the rules table, the FAQ printed and passed to the layout's FAQPage", () => {
  const page = readFileSync(new URL("../src/components/programmatic/employment/DismissalPage.tsx", import.meta.url), "utf8");
  assert.match(page, /<h2 id="por-anos">\{ex2\.title\}<\/h2>/);
  assert.ok(page.indexOf('<h2 id="tabla">') < page.indexOf('<h2 id="por-anos">'));
  assert.ok(page.indexOf('<h2 id="por-anos">') < page.indexOf('<h2 id="calculo">'));
  assert.match(page, /faq=\{faqLd\}/);
  assert.match(page, /ex2\.faq\.map\(\(f\) =>/);
  assert.match(page, /<h3>\{f\.q\}<\/h3>/);
});
