import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { TownHub } from "@/components/TownHub";
import { ShareBar } from "@/components/share/ShareBar";
import { getMessages } from "@/lib/i18n";
import { townHub } from "@/lib/engagement/town-hub";
import { currentOption } from "@/lib/programmatic/weekly-markets/answer";
import { answerSentence, answerZones, townView } from "@/lib/programmatic/weekly-markets/copy";
import { numericDate } from "@/lib/programmatic/weekly-markets/format";
import { type Clock } from "@/lib/programmatic/weekly-markets/logic";
import { marketsHubPath, marketsTownPath, MARKET_TOWN_SLUGS } from "@/lib/programmatic/weekly-markets/paths";
import { TOWNS } from "@/lib/programmatic/weekly-markets/data";
import type { MarketSource, MarketTown, MkLocale } from "@/lib/programmatic/weekly-markets/types";

import { NextMarket } from "./NextMarket";

export const HUB_CRUMB: Record<MkLocale, string> = { ca: "Mercats setmanals", es: "Mercados semanales", en: "Weekly markets" };

export function hubCrumbs(locale: MkLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: marketsHubPath(locale) },
  ];
}

export function townCrumbs(town: MarketTown, locale: MkLocale): Crumb[] {
  return [...hubCrumbs(locale), { label: town.name[locale], href: marketsTownPath(locale, town.slug) }];
}

const SOURCE_WORD: Record<MkLocale, { read: string }> = {
  ca: { read: "llegida el" },
  es: { read: "leída el" },
  en: { read: "read on" },
};

export function SourceList({ title, sources, locale, note }: { title: string; sources: readonly MarketSource[]; locale: MkLocale; note: string }) {
  return (
    <section className="mt-12" aria-labelledby="fonts">
      <h2 id="fonts" className="font-sans text-base font-semibold">
        {title}
      </h2>
      <ol className="ci-sources mt-3">
        {sources.map((s, i) => (
          <li key={s.id} id={`src-${i + 1}`}>
            <span>
              <a href={s.url} rel="noopener nofollow" target="_blank">
                {s.name}
              </a>
              <span className="text-[var(--color-muted)]">
                {" "}
                — {s.publisher}, {SOURCE_WORD[locale].read} {numericDate(s.readOn, locale)}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{note}</p>
    </section>
  );
}

function Refs({ ids, sources }: { ids: readonly string[]; sources: readonly MarketSource[] }) {
  const numbers = ids.map((id) => sources.findIndex((s) => s.id === id) + 1).filter((n) => n > 0);
  return (
    <sup className="ml-0.5 whitespace-nowrap text-xs">
      {numbers.map((n, i) => (
        <span key={n}>
          {i > 0 ? ", " : ""}
          <a href={`#src-${n}`}>{n}</a>
        </span>
      ))}
    </sup>
  );
}

/** One town's weekly markets: the next session, the table of markets, the dated exceptions and what tells the weekly market from a fair. */
export function TownPage({ town, locale, clock }: { town: MarketTown; locale: MkLocale; clock: Clock }) {
  const v = townView(town, clock, locale);
  const zones = answerZones(town, clock, locale);
  const first = zones[0]!;
  const path = marketsTownPath(locale, town.slug);
  const others = TOWNS.filter((t) => t.slug !== town.slug && (MARKET_TOWN_SLUGS as readonly string[]).includes(t.slug));
  const noticeNeeded = currentOption(first.options, clock.iso, clock.hhmm)?.notice ?? false;

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={townCrumbs(town, locale)} locale={locale} />
          <h1 className="ci-measure">{v.h1}</h1>
          <div className="ci-measure mt-3">
            <NextMarket
              locale={locale}
              zones={zones}
              initialText={answerSentence(first, clock, locale)}
              initialNotice={noticeNeeded}
              pickerLabel={v.zonePicker}
              noticeLabel={v.noticeLink}
              noticeHref={town.noticeUrl}
            />
          </div>
          <ShareBar locale={locale} path={path} title={v.h1} contentType="weekly_markets_town" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="mercats">{v.headings.markets}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{v.checked}</caption>
              <thead>
                <tr>
                  {[v.cols.market, v.cols.where, v.cols.days, v.cols.hours, v.cols.next].map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.rows.map((row, i) => (
                  <tr key={row.id}>
                    <th scope="row">
                      {row.market}
                      <Refs ids={town.markets[i]!.src.filter((s) => !s.endsWith("census"))} sources={town.sources} />
                    </th>
                    <td>{row.where}</td>
                    <td>{row.days}</td>
                    <td>
                      {row.hours}
                      {row.hoursNote ? <span className="block text-xs text-[var(--color-muted)]">{row.hoursNote}</span> : null}
                    </td>
                    <td>{row.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 id="festius">{v.headings.exceptions}</h2>
          {v.exceptions.length === 0 ? (
            <p>{v.noExceptions}</p>
          ) : (
            <ul>
              {v.exceptions.map((ex) => (
                <li key={ex.id}>
                  {ex.text}
                  {ex.needsConfirmation ? <> {v.confirmNote}</> : null}
                </li>
              ))}
            </ul>
          )}
          <p>
            <a href={town.noticeUrl} rel="noopener nofollow" target="_blank">
              {v.noticeLink}
            </a>
          </p>

          {v.related.length > 0 ? (
            <>
              <h2 id="no-es-el-mercat-setmanal">{v.headings.related}</h2>
              {v.related.map((e) => (
                <section key={e.id}>
                  <p>{e.difference}</p>
                  <p>
                    <a href={e.url} rel="noopener nofollow" target="_blank">
                      {e.name}
                    </a>
                    {" — "}
                    {e.dates}, {e.hours}.
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">{e.note}</p>
                </section>
              ))}
            </>
          ) : null}

          <h2 id="preguntes">{v.headings.faq}</h2>
          {v.faq.map((item) => (
            <section key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}

          <h2 id="cens">{v.headings.census}</h2>
          <ul>
            {v.census.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <TownHub hub={townHub(town.slug, locale, "markets", clock.iso)} />

          <p className="mt-6 text-sm">
            <Link href={marketsHubPath(locale)}>{HUB_CRUMB[locale]}</Link>
            {others.map((o) => (
              <span key={o.slug}>
                {" · "}
                <Link href={marketsTownPath(locale, o.slug)}>{o.name[locale]}</Link>
              </span>
            ))}
          </p>

          <SourceList title={v.headings.sources} sources={town.sources} locale={locale} note={v.checked} />

          <ShareBar locale={locale} path={path} title={v.h1} contentType="weekly_markets_town" variant="full" />
        </div>
      </div>
    </article>
  );
}
