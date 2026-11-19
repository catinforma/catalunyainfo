import { DEVENGO_MAX, DEVENGO_MIN, MAX_BONUS, MAX_RATE, MAX_YEARS, NEW_TABLE_FROM, TABLES, TABLE_WINDOWS, type CoefficientTable, type TableId } from "./rules";

/**
 * The plusvalía municipal (IIVTNU) of one transfer, by both methods of the
 * Haciendas Locales act as RDL 26/2021 left it:
 *
 *  - objective (art. 107.1-4): the land's cadastral value at the devengo ×
 *    the coefficient for the full years held (the council's, never above the
 *    legal maximum for that date; under a year, the annual one prorated by
 *    full months);
 *  - real gain (arts. 104.5 and 107.5): (transfer value − acquisition value)
 *    × the land's share of the total cadastral value; if it is zero or less
 *    there is no taxable event, and if it is below the objective base the
 *    taxpayer can ask for it to be the base;
 *
 * then the council's rate (≤ 30 %, art. 108.1) and, for inheritances, the
 * council's rebate (≤ 95 %, art. 108.4). Pure and client-safe: every figure
 * comes from rules.ts.
 */

export type Kind = "sale" | "inheritance" | "gift";
export const KINDS: readonly Kind[] = ["sale", "inheritance", "gift"];

export interface PvInput {
  kind: Kind;
  /** The previous transfer: when the seller, the deceased or the donor acquired it (ISO date). */
  acquired: string;
  /** The devengo: the sale, the death or the gift (art. 109.1.a; ISO date). */
  transferred: string;
  /** Cadastral value of the land at the devengo, whole property (art. 107.2.a). */
  landValue: number;
  /** Total cadastral value (land + building), whole property; 0 when not given. Needed for the real method. */
  totalValue: number;
  /** Acquisition value (deed price, or the value declared for inheritance or gift tax); 0 when not given. */
  acquisitionValue: number;
  /** Transfer value (deed price, or the value declared for inheritance or gift tax); 0 when not given. */
  transferValue: number;
  /** The part of the property this taxpayer transfers or receives, in %. */
  sharePct: number;
  /** The council's rate, in %. */
  rate: number;
  /** The council's coefficient for this period (the annual one if under a year); null: the legal maximum. */
  councilCoefficient: number | null;
  /** The council's rebate on inheritances, in % (ignored for sales and gifts). */
  bonusPct: number;
}

export type InvalidReason = "dates" | "order" | "range" | "land" | "total" | "share" | "rate" | "coefficient" | "bonus" | "values";

export type PvNote =
  | "council-above-max"
  | "derogated-window"
  | "future-table"
  | "under-month"
  | "capped-20"
  | "real-missing"
  | "no-gain"
  | "real-lower"
  | "bonus-inheritance-only";

export interface MethodResult {
  base: number;
  cuotaIntegra: number;
  bonus: number;
  cuotaLiquida: number;
}

export interface PvOk {
  status: "ok";
  kind: Kind;
  /** Full years held (art. 107.4), before the 20-year cap. */
  years: number;
  /** Full months, when under a year. */
  months: number;
  table: CoefficientTable;
  /** The legal maximum for the period: the table's value, prorated by months under a year. */
  maxCoefficient: number;
  /** The coefficient applied: the council's (prorated) if given and lower, else the maximum. */
  coefficient: number;
  /** The council's coefficient was above the maximum and the maximum applies (art. 107.4, last paragraph). */
  councilCapped: boolean;
  /** Land value of this taxpayer's part. */
  land: number;
  objective: MethodResult;
  /** Land share of the total cadastral value (art. 104.5), 0 to 1; null without the total value. */
  landRatio: number | null;
  /** (Transfer − acquisition) × land ratio × share; null when the values were not all given. */
  realGain: number | null;
  real: MethodResult | null;
  /** No increase in value: not subject (art. 104.5), but the transfer must be declared. */
  notSubject: boolean;
  /** The method of the amount to pay. */
  chosen: "objective" | "real" | "none";
  toPay: number;
  bonusApplies: boolean;
  notes: PvNote[];
}

