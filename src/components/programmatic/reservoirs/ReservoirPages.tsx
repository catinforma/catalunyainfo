import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Block } from "@/lib/content/blocks";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  droughtParagraphs,
  facts,
  faq,
  hubCopy,
  readParagraphs,
  relatedLinks,
  reservoirH1,
  reservoirLead,
  reservoirLinkLabel,
  sources,
  thresholdTables,
  trendParagraphs,
  usesParagraph,
  words,
} from "@/lib/programmatic/reservoirs/copy";
import { RESERVOIR_DATA, SNAPSHOT, siblingsOf, snapshotReadings } from "@/lib/programmatic/reservoirs/data";
import { formatDate, formatNumber } from "@/lib/programmatic/reservoirs/live";
import { OFFICIAL, indicatorsOf, officialUrl } from "@/lib/programmatic/reservoirs/official";
import { reservoirHubPath, reservoirHubTranslations, reservoirPath, reservoirTranslations } from "@/lib/programmatic/reservoirs/paths";
import type { SnapshotReservoir } from "@/lib/programmatic/reservoirs/types";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";

import { Faq, LinkList, Paragraphs, Sources } from "../rodalies/parts";
import { IndicatorVolumes, ReservoirReading, ReservoirTable } from "./ReservoirLive";

/**
 * Server-rendered pages of the reservoir family. Everything in the HTML comes
 * from the committed snapshot and the verified official facts: no database,
 * no fetch, no clock. Today's reading is the browser's (ReservoirLive).
 */

export function hubCrumbs(locale: Locale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubCopy(locale).crumb, href: reservoirHubPath(locale) },
  ];
}

export function reservoirCrumbs(r: SnapshotReservoir, locale: Locale): Crumb[] {
  return [...hubCrumbs(locale), { label: r.name.charAt(0).toUpperCase() + r.name.slice(1), href: reservoirPath(locale, r.slug) }];
}

