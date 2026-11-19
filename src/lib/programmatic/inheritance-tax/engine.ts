import {
  BONUS_GROUP_I,
  BONUS_GROUP_II,
  COEFFICIENTS,
  DISABILITY,
  ELDERLY,
  GROUP_I_AGE_LIMIT,
  HOME,
  INSURANCE,
  KINSHIP,
  KINSHIP_GROUP_I,
  SCALE,
  SPOUSE_BONUS,
  type BonusSlice,
  type Group,
} from "./rules";

/**
 * The Catalan inheritance tax of one heir (Codi tributari de Catalunya,
 * llibre sisè, arts. 631-2 to 633-4), step by step. Pure and client-safe.
 *
 *  1. Base imposable: the heir's net share plus the life insurance paid by the
 *     death when the deceased took the policy out (it is added to the
 *     hereditary portion, ATC).
 *  2. Reductions, in this order: kinship (631-2), disability (631-3) or 75 and
 *     over (631-4, never both: the larger), life insurance (631-5), the
 *     deceased's habitual home (631-17, 631-18.2). Base liquidable: what is
 *     left, never below 0.
 *  3. Quota íntegra: the scale of 633-1 on the base liquidable.
 *  4. Quota tributària: × the coefficient of 633-3 (group and prior wealth),
 *     less the "excés de quota" of Llei 29/1987 art. 22.2 (groups I-II).
 *  5. Bonificació (633-4): 99 % for a spouse or stable partner; for the rest
 *     of groups I and II, the weighted average of the slices of the base
 *     imposable, with two decimals by the rounding of 633-4.5.
 *  6. Tax to pay = quota tributària − bonificació; effective rate over the
 *     base imposable.
 *
 * Amounts in euros, rounded to the cent at each step, as the ATC's examples.
 */

/** Who the heir was to the deceased; the group follows (with the age for descendants). */
export type Relation =
  /** Spouse or stable partner (634-1). */
  | "spouse"
  /** Son or daughter, also the spouse's or partner's child (634-2) and a fostered child (634-3). */
  | "child"
  /** Grandchild and further descendants. */
  | "descendant"
  /** Parent, grandparent; also the parent's spouse or partner (634-2) and a foster parent. */
  | "ascendant"
  /** Sibling, nephew or niece, uncle or aunt (blood collaterals of the second and third degree). */
  | "collateral"
  /** Relatives by marriage: parents-in-law, son- or daughter-in-law, the spouse's siblings, nephews, nieces, uncles, aunts. */
  | "affinity"
  /** Cousins and more distant collaterals (group IV). */
  | "distant"
  /** No family relation (group IV). */
  | "unrelated";

export const RELATIONS: readonly Relation[] = ["spouse", "child", "descendant", "ascendant", "collateral", "affinity", "distant", "unrelated"];

export type Disability = 0 | 33 | 65;

export interface IsdInput {
  relation: Relation;
  /** Heir's age in whole years on the day of the death. */
  age: number;
  disability: Disability;
  /** The heir's net share of the estate (assets less debts and deductible expenses), without the life insurance. */
  share: number;
  /** Life insurance received because of this death, on a policy the deceased took out. */
  insurance: number;
  /** Value of the deceased's habitual home (the whole home, 100 %); 0 if there is none in the estate. */
  homeValue: number;
  /** Part of the home the deceased owned, in % (100 if all of it). */
  homeOwnedPct: number;
  /** The heir's part of what the deceased owned of the home, in %. */
  homeHeirPct: number;
  /** For collaterals: lived with the deceased at least the two years before the death (631-18.2). */
  livedTogether: boolean;
  /** The heir's own wealth before the inheritance (patrimoni preexistent). */
  priorWealth: number;
}

export type ReductionId = "kinship" | "disability" | "elderly" | "insurance" | "home";

export interface AppliedReduction {
  id: ReductionId;
  amount: number;
  /** The base after this reduction (never below 0). */
  after: number;
}

/** What the result notes about a reduction: not applied (and why), or capped. */
export type IsdNote =
  | "elderly-with-disability"
  | "insurance-relation"
  | "home-relation"
  | "home-collateral"
  | "home-capped";

export type BonusRule = "spouse" | "group-i" | "group-ii" | "none";

export interface ScaleSlice {
  from: number;
  to: number;
  rate: number;
  amount: number;
}

export type InvalidReason = "share" | "insurance" | "nothing" | "age" | "home-value" | "home-pct" | "home-above-share" | "prior";

export interface IsdOk {
  status: "ok";
  group: Group;
  baseImposable: number;
  reductions: AppliedReduction[];
  totalReductions: number;
  notes: IsdNote[];
  /** The home's value in this heir's share and the 95 % before the cap (0 when there is no home). */
  home: { value: number; theoretical: number; cap: number };
  baseLiquidable: number;
  slices: ScaleSlice[];
  quotaIntegra: number;
  coefficient: number;
  /** The "excés de quota" taken off (Llei 29/1987 art. 22.2), usually 0. */
  excess: number;
  quotaTributaria: number;
  bonusRule: BonusRule;
  /** Percentage, two decimals (59.17 means 59.17 %). */
  bonusPct: number;
  bonus: number;
  toPay: number;
  /** Tax to pay over the base imposable, 0 to 1. */
  effectiveRate: number;
}

