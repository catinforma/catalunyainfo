import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/lib/i18n/config";
import {
  aboutParagraphs,
  fuelFallback,
  holidayFallback,
  onDate,
  pageCopy,
  reservoirsFallback,
  rodaliesFallback,
  snowFallback,
  sourceLine,
  sources,
  strikesFallback,
  verifiedLine,
  weekendFallback,
  type ItemKey,
} from "@/lib/programmatic/today/copy";
import {
  STRIKES_AS_OF,
  holidayData,
  reservoirFallback,
  rodaliesLines,
  snowSeason,
  todayLastModified,
  todayLinks,
  todayStrikes,
} from "@/lib/programmatic/today/data";
import { todaySchemas, todayCrumbs } from "@/lib/programmatic/today/page";
import { todayTranslations } from "@/lib/programmatic/today/paths";
import { graph } from "@/lib/seo/jsonld";

import { FuelToday, HolidayToday, ReservoirsToday, RodaliesToday, SnowToday, StrikesToday, TodayDate, WeekendToday } from "./TodayLive";

/**
 * "Avui a Catalunya" / "Hoy en Cataluña" / "Today in Catalonia".
 *
 * Static HTML: the structure, the links, the sources and dated fallbacks
 * from committed data, with no clock and no database. Each answer is an
 * island (TodayLive) that shows its fallback until the browser has worked
 * out today's date in Europe/Madrid, or read its CDN-cached endpoint.
 */

type LinkItem = { label: string; href: string; external?: boolean };

const LINK_WORDS: Record<Locale, Record<string, string>> = {
  ca: {
    holidayHub: "Festius per municipi",
    holidayToday: "És festiu avui? (tots els municipis)",
    holidayLocal: "Festius locals de cada municipi",
    holidayCalendar: "Calendari laboral",
    strikesHub: "Vaga avui: què funciona",
    strikesGeneral: "Vaga general de l'11 de novembre",
    rodaliesHub: "Rodalies en directe, línia per línia",
    rodaliesOfficial: "Estat oficial del servei",
    reservoirsHub: "Embassaments un per un",
    reservoirsGuide: "Embassaments avui: el total i el Ter-Llobregat",
    fuelHub: "Benzineres més barates per municipi i comarca",
    weekendAgenda: "Què fer aquest cap de setmana",
    weekendHub: "Fires i mercats per zones",
    weekendBridge: "El pont de desembre",
    snowPage: "Neu avui al Pirineu",
  },
  es: {
    holidayHub: "Festivos por municipio",
    holidayToday: "¿Es festivo hoy? (todos los municipios)",
    holidayLocal: "Festivos locales de cada municipio",
    holidayCalendar: "Calendario laboral",
    strikesHub: "Huelga hoy: qué funciona",
    strikesGeneral: "Huelga general del 11 de noviembre",
    rodaliesHub: "Rodalies en directo, línea por línea",
    rodaliesOfficial: "Estado oficial del servicio",
    reservoirsHub: "Embalses uno por uno",
    reservoirsGuide: "Embalses hoy: el total y el Ter-Llobregat",
    fuelHub: "Gasolineras más baratas por municipio y comarca",
    weekendAgenda: "Qué hacer este fin de semana",
    weekendHub: "Ferias y mercados por zonas",
    weekendBridge: "El puente de diciembre",
    snowPage: "Nieve hoy en el Pirineo",
  },
  en: {
    holidayHub: "",
    holidayToday: "Is today a holiday? (every town)",
    holidayLocal: "Local holidays by town",
    holidayCalendar: "Catalonia's public holidays",
    strikesHub: "Strike today: what runs",
    strikesGeneral: "General strike on 11 November",
    rodaliesHub: "Rodalies trains live",
    rodaliesOfficial: "Official service status",
    reservoirsHub: "Each reservoir",
    reservoirsGuide: "Reservoir levels today: the total and Ter-Llobregat",
    fuelHub: "Cheapest fuel by town (in Spanish)",
    weekendAgenda: "Things to do this weekend",
    weekendHub: "",
    weekendBridge: "The December long weekend",
    snowPage: "Snow in the Pyrenees today",
  },
};

function itemLinks(locale: Locale): Record<ItemKey, LinkItem[]> {
  const l = todayLinks(locale);
  const w = LINK_WORDS[locale];
  const some = (items: (LinkItem | null)[]) => items.filter((item): item is LinkItem => item !== null);
  return {
    holidays: some([
      l.holidays.hub ? { label: w.holidayHub!, href: l.holidays.hub } : null,
      { label: w.holidayToday!, href: l.holidays.today },
      locale === "en" ? { label: w.holidayLocal!, href: l.holidays.local } : null,
      { label: w.holidayCalendar!, href: l.holidays.calendar },
    ]),
    strikes: [
      { label: w.strikesHub!, href: l.strikes.hub },
      { label: w.strikesGeneral!, href: l.strikes.general },
    ],
    rodalies: [
      { label: w.rodaliesHub!, href: l.rodalies.hub },
      { label: w.rodaliesOfficial!, href: l.rodalies.official, external: true },
    ],
    reservoirs: [
      { label: w.reservoirsHub!, href: l.reservoirs.hub },
      { label: w.reservoirsGuide!, href: l.reservoirs.guide },
    ],
    fuel: [{ label: w.fuelHub!, href: l.fuel.hub }],
    weekend: some([
      { label: w.weekendAgenda!, href: l.weekend.agenda },
      l.weekend.hub ? { label: w.weekendHub!, href: l.weekend.hub } : null,
      { label: w.weekendBridge!, href: l.weekend.bridge },
    ]),
    snow: [{ label: w.snowPage!, href: l.snow.page }],
  };
}

