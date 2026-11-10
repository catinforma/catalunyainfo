import assert from "node:assert/strict";
import { test } from "node:test";

import { CANARY_ISLANDS, DECEMBER_2026, SHOPS_SPAIN_AS_OF, SHOPS_SPAIN_DECEMBER } from "../src/lib/content/batch02/shops-spain-december.ts";

test("December 2026 opening days as the Ministry's 2026 calendar lists them (checked 9 Nov 2026)", () => {
  const by = Object.fromEntries(DECEMBER_2026.map((r) => [r.name, r.days]));
  assert.deepEqual(by["Murcia"], [6, 7, 8, 13, 20, 27]);
  assert.deepEqual(by["Aragón"], [6, 8, 13, 20, 27]);
  assert.deepEqual(by["Baleares"], [6, 20, 26]);
  assert.deepEqual(by["Madrid"], []);
  assert.equal(DECEMBER_2026.length, 17);
  assert.equal(CANARY_ISLANDS.length, 7);
  for (const r of DECEMBER_2026) for (const d of r.days) assert.ok(d !== 25, `${r.name}: 25 Dec is in no calendar`);
});

test("page fits the limits and is retired or refreshed after December", () => {
  const e = SHOPS_SPAIN_DECEMBER.editions.es;
  assert.ok(e.seoTitle.length <= 60, `${e.seoTitle.length}`);
  assert.ok(e.seoDescription.length <= 160, `${e.seoDescription.length}`);
  assert.ok(new Date().toISOString().slice(0, 10) <= "2026-12-31", `shops-spain-december (as of ${SHOPS_SPAIN_AS_OF}) is about December 2026: turn it into January/2027 or retire it`);
});
