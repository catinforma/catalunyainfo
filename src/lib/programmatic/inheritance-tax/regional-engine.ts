import { MAX_AMOUNT, groupOf, type Disability, type Relation } from "./engine";
import type { RegionRules, ScaleRow } from "./regions/types";
import type { Group } from "./rules";

/**
 * One heir's inheritance tax in Madrid, Andalucía or the Comunitat
 * Valenciana, step by step, from that community's `RegionRules` (regions/).
 * Pure and client-safe. The kinship groups are the state's (Ley 29/1987 art.
 * 20.2.a), the same as the Catalan engine's `groupOf`.
 *
 *  1. Base imponible: the heir's net share plus the life insurance on a
 *     policy the deceased took out (RD 1629/1991 art. 39.1: it accumulates).
 *  2. Reductions: kinship, disability, life insurance (spouse, descendants
 *     and ascendants), the deceased's habitual home (a percentage of the
 *     home's value in the heir's share, capped per heir). Base liquidable:
 *     what is left, never below 0.
 *  3. Cuota íntegra: the community's scale, as its table is printed: the
 *     quota of the row plus the rate on the rest.
 *  4. Cuota tributaria: × the coefficient of the group (and prior wealth),
 *     less the excess-of-quota adjustment just above a bracket.
 *  5. Bonificación: the community's percentage for the heir.
 *  6. Tax to pay = cuota tributaria − bonificación; effective rate over the
 *     base imponible.
 *
 * Euros, rounded half up to the cent at each step.
 */

export interface RegionalInput {
  relation: Relation;
  /** Age in whole years on the day of the death. */
  age: number;
  disability: Disability;
  /** The disability is intellectual or mental and permanently recognised (only Valencia reads it). */
  mentalDisability: boolean;
  /** Net share of the estate (assets less debts and deductible costs), without the life insurance. */
  share: number;
  /** Life insurance received because of this death, on a policy the deceased took out. */
  insurance: number;
  /** The whole habitual home's value (100 %); 0 if there is none in the estate. */
  homeValue: number;
  /** Part of the home the deceased owned, %. */
  homeOwnedPct: number;
  /** The heir's part of what the deceased owned, %. */
  homeHeirPct: number;
  /** For collaterals: lived with the deceased at least the two years before the death. */
  livedTogether: boolean;
  /** The heir's own wealth before the inheritance. */
  priorWealth: number;
}

export type RegionalReductionId = "kinship" | "disability" | "insurance" | "home";

export interface RegionalReduction {
  id: RegionalReductionId;
  amount: number;
  /** The base after this reduction (never below 0). */
  after: number;
}

export type RegionalNote = "insurance-relation" | "home-relation" | "home-collateral" | "home-capped" | "mental-as-65" | "declared-on-time";

export type RegionalBonusRule = "groups-i-ii" | "group-iii" | "disability" | "none";

export type RegionalInvalid = "share" | "insurance" | "nothing" | "age" | "home-value" | "home-pct" | "home-above-share" | "prior";

export interface RegionalOk {
  status: "ok";
  group: Group;
  baseImposable: number;
  reductions: RegionalReduction[];
  totalReductions: number;
  notes: RegionalNote[];
  /** The home's value in the heir's share, the percentage before the cap, and the cap (0 without a home). */
  home: { value: number; theoretical: number; cap: number };
  baseLiquidable: number;
  /** The scale row used: its start, its printed quota, the rest of the base, the rate and the tax on the rest. */
  row: { from: number; quota: number; rest: number; rate: number; onRest: number } | null;
  quotaIntegra: number;
  coefficient: number;
  /** The excess-of-quota adjustment taken off (usually 0). */
  excess: number;
  quotaTributaria: number;
  bonusRule: RegionalBonusRule;
  bonusPct: number;
  bonus: number;
  toPay: number;
  /** Tax to pay over the base imponible, 0 to 1. */
  effectiveRate: number;
}

export type RegionalResult = { status: "invalid"; reason: RegionalInvalid } | RegionalOk;

/** Half up to the cent, robust to binary noise (8.826,445 → 8.826,45). */
export const cents = (n: number): number => Math.round(Number((n * 100).toFixed(6))) / 100;

