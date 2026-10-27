/**
 * Election results per municipality: which pages exist, their paths, titles,
 * descriptions, siblings and sitemap entries. Pure apart from `electionsSitemap`,
 * which reads the deployment's indexing switch like the rest of the sitemap.
 *
 * Tranche 1 (27 Oct 2026): the 100 most populous municipalities in Catalan and
 * Spanish, the 10 most populous in English. Population: Idescat, 1 Jan 2025.
 * Every other municipality stays on the single lookup page
 * (`guies/resultats-eleccions-municipals-catalunya`), which covers all 947.
 */

import type { MetadataRoute } from "next";

import { HTML_LANG, INTL_LOCALE, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { capitalised } from "./names";
import { electionPath, hubPath } from "./paths";
import { turnout } from "./results";
import { SNAPSHOT } from "./snapshot";
import type { Municipality } from "./types";

export { ELECTIONS_SEGMENT, electionPath, hubPath } from "./paths";

/** How many municipalities get a page in each language. */
export const PAGES_PER_LOCALE: Record<Locale, number> = { ca: 100, es: 100, en: 10 };

/** Prerendered at build time; the rest render once on first request. */
export const PRERENDERED_PER_LOCALE = 20;

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

export function municipalitiesFor(locale: Locale): Municipality[] {
  return SNAPSHOT.municipalities.slice(0, PAGES_PER_LOCALE[locale]);
}

/**
 * The municipality behind a URL, or null for a 404. `routeLocale` is the
 * language the route folder serves; any other `[locale]` param is a 404, so
 * `/es/eleccions/sabadell/` and `/ca/elections/barcelona/` never render.
 */
export function resolveElectionPage(routeLocale: Locale, locale: string, slug: string): Municipality | null {
  if (locale !== routeLocale) return null;
  return municipalitiesFor(routeLocale).find((m) => m.slug === slug) ?? null;
}

/** Hubs exist in every language; any other locale on a route is a 404. */
export function resolveElectionsHub(routeLocale: Locale, locale: string): boolean {
  return locale === routeLocale;
}

/**
 * Both segments, always in the route's own locale. Next runs this once per
 * locale the layout generates and merges the result into it; an empty answer
 * for the other two locales left them without `municipi`, and Next 16.3 then
 * prerendered nothing for the route at all (read in
 * `next/dist/build/static-paths/app.js`, 27 Oct 2026). Returning the same
 * list every time, locale included, is deduplicated there.
 */
export function electionsStaticParams(routeLocale: Locale): { locale: string; municipi: string }[] {
  return municipalitiesFor(routeLocale)
    .slice(0, PRERENDERED_PER_LOCALE)
    .map((m) => ({ locale: routeLocale, municipi: m.slug }));
}

/** The language editions that exist for a municipality. */
export function electionTranslations(m: Municipality): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    if (municipalitiesFor(locale).some((x) => x.slug === m.slug)) out[locale] = electionPath(locale, m.slug);
  }
  return out;
}

export function hubTranslations(): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, hubPath(locale)])) as Record<Locale, string>;
}

/** The name as it is written in each language: Catalan keeps the lower-case article mid-sentence. */
export function placeName(m: Municipality, locale: Locale): string {
  return locale === "ca" ? m.name : capitalised(m.name);
}

/* -------------------------------------------------------------------------- */
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

const TITLES: Record<Locale, ((place: string) => string)[]> = {
  ca: [
    (p) => `Resultats eleccions ${p}: municipals 2023, generals i 29N`,
    (p) => `Resultats eleccions ${p}: municipals 2023 i 29N`,
    (p) => `Eleccions ${p}: municipals 2023, generals i 29N`,
    (p) => `Eleccions ${p}: municipals 2023 i 29N`,
    (p) => `Eleccions ${p}: resultats 2023`,
  ],
  es: [
    (p) => `Resultados elecciones ${p}: municipales 2023, generales y 29N`,
    (p) => `Resultados elecciones ${p}: municipales 2023 y 29N`,
    (p) => `Elecciones ${p}: municipales 2023, generales y 29N`,
    (p) => `Elecciones ${p}: municipales 2023 y 29N`,
    (p) => `Elecciones ${p}: resultados 2023`,
  ],
  en: [
    (p) => `${p} election results: 2023 local, general and 29 Nov`,
    (p) => `${p} election results: 2023 local and 29 Nov`,
    (p) => `${p} election results: 2023 and 29 Nov`,
    (p) => `${p} elections: 2023 local results and 29 Nov`,
    (p) => `${p} elections: 2023 results`,
  ],
};

/** The first title in the list that fits the limit. */
export function electionTitle(locale: Locale, m: Municipality): string {
  // Catalan keeps the article lower case mid-title ("Resultats eleccions la Garriga").
  const place = placeName(m, locale);
  const options = TITLES[locale].map((build) => build(place));
  return options.find((title) => title.length <= TITLE_LIMIT) ?? options[options.length - 1]!;
}

const pct = (value: number, locale: Locale) =>
  new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

