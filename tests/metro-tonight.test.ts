import assert from "node:assert/strict";
import { test } from "node:test";

import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { metroDay, metroLines } from "../src/lib/content/metro/tonight.ts";

// Barcelona's two local days in 2026 (Generalitat open data b4eh-r8up).
const BCN_2026 = ["2026-05-25", "2026-09-24"];

test("weekday rules follow TMB: midnight, Friday 2:00, Saturday all night, Sunday continues", () => {
  assert.deepEqual(metroDay("2026-10-22"), { date: "2026-10-22", opensAtFive: true, close: "midnight" }); // Thursday
  assert.equal(metroDay("2026-10-23").close, "two"); // Friday
  assert.equal(metroDay("2026-10-24").close, "allNight"); // Saturday
  const sunday = metroDay("2026-10-25");
  assert.equal(sunday.opensAtFive, false);
  assert.equal(sunday.close, "midnight");
  assert.equal(metroDay("2026-10-26").opensAtFive, true);
});

test("the night before a public holiday closes at 2:00, the holiday itself at midnight", () => {
  // Tuesday 8 Dec 2026 is the Immaculate Conception; Monday 7 Dec is its eve.
  assert.equal(metroDay("2026-12-07").close, "two");
  assert.equal(metroDay("2026-12-08").close, "midnight");
  // Sunday 24 May 2026 is the eve of Barcelona's local Whit Monday.
  assert.equal(metroDay("2026-05-24", BCN_2026).close, "two");
  assert.equal(metroDay("2026-05-24").close, "midnight");
});

test("special nights: all night on 23 Jun, 23 Sep and 31 Dec; 23:00 on 24 Dec", () => {
  assert.equal(metroDay("2026-06-23").close, "allNight");
  assert.equal(metroDay("2026-09-23", BCN_2026).close, "allNight");
  assert.equal(metroDay("2026-12-31").close, "allNight");
  assert.equal(metroDay("2027-01-01").opensAtFive, false);
  assert.equal(metroDay("2026-12-24").close, "eleven");
});

test("the printed lines name the day and the hour in each language", () => {
  const ca = metroLines("2026-10-23", "ca");
  assert.match(ca.today, /^Avui, divendres, 23 d'octubre de 2026, el metro obre a les 5:00 i tanca a les 2:00/);
  assert.match(ca.tomorrow, /^Demà, dissabte, .*no tanca en tota la nit\.$/);
  assert.match(metroLines("2026-10-25", "es").today, /sin parar desde la noche anterior y cierra a medianoche/);
  assert.match(metroLines("2026-10-22", "en").today, /^Today, Thursday 22 October 2026, the metro opens at 5:00 and closes at midnight\.$/);
});

test("the metro guide carries the block right after its lead, and the cron refreshes it", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("metroTonight"));
  for (const locale of ["ca", "es", "en"] as const) {
    const body = HOURS.editions[locale].blocks;
    assert.equal(body[1]?.type, "metroTonight", locale);
  }
});
