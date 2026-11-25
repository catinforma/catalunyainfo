import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { BARCELONA_DECEMBER } from "../src/lib/content/batch02/barcelona-december.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { SETCASES } from "../src/lib/content/batch02/pyrenees.ts";
import { SKI, SKI_META, SKI_OPENING_2026 } from "../src/lib/content/batch02/ski.ts";
import { SNOW } from "../src/lib/content/batch02/snow-trips.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026, ski re-read (docs/SEO_EXPERIMENTS.md). Read on the operators'
 * own pages: Baqueira's news of 24 Nov postponed the 28 Nov opening ("pospone
 * la apertura prevista para el sábado 28 de noviembre y anunciará la nueva
 * fecha en función de las condiciones de nieve en pistas"); the FGC calendars,
 * prices, Masella, Port del Comte and Tavascan are unchanged; FGC now prints
 * 2026-27 ALSA Ski Bus dates; Vallter closed a chairlift on 24 Nov.
 */

type B = { type: string; text?: string; lead?: boolean; rows?: string[][]; items?: { question: string; answer: string }[] };

const planned = { ca: /prevista per al dissabte 28 de novembre/, es: /prevista para el sábado 28 de noviembre/, en: /planned for Saturday 28 November/ } as const;
const stillPlanned = {
  ca: /Baqueira[^.]{0,80}(té previst|preveu) obrir[^.]{0,60}28 de novembre/,
  es: /Baqueira[^.]{0,80}(tiene previsto|prevé) abrir[^.]{0,60}28 de noviembre/,
  en: /Baqueira[^.]{0,80}plans to open[^.]{0,60}28 November/,
} as const;

