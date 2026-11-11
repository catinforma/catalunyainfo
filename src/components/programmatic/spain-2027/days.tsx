import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { b2href } from "@/lib/content/batch02/shared";
import { SATURDAY_SOURCES } from "@/lib/content/holidays/saturday";
import { getMessages } from "@/lib/i18n";
import { BOE_2026 } from "@/lib/programmatic/holidays/boe-2026";
import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { dayMonth, dayMonthYear, longDate, type DateLocale } from "@/lib/programmatic/holidays/format";
import { datePath, hubPath, isDatePage } from "@/lib/programmatic/holidays/paths";
import { dateQuestion } from "@/lib/programmatic/holidays/question";
import { names } from "@/lib/programmatic/spain-2027/communities";
import { BRIDGES, HUB, compactDates, runLine, weekdayDate } from "@/lib/programmatic/spain-2027/copy";
import {
  COMPUTED_NOTE,
  dayDescription,
  dayFaq,
  dayH1,
  dayLead,
  dayNotes,
  dayQuestion,
  daySections,
  dayShape,
  dayTitle,
  dayVerdict,
  hubDayWords,
  whereWords,
  workingIn,
} from "@/lib/programmatic/spain-2027/day-copy";
import {
  computedNote,
  dayDescriptionIntl,
  dayFaqIntl,
  dayH1Intl,
  dayLeadIntl,
  dayNotesIntl,
  dayQuestionIntl,
  daySectionsIntl,
  dayTitleIntl,
  dayVerdictIntl,
  holidayName,
  regionName,
  runLineIntl,
  weekdayDateIntl,
  whereWordsIntl,
  workingInIntl,
  type IntlLocale,
} from "@/lib/programmatic/spain-2027/day-copy-intl";
import { DAY_PAGES, SPAIN_DAYS, change2026, dayRuns, hasDayPage, isCity, isWeekend, neighbours, spainDay, type SpainDay } from "@/lib/programmatic/spain-2027/days";
import { communityPath, spainBridgesPath, spainDayPath, spainDayTranslations, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { BOE_REF, SOURCES, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { breadcrumbSchema, datasetSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * "¿Es festivo el 19 de marzo de 2027?" for all Spain, in three languages
 * (/es/festivos/2027/dia/…, /ca/festius/2027/dia/…, /en/holidays/2027/day/…),
 * the Spanish hub's list of those days and the link the community tables put
 * on each date. Every word comes from `day-copy.ts` (Spanish) or
 * `day-copy-intl.ts` (Catalan, English), every fact from `days.ts`. Body
 * links stay in the page's language: the community pages are Spanish only,
 * so the Catalan and English editions name each territory without a link.
 */

const NOT_FOUND: Metadata = { robots: { index: false, follow: false } };

/** The BOE's terms of reuse, as the community pages cite them. */
const BOE_REUSE = "https://www.boe.es/informacion/aviso_legal/index.php#reutilizacion";
const CREATOR = "Ministerio de Trabajo y Economía Social. Dirección General de Trabajo";

/** The page's words in one language: the Spanish module, or the Catalan/English one. */
interface DayWords {
  h1: (iso: string) => string;
  question: (iso: string) => string;
  title: (iso: string, day: SpainDay) => string;
  description: (day: SpainDay) => string;
  verdict: (day: SpainDay) => string;
  lead: (day: SpainDay) => string;
  notes: (day: SpainDay) => string[];
  sections: (day: SpainDay) => ReturnType<typeof daySections>;
  faq: (day: SpainDay) => ReturnType<typeof dayFaq>;
  working: (day: SpainDay) => Region[];
  where: (regions: readonly Region[]) => string;
  run: (run: Parameters<typeof runLine>[0]) => string;
  note: string;
  place: (r: Region) => string;
  holiday: (name: string) => string;
  weekdayDate: (iso: string) => string;
}

const ES_WORDS: DayWords = {
  h1: dayH1,
  question: dayQuestion,
  title: dayTitle,
  description: dayDescription,
  verdict: dayVerdict,
  lead: dayLead,
  notes: dayNotes,
  sections: daySections,
  faq: dayFaq,
  working: workingIn,
  where: whereWords,
  run: runLine,
  note: COMPUTED_NOTE,
  place: (r) => names(r).short,
  holiday: (name) => name,
  weekdayDate,
};

function intlWords(L: IntlLocale): DayWords {
  return {
    h1: (iso) => dayH1Intl(iso, L),
    question: (iso) => dayQuestionIntl(iso, L),
    title: (iso, day) => dayTitleIntl(iso, day, L),
    description: (day) => dayDescriptionIntl(day, L),
    verdict: (day) => dayVerdictIntl(day, L),
    lead: (day) => dayLeadIntl(day, L),
    notes: (day) => dayNotesIntl(day, L),
    sections: (day) => daySectionsIntl(day, L),
    faq: (day) => dayFaqIntl(day, L),
    working: workingInIntl,
    where: (regions) => whereWordsIntl(regions, L),
    run: (run) => runLineIntl(run, L),
    note: computedNote(L),
    place: (r) => {
      const name = regionName(r, L);
      return name.charAt(0).toUpperCase() + name.slice(1);
    },
    holiday: (name) => holidayName(name, L),
    weekdayDate: (iso) => weekdayDateIntl(iso, L),
  };
}

export function dayWords(locale: DateLocale): DayWords {
  return locale === "es" ? ES_WORDS : intlWords(locale);
}

/** The interface words around the copy, per language. */
const UI = {
  ca: {
    parent: "Festius",
    on: "Festiu",
    off: "Laborable",
    cityLocal: "festa local de la ciutat",
    allLocal: "festa local a tots els municipis",
    movedTo: "Al",
    notMoved: "No es trasllada",
    in: "a",
    catalonia: "A Catalunya, amb les festes locals de cada municipi:",
    december: "El Nadal, Cap d'Any i Reis, comunitat per comunitat, amb els dies que cal demanar:",
    decemberLink: "pont de desembre del 2026 i Reis a Espanya",
    decemberBack: "Pont de desembre del 2026 a Espanya",
    nav: "Festius anterior i següent",
    others: (year: string) => `Altres festius del ${year} a Espanya, dia a dia`,
    hub: "Festius a Catalunya, municipi per municipi",
    sources: "Fonts oficials",
    read: (date: string) => `Llegides el ${date} als butlletins oficials.`,
    spain: "Espanya",
  },
  es: {
    parent: HUB.breadcrumb,
    on: "Festivo",
    off: "Laborable",
    cityLocal: "fiesta local de la ciudad",
    allLocal: "fiesta local en todos los municipios",
    movedTo: "Al",
    notMoved: "No se traslada",
    in: "en",
    catalonia: "En Cataluña, con las fiestas locales de cada municipio:",
    december: "La Navidad, el Año Nuevo y Reyes, comunidad por comunidad, con los días que hay que pedir:",
    decemberLink: "puente de diciembre 2026 y Reyes en España",
    decemberBack: "Puente de diciembre 2026 en España",
    nav: "Festivos anterior y siguiente",
    others: (year: string) => `Otros festivos de ${year}, día a día`,
    hub: `${HUB.breadcrumb}: festivos por comunidad`,
    sources: "Fuentes oficiales",
    read: (date: string) => `Leídas el ${date} en los boletines oficiales.`,
    spain: "España",
  },
  en: {
    parent: "Public holidays",
    on: "Holiday",
    off: "Working day",
    cityLocal: "the city's local holiday",
    allLocal: "local holiday in every municipality",
    movedTo: "To",
    notMoved: "Not moved",
    in: "in",
    catalonia: "In Catalonia, with each town's local holidays:",
    december: "Christmas, New Year and Epiphany, region by region, with the days to take off:",
    decemberLink: "December 2026 holidays and Epiphany in Spain",
    decemberBack: "December 2026 holidays in Spain",
    nav: "Previous and next holidays",
    others: (year: string) => `Other ${year} holidays in Spain, day by day`,
    hub: "Public holidays in Catalonia, town by town",
    sources: "Official sources",
    read: (date: string) => `Read on ${date} in the official bulletins.`,
    spain: "Spain",
  },
} as const satisfies Record<DateLocale, unknown>;

export function dayCrumbs(iso: string, locale: DateLocale = "es"): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: UI[locale].parent, href: locale === "es" ? spainHubPath() : hubPath(locale) },
    { label: dayWords(locale).h1(iso), href: spainDayPath(iso, locale) },
  ];
}

