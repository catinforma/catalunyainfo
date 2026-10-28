/**
 * Mountain and ski-resort weather: which pages exist, their titles,
 * descriptions, metadata and sitemap entries. No clock, no database.
 *
 * Tranche 1 (28 Oct 2026): a hub in ca, es and en, and one page per place
 * whose Meteocat station passes the family threshold (prepare.ts), in ca and
 * es. Places below it are listed on the hub only.
 */

import type { Metadata, MetadataRoute } from "next";

import { formatInt } from "@/lib/content/snow/depth";
import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { PAGE_PLACES, SNAPSHOT, mainStation, placeBySlug, type Place } from "./data";
import { PLACE_LOCALES, hubPath, hubTranslations, placePath, placeTranslations, type PlaceLocale } from "./paths";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

/** Each hub folder serves its own locale only (`temps-muntanya` = ca, `tiempo-montana` = es, `mountain-weather` = en). */
export function resolveHub(route: Locale, locale: string): Locale | null {
  return route === locale ? route : null;
}

/**
 * The place behind `/<locale>/<segment>/<slug>/`, or null for a 404: the
 * wrong locale for the folder, English, an unknown slug, or a place below
 * the threshold (it has no page).
 */
export function resolvePlace(route: PlaceLocale, locale: string, slug: string): Place | null {
  if (route !== locale) return null;
  return placeBySlug(slug);
}

/**
 * Every page in the folder's own locale is prerendered (fewer than the 20
 * the family rule allows). The route's locale is always set: Next merges the
 * result over each `[locale]` of the layout (see fuel/routing.ts).
 */
export function placeStaticParams<K extends string>(route: PlaceLocale, key: K): ({ locale: PlaceLocale } & Record<K, string>)[] {
  return PAGE_PLACES.map((p) => ({ locale: route, [key]: p.slug }) as { locale: PlaceLocale } & Record<K, string>);
}

/* -------------------------------------------------------------------------- */
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

/** "neu, temperatura i vent" only where the page has a snow source (a station's sensor or the resort's report). */
function hasSnow(place: Place): boolean {
  return place.kind !== "area" || place.stations.some((s) => s.station.measures.snow);
}

export function placeTitle(place: Place, locale: PlaceLocale): string {
  const where = place.inPlace[locale];
  const options =
    locale === "ca"
      ? hasSnow(place)
        ? [`Temps ${where} avui: neu, temperatura i vent`, `Temps ${where} avui: neu i vent`, `Temps ${where} avui`]
        : [`Temps ${where} avui: temperatura i vent`, `Temps ${where} avui`]
      : hasSnow(place)
        ? [`Tiempo ${where} hoy: nieve, temperatura y viento`, `Tiempo ${where} hoy: nieve y viento`, `Tiempo ${where} hoy`]
        : [`Tiempo ${where} hoy: temperatura y viento`, `Tiempo ${where} hoy`];
  return options.find((t) => t.length <= TITLE_LIMIT) ?? options[options.length - 1]!;
}

/** Catalan "a" + a name with its article: "al Port del Comte", "als Ports", "a la Tosa d'Alp". */
export function caAt(name: string): string {
  if (name.startsWith("el ")) return `al ${name.slice(3)}`;
  if (name.startsWith("els ")) return `als ${name.slice(4)}`;
  return `a ${name}`;
}

const km = (n: number, locale: Locale) => (locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ","));

/** "2.478 m" / "2,478 m". */
export const metres = (n: number, locale: Locale) => `${formatInt(n, locale)} m`;