export type PvResult = PvOk | { status: "invalid"; reason: InvalidReason };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function parts(iso: string): [number, number, number] | null {
  if (!ISO.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return [y, m, d];
}

export function isIsoDate(iso: string): boolean {
  return parts(iso) !== null;
}

/** The same day `months` months later; the last day of the month when that day does not exist (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso: string, months: number): string {
  const p = parts(iso);
  if (!p) throw new Error(`bad date ${iso}`);
  const [y, m, d] = p;
  const total = y * 12 + (m - 1) + months;
  const ty = Math.floor(total / 12);
  const tm = total % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return `${String(ty).padStart(4, "0")}-${String(tm + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

/** Full months from `from` to `to` (art. 107.4: "meses completos"); a month is complete on the same day of the next month. */
export function fullMonths(from: string, to: string): number {
  const a = parts(from);
  const b = parts(to);
  if (!a || !b) throw new Error("bad date");
  let n = (b[0] - a[0]) * 12 + (b[1] - a[1]);
  if (n > 0 && addMonths(from, n) > to) n -= 1;
  return Math.max(0, n);
}

/** Full years held and, under a year, full months (art. 107.4: "años completos, es decir, sin tener en cuenta las fracciones de año"). */
export function periodHeld(from: string, to: string): { years: number; months: number } {
  const m = fullMonths(from, to);
  const years = Math.floor(m / 12);
  return { years, months: years === 0 ? m : 0 };
}

/** The maximum-coefficient table in force on a devengo date (TABLE_WINDOWS); null outside the engine's range. */
export function tableFor(devengo: string): CoefficientTable | null {
  const w = TABLE_WINDOWS.find((x) => devengo >= x.from && devengo <= x.to);
  return w ? TABLES[w.table] : null;
}

/** The table's annual value for a period: full years 1 to 19, 20 and over, or "under a year". */
export function tableValue(table: CoefficientTable, years: number): number {
  return table.values[Math.min(years, MAX_YEARS)]!;
}

/** Art. 107.4: under a year, the annual coefficient × full months / 12. */
export function prorate(annual: number, years: number, months: number): number {
  return years >= 1 ? annual : (annual * months) / 12;
}

function method(base: number, rate: number, bonusPct: number): MethodResult {
  const b = round2(Math.max(0, base));
  const cuotaIntegra = round2((b * rate) / 100);
  const bonus = round2((cuotaIntegra * bonusPct) / 100);
  return { base: b, cuotaIntegra, bonus, cuotaLiquida: round2(cuotaIntegra - bonus) };
}

export function calculate(input: PvInput): PvResult {
  const { kind, acquired, transferred } = input;
  if (!isIsoDate(acquired) || !isIsoDate(transferred)) return { status: "invalid", reason: "dates" };
  if (acquired >= transferred) return { status: "invalid", reason: "order" };
  if (transferred < DEVENGO_MIN || transferred > DEVENGO_MAX) return { status: "invalid", reason: "range" };
  if (!Number.isFinite(input.landValue) || input.landValue <= 0) return { status: "invalid", reason: "land" };
  if (!Number.isFinite(input.totalValue) || input.totalValue < 0 || (input.totalValue > 0 && input.totalValue < input.landValue)) return { status: "invalid", reason: "total" };
  if (!Number.isFinite(input.sharePct) || input.sharePct <= 0 || input.sharePct > 100) return { status: "invalid", reason: "share" };
  if (!Number.isFinite(input.rate) || input.rate <= 0 || input.rate > MAX_RATE) return { status: "invalid", reason: "rate" };
  if (input.councilCoefficient !== null && (!Number.isFinite(input.councilCoefficient) || input.councilCoefficient < 0 || input.councilCoefficient > 1)) return { status: "invalid", reason: "coefficient" };
  if (!Number.isFinite(input.bonusPct) || input.bonusPct < 0 || input.bonusPct > MAX_BONUS) return { status: "invalid", reason: "bonus" };
  if (!Number.isFinite(input.acquisitionValue) || !Number.isFinite(input.transferValue) || input.acquisitionValue < 0 || input.transferValue < 0) return { status: "invalid", reason: "values" };

  const notes: PvNote[] = [];
  const table = tableFor(transferred)!;
  if (table.derogatedFrom) notes.push("derogated-window");
  if (transferred >= "2027-01-01") notes.push("future-table");

  const { years, months } = periodHeld(acquired, transferred);
  if (years > MAX_YEARS) notes.push("capped-20");
  if (years === 0 && months === 0) notes.push("under-month");
  const annualMax = tableValue(table, years);
  let annual = annualMax;
  let councilCapped = false;
  if (input.councilCoefficient !== null) {
    if (input.councilCoefficient > annualMax) {
      councilCapped = true;
      notes.push("council-above-max");
    } else annual = input.councilCoefficient;
  }
  const maxCoefficient = prorate(annualMax, years, months);
  const coefficient = prorate(annual, years, months);

  const share = input.sharePct / 100;
  const land = round2(input.landValue * share);
  const bonusApplies = kind === "inheritance";
  if (!bonusApplies && input.bonusPct > 0) notes.push("bonus-inheritance-only");
  const bonusPct = bonusApplies ? input.bonusPct : 0;
  const objective = method(land * coefficient, input.rate, bonusPct);

  const landRatio = input.totalValue > 0 ? input.landValue / input.totalValue : null;
  const hasReal = landRatio !== null && input.acquisitionValue > 0 && input.transferValue > 0;
  let realGain: number | null = null;
  let real: MethodResult | null = null;
  let notSubject = false;
  if (hasReal) {
    realGain = round2((input.transferValue - input.acquisitionValue) * landRatio! * share);
    if (realGain <= 0) {
      notSubject = true;
      notes.push("no-gain");
    } else real = method(realGain, input.rate, bonusPct);
  } else notes.push("real-missing");

  let chosen: PvOk["chosen"] = "objective";
  let toPay = objective.cuotaLiquida;
  if (notSubject) {
    chosen = "none";
    toPay = 0;
  } else if (real && real.base < objective.base) {
    chosen = "real";
    toPay = real.cuotaLiquida;
    notes.push("real-lower");
  }

  return { status: "ok", kind, years, months, table, maxCoefficient, coefficient, councilCapped, land, objective, landRatio, realGain, real, notSubject, chosen, toPay, bonusApplies, notes };
}

export function calculateOk(input: PvInput): PvOk {
  const r = calculate(input);
  if (r.status !== "ok") throw new Error(`plusvalía: invalid input (${r.reason})`);
  return r;
}

/** An input with the defaults filled in (the council's rate at the legal maximum, the whole property, no rebate). */
export function inputOf(p: Partial<PvInput> & Pick<PvInput, "acquired" | "transferred" | "landValue">): PvInput {
  return { kind: "sale", totalValue: 0, acquisitionValue: 0, transferValue: 0, sharePct: 100, rate: MAX_RATE, councilCoefficient: null, bonusPct: 0, ...p };
}

/** Whether a devengo date takes the RDL 29/2026 table. */
export function isNewTable(devengo: string): boolean {
  return devengo >= NEW_TABLE_FROM;
}

export type { TableId };
