import { addDays } from "@/lib/content/holidays/calendar";

import { shippedZones } from "./data";
import { weekendFamilyPaths } from "./sitemap";
import { weekendRefreshDue } from "./refresh";
import { zoneBySlug, type WeekendLocale, type ZoneDef } from "./zones";

/**
 * Which request each weekend route answers. Every route folder serves one
 * locale (`cap-de-setmana` = ca, `fin-de-semana` = es): any other `[locale]`
 * value, a slug that is not a zone, or a zone held back by the guardrail
 * resolves to null and the page calls `notFound()`.
 */

export function hubAllowed(route: WeekendLocale, locale: string): boolean {
  return route === locale;
}

export function resolveZone(route: WeekendLocale, locale: string, slug: string): ZoneDef | null {
  if (route !== locale) return null;
  const zone = zoneBySlug(route, slug);
  if (!zone) return null;
  return shippedZones().some((z) => z.id === zone.id) ? zone : null;
}

/*
 * Static params always carry the route's own locale. Next calls a page's
 * generateStaticParams once per `[locale]` of the root layout and merges the
 * result over it; returning `{ locale: route, … }` every time overrides the
 * parent's locale and the duplicates collapse (same as the other families).
 * All the zones are built at deploy: there are eleven, and none reads the
 * network or the database.
 */
export function zoneStaticParams(route: WeekendLocale): { locale: WeekendLocale; zona: string }[] {
  return shippedZones().map((z) => ({ locale: route, zona: z.slug[route] }));
}

/**
 * Paths for `revalidatePath`, on the nights the weekend window changed (and
 * the night after): every page of the family, hubs included. Empty on the
 * other nights. `today` is the Madrid date the cron runs on.
 */
export function weekendRefreshPaths(today: string): string[] {
  if (!weekendRefreshDue(today)) return [];
  return weekendFamilyPaths().map((entry) => entry.path.replace(/\/$/, ""));
}

/** For tests and the report: the nights in [from, from + days) the cron refreshes. */
export function refreshNights(from: string, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    if (weekendRefreshDue(day)) out.push(day);
  }
  return out;
}
