import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { CARDS } from "../src/lib/content/batch02/cards.ts";
import { BOQUERIA_CHRISTMAS_REREAD_BY, MARKETS } from "../src/lib/content/batch02/family-markets.ts";
import { TIBIDABO, TIBIDABO_CALENDAR_REREAD_BY } from "../src/lib/content/batch02/hills.ts";

// 25 Nov 2026, English pages at positions 8-14: Tibidabo and La Boqueria answer
// what a resident or visitor asks that they only half answered. Sources:
// tibidabo.cat (schedules, rates) and boqueria.barcelona, read 25 Nov 2026.

type Block = { type: string; level?: number; text?: string; rows?: string[][]; items?: { question: string; answer: string }[]; questions?: { question: string; answer: string }[] };
const today = () => new Date().toISOString().slice(0, 10);

function faqOf(blocks: Block[]): { question: string; answer: string }[] {
  const f = blocks.find((b) => b.type === "faq") as unknown as { items?: { question: string; answer: string }[]; questions?: { question: string; answer: string }[] } | undefined;
  assert.ok(f, "no FAQ block");
  return (f.items ?? f.questions) as { question: string; answer: string }[];
}

test("date guard: the Tibidabo calendar says 'autumn' and is re-read before the December openings", () => {
  assert.ok(today() < TIBIDABO_CALENDAR_REREAD_BY, `From ${TIBIDABO_CALENDAR_REREAD_BY}: re-read tibidabo.cat horaris and tarifes (hills.ts), rewrite the autumn wording, then move TIBIDABO_CALENDAR_REREAD_BY.`);
});

test("date guard: the Boqueria 2026-27 Christmas openings are looked up again", () => {
  assert.ok(today() < BOQUERIA_CHRISTMAS_REREAD_BY, `From ${BOQUERIA_CHRISTMAS_REREAD_BY}: read boqueria.barcelona news for the 2026-27 Christmas openings (last year's post was on 9 Dec), update family-markets.ts, then move BOQUERIA_CHRISTMAS_REREAD_BY.`);
});

test("Tibidabo: free entry for Targeta Rosa holders, the TibiClub prices and the family row, in ca/es/en", () => {
  const heading = { en: "Free entry, residents and the TibiClub annual pass", es: "Entrada gratis, residentes y abono anual TibiClub", ca: "Entrada gratuïta, residents i abonament anual TibiClub" } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = TIBIDABO.editions[locale].blocks as unknown as Block[];
    const i = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === heading[locale]);
    assert.notEqual(i, -1, `${locale}: missing H2`);
    const section = bodyToPlainText(blocks.slice(i + 1, i + 3) as never);
    assert.match(section, /Targeta Rosa/, locale);
    assert.match(section, /68/, locale);
    assert.match(section, /190/, locale);
    assert.match(section, /24/, locale);
    const prices = blocks.filter((b) => b.type === "table")[1];
    const row = prices?.rows?.find((r) => /fam[ií]l/i.test(r[0] ?? ""));
    assert.ok(row, `${locale}: family row in the price table`);
    assert.match(row[1] ?? "", /31[,.]20/, locale);
    assert.match(row[2] ?? "", /12[,.]40/, locale);
    // The opening-days table stays first and has its four months.
    assert.equal(blocks.filter((b) => b.type === "table")[0]?.rows?.length, 4, locale);
  }
});

test("Tibidabo: the December-January question is answered from the park's calendar in all three languages", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const faq = faqOf(TIBIDABO.editions[locale].blocks as unknown as Block[]);
    const q = faq.find((f) => /(desembre i al gener|diciembre y enero|December and January)/.test(f.question));
    assert.ok(q, `${locale}: no December and January question`);
    for (const day of ["7", "8", "21", "22", "23", "24", "28", "29", "30"]) assert.ok(q.answer.includes(day), `${locale}: ${day}`);
    assert.match(q.answer, /2, 3, 4/, locale);
    assert.ok(faq.some((f) => /Targeta Rosa|residents|residentes/.test(f.answer)), `${locale}: residents question`);
  }
  const en = bodyToPlainText(TIBIDABO.editions.en.blocks);
  assert.match(en, /How to get to Tibidabo by public transport/);
  assert.doesNotMatch(en, /Getting up/);
});

test("La Boqueria: information point and 'where is it' in ca/es/en, hours unchanged", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(MARKETS.editions[locale].blocks);
    assert.match(text, /93 318 20 17/, `${locale}: information point phone`);
    assert.match(text, /9:00 (a|to) 15:00|9:00–15:00/, `${locale}: information point hours`);
    assert.match(text, /8:00 (a|to) 20:30/, `${locale}: market hours`);
    const faq = faqOf(MARKETS.editions[locale].blocks as unknown as Block[]);
    assert.ok(faq.some((f) => /Liceu/.test(f.answer)), `${locale}: where-is question`);
  }
  assert.match(bodyToPlainText(MARKETS.editions.en.blocks), /by 25 November 2026/);
});

test("the Barcelona Card guide links the Tibidabo guide in all three languages", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    assert.match(JSON.stringify(CARDS.editions[locale].blocks), /tibidabo/, locale);
  }
});
