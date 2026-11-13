import snapshotJson from "./snapshot.json" with { type: "json" };

import type { IpcData } from "./series";

/**
 * The committed INE snapshot (scripts/ipc-snapshot.ts): what the IPC pages
 * print when the INE's API does not answer, with its own date, and the
 * tests' fixture. Server and tests only.
 */

export interface IpcSnapshot extends IpcData {
  /** When the script read the INE (ISO instant). */
  fetchedAt: string;
  /** The Madrid day of `fetchedAt`. */
  asOf: string;
}

export const IPC_SNAPSHOT = snapshotJson as IpcSnapshot;
