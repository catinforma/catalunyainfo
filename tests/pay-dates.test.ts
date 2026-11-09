import assert from "node:assert/strict";
import { test } from "node:test";

import { PAY_DATES, PAY_DATES_AS_OF, pensionDeadline, sepeDay, tgssBusinessDay } from "../src/lib/content/batch02/pay-dates.ts";

test("pension deadline: first TGSS business day (TARGET + Madrid city holidays), never after the 4th", () => {
  assert.equal(pensionDeadline(2026, 12), "2026-12-01");
  assert.equal(pensionDeadline(2027, 1), "2027-01-04"); // 1 Jan TARGET-closed Friday, then a weekend
  assert.equal(tgssBusinessDay("2026-12-08"), false); // national holiday, also in Madrid
  assert.equal(tgssBusinessDay("2027-05-15"), false); // Saturday anyway; San Isidro
  assert.equal(tgssBusinessDay("2027-03-29"), false); // Easter Monday: TARGET closed
});

test("SEPE: the 10th, moved only off weekends", () => {
  assert.equal(sepeDay(2026, 12), "2026-12-10");
  assert.equal(sepeDay(2027, 1), "2027-01-11");
  assert.equal(sepeDay(2027, 4), "2027-04-12");
});

test("page fits the limits and the rules are re-read within 60 days", () => {
  const e = PAY_DATES.editions.es;
  assert.ok(e.seoTitle.length <= 60, `${e.seoTitle.length}`);
  assert.ok(e.seoDescription.length <= 160, `${e.seoDescription.length}`);
  const age = (Date.now() - Date.parse(`${PAY_DATES_AS_OF}T00:00:00Z`)) / 86_400_000;
  assert.ok(age < 60, `pay-dates rules last read ${PAY_DATES_AS_OF}: re-read SEPE, RD 696/2018, TARGET days and Madrid holidays, then move PAY_DATES_AS_OF`);
});
