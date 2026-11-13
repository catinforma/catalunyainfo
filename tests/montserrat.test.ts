import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { MONTSERRAT_FREE, MONTSERRAT_REREAD_BY } from "../src/lib/content/batch02/day-trips.ts";
import { BATCH_02 } from "../src/lib/content/batch02/publish.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { MONTSERRAT } from "../src/lib/content/features/montserrat.ts";
import { FEATURES } from "../src/lib/content/features/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * The Montserrat guide's 13 Nov 2026 upgrade: cable car vs rack railway vs
 * car/coach (research_notes/evergreen-demand-nov2026.md, item 9). The page
 * keeps its URL and title (the 28 Oct title window runs to 28 Nov); the body
 * gains the comparison the English queries ask for.
 */

type T = { type: string; caption?: string; headers?: string[]; rows?: string[][] };
const blocks = (locale: Locale) => MONTSERRAT_FREE.editions[locale].blocks as unknown as T[];
const tables = (locale: Locale) => blocks(locale).filter((b) => b.type === "table");
const text = (locale: Locale) => bodyToPlainText(MONTSERRAT_FREE.editions[locale].blocks);
const links = (locale: Locale) => [...JSON.stringify(MONTSERRAT_FREE.editions[locale].blocks).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);

/** Operators and the Abbey only: FGC (incl. Turistren and its shop), the Aeri, Montserrat Visita, the museum, the BOE never needed. */
const OFFICIAL = /^(turistren\.cat|www\.cremallerademontserrat\.cat|www\.fgc\.cat|aeridemontserrat\.com|vol\.cremallerademontserrat\.cat|www\.montserratvisita\.com|www\.museudemontserrat\.cat)$/;

