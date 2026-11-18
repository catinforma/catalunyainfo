import type { Locale } from "@/lib/i18n/config";

import type { WarningLevel } from "./types";

/**
 * Closed vocabularies of the three sources, in the site's three languages.
 * Small and dependency-free: the today page's browser island imports it.
 * Anything not listed here is printed as the source wrote it.
 */

/**
 * AEMET Meteoalerta phenomena (code → name). Spanish is AEMET's own wording
 * in the CAP files; Catalan and English are ours. AEMET's English CAP block
 * names the event ("Moderate wind warning"), not the phenomenon.
 */
export const PHENOMENA: Record<string, Record<Locale, string>> = {
  VI: { ca: "Vent", es: "Vientos", en: "Wind" },
  CO: { ca: "Fenòmens costaners", es: "Costeros", en: "Coastal events" },
  PR: { ca: "Pluja", es: "Lluvias", en: "Rain" },
  TO: { ca: "Tempestes", es: "Tormentas", en: "Thunderstorms" },
  NE: { ca: "Nevades", es: "Nevadas", en: "Snow" },
  NI: { ca: "Boira", es: "Nieblas", en: "Fog" },
  AL: { ca: "Allaus", es: "Aludes", en: "Avalanches" },
  AT: { ca: "Temperatures màximes", es: "Temperaturas máximas", en: "High temperatures" },
  BT: { ca: "Temperatures mínimes", es: "Temperaturas mínimas", en: "Low temperatures" },
  VS: { ca: "Pols en suspensió", es: "Polvo en suspensión", en: "Airborne dust" },
};

export function phenomenonName(code: string, spanish: string, locale: Locale): string {
  return PHENOMENA[code]?.[locale] ?? spanish;
}

export const LEVEL_ORDER: readonly WarningLevel[] = ["red", "orange", "yellow"];

export const LEVEL_NAMES: Record<Locale, Record<WarningLevel, string>> = {
  ca: { yellow: "groc", orange: "taronja", red: "vermell" },
  es: { yellow: "amarillo", orange: "naranja", red: "rojo" },
  en: { yellow: "yellow", orange: "orange", red: "red" },
};

/** Higher is worse. */
export function levelRank(level: WarningLevel): number {
  return level === "red" ? 3 : level === "orange" ? 2 : 1;
}

/** Province from the Meteoalerta zone code: 69 + INE province + zone ("690803" → 08). */
const PROVINCES: Record<string, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

export function provinceOf(zoneCode: string): string | null {
  return PROVINCES[zoneCode.slice(2, 4)] ?? null;
}

/** Protecció Civil phases, as the dataset writes them. */
const PHASES: Record<string, Record<Locale, string>> = {
  PREALERTA: { ca: "Prealerta", es: "Prealerta", en: "Pre-alert" },
  ALERTA: { ca: "Alerta", es: "Alerta", en: "Alert" },
  "EMERGÈNCIA": { ca: "Emergència", es: "Emergencia", en: "Emergency" },
  EMERGENCIA: { ca: "Emergència", es: "Emergencia", en: "Emergency" },
};

export function phaseName(phase: string, locale: Locale): string {
  return PHASES[phase.trim().toLocaleUpperCase("ca")]?.[locale] ?? phase;
}

/**
 * The Generalitat's special plans and the emergency each covers, from
 * Protecció Civil's open dataset "Nombre d'avisos i activacions dels plans
 * de Protecció Civil" (`wfei-fjk5`, columns `pla` and `tipus_d_emergència`,
 * read 18 Nov 2026). Catalan is the dataset's; Spanish and English are ours.
 * PROCICAT covers several risks (waves, cold, heat waves, rail…), so it is
 * listed with them.
 */
export const PLAN_TYPES: Record<string, Record<Locale, string>> = {
  INUNCAT: { ca: "inundacions", es: "inundaciones", en: "floods" },
  NEUCAT: { ca: "nevades", es: "nevadas", en: "snowfall" },
  VENTCAT: { ca: "vent", es: "viento", en: "wind" },
  ALLAUCAT: { ca: "allaus", es: "aludes", en: "avalanches" },
  INFOCAT: { ca: "incendis forestals", es: "incendios forestales", en: "forest fires" },
  SISMICAT: { ca: "sismes", es: "terremotos", en: "earthquakes" },
  CAMCAT: { ca: "contaminació marina", es: "contaminación marina", en: "marine pollution" },
  PLASEQCAT: { ca: "risc químic en instal·lacions", es: "riesgo químico en instalaciones", en: "chemical risk at industrial sites" },
  TRANSCAT: { ca: "transport de mercaderies perilloses", es: "transporte de mercancías peligrosas", en: "dangerous goods transport" },
  AEROCAT: { ca: "accidents aeronàutics", es: "accidentes aeronáuticos", en: "aviation accidents" },
  RADCAT: { ca: "risc radiològic", es: "riesgo radiológico", en: "radiological risk" },
  PENTA: { ca: "risc nuclear", es: "riesgo nuclear", en: "nuclear risk" },
  PROCICAT: {
    ca: "riscos diversos: onatge, fred, onada de calor, ferrocarril i altres",
    es: "riesgos diversos: oleaje, frío, ola de calor, ferrocarril y otros",
    en: "several risks: waves, cold, heat waves, rail and others",
  },
};
