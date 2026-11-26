import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ISD_LOCALES } from "../src/lib/programmatic/inheritance-tax/copy.ts";
import { compareCopy, compareRows } from "../src/lib/programmatic/gift-tax/compare.ts";

/**
 * Valencia vs Catalonia, the same gift (26 Nov 2026). Hand checks:
 *  - Valencia, son 30, 100.000 €: kinship reduction 100.000 € (art. 10 bis.2.a) → base 0 → 0 €.
 *  - Catalonia, son 30, 100.000 € with deed: reduced scale 5 % up to 200.000 € → 5.000 €.
 *  - Catalonia, son 30, 300.000 €: 200.000 × 5 % + 100.000 × 7 % = 17.000 €.
 *  - Valencia, son 30, 300.000 €: 318,53 € (the page's own first example).
 */

test("the four cases through both engines", () => {
  const rows = compareRows();
  const by = (id: string) => rows.find((r) => r.id === id)!;
  assert.equal(by("son-100k").valencia, 0);
  assert.equal(by("son-100k").catalonia, 5000);
  assert.equal(by("son-300k").valencia, 318.53);
  assert.equal(by("son-300k").catalonia, 17000);
  for (const r of rows) assert.ok(r.valencia >= 0 && r.catalonia >= 0, r.id);
  // Brother, 100.000 €: Catalonia general scale 50.000 × 7 % + 50.000 × 11 % = 9.000 € × 1,5882 (group III) = 14.293,80 €; Valencia 14.874,53 € (the page example, 25 % rebate). Grandchild 60.000 €: Valencia 0 (100.000 € reduction), Catalonia 5 % = 3.000 €.
  assert.deepEqual([by("brother-100k").catalonia, by("brother-100k").valencia, by("grandchild-60k").valencia, by("grandchild-60k").catalonia], [14293.8, 14874.53, 0, 3000]);
});

test("the questions carry the engine figures in the three languages", () => {
  for (const l of ISD_LOCALES) {
    const c = compareCopy(l);
    assert.equal(c.faq.length, 2);
    const all = c.faq.map((f) => f.a).join(" ");
    assert.ok(all.includes(l === "en" ? "€5,000" : "5.000"), `${l}: 5.000`);
    assert.ok(all.includes(l === "en" ? "17,000" : "17.000"), `${l}: 17.000`);
    assert.ok(all.includes(l === "en" ? "318.53" : "318,53"), `${l}: 318,53`);
    for (const f of c.faq) assert.ok(f.q.endsWith("?"));
  }
  assert.equal(compareCopy("es").faq[0]!.q, "¿Cuánto se paga por donar 100.000 euros a un hijo en la Comunidad Valenciana?");
});

test("page wiring: only the Valencia page shows the comparison, and its questions go into the FAQ (and its FAQPage)", () => {
  const body = readFileSync(new URL("../src/components/programmatic/gift-tax/GiftTaxBody.tsx", import.meta.url), "utf8");
  assert.match(body, /region === "valencia" \? compareCopy\(locale\) : null/);
  assert.match(body, /<h2 id="valencia-o-cataluna">/);
  assert.match(body, /\.\.\.\(cmp \? cmp\.faq : \[\]\)/);
});
