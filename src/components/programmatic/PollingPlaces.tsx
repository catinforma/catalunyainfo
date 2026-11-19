"use client";

/**
 * One list of 29N polling places (ElectionPollingSection), rendered from
 * compact props: each place is [name, address, ...lines].
 *
 * The town pages are the site's most visited family and election night its
 * peak. As server-component elements every place travelled twice, as HTML
 * and again in the RSC payload (each line also repeated as its React key:
 * ~250 bytes a place there; Barcelona has 299). Rendered here the HTML is the
 * same, byte for byte, and the payload carries each text once.
 */

export type PollingPlaceRow = [name: string, address: string, ...lines: string[]];

export function PollingPlaces({ places }: { places: readonly PollingPlaceRow[] }) {
  return (
    <ul className="m-0 list-none p-0 text-sm [&>li]:border-t [&>li]:border-[var(--color-rule)] [&>li]:py-2 [&>li:first-child]:border-t-0 [&_span]:block [&_span]:text-[var(--color-muted)]">
      {places.map(([name, address, ...lines], j) => (
        <li key={j} className="!mt-0">
          <strong>{name}</strong>
          <span>{address}</span>
          {lines.map((line, k) => (
            <span key={k}>{line}</span>
          ))}
        </li>
      ))}
    </ul>
  );
}