export function electionDescription(locale: Locale, m: Municipality): string {
  const place = placeName(m, locale);
  const seats = m.municipal.seats;
  const t = pct(turnout(m.municipal), locale);
  const options: string[] =
    locale === "ca"
      ? [
          `Municipals 2023 ${inCa(place)}: ${seats} regidors i participació del ${t} %. Vots de cada llista, generals 2023 i Parlament 2024 davant de Catalunya, i el 29N.`,
          `Municipals 2023 ${inCa(place)}: ${seats} regidors, participació del ${t} %. Vots per llista, generals, Parlament i 29N.`,
          `Municipals 2023 ${inCa(place)}: ${seats} regidors i vots per llista. Generals, Parlament i 29N.`,
        ]
      : locale === "es"
        ? [
            `Municipales 2023 en ${place}: ${seats} concejales y participación del ${t} %. Votos de cada lista, generales 2023 y Parlament 2024 frente a Cataluña, y el 29N.`,
            `Municipales 2023 en ${place}: ${seats} concejales, participación del ${t} %. Votos por lista, generales, Parlament y 29N.`,
            `Municipales 2023 en ${place}: ${seats} concejales y votos por lista. Generales, Parlament y 29N.`,
          ]
        : [
            `${place} local election 2023: ${seats} councillors, ${t}% turnout, votes for every list; the 2023 general and 2024 Catalan elections against Catalonia, and 29 Nov.`,
            `${place} local election 2023: ${seats} councillors, ${t}% turnout and votes by list; general, Catalan and 29 Nov elections.`,
            `${place} local election 2023: ${seats} councillors and votes by list; general and 29 Nov elections.`,
          ];
  return options.find((text) => text.length <= DESCRIPTION_LIMIT) ?? options[options.length - 1]!;
}

const HUB_META: Record<Locale, { title: string; description: string; h1: string }> = {
  ca: {
    title: "Resultats eleccions per municipi: els 100 més poblats",
    description:
      "Municipals 2023, generals 2023 i Parlament 2024 als 100 municipis més poblats de Catalunya, per comarques, amb dades oficials i espai per al 29N.",
    h1: "Resultats de les eleccions per municipi",
  },
  es: {
    title: "Resultados elecciones por municipio: los 100 más poblados",
    description:
      "Municipales 2023, generales 2023 y Parlament 2024 en los 100 municipios más poblados de Cataluña, por comarcas, con datos oficiales y espacio para el 29N.",
    h1: "Resultados de las elecciones por municipio",
  },
  en: {
    title: "Catalonia election results by town: the 10 largest",
    description:
      "2023 local, 2023 general and 2024 Catalan election results in Catalonia's ten largest municipalities, from official data, with space for 29 November.",
    h1: "Election results by town in Catalonia",
  },
};

export const hubMeta = (locale: Locale) => HUB_META[locale];

/* -------------------------------------------------------------------------- */
/* Catalan prepositions                                                       */
/* -------------------------------------------------------------------------- */

/** "a Sabadell", "a l'Hospitalet", "al Prat de Llobregat", "als ...". */
export function inCa(name: string): string {
  if (name.startsWith("el ")) return `al ${name.slice(3)}`;
  if (name.startsWith("els ")) return `als ${name.slice(4)}`;
  return `a ${name}`;
}

/** "de Sabadell", "d'Igualada", "de l'Hospitalet", "del Prat", "de la Garriga". */
export function ofCa(name: string): string {
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(l'|la |les )/.test(name)) return `de ${name}`;
  if (/^[aeiouàèéíòóúAEIOUÀÈÉÍÒÓÚ]/.test(name) || /^h[aeiouàèéíòóú]/i.test(name)) return `d'${name}`;
  return `de ${name}`;
}

/* -------------------------------------------------------------------------- */
/* Hub groups and siblings                                                    */
/* -------------------------------------------------------------------------- */

export function byComarca(locale: Locale): { comarca: string; municipalities: Municipality[] }[] {
  const groups = new Map<string, Municipality[]>();
  for (const m of municipalitiesFor(locale)) groups.set(m.comarca, [...(groups.get(m.comarca) ?? []), m]);
  return [...groups.entries()]
    .map(([comarca, list]) => ({ comarca, municipalities: list }))
    .sort((a, b) => a.comarca.localeCompare(b.comarca, "ca"));
}

/**
 * Other pages to read next: the same comarca first, then the nearest in size
 * in the same province, up to `limit`.
 */
export function siblings(m: Municipality, locale: Locale, limit = 8): { sameComarca: Municipality[]; sameProvince: Municipality[] } {
  const pool = municipalitiesFor(locale).filter((x) => x.slug !== m.slug);
  const sameComarca = pool.filter((x) => x.comarca === m.comarca).slice(0, limit);
  const room = Math.max(0, Math.min(4, limit - sameComarca.length));
  const sameProvince = pool
    .filter((x) => x.province === m.province && x.comarca !== m.comarca)
    .sort((a, b) => Math.abs(a.population - m.population) - Math.abs(b.population - m.population))
    .slice(0, room);
  return { sameComarca, sameProvince };
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export interface ElectionsSitemapPath {
  path: string;
  /** The snapshot's read date: the only date these pages carry. */
  lastModified: string;
  translations: Partial<Record<Locale, string>>;
}

export function electionsSitemapPaths(): ElectionsSitemapPath[] {
  const lastModified = SNAPSHOT.readAt;
  const hubs = LOCALES.map((locale) => ({ path: hubPath(locale), lastModified, translations: hubTranslations() }));
  const pages = LOCALES.flatMap((locale) =>
    municipalitiesFor(locale).map((m) => ({ path: electionPath(locale, m.slug), lastModified, translations: electionTranslations(m) })),
  );
  return [...hubs, ...pages];
}

/** Sitemap entries, with hreflang alternates; nothing on a non-indexable deployment. */
export function electionsSitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return electionsSitemapPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      const href = entry.translations[locale];
      if (href) languages[HTML_LANG[locale]] = absoluteUrl(href);
    }
    const fallback = entry.translations[X_DEFAULT_LOCALE] ?? entry.translations.ca;
    if (fallback) languages["x-default"] = absoluteUrl(fallback);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