interface Source {
  title: string;
  ref: string;
  url: string;
}

/** The texts behind one day: the BOE always; the local days' own texts; a decree's move; 2026's table; a Saturday's case law. */
function daySources(day: SpainDay): Source[] {
  const out: Source[] = [BOE_REF];
  for (const h of day.holders) if (h.source) out.push(h.source);
  for (const h of day.holders) {
    const d = SOURCES[h.region].decree;
    if (h.movedFrom && d.status === "published") out.push(d.text);
  }
  if (change2026(day)) out.push({ title: BOE_2026.name, ref: BOE_2026.ref, url: BOE_2026.url });
  if (isWeekend(day.date) && day.regions.length > 0) out.push(...SATURDAY_SOURCES.map((s) => ({ title: s.name, ref: s.ref, url: s.url })));
  return out.filter((s, i) => out.findIndex((x) => x.url === s.url) === i);
}

/** A territory: linked to its 2027 page in Spanish, its name alone in Catalan and English (that page is Spanish only). */
function Place({ r, locale }: { r: Region; locale: DateLocale }) {
  const label = dayWords(locale).place(r);
  return locale === "es" ? <Link href={communityPath(names(r))}>{label}</Link> : <>{label}</>;
}

/** Inline list of territories: "Galicia, Madrid y Murcia". */
function RegionLinks({ regions, locale }: { regions: readonly Region[]; locale: DateLocale }) {
  const and = locale === "ca" ? " i " : locale === "es" ? " y " : " and ";
  return (
    <>
      {regions.map((r, i) => (
        <span key={r}>
          {i === 0 ? "" : i === regions.length - 1 ? and : ", "}
          <Place r={r} locale={locale} />
        </span>
      ))}
    </>
  );
}