function Header({ crumbs, locale, kicker, h1, lead }: { crumbs: Crumb[]; locale: Locale; kicker: string; h1: string; lead: string }) {
  const w = words(locale);
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
      <div className="ci-shell py-5 md:py-8 lg:py-12">
        <Breadcrumbs items={crumbs} locale={locale} />
        <p className="ci-label mb-3 max-md:hidden">{kicker}</p>
        <h1 className="ci-measure">{h1}</h1>
        <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
          <span className="ci-verified">
            <span className="ci-verified-dot" aria-hidden="true" />
            <time dateTime={SNAPSHOT.readOn}>{w.readLine}</time>
          </span>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* One reservoir                                                              */
/* -------------------------------------------------------------------------- */

export function ReservoirPage({ reservoir: r, locale }: { reservoir: SnapshotReservoir; locale: Locale }) {
  const w = words(locale);
  const o = OFFICIAL[r.slug];
  const crumbs = reservoirCrumbs(r, locale);
  const items = faq(r, locale);
  const faqBlock = { type: "faq", items } as Block;
  const drought = droughtParagraphs(r, locale);
  const tables = thresholdTables(r.slug, locale);
  const sib = siblingsOf(r.slug);
  const own = snapshotReadings();
  const pctSign = locale === "en" ? "%" : " %";
  const toc = [
    { id: "avui", label: w.today },
    { id: "fitxa", label: w.facts },
    { id: "any", label: w.year },
    { id: "usos", label: w.uses },
    { id: "sequera", label: w.drought },
    { id: "dades", label: w.read },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={reservoirTranslations(r.slug)} activeSection={null} />
      <main id="main">
        <article>
          <Header crumbs={crumbs} locale={locale} kicker={w.kicker} h1={reservoirH1(r, locale)} lead={reservoirLead(r, locale)} />

          <div className="ci-shell py-10">
            <div className="ci-article-layout">
              <div className="ci-prose">
                <h2 id="avui" className="!mt-0">
                  {w.today}
                </h2>
                <ReservoirReading locale={locale} slug={r.slug} own={own} capacity={o.capacity} officialUrl={officialUrl.reserves(locale)} />

                <h2 id="fitxa">{w.facts}</h2>
                <section className="ci-margin-block" aria-labelledby="fitxa">
                  <dl className="ci-facts">
                    {facts(r, locale).map((fact) => (
                      <div key={fact.label} className="contents">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <h2 id="any">{w.year}</h2>
                <Paragraphs items={trendParagraphs(r, locale)} />
                <div className="ci-table-scroll mt-4">
                  <table className="ci-local-table ci-reservoirs-table">
                    <thead>
                      <tr>
                        <th scope="col">{w.monthCols[0]}</th>
                        <th scope="col">{w.monthCols[1]}</th>
                        <th scope="col">{w.monthCols[2]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.trend.monthly.map((m) => (
                        <tr key={m.date}>
                          <th scope="row">
                            <time dateTime={m.date}>{formatDate(m.date, locale)}</time>
                          </th>
                          <td className="ci-numeric">
                            <span className="ci-reservoirs-bar inline-block w-16 align-middle" style={{ margin: "0 0.5rem 0 0" }} aria-hidden="true">
                              <span style={{ width: `${Math.min(100, m.percent)}%` }} />
                            </span>
                            {`${formatNumber(m.percent, locale)}${pctSign}`}
                          </td>
                          <td className="ci-numeric">{formatNumber(m.volume, locale, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 id="usos">{w.uses}</h2>
                <p>{usesParagraph(r, locale)}</p>
                <p className="text-sm">
                  <a href={officialUrl.damsPage(locale, o.damsAnchor)} rel="noopener" target="_blank">
                    {w.officialDam}
                  </a>
                </p>

                <h2 id="sequera">{w.drought}</h2>
                <Paragraphs items={drought.before} />
                {tables.map((table) => (
                  <div key={table.key} className="ci-table-scroll mt-4">
                    <table className="ci-local-table">
                      <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{table.caption}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{w.thresholdCols[0]}</th>
                          <th scope="col">{w.thresholdCols[1]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row) => (
                          <tr key={row.stage}>
                            <td className="whitespace-nowrap font-semibold">{row.stage}</td>
                            <td>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {tables.length > 0 ? (
                  <div className="mt-4">
                    <IndicatorVolumes locale={locale} own={own} indicators={indicatorsOf(r.slug).map((i) => ({ key: i.key, reservoirs: i.reservoirs }))} />
                  </div>
                ) : null}
                <Paragraphs items={drought.after} />

                <h2 id="dades">{w.read}</h2>
                <Paragraphs items={readParagraphs(locale)} />

                <Faq title={w.faq} items={items} />

                <nav aria-labelledby="ci-reservoir-siblings">
                  <h2 id="ci-reservoir-siblings">{w.siblings}</h2>
                  {(
                    [
                      [w.system, sib.system],
                      [w.network, sib.network],
                      [w.others, sib.others],
                    ] as const
                  ).map(([label, list]) =>
                    list.length > 0 ? (
                      <div key={label} className="mt-3">
                        <p className="ci-label">{label}</p>
                        <ul className="mt-1">
                          {list.map((s) => (
                            <li key={s.slug}>
                              <Link href={reservoirPath(locale, s.slug)}>{reservoirLinkLabel(s, locale)}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null,
                  )}
                  <p className="mt-3">
                    <Link href={reservoirHubPath(locale)}>{w.hub}</Link>
                  </p>
                </nav>

                <LinkList title={w.related} id="ci-reservoir-related" links={relatedLinks(locale)} />

                <Sources title={w.sources} note={w.sourcesNote} items={sources(locale)} />
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

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export function ReservoirHubPage({ locale }: { locale: Locale }) {
  const t = hubCopy(locale);
  const w = words(locale);
  const crumbs = hubCrumbs(locale);
  const rows = RESERVOIR_DATA.map((r) => ({
    slug: r.slug,
    name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    href: reservoirPath(locale, r.slug),
    river: OFFICIAL[r.slug].river[locale],
    capacity: OFFICIAL[r.slug].capacity,
  }));

  return (
    <>
      <SiteHeader locale={locale} translations={reservoirHubTranslations()} activeSection={null} />
      <main id="main">
        <Header crumbs={crumbs} locale={locale} kicker={w.kicker} h1={t.h1} lead={t.lead} />
        <div className="ci-shell py-10">
          <div className="ci-prose">
            <h2 id="nivell" className="!mt-0">
              {t.tableTitle}
            </h2>
            <ReservoirTable locale={locale} rows={rows} own={snapshotReadings()} ownDate={SNAPSHOT.latestDate} officialUrl={officialUrl.reserves(locale)} />

            <nav aria-labelledby="ci-reservoir-pages">
              <h2 id="ci-reservoir-pages">{w.hub}</h2>
              <ul>
                {RESERVOIR_DATA.map((r) => (
                  <li key={r.slug}>
                    <Link href={reservoirPath(locale, r.slug)}>{reservoirLinkLabel(r, locale)}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <h2 id="quins">{t.aboutTitle}</h2>
            {t.about.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="ebre">{t.ebroTitle}</h2>
            <Paragraphs items={t.ebro} />

            <LinkList title={w.related} id="ci-reservoir-related" links={relatedLinks(locale)} />

            <Sources title={w.sources} note={w.sourcesNote} items={sources(locale)} />
          </div>
        </div>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
