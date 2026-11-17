import type { Locale } from "@/lib/i18n/config";
import { SEASONAL } from "@/lib/content/home-tools";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";

/**
 * Seasonal entries of the footer's first column, in the windows of the
 * homepage's seasonal tools (lib/content/home-tools.ts SEASONAL).
 *
 * Why the footer: the site audit of 17 Nov 2026 measured click depth from the
 * three home pages over every internal link. Since the homepage strip of
 * seasonal tools was removed (12 Nov, owner, phone layout), the Christmas
 * fairs hub sat 3 clicks deep and its 44 town pages per language 4 clicks
 * deep (84 sitemap URLs), in the weeks those pages are searched. A footer
 * link puts the hub at 1 and every town at 2 without adding anything to the
 * header or the homepage.
 */
export interface FooterLink {
  key: "christmasFairs";
  href: string;
  label: string;
}

const LABELS: Record<FooterLink["key"], Record<Locale, string>> = {
  christmasFairs: { ca: "Fires de Nadal", es: "Mercados de Navidad", en: "Christmas markets" },
};

function inWindow(monthDay: string, from: string, to: string): boolean {
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

function todayInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** `today` as YYYY-MM-DD in Catalan time. */
export function seasonalFooterLinks(locale: Locale, today: string = todayInMadrid()): FooterLink[] {
  const monthDay = today.slice(5, 10);
  const christmas = SEASONAL.find((s) => s.key === "christmas");
  const out: FooterLink[] = [];
  if (christmas && inWindow(monthDay, christmas.from, christmas.to)) {
    out.push({ key: "christmasFairs", href: fairsHubPath(locale), label: LABELS.christmasFairs[locale] });
  }
  return out;
}
