import Link from "next/link";

import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { renderInline } from "@/lib/content/inline";
import { comarcaPageFor, cityOrChainBySlug, provincePageFor } from "@/lib/programmatic/fuel/data";
import { fuelPath } from "@/lib/programmatic/fuel/paths";
import { caComarca, esName, joinList } from "@/lib/programmatic/holidays/names";
import { hubPath as rodaliesHub, linePath } from "@/lib/programmatic/rodalies/paths";
import { attribution, correctionNote, dayRange, fullDate, guidance, sectionTitles } from "@/lib/programmatic/weekend/copy";
import { SNAPSHOT, comarcaName, linesIn, meteocatUrl, weatherTowns } from "@/lib/programmatic/weekend/data";
import type { SnapshotFair } from "@/lib/programmatic/weekend/types";
import type { WeekendLocale, ZoneDef } from "@/lib/programmatic/weekend/zones";
import type { ProvinceCode } from "@/lib/programmatic/weekend/types";

/** Shared, server-rendered pieces of the weekend pages. Nothing here reads the clock. */

export const townName = (name: string, locale: WeekendLocale) => (locale === "es" ? esName(name) : name);

/** Comarca names in a sentence: "l'Alt Empordà, el Baix Empordà i la Selva" / "Alt Empordà, Baix Empordà y Selva". */
export function comarcaList(codes: readonly string[], locale: WeekendLocale): string {
  const names = codes.map((c) => (locale === "es" ? comarcaName(c) : caComarca(comarcaName(c))));
  return joinList(names, locale);
}

