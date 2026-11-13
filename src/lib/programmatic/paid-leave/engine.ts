import { addDays, addMonths, isIsoDate } from "@/lib/programmatic/employment/dates";
import { inhabilReason, type Calendar, type DayRules, type Reason } from "@/lib/programmatic/working-days/engine";

import { BIRTH, NURSING, PARENTAL, SHORT_EVENTS, SHORT_RULES, type DayCount, type EventId, type ShortEvent } from "./rules";

/**
 * The paid-leave calculator, pure (client-safe, no data): how many days a
 * leave of the Estatuto de los Trabajadores gives and its last day, and the
 * birth-leave timeline from the date of birth. Every number comes from
 * rules.ts.
 *
 * Counting, stated on the page:
 *  - Day 1 is the first day of leave the reader enters.
 *  - "natural" leaves (marriage, art. 37.3.a; holidays, art. 38.1) run on
 *    consecutive calendar days, as the ET says.
 *  - For the leaves where the ET only says "días" (arts. 37.3.b, b bis, c)
 *    both counts are given: consecutive calendar days, and Monday-to-Friday
 *    days that are not a holiday of the chosen place (the working-days
 *    engine's holidays), for when a collective agreement counts working days.
 *    The page does not say which one applies.
 *  - Birth leave: the six mandatory weeks start on the day of birth (day 1).
 */

export interface PaidLeaveInput {
  event: EventId;
  /** First day of leave (short events). */
  start: string;
  /** Death only: the worker has to travel (art. 37.3.b bis: two more days). */
  travel: boolean;
  /** Holiday place for the working-day count (a working-days place value). */
  place: string;
  /** Date of birth (birth leave). */
  birth: string;
  /** Single parent (monoparentalidad). */
  single: boolean;
}

/** Thursday 3 December 2026: the Constitution day (Sunday 6th), 7 December (Madrid) and 8 December fall inside a five-day leave. */
export const DEFAULT_START = "2026-12-03";

export const DEFAULT_INPUT: Omit<PaidLeaveInput, "place"> = {
  event: "illness",
  start: DEFAULT_START,
  travel: false,
  birth: DEFAULT_START,
  single: false,
};

/** Monday to Friday, holidays of the place off (a Saturday is not counted). */
export const WEEKDAY_RULES: DayRules = { rules: "general", saturdays: false };

export function isShortEvent(e: EventId): e is ShortEvent {
  return (SHORT_EVENTS as readonly string[]).includes(e);
}

export interface SkippedDay {
  date: string;
  reason: Reason;
}

export interface WorkingCount {
  /** The first day counted (the start, or the next working day). */
  first: string;
  last: string;
  /** Days between the first and the last that were not counted. */
  skipped: SkippedDay[];
}

export interface ShortLeaveResult {
  event: ShortEvent;
  days: number;
  count: DayCount;
  /** Last day counting consecutive calendar days. */
  lastCalendar: string;
  /** Monday-to-Friday count without the place's holidays; null for "natural" leaves or outside the holiday data. */
  working: WorkingCount | null;
  /** The working-day count ran outside the years the holiday data covers. */
  outOfRange: boolean;
}

/** Number of days of a short leave (death: two more when travelling). */
export function leaveDays(event: ShortEvent, travel: boolean): number {
  const r = SHORT_RULES[event];
  return r.days + (travel ? r.travelExtra : 0);
}

/** Counts `days` working days from `start` (the start counted if it is one). */
export function countWorking(start: string, days: number, cal: Calendar, r: DayRules = WEEKDAY_RULES): WorkingCount | null {
  let d = start;
  let counted = 0;
  let first = "";
  const skipped: SkippedDay[] = [];
  for (let guard = 0; guard < 400; guard++) {
    if (d < cal.from || d > cal.to) return null;
    const reason = inhabilReason(d, cal, r);
    if (reason === null) {
      if (!first) first = d;
      counted++;
      if (counted === days) return { first, last: d, skipped };
    } else if (first) {
      skipped.push({ date: d, reason });
    }
    d = addDays(d, 1);
  }
  return null;
}

export function shortLeave(event: ShortEvent, start: string, travel: boolean, cal: Calendar): ShortLeaveResult {
  const days = leaveDays(event, travel);
  const count = SHORT_RULES[event].count;
  const lastCalendar = addDays(start, days - 1);
  if (count === "natural") return { event, days, count, lastCalendar, working: null, outOfRange: false };
  const working = countWorking(start, days, cal);
  return { event, days, count, lastCalendar, working, outOfRange: working === null };
}

export interface BirthPlan {
  birth: string;
  single: boolean;
  totalWeeks: number;
  /** Six weeks from the day of birth, full time. */
  mandatoryEnd: string;
  flexibleWeeks: number;
  /** The flexible weeks can start the day after the mandatory ones… */
  flexibleFrom: string;
  /** …and be used "hasta que el hijo o la hija cumpla doce meses": the first birthday. */
  flexibleUntil: string;
  /** Last day if the flexible weeks follow the mandatory ones without a break. */
  continuousEnd: string;
  childcareWeeks: number;
  /** "hasta que el hijo o la hija cumpla los ocho años": the eighth birthday. */
  childcareUntil: string;
  /** Art. 37.4: the nursing hour until nine months (twelve if both parents take it alike). */
  nursingUntil: string;
  nursingSharedUntil: string;
  /** Art. 48 bis: parental leave (unpaid) until the eighth birthday. */
  parentalUntil: string;
}

export function birthPlan(birth: string, single: boolean): BirthPlan {
  const flexibleWeeks = single ? BIRTH.single.flexibleWeeks : BIRTH.flexibleWeeks;
  const childcareWeeks = single ? BIRTH.single.childcareWeeks : BIRTH.childcareWeeks;
  const totalWeeks = single ? BIRTH.single.totalWeeks : BIRTH.totalWeeks;
  const mandatoryEnd = addDays(birth, BIRTH.mandatoryWeeks * 7 - 1);
  return {
    birth,
    single,
    totalWeeks,
    mandatoryEnd,
    flexibleWeeks,
    flexibleFrom: addDays(mandatoryEnd, 1),
    flexibleUntil: addMonths(birth, BIRTH.flexibleUntilMonths),
    continuousEnd: addDays(birth, (BIRTH.mandatoryWeeks + flexibleWeeks) * 7 - 1),
    childcareWeeks,
    childcareUntil: addMonths(birth, BIRTH.childcareUntilYears * 12),
    nursingUntil: addMonths(birth, NURSING.untilMonths),
    nursingSharedUntil: addMonths(birth, NURSING.sharedUntilMonths),
    parentalUntil: addMonths(birth, PARENTAL.untilYears * 12),
  };
}

/** A date the engine accepts (the inputs and the URL hash). */
export function validDate(s: string): boolean {
  return isIsoDate(s) && s >= "2000-01-01" && s <= "2100-12-31";
}
