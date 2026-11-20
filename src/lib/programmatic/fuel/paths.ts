/**
 * URLs of the fuel-price family. No data here, so a guide can link to a page
 * without pulling the station list into its bundle.
 *
 *   es  /es/gasolineras/                         hub
 *       /es/gasolineras/provincia/<provincia>/   barcelona, girona, lleida, tarragona
 *       /es/gasolineras/comarca/<comarca>/       osona, baix-llobregat, …
 *       /es/gasolineras/<municipio-o-cadena>/    manresa, l-hospitalet-de-llobregat, bonarea, esclatoil
 *   ca  /ca/benzineres/ … the same shapes.
 *
 * Provinces and comarques get their own segment because four provinces share
 * a name with their capital (Barcelona, Girona, Lleida, Tarragona). City and
 * chain slugs share the top level; the tests check they never collide.
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

export type FuelLocale = "ca" | "es";
export const FUEL_LOCALES: readonly FuelLocale[] = ["es", "ca"];

export const FUEL_ROUTE = {
  ca: { root: "benzineres", province: "provincia", comarca: "comarca" },
  es: { root: "gasolineras", province: "provincia", comarca: "comarca" },
} as const satisfies Record<FuelLocale, { root: string; province: string; comarca: string }>;

export type PathKind = "province" | "comarca" | "city" | "chain";

/**
 * The hub also has an English edition (20 Nov 2026, the owner's rule that
 * every page exists in ca, es and en): /en/fuel-prices-catalonia/, the same
 * live table and area table. Only the hub: the place pages stay ca/es (and
 * noindex, lib/seo/low-demand.ts); the English hub links their Spanish edition.
 */
export type FuelHubLocale = FuelLocale | "en";
export const FUEL_HUB_LOCALES: readonly FuelHubLocale[] = ["es", "ca", "en"];
export const EN_FUEL_HUB_SEGMENT = "fuel-prices-catalonia";

export function fuelHubPath(locale: FuelHubLocale): string {
  return locale === "en" ? `/en/${EN_FUEL_HUB_SEGMENT}/` : `/${locale}/${FUEL_ROUTE[locale].root}/`;
}

/** The edition of the place pages a hub links: its own, or the Spanish one from the English hub. */
export function placeLocaleFor(locale: FuelHubLocale): FuelLocale {
  return locale === "en" ? "es" : locale;
}

export function fuelPath(locale: FuelLocale, kind: PathKind, slug: string): string {
  const r = FUEL_ROUTE[locale];
  if (kind === "province") return `/${locale}/${r.root}/${r.province}/${slug}/`;
  if (kind === "comarca") return `/${locale}/${r.root}/${r.comarca}/${slug}/`;
  return `/${locale}/${r.root}/${slug}/`;
}

export function fuelTranslations(kind: PathKind, slug: string): Record<FuelLocale, string> {
  return { ca: fuelPath("ca", kind, slug), es: fuelPath("es", kind, slug) };
}

export function fuelHubTranslations(): Record<FuelHubLocale, string> {
  return { ca: fuelHubPath("ca"), es: fuelHubPath("es"), en: fuelHubPath("en") };
}
