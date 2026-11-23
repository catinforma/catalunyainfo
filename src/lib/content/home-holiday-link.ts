import { holidayOn, isCovered, nextHolidayAfter } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { datePath, isDatePage } from "@/lib/programmatic/holidays/paths";
import { isLowDemandPath } from "@/lib/seo/low-demand";

/**
 * 23 Nov 2026 (docs/SEO_EXPERIMENTS.md): the homepage holidays tile's live line
 * ("Próximo festivo: la Inmaculada, 8 de diciembre") links that day's own
 * "¿Es festivo el …?" page; the tile's title keeps its hub link. The homepage
 * is the site's strongest page and linked no date page, so each Catalonia-wide
 * holiday gets a homepage link in the weeks before it (8 Dec now, then 25 and
 * 26 Dec, 1 and 6 Jan...). Today's page on a holiday; null when the day has no
 * page or its page is noindex.
 *
 * Kept out of lib/content/home-tools.ts on purpose: other families import that
 * module, and the sitemap dates a family by the files it renders from
 * (scripts/body-dates.ts), so a homepage-only change must not touch it.
 */
export function holidayLiveHref(locale: Locale, today: string): string | null {
  if (!isCovered(today)) return null;
  const iso = holidayOn(today)?.date ?? nextHolidayAfter(today)?.date;
  if (!iso || !isDatePage(iso)) return null;
  const path = datePath(locale, iso);
  return isLowDemandPath(path, today) ? null : path;
}
