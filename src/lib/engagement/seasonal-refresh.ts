import { addDays } from "@/lib/content/holidays/calendar";
import { CALCULATOR_IDS, CALC_LOCALES, calcPath } from "@/lib/programmatic/calculators/paths";
import { englishTowns as fairEnglishTowns, towns as fairTowns } from "@/lib/programmatic/christmas-fairs/data";
import { FAIRS_LOCALES, townPath as fairTownPath } from "@/lib/programmatic/christmas-fairs/paths";
import { englishTowns as holidayEnglishTowns } from "@/lib/programmatic/holidays/english";
import { DATE_LOCALES, DATE_PAGES, datePath, municipalityPath } from "@/lib/programmatic/holidays/paths";

import { SEASON } from "./continue-reading";

/**
 * The nightly refresh of the 8U seasonal "coming up" link (27 Nov 2026,
 * batch 9B) on the static programmatic templates.
 *
 * The link (continue-reading.ts `SEASON`, continue-templates.ts) changes only
 * when the day passes one window's `until`: 9 Dec (bridge -> Christmas
 * lottery), 23 Dec (lottery -> New Year's Eve), 1 Jan (La Grossa -> Reis),
 * 7 Jan (Reis -> 2027). The templates below are `revalidate = false` (or, for
 * a few calculators, cached by Cloudflare for up to a day), so without this
 * they would keep the link they were built with until the next deploy.
 *
 * On those four nights only, the 00:05 cron (api/cron/publish-scheduled)
 * revalidates and purges (by URL, batches of 30) every page of:
 *  - the holiday date pages (/ca/festius/dia/…, /es/festivos/dia/…, /en/holidays/day/…);
 *  - the calculators (/ca/calculadores/<tool>/, /es/calculadoras/…, /en/calculators/…);
 *  - the Christmas fair town pages (ca/es/en, not the hubs, which have no seasonal link);
 *  - the English holiday town pages (the ca/es ones are rebuilt by
 *    holidayRefreshPaths the night after every Catalonia-wide holiday: 9 Dec,
 *    26 Dec, 2 Jan and 7 Jan, so they lag the 23 Dec and 1 Jan switches by
 *    three nights and one night; adding their ~1,830 URLs here would turn two
 *    more nights into a purge of the whole zone).
 * About 350 URLs a switch night (tests/seasonal-refresh.test.ts holds the count).
 * The election town pages revalidate every minute and need nothing.
 *
 * Every other night the list is empty, so the job and its purge are unchanged.
 */

/** The Madrid days on whose 00:05 run the seasonal link changes: the day after each window's last day. */
export const SEASONAL_SWITCH_NIGHTS: readonly string[] = SEASON.map((window) => addDays(window.until, 1));

export function seasonalRefreshDue(today: string): boolean {
  return SEASONAL_SWITCH_NIGHTS.includes(today);
}

const noSlash = (path: string) => path.replace(/\/$/, "");

/** Every page of the static templates that prints the seasonal link (paths without the trailing slash, as revalidatePath takes them). */
export function seasonalTemplatePaths(): string[] {
  const paths: string[] = [];
  for (const locale of DATE_LOCALES) for (const iso of DATE_PAGES) paths.push(datePath(locale, iso));
  for (const locale of CALC_LOCALES) for (const id of CALCULATOR_IDS) paths.push(calcPath(id, locale));
  for (const locale of FAIRS_LOCALES) for (const town of locale === "en" ? fairEnglishTowns() : fairTowns()) paths.push(fairTownPath(locale, town.slug));
  for (const m of holidayEnglishTowns()) paths.push(municipalityPath("en", m.slug));
  return [...new Set(paths.map(noSlash))];
}

/** Paths for `revalidatePath` on a switch night; empty on the other nights. `today` is the Madrid date the cron runs on. */
export function seasonalRefreshPaths(today: string): string[] {
  return seasonalRefreshDue(today) ? seasonalTemplatePaths() : [];
}
