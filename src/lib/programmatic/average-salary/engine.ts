import { DIST_SHARE } from "./copy";
import type { AgeBand, Cell, Decile, DistKey, OccupationLevel, RegionId, SalarySnapshot, Sector, Sex } from "./ine";

/**
 * "¿Cuánto cobra la gente como tú?": the INE figures for one community, sex,
 * age band, sector and occupation level, and where a yearly gross salary
 * falls (a) among the EAES percentiles of that community and sex and (b)
 * among the EPA's national wage deciles. Pure; nothing is estimated: every
 * number out is an INE figure or the band between two of them.
 *
 * The INE does not cross age, sector and occupation with one another: each
 * figure is the mean of the whole group it names (e.g. all women aged 25 to
 * 34 in Catalonia, whatever their sector).
 */

export interface FinderInput {
  region: RegionId;
  sex: Sex;
  age: AgeBand;
  sector: Sector;
  occupation: OccupationLevel;
  /** Yearly gross salary; null when the reader typed none (or nothing valid). */
  salary: number | null;
}

/** The slice of the snapshot the browser needs (passed as a prop: no fetch). */
export type FinderData = {
  eaesYear: number;
  epaYear: number;
  dist: SalarySnapshot["eaes"]["dist"];
  ageRegion: SalarySnapshot["eaes"]["ageRegion"];
  sectorRegion: SalarySnapshot["eaes"]["sectorRegion"];
  occupationRegion: SalarySnapshot["eaes"]["occupationRegion"];
  deciles: Decile[];
};

export function finderData(s: SalarySnapshot): FinderData {
  return {
    eaesYear: s.eaes.year,
    epaYear: s.epa.year,
    dist: s.eaes.dist,
    ageRegion: s.eaes.ageRegion,
    sectorRegion: s.eaes.sectorRegion,
    occupationRegion: s.eaes.occupationRegion,
    deciles: s.epa.deciles,
  };
}

/** Where a salary falls among the percentiles: the share of workers earning less lies between `from` and `to` (in %). */
export interface Band {
  from: number;
  to: number;
  /** The percentile just below and just above the salary (null at the ends). */
  below: Exclude<DistKey, "mean"> | null;
  above: Exclude<DistKey, "mean"> | null;
}

const PERCENTILES = ["p10", "q1", "median", "q3", "p90"] as const;

export function percentileBand(salary: number, dist: Record<DistKey, Cell>): Band | null {
  const points = PERCENTILES.map((k) => ({ k, v: dist[k]?.v ?? null }));
  if (points.some((p) => p.v === null)) return null;
  let below: Band["below"] = null;
  for (const p of points) if (salary >= (p.v as number)) below = p.k;
  const idx = below ? PERCENTILES.indexOf(below) : -1;
  const above = idx + 1 < PERCENTILES.length ? PERCENTILES[idx + 1]! : null;
  return { from: below ? DIST_SHARE[below] : 0, to: above ? DIST_SHARE[above] : 100, below, above };
}

/** The EPA decile a monthly gross wage falls in: the highest decile whose lower limit it reaches (decile 1 has none). */
export function decileOf(monthly: number, deciles: readonly Decile[]): number {
  let d = 1;
  for (const row of deciles) if (row.lower !== null && monthly >= row.lower) d = row.decile;
  return d;
}

export interface FinderResult {
  input: FinderInput;
  dist: Record<DistKey, Cell>;
  age: Cell;
  sector: Cell;
  occupation: Cell;
  /** Null without a salary. */
  position: {
    salary: number;
    /** salary / 12, as the EPA computes its monthly wage (extras prorated). */
    monthly: number;
    band: Band | null;
    decile: number;
    /** The lower limit of the reader's decile and of the next one (null at the ends). */
    decileFrom: number | null;
    decileTo: number | null;
  } | null;
}

/** Reasonable yearly salaries only: anything else is a typo, not a wage. */
export const SALARY_MAX = 10_000_000;

export function find(input: FinderInput, data: FinderData): FinderResult {
  const dist = data.dist[input.region][input.sex];
  const salary = input.salary !== null && Number.isFinite(input.salary) && input.salary > 0 && input.salary <= SALARY_MAX ? input.salary : null;
  let position: FinderResult["position"] = null;
  if (salary !== null) {
    const monthly = salary / 12;
    const decile = decileOf(monthly, data.deciles);
    position = {
      salary,
      monthly,
      band: percentileBand(salary, dist),
      decile,
      decileFrom: data.deciles.find((d) => d.decile === decile)?.lower ?? null,
      decileTo: data.deciles.find((d) => d.decile === decile + 1)?.lower ?? null,
    };
  }
  return {
    input: { ...input, salary },
    dist,
    age: data.ageRegion[input.region][input.sex][input.age],
    sector: data.sectorRegion[input.region][input.sex][input.sector],
    occupation: data.occupationRegion[input.region][input.sex][input.occupation],
    position,
  };
}

/** Communities by mean salary (both sexes), highest first, for the chart and the ranking sentence. */
export function regionRanking(s: SalarySnapshot): { region: Exclude<RegionId, "es">; mean: number; median: number | null }[] {
  return (Object.keys(s.eaes.dist) as RegionId[])
    .filter((r): r is Exclude<RegionId, "es"> => r !== "es")
    .map((region) => ({ region, mean: s.eaes.dist[region].both.mean?.v ?? 0, median: s.eaes.dist[region].both.median?.v ?? null }))
    .sort((a, b) => b.mean - a.mean);
}

/** Change in % on the previous year, one decimal as INE prints it. */
export function changePct(now: number, before: number): number {
  return Math.round((now / before - 1) * 1000) / 10;
}
