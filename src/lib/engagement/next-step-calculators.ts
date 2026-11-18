import { b2Step, nextStep, type NextStep, type NextStepLink } from "@/lib/engagement/next-step-core";
import type { Locale } from "@/lib/i18n/config";
import { hubCards, type HubCard } from "@/lib/programmatic/calculators/hub";
import { calculatorsHubPath } from "@/lib/programmatic/calculators/paths";
import { checkPath } from "@/lib/programmatic/lottery-check/paths";

/**
 * The calculators' "next useful step" (lib/engagement/next-step.ts): the one
 * or two tools a reader of each calculator most plausibly needs next, right
 * under the tool. The full list stays at the foot of the page
 * (MoreCalculators.tsx). Anchors are the hub cards' titles, with the card's
 * question as the note. Kept apart from next-step.ts so the content pages do
 * not load every calculator's rules.
 *
 * Why these pairs: the same payslip or contract (net salary, extra pay, SMI),
 * the same dismissal (severance, final settlement, the dole and its subsidy
 * and the day each is paid), the same leave (sick leave, paid leave, working
 * days, the 2027 planner), the same home (mortgage, Euribor, purchase taxes,
 * rent update and the CPI behind it), the same yearly update (pensions, CPI).
 * Never a tool the page already links in the line just above the box. A card
 * whose page in the reader's language does not exist (fuel in English) is
 * skipped; a tool left with nothing gets the calculators hub.
 */

export type NextToolKey = HubCard["key"];

export const CALCULATOR_NEXT: Partial<Record<NextToolKey, readonly NextToolKey[]>> = {
  "net-salary": ["extra-pay", "smi-2027"],
  "extra-pay": ["net-salary", "settlement"],
  "self-employed": ["net-salary"],
  dismissal: ["settlement", "unemployment"],
  settlement: ["dismissal", "unemployment"],
  // Not pay dates: the line just above the box already links them.
  unemployment: ["unemployment-subsidy", "settlement"],
  "unemployment-subsidy": ["unemployment", "pay-dates"],
  "sick-leave": ["paid-leave", "net-salary"],
  "paid-leave": ["working-days", "leave-2027"],
  "rent-update": ["ipc"],
  // Not each other: the Euribor and mortgage pages link each other in the line just above the box.
  euribor: ["home-purchase-tax", "treasury-bills"],
  mortgage: ["home-purchase-tax"],
  "home-purchase-tax": ["mortgage", "euribor"],
  "pensions-2027": ["ipc", "pay-dates"],
  "working-days": ["leave-2027", "paid-leave"],
  "smi-2027": ["net-salary", "extra-pay"],
  // The average salary is gross: its readers want the net of a figure, then the floor (SMI).
  "average-salary": ["net-salary", "smi-2027"],
  ipc: ["rent-update", "pensions-2027"],
  "treasury-bills": ["euribor", "ipc"],
  // The fine for an expired ITV and its 50 %, then fuel prices.
  itv: ["traffic-fines", "fuel"],
  // Same car: the ITV (a common fine), and the working days for any other deadline.
  "traffic-fines": ["itv", "working-days"],
  // Energy at home: the regulated tariff the bono social needs, then butane (the thermal bono).
  "bono-social": ["pvpc", "butane"],
  "leave-2027": ["working-days"],
};

const CHECK_LABEL: Record<Locale, string> = {
  es: "Comprobar Lotería de Navidad",
  ca: "Comprovar la Loteria de Nadal",
  en: "Check your Christmas Lottery ticket",
};

const HUB_LABEL: Record<Locale, string> = {
  es: "Todas las calculadoras y herramientas",
  ca: "Totes les calculadores i eines",
  en: "All calculators and tools",
};

function cardStep(card: HubCard, locale: Locale): NextStepLink | null {
  // A card that sends this edition to another language's page (fuel has no English edition): not a next step.
  if (card.hrefLang?.[locale] && card.hrefLang[locale] !== locale) return null;
  return { href: card.href[locale], label: card.title[locale], note: card.answers[locale] };
}

export function calculatorNextStep(current: NextToolKey | "lottery-tax", locale: Locale, self: string): NextStep | null {
  // The lottery prize tax tool: the number checker (which prize, then this sum), then the draw's guide.
  if (current === "lottery-tax") return nextStep("calculators", [{ href: checkPath(locale), label: CHECK_LABEL[locale] }, b2Step("loteriaNadal", locale)], self);
  const cards = hubCards();
  const links = (CALCULATOR_NEXT[current] ?? [])
    .map((key) => cards.find((card) => card.key === key))
    .map((card) => (card ? cardStep(card, locale) : null));
  return (
    nextStep("calculators", links, self) ?? nextStep("calculators", [{ href: calculatorsHubPath(locale), label: HUB_LABEL[locale] }], self)
  );
}
