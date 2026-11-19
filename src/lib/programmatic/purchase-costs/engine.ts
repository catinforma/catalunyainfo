import { calculate as taxes, cents, type HtResult } from "@/lib/programmatic/home-purchase-tax/engine";
import type { Community, HomeType, HtInput } from "@/lib/programmatic/home-purchase-tax/types";

import {
  ARANCEL_REBATE,
  COPY_HALF_FROM_FOLIO,
  FEES_VAT,
  MATRIX_FREE_FOLIOS,
  MATRIX_PER_SIDE,
  NOTARY_COPY_PER_FOLIO,
  NOTARY_FREE_ABOVE,
  NOTARY_SCALE,
  PRO_INDIVISO_MAX_PCT,
  REGISTRY_CAP,
  REGISTRY_HOME_SALE_CUT,
  REGISTRY_PRESENTATION,
  REGISTRY_SCALE,
  SIMPLE_COPY_PER_FOLIO,
  VPO_FIRST_CUT,
  VPO_FIXED,
  VPO_RESALE_CUT,
  type FeeSlice,
} from "./rules";

/**
 * The fees of buying a home, from the official scales (rules.ts), plus the
 * purchase taxes from the home-purchase tax engine (never re-typed here).
 * Pure: no dates, no I/O, the same result in Node and in the browser.
 *
 * Notary (RD 1426/1989): the deed (número 2.1 on the price, less the 50 % of
 * a protected home where the law gives it, less the 5 % rebaja; plus the
 * matrix folios from the 5th, número 7) and the copies (número 4: one
 * authorised copy, the reader's simple copies). Registrar (RD 1427/1989):
 * presentation (número 1) and registration (número 2.1 per share in pro
 * indiviso, capped at 1 % of the value, within the minimum and maximum,
 * less the protected-home 50 %, the 5 % rebaja and RDL 6/2000's 5 % on a
 * home sale, in that order). A protected home bought from the developer, of
 * up to 90 m², the buyer's only home: the fixed amounts of Ley 41/1980 art. 8.
 *
 * Who pays: the deed the seller, the copies and the registration the buyer
 * (Código Civil art. 1455, unless agreed: `buyerPaysDeed`); the taxes the
 * buyer whatever is agreed (TRLITP arts. 8 and 29). IVA 21 % on every fee,
 * except in the Canary Islands, Ceuta and Melilla (IGIC / IPSI, not computed).
 *
 * Folios: a matrix folio is taken as written on both sides (número 7 charges
 * per written side), and each copy as long as the matrix. Both are the
 * reader's estimate: the page says so.
 */

export type Owners = 1 | 2 | 3 | 4;

export interface PcInput {
  community: string;
  price: number;
  type: HomeType;
  /* The tax profile, passed to the home-purchase tax engine. */
  age: number;
  largeFamily: boolean;
  disability: 0 | 33 | 65;
  habitual: boolean;
  firstHome: boolean;
  /** Protected housing (VPO): the tax engine's flag and the fees' reductions. */
  protected: boolean;
  /** A protected home bought from the developer: of up to 90 m² of useful floor area (Ley 41/1980 art. 8.2). */
  smallHome: boolean;
  /** A protected home bought from the developer: the buyer's only home and permanent residence (Ley 41/1980 art. 8.2). */
  onlyHome: boolean;
  /** Folios of the deed (the reader's estimate). */
  folios: number;
  simpleCopies: number;
  /** Buyers in pro indiviso, equal shares; spouses in community property count as one (RD 1427/1989, norma segunda). */
  owners: Owners;
  /** The contract puts the deed on the buyer (Código Civil art. 1455: "salvo pacto en contrario"). */
  buyerPaysDeed: boolean;
  mortgage: boolean;
}

export const FOLIOS_MAX = 200;
export const SIMPLE_COPIES_MAX = 10;
export const OWNERS: readonly Owners[] = [1, 2, 3, 4];

/**
 * "general"; "vpo-resale": second or later transfer of a protected home (50 %,
 * notary número 2.2.e, registrar 2.4.b); "vpo-first": first transfer by the
 * developer to a buyer for whom it is the only home (50 % of deed, first copy
 * and registration, Ley 41/1980 art. 8.2); "vpo-fixed": the same, up to 90 m²
 * (fixed amounts for all items).
 */
export type FeeRegime = "general" | "vpo-resale" | "vpo-first" | "vpo-fixed";

export function feeRegime(input: Pick<PcInput, "protected" | "type" | "smallHome" | "onlyHome">): FeeRegime {
  if (!input.protected) return "general";
  if (input.type === "second-hand") return "vpo-resale";
  if (!input.onlyHome) return "general";
  return input.smallHome ? "vpo-fixed" : "vpo-first";
}

