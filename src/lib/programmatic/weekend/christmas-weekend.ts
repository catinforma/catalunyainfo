/**
 * The Christmas fairs open this weekend, from our own Christmas fairs family
 * (`programmatic/christmas-fairs`: the fairs calendar, the agenda and the
 * organisers' pages, each date checked), so the weekend pages link the town
 * pages instead of repeating them. Server only (it reads that family's
 * snapshot).
 */

import type { Locale } from "@/lib/i18n/config";
import { SEASON } from "@/lib/programmatic/christmas-fairs/classify";
import { FAIRS, hasEnglish, qualifies, townByIne } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath, townPath } from "@/lib/programmatic/christmas-fairs/paths";

import { inPlace, windowDays, type PlaceFilter } from "./agenda-list";

export interface ChristmasTownLink {
  ine: string;
  town: string;
  /** Our page for the town (the English one where it exists, else the English hub). */
  href: string;
  fairs: { name: string; start: string; end: string }[];
}

/** Fairs open on at least one day of the window from `today` on, by town, in our town pages' order. */
export function christmasFairsThisWeekend(
  window: { from: string; to: string },
  today: string,
  locale: Locale,
  filter: PlaceFilter = {},
): ChristmasTownLink[] {
  if (window.from > SEASON.to) return [];
  const days = windowDays(window).filter((d) => d >= today);
  const byTown = new Map<string, ChristmasTownLink>();
  for (const fair of FAIRS) {
    if (!qualifies(fair)) continue;
    if (!days.some((d) => d >= fair.start && d <= fair.end && !fair.closed.includes(d))) continue;
    const town = townByIne(fair.ine);
    if (!town || !inPlace({ ine: town.ine, comarca: town.comarca, province: town.province }, filter)) continue;
    const href = locale === "en" ? (hasEnglish(town) ? townPath("en", town.slug) : fairsHubPath("en")) : townPath(locale, town.slug);
    const entry = byTown.get(town.ine) ?? { ine: town.ine, town: town.name, href, fairs: [] };
    entry.fairs.push({ name: locale === "es" && fair.nameEs ? fair.nameEs : fair.name, start: fair.start, end: fair.end });
    byTown.set(town.ine, entry);
  }
  return [...byTown.values()];
}
