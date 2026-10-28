/**
 * Builds `src/lib/programmatic/rodalies/snapshot.json`, the static data behind
 * /ca/rodalies/, /es/rodalies/ and /en/rodalies/ (the live notices are read by
 * the browser from /api/rodalies/alerts/, never from this file).
 *
 *   npm run rodalies:snapshot -- build
 *       Reads the 19 lines and their stations from Rodalies de Catalunya
 *       (the API behind rodalies.gencat.cat's timetable search) and the route
 *       ids from Renfe's Cercanías GTFS, checks them and writes the snapshot.
 *
 *   npm run rodalies:snapshot -- check
 *       Reads the live line list and says what differs from the snapshot
 *       (a new or missing line, a station added). Writes nothing.
 *
 *   npm run rodalies:snapshot -- compare
 *       Reads both live notice sources now and prints them side by side: what
 *       rodalies.gencat.cat shows, what Renfe's GTFS-RT feed carries, and the
 *       feed's age. Run it daily for a week before trusting the Renfe feed
 *       (research_notes/x10 §B5 item 3).
 *
 *   npm run rodalies:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { inflateRawSync } from "node:zlib";

import { linesFromApi, routesFromGtfs } from "../src/lib/programmatic/rodalies/prepare.ts";
import { LINE_IDS, type RodaliesSnapshot } from "../src/lib/programmatic/rodalies/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT_FILE = join(ROOT, "src/lib/programmatic/rodalies/snapshot.json");

const LINES_API = "https://serveisgrs.rodalies.gencat.cat/api/lines?limit=500";
const RENFE_GTFS = "https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip";
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)", accept: "application/json, */*" };

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { headers: UA });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

/** One file out of a zip archive (stored or deflated), without a dependency. */
function zipEntry(zip: Buffer, name: string): Buffer {
  let end = zip.length - 22;
  while (end >= 0 && zip.readUInt32LE(end) !== 0x06054b50) end -= 1;
  if (end < 0) throw new Error("zip: no end of central directory");
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(at) !== 0x02014b50) throw new Error("zip: bad central directory");
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extra = zip.readUInt16LE(at + 30);
    const comment = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const entryName = zip.subarray(at + 46, at + 46 + nameLength).toString("utf8");
    if (entryName === name) {
      const dataAt = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const data = zip.subarray(dataAt, dataAt + size);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      throw new Error(`zip: ${name} uses method ${method}`);
    }
    at += 46 + nameLength + extra + comment;
  }
  throw new Error(`zip: no ${name}`);
}

