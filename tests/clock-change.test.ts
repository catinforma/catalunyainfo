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

// The SEO titles name the next change ("25 d'octubre") because searchers want
// the date before they click. Once it has passed, this fails until the titles
// in batch02/clock-change.ts name the next one and the page is republished.
test("clock-change titles name the upcoming change, not a past one", async () => {
  const { CLOCK_CHANGE } = await import("../src/lib/content/batch02/clock-change.ts");
  const next = upcomingChanges(new Date().toISOString().slice(0, 10))[0];
  assert.ok(next);
  const day = String(Number(next.date.slice(8, 10)));
  for (const edition of Object.values(CLOCK_CHANGE.editions)) {
    assert.ok(edition.seoTitle.includes(day), `${edition.seoTitle} should name ${next.date}`);
  }
});

// The lead opens with the next change in words, so it goes stale with the
// titles: this fails on the same day, and both are rewritten together.
test("clock-change leads name the upcoming change in each language", async () => {
  const { CLOCK_CHANGE } = await import("../src/lib/content/batch02/clock-change.ts");
  const next = upcomingChanges(new Date().toISOString().slice(0, 10))[0];
  assert.ok(next);
  const day = Number(next.date.slice(8, 10));
  const month = next.date.slice(5, 7) === "03"
    ? { ca: "de març", es: "de marzo", en: "March" }
    : { ca: "d'octubre", es: "de octubre", en: "October" };
  const year = next.date.slice(0, 4);
  for (const [locale, edition] of Object.entries(CLOCK_CHANGE.editions)) {
    const lead = edition.blocks.find((b) => b.type === "paragraph" && "lead" in b && b.lead);
    assert.ok(lead && "text" in lead, `${locale}: no lead`);
    const expected = `${day} ${month[locale as "ca" | "es" | "en"]}`;
    assert.ok(lead.text.includes(expected) && lead.text.includes(year), `${locale} lead should name ${next.date}`);
  }
});

// NIST: US daylight saving time begins on the second Sunday of March and ends
// on the first Sunday of November. The time-difference table prints the 2027
// dates; they must be those Sundays.
test("US 2027 dates in the time-difference table follow the federal rule", async () => {
  const { US_2027, CLOCK_CHANGE } = await import("../src/lib/content/batch02/clock-change.ts");
  const nthSunday = (year: number, month: number, n: number) => {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const day = 1 + ((7 - first) % 7) + 7 * (n - 1);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };
  assert.equal(US_2027.forward, nthSunday(2027, 3, 2));
  assert.equal(US_2027.back, nthSunday(2027, 11, 1));
  const en = JSON.stringify(CLOCK_CHANGE.editions.en.blocks);
  assert.ok(en.includes("from 14 to 28 March 2027") && en.includes("from 31 October to 7 November 2027"));
});
