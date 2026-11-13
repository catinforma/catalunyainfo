import { countWorkingDays, daysInMonth, deadline, type Calendar, type DeadlineResult, type DayRules } from "./engine";
import { DEFAULT_EXAMPLE, DEFAULT_PLACE, NATIONAL_ID, itemHolidays, type WdData, type WdItem, type WdLocale } from "./copy";
import { COVER_FROM, COVER_TO } from "./rules";

/**
 * The page's worked examples and its monthly table, computed with the engine
 * from the same browser data the calculator gets (so the server-rendered
 * words and the calculator can never disagree). Pure: tests run it.
 */

export function findItem(data: WdData, value: string): { item: WdItem; group: string } {
  for (const g of data.groups) {
    const item = g.items.find((i) => i[0] === value);
    if (item) return { item, group: g.label };
  }
  throw new Error(`working days: no place ${value}`);
}

export function calendarFor(data: WdData, ...values: string[]): Calendar {
  const holidays = new Set(values.flatMap((v) => itemHolidays(data, findItem(data, v).item)));
  return { holidays, from: COVER_FROM, to: COVER_TO };
}

const ADMIN: DayRules = { rules: "admin" };
const JUDICIAL: DayRules = { rules: "judicial" };
const WEEK: DayRules = { rules: "general" };

function must<R extends { ok: true } | { ok: false; error: string }>(r: R, what: string): Extract<R, { ok: true }> {
  if (!r.ok) throw new Error(`working days example ${what}: ${(r as { error: string }).error}`);
  return r as Extract<R, { ok: true }>;
}

export interface PageFigures {
  place: string;
  placeLabel: string;
  /** The default example in the reader's default place, and in the other one (Madrid ↔ Barcelona). */
  example: DeadlineResult;
  other: { label: string; result: DeadlineResult };
  /** 31 January 2026 + 1 month, all of Spain (lands on Saturday 28 February). */
  months: DeadlineResult;
  /** Notified 22 December 2026, 5 días hábiles: administrative and judicial, same place. */
  christmasAdmin: DeadlineResult;
  christmasJudicial: DeadlineResult;
  /** Mon–Fri days per month with only the holidays all of Spain shares. */
  monthly: { month: string; y2026: number; y2027: number }[];
  totals: { y2026: number; y2027: number };
}

const OTHER: Record<string, string> = { "madrid/madrid": "barcelona", barcelona: "madrid/madrid" };

export function pageFigures(data: WdData, locale: WdLocale): PageFigures {
  const place = DEFAULT_PLACE[locale];
  const here = findItem(data, place);
  const otherValue = OTHER[place]!;
  const other = findItem(data, otherValue);
  const ex = DEFAULT_EXAMPLE;
  const example = must(deadline(ex.notified, ex.amount, ex.unit, calendarFor(data, place), ADMIN), "default");
  const otherResult = must(deadline(ex.notified, ex.amount, ex.unit, calendarFor(data, otherValue), ADMIN), "other");
  const national = calendarFor(data, NATIONAL_ID);
  const months = must(deadline("2026-01-31", 1, "months", national, ADMIN), "months");
  const christmasAdmin = must(deadline("2026-12-22", 5, "working", calendarFor(data, place), ADMIN), "christmas admin");
  const christmasJudicial = must(deadline("2026-12-22", 5, "working", calendarFor(data, place), JUDICIAL), "christmas judicial");

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    const count = (y: number): number => {
      const last = String(daysInMonth(y, i + 1)).padStart(2, "0");
      const r = must(countWorkingDays(`${y}-${mm}-01`, `${y}-${mm}-${last}`, national, WEEK), `month ${y}-${mm}`);
      return r.working;
    };
    return { month: mm, y2026: count(2026), y2027: count(2027) };
  });
  const totals = { y2026: monthly.reduce((a, m) => a + m.y2026, 0), y2027: monthly.reduce((a, m) => a + m.y2027, 0) };
  return {
    place,
    placeLabel: here.item[1],
    example,
    other: { label: other.item[1], result: otherResult },
    months,
    christmasAdmin,
    christmasJudicial,
    monthly,
    totals,
  };
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export const WD_META: Record<WdLocale, { title: string; description: string; h1: string; breadcrumb: string }> = {
  es: {
    title: "Calculadora de días hábiles 2026 y 2027 con festivos",
    description:
      "Calcula el último día de un plazo administrativo (Ley 39/2015) o judicial y los días hábiles entre dos fechas, con los festivos nacionales, autonómicos y locales.",
    h1: "Calculadora de días hábiles y plazos",
    breadcrumb: "Días hábiles",
  },
  ca: {
    title: "Calculadora de dies hàbils 2026 i 2027 amb festius",
    description:
      "Calcula l'últim dia d'un termini administratiu (Llei 39/2015) o judicial i els dies hàbils entre dues dates, amb els festius nacionals, autonòmics i locals.",
    h1: "Calculadora de dies hàbils i terminis",
    breadcrumb: "Dies hàbils",
  },
  en: {
    title: "Spain working days calculator 2026–2027 (días hábiles)",
    description:
      "Work out the last day of a Spanish administrative or court deadline, or the working days between two dates, with national, regional and local holidays.",
    h1: "Spain working days and deadline calculator",
    breadcrumb: "Working days",
  },
};
