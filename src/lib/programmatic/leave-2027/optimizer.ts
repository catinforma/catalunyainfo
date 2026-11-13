/**
 * "Com aprofitar les vacances": which working days to book so that a number
 * of days of leave gives the most days off in a row, from a list of holidays.
 *
 * Pure and small enough for the browser (the planner recomputes on every
 * change); no data of its own: the page hands it the holidays the site states
 * as confirmed for the place picked (`places.ts`).
 *
 * The model, the same one the long weekends guide uses (`holidays/bridges.ts`):
 *
 *  - a day is off when it is a weekend day (Saturday and Sunday, or Sunday
 *    only for someone who also works Saturdays) or one of the holidays;
 *  - leave is booked only on working days of the year asked for, never on a
 *    holiday or a weekend day;
 *  - a break is an unbroken run of days off that contains at least one day of
 *    leave; before 1 January and after 31 December only weekend days count as
 *    off (the next year's holidays are not in the data);
 *  - the plan (`planLeave`) is the set of breaks, none overlapping, each
 *    built around at least one holiday that falls on a working day (a
 *    holiday on a Saturday gives nothing to a Monday-to-Friday week, so it
 *    cannot anchor a break; it does for someone who works Saturdays), whose
 *    leave fits in the budget and
 *    whose days add up to the most. The holiday rule is what makes it a plan
 *    for bridges: without it, any Friday next to a weekend (three days for
 *    one) would beat a week's holiday, and 20 days of leave would come back
 *    as 20 long weekends. Extra leave stretches the holiday breaks instead
 *    (Easter, Christmas, the December bridge);
 *  - two breaks of a plan are at least `MIN_GAP` working days apart: going
 *    back to work for a single Tuesday between two breaks is more days off on
 *    paper and a plan nobody follows, so the planner joins such breaks or
 *    picks one. Ties go to the plan that books
 *    less leave, then to the one with the longest single break, then to the
 *    one whose leave falls earlier in the year (the smaller sum of the booked
 *    days' positions), so the same input always gives the same plan.
 *
 * `longestBreak` answers the other question, the single longest run the leave
 * can buy anywhere in the year, holiday or not.
 *
 * Every break is the run around a block of consecutive working days all
 * taken as leave (days off in between do not break the block), so the
 * candidates are every such block of at most `leave` working days; a weighted
 * interval choice under a budget (dynamic programming over the candidates
 * sorted by end date) picks the best set. About 250 working days × 25 days of
 * leave: a few thousand candidates, well under 50 ms in a phone browser.
 */

export interface LeaveInput {
  year: number;
  /** Holidays, YYYY-MM-DD. Dates outside `year` are ignored. */
  holidays: readonly string[];
  /** Days of leave to book (whole days, 0 or more). */
  leave: number;
  /** True for someone who works Saturdays: only Sunday is a weekend day. */
  workSaturdays?: boolean;
}

export interface Break {
  /** First and last day off of the run, YYYY-MM-DD (may reach into the next year through a weekend). */
  from: string;
  to: string;
  /** Days off in a row, leave included. */
  days: number;
  /** The days of leave to book, in date order. */
  take: string[];
  /** The holidays inside the run that fall on a working day (the ones that add a day off), in date order. */
  holidays: string[];
  /** `days / take.length`: days off per day of leave. */
  ratio: number;
}

export interface LeavePlan {
  leave: number;
  /** Days of leave the plan books (less than `leave` only when no break around a holiday can take more). */
  used: number;
  /** Days off in all the breaks together. */
  daysOff: number;
  /** `daysOff / used`, 0 when nothing is booked. */
  ratio: number;
  /** The breaks, ranked: best ratio first, then the longer, then the earlier. */
  breaks: Break[];
  /** The same breaks in date order. */
  byDate: Break[];
}

export const MAX_LEAVE = 25;

/** The fewest working days between two breaks of a plan. */
export const MIN_GAP = 3;

function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function isWeekendDay(iso: string, workSaturdays = false): boolean {
  const w = weekday(iso);
  return w === 0 || (!workSaturdays && w === 6);
}

/** The calendar a plan is computed on: which days are off, which can be booked. */
export interface LeaveCalendar {
  year: number;
  workSaturdays: boolean;
  holidays: ReadonlySet<string>;
  /** The holidays that fall on a working day, in date order: the ones that add a day off. */
  effective: string[];
  /** Every day of the year that can be booked as leave, in date order. */
  working: string[];
  /** Per working day: the first and last day (day numbers) of the run of days off around it, booked alone. */
  back: Int32Array;
  forward: Int32Array;
  /** Per working day: its day number (days since 1 January 1970, UTC). */
  workingNum: Int32Array;
  /** Holidays on a working day up to and including each day of the year, by day offset from 1 January. */
  effectiveUpTo: Int32Array;
  /** Day number of 1 January. */
  day0: number;
}

