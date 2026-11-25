import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, slugifyAnchor } from "../src/lib/content/blocks.ts";
import { CLIMATE, climateMonth } from "../src/lib/content/batch02/climate.ts";
import { SUN_15TH, SUN_REREAD_BY, SUN_VERIFIED, daylightText, holidaySentence, sunMonth, sunRows } from "../src/lib/content/batch02/climate-months.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { CATALONIA_HOLIDAYS } from "../src/lib/content/holidays/payload.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

type B = { type: string; level?: number; text?: string; id?: string; caption?: string; headers?: string[]; rows?: string[][]; items?: { question: string; answer: string }[] };

const blocksOf = (locale: (typeof LOCALES)[number]) => CLIMATE.editions[locale].blocks as unknown as B[];

/** O4, 25 Nov 2026: sunrise/sunset table (IGN), per-month pack and events lines, extra FAQs. */
test("climate months: sun table rows come from the one source module and daylight is sunset minus sunrise", () => {
  assert.equal(SUN_15TH.length, 12);
  // Spot checks against the IGN file read on 25 Nov 2026 (day 15).
  assert.deepEqual(SUN_15TH[0], [[8, 15], [17, 46]]);
  assert.deepEqual(SUN_15TH[5], [[6, 17], [21, 26]]);
  assert.deepEqual(SUN_15TH[11], [[8, 10], [17, 22]]);
  assert.equal(sunMonth(0).daylightMinutes, 9 * 60 + 31);
  assert.equal(daylightText(5), "15 h 09 min");
  assert.equal(daylightText(11), "9 h 12 min");
  for (const locale of LOCALES) {
    const sun = blocksOf(locale).filter((b) => b.type === "table")[2]!;
    assert.match(sun.caption ?? "", /2027/);
    assert.equal(sun.rows?.length, 12);
    assert.deepEqual(
      sun.rows?.map((r) => r.slice(1)),
      sunRows(Array.from({ length: 12 }, () => "")).map((r) => r.slice(1)),
      `${locale}: sun table is the module's data`,
    );
    assert.deepEqual(sun.rows?.[0], [sun.rows?.[0]?.[0], "08:15", "17:46", "9 h 31 min"]);
  }
});

test("climate months: no undefined, anchors for all twelve months, a daylight, pack and events line under each", () => {
  for (const locale of LOCALES) {
    const blocks = blocksOf(locale);
    assert.doesNotThrow(() => bodySchema.parse(blocks), `${locale}: valid blocks`);
    const text = bodyToPlainText(blocks as never);
    assert.doesNotMatch(text, /undefined|NaN|\[object|null\b/, `${locale}: no placeholder leaks`);
    const h3 = blocks.filter((b) => b.type === "heading" && b.level === 3);
    assert.equal(h3.length, 12);
    const ids = h3.map((b) => b.id ?? slugifyAnchor(b.text ?? ""));
    assert.equal(new Set(ids).size, 12, `${locale}: twelve distinct month anchors`);
    // The jump line under the lead links every anchor.
    const jump = (blocks.find((b) => b.type === "paragraph" && /\(#/.test(b.text ?? "")) as { text?: string } | undefined)?.text ?? "";
    for (const id of ids) assert.ok(jump.includes(`(#${id})`), `${locale}: jump line links #${id}`);
    // Under each month H3: weather paragraph, daylight+pack paragraph, events paragraph.
    h3.forEach((heading, i) => {
      const at = blocks.indexOf(heading);
      const [weather, extras, events] = [blocks[at + 1], blocks[at + 2], blocks[at + 3]] as { type: string; text?: string }[];
      assert.equal(weather?.type, "paragraph");
      const { sunrise, sunset } = sunMonth(i);
      assert.ok(extras?.text?.includes(sunrise) && extras.text.includes(sunset) && extras.text.includes(daylightText(i)), `${locale} month ${i + 1}: IGN times`);
      assert.match(extras?.text ?? "", /\*\*[^*]+:\*\*.*\*\*[^*]+:\*\*/, `${locale} month ${i + 1}: daylight and pack labels`);
      assert.ok((events?.text ?? "").includes("](/"), `${locale} month ${i + 1}: events line links a guide`);
    });
  }
});

test("climate months: temperatures in the pack lines are the AEMET figures of that month", () => {
  const en = bodyToPlainText(blocksOf("en") as never);
  assert.match(en, /lows of 4\.7 °C at the airport/); // January
  assert.match(en, /Highs of 22\.1 °C/); // October wettest month line
  assert.equal(climateMonth(0).low, 4.7);
  assert.equal(climateMonth(9).high, 22.1);
});

test("climate months: holidays and dated events are read from the shared calendars", () => {
  assert.match(holidaySentence("en", 0), /1 January \(New Year's Day\) and 6 January \(Epiphany\)/);
  assert.match(holidaySentence("ca", 4), /1 de maig \(Festa del Treball\)/);
  assert.match(holidaySentence("en", 4), /Barcelona's local holiday: 17 May/);
  assert.match(holidaySentence("es", 8), /11 de septiembre/);
  assert.match(holidaySentence("es", 8), /24 de septiembre/);
  assert.equal(holidaySentence("en", 1), "", "February has no Catalonia-wide holiday in 2027");
  // Every Catalonia-wide 2027 holiday is printed in exactly the month it falls in.
  for (const h of CATALONIA_HOLIDAYS) {
    const month = Number(h.date.slice(5, 7)) - 1;
    assert.ok(holidaySentence("en", month).includes(h.name.en), h.date);
  }
  const en = bodyToPlainText(blocksOf("en") as never);
  assert.match(en, /Carnival 2027 runs from Dijous Gras \(Fat Thursday\), 4 February, to Ash Wednesday, 10 February/);
  assert.match(en, /clocks go forward on 28 March 2027/);
  assert.match(en, /clocks go back on 31 October 2027/);
  assert.match(en, /Gran Festa de la Calçotada in Valls is on 31 January 2027/);
});

test("climate months: no sea temperature is printed (no official monthly series), extra FAQs answer May, July, September and daylight", () => {
  for (const locale of LOCALES) {
    const blocks = blocksOf(locale);
    const airport = blocks.find((b) => b.type === "table")!;
    assert.ok(!airport.headers?.some((h) => /mar|sea|agua|aigua/i.test(h)), `${locale}: no sea column`);
    const faq = blocks.find((b) => b.type === "faq")!;
    assert.equal(faq.items?.length, 19, `${locale}: 15 FAQs and 4 new`);
    const last4 = faq.items!.slice(-4);
    assert.match(last4[0]!.answer, /(\d+ (hours|horas|hores) de sol|hours of sunshine|horas de sol|hores de sol)/);
    assert.match(last4[3]!.answer, /9 h 12 min/);
    assert.match(last4[3]!.answer, /15 h 09 min/);
  }
});

test("climate months: re-read the IGN table before the 2027 data runs out", () => {
  assert.equal(SUN_VERIFIED, "2026-11-25");
  const today = madridDate(new Date());
  assert.ok(
    today <= SUN_REREAD_BY,
    `IGN sunrise/sunset table is for 2027 and the page names 2027 holidays: re-read ${"https://cdn.mitma.gob.es/portal-web-drupal/salidapuestasol/<year>/Barcelona-<year>.txt"} for the next year, update SUN_15TH, SUN_YEAR and the holiday year in climate-months.ts`,
  );
});
