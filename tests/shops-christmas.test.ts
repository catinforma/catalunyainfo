import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { blockSchema, bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { SHOPS, SHOPS_META, NEXT_WEEKS, TOWNS_NOV_DEC } from "../src/lib/content/batch02/shops.ts";
import {
  CHRISTMAS_SHOPS_CHECKED,
  CHRISTMAS_SHOPS_LAST_DAY,
  CHRISTMAS_SHOPS_STALE_FROM,
  CHRISTMAS_SOURCES,
  DEFAULT_DECEMBER_2026,
  WINDOW_2026,
  christmasDays,
  compactDays,
  windowDays,
} from "../src/lib/content/batch02/shops-christmas.ts";
import { RESOLUTION_COUNCILS, christmasTownRows } from "../src/lib/content/batch02/shops-christmas-towns.ts";
import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { christmasShopsCopy, showChristmasShops } from "../src/lib/programmatic/holidays/christmas-shops.ts";
import { SNAPSHOT, municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { nameKey, parseShopResolution } from "../src/lib/programmatic/holidays/dogc.ts";

/**
 * Shops at Christmas 2026 (5 Nov 2026): the shops guide's December block,
 * its per-town table (`shopsChristmas`) and the "Obertura comercial a Nadal"
 * section of the town holiday pages. Every date comes from the DOGC
 * resolution (the fixture is its official text), Ordre EMT/77/2025's
 * defaults, Llei 18/2017 art. 36.2.d or Ordre EMT/89/2026.
 */

const LOCALES = ["ca", "es", "en"] as const;
const RESOLUTION = parseShopResolution(readFileSync(join(import.meta.dirname, "fixtures/holidays/resolucio-emt-4342-2025.txt"), "utf8"));
const inWindow = (d: string) => d >= WINDOW_2026.from && d <= WINDOW_2026.to;

/**
 * The page answers "can shops open over Christmas 2026" and gives 3 and 10
 * January 2027 as pending. From 1 January 2027 the 2027 municipal list
 * (DOGC, expected late November 2026) must have been read and these pages
 * moved to it or retired: this test fails until then.
 */
test("staleness: the Christmas 2026 shop calendar must be re-read by 1 January 2027", () => {
  assert.equal(CHRISTMAS_SHOPS_STALE_FROM, "2027-01-01");
  assert.ok(
    todayInCatalonia() < CHRISTMAS_SHOPS_STALE_FROM,
    "Read the DOGC list of 2027 municipal opening days (and Barcelona's), update shops.ts / shops-christmas.ts and the town section, then move CHRISTMAS_SHOPS_STALE_FROM.",
  );
});

test("every source is official, https, and carries a check date no later than today", () => {
  const today = todayInCatalonia();
  for (const [key, source] of Object.entries(CHRISTMAS_SOURCES)) {
    assert.match(source.url, /^https:\/\/(dogc\.gencat\.cat|www\.boe\.es|ajuntament\.barcelona\.cat)\//, key);
    assert.match(source.checked, /^\d{4}-\d{2}-\d{2}$/, key);
    assert.ok(source.checked <= today, `${key}: checked in the future`);
    assert.ok(source.checked >= "2026-11-05", `${key}: older than the 5 Nov 2026 re-read`);
  }
  assert.equal(SHOPS.verifiedAt, CHRISTMAS_SHOPS_CHECKED);
});

test("every row of the December table names its sources, and its basis cites one of them", () => {
  assert.equal(NEXT_WEEKS.length, 13);
  for (const row of NEXT_WEEKS) {
    assert.ok(row.sources.length > 0, row.day.en);
    for (const key of row.sources) assert.ok(CHRISTMAS_SOURCES[key], `${row.day.en}: unknown source ${key}`);
    const ids = row.sources.map((key) => /(?:EMT\/\d+\/\d{4}|18\/2017)/.exec(CHRISTMAS_SOURCES[key].name)?.[0]).filter(Boolean) as string[];
    assert.ok(ids.some((id) => row.basis.ca.includes(id)), `${row.day.en}: basis "${row.basis.ca}" cites none of ${ids.join(", ")}`);
  }
  // The 29N row is kept, first; then December; the November Sundays are a sentence.
  assert.match(NEXT_WEEKS[0]!.day.ca, /^Diumenge 29 de novembre \(eleccions generals\)$/);
  assert.ok(NEXT_WEEKS.every((row) => !/de novembre/.test(row.day.ca) || /29 de novembre/.test(row.day.ca)));
});

test("guide: the December block comes first; titles, descriptions and H1s are unchanged", () => {
  // Titles and descriptions: 3 Nov 2026 through the 5 Nov body-only change,
  // then retitled 11 Nov 2026 (CTR retitles, docs/SEO_EXPERIMENTS.md).
  assert.equal(SHOPS_META.ca.seoTitle, "Botigues obertes diumenges i festius a Barcelona, dia a dia");
  assert.equal(SHOPS_META.es.seoTitle, "Tiendas abiertas domingo y festivos Barcelona: fecha a fecha");
  assert.equal(SHOPS_META.ca.title, "Botigues obertes en diumenges i festius a Catalunya: calendari 2026 i 2027");
  assert.equal(SHOPS_META.es.title, "Tiendas abiertas en domingos y festivos en Cataluña: calendario 2026 y 2027");
  assert.equal(
    SHOPS_META.ca.seoDescription,
    "Diumenge 29 de novembre (eleccions) i 6, 8, 13, 20 i 27 de desembre: poden obrir; 25 i 26, no. Taula dia a dia i els 30 municipis que canvien.",
  );
  assert.equal(
    SHOPS_META.es.seoDescription,
    "Domingo 29 de noviembre (elecciones) y 6, 8, 13, 20 y 27 de diciembre: pueden abrir; 25 y 26, no. Tabla fecha a fecha y los 30 municipios que cambian.",
  );
  const firstH2: Record<string, RegExp> = { ca: /Nadal/, es: /Navidad/, en: /Christmas/ };
  for (const locale of LOCALES) {
    const blocks = SHOPS.editions[locale].blocks;
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    const lead = blocks[0] as { type: string; text: string };
    assert.match(lead.text, /^\*\*(Al desembre|En diciembre|In December)/, `${locale}: lead opens with December`);
    const h2 = blocks.filter((b) => b.type === "heading") as { text: string }[];
    assert.match(h2[0]!.text, firstH2[locale]!, `${locale}: first section`);
    assert.match(h2[1]!.text, firstH2[locale]!, `${locale}: second section (your town)`);
    const town = blocks.findIndex((b) => b.type === "shopsChristmas");
    const election = blocks.findIndex((b) => b.type === "heading" && /eleccions|elecciones|election/.test((b as { text: string }).text));
    assert.ok(town > 0 && town < election, `${locale}: per-town table before the election section`);
    const text = bodyToPlainText(blocks);
    assert.match(text, /8, 15 (i|y|and) 22/, `${locale}: November Sundays answered`);
    // 26 December 2026 is a regional holiday in Catalonia and the Balearic Islands (BOE-A-2025-21667).
    assert.doesNotMatch(text, /(només|solo|only) (a|en|in) (Catalunya|Cataluña|Catalonia)/i, `${locale}: no Catalonia-only claim`);
  }
  assert.ok(SHOPS.sources.some((s) => s.url.includes("BOE-A-2025-21667")), "Balearic claim sourced");
  assert.ok(blockSchema.safeParse({ type: "shopsChristmas" }).success);
});

test("per-town table: all 947 municipalities, each with the DOGC resolution's days or its defaults", () => {
  const rows = christmasTownRows();
  assert.equal(rows.length, 947);
  assert.equal(new Set(rows.map((r) => nameKey(r.name))).size, 947, "names are unique");
  assert.equal(RESOLUTION.councils.length, RESOLUTION_COUNCILS);
  assert.deepEqual(RESOLUTION.defaults.filter(inWindow), [...DEFAULT_DECEMBER_2026]);
  const dogcNames = new Map(SNAPSHOT.municipalities.map((m) => [nameKey(m.name), nameKey(m.dogcName)]));
  const matched = new Set<string>();
  for (const row of rows) {
    const keys = [nameKey(row.name), dogcNames.get(nameKey(row.name))].filter(Boolean);
    const council = RESOLUTION.councils.find((c) => keys.includes(nameKey(c.name)));
    if (council) matched.add(council.name);
    const expected = windowDays(council ? council.dates : RESOLUTION.defaults);
    assert.deepEqual({ open: row.open, swapped: row.swapped }, expected, row.name);
  }
  assert.equal(matched.size, RESOLUTION.councils.length, "every council of the resolution is a row");
  // The ones the guide names.
  const get = (name: string) => rows.find((r) => r.name === name)!;
  assert.deepEqual(get("Barcelona").swapped, []);
  assert.deepEqual(get("Badalona").swapped, ["2026-12-08"]);
  assert.deepEqual(get("Terrassa").swapped, ["2026-12-06"]);
  assert.deepEqual(get("Gironella").swapped, ["2026-11-29", "2026-12-27"]);
  assert.ok(get("Sant Boi de Llobregat").open.includes("2026-12-07"));
  assert.equal(compactDays(get("Barcelona").open, "ca"), "29 nov. · 6, 8, 13, 20 i 27 des.");
  assert.equal(compactDays(get("Olot").open, "es"), "29 nov. · 6, 8, 20 y 27 dic.");
  // TOWNS_NOV_DEC (the guide's 30-town table) and the per-town table agree.
  for (const t of TOWNS_NOV_DEC) {
    const row = rows.find((r) => nameKey(r.name) === nameKey(t.town));
    assert.ok(row, t.town);
    assert.deepEqual(row!.swapped, t.closed.filter(inWindow), t.town);
  }
});

test("town pages: the snapshot's shop days give the same December as the per-town table", () => {
  const rows = new Map(christmasTownRows().map((r) => [r.name, r]));
  for (const m of SNAPSHOT.municipalities) {
    const row = rows.get(m.name)!;
    assert.deepEqual(windowDays(m.shops), { open: row.open, swapped: row.swapped }, m.name);
  }
});

test("town section: one row per Sunday and holiday to Reis, each with a source and the right answer", () => {
  const answer = (slug: string, iso: string) => christmasDays(municipalityBySlug(slug)!).find((d) => d.iso === iso);
  for (const m of SNAPSHOT.municipalities) {
    const days = christmasDays(m);
    for (const d of days) assert.ok(CHRISTMAS_SOURCES[d.source], `${m.name} ${d.iso}`);
    for (const iso of ["2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06"]) assert.equal(days.find((d) => d.iso === iso)?.answer, "lawClosed", `${m.name} ${iso}`);
    assert.equal(days.find((d) => d.iso === "2027-01-03")?.answer, "pending2027", m.name);
    assert.ok(days.every((d) => d.iso >= "2026-12-01" && d.iso <= CHRISTMAS_SHOPS_LAST_DAY), m.name);
  }
  assert.equal(answer("barcelona", "2026-12-08")?.answer, "open");
  assert.equal(answer("badalona", "2026-12-08")?.answer, "swapped");
  assert.equal(answer("terrassa", "2026-12-06")?.answer, "swapped");
  assert.equal(answer("olot", "2026-12-13")?.answer, "swapped");
  assert.deepEqual(answer("castelldefels", "2026-12-07"), { iso: "2026-12-07", answer: "localClosed", local: true, source: "order2026" });
  assert.deepEqual(answer("sant-boi-de-llobregat", "2026-12-07"), { iso: "2026-12-07", answer: "open", local: true, source: "resolution2026" });
  assert.equal(answer("centelles", "2026-12-31")?.answer, "open");
  assert.equal(answer("la-vajol", "2026-12-24")?.answer, "localClosed");
});

test("town section words: Obertura comercial a Nadal, the swapped days, Aran and Barcelona's tourist zone", () => {
  const bcn = christmasShopsCopy(municipalityBySlug("barcelona")!, "ca");
  assert.equal(bcn.title, "Obertura comercial a Nadal a Barcelona");
  assert.match(bcn.lead, /els dies 6, 8, 13, 20 i 27 de desembre/);
  assert.match(bcn.after, /ZGAT\) només amplia l'obertura del 15 de maig al 15 de setembre/);
  assert.match(bcn.after, /El 24 i el 31 de desembre són laborables/);
  const badalona = christmasShopsCopy(municipalityBySlug("badalona")!, "es");
  assert.equal(badalona.title, "Apertura comercial en Navidad en Badalona");
  assert.match(badalona.lead, /los días 6, 13, 20 y 27 de diciembre\. El martes 8 de diciembre, no/);
  assert.match(badalona.after, /declarados turísticos/);
  const hospitalet = christmasShopsCopy(municipalityBySlug("l-hospitalet-de-llobregat")!, "ca");
  assert.equal(hospitalet.title, "Obertura comercial a Nadal a l'Hospitalet de Llobregat");
  const vielha = christmasShopsCopy(municipalityBySlug("vielha-e-mijaran")!, "ca");
  assert.match(vielha.rows.find((r) => r.iso === "2026-12-26")!.reason, /a l'Aran no és festiu/);
  const vajol = christmasShopsCopy(municipalityBySlug("la-vajol")!, "ca");
  assert.doesNotMatch(vajol.after, /laborable/, "24 and 31 Dec are local holidays in la Vajol");
  for (const locale of ["ca", "es"] as const) {
    const t = christmasShopsCopy(municipalityBySlug("girona")!, locale);
    assert.match(t.source, /5 de (novembre|noviembre) de 2026/);
    assert.ok(t.rows.every((r) => r.verdict === "Sí" || r.verdict === "No"));
  }
  assert.ok(showChristmasShops("2027-01-06"));
  assert.ok(!showChristmasShops("2027-01-07"));
});

test("town page renderer: the section is one line, after the shops section, and the H1 is untouched", () => {
  const page = readFileSync(join(import.meta.dirname, "../src/components/programmatic/holidays/MunicipalityPage.tsx"), "utf8");
  assert.equal(page.match(/<ChristmasShops m=\{m\} locale=\{locale\} \/>/g)?.length, 1);
  assert.ok(page.indexOf("<ChristmasShops") > page.indexOf('<h2 id="botigues">'), "after the shops section");
  assert.match(page, /<h1 className="ci-measure">\{municipalityH1\(m, locale\)\}<\/h1>/);
});
