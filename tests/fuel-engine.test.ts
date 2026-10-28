import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { GET } from "../src/app/api/fuel/catalonia/route.ts";
import { DESCRIPTION_LIMIT, GEOPORTAL_HOME, TITLE_LIMIT, fuelDescription, fuelH1, fuelTitle, guidance, hubMeta, liveLabels, placeLead } from "../src/lib/programmatic/fuel/copy.ts";
import {
  CHAINS,
  CITY_MIN_STATIONS,
  COMARCA_MIN_STATIONS,
  MUNICIPALITIES,
  STATIONS,
  chains,
  cities,
  citySiblings,
  comarques,
  pages,
  provinces,
  selectPages,
  stationsOf,
  type Place,
} from "../src/lib/programmatic/fuel/data.ts";
import { FRESH_HOURS, MAX_SHOWN_HOURS, freshness, matches, median, ministryTimestampToIso, parseCoordinate, parsePrice, rank, type LiveStation } from "../src/lib/programmatic/fuel/live.ts";
import { fromIdescat, fromMinistry } from "../src/lib/programmatic/fuel/names.ts";
import { FUEL_LOCALES, fuelHubPath, fuelPath, fuelTranslations, type FuelLocale } from "../src/lib/programmatic/fuel/paths.ts";
import {
  PRERENDERED_CITIES,
  PRERENDERED_COMARQUES,
  cityStaticParams,
  comarcaStaticParams,
  fuelHubAllowed,
  provinceStaticParams,
  resolveCityOrChain,
  resolveComarca,
  resolveProvince,
} from "../src/lib/programmatic/fuel/routing.ts";
import { fuelFamilyPaths, fuelSitemapEntries } from "../src/lib/programmatic/fuel/sitemap.ts";
import { API_URLS, FAILURE_CACHE, GEOPORTAL_URL, SUCCESS_CACHE, compactPayload, compactStation, loadCatalonia } from "../src/lib/programmatic/fuel/upstream.ts";
import { SLUG_PATTERN } from "../src/lib/programmatic/holidays/slug.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";

const ROOT = join(import.meta.dirname, "..");
/** Recorded from the Ministry's service on 28 Oct 2026 at 11:36:05 (26 of the 1,482 stations, unedited). */
const FIXTURE = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/fuel/catalonia-2026-10-28.json"), "utf8")) as {
  Fecha: string;
  ListaEESSPrecio: Record<string, string>[];
  ResultadoConsulta: string;
};
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* -------------------------------------------------------------------------- */
/* Snapshot shape and invariants                                              */
/* -------------------------------------------------------------------------- */

test("snapshot: dated, every Ministry municipality mapped to an INE code, a comarca and a province", () => {
  assert.match(MUNICIPALITIES.readOn, ISO);
  assert.equal(STATIONS.readOn, MUNICIPALITIES.readOn);
  assert.match(MUNICIPALITIES.ministryTimestamp, /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
  assert.equal(MUNICIPALITIES.sources.prices.licence, "CC BY 4.0");
  assert.match(MUNICIPALITIES.sources.prices.api, /ServiciosRESTCarburantes\/PreciosCarburantes\/EstacionesTerrestres\/FiltroCCAA\/09$/);

  const ids = new Set<string>();
  const ines = new Set<string>();
  for (const m of MUNICIPALITIES.municipalities) {
    assert.ok(!ids.has(m.id), `duplicate id ${m.id}`);
    assert.ok(!ines.has(m.ine), `duplicate INE ${m.ine}`);
    ids.add(m.id);
    ines.add(m.ine);
    assert.match(m.ine, /^\d{5}$/);
    assert.equal(m.ine.slice(0, 2), m.province, `${m.name}: INE province`);
    assert.ok(["08", "17", "25", "43"].includes(m.province));
    assert.ok(MUNICIPALITIES.comarques[m.comarca], `${m.name}: comarca ${m.comarca}`);
    assert.ok(m.stations >= 1);
    assert.equal(m.name, m.name.trim());
  }
  assert.ok(MUNICIPALITIES.municipalities.length > 400, "about 440 municipalities have a station");
  assert.equal(Object.keys(MUNICIPALITIES.comarques).length, 43, "42 comarques and Aran");
});

test("snapshot: stations are unique, trimmed, located, and add up to the municipalities' counts", () => {
  const byId = new Map(MUNICIPALITIES.municipalities.map((m) => [m.id, m]));
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const s of STATIONS.stations) {
    assert.ok(!seen.has(s.id), `duplicate station ${s.id}`);
    seen.add(s.id);
    assert.equal(s.brand, s.brand.trim());
    assert.ok(s.address.length > 0, `${s.id}: address`);
    assert.ok(byId.has(s.municipality), `${s.id}: municipality ${s.municipality}`);
    counts.set(s.municipality, (counts.get(s.municipality) ?? 0) + 1);
  }
  assert.ok(STATIONS.stations.length >= 1000);
  for (const m of MUNICIPALITIES.municipalities) assert.equal(counts.get(m.id), m.stations, m.name);
  // No prices in the committed files: they are read live.
  for (const s of STATIONS.stations) assert.deepEqual(Object.keys(s), ["id", "brand", "address", "municipality"]);
  assert.doesNotMatch(JSON.stringify(MUNICIPALITIES) + JSON.stringify(STATIONS), /Precio [A-Z]/);
});

