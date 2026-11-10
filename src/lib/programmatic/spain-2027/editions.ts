import type { MetadataRoute } from "next";

import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { caA, caDe } from "@/lib/programmatic/holidays/names";
import { absoluteUrl } from "@/lib/site";

import { CITIES, cityBySlug, type City } from "./cities";
import { CITIES_AS_OF } from "./cities-data";
import { names } from "./communities";
import { SOURCES_READ_ON } from "./sources";

/**
 * The Catalan and English editions of the Spain-wide 2027 calendar (the
 * Spanish one is paths.ts). Same pages, same facts, same BOE links:
 *
 *   /ca/festius/2027/                        /en/holidays/2027/
 *   /ca/festius/2027/ponts/                  /en/holidays/2027/long-weekends/
 *   /ca/festius/2027/<comunitat>/            /en/holidays/2027/<community>/
 *   /ca/festius/2027/<comunitat>/<ciutat>/   /en/holidays/2027/<community>/<city>/
 *
 * Like the Spanish edition they sit inside the town family's folder
 * (`festius` = ca, `holidays` = en), whose `[municipi]` segment would take any
 * slug: the static `2027` folder wins over it, and no municipality is called
 * that. Community slugs are each language's own name; city slugs are the
 * Spanish edition's, so a city has one slug in all three. No community slug
 * is a sibling static folder (`ponts`, `long-weekends`, `dia`, `day`; a test
 * holds it).
 */

export type Edition = "ca" | "en";
export const EDITIONS: readonly Edition[] = ["ca", "en"];

export const EDITION_ROOT: Record<Edition, string> = { ca: "/ca/festius/2027/", en: "/en/holidays/2027/" };
export const EDITION_BRIDGES_SLUG: Record<Edition, string> = { ca: "ponts", en: "long-weekends" };

export interface EditionNames {
  region: Region;
  /** The Spanish edition's slug: the key back to paths.ts and sources.ts. */
  esSlug: string;
  slug: string;
  /** For titles and lists: "Aragó", "Basque Country". */
  short: string;
  /** With its article where the language uses one: "l'Aragó", "the Basque Country". */
  full: string;
  /** Sentence start: "L'Aragó", "The Basque Country". */
  Full: string;
  /** ca "de l'Aragó", "del País Basc"; en "of the Basque Country". */
  of: string;
  /** ca "a l'Aragó", "al País Basc"; en "in the Basque Country". */
  in: string;
  city: boolean;
  plural: boolean;
}

const CA: Record<Region, { slug: string; short: string; full: string; plural?: boolean }> = {
  AN: { slug: "andalusia", short: "Andalusia", full: "Andalusia" },
  AR: { slug: "arago", short: "Aragó", full: "l'Aragó" },
  AS: { slug: "asturies", short: "Astúries", full: "Astúries" },
  IB: { slug: "illes-balears", short: "Illes Balears", full: "les Illes Balears", plural: true },
  CN: { slug: "canaries", short: "Canàries", full: "Canàries" },
  CB: { slug: "cantabria", short: "Cantàbria", full: "Cantàbria" },
  CM: { slug: "castella-la-manxa", short: "Castella-la Manxa", full: "Castella-la Manxa" },
  CL: { slug: "castella-i-lleo", short: "Castella i Lleó", full: "Castella i Lleó" },
  CT: { slug: "catalunya", short: "Catalunya", full: "Catalunya" },
  EX: { slug: "extremadura", short: "Extremadura", full: "Extremadura" },
  GA: { slug: "galicia", short: "Galícia", full: "Galícia" },
  MD: { slug: "madrid", short: "Madrid", full: "la Comunitat de Madrid" },
  MC: { slug: "murcia", short: "Múrcia", full: "la Regió de Múrcia" },
  NC: { slug: "navarra", short: "Navarra", full: "Navarra" },
  PV: { slug: "pais-basc", short: "País Basc", full: "el País Basc" },
  RI: { slug: "la-rioja", short: "La Rioja", full: "la Rioja" },
  VC: { slug: "comunitat-valenciana", short: "Comunitat Valenciana", full: "la Comunitat Valenciana" },
  CE: { slug: "ceuta", short: "Ceuta", full: "Ceuta" },
  ML: { slug: "melilla", short: "Melilla", full: "Melilla" },
};