export type IsdResult = { status: "invalid"; reason: InvalidReason } | IsdOk;

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Highest amount the form accepts; a guard against typos, not a legal limit. */
export const MAX_AMOUNT = 1_000_000_000;

/** The kinship group of 631-2. Descendants under 21 are group I; the spouse is always group II. */
export function groupOf(relation: Relation, age: number): Group {
  switch (relation) {
    case "child":
    case "descendant":
      return age < GROUP_I_AGE_LIMIT ? "I" : "II";
    case "spouse":
    case "ascendant":
      return "II";
    case "collateral":
    case "affinity":
      return "III";
    default:
      return "IV";
  }
}

/** Art. 631-2. */
export function kinshipReduction(relation: Relation, age: number): number {
  const group = groupOf(relation, age);
  if (group === "I") return Math.min(KINSHIP_GROUP_I.base + KINSHIP_GROUP_I.perYear * (GROUP_I_AGE_LIMIT - age), KINSHIP_GROUP_I.max);
  if (group === "III") return KINSHIP.groupIII;
  if (group === "IV") return KINSHIP.groupIV;
  if (relation === "spouse") return KINSHIP.spouse;
  if (relation === "child") return KINSHIP.child;
  if (relation === "descendant") return KINSHIP.descendant;
  return KINSHIP.ascendant;
}

/** Spouse, descendants and ascendants: the life-insurance reduction (631-5) and the home without conditions (631-17). */
const DIRECT_LINE: ReadonlySet<Relation> = new Set(["spouse", "child", "descendant", "ascendant"]);
/** Collaterals by blood: the home reduction only over 65 and two years living together (631-18.2). */
const COLLATERALS: ReadonlySet<Relation> = new Set(["collateral", "distant"]);

/** Art. 633-1 on a base liquidable: the quota and the slices that make it up. */
export function scaleQuota(base: number): { quota: number; slices: ScaleSlice[] } {
  const slices: ScaleSlice[] = [];
  for (let i = 0; i < SCALE.length; i++) {
    const row = SCALE[i]!;
    const next = SCALE[i + 1]?.from ?? Infinity;
    if (base <= row.from) break;
    const to = Math.min(base, next);
    slices.push({ from: row.from, to, rate: row.rate, amount: round2(((to - row.from) * row.rate) / 100) });
  }
  return { quota: round2(slices.reduce((s, x) => s + x.amount, 0)), slices };
}

/** Art. 633-3: the coefficient and, for the excess rule, the coefficient and upper limit of the bracket below. */
export function coefficientOf(group: Group, priorWealth: number): { coefficient: number; lower: { coefficient: number; upTo: number } | null } {
  const pick = (row: (typeof COEFFICIENTS)[number]) => (group === "III" ? row.groupIII : group === "IV" ? row.groupIV : row.groupsIandII);
  const index = COEFFICIENTS.findIndex((row) => row.upTo === null || priorWealth <= row.upTo);
  const row = COEFFICIENTS[index]!;
  const below = index > 0 ? COEFFICIENTS[index - 1]! : null;
  return { coefficient: pick(row), lower: below ? { coefficient: pick(below), upTo: below.upTo! } : null };
}

/**
 * Art. 633-4.2 and .5: the weighted average bonus over the slices of the base
 * imposable, kept to two decimals: the thousandth up to 5 keeps the
 * hundredth, above 5 rounds it up.
 */
export function weightedBonus(table: readonly BonusSlice[], baseImposable: number): number {
  if (!(baseImposable > 0)) return 0;
  let weighted = 0;
  for (const slice of table) {
    if (baseImposable <= slice.from) break;
    const top = slice.width === null ? baseImposable : Math.min(baseImposable, slice.from + slice.width);
    weighted += (top - slice.from) * slice.marginal;
  }
  const thousandths = Math.floor((weighted / baseImposable) * 1000 + 1e-7);
  const hundredths = Math.floor(thousandths / 10) + (thousandths % 10 > 5 ? 1 : 0);
  return hundredths / 100;
}

const finiteNonNegative = (n: number) => Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT;

