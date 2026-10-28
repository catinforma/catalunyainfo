/**
 * The weekend family's data, read from the committed snapshot. Server only:
 * nothing here touches the network or the database. The agenda's activities
 * are not here; the browser reads them live from `/api/weekend/agenda/`.
 */

import { slugify } from "@/lib/content/weekend/agenda";
import { LINES } from "@/lib/programmatic/rodalies/data";
import type { LineId } from "@/lib/programmatic/rodalies/types";

import snapshotJson from "./snapshot.json" with { type: "json" };
import type { RegisterMunicipality, SnapshotFair, WeekendSnapshot, ZoneVolume } from "./types";
import { MIN_EVENTS, ZONES, type ZoneDef, type ZoneFilter, zoneFilter, zoneById } from "./zones";

export const SNAPSHOT = snapshotJson as WeekendSnapshot;

const BY_INE = new Map(SNAPSHOT.municipalities.map((m) => [m.ine, m]));

export function municipality(ine: string): RegisterMunicipality | undefined {
  return BY_INE.get(ine);
}

/** The Idescat comarca name ("Alt Empordà"; Idescat writes Aran as "Aran"). */
export function comarcaName(code: string): string {
  return SNAPSHOT.comarques[code] ?? code;
}

/* -------------------------------------------------------------------------- */
/* Zones                                                                      */
/* -------------------------------------------------------------------------- */

export function inFilter(m: { ine: string; comarca: string; province: string }, filter: ZoneFilter): boolean {
  if (filter.provinces) return filter.provinces.includes(m.province);
  if (filter.comarques) return filter.comarques.includes(m.comarca);
  return (filter.ines ?? []).includes(m.ine);
}

export function municipalitiesIn(zone: ZoneDef): RegisterMunicipality[] {
  const filter = zoneFilter(zone);
  return SNAPSHOT.municipalities.filter((m) => inFilter(m, filter));
}

/** Comarca codes with at least one municipality in the zone, in Idescat name order. */
export function comarquesIn(zone: ZoneDef): string[] {
  const codes = new Set(municipalitiesIn(zone).map((m) => m.comarca));
  return [...codes].sort((a, b) => comarcaName(a).localeCompare(comarcaName(b), "ca"));
}

export function volume(zone: ZoneDef): ZoneVolume | undefined {
  return SNAPSHOT.volume[zone.id];
}

/** Zones whose measured volume clears the guardrail: the pages that exist. */
export function shippedZones(snapshot: WeekendSnapshot = SNAPSHOT): ZoneDef[] {
  return ZONES.filter((z) => (snapshot.volume[z.id]?.p25 ?? 0) >= MIN_EVENTS);
}

export function widerZone(zone: ZoneDef): ZoneDef | null {
  return zone.wider ? zoneById(zone.wider) : null;
}

/* -------------------------------------------------------------------------- */
/* Fairs (server, from the snapshot)                                          */
/* -------------------------------------------------------------------------- */

export function fairsIn(zone: ZoneDef | null): SnapshotFair[] {
  if (!zone) return SNAPSHOT.fairs;
  const filter = zoneFilter(zone);
  return SNAPSHOT.fairs.filter((f) => inFilter({ ine: f.ine, comarca: f.comarca, province: f.province }, filter));
}

/** Fairs open on at least one day of the window. */
export function fairsInWindow(fairs: readonly SnapshotFair[], window: { from: string; to: string }): SnapshotFair[] {
  return fairs.filter((f) => f.start <= window.to && f.end >= window.from);
}

/** The next fairs that start after the window, earliest first. */
export function fairsAfter(fairs: readonly SnapshotFair[], window: { to: string }, limit: number): SnapshotFair[] {
  return fairs.filter((f) => f.start > window.to).slice(0, limit);
}

/** The last day the fairs calendar covers (its own year). */
export function fairsCalendarYear(): number {
  const last = SNAPSHOT.fairs.at(-1)?.end ?? SNAPSHOT.readOn;
  return Number(last.slice(0, 4));
}

/* -------------------------------------------------------------------------- */
/* Rail lines with a station in the zone                                      */
/* -------------------------------------------------------------------------- */

function nameKey(name: string): string {
  return slugify(name);
}

const ARTICLES = new Set(["el", "la", "les", "els", "l'"]);
const MUNI_BY_KEY = new Map(SNAPSHOT.municipalities.map((m) => [nameKey(m.name), m]));

/**
 * The municipality a Rodalies station is in, when its name says so: the
 * longest run of leading words (split on spaces and hyphens) that is exactly
 * an official municipality name. "Sabadell Sud" -> Sabadell, "Lleida-Pirineus"
 * -> Lleida, "Cabrera de Mar-Vilassar de Mar" -> Cabrera de Mar. Stations
 * named after something else ("Aeroport", "La Molina") are left out rather
 * than guessed.
 */
export function stationMunicipality(station: string): RegisterMunicipality | undefined {
  const words = station.split(/(?:\s+-\s+|-|\s+)/).filter(Boolean);
  for (let n = words.length; n > 0; n--) {
    // A lone article is a word of a longer name, never the town: "Les
    // Franqueses-Granollers Nord" is not in Les (Aran).
    if (n === 1 && words.length > 1 && ARTICLES.has(words[0]!.toLowerCase())) break;
    const m = MUNI_BY_KEY.get(nameKey(words.slice(0, n).join(" ")));
    if (m) return m;
  }
  return undefined;
}

export interface ZoneLine {
  id: LineId;
  name: string;
  journey: string;
  /** Stations of this line inside the zone, in line order. */
  stations: string[];
}

export function linesIn(zone: ZoneDef): ZoneLine[] {
  const filter = zoneFilter(zone);
  const out: ZoneLine[] = [];
  for (const line of LINES) {
    const stations = line.stations.filter((s) => {
      const m = stationMunicipality(s.name);
      return m ? inFilter(m, filter) : false;
    });
    if (stations.length > 0) out.push({ id: line.id, name: line.name, journey: line.journey, stations: stations.map((s) => s.name) });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Weather links                                                              */
/* -------------------------------------------------------------------------- */

/** Meteocat's municipal forecast takes the six-digit Idescat code (checked on 28 Oct 2026 with Girona, 170792). */
export function meteocatUrl(m: RegisterMunicipality): string {
  return `https://www.meteo.cat/prediccio/municipal/${m.idescat}`;
}

export function weatherTowns(zone: ZoneDef): RegisterMunicipality[] {
  return zone.weather.map((ine) => municipality(ine)).filter((m): m is RegisterMunicipality => Boolean(m));
}
