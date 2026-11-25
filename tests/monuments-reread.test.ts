import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { MONUMENTS } from "../src/lib/content/batch02/monuments.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Gaudí / Sant Pau tickets page, re-read 25 Nov 2026 (santpaubarcelona.org
 * "From 1 January 2027: Self-guided visit online: €19 (until 2 pm), €18 (from
 * 2 pm) ... Guided visit: €22.00"). REREAD_BY: on 1 Jan 2027 the table's
 * Sant Pau price changes, so the page must be re-read and the table updated.
 */
const REREAD_BY = "2027-01-01";

test("monuments: the Sant Pau 2027 rise is stated in every locale", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(MONUMENTS.editions[locale].blocks);
    assert.match(text, /2027/, `${locale}: 2027 rise present`);
    assert.match(text, /19 ?€|€19/, `${locale}: new price €19`);
    assert.match(text, /25 (de )?(November|noviembre|novembre) (de )?2026/, `${locale}: re-read date shown`);
  }
});

test("monuments: freshness, the page is re-read once the Sant Pau 2027 prices apply", () => {
  const today = new Date().toISOString().slice(0, 10);
  if (today >= REREAD_BY) {
    assert.ok(
      MONUMENTS.verifiedAt >= REREAD_BY,
      `Sant Pau raised its prices on ${REREAD_BY}; re-read santpaubarcelona.org rates and the other monuments, update the table and VERIFIED.`,
    );
  }
});
