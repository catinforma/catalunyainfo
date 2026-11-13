import { QUOTE } from "./rules";
import type { Benefit, Community, Conditions, HtInput, Rate, Text } from "./types";

/**
 * The home-purchase tax engine. Pure: no dates, no I/O, the same result in
 * Node and in the browser.
 *
 * Second-hand home: ITP at the community's general rate, or the reduced rate
 * (or bonificación) the reader's answers qualify for, whichever is lowest.
 * New home: IVA (IGIC in the Canaries, IPSI in Ceuta and Melilla) on the price
 * plus the deed's AJD at the community's rate, or its reduced rate.
 * The mortgage deed's AJD is not the buyer's: the lender pays it (TRLITP art.
 * 29, RDL 17/2018).
 *
 * The base is the price the reader types. The law taxes the declared value
 * or, for ITP, the cadastral reference value when it is higher (TRLITP art.
 * 10): the page says so; the engine does not guess the reference value.
 */

export const PRICE_MAX = 100_000_000;

export function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

/** The tax a rate yields on a value. */
export function taxOn(rate: Rate, value: number): number {
  if (rate.kind === "flat") return cents((value * rate.rate) / 100);
  if (rate.how === "whole") {
    const b = rate.brackets.find((x) => x.upTo === null || value <= x.upTo) ?? rate.brackets.at(-1)!;
    return cents((value * b.rate) / 100);
  }
  let tax = 0;
  let floor = 0;
  for (const b of rate.brackets) {
    const top = b.upTo === null ? value : Math.min(value, b.upTo);
    if (top > floor) tax += ((top - floor) * b.rate) / 100;
    if (b.upTo === null || value <= b.upTo) break;
    floor = b.upTo;
  }
  return cents(tax);
}

/** Does the reader's profile meet the conditions the calculator can check? */
export function meets(c: Conditions, input: HtInput): boolean {
  if (c.habitual && !input.habitual) return false;
  if (c.firstHome && !input.firstHome) return false;
  if (c.maxAge !== undefined && !(input.age <= c.maxAge)) return false;
  if (c.largeFamily && !input.largeFamily) return false;
  if (c.disabilityMin !== undefined && input.disability < c.disabilityMin) return false;
  if (c.protected && !input.protected) return false;
  if (c.maxValue !== undefined && input.price > c.maxValue) return false;
  return true;
}

/** A benefit's tax: its own rate, the general one, or either less a bonificación (the Canaries' 20 % rebate is on its 5 % rate). */
function amountWith(b: Benefit, general: Rate, price: number): number {
  const before = taxOn(b.rate ?? general, price);
  return b.bonusPercent === undefined ? before : cents(before * (1 - b.bonusPercent / 100));
}

export interface TaxLine {
  tax: "itp" | "ajd" | "vat";
  /** Null when the figure is not verified: the page prints "no verificado". */
  amount: number | null;
  /** Effective rate on the price, in percent. */
  effectiveRate: number | null;
  /** The rate that applies (general or the benefit's). */
  rate: Rate | null;
  /** The reduced rate or bonificación applied, if any. */
  benefit: Benefit | null;
  /** The tax at the general rate, when a benefit lowered it. */
  generalAmount: number | null;
  article: string;
}

export type HtResult =
  | { status: "invalid"; reason: "price" | "age" | "community" }
  | {
      status: "ok";
      community: Community;
      lines: TaxLine[];
      /** Sum of the verified lines; null if any line is unverified. */
      total: number | null;
      /** Benefits that may apply but hang on facts the calculator does not ask. */
      manual: Benefit[];
      /** Requirements to check for the applied benefits. */
      extras: Text[];
    };

/** The new-home tax as a rule (null when not verified), with its protected-housing rate as a benefit. */
function vatRule(c: Community): { rule: { general: Rate; article: string } | null; extra: Benefit[] } {
  const nh = c.newHome;
  if (nh.general === null) return { rule: null, extra: [] };
  const extra: Benefit[] =
    nh.protected === null
      ? []
      : [{ id: `${c.id}-vat-protected`, tax: "vat", label: nh.protectedLabel ?? { es: "VPO", ca: "HPO", en: "VPO" }, rate: { kind: "flat", rate: nh.protected }, conditions: { protected: true }, extra: null, article: nh.article, quote: nh.quote }];
  return { rule: { general: { kind: "flat", rate: nh.general }, article: nh.article }, extra };
}

