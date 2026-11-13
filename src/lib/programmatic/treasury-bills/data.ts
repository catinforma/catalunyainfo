import snapshotJson from "./snapshot.json" with { type: "json" };

import type { AuctionResult } from "./results";

/**
 * The committed Tesoro snapshot (scripts/letras-snapshot.ts): every Letras
 * auction result of 2026 read from tesoro.es, each with the page it came
 * from. What the pages print when tesoro.es does not answer (with its own
 * date), the history table, and the tests' fixture. Server and tests only.
 */

export interface LetrasSnapshot {
  /** When the script read tesoro.es (ISO instant). */
  fetchedAt: string;
  /** The Madrid day of `fetchedAt`. */
  asOf: string;
  /** Newest auction first. */
  results: AuctionResult[];
}

export const LETRAS_SNAPSHOT = snapshotJson as LetrasSnapshot;