async function build(): Promise<void> {
  const lines = linesFromApi(await (await get(LINES_API)).json());
  const ids = lines.map((l) => l.id);
  const missing = LINE_IDS.filter((id) => !ids.includes(id));
  if (missing.length > 0) throw new Error(`lines API no longer lists ${missing.join(", ")}: check rodalies.gencat.cat before removing pages`);

  const gtfs = await get(RENFE_GTFS);
  const lastModified = gtfs.headers.get("last-modified");
  const zip = Buffer.from(await gtfs.arrayBuffer());
  const { routes, unknown } = routesFromGtfs(zipEntry(zip, "routes.txt").toString("utf8"));
  const routeLines = new Set(Object.values(routes));
  const withoutRoute = LINE_IDS.filter((id) => !routeLines.has(id));

  const snapshot: RodaliesSnapshot = {
    readOn: madridToday(),
    sources: {
      lines: {
        name: "Línies i estacions (cercador d'horaris i estat del servei de rodalies.gencat.cat)",
        publisher: "Rodalies de Catalunya",
        url: LINES_API,
        terms: "Avís legal de la Generalitat (web.gencat.cat/ca/ajuda/avis_legal/): reutilització permesa citant la font i la data d'actualització, sense alterar el contingut",
        updated: null,
      },
      renfeGtfs: {
        name: "Horarios cercanías (GTFS), routes.txt",
        publisher: "Renfe Operadora",
        url: RENFE_GTFS,
        terms: "CC BY 4.0 (data.renfe.com / datos.gob.es); \"Origen de los datos: Renfe Operadora\"",
        updated: lastModified ? new Date(lastModified).toISOString().slice(0, 10) : null,
      },
    },
    lines,
    renfeRoutes: Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b))),
  };
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 1)}\n`);

  console.log(`Wrote ${SNAPSHOT_FILE}`);
  console.log(`  ${lines.length} lines, ${lines.reduce((n, l) => n + l.stations.length, 0)} line-stations, read ${snapshot.readOn}`);
  console.log(`  ${Object.keys(routes).length} Renfe route ids mapped (GTFS last modified ${snapshot.sources.renfeGtfs.updated})`);
  if (unknown.length) console.log(`  NOT mapped (short name is not an official line): ${unknown.join(" ")}`);
  if (withoutRoute.length) console.log(`  Lines with no Renfe route id: ${withoutRoute.join(" ")}`);
}

async function check(): Promise<void> {
  const { default: current } = await import("../src/lib/programmatic/rodalies/snapshot.json", { with: { type: "json" } });
  const snapshot = current as RodaliesSnapshot;
  const live = linesFromApi(await (await get(LINES_API)).json());
  let changes = 0;
  for (const line of live) {
    const old = snapshot.lines.find((l) => l.id === line.id);
    if (!old) {
      console.log(`NEW line ${line.id} (${line.journey})`);
      changes += 1;
      continue;
    }
    const before = old.stations.map((s) => `${s.name}${s.accessible ? "*" : ""}`).join(", ");
    const after = line.stations.map((s) => `${s.name}${s.accessible ? "*" : ""}`).join(", ");
    if (before !== after || old.journey !== line.journey) {
      console.log(`CHANGED ${line.id}\n  was: ${old.journey}: ${before}\n  now: ${line.journey}: ${after}`);
      changes += 1;
    }
  }
  for (const old of snapshot.lines) {
    if (live.some((l) => l.id === old.id)) continue;
    console.log(`GONE ${old.id}`);
    changes += 1;
  }
  console.log(changes ? `${changes} change(s): run "build", review the diff, run the tests.` : `No change since ${snapshot.readOn}.`);
}

async function compare(): Promise<void> {
  const { fromRenfeFeed, fromRodaliesNotices, RENFE_ALERTS_URL, RODALIES_NOTICES_URL } = await import("../src/lib/programmatic/rodalies/alerts.ts");
  const now = new Date();
  const official = fromRodaliesNotices(await (await get(RODALIES_NOTICES_URL)).json());
  const renfeResponse = await get(RENFE_ALERTS_URL);
  const renfe = fromRenfeFeed(await renfeResponse.json());
  console.log(`Read ${now.toISOString()}`);
  console.log(`\nrodalies.gencat.cat (Estat del servei): ${official?.alerts.length ?? "unreadable"} notices`);
  for (const a of official?.alerts ?? []) console.log(`  ${a.date} ${a.time} [${a.lines.join(",")}] ${a.text.ca.slice(0, 110)}`);
  if (!renfe) {
    console.log("\nRenfe alerts.json: unreadable");
    return;
  }
  const ageMin = Math.round((now.getTime() - renfe.updatedAt.getTime()) / 60000);
  console.log(`\nRenfe alerts.json: header ${renfe.updatedAt.toISOString()} (${ageMin} min old), Last-Modified ${renfeResponse.headers.get("last-modified")}; ${renfe.alerts.length} Rodalies alerts`);
  for (const a of renfe.alerts) console.log(`  ${a.date} ${a.time} [${a.lines.join(",")}] ${a.text.ca.slice(0, 110)}`);
  if (renfe.unmapped.length) console.log(`  route ids not mapped to a line: ${renfe.unmapped.join(" ")}`);
  const key = (text: string) => text.toLowerCase().replace(/[^a-zà-ú0-9]+/g, " ").trim();
  const inRenfe = new Set(renfe.alerts.map((a) => key(a.text.ca)));
  const covered = (official?.alerts ?? []).filter((a) => inRenfe.has(key(a.text.ca))).length;
  console.log(`\nCoverage: ${covered} of ${official?.alerts.length ?? 0} official notices are in Renfe's feed with the same Catalan text.`);
}

async function urls(): Promise<void> {
  const { rodaliesFamilyPaths } = await import("../src/lib/programmatic/rodalies/pages.ts");
  for (const entry of rodaliesFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const command = process.argv[2] ?? "build";
const run = { build, check, compare, urls }[command];
if (!run) {
  console.error(`Unknown command "${command}". Use build, check, compare or urls.`);
  process.exit(1);
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
