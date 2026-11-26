import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { DECEMBER_BRIDGE, LOCAL_MONDAY_7 } from "../src/lib/content/batch02/december-bridge.ts";
import { NEXT_WEEKS, SHOPS } from "../src/lib/content/batch02/shops.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { barcelonaDec7, barcelonaDec7Answer, barcelonaDec7Question, dec7LocalTowns } from "../src/lib/programmatic/holidays/barcelona-dec7.ts";
import { dateContent } from "../src/lib/programmatic/holidays/dates.ts";
import { datePath } from "../src/lib/programmatic/holidays/paths.ts";
import { dateFaqItems } from "../src/lib/programmatic/holidays/structured.ts";

/**
 * 26 Nov 2026 (docs/SEO_EXPERIMENTS.md): "¿es festivo el 7 de diciembre en
 * Barcelona?" answered in one line on the 7 December date page, the bridge
 * guide's key facts and FAQ; Monday 7 December in the shops guide's
 * Christmas table and FAQ; the malls H2 in the searched words. ca/es/en.
 * Facts from the holiday snapshot (Ordre EMT/208/2025: "Barcelona, 25 de maig
 * i 24 de setembre."; Resolució EMT/4342/2025: Sant Boi "6, 7, 8, 13, 20 i
 * 27 de desembre."), read 26 Nov 2026.
 */

type FaqBlock = { type: "faq"; items: { question: string; answer: string }[] };
type KeyFactsBlock = { type: "keyFacts"; items: { label: string; value: string }[] };
const faqOf = (blocks: Block[]) => (blocks.find((b) => b.type === "faq") as unknown as FaqBlock).items;
const keyFactsOf = (blocks: Block[]) => (blocks.find((b) => b.type === "keyFacts") as unknown as KeyFactsBlock).items;

test("snapshot: Monday 7 Dec 2026 is a working day in Barcelona; 43 towns have it, only Sant Boi opens shops", () => {
  const bcn = barcelonaDec7();
  assert.equal(bcn.holiday, false);
  assert.deepEqual(bcn.local, ["2026-05-25", "2026-09-24"]);
  assert.equal(bcn.shopsDay, false);
  const { towns, shopsOpen } = dec7LocalTowns();
  assert.equal(towns.length, 43);
  assert.deepEqual(towns.slice(0, 2), ["Sant Boi de Llobregat", "Castelldefels"]);
  assert.deepEqual(shopsOpen, ["Sant Boi de Llobregat"]);
});

test("Barcelona answer: no, the two local days, the 8th is the holiday (ca/es/en)", () => {
  assert.equal(
    barcelonaDec7Answer("es"),
    "No. En Barcelona, el lunes 7 de diciembre de 2026 es laborable: sus dos fiestas locales de 2026 son el 25 de mayo y el 24 de septiembre (Orden EMT/208/2025). El festivo del puente es el martes 8, en toda Cataluña.",
  );
  assert.match(barcelonaDec7Answer("ca"), /^No\. A Barcelona, el dilluns 7 de desembre de 2026 és un dia feiner: .* el 25 de maig i el 24 de setembre/);
  assert.match(barcelonaDec7Answer("en"), /^No\. In Barcelona, Monday 7 December 2026 is a working day: .* 25 May and 24 September/);
  assert.match(barcelonaDec7Question("es"), /7 de diciembre de 2026 en Barcelona\?$/);
});

test("7 December date page: the Barcelona line right under the answer; shops and school H2s asked as questions, all three in FAQPage", () => {
  const shopsQ = { ca: "Obren les botigues el 7 de desembre?", es: "¿Abren las tiendas el 7 de diciembre?", en: "Are shops open on 7 December?" };
  for (const locale of LOCALES) {
    const c = dateContent("2026-12-07", locale);
    assert.equal(c.answerNote[0], barcelonaDec7Answer(locale).replace(/^No\. /, ""), `${locale}: first note`);
    const faq = dateFaqItems("2026-12-07", locale);
    assert.equal(faq.length, 3, locale);
    assert.ok(faq[0]!.answer.includes(c.answerNote[0]!), `${locale}: Barcelona in the H1 answer`);
    assert.equal(c.sections[0]!.title, shopsQ[locale]);
    // Each extra question is a heading the page prints, with the text under it.
    for (const item of faq.slice(1)) {
      const s = c.sections.find((x) => x.title === item.question);
      assert.ok(s, `${locale}: ${item.question} is a heading`);
      assert.equal(item.answer, s.paragraphs.join(" "));
    }
  }
  // The other date pages keep their single question.
  assert.equal(dateFaqItems("2026-12-08", "es").length, 1);
});

