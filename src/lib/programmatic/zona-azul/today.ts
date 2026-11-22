import { capitalize, longDate, weekdayDayMonth } from "@/lib/programmatic/holidays/format";

import { FREE, hoursText, theTime } from "./format";
import { dayAnswer, nextHoliday, nextPaidDay, nowState, type DayAnswer, type HolidayEntry } from "./logic";
import type { L, PaidRule, ZaLocale } from "./types";

/**
 * The words of the "is it paid today?" box, as a pure function of the moment
 * (date and clock time in Spain), the visitor zone's rule and the city's
 * public holidays. The client component calls it after mounting with the
 * device's clock; the tests call it with fixed moments. No data import: the
 * page passes the rule and the holidays as props.
 */

export interface TodayInput {
  locale: ZaLocale;
  /** The city's name in the page's language. */
  city: string;
  rule: PaidRule;
  holidays: readonly HolidayEntry[];
  /** The years whose local holidays are in `holidays`. */
  localYears: readonly number[];
  /** The last date the holiday calendar covers. */
  through: string;
}

export interface TodayView {
  /** True when nothing more is paid today (the answer is a "no"). */
  free: boolean;
  answer: string;
  date: string;
  facts: { label: string; value: string }[];
  notes: string[];
}

export const TODAY_LABELS: Record<ZaLocale, { now: string; tomorrow: string; nextHoliday: string }> = {
  es: { now: "Ahora mismo", tomorrow: "Mañana", nextHoliday: "Próximo festivo" },
  ca: { now: "Ara mateix", tomorrow: "Demà", nextHoliday: "Pròxim festiu" },
  en: { now: "Right now", tomorrow: "Tomorrow", nextHoliday: "Next public holiday" },
};

const DAY_WORD: Record<"saturday" | "sunday", L> = {
  saturday: { es: "sábado", ca: "dissabte", en: "Saturday" },
  sunday: { es: "domingo", ca: "diumenge", en: "Sunday" },
};

