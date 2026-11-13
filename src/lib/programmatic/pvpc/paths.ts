import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the electricity price (PVPC) pages. No data here.
 *
 *   es  /es/precio-luz/                     today    /es/precio-luz/manana/
 *   ca  /ca/preu-llum/                      today    /ca/preu-llum/dema/
 *   en  /en/electricity-price-spain/        today    /en/electricity-price-spain/tomorrow/
 *
 * Each folder under `app/(public)/[locale]` serves its own language and is a
 * 404 for the others (same rule as the fuel and reservoir families).
 */

export type PvpcDayView = "today" | "tomorrow";

export const PVPC_SEGMENT: Record<Locale, string> = {
  es: "precio-luz",
  ca: "preu-llum",
  en: "electricity-price-spain",
};

export const PVPC_TOMORROW_SEGMENT: Record<Locale, string> = {
  es: "manana",
  ca: "dema",
  en: "tomorrow",
};

export function pvpcPath(locale: Locale, view: PvpcDayView = "today"): string {
  const base = `/${locale}/${PVPC_SEGMENT[locale]}/`;
  return view === "today" ? base : `${base}${PVPC_TOMORROW_SEGMENT[locale]}/`;
}

export function pvpcTranslations(view: PvpcDayView = "today"): Record<Locale, string> {
  return { ca: pvpcPath("ca", view), es: pvpcPath("es", view), en: pvpcPath("en", view) };
}

/** The route of `route` answers only its own locale. */
export function resolvePvpc(route: Locale, locale: string): Locale | null {
  return route === locale ? route : null;
}
