import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CATALONIA_OPERATORS, CATALONIA_PRICES_AS_OF, GENCAT_ITV_READ, GENCAT_QUOTE, RETEST, cataloniaPrices, itvCataloniaCopy } from "../src/lib/programmatic/itv/catalonia.ts";
import { ITV_LOCALES } from "../src/lib/programmatic/itv/copy.ts";
import { PRICES_REREAD_BY } from "../src/lib/programmatic/itv/prices.ts";

/** "¿Cuánto cuesta la ITV en Cataluña?" (26 Nov 2026): figures from prices.ts, Generalitat words from the 26 Nov fixture. */

test("the Catalonia maximums come from the prices table (Ordre IUE/361/2010)", () => {
  const p = cataloniaPrices();
  assert.deepEqual([p.petrolCar, p.dieselCar, p.petrolVan, p.dieselVan, p.moto], [30.1, 34.22, 36.59, 41.98, 14.14]);
  assert.match(p.url, /^https:\/\/empresa\.gencat\.cat\//);
  assert.match(p.stationsUrl, /^https:\/\/canalempresa\.gencat\.cat\//);
});

test("the Generalitat's operators and rules are verbatim in the page read on 26 Nov 2026", () => {
  const fx = readFileSync(new URL("./fixtures/gencat-itv-20261126.txt", import.meta.url), "utf8");
  for (const o of CATALONIA_OPERATORS) assert.ok(fx.includes(o), o);
  for (const q of Object.values(GENCAT_QUOTE)) assert.ok(fx.includes(q), q);
  assert.deepEqual(RETEST, { pct: 60, months: 2, freeDays: 15 });
  assert.equal(GENCAT_ITV_READ, "2026-11-26");
});

test("answer and questions in three languages: the amounts, before VAT, the re-test rule, the six questions", () => {
  const amounts = { es: ["30,10", "34,22", "36,59", "41,98", "14,14"], ca: ["30,10", "34,22", "36,59", "41,98", "14,14"], en: ["30.10", "34.22", "36.59", "41.98", "14.14"] } as const;
  for (const l of ITV_LOCALES) {
    const c = itvCataloniaCopy(l);
    for (const a of amounts[l]) assert.ok(c.answer.includes(a), `${l}: ${a}`);
    assert.match(c.answer, /IVA|VAT/);
    assert.doesNotMatch(c.answer + c.faq.map((f) => f.a).join(" "), /4[,.]18/);
    assert.equal(c.faq.length, 6);
    assert.equal(new Set(c.faq.map((f) => f.q)).size, 6);
    for (const f of c.faq) assert.ok(f.q.endsWith("?"), f.q);
  }
  assert.equal(itvCataloniaCopy("es").faq[0]!.q, "¿Cuánto cuesta la ITV de un coche en Barcelona?");
});

test("page wiring: price H2 right after the calculator's next step, FAQ before the sources, one FAQPage from the same strings", () => {
  const page = readFileSync(new URL("../src/components/programmatic/itv/ItvPage.tsx", import.meta.url), "utf8");
  const next = page.indexOf('<CalculatorNextStep current="itv"');
  const h = page.indexOf('<h2 id="precio-cataluna">');
  assert.ok(next > 0 && h > next && h < page.indexOf('<h2 id="frecuencia">'));
  assert.ok(page.indexOf('<h2 id="preguntas">') < page.indexOf('<h2 id="fuentes">'));
  assert.equal(page.match(/"@type": "FAQPage"/g)?.length, 1);
  assert.match(page, /mainEntity: catCopy\.faq\.map/);
});

test("date guard: the Catalonia answer re-reads with the tariffs", () => {
  // The answer prints the prices.ts Catalonia row; re-read the DOGC order and the Generalitat page (operators,
  // 60 % re-test, 15 free days) when PRICES_REREAD_BY fires, then move GENCAT_ITV_READ.
  assert.ok(CATALONIA_PRICES_AS_OF <= GENCAT_ITV_READ);
  assert.ok(Date.now() < Date.parse(`${PRICES_REREAD_BY}T00:00:00Z`), "ITV: re-read the Catalonia tariff and the Generalitat ITV page");
});
