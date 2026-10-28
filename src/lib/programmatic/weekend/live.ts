/**
 * The live part of the weekend pages, shared by the route handler (which
 * builds the payload from the Generalitat's agenda) and the browser component
 * (which picks out a zone and groups it). Pure: no network, no clock unless one
 * is passed in, no JSON imports, so it can be bundled for the client.
 */

import type { AgendaCategory } from "@/lib/content/weekend/agenda";

import { MIN_EVENTS, type ZoneFilter } from "./zones";

/** The agenda's own categories (`src/lib/content/weekend/agenda.ts`), in the order the Catalonia page shows them. */
export type Category = AgendaCategory;
export const CATEGORIES: readonly Category[] = ["fairs", "festivals", "family", "music", "theatre", "dance", "routes", "exhibitions", "other"];

/** One activity as the route handler returns it. Short keys: the whole of Catalonia goes in one response. */
export interface LiveEvent {
  id: string;
  /** Title, as the organiser wrote it. */
  t: string;
  /** Venue. */
  v: string;
  /** Municipality name ("" when the row names only a province or comarca). */
  m: string;
  /** INE code, or "". */
  ine: string;
  /** Idescat comarca code, or "". */
  c: string;
  /** Province code. */
  p: string;
  /** First and last day, ISO. */
  s: string;
  e: string;
  k: Category;
  /** Free entry. */
  f: boolean;
  /** Organiser's link (https), or null. */
  u: string | null;
  /** Starts inside the window (rather than continuing from before it). */
  n: boolean;
}

export interface LiveWindow {
  from: string;
  to: string;
  long: boolean;
}

export interface WeekendPayload {
  window: LiveWindow;
  /** When the route handler read the agenda (ISO instant). */
  fetchedAt: string;
  events: LiveEvent[];
}

/* -------------------------------------------------------------------------- */
/* Placing an agenda row                                                      */
/* -------------------------------------------------------------------------- */

export const PROVINCE_SLUGS: Record<string, string> = { barcelona: "08", girona: "17", lleida: "25", tarragona: "43" };

export interface PlaceLookup {
  /** Agenda municipality slug -> municipality (aliases for renamed towns included). */
  town(slug: string): { ine: string; name: string; comarca: string; province: string } | undefined;
  /** Agenda comarca slug -> Idescat comarca code. */
  comarca(slug: string): string | undefined;
}

export interface Placement {
  ine: string;
  name: string;
  comarca: string;
  province: string;
}

/**
 * Where an agenda row is, in official codes, or null when it is not in
 * Catalonia. The agenda writes locations as
 * `agenda:ubicacions/<province>/<comarca>/<municipality>`; a row can carry
 * several, separated by commas (a municipality slug can itself contain a
 * comma: "saus,-camallera-i-llampaies"). The municipality, when the register
 * knows it, decides the comarca and province: the agenda still files the
 * Lluçanès towns under Osona, the register under the Lluçanès.
 */
