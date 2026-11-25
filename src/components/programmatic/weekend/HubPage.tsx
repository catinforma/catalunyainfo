import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { MarketsContextLine, marketTownsInZone } from "@/components/programmatic/weekly-markets/ContextLinks";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import type { WeekendWindow } from "@/lib/content/weekend/agenda";
import { EVERGREEN } from "@/lib/content/weekend/evergreen";
import { getMessages } from "@/lib/i18n";
import { SEASON, SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { mergeBarcelona } from "@/lib/programmatic/weekend/agenda-list";
import type { WeekendAgendas } from "@/lib/programmatic/weekend/agenda-server";
import { christmasFairsThisWeekend } from "@/lib/programmatic/weekend/christmas-weekend";
import { HUB_CRUMB, fullDate, hubMeta, longWeekendNote, rangeLong, sectionTitles } from "@/lib/programmatic/weekend/copy";
import { SNAPSHOT, listedFairs, shippedZones } from "@/lib/programmatic/weekend/data";
import { hubFacts } from "@/lib/programmatic/weekend/facts";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import { zoneById, type WeekendLocale } from "@/lib/programmatic/weekend/zones";

import { AgendaList, AgendaSources, ChristmasThisWeekend } from "./AgendaList";
import { WeekendFactsTable, WeekendFaq } from "./WeekendFacts";
import { FairList, Guidance, LinkList, Sources } from "./parts";

export function hubCrumbs(locale: WeekendLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: weekendHubPath(locale) },
  ];
}

const COPY: Record<WeekendLocale, { lead: string; barcelona: (n: number | null) => string; zonesNote: string }> = {
  ca: {
    lead: "Les fires i fires mercat d'aquest cap de setmana a tot Catalunya, del calendari oficial de fires de la Generalitat, i les fires i mercats que publica l'Agenda Cultural de Catalunya. Per a la resta de plans, tria la teva zona.",
    barcelona: (n) => (n ? `: ${n} activitats de l'agenda de l'Ajuntament i de la Generalitat, dia a dia.` : ": l'agenda de l'Ajuntament, dia a dia."),
    zonesNote:
      "Cada zona té la seva agenda del cap de setmana, les fires, com arribar-hi en tren i el temps. Només tenen pàgina les zones on, al llarg de l'últim any, l'agenda oficial ha tingut prou activitats tres caps de setmana de cada quatre.",
  },
  es: {
    lead: "Las ferias y ferias mercado de este fin de semana en toda Cataluña, del calendario oficial de ferias de la Generalitat, y las ferias y mercados que publica la Agenda Cultural de Catalunya. Para el resto de planes, elige tu zona.",
    barcelona: (n) => (n ? `: ${n} actividades de la agenda del Ayuntamiento y de la Generalitat, día a día.` : ": la agenda del Ayuntamiento, día a día."),
    zonesNote:
      "Cada zona tiene su agenda del fin de semana, las ferias, cómo llegar en tren y el tiempo. Solo tienen página las zonas donde, durante el último año, la agenda oficial ha tenido suficientes actividades tres fines de semana de cada cuatro.",
  },
};

/** How a sentence places the Catalonia-wide page. */
export const HUB_WHERE: Record<WeekendLocale, string> = { ca: "a Catalunya", es: "en Cataluña" };

const BARCELONA = zoneById("barcelona");
const BARCELONA_LINK: Record<WeekendLocale, string> = { ca: "Què fer a Barcelona aquest cap de setmana", es: "Qué hacer en Barcelona este fin de semana" };

export function HubPage({ locale, window, agendas }: { locale: WeekendLocale; window: WeekendWindow; agendas: WeekendAgendas }) {
  const t = sectionTitles(locale);
  const meta = hubMeta(locale, window);
  const copy = COPY[locale];
  const { now, next } = listedFairs(null, window);
  const items = agendas.gencat.read?.items ?? [];
  const sources = [{ source: "gencat" as const, view: agendas.gencat }];
  const barcelonaCount = agendas.bcn.read ? mergeBarcelona(agendas.bcn.read.items, items).length : null;
  const christmas = christmasFairsThisWeekend(window, agendas.today, locale);
  const longNote = longWeekendNote(window, locale);
  const facts = hubFacts(locale, agendas, HUB_WHERE[locale]);
  const zones = shippedZones().map((z) => ({ label: z.name[locale], href: zonePath(locale, z) }));

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-3 text-lg font-semibold">
            <time dateTime={window.from}>{rangeLong(window, locale)}</time>
          </p>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{copy.lead}</p>
          {longNote ? <p className="ci-measure mt-3">{longNote}</p> : null}
          <ShareBar locale={locale} path={crumbPath(hubCrumbs(locale))} title={meta.h1} contentType="weekend_hub" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <WeekendFactsTable facts={facts} />

          <h2 id="fires">{t.fairsNow}</h2>
          {now.length > 0 ? (
            <>
              <FairList fairs={now} locale={locale} />
              <p className="ci-agenda-note">{t.fairsNote}</p>
            </>
          ) : (
            <p>{t.noFairs}</p>
          )}

          <ChristmasThisWeekend locale={locale} towns={christmas} id="nadal" />

          <p>
            <Link href={zonePath(locale, BARCELONA)}>{BARCELONA_LINK[locale]}</Link>
            {copy.barcelona(barcelonaCount)}
          </p>

          <AgendaList locale={locale} id="agenda" window={window} today={agendas.today} items={items} sources={sources} more="gencat" showTown />
        </div>

        <LinkList title={t.hubZones} id="ci-weekend-zones" links={zones} />
        <p className="mt-3 text-sm text-[var(--color-muted)]">{copy.zonesNote}</p>
        <p className="mt-3 text-sm">
          <Link href={`/${locale}/${EVERGREEN[locale].path}/`}>{t.cataloniaPage}</Link>
        </p>

        <div className="ci-prose mt-10">
          <MarketsContextLine locale={locale} />

          <h2 id="properes-fires">{t.fairsNext}</h2>
          {next.length > 0 ? <FairList fairs={next} locale={locale} /> : <p>{t.noFairsAfter(fullDate(SNAPSHOT.readOn, locale))}</p>}
          <Guidance locale={locale} zone={null} widerName={null} />
          <WeekendFaq facts={facts} />
        </div>

        <LinkList
          title={t.guides}
          id="ci-weekend-guides"
          links={[
            ...(["christmas", "pessebres", "decemberBridge"] as const).map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) })),
            ...(window.from <= SEASON.to ? [{ label: locale === "es" ? `Ferias de Navidad ${SEASON_YEAR} por municipio` : `Fires de Nadal ${SEASON_YEAR} per municipi`, href: fairsHubPath(locale) }] : []),
          ]}
        />
        <AgendaSources locale={locale} sources={sources} />
        <Sources locale={locale} />
        <ShareBar locale={locale} path={crumbPath(hubCrumbs(locale))} title={meta.h1} contentType="weekend_hub" variant="full" />
      </div>
    </article>
  );
}
