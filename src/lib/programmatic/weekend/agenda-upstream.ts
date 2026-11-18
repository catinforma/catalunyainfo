/**
 * The two official reads behind the server-rendered weekend lists. Each
 * returns null rather than a partial list presented as complete; the fetch
 * function is an argument (agenda-server.ts passes one with Next's data cache
 * and a timeout; the snapshot script and the tests pass their own).
 *
 * Checked from the VPS on 18 Nov 2026, both keyless:
 *
 *  - Generalitat, Agenda Cultural de Catalunya (per localitzacions), Socrata
 *    `rhpv-yr4f`, Departament de Cultura, update "Contínua". Licence:
 *    Llicència oberta d'ús d'informació - Catalunya: do not alter the content,
 *    cite "Generalitat de Catalunya. Departament de Cultura" and the date of
 *    the last update (the answer's Last-Modified header). 456 activities for
 *    20-22 Nov 2026 (608 rows, one per location).
 *  - Ajuntament de Barcelona, "Agenda d'esdeveniments i activitats de la
 *    ciutat de Barcelona" (Open Data BCN `agenda-diaria`, resource "agenda
 *    ampliada" ffa6d773-…, daily), through the CKAN datastore SQL action.
 *    Licence CC BY 4.0; Open Data BCN's terms: cite "Font de les dades:
 *    Ajuntament de Barcelona", give the date of the last update, identify any
 *    transformation, and graphic content (images) is excluded. The resource
 *    has one row per activity x address x attribute x category, so the query
 *    groups by `register_id`. 602 activities of 45 days or less for 20-22 Nov.
 */

import { ENDPOINT, isInCatalonia, normaliseEvent } from "@/lib/content/weekend/agenda";