const EN: Record<Region, { slug: string; short: string; full: string; plural?: boolean }> = {
  AN: { slug: "andalusia", short: "Andalusia", full: "Andalusia" },
  AR: { slug: "aragon", short: "Aragon", full: "Aragon" },
  AS: { slug: "asturias", short: "Asturias", full: "Asturias" },
  IB: { slug: "balearic-islands", short: "Balearic Islands", full: "the Balearic Islands", plural: true },
  CN: { slug: "canary-islands", short: "Canary Islands", full: "the Canary Islands", plural: true },
  CB: { slug: "cantabria", short: "Cantabria", full: "Cantabria" },
  CM: { slug: "castile-la-mancha", short: "Castile-La Mancha", full: "Castile-La Mancha" },
  CL: { slug: "castile-and-leon", short: "Castile and León", full: "Castile and León" },
  CT: { slug: "catalonia", short: "Catalonia", full: "Catalonia" },
  EX: { slug: "extremadura", short: "Extremadura", full: "Extremadura" },
  GA: { slug: "galicia", short: "Galicia", full: "Galicia" },
  MD: { slug: "madrid", short: "Madrid", full: "the Community of Madrid" },
  MC: { slug: "murcia", short: "Murcia", full: "the Region of Murcia" },
  NC: { slug: "navarre", short: "Navarre", full: "Navarre" },
  PV: { slug: "basque-country", short: "Basque Country", full: "the Basque Country" },
  RI: { slug: "la-rioja", short: "La Rioja", full: "La Rioja" },
  VC: { slug: "valencian-community", short: "Valencian Community", full: "the Valencian Community" },
  CE: { slug: "ceuta", short: "Ceuta", full: "Ceuta" },
  ML: { slug: "melilla", short: "Melilla", full: "Melilla" },
};

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function editionNames(region: Region, locale: Edition): EditionNames {
  const n = (locale === "ca" ? CA : EN)[region];
  const es = names(region);
  return {
    region,
    esSlug: es.slug,
    slug: n.slug,
    short: n.short,
    full: n.full,
    Full: cap(n.full),
    of: locale === "ca" ? caDe(n.full) : `of ${n.full}`,
    in: locale === "ca" ? caA(n.full) : `in ${n.full}`,
    city: es.city,
    plural: n.plural ?? false,
  };
}

export function editionCommunities(locale: Edition): EditionNames[] {
  return REGIONS.map((r) => editionNames(r, locale));
}

/** Alphabetical in the page's language. */
export function editionCommunitiesAZ(locale: Edition): EditionNames[] {
  return editionCommunities(locale).sort((a, b) => a.short.localeCompare(b.short, locale));
}

export function editionCommunityBySlug(locale: Edition, slug: string): EditionNames | null {
  return editionCommunities(locale).find((c) => c.slug === slug) ?? null;
}

/**
 * City names where the language has its own: Catalan exonyms in common use
 * (as the Catalan press writes them), and the few English ones. Every other
 * city keeps the Spanish edition's name.
 */
const CITY_NAME: Record<Edition, Record<string, string>> = {
  ca: {
    "A Coruña": "la Corunya",
    Alicante: "Alacant",
    Alcoy: "Alcoi",
    "Castellón de la Plana": "Castelló de la Plana",
    Castellón: "Castelló",
    Cádiz: "Cadis",
    Córdoba: "Còrdova",
    Elche: "Elx",
    Huesca: "Osca",
    Ibiza: "Eivissa",
    León: "Lleó",
    Logroño: "Logronyo",
    Málaga: "Màlaga",
    Mérida: "Mèrida",
    Murcia: "Múrcia",
    Orihuela: "Oriola",
    Sagunto: "Sagunt",
    "San Sebastián": "Sant Sebastià",
    "San Vicente del Raspeig": "Sant Vicent del Raspeig",
    "San Vicente": "Sant Vicent",
    "Santiago de Compostela": "Santiago de Compostel·la",
    Segovia: "Segòvia",
    Soria: "Sòria",
    Teruel: "Terol",
    Torrevieja: "Torrevella",
    Valencia: "València",
    Zaragoza: "Saragossa",
    Ávila: "Àvila",
    Cáceres: "Càceres",
    Palencia: "Palència",
  },
  en: {
    Sevilla: "Seville",
  },
};

export function editionCityName(c: Pick<City, "name">, locale: Edition): string {
  return CITY_NAME[locale][c.name] ?? c.name;
}

export function editionCityShort(c: Pick<City, "name" | "short">, locale: Edition): string {
  return c.short ? (CITY_NAME[locale][c.short] ?? c.short) : editionCityName(c, locale);
}

/* ---------------------------------------------------------------- Paths --- */

export function editionHubPath(locale: Edition): string {
  return EDITION_ROOT[locale];
}

