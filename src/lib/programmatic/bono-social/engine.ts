import { IPREM_14 } from "@/lib/programmatic/iprem/rules";

import {
  BASE_MULTIPLIER,
  CAP_ROWS,
  DISCOUNT_2026,
  KWH_CAP,
  KWH_CAP_MONTHLY,
  PERMANENT_DISCOUNT,
  PER_EXTRA_ADULT,
  PER_MINOR,
  SEVERE_LARGE_FAMILY_MULTIPLIER,
  SEVERE_PENSION_MULTIPLIER,
  SEVERE_SHARE,
  SPECIAL_BONUS,
  type CapRow,
  type Severity,
} from "./rules";

/**
 * Who qualifies for the bono social eléctrico (RD 897/2017 arts. 3 and 4) and
 * what it gives (art. 6.3, RDL 7/2026 art. 1, Annex I), as arithmetic. Pure
 * and client-safe.
 *
 *  - Vulnerable: household income at or below the threshold, or a large-
 *    family title, or every member with income a minimum pensioner, or an
 *    IMV beneficiary in the household. Threshold = (1.5 + 0.3 per further
 *    adult + 0.5 per minor, + 1 with any special circumstance) × 8,400 €.
 *  - Severely vulnerable: income at or below half of that threshold, or at
 *    or below 1 × IPREM for minimum pensioners, or 2 × IPREM for large
 *    families (art. 3.4). Without an income figure a household that qualifies
 *    by title, pension or IMV is vulnerable and its severity is unknown.
 *  - At risk of social exclusion: severely vulnerable and the regional or
 *    local social services pay at least half of the bill (art. 4).
 *  - kWh with the discount: the Annex I row the household fits, the most
 *    favourable when several do (MITECO).
 *
 * Amounts in euros, rounded to the cent.
 */

export type SpecialId = "disability" | "gender-violence" | "terrorism" | "dependency" | "single-parent" | "electro-dependency";
export const SPECIAL_IDS: readonly SpecialId[] = ["disability", "gender-violence", "terrorism", "dependency", "single-parent", "electro-dependency"];

/** "pvpc": the regulated tariff, which only a reference supplier sells; "free": a free-market contract; "unsure". */
export type Tariff = "pvpc" | "free" | "unsure";

export interface BonoInput {
  /** Adults living in the home and in the household (unidad de convivencia), the contract holder included. */
  adults: number;
  /** Minors in the household. */
  minors: number;
  /** Yearly income of the whole household (base imponible general + del ahorro), or null when not given. */
  income: number | null;
  largeFamily: boolean;
  /** Every member with income is a Social Security pensioner (retirement or permanent incapacity) on the minimum amount, other income ≤ 500 € a year. */
  minimumPension: boolean;
  /** Someone in the household receives the Ingreso Mínimo Vital. */
  imv: boolean;
  special: readonly SpecialId[];
  /** The regional or local social services pay at least 50 % of the bill. */
  socialServices: boolean;
  tariff: Tariff;
}

export type Route = "income" | "large-family" | "minimum-pension" | "imv";
export type Category = "none" | "vulnerable" | "severe" | "exclusion";
export type InvalidReason = "adults" | "minors" | "income" | "income-needed" | "single-parent";

export interface Thresholds {
  /** Art. 3.2.a multiplier of the IPREM (14 payments), with the special +1 when it applies. */
  multiplier: number;
  /** Income up to which the household is vulnerable by income. */
  vulnerable: number;
  /** Income up to which it is severely vulnerable (the highest limit that applies to it). */
  severe: number;
}

export type BonoResult =
  | { status: "invalid"; reason: InvalidReason }
  | {
      status: "ok";
      category: Category;
      /** The criteria of art. 3.2 the household meets. */
      routes: Route[];
      thresholds: Thresholds;
      special: boolean;
      /** Qualifies by title, pension or IMV without an income figure: severity not known. */
      severityUnknown: boolean;
      /** The discount until 31 Dec 2026 and the permanent one, for the category (null when none). */
      discount2026: number | null;
      discountPermanent: number | null;
      cap: { row: CapRow; yearly: number; monthly: number };
      /** Meets the requirements but is not (or may not be) on the PVPC with a reference supplier. */
      needsPvpc: boolean;
      /** Ticked the social services box without being severely vulnerable. */
      socialServicesIgnored: boolean;
    };

/** Most people one household types; a guard against typos, not a legal limit. */
export const MAX_MEMBERS = 20;

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
/** Multipliers in tenths, so 1.5 + 0.3 + 0.5 is 2.3 and not 2.3000000000000003. */
const tenth = (n: number): number => Math.round(n * 10) / 10;

