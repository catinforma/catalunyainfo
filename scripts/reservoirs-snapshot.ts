/**
 * Builds `src/lib/programmatic/reservoirs/snapshot.json`, the static data
 * behind /ca/embassaments/, /es/embalses/ and /en/reservoirs/ (today's
 * reading is fetched by the browser from /api/reservoirs/levels/, never from
 * this file).
 *
 *   npm run reservoirs:snapshot -- build
 *       Reads the ACA's daily series (gn9e-3qhr) for the last 400 days and
 *       the registration-time history (vjx7-6kcp) for station codes and
 *       basins, checks every row against the reservoir's known size, and
 *       writes the snapshot: latest reading, the reading a year earlier,
 *       the year's lowest and highest, and one reading a month.
 *
 *   npm run reservoirs:snapshot -- check
 *       Says how old the snapshot is against the live series. Writes nothing.
 *
 *   npm run reservoirs:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 *
 * Why the trend is read from gn9e-3qhr and not from vjx7-6kcp: on the day
 * this was written (28 Oct 2026) the registration-time history still had
 * percentages without their decimal separator (1 Mar 2026: la Llosa del
 * Cavall "1006", Sant Ponç "922"), rows flagged "#ERROR", duplicates, and days
 * with stations missing (27 Oct 2025: no Llobregat reservoirs). The daily
 * series agrees with the ACA's bulletin and every one of its 3,600 rows of the
 * year passes the size check. vjx7-6kcp is still read for what only it has
 * (station code, basin, sub-basin) and as a cross-check of the latest day.
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { splitStation } from "../src/lib/content/reservoirs/levels.ts";
import { missingReservoirs, shiftDays, trendOf, validReadings, type AcaRow } from "../src/lib/programmatic/reservoirs/prepare.ts";
import { RESERVOIRS, type ReservoirSnapshot, type SnapshotReservoir } from "../src/lib/programmatic/reservoirs/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT_FILE = join(ROOT, "src/lib/programmatic/reservoirs/snapshot.json");

const PORTAL = "https://analisi.transparenciacatalunya.cat";
const DAILY = "gn9e-3qhr";
const HISTORY = "vjx7-6kcp";
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "application/json" };
const TERMS =
  "Llicència oberta d'ús d'informació - Catalunya: cal citar «Generalitat de Catalunya. Departament de Territori, Habitatge i Transició Ecològica. Agència Catalana de l'Aigua» i la data de la darrera actualització";

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: UA });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function soql(dataset: string, params: Record<string, string>): Promise<unknown[]> {
  const json = await getJson(`${PORTAL}/resource/${dataset}.json?${new URLSearchParams(params).toString()}`);
  if (!Array.isArray(json)) throw new Error(`${dataset}: not a list`);
  return json;
}

async function rowsUpdated(dataset: string): Promise<{ name: string; updated: string | null }> {
  const meta = (await getJson(`${PORTAL}/api/views/${dataset}.json`)) as { name?: string; rowsUpdatedAt?: number };
  const updated = typeof meta.rowsUpdatedAt === "number" ? new Date(meta.rowsUpdatedAt * 1000).toISOString().slice(0, 10) : null;
  return { name: meta.name ?? dataset, updated };
}

interface HistoryRow {
  dia?: string;
  codi_estacio?: string;
  estacio?: string;
  conca?: string;
  subconca?: string;
  valor?: string;
}

/** Station code, basin and sub-basin per reservoir name, from the last day that has them all. */
async function historyStations(latest: string): Promise<{ meta: Map<string, { code: string; basin: string; subbasin: string }>; rows: HistoryRow[] }> {
  const meta = new Map<string, { code: string; basin: string; subbasin: string }>();
  let rows: HistoryRow[] = [];
  for (let back = 1; back <= 10 && missingReservoirs(meta.keys()).length > 0; back++) {
    const day = shiftDays(latest, -back);
    rows = (await soql(HISTORY, {
      $where: `dia='${day}T00:00:00.000' AND hora='23:55' AND tipus_variable='Percentatge volum embassat'`,
      $limit: "200",
    })) as HistoryRow[];
    for (const row of rows) {
      if (!row.estacio || !row.codi_estacio) continue;
      const { name } = splitStation(row.estacio);
      if (!meta.has(name)) meta.set(name, { code: row.codi_estacio.trim(), basin: (row.conca ?? "").trim(), subbasin: (row.subconca ?? "").trim() });
    }
  }
  return { meta, rows };
}

