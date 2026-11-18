/**
 * This weekend's activities as the weekend pages print them, server side,
 * from two official open-data agendas:
 *
 *   - `gencat`: the Generalitat's Agenda Cultural de Catalunya (Socrata
 *     `rhpv-yr4f`, Departament de Cultura), the whole of Catalonia;
 *   - `bcn`: the Ajuntament de Barcelona's city agenda (Open Data BCN dataset
 *     `agenda-diaria`, resource "agenda ampliada"), the city of Barcelona.
 *
 * Pure: no network, no clock unless one is passed in, no JSON imports. The
 * reads live in `agenda-upstream.ts`, the cache in `agenda-server.ts`.
 *
 * What an item carries is what the source published, cut to length and never
 * rewritten: the title, the venue, the dates, the times and the price text
 * (truncated with "…" when long), whether entry is free, and the official
 * page of the activity (the Generalitat's or the Ajuntament's). No
 * description is reproduced, no image is used (Open Data BCN's terms exclude
 * graphic content), and nothing is translated: the names are proper names and
 * the times are the organiser's own words, mostly in Catalan.
 *
 * Grouping is mechanical too: by day (an activity on one day of the weekend
 * goes under that day; one on two or more days, or whose sessions the source
 * does not list, goes under "all weekend or several days"), then by type in
 * a fixed order. Each group is capped and links to the official agenda for
 * the rest, so the page stays light.
 */

/* -------------------------------------------------------------------------- */
/* Shapes                                                                     */
/* -------------------------------------------------------------------------- */

export type AgendaSourceId = "gencat" | "bcn";

/** The types the pages group by, in the order they print them. */
export type ItemType = "fairs" | "family" | "music" | "exhibitions" | "stage" | "other";
export const ITEM_TYPES: readonly ItemType[] = ["fairs", "family", "music", "exhibitions", "stage", "other"];

export interface AgendaItem {
  /** "bcn:99400017122", "gencat:20260629006". */
  id: string;
  source: AgendaSourceId;
  /** As published, truncated. */
  title: string;
  /** Venue as published ("" when none), truncated. */
  venue: string;
  /** Further venues the source lists for the same activity. */
  moreVenues: number;
  /** Municipality, official name ("" when the row names only a comarca or province). */
  town: string;
  /** Barcelona district as the Ajuntament writes it, or "". */
  district: string;
  ine: string;
  comarca: string;
  province: string;
  /** First and last day, ISO. */
  start: string;
  end: string;
  /**
   * The days inside the window the activity is on, when the source lists its
   * sessions (Open Data BCN's timetable); null when only its date range is known.
   */
  days: string[] | null;
  /** Times as published: per day when they differ ("dv.: a les 22.30 h · dg.: a les 20.00 h"), else one line. */
  time: string | null;
  /** Price text as published, truncated; null when the source gives none. */
  price: string | null;
  free: boolean;
  type: ItemType;
  /** In the Ajuntament's own "Barcelona Cultura - Recomanem" selection. */
  recommended: boolean;
  /** Starts inside the window (rather than continuing from before it). */
  startsThisWeekend: boolean;
  /** The activity's page in the official agenda. */
  url: string;
}

/** One source's read for one weekend. */
export interface SourceRead {
  source: AgendaSourceId;
  window: { from: string; to: string };
  /** When we read it (ISO instant). */
  fetchedAt: string;
  /** The publisher's last update (ISO instant or date), when the answer says. */
  updated: string | null;
  items: AgendaItem[];
}

/* -------------------------------------------------------------------------- */
/* Small text helpers                                                         */
/* -------------------------------------------------------------------------- */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", euro: "€", middot: "·" };

