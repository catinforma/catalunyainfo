/**
 * Builds `src/lib/programmatic/mountain/snapshot.json`, the static data behind
 * /ca/temps-muntanya/, /es/tiempo-montana/ and /en/mountain-weather/ (the
 * readings are fetched by the browser from /api/mountain/weather/, never
 * from this file).
 *
 *   npm run mountain:snapshot -- build
 *       Reads Meteocat's station metadata (yqwd-vj5e), what each nearby
 *       station reported in the last 14 days (nzvn-apee, any status), and each
 *       place's official toponym from the ICGC geocoder; matches stations to
 *       places with the threshold in prepare.ts and writes the snapshot.
 *
 *   npm run mountain:snapshot -- check
 *       Rebuilds in memory and says what would change (a station moved,
 *       retired or added near a place; a place crossing the threshold).
 *       Writes nothing.
 *
 *   npm run mountain:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { PLACE_DEFS } from "../src/lib/programmatic/mountain/places.ts";
import {
  VARIABLE_CODES,
  byDistance,
  distanceKm,
  matchStations,
  measuresFrom,
  operationalStations,
  pickToponym,
  reportsSomething,
  type IcgcFeature,
  type StationMetaRow,
} from "../src/lib/programmatic/mountain/prepare.ts";
import type { MountainSnapshot, SnapshotPlace, SnapshotPoint, SnapshotStation } from "../src/lib/programmatic/mountain/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT_FILE = join(ROOT, "src/lib/programmatic/mountain/snapshot.json");

const SOCRATA = "https://analisi.transparenciacatalunya.cat/resource";
const STATIONS_URL = `${SOCRATA}/yqwd-vj5e.json?$limit=2000`;
const READINGS = `${SOCRATA}/nzvn-apee.json`;
const ICGC = "https://eines.icgc.cat/geocodificador/cerca";
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "application/json" };

/** Stations further than this from every place are not even considered. */
const CANDIDATE_RADIUS_KM = 25;
/** Days of readings used to learn what each station measures. */
const MEASURES_DAYS = 14;

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

async function toponym(name: string, municipalityCode: string, query: string): Promise<SnapshotPoint> {
  const url = `${ICGC}?text=${encodeURIComponent(query)}&size=10&layers=topo1,topo2`;
  const body = await getJson<{ features?: IcgcFeature[] }>(url);
  const point = pickToponym(body.features ?? [], name, municipalityCode);
  if (!point) throw new Error(`ICGC has no "${name}" in municipality ${municipalityCode} (query "${query}"): check places.ts`);
  return point;
}

async function read(): Promise<MountainSnapshot> {
  const all = operationalStations(await getJson<StationMetaRow[]>(STATIONS_URL));

  const points = new Map<string, SnapshotPoint>();
  for (const def of PLACE_DEFS) points.set(def.slug, await toponym(def.icgc.name, def.icgc.municipalityCode, def.icgc.query ?? def.icgc.name));

  const candidates = all.filter((s) => [...points.values()].some((p) => distanceKm(p, s) <= CANDIDATE_RADIUS_KM));
  const since = new Date(Date.now() - MEASURES_DAYS * 86_400_000).toISOString().slice(0, 10);
  const codes = candidates.map((s) => `'${s.code}'`).join(",");
  const variables = VARIABLE_CODES.map((v) => `'${v}'`).join(",");
  const grouped = await getJson<{ codi_estacio?: string; codi_variable?: string }[]>(
    `${READINGS}?$select=codi_estacio,codi_variable&$group=codi_estacio,codi_variable&$limit=5000&$where=${encodeURIComponent(
      `codi_estacio in(${codes}) AND codi_variable in(${variables}) AND data_lectura >= '${since}T00:00:00'`,
    )}`,
  );
  const measures = measuresFrom(grouped);
  const stations: SnapshotStation[] = candidates.map((s) => ({ ...s, measures: measures.get(s.code) ?? s.measures }));
  const reporting = stations.filter(reportsSomething);

  const places: SnapshotPlace[] = PLACE_DEFS.map((def) => {
    const point = points.get(def.slug)!;
    return {
      slug: def.slug,
      point,
      stations: matchStations(def.kind, def.altitude, point, reporting),
      nearest: byDistance(point, reporting).slice(0, 3),
    };
  });

  const used = new Set(places.flatMap((p) => [...p.stations, ...p.nearest].map((l) => l.code)));
  return {
    readOn: madridToday(),
    sources: {
      stations: {
        name: "Metadades estacions meteorològiques automàtiques",
        publisher: "Servei Meteorològic de Catalunya (Meteocat)",
        url: "https://analisi.transparenciacatalunya.cat/d/yqwd-vj5e",
        terms: "Avís legal del Meteocat (www.meteo.cat/wpweb/avis-legal/): reutilització citant la font i la data de la darrera actualització, sense alterar el contingut",
      },
      readings: {
        name: "Dades meteorològiques de la XEMA",
        publisher: "Servei Meteorològic de Catalunya (Meteocat)",
        url: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee",
        terms: "Avís legal del Meteocat (www.meteo.cat/wpweb/avis-legal/): reutilització citant la font i la data de la darrera actualització, sense alterar el contingut",
      },
      toponyms: {
        name: "Geocodificador (Nomenclàtor oficial de toponímia)",
        publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)",
        url: "https://eines.icgc.cat/geocodificador/",
        terms: "Dades obertes de l'ICGC; noms i coordenades del nomenclàtor",
      },
    },
    stations: stations.filter((s) => used.has(s.code)).sort((a, b) => a.code.localeCompare(b.code)),
    places,
  };
}

async function build(): Promise<void> {
  const snapshot = await read();
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`Wrote ${SNAPSHOT_FILE} (read ${snapshot.readOn})`);
  for (const place of snapshot.places) {
    const near = place.nearest.map((l) => `${l.code} ${l.distanceKm} km`).join(", ");
    const matched = place.stations.map((l) => `${l.code} ${l.distanceKm} km`).join(", ");
    console.log(`  ${place.slug.padEnd(22)} ${matched ? `PAGE  ${matched}` : `hub   (nearest ${near})`}`);
  }
}

async function check(): Promise<void> {
  const { default: current } = await import("../src/lib/programmatic/mountain/snapshot.json", { with: { type: "json" } });
  const old = current as MountainSnapshot;
  const fresh = await read();
  let changes = 0;
  const describe = (p: SnapshotPlace | undefined) => (p ? p.stations.map((l) => `${l.code}@${l.distanceKm}`).join(",") || "hub only" : "absent");
  for (const place of fresh.places) {
    const before = describe(old.places.find((p) => p.slug === place.slug));
    const after = describe(place);
    if (before !== after) {
      console.log(`CHANGED ${place.slug}: was ${before}, now ${after}`);
      changes += 1;
    }
  }
  for (const station of fresh.stations) {
    const was = old.stations.find((s) => s.code === station.code);
    if (!was || JSON.stringify(was) !== JSON.stringify(station)) {
      console.log(`STATION ${station.code}: ${was ? "metadata or sensors changed" : "new near a place"}`);
      changes += 1;
    }
  }
  console.log(changes ? `${changes} change(s): run "build", review the diff, run the tests.` : `No change since ${old.readOn}.`);
}

async function urls(): Promise<void> {
  const { mountainFamilyPaths } = await import("../src/lib/programmatic/mountain/pages.ts");
  for (const entry of mountainFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const command = process.argv[2] ?? "build";
const run = { build, check, urls }[command];
if (!run) {
  console.error(`Unknown command "${command}". Use build, check or urls.`);
  process.exit(1);
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
