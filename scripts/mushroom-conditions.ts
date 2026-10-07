/**
 * Refreshes the mushroom report's measured data from Meteocat.
 *
 * ## Why this exists
 *
 * `/es/naturaleza/setas-cataluna-condiciones/` was the best page on the site:
 * position 2.8, 25 clicks a week, 11.9% CTR. Between 23 September and 6
 * October it went to **zero clicks and 25 impressions**, an 88% collapse in
 * impressions, during what is supposed to be the peak of the season.
 *
 * It was not competition and it was not seasonality. The page says
 * "last verified 13 September" and five other pages on the site call it a
 * *weekly* report. It had been refreshed exactly once, on the day it was
 * published. A freshness product that stops being fresh does not hold its
 * position; it loses it, because the one thing it promised turns out not to be
 * true.
 *
 * This script is the fix: the measured layer of that page now comes from the
 * Generalitat's open data and carries the date it was read.
 *
 * ## What it publishes, and what it refuses to
 *
 * **Published:** accumulated rainfall per zone over the last 15 days, how many
 * stations that average covers, and how many days since the last measurable
 * rain. All of it measured, all of it from XEMA.
 *
 * **Derived, by a rule printed on the page:** a condition band. The thresholds
 * are in `LEVEL_RULE` below, they are stated in the article, and they are the
 * only judgement in the pipeline.
 *
 * **Never:** that there are mushrooms anywhere. Rain is measured; fruiting is
 * inferred from it unreliably, depends on species, substrate and ground
 * temperature, and is not something a rainfall total can establish. The
 * vocabulary is the same closed set the `conditionsMap` block enforces, and
 * none of its values means "there are mushrooms here".
 *
 * Usage: `npm run mushrooms:refresh`
 * Writes `src/lib/content/mushrooms/conditions.ts`, which is generated.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export {};

const SOCRATA = "https://analisi.transparenciacatalunya.cat/resource";
/** Half-hourly readings from the automatic weather station network. */
const MEASUREMENTS = `${SOCRATA}/nzvn-apee.json`;
/** Station metadata: comarca, altitude, operational state. */
const STATIONS = `${SOCRATA}/yqwd-vj5e.json`;

/** `35` is Precipitació, in millimetres. */
const RAIN = "35";

/** The window the report has always talked in. */
const WINDOW_DAYS = 15;

/** Below this, a half-hourly reading is dew and instrument noise, not rain. */
const WET_READING_MM = 0.2;

/**
 * The zones the article is written around, and the comarques that make them
 * up. Taken from the article, not invented here: changing this changes what
 * the prose is describing.
 */
const ZONE_COMARQUES: Record<string, string[]> = {
  ripolles: ["Ripollès"],
  bergueda: ["Berguedà"],
  garrotxa: ["Garrotxa"],
  osona: ["Osona"],
  pirineu: [
    "Val d'Aran",
    "Alta Ribagorça",
    "Pallars Sobirà",
    "Pallars Jussà",
    "Alt Urgell",
    "Cerdanya",
  ],
  montseny: ["Vallès Oriental", "Selva"],
  // Split out of Ponent on the laptop's 7 October rewrite of the article.
  ports: ["Baix Ebre", "Montsià", "Ribera d'Ebre", "Terra Alta"],
  ponent: ["Segrià", "Pla d'Urgell", "Urgell", "Noguera", "Garrigues", "Segarra"],
};

/**
 * The rule, in one place, so the article can state it and a reader can
 * disagree with it.
 *
 * Two inputs, both measured: how much rain fell in the window, and how long
 * ago it stopped. Rain three weeks ago with nothing since does not leave a
 * damp forest floor, which is why the second input exists at all.
 */