test("montserrat: same URLs and titles (inside the 28 Oct window), three valid editions with the same shape", () => {
  assert.equal(MONTSERRAT_FREE.editions.en.path, "day-trips/montserrat-without-a-tour-from-barcelona");
  assert.equal(MONTSERRAT_FREE.editions.es.path, "escapadas/montserrat-por-libre-desde-barcelona");
  assert.equal(MONTSERRAT_FREE.editions.ca.path, "escapades/montserrat-per-lliure-des-barcelona");
  assert.equal(MONTSERRAT_FREE.editions.en.seoTitle, "Montserrat cable car or rack railway: 2026 times and fares");
  assert.equal(MONTSERRAT_FREE.editions.es.seoTitle, "Cremallera y teleférico de Montserrat: horarios y precios");
  const shape = (locale: Locale) => (MONTSERRAT_FREE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(MONTSERRAT_FREE.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.equal(shape(locale), shape("en"), `${locale}: same sections as the English edition`);
    assert.ok(wordCount(text(locale)) > 1500, `${locale}: ${wordCount(text(locale))} words`);
  }
});

test("montserrat: the comparison table comes right after the facts and covers cable car, rack railway, car and coach", () => {
  for (const locale of LOCALES) {
    const b = blocks(locale);
    const firstTable = b.findIndex((x) => x.type === "table");
    const rackTable = b.findIndex((x) => x.type === "table" && (x.rows ?? []).some((r) => r.join(" ").includes(":48")) && x.headers?.length === 4);
    assert.ok(firstTable < rackTable, `${locale}: the comparison precedes the timetables`);
    const compare = b[firstTable]!;
    assert.equal(compare.headers?.length, 6, `${locale}: option, from Barcelona, connection, time, combined tickets, price`);
    assert.equal(compare.rows?.length, 4, `${locale}: four options`);
    const all = JSON.stringify(compare.rows);
    assert.match(all, /Plaça Espanya/);
    assert.match(all, /R5/);
    assert.match(all, /Monistrol de Montserrat/);
    assert.match(all, /Montserrat-Aeri/);
    assert.match(all, /28[.,]80/, `${locale}: train + rack railway 4 zones return`);
    assert.match(all, /50 €|€50/, `${locale}: Trans Montserrat`);
    assert.match(all, /71[.,]50/, `${locale}: Tot Montserrat`);
    assert.match(all, /1 h 32 min/, `${locale}: rack-railway door to door`);
    assert.match(all, /Julià/, `${locale}: the coach is named`);
    assert.doesNotMatch(all, /6[.,]25|9[.:]15/, `${locale}: the unconfirmed coach fare and time are not printed`);
  }
});

test("montserrat: best choice by situation, up one way and down the other, accessibility and the sanctuary hours", () => {
  const mix = { ca: /19 €/, es: /19 €/, en: /€19/ } as const;
  const access = { ca: /mobilitat reduïda/, es: /movilidad reducida/, en: /reduced mobility/ } as const;
  for (const locale of LOCALES) {
    const t = tables(locale);
    const best = t.find((x) => x.headers?.length === 3 && (x.rows?.length ?? 0) >= 6);
    assert.ok(best, `${locale}: a by-situation table`);
    assert.match(text(locale), mix[locale], `${locale}: two singles cost 19`);
    assert.match(text(locale), access[locale], `${locale}: accessibility`);
    assert.match(text(locale), /\+34 93 835 0005/, `${locale}: the Aeri phone for wheelchair users`);
    const hours = t.find((x) => (x.rows ?? []).some((r) => r[1] === "7:00–20:00"));
    assert.ok(hours, `${locale}: the basilica hours`);
    assert.ok((hours?.rows ?? []).some((r) => r[1]?.includes("13:00")), `${locale}: the Escolania`);
  }
});

test("montserrat: new FAQ answers in the queries' words", () => {
  const q: Record<Locale, RegExp[]> = {
    ca: [/pujar en Aeri i baixar en cremallera/, /Quant es triga de Barcelona/, /cadira de rodes/, /en cotxe/, /autobús/],
    es: [/subir en teleférico y bajar en cremallera/, /Cuánto se tarda de Barcelona/, /silla de ruedas/, /en coche/, /autobús/],
    en: [/up by cable car and come down by rack railway/, /How long does it take from Barcelona/, /wheelchair accessible/, /drive to Montserrat/, /bus from Barcelona/],
  };
  for (const locale of LOCALES) {
    const questions = JSON.stringify(blocks(locale).filter((b) => b.type === "faq"));
    for (const re of q[locale]) assert.match(questions, re, `${locale}: ${re}`);
  }
});

test("montserrat: external links are the operators' and the Abbey's own sites, never aerobusbcn", () => {
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("http"))) {
      assert.match(new URL(href).hostname, OFFICIAL, href);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
  }
  for (const source of MONTSERRAT_FREE.sources) {
    assert.match(new URL(source.url).hostname, /^(turistren\.cat|www\.cremallerademontserrat\.cat|www\.fgc\.cat|aeridemontserrat\.com|vol\.cremallerademontserrat\.cat|www\.montserratvisita\.com|www\.museudemontserrat\.cat)$/, source.url);
  }
  assert.equal(new Set(MONTSERRAT_FREE.sources.map((s) => s.url)).size, MONTSERRAT_FREE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("montserrat: fares and the Aeri calendar run to 31 Dec 2026 (re-read the 2027 fares and calendar, then move MONTSERRAT_REREAD_BY)", () => {
  assert.equal(MONTSERRAT_FREE.verifiedAt, "2026-11-13");
  assert.ok(Date.now() < Date.parse(`${MONTSERRAT_REREAD_BY}T00:00:00Z`), "Montserrat fares (Turistren, Aeri) and the Aeri calendar end on 31 Dec 2026: re-read them for 2027");
});

test("montserrat: English anchors in the query's words on Beyond Montserrat and Christmas in Barcelona", () => {
  const target = `](${b2href("montserratFree", "en")})`;
  const beyond = JSON.stringify(MONTSERRAT.editions.en.blocks);
  assert.ok(beyond.includes(`[Montserrat cable car or rack railway: which to take, times and fares${target}`));
  const xmas = JSON.stringify(CHRISTMAS_BARCELONA.editions.en.blocks);
  assert.ok(xmas.includes(`[Montserrat by cable car or rack railway${target}`));
});

test("montserrat: the publish route sends the guide and its link pages on their own", () => {
  assert.equal(BATCH_02[3], MONTSERRAT_FREE, "publishBatch02(3, 4) is the Montserrat guide");
  assert.equal(FEATURES[6], MONTSERRAT, "publishFeatures(6, 7) is Beyond Montserrat");
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("montserrat"\)\) published\.push\(\.\.\.\(await publishBatch02\(3, 4\)\)\)/);
  assert.match(route, /wants\("montserrat-links"\)\) published\.push\(\.\.\.\(await publishFeatures\(6, 7\)\), await publishB2Article\(CHRISTMAS_BARCELONA\)\)/);
});
