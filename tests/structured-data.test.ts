import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// Absolute URLs are built for the production host only in production.
process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { DATASET_DESCRIPTION_MIN, GENCAT_OPEN_DATA_LICENCE, datasetSchema, graph, townEventSchema } = await import("../src/lib/seo/jsonld.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");
const holidays = await import("../src/lib/programmatic/holidays/structured.ts");
const holidayData = await import("../src/lib/programmatic/holidays/data.ts");
const holidayCopy = await import("../src/lib/programmatic/holidays/copy.ts");
const fuel = await import("../src/lib/programmatic/fuel/structured.ts");
const fuelData = await import("../src/lib/programmatic/fuel/data.ts");
const fuelCopy = await import("../src/lib/programmatic/fuel/copy.ts");
const fuelPaths = await import("../src/lib/programmatic/fuel/paths.ts");
const reservoirs = await import("../src/lib/programmatic/reservoirs/structured.ts");
const reservoirData = await import("../src/lib/programmatic/reservoirs/data.ts");
const reservoirCopy = await import("../src/lib/programmatic/reservoirs/copy.ts");
const elections = await import("../src/lib/programmatic/elections/structured.ts");
const electionPages = await import("../src/lib/programmatic/elections/pages.ts");
const electionSnapshot = await import("../src/lib/programmatic/elections/snapshot.ts");
const weekend = await import("../src/lib/programmatic/weekend/structured.ts");
const weekendData = await import("../src/lib/programmatic/weekend/data.ts");
const { weekendWindow } = await import("../src/lib/content/weekend/agenda.ts");

const ORIGIN = "https://www.catalunyainfo.com";
type Json = Record<string, unknown>;

/** The fields Google requires or recommends for a Dataset, present and from the official source. */
function assertDataset(node: Json | null, expect: { path: string; name: string; description: string; creator: string; license: string }) {
  assert.ok(node, `no Dataset for ${expect.path}`);
  assert.equal(node["@type"], "Dataset");
  assert.equal(node.url, `${ORIGIN}${expect.path}`);
  assert.equal(node["@id"], `${ORIGIN}${expect.path}#dataset`);
  assert.equal(node.name, expect.name, `${expect.path}: the name must be the page's H1`);
  assert.equal(node.description, expect.description, `${expect.path}: the description must be the meta description`);
  assert.ok(String(node.description).length >= DATASET_DESCRIPTION_MIN);
  assert.deepEqual(node.creator, { "@type": "Organization", name: expect.creator });
  assert.equal(node.license, expect.license);
  const based = ([] as string[]).concat(node.isBasedOn as string | string[]);
  assert.ok(based.length > 0 && based.every((u) => u.startsWith("https://")), `${expect.path}: isBasedOn must name the official sources`);
  assert.equal(node.isAccessibleForFree, true);
  assert.equal((node.spatialCoverage as Json)["@type"], "Place");
  // Never ours: the data is the publisher's.
  assert.ok(!JSON.stringify(node).includes("CatalunyaInfo"), `${expect.path}: the Dataset must not claim CatalunyaInfo as creator`);
}

test("datasetSchema refuses a description Google would ignore, rather than padding it", () => {
  const base = { path: "/es/x/", name: "X", locale: "es" as const, creator: "Generalitat", license: GENCAT_OPEN_DATA_LICENCE, isBasedOn: ["https://example.org/d"], spatialCoverage: "Cataluña" };
  assert.equal(datasetSchema({ ...base, description: "Demasiado corta." }), null);
  assert.equal(datasetSchema({ ...base, description: "x".repeat(60), isBasedOn: [] }), null);
  assert.ok(datasetSchema({ ...base, description: "x".repeat(60) }));
});

test("the Generalitat licence is the one the transparency portal states for these datasets", () => {
  assert.equal(GENCAT_OPEN_DATA_LICENCE, "https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/");
});

