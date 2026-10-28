import snapshotJson from "./snapshot.json" with { type: "json" };
import { isLineId, type AlertsFailed, type AlertsOk, type AlertsPayload, type CompactAlert, type LineId, type RodaliesSnapshot } from "./types";

/**
 * Live Rodalies notices, for `/api/rodalies/alerts`. Server only (the route
 * handler); the browser gets the compact JSON and never sees a source.
 *
 * Two official sources, tried in order:
 *
 *  1. Rodalies de Catalunya's notices, the same list "Estat del servei" shows
 *     on rodalies.gencat.cat, with the lines already named
 *     (`serveisgrs.rodalies.gencat.cat/api/notices`). Reuse: the Generalitat's
 *     legal notice, which rodalies.gencat.cat links (cite the source, give the
 *     date, do not alter the content).
 *  2. Renfe's GTFS-RT service alerts (`gtfsrt.renfe.com/alerts.json`, data.renfe.com
 *     "Incidencias y avisos", CC BY 4.0, "Origen de los datos: Renfe Operadora").
 *     Used only if its header timestamp is recent: on 28 Oct 2026 the file had
 *     not changed since 7 Oct 2026 07:32 UTC (Last-Modified, header timestamp
 *     and HTTP date all agree), while the notices above were current.
 *
 * Whatever happens, nothing older than MAX_SOURCE_AGE_MS is returned as
 * current, and a failure says so instead of returning an empty list.
 */

const SNAPSHOT = snapshotJson as RodaliesSnapshot;
/** Official line order, for sorting the lines an alert names. */
const ORDER: readonly string[] = SNAPSHOT.lines.map((l) => l.id);

export const RODALIES_NOTICES_URL = "https://serveisgrs.rodalies.gencat.cat/api/notices?limit=500&sort=date,desc&sort=time,desc";
export const RENFE_ALERTS_URL = "https://gtfsrt.renfe.com/alerts.json";

/** Order in which the sources are tried. Flip it to prefer Renfe's open-data feed. */
export const SOURCE_ORDER = ["rodalies", "renfe"] as const;

/** A source whose own timestamp is older than this is "stale", not current. */
export const MAX_SOURCE_AGE_MS = 15 * 60 * 1000;

/** CDN cache for a good answer (brief: 120 s, then 300 s stale-while-revalidate). */
export const OK_CACHE_CONTROL = "public, s-maxage=120, stale-while-revalidate=300";
/** A failure is cached briefly, so a broken source is not hammered but recovers fast. */
export const FAILED_CACHE_CONTROL = "public, s-maxage=30";

const FETCH_TIMEOUT_MS = 6000;
/** Longest notice text kept; the official page has the rest. */
export const MAX_TEXT = 1200;

/* -------------------------------------------------------------------------- */
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#039": "'", "#34": '"' };

/**
 * Plain text as published: tags removed (the editor behind the official page
 * can store HTML), a handful of entities decoded, spacing tidied, line breaks
 * kept. Nothing reworded.
 */
export function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#?\w+);/g, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1).trimEnd()}…` : text;
}

/* -------------------------------------------------------------------------- */
/* Source 1: Rodalies de Catalunya notices                                    */
/* -------------------------------------------------------------------------- */

interface RodaliesNotice {
  externalId?: string | number;
  date?: string;
  time?: string;
  title?: Record<string, string>;
  description?: Record<string, string>;
  lines?: { id?: string }[];
}