const DAY = 86_400_000;
const dayNum = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);

export function leaveCalendar(year: number, holidays: readonly string[], workSaturdays = false): LeaveCalendar {
  const prefix = `${year}-`;
  const set = new Set(holidays.filter((d) => d.startsWith(prefix)));
  const day0 = dayNum(`${year}-01-01`);
  const length = dayNum(`${year + 1}-01-01`) - day0;
  // Off flags with a margin either side: beyond the year only weekend days are off.
  const MARGIN = 14;
  const off = new Uint8Array(length + 2 * MARGIN);
  const effectiveUpTo = new Int32Array(length);
  const working: string[] = [];
  const workingNum: number[] = [];
  const effective: string[] = [];
  let count = 0;
  for (let i = -MARGIN; i < length + MARGIN; i++) {
    const n = day0 + i;
    // 1 January 1970 was a Thursday.
    const w = (((n + 4) % 7) + 7) % 7;
    const weekend = w === 0 || (!workSaturdays && w === 6);
    const inYear = i >= 0 && i < length;
    const iso = inYear ? isoOf(n) : "";
    const holiday = inYear && set.has(iso);
    off[i + MARGIN] = weekend || holiday ? 1 : 0;
    if (!inYear) continue;
    if (holiday && !weekend) {
      count += 1;
      effective.push(iso);
    }
    effectiveUpTo[i] = count;
    if (!weekend && !holiday) {
      working.push(iso);
      workingNum.push(n);
    }
  }
  const isOff = (n: number) => off[n - day0 + MARGIN] === 1;
  const back = new Int32Array(working.length);
  const forward = new Int32Array(working.length);
  workingNum.forEach((n, i) => {
    let from = n;
    while (isOff(from - 1)) from -= 1;
    let to = n;
    while (isOff(to + 1)) to += 1;
    back[i] = from;
    forward[i] = to;
  });
  return { year, workSaturdays, holidays: set, effective, working, back, forward, workingNum: Int32Array.from(workingNum), effectiveUpTo, day0 };
}

/** Off without booking anything: a weekend day, or a holiday of the year. */
export function isOffDay(cal: LeaveCalendar, iso: string): boolean {
  return isWeekendDay(iso, cal.workSaturdays) || cal.holidays.has(iso);
}

interface Candidate {
  /** First and last day off of the run, as day numbers. */
  from: number;
  to: number;
  days: number;
  /** Index of the first and last booked working day in `cal.working`. */
  first: number;
  last: number;
  cost: number;
}

/**
 * Every block of 1 to `maxCost` consecutive working days, booked whole, and
 * the run of days off it makes; with `anchored`, only the runs that contain a
 * holiday on a working day.
 */
function candidates(cal: LeaveCalendar, maxCost: number, anchored: boolean): Candidate[] {
  const n = cal.working.length;
  const out: Candidate[] = [];
  const last = cal.effectiveUpTo.length - 1;
  // Holidays on a working day between two day numbers (clamped to the year).
  const holidaysIn = (from: number, to: number) => {
    const a = Math.max(0, from - cal.day0);
    const b = Math.min(last, to - cal.day0);
    if (b < a) return 0;
    return cal.effectiveUpTo[b]! - (a > 0 ? cal.effectiveUpTo[a - 1]! : 0);
  };
  for (let i = 0; i < n; i++) {
    const from = cal.back[i]!;
    for (let j = i; j < n && j - i < maxCost; j++) {
      const to = cal.forward[j]!;
      if (anchored && holidaysIn(from, to) === 0) continue;
      out.push({ from, to, days: to - from + 1, first: i, last: j, cost: j - i + 1 });
    }
  }
  return out;
}

function toBreak(cal: LeaveCalendar, c: Candidate): Break {
  const from = isoOf(c.from);
  const to = isoOf(c.to);
  const take = cal.working.slice(c.first, c.last + 1);
  const holidays = cal.effective.filter((d) => d >= from && d <= to);
  return { from, to, days: c.days, take, holidays, ratio: c.days / take.length };
}

/** Best ratio first, then the longer break, then the earlier one. */
export function rankBreaks(a: Break, b: Break): number {
  return b.ratio - a.ratio || b.days - a.days || a.from.localeCompare(b.from);
}

