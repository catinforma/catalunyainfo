/**
 * Server side of the live prices: one request to the Ministry's REST service
 * for the whole of Catalonia, reduced to the compact list the pages filter in
 * the browser. Used by `app/api/fuel/catalonia/route.ts` only.
 *
 * Cost: one upstream request (about 1.5 MB of JSON) and one pass over ~1,500
 * stations per cache miss. The route's response is cached by the CDN for an
 * hour, so this runs about once an hour per region that has traffic.
 */

import { fromMinistry } from "./names";
import { FUELS, MINISTRY_FIELD, ministryTimestampToIso, parseCoordinate, parsePrice, type LivePayload, type LiveStation } from "./live";
import municipalitiesJson from "./municipalities.json" with { type: "json" };
import type { MunicipalitySnapshot } from "./types";

/**
 * The service, as MITECO's open-data catalogue lists it (energia.serviciosmin
 * .gob.es, read 28 Oct 2026), then the older host the same service still
 * answers on. Both returned the same list on 28 Oct 2026.
 */
export const API_URLS = [
  "https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/09",
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/09",
] as const;

/** The public page of the same data, for readers when ours cannot load it. */
export const GEOPORTAL_URL = "https://geoportalgasolineras.es/geoportal-instalaciones/Inicio";

/** Fewer stations than this is a broken answer, not Catalonia (1,482 on 28 Oct 2026). */
export const MIN_STATIONS = 1000;

const UPSTREAM_TIMEOUT_MS = 8_000;

const SNAPSHOT = municipalitiesJson as MunicipalitySnapshot;
const BY_ID = new Map(SNAPSHOT.municipalities.map((m) => [m.id, m]));

type Row = Record<string, unknown>;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** One Ministry row to the compact form; null for a row without an id. */
export function compactStation(row: Row, byId: ReadonlyMap<string, MunicipalitySnapshot["municipalities"][number]> = BY_ID): LiveStation | null {
  const id = text(row.IDEESS);
  if (!id) return null;
  const known = byId.get(text(row.IDMunicipio));
  const station: LiveStation = {
    id,
    b: text(row["Rótulo"]),
    a: text(row["Dirección"]),
    t: known?.name ?? fromMinistry(text(row.Municipio)),
    ine: known?.ine ?? "",
    c: known?.comarca ?? "",
    p: text(row.IDProvincia),
  };
  const lat = parseCoordinate(row.Latitud);
  const lon = parseCoordinate(row["Longitud (WGS84)"]);
  if (lat !== undefined && lon !== undefined) {
    station.lat = lat;
    station.lon = lon;
  }
  for (const fuel of FUELS) {
    const price = parsePrice(row[MINISTRY_FIELD[fuel]]);
    if (price !== undefined) station[fuel] = price;
  }
  return station;
}

/** The Ministry's whole answer to the payload, or null when it is not a usable list. */
export function compactPayload(json: unknown, minStations = MIN_STATIONS): LivePayload | null {
  if (!json || typeof json !== "object") return null;
  const body = json as { Fecha?: unknown; ListaEESSPrecio?: unknown; ResultadoConsulta?: unknown };
  if (body.ResultadoConsulta !== "OK" || !Array.isArray(body.ListaEESSPrecio)) return null;
  const stations: LiveStation[] = [];
  for (const row of body.ListaEESSPrecio as Row[]) {
    // Public sale only ("P"); restricted sale ("R") is for members of a cooperative.
    if (row && typeof row === "object" && text(row["Tipo Venta"]) !== "R") {
      const station = compactStation(row);
      if (station) stations.push(station);
    }
  }
  if (stations.length < minStations) return null;
  const fecha = text(body.Fecha);
  return { fecha, updated: ministryTimestampToIso(fecha), stations };
}

export type LoadResult = { ok: true; payload: LivePayload; source: string } | { ok: false; error: string };

/** Tries each host in turn; never throws. */
export async function loadCatalonia(fetchImpl: typeof fetch = fetch): Promise<LoadResult> {
  const errors: string[] = [];
  for (const url of API_URLS) {
    try {
      const response = await fetchImpl(url, {
        headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
        cache: "no-store",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      if (!response.ok) {
        errors.push(`${new URL(url).host}: HTTP ${response.status}`);
        continue;
      }
      const payload = compactPayload(await response.json());
      if (payload) return { ok: true, payload, source: url };
      errors.push(`${new URL(url).host}: unusable answer`);
    } catch (error) {
      errors.push(`${new URL(url).host}: ${error instanceof Error ? error.name : "error"}`);
    }
  }
  return { ok: false, error: errors.join("; ") };
}

/** Cache headers: an hour at the CDN, two more of stale-while-revalidate. */
export const SUCCESS_CACHE = "public, s-maxage=3600, stale-while-revalidate=7200";
/** A failure is cached for a minute, so an outage does not turn every page view into two upstream calls. */
export const FAILURE_CACHE = "public, s-maxage=60";
