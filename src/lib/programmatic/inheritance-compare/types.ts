import type { CalculatorId } from "@/lib/programmatic/calculators/paths";
import type { ScaleRow } from "@/lib/programmatic/inheritance-tax/regions/types";

/**
 * The shape of the comparison of inheritance and gift tax rules across every
 * Spanish territory (lib/programmatic/inheritance-compare/territories.ts):
 * the fifteen common-regime communities, Ceuta and Melilla (state rules) and
 * the four foral territories (Álava, Bizkaia, Gipuzkoa, Navarra).
 *
 * Every cell is a short summary in ca, es and en with the article, the date
 * its wording applies from and the law's own words (Spanish, verbatim). A
 * cell not read with confidence is `pending`: the page prints "pendiente de
 * verificar" and the reason, never a guess.
 */

export type CmpLocale = "ca" | "es" | "en";
export type Text = Record<CmpLocale, string>;

export type TerritoryId =
  | "andalucia"
  | "aragon"
  | "asturias"
  | "baleares"
  | "canarias"
  | "cantabria"
  | "castilla-la-mancha"
  | "castilla-y-leon"
  | "cataluna"
  | "valencia"
  | "extremadura"
  | "galicia"
  | "madrid"
  | "murcia"
  | "la-rioja"
  | "ceuta"
  | "melilla"
  | "alava"
  | "bizkaia"
  | "gipuzkoa"
  | "navarra";

/** "common": a community of the common regime (Ley 22/2009); "city": Ceuta or Melilla (Ley 29/1987 applies, with its art. 23 bis); "foral": its own norma foral or ley foral. */
export type Regime = "common" | "city" | "foral";

export interface CmpSource {
  /** How a cell cites it: "Ley 29/1987", "Codi tributari de Catalunya". */
  short: string;
  name: string;
  publisher: string;
  /** Bulletin reference, consolidated-text date, articles read. */
  ref: string;
  url: string;
  /** The day the text was read. */
  read: string;
}

/** A citation: which of the territory's sources, which article. */
export interface CmpCite {
  src: string;
  art: string;
}

export interface Cell {
  text: Text;
  /** Not read with confidence: the page prints "pendiente de verificar" with `text` as the reason. */
  pending?: true;
  cite?: CmpCite;
  /** The day the current wording applies from (deaths or gifts from this day). */
  from?: string;
  /** The law's words, verbatim (Spanish); a quote from another text than the cell's citation names its source. */
  quotes?: readonly (string | CmpQuote)[];
}

export interface CmpQuote {
  text: string;
  /** Key in the territory's `sources`. */
  src: string;
}

/**
 * The rules of the worked example (a child aged 30 inherits 300.000 € net, of
 * which 150.000 € is their share of the deceased's habitual home), for the
 * territories whose own calculator does not exist on the site.
 */
export interface ExampleRules {
  /**
   * The reductions of the base, kinship first: a fixed amount, applied before
   * the home; or, after the home, one that tops all the reductions up to
   * `topUpTo`, never more than the base (Aragón art. 131-5: 100 % of the base
   * while the others stay under 500.000 €; Castilla y León art. 13.1.c:
   * 400.000 € less the other reductions).
   */
  reductions: readonly ({ id: string; label: Text; amount: number; cite: CmpCite } | { id: string; label: Text; topUpTo: number; cite: CmpCite })[];
  /** The home reduction: a percentage of the home's value in the share, capped per heir (null: no cap). */
  home: { percent: number; cap: number | null; cite: CmpCite } | null;
  /** The scale applied to the base liquidable, as the bulletin prints it. */
  scale: readonly ScaleRow[];
  scaleCite: CmpCite;
  /** Group II coefficient with no prior wealth (1 and no citation where the law has no coefficient: the foral territories). */
  coefficient: number;
  coefficientCite: CmpCite | null;
  /** Rebate on the tax: a flat percentage, or a percentage that depends on the base liquidable (rows from `from`, inclusive). */
  bonus: { kind: "flat"; percent: number } | { kind: "by-base"; rows: readonly { from: number; percent: number }[] } | { kind: "none" };
  bonusCite: CmpCite | null;
}

export type ExampleSpec =
  /** The site's own calculator works it out (inheritance-tax/engine.ts or regional-engine.ts). */
  | { kind: "engine"; engine: "cataluna" | "madrid" | "andalucia" | "valencia" }
  | { kind: "rules"; rules: ExampleRules }
  /** Not computed: the reason, per language. */
  | { kind: "pending"; reason: Text };

export interface Territory {
  id: TerritoryId;
  name: Text;
  regime: Regime;
  /** The authority that manages the tax and its page. */
  agency: { name: Text; url: string };
  /** The official texts read, by key (cells cite them). */
  sources: Record<string, CmpSource>;
  /** The consolidated text read for the inheritance rules: its key in `sources`. */
  mainSource: string;
  inheritance: {
    /** Children aged 21 or more and the spouse (group II): the reductions of the base. */
    groupII: Cell;
    /** The rebate on the tax (bonificación en cuota) for groups I and II. */
    bonus: Cell;
    /** The deceased's habitual home. */
    home: Cell;
    /** Siblings (group III): reduction and rebate. */
    groupIII: Cell;
  };
  gift: {
    /** A gift from a parent to a child aged 21 or more: reductions and rebate. */
    benefit: Cell;
    /** What form the gift must take for the benefit (public deed, the origin of cash). */
    formal: Cell;
  };
  example: ExampleSpec;
  /** The site's calculator for this territory, if any. */
  calculator?: { inheritance: CalculatorId; gift: CalculatorId };
}
