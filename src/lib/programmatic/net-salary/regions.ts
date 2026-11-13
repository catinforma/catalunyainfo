import type { Locale } from "@/lib/i18n/config";

/**
 * Where the worker lives, as far as withholding cares:
 *  - "common": the 15 common-regime communities. One AEAT scale for all of
 *    them: the result does not change from one to another (the regional
 *    scale only comes in with the annual return);
 *  - "ceuta-melilla": Ceuta, Melilla and, from 10 September 2026, the island
 *    of La Palma (RDL 23/2026): the withholding is cut by 60 %;
 *  - "foral": Navarra and the Basque Country apply their own tables, not
 *    modelled here; the page says so and links to them.
 *
 * Client-safe: the calculator's select reads it.
 */

export type Regime = "common" | "ceuta-melilla" | "foral";

export interface Region {
  id: string;
  regime: Regime;
  names: Record<Locale, string>;
}

export const REGIONS: readonly Region[] = [
  { id: "andalucia", regime: "common", names: { es: "Andalucía", ca: "Andalusia", en: "Andalusia" } },
  { id: "aragon", regime: "common", names: { es: "Aragón", ca: "Aragó", en: "Aragon" } },
  { id: "asturias", regime: "common", names: { es: "Asturias", ca: "Astúries", en: "Asturias" } },
  { id: "baleares", regime: "common", names: { es: "Illes Balears", ca: "Illes Balears", en: "Balearic Islands" } },
  { id: "canarias", regime: "common", names: { es: "Canarias (salvo La Palma)", ca: "Canàries (excepte La Palma)", en: "Canary Islands (except La Palma)" } },
  { id: "la-palma", regime: "ceuta-melilla", names: { es: "Canarias: isla de La Palma", ca: "Canàries: illa de La Palma", en: "Canary Islands: La Palma" } },
  { id: "cantabria", regime: "common", names: { es: "Cantabria", ca: "Cantàbria", en: "Cantabria" } },
  { id: "castilla-la-mancha", regime: "common", names: { es: "Castilla-La Mancha", ca: "Castella-la Manxa", en: "Castile-La Mancha" } },
  { id: "castilla-y-leon", regime: "common", names: { es: "Castilla y León", ca: "Castella i Lleó", en: "Castile and León" } },
  { id: "cataluna", regime: "common", names: { es: "Cataluña", ca: "Catalunya", en: "Catalonia" } },
  { id: "valencia", regime: "common", names: { es: "Comunitat Valenciana", ca: "Comunitat Valenciana", en: "Valencian Community" } },
  { id: "extremadura", regime: "common", names: { es: "Extremadura", ca: "Extremadura", en: "Extremadura" } },
  { id: "galicia", regime: "common", names: { es: "Galicia", ca: "Galícia", en: "Galicia" } },
  { id: "madrid", regime: "common", names: { es: "Comunidad de Madrid", ca: "Comunitat de Madrid", en: "Madrid" } },
  { id: "murcia", regime: "common", names: { es: "Región de Murcia", ca: "Regió de Múrcia", en: "Murcia" } },
  { id: "la-rioja", regime: "common", names: { es: "La Rioja", ca: "La Rioja", en: "La Rioja" } },
  { id: "ceuta", regime: "ceuta-melilla", names: { es: "Ceuta", ca: "Ceuta", en: "Ceuta" } },
  { id: "melilla", regime: "ceuta-melilla", names: { es: "Melilla", ca: "Melilla", en: "Melilla" } },
  { id: "navarra", regime: "foral", names: { es: "Navarra", ca: "Navarra", en: "Navarre" } },
  { id: "pais-vasco", regime: "foral", names: { es: "País Vasco (Álava, Bizkaia, Gipuzkoa)", ca: "País Basc (Àlaba, Biscaia, Guipúscoa)", en: "Basque Country (Álava, Biscay, Gipuzkoa)" } },
];

export const DEFAULT_REGION = "cataluna";

export function regionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}
