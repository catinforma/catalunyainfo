import { countWorkingDays, daysInMonth, deadline, type Calendar, type CountResult, type DeadlineResult, type DayRules } from "./engine";
import { DEFAULT_EXAMPLE, DEFAULT_PLACE, NATIONAL_ID, dateText, itemHolidays, shortDate, type WdData, type WdItem, type WdLocale } from "./copy";
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

export const SPAN_FROM = "2026-02-10";
export const SPAN_TO = "2026-04-10";

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
  /** 15 días hábiles from the default notification, in both places, and 15 calendar days (19 Nov 2026: "15 dias habiles"). */
  fifteen: DeadlineResult;
  fifteenOther: DeadlineResult;
  fifteenCalendar: DeadlineResult;
  /** 30 días hábiles from the default notification, in both places ("30 dias habiles": 5 queries a month at position 38). */
  thirty: DeadlineResult;
  thirtyOther: DeadlineResult;
  /** Días hábiles between 10 February and 10 April 2026 (administrative rules), in both places: Easter falls inside ("plazo 10 febrero – 10 abril 2026"). */
  span: { place: CountResult; other: CountResult };
  /** The month counts of the FAQ: November and December 2026, Mon–Fri without the place's holidays, in both places; December also with Saturdays worked. */
  months2026: {
    november: { place: number; other: number };
    december: { place: number; other: number; placeSaturdays: number };
  };
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
  const fifteen = must(deadline(ex.notified, 15, "working", calendarFor(data, place), ADMIN), "fifteen");
  const fifteenOther = must(deadline(ex.notified, 15, "working", calendarFor(data, otherValue), ADMIN), "fifteen other");
  const fifteenCalendar = must(deadline(ex.notified, 15, "calendar", calendarFor(data, place), ADMIN), "fifteen calendar");

  const thirty = must(deadline(ex.notified, 30, "working", calendarFor(data, place), ADMIN), "thirty");
  const thirtyOther = must(deadline(ex.notified, 30, "working", calendarFor(data, otherValue), ADMIN), "thirty other");
  const span = {
    place: must(countWorkingDays(SPAN_FROM, SPAN_TO, calendarFor(data, place), ADMIN), "span"),
    other: must(countWorkingDays(SPAN_FROM, SPAN_TO, calendarFor(data, otherValue), ADMIN), "span other"),
  };
  const monthCount = (month: string, last: string, value: string, rules: DayRules = WEEK): number =>
    must(countWorkingDays(`2026-${month}-01`, `2026-${month}-${last}`, calendarFor(data, value), rules), `2026-${month} ${value}`).working;
  const months2026 = {
    november: { place: monthCount("11", "30", place), other: monthCount("11", "30", otherValue) },
    december: {
      place: monthCount("12", "31", place),
      other: monthCount("12", "31", otherValue),
      placeSaturdays: monthCount("12", "31", place, { rules: "general", saturdays: true }),
    },
  };

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
    fifteen,
    fifteenOther,
    fifteenCalendar,
    thirty,
    thirtyOther,
    span,
    months2026,
    monthly,
    totals,
  };
}

/* -------------------------------------------------------------------------- */
/* The page's questions                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Answers to what the page's searchers type ("que son los días hábiles",
 * "dias laborables", "dias habiles noviembre 2026", "30 dias habiles"). Every
 * figure comes from `pageFigures`, i.e. from the engine; the page shows these
 * words and the FAQPage schema repeats them.
 */
