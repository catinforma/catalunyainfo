import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the daily page "Avui a Catalunya". No data here, so the hub strip,
 * the homepage and the sitemap can link to it without pulling anything in.
 *
 *   ca  /ca/avui/
 *   es  /es/hoy/
 *   en  /en/today/
 *
 * Each folder under `app/(public)/[locale]` serves its own language and is a
 * 404 for the others (`/es/avui/`, `/ca/today/`…), so the site-wide
 * `[...slug]` catch-all never sees these paths. Checked 30 Oct 2026: no
 * route folder, content path or legacy redirect uses these first segments.
 */

export const TODAY_SEGMENT: Record<Locale, string> = { ca: "avui", es: "hoy", en: "today" };

/** The page's name: its H1, its breadcrumb and its label wherever it is linked. */
export const TODAY_NAME: Record<Locale, string> = { ca: "Avui a Catalunya", es: "Hoy en Cataluña", en: "Today in Catalonia" };

export function todayPath(locale: Locale): string {
  return `/${locale}/${TODAY_SEGMENT[locale]}/`;
}

export function todayTranslations(): Record<Locale, string> {
  return { ca: todayPath("ca"), es: todayPath("es"), en: todayPath("en") };
}

/** The page of route `route` answers only its own locale; anything else is a 404. */
export function resolveToday(route: Locale, locale: string): Locale | null {
  return route === locale ? route : null;
}
