import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { AGENDA_SOURCE, type WeekendWindow } from "@/lib/content/weekend/agenda";
import { EVERGREEN } from "@/lib/content/weekend/evergreen";
import { getMessages } from "@/lib/i18n";
import { HUB_CRUMB, fullDate, hubMeta, liveLabels, longWeekendNote, rangeLong, sectionTitles } from "@/lib/programmatic/weekend/copy";
import { SNAPSHOT, fairsAfter, fairsIn, fairsInWindow, shippedZones } from "@/lib/programmatic/weekend/data";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import type { WeekendLocale } from "@/lib/programmatic/weekend/zones";

import { FairList, Guidance, LinkList, Sources } from "./parts";
import { WeekendLive } from "./WeekendLive";

export function hubCrumbs(locale: WeekendLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: weekendHubPath(locale) },
  ];
}

const COPY: Record<WeekendLocale, { lead: string; agendaFairs: string; zonesNote: string }> = {
  ca: {
    lead: "Les fires i fires mercat d'aquest cap de setmana a tot Catalunya, del calendari oficial de fires de la Generalitat, i les fires i mercats que publica l'Agenda Cultural de Catalunya. Per a la resta de plans, tria la teva zona.",
    agendaFairs: "Fires i mercats a l'Agenda Cultural",
    zonesNote:
      "Cada zona té la seva agenda del cap de setmana, les fires, com arribar-hi en tren i el temps. Només tenen pàgina les zones on, al llarg de l'últim any, l'agenda oficial ha tingut prou activitats tres caps de setmana de cada quatre.",
  },
  es: {
    lead: "Las ferias y ferias mercado de este fin de semana en toda Cataluña, del calendario oficial de ferias de la Generalitat, y las ferias y mercados que publica la Agenda Cultural de Catalunya. Para el resto de planes, elige tu zona.",
    agendaFairs: "Ferias y mercados en la Agenda Cultural",
    zonesNote:
      "Cada zona tiene su agenda del fin de semana, las ferias, cómo llegar en tren y el tiempo. Solo tienen página las zonas donde, durante el último año, la agenda oficial ha tenido suficientes actividades tres fines de semana de cada cuatro.",
  },
};

export function HubPage({ locale, window }: { locale: WeekendLocale; window: WeekendWindow }) {
  const t = sectionTitles(locale);
  const meta = hubMeta(locale, window);
  const copy = COPY[locale];
  const messages = getMessages(locale).weekendAgenda;
  const all = fairsIn(null);
  const now = fairsInWindow(all, window);
  const next = fairsAfter(all, window, 12);
  const longNote = longWeekendNote(window, locale);
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
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="fires" className="!mt-0">
            {t.fairsNow}
          </h2>
          {now.length > 0 ? (
            <>
              <FairList fairs={now} locale={locale} />
              <p className="ci-agenda-note">{t.fairsNote}</p>
            </>
          ) : (
            <p>{t.noFairs}</p>
          )}

          <h2 id="agenda">{copy.agendaFairs}</h2>
          <WeekendLive
            locale={locale}
            labels={liveLabels(locale, messages.categories, messages.free)}
            filter={{}}
            wider={null}
            where={locale === "es" ? "en Cataluña" : "a Catalunya"}
            widerText={null}
            capital={null}
            fairs={now.length}
            category="fairs"
            guard={false}
            agendaUrl={AGENDA_SOURCE.url}
            cataloniaHref={`/${locale}/${EVERGREEN[locale].path}/`}
          />
        </div>

        <LinkList title={t.hubZones} id="ci-weekend-zones" links={zones} />
        <p className="mt-3 text-sm text-[var(--color-muted)]">{copy.zonesNote}</p>
        <p className="mt-3 text-sm">
          <Link href={`/${locale}/${EVERGREEN[locale].path}/`}>{t.cataloniaPage}</Link>
        </p>

        <div className="ci-prose mt-10">
          <h2 id="properes-fires">{t.fairsNext}</h2>
          {next.length > 0 ? <FairList fairs={next} locale={locale} /> : <p>{t.noFairsAfter(fullDate(SNAPSHOT.readOn, locale))}</p>}
          <Guidance locale={locale} zone={null} widerName={null} />
        </div>

        <LinkList
          title={t.guides}
          id="ci-weekend-guides"
          links={(["christmas", "pessebres", "decemberBridge"] as const).map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) }))}
        />
        <Sources locale={locale} />
      </div>
    </article>
  );
}
