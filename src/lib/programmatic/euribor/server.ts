import "server-only";

import { madridDay } from "@/lib/programmatic/rent-update/ine";

import { EURIBOR_SNAPSHOT } from "./data";
import { BDE_CSV_URL, mergeSeries, parseBdeCsv, publishedBy, type BoeResolution, type RefId, type RefSeries } from "./series";

/**
 * The official mortgage reference rates in the server HTML of the Euribor
 * and mortgage pages, read from the Banco de España's be1901.csv once a day
 * (one request, with a timeout), merged over the committed snapshot. The
 * snapshot's months were checked against the BOE text; the CSV only adds
 * months after them, and only once their BOE day has come. If the CSV
 * fails, or a column is renamed, the page prints the snapshot with its date.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 86_400;
const TIMEOUT_MS = 10_000;

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface EuriborData {
  series: RefSeries;
  resolutions: BoeResolution[];
  /** Series that gained a month from the live CSV in this render. */
  liveAdded: RefId[];
  /** The CSV answered and parsed in this render. */
  live: boolean;
  snapshotAsOf: string;
  /** The Madrid day the page was rendered. */
  today: string;
}

async function getCsv(fetchImpl: Fetcher): Promise<string> {
  const response = await fetchImpl(BDE_CSV_URL, {
    headers: { accept: "text/csv", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
    next: { revalidate: SERVER_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  } as RequestInit);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  // The Banco de España serves its CSV in ISO-8859-1.
  return new TextDecoder("latin1").decode(await response.arrayBuffer());
}

export async function loadEuriborData(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<EuriborData> {
  const today = madridDay(now);
  const own = EURIBOR_SNAPSHOT;
  const mine = publishedBy(own.series, today);
  const live = await getCsv(fetchImpl)
    .then((text) => {
      const parsed = parseBdeCsv(text);
      if (parsed.missing.length) return null;
      return publishedBy(parsed.series, today);
    })
    .catch(() => null);
  const merged = mergeSeries(mine, live);
  return { series: merged.series, resolutions: own.resolutions, liveAdded: merged.added, live: live !== null, snapshotAsOf: own.asOf, today };
}