export function workingDaysFaq(f: PageFigures, locale: WdLocale): { q: string; a: string }[] {
  const m = f.months2026;
  const nationalNovember = f.monthly[10]!.y2026;
  const d = (iso: string) => shortDate(iso, locale);
  const long = (iso: string) => dateText(iso, locale);
  const notified = d(DEFAULT_EXAMPLE.notified);
  if (locale === "ca") {
    return [
      {
        q: "Què són els dies hàbils?",
        a: "En un termini administratiu, tots els dies menys els dissabtes, els diumenges i els festius nacionals, autonòmics i locals (Llei 39/2015, art. 30.2). Els terminis judicials, a més, deixen fora tot l'agost i del 24 de desembre al 6 de gener (LOPJ art. 183, LEC art. 130.2). Els dies hàbils es compten des de l'endemà de la notificació.",
      },
      {
        q: "Quina diferència hi ha entre dies hàbils i dies laborables?",
        a: `Hàbils són els dies dels terminis legals: no compten dissabtes, diumenges ni festius. Laborables són els dies que es treballa: de dilluns a divendres sense els festius del lloc, i dissabte si hi treballes. El desembre del 2026 a ${f.placeLabel} té ${m.december.place} dies laborables de dilluns a divendres i ${m.december.placeSaturdays} si es treballen els dissabtes; a ${f.other.label}, ${m.december.other}. A la calculadora tria «Dies laborables (feina)» per comptar-los.`,
      },
      {
        q: "Quants dies hàbils té un mes?",
        a: `Depèn del lloc: cada festiu autonòmic o local entre setmana en treu un. El novembre del 2026 té ${m.november.place} dies de dilluns a divendres sense festius a ${f.placeLabel} i ${m.november.other} a ${f.other.label}; tot Espanya, sense festes autonòmiques ni locals, en té ${nationalNovember}. A la taula «Dies hàbils per mes» hi ha tots els mesos del 2026 i el 2027.`,
      },
      {
        q: "Quan acaba un termini de 30 dies hàbils?",
        a: `Un termini administratiu de 30 dies hàbils notificat el ${notified} acaba el ${long(f.thirty.last)} a ${f.placeLabel} i el ${long(f.thirtyOther.last)} a ${f.other.label}: comença l'endemà i els dissabtes, els diumenges i els festius no compten.`,
      },
    ];
  }
  if (locale === "en") {
    return [
      {
        q: "What are working days (días hábiles)?",
        a: "In an administrative deadline, every day except Saturdays, Sundays and national, regional and local holidays (Ley 39/2015, art. 30.2). Court deadlines also leave out all of August and 24 December to 6 January (LOPJ art. 183, LEC art. 130.2). Working days are counted from the day after notification.",
      },
      {
        q: "What is the difference between días hábiles and días laborables?",
        a: `Días hábiles are the days of legal deadlines: Saturdays, Sundays and holidays do not count. Días laborables are the days you work: Monday to Friday without the place's holidays, and Saturday if you work it. December 2026 in ${f.placeLabel} has ${m.december.place} Monday-to-Friday working days, or ${m.december.placeSaturdays} if you work Saturdays; in ${f.other.label}, ${m.december.other}. In the calculator pick "Working days (a job)" to count them.`,
      },
      {
        q: "How many working days does a month have?",
        a: `It depends on the place: each regional or local holiday on a weekday takes one off. November 2026 has ${m.november.place} Monday-to-Friday days without holidays in ${f.placeLabel} and ${m.november.other} in ${f.other.label}; all of Spain, without regional or local holidays, has ${nationalNovember}. The "Working days per month" table below has every month of 2026 and 2027.`,
      },
      {
        q: "When does a 30 working-day deadline end?",
        a: `An administrative deadline of 30 working days notified on ${notified} ends on ${long(f.thirty.last)} in ${f.placeLabel} and on ${long(f.thirtyOther.last)} in ${f.other.label}: it starts the next day, and Saturdays, Sundays and holidays do not count.`,
      },
    ];
  }
  return [
    {
      q: "¿Qué son los días hábiles?",
      a: "En un plazo administrativo, todos los días menos los sábados, los domingos y los festivos nacionales, autonómicos y locales (Ley 39/2015, art. 30.2). Los plazos judiciales, además, dejan fuera todo agosto y del 24 de diciembre al 6 de enero (LOPJ art. 183, LEC art. 130.2). Los días hábiles se cuentan desde el día siguiente a la notificación.",
    },
    {
      q: "¿Qué diferencia hay entre días hábiles y días laborables?",
      a: `Hábiles son los días de los plazos legales: no cuentan sábados, domingos ni festivos. Laborables son los días que se trabaja: de lunes a viernes sin los festivos del lugar, y el sábado si lo trabajas. Diciembre de 2026 en ${f.placeLabel} tiene ${m.december.place} días laborables de lunes a viernes, o ${m.december.placeSaturdays} si trabajas los sábados; en ${f.other.label}, ${m.december.other}. En la calculadora elige «Días laborables (trabajo)» para contarlos.`,
    },
    {
      q: "¿Cuántos días hábiles tiene un mes?",
      a: `Depende del lugar: cada festivo autonómico o local entre semana resta uno. Noviembre de 2026 tiene ${m.november.place} días de lunes a viernes sin festivos en ${f.placeLabel} y ${m.november.other} en ${f.other.label}; toda España, sin fiestas autonómicas ni locales, tiene ${nationalNovember}. En la tabla «Días hábiles por mes» están todos los meses de 2026 y 2027.`,
    },
    {
      q: "¿Cuándo acaba un plazo de 30 días hábiles?",
      a: `Un plazo administrativo de 30 días hábiles notificado el ${notified} acaba el ${long(f.thirty.last)} en ${f.placeLabel} y el ${long(f.thirtyOther.last)} en ${f.other.label}: empieza al día siguiente y los sábados, los domingos y los festivos no cuentan.`,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                  */
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
