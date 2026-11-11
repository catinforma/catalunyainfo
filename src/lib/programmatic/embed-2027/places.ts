import type { MetadataRoute } from "next";

import { municipalities, municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { displayName } from "@/lib/programmatic/holidays/copy";
import { enName } from "@/lib/programmatic/holidays/english-copy";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { ROUTE, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";
import { CITIES, cityBySlug, type City } from "@/lib/programmatic/spain-2027/cities";
import { COMMUNITIES, communityBySlug } from "@/lib/programmatic/spain-2027/communities";
import { editionCityName, editionCityPath, editionNames } from "@/lib/programmatic/spain-2027/editions";
import { cityPath } from "@/lib/programmatic/spain-2027/paths";
import { absoluteUrl } from "@/lib/site";

/**
 * The embeddable 2027 work calendar: which places it covers, and its URLs.
 *
 *   /embed/<locale>/2027/<municipi>/               a Catalan town (holidays/data.ts)
 *   /embed/<locale>/2027/<comunidad>/<ciudad>/     a Spanish city (spain-2027/cities.ts),
 *                                                  the Spanish community slug in every locale
 *
 * Each is a bare HTML document for an <iframe> on another site (src/app/embed/,
 * render.ts): noindex, never in the sitemap, the only paths the site lets
 * other origins frame (lib/security-headers.ts). The page that hands out the
 * code, with the picker and a preview, sits in each language's 2027 folder:
 *
 *   /ca/festius/2027/al-teu-web/   /es/festivos/2027/en-tu-web/   /en/holidays/2027/for-your-website/
 *
 * Static folders beside `[comunitat]` / `[comunidad]` / `[community]`: no
 * community slug is any of them (a test holds it).
 */

export type EmbedLocale = DateLocale;
export const EMBED_LOCALES: readonly EmbedLocale[] = ["ca", "es", "en"];
export const EMBED_YEAR = 2027;

export function isEmbedLocale(locale: string): locale is EmbedLocale {
  return (EMBED_LOCALES as readonly string[]).includes(locale);
}

export type EmbedPlace = { kind: "town"; m: SnapshotMunicipality } | { kind: "city"; c: City };

/* ---------------------------------------------------------------- Embed --- */

const EMBED_ROOT = "/embed";

export function embedTownPath(locale: EmbedLocale, slug: string): string {
  return `${EMBED_ROOT}/${locale}/${EMBED_YEAR}/${slug}/`;
}

/** The Spanish community slug in every locale (communities.ts): the city slug is the same in all three. */
export function embedCityPath(locale: EmbedLocale, c: Pick<City, "slug" | "community">): string {
  return `${EMBED_ROOT}/${locale}/${EMBED_YEAR}/${c.community.slug}/${c.slug}/`;
}

export function embedPath(locale: EmbedLocale, place: EmbedPlace): string {
  return place.kind === "town" ? embedTownPath(locale, place.m.slug) : embedCityPath(locale, place.c);
}

/** The picker's value for a place, and the hash a town page links with: "barcelona", "andalucia/sevilla". */
export function embedId(place: EmbedPlace): string {
  return place.kind === "town" ? place.m.slug : `${place.c.community.slug}/${place.c.slug}`;
}

export function resolveEmbedTown(locale: string, slug: string): EmbedPlace | null {
  if (!isEmbedLocale(locale)) return null;
  const m = municipalityBySlug(slug);
  return m ? { kind: "town", m } : null;
}

export function resolveEmbedCity(locale: string, comunidad: string, ciudad: string): EmbedPlace | null {
  if (!isEmbedLocale(locale)) return null;
  const community = communityBySlug(comunidad);
  const c = community ? cityBySlug(community.region, ciudad) : null;
  return c ? { kind: "city", c } : null;
}

/** Built at deploy: one town and one city in each language. The rest render on their first request. */
export function embedTownStaticParams(): { locale: EmbedLocale; place: string }[] {
  return EMBED_LOCALES.map((locale) => ({ locale, place: "barcelona" }));
}

export function embedCityStaticParams(): { locale: EmbedLocale; place: string; city: string }[] {
  const madrid = CITIES.find((c) => c.slug === "madrid") ?? CITIES[0]!;
  return EMBED_LOCALES.map((locale) => ({ locale, place: madrid.community.slug, city: madrid.slug }));
}

/* ------------------------------------------------------------ Full page --- */

/**
 * The page the attribution link points to: the town's own page (in English
 * only for the English selection, otherwise its Catalan page), or the city's
 * page in the widget's language.
 */
export function fullPagePath(locale: EmbedLocale, place: EmbedPlace): string {
  if (place.kind === "town") {
    if (locale === "en") return hasEnglishPage(place.m.slug) ? municipalityPath("en", place.m.slug) : municipalityPath("ca", place.m.slug);
    return municipalityPath(locale, place.m.slug);
  }
  return locale === "es" ? cityPath(place.c) : editionCityPath(locale, place.c);
}

export function placeName(locale: EmbedLocale, place: EmbedPlace): string {
  if (place.kind === "town") return locale === "en" ? enName(place.m) : displayName(place.m, locale);
  return locale === "es" ? place.c.name : editionCityName(place.c, locale);
}

/* ---------------------------------------------------------- Widget page --- */

export const WIDGET_SLUG: Record<EmbedLocale, string> = { ca: "al-teu-web", es: "en-tu-web", en: "for-your-website" };

/** "/ca/festius/2027/al-teu-web/". */
export function widgetPagePath(locale: EmbedLocale): string {
  return `/${locale}/${ROUTE[locale].root}/${EMBED_YEAR}/${WIDGET_SLUG[locale]}/`;
}

/** A town or city page's link to the widget page, with the place picked ("#barcelona", "#andalucia/sevilla"). */
export function widgetLinkFor(locale: EmbedLocale, place: EmbedPlace): string {
  return `${widgetPagePath(locale)}#${embedId(place)}`;
}

export function widgetEditions(): Record<EmbedLocale, string> {
  return { ca: widgetPagePath("ca"), es: widgetPagePath("es"), en: widgetPagePath("en") };
}

/** When the widget page last changed (its words; the data it shows lives in the widget). */
export const WIDGET_PAGE_AS_OF = "2026-11-11";

/** The widget pages, never the /embed/ documents. x-default is the English one (the site's rule). */
export function widgetSitemapEntries(lastModified: string = WIDGET_PAGE_AS_OF): MetadataRoute.Sitemap {
  const e = widgetEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return EMBED_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: { languages },
  }));
}

