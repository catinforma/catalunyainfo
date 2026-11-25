import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { SPAIN_OPEN_STRIKES } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { buildStrikesSpainBody, openStrikesOn, spainDayAnswers } from "../src/lib/content/batch02/strikes-spain.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 25 Nov 2026: "el 25 de noviembre hay huelga" (323 impressions at 9.3),
 * "huelga miercoles 25 noviembre" (180), "huelga 24 noviembre 2026" (175).
 * The day-by-day answers sit right under the week line (before the status
 * key and the week table) and now also name the open-ended airport strikes
 * that are on each day, from the data (`inForceFrom`, `weekdays`, `startsAt`).
 */

const SERVEO = "huelga-serveo-barajas-limpieza";

test("open airport strikes: Serveo starts at 23:00 on 25 Nov, so it is on from the 25th; Outsmart skips Tuesdays and Wednesdays", () => {
  const ids = (day: string) => openStrikesOn(day).map((s) => s.id);
  assert.ok(!ids("2026-11-24").includes(SERVEO));
  assert.ok(ids("2026-11-25").includes(SERVEO));
  assert.ok(ids("2026-11-26").includes(SERVEO));
  // 25 Nov 2026 is a Wednesday: Outsmart (Mon, Thu-Sun) is not on; the 26th (Thursday) it is.
  assert.ok(!ids("2026-11-25").includes("huelga-outsmart-barajas"));
  assert.ok(ids("2026-11-26").includes("huelga-outsmart-barajas"));
  assert.ok(ids("2026-11-27").includes("huelga-outsmart-barajas"));
  // The cited resolutions end on 30 Nov, except Serveo's (31 Jan 2027).
  assert.deepEqual(ids("2026-12-01"), [SERVEO]);
  for (const s of SPAIN_OPEN_STRIKES) assert.match(s.inForceFrom, /^\d{4}-\d{2}-\d{2}$/, s.id);
});

test("day-by-day answers at 25, 26 and 27 Nov: today is first, airports named, Serveo's 23:00 start said on the 25th only", () => {
  for (const locale of LOCALES) {
    for (const asOf of ["2026-11-25", "2026-11-26", "2026-11-27"]) {
      const answers = spainDayAnswers(locale, asOf);
      assert.equal(answers[0]!.day, asOf, `${locale}/${asOf}: the first answer is the as-of day`);
      assert.equal(answers.length, 4);
      for (const answer of answers) {
        assert.match(answer.text, /SAERCO/, `${locale}/${answer.day}`);
        assert.match(answer.text, /Serveo/, `${locale}/${answer.day}`);
      }
      const start = (text: string) => /(empieza a las|comença a les|starts at) 23[.:]00/.test(text);
      for (const answer of answers) assert.equal(start(answer.text), answer.day === "2026-11-25", `${locale}/${answer.day}: 23:00 start only on the 25th`);
    }
    // The 25th is a Wednesday: Outsmart is not named, doctors and Correos are.
    const wed = spainDayAnswers(locale, "2026-11-25")[0]!;
    assert.doesNotMatch(wed.text, /Outsmart/, locale);
    assert.match(wed.text, /Correo?s|Correus/, locale);
    assert.match(wed.text, /Sindicato Médicos Unidos/, locale);
    // From the 26th (Thursday) Outsmart is on.
    assert.match(spainDayAnswers(locale, "2026-11-26")[0]!.text, /Outsmart/, locale);
  }
});

test("the first screen: the day-by-day section comes straight after the lead, the week line and the rail link, before the status key and the week table", () => {
  for (const locale of LOCALES) {
    const blocks = buildStrikesSpainBody(locale, "2026-11-25") as (Block & { id?: string })[];
    const dayId = locale === "en" ? "day-by-day" : "dia-a-dia";
    const at = blocks.findIndex((b) => b.type === "heading" && b.id === dayId);
    const key = blocks.findIndex((b) => b.type === "callout");
    const week = blocks.findIndex((b) => b.type === "table");
    assert.ok(at > 0 && at < 8, `${locale}: the heading is among the first blocks (${at})`);
    assert.ok(at < key && key < week, `${locale}: day-by-day, then the status key, then the table`);
    // The list under it opens with the as-of day.
    const list = blocks[at + 2] as unknown as { type: string };
    assert.equal(list.type, "list");
    const text = bodyToPlainText(blocks.slice(at, at + 3));
    assert.match(text, /25/);
  }
});