export function editionBridgesPath(locale: Edition): string {
  return `${EDITION_ROOT[locale]}${EDITION_BRIDGES_SLUG[locale]}/`;
}

export function editionCommunityPath(locale: Edition, region: Region): string {
  return `${EDITION_ROOT[locale]}${editionNames(region, locale).slug}/`;
}

export function editionCityPath(locale: Edition, c: Pick<City, "slug" | "region">): string {
  return `${editionCommunityPath(locale, c.region)}${c.slug}/`;
}

export function editionAllowed(route: Edition, locale: string): boolean {
  return route === locale;
}

export function resolveEditionCommunity(route: Edition, locale: string, slug: string): EditionNames | null {
  return editionAllowed(route, locale) ? editionCommunityBySlug(route, slug) : null;
}

export function resolveEditionCity(route: Edition, locale: string, community: string, city: string): City | null {
  const c = resolveEditionCommunity(route, locale, community);
  return c ? cityBySlug(c.region, city) : null;
}

/** Static params carry the route's own locale (see holidays/routing.ts on why). */
export function editionLocaleParams(route: Edition): { locale: Edition }[] {
  return [{ locale: route }];
}

export function editionCommunityParams<K extends string>(route: Edition, key: K): ({ locale: Edition } & Record<K, string>)[] {
  return editionCommunities(route).map((c) => ({ locale: route, [key]: c.slug }) as { locale: Edition } & Record<K, string>);
}

export function editionCityParams<K extends string, J extends string>(route: Edition, communityKey: K, cityKey: J): ({ locale: Edition } & Record<K | J, string>)[] {
  return CITIES.map((c) => ({ locale: route, [communityKey]: editionNames(c.region, route).slug, [cityKey]: c.slug }) as { locale: Edition } & Record<K | J, string>);
}

/** Every ca/en URL of the family, hub first, cities last, one locale after the other. */
export function editionPaths(locale?: Edition): string[] {
  const locales = locale ? [locale] : EDITIONS;
  return locales.flatMap((l) => [
    editionHubPath(l),
    editionBridgesPath(l),
    ...REGIONS.map((r) => editionCommunityPath(l, r)),
    ...CITIES.map((c) => editionCityPath(l, c)),
  ]);
}

/* ------------------------------------------------------------- Hreflang --- */

/** The page's three editions, for hreflang and the language switcher. Keys are the paths of each locale. */
export type Editions = { ca: string; es: string; en: string };

const ES_ROOT = "/es/festivos/2027/";

export function hubEditions(): Editions {
  return { ca: editionHubPath("ca"), es: ES_ROOT, en: editionHubPath("en") };
}

export function bridgesEditions(): Editions {
  return { ca: editionBridgesPath("ca"), es: `${ES_ROOT}puentes/`, en: editionBridgesPath("en") };
}

export function communityEditions(region: Region): Editions {
  return { ca: editionCommunityPath("ca", region), es: `${ES_ROOT}${names(region).slug}/`, en: editionCommunityPath("en", region) };
}

export function cityEditions(c: Pick<City, "slug" | "region">): Editions {
  const base = communityEditions(c.region);
  return { ca: `${base.ca}${c.slug}/`, es: `${base.es}${c.slug}/`, en: `${base.en}${c.slug}/` };
}

/** Every cluster of the family, in the order of `editionPaths`. */
export function allEditions(): Editions[] {
  return [hubEditions(), bridgesEditions(), ...REGIONS.map(communityEditions), ...CITIES.map(cityEditions)];
}

/** The cluster a path of any of the three locales belongs to. */
export function editionsOf(path: string): Editions | null {
  return allEditions().find((e) => e.ca === path || e.es === path || e.en === path) ?? null;
}

/** hreflang of a cluster: the three editions, x-default the English one (the site's rule, seo/metadata.ts). */
export function editionLanguages(e: Editions): Record<string, string> {
  return { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
}

/** Sitemap entries of the ca and en editions (the Spanish ones are paths.ts `spainSitemapEntries`). */
export function editionSitemapEntries(): MetadataRoute.Sitemap {
  const read = SOURCES_READ_ON > CITIES_AS_OF ? SOURCES_READ_ON : CITIES_AS_OF;
  const lastModified = new Date(`${read}T00:00:00Z`);
  const clusters = allEditions();
  return EDITIONS.flatMap((l) =>
    clusters.map((e, i) => ({
      url: absoluteUrl(e[l]),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: i === 0 ? 0.7 : i > 1 + REGIONS.length ? 0.5 : 0.6,
      alternates: { languages: editionLanguages(e) },
    })),
  );
}
