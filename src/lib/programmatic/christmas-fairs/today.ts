/**
 * "Is it on today? When is the next one?", for the browser. Pure: no data
 * imports, no clock unless one is passed in. The pages embed their fairs'
 * dates in the HTML and the client component calls `seasonStatus` with
 * Madrid's date, so the server output never depends on the day it rendered.
 */

/** One fair as the page embeds it for the browser. */
export interface DatedFair {
  /** Snapshot or organiser id. */
  id: string;
  /** First and last day, ISO. */
  s: string;
  e: string;
  /** Display name. */
  n: string;
  /** Town, as the page writes it. */
  t: string;
}

export type SeasonStatus =
  /** At least one fair is on today; `next` is the next one to open after today. */
  | { state: "open"; open: DatedFair[]; next: DatedFair | null; nextIn: number | null }
  /** None on today; `next` opens in `nextIn` days (1 = tomorrow). */
  | { state: "upcoming"; next: DatedFair; nextIn: number }
  /** Every fair on the page is over. */
  | { state: "over"; lastDay: string };

/** The words of the status box, per locale (`copy.ts`). Placeholders in braces. */
export interface StatusLabels {
  /** Before the clock is read, and without JavaScript. */
  fallback: string;
  /** "{n}" fair name, "{t}" town, "{until}" last day. */
  openOne: string;
  /** "{count}" fairs open today. */
  openMany: string;
  /** "{n}", "{t}", "{when}" ("dissabte 5 de desembre"), "{in}" ("d'aquí a 3 dies"). */
  upcoming: string;
  next: string;
  tomorrow: string;
  /** "{n}" days. */
  inDays: string;
  /** "{last}": the last day of the season's fairs on the page. */
  over: string;
  timezone: string;
}

/** "{name}" placeholders filled; unknown ones left as they are. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Today in Catalonia, as YYYY-MM-DD, whatever timezone the device is in. */
export function todayInMadrid(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

const byStart = (a: DatedFair, b: DatedFair) => a.s.localeCompare(b.s) || a.e.localeCompare(b.e) || a.n.localeCompare(b.n);

/** The state of a list of fairs on `today` (Madrid date). Null for an empty list. */
export function seasonStatus(today: string, fairs: readonly DatedFair[]): SeasonStatus | null {
  if (fairs.length === 0) return null;
  const sorted = [...fairs].sort(byStart);
  const open = sorted.filter((f) => f.s <= today && f.e >= today);
  const next = sorted.find((f) => f.s > today) ?? null;
  if (open.length > 0) return { state: "open", open, next, nextIn: next ? daysBetween(today, next.s) : null };
  if (next) return { state: "upcoming", next, nextIn: daysBetween(today, next.s) };
  return { state: "over", lastDay: sorted.reduce((last, f) => (f.e > last ? f.e : last), sorted[0]!.e) };
}
