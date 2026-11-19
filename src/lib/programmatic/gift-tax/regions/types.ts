import type { CoefficientRow, ScaleRow } from "@/lib/programmatic/inheritance-tax/regions/types";

/**
 * The shape of one community's gift tax rules (impuesto sobre donaciones:
 * Catalonia, Madrid, Andalucía, Comunitat Valenciana), read by the gift
 * engine. Numbers only, small and client-safe: the page passes one
 * community's `GiftRules` to the calculator as a prop. Quotes, sources and
 * page words live beside each community's rules and stay on the server.
 */

export type GiftRegionId = "catalonia" | "madrid" | "andalucia" | "valencia";
export const GIFT_REGION_IDS: readonly GiftRegionId[] = ["catalonia", "madrid", "andalucia", "valencia"];

/** The registry ids of the four calculators (calculators/paths.ts). */
export type GiftCalculatorId = "gift-tax-catalonia" | "gift-tax-madrid" | "gift-tax-andalucia" | "gift-tax-valencia";

/**
 * Who the donee is to the donor. The groups are the state's (Ley 29/1987 art.
 * 20.2.a; Catalonia art. 631-2): children and grandchildren under 21 group I;
 * from 21, and the spouse, parents and grandparents, group II; siblings,
 * nephews, nieces, uncles, aunts and in-laws group III; the rest group IV.
 * Grandchild and grandparent are their own entries because the Valencian law
 * names them (art. 10 bis.2.a, 12 bis.1.b), sibling because Madrid's cash
 * reduction does (art. 22 bis.1).
 */
export type GiftRelation = "spouse" | "child" | "grandchild" | "parent" | "grandparent" | "sibling" | "nephew" | "affinity" | "distant" | "unrelated";
export const GIFT_RELATIONS: readonly GiftRelation[] = ["child", "grandchild", "spouse", "parent", "grandparent", "sibling", "nephew", "affinity", "distant", "unrelated"];

/** What is given: cash (or a bank transfer), a home, or anything else (other property, shares, a car…). */
export type GiftKind = "money" | "home" | "other";
export const GIFT_KINDS: readonly GiftKind[] = ["money", "home", "other"];

/** Which law and article a step cites. */
export type GiftLawId = "catalonia" | "catReg" | "madrid" | "andalucia" | "valencia" | "lisd" | "risd" | "lofca";
export interface GiftCite {
  law: GiftLawId;
  art: string;
}

export interface GiftHomeRule {
  /** The gift kinds the reduction can apply to (cash to buy the home, or the home itself). */
  kinds: readonly GiftKind[];
  relations: readonly GiftRelation[];
  percent: number;
  /** "reduction": the reduction itself is capped (Catalonia, Madrid); "base": the base it applies to (Andalucía). */
  capOn: "reduction" | "base";
  cap: number;
  /** The cap for a donee with a disability of `capDisabilityFrom` % or more. */
  capDisability: number;
  capDisabilityFrom: 33 | 65 | null;
  /** The oldest donee in whole years (Catalonia 36: "no pot tenir més de trenta-sis anys"; Andalucía 34: "menor de 35 años"); null: no age rule. */
  maxAge: number | null;
  /** A disability of this degree lifts the age rule. */
  ageWaivedFrom: 33 | 65 | null;
  /** Andalucía: the donee's prior wealth must be in the first bracket of Ley 29/1987 art. 22 (up to this). */
  priorWealthMax: number | null;
  /** A public deed is needed: always (0), above this amount of gifts in three years (Madrid 10.000), or never in this rule (null)… */
  deedAbove: number | null;
  /** …for these kinds (Andalucía: only when the home itself is given, art. 33.1.e; cash needs the purchase deed instead, art. 32.1.f). */
  deedKinds: readonly GiftKind[];
}

export interface GiftRules {
  id: GiftRegionId;
  calculatorId: GiftCalculatorId;
  /** The latest change of the rules applied: they are for gifts on or after this day. */
  giftsFrom: string;
  /** The scale, as the bulletin prints it. */
  scale: readonly ScaleRow[];
  /** Catalonia art. 633-2: groups I and II pay a reduced scale when the gift is in a public deed. */
  reducedScale: readonly ScaleRow[] | null;
  coefficients: readonly CoefficientRow[];
  /** The excess-of-quota rule just above a prior-wealth bracket (only with more than one bracket). */
  excessRule: boolean;
  /** Valencia art. 10 bis.2.a: kinship reductions on gifts. Null elsewhere: base liquidable = base imponible (Ley 29/1987 art. 20.5). */
  kinship: { under21: { base: number; perYear: number; max: number }; adult: number; relations: readonly GiftRelation[] } | null;
  /** Valencia art. 10 bis.2.b. */
  disability: { from65: number; from33: number; from33Relations: readonly GiftRelation[]; mentalFrom33As65: boolean } | null;
  home: GiftHomeRule | null;
  /** Null: the community has no rebate on gifts (Catalonia). */
  bonus: {
    /** Madrid art. 25.2.a: 100 % when the gifts from this donor in three years add up to no more than this. */
    smallGiftMax: number | null;
    groupsIandII: number;
    /** Valencia: only these relations get the group I-II rebate (spouse, parents, children, grandchildren, grandparents). */
    directRelations: readonly GiftRelation[] | null;
    groupIII: number;
    /** "group": the whole of group III; "blood-collaterals": siblings, nephews, nieces, uncles and aunts by blood. */
    groupIIIScope: "group" | "blood-collaterals";
    /** Valencia: 99 % for a donee with 65 % disability or more (or intellectual/mental 33 %), whatever the relation. */
    disability: number;
    /** A public document is needed above this amount of gifts in three years (0: always). */
    deedAbove: number;
    /** Cash: the origin of the funds must be justified and stated in the document, above this amount (0: always). */
    fundsOriginAbove: number;
  } | null;
  /** Valencia: the kinship and disability reductions need the public document and, for cash, the origin of the funds. */
  reductionsNeedDeed: boolean;
  /** The filing deadline: months from the act, or working days from the day after it. */
  deadline: { months: number } | { workingDays: number };
  cite: {
    scale: GiftCite;
    reducedScale: GiftCite | null;
    coefficient: GiftCite;
    excess: GiftCite;
    kinship: GiftCite | null;
    disability: GiftCite | null;
    home: GiftCite | null;
    bonus: GiftCite | null;
    smallGift: GiftCite | null;
    deadline: GiftCite;
    partners: GiftCite;
  };
}