function Item({ id, title, links, source, children, extra }: { id: string; title: string; links: LinkItem[]; source: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="ci-brief-item" aria-labelledby={`h-${id}`}>
      <h2 id={`h-${id}`}>{title}</h2>
      {children}
      {extra}
      <ul className="ci-brief-links">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} rel="noopener" target="_blank">
                {link.label}
              </a>
            ) : (
              <Link href={link.href}>{link.label}</Link>
            )}
          </li>
        ))}
      </ul>
      <p className="ci-brief-source">{source}</p>
    </section>
  );
}

function Fallback({ text }: { text: string }) {
  return <p className="ci-brief-line ci-brief-fallback">{text}</p>;
}

/** Section ids, stable across languages so a link to #rodalies works in each. */
const IDS: Record<ItemKey, string> = {
  holidays: "festius",
  strikes: "vagues",
  rodalies: "rodalies",
  reservoirs: "embassaments",
  fuel: "carburant",
  weekend: "cap-de-setmana",
  snow: "neu",
};

export function TodayPage({ locale }: { locale: Locale }) {
  const copy = pageCopy(locale);
  const crumbs = todayCrumbs(locale);
  const links = itemLinks(locale);
  const holidays = holidayData(locale);
  const lines = rodaliesLines(locale);
  const zones = todayLinks(locale).weekend.zones;
  const asOf = onDate(STRIKES_AS_OF, locale);

  return (
    <>
      <SiteHeader locale={locale} translations={todayTranslations()} activeSection={null} />
      <main id="main">
        <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell py-5 md:py-8 lg:py-12">
            <Breadcrumbs items={crumbs} locale={locale} />
            <p className="ci-label mb-3 max-md:hidden">{copy.kicker}</p>
            <h1 className="ci-measure">{copy.h1}</h1>
            <TodayDate locale={locale}>
              <p className="ci-brief-date">{copy.dateFallback}</p>
            </TodayDate>
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{copy.lead}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
              <span className="ci-verified">
                <span className="ci-verified-dot" aria-hidden="true" />
                <time dateTime={todayLastModified()}>{verifiedLine(locale)}</time>
              </span>
            </div>
          </div>
        </header>

        <div className="ci-shell py-8 md:py-10">
          <div className="ci-brief">
            <Item id={IDS.holidays} title={copy.headings.holidays} links={links.holidays} source={sourceLine("holidays", locale)}>
              <HolidayToday locale={locale} data={holidays}>
                <Fallback text={holidayFallback(locale)} />
              </HolidayToday>
            </Item>

            <Item id={IDS.strikes} title={copy.headings.strikes} links={links.strikes} source={sourceLine("strikes", locale)}>
              <StrikesToday locale={locale} strikes={todayStrikes(locale)} asOf={STRIKES_AS_OF} asOfText={asOf}>
                <Fallback text={strikesFallback(locale)} />
              </StrikesToday>
            </Item>

            <Item id={IDS.rodalies} title={copy.headings.rodalies} links={links.rodalies} source={sourceLine("rodalies", locale)}>
              <RodaliesToday locale={locale} lineNames={lines.names} lineHrefs={lines.hrefs}>
                <Fallback text={rodaliesFallback(locale)} />
              </RodaliesToday>
            </Item>

            <Item id={IDS.reservoirs} title={copy.headings.reservoirs} links={links.reservoirs} source={sourceLine("reservoirs", locale)}>
              <ReservoirsToday locale={locale} own={reservoirFallback().readings}>
                <Fallback text={reservoirsFallback(locale)} />
              </ReservoirsToday>
            </Item>

            <Item id={IDS.fuel} title={copy.headings.fuel} links={links.fuel} source={sourceLine("fuel", locale)}>
              <FuelToday locale={locale}>
                <Fallback text={fuelFallback(locale)} />
              </FuelToday>
            </Item>

            <Item
              id={IDS.weekend}
              title={copy.headings.weekend}
              links={links.weekend}
              source={sourceLine("weekend", locale)}
              extra={
                zones.length > 0 ? (
                  <p className="ci-brief-zones">
                    {zones.map((zone, index) => (
                      <span key={zone.href}>
                        {index > 0 ? " · " : null}
                        <Link href={zone.href}>{zone.label}</Link>
                      </span>
                    ))}
                  </p>
                ) : null
              }
            >
              <WeekendToday locale={locale} data={{ regional: holidays.regional, datePages: holidays.datePages }}>
                <Fallback text={weekendFallback(locale)} />
              </WeekendToday>
            </Item>

            <Item id={IDS.snow} title={copy.headings.snow} links={links.snow} source={sourceLine("snow", locale)}>
              <SnowToday locale={locale} season={snowSeason()}>
                <Fallback text={snowFallback(locale)} />
              </SnowToday>
            </Item>
          </div>

          <div className="ci-prose mt-12">
            <h2 id="com-funciona">{copy.aboutTitle}</h2>
            {aboutParagraphs(locale).map((text) => (
              <p key={text}>{text}</p>
            ))}

            <section className="mt-12">
              <h2 className="font-sans text-base font-semibold">{copy.sourcesTitle}</h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{copy.sourcesNote}</p>
              <ol className="ci-sources mt-3">
                {sources(locale).map((source) => (
                  <li key={source.url}>
                    <span>
                      <a href={source.url} rel="noopener nofollow" target="_blank">
                        {source.name}
                      </a>
                      <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
                      <span className="ml-1 text-xs text-[var(--color-faint)]">({source.note})</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>
      <JsonLd json={graph(todaySchemas(locale))} />
      <SiteFooter locale={locale} />
    </>
  );
}
