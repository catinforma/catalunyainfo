import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { relatedCalculators } from "@/lib/programmatic/calculators/related";
import { CALCULATOR_IDS, calcPath, calculatorsHubPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { GUIDES } from "@/lib/programmatic/holidays/links";

import { continueReading, type OnwardScope } from "./continue-reading";
import { CALCULATOR_NEXT, calculatorNextStep } from "./next-step-calculators";
import type { NextStepLink } from "./next-step-core";

/**
 * The one seasonal link in a calculator's "Calculadoras relacionadas" box
 * (components/programmatic/calculators/MoreCalculators.tsx; 27 Nov 2026,
 * batch 8U): the 8S chooser (continue-reading.ts) with no topical family, so
 * the box keeps its 3-4 related tools and gains the page for the days ahead
 * (the December bridge, the Christmas lottery, then the school holidays,
 * Reis and 2027), never one the page already links.
 *
 * The calculators are read across Spain: the Spanish and English editions
 * take the Spain season (the Spain December bridge, the lottery, the Spain
 * school holidays, the 2027 calendar), the Catalan edition the Catalonia one.
 */
export const calculatorScope = (locale: Locale): OnwardScope => (locale === "ca" ? "catalonia" : "spain");

/** Guides a calculator's own body links (read in its page component), so the seasonal link never repeats them. */
const BODY_GUIDES: Partial<Record<CalculatorId, (locale: Locale) => string[]>> = {
  // LotteryTaxPage: the Christmas lottery and La Grossa guides, in its answer and its links list.
  "lottery-tax": (locale) => [b2href("loteriaNadal", locale), b2href("grossa", locale)],
  // WorkingDaysPage: the 2026-2027 work calendar in its links list.
  "working-days": (locale) => [GUIDES.workCalendar[locale]],
};

/** The keys the page's "next useful step" box links (MoreCalculators: the related block uses them only as a last resort). */
export function calculatorNextStepKeys(current: CalculatorId): readonly string[] {
  return current === "lottery-tax" ? [] : (CALCULATOR_NEXT[current] ?? []);
}

/** Every path the calculator page's onward boxes link: the next step, the related tools, "Más calculadoras", the hub, its body's guides. */
export function calculatorOnwardExclude(current: CalculatorId, locale: Locale): string[] {
  const self = calcPath(current, locale);
  return [
    ...(calculatorNextStep(current, locale, self)?.links ?? []).map((link) => link.href),
    ...relatedCalculators(current, locale, calculatorNextStepKeys(current)).map((link) => link.href),
    ...CALCULATOR_IDS.map((id) => calcPath(id, locale)),
    calculatorsHubPath(locale),
    ...(BODY_GUIDES[current]?.(locale) ?? []),
  ];
}

/** The seasonal link for the calculator `current`, or null when every candidate is already on its page. */
export function calculatorSeasonal(current: CalculatorId, locale: Locale, today: string): NextStepLink | null {
  const box = continueReading({
    entry: { href: calcPath(current, locale), locale },
    stored: [],
    exclude: calculatorOnwardExclude(current, locale),
    family: { links: [], scope: calculatorScope(locale) },
    today,
  });
  return box?.seasonal ?? null;
}
