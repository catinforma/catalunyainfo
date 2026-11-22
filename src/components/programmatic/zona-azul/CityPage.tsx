import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { LinkList } from "@/components/programmatic/weekend/parts";
import { ShareBar } from "@/components/share/ShareBar";
import { getMessages } from "@/lib/i18n";
import { cityView, hubRow, primaryRule, ruleSentence, type Sourced } from "@/lib/programmatic/zona-azul/copy";
import { CITIES } from "@/lib/programmatic/zona-azul/data";
import { caDe, listText } from "@/lib/programmatic/zona-azul/format";
import { cityHolidays, holidayCalendarPath, holidayEntries } from "@/lib/programmatic/zona-azul/holidays";
import { BARCELONA_GUIDE, zaCityPath, zaHubPath } from "@/lib/programmatic/zona-azul/paths";
import type { City, Source, ZaLocale } from "@/lib/programmatic/zona-azul/types";

import { TodayStatus } from "./TodayStatus";

export const HUB_CRUMB: Record<ZaLocale, string> = { es: "Zona azul", ca: "Zona blava", en: "Blue zone parking" };

export function hubCrumbs(locale: ZaLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: zaHubPath(locale) },
  ];
}

export function cityCrumbs(city: City, locale: ZaLocale): Crumb[] {
  return [...hubCrumbs(locale), { label: city.name[locale], href: zaCityPath(locale, city.slug) }];
}

const SOURCE_WORD: Record<ZaLocale, string> = { es: "Fuente", ca: "Font", en: "Source" };

/** The numbers of the sources a fact was read on, linked to the list at the foot of the page. */
export function Refs({ ids, sources, locale }: { ids: readonly string[]; sources: readonly Source[]; locale: ZaLocale }) {
  const numbers = ids.map((id) => sources.findIndex((s) => s.id === id) + 1).filter((n) => n > 0);
  if (numbers.length === 0) return null;
  return (
    <sup className="ml-0.5 whitespace-nowrap text-xs">
      {numbers.map((n, i) => (
        <span key={n}>
          {i > 0 ? ", " : ""}
          <a href={`#src-${n}`} aria-label={`${SOURCE_WORD[locale]} ${n}`}>
            {n}
          </a>
        </span>
      ))}
    </sup>
  );
}

