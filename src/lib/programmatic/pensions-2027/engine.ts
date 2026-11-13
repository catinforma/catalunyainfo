import type { MonthPoint, SeriesData } from "@/lib/programmatic/rent-update/ine";

import { MAX_PENSION_2026, MINIMUMS_2026, WINDOW_FROM, WINDOW_TO, type FlashFigure, type Official2027 } from "./rules";

/**
 * The pension revaluation engine: the mean of the INE's twelve annual CPI
 * rates of December to November (LGSS art. 58.2) from whatever months the
 * INE has released, and a pension revalued by it. Pure and client-safe: the
 * page, the calculator and the tests call it with the series the server read.
 *
 * The CPI rates come with one decimal, so the sum is kept in tenths (exact
 * integers) and the mean is rounded half up to one decimal, as the
 * government expressed it for 2026 (RDL 3/2026: «expresado con un decimal»).
 * The law itself does not say how to round; the official figure is the one
 * in the BOE (status "official").
 */

/** How far the 2027 figure has got. */
export type RateKind = "provisional" | "flash" | "final" | "official";

export interface WindowMonth {
  month: string;
  /** The INE's final annual rate, or null while unreleased. */
  value: number | null;
  /** Release day of the final figure (INE calendar), or null when unknown. */
  published: string | null;
}

export interface RateStatus {
  kind: RateKind;
  /** The twelve months of the window, Dec → Nov, with what is released. */
  months: WindowMonth[];
  /** How many of them have a final INE value. */
  known: number;
  /** The mean of the rates used (known months, plus the flash in "flash"), unrounded; null in "official" when no INE mean applies. */
  mean: number | null;
  /** The percentage the calculator applies: the mean to two decimals (provisional), rounded to one (flash, final), or the BOE figure. 0 when the mean is negative (art. 58.3). */
  percent: number;
  /** The mean was negative: pensions stay the same (art. 58.3). */
  negative: boolean;
  /** Present in "flash". */
  flash?: FlashFigure;
  /** Present in "official". */
  official?: Official2027;
}

/** "2025-12" → "2026-01". */
export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** The months from `from` to `to`, inclusive. */
export function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = from; m <= to; m = nextMonth(m)) out.push(m);
  return out;
}

const tenths = (v: number) => Math.round(v * 10);

/** Half-up rounding of `sumTenths / n` tenths to one decimal (exact for INE one-decimal rates). */
export function roundedMean(sumTenths: number, n: number): number {
  const t = sumTenths / n;
  return (t >= 0 ? Math.round(t) : -Math.round(-t)) / 10;
}

/** The window's months as the series has them (a month the INE has not released has value null). */
export function windowMonths(ipc: SeriesData, from = WINDOW_FROM, to = WINDOW_TO): WindowMonth[] {
  const byMonth = new Map<string, MonthPoint>(ipc.points.map((p) => [p.month, p]));
  return monthsBetween(from, to).map((month) => {
    const p = byMonth.get(month);
    return { month, value: p?.value ?? null, published: p?.published ?? null };
  });
}

/**
 * Where the revaluation stands on `today`:
 *  - "official": the BOE norm is out (OFFICIAL_2027 filled and published by today);
 *  - "final": the INE has released all twelve final rates;
 *  - "flash": only November is missing and the INE's flash for it is out;
 *  - "provisional": the mean of the months released so far.
 * Returns null when not a single month of the window is released.
 */
export function revaluationStatus(
  ipc: SeriesData,
  today: string,
  flash: FlashFigure | null,
  official: Official2027 | null,
  from = WINDOW_FROM,
  to = WINDOW_TO,
): RateStatus | null {
  const months = windowMonths(ipc, from, to);
  const released = months.filter((m) => m.value !== null);
  const sum = released.reduce((a, m) => a + tenths(m.value!), 0);
  const known = released.length;
  const base = { months, known };

  if (official && official.published <= today) {
    const mean = known === months.length ? sum / (10 * known) : null;
    return { ...base, kind: "official", mean, percent: official.percent, negative: false, official };
  }
  if (known === 0) return null;
  const pack = (kind: RateKind, s: number, n: number, extra: Partial<RateStatus> = {}): RateStatus => {
    // Provisional: the plain mean to two decimals, so it never looks like the
    // one-decimal figure the government will publish.
    const mean = s / (10 * n);
    const r = kind === "provisional" ? Math.round(mean * 100) / 100 : roundedMean(s, n);
    return { ...base, kind, mean, percent: Math.max(0, r), negative: r < 0, ...extra };
  };
  if (known === months.length) return pack("final", sum, known);
  const missing = months.filter((m) => m.value === null);
  const last = months.at(-1)!;
  if (flash && flash.published <= today && missing.length === 1 && missing[0]!.month === last.month && flash.month === last.month) {
    return pack("flash", sum + tenths(flash.value), months.length, { flash });
  }
  return pack("provisional", sum, known);
}