export function calculate(input: IsdInput): IsdResult {
  const { relation, age, disability, share, insurance, homeValue, homeOwnedPct, homeHeirPct, livedTogether, priorWealth } = input;
  if (!finiteNonNegative(share)) return { status: "invalid", reason: "share" };
  if (!finiteNonNegative(insurance)) return { status: "invalid", reason: "insurance" };
  if (!(share + insurance > 0)) return { status: "invalid", reason: "nothing" };
  if (!Number.isInteger(age) || age < 0 || age > 120) return { status: "invalid", reason: "age" };
  if (!finiteNonNegative(homeValue)) return { status: "invalid", reason: "home-value" };
  if (homeValue > 0 && !(homeOwnedPct > 0 && homeOwnedPct <= 100 && homeHeirPct > 0 && homeHeirPct <= 100)) return { status: "invalid", reason: "home-pct" };
  const homeInShare = homeValue > 0 ? round2((homeValue * homeOwnedPct * homeHeirPct) / 10_000) : 0;
  if (homeInShare > share + 0.005) return { status: "invalid", reason: "home-above-share" };
  if (!finiteNonNegative(priorWealth)) return { status: "invalid", reason: "prior" };

  const group = groupOf(relation, age);
  const baseImposable = round2(share + insurance);
  const notes: IsdNote[] = [];
  const planned: { id: ReductionId; amount: number }[] = [];

  planned.push({ id: "kinship", amount: kinshipReduction(relation, age) });

  // 631-3 and 631-4: incompatible, so the larger of the two (the ATC lets the heir choose).
  const disabilityAmount = disability === 65 ? DISABILITY.from65 : disability === 33 ? DISABILITY.from33 : 0;
  const elderlyAmount = group === "II" && age >= ELDERLY.age ? ELDERLY.amount : 0;
  if (disabilityAmount > 0 && disabilityAmount >= elderlyAmount) {
    planned.push({ id: "disability", amount: disabilityAmount });
    if (elderlyAmount > 0) notes.push("elderly-with-disability");
  } else if (elderlyAmount > 0) {
    planned.push({ id: "elderly", amount: elderlyAmount });
  }

  if (insurance > 0) {
    if (DIRECT_LINE.has(relation)) planned.push({ id: "insurance", amount: Math.min(insurance, INSURANCE.max) });
    else notes.push("insurance-relation");
  }

  const home = { value: homeInShare, theoretical: 0, cap: 0 };
  if (homeInShare > 0) {
    const eligible = DIRECT_LINE.has(relation) || (COLLATERALS.has(relation) && age > HOME.collateralAgeOver && livedTogether);
    if (eligible) {
      home.theoretical = round2((homeInShare * HOME.percent) / 100);
      home.cap = round2(Math.max((HOME.sharedCap * homeOwnedPct * homeHeirPct) / 10_000, HOME.individualFloor));
      if (home.theoretical > home.cap) notes.push("home-capped");
      planned.push({ id: "home", amount: Math.min(home.theoretical, home.cap) });
    } else {
      notes.push(COLLATERALS.has(relation) ? "home-collateral" : "home-relation");
    }
  }

  const reductions: AppliedReduction[] = [];
  let running = baseImposable;
  for (const r of planned) {
    if (r.amount <= 0) continue;
    running = round2(Math.max(0, running - r.amount));
    reductions.push({ id: r.id, amount: r.amount, after: running });
  }
  const totalReductions = round2(reductions.reduce((s, r) => s + r.amount, 0));
  const baseLiquidable = running;

  const { quota: quotaIntegra, slices } = scaleQuota(baseLiquidable);
  const { coefficient, lower } = coefficientOf(group, priorWealth);
  let quotaTributaria = round2(quotaIntegra * coefficient);
  let excess = 0;
  if (lower && coefficient > lower.coefficient) {
    const over = round2(quotaTributaria - quotaIntegra * lower.coefficient - (priorWealth - lower.upTo));
    if (over > 0) {
      excess = over;
      quotaTributaria = round2(quotaTributaria - excess);
    }
  }

  let bonusRule: BonusRule = "none";
  let bonusPct = 0;
  if (relation === "spouse") {
    bonusRule = "spouse";
    bonusPct = SPOUSE_BONUS;
  } else if (group === "I") {
    bonusRule = "group-i";
    bonusPct = weightedBonus(BONUS_GROUP_I, baseImposable);
  } else if (group === "II") {
    bonusRule = "group-ii";
    bonusPct = weightedBonus(BONUS_GROUP_II, baseImposable);
  }
  const bonus = round2((quotaTributaria * bonusPct) / 100);
  const toPay = round2(quotaTributaria - bonus);

  return {
    status: "ok",
    group,
    baseImposable,
    reductions,
    totalReductions,
    notes,
    home,
    baseLiquidable,
    slices,
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

/** The ok branch, for callers that pass known-good inputs (the page's examples). */
export function calculateOk(input: IsdInput): IsdOk {
  const r = calculate(input);
  if (r.status !== "ok") throw new Error(`inheritance-tax: invalid example (${r.reason})`);
  return r;
}

/** A complete input from a few fields: no home, no insurance, no disability, no prior wealth. */
export function inputOf(partial: Partial<IsdInput> & Pick<IsdInput, "relation" | "age" | "share">): IsdInput {
  return { disability: 0, insurance: 0, homeValue: 0, homeOwnedPct: 100, homeHeirPct: 100, livedTogether: false, priorWealth: 0, ...partial };
}
