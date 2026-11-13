import "server-only";

import { RENT_SNAPSHOT } from "./data";
import type { RentSeries } from "./engine";
import { SERIES, buildSeries, calendarUrl, latestPoint, madridDay, mergeSeries, parseCalendar, parseSeries, seriesUrl, type SeriesData, type SeriesId } from "./ine";

/**
 * The IPC and the IRAV in the server HTML of the rent-update pages, read
 * from the INE's JSON API once a day (the INE releases both on the same
 * morning, mid-month). Four requests per regeneration (two series, two
 * release calendars), each with a timeout; any failure keeps the committed
 * snapshot for that series, and the page then prints the snapshot's date.
 * The IGC (only the 2023 cap needs it) always comes from the snapshot.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 86_400;
const TIMEOUT_MS = 8_000;

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface ServerRentData {
  series: RentSeries;
  /** Which series came from the INE in this render. */
  live: Record<SeriesId, boolean>;
  /** When the INE answered (ISO), else the snapshot's `fetchedAt`. */
  readAt: string;
  /** The snapshot's day, printed when a series is not live. */
  snapshotAsOf: string;
  /** The Madrid day the page was rendered. */
  today: string;
}

async function getJson(fetchImpl: Fetcher, url: string): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
    next: { revalidate: SERVER_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  } as RequestInit);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * One live series, or null when the answer is broken: no published month,
 * or older than the snapshot's newest month (an INE answer never goes back).
 */
export async function fetchLiveSeries(id: SeriesId, today: string, fetchImpl: Fetcher = fetch): Promise<SeriesData | null> {
  const spec = SERIES[id];
  try {
    const [values, calendar] = await Promise.all([getJson(fetchImpl, seriesUrl(spec)).then(parseSeries), getJson(fetchImpl, calendarUrl(spec)).then(parseCalendar)]);
    if (values.size === 0 || calendar.size === 0) return null;
    const series = buildSeries(id, values, calendar, today);
    const mine = latestPoint(RENT_SNAPSHOT.series[id])?.month ?? "";
    const theirs = latestPoint(series)?.month ?? "";
    return theirs && theirs >= mine ? series : null;
  } catch {
    return null;
  }
}

export async function loadRentData(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<ServerRentData> {
  const today = madridDay(now);
  const [ipc, irav] = await Promise.all([fetchLiveSeries("ipc", today, fetchImpl), fetchLiveSeries("irav", today, fetchImpl)]);
  const own = RENT_SNAPSHOT.series;
  const live = { ipc: ipc !== null, irav: irav !== null, igc: false };
  return {
    series: { ipc: mergeSeries(own.ipc, ipc), irav: mergeSeries(own.irav, irav), igc: own.igc },
    live,
    readAt: live.ipc || live.irav ? now.toISOString() : RENT_SNAPSHOT.fetchedAt,
    snapshotAsOf: RENT_SNAPSHOT.asOf,
    today,
  };
}
