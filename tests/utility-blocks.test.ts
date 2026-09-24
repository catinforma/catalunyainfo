import assert from "node:assert/strict";
import { test } from "node:test";

import { blockSchema, bodyToPlainText, parseBody } from "../src/lib/content/blocks.ts";

/**
 * The calculator and calendar blocks exist to carry official figures onto the
 * page without a person retyping them. That makes their correctness a
 * publishing risk rather than a cosmetic one: a calculator that quietly
 * multiplies the wrong way prints a confident wrong number, and a reader has
 * no way to tell.
 *
 * These tests pin the evaluation model and the iCalendar output. The fixtures
 * use invented placeholder rates on purpose — they test arithmetic, not any
 * real tax.
 */

/** Same model as the component: sum of terms, term = product of factors. */
function evaluate(
  outputs: { terms: { factors: unknown[] }[] }[],
  numbers: Record<string, number>,
  amounts: Record<string, number>,
): number[] {
  const factorValue = (factor: Record<string, number | string>): number => {
    if ("value" in factor) return Number(factor.value);
    if ("optionAmount" in factor) return amounts[String(factor.optionAmount)] ?? 0;
    let value = numbers[String(factor.input)] ?? 0;
    if (typeof factor.min === "number") value = Math.max(factor.min, value);
    if (typeof factor.max === "number") value = Math.min(factor.max, value);
    return value;
  };
  return outputs.map((output) =>
    output.terms.reduce(
      (sum, term) =>
        sum +
        term.factors.reduce<number>(
          (product, f) => product * factorValue(f as Record<string, number | string>),
          1,
        ),
      0,
    ),
  );
}

const calculator = {
  type: "calculator",
  title: "Placeholder calculator",
  inputs: [
    { kind: "number", id: "people", label: "People", value: 2 },
    { kind: "number", id: "nights", label: "Nights", value: 10 },
    {
      kind: "select",
      id: "lodging",
      label: "Lodging",
      options: [
        { value: "a", label: "Type A", amount: 3 },
        { value: "b", label: "Type B", amount: 1 },
      ],
    },
  ],
  outputs: [
    {
      label: "Total",
      emphasis: true,
      terms: [
        {
          factors: [
            { optionAmount: "lodging" },
            { input: "people" },
            // The cap is the whole point: a charge that stops at seven nights.
            { input: "nights", max: 7 },
          ],
        },
        { factors: [{ value: 4 }, { input: "people" }, { input: "nights", max: 7 }] },
      ],
    },
  ],
  note: "Placeholder rates, for testing arithmetic only.",
};

test("the calculator block validates", () => {
  const parsed = blockSchema.safeParse(calculator);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.[0]));
});

test("a capped factor stops counting at its maximum", () => {
  // 10 nights requested, capped at 7. (3 + 4) x 2 people x 7 nights = 98.
  const [total] = evaluate(calculator.outputs, { people: 2, nights: 10 }, { lodging: 3 });
  assert.equal(total, 98);

  // Under the cap the figure follows the input: (3 + 4) x 2 x 3 = 42.
  const [short] = evaluate(calculator.outputs, { people: 2, nights: 3 }, { lodging: 3 });
  assert.equal(short, 42);
});

test("changing the selected option changes the rate", () => {
  const [a] = evaluate(calculator.outputs, { people: 1, nights: 1 }, { lodging: 3 });
  const [b] = evaluate(calculator.outputs, { people: 1, nights: 1 }, { lodging: 1 });
  assert.equal(a, 7);
  assert.equal(b, 5);
});

test("a calculator without a source note is rejected", () => {
  const { note: _note, ...withoutNote } = calculator;
  assert.equal(blockSchema.safeParse(withoutNote).success, false);
});

test("calculator text reaches the plain-text extract", () => {
  const text = bodyToPlainText(parseBody([calculator]));
  assert.match(text, /Placeholder calculator/);
  assert.match(text, /Nights/);
  assert.match(text, /Total/);
});

/* -------------------------------------------------------------------------- */

const calendar = {
  type: "calendar",
  title: "Placeholder dates",
  events: [
    { date: "2027-01-01", title: "First", scope: "Catalunya" },
    { date: "2027-04-02", endDate: "2027-04-05", title: "Multi-day", note: "A note" },
  ],
  note: "Source goes here.",
};

test("the calendar block validates, and rejects a malformed date", () => {
  assert.ok(blockSchema.safeParse(calendar).success);

  const broken = { ...calendar, events: [{ date: "1 January 2027", title: "Bad" }] };
  assert.equal(blockSchema.safeParse(broken).success, false);

  const alsoBroken = { ...calendar, events: [{ date: "2027-1-1", title: "Bad" }] };
  assert.equal(blockSchema.safeParse(alsoBroken).success, false);
});

test("calendar dates and titles reach the plain-text extract", () => {
  const text = bodyToPlainText(parseBody([calendar]));
  assert.match(text, /Placeholder dates/);
  assert.match(text, /Multi-day/);
  assert.match(text, /Catalunya/);
});

test("an all-day ICS event ends the day after the last day", () => {
  // DTEND is exclusive in RFC 5545. A single day on 2027-01-01 must end on
  // 2027-01-02, and a run to 2027-04-05 must end on 2027-04-06 — otherwise
  // every entry is silently one day short in the reader's calendar.
  const dayAfter = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10).replaceAll("-", "");
  };
  assert.equal(dayAfter("2027-01-01"), "20270102");
  assert.equal(dayAfter("2027-04-05"), "20270406");
  // Across a month boundary, and across a leap day.
  assert.equal(dayAfter("2027-01-31"), "20270201");
  assert.equal(dayAfter("2028-02-28"), "20280229");
});

/* -------------------------------------------------------------------------- */

test("a map may carry several labelled points", () => {
  const map = {
    type: "map",
    latitude: 42.36,
    longitude: 2.31,
    zoom: 12,
    points: [
      { latitude: 42.37, longitude: 2.3, label: "A place" },
      { latitude: 42.4, longitude: 2.29, label: "Another", href: "/ca/pobles/x/" },
    ],
  };
  assert.ok(blockSchema.safeParse(map).success);

  // A point outside the possible range of the planet is a data error, not a
  // rendering one, and must not reach the page.
  const bad = { ...map, points: [{ latitude: 999, longitude: 2.3, label: "Nowhere" }] };
  assert.equal(blockSchema.safeParse(bad).success, false);
});

test("parseBody drops a malformed utility block instead of throwing", () => {
  const body = parseBody([
    { type: "calculator", title: "No inputs at all" },
    { type: "paragraph", text: "This survives." },
  ]);
  assert.equal(body.length, 1);
  assert.equal(body[0]?.type, "paragraph");
});
