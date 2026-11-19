import { MAX_AMOUNT, type Disability } from "@/lib/programmatic/inheritance-tax/engine";
import { cents, coefficientFor, regionalQuota } from "@/lib/programmatic/inheritance-tax/regional-engine";
import type { ScaleRow } from "@/lib/programmatic/inheritance-tax/regions/types";
import type { Group } from "@/lib/programmatic/inheritance-tax/rules";

import type { GiftKind, GiftRelation, GiftRules } from "./regions/types";

/**
 * One donee's gift tax (impuesto sobre donaciones) in Catalonia, Madrid,
 * Andalucía or the Comunitat Valenciana, step by step, from that community's
 * `GiftRules` (regions/). Pure and client-safe; the scales, coefficients and
 * rounding are the inheritance calculators' (regional-engine.ts).
 *
 *  1. Base imponible: the net value given (Ley 29/1987 art. 9.b).
 *  2. Reductions: only where the community has them (Ley 29/1987 art. 20.5):
 *     Valencia's kinship and disability ones, and the habitual-home one
 *     (Catalonia, Madrid, Andalucía). Base liquidable: what is left, never
 *     below 0.
 *  3. Cuota íntegra: the scale (Catalonia's reduced one for groups I and II
 *     with a public deed). With earlier gifts from the same donor in the three
 *     years before, the scale runs on the sum and its average rate, to two
 *     decimals, applies to this gift (Ley 29/1987 art. 30; RD 1629/1991 art.
 *     46.b).
 *  4. Cuota tributaria: × the coefficient of the group and prior wealth, less
 *     the excess-of-quota adjustment just above a bracket.
 *  5. Bonificación: the community's percentage, when the formal requirements
 *     are met (public document, origin of cash).
 *  6. To pay = cuota tributaria − bonificación.
 *
 * Euros, rounded half up to the cent at each step.
 */

export interface GiftInput {
  relation: GiftRelation;
  /** The donee's age in whole years on the day of the gift. */
  age: number;
  disability: Disability;
  /** The disability is intellectual or mental and permanently recognised (only Valencia reads it). */
  mentalDisability: boolean;
  /** The net value given: the cash, or the asset's value less the debts the donee takes on. */
  amount: number;
  kind: GiftKind;
  /** The gift is in a public document (a notarial deed) in time, as the community requires. */
  publicDeed: boolean;
  /** Cash: the document states where the money comes from and it can be justified. */
  fundsOrigin: boolean;
  /** The gift is for the donee's habitual home (cash to buy it, or the home itself), meeting the community's conditions. */
  forHome: boolean;
  /** The donee's own wealth before the gift. */
  priorWealth: number;
  /** The base liquidable of earlier gifts from the same donor to the same donee in the three years before (0 if none). */
  previousGifts: number;
}

export type GiftReductionId = "kinship" | "disability" | "home";

export interface GiftReduction {
  id: GiftReductionId;
  amount: number;
  /** The base after this reduction (never below 0). */
  after: number;
}

export type GiftNote =
  | "reduced-scale-deed"
  | "bonus-deed"
  | "bonus-funds"
  | "small-gift"
  | "reductions-deed"
  | "reductions-funds"
  | "home-kind"
  | "home-relation"
  | "home-age"
  | "home-prior"
  | "home-deed"
  | "home-capped"
  | "home-conditions"
  | "accumulated"
  | "five-years"
  | "mental-as-65"
  | "declared-on-time";

export type GiftBonusRule = "small" | "groups-i-ii" | "group-iii" | "disability" | "none";

export type GiftInvalid = "amount" | "age" | "prior" | "previous";

export interface GiftAccumulation {
  previous: number;
  /** Previous plus this gift's base liquidable. */
  theoreticalBase: number;
  theoreticalQuota: number;
  theoreticalTax: number;
  /** Two decimals: 5.4 means 5,40 %. */
  averageRate: number;
}

export interface GiftOk {
  status: "ok";
  group: Group;
  baseImposable: number;
  reductions: GiftReduction[];
  totalReductions: number;
  notes: GiftNote[];
  /** The home reduction before and after its cap (null when it does not apply). */
  home: { theoretical: number; cap: number } | null;
  baseLiquidable: number;
  scaleUsed: "general" | "reduced";
  accumulation: GiftAccumulation | null;
  /** The scale row used (on the theoretical base when accumulated). */
  row: { from: number; quota: number; rest: number; rate: number; onRest: number } | null;
  /** On the theoretical base when accumulated. */
  quotaIntegra: number;
  coefficient: number;
  excess: number;
  quotaTributaria: number;
  bonusRule: GiftBonusRule;
  bonusPct: number;
  bonus: number;
  toPay: number;
  /** Tax to pay over the base imponible, 0 to 1. */
  effectiveRate: number;
}

export type GiftResult = { status: "invalid"; reason: GiftInvalid } | GiftOk;

