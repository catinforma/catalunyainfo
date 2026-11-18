import { renderInline } from "@/lib/content/inline";
import { ELECTION_DAY_ANCHOR, type ElectionDayBlock } from "@/lib/programmatic/elections/election-day";

/**
 * The election-day layer (lib/programmatic/elections/election-day.ts): what
 * the hubs and town pages lead with from 28 Nov to 7 Dec 2026. A Server
 * Component with no client code: the block is decided when the page renders
 * (the routes regenerate every 5 minutes), so the cached HTML and Cloudflare
 * carry the right phase and the reader's clock plays no part. The official
 * results site, once announced, is a plain anchor (an external site: no
 * prefetch, no client router).
 */
export function ElectionDayCallout({ block }: { block: ElectionDayBlock | null }) {
  if (!block) return null;
  const headingId = `${ELECTION_DAY_ANCHOR}-title`;
  return (
    <section id={ELECTION_DAY_ANCHOR} aria-labelledby={headingId} className={`ci-callout ci-callout-${block.tone}`} data-phase={block.phase}>
      <h2 id={headingId} className="!mt-0 font-sans text-base font-semibold">
        {block.title}
      </h2>
      {block.cta ? (
        <p className="mt-2">
          <a className="ci-btn ci-btn-primary" href={block.cta.href} rel="noopener" target="_blank">
            {block.cta.label}
            <span aria-hidden="true"> →</span>
          </a>
        </p>
      ) : null}
      <ul className="mt-2">
        {block.md.map((text) => (
          <li key={text}>{renderInline(text)}</li>
        ))}
      </ul>
    </section>
  );
}