test("ski 25 Nov: Baqueira's 28 Nov opening is postponed in the lead, the table, the text, the FAQ and the description", () => {
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    assert.ok(bodySchema.safeParse(blocks).success, `${locale}: blocks valid`);
    const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
    assert.match(lead, planned[locale], `${locale}: lead names the cancelled day`);
    assert.match(lead, /24 (de )?(novembre|noviembre|November)/, `${locale}: lead dates the note`);
    const opening = blocks.filter((b) => b.type === "table")[0]?.rows ?? [];
    const row = JSON.stringify(opening.find((r) => r[0] === "Baqueira Beret"));
    assert.match(row, /Ajornada|Aplazada|Postponed/, `${locale}: table row`);
    assert.match(row, /4 (d'abril|de abril|April)/, `${locale}: closing day kept from the 11 Nov note`);
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.doesNotMatch(text, stillPlanned[locale], `${locale}: no sentence still says it plans to open on 28 Nov`);
    assert.match(text, /la estación pospone la apertura/i, `${locale}: the official words are quoted`);
    assert.ok(JSON.stringify(SKI.sources).includes("prepara-el-inicio-de-temporada"), "24 Nov note in the sources");
    const faq = blocks.find((b) => b.type === "faq")?.items ?? [];
    const q = faq.find((i) => /^(Quan obre Baqueira|¿Cuándo abre Baqueira|When does Baqueira)/.test(i.question));
    assert.match(q?.answer ?? "", /24 (de )?(novembre|noviembre|November)/, `${locale}: Baqueira FAQ`);
    assert.match(SKI_META[locale].seoDescription, /28 (de )?(novembre|noviembre|November)/);
    assert.match(SKI_META[locale].seoDescription, /ajornat|aplaza|postponed/, `${locale}: description corrected`);
    assert.ok(SKI_META[locale].seoDescription.length <= 155, `${locale}: description length`);
    assert.match(SKI_META[locale].excerpt, /ajornat|aplazado|postponed/, `${locale}: excerpt corrected`);
  }
  assert.ok(!("baqueira" in SKI_OPENING_2026), "no Baqueira date is exported as an opening day");
});

test("ski 25 Nov: the other pages that printed Baqueira's 28 Nov say postponed", () => {
  for (const locale of LOCALES) {
    for (const [name, page] of [["snow", SNOW], ["december bridge", DECEMBER_BRIDGE], ["Barcelona december", BARCELONA_DECEMBER]] as const) {
      const text = bodyToPlainText(page.editions[locale].blocks);
      assert.doesNotMatch(text, stillPlanned[locale], `${name}/${locale}: still plans 28 Nov`);
      assert.doesNotMatch(text, /Baqueira[^.]{0,40}(preveu|prevé|plans) (obrir|abrir|to open)/, `${name}/${locale}: still plans to open`);
      assert.match(text, /ajorn|aplaz|postpon/, `${name}/${locale}: says postponed`);
    }
  }
});

test("ski 25 Nov: FGC's 2026-27 bus dates and Ski Tren price, the closing-day, snow-report and transport answers", () => {
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.match(text, /48[,.]50/, `${locale}: Port Ainé ALSA Ski Bus price`);
    assert.match(text, /43[,.]55/, `${locale}: Espot ALSA Ski Bus price`);
    assert.match(text, /26 (de )?(desembre|diciembre|December)[^.]{0,40}28 (d'abril|de abril|April)/, `${locale}: Espot service dates as printed`);
    assert.match(text, /5 (de )?(desembre|diciembre|December)[^.]{0,40}28 (de )?(març|marzo|March)/, `${locale}: Port Ainé service dates`);
    assert.match(text, /53 €|€53 /, `${locale}: Ski Tren`);
    assert.doesNotMatch(text, /6 (de )?(desembre|diciembre|December)[^.]{0,30}5 (d'abril|de abril|April)[^.]{0,80}(encara mostren|aún muestran|still show)/, `${locale}: 2025-26 bus dates as current`);
    const faq = blocks.find((b) => b.type === "faq")?.items ?? [];
    const close = faq.find((i) => /^(Quan tanquen|¿Cuándo cierran|When do Catalonia's ski resorts close)/.test(i.question));
    assert.match(close?.answer ?? "", /4 (d'abril|de abril|April)[^.]{0,5}(de )?2027/, `${locale}: closing-day FAQ`);
    const snow = faq.find((i) => /(neu|nieve|snow)[^?]*\?/.test(i.question) && /(avui|hoy|today)/.test(i.question));
    assert.ok(snow, `${locale}: snow-report FAQ`);
    const transit = faq.find((i) => /(transport públic|transporte público|public transport)/.test(i.question));
    assert.match(transit?.answer ?? "", /Ski Tren|Ski Bus/, `${locale}: public transport FAQ`);
    const json = JSON.stringify(blocks);
    for (const url of ["pirineu365.cat/webcams-pirineu365/", "masella.com/ca/webcam", "portdelcomte.net/webcams-i-meteo/", "baqueira.es/es/webcams", "pirineu365.cat/infoneu-pirineu365/"]) {
      assert.ok(json.includes(url), `${locale}: ${url} linked`);
    }
    assert.equal(new Set(faq.map((i) => i.question)).size, faq.length, `${locale}: no duplicate question`);
  }
});

test("ski 25 Nov: Vallter's closed chairlift is on the ski guide and Setcases; dead La Molina sources are gone", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.match(text, /Enric Planella/, `${locale}: ski guide`);
    assert.match(text, /14[,.]15/, `${locale}: Vallter km kept with its caveat`);
    assert.match(bodyToPlainText(SETCASES.editions[locale].blocks), /Enric Planella/, `${locale}: Setcases`);
  }
  for (const module of [SKI, SNOW, DECEMBER_BRIDGE, BARCELONA_DECEMBER]) {
    const urls = JSON.stringify(module.sources);
    assert.doesNotMatch(urls, /informacio-tecnica|planol-pistes-fitxa-tecnica/, `${module.key}: 404 La Molina URL`);
  }
  assert.equal(SKI.verifiedAt, "2026-11-25");
});