test("snapshot: names as the official article-first form, renamed municipalities under today's name", () => {
  const byId = (id: string) => MUNICIPALITIES.municipalities.find((m) => m.id === id);
  assert.deepEqual(
    { ...byId("965") },
    { id: "965", ine: "08101", name: "l'Hospitalet de Llobregat", ministryName: "Hospitalet de Llobregat (L')", comarca: "13", province: "08", stations: byId("965")!.stations },
  );
  assert.equal(byId("978")?.ine, "08113"); // Manresa
  assert.equal(byId("978")?.comarca, "07"); // Bages
  assert.equal(MUNICIPALITIES.comarques["07"], "Bages");
  const palamos = MUNICIPALITIES.municipalities.find((m) => m.ministryName === "Palamós");
  assert.equal(palamos?.ine, "17118");
  const rapita = MUNICIPALITIES.municipalities.find((m) => m.ministryName === "Sant Carles de la Ràpita");
  assert.equal(rapita?.name, "la Ràpita");
  assert.equal(MUNICIPALITIES.municipalities.find((m) => m.ministryName === "Jonquera (La)")?.name, "la Jonquera");
});

test("names: Ministry and Idescat forms to article-first", () => {
  assert.equal(fromMinistry("Hospitalet de Llobregat (L')"), "l'Hospitalet de Llobregat");
  assert.equal(fromMinistry("Jonquera (La)"), "la Jonquera");
  assert.equal(fromMinistry("Plans de Sió (Els)"), "els Plans de Sió");
  assert.equal(fromMinistry("Manresa"), "Manresa");
  assert.equal(fromIdescat("Hospitalet de Llobregat, l'"), "l'Hospitalet de Llobregat");
  assert.equal(fromIdescat("Garriga, la"), "la Garriga");
  assert.equal(fromIdescat("Bòrdes, Es"), "Es Bòrdes");
  assert.equal(fromIdescat("Saus, Camallera i Llampaies"), "Saus, Camallera i Llampaies");
  assert.equal(fromIdescat("Castell d'Aro, Platja d'Aro i s'Agaró"), "Castell d'Aro, Platja d'Aro i s'Agaró");
});

/* -------------------------------------------------------------------------- */
/* Which places get a page                                                    */
/* -------------------------------------------------------------------------- */

