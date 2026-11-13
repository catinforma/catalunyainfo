import type { Locale } from "@/lib/i18n/config";

/**
 * The calculators family: one static folder per language under `[locale]`,
 * one sub-folder per tool.
 *
 *   /es/calculadoras/<tool>/
 *   /ca/calculadores/<tool>/
 *   /en/calculators/<tool>/
 *
 * Only the tools exist today (the net salary calculator is the first); the
 * hub at `/es/calculadoras/` is not built yet, so nothing links to the bare
 * folder and no page.tsx sits there. When the hub arrives it goes in
 * `[locale]/calculadoras/page.tsx` (and the ca/en twins) and lists the
 * `CALCULATORS` below; a test holds every tool's folder to this root.
 *
 * Small and data-free: client components import it.
 */

export const CALCULATORS_ROOT: Record<Locale, string> = { es: "calculadoras", ca: "calculadores", en: "calculators" };

/** "/es/calculadoras/sueldo-neto/". */
export function calculatorPath(locale: Locale, slug: string): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/${slug}/`;
}

/** Every tool of the family with its slug per language, for the future hub and the tests. */
export const CALCULATORS = [
  { id: "net-salary", slugs: { es: "sueldo-neto", ca: "sou-net", en: "net-salary-spain" } },
  { id: "pensions-2027", slugs: { es: "subida-pensiones-2027", ca: "pujada-pensions-2027", en: "spain-pension-increase-2027" } },
] as const satisfies readonly { id: string; slugs: Record<Locale, string> }[];
