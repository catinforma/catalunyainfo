import { IntentLink } from "@/components/nav/IntentLink";

import type { Locale } from "@/lib/i18n/config";
import { USEFUL_NOW_TITLE, type UsefulNow as UsefulNowData } from "@/lib/engagement/useful-now";

/**
 * "Útil ahora" (lib/engagement/useful-now.ts decides the links): evergreen
 * pages a strike reader needs next, at the foot of the main column.
 * Server-rendered links, below the fold, so it cannot shift the layout; they
 * prefetch on intent only (IntentLink), because five viewport prefetches on
 * the most-read pages would be five uncached origin requests per view. The
 * list look of the "next useful step" box on the neutral callout, so the two
 * read as different boxes; a paragraph title, not
 * a heading, so the page outline and its "In this page" index stay as they
 * were. `data-ci-placement="useful_now"` is reported by the one click listener
 * (AnalyticsClicks.tsx) as `related_content_click`, `link_context: "useful_now"`.
 */
export function UsefulNow({ data, locale }: { data: UsefulNowData | null; locale: Locale }) {
  if (!data || data.links.length === 0) return null;
  return (
    <nav
      aria-labelledby="ci-useful-now-title"
      className="ci-callout ci-next-step ci-useful-now ci-measure mt-12"
      data-ci-placement="useful_now"
      data-ci-family={`strikes_${data.scope}`}
    >
      <p id="ci-useful-now-title" className="ci-next-step-title">
        {USEFUL_NOW_TITLE[locale]}
      </p>
      <ul className="ci-next-step-list">
        {data.links.map((link) => (
          <li key={link.href}>
            <IntentLink href={link.href}>{link.label}</IntentLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
