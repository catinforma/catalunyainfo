import assert from "node:assert/strict";
import { test } from "node:test";

import type { Block } from "../src/lib/content/blocks.ts";
import { READ_NEXT, VERIFIED_LABEL, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { NEXT_DATES_ID, STRIKE_11N } from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKE_11N_CITY_ARTICLES } from "../src/lib/content/batch02/strike-11n-cities.ts";
import { STRIKES_GUIDE } from "../src/lib/content/batch02/strikes.ts";
import { STRIKE_RENFE_GUIDE } from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES_SPAIN_GUIDE } from "../src/lib/content/batch02/strikes-spain.ts";
import { STRIKE_11N_SPAIN } from "../src/lib/content/batch02/strike-11n-spain.ts";
import { BRIDGES_2027 } from "../src/lib/content/batch02/bridges-2027.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { ENTRY_KEY as WORK_CALENDAR_KEY } from "../src/lib/content/holidays/publish.ts";
import { ENTRY_KEY as HOLIDAY_TODAY_KEY } from "../src/lib/content/holidays/today-publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import {
  ANSWER_FIRST_ENTRY_KEYS,
  MORE_FACTS_LABEL,
  answerFirstEnabled,
  answerFirstLayout,
  splitFacts,
} from "../src/lib/layout/answer-first.ts";

const SEVILLA = STRIKE_11N_CITY_ARTICLES.find((a) => a.editions.es.path.includes("sevilla"))!;

/** Every block of the original body, once, in the layout (summary + body + end). */
function sameBlocks(original: readonly Block[], locale: (typeof LOCALES)[number]) {
  const layout = answerFirstLayout(original, locale);
  const summary = layout.summary?.kind === "lead" ? [layout.summary.block] : [];
  const facts = original.filter((b) => b.type === "keyFacts");
  const lifted = layout.summary?.kind === "keyFacts" ? 1 : 0;
  const all = [...summary, ...layout.body, ...layout.end];
  assert.equal(all.length + lifted, original.length, "no block dropped or duplicated");
  for (const block of original) {
    if (block.type === "keyFacts" && lifted && block === facts[0]) continue;
    assert.ok(all.includes(block), `missing ${block.type}`);
  }
  return layout;
}

test("the switch covers the first group: strike guides, 11N cities, holiday guides", () => {
  for (const key of [
    STRIKE_11N.entryKey,
    STRIKE_11N_SPAIN.entryKey,
    STRIKES_GUIDE.entryKey,
    STRIKES_SPAIN_GUIDE.entryKey,
    STRIKE_RENFE_GUIDE.entryKey,
    BRIDGES_2027.entryKey,
    DECEMBER_BRIDGE.entryKey,
    DECEMBER_BRIDGE_SPAIN.entryKey,
    WORK_CALENDAR_KEY,
    HOLIDAY_TODAY_KEY,
    ...STRIKE_11N_CITY_ARTICLES.map((a) => a.entryKey),
  ]) {
    assert.ok(answerFirstEnabled(key), key);
  }
  assert.equal(answerFirstEnabled("guide-mesa-electoral"), false);
  assert.equal(answerFirstEnabled(null), false);
  assert.equal(new Set(ANSWER_FIRST_ENTRY_KEYS).size, ANSWER_FIRST_ENTRY_KEYS.length);
});

test("Sevilla 11N: facts on top, the minimum-services section right after the lead, boxes at the end", () => {
  const layout = sameBlocks(SEVILLA.editions.es.blocks, "es");
  assert.equal(layout.summary?.kind, "keyFacts");
  assert.equal(layout.body[0]?.type, "paragraph", "the lead opens the body");
  const firstH2 = layout.body.find((b) => b.type === "heading" && b.level === 2) as { id?: string };
  assert.equal(firstH2.id, "servicios-minimos");
  const endHeadings = layout.end.filter((b) => b.type === "heading").map((b) => (b as { id?: string }).id);
  assert.deepEqual(endHeadings, [NEXT_DATES_ID.es]);
  assert.ok(layout.end.some((b) => b.type === "callout" && (b.title ?? "").startsWith(VERIFIED_LABEL.es)));
  assert.equal(layout.end[0]?.type, "callout", "original order kept: verification note, then upcoming strikes");
});

test("every edition of the first group keeps all its blocks", () => {
  const articles = [STRIKE_11N, STRIKE_11N_SPAIN, STRIKES_GUIDE, STRIKES_SPAIN_GUIDE, STRIKE_RENFE_GUIDE, BRIDGES_2027, DECEMBER_BRIDGE, DECEMBER_BRIDGE_SPAIN, ...STRIKE_11N_CITY_ARTICLES];
  for (const article of articles) {
    for (const locale of LOCALES) {
      const edition = (article.editions as Partial<Record<(typeof LOCALES)[number], { blocks: Block[] }>>)[locale];
      if (!edition) continue;
      const layout = sameBlocks(edition.blocks, locale);
      assert.ok(layout.summary, `${article.entryKey} ${locale}: has a summary`);
      // Nothing that was moved stands before the first section any more.
      const firstH2 = layout.body.findIndex((b) => b.type === "heading" && b.level === 2);
      const preamble = firstH2 < 0 ? layout.body : layout.body.slice(0, firstH2);
      assert.ok(
        !preamble.some((b) => b.type === "callout" && (b.title ?? "").startsWith(VERIFIED_LABEL[locale])),
        `${article.entryKey} ${locale}: verification note moved`,
      );
    }
  }
});

test("the read-next box goes to the end, wherever it was", () => {
  const blocks = withReadNext(
    [
      { type: "paragraph", lead: true, text: "Lead." },
      { type: "heading", level: 2, text: "A" },
      { type: "paragraph", text: "a" },
      { type: "heading", level: 2, text: "B" },
      { type: "paragraph", text: "b" },
      { type: "heading", level: 2, text: "C" },
      { type: "heading", level: 2, text: "Sigue leyendo" },
      { type: "list", ordered: false, items: ["[x](/es/x/)", "[y](/es/y/)"] },
    ] as Block[],
    "es",
  );
  const layout = sameBlocks(blocks, "es");
  assert.equal(layout.summary?.kind, "lead");
  assert.equal(layout.end.length, 1);
  assert.equal((layout.end[0] as { title?: string }).title, READ_NEXT.es);
});

test("summary bullets: 3 to 5, within the character budget, the rest collapsed", () => {
  const item = (n: number) => ({ label: "L", value: "x".repeat(n) });
  assert.equal(splitFacts([item(200), item(200), item(200), item(10)]).shown.length, 3);
  assert.equal(splitFacts([item(10), item(10), item(10), item(10), item(10), item(10)]).shown.length, 5);
  assert.equal(splitFacts([item(50), item(50), item(50), item(50), item(300)]).shown.length, 4);
  assert.equal(splitFacts([item(10), item(10)]).shown.length, 2);
  for (const locale of LOCALES) assert.match(MORE_FACTS_LABEL[locale](4), /\(4\)$/);
});
