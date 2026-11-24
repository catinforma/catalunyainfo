import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { PENSION_LOCALES, euros } from "../src/lib/programmatic/pensions-2027/copy.ts";
import { revaluationStatus, revaluePension } from "../src/lib/programmatic/pensions-2027/engine.ts";
import {
  EXAMPLE_PENSIONS,
  PNC_MONTHLY_2026,
  RET65_SINGLE_MONTHLY_2026,
  exampleCopy,
  exampleRows,
  rateAnswer,
} from "../src/lib/programmatic/pensions-2027/examples.ts";
import { statusOn } from "../src/lib/programmatic/pensions-2027/page.ts";
import { INE_FINAL_DAY, INE_FLASH_DAY, PNC_2026_ANNUAL, type FlashFigure, type Official2027 } from "../src/lib/programmatic/pensions-2027/rules.ts";
import { RENT_SNAPSHOT } from "../src/lib/programmatic/rent-update/data.ts";

/**
 * The pensions 2027 page's worked examples and questions (25 Nov 2026): rows
 * from `revaluePension` at the percentage on screen, answers that change with
 * the state of the figure and never print a 2027 amount the BOE has not.
 */

const IPC = RENT_SNAPSHOT.series.ipc;
const FLASH: FlashFigure = { month: "2026-11", value: 3.1, published: "2026-11-27", url: "https://www.ine.es/" };
const OFFICIAL: Official2027 = { percent: 3.4, norm: "Real Decreto-ley 1/2027", boeId: "BOE-A-2027-1", published: "2027-01-10", url: "https://www.boe.es/", minimums: null, pncAnnual: null };

test("rows: 14 payments, each from revaluePension at the page's percentage (hand check at 3.5 %)", () => {
  const rows = exampleRows(3.5);
  assert.deepEqual(rows.map((r) => r.monthly2026), [...EXAMPLE_PENSIONS]);
  const by = (m: number) => rows.find((r) => r.monthly2026 === m)!;
  assert.equal(by(1000).monthly2027, 1035);
  assert.equal(by(1000).monthlyRise, 35);
  assert.equal(by(1000).annualRise, 490); // 35 × 14
  assert.equal(by(700).monthly2027, 724.5);
  assert.equal(by(3000).monthlyRise, 105);
  for (const r of rows) {
    const direct = revaluePension({ monthly: r.monthly2026, payments: 14 }, 3.5);
    assert.equal(direct.status === "ok" && direct.monthly2027, r.monthly2027);
  }
  assert.equal(exampleRows(0)[0]!.monthlyRise, 0); // art. 58.3: a negative mean leaves pensions as they are
});

test("the 2026 figures in the minimums and non-contributory answer are the BOE's, as monthly of 14 payments", () => {
  assert.equal(RET65_SINGLE_MONTHLY_2026, 936.2); // 13.106,80 ÷ 14, RD 241/2026 anexo I
  assert.equal(PNC_MONTHLY_2026, 628.8); // 8.803,20 ÷ 14
  assert.equal(PNC_2026_ANNUAL, 8803.2);
  const status = statusOn(IPC, "2026-11-25");
  for (const locale of PENSION_LOCALES) {
    const c = exampleCopy(locale, status);
    const min = c.faq[2]!.a;
    for (const x of [13_106.8, 936.2, 8803.2, 628.8]) assert.ok(min.includes(euros(x, locale)), `${locale}: ${euros(x, locale)}`);
    // No 2027 amount is printed for the minimums: no euro figure with "2027" next to it.
    assert.doesNotMatch(min, /2027[^.]{0,20}\d\.\d{3},\d{2}/);
  }
});

test("the first answer follows the state of the figure: provisional, flash, final, official", () => {
  const prov = revaluationStatus(IPC, "2026-11-25", null, null)!;
  assert.equal(prov.kind, "provisional");
  assert.match(rateAnswer("es", prov), /De momento, el 3,47 %/);
  assert.match(rateAnswer("es", prov), /27 de noviembre de 2026/);
  assert.match(rateAnswer("es", prov), /15 de diciembre de 2026/);
  assert.match(rateAnswer("ca", prov), /De moment, el 3,47 %/);
  assert.match(rateAnswer("en", prov), /For now, 3\.47%/);
  const flash = revaluationStatus(IPC, "2026-11-27", FLASH, null)!;
  assert.equal(flash.kind, "flash");
  assert.match(rateAnswer("es", flash), /IPC adelantado de noviembre \(3,1 %/);
  const official = revaluationStatus(IPC, "2027-01-10", FLASH, OFFICIAL)!;
  assert.equal(official.kind, "official");
  assert.match(rateAnswer("es", official), /3,4 %: es oficial \(Real Decreto-ley 1\/2027, BOE del 10 de enero de 2027\)/);
  assert.match(rateAnswer("en", official), /3\.4%: it is official/);
  assert.match(rateAnswer("es", null), /art\. 58\.2/);
  assert.equal(INE_FLASH_DAY, "2026-11-27");
  assert.equal(INE_FINAL_DAY, "2026-12-15");
});

test("five questions per language, the 1.000 € answer equals the table's row, every locale is complete", () => {
  const status = statusOn(IPC, "2026-11-25")!;
  const rows = exampleRows(status.percent);
  for (const locale of PENSION_LOCALES) {
    const c = exampleCopy(locale, status);
    assert.equal(c.faq.length, 5);
    assert.equal(new Set(c.faq.map((f) => f.q)).size, 5);
    assert.ok(c.title && c.intro && c.caption && c.note && c.faqTitle);
    assert.equal(c.cols.length, 4);
    const thousand = rows.find((r) => r.monthly2026 === 1000)!;
    const fmt = (x: number) => euros(x, locale);
    assert.ok(c.faq[4]!.a.includes(fmt(thousand.monthly2027)), `${locale}: ${fmt(thousand.monthly2027)} in ${c.faq[4]!.a}`);
    for (const f of c.faq) assert.ok(f.q.length > 20 && f.a.length > 60, `${locale}: ${f.q}`);
  }
});

test("the page prints the questions it puts in FAQPage, and the table", () => {
  const page = readFileSync(new URL("../src/components/programmatic/pensions-2027/PensionPage.tsx", import.meta.url), "utf8");
  assert.match(page, /ex\.faq\.map\(\(f\) =>\s*\(\s*<section key=\{f\.q\}>\s*<h3>\{f\.q\}<\/h3>\s*<p>\{f\.a\}<\/p>/);
  assert.match(page, /mainEntity: ex\.faq\.map/);
  assert.match(page, /<h2 id="ejemplos">\{ex\.title\}<\/h2>/);
});
