import snapshotJson from "./snapshot.json" with { type: "json" };

import type { DgtSnapshot, DgtZone } from "./datex";
import type { ZbeCity } from "./types";

/**
 * The committed copy of the DGT's zone files (scripts/zbe-snapshot.ts writes
 * it; datex.ts says what it holds). Read at build: no page fetches the DGT.
 */
export const ZBE_SNAPSHOT = snapshotJson as unknown as DgtSnapshot;

/** The DGT record of a published city: by file, and by id where a file holds several zones. */
export function dgtZoneFor(city: Pick<ZbeCity, "dgtFile" | "dgtZoneId">): DgtZone | null {
  const inFile = ZBE_SNAPSHOT.zones.filter((z) => z.file === city.dgtFile);
  if (city.dgtZoneId) return inFile.find((z) => z.id === city.dgtZoneId) ?? null;
  return inFile.length === 1 ? (inFile[0] ?? null) : null;
}

const CATALAN_PROVINCES = new Set(["08", "17", "25", "43"]);

/** Whether the zone's INE code (4 or 5 digits in the files) is of a Catalan province. */
export function dgtZoneInCatalonia(zone: Pick<DgtZone, "ine">): boolean {
  return zone.ine !== null && CATALAN_PROVINCES.has(zone.ine.padStart(5, "0").slice(0, 2));
}


/**
 * The municipality behind each file of the directory, in its official name
 * (the files' own zone names are uneven: "Ayuntamiento de Oviedo - Anillo
 * Interior", "Castellon ZBE"). Barcelona has two files; one name covers both.
 * A file missing here is listed under its file name (tests/zbe.test.ts
 * fails first, so a new file gets a name when the snapshot is rebuilt).
 */
export const DGT_PLACE: Record<string, string> = {
  "ACoruña.xml": "A Coruña",
  "AlcalaDeHenares.xml": "Alcalá de Henares",
  "Alicante.xml": "Alicante",
  "Avila.xml": "Ávila",
  "Barcelona.xml": "Barcelona",
  "Benidorm.xml": "Benidorm",
  "Bilbao.xml": "Bilbao",
  "Cartagena.xml": "Cartagena",
  "Castellon.xml": "Castelló de la Plana",
  "CerdanyolaDelValles.xml": "Cerdanyola del Vallès",
  "Donostia-SanSebastian.xml": "Donostia / San Sebastián",
  "DosHermanas.xml": "Dos Hermanas",
  "ElPratDeLlobregat.xml": "El Prat de Llobregat",
  "Fuenlabrada.xml": "Fuenlabrada",
  "Gava.xml": "Gavà",
  "Girona.xml": "Girona",
  "Granada.xml": "Granada",
  "Granollers.xml": "Granollers",
  "LasRozas.xml": "Las Rozas de Madrid",
  "Lleida.xml": "Lleida",
  "Madrid.xml": "Madrid",
  "Malaga.xml": "Málaga",
  "Manlleu.xml": "Manlleu",
  "Mataro.xml": "Mataró",
  "MolinaDeSegura.xml": "Molina de Segura",
  "Motril.xml": "Motril",
  "Oviedo.xml": "Oviedo",
  "Palma.xml": "Palma",
  "PamplonaEnsanche.xml": "Pamplona",
  "Pontevedra.xml": "Pontevedra",
  "Reus.xml": "Reus",
  "RondasDeBarcelona.xml": "Barcelona",
  "Rubi.xml": "Rubí",
  "Sabadell.xml": "Sabadell",
  "Salamanca.xml": "Salamanca",
  "SantBoiDeLlobregat.xml": "Sant Boi de Llobregat",
  "SantCugatDelValles.xml": "Sant Cugat del Vallès",
  "SantJoanDespi.xml": "Sant Joan Despí",
  "SevillaCartuja.xml": "Sevilla",
  "Tarragona.xml": "Tarragona",
  "Terrasa.xml": "Terrassa",
  "Torremolinos.xml": "Torremolinos",
  "Valencia.xml": "València",
  "Valladolid.xml": "Valladolid",
  "Viladecans.xml": "Viladecans",
  "VitoriaGasteiz.xml": "Vitoria-Gasteiz",
};

export const dgtPlace = (file: string): string => DGT_PLACE[file] ?? file.replace(/\.xml$/, "");

export interface DgtPlace {
  place: string;
  catalonia: boolean;
}

/**
 * The municipalities of the directory with no published city, by name: the
 * hub lists them without a rule (the files' labels and dates are not reliable
 * enough to print one).
 */
export function dgtPlacesNotPublished(cities: readonly Pick<ZbeCity, "dgtFile">[]): DgtPlace[] {
  const published = new Set(cities.map((c) => dgtPlace(c.dgtFile)));
  const places = new Map<string, DgtPlace>();
  for (const zone of ZBE_SNAPSHOT.zones) {
    const place = dgtPlace(zone.file);
    if (published.has(place) || places.has(place)) continue;
    places.set(place, { place, catalonia: dgtZoneInCatalonia(zone) });
  }
  return [...places.values()].sort((a, b) => a.place.localeCompare(b.place, "es"));
}

/** Files in the snapshot (several zones can share one). */
export function dgtFileCount(): number {
  return new Set(ZBE_SNAPSHOT.zones.map((z) => z.file)).size;
}
