import snapshotJson from "./snapshot.json" with { type: "json" };
import type { ReservoirSlug, ReservoirSnapshot, SnapshotReservoir } from "./types";

/** The committed snapshot (see scripts/reservoirs-snapshot.ts). Server only. */
export const SNAPSHOT = snapshotJson as ReservoirSnapshot;

export const RESERVOIR_DATA: readonly SnapshotReservoir[] = SNAPSHOT.reservoirs;

export function reservoirBySlug(slug: ReservoirSlug): SnapshotReservoir {
  const r = RESERVOIR_DATA.find((x) => x.slug === slug);
  if (!r) throw new Error(`No ${slug} in the reservoir snapshot`);
  return r;
}

/**
 * Reservoirs worked together, as the ACA's documents group them: the Ter
 * (Sau, Susqueda), the Cardener-Llobregat (la Baells, la Llosa del Cavall,
 * Sant Ponç), Siurana-Riudecanyes. Darnius Boadella and Foix are alone.
 */
const GROUPS: ReservoirSlug[][] = [
  ["sau", "susqueda"],
  ["la-baells", "la-llosa-del-cavall", "sant-ponc"],
  ["siurana", "riudecanyes"],
  ["darnius-boadella"],
  ["foix"],
];

/**
 * The pages a reader of this one may want next: the same system first, then
 * the other half of Ter-Llobregat for its five, then every other reservoir.
 * Never itself; every reservoir appears exactly once.
 */
export function siblingsOf(slug: ReservoirSlug): { system: SnapshotReservoir[]; network: SnapshotReservoir[]; others: SnapshotReservoir[] } {
  const own = GROUPS.find((g) => g.includes(slug)) ?? [slug];
  const terLlobregat: ReservoirSlug[] = ["sau", "susqueda", "la-baells", "la-llosa-del-cavall", "sant-ponc"];
  const system = own.filter((s) => s !== slug);
  const network = terLlobregat.includes(slug) ? terLlobregat.filter((s) => s !== slug && !own.includes(s)) : [];
  const taken = new Set<ReservoirSlug>([slug, ...system, ...network]);
  const pick = (list: ReservoirSlug[]) => RESERVOIR_DATA.filter((r) => list.includes(r.slug));
  return { system: pick(system), network: pick(network), others: RESERVOIR_DATA.filter((r) => !taken.has(r.slug)) };
}

/** The snapshot's latest reading of every reservoir, in the compact shape the browser block takes. */
export function snapshotReadings(): { slug: ReservoirSlug; date: string; percent: number; volume: number; level: number | null }[] {
  return RESERVOIR_DATA.map((r) => ({ slug: r.slug, ...r.trend.latest }));
}
