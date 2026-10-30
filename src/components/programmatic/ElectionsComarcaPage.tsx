import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { buildComarcaPage } from "@/lib/programmatic/elections/comarca";
import { comarcaPath, comarcaTranslations, hubMeta, hubPath, type ComarcaGroup, type ComarcaLocale } from "@/lib/programmatic/elections/pages";
import { electionComarcaDataset } from "@/lib/programmatic/elections/structured";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

export function electionComarcaCrumbs(locale: ComarcaLocale, g: ComarcaGroup): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubMeta(locale).h1, href: hubPath(locale) },
    { label: g.comarca, href: comarcaPath(locale, g.slug) },
  ];
}

/**
 * One comarca: every municipality's 2023 local result in a table (the list
 * with most councillors, how many, turnout), each row linking to the town's
 * page. Everything comes from the committed snapshot: no fetch, no clock.
 */
export function ElectionsComarcaPage({ locale, group }: { locale: ComarcaLocale; group: ComarcaGroup }) {
  const model = buildComarcaPage(group, locale);
  const crumbs = electionComarcaCrumbs(locale, group);
  const headers = model.table.headers;

  return (
    <>
      <SiteHeader locale={locale} translations={comarcaTranslations(group.slug)} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{model.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{model.lead}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
                <span className="ci-verified">
                  <span className="ci-verified-dot" aria-hidden="true" />
                  <time dateTime={model.dataDate}>{model.readLine}</time>
                </span>
              </div>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <dl className="ci-facts">
                {model.facts.map((fact) => (
                  <div key={fact.label} className="contents">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <h2 id="municipis">{model.tableTitle}</h2>
              <div className="ci-table-wrap">
                <table className="ci-table" role="table">
                  <caption>{model.table.caption}</caption>
                  <thead>
                    <tr role="row">
                      {headers.map((header) => (
                        <th key={header} scope="col" role="columnheader">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {model.table.rows.map((row) => (
                      <tr key={row.href} role="row">
                        <th scope="row" role="rowheader" className="min-w-[9rem] font-normal" data-label={headers[0]}>
                          <Link href={row.href}>{row.town}</Link>
                        </th>
                        <td role="cell" data-label={headers[1]} className="ci-numeric whitespace-nowrap">
                          {row.population}
                        </td>
                        <td role="cell" data-label={headers[2]}>
                          {row.leading}
                        </td>
                        <td role="cell" data-label={headers[3]} className="whitespace-nowrap">
                          {row.seats}
                        </td>
                        <td role="cell" data-label={headers[4]} className="ci-numeric whitespace-nowrap">
                          {row.turnout}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-[var(--color-rule)] px-3 py-2 text-xs text-[var(--color-muted)]">{model.table.note}</p>
              </div>

              {model.systems ? <p>{renderInline(model.systems)}</p> : null}
              <p>{model.general}</p>

              <h2 id="properes">{model.next.title}</h2>
              {model.next.md.map((text) => (
                <p key={text}>{renderInline(text)}</p>
              ))}

              <nav aria-labelledby="ci-elections-comarques">
                <h2 id="ci-elections-comarques">{model.others.title}</h2>
                <p className="text-sm">
                  {model.others.links.map((item, index) => (
                    <span key={item.href}>
                      {index > 0 ? " · " : ""}
                      <Link href={item.href}>{item.label}</Link>
                    </span>
                  ))}
                </p>
                <p className="mt-3">
                  <Link href={model.hub.href}>{model.hub.label}</Link>
                </p>
              </nav>

              <nav aria-labelledby="ci-elections-guides">
                <h2 id="ci-elections-guides">{model.guides.title}</h2>
                <ul>
                  {model.guides.links.map((item) => (
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
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), electionComarcaDataset(group, locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
