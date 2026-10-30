import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { SCHOOL_YEARS } from "@/lib/content/school/calendar";
import { comarcaLinkLabel, municipalityCopy, displayName, municipalityFaq, municipalityH1, sharedDayLead } from "@/lib/programmatic/holidays/copy";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import {
  NEXT,
  YEAR,
  comarcaOf,
  councilApproved2027,
  isAran,
  localThrough,
  nextYearFor,
  regionalDays,
  regionalThrough,
  siblings,
  statusDays,
  yearRows,
} from "@/lib/programmatic/holidays/data";
import { municipalityDatePages } from "@/lib/programmatic/holidays/dates";
import { dayMonth, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { OFFICIAL } from "@/lib/programmatic/holidays/links";
import { caComarca, joinList } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, comarcaPath, datePath, hubPath, municipalityPath, type MuniLocale } from "@/lib/programmatic/holidays/paths";
import { dateQuestion } from "@/lib/programmatic/holidays/copy";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { HolidayStatus, type StatusLabels } from "./HolidayStatus";
import { CouncilSourceLine, DateList, GuideLinks, HolidayTable, Sources } from "./parts";

const STATUS_LABELS: Record<MuniLocale, StatusLabels> = {
  ca: {
    fallback: "Tots els festius de {place} són a la llista de sota. Amb JavaScript actiu, aquí veuràs si avui o demà és festiu i quin és el pròxim festiu.",
    todayHoliday: "Sí: avui és festiu a {place} ({name}).",
    todayWorking: "No: avui no és festiu a {place}.",
    todayWeekend: "Avui no és festiu a {place}, però és {weekday}.",
    todayLocalUnknown: "Avui no és festiu a tot Catalunya; els festius locals del {year} encara no s'han publicat.",
    todayUnknown: "El calendari de festius del {year} encara no s'ha publicat.",
    tomorrow: "Demà",
    next: "Pròxim festiu",
    yes: "Sí",
    no: "No és festiu",
    localUnknownShort: "No a tot Catalunya; els locals del {year} no s'han publicat",
    unknownShort: "Calendari encara no publicat",
    inDays: "d'aquí a {n} dies",
    inOneDay: "demà",
    mayBeEarlier: "Els festius locals del {year} encara no s'han publicat: pot ser que n'hi hagi algun abans.",
    none: "Cap festiu publicat més endavant",
    timezone: "Calculat amb l'hora de Catalunya.",
  },
  es: {
    fallback: "Todos los festivos de {place} están en la lista de abajo. Con JavaScript activo, aquí verás si hoy o mañana es festivo y cuál es el próximo festivo.",
    todayHoliday: "Sí: hoy es festivo en {place} ({name}).",
    todayWorking: "No: hoy no es festivo en {place}.",
    todayWeekend: "Hoy no es festivo en {place}, pero es {weekday}.",
    todayLocalUnknown: "Hoy no es festivo en toda Cataluña; los festivos locales de {year} todavía no se han publicado.",
    todayUnknown: "El calendario de festivos de {year} todavía no se ha publicado.",
    tomorrow: "Mañana",
    next: "Próximo festivo",
    yes: "Sí",
    no: "No es festivo",
    localUnknownShort: "No en toda Cataluña; los locales de {year} no se han publicado",
    unknownShort: "Calendario aún no publicado",
    inDays: "dentro de {n} días",
    inOneDay: "mañana",
    mayBeEarlier: "Los festivos locales de {year} todavía no se han publicado: puede que haya alguno antes.",
    none: "Ningún festivo publicado más adelante",
    timezone: "Calculado con la hora de Cataluña.",
  },
};

/** Home > Festius locals > the comarca's table > the town. */
export function municipalityCrumbs(m: SnapshotMunicipality, locale: MuniLocale): Crumb[] {
  const home = getMessages(locale).common.home;
  const hub = locale === "ca" ? "Festius locals" : "Festivos locales";
  return [
    { label: home, href: `/${locale}/` },
    { label: hub, href: hubPath(locale) },
    { label: m.comarca, href: comarcaPath(locale, comarcaOf(m).slug) },
    { label: displayName(m, locale), href: municipalityPath(locale, m.slug) },
  ];
}

