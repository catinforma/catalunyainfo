/**
 * Shapes of the "warnings in force" page. Every field is what an official
 * source published, parsed but not reworded; see parse.ts for each source.
 */

/** AEMET Meteoalerta levels that are warnings ("verde" means none and is dropped). */
export type WarningLevel = "yellow" | "orange" | "red";

/** One AEMET Meteoalerta warning (a CAP message), as AEMET issued it. */
export interface WeatherWarning {
  /** CAP identifier. */
  id: string;
  /** Meteoalerta phenomenon code: "VI", "CO", "NE"… */
  phenomenon: string;
  /** AEMET's Spanish name of the phenomenon: "Vientos". */
  phenomenonEs: string;
  level: WarningLevel;
  /** Meteoalerta zone code, "690803" (69 Catalonia, 08 province, 03 zone); coastal zones end in "C" ("694303C"). */
  zoneCode: string;
  /** AEMET's name of the zone, verbatim: "Prelitoral de Barcelona". */
  zone: string;
  /** ISO instants with offset, as in the CAP file. */
  onset: string;
  expires: string;
  /** AEMET's text (Spanish, verbatim; the English block repeats it in Spanish). */
  description: string;
  /** AEMET's probability band: "40%-70%", "mayor 70%". */
  probability: string | null;
}

export interface WeatherRead {
  /** When AEMET built the Catalonia feed (RSS lastBuildDate), ISO. */
  issued: string;
  /** When AEMET's server answered us (HTTP Date), ISO. */
  answeredAt: string;
  warnings: WeatherWarning[];
  /** Warnings the feed lists whose CAP file did not parse: said on the page, never hidden. */
  unread: number;
}

/** One Servei Català de Trànsit incident, from its RSS (Catalan, verbatim). */
export interface RoadIncident {
  id: string;
  /** SCT category in brackets at the end of the title: "Obres", "Retenció"… */
  type: string;
  /** The cause, in sentence case: "Treballs de manteniment". */
  cause: string;
  /** "Calçada restringida", "Circulació intensa"… */
  description: string;
  road: string;
  /** As published (capitals): "CORNELLÀ DE LLOBREGAT". */
  municipality: string;
  /** "Ambdós sentits", "Nord cap a GIRONA-UN CARRIL TALLAT". */
  direction: string;
  /** "609-610". */
  km: string;
  /** Start of the incident (item pubDate), ISO. */
  since: string;
}

export interface RoadsRead {
  /** SCT's own time stamp of the feed (channel pubDate), ISO. */
  published: string;
  answeredAt: string;
  incidents: RoadIncident[];
}

/** One row of Protecció Civil's "plans in pre-alert, alert or emergency" dataset. */
export interface CivilPlan {
  acronym: string;
  name: string;
  /** "PREALERTA", "ALERTA", "EMERGÈNCIA" as published. */
  phase: string;
  /** "Si" / "No" as published, or null. */
  activated: string | null;
  /** As published (free text in the dataset). */
  since: string | null;
  /** CECAT communiqué (PDF on Documents Oberts). */
  communique: string | null;
  description: string | null;
}

export interface CivilRead {
  /** The dataset's last data change (HTTP Last-Modified), ISO, when given. */
  updated: string | null;
  answeredAt: string;
  plans: CivilPlan[];
}

/**
 * What a page can say about one source: a read from this regeneration, an
 * earlier good read held because the source did not answer (printed with its
 * own time), or nothing.
 */
export type SourceState<T> = { kind: "live"; read: T } | { kind: "kept"; read: T } | { kind: "none" };

export interface WarningsSnapshot {
  weather: WeatherRead | null;
  roads: RoadsRead | null;
  civil: CivilRead | null;
}

export interface WarningsView {
  /** The render instant, ms. */
  now: number;
  weather: SourceState<WeatherRead>;
  roads: SourceState<RoadsRead>;
  civil: SourceState<CivilRead>;
}
