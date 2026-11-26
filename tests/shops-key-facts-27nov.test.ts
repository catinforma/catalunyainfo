import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, parseBody, type Block } from "../src/lib/content/blocks.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import {
  KEY_FACTS,
  KEY_FACTS_REREAD_BY,
  SHOPS,
  SUNDAY_RULES_FAQ,
  SUNDAYS_YEAR_TITLE,
  WHY_TEN,
  shopsFaq,
  shopsLead,
} from "../src/lib/content/batch02/shops.ts";
import { SHOPS_29N_HEADING } from "../src/lib/engagement/election-line.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 27 Nov 2026 (ci-numero1, docs/SEO_EXPERIMENTS.md): the shops guide made the
 * answer for "cuándo abren las tiendas los domingos" and its family.
 *  - a key-facts box under the lead, in the searched words;
 *  - the general Sundays section moved up, with "why only ten" (Ley 1/2004 art. 4);
 *  - three rule questions in the FAQ;
 *  - the polling-day stretches (lead sentence, 29N section, November Sundays
 *    line, 29N FAQ) as `electionPhased` blocks: as live before the vote, gone
 *    from 30 Nov with no republish;
 *  - in-page jumps with the page's own path (the formatter printed "(#x)" raw);
 *  - three high-traffic December guides link in with the query's words.
 */

const today = new Date().toISOString().slice(0, 10);
const BEFORE = new Date("2026-11-28T12:00:00+01:00");
const AFTER = new Date("2026-11-30T09:00:00+01:00");
const OVER = new Date("2026-12-09T09:00:00+01:00");

type B = Block & { type: string; text?: string; title?: string; items?: { question?: string; answer?: string; label?: string; value?: string }[] };
const at = (locale: (typeof LOCALES)[number], now: Date) => resolveElectionPhased(parseBody(SHOPS.editions[locale].blocks), now) as B[];
const faqOf = (blocks: B[]) => blocks.filter((b) => b.type === "faq").flatMap((b) => b.items ?? []);

test("date guard: the key-facts box is re-read before 28 Dec 2026", () => {
  assert.ok(
    today < KEY_FACTS_REREAD_BY,
    "From 28 Dec 2026 the 'December Sundays' fact of KEY_FACTS (shops.ts) is past: replace it with the 2027 days once the DOGC list of each town's 2027 days is out (or the general 3 Jan / 10 Jan default), and move KEY_FACTS_REREAD_BY.",
  );
});

test("shops: key facts sit right under the verified callout, nine answers in every language", () => {
  for (const locale of LOCALES) {
    assert.ok(bodySchema.safeParse(SHOPS.editions[locale].blocks).success, locale);
    for (const now of [BEFORE, AFTER, OVER]) {
      const blocks = at(locale, now);
      assert.equal(blocks[0]!.type, "paragraph", `${locale}: lead first`);
      assert.equal(blocks[1]!.type, "callout", `${locale}: callout second`);
      assert.equal(blocks[2]!.type, "keyFacts", `${locale}: key facts third`);
      assert.equal(blocks[2]!.title, KEY_FACTS[locale].title);
      assert.equal(blocks[2]!.items!.length, 9, locale);
    }
    const facts = KEY_FACTS[locale].items.map((i) => i.value).join(" | ");
    // The December days of Barcelona and the default calendar (Ordre EMT/77/2025 art. 1 and 6), the closing days (Llei 18/2017 art. 36.2.d).
    assert.match(facts, /6, 13, 20 (i|y|and) 27/, locale);
    assert.match(facts, /25 (i|y|and) 26/, locale);
    assert.match(facts, /1 (i|y|and) 6/, locale);
    assert.match(facts, /3 (de gener|de enero|January)/, locale);
    assert.match(facts, /6\.00|6:00/, locale);
    assert.match(facts, /300 m²/, locale);
    assert.doesNotMatch(facts, /29 (de )?(novembre|noviembre|November)/, `${locale}: no polling-day fact in a box that stays to 27 Dec`);
  }
});

test("shops: the lead drops the polling-day sentence from 30 Nov and the 6/8 Dec exceptions from 8 Dec", () => {
  for (const locale of LOCALES) {
    const pre = shopsLead(locale, "pre");
    const after = shopsLead(locale, "after");
    const over = shopsLead(locale, "over");
    assert.match(pre, /29 (de )?(novembre|noviembre|November)/);
    assert.doesNotMatch(after, /29 (de )?(novembre|noviembre|November)/);
    assert.doesNotMatch(over, /29 (de )?(novembre|noviembre|November)/);
    assert.ok(pre.startsWith(after.split(" ").slice(0, 8).join(" ")), `${locale}: same opening`);
    assert.match(after, /Riells i Viabrea/);
    assert.doesNotMatch(over, /Riells i Viabrea/);
    for (const text of [pre, after, over]) assert.match(text, /^\*\*(Al desembre|En diciembre|In December)/);
    assert.equal((at(locale, BEFORE)[0] as { text: string }).text, pre);
    assert.equal((at(locale, AFTER)[0] as { text: string }).text, after);
    assert.equal((at(locale, OVER)[0] as { text: string }).text, over);
  }
});