/* --------------------------------------------------------------- Picker --- */

export interface PickerGroup {
  label: string;
  /** Path of the widget for `items[i][0]`: `${embedPrefix}${value}/`. */
  embedPrefix: string;
  /**
   * Path of the full page: `${pagePrefix}${slug}/`, or `${altPagePrefix}${slug}/` when the item's third
   * field is 1, `slug` being the value's last segment ("sevilla" of "andalucia/sevilla").
   */
  pagePrefix: string;
  altPagePrefix?: string;
  /** [picker value, label, 1 when the page is in another language]. */
  items: [string, string, 1?][];
}

const CATALONIA: Record<EmbedLocale, string> = { ca: "Catalunya", es: "Cataluña", en: "Catalonia" };

/**
 * Every place the widget covers, for the picker: the Catalan towns
 * alphabetically, then the Spanish cities by community. Compact on purpose:
 * the browser gets the list once, as the picker's options.
 */
export function pickerGroups(locale: EmbedLocale): PickerGroup[] {
  const towns = [...municipalities()]
    .map((m) => ({ m, label: placeName(locale, { kind: "town", m }) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  const catalonia: PickerGroup = {
    label: CATALONIA[locale],
    embedPrefix: `${EMBED_ROOT}/${locale}/${EMBED_YEAR}/`,
    pagePrefix: `/${locale}/${ROUTE[locale].root}/`,
    ...(locale === "en" ? { altPagePrefix: `/ca/${ROUTE.ca.root}/` } : {}),
    items: towns.map(({ m, label }) => (locale === "en" && !hasEnglishPage(m.slug) ? [m.slug, label, 1] : [m.slug, label])),
  };
  const communities = COMMUNITIES.map((community) => ({
    community,
    label: locale === "es" ? community.short : editionNames(community.region, locale).short,
    cities: CITIES.filter((c) => c.region === community.region),
  }))
    .filter((g) => g.cities.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  const spain = communities.map(({ community, label, cities }) => {
    const sample = cities[0]!;
    const page = fullPagePath(locale, { kind: "city", c: sample });
    return {
      label,
      embedPrefix: `${EMBED_ROOT}/${locale}/${EMBED_YEAR}/`,
      pagePrefix: page.slice(0, page.length - sample.slug.length - 1),
      items: cities
        .map((c) => ({ c, label: placeName(locale, { kind: "city", c }) }))
        .sort((a, b) => a.label.localeCompare(b.label, locale))
        .map(({ c, label: name }): [string, string] => [`${community.slug}/${c.slug}`, name]),
    };
  });
  return [catalonia, ...spain];
}