/** A date in a table or list, linked to its day page (same language) when it has one. */
export function DayDateLink({ iso, children, locale = "es" }: { iso: string; children: ReactNode; locale?: DateLocale }) {
  return hasDayPage(iso) ? <Link href={spainDayPath(iso, locale)}>{children}</Link> : <>{children}</>;
}

/* ------------------------------------------------------------- Day page --- */

function WhereLists({ day, locale }: { day: SpainDay; locale: DateLocale }) {
  const w = dayWords(locale);
  const ui = UI[locale];
  if (day.moved) {
    const moved = new Set(day.moved.to.flatMap((t) => t.regions));
    return (
      <ul>
        {day.moved.to.map((t) => (
          <li key={t.date}>
            {ui.movedTo}{" "}
            <DayDateLink iso={t.date} locale={locale}>
              {w.weekdayDate(t.date)}
            </DayDateLink>
            : <RegionLinks regions={t.regions} locale={locale} />
          </li>
        ))}
        <li>
          {ui.notMoved}: <RegionLinks regions={REGIONS.filter((r) => !moved.has(r))} locale={locale} />
        </li>
      </ul>
    );
  }
  if (day.national) {
    return (
      <p>
        <RegionLinks regions={REGIONS} locale={locale} />.
      </p>
    );
  }
  const working = w.working(day);
  const several = new Set(day.holders.map((h) => h.name)).size > 1;
  return (
    <>
      <h3>
        {ui.on} ({day.regions.length})
      </h3>
      <ul>
        {day.holders.map((h) => (
          <li key={h.region}>
            <Place r={h.region} locale={locale} />
            {h.basis === "local" ? (
              <span className="text-[var(--color-muted)]">
                {" "}
                ({isCity(h.region) ? ui.cityLocal : ui.allLocal}: {w.holiday(h.name)})
              </span>
            ) : several ? (
              <span className="text-[var(--color-muted)]"> ({w.holiday(h.name)})</span>
            ) : null}
          </li>
        ))}
      </ul>
      <h3>
        {ui.off} ({working.length})
      </h3>
      <ul className="columns-1 sm:columns-2 lg:columns-3">
        {working.map((r) => (
          <li key={r}>
            <Place r={r} locale={locale} />
          </li>
        ))}
      </ul>
    </>
  );
}

