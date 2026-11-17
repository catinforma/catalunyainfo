import { inclusiveDays, isIsoDate, maxIso } from "@/lib/programmatic/employment/dates";
import { DEFAULT_INPUT as SALARY_DEFAULT, calculateNetSalary, round2, type Contract, type FamilySituation, type SalaryResult } from "@/lib/programmatic/net-salary/engine";
import { SOCIAL_SECURITY } from "@/lib/programmatic/net-salary/rules-2026";

import { EXTRA_PAY_YEAR, accrualPeriod, type Accrual } from "./rules";

/**
 * The Christmas extra pay (paga extra de Navidad) of an employee in Spain:
 * the gross amount, the part earned when the job started during the accrual
 * period, the IRPF withheld and the net. Pure and deterministic: the page
 * renders it on the server, the calculator in the browser.
 *
 *  - Amount: set by the collective agreement (ET art. 31). Unless the reader
 *    types another figure, one month's salary: the monthly gross, or the
 *    annual gross ÷ 14 (the net salary calculator's assumption too).
 *  - Earned part: full × calendar days from the later of the start date and
 *    the period's first day to its last day ÷ the period's days, like the
 *    finiquito calculator (employment/settlement.ts). The agreement may count
 *    months instead, or leave some absences out: the page says so.
 *  - IRPF: the employer applies the same rate as to every payslip (RIRPF art.
 *    82.5ª). Either the rate on the reader's payslip or the net salary
 *    engine's estimate (AEAT 2026 algorithm) on the year's gross pay.
 *  - Social Security: none in the extra pay's month. The contribution base
 *    already carries 1/12 of the extras every month (LGSS art. 147.1, Orden
 *    PJC/297/2026 art. 1.1), whether or not they are prorated on the payslip.
 */

/** "monthly": the ordinary monthly gross, without any prorated extra pay share. "annual": the yearly gross, extras included. */
export type SalaryMode = "monthly" | "annual";
export type WithholdingMode = "estimate" | "payslip";

export interface ExtraPayInput {
  mode: SalaryMode;
  salary: number;
  /** 14: the extras come in their own month; 12: prorated into the twelve monthly payslips. */
  payments: 12 | 14;
  /** Gross amount of a whole Christmas pay when the collective agreement sets another figure; 0 = one month's salary. */
  extraAmount: number;
  accrual: Accrual;
  /** First day at the company; "" when it was before the accrual period (the whole pay). */
  start: string;
  withholding: WithholdingMode;
  /** The withholding rate on the payslip, % (withholding = "payslip"). */
  rate: number;
  /** For the estimate: the net salary calculator's region, family situation, children and contract. */
  region: string;
  family: FamilySituation;
  children: number;
  contract: Contract;
}

export type ExtraPayError = "salary" | "start" | "rate" | "foral";

export interface ExtraPayResult {
  input: ExtraPayInput;
  error: ExtraPayError | null;
  /** Gross amount of a whole Christmas pay. */
  full: number;
  /** One month's ordinary gross salary (monthly mode: the salary typed; annual: what is left after the two extras, ÷ 12). */
  ordinaryMonthly: number;
  /** Gross pay over a whole year: 12 months + 2 extras (annual mode: the figure typed). */
  annualGross: number;
  period: { from: string; to: string; days: number };
  /** The days counted, from `from` to the period's end. */
  accrued: { from: string; days: number; share: number };
  /** The start date falls inside the accrual period. */
  newHire: boolean;
  /** Gross Christmas pay earned. */
  gross: number;
  rate: number | null;
  irpf: number | null;
  /** Net Christmas pay: gross − IRPF, no Social Security. */
  net: number | null;
  prorated: boolean;
  /** 12 payments: this pay's share in each monthly payslip (a whole pay ÷ 12), gross and after withholding. */
  monthlyShare: { gross: number; net: number | null } | null;
  ss: {
    /** The worker's rate on the base, %: common contingencies + unemployment + training + MEI. */
    workerRate: number;
    /** Monthly contribution base with the extras' share: annual gross ÷ 12. */
    baseMonthly: number;
    /** Over the maximum base: above it nothing more is contributed (except solidarity). */
    capped: boolean;
    /** What the worker contributes on this pay over the year, inside the monthly payslips (null when capped). */
    alreadyPaid: number | null;
  };
  /** The net salary engine's result behind the estimate (null with the payslip rate). */
  estimate: SalaryResult | null;
}

/** The worker's share of the contribution rates for this contract (6.50 % open-ended, 6.55 % fixed-term). */
export function workerRate(contract: Contract): number {
  const r = SOCIAL_SECURITY.rates;
  const unemployment = contract === "open-ended" ? r.unemploymentOpenEnded : r.unemploymentFixedTerm;
  return round2(r.commonContingencies + unemployment + r.vocationalTraining + r.intergenerationalEquity);
}

