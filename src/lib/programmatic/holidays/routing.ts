import { municipalityBySlug, prerenderSlugs } from "./data";
import type { DateLocale } from "./format";
import { DATE_PAGES, dateFromSlug, dateSlug, type DatePage, type MuniLocale } from "./paths";
import type { SnapshotMunicipality } from "./types";

/**
 * Which request each holiday route answers. Every route folder serves one
 * locale only (`festius` = ca, `festivos` = es, `holidays` = en): any other
 * `[locale]` value, or a slug that is not in the snapshot, resolves to null
 * and the page calls `notFound()`.
 */

export function hubAllowed(route: MuniLocale, locale: string): boolean {
  return route === locale;
}

export function resolveMunicipality(route: MuniLocale, locale: string, slug: string): SnapshotMunicipality | null {
  if (route !== locale) return null;
  return municipalityBySlug(slug);
}

export function resolveDatePage(route: DateLocale, locale: string, slug: string): DatePage | null {
  if (route !== locale) return null;
  return dateFromSlug(slug, route);
}

/*
 * Static params always carry the route's own locale, whatever the parent
 * passes. Next calls a page's generateStaticParams once per `[locale]` of the
 * root layout and merges the result over it; an empty result for "es" or "en"
 * would leave `{ locale }` without the page's own param, and one incomplete
 * set makes Next prerender none of the route (the first build of this family
 * generated no pages for that reason). Returning `{ locale: route, … }` every
 * time overrides the parent's locale and the duplicates collapse.
 */

/** Built at deploy: the 20 biggest places only; the rest render on first request. */
export function municipalityStaticParams(route: MuniLocale): { locale: MuniLocale; municipi: string }[] {
  return prerenderSlugs(20).map((municipi) => ({ locale: route, municipi }));
}

/** All six date pages are built at deploy. */
export function dateStaticParams(route: DateLocale): { locale: DateLocale; dia: string }[] {
  return DATE_PAGES.map((iso) => ({ locale: route, dia: dateSlug(iso, route) }));
}