const LEVEL_RULE = [
  { level: "very", minMm: 60, maxDaysSinceRain: 7 },
  { level: "favourable", minMm: 35, maxDaysSinceRain: 10 },
  { level: "interesting", minMm: 20, maxDaysSinceRain: 21 },
  { level: "patchy", minMm: 8, maxDaysSinceRain: 99 },
  { level: "low", minMm: 0, maxDaysSinceRain: 99 },
] as const;

type Level = (typeof LEVEL_RULE)[number]["level"];

function levelFor(mm: number, daysSinceRain: number): Level {
  for (const rule of LEVEL_RULE) {
    if (mm >= rule.minMm && daysSinceRain <= rule.maxDaysSinceRain) return rule.level;
  }
  return "low";
}

interface Station {
  code: string;
  name: string;
  comarca: string;
  altitude: number;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return (await response.json()) as T;
}

async function loadStations(): Promise<Map<string, Station>> {
  const wanted = new Set(Object.values(ZONE_COMARQUES).flat());
  const rows = await getJson<Record<string, string>[]>(
    `${STATIONS}?$limit=2000&$select=codi_estacio,nom_estacio,nom_comarca,altitud,nom_estat_ema`,
  );

  const out = new Map<string, Station>();
  for (const row of rows) {
    // Stations that have been decommissioned still appear in the metadata and
    // would silently drag a zone average towards nothing.
    if (row.nom_estat_ema !== "Operativa") continue;
    const comarca = row.nom_comarca ?? "";
    if (!wanted.has(comarca)) continue;
    out.set(row.codi_estacio ?? "", {
      code: row.codi_estacio ?? "",
      name: row.nom_estacio ?? "",
      comarca,
      altitude: Number(row.altitud ?? 0),
    });
  }
  return out;
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return `${date.toISOString().slice(0, 10)}T00:00:00`;
}

/** Accumulated millimetres per station over the window, aggregated by Socrata. */
async function loadRainfall(): Promise<Map<string, { mm: number; readings: number }>> {
  const since = isoDaysAgo(WINDOW_DAYS);
  const url =
    `${MEASUREMENTS}?$select=codi_estacio,sum(valor_lectura) AS mm,count(*) AS n` +
    `&$where=codi_variable='${RAIN}' AND data_lectura > '${since}'` +
    `&$group=codi_estacio&$limit=1000`;

  const rows = await getJson<Record<string, string>[]>(encodeURI(url));
  const out = new Map<string, { mm: number; readings: number }>();
  for (const row of rows) {
    out.set(row.codi_estacio ?? "", {
      mm: Number(row.mm ?? 0),
      readings: Number(row.n ?? 0),
    });
  }
  return out;
}

/** The most recent half-hour in which each station actually measured rain. */
async function loadLastWet(): Promise<Map<string, string>> {
  const since = isoDaysAgo(60);
  const url =
    `${MEASUREMENTS}?$select=codi_estacio,max(data_lectura) AS last_wet` +
    `&$where=codi_variable='${RAIN}' AND data_lectura > '${since}'` +
    ` AND valor_lectura > ${WET_READING_MM}` +
    `&$group=codi_estacio&$limit=1000`;

  const rows = await getJson<Record<string, string>[]>(encodeURI(url));
  const out = new Map<string, string>();
  for (const row of rows) out.set(row.codi_estacio ?? "", row.last_wet ?? "");
  return out;
}

function daysSince(iso: string | undefined): number {
  if (!iso) return 99;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 99;
  return Math.max(0, Math.round((Date.now() - then) / 86_400_000));
}

interface ZoneReading {
  id: string;
  mm: number;
  stations: number;
  daysSinceRain: number;
  level: Level;
  wettest: { name: string; mm: number } | null;
}

