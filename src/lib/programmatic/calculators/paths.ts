import type { Locale } from "@/lib/i18n/config";

/**
 * The calculators family: the one registry of its URLs. One static folder
 * per language under `[locale]`, one sub-folder per tool, and the hub at the
 * folder itself.
 *
 *   /es/calculadoras/            hub ([locale]/calculadoras/page.tsx)
 *   /es/calculadoras/<tool>/     each tool ([locale]/calculadoras/<slug>/page.tsx)
 *   /ca/calculadores/…
 *   /en/calculators/…
 *
 * Every tool's module (net-salary/copy.ts, employment/*, rent-update/copy.ts)
 * reads its slugs from `CALCULATORS` below, and the hub lists the same
 * registry, so a tool added here shows up on the hub (tests/calculators-hub.test.ts
 * fails until it has a card). Slugs are live URLs: never change one.
 *
 * Small and data-free: client components import it.
 */

export type CalcLocale = Locale;
export const CALC_LOCALES: readonly CalcLocale[] = ["ca", "es", "en"];

export const CALCULATORS_ROOT: Record<CalcLocale, string> = { es: "calculadoras", ca: "calculadores", en: "calculators" };

/** Every tool of the family with its slug per language, in the hub's order. */
export const CALCULATORS = [
  { id: "net-salary", slugs: { es: "sueldo-neto", ca: "sou-net", en: "net-salary-spain" } },
  { id: "dismissal", slugs: { es: "indemnizacion-despido", ca: "indemnitzacio-acomiadament", en: "severance-pay-spain" } },
  { id: "settlement", slugs: { es: "finiquito", ca: "quitanca-finiquito", en: "final-settlement-spain" } },
  { id: "unemployment", slugs: { es: "paro", ca: "atur", en: "unemployment-benefit-spain" } },
  { id: "rent-update", slugs: { es: "actualizar-alquiler", ca: "actualitzar-lloguer", en: "rent-increase-spain" } },
  { id: "pensions-2027", slugs: { es: "subida-pensiones-2027", ca: "pujada-pensions-2027", en: "spain-pension-increase-2027" } },
  // Reference pages with official figures (hub group "official"): the SMI with its small calculator, and the INE's CPI.
  { id: "smi-2027", slugs: { es: "salario-minimo-2027", ca: "salari-minim-2027", en: "spain-minimum-wage-2027" } },
  { id: "ipc", slugs: { es: "ipc", ca: "ipc", en: "spain-inflation-cpi" } },
] as const satisfies readonly { id: string; slugs: Record<CalcLocale, string> }[];

export type CalculatorId = (typeof CALCULATORS)[number]["id"];
export const CALCULATOR_IDS: readonly CalculatorId[] = CALCULATORS.map((c) => c.id);

/** The three employment calculators (lib/programmatic/employment/), which share one page frame. */
export type CalcKey = Extract<CalculatorId, "dismissal" | "settlement" | "unemployment">;
export const CALC_KEYS: readonly CalcKey[] = ["dismissal", "settlement", "unemployment"];

/** The tool's slugs per language. */
export function calculatorSlugs(id: CalculatorId): Record<CalcLocale, string> {
  const entry = CALCULATORS.find((c) => c.id === id);
  if (!entry) throw new Error(`unknown calculator ${id}`);
  return entry.slugs;
}

/** "/es/calculadoras/sueldo-neto/". */
export function calcPath(id: CalculatorId, locale: CalcLocale): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/${calculatorSlugs(id)[locale]}/`;
}

/** The tool's three editions, for hreflang and the language switcher. */
export function calcEditions(id: CalculatorId): Record<CalcLocale, string> {
  return { ca: calcPath(id, "ca"), es: calcPath(id, "es"), en: calcPath(id, "en") };
}

/** "/es/calculadoras/": the family's hub. */
export function calculatorsHubPath(locale: CalcLocale): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/`;
}

export function calculatorsHubEditions(): Record<CalcLocale, string> {
  return { ca: calculatorsHubPath("ca"), es: calculatorsHubPath("es"), en: calculatorsHubPath("en") };
}
