import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import {
  LEVEL_RULE,
  READ_AT,
  SOURCE,
  WINDOW_DAYS,
  ZONE_READINGS,
} from "../src/lib/content/mushrooms/conditions.ts";
import { ZONES } from "../src/lib/content/mushrooms/payload.ts";
import { buildBody } from "../src/lib/content/mushrooms/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The mushroom report is a freshness product, and it failed as one: it went
 * from 25 clicks a week at position 2.8 to zero, during the peak of the season,
 * because it had been refreshed once in 24 days while five other pages on the
 * site called it a weekly report.
 *
 * These tests are the thing that makes that visible before Google notices.
 * The staleness test fails the build rather than warning, because a warning in
 * a log is exactly what the last three weeks already were.
 */

/** Days after which the measured layer is no longer worth calling current. */
const STALE_AFTER_DAYS = 10;

function daysOld(iso: string): number {
  const read = new Date(`${iso}T12:00:00Z`).getTime();
  return Math.floor((Date.now() - read) / 86_400_000);
}

test("the measured data is not stale", () => {
  const age = daysOld(READ_AT);
  assert.ok(
    age <= STALE_AFTER_DAYS,
    `the rainfall data was read ${age} days ago (${READ_AT}). ` +
      `Run \`npm run mushrooms:refresh\`. The page calls itself a weekly report.`,
  );
});

test("every editorial zone has a measured reading", () => {
  // A zone with prose but no rainfall would read as current while being
  // whatever it was when somebody last typed it.
  const measured = new Set(ZONE_READINGS.map((reading) => reading.id));
  for (const zone of ZONES) {
    assert.ok(measured.has(zone.id), `${zone.id} has no measured reading`);
  }
});

test("readings carry the station count they average over", () => {
  for (const reading of ZONE_READINGS) {
    assert.ok(reading.stations >= 1, `${reading.id} averages over no stations`);
    assert.ok(reading.mm >= 0, `${reading.id} has negative rainfall`);
    assert.ok(reading.daysSinceRain >= 0, `${reading.id}`);
  }
});

test("the band follows the published rule, not an opinion", () => {
  // Recomputing it here from the same two measured inputs: if the generator
  // ever started deciding bands some other way, this would catch it.
  for (const reading of ZONE_READINGS) {
    const expected =
      LEVEL_RULE.find(
        (rule) => reading.mm >= rule.minMm && reading.daysSinceRain <= rule.maxDaysSinceRain,
      )?.level ?? "low";
    assert.equal(reading.level, expected, `${reading.id}: ${reading.mm} mm, ${reading.daysSinceRain}d`);
  }
});

test("the source is the Generalitat's own open data, over https", () => {
  assert.match(SOURCE.url, /^https:\/\/analisi\.transparenciacatalunya\.cat\//);
  assert.ok(SOURCE.publisher.includes("Meteorològic"));
  assert.ok(WINDOW_DAYS >= 7 && WINDOW_DAYS <= 30);
});

for (const locale of LOCALES) {
  test(`${locale}: the page shows the measured block and the date it was read`, () => {
    const body = buildBody(locale);
    const conditions = body.filter((block) => block.type === "conditionsMap");
    assert.equal(conditions.length, 1, "the measured block is missing");

    const text = bodyToPlainText(body);
    assert.ok(text.includes(READ_AT), "the reading date is not shown to the reader");
  });

  test(`${locale}: the measured block never claims mushrooms are present`, () => {
    const text = bodyToPlainText(buildBody(locale)).toLowerCase();
    // Rain is measured; fruiting is inferred and does not get published.
    for (const phrase of ["hi ha bolets", "hay setas", "there are mushrooms"]) {
      assert.ok(!text.includes(phrase), `${locale} contains "${phrase}"`);
    }
  });

  test(`${locale}: the band rule is stated on the page`, () => {
    const text = bodyToPlainText(buildBody(locale));
    const veryThreshold = LEVEL_RULE.find((rule) => rule.level === "very")?.minMm;
    assert.ok(
      text.includes(String(veryThreshold)),
      "the page does not tell the reader where the thresholds are",
    );
  });
}