/**
 * The state exemption every common-regime territory shares (TRLITP art.
 * 45.I.B.12.c): the deed of a VPO's first transfer, once definitively
 * classified, pays no AJD. The foral territories carry their own.
 */
function stateAjdBenefits(c: Community): Benefit[] {
  if (c.regime === "foral" || !c.ajd) return [];
  return [
    {
      id: `${c.id}-ajd-vpo-state`,
      tax: "ajd",
      label: { es: "VPO: escritura de la primera transmisión exenta (norma estatal)", ca: "HPO: escriptura de la primera transmissió exempta (norma estatal)", en: "VPO: first-transfer deed exempt (state rule)" },
      rate: { kind: "flat", rate: 0 },
      conditions: { protected: true },
      extra: {
        es: "Solo la primera transmisión de una vivienda de protección oficial con calificación definitiva (art. 45.I.B.12.c del texto refundido).",
        ca: "Només la primera transmissió d'un habitatge de protecció oficial amb qualificació definitiva (art. 45.I.B.12.c del text refós).",
        en: "Only the first transfer of an officially protected home with final classification (art. 45.I.B.12.c of the consolidated act).",
      },
      article: "RDLeg 1/1993, art. 45.I.B.12.c",
      quote: `${QUOTE.vpoDeedLead} […] ${QUOTE.vpoDeed}`,
    },
  ];
}

function bestLine(tax: "itp" | "ajd" | "vat", community: Community, input: HtInput): { line: TaxLine; manual: Benefit[] } {
  const v = tax === "vat" ? vatRule(community) : null;
  const rule = v ? v.rule : tax === "itp" ? community.itp : community.ajd;
  const own = [...(v?.extra ?? []), ...(tax === "ajd" ? stateAjdBenefits(community) : []), ...community.benefits.filter((b) => b.tax === tax)];
  const manual = own.filter((b) => b.manual);
  if (!rule) return { line: { tax, amount: null, effectiveRate: null, rate: null, benefit: null, generalAmount: null, article: "" }, manual };
  const general = taxOn(rule.general, input.price);
  let best: { amount: number; benefit: Benefit | null } = { amount: general, benefit: null };
  for (const b of own) {
    if (b.manual || !meets(b.conditions, input)) continue;
    const a = amountWith(b, rule.general, input.price);
    if (a < best.amount) best = { amount: a, benefit: b };
  }
  const rate = best.benefit?.rate ?? rule.general;
  return {
    line: {
      tax,
      amount: best.amount,
      effectiveRate: input.price > 0 ? cents((best.amount / input.price) * 10000) / 100 : null,
      rate,
      benefit: best.benefit,
      generalAmount: best.benefit ? general : null,
      article: best.benefit?.article ?? rule.article,
    },
    manual,
  };
}

export function calculate(input: HtInput, communities: readonly Community[]): HtResult {
  const community = communities.find((c) => c.id === input.community);
  if (!community) return { status: "invalid", reason: "community" };
  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > PRICE_MAX) return { status: "invalid", reason: "price" };
  if (!Number.isFinite(input.age) || input.age < 18 || input.age > 120) return { status: "invalid", reason: "age" };

  const lines: TaxLine[] = [];
  let manual: Benefit[] = [];
  if (input.type === "second-hand") {
    const r = bestLine("itp", community, input);
    lines.push(r.line);
    manual = r.manual;
  } else {
    const vat = bestLine("vat", community, input);
    const ajd = bestLine("ajd", community, input);
    lines.push(vat.line, ajd.line);
    manual = [...vat.manual, ...ajd.manual];
  }
  const total = lines.some((l) => l.amount === null) ? null : cents(lines.reduce((s, l) => s + (l.amount ?? 0), 0));
  const extras = lines.flatMap((l) => (l.benefit?.extra ? [l.benefit.extra] : []));
  return { status: "ok", community, lines, total, manual, extras };
}