/** Ley 29/1987 art. 20.2.a, read for gifts: the donee's group (Catalonia, art. 631-2, the same). */
export function giftGroupOf(relation: GiftRelation, age: number): Group {
  switch (relation) {
    case "child":
    case "grandchild":
      return age < 21 ? "I" : "II";
    case "spouse":
    case "parent":
    case "grandparent":
      return "II";
    case "sibling":
    case "nephew":
    case "affinity":
      return "III";
    default:
      return "IV";
  }
}

/** Siblings, nephews, nieces, uncles and aunts by blood (second and third degree). */
const BLOOD_COLLATERALS: ReadonlySet<GiftRelation> = new Set(["sibling", "nephew"]);

/** The disability as the community reads it: Valencia counts an intellectual or mental 33 % as 65 %. */
export function giftDisability(rules: GiftRules, disability: Disability, mental: boolean): Disability {
  return disability === 33 && mental && rules.disability?.mentalFrom33As65 ? 65 : disability;
}

/** Valencia art. 10 bis.2.a. */
export function giftKinship(rules: GiftRules, relation: GiftRelation, age: number): number {
  const k = rules.kinship;
  if (!k || !k.relations.includes(relation)) return 0;
  if ((relation === "child" || relation === "grandchild") && age < 21) return Math.min(k.under21.base + k.under21.perYear * (21 - age), k.under21.max);
  return k.adult;
}

const finiteNonNegative = (n: number) => Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT;

/** The quota, coefficient and excess on a base, for a group and prior wealth. */
function taxOn(rules: GiftRules, scale: readonly ScaleRow[], base: number, group: Group, priorWealth: number) {
  const { quota, row } = regionalQuota(scale, base);
  const { coefficient, lower } = coefficientFor(rules.coefficients, group, priorWealth);
  let tax = cents(quota * coefficient);
  let excess = 0;
  if (rules.excessRule && lower && coefficient > lower.coefficient) {
    const over = cents(tax - quota * lower.coefficient - (priorWealth - lower.upTo));
    if (over > 0) {
      excess = over;
      tax = cents(tax - excess);
    }
  }
  return { quota, row, coefficient, excess, tax };
}

