import type { WeekendFacts } from "@/lib/programmatic/weekend/facts";

/**
 * Key facts and the short FAQ of the weekend pages (25 Nov 2026): the same
 * strings the page's FAQPage JSON-LD carries, counted from the lists the page
 * prints below. Server-rendered; nothing here reads the clock.
 */
export function WeekendFactsTable({ facts }: { facts: WeekendFacts }) {
  return (
    <section aria-labelledby="ci-weekend-facts">
      <h2 id="ci-weekend-facts" className="!mt-0">
        {facts.heading}
      </h2>
      <div className="ci-table-wrap mt-4">
        <table className="ci-fair-facts">
          <caption>{facts.caption}</caption>
          <tbody>
            {facts.rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                <td>
                  {row.links ? (
                    row.links.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 ? " · " : ""}
                        <a href={l.href} rel="noopener" target="_blank">
                          {l.label}
                        </a>
                      </span>
                    ))
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function WeekendFaq({ facts }: { facts: WeekendFacts }) {
  if (facts.faq.length === 0) return null;
  return (
    <section aria-labelledby="ci-weekend-faq">
      <h2 id="ci-weekend-faq">{facts.faqHeading}</h2>
      <dl className="m-0">
        {facts.faq.map((item) => (
          <div key={item.question} className="border-b border-[var(--color-rule)] py-4 last:border-b-0">
            <dt className="font-semibold">{item.question}</dt>
            <dd className="m-0 mt-1 text-[var(--color-ink-soft)]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
