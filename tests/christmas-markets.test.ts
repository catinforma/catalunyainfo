import assert from "node:assert/strict";
import { test } from "node:test";

import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The Christmas markets guide must never print last year's dates as this
 * year's. Third-party sites already list "28 November - 23 December 2026" for
 * Santa Llúcia with no organiser source; those are the 2025 dates. When an
 * organiser publishes its 2026 dates, add them and update these guards.
 */

test("the Christmas markets guide has its photographs", () => {
  assert.ok(CHRISTMAS.heroKey && IMAGE_BY_KEY.has(CHRISTMAS.heroKey));
  assert.ok(CHRISTMAS.secondaryKey && IMAGE_BY_KEY.has(CHRISTMAS.secondaryKey));
  assert.notEqual(CHRISTMAS.heroKey, CHRISTMAS.secondaryKey);
});

test("no 2025 market dates are reprinted as this year's", () => {
  const stale = [
    /28 de novembre al 23 de desembre/i,
    /28 de noviembre al 23 de diciembre/i,
    /28 November to 23 December/i,
    /22 de novembre/i,
    /22 de noviembre/i,
    /22 November/i,
    /10[:.]00\s*(a|to|-|–)\s*21[:.]00/,
  ];
  for (const locale of LOCALES) {
    const text = bodyToPlainText(CHRISTMAS.editions[locale].blocks);
    for (const pattern of stale) assert.ok(!pattern.test(text), `${locale}: ${pattern} looks like a 2025 date`);
  }
});

test("the URL carries no year", () => {
  for (const locale of LOCALES) assert.ok(!/20\d\d/.test(CHRISTMAS.editions[locale].path));
});

test("the EN guide answers 'barcelona christmas market' first and every edition links the other Christmas pages", () => {
  const en = CHRISTMAS.editions.en;
  assert.ok(en.seoTitle.startsWith("Barcelona Christmas markets 2026"), en.seoTitle);
  assert.ok(en.seoTitle.length <= 60);
  const blocks = en.blocks as { type: string; lead?: boolean; text?: string }[];
  const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
  assert.match(lead, /Fira de Santa Llúcia/);
  assert.match(lead, /2026 dates have not been published yet/);
  const pages = [
    /nadal-a-barcelona|navidad-en-barcelona|christmas-in-barcelona/,
    /tradicions-de-nadal|tradiciones-navidad|catalan-christmas-traditions/,
    /pessebres-vivents|belenes-vivientes|living-nativity/,
    /cap-d-any|nochevieja|new-years-eve/,
  ];
  for (const locale of LOCALES) {
    const json = JSON.stringify(CHRISTMAS.editions[locale].blocks);
    for (const page of pages) assert.match(json, page, `${locale}: links ${page}`);
    assert.match(bodyToPlainText(CHRISTMAS.editions[locale].blocks), /Cubelles/, `${locale}: Cubelles 2026`);
  }
});
