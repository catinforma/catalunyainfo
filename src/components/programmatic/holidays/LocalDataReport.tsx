import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CodeBox } from "@/components/programmatic/embed-2027/CodeBox";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { widgetPagePath } from "@/lib/programmatic/embed-2027/places";
import { attr } from "@/lib/programmatic/embed-2027/snippet";
import { SNAPSHOT, NEXT_YEAR } from "@/lib/programmatic/holidays/data";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { MONTHS, dayMonthYear, weekdayName, type DateLocale } from "@/lib/programmatic/holidays/format";
import { esName } from "@/lib/programmatic/holidays/names";
import { comarcaPath, hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import { CSV_PATH, nextYearReport, reportAsOf, reportCsv, thisYearReport, type DateStat } from "@/lib/programmatic/holidays/report";
import { ET_37, REPORT_COPY, dateLabel, int, pct, reportEditions, reportPath } from "@/lib/programmatic/holidays/report-copy";
import { breadcrumbSchema, graph, ORGANIZATION_ID } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, siteOrigin } from "@/lib/site";

/**
 * "Festius locals de Catalunya: els dies que més es repeteixen" — the data
 * report (lib/programmatic/holidays/report.ts): every figure computed from
 * the DOGC order the town pages use and, for 2027, the councils' own
 * approvals until the order is out. A ranked bar list (HTML, no script) with
 * its table, the weekday/month/comarca breakdowns, the CSV and how to cite it.
 */

const HUB_LABEL: Record<DateLocale, string> = { ca: "Festius locals", es: "Festivos locales", en: "Catalonia holidays" };
const CC_BY = "https://creativecommons.org/licenses/by/4.0/";

export function reportCrumbs(locale: DateLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_LABEL[locale], href: hubPath(locale) },
    { label: REPORT_COPY[locale].breadcrumb, href: reportPath(locale) },
  ];
}

export function reportMetadata(locale: DateLocale): Metadata {
  const t = REPORT_COPY[locale];
  return buildMetadata({ locale, path: reportPath(locale), title: t.title, description: t.description(thisYearReport()), translations: reportEditions() });
}

const townName = (name: string, locale: DateLocale) => (locale === "es" ? esName(name) : name);
const townHref = (slug: string, locale: DateLocale) => (locale === "en" ? municipalityPath(hasEnglishPage(slug) ? "en" : "ca", slug) : municipalityPath(locale, slug));
const comarcaHref = (slug: string, locale: DateLocale) => comarcaPath(locale === "en" ? "ca" : locale, slug);

