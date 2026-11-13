import "server-only";

import { madridDay, parseSeries } from "@/lib/programmatic/rent-update/ine";

import { IPC_SNAPSHOT } from "./data";
import { IPC_SERIES, IPC_SERIES_IDS, buildIpc, ipcCalendarUrl, ipcSeriesUrl, latestMonth, mergePoints, mergeReleases, parseReleases, type IpcData, type IpcSeriesId } from "./series";

/**
 * The CPI in the server HTML of the IPC pages, read from the INE's JSON API
 * once a day: five requests per regeneration (four series and the release
 * calendar), each with a timeout. Without the calendar nothing live is
 * used (a value cannot be dated); a series that fails, or answers with an
 * older month than the snapshot, keeps the committed snapshot, and the page
 * then prints the snapshot's date. Never a month the INE has not released.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 86_400;
const TIMEOUT_MS = 8_000;

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface ServerIpcData extends IpcData {
  /** Which series came from the INE in this render. */
  live: Record<IpcSeriesId, boolean>;
  /** The release calendar came from the INE in this render. */
  liveCalendar: boolean;
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

export async function loadIpcData(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<ServerIpcData> {
  const today = madridDay(now);
  const own = IPC_SNAPSHOT;
  const none = Object.fromEntries(IPC_SERIES_IDS.map((id) => [id, false])) as Record<IpcSeriesId, boolean>;
  const fallback: ServerIpcData = { series: own.series, releases: own.releases, live: none, liveCalendar: false, snapshotAsOf: own.asOf, today };

  const releases = await getJson(fetchImpl, ipcCalendarUrl())
    .then(parseReleases)
    .catch(() => []);
  if (releases.length === 0) return fallback;

  const values = await Promise.all(
    IPC_SERIES_IDS.map((id) =>
      getJson(fetchImpl, ipcSeriesUrl(IPC_SERIES[id]))
        .then(parseSeries)
        .catch(() => new Map<string, number>()),
    ),
  );
  const built = buildIpc(Object.fromEntries(IPC_SERIES_IDS.map((id, i) => [id, values[i]!])) as Record<IpcSeriesId, Map<string, number>>, releases, today);

  const live = { ...none };
  const series = {} as IpcData["series"];
  for (const id of IPC_SERIES_IDS) {
    const mine = latestMonth(own.series[id])?.month ?? "";
    const theirs = latestMonth(built.series[id])?.month ?? "";
    const ok = theirs !== "" && theirs >= mine;
    live[id] = ok;
    series[id] = mergePoints(own.series[id], ok ? built.series[id] : null);
  }
  return { series, releases: mergeReleases(own.releases, built.releases), live, liveCalendar: true, snapshotAsOf: own.asOf, today };
}
