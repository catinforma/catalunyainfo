import assert from "node:assert/strict";
import { test } from "node:test";

import { TITLE_BUDGET, composeTitle } from "../src/lib/seo/metadata.ts";

/**
 * Google shows about sixty characters of a title. The brand suffix is kept
 * when the whole thing fits and dropped when it does not, except on pages whose
 * title is inside a logged measurement window, which keep the old behaviour
 * until the window closes.
 */

test("a short title keeps the brand suffix", () => {
  assert.equal(composeTitle("Agenda", "/ca/agenda/", "2026-10-07"), "Agenda");
});

test("a long title drops the suffix rather than being cut off", () => {
  const long = "Què fer aquest cap de setmana a Catalunya: agenda i plans";
  assert.ok(long.length + " · CatalunyaInfo".length > TITLE_BUDGET);
  assert.deepEqual(composeTitle(long, "/ca/agenda/x/", "2026-10-07"), { absolute: long });
});

test("a frozen page keeps the suffix until its window closes", () => {
  const long = "Barcelona tourist tax 2026-2027: rates & calculator";
  const path = "/en/guides/barcelona-catalonia-tourist-tax/";
  assert.equal(composeTitle(long + " and more words", path, "2026-10-20"), long + " and more words");
  assert.deepEqual(composeTitle(long + " and more words", path, "2026-10-24"), {
    absolute: long + " and more words",
  });
});
