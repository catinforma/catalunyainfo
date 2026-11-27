import { IntentLink } from "@/components/nav/IntentLink";

import { renderInline } from "@/lib/content/inline";
import { SEASONAL_NOTE, type ContinueReading as ContinueReadingData } from "@/lib/engagement/continue-reading";
import type { Locale } from "@/lib/i18n/config";

/**
 * The stored "Continua llegint" list, shown clearer (lib/engagement/continue-reading.ts
 * decides the links): right under the stored heading, one box with up to three
 * topical links and one seasonal link, then the stored items not linked
 * anywhere else on the page, as written.
 *
 * Server-rendered in the place of the stored list, with no state, so it
 * shifts nothing. The "next useful step" box's list look (ci-next-step), on
 * the neutral callout like "Useful now", so the end of the page has one
 * onward box in one look. Links prefetch on intent only (IntentLink), like
 * the other onward boxes.
 *
 * Clicks: `data-ci-placement="continue_reading"` on the box and the rest;
 * the seasonal item carries its own `"seasonal_next"`, which `closest()` in
 * AnalyticsClicks.tsx finds first. Both are `related_content_click`.
 */
export function ContinueReading({ data, locale, labelledBy }: { data: ContinueReadingData | null; locale: Locale; labelledBy: string }) {
  if (!data) return null;
  return (
    <>
      {data.topical.length > 0 || data.seasonal ? (
        <nav aria-labelledby={labelledBy} className="ci-callout ci-next-step ci-continue-reading" data-ci-placement="continue_reading">
          <ul className="ci-next-step-list">
            {data.topical.map((item) => (
              <li key={item.href}>
                {/* A stored item keeps its words (and its gloss) as written. */}
                {item.markdown ? renderInline(item.markdown) : <IntentLink href={item.href}>{item.label}</IntentLink>}
              </li>
            ))}
            {data.seasonal ? (
              <li data-ci-placement="seasonal_next">
                <IntentLink href={data.seasonal.href}>{data.seasonal.label}</IntentLink>
                <span className="ci-next-step-note">{SEASONAL_NOTE[locale]}</span>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
      {data.rest.length > 0 ? (
        <ul data-ci-placement="continue_reading">
          {data.rest.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