function BridgeList({ day, locale }: { day: SpainDay; locale: DateLocale }) {
  const w = dayWords(locale);
  const runs = dayRuns(day);
  if (runs.length === 0) return null;
  return (
    <>
      <ul>
        {runs.map((g) => (
          <li key={`${g.run.from}-${g.run.to}-${g.run.take.join()}`}>
            {w.run(g.run)} — {UI[locale].in} {g.regions.length >= 10 ? w.where(g.regions) : <RegionLinks regions={g.regions} locale={locale} />}.
          </li>
        ))}
      </ul>
      <p className="text-sm text-[var(--color-muted)]">{w.note}</p>
    </>
  );
}

/** The day's short label in the "other days" list: "19 mar" (Spanish, as the hub), "19 de març", "19 March". */
function shortDay(iso: string, locale: DateLocale): string {
  return locale === "es" ? compactDates([iso]) : dayMonth(iso, locale);
}

export function SpainDayPage({ iso, locale = "es" }: { iso: string; locale?: DateLocale }) {
  const day = spainDay(iso)!;
  const w = dayWords(locale);
  const ui = UI[locale];
  const sections = w.sections(day);
  const { prev, next } = neighbours(iso);
  const sources = daySources(day);
  const shape = dayShape(day);
  const december = b2href("decemberBridgeSpain", locale);
  const lastLink = locale === "es" ? spainHubPath() : hubPath(locale);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={dayCrumbs(iso, locale)} locale={locale} />
          <h1 className="ci-measure">{w.h1(iso)}</h1>
          <ShareBar locale={locale} path={crumbPath(dayCrumbs(iso, locale))} title={w.h1(iso)} contentType="holidays_2027_day" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <div className="ci-today">
            <p className={`ci-today-answer ${shape === "national" || shape === "most" ? "is-holiday" : "is-not"}`}>{w.verdict(day)}</p>
            <p className="ci-today-date">
              <time dateTime={iso}>{longDate(iso, locale)}</time>
            </p>
          </div>
          <p className="ci-lead">{w.lead(day)}</p>
          {w.notes(day).map((n) => (
            <p key={n}>{n}</p>
          ))}
          {iso === "2027-01-06" ? (
            <p>
              {ui.december} <Link href={december}>{ui.decemberLink}</Link>.
            </p>
          ) : null}

          {sections.map((s) => (
            <section key={s.id} aria-labelledby={`ci-dia-${s.id}`}>
              <h2 id={`ci-dia-${s.id}`}>{s.question}</h2>
              <p>{s.printed}</p>
              {s.id === "puente" ? <BridgeList day={day} locale={locale} /> : null}
              {s.id === "donde" ? (
                <>
                  <WhereLists day={day} locale={locale} />
                  {isDatePage(iso) ? (
                    <p>
                      {ui.catalonia} <Link href={datePath(locale, iso)}>{dateQuestion(iso, locale)}</Link>
                    </p>
                  ) : null}
                </>
              ) : null}
            </section>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap justify-between gap-4" aria-label={ui.nav}>
          {prev ? <Link href={spainDayPath(prev, locale)}>← {w.question(prev)}</Link> : <Link href={december}>← {ui.decemberBack}</Link>}
          {next ? <Link href={spainDayPath(next, locale)}>{w.question(next)} →</Link> : <Link href={lastLink}>{ui.parent} →</Link>}
        </nav>

        <section className="mt-12" aria-labelledby="ci-dia-otros">
          <h2 id="ci-dia-otros">{ui.others(iso.slice(0, 4))}</h2>
          <p>
            {DAY_PAGES.filter((d) => d !== iso).map((d, i) => (
              <span key={d}>
                {i > 0 ? " · " : ""}
                <Link href={spainDayPath(d, locale)}>{shortDay(d, locale)}</Link>
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm">
            <Link href={lastLink}>{ui.hub}</Link>
            {locale === "es" ? (
              <>
                {" · "}
                <Link href={spainBridgesPath()}>{BRIDGES.breadcrumb} en España</Link>
              </>
            ) : null}
          </p>
        </section>

        <section className="ci-measure mt-12" aria-labelledby="ci-dia-fuentes">
          <h2 id="ci-dia-fuentes" className="font-sans text-base font-semibold">
            {ui.sources}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            <time dateTime={SOURCES_READ_ON}>{ui.read(dayMonthYear(SOURCES_READ_ON, locale))}</time>
          </p>
          <ol className="ci-sources mt-3">
            {sources.map((s) => (
              <li key={s.url}>
                <span>
                  <a href={s.url} rel="noopener nofollow" target="_blank">
                    {s.title}
                  </a>
                  <span className="text-[var(--color-muted)]"> — {s.ref}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <ShareBar locale={locale} path={crumbPath(dayCrumbs(iso, locale))} title={w.h1(iso)} contentType="holidays_2027_day" variant="full" />
      </div>
    </article>
  );
}

export function spainDayMetadata(iso: string, locale: DateLocale = "es"): Metadata {
  const day = spainDay(iso);
  if (!day?.page) return NOT_FOUND;
  const w = dayWords(locale);
  return buildMetadata({ locale, path: spainDayPath(iso, locale), title: w.title(iso, day), description: w.description(day), translations: spainDayTranslations(iso) });
}

export function SpainDayRoute({ iso, locale = "es" }: { iso: string; locale?: DateLocale }) {
  const day = spainDay(iso)!;
  const w = dayWords(locale);
  const path = spainDayPath(iso, locale);
  return (
    <>
      <SiteHeader locale={locale} translations={spainDayTranslations(iso)} />
      <main id="main">
        <SpainDayPage iso={iso} locale={locale} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(dayCrumbs(iso, locale)),
          faqSchema([{ type: "faq", items: w.faq(day) }]),
          datasetSchema({
            path,
            name: w.h1(iso),
            description: w.description(day),
            locale,
            creator: CREATOR,
            license: BOE_REUSE,
            isBasedOn: daySources(day).map((s) => s.url),
            spatialCoverage: UI[locale].spain,
            temporalCoverage: iso,
            dateModified: SOURCES_READ_ON,
          }),
        ])}
      />
      <SiteFooter locale={locale} />
    </>
  );
}

/* ------------------------------------------------------------------ Hub --- */

/** The Spanish hub's list: every date that is a day off somewhere in 2027, linked where it has a page. */
export function SpainDayIndex() {
  return (
    <section aria-labelledby="ci-es27-dias">
      <h2 id="ci-es27-dias">¿Es festivo…? Los festivos de 2027, día a día</h2>
      <p>Cada fecha con su respuesta para toda España: dónde es festivo, dónde no y qué puente hace.</p>
      <ul>
        {SPAIN_DAYS.map((d) => (
          <li key={d.date}>
            <strong>
              <DayDateLink iso={d.date}>{weekdayDate(d.date)}</DayDateLink>
            </strong>
            : {hubDayWords(d)}.
          </li>
        ))}
      </ul>
    </section>
  );
}