test("pages: four provinces, comarques and cities above their thresholds, the two Catalan chains", () => {
  assert.deepEqual(
    provinces().map((p) => [p.slug, p.code]),
    [
      ["barcelona", "08"],
      ["girona", "17"],
      ["lleida", "25"],
      ["tarragona", "43"],
    ],
  );
  assert.equal(provinces().reduce((n, p) => n + p.stations, 0), STATIONS.stations.length);

  for (const c of comarques()) assert.ok(c.stations >= COMARCA_MIN_STATIONS, `${c.name}: ${c.stations}`);
  const perComarca = new Map<string, number>();
  for (const m of MUNICIPALITIES.municipalities) perComarca.set(m.comarca, (perComarca.get(m.comarca) ?? 0) + m.stations);
  for (const [code, n] of perComarca) {
    const hasPage = comarques().some((c) => c.code === code);
    assert.equal(hasPage, n >= COMARCA_MIN_STATIONS, `${MUNICIPALITIES.comarques[code]}: ${n} stations`);
  }

  for (const c of cities()) assert.ok(c.stations >= CITY_MIN_STATIONS, `${c.name}: ${c.stations}`);
  assert.equal(cities().length, MUNICIPALITIES.municipalities.filter((m) => m.stations >= CITY_MIN_STATIONS).length);
  for (const slug of ["barcelona", "manresa", "girona", "figueres", "lleida", "igualada", "la-jonquera", "l-hospitalet-de-llobregat"]) {
    assert.ok(cities().some((c) => c.slug === slug), `${slug} is a city page`);
  }

  assert.deepEqual(
    chains().map((c) => c.slug),
    ["bonarea", "esclatoil"],
  );
  for (const c of chains()) assert.ok(c.stations >= COMARCA_MIN_STATIONS, `${c.name}: ${c.stations} stations under ${c.chain.brands.join("/")}`);
  assert.deepEqual(
    CHAINS.map((c) => c.brands),
    [["BONAREA"], ["ESCLATOIL"]],
  );
});

test("pages: a smaller list removes the places below the thresholds (snapshot build guard)", () => {
  const only = (n: number) => selectPages(MUNICIPALITIES, { ...STATIONS, stations: STATIONS.stations.filter((s) => s.municipality === "978").slice(0, n) });
  assert.ok(!only(COMARCA_MIN_STATIONS - 1).some((p) => p.kind === "comarca"), "four stations make no comarca page");
  assert.deepEqual(
    only(COMARCA_MIN_STATIONS).filter((p) => p.kind === "comarca").map((p) => [p.slug, p.stations]),
    [["bages", 5]],
  );
  // Provinces and chains always exist; cities come from the municipality counts the build writes from the same list.
  assert.equal(only(1).filter((p) => p.kind === "province").length, 4);
});

test("slugs: URL-safe, unique per segment, and city slugs never collide with chain slugs", () => {
  for (const p of pages()) assert.match(p.slug, SLUG_PATTERN, `${p.kind}/${p.slug}`);
  for (const kind of ["province", "comarca", "city", "chain"] as const) {
    const slugs = pages().filter((p) => p.kind === kind).map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, `${kind}: duplicate slug`);
  }
  const top = [...cities(), ...chains()].map((p) => p.slug);
  assert.equal(new Set(top).size, top.length, "city and chain slugs share /gasolineras/<slug>/");
  assert.ok(!top.includes("provincia") && !top.includes("comarca"), "would be shadowed by the static segments");
  assert.ok(comarques().some((c) => c.slug === "baix-llobregat"));
  assert.ok(comarques().some((c) => c.slug === "pla-de-l-estany"));
});

test("paths: es under /gasolineras/, ca under /benzineres/, with the same slugs", () => {
  assert.equal(fuelHubPath("es"), "/es/gasolineras/");
  assert.equal(fuelHubPath("ca"), "/ca/benzineres/");
  assert.equal(fuelPath("es", "city", "manresa"), "/es/gasolineras/manresa/");
  assert.equal(fuelPath("ca", "city", "manresa"), "/ca/benzineres/manresa/");
  assert.equal(fuelPath("es", "comarca", "osona"), "/es/gasolineras/comarca/osona/");
  assert.equal(fuelPath("ca", "province", "barcelona"), "/ca/benzineres/provincia/barcelona/");
  assert.equal(fuelPath("es", "chain", "bonarea"), "/es/gasolineras/bonarea/");
  assert.deepEqual(fuelTranslations("comarca", "osona"), { ca: "/ca/benzineres/comarca/osona/", es: "/es/gasolineras/comarca/osona/" });
});

/* -------------------------------------------------------------------------- */
/* Routing: one locale per route, 404 otherwise                               */
/* -------------------------------------------------------------------------- */

