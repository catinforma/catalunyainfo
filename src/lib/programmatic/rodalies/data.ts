import { LINE_OFFICIAL, type ServiceGroup } from "./official";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type { LineId, RodaliesSnapshot, SnapshotLine } from "./types";

/** The committed snapshot (see scripts/rodalies-snapshot.ts). Server only. */
export const SNAPSHOT = snapshotJson as RodaliesSnapshot;

export const LINES: readonly SnapshotLine[] = SNAPSHOT.lines;

export function lineById(id: LineId): SnapshotLine {
  const line = LINES.find((l) => l.id === id);
  if (!line) throw new Error(`No ${id} in the Rodalies snapshot`);
  return line;
}

export function linesInGroup(group: ServiceGroup): SnapshotLine[] {
  return LINES.filter((l) => LINE_OFFICIAL[l.id].group === group);
}

/**
 * Lines a reader of this one may need next: those that share a station with
 * it, most shared stations first, then the rest of its group. Never itself.
 */
export function siblings(id: LineId): { shared: { line: SnapshotLine; stations: number }[]; group: SnapshotLine[] } {
  const line = lineById(id);
  const counts = new Map<LineId, number>();
  for (const station of line.stations) for (const other of station.lines) counts.set(other, (counts.get(other) ?? 0) + 1);
  const order = (x: LineId) => LINES.findIndex((l) => l.id === x);
  const shared = [...counts.entries()]
    .filter(([other]) => other !== id)
    .sort(([a, n], [b, m]) => m - n || order(a) - order(b))
    .map(([other, stations]) => ({ line: lineById(other), stations }));
  const sharedIds = new Set(shared.map((s) => s.line.id));
  const group = linesInGroup(LINE_OFFICIAL[id].group).filter((l) => l.id !== id && !sharedIds.has(l.id));
  return { shared, group };
}

/** Accessible stations on a line, as Rodalies flags them. */
export function accessibleCount(line: SnapshotLine): number {
  return line.stations.filter((s) => s.accessible).length;
}
