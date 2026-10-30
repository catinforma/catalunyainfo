import type { Locale } from "@/lib/i18n/config";

import { addDays, holidayOn, isCovered, longDate, weekdayIndex } from "@/lib/content/holidays/calendar";

import { SCHOOL_YEARS, schoolStatusOn, type SchoolYear } from "./calendar";

/**
 * The school calendar's answers that change with the date: what kind of day
 * today and tomorrow are, the next weekday without school everywhere in
 * Catalonia, and the title and search description built from them.
 *
 * Search Console, 30 Oct 2026: the Catalan page sat at 4.7 with ~430
 * impressions a day and a 1 % CTR. Most of its queries were "demà hi ha
 * escola", "vacances de nadal", "dies de lliure disposició", "setmana santa
 * 2027 escolar": questions about the *next* day off. A fixed title cannot name
 * it; this one does, from the same dates the table prints (Ordre EDF/66/2026
 * and the Generalitat's holiday calendars), and the nightly cron rebuilds the
 * page, so the snippet never names a break that is over.
 *
 * Local holidays and each school's four free-choice days are not known here,
 * so every sentence says "a tot Catalunya" / "general calendar" where that
 * matters.
 */

export type SchoolDay =
  | { kind: "weekend" }
  | { kind: "holiday"; name: Record<Locale, string> }
  | { kind: "christmas" | "easter"; until: string }
  | { kind: "summer" }
  | { kind: "school" }
  | { kind: "unknown" };

/** What the general calendar says about one date. */
export function schoolDay(iso: string): SchoolDay {
  const status = schoolStatusOn(iso);
  if (status.kind === "unknown") return { kind: "unknown" };
  if (status.kind === "christmas" || status.kind === "easter") return { kind: status.kind, until: status.until };
  if (status.kind === "summer") return { kind: "summer" };
  const wd = weekdayIndex(iso);
  if (wd === 0 || wd === 6) return { kind: "weekend" };
  const holiday = holidayOn(iso);
  if (holiday) return { kind: "holiday", name: holiday.name };
  return { kind: "school" };
}

/** The school year in progress, or the next one during the summer. */
export function yearFor(today: string): SchoolYear {
  return SCHOOL_YEARS.find((year) => today <= year.end) ?? SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!;
}

/**
 * The next Monday-to-Friday after `today`, inside term, that is a
 * Catalonia-wide public holiday, provided it comes before the next break.
 * Null when the next day off for everyone is the break itself, or when the
 * holiday calendar for that year is not published yet.
 */
export function nextHolidayInTerm(today: string): { date: string; name: Record<Locale, string> } | null {
  const year = yearFor(today);
  const status = schoolStatusOn(today);
  if (status.kind !== "term") return null;
  const limit = status.nextBreak.from;
  for (let iso = addDays(today, 1); iso < limit; iso = addDays(iso, 1)) {
    if (!isCovered(iso)) return null;
    const wd = weekdayIndex(iso);
    if (wd === 0 || wd === 6) continue;
    const holiday = holidayOn(iso);
    if (holiday && iso >= year.start) return { date: iso, name: holiday.name };
  }
  return null;
}

/**
 * Weekday-only Catalonia-wide holidays inside term that fall on a Tuesday or a
 * Thursday: the Monday or Friday in between is the "pont" schools are asked
 * about. The general calendar keeps it a school day.
 */
export function bridgeDays(year: SchoolYear): { day: string; holiday: string; name: Record<Locale, string> }[] {
  const out: { day: string; holiday: string; name: Record<Locale, string> }[] = [];
  for (let iso = year.start; iso <= year.end; iso = addDays(iso, 1)) {
    const holiday = holidayOn(iso);
    if (!holiday) continue;
    const wd = weekdayIndex(iso);
    const day = wd === 2 ? addDays(iso, -1) : wd === 4 ? addDays(iso, 1) : null;
    if (day && schoolDay(day).kind === "school") out.push({ day, holiday: iso, name: holiday.name });
  }
  return out;
}

