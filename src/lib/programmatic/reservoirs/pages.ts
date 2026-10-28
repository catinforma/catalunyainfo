/**
 * Reservoir level per reservoir: which pages exist, their metadata and
 * sitemap entries. No clock, no database.
 *
 * Tranche 1 (28 Oct 2026): a hub and one page per reservoir of the ACA's
 * daily series (nine), in ca, es and en (30 URLs). The Ebro-basin
 * reservoirs (Rialb, Oliana, Canelles, Santa Anna, Talarn, Camarasa,
 * Mequinensa, Riba-roja) are left out: the CHE declares its SAIH real-time
 * data unofficial until validated and states no reuse licence (checked
 * 28 Oct 2026).
 */

import type { Metadata, MetadataRoute } from "next";

import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { hubCopy, reservoirDescription, reservoirTitle } from "./copy";
import { RESERVOIR_DATA, SNAPSHOT } from "./data";
import { reservoirHubPath, reservoirHubTranslations, reservoirPath, reservoirTranslations } from "./paths";
import { isReservoirSlug, type SnapshotReservoir } from "./types";

/* -------------------------------------------------------------------------- */
/* Routing: each folder serves one locale                                     */
/* -------------------------------------------------------------------------- */

/** The hub of `route` answers only its own locale. */
export function resolveReservoirHub(route: Locale, locale: string): Locale | null {
  return route === locale ? route : null;
}

/** The reservoir behind `/<route locale>/<segment>/<slug>/`, or null for a 404. */
export function resolveReservoir(route: Locale, locale: string, slug: string): SnapshotReservoir | null {
  if (route !== locale || !isReservoirSlug(slug)) return null;
  return RESERVOIR_DATA.find((r) => r.slug === slug) ?? null;
}

/**
 * All nine reservoirs are prerendered per locale (under the 20 the family
 * rule allows). The params always carry the route's own locale: Next calls
 * this once per `[locale]` of the layout, and an incomplete or mismatched set
 * made it prerender nothing for the holiday routes.
 */
export function reservoirStaticParams<K extends string>(route: Locale, key: K): ({ locale: Locale } & Record<K, string>)[] {
  return RESERVOIR_DATA.map((r) => ({ locale: route, [key]: r.slug }) as { locale: Locale } & Record<K, string>);
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function reservoirMetadata(r: SnapshotReservoir, locale: Locale): Metadata {
  return buildMetadata({
    locale,
    path: reservoirPath(locale, r.slug),
    title: reservoirTitle(r, locale),
    description: reservoirDescription(r, locale),
    translations: reservoirTranslations(r.slug),
    type: "website",
  });
}

export function reservoirHubMetadata(locale: Locale): Metadata {
  const copy = hubCopy(locale);
  return buildMetadata({
    locale,
    path: reservoirHubPath(locale),
    title: copy.title,
    description: copy.description,
    translations: reservoirHubTranslations(),
    type: "website",
  });
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export interface ReservoirFamilyPath {
  path: string;
  /** The snapshot's latest reading date: the only date these pages carry. */
  lastModified: string;
  translations: Record<Locale, string>;
}

/** Every URL of the family, hubs first (for the sitemap and for IndexNow). */
export function reservoirFamilyPaths(): ReservoirFamilyPath[] {
  const lastModified = SNAPSHOT.latestDate;
  const hubs = LOCALES.map((locale) => ({ path: reservoirHubPath(locale), lastModified, translations: reservoirHubTranslations() }));
  const pages = LOCALES.flatMap((locale) =>
    RESERVOIR_DATA.map((r) => ({ path: reservoirPath(locale, r.slug), lastModified, translations: reservoirTranslations(r.slug) })),
  );
  return [...hubs, ...pages];
}

/** Sitemap entries with hreflang alternates; nothing on a deployment that may not be indexed. */
export function reservoirSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return reservoirFamilyPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations[X_DEFAULT_LOCALE]);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      // The HTML changes only with the snapshot; today's reading is fetched by the browser.
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
