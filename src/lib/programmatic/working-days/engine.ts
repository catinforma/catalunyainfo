/**
 * The working-days engine ("Calculadora de días hábiles"): pure date-only
 * arithmetic, no imports, no `Date`. A day is an ISO "YYYY-MM-DD" string and
 * every sum is done on an integer day number, so time zones and daylight
 * saving can never move a date (tests hold it).
 *
 * Three rule sets, each one as its text says it (rules.ts quotes them):
 *
 *  - "general": working days of a job. Sunday and the place's holidays are
 *    off; Saturday is off unless the reader works Saturdays.
 *  - "admin": administrative deadlines, Ley 39/2015 art. 30. Saturdays,
 *    Sundays and holidays are inhábiles (30.2); days run from the day after the
 *    notification (30.3); months end on the same day number, or the month's
 *    last day when it has none (30.4); a last day that is inhábil moves to the
 *    next hábil one (30.5); a day inhábil where the reader lives or where the
 *    body sits is inhábil (30.6: the caller passes the union of both places).
 *  - "judicial": court deadlines, LOPJ arts. 182, 183 and 185 and LEC arts.
 *    130.2 and 133: Saturdays, Sundays, holidays, every day of August and
 *    24 December to 6 January are inhábiles; days run from the day after the
 *    notification and the inhábiles are left out; a last day that is inhábil
 *    moves to the next hábil one. Only plazos by days: the urgent actuaciones
 *    and criminal instrucción, where August or every day is hábil, are out.
 *
 * The calendar knows a range of years (`from`–`to`): any day the sum needs
 * outside it makes the answer `outOfRange` instead of a guess.
 */

export type RuleSet = "general" | "admin" | "judicial";
export type Unit = "working" | "calendar" | "months";
export type Reason = "holiday" | "august" | "christmas" | "sunday" | "saturday";

export interface Calendar {
  /** Every holiday of the place (or places) in the range, as ISO dates. */
  holidays: ReadonlySet<string>;
  /** First and last day the holiday data covers. */
  from: string;
  to: string;
}

export interface DayRules {
  rules: RuleSet;
  /** "general" only: Saturday is a working day. Ignored by "admin" and "judicial" (always inhábil). */
  saturdays?: boolean;
}

/** The units each rule set accepts. */
export const UNITS: Record<RuleSet, readonly Unit[]> = {
  general: ["working", "calendar"],
  admin: ["working", "calendar", "months"],
  judicial: ["working"],
};

/** Upper bounds of the amount, per unit. */
export const MAX_AMOUNT: Record<Unit, number> = { working: 250, calendar: 365, months: 12 };

