import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Block } from "@/lib/content/blocks";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { lineCopy, siblingLinks, stationConnections } from "@/lib/programmatic/rodalies/copy";
import { LINES, SNAPSHOT } from "@/lib/programmatic/rodalies/data";
import { officialUrl } from "@/lib/programmatic/rodalies/official";
import { hubPath, linePath, lineTranslations, type LineLocale } from "@/lib/programmatic/rodalies/paths";
import type { LineId, SnapshotLine } from "@/lib/programmatic/rodalies/types";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";

import { Compensation, Faq, LinkList, Paragraphs, Sources } from "./parts";
import { RodaliesLive } from "./RodaliesLive";

export function lineNames(): Record<string, string> {
  return Object.fromEntries(LINES.map((l) => [l.id, l.name]));
}

export function lineHrefs(locale: Locale): Partial<Record<LineId, string>> {
  if (locale === "en") return {};
  return Object.fromEntries(LINES.map((l) => [l.id, linePath(locale, l.id)]));
}

export function lineCrumbs(line: SnapshotLine, locale: LineLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: "Rodalies", href: hubPath(locale) },
    { label: line.name, href: linePath(locale, line.id) },
  ];
}

/**
 * One line's page. Everything in the server HTML comes from the committed
 * snapshot and the verified official links: no database, no fetch, no clock.
 * The notices are the browser's (RodaliesLive).
 */
export function LinePage({ line, locale }: { line: SnapshotLine; locale: LineLocale }) {
  const t = lineCopy(line, locale);
  const crumbs = lineCrumbs(line, locale);
  const sibling = siblingLinks(line.id, locale);
  const faqBlock = { type: "faq", items: t.faq } as Block;
  const toc = [
    { id: "avisos", label: t.liveTitle },
    { id: "estacions", label: t.stationsTitle },
    { id: "horaris", label: t.officialTitle },
    { id: "incidencies", label: t.disruptionTitle },
    { id: "reclamar", label: t.compensation.title },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={lineTranslations(line.id)} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <p className="ci-label mb-3 max-md:hidden">{t.kicker}</p>
              <h1 className="ci-measure">{t.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
                <span className="ci-verified">
                  <span className="ci-verified-dot" aria-hidden="true" />
                  <time dateTime={SNAPSHOT.readOn}>{t.readLine}</time>
                </span>
              </div>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-article-layout">
              <div className="ci-prose">
                <h2 id="avisos">{t.liveTitle}</h2>
                <RodaliesLive
                  locale={locale}
                  intlLocale={INTL_LOCALE[locale]}
                  line={line.id}
                  lineNames={lineNames()}
                  lineHrefs={lineHrefs(locale)}
                  statusUrl={officialUrl.status(locale)}
                />

                <section className="ci-margin-block" aria-label={line.name}>
                  <dl className="ci-facts">
                    {t.facts.map((fact) => (
                      <div key={fact.label} className="contents">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <h2 id="estacions">{t.stationsTitle}</h2>
                <p className="text-sm text-[var(--color-muted)]">{t.stationsNote}</p>
                <div className="ci-table-scroll mt-4">
                  <table className="ci-local-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.stationHeaders[0]}</th>
                        <th scope="col">{t.stationHeaders[1]}</th>
                        <th scope="col">{t.stationHeaders[2]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {line.stations.map((station) => (
                        <tr key={station.id}>
                          <td>{station.name}</td>
                          <td>{station.accessible ? t.yes : t.no}</td>
                          <td>{stationConnections(station, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 id="horaris">{t.officialTitle}</h2>
                <ul>
                  {t.official.map((text) => (
                    <li key={text}>{renderInline(text)}</li>
                  ))}
                </ul>

                <h2 id="incidencies">{t.disruptionTitle}</h2>
                <Paragraphs items={t.disruption} />

                <Compensation copy={t.compensation} id="reclamar" />

                <Faq title={t.faqTitle} items={t.faq} />

                <nav aria-labelledby="ci-rodalies-siblings">
                  <h2 id="ci-rodalies-siblings">{t.siblingsTitle}</h2>
                  {sibling.shared.length > 0 ? (
                    <div className="mt-3">
                      <p className="ci-label">{t.sharedLabel}</p>
                      <ul className="mt-1">
                        {sibling.shared.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {sibling.group.length > 0 ? (
                    <div className="mt-3">
                      <p className="ci-label">{t.groupLabel}</p>
                      <ul className="mt-1">
                        {sibling.group.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p className="mt-3">
                    <Link href={t.hubLink.href}>{t.hubLink.label}</Link>
                  </p>
                </nav>

                <LinkList title={t.relatedTitle} id="ci-rodalies-related" links={t.related} />

                <Sources title={t.sourcesTitle} note={t.sourcesNote} items={t.sources} />
              </div>

              <div className="ci-article-aside hidden lg:block">
                <nav aria-labelledby="ci-toc">
                  <h2 id="ci-toc" className="ci-label mb-2 font-sans">
                    {getMessages(locale).meta.inThisPage}
                  </h2>
                  <ol className="m-0 list-none border-l border-[var(--color-rule)] p-0 text-sm">
                    {toc.map((item) => (
                      <li key={item.id} className="pl-3">
                        <a href={`#${item.id}`} className="block py-1 no-underline">
                          {item.label}
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
      <JsonLd json={graph([breadcrumbSchema(crumbs), faqSchema([faqBlock])])} />
      <SiteFooter locale={locale} />
    </>
  );
}