export function calculateGift(rules: GiftRules, input: GiftInput): GiftResult {
  const { relation, age, amount, kind, publicDeed, fundsOrigin, forHome, priorWealth, previousGifts } = input;
  if (!(finiteNonNegative(amount) && amount > 0)) return { status: "invalid", reason: "amount" };
  if (!Number.isInteger(age) || age < 0 || age > 120) return { status: "invalid", reason: "age" };
  if (!finiteNonNegative(priorWealth)) return { status: "invalid", reason: "prior" };
  if (!finiteNonNegative(previousGifts)) return { status: "invalid", reason: "previous" };

  const group = giftGroupOf(relation, age);
  const disability = giftDisability(rules, input.disability, input.mentalDisability);
  const baseImposable = cents(amount);
  /** What the donor has given in three years, this gift included: the thresholds of Madrid and Andalucía count it. */
  const threeYears = cents(amount + previousGifts);
  const notes: GiftNote[] = [];
  if (disability !== input.disability) notes.push("mental-as-65");
  const planned: { id: GiftReductionId; amount: number }[] = [];

  // Valencia: kinship and disability reductions, only with the public document and, for cash, the origin of the funds.
  if (rules.kinship || rules.disability) {
    const kinship = giftKinship(rules, relation, age);
    const d = rules.disability;
    const disabilityAmount = !d ? 0 : disability === 65 ? d.from65 : disability === 33 && d.from33Relations.includes(relation) ? d.from33 : 0;
    if (kinship > 0 || disabilityAmount > 0) {
      if (rules.reductionsNeedDeed && !publicDeed) notes.push("reductions-deed");
      else if (rules.reductionsNeedDeed && kind === "money" && !fundsOrigin) notes.push("reductions-funds");
      else {
        if (kinship > 0) planned.push({ id: "kinship", amount: kinship });
        if (disabilityAmount > 0) planned.push({ id: "disability", amount: disabilityAmount });
        notes.push("five-years");
      }
    }
  }

  // The habitual home: cash to buy it, or the home itself.
  let home: GiftOk["home"] = null;
  const h = rules.home;
  if (h && forHome) {
    const disabled = h.capDisabilityFrom !== null && disability >= h.capDisabilityFrom;
    const ageOk = h.maxAge === null || age <= h.maxAge || (h.ageWaivedFrom !== null && disability >= h.ageWaivedFrom);
    const deedNeeded = h.deedAbove !== null && h.deedKinds.includes(kind) && threeYears > h.deedAbove;
    if (!h.kinds.includes(kind)) notes.push("home-kind");
    else if (!h.relations.includes(relation)) notes.push("home-relation");
    else if (!ageOk) notes.push("home-age");
    else if (h.priorWealthMax !== null && priorWealth > h.priorWealthMax) notes.push("home-prior");
    else if (deedNeeded && !publicDeed) notes.push("home-deed");
    else {
      const cap = disabled ? h.capDisability : h.cap;
      const theoretical = cents((baseImposable * h.percent) / 100);
      const capped = h.capOn === "base" ? cents((Math.min(baseImposable, cap) * h.percent) / 100) : Math.min(theoretical, cap);
      home = { theoretical, cap };
      if (capped < theoretical) notes.push("home-capped");
      planned.push({ id: "home", amount: capped });
      notes.push("home-conditions");
    }
  }

  const reductions: GiftReduction[] = [];
  let running = baseImposable;
  for (const r of planned) {
    if (r.amount <= 0) continue;
    running = cents(Math.max(0, running - r.amount));
    reductions.push({ id: r.id, amount: r.amount, after: running });
  }
  const totalReductions = cents(reductions.reduce((s, r) => s + r.amount, 0));
  const baseLiquidable = running;

  // Catalonia art. 633-2: the reduced scale for groups I and II in a public deed.
  const groupsIandII = group === "I" || group === "II";
  const scaleUsed: GiftOk["scaleUsed"] = rules.reducedScale && groupsIandII && publicDeed ? "reduced" : "general";
  if (rules.reducedScale && groupsIandII && !publicDeed) notes.push("reduced-scale-deed");
  const scale = scaleUsed === "reduced" ? rules.reducedScale! : rules.scale;

  let accumulation: GiftAccumulation | null = null;
  let quotaTributaria: number;
  let t: ReturnType<typeof taxOn>;
  if (previousGifts > 0 && baseLiquidable > 0) {
    const theoreticalBase = cents(previousGifts + baseLiquidable);
    t = taxOn(rules, scale, theoreticalBase, group, priorWealth);
    const averageRate = cents((t.tax / theoreticalBase) * 100);
    accumulation = { previous: previousGifts, theoreticalBase, theoreticalQuota: t.quota, theoreticalTax: t.tax, averageRate };
    quotaTributaria = cents((baseLiquidable * averageRate) / 100);
    notes.push("accumulated");
  } else {
    t = taxOn(rules, scale, baseLiquidable, group, priorWealth);
    quotaTributaria = t.tax;
  }

  // The rebate.
  let bonusRule: GiftBonusRule = "none";
  let bonusPct = 0;
  const b = rules.bonus;
  if (b && quotaTributaria > 0) {
    let rule: GiftBonusRule = "none";
    let pct = 0;
    if (b.smallGiftMax !== null && threeYears <= b.smallGiftMax) {
      rule = "small";
      pct = 100;
    } else if (b.disability > 0 && disability === 65) {
      rule = "disability";
      pct = b.disability;
    } else if (groupsIandII && (b.directRelations === null || b.directRelations.includes(relation))) {
      rule = "groups-i-ii";
      pct = b.groupsIandII;
    } else if (group === "III" && b.groupIII > 0 && (b.groupIIIScope === "group" || BLOOD_COLLATERALS.has(relation))) {
      rule = "group-iii";
      pct = b.groupIII;
    }
    if (rule === "small") {
      notes.push("small-gift");
    } else if (rule !== "none") {
      const deedMissing = threeYears > b.deedAbove && !publicDeed;
      const fundsMissing = kind === "money" && threeYears > b.fundsOriginAbove && !fundsOrigin;
      // Valencia's reduction note already says the rebate goes with it.
      const said = notes.includes("reductions-deed") || notes.includes("reductions-funds");
      if (deedMissing || fundsMissing) {
        if (!said) notes.push(deedMissing ? "bonus-deed" : "bonus-funds");
        rule = "none";
      } else {
        notes.push("declared-on-time");
      }
    }
    bonusRule = rule;
    bonusPct = rule === "none" ? 0 : pct;
  }
  const bonus = cents((quotaTributaria * bonusPct) / 100);
  const toPay = cents(quotaTributaria - bonus);

  return {
    status: "ok",
    group,
    baseImposable,
    reductions,
    totalReductions,
    notes,
    home,
    baseLiquidable,
    scaleUsed,
    accumulation,
    row: t.row,
    quotaIntegra: t.quota,
    coefficient: t.coefficient,
    excess: t.excess,
    quotaTributaria,
    bonusRule,
    bonusPct,
    bonus,
    toPay,
    effectiveRate: baseImposable > 0 ? toPay / baseImposable : 0,
  };
}

/** The ok branch, for known-good inputs (the page's examples). */
export function calculateGiftOk(rules: GiftRules, input: GiftInput): GiftOk {
  const r = calculateGift(rules, input);
  if (r.status !== "ok") throw new Error(`gift-tax ${rules.id}: invalid example (${r.reason})`);
  return r;
}

/** A complete input from a few fields: cash in a public deed with the origin of the funds stated, no home purpose, no earlier gifts. */
export function giftInputOf(partial: Partial<GiftInput> & Pick<GiftInput, "relation" | "age" | "amount">): GiftInput {
  return { disability: 0, mentalDisability: false, kind: "money", publicDeed: true, fundsOrigin: true, forHome: false, priorWealth: 0, previousGifts: 0, ...partial };
}
