import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { caOfMonth, elDay, monthText, num, pct } from "@/lib/programmatic/rent-update/copy";

import type { RefId } from "./series";

/**
 * Paths and words of "Euríbor hoy: el dato oficial del mes", small enough
 * for the browser (the revision calculator imports it):
 *
 *   /es/calculadoras/euribor-hoy/
 *   /ca/calculadores/euribor-avui/
 *   /en/calculators/euribor-today/
 *
 * Slugs from the calculators registry (hub group "housing").
 */

export type EuriborLocale = DateLocale;
export const EURIBOR_LOCALES: readonly EuriborLocale[] = ["es", "ca", "en"];

export const EURIBOR_SLUG: Record<EuriborLocale, string> = calculatorSlugs("euribor");

export function euriborPath(locale: EuriborLocale): string {
  return calcPath("euribor", locale);
}

export function euriborEditions(): Record<EuriborLocale, string> {
  return { es: euriborPath("es"), ca: euriborPath("ca"), en: euriborPath("en") };
}

export { caOfMonth, elDay, monthText, num, pct };

/** A rate as the BOE prints it, three decimals: "3,239 %" / "3.239%". */
export function rate3(n: number | null, locale: EuriborLocale): string {
  return n === null ? "—" : pct(n, 3, locale);
}

/** A change in percentage points with its sign: "+0,052 p. p." / "+0.052 pp". */
export function points(n: number, locale: EuriborLocale): string {
  const sign = n > 0 ? "+" : "";
  return locale === "en" ? `${sign}${num(n, 3, "en")} pp` : `${sign}${num(n, 3, locale)} p. p.`;
}

/** The bare day: "4 de noviembre de 2026" / "4 November 2026". */
export function bareDay(iso: string, locale: EuriborLocale): string {
  return elDay(iso, locale).replace(/^(el |l'|la |on )/, "");
}

/** "octubre de 2026" with Catalan "d'"/"de" where a sentence needs it: "l'Euríbor d'octubre de 2026". */
export function ofMonth(month: string, locale: EuriborLocale): string {
  if (locale === "ca") return caOfMonth(month);
  return locale === "es" ? `de ${monthText(month, "es")}` : `for ${monthText(month, "en")}`;
}

/** Names of the official rates, as the page lists them (the BOE's long names are in series.ts). */
export const REF_NAME: Record<EuriborLocale, Record<RefId, string>> = {
  es: {
    euribor: "Euríbor a un año",
    irph: "IRPH del conjunto de entidades (España)",
    irphEuro: "Tipo medio de préstamos a la vivienda de 1 a 5 años en la zona euro",
    irs5: "IRS (permuta de intereses) a cinco años",
    estr12: "Tipo de referencia basado en el €STR a un año",
    debt26: "Rendimiento de la deuda pública de 2 a 6 años",
  },
  ca: {
    euribor: "Euríbor a un any",
    irph: "IRPH del conjunt d'entitats (Espanya)",
    irphEuro: "Tipus mitjà dels préstecs per a habitatge d'1 a 5 anys a la zona euro",
    irs5: "IRS (permuta d'interessos) a cinc anys",
    estr12: "Tipus de referència basat en l'€STR a un any",
    debt26: "Rendiment del deute públic de 2 a 6 anys",
  },
  en: {
    euribor: "12-month Euribor",
    irph: "IRPH, all Spanish lenders",
    irphEuro: "Average rate on 1–5 year housing loans in the euro area",
    irs5: "Five-year interest rate swap (IRS)",
    estr12: "One-year €STR-based reference rate",
    debt26: "Yield on 2–6 year Spanish government debt",
  },
};

/** Short column heads for the 24-month table. */
export const REF_SHORT: Record<EuriborLocale, Record<RefId, string>> = {
  es: { euribor: "Euríbor 1 año", irph: "IRPH entidades", irphEuro: "Vivienda zona euro", irs5: "IRS 5 años", estr12: "€STR 1 año", debt26: "Deuda 2-6 años" },
  ca: { euribor: "Euríbor 1 any", irph: "IRPH entitats", irphEuro: "Habitatge zona euro", irs5: "IRS 5 anys", estr12: "€STR 1 any", debt26: "Deute 2-6 anys" },
  en: { euribor: "Euribor 12m", irph: "IRPH", irphEuro: "Euro-area housing", irs5: "IRS 5y", estr12: "€STR 1y", debt26: "Debt 2–6y" },
};
