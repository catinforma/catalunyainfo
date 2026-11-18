import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { TownHub } from "@/components/TownHub";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { townHub } from "@/lib/engagement/town-hub";
import { getMessages } from "@/lib/i18n";
import { renderInline } from "@/lib/content/inline";
import { workCalendarLine } from "@/lib/programmatic/holidays/copy";
import { YEAR, comarcaBySlug, isAran, regionalDays, unlistedYearRows, type UnlistedTown } from "@/lib/programmatic/holidays/data";
import { OFFICIAL } from "@/lib/programmatic/holidays/links";
import { caComarca, caDe } from "@/lib/programmatic/holidays/names";
import { comarcaPath, hubPath, municipalityPath, type MuniLocale } from "@/lib/programmatic/holidays/paths";
import { slugify } from "@/lib/programmatic/holidays/slug";
import { unlistedCopy } from "@/lib/programmatic/holidays/unlisted-copy";

import { CouncilSourceLine, DateList, GuideLinks, HolidayTable, Sources } from "./parts";

/** Home > Festius locals > (the comarca's table) > the town. */
export function unlistedCrumbs(u: UnlistedTown, locale: MuniLocale): Crumb[] {
  const home = getMessages(locale).common.home;
  const g = comarcaBySlug(slugify(u.comarca));
  return [
    { label: home, href: `/${locale}/` },
    { label: locale === "ca" ? "Festius locals" : "Festivos locales", href: hubPath(locale) },
    ...(g ? [{ label: u.comarca, href: comarcaPath(locale, g.slug) }] : []),
    { label: u.name, href: municipalityPath(locale, u.slug) },
  ];
}

/**
 * A council with no local day in the 2026 order ("proposta no formulada")
 * that has its 2027 days: those days first, labelled and sourced, then the
 * 2026 fact. Same URL as every town page.
 */
export function UnlistedTownPage({ u, locale }: { u: UnlistedTown; locale: MuniLocale }) {
  const t = unlistedCopy(u, locale);
  const crumbs = unlistedCrumbs(u, locale);
  const g = comarcaBySlug(slugify(u.comarca));
  const ca = locale === "ca";
  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <p className="ci-label mb-3 max-md:hidden">{u.comarca}</p>
          <h1 className="ci-measure">{t.h1}</h1>
          <ShareBar locale={locale} path={crumbPath(crumbs)} title={t.h1} contentType="holidays_town" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">
            <strong>{t.lead}</strong> {t.status}
          </p>
          {t.source ? <CouncilSourceLine source={t.source} /> : null}

          <h2 id="festius-2027">{t.tableTitle}</h2>
          <HolidayTable rows={unlistedYearRows(u, locale)} locale={locale} caption={t.tableCaption} />
          <p>
            <a href={OFFICIAL.treballCalendar} rel="noopener" target="_blank">
              {ca ? "Calendari laboral al web del Departament d'Empresa i Treball" : "Calendario laboral en la web del Departament d'Empresa i Treball"}
            </a>
            {" · "}
            <a href={OFFICIAL.dogc} rel="noopener" target="_blank">
              DOGC
            </a>
          </p>
          <p>{renderInline(workCalendarLine(locale))}</p>

          <h2 id="festius-2026">{t.title2026}</h2>
          <p>{t.text2026}</p>
          <DateList dates={regionalDays(YEAR, isAran(u)).map((d) => d.date)} locale={locale} />

          <h2 id="preguntes">{ca ? "Preguntes freqüents" : "Preguntas frecuentes"}</h2>
          {t.faq.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}

          {/* The town's other pages (lib/engagement/town-hub.ts). */}
          <TownHub hub={townHub(u.slug, locale, "holidays", todayInCatalonia())} />
        </div>

        <p className="mt-8 text-sm">
          {g ? (
            <>
              <Link href={comarcaPath(locale, g.slug)}>
                {ca ? `Festius locals de tots els municipis ${caDe(caComarca(u.comarca))}` : `Festivos locales de todos los municipios de ${u.comarca}`}
              </Link>
              {" · "}
            </>
          ) : null}
          <Link href={hubPath(locale)}>{ca ? "Tots els municipis, per comarques" : "Todos los municipios, por comarcas"}</Link>
        </p>

        <GuideLinks keys={["workCalendar", "bridges2027", "localHolidays", "holidayToday"]} locale={locale} title={ca ? "També et pot interessar" : "También te puede interesar"} />

        <Sources
          keys={["localOrder", "amendment", "regional2026", "regional2027"]}
          locale={locale}
          title={ca ? "Fonts" : "Fuentes"}
          extra={u.council && !u.next ? [u.council.source] : []}
          readOn={u.council && !u.next ? u.council.readOn : undefined}
        />
        <ShareBar locale={locale} path={crumbPath(crumbs)} title={t.h1} contentType="holidays_town" variant="full" />
      </div>
    </article>
  );
}