export interface Scenario {
  /** The rounded mean this range of November rates gives. */
  percent: number;
  /** Lowest November rate (one decimal) giving it; null = open below. */
  from: number | null;
  /** Highest; null = open above. */
  to: number | null;
}

/**
 * With every month but the last released: which November rates give which
 * rounded mean. Not a forecast, only arithmetic: the mean of twelve is
 * (sum of eleven + November) / 12, rounded half up to one decimal.
 * `around` rows either side of the eleven-month mean; the first and the
 * last are open-ended.
 */
export function novemberScenarios(status: RateStatus, around = 2): Scenario[] {
  if (status.kind !== "provisional" || status.known !== status.months.length - 1 || status.months.at(-1)!.value !== null) return [];
  const n = status.months.length;
  const s = status.months.reduce((a, m) => a + (m.value === null ? 0 : tenths(m.value)), 0);
  const centre = Math.round((10 * s) / (n - 1) / 10);
  const rows: Scenario[] = [];
  for (let r = centre - around; r <= centre + around; r++) {
    // round((s + x) / n) = r  ⇔  s + x ∈ [n·r − n/2, n·r + n/2)  (half up).
    const lo = Math.ceil(n * r - n / 2 - s);
    const hi = Math.ceil(n * r + n / 2 - s) - 1;
    rows.push({ percent: r / 10, from: r === centre - around ? null : lo / 10, to: r === centre + around ? null : hi / 10 });
  }
  return rows;
}

/* -------------------------------------------------------------------------- */
/* A pension revalued                                                         */
/* -------------------------------------------------------------------------- */

export type Payments = 14 | 12;

export interface PensionInput {
  /** Gross monthly pension in 2026, €. */
  monthly: number;
  /** 14 payments (12 + June and November), or 12 with the extras prorated (work accident pensions). */
  payments: Payments;
}

export type PensionNote = "above-max" | "minimums";

export type PensionResult =
  | { status: "invalid" }
  | {
      status: "ok";
      percent: number;
      monthly2026: number;
      monthly2027: number;
      monthlyRise: number;
      annual2026: number;
      annual2027: number;
      annualRise: number;
      notes: PensionNote[];
    };

const cents = (x: number) => Math.round(x * 100) / 100;
/** Above this a "monthly pension" is a typing slip, not a Spanish public pension. */
export const MAX_INPUT = 20_000;

/** The highest 2026 minimum a contributory pension can be topped up to, except great invalidity: under it a top-up may apply. */
export const TOP_MINIMUM_2026 = Math.max(...MINIMUMS_2026.filter((m) => m.id !== "ret65Gi" && m.id !== "ipGi").map((m) => m.spouse ?? m.single));

export function revaluePension(input: PensionInput, percent: number): PensionResult {
  const { monthly, payments } = input;
  if (!Number.isFinite(monthly) || monthly <= 0 || monthly > MAX_INPUT || (payments !== 14 && payments !== 12) || !Number.isFinite(percent) || percent < 0) return { status: "invalid" };
  const monthly2027 = cents(monthly * (1 + percent / 100));
  const monthly2026 = cents(monthly);
  const annual2026 = cents(monthly2026 * payments);
  const annual2027 = cents(monthly2027 * payments);
  const notes: PensionNote[] = [];
  if (annual2026 > MAX_PENSION_2026.annual) notes.push("above-max");
  if (annual2026 < TOP_MINIMUM_2026) notes.push("minimums");
  return {
    status: "ok",
    percent,
    monthly2026,
    monthly2027,
    monthlyRise: cents(monthly2027 - monthly2026),
    annual2026,
    annual2027,
    annualRise: cents(annual2027 - annual2026),
    notes,
  };
}

/** The page's worked example: a pension of 1.000 € a month in 14 payments. */
export const DEFAULT_INPUT: PensionInput = { monthly: 1000, payments: 14 };

/** Monthly amount of an annual figure paid in 14 payments. */
export const perMonth = (annual: number) => cents(annual / 14);
