import Link from "next/link";
import type { ReactNode } from "react";

import { NextStep } from "@/components/NextStep";
import { calculatorNextStep, type NextToolKey } from "@/lib/engagement/next-step-calculators";
import { calculatorCard } from "@/lib/programmatic/calculators/hub";
import { CALCULATOR_IDS, calcPath, calculatorsHubPath, type CalcLocale, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";

/**
 * "Más calculadoras", at the bottom of every calculator page: the other tools
 * of the registry (never the page itself), each with its hub one-liner, then
 * the hub. `extra` adds page-specific links at the end of the list (the
 * pay-dates guide on the unemployment calculator).
 */

const T = {
  es: { title: "Más calculadoras", all: "Todas las calculadoras y herramientas" },
  ca: { title: "Més calculadores", all: "Totes les calculadores i eines" },
  en: { title: "More calculators", all: "All calculators and tools" },
} as const;

export function MoreCalculators({ current, locale, extra }: { current: CalculatorId; locale: CalcLocale; extra?: ReactNode }) {
  const t = T[locale];
  const siblings = CALCULATOR_IDS.filter((id) => id !== current).map(calculatorCard);
  return (
    <section aria-labelledby="mas-calculadoras">
      <h2 id="mas-calculadoras">{t.title}</h2>
      <ul>
        {siblings.map((card) => (
          <li key={card.key}>
            <Link href={card.href[locale]}>{card.title[locale]}</Link>: {card.answers[locale]}
          </li>
        ))}
        {extra}
        <li>
          <Link href={calculatorsHubPath(locale)}>{t.all}</Link>
        </li>
      </ul>
    </section>
  );
}

/**
 * The "next useful step" right under a tool (lib/engagement/next-step-calculators.ts):
 * the one or two related tools, where "Más calculadoras" lists them all at the foot.
 */
export function CalculatorNextStep({ current, locale }: { current: Extract<NextToolKey, CalculatorId | "leave-2027">; locale: CalcLocale }) {
  const self = current === "leave-2027" ? leavePath(locale) : calcPath(current, locale);
  return <NextStep step={calculatorNextStep(current, locale, self)} locale={locale} />;
}

/** One sentence pointing to the calculators hub, for the guides and hubs that link it. */
export function CalculatorsHubLink({ locale }: { locale: CalcLocale }) {
  const text = {
    es: ["¿Haciendo números del año?", "Calcula tu sueldo neto, el finiquito, el paro o la subida del alquiler"],
    ca: ["Fent números de l'any?", "Calcula el teu sou net, la quitança, l'atur o la pujada del lloguer"],
    en: ["Doing the year's sums?", "Work out your net salary, final settlement, unemployment benefit or rent increase"],
  }[locale];
  return (
    <p>
      {text[0]} <Link href={calculatorsHubPath(locale)}>{text[1]}</Link>.
    </p>
  );
}
