import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CALC_LOCALES } from "../src/lib/programmatic/calculators/paths.ts";
import { DAILY_EXAMPLE_BASE, daysRows, exampleCopy, exampleFigures } from "../src/lib/programmatic/employment/unemployment-examples.ts";

/**
 * The unemployment calculator's worked examples (25 Nov 2026). Hand checks from
 * the 2026 rule: IPREM 600 € a month, limits = IPREM + 1/6 = 700 € × 80 % and
 * × 175 % without children (LGSS art. 270.3: 560 € and 1.225 €), 70 % for the
 * first 180 days and 60 % after (art. 270.2), 30 days a month, 4.85 % of the base
 * to Social Security, the art. 269.1 scale (360 → 120 days, 1.080 → 360).
 */

test("table of days: the art. 269.1 scale and the totals (120 days on 28 €/day = 3.360 €)", () => {
  const rows = daysRows();
  assert.deepEqual(rows.map((r) => [r.days, r.benefitDays, r.months]), [
    [360, 120, 4],
    [720, 240, 8],
    [1080, 360, 12],
    [1440, 480, 16],
    [2160, 720, 24],
  ]);
  assert.deepEqual(rows[0]!.totals, [3360, 4900]); // 120 × 840/30 ; 120 × 1.225/30
  // 1.080 days on 1.200: 180 days at 28 € + 180 days at 24 € = 5.040 + 4.320
  assert.equal(rows[2]!.totals[0], 9360);
  // 2.160 days on 1.200: 180 × 28 + 540 × 24
  assert.equal(rows[4]!.totals[0], 5040 + 12_960);
});

test("figures printed in the FAQ come from the engine, in the three languages", () => {
  const f = exampleFigures();
  assert.equal(f.limits.min, 560);
  assert.equal(f.limits.max, 1225);
  assert.equal(f.oneYear.benefitDays, 120);
  assert.equal(f.threeYears.benefitDays, 360);
  // 1.500 € a month = 50 €/day; 70 % = 35 €/day, 60 % = 30 €/day: below the maximum, so the plain percentages show.
  assert.equal(DAILY_EXAMPLE_BASE, 1500);
  assert.equal(f.daily.baseDaily, 50);
  assert.equal(f.daily.firstDaily, 35);
  assert.equal(f.daily.afterDaily, 30);
  for (const locale of CALC_LOCALES) {
    const c = exampleCopy(locale);
    assert.equal(c.faq.length, 4);
    assert.equal(new Set(c.faq.map((q) => q.q)).size, 4);
    const text = c.faq.map((q) => q.a).join(" ");
    for (const piece of ["35", "120", "360"]) assert.ok(text.includes(piece), `${locale}: ${piece}`);
    assert.ok(c.faq.every((q) => q.q.length > 20 && q.a.length > 60));
  }
});

test("the page prints every FAQ question, and the layout emits FAQPage from the same strings", () => {
  const page = readFileSync(new URL("../src/components/programmatic/employment/UnemploymentPage.tsx", import.meta.url), "utf8");
  assert.match(page, /ex2\.faq\.map\(\(f, i\) =>/);
  assert.match(page, /<h3>\{f\.q\}<\/h3>/);
  assert.match(page, /faq=\{ex2\.faq\}/);
  const layout = readFileSync(new URL("../src/components/programmatic/employment/CalcLayout.tsx", import.meta.url), "utf8");
  assert.match(layout, /"@type": "FAQPage"/);
  // Only the unemployment page passes questions: the other two employment calculators stay without FAQPage.
  for (const other of ["DismissalPage", "SettlementPage"]) {
    assert.doesNotMatch(readFileSync(new URL(`../src/components/programmatic/employment/${other}.tsx`, import.meta.url), "utf8"), /faq=\{/);
  }
});