/** A scale on a value, unrounded: the first slice's fixed amount, then each slice's per mille on the part of the value above the previous slice's top. */
export function scaleFee(scale: readonly FeeSlice[], value: number): number {
  let fee = scale[0]?.fixed ?? 0;
  for (let i = 1; i < scale.length; i++) {
    const s = scale[i]!;
    const floor = scale[i - 1]!.to!;
    const top = s.to === null ? value : Math.min(value, s.to);
    if (top > floor) fee += ((top - floor) * (s.perMille ?? 0)) / 1000;
    if (s.to === null || value <= s.to) break;
  }
  return fee;
}

const off = (amount: number, pct: number) => amount * (1 - pct / 100);

/** Número 4.1: an authorised copy of `folios` folios. */
export function authorisedCopy(folios: number): number {
  const full = Math.min(folios, COPY_HALF_FROM_FOLIO - 1);
  const half = Math.max(0, folios - (COPY_HALF_FROM_FOLIO - 1));
  return cents(full * NOTARY_COPY_PER_FOLIO + (half * NOTARY_COPY_PER_FOLIO) / 2);
}

/** Número 7: the matrix folios from the 5th, both sides written. */
export function matrixFolios(folios: number): number {
  return cents(Math.max(0, folios - MATRIX_FREE_FOLIOS) * 2 * MATRIX_PER_SIDE);
}

export interface NotaryFees {
  /** Número 2.1 on the price, before any reduction. */
  scale: number;
  /** The protected-home reduction (50 %), when one applies. */
  cutPct: number | null;
  /** The 5 % rebaja, in euros. */
  rebate: number;
  /** The scale after the reductions. */
  deedScale: number;
  matrixFolios: number;
  /** Deed = deedScale + matrixFolios: the seller's unless agreed. */
  deed: number;
  firstCopy: number;
  simpleCopies: number;
  /** Ley 41/1980 art. 8.2: the fixed amount for all items (then deed and copies are 0). */
  fixed: number | null;
  total: number;
}

export interface RegistryFees {
  /** The base of each share (the price, or the price split in pro indiviso). */
  shareBase: number;
  owners: Owners;
  /** Número 2.1 summed over the shares, after the 1 % cap and within the minimum and maximum. */
  scale: number;
  /** True when the 1 % cap of norma segunda lowered the sum. */
  capped: boolean;
  cutPct: number | null;
  /** The arancel's 5 % rebaja, in euros. */
  rebate: number;
  /** RDL 6/2000 art. 36.1's 5 % on a home sale, in euros. */
  homeSaleCut: number;
  registration: number;
  presentation: number;
  fixed: number | null;
  total: number;
}

export interface PcFees {
  regime: FeeRegime;
  notary: NotaryFees;
  registry: RegistryFees;
  /** Fees before IVA by payer. */
  buyer: number;
  seller: number;
  /** IVA on the fees; null where IGIC or IPSI applies instead (not computed). */
  vat: { rate: number; buyer: number; seller: number } | null;
}

export function notaryFees(input: PcInput, regime: FeeRegime): NotaryFees {
  if (regime === "vpo-fixed") {
    return { scale: 0, cutPct: null, rebate: 0, deedScale: 0, matrixFolios: 0, deed: 0, firstCopy: 0, simpleCopies: 0, fixed: cents(VPO_FIXED.notary), total: cents(VPO_FIXED.notary) };
  }
  const raw = scaleFee(NOTARY_SCALE, input.price);
  const cutPct = regime === "vpo-resale" ? VPO_RESALE_CUT : regime === "vpo-first" ? VPO_FIRST_CUT : null;
  const afterCut = cutPct === null ? raw : off(raw, cutPct);
  const deedScale = cents(off(afterCut, ARANCEL_REBATE));
  const rebate = cents(afterCut - off(afterCut, ARANCEL_REBATE));
  const mf = matrixFolios(input.folios);
  const copy = authorisedCopy(input.folios);
  // Ley 41/1980 art. 8.2: the first copy too; número 2.2.e reduces the scale only.
  const firstCopy = regime === "vpo-first" ? cents(off(copy, VPO_FIRST_CUT)) : copy;
  const simpleCopies = cents(input.simpleCopies * input.folios * SIMPLE_COPY_PER_FOLIO);
  const deed = cents(deedScale + mf);
  return { scale: cents(raw), cutPct, rebate, deedScale, matrixFolios: mf, deed, firstCopy, simpleCopies, fixed: null, total: cents(deed + firstCopy + simpleCopies) };
}

