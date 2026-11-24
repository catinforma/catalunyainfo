import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { BOE_ORDER_URL, GEOPORTAL_HOME, attribution, liveLabels, readLine } from "@/lib/programmatic/fuel/copy";
import { MUNICIPALITIES } from "@/lib/programmatic/fuel/data";
import { splitFecha } from "@/lib/programmatic/fuel/live";
import { fuelHubPath, fuelPath, spainHubPath, spainProvincePath, type FuelHubLocale } from "@/lib/programmatic/fuel/paths";
import { SPAIN_SNAPSHOT, allProvinces, centsVsNational, spainProvinces, type FuelStats, type PriceStats, type SpainProvince, type SpainSummary } from "@/lib/programmatic/fuel/spain";
import {
  INE_PROVINCES_URL,
  ineProvincesName,
  priceText,
  provinceLabel,
  spainHubFaq,
  spainHubLead,
  spainHubMeta,
  spainLabels,
  spainProvinceFaq,
  spainProvinceH1,
  spainProvinceLead,
  spainServiceName,
  townText,
  type Faq,
} from "@/lib/programmatic/fuel/spain-copy";
import { SPAIN_API_URLS, SPAIN_FUELS, type SpainFuel } from "@/lib/programmatic/fuel/spain-upstream";

import { DriverGuides, Guidance } from "./parts";

/**
 * The Spain pages of the fuel family (21 Nov 2026): one per province outside
 * Catalonia and the table of all 52. Server HTML only, no client component:
 * every figure is printed at render from the Ministry's national list
 * (spain-server.ts), with the Ministry's own time, and the route regenerates
 * every half hour. Without a list under a day old nothing priced is printed,
 * only where to look (the Geoportal) and the snapshot's station counts.
 */

const fill = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));

/** A Catalan province's page: its own (ca, es), or the English Catalonia hub's area table. */
function cataloniaHref(p: SpainProvince, locale: FuelHubLocale): string {
  return locale === "en" ? `${fuelHubPath("en")}#per-zona` : fuelPath(locale, "province", p.slug);
}

export function provinceHref(p: SpainProvince, locale: FuelHubLocale): string {
  return p.catalan ? cataloniaHref(p, locale) : spainProvincePath(locale, p.slug);
}

export function spainHubCrumbs(locale: FuelHubLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: spainHubMeta(locale).crumb, href: spainHubPath(locale) },
  ];
}

export function spainProvinceCrumbs(p: SpainProvince, locale: FuelHubLocale): Crumb[] {
  return [...spainHubCrumbs(locale), { label: provinceLabel(p, locale), href: spainProvincePath(locale, p.slug) }];
}

function ReadStamp({ summary, locale }: { summary: SpainSummary | null; locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
      {summary ? (
        <span className="ci-verified">
          <span className="ci-verified-dot" aria-hidden="true" />
          <time dateTime={summary.updated ?? undefined}>{fill(l.read, splitFecha(summary.fecha))}</time>
        </span>
      ) : null}
      <span>
        <time dateTime={SPAIN_SNAPSHOT.readOn}>{readLine(SPAIN_SNAPSHOT.readOn, locale)}</time>
      </span>
    </div>
  );
}

/** What the page says instead of prices: the Ministry's map, never an old figure. */
function NoPrices({ locale }: { locale: FuelHubLocale }) {
  const live = liveLabels(locale);
  const [before, after = ""] = live.failed.split(live.geoportal);
  return (
    <p className="ci-callout ci-callout-warning">
      {before}
      <a href={GEOPORTAL_HOME} rel="noopener nofollow" target="_blank">
        {live.geoportal}
      </a>
      {after}
    </p>
  );
}

function OldWarning({ summary, locale }: { summary: SpainSummary; locale: FuelHubLocale }) {
  if (summary.fresh !== "old") return null;
  const { date, time } = splitFecha(summary.fecha);
  return <p className="ci-callout ci-callout-warning">{fill(liveLabels(locale).old, { when: `${date} ${time}`.trim() })}</p>;
}