async function build(): Promise<void> {
  const readOn = madridToday();
  const since = shiftDays(readOn, -400);
  const raw = (await soql(DAILY, { $where: `dia >= '${since}T00:00:00.000'`, $order: "dia", $limit: "20000" })) as AcaRow[];
  const { byName, rejected } = validReadings(raw);
  const missing = missingReservoirs(byName.keys());
  if (missing.length > 0) throw new Error(`${DAILY} has no valid reading for ${missing.join(", ")}: check the dataset before removing pages`);
  const unknown = [...new Set(raw.map((r) => splitStation(r.estaci ?? "").name))].filter((n) => !RESERVOIRS.some((r) => r.name === n));
  if (unknown.length) console.log(`  NOT in the family (new station?): ${unknown.join(", ")}`);

  const reservoirs: SnapshotReservoir[] = RESERVOIRS.map(({ slug, name }) => {
    const list = byName.get(name)!;
    const stationLabel = raw.find((r) => r.estaci && splitStation(r.estaci).name === name)?.estaci?.trim() ?? `Embassament de ${name}`;
    return {
      slug,
      name,
      station: stationLabel,
      place: splitStation(stationLabel).place,
      code: null,
      basin: null,
      subbasin: null,
      trend: trendOf(list, rejected.get(name) ?? 0),
    };
  });
  const latestDate = reservoirs.map((r) => r.trend.latest.date).sort().at(-1)!;

  const history = await historyStations(latestDate);
  for (const r of reservoirs) {
    const m = history.meta.get(r.name);
    if (m) Object.assign(r, { code: m.code, basin: m.basin, subbasin: m.subbasin });
  }

  const [dailyMeta, historyMeta] = await Promise.all([rowsUpdated(DAILY), rowsUpdated(HISTORY)]);
  const snapshot: ReservoirSnapshot = {
    readOn,
    latestDate,
    sources: {
      daily: { id: DAILY, name: dailyMeta.name, publisher: "Agència Catalana de l'Aigua (ACA)", url: `${PORTAL}/d/${DAILY}`, terms: TERMS, updated: dailyMeta.updated },
      history: { id: HISTORY, name: historyMeta.name, publisher: "Agència Catalana de l'Aigua (ACA)", url: `${PORTAL}/d/${HISTORY}`, terms: TERMS, updated: historyMeta.updated },
    },
    reservoirs,
  };
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 1)}\n`);

  console.log(`Wrote ${SNAPSHOT_FILE}`);
  console.log(`  read ${readOn}; latest reading ${latestDate}; ${raw.length} rows since ${since}`);
  for (const r of reservoirs) {
    const t = r.trend;
    console.log(
      `  ${r.name.padEnd(20)} ${r.code ?? "?"} ${t.latest.date} ${t.latest.percent}% | a year earlier ${t.yearAgo?.date ?? "-"} ${t.yearAgo?.percent ?? "-"}% | min ${t.min.percent}% ${t.min.date} | max ${t.max.percent}% ${t.max.date} | ${t.validDays} days, ${t.rejected} rejected`,
    );
  }

  // Cross-check: the history's 23:55 value against the daily row of the same day.
  const day = history.rows[0]?.dia?.slice(0, 10);
  if (day) {
    for (const row of history.rows) {
      const { name } = splitStation(row.estacio ?? "");
      const daily = byName.get(name)?.find((r) => r.date === day);
      const value = Number(row.valor);
      if (daily && Number.isFinite(value) && Math.abs(daily.percent - value) > 1.5) {
        console.log(`  CHECK ${name} ${day}: daily ${daily.percent}% vs history 23:55 ${value}%`);
      }
    }
  }
}

async function check(): Promise<void> {
  const { default: current } = await import("../src/lib/programmatic/reservoirs/snapshot.json", { with: { type: "json" } });
  const snapshot = current as ReservoirSnapshot;
  const rows = (await soql(DAILY, { $order: "dia DESC", $limit: "20" })) as AcaRow[];
  const newest = rows[0]?.dia?.slice(0, 10) ?? "?";
  const names = new Set(rows.map((r) => splitStation(r.estaci ?? "").name));
  const missing = missingReservoirs(names);
  console.log(`Snapshot read ${snapshot.readOn}, latest reading ${snapshot.latestDate}; the ACA's newest row is ${newest}.`);
  if (missing.length) console.log(`  Not in the ACA's newest rows: ${missing.join(", ")}`);
  console.log("The pages show today's reading from the browser; rebuild the snapshot to move the one-year trend (monthly is enough), and in January for the year in the titles.");
}

async function urls(): Promise<void> {
  const { reservoirFamilyPaths } = await import("../src/lib/programmatic/reservoirs/pages.ts");
  for (const entry of reservoirFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
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
