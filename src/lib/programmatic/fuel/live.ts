/**
 * The live part of the fuel pages, shared by the route handler (which builds
 * the payload) and the browser component (which filters and ranks it). Pure:
 * no network, no clock unless one is passed in, no JSON imports, so it can be
 * bundled for the client.
 */

/** The four products the pages rank, in the order the selector shows them. */
export const FUELS = ["e95", "goa", "e98", "glp"] as const;
export type Fuel = (typeof FUELS)[number];

/** The Ministry's field for each product (`EstacionesTerrestres` JSON). */
export const MINISTRY_FIELD: Record<Fuel, string> = {
  e95: "Precio Gasolina 95 E5",
  goa: "Precio Gasoleo A",
  e98: "Precio Gasolina 98 E5",
  glp: "Precio Gases licuados del petróleo",
};

/**
 * One station as the route handler returns it. Short keys: the whole of
 * Catalonia (about 1,500 stations) goes to every page in one cached response.
 * A product the station does not sell is absent, never 0.
 */
export interface LiveStation {
  /** `IDEESS`. */
  id: string;
  /** Brand (`Rótulo`), trimmed. */
  b: string;
  /** Address (`Dirección`). */
  a: string;
  /** Municipality, official name. */
  t: string;
  /** INE code, or "" when the Ministry's municipality is not in the snapshot yet. */
  ine: string;
  /** Idescat comarca code, or "". */
  c: string;
  /** Province code (`IDProvincia`). */
  p: string;
  lat?: number;
  lon?: number;
  e95?: number;
  goa?: number;
  e98?: number;
  glp?: number;
}

export interface LivePayload {
  /** `Fecha` of the Ministry's response, exactly as published ("28/10/2026 11:36:05"). */
  fecha: string;
  /** The same instant as ISO 8601 with the Madrid offset, or null if `Fecha` was unreadable. */
  updated: string | null;
  stations: LiveStation[];
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Euros per litre with a decimal comma ("1,769") to a number, or undefined
 * for an empty field. Values outside 0.30–5.00 €/l are dropped: one national
 * site was seen showing "951,5 €/l", and a typo must not top a cheapest list.
 */
export function parsePrice(text: unknown): number | undefined {
  if (typeof text !== "string") return undefined;
  const value = Number(text.trim().replace(",", "."));
  if (!text.trim() || !Number.isFinite(value)) return undefined;
  return value >= 0.3 && value <= 5 ? value : undefined;
}

/** "41,507833" to 41.50783 (five decimals, about a metre), or undefined. */
export function parseCoordinate(text: unknown): number | undefined {
  if (typeof text !== "string" || !text.trim()) return undefined;
  const value = Number(text.trim().replace(",", "."));
  return Number.isFinite(value) ? Math.round(value * 1e5) / 1e5 : undefined;
}

function madridOffsetMinutes(instant: number): number {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", timeZoneName: "longOffset" })
      .formatToParts(new Date(instant))
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 60;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/**
 * The Ministry's `Fecha` ("28/10/2026 11:36:05", Madrid local time) as ISO
 * 8601 with its offset: "2026-10-28T11:36:05+01:00". Null when unreadable.
 */
export function ministryTimestampToIso(fecha: unknown): string | null {
  if (typeof fecha !== "string") return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(fecha.trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh, mi, ss] = m;
  const asUtc = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
  // Madrid is UTC+1 or UTC+2; take the offset that is true at the instant it gives.
  for (const offset of [120, 60]) {
    if (madridOffsetMinutes(asUtc - offset * 60_000) === offset) {
      const sign = offset >= 0 ? "+" : "-";
      const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
      const min = String(Math.abs(offset) % 60).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${h}:${min}`;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Filtering and ranking (browser)                                            */
/* -------------------------------------------------------------------------- */

/** Which stations a page shows. Empty filter: the whole of Catalonia. */
export interface StationFilter {
  province?: string;
  comarca?: string;
  ine?: string;
  /** Brands as the Ministry spells them (upper case, trimmed). */
  brands?: readonly string[];
}

export function matches(station: LiveStation, filter: StationFilter): boolean {
  if (filter.province && station.p !== filter.province) return false;
  if (filter.comarca && station.c !== filter.comarca) return false;
  if (filter.ine && station.ine !== filter.ine) return false;
  if (filter.brands && !filter.brands.includes(station.b)) return false;
  return true;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
  return Math.round(value * 1000) / 1000;
}

export interface FuelRanking {
  fuel: Fuel;
  /** Stations in the filter that publish a price for this product. */
  count: number;
  median: number | null;
  /** Cheapest first; ties by brand, then address, so the order is stable. */
  cheapest: LiveStation[];
}

export function rank(stations: readonly LiveStation[], filter: StationFilter, fuel: Fuel, limit = 10): FuelRanking {
  const priced = stations.filter((s) => matches(s, filter) && typeof s[fuel] === "number");
  const sorted = [...priced].sort((x, y) => x[fuel]! - y[fuel]! || x.b.localeCompare(y.b) || x.a.localeCompare(y.a));
  return { fuel, count: priced.length, median: median(priced.map((s) => s[fuel]!)), cheapest: sorted.slice(0, limit) };
}

/* -------------------------------------------------------------------------- */
/* Freshness (browser)                                                        */
/* -------------------------------------------------------------------------- */

/** Up to this age the list is shown as the current one. */
export const FRESH_HOURS = 4;
/** Between FRESH and this age it is shown under a warning; older, it is not shown at all. */
export const MAX_SHOWN_HOURS = 24;

export type Freshness = "fresh" | "old" | "stale";

/**
 * How old the Ministry's list is at `now`. The response is cached for up to an
 * hour plus two of stale-while-revalidate, so a healthy list is at most about
 * three hours old; anything older means the Ministry's service has stopped
 * answering, and the page must say so instead of passing old prices off as
 * today's.
 */
export function freshness(updated: string | null, now: number): Freshness {
  if (!updated) return "stale";
  const at = Date.parse(updated);
  if (!Number.isFinite(at)) return "stale";
  const hours = (now - at) / 3_600_000;
  if (hours <= FRESH_HOURS) return "fresh";
  if (hours <= MAX_SHOWN_HOURS) return "old";
  return "stale";
}
