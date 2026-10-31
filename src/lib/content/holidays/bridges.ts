import { addDays, daysBetween, weekdayIndex } from "./calendar";
import { BRIDGES, type Bridge } from "./payload";

/**
 * Bridges computed from a list of days off, instead of typed by hand.
 *
 * `payload.ts` keeps the guide's own bridges (`BRIDGES`) with their lengths
 * stated, so a test can hold the two against each other: every bridge the
 * guide prints must be one this file finds. The 2027 bridges page renders
 * from here alone, for the Catalonia-wide days, for Aran and for any town's
 * two local days, with one rule for all of them:
 *
 *  - a holiday on a Monday or a Friday makes a long weekend with no leave;
 *  - on a Tuesday or a Thursday it makes a bridge with one day of leave (the
 *    Monday before, the Friday after);
 *  - on a Wednesday it takes two (Monday and Tuesday, or Thursday and Friday);
 *  - on a Saturday or a Sunday it adds no day off to a Monday-to-Friday week.
 *
 * Leave that is already a day off (another holiday) is not counted, which is
 * why 8 December 2027, a Wednesday, needs only Tuesday the 7th: Monday the
 * 6th is a holiday too. Everything assumes a Monday-to-Friday week; shifts and
 * collective agreements are outside it, and the pages say so.
 *
 * No clock: the same days in give the same bridges out, on any date.
 */

export type DayKind = "long-weekend" | "bridge" | "midweek" | "weekend";

/** The shape `Bridge` already uses: leave to book, first and last day off, length. */
export type Span = Pick<Bridge, "take" | "from" | "to" | "days">;

export interface Plan extends Span {
  /** The holiday the plan is built around. */
  date: string;
  kind: DayKind;
}

export function dayKind(iso: string): DayKind {
  switch (weekdayIndex(iso)) {
    case 1:
    case 5:
      return "long-weekend";
    case 2:
    case 4:
      return "bridge";
    case 3:
      return "midweek";
    default:
      return "weekend";
  }
}

/** Off for a Monday-to-Friday worker: a weekend, or one of `off`. */
export function isOff(iso: string, off: ReadonlySet<string>): boolean {
  const weekday = weekdayIndex(iso);
  return weekday === 0 || weekday === 6 || off.has(iso);
}

/** The unbroken run of days off around `anchor`, which must itself be off. */
export function runAround(anchor: string, off: ReadonlySet<string>): Omit<Span, "take"> {
  if (!isOff(anchor, off)) throw new Error(`bridges: ${anchor} is not a day off`);
  let from = anchor;
  while (isOff(addDays(from, -1), off)) from = addDays(from, -1);
  let to = anchor;
  while (isOff(addDays(to, 1), off)) to = addDays(to, 1);
  return { from, to, days: daysBetween(from, to) + 1 };
}

/** The leave each rule asks for, before days that are already off are removed. */
function candidates(iso: string): string[][] {
  switch (weekdayIndex(iso)) {
    case 1:
    case 5:
      return [[]];
    case 2:
      return [[addDays(iso, -1)]];
    case 4:
      return [[addDays(iso, 1)]];
    case 3:
      return [
        [addDays(iso, -2), addDays(iso, -1)],
        [addDays(iso, 1), addDays(iso, 2)],
      ];
    default:
      return [];
  }
}

/**
 * The plan for one holiday: the fewest days of leave, then the longest run,
 * then the earlier run. Null for a holiday on a weekend.
 */
export function planFor(iso: string, off: ReadonlySet<string>): Plan | null {
  const kind = dayKind(iso);
  const all = new Set([...off, iso]);
  const options = candidates(iso).map((leave) => {
    const take = leave.filter((day) => !isOff(day, all));
    return { date: iso, kind, take, ...runAround(iso, new Set([...all, ...take])) };
  });
  options.sort((a, b) => a.take.length - b.take.length || b.days - a.days || a.from.localeCompare(b.from));
  return options[0] ?? null;
}

export interface DayPlan {
  date: string;
  kind: DayKind;
  /** Null when the day falls on a weekend. */
  plan: Plan | null;
}

/**
 * One plan per day of `days`, in date order. `extra` are further days off
 * that are not planned around but count as off (a town's local days are
 * planned with the Catalonia-wide ones as `extra`).
 */
export function plansFor(days: readonly string[], extra: readonly string[] = []): DayPlan[] {
  const off = new Set([...days, ...extra]);
  return [...days].sort().map((date) => ({ date, kind: dayKind(date), plan: planFor(date, off) }));
}

const key = (span: Span) => `${span.from}|${span.to}|${span.take.join(",")}`;

/** The different runs among some plans (Good Friday and Easter Monday share one), in date order. */
export function distinctRuns(plans: readonly (Plan | null)[]): Plan[] {
  const seen = new Map<string, Plan>();
  for (const plan of plans) if (plan && !seen.has(key(plan))) seen.set(key(plan), plan);
  return [...seen.values()].sort((a, b) => a.from.localeCompare(b.from));
}

export interface BestUse {
  leave: number;
  /** The longest run of days off this much leave buys. */
  days: number;
  /** Every run of that length, in date order. */
  runs: Span[];
}

/**
 * The longest run of days off that `leave` days of leave can buy in `year`,
 * and every way to get it. Leave is only booked inside the year; a run may
 * still reach into the next one through a weekend.
 */
export function bestUse(off: ReadonlySet<string>, leave: number, year: number): BestUse {
  const days: string[] = [];
  for (let iso = `${year}-01-01`; iso.startsWith(String(year)); iso = addDays(iso, 1)) days.push(iso);
  const found = new Map<string, Span>();
  for (let i = 0; i < days.length; i++) {
    const take: string[] = [];
    for (let j = i; j < days.length; j++) {
      const iso = days[j]!;
      if (isOff(iso, off)) continue;
      if (take.length === leave) break;
      take.push(iso);
    }
    // With no leave left for it, a working day cannot start a run.
    if (!isOff(days[i]!, off) && !take.includes(days[i]!)) continue;
    const run = runAround(days[i]!, new Set([...off, ...take]));
    // Only leave inside the run counts (the window can end on a weekday it never reached).
    const used = take.filter((iso) => iso >= run.from && iso <= run.to);
    const span = { take: used, ...run };
    found.set(key(span), span);
  }
  const best = Math.max(...[...found.values()].map((span) => span.days));
  const runs = [...found.values()]
    .filter((span) => span.days === best)
    // A run that needs less leave is listed under that smaller budget, not here.
    .filter((span, _, all) => span.take.length === Math.min(...all.map((s) => s.take.length)))
    .sort((a, b) => a.from.localeCompare(b.from));
  return { leave, days: best, runs };
}

/** How many different long weekends and bridges some holidays make (the count the 2027 page leads with). */
export function bridgeCount(days: readonly string[]): number {
  return distinctRuns(plansFor(days).map((p) => p.plan)).length;
}

/** The guide's hand-written bridge with exactly these dates, if there is one (for its label). */
export function guideBridge(span: Span): Bridge | null {
  return BRIDGES.find((b) => b.from === span.from && b.to === span.to && b.take.join() === span.take.join()) ?? null;
}