/**
 * Days with class in the general calendar: Monday to Friday from the first
 * to the last day, minus the Christmas and Easter breaks and the
 * Catalonia-wide holidays. Each school then loses its two local holidays
 * that fall on school days and its four free-choice days.
 */
export function generalSchoolDays(year: SchoolYear): number | null {
  // Without the holiday calendar of both calendar years the count would be too high.
  if (!isCovered(year.start) || !isCovered(year.end)) return null;
  let n = 0;
  for (let iso = year.start; iso <= year.end; iso = addDays(iso, 1)) {
    if (schoolDay(iso).kind === "school") n++;
  }
  return n;
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

const L = <T,>(locale: Locale, ca: T, es: T, en: T): T => (locale === "ca" ? ca : locale === "es" ? es : en);

/** "divendres 30 d'octubre" / "viernes 30 de octubre" / "Friday 30 October": no year. */
export function weekdayDay(iso: string, locale: Locale): string {
  return longDate(iso, locale).replace(", ", " ").replace(/ (de )?\d{4}$/, "");
}

/** "30 d'octubre" / "30 de octubre" / "30 October". */
function dayMonth(iso: string, locale: Locale): string {
  return weekdayDay(iso, locale).replace(/^\S+ /, "");
}

/** "22/12" */
function dm(iso: string): string {
  return `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
}

const EN_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const enShort = (iso: string) => `${Number(iso.slice(8, 10))} ${EN_SHORT[Number(iso.slice(5, 7)) - 1]}`;

/** "Avui, divendres 30 d'octubre: dia lectiu al calendari general." */
export function schoolDayLine(iso: string, locale: Locale, which: "today" | "tomorrow"): string {
  const when = L(
    locale,
    `${which === "today" ? "Avui" : "Demà"}, ${weekdayDay(iso, locale)}`,
    `${which === "today" ? "Hoy" : "Mañana"}, ${weekdayDay(iso, locale)}`,
    `${which === "today" ? "Today" : "Tomorrow"}, ${weekdayDay(iso, locale)}`,
  );
  const day = schoolDay(iso);
  switch (day.kind) {
    case "weekend":
      return L(locale, `${when}: no hi ha classe (cap de setmana).`, `${when}: no hay clase (fin de semana).`, `${when}: no school (weekend).`);
    case "holiday":
      return L(
        locale,
        `${when}: no hi ha classe, és festiu a tot Catalunya (${day.name.ca}).`,
        `${when}: no hay clase, es festivo en toda Cataluña (${day.name.es}).`,
        `${when}: no school, public holiday across Catalonia (${day.name.en}).`,
      );
    case "christmas":
    case "easter": {
      const back = weekdayDay(nextSchoolDay(day.until), locale);
      return L(
        locale,
        `${when}: vacances de ${day.kind === "christmas" ? "Nadal" : "Setmana Santa"}. Es torna a classe el ${back}.`,
        `${when}: vacaciones de ${day.kind === "christmas" ? "Navidad" : "Semana Santa"}. Se vuelve a clase el ${back}.`,
        `${when}: ${day.kind === "christmas" ? "Christmas" : "Easter"} holidays. Classes restart on ${back}.`,
      );
    }
    case "summer":
      return L(locale, `${when}: vacances d'estiu.`, `${when}: vacaciones de verano.`, `${when}: summer holidays.`);
    case "school":
      return L(
        locale,
        `${when}: dia lectiu al calendari general. Comprova els festius locals i els dies de lliure disposició de l'escola.`,
        `${when}: día lectivo en el calendario general. Comprueba los festivos locales y los días de libre disposición del colegio.`,
        `${when}: a school day in the general calendar. Check local holidays and the school's own free-choice days.`,
      );
    default:
      return L(locale, `${when}: el calendari publicat no arriba a aquesta data.`, `${when}: el calendario publicado no llega a esta fecha.`, `${when}: the published calendar does not reach this date.`);
  }
}

