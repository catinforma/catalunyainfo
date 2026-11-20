import assert from "node:assert/strict";
import { test } from "node:test";

import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN, MONDAY_7, decemberBridgeLine } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { B2_PATHS, B2_TITLES } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { buildBody as buildSchoolGuide } from "../src/lib/content/school/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { REGIONS } from "../src/lib/programmatic/holidays/boe-2027.ts";
import { dateContent } from "../src/lib/programmatic/holidays/dates.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { datePath } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * December bridge cluster, 20 Nov 2026 (docs/SEO_EXPERIMENTS.md): one page per
 * question. The Spain-wide page owns the national bridge questions, the
 * Catalan page and the 7/8 December date pages own Catalonia, and every page
 * of the cluster hands the other question on with a descriptive link.
 */

const json = (value: unknown) => JSON.stringify(value);
const DEC7 = "2026-12-07";
const DEC8 = "2026-12-08";

test("date pages: 7 and 8 December send the Spain-wide question to the Spain page, under the answer", () => {
  for (const locale of LOCALES) {
    for (const iso of [DEC7, DEC8] as const) {
      const content = dateContent(iso, locale);
      assert.equal(content.restOfSpain?.href, GUIDES.decemberBridgeSpain[locale], `${locale} ${iso}`);
      assert.match(content.restOfSpain!.label, /^[A-ZÀ-Ú]/, `${locale} ${iso}: the label starts a sentence`);
    }
    // Other date pages keep their layout.
    assert.equal(dateContent("2026-12-25", locale).restOfSpain, undefined, locale);
  }
});

test("8 December: the answer note says it is a holiday across Spain (BOE: '*' in all nineteen columns) and where the 7th is", () => {
  const note = (locale: Locale) => dateContent(DEC8, locale).answerNote.join(" ");
  assert.match(note("es"), /Es fiesta nacional en toda España/);
  assert.match(note("ca"), /És festa nacional a tot Espanya/);
  assert.match(note("en"), /national holiday across Spain/);
  for (const locale of LOCALES) assert.match(note(locale), /Melilla/, locale);
  // The lead (the answer) is unchanged: the national sentence is a note under it.
  assert.match(dateContent(DEC8, "es").answer, /^Sí\. El martes 8 de diciembre de 2026/);
});

test("anchors to the Catalan bridge page say Catalonia; anchors to the Spain page say 'festivos del puente'", () => {
  assert.match(B2_TITLES.decemberBridge.es, /en Cataluña/);
  assert.match(B2_TITLES.decemberBridge.ca, /a Catalunya/);
  assert.match(B2_TITLES.decemberBridge.en, /in Catalonia/);
  const spain = (locale: Locale) => `](/${locale}/${B2_PATHS.decemberBridgeSpain[locale]}/)`;
  const words: Record<Locale, RegExp> = {
    es: /\[los festivos del puente de diciembre[^\]]*\]$/,
    ca: /\[els festius del pont de desembre[^\]]*\]$/,
    en: /\[the December[^\]]*bridge holidays[^\]]*\]$/,
  };
  for (const locale of LOCALES) {
    const body = json(DECEMBER_BRIDGE.editions[locale].blocks);
    let at = body.indexOf(spain(locale));
    assert.ok(at > 0, locale);
    while (at > 0) {
      const before = body.slice(Math.max(0, at - 120), at + 1);
      assert.match(before, words[locale], `${locale}: ${before}`);
      at = body.indexOf(spain(locale), at + 1);
    }
  }
});

test("Catalan bridge page: the 7 December section links the date page with the list of towns", () => {
  for (const locale of LOCALES) assert.ok(json(DECEMBER_BRIDGE.editions[locale].blocks).includes(`](${datePath(locale, DEC7)})`), locale);
});

test("Catalan school guide: the 7 December answer hands on to the Catalan bridge page", () => {
  for (const locale of LOCALES) {
    const faq = buildSchoolGuide(locale).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    const bridge = faq.items.find((i) => /7 de desembre|7 de diciembre|7 December/.test(i.question));
    assert.ok(bridge, `${locale}: no 7 December question`);
    assert.ok(bridge.answer.includes(`](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`), locale);
  }
});

test("shops: 'domingos abiertos 2026' and 'cuándo abren las tiendas los domingos' are asked in their words, with the order's dates", () => {
  const questions: Record<Locale, string[]> = {
    es: ["¿Qué domingos abren las tiendas en 2026?", "¿Cuándo abren las tiendas los domingos en Cataluña?"],
    ca: ["Quins diumenges obren les botigues el 2026?", "Quan obren les botigues els diumenges a Catalunya?"],
    en: ["Which Sundays can shops open in 2026?", "When are shops open on Sundays in Catalonia?"],
  };
  for (const locale of LOCALES) {
    const items = (SHOPS.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
    for (const q of questions[locale]) assert.ok(items.some((i) => i.question === q), `${locale}: ${q}`);
    const year = items.find((i) => i.question === questions[locale][0])!.answer;
    // Ordre EMT/77/2025 art. 1 (4 Jan, 15 Aug, 12 Oct, 29 Nov, 6, 13, 20, 27 Dec) and art. 6 (11 Jan, 8 Dec).
    for (const day of ["4 i 11|4 y 11|4 and 11", "15 d'agost|15 de agosto|15 August", "12 d'octubre|12 de octubre|12 October", "29 de novembre|29 de noviembre|29 November", "6, 13, 20 i 27|6, 13, 20 y 27|6, 13, 20 and 27"]) {
      assert.match(year, new RegExp(day), `${locale}: ${day}`);
    }
    // The resolution lists 77 councils, Barcelona among them with the default days: "77 differ" would be wrong.
    assert.ok(!/77 (ajuntaments|ayuntamientos|councils)/.test(year), `${locale}: no count of councils that differ`);
  }
});

test("Spain 2027 pages: 'this December' line per community, from the BOE rows, gone after 8 December", () => {
  for (const locale of LOCALES) {
    const hub = decemberBridgeLine(locale, "2026-11-20");
    assert.ok(hub && hub.href === `/${locale}/${B2_PATHS.decemberBridgeSpain[locale]}/`, locale);
    for (const region of REGIONS) {
      const line = decemberBridgeLine(locale, "2026-12-08", region, locale === "es" ? "en X" : locale === "ca" ? "a X" : "in X");
      assert.ok(line, `${locale} ${region}`);
      const holiday = MONDAY_7.includes(region);
      assert.match(line.text, holiday ? /festivo \(|festiu \(|public holiday \(/ : /laborable|feiner|working day/, `${locale} ${region}`);
      assert.equal(line.href, `/${locale}/${B2_PATHS[region === "CT" ? "decemberBridge" : "decemberBridgeSpain"][locale]}/`, `${locale} ${region}`);
    }
    assert.match(decemberBridgeLine(locale, "2026-11-20", "NC", "X")!.text, /Francisco Javier|Francesc Xavier|Francis Xavier/, locale);
    assert.equal(decemberBridgeLine(locale, "2026-12-09"), null, locale);
    assert.equal(decemberBridgeLine(locale, "2026-12-09", "MD", "X"), null, locale);
  }
});

test("the Spain page carries the 20 Nov 2026 check date", () => {
  assert.equal(DECEMBER_BRIDGE_SPAIN.verifiedAt, "2026-11-20");
});
