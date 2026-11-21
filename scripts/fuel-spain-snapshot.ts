/**
 * Builds the station counts behind the Spain pages of the fuel family
 * (/es/gasolineras/provincia/<provincia>/, /ca/benzineres/provincia/…,
 * /en/fuel-prices-spain/…).
 *
 *   npm run fuel:spain-snapshot -- build [--from <file.json>]
 *       Reads the Ministry's list for the whole of Spain (MITECO, REST service
 *       `EstacionesTerrestres/`, ~12 MB) or a saved copy of it, and writes
 *         src/lib/programmatic/fuel/spain-provinces.json
 *       with, per province, the stations and municipalities with a station.
 *       Those counts are the only figures the pages print without a price
 *       list (titles, descriptions, the fallback when the Ministry does not
 *       answer), always with this file's date. Prices are NOT stored: the
 *       pages read them at render (spain-server.ts). Refuses to write when a
 *       province has no station (a broken answer).
 *
 *   npm run fuel:spain-snapshot -- urls
 *       Prints every URL of the Spain pages (for IndexNow or Search Console).
 *
 * Monthly, with `npm run fuel:snapshot -- build`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { PROVINCES } from "../src/lib/programmatic/gordo/provinces.ts";
import { SPAIN_API_URLS, compactSpainPayload, loadSpain, type SpainPayload } from "../src/lib/programmatic/fuel/spain-upstream.ts";
import { spainFamilyPaths } from "../src/lib/programmatic/fuel/spain-sitemap.ts";
import type { SpainSnapshot } from "../src/lib/programmatic/fuel/spain.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/programmatic/fuel/spain-provinces.json");

const MADRID_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });

function snapshotOf(payload: SpainPayload): SpainSnapshot {
  const provinces: SpainSnapshot["provinces"] = {};
  for (const { code } of PROVINCES) {
    const here = payload.stations.filter((s) => s.p === code);
    if (here.length === 0) throw new Error(`province ${code}: no station in the Ministry's list; not writing`);
    provinces[code] = { stations: here.length, towns: new Set(here.map((s) => s.m)).size };
  }
  const unknown = payload.stations.filter((s) => !(s.p in provinces));
  if (unknown.length > 0) throw new Error(`${unknown.length} stations in unknown provinces (${[...new Set(unknown.map((s) => s.p))].join(", ")}); not writing`);
  const readOn = payload.updated ? payload.updated.slice(0, 10) : MADRID_DAY.format(new Date());
  return { readOn, ministryTimestamp: payload.fecha, api: SPAIN_API_URLS[0], stations: payload.stations.length, provinces };
}

async function build(args: string[]): Promise<void> {
  const from = args.indexOf("--from");
  let payload: SpainPayload | null;
  if (from >= 0) {
    const file = args[from + 1];
    if (!file) throw new Error("--from needs a file");
    payload = compactSpainPayload(JSON.parse(readFileSync(file, "utf8")));
    if (!payload) throw new Error(`${file}: not a usable Ministry answer`);
  } else {
    const result = await loadSpain(fetch, 60_000);
    if (!result.ok) throw new Error(`Ministry: ${result.error}`);
    payload = result.payload;
  }
  const snapshot = snapshotOf(payload);
  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`wrote ${OUT}: ${snapshot.stations} stations, ${Object.keys(snapshot.provinces).length} provinces, Ministry list of ${snapshot.ministryTimestamp}`);
}

const [command, ...rest] = process.argv.slice(2);
if (command === "build") {
  await build(rest);
} else if (command === "urls") {
  for (const entry of spainFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
} else {
  console.error("usage: npm run fuel:spain-snapshot -- build [--from <file.json>] | urls");
  process.exit(1);
}