/** Art. 3.2.a and 3.3: the IPREM multiplier for a household. */
export function multiplierFor(adults: number, minors: number, special: boolean): number {
  return tenth(BASE_MULTIPLIER + PER_EXTRA_ADULT * (adults - 1) + PER_MINOR * minors + (special ? SPECIAL_BONUS : 0));
}

/** The vulnerable and severe income limits of a household (art. 3.2.a, 3.3 and 3.4). */
export function thresholdsFor(input: Pick<BonoInput, "adults" | "minors" | "largeFamily" | "minimumPension"> & { special: boolean }): Thresholds {
  const multiplier = multiplierFor(input.adults, input.minors, input.special);
  const vulnerable = round2(multiplier * IPREM_14);
  const limits = [round2(vulnerable * SEVERE_SHARE)];
  if (input.minimumPension) limits.push(SEVERE_PENSION_MULTIPLIER * IPREM_14);
  if (input.largeFamily) limits.push(SEVERE_LARGE_FAMILY_MULTIPLIER * IPREM_14);
  return { multiplier, vulnerable, severe: Math.max(...limits) };
}

/** Annex I.2: the rows a household fits; the most favourable applies (MITECO FAQ). */
export function capRowFor(adults: number, minors: number, largeFamily: boolean, minimumPension: boolean): CapRow {
  const n = adults + minors;
  const rows: CapRow[] = ["one-two"];
  if (n === 3 || (n === 2 && minors === 1) || minimumPension) rows.push("three");
  if (n === 4 || (n === 3 && minors === 2)) rows.push("four");
  if (n >= 5 || (n === 4 && minors === 3) || largeFamily) rows.push("five");
  return rows.reduce((best, r) => (CAP_ROWS.indexOf(r) > CAP_ROWS.indexOf(best) ? r : best));
}

const isCount = (n: number, min: number) => Number.isInteger(n) && n >= min && n <= MAX_MEMBERS;

export function check(input: BonoInput): BonoResult {
  const { adults, minors, income } = input;
  if (!isCount(adults, 1)) return { status: "invalid", reason: "adults" };
  if (!isCount(minors, 0) || adults + minors > MAX_MEMBERS) return { status: "invalid", reason: "minors" };
  if (income !== null && (!Number.isFinite(income) || income < 0)) return { status: "invalid", reason: "income" };
  const special = new Set(input.special);
  // Art. 3.3.e: one parent and at least one minor.
  if (special.has("single-parent") && minors < 1) return { status: "invalid", reason: "single-parent" };

  const routesWithoutIncome: Route[] = [];
  if (input.largeFamily) routesWithoutIncome.push("large-family");
  if (input.minimumPension) routesWithoutIncome.push("minimum-pension");
  if (input.imv) routesWithoutIncome.push("imv");
  if (income === null && routesWithoutIncome.length === 0) return { status: "invalid", reason: "income-needed" };

  const hasSpecial = special.size > 0;
  const thresholds = thresholdsFor({ adults, minors, largeFamily: input.largeFamily, minimumPension: input.minimumPension, special: hasSpecial });
  const routes: Route[] = [];
  if (income !== null && income <= thresholds.vulnerable) routes.push("income");
  routes.push(...routesWithoutIncome);

  let severity: Severity | null = null;
  if (routes.length > 0) severity = income !== null && income <= thresholds.severe ? "severe" : "vulnerable";
  const category: Category = severity === null ? "none" : severity === "severe" && input.socialServices ? "exclusion" : severity;
  const row = capRowFor(adults, minors, input.largeFamily, input.minimumPension);

  return {
    status: "ok",
    category,
    routes,
    thresholds,
    special: hasSpecial,
    severityUnknown: severity !== null && income === null,
    discount2026: severity ? DISCOUNT_2026.rate[severity] : null,
    discountPermanent: severity ? PERMANENT_DISCOUNT[severity] : null,
    cap: { row, yearly: KWH_CAP[row], monthly: KWH_CAP_MONTHLY[row] },
    needsPvpc: severity !== null && input.tariff !== "pvpc",
    socialServicesIgnored: input.socialServices && severity !== "severe",
  };
}

/** The ok branch, for callers that pass known-good inputs (the page's tables and examples). */
export function checkOk(input: BonoInput): Extract<BonoResult, { status: "ok" }> {
  const r = check(input);
  if (r.status !== "ok") throw new Error(`bono-social: invalid example (${r.reason})`);
  return r;
}

/** A plain household: no title, pension, IMV, special circumstance or social services; on the PVPC. */
export function household(adults: number, minors: number, income: number | null, extra: Partial<BonoInput> = {}): BonoInput {
  return { adults, minors, income, largeFamily: false, minimumPension: false, imv: false, special: [], socialServices: false, tariff: "pvpc", ...extra };
}
