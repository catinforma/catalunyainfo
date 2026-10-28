import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { GEOPORTAL_HOME, fuelH1, hubMeta, inPlace, liveLabels, ofPlace, placeLead, placeName, readLine, sectionTitles } from "@/lib/programmatic/fuel/copy";
import {
  STATIONS,
  brandCounts,
  byComarca,
  byTown,
  chains,
  citiesIn,
  citySiblings,
  comarcaPageFor,
  comarquesIn,
  provincePageFor,
  provinces,
  stationsOf,
  townCount,
  type Place,
} from "@/lib/programmatic/fuel/data";
import type { StationFilter } from "@/lib/programmatic/fuel/live";
import { fuelHubPath, fuelPath, type FuelLocale } from "@/lib/programmatic/fuel/paths";
import { esName } from "@/lib/programmatic/holidays/names";

import { FuelPrices } from "./FuelPrices";
import { CountTable, DriverGuides, Guidance, LinkList, Sources } from "./parts";

export function placeFilter(place: Place): StationFilter {
  switch (place.kind) {
    case "province":
      return { province: place.code };
    case "comarca":
      return { comarca: place.code };
    case "city":
      return { ine: place.ine };
    case "chain":
      return { brands: place.chain.brands };
  }
}

export function placeCrumbs(place: Place, locale: FuelLocale): Crumb[] {
  const home = getMessages(locale).common.home;
  const crumbs: Crumb[] = [
    { label: home, href: `/${locale}/` },
    { label: hubMeta(locale, 0).crumb, href: fuelHubPath(locale) },
  ];
  if (place.kind === "city" || place.kind === "comarca") {
    const province = provincePageFor(place.province);
    crumbs.push({ label: provinceLabel(province.name, locale), href: fuelPath(locale, "province", province.slug) });
  }
  if (place.kind === "city") {
    const comarca = comarcaPageFor(place.comarca);
    if (comarca) crumbs.push({ label: comarca.name, href: fuelPath(locale, "comarca", comarca.slug) });
  }
  crumbs.push({ label: place.kind === "province" ? provinceLabel(place.name, locale) : placeName(place, locale), href: fuelPath(locale, place.kind, place.slug) });
  return crumbs;
}

function provinceLabel(name: string, locale: FuelLocale): string {
  return locale === "es" ? `Provincia de ${name}` : `Província de ${name}`;
}

const townName = (name: string, locale: FuelLocale) => (locale === "es" ? esName(name) : name);

export function FuelPlacePage({ place, locale }: { place: Place; locale: FuelLocale }) {
  const t = sectionTitles(locale);
  const stations = stationsOf(place);
  const brands = brandCounts(stations);
  const crumbs = placeCrumbs(place, locale);
  const towns = townCount(stations);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{fuelH1(place, locale)}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{placeLead(place, locale, towns)}</p>
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
            filter={placeFilter(place)}
            placeOf={ofPlace(place, locale)}
            showTown={place.kind !== "city"}
            locale={locale}
            labels={liveLabels(locale)}
            geoportalUrl={GEOPORTAL_HOME}
          />

          <h2 id="estacions">{t.stations}</h2>
          <StationSection place={place} locale={locale} />

          {place.kind === "chain" ? null : (
            <>
              <h2 id="marques">{t.brands}</h2>
              <CountTable
                caption={`${t.stationsUnit(stations.length)} ${inPlace(place, locale)}`}
                cols={[t.colBrand, t.colStations]}
                rows={brands.map((b) => ({ label: b.brand, count: b.stations }))}
              />
            </>
          )}

          <Guidance locale={locale} />
        </div>

        <Siblings place={place} locale={locale} />
        <DriverGuides locale={locale} />
        <Sources locale={locale} />
      </div>
    </article>
  );
}

