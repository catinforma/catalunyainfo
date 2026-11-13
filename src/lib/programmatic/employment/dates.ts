/**
 * Calendar arithmetic on ISO dates ("2026-11-13"), in UTC so no time zone or
 * summer-time change can move a day. Client-safe.
 */

const DAY_MS = 86_400_000;

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  return fromUtc(toUtc(iso) + n * DAY_MS);
}

/** Days from `a` to `b` (b − a); 0 when equal. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

/** Calendar days from `from` to `to`, both counted (1 when equal; 0 when `to` is before `from`). */
export function inclusiveDays(from: string, to: string): number {
  return Math.max(0, daysBetween(from, to) + 1);
}

function daysInMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

/** `iso` plus `n` months, the day clamped to the month's last (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const total = y * 12 + (m - 1) + n;
  const year = Math.floor(total / 12);
  const month0 = total - year * 12;
  const day = Math.min(d, daysInMonth(year, month0));
  return fromUtc(Date.UTC(year, month0, day));
}

/**
 * Months of service from `from` to `to` (both days worked), with any part of a
 * month counted as a whole month: the ET says «prorrateándose por meses los
 * periodos de tiempo inferiores a un año», and the courts read it that way
 * (a fraction of a month counts as a month). Always counted from `from`, so
 * 31 Jan → 28 Feb is one month exactly.
 */
export function serviceMonths(from: string, to: string): { months: number; whole: number; extraDays: number } {
  if (to < from) return { months: 0, whole: 0, extraDays: 0 };
  const endExclusive = addDays(to, 1);
  let whole = 0;
  // Years first, then months: at most ~12 + 50 steps for any career.
  while (addMonths(from, whole + 12) <= endExclusive) whole += 12;
  while (addMonths(from, whole + 1) <= endExclusive) whole += 1;
  const extraDays = daysBetween(addMonths(from, whole), endExclusive);
  return { months: whole + (extraDays > 0 ? 1 : 0), whole, extraDays };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function yearDays(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function maxIso(a: string, b: string): string {
  return a > b ? a : b;
}

export function lastDayOfMonth(iso: string): boolean {
  return addDays(iso, 1).slice(8) === "01";
}

/** Rounded to cents, half away from zero, without the 1.005 float trap. */
export function cents(x: number): number {
  // toPrecision(12) first: 1.005 * 100 is 100.49999999999999 in binary.
  return (Math.sign(x) * Math.round(Number((Math.abs(x) * 100).toPrecision(12)))) / 100;
}

/** Rounded to two decimals (days of salary). */
export function round2(x: number): number {
  return cents(x);
}
