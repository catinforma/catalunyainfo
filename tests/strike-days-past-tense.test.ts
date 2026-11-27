import assert from "node:assert/strict";
import { test } from "node:test";

import type { Block } from "../src/lib/content/blocks.ts";
import type { B2Article } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N, strikePhase } from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKE_19N_GUIDE, STRIKE_20N_GUIDE, buildStrikeDayBody, strikeDayPhase } from "../src/lib/content/batch02/strike-days-1920n.ts";
import { STRIKE_23N_GUIDE, STRIKE_26N_GUIDE, buildStrikeDay2326Body, strikeDay2326Phase } from "../src/lib/content/batch02/strike-days-2326n.ts";
import { STRIKE_EDUCATION_GUIDE } from "../src/lib/content/batch02/strike-guides.ts";
import { RAIL_17N_GUIDE, rail17nPhase } from "../src/lib/content/batch02/strike-rail-17n.ts";
import { STRIKES_AS_OF } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_AS_OF } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { STRIKE_11N_AS_OF } from "../src/lib/content/batch02/strike-11n.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * 27 Nov 2026: a past strike day speaks in the past tense in every section, not only in the lead and the FAQ (which already did:
 * PAST_FAQ, pastFaq11n, pastFaq, pastEducationFaq). Before this, the 26th's page still asked "¿Hay clase el jueves 26 en Cataluña?"
 * above a table headed "Qué funciona el jueves 26", the 20th's "¿Hay clase el viernes 20?", the 11th's "¿Hay colegio el 11 de
 * noviembre?" and "mira los avisos de tu línea hoy". The check: no present-tense question about that day ("¿Hay…?", "Hi ha…?",
 * "Is there…?" naming the day, or any question with today / tomorrow) and no "hoy / avui / today" sentence, outside link labels
 * (other pages' titles, which are not this page's copy and sit in their own measurement windows).
 */

const PAGES: { name: string; article: B2Article; day: string; past: boolean }[] = [
  { name: "11N", article: STRIKE_11N, day: "11", past: strikePhase(STRIKE_11N_AS_OF) === "past" },
  { name: "17N", article: RAIL_17N_GUIDE, day: "17", past: rail17nPhase(STRIKES_AS_OF) === "after" },
  { name: "19N", article: STRIKE_19N_GUIDE, day: "19", past: strikeDayPhase("strike19n", STRIKES_SPAIN_AS_OF) === "after" },
  { name: "20N", article: STRIKE_20N_GUIDE, day: "20", past: strikeDayPhase("strike20n", STRIKES_SPAIN_AS_OF) === "after" },
  { name: "23N", article: STRIKE_23N_GUIDE, day: "23", past: strikeDay2326Phase("strike23n", STRIKES_SPAIN_AS_OF) === "after" },
  { name: "26N", article: STRIKE_26N_GUIDE, day: "26", past: strikeDay2326Phase("strike26n", STRIKES_SPAIN_AS_OF) === "after" },
  { name: "education guide", article: STRIKE_EDUCATION_GUIDE, day: "26", past: STRIKES_AS_OF > "2026-11-26" },
];

/** Every string a block carries, with markdown link labels and bold markers removed (labels are other pages' titles). */
function sentences(blocks: Block[]): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") {
      const clean = value.replace(/\[[^\]]*\]\([^)]*\)/g, "").replace(/\*\*/g, "");
      out.push(...clean.split(/(?<=[.?!:;])\s+/));
    } else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") for (const [key, v] of Object.entries(value)) if (key !== "href" && key !== "id" && key !== "url") walk(v);
  };
  walk(blocks);
  return out.map((s) => s.trim()).filter(Boolean);
}

const PRESENT_QUESTION: Record<Locale, RegExp> = {
  es: /¿\s*(Hay|Funciona|Funcionan|Abren|Afecta|Es|Tengo clase)\b[^?]*\?/i,
  ca: /(^|[\s«])(Hi ha|Funciona|Funcionen|Obren|Afecta|És)\b[^?]*\?/i,
  en: /\b(Is there|Are there|Is it|Does|Do|Will)\b[^?]*\?/i,
};
// Letter-aware boundaries: "\b" does not see "à" or "ñ" as letters.
const NOW_WORD: Record<Locale, RegExp> = { es: /(?<!\p{L})(hoy|mañana)(?!\p{L})/iu, ca: /(?<!\p{L})(avui|demà)(?!\p{L})/iu, en: /(?<!\p{L})(today|tomorrow)(?!\p{L})/iu };

