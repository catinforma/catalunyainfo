import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { MAX_AGE_HOURS as SNOW_MAX_AGE_HOURS, SNOW_STATIONS, type ReadingRow } from "../src/lib/content/snow/depth.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { OFFICIAL, hubCopy, hubStations, placeCopy } from "../src/lib/programmatic/mountain/copy.ts";
import { HUB_ONLY_PLACES, PAGE_PLACES, PLACES, SNAPSHOT, liveStationCodes, placeBySlug, siblings } from "../src/lib/programmatic/mountain/data.ts";
import { loadForecast } from "../src/lib/programmatic/mountain/forecast.ts";
import { liveLabels } from "../src/lib/programmatic/mountain/labels.ts";
import { MAX_AGE_HOURS, compass, hoursSince, isRecent, kmh, liveView, parsePayload, readingTime, stationView } from "../src/lib/programmatic/mountain/live.ts";
import {
  ACCEPTED_STATUS,
  FAILED_CACHE_CONTROL,
  OK_CACHE_CONTROL,
  buildObservations,
  buildObservationsResponse,
  liveStations,
  snowQuery,
  weatherQuery,
  type Fetcher,
  type WeatherRow,
} from "../src/lib/programmatic/mountain/observations.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  hubMeta,
  hubMetadata,
  mountainFamilyPaths,
  mountainSitemap,
  placeDescription,
  placeMetadata,
  placeStaticParams,
  placeTitle,
  resolveHub,
  resolvePlace,
} from "../src/lib/programmatic/mountain/pages.ts";
import { hubPath, placePath } from "../src/lib/programmatic/mountain/paths.ts";
import { PLACE_DEFS } from "../src/lib/programmatic/mountain/places.ts";
import {
  ALTITUDE_MARGIN_M,
  MAX_DISTANCE_KM,
  MIN_SKI_STATION_ALTITUDE_M,
  distanceKm,
  matchStations,
  measuresFrom,
  operationalStations,
  pickToponym,
  type IcgcFeature,
  type StationMetaRow,
} from "../src/lib/programmatic/mountain/prepare.ts";
import type { ObservationsOk, SnapshotStation } from "../src/lib/programmatic/mountain/types.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

/**
 * Mountain and ski-resort weather (28 Oct 2026).
 *
 * Fixtures recorded on 28 Oct 2026 (tests/fixtures/mountain/):
 *  - xema-2026-10-28: the two answers the route handler reads from nzvn-apee
 *    (validated temperature and wind of the last 50 h: none; validated snow
 *    depth since 24 Oct: 136 rows), read at 20:28 UTC. The dataset's newest
 *    row of any status was 26 Oct 17:30 UT all day.
 *  - xema-weather-sample: temperature and wind rows at ZD, Z1, Z7, VX, with
 *    the three statuses: V (19 Oct, the latest validated), T (25 Oct) and
 *    blank (26 Oct).
 *  - yqwd-vj5e: Meteocat's station metadata (stations at 600 m or higher).
 *  - icgc-*: ICGC geocoder answers for two toponyms.
 */

const ROOT = join(import.meta.dirname, "..");
const fixture = (name: string) => JSON.parse(readFileSync(join(ROOT, "tests/fixtures/mountain", name), "utf8")) as unknown;
const XEMA = fixture("xema-2026-10-28.json") as { readAt: string; weather: WeatherRow[]; snow: ReadingRow[] };
const WEATHER_SAMPLE = fixture("xema-weather-sample-2026-10-28.json") as WeatherRow[];
const STATION_ROWS = fixture("yqwd-vj5e-2026-10-28.json") as StationMetaRow[];
const ICGC_TURO = fixture("icgc-turo-de-l-home-2026-10-28.json") as { features: IcgcFeature[] };
const ICGC_MOLINA = fixture("icgc-la-molina-2026-10-28.json") as { features: IcgcFeature[] };

const station = (code: string): SnapshotStation => {
  const s = SNAPSHOT.stations.find((x) => x.code === code);
  assert.ok(s, `station ${code} in snapshot`);
  return s;
};

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

