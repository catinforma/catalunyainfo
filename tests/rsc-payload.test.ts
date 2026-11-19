import assert from "node:assert/strict";
import { test } from "node:test";

import { shortDate } from "../src/lib/content/holidays/calendar.ts";
import { applyDogcCorrections, groupRows } from "../src/lib/content/holidays/local.ts";
import { compactDays } from "../src/lib/content/batch02/shops-christmas.ts";
import { christmasTownRows, townLabel } from "../src/lib/content/batch02/shops-christmas-towns.ts";
import { REGION_LABEL, euros } from "../src/lib/programmatic/average-salary/copy.ts";
import { headline } from "../src/lib/programmatic/average-salary/page.ts";
import { buildElectionPage } from "../src/lib/programmatic/elections/model.ts";
import { resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";
import { COMMUNITIES, htClientData } from "../src/lib/programmatic/home-purchase-tax/communities.ts";
import { CALC_COPY, EXAMPLE } from "../src/lib/programmatic/home-purchase-tax/copy.ts";
import { displayName } from "../src/lib/programmatic/zona-tensionada/copy.ts";
import { checkerTowns, listByCommunity, ztClientData } from "../src/lib/programmatic/zona-tensionada/data.ts";
import { SNAPSHOT } from "../src/lib/programmatic/holidays/data.ts";

import { renderPages, sizes, visibleText, type Job, type Rendered } from "./rsc/harness.ts";

/**
 * Page weight budgets, measured on the real React Flight stream (the RSC
 * payload Next inlines in every HTML page) and the HTML it renders to, with
 * Next's vendored production React (tests/rsc/harness.ts; no `next build`).
 *
 * Why: on 19 Nov 2026 nine pages served more than 500 KB of HTML, mostly
 * data serialised a second time into the RSC payload: the home-purchase tax
 * calculator got every community's rates as props (159 KB), and the big
 * tables (1,400 local holidays, 947 towns' shop days, 1,300 salary figures,
 * Barcelona's 299 polling places) travelled as HTML and again element by
 * element. ~63 % of readers are on phones, and on election or lottery night
 * the origin serves ~65 pages/s. Now the calculators fetch their data on the
 * first interaction (/data/*.json) and the tables render from compact props
 * (components/blocks/PlaceRows.tsx and friends), with the same HTML.
 *
 * Sizes are of the page's own content: the site header and footer (the same
 * on every page, ~45 KB of payload) are left out. Budgets have ~10-25 %
 * headroom over the size measured when they were set; a page that grows past
 * one should move data out of client props or out of server-element rows, not
 * raise the number. Each family also checks, from its own data, that the
 * HTML still holds every row a reader and a crawler need.
 */

const KB = 1024;

const JOBS: Job[] = [
  { name: "home-tax", module: "@/components/programmatic/home-purchase-tax/HomeTaxPage", export: "HomeTaxRoute", props: { locale: "es" } },
  { name: "salary", module: "@/components/programmatic/average-salary/AverageSalaryPage", export: "AverageSalaryRoute", props: { locale: "es" } },
  { name: "zona", module: "@/components/programmatic/zona-tensionada/ZonaTensionadaPage", export: "ZonaTensionadaRoute", props: { locale: "es" } },
  { name: "local-holidays", module: "@/components/blocks/LocalHolidays", export: "LocalHolidays", props: { locale: "es" }, setup: "tests/rsc/fixtures/local-holidays-fetch.ts" },
  { name: "shops", module: "@/components/blocks/ShopsChristmas", export: "ShopsChristmas", props: { locale: "es" } },
  { name: "town-holidays", module: "@/components/programmatic/holidays/routes", export: "MunicipalityRoute", props: { locale: "es", slug: "barcelona" } },
  { name: "election-town", module: "tests/rsc/pages.ts", export: "ElectionTown", props: { locale: "es", slug: "barcelona" } },
];

/** RSC payload (as inlined) and page HTML budgets, in bytes; largest client props allowed. Measured 19 Nov 2026 (before → after the fix). */
const BUDGET: Record<string, { rsc: number; html: number; props: number }> = {
  // 503 → 335 KB: the law's quotes (~145 KB, in <details>) stay server-rendered.
  "home-tax": { rsc: 370 * KB, html: 270 * KB, props: 10 * KB },
  // 365 → 150 KB.
  salary: { rsc: 175 * KB, html: 230 * KB, props: 32 * KB },
  // 288 → 176 KB.
  zona: { rsc: 200 * KB, html: 130 * KB, props: 20 * KB },
  // The table block alone: 290 → 42 KB (fixture: 1,295 places; the open data has ~1,400).
  "local-holidays": { rsc: 60 * KB, html: 150 * KB, props: 48 * KB },
  // The table block alone: 188 → 23 KB.
  shops: { rsc: 35 * KB, html: 85 * KB, props: 25 * KB },
  // Barcelona, the largest town: 64 KB (unchanged, already light).
  "town-holidays": { rsc: 80 * KB, html: 55 * KB, props: 8 * KB },
  // Barcelona, the largest town (299 polling places): 217 → 144 KB.
  "election-town": { rsc: 165 * KB, html: 135 * KB, props: 40 * KB },
};

const pages: Map<string, Rendered> = renderPages(JOBS);
const page = (name: string) => pages.get(name)!;
const text = (name: string) => visibleText(page(name).html);
const kb = (n: number) => `${(n / KB).toFixed(1)} KB`;

for (const job of JOBS) {
  test(`${job.name}: RSC payload, HTML and client props within budget`, () => {
    const s = sizes(page(job.name));
    const b = BUDGET[job.name]!;
    assert.ok(s.rsc <= b.rsc, `RSC payload ${kb(s.rsc)} > ${kb(b.rsc)}`);
    assert.ok(s.html <= b.html, `HTML ${kb(s.html)} > ${kb(b.html)}`);
    for (const [name, bytes] of Object.entries(s.props)) assert.ok(bytes <= b.props, `${name} gets ${kb(bytes)} of props > ${kb(b.props)}`);
  });
}

test("home-purchase tax: every table row, every law quote and the example are in the HTML; the rates are a fetch away", () => {
  const html = page("home-tax").html;
  const t = text("home-tax");
  for (const c of COMMUNITIES) {
    assert.ok(html.includes(`id="itp-${c.id}"`), `ITP row ${c.id}`);
    assert.ok(html.includes(`id="ajd-${c.id}"`), `AJD row ${c.id}`);
    assert.ok(html.includes(`<option value="${c.id}"`), `option ${c.id}`);
    // The words of each law stay in the server HTML (collapsed in <details>).
    for (const q of [c.itp?.quote, c.ajd?.quote, ...c.benefits.map((b) => b.quote)]) if (q) assert.ok(t.includes(q.replace(/\s+/g, " ").trim()), `${c.id} quote: ${q.slice(0, 50)}`);
  }
  assert.ok(t.includes(CALC_COPY.es.example), "the calculator's server-rendered example");
  assert.ok(t.includes("25.000,00 €"), "the example's ITP");
  assert.match(html, /application\/ld\+json/);
  // The browser gets the full data from /data/impuestos-compra-vivienda.json, not from the payload.
  // A condition only the calculator prints (a benefit's "extra" of a community other than the example's) is not in the payload.
  const extra = COMMUNITIES.flatMap((c) => (c.id === EXAMPLE.community ? [] : c.benefits.flatMap((b) => (b.extra ? [b.extra.es] : [])))).find((x) => x.length > 40 && !t.includes(x));
  assert.ok(extra, "a condition only the calculator prints");
  assert.ok(!page("home-tax").flight.includes(extra), "another community's conditions in the payload");
  assert.ok(JSON.stringify(htClientData()).length < 200 * KB);
});

test("salary: every region and the national mean are in the HTML, all INE tables complete", () => {
  const t = text("salary");
  const html = page("salary").html;
  for (const [id, label] of Object.entries(REGION_LABEL)) if (id !== "es") assert.ok(t.includes(label.es), label.es);
  assert.ok(t.includes(euros(headline().mean, "es")), "Spain's mean salary");
  assert.ok((html.match(/<td data-label="/g) ?? []).length >= 1000, "the INE tables' cells");
  assert.match(html, /application\/ld\+json/);
});

test("zona tensionada: the example answer and the full list by community are in the HTML; the towns are a fetch away", () => {
  const t = text("zona");
  assert.ok(t.includes(displayName("Barcelona")));
  for (const c of listByCommunity()) for (const g of c.groups) for (const town of g.towns) assert.ok(t.includes(displayName(town.name)), town.name);
  // A town that is in the checker's list and nowhere on the page must not be in the payload either.
  const hidden = checkerTowns().find((x) => x.zones.length === 0 && x.name.length > 6 && !t.includes(x.name));
  assert.ok(hidden, "a town only the checker knows");
  assert.ok(!page("zona").flight.includes(hidden.name), `${hidden.name} in the payload`);
  assert.ok(JSON.stringify(ztClientData()).length < 160 * KB);
});

test("local holidays: one row per place, each with its name and dates", () => {
  const html = page("local-holidays").html;
  // The same places the fixture feeds the block (tests/rsc/fixtures/local-holidays-fetch.ts).
  const rows = SNAPSHOT.municipalities.flatMap((m) => [
    ...m.local.map((d) => ({ data: d, ajuntament_o_nucli_municipal: m.dogcName, codi_municipal: `${m.ine}000`, pedania: "000" })),
    ...m.nuclei.flatMap((n, i) => n.dates.map((d) => ({ data: d, ajuntament_o_nucli_municipal: n.name, codi_municipal: `${m.ine}${String(i + 1).padStart(3, "0")}`, pedania: String(i + 1).padStart(3, "0") }))),
  ]);
  const places = applyDogcCorrections(groupRows(rows), SNAPSHOT.year);
  const tbody = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"));
  const trs = tbody.split("<tr>").slice(1);
  assert.equal(trs.length, places.length);
  places.forEach((p, i) => {
    const row = visibleText(trs[i]!);
    assert.ok(row.startsWith(p.name), `${p.name}: ${row}`);
    for (const d of p.dates) assert.ok(row.includes(`${shortDate(d, "es")} (`), `${p.name} ${d}`);
  });
});

test("shops at Christmas: one row per town, each with its opening days", () => {
  const html = page("shops").html;
  const towns = christmasTownRows();
  const trs = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>")).split("<tr>").slice(1);
  assert.equal(trs.length, towns.length);
  towns.forEach((r, i) => {
    const row = visibleText(trs[i]!);
    assert.ok(row.startsWith(townLabel(r.name, "es")), r.name);
    assert.ok(row.includes(compactDays(r.open, "es")), `${r.name} open`);
    if (r.swapped.length) assert.ok(row.includes(compactDays(r.swapped, "es")), `${r.name} swapped`);
  });
});

test("election town: every polling place of Barcelona, with its address and lines, is in the HTML", () => {
  const m = resolveElectionPage("es", "es", "barcelona")!;
  const polling = buildElectionPage(m, "es").polling;
  const t = text("election-town");
  const places = (polling.groups ?? []).flatMap((g) => g.places);
  assert.ok(places.length > 250);
  for (const p of places) for (const s of [p.name, p.address, ...p.lines]) assert.ok(t.includes(s.replace(/\s+/g, " ").trim()), s);
  assert.equal((page("election-town").html.match(/<li class="!mt-0"><strong>/g) ?? []).length, places.length);
  assert.match(page("election-town").html, /application\/ld\+json/);
});

test("town holidays: Barcelona's page renders with its JSON-LD", () => {
  assert.ok(text("town-holidays").includes("Barcelona"));
  assert.match(page("town-holidays").html, /application\/ld\+json/);
});