/**
 * The plan for `leave` days: the breaks around holidays that give the most
 * days off in all, with the tie-breaks above. `leave` is clamped to 0…MAX_LEAVE whole days.
 */
export function planLeave(input: LeaveInput): LeavePlan {
  const leave = Math.max(0, Math.min(MAX_LEAVE, Math.floor(input.leave)));
  const cal = leaveCalendar(input.year, input.holidays, input.workSaturdays ?? false);
  return planOn(cal, leave);
}

export function planOn(cal: LeaveCalendar, leave: number): LeavePlan {
  if (leave <= 0 || cal.working.length === 0) return { leave: Math.max(0, leave), used: 0, daysOff: 0, ratio: 0, breaks: [], byDate: [] };
  const cands = candidates(cal, leave, true).sort((a, b) => a.to - b.to || a.from - b.from || a.first - b.first);
  const ends = Int32Array.from(cands, (c) => c.to);
  // prior[k]: how many candidates end before the MIN_GAP working days ahead of candidate k
  // (those are the breaks it can follow); none when the year has fewer working days before it.
  const prior = cands.map((c) => {
    if (c.first - MIN_GAP < 0) return 0;
    const limit = cal.workingNum[c.first - MIN_GAP]!;
    let lo = 0;
    let hi = ends.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ends[mid]! < limit) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  });
  // Cell (k, b): the best plan among the first k candidates with at most b days of leave.
  // Typed arrays keep it to a few MB in a phone browser; `took` lets the plan be read back.
  const width = leave + 1;
  const size = (cands.length + 1) * width;
  const value = new Int32Array(size);
  const used = new Int32Array(size);
  const longest = new Int32Array(size);
  /** Sum of the booked days' positions in the year: the smaller, the earlier the leave. */
  const pos = new Int32Array(size);
  const took = new Uint8Array(size);
  for (let k = 1; k <= cands.length; k++) {
    const c = cands[k - 1]!;
    const cPos = ((c.first + c.last) * c.cost) / 2;
    for (let b = 0; b < width; b++) {
      const here = k * width + b;
      const skip = (k - 1) * width + b;
      value[here] = value[skip]!;
      used[here] = used[skip]!;
      longest[here] = longest[skip]!;
      pos[here] = pos[skip]!;
      if (c.cost > b) continue;
      const base = prior[k - 1]! * width + (b - c.cost);
      const v = value[base]! + c.days;
      const u = used[base]! + c.cost;
      const l = Math.max(longest[base]!, c.days);
      const p = pos[base]! + cPos;
      // More days off, then less leave, then a longer longest break, then earlier leave.
      const wins = v !== value[here] ? v > value[here]! : u !== used[here] ? u < used[here]! : l !== longest[here] ? l > longest[here]! : p < pos[here]!;
      if (wins) {
        value[here] = v;
        used[here] = u;
        longest[here] = l;
        pos[here] = p;
        took[here] = 1;
      }
    }
  }
  const byDate: Break[] = [];
  let k = cands.length;
  let b = leave;
  while (k > 0) {
    if (took[k * width + b]) {
      const c = cands[k - 1]!;
      byDate.unshift(toBreak(cal, c));
      b -= c.cost;
      k = prior[k - 1]!;
    } else k -= 1;
  }
  const total = value[cands.length * width + leave]!;
  const spent = used[cands.length * width + leave]!;
  return { leave, used: spent, daysOff: total, ratio: spent ? total / spent : 0, breaks: [...byDate].sort(rankBreaks), byDate };
}

/**
 * The single longest break `leave` days can buy: the most days in a row, then
 * the least leave, then the earliest. Null with no leave to book.
 */
export function longestBreak(input: LeaveInput): Break | null {
  const leave = Math.max(0, Math.min(MAX_LEAVE, Math.floor(input.leave)));
  const cal = leaveCalendar(input.year, input.holidays, input.workSaturdays ?? false);
  if (leave === 0 || cal.working.length === 0) return null;
  let best: Candidate | null = null;
  for (const c of candidates(cal, leave, false)) {
    if (!best || c.days > best.days || (c.days === best.days && (c.cost < best.cost || (c.cost === best.cost && c.from < best.from)))) best = c;
  }
  return best ? toBreak(cal, best) : null;
}

/** Shorthand used by the page and the tests: plan and longest break for one input. */
export function leaveAdvice(input: LeaveInput): { plan: LeavePlan; longest: Break | null } {
  return { plan: planLeave(input), longest: longestBreak(input) };
}
