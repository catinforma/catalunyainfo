import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { GEOPORTAL_HOME, hubLead, hubMeta, liveLabels, placeName, readLine, sectionTitles } from "@/lib/programmatic/fuel/copy";
import { MUNICIPALITIES, STATIONS, chains, citiesIn, comarquesIn, provinces } from "@/lib/programmatic/fuel/data";
import { fuelHubPath, fuelPath, type FuelLocale } from "@/lib/programmatic/fuel/paths";

import { FuelPrices } from "./FuelPrices";
import { DriverGuides, Guidance, Sources } from "./parts";

export function hubTotals(): { stations: number; towns: number } {
  return { stations: STATIONS.stations.length, towns: MUNICIPALITIES.municipalities.length };
}

export function hubCrumbs(locale: FuelLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubMeta(locale, 0).crumb, href: fuelHubPath(locale) },
  ];
}

const provinceLabel = (name: string, locale: FuelLocale) => (locale === "es" ? `Provincia de ${name}` : `Província de ${name}`);

/** The family's index: Catalonia's live table and a link to every page, by province. */
export function FuelHubPage({ locale }: { locale: FuelLocale }) {
  const t = sectionTitles(locale);
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
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="ara" className="!mt-0">
            {t.live}
          </h2>
          <FuelPrices
            filter={{}}
            placeOf={locale === "es" ? "de Cataluña" : "de Catalunya"}
            showTown
            locale={locale}
            labels={liveLabels(locale)}
            geoportalUrl={GEOPORTAL_HOME}
          />

          <h2 id="zones">{t.provinces}</h2>
          {provinces().map((p) => {
            const comarques = comarquesIn(p.code);
            const cities = citiesIn({ province: p.code });
            return (
              <section key={p.slug} aria-labelledby={`p-${p.slug}`}>
                <h3 id={`p-${p.slug}`}>
                  <Link href={fuelPath(locale, "province", p.slug)}>{provinceLabel(p.name, locale)}</Link>{" "}
                  <span className="text-sm font-normal text-[var(--color-muted)]">{t.stationsUnit(p.stations)}</span>
                </h3>
                {cities.length > 0 ? (
                  <>
                    <p className="ci-label mt-3">{t.citiesHere}</p>
                    <ul className="mt-1 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                      {cities.map((c) => (
                        <li key={c.slug} className="!mt-0">
                          <Link href={fuelPath(locale, "city", c.slug)}>{placeName(c, locale)}</Link>{" "}
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
                      <Link href={fuelPath(locale, "comarca", c.slug)}>{c.name}</Link>{" "}
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
                <Link href={fuelPath(locale, "chain", c.slug)}>{c.name}</Link>{" "}
                <span className="text-sm text-[var(--color-muted)]">{t.stationsUnit(c.stations)}</span>
              </li>
            ))}
          </ul>

          <Guidance locale={locale} />
        </div>

        <DriverGuides locale={locale} />
        <Sources locale={locale} />
      </div>
    </article>
  );
}
