import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { SL_LOCALES } from "../src/lib/programmatic/sick-leave/copy.ts";
import { ANSWER_BASE, CATALONIA, EXAMPLE_BASES, baseRows, sickExampleCopy } from "../src/lib/programmatic/sick-leave/examples.ts";

/**
 * The sick-leave page's examples by base (26 Nov 2026). Hand checks for a baja
 * from 1 Dec 2026 (RDL 31/2026 rules), common illness: days 1-3 nothing, 4-20
 * (17 days) at 60 %, 21-30 (10 days) at 75 % of base/30; days 31-60 at 75 %;
 * work accident: day 1 salary, days 2-30 (29 days) at 75 %.
 */

const hand = (base: number) => {
  const d = base / 30;
  const r = (x: number) => Math.round(x * 100) / 100;
  return { first: r(r(17 * d * 0.6) + r(10 * d * 0.75)), next: r(30 * d * 0.75), accident: r(29 * d * 0.75) };
};

test("table: first month 59 % of the base, next months 75 %, work accident 29 days at 75 %", () => {
  const rows = baseRows();
  assert.deepEqual(rows.map((r) => r.base), [...EXAMPLE_BASES]);
  for (const r of rows) {
    const h = hand(r.base);
    assert.equal(r.firstMonth, h.first, `${r.base} first`);
    assert.equal(r.nextMonth, h.next, `${r.base} next`);
    assert.equal(r.accidentMonth, h.accident, `${r.base} accident`);
    assert.equal(r.firstShare, 59);
  }
  const r1500 = rows.find((r) => r.base === 1500)!;
  assert.deepEqual([r1500.firstMonth, r1500.nextMonth, r1500.accidentMonth], [885, 1125, 1087.5]);
});

test("the questions carry the engine's 1.500 € figures in the three languages; the Catalonia answer is there", () => {
  assert.equal(ANSWER_BASE, 1500);
  const want = { es: ["885,00", "1.125,00", "1.087,50", "59\u00a0%"], ca: ["885,00", "1.125,00", "1.087,50", "59\u00a0%"], en: ["885.00", "1,125.00", "1,087.50", "59%"] } as const;
  for (const l of SL_LOCALES) {
    const c = sickExampleCopy(l);
    assert.equal(c.faq.length, 3);
    const text = c.faq.map((f) => f.a).join(" ");
    for (const w of want[l]) assert.ok(text.includes(w), `${l}: ${w}`);
    assert.match(c.faq[2]!.q, /Catalu|Catalonia/);
    assert.ok(c.cat.includes("2023"), l);
  }
});

test("Catalonia: the Canal Salut quotes are verbatim in the 26 Nov 2026 fixture, and the sources are gencat pages", () => {
  const fx = readFileSync(new URL("./fixtures/canalsalut-baixa-20261126.txt", import.meta.url), "utf8");
  for (const q of [CATALONIA.quoteNotice, CATALONIA.quoteNoPaper, CATALONIA.quoteFollowUp, CATALONIA.quoteNoShow]) assert.ok(fx.includes(q), q.slice(0, 50));
  for (const u of [CATALONIA.notice, CATALONIA.followUp]) {
    assert.equal(new URL(u).host, "canalsalut.gencat.cat");
    assert.ok(fx.includes(u), u);
  }
});

test("page wiring: the examples table after the day-by-day section, the Catalonia H2, the questions in the FAQ (and its FAQPage)", () => {
  const page = readFileSync(new URL("../src/components/programmatic/sick-leave/SickLeavePage.tsx", import.meta.url), "utf8");
  assert.ok(page.indexOf('<h2 id="porcentajes">') < page.indexOf('<h2 id="ejemplos">'));
  assert.ok(page.indexOf('<h2 id="ejemplos">') < page.indexOf('<h2 id="cambios-diciembre-2026">'));
  assert.match(page, /<h2 id="cataluna">\{ex26\.catTitle\}<\/h2>/);
  assert.match(page, /faq\.push\(\.\.\.ex26\.faq\);/);
  assert.match(page, /mainEntity: faq\.map/);
});