function plusOne(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/** Why a day has no paid hours: "domingo", "festivo: Inmaculada Concepción". */
function reason(day: DayAnswer, locale: ZaLocale): string {
  if (day.type === "holiday") return { es: `festivo: ${day.holiday}`, ca: `festiu: ${day.holiday}`, en: `public holiday: ${day.holiday}` }[locale];
  if (day.type === "sunday" || day.type === "saturday") return DAY_WORD[day.type][locale];
  return { es: "sin horario de pago", ca: "sense horari de pagament", en: "no paid hours" }[locale];
}

/** "de 9:00 a 21:00" or "no se paga (domingo)". */
function dayLine(day: DayAnswer, locale: ZaLocale): string {
  if (day.ranges.length > 0) return hoursText(day.ranges, locale);
  return { es: `no se paga (${reason(day, locale)})`, ca: `no es paga (${reason(day, locale)})`, en: `free (${reason(day, locale)})` }[locale];
}

function answerLine(day: DayAnswer, over: string | null, locale: ZaLocale): string {
  if (over) {
    return {
      es: `Hoy ya no se paga: el horario terminó a ${theTime(over, locale)}.`,
      ca: `Avui ja no es paga: l'horari ha acabat a ${theTime(over, locale)}.`,
      en: `Not any more today: paid hours ended at ${theTime(over, locale)}.`,
    }[locale];
  }
  if (day.ranges.length > 0) {
    const hours = hoursText(day.ranges, locale);
    return { es: `Sí: hoy se paga, ${hours}.`, ca: `Sí: avui es paga, ${hours}.`, en: `Yes: paid today, ${hours}.` }[locale];
  }
  if (day.type === "holiday") {
    return {
      es: `No: hoy es festivo (${day.holiday}) y no se paga.`,
      ca: `No: avui és festiu (${day.holiday}) i no es paga.`,
      en: `No: today is a public holiday (${day.holiday}) and parking is free.`,
    }[locale];
  }
  if (day.type === "sunday" || day.type === "saturday") {
    const word = DAY_WORD[day.type][locale];
    return { es: `No: hoy es ${word} y no se paga.`, ca: `No: avui és ${word} i no es paga.`, en: `No: today is ${word} and parking is free.` }[locale];
  }
  return { es: "No: hoy no se paga.", ca: "No: avui no es paga.", en: "No: parking is free today." }[locale];
}

function freeUntilNext(input: TodayInput, iso: string): string {
  const { locale } = input;
  const next = nextPaidDay(input.rule, iso, input.holidays);
  if (!next) return FREE[locale];
  const when = weekdayDayMonth(next.iso, locale);
  const at = theTime(next.ranges[0]![0], locale);
  return {
    es: `Gratis hasta el ${when} a ${at}`,
    ca: `Gratuït fins ${when} a ${at}`,
    en: `Free until ${when} at ${at}`,
  }[locale];
}

export function todayView(input: TodayInput, clock: { iso: string; hhmm: string }): TodayView {
  const { locale, rule, holidays } = input;
  const labels = TODAY_LABELS[locale];
  const today = dayAnswer(rule, clock.iso, holidays);
  const state = nowState(today.ranges, clock.hhmm);

  let now: string;
  if (state.kind === "paid") {
    const then = state.resumes ? hoursText([[state.resumes, state.end]], locale) : null;
    now = {
      es: `De pago hasta ${theTime(state.until, locale)}${then ? `; después, ${then}` : ""}`,
      ca: `De pagament fins a ${theTime(state.until, locale)}${then ? `; després, ${then}` : ""}`,
      en: `Paid until ${theTime(state.until, locale)}${then ? `; then ${then}` : ""}`,
    }[locale];
  } else if (state.kind === "before" || state.kind === "break") {
    const start = state.kind === "before" ? state.start : state.resumes;
    now = {
      es: `Gratis hasta ${theTime(start, locale)}`,
      ca: `Gratuït fins a ${theTime(start, locale)}`,
      en: `Free until ${theTime(start, locale)}`,
    }[locale];
  } else {
    now = freeUntilNext(input, clock.iso);
  }

  const tomorrow = dayAnswer(rule, plusOne(clock.iso), holidays);
  const facts = [
    { label: labels.now, value: now },
    { label: labels.tomorrow, value: `${capitalize(weekdayDayMonth(tomorrow.iso, locale))}: ${dayLine(tomorrow, locale)}` },
  ];
  const holiday = nextHoliday(holidays, clock.iso);
  if (holiday) {
    const day = dayAnswer(rule, holiday.d, holidays);
    const hours = day.ranges.length > 0 ? hoursText(day.ranges, locale) : { es: "no se paga", ca: "no es paga", en: "free" }[locale];
    facts.push({ label: labels.nextHoliday, value: `${capitalize(weekdayDayMonth(holiday.d, locale))} (${holiday.n}): ${hours}` });
  }

  const applied = today.special ?? today.season;
  const date = `${capitalize(longDate(clock.iso, locale))}${applied ? ` · ${applied.label[locale]}` : ""}`;

  const year = Number(clock.iso.slice(0, 4));
  const notes: string[] = [
    {
      es: `Hora peninsular española. Cálculo con el horario general y los festivos de ${input.city}; en algunas calles el horario es otro y manda la señal.`,
      ca: `Hora peninsular espanyola. Càlcul amb l'horari general i els festius de ${input.city}; en alguns carrers l'horari és un altre i mana el senyal.`,
      en: `Time in mainland Spain. Worked out from the general timetable and the public holidays of ${input.city}; some streets have other hours and the sign prevails.`,
    }[locale],
  ];
  if (clock.iso > input.through) {
    notes.push(
      {
        es: `El calendario de festivos de ${year} todavía no está en nuestros datos: el cálculo solo distingue laborables, sábados y domingos.`,
        ca: `El calendari de festius del ${year} encara no és a les nostres dades: el càlcul només distingeix feiners, dissabtes i diumenges.`,
        en: `The ${year} public holiday calendar is not in our data yet: the answer only tells working days, Saturdays and Sundays apart.`,
      }[locale],
    );
  } else if (!input.localYears.includes(year)) {
    notes.push(
      {
        es: `Los festivos locales de ${year} en ${input.city} no entran en este cálculo: no están en nuestros datos.`,
        ca: `Els festius locals del ${year} a ${input.city} no entren en aquest càlcul: no són a les nostres dades.`,
        en: `The local holidays of ${year} in ${input.city} are not counted here: they are not in our data.`,
      }[locale],
    );
  }

  const over = state.kind === "over" ? state.ended : null;
  return { free: state.kind === "over" || state.kind === "free-day", answer: answerLine(today, over, locale), date, facts, notes };
}
