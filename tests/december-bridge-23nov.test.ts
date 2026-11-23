import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { BRIDGE_VERIFIED, DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { BRIDGE_NAMES, DECEMBER_BRIDGE_SPAIN, purisimaFaq } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { holidayLiveHref } from "../src/lib/content/home-holiday-link.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { datePath } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * 23 Nov 2026 (docs/SEO_EXPERIMENTS.md): the Spain-wide bridge page names the
 * bridge "Purísima" as its searchers do; the Catalan bridge page carries the
 * day it was re-read; the homepage's next-holiday line links that day's page.
 */

const ROOT = join(import.meta.dirname, "..");
const faqItems = (blocks: Block[]) => {
  const faq = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
  return faq?.items ?? [];
};

test("Spain bridge: every edition names the Purísima in the body and asks when its bridge is", () => {
  const word = { es: /Purísima/, ca: /Puríssima/, en: /Purísima/ } as const;
  for (const locale of LOCALES) {
    const blocks = DECEMBER_BRIDGE_SPAIN.editions[locale].blocks;
    const body = bodyToPlainText(blocks);
    assert.ok(body.includes(BRIDGE_NAMES[locale]), `${locale}: the names sentence`);
    assert.match(BRIDGE_NAMES[locale], word[locale]);
    const asked = purisimaFaq(locale);
    const items = faqItems(blocks);
    assert.ok(items.some((i) => i.question === asked.question && i.answer === asked.answer), `${locale}: Purísima FAQ`);
    assert.match(asked.question, word[locale]);
    // The dates come from the BOE rows: Saturday 5 to Tuesday 8, four days.
    assert.match(asked.answer, /(sábado|dissabte|Saturday) 5/);
    assert.match(asked.answer, /(martes|dimarts|Tuesday) 8/);
    assert.match(asked.answer, /\b4 (días|dies|days)\b/);
    // One question per wording: no duplicate in the FAQ.
    assert.equal(new Set(items.map((i) => i.question)).size, items.length, locale);
  }
});

test("Catalan bridge: re-read on 23 Nov 2026, Baqueira from its 11 Nov news", () => {
  assert.equal(BRIDGE_VERIFIED, "2026-11-23");
  assert.equal(DECEMBER_BRIDGE.verifiedAt, "2026-11-23");
  const baqueira = DECEMBER_BRIDGE.sources.filter((s) => s.url.includes("baqueira.es"));
  assert.deepEqual(
    baqueira.map((s) => s.url),
    ["https://www.baqueira.es/es/noticia/baqueira-beret-invierte-24-millones-de-euros-en-el-nuevo-mirador-y-la-renovacion-total-de"],
  );
  for (const locale of LOCALES) {
    const body = bodyToPlainText(DECEMBER_BRIDGE.editions[locale].blocks);
    assert.doesNotMatch(body, /28 (de juliol|de julio|July) (de )?2026/, `${locale}: the old news item`);
  }
});

test("homepage: the next-holiday line links that holiday's date page", () => {
  for (const locale of LOCALES) {
    // Before the bridge: Tuesday 8 December.
    assert.equal(holidayLiveHref(locale, "2026-11-23"), datePath(locale, "2026-12-08"));
    // On the holiday itself: today's page.
    assert.equal(holidayLiveHref(locale, "2026-12-08"), datePath(locale, "2026-12-08"));
    // The day after: Christmas.
    assert.equal(holidayLiveHref(locale, "2026-12-09"), datePath(locale, "2026-12-25"));
  }
  assert.equal(holidayLiveHref("es", "2026-11-23"), "/es/festivos/dia/8-diciembre-2026/");
  // Outside the published calendars: no link.
  assert.equal(holidayLiveHref("es", "2031-05-01"), null);

  const component = readFileSync(join(ROOT, "src/components/HomeTools.tsx"), "utf8");
  assert.match(component, /holidayLiveHref\(locale, todayInCatalonia\(\)\)/);
  // No link inside a link: the split tile is a div with two sibling links.
  assert.match(component, /<div className="ci-home-top-tile is-split">/);
  const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
  assert.match(css, /\.ci-home-top-cover::after/);
});
