import { CITIES, cityBySlug } from "./data";
import type { City, ZaLocale } from "./types";

/**
 * Which request each route of the family answers. Every route folder serves
 * one locale (`zona-azul` = es, `zona-blava` = ca, `blue-zone-parking` = en):
 * any other `[locale]` value, or a slug that is not a city of the data file,
 * resolves to null and the page calls `notFound()`.
 */

export function zaHubAllowed(route: ZaLocale, locale: string): boolean {
  return route === locale;
}

export function resolveZaCity(route: ZaLocale, locale: string, slug: string): City | null {
  if (route !== locale) return null;
  return cityBySlug(slug);
}

/**
 * Static params always carry the route's own locale (Next calls this once per
 * `[locale]` of the root layout and merges the result over it, as in the
 * other families). Every city is prerendered: there are few.
 */
export function zaCityStaticParams<K extends string>(route: ZaLocale, key: K): ({ locale: ZaLocale } & Record<K, string>)[] {
  return CITIES.map((c) => ({ locale: route, [key]: c.slug }) as { locale: ZaLocale } & Record<K, string>);
}

export function zaHubStaticParams(route: ZaLocale): { locale: ZaLocale }[] {
  return [{ locale: route }];
}
