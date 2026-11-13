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
import * as PUBLISH from "../src/lib/content/tourist-tax/publish.ts";
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
      ...copy.muniFuture,
      ...copy.cruise,
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

test("Barcelona's future surcharges in the prose come from the rate table", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(buildBody(locale));
    assert.doesNotMatch(text, /\{s[0-3]\}|\{step\}/, `${locale}: unfilled placeholder`);
    // 6 EUR from 1 April 2027 (Ordenança fiscal 2.2), formatted per locale.
    assert.match(text, locale === "en" ? /€6\.00/ : /6,00\s?€/, `${locale}: 2027 surcharge missing`);
  }
});

/* -------------------------------------------------------------------------- */
/* Top-3 push, 30 Oct 2026                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Re-read on the ATC tariff page on 30 Oct 2026: the seven municipal
 * surcharges in force since 1 Oct 2026 are now priced on the page (the
 * calculator's "rest of Catalonia" stays regional-only), the lead answers
 * "cuánto es la tasa turística en Barcelona" with the range in its first
 * sentence, and the search title carries that range, computed from the rates.
 */
test("the search title states Barcelona's range per night, computed from the rate table", () => {
  const { seoFor } = PUBLISH;
  assert.equal(seoFor("es").seoTitle, "Tasa turística Barcelona 2026: 6 a 12 € por persona y noche");
  assert.equal(seoFor("ca").seoTitle, "Taxa turística Barcelona 2026: de 6 a 12 € per persona i nit");
  // EN retitled 30 Oct (CTR sweep: 215 impressions at 6.5, 1.4 %), same range;
  // 6 Nov (CTR sweep): the searchers' "city tax" and the calculator.
  assert.equal(seoFor("en").seoTitle, "Barcelona city tax 2026: €6-€12 a night, with calculator");
  assert.match(seoFor("en").seoDescription, /^Barcelona city tax: €6 to €12 per person per night \(Catalan rate \+ €5 city surcharge\)/);
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription } = seoFor(locale);
    assert.ok(seoTitle.length <= 60, `${locale}: ${seoTitle.length}`);
    assert.ok(seoDescription.length <= 155, `${locale}: ${seoDescription.length}`);
    assert.doesNotMatch(`${seoTitle} ${seoDescription}`, /\{\w+\}/, `${locale}: unfilled placeholder`);
  }
});

test("the lead gives the Barcelona range first; the municipal surcharges and an FAQ are on the page", () => {
  const lead = { ca: /de 6,00\s?€ a 12,00\s?€ per persona i nit/, es: /de 6,00\s?€ a 12,00\s?€ por persona y noche/, en: /€6\.00 to €12\.00 per person per night/ };
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const first = body.find((b) => b.type === "paragraph") as { text: string };
    assert.match(first.text, lead[locale], `${locale}: answer in the first line`);
    const text = bodyToPlainText(body);
    assert.doesNotMatch(text, /\{\w+\}/, `${locale}: unfilled placeholder`);
    const muni = body.find((b) => b.type === "table" && JSON.stringify(b).includes("Sant Just Desvern")) as { rows: string[][] } | undefined;
    assert.equal(muni?.rows.length, 7, `${locale}: seven municipalities`);
    const hospitalet = muni?.rows.find((r) => r[0] === "L'Hospitalet de Llobregat");
    assert.match(hospitalet?.[2] ?? "", /1[.,]80/, `${locale}: L'Hospitalet four-star surcharge`);
    assert.ok(body.some((b) => b.type === "faq"), `${locale}: FAQ`);
    assert.match(text, /3[.,]60/, `${locale}: L'Hospitalet four-star total`);
  }
});

/* -------------------------------------------------------------------------- */
/* From 1 April 2027 and cruise passengers (re-read 13 Nov 2026)              */
/* -------------------------------------------------------------------------- */

/**
 * ATC tariff page, re-read 13 Nov 2026: every 1 April 2027 figure is fixed —
 * Barcelona (Generalitat rate unchanged + Ordenança fiscal 2.2's 6 EUR), the
 * rest of Catalonia (Llei 2/2026) and a new "a partir de l'01.04.2027" column
 * for six of the seven municipal surcharges (Sant Just Desvern keeps one
 * open-ended column). Cruise rule from the ATC "Meritació" page: passengers in
 * transit pay at the call; embarking at the start or leaving at the end of
 * the trip does not accrue the tax.
 */