function FaqSection({ faq, locale }: { faq: Faq[]; locale: FuelHubLocale }) {
  return (
    <section aria-labelledby="preguntes">
      <h2 id="preguntes">{spainLabels(locale).faq}</h2>
      {faq.map((f) => (
        <section key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </section>
      ))}
    </section>
  );
}

function SpainSources({ locale }: { locale: FuelHubLocale }) {
  const prices = MUNICIPALITIES.sources.prices;
  const heading = { es: "Fuentes", ca: "Fonts", en: "Sources" }[locale];
  const items = [
    { name: prices.name, publisher: prices.publisher, url: prices.url },
    { name: spainServiceName(locale), publisher: prices.publisher, url: SPAIN_API_URLS[0] },
    { name: "Geoportal Gasolineras", publisher: prices.publisher, url: GEOPORTAL_HOME },
    { name: "Orden ITC/2308/2007, de 25 de julio", publisher: "BOE", url: BOE_ORDER_URL },
    { name: ineProvincesName(locale), publisher: "INE", url: INE_PROVINCES_URL },
  ];
  return (
    <section className="mt-12" aria-labelledby="ci-fuel-sources">
      <h2 id="ci-fuel-sources" className="font-sans text-base font-semibold">
        {heading}
      </h2>
      <p className="mt-1 text-sm">{renderInline(attribution(locale, prices.url))}</p>
      <ol className="ci-sources mt-3">
        {items.map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} rel="noopener nofollow" target="_blank">
                {source.name}
              </a>
              <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const cellPrice = (p: PriceStats | undefined, key: "min" | "median", locale: FuelHubLocale) => (p ? priceText(p[key], locale) : "—");

/* -------------------------------------------------------------------------- */
/* One province                                                               */
/* -------------------------------------------------------------------------- */

function SummaryTable({ p, summary, locale }: { p: SpainProvince; summary: SpainSummary; locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  const stats = summary.provinces[p.code];
  const rows = SPAIN_FUELS.flatMap((fuel) => {
    const here = stats?.fuels[fuel];
    const all = summary.national.fuels[fuel];
    return here && all ? [{ fuel, here, all, cents: centsVsNational(summary, p.code, fuel) }] : [];
  });
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="avui">
      <h2 id="avui" className="!mt-0">
        {l.summaryTitle}
      </h2>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{fill(l.summaryCaption, splitFecha(summary.fecha))}</caption>
          <thead>
            <tr>
              <th scope="col">{l.summaryCols.fuel}</th>
              <th scope="col" className="text-right">
                {l.summaryCols.min}
              </th>
              <th scope="col" className="text-right">
                {l.summaryCols.median}
              </th>
              <th scope="col" className="text-right">
                {l.summaryCols.national}
              </th>
              <th scope="col" className="text-right">
                {l.summaryCols.diff}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.fuel}>
                <th scope="row">{l.fuelNames[r.fuel]}</th>
                <td className="text-right font-semibold tabular-nums">{priceText(r.here.min, locale)}</td>
                <td className="text-right tabular-nums">{priceText(r.here.median, locale)}</td>
                <td className="text-right tabular-nums">{priceText(r.all.median, locale)}</td>
                <td className="text-right whitespace-nowrap tabular-nums">{r.cents === null ? "—" : l.cents(r.cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CheapestTable({ fuel, stats, locale }: { fuel: SpainFuel; stats: FuelStats; locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  const id = `mes-barates-${fuel}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{l.cheapestTitle(fuel, stats.cheapest.length)}</h2>
      <div className="ci-table-scroll mt-3">
        <table className="ci-local-table">
          <caption className="sr-only">{l.cheapestTitle(fuel, stats.cheapest.length)}</caption>
          <thead>
            <tr>
              <th scope="col">{l.cheapestCols.rank}</th>
              <th scope="col">{l.cheapestCols.station}</th>
              <th scope="col">{l.cheapestCols.town}</th>
              <th scope="col">{l.cheapestCols.hours}</th>
              <th scope="col" className="text-right">
                {l.cheapestCols.price}
              </th>
              <th scope="col">
                <span className="sr-only">{l.cheapestCols.map}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.cheapest.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>
                  <strong>{s.b}</strong>
                  <br />
                  <small>{s.a}</small>
                </td>
                <td>{townText(s.t, locale)}</td>
                <td>
                  <small>{s.h || "—"}</small>
                </td>
                <td className="text-right font-semibold whitespace-nowrap tabular-nums">{priceText(s[fuel]!, locale)}</td>
                <td>
                  {s.lat !== undefined && s.lon !== undefined ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=17/${s.lat}/${s.lon}`}
                      rel="noopener nofollow"
                      target="_blank"
                      aria-label={`${l.map}: ${s.b}, ${s.a}`}
                    >
                      {l.cheapestCols.map}
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TownTable({ p, summary, locale }: { p: SpainProvince; summary: SpainSummary; locale: FuelHubLocale }) {
  const towns = summary.provinces[p.code]?.mainTowns ?? [];
  // One town (Ceuta, Melilla) would repeat the summary above.
  if (towns.length < 2) return null;
  const l = spainLabels(locale);
  const { date, time } = splitFecha(summary.fecha);
  return (
    <section aria-labelledby="municipis">
      <h2 id="municipis">{l.townsTitle}</h2>
      <p>{fill(l.townsIntro, { n: towns.length, time, date })}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="sr-only">{l.townsTitle}</caption>
          <thead>
            <tr>
              <th scope="col">{l.townsCols.town}</th>
              <th scope="col" className="text-right">
                {l.townsCols.stations}
              </th>
              <th scope="col">{l.townsCols.e95Min}</th>
              <th scope="col">{l.townsCols.e95Median}</th>
              <th scope="col">{l.townsCols.goaMin}</th>
              <th scope="col">{l.townsCols.goaMedian}</th>
            </tr>
          </thead>
          <tbody>
            {towns.map((t) => (
              <tr key={t.name}>
                <th scope="row">{townText(t.name, locale)}</th>
                <td className="text-right tabular-nums">{t.stations}</td>
                <td className="tabular-nums">{cellPrice(t.prices.e95, "min", locale)}</td>
                <td className="tabular-nums">{cellPrice(t.prices.e95, "median", locale)}</td>
                <td className="tabular-nums">{cellPrice(t.prices.goa, "min", locale)}</td>
                <td className="tabular-nums">{cellPrice(t.prices.goa, "median", locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OtherProvinces({ current, locale }: { current: SpainProvince | null; locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  const others = allProvinces().filter((p) => p.code !== current?.code);
  return (
    <section className="mt-10" aria-labelledby="ci-fuel-provinces">
      <h2 id="ci-fuel-provinces">{l.others}</h2>
      <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
        {others.map((p) => (
          <li key={p.code} className="!mt-0">
            <Link href={provinceHref(p, locale)}>{p.name}</Link>
            {p.catalan ? <span className="text-xs text-[var(--color-muted)]"> ({l.catalonia})</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        {current ? (
          <>
            <Link href={spainHubPath(locale)}>{l.spainTable}</Link>
            {" · "}
          </>
        ) : null}
        <Link href={fuelHubPath(locale)}>{l.cataloniaHub}</Link>
      </p>
    </section>
  );
}

export function SpainProvincePage({ province, locale, summary }: { province: SpainProvince; locale: FuelHubLocale; summary: SpainSummary | null }) {
  const l = spainLabels(locale);
  const crumbs = spainProvinceCrumbs(province, locale);
  const stats = summary?.provinces[province.code];
  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{spainProvinceH1(province, locale)}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{spainProvinceLead(province, locale, summary)}</p>
          <ReadStamp summary={summary} locale={locale} />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          {summary && stats ? (
            <>
              <OldWarning summary={summary} locale={locale} />
              <SummaryTable p={province} summary={summary} locale={locale} />
              {SPAIN_FUELS.map((fuel) => {
                const f = stats.fuels[fuel];
                return f ? <CheapestTable key={fuel} fuel={fuel} stats={f} locale={locale} /> : null;
              })}
              <p className="text-sm text-[var(--color-ink-soft)]">{l.hoursNote}</p>
              <TownTable p={province} summary={summary} locale={locale} />
            </>
          ) : (
            <NoPrices locale={locale} />
          )}

          <FaqSection faq={spainProvinceFaq(province, locale, summary)} locale={locale} />
          <Guidance locale={locale} read="render" />
        </div>

        <OtherProvinces current={province} locale={locale} />
        <DriverGuides locale={locale} />
        <SpainSources locale={locale} />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Every province (the Spain table)                                           */
/* -------------------------------------------------------------------------- */

function ProvinceTable({ summary, locale }: { summary: SpainSummary; locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  const { date, time } = splitFecha(summary.fecha);
  const cheapest = (s: FuelStats | undefined) =>
    s ? (
      <>
        {priceText(s.min, locale)}
        <br />
        <small>
          {s.cheapest[0]!.b} · {townText(s.cheapest[0]!.t, locale)}
        </small>
      </>
    ) : (
      "—"
    );
  return (
    <section aria-labelledby="per-provincia">
      <h2 id="per-provincia">{l.tableTitle}</h2>
      <p>{fill(l.tableIntro, { time, date })}</p>
      <OldWarning summary={summary} locale={locale} />
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="sr-only">{l.tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{l.tableCols.province}</th>
              <th scope="col" className="text-right">
                {l.tableCols.stations}
              </th>
              <th scope="col">{l.tableCols.e95Min}</th>
              <th scope="col">{l.tableCols.e95Median}</th>
              <th scope="col">{l.tableCols.goaMin}</th>
              <th scope="col">{l.tableCols.goaMedian}</th>
            </tr>
          </thead>
          <tbody>
            {allProvinces().map((p) => {
              const s = summary.provinces[p.code];
              return (
                <tr key={p.code}>
                  <th scope="row">
                    <Link href={provinceHref(p, locale)}>{p.name}</Link>
                    {p.catalan ? <small className="block font-normal text-[var(--color-muted)]">{l.catalonia}</small> : null}
                  </th>
                  <td className="text-right tabular-nums">{s?.stations ?? "—"}</td>
                  <td className="tabular-nums">{cheapest(s?.fuels.e95)}</td>
                  <td className="tabular-nums">{cellPrice(s?.fuels.e95, "median", locale)}</td>
                  <td className="tabular-nums">{cheapest(s?.fuels.goa)}</td>
                  <td className="tabular-nums">{cellPrice(s?.fuels.goa, "median", locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SpainHubPage({ locale, summary }: { locale: FuelHubLocale; summary: SpainSummary | null }) {
  const meta = spainHubMeta(locale);
  const crumbs = spainHubCrumbs(locale);
  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{spainHubLead(locale, summary)}</p>
          <ReadStamp summary={summary} locale={locale} />
          <ShareBar locale={locale} path={crumbPath(crumbs)} title={meta.h1} contentType="fuel_spain" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          {summary ? <ProvinceTable summary={summary} locale={locale} /> : <NoPrices locale={locale} />}
          <AdSlot kind="top" locale={locale} path={crumbPath(spainHubCrumbs(locale))} />
          <FaqSection faq={spainHubFaq(locale, summary)} locale={locale} />
          <Guidance locale={locale} read="render" />
        </div>

        <OtherProvinces current={null} locale={locale} />
        <DriverGuides locale={locale} />
        <SpainSources locale={locale} />
      </div>
    </article>
  );
}

/**
 * On the Catalonia hubs (ca, es, en): the way to the rest of Spain, one link
 * per province page and the table. Price-free, so it adds no read.
 */
export function RestOfSpain({ locale }: { locale: FuelHubLocale }) {
  const l = spainLabels(locale);
  return (
    <section aria-labelledby="espanya">
      <h2 id="espanya">{l.restTitle}</h2>
      <p>
        {l.restIntro} <Link href={spainHubPath(locale)}>{l.restLink}</Link>.
      </p>
      <ul className="mt-1 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
        {spainProvinces().map((p) => (
          <li key={p.code} className="!mt-0">
            <Link href={spainProvincePath(locale, p.slug)}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
