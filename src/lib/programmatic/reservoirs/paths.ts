import type { Locale } from "@/lib/i18n/config";

import { RESERVOIRS, type ReservoirSlug } from "./types";

/**
 * URLs of the reservoir family. No data here, so a guide can link to a page
 * without pulling the snapshot into its bundle.
 *
 *   ca  /ca/embassaments/          hub      /ca/embassaments/sau/
 *   es  /es/embalses/              hub      /es/embalses/sau/
 *   en  /en/reservoirs/            hub      /en/reservoirs/sau/
 *
 * Each folder under `app/(public)/[locale]` serves its own language and is a
 * 404 for the others, so the site-wide `[...slug]` catch-all never sees these
 * paths. The slug is the reservoir's own name, the same in every language.
 */

export const RESERVOIR_SEGMENT: Record<Locale, string> = {
  ca: "embassaments",
  es: "embalses",
  en: "reservoirs",
};

export const reservoirHubPath = (locale: Locale): string => `/${locale}/${RESERVOIR_SEGMENT[locale]}/`;

export const reservoirPath = (locale: Locale, slug: ReservoirSlug): string => `/${locale}/${RESERVOIR_SEGMENT[locale]}/${slug}/`;

export function reservoirHubTranslations(): Record<Locale, string> {
  return { ca: reservoirHubPath("ca"), es: reservoirHubPath("es"), en: reservoirHubPath("en") };
}

export function reservoirTranslations(slug: ReservoirSlug): Record<Locale, string> {
  return { ca: reservoirPath("ca", slug), es: reservoirPath("es", slug), en: reservoirPath("en", slug) };
}

export function reservoirSlugs(): ReservoirSlug[] {
  return RESERVOIRS.map((r) => r.slug);
}
