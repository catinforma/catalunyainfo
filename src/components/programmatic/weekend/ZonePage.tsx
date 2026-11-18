import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import type { WeekendWindow } from "@/lib/content/weekend/agenda";
import { EVERGREEN } from "@/lib/content/weekend/evergreen";
import { getMessages } from "@/lib/i18n";
import { SEASON, SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { buildView, inPlace, mergeBarcelona } from "@/lib/programmatic/weekend/agenda-list";
import type { WeekendAgendas } from "@/lib/programmatic/weekend/agenda-server";
import { christmasFairsThisWeekend } from "@/lib/programmatic/weekend/christmas-weekend";
import { HUB_CRUMB, fullDate, longWeekendNote, rangeLong, sectionTitles, widerPhrase, zoneH1, zoneLead, zoneScope } from "@/lib/programmatic/weekend/copy";
import {
  SNAPSHOT,
  comarquesIn,
  listedFairs,
  municipalitiesIn,
  municipality,
  shippedZones,
  widerZone,
} from "@/lib/programmatic/weekend/data";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import type { ProvinceCode } from "@/lib/programmatic/weekend/types";
import { MIN_EVENTS, zoneFilter, type WeekendLocale, type ZoneDef } from "@/lib/programmatic/weekend/zones";

import { AgendaList, AgendaSources, ChristmasThisWeekend } from "./AgendaList";
import { CarSection, FairList, Guidance, LinkList, Sources, TrainSection, WeatherSection, comarcaList, fuelLinks, townName } from "./parts";

const WIDER_HEADING: Record<WeekendLocale, (name: string) => string> = {
  ca: (name) => `Més plans a prop: ${name}`,
  es: (name) => `Más planes cerca: ${name}`,
};

export function zoneCrumbs(zone: ZoneDef, locale: WeekendLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: weekendHubPath(locale) },
    { label: zone.name[locale], href: zonePath(locale, zone) },
  ];
}

const BRAND_NAMES: Record<WeekendLocale, Record<string, string>> = {
  ca: { MT01: "la marca turística Pirineus", MT02: "la marca turística Costa Brava", MT05: "la marca turística Costa Daurada", MT10: "la marca Val d'Aran" },
  es: { MT01: "la marca turística Pirineus", MT02: "la marca turística Costa Brava", MT05: "la marca turística Costa Daurada", MT10: "la marca Val d'Aran" },
};

/**
 * One zone, for the weekend `window` the render was made in. The agenda is
 * the Generalitat's, filtered to the zone; Barcelona's is the Ajuntament's
 * own (Open Data BCN) plus the Generalitat's Barcelona items it lacks. Below
 * MIN_EVENTS (activities + the fairs calendar's fairs) the wider zone's list
 * follows, and says so: the doorway guardrail, now on the server.
 */