test("routing: each route answers its own locale only; unknown slugs and wrong locales are 404s", () => {
  assert.ok(fuelHubAllowed("es", "es"));
  assert.ok(!fuelHubAllowed("es", "ca"));
  assert.ok(!fuelHubAllowed("ca", "en"));

  assert.equal(resolveCityOrChain("es", "es", "manresa")?.kind, "city");
  assert.equal(resolveCityOrChain("ca", "ca", "bonarea")?.kind, "chain");
  assert.equal(resolveCityOrChain("es", "ca", "manresa"), null, "/ca/gasolineras/manresa/");
  assert.equal(resolveCityOrChain("ca", "es", "manresa"), null, "/es/benzineres/manresa/");
  assert.equal(resolveCityOrChain("es", "en", "manresa"), null, "/en/gasolineras/manresa/");
  assert.equal(resolveCityOrChain("es", "es", "priorat"), null, "a comarca is not a city");
  assert.equal(resolveCityOrChain("es", "es", "bassella"), null, "one station: no page");
  assert.equal(resolveCityOrChain("es", "es", "osona"), null);

  assert.equal(resolveProvince("es", "es", "girona")?.code, "17");
  assert.equal(resolveProvince("ca", "es", "girona"), null);
  assert.equal(resolveProvince("es", "es", "manresa"), null);

  assert.equal(resolveComarca("ca", "ca", "osona")?.code, "24");
  assert.equal(resolveComarca("ca", "es", "osona"), null);
  assert.equal(resolveComarca("es", "es", "priorat"), null, "Priorat has fewer than five stations");
});

