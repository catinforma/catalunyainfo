import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { STRIKES, strikeDayAnswers } from "../src/lib/content/batch02/strikes.ts";
import { SPAIN_STRIKES } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { buildStrikesSpainBody, spainDayAnswers, weekRows } from "../src/lib/content/batch02/strikes-spain.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 26 Nov 2026: the SMU doctors' strike runs "hasta las 08:00 horas del sábado
 * 28 de noviembre de 2026" (SMU notice PDF, re-read 26 Nov), but both hubs
 * stopped listing it on the 27th. The 28th is now one of its days, with a
 * day note that says "until 08:00"; the 29th has nothing of it.
 */

const UNTIL: Record<string, RegExp> = { ca: /fins a les 8\.00 h/, es: /hasta las 8\.00 h/, en: /until 08:00/ };

test("Spain calendar: Saturday 28 Nov lists the SMU doctors' strike until 08:00, Sunday 29 does not", () => {
  const smu = SPAIN_STRIKES.find((s) => s.id === "huelga-medicos-smu-2026-11-16")!;
  assert.equal(smu.dates.at(-1), "2026-11-28");
  for (const locale of LOCALES) {
    const answers = spainDayAnswers(locale, "2026-11-26");
    const sat = answers.find((a) => a.day === "2026-11-28")!;
    const sun = answers.find((a) => a.day === "2026-11-29")!;
    assert.ok(sat.strikes.some((s) => s.id === smu.id), `${locale}: 28th`);
    assert.match(sat.text, /Sindicato Médicos Unidos/, locale);
    assert.match(sat.text, UNTIL[locale]!, locale);
    assert.ok(!sun.strikes.some((s) => s.id === smu.id), `${locale}: 29th`);
    // The 27th is a full day: no "until 08:00" there.
    const fri = answers.find((a) => a.day === "2026-11-27")!;
    assert.ok(fri.strikes.some((s) => s.id === smu.id));
    assert.doesNotMatch(fri.text, UNTIL[locale]!, locale);
    // The week table's Saturday row says it too, and so does the page.
    const rows = weekRows(locale, "2026-11-26").filter((r) => UNTIL[locale]!.test(r[1] ?? ""));
    assert.equal(rows.length, 1, locale);
    assert.match(bodyToPlainText(buildStrikesSpainBody(locale, "2026-11-26")), UNTIL[locale]!, locale);
  }
});

test("Catalan hub: the 28th lists the SMU strike (ICS and SISCAT) until 08:00, in step with the Spain calendar", () => {
  const smu = STRIKES.find((s) => s.id === "vaga-metges-smu-2026-11-16")!;
  assert.equal(smu.dates.at(-1), "2026-11-28");
  for (const locale of LOCALES) {
    const answers = strikeDayAnswers(locale, "2026-11-26");
    const sat = answers.find((a) => a.day === "2026-11-28")!;
    assert.ok(sat.strikes.some((s) => s.id === smu.id), `${locale}: 28th`);
    assert.match(sat.text, UNTIL[locale]!, locale);
    const sun = answers.find((a) => a.day === "2026-11-29")!;
    assert.ok(!sun.strikes.some((s) => s.id === smu.id), `${locale}: 29th`);
  }
});
