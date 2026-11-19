/**
 * The Grossa checker's numbers, from the committed snapshot (snapshot.json,
 * written by `scripts/gordo-snapshot.py build --game grossa` on 31
 * December): the eight winning numbers exactly as Loteries de Catalunya
 * published them, nothing derived and nothing typed by the site. The
 * neighbour and ending prizes are computed by the engine with the DOGC's
 * rules. Server-side: the browser gets the same object as JSON from
 * GROSSA_DATA_PATH.
 */

import snapshotJson from "./snapshot.json" with { type: "json" };
import { drawComplete, knownCount, type GrossaDraw } from "./engine";
import { GROSSA_YEAR } from "./programme";
import { loadSnapshot, type GrossaSnapshot } from "./validate";

export const SNAPSHOT: GrossaSnapshot | null = loadSnapshot(snapshotJson as unknown);

/** What /data/grossa-cap-d-any.json serves. */
export interface GrossaCheckerData {
  schema: 1;
  game: "grossa";
  /** False until the snapshot carries a winning number: the page shows its pre-draw state. */
  available: boolean;
  year: number;
  readAt: string | null;
  draw: GrossaDraw | null;
  complete: boolean;
  sources: { results: string; press: string | null } | null;
}

/**
 * The JSON payload. A snapshot of another year than the programme's is not
 * served: the prize table would not be that draw's.
 */
export function grossaData(s: GrossaSnapshot | null = SNAPSHOT): GrossaCheckerData {
  if (!s || s.year !== GROSSA_YEAR) return { schema: 1, game: "grossa", available: false, year: GROSSA_YEAR, readAt: null, draw: null, complete: false, sources: null };
  const draw: GrossaDraw = { first: s.numbers.first, second: s.numbers.second, third: s.numbers.third, fourth: [...s.numbers.fourth], fifth: [...s.numbers.fifth] };
  return { schema: 1, game: "grossa", available: knownCount(draw) > 0, year: s.year, readAt: s.readAt, draw, complete: drawComplete(draw), sources: s.sources };
}