const DIRECT_LINE: ReadonlySet<Relation> = new Set(["spouse", "child", "descendant", "ascendant"]);
/** Collaterals by blood (siblings, nephews, nieces, uncles, aunts; cousins and further): the home reduction over 65 after two years together. */
const COLLATERALS: ReadonlySet<Relation> = new Set(["collateral", "distant"]);

/** The kinship reduction of the community (state's for Valencia's group III). */
export function regionalKinship(rules: RegionRules, relation: Relation, age: number): number {
  const group = groupOf(relation, age);
  const k = rules.kinship;
  if (group === "I") return Math.min(k.groupI.base + k.groupI.perYear * (21 - age), k.groupI.max);
  if (group === "II") return k.groupII;
  if (group === "III") return k.groupIII;
  return 0;
}

/** The disability degree as the community reads it: Valencia counts an intellectual or mental 33 % as 65 %. */
export function effectiveDisability(rules: RegionRules, disability: Disability, mental: boolean): Disability {
  return disability === 33 && mental && rules.disability.mentalFrom33As65 ? 65 : disability;
}

/** The scale as printed: the row's quota plus the rate on the rest of the base. */
export function regionalQuota(scale: readonly ScaleRow[], base: number): { quota: number; row: RegionalOk["row"] } {
  if (!(base > 0)) return { quota: 0, row: null };
  let row = scale[0]!;
  for (const r of scale) if (r.from < base) row = r;
  const rest = cents(base - row.from);
  const onRest = cents((rest * row.rate) / 100);
  return { quota: cents(row.quota + onRest), row: { from: row.from, quota: row.quota, rest, rate: row.rate, onRest } };
}

/** The coefficient of the group and prior wealth, and the bracket below for the excess rule. */
export function regionalCoefficient(rules: RegionRules, group: Group, priorWealth: number): { coefficient: number; lower: { coefficient: number; upTo: number } | null } {
  const pick = (row: RegionRules["coefficients"][number]) => (group === "III" ? row.groupIII : group === "IV" ? row.groupIV : row.groupsIandII);
  const index = rules.coefficients.findIndex((row) => row.upTo === null || priorWealth <= row.upTo);
  const row = rules.coefficients[index]!;
  const below = index > 0 ? rules.coefficients[index - 1]! : null;
  return { coefficient: pick(row), lower: below ? { coefficient: pick(below), upTo: below.upTo! } : null };
}

/** Which rebate the heir gets, and its percentage. */
export function regionalBonus(rules: RegionRules, relation: Relation, group: Group, disability: Disability): { rule: RegionalBonusRule; pct: number } {
  if (rules.bonus.disability > 0 && disability === 65) return { rule: "disability", pct: rules.bonus.disability };
  if (group === "I" || group === "II") return { rule: "groups-i-ii", pct: rules.bonus.groupsIandII };
  if (group === "III" && rules.bonus.groupIII > 0 && (rules.bonus.groupIIIScope === "group" || relation === "collateral")) return { rule: "group-iii", pct: rules.bonus.groupIII };
  return { rule: "none", pct: 0 };
}

const finiteNonNegative = (n: number) => Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT;

