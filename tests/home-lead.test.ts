import assert from "node:assert/strict";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { HOME_LEAD_WINDOWS, homeLeadKey, rotationIndex } from "../src/lib/content/home-lead.ts";

test("home lead windows are ordered, non-overlapping and point at real pages", () => {
  let previous = "";
  for (const w of HOME_LEAD_WINDOWS) {
    assert.match(w.from, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(w.to, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(w.from <= w.to, `${w.key}: from after to`);
    assert.ok(w.from > previous, `${w.key}: overlaps or out of order`);
    previous = w.to;
    for (const locale of ["ca", "es", "en"] as const) assert.ok(B2_PATHS[w.key][locale], `${w.key} has no ${locale} path`);
  }
});

test("home lead follows the calendar", () => {
  assert.equal(homeLeadKey("2026-11-05"), "strike11n");
  assert.equal(homeLeadKey("2026-11-11"), "strike11n");
  assert.equal(homeLeadKey("2026-11-12"), "voting");
  assert.equal(homeLeadKey("2026-11-29"), "electionNight");
  assert.equal(homeLeadKey("2026-12-22"), "loteriaNadal");
  assert.equal(homeLeadKey("2026-12-31"), "grossa");
  assert.equal(homeLeadKey("2027-01-06"), "reis");
  assert.equal(homeLeadKey("2027-04-15"), null);
});

test("outside the windows the lead rotates daily through the featured entries", () => {
  assert.equal(rotationIndex("2027-04-15", 0), 0);
  const days = ["2027-04-15", "2027-04-16", "2027-04-17", "2027-04-18", "2027-04-19"].map((d) => rotationIndex(d, 5));
  assert.equal(new Set(days).size, 5);
  assert.equal(rotationIndex("2027-04-15", 5), rotationIndex("2027-04-15", 5));
});