/** The first Monday-to-Friday after `iso` that is not a holiday. */
function nextSchoolDay(iso: string): string {
  let day = addDays(iso, 1);
  for (let i = 0; i < 14; i++, day = addDays(day, 1)) {
    const wd = weekdayIndex(day);
    if (wd !== 0 && wd !== 6 && !holidayOn(day)) return day;
  }
  return addDays(iso, 1);
}

/** "Pròxim dia sense classe a tot Catalunya: dimarts 8 de desembre (la Immaculada)." or null. */
export function nextHolidayLine(today: string, locale: Locale): string | null {
  const next = nextHolidayInTerm(today);
  if (!next) return null;
  return L(
    locale,
    `Pròxim dia feiner sense classe a tot Catalunya: ${weekdayDay(next.date, locale)} (${next.name.ca}).`,
    `Próximo día laborable sin clase en toda Cataluña: ${weekdayDay(next.date, locale)} (${next.name.es}).`,
    `Next weekday with no school anywhere in Catalonia: ${weekdayDay(next.date, locale)} (${next.name.en}).`,
  );
}

/* -------------------------------------------------------------------------- */
/* Title and search description                                               */
/* -------------------------------------------------------------------------- */

export const SCHOOL_TITLE_MAX = 60;
export const SCHOOL_DESCRIPTION_MAX = 155;

function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1)!;
}

/** "2026-27" */
function shortLabel(year: SchoolYear): string {
  return `${year.label.slice(0, 4)}-${year.label.slice(7, 9)}`;
}

/**
 * The title names the next break, in the words people search ("calendari
 * escolar 2026-27 catalunya", "vacances de nadal"): Christmas until it is
 * over, then Easter, then the last day, then the next year's first day.
 */
export function liveSchoolTitle(locale: Locale, today: string): string {
  const year = yearFor(today);
  const label = shortLabel(year);
  const head = L(locale, `Calendari escolar ${label} Catalunya: `, `Calendario escolar ${label} Cataluña: `, `Catalonia school calendar ${label}: `);
  const [c0, c1] = year.christmas;
  const [e0, e1] = year.easter;
  const easterSpan = (sep: string) => (e0.slice(5, 7) === e1.slice(5, 7) ? `${Number(e0.slice(8, 10))}${sep}${dm(e1)}` : `${dm(e0)}${sep}${dm(e1)}`);
  let tails: string[];
  if (today < year.start) {
    tails = L(
      locale,
      [`comença el ${dayMonth(year.start, "ca")}`, `comença el ${dm(year.start)}`],
      [`empieza el ${dayMonth(year.start, "es")}`, `empieza el ${dm(year.start)}`],
      [`starts ${dayMonth(year.start, "en")}`, `starts ${enShort(year.start)}`],
    );
  } else if (today <= c1) {
    tails = L(
      locale,
      [`Nadal del ${dm(c0)} al ${dm(c1)}`, `Nadal ${dm(c0)}-${dm(c1)}`],
      [`Navidad del ${dm(c0)} al ${dm(c1)}`, `Navidad ${dm(c0)}-${dm(c1)}`],
      [`Christmas ${enShort(c0)}–${enShort(c1)}`, `Christmas ${dm(c0)}–${dm(c1)}`],
    );
  } else if (today <= e1) {
    tails = L(
      locale,
      [`Setmana Santa del ${easterSpan(" al ")}`, `Setmana Santa ${easterSpan("-")}`],
      [`Semana Santa del ${easterSpan(" al ")}`, `Semana Santa ${easterSpan("-")}`],
      [`Easter ${enShort(e0)}–${enShort(e1)}`, `Easter ${dm(e0)}–${dm(e1)}`],
    );
  } else {
    tails = L(
      locale,
      [`acaba el ${dayMonth(year.end, "ca")}`, `acaba el ${dm(year.end)}`],
      [`termina el ${dayMonth(year.end, "es")}`, `termina el ${dm(year.end)}`],
      [`ends ${dayMonth(year.end, "en")}`, `ends ${enShort(year.end)}`],
    );
  }
  return fit(tails.map((tail) => `${head}${tail}`), SCHOOL_TITLE_MAX);
}

