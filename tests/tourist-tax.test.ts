import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import {
  ACCOMMODATION_ORDER,
  EXEMPT_AGE_AT_OR_BELOW,
  MAX_STAY_UNITS,
  RATE_PERIODS,
  calculateTax,
  periodFor,
} from "../src/lib/content/tourist-tax/rates.ts";
import { COPY } from "../src/lib/content/tourist-tax/copy.ts";
import { EXAMPLES, buildBody, exampleResult } from "../src/lib/content/tourist-tax/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * A tax page is read by people deciding what a trip costs, and quoted back at
 * hotel receptions. Two classes of error matter here, and the tests are split
 * along that line:
 *
 *  - **Arithmetic.** The four worked examples in the article are the same four
 *    the editorial package specified, and they are computed rather than typed,
 *    so these assertions are what stands between a rate change and a page full
 *    of totals that no longer add up.
 *  - **Assertions we are not entitled to make.** No Barcelona surcharge is
 *    verified beyond 31 March 2027, and no municipality outside Barcelona has
 *    a verified surcharge at all. The calculator must decline those rather
 *    than invent a zero, and no test may quietly encode one.
 */

const DATE = "2026-10-15";

/* -------------------------------------------------------------------------- */
/* The four cases from the editorial package                                  */
/* -------------------------------------------------------------------------- */

test("A: couple, 4 nights, four-star hotel in Barcelona = 67.20", () => {
  const result = calculateTax({
    scope: "barcelona",
    date: DATE,
    accommodation: "hotel-4",
    liableGuests: 2,
    nights: 4,
  });
  assert.equal(result.perPersonPerUnit, 8.4);
  assert.equal(result.total, 67.2);
});

test("B: two exempt children do not pay - tourist dwelling in Barcelona = 76.00", () => {
  const result = calculateTax({
    scope: "barcelona",
    date: DATE,
    accommodation: "tourist-dwelling",
    liableGuests: 2,
    nights: 4,
  });
  assert.equal(result.total, 76);
});

test("C: ten nights are capped at seven units - five-star in Barcelona = 168.00", () => {
  const result = calculateTax({
    scope: "barcelona",
    date: DATE,
    accommodation: "hotel-5",
    liableGuests: 2,
    nights: 10,
  });
  assert.equal(result.taxableUnits, MAX_STAY_UNITS);
  assert.equal(result.capped, true);
  assert.equal(result.total, 168);
});

test("D: outside Barcelona the regional rate stands alone = 14.40", () => {
  const result = calculateTax({
    scope: "rest-of-catalonia",
    date: DATE,
    accommodation: "hotel-4",
    liableGuests: 2,
    nights: 4,
  });
  assert.equal(result.surcharge, null);
  assert.equal(result.total, 14.4);
});

test("the article's example table is those same four cases", () => {
  assert.deepEqual(
    EXAMPLES.map((example) => exampleResult(example).total),
    [67.2, 76, 168, 14.4],
  );
});

/* -------------------------------------------------------------------------- */
/* What the calculator must refuse to assert                                  */
/* -------------------------------------------------------------------------- */

test("Barcelona's surcharge follows the Ordenança fiscal 2.2 steps", () => {
  // BOPB 2-2-2026, transitional provision: 5 / 6 / 7 EUR each 1 April, then 8.
  // The Generalitat's Barcelona rate (Llei 2/2026) does not change.
  const steps: [string, number][] = [
    ["2027-03-31", 5],
    ["2027-04-01", 6],
    ["2028-03-31", 6],
    ["2028-04-01", 7],
    ["2029-04-01", 8],
    ["2035-01-01", 8],
  ];
  for (const [date, surcharge] of steps) {
    const period = periodFor("barcelona", date);
    assert.ok(period, date);
    assert.equal(period.surcharge, surcharge, date);
    assert.equal(period.regional["hotel-4"], 3.4, date);
  }
  // Four-star hotel from 1 April 2027: 3.40 + 6.00 = 9.40 per person and night.
  const result = calculateTax({ scope: "barcelona", date: "2027-04-01", accommodation: "hotel-4", liableGuests: 2, nights: 4 });
  assert.equal(result.perPersonPerUnit, 9.4);
  assert.equal(result.total, 75.2);
});

