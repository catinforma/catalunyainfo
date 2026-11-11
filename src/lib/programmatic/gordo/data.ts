/**
 * The Christmas lottery results family's data: the committed snapshot
 * (snapshot.json, written by scripts/gordo-snapshot.py on 22 December) and
 * the groupings the pages render. Until that day the file holds `null`, and
 * only the three hub pages exist: no province or municipality page, nothing
 * in the sitemap but the hubs. Every helper takes the snapshot as an argument
 * so the tests can feed the fixture (tests/fixtures/gordo/).
 */

import { provinceByCode, provinceBySlug, type GordoProvince } from "./provinces";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type { GordoMunicipality, GordoOutlet, GordoPrizeKey, GordoSnapshot } from "./types";
import { loadSnapshot } from "./validate";

export const SNAPSHOT: GordoSnapshot | null = loadSnapshot(snapshotJson as unknown);

/** One point of sale of one prize. */
export interface GordoSale {
  prize: GordoPrizeKey;
  /** The prize's numbers: one for the first three; for the fourth and fifth prizes SELAE does not say which number each outlet sold. */
  numbers: string[];
  perDecimo: number;
  outlet: GordoOutlet;
}

export interface GordoMunicipalityGroup {
  province: GordoProvince;
  municipality: GordoMunicipality;
  sales: GordoSale[];
}

export interface GordoProvinceGroup {
  province: GordoProvince;
  sales: GordoSale[];
  municipalities: GordoMunicipalityGroup[];
}

const ORDER: GordoPrizeKey[] = ["first", "second", "third", "fourth", "fifth"];

/** Every point of sale, prize by prize (SELAE's online channel included, with no province). */
export function sales(s: GordoSnapshot | null): GordoSale[] {
  if (!s) return [];
  return s.prizes.flatMap((prize) =>
    (prize.outlets ?? []).map((outlet) => ({ prize: prize.key, numbers: prize.numbers, perDecimo: prize.perDecimo, outlet })),
  );
}

/** SELAE's online channel entries (loteriasyapuestas.es), listed on the hub only. */
export function webSales(s: GordoSnapshot | null): GordoSale[] {
  return sales(s).filter((sale) => sale.outlet.channel === "web");
}

/** Provinces with at least one point of sale, in INE code order, each with its municipalities in name order. */
export function provinceGroups(s: GordoSnapshot | null): GordoProvinceGroup[] {
  const byProvince = new Map<string, GordoSale[]>();
  for (const sale of sales(s)) {
    if (sale.outlet.channel !== "outlet" || !sale.outlet.province) continue;
    const list = byProvince.get(sale.outlet.province) ?? [];
    list.push(sale);
    byProvince.set(sale.outlet.province, list);
  }
  return [...byProvince.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, list]) => {
      const province = provinceByCode(code)!;
      const byTown = new Map<string, GordoMunicipalityGroup>();
      for (const sale of list) {
        const m = sale.outlet.municipality;
        if (!m) continue;
        const group = byTown.get(m.slug) ?? { province, municipality: m, sales: [] };
        group.sales.push(sale);
        byTown.set(m.slug, group);
      }
      const municipalities = [...byTown.values()].sort((a, b) => a.municipality.name.localeCompare(b.municipality.name, "es"));
      return { province, sales: list, municipalities };
    });
}

export function resolveProvince(s: GordoSnapshot | null, slug: string): GordoProvinceGroup | null {
  const province = provinceBySlug(slug);
  if (!province) return null;
  return provinceGroups(s).find((g) => g.province.code === province.code) ?? null;
}

export function resolveMunicipality(s: GordoSnapshot | null, provinceSlug: string, slug: string): GordoMunicipalityGroup | null {
  return resolveProvince(s, provinceSlug)?.municipalities.find((m) => m.municipality.slug === slug) ?? null;
}

/** The prizes a set of sales covers, best first, each once. */
export function prizesIn(list: readonly GordoSale[]): GordoPrizeKey[] {
  const keys = new Set(list.map((sale) => sale.prize));
  return ORDER.filter((key) => keys.has(key));
}

/** "Has the Gordo been drawn?" — the hub switches to its results state. */
export function hasResults(s: GordoSnapshot | null): s is GordoSnapshot {
  return Boolean(s && s.prizes[0]?.numbers.length);
}

/** The day the snapshot was read, in Madrid ("2026-12-22"). */
export function readDay(s: GordoSnapshot): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(s.readAt));
}

/** "13:05", Madrid time. */
export function readTime(s: GordoSnapshot): string {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s.readAt));
}