export function placeRow(row: Record<string, string | undefined>, lookup: PlaceLookup): Placement | null {
  const fields = [row.comarca_i_municipi, row.municipi, row.comarca];
  for (const field of fields) {
    if (!field || !field.trim()) continue;
    for (const location of field.split(/,(?=agenda:)/)) {
      const trimmed = location.trim();
      const structured = /^agenda:ubicacions\/([^/]+)(?:\/([^/]+))?(?:\/(.+))?$/.exec(trimmed);
      if (structured) {
        const province = PROVINCE_SLUGS[structured[1]!];
        if (!province) continue;
        const townSlug = structured[3]?.replace(/,/g, "");
        const town = townSlug ? lookup.town(townSlug) : undefined;
        if (town) return { ine: town.ine, name: town.name, comarca: town.comarca, province: town.province };
        const comarca = structured[2] ? (lookup.comarca(structured[2]) ?? "") : "";
        return { ine: "", name: "", comarca, province };
      }
      if (!trimmed.includes(":")) {
        const town = lookup.town(trimmed.split("/").pop() ?? "");
        if (town) return { ine: town.ine, name: town.name, comarca: town.comarca, province: town.province };
      }
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Picking a zone (browser)                                                   */
/* -------------------------------------------------------------------------- */

export function inZone(event: LiveEvent, filter: ZoneFilter): boolean {
  if (filter.provinces) return filter.provinces.includes(event.p);
  if (filter.comarques) return filter.comarques.includes(event.c);
  if (filter.ines) return filter.ines.includes(event.ine);
  return true;
}

/** Today in Catalonia, as YYYY-MM-DD, whatever timezone the device is in. */
export function todayInMadrid(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** A list read more than this long ago is not shown as this weekend's. */
export const MAX_AGE_HOURS = 24;

/**
 * Whether a payload can be shown as the current weekend's list on `today`
 * (Europe/Madrid). Not once its last day is over: just after midnight on a
 * Monday the CDN may still hold Sunday's answer, and a past weekend is the one
 * thing these pages must never present as this one.
 */
export function payloadIsCurrent(payload: WeekendPayload, now: Date): boolean {
  if (payload.window.to < todayInMadrid(now)) return false;
  const fetched = Date.parse(payload.fetchedAt);
  if (!Number.isFinite(fetched)) return false;
  return (now.getTime() - fetched) / 3_600_000 <= MAX_AGE_HOURS;
}

export interface EventGroup {
  /** A category, or "capital" for the province pages' first group. */
  key: Category | "capital";
  events: LiveEvent[];
}

export interface ZoneView {
  zoneEvents: LiveEvent[];
  /** Below MIN_EVENTS (activities + the fairs calendar's fairs) for this weekend. */
  short: boolean;
  /** When short: the wider area's other activities; null when there is no wider zone. */
  widerEvents: LiveEvent[] | null;
  groups: EventGroup[];
  widerGroups: EventGroup[];
}

/** New this weekend first, then by date, then by name. */
export function byRelevance(a: LiveEvent, b: LiveEvent): number {
  return Number(b.n) - Number(a.n) || a.s.localeCompare(b.s) || a.t.localeCompare(b.t, "ca");
}

export function group(events: readonly LiveEvent[], capital?: string): EventGroup[] {
  const sorted = [...events].sort(byRelevance);
  const groups: EventGroup[] = [];
  const rest = capital ? sorted.filter((e) => e.ine !== capital) : sorted;
  if (capital) {
    const inCapital = sorted.filter((e) => e.ine === capital);
    if (inCapital.length > 0) groups.push({ key: "capital", events: inCapital });
  }
  for (const key of CATEGORIES) {
    const items = rest.filter((e) => e.k === key);
    if (items.length > 0) groups.push({ key, events: items });
  }
  return groups;
}

/**
 * The doorway guardrail, applied to this weekend: a zone with fewer than
 * MIN_EVENTS activities (counting the fairs calendar's fairs, which the page
 * lists from its own snapshot) also shows its wider area's list, and says so.
 */
export function zoneView(
  payload: WeekendPayload,
  options: { filter: ZoneFilter; wider: ZoneFilter | null; fairs: number; capital?: string; category?: Category },
): ZoneView {
  const pool = options.category ? payload.events.filter((e) => e.k === options.category) : payload.events;
  const zoneEvents = pool.filter((e) => inZone(e, options.filter));
  const short = zoneEvents.length + options.fairs < MIN_EVENTS;
  const zoneIds = new Set(zoneEvents.map((e) => e.id));
  const widerEvents = short && options.wider ? pool.filter((e) => inZone(e, options.wider!) && !zoneIds.has(e.id)) : null;
  return {
    zoneEvents,
    short,
    widerEvents,
    groups: group(zoneEvents, options.capital),
    widerGroups: widerEvents ? group(widerEvents) : [],
  };
}

/** The short months of the weekend titles (`content/live-title.ts`), for the browser. */
const MONTHS_SHORT: Record<"ca" | "es", string[]> = {
  ca: ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
};

/** "31 oct", or "30 oct–1 nov" for an activity spanning several days. */
export function dayLabel(start: string, end: string, locale: "ca" | "es"): string {
  const one = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS_SHORT[locale][Number(iso.slice(5, 7)) - 1] ?? ""}`;
  return start === end ? one(start) : `${one(start)}–${one(end)}`;
}

/** "{n} activities" style templates. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Checks an answer from our endpoint; null for anything that is not a usable payload. */
export function parsePayload(json: unknown): WeekendPayload | null {
  if (!json || typeof json !== "object") return null;
  const body = json as Partial<WeekendPayload>;
  const w = body.window;
  if (!w || typeof w.from !== "string" || typeof w.to !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(w.to)) return null;
  if (typeof body.fetchedAt !== "string" || !Array.isArray(body.events)) return null;
  return body as WeekendPayload;
}

export const AGENDA_ENDPOINT = "/api/weekend/agenda/";
