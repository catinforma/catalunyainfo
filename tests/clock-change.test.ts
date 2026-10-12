import assert from "node:assert/strict";
import { test } from "node:test";

import { isSummerTime, lastSunday, upcomingChanges } from "../src/lib/content/clock/rule.ts";

// Orden PCM/186/2022 (BOE-A-2022-4026) for 2022-2026 and Commission
// communication C/2026/1660 for 2027-2031: the rule must reproduce every
// published date, or the computed "next change" box would be wrong.
const PUBLISHED: [number, string, string][] = [
  [2022, "2022-03-27", "2022-10-30"],
  [2023, "2023-03-26", "2023-10-29"],
  [2024, "2024-03-31", "2024-10-27"],
  [2025, "2025-03-30", "2025-10-26"],
  [2026, "2026-03-29", "2026-10-25"],
  [2027, "2027-03-28", "2027-10-31"],
  [2028, "2028-03-26", "2028-10-29"],
  [2029, "2029-03-25", "2029-10-28"],
  [2030, "2030-03-31", "2030-10-27"],
  [2031, "2031-03-30", "2031-10-26"],
];

test("the last-Sunday rule reproduces every published date", () => {
  for (const [year, march, october] of PUBLISHED) {
    assert.equal(lastSunday(year, 3), march);
    assert.equal(lastSunday(year, 10), october);
  }
});

test("upcoming changes count a change day as the next one", () => {
  assert.deepEqual(upcomingChanges("2026-10-12"), [
    { date: "2026-10-25", kind: "back" },
    { date: "2027-03-28", kind: "forward" },
  ]);
  assert.equal(upcomingChanges("2026-10-25")[0]?.date, "2026-10-25");
  assert.deepEqual(upcomingChanges("2026-10-26")[0], { date: "2027-03-28", kind: "forward" });
  assert.deepEqual(upcomingChanges("2027-12-31")[0], { date: "2028-03-26", kind: "forward" });
});

test("summer time runs from the March change to the October change", () => {
  assert.equal(isSummerTime("2026-10-12"), true);
  assert.equal(isSummerTime("2026-10-25"), false);
  assert.equal(isSummerTime("2027-01-15"), false);
  assert.equal(isSummerTime("2027-03-28"), true);
});