test("bridge guide: key facts say Barcelona and the shops' Monday; FAQ has the Barcelona and 'se pasa al lunes' questions", () => {
  const monday = { ca: /^Feiner, també a Barcelona, excepte als 43 municipis/, es: /^Laborable, también en Barcelona, salvo en los 43 municipios/, en: /^A working day, Barcelona included, except in the 43 towns/ };
  const shops = { ca: /el dilluns 7, horari habitual, llevat dels municipis on és festa local$/, es: /el lunes 7, horario habitual, salvo donde es fiesta local$/, en: /usual hours on Monday the 7th, except where it is a local holiday$/ };
  const sixth = { ca: /Es passa al dilluns\?$/, es: /¿Se pasa al lunes\?$/, en: /moved to the Monday\?$/ };
  for (const locale of LOCALES) {
    const blocks = DECEMBER_BRIDGE.editions[locale].blocks;
    const facts = keyFactsOf(blocks);
    assert.match(facts[2]!.value, monday[locale], `${locale}: Monday fact`);
    assert.match(facts[5]!.value, shops[locale], `${locale}: shops fact`);
    const faq = faqOf(blocks);
    assert.equal(faq.length, 8, `${locale}: FAQ length`);
    assert.ok(faq.some((f) => f.question === barcelonaDec7Question(locale) && f.answer === barcelonaDec7Answer(locale)), `${locale}: Barcelona FAQ`);
    assert.ok(faq.some((f) => sixth[locale].test(f.question)), `${locale}: 6 Dec FAQ`);
    assert.ok(faq.some((f) => /Purísima|Puríssima/.test(f.question)), `${locale}: Purísima FAQ`);
  }
});

test("shops guide: Monday 7 December row after the 6th, FAQ entry, line linking the date page and the bridge", () => {
  assert.equal(NEXT_WEEKS.length, 14);
  const i = NEXT_WEEKS.findIndex((r) => /^Lunes 7 de diciembre/.test(r.day.es));
  assert.equal(i, 2);
  assert.match(NEXT_WEEKS[1]!.day.es, /^Domingo 6 de diciembre/);
  assert.match(NEXT_WEEKS[3]!.day.es, /^Martes 8 de diciembre/);
  const row = NEXT_WEEKS[i]!;
  assert.equal(
    row.cat("es"),
    "Laborable: horario habitual de cada tienda. En los 43 municipios donde es fiesta local, como Sant Boi de Llobregat y Castelldefels, solo pueden abrir si es uno de sus días de apertura: lo es en Sant Boi de Llobregat",
  );
  assert.match(row.bcn("ca"), /^Laborable: horari habitual de cada botiga \(a Barcelona no és festa local\)$/);
  assert.match(row.basis.en, /Ordre EMT\/208\/2025/);
  for (const locale of LOCALES) {
    const blocks = SHOPS.editions[locale].blocks;
    const faq = faqOf(blocks);
    assert.ok(faq.some((f) => /(dilluns|lunes|Monday) 7 de(sembre| diciembre)?|Monday 7 December/.test(f.question) && /43/.test(f.answer)), `${locale}: Monday FAQ`);
    const text = bodyToPlainText(blocks);
    assert.ok(text.includes(datePath(locale, "2026-12-07")) || JSON.stringify(blocks).includes(datePath(locale, "2026-12-07")), `${locale}: link to the 7 Dec page`);
    assert.match(JSON.stringify(blocks), /centres comercials a Barcelona el 2026\?|centros comerciales en Barcelona en 2026\?|Barcelona shopping centres open in 2026\?/, `${locale}: malls H2`);
  }
});

test("the bridge guide's typed count of towns with a local holiday on Monday 7 Dec matches the holiday data module", () => {
  // Review 26 Nov 2026: december-bridge.ts types 43; shops and the date page compute it from the snapshot.
  assert.equal(LOCAL_MONDAY_7.municipalities, dec7LocalTowns().towns.length);
});
