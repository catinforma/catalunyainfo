/**
 * The checker's numbers, from the committed gordo snapshot
 * (lib/programmatic/gordo/snapshot.json, written by scripts/gordo-snapshot.py
 * on 22 December): the thirteen top numbers and the pedrea, exactly as SELAE
 * published them, nothing derived and nothing typed. The derived prizes
 * (aproximaciones, centenas, terminaciones, reintegro) are computed from these
 * by the engine with the programme's rules. Server-side: the browser gets the
 * same object as JSON from CHECK_DATA_PATH.
 */

import { SNAPSHOT, hasResults } from "@/lib/programmatic/gordo/data";
import type { GordoSnapshot } from "@/lib/programmatic/gordo/types";

import { drawComplete, type CheckerDraw } from "./engine";
import { PROGRAMME_YEAR } from "./programme";

/** What /data/loteria-navidad.json serves. */
export interface CheckerData {
  schema: 1;
  /** False until the snapshot carries the Gordo: the page shows its pre-draw state. */
  available: boolean;
  year: number;
  /** When SELAE's pages were read (ISO with offset); null before the draw. */
  readAt: string | null;
  draw: CheckerDraw | null;
  complete: boolean;
  sources: { results: string; officialList: string | null } | null;
}

export function drawFromSnapshot(s: GordoSnapshot): CheckerDraw {
  const numbers = (key: string) => s.prizes.find((p) => p.key === key)?.numbers ?? [];
  return {
    first: numbers("first")[0] ?? null,
    second: numbers("second")[0] ?? null,
    third: numbers("third")[0] ?? null,
    fourth: [...numbers("fourth")],
    fifth: [...numbers("fifth")],
    pedrea: s.pedrea ? [...s.pedrea].sort() : null,
  };
}

/**
 * The JSON payload. A snapshot of another year than the programme's is not
 * served: the rules would not be that draw's.
 */
export function checkerData(s: GordoSnapshot | null = SNAPSHOT): CheckerData {
  if (!hasResults(s) || s.year !== PROGRAMME_YEAR) {
    return { schema: 1, available: false, year: PROGRAMME_YEAR, readAt: null, draw: null, complete: false, sources: null };
  }
  const draw = drawFromSnapshot(s);
  return { schema: 1, available: true, year: s.year, readAt: s.readAt, draw, complete: drawComplete(draw), sources: s.sources };
}

/** The pedrea grouped by thousand ("12" → 12000-12999), thousands in order, numbers sorted: the page's table. */
export function pedreaByThousand(pedrea: readonly string[]): { thousand: string; numbers: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const n of [...pedrea].sort()) {
    const key = n.slice(0, 2);
    const list = groups.get(key) ?? [];
    list.push(n);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([thousand, numbers]) => ({ thousand, numbers }));
}
