import snapshotJson from "./snapshot.json" with { type: "json" };

import type { BoeResolution, RefSeries } from "./series";

/**
 * The committed Banco de España snapshot (scripts/euribor-snapshot.ts): the
 * official mortgage reference rates of table 19.1 (be1901.csv) since
 * SERIES_FROM, every value checked against the text of the BOE resolution
 * that published it, with those resolutions' identifiers. What the pages
 * print when the Banco de España does not answer (with its own date), and
 * the tests' fixture. Server and tests only.
 */

export interface EuriborSnapshot {
  /** When the script read the Banco de España (ISO instant). */
  fetchedAt: string;
  /** The Madrid day of `fetchedAt`. */
  asOf: string;
  source: string;
  series: RefSeries;
  /** The BOE resolutions the values were checked against. */
  resolutions: BoeResolution[];
}

export const EURIBOR_SNAPSHOT = snapshotJson as EuriborSnapshot;
