import type { Body } from "@/lib/content/blocks";

import { liveHubDescription, liveHubTitle, liveRegionDescription, liveRegionTitle } from "./logic";
import { SPAIN_REGIONS, hubRegions, regionBySlug } from "./regions";

/** The `region` of the page's `spainSchoolCalendar` block, or null. */
export function spainSchoolRegionOf(body: Body): string | null {
  for (const block of body) if (block.type === "spainSchoolCalendar") return block.region;
  return null;
}

/** Title for a page carrying the block; null (stored title) for an unknown region. */
export function liveSpainSchoolTitle(region: string, today: string): string | null {
  if (region === "espana") return liveHubTitle(hubRegions(), today);
  const r = SPAIN_REGIONS.find((x) => x.slug === region);
  return r ? liveRegionTitle(r, today) : null;
}

export function liveSpainSchoolDescription(region: string, today: string): string | null {
  if (region === "espana") return liveHubDescription(hubRegions(), today);
  const r = regionBySlug(region);
  return r && r.slug !== "cataluna" ? liveRegionDescription(r, today) : null;
}
