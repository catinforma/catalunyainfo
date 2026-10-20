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
