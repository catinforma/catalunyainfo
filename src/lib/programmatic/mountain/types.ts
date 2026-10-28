/**
 * Shapes of the mountain-weather family: the committed snapshot (stations,
 * places and how they are matched) and the compact JSON the live route
 * handler returns. Types and tiny guards only, so the browser bundle can
 * import them without pulling in the snapshot.
 */

/** A ski resort (alpine), a cross-country ski area, or a summit / lake / pass. */
export type PlaceKind = "resort" | "nordic" | "area";

/** Height of the wind mast, as the XEMA variable says (VV2, VV6, VV10). */
export type WindHeight = 2 | 6 | 10;

export interface SnapshotStation {
  /** XEMA station code, e.g. "ZD". */
  code: string;
  /** Name without the altitude in brackets: "la Tosa d'Alp". */
  name: string;
  /** Metres, as Meteocat's station metadata gives it. */
  altitude: number;
  lat: number;
  lon: number;
  municipality: string;
  comarca: string;
  /**
   * What the station reported in the XEMA open data during the days before
   * the snapshot (any validation status). Decides which rows the live block
   * shows for it: a station without a snow sensor never shows a snow row.
   */
  measures: { temperature: boolean; wind: WindHeight | null; snow: boolean };
}

/** The place's reference point: an official toponym from the ICGC nomenclator. */
export interface SnapshotPoint {
  /** As the ICGC writes it: "Estació d'esquí de la Molina". */
  name: string;
  /** ICGC toponym type: "Equipament", "Cim", "Orografia", "Element Hidrogràfic"… */
  type: string;
  municipality: string;
  /** Six-digit municipal code (INE with check digit), as the ICGC gives it; Meteocat's forecast uses it. */
  municipalityCode: string;
  comarca: string;
  lat: number;
  lon: number;
}

export interface StationLink {
  code: string;
  /** Great-circle distance from the place's reference point, km, one decimal. */
  distanceKm: number;
}

export interface SnapshotPlace {
  slug: string;
  point: SnapshotPoint;
  /** Stations that pass the family threshold, nearest first. Empty = no page of its own. */
  stations: StationLink[];
  /** The three nearest operational stations, whatever their distance (shown on the hub). */
  nearest: StationLink[];
}

export interface SnapshotSource {
  name: string;
  publisher: string;
  url: string;
  /** Reuse terms as the publisher states them. */
  terms: string;
}

export interface MountainSnapshot {
  /** The day the sources were read (Europe/Madrid). The only date on the pages. */
  readOn: string;
  sources: { stations: SnapshotSource; readings: SnapshotSource; toponyms: SnapshotSource };
  /** Every station a place links to (matched or nearest), by code. */
  stations: SnapshotStation[];
  places: SnapshotPlace[];
}

/* -------------------------------------------------------------------------- */
/* The observations JSON (route handler -> browser)                          */
/* -------------------------------------------------------------------------- */

export interface TemperatureReading {
  /** °C, as published (one decimal). */
  value: number;
  /** ISO instant, UTC: the start of the half hour the reading describes. */
  at: string;
}

export interface WindReading {
  /** Mean speed, m/s, as published. */
  speed: number;
  /** Degrees from north, as published; null when the direction row is missing. */
  direction: number | null;
  /** Maximum gust in the same half hour, m/s; null when missing. */
  gust: number | null;
  height: WindHeight;
  at: string;
}

export interface SnowReading {
  cm: number;
  at: string;
  /** Depth now minus the validated depth about 24 h earlier (snow/depth.ts); null without a clean pair. */
  change24h: number | null;
}

export interface StationObservations {
  temperature: TemperatureReading | null;
  wind: WindReading | null;
  snow: SnowReading | null;
}

/**
 * Official forecast. Not configured: the hook in forecast.ts returns null
 * until an AEMET OpenData key is set (see that file). The browser ignores it
 * while it is null; nothing on the page says or implies a forecast.
 */
export interface ForecastText {
  provider: "aemet";
  /** AEMET mountain area code, e.g. "cat1" (Pirineo Catalán). */
  area: string;
  /** Text exactly as AEMET publishes it. */
  text: string;
  issuedAt: string | null;
  attribution: string;
}

export interface ObservationsOk {
  ok: true;
  /** When the handler read the source (ISO instant). */
  fetchedAt: string;
  /** The newest validated reading in the answer, any station, any variable. */
  latestAt: string | null;
  /** Validated readings by station code; a station with none is absent. */
  stations: Record<string, StationObservations>;
  forecast: ForecastText | null;
}

export interface ObservationsFailed {
  ok: false;
  error: "unavailable";
  fetchedAt: string;
}

export type ObservationsPayload = ObservationsOk | ObservationsFailed;