/**
 * The search description: what is happening now or next, in the order a
 * parent asks it. Sentences are added in priority order while they fit.
 */
export function liveSchoolDescription(locale: Locale, today: string): string {
  const year = yearFor(today);
  const status = schoolStatusOn(today);
  const [c0, c1] = year.christmas;
  const [e0, e1] = year.easter;
  // "del 20 al 29 de març" when both days are in one month, "del 22 de desembre al 7 de gener" otherwise.
  const span = (from: string, to: string) => {
    const a = from.slice(5, 7) === to.slice(5, 7) ? String(Number(from.slice(8, 10))) : dayMonth(from, locale);
    return L(locale, `del ${a} al ${dayMonth(to, locale)}`, `del ${a} al ${dayMonth(to, locale)}`, `${a} to ${dayMonth(to, locale)}`);
  };
  const christmas = L(locale, `Nadal: ${span(c0, c1)}.`, `Navidad: ${span(c0, c1)}.`, `Christmas: ${span(c0, c1)}.`);
  const easter = L(locale, `Setmana Santa: ${span(e0, e1)}.`, `Semana Santa: ${span(e0, e1)}.`, `Easter: ${span(e0, e1)}.`);
  const end = L(locale, `Últim dia: ${weekdayDay(year.end, locale)}.`, `Último día: ${weekdayDay(year.end, locale)}.`, `Last day: ${weekdayDay(year.end, locale)}.`);
  const free = L(locale, "Dies de lliure disposició i festius locals.", "Días de libre disposición y festivos locales.", "Free-choice days and local holidays.");

  const parts: string[] = [];
  if (status.kind === "christmas" || status.kind === "easter") {
    const back = weekdayDay(nextSchoolDay(status.until), locale);
    parts.push(
      status.kind === "christmas"
        ? L(locale, `Vacances de Nadal fins al ${dayMonth(c1, locale)}: es torna a classe el ${back}.`, `Vacaciones de Navidad hasta el ${dayMonth(c1, locale)}: se vuelve a clase el ${back}.`, `Christmas holidays until ${dayMonth(c1, locale)}: classes restart on ${back}.`)
        : L(locale, `Vacances de Setmana Santa fins al ${dayMonth(e1, locale)}: es torna a classe el ${back}.`, `Vacaciones de Semana Santa hasta el ${dayMonth(e1, locale)}: se vuelve a clase el ${back}.`, `Easter holidays until ${dayMonth(e1, locale)}: classes restart on ${back}.`),
    );
    parts.push(status.kind === "christmas" ? easter : end);
  } else if (status.kind === "summer" || today < year.start) {
    parts.push(
      L(
        locale,
        `Curs ${year.label}: comença el ${weekdayDay(year.start, locale)}.`,
        `Curso ${year.label}: empieza el ${weekdayDay(year.start, locale)}.`,
        `${year.label} school year: starts ${weekdayDay(year.start, locale)}.`,
      ),
      christmas,
      easter,
    );
  } else {
    const next = nextHolidayInTerm(today);
    if (next) {
      parts.push(
        L(
          locale,
          `Pròxim festiu escolar: ${weekdayDay(next.date, locale)}.`,
          `Próximo festivo escolar: ${weekdayDay(next.date, locale)}.`,
          `Next day off for all schools: ${weekdayDay(next.date, locale)}.`,
        ),
      );
    }
    if (today <= c1) parts.push(christmas, easter);
    else if (today <= e1) parts.push(easter, end);
    else parts.push(end);
  }
  parts.push(free);

  let out = "";
  for (const part of parts) {
    const candidate = out ? `${out} ${part}` : part;
    if (candidate.length <= SCHOOL_DESCRIPTION_MAX) out = candidate;
  }
  return out;
}