export function placeDescription(place: Place, locale: PlaceLocale): string {
  const main = mainStation(place)!;
  const s = `${main.station.name} (${metres(main.station.altitude, locale)}, ${km(main.distanceKm, locale)} km)`;
  const range = place.altitude ? ` (${formatInt(place.altitude.min, locale)}–${metres(place.altitude.max, locale)})` : "";
  const name = place.name[locale];
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const resort = place.kind !== "area";
  const at = caAt(main.station.name);
  const where = s.slice(main.station.name.length);
  const tail =
    locale === "ca"
      ? resort
        ? ["estat de pistes, càmeres i perill d'allaus", "estat de pistes i allaus"]
        : place.pyrenees
          ? ["previsió oficial i perill d'allaus", "previsió oficial i allaus"]
          : ["previsió oficial i estat de les carreteres", "previsió oficial"]
      : resort
        ? ["estado de pistas, webcams y peligro de aludes", "estado de pistas y aludes"]
        : place.pyrenees
          ? ["previsión oficial y peligro de aludes", "previsión oficial y aludes"]
          : ["previsión oficial y estado de las carreteras", "previsión oficial"];
  const options =
    locale === "ca"
      ? [
          `${Name}${range}: últimes lectures validades del Meteocat ${at}${where}, ${tail[0]}.`,
          `${Name}: últimes lectures validades del Meteocat ${at}${where}, ${tail[1]}.`,
          `${Name}: lectures validades del Meteocat ${at} i enllaços oficials.`,
        ]
      : [
          `${Name}${range}: últimas lecturas validadas de Meteocat en ${s}, ${tail[0]}.`,
          `${Name}: últimas lecturas validadas de Meteocat en ${s}, ${tail[1]}.`,
          `${Name}: lecturas validadas de Meteocat en ${main.station.name} y enlaces oficiales.`,
        ];
  return options.find((d) => d.length <= DESCRIPTION_LIMIT) ?? options[options.length - 1]!;
}

const HUB_META: Record<Locale, { title: string; description: string; h1: string }> = {
  ca: {
    title: "Temps a les estacions d'esquí i a la muntanya avui",
    description:
      "Neu, temperatura i vent a les estacions d'esquí i cims de Catalunya: l'estació del Meteocat més propera, les lectures validades i els enllaços oficials.",
    h1: "Temps a les estacions d'esquí i a la muntanya avui",
  },
  es: {
    title: "Tiempo en las estaciones de esquí y la montaña hoy",
    description:
      "Nieve, temperatura y viento en estaciones de esquí y cimas de Cataluña: la estación de Meteocat más cercana, las lecturas validadas y enlaces oficiales.",
    h1: "Tiempo en las estaciones de esquí y la montaña hoy",
  },
  en: {
    title: "Catalan ski resort and mountain weather today",
    description:
      "Snow, temperature and wind at Catalonia's ski resorts and peaks: the nearest Meteocat station to each, its validated readings and the official links.",
    h1: "Ski resort and mountain weather in Catalonia today",
  },
};

export const hubMeta = (locale: Locale) => HUB_META[locale];

/** The hub in breadcrumbs: short, the same on the hub and on every place page. */
export const HUB_CRUMB: Record<Locale, string> = { ca: "Temps a la muntanya", es: "Tiempo en la montaña", en: "Mountain weather" };

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function placeMetadata(place: Place, locale: PlaceLocale): Metadata {
  return buildMetadata({
    locale,
    path: placePath(locale, place.slug),
    title: placeTitle(place, locale),
    description: placeDescription(place, locale),
    translations: placeTranslations(place.slug),
    type: "website",
  });
}

export function hubMetadata(locale: Locale): Metadata {
  const meta = hubMeta(locale);
  return buildMetadata({ locale, path: hubPath(locale), title: meta.title, description: meta.description, translations: hubTranslations(), type: "website" });
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export interface MountainFamilyPath {
  path: string;
  /** The snapshot's read date: the only date these pages carry. */
  lastModified: string;
  translations: Partial<Record<Locale, string>>;
}

export function mountainFamilyPaths(): MountainFamilyPath[] {
  const lastModified = SNAPSHOT.readOn;
  const hubs = LOCALES.map((locale) => ({ path: hubPath(locale), lastModified, translations: hubTranslations() }));
  const places = PLACE_LOCALES.flatMap((locale) =>
    PAGE_PLACES.map((p) => ({ path: placePath(locale, p.slug), lastModified, translations: placeTranslations(p.slug) as Partial<Record<Locale, string>> })),
  );
  return [...hubs, ...places];
}

/** Sitemap entries with hreflang alternates; nothing on a deployment that may not be indexed. */
export function mountainSitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return mountainFamilyPaths().map((entry) => {
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
      // The HTML changes only with the snapshot; the readings are fetched by the browser.
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