/** Null if the answer is not the shape the official page uses. */
export function fromRodaliesNotices(json: unknown): { alerts: CompactAlert[]; unmapped: string[] } | null {
  const included = (json as { included?: unknown } | null)?.included;
  if (!Array.isArray(included)) return null;
  const unmapped = new Set<string>();
  const alerts: CompactAlert[] = [];
  for (const raw of included as RodaliesNotice[]) {
    const pick = (lang: "ca" | "es" | "en") => plainText(raw.description?.[lang]) || plainText(raw.title?.[lang]);
    const ca = pick("ca");
    const es = pick("es");
    const en = pick("en");
    if (!ca && !es) continue;
    const lines: LineId[] = [];
    for (const line of raw.lines ?? []) {
      const id = String(line?.id ?? "").trim();
      if (isLineId(id)) {
        if (!lines.includes(id)) lines.push(id);
      } else if (id) unmapped.add(id);
    }
    alerts.push({
      id: `rodalies-${String(raw.externalId ?? alerts.length)}`,
      lines,
      stations: [],
      date: /^\d{4}-\d{2}-\d{2}$/.test(raw.date ?? "") ? raw.date! : null,
      time: /^\d{2}:\d{2}/.test(raw.time ?? "") ? raw.time!.slice(0, 5) : null,
      // The API fills `en` with the Catalan text; it is English only when it differs from both.
      text: { ca: ca || es, es: es || ca, en: en && en !== ca && en !== es ? en : null },
    });
  }
  return { alerts, unmapped: [...unmapped].sort() };
}

/* -------------------------------------------------------------------------- */
/* Source 2: Renfe GTFS-RT service alerts                                     */
/* -------------------------------------------------------------------------- */

interface RenfeTranslation {
  text?: string;
  language?: string;
}

interface RenfeEntity {
  id?: string;
  alert?: {
    activePeriod?: { start?: string; end?: string }[];
    informedEntity?: { routeId?: string; stopId?: string }[];
    headerText?: { translation?: RenfeTranslation[] };
    descriptionText?: { translation?: RenfeTranslation[] };
  };
}

const STATION_LINES: Map<string, { name: string; lines: LineId[] }> = (() => {
  const index = new Map<string, { name: string; lines: LineId[] }>();
  for (const line of SNAPSHOT.lines) {
    for (const station of line.stations) {
      const entry = index.get(station.id) ?? { name: station.name, lines: [] };
      if (!entry.lines.includes(line.id)) entry.lines.push(line.id);
      index.set(station.id, entry);
    }
  }
  return index;
})();

/** The line of a Renfe route id: the GTFS table first, then the id's own suffix if it is an official line. */
export function lineOfRoute(routeId: string, routes: Record<string, LineId> = SNAPSHOT.renfeRoutes): LineId | null {
  const id = routeId.trim();
  if (routes[id]) return routes[id];
  const suffix = /^51T\d{4}([A-Z0-9]+)$/.exec(id)?.[1];
  return suffix && isLineId(suffix) ? suffix : null;
}

