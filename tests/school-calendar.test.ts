import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { todayInCatalonia, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { SCHOOL_YEARS, isSchoolCovered, schoolStatusOn } from "../src/lib/content/school/calendar.ts";
import { COPY, buildBody } from "../src/lib/content/school/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

test("the calendar still covers today, or the build fails", () => {
  assert.ok(isSchoolCovered(todayInCatalonia()), "Ordre EDF/66/2026 runs out: add the next order");
});

test("dates are in order and land on weekdays where the order sets a weekday", () => {
  for (const y of SCHOOL_YEARS) {
    assert.ok(y.start < y.christmas[0] && y.christmas[1] < y.easter[0] && y.easter[1] < y.end, y.label);
    assert.ok(y.endBatxillerat1 <= y.end, y.label);
    for (const iso of [y.start, y.end, y.endBatxillerat1]) {
      const wd = weekdayIndex(iso);
      assert.ok(wd >= 1 && wd <= 5, `${y.label} ${iso} is a weekend`);
    }
  }
});

test("the status follows the DOGC dates", () => {
  assert.equal(schoolStatusOn("2026-10-07").kind, "term");
  const term = schoolStatusOn("2026-10-07");
  assert.ok(term.kind === "term" && term.nextBreak.kind === "christmas" && term.nextBreak.from === "2026-12-22");
  assert.equal(schoolStatusOn("2026-12-22").kind, "christmas");
  assert.equal(schoolStatusOn("2027-01-07").kind, "christmas");
  assert.equal(schoolStatusOn("2027-01-08").kind, "term");
  assert.equal(schoolStatusOn("2027-03-25").kind, "easter");
  const summer = schoolStatusOn("2027-07-15");
  assert.ok(summer.kind === "summer" && summer.nextStart.start === "2027-09-08");
  assert.equal(schoolStatusOn("2029-07-01").kind, "unknown");
  assert.equal(schoolStatusOn("2026-08-01").kind, "unknown");
});

test("every edition validates, shows the calendar first, has a photo and no year in the slug", () => {
  const keys = new Set(IMAGES.map((image) => image.key));
  assert.ok(keys.has("calendari-escolar-escola-vic-pati"));
  assert.ok(keys.has("calendari-escolar-grup-ramon-llull"));
  for (const locale of LOCALES) {
    const body = buildBody(locale, "00000000-0000-4000-8000-000000000000");
    bodySchema.parse(body);
    const block = body.findIndex((b) => b.type === "schoolCalendar");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(block >= 0 && block < heading, locale);
    assert.ok(body.some((b) => b.type === "image"), locale);
    assert.ok(!/\d{4}/.test(COPY[locale].path), locale);
    assert.ok(COPY[locale].seoTitle.length <= 60, `${locale}: ${COPY[locale].seoTitle.length}`);
  }
});