export function FairList({ fairs, locale, showComarca = true }: { fairs: readonly SnapshotFair[]; locale: WeekendLocale; showComarca?: boolean }) {
  return (
    <ul className="ci-agenda-list mt-3">
      {fairs.map((f) => {
        const name = f.name;
        const where = showComarca ? `${townName(f.town, locale)} (${comarcaName(f.comarca)})` : townName(f.town, locale);
        const note = correctionNote(f, locale);
        return (
          <li key={f.id} className="ci-agenda-item">
            <p className="ci-agenda-title">
              {f.web ? (
                <a href={f.web} rel="noopener nofollow" target="_blank">
                  {name}
                </a>
              ) : (
                name
              )}
            </p>
            <p className="ci-agenda-meta">
              {where} · {dayRange(f.start, f.end, locale)} · {locale === "es" ? f.sectorEs : f.sector}
            </p>
            {note ? <p className="ci-agenda-meta">{note}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export interface LinkItem {
  label: string;
  href: string;
  note?: string;
}

export function LinkList({ title, links, id }: { title: string; id: string; links: LinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href} className="!mt-0">
            <Link href={l.href}>{l.label}</Link>
            {l.note ? <span className="block text-xs text-[var(--color-muted)]">{l.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Guidance({ locale, zone, widerName }: { locale: WeekendLocale; zone: ZoneDef | null; widerName: string | null }) {
  const g = guidance(locale, zone, widerName, SNAPSHOT.sources.agenda.url, SNAPSHOT.sources.fairs.url);
  return (
    <section aria-labelledby="ci-weekend-guide">
      <h2 id="ci-weekend-guide">{g.title}</h2>
      {g.paragraphs.map((text) => (
        <p key={text}>{renderInline(text)}</p>
      ))}
    </section>
  );
}

/** Rodalies and regional lines with a station in the zone, each linked to its live status page. */
export function TrainSection({ zone, locale }: { zone: ZoneDef; locale: WeekendLocale }) {
  const t = sectionTitles(locale);
  const lines = linesIn(zone);
  return (
    <section aria-labelledby="ci-weekend-train">
      <h2 id="ci-weekend-train">{t.train}</h2>
      {lines.length === 0 ? (
        <p>{t.noStations}</p>
      ) : lines.length > 8 ? (
        <p>
          {t.moreLines}{" "}
          {lines.map((l, i) => (
            <span key={l.id}>
              {i > 0 ? ", " : ""}
              <Link href={linePath(locale, l.id)}>{l.name}</Link>
            </span>
          ))}
          .
        </p>
      ) : (
        <ul>
          {lines.map((l) => (
            <li key={l.id}>
              <Link href={linePath(locale, l.id)}>
                <strong>{l.name}</strong>
              </Link>{" "}
              ({l.journey}): {joinList(l.stations, locale)}.
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href={rodaliesHub(locale)}>{t.liveStatus}</Link>.
      </p>
    </section>
  );
}

function provinceLabel(code: ProvinceCode, locale: WeekendLocale): string {
  const name = provincePageFor(code).name;
  return locale === "es" ? `provincia de ${name}` : `província de ${name}`;
}

/** The fuel pages that cover the zone: its city, comarques with a page, and provinces. */
export function fuelLinks(zone: ZoneDef, locale: WeekendLocale, provinces: readonly ProvinceCode[], comarques: readonly string[]): LinkItem[] {
  const links: LinkItem[] = [];
  if (zone.kind === "city") {
    const city = cityOrChainBySlug(zone.slug.ca);
    if (city && city.kind === "city") links.push({ label: townName(city.name, locale), href: fuelPath(locale, "city", city.slug) });
  }
  if (zone.kind === "brand" || zone.kind === "comarca") {
    for (const code of comarques) {
      const page = comarcaPageFor(code);
      if (page) links.push({ label: page.name, href: fuelPath(locale, "comarca", page.slug) });
    }
  }
  for (const code of provinces) {
    const page = provincePageFor(code);
    links.push({ label: provinceLabel(code, locale), href: fuelPath(locale, "province", page.slug) });
  }
  return links;
}

export function CarSection({ links, locale }: { links: LinkItem[]; locale: WeekendLocale }) {
  const t = sectionTitles(locale);
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="ci-weekend-car">
      <h2 id="ci-weekend-car">{t.car}</h2>
      <p>
        {t.fuelLine}{" "}
        {links.map((l, i) => (
          <span key={l.href}>
            {i > 0 ? (i === links.length - 1 ? (locale === "es" ? " y " : " i ") : ", ") : ""}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
        .
      </p>
    </section>
  );
}

export function WeatherSection({ zone, locale }: { zone: ZoneDef; locale: WeekendLocale }) {
  const t = sectionTitles(locale);
  const towns = weatherTowns(zone);
  const extra: LinkItem[] = [];
  if (zone.guides.includes("snowNow")) extra.push({ label: B2_TITLES.snowNow[locale], href: b2href("snowNow", locale) });
  if (zone.guides.includes("climate")) extra.push({ label: B2_TITLES.climate[locale], href: b2href("climate", locale) });
  return (
    <section aria-labelledby="ci-weekend-weather">
      <h2 id="ci-weekend-weather">{t.weather}</h2>
      <p>
        {t.weatherLine}{" "}
        {towns.map((m, i) => (
          <span key={m.ine}>
            {i > 0 ? (i === towns.length - 1 ? (locale === "es" ? " y " : " i ") : ", ") : ""}
            <a href={meteocatUrl(m)} rel="noopener" target="_blank">
              {townName(m.name, locale)}
            </a>
          </span>
        ))}
        .
      </p>
      {extra.length > 0 ? (
        <ul>
          {extra.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function Sources({ locale }: { locale: WeekendLocale }) {
  const t = sectionTitles(locale);
  const { agenda, fairs, register, brands } = SNAPSHOT.sources;
  const items = [agenda, fairs, brands, register];
  const date = (iso: string | null) => (iso ? fullDate(iso, locale) : "");
  return (
    <section className="mt-12" aria-labelledby="ci-weekend-sources">
      <h2 id="ci-weekend-sources" className="font-sans text-base font-semibold">
        {t.sources}
      </h2>
      <p className="mt-1 text-sm">{renderInline(attribution(locale, { agenda: date(agenda.updated), fairs: date(fairs.updated) }))}</p>
      <ol className="ci-sources mt-3">
        {items.map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} rel="noopener nofollow" target="_blank">
                {source.name}
              </a>
              <span className="text-[var(--color-muted)]">
                {" "}
                — {source.publisher}
                {source.updated ? (locale === "es" ? `, actualizado el ${date(source.updated)}` : `, actualitzat el ${date(source.updated)}`) : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {locale === "es" ? `Datos leídos el ${date(SNAPSHOT.readOn)}.` : `Dades llegides el ${date(SNAPSHOT.readOn)}.`}
      </p>
    </section>
  );
}