test("routing: 20 pages per locale built at deploy, always with the route's own locale", () => {
  for (const route of FUEL_LOCALES) {
    const key = route === "es" ? "lugar" : "lloc";
    const params = [...provinceStaticParams(route), ...comarcaStaticParams(route), ...cityStaticParams(route, key)];
    assert.equal(params.length, 4 + PRERENDERED_COMARQUES + PRERENDERED_CITIES);
    assert.equal(params.length, 20);
    for (const p of params) assert.equal(p.locale, route);
    assert.equal((cityStaticParams(route, key)[0] as Record<string, string>)[key], "barcelona", "most stations first");
    for (const p of comarcaStaticParams(route)) assert.ok(resolveComarca(route, route, p.comarca));
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata and copy                                                          */
/* -------------------------------------------------------------------------- */

const PRICE_LIKE = /\d[.,]\d{3}|€/;

test("metadata: titles <= 60, descriptions <= 155, H1 present, never a price", () => {
  for (const locale of FUEL_LOCALES) {
    for (const place of pages()) {
      const title = fuelTitle(place, locale);
      const description = fuelDescription(place, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${locale} ${place.slug}: title ${title.length} "${title}"`);
      assert.ok(description.length <= DESCRIPTION_LIMIT, `${locale} ${place.slug}: description ${description.length}`);
      assert.match(title, locale === "es" ? /hoy/ : /avui/);
      assert.doesNotMatch(title + description + fuelH1(place, locale) + placeLead(place, locale, 1), PRICE_LIKE);
      assert.doesNotMatch(title + description, /undefined|null|\{/);
    }
    const hub = hubMeta(locale, STATIONS.stations.length);
    assert.ok(hub.title.length <= TITLE_LIMIT && hub.description.length <= DESCRIPTION_LIMIT, `${locale} hub`);
  }
  const manresa = resolveCityOrChain("es", "es", "manresa")!;
  assert.equal(fuelTitle(manresa, "es"), "Gasolineras baratas en Manresa hoy: precio gasolina y diésel");
  assert.equal(fuelTitle(manresa, "ca"), "Benzineres barates a Manresa avui: preu gasolina i dièsel");
  assert.equal(fuelTitle(resolveCityOrChain("ca", "ca", "el-prat-de-llobregat")!, "ca"), "Benzineres barates al Prat de Llobregat avui");
  assert.equal(fuelTitle(resolveComarca("ca", "ca", "alt-emporda")!, "ca"), "Benzineres barates a l'Alt Empordà avui: gasolina i dièsel");
});

test("metadata: canonical and hreflang between the two editions, x-default to Catalan", () => {
  const place = resolveComarca("es", "es", "osona")!;
  const meta = buildMetadata({
    locale: "es",
    path: fuelPath("es", place.kind, place.slug),
    title: fuelTitle(place, "es"),
    description: fuelDescription(place, "es"),
    translations: fuelTranslations(place.kind, place.slug),
  });
  const alternates = meta.alternates as { canonical: string; languages: Record<string, string> };
  assert.match(alternates.canonical, /\/es\/gasolineras\/comarca\/osona\/$/);
  assert.match(alternates.languages.ca!, /\/ca\/benzineres\/comarca\/osona\/$/);
  assert.match(alternates.languages.es!, /\/es\/gasolineras\/comarca\/osona\/$/);
  assert.equal(alternates.languages["x-default"], alternates.languages.ca);
  assert.equal(alternates.languages.en, undefined);
});

test("copy: guidance cites the order and the Geoportal; labels carry their placeholders", () => {
  for (const locale of FUEL_LOCALES) {
    const text = JSON.stringify(guidance(locale));
    assert.match(text, /ITC\/2308\/2007/);
    assert.match(text, /geoportalgasolineras\.es/);
    assert.doesNotMatch(text, PRICE_LIKE);
    assert.doesNotMatch(text, /aerobus/i);
    const labels = liveLabels(locale);
    assert.match(labels.updated, /\{time\}.*\{date\}/);
    assert.match(labels.median, /\{count\}.*\{place\}.*\{price\}/);
    assert.match(labels.old, /\{when\}/);
    assert.match(labels.stale, /\{when\}/);
    for (const key of ["failed", "stale", "old", "fallback"] as const) assert.ok(labels[key].includes(labels.geoportal), `${locale} ${key} names the Geoportal`);
  }
  assert.equal(GEOPORTAL_URL, GEOPORTAL_HOME);
});

/* -------------------------------------------------------------------------- */
/* Live data: parsing, ranking, freshness                                     */
/* -------------------------------------------------------------------------- */

test("live: prices and coordinates as the Ministry writes them", () => {
  assert.equal(parsePrice("1,769"), 1.769);
  assert.equal(parsePrice(" 1,195 "), 1.195);
  assert.equal(parsePrice(""), undefined);
  assert.equal(parsePrice(undefined), undefined);
  assert.equal(parsePrice("951,5"), undefined, "a typo cannot top the list");
  assert.equal(parsePrice("0,000"), undefined);
  assert.equal(parseCoordinate("41,507833"), 41.50783);
  assert.equal(parseCoordinate("1,902972"), 1.90297);
  assert.equal(parseCoordinate(""), undefined);
});

test("live: the Ministry's Fecha in Madrid time, winter and summer", () => {
  assert.equal(ministryTimestampToIso("28/10/2026 11:36:05"), "2026-10-28T11:36:05+01:00");
  assert.equal(ministryTimestampToIso("15/07/2026 09:00:00"), "2026-07-15T09:00:00+02:00");
  // Day after the change to winter time (25 Oct 2026) and day of the change to summer time (29 Mar 2026).
  assert.equal(ministryTimestampToIso("26/10/2026 00:30:00"), "2026-10-26T00:30:00+01:00");
  assert.equal(ministryTimestampToIso("29/03/2026 12:00:00"), "2026-03-29T12:00:00+02:00");
  assert.equal(ministryTimestampToIso("2026-10-28 11:36"), null);
  assert.equal(ministryTimestampToIso(undefined), null);
  assert.equal(Date.parse(ministryTimestampToIso(FIXTURE.Fecha)!), Date.parse("2026-10-28T10:36:05Z"));
});

test("live: freshness — fresh up to 4 h, shown with a warning up to 24 h, hidden after", () => {
  const at = "2026-10-28T11:36:05+01:00";
  const t0 = Date.parse(at);
  const h = 3_600_000;
  assert.equal(FRESH_HOURS, 4);
  assert.equal(MAX_SHOWN_HOURS, 24);
  assert.equal(freshness(at, t0), "fresh");
  assert.equal(freshness(at, t0 + 4 * h), "fresh");
  assert.equal(freshness(at, t0 + 4 * h + 1000), "old");
  assert.equal(freshness(at, t0 + 24 * h), "old");
  assert.equal(freshness(at, t0 + 24 * h + 1000), "stale");
  // The next day in Madrid, same clock time: a day old, not today's prices.
  assert.equal(freshness(at, Date.parse("2026-10-29T11:36:06+01:00")), "stale");
  assert.equal(freshness(null, t0), "stale");
  assert.equal(freshness("garbage", t0), "stale");
});

test("live: median of odd, even and empty lists", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1.789, 1.899]), 1.844);
  assert.equal(median([]), null);
});

/* Known answers from the recorded fixture: the 16 Manresa stations of 28 Oct 2026, 11:36:05. */
const fixtureStations = (): LiveStation[] => compactPayload(FIXTURE, 1)!.stations;

test("known answer: Manresa's cheapest and median per product (fixture of 28 Oct 2026)", () => {
  const manresa = { ine: "08113" };
  const all = fixtureStations();
  assert.equal(all.filter((s) => matches(s, manresa)).length, 16);

  const e95 = rank(all, manresa, "e95");
  assert.equal(e95.count, 15, "Petromiralles sells no 95");
  assert.equal(e95.median, 1.709);
  assert.deepEqual(
    e95.cheapest.slice(0, 4).map((s) => [s.b, s.e95]),
    [
      ["BONAREA", 1.499],
      ["ESCLATOIL", 1.549],
      ["U.S. MANRESA -GAS-OILS ROVIRA-", 1.549],
      ["GM OIL", 1.589],
    ],
  );
  assert.equal(e95.cheapest.length, 10);

  const goa = rank(all, manresa, "goa");
  assert.equal(goa.count, 16);
  assert.equal(goa.median, 1.844);
  assert.deepEqual(
    goa.cheapest.slice(0, 3).map((s) => [s.b, s.goa]),
    [
      ["GM OIL", 1.719],
      ["PETROSET", 1.719],
      ["BONAREA", 1.722],
    ],
  );

  assert.equal(rank(all, manresa, "e98").median, 1.909);
  const glp = rank(all, manresa, "glp");
  assert.deepEqual([glp.count, glp.cheapest[0]?.b, glp.cheapest[0]?.glp], [1, "PETROCAT", 1.195]);
});

test("known answer: chain filter uses the trimmed brand; Palamós station keeps its renamed municipality", () => {
  const all = fixtureStations();
  const esclat = rank(all, { brands: ["ESCLATOIL"] }, "e95", 10);
  assert.deepEqual(
    esclat.cheapest.map((s) => [s.id, s.e95]),
    [
      ["13944", 1.549],
      ["12372", 1.569],
      ["16185", 1.579],
      ["12313", 1.629],
    ],
  );
  const palamos = all.find((s) => s.id === "12313")!;
  assert.equal(palamos.t, "Palamós i Sant Joan");
  assert.equal(palamos.ine, "17118");
  const bonarea = rank(all, { brands: ["BONAREA"], province: "08" }, "goa");
  assert.equal(bonarea.cheapest[0]?.id, "13321"); // Badalona, 1,717
});

/* -------------------------------------------------------------------------- */
/* Upstream mapping and the route handler                                     */
/* -------------------------------------------------------------------------- */

test("upstream: one Ministry row to the compact form", () => {
  const row = FIXTURE.ListaEESSPrecio.find((r) => r.IDEESS === "3026")!;
  assert.deepEqual(compactStation(row), {
    id: "3026",
    b: "TAMOIL",
    a: row["Dirección"],
    t: "l'Hospitalet de Llobregat",
    ine: "08101",
    c: "13",
    p: "08",
    lat: parseCoordinate(row.Latitud),
    lon: parseCoordinate(row["Longitud (WGS84)"]),
    e95: 1.489,
    goa: 1.749,
    e98: 1.679,
  });
  const trailing = compactStation(FIXTURE.ListaEESSPrecio.find((r) => r.IDEESS === "16185")!)!;
  assert.equal(trailing.b, "ESCLATOIL", "\"ESCLATOIL \" is trimmed");
  assert.equal("e98" in trailing, false, "a product the station does not sell is absent");

  const unknown = compactStation({ ...row, IDMunicipio: "999999", Municipio: "Ametlla de Mar (L')" })!;
  assert.deepEqual([unknown.t, unknown.ine, unknown.c], ["l'Ametlla de Mar", "", ""]);
});

test("upstream: whole answer, restricted sale left out, broken answers rejected", () => {
  const payload = compactPayload(FIXTURE, 1)!;
  assert.equal(payload.fecha, "28/10/2026 11:36:05");
  assert.equal(payload.updated, "2026-10-28T11:36:05+01:00");
  assert.equal(payload.stations.length, FIXTURE.ListaEESSPrecio.length);
  assert.equal(compactPayload(FIXTURE), null, "26 stations is not Catalonia (needs 1,000)");

  const restricted = { ...FIXTURE, ListaEESSPrecio: FIXTURE.ListaEESSPrecio.map((r, i) => (i === 0 ? { ...r, "Tipo Venta": "R" } : r)) };
  assert.equal(compactPayload(restricted, 1)!.stations.length, FIXTURE.ListaEESSPrecio.length - 1);

  assert.equal(compactPayload({ ...FIXTURE, ResultadoConsulta: "ERROR" }, 1), null);
  assert.equal(compactPayload({ Fecha: FIXTURE.Fecha }, 1), null);
  assert.equal(compactPayload("<html>503</html>", 1), null);
  assert.equal(compactPayload(null, 1), null);
});

/** A full-size answer: the fixture's rows repeated under new ids. */
function fullAnswer(): unknown {
  const rows: Record<string, string>[] = [];
  for (let i = 0; rows.length < 1100; i++) {
    for (const r of FIXTURE.ListaEESSPrecio) rows.push({ ...r, IDEESS: `${r.IDEESS}-${i}` });
  }
  return { ...FIXTURE, ListaEESSPrecio: rows };
}

function mockFetch(responses: (Response | Error)[]): { fetch: typeof fetch; calls: string[] } {
  const calls: string[] = [];
  const queue = [...responses];
  const fake = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push(String(input));
    assert.equal(init?.cache, "no-store", "never written to the data cache");
    const next = queue.shift();
    if (!next || next instanceof Error) throw next ?? new Error("no more responses");
    return next;
  }) as typeof fetch;
  return { fetch: fake, calls };
}

test("route: success is cached by the CDN for an hour plus two of stale-while-revalidate", async () => {
  const original = globalThis.fetch;
  const mock = mockFetch([Response.json(fullAnswer())]);
  globalThis.fetch = mock.fetch;
  try {
    const response = await GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "public, s-maxage=3600, stale-while-revalidate=7200");
    assert.equal(SUCCESS_CACHE, "public, s-maxage=3600, stale-while-revalidate=7200");
    const body = (await response.json()) as { fecha: string; updated: string; stations: LiveStation[] };
    assert.equal(body.fecha, FIXTURE.Fecha);
    assert.equal(body.updated, "2026-10-28T11:36:05+01:00");
    assert.ok(body.stations.length >= 1100);
    assert.deepEqual(Object.keys(body.stations[0]!).slice(0, 7), ["id", "b", "a", "t", "ine", "c", "p"]);
    assert.deepEqual(mock.calls, [API_URLS[0]]);
  } finally {
    globalThis.fetch = original;
  }
});

test("route: falls back to the second host, then fails with 503 and a short cache", async () => {
  const original = globalThis.fetch;
  try {
    const fallback = mockFetch([new Response("Service Unavailable", { status: 503 }), Response.json(fullAnswer())]);
    globalThis.fetch = fallback.fetch;
    const ok = await GET();
    assert.equal(ok.status, 200);
    assert.deepEqual(fallback.calls, [...API_URLS]);

    const down = mockFetch([new Error("ECONNRESET"), Response.json({ ResultadoConsulta: "OK", ListaEESSPrecio: [] })]);
    globalThis.fetch = down.fetch;
    const failed = await GET();
    assert.equal(failed.status, 503);
    assert.equal(failed.headers.get("cache-control"), FAILURE_CACHE);
    const body = (await failed.json()) as { error: string; geoportal: string; stations?: unknown };
    assert.equal(body.error, "upstream");
    assert.equal(body.geoportal, GEOPORTAL_URL);
    assert.equal(body.stations, undefined, "no prices on failure, old or new");
  } finally {
    globalThis.fetch = original;
  }
});

test("upstream: loadCatalonia never throws", async () => {
  const result = await loadCatalonia((async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch);
  assert.equal(result.ok, false);
});

/* -------------------------------------------------------------------------- */
/* Server-side station lists and siblings                                     */
/* -------------------------------------------------------------------------- */

test("pages: station lists match the counts; siblings stay in the family", () => {
  for (const place of pages()) assert.equal(stationsOf(place).length, place.stations, `${place.kind}/${place.slug}`);
  const manresa = resolveCityOrChain("es", "es", "manresa") as Extract<Place, { kind: "city" }>;
  const siblings = citySiblings(manresa);
  assert.ok(siblings.length > 0 && siblings.length <= 8);
  assert.ok(siblings.every((c) => c.slug !== "manresa" && c.province === "08"));
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: every page in both languages, dated by the station list, hreflang to the other edition", () => {
  const entries = fuelFamilyPaths();
  assert.equal(entries.length, 2 * (1 + pages().length));
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const e of entries) {
    assert.equal(e.lastModified, MUNICIPALITIES.readOn);
    assert.ok(Object.values(e.translations).includes(e.path));
  }
  const paths = entries.map((e) => e.path);
  for (const p of ["/es/gasolineras/", "/ca/benzineres/", "/es/gasolineras/manresa/", "/ca/benzineres/comarca/osona/", "/es/gasolineras/provincia/tarragona/", "/ca/benzineres/esclatoil/"]) {
    assert.ok(paths.includes(p), p);
  }
  assert.ok(!paths.some((p) => p.startsWith("/en/")));

  assert.deepEqual(fuelSitemapEntries(), [], "nothing on a deployment that may not be indexed");
  const env = { ...process.env };
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  try {
    const live = fuelSitemapEntries();
    assert.equal(live.length, entries.length);
    const osona = live.find((e) => e.url === "https://www.catalunyainfo.com/es/gasolineras/comarca/osona/")!;
    assert.ok(osona, "absolute production URL");
    assert.equal(osona.alternates?.languages?.ca, "https://www.catalunyainfo.com/ca/benzineres/comarca/osona/");
    assert.equal(osona.alternates?.languages?.["x-default"], "https://www.catalunyainfo.com/ca/benzineres/comarca/osona/");
    assert.equal((osona.lastModified as Date).toISOString().slice(0, 10), MUNICIPALITIES.readOn);
  } finally {
    process.env.VERCEL_ENV = env.VERCEL_ENV;
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = env.NEXT_PUBLIC_ALLOW_INDEXING;
    if (env.VERCEL_ENV === undefined) delete process.env.VERCEL_ENV;
    if (env.NEXT_PUBLIC_ALLOW_INDEXING === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
  }
});

test("sitemap: the site sitemap includes the family with one import and one spread", () => {
  const source = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(source, /import \{ fuelSitemapEntries \} from "@\/lib\/programmatic\/fuel\/sitemap";/);
  assert.match(source, /\.\.\.fuelSitemapEntries\(\)/);
});

/* -------------------------------------------------------------------------- */
/* The route files                                                            */
/* -------------------------------------------------------------------------- */

test("routes: static forever, one locale each, live data never through ISR", () => {
  const read = (p: string) => readFileSync(join(ROOT, "src/app", p), "utf8");
  const pagesFiles: [string, FuelLocale][] = [
    ["(public)/[locale]/gasolineras/page.tsx", "es"],
    ["(public)/[locale]/gasolineras/[lugar]/page.tsx", "es"],
    ["(public)/[locale]/gasolineras/provincia/[provincia]/page.tsx", "es"],
    ["(public)/[locale]/gasolineras/comarca/[comarca]/page.tsx", "es"],
    ["(public)/[locale]/benzineres/page.tsx", "ca"],
    ["(public)/[locale]/benzineres/[lloc]/page.tsx", "ca"],
    ["(public)/[locale]/benzineres/provincia/[provincia]/page.tsx", "ca"],
    ["(public)/[locale]/benzineres/comarca/[comarca]/page.tsx", "ca"],
  ];
  for (const [file, locale] of pagesFiles) {
    const source = read(file);
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, /notFound\(\)/, file);
    assert.ok(source.includes(`"${locale}"`) && !source.includes(`"${locale === "es" ? "ca" : "es"}"`), `${file}: serves ${locale} only`);
    assert.doesNotMatch(source, /new Date\(|fetch\(/, file);
    if (file.split("/").at(-2)!.startsWith("[")) assert.match(source, /export const dynamicParams = true;/, file);
  }
  const route = read("api/fuel/catalonia/route.ts");
  assert.match(route, /export const dynamic = "force-dynamic";/);
  assert.doesNotMatch(route, /export const revalidate/);
});
