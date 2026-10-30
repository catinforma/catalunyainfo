import Link from "next/link";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { SCHOOL_YEARS } from "@/lib/content/school/calendar";
import { YEAR as PLANNER_YEAR } from "@/lib/content/holidays/payload";
import type { CouncilSource } from "@/lib/programmatic/holidays/copy";
import { SNAPSHOT, type HolidayRow } from "@/lib/programmatic/holidays/data";
import { dayMonth, dayMonthYear, weekdayName, type DateLocale } from "@/lib/programmatic/holidays/format";
import { GUIDES, OFFICIAL, type GuideKey } from "@/lib/programmatic/holidays/links";

/** Shared pieces of the holiday pages, all server-rendered. */

// The anchors say what the guides answer, with the year people search
// ("calendari laboral 2027", "calendario escolar 2026-2027"): these pages are
// the most-crawled links into both guides.
const SCHOOL_LABEL = (SCHOOL_YEARS.find((y) => todayInCatalonia() <= y.end) ?? SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!).label;

const GUIDE_LABEL: Record<GuideKey, Record<DateLocale, string>> = {
  workCalendar: { ca: `Calendari laboral ${PLANNER_YEAR} de Catalunya`, es: `Calendario laboral ${PLANNER_YEAR} de Cataluña`, en: `Catalonia public holidays ${PLANNER_YEAR}` },
  holidayToday: { ca: "És festiu avui a Catalunya?", es: "¿Es festivo hoy en Cataluña?", en: "Is today a public holiday in Catalonia?" },
  localHolidays: { ca: "Festius locals de tots els municipis", es: "Festivos locales de todos los municipios", en: "Local holidays in every town" },
  shops: { ca: "Botigues obertes en diumenges i festius", es: "Tiendas abiertas en domingos y festivos", en: "Shops open on Sundays and holidays" },
  school: { ca: `Calendari escolar ${SCHOOL_LABEL}`, es: `Calendario escolar ${SCHOOL_LABEL}`, en: `Catalonia school calendar ${SCHOOL_LABEL}` },
  decemberBridge: { ca: "El pont de desembre del 2026", es: "El puente de diciembre de 2026", en: "The December 2026 long weekend" },
  metroHours: { ca: "Horaris del metro de Barcelona", es: "Horarios del metro de Barcelona", en: "Barcelona metro hours" },
  christmasTraditions: { ca: "Tradicions de Nadal a Catalunya", es: "Tradiciones de Navidad en Cataluña", en: "Catalan Christmas traditions" },
  christmasBarcelona: { ca: "Nadal a Barcelona", es: "Navidad en Barcelona", en: "Christmas in Barcelona" },
  newYear: { ca: "Cap d'Any a Barcelona", es: "Nochevieja en Barcelona", en: "New Year's Eve in Barcelona" },
  castanyada: { ca: "La Castanyada i Tots Sants", es: "La Castañada y Todos los Santos", en: "The Castanyada and All Saints" },
  strikes: { ca: "Vaga avui a Catalunya: què funciona", es: "Huelga hoy en Cataluña: qué funciona", en: "Strike in Catalonia today: what runs" },
};

