import type { Metadata } from "next";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  answerLines,
  civilNotes,
  civilRow,
  levelItems,
  levelsNote,
  meteocatParagraph,
  methodParagraphs,
  phaseParagraphs,
  readLine,
  relatedLinks,
  roadRow,
  roadsNotes,
  sources,
  weatherNotes,
  weatherRow,
  fill,
  words,
  type Cell,
} from "@/lib/programmatic/warnings/copy";
import { LEVEL_NAMES } from "@/lib/programmatic/warnings/names";
import { warningsMetadata } from "@/lib/programmatic/warnings/page";
import { warningsPath, warningsTranslations } from "@/lib/programmatic/warnings/paths";
import { loadWarnings } from "@/lib/programmatic/warnings/server";
import type { WarningsView } from "@/lib/programmatic/warnings/types";
import { groupRoads, splitWarnings } from "@/lib/programmatic/warnings/view";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

import { LinkList, Paragraphs, Sources } from "../rodalies/parts";

/**
 * "Avisos ara a Catalunya" / "Avisos hoy en Cataluña" / "Warnings in
 * Catalonia now". Server-rendered from one read of the three official
 * sources (lib/programmatic/warnings/server.ts), regenerated every five
 * minutes: every warning, plan and incident is in the HTML with the time it
 * was read. No client code.
 */

function crumbs(locale: Locale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: words(locale).crumb, href: warningsPath(locale) },
  ];
}

export function warningsRouteMetadata(locale: Locale): Metadata {
  return warningsMetadata(locale);
}