test("from 1 April 2027: Barcelona table, municipal column and cruise table on the page", () => {
  const bcn = { ca: /1 d'abril de 2027/, es: /1 de abril de 2027/, en: /1 April 2027/ };
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const tables = body.filter((b) => b.type === "table") as { caption?: string; rows: string[][]; note?: string }[];

    const bcn2027 = tables.find((t) => /Barcelona/.test(t.caption ?? "") && bcn[locale].test(t.caption ?? ""));
    assert.ok(bcn2027, `${locale}: dated Barcelona 2027 table`);
    const four = bcn2027.rows[ACCOMMODATION_ORDER.indexOf("hotel-4")]!;
    assert.match(four[2]!, /6[.,]00/, `${locale}: 6 EUR surcharge`);
    assert.match(four[3]!, /9[.,]40/, `${locale}: 3.40 + 6.00`);
    assert.match(bcn2027.rows[ACCOMMODATION_ORDER.indexOf("hotel-5")]![3]!, /13[.,]00/, `${locale}: five-star 2027`);

    const muni2027 = tables.filter((t) => JSON.stringify(t.rows).includes("Sant Just Desvern"))[1];
    assert.ok(muni2027, `${locale}: municipal 2027 table`);
    const row = (name: string) => muni2027.rows.find((r) => r[0] === name)!;
    assert.match(row("L'Hospitalet de Llobregat")[2]!, /2[.,]40/, `${locale}: L'Hospitalet four-star 2027`);
    assert.match(row("L'Hospitalet de Llobregat")[3]!, /2[.,]50/, `${locale}: L'Hospitalet dwelling 2027`);
    assert.match(row("Castelldefels")[3]!, /2[.,]40/, `${locale}: Castelldefels dwelling as printed`);
    assert.match(row("Esplugues de Llobregat")[3]!, /1[.,]20/, `${locale}: Esplugues dwelling 2027 as printed`);
    assert.match(row("Esplugues de Llobregat")[5]!, /2[.,]50/, `${locale}: Esplugues other 2027 as printed`);
    assert.match(row("Sant Just Desvern")[2]!, /1[.,]80/, `${locale}: Sant Just keeps its open-ended amount`);
    assert.equal(row("Esplugues de Llobregat")[1], "—");

    const cruise = tables.find((t) => t.rows.length === 2 && t.rows[0]!.length === 5);
    assert.ok(cruise, `${locale}: cruise table`);
    // Barcelona: 4 + 5 / 6 + 5 now, 4 + 6 / 6 + 6 from April 2027; elsewhere 3 / 4.50 then 4 / 6.
    assert.deepEqual(cruise.rows.map((r) => r.slice(1).map((c) => c.replace(/[^\d.,]/g, ""))), [
      locale === "en" ? ["9.00", "10.00", "3.00", "4.00"] : ["9,00", "10,00", "3,00", "4,00"],
      locale === "en" ? ["11.00", "12.00", "4.50", "6.00"] : ["11,00", "12,00", "4,50", "6,00"],
    ]);
    assert.match(cruise.note ?? "", /3[.,]00.*4[.,]00.*4[.,]00.*4[.,]00/, `${locale}: Castelldefels / El Prat cruise surcharge`);

    const text = bodyToPlainText(body);
    assert.match(text, /trànsit|tránsito|transit/, `${locale}: transit rule`);
    assert.match(text, /desembarca|leave the ship/, `${locale}: end-of-trip passengers do not pay`);
    assert.doesNotMatch(text, /\{\w+\}/, `${locale}: unfilled placeholder`);
  }
});

test("the calculator applies the 1 April 2027 figures by date", () => {
  const at = (scope: "barcelona" | "rest-of-catalonia", date: string, accommodation: (typeof ACCOMMODATION_ORDER)[number]) =>
    calculateTax({ scope, date, accommodation, liableGuests: 1, nights: 1 }).perPersonPerUnit;
  assert.equal(at("barcelona", "2027-03-31", "cruise-under-12h"), 11);
  assert.equal(at("barcelona", "2027-04-01", "cruise-under-12h"), 12);
  assert.equal(at("rest-of-catalonia", "2027-03-31", "hotel-4"), 1.8);
  assert.equal(at("rest-of-catalonia", "2027-04-01", "hotel-4"), 2.4);
  assert.equal(at("barcelona", "2028-04-01", "hotel-4"), 10.4);
  assert.equal(at("barcelona", "2029-04-01", "hotel-4"), 11.4);
});

test("date guards: re-read the ATC before 1 April 2027, and roll the page over on that day", async () => {
  const { LAST_VERIFIED, RECHECK_BEFORE_APRIL_2027 } = await import("../src/lib/content/tourist-tax/rates.ts");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(LAST_VERIFIED <= today, `LAST_VERIFIED (${LAST_VERIFIED}) is in the future`);
  assert.ok(
    today < RECHECK_BEFORE_APRIL_2027 || LAST_VERIFIED >= RECHECK_BEFORE_APRIL_2027,
    `On ${today} the tourist-tax rates were last read on ${LAST_VERIFIED}. Before 1 April 2027 re-read the ATC tariff page (https://atc.gencat.cat/ca/tributs/ieet/quota-tributaria) and Barcelona's Ordenança fiscal 2.2, update rates.ts and LAST_VERIFIED, and publish the \`tourist-tax\` group.`,
  );
  const now = RATE_PERIODS.find((p) => p.scope === "barcelona" && p.from === "2026-04-01")!;
  assert.ok(
    now.until === null || today <= now.until,
    `On ${today} the page still leads with the period that ended on ${now.until}. Move EXAMPLE_DATE and the "now"/"2027" periods in publish.ts to the 1 April 2027 period, retitle (2027) per docs/SEO_EXPERIMENTS.md, and publish \`tourist-tax\`.`,
  );
});
