/**
 * The embeddable calculators: their URLs and the frame sizes the code uses.
 *
 *   /embed/<locale>/calc/net-salary/                       net salary (sou net, sueldo neto)
 *   /embed/<locale>/calc/working-days/                     working days, national holidays only
 *   /embed/<locale>/calc/working-days/<place id>/          …with a place's holidays: the working-days
 *                                                          calculator's ids ("barcelona", "catalunya",
 *                                                          "madrid/madrid", "andalucia/all")
 *
 * Each is a bare HTML document for an <iframe> on another site, with no
 * script: a GET form the route handler answers with the result
 * (net-salary.ts, working-days.ts). noindex (`indexifembedded`), never in the
 * sitemap; framed from anywhere, forms to this origin only
 * (lib/security-headers.ts `EMBED_CALC_SOURCE`). The code to paste is handed
 * out by a box on each calculator's own page (components/programmatic/embed-calc/).
 *
 * Small and data-free: client components import it.
 */

export type CalcEmbedLocale = "ca" | "es" | "en";
export const CALC_EMBED_LOCALES: readonly CalcEmbedLocale[] = ["ca", "es", "en"];

export function isCalcEmbedLocale(locale: string): locale is CalcEmbedLocale {
  return (CALC_EMBED_LOCALES as readonly string[]).includes(locale);
}

const ROOT = "/embed";

export function netSalaryEmbedPath(locale: CalcEmbedLocale): string {
  return `${ROOT}/${locale}/calc/net-salary/`;
}

/** The national calendar has no segment; every other place is its id. */
export function workingDaysEmbedPath(locale: CalcEmbedLocale, placeId: string | null = null): string {
  return `${ROOT}/${locale}/calc/working-days/${placeId ? `${placeId}/` : ""}`;
}

/** Frame heights: the default view fits without an inner scrollbar at 520 px wide. */
export const NET_SALARY_HEIGHT = 900;
export const WORKING_DAYS_HEIGHT = 980;