import {
  PRICE_MAX,
  TIME_MAX,
  TITLE_MAX,
  VENUE_MAX,
  bcnExcluded,
  bcnType,
  daysFromSchedule,
  freeFromPrice,
  gencatType,
  plainText,
  rangeDays,
  sessions,
  slugify,
  timeLine,
  truncate,
  type AgendaItem,
  type SourceRead,
} from "./agenda-list";
import { buildLookup, municipalityNames } from "./compact";
import { placeRow } from "./live";
import type { WeekendSnapshot } from "./types";

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const HEADERS = { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" };

/** No activity running longer than this is a weekend plan (the rule `normaliseEvent` applies to the Generalitat's). */
export const MAX_SPAN_DAYS = 45;

function checkWindow(window: { from: string; to: string }): void {
  if (!ISO_DAY.test(window.from) || !ISO_DAY.test(window.to)) throw new Error("bad window");
}

/* -------------------------------------------------------------------------- */
/* Generalitat                                                                */
/* -------------------------------------------------------------------------- */

export const GENCAT_SOURCE = {
  name: "Agenda Cultural de Catalunya",
  publisher: "Generalitat de Catalunya. Departament de Cultura",
  url: "https://agenda.cultura.gencat.cat/",
  dataUrl: "https://analisi.transparenciacatalunya.cat/d/rhpv-yr4f",
  licence: "Llicència oberta d'ús d'informació - Catalunya",
  licenceUrl: "https://web.gencat.cat/ca/generalitat/dades-indicadors/dades-obertes/llicencies",
} as const;

/** The Generalitat's page for one activity (it redirects to the page with its slug). */
export function gencatActivityUrl(codi: string): string | null {
  return /^\d{8,16}$/.test(codi) ? `https://agenda.cultura.gencat.cat/ca/activitat.html/${codi}` : null;
}

/** The weekend pages' query (compact.ts `agendaUrl`) plus the published times and prices. */
export function gencatUrl(window: { from: string; to: string }, limit = 2000): string {
  checkWindow(window);
  const where =
    `data_inici <= '${window.to}T23:59:59' AND data_fi >= '${window.from}T00:00:00'` +
    ` AND (permanent IS NULL OR permanent != 'Sí')` +
    ` AND (modalitat IS NULL OR modalitat != 'Virtual')`;
  return (
    `${ENDPOINT}?$select=codi,denominaci,espai,comarca_i_municipi,municipi,comarca,` +
    `data_inici,data_fi,tags_categor_es,gratuita,url,linkbotoentrades,horari,entrades` +
    `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=${limit}`
  );
}

type Register = Pick<WeekendSnapshot, "municipalities" | "comarques" | "agendaAliases">;

/** Generalitat rows to items: Catalonia only, placed, deduplicated (one row per location). */
export function gencatItems(rows: readonly Record<string, string | undefined>[], window: { from: string; to: string; long?: boolean }, register: Register): AgendaItem[] {
  const lookup = buildLookup(register);
  const names = municipalityNames(register);
  const seen = new Set<string>();
  const out: AgendaItem[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object" || !isInCatalonia(row, names)) continue;
    const event = normaliseEvent(row, { from: window.from, to: window.to, long: Boolean(window.long) }, names);
    const place = placeRow(row, lookup);
    if (!event || !place || seen.has(event.id)) continue;
    const url = gencatActivityUrl(String(row.codi ?? "")) ?? event.url;
    if (!url) continue;
    // A one-day activity is on its date. A longer one is on the days its
    // schedule names, when it names them; "Els dijous de novembre" is not a
    // weekend plan, and leaves the list.
    const days = event.start === event.end ? null : daysFromSchedule(row.horari, rangeDays(event, window));
    if (days && days.length === 0) continue;
    seen.add(event.id);
    const time = plainText(row.horari);
    const price = plainText(row.entrades);
    out.push({
      id: `gencat:${event.id}`,
      source: "gencat",
      title: truncate(event.title, TITLE_MAX),
      venue: truncate(event.venue, VENUE_MAX),
      moreVenues: 0,
      town: place.name,
      district: "",
      ine: place.ine,
      comarca: place.comarca,
      province: place.province,
      start: event.start,
      end: event.end,
      days,
      time: time ? truncate(time, TIME_MAX) : null,
      price: price ? truncate(price, PRICE_MAX) : null,
      free: event.free,
      type: gencatType(event.category),
      recommended: false,
      startsThisWeekend: event.startsThisWeekend,
      url,
    });
  }
  return out;
}

/** When the source's server answered (HTTP Date, which Next's data cache keeps with the body), else now. */
export function answeredAt(response: Response, now: number): string {
  const header = Date.parse(response.headers.get("date") ?? "");
  return new Date(Number.isFinite(header) && header <= now + 60_000 ? header : now).toISOString();
}

/** Last-Modified (Socrata sends the dataset's last update there), as an ISO instant. */
function lastModified(response: Response): string | null {
  const value = Date.parse(response.headers.get("last-modified") ?? response.headers.get("x-soda2-truth-last-modified") ?? "");
  return Number.isFinite(value) ? new Date(value).toISOString() : null;
}

export async function readGencat(fetcher: FetchLike, window: { from: string; to: string; long?: boolean }, register: Register, now: number): Promise<SourceRead | null> {
  const response = await fetcher(gencatUrl(window), { headers: HEADERS });
  if (!response.ok) return null;
  const rows = (await response.json()) as unknown;
  if (!Array.isArray(rows)) return null;
  return {
    source: "gencat",
    window: { from: window.from, to: window.to },
    fetchedAt: answeredAt(response, now),
    updated: lastModified(response),
    items: gencatItems(rows as Record<string, string | undefined>[], window, register),
  };
}

/* -------------------------------------------------------------------------- */
/* Ajuntament de Barcelona                                                    */
/* -------------------------------------------------------------------------- */

export const BCN_SOURCE = {
  name: "Agenda d'esdeveniments i activitats de la ciutat de Barcelona",
  publisher: "Ajuntament de Barcelona",
  dataUrl: "https://opendata-ajuntament.barcelona.cat/data/ca/dataset/agenda-diaria",
  /** The citation markup Open Data BCN's terms give links barcelona.cat/opendata. */
  attributionUrl: "https://opendata-ajuntament.barcelona.cat/",
  licence: "CC BY 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  termsUrl: "https://opendata-ajuntament.barcelona.cat/ca/condicions-us",
  /** Guia Barcelona, the Ajuntament's agenda for readers, per language. */
  guide: { ca: "https://guia.barcelona.cat/ca", es: "https://guia.barcelona.cat/es", en: "https://guia.barcelona.cat/en" },
} as const;

export const BCN_RESOURCE = "ffa6d773-7998-4e0f-8e98-c80abce7126f";
export const BCN_SQL_ENDPOINT = "https://opendata-ajuntament.barcelona.cat/data/api/action/datastore_search_sql";

/** The Ajuntament's page for one activity (any slug works; the id decides). */
export function bcnActivityUrl(registerId: string, title: string, locale: "ca" | "es" | "en" = "ca"): string | null {
  return /^\d{6,16}$/.test(registerId) ? `https://guia.barcelona.cat/${locale}/detall/${slugify(title).slice(0, 80) || "activitat"}_${registerId}.html` : null;
}

/** One row per activity overlapping the window, 45 days or shorter. */
export function bcnSql(window: { from: string; to: string }, limit = 2500): string {
  checkWindow(window);
  return (
    "SELECT register_id, MIN(name) AS name, MIN(start_date) AS s, MAX(end_date) AS e, " +
    "MIN(addresses_place) AS place, COUNT(DISTINCT addresses_place) AS places, " +
    "MIN(addresses_district_name) AS district, left(MIN(timetable), 4000) AS tt, " +
    "string_agg(DISTINCT secondary_filters_fullpath, '|') AS paths, MAX(modified) AS mod " +
    `FROM "${BCN_RESOURCE}" ` +
    `WHERE start_date <= '${window.to}T23:59:59' AND end_date >= '${window.from}T00:00:00' ` +
    `AND end_date - start_date <= interval '${MAX_SPAN_DAYS} days' ` +
    `GROUP BY register_id ORDER BY MIN(start_date) LIMIT ${limit}`
  );
}

export function bcnUrl(window: { from: string; to: string }): string {
  return `${BCN_SQL_ENDPOINT}?sql=${encodeURIComponent(bcnSql(window))}`;
}

export interface BcnRow {
  register_id?: string;
  name?: string;
  s?: string;
  e?: string;
  place?: string;
  places?: string | number;
  district?: string;
  tt?: string;
  paths?: string;
  mod?: string;
}

const BARCELONA = { ine: "08019", comarca: "13", province: "08", town: "Barcelona" };

/** Aggregated Open Data BCN rows to items. Drops what is not on this weekend once its timetable is read. */
export function bcnItems(rows: readonly BcnRow[], window: { from: string; to: string }): AgendaItem[] {
  const out: AgendaItem[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    // The first column of the CSV-loaded table carries a byte-order mark.
    const id = String(row.register_id ?? "").replace(/[^\d]/g, "");
    const title = plainText(row.name);
    const start = String(row.s ?? "").slice(0, 10);
    const end = String(row.e ?? row.s ?? "").slice(0, 10);
    if (!id || !title || !ISO_DAY.test(start) || !ISO_DAY.test(end) || end < start || seen.has(id)) continue;
    const paths = String(row.paths ?? "");
    const type = bcnType(paths, title);
    if (bcnExcluded(paths, title, type)) continue;
    const url = bcnActivityUrl(id, title);
    if (!url) continue;
    const { days, hours, price } = sessions(row.tt, window, { start, end });
    if (days && days.length === 0) continue;
    if ((days ?? rangeDays({ start, end }, window)).length === 0) continue;
    seen.add(id);
    const shownDays = days ?? rangeDays({ start, end }, window);
    const places = Number(row.places ?? 1);
    out.push({
      id: `bcn:${id}`,
      source: "bcn",
      title: truncate(title, TITLE_MAX),
      venue: truncate(plainText(row.place), VENUE_MAX),
      moreVenues: Number.isFinite(places) && places > 1 ? places - 1 : 0,
      town: BARCELONA.town,
      district: plainText(row.district),
      ine: BARCELONA.ine,
      comarca: BARCELONA.comarca,
      province: BARCELONA.province,
      start,
      end,
      days,
      time: timeLine(shownDays, hours),
      price: price ? truncate(price, PRICE_MAX) : null,
      free: freeFromPrice(price),
      type,
      recommended: /barcelona cultura - recomanem/i.test(paths),
      startsThisWeekend: start >= window.from && start <= window.to,
      url,
    });
  }
  return out;
}

export async function readBcn(fetcher: FetchLike, window: { from: string; to: string }, now: number): Promise<SourceRead | null> {
  const response = await fetcher(bcnUrl(window), { headers: HEADERS });
  if (!response.ok) return null;
  const body = (await response.json()) as { success?: boolean; result?: { records?: unknown } };
  const records = body?.result?.records;
  if (!body?.success || !Array.isArray(records)) return null;
  const rows = records as BcnRow[];
  const updated = rows.reduce<string | null>((max, r) => (typeof r.mod === "string" && (!max || r.mod > max) ? r.mod : max), null);
  return {
    source: "bcn",
    window: { from: window.from, to: window.to },
    fetchedAt: answeredAt(response, now),
    updated: updated ? updated.slice(0, 19) : null,
    items: bcnItems(rows, window),
  };
}