async function main() {
  console.log(`Reading XEMA, ${WINDOW_DAYS}-day window, from the Generalitat's open data.\n`);

  const [stations, rainfall, lastWet] = await Promise.all([
    loadStations(),
    loadRainfall(),
    loadLastWet(),
  ]);

  console.log(`${stations.size} operative stations in the zones the article covers.`);

  const readings: ZoneReading[] = [];

  for (const [id, comarques] of Object.entries(ZONE_COMARQUES)) {
    const inZone = [...stations.values()].filter((station) =>
      comarques.includes(station.comarca),
    );
    const withData = inZone
      .map((station) => ({ station, rain: rainfall.get(station.code) }))
      .filter((item): item is { station: Station; rain: { mm: number; readings: number } } =>
        Boolean(item.rain),
      );

    if (withData.length === 0) {
      console.log(`SKIP  ${id}: no station reported in the window`);
      continue;
    }

    // The mean, not the maximum. One station under a storm cell is not a
    // reading for a comarca, and the headline figure on the old page was a
    // single wettest station, which is the easiest way to overstate a zone.
    const mm = withData.reduce((total, item) => total + item.rain.mm, 0) / withData.length;

    const daysSinceRain = Math.min(
      ...withData.map((item) => daysSince(lastWet.get(item.station.code))),
    );

    const wettest = withData.reduce((best, item) =>
      item.rain.mm > best.rain.mm ? item : best,
    );

    readings.push({
      id,
      mm: Math.round(mm * 10) / 10,
      stations: withData.length,
      daysSinceRain,
      level: levelFor(mm, daysSinceRain),
      wettest: { name: wettest.station.name, mm: Math.round(wettest.rain.mm * 10) / 10 },
    });

    console.log(
      `  ${id.padEnd(10)} ${String(Math.round(mm)).padStart(4)} mm mean ` +
        `over ${String(withData.length).padStart(2)} stations, ` +
        `last rain ${daysSinceRain}d ago -> ${levelFor(mm, daysSinceRain)}`,
    );
  }

  if (readings.length < Object.keys(ZONE_COMARQUES).length) {
    // A partial refresh would publish some zones as current and leave others
    // silently stale under the same date stamp, which is worse than not
    // refreshing at all.
    throw new Error(
      `only ${readings.length} of ${Object.keys(ZONE_COMARQUES).length} zones reported; refusing to write a partial refresh`,
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const body = `// GENERATED FILE - do not edit by hand.
// Source: XEMA, via the Generalitat's open data portal.
// Regenerate with: npm run mushrooms:refresh
//
// Rainfall is measured. The condition band is derived from it by the rule in
// scripts/mushroom-conditions.ts, which the article states in full. Neither
// says anything about whether mushrooms are present: that depends on species,
// substrate and ground temperature, and a rainfall total cannot establish it.

export interface ZoneReading {
  readonly id: string;
  /** Mean accumulated rainfall across the zone's stations, in mm. */
  readonly mm: number;
  /** How many stations that mean covers. */
  readonly stations: number;
  /** Days since the wettest station last measured rain. */
  readonly daysSinceRain: number;
  readonly level: "very" | "favourable" | "interesting" | "patchy" | "low";
  readonly wettest: { readonly name: string; readonly mm: number } | null;
}

/** The window the figures cover, in days. */
export const WINDOW_DAYS = ${WINDOW_DAYS};

/** ISO date the data was read. This is what the page shows as last verified. */
export const READ_AT = ${JSON.stringify(today)};

export const SOURCE = {
  name: "Dades meteorològiques de la XEMA",
  url: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee",
  publisher: "Servei Meteorològic de Catalunya, Generalitat de Catalunya",
};

/** The thresholds, exported so the article can print them rather than restate them. */
export const LEVEL_RULE = ${JSON.stringify(LEVEL_RULE, null, 2)} as const;

export const ZONE_READINGS: readonly ZoneReading[] = ${JSON.stringify(readings, null, 2)};
`;

  const out = join(process.cwd(), "src", "lib", "content", "mushrooms", "conditions.ts");
  await writeFile(out, body, "utf8");
  console.log(`\nWrote ${readings.length} zones to conditions.ts, read at ${today}.`);
}

await main();