/** HTML (or plain text) to one line of plain text. */
export function plainText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|td|tr)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1] === "x" || code[1] === "X" ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1));
        return Number.isFinite(n) && n > 0 ? String.fromCodePoint(n) : " ";
      }
      return ENTITIES[code.toLowerCase()] ?? match;
    })
    .replace(/[​﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cut at a word boundary and mark the cut; the text itself is never changed. */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:·(–-]+$/, "")}…`;
}

export const TITLE_MAX = 140;
export const VENUE_MAX = 80;
export const TIME_MAX = 110;
export const PRICE_MAX = 90;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/l·l/g, "ll")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 Sunday … 6 Saturday. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** Every day of the window, in order. */
export function windowDays(window: { from: string; to: string }): string[] {
  const out: string[] = [];
  for (let d = window.from; d <= window.to && out.length < 7; d = addDaysIso(d, 1)) out.push(d);
  return out;
}

/** Window days inside [start, end]. */
export function rangeDays(item: { start: string; end: string }, window: { from: string; to: string }): string[] {
  return windowDays(window).filter((d) => d >= item.start && d <= item.end);
}

/* -------------------------------------------------------------------------- */
/* Open Data BCN timetables                                                   */
/* -------------------------------------------------------------------------- */

const CA_WEEKDAYS: Record<string, number> = {
  diumenge: 0,
  diumenges: 0,
  dilluns: 1,
  dimarts: 2,
  dimecres: 3,
  dijous: 4,
  divendres: 5,
  dissabte: 6,
  dissabtes: 6,
};
const CA_MONTHS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];
const MONTH_RE = CA_MONTHS.join("|");
/** End of a month name: "març" ends in a letter a regex \b does not count as one. */
const END = "(?![a-zçàèéíïòóúü])";
const WEEKDAY_RE = Object.keys(CA_WEEKDAYS).sort((a, b) => b.length - a.length).join("|");

/** The year that puts day/month nearest the window. */
function isoNear(day: number, month: number, reference: string): string | null {
  if (!(day >= 1 && day <= 31 && month >= 1 && month <= 12)) return null;
  const year = Number(reference.slice(0, 4));
  const candidates = [year - 1, year, year + 1].map((y) => `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  const ref = Date.parse(`${reference}T12:00:00Z`);
  return candidates.sort((a, b) => Math.abs(Date.parse(`${a}T12:00:00Z`) - ref) - Math.abs(Date.parse(`${b}T12:00:00Z`) - ref))[0] ?? null;
}

interface DaySpec {
  weekdays: Set<number>;
  dates: Set<string>;
  all: boolean;
}

function readSpec(text: string, reference: string): DaySpec | null {
  const spec: DaySpec = { weekdays: new Set(), dates: new Set(), all: false };
  let found = false;
  if (/\b(cada dia|tots els dies|diàriament|diariament)\b/.test(text)) {
    spec.all = true;
    found = true;
  }
  // "del 20 al 22 de novembre"
  for (const m of text.matchAll(new RegExp(`\\bdel? (\\d{1,2}) (?:de |d')?(?:(${MONTH_RE}) )?al (\\d{1,2}) (?:de |d')?(${MONTH_RE})${END}`, "g"))) {
    const endMonth = CA_MONTHS.indexOf(m[4]!) + 1;
    const startMonth = m[2] ? CA_MONTHS.indexOf(m[2]) + 1 : endMonth;
    const from = isoNear(Number(m[1]), startMonth, reference);
    const to = isoNear(Number(m[3]), endMonth, reference);
    if (from && to && from <= to) {
      for (let d = from, i = 0; d <= to && i < 62; d = addDaysIso(d, 1), i++) spec.dates.add(d);
      found = true;
    }
  }
  // "20 novembre", "8 de desembre", "1 d'octubre"
  for (const m of text.matchAll(new RegExp(`\\b(\\d{1,2}) (?:de |d')?(${MONTH_RE})${END}`, "g"))) {
    const iso = isoNear(Number(m[1]), CA_MONTHS.indexOf(m[2]!) + 1, reference);
    if (iso) {
      spec.dates.add(iso);
      found = true;
    }
  }
  // "20/11", "20/11/2026"
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g)) {
    const iso = m[3] ? `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}` : isoNear(Number(m[1]), Number(m[2]), reference);
    if (iso && ISO_DAY.test(iso)) {
      spec.dates.add(iso);
      found = true;
    }
  }
  // "de dilluns a divendres"
  let rest = text;
  for (const m of text.matchAll(new RegExp(`\\bde (${WEEKDAY_RE}) a (${WEEKDAY_RE})\\b`, "g"))) {
    const a = CA_WEEKDAYS[m[1]!]!;
    const b = CA_WEEKDAYS[m[2]!]!;
    for (let d = a, i = 0; i < 7; d = (d + 1) % 7, i++) {
      spec.weekdays.add(d);
      if (d === b) break;
    }
    rest = rest.replace(m[0], " ");
    found = true;
  }
  for (const m of rest.matchAll(new RegExp(`\\b(${WEEKDAY_RE})\\b`, "g"))) {
    spec.weekdays.add(CA_WEEKDAYS[m[1]!]!);
    found = true;
  }
  return found ? spec : null;
}

