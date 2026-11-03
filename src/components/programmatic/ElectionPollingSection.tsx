import { renderInline } from "@/lib/content/inline";
import type { PollingModel } from "@/lib/programmatic/elections/polling";

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
        const list = (
          <ul className="m-0 list-none p-0 text-sm [&>li]:border-t [&>li]:border-[var(--color-rule)] [&>li]:py-2 [&>li:first-child]:border-t-0 [&_span]:block [&_span]:text-[var(--color-muted)]">
            {group.places.map((place, j) => (
              <li key={j} className="!mt-0">
                <strong>{place.name}</strong>
                <span>{place.address}</span>
                {place.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </li>
            ))}
          </ul>
        );
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
