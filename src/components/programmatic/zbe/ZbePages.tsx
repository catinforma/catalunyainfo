import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { b2href } from "@/lib/content/batch02/shared";
import { renderInline } from "@/lib/content/inline";
import { parkingHubLine } from "@/lib/nav/driving-hubs";
import { getMessages } from "@/lib/i18n";
import { REGION_NAME } from "@/lib/programmatic/holidays/boe-2027";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import { TRAFFIC_LAW, zbeCities } from "@/lib/programmatic/zbe/cities";
import {
  FACT_LABEL,
  HOME_ZBE_LABEL,
  answerCell,
  cityAnswers,
  cityCopy,
  cityFaq,
  cityLead,
  cityMeta,
  dgtCredit,
  dgtSentence,
  holidayNote,
  hubCopy,
  hubFaq,
  hubMeta,
  labelName,
  parkingLink,
  restrictedLabels,
} from "@/lib/programmatic/zbe/copy";
import { DGT_ZBE_DATASET, DGT_ZBE_INDEX, DGT_ZBE_LICENCE, DGT_ZBE_PUBLISHER, dgtHolidays, dgtWorkingHours } from "@/lib/programmatic/zbe/datex";
import { zbeHolidays } from "@/lib/programmatic/zbe/holidays";
import { mainRestriction, sourceOf } from "@/lib/programmatic/zbe/logic";
import { zbeCityPath, zbeHubPath } from "@/lib/programmatic/zbe/paths";
import { scheduleText } from "@/lib/programmatic/zbe/schedule-text";
import { ZBE_SNAPSHOT, dgtFileCount, dgtPlacesNotPublished, dgtZoneFor } from "@/lib/programmatic/zbe/snapshot";
import type { Fact, FactKind, ZbeCity, ZbeLocale, ZbeSource } from "@/lib/programmatic/zbe/types";

import { ZbeNow } from "./ZbeNow";

/**
 * The two pages of the low-emission-zone family: a city's zone (can I drive
 * in, by DGT label; when; where; who is exempt; the fine) and the hub that
 * lists every published city next to the rest of the DGT directory.
 *
 * Every rule printed here was read on the council's own page
 * (lib/programmatic/zbe/cities.ts) and carries that page and the day it was
 * checked. The DGT file only adds its own record of the zone, set apart.
 */

export function hubCrumbs(locale: ZbeLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HOME_ZBE_LABEL[locale], href: zbeHubPath(locale) },
  ];
}

export function cityCrumbs(locale: ZbeLocale, city: ZbeCity): Crumb[] {
  return [...hubCrumbs(locale), { label: city.name[locale], href: zbeCityPath(locale, city.slug) }];
}

export function hubCounts(): { cities: number; zones: number; files: number; builtOn: string } {
  return { cities: zbeCities().length, zones: ZBE_SNAPSHOT.zones.length, files: dgtFileCount(), builtOn: ZBE_SNAPSHOT.builtOn };
}

export function hubFaqFor(locale: ZbeLocale): { q: string; a: string }[] {
  return hubFaq(locale, { ...hubCounts(), index: DGT_ZBE_INDEX, lawUrl: TRAFFIC_LAW.url });
}

const EXTERNAL = { rel: "noopener nofollow", target: "_blank" } as const;

function SourceRef({ source, label, checked }: { source: ZbeSource; label: string; checked: string }) {
  return (
    <span className="text-sm text-[var(--color-muted)]">
      {" "}
      {label}:{" "}
      <a href={source.url} {...EXTERNAL}>
        {source.title}
      </a>{" "}
      ({checked}).
    </span>
  );
}

function Facts({ city, kinds, locale }: { city: ZbeCity; kinds: FactKind[]; locale: ZbeLocale }) {
  const copy = cityCopy(city, locale);
  const checked = dayMonthYear(city.checked, locale);
  const facts: Fact[] = kinds.flatMap((kind) => city.facts.filter((fact) => fact.kind === kind));
  return (
    <>
      {facts.map((fact) => (
        <p key={`${fact.kind}-${fact.quote.slice(0, 40)}`}>
          <strong>{FACT_LABEL[fact.kind][locale]}.</strong> {renderInline(fact.text[locale])}
          <SourceRef source={sourceOf(city, fact.source)} label={copy.source} checked={checked} />
        </p>
      ))}
    </>
  );
}

