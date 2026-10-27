import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HOLIDAYS_BY_YEAR, longDate as calendarLongDate } from "../src/lib/content/holidays/calendar.ts";
import { COPY as LOCAL_COPY } from "../src/lib/content/holidays/local-publish.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";
import {
  dateQuestion,
  hubCopy,
  municipalityCopy,
  municipalityDescription,
  municipalityH1,
  municipalityTitle,
} from "../src/lib/programmatic/holidays/copy.ts";
import { NEXT, SNAPSHOT, YEAR, byComarca, regionalDays, siblings, statusDays, yearRows } from "../src/lib/programmatic/holidays/data.ts";
import { dateContent } from "../src/lib/programmatic/holidays/dates.ts";
import {
  articleFirst,
  nameKey,
  parseAmendments,
  parseLocalOrder,
  parseRegionalOrder,
  parseShopResolution,
} from "../src/lib/programmatic/holidays/dogc.ts";
import { addDays, longDate } from "../src/lib/programmatic/holidays/format.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { applyAmendments } from "../src/lib/programmatic/holidays/match.ts";
import { caA, caComarca, caDe, esName, knownComarca } from "../src/lib/programmatic/holidays/names.ts";
import {
  DATE_LOCALES,
  DATE_PAGES,
  MUNI_LOCALES,
  dateFromSlug,
  datePath,
  dateSlug,
  hubPath,
  holidayFamilyPaths,
  holidaySitemapEntries,
  municipalityPath,
} from "../src/lib/programmatic/holidays/paths.ts";
import { extractLocalDays } from "../src/lib/programmatic/holidays/prepare.ts";
import {
  dateStaticParams,
  hubAllowed,
  municipalityStaticParams,
  resolveDatePage,
  resolveMunicipality,
} from "../src/lib/programmatic/holidays/routing.ts";
import { SLUG_PATTERN, slugify } from "../src/lib/programmatic/holidays/slug.ts";
import { statusFor, todayInMadrid } from "../src/lib/programmatic/holidays/status.ts";

const ROOT = join(import.meta.dirname, "..");
const fixture = (name: string) => readFileSync(join(ROOT, "tests/fixtures/holidays", name), "utf8");
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const ORDER_2026 = parseLocalOrder(fixture("ordre-emt-208-2025.txt"));
const AMENDMENTS_2026 = parseAmendments(fixture("ordre-emt-3-2026.txt"), 2026);
const AMENDED_2026 = applyAmendments(ORDER_2026.comarques, AMENDMENTS_2026);
const SHOPS_2026 = parseShopResolution(fixture("resolucio-emt-4342-2025.txt"));

