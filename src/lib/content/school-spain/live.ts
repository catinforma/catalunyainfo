import type { Body } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { localizeRegion } from "./i18n";
import { liveHubDescription, liveHubTitle, liveRegionDescription, liveRegionTitle } from "./logic";
import { SPAIN_REGIONS, hubRegions, regionBySlug } from "./regions";

/** The `region` of the page's `spainSchoolCalendar` block, or null. */
export function spainSchoolRegionOf(body: Body): string | null {
  for (const block of body) if (block.type === "spainSchoolCalendar") return block.region;
  return null;
}

/** Title for a page carrying the block, in the page's language; null (stored title) for an unknown region. */
export function liveSpainSchoolTitle(region: string, today: string, locale: Locale = "es"): string | null {
  if (region === "espana") return liveHubTitle(hubRegions(locale), today);
  const r = SPAIN_REGIONS.find((x) => x.slug === region);
  return r ? liveRegionTitle(localizeRegion(r, locale), today) : null;
}

export function liveSpainSchoolDescription(region: string, today: string, locale: Locale = "es"): string | null {
  if (region === "espana") return liveHubDescription(hubRegions(locale), today);
  const r = regionBySlug(region);
  return r && r.slug !== "cataluna" ? liveRegionDescription(localizeRegion(r, locale), today) : null;
}
