import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { CLIMATE, CLIMATE_META, climateMonth, monthSummary } from "../src/lib/content/batch02/climate.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Batch 8G, 27 Nov 2026 (weather guide, month queries at 8-10): each month
 * opens with a bold one-line answer from the AEMET row, the AEMET day counts
 * (clear, frost, snow, storm) follow, January links the Jan-Feb hub and
 * December the winter-start guide, and seven FAQs use the searchers' words.
 * Title, description, H1, lead and the month H3s are untouched (windows open
 * to 9 Dec / 3 Dec).
 */

type B = { type: string; level?: number; text?: string; id?: string; items?: { question: string; answer: string }[] };
const blocksOf = (locale: (typeof LOCALES)[number]) => CLIMATE.editions[locale].blocks as unknown as B[];

test("weather guide: every month paragraph opens with its one-line answer from the AEMET row", () => {
  for (const locale of LOCALES) {
    const blocks = blocksOf(locale);
    const h3 = blocks.filter((b) => b.type === "heading" && b.level === 3);
    assert.equal(h3.length, 12);
    h3.forEach((heading, i) => {
      const para = blocks[blocks.indexOf(heading) + 1]!;
      const summary = monthSummary(locale, i);
      assert.ok(para.text?.startsWith(summary), `${locale} month ${i + 1}: answer first`);
      const { high, low, rainDays } = climateMonth(i);
      const n = (v: number) => (locale === "en" ? v.toFixed(1) : v.toFixed(1).replace(".", ","));
      for (const v of [high, low, rainDays]) assert.ok(summary.includes(n(v)), `${locale} month ${i + 1}: ${v} in the summary`);
    });
  }
  assert.equal(monthSummary("en", 0), "**January: 13.6 °C (56 °F) by day and 4.7 °C (40 °F) at night on average, with 3.7 rainy days.**");
  assert.equal(monthSummary("ca", 11), "**Desembre: 14,3 °C de dia i 5,7 °C de nit de mitjana, amb 4,4 dies de pluja.**");
  assert.equal(monthSummary("es", 1), "**Febrero: 14,3 °C de día y 5,4 °C de noche de media, con 4,0 días de lluvia.**");
});

test("weather guide: AEMET day counts (DD, DH, DN, DT) as published, zeros left out", () => {
  const en = bodyToPlainText(CLIMATE.editions.en.blocks);
  assert.match(en, /On average the airport has 7\.5 clear days, 1\.4 days of frost and 0\.1 days of snow\./); // January
  assert.match(en, /On average the airport has 6\.8 clear days and 3\.5 days with thunderstorms\./); // August
  assert.match(en, /On average the airport has 7\.0 clear days and 1\.0 days of frost\./); // December (snow 0.0)
  const es = bodyToPlainText(CLIMATE.editions.es.blocks);
  assert.match(es, /De media, en el aeropuerto hay 4,8 días despejados, 1,2 días de helada y 0,2 días de nieve\./);
  const ca = bodyToPlainText(CLIMATE.editions.ca.blocks);
  assert.match(ca, /De mitjana, a l'aeroport hi ha 10,2 dies serens i 1,3 dies de tempesta\./); // July
});

test("weather guide: January links the Jan-Feb hub, December the winter-start guide, inside the language", () => {
  for (const locale of LOCALES) {
    const blocks = blocksOf(locale);
    const h3 = blocks.filter((b) => b.type === "heading" && b.level === 3);
    const section = (i: number) => {
      const from = blocks.indexOf(h3[i]!);
      const to = i < 11 ? blocks.indexOf(h3[i + 1]!) : blocks.findIndex((b, k) => k > from && b.type === "heading" && b.level === 2);
      return JSON.stringify(blocks.slice(from, to));
    };
    assert.ok(section(0).includes(`](${b2href("barcelonaWinter", locale)})`), `${locale}: January -> Jan-Feb hub`);
    assert.ok(section(11).includes(`](${b2href("winterStart", locale)})`), `${locale}: December -> winter start`);
    assert.ok(section(11).includes(`](${b2href("barcelonaDecember", locale)})`), `${locale}: December -> Barcelona in December`);
  }
});

test("weather guide: FAQs in the searchers' words, figures from the tables", () => {
  const q: Record<(typeof LOCALES)[number], string[]> = {
    ca: ["Fa fred a Barcelona al febrer?", "Quin temps fa a Barcelona al desembre i al gener?", "Quan és l'època de pluges a Barcelona?", "Neva a Barcelona al desembre?", "Quin temps fa a Barcelona al març?", "Quin temps fa a Barcelona a l'abril?", "Quin temps fa a Barcelona al juny?"],
    es: ["¿Hace frío en Barcelona en febrero?", "¿Qué tiempo hace en Barcelona en diciembre y enero?", "¿Cuándo es la época de lluvias en Barcelona?", "¿Nieva en Barcelona en diciembre?", "¿Qué tiempo hace en Barcelona en marzo?", "¿Qué tiempo hace en Barcelona en abril?", "¿Qué tiempo hace en Barcelona en junio?"],
    en: ["Is it cold in Barcelona in February?", "What is the weather like in Barcelona in December and January?", "When is the rainy season in Barcelona?", "Does it snow in Barcelona in December?", "What is the weather like in Barcelona in March?", "What is the weather like in Barcelona in April?", "What is the weather like in Barcelona in June?"],
  };
  for (const locale of LOCALES) {
    const faq = blocksOf(locale).find((b) => b.type === "faq")!;
    const questions = faq.items!.map((i) => i.question);
    for (const question of q[locale]) assert.ok(questions.includes(question), `${locale}: ${question}`);
    assert.equal(new Set(questions).size, questions.length, `${locale}: no duplicate question`);
    const text = JSON.stringify(faq);
    assert.doesNotMatch(text, /undefined|NaN|null/);
  }
  const en = blocksOf("en").find((b) => b.type === "faq")!.items!;
  const answer = (question: string) => en.find((i) => i.question === question)!.answer;
  assert.match(answer("Is it cold in Barcelona in February?"), /14\.3 °C \(58 °F\).*5\.4 °C \(42 °F\).*frost on 1\.2 days.*snow on 0\.2 days.*9\.0 °C/);
  assert.match(answer("Does it snow in Barcelona in December?"), /0\.0 days of snow in December, 0\.1 in January and 0\.2 in February: 0\.4 a year/);
  assert.match(answer("When is the rainy season in Barcelona?"), /91 mm on 6\.3 days.*81 mm on 5\.2 days.*2\.8 days in October and 3\.5 in September.*21 mm/);
});

test("weather guide: title, description and lead unchanged (measurement windows to 9 Dec)", () => {
  assert.equal(CLIMATE_META.en.seoTitle, "Barcelona weather by month: temperature, January to December");
  assert.match(CLIMATE_META.en.seoDescription, /^Month by month: highs, lows, rain days, sunshine and records/);
  assert.equal(CLIMATE_META.en.title, "Barcelona weather and temperature by month (°C and °F)");
  const lead = blocksOf("en").find((b) => b.type === "lead");
  assert.match(lead?.text ?? JSON.stringify(blocksOf("en")[0]), /\*\*January\*\* is Barcelona's coldest month/);
});