/** Madrid civil date and time of an instant. */
export function madridDateTime(instant: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/**
 * Renfe writes every translation as language "es". In the feed read on
 * 28 Oct 2026 every Rodalies alert had two, Spanish first and Catalan second;
 * that order is used only when no translation is tagged "ca".
 */
function renfeTexts(translations: RenfeTranslation[]): { ca: string; es: string } {
  const texts = translations.map((t) => ({ lang: (t.language ?? "").toLowerCase(), text: plainText(t.text) })).filter((t) => t.text);
  const ca = texts.find((t) => t.lang === "ca")?.text ?? (texts.length === 2 ? texts[1]!.text : "");
  const es = texts.find((t) => t.lang === "es" && t.text !== ca)?.text ?? texts[0]?.text ?? "";
  return { ca: ca || es, es: es || ca };
}

export function fromRenfeFeed(
  json: unknown,
  routes: Record<string, LineId> = SNAPSHOT.renfeRoutes,
): { alerts: CompactAlert[]; unmapped: string[]; updatedAt: Date } | null {
  const feed = json as { header?: { timestamp?: string | number }; entity?: RenfeEntity[] } | null;
  const seconds = Number(feed?.header?.timestamp);
  if (!Array.isArray(feed?.entity) || !Number.isFinite(seconds) || seconds <= 0) return null;

  const unmapped = new Set<string>();
  const alerts: CompactAlert[] = [];
  for (const entity of feed.entity) {
    const alert = entity.alert;
    if (!alert) continue;
    const lines: LineId[] = [];
    const stations: string[] = [];
    let rodalies = false;
    for (const informed of alert.informedEntity ?? []) {
      const routeId = (informed.routeId ?? "").trim();
      if (routeId.startsWith("51T")) {
        rodalies = true;
        const line = lineOfRoute(routeId, routes);
        if (line) {
          if (!lines.includes(line)) lines.push(line);
        } else unmapped.add(routeId);
      }
      const stop = STATION_LINES.get((informed.stopId ?? "").trim());
      if (stop) {
        rodalies = true;
        if (!stations.includes(stop.name)) stations.push(stop.name);
        for (const line of stop.lines) if (!lines.includes(line)) lines.push(line);
      }
    }
    if (!rodalies) continue;
    const description = renfeTexts(alert.descriptionText?.translation ?? []);
    const text = description.ca || description.es ? description : renfeTexts(alert.headerText?.translation ?? []);
    if (!text.ca && !text.es) continue;
    const start = Number(alert.activePeriod?.[0]?.start);
    const when = Number.isFinite(start) && start > 0 ? madridDateTime(new Date(start * 1000)) : null;
    alerts.push({
      id: `renfe-${entity.id ?? alerts.length}`,
      lines: lines.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)),
      stations,
      date: when?.date ?? null,
      time: when?.time ?? null,
      text: { ...text, en: null },
    });
  }
  return { alerts, unmapped: [...unmapped].sort(), updatedAt: new Date(seconds * 1000) };
}

/* -------------------------------------------------------------------------- */
/* The handler's answer                                                       */
/* -------------------------------------------------------------------------- */

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

async function getJson(fetcher: Fetcher, url: string): Promise<unknown> {
  const response = await fetcher(url, {
    cache: "no-store",
    headers: { accept: "application/json", "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export interface AlertsResponse {
  status: number;
  headers: Record<string, string>;
  body: AlertsPayload;
}

/**
 * Reads the sources in SOURCE_ORDER and returns the first current answer.
 * One fetch when the first source is up; never throws.
 */
export async function buildAlertsResponse(fetcher: Fetcher, now: Date): Promise<AlertsResponse> {
  const fetchedAt = now.toISOString();
  let staleSince: string | null = null;

  for (const source of SOURCE_ORDER) {
    try {
      if (source === "rodalies") {
        const parsed = fromRodaliesNotices(await getJson(fetcher, RODALIES_NOTICES_URL));
        if (!parsed) continue;
        const body: AlertsOk = { ok: true, source, fetchedAt, sourceUpdatedAt: null, alerts: parsed.alerts, unmapped: parsed.unmapped };
        return { status: 200, headers: { "cache-control": OK_CACHE_CONTROL }, body };
      }
      const parsed = fromRenfeFeed(await getJson(fetcher, RENFE_ALERTS_URL));
      if (!parsed) continue;
      const age = now.getTime() - parsed.updatedAt.getTime();
      if (age > MAX_SOURCE_AGE_MS) {
        staleSince = parsed.updatedAt.toISOString();
        continue;
      }
      const body: AlertsOk = {
        ok: true,
        source,
        fetchedAt,
        sourceUpdatedAt: parsed.updatedAt.toISOString(),
        alerts: parsed.alerts,
        unmapped: parsed.unmapped,
      };
      return { status: 200, headers: { "cache-control": OK_CACHE_CONTROL }, body };
    } catch {
      // Next source.
    }
  }

  const body: AlertsFailed = { ok: false, error: staleSince ? "stale" : "unavailable", fetchedAt, sourceUpdatedAt: staleSince };
  return { status: 503, headers: { "cache-control": FAILED_CACHE_CONTROL }, body };
}
