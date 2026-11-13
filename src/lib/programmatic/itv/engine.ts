import { CATEGORIES, EARLY_DAYS, type Category, type CategoryId, type Frequency } from "./rules";

/**
 * "¿Cuándo me toca pasar la ITV?": pure date arithmetic on RD 920/2017
 * art. 6. Dates are ISO strings ("2027-03-15"), computed in UTC so the
 * result is the same in Node and in every browser.
 *
 * How we read article 6 (each step is printed on the page):
 *  1. Age counts from the first registration (art. 6.1, after the table).
 *  2. The first inspection is due when the exempt period ends ("Hasta 4
 *     años: Exento" → on the 4th anniversary of the first registration).
 *  3. A favourable inspection is valid for the frequency of the age band the
 *     vehicle is in on the day the new validity starts: the inspection day,
 *     or the old expiry when it was passed within the 30 calendar days
 *     before it (art. 6.5). A band starts on the anniversary it names ("De
 *     más de 10 años: Anual" → annual from the 10th anniversary).
 *  4. Months are added to the same day of the month; a day the month does
 *     not have becomes its last day (29 February + 1 year → 28 February).
 *
 * The date that counts is the one printed on the inspection report ("Fecha
 * próxima inspección", annex II) and held in the DGT's vehicle register
 * (art. 12.2): the calculator says so next to every result.
 */

export interface ItvInput {
  category: CategoryId;
  /** First registration ("fecha de primera matriculación"), ISO. */
  firstRegistration: string;
  /** The day of the last favourable periodic inspection, ISO (optional). */
  lastInspection?: string | null;
  /** The expiry the last inspection replaced, ISO (optional: only needed for the 30-day rule). */
  previousExpiry?: string | null;
  /** Today, ISO, for the status line (optional: the server-rendered example has none). */
  today?: string | null;
}

export type ItvResult =
  | { status: "invalid"; reason: "dates" | "order" | "future" }
  | {
      status: "ok";
      category: Category;
      /** The next due date: inspect before it (annex II wording). */
      due: string;
      /** How `due` was found. */
      basis: "first" | "from-last" | "from-previous-expiry" | "assumed-on-time";
      /** The frequency, in months, that gave `due` ("exempt" when it is the first inspection). */
      every: Frequency;
      /** First day of the 30-day window that keeps the date (art. 6.5); null for a first inspection. */
      earlyFrom: string | null;
      /** Age in whole years on the due date. */
      ageAtDue: number;
      /** The following due dates if each one is kept (up to 4). */
      then: string[];
      /** Days from `today` to `due` (negative: expired); null without `today`. */
      daysLeft: number | null;
      /**
       * Set when the vehicle reaches a stricter age band after the validity
       * started and before `due` (an inspection passed at 9 years and 10
       * months, valid two years). Article 6 does not say whether that brings
       * the date forward: the page says so and points to the report.
       */
      bandChange: { on: string; years: number; every: Frequency } | null;
    };

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: string | null | undefined): s is string {
  if (!s) return false;
  const m = ISO.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || y > 2200 || mo < 1 || mo > 12) return false;
  return d >= 1 && d <= daysInMonth(y, mo);
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return [y, m, d];
}