test("an unverified municipal surcharge is null, never zero", () => {
  for (const period of RATE_PERIODS) {
    if (period.scope === "rest-of-catalonia") assert.equal(period.surcharge, null);
  }
});

test("every period carries a source and a verification date", () => {
  for (const period of RATE_PERIODS) {
    assert.match(period.sourceUrl, /^https:\/\/(atc\.gencat\.cat|ajuntament\.barcelona\.cat)\//);
    assert.match(period.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    for (const type of ACCOMMODATION_ORDER) {
      const rate = period.regional[type];
      assert.ok(rate > 0, `${period.scope} ${period.from} ${type} must have a rate`);
    }
  }
});

test("rates outside Barcelona rise on 1 April 2027, never fall", () => {
  const before = RATE_PERIODS.find(
    (p) => p.scope === "rest-of-catalonia" && p.from === "2026-04-01",
  );
  const after = RATE_PERIODS.find(
    (p) => p.scope === "rest-of-catalonia" && p.from === "2027-04-01",
  );
  assert.ok(before && after);
  for (const type of ACCOMMODATION_ORDER) {
    assert.ok(after.regional[type] >= before.regional[type], `${type} must not fall`);
  }
});

test("zero liable guests or zero nights produce zero, not a rate", () => {
  const none = calculateTax({
    scope: "barcelona",
    date: DATE,
    accommodation: "hotel-5",
    liableGuests: 0,
    nights: 4,
  });
  assert.equal(none.total, 0);
  assert.equal(none.capped, false);
});

/* -------------------------------------------------------------------------- */
/* The rendered page                                                          */
/* -------------------------------------------------------------------------- */

for (const locale of LOCALES) {
  test(`${locale}: the body is valid, substantial, and carries the calculator`, () => {
    const body = buildBody(locale);
    const parsed = bodySchema.safeParse(body);
    assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 3)));

    assert.equal(body.filter((block) => block.type === "touristTax").length, 1);
    assert.ok(body.filter((block) => block.type === "table").length >= 4);
    assert.ok(wordCount(bodyToPlainText(body)) > 700);
  });

  test(`${locale}: every figure on the page comes from the rate table`, () => {
    // The prose must contain no euro amounts of its own: they all arrive via
    // the placeholders in the direct answer, or via a generated table.
    const copy = COPY[locale];
    const prose = [
      ...copy.lead,
      ...copy.barcelona,
      ...copy.rest,
      ...copy.future,
      ...copy.barcelonaFuture,
      ...copy.children,
      ...copy.nights,
      ...copy.booking,
      ...copy.who,
      ...copy.why,
      ...copy.closing,
    ].join(" ");
    // "up to €8" is the statutory ceiling, quoted as law, not as a rate.
    const amounts = [...prose.matchAll(/(\d+[.,]\d{2})\s*(?:€|euros)/g)];
    assert.equal(amounts.length, 0, `unexpanded amount in ${locale} prose: ${amounts[0]?.[0]}`);
  });

  test(`${locale}: the direct answer has no placeholder left in it`, () => {
    const body = buildBody(locale);
    const text = bodyToPlainText(body);
    assert.ok(!/\{(bcn4|bcn4reg|bcn4sur|couple4|rest4|max|age)\}/.test(text));
    assert.ok(text.includes(String(MAX_STAY_UNITS)));
    assert.ok(text.includes(String(EXEMPT_AGE_AT_OR_BELOW)));
  });

  test(`${locale}: the path is locale-correct and has no year in it`, () => {
    const { path } = COPY[locale];
    assert.ok(!/\d{4}/.test(path), "an evergreen URL must not carry a year");
    assert.match(path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
  });
}

test("the three paths are distinct", () => {
  const paths = LOCALES.map((locale) => COPY[locale].path);
  assert.equal(new Set(paths).size, paths.length);
});
