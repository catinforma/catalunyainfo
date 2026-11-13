/**
 * Builds `src/lib/programmatic/ipc/snapshot.json`: the four INE series and
 * the CPI release calendar behind "IPC hoy" (/es/calculadoras/ipc/,
 * /ca/calculadores/ipc/, /en/calculators/spain-inflation-cpi/). The pages
 * read the INE live once a day (ipc/server.ts) and fall back to this file,
 * printed with its date.
 *
 *   npm run ipc:snapshot -- build    writes the snapshot
 *   npm run ipc:snapshot -- check    says how old it is against the INE; writes nothing
 *
 * Every month kept has a final release day in the INE's calendar; a month
 * with a value but no release day, or a release day after today, stops the
 * build.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parseSeries, madridDay } from "../src/lib/programmatic/rent-update/ine.ts";
import { IPC_FROM, IPC_SERIES, IPC_SERIES_IDS, buildIpc, finalDays, ipcCalendarUrl, ipcSeriesUrl, latestMonth, parseReleases, type IpcSeriesId } from "../src/lib/programmatic/ipc/series.ts";
import type { IpcSnapshot } from "../src/lib/programmatic/ipc/data.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = join(ROOT, "src/lib/programmatic/ipc/snapshot.json");
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "application/json" };

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const mode = process.argv[2] ?? "check";
  const now = new Date();
  const today = madridDay(now);
  const releases = parseReleases(await getJson(ipcCalendarUrl()));
  if (releases.length === 0) throw new Error("INE calendar 8: no releases");
  const finals = finalDays(releases);
  const values = {} as Record<IpcSeriesId, Map<string, number>>;
  for (const id of IPC_SERIES_IDS) {
    const v = parseSeries(await getJson(ipcSeriesUrl(IPC_SERIES[id])));
    for (const month of v.keys()) {
      if (month < IPC_FROM) continue;
      const day = finals.get(month);
      if (!day) throw new Error(`${IPC_SERIES[id].code} ${month}: value without a release day in calendar 8`);
      if (day > today) throw new Error(`${IPC_SERIES[id].code} ${month}: value before its release day ${day}`);
    }
    values[id] = v;
  }
  const data = buildIpc(values, releases, today);

  if (mode === "check") {
    const own = JSON.parse(readFileSync(FILE, "utf8")) as IpcSnapshot;
    for (const id of IPC_SERIES_IDS) {
      const a = latestMonth(own.series[id])?.month;
      const b = latestMonth(data.series[id])?.month;
      console.log(`${IPC_SERIES[id].code}: snapshot ${a}, INE ${b}${a === b ? "" : "  <- rebuild"}`);
    }
    console.log(`calendar: snapshot ${own.releases.at(-1)?.day}, INE ${releases.at(-1)?.day}`);
    return;
  }
  if (mode !== "build") throw new Error(`unknown mode ${mode}`);
  for (const id of IPC_SERIES_IDS) if (!latestMonth(data.series[id])) throw new Error(`${IPC_SERIES[id].code}: no published month`);
  const snapshot: IpcSnapshot = { fetchedAt: now.toISOString(), asOf: today, ...data };
  writeFileSync(FILE, `${JSON.stringify(snapshot, null, 1)}\n`);
  for (const id of IPC_SERIES_IDS) console.log(`${IPC_SERIES[id].code}: latest ${JSON.stringify(latestMonth(data.series[id]))}`);
  console.log(`calendar: ${releases.length} releases, last ${JSON.stringify(releases.at(-1))}`);
}

await main();
