/**
 * The shape of the per-community tax data (communities.ts) and of the
 * calculator's input. Small and data-free: the client component imports it.
 */

export type HtLocale = "es" | "ca" | "en";
export type Text = Record<HtLocale, string>;

/** A tax rate: flat, or a scale by value of the home. */
export type Rate =
  | { kind: "flat"; rate: number }
  /**
   * "progressive": each slice of the value is taxed at its rate (like the IRPF).
   * "whole": the whole value is taxed at the rate of the bracket it falls in.
   */
  | { kind: "scale"; how: "progressive" | "whole"; brackets: readonly { upTo: number | null; rate: number }[] };

/** What the calculator checks itself (the reader's answers). */
export interface Conditions {
  /** The home must be the buyer's habitual residence. */
  habitual?: boolean;
  /** The buyer must be buying a first home (the law's wording is in `extra`). */
  firstHome?: boolean;
  /** Buyer's age on the purchase day, at most (inclusive). */
  maxAge?: number;
  largeFamily?: boolean;
  /** Minimum disability degree (33 or 65). */
  disabilityMin?: 33 | 65;
  /** Officially protected housing (VPO / vivienda protegida). */
  protected?: boolean;
  /** Maximum price (or value) of the home, inclusive. */
  maxValue?: number;
}

export interface Benefit {
  id: string;
  /** "vat": a reduced rate of the new-home tax (the IGIC's profile rates in the Canaries). */
  tax: "itp" | "ajd" | "vat";
  label: Text;
  /** The reduced rate, or a bonificación (percent off the tax due at the general rate). */
  rate?: Rate;
  bonusPercent?: number;
  conditions: Conditions;
  /**
   * Requirements the calculator does not ask about (income limits, keep the
   * home N years, time to move in…). The benefit is applied with this note.
   */
  extra: Text | null;
  /**
   * Set when the benefit hangs on something the calculator does not ask
   * (a rural municipality, gender-violence victims…): it is listed, never
   * applied automatically.
   */
  manual?: true;
  article: string;
  /** Exact words of the law (tests check the rate appears in them). */
  quote: string;
}

export interface LawRef {
  /** "Decreto Legislativo 1/2024, de …". */
  title: string;
  short: string;
  url: string;
  /** The BOE (or bulletin) consolidated text's "última actualización", when it shows one. */
  consolidatedAsOf: string | null;
  readOn: string;
}

export interface TaxRule {
  general: Rate;
  article: string;
  quote: string;
}

export type Regime = "common" | "canarias" | "ceuta-melilla" | "foral";

/** The tax on a new home instead of (or as) IVA. */
export interface NewHomeTax {
  name: "IVA" | "IGIC" | "IPSI";
  /** Null: not verified (the page says so). */
  general: number | null;
  /** Rate for protected housing (VPO) delivered by the developer, when the law sets one. */
  protected: number | null;
  protectedLabel: Text | null;
  article: string;
  quote: string;
  law: LawRef | null;
  /** Who to ask about this tax when it is not the community's agency (the IPSI is the city's). */
  agency?: { name: string; url: string };
}

export interface Community {
  id: string;
  name: Text;
  regime: Regime;
  /** "sourced": every figure read in the law; "unverified": no figure printed. */
  status: "sourced" | "unverified";
  law: LawRef | null;
  /** Later laws read for 2025–2026 changes. */
  amendments: readonly { title: string; url: string }[];
  taxAgency: { name: string; url: string };
  itp: TaxRule | null;
  ajd: TaxRule | null;
  benefits: readonly Benefit[];
  newHome: NewHomeTax;
  /** Things the reader must know (higher rates for some buyers, how the scale works…). */
  notes: readonly Text[];
}

export type HomeType = "second-hand" | "new";

export interface HtInput {
  community: string;
  price: number;
  type: HomeType;
  age: number;
  largeFamily: boolean;
  disability: 0 | 33 | 65;
  habitual: boolean;
  firstHome: boolean;
  protected: boolean;
}
