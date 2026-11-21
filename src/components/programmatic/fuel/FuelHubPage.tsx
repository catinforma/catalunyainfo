import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { getMessages } from "@/lib/i18n";
import { areaSummary, type AreaPrice, type AreaSummary } from "@/lib/programmatic/fuel/areas";
import { GEOPORTAL_HOME, areaLabels, hubLead, hubMeta, liveLabels, placeName, readLine, sectionTitles } from "@/lib/programmatic/fuel/copy";
import { MUNICIPALITIES, STATIONS, chains, citiesIn, comarquesIn, provinces, type Place } from "@/lib/programmatic/fuel/data";
import { initialPrices, splitFecha, type LivePayload } from "@/lib/programmatic/fuel/live";
import { fuelHubPath, fuelPath, placeLocaleFor, type FuelHubLocale } from "@/lib/programmatic/fuel/paths";

import { FuelPrices } from "./FuelPrices";
import { DriverGuides, Guidance, Sources } from "./parts";
import { RestOfSpain } from "./SpainPages";

export function hubTotals(): { stations: number; towns: number } {
  return { stations: STATIONS.stations.length, towns: MUNICIPALITIES.municipalities.length };
}

export function hubCrumbs(locale: FuelHubLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubMeta(locale, 0).crumb, href: fuelHubPath(locale) },
  ];
}

const provinceLabel = (name: string, locale: FuelHubLocale) => areaLabels(locale).province(name);

/** "de Cataluña" / "de Catalunya" / "in Catalonia": completes the live table's median line. */
const PLACE_OF: Record<FuelHubLocale, string> = { es: "de Cataluña", ca: "de Catalunya", en: "in Catalonia" };

const INTL: Record<FuelHubLocale, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" };

/**
 * Today's cheapest and median petrol 95 and diesel price of every province,
 * city page and chain, from the list the route read at render (20 Nov 2026;
 * lib/programmatic/fuel/areas.ts). Server HTML only: the live table above is
 * the one the browser refreshes; this one carries its own time. Nothing when
 * there is no list under a day old.
 */