/** The stations behind the page, by name and address (never prices). */
function StationSection({ place, locale }: { place: Place; locale: FuelLocale }) {
  const t = sectionTitles(locale);
  const stations = stationsOf(place);

  if (place.kind === "province") {
    const groups = byComarca(stations);
    return (
      <CountTable
        caption={`${t.stationsUnit(stations.length)} ${inPlace(place, locale)}, ${t.byComarca.toLowerCase()}`}
        cols={[t.colComarca, t.colStations]}
        rows={groups.map((g) => {
          const page = comarcaPageFor(g.code);
          return { label: g.name, href: page ? fuelPath(locale, "comarca", page.slug) : undefined, count: g.stations.length };
        })}
      />
    );
  }

  if (place.kind === "comarca") {
    const groups = byTown(stations);
    const cityPages = new Map(citiesIn({ comarca: place.code }).map((c) => [c.ine, c]));
    return (
      <CountTable
        caption={`${t.stationsUnit(stations.length)} ${inPlace(place, locale)}, ${t.byTown.toLowerCase()}`}
        cols={[t.colTown, t.colStations]}
        rows={groups.map((g) => {
          const page = cityPages.get(g.town.ine);
          return { label: townName(g.town.name, locale), href: page ? fuelPath(locale, "city", page.slug) : undefined, count: g.stations.length };
        })}
      />
    );
  }

  if (place.kind === "chain") {
    const groups = byComarca(stations);
    return (
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{`${t.stationsUnit(stations.length)} ${place.name}, ${t.byComarca.toLowerCase()}`}</caption>
          <thead>
            <tr>
              <th scope="col">{t.colComarca}</th>
              <th scope="col">{t.colTown}</th>
              <th scope="col">{t.colAddress}</th>
            </tr>
          </thead>
          <tbody>
            {groups.flatMap((g) =>
              g.stations.map((s, i) => (
                <tr key={s.id}>
                  <td>{i === 0 ? <ComarcaLink code={g.code} name={g.name} locale={locale} /> : null}</td>
                  <td>{townName(s.town.name, locale)}</td>
                  <td>{s.address}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // A city: every station, by brand.
  const list = byTown(stations).flatMap((g) => g.stations);
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{`${t.stationsUnit(list.length)} ${inPlace(place, locale)}`}</caption>
        <thead>
          <tr>
            <th scope="col">{t.colBrand}</th>
            <th scope="col">{t.colAddress}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.brand}</td>
              <td>{s.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComarcaLink({ code, name, locale }: { code: string; name: string; locale: FuelLocale }) {
  const page = comarcaPageFor(code);
  return page ? <Link href={fuelPath(locale, "comarca", page.slug)}>{name}</Link> : <>{name}</>;
}

function Siblings({ place, locale }: { place: Place; locale: FuelLocale }) {
  const t = sectionTitles(locale);
  const unit = t.stationsUnit;
  const blocks: { title: string; id: string; links: { label: string; href: string; note?: string }[] }[] = [];

  if (place.kind === "city") {
    blocks.push({
      title: t.nearbyCities,
      id: "ci-fuel-near",
      links: citySiblings(place).map((c) => ({ label: placeName(c, locale), href: fuelPath(locale, "city", c.slug), note: unit(c.stations) })),
    });
    const zone: { label: string; href: string; note?: string }[] = [];
    const comarca = comarcaPageFor(place.comarca);
    if (comarca) zone.push({ label: comarca.name, href: fuelPath(locale, "comarca", comarca.slug), note: unit(comarca.stations) });
    const province = provincePageFor(place.province);
    zone.push({ label: provinceLabel(province.name, locale), href: fuelPath(locale, "province", province.slug), note: unit(province.stations) });
    blocks.push({ title: t.siblings, id: "ci-fuel-zone", links: zone });
  }

  if (place.kind === "comarca") {
    blocks.push({
      title: t.citiesHere,
      id: "ci-fuel-cities",
      links: citiesIn({ comarca: place.code }).map((c) => ({ label: placeName(c, locale), href: fuelPath(locale, "city", c.slug), note: unit(c.stations) })),
    });
    const province = provincePageFor(place.province);
    blocks.push({
      title: t.siblings,
      id: "ci-fuel-zone",
      links: [
        { label: provinceLabel(province.name, locale), href: fuelPath(locale, "province", province.slug), note: unit(province.stations) },
        ...comarquesIn(place.province)
          .filter((c) => c.slug !== place.slug)
          .map((c) => ({ label: c.name, href: fuelPath(locale, "comarca", c.slug), note: unit(c.stations) })),
      ],
    });
  }

  if (place.kind === "province") {
    blocks.push({
      title: t.citiesHere,
      id: "ci-fuel-cities",
      links: citiesIn({ province: place.code }).map((c) => ({ label: placeName(c, locale), href: fuelPath(locale, "city", c.slug), note: unit(c.stations) })),
    });
    blocks.push({
      title: t.provinces,
      id: "ci-fuel-provinces",
      links: provinces()
        .filter((p) => p.slug !== place.slug)
        .map((p) => ({ label: provinceLabel(p.name, locale), href: fuelPath(locale, "province", p.slug), note: unit(p.stations) })),
    });
  }

  if (place.kind === "chain") {
    blocks.push({
      title: t.chains,
      id: "ci-fuel-chains",
      links: chains()
        .filter((c) => c.slug !== place.slug)
        .map((c) => ({ label: c.name, href: fuelPath(locale, "chain", c.slug), note: unit(c.stations) })),
    });
    blocks.push({
      title: t.provinces,
      id: "ci-fuel-provinces",
      links: provinces().map((p) => ({ label: provinceLabel(p.name, locale), href: fuelPath(locale, "province", p.slug), note: unit(p.stations) })),
    });
  }

  return (
    <>
      {blocks.map((b) => (
        <LinkList key={b.id} title={b.title} id={b.id} links={b.links} />
      ))}
      <p className="mt-4 text-sm">
        <Link href={fuelHubPath(locale)}>{t.allPlaces}</Link>
      </p>
    </>
  );
}
