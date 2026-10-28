import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { AGENDA_SOURCE, type WeekendWindow } from "@/lib/content/weekend/agenda";
import { EVERGREEN } from "@/lib/content/weekend/evergreen";
import { getMessages } from "@/lib/i18n";
import { HUB_CRUMB, fullDate, liveLabels, longWeekendNote, rangeLong, sectionTitles, widerPhrase, zoneH1, zoneLead, zoneScope } from "@/lib/programmatic/weekend/copy";
import {
  SNAPSHOT,
  comarquesIn,
  fairsAfter,
  fairsIn,
  fairsInWindow,
  municipalitiesIn,
  municipality,
  shippedZones,
  widerZone,
} from "@/lib/programmatic/weekend/data";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import type { ProvinceCode } from "@/lib/programmatic/weekend/types";
import { zoneFilter, type WeekendLocale, type ZoneDef } from "@/lib/programmatic/weekend/zones";

import { CarSection, FairList, Guidance, LinkList, Sources, TrainSection, WeatherSection, comarcaList, fuelLinks, townName } from "./parts";
import { WeekendLive } from "./WeekendLive";

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

/** One zone, for the weekend `window` the render was made in. */
export function ZonePage({ zone, locale, window }: { zone: ZoneDef; locale: WeekendLocale; window: WeekendWindow }) {
  const t = sectionTitles(locale);
  const messages = getMessages(locale).weekendAgenda;
  const towns = municipalitiesIn(zone);
  const comarques = comarquesIn(zone);
  const provinces = [...new Set(towns.map((m) => m.province))].sort() as ProvinceCode[];
  const capital = zone.capital ? (municipality(zone.capital) ?? null) : null;
  const wider = widerZone(zone);
  const widerText = wider ? widerPhrase(wider, locale) : null;

  const zoneFairs = fairsIn(zone);
  const fairsNow = fairsInWindow(zoneFairs, window);
  const fairsNext = fairsAfter(zoneFairs, window, 8);
  const longNote = longWeekendNote(window, locale);
  const brandNames = (zone.brands ?? []).map((b) => BRAND_NAMES[locale][b] ?? b).join(locale === "es" ? " y " : " i ");

  const others = shippedZones()
    .filter((z) => z.id !== zone.id)
    .map((z) => ({ label: z.name[locale], href: zonePath(locale, z) }));
  const guides = zone.guides
    .filter((key) => key !== "snowNow" && key !== "climate")
    .map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) }));

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

          <h2 id="agenda">{window.long ? messages.titleLong : messages.title}</h2>
          <WeekendLive
            locale={locale}
            labels={liveLabels(locale, messages.categories, messages.free)}
            filter={zoneFilter(zone)}
            wider={wider ? zoneFilter(wider) : null}
            where={zone.in[locale]}
            widerText={widerText}
            capital={capital ? { ine: capital.ine, name: townName(capital.name, locale) } : null}
            fairs={fairsNow.length}
            agendaUrl={AGENDA_SOURCE.url}
            cataloniaHref={`/${locale}/${EVERGREEN[locale].path}/`}
          />

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
        <Sources locale={locale} />
      </div>
    </article>
  );
}
