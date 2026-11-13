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
  breakdownNotes,
  breakdownRows,
  bonoParagraphs,
  buyNotes,
  buyParagraphs,
  calendarItems,
  calendarNote,
  historyNote,
  historyRows,
  islandsParagraphs,
  nextLine,
  operatorItems,
  rulesParagraphs,
  scopeParagraphs,
  sources,
  words,
} from "@/lib/programmatic/butane/copy";
import { BUTANE_CHECKED } from "@/lib/programmatic/butane/data";
import { butaneMetadata } from "@/lib/programmatic/butane/page";
import { butanePath, butaneTranslations } from "@/lib/programmatic/butane/paths";
import { bottleWithTax, butaneState } from "@/lib/programmatic/butane/rules";
import { butaneToday } from "@/lib/programmatic/butane/server";
import { calculatorsHubPath } from "@/lib/programmatic/calculators/paths";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

import { LinkList, Paragraphs, Sources } from "../rodalies/parts";

/**
 * "Precio de la bombona de butano hoy". Server-rendered from data.ts (the BOE
 * figures) for `day`, today in Madrid, read once by the route: the price, the
 * tax breakdown, the rules, the history table and the operators are all in
 * the HTML. No client code.
 */

function crumbs(locale: Locale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: words(locale).crumb, href: butanePath(locale) },
  ];
}

/** The "energía en casa" cluster: electricity price, petrol stations, calculators. */
export function relatedLinks(locale: Locale): { label: string; href: string }[] {
  return [
    { label: { es: "Precio de la luz hoy (PVPC)", ca: "Preu de la llum avui (PVPC)", en: "Electricity price today (PVPC)" }[locale], href: pvpcPath(locale, "today") },
    { label: { es: "Gasolineras más baratas hoy", ca: "Benzineres més barates avui", en: "Cheapest petrol stations today (in Spanish)" }[locale], href: fuelHubPath(locale === "ca" ? "ca" : "es") },
    { label: { es: "Calculadoras", ca: "Calculadores", en: "Calculators" }[locale], href: calculatorsHubPath(locale) },
  ];
}

export function butaneRouteMetadata(locale: Locale): Metadata {
  return butaneMetadata(locale, butaneToday());
}

export function ButaneRoute({ locale }: { locale: Locale }) {
  const day = butaneToday();
  return (
    <>
      <SiteHeader locale={locale} translations={butaneTranslations()} activeSection={null} />
      <main id="main">
        <ButaneArticle locale={locale} day={day} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs(locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

function Table({ cols, rows, numeric = [] }: { cols: string[]; rows: (string | { text: string; href: string })[][]; numeric?: number[] }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={c} scope="col" className={numeric.includes(i) ? "ci-numeric" : undefined}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} data-label={cols[i]} className={numeric.includes(i) ? "ci-numeric whitespace-nowrap" : undefined}>
                  {typeof cell === "string" ? (
                    cell
                  ) : (
                    <a href={cell.href} rel="noopener" target="_blank">
                      {cell.text}
                    </a>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The page body: synchronous, database- and clock-free (`day` comes in), so a test can render it. */
export function ButaneArticle({ locale, day }: { locale: Locale; day: string }) {
  const w = words(locale);
  const trail = crumbs(locale);
  const state = butaneState(day);
  const shown = state.kind === "current" ? state.current : state.last;
  const taxed = state.kind === "current" ? bottleWithTax(state.current.centsPerKg, day) : null;

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={trail} locale={locale} />
          <p className="ci-label mb-3 max-md:hidden">{w.kicker}</p>
          <h1 className="ci-measure">{w.h1}</h1>
          <div className="ci-measure ci-pvpc-answer mt-4 text-lg">
            {answerLines(locale, state, day).map((line, i) => (
              <p key={line} className={i === 0 ? "m-0" : "m-0 mt-2 text-base"}>
                {renderInline(line)}
              </p>
            ))}
          </div>
          <p className="ci-measure mt-3 text-base">{renderInline(nextLine(locale, state))}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
            <span className="ci-verified">
              <span className="ci-verified-dot" aria-hidden="true" />
              <time dateTime={BUTANE_CHECKED}>{w.checked(BUTANE_CHECKED)}</time>
            </span>
          </div>
          <ShareBar locale={locale} path={crumbPath(trail)} title={w.h1} contentType="butane" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          {taxed ? (
            <>
              <h2 id="desglose" className="!mt-0">
                {w.breakdownTitle}
              </h2>
              <Table cols={w.breakdownCols} rows={breakdownRows(locale, taxed)} numeric={[1]} />
              <Paragraphs items={breakdownNotes(locale, taxed)} />
            </>
          ) : null}

          <h2 id="revision" className={taxed ? undefined : "!mt-0"}>
            {w.rulesTitle}
          </h2>
          <Paragraphs items={rulesParagraphs(locale, state)} />

          <h3 id="calendario">{w.calendarTitle}</h3>
          <ul>
            {calendarItems(locale, day).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm">{calendarNote(locale)}</p>

          <h2 id="historial">{w.historyTitle}</h2>
          <Table
            cols={w.historyCols}
            rows={historyRows(locale, day).map((r) => [r.since, r.product, r.price, r.change, r.bottle, { text: r.boe, href: r.boeUrl }])}
            numeric={[2, 3, 4]}
          />
          <p className="text-sm">{renderInline(historyNote(locale))}</p>

          <h2 id="que-bombonas">{w.scopeTitle}</h2>
          <Paragraphs items={scopeParagraphs(locale)} />

          <h2 id="donde-comprar">{w.buyTitle}</h2>
          <Paragraphs items={buyParagraphs(locale)} />
          <ul>
            {operatorItems(locale).map((item) => (
              <li key={item}>{renderInline(item)}</li>
            ))}
          </ul>
          <Paragraphs items={buyNotes(locale)} />

          <h2 id="bono-social-termico">{w.bonoTitle}</h2>
          <Paragraphs items={bonoParagraphs(locale)} />

          <h2 id="canarias-ceuta-melilla">{w.islandsTitle}</h2>
          <Paragraphs items={islandsParagraphs(locale)} />

          <LinkList title={w.related} id="ci-butane-related" links={relatedLinks(locale)} />

          <Sources title={w.sourcesTitle} note={w.sourcesNote} items={sources(locale, shown)} />
        </div>
        <ShareBar locale={locale} path={crumbPath(trail)} title={w.h1} contentType="butane" variant="full" />
      </div>
    </article>
  );
}
