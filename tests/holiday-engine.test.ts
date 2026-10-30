import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HOLIDAYS_BY_YEAR, longDate as calendarLongDate } from "../src/lib/content/holidays/calendar.ts";
import { COPY as LOCAL_COPY } from "../src/lib/content/holidays/local-publish.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";
import {
  comarcaCopy,
  comarcaDescription,
  comarcaH1,
  comarcaTitle,
  dateQuestion,
  hubCopy,
  municipalityCopy,
  municipalityDescription,
  municipalityFaq,
  municipalityH1,
  municipalityTitle,
  sharedDayLead,
} from "../src/lib/programmatic/holidays/copy.ts";
import { NEXT, SNAPSHOT, YEAR, byComarca, comarcaBySlug, regionalDays, sharedDates, siblings, statusDays, yearRows } from "../src/lib/programmatic/holidays/data.ts";
import { LOCAL_DATE_PAGES, dateContent, municipalityDatePages } from "../src/lib/programmatic/holidays/dates.ts";
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
  comarcaPath,
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
  comarcaStaticParams,
  dateStaticParams,
  hubAllowed,
  municipalityStaticParams,
  resolveComarca,
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

test("snapshot: 917 municipalities, ranked by population, unique slugs and codes", () => {
  // Tranche 3: every municipality the order gives days to (947 in Idescat's list, 30 without a proposal).
  const list = SNAPSHOT.municipalities;
  assert.equal(list.length, 917);
  assert.equal(list.length + SNAPSHOT.excluded.length, 947);
  assert.equal(new Set(list.map((m) => m.slug)).size, 917);
  assert.equal(new Set(list.map((m) => m.ine)).size, 917);
  assert.ok(!list.some((m) => SNAPSHOT.excluded.some((e) => e.ine === m.ine)), "no town is both listed and excluded");
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
    // Nuclei have two days each, except Seguer (Pontils): "Seguer, 14 d'agost."
    for (const n of m.nuclei) assert.equal(n.dates.length, n.name === "Seguer" ? 1 : 2, `${m.name} / ${n.name}`);
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

test("snapshot: the 30 municipalities left out are exactly the order's 'proposta no formulada' councils", () => {
  assert.deepEqual(
    SNAPSHOT.excluded.map((e) => e.name).sort((a, b) => a.localeCompare(b, "ca")),
    [
      "Aiguafreda",
      "Argentona",
      "Barberà del Vallès",
      "Bausen",
      "Calaf",
      "Cànoves i Samalús",
      "Canyelles",
      "Castellar del Riu",
      "Castellfollit del Boix",
      "Castellnou de Bages",
      "Cerdanyola del Vallès",
      "el Pont de Bar",
      "Gironella",
      "Gósol",
      "la Febró",
      "la Nou de Berguedà",
      "la Quar",
      "Malgrat de Mar",
      "Monistrol de Montserrat",
      "Mura",
      "Òrrius",
      "Rubió",
      "Sant Julià de Cerdanyola",
      "Sant Mateu de Bages",
      "Sant Pere de Vilamajor",
      "Santa Eulàlia de Ronçana",
      "Santa Maria de Martorelles",
      "Torelló",
      "Vallcebre",
      "Veciana",
    ],
  );
  // Every "proposta no formulada" entry left in the amended order, and nothing else.
  const noProposal = AMENDED_2026.comarques.flatMap((c) => c.entries.filter((e) => e.noProposal).map((e) => nameKey(e.name)));
  assert.equal(noProposal.length, 30);
  assert.deepEqual(SNAPSHOT.excluded.map((e) => nameKey(e.name)).sort(), noProposal.sort());
  for (const e of SNAPSHOT.excluded) {
    assert.equal(e.reason, "no-proposal");
    assert.ok(knownComarca(e.comarca), `${e.name}: ${e.comarca}`);
    assert.match(e.ine, /^\d{5}$/);
    // Aiguafreda: Osona for Idescat, the Vallès Oriental in the order.
    const found = entry(e.comarca, e.name) ?? AMENDED_2026.comarques.flatMap((c) => c.entries).find((x) => nameKey(x.name) === nameKey(e.name));
    assert.equal(found?.noProposal, true, `${e.name} is "proposta no formulada" in the order`);
  }
  // The January amendment gave days to four councils that had none: they are listed, not excluded.
  for (const slug of ["viladecans", "cardona", "polinya", "tavernoles"]) assert.ok(SNAPSHOT.municipalities.some((m) => m.slug === slug), slug);
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

test("local holidays by date: one place per entry of the amended DOGC order, no more, no fewer", () => {
  // Every date a date page talks about, counted straight from the order text.
  for (const date of Object.keys(SNAPSHOT.localByDate)) {
    const entries = AMENDED_2026.comarques.flatMap((c) => c.entries.filter((e) => e.dates.includes(date)));
    assert.equal(SNAPSHOT.localByDate[date]?.length, entries.length, date);
  }
  // 1 November 2026 is nobody's local holiday; Monday 2 November is two councils'.
  assert.deepEqual(SNAPSHOT.localByDate["2026-11-01"], []);
  assert.deepEqual(SNAPSHOT.localByDate["2026-11-02"]?.map((p) => p.name), ["Bossòst", "Sant Esteve de Palautordera"]);
  const count = (date: string) => {
    const list = SNAPSHOT.localByDate[date] ?? [];
    return [list.filter((p) => !p.parent).length, list.filter((p) => p.parent).length];
  };
  assert.deepEqual(count("2026-11-11"), [29, 21]);
  assert.deepEqual(count("2026-11-30"), [24, 14]);
  assert.deepEqual(count("2026-12-24"), [3, 0]);
  assert.deepEqual(count("2026-12-31"), [7, 2]);
  assert.deepEqual(SNAPSHOT.localByDate["2026-12-24"]?.map((p) => p.name), ["Copons", "la Vajol", "Sant Jaume de Frontanyà"]);
  // The DOGC names the municipality even where the open data lists only its nuclei.
  assert.ok(SNAPSHOT.localByDate["2026-11-30"]?.some((p) => p.name === "Rupit i Pruit" && !p.parent));
  assert.ok(SNAPSHOT.localByDate["2026-11-11"]?.some((p) => p.name === "Boadella i les Escaules" && !p.parent));
  // Places with a page link to it.
  for (const slug of ["sentmenat", "teia", "altafulla", "puig-reig"]) assert.ok(SNAPSHOT.localByDate["2026-11-11"]?.some((p) => p.slug === slug), slug);
  for (const slug of ["sant-andreu-de-la-barca", "sant-andreu-de-llavaneres", "tona", "torroella-de-montgri"]) {
    assert.ok(SNAPSHOT.localByDate["2026-11-30"]?.some((p) => p.slug === slug), slug);
  }
  // Tranche 3: every place on a date page links a town page - its own, or for a nucleus its municipality's.
  for (const list of Object.values(SNAPSHOT.localByDate)) {
    for (const p of list) {
      const town = SNAPSHOT.municipalities.find((m) => m.slug === p.slug);
      assert.ok(town, `${p.name}: no page`);
      if (p.parent) {
        assert.equal(town.name, p.parent, `${p.name} links its municipality`);
        assert.ok(town.nuclei.some((n) => n.name === p.name) || town.local.length === 0 || town.nuclei.length === 0, `${p.name} in ${town.name}`);
      } else assert.equal(town.name, p.name, p.name);
    }
  }
  assert.equal(SNAPSHOT.localByDate["2026-12-07"]?.find((p) => p.name === "Escaladei")?.slug, "la-morera-de-montsant");
});

test("shop days by date: the resolution's own lists, and only where that day is a local holiday or a Sunday", () => {
  for (const [date, list] of Object.entries(SNAPSHOT.shopsByDate)) {
    assert.ok(!SHOPS_2026.defaults.includes(date), `${date} is a default day, not a per-council one`);
    const councils = SHOPS_2026.councils.filter((c) => c.dates.includes(date)).map((c) => nameKey(c.name)).sort();
    assert.deepEqual(list.map((p) => nameKey(p.name)).sort(), councils, date);
    const sunday = new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
    for (const p of list) {
      if (!sunday) assert.ok(SNAPSHOT.localByDate[date]?.some((l) => nameKey(l.name) === nameKey(p.name)), `${p.name} opens on ${date}, its local holiday`);
    }
  }
  assert.deepEqual(SNAPSHOT.shopsByDate["2026-11-01"]?.map((p) => p.slug), ["l-ametlla-del-valles", "mollet-del-valles"]);
  assert.deepEqual(SNAPSHOT.shopsByDate["2026-11-30"]?.map((p) => p.name), ["Sant Andreu de la Barca"]);
  assert.deepEqual(SNAPSHOT.shopsByDate["2026-12-31"]?.map((p) => p.name), ["Centelles"]);
  assert.deepEqual(SNAPSHOT.shopsByDate["2026-11-11"], []);
  assert.deepEqual(SNAPSHOT.shopsByDate["2026-12-24"], []);
});

/* -------------------------------------------------------------------------- */
/* Tranche 2: towns 101-300, known answers from the DOGC text                 */
/* -------------------------------------------------------------------------- */

test("tranche 2: new towns carry the days the DOGC order prints for them", () => {
  const raw = fixture("ordre-emt-208-2025.txt").replace(/\r\n?/g, "\n");
  const known: { slug: string; comarca: string; text: string; local: string[]; nuclei?: { name: string; dates: string[] }[] }[] = [
    { slug: "sentmenat", comarca: "Vallès Occidental", text: "Sentmenat, 7 de setembre i 11 de novembre.", local: ["2026-09-07", "2026-11-11"] },
    { slug: "tona", comarca: "Osona", text: "Tona, 25 de maig i 30 de novembre.", local: ["2026-05-25", "2026-11-30"] },
    { slug: "centelles", comarca: "Osona", text: "Centelles, 1 de setembre i 31 de desembre.", local: ["2026-09-01", "2026-12-31"] },
    { slug: "sant-esteve-de-palautordera", comarca: "Vallès Oriental", text: "Sant Esteve de Palautordera, 3 d'agost i 2 de novembre.", local: ["2026-08-03", "2026-11-02"] },
    { slug: "santa-coloma-de-cervello", comarca: "Baix Llobregat", text: "Santa Coloma de Cervelló, 7 de desembre i 31 de desembre.", local: ["2026-12-07", "2026-12-31"] },
    {
      slug: "bigues-i-riells-del-fai",
      comarca: "Vallès Oriental",
      // The order keeps the former name and lists only the two nuclei.
      text: "Bigues i Riells\nBigues, 20 de gener i 29 de juny. Riells del Fai, 22 de gener i 7 d'agost.",
      local: [],
      nuclei: [
        { name: "Bigues", dates: ["2026-01-20", "2026-06-29"] },
        { name: "Riells del Fai", dates: ["2026-01-22", "2026-08-07"] },
      ],
    },
  ];
  for (const k of known) {
    assert.ok(raw.includes(k.text), `${k.slug}: the fixture prints "${k.text}"`);
    const m = SNAPSHOT.municipalities.find((x) => x.slug === k.slug);
    assert.ok(m, k.slug);
    assert.ok(m.rank > 100 && m.rank <= 300, `${k.slug} is a tranche 2 town (rank ${m.rank})`);
    assert.equal(m.comarca, k.comarca);
    assert.deepEqual(m.local, k.local, k.slug);
    assert.deepEqual(m.nuclei, k.nuclei ?? [], k.slug);
    if (k.local.length) assert.deepEqual([...(entry(k.comarca, m.dogcName)?.dates ?? [])].sort(), k.local, `${k.slug}: parsed order`);
  }
  const bigues = SNAPSHOT.municipalities.find((m) => m.slug === "bigues-i-riells-del-fai")!;
  assert.equal(bigues.dogcName, "Bigues i Riells");
  // Two nuclei: their days are in the description, not "by nucleus".
  assert.match(municipalityDescription(bigues, "ca"), /^Festius locals de Bigues i Riells del Fai el 2026: Bigues, 20 de gener i 29 de juny; Riells del Fai, 22 de gener i 7 d'agost\./);
  assert.match(municipalityDescription(bigues, "es"), /^Festivos locales de Bigues i Riells del Fai en 2026: Bigues, 20 de enero y 29 de junio; Riells del Fai, 22 de enero y 7 de agosto\./);
  assert.match(municipalityDescription(SNAPSHOT.municipalities.find((m) => m.slug === "subirats")!, "ca"), /segons el nucli/);
  // Centelles chose its local holiday as a shop-opening day.
  const centelles = SNAPSHOT.municipalities.find((m) => m.slug === "centelles")!;
  assert.ok(centelles.shopsOwnList && centelles.shops.includes("2026-12-31"));
  // The first hundred did not move.
  assert.equal(SNAPSHOT.municipalities[99]?.slug, "castell-d-aro-platja-d-aro-i-s-agaro");
  assert.equal(SNAPSHOT.municipalities[299]?.population, 2592);
});

test("town pages send their shared local days to the date page that lists them", () => {
  const pages = (slug: string) => municipalityDatePages(SNAPSHOT.municipalities.find((m) => m.slug === slug)!);
  assert.deepEqual(pages("sentmenat"), [{ date: "2026-11-11", page: "2026-11-11", others: 49, nuclei: [] }]);
  assert.deepEqual(pages("tona"), [{ date: "2026-11-30", page: "2026-11-30", others: 37, nuclei: [] }]);
  assert.deepEqual(pages("sant-esteve-de-palautordera"), [{ date: "2026-11-02", page: "2026-11-01", others: 1, nuclei: [] }]);
  assert.deepEqual(pages("santa-coloma-de-cervello").map((p) => p.page), ["2026-12-07", "2026-12-31"]);
  // A nucleus's day counts for its town: Sant Martí Sarroca's own day and two of its nuclei on 11 November.
  assert.deepEqual(pages("sant-marti-sarroca"), [{ date: "2026-11-11", page: "2026-11-11", others: 47, nuclei: [] }]);
  // A day that is only a nucleus's names the nucleus.
  assert.deepEqual(pages("puigcerda"), [{ date: "2026-11-30", page: "2026-11-30", others: 37, nuclei: ["Vilallobent"] }]);
  assert.deepEqual(pages("vielha-e-mijaran"), [{ date: "2026-11-11", page: "2026-11-11", others: 48, nuclei: ["Aubèrt", "Gausac"] }]);
  assert.deepEqual(pages("girona"), []);
  for (const m of SNAPSHOT.municipalities) {
    for (const p of municipalityDatePages(m)) {
      assert.ok(DATE_PAGES.includes(p.page), `${m.slug}: ${p.page}`);
      assert.equal(LOCAL_DATE_PAGES[p.date], p.page);
      // The town is on the list the date page shows.
      assert.ok(SNAPSHOT.localByDate[p.date]?.some((l) => l.slug === m.slug || l.parent === m.name), `${m.slug} on ${p.date}`);
    }
  }
  assert.equal(sharedDayLead("2026-11-11", 49, "ca"), "El dimecres 11 de novembre també és festa local a 49 llocs més de Catalunya:");
  assert.equal(sharedDayLead("2026-11-02", 1, "es"), "El lunes 2 de noviembre también es fiesta local en 1 lugar más de Cataluña:");
  assert.equal(sharedDayLead("2026-11-30", 37, "ca", ["Vilallobent"]), "El dilluns 30 de novembre és festa local a Vilallobent i a 37 llocs més de Catalunya:");
  assert.equal(sharedDayLead("2026-11-11", 48, "es", ["Aubèrt", "Gausac"]), "El miércoles 11 de noviembre es fiesta local en Aubèrt y Gausac y en otros 48 lugares de Cataluña:");
});

/* -------------------------------------------------------------------------- */
/* Tranche 3: every municipality, known answers from the DOGC text            */
/* -------------------------------------------------------------------------- */

test("tranche 3: small towns carry the days the DOGC order prints for them", () => {
  const raw = fixture("ordre-emt-208-2025.txt").replace(/\r\n?/g, "\n");
  const amendment = fixture("ordre-emt-3-2026.txt").replace(/\r\n?/g, "\n");
  const known: { slug: string; comarca: string; population: number; text: string; local: string[]; nuclei?: { name: string; dates: string[] }[] }[] = [
    // The smallest municipality in Catalonia, one of three with 24 December.
    { slug: "sant-jaume-de-frontanya", comarca: "Berguedà", population: 25, text: "Sant Jaume de Frontanyà, 24 de juliol i 24 de desembre.", local: ["2026-07-24", "2026-12-24"] },
    { slug: "senan", comarca: "Conca de Barberà", population: 47, text: "Senan, 2 de gener i 5 de gener.", local: ["2026-01-02", "2026-01-05"] },
    { slug: "la-vajol", comarca: "Alt Empordà", population: 112, text: "Vajol, la, 24 de desembre i 31 de desembre.", local: ["2026-12-24", "2026-12-31"] },
    { slug: "biosca", comarca: "Solsonès", population: 185, text: "Biosca, 30 de juliol i 31 de juliol.", local: ["2026-07-30", "2026-07-31"] },
    { slug: "copons", comarca: "Anoia", population: 352, text: "Copons, 7 d'abril i 24 de desembre.", local: ["2026-04-07", "2026-12-24"] },
    { slug: "montgai", comarca: "Noguera", population: 640, text: "Montgai, 25 de maig i 7 de desembre.", local: ["2026-05-25", "2026-12-07"] },
    {
      slug: "lladorre",
      comarca: "Pallars Sobirà",
      population: 246,
      text: "Lladorre, 27 de juliol i 11 de novembre.",
      local: ["2026-07-27", "2026-11-11"],
      nuclei: [
        { name: "Aineto", dates: ["2026-08-12", "2026-11-11"] },
        { name: "Boldís Jussà", dates: ["2026-06-30", "2026-07-11"] },
        { name: "Boldís Sobirà", dates: ["2026-01-20", "2026-09-29"] },
        { name: "Lleret", dates: ["2026-09-16", "2026-11-11"] },
        { name: "Tavascan", dates: ["2026-08-05", "2026-08-24"] },
      ],
    },
    {
      slug: "pontils",
      comarca: "Conca de Barberà",
      population: 124,
      text: "Pontils, 24 de juliol i 25 de juliol.",
      local: ["2026-07-24", "2026-07-25"],
      nuclei: [
        { name: "Sant Magí de Brufaganya", dates: ["2026-08-19", "2026-09-16"] },
        { name: "Santa Perpètua de Gaià", dates: ["2026-08-07", "2026-08-08"] },
        { name: "Seguer", dates: ["2026-08-14"] },
        { name: "Vallespinosa", dates: ["2026-07-31", "2026-08-01"] },
      ],
    },
  ];
  for (const k of known) {
    assert.ok(raw.includes(k.text), `${k.slug}: the fixture prints "${k.text}"`);
    const m = SNAPSHOT.municipalities.find((x) => x.slug === k.slug);
    assert.ok(m, k.slug);
    assert.ok(m.rank > 300, `${k.slug} is a tranche 3 town (rank ${m.rank})`);
    assert.equal(m.population, k.population, `${k.slug}: Idescat population 2025`);
    assert.equal(m.comarca, k.comarca);
    assert.deepEqual(m.local, k.local, k.slug);
    assert.deepEqual(m.nuclei, k.nuclei ?? [], k.slug);
    assert.equal(m.correction, null, `${k.slug}: open data and DOGC agree`);
  }
  assert.equal(SNAPSHOT.municipalities.at(-1)?.slug, "sant-jaume-de-frontanya", "the smallest, last");
  assert.ok(raw.includes("Seguer, 14 d'agost."));

  // Only in the DOGC: the open data has no row for these councils.
  const dogcOnly: [string, string, string[]][] = [
    ["gallifa", "Gallifa, 2 d'abril i 7 de desembre.", ["2026-04-02", "2026-12-07"]],
    ["puigpelat", "Puigpelat, 2 d'abril i 31 de desembre.", ["2026-04-02", "2026-12-31"]],
    ["castell-de-l-areny", "Castell de l'Areny, 22 de gener i 15 de maig.", ["2026-01-22", "2026-05-15"]],
    ["la-pobla-de-cervoles", "Pobla de Cérvoles, la, 10 d'agost i 23 de novembre.", ["2026-08-10", "2026-11-23"]],
  ];
  for (const [slug, text, local] of dogcOnly) {
    assert.ok(raw.includes(text), text);
    const m = SNAPSHOT.municipalities.find((x) => x.slug === slug)!;
    assert.deepEqual(m.local, local, slug);
    assert.deepEqual(m.correction, { openData: [], by: "Ordre EMT/208/2025" }, slug);
    assert.match(municipalityCopy(m, "ca", null, m.comarca).correction ?? "", /encara no en recullen cap dia; el text oficial del DOGC diu/);
  }

  // Ordre EMT/3/2026: Torà (Segarra in the order, Solsonès for Idescat) and Tavèrnoles ("proposta no formulada" until January).
  assert.ok(amendment.includes("ha de dir: “Torà, 25 de maig i 1 de setembre.”"));
  assert.ok(amendment.includes("Tavèrnoles, 25 de maig i 3 d'agost."));
  const tora = SNAPSHOT.municipalities.find((m) => m.slug === "tora")!;
  assert.equal(tora.comarca, "Solsonès");
  assert.deepEqual(tora.local, ["2026-05-25", "2026-09-01"]);
  assert.deepEqual(tora.correction, { openData: ["2026-08-25", "2026-09-01"], by: "Ordre EMT/3/2026" });
  const tavernoles = SNAPSHOT.municipalities.find((m) => m.slug === "tavernoles")!;
  assert.deepEqual(tavernoles.local, ["2026-05-25", "2026-08-03"]);
  assert.equal(tavernoles.correction?.by, "Ordre EMT/3/2026");
  assert.match(municipalityCopy(tavernoles, "es", null, tavernoles.comarca).source, /Orden EMT\/3\/2026/);
});

test("tranche 3: towns the order lists by nuclei only, and nuclei it does not name", () => {
  const nucleiOnly = SNAPSHOT.municipalities.filter((m) => m.local.length === 0);
  assert.equal(nucleiOnly.length, 31);
  for (const m of nucleiOnly) {
    assert.ok(m.nuclei.length >= 2, `${m.name}: ${m.nuclei.length} nuclei`);
    const ca = municipalityCopy(m, "ca", null, m.comarca);
    assert.match(ca.lead, /cada nucli té els seus dos festius locals/, m.slug);
    // The table's local rows say which nuclei are off.
    assert.ok(yearRows(m, 2026, "ca").filter((r) => r.kind === "local").every((r) => (r.where?.length ?? 0) > 0), m.slug);
  }
  // Avinyonet del Penedès: the order prints the municipality's name straight into its first nucleus.
  const raw = fixture("ordre-emt-208-2025.txt");
  assert.ok(raw.includes("Avinyonet del Penedès Arboçar, l', 2 d'abril i 27 de juliol. Avinyó Nou, 2 d'abril i 24 d'agost."));
  const avinyonet = SNAPSHOT.municipalities.find((m) => m.slug === "avinyonet-del-penedes")!;
  assert.deepEqual(avinyonet.local, []);
  assert.deepEqual(
    avinyonet.nuclei.map((n) => n.name),
    ["l'Arboçar", "Avinyó Nou", "Cantallops", "les Gunyoles", "Sant Sebastià dels Gorgs"],
  );
  assert.deepEqual(avinyonet.nuclei[0]?.dates, ["2026-04-02", "2026-07-27"]);
  // The open data gives the whole municipality two days; the page says the DOGC sets them by nucleus.
  assert.deepEqual(avinyonet.correction, { openData: ["2026-04-02", "2026-08-24"], by: "Ordre EMT/208/2025" });
  assert.equal(
    municipalityCopy(avinyonet, "ca", null, avinyonet.comarca).correction,
    "Les dades obertes de la Generalitat encara diuen 2 d'abril i 24 d'agost; el text oficial del DOGC no fixa dies per a tot el municipi, sinó per a cada nucli, i és el que fem servir.",
  );
  assert.match(municipalityCopy(avinyonet, "es", null, avinyonet.comarca).correction ?? "", /no fija días para todo el municipio, sino para cada núcleo/);
  const nautAran = SNAPSHOT.municipalities.find((m) => m.slug === "naut-aran")!;
  assert.ok(raw.includes("Naut Aran Arties, 25 de juny i 25 de juliol."));
  assert.equal(nautAran.nuclei.length, 8);
  assert.match(municipalityDescription(nautAran, "es"), /según el núcleo/);

  // Nuclei the open data gives days the order never names: the order's municipal days are used, and the page says so.
  assert.ok(!raw.includes("Butsènit"));
  const montgai = SNAPSHOT.municipalities.find((m) => m.slug === "montgai")!;
  assert.deepEqual(montgai.unlisted, [{ name: "Butsènit", dates: ["2026-05-25", "2026-09-07"] }]);
  assert.equal(
    municipalityCopy(montgai, "ca", null, montgai.comarca).unlisted,
    "Les dades obertes de la Generalitat donen al nucli de Butsènit uns altres dies, el 25 de maig i el 7 de setembre, però l'ordre del DOGC no l'esmenta: només fixa els dies del municipi, que són els d'aquesta pàgina.",
  );
  // In la Baronia de Rialb, the open data's "Vilaplana" carries the Baix Camp municipality of Vilaplana's days.
  assert.ok(raw.includes("Vilaplana, 20 de gener i 15 de maig."));
  assert.ok(raw.includes("Baronia de Rialb, la, 17 de febrer i 17 d'agost."));
  const baronia = SNAPSHOT.municipalities.find((m) => m.slug === "la-baronia-de-rialb")!;
  assert.deepEqual(baronia.local, ["2026-02-17", "2026-08-17"]);
  assert.deepEqual(baronia.unlisted, [{ name: "Vilaplana", dates: ["2026-01-20", "2026-05-15"] }]);
  // The open data lists la Baronia by nuclei only, with the order's days: no correction.
  assert.equal(baronia.correction, null);
  assert.match(municipalityCopy(baronia, "es", null, baronia.comarca).unlisted ?? "", /^Los datos abiertos de la Generalitat dan al núcleo de Vilaplana otros días/);
  assert.equal(SNAPSHOT.municipalities.filter((m) => m.unlisted).length, 2);
  for (const m of SNAPSHOT.municipalities) if (!m.unlisted) assert.equal(municipalityCopy(m, "ca", null, m.comarca).unlisted, null);
});

test("tranche 3: comarca pages hold every town with its days, plus the comarca's exclusions", () => {
  const groups = byComarca();
  assert.equal(groups.length, 43);
  assert.equal(groups.reduce((n, g) => n + g.municipalities.length, 0), 917);
  assert.equal(groups.reduce((n, g) => n + g.excluded.length, 0), 30);
  for (const g of groups) {
    assert.ok(knownComarca(g.comarca), g.comarca);
    assert.equal(g.slug, slugify(g.comarca));
    assert.equal(comarcaBySlug(g.slug), g);
    assert.ok(g.municipalities.length >= 1);
    assert.ok(g.municipalities.every((m, i) => m.comarca === g.comarca && (i === 0 || g.municipalities[i - 1]!.rank < m.rank)), g.comarca);
    for (const locale of MUNI_LOCALES) {
      const t = comarcaCopy(g, locale);
      const text = [...Object.values(t).filter((v) => typeof v === "string"), t.moreNuclei(2), t.sharedItem("2026-05-25", 3)].join(" ");
      assert.ok(!/\{\w+\}|undefined|NaN|null/.test(text), `${g.slug} ${locale}: ${text}`);
      if (g.excluded.length) assert.match(t.excluded ?? "", /proposta no formulada/, g.slug);
      else assert.equal(t.excluded, null, g.slug);
    }
  }
  const altEmporda = comarcaBySlug("alt-emporda")!;
  assert.equal(altEmporda.municipalities.length, 68);
  assert.equal(altEmporda.municipalities[0]?.slug, "figueres");
  assert.equal(comarcaTitle(altEmporda, "ca"), "Festius locals de l'Alt Empordà 2026: els 68 municipis");
  assert.equal(comarcaTitle(altEmporda, "es"), "Festivos locales Alt Empordà 2026: los 68 municipios");
  assert.equal(comarcaH1(altEmporda, "ca"), "Festius locals 2026 de l'Alt Empordà");
  assert.match(comarcaDescription(altEmporda, "ca"), /^Festius locals del 2026 dels 68 municipis de l'Alt Empordà en una taula, segons el DOGC\. Figueres, /);
  assert.match(comarcaCopy(altEmporda, "ca").lead, /^A l'Alt Empordà hi ha 68 municipis amb festius locals al calendari oficial del 2026/);
  // The comarca's shared days are counted from the towns' own and nuclei's days.
  const shared = sharedDates(altEmporda);
  assert.ok(shared.length > 0);
  for (const s of shared) {
    assert.equal(s.towns.length, altEmporda.municipalities.filter((m) => m.local.includes(s.date) || m.nuclei.some((n) => n.dates.includes(s.date))).length, s.date);
  }
  assert.ok(shared.every((s, i) => i === 0 || shared[i - 1]!.towns.length >= s.towns.length));
  // Excluded councils are named on their comarca's page.
  assert.match(comarcaCopy(comarcaBySlug("garraf")!, "ca").excluded ?? "", /^Canyelles no té festius locals/);
  assert.match(comarcaCopy(comarcaBySlug("valles-occidental")!, "es").excluded ?? "", /Cerdanyola del Vallès y Barberà del Vallès no tienen/);
  // Shops: the resolution's own lists, by name; every other council takes the defaults.
  const baixLlobregat = comarcaBySlug("baix-llobregat")!;
  assert.match(comarcaCopy(baixLlobregat, "ca").shops, /han triat els seus dies d'obertura comercial del 2026 \(Resolució EMT\/4342\/2025\): .*Sant Boi de Llobregat/);
  assert.match(comarcaCopy(comarcaBySlug("aran")!, "ca").shops, /^Cap ajuntament de l'Aran no consta a la Resolució EMT\/4342\/2025/);
  // Nuclei-only towns are named on their comarca's page.
  assert.match(comarcaCopy(comarcaBySlug("aran")!, "ca").nucleiOnly ?? "", /Vielha e Mijaran/);
});

/* -------------------------------------------------------------------------- */
/* Tranche 2 date pages                                                       */
/* -------------------------------------------------------------------------- */

test("1 November 2026: a Sunday the order leaves out, with no substitute day; 2 November elsewhere in Spain", () => {
  assert.equal(new Date("2026-11-01T12:00:00Z").getUTCDay(), 0, "a Sunday");
  // Ordre EMT/66/2025 lists twelve days, neither 1 nor 2 November.
  const regional = parseRegionalOrder(fixture("ordre-emt-66-2025.txt")).dates;
  assert.ok(!regional.includes("2026-11-01") && !regional.includes("2026-11-02"));
  const ca = dateContent("2026-11-01", "ca");
  const es = dateContent("2026-11-01", "es");
  const en = dateContent("2026-11-01", "en");
  assert.equal(ca.holiday, false);
  assert.equal(ca.answer, "No. El diumenge 1 de novembre de 2026, Tots Sants, no és festiu oficial a Catalunya: l'Ordre EMT/66/2025 no l'inclou entre els dotze festius de l'any, i tampoc no hi inclou el dilluns 2 de novembre.");
  assert.match(es.answer, /^No\. El domingo 1 de noviembre de 2026, Todos los Santos, no es festivo oficial en Cataluña: la Orden EMT\/66\/2025/);
  assert.match(en.answer, /^No\. Sunday 1 November 2026, All Saints' Day, is not an official holiday in Catalonia/);
  for (const c of [ca, es, en]) {
    // No invented substitute: nothing says the holiday "moves" to Monday in Catalonia.
    assert.doesNotMatch(JSON.stringify(c), /trasllada al dilluns|se traslada al lunes|moved to Monday|substitut|sustitu/i);
    assert.equal(c.local.places.length, 2, "the list under the text is 2 November's");
  }
  assert.match(ca.answerNote[0] ?? "", /tret dels 2 municipis on és festa local: Bossòst i Sant Esteve de Palautordera/);
  // BOE-A-2025-21667, row "2 Día siguiente a Todos los Santos".
  assert.match(es.answerNote[1] ?? "", /Andalucía, Aragón, Asturias, Canarias, Castilla-La Mancha, Castilla y León, Extremadura, la Comunidad de Madrid y Navarra, pero no en Cataluña/);
  assert.match(ca.local.text, /^L'1 de novembre no és festa local a cap municipi/);
  assert.match(ca.sections[0]!.paragraphs[0]!, /tret de les de l'Ametlla del Vallès i Mollet del Vallès/);
  assert.ok(ca.guides.includes("castanyada"));
});

test("11 and 30 November, 24 and 31 December 2026: working days with the order's local holidays, per locale", () => {
  const nov11 = { ca: dateContent("2026-11-11", "ca"), es: dateContent("2026-11-11", "es"), en: dateContent("2026-11-11", "en") };
  assert.match(nov11.ca.answer, /^No\. El dimecres 11 de novembre de 2026, Sant Martí, és un dia feiner a Catalunya: no és cap dels dotze festius de l'Ordre EMT\/66\/2025\. Sí que és festa local a 29 municipis i 21 nuclis\.$/);
  assert.match(nov11.es.answer, /San Martín, es laborable en Cataluña.*29 municipios y 21 núcleos/);
  assert.match(nov11.en.answer, /Saint Martin's Day, is a working day in Catalonia.*29 towns and 21 villages/);
  // The general strike: one sentence, one link, to the strikes hub.
  for (const locale of DATE_LOCALES) {
    const notice = dateContent("2026-11-11", locale).notice!;
    assert.equal(notice.href, GUIDES.strikes[locale]);
    const sentence = `${notice.before}${notice.label}${notice.after}`;
    assert.equal(sentence.split(/[.!?](\s|$)/).filter((s) => s && s.trim()).length, 1, sentence);
    assert.ok(!JSON.stringify(dateContent("2026-11-11", locale).sections).match(/vaga|huelga|strike/i), "the strike is not repeated");
  }
  for (const iso of ["2026-11-01", "2026-11-30", "2026-12-07", "2026-12-24", "2026-12-31"] as const) assert.equal(dateContent(iso, "ca").notice, undefined, iso);

  const nov30 = dateContent("2026-11-30", "ca");
  assert.match(nov30.answer, /El dilluns 30 de novembre de 2026, Sant Andreu, és un dia feiner a Catalunya.*24 municipis i 14 nuclis/);
  assert.match(nov30.sections[0]!.paragraphs[0]!, /si el 30 de novembre és un dels seus deu dies d'obertura comercial, com passa a Sant Andreu de la Barca/);
  assert.match(dateContent("2026-11-11", "ca").sections[0]!.paragraphs[0]!, /si l'11 de novembre és un dels seus deu dies d'obertura comercial, i no ho és en cap d'ells/);

  const dec24 = { ca: dateContent("2026-12-24", "ca"), es: dateContent("2026-12-24", "es"), en: dateContent("2026-12-24", "en") };
  assert.match(dec24.ca.answer, /la vigília de Nadal, és un dia feiner a Catalunya.*Només és festa local a 3 municipis: Copons, la Vajol i Sant Jaume de Frontanyà\.$/);
  assert.match(dec24.es.answer, /Nochebuena, es laborable en Cataluña.*Solo es fiesta local en 3 municipios: Copons, La Vajol y Sant Jaume de Frontanyà\.$/);
  assert.match(dec24.en.answer, /Christmas Eve, is a working day in Catalonia.*only in 3 towns: Copons, la Vajol and Sant Jaume de Frontanyà\.$/);
  assert.match(dec24.ca.sections[1]!.paragraphs[0]!, /22 de desembre de 2026 al 7 de gener de 2027/);

  const dec31 = { ca: dateContent("2026-12-31", "ca"), es: dateContent("2026-12-31", "es"), en: dateContent("2026-12-31", "en") };
  assert.match(dec31.ca.answer, /l'últim dia de l'any, és un dia feiner a Catalunya.*Només és festa local a 7 municipis i 2 nuclis\.$/);
  assert.match(dec31.es.answer, /Nochevieja, es laborable en Cataluña/);
  assert.match(dec31.en.answer, /New Year's Eve, is a working day in Catalonia/);
  assert.match(dec31.ca.answerNote[0]!, /divendres 1 de gener de 2027, Cap d'Any, és festiu a tot Catalunya \(Ordre EMT\/52\/2026\)/);
  assert.match(dec31.ca.sections[0]!.paragraphs[0]!, /com passa a Centelles/);
  for (const c of [nov11.ca, nov30, dec24.ca, dec31.ca]) assert.equal(c.holiday, false);
  for (const locale of DATE_LOCALES) {
    assert.ok(!dateContent("2026-12-24", locale).guides.includes("strikes"));
    assert.equal(dateContent("2026-11-30", locale).local.places.length, 38);
  }
});

test("tranche 2 date pages: slugs, titles and 404s", () => {
  assert.equal(datePath("ca", "2026-11-01"), "/ca/festius/dia/1-novembre-2026/");
  assert.equal(datePath("es", "2026-11-11"), "/es/festivos/dia/11-noviembre-2026/");
  assert.equal(datePath("en", "2026-11-30"), "/en/holidays/day/30-november-2026/");
  assert.equal(datePath("ca", "2026-12-24"), "/ca/festius/dia/24-desembre-2026/");
  assert.equal(datePath("es", "2026-12-31"), "/es/festivos/dia/31-diciembre-2026/");
  assert.equal(dateQuestion("2026-11-11", "ca"), "És festiu l'11 de novembre de 2026 a Catalunya?");
  assert.equal(dateQuestion("2026-11-01", "es"), "¿Es festivo el 1 de noviembre de 2026 en Cataluña?");
  assert.equal(dateQuestion("2026-12-31", "en"), "Is 31 December 2026 a public holiday in Catalonia?");
  assert.equal(resolveDatePage("ca", "ca", "1-novembre-2026"), "2026-11-01");
  assert.equal(resolveDatePage("en", "en", "11-november-2026"), "2026-11-11");
  assert.equal(resolveDatePage("es", "es", "30-noviembre-2026"), "2026-11-30");
  // Not pages: the Monday after Tots Sants, other days, other locales' slugs, other routes' locales.
  assert.equal(resolveDatePage("ca", "ca", "2-novembre-2026"), null);
  assert.equal(resolveDatePage("ca", "ca", "1-novembre-2027"), null);
  assert.equal(resolveDatePage("es", "es", "1-novembre-2026"), null);
  assert.equal(resolveDatePage("en", "ca", "1-november-2026"), null);
  assert.equal(resolveDatePage("es", "en", "24-diciembre-2026"), null);
  // Tranche 2 towns render in both locales; towns with no official days do not.
  assert.equal(resolveMunicipality("ca", "ca", "sentmenat")?.name, "Sentmenat");
  assert.equal(resolveMunicipality("es", "es", "bigues-i-riells-del-fai")?.name, "Bigues i Riells del Fai");
  assert.equal(resolveMunicipality("es", "ca", "sentmenat"), null);
  for (const slug of ["argentona", "calaf", "monistrol-de-montserrat", "torello"]) assert.equal(resolveMunicipality("ca", "ca", slug), null, slug);
  // Only the 20 biggest are prerendered; tranche 2 renders on first request.
  assert.ok(!municipalityStaticParams("ca").some((p) => p.municipi === "sentmenat"));
});

test("tranche 3 routes: every listed town resolves in ca and es, excluded councils and comarca slugs 404", () => {
  for (const m of SNAPSHOT.municipalities) {
    assert.equal(resolveMunicipality("ca", "ca", m.slug), m);
    assert.equal(resolveMunicipality("es", "es", m.slug), m);
    assert.equal(resolveMunicipality("ca", "en", m.slug), null);
    assert.equal(resolveComarca("ca", "ca", m.slug), null, `${m.slug} is not a comarca`);
  }
  // No proposal, no page: every excluded council 404s in both locales.
  for (const e of SNAPSHOT.excluded) {
    for (const locale of MUNI_LOCALES) assert.equal(resolveMunicipality(locale, locale, slugify(e.name)), null, e.name);
  }
  for (const slug of ["aiguafreda", "la-febro", "bausen", "el-pont-de-bar", "orrius"]) assert.equal(resolveMunicipality("ca", "ca", slug), null, slug);
  // The new small towns render on request in both locales.
  for (const slug of ["sant-jaume-de-frontanya", "lladorre", "montgai", "avinyonet-del-penedes"]) {
    assert.ok(resolveMunicipality("ca", "ca", slug) && resolveMunicipality("es", "es", slug), slug);
    assert.ok(!municipalityStaticParams("ca").some((p) => p.municipi === slug), slug);
  }
  // Comarca pages: each folder its own locale; unknown slugs, town slugs and the bare segment 404.
  assert.equal(resolveComarca("ca", "ca", "alt-emporda")?.comarca, "Alt Empordà");
  assert.equal(resolveComarca("es", "es", "pla-d-urgell")?.comarca, "Pla d'Urgell");
  assert.equal(resolveComarca("es", "ca", "alt-emporda"), null);
  assert.equal(resolveComarca("ca", "es", "alt-emporda"), null);
  assert.equal(resolveComarca("ca", "en", "alt-emporda"), null);
  for (const slug of ["girona", "comarca", "alt-emporda-2026", "Alt-Emporda", ""]) assert.equal(resolveComarca("ca", "ca", slug), null, slug);
  // "comarca" and "dia" are route segments, never towns.
  assert.equal(resolveMunicipality("ca", "ca", "comarca"), null);
  assert.equal(comarcaPath("ca", "alt-emporda"), "/ca/festius/comarca/alt-emporda/");
  assert.equal(comarcaPath("es", "baix-llobregat"), "/es/festivos/comarca/baix-llobregat/");
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

test("routes: static params - 20 towns and all eleven dates, always complete and in the route's own locale", () => {
  for (const locale of MUNI_LOCALES) {
    const params = municipalityStaticParams(locale);
    assert.equal(params.length, 20);
    assert.equal(params[0]?.municipi, "barcelona");
    // Complete params for every call: one set missing `municipi` would make Next prerender nothing.
    assert.ok(params.every((p) => p.locale === locale && resolveMunicipality(locale, p.locale, p.municipi)));
  }
  for (const locale of DATE_LOCALES) {
    const params = dateStaticParams(locale);
    assert.equal(params.length, 11);
    assert.ok(params.every((p) => p.locale === locale && resolveDatePage(locale, p.locale, p.dia)));
  }
  // Comarca pages: the four most populous comarques at deploy, the rest on first request.
  for (const locale of MUNI_LOCALES) {
    const params = comarcaStaticParams(locale);
    assert.deepEqual(params.map((p) => p.comarca), ["barcelones", "valles-occidental", "baix-llobregat", "maresme"]);
    assert.ok(params.every((p) => p.locale === locale && resolveComarca(locale, p.locale, p.comarca)));
  }
});

test("route files: one per locale folder, revalidate=false, calling the resolver for their own locale", () => {
  const app = join(ROOT, "src/app/(public)/[locale]");
  const files: [string, string, RegExp][] = [
    ["festius/page.tsx", "ca", /hubAllowed\("ca"/],
    ["festivos/page.tsx", "es", /hubAllowed\("es"/],
    ["festius/[municipi]/page.tsx", "ca", /resolveMunicipality\("ca"/],
    ["festivos/[municipi]/page.tsx", "es", /resolveMunicipality\("es"/],
    ["festius/comarca/[comarca]/page.tsx", "ca", /resolveComarca\("ca"/],
    ["festivos/comarca/[comarca]/page.tsx", "es", /resolveComarca\("es"/],
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
  // All 917 towns x 2 locales (tranche 3).
  const bothYears: string[] = [];
  for (const m of SNAPSHOT.municipalities) {
    for (const locale of MUNI_LOCALES) {
      const title = municipalityTitle(m, locale);
      const description = municipalityDescription(m, locale);
      const name = locale === "es" ? esName(m.name) : m.name;
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
      assert.match(title, locale === "ca" ? /^Festius (locals )?/ : /^Festivos (locales )?/);
      assert.ok(title.includes(String(YEAR)), title);
      // Both years whenever the shortest two-year form fits.
      if (`Festivos ${name} ${YEAR} y ${NEXT}`.length <= 60) assert.ok(title.includes(String(NEXT)), title);
      else bothYears.push(title);
      assert.ok(title.includes(name), title);
      assert.ok(description.includes(String(YEAR)));
      assert.ok(description.includes(name), description);
    }
  }
  assert.deepEqual(bothYears, ["Festius Cruïlles, Monells i Sant Sadurní de l'Heura 2026", "Festivos Cruïlles, Monells i Sant Sadurní de l'Heura 2026"]);
  // Comarca pages, 43 x 2.
  for (const g of byComarca()) {
    for (const locale of MUNI_LOCALES) {
      const title = comarcaTitle(g, locale);
      const description = comarcaDescription(g, locale);
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
      assert.ok(title.includes(g.comarca) && title.includes(String(YEAR)), title);
      assert.ok(description.includes(g.comarca) && description.includes(String(YEAR)), description);
    }
  }
  // Top-3 push, 30 Oct 2026: the tail asks the "hoy es festivo en …" question the status block answers.
  assert.equal(municipalityTitle(SNAPSHOT.municipalities.find((m) => m.slug === "girona")!, "ca"), "Festius locals Girona 2026 i 2027: avui és festiu?");
  assert.equal(municipalityTitle(SNAPSHOT.municipalities.find((m) => m.slug === "girona")!, "es"), "Festivos locales Girona 2026 y 2027: ¿hoy es festivo?");
  assert.match(
    municipalityDescription(SNAPSHOT.municipalities.find((m) => m.slug === "tarragona")!, "es"),
    /^Festivos locales de Tarragona en 2026: 19 de agosto y 23 de septiembre\. Calendario laboral 2027/,
  );
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

test("sitemap: 1,955 URLs, unique, dated with the dataset, with hreflang", () => {
  const entries = holidaySitemapEntries();
  // 2 hubs, 43 comarques x 2, 917 towns x 2 locales, 11 dates x 3 locales.
  assert.equal(entries.length, 2 + 86 + 1834 + 33);
  for (const m of SNAPSHOT.municipalities) {
    for (const locale of MUNI_LOCALES) assert.ok(entries.some((e) => e.url.endsWith(municipalityPath(locale, m.slug))), m.slug);
  }
  for (const e of SNAPSHOT.excluded) assert.ok(!entries.some((x) => x.url.endsWith(`/${slugify(e.name)}/`)), e.name);
  const comarca = entries.find((e) => e.url.endsWith("/ca/festius/comarca/alt-emporda/"))!;
  assert.deepEqual(Object.keys((comarca.alternates?.languages ?? {}) as Record<string, string>).sort(), ["ca", "es", "x-default"]);
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

test("date pages: 1, 11 and 30 Nov and 7, 24 and 31 Dec are not holidays; nothing unfilled", () => {
  const working = new Set(["2026-11-01", "2026-11-11", "2026-11-30", "2026-12-07", "2026-12-24", "2026-12-31"]);
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) {
      const content = dateContent(iso, locale);
      assert.equal(content.holiday, !working.has(iso), `${iso} ${locale}`);
      assert.equal(content.holiday, regionalDays(Number(iso.slice(0, 4))).some((d) => d.date === iso), `${iso}: the answer is the order's`);
      const text = JSON.stringify({ ...content, local: { ...content.local, places: [] } });
      assert.ok(!/\{\w+\}|undefined|NaN|null/.test(text), `${iso} ${locale}`);
      assert.ok(content.guides.length >= 4);
    }
  }
  assert.match(dateContent("2026-12-07", "ca").answer, /43 municipis i 2 nuclis/);
  assert.match(dateContent("2026-12-26", "es").answer, /Arán/);
});

test("siblings: every page links to at least six other towns, same comarca first", () => {
  const linkedFrom = new Map<string, number>();
  for (const m of SNAPSHOT.municipalities) {
    const { sameComarca, others, comarcaTotal } = siblings(m);
    assert.ok(sameComarca.length + others.length >= 6, m.name);
    assert.ok(sameComarca.length <= 12, `${m.name}: ${sameComarca.length} comarca links`);
    assert.ok(sameComarca.every((o) => o.comarca === m.comarca && o.slug !== m.slug));
    assert.equal(comarcaTotal, SNAPSHOT.municipalities.filter((o) => o.comarca === m.comarca).length);
    // Below the cap a page lists its whole comarca.
    if (comarcaTotal <= 13) assert.equal(sameComarca.length, comarcaTotal - 1, m.name);
    for (const o of [...sameComarca, ...others]) linkedFrom.set(o.slug, (linkedFrom.get(o.slug) ?? 0) + 1);
  }
  // Every town page that shares its comarca, tranche 2 included, is linked from other town pages, not only from the hub.
  for (const m of SNAPSHOT.municipalities) {
    if (siblings(m).comarcaTotal > 1) assert.ok((linkedFrom.get(m.slug) ?? 0) >= 1, `${m.slug}: linked from no town page`);
  }
  const sbl = siblings(SNAPSHOT.municipalities.find((m) => m.slug === "sant-boi-de-llobregat")!);
  assert.equal(sbl.comarcaTotal, 30);
  assert.equal(sbl.sameComarca.length, 12);
  // The comarca's largest towns are on every page of the comarca.
  for (const g of byComarca()) {
    for (const big of g.municipalities.slice(0, 3)) {
      for (const m of g.municipalities) if (m !== big) assert.ok(siblings(m).sameComarca.includes(big), `${m.slug} -> ${big.slug}`);
    }
    // Neighbours in the comarca's population order link each other, so the smallest town is linked from the next one up.
    g.municipalities.forEach((m, i) => {
      const next = g.municipalities[i + 1];
      if (next) assert.ok(siblings(m).sameComarca.includes(next) && siblings(next).sameComarca.includes(m), `${m.slug} <-> ${next.slug}`);
    });
  }
  assert.equal(byComarca().reduce((n, g) => n + g.municipalities.length, 0), 917);
  // The largest comarca: still twelve links, and the page links the comarca's table for the other 55.
  const smallest = comarcaBySlug("alt-emporda")!.municipalities.at(-1)!;
  assert.equal(siblings(smallest).comarcaTotal, 68);
  assert.equal(siblings(smallest).sameComarca.length, 12);
  const page = readFileSync(join(ROOT, "src/components/programmatic/holidays/MunicipalityPage.tsx"), "utf8");
  assert.match(page, /comarcaPath\(locale, comarcaOf\(m\)\.slug\)/);
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
    assert.equal(GUIDES.strikes[locale], b2("strikes", locale));
    assert.equal(GUIDES.castanyada[locale], `/${locale}/${ARTICLE_PATHS.castanyada[locale]}/`);
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
    "src/components/programmatic/holidays/ComarcaPage.tsx",
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

/* -------------------------------------------------------------------------- */
/* Top-3 push, 30 Oct 2026: questions in the searchers' words                 */
/* -------------------------------------------------------------------------- */

test("town FAQ: hoy, mañana, calendario laboral 2027 and the next two asked dates, answered from the DOGC data", () => {
  const bcn = SNAPSHOT.municipalities.find((m) => m.slug === "barcelona")!;
  const es = municipalityFaq(bcn, "es", null, "2026-10-31");
  assert.deepEqual(
    es.map((i) => i.question),
    [
      "¿Hoy es festivo en Barcelona?",
      "¿Mañana es festivo en Barcelona?",
      "¿Cuál es el calendario laboral 2027 de Barcelona?",
      "¿El lunes 2 de noviembre es festivo en Barcelona?",
      "¿El miércoles 11 de noviembre es festivo en Barcelona?",
    ],
  );
  assert.match(es[0]!.answer, /el lunes 25 de mayo y el jueves 24 de septiembre/);
  assert.match(es[2]!.answer, /todavía no se han publicado/);
  assert.match(es[3]!.answer, /^No: en Barcelona es laborable\./);
  assert.equal(es[3]!.link?.href, "/es/festivos/dia/1-noviembre-2026/");
  // A town whose own local day is asked about says yes; one where only a nucleus has it says so.
  for (const m of SNAPSHOT.municipalities) {
    for (const locale of ["ca", "es"] as const) {
      const faq = municipalityFaq(m, locale, null, "2026-11-01");
      assert.equal(faq.length, 5, m.slug);
      for (const item of faq) assert.ok(!/undefined|NaN|\$\{|\{\w+\}/.test(item.question + item.answer), `${m.slug} ${locale}: ${item.answer}`);
      const nov11 = faq.find((i) => i.question.includes("11 de novembre") || i.question.includes("11 de noviembre"))!;
      if (m.local.includes("2026-11-11")) assert.match(nov11.answer, /^Sí/, m.slug);
      else if (m.nuclei.some((n) => n.dates.includes("2026-11-11"))) assert.match(nov11.answer, /^(Només|Solo) en part/, m.slug);
      else assert.match(nov11.answer, /^No/, m.slug);
    }
  }
  // After the last asked date there is nothing left to ask about.
  assert.equal(municipalityFaq(bcn, "ca", null, "2027-01-01").length, 3);
});

test("town pages link the work and school calendars with the year in the anchor", () => {
  const parts = readFileSync(join(ROOT, "src/components/programmatic/holidays/parts.tsx"), "utf8");
  assert.match(parts, /Calendario laboral \$\{PLANNER_YEAR\} de Cataluña/);
  assert.match(parts, /Calendario escolar \$\{SCHOOL_LABEL\}/);
  const page = readFileSync(join(ROOT, "src/components/programmatic/holidays/MunicipalityPage.tsx"), "utf8");
  assert.match(page, /GUIDES\.school\[locale\]/);
  assert.match(page, /municipalityFaq\(/);
  const routes = readFileSync(join(ROOT, "src/components/programmatic/holidays/routes.tsx"), "utf8");
  assert.match(routes, /faqSchema\(/);
});
