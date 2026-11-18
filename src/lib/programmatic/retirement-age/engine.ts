import {
  EARLY_MAX_MONTHS,
  EARLY_MIN_CONTRIBUTION,
  LOWER_AGE,
  MIN_CONTRIBUTION,
  PHASE_IN,
  PHASE_IN_FROM,
  activeShareFor,
  coefficient,
  columnFor,
  delayBonus,
  fromMonths,
  phaseInRow,
  toMonths,
  type ColumnId,
  type EarlyKind,
  type PhaseInRow,
  type YM,
} from "./rules";

/**
 * "¿A qué edad me puedo jubilar?": from the date of birth and the period
 * contributed so far, the day the ordinary retirement age is reached (LGSS
 * art. 205.1.a and DT 7ª), whether the 65 rule applies, the earliest early
 * retirement (arts. 207 and 208) with its coefficient, and the delay bonus
 * (art. 210.2.a). Pure: every figure comes from rules.ts, no clock (the
 * caller passes the day the contributions were counted). Client-safe.
 *
 * Ages and periods are counted "de fecha a fecha" (Seguridad Social): n
 * months after the 31st is the last day of the month when that month is
 * shorter. Contributions grow by whole months only, as art. 205.1.a counts
 * them ("años y meses completos").
 */

export type RetirementType = "ordinary" | "involuntary" | "voluntary" | "delayed";
export const RETIREMENT_TYPES: readonly RetirementType[] = ["ordinary", "involuntary", "voluntary", "delayed"];

export interface RetirementInput {
  /** Date of birth, "1965-06-20". */
  birth: string;
  /** Years and months contributed up to the day of the calculation. */
  years: number;
  months: number;
  /** Whether contributions go on until retiring (the Seguridad Social's premise: the current situation continues). */
  keepContributing: boolean;
  type: RetirementType;
  /** Delayed retirement: months after the ordinary date. */
  delayMonths: number;
}

export type InvalidReason = "birth" | "too-young" | "too-old" | "years" | "months" | "too-much" | "delay";

/** Born before this day, the 65th birthday falls before the table (2013): the old rule applied. */
export const BORN_FROM = `${PHASE_IN_FROM - 65}-01-01`;
/** Younger than this, no working life to count. */
export const MIN_AGE_YEARS = 16;
/** Contributions cannot start before this age (a check on typos). */
export const CONTRIB_FROM_AGE = 14;
export const MAX_YEARS = 60;
export const MAX_DELAY_MONTHS = 120;

