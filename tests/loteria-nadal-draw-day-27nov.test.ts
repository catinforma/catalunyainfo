import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { eur, levy } from "../src/lib/content/batch02/grossa.ts";
import {
  DRAW_DAY_CHECKED,
  DRAW_DAY_WINDOW,
  DRAW_TIME_2026,
  LOTERIA_NADAL,
  NADAL_URLS,
  RESULTS_2026,
  SHARE_KEYS,
  buildNadalArticle,
  buildNadalBody,
  netPerDecimo,
  netPerEuro,
  perDecimo,
  type NadalResults,
} from "../src/lib/content/batch02/loteria-nadal.ts";
import { resolveDateWindows, windowOpen } from "../src/lib/content/date-window.ts";
import { DAY_DEPENDENT_PATTERN, PHASE_DEPENDENT_PATTERN, REVALIDATE_NIGHTLY_PATTERN } from "../src/lib/content/day-dependent.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";

/**
 * 27 Nov 2026 (ci-edicio, batch 8L): the Christmas lottery guide's draw-day
 * section (a `dateWindow` block read only on 22 Dec, Madrid time), the net
 * per décimo in the programme table, the per-euro participacions table, the
 * BOE source of the three-month expiry and four FAQ items in searched words.
 */

const blocks = (locale: Locale) => LOTERIA_NADAL.editions[locale].blocks;
const at = (iso: string) => new Date(iso);
const headingIds = (body: Block[]) => body.filter((b) => b.type === "heading").map((b) => (b as { id?: string }).id);
const today = () => new Date().toISOString().slice(0, 10);

const FAKE: NadalResults = {
  first: "45678",
  second: "00417",
  third: "51230",
  fourth: ["08802", "63145"],
  fifth: ["00001", "11111", "22222", "33333", "44444", "55555", "66666", "99998"],
  soldInCatalonia: { first: null, second: null, third: null, fourth: null },
  source: { name: "prova", url: "https://www.loteriasyapuestas.es/es/loteria-nacional/resultados/prova", publisher: "SELAE" },
};

test("the draw-day section opens at 00:00 on 22 Dec and closes at 00:00 on 23 Dec, Madrid time", () => {
  assert.equal(DRAW_DAY_WINDOW.from, "2026-12-22T00:00:00+01:00");
  assert.equal(DRAW_DAY_WINDOW.until, "2026-12-23T00:00:00+01:00");
  for (const locale of LOCALES) {
    const before = resolveDateWindows(blocks(locale), at("2026-12-21T23:59:59+01:00"));
    const during = resolveDateWindows(blocks(locale), at("2026-12-22T00:00:00+01:00"));
    const evening = resolveDateWindows(blocks(locale), at("2026-12-22T23:59:00+01:00"));
    const after = resolveDateWindows(blocks(locale), at("2026-12-23T00:00:00+01:00"));
    assert.ok(!headingIds(before).includes("avui"), `${locale}: open before the day`);
    assert.ok(headingIds(during).includes("avui"), `${locale}: closed at midnight`);
    assert.ok(headingIds(evening).includes("avui"), `${locale}: closed in the evening`);
    assert.ok(!headingIds(after).includes("avui"), `${locale}: still open on 23 Dec`);
    for (const body of [before, during, after]) {
      assert.ok(bodySchema.safeParse(body).success, locale);
      assert.ok(!body.some((b) => b.type === "dateWindow"), `${locale}: unresolved window`);
    }
    // It sits right under the first-screen callout, above the results.
    const i = during.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === "avui");
    assert.equal(during[i - 1]?.type, "callout", locale);
    assert.equal((during[i + 3] as { id?: string }).id, "resultats", locale);
  }
  assert.equal(windowOpen(DRAW_DAY_WINDOW, at("2026-12-21T23:00:00Z")), true, "23:00 UTC on 21 Dec is midnight in Madrid");
});

test("the draw-day section links results to SELAE only, and every external link is a listed source", () => {
  const sources = LOTERIA_NADAL.sources.map((s) => s.url);
  for (const locale of LOCALES) {
    const window = blocks(locale).find((b) => b.type === "dateWindow") as { on: Block[]; off?: Block[] } | undefined;
    assert.ok(window, locale);
    assert.equal(window.off, undefined, `${locale}: nothing outside the window`);
    const raw = JSON.stringify(window.on);
    const external = [...raw.matchAll(/\]\((https:[^)]*)\)/g)].map((m) => m[1] ?? "");
    for (const href of external) {
      assert.ok(sources.includes(href), `${locale}: ${href} not a source`);
      assert.ok(["www.loteriasyapuestas.es", "www.selae.es", "www.rtve.es", "www.boe.es"].includes(new URL(href).host), `${locale}: ${href}`);
    }
    assert.ok(external.includes(NADAL_URLS.lnac), `${locale}: SELAE's results page`);
    assert.ok(external.includes(NADAL_URLS.expiry), `${locale}: the BOE expiry rule`);
    // The only internal link is the prize tax calculator: no scraped results page.
    const internal = [...raw.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    assert.deepEqual(internal, [calcPath("lottery-tax", locale)], locale);
    // No 2026 clock time while none is announced: every time carries 2025.
    if (!DRAW_TIME_2026) {
      const plain = bodyToPlainText(window.on as never, locale);
      for (const sentence of plain.split(/(?<=[.!?])\s+/)) {
        if (/\b\d{1,2}:\d{2}\b/.test(sentence)) assert.match(sentence, /2025/, `${locale}: "${sentence}"`);
      }
    }
  }
});

