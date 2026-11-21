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

/*
 * Spain by province (21 Nov 2026; lib/programmatic/fuel/spain.ts). The 48
 * provinces and autonomous cities outside Catalonia, in all three languages:
 *
 *   es  /es/gasolineras/provincia/               every province of Spain, one table
 *       /es/gasolineras/provincia/<provincia>/   madrid, a-coruna, illes-balears, ceuta, …
 *   ca  /ca/benzineres/provincia/ …              the same shapes
 *   en  /en/fuel-prices-spain/                   the same table
 *       /en/fuel-prices-spain/<province>/        the same slugs
 *
 * In es and ca a Spanish province sits in the segment the four Catalan ones
 * already use (/provincia/barcelona/), so "province" means one thing in the
 * family and the index of all of them is that segment itself. English had a
 * Catalonia-only hub (/en/fuel-prices-catalonia/), which cannot hold Madrid:
 * the smallest consistent option is a sibling named like the other Spain-wide
 * English pages (/en/butane-price-spain/, /en/electricity-price-spain/), with
 * the provinces under it. Slugs are the INE names' (gordo/provinces.ts), the
 * same in every language. The Catalan provinces keep their own pages (ca/es,
 * noindex, lib/seo/low-demand.ts); the Spain table links them, and in English
 * the Catalonia hub's area table.
 */
export const EN_SPAIN_FUEL_SEGMENT = "fuel-prices-spain";

export function spainHubPath(locale: FuelHubLocale): string {
  return locale === "en" ? `/en/${EN_SPAIN_FUEL_SEGMENT}/` : `/${locale}/${FUEL_ROUTE[locale].root}/${FUEL_ROUTE[locale].province}/`;
}

export function spainProvincePath(locale: FuelHubLocale, slug: string): string {
  return `${spainHubPath(locale)}${slug}/`;
}

export function spainHubTranslations(): Record<FuelHubLocale, string> {
  return { ca: spainHubPath("ca"), es: spainHubPath("es"), en: spainHubPath("en") };
}

export function spainProvinceTranslations(slug: string): Record<FuelHubLocale, string> {
  return { ca: spainProvincePath("ca", slug), es: spainProvincePath("es", slug), en: spainProvincePath("en", slug) };
}
