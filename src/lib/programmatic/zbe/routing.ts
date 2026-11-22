import { zbeCities, zbeCityBySlug } from "./cities";
import type { ZbeRoute } from "./paths";
import type { ZbeCity, ZbeLocale } from "./types";

/**
 * Which request each route folder answers: `zbe` serves es and ca,
 * `low-emission-zones` serves en. Any other `[locale]`, or a slug that is not
 * a published city, resolves to null and the page calls `notFound()`.
 */
const ROUTE_LOCALES: Record<ZbeRoute, readonly ZbeLocale[]> = { zbe: ["es", "ca"], "low-emission-zones": ["en"] };

export function zbeLocaleFor(route: ZbeRoute, locale: string): ZbeLocale | null {
  return ROUTE_LOCALES[route].find((l) => l === locale) ?? null;
}

export function resolveZbeCity(route: ZbeRoute, locale: string, slug: string): { locale: ZbeLocale; city: ZbeCity } | null {
  const served = zbeLocaleFor(route, locale);
  const city = served ? zbeCityBySlug(slug) : null;
  return served && city ? { locale: served, city } : null;
}

/**
 * Every city, built at deploy. The params always carry the route's own
 * locales: Next calls generateStaticParams once per `[locale]` of the root
 * layout and merges the result over it, so the duplicates collapse (same as
 * the fuel and holiday routes).
 */
export function zbeStaticParams<K extends string>(route: ZbeRoute, param: K): ({ locale: string } & Record<K, string>)[] {
  return ROUTE_LOCALES[route].flatMap((locale) => zbeCities().map((city) => ({ locale, [param]: city.slug }) as { locale: string } & Record<K, string>));
}

export function zbeHubStaticParams(route: ZbeRoute): { locale: string }[] {
  return ROUTE_LOCALES[route].map((locale) => ({ locale }));
}
