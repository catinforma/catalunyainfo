import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { applyDogcCorrections, groupRows, placesWithHolidayOn } from "../src/lib/content/holidays/local.ts";
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

test("the DOGC corrections the open data never applied win (Ordre EMT/3/2026, Gallifa)", () => {
  const rows = [
    { data: "2026-05-25T00:00:00.000", ajuntament_o_nucli_municipal: "Sant Joan Despí", codi_municipal: "08217", pedania: "000" },
    { data: "2026-09-29T00:00:00.000", ajuntament_o_nucli_municipal: "Sant Joan Despí", codi_municipal: "08217", pedania: "000" },
    { data: "2026-09-14T00:00:00.000", ajuntament_o_nucli_municipal: "Castelldefels", codi_municipal: "08056", pedania: "000" },
    { data: "2026-12-07T00:00:00.000", ajuntament_o_nucli_municipal: "Castelldefels", codi_municipal: "08056", pedania: "000" },
    { data: "2026-05-25T00:00:00.000", ajuntament_o_nucli_municipal: "Barcelona", codi_municipal: "08019", pedania: "000" },
  ];
  const places = applyDogcCorrections(groupRows(rows), 2026);
  const byName = new Map(places.map((p) => [p.name, p.dates]));
  assert.deepEqual(byName.get("Sant Joan Despí"), ["2026-05-25", "2026-09-24"]);
  assert.deepEqual(byName.get("Castelldefels"), ["2026-08-14", "2026-12-07"]);
  assert.deepEqual(byName.get("Gallifa"), ["2026-04-02", "2026-12-07"]);
  assert.deepEqual(byName.get("Barcelona"), ["2026-05-25"]);
  // Another year is left exactly as the source gives it.
  assert.deepEqual(applyDogcCorrections(groupRows(rows), 2027).map((p) => p.name).sort(), ["Barcelona", "Castelldefels", "Sant Joan Despí"]);
  // An unreachable source stays an honest empty list, not a list of corrections.
  assert.deepEqual(applyDogcCorrections([], 2026), []);
});

/**
 * 30 Oct 2026 (top-3 push): the ES page had 359 impressions at 5.7 and 0.8 %
 * CTR. The snippet now promises the search and the town pages, the lead links
 * the 300 town pages and the hub, and the busiest days left in the year come
 * from the same DOGC snapshot as the date pages, with a link to each.
 */
test("ca/es: snippet promises the search, lead links the town pages, counts match the snapshot", async () => {
  const { SNAPSHOT } = await import("../src/lib/programmatic/holidays/data.ts");
  const hub = { ca: "(/ca/festius/)", es: "(/es/festivos/)" };
  const nov11 = { ca: "/ca/festius/dia/11-novembre-2026/", es: "/es/festivos/dia/11-noviembre-2026/" };
  for (const locale of ["ca", "es"] as const) {
    const copy = COPY[locale];
    assert.ok(copy.seoTitle.length <= 60 && copy.seoDescription.length <= 155, copy.seoDescription);
    assert.match(copy.seoTitle, /2026 p[eo]r municipi/);
    const body = buildBody(locale);
    const lead = JSON.stringify(body[0]);
    assert.ok(lead.includes(hub[locale]), `${locale}: hub link in the lead`);
    assert.ok(lead.includes(String(SNAPSHOT.municipalities.length)), `${locale}: town-page count from the snapshot`);
    assert.match(lead, /\(\/(ca\/festius|es\/festivos)\/barcelona\/\)/, `${locale}: links Barcelona's page`);
    const upcoming = JSON.stringify(body[1]);
    assert.ok(upcoming.includes(nov11[locale]), `${locale}: 11 Nov date page`);
    assert.ok(upcoming.includes(`en ${SNAPSHOT.localByDate["2026-11-11"]!.length} `), `${locale}: 11 Nov count from the snapshot`);
    assert.doesNotMatch(upcoming, /\{[np]:/, `${locale}: unfilled placeholder`);
  }
  assert.ok(JSON.stringify(buildBody("en")[1]).includes("/en/holidays/day/7-december-2026/"));
});
