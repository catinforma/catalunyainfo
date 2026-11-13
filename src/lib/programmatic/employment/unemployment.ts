import { cents } from "./dates";
import {
  BENEFIT_MONTH_DAYS,
  BENEFIT_SS_RATE,
  DURATION_SCALE,
  FIRST_PERIOD_DAYS,
  IPREM_PLUS_SIXTH,
  MAX_CONTRIBUTION_BASE,
  MAX_PCT,
  MIN_CONTRIBUTED_DAYS,
  MIN_PCT,
  RATE_AFTER,
  RATE_FIRST,
} from "./rules";

/**
 * Contributory unemployment benefit (prestación por desempleo, "el paro"),
 * LGSS arts. 269–270 and 273. Pure.
 *
 *  - Duration: the art. 269.1 scale on the days contributed in the last six
 *    years and not used for an earlier benefit (360 → 120 days … 2,160 → 720).
 *  - Base reguladora: the average contribution base for unemployment over the
 *    last 180 days, overtime excluded (art. 270.1). The reader gives it as a
 *    monthly figure (the payslip's "base de contingencias profesionales" /
 *    desempleo); daily = monthly ÷ 30, which is SEPE's "suma de las bases de
 *    los últimos 180 días … dividida entre 180" for six monthly payslips.
 *    It can never exceed the 2026 maximum base (5,101.20 €/month).
 *  - Amount: 70 % of the base for the first 180 days, 60 % after (art. 270.2),
 *    between the minimum and maximum of art. 270.3 (IPREM + 1/6, by children
 *    in care), scaled by the part-time share when the job was part-time.
 *  - Deductions: the worker's Social Security share (SEPE: 4.85 % in 2026) on
 *    the base reguladora (Orden PJC/297/2026 art. 8.1: the contribution base is
 *    the base reguladora, whatever the cap on the benefit), and IRPF, which
 *    depends on the person and is not computed here.
 */

export type Children = 0 | 1 | 2;

export interface UnemploymentInput {
  /** Days contributed for unemployment in the last 6 years, not used for an earlier benefit. */
  contributedDays: number;
  /** Average monthly contribution base for unemployment over the last 180 days, €. */
  monthlyBase: number;
  /** Children in care: 0, 1, or 2 = two or more. */
  children: Children;
  /** Part-time share of a full-time job, 1–100 (100 = full time). */
  partTimePct?: number;
}

export interface BenefitPhase {
  /** First and last day of benefit of the phase (1-based). */
  fromDay: number;
  toDay: number;
  days: number;
  rate: number;
  /** 70 % or 60 % of the base, before limits, € a month. */
  raw: number;
  /** € a month (30 days) after limits. */
  monthly: number;
  limit: "max" | "min" | null;
  /** € over the whole phase. */
  total: number;
}

export interface UnemploymentResult {
  eligible: boolean;
  durationDays: number;
  /** Duration in 30-day months, one decimal. */
  durationMonths: number;
  /** The scale row used: [from days contributed, benefit days]. */
  bracket: readonly [number, number] | null;
  /** Days contributed needed for the next row of the scale, or null at the top. */
  nextBracketAt: number | null;
  baseMonthly: number;
  baseCapped: boolean;
  baseDaily: number;
  minMonthly: number;
  maxMonthly: number;
  phases: BenefitPhase[];
  total: number;
  /** Worker's Social Security share deducted each month (approx.). */
  ssMonthly: number;
}

/** Days of benefit for the days contributed (art. 269.1), 0 below 360. */
export function benefitDays(contributedDays: number): number {
  return scaleRow(contributedDays)?.[1] ?? 0;
}

function scaleRow(contributedDays: number): readonly [number, number] | null {
  let row: readonly [number, number] | null = null;
  for (const r of DURATION_SCALE) if (contributedDays >= r[0]) row = r;
  return row;
}

/** Monthly limits of art. 270.3 for the children in care and the part-time share. */
export function benefitLimits(children: Children, partTimePct = 100): { min: number; max: number } {
  const share = Math.min(100, Math.max(1, partTimePct)) / 100;
  return { min: cents(IPREM_PLUS_SIXTH * MIN_PCT[children] * share), max: cents(IPREM_PLUS_SIXTH * MAX_PCT[children] * share) };
}

export function unemploymentBenefit(input: UnemploymentInput): UnemploymentResult {
  const contributed = Math.max(0, Math.floor(input.contributedDays || 0));
  const bracket = scaleRow(contributed);
  const durationDays = bracket?.[1] ?? 0;
  const next = DURATION_SCALE.find((r) => r[0] > contributed);
  const baseCapped = input.monthlyBase > MAX_CONTRIBUTION_BASE;
  const baseMonthly = cents(Math.max(0, Math.min(input.monthlyBase || 0, MAX_CONTRIBUTION_BASE)));
  const { min, max } = benefitLimits(input.children, input.partTimePct);
  const eligible = contributed >= MIN_CONTRIBUTED_DAYS && baseMonthly > 0;

  const phases: BenefitPhase[] = [];
  if (eligible) {
    const spans: [number, number, number][] = [[1, Math.min(durationDays, FIRST_PERIOD_DAYS), RATE_FIRST]];
    if (durationDays > FIRST_PERIOD_DAYS) spans.push([FIRST_PERIOD_DAYS + 1, durationDays, RATE_AFTER]);
    for (const [fromDay, toDay, rate] of spans) {
      const raw = cents(baseMonthly * rate);
      const limit = raw > max ? "max" : raw < min ? "min" : null;
      const monthly = limit === "max" ? max : limit === "min" ? min : raw;
      const days = toDay - fromDay + 1;
      phases.push({ fromDay, toDay, days, rate, raw, monthly, limit, total: cents((monthly / BENEFIT_MONTH_DAYS) * days) });
    }
  }

  return {
    eligible,
    durationDays,
    durationMonths: Math.round((durationDays / BENEFIT_MONTH_DAYS) * 10) / 10,
    bracket,
    nextBracketAt: next ? next[0] : null,
    baseMonthly,
    baseCapped,
    baseDaily: cents(baseMonthly / BENEFIT_MONTH_DAYS),
    minMonthly: min,
    maxMonthly: max,
    phases,
    total: cents(phases.reduce((s, p) => s + p.total, 0)),
    ssMonthly: eligible ? cents(baseMonthly * BENEFIT_SS_RATE) : 0,
  };
}
