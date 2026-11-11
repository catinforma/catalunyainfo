import type { Locale } from "@/lib/i18n/config";

import { SNAPSHOT, resolveMunicipality, resolveProvince, type GordoMunicipalityGroup, type GordoProvinceGroup } from "./data";
import type { GordoSnapshot } from "./types";

/**
 * Which request each route answers. Every route folder serves one locale
 * (`on-ha-tocat-la-loteria-de-nadal` = ca, `donde-ha-tocado-el-gordo` = es,
 * `spanish-christmas-lottery-results` = en). Province and municipality pages
 * resolve only from the snapshot: with none (before the draw) every one of
 * them is a 404, and so is any place the snapshot does not list.
 */

export function hubAllowed(route: Locale, locale: string): boolean {
  return route === locale;
}

export function resolveProvincePage(route: Locale, locale: string, slug: string, s: GordoSnapshot | null = SNAPSHOT): GordoProvinceGroup | null {
  if (route !== locale || !s) return null;
  return resolveProvince(s, slug);
}

export function resolveMunicipalityPage(
  route: Locale,
  locale: string,
  provinceSlug: string,
  slug: string,
  s: GordoSnapshot | null = SNAPSHOT,
): GordoMunicipalityGroup | null {
  if (route !== locale || !s) return null;
  return resolveMunicipality(s, provinceSlug, slug);
}

/** The hub is prerendered once per edition. */
export function hubStaticParams(route: Locale): { locale: Locale }[] {
  return [{ locale: route }];
}

/**
 * Province and municipality pages render on their first request and are then
 * cached (revalidate = false, dynamicParams = true): nothing at build time,
 * so a snapshot of hundreds of towns does not lengthen the deploy.
 */
export function placeStaticParams(): never[] {
  return [];
}