const finite = (x: number) => (Number.isFinite(x) ? x : 0);

export function calculateExtraPay(input: ExtraPayInput): ExtraPayResult {
  const salary = Math.min(Math.max(round2(finite(input.salary)), 0), 10_000_000);
  const custom = Math.min(Math.max(round2(finite(input.extraAmount)), 0), 10_000_000);
  const prorated = input.payments === 12;

  // One month's salary and the year's gross.
  let full: number;
  let annualGross: number;
  let ordinaryMonthly: number;
  if (input.mode === "monthly") {
    ordinaryMonthly = salary;
    full = custom > 0 ? custom : salary;
    annualGross = round2(salary * 12 + full * 2);
  } else {
    annualGross = salary;
    full = custom > 0 ? custom : round2(salary / 14);
    ordinaryMonthly = round2(Math.max(0, salary - full * 2) / 12);
  }

  // Accrual period and the earned part.
  const period = accrualPeriod(input.accrual);
  const periodDays = inclusiveDays(period.from, period.to);
  const start = input.start && isIsoDate(input.start) ? input.start : "";
  const from = start ? maxIso(period.from, start) : period.from;
  const newHire = Boolean(start) && start > period.from && start <= period.to;
  const days = start > period.to ? 0 : inclusiveDays(from, period.to);
  const share = periodDays > 0 ? days / periodDays : 0;
  const gross = round2(full * share);

  // Withholding.
  let estimate: SalaryResult | null = null;
  let rate: number | null = null;
  let error: ExtraPayError | null = null;
  if (input.withholding === "payslip") {
    const r = finite(input.rate);
    if (input.rate !== r || r < 0 || r > 100) error = "rate";
    else rate = round2(r);
  } else {
    estimate = calculateNetSalary({
      ...SALARY_DEFAULT,
      gross: annualGross,
      payments: input.payments,
      region: input.region,
      family: input.family,
      children: input.children,
      childrenUnder3: 0,
      contract: input.contract,
    });
    if (estimate.supported) rate = estimate.irpf.rate;
    else error = "foral";
  }
  if (!(salary > 0)) error = "salary";
  else if (input.start && (!start || start > period.to)) error = "start";

  const irpf = rate === null ? null : round2((gross * rate) / 100);
  const net = irpf === null || prorated ? null : round2(gross - irpf);
  const shareGross = round2(full / 12);
  const monthlyShare = prorated ? { gross: shareGross, net: rate === null ? null : round2(shareGross - (shareGross * rate) / 100) } : null;

  // Social Security: the base is the year's pay ÷ 12, extras included, every month.
  const wr = workerRate(input.contract);
  const baseMonthly = round2(annualGross / 12);
  const capped = baseMonthly > SOCIAL_SECURITY.maxBaseMonthly;

  return {
    input: { ...input, salary, extraAmount: custom, start },
    error,
    full,
    ordinaryMonthly,
    annualGross,
    period: { ...period, days: periodDays },
    accrued: { from, days, share },
    newHire,
    gross,
    rate,
    irpf,
    net,
    prorated,
    monthlyShare,
    ss: { workerRate: wr, baseMonthly, capped, alreadyPaid: capped ? null : round2((gross * wr) / 100) },
    estimate,
  };
}

/** The page's default example: 30,000 € a year in 14 payments, the whole year worked, Catalonia, single, no children, open-ended contract (the net salary page's example). */
export const DEFAULT_INPUT: ExtraPayInput = {
  mode: "annual",
  salary: 30000,
  payments: 14,
  extraAmount: 0,
  accrual: "annual",
  start: "",
  withholding: "estimate",
  rate: 0,
  region: SALARY_DEFAULT.region,
  family: SALARY_DEFAULT.family,
  children: SALARY_DEFAULT.children,
  contract: SALARY_DEFAULT.contract,
};

/** The worked examples' new hire: joined on 1 September of the rules year. */
export const EXAMPLE_START = `${EXTRA_PAY_YEAR}-09-01`;

/** The page's worked examples: the default, the September hire with each accrual period, and the prorated case. */
export function pageExamples(): { base: ExtraPayResult; hireAnnual: ExtraPayResult; hireSemester: ExtraPayResult; prorated: ExtraPayResult } {
  return {
    base: calculateExtraPay(DEFAULT_INPUT),
    hireAnnual: calculateExtraPay({ ...DEFAULT_INPUT, start: EXAMPLE_START, accrual: "annual" }),
    hireSemester: calculateExtraPay({ ...DEFAULT_INPUT, start: EXAMPLE_START, accrual: "semester" }),
    prorated: calculateExtraPay({ ...DEFAULT_INPUT, payments: 12 }),
  };
}
