import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, slugifyAnchor, type Block } from "../src/lib/content/blocks.ts";
import { COPY } from "../src/lib/content/holidays/copy.ts";
import { ARAN_REPLACEMENT, CATALONIA_HOLIDAYS, LAST_VERIFIED } from "../src/lib/content/holidays/payload.ts";
import { LOCAL_ORDER_CHECKED, buildBody, formatDay, weekdayOf } from "../src/lib/content/holidays/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";

/**
 * 27 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Work calendar 2027: one owner for the
 * query family"): the guide is the page Google picks for "calendario laboral
 * 2027 cataluña" and its family. Body only: the FAQ answers "which are the 2027
 * holidays", "which are Catalonia's own" and "where is the PDF" in the
 * searchers' words; the documents box under the table adds the .ics download
 * and the town finder; the embed page links the guide in the query's words.
 */

type Faq = Extract<Block, { type: "faq" }>;
const faqOf = (body: Block[]) => body.find((b) => b.type === "faq") as Faq;
const src = (path: string) => readFileSync(join(import.meta.dirname, "..", path), "utf8");

const LOCAL_FINDER = {
  ca: "/ca/guies/festius-locals-catalunya/",
  es: "/es/guias/festivos-locales-cataluna/",
  en: "/en/guides/local-holidays-catalonia/",
} as const;

test("FAQ: the first answer lists the twelve days with their weekdays, Aran's swap and the local days", () => {
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const body = buildBody(locale);
    assert.ok(bodySchema.safeParse(body).success, locale);
    const first = faqOf(body).items[0]!;
    assert.match(first.question, locale === "en" ? /^What are the public holidays in Catalonia in 2027\?$/ : locale === "es" ? /^¿Cuáles son los festivos de 2027 en Cataluña\?$/ : /^Quins són els festius del 2027 a Catalunya\?$/);
    for (const h of CATALONIA_HOLIDAYS) {
      assert.ok(first.answer.toLowerCase().includes(`${weekdayOf(h.date, copy)} ${formatDay(h.date, copy, locale)}`.toLowerCase()), `${locale}: ${h.date}`);
    }
    assert.ok(first.answer.includes(formatDay(ARAN_REPLACEMENT.date, copy, locale)), `${locale}: Aran`);
    assert.ok(first.answer.includes(LOCAL_FINDER[locale]), `${locale}: town finder`);
    assert.ok(first.answer.includes("17") && first.answer.includes("24"), `${locale}: Barcelona's days`);
    assert.ok(!/\(\s*[^)]*\([^)]*\)\s*\)/.test(first.answer), `${locale}: no nested brackets`);
  }
});

test("FAQ: Catalonia's own three days and the PDF question, with the order's and the BOE's PDFs and the .ics", () => {
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const body = buildBody(locale);
    const items = faqOf(body).items;
    const own = items[1]!;
    assert.match(own.answer, /^(Tres|Three): /, locale);
    for (const iso of ["2027-03-29", "2027-06-24", "2027-09-11"]) assert.ok(own.answer.includes(formatDay(iso, copy, locale)), `${locale}: ${iso}`);
    const pdf = items[2]!;
    assert.match(pdf.question, /PDF/, locale);
    assert.ok(pdf.answer.includes("documentId=1040896&type=01&language=ca_ES") && pdf.answer.includes("documentId=1040896&type=01&language=es_ES"), locale);
    assert.ok(pdf.answer.includes("BOE-A-2026-21254.pdf"), locale);
    const ics = `/${locale}/${copy.path}/#${slugifyAnchor(copy.calendarTitle)}`;
    assert.ok(pdf.answer.includes(ics), `${locale}: .ics anchor`);
    // The anchor points at a heading that exists, followed by the calendar (download) block.
    const at = body.findIndex((b) => b.type === "heading" && b.text === copy.calendarTitle);
    assert.ok(at > 0 && body[at + 1]?.type === "calendar", `${locale}: calendar section`);
    for (const item of items) assert.ok(!/\{[a-z0-9]+\}/i.test(item.answer), `${locale}: placeholder left in ${item.question}`);
    // No question twice.
    assert.equal(new Set(items.map((i) => i.question)).size, items.length, locale);
  }
});

test("documents box (fourth block) adds the .ics download and the town finder", () => {
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const box = buildBody(locale)[3] as Extract<Block, { type: "callout" }>;
    assert.equal(box.tone, "official", locale);
    assert.ok(box.text.includes(`/${locale}/${copy.path}/#${slugifyAnchor(copy.calendarTitle)}`), `${locale}: .ics`);
    assert.ok(box.text.includes(LOCAL_FINDER[locale]), `${locale}: finder`);
  }
});

test("re-read dates: the order, BOE, Generalitat and Barcelona on 27 Nov; the key fact prints the same day", () => {
  assert.equal(LAST_VERIFIED, "2026-11-27");
  assert.ok(LOCAL_ORDER_CHECKED >= "2026-11-27");
  const printed = { ca: "27 de novembre de 2026", es: "27 de noviembre de 2026", en: "27 November 2026" } as const;
  for (const locale of LOCALES) {
    assert.equal(COPY[locale].keyFacts.at(-1)!.value, printed[locale], locale);
    assert.ok(COPY[locale].calendarNote.includes(printed[locale]), locale);
  }
});

test("embed page ('calendario laboral 2027 en tu web') links the guide in the query's words", () => {
  const page = src("src/components/programmatic/embed-2027/WidgetPage.tsx");
  assert.ok(page.includes("<Link href={GUIDES.workCalendar[locale]}>{WORK_CALENDAR_ANCHOR[locale]}</Link>"));
  assert.match(page, /es: "Calendario laboral 2027 de Cataluña: los 12 festivos y los puentes"/);
  assert.match(page, /ca: "Calendari laboral 2027 de Catalunya: els 12 festius i els ponts"/);
  assert.equal(GUIDES.workCalendar.es, "/es/guias/calendario-laboral-cataluna/");
});
