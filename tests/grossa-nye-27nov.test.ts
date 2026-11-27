import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import {
  COMPARISON,
  DRAW_TIME_2026,
  GROSSA,
  GROSSA_DRAW_DATE,
  GROSSA_DRAW_DAY_CHECKED,
  GROSSA_DRAW_DAY_RECHECK_BY,
  GROSSA_DRAW_DAY_WINDOW,
  PRIZES,
  RESULTS_2026,
  TICKET_PRICE,
  buildGrossaBody,
  levy,
  perEuro,
  type GrossaResults,
} from "../src/lib/content/batch02/grossa.ts";
import { BARCELONA_LOCAL_2026, NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { resolveDateWindows } from "../src/lib/content/date-window.ts";
import { REVALIDATE_NIGHTLY_PATTERN } from "../src/lib/content/day-dependent.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { DRAWS, PRESETS } from "../src/lib/programmatic/lottery-tax/rules.ts";

/**
 * 27 Nov 2026 (ci-edicio, batch 8N): La Grossa de Cap d'Any's draw-day
 * section (the generic `dateWindow` block, read only on 31 Dec, Madrid time),
 * the La Grossa vs Christmas lottery table, the per-euro table and two FAQ
 * items; the New Year's Eve guide's "what day / is 31 December a holiday"
 * FAQ item.
 */

const blocks = (locale: Locale) => GROSSA.editions[locale].blocks;
const at = (iso: string) => new Date(iso);
const ids = (body: Block[]) => body.filter((b) => b.type === "heading").map((b) => (b as { id?: string }).id);
const faqItems = (body: Block[]) => (body.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
const today = () => new Date().toISOString().slice(0, 10);

const FAKE: GrossaResults = {
  first: "99999",
  second: "00417",
  third: "51230",
  fourth: ["08802", "63145"],
  fifth: ["00000", "47716", "25058"],
  firstSoldIn: null,
  source: { name: "prova", url: "https://www.loteriesdecatalunya.cat/resultats/grossa/?prova=1", publisher: "Loteries de Catalunya" },
};

test("the draw-day section opens at 00:00 on 31 Dec and closes at 00:00 on 1 Jan, Madrid time", () => {
  assert.equal(GROSSA_DRAW_DAY_WINDOW.from, `${GROSSA_DRAW_DATE}T00:00:00+01:00`);
  assert.equal(GROSSA_DRAW_DAY_WINDOW.until, "2027-01-01T00:00:00+01:00");
  for (const locale of LOCALES) {
    const before = resolveDateWindows(blocks(locale), at("2026-12-30T23:59:59+01:00"));
    const morning = resolveDateWindows(blocks(locale), at("2026-12-31T00:00:00+01:00"));
    const evening = resolveDateWindows(blocks(locale), at("2026-12-31T23:59:00+01:00"));
    const after = resolveDateWindows(blocks(locale), at("2027-01-01T00:00:00+01:00"));
    assert.ok(!ids(before).includes("avui"), `${locale}: open before the day`);
    assert.ok(ids(morning).includes("avui"), `${locale}: closed at midnight`);
    assert.ok(ids(evening).includes("avui"), `${locale}: closed in the evening`);
    assert.ok(!ids(after).includes("avui"), `${locale}: still open on 1 Jan`);
    for (const body of [before, morning, after]) assert.ok(bodySchema.safeParse(body).success, locale);
    // It comes before the results heading, so it is the first H2 on the day.
    assert.equal(ids(morning).filter(Boolean)[0], "avui", locale);
    // The page carries a dateWindow, so the nightly cron re-renders it.
    assert.match(JSON.stringify(blocks(locale)), new RegExp(REVALIDATE_NIGHTLY_PATTERN));
  }
});

test("the draw-day section is only built while the results slot is empty, and links official pages only", () => {
  for (const locale of LOCALES) {
    assert.ok(!JSON.stringify(buildGrossaBody(locale, FAKE)).includes('"dateWindow"'), `${locale}: still there with results`);
    const on = resolveDateWindows(blocks(locale), at("2026-12-31T12:00:00+01:00"));
    const start = on.findIndex((b) => (b as { id?: string }).id === "avui");
    const section = on.slice(start, start + 3);
    const plain = bodyToPlainText(section);
    for (const match of JSON.stringify(section).matchAll(/\]\((https?:[^)]*)\)/g)) {
      const host = new URL(match[1]!).host;
      assert.ok(host.endsWith("loteriesdecatalunya.cat") || host.endsWith("loteriesdecatalunya.info"), `${locale}: ${host}`);
    }
    // Every clock time in it is the 11:00 sales close, the office hours, or carries 2025.
    if (!DRAW_TIME_2026) {
      for (const piece of plain.split(/(?<=[.;])\s+/)) {
        for (const time of piece.match(/\b\d{1,2}:\d{2}\b/g) ?? []) {
          if (["11:00", "9:00", "14:00"].includes(time)) continue;
          assert.match(piece, /2025/, `${locale}: ${time} in "${piece}"`);
        }
      }
    }
    assert.match(plain, /168[.,]000/, `${locale}: net first prize`);
  }
});