function Sources({ id, title, sources }: { id: string; title: string; sources: ZbeSource[] }) {
  return (
    <section className="mt-12" aria-labelledby={id}>
      <h2 id={id} className="font-sans text-base font-semibold">
        {title}
      </h2>
      <ol className="ci-sources mt-3">
        {sources.map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} {...EXTERNAL}>
                {source.title}
              </a>
              <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Faq({ title, faq }: { title: string; faq: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="preguntes">
      <h2 id="preguntes">{title}</h2>
      {faq.map((item) => (
        <section key={item.q}>
          <h3>{item.q}</h3>
          <p>{renderInline(item.a)}</p>
        </section>
      ))}
    </section>
  );
}

/* ------------------------------ city page ------------------------------ */

export function ZbeCityPage({ locale, city }: { locale: ZbeLocale; city: ZbeCity }) {
  const meta = cityMeta(city, locale);
  const copy = cityCopy(city, locale);
  const crumbs = cityCrumbs(locale, city);
  const main = mainRestriction(city);
  const holidays = zbeHolidays(city);
  const zone = dgtZoneFor(city);
  const checked = dayMonthYear(city.checked, locale);
  const tableSources = [...new Set([...city.restrictions.map((r) => r.source), city.allowed.source])].map((index) => sourceOf(city, index));
  const others = zbeCities().filter((other) => other.slug !== city.slug);
  const hasControl = city.facts.some((fact) => fact.kind === "control");
  const parking = parkingLink(city, locale);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{cityLead(city, locale)}</p>
          <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{copy.checkedLine}</p>
          <ShareBar locale={locale} path={crumbPath(crumbs)} title={meta.h1} contentType="zbe_city" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <ZbeNow locale={locale} schedule={main.schedule} holidays={holidays.days} fallback={copy.when} />

          <div className="overflow-x-auto">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{copy.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{copy.colLabel}</th>
                  <th scope="col">{copy.colAnswer}</th>
                  <th scope="col">{copy.colDetail}</th>
                </tr>
              </thead>
              <tbody>
                {cityAnswers(city).map((answer) => {
                  const cell = answerCell(city, answer, locale);
                  return (
                    <tr key={answer.label}>
                      <th scope="row">{labelName(answer.label, locale)}</th>
                      <td>
                        <strong>{cell.verdict}</strong>
                      </td>
                      <td>{renderInline(cell.detail)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            {copy.tableSource}:{" "}
            {tableSources.map((source, index) => (
              <span key={source.url}>
                {index > 0 ? "; " : null}
                <a href={source.url} {...EXTERNAL}>
                  {source.title}
                </a>
              </span>
            ))}{" "}
            ({checked}).
          </p>

          <section aria-labelledby="horari">
            <h2 id="horari">{copy.whenTitle}</h2>
            <p>
              {copy.when}
              <SourceRef source={sourceOf(city, main.source)} label={copy.source} checked={checked} />
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {renderInline(
                holidayNote({
                  locale,
                  cityName: city.name[locale],
                  regionName: REGION_NAME[city.region][locale],
                  local: holidays.localThrough !== null,
                  calendarPath: city.holidaySlug ? municipalityPath(locale, city.holidaySlug) : null,
                }),
              )}
            </p>
          </section>

          <section aria-labelledby="mapa">
            <h2 id="mapa">{copy.areaTitle}</h2>
            <Facts city={city} kinds={["area"]} locale={locale} />
            <p>
              <a href={city.mapUrl} {...EXTERNAL}>
                {copy.mapLink}
              </a>
              {city.officialUrl !== city.mapUrl ? (
                <>
                  {" · "}
                  <a href={city.officialUrl} {...EXTERNAL}>
                    {copy.officialSite}
                  </a>
                </>
              ) : null}
              <span className="text-[var(--color-muted)]"> — {city.authority}</span>
            </p>
          </section>

          <section aria-labelledby="calendari">
            <h2 id="calendari">{copy.phasesTitle}</h2>
            <Facts city={city} kinds={["since", "next"]} locale={locale} />
          </section>

          <section aria-labelledby="autoritzacions">
            <h2 id="autoritzacions">{copy.permitsTitle}</h2>
            <Facts city={city} kinds={["residents", "occasional", "foreign", "parking", "exempt"]} locale={locale} />
            {city.guide ? (
              <p>
                <strong>{copy.guideTitle}.</strong> {city.guide.text[locale]} <Link href={b2href(city.guide.key, locale)}>{copy.guideLink}</Link>
              </p>
            ) : null}
          </section>

          <section aria-labelledby="multa">
            <h2 id="multa">{copy.enforcementTitle}</h2>
            {hasControl ? null : <p>{copy.noControl}</p>}
            <Facts city={city} kinds={["control", "fine"]} locale={locale} />
          </section>

          <section aria-labelledby="dgt">
            <h2 id="dgt">{copy.dgtTitle}</h2>
            {zone ? (
              <p>
                {dgtSentence({ locale, name: zone.name, builtOn: ZBE_SNAPSHOT.builtOn, hours: dgtWorkingHours(zone), holidays: dgtHolidays(zone), start: zone.start })}{" "}
                {city.dgtDifference ? city.dgtDifference[locale] : copy.dgtAgree}
              </p>
            ) : null}
            <p className="text-sm">
              {renderInline(dgtCredit(locale, DGT_ZBE_DATASET, DGT_ZBE_LICENCE))} {copy.dgtAttribution}
            </p>
          </section>

          {city.notPublished.length > 0 ? (
            <section aria-labelledby="no-publicat">
              <h2 id="no-publicat">{copy.notPublishedTitle}</h2>
              <p>{copy.notPublishedLead}</p>
              <ul>
                {city.notPublished.map((item) => (
                  <li key={item.en}>{item[locale]}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <Faq title={copy.faqTitle} faq={cityFaq(city, locale)} />
        </div>

        <section className="mt-10" aria-labelledby="ci-zbe-more">
          <h2 id="ci-zbe-more">{copy.moreTitle}</h2>
          <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            {others.map((other) => (
              <li key={other.slug} className="!mt-0">
                <Link href={zbeCityPath(locale, other.slug)}>{other.name[locale]}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href={zbeHubPath(locale)}>{copy.hubLink}</Link>
          </p>
          <p className="mt-2 text-sm">
            <Link href={parking.href}>{parking.label}</Link>
          </p>
        </section>

        <Sources id="ci-zbe-sources" title={copy.sourcesTitle} sources={city.sources} />
      </div>
    </article>
  );
}

/* --------------------------------- hub --------------------------------- */

function CityLinks({ cities, locale, conditional }: { cities: readonly ZbeCity[]; locale: ZbeLocale; conditional: string }) {
  return (
    <ul>
      {cities.map((city) => (
        <li key={city.slug}>
          <Link href={zbeCityPath(locale, city.slug)}>{city.zoneName[locale]}</Link>
          {": "}
          {restrictedLabels(city, locale, conditional).toLowerCase()}
          {"; "}
          {scheduleText(mainRestriction(city).schedule, locale)}.
        </li>
      ))}
    </ul>
  );
}

function PlaceList({ places }: { places: string[] }) {
  return (
    <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
      {places.map((place) => (
        <li key={place} className="!mt-0">
          {place}
        </li>
      ))}
    </ul>
  );
}

export function ZbeHubPage({ locale }: { locale: ZbeLocale }) {
  const meta = hubMeta(locale);
  const counts = hubCounts();
  const copy = hubCopy(locale, counts);
  const parking = parkingHubLine(locale);
  const crumbs = hubCrumbs(locale);
  const cities = [...zbeCities()].sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale));
  const catalan = cities.filter((city) => city.catalonia);
  const pending = dgtPlacesNotPublished(cities);
  const pendingCatalan = pending.filter((p) => p.catalonia).map((p) => p.place);
  const pendingRest = pending.filter((p) => !p.catalonia).map((p) => p.place);
  const sources: ZbeSource[] = [
    { url: DGT_ZBE_DATASET, title: "Zonas de bajas emisiones (DATEX II)", publisher: DGT_ZBE_PUBLISHER },
    { url: DGT_ZBE_INDEX, title: "Directorio de ficheros ControledZonePublication", publisher: DGT_ZBE_PUBLISHER },
    TRAFFIC_LAW,
  ];

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{copy.lead}</p>
          <ShareBar locale={locale} path={crumbPath(crumbs)} title={meta.h1} contentType="zbe_hub" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <section aria-labelledby="ciutats">
            <h2 id="ciutats">{copy.tableTitle}</h2>
            <div className="overflow-x-auto">
              <table className="ci-local-table">
                <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{copy.tableCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{copy.colCity}</th>
                    <th scope="col">{copy.colFines}</th>
                    <th scope="col">{copy.colLabels}</th>
                    <th scope="col">{copy.colHours}</th>
                    <th scope="col">{copy.colChecked}</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <tr key={city.slug}>
                      <th scope="row">
                        <Link href={zbeCityPath(locale, city.slug)}>{city.name[locale]}</Link>
                      </th>
                      <td>{city.fines ? copy.finesYes : copy.finesNo}</td>
                      <td>{restrictedLabels(city, locale, copy.conditional)}</td>
                      <td>{scheduleText(mainRestriction(city).schedule, locale)}</td>
                      <td>{dayMonthYear(city.checked, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="catalunya">
            <h2 id="catalunya">{copy.cataloniaTitle}</h2>
            <p>{copy.cataloniaLead}</p>
            <CityLinks cities={catalan} locale={locale} conditional={copy.conditional} />
            <p>
              {copy.guideLine} <Link href={b2href("zbe", locale)}>{copy.guideLink}</Link>
            </p>
            <p>
              {parking.text} <Link href={parking.href}>{parking.label}</Link>
            </p>
            <p>{copy.cataloniaPending}</p>
            {pendingCatalan.length > 0 ? <PlaceList places={pendingCatalan} /> : <p>{copy.none}</p>}
          </section>

          <section aria-labelledby="dgt">
            <h2 id="dgt">{copy.restTitle}</h2>
            <p>{copy.restLead}</p>
            {pendingRest.length > 0 ? <PlaceList places={pendingRest} /> : <p>{copy.none}</p>}
            <p className="text-sm">{renderInline(dgtCredit(locale, DGT_ZBE_DATASET, DGT_ZBE_LICENCE))}</p>
          </section>

          <Faq title={copy.faqTitle} faq={hubFaqFor(locale)} />
        </div>

        <Sources id="ci-zbe-sources" title={copy.sourcesTitle} sources={sources} />
      </div>
    </article>
  );
}
