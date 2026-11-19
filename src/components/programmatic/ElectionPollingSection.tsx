import { renderInline } from "@/lib/content/inline";
import type { PollingModel } from "@/lib/programmatic/elections/polling";

import { PollingPlaces, type PollingPlaceRow } from "./PollingPlaces";

/**
 * The polling places of 29N, server-rendered from the committed BOP snapshot.
 * Towns with more than a handful of places fold them into native <details>
 * blocks (by district where there are several): the text stays in the HTML
 * for crawlers and no script is needed. Names and addresses are printed as
 * the bulletin writes them.
 */
export function PollingSection({ polling, headingId }: { polling: PollingModel; headingId: string }) {
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{polling.title}</h2>
      {polling.pending ? <p>{renderInline(polling.pending)}</p> : null}
      {polling.intro ? <p>{polling.intro}</p> : null}
      <p>{renderInline(polling.find)}</p>
      {polling.groups?.map((group, i) => {
        // Compact props, not server elements: the list is the page's biggest part (PollingPlaces.tsx).
        const list = <PollingPlaces places={group.places.map((place): PollingPlaceRow => [place.name, place.address, ...place.lines])} />;
        return group.label ? (
          <details key={group.label} className="mt-2 rounded border border-[var(--color-rule)] px-3 py-2">
            <summary className="cursor-pointer font-semibold">{group.label}</summary>
            <div className="mt-2">{list}</div>
          </details>
        ) : (
          <div key={i}>{list}</div>
        );
      })}
      {polling.legend ? <p className="mt-3 text-xs text-[var(--color-muted)]">{polling.legend}</p> : null}
      {polling.source ? <p className="mt-1 text-xs text-[var(--color-muted)]">{renderInline(polling.source)}</p> : null}
    </section>
  );
}