test("past strike day pages: the premise holds (every one is past on the as-of day)", () => {
  for (const page of PAGES) assert.ok(page.past, `${page.name} is not past on the as-of day: this test has nothing to check`);
});

/** The sentences that speak about the day in the present: a present-tense question naming it, or today / tomorrow. */
function violations(blocks: Block[], locale: Locale, day: string): string[] {
  const dayRe = new RegExp(`\\b${day}\\b`);
  return sentences(blocks).filter((s) => {
    const question = s.match(PRESENT_QUESTION[locale]);
    // "¿Hay huelga de Renfe ahora?" (17N) is about now, not about that day: only questions naming the day or today/tomorrow count.
    if (question && (dayRe.test(question[0]) || NOW_WORD[locale].test(question[0]))) return true;
    // "mañana y tarde" (a union's quoted "tant al matí com a la tarda") and "la misma mañana" are a time of day, not "tomorrow".
    return NOW_WORD[locale].test(s.replace(/(la misma |la |de la |por la |cada )mañana|mañana y tarde/gi, ""));
  });
}

test("past strike day pages: no present-tense question about that day and no today/tomorrow, in ca, es and en", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) assert.deepEqual(violations(page.article.editions[locale]!.blocks, locale, page.day), [], `${page.name}/${locale}`);
  }
});

test("the check has teeth: the same pages built before or on their day are flagged", () => {
  for (const locale of LOCALES) {
    assert.ok(violations(buildStrikeDay2326Body("strike26n", locale, "2026-11-25"), locale, "26").length > 0, `26N/${locale} before`);
    assert.ok(violations(buildStrikeDay2326Body("strike26n", locale, "2026-11-26"), locale, "26").length > 0, `26N/${locale} on the day`);
    assert.ok(violations(buildStrikeDayBody("strike20n", locale, "2026-11-19"), locale, "20").length > 0, `20N/${locale} eve`);
  }
});

test("the day's own section reads in the past once the day is over, and in the present before it (19N/20N/23N/26N)", () => {
  const heading = (blocks: Block[], id: string) => (blocks.find((b) => b.type === "heading" && (b as { id?: string }).id === id) as { text?: string } | undefined)?.text;
  assert.equal(heading(buildStrikeDay2326Body("strike26n", "es", "2026-11-27"), "hay-clase"), "¿Hubo clase el jueves 26 en Cataluña?");
  assert.equal(heading(buildStrikeDay2326Body("strike26n", "ca", "2026-11-27"), "hi-ha-classe"), "Hi va haver classe el dijous 26 a Catalunya?");
  assert.equal(heading(buildStrikeDay2326Body("strike26n", "en", "2026-11-27"), "is-there-school"), "Was there school in Catalonia on Thursday 26?");
  assert.equal(heading(buildStrikeDay2326Body("strike26n", "es", "2026-11-25"), "hay-clase"), "¿Hay clase el jueves 26 en Cataluña?");
  assert.equal(heading(buildStrikeDayBody("strike20n", "es", "2026-11-21"), "hay-clase"), "¿Hubo clase el viernes 20?");
  assert.equal(heading(buildStrikeDayBody("strike20n", "es", "2026-11-19"), "hay-clase"), "¿Hay clase el viernes 20?");
  // What the minimum-services order fixed, in the past tense, on the 26th's page (the Generalitat's order of 23 Nov).
  const text26 = JSON.stringify(buildStrikeDay2326Body("strike26n", "ca", "2026-11-27"));
  assert.match(text26, /els va fixar el Departament d'Empresa i Treball per una ordre del 23 de novembre/);
  assert.match(text26, /Què va funcionar el dijous 26 de novembre de 2026 a Catalunya/);
  assert.doesNotMatch(text26, /pregunta al teu què garanteix/);
  // The same anchors before and after (inbound links keep working).
  for (const locale of LOCALES) {
    const ids = (blocks: Block[]) => blocks.filter((b) => b.type === "heading").map((b) => (b as { id?: string }).id ?? "");
    assert.deepEqual(ids(buildStrikeDay2326Body("strike26n", locale, "2026-11-27")).filter(Boolean), ids(buildStrikeDay2326Body("strike26n", locale, "2026-11-25")).filter(Boolean), locale);
  }
});

test("no participation figure is printed on a past day page (none was published by an official source in these pages' sources)", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const all = sentences(page.article.editions[locale]!.blocks).join(" ");
      assert.doesNotMatch(all, /seguimiento|seguiment|turnout|participaci[oó]n del|participació del|took part|secundaron|van secundar/i, `${page.name}/${locale}`);
    }
  }
});
