/**
 * Builds `src/lib/programmatic/rodalies/timetable.json`: first and last train
 * from the main stations, trains per hour by time band and journey times, per
 * Rodalies line and direction, for a weekday, a Saturday and a Sunday, from
 * Renfe's official GTFS (lib/programmatic/rodalies/timetable.ts has the rules
 * and the licence). The pages read the committed file only.
 *
 *   npm run rodalies-timetable:snapshot -- build
 *       Checks the licence on data.renfe.com (CKAN), downloads the feed into
 *       a new temporary directory of its own (an untrusted download: it is
 *       only read as bytes, never executed), and writes the snapshot.
 *       --zip <file>   use a feed already downloaded (same checks)
 *       --dir <dir>    where to create the temporary directory (default: the OS temp dir)
 *
 *   npm run rodalies-timetable:snapshot -- check
 *       Says how old the snapshot is, when the feed it was built from ends,
 *       and whether data.renfe.com has a newer file. Writes nothing.
 *
 * Refresh: every two weeks, and at once after Renfe's December timetable
 * change or a long works closure; tests/rodalies-timetable.test.ts fails 21
 * days after the build or past the feed's last day, whichever comes first.
 */

import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { LINES } from "../src/lib/programmatic/rodalies/data.ts";
import {
  DAY_TYPES,
  TIMETABLE_MAX_AGE_DAYS,
  TIMETABLE_SOURCE,
  buildLineTimetable,
  gaps,
  gtfsMinutes,
  type FeedTrip,
  type LineTimetable,
  type TimetableSnapshot,
} from "../src/lib/programmatic/rodalies/timetable.ts";
import { LINE_IDS, isLineId, type LineId } from "../src/lib/programmatic/rodalies/types.ts";
import { readZip } from "./lib/zip.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT_FILE = join(ROOT, "src/lib/programmatic/rodalies/timetable.json");
const UA = { "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)" };
/** stop_times.txt is ~270 MB inflated (21 Nov 2026). */
const MAX_MEMBER_BYTES = 800 * 1024 * 1024;

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

function arg(name: string): string | null {
  const at = process.argv.indexOf(name);
  return at > 0 ? (process.argv[at + 1] ?? null) : null;
}

/* -------------------------------------------------------------------------- */
/* The dataset record on data.renfe.com                                       */
/* -------------------------------------------------------------------------- */

interface CkanResource {
  url?: string;
  format?: string;
  last_modified?: string;
}

async function datasetRecord(): Promise<{ licence: string; updated: string }> {
  const response = await fetch(TIMETABLE_SOURCE.api, { headers: { ...UA, accept: "application/json" } });
  if (!response.ok) throw new Error(`${TIMETABLE_SOURCE.api}: HTTP ${response.status}`);
  const body = (await response.json()) as { success?: boolean; result?: { license_id?: string; resources?: CkanResource[] } };
  const licence = body.result?.license_id ?? "";
  if (licence !== TIMETABLE_SOURCE.licenceId) {
    throw new Error(`data.renfe.com now gives the licence "${licence}" (expected ${TIMETABLE_SOURCE.licenceId}): read the dataset's terms before publishing anything.`);
  }
  const resource = body.result?.resources?.find((r) => r.url === TIMETABLE_SOURCE.url);
  if (!resource?.last_modified) throw new Error(`data.renfe.com no longer lists ${TIMETABLE_SOURCE.url}: find the new file before building.`);
  return { licence, updated: resource.last_modified.slice(0, 19) };
}

/* -------------------------------------------------------------------------- */
/* GTFS text                                                                  */
/* -------------------------------------------------------------------------- */

/** One CSV line, RFC 4180 quotes; every field trimmed (Renfe pads them with spaces). */
function csvFields(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(field.trim());
      field = "";
    } else field += c;
  }
  out.push(field.trim());
  return out;
}

/** Rows as records keyed by the trimmed header. */
function table(text: string): Record<string, string>[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const header = csvFields(lines[0] ?? "");
  return lines.slice(1).map((line) => {
    const fields = csvFields(line);
    return Object.fromEntries(header.map((h, i) => [h, fields[i] ?? ""]));
  });
}