test("every holiday municipality page and hub carries a Dataset from the Generalitat", () => {
  for (const locale of ["ca", "es"] as const) {
    for (const m of holidayData.municipalities()) {
      assertDataset(holidays.municipalityDataset(m, locale), {
        path: `/${locale}/${locale === "ca" ? "festius" : "festivos"}/${m.slug}/`,
        name: holidayCopy.municipalityH1(m, locale),
        description: holidayCopy.municipalityDescription(m, locale),
        creator: holidays.HOLIDAY_DATA_CREATOR,
        license: GENCAT_OPEN_DATA_LICENCE,
      });
    }
    const hub = holidays.holidayHubDataset(locale);
    assertDataset(hub, { path: `/${locale}/${locale === "ca" ? "festius" : "festivos"}/`, name: holidayCopy.hubCopy(locale).h1, description: holidayCopy.hubCopy(locale).description, creator: holidays.HOLIDAY_DATA_CREATOR, license: GENCAT_OPEN_DATA_LICENCE });
    // Tranche 3: the comarca tables carry the same data.
    for (const g of holidayData.byComarca()) {
      assertDataset(holidays.comarcaDataset(g, locale), {
        path: `/${locale}/${locale === "ca" ? "festius" : "festivos"}/comarca/${g.slug}/`,
        name: holidayCopy.comarcaH1(g, locale),
        description: holidayCopy.comarcaDescription(g, locale),
        creator: holidays.HOLIDAY_DATA_CREATOR,
        license: GENCAT_OPEN_DATA_LICENCE,
      });
    }
  }
  const girona = holidays.municipalityDataset(holidayData.municipalityBySlug("girona")!, "es")!;
  assert.deepEqual(girona.isBasedOn, [holidayData.SNAPSHOT.sources.localOpenData.url, holidayData.SNAPSHOT.sources.localOrder.url]);
  assert.equal(girona.dateModified, holidayData.SNAPSHOT.readOn);
  assert.match(String(girona.temporalCoverage), /^\d{4}(\/\d{4})?$/);
});

test("every fuel page carries a Dataset credited to the Ministry under CC BY 4.0, with no date", () => {
  const prices = fuelData.MUNICIPALITIES.sources.prices;
  assert.equal(prices.licenceUrl, "https://creativecommons.org/licenses/by/4.0/");
  for (const locale of ["ca", "es"] as const) {
    for (const place of fuelData.selectPages()) {
      const node = fuel.fuelPlaceDataset(place, locale);
      assertDataset(node, {
        path: fuelPaths.fuelPath(locale, place.kind, place.slug),
        name: fuelCopy.fuelH1(place, locale),
        description: fuelCopy.fuelDescription(place, locale),
        creator: prices.publisher,
        license: prices.licenceUrl,
      });
      // Prices are read live in the browser: no date in the HTML would be true.
      assert.equal(node!.dateModified, undefined);
    }
    assert.ok(fuel.fuelHubDataset(locale));
  }
});

test("every reservoir page carries a Dataset credited as the ACA's licence asks", () => {
  assert.equal(reservoirs.reservoirCreator(), "Generalitat de Catalunya. Departament de Territori, Habitatge i Transició Ecològica. Agència Catalana de l'Aigua");
  for (const locale of LOCALES) {
    for (const r of reservoirData.RESERVOIR_DATA) {
      const node = reservoirs.reservoirDataset(r, locale);
      assert.ok(node);
      assert.equal(node.name, reservoirCopy.reservoirH1(r, locale));
      assert.equal(node.description, reservoirCopy.reservoirDescription(r, locale));
      assert.equal(node.license, GENCAT_OPEN_DATA_LICENCE);
      assert.deepEqual(node.isBasedOn, [reservoirData.SNAPSHOT.sources.daily.url, reservoirData.SNAPSHOT.sources.history.url]);
      assert.equal(node.dateModified, undefined);
    }
    assert.ok(reservoirs.reservoirHubDataset(locale));
  }
});

test("every election page carries a Dataset spanning the three elections it tabulates", () => {
  const { SNAPSHOT } = electionSnapshot;
  for (const locale of LOCALES) {
    for (const m of electionPages.municipalitiesFor(locale)) {
      const node = elections.electionDataset(m, locale, `H1 ${m.name}`);
      assert.ok(node, `${locale} ${m.slug}`);
      assert.equal(node.description, electionPages.electionDescription(locale, m));
      assert.equal(node.temporalCoverage, "2023-05-28/2024-05-12");
      assert.equal((node.creator as Json).name, SNAPSHOT.sources.votes.publisher);
      assert.equal(node.dateModified, SNAPSHOT.readAt);
    }
    assert.ok(elections.electionHubDataset(locale));
  }
});

