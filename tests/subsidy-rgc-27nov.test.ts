import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { IRSC_2026, RGC_GUIDE_URL, RGC_INCOME_2_MONTHS, RGC_MAX_MONTHLY, RGC_READ_BY, RGC_SOURCE, rgcCopy } from "../src/lib/programmatic/unemployment-subsidy/catalonia-rgc.ts";

/**
 * Batch 8R (27 Nov 2026, ci-edicio): the Generalitat's Renda Garantida de
 * Ciutadania on the subsidy checker, "what if the subsidy ends" (ca/es/en).
 * Figures as the Generalitat's tràmit page prints them (updated 03.11.2026,
 * read 27 Nov 2026); the one-person amount is the 2026 IRSC (DOGC 9706).
 */

const LOCALES = ["es", "ca", "en"] as const;
const today = () => new Date().toISOString().slice(0, 10);
const sp = (s: string) => s.replace(/[  ]/g, " ");

test("RGC 2026: one person = the 2026 IRSC; income ceiling = two months of each amount; official Generalitat hosts", () => {
  assert.equal(RGC_MAX_MONTHLY[0], IRSC_2026.monthly);
  assert.deepEqual(RGC_MAX_MONTHLY, [801.85, 1202.77, 1323.05, 1443.33, 1459.36]);
  RGC_MAX_MONTHLY.forEach((v, i) => assert.equal(Math.round(v * 2 * 100) / 100, RGC_INCOME_2_MONTHS[i]));
  assert.match(RGC_SOURCE.url, /^https:\/\/tramits\.gencat\.cat\//);
  assert.match(RGC_GUIDE_URL, /^https:\/\/dretssocials\.gencat\.cat\//);
  assert.ok(RGC_SOURCE.updated <= RGC_SOURCE.readOn);
});

test(`date guard: re-read the RGC tràmit and the 2027 IRSC before ${RGC_READ_BY}`, () => {
  assert.ok(
    today() < RGC_READ_BY,
    "RGC: re-read https://tramits.gencat.cat/ca/tramits/tramits-temes/rgc_complement_estatal_activable (amounts, income table, requirements, 'Data d'actualització') and the 2027 IRSC (Generalitat budget law or its extension, DOGC); update catalonia-rgc.ts and move RGC_READ_BY.",
  );
});

test("copy: heading, 5-row table, FAQ with the amounts and the IMV-first rule, in ca/es/en", () => {
  for (const l of LOCALES) {
    const c = rgcCopy(l);
    assert.equal(c.tableRows.length, 5);
    assert.equal(c.tableHead.length, 3);
    assert.match(c.heading, /Renda Garantida de Ciutadania 2026/);
    assert.match(sp(c.faq.a), l === "en" ? /€801\.85 a month/ : /801,85 € al mes/);
    assert.match(sp(c.faq.a), l === "en" ? /€1,459\.36/ : /1\.459,36 €/);
    assert.match(c.faq.a, /IMV/);
    assert.match(c.paragraphs[1]!, /23/);
  }
  assert.deepEqual(rgcCopy("es").tableRows[0]!.map(sp), ["1 persona", "801,85 €", "1.603,70 €"]);
  assert.equal(rgcCopy("es").faq.q, "¿Qué puedo cobrar en Cataluña cuando se acaba el subsidio por desempleo?");
  assert.match(rgcCopy("ca").paragraphs[0]!, /mateixa xifra que l'indicador de renda de suficiència de Catalunya \(IRSC\) del 2026/);
});

test("page: the RGC section follows the IMV one and its question is in the FAQ (and FAQPage)", () => {
  const page = readFileSync(new URL("../src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx", import.meta.url), "utf8");
  const imv = page.indexOf('<h2 id="ingreso-minimo-vital">');
  const rgc = page.indexOf('<h2 id="renda-garantida">');
  assert.ok(imv > 0 && rgc > imv);
  assert.match(page, /const allFaq = \[\.\.\.faq, \.\.\.ex8\.faq, rgc\.faq\];/);
});
