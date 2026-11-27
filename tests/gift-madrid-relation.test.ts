import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ISD_LOCALES, money } from "../src/lib/programmatic/inheritance-tax/copy.ts";
import { MADRID_AMOUNTS, madridRelationCopy, madridRelationRows } from "../src/lib/programmatic/gift-tax/madrid-by-relation.ts";
import { MADRID_GIFT_QUOTE } from "../src/lib/programmatic/gift-tax/regions/madrid.ts";

/**
 * Madrid gift tax by relationship (27 Nov 2026). Hand check on 10.000 € (art. 23
 * scale: 8.313,20 € at 7,65 % = 635,96 €, then 1.686,80 € at 8,50 % = 143,38 €):
 * cuota íntegra 779,34 €.
 *  - son (group II, coefficient 1, 99 %): 7,79 €.
 *  - brother (group III, 1,5882 → 1.237,75 €, 50 %): 618,87 €.
 *  - friend (group IV, coefficient 2, no rebate): 1.558,68 €.
 */

test("the four amounts through the Madrid engine, hand-checked at 10.000 €", () => {
  const rows = madridRelationRows();
  assert.deepEqual(rows.map((r) => r.amount), [...MADRID_AMOUNTS]);
  const r10 = rows[0]!;
  assert.equal(r10.child.quotaIntegra, 779.34);
  assert.deepEqual([r10.child.group, r10.sibling.group, r10.friend.group], ["II", "III", "IV"]);
  assert.deepEqual([r10.child.toPay, r10.sibling.toPay, r10.friend.toPay], [7.79, 618.87, 1558.68]);
  assert.equal(r10.friend.coefficient, 2);
  for (const r of rows) {
    assert.ok(r.child.toPay < r.sibling.toPay && r.sibling.toPay < r.friend.toPay, String(r.amount));
    assert.equal(r.friend.toPay, r.friend.quotaTributaria, `${r.amount}: no rebate for a friend`);
  }
  // The rates the table names are the law's (art. 25.2 b), as re-read on 27 Nov 2026).
  assert.match(MADRID_GIFT_QUOTE.bonusGroupsIandII, /bonificación del 99 por ciento/);
  assert.match(MADRID_GIFT_QUOTE.bonusGroupIII, /bonificación del 50 por ciento/);
  assert.match(MADRID_GIFT_QUOTE.publicDocument, /superior a 10\.000 euros/);
});

test("the two questions carry the engine figures in the three languages", () => {
  const rows = madridRelationRows();
  for (const l of ISD_LOCALES) {
    const c = madridRelationCopy(l);
    assert.equal(c.cols.length, 4);
    assert.equal(c.faq.length, 2);
    const [ten, friend] = c.faq;
    for (const n of [rows[0]!.child.toPay, rows[0]!.sibling.toPay, rows[0]!.friend.toPay]) assert.ok(ten!.a.includes(money(n, l)), `${l}: ${n}`);
    for (const n of [rows[0]!.friend.toPay, rows[1]!.friend.toPay, rows[2]!.friend.toPay, rows[2]!.child.toPay]) assert.ok(friend!.a.includes(money(n, l)), `${l}: ${n}`);
    for (const f of c.faq) assert.ok(f.q.endsWith("?") && !/NaN|undefined/.test(f.a));
  }
  assert.equal(madridRelationCopy("es").faq[0]!.q, "¿Cuánto se paga por una donación de 10.000 euros en Madrid?");
  assert.equal(madridRelationCopy("es").faq[1]!.q, "¿Cuánto paga un amigo por una donación en Madrid?");
});

test("page wiring: only the Madrid page shows the table, and its questions go into the FAQ (and its FAQPage)", () => {
  const body = readFileSync(new URL("../src/components/programmatic/gift-tax/GiftTaxBody.tsx", import.meta.url), "utf8");
  assert.match(body, /region === "madrid" \? madridRelationCopy\(locale\) : null/);
  assert.match(body, /<h2 id="segun-parentesco">/);
  assert.match(body, /\.\.\.\(byRel \? byRel\.faq : \[\]\)/);
});
