/**
 * The shape of one community's inheritance tax rules (Madrid, Andalucía,
 * Comunitat Valenciana), read by the regional engine. Numbers only, small
 * and client-safe: the page passes one community's `RegionRules` to the
 * calculator as a prop. Quotes, sources and page words live beside each
 * community's rules (madrid.ts, andalucia.ts, valencia.ts) and stay on the
 * server.
 */

export type RegionId = "madrid" | "andalucia" | "valencia";
export const REGION_IDS: readonly RegionId[] = ["madrid", "andalucia", "valencia"];

/** The registry ids of the three calculators (calculators/paths.ts). */
export type RegionCalculatorId = "inheritance-tax-madrid" | "inheritance-tax-andalucia" | "inheritance-tax-valencia";

/** A row of a scale as the bulletins print it: from `from` of base liquidable, the quota `quota`, then `rate` % on the rest. */
export interface ScaleRow {
  from: number;
  quota: number;
  rate: number;
}

/** A prior-wealth bracket (upper limit inclusive; null: no limit) and the coefficient of each kinship group. */
export interface CoefficientRow {
  upTo: number | null;
  groupsIandII: number;
  groupIII: number;
  groupIV: number;
}

/** Whose rule a figure is: the community's own, or the state's (Ley 29/1987 art. 20.2) because the community has none. */
export type RuleOrigin = "region" | "state";

/** Which law and article a step cites. */
export type LawId = "madrid" | "andalucia" | "valencia" | "lisd" | "risd" | "lofca";
export interface Cite {
  law: LawId;
  art: string;
}

export interface RegionRules {
  id: RegionId;
  calculatorId: RegionCalculatorId;
  /** The latest change of the rules the calculator applies: it is for deaths on or after this day. */
  deathsFrom: string;
  kinship: {
    /** Group I: `base` plus `perYear` for each year under 21, at most `max`. */
    groupI: { base: number; perYear: number; max: number };
    groupII: number;
    groupIII: number;
    groupIIIOrigin: RuleOrigin;
  };
  disability: {
    from33: number;
    from65: number;
    /** Valencia: an intellectual or mental disability of 33 % or more, permanently recognised, counts as 65 %. */
    mentalFrom33As65: boolean;
  };
  insurance: { max: number; origin: RuleOrigin };
  home: { percent: number; capPerHeir: number; capOrigin: RuleOrigin; keepYears: number };
  scale: readonly ScaleRow[];
  coefficients: readonly CoefficientRow[];
  /** Whether the excess-of-quota rule applies just above a prior-wealth bracket (only with more than one bracket). */
  excessRule: boolean;
  bonus: {
    groupsIandII: number;
    groupIII: number;
    /** "group": the whole of group III; "blood-collaterals": only siblings, nephews, nieces, uncles and aunts by blood. */
    groupIIIScope: "group" | "blood-collaterals";
    /** Valencia: 99 % for heirs with 65 % disability or more (or intellectual/mental 33 %), whatever the group; 0 elsewhere. */
    disability: number;
  };
  cite: {
    kinship: Cite;
    groupIII: Cite;
    disability: Cite;
    insurance: Cite;
    home: Cite;
    scale: Cite;
    coefficient: Cite;
    excess: Cite;
    bonus: Cite;
    partners: Cite;
  };
}