function iso(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Same day `months` later; a missing day becomes the month's last (31 Jan + 1 month → 28/29 Feb). */
export function addMonths(date: string, months: number): string {
  const [y, m, d] = parts(date);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return iso(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Calendar days from a to b (b − a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = parts(a);
  const [by, bm, bd] = parts(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Whole years from the first registration to `on` (the anniversary day counts as reached). */
export function ageInYears(firstRegistration: string, on: string): number {
  let age = parts(on)[0] - parts(firstRegistration)[0];
  // Compare against the anniversary as addMonths places it (29 Feb → 28 Feb in common years).
  if (on < addMonths(firstRegistration, age * 12)) age -= 1;
  return Math.max(0, age);
}

export function categoryOf(id: CategoryId): Category {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) throw new Error(`itv: unknown category ${id}`);
  return c;
}

/** The art. 6.1 frequency for a vehicle of `age` whole years. */
export function frequencyAt(category: Category, age: number): Frequency {
  let every: Frequency = category.bands[0]!.every;
  for (const b of category.bands) if (age >= b.fromYears) every = b.every;
  return every;
}

/** The first periodic inspection's due date: the end of the exempt period, or one frequency after registration when there is none. */
export function firstDue(category: Category, firstRegistration: string): string {
  const exempt = category.bands[0]!.every === "exempt" ? category.bands[1]!.fromYears : 0;
  if (exempt > 0) return addMonths(firstRegistration, exempt * 12);
  // No exempt period (buses, lorries, taxis): the first periodic one falls one frequency after registration.
  return addMonths(firstRegistration, monthsOf(frequencyAt(category, 0)));
}

function monthsOf(f: Frequency): number {
  if (f === "exempt") throw new Error("itv: no frequency in the exempt band");
  return f;
}

/** The validity that starts on `start`: start + the frequency of the band the vehicle is in that day. */
export function validityFrom(category: Category, firstRegistration: string, start: string): { due: string; every: Frequency } {
  const every = frequencyAt(category, ageInYears(firstRegistration, start));
  if (every === "exempt") {
    // Inspected inside the exempt period: the periodic schedule still starts when the exemption ends.
    return { due: firstDue(category, firstRegistration), every: "exempt" };
  }
  return { due: addMonths(start, every), every };
}

/** The chain of due dates when each inspection is passed on time (within the 30 days before). */
export function onTimeChain(category: Category, firstRegistration: string, count: number, from?: string): string[] {
  const out: string[] = [];
  let due = from ?? firstDue(category, firstRegistration);
  for (let i = 0; i < count; i++) {
    out.push(due);
    due = validityFrom(category, firstRegistration, due).due;
  }
  return out;
}

export function nextItv(input: ItvInput): ItvResult {
  const { firstRegistration: reg } = input;
  const last = input.lastInspection || null;
  const prev = input.previousExpiry || null;
  if (!isIsoDate(reg) || (last !== null && !isIsoDate(last)) || (prev !== null && !isIsoDate(prev)) || (input.today && !isIsoDate(input.today))) {
    return { status: "invalid", reason: "dates" };
  }
  if (last !== null && last < reg) return { status: "invalid", reason: "order" };
  if (input.today && (reg > input.today || (last !== null && last > input.today))) return { status: "invalid", reason: "future" };

  const category = categoryOf(input.category);
  let due: string;
  let every: Frequency;
  let basis: "first" | "from-last" | "from-previous-expiry" | "assumed-on-time";
  let start: string | null = null;

  if (last !== null) {
    // Art. 6.5: inside the 30 days before the old expiry, the new validity runs from that expiry.
    const keepsDate = prev !== null && last < prev && daysBetween(last, prev) <= EARLY_DAYS;
    start = keepsDate ? prev! : last;
    ({ due, every } = validityFrom(category, reg, start));
    basis = every === "exempt" ? "first" : keepsDate ? "from-previous-expiry" : "from-last";
  } else {
    const first = firstDue(category, reg);
    const exempt = category.bands[0]!.every === "exempt";
    if (!input.today || input.today <= first) {
      due = first;
      every = exempt ? "exempt" : frequencyAt(category, 0);
      basis = "first";
    } else {
      // No last inspection given: the on-time chain, first due date on or after today.
      const chain = onTimeChain(category, reg, 200);
      due = chain.find((d) => d >= input.today!) ?? chain.at(-1)!;
      const i = chain.indexOf(due);
      every = i === 0 ? (exempt ? "exempt" : frequencyAt(category, 0)) : validityFrom(category, reg, chain[i - 1]!).every;
      basis = i === 0 ? "first" : "assumed-on-time";
      start = i === 0 ? null : chain[i - 1]!;
    }
  }

  const then = onTimeChain(category, reg, 5, due).slice(1);
  return {
    status: "ok",
    category,
    due,
    basis,
    every,
    earlyFrom: basis === "first" ? null : addDays(due, -EARLY_DAYS),
    ageAtDue: ageInYears(reg, due),
    then,
    daysLeft: input.today ? daysBetween(input.today, due) : null,
    bandChange: basis === "first" || start === null ? null : bandChangeBetween(category, reg, start, due),
  };
}

/** The first stricter band that starts after `start` and before `due`, if any. */
export function bandChangeBetween(category: Category, firstRegistration: string, start: string, due: string): { on: string; years: number; every: Frequency } | null {
  for (const b of category.bands) {
    if (b.every === "exempt") continue;
    const on = addMonths(firstRegistration, b.fromYears * 12);
    if (on > start && on < due) return { on, years: b.fromYears, every: b.every };
  }
  return null;
}