test("once the numbers are in, the draw-day section is gone (the lead and the results table answer)", () => {
  for (const locale of LOCALES) {
    assert.ok(!buildNadalBody(locale, FAKE).some((b) => b.type === "dateWindow"), locale);
    assert.ok(!JSON.stringify(buildNadalArticle(FAKE).editions[locale].blocks).includes('"dateWindow"'), locale);
  }
});

test("date guard: the draw-day text is re-read from 21 Dec, and no window is left behind after the draw", () => {
  assert.ok(today() < "2026-12-21" || DRAW_DAY_CHECKED >= "2026-12-21", "From 21 Dec 2026: re-read RTVE's and SELAE's 2026 draw-day announcements (time, broadcast), fill DRAW_TIME_2026 if announced, then move DRAW_DAY_CHECKED in loteria-nadal.ts.");
  if (today() >= "2026-12-23") {
    assert.ok(RESULTS_2026 !== null, "The draw is over: fill RESULTS_2026 (the draw-day window goes with it).");
  }
});

test("search text, word count and the body-dates hash do not move with the window", () => {
  for (const locale of LOCALES) {
    const plain = bodyToPlainText(blocks(locale), locale);
    assert.doesNotMatch(plain, /on seguir-lo|dónde seguirlo|where to follow it/, locale);
  }
});

test("the nightly cron re-renders a page with a date window; the sitemap's daily and phase rules leave it alone", () => {
  const jsonbText = '[{"type": "dateWindow", "from": "2026-12-22T00:00:00+01:00"}]';
  assert.match(jsonbText, new RegExp(REVALIDATE_NIGHTLY_PATTERN));
  assert.doesNotMatch(jsonbText, new RegExp(DAY_DEPENDENT_PATTERN));
  assert.doesNotMatch(jsonbText, new RegExp(PHASE_DEPENDENT_PATTERN));
});

test("the programme table gives the net per décimo, and the participacions table the net per euro played", () => {
  assert.equal(netPerDecimo("first"), 328_000);
  assert.equal(netPerDecimo("second"), 108_000);
  assert.equal(netPerDecimo("third"), 48_000);
  assert.equal(netPerDecimo("fourth"), 20_000);
  assert.equal(netPerEuro("first"), 16_400);
  assert.equal(netPerEuro("pedrea"), 5);
  assert.equal(netPerEuro("reintegro"), 1);
  for (const key of SHARE_KEYS) assert.equal(netPerEuro(key) * 20, perDecimo(key) - levy(perDecimo(key)), key);
  for (const locale of LOCALES) {
    const tables = blocks(locale).filter((b) => b.type === "table") as { headers: string[]; rows: string[][] }[];
    const programme = tables.find((t) => t.rows.length === 12)!;
    assert.equal(programme.headers.length, 5, locale);
    assert.equal(programme.rows[0]?.[4], eur(328_000, locale), locale);
    assert.equal(programme.rows[11]?.[4], eur(20, locale), locale);
    const share = tables.find((t) => t.rows.length === SHARE_KEYS.length)!;
    assert.ok(share, `${locale}: no participacions table`);
    assert.deepEqual(share.rows[0]?.slice(1), [eur(20_000, locale), eur(16_400, locale), eur(82_000, locale)], locale);
    assert.deepEqual(share.rows[SHARE_KEYS.length - 1]?.slice(1), [eur(1, locale), eur(1, locale), eur(5, locale)], locale);
  }
});

test("the three-month expiry cites the BOE (Real Decreto 1136/1979) in the claim section and the FAQ", () => {
  assert.ok(LOTERIA_NADAL.sources.some((s) => s.url === NADAL_URLS.expiry && s.publisher === "BOE"));
  assert.equal(NADAL_URLS.expiry, "https://www.boe.es/buscar/doc.php?id=BOE-A-1979-12628");
  for (const locale of LOCALES) {
    const faq = blocks(locale).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    assert.ok(faq.items.some((i) => /1136\/1979/.test(i.answer)), locale);
    const claim = JSON.stringify(blocks(locale).filter((b) => b.type === "paragraph"));
    assert.ok(claim.includes(`](${NADAL_URLS.expiry})`), locale);
  }
});

test("four FAQ items in the searched words: pedrea, a 5 € share, when payment starts, El Niño's date", () => {
  const asked: Record<Locale, string[]> = {
    ca: ["Quant és la pedrea de la loteria de Nadal?", "Quant toca una participació de 5 € del Gordo?", "Quan es pot cobrar la loteria de Nadal?", "Quan és el sorteig del Nen 2027?"],
    es: ["¿Cuánto es la pedrea de la Lotería de Navidad?", "¿Cuánto toca en una participación de 5 € del Gordo?", "¿Cuándo se puede cobrar la Lotería de Navidad?", "¿Cuándo es el sorteo del Niño 2027?"],
    en: ["How much is the pedrea in the Spanish Christmas Lottery?", "How much does a €5 share of El Gordo win?", "When can I collect a Christmas Lottery prize?", "When is the El Niño draw in 2027?"],
  };
  for (const locale of LOCALES) {
    const items = (blocks(locale).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
    for (const q of asked[locale]) {
      const item = items.find((i) => i.question === q);
      assert.ok(item, `${locale}: missing "${q}"`);
      assert.doesNotMatch(item.answer, /\*\*|\]\(/, q);
    }
    const share = items.find((i) => i.question === asked[locale][1])!.answer;
    assert.ok(share.includes(eur(100_000, locale)) && share.includes(eur(82_000, locale)), `${locale}: ${share}`);
    assert.ok(items.find((i) => i.question === asked[locale][0])!.answer.includes(eur(100, locale)), locale);
    assert.match(items.find((i) => i.question === asked[locale][3])!.answer, /2027.*31/, locale);
  }
});
