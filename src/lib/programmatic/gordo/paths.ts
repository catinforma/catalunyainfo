/**
 * URLs of the Christmas lottery results family. No data here, so a guide can
 * link the hub without pulling the snapshot into its bundle.
 *
 *   es  /es/donde-ha-tocado-el-gordo/                          hub: before the draw, how it works; on the day, the results
 *       /es/donde-ha-tocado-el-gordo/<provincia>/              one province where SELAE lists a main prize (only from the snapshot)
 *       /es/donde-ha-tocado-el-gordo/<provincia>/<municipio>/  one municipality (only from the snapshot)
 *   ca  /ca/on-ha-tocat-la-loteria-de-nadal/ …                 the same ("Loteria de Nadal" is SELAE's Catalan name)
 *   en  /en/spanish-christmas-lottery-results/ …               the same
 *
 * Evergreen: the same URLs serve 2027. Each route folder serves one locale
 * and 404s for the others.
 */

import type { Locale } from "@/lib/i18n/config";

export const GORDO_LOCALES: readonly Locale[] = ["ca", "es", "en"];

export const GORDO_ROUTE: Record<Locale, string> = {
  ca: "on-ha-tocat-la-loteria-de-nadal",
  es: "donde-ha-tocado-el-gordo",
  en: "spanish-christmas-lottery-results",
};

export function gordoHubPath(locale: Locale): string {
  return `/${locale}/${GORDO_ROUTE[locale]}/`;
}

export function gordoProvincePath(locale: Locale, province: string): string {
  return `/${locale}/${GORDO_ROUTE[locale]}/${province}/`;
}

export function gordoMunicipalityPath(locale: Locale, province: string, municipality: string): string {
  return `/${locale}/${GORDO_ROUTE[locale]}/${province}/${municipality}/`;
}

type Translations = Record<Locale, string>;

export function gordoHubTranslations(): Translations {
  return { ca: gordoHubPath("ca"), es: gordoHubPath("es"), en: gordoHubPath("en") };
}

export function gordoProvinceTranslations(province: string): Translations {
  return { ca: gordoProvincePath("ca", province), es: gordoProvincePath("es", province), en: gordoProvincePath("en", province) };
}

export function gordoMunicipalityTranslations(province: string, municipality: string): Translations {
  return {
    ca: gordoMunicipalityPath("ca", province, municipality),
    es: gordoMunicipalityPath("es", province, municipality),
    en: gordoMunicipalityPath("en", province, municipality),
  };
}