export function calculateRegional(rules: RegionRules, input: RegionalInput): RegionalResult {
  const { relation, age, share, insurance, homeValue, homeOwnedPct, homeHeirPct, livedTogether, priorWealth } = input;
  if (!finiteNonNegative(share)) return { status: "invalid", reason: "share" };
  if (!finiteNonNegative(insurance)) return { status: "invalid", reason: "insurance" };
  if (!(share + insurance > 0)) return { status: "invalid", reason: "nothing" };
  if (!Number.isInteger(age) || age < 0 || age > 120) return { status: "invalid", reason: "age" };
  if (!finiteNonNegative(homeValue)) return { status: "invalid", reason: "home-value" };
  if (homeValue > 0 && !(homeOwnedPct > 0 && homeOwnedPct <= 100 && homeHeirPct > 0 && homeHeirPct <= 100)) return { status: "invalid", reason: "home-pct" };
  const homeInShare = homeValue > 0 ? cents((homeValue * homeOwnedPct * homeHeirPct) / 10_000) : 0;
  if (homeInShare > share + 0.005) return { status: "invalid", reason: "home-above-share" };
  if (!finiteNonNegative(priorWealth)) return { status: "invalid", reason: "prior" };

  const group = groupOf(relation, age);
  const disability = effectiveDisability(rules, input.disability, input.mentalDisability);
  const baseImposable = cents(share + insurance);
  const notes: RegionalNote[] = [];
  if (disability !== input.disability) notes.push("mental-as-65");
  const planned: { id: RegionalReductionId; amount: number }[] = [{ id: "kinship", amount: regionalKinship(rules, relation, age) }];

  const disabilityAmount = disability === 65 ? rules.disability.from65 : disability === 33 ? rules.disability.from33 : 0;
  if (disabilityAmount > 0) planned.push({ id: "disability", amount: disabilityAmount });

  if (insurance > 0) {
    if (DIRECT_LINE.has(relation)) planned.push({ id: "insurance", amount: Math.min(insurance, rules.insurance.max) });
    else notes.push("insurance-relation");
  }

  const home = { value: homeInShare, theoretical: 0, cap: 0 };
  if (homeInShare > 0) {
    const eligible = DIRECT_LINE.has(relation) || (COLLATERALS.has(relation) && age > 65 && livedTogether);
    if (eligible) {
      home.theoretical = cents((homeInShare * rules.home.percent) / 100);
      home.cap = rules.home.capPerHeir;
      if (home.theoretical > home.cap) notes.push("home-capped");
      planned.push({ id: "home", amount: Math.min(home.theoretical, home.cap) });
    } else {
      notes.push(COLLATERALS.has(relation) ? "home-collateral" : "home-relation");
    }
  }

  const reductions: RegionalReduction[] = [];
  let running = baseImposable;
  for (const r of planned) {
    if (r.amount <= 0) continue;
    running = cents(Math.max(0, running - r.amount));
    reductions.push({ id: r.id, amount: r.amount, after: running });
  }
  const totalReductions = cents(reductions.reduce((s, r) => s + r.amount, 0));
  const baseLiquidable = running;

  const { quota: quotaIntegra, row } = regionalQuota(rules.scale, baseLiquidable);
  const { coefficient, lower } = regionalCoefficient(rules, group, priorWealth);
  let quotaTributaria = cents(quotaIntegra * coefficient);
  let excess = 0;
  if (rules.excessRule && lower && coefficient > lower.coefficient) {
    const over = cents(quotaTributaria - quotaIntegra * lower.coefficient - (priorWealth - lower.upTo));
    if (over > 0) {
      excess = over;
      quotaTributaria = cents(quotaTributaria - excess);
    }
  }

  const { rule: bonusRule, pct: bonusPct } = regionalBonus(rules, relation, group, disability);
  const bonus = cents((quotaTributaria * bonusPct) / 100);
  const toPay = cents(quotaTributaria - bonus);
  // Madrid's group III and every Valencian rebate are only on the tax of what is declared on time.
  if (bonus > 0 && (rules.id === "valencia" || (rules.id === "madrid" && bonusRule === "group-iii"))) notes.push("declared-on-time");

  return {
    status: "ok",
    group,
    baseImposable,
    reductions,
    totalReductions,
    notes,
    home,
    baseLiquidable,
    row,
    quotaIntegra,
    coefficient,
    excess,
    quotaTributaria,
    bonusRule,
    bonusPct,
    bonus,
    toPay,
    effectiveRate: baseImposable > 0 ? toPay / baseImposable : 0,
  };
}

/** The ok branch, for known-good inputs (the page's examples). */
export function calculateRegionalOk(rules: RegionRules, input: RegionalInput): RegionalOk {
  const r = calculateRegional(rules, input);
  if (r.status !== "ok") throw new Error(`inheritance-tax ${rules.id}: invalid example (${r.reason})`);
  return r;
}

/** A complete input from a few fields: no home, no insurance, no disability, no prior wealth. */
export function regionalInputOf(partial: Partial<RegionalInput> & Pick<RegionalInput, "relation" | "age" | "share">): RegionalInput {
  return { disability: 0, mentalDisability: false, insurance: 0, homeValue: 0, homeOwnedPct: 100, homeHeirPct: 100, livedTogether: false, priorWealth: 0, ...partial };
}
