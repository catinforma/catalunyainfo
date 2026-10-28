/**
 * Shapes of the Rodalies family: the committed line snapshot and the compact
 * alerts JSON the route handler returns. Types only, so the browser bundle
 * can import them without pulling in the snapshot.
 */

/** The 19 lines Rodalies de Catalunya lists today (read 28 Oct 2026). There is no R12. */
export const LINE_IDS = [
  "R1",
  "R2",
  "R2N",
  "R2S",
  "R3",
  "R4",
  "R7",
  "R8",
  "R11",
  "R13",
  "R14",
  "R15",
  "R16",
  "R17",
  "RG1",
  "RT1",
  "RT2",
  "RL3",
  "RL4",
] as const;

export type LineId = (typeof LINE_IDS)[number];

export function isLineId(value: string): value is LineId {
  return (LINE_IDS as readonly string[]).includes(value);
}

/** A connection at a station that is not a Rodalies line: metro, tram, FGC, other trains. */
export interface SnapshotTransfer {
  /** As the official API types it: METRO, TRAM, RAILWAY (FGC), OTHER, VALL_DE_NURIA, RACK_RAILWAY. */
  type: string;
  id: string;
  /** The official description, e.g. "Cornellà Centre / Horta" for metro L5. */
  label: { ca: string; es: string; en: string };
}

export interface SnapshotStation {
  /** Station code, shared with Renfe's GTFS `stop_id` (e.g. 71801 Barcelona-Sants). */
  id: string;
  name: string;
  /** "accessible" as Rodalies de Catalunya flags the station. */
  accessible: boolean;
  /** Other Rodalies lines that stop here, in the official order. */
  lines: LineId[];
  transfers: SnapshotTransfer[];
}

export interface SnapshotLine {
  id: LineId;
  /** Display name: "R2 Nord", "R2 Sud", "R11"… */
  name: string;
  /** RODALIES (Barcelona commuter service) or REGIONAL, as the official API types it. */
  service: "RODALIES" | "REGIONAL";
  /** "Barcelona Estació de França - Sant Vicenç de Calders", as published. */
  journey: string;
  /** "per Vilanova i la Geltrú" in each language; empty when the line has none. */
  via: { ca: string; es: string; en: string };
  origin: string;
  destination: string;
  /** In line order, origin first. */
  stations: SnapshotStation[];
}

export interface SnapshotSource {
  name: string;
  publisher: string;
  url: string;
  /** Licence or reuse terms, as the publisher states them. */
  terms: string;
  /** When the publisher last changed the file, if it says (ISO date). */
  updated: string | null;
}

export interface RodaliesSnapshot {
  /** The day the sources were read (Europe/Madrid). The only date on the pages. */
  readOn: string;
  sources: { lines: SnapshotSource; renfeGtfs: SnapshotSource };
  lines: SnapshotLine[];
  /** Renfe GTFS `route_id` (trimmed) -> line, for alerts that name routes only. */
  renfeRoutes: Record<string, LineId>;
}

/* -------------------------------------------------------------------------- */
/* The alerts JSON (route handler -> browser)                                 */
/* -------------------------------------------------------------------------- */

export type AlertSource = "rodalies" | "renfe";

export interface CompactAlert {
  id: string;
  /** Official line ids the notice names; empty if it named none we know. */
  lines: LineId[];
  /** Station names, when the notice is about stations rather than lines (Renfe stop alerts). */
  stations: string[];
  /** Local Catalan date and time the notice was published, "2026-10-28" + "11:29". */
  date: string | null;
  time: string | null;
  /** The notice text, plain, as published; `en` only when the source has real English. */
  text: { ca: string; es: string; en: string | null };
}

export interface AlertsOk {
  ok: true;
  source: AlertSource;
  /** When the route handler read the source (ISO instant). */
  fetchedAt: string;
  /** The source's own timestamp, when it has one (Renfe feed header). */
  sourceUpdatedAt: string | null;
  alerts: CompactAlert[];
  /** Line codes or route ids the source used that we could not map to a line. */
  unmapped: string[];
}

export interface AlertsFailed {
  ok: false;
  /** unavailable: no source answered; stale: the only answer was older than the limit. */
  error: "unavailable" | "stale";
  fetchedAt: string;
  sourceUpdatedAt: string | null;
}

export type AlertsPayload = AlertsOk | AlertsFailed;
