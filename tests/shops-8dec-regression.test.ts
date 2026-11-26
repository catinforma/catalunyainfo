import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { B2_PATHS, table } from "../src/lib/content/batch02/shared.ts";
import { bodySchema, headingId, slugifyAnchor, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_SHOPS_LAST_DAY, christmasDays } from "../src/lib/content/batch02/shops-christmas.ts";
import { christmasTownRows } from "../src/lib/content/batch02/shops-christmas-towns.ts";
import { BARCELONA_DOGC_ENTRY, COUNCIL_CALENDARS, COUNCIL_CALENDARS_READ, COUNCIL_CALENDARS_REREAD_BY } from "../src/lib/content/batch02/shops-council-calendars.ts";
import { CATALONIA_DEPENDS, CATALONIA_NO_8_DEC, SHOPS_SPAIN_DECEMBER, TOWN_PAGES, townSearchHref } from "../src/lib/content/batch02/shops-spain-december.ts";
import { FIND_YOUR_TOWN, SHOPS } from "../src/lib/content/batch02/shops.ts";
import { SELECTOR_TITLE, TOWNS_NOV_DEC, closedOn } from "../src/lib/content/batch02/shops-towns-nov-dec.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasShopsCopy, christmasShopsCopyEn, councilCopy } from "../src/lib/programmatic/holidays/christmas-shops.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { hasEnglishPage } from "../src/lib/programmatic/holidays/english.ts";
import { townShopsLine, townShopsLineText } from "../src/lib/programmatic/holidays/shops-line.ts";

import { renderPages, visibleText } from "./rsc/harness.ts";

/**
 * 8 December 2026 (a Tuesday) must read the same everywhere (25 Nov 2026,
 * plan item 1): the Spain guide's Catalonia row, the Catalan guide, the town
 * search, the town pages and their translations all come from the one table
 * (shops-towns-nov-dec.ts, Resolució EMT/4342/2025) and the town snapshot.
 *
 * Matrix: Barcelona (its own list, and its council's own calendar), Sitges (the
 * default days, not in the resolution), Badalona (the 8th swapped; council
 * calendar) and, for "2027 local information pending", every town: the 2027
 * municipal lists are not in the DOGC, so 3 January 2027 stays "if the council
 * has not changed it".
 */

const D8 = "2026-12-08";
const BCN = municipalityBySlug("barcelona")!;
const BDN = municipalityBySlug("badalona")!;
const SITGES = municipalityBySlug("sitges")!;
const today = new Date().toISOString().slice(0, 10);
const windowOpen = today <= CHRISTMAS_SHOPS_LAST_DAY;

const tableOf = (locale: Locale) => (SHOPS_SPAIN_DECEMBER.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[]).find((b) => b.type === "table")!;
const cataloniaRow = (locale: Locale) => tableOf(locale).rows!.find((r) => /^(Cataluña|Catalunya|Catalonia)$/.test(r[0]!))!;

test("the matrix towns are what the test says they are", () => {
  assert.equal(BCN.shopsOwnList, true, "Barcelona is listed by name in the resolution (with the 8th)");
  assert.ok(BCN.shops.includes(D8));
  assert.equal(BDN.shopsOwnList, true);
  assert.ok(!BDN.shops.includes(D8), "Badalona swapped the 8th");
  assert.equal(SITGES.shopsOwnList, false, "Sitges is on the default days");
  assert.ok(SITGES.shops.includes(D8));
  assert.ok(!TOWNS_NOV_DEC.some((t) => t.town === "Sitges" || t.town === "Barcelona"));
  assert.deepEqual(closedOn(D8).includes("Badalona"), true);
});

