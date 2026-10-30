import { hasEnglish, townBySlug, townsByPopulation, englishTowns, type Town } from "./data";
import type { FairsLocale } from "./paths";

/**
 * Which request each Christmas fairs route answers. Every route folder serves
 * one locale (`fires-de-nadal` = ca, `mercados-navidad` = es,
 * `christmas-markets` = en): any other `[locale]` value, a slug that is not a
 * town with a dated fair, or an English request for a town without an English
 * edition resolves to null, and the page calls `notFound()`.
 */

export function hubAllowed(route: FairsLocale, locale: string): boolean {
  return route === locale;
}

export function resolveTown(route: FairsLocale, locale: string, slug: string): Town | null {
  if (route !== locale) return null;
  const town = townBySlug(slug);
  if (!town) return null;
  if (route === "en" && !hasEnglish(town)) return null;
  return town;
}

/** How many towns each locale prerenders at build; the rest render on first request. */
export const PRERENDER = 20;

/**
 * Static params always carry the route's own locale (Next calls this once per
 * `[locale]` of the root layout and merges the result over it, as in the other
 * families). The 20 largest towns in ca/es; every English town.
 */
export function townStaticParams(route: FairsLocale): { locale: FairsLocale; municipi: string }[] {
  const list = route === "en" ? englishTowns() : townsByPopulation().slice(0, PRERENDER);
  return list.map((t) => ({ locale: route, municipi: t.slug }));
}
