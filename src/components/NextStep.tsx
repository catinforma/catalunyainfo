import Link from "next/link";

import { NEXT_STEP_TITLE, type NextStep as NextStepData } from "@/lib/engagement/next-step-core";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Siguiente paso útil": the box right after a page's answer
 * (lib/engagement/next-step.ts decides the links). Server-rendered, plain
 * links, no state, so it costs no JavaScript and cannot shift the layout.
 *
 * The callout's tip colours (the same as "Lee también"), a navigation
 * landmark named by its title, and `data-ci-placement="next_step"`, which the
 * one click listener (AnalyticsClicks.tsx) reports as `related_content_click`
 * with `link_context: "next_step"`. A paragraph title rather than a heading,
 * so the page's outline and its "In this page" index stay as they were.
 */
export function NextStep({ step, locale, className }: { step: NextStepData | null; locale: Locale; className?: string }) {
  if (!step || step.links.length === 0) return null;
  return (
    <nav
      aria-labelledby="ci-next-step-title"
      className={`ci-callout ci-callout-tip ci-next-step${className ? ` ${className}` : ""}`}
      data-ci-placement="next_step"
      data-ci-family={step.family}
    >
      <p id="ci-next-step-title" className="ci-next-step-title">
        {NEXT_STEP_TITLE[locale]}
      </p>
      <ul className="ci-next-step-list">
        {step.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
            {link.note ? <span className="ci-next-step-note">{link.note}</span> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