/**
 * The window days one timetable row ("Dies" cell) names, or null when the
 * cell is not something a rule can read ("Consulteu dates al web"). Catalan,
 * as the Ajuntament writes it: weekdays ("Dissabte i diumenge", "De dilluns
 * a divendres", "dissabtes"), dates ("20 novembre", "7 novembre i 28
 * novembre", "del 20 al 22 de novembre"), "Cada dia", and exceptions after
 * "excepte" or "tancat" ("Diumenge excepte 15 novembre", "TANCAT: dilluns").
 */
export function daysFromCell(cell: string, days: readonly string[]): string[] | null {
  const text = plainText(cell).toLowerCase().replace(/’/g, "'");
  if (!text || days.length === 0) return null;
  const cut = text.search(/\b(excepte|tancat|llevat)\b/);
  const positive = cut >= 0 ? text.slice(0, cut) : text;
  const negative = cut >= 0 ? text.slice(cut) : "";
  const spec = readSpec(positive, days[0]!);
  if (!spec) return null;
  const minus = negative ? readSpec(negative, days[0]!) : null;
  return days.filter((d) => {
    const on = spec.all || spec.weekdays.has(weekday(d)) || spec.dates.has(d);
    const off = minus ? minus.dates.has(d) || minus.weekdays.has(weekday(d)) : false;
    return on && !off;
  });
}

export interface TimetableRow {
  days: string;
  hours: string;
}

/** The rows of an Open Data BCN timetable (`<table class="timetable-table">`), and its price cells. */
export function readTimetable(html: string | null | undefined): { rows: TimetableRow[]; price: string | null } {
  const source = html ?? "";
  const rows: TimetableRow[] = [];
  const prices: string[] = [];
  let lastHours = "";
  for (const tr of source.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []) {
    if (/timetable-header/.test(tr)) continue;
    const cell = (cls: string) => {
      const m = new RegExp(`<td[^>]*class="${cls}"[^>]*>([\\s\\S]*?)</td>`, "i").exec(tr);
      return m ? plainText(m[1]) : null;
    };
    const days = cell("timetable-day");
    const hours = cell("timetable-hour");
    const price = cell("timetable-price");
    if (price && !prices.includes(price)) prices.push(price);
    if (hours !== null) lastHours = hours;
    if (days !== null) rows.push({ days, hours: hours ?? lastHours });
  }
  return { rows, price: prices.length > 0 ? prices.join(" / ") : null };
}

