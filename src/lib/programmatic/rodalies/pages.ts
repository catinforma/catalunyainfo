/**
 * Rodalies live status per line: which pages exist, their titles,
 * descriptions, metadata and sitemap entries. No clock, no database.
 *
 * Tranche 1 (28 Oct 2026): a hub in ca, es and en, and one page per line for
 * the 19 lines Rodalies de Catalunya lists today, in ca and es (38 + 3 URLs).
 */

import type { Metadata, MetadataRoute } from "next";

import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { LINES, SNAPSHOT, lineById } from "./data";
import { LINE_LOCALES, hubPath, hubTranslations, isLineLocale, lineFromSlug, linePath, lineSlug, lineTranslations, type LineLocale } from "./paths";
import type { LineId, SnapshotLine } from "./types";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

/** The hub exists in ca, es and en. */
export function resolveHub(locale: string): Locale | null {
  return isLocale(locale) ? locale : null;
}

/**
 * The line behind `/<locale>/rodalies/<slug>/`, or null for a 404: English,
 * an unknown locale, an unknown or differently spelled slug.
 */
export function resolveLine(locale: string, slug: string): { locale: LineLocale; line: SnapshotLine } | null {
  if (!isLineLocale(locale)) return null;
  const id = lineFromSlug(slug);
  return id ? { locale, line: lineById(id) } : null;
}

/**
 * All 19 lines in both languages are prerendered (fewer than the 20 the
 * family rule allows per locale). The same complete list is returned whatever
 * `[locale]` the layout passes: an incomplete set made Next prerender nothing
 * for the holiday routes (see holidays/routing.ts).
 */
export function lineStaticParams(): { locale: LineLocale; linia: string }[] {
  return LINE_LOCALES.flatMap((locale) => LINES.map((line) => ({ locale, linia: lineSlug(line.id) })));
}

/* -------------------------------------------------------------------------- */
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

/** "R2 Sud", "R11"… */
export const lineName = (line: SnapshotLine): string => line.name;

/** Catalan article: Rodalies writes "l'R2", "l'R3", "l'RG1". */
export const caLine = (line: SnapshotLine): string => `l'${line.name}`;

const TITLES: Record<LineLocale, ((name: string) => string)[]> = {
  ca: [(n) => `Rodalies ${n} avui: incidències i avisos en directe`, (n) => `Rodalies ${n} avui: incidències i avisos`],
  es: [(n) => `Rodalies ${n} hoy: incidencias y avisos en directo`, (n) => `Rodalies ${n} hoy: incidencias y avisos`],
};

export function lineTitle(line: SnapshotLine, locale: LineLocale): string {
  const options = TITLES[locale].map((build) => build(line.name));
  return options.find((t) => t.length <= TITLE_LIMIT) ?? options[options.length - 1]!;
}

export function lineDescription(line: SnapshotLine, locale: LineLocale): string {
  const n = line.stations.length;
  const between = `${line.origin} - ${line.destination}`;
  const options =
    locale === "ca"
      ? [
          `Avisos en directe de ${caLine(line)} de Rodalies (${between}): ${n} estacions, horari oficial, què fer si hi ha incidències i com reclamar.`,
          `Avisos en directe de ${caLine(line)} de Rodalies: ${n} estacions, horari oficial, què fer si hi ha incidències i com reclamar.`,
          `Avisos en directe de ${caLine(line)} de Rodalies, horari oficial i com reclamar un retard.`,
        ]
      : [
          `Avisos en directo de la ${line.name} de Rodalies (${between}): ${n} estaciones, horario oficial, qué hacer si hay incidencias y cómo reclamar.`,
          `Avisos en directo de la ${line.name} de Rodalies: ${n} estaciones, horario oficial, qué hacer si hay incidencias y cómo reclamar.`,
          `Avisos en directo de la ${line.name} de Rodalies, horario oficial y cómo reclamar un retraso.`,
        ];
  return options.find((d) => d.length <= DESCRIPTION_LIMIT) ?? options[options.length - 1]!;
}

const HUB_META: Record<Locale, { title: string; description: string; h1: string }> = {
  ca: {
    title: "Rodalies avui: incidències i avisos en directe per línia",
    description:
      "Els avisos en directe de Rodalies de Catalunya a les 19 línies, de l'R1 a l'RL4, i una pàgina per línia amb estacions, horaris, incidències i reclamacions.",
    h1: "Rodalies avui: incidències i avisos per línia",
  },
  es: {
    title: "Rodalies hoy: incidencias y avisos en directo por línea",
    description:
      "Avisos en directo de Rodalies de Catalunya en las 19 líneas, de la R1 a la RL4, y una página por línea con estaciones, horarios y cómo reclamar.",
    h1: "Rodalies hoy: incidencias y avisos por línea",
  },
  en: {
    title: "Rodalies trains today: disruptions and live notices",
    description:
      "Live notices from Rodalies de Catalunya on all 19 lines, which line goes where (airport, Sitges, Girona, Tarragona) and what to do if your train is late.",
    h1: "Rodalies trains today: disruptions and notices",
  },
};

export const hubMeta = (locale: Locale) => HUB_META[locale];

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export function lineMetadata(line: SnapshotLine, locale: LineLocale): Metadata {
  return buildMetadata({
    locale,
    path: linePath(locale, line.id),
    title: lineTitle(line, locale),
    description: lineDescription(line, locale),
    translations: lineTranslations(line.id),
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

export interface RodaliesFamilyPath {
  path: string;
  /** The snapshot's read date: the only date these pages carry. */
  lastModified: string;
  translations: Partial<Record<Locale, string>>;
}

export function rodaliesFamilyPaths(): RodaliesFamilyPath[] {
  const lastModified = SNAPSHOT.readOn;
  const hubs = LOCALES.map((locale) => ({ path: hubPath(locale), lastModified, translations: hubTranslations() }));
  const lines = LINE_LOCALES.flatMap((locale) =>
    LINES.map((line) => ({ path: linePath(locale, line.id), lastModified, translations: lineTranslations(line.id) as Partial<Record<Locale, string>> })),
  );
  return [...hubs, ...lines];
}

/** Sitemap entries with hreflang alternates; nothing on a deployment that may not be indexed. */
export function rodaliesSitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return rodaliesFamilyPaths().map((entry) => {
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
      // The HTML changes only with the snapshot; the live notices are fetched by the browser.
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}

export function lineIds(): LineId[] {
  return LINES.map((l) => l.id);
}