/* -------------------------------------------------------------------------- */
/* Calendar arithmetic on day numbers                                         */
/* -------------------------------------------------------------------------- */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** True for a real calendar date written "YYYY-MM-DD". */
export function isIsoDate(text: string): boolean {
  const m = ISO.exec(text);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

/** Days since 1970-01-01 (proleptic Gregorian; Howard Hinnant's days_from_civil). */
export function dayNumber(iso: string): number {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`not a date: ${iso}`);
  let y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  y -= mo <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (mo + (mo > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Back from a day number to "YYYY-MM-DD" (civil_from_days). */
export function isoFromDayNumber(n: number): string {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const mo = mp + (mp < 10 ? 3 : -9);
  const y = yoe + era * 400 + (mo <= 2 ? 1 : 0);
  return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function plusDays(iso: string, days: number): string {
  return isoFromDayNumber(dayNumber(iso) + days);
}

/** 0 Sunday … 6 Saturday. 1970-01-01 was a Thursday. */
export function weekday(iso: string): number {
  return (((dayNumber(iso) + 4) % 7) + 7) % 7;
}

/**
 * The same day number `months` later, or the month's last day when it has no
 * such day (Ley 39/2015 art. 30.4; LEC art. 133.3): 31 January + 1 month is
 * 28 February (29 in a leap year).
 */
export function plusMonths(iso: string, months: number): string {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`not a date: ${iso}`);
  const total = Number(m[1]) * 12 + (Number(m[2]) - 1) + months;
  const y = Math.floor(total / 12);
  const mo = (total % 12) + 1;
  const d = Math.min(Number(m[3]), daysInMonth(y, mo));
  return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Hábil or inhábil                                                           */
/* -------------------------------------------------------------------------- */

/** Why a day is not a working (hábil) day under the rules, or null when it is one. */
export function inhabilReason(iso: string, cal: Pick<Calendar, "holidays">, r: DayRules): Reason | null {
  if (cal.holidays.has(iso)) return "holiday";
  if (r.rules === "judicial") {
    const md = iso.slice(5);
    if (md.startsWith("08-")) return "august";
    if (md >= "12-24" || md <= "01-06") return "christmas";
  }
  const w = weekday(iso);
  if (w === 0) return "sunday";
  if (w === 6 && !(r.rules === "general" && r.saturdays)) return "saturday";
  return null;
}

export function isHabil(iso: string, cal: Pick<Calendar, "holidays">, r: DayRules): boolean {
  return inhabilReason(iso, cal, r) === null;
}

const inRange = (iso: string, cal: Calendar) => iso >= cal.from && iso <= cal.to;

/* -------------------------------------------------------------------------- */
/* Counting between two dates                                                 */
/* -------------------------------------------------------------------------- */

export interface CountResult {
  ok: true;
  /** Hábil (working) days in the span. */
  working: number;
  /** Every day of the span (días naturales). */
  calendar: number;
  /** The days left out, with why. */
  skipped: { date: string; reason: Reason }[];
  /** First and last day counted. */
  first: string;
  last: string;
}

export type CountError = { ok: false; error: "invalid" | "order" | "range" };

/**
 * Working days from `from` to `to`, both included unless `includeFrom` is
 * false (then the count starts the day after, as a deadline's would).
 */
export function countWorkingDays(from: string, to: string, cal: Calendar, r: DayRules, includeFrom = true): CountResult | CountError {
  if (!isIsoDate(from) || !isIsoDate(to)) return { ok: false, error: "invalid" };
  const first = includeFrom ? from : plusDays(from, 1);
  if (to < first) return { ok: false, error: "order" };
  if (!inRange(first, cal) || !inRange(to, cal)) return { ok: false, error: "range" };
  const skipped: CountResult["skipped"] = [];
  let working = 0;
  const a = dayNumber(first);
  const b = dayNumber(to);
  for (let n = a; n <= b; n++) {
    const iso = isoFromDayNumber(n);
    const reason = inhabilReason(iso, cal, r);
    if (reason) skipped.push({ date: iso, reason });
    else working += 1;
  }
  return { ok: true, working, calendar: b - a + 1, skipped, first, last: to };
}

/* -------------------------------------------------------------------------- */
/* Adding a plazo                                                             */
/* -------------------------------------------------------------------------- */

export interface DeadlineResult {
  ok: true;
  /** The day the count starts: the day after the notification. */
  first: string;
  /** Where the plazo ends before any move: the Nth hábil day, the date N days later, the same day N months later. */
  nominal: string;
  /** The last day to act: `nominal`, moved on to the next hábil day when it is inhábil (admin and judicial). */
  last: string;
  /** The inhábil days `nominal` was moved over (empty when it did not move). */
  movedOver: { date: string; reason: Reason }[];
  /** Hábil days inside the plazo (first to last, both included). */
  working: number;
  /** Calendar days from first to last, both included. */
  calendar: number;
  /** Days left out of the count (working-day plazos) or found inside it (others), first to last. */
  skipped: { date: string; reason: Reason }[];
  /**
   * Judicial only: the day after the last one, until 15:00 (LEC art. 135.5,
   * "hasta las quince horas del día hábil siguiente al del vencimiento").
   */
  graceDay: string | null;
}

export type DeadlineError = { ok: false; error: "invalid" | "unit" | "amount" | "range" };

function nextHabil(iso: string, cal: Calendar, r: DayRules): { day: string; over: DeadlineResult["movedOver"] } | null {
  const over: DeadlineResult["movedOver"] = [];
  let day = iso;
  for (let reason = inhabilReason(day, cal, r); reason; reason = inhabilReason(day, cal, r)) {
    over.push({ date: day, reason });
    day = plusDays(day, 1);
    if (!inRange(day, cal)) return null;
  }
  return { day, over };
}

/**
 * The last day of a plazo of `amount` `unit`s notified (or published) on
 * `notified`. "general" counts working days or calendar days from the day
 * after and never moves the end; "admin" and "judicial" apply their texts.
 */
export function deadline(notified: string, amount: number, unit: Unit, cal: Calendar, r: DayRules): DeadlineResult | DeadlineError {
  if (!isIsoDate(notified)) return { ok: false, error: "invalid" };
  if (!UNITS[r.rules].includes(unit)) return { ok: false, error: "unit" };
  if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT[unit]) return { ok: false, error: "amount" };
  const first = plusDays(notified, 1);
  if (!inRange(first, cal)) return { ok: false, error: "range" };

  let nominal: string;
  if (unit === "working") {
    let left = amount;
    let day = notified;
    while (left > 0) {
      day = plusDays(day, 1);
      if (!inRange(day, cal)) return { ok: false, error: "range" };
      if (isHabil(day, cal, r)) left -= 1;
    }
    nominal = day;
  } else if (unit === "calendar") {
    nominal = plusDays(notified, amount);
  } else {
    nominal = plusMonths(notified, amount);
  }
  if (!inRange(nominal, cal)) return { ok: false, error: "range" };

  let last = nominal;
  let movedOver: DeadlineResult["movedOver"] = [];
  if (r.rules !== "general") {
    const moved = nextHabil(nominal, cal, r);
    if (!moved) return { ok: false, error: "range" };
    last = moved.day;
    movedOver = moved.over;
  }

  let graceDay: string | null = null;
  if (r.rules === "judicial") {
    const after = plusDays(last, 1);
    if (!inRange(after, cal)) return { ok: false, error: "range" };
    const g = nextHabil(after, cal, r);
    if (!g) return { ok: false, error: "range" };
    graceDay = g.day;
  }

  const span = countWorkingDays(first, last, cal, r, true);
  if (!span.ok) return { ok: false, error: "range" };
  return { ok: true, first, nominal, last, movedOver, working: span.working, calendar: span.calendar, skipped: span.skipped, graceDay };
}
