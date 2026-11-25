import assert from "node:assert/strict";
import { test } from "node:test";

import { GIRONA } from "../src/lib/content/batch02/day-trips.ts";
import { EN_TOWNS } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { towns } from "../src/lib/programmatic/christmas-fairs/data.ts";

/**
 * 25 Nov 2026: the English Girona day-trip guide links the English Girona
 * Christmas-market page once, in a December sentence. The target must exist in
 * English (Girona, INE 17079, is in EN_TOWNS) and have a dated fair.
 */
test("EN Girona day-trip guide links /en/christmas-markets/girona/ once, and that page exists", () => {
  const en = JSON.stringify(GIRONA.editions.en!.blocks);
  assert.equal((en.match(/\/en\/christmas-markets\/girona\//g) ?? []).length, 1);
  assert.match(en, /Going in December\?/);
  const girona = towns().find((t) => t.slug === "girona");
  assert.ok(girona, "Girona has a dated fair");
  assert.ok(EN_TOWNS.includes(girona!.ine), "Girona has an English page");
  for (const locale of ["ca", "es"] as const) assert.doesNotMatch(JSON.stringify(GIRONA.editions[locale]!.blocks), /christmas-markets\/girona/);
});
