import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import {
  ARAN_SUBSTITUTIONS,
  COVERED_YEARS,
  HOLIDAYS_BY_YEAR,
  addDays,
  allHolidays,
  daysBetween,
  holidayOn,
  isCovered,
  longDate,
  nextHolidayAfter,
  shortDate,
  todayInCatalonia,
  weekdayIndex,
} from "../src/lib/content/holidays/calendar.ts";
import { COPY, buildBody } from "../src/lib/content/holidays/today-publish.ts";
import { COPY as PLANNER_COPY } from "../src/lib/content/holidays/copy.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * This page tells somebody whether they have to go to work. Being wrong by one
 * day is the whole failure mode, so the tests are mostly about dates: the
 * weekday the page prints against the date it prints, and the timezone the
 * "today" comes from.
 */

/* -------------------------------------------------------------------------- */
/* The dates themselves                                                       */
/* -------------------------------------------------------------------------- */

test("each covered year has exactly twelve Catalonia-wide holidays", () => {
  for (const year of COVERED_YEARS) {
    const holidays = HOLIDAYS_BY_YEAR[year] ?? [];
    assert.equal(holidays.length, 12, `${year}`);
    for (const holiday of holidays) {
      assert.equal(holiday.date.slice(0, 4), String(year));
      assert.match(holiday.date, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("every holiday has a name in all three languages", () => {
  for (const holiday of allHolidays()) {
    for (const locale of LOCALES) {
      assert.ok((holiday.name[locale] ?? "").length > 2, `${holiday.date} ${locale}`);
    }
  }
});

test("the 2026 dates match the weekdays the official calendar lists", () => {
  // Read off the Generalitat's calendar. If a date were mistyped, the weekday
  // computed from it would stop matching and this test would catch it.
  const expected: Record<string, number> = {
    "2026-01-01": 4, // Thursday
    "2026-01-06": 2, // Tuesday
    "2026-04-03": 5, // Friday
    "2026-04-06": 1, // Monday
    "2026-05-01": 5, // Friday
    "2026-06-24": 3, // Wednesday
    "2026-08-15": 6, // Saturday
    "2026-09-11": 5, // Friday
    "2026-10-12": 1, // Monday
    "2026-12-08": 2, // Tuesday
    "2026-12-25": 5, // Friday
    "2026-12-26": 6, // Saturday
  };
  for (const [date, weekday] of Object.entries(expected)) {
    assert.equal(weekdayIndex(date), weekday, date);
    assert.ok(holidayOn(date), `${date} is missing from the calendar`);
  }
});

test("dates are unique and sorted across the whole range", () => {
  const dates = allHolidays().map((holiday) => holiday.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.deepEqual(dates, [...dates].sort());
});

test("the Aran entry is a substitution, never an extra day", () => {
  for (const item of ARAN_SUBSTITUTIONS) {
    // The day it replaces must be a real Catalonia-wide holiday...
    assert.ok(holidayOn(item.replaces), `${item.replaces} is not in the calendar`);
    // ...and the Aran day itself must not be in the Catalonia-wide list, or
    // Aran would end up with thirteen days.
    assert.equal(holidayOn(item.date), null, `${item.date} must not be Catalonia-wide`);
    assert.equal(item.date.slice(0, 4), String(item.year));
  }
});

/* -------------------------------------------------------------------------- */
/* Date arithmetic                                                            */
/* -------------------------------------------------------------------------- */

test("today is read in Catalonia's timezone, not the server's", () => {
  // 31 December, 23:30 UTC. In Madrid it is already 1 January: a page that
  // answered from the server clock would say the wrong day, and would say it
  // on the one night of the year when the answer matters most.
  const newYearEveLate = new Date("2026-12-31T23:30:00Z");
  assert.equal(todayInCatalonia(newYearEveLate), "2027-01-01");

  // And the reverse: 00:30 UTC in summer is still the same day in Madrid.
  const summerNight = new Date("2026-07-15T00:30:00Z");
  assert.equal(todayInCatalonia(summerNight), "2026-07-15");
});

test("addDays crosses months, years and the DST boundary", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  // The spring-forward night; a naive +24h would land on the same date.
  assert.equal(addDays("2026-03-28", 1), "2026-03-29");
});

test("the next holiday is strictly after the date asked about", () => {
  const christmas = "2026-12-25";
  assert.equal(nextHolidayAfter(christmas)?.date, "2026-12-26");
  // And it crosses the year boundary into the next published calendar.
  assert.equal(nextHolidayAfter("2026-12-26")?.date, "2027-01-01");
});

test("daysBetween is whole days, in the right direction", () => {
  assert.equal(daysBetween("2026-10-06", "2026-10-12"), 6);
  assert.equal(daysBetween("2026-10-12", "2026-10-12"), 0);
});

test("a year with no published order is reported as unknown, never guessed", () => {
  assert.equal(isCovered("2028-01-01"), false);
  assert.equal(holidayOn("2028-01-01"), null);
  // Catalonia approves the calendar one year at a time, so claiming 2028 would
  // be invention even though the fixed dates are predictable.
  assert.equal(nextHolidayAfter("2027-12-25")?.date, undefined);
});

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

test("the long date prints the weekday that belongs to the date", () => {
  // 12 October 2026 is a Monday.
  assert.match(longDate("2026-10-12", "ca"), /^dilluns/);
  assert.match(longDate("2026-10-12", "es"), /^lunes/);
  assert.match(longDate("2026-10-12", "en"), /^Monday/);
});

test("Catalan elides the preposition before a vowel", () => {
  assert.match(shortDate("2026-10-12", "ca"), /12 d'octubre/);
  assert.match(shortDate("2026-12-25", "ca"), /25 de desembre/);
  assert.match(shortDate("2026-10-12", "es"), /12 de octubre/);
  assert.match(shortDate("2026-10-12", "en"), /12 October/);
});

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

for (const locale of LOCALES) {
  test(`${locale}: the body validates and leads with the answer`, () => {
    const body = buildBody(locale);
    const parsed = bodySchema.safeParse(body);
    assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 2)));

    // The block has to come before any heading: somebody who typed "is it a
    // holiday today" should not have to read an introduction first.
    const answerIndex = body.findIndex((block) => block.type === "holidayToday");
    const firstHeading = body.findIndex((block) => block.type === "heading");
    assert.ok(answerIndex >= 0, "no answer block");
    assert.ok(answerIndex < firstHeading, "the answer is below the first heading");
  });

  test(`${locale}: SEO fields are present and within the rendered lengths`, () => {
    const { seoTitle, seoDescription, path, excerpt } = COPY[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 65, `${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 165, `${seoDescription.length}`);
    assert.ok(excerpt.length > 30);
    assert.ok(!/\d{4}/.test(path), "the URL must be evergreen");
  });

  test(`${locale}: it links the year planner and does not duplicate it`, () => {
    const text = bodyToPlainText(buildBody(locale));
    const plannerPath = PLANNER_COPY[locale].path;
    assert.match(
      JSON.stringify(buildBody(locale)),
      new RegExp(plannerPath.replace(/[/-]/g, "\\$&")),
      "no link to the year planner",
    );
    // The planner owns the bridges and the ICS download. Checking for the
    // component rather than for the word, because the link line legitimately
    // describes what the planner offers.
    assert.ok(
      !buildBody(locale).some((block) => block.type === "calendar"),
      "this page should not carry the calendar download",
    );
    assert.ok(wordCount(text) > 180);
  });

  test(`${locale}: the page says the two local days are not covered`, () => {
    const text = bodyToPlainText(buildBody(locale)).toLowerCase();
    assert.match(text, /local/, "no mention of local holidays");
  });
}

test("the three paths are distinct and sit under a guides hub", () => {
  const paths = LOCALES.map((locale) => COPY[locale].path);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) assert.match(path, /^(guies|guias|guides)\//);
});

test("this page's paths never collide with the year planner's", () => {
  for (const locale of LOCALES) {
    assert.notEqual(COPY[locale].path, PLANNER_COPY[locale].path, locale);
  }
});
