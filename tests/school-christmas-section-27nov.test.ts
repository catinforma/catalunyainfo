import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveDateWindows } from "../src/lib/content/date-window.ts";
import { daysBetween, todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import {
  CHRISTMAS_SECTION_READ,
  SCHOOL_ANSWERS_REREAD_BY,
  buildBody,
  christmasWindows,
} from "../src/lib/content/school/publish.ts";
import { buildHubBody } from "../src/lib/content/school-spain/body.ts";
import { CATALONIA, hubRegions } from "../src/lib/content/school-spain/regions.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 27 Nov 2026 (docs/SEO_EXPERIMENTS.md, batch 8P): the Catalan school calendar
 * gets a Christmas section, the first H2 from 1 November until the day back
 * (two date windows: future tense before 22 Dec, present/past during the
 * break), and four Christmas FAQs in the searchers' words. Title, description,
 * H1 and lead untouched. Facts read on Ordre EDF/66/2026 the same day (quotes
 * in school/publish.ts above CHRISTMAS_SECTION_READ).
 */

type B = { type: string; text?: string; id?: string; rows?: string[][]; items?: { question: string; answer: string }[] };

const Y = SCHOOL_YEARS[0]!;
const at = (iso: string) => new Date(`${iso}T12:00:00+01:00`);
const pinned = () => todayInCatalonia() < SCHOOL_ANSWERS_REREAD_BY;

const WORDS = {
  ca: { last: "dilluns 21 de desembre de 2026", back: "divendres 8 de gener de 2027", id: "vacances-nadal", before: "L'últim dia de classe abans de Nadal és", during: "va ser el", eoi: "escoles oficials d'idiomes", bressol: "escoles bressol municipals" },
  es: { last: "lunes 21 de diciembre de 2026", back: "viernes 8 de enero de 2027", id: "vacaciones-navidad", before: "El último día de clase antes de Navidad es", during: "fue el", eoi: "escuelas oficiales de idiomas", bressol: "escoles bressol municipales" },
  en: { last: "Monday 21 December 2026", back: "Friday 8 January 2027", id: "christmas-holidays", before: "The last day of school before Christmas is", during: "was Monday", eoi: "official language schools", bressol: "Municipal nurseries" },
} as const;

const LINKS = {
  ca: ["/ca/guies/nadal-a-barcelona/", "/ca/guies/calendari-escolar-espanya/", "/ca/guies/dies-lliure-disposicio-escoles/"],
  es: ["/es/guias/navidad-en-barcelona/", "/es/guias/calendario-escolar-espana/", "/es/guias/dias-libre-disposicion-colegios/"],
  en: ["/en/guides/christmas-in-barcelona/", "/en/guides/spain-school-calendar/", "/en/guides/catalonia-school-free-days/"],
} as const;

test("windows: from 1 November to the day before the break, then to the first day back", () => {
  const w = christmasWindows(Y);
  assert.deepEqual(w, {
    before: { from: "2026-11-01T00:00:00+01:00", until: "2026-12-22T00:00:00+01:00" },
    during: { from: "2026-12-22T00:00:00+01:00", until: "2027-01-08T00:00:00+01:00" },
  });
});

test("before the break: the section is the first H2, with the last day, the day back, the table and the links", () => {
  if (!pinned()) return;
  for (const locale of LOCALES) {
    const body = resolveDateWindows(buildBody(locale) as never, at("2026-12-01")) as B[];
    const h = body.findIndex((b) => b.type === "heading");
    assert.equal(h, 6, locale);
    assert.equal(body[h]!.id, WORDS[locale].id, locale);
    const section = body.slice(h, body.findIndex((b, i) => i > h && b.type === "heading"));
    const text = JSON.stringify(section);
    const opening = section[1]!.text!;
    assert.ok(opening.startsWith(`**${WORDS[locale].before} el ${WORDS[locale].last}`) || opening.startsWith(`**${WORDS[locale].before} ${WORDS[locale].last}`), `${locale}: ${opening}`);
    assert.ok(opening.includes(WORDS[locale].back), `${locale}: day back`);
    const table = section.find((b) => b.type === "table")!;
    assert.equal(table.rows!.length, 8, `${locale}: last day, first day, 25 and 26 Dec, 1 and 6 Jan, last day off, day back`);
    assert.equal(table.rows![0]![0], WORDS[locale].last);
    assert.equal(table.rows!.at(-1)![0], WORDS[locale].back);
    assert.ok(text.includes(WORDS[locale].eoi) && text.includes(WORDS[locale].bressol), `${locale}: stages and nurseries`);
    assert.ok(text.includes("](https://portaldogc.gencat.cat/utilsEADOP/PDF/9653/2147443.pdf)"), `${locale}: the order`);
    for (const link of LINKS[locale]) assert.ok(text.includes(`](${link})`), `${locale}: ${link}`);
    assert.ok(!/undefined|NaN/.test(text), locale);
  }
});

test("during the break the tense moves on; from the day back the section is gone", () => {
  if (!pinned()) return;
  for (const locale of LOCALES) {
    const during = resolveDateWindows(buildBody(locale) as never, at("2026-12-28")) as B[];
    assert.equal(during[6]!.id, WORDS[locale].id, locale);
    assert.ok(during[7]!.text!.includes(WORDS[locale].during), `${locale}: past tense for the last day`);
    assert.ok(!during[7]!.text!.includes(WORDS[locale].before), locale);
    const after = resolveDateWindows(buildBody(locale) as never, at("2027-01-08")) as B[];
    assert.ok(!after.some((b) => b.id === WORDS[locale].id), `${locale}: no Christmas section after the day back`);
    assert.equal(after[6]!.type, "heading", locale);
  }
});

test("FAQ: last day, back after Reis, other stages, free days at Christmas (outside the windows, so FAQPage keeps them)", () => {
  if (!pinned()) return;
  const q = {
    ca: ["Quin és l'últim dia de classe abans de Nadal?", "Quan es torna a l'escola després de Reis 2027?", "L'FP, el batxillerat i les escoles d'idiomes", "dia de lliure disposició per Nadal"],
    es: ["¿Cuál es el último día de clase antes de Navidad en Cataluña?", "¿Cuándo se vuelve al cole después de Reyes 2027 en Cataluña?", "¿La FP, el bachillerato y las escuelas de idiomas", "día de libre disposición en Navidad"],
    en: ["What is the last day of school before Christmas in Catalonia?", "When do schools go back after Three Kings' Day 2027?", "Do vocational training, batxillerat and language schools", "free-choice day in the Christmas holidays"],
  } as const;
  for (const locale of LOCALES) {
    const faq = (buildBody(locale) as B[]).find((b) => b.type === "faq")!;
    const [lastQ, backQ, stagesQ, freeQ] = q[locale].map((part) => faq.items!.find((i) => i.question.includes(part)));
    assert.ok(lastQ && backQ && stagesQ && freeQ, locale);
    assert.ok(lastQ!.answer.includes(WORDS[locale].last), `${locale}: last day`);
    assert.ok(backQ!.answer.includes(WORDS[locale].back), `${locale}: day back`);
    assert.ok(stagesQ!.answer.includes(WORDS[locale].bressol.split(" ")[0]!) || stagesQ!.answer.includes("escoles bressol"), `${locale}: nurseries`);
    assert.equal(faq.items![0]!.question.includes("2026"), true, `${locale}: the start question stays first`);
  }
});

test("Spain hub: every region's Christmas comes from its own record and official text; Catalonia reuses the order's dates", () => {
  assert.deepEqual([CATALONIA.christmas.from, CATALONIA.christmas.to], Y.christmas);
  for (const r of hubRegions("es")) {
    assert.match(r.christmas.from, /^2026-12-\d\d$/, r.short);
    assert.match(r.christmas.to, /^2027-01-\d\d$/, r.short);
    assert.match(r.order.url, /^https:\/\//, `${r.short}: official text`);
  }
  const faq = (buildHubBody("es") as B[]).find((b) => b.type === "faq")!;
  assert.ok(faq.items!.some((i) => i.question === "¿Cuándo se vuelve al cole después de Navidad y Reyes 2027?"));
  const ca = (buildHubBody("ca") as B[]).find((b) => b.type === "faq")!;
  assert.ok(ca.items!.some((i) => i.question === "Quan es torna a l'escola després de Nadal i Reis 2027?"));
});

test("re-read the order's Christmas articles before the next Christmas section: CHRISTMAS_SECTION_READ within 60 days of the guard", () => {
  assert.ok(daysBetween(CHRISTMAS_SECTION_READ, SCHOOL_ANSWERS_REREAD_BY) <= 60);
  assert.ok(
    todayInCatalonia() < SCHOOL_ANSWERS_REREAD_BY,
    `CHRISTMAS_SECTION_READ is ${CHRISTMAS_SECTION_READ}: Christmas ${Y.label} is over. Re-read Ordre EDF/66/2026 (the 12 Christmas lines, arts. 3.7 c and 4.6 c) before the next section opens on 1 November, move CHRISTMAS_SECTION_READ, and publish \`school-calendar\``,
  );
});
