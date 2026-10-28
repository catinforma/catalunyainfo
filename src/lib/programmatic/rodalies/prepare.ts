import { isLineId, type LineId, type SnapshotLine, type SnapshotStation, type SnapshotTransfer } from "./types";

/**
 * Turns the official sources into the committed snapshot. Pure: the script
 * (`scripts/rodalies-snapshot.ts`) does the downloading.
 *
 *  - Lines and stations: Rodalies de Catalunya's own API, the one behind the
 *    timetable search and "Estat del servei" on rodalies.gencat.cat
 *    (`https://serveisgrs.rodalies.gencat.cat/api/lines?limit=500`).
 *  - Route ids: Renfe's Cercanías GTFS (`routes.txt`), so that a Renfe alert
 *    that names routes only can be put on a line.
 */

interface ApiText {
  ca?: string;
  es?: string;
  en?: string;
}

interface ApiConnection {
  id?: string;
  description?: ApiText;
  type?: { id?: string };
  line?: { id?: string };
}

interface ApiStation {
  id?: string;
  name?: string;
  accessible?: boolean;
  connections?: ApiConnection[];
}

interface ApiLine {
  id?: string;
  name?: string;
  type?: { id?: string };
  wayStations?: ApiText | null;
  journeyDescription?: string;
  originStation?: { name?: string };
  destinationStation?: { name?: string };
  stations?: ApiStation[];
}

const clean = (value: string | undefined | null): string => (value ?? "").replace(/\s+/g, " ").trim();

/** Every line the API lists, in its order, or an error naming what is wrong. */
export function linesFromApi(json: unknown): SnapshotLine[] {
  const included = (json as { included?: ApiLine[] } | null)?.included;
  if (!Array.isArray(included) || included.length === 0) throw new Error("lines API: no `included` array");

  return included.map((line) => {
    const id = clean(line.id);
    if (!isLineId(id)) throw new Error(`lines API: unknown line id "${id}" - add it to LINE_IDS after checking rodalies.gencat.cat`);
    const service = line.type?.id === "RODALIES" ? "RODALIES" : line.type?.id === "REGIONAL" ? "REGIONAL" : null;
    if (!service) throw new Error(`lines API: ${id} has service type "${line.type?.id}"`);
    const stations = (line.stations ?? []).map((s) => stationFrom(s, id));
    if (stations.length < 2) throw new Error(`lines API: ${id} has ${stations.length} stations`);
    return {
      id,
      name: clean(line.name) || id,
      service,
      journey: clean(line.journeyDescription).replace(/\s*[–—]\s*/g, " - "),
      via: { ca: clean(line.wayStations?.ca), es: clean(line.wayStations?.es), en: clean(line.wayStations?.en) },
      origin: clean(line.originStation?.name),
      destination: clean(line.destinationStation?.name),
      stations,
    } satisfies SnapshotLine;
  });
}

function stationFrom(s: ApiStation, self: LineId): SnapshotStation {
  const lines: LineId[] = [];
  const transfers: SnapshotTransfer[] = [];
  for (const c of s.connections ?? []) {
    const type = clean(c.type?.id);
    if (type === "TRAIN") {
      const other = clean(c.line?.id ?? c.id);
      if (other !== self && isLineId(other) && !lines.includes(other)) lines.push(other);
      continue;
    }
    const id = clean(c.id);
    if (!id || transfers.some((t) => t.type === type && t.id === id)) continue;
    transfers.push({
      type,
      id,
      label: { ca: clean(c.description?.ca), es: clean(c.description?.es), en: clean(c.description?.en) },
    });
  }
  return { id: clean(s.id), name: clean(s.name), accessible: s.accessible === true, lines, transfers };
}

/**
 * Renfe GTFS `routes.txt` -> route id -> line, Rodalies de Catalunya only
 * (route ids starting `51T`). Renfe pads fields with spaces; they are trimmed.
 * Route short names that are not one of the official lines are returned
 * separately so the script can report them instead of guessing.
 */
export function routesFromGtfs(routesTxt: string): { routes: Record<string, LineId>; unknown: string[] } {
  const rows = routesTxt.split(/\r?\n/).filter((row) => row.trim().length > 0);
  const header = (rows.shift() ?? "").split(",").map((h) => h.trim());
  const idAt = header.indexOf("route_id");
  const nameAt = header.indexOf("route_short_name");
  if (idAt < 0 || nameAt < 0) throw new Error("routes.txt: no route_id / route_short_name columns");

  const routes: Record<string, LineId> = {};
  const unknown: string[] = [];
  for (const row of rows) {
    const cells = row.split(",").map((c) => c.trim());
    const routeId = cells[idAt] ?? "";
    if (!routeId.startsWith("51T")) continue;
    const short = cells[nameAt] ?? "";
    if (isLineId(short)) routes[routeId] = short;
    else unknown.push(`${routeId}:${short}`);
  }
  return { routes, unknown };
}
