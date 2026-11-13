import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { CHART, chartGeometry } from "@/lib/programmatic/pvpc/chart";
import {
  PERIOD_NAME,
  bonoParagraphs,
  currentHourLine,
  dayAnswer,
  dstNote,
  hourRange,
  includesParagraphs,
  kwh,
  kwhUnit,
  longDate,
  missingTodayNote,
  notYetPublished,
  periodNotes,
  periodRows,
  publishParagraphs,
  quarterParagraphs,
  readLine,
  snapshotNote,
  sources,
  todayTeaser,
  tomorrowTeaser,
  versusYesterday,
  whatParagraphs,
  words,
} from "@/lib/programmatic/pvpc/copy";
import { pvpcDataset } from "@/lib/programmatic/pvpc/pages";
import { summarize, type DaySummary, type HourView } from "@/lib/programmatic/pvpc/periods";
import { pvpcPath, pvpcTranslations, type PvpcDayView } from "@/lib/programmatic/pvpc/paths";
import { currentHourIndex } from "@/lib/programmatic/pvpc/time";
import { publishedYesterdayAt, type PvpcView } from "@/lib/programmatic/pvpc/view";
import { todayPath } from "@/lib/programmatic/today/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

import { LinkList, Paragraphs, Sources } from "../rodalies/parts";

/**
 * "Precio de la luz hoy / mañana (PVPC)". Server-rendered from REE's answer
 * read by the route (lib/programmatic/pvpc/server.ts, every 15 minutes):
 * every price, the chart and the table are in the HTML. No client code, no
 * clock: the current hour is the hour of `view.renderedAt`.
 */

function crumbs(locale: Locale, which: PvpcDayView): Crumb[] {
  const w = words(locale);
  const base: Crumb[] = [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: w.crumb, href: pvpcPath(locale, "today") },
  ];
  return which === "today" ? base : [...base, { label: w.crumbTomorrow, href: pvpcPath(locale, "tomorrow") }];
}

function Chart({ summary, locale, current }: { summary: DaySummary; locale: Locale; current: number }) {
  const w = words(locale);
  const g = chartGeometry(summary.hours);
  const id = `ci-pvpc-chart-${summary.date}`;
  const labelled = new Set([summary.cheapest.index, summary.dearest.index]);
  return (
    <figure className="m-0 mt-4">
      <svg className="ci-pvpc-chart" viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{w.chartTitle(longDate(summary.date, locale))}</title>
        <desc id={`${id}-d`}>{`${w.cheapest}: ${hourRange(summary.cheapest, locale)}, ${kwhUnit(summary.cheapest.price, locale)}. ${w.dearest}: ${hourRange(summary.dearest, locale)}, ${kwhUnit(summary.dearest.price, locale)}. ${w.average}: ${kwhUnit(summary.average, locale)}.`}</desc>
        {g.ticks.map((t) => (
          <g key={t.value}>
            <line className="ci-pvpc-grid" x1={CHART.left} x2={CHART.width - CHART.right} y1={t.y} y2={t.y} />
            <text x={CHART.left - 6} y={t.y + 4} textAnchor="end">
              {locale === "en" ? t.value.toFixed(g.tickDecimals) : t.value.toFixed(g.tickDecimals).replace(".", ",")}
            </text>
          </g>
        ))}
        {g.bars.map((b) => {
          const h = summary.hours[b.index]!;
          return (
            <g key={b.index}>
              <path className={`ci-pvpc-${b.period}`} d={b.d}>
                <title>{`${hourRange(h, locale)}: ${kwhUnit(h.price, locale)} (${PERIOD_NAME[locale][h.period].toLowerCase()})`}</title>
              </path>
              {b.index === current ? <rect className="ci-pvpc-now" x={b.x - 1} y={b.y - 1} width={b.w + 2} height={b.h + 2} rx={3} /> : null}
              {labelled.has(b.index) ? (
                <text className="ci-pvpc-value" x={b.x + b.w / 2} y={b.y - 6} textAnchor="middle">
                  {kwh(h.price, locale)}
                </text>
              ) : null}
            </g>
          );
        })}
        {current >= 0 && !labelled.has(current) ? (
          <text className="ci-pvpc-value" x={g.bars[current]!.x + g.bars[current]!.w / 2} y={g.bars[current]!.y - 6} textAnchor="middle">
            {w.now}
          </text>
        ) : null}
        {g.xLabels.map((l) => (
          <text key={l.index} x={l.x} y={CHART.height - CHART.bottom + 16} textAnchor="middle">
            {l.text}
          </text>
        ))}
      </svg>
      <figcaption>
        <ul className="ci-pvpc-legend" aria-label={w.legend}>
          {(["valle", "llano", "punta"] as const).map((p) => (
            <li key={p}>
              <span className={`ci-pvpc-swatch ci-pvpc-${p}`} aria-hidden="true" />
              {PERIOD_NAME[locale][p]}
            </li>
          ))}
          {current >= 0 ? <li>{`▢ ${w.now}`}</li> : null}
        </ul>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{w.chartNote}</p>
      </figcaption>
    </figure>
  );
}

