import { calculateOk, inputOf } from "@/lib/programmatic/inheritance-tax/engine";
import { calculateRegionalOk, cents, regionalInputOf, regionalQuota } from "@/lib/programmatic/inheritance-tax/regional-engine";
import { ANDALUCIA_RULES } from "@/lib/programmatic/inheritance-tax/regions/andalucia";
import { MADRID_RULES } from "@/lib/programmatic/inheritance-tax/regions/madrid";
import { VALENCIA_RULES } from "@/lib/programmatic/inheritance-tax/regions/valencia";

import type { ExampleRules, ExampleSpec } from "./types";

/**
 * The worked example of the comparison, the same case in every territory: a
 * child aged 30, the only heir, inherits 300.000 € net (base imponible), of
 * which 150.000 € is the deceased's habitual home (the whole home, where the
 * child did not live: the foral home reductions ask for two years living
 * together, so they do not apply). The deceased lived in the
 * territory for the five years before the death; the heir lives in Spain, has
 * no disability, no prior wealth and no life insurance, files on time and
 * keeps the home the years the law asks.
 *
 * The four communities with their own calculator on the site go through that
 * calculator's engine (inheritance-tax/engine.ts for Catalonia,
 * regional-engine.ts for Madrid, Andalucía and Valencia); the others through
 * `fromRules`, which applies their quoted rules in the same order: kinship and
 * other reductions, the home, the scale, the coefficient, the rebate. Euros,
 * rounded half up to the cent at each step.
 */

export const EXAMPLE = { share: 300_000, home: 150_000, age: 30 } as const;

export interface ExampleResult {
  baseImponible: number;
  /** Every reduction applied, the home last. */
  reductions: readonly { id: string; amount: number }[];
  totalReductions: number;
  baseLiquidable: number;
  quotaIntegra: number;
  coefficient: number;
  quotaTributaria: number;
  bonusPct: number;
  bonus: number;
  toPay: number;
}

/** The rebate percentage that applies to a base liquidable. */
export function bonusPercent(bonus: ExampleRules["bonus"], baseLiquidable: number): number {
  if (bonus.kind === "none") return 0;
  if (bonus.kind === "flat") return bonus.percent;
  let pct = 0;
  for (const row of bonus.rows) if (baseLiquidable >= row.from) pct = row.percent;
  return pct;
}

export function fromRules(rules: ExampleRules): ExampleResult {
  const base: number = EXAMPLE.share;
  const planned: { id: string; amount: number }[] = [];
  for (const r of rules.reductions) if ("amount" in r) planned.push({ id: r.id, amount: r.amount });
  if (rules.home) {
    const theoretical = cents((EXAMPLE.home * rules.home.percent) / 100);
    planned.push({ id: "home", amount: rules.home.cap === null ? theoretical : Math.min(theoretical, rules.home.cap) });
  }
  for (const r of rules.reductions) {
    if (!("topUpTo" in r)) continue;
    const others = planned.reduce((s, x) => s + x.amount, 0);
    if (others < r.topUpTo) planned.push({ id: r.id, amount: cents(Math.min(base, r.topUpTo - others)) });
  }
  let running = base;
  const reductions: { id: string; amount: number }[] = [];
  for (const r of planned) {
    if (r.amount <= 0) continue;
    running = cents(Math.max(0, running - r.amount));
    reductions.push(r);
  }
  const baseLiquidable = running;
  const { quota: quotaIntegra } = regionalQuota(rules.scale, baseLiquidable);
  const quotaTributaria = cents(quotaIntegra * rules.coefficient);
  const bonusPct = bonusPercent(rules.bonus, baseLiquidable);
  const bonus = cents((quotaTributaria * bonusPct) / 100);
  return {
    baseImponible: base,
    reductions,
    totalReductions: cents(reductions.reduce((s, r) => s + r.amount, 0)),
    baseLiquidable,
    quotaIntegra,
    coefficient: rules.coefficient,
    quotaTributaria,
    bonusPct,
    bonus,
    toPay: cents(quotaTributaria - bonus),
  };
}

const REGIONAL = { madrid: MADRID_RULES, andalucia: ANDALUCIA_RULES, valencia: VALENCIA_RULES } as const;

/** The example in one territory, or null when its rules are not all read. */
export function exampleResult(spec: ExampleSpec): ExampleResult | null {
  if (spec.kind === "pending") return null;
  if (spec.kind === "rules") return fromRules(spec.rules);
  if (spec.engine === "cataluna") {
    const r = calculateOk(inputOf({ relation: "child", age: EXAMPLE.age, share: EXAMPLE.share, homeValue: EXAMPLE.home }));
    return { ...r, baseImponible: r.baseImposable, reductions: r.reductions.map((x) => ({ id: x.id, amount: x.amount })) };
  }
  const r = calculateRegionalOk(REGIONAL[spec.engine], regionalInputOf({ relation: "child", age: EXAMPLE.age, share: EXAMPLE.share, homeValue: EXAMPLE.home }));
  return { ...r, baseImponible: r.baseImposable, reductions: r.reductions.map((x) => ({ id: x.id, amount: x.amount })) };
}