export function ZonePage({ zone, locale, window, agendas }: { zone: ZoneDef; locale: WeekendLocale; window: WeekendWindow; agendas: WeekendAgendas }) {
  const t = sectionTitles(locale);
  const towns = municipalitiesIn(zone);
  const comarques = comarquesIn(zone);
  const provinces = [...new Set(towns.map((m) => m.province))].sort() as ProvinceCode[];
  const capital = zone.capital ? (municipality(zone.capital) ?? null) : null;
  const wider = widerZone(zone);
  const widerText = wider ? widerPhrase(wider, locale) : null;

  const { now: fairsNow, next: fairsNext } = listedFairs(zone, window);
  const filter = zoneFilter(zone);
  const gencat = agendas.gencat.read?.items ?? [];
  const isBarcelona = zone.id === "barcelona";
  const zoneItems = gencat.filter((i) => inPlace(i, filter));
  const items = isBarcelona && agendas.bcn.read ? mergeBarcelona(agendas.bcn.read.items, zoneItems) : zoneItems;
  const sources = isBarcelona
    ? [
        { source: "bcn" as const, view: agendas.bcn },
        { source: "gencat" as const, view: agendas.gencat },
      ]
    : [{ source: "gencat" as const, view: agendas.gencat }];
  const short = agendas.gencat.read !== null && buildView(items, window, agendas.today).counts.all + fairsNow.length < MIN_EVENTS;
  const widerFilter = wider ? zoneFilter(wider) : null;
  const zoneIds = new Set(items.map((i) => i.id));
  const widerItems = short && widerFilter ? gencat.filter((i) => inPlace(i, widerFilter) && !zoneIds.has(i.id)) : [];
  const christmas = christmasFairsThisWeekend(window, agendas.today, locale, filter);
  const longNote = longWeekendNote(window, locale);
  const brandNames = (zone.brands ?? []).map((b) => BRAND_NAMES[locale][b] ?? b).join(locale === "es" ? " y " : " i ");

  const others = shippedZones()
    .filter((z) => z.id !== zone.id)
    .map((z) => ({ label: z.name[locale], href: zonePath(locale, z) }));
  const guides = zone.guides
    .filter((key) => key !== "snowNow" && key !== "climate")
    .map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) }));
  // Until the Christmas season ends, the dated Christmas fairs town by town.
  if (window.from <= SEASON.to) guides.push({ label: locale === "es" ? `Ferias de Navidad ${SEASON_YEAR} por municipio` : `Fires de Nadal ${SEASON_YEAR} per municipi`, href: fairsHubPath(locale) });

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={zoneCrumbs(zone, locale)} locale={locale} />
          <h1 className="ci-measure">{zoneH1(zone, locale)}</h1>
          <p className="ci-measure mt-3 text-lg font-semibold">
            <time dateTime={window.from}>{rangeLong(window, locale)}</time>
          </p>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{zoneLead(zone, locale)}</p>
          {longNote ? <p className="ci-measure mt-3">{longNote}</p> : null}
          <ShareBar locale={locale} path={crumbPath(zoneCrumbs(zone, locale))} title={zoneH1(zone, locale)} contentType="weekend_zone" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="!mt-0">
            {zoneScope(zone, locale, {
              towns: towns.length,
              comarques: comarcaList(comarques, locale),
              comarcaCount: comarques.length,
              capital: capital ? townName(capital.name, locale) : null,
              brandNames,
            })}
          </p>

          <h2 id="fires">{t.fairsNow}</h2>
          {fairsNow.length > 0 ? (
            <>
              <FairList fairs={fairsNow} locale={locale} />
              <p className="ci-agenda-note">{t.fairsNote}</p>
            </>
          ) : (
            <p>{t.noFairs}</p>
          )}

          <ChristmasThisWeekend locale={locale} towns={christmas} id="nadal" />

          <AgendaList
            locale={locale}
            id="agenda"
            window={window}
            today={agendas.today}
            items={items}
            sources={sources}
            more={isBarcelona ? "bcn" : "gencat"}
            showTown={!isBarcelona}
          />
          {wider && widerItems.length > 0 ? (
            <AgendaList
              locale={locale}
              id="agenda-a-prop"
              heading={WIDER_HEADING[locale](wider.name[locale])}
              window={window}
              today={agendas.today}
              items={widerItems}
              sources={[{ source: "gencat", view: agendas.gencat }]}
              more="gencat"
              showTown
            />
          ) : null}

          <h2 id="properes-fires">{t.fairsNext}</h2>
          {fairsNext.length > 0 ? <FairList fairs={fairsNext} locale={locale} /> : <p>{t.noFairsAfter(fullDate(SNAPSHOT.readOn, locale))}</p>}

          <TrainSection zone={zone} locale={locale} />
          <CarSection links={fuelLinks(zone, locale, provinces, comarques)} locale={locale} />
          <WeatherSection zone={zone} locale={locale} />
          <Guidance locale={locale} zone={zone} widerName={widerText} />
        </div>

        <LinkList title={t.guides} id="ci-weekend-guides" links={guides} />
        <LinkList title={t.zones} id="ci-weekend-zones" links={others} />
        <p className="mt-4 text-sm">
          <Link href={weekendHubPath(locale)}>{t.allZones}</Link> ·{" "}
          <Link href={`/${locale}/${EVERGREEN[locale].path}/`}>{t.cataloniaPage}</Link>
        </p>
        <AgendaSources locale={locale} sources={sources} />
        <Sources locale={locale} />
        <ShareBar locale={locale} path={crumbPath(zoneCrumbs(zone, locale))} title={zoneH1(zone, locale)} contentType="weekend_zone" variant="full" />
      </div>
    </article>
  );
}
