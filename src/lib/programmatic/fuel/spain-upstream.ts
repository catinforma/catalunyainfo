/**
 * The Ministry's price list for the whole of Spain, in one request (21 Nov
 * 2026): the same REST service as the Catalan pages (`upstream.ts`), without
 * the community filter. Used only through `spain-server.ts`, which reads it at
 * most once per process every half hour for every Spain page and the sitemap.
 *
 * Measured on 21 Nov 2026 at 11:52: 11,541 stations, 12.3 MB of JSON sent
 * uncompressed, 8.6–10.9 s to download from the VPS. That is over the Next.js
 * data cache's 2 MB limit for one entry (in development it throws), so this
 * fetch carries no cache option: Next neither caches it nor treats the route as
 * dynamic for it, and `spain-server.ts` memoises the reduced list instead.
 *
 * Only petrol 95 E5 and diesel (gasóleo A) are kept: the province pages rank
 * those two, and the Catalan pages, which show 98 and LPG as well, have their
 * own list.
 */

import { fromMinistry } from "./names";
import { MINISTRY_FIELD, ministryTimestampToIso, parseCoordinate, parsePrice } from "./live";

export const SPAIN_API_URLS = [
  "https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/",
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/",
] as const;

/** Fewer stations than this is a broken answer, not Spain (11,541 on 21 Nov 2026). */
export const MIN_SPAIN_STATIONS = 9000;

export const SPAIN_FUELS = ["e95", "goa"] as const;
export type SpainFuel = (typeof SPAIN_FUELS)[number];

/** One public station, as the province pages need it. A product it does not sell is absent, never 0. */
export interface SpainStation {
  /** `IDEESS`. */
  id: string;
  /** Brand (`Rótulo`), trimmed. */
  b: string;
  /** Address (`Dirección`). */
  a: string;
  /** Municipality, article first ("las Rozas de Madrid" from "Rozas de Madrid (Las)"). */
  t: string;
  /** The Ministry's `IDMunicipio`. */
  m: string;
  /** Province, INE code (`IDProvincia`). */
  p: string;
  /** Opening hours exactly as the Ministry publishes them (`Horario`: "L-D: 24H"). */
  h: string;
  lat?: number;
  lon?: number;
  e95?: number;
  goa?: number;
}

export interface SpainPayload {
  /** `Fecha` of the Ministry's response, as published ("21/11/2026 11:52:04"). */
  fecha: string;
  /** The same instant as ISO 8601 with the Madrid offset, or null. */
  updated: string | null;
  stations: SpainStation[];
}

type Row = Record<string, unknown>;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export function compactSpainStation(row: Row): SpainStation | null {
  const id = text(row.IDEESS);
  const p = text(row.IDProvincia);
  if (!id || !/^\d{2}$/.test(p)) return null;
  const station: SpainStation = {
    id,
    b: text(row["Rótulo"]),
    a: text(row["Dirección"]),
    t: fromMinistry(text(row.Municipio)),
    m: text(row.IDMunicipio),
    p,
    h: text(row.Horario),
  };
  const lat = parseCoordinate(row.Latitud);
  const lon = parseCoordinate(row["Longitud (WGS84)"]);
  if (lat !== undefined && lon !== undefined) {
    station.lat = lat;
    station.lon = lon;
  }
  for (const fuel of SPAIN_FUELS) {
    const price = parsePrice(row[MINISTRY_FIELD[fuel]]);
    if (price !== undefined) station[fuel] = price;
  }
  return station;
}

/** The Ministry's whole answer to the payload, or null when it is not a usable list. */
export function compactSpainPayload(json: unknown, minStations = MIN_SPAIN_STATIONS): SpainPayload | null {
  if (!json || typeof json !== "object") return null;
  const body = json as { Fecha?: unknown; ListaEESSPrecio?: unknown; ResultadoConsulta?: unknown };
  if (body.ResultadoConsulta !== "OK" || !Array.isArray(body.ListaEESSPrecio)) return null;
  const stations: SpainStation[] = [];
  for (const row of body.ListaEESSPrecio as Row[]) {
    // Public sale only ("P"), as on the Catalan pages; restricted sale ("R") is for members of a cooperative.
    if (row && typeof row === "object" && text(row["Tipo Venta"]) !== "R") {
      const station = compactSpainStation(row);
      if (station) stations.push(station);
    }
  }
  if (stations.length < minStations) return null;
  const fecha = text(body.Fecha);
  return { fecha, updated: ministryTimestampToIso(fecha), stations };
}

export type SpainLoadResult = { ok: true; payload: SpainPayload; source: string } | { ok: false; error: string };

/** Tries each host in turn; never throws. `fetchImpl` must not add a data-cache option (see above). */
export async function loadSpain(fetchImpl: typeof fetch = fetch, timeoutMs = 25_000): Promise<SpainLoadResult> {
  const errors: string[] = [];
  for (const url of SPAIN_API_URLS) {
    try {
      const response = await fetchImpl(url, {
        headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        errors.push(`${new URL(url).host}: HTTP ${response.status}`);
        continue;
      }
      const payload = compactSpainPayload(await response.json());
      if (payload) return { ok: true, payload, source: url };
      errors.push(`${new URL(url).host}: unusable answer`);
    } catch (error) {
      errors.push(`${new URL(url).host}: ${error instanceof Error ? error.name : "error"}`);
    }
  }
  return { ok: false, error: errors.join("; ") };
}