test("fair Events: only the fairs the page lists, confirmed dates only, each with name, dates and a town address", () => {
  const window = weekendWindow("2026-10-30");
  const hubEvents = weekend.fairEvents(weekendData.listedFairs(null, window), "/es/fin-de-semana/", "es");
  assert.ok(hubEvents.length > 0, "the hub lists upcoming fairs, so it carries Events");
  for (const zone of [null, ...weekendData.shippedZones()]) {
    const listed = weekendData.listedFairs(zone, window);
    const events = weekend.fairEvents(listed, "/es/fin-de-semana/", "es");
    const shown = new Set([...listed.now, ...listed.next].map((f) => f.id));
    const confirmed = [...shown].filter((id) => !weekendData.FAIRS.find((f) => f.id === id)!.toConfirm);
    assert.equal(events.length, confirmed.length, `zone ${zone?.id ?? "hub"}`);
    for (const event of events) {
      assert.equal(event["@type"], "Event");
      assert.ok(event.name);
      assert.match(String(event.startDate), /^\d{4}-\d{2}-\d{2}$/);
      assert.match(String(event.endDate), /^\d{4}-\d{2}-\d{2}$/);
      const location = event.location as Json;
      const address = location.address as Json;
      assert.ok(address.addressLocality && address.addressRegion && address.addressCountry === "ES");
      // Nothing beyond what the official calendar gives.
      assert.equal(event.offers, undefined);
      assert.equal(event.organizer, undefined);
      assert.equal(event.image, undefined);
    }
  }
  // A fair flagged "to be confirmed" is never marked up.
  const unconfirmed = { id: "x", name: "Fira", town: "Vic", ine: "08298", comarca: "24", province: "08" as const, start: "2026-10-31", end: "2026-11-01", sector: "", sectorEs: "", web: null, toConfirm: true };
  assert.equal(weekend.fairEvents({ now: [unconfirmed], next: [] }, "/ca/cap-de-setmana/", "ca").length, 0);
});

test("townEventSchema names the municipality as place and address, nothing more", () => {
  const event = townEventSchema({ path: "/ca/cap-de-setmana/", id: "42", name: "Fira de Sant Andreu", startDate: "2026-11-28", endDate: "2026-11-29", town: "Granollers", region: "Barcelona" });
  assert.equal(event["@id"], `${ORIGIN}/ca/cap-de-setmana/#event-42`);
  assert.deepEqual(event.location, {
    "@type": "Place",
    name: "Granollers",
    address: { "@type": "PostalAddress", addressLocality: "Granollers", addressRegion: "Barcelona", addressCountry: "ES" },
  });
  assert.equal(event.url, undefined);
});

test("graph() drops a refused Dataset instead of emitting null", () => {
  const out = JSON.parse(graph([{ "@type": "BreadcrumbList" }, null]));
  assert.equal(out["@graph"].length, 1);
});

/* -------------------------------------------------------------------------- */
/* Bundle guard                                                               */
/* -------------------------------------------------------------------------- */

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : full.endsWith(".tsx") || full.endsWith(".ts") ? [full] : [];
  });
}

test("no client component imports the i18n dictionaries (they would ship all three languages)", () => {
  const offenders = filesUnder(join(import.meta.dirname, "..", "src"))
    .filter((file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8")))
    .filter((file) => /^import\s+\{[^}]*\}\s+from\s+"@\/lib\/i18n";/m.test(readFileSync(file, "utf8")));
  assert.deepEqual(offenders, []);
});

/* -------------------------------------------------------------------------- */
/* Live boxes keep their space                                                */
/* -------------------------------------------------------------------------- */

test("the holiday and fuel live boxes render an invisible skeleton before their data (no layout shift)", () => {
  const root = join(import.meta.dirname, "..", "src");
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");
  assert.match(css, /\.ci-live-skeleton\s*\{\s*visibility:\s*hidden;\s*\}/);
  assert.match(css, /\.ci-live-pending > \.ci-live-placeholder\s*\{[^}]*position:\s*absolute;/);
  for (const file of ["components/programmatic/holidays/HolidayStatus.tsx", "components/programmatic/fuel/FuelPrices.tsx"]) {
    const source = readFileSync(join(root, file), "utf8");
    assert.match(source, /className="ci-live-pending"/, file);
    assert.match(source, /className="ci-live-skeleton[^"]*" aria-hidden="true"/, file);
    assert.match(source, /ci-live-placeholder/, file);
  }
  // The fuel page tells the skeleton how many rows to hold.
  assert.match(readFileSync(join(root, "components/programmatic/fuel/FuelPlacePage.tsx"), "utf8"), /expectedRows=\{Math\.min\(10, stations\.length\)\}/);
});