export async function WarningsRoute({ locale }: { locale: Locale }) {
  const view = await loadWarnings();
  return (
    <>
      <SiteHeader locale={locale} translations={warningsTranslations()} activeSection={null} />
      <main id="main">
        <WarningsArticle locale={locale} view={view} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs(locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

function CellContent({ cell }: { cell: Cell }) {
  if (cell.level) {
    return (
      <span className="ci-warn-level" data-level={cell.level}>
        {cell.text}
      </span>
    );
  }
  if (cell.href) {
    return (
      <a href={cell.href} rel="noopener nofollow" target="_blank">
        {cell.text}
      </a>
    );
  }
  return cell.lang ? <span lang={cell.lang}>{cell.text}</span> : <>{cell.text}</>;
}

function Table({ cols, rows, caption }: { cols: string[]; rows: Cell[][]; caption?: string }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} data-label={cols[i]}>
                  <CellContent cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ text, tone = "plain" }: { text: string | null; tone?: "plain" | "warn" }) {
  if (!text) return null;
  return <p className={tone === "warn" ? "ci-warn-note is-warn" : "ci-warn-note"}>{renderInline(text)}</p>;
}

function Source({ text }: { text: string }) {
  return <p className="ci-warn-source">{renderInline(text)}</p>;
}

function Weather({ locale, view }: { locale: Locale; view: WarningsView }) {
  const w = words(locale);
  const notes = weatherNotes(view, locale);
  if (view.weather.kind === "none") return <Note text={notes.failed} tone="warn" />;
  const { inForce, upcoming } = splitWarnings(view.weather.read.warnings, view.now);
  return (
    <>
      <Note text={notes.kept} tone="warn" />
      <h3 id="meteo-ara">{w.inForceTitle}</h3>
      {inForce.length > 0 ? <Table cols={w.weatherCols} rows={inForce.map((x) => weatherRow(x, locale))} caption={`${w.weatherTitle}: ${w.inForceTitle}`} /> : <Note text={notes.empty.inForce} />}
      <h3 id="meteo-previstos">{w.upcomingTitle}</h3>
      {upcoming.length > 0 ? <Table cols={w.weatherCols} rows={upcoming.map((x) => weatherRow(x, locale))} caption={`${w.weatherTitle}: ${w.upcomingTitle}`} /> : <Note text={notes.empty.upcoming} />}
      <Note text={notes.unread} tone="warn" />
      {locale !== "es" && inForce.length + upcoming.length > 0 ? <p className="ci-warn-note text-sm">{w.textInSpanish}</p> : null}
      <Source text={notes.source} />
    </>
  );
}

function Civil({ locale, view }: { locale: Locale; view: WarningsView }) {
  const w = words(locale);
  const notes = civilNotes(view, locale);
  if (view.civil.kind === "none") return <Note text={notes.failed} tone="warn" />;
  const plans = view.civil.read.plans;
  return (
    <>
      <Note text={notes.kept} tone="warn" />
      {plans.length > 0 ? <Table cols={w.civilCols} rows={plans.map((p) => civilRow(p, locale))} caption={w.civilTitle} /> : <Note text={notes.empty} />}
      <Source text={notes.source} />
    </>
  );
}

function Roads({ locale, view }: { locale: Locale; view: WarningsView }) {
  const w = words(locale);
  const notes = roadsNotes(view, locale);
  if (view.roads.kind === "none") return <Note text={notes.failed} tone="warn" />;
  const g = groupRoads(view.roads.read.incidents);
  return (
    <>
      <Note text={notes.kept} tone="warn" />
      <h3 id="transit-incidencies">{w.trafficTitle}</h3>
      {g.traffic.length > 0 ? <Table cols={w.trafficCols} rows={g.traffic.map((i) => roadRow(i, locale, view.now, true))} caption={w.trafficTitle} /> : <Note text={notes.emptyTraffic} />}
      <h3 id="transit-talls">{w.closuresTitle}</h3>
      {g.closures.length > 0 ? <Table cols={w.worksCols} rows={g.closures.map((i) => roadRow(i, locale, view.now, false))} caption={w.closuresTitle} /> : <Note text={notes.emptyClosures} />}
      {g.works.length > 0 ? (
        <>
          <h3 id="transit-obres">{w.worksTitle}</h3>
          <details className="ci-warn-details">
            <summary>{fill(w.worksSummary, { n: g.works.length })}</summary>
            <Table cols={w.worksCols} rows={g.works.map((i) => roadRow(i, locale, view.now, false))} caption={w.worksTitle} />
          </details>
        </>
      ) : null}
      <Note text={notes.language} />
      <Source text={notes.source} />
    </>
  );
}

/** The page body: synchronous and fetch-free (`view` comes in), so a test can render it. */
export function WarningsArticle({ locale, view }: { locale: Locale; view: WarningsView }) {
  const w = words(locale);
  const trail = crumbs(locale);
  const lines = answerLines(view, locale);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={trail} locale={locale} />
          <p className="ci-label mb-3 max-md:hidden">{w.kicker}</p>
          <h1 className="ci-measure">{w.h1}</h1>
          <div className="ci-measure ci-pvpc-answer mt-4 text-lg">
            {lines.map((line, i) => (
              <p key={line} className={i === 0 ? "m-0" : "m-0 mt-2 text-base"}>
                {renderInline(line)}
              </p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
            <span className="ci-verified">
              <span className="ci-verified-dot" aria-hidden="true" />
              <time dateTime={new Date(view.now).toISOString()}>{readLine(view, locale)}</time>
            </span>
          </div>
          <ShareBar locale={locale} path={crumbPath(trail)} title={w.h1} contentType="warnings" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="meteo" className="!mt-0">
            {w.weatherTitle}
          </h2>
          <Weather locale={locale} view={view} />

          <h2 id="proteccio-civil">{w.civilTitle}</h2>
          <Civil locale={locale} view={view} />

          <h2 id="transit">{w.roadsTitle}</h2>
          <Roads locale={locale} view={view} />

          <h2 id="nivells">{w.levelsTitle}</h2>
          <ul>
            {levelItems(locale).map((item) => (
              <li key={item.level}>
                <span className="ci-warn-level" data-level={item.level}>
                  {LEVEL_NAMES[locale][item.level]}
                </span>
                : {item.text}
              </li>
            ))}
          </ul>
          <p className="text-sm">{renderInline(levelsNote(locale))}</p>

          <h2 id="fases">{w.phasesTitle}</h2>
          <Paragraphs items={phaseParagraphs(locale)} />

          <h2 id="meteocat">{w.meteocatTitle}</h2>
          <Paragraphs items={[meteocatParagraph(locale)]} />

          <h2 id="com-funciona">{w.methodTitle}</h2>
          <Paragraphs items={methodParagraphs(locale)} />

          <LinkList title={w.related} id="ci-warnings-related" links={relatedLinks(locale)} />

          <Sources title={w.sourcesTitle} note={w.sourcesNote} items={sources(locale)} />
        </div>
        <ShareBar locale={locale} path={crumbPath(trail)} title={w.h1} contentType="warnings" variant="full" />
      </div>
    </article>
  );
}
