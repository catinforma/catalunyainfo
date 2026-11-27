import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { EASTER_2027 } from "../src/lib/content/batch02/easter-2027.ts";
import { MARATO_GUIDE } from "../src/lib/content/batch02/marato.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { SHOPS, SHOPS_EXCERPT, SHOPS_META, SUNDAY_RULES_FAQ } from "../src/lib/content/batch02/shops.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 27 Nov 2026, v3 (ci-numero1, docs/SEO_EXPERIMENTS.md): the standfirst under
 * the H1 answers the query (the only text a 412x915 phone shows before the
 * photo and the top ad); Barcelona's tourist zone with its official basis
 * (PEUAT areas 1-2, Resolution of 29 April 2022, council page read 27 Nov); the
 * general timetable as a FAQ; five more pages link in with the query's words.
 */

test("shops: the standfirst answers 'when do shops open on Sundays' and is what the page stores", () => {
  for (const locale of LOCALES) {
    const x = SHOPS_EXCERPT[locale];
    assert.equal(SHOPS_META[locale].excerpt, x);
    assert.equal(SHOPS.editions[locale].excerpt, x);
    assert.match(x, /(deu|diez|ten) /);
    assert.match(x, /6, 13, 20 (i|y|and) 27/);
    assert.match(x, /8/);
    assert.match(x, /25 (i|y|and) (el )?26/);
    assert.doesNotMatch(x, /29|\*\*|\]\(/, `${locale}: no polling day, no markdown (the template prints it as text)`);
    assert.ok(x.length <= 210, `${locale}: ${x.length} chars`);
  }
});

test("shops: Barcelona's tourist zone names its official basis and links the council page", () => {
  const council = {
    ca: "https://ajuntament.barcelona.cat/comerc/ca/el-comerc-barcelona/horaris-comercials",
    es: "https://ajuntament.barcelona.cat/comerc/es/el-comercio-en-barcelona/horarios-comerciales",
    en: "https://ajuntament.barcelona.cat/comerc/en/commerce-barcelona/trading-hours",
  } as const;
  for (const locale of LOCALES) {
    const json = JSON.stringify(SHOPS.editions[locale].blocks);
    assert.ok(json.includes(`](${council[locale]})`), locale);
    const text = bodyToPlainText(SHOPS.editions[locale].blocks);
    assert.match(text, /PEUAT/);
    assert.match(text, /29 (d'abril de|de abril de|April) 2022/);
    const timetable = SUNDAY_RULES_FAQ[locale].find((i) => /horari comercial|horario comercial|normal shop opening hours/.test(i.question));
    assert.ok(timetable, `${locale}: timetable FAQ`);
    assert.match(timetable!.answer, /21[.:]00/);
    assert.match(timetable!.answer, /22[.:]00/);
    assert.match(timetable!.answer, /36\.2\.a/);
  }
});

test("shops: 'the last Sunday with shops open before Christmas' is answered from the towns table, in every phase", async () => {
  const { shopsFaq, closedOn } = await import("../src/lib/content/batch02/shops.ts");
  const q = { ca: "Quin és l'últim diumenge amb botigues obertes abans de Nadal?", es: "¿Cuál es el último domingo con tiendas abiertas antes de Navidad?", en: "What is the last Sunday shops open before Christmas?" } as const;
  assert.deepEqual(closedOn("2026-12-20"), [], "no council swapped 20 Dec (Resolució EMT/4342/2025)");
  for (const locale of LOCALES) {
    for (const phase of ["pre", "after", "over"] as const) {
      const item = shopsFaq(locale, phase).find((i) => i.question === q[locale]);
      assert.ok(item, `${locale} ${phase}`);
      assert.match(item!.answer, /^(El diumenge 20 de desembre|El domingo 20 de diciembre|Sunday 20 December), /);
      assert.match(item!.answer, /27/);
      assert.match(item!.answer, /3 (de gener|de enero|January)/);
    }
  }
});

test("five more high-traffic guides link the shops guide with the query's words", () => {
  const want = {
    easter: [EASTER_2027, { ca: "quins diumenges i festius obren les botigues a Catalunya", es: "qué domingos y festivos abren las tiendas en Cataluña", en: "which Sundays and holidays shops open in Catalonia" }],
    marato: [MARATO_GUIDE, { ca: "botigues obertes en diumenge a Barcelona", es: "tiendas abiertas en domingo en Barcelona", en: "shops open on Sunday in Barcelona" }],
    nye: [NEW_YEAR, { ca: "quines botigues obren en festiu a Catalunya", es: "qué tiendas abren en festivo en Cataluña", en: "which shops open on public holidays in Catalonia" }],
    december: [BARCELONA_DECEMBER, { ca: "quan obren les botigues els diumenges a Barcelona", es: "cuándo abren las tiendas los domingos en Barcelona", en: "when shops open on Sundays in Barcelona" }],
    spainBridge: [DECEMBER_BRIDGE_SPAIN, { ca: "quan obren les botigues els diumenges a Catalunya", es: "cuándo abren las tiendas los domingos en Cataluña", en: "when shops open on Sundays in Catalonia" }],
  } as const;
  for (const locale of LOCALES) {
    for (const [key, [article, anchors]] of Object.entries(want)) {
      const json = JSON.stringify(article.editions[locale].blocks);
      assert.ok(json.includes(`[${anchors[locale]}](${b2href("shops", locale)})`), `${key} ${locale}`);
    }
  }
});
