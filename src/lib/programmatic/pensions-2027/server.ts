import "server-only";

import { RENT_SNAPSHOT } from "@/lib/programmatic/rent-update/data";
import { madridDay, mergeSeries, type SeriesData } from "@/lib/programmatic/rent-update/ine";
import { fetchLiveSeries, type Fetcher } from "@/lib/programmatic/rent-update/server";

/**
 * The INE's CPI (IPC290750) in the server HTML of the pensions page: the
 * rent-update module's loader (live INE API once a day, 8 s timeout) with
 * its committed snapshot as the dated fallback. Two requests per
 * regeneration (series + release calendar), shared by URL with the rent
 * pages' cache. The November figure appears here on the INE's release day
 * without a deploy; the snapshot gets it with `npm run rent:snapshot -- build`.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 86_400;

export interface ServerPensionData {
  ipc: SeriesData;
  /** The CPI came from the INE in this render. */
  live: boolean;
  /** When the INE answered (ISO), else the snapshot's `fetchedAt`. */
  readAt: string;
  /** The snapshot's day, printed when the CPI is not live. */
  snapshotAsOf: string;
  /** The Madrid day the page was rendered. */
  today: string;
}

export async function loadPensionData(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<ServerPensionData> {
  const today = madridDay(now);
  const ipc = await fetchLiveSeries("ipc", today, fetchImpl);
  return {
    ipc: mergeSeries(RENT_SNAPSHOT.series.ipc, ipc),
    live: ipc !== null,
    readAt: ipc ? now.toISOString() : RENT_SNAPSHOT.fetchedAt,
    snapshotAsOf: RENT_SNAPSHOT.asOf,
    today,
  };
}