test("the comparison table takes both sides from the calculator's data and does the sums", () => {
  assert.equal(COMPARISON.grossa.date, DRAWS["grossa-2026"].date);
  assert.equal(COMPARISON.grossa.price, DRAWS["grossa-2026"].price);
  assert.equal(COMPARISON.grossa.first, PRESETS.find((p) => p.id === "grossa-primer")!.prize);
  assert.equal(COMPARISON.nadal.date, "2026-12-22");
  assert.equal(COMPARISON.nadal.price, 20);
  assert.equal(COMPARISON.nadal.first, 400_000);
  assert.equal(levy(400_000), 72_000);
  assert.deepEqual(perEuro(COMPARISON.grossa.first, COMPARISON.grossa.price), { gross: 20_000, net: 16_800 });
  assert.deepEqual(perEuro(COMPARISON.nadal.first, COMPARISON.nadal.price), { gross: 20_000, net: 16_400 });
  assert.equal(weekdayIndex("2026-12-22"), 2, "22 Dec 2026 is a Tuesday");
  const rows: Record<Locale, RegExp[]> = {
    ca: [/Dimarts 22 de desembre de 2026/, /20 € el dècim/, /400\.000 € per dècim/, /328\.000 €/, /Tres mesos/],
    es: [/Martes 22 de diciembre de 2026/, /20 € el décimo/, /400\.000 € por décimo/, /328\.000 €/, /Tres meses/],
    en: [/Tuesday 22 December 2026/, /€20 a décimo/, /€400,000 a décimo/, /€328,000/, /Three months/],
  };
  for (const locale of LOCALES) {
    const table = blocks(locale).find((b) => b.type === "table" && JSON.stringify(b).includes("SELAE")) as { rows: string[][]; note: string } | undefined;
    assert.ok(table, `${locale}: no comparison table`);
    const flat = table.rows.flat().join(" | ");
    for (const pattern of rows[locale]) assert.match(flat, pattern, locale);
    // The Christmas side is the 31 Oct SELAE reading, and says so.
    assert.match(table.note, /31 (d'octubre|de octubre|October) (de )?2026/, locale);
    assert.ok(ids(blocks(locale)).includes("grossa-o-nadal"), locale);
  }
});

test("the per-euro table is the DOGC's prize per ticket divided by the ticket price, net of the levy", () => {
  for (const locale of LOCALES) {
    const table = blocks(locale).find((b) => b.type === "table" && /participaci|shares/.test((b as { caption?: string }).caption ?? "")) as { rows: string[][] } | undefined;
    assert.ok(table, `${locale}: no per-euro table`);
    assert.equal(table.rows.length, 5);
    const first = table.rows[0]!.join(" ");
    assert.match(first, locale === "en" ? /€20,000.*€16,800/ : /20\.000 €.*16\.800 €/, locale);
  }
  assert.equal(perEuro(PRIZES.second.five).net, (PRIZES.second.five - levy(PRIZES.second.five)) / TICKET_PRICE);
  assert.equal(perEuro(PRIZES.third.five).net, 3_000, "the third prize pays no levy");
});

test("two FAQ items in the searched words: La Grossa vs Christmas lottery, per euro", () => {
  const asks: Record<Locale, string[]> = {
    ca: ["La Grossa de Cap d'Any és el mateix que la loteria de Nadal?", "Quant es cobra per euro a La Grossa de Cap d'Any?"],
    es: ["¿La Grossa de Cap d'Any es lo mismo que la Lotería de Navidad?", "¿Cuánto toca por euro en La Grossa de Cap d'Any?"],
    en: ["Is La Grossa the same as the Spanish Christmas Lottery (El Gordo)?", "How much does La Grossa pay per euro?"],
  };
  for (const locale of LOCALES) {
    for (const body of [blocks(locale), buildGrossaBody(locale, FAKE)]) {
      const items = faqItems(body);
      for (const question of asks[locale]) {
        const item = items.find((i) => i.question === question);
        assert.ok(item, `${locale}: missing "${question}"`);
        assert.doesNotMatch(item.answer, /\*\*|\]\(/, locale);
      }
      assert.equal(new Set(items.map((i) => i.question)).size, items.length, `${locale}: a question twice`);
    }
  }
});

test("NYE: 'what day is New Year's Eve 2026 / is 31 December a holiday' answers from the calendars", () => {
  assert.equal(weekdayIndex("2026-12-31"), 4, "Thursday");
  assert.equal(weekdayIndex("2027-01-01"), 5, "Friday");
  assert.ok(!BARCELONA_LOCAL_2026.includes("2026-12-31" as never));
  const asks: Record<Locale, string> = {
    ca: "Quin dia cau Cap d'Any 2026 i és festiu el 31 de desembre?",
    es: "¿Qué día cae Nochevieja 2026 y es festivo el 31 de diciembre?",
    en: "What day is New Year's Eve 2026, and is 31 December a holiday?",
  };
  const facts: Record<Locale, RegExp[]> = {
    ca: [/dijous 31 de desembre de 2026/, /divendres 1 de gener de 2027/, /laborable/, /25 de maig i el 24 de setembre de 2026/],
    es: [/jueves 31 de diciembre de 2026/, /viernes 1 de enero de 2027/, /laborable/, /25 de mayo y el 24 de septiembre de 2026/],
    en: [/Thursday 31 December 2026/, /Friday 1 January 2027/, /working day/, /25 May and 24 September 2026/],
  };
  for (const locale of LOCALES) {
    const item = faqItems(NEW_YEAR.editions[locale].blocks).find((i) => i.question === asks[locale]);
    assert.ok(item, `${locale}: missing`);
    for (const pattern of facts[locale]) assert.match(item.answer, pattern, locale);
    const urls = NEW_YEAR.sources.map((s) => s.url);
    assert.ok(urls.some((u) => u.includes("calendari-festes-2026")), "2026 calendar is a source");
    assert.ok(urls.some((u) => u.includes("b4eh-r8up")), "local holidays dataset is a source");
  }
  // The engine agrees: 31 Dec 2026 is no Catalan holiday, 1 Jan 2027 is.
  assert.equal(holidayOn("2026-12-31"), null);
  assert.ok(holidayOn("2027-01-01"));
});

test("date guard: re-read the draw-day facts before 31 Dec (move GROSSA_DRAW_DAY_CHECKED)", () => {
  assert.ok(GROSSA_DRAW_DAY_CHECKED <= today(), "check date in the future");
  if (RESULTS_2026 || today() < GROSSA_DRAW_DAY_RECHECK_BY) return;
  assert.ok(
    GROSSA_DRAW_DAY_CHECKED >= GROSSA_DRAW_DAY_RECHECK_BY,
    `On ${today()} La Grossa's draw-day section (31 Dec) was last checked on ${GROSSA_DRAW_DAY_CHECKED}. Re-read Loteries de Catalunya's press notes (2026 time and broadcast: fill DRAW_TIME_2026), the payment-of-prizes page and the sales system's close, then move GROSSA_DRAW_DAY_CHECKED and republish ?only=grossa.`,
  );
});
