import { dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";

/**
 * URLs and number words of the three employment calculators, small enough
 * for the browser. Siblings of the net-salary calculator under the same
 * folder in each language (/es/calculadoras/, /ca/calculadores/,
 * /en/calculators/); the folder's own hub page is not built here.
 */

export type CalcLocale = DateLocale;
export const CALC_LOCALES: readonly CalcLocale[] = ["ca", "es", "en"];
export type CalcKey = "dismissal" | "settlement" | "unemployment";
export const CALC_KEYS: readonly CalcKey[] = ["dismissal", "settlement", "unemployment"];

/** The calculators' folder in each language (shared with the net-salary calculator). */
export const CALC_ROOT: Record<CalcLocale, string> = { ca: "calculadores", es: "calculadoras", en: "calculators" };

export const CALC_SLUG: Record<CalcKey, Record<CalcLocale, string>> = {
  dismissal: { ca: "indemnitzacio-acomiadament", es: "indemnizacion-despido", en: "severance-pay-spain" },
  settlement: { ca: "quitanca-finiquito", es: "finiquito", en: "final-settlement-spain" },
  unemployment: { ca: "atur", es: "paro", en: "unemployment-benefit-spain" },
};

export function calcPath(key: CalcKey, locale: CalcLocale): string {
  return `/${locale}/${CALC_ROOT[locale]}/${CALC_SLUG[key][locale]}/`;
}

export function calcEditions(key: CalcKey): Record<CalcLocale, string> {
  return { ca: calcPath(key, "ca"), es: calcPath(key, "es"), en: calcPath(key, "en") };
}

/** The Spain-wide pay-dates guide (lib/content/batch02 `payDates`), linked both ways with the unemployment calculator. */
export const PAY_DATES_PATH: Record<CalcLocale, string> = {
  ca: "/ca/guies/quan-es-cobra-atur-pensio/",
  es: "/es/guias/cuando-se-cobra-paro-pension/",
  en: "/en/guides/unemployment-benefit-pension-payment-dates-spain/",
};

const NUMBER_LOCALE: Record<CalcLocale, string> = { ca: "ca-ES", es: "es-ES", en: "en-GB" };
/** ES2023 `useGrouping: "always"` (the TS lib here still types it as boolean); an older browser reads the string as `true`. */
const ALWAYS_GROUP = { useGrouping: "always" } as unknown as Intl.NumberFormatOptions;

/**
 * "1.225,00 €" / "€1,225.00". Always two decimals (amounts a payslip shows) and
 * always grouped: es-ES leaves four-digit numbers ungrouped by default
 * ("1225,00 €"), while SEPE and the BOE write 1.225,00.
 */
export function money(x: number, locale: CalcLocale): string {
  return x.toLocaleString(NUMBER_LOCALE[locale], { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, ...ALWAYS_GROUP });
}

/** "371,25" / "371.25"; integers without decimals. */
export function num(x: number, locale: CalcLocale, digits = 2): string {
  return x.toLocaleString(NUMBER_LOCALE[locale], { minimumFractionDigits: Number.isInteger(x) ? 0 : digits, maximumFractionDigits: digits, ...ALWAYS_GROUP });
}

export function pct(x: number, locale: CalcLocale): string {
  return `${num(Math.round(x * 10000) / 100, locale)} %`.replace(" %", locale === "en" ? "%" : " %");
}

export const dateWords = (iso: string, locale: CalcLocale) => dayMonthYear(iso, locale);

/** Parse a number the reader typed, with a comma or a dot as decimal mark and dots/spaces as thousands. */
export function parseAmount(text: string): number {
  const t = text.trim().replace(/[\s€]/g, "");
  if (!t) return 0;
  let normalized: string;
  if (t.includes(",") && t.includes(".")) {
    // "28.000,50" (the last mark is the decimal one) or "28,000.50".
    normalized = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (t.includes(",")) {
    // "28000,5" decimal; "28,000" thousands.
    normalized = /,\d{3}$/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
  } else {
    // "28.000" thousands (how Spanish and Catalan write it); "82.19" decimal.
    normalized = /\.\d{3}$/.test(t) ? t.replace(/\./g, "") : t;
  }
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
