import { Fragment } from "react";

import { IntentLink } from "@/components/nav/IntentLink";

import type { ElectionLine as ElectionLineData } from "@/lib/engagement/election-line";

/**
 * The one-line 29N election box (lib/engagement/election-line.ts decides the
 * text and links): a short sentence and two or three links on the info
 * callout. Server-rendered, no state, so it cannot shift the layout; links
 * prefetch on intent only (IntentLink), as in the "next useful step" box.
 * A paragraph, not a heading, so the page outline stays as it was.
 * `data-ci-placement="election_line"` is reported by the click listener
 * (AnalyticsClicks.tsx) as `related_content_click`, `link_context: "election_line"`.
 */
export function ElectionLine({ line, className }: { line: ElectionLineData | null; className?: string }) {
  if (!line || line.links.length === 0) return null;
  return (
    <nav
      aria-label={line.text.replace(/:$/, "")}
      className={`ci-callout ci-callout-info ci-measure${className ? ` ${className}` : ""}`}
      data-ci-placement="election_line"
      data-ci-family="elections"
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
