import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { SKI, SKI_OPENING_READ } from "../src/lib/content/batch02/ski.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026: the opening table (resort, announced opening, status today,
 * last day, source and read time) sits first on the ski guide. Dates were read
 * on the operators' own pages; where nothing is announced the cell says so.
 */

type B = { type: string; rows?: string[][] };

const NOT_ANNOUNCED = /Sense data anunciada|Sin fecha anunciada|Not announced/;

test("ski opening table: five columns, ten resorts, first table of the page, never an invented date", () => {
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    assert.ok(bodySchema.safeParse(blocks).success, `${locale}: blocks valid`);
    const rows = blocks.filter((b) => b.type === "table")[0]?.rows ?? [];
    assert.equal(rows.length, 10, `${locale}: ten resorts`);
    for (const r of rows) {
      assert.equal(r.length, 5, `${locale}: ${r[0]} has five cells`);
      assert.match(r[4] ?? "", /25\/11\/2026, 17:26/, `${locale}: ${r[0]} source carries the read time`);
    }
    for (const name of ["Masella", "Port del Comte", "Tavascan"]) {
      const r = rows.find((x) => x[0] === name)!;
      assert.match(r[1] ?? "", NOT_ANNOUNCED, `${locale}: ${name} not announced`);
    }
    const baq = rows.find((x) => x[0] === "Baqueira Beret")!;
    assert.match(baq[1] ?? "", /Ajornada|Aplazada|Postponed/);
    assert.match(baq[2] ?? "", /24\/11/);
    const molina = rows.find((x) => x[0] === "La Molina")!;
    assert.match(molina[1] ?? "", /4 (de )?(desembre|diciembre|December)|December 2026/);
  }
});

test("ski opening table: the La Molina sentence and the official snow links", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.match(text, /(Quan obre la Molina el 2026\?|¿Cuándo abre La Molina en 2026\?|When does La Molina open in 2026\?)/, `${locale}: La Molina sentence`);
    const json = JSON.stringify(SKI.editions[locale].blocks);
    assert.ok(json.includes("meteo.cat/observacions/xema"), `${locale}: Meteocat XEMA`);
    assert.ok(json.includes("InfoGruixNEU"), `${locale}: ICGC snow page`);
  }
});

test("ski opening table: re-read weekly in December (read date at most 7 days old after 1 Dec 2026)", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.match(SKI_OPENING_READ.date, /^\d{4}-\d{2}-\d{2}$/);
  if (today >= "2026-12-01") {
    const age = (Date.parse(today) - Date.parse(SKI_OPENING_READ.date)) / 86_400_000;
    assert.ok(age <= 7, `ski opening table read ${SKI_OPENING_READ.date}, ${age} days ago: re-read each resort's calendar and bump SKI_OPENING_READ`);
  }
});
