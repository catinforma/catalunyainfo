import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { COPY, buildBody } from "../src/lib/content/reservoirs/publish.ts";
import {
  REFERENCE_CAPACITY,
  buildReport,
  isClean,
  parseRows,
  splitStation,
} from "../src/lib/content/reservoirs/levels.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

// Real rows from gn9e-3qhr. 30 Sep 2026 is one of the many days whose decimal
// separator was lost: Sau "68.3 / 113.25" arrives as "683" / "11325".
const CLEAN_07 = [
  ["Embassament de Foix (Castellet i la Gornal)", "69.8", "2.35"],
  ["Embassament de la Baells (Cercs)", "71.5", "77.75"],
  ["Embassament de Sau (Vilanova de Sau)", "69.8", "115.76"],
  ["Embassament de Darnius Boadella (Darnius)", "60.5", "38.28"],
  ["Embassament de Susqueda (Osor)", "82.7", "184.82"],
  ["Embassament de Sant Ponç (Clariana de Cardener)", "82.0", "20.02"],
  ["Embassament de la Llosa del Cavall (Navès)", "83.7", "59.9"],
  ["Embassament de Siurana (Cornudella de Montsant)", "71.6", "8.6"],
  ["Embassament de Riudecanyes", "28.3", "1.51"],
];
const CLEAN_01 = [
  ["Embassament de Foix (Castellet i la Gornal)", "65.4", "2.2"],
  ["Embassament de la Baells (Cercs)", "71.2", "77.39"],
  ["Embassament de Sau (Vilanova de Sau)", "68.2", "113.02"],
  ["Embassament de Darnius Boadella (Darnius)", "59.7", "37.78"],
  ["Embassament de Susqueda (Osor)", "82.5", "184.35"],
  ["Embassament de Sant Ponç (Clariana de Cardener)", "79.6", "19.43"],
  ["Embassament de la Llosa del Cavall (Navès)", "84.1", "60.21"],
  ["Embassament de Siurana (Cornudella de Montsant)", "71.7", "8.62"],
  ["Embassament de Riudecanyes", "28.9", "1.54"],
];
const DAMAGED_30 = [
  ["Embassament de Sau (Vilanova de Sau)", "683", "11325"],
  ["Embassament de Siurana (Cornudella de Montsant)", "718", "862"],
];

const rows = (date: string, data: string[][]) =>
  data.map(([estaci, pct, vol]) => ({
    dia: `${date}T00:00:00.000`,
    estaci,
    percentatge_volum_embassat: pct,
    volum_embassat: vol,
  }));

test("station names lose the prefix and keep the Catalan article", () => {
  assert.deepEqual(splitStation("Embassament de la Llosa del Cavall (Navès)"), {
    name: "la Llosa del Cavall",
    place: "Navès",
  });
  assert.deepEqual(splitStation("Embassament de Riudecanyes"), { name: "Riudecanyes", place: null });
  for (const [station] of CLEAN_07) {
    assert.ok(splitStation(station!).name in REFERENCE_CAPACITY, station);
  }
});

test("rows that lost their decimal separator are rejected", () => {
  for (const row of parseRows(rows("2026-09-30", DAMAGED_30))) assert.equal(isClean(row), false, row.name);
  for (const row of parseRows(rows("2026-10-07", CLEAN_07))) assert.equal(isClean(row), true, row.name);
});

test("the report reproduces the ACA figures and compares with a clean day", () => {
  const report = buildReport(
    parseRows([...rows("2026-10-07", CLEAN_07), ...rows("2026-10-01", CLEAN_01), ...rows("2026-09-30", DAMAGED_30)]),
  );
  assert.equal(report.error, null);
  assert.equal(report.date, "2026-10-07");
  assert.equal(report.compareDate, "2026-10-01");
  assert.equal(report.reservoirs.length, 9);
  assert.equal(report.reservoirs[0]!.name, "Susqueda");
  assert.equal(Math.round(report.total.volume * 100) / 100, 508.99);
  assert.equal(report.total.percent.toFixed(1), "75.1");
  assert.equal(report.terLlobregat.percent.toFixed(1), "77.1");
  assert.equal(report.reservoirs.find((r) => r.name === "Sau")!.change!.toFixed(1), "1.6");
});

test("a damaged latest day falls back to the last clean one, never shows bad figures", () => {
  const report = buildReport(parseRows([...rows("2026-10-01", CLEAN_01), ...rows("2026-10-07", DAMAGED_30)]));
  assert.equal(report.date, "2026-10-01");
  assert.ok(report.reservoirs.every((r) => r.percent <= 100));
  assert.equal(report.compareDate, null);
});

test("no clean day is an error, not an empty success", () => {
  const report = buildReport(parseRows(rows("2026-09-30", DAMAGED_30)));
  assert.notEqual(report.error, null);
});

test("every edition validates, puts the figure before the explanation and has a photo", () => {
  const keys = new Set(IMAGES.map((image) => image.key));
  assert.ok(keys.has("embassaments-sau-cingles-tavertet"));
  assert.ok(keys.has("embassaments-presa-sau-tavertet"));
  for (const locale of LOCALES) {
    const body = buildBody(locale, "00000000-0000-4000-8000-000000000000");
    bodySchema.parse(body);
    const figure = body.findIndex((b) => b.type === "reservoirLevels");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(figure >= 0 && figure < heading, locale);
    assert.ok(body.some((b) => b.type === "image"), locale);
    assert.ok(!/\d{4}/.test(COPY[locale].path), `${locale}: no year in the slug`);
    assert.ok(COPY[locale].seoTitle.length <= 60, `${locale}: title budget`);
  }
});