test("snapshot: every place, read on 28 Oct 2026, with its sources and reuse terms", () => {
  assert.equal(SNAPSHOT.readOn, "2026-10-28");
  assert.deepEqual(SNAPSHOT.places.map((p) => p.slug), PLACE_DEFS.map((d) => d.slug));
  assert.match(SNAPSHOT.sources.readings.url, /nzvn-apee/);
  assert.match(SNAPSHOT.sources.stations.url, /yqwd-vj5e/);
  assert.match(SNAPSHOT.sources.readings.terms, /citant la font/);
  assert.equal(new Set(PLACE_DEFS.map((d) => d.slug)).size, PLACE_DEFS.length);
  for (const d of PLACE_DEFS) assert.match(d.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test("snapshot invariants: distances recomputed, every matched station passes the threshold, nearest first", () => {
  for (const place of PLACES) {
    const def = PLACE_DEFS.find((d) => d.slug === place.slug)!;
    assert.equal(place.point.name, def.icgc.name, `${place.slug}: the declared ICGC toponym`);
    assert.equal(place.point.municipalityCode, def.icgc.municipalityCode);
    for (const ps of [...place.stations, ...place.nearest]) {
      assert.ok(Math.abs(distanceKm(place.point, ps.station) - ps.distanceKm) <= 0.05, `${place.slug}/${ps.station.code}`);
    }
    for (const ps of place.stations) {
      assert.ok(ps.distanceKm <= MAX_DISTANCE_KM[place.kind], `${place.slug}: ${ps.station.code} within ${MAX_DISTANCE_KM[place.kind]} km`);
      if (place.altitude) {
        assert.ok(ps.station.altitude >= place.altitude.min - ALTITUDE_MARGIN_M && ps.station.altitude <= place.altitude.max + ALTITUDE_MARGIN_M, `${place.slug}: ${ps.station.code} altitude`);
      } else if (place.kind !== "area") {
        assert.ok(ps.station.altitude >= MIN_SKI_STATION_ALTITUDE_M, `${place.slug}: mountain station`);
      }
    }
    const d = place.stations.map((s) => s.distanceKm);
    assert.deepEqual(d, [...d].sort((a, b) => a - b), `${place.slug}: nearest first`);
  }
  for (const s of SNAPSHOT.stations) {
    assert.match(s.code, /^[A-Z0-9]{2}$/);
    assert.doesNotMatch(s.name, /\(\s*[\d.]+\s*m\s*\)/, "altitude stripped from the name");
  }
});

test("snapshot known answers, from Meteocat and the ICGC on 28 Oct 2026", () => {
  const molina = placeBySlug("la-molina")!;
  assert.deepEqual(molina.stations.map((s) => [s.station.code, s.distanceKm]), [["ZD", 3.4]]);
  assert.equal(station("ZD").name, "la Tosa d'Alp");
  assert.equal(station("ZD").altitude, 2478);
  assert.deepEqual(station("ZD").measures, { temperature: true, wind: 10, snow: false }, "Tosa d'Alp has no snow sensor (not in the snow page's list either)");
  assert.equal(placeBySlug("masella")!.stations[0]!.station.code, "ZD");
  assert.ok(!placeBySlug("masella")!.stations.some((s) => s.station.code === "DP"), "Das aerodrome (1,096 m) is a valley station");
  assert.deepEqual(placeBySlug("vall-de-nuria")!.stations.map((s) => [s.station.code, s.distanceKm]), [["DG", 0.1]]);
  assert.deepEqual(placeBySlug("baqueira-beret")!.stations.map((s) => [s.station.code, s.distanceKm]), [["Z1", 6.7]]);
  assert.deepEqual(placeBySlug("vallter")!.stations.map((s) => s.station.code), ["ZC"]);
  assert.deepEqual(placeBySlug("montseny")!.stations.map((s) => [s.station.code, s.distanceKm]), [["XK", 0.4]]);
  assert.equal(station("Z1").measures.wind, 6, "Bonaigua's wind mast is at 6 m");
  assert.deepEqual(placeBySlug("viros-vallferrera")!.stations.map((s) => s.station.code), ["ZB"], "Tírvia (955 m) is not a ski station");
  // Below the threshold: hub only.
  assert.deepEqual(HUB_ONLY_PLACES.map((p) => p.slug).sort(), ["aransa", "lles", "port-aine", "sant-joan-de-l-erm"]);
  const aine = PLACES.find((p) => p.slug === "port-aine")!;
  assert.equal(aine.nearest[0]!.station.code, "XH");
  assert.equal(aine.nearest[0]!.distanceKm, 7.4);
  assert.equal(placeBySlug("port-aine"), null);
  assert.equal(PAGE_PLACES.length, 19);
  // The titles promise temperature and wind: every page has a station that measures both.
  for (const place of PAGE_PLACES) assert.ok(place.stations.some((s) => s.station.measures.temperature && s.station.measures.wind), place.slug);
  // Every snow-sensing station of the family is one the snow page follows.
  for (const s of SNAPSHOT.stations.filter((x) => x.measures.snow && liveStationCodes().includes(x.code))) assert.ok(SNOW_STATIONS.includes(s.code), s.code);
});

/* -------------------------------------------------------------------------- */
/* The snapshot script's steps, on recorded answers                           */
/* -------------------------------------------------------------------------- */

test("prepare: operational stations only, names cleaned; toponym picked by exact name and municipality", () => {
  const stations = operationalStations(STATION_ROWS);
  assert.ok(stations.some((s) => s.code === "ZD" && s.name === "la Tosa d'Alp" && s.altitude === 2478));
  assert.ok(!stations.some((s) => s.code === "Z4" || s.code === "Z8"), "dismantled Ulldeter and Port del Comte stations left out");
  const fogars = pickToponym(ICGC_TURO.features, "Turó de l'Home", "080811");
  assert.equal(fogars?.municipality, "Fogars de Montclús");
  assert.equal(fogars?.type, "Cim");
  assert.equal(pickToponym(ICGC_TURO.features, "Turó de l'Home", "999999"), null, "never a guess");
  assert.equal(pickToponym(ICGC_TURO.features, "Turó de l'Home", "082824")?.municipality, "Tiana", "the other Turó de l'Home exists, and is not the Montseny one");
  const molina = pickToponym(ICGC_MOLINA.features, "Estació d'esquí de la Molina", "170062")!;
  assert.equal(molina.comarca, "Cerdanya");
  assert.deepEqual([molina.lat, molina.lon], [42.33473, 1.93479]);
});

test("prepare: the threshold (distance, altitude band, valley stations) and what a station measures", () => {
  const measures = measuresFrom([
    { codi_estacio: "ZD", codi_variable: "32" },
    { codi_estacio: "ZD", codi_variable: "30" },
    { codi_estacio: "Z1", codi_variable: "48" },
    { codi_estacio: "Z1", codi_variable: "38" },
    { codi_estacio: "VX", codi_variable: "32" },
  ]);
  assert.deepEqual(measures.get("ZD"), { temperature: true, wind: 10, snow: false });
  assert.deepEqual(measures.get("Z1"), { temperature: false, wind: 6, snow: true }, "only what it reported");
  assert.deepEqual(measures.get("VX"), { temperature: true, wind: null, snow: false });
  const all = operationalStations(STATION_ROWS).map((s) => ({ ...s, measures: { temperature: true, wind: 10 as const, snow: false } }));
  const masella = { lat: 42.34995, lon: 1.90091 };
  assert.deepEqual(matchStations("resort", { min: 1600, max: 2535 }, masella, all).map((l) => l.code), ["ZD"], "DP at 4.9 km is 1,096 m: out of the band");
  assert.deepEqual(matchStations("resort", null, masella, all).map((l) => l.code), ["ZD"], "no range: valley stations still out");
  const viros = { lat: 42.52705, lon: 1.28185 };
  assert.deepEqual(matchStations("nordic", null, viros, all).map((l) => l.code), ["ZB"]);
  const aine = { lat: 42.42871, lon: 1.21402 };
  assert.deepEqual(matchStations("resort", { min: 1650, max: 2440 }, aine, all), [], "Port Ainé: nothing close enough");
  const silent = all.map((s) => ({ ...s, measures: { temperature: false, wind: null, snow: false } }));
  assert.deepEqual(matchStations("resort", { min: 1600, max: 2535 }, masella, silent), [], "a station that reports nothing never stands for a place");
});

/* -------------------------------------------------------------------------- */
/* The route handler                                                          */
/* -------------------------------------------------------------------------- */

const AT_NOON = new Date("2026-10-28T12:00:00Z");

test("observations (fixture): validated snow depth only, 48 h limit, as the snow page", () => {
  assert.equal(MAX_AGE_HOURS, SNOW_MAX_AGE_HOURS, "one rule for the site");
  const stations = liveStations();
  // At noon UTC the newest validated depth (26 Oct 13:30-14:00 UT) is under 48 h old.
  const noon = buildObservations(XEMA.weather, XEMA.snow, stations, AT_NOON);
  assert.deepEqual(Object.keys(noon).sort(), ["DG", "VS", "Z1", "Z2", "Z3", "Z5", "Z7", "Z9", "ZB", "ZE"]);
  assert.deepEqual(noon.DG, { temperature: null, wind: null, snow: { cm: 0, at: "2026-10-26T13:30:00.000Z", change24h: null } }, "no validated reading 24 h earlier (within 3 h): no change shown");
  assert.equal(noon.Z5!.snow!.at, "2026-10-26T14:00:00.000Z");
  assert.equal(noon.Z1!.snow!.at, "2026-10-26T13:00:00.000Z");
  assert.ok(!noon.X5 && !noon.XK && !noon.ZC, "their newest validated depth is older than 48 h");
  assert.ok(!noon.ZD, "no snow sensor and no validated temperature in 50 h");
  // When the fixture was recorded (20:28 UTC) everything was older than 48 h: nothing is current.
  assert.deepEqual(buildObservations(XEMA.weather, XEMA.snow, stations, new Date(XEMA.readAt)), {});
  assert.equal(XEMA.weather.length, 0, "no validated temperature or wind in the last 50 h on 28 Oct 2026");
});

test("observations (fixture): temperature and wind from validated rows only, never T or blank", () => {
  const stations = liveStations();
  const day = buildObservations(WEATHER_SAMPLE, [], stations, new Date("2026-10-20T12:00:00Z"));
  assert.deepEqual(day.ZD, {
    temperature: { value: 3.3, at: "2026-10-19T23:30:00.000Z" },
    wind: { speed: 9.5, direction: 185, gust: 14, height: 10, at: "2026-10-19T23:30:00.000Z" },
    snow: null,
  });
  assert.deepEqual(day.Z1!.wind, { speed: 2.3, direction: 120, gust: 4.8, height: 6, at: "2026-10-19T23:30:00.000Z" });
  assert.deepEqual(day.Z7!.temperature, { value: 2.5, at: "2026-10-19T23:30:00.000Z" });
  assert.equal(day.VX, undefined, "Tagamanent's station is not read: it stands for no page (temperature only)");
  // On 26 Oct the rows of 25-26 Oct exist but are not validated: nothing is shown.
  assert.deepEqual(buildObservations(WEATHER_SAMPLE, [], stations, new Date("2026-10-26T06:00:00Z")), {});
  // Sensor faults and future stamps are dropped.
  const bad: WeatherRow[] = [
    { codi_estacio: "ZD", codi_variable: "32", data_lectura: "2026-10-19T23:30:00.000", valor_lectura: "-99", codi_estat: "V" },
    { codi_estacio: "ZD", codi_variable: "30", data_lectura: "2026-10-21T12:00:00.000", valor_lectura: "3", codi_estat: "V" },
  ];
  assert.deepEqual(buildObservations(bad, [], stations, new Date("2026-10-20T12:00:00Z")), {});
});

test("handler: two validated-only reads, 200 with s-maxage=1800, no forecast (hook not configured)", async () => {
  const urls: string[] = [];
  const fetcher: Fetcher = async (url) => {
    urls.push(url);
    return Response.json(decodeURIComponent(url).includes("codi_variable='38'") ? XEMA.snow : XEMA.weather);
  };
  const res = await buildObservationsResponse(fetcher, AT_NOON);
  assert.equal(res.status, 200);
  assert.equal(res.headers["cache-control"], OK_CACHE_CONTROL);
  assert.match(OK_CACHE_CONTROL, /s-maxage=1800/);
  assert.equal(urls.length, 2);
  for (const url of urls) assert.match(decodeURIComponent(url), new RegExp(`codi_estat='${ACCEPTED_STATUS}'`));
  const body = res.body as ObservationsOk;
  assert.equal(body.ok, true);
  assert.equal(body.forecast, null);
  assert.equal(body.latestAt, "2026-10-26T14:00:00.000Z");
  assert.equal(Object.keys(body.stations).length, 10);
  assert.equal(await loadForecast(), null);
  // The queries read only the family's stations and variables.
  const w = decodeURIComponent(weatherQuery(liveStations(), AT_NOON)!);
  assert.match(w, /codi_estacio in\('DG',/);
  assert.match(w, /data_lectura >= '2026-10-26T10:00:00'/, "50 h back");
  assert.match(decodeURIComponent(snowQuery(liveStations(), AT_NOON)!), /data_lectura >= '2026-10-24T00:00:00'/);
});

test("handler failure paths: a 503 that says so, never an empty 'all clear'", async () => {
  const cases: Fetcher[] = [
    async () => new Response("down", { status: 500 }),
    async () => Response.json({ error: true, message: "query timeout" }),
    async () => {
      throw new Error("network");
    },
  ];
  for (const fetcher of cases) {
    const res = await buildObservationsResponse(fetcher, AT_NOON);
    assert.equal(res.status, 503);
    assert.equal(res.headers["cache-control"], FAILED_CACHE_CONTROL);
    assert.deepEqual(res.body, { ok: false, error: "unavailable", fetchedAt: AT_NOON.toISOString() });
  }
});

test("route file: force-dynamic, GET relays the handler's JSON, status and cache header", () => {
  const source = readFileSync(join(ROOT, "src/app/api/mountain/weather/route.ts"), "utf8");
  assert.match(source, /export const dynamic = "force-dynamic";/);
  assert.match(source, /buildObservationsResponse\(fetch, new Date\(\)\)/);
  assert.match(source, /Response\.json\(body, \{ status, headers \}\)/);
});

/* -------------------------------------------------------------------------- */
/* Client logic                                                               */
/* -------------------------------------------------------------------------- */

test("client: 48 h by the browser's clock, future stamps refused, Madrid time across the clock change", () => {
  const at = "2026-10-26T13:30:00.000Z";
  assert.equal(isRecent(at, new Date("2026-10-28T13:29:00Z")), true);
  assert.equal(isRecent(at, new Date("2026-10-28T13:31:00Z")), false, "48 h and 1 min: not current");
  assert.equal(isRecent("2026-10-28T15:00:00Z", new Date("2026-10-28T13:00:00Z")), false, "two hours in the future");
  assert.equal(isRecent("not a date", new Date()), false);
  assert.equal(hoursSince(at, new Date("2026-10-28T12:00:00Z")), 46);
  assert.equal(hoursSince(at, new Date("2026-10-26T13:00:00Z")), 0, "a fast server clock never reads as negative");
  // 25 Oct 2026, 01:00 UTC: CEST (+2) ends. 22:30 UTC on the 24th is 00:30 on the 25th in Madrid.
  assert.match(readingTime("2026-10-24T22:30:00Z", "ca-ES"), /25.*00:30/);
  assert.match(readingTime("2026-10-26T13:30:00Z", "es-ES"), /26.*14:30/);
  assert.match(readingTime("2026-10-26T13:30:00Z", "en-GB"), /26.*14:30/);
  assert.equal(compass(185, "ca"), "S");
  assert.equal(compass(327, "es"), "NO");
  assert.equal(compass(327, "en"), "NW");
  assert.equal(compass(359, "ca"), "N");
  assert.equal(kmh(9.5), 34);
});

test("client: the view is failed, or per station only what is recent and measured", () => {
  const now = new Date("2026-10-28T12:00:00Z");
  const measures = { temperature: true, wind: 10 as const, snow: true };
  assert.deepEqual(liveView(null, now, []), { kind: "failed" });
  assert.deepEqual(liveView({ ok: false, error: "unavailable", fetchedAt: now.toISOString() }, now, []), { kind: "failed" });
  const obs = {
    temperature: { value: 1.2, at: "2026-10-19T23:30:00.000Z" },
    wind: null,
    snow: { cm: 12, at: "2026-10-26T13:30:00.000Z", change24h: 3 },
  };
  const v = stationView(obs, measures, now);
  assert.equal(v.temperature, null, "nine days old: not shown");
  assert.deepEqual(v.snow, obs.snow);
  assert.equal(v.empty, false);
  assert.equal(stationView(obs, { ...measures, snow: false }, now).empty, true, "a value for something the station does not measure is ignored");
  assert.equal(stationView(undefined, measures, now).empty, true);
  const payload: ObservationsOk = { ok: true, fetchedAt: now.toISOString(), latestAt: obs.snow.at, stations: { DG: obs }, forecast: null };
  const view = liveView(payload, now, [{ code: "DG", measures }, { code: "ZD", measures: { temperature: true, wind: 10, snow: false } }]);
  assert.equal(view.kind, "ok");
  if (view.kind === "ok") {
    assert.deepEqual(view.stations.DG!.snow, obs.snow);
    assert.equal(view.stations.ZD!.empty, true);
  }
});

test("client: the endpoint's JSON is checked before anything is shown from it", () => {
  const ok = { ok: true, fetchedAt: "2026-10-28T12:00:00.000Z", latestAt: null, stations: {}, forecast: null };
  assert.deepEqual(parsePayload(ok), ok);
  assert.equal(parsePayload(null), null);
  assert.equal(parsePayload({ ...ok, fetchedAt: "yesterday" }), null);
  assert.equal(parsePayload({ ...ok, stations: [] }), null);
  assert.equal(parsePayload({ ...ok, stations: { DG: { temperature: { value: "3", at: ok.fetchedAt }, wind: null, snow: null } } }), null);
  assert.equal(parsePayload({ ...ok, stations: { DG: { temperature: null, wind: { speed: 3, direction: null, gust: null, height: 7, at: ok.fetchedAt }, snow: null } } }), null);
  assert.equal(parsePayload({ ...ok, forecast: { provider: "someone", area: "cat1", text: "x", issuedAt: null, attribution: "x" } }), null);
  assert.equal(parsePayload({ ok: false, error: "other", fetchedAt: ok.fetchedAt }), null);
  assert.deepEqual(parsePayload({ ok: false, error: "unavailable", fetchedAt: ok.fetchedAt }), { ok: false, error: "unavailable", fetchedAt: ok.fetchedAt });
});

/* -------------------------------------------------------------------------- */
/* Routing, pages, metadata                                                   */
/* -------------------------------------------------------------------------- */

test("routes: each folder serves its own locale; places in ca and es only; below the threshold is a 404", () => {
  assert.equal(resolveHub("ca", "ca"), "ca");
  assert.equal(resolveHub("es", "es"), "es");
  assert.equal(resolveHub("en", "en"), "en");
  assert.equal(resolveHub("ca", "es"), null, "/es/temps-muntanya/ is a 404");
  assert.equal(resolveHub("en", "ca"), null, "/ca/mountain-weather/ is a 404");
  assert.equal(resolvePlace("ca", "ca", "la-molina")?.slug, "la-molina");
  assert.equal(resolvePlace("es", "es", "la-molina")?.slug, "la-molina");
  assert.equal(resolvePlace("ca", "es", "la-molina"), null, "/es/temps-muntanya/la-molina/ is a 404");
  assert.equal(resolvePlace("es", "ca", "la-molina"), null);
  assert.equal(resolvePlace("ca", "en", "la-molina"), null);
  assert.equal(resolvePlace("ca", "ca", "port-aine"), null, "no station close enough: hub only");
  assert.equal(resolvePlace("ca", "ca", "La-Molina"), null);
  assert.equal(resolvePlace("ca", "ca", "../la-molina"), null);
  assert.equal(placePath("es", "vall-de-nuria"), "/es/tiempo-montana/vall-de-nuria/");
  assert.equal(hubPath("en"), "/en/mountain-weather/");
  for (const route of ["ca", "es"] as const) {
    const params = placeStaticParams(route, route === "ca" ? "lloc" : "lugar");
    assert.equal(params.length, 19);
    assert.ok(params.length <= 20, "the family rule: at most 20 prerendered per locale");
    for (const p of params) {
      assert.equal(p.locale, route);
      assert.ok(resolvePlace(route, p.locale, (p as Record<string, string>)[route === "ca" ? "lloc" : "lugar"]!));
    }
  }
});

test("route files: revalidate=false, notFound(), their own resolver and locale, no database", () => {
  const app = join(ROOT, "src/app/(public)/[locale]");
  const files: [string, RegExp][] = [
    ["temps-muntanya/page.tsx", /resolveHub\("ca"/],
    ["tiempo-montana/page.tsx", /resolveHub\("es"/],
    ["mountain-weather/page.tsx", /resolveHub\("en"/],
    ["temps-muntanya/[lloc]/page.tsx", /resolvePlace\("ca"/],
    ["tiempo-montana/[lugar]/page.tsx", /resolvePlace\("es"/],
  ];
  for (const [file, resolver] of files) {
    const source = readFileSync(join(app, file), "utf8");
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, resolver, file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/, `${file} reads no database`);
    if (file.includes("[")) assert.match(source, /export const dynamicParams = true;/, file);
  }
});

test("metadata: titles <= 60 in the searched words, descriptions <= 155, unique", () => {
  for (const locale of ["ca", "es"] as const) {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const place of PAGE_PLACES) {
      const title = placeTitle(place, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${locale}/${place.slug}: ${title}`);
      assert.match(title, locale === "ca" ? /^Temps .+ avui/ : /^Tiempo .+ hoy/);
      const rendered = composeTitle(title, placePath(locale, place.slug), "2026-10-28");
      const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
      assert.ok(shown.length <= 60, `${locale}/${place.slug} rendered ${shown.length}`);
      const description = placeDescription(place, locale);
      assert.ok(description.length <= DESCRIPTION_LIMIT && description.length >= 70, `${locale}/${place.slug}: ${description.length}`);
      titles.add(title);
      descriptions.add(description);
    }
    assert.equal(titles.size, PAGE_PLACES.length);
    assert.equal(descriptions.size, PAGE_PLACES.length);
  }
  assert.equal(placeTitle(placeBySlug("la-molina")!, "ca"), "Temps a la Molina avui: neu, temperatura i vent");
  assert.equal(placeTitle(placeBySlug("la-molina")!, "es"), "Tiempo en La Molina hoy: nieve, temperatura y viento");
  assert.equal(placeTitle(placeBySlug("montsec-d-ares")!, "ca"), "Temps al Montsec d'Ares avui: temperatura i vent", "no snow sensor, no 'neu'");
  assert.equal(placeTitle(placeBySlug("montsec-d-ares")!, "es"), "Tiempo en el Montsec d'Ares hoy: temperatura y viento");
  for (const locale of LOCALES) {
    const meta = hubMeta(locale);
    assert.ok(meta.title.length <= TITLE_LIMIT, `${locale} hub title`);
    assert.ok(meta.description.length <= DESCRIPTION_LIMIT, `${locale} hub description ${meta.description.length}`);
  }
});

test("metadata: canonical and hreflang between the editions that exist, x-default as elsewhere", () => {
  const place = placeMetadata(placeBySlug("vallter")!, "es");
  assert.equal(place.alternates?.canonical, absoluteUrl("/es/tiempo-montana/vallter/"));
  assert.deepEqual(place.alternates?.languages, {
    ca: absoluteUrl("/ca/temps-muntanya/vallter/"),
    es: absoluteUrl("/es/tiempo-montana/vallter/"),
    "x-default": absoluteUrl("/ca/temps-muntanya/vallter/"),
  });
  const hub = hubMetadata("ca");
  assert.equal(hub.alternates?.canonical, absoluteUrl("/ca/temps-muntanya/"));
  assert.deepEqual(hub.alternates?.languages, {
    ca: absoluteUrl("/ca/temps-muntanya/"),
    es: absoluteUrl("/es/tiempo-montana/"),
    en: absoluteUrl("/en/mountain-weather/"),
    "x-default": absoluteUrl("/en/mountain-weather/"),
  });
});

test("sitemap: 41 URLs, unique, dated with the snapshot, with their alternates", () => {
  const entries = mountainFamilyPaths();
  assert.equal(entries.length, 3 + 19 * 2);
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.path, /^\/(ca\/temps-muntanya|es\/tiempo-montana|en\/mountain-weather)\/([a-z0-9-]+\/)?$/);
    assert.equal(entry.lastModified, SNAPSHOT.readOn);
    assert.ok(Object.values(entry.translations).includes(entry.path), `${entry.path} lists itself`);
  }
  assert.ok(!entries.some((e) => e.path.startsWith("/en/mountain-weather/") && e.path !== "/en/mountain-weather/"), "no English place pages");
  assert.ok(!entries.some((e) => e.path.includes("port-aine")), "below the threshold: not listed");
  assert.deepEqual(mountainSitemap(), [], "nothing on a deployment that may not be indexed");
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /\.\.\.mountainSitemap\(\)/);
});

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

/** A temperature, a wind speed or a snow depth: the browser's only. */
const CONDITIONS = /-?\d+(,\d+)?\s?°C|\d\s?m\/s|\d\s?km\/h|\d+\s?cm\b|hi ha neu a (les pistes|terra) avui|hay nieve (en las pistas|en el suelo) hoy|no hi ha neu|no hay nieve/i;

test("the server HTML never states current conditions (that is the browser's answer)", () => {
  for (const locale of ["ca", "es"] as const) {
    for (const place of PAGE_PLACES) assert.doesNotMatch(JSON.stringify(placeCopy(place, locale)), CONDITIONS, `${locale}/${place.slug}`);
  }
  for (const locale of LOCALES) {
    assert.doesNotMatch(JSON.stringify(hubCopy(locale)), CONDITIONS, `${locale} hub`);
    assert.doesNotMatch(liveLabels(locale).fallback, CONDITIONS);
    assert.match(liveLabels(locale).fallback, /\{link\}/, "the Meteocat link is always in the fallback");
  }
});

test("each page carries its own data and the original guidance", () => {
  const molina = placeCopy(placeBySlug("la-molina")!, "ca");
  assert.match(molina.lead, /^La Molina és una estació d'esquí a Alp \(Cerdanya\), amb pistes entre 1\.667 i 2\.537 m\./);
  assert.match(molina.lead, /lectures validades de temperatura i vent,/, "no snow sensor: the lead does not promise snow depth");
  assert.match(molina.lead, /la Tosa d'Alp \(ZD\), a 2\.478 m i a 3,4 km/);
  assert.ok(molina.facts.some((f) => f.value === "Temperatura, vent (a 10 m); no mesura el gruix de neu"));
  assert.ok(molina.station.some((p) => p.startsWith("**Aquesta estació no mesura el gruix de neu.**")));
  assert.ok(molina.station.some((p) => /a la part alta/.test(p)), "the station's place in the vertical range");
  assert.ok(molina.slopes.join(" ").includes("https://pirineu365.cat/lamolina/en-directe/infoneu/"));
  assert.ok(molina.forecast.join(" ").includes("https://www.meteo.cat/prediccio/municipal/170062"));
  assert.equal(molina.forecastUrl, OFFICIAL.aemetMountain("ca"));
  assert.equal(molina.liveStations[0]!.url, "https://www.meteo.cat/observacions/xema/dades?codi=ZD");
  const montseny = placeCopy(placeBySlug("montseny")!, "es");
  assert.equal(montseny.slopesTitle, null, "a summit has no piste section");
  assert.equal(montseny.forecastUrl, null, "outside AEMET's Pyrenees mountain area");
  assert.ok(!montseny.safety.join(" ").includes("icgc.cat"), "no avalanche bulletin outside the Pyrenees");
  const tavascan = placeCopy(placeBySlug("tavascan")!, "ca");
  assert.ok(tavascan.slopes.join(" ").includes("no van obrir la temporada 2025-2026"));
  assert.deepEqual(placeCopy(placeBySlug("espot")!, "es"), placeCopy(placeBySlug("espot")!, "es"), "deterministic");
  // The hub lists every page in ca/es, none in English, and explains the ones below the threshold.
  for (const locale of ["ca", "es"] as const) {
    const listed = hubCopy(locale).groups.flatMap((g) => g.entries.map((e) => e.href));
    assert.deepEqual([...listed].sort(), PAGE_PLACES.map((p) => placePath(locale, p.slug)).sort());
  }
  assert.ok(hubCopy("en").groups.every((g) => g.entries.every((e) => e.href === null)));
  assert.match(hubCopy("ca").below.find((e) => e.name === "Port Ainé")!.text, /Sort \(677 m\), a 7,4 km: és a més de 7 km i és una estació de vall/);
  assert.equal(hubStations("ca").length, liveStationCodes().length);
});

test("siblings: same area first, never itself; every page reachable from the hub and from a sibling", () => {
  const reached = new Set<string>();
  for (const place of PAGE_PLACES) {
    const s = siblings(place);
    assert.ok(s.length >= 3 && !s.some((p) => p.slug === place.slug), place.slug);
    for (const p of s) reached.add(p.slug);
  }
  assert.equal(siblings(placeBySlug("la-molina")!)[0]!.slug, "masella");
  assert.ok(PAGE_PLACES.filter((p) => !reached.has(p.slug)).length <= 3, "nearly every page has an inbound sibling link");
});

test("links: published guides or family pages only, own language, trailing slash; official hosts only; no leaks", () => {
  const published = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => `/${l}/${paths[l]}/`)));
  const family = new Set(mountainFamilyPaths().map((e) => e.path));
  const hosts = /^https:\/\/(www\.meteo\.cat|www\.aemet\.es|www\.icgc\.cat|bpa\.icgc\.cat|transit\.gencat\.cat|pirineu365\.cat|www\.baqueira\.es|www\.masella\.com|portdelcomte\.net|www\.tavascan365\.com|www\.totnordic\.com|www\.guils\.com|lles\.net|www\.aransaesqui\.cat|www\.santjoandelerm\.org|www\.virosvallferrera\.cat|analisi\.transparenciacatalunya\.cat|eines\.icgc\.cat)\//;
  const check = (locale: string, value: unknown) => {
    const text = JSON.stringify(value);
    assert.doesNotMatch(text, /\$\{|undefined|NaN|\[object|aerobusbcn/i, locale);
    for (const m of text.matchAll(/\]\((\/[^)]*)\)/g)) {
      assert.ok(m[1]!.startsWith(`/${locale}/`) && m[1]!.endsWith("/"), m[1]);
      assert.ok(published.has(m[1]!) || family.has(m[1]!), `${m[1]} is not published`);
    }
    for (const m of text.matchAll(/"href":"([^"]+)"/g)) assert.ok(published.has(m[1]!) || family.has(m[1]!), m[1]);
    for (const m of text.matchAll(/\]\((https?:[^)]*)\)/g)) assert.match(m[1]!, hosts);
    for (const m of text.matchAll(/"(?:url|meteocatUrl|forecastUrl)":"([^"]+)"/g)) assert.match(m[1]!, hosts);
  };
  for (const locale of ["ca", "es"] as const) for (const place of PAGE_PLACES) check(locale, placeCopy(place, locale));
  for (const locale of LOCALES) check(locale, hubCopy(locale));
  for (const def of PLACE_DEFS) for (const l of def.links) assert.match(l.url, hosts, `${def.slug}: ${l.url}`);
});

test("server output carries no clock; the live block is a client component reading after mount", () => {
  const files = [
    "src/lib/programmatic/mountain/copy.ts",
    "src/lib/programmatic/mountain/data.ts",
    "src/lib/programmatic/mountain/pages.ts",
    "src/lib/programmatic/mountain/paths.ts",
    "src/lib/programmatic/mountain/places.ts",
    "src/components/programmatic/mountain/PlacePage.tsx",
    "src/components/programmatic/mountain/HubPage.tsx",
    "src/app/(public)/[locale]/temps-muntanya/page.tsx",
    "src/app/(public)/[locale]/temps-muntanya/[lloc]/page.tsx",
    "src/app/(public)/[locale]/tiempo-montana/page.tsx",
    "src/app/(public)/[locale]/tiempo-montana/[lugar]/page.tsx",
    "src/app/(public)/[locale]/mountain-weather/page.tsx",
  ];
  for (const file of files) assert.doesNotMatch(readFileSync(join(ROOT, file), "utf8"), /new Date\(\)|Date\.now\(/, file);
  const client = readFileSync(join(ROOT, "src/components/programmatic/mountain/MountainLive.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(/);
  assert.doesNotMatch(client, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(client, /^import (?!type )[^;]*from "@\/lib\/programmatic\/mountain\/(copy|data|pages|observations|places|prepare)";/m, "no snapshot in the browser bundle");
  for (const file of ["live.ts", "labels.ts", "types.ts"]) {
    assert.doesNotMatch(readFileSync(join(ROOT, "src/lib/programmatic/mountain", file), "utf8"), /from "\.\/(snapshot\.json|data|observations|copy|pages|places|prepare)"/, file);
  }
  for (const page of ["PlacePage.tsx", "HubPage.tsx"]) {
    assert.doesNotMatch(readFileSync(join(ROOT, "src/components/programmatic/mountain", page), "utf8"), /liveLabels/, page);
  }
});

/* -------------------------------------------------------------------------- */
/* Links from the pages that already rank                                     */
/* -------------------------------------------------------------------------- */

test("ski and snow-today guides gain exactly one body link per language to the hub, titles untouched", () => {
  for (const file of ["src/lib/content/batch02/ski.ts", "src/lib/content/batch02/snow-now.ts"]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    for (const locale of LOCALES) assert.equal(source.split(`mountainHub("${locale}")`).length - 1, 1, `${file} ${locale}`);
  }
  const ski = readFileSync(join(ROOT, "src/lib/content/batch02/ski.ts"), "utf8");
  assert.ok(ski.includes(`seoTitle: "Estacions d'esquí de Catalunya 2026-27: obertura i forfets"`));
  const snow = readFileSync(join(ROOT, "src/lib/content/batch02/snow-now.ts"), "utf8");
  assert.ok(snow.includes(`seoTitle: "Hi ha neu al Pirineu? Gruix de neu avui (Meteocat)"`));
  assert.match(readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8"), /wants\("mountain-links"\)/);
});
