import Link from "next/link";

import { factsCopy, factsSources, townFacts, type FactsContext, type FaqItem, type HubRow } from "@/lib/programmatic/christmas-fairs/facts";
import { townPath, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";
import type { Fair } from "@/lib/programmatic/christmas-fairs/types";

/** Server-rendered fact table, FAQ and hub table of the Christmas fair pages (25 Nov 2026). Nothing here reads the clock. */

/**
 * One small table per fair with the rows its data has (dates, hours, place,
 * how to get there, tickets), then where and when each was read. Nothing is
 * filled in for a missing field.
 */
export function FactsTable({ fairs, ctx, locale }: { fairs: readonly Fair[]; ctx: FactsContext; locale: FairsLocale }) {
  const c = factsCopy(locale);
  return (
    <section aria-labelledby="ci-xmas-facts">
      <h2 id="ci-xmas-facts">{c.heading}</h2>
      {townFacts(fairs, ctx, locale).map((facts) => (
        <div key={facts.id} className="ci-table-wrap mt-4">
          <table className="ci-fair-facts">
            <caption>{c.caption(facts.name)}</caption>
            <tbody>
              {facts.rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  <td>
                    {row.value}
                    {row.seeDirections ? (
                      <>
                        {" "}
                        <a href="#com-arribar" aria-label={c.directionsLink}>
                          ↓
                        </a>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="ci-agenda-meta mt-2">{factsSources(fairs, ctx, locale)}</p>
    </section>
  );
}

/** The short FAQ: the same strings the page's FAQPage JSON-LD carries. */
export function FairFaq({ items, locale, id = "ci-xmas-faq" }: { items: readonly FaqItem[]; locale: FairsLocale; id?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{factsCopy(locale).faqHeading}</h2>
      <dl className="m-0">
        {items.map((item) => (
          <div key={item.question} className="border-b border-[var(--color-rule)] py-4 last:border-b-0">
            <dt className="font-semibold">{item.question}</dt>
            <dd className="m-0 mt-1 text-[var(--color-ink-soft)]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The hub's table of the most searched fairs: name (linked where the town has a page), dates, hours, place. */
export function TopFairsTable({ rows, locale }: { rows: readonly HubRow[]; locale: FairsLocale }) {
  const c = factsCopy(locale);
  return (
    <section aria-labelledby="ci-xmas-top">
      <h2 id="ci-xmas-top">{c.hubHeading}</h2>
      <div className="ci-table-wrap mt-4">
        <table className="ci-table" role="table">
          <caption>{c.hubCaption}</caption>
          <thead>
            <tr role="row">
              {([c.hubCols.fair, c.hubCols.dates, c.hubCols.hours, c.hubCols.place] as const).map((h) => (
                <th key={h} scope="col" role="columnheader">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.town}-${r.name}-${r.start}`} role="row">
                <th scope="row" role="rowheader" className="font-normal" data-label={c.hubCols.fair}>
                  {r.slug ? <Link href={townPath(locale, r.slug)}>{r.name}</Link> : r.name}
                  <br />
                  <span className="text-[var(--color-muted)]">{r.town}</span>
                </th>
                <td role="cell" data-label={c.hubCols.dates}>
                  {r.dates}
                </td>
                <td role="cell" data-label={c.hubCols.hours}>
                  {r.hours ?? "–"}
                </td>
                <td role="cell" data-label={c.hubCols.place}>
                  {r.place ?? "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