test("shops: the 29N section, the November Sundays line and the 29N questions are there before the vote and gone after it", () => {
  for (const locale of LOCALES) {
    const before = at(locale, BEFORE);
    assert.ok(before.some((b) => b.type === "heading" && b.text === SHOPS_29N_HEADING[locale]), `${locale}: 29N section before`);
    assert.ok(faqOf(before).some((i) => /29 (de )?(novembre|noviembre|November)/.test(i.question!)), `${locale}: 29N question before`);
    assert.ok(JSON.stringify(before).match(/8, 15 (i|y|and) 22/), `${locale}: November Sundays line before`);
    for (const now of [AFTER, OVER]) {
      const blocks = at(locale, now);
      assert.ok(!blocks.some((b) => b.type === "heading" && b.text === SHOPS_29N_HEADING[locale]), `${locale}: 29N section gone`);
      assert.ok(!faqOf(blocks).some((i) => /29 (de )?(novembre|noviembre|November)/.test(i.question!)), `${locale}: 29N questions gone`);
      assert.ok(!JSON.stringify(blocks).match(/8, 15 (i|y|and) 22/), `${locale}: November Sundays line gone`);
      assert.equal(blocks.filter((b) => b.type === "faq").length, 1, `${locale}: one FAQ`);
    }
  }
  // CA "quins festius queden": no 29th from 30 Nov, no 6th or 8th from 8 Dec.
  const left = (phase: "after" | "over") => shopsFaq("ca", phase).find((i) => i.question === "Quins festius d'obertura comercial queden el 2026?")!.answer;
  assert.doesNotMatch(left("after"), /29/);
  assert.match(left("after"), /el 6, 8, 13, 20 i 27 de desembre/);
  assert.match(left("over"), /després del pont de desembre, els diumenges 13, 20 i 27/);
});

test("shops: the three rule questions follow the two Sunday questions in every phase, with the state law", () => {
  for (const locale of LOCALES) {
    for (const phase of ["pre", "after", "over"] as const) {
      const questions = shopsFaq(locale, phase).map((i) => i.question);
      const first = questions.indexOf(SUNDAY_RULES_FAQ[locale][0]!.question);
      assert.ok(first > 0, `${locale} ${phase}`);
      assert.deepEqual(questions.slice(first, first + 3), SUNDAY_RULES_FAQ[locale].map((i) => i.question));
      assert.equal(new Set(questions).size, questions.length, `${locale} ${phase}: no duplicate question`);
    }
    for (const item of SUNDAY_RULES_FAQ[locale]) assert.match(item.answer, /1\/2004|18\/2017/, `${locale}: ${item.question}`);
    assert.ok(SUNDAY_RULES_FAQ[locale][2]!.answer.includes(`](${b2href("shopsSpainDecember", locale)})`), `${locale}: Spain page link`);
  }
  assert.ok(SHOPS.sources.some((s) => s.url === "https://www.boe.es/buscar/act.php?id=BOE-A-2004-21421"), "Ley 1/2004 among the sources");
});

test("shops: the general Sundays section comes right after the Christmas answer and says why only ten", () => {
  for (const locale of LOCALES) {
    const blocks = at(locale, BEFORE);
    const h = blocks.findIndex((b) => b.type === "heading" && b.text === SUNDAYS_YEAR_TITLE[locale]);
    assert.equal(blocks[h - 1]!.type, "shopsSundays", locale);
    assert.ok(h < blocks.findIndex((b) => b.type === "shopsToday"), `${locale}: before today`);
    assert.ok(blocks.slice(h, h + 6).some((b) => b.type === "paragraph" && b.text === WHY_TEN[locale]), `${locale}: why ten`);
    assert.match(WHY_TEN[locale], /1\/2004, (article|artículo) 4/);
    assert.match(WHY_TEN[locale], /(setze|dieciséis|sixteen)/);
    assert.match(WHY_TEN[locale], /36\.2\.c/);
  }
});