export function SourceList({ title, sources, note, id = "fuentes" }: { title: string; sources: readonly Source[]; note: string; id?: string }) {
  return (
    <section className="mt-12" aria-labelledby={id}>
      <h2 id={id} className="font-sans text-base font-semibold">
        {title}
      </h2>
      <ol className="ci-sources mt-3">
        {sources.map((s, i) => (
          <li key={s.id} id={`src-${i + 1}`}>
            <span>
              <a href={s.url} rel="noopener nofollow" target="_blank">
                {s.name}
              </a>
              <span className="text-[var(--color-muted)]"> — {s.publisher}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{note}</p>
    </section>
  );
}

function Table({ caption, head, children }: { caption: ReactNode; head: string[]; children: ReactNode }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const HOLIDAY_LINK: Record<ZaLocale, (name: string) => { before: string; label: string }> = {
  es: (name) => ({ before: "Los festivos que cuentan son los del calendario laboral de la ciudad: ", label: `festivos de ${name}` }),
  ca: (name) => ({ before: "Els festius que compten són els del calendari laboral de la ciutat: ", label: `festius ${caDe(name)}` }),
  en: (name) => ({ before: "The public holidays that count are those of the city's official calendar: ", label: `public holidays in ${name}` }),
};

const MORE: Record<ZaLocale, { hub: string; hubNote: string; barcelona: string; barcelonaNote: string }> = {
  es: { hub: "Zona azul por ciudad", hubNote: "Tabla de horarios y precios", barcelona: "Barcelona", barcelonaNote: "Guía de la zona azul y la zona verde" },
  ca: { hub: "Zona blava per ciutat", hubNote: "Taula d'horaris i preus", barcelona: "Barcelona", barcelonaNote: "Guia de la zona blava i la zona verda" },
  en: { hub: "Blue zone parking by city", hubNote: "Table of hours and prices", barcelona: "Barcelona", barcelonaNote: "Guide to the blue and green zones" },
};

/** One city's regulated street parking: the answer for today, the timetable, the zones, the prices and their sources. */
export function CityPage({ city, locale }: { city: City; locale: ZaLocale }) {
  const v = cityView(city, locale);
  const crumbs = cityCrumbs(city, locale);
  const path = zaCityPath(locale, city.slug);
  const calendar = cityHolidays(city);
  const calendarPath = holidayCalendarPath(city, locale);
  const holidayLink = HOLIDAY_LINK[locale](city.name[locale]);
  const more = MORE[locale];
  const facts = (items: Sourced[]) => (
    <ul>
      {items.map((item) => (
        <li key={item.text}>
          {item.text}
          <Refs ids={item.src} sources={city.sources} locale={locale} />
        </li>
      ))}
    </ul>
  );
  const paragraphs = (items: Sourced[]) =>
    items.map((item) => (
      <p key={item.text}>
        {item.text}
        <Refs ids={item.src} sources={city.sources} locale={locale} />
      </p>
    ));
  const links = [
    { label: more.hub, href: zaHubPath(locale), note: more.hubNote },
    ...CITIES.filter((c) => c.slug !== city.slug).map((c) => ({ label: c.name[locale], href: zaCityPath(locale, c.slug), note: hubRow(c, locale).weekday })),
    { label: more.barcelona, href: BARCELONA_GUIDE[locale], note: more.barcelonaNote },
  ];

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1 className="ci-measure">{v.h1}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{v.lead}</p>
          <ShareBar locale={locale} path={path} title={v.h1} contentType="zona_azul_city" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="hoy">{v.headings.today}</h2>
          <TodayStatus
            locale={locale}
            city={city.name[locale]}
            rule={primaryRule(city)}
            holidays={holidayEntries(city, locale)}
            localYears={calendar.localYears}
            through={calendar.through}
            fallback={ruleSentence(city, locale)}
          />
          {calendarPath ? (
            <p>
              {holidayLink.before}
              <Link href={calendarPath}>{holidayLink.label}</Link>.
            </p>
          ) : null}

          <h2 id="horario">{v.headings.hours}</h2>
          {v.timetable.map((group) => (
            <Table key={group.zones.join()} caption={listText(group.zones, locale)} head={[v.cols.day, v.cols.hours]}>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    {row.hours}
                    <Refs ids={row.src} sources={city.sources} locale={locale} />
                  </td>
                </tr>
              ))}
            </Table>
          ))}
          <p>{v.signNote}</p>
          {v.hourNotes.length > 0 ? facts(v.hourNotes) : null}

          <h2 id="zonas">{v.headings.zones}</h2>
          <Table caption={v.operator ?? v.headings.zones} head={[v.cols.zone, v.cols.who, v.cols.stay]}>
            {v.zones.map((zone) => (
              <tr key={zone.name}>
                <th scope="row">{zone.name}</th>
                <td>
                  {zone.who}
                  <Refs ids={zone.src} sources={city.sources} locale={locale} />
                </td>
                <td>{zone.stay}</td>
              </tr>
            ))}
          </Table>

          <h2 id="precios">{v.headings.prices}</h2>
          <Table caption={v.headings.prices} head={[v.cols.zone, v.cols.min, v.cols.hour1, v.cols.hour2, v.cols.max]}>
            {v.prices.map((row) => (
              <tr key={row.zone}>
                <th scope="row">
                  {row.zone}
                  <Refs ids={row.src} sources={city.sources} locale={locale} />
                </th>
                {row.cells ? (
                  <>
                    <td>{row.cells.min}</td>
                    <td>{row.cells.hour1}</td>
                    <td>{row.cells.hour2}</td>
                    <td>{row.cells.max}</td>
                  </>
                ) : (
                  <td colSpan={4}>{row.note}</td>
                )}
              </tr>
            ))}
          </Table>
          {v.notes.length > 0 ? facts(v.notes) : null}

          <h2 id="denuncia">{v.headings.cancel}</h2>
          {paragraphs(v.cancel)}

          <h2 id="verano">{v.headings.summer}</h2>
          {facts(v.summer)}

          <h2 id="pago">{v.headings.pay}</h2>
          {paragraphs(v.pay)}

          <h2 id="exentos">{v.headings.exempt}</h2>
          {facts(v.exempt)}

          <h2 id="preguntas">{v.headings.faq}</h2>
          {v.faq.map((item) => (
            <section key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}

          <LinkList title={v.headings.more} id="otras-ciudades" links={links} />

          <SourceList title={v.headings.sources} sources={city.sources} note={v.checked} />

          <ShareBar locale={locale} path={path} title={v.h1} contentType="zona_azul_city" variant="full" />
        </div>
      </div>
    </article>
  );
}