test("one number on 8 December: the Spain guide, the Catalan guide, the town search and the town snapshot", () => {
  const swappedInSearch = christmasTownRows().filter((r) => r.swapped.includes(D8)).map((r) => r.name);
  assert.equal(swappedInSearch.length, CATALONIA_NO_8_DEC);
  assert.equal(CATALONIA_NO_8_DEC, closedOn(D8).length);
  const swappedInSnapshot = [BDN].filter((m) => !m.shops.includes(D8)).map((m) => m.name);
  assert.deepEqual(swappedInSnapshot, ["Badalona"]);
  for (const r of christmasTownRows()) {
    if (r.name === "Barcelona" || r.name === "Sitges") assert.ok(r.open.includes(D8), r.name);
    if (r.name === "Badalona") assert.ok(r.swapped.includes(D8));
  }
  for (const locale of LOCALES) {
    const row = cataloniaRow(locale);
    assert.ok(row[3]!.includes(CATALONIA_DEPENDS[locale]), `${locale}: the 8 December cell says it depends on the town`);
    assert.ok(row[3]!.includes(String(CATALONIA_NO_8_DEC)), `${locale}: and keeps the count as the secondary part`);
    assert.ok(!/^(Sí|Yes|No)\b/.test(row[3]!), `${locale}: the answer is not a bare yes or no`);
    // The Catalan guide's per-town table lists Badalona under the 8th and not Barcelona.
    const blocks = SHOPS.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[];
    const towns = blocks.filter((b) => b.type === "table" && b.rows!.length === TOWNS_NOV_DEC.length).flatMap((b) => b.rows!).filter((r) => /8/.test(r[1] ?? ""));
    assert.ok(towns.some((r) => r[0] === "Badalona"), `${locale}: Badalona`);
    assert.ok(!towns.some((r) => r[0] === "Barcelona"), `${locale}: Barcelona`);
  }
});

