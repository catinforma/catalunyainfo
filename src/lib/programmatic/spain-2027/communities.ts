import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";

/**
 * The nineteen columns of the BOE's 2027 table as pages: the URL slug and the
 * Spanish names the copy needs. Slugs are the words people search with
 * ("calendario laboral 2027 baleares", "festivos 2027 pais vasco"), never
 * the article.
 */

export interface CommunityNames {
  region: Region;
  /** URL segment under /es/festivos/2027/. */
  slug: string;
  /** For titles: "Madrid", "Baleares", "Comunidad Valenciana". */
  short: string;
  /** Official name with its article where Spanish uses one: "la Comunidad de Madrid", "el País Vasco". */
  full: string;
  /** Capitalised `full`, for the start of a sentence. */
  Full: string;
  /** "de la Comunidad de Madrid", "del País Vasco". */
  de: string;
  /** "en la Comunidad de Madrid", "en el País Vasco". */
  en: string;
  /** Ceuta and Melilla are autonomous cities, not communities. */
  city: boolean;
  /** "las Illes Balears tienen": the verb agrees. */
  plural: boolean;
}

const NAMES: Record<Region, { slug: string; short: string; full: string; city?: boolean; plural?: boolean }> = {
  AN: { slug: "andalucia", short: "Andalucía", full: "Andalucía" },
  AR: { slug: "aragon", short: "Aragón", full: "Aragón" },
  AS: { slug: "asturias", short: "Asturias", full: "el Principado de Asturias" },
  IB: { slug: "baleares", short: "Baleares", full: "las Illes Balears", plural: true },
  CN: { slug: "canarias", short: "Canarias", full: "Canarias" },
  CB: { slug: "cantabria", short: "Cantabria", full: "Cantabria" },
  CM: { slug: "castilla-la-mancha", short: "Castilla-La Mancha", full: "Castilla-La Mancha" },
  CL: { slug: "castilla-y-leon", short: "Castilla y León", full: "Castilla y León" },
  CT: { slug: "cataluna", short: "Cataluña", full: "Cataluña" },
  EX: { slug: "extremadura", short: "Extremadura", full: "Extremadura" },
  GA: { slug: "galicia", short: "Galicia", full: "Galicia" },
  MD: { slug: "madrid", short: "Madrid", full: "la Comunidad de Madrid" },
  MC: { slug: "murcia", short: "Murcia", full: "la Región de Murcia" },
  NC: { slug: "navarra", short: "Navarra", full: "la Comunidad Foral de Navarra" },
  PV: { slug: "pais-vasco", short: "País Vasco", full: "el País Vasco" },
  RI: { slug: "la-rioja", short: "La Rioja", full: "La Rioja" },
  VC: { slug: "comunidad-valenciana", short: "Comunidad Valenciana", full: "la Comunitat Valenciana" },
  CE: { slug: "ceuta", short: "Ceuta", full: "Ceuta", city: true },
  ML: { slug: "melilla", short: "Melilla", full: "Melilla", city: true },
};

function withPreposition(prep: "de" | "en", full: string): string {
  if (prep === "de" && full.startsWith("el ")) return `del ${full.slice(3)}`;
  return `${prep} ${full}`;
}

export function names(region: Region): CommunityNames {
  const n = NAMES[region];
  return {
    region,
    slug: n.slug,
    short: n.short,
    full: n.full,
    Full: n.full.charAt(0).toUpperCase() + n.full.slice(1),
    de: withPreposition("de", n.full),
    en: withPreposition("en", n.full),
    city: n.city ?? false,
    plural: n.plural ?? false,
  };
}

/** Every column, in the BOE's order. */
export const COMMUNITIES: readonly CommunityNames[] = REGIONS.map(names);

/** Alphabetical, for the lists readers scan (the hub, the links between pages). */
export const COMMUNITIES_AZ: readonly CommunityNames[] = [...COMMUNITIES].sort((a, b) => a.short.localeCompare(b.short, "es"));

export function communityBySlug(slug: string): CommunityNames | null {
  return COMMUNITIES.find((c) => c.slug === slug) ?? null;
}
