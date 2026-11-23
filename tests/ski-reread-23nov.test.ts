import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { NURIA } from "../src/lib/content/batch02/nuria.ts";
import { SETCASES } from "../src/lib/content/batch02/pyrenees.ts";
import { SKI } from "../src/lib/content/batch02/ski.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 23 Nov 2026, ski re-read before the season (docs/SEO_EXPERIMENTS.md): the
 * offers that ended on 15 and 22 Nov are past tense, the Ripollès pass and
 * Vallter's day pass follow FGC's rates pages, FGC's "Dia de l'esquiador" and
 * the Pirineu365 pass are in, and the page asks for a re-read once Baqueira's
 * planned opening day has come.
 */

type B = { type: string; text?: string; lead?: boolean; rows?: string[][]; items?: { question: string; answer: string }[] };

test("ski: offers that ended are not printed as still running", () => {
  const stale = {
    ca: /fins al 22 de novembre de 2026; |131 € si es compra abans|que hi aplica fins al 17/,
    es: /hasta el 22 de noviembre de 2026; |131 € si se compra antes|que aplica hasta el 17/,
    en: /until 22 November 2026; |€131 if bought before|it applies until 17/,
  } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.doesNotMatch(text, stale[locale], `${locale}: an ended offer read as current`);
    assert.doesNotMatch(text, /730 € adult, i 840 € després|730 € adulto, y 840 € después|€730 for adults, €840 after/, `${locale}: Masella FAQ`);
  }
});

test("ski: Ripollès pass and Vallter day pass as FGC's rates pages show them on 23 Nov 2026", () => {
  const ripolles = { ca: "387 € fins al 8 de desembre; 455 € després", es: "387 € hasta el 8 de diciembre; 455 € después", en: "€387 until 8 December; €455 after" } as const;
  const pirineu = { ca: "Pirineu365 (les sis estacions d'FGC)", es: "Pirineu365 (las seis estaciones de FGC)", en: "Pirineu365 (all six FGC resorts)" } as const;
  const vallter = { ca: "29 € baixa / 35 € alta", es: "29 € baja / 35 € alta", en: "€29 low / €35 high season" } as const;
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    const parsed = bodySchema.safeParse(blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    const tables = blocks.filter((b) => b.type === "table");
    const passes = tables.find((t) => t.rows?.some((r) => r[0]?.startsWith("Ripollès")))?.rows ?? [];
    assert.equal(passes.find((r) => r[0]?.startsWith("Ripollès"))?.[1], ripolles[locale], `${locale}: Ripollès row`);
    assert.ok(passes.some((r) => r[0] === pirineu[locale] && /730/.test(r[1] ?? "")), `${locale}: Pirineu365 row`);
    const resorts = tables.find((t) => t.rows?.some((r) => r[0] === "Vallter" && /€|alta|high/.test(r[4] ?? "")))?.rows ?? [];
    assert.equal(resorts.find((r) => r[0] === "Vallter")?.[4], vallter[locale], `${locale}: Vallter day pass`);
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.doesNotMatch(text, /420 € (fins|hasta)|€420 until|30 € (baixa|baja)|€30 low|36,50 € alta|€36\.50 high/, `${locale}: old Ripollès / Vallter figures`);
    const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
    assert.match(lead, /29 €|€29/, `${locale}: the lead's cheapest day pass`);
    assert.doesNotMatch(bodyToPlainText(SETCASES.editions[locale].blocks), /30 € en temporada|€30 in low season/, `${locale}: Setcases follows`);
  }
});

test("ski: Wednesday half price from FGC's 6 Nov note, with its own question; the Espot conflict is named", () => {
  const faq = { ca: /^Hi ha forfets més barats entre setmana\?$/, es: /^¿Hay forfaits más baratos entre semana\?$/, en: /^Are lift passes cheaper midweek\?$/ } as const;
  const espot = { ca: /Espot, però, continua marcant com a primer dia el dissabte 5/, es: /Espot, sin embargo, sigue marcando como primer día el sábado 5/, en: /Espot's calendar, however, still shows Saturday 5 December/ } as const;
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    const items = blocks.find((b) => b.type === "faq")?.items ?? [];
    const q = items.find((i) => faq[locale].test(i.question));
    assert.ok(q, `${locale}: midweek FAQ`);
    assert.match(q.answer, /FlexiPass/, `${locale}: FlexiPass named`);
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.match(text, /Dia de l'esquiador/, `${locale}: FGC's own name for it`);
    assert.match(text, /15 €.*25 €|€15.*€25/, `${locale}: FlexiPass fees`);
    assert.match(text, espot[locale], `${locale}: calendar vs press note`);
    assert.ok(JSON.stringify(SKI.sources).includes("dia-de-lesquiador"), "FGC's 6 Nov note in the sources");
  }
});

test("ski: re-read due once Baqueira's planned opening day has come", () => {
  // The page says Baqueira "plans" to open on Sat 28 Nov 2026 and that
  // Masella has no date. From 29 Nov 2026 that may no longer be true: re-read
  // baqueira.es/es/noticias, the FGC calendars and masella.com, rewrite the
  // opening section in the past tense where it applies, move VERIFIED, then
  // move this date to the next planned change (FGC opening, 4 Dec).
  const REREAD_BY = "2026-11-29";
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(today < REREAD_BY || SKI.verifiedAt >= REREAD_BY, `ski: verified ${SKI.verifiedAt}, re-read due ${REREAD_BY}`);
});

test("nuria: the 2026-27 ski passes are no longer 'not published'", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(NURIA.editions[locale].blocks);
    assert.doesNotMatch(text, /encara no havia publicat els forfets|aún no había publicado los forfaits|had not yet published the 2026-27 ski passes|ski passes were not out yet/, `${locale}: stale ski-pass line`);
    assert.match(text, /387 €|€387/, `${locale}: Ripollès season pass`);
    assert.match(text, /23 de novembre de 2026|23 de noviembre de 2026|23 November 2026/, `${locale}: read date printed`);
  }
});
