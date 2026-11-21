import { cities, cityOrChainBySlug, comarques, placeBySlug, provinces, type ChainPlace, type CityPlace, type ComarcaPlace, type ProvincePlace } from "./data";
import type { FuelHubLocale, FuelLocale } from "./paths";
import { spainProvinceBySlug, spainProvinces, type SpainProvince } from "./spain";

/**
 * Which request each fuel route answers. Every route folder serves one locale
 * (`benzineres` = ca, `gasolineras` = es): any other `[locale]` value, or a
 * slug that is not a page, resolves to null and the page calls `notFound()`.
 */

export function fuelHubAllowed(route: FuelHubLocale, locale: string): boolean {
  return route === locale;
}

export function resolveProvince(route: FuelLocale, locale: string, slug: string): ProvincePlace | null {
  return route === locale ? placeBySlug("province", slug) : null;
}

export function resolveComarca(route: FuelLocale, locale: string, slug: string): ComarcaPlace | null {
  return route === locale ? placeBySlug("comarca", slug) : null;
}

export function resolveCityOrChain(route: FuelLocale, locale: string, slug: string): CityPlace | ChainPlace | null {
  return route === locale ? cityOrChainBySlug(slug) : null;
}

/**
 * Built at deploy, per locale: the 4 provinces, the 4 comarques and the 12
 * cities with most stations (20). Every other page renders once, on its first
 * request, and is then cached like these (`revalidate = false`).
 */
export const PRERENDERED_CITIES = 12;
export const PRERENDERED_COMARQUES = 4;

/*
 * Static params always carry the route's own locale. Next calls a page's
 * generateStaticParams once per `[locale]` of the root layout and merges the
 * result over it; returning `{ locale: route, … }` every time overrides the
 * parent's locale and the duplicates collapse (same as the holiday and
 * election routes).
 */

export function provinceStaticParams(route: FuelLocale): { locale: FuelLocale; provincia: string }[] {
  return provinces().map((p) => ({ locale: route, provincia: p.slug }));
}

export function comarcaStaticParams(route: FuelLocale): { locale: FuelLocale; comarca: string }[] {
  return [...comarques()]
    .sort((a, b) => b.stations - a.stations || a.slug.localeCompare(b.slug))
    .slice(0, PRERENDERED_COMARQUES)
    .map((c) => ({ locale: route, comarca: c.slug }));
}

/** `key` is the route's segment name: `lugar` (es) or `lloc` (ca). */
export function cityStaticParams<K extends string>(route: FuelLocale, key: K): ({ locale: FuelLocale } & Record<K, string>)[] {
  return cities()
    .slice(0, PRERENDERED_CITIES)
    .map((c) => ({ locale: route, [key]: c.slug }) as { locale: FuelLocale } & Record<K, string>);
}

/* -------------------------------------------------------------------------- */
/* Spain by province (21 Nov 2026)                                            */
/* -------------------------------------------------------------------------- */

/**
 * A Spain province page: the route's own locale and a province outside
 * Catalonia (the Catalan four resolve through `resolveProvince`, their own
 * page). The es and ca `provincia/[provincia]` routes try both; the English
 * route (/en/fuel-prices-spain/<province>/) only this one.
 */
export function resolveSpainProvince(route: FuelHubLocale, locale: string, slug: string): SpainProvince | null {
  return route === locale ? spainProvinceBySlug(slug) : null;
}

/** All 48 built at deploy in each language: they are the family's indexable province pages. */
export function spainProvinceStaticParams<K extends string>(route: FuelHubLocale, key: K): ({ locale: FuelHubLocale } & Record<K, string>)[] {
  return spainProvinces().map((p) => ({ locale: route, [key]: p.slug }) as { locale: FuelHubLocale } & Record<K, string>);
}
