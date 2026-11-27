import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveDateWindows } from "../src/lib/content/date-window.ts";
import { daysBetween, todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import { SCHOOL_ANSWERS_READ, SCHOOL_ANSWERS_REREAD_BY, buildBody } from "../src/lib/content/school/publish.ts";
import { generalSchoolDays } from "../src/lib/content/school/snippet.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md): the answers under the lead of the
 * Catalan school calendar, in the order they are searched: Christmas, Easter,
 * "is there school today or tomorrow" (the day-dependent block), the
 * free-choice days, how many school days. Title, description, H1 and lead are
 * not touched. Facts read on Ordre EDF/66/2026 (DOGC 9653) and on the
 * Generalitat's calendar page the same day; quotes in school/publish.ts.
 */

type Box = { type: string; title?: string; text?: string; tone?: string; lead?: boolean; items?: { question: string; answer: string }[] };

const Y = SCHOOL_YEARS[0]!;

test("under the lead: Christmas, Easter, today and tomorrow, free-choice days, number of days, then the first section", () => {
  for (const locale of LOCALES) {
    const body = buildBody(locale) as Box[];
    assert.deepEqual(
      body.slice(0, 6).map((b) => b.type),
      ["paragraph", "callout", "callout", "schoolCalendar", "callout", "callout"],
      locale,
    );
    // 27 Nov 2026: the Christmas section sits in date windows right after the answers; read the page as it is today.
    assert.equal((resolveDateWindows(body as never) as Box[]).findIndex((b) => b.type === "heading"), 6, `${locale}: the first heading comes after the answers`);
    assert.equal(body[0]!.lead, true, `${locale}: the lead stays the first paragraph`);
  }
});

test("Christmas and Easter boxes: weekdays, last day of class, day back, the order and its read date", () => {
  // Built for the break not yet over: pinned to 2026-27 until the guard below fires.
  if (todayInCatalonia() >= SCHOOL_ANSWERS_REREAD_BY) return;
  const expected = {
    ca: {
      christmas: ["dimarts 22 de desembre de 2026", "dilluns 21 de desembre de 2026", "dijous 7 de gener de 2027", "divendres 8 de gener de 2027", "24 de novembre de 2026"],
      easter: ["dissabte 20 de març de 2027", "dilluns 29 de març de 2027", "divendres 19 de març de 2027", "dimarts 30 de març de 2027"],
    },
    es: {
      christmas: ["martes 22 de diciembre de 2026", "lunes 21 de diciembre de 2026", "jueves 7 de enero de 2027", "viernes 8 de enero de 2027", "24 de noviembre de 2026"],
      easter: ["sábado 20 de marzo de 2027", "lunes 29 de marzo de 2027", "viernes 19 de marzo de 2027", "martes 30 de marzo de 2027"],
    },
    en: {
      christmas: ["Tuesday 22 December 2026", "Monday 21 December 2026", "Thursday 7 January 2027", "Friday 8 January 2027", "24 November 2026"],
      easter: ["Saturday 20 March 2027", "Monday 29 March 2027", "Friday 19 March 2027", "Tuesday 30 March 2027"],
    },
  } as const;
  for (const locale of LOCALES) {
    const body = buildBody(locale) as Box[];
    const christmas = body[1]!;
    const easter = body[2]!;
    for (const part of expected[locale].christmas) assert.ok(christmas.text!.includes(part), `${locale} Christmas: ${part}`);
    for (const part of expected[locale].easter) assert.ok(easter.text!.includes(part), `${locale} Easter: ${part}`);
    assert.ok(christmas.text!.includes("](https://portaldogc.gencat.cat/utilsEADOP/PDF/9653/2147443.pdf)"), `${locale}: the order's DOGC PDF`);
    assert.match(christmas.title!, /2026-2027/, locale);
    assert.match(easter.title!, /2027/, locale);
    // The only link to the Easter 2027 page stays in the days-off section (tests/easter-2027.test.ts).
    assert.ok(!/easter-2027|semana-santa-2027|setmana-santa-2027/.test(easter.text!), `${locale}: no link in the Easter box`);
  }
  // The dates are the order's (art. 3.4 a): 22 Dec 2026 to 7 Jan 2027, 20 to 29 Mar 2027.
  assert.deepEqual([Y.christmas, Y.easter], [["2026-12-22", "2027-01-07"], ["2027-03-20", "2027-03-29"]]);
});

test("free-choice days box: what, who, how many, where to look; no school's own dates are typed", () => {
  const hub = { ca: "guies/dies-lliure-disposicio-escoles", es: "guias/dias-libre-disposicion-colegios", en: "guides/catalonia-school-free-days" } as const;
  const four = { ca: /\*\*quatre\*\*/, es: /\*\*cuatro\*\*/, en: /\*\*four\*\*/ } as const;
  const council = { ca: /consell escolar municipal/, es: /consejo escolar municipal/, en: /municipal school council/ } as const;
  const faqQuestion = /lliure disposició de la meva|libre disposición de mi colegio|my school's free-choice/;
  for (const locale of LOCALES) {
    const body = buildBody(locale) as Box[];
    const box = body[4]!;
    assert.equal(box.tone, "official", locale);
    assert.match(box.text!, four[locale], locale);
    assert.match(box.text!, council[locale], locale);
    const gencat = `https://web.gencat.cat/${locale}/ciutadania/educacio-formacio/calendari-escolar-catalunya`;
    assert.ok(box.text!.includes(`](${gencat})`), `${locale}: Generalitat's page`);
    assert.ok(box.text!.includes(`](/${locale}/${hub[locale]}/)`), `${locale}: free-days page`);
    assert.ok(!/\b\d{1,2} (de |d')?(febrer|febrero|February|maig|mayo|May|abril|April)/i.test(box.text!), `${locale}: no school date`);
    // The FAQ answers the same question, with the same two links.
    const faq = body.find((b) => b.type === "faq")!;
    const item = faq.items!.find((i) => faqQuestion.test(i.question));
    assert.ok(item, `${locale}: FAQ item`);
    assert.ok(item!.answer.includes(gencat), `${locale}: FAQ links the Generalitat's page`);
    assert.ok(item!.answer.includes(`](/${locale}/${hub[locale]}/)`), `${locale}: FAQ links the free-days page`);
  }
});

test("days and weeks box: the law's 175 to 178, our own counts flagged as ours, the same numbers as the FAQ", () => {
  const days = generalSchoolDays(Y)!;
  const weeks = Math.round((daysBetween(Y.start, Y.end) + 1) / 7);
  assert.equal(days, 183);
  for (const locale of LOCALES) {
    const body = buildBody(locale) as Box[];
    const box = body[5]!;
    assert.ok(box.text!.includes("175") && box.text!.includes("178"), locale);
    assert.ok(box.text!.includes(`**${days} `), `${locale}: ${days} days`);
    assert.ok(box.text!.includes(`**${weeks} `), `${locale}: ${weeks} weeks`);
    assert.ok(box.text!.includes(` ${days - 6}.`), `${locale}: ${days - 6}`);
    const faq = JSON.stringify(body.find((b) => b.type === "faq"));
    assert.ok(faq.includes(String(days)) && faq.includes(String(weeks)), `${locale}: the FAQ shows the same counts`);
  }
});

test("re-read the order's Easter and free-choice texts and the Generalitat's page, and move the Christmas box on: fails from SCHOOL_ANSWERS_REREAD_BY", () => {
  assert.ok(SCHOOL_ANSWERS_REREAD_BY > SCHOOL_ANSWERS_READ);
  assert.ok(daysBetween(SCHOOL_ANSWERS_READ, SCHOOL_ANSWERS_REREAD_BY) <= 60, "re-read at most 60 days after the last check");
  assert.ok(
    todayInCatalonia() < SCHOOL_ANSWERS_REREAD_BY,
    `SCHOOL_ANSWERS_READ is ${SCHOOL_ANSWERS_READ}: Christmas is over. Re-read Ordre EDF/66/2026 arts. 3.4 a, c, e (Easter, free-choice days) and web.gencat.cat/ca/ciutadania/educacio-formacio/calendari-escolar-catalunya, move SCHOOL_ANSWERS_READ and SCHOOL_ANSWERS_REREAD_BY (before the Easter peak, mid-February to mid-March), deploy and publish \`school-calendar\` so the Christmas box shows 2027-2028`,
  );
});
