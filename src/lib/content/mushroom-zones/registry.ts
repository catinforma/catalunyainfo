import type { Locale } from "@/lib/i18n/config";

import type { MushroomZone } from "./types";

/**
 * The zone pages that exist.
 *
 * **Empty on purpose, and it stays empty until an editorial package fills it.**
 * Everything around it — the types, the guard, the publisher, the link helpers
 * — is built so that adding the Vall d'en Bas pilot is a payload and nothing
 * else. Creating the URL now, even as a stub, would put a thin page in the
 * sitemap and in the index, which is precisely the failure that got version 1
 * of this site rejected.
 *
 * The master report links to zones through `zonesFor()`, so it links to
 * exactly what is in here: today, nothing, and no empty section appears.
 *
 * Rollout is one zone at a time. Vall d'en Bas is the pilot because the query
 * data asks for it by name; nothing else joins this array until that page has
 * had 14 to 28 days in Search Console and has earned impressions and queries
 * of its own.
 */
export const MUSHROOM_ZONES: MushroomZone[] = [];

/** Zones with a published edition in this locale, in registry order. */
export function zonesFor(locale: Locale): MushroomZone[] {
  return MUSHROOM_ZONES.filter((zone) => Boolean(zone.editions[locale]));
}

/** Absolute, trailing-slashed href for a zone, or null when it has no edition. */
export function zoneHref(zone: MushroomZone, locale: Locale): string | null {
  const edition = zone.editions[locale];
  return edition ? `/${locale}/${edition.path}/` : null;
}

export function zoneByKey(key: string): MushroomZone | null {
  return MUSHROOM_ZONES.find((zone) => zone.key === key) ?? null;
}
