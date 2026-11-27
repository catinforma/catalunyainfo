import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { parseBody } from "../src/lib/content/blocks.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { KEY_FACTS, SHOPS, shopsLead } from "../src/lib/content/batch02/shops.ts";
import { VERIFIED_LABEL } from "../src/lib/content/batch02/shared.ts";
import { answerFirstEnabled, answerFirstLayout } from "../src/lib/layout/answer-first.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 27 Nov 2026, v4 (head request; docs/SEO_EXPERIMENTS.md): the shops guide uses
 * the existing answer-first layout, so on a phone the key facts sit under the
 * byline, above the photo and the top ad. Nothing in the template changed: the
 * entry key is on the switch list, and the stored body is split as on the
 * strike pages (summary = the key-facts box; the lead opens the body; the
 * verification callout goes to the end; no block lost).
 */

const AFTER = new Date("2026-11-30T09:00:00+01:00");

test("the shops guide is on the answer-first switch (the holiday guides stay off it)", () => {
  assert.ok(answerFirstEnabled(SHOPS.entryKey));
  assert.ok(!answerFirstEnabled("guide-december-bridge-catalonia"));
});

test("shops, answer-first: the key facts are the summary, the ten-a-year rule among the facts shown, the lead opens the body", () => {
  for (const locale of LOCALES) {
    for (const now of [new Date("2026-11-28T12:00:00+01:00"), AFTER]) {
      const body = resolveElectionPhased(parseBody(SHOPS.editions[locale].blocks), now);
      const layout = answerFirstLayout(body, locale);
      assert.equal(layout.summary?.kind, "keyFacts", locale);
      if (layout.summary?.kind !== "keyFacts") continue;
      assert.equal(layout.summary.title, KEY_FACTS[locale].title);
      const shown = layout.summary.shown.map((i) => i.label);
      assert.ok(shown.length >= 3 && shown.length <= 5, `${locale}: ${shown.length} shown`);
      assert.deepEqual(shown.slice(0, 3), KEY_FACTS[locale].items.slice(0, 3).map((i) => i.label));
      assert.match(shown.join(" "), /(Quants l'any|Cuántos al año|How many a year)/, `${locale}: the rule is on the first screen`);
      assert.equal(layout.summary.shown.length + layout.summary.more.length, KEY_FACTS[locale].items.length);
      // The lead (as of the date) opens the body; the first H2 follows it.
      const first = layout.body[0] as { type: string; text?: string; lead?: boolean };
      assert.equal(first.type, "paragraph");
      assert.ok(first.lead);
      assert.equal(first.text, shopsLead(locale, now < AFTER ? "pre" : "after"));
      assert.equal(layout.body[1]?.type, "heading");
      // The verification callout moves to the end; nothing is dropped or doubled.
      assert.ok(layout.end.some((b) => b.type === "callout" && (b.title ?? "").startsWith(VERIFIED_LABEL[locale])), `${locale}: verified box at the end`);
      assert.equal(layout.body.length + layout.end.length + 1, body.length, `${locale}: every block once`);
    }
  }
});

test("the template draws the summary above the photo and the top ad, as on the strike pages", () => {
  const page = readFileSync(new URL("../src/components/pages/EntryArticle.tsx", import.meta.url), "utf8");
  const summary = page.indexOf("<SummaryBox summary={layout.summary}");
  const hero = page.indexOf("{layout?.summary && hero ?");
  const ad = page.indexOf('<AdSlot kind="top"');
  assert.ok(summary > 0 && summary < hero && hero < ad, "summary, then photo, then the top ad");
});
