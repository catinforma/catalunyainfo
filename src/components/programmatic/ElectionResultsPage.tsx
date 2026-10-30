import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ElectionDayStatus } from "@/components/programmatic/ElectionDayStatus";
import { slugifyAnchor, type Block } from "@/lib/content/blocks";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { buildElectionPage, type Table } from "@/lib/programmatic/elections/model";
import { electionPath, electionTranslations, hubMeta, hubPath, placeName } from "@/lib/programmatic/elections/pages";
import { electionDataset } from "@/lib/programmatic/elections/structured";
import type { Municipality } from "@/lib/programmatic/elections/types";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";

/**
 * One municipality's election results. Everything is in the server HTML and
 * comes from the committed snapshot: no database, no fetch, no clock. The only
 * date-dependent line (the 29N countdown) is computed in the browser.
 */
export function electionCrumbs(locale: Locale, m: Municipality): Crumb[] {
  const t = getMessages(locale);
  return [
    { label: t.common.home, href: `/${locale}/` },
    { label: hubMeta(locale).h1, href: hubPath(locale) },
    { label: placeName(m, locale), href: electionPath(locale, m.slug) },
  ];
}

export function ElectionResultsPage({ locale, municipality }: { locale: Locale; municipality: Municipality }) {
  const model = buildElectionPage(municipality, locale);
  const crumbs = electionCrumbs(locale, municipality);
  const faqBlock = { type: "faq", items: model.faq } as Block;

  const sections = [
    model.slot.title,
    model.municipal.title,
    model.seats.title,
    model.congress.title,
    model.parliament.title,
    model.turnout.title,
    model.census.title,
    model.next.title,
  ];
  const id = (title: string) => slugifyAnchor(title);

  return (
    <>
      <SiteHeader locale={locale} translations={electionTranslations(municipality)} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{model.h1}</h1>
              {/* Hidden on phones like the site's standfirst: the facts block that follows answers first. */}
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)] max-md:hidden">{model.standfirst}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
                <span className="ci-verified">
                  <span className="ci-verified-dot" aria-hidden="true" />
                  <time dateTime={model.dataDate}>{model.readLine}</time>
                </span>
              </div>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-article-layout">
              <div className="ci-prose">
                <section className="ci-margin-block" aria-label={model.h1}>
                  <dl className="ci-facts">
                    {model.facts.map((fact) => (
                      <div key={fact.label} className="contents">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {model.slot.results ? (
                  // The official 29N file is imported: the slot becomes the page's first results section.
                  <section id="29n" aria-labelledby={id(model.slot.title)}>
                    <h2 id={id(model.slot.title)}>{model.slot.title}</h2>
                    <p>{model.slot.results.summary}</p>
                    <ResultsTable table={model.slot.results.table} />
                    {model.slot.md.map((text) => (
                      <p key={text}>{renderInline(text)}</p>
                    ))}
                  </section>
                ) : (
                  <section id="29n" aria-labelledby={id(model.slot.title)} className="ci-callout ci-callout-info">
                    <h2 id={id(model.slot.title)} className="!mt-0 font-sans text-base font-semibold">
                      {model.slot.title}
                    </h2>
                    <p className="mt-1">
                      <ElectionDayStatus lines={model.slot.lines} />
                    </p>
                    {model.slot.md.map((text) => (
                      <p key={text} className="mt-2">
                        {renderInline(text)}
                      </p>
                    ))}
                  </section>
                )}

                <h2 id={id(model.municipal.title)}>{model.municipal.title}</h2>
                <p>{model.municipal.summary}</p>
                <ResultsTable table={model.municipal.table} />
                <p>{model.municipal.mayorRule}</p>
                {model.municipal.mayor ? <p>{model.municipal.mayor}</p> : null}

                <h2 id={id(model.seats.title)}>{model.seats.title}</h2>
                {model.seats.md.map((text) => (
                  <p key={text}>{renderInline(text)}</p>
                ))}

                <h2 id={id(model.congress.title)}>{model.congress.title}</h2>
                <p>{model.congress.summary}</p>
                <ResultsTable table={model.congress.table} />

                <h2 id={id(model.parliament.title)}>{model.parliament.title}</h2>
                <p>{model.parliament.summary}</p>
                <ResultsTable table={model.parliament.table} />

                <h2 id={id(model.turnout.title)}>{model.turnout.title}</h2>
                <ResultsTable table={model.turnout.table} />

                <h2 id={id(model.census.title)}>{model.census.title}</h2>
                {model.census.md.map((text) => (
                  <p key={text}>{renderInline(text)}</p>
                ))}

                <h2 id={id(model.next.title)}>{model.next.title}</h2>
                {model.next.md.map((text) => (
                  <p key={text}>{renderInline(text)}</p>
                ))}

                <section>
                  <h2>{model.faqTitle}</h2>
                  <dl className="m-0">
                    {model.faq.map((item) => (
                      <div key={item.question} className="border-b border-[var(--color-rule)] py-4 last:border-b-0">
                        <dt className="font-semibold">{item.question}</dt>
                        <dd className="m-0 mt-1 text-[var(--color-ink-soft)]">{item.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <nav aria-labelledby="ci-elections-siblings">
                  <h2 id="ci-elections-siblings">{model.siblings.title}</h2>
                  {model.siblings.groups.map((group) => (
                    <div key={group.label} className="mt-3">
                      <p className="ci-label">{group.label}</p>
                      <ul className="mt-1 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                        {group.links.map((item) => (
                          <li key={item.href} className="!mt-0">
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <p className="mt-3">
                    <Link href={model.siblings.hub.href}>{model.siblings.hub.label}</Link>
                  </p>
                </nav>

                <nav aria-labelledby="ci-elections-related">
                  <h2 id="ci-elections-related">{model.related.title}</h2>
                  <ul>
                    {model.related.links.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <section className="mt-12">
                  <h2 className="font-sans text-base font-semibold">{model.sources.title}</h2>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{model.sources.note}</p>
                  <ol className="ci-sources mt-3">
                    {model.sources.items.map((source) => (
                      <li key={source.url}>
                        <span>
                          <a href={source.url} rel="noopener nofollow" target="_blank">
                            {source.name}
                          </a>
                          <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
                          <span className="ml-1 text-xs text-[var(--color-faint)]">({source.updated})</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="ci-article-aside hidden lg:block">
                <nav aria-labelledby="ci-toc">
                  <h2 id="ci-toc" className="ci-label mb-2 font-sans">
                    {getMessages(locale).meta.inThisPage}
                  </h2>
                  <ol className="m-0 list-none border-l border-[var(--color-rule)] p-0 text-sm">
                    {sections.map((title) => (
                      <li key={title} className="pl-3">
                        <a href={`#${id(title)}`} className="block py-1 no-underline">
                          {title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), electionDataset(municipality, locale, model.h1), faqSchema([faqBlock])])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/**
 * Same markup as the site's table block (stacked cards on a phone), but the
 * cells are plain text: list names are printed exactly as the source writes
 * them, never through the inline formatter.
 */
function ResultsTable({ table }: { table: Table }) {
  const cell = (value: string, j: number) => {
    if (j > 0) return value;
    const [short, ...rest] = value.split("\n");
    const name = rest.join(" ");
    return (
      <>
        <span className="font-semibold">{short}</span>
        {name && name !== short ? <small className="block text-[var(--color-muted)]">{name}</small> : null}
      </>
    );
  };
  return (
    <div className="ci-table-wrap">
      <table className="ci-table" role="table">
        <caption>{table.caption}</caption>
        <thead>
          <tr role="row">
            {table.headers.map((header) => (
              <th key={header} scope="col" role="columnheader">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...table.rows, ...table.footRows].map((row, i) => (
            <tr key={`${i}-${row[0]}`} role="row">
              {row.map((value, j) =>
                j === 0 ? (
                  <th key={j} scope="row" role="rowheader" className="min-w-[10rem] font-normal" data-label={table.headers[j]}>
                    {cell(value, j)}
                  </th>
                ) : (
                  <td key={j} role="cell" data-label={table.headers[j]} className="ci-numeric whitespace-nowrap">
                    {value}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[var(--color-rule)] px-3 py-2 text-xs text-[var(--color-muted)]">{table.note}</p>
    </div>
  );
}
