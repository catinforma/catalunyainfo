import Link from "next/link";
import type { ReactNode } from "react";

import { IntentLink } from "@/components/nav/IntentLink";
import { NextStep } from "@/components/NextStep";
import { CALCULATOR_NEXT, calculatorNextStep, type NextToolKey } from "@/lib/engagement/next-step-calculators";
import { calculatorCard } from "@/lib/programmatic/calculators/hub";
import { RELATED_TITLE, byPopularity, relatedCalculators } from "@/lib/programmatic/calculators/related";
import { CALCULATOR_IDS, calcPath, calculatorsHubPath, type CalcLocale, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";

import { Year2027Status } from "./Year2027Status";

/**
 * At the bottom of every calculator page: first "Calculadoras relacionadas",
 * the 3 or 4 tools on the same topic (lib/programmatic/calculators/related.ts,
 * 26 Nov 2026), then "Más calculadoras", the other tools of the registry
 * (never the page itself nor a related one), each with its hub one-liner,
 * then the hub. `extra` adds page-specific links at the end of the list (the
 * pay-dates guide on the unemployment calculator).
 *
 * Server-rendered, no state: nothing moves after the first paint. The related
 * block is `data-ci-placement="related_calculators"`, which the click
 * listener reports as `related_content_click` with that `link_context`
 * (lib/analytics/clicks.ts). Every link prefetches on intent (IntentLink): a
 * plain Link sent one uncached RSC prefetch per target as the 40-link list
 * scrolled into view.
 */

const T = {
  es: { title: "Más calculadoras", all: "Todas las calculadoras y herramientas" },
  ca: { title: "Més calculadores", all: "Totes les calculadores i eines" },
  en: { title: "More calculators", all: "All calculators and tools" },
} as const;

/** The keys the page's "next useful step" box links (CalculatorNextStep): the related block uses them only as a last resort. */
function nextStepKeys(current: CalculatorId): readonly string[] {
  return current === "lottery-tax" ? [] : (CALCULATOR_NEXT[current] ?? []);
}

export function RelatedCalculators({ current, locale }: { current: CalculatorId; locale: CalcLocale }) {
  const links = relatedCalculators(current, locale, nextStepKeys(current));
  if (links.length === 0) return null;
  return (
    <nav aria-labelledby="calculadoras-relacionadas" className="ci-callout ci-callout-tip ci-next-step mb-8" data-ci-placement="related_calculators">
      <h2 id="calculadoras-relacionadas" className="ci-next-step-title">
        {RELATED_TITLE[locale]}
      </h2>
      <ul className="ci-next-step-list">
        {links.map((link) => (
          <li key={link.key}>
            <IntentLink href={link.href}>{link.label}</IntentLink>
            <span className="ci-next-step-note">{link.note}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MoreCalculators({ current, locale, extra }: { current: CalculatorId; locale: CalcLocale; extra?: ReactNode }) {
  const t = T[locale];
  const related = new Set<string>(relatedCalculators(current, locale, nextStepKeys(current)).map((link) => link.key));
  // Most-searched first (related.ts POPULARITY), as on the hub.
  const siblings = byPopularity(CALCULATOR_IDS.filter((id) => id !== current))
    .filter((id) => !related.has(id))
    .map(calculatorCard);
  return (
    <>
      <RelatedCalculators current={current} locale={locale} />
      <section aria-labelledby="mas-calculadoras">
        <h2 id="mas-calculadoras">{t.title}</h2>
        <ul>
          {siblings.map((card) => (
            <li key={card.key}>
              <IntentLink href={card.href[locale]}>{card.title[locale]}</IntentLink>: {card.answers[locale]}
            </li>
          ))}
          {extra}
          <li>
            <IntentLink href={calculatorsHubPath(locale)}>{t.all}</IntentLink>
          </li>
        </ul>
      </section>
    </>
  );
}

/**
 * The "next useful step" right under a tool (lib/engagement/next-step-calculators.ts):
 * the one or two related tools, where "Más calculadoras" lists them all at the foot.
 * Before it, on every registry tool, the 2027 block (Year2027Status: what is
 * already official for 2027, and from the tool's guard date a warning that
 * its figures are 2026's).
 */
export function CalculatorNextStep({ current, locale }: { current: Extract<NextToolKey, CalculatorId | "leave-2027">; locale: CalcLocale }) {
  const self = current === "leave-2027" ? leavePath(locale) : calcPath(current, locale);
  return (
    <>
      {current === "leave-2027" ? null : <Year2027Status id={current} locale={locale} />}
      <NextStep step={calculatorNextStep(current, locale, self)} locale={locale} />
    </>
  );
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