export function registryFees(input: PcInput, regime: FeeRegime): RegistryFees {
  const shareBase = input.price / input.owners;
  if (regime === "vpo-fixed") {
    return { shareBase, owners: input.owners, scale: 0, capped: false, cutPct: null, rebate: 0, homeSaleCut: 0, registration: 0, presentation: 0, fixed: cents(VPO_FIXED.registry), total: cents(VPO_FIXED.registry) };
  }
  const sum = scaleFee(REGISTRY_SCALE, shareBase) * input.owners;
  const cap = input.owners > 1 ? (input.price * PRO_INDIVISO_MAX_PCT) / 100 : Number.POSITIVE_INFINITY;
  const capped = sum > cap;
  const scale = Math.min(Math.max(Math.min(sum, cap), REGISTRY_CAP.min), REGISTRY_CAP.max);
  const cutPct = regime === "vpo-resale" ? VPO_RESALE_CUT : regime === "vpo-first" ? VPO_FIRST_CUT : null;
  const afterCut = cutPct === null ? scale : off(scale, cutPct);
  const afterRebate = off(afterCut, ARANCEL_REBATE);
  const afterSale = off(afterRebate, REGISTRY_HOME_SALE_CUT);
  const registration = cents(afterSale);
  const presentation = cents(REGISTRY_PRESENTATION);
  return {
    shareBase: cents(shareBase),
    owners: input.owners,
    scale: cents(scale),
    capped,
    cutPct,
    rebate: cents(afterCut - afterRebate),
    homeSaleCut: cents(afterRebate - afterSale),
    registration,
    presentation,
    fixed: null,
    total: cents(registration + presentation),
  };
}

/** IGIC in the Canary Islands, IPSI in Ceuta and Melilla: not the IVA (Ley 37/1992 art. 3). */
export function feesVatApplies(c: Pick<Community, "regime">): boolean {
  return c.regime !== "canarias" && c.regime !== "ceuta-melilla";
}

export type PcInvalid = "price" | "above-free" | "folios" | "copies" | "owners" | "community";

export type PcResult =
  | { status: "invalid"; reason: PcInvalid }
  | {
      status: "ok";
      community: Community;
      fees: PcFees;
      /** The home-purchase tax engine's answer for the same home (it may be "invalid" on the age). */
      taxes: HtResult;
      /** Purchase taxes + the buyer's fees + their IVA; null when a tax is not verified, the age is invalid or the IVA does not apply. */
      buyerTotal: number | null;
      /** The buyer's fees with their IVA (or without, where IGIC or IPSI applies). */
      buyerFees: number;
      /** The seller's share (the deed) with its IVA, 0 when the buyer pays it. */
      sellerFees: number;
    };

export function taxInput(input: PcInput): HtInput {
  const { community, price, type, age, largeFamily, disability, habitual, firstHome } = input;
  return { community, price, type, age, largeFamily, disability, habitual, firstHome, protected: input.protected };
}

export function calculate(input: PcInput, communities: readonly Community[]): PcResult {
  const community = communities.find((c) => c.id === input.community);
  if (!community) return { status: "invalid", reason: "community" };
  if (!Number.isFinite(input.price) || input.price <= 0) return { status: "invalid", reason: "price" };
  if (input.price > NOTARY_FREE_ABOVE) return { status: "invalid", reason: "above-free" };
  if (!Number.isInteger(input.folios) || input.folios < 1 || input.folios > FOLIOS_MAX) return { status: "invalid", reason: "folios" };
  if (!Number.isInteger(input.simpleCopies) || input.simpleCopies < 0 || input.simpleCopies > SIMPLE_COPIES_MAX) return { status: "invalid", reason: "copies" };
  if (!OWNERS.includes(input.owners)) return { status: "invalid", reason: "owners" };

  const regime = feeRegime(input);
  const notary = notaryFees(input, regime);
  const registry = registryFees(input, regime);
  const sellerPart = input.buyerPaysDeed ? 0 : notary.deed;
  const buyer = cents(notary.total + registry.total - sellerPart);
  const seller = cents(sellerPart);
  const vat = feesVatApplies(community) ? { rate: FEES_VAT, buyer: cents((buyer * FEES_VAT) / 100), seller: cents((seller * FEES_VAT) / 100) } : null;
  const fees: PcFees = { regime, notary, registry, buyer, seller, vat };

  const t = taxes(taxInput(input), communities);
  const buyerFees = cents(buyer + (vat?.buyer ?? 0));
  const sellerFees = cents(seller + (vat?.seller ?? 0));
  const buyerTotal = t.status === "ok" && t.total !== null && vat ? cents(t.total + buyerFees) : null;
  return { status: "ok", community, fees, taxes: t, buyerTotal, buyerFees, sellerFees };
}
