import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { metroDay } from "../src/lib/content/metro/tonight.ts";
import { PARADE_DAY, REIS, TRANSPORT_2026, paradeMetroStanding } from "../src/lib/content/batch02/reis.ts";

/**
 * 27 Nov 2026: the Reis page answers "metro on the parade night" for 2027 from
 * TMB's standing timetable (tmb.cat hours page, re-read 27 Nov 2026:
 * "Divendres i vigílies de festius intersetmanals De 5.00 a 2.00 hores"),
 * labelled as the general timetable, while TMB's own 2027 parade note is still
 * pending (it came out on the day itself, 5 Jan, in 2026).
 */

const LOCALES = ["ca", "es", "en"] as const;
const body = (locale: (typeof LOCALES)[number]) => bodyToPlainText(REIS.editions[locale].blocks);

test("5 January 2027 is a Tuesday, the eve of a weekday holiday: the standing rule gives 2:00", () => {
  assert.equal(PARADE_DAY, "2027-01-05");
  assert.equal(metroDay(PARADE_DAY).close, "two");
  assert.equal(metroDay(PARADE_DAY).opensAtFive, true);
});

test("the standing-timetable line is labelled as TMB's general timetable, carries 2:00 and no year", () => {
  const label = { ca: "horari general de TMB", es: "horario general de TMB", en: "TMB's standing timetable" } as const;
  for (const locale of LOCALES) {
    const line = paradeMetroStanding(locale);
    assert.ok(line.includes(label[locale]), `${locale}: labelled`);
    assert.ok(line.includes("2:00"), `${locale}: 2:00`);
    assert.doesNotMatch(line, /2027/, `${locale}: not dressed as a 2027 announcement`);
    // In the 5-6 January paragraph and in the FAQ answer.
    const b = body(locale);
    assert.ok(b.split(line).length - 1 >= 2, `${locale}: paragraph and FAQ`);
    // 2026's note stays dated next to it.
    assert.ok(b.includes(TRANSPORT_2026.metroUntil), locale);
  }
});

test("the Reis page cites TMB's standing hours page", () => {
  const urls = REIS.sources.map((s) => s.url);
  assert.ok(urls.includes("https://www.tmb.cat/ca/transport-barcelona/horari-metro-bus"));
});

test("re-read: TMB's own 2027 parade-night note is due on 5 Jan 2027 (it came out that day in 2026)", () => {
  assert.equal(TRANSPORT_2026.published, "2026-01-05");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  if (today >= "2027-01-06") {
    assert.fail(
      "From 6 Jan 2027: read TMB's parade-night note of 5 Jan 2027 (noticies.tmb.cat) and replace TRANSPORT_2026 in reis.ts with its 2027 facts, or the 2026 ones keep showing as last year's.",
    );
  }
});