export function MunicipalityPage({ m, locale }: { m: SnapshotMunicipality; locale: MuniLocale }) {
  const next = nextYearFor(m.slug);
  const comarcaLabel = locale === "ca" ? caComarca(m.comarca) : m.comarca;
  const t = municipalityCopy(m, locale, next, comarcaLabel);
  const name = displayName(m, locale);
  const rows = yearRows(m, YEAR, locale);
  // Before the DOGC order: the council's own days, if it has approved them, marked pending.
  const rows2027 = yearRows(m, NEXT, locale, { council: true });
  const council = next ? null : councilApproved2027(m.slug);
  const { sameComarca, others, comarcaTotal } = siblings(m);
  const crumbs = municipalityCrumbs(m, locale);
  const shared = municipalityDatePages(m);
  // Static page: "today" is the build date; each question names its date.
  const faq = municipalityFaq(m, locale, next, todayInCatalonia());

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />
          <p className="ci-label mb-3 max-md:hidden">{m.comarca}</p>
          <h1 className="ci-measure">{municipalityH1(m, locale)}</h1>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">
            {t.lead} {t.source}
          </p>
          {t.nextLead ? (
            <p className="ci-callout ci-callout-official">
              {t.nextLead} <a href="#festius-2027">{locale === "ca" ? `Calendari del ${NEXT}` : `Calendario de ${NEXT}`}</a>
            </p>
          ) : null}
          {t.nucleiLead ? <p>{t.nucleiLead}</p> : null}
          {t.correction ? <p className="ci-callout ci-callout-official">{t.correction}</p> : null}
          {t.unlisted ? <p className="ci-callout ci-callout-official">{t.unlisted}</p> : null}

          <h2 id="avui">{t.statusTitle}</h2>
          <HolidayStatus
            place={name}
            days={statusDays(m, locale)}
            coverage={{ regionalThrough: regionalThrough(), localThrough: localThrough() }}
            locale={locale}
            labels={STATUS_LABELS[locale]}
          />

          <h2 id="festius-2026">{t.tableTitle}</h2>
          <HolidayTable rows={rows} locale={locale} caption={t.tableCaption} />

          {m.nuclei.length > 0 ? (
            <>
              <h2 id="nuclis">{t.nucleiTitle}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{t.cols.place}</th>
                      <th scope="col">{t.cols.days}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.nuclei.map((n) => (
                      <tr key={n.name}>
                        <td>{n.name}</td>
                        <td>{joinList(n.dates.map((d) => weekdayDayMonth(d, locale)), locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {/* Local days that have a date page of their own: who else is off that day. */}
          {shared.map((s) => (
            <p key={s.date}>
              {sharedDayLead(s.date, s.others, locale, s.nuclei)} <Link href={datePath(locale, s.page)}>{dateQuestion(s.page, locale)}</Link>
            </p>
          ))}

          <h2 id="festius-2027">{t.nextTitle}</h2>
          {t.nextPublished ? (
            <>
              <p>{t.nextPublished}</p>
              <HolidayTable rows={rows2027} locale={locale} caption={`${t.tableCaption.replace(String(YEAR), String(NEXT))}`} />
            </>
          ) : (
            <>
              {/* The answer first (the council's two days, labelled), then the 2027 calendar. */}
              {(t.nextCouncil ?? t.nextPending).map((p) => (
                <p key={p}>{p}</p>
              ))}
              {t.councilSource ? <CouncilSourceLine source={t.councilSource} /> : null}
              {t.nextCouncil ? (
                <HolidayTable rows={rows2027} locale={locale} caption={`${t.tableCaption.replace(String(YEAR), String(NEXT))}`} />
              ) : null}
              <p>
                <a href={OFFICIAL.treballCalendar} rel="noopener" target="_blank">
                  {locale === "ca" ? "Calendari laboral al web del Departament d'Empresa i Treball" : "Calendario laboral en la web del Departament d'Empresa i Treball"}
                </a>
                {" · "}
                <a href={OFFICIAL.dogc} rel="noopener" target="_blank">
                  DOGC
                </a>
              </p>
            </>
          )}
          {t.nextPublished || t.nextCouncil ? null : (
            <>
              <p>{t.nextRegionalLead}</p>
              <DateList dates={regionalDays(NEXT, isAran(m)).map((d) => d.date)} locale={locale} />
            </>
          )}

          <h2 id="botigues">{t.shopsTitle}</h2>
          <p>{t.shopsLead}</p>
          <DateList dates={m.shops} locale={locale} />
          {t.shopsLocal.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            {t.shopsNote}{" "}
            <Link href={GUIDES.shops[locale]}>
              {locale === "ca" ? `Diumenges i festius d'obertura ${YEAR} a tot Catalunya.` : `Domingos y festivos de apertura ${YEAR} en toda Cataluña.`}
            </Link>
          </p>

          <h2 id="que-vol-dir">{t.meaningTitle}</h2>
          {[t.work, t.school, t.shopsMeaning].map((block) => (
            <p key={block.title}>
              <strong>{block.title}.</strong> {block.text}
              {block === t.school ? (
                <>
                  {" "}
                  <Link href={GUIDES.school[locale]}>{schoolLinkLabel(locale)}</Link>
                </>
              ) : null}
            </p>
          ))}

          <h2 id="preguntes">{locale === "ca" ? "Preguntes freqüents" : "Preguntas frecuentes"}</h2>
          {faq.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>
                {item.answer}
                {item.link ? (
                  <>
                    {" "}
                    <Link href={item.link.href}>{item.link.label}</Link>
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="ci-hol-siblings">
          {sameComarca.length > 0 ? (
            <>
              <h2 id="ci-hol-siblings">{t.siblingsTitle}</h2>
              <TownList towns={sameComarca} locale={locale} />
            </>
          ) : null}
          {others.length > 0 ? (
            <>
              {sameComarca.length > 0 ? <h3 className="mt-8">{t.othersTitle}</h3> : <h2 id="ci-hol-siblings">{t.othersTitle}</h2>}
              <TownList towns={others} locale={locale} />
            </>
          ) : null}
          <p className="mt-4 text-sm">
            {/* The comarca's table: every town of the comarca with its two days, past the sibling cap. */}
            <Link href={comarcaPath(locale, comarcaOf(m).slug)}>{comarcaLinkLabel(m.comarca, comarcaTotal, locale)}</Link>
            {" · "}
            <Link href={hubPath(locale)}>{locale === "ca" ? "Tots els municipis, per comarques" : "Todos los municipios, por comarcas"}</Link>
          </p>
        </section>

        <section className="mt-12" aria-labelledby="ci-hol-dates">
          <h2 id="ci-hol-dates">{locale === "ca" ? "És festiu…?" : "¿Es festivo…?"}</h2>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {DATE_PAGES.map((d) => (
              <li key={d}>
                <Link href={datePath(locale, d)}>{dateQuestion(d, locale)}</Link>
              </li>
            ))}
          </ul>
        </section>

        <GuideLinks
          keys={["holidayToday", "workCalendar", "localHolidays", "shops", "school", "decemberBridge"]}
          locale={locale}
          title={t.guidesTitle}
        />

        <Sources
          keys={["localOrder", "amendment", "openData", "regional2026", "regional2027", "shops", "shopsOrder", "school", "retailLaw", "population"]}
          locale={locale}
          title={t.sourcesTitle}
          extra={council ? [council.source] : []}
        />
      </div>
    </article>
  );
}

/** "Calendari escolar 2026-2027": the school year in progress (or the next one in summer). */
function schoolLinkLabel(locale: MuniLocale): string {
  const today = todayInCatalonia();
  const year = SCHOOL_YEARS.find((y) => today <= y.end) ?? SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!;
  return locale === "ca" ? `Calendari escolar ${year.label} a Catalunya.` : `Calendario escolar ${year.label} en Cataluña.`;
}

function TownList({ towns, locale }: { towns: SnapshotMunicipality[]; locale: MuniLocale }) {
  return (
    <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {towns.map((o) => (
        <li key={o.slug}>
          <Link href={municipalityPath(locale, o.slug)}>{displayName(o, locale)}</Link>
          <span className="block text-xs text-[var(--color-muted)]">
            {o.local.length > 0 ? joinList(o.local.map((d) => dayMonth(d, locale)), locale) : o.comarca}
          </span>
        </li>
      ))}
    </ul>
  );
}
