/**
 * The El Niño checker's numbers, from the committed snapshot (snapshot.json,
 * written by `scripts/gordo-snapshot.py build --game nino` on 6 January):
 * the drawn numbers exactly as SELAE published them, nothing derived and
 * nothing typed by the site; and the programme the checker applies
 * (programme-2027.json, SELAE's 2027 programme once read). Server-side: the
 * browser gets both as JSON from NINO_DATA_PATH.
 */

import snapshotJson from "./snapshot.json" with { type: "json" };
import { drawComplete, type NinoDraw } from "./engine";
import { NINO_YEAR, type NinoProgramme } from "./programme";
import { PROGRAMME_2027 } from "./programme-data";
import { loadSnapshot, type NinoSnapshot } from "./validate";

export const SNAPSHOT: NinoSnapshot | null = loadSnapshot(snapshotJson as unknown, PROGRAMME_2027);

/** What /data/loteria-nino.json serves. */
export interface NinoCheckerData {
  schema: 1;
  game: "nino";
  /** False until both the 2027 programme and a snapshot with the first prize are in. */
  available: boolean;
  year: number;
  readAt: string | null;
  draw: NinoDraw | null;
  programme: NinoProgramme | null;
  complete: boolean;
  sources: { results: string; officialList: string | null } | null;
}

export function ninoData(s: NinoSnapshot | null = SNAPSHOT, programme: NinoProgramme | null = PROGRAMME_2027): NinoCheckerData {
  if (!s || !programme || s.year !== NINO_YEAR || programme.year !== s.year) {
    return { schema: 1, game: "nino", available: false, year: NINO_YEAR, readAt: null, draw: null, programme, complete: false, sources: null };
  }
  const n = s.numbers;
  const draw: NinoDraw = { first: n.first, second: n.second, third: n.third, x5: [...n.x5], x4: [...n.x4], x3: [...n.x3], x2: [...n.x2], x1: [...n.x1] };
  return { schema: 1, game: "nino", available: Boolean(draw.first), year: s.year, readAt: s.readAt, draw, programme, complete: drawComplete(draw, programme), sources: s.sources };
}
