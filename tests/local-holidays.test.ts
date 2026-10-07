import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { groupRows, placesWithHolidayOn } from "../src/lib/content/holidays/local.ts";
import { COPY, buildBody } from "../src/lib/content/holidays/local-publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

const ROWS = [
  { data: "2026-10-02T00:00:00.000", ajuntament_o_nucli_municipal: "Abella de la Conca", codi_municipal: "25001000", pedania: "000" },
  { data: "2026-05-25T00:00:00.000", ajuntament_o_nucli_municipal: "Abella de la Conca", codi_municipal: "25001000", pedania: "000" },
  { data: "2026-05-25T00:00:00.000", ajuntament_o_nucli_municipal: "Abrera", codi_municipal: "08001000", pedania: "000" },
  { data: "2026-08-16T00:00:00.000", ajuntament_o_nucli_municipal: "Un nucli", codi_municipal: "08001002", pedania: "002" },
  { data: "not a date", ajuntament_o_nucli_municipal: "Broken", codi_municipal: "1", pedania: "000" },
];

test("rows group by place with sorted, unique dates", () => {
  const places = groupRows([...ROWS, ROWS[0]!]);
  const abella = places.find((p) => p.name === "Abella de la Conca");
  assert.deepEqual(abella?.dates, ["2026-05-25", "2026-10-02"]);
});

test("a nucleus is kept apart and marked, never merged into its municipality", () => {
  const places = groupRows(ROWS);
  const nucleus = places.find((p) => p.key === "08001002");
  assert.equal(nucleus?.isNucleus, true);
  assert.equal(places.find((p) => p.key === "08001000")?.dates.includes("2026-08-16"), false);
});

test("malformed rows are dropped", () => {
  assert.equal(groupRows(ROWS).some((p) => p.name === "Broken"), false);
});

test("places are found by date", () => {
  const calendar = { year: 2026, places: groupRows(ROWS), error: null };
  assert.deepEqual(
    placesWithHolidayOn(calendar, "2026-05-25").map((p) => p.name).sort(),
    ["Abella de la Conca", "Abrera"],
  );
});

for (const locale of LOCALES) {
  test(`${locale}: the page validates and leads with the table`, () => {
    const body = buildBody(locale);
    assert.ok(bodySchema.safeParse(body).success);
    const table = body.findIndex((b) => b.type === "localHolidays");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(table >= 0 && table < heading);
    assert.ok(!/\d{4}/.test(COPY[locale].path), "evergreen URL");
    assert.ok(COPY[locale].seoTitle.length <= 60);
  });
}

import { displayName } from "../src/lib/content/holidays/local.ts";

test("gazetteer-style names get their article back in front", () => {
  assert.equal(displayName("Guàrdia, la"), "la Guàrdia");
  assert.equal(displayName("Masies de Voltregà, les"), "les Masies de Voltregà");
  assert.equal(displayName("Espluga de Francolí, l'"), "l'Espluga de Francolí");
  assert.equal(displayName("Abrera"), "Abrera");
});