function AreaTable({ locale, summary }: { locale: FuelHubLocale; summary: AreaSummary | null }) {
  if (!summary) return null;
  const l = areaLabels(locale);
  const live = liveLabels(locale);
  const { date, time } = splitFecha(summary.fecha);
  const pages = placeLocaleFor(locale);
  const number = new Intl.NumberFormat(INTL[locale], { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const label = (place: Place) => (place.kind === "province" ? l.province(place.name) : placeName(place, pages));
  const town = (t: string) => (locale === "ca" ? t : t.charAt(0).toUpperCase() + t.slice(1));
  // Under the cheapest price, where it is: the brand in a city, brand and town in a province, the town for a chain.
  const where = (place: Place, p: AreaPrice) =>
    place.kind === "city" ? p.station.b : place.kind === "chain" ? town(p.station.t) : `${p.station.b} · ${town(p.station.t)}`;
  const cell = (place: Place, p: AreaPrice | undefined, cheapest: boolean) =>
    p ? (
      <>
        {number.format(cheapest ? p.min : p.median)}
        {cheapest ? (
          <>
            <br />
            <small>{where(place, p)}</small>
          </>
        ) : null}
      </>
    ) : (
      "—"
    );
  return (
    <section aria-labelledby="per-zona">
      <h2 id="per-zona">{l.title}</h2>
      <p>{l.intro.replace("{time}", time).replace("{date}", date)}</p>
      {summary.fresh === "old" ? <p className="ci-callout ci-callout-warning">{live.old.replace("{when}", `${date} ${time}`.trim())}</p> : null}
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="sr-only">{l.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{l.cols.area}</th>
              <th scope="col">{l.cols.e95Min}</th>
              <th scope="col">{l.cols.e95Median}</th>
              <th scope="col">{l.cols.goaMin}</th>
              <th scope="col">{l.cols.goaMedian}</th>
            </tr>
          </thead>
          {summary.groups.map((group) => (
            <tbody key={group.kind}>
              <tr>
                <th scope="colgroup" colSpan={5}>
                  {l.groups[group.kind]}
                </th>
              </tr>
              {group.rows.map(({ place, prices }) => (
                <tr key={`${place.kind}-${place.slug}`}>
                  <th scope="row">
                    <Link href={fuelPath(pages, place.kind, place.slug)}>{label(place)}</Link>
                  </th>
                  <td>{cell(place, prices.e95, true)}</td>
                  <td>{cell(place, prices.e95, false)}</td>
                  <td>{cell(place, prices.goa, true)}</td>
                  <td>{cell(place, prices.goa, false)}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}

/** The family's index: Catalonia's live table and a link to every page, by province. */
export function FuelHubPage({ locale, prices = null, now }: { locale: FuelHubLocale; prices?: LivePayload | null; now: number }) {
  const t = sectionTitles(locale);
  // The English hub links the Spanish edition of the place pages (there is no English one).
  const pages = placeLocaleFor(locale);
  const { stations, towns } = hubTotals();
  const meta = hubMeta(locale, stations);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{hubLead(locale, stations, towns)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
            <span className="ci-verified">
              <span className="ci-verified-dot" aria-hidden="true" />
              <time dateTime={STATIONS.readOn}>{readLine(STATIONS.readOn, locale)}</time>
            </span>
          </div>
          <ShareBar locale={locale} path={crumbPath(hubCrumbs(locale))} title={meta.h1} contentType="fuel_hub" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="ara" className="!mt-0">
            {t.live}
          </h2>
          <FuelPrices
            filter={{}}
            placeOf={PLACE_OF[locale]}
            showTown
            locale={locale}
            labels={liveLabels(locale)}
            geoportalUrl={GEOPORTAL_HOME}
            initial={initialPrices(prices, {}, now)}
          />

          <AreaTable locale={locale} summary={areaSummary(prices, now)} />

          <h2 id="zones">{t.provinces}</h2>
          {provinces().map((p) => {
            const comarques = comarquesIn(p.code);
            const cities = citiesIn({ province: p.code });
            return (
              <section key={p.slug} aria-labelledby={`p-${p.slug}`}>
                <h3 id={`p-${p.slug}`}>
                  <Link href={fuelPath(pages, "province", p.slug)}>{provinceLabel(p.name, locale)}</Link>{" "}
                  <span className="text-sm font-normal text-[var(--color-muted)]">{t.stationsUnit(p.stations)}</span>
                </h3>
                {cities.length > 0 ? (
                  <>
                    <p className="ci-label mt-3">{t.citiesHere}</p>
                    <ul className="mt-1 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                      {cities.map((c) => (
                        <li key={c.slug} className="!mt-0">
                          <Link href={fuelPath(pages, "city", c.slug)}>{placeName(c, pages)}</Link>{" "}
                          <span className="text-xs text-[var(--color-muted)]">{c.stations}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className="ci-label mt-3">{t.comarquesHere}</p>
                <ul className="mt-1 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                  {comarques.map((c) => (
                    <li key={c.slug} className="!mt-0">
                      <Link href={fuelPath(pages, "comarca", c.slug)}>{c.name}</Link>{" "}
                      <span className="text-xs text-[var(--color-muted)]">{c.stations}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <h2 id="cadenes">{t.chains}</h2>
          <ul>
            {chains().map((c) => (
              <li key={c.slug}>
                <Link href={fuelPath(pages, "chain", c.slug)}>{c.name}</Link>{" "}
                <span className="text-sm text-[var(--color-muted)]">{t.stationsUnit(c.stations)}</span>
              </li>
            ))}
          </ul>

          <RestOfSpain locale={locale} />

          <Guidance locale={locale} />
        </div>

        <DriverGuides locale={locale} />
        <Sources locale={locale} />
        <ShareBar locale={locale} path={crumbPath(hubCrumbs(locale))} title={meta.h1} contentType="fuel_hub" variant="full" />
      </div>
    </article>
  );
}