test("shops: the Barcelona H2 and the supermarket question are worded as searched", () => {
  const h2 = { ca: "Botigues obertes en diumenge a Barcelona: els dies del 2026 i la zona turística", es: "Tiendas abiertas en domingo en Barcelona: los días de 2026 y la zona turística", en: "Shops open on Sundays in Barcelona: the 2026 days and the tourist zone" } as const;
  const supermarkets = { ca: "Quins supermercats obren els diumenges i festius a Catalunya?", es: "¿Qué supermercados abren los domingos y festivos en Cataluña?", en: "Which supermarkets are open on Sundays and holidays in Catalonia?" } as const;
  for (const locale of LOCALES) {
    const blocks = at(locale, AFTER);
    const i = blocks.findIndex((b) => b.type === "heading" && b.text === h2[locale]);
    assert.ok(i > 0, `${locale}: Barcelona H2`);
    assert.match(blocks[i + 1]!.text!, /4 (i|y|and) 11/, `${locale}: Barcelona's 2026 days right under it`);
    assert.ok(faqOf(blocks).some((f) => f.question === supermarkets[locale] && /300 m²/.test(f.answer!)), `${locale}: supermarkets`);
  }
});

test("shops: no in-page link is a bare #anchor (the formatter prints those raw)", () => {
  for (const locale of LOCALES) {
    for (const now of [BEFORE, AFTER]) assert.doesNotMatch(JSON.stringify(at(locale, now)), /\]\(#/, locale);
    assert.doesNotMatch(JSON.stringify(SHOPS.editions[locale].blocks), /\]\(#/, locale);
  }
});

test("December bridge, Christmas markets and Christmas in Barcelona link the shops guide with the query's words", () => {
  const want = {
    bridge: { ca: "quan obren les botigues els diumenges i festius a Catalunya", es: "cuándo abren las tiendas los domingos y festivos en Cataluña", en: "when shops open on Sundays and holidays in Catalonia" },
    markets: { ca: "quan obren les botigues els diumenges de desembre", es: "cuándo abren las tiendas los domingos de diciembre", en: "when shops open on Sundays in December" },
    barcelona: { ca: "quins diumenges obren les botigues a Barcelona i a Catalunya", es: "qué domingos abren las tiendas en Barcelona y en Cataluña", en: "which Sundays shops open in Barcelona and Catalonia" },
  } as const;
  for (const locale of LOCALES) {
    const href = b2href("shops", locale);
    const pages = { bridge: DECEMBER_BRIDGE, markets: CHRISTMAS, barcelona: CHRISTMAS_BARCELONA } as const;
    for (const [key, article] of Object.entries(pages) as [keyof typeof want, typeof DECEMBER_BRIDGE][]) {
      const json = JSON.stringify(article.editions[locale].blocks);
      assert.ok(json.includes(`[${want[key][locale]}](${href})`), `${key} ${locale}`);
    }
  }
});

test("shops snippet: the stored strings until polling day, then the same days without the 29th (CA title, all descriptions)", async () => {
  const { SHOPS_SNIPPET_AFTER, SHOPS_SNIPPET_REREAD_BY, liveShopsDescription, liveShopsTitle } = await import("../src/lib/content/batch02/shops-snippet.ts");
  const { liveEntryDescription, liveEntryTitle } = await import("../src/lib/content/live-title.ts");
  assert.ok(today < SHOPS_SNIPPET_REREAD_BY, "From 9 Dec 2026 the ES/EN title window is over: re-read the shops snippet (shops-snippet.ts) against GSC and replace or drop it.");
  for (const locale of LOCALES) {
    assert.equal(liveShopsTitle(locale, BEFORE), null);
    assert.equal(liveShopsDescription(locale, BEFORE), null);
    assert.equal(liveShopsDescription(locale, new Date("2026-11-29T21:00:00+01:00")), null, `${locale}: polling night keeps the stored text`);
    for (const now of [AFTER, OVER]) {
      const d = liveShopsDescription(locale, now)!;
      assert.equal(d, SHOPS_SNIPPET_AFTER[locale].description);
      assert.ok(d.length <= 155, `${locale}: ${d.length}`);
      assert.doesNotMatch(d, /29|elecci|eleccion|election/);
      assert.match(d, /6, 8, 13, 20 (i|y|and) 27/);
      assert.match(d, / 30 /);
    }
    const stored = SHOPS.editions[locale];
    if (locale === "ca") {
      assert.equal(liveShopsTitle("ca", AFTER), "Botigues obertes a Barcelona: diumenges de desembre");
      assert.ok(liveShopsTitle("ca", AFTER)!.length <= 60);
      assert.match(stored.seoTitle, /diumenge 29 nov/, "the stored CA title is the one the snippet corrects");
    } else {
      assert.equal(liveShopsTitle(locale, AFTER), null, `${locale}: the stored title names no date`);
      assert.doesNotMatch(stored.seoTitle, /29/);
    }
    // Wired for the shops guide only: the page that carries `shopsToday`.
    const body = parseBody(SHOPS.editions[locale].blocks);
    assert.equal(await liveEntryTitle(body, locale), liveShopsTitle(locale));
    assert.equal(liveEntryDescription(body, locale), liveShopsDescription(locale));
  }
});