test("the Spain guide's link lands on the town search heading of the Catalan guide, in the same language", () => {
  for (const locale of LOCALES) {
    const href = townSearchHref(locale);
    assert.ok(href.startsWith(SHOPS_SPAIN_DECEMBER.editions[locale].blocks.length ? `/${locale}/` : ""), href);
    const anchor = href.split("#")[1]!;
    const headings = (SHOPS.editions[locale].blocks as Block[]).filter((b) => b.type === "heading") as Extract<Block, { type: "heading" }>[];
    assert.ok(headings.some((h) => headingId(h) === anchor), `${locale}: no heading with id ${anchor} in the Catalan guide`);
    assert.equal(anchor, slugifyAnchor(SELECTOR_TITLE[locale]));
    // The block right under that heading is the searchable table.
    const i = (SHOPS.editions[locale].blocks as Block[]).findIndex((b) => b.type === "heading" && headingId(b as never) === anchor);
    const after = (SHOPS.editions[locale].blocks as Block[]).slice(i + 1, i + 4).map((b) => b.type);
    assert.ok(after.includes("shopsChristmas" as never), `${locale}: the search follows its heading (${after.join(",")})`);
    // The guide's own summary links to the same search, on the page.
    // 27 Nov 2026: the summary's jump carries the page's own path ("(#x)" printed raw markdown).
    const jump = FIND_YOUR_TOWN[locale].match(/\((\/[^)#]+\/)#([^)]+)\)/)!;
    assert.equal(jump[1], `/${locale}/${B2_PATHS.shops[locale]}/`);
    assert.equal(jump[2], anchor);
    assert.ok(JSON.stringify(SHOPS.editions[locale].blocks.slice(0, 3)).includes(jump[2]!));
  }
});

test("town pages answer 8 December: Barcelona yes, Badalona no, Sitges yes, in ca, es and en", () => {
  for (const locale of ["ca", "es"] as const) {
    const verdict = (m: typeof BCN) => christmasShopsCopy(m, locale).rows.find((r) => r.iso === D8)!;
    assert.deepEqual([verdict(BCN).verdict, verdict(BCN).answer], ["Sí", "open"], `${locale} Barcelona`);
    assert.deepEqual([verdict(SITGES).verdict, verdict(SITGES).answer], ["Sí", "open"], `${locale} Sitges`);
    assert.deepEqual([verdict(BDN).verdict, verdict(BDN).answer], ["No", "swapped"], `${locale} Badalona`);
  }
  const en = (m: typeof BCN) => christmasShopsCopyEn(m).rows.find((r) => r.iso === D8)!;
  assert.deepEqual([en(BCN).verdict, en(BCN).answer], ["Yes", "open"]);
  assert.deepEqual([en(SITGES).verdict, en(SITGES).answer], ["Yes", "open"]);
  assert.deepEqual([en(BDN).verdict, en(BDN).answer], ["No", "swapped"]);
  // The line under the H1 reads the same rows.
  for (const locale of ["ca", "es", "en"] as const) {
    assert.match(townShopsLineText(townShopsLine(BCN, locale, "2026-12-02")!), /\b8\b/, `${locale} Barcelona line`);
    assert.match(townShopsLineText(townShopsLine(BDN, locale, "2026-12-02")!), locale === "ca" ? /no 8 des\./ : locale === "es" ? /no 8 dic\./ : /not 8 Dec/, `${locale} Badalona line`);
  }
  // Every town's days come from christmasDays: 8 Dec is "open" exactly where the resolution did not swap it.
  assert.equal(christmasDays(BDN).find((d) => d.iso === D8)!.answer, "swapped");
  assert.equal(christmasDays(BCN).find((d) => d.iso === D8)!.answer, "open");
});

test("2027 local information pending: the 3 January 2027 row says so for a listed town and a default town, in three languages", () => {
  for (const m of [BCN, BDN, SITGES]) {
    assert.equal(christmasDays(m).find((d) => d.iso === "2027-01-03")!.answer, "pending2027", m.slug);
    assert.match(christmasShopsCopy(m, "ca").rows.find((r) => r.iso === "2027-01-03")!.reason, /encara no s'ha publicat/);
    assert.match(christmasShopsCopy(m, "es").rows.find((r) => r.iso === "2027-01-03")!.reason, /aún no se ha publicado/);
    assert.match(christmasShopsCopyEn(m).rows.find((r) => r.iso === "2027-01-03")!.reason, /not out yet/);
  }
});

test("council calendars: Barcelona and Badalona are quoted as the councils print them, with the read time, in three languages", () => {
  assert.equal(councilCopy("sitges", "ca"), null, "only the two towns whose council text was read");
  assert.equal(COUNCIL_CALENDARS_READ.date, "2026-11-25");
  for (const slug of ["barcelona", "badalona"] as const) {
    const c = COUNCIL_CALENDARS[slug];
    const town = municipalityBySlug(slug)!;
    // The days the council names for December are the town's days in the snapshot (the DOGC).
    assert.deepEqual(town.shops.filter((d) => d >= "2026-12-01" && d <= "2026-12-31"), c.december2026, slug);
    for (const locale of LOCALES) {
      const copy = councilCopy(slug, locale)!;
      for (const q of c.quotes) assert.ok(copy.text.includes(`«${q}»`), `${slug} ${locale}: quote ${q.slice(0, 30)}`);
      assert.ok(copy.text.includes("16.40 h") || copy.text.includes("16:40"), `${slug} ${locale}: read time`);
      assert.ok(/25 de noviembre de 2026|25 de novembre de 2026|25 November 2026/.test(copy.text), `${slug} ${locale}: read date`);
      assert.ok(/depèn de cada establiment|depende de cada establecimiento|depend on each shop/.test(copy.text), `${slug} ${locale}: hours depend on the shop`);
      assert.equal(copy.href, c.url);
    }
  }
  assert.match(councilCopy("barcelona", "es")!.text, /8 de diciembre de 2026 es, por tanto, día de apertura autorizada/);
  assert.ok(councilCopy("barcelona", "ca")!.text.includes(BARCELONA_DOGC_ENTRY));
  assert.match(councilCopy("badalona", "ca")!.text, /El 8 de desembre no hi consta/);
  assert.match(councilCopy("badalona", "en")!.text, /names no exception by type of shop/);
  // Every council quote has its own source URL and none is the council's non-HTTPS or an aggregator.
  for (const slug of ["barcelona", "badalona"] as const) assert.match(COUNCIL_CALENDARS[slug].url, /^https:\/\/(guia\.barcelona\.cat|www\.badalona\.cat)\//);
});

test("date guard: the council pages must be read again by 3 Dec 2026 (they are what the pages quote until 8 Dec)", () => {
  assert.ok(today <= COUNCIL_CALENDARS_REREAD_BY, `re-read guia.barcelona.cat/ca/detall/_99400749658.html and the Badalona calendar page, then move COUNCIL_CALENDARS_READ and the re-read date (last read ${COUNCIL_CALENDARS_READ.date} ${COUNCIL_CALENDARS_READ.time})`);
});

test("English and Spanish town pages exist for the two named towns, so the Spain guide's paragraph does not link to a 404", () => {
  assert.ok(hasEnglishPage("barcelona") && hasEnglishPage("badalona"));
  for (const slug of ["barcelona", "badalona"] as const) {
    assert.equal(TOWN_PAGES[slug].ca, `/ca/festius/${slug}/#botigues-nadal`);
    assert.equal(TOWN_PAGES[slug].es, `/es/festivos/${slug}/#botigues-nadal`);
    assert.equal(TOWN_PAGES[slug].en, `/en/holidays/${slug}/#christmas-shops`);
  }
});

test("from the Spain guide's Catalonia row on a phone to the town's answer: link, search row, town page HTML (rendered)", { skip: !windowOpen && "the town section is gone after Reis" }, () => {
  const pages = renderPages([
    { name: "search-es", module: "@/components/blocks/ShopsChristmas", export: "ShopsChristmas", props: { locale: "es" } },
    { name: "bcn-ca", module: "@/components/programmatic/holidays/routes", export: "MunicipalityRoute", props: { locale: "ca", slug: "barcelona" } },
    { name: "bcn-es", module: "@/components/programmatic/holidays/routes", export: "MunicipalityRoute", props: { locale: "es", slug: "barcelona" } },
    { name: "bdn-ca", module: "@/components/programmatic/holidays/routes", export: "MunicipalityRoute", props: { locale: "ca", slug: "badalona" } },
    { name: "bcn-en", module: "@/components/programmatic/holidays/routes", export: "EnglishTownRoute", props: { slug: "barcelona" } },
  ]);
  const text = (name: string) => visibleText(pages.get(name)!.html);

  // 1. The row in the Spain guide: a link (a real <a>, no hover) whose target is the search heading.
  const row = cataloniaRow("es");
  const link = row[3]!.match(/^\[([^\]]+)\]\(([^)]+)\)/)!;
  assert.equal(link[1], "Depende del municipio · consulta el tuyo");
  assert.equal(link[2], townSearchHref("es"));

  // 2. The search (the block under that heading) holds a row for each town with its days; Barcelona has the 8th, Badalona does not.
  const search = pages.get("search-es")!.html;
  const rows = search.slice(search.indexOf("<tbody>"), search.indexOf("</tbody>")).split("<tr>").slice(1).map(visibleText);
  assert.ok(rows.find((r) => r.startsWith("Barcelona"))!.includes("6, 8, 13, 20 y 27 dic."));
  assert.ok(/^Badalona.*6, 13, 20 y 27 dic\./.test(rows.find((r) => r.startsWith("Badalona"))!));
  assert.ok(rows.find((r) => r.startsWith("Badalona"))!.includes("no: 8 dic."));
  assert.match(search, /type="search"/, "the search box is a search input (phone keyboard)");

  // 3. The town page HTML says it, in ca, es and en, and quotes the council.
  assert.match(text("bcn-ca"), /dimarts 8 de desembre \(la Immaculada\) Sí/);
  assert.match(text("bcn-es"), /martes 8 de diciembre \(la Inmaculada\) Sí/);
  assert.match(text("bcn-en"), /Tuesday 8 December \(Immaculate Conception\) Yes/i);
  assert.match(text("bdn-ca"), /dimarts 8 de desembre \(la Immaculada\) No\s*: l'Ajuntament el va canviar per un altre dia/);
  assert.ok(text("bcn-ca").includes("«Dies de lliure obertura dins l'horari habitual a la ciutat de Barcelona»"));
  assert.ok(text("bcn-ca").includes("L'horari efectiu depèn de cada establiment"));
  assert.ok(text("bcn-es").includes("El horario efectivo depende de cada establecimiento"));
  assert.ok(text("bcn-en").includes("Actual opening hours depend on each shop"));
  assert.ok(text("bdn-ca").includes("«Dies festius amb obertura comercial autoritzada a Badalona (2026): 4 de gener. 15 d'agost. 12 d'octubre. 29 de novembre. 6, 13, 20 i 27 de desembre.»"));
  assert.ok(text("bdn-ca").includes("a les 16.40 h"));
  assert.match(pages.get("bcn-ca")!.html, /href="https:\/\/guia\.barcelona\.cat\/ca\/detall\/_99400749658\.html"/);
  assert.match(pages.get("bdn-ca")!.html, /href="https:\/\/www\.badalona\.cat\/ca\/serveis-ajuntament\//);
});

test("tap-target links are scoped: only the Spain guide's regions table asks for the class; a generic table block does not get it", () => {
  const generic = table("Caption", ["A", "B"], [["x", "[a link](/ca/guies/x/) in a sentence"]]);
  assert.ok(!("tapLinks" in generic), "the table() helper never sets it");
  for (const locale of LOCALES) {
    const blocks = SHOPS_SPAIN_DECEMBER.editions[locale].blocks as unknown as { type: string; tapLinks?: boolean }[];
    const first = blocks.findIndex((b) => b.type === "table");
    assert.deepEqual(
      blocks.map((b) => b.type === "table" && b.tapLinks === true),
      blocks.map((_, i) => i === first),
      `${locale}: the regions table is flagged, the islands table is not`,
    );
    assert.ok(bodySchema.safeParse(blocks).success, `${locale}: the field is in the block schema`);
    assert.ok(!(SHOPS.editions[locale].blocks as unknown as { tapLinks?: boolean }[]).some((b) => b.tapLinks), `shops guide ${locale}`);
  }
  // CSS: the rule sits under the modifier, never on every table.
  const css = readFileSync(join(import.meta.dirname, "../src/app/globals.css"), "utf8");
  assert.ok(css.includes(".ci-table--taplinks tbody td a {"));
  assert.ok(!/\.ci-table tbody td a\s*\{/.test(css), "no table-wide link padding rule");
  // Rendered by the real block renderer: the generic table has no modifier class, the flagged one has it.
  const pages = renderPages([
    { name: "generic", module: "tests/rsc/pages.ts", export: "BodyBlocks", props: { locale: "es", body: [generic] } },
    { name: "spain", module: "tests/rsc/pages.ts", export: "BodyBlocks", props: { locale: "es", body: SHOPS_SPAIN_DECEMBER.editions.es.blocks.slice(0, 2) } },
  ]);
  assert.match(pages.get("generic")!.html, /<table class="ci-table" role="table">/);
  assert.doesNotMatch(pages.get("generic")!.html, /taplinks/);
  assert.match(pages.get("spain")!.html, /<table class="ci-table ci-table--taplinks" role="table">/);
  assert.match(pages.get("spain")!.html, /<a href="\/es\/guias\/tiendas-abiertas-festivos-cataluna\/#tiendas-abiertas-en-navidad-en-tu-municipio">Depende del municipio · consulta el tuyo<\/a>/);
});