/* -------------------------------------------------------------------------- */
/* Dates, "de fecha a fecha"                                                  */
/* -------------------------------------------------------------------------- */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function split(iso: string): [number, number, number] {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`not an ISO day: ${iso}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

const pad = (n: number) => String(n).padStart(2, "0");
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export function isIsoDay(s: string): boolean {
  const m = ISO.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

/** n months after (or before) a day; the last day of the month when the day does not exist (Seguridad Social). */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = split(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return `${ny}-${pad(nm)}-${pad(Math.min(d, daysInMonth(ny, nm)))}`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = split(iso);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Whole months from one day to another (0 when `to` is not later). */
export function fullMonths(from: string, to: string): number {
  if (to <= from) return 0;
  const [fy, fm] = split(from);
  const [ty, tm] = split(to);
  let n = (ty - fy) * 12 + (tm - fm);
  while (n > 0 && addMonths(from, n) > to) n--;
  return n;
}

/** Months or fraction of a month from one day until another (arts. 207.2 and 208.2: "por cada mes o fracción de mes"). */
export function monthsUntil(from: string, to: string): number {
  if (to <= from) return 0;
  const n = fullMonths(from, to);
  return addMonths(from, n) === to ? n : n + 1;
}

/** The age on a day, in whole years and months. */
export function ageOn(birth: string, day: string): YM {
  return fromMonths(fullMonths(birth, day));
}

const yearOf = (iso: string) => Number(iso.slice(0, 4));
const maxDay = (...days: string[]) => days.reduce((a, b) => (b > a ? b : a));

/* -------------------------------------------------------------------------- */
/* Contributions over time                                                    */
/* -------------------------------------------------------------------------- */

/** Months contributed on `anchor`, and whether they keep growing after it. */
export interface Contributions {
  anchor: string;
  base: number;
  grows: boolean;
}

/**
 * Months contributed on a day. After the anchor: + one per whole month if
 * contributions go on. Before it: as if contributed without a break up to
 * the anchor (the lower, safer figure: a gap in the past would only lower it
 * further, and the Seguridad Social reads the real working life).
 */
export function contributedOn(c: Contributions, day: string): number {
  if (day >= c.anchor) return c.grows ? c.base + fullMonths(c.anchor, day) : c.base;
  return Math.max(0, c.base - monthsUntil(day, c.anchor));
}

/* -------------------------------------------------------------------------- */
/* Ordinary age (art. 205.1.a, DT 7ª)                                         */
/* -------------------------------------------------------------------------- */

export interface OrdinaryDate {
  /** The first day the ordinary age is reached. */
  date: string;
  age: YM;
  /** "65": 65 or older with the year's contribution period; "full": the full age of the year's row. */
  via: "65" | "full";
  row: PhaseInRow;
  /** Months contributed on that day. */
  contributed: number;
}

function meets(birth: string, c: Contributions, day: string): "65" | "full" | null {
  if (day < addMonths(birth, toMonths(LOWER_AGE)) || yearOf(day) < PHASE_IN_FROM) return null;
  const row = phaseInRow(yearOf(day));
  if (contributedOn(c, day) >= toMonths(row.threshold)) return "65";
  return day >= addMonths(birth, toMonths(row.age)) ? "full" : null;
}

/**
 * The first day on which the person's age is at least the one the table
 * asks for that day's year: 65 with the year's contribution period, or the
 * year's full age. Only the 65th birthday, the days contributions reach a
 * threshold and the days each row's age is reached can be that first day
 * (the requirements only rise from one year to the next), so those are the
 * candidates.
 */
export function ordinaryDate(birth: string, c: Contributions): OrdinaryDate {
  const candidates = new Set<string>([addMonths(birth, toMonths(LOWER_AGE))]);
  for (const row of PHASE_IN) {
    candidates.add(addMonths(birth, toMonths(row.age)));
    const k = toMonths(row.threshold) - c.base;
    if (k <= 0 || c.grows) candidates.add(addMonths(c.anchor, k));
  }
  const sorted = [...candidates].sort();
  for (const day of sorted) {
    const via = meets(birth, c, day);
    if (via) return { date: day, age: ageOn(birth, day), via, row: phaseInRow(yearOf(day)), contributed: contributedOn(c, day) };
  }
  throw new Error(`no ordinary date for ${birth}`);
}

/* -------------------------------------------------------------------------- */
/* Early retirement (arts. 207 and 208)                                       */
/* -------------------------------------------------------------------------- */

export type EarlyOutcome =
  | {
      status: "ok";
      /** The earliest day: the later of the minimum age, the minimum contributions and the day of the calculation. */
      date: string;
      age: YM;
      /** True when that day is the day of the calculation (the age and the contributions are already there). */
      now: boolean;
      /** The ordinary date it is counted against: as if contributions went on from the early date (arts. 207.2 and 208.2). */
      reference: string;
      monthsAhead: number;
      contributed: number;
      column: ColumnId;
      /** % reduction of the pension. */
      coefficient: number;
    }
  | { status: "none"; reason: "contribution" | "past" };

export function earliestEarly(kind: EarlyKind, birth: string, c: Contributions, asOf: string): EarlyOutcome {
  const need = toMonths(EARLY_MIN_CONTRIBUTION[kind]);
  const max = EARLY_MAX_MONTHS[kind];
  const ordinaryNow = ordinaryDate(birth, { ...c, grows: true });
  if (ordinaryNow.date <= asOf) return { status: "none", reason: "past" };
  // The day the minimum contribution is reached (never, if it is short and does not grow).
  const enough = c.base >= need ? asOf : c.grows ? addMonths(c.anchor, need - c.base) : null;
  if (!enough) return { status: "none", reason: "contribution" };
  // No ordinary age is under 65, so nothing starts before 65 minus the maximum.
  const end = addMonths(birth, 67 * 12);
  for (let day = maxDay(asOf, enough, addMonths(birth, toMonths(LOWER_AGE) - max)); day < end; day = addDays(day, 1)) {
    const contributed = contributedOn(c, day);
    const reference = ordinaryDate(birth, { anchor: day, base: contributed, grows: true }).date;
    const monthsAhead = monthsUntil(day, reference);
    if (monthsAhead < 1) break;
    if (monthsAhead <= max) {
      return {
        status: "ok",
        date: day,
        age: ageOn(birth, day),
        now: day === asOf,
        reference,
        monthsAhead,
        contributed,
        column: columnFor(contributed),
        coefficient: coefficient(kind, monthsAhead, contributed)!,
      };
    }
  }
  return { status: "none", reason: "contribution" };
}

/* -------------------------------------------------------------------------- */
/* Delayed retirement (art. 210.2) and jubilación activa (art. 214)           */
/* -------------------------------------------------------------------------- */

export type DelayOutcome =
  | { status: "ok"; date: string; age: YM; months: number; bonus: number; activeShare: number | null }
  | { status: "none"; reason: "not-contributing" | "minimum"; date: string; months: number };

export function delayed(birth: string, ordinary: OrdinaryDate, c: Contributions, months: number): DelayOutcome {
  const date = addMonths(ordinary.date, months);
  // Art. 210.2: the minimum period (15 years) must be there on the ordinary date…
  if (ordinary.contributed < toMonths(MIN_CONTRIBUTION)) return { status: "none", reason: "minimum", date, months };
  // …and only years contributed after it count.
  if (!c.grows) return { status: "none", reason: "not-contributing", date, months };
  return { status: "ok", date, age: ageOn(birth, date), months, bonus: delayBonus(months), activeShare: activeShareFor(months) };
}

/* -------------------------------------------------------------------------- */
/* The calculation                                                            */
/* -------------------------------------------------------------------------- */

export interface RetirementResult {
  status: "ok";
  asOf: string;
  input: RetirementInput;
  /** Age on the day of the calculation. */
  age: YM;
  /** Months contributed on the day of the calculation. */
  contributed: number;
  ordinary: OrdinaryDate & { reached: boolean };
  /** The 65 rule on the 65th birthday: the period the table asks for that year and the one projected. */
  at65: { date: string; threshold: YM; contributed: number; met: boolean };
  /** Art. 205.1.b: 15 years by the ordinary date, or the day they are reached. */
  minimum: { met: boolean; from: string | null };
  early: Record<EarlyKind, EarlyOutcome>;
  delay: DelayOutcome;
}

export type RetirementCheck = RetirementResult | { status: "invalid"; reason: InvalidReason };

export function validate(input: RetirementInput, asOf: string): InvalidReason | null {
  if (!isIsoDay(input.birth) || input.birth > asOf) return "birth";
  if (input.birth < BORN_FROM) return "too-old";
  if (addMonths(input.birth, MIN_AGE_YEARS * 12) > asOf) return "too-young";
  if (!Number.isInteger(input.years) || input.years < 0 || input.years > MAX_YEARS) return "years";
  if (!Number.isInteger(input.months) || input.months < 0 || input.months > 11) return "months";
  if (input.years * 12 + input.months > fullMonths(addMonths(input.birth, CONTRIB_FROM_AGE * 12), asOf)) return "too-much";
  if (input.type === "delayed" && (!Number.isInteger(input.delayMonths) || input.delayMonths < 1 || input.delayMonths > MAX_DELAY_MONTHS)) return "delay";
  return null;
}

export function calculate(input: RetirementInput, asOf: string): RetirementCheck {
  const reason = validate(input, asOf);
  if (reason) return { status: "invalid", reason };
  const base = input.years * 12 + input.months;
  const c: Contributions = { anchor: asOf, base, grows: input.keepContributing };
  const ordinary = ordinaryDate(input.birth, c);
  const b65 = addMonths(input.birth, toMonths(LOWER_AGE));
  const row65 = phaseInRow(yearOf(b65));
  const at65 = { date: b65, threshold: row65.threshold, contributed: contributedOn(c, b65), met: contributedOn(c, b65) >= toMonths(row65.threshold) };
  const min = toMonths(MIN_CONTRIBUTION);
  const minimum =
    ordinary.contributed >= min ? { met: true, from: null } : { met: false, from: input.keepContributing ? maxDay(ordinary.date, addMonths(asOf, min - base)) : null };
  return {
    status: "ok",
    asOf,
    input,
    age: ageOn(input.birth, asOf),
    contributed: base,
    ordinary: { ...ordinary, reached: ordinary.date <= asOf },
    at65,
    minimum,
    early: { involuntary: earliestEarly("involuntary", input.birth, c, asOf), voluntary: earliestEarly("voluntary", input.birth, c, asOf) },
    delay: delayed(input.birth, ordinary, c, input.delayMonths),
  };
}

/** For pages and tests: the result of a valid input. */
export function calculateOk(input: RetirementInput, asOf: string): RetirementResult {
  const r = calculate(input, asOf);
  if (r.status !== "ok") throw new Error(`invalid input: ${r.reason}`);
  return r;
}

/** A person, with the defaults of the page's calculator. */
export function person(birth: string, years: number, months = 0, keepContributing = true, type: RetirementType = "ordinary", delayMonths = 12): RetirementInput {
  return { birth, years, months, keepContributing, type, delayMonths };
}