const isoDate = (yyyymmdd: string) => `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;

function addDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** service_id -> the days it runs: calendar.txt ranges and weekday flags, then calendar_dates.txt. */
function serviceDays(calendar: Record<string, string>[], exceptions: Record<string, string>[]): Map<string, Set<string>> {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const out = new Map<string, Set<string>>();
  for (const row of calendar) {
    const set = new Set<string>();
    const end = isoDate(row.end_date!);
    for (let d = isoDate(row.start_date!); d <= end; d = addDay(d)) {
      if (row[days[new Date(`${d}T12:00:00Z`).getUTCDay()]!] === "1") set.add(d);
    }
    out.set(row.service_id!, set);
  }
  for (const row of exceptions) {
    const set = out.get(row.service_id!) ?? new Set<string>();
    if (row.exception_type === "1") set.add(isoDate(row.date!));
    if (row.exception_type === "2") set.delete(isoDate(row.date!));
    out.set(row.service_id!, set);
  }
  return out;
}

interface Parsed {
  trips: FeedTrip[];
  feedDates: string[];
  routes: Record<LineId, { trains: number; buses: number }>;
  skippedTypes: string[];
}

function parseFeed(zip: Buffer): Parsed {
  const members = new Map(readZip(zip, MAX_MEMBER_BYTES).map((m) => [m.name, m]));
  const text = (name: string, required = true) => {
    const member = members.get(name);
    if (!member) {
      if (required) throw new Error(`the feed has no ${name}`);
      return "";
    }
    return member.read().toString("utf8");
  };

  // Rodalies de Catalunya: the "51" network, route_short_name = the official line.
  const routeOf = new Map<string, { line: LineId; bus: boolean }>();
  const routes = Object.fromEntries(LINE_IDS.map((id) => [id, { trains: 0, buses: 0 }])) as Parsed["routes"];
  const skippedTypes: string[] = [];
  for (const row of table(text("routes.txt"))) {
    if (!row.route_id!.startsWith("51") || !isLineId(row.route_short_name!)) continue;
    if (row.route_type !== "2" && row.route_type !== "3") {
      skippedTypes.push(`${row.route_id} (type ${row.route_type})`);
      continue;
    }
    routeOf.set(row.route_id!, { line: row.route_short_name, bus: row.route_type === "3" });
  }
  const services = serviceDays(table(text("calendar.txt")), table(text("calendar_dates.txt", false)));

  const tripOf = new Map<string, { line: LineId; bus: boolean; dates: string[]; stops: { seq: number; station: string; arrival: number; departure: number }[] }>();
  for (const row of table(text("trips.txt"))) {
    const route = routeOf.get(row.route_id!);
    if (!route) continue;
    const dates = [...(services.get(row.service_id!) ?? [])].sort();
    if (dates.length === 0) continue;
    tripOf.set(row.trip_id!, { ...route, dates, stops: [] });
  }

  // stop_times.txt: ~6 million rows for all of Spain; only the first field is decoded for the rest.
  const stopTimes = members.get("stop_times.txt");
  if (!stopTimes) throw new Error("the feed has no stop_times.txt");
  const buffer = stopTimes.read();
  let start = buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf ? 3 : 0;
  let end = buffer.indexOf(10, start);
  const header = csvFields(buffer.toString("utf8", start, end).replace(/\r$/, ""));
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`stop_times.txt has no ${name}`);
    return i;
  };
  const [cTrip, cArr, cDep, cStop, cSeq] = [col("trip_id"), col("arrival_time"), col("departure_time"), col("stop_id"), col("stop_sequence")];
  start = end + 1;
  while (start < buffer.length) {
    end = buffer.indexOf(10, start);
    if (end < 0) end = buffer.length;
    // Fast path while trip_id is the first column (Renfe's order, 21 Nov 2026): decode one field, skip the rest.
    let fields: string[] | null = null;
    let tripId: string;
    if (cTrip === 0) {
      const comma = buffer.indexOf(44, start);
      tripId = buffer.toString("utf8", start, comma > 0 && comma < end ? comma : end).trim();
    } else {
      fields = csvFields(buffer.toString("utf8", start, end).replace(/\r$/, ""));
      tripId = fields[cTrip] ?? "";
    }
    const trip = tripOf.get(tripId);
    if (trip) {
      fields ??= csvFields(buffer.toString("utf8", start, end).replace(/\r$/, ""));
      trip.stops.push({ seq: Number(fields[cSeq]), station: fields[cStop]!, arrival: gtfsMinutes(fields[cArr]!), departure: gtfsMinutes(fields[cDep]!) });
    }
    start = end + 1;
  }

  const trips: FeedTrip[] = [];
  const dates = new Set<string>();
  for (const trip of tripOf.values()) {
    if (trip.stops.length < 2) continue;
    trip.stops.sort((a, b) => a.seq - b.seq);
    trips.push({ line: trip.line, bus: trip.bus, dates: trip.dates, stops: trip.stops.map(({ station, arrival, departure }) => ({ station, arrival, departure })) });
    for (const d of trip.dates) dates.add(d);
    routes[trip.line][trip.bus ? "buses" : "trains"] += 1;
  }
  return { trips, feedDates: [...dates].sort(), routes, skippedTypes };
}

/* -------------------------------------------------------------------------- */
/* Commands                                                                   */
/* -------------------------------------------------------------------------- */

async function build(): Promise<void> {
  const record = await datasetRecord();
  let zipPath = arg("--zip");
  if (!zipPath) {
    const dir = mkdtempSync(join(arg("--dir") ?? tmpdir(), "rodalies-gtfs-"));
    const response = await fetch(TIMETABLE_SOURCE.url, { headers: UA });
    if (!response.ok) throw new Error(`${TIMETABLE_SOURCE.url}: HTTP ${response.status}`);
    zipPath = join(dir, "fomento_transit.zip");
    writeFileSync(zipPath, Buffer.from(await response.arrayBuffer()));
    console.log(`Downloaded ${zipPath} (Last-Modified ${response.headers.get("last-modified")})`);
  }
  const parsed = parseFeed(readFileSync(zipPath));
  if (parsed.feedDates.length === 0) throw new Error("no Rodalies trip in the feed: is it still the Cercanías file?");

  const builtOn = madridToday();
  const years = [...new Set(parsed.feedDates.map((d) => Number(d.slice(0, 4))))];
  const holidays = years.flatMap((y) => regionalDays(y).map((d) => d.date));
  const options = { after: builtOn, holidays, feedDates: parsed.feedDates };
  const lines = Object.fromEntries(LINES.map((line) => [line.id, buildLineTimetable(line, parsed.trips, options)])) as Record<LineId, LineTimetable>;

  const snapshot: TimetableSnapshot = {
    builtOn,
    source: { ...TIMETABLE_SOURCE, updated: record.updated },
    feed: { from: parsed.feedDates[0]!, to: parsed.feedDates[parsed.feedDates.length - 1]!, gaps: gaps(parsed.feedDates) },
    lines,
  };
  if (snapshot.feed.to <= builtOn) throw new Error(`the feed ends on ${snapshot.feed.to}: nothing ahead to summarise`);
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 1)}\n`);

  console.log(`Wrote ${SNAPSHOT_FILE} (built ${builtOn}; data.renfe.com updated ${record.updated}; licence ${record.licence})`);
  console.log(`Feed ${snapshot.feed.from} – ${snapshot.feed.to}${snapshot.feed.gaps.length ? `, missing ${snapshot.feed.gaps.map(([a, b]) => (a === b ? a : `${a}–${b}`)).join(", ")}` : ""}`);
  if (parsed.skippedTypes.length) console.log(`Routes left out (not rail or road): ${parsed.skippedTypes.join(" ")}`);
  for (const line of LINES) {
    const t = lines[line.id];
    const counts = parsed.routes[line.id];
    const days = DAY_TYPES.map((type) => {
      const d = t.days[type];
      return d ? `${type} ${d.date} ${d.trains}${d.differentOn.length ? ` (≠ ${d.differentOn.length} run)` : ""}` : `${type} –`;
    }).join(" · ");
    const dirs = t.directions.map((d) => `→${d.towards} @${d.frequencyAt?.name ?? "-"} ${d.stations.length} st`).join(" | ");
    console.log(`${line.id.padEnd(4)} trips ${counts.trains}+${counts.buses} bus · ${days}\n     ${dirs}`);
  }
}

async function check(): Promise<void> {
  const current = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")) as TimetableSnapshot;
  const today = madridToday();
  const age = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${current.builtOn}T00:00:00Z`)) / 86_400_000;
  console.log(`Snapshot built ${current.builtOn} (${age} days ago; the test allows ${TIMETABLE_MAX_AGE_DAYS}), feed ${current.feed.from} – ${current.feed.to}.`);
  if (today > current.feed.to) console.log("PAST THE FEED'S LAST DAY: rebuild now.");
  const record = await datasetRecord();
  console.log(
    record.updated > current.source.updated
      ? `data.renfe.com has a newer file (${record.updated}; snapshot from ${current.source.updated}).`
      : `data.renfe.com file unchanged since ${current.source.updated}.`,
  );
}

const command = process.argv[2] ?? "build";
const run = { build, check }[command];
if (!run) {
  console.error(`Unknown command "${command}". Use build or check.`);
  process.exit(1);
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
