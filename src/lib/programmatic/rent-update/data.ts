import snapshotJson from "./snapshot.json" with { type: "json" };

import type { SeriesData, SeriesId } from "./ine";

/**
 * The committed INE snapshot (scripts/rent-index-snapshot.ts): what the
 * pages print when the INE's API does not answer, with its own date, and
 * the tests' fixture. Server and tests only; the browser gets the series as
 * props.
 */

export interface RentSnapshot {
  /** When the script read the INE (ISO instant). */
  fetchedAt: string;
  /** The Madrid day of `fetchedAt`. */
  asOf: string;
  series: Record<SeriesId, SeriesData>;
}

export const RENT_SNAPSHOT = snapshotJson as RentSnapshot;