/** Clean axis steps: 0, 50, 100, 150 for a maximum of 139. */
function ticks(max: number): number[] {
  const raw = max / 3;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((k) => k * pow).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

function BarList({ rows, locale, caption, unit }: { rows: DateStat[]; locale: DateLocale; caption: string; unit: string }) {
  const scale = ticks(Math.max(...rows.map((r) => r.towns)));
  const top = scale.at(-1)!;
  const at = (v: number) => `${(v / top) * 100}%`;
  return (
    <figure className="ci-viz">
      {/* The table below is the accessible view: every value as text. */}
      <ol className="ci-viz-bars" aria-hidden="true">
        {rows.map((r, i) => (
          <li key={r.date} className="ci-viz-row" title={`${dateLabel(r.date, locale)}: ${int(r.towns, locale)} ${unit}`}>
            <span className="ci-viz-label">{dateLabel(r.date, locale)}</span>
            <span className="ci-viz-track">
              {scale.slice(1).map((s) => (
                <span key={s} className="ci-viz-grid" style={{ left: at(s) }} />
              ))}
              <span className="ci-viz-bar block" style={{ width: at(r.towns) }}>
                {/* The extreme only: the axis and the table carry the rest. */}
                {i === 0 ? <span className="ci-viz-value">{int(r.towns, locale)}</span> : null}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="ci-viz-scale" aria-hidden="true">
        <span />
        <span className="ci-viz-ticks">
          {scale.map((s) => (
            <span key={s} style={{ left: at(s) }}>
              {int(s, locale)}
            </span>
          ))}
        </span>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function DateTable({ rows, locale, withName = false }: { rows: DateStat[]; locale: DateLocale; withName?: boolean }) {
  const c = REPORT_COPY[locale].cols;
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <thead>
          <tr>
            <th scope="col">{c.date}</th>
            {withName ? <th scope="col">{c.councilName}</th> : null}
            <th scope="col" className="ci-numeric">
              {c.towns}
            </th>
            <th scope="col" className="ci-numeric">
              {c.population}
            </th>
            <th scope="col">{c.largest}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date}>
              <th scope="row" className="font-normal">
                <time dateTime={r.date}>{dateLabel(r.date, locale)}</time>
              </th>
              {withName ? <td>{r.name ? `${r.name} (${int(r.nameCount ?? 0, locale)}/${int(r.towns, locale)})` : "—"}</td> : null}
              <td className="ci-numeric">{int(r.towns, locale)}</td>
              <td className="ci-numeric">{int(r.population, locale)}</td>
              <td>
                {r.largest.map((t, i) => (
                  <span key={t.slug}>
                    {i > 0 ? ", " : ""}
                    <Link href={townHref(t.slug, locale)}>{townName(t.name, locale)}</Link>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The CSV's data rows (the file minus its header line), for the download sentence. */
function csvRows(): number {
  return reportCsv().trim().split("\r\n").length - 1;
}

export function reportDataset(locale: DateLocale) {
  const r = thisYearReport();
  const t = REPORT_COPY[locale];
  const url = absoluteUrl(reportPath(locale));
  return {
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: t.h1(r, nextYearReport()),
    description: t.description(r),
    url,
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: { "@id": ORGANIZATION_ID },
    license: CC_BY,
    isBasedOn: [SNAPSHOT.sources.localOrder.url, ...SNAPSHOT.sources.localAmendments.map((a) => a.url), SNAPSHOT.sources.localOpenData.url, SNAPSHOT.sources.population.url, ...(NEXT_YEAR.order ? [NEXT_YEAR.order.url] : [])],
    spatialCoverage: { "@type": "Place", name: locale === "es" ? "Cataluña" : locale === "en" ? "Catalonia" : "Catalunya" },
    temporalCoverage: `${r.year}/${r.year + 1}`,
    dateModified: reportAsOf(),
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: absoluteUrl(CSV_PATH) }],
  };
}

export function ReportRoute({ locale }: { locale: DateLocale }) {
  const t = REPORT_COPY[locale];
  const r = thisYearReport();
  const n = nextYearReport();
  const crumbs = reportCrumbs(locale);
  const c = t.cols;
  const asOf = reportAsOf();
  const months = MONTHS[locale];
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  // A real date for each weekday name (5 to 11 January 2026 run Monday to Sunday).
  const weekdayNameOf = (w: number) => weekdayName(`2026-01-${String(4 + (w === 0 ? 7 : w)).padStart(2, "0")}`, locale);
  const cite = `<p>${attr(t.citeText)} <a href="${attr(siteOrigin() + reportPath(locale))}">${attr(t.title)}</a></p>`;
  const order = SNAPSHOT.sources.localOrder;
  const sources = [
    order,
    ...SNAPSHOT.sources.localAmendments,
    { name: SNAPSHOT.sources.localOpenData.name, ref: `${SNAPSHOT.sources.localOpenData.ref}, ${int(SNAPSHOT.sources.localOpenData.rows, locale)}`, url: SNAPSHOT.sources.localOpenData.url },
    SNAPSHOT.sources.population,
    ...(NEXT_YEAR.order ? [NEXT_YEAR.order] : []),
    { name: ET_37.name, ref: ET_37.ref, url: ET_37.url },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={reportEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{t.h1(r, n)}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead(r)}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                <time dateTime={asOf}>{t.readOn(dayMonthYear(asOf, locale))}</time>
              </p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <h2 id="xifres">{t.figuresTitle}</h2>
              <dl className="ci-report-figures">
                {t.figures(r).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <h2 id="mes-repetits">{t.topTitle(r.year)}</h2>
              <BarList rows={r.top} locale={locale} caption={t.chartCaption(r.year)} unit={c.towns.toLowerCase()} />
              <DateTable rows={r.top} locale={locale} />

              <h2 id="poblacio">{t.populationTitle}</h2>
              <p>{t.populationLead(r)}</p>
              <DateTable rows={r.topByPopulation} locale={locale} />

              <h2 id="setmana">{t.weekdayTitle}</h2>
              <p>{t.weekdayLead(r)}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{c.weekday}</th>
                      <th scope="col" className="ci-numeric">
                        {c.days}
                      </th>
                      <th scope="col" className="ci-numeric">
                        {c.share}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekdayOrder.map((w) => {
                      const days = r.byWeekday.find((x) => x.weekday === w)!.days;
                      return (
                        <tr key={w}>
                          <th scope="row" className="font-normal">
                            {weekdayNameOf(w)}
                          </th>
                          <td className="ci-numeric">{int(days, locale)}</td>
                          <td className="ci-numeric">{pct(days, r.ownDays, locale)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <h2 id="mesos">{t.monthTitle}</h2>
              <p>{t.monthLead(r)}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{c.month}</th>
                      <th scope="col" className="ci-numeric">
                        {c.days}
                      </th>
                      <th scope="col" className="ci-numeric">
                        {c.share}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.byMonth.map((m) => (
                      <tr key={m.month}>
                        <th scope="row" className="font-normal">
                          {months[m.month - 1]}
                        </th>
                        <td className="ci-numeric">{int(m.days, locale)}</td>
                        <td className="ci-numeric">{pct(m.days, r.ownDays, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="comarques">{t.comarcaTitle}</h2>
              <p>{t.comarcaLead}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{c.comarca}</th>
                      <th scope="col">{c.sharedDate}</th>
                      <th scope="col" className="ci-numeric">
                        {c.sharing}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.comarques.map((g) => (
                      <tr key={g.slug}>
                        <th scope="row" className="font-normal">
                          <Link href={comarcaHref(g.slug, locale)}>{g.comarca}</Link>
                        </th>
                        <td>{g.date ? <time dateTime={g.date}>{dateLabel(g.date, locale)}</time> : "—"}</td>
                        <td className="ci-numeric">
                          {int(g.sharing, locale)} / {int(g.towns, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="nuclis">{t.nucleiTitle}</h2>
              <p>{t.nucleiLead(r)}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{c.municipality}</th>
                      <th scope="col" className="ci-numeric">
                        {c.nuclei}
                      </th>
                      <th scope="col" className="ci-numeric">
                        {c.dates}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.mostDates.map((m) => (
                      <tr key={m.slug}>
                        <th scope="row" className="font-normal">
                          <Link href={townHref(m.slug, locale)}>{townName(m.name, locale)}</Link>
                        </th>
                        <td className="ci-numeric">{int(m.nuclei, locale)}</td>
                        <td className="ci-numeric">{int(m.dates, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="any-vinent">{t.nextTitle(n.year)}</h2>
              <p>{t.nextLead(n)}</p>
              <DateTable rows={n.top} locale={locale} withName={n.status === "council"} />
              <p>{t.nextNote(n)}</p>

              <h2 id="dades">{t.downloadTitle}</h2>
              <p>{t.downloadLead(csvRows(), r.year, n.year)}</p>
              <p>
                <a className="ci-btn ci-btn-primary" href={CSV_PATH} download>
                  {t.download}
                </a>
              </p>
              <h3>{t.columnsTitle}</h3>
              <ul>
                {t.columns.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p>
                {t.licence}{" "}
                <a href={CC_BY} rel="license noopener" target="_blank">
                  CC BY 4.0
                </a>
              </p>

              <h3 id="citar">{t.citeTitle}</h3>
              <p>{t.citeLead}</p>
              <CodeBox id="report-cite" label={t.citeCode} code={cite} copyLabel={t.copy} copiedLabel={t.copied} />

              <h2 id="al-teu-web">{t.embedTitle}</h2>
              <p>
                {t.embedLead} <Link href={widgetPagePath(locale)}>{t.embedLink}</Link>.
              </p>

              <h2 id="fonts">{t.sourcesTitle}</h2>
              <ul>
                {sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener" target="_blank">
                      {s.name}
                    </a>{" "}
                    ({s.ref})
                  </li>
                ))}
              </ul>
              <p>{t.etQuote}</p>

              <h2 id="metode">{t.methodTitle}</h2>
              <ul>
                {t.method.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <ShareBar locale={locale} path={reportPath(locale)} title={t.h1(r, n)} contentType="holidays_report" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), reportDataset(locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