export function GuideLinks({ keys, locale, title }: { keys: readonly GuideKey[]; locale: DateLocale; title: string }) {
  return (
    <section className="mt-12" aria-labelledby="ci-hol-guides">
      <h2 id="ci-hol-guides">{title}</h2>
      <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
        {keys.map((key) => (
          <li key={key}>
            <Link href={GUIDES[key][locale]}>{GUIDE_LABEL[key][locale]}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SCOPE_LABEL: Record<DateLocale, Record<HolidayRow["kind"], string>> = {
  ca: { catalonia: "Catalunya", local: "Local", aran: "Aran" },
  es: { catalonia: "Cataluña", local: "Local", aran: "Arán" },
  en: { catalonia: "Catalonia", local: "Local", aran: "Aran" },
};

/** Under a local day the council has approved and the DOGC has not yet published (`council-2027.ts`). */
const PENDING_LABEL: Record<DateLocale, string> = {
  ca: "Aprovat per l'Ajuntament, pendent del DOGC",
  es: "Aprobado por el Ayuntamiento, pendiente del DOGC",
  en: "Approved by the council, pending the DOGC order",
};

const COLS: Record<DateLocale, { date: string; name: string; scope: string }> = {
  ca: { date: "Dia", name: "Festa", scope: "Àmbit" },
  es: { date: "Día", name: "Fiesta", scope: "Ámbito" },
  en: { date: "Day", name: "Holiday", scope: "Where" },
};

/**
 * The year's holidays as a compact three-column table; local rows are
 * emphasised. Plain `ci-local-table` rather than the stacked-card `ci-table`:
 * fourteen short rows read better as a table on a phone than as fourteen cards.
 */
export function HolidayTable({ rows, locale, caption }: { rows: HolidayRow[]; locale: DateLocale; caption: string }) {
  const cols = COLS[locale];
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{cols.date}</th>
            <th scope="col">{cols.name}</th>
            <th scope="col">{cols.scope}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.date}-${row.kind}`}>
              <td className="whitespace-nowrap">
                <time dateTime={row.date}>
                  {weekdayName(row.date, locale)} {dayMonth(row.date, locale)}
                </time>
              </td>
              <td>
                {row.kind === "local" ? <strong>{row.name}</strong> : row.name.charAt(0).toUpperCase() + row.name.slice(1)}
                {row.where ? <small className="block">{row.where.join(", ")}</small> : null}
                {row.pending ? <small className="block">{PENDING_LABEL[locale]}</small> : null}
              </td>
              <td>{SCOPE_LABEL[locale][row.kind]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Compact inline list of dates: "dilluns 25 de maig · dijous 24 de setembre". */
export function DateList({ dates, locale }: { dates: string[]; locale: DateLocale }) {
  return (
    <ul className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
      {dates.map((d) => (
        <li key={d}>
          <time dateTime={d}>
            {weekdayName(d, locale)} {dayMonth(d, locale)}
          </time>
        </li>
      ))}
    </ul>
  );
}

type SourceKey = "localOrder" | "amendment" | "openData" | "regional2026" | "regional2027" | "shops" | "shopsOrder" | "school" | "retailLaw" | "boe2026" | "population";

const SCHOOL = { name: "Ordre EDF/66/2026, de 22 d'abril, calendari escolar dels cursos 2026-2027, 2027-2028 i 2028-2029", ref: "DOGC núm. 9653, de 27.4.2026", url: OFFICIAL.schoolOrder };
const RETAIL = { name: "Llei 18/2017, de l'1 d'agost, de comerç, serveis i fires (text consolidat)", ref: "BOE-A-2017-11320", url: OFFICIAL.llei18_2017 };
const BOE = { name: "Resolución de 17 de octubre de 2025, relación de fiestas laborales para el año 2026", ref: "BOE-A-2025-21667", url: OFFICIAL.boe2026 };

function source(key: SourceKey) {
  const s = SNAPSHOT.sources;
  switch (key) {
    case "localOrder":
      return s.localOrder;
    case "amendment":
      return s.localAmendments[0] ?? null;
    case "openData":
      return { name: s.localOpenData.name, ref: `${s.localOpenData.ref}, ${s.localOpenData.rowsUpdatedAt}`, url: s.localOpenData.url };
    case "regional2026":
      return s.regional["2026"] ?? null;
    case "regional2027":
      return s.regional["2027"] ?? null;
    case "shops":
      return s.shops;
    case "shopsOrder":
      return s.shopsOrder;
    case "school":
      return SCHOOL;
    case "retailLaw":
      return RETAIL;
    case "boe2026":
      return BOE;
    case "population":
      return s.population;
  }
}

/** "Font: <the council's page> — Ajuntament de …. Consultada el …", under the council's own days. */
export function CouncilSourceLine({ source }: { source: CouncilSource }) {
  return (
    <p className="text-sm">
      {source.lead}{" "}
      <a href={source.url} rel="noopener nofollow" target="_blank">
        {source.name}
      </a>
      <span className="text-[var(--color-muted)]">
        {" "}
        — {source.ref}. {source.read}
      </span>
    </p>
  );
}

export function Sources({
  keys,
  locale,
  title,
  extra = [],
}: {
  keys: readonly SourceKey[];
  locale: DateLocale;
  title: string;
  /** Sources outside the snapshot, listed last: the council's page for next year's days. */
  extra?: readonly { name: string; ref: string; url: string }[];
}) {
  const read = dayMonthYear(SNAPSHOT.readOn, locale);
  const readLine = { ca: `Dades llegides el ${read} de les fonts oficials.`, es: `Datos leídos el ${read} de las fuentes oficiales.`, en: `Data read on ${read} from the official sources.` }[locale];
  return (
    <section className="ci-measure mt-12" aria-labelledby="ci-hol-sources">
      <h2 id="ci-hol-sources" className="font-sans text-base font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        <time dateTime={SNAPSHOT.readOn}>{readLine}</time>
      </p>
      <ol className="ci-sources mt-3">
        {[...keys.map((key) => ({ key, item: source(key) })), ...extra.map((item) => ({ key: item.url, item }))].map(({ key, item }) => {
          if (!item) return null;
          return (
            <li key={key}>
              <span>
                <a href={item.url} rel="noopener nofollow" target="_blank">
                  {item.name}
                </a>
                <span className="text-[var(--color-muted)]"> — {item.ref}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export type { SourceKey };