const ABBR: Record<"ca" | "es" | "en", string[]> = {
  ca: ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."],
  es: ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export function weekdayAbbr(iso: string, locale: "ca" | "es" | "en"): string {
  return ABBR[locale][weekday(iso)] ?? "";
}

/**
 * Which window days a timetable puts the activity on, and the published
 * hours of each. `days` null: no row could be read, so only the date range is
 * known. An empty `days` list: every row was read and none falls on the
 * weekend (the activity is on, say, 7 and 28 November only).
 */
export function sessions(html: string | null | undefined, window: { from: string; to: string }, range: { start: string; end: string }): {
  days: string[] | null;
  hours: Map<string, string>;
  price: string | null;
} {
  const inRange = rangeDays(range, window);
  const { rows, price } = readTimetable(html);
  const hours = new Map<string, string>();
  if (rows.length === 0) return { days: null, hours, price };
  const on = new Set<string>();
  let unread = 0;
  for (const row of rows) {
    const days = daysFromCell(row.days, inRange);
    if (days === null) {
      unread++;
      continue;
    }
    for (const d of days) {
      on.add(d);
      if (row.hours && !hours.has(d)) hours.set(d, row.hours);
    }
  }
  if (unread === rows.length) {
    const only = rows.length === 1 && rows[0]!.hours ? rows[0]!.hours : "";
    if (only) for (const d of inRange) hours.set(d, only);
    return { days: null, hours, price };
  }
  // A row we could not read may hold the weekend's sessions: fall back to the range.
  if (on.size === 0 && unread > 0) return { days: null, hours, price };
  return { days: inRange.filter((d) => on.has(d)), hours, price };
}

/**
 * One line of times: the hour text alone when every day has the same one,
 * else per day ("dv.: a les 22.30 h · dg.: a les 20.00 h"). Hour texts are
 * the Ajuntament's own; only the day prefixes are ours.
 */
export function timeLine(days: readonly string[], hours: ReadonlyMap<string, string>, locale: "ca" | "es" | "en" = "ca"): string | null {
  const groups: { text: string; days: string[] }[] = [];
  for (const d of days) {
    const text = hours.get(d);
    if (!text) continue;
    const group = groups.find((g) => g.text === text);
    if (group) group.days.push(d);
    else groups.push({ text, days: [d] });
  }
  if (groups.length === 0) return null;
  if (groups.length === 1) return truncate(groups[0]!.text, TIME_MAX);
  return truncate(groups.map((g) => `${g.days.map((d) => weekdayAbbr(d, locale)).join(" ")}: ${g.text}`).join(" · "), TIME_MAX);
}

/* -------------------------------------------------------------------------- */
/* Types and free entry                                                       */
/* -------------------------------------------------------------------------- */

const FAIR_WORDS = /\b(fira|fires|mercat|mercats|mercadet|market|saló|salo|rastrillo|rastrell|encants|brocanters|paradeta|paradetes)\b/i;

/** Open Data BCN categories (`secondary_filters_fullpath`, joined by "|") and the title to one type. */
export function bcnType(paths: string, title: string): ItemType {
  const p = paths.toLowerCase();
  if (/petits mercats ocasionals|fires d'atraccions/.test(p) || (/fires|mercats|salons/.test(p) && FAIR_WORDS.test(title)) || /^(fira|mercat|mercadet)\b/i.test(title.trim())) return "fairs";
  if (/nens i nenes|en família|activitats culturals per infants|activitats familiars/.test(p)) return "family";
  if (/>> música|>> concerts/.test(p)) return "music";
  if (/>> exposicions/.test(p)) return "exhibitions";
  if (/teatre|dansa|>> circ/.test(p)) return "stage";
  return "other";
}

/** Not a weekend plan: courses and workshops sold by term, and the Ajuntament's traffic notices. */
export function bcnExcluded(paths: string, title: string, type: ItemType): boolean {
  if (/^\s*(alteracions|afectacions|talls) de (trànsit|transit|la mobilitat)/i.test(title)) return true;
  const p = paths.toLowerCase();
  return type !== "family" && type !== "fairs" && /cursos i tallers/.test(p) && !/>> (música|concerts|teatre|exposicions|dansa)/.test(p);
}

/**
 * The Ajuntament's price cell says entry is free ("Entrada Gratuïta",
 * "Gratuït") and names no amount: "Entrada Gratuïta / Entrada general: 24 €"
 * (some sessions paid) is not marked free; its text is shown as published.
 */
export function freeFromPrice(price: string | null): boolean {
  return Boolean(price && /^\s*(entrada\s+)?gratu[iï]t[a]?\b/i.test(price) && !/\d\s*€|€\s*\d/.test(price));
}

/**
 * The window days a free-text schedule names (the Generalitat's `horari`:
 * "De dimarts a dissabtes: de 10 a 13.30 h", "Els dijous de novembre: 19 h"),
 * read with the same rules as an Open Data BCN "Dies" cell. Null when it names
 * no day, or when it names days by their place in the month ("el primer
 * diumenge de cada mes"), which those rules cannot place.
 */
export function daysFromSchedule(text: string | null | undefined, days: readonly string[]): string[] | null {
  const clean = plainText(text).toLowerCase();
  if (!clean || /\b(primer|primers|segon|tercer|quart|últim|darrer)s? (dilluns|dimarts|dimecres|dijous|divendres|dissabte|diumenge)|\bcada mes\b|\bmensual|\balterns?\b/.test(clean)) return null;
  return daysFromCell(clean, days);
}

/** The Generalitat agenda's own categories (`content/weekend/agenda.ts`) to the page's types. */
export function gencatType(category: string): ItemType {
  switch (category) {
    case "fairs":
    case "family":
    case "music":
    case "exhibitions":
      return category;
    case "theatre":
    case "dance":
      return "stage";
    default:
      return "other";
  }
}

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

export interface TypeGroup {
  type: ItemType;
  /** The ones printed (capped). */
  items: AgendaItem[];
  /** All of this type in the bucket. */
  total: number;
}

export interface DayBucket {
  /** An ISO day, or "multi" for activities on several days. */
  key: string;
  groups: TypeGroup[];
  total: number;
}

export interface AgendaView {
  window: { from: string; to: string };
  days: DayBucket[];
  multi: DayBucket | null;
  counts: { all: number; free: number } & Record<ItemType, number>;
  /** Items left after dropping days already over. */
  items: AgendaItem[];
}

export const PER_DAY_GROUP = 4;
export const PER_MULTI_GROUP = 3;

/** The first clock time in a time line, in minutes, for ordering ("a les 18.30 h" -> 1110). */
export function firstMinutes(time: string | null): number {
  const m = /\b(\d{1,2})[.:](\d{2})\b/.exec(time ?? "") ?? /\b(\d{1,2}) ?h\b/.exec(time ?? "");
  if (!m) return 24 * 60;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  return h <= 24 ? h * 60 + min : 24 * 60;
}

/** Which ones a capped group keeps: the Ajuntament's picks, free entry, new this weekend, a published time. */
function priority(a: AgendaItem, b: AgendaItem): number {
  return (
    Number(b.recommended) - Number(a.recommended) ||
    Number(b.free) - Number(a.free) ||
    Number(b.startsThisWeekend) - Number(a.startsThisWeekend) ||
    Number(Boolean(b.time)) - Number(Boolean(a.time)) ||
    a.title.localeCompare(b.title, "ca")
  );
}

function buildBucket(key: string, items: AgendaItem[], cap: number): DayBucket {
  const groups: TypeGroup[] = [];
  for (const type of ITEM_TYPES) {
    const all = items.filter((i) => i.type === type);
    if (all.length === 0) continue;
    const kept = [...all].sort(priority).slice(0, cap);
    kept.sort(
      key === "multi"
        ? (a, b) => a.end.localeCompare(b.end) || a.title.localeCompare(b.title, "ca")
        : (a, b) => firstMinutes(a.time) - firstMinutes(b.time) || a.title.localeCompare(b.title, "ca"),
    );
    groups.push({ type, items: kept, total: all.length });
  }
  return { key, groups, total: items.length };
}

/** The days an item is on this weekend, from `today` on. */
export function activeDays(item: AgendaItem, window: { from: string; to: string }, today: string): string[] {
  return (item.days ?? rangeDays(item, window)).filter((d) => d >= today && d >= window.from && d <= window.to);
}

/**
 * Items to day buckets and type groups. Days before `today` are dropped (a
 * page rendered on Saturday no longer lists Friday), and so are items left
 * with no day.
 */
export function buildView(items: readonly AgendaItem[], window: { from: string; to: string }, today: string, caps = { day: PER_DAY_GROUP, multi: PER_MULTI_GROUP }): AgendaView {
  const byDay = new Map<string, AgendaItem[]>();
  const multi: AgendaItem[] = [];
  const kept: AgendaItem[] = [];
  for (const item of items) {
    const days = activeDays(item, window, today);
    if (days.length === 0) continue;
    kept.push(item);
    if (days.length === 1) {
      const list = byDay.get(days[0]!) ?? [];
      list.push(item);
      byDay.set(days[0]!, list);
    } else multi.push(item);
  }
  const days = windowDays(window)
    .filter((d) => byDay.has(d))
    .map((d) => buildBucket(d, byDay.get(d)!, caps.day));
  const counts = { all: kept.length, free: kept.filter((i) => i.free).length } as AgendaView["counts"];
  for (const type of ITEM_TYPES) counts[type] = kept.filter((i) => i.type === type).length;
  return { window: { from: window.from, to: window.to }, days, multi: multi.length > 0 ? buildBucket("multi", multi, caps.multi) : null, counts, items: kept };
}

/* -------------------------------------------------------------------------- */
/* Merging and filtering                                                      */
/* -------------------------------------------------------------------------- */

/** The Ajuntament's list first, then the Generalitat's Barcelona items it does not already carry (same title and first day). */
export function mergeBarcelona(bcn: readonly AgendaItem[], gencat: readonly AgendaItem[]): AgendaItem[] {
  const key = (i: AgendaItem) => `${slugify(i.title)}|${i.start}`;
  const titles = new Set(bcn.map((i) => slugify(i.title)));
  const seen = new Set(bcn.map(key));
  const extra = gencat.filter((i) => i.ine === "08019" && !seen.has(key(i)) && !titles.has(slugify(i.title)));
  return [...bcn, ...extra];
}

export interface PlaceFilter {
  provinces?: readonly string[];
  comarques?: readonly string[];
  ines?: readonly string[];
}

export function inPlace(item: Pick<AgendaItem, "province" | "comarca" | "ine">, filter: PlaceFilter): boolean {
  if (filter.provinces) return filter.provinces.includes(item.province);
  if (filter.comarques) return filter.comarques.includes(item.comarca);
  if (filter.ines) return filter.ines.includes(item.ine);
  return true;
}

/** A read may stand for the current weekend only if it is that weekend's. */
export function readIsFor(read: Pick<SourceRead, "window" | "fetchedAt"> | null | undefined, window: { from: string; to: string }): boolean {
  return Boolean(read && read.window.from === window.from && read.window.to === window.to && Number.isFinite(Date.parse(read.fetchedAt)));
}

/** A kept or committed read, checked field by field; anything malformed is dropped. */
export function checkRead(json: unknown): SourceRead | null {
  if (!json || typeof json !== "object") return null;
  const r = json as Partial<SourceRead>;
  if ((r.source !== "gencat" && r.source !== "bcn") || !r.window || !ISO_DAY.test(r.window.from ?? "") || !ISO_DAY.test(r.window.to ?? "")) return null;
  if (typeof r.fetchedAt !== "string" || !Number.isFinite(Date.parse(r.fetchedAt)) || !Array.isArray(r.items)) return null;
  const items = r.items.filter(
    (i): i is AgendaItem =>
      Boolean(i) &&
      typeof i.id === "string" &&
      typeof i.title === "string" &&
      ISO_DAY.test(i.start ?? "") &&
      ISO_DAY.test(i.end ?? "") &&
      typeof i.url === "string" &&
      /^https:\/\//.test(i.url) &&
      (ITEM_TYPES as readonly string[]).includes(i.type),
  );
  return { source: r.source, window: { from: r.window.from!, to: r.window.to! }, fetchedAt: r.fetchedAt, updated: typeof r.updated === "string" ? r.updated : null, items };
}

export type ReadStatus = "live" | "kept" | "snapshot" | "unavailable";

export interface SourceView {
  status: ReadStatus;
  read: SourceRead | null;
}

export type ReadsBySource = Partial<Record<AgendaSourceId, SourceRead>>;

/**
 * The first read, of live, kept and committed, that is this weekend's. A
 * read of any other weekend is never shown, however recent.
 */
export function pickRead(source: AgendaSourceId, window: { from: string; to: string }, live: ReadsBySource, held: ReadsBySource, committed: ReadsBySource): SourceView {
  if (readIsFor(live[source], window)) return { status: "live", read: live[source]! };
  if (readIsFor(held[source], window)) return { status: "kept", read: held[source]! };
  if (readIsFor(committed[source], window)) return { status: "snapshot", read: committed[source]! };
  return { status: "unavailable", read: null };
}