function entry(comarca: string, name: string, order = AMENDED_2026.comarques) {
  const c = order.find((x) => nameKey(x.heading) === nameKey(comarca));
  return c?.entries.find((e) => nameKey(e.name) === nameKey(name)) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Snapshot shape and invariants                                              */
/* -------------------------------------------------------------------------- */

test("snapshot: 100 municipalities, ranked by population, unique slugs and codes", () => {
  const list = SNAPSHOT.municipalities;
  assert.equal(list.length, 100);
  assert.equal(new Set(list.map((m) => m.slug)).size, 100);
  assert.equal(new Set(list.map((m) => m.ine)).size, 100);
  list.forEach((m, i) => {
    assert.equal(m.rank, i + 1);
    assert.match(m.ine, /^\d{5}$/);
    assert.match(m.slug, SLUG_PATTERN);
    assert.equal(m.slug, slugify(m.name), `${m.name}: slug is derived from the name`);
    assert.ok(knownComarca(m.comarca), `${m.name}: unknown comarca ${m.comarca}`);
    if (i > 0) assert.ok(list[i - 1]!.population >= m.population, "descending population");
  });
  assert.match(SNAPSHOT.readOn, ISO);
  assert.equal(SNAPSHOT.year, 2026);
  assert.equal(SNAPSHOT.sources.population.year, 2025);
});

test("snapshot: every municipality has its own two days, or nuclei that do", () => {
  for (const m of SNAPSHOT.municipalities) {
    if (m.local.length === 0) assert.ok(m.nuclei.length > 0, `${m.name}: no days at all`);
    else assert.equal(m.local.length, 2, `${m.name}: ${m.local.length} local days`);
    for (const d of [...m.local, ...m.nuclei.flatMap((n) => n.dates)]) {
      assert.match(d, ISO);
      assert.ok(d.startsWith("2026-"), `${m.name}: ${d}`);
    }
    assert.deepEqual([...m.local].sort(), m.local);
    const regional = new Set(regionalDays(2026).map((r) => r.date));
    for (const d of m.local) assert.ok(!regional.has(d), `${m.name}: local day ${d} is already a Catalonia-wide holiday`);
  }
});

test("snapshot: shop days are ten per town, in 2026, never on a compulsory closing day", () => {
  // Llei 18/2017, art. 36.2.d: 1 and 6 Jan, Easter Sunday and Monday (5-6 Apr 2026), 1 May, 24 Jun, 11 Sep, 25 and 26 Dec.
  const closed = new Set(["2026-01-01", "2026-01-06", "2026-04-05", "2026-04-06", "2026-05-01", "2026-06-24", "2026-09-11", "2026-12-25", "2026-12-26"]);
  for (const m of SNAPSHOT.municipalities) {
    assert.equal(m.shops.length, 10, m.name);
    assert.deepEqual([...m.shops].sort(), m.shops);
    for (const d of m.shops) {
      assert.ok(d.startsWith("2026-"));
      assert.ok(!closed.has(d), `${m.name}: shops open on ${d}`);
    }
  }
});

test("snapshot: municipalities left out are those the order gives no days, all bigger than the last listed", () => {
  const last = SNAPSHOT.municipalities.at(-1)!;
  assert.deepEqual(
    SNAPSHOT.excluded.map((e) => e.name).sort(),
    ["Barberà del Vallès", "Cerdanyola del Vallès", "Malgrat de Mar", "Torelló"],
  );
  for (const e of SNAPSHOT.excluded) {
    assert.equal(e.reason, "no-proposal");
    assert.ok(e.population > last.population);
    assert.equal(entry(e.comarca, e.name)?.noProposal, true, `${e.name} is "proposta no formulada" in the order`);
  }
});

test("snapshot: sources are official https URLs", () => {
  const s = SNAPSHOT.sources;
  const all = [s.localOrder, ...s.localAmendments, s.localOpenData, ...Object.values(s.regional), s.shops, s.shopsOrder, s.population, s.comarques];
  for (const source of all) {
    assert.match(source.url, /^https:\/\/(dogc\.gencat\.cat|analisi\.transparenciacatalunya\.cat|www\.idescat\.cat)\//);
    assert.ok(source.name.length > 10);
  }
  assert.match(s.localOpenData.rowsUpdatedAt, ISO);
});

/* -------------------------------------------------------------------------- */
/* Known answers from the official texts                                      */
/* -------------------------------------------------------------------------- */

test("DOGC order EMT/208/2025: year, comarques and known entries", () => {
  assert.equal(ORDER_2026.year, 2026);
  assert.equal(ORDER_2026.comarques.length, 43);
  const original = ORDER_2026.comarques;
  assert.deepEqual(entry("Gironès", "Girona", original)?.dates, ["2026-07-25", "2026-10-29"]);
  assert.deepEqual(entry("Barcelonès", "Barcelona", original)?.dates, ["2026-05-25", "2026-09-24"]);
  assert.deepEqual(entry("Barcelonès", "Hospitalet de Llobregat, l'", original)?.dates, ["2026-05-25", "2026-09-24"]);
  // The open data misses Gallifa; the order has it (7 December).
  assert.deepEqual(entry("Vallès Occidental", "Gallifa", original)?.dates, ["2026-04-02", "2026-12-07"]);
  // Printed with one date and no full stop in the original order.
  assert.deepEqual(entry("Garraf", "Sitges", original)?.dates, ["2026-09-23"]);
  assert.equal(entry("Baix Llobregat", "Viladecans", original)?.noProposal, true);
});

test("DOGC order EMT/3/2026 amends ten councils, Polinyà under the comarca the order really uses", () => {
  assert.equal(AMENDED_2026.unmatched.length, 0);
  assert.equal(AMENDED_2026.applied.length, 10);
  const polinya = AMENDED_2026.applied.find((a) => a.name === "Polinyà");
  assert.equal(polinya?.statedComarca, "Vallès Oriental");
  assert.equal(nameKey(polinya?.comarca ?? ""), nameKey("VALLÈS OCCIDENTAL"));
  assert.deepEqual(entry("Baix Llobregat", "Viladecans")?.dates, ["2026-05-25", "2026-09-08"]);
  assert.deepEqual(entry("Baix Llobregat", "Sant Joan Despí")?.dates, ["2026-05-25", "2026-09-24"]);
  assert.deepEqual(entry("Baix Llobregat", "Castelldefels")?.dates, ["2026-08-14", "2026-12-07"]);
  assert.deepEqual(entry("Garraf", "Sitges")?.dates, ["2026-08-24", "2026-09-23"]);
  assert.deepEqual(entry("Maresme", "Tordera")?.dates, ["2026-05-11", "2026-08-24"]);
});

test("an amendment whose quoted text does not match is refused, never applied", () => {
  const forged = parseAmendments(
    'A la comarca del Garraf, on diu: "Sitges, 1 de gener.", ha de dir: "Sitges, 2 de gener i 3 de gener.".',
    2026,
  );
  const result = applyAmendments(ORDER_2026.comarques, forged);
  assert.equal(result.applied.length, 0);
  assert.equal(result.unmatched.length, 1);
});

test("Resolució EMT/4342/2025: 77 councils with ten days each, and the defaults", () => {
  assert.equal(SHOPS_2026.year, 2026);
  assert.deepEqual(SHOPS_2026.defaults, ["2026-01-04", "2026-01-11", "2026-08-15", "2026-10-12", "2026-11-29", "2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"]);
  assert.equal(SHOPS_2026.councils.length, 77);
  for (const c of SHOPS_2026.councils) assert.equal(c.dates.length, 10, c.name);
  const terrassa = SHOPS_2026.councils.find((c) => c.name === "Terrassa")!;
  assert.ok(terrassa.dates.includes("2026-06-28") && !terrassa.dates.includes("2026-12-06"));
  const santBoi = SHOPS_2026.councils.find((c) => c.name === "Sant Boi de Llobregat")!;
  assert.ok(santBoi.dates.includes("2026-12-07"));
});

test("snapshot shop days are the resolution's, or its defaults for councils it does not list", () => {
  for (const m of SNAPSHOT.municipalities) {
    const listed = SHOPS_2026.councils.find((c) => nameKey(c.name) === nameKey(m.name) || nameKey(c.name) === nameKey(m.dogcName));
    assert.equal(m.shopsOwnList, !!listed, m.name);
    assert.deepEqual(m.shops, listed ? listed.dates : SHOPS_2026.defaults, m.name);
  }
});

test("the Catalonia-wide calendar matches Ordre EMT/66/2025 and Ordre EMT/52/2026 article by article", () => {
  for (const [file, year] of [["ordre-emt-66-2025.txt", 2026], ["ordre-emt-52-2026.txt", 2027]] as const) {
    const parsed = parseRegionalOrder(fixture(file));
    assert.equal(parsed.year, year);
    assert.deepEqual(parsed.dates, (HOLIDAYS_BY_YEAR[year] ?? []).map((h) => h.date).sort());
    assert.equal(parsed.dates.length, 12);
  }
  assert.deepEqual(parseRegionalOrder(fixture("ordre-emt-66-2025.txt")).aran, { replaces: "2026-12-26", date: "2026-06-17" });
  assert.deepEqual(parseRegionalOrder(fixture("ordre-emt-52-2026.txt")).aran, { replaces: "2027-03-29", date: "2027-06-17" });
  const aran2027 = regionalDays(2027, true).map((d) => d.date);
  assert.ok(aran2027.includes("2027-06-17") && !aran2027.includes("2027-03-29") && aran2027.length === 12);
});

/* -------------------------------------------------------------------------- */
/* prepare2027: the parser, run on the 2026 order as a fixture                */
/* -------------------------------------------------------------------------- */

test("prepare2027 reproduces every 2026 local day of the snapshot from the 2026 order text", () => {
  const result = extractLocalDays(AMENDED_2026.comarques, SNAPSHOT.municipalities);
  assert.deepEqual(result.problems, []);
  for (const m of SNAPSHOT.municipalities) {
    const found = result.municipalities[m.slug];
    assert.ok(found, m.name);
    assert.deepEqual(found.local, m.local, m.name);
    assert.deepEqual(found.nuclei, m.nuclei, `${m.name} nuclei`);
  }
});

test("prepare2027 flags what a person must check instead of guessing", () => {
  // Without the January amendment, Viladecans has no proposal and Sitges one day.
  const result = extractLocalDays(ORDER_2026.comarques, SNAPSHOT.municipalities);
  assert.ok(result.problems.some((p) => p.startsWith("Viladecans") && p.includes("proposta no formulada")));
  assert.ok(result.problems.some((p) => p.startsWith("Sitges") && p.includes("1 dates")));
  // A municipality that disappears from the text is reported, not dropped.
  const text = fixture("ordre-emt-208-2025.txt").replace("Girona, 25 de juliol i 29 d'octubre.", "");
  const missing = extractLocalDays(parseLocalOrder(text).comarques, SNAPSHOT.municipalities.filter((m) => m.slug === "girona"));
  assert.ok(missing.problems.some((p) => p.startsWith("Girona")));
});

test("the parser reads the format of a future order: 'Municipi, dd de mes i dd de mes.'", () => {
  const text = [
    "Ordre EMT/999/2026, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2027",
    "Article únic Es fixa el calendari laboral següent de festes de caràcter local per a l'any 2027 a Catalunya distribuïdes per comarques.",
    "GIRONÈS",
    "Girona, 26 de juliol i 29 d'octubre. Salt, 14 i 15 de setembre.",
    "1/40",
    "Diari Oficial de la Generalitat de Catalunya",
    "Sant Gregori, proposta no formulada.",
    "Disposició final Aquesta Ordre entra en vigor l'endemà de la seva publicació al DOGC",
  ].join("\n");
  const order = parseLocalOrder(text);
  assert.equal(order.year, 2027);
  assert.deepEqual(order.comarques[0]?.entries, [
    { name: "Girona", dates: ["2027-07-26", "2027-10-29"], noProposal: false },
    { name: "Salt", dates: ["2027-09-14", "2027-09-15"], noProposal: false },
    { name: "Sant Gregori", dates: [], noProposal: true },
  ]);
  assert.throws(() => parseLocalOrder(text.replace("29 d'octubre", "31 de setembre")), /impossible date/);
});

test("gazetteer names: article back in front", () => {
  assert.equal(articleFirst("Prat de Llobregat, el"), "el Prat de Llobregat");
  assert.equal(articleFirst("Hospitalet de Llobregat, l'"), "l'Hospitalet de Llobregat");
  assert.equal(articleFirst("Franqueses del Vallès, les"), "les Franqueses del Vallès");
  assert.equal(nameKey("Port de la Selva, El"), nameKey("el Port de la Selva"));
});

/* -------------------------------------------------------------------------- */
/* Local holidays by date (date pages)                                        */
/* -------------------------------------------------------------------------- */

test("7 December 2026: 43 municipalities and 2 nuclei, Gallifa included", () => {
  const list = SNAPSHOT.localByDate["2026-12-07"] ?? [];
  assert.equal(list.filter((p) => !p.parent).length, 43);
  assert.deepEqual(list.filter((p) => p.parent).map((p) => p.name).sort(), ["Escaladei", "Escart"]);
  assert.ok(list.some((p) => p.name === "Gallifa"));
  for (const slug of ["castelldefels", "sant-boi-de-llobregat", "amposta"]) assert.ok(list.some((p) => p.slug === slug), slug);
  for (const d of ["2026-12-08", "2026-12-25", "2026-12-26"]) assert.equal(SNAPSHOT.localByDate[d]?.length, 0, d);
});

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

test("routes: each folder answers its own locale only; anything else is a 404", () => {
  assert.equal(resolveMunicipality("ca", "ca", "girona")?.name, "Girona");
  assert.equal(resolveMunicipality("es", "es", "girona")?.name, "Girona");
  assert.equal(resolveMunicipality("ca", "es", "girona"), null);
  assert.equal(resolveMunicipality("es", "ca", "girona"), null);
  assert.equal(resolveMunicipality("ca", "en", "girona"), null);
  assert.equal(resolveMunicipality("ca", "ca", "no-such-town"), null);
  assert.equal(resolveMunicipality("ca", "ca", "dia"), null, "the date folder name is not a town");
  assert.equal(resolveMunicipality("ca", "ca", "cerdanyola-del-valles"), null, "no page without official days");
  assert.ok(hubAllowed("ca", "ca") && hubAllowed("es", "es"));
  assert.ok(!hubAllowed("ca", "es") && !hubAllowed("es", "en"));
  assert.equal(resolveDatePage("ca", "ca", "8-desembre-2026"), "2026-12-08");
  assert.equal(resolveDatePage("es", "es", "8-diciembre-2026"), "2026-12-08");
  assert.equal(resolveDatePage("en", "en", "8-december-2026"), "2026-12-08");
  assert.equal(resolveDatePage("es", "es", "8-desembre-2026"), null);
  assert.equal(resolveDatePage("ca", "es", "8-desembre-2026"), null);
  assert.equal(resolveDatePage("ca", "ca", "9-desembre-2026"), null);
  assert.equal(resolveDatePage("ca", "ca", "2026-12-08"), null);
});

test("routes: static params - 20 towns and all six dates, always complete and in the route's own locale", () => {
  for (const locale of MUNI_LOCALES) {
    const params = municipalityStaticParams(locale);
    assert.equal(params.length, 20);
    assert.equal(params[0]?.municipi, "barcelona");
    // Complete params for every call: one set missing `municipi` would make Next prerender nothing.
    assert.ok(params.every((p) => p.locale === locale && resolveMunicipality(locale, p.locale, p.municipi)));
  }
  for (const locale of DATE_LOCALES) {
    const params = dateStaticParams(locale);
    assert.equal(params.length, 6);
    assert.ok(params.every((p) => p.locale === locale && resolveDatePage(locale, p.locale, p.dia)));
  }
});

test("route files: one per locale folder, revalidate=false, calling the resolver for their own locale", () => {
  const app = join(ROOT, "src/app/(public)/[locale]");
  const files: [string, string, RegExp][] = [
    ["festius/page.tsx", "ca", /hubAllowed\("ca"/],
    ["festivos/page.tsx", "es", /hubAllowed\("es"/],
    ["festius/[municipi]/page.tsx", "ca", /resolveMunicipality\("ca"/],
    ["festivos/[municipi]/page.tsx", "es", /resolveMunicipality\("es"/],
    ["festius/dia/[dia]/page.tsx", "ca", /resolveDatePage\("ca"/],
    ["festivos/dia/[dia]/page.tsx", "es", /resolveDatePage\("es"/],
    ["holidays/day/[dia]/page.tsx", "en", /resolveDatePage\("en"/],
  ];
  for (const [file, , resolver] of files) {
    const source = readFileSync(join(app, file), "utf8");
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, resolver, file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/, `${file} reads no database`);
  }
});

test("slugs: ASCII, stable, and the date slugs round-trip", () => {
  const pinned: Record<string, string> = {
    Barcelona: "barcelona",
    "l'Hospitalet de Llobregat": "l-hospitalet-de-llobregat",
    "el Prat de Llobregat": "el-prat-de-llobregat",
    "Sant Feliu de Guíxols": "sant-feliu-de-guixols",
    "Palau-solità i Plegamans": "palau-solita-i-plegamans",
    "la Seu d'Urgell": "la-seu-d-urgell",
    "Lliçà d'Amunt": "llica-d-amunt",
    "les Franqueses del Vallès": "les-franqueses-del-valles",
  };
  for (const [name, slug] of Object.entries(pinned)) {
    assert.equal(slugify(name), slug);
    assert.ok(SNAPSHOT.municipalities.some((m) => m.slug === slug), slug);
  }
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) {
      const slug = dateSlug(iso, locale);
      assert.match(slug, /^\d{1,2}-[a-z]+-\d{4}$/);
      assert.equal(dateFromSlug(slug, locale), iso);
    }
  }
  assert.equal(datePath("ca", "2026-12-08"), "/ca/festius/dia/8-desembre-2026/");
  assert.equal(datePath("es", "2027-01-06"), "/es/festivos/dia/6-enero-2027/");
  assert.equal(datePath("en", "2026-12-26"), "/en/holidays/day/26-december-2026/");
  assert.equal(municipalityPath("es", "girona"), "/es/festivos/girona/");
  assert.equal(hubPath("ca"), "/ca/festius/");
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

test("metadata: every title <= 60 and description <= 155, in the searched words with the year", () => {
  for (const m of SNAPSHOT.municipalities) {
    for (const locale of MUNI_LOCALES) {
      const title = municipalityTitle(m, locale);
      const description = municipalityDescription(m, locale);
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
      assert.match(title, locale === "ca" ? /^Festius (locals )?/ : /^Festivos (locales )?/);
      assert.ok(title.includes(String(YEAR)) && title.includes(String(NEXT)), title);
      assert.ok(title.includes(locale === "es" ? esName(m.name) : m.name), title);
      assert.ok(description.includes(String(YEAR)));
    }
  }
  assert.equal(municipalityTitle(SNAPSHOT.municipalities.find((m) => m.slug === "girona")!, "ca"), "Festius locals Girona 2026 i 2027: quins dies són festa");
  assert.equal(municipalityTitle(SNAPSHOT.municipalities.find((m) => m.slug === "girona")!, "es"), "Festivos locales Girona 2026 y 2027: qué días son festivo");
  for (const locale of MUNI_LOCALES) {
    const hub = hubCopy(locale);
    assert.ok(hub.title.length <= 60 && hub.description.length <= 155, hub.title);
  }
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) {
      const title = dateQuestion(iso, locale);
      const description = dateContent(iso, locale).description;
      assert.ok(title.length <= 60, title);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
    }
  }
  assert.equal(dateQuestion("2026-12-08", "es"), "¿Es festivo el 8 de diciembre de 2026 en Cataluña?");
  assert.equal(dateQuestion("2027-01-01", "ca"), "És festiu l'1 de gener de 2027 a Catalunya?");
});

test("metadata: canonical and hreflang between the editions that exist, x-default as elsewhere", () => {
  const m = SNAPSHOT.municipalities.find((x) => x.slug === "girona")!;
  const meta = buildMetadata({
    locale: "ca",
    path: municipalityPath("ca", m.slug),
    title: municipalityTitle(m, "ca"),
    translations: { ca: municipalityPath("ca", m.slug), es: municipalityPath("es", m.slug) },
  });
  const alternates = meta.alternates as { canonical: string; languages: Record<string, string> };
  assert.match(alternates.canonical, /\/ca\/festius\/girona\/$/);
  assert.deepEqual(Object.keys(alternates.languages).sort(), ["ca", "es", "x-default"]);
  assert.match(alternates.languages["x-default"]!, /\/ca\/festius\/girona\/$/);
});

/* -------------------------------------------------------------------------- */
/* "Today" in the browser                                                     */
/* -------------------------------------------------------------------------- */

test("today is Catalan time: midnight edges in winter and summer, and the clock-change days", () => {
  assert.equal(todayInMadrid(new Date("2026-12-06T23:30:00Z")), "2026-12-07"); // 00:30 CET
  assert.equal(todayInMadrid(new Date("2026-12-06T22:59:00Z")), "2026-12-06"); // 23:59 CET
  assert.equal(todayInMadrid(new Date("2026-07-24T22:30:00Z")), "2026-07-25"); // 00:30 CEST
  assert.equal(todayInMadrid(new Date("2026-07-24T21:59:00Z")), "2026-07-24"); // 23:59 CEST
  assert.equal(todayInMadrid(new Date("2026-03-28T23:30:00Z")), "2026-03-29"); // spring forward
  assert.equal(todayInMadrid(new Date("2026-10-24T22:30:00Z")), "2026-10-25"); // fall back
});

test("today/tomorrow/next for Girona, through the end of the published data", () => {
  const girona = SNAPSHOT.municipalities.find((m) => m.slug === "girona")!;
  const days = statusDays(girona, "ca");
  const coverage = { regionalThrough: "2027-12-31", localThrough: "2026-12-31" };

  const eve = statusFor("2026-10-28", days, coverage);
  assert.equal(eve.today.state, "working");
  assert.equal(eve.tomorrow.state, "holiday");
  assert.deepEqual([eve.next?.holiday.d, eve.next?.inDays], ["2026-10-29", 1]);

  const local = statusFor("2026-10-29", days, coverage);
  assert.equal(local.today.state === "holiday" && local.today.holiday.k, "local");

  const nye = statusFor("2026-12-31", days, coverage);
  assert.equal(nye.tomorrow.state, "holiday");
  assert.equal(nye.next?.holiday.d, "2027-01-01");
  assert.equal(nye.nextMayBeEarlier, true, "2027 local days are not published");

  const january = statusFor("2027-01-02", days, coverage);
  assert.equal(january.today.state, "local-unknown");
  assert.equal(january.next?.holiday.d, "2027-01-06");

  // The day after the last published date.
  const after = statusFor("2027-12-26", days, coverage);
  assert.equal(after.next, null);
  assert.equal(after.pastLastDate, true);
  assert.equal(after.today.state, "local-unknown");
  assert.equal(statusFor("2028-01-01", days, coverage).today.state, "unknown");
  assert.equal(statusFor("2027-12-25", days, coverage).today.state, "holiday");
});

test("a town whose days belong to its nuclei says which nuclei are off", () => {
  const franqueses = SNAPSHOT.municipalities.find((m) => m.slug === "les-franqueses-del-valles")!;
  assert.equal(franqueses.local.length, 0);
  const may15 = statusDays(franqueses, "ca").find((d) => d.d === "2026-05-15");
  assert.ok(may15 && may15.k === "local" && /Bellavista/.test(may15.n));
  const rows = yearRows(franqueses, 2026, "ca").filter((r) => r.kind === "local");
  assert.ok(rows.length > 2 && rows.every((r) => (r.where?.length ?? 0) > 0));
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: 220 URLs, unique, dated with the dataset, with hreflang", () => {
  const entries = holidaySitemapEntries();
  assert.equal(entries.length, 2 + 200 + 18);
  assert.equal(new Set(entries.map((e) => e.url)).size, entries.length);
  assert.equal(holidayFamilyPaths().length, entries.length);
  for (const e of entries) {
    assert.equal((e.lastModified as Date).toISOString().slice(0, 10), SNAPSHOT.readOn);
    const languages = (e.alternates?.languages ?? {}) as Record<string, string>;
    assert.ok(languages["x-default"], e.url);
    assert.ok(languages.ca && languages.es, e.url);
  }
  const date = entries.find((e) => e.url.endsWith("/en/holidays/day/8-december-2026/"))!;
  assert.ok((date.alternates?.languages as Record<string, string>).en);
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /holidaySitemapEntries\(\)/);
  assert.ok(sitemap.indexOf("if (!indexingAllowed()) return [];") < sitemap.indexOf("holidaySitemapEntries()"));
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("dates read the same as the rest of the site's holiday pages", () => {
  let iso = "2026-01-01";
  while (iso <= "2027-12-31") {
    for (const locale of ["ca", "es", "en"] as const) assert.equal(longDate(iso, locale), calendarLongDate(iso, locale));
    iso = addDays(iso, 1);
  }
});

test("Catalan prepositions and Spanish articles", () => {
  assert.equal(caDe("el Vendrell"), "del Vendrell");
  assert.equal(caDe("Igualada"), "d'Igualada");
  assert.equal(caDe("Olot"), "d'Olot");
  assert.equal(caDe("l'Hospitalet de Llobregat"), "de l'Hospitalet de Llobregat");
  assert.equal(caDe("la Garriga"), "de la Garriga");
  assert.equal(caDe("Girona"), "de Girona");
  assert.equal(caA("el Prat de Llobregat"), "al Prat de Llobregat");
  assert.equal(caA("les Franqueses del Vallès"), "a les Franqueses del Vallès");
  assert.equal(esName("el Masnou"), "El Masnou");
  assert.equal(caComarca("Baix Llobregat"), "el Baix Llobregat");
  assert.equal(caComarca("Alt Empordà"), "l'Alt Empordà");
  assert.equal(caComarca("Osona"), "Osona");
  for (const m of SNAPSHOT.municipalities) assert.ok(knownComarca(m.comarca));
});

test("page copy: the answer comes first and names the official order", () => {
  const girona = SNAPSHOT.municipalities.find((m) => m.slug === "girona")!;
  const ca = municipalityCopy(girona, "ca", null, caComarca(girona.comarca));
  assert.equal(ca.lead, "A Girona els dos festius locals del 2026 són el dissabte 25 de juliol i el dijous 29 d'octubre. S'hi sumen els dotze festius de tot Catalunya.");
  assert.match(ca.source, /Ordre EMT\/208\/2025/);
  assert.equal(municipalityH1(girona, "ca"), "Festius locals de Girona 2026 i 2027");
  const castelldefels = SNAPSHOT.municipalities.find((m) => m.slug === "castelldefels")!;
  const es = municipalityCopy(castelldefels, "es", null, castelldefels.comarca);
  assert.match(es.source, /EMT\/3\/2026/);
  assert.match(es.correction ?? "", /14 de septiembre/);
  assert.equal(es.shopsLocal.length, 2);
  for (const m of SNAPSHOT.municipalities) {
    for (const locale of MUNI_LOCALES) {
      const copy = municipalityCopy(m, locale, null, m.comarca);
      assert.ok(!/\{\w+\}|undefined|NaN/.test(JSON.stringify(copy)), `${m.slug} ${locale}`);
    }
  }
});

test("date pages: only 7 December is not a holiday; nothing unfilled", () => {
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) {
      const content = dateContent(iso, locale);
      assert.equal(content.holiday, iso !== "2026-12-07", `${iso} ${locale}`);
      const text = JSON.stringify({ ...content, local: { ...content.local, places: [] } });
      assert.ok(!/\{\w+\}|undefined|NaN|null/.test(text), `${iso} ${locale}`);
      assert.ok(content.guides.length >= 4);
    }
  }
  assert.match(dateContent("2026-12-07", "ca").answer, /43 municipis i 2 nuclis/);
  assert.match(dateContent("2026-12-26", "es").answer, /Arán/);
});

test("siblings: every page links to at least six other towns, same comarca first", () => {
  for (const m of SNAPSHOT.municipalities) {
    const { sameComarca, others } = siblings(m);
    assert.ok(sameComarca.length + others.length >= 6, m.name);
    assert.ok(sameComarca.every((o) => o.comarca === m.comarca && o.slug !== m.slug));
  }
  assert.equal(byComarca().reduce((n, g) => n + g.municipalities.length, 0), 100);
});

test("links go to the published guides", () => {
  const b2 = (key: keyof typeof B2_PATHS, locale: "ca" | "es" | "en") => `/${locale}/${B2_PATHS[key][locale]}/`;
  for (const locale of ["ca", "es", "en"] as const) {
    assert.equal(GUIDES.shops[locale], b2("shops", locale));
    assert.equal(GUIDES.workCalendar[locale], b2("workCalendar", locale));
    assert.equal(GUIDES.holidayToday[locale], b2("holidayToday", locale));
    assert.equal(GUIDES.decemberBridge[locale], b2("decemberBridge", locale));
    assert.equal(GUIDES.metroHours[locale], b2("hours", locale));
    assert.equal(GUIDES.christmasTraditions[locale], b2("christmasTraditions", locale));
    assert.equal(GUIDES.christmasBarcelona[locale], b2("christmasBarcelona", locale));
    assert.equal(GUIDES.newYear[locale], b2("newYear", locale));
    assert.equal(GUIDES.localHolidays[locale], `/${locale}/${LOCAL_COPY[locale].path}/`);
  }
  const school = readFileSync(join(ROOT, "src/lib/content/school/publish.ts"), "utf8");
  for (const locale of ["ca", "es", "en"] as const) assert.ok(school.includes(`path: "${GUIDES.school[locale].slice(4, -1)}"`), locale);
});

test("the local-holidays guide links to the hub, one sentence per locale", () => {
  assert.match(LOCAL_COPY.ca.related, /\]\(\/ca\/festius\/\)/);
  assert.match(LOCAL_COPY.es.related, /\]\(\/es\/festivos\/\)/);
});

test("server output carries no clock: no argument-less new Date() outside the browser component", () => {
  const files = [
    "src/lib/programmatic/holidays/copy.ts",
    "src/lib/programmatic/holidays/data.ts",
    "src/lib/programmatic/holidays/dates.ts",
    "src/lib/programmatic/holidays/format.ts",
    "src/lib/programmatic/holidays/paths.ts",
    "src/lib/programmatic/holidays/routing.ts",
    "src/components/programmatic/holidays/MunicipalityPage.tsx",
    "src/components/programmatic/holidays/HubPage.tsx",
    "src/components/programmatic/holidays/DatePage.tsx",
    "src/components/programmatic/holidays/parts.tsx",
    "src/components/programmatic/holidays/routes.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(source, /new Date\(\)|Date\.now\(/, file);
  }
  const client = readFileSync(join(ROOT, "src/components/programmatic/holidays/HolidayStatus.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(/, "the date is read after mount, never during the server render");
});
