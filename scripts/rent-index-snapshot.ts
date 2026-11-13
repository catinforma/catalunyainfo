/**
 * Builds `src/lib/programmatic/rent-update/snapshot.json`: the INE series
 * behind the rent-update calculator (/es/calculadoras/actualizar-alquiler/,
 * /ca/calculadores/actualitzar-lloguer/, /en/calculators/rent-increase-spain/).
 * The pages read the IPC and the IRAV live (server.ts, once a day) and fall
 * back to this file, printed with its date; the IGC (2023 cap only) comes
 * from here alone.
 *
 *   npm run rent:snapshot -- build    writes the snapshot
 *   npm run rent:snapshot -- check    says how old it is against the INE; writes nothing
 *
 * Every month kept has a release day in the INE's calendar; a month with a
 * value but no release day, or a release day after today, stops the build.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { SERIES, buildSeries, calendarUrl, latestPoint, madridDay, parseCalendar, parseSeries, seriesUrl, type SeriesData, type SeriesId } from "../src/lib/programmatic/rent-update/ine.ts";
import type { RentSnapshot } from "../src/lib/programmatic/rent-update/data.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = join(ROOT, "src/lib/programmatic/rent-update/snapshot.json");
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "application/json" };

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function read(id: SeriesId, today: string): Promise<SeriesData> {
  const spec = SERIES[id];
  const [values, calendar] = await Promise.all([getJson(seriesUrl(spec)).then(parseSeries), getJson(calendarUrl(spec)).then(parseCalendar)]);
  for (const month of values.keys()) {
    if (month < spec.from) continue;
    const day = calendar.get(month);
    if (!day) throw new Error(`${spec.code} ${month}: value without a release day in calendar ${spec.publication}`);
    if (day > today) throw new Error(`${spec.code} ${month}: value before its release day ${day}`);
  }
  const series = buildSeries(id, values, calendar, today);
  if (!latestPoint(series)) throw new Error(`${spec.code}: no published month`);
  return series;
}

async function main() {
  const mode = process.argv[2] ?? "check";
  const now = new Date();
  const today = madridDay(now);
  const ids: SeriesId[] = ["ipc", "irav", "igc"];
  const live = await Promise.all(ids.map((id) => read(id, today)));
  const series = Object.fromEntries(ids.map((id, i) => [id, live[i]!])) as Record<SeriesId, SeriesData>;

  if (mode === "check") {
    const own = JSON.parse(readFileSync(FILE, "utf8")) as RentSnapshot;
    for (const id of ids) {
      const a = latestPoint(own.series[id])?.month;
      const b = latestPoint(series[id])?.month;
      console.log(`${SERIES[id].code}: snapshot ${a}, INE ${b}${a === b ? "" : "  <- rebuild"}`);
    }
    return;
  }
  if (mode !== "build") throw new Error(`unknown mode ${mode}`);
  const snapshot: RentSnapshot = { fetchedAt: now.toISOString(), asOf: today, series };
  writeFileSync(FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  for (const id of ids) console.log(`${SERIES[id].code}: latest ${JSON.stringify(latestPoint(series[id]))}, ${series[id].points.length} months`);
}

await main();
