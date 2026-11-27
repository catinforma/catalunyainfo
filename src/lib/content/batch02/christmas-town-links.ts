import type { Locale } from "@/lib/i18n/config";
import { hasEnglish, townBySlug } from "@/lib/programmatic/christmas-fairs/data";
import { townPath } from "@/lib/programmatic/christmas-fairs/paths";
import { slugify } from "@/lib/programmatic/holidays/slug";
import { isLowDemandPath } from "@/lib/seo/low-demand";

/**
 * 27 Nov 2026 (internal-link audit, round 3; docs/SEO_EXPERIMENTS.md): the
 * Christmas markets guide names the fairs of Canyelles, Espinelves, Figueres,
 * Granollers and other towns, with their 2026 dates, but did not link their
 * town pages (the fair's hours, place and source), which only the fairs hub,
 * the calendar and the town's own holiday and election pages linked.
 * Espinelves (4,082 impressions in 28 days, position 8.6) and Canyelles
 * (5,022, 7.9) had no editorial link at all.
 *
 * The town's name becomes the link when the fairs family has a page for it in
 * the reader's language (English pages exist for a selection only) and the
 * page is indexable; otherwise the text is left as it is.
 */

/** The fair town page for a town name, or null. */
export function fairTownHref(name: string, locale: Locale, today?: string): string | null {
  const town = townBySlug(slugify(name));
  if (!town || (locale === "en" && !hasEnglish(town))) return null;
  const href = townPath(locale, town.slug);
  return isLowDemandPath(href, today) ? null : href;
}

/** "**Canyelles** (Garraf): …" → "**[Canyelles](/es/mercados-navidad/canyelles/)** (Garraf): …". */
export function linkLeadingTown(item: string, locale: Locale): string {
  const m = /^\*\*([^*[\]]+)\*\*/.exec(item);
  if (!m) return item;
  const href = fairTownHref(m[1]!, locale);
  return href ? `**[${m[1]}](${href})**${item.slice(m[0].length)}` : item;
}

/** A table's town cell, linked (towns the guide already links in its body are passed in `skip`). */
export function linkTownCell(name: string, locale: Locale, skip: readonly string[]): string {
  if (skip.includes(name)) return name;
  const href = fairTownHref(name, locale);
  return href ? `[${name}](${href})` : name;
}
