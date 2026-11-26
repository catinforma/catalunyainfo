import { Fragment } from "react";

import { IntentLink } from "@/components/nav/IntentLink";

import type { CalculatorLine as CalculatorLineData } from "@/lib/engagement/calculator-line";

/**
 * The one-line calculator link (lib/engagement/calculator-line.ts decides the
 * text and links): a short sentence and one or two links on the tip callout.
 * Server-rendered, no state, so it cannot shift the layout; links prefetch on
 * intent only (IntentLink). A paragraph, not a heading, so the page outline
 * stays as it was. `data-ci-placement="calculator_line"` is reported by the
 * click listener (AnalyticsClicks.tsx) as `related_content_click`,
 * `link_context: "calculator_line"`.
 */
export function CalculatorLine({ line, className }: { line: CalculatorLineData | null; className?: string }) {
  if (!line || line.links.length === 0) return null;
  return (
    <nav
      aria-label={line.text.replace(/[:?]$/, "")}
      className={`ci-callout ci-callout-tip ci-measure${className ? ` ${className}` : ""}`}
      data-ci-placement="calculator_line"
      data-ci-family="calculators"
    >
      <p className="m-0">
        <strong>{line.text}</strong>{" "}
        {line.links.map((link, i) => (
          <Fragment key={link.href}>
            {i > 0 ? " · " : null}
            <IntentLink href={link.href}>{link.label}</IntentLink>
          </Fragment>
        ))}
      </p>
    </nav>
  );
}