function HourTable({ summary, locale, current, system }: { summary: DaySummary; locale: Locale; current: number; system: "pcb" | "cym" }) {
  const w = words(locale);
  const cheap = new Set(summary.cheapest3.map((h) => h.index));
  const dear = new Set(summary.dearest3.map((h) => h.index));
  const priceOf = (h: HourView) => (system === "cym" ? h.cym! : h.price);
  const periodOf = (h: HourView) => (system === "cym" ? h.cymPeriod! : h.period);
  const note = dstNote(summary.hours.length, locale);
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-pvpc-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{system === "cym" ? `${w.cymTitle} · ${w.tableTitle(longDate(summary.date, locale))}` : w.tableTitle(longDate(summary.date, locale))}</caption>
        <thead>
          <tr>
            <th scope="col">{w.cols[0]}</th>
            <th scope="col" className="ci-numeric">
              {w.cols[1]}
            </th>
            <th scope="col">{w.cols[2]}</th>
          </tr>
        </thead>
        <tbody>
          {summary.hours.map((h) => (
            <tr key={h.index} className={h.index === current ? "ci-pvpc-current" : undefined} aria-current={h.index === current ? "time" : undefined}>
              <th scope="row" className="whitespace-nowrap">
                {hourRange(h, locale)}
                {h.index === current ? <span className="ci-pvpc-tag">{w.now}</span> : null}
              </th>
              <td className="ci-numeric">
                {kwh(priceOf(h), locale)}
                {h.index === summary.cheapest.index ? <span className="ci-pvpc-tag">{w.cheapestTag}</span> : null}
                {h.index === summary.dearest.index ? <span className="ci-pvpc-tag">{w.dearestTag}</span> : null}
                {h.index !== summary.cheapest.index && cheap.has(h.index) ? <span className="ci-pvpc-tag">↓</span> : null}
                {h.index !== summary.dearest.index && dear.has(h.index) ? <span className="ci-pvpc-tag">↑</span> : null}
              </td>
              <td>
                <span className={`ci-pvpc-swatch ci-pvpc-${periodOf(h)} mr-1 align-middle`} aria-hidden="true" />
                {PERIOD_NAME[locale][periodOf(h)]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {note ? <p className="mt-2 text-sm">{note}</p> : null}
    </div>
  );
}

function SummaryFacts({ summary, locale }: { summary: DaySummary; locale: Locale }) {
  const w = words(locale);
  const list = (hours: HourView[]) => hours.map((h) => `${hourRange(h, locale)} (${kwh(h.price, locale)})`).join(" · ");
  const periods = (["punta", "llano", "valle"] as const)
    .filter((p) => summary.periodAverage[p] !== undefined)
    .map((p) => `${PERIOD_NAME[locale][p]} ${kwh(summary.periodAverage[p]!, locale)}`)
    .join(" · ");
  return (
    <dl className="ci-facts">
      <div className="contents">
        <dt>{w.average}</dt>
        <dd>{kwhUnit(summary.average, locale)}</dd>
      </div>
      <div className="contents">
        <dt>{w.cheapest3}</dt>
        <dd>{list(summary.cheapest3)}</dd>
      </div>
      <div className="contents">
        <dt>{w.dearest3}</dt>
        <dd>{list(summary.dearest3)}</dd>
      </div>
      <div className="contents">
        <dt>{w.periodAvg}</dt>
        <dd>{`${periods} (€/kWh)`}</dd>
      </div>
    </dl>
  );
}

function relatedLinks(locale: Locale, which: PvpcDayView) {
  const w = words(locale);
  const other = which === "today" ? { label: w.tomorrowLink, href: pvpcPath(locale, "tomorrow") } : { label: w.todayLink, href: pvpcPath(locale, "today") };
  const today = { ca: "Avui a Catalunya", es: "Hoy en Cataluña", en: "Today in Catalonia" }[locale];
  return [other, { label: today, href: todayPath(locale) }];
}

export function PvpcPage({ locale, which, view }: { locale: Locale; which: PvpcDayView; view: PvpcView }) {
  return (
    <>
      <SiteHeader locale={locale} translations={pvpcTranslations(which)} activeSection={null} />
      <main id="main">
        <PvpcArticle locale={locale} which={which} view={view} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs(locale, which)), pvpcDataset(locale, which, view)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/** The page body: synchronous and database-free, so a test can render it to HTML. */
export function PvpcArticle({ locale, which, view }: { locale: Locale; which: PvpcDayView; view: PvpcView }) {
  const w = words(locale);
  const trail = crumbs(locale, which);
  const h1 = which === "today" ? w.h1Today : w.h1Tomorrow;
  const day = which === "today" ? view.today : view.tomorrow;
  const summary = day ? summarize(day) : null;
  const cym = day ? summarize(day, "cym") : null;
  const todaySummary = view.today ? summarize(view.today) : null;
  const tomorrowSummary = view.tomorrow ? summarize(view.tomorrow) : null;
  const yesterdaySummary = view.yesterday ? summarize(view.yesterday) : null;
  const latestSummary = !summary && which === "today" && view.latest ? summarize(view.latest) : null;
  const renderedMs = Date.parse(view.renderedAt);
  const current = which === "today" && day ? currentHourIndex(day.hours.map((h) => Date.parse(h.start)), renderedMs) : -1;
  const shown = summary ?? latestSummary;

  return (
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={trail} locale={locale} />
              <p className="ci-label mb-3 max-md:hidden">{w.kicker}</p>
              <h1 className="ci-measure">{h1}</h1>
              <div className="ci-measure ci-pvpc-answer mt-4 text-lg">
                {summary ? (
                  <>
                    <p className="m-0">{renderInline(dayAnswer(summary, locale, which))}</p>
                    {current >= 0 ? <p className="m-0 mt-2 text-base">{renderInline(currentHourLine(summary.hours[current]!, view.renderedAt, locale))}</p> : null}
                    {which === "today" && yesterdaySummary ? <p className="m-0 mt-2 text-base">{versusYesterday(summary, yesterdaySummary, locale)}</p> : null}
                  </>
                ) : which === "tomorrow" ? (
                  <p className="m-0">{renderInline(notYetPublished(view.tomorrowDate, publishedYesterdayAt(view), locale))}</p>
                ) : (
                  <p className="m-0">{renderInline(missingTodayNote(view.latest?.date ?? null, locale))}</p>
                )}
              </div>
              {which === "today" && summary ? <p className="ci-measure mt-3 text-base">{renderInline(tomorrowTeaser(tomorrowSummary, view.tomorrowDate, locale))}</p> : null}
              {which === "tomorrow" && !summary && todaySummary ? <p className="ci-measure mt-3 text-base">{renderInline(todayTeaser(todaySummary, locale))}</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
                {view.fetchedAt ? (
                  <span className="ci-verified">
                    <span className="ci-verified-dot" aria-hidden="true" />
                    <time dateTime={view.fetchedAt}>{readLine(view.fetchedAt, view.updated, locale)}</time>
                  </span>
                ) : null}
              </div>
              {view.source === "snapshot" && view.fetchedAt && which === "today" ? <p className="ci-measure mt-2 text-sm">{snapshotNote(view.fetchedAt, locale)}</p> : null}
              <ShareBar locale={locale} path={crumbPath(trail)} title={h1} contentType="pvpc" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {shown ? (
                <>
                  <h2 id="horas" className="!mt-0">
                    {w.tableTitle(longDate(shown.date, locale))}
                  </h2>
                  <Chart summary={shown} locale={locale} current={summary ? current : -1} />
                  <h3>{w.summaryTitle}</h3>
                  <SummaryFacts summary={shown} locale={locale} />
                  <HourTable summary={shown} locale={locale} current={summary ? current : -1} system="pcb" />
                  {cym && summary ? (
                    <>
                      <h2 id="ceuta-melilla">{w.cymTitle}</h2>
                      <p>{w.cymIntro}</p>
                      <HourTable summary={cym} locale={locale} current={current} system="cym" />
                    </>
                  ) : null}
                </>
              ) : null}

              <h2 id="publicacion" className={shown ? undefined : "!mt-0"}>
                {w.publishTitle}
              </h2>
              <Paragraphs items={publishParagraphs(locale)} />
              <p>
                <Link href={pvpcPath(locale, which === "today" ? "tomorrow" : "today")}>{which === "today" ? w.tomorrowLink : w.todayLink}</Link>
              </p>

              <h2 id="periodos">{w.periodsTitle}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      {w.periodsCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodRows(locale).map(([p, a, b]) => (
                      <tr key={p}>
                        <td className="whitespace-nowrap font-semibold">{p}</td>
                        <td>{a}</td>
                        <td>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paragraphs items={periodNotes(locale)} />

              <h2 id="pvpc">{w.whatTitle}</h2>
              <Paragraphs items={whatParagraphs(locale)} />

              <h2 id="incluye">{w.includesTitle}</h2>
              <Paragraphs items={includesParagraphs(locale)} />

              <h2 id="cuartohorario">{w.quarterTitle}</h2>
              <Paragraphs items={quarterParagraphs(locale)} />

              <h2 id="bono-social">{w.bonoTitle}</h2>
              <Paragraphs items={bonoParagraphs(locale)} />

              <LinkList title={w.related} id="ci-pvpc-related" links={relatedLinks(locale, which)} />

              <Sources title={w.sourcesTitle} note={w.sourcesNote} items={sources(locale)} />
            </div>
            <ShareBar locale={locale} path={crumbPath(trail)} title={h1} contentType="pvpc" variant="full" />
          </div>
        </article>
  );
}
