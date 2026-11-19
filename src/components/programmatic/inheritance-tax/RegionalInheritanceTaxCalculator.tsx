"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { DISABILITY_LABEL, GROUP_LABEL, money, num, percent, type IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { RELATIONS, type Disability, type Relation } from "@/lib/programmatic/inheritance-tax/engine";
import { calculateRegional, type RegionalInput } from "@/lib/programmatic/inheritance-tax/regional-engine";
import { REGION_NAME, REGIONAL_CALC_COPY, REGIONAL_REDUCTION_LABEL, REGIONAL_RELATION_LABEL, cite, reductionCite, regionalNote } from "@/lib/programmatic/inheritance-tax/regional-copy";
import type { RegionRules } from "@/lib/programmatic/inheritance-tax/regions/types";

/**
 * One heir's inheritance tax in Madrid, Andalucía or the Comunitat
 * Valenciana: the community's rules arrive as a prop (numbers only), the
 * inputs are the Catalan calculator's plus, in Valencia, whether a 33 %
 * disability is intellectual or mental. Server-rendered on the page's first
 * example, so it answers without JavaScript.
 */

const DISABILITIES: Disability[] = [0, 33, 65];
const COLLATERALS: ReadonlySet<Relation> = new Set(["collateral", "distant"]);

export function RegionalInheritanceTaxCalculator({ locale, rules, initial }: { locale: IsdLocale; rules: RegionRules; initial: RegionalInput }) {
  const t = REGIONAL_CALC_COPY[locale];
  const id = useId();
  const [relation, setRelation] = useState<Relation>(initial.relation);
  const [age, setAge] = useState(String(initial.age));
  const [disability, setDisability] = useState<Disability>(initial.disability);
  const [mental, setMental] = useState(initial.mentalDisability);
  const [share, setShare] = useState(String(initial.share));
  const [insurance, setInsurance] = useState(String(initial.insurance));
  const [homeValue, setHomeValue] = useState(String(initial.homeValue));
  const [homeOwned, setHomeOwned] = useState(String(initial.homeOwnedPct));
  const [homeHeir, setHomeHeir] = useState(String(initial.homeHeirPct));
  const [livedTogether, setLivedTogether] = useState(initial.livedTogether);
  const [prior, setPrior] = useState(String(initial.priorWealth));

  const ageText = age.trim();
  const result = calculateRegional(rules, {
    relation,
    age: /^\d{1,3}$/.test(ageText) ? Number(ageText) : Number.NaN,
    disability,
    mentalDisability: mental,
    share: parseAmount(share),
    insurance: parseAmount(insurance),
    homeValue: parseAmount(homeValue),
    homeOwnedPct: parseAmount(homeOwned),
    homeHeirPct: parseAmount(homeHeir),
    livedTogether,
    priorWealth: parseAmount(prior),
  });
  const calcUse = useCalculatorUse(rules.calculatorId, locale, result);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const flat = rules.coefficients.length === 1;

  const amountField = (key: string, label: string, value: string, set: (v: string) => void, hint?: string, suffix = "€") => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <span className="ci-calc-number">
        <input
          id={`${id}-${key}`}
          className="ci-field"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => set(e.target.value)}
          aria-describedby={hint ? `${id}-${key}-hint` : undefined}
        />
        <span className="ci-calc-suffix">{suffix}</span>
      </span>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title(REGION_NAME[rules.id][locale])}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-relation`}>{t.relation}</label>
          <select id={`${id}-relation`} className="ci-field" value={relation} onChange={(e) => setRelation(e.target.value as Relation)}>
            {RELATIONS.map((r) => (
              <option key={r} value={r}>
                {REGIONAL_RELATION_LABEL[r][locale]}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-age`}>{t.age}</label>
          <span className="ci-calc-number">
            <input id={`${id}-age`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={age} onChange={(e) => setAge(e.target.value)} aria-describedby={`${id}-age-hint`} />
          </span>
          <span id={`${id}-age-hint`} className="ci-calc-note">
            {t.ageHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-disability`}>{t.disability}</label>
          <select id={`${id}-disability`} className="ci-field" value={disability} onChange={(e) => setDisability(Number(e.target.value) as Disability)}>
            {DISABILITIES.map((d) => (
              <option key={d} value={d}>
                {DISABILITY_LABEL[d][locale]}
              </option>
            ))}
          </select>
        </p>
        {rules.disability.mentalFrom33As65 && disability === 33 ? (
          <p className="ci-calc-row">
            <label htmlFor={`${id}-mental`} className="flex items-start gap-2 font-normal">
              <input id={`${id}-mental`} type="checkbox" className="mt-1" checked={mental} onChange={(e) => setMental(e.target.checked)} />
              <span>{t.mental}</span>
            </label>
          </p>
        ) : null}
        {amountField("share", t.share, share, setShare, t.shareHint)}
        {amountField("insurance", t.insurance, insurance, setInsurance, t.insuranceHint)}
        {amountField("prior", t.prior, prior, setPrior, t.priorHint(flat))}

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.homeLegend}</legend>
          {amountField("home", t.homeValue, homeValue, setHomeValue, t.homeValueHint)}
          {amountField("home-owned", t.homeOwned, homeOwned, setHomeOwned, t.homeOwnedHint, "%")}
          {amountField("home-heir", t.homeHeir, homeHeir, setHomeHeir, t.homeHeirHint, "%")}
          {COLLATERALS.has(relation) ? (
            <label htmlFor={`${id}-lived`} className="flex items-start gap-2 font-normal">
              <input id={`${id}-lived`} type="checkbox" className="mt-1" checked={livedTogether} onChange={(e) => setLivedTogether(e.target.checked)} />
              <span>{t.livedTogether}</span>
            </label>
          ) : null}
        </fieldset>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.toPay}</dt>
                <dd>{M(result.toPay)}</dd>
              </div>
            </dl>
            <p className="ci-calc-note">
              {t.groupLine(GROUP_LABEL[result.group][locale])} {result.toPay > 0 ? t.effective(P(result.effectiveRate * 100), M(result.baseImposable)) : t.zero}
            </p>

            <h3 className="mt-4 text-base">{t.stepsTitle}</h3>
            <dl className="ci-calc-results">
              <div>
                <dt>{t.baseImposable}</dt>
                <dd>{M(result.baseImposable)}</dd>
              </div>
              {result.reductions.map((r) => (
                <div key={r.id}>
                  <dt>
                    {REGIONAL_REDUCTION_LABEL[r.id][locale]} ({cite(reductionCite(rules, r.id, result.group), locale)})
                  </dt>
                  <dd>
                    −{M(r.amount)} → {M(r.after)}
                  </dd>
                </div>
              ))}
              <div>
                <dt>{t.baseLiquidable}</dt>
                <dd>{M(result.baseLiquidable)}</dd>
              </div>
              {result.baseLiquidable > 0 ? (
                <>
                  <div>
                    <dt>
                      {t.quotaIntegra} ({cite(rules.cite.scale, locale)})
                    </dt>
                    <dd>{M(result.quotaIntegra)}</dd>
                  </div>
                  <div>
                    <dt>
                      {t.coefficient(num(result.coefficient, 4, locale), GROUP_LABEL[result.group][locale])} ({cite(rules.cite.coefficient, locale)})
                    </dt>
                    <dd>{M(result.quotaIntegra * result.coefficient)}</dd>
                  </div>
                  {result.excess > 0 ? (
                    <div>
                      <dt>
                        {t.excess} ({cite(rules.cite.excess, locale)})
                      </dt>
                      <dd>−{M(result.excess)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>{t.quotaTributaria}</dt>
                    <dd>{M(result.quotaTributaria)}</dd>
                  </div>
                  <div>
                    <dt>
                      {result.bonusRule === "none" ? t.bonusNone : t.bonus(P(result.bonusPct))} ({cite(rules.cite.bonus, locale)})
                    </dt>
                    <dd>{result.bonusRule === "none" ? "—" : `−${M(result.bonus)}`}</dd>
                  </div>
                </>
              ) : null}
              <div className="ci-calc-total">
                <dt>{t.toPay}</dt>
                <dd>{M(result.toPay)}</dd>
              </div>
            </dl>
            {result.baseLiquidable === 0 ? <p className="ci-calc-note">{t.noBase}</p> : null}
            {result.row ? <p className="ci-calc-note">{t.row(M(result.row.from), M(result.row.quota), M(result.row.rest), P(result.row.rate), M(result.row.onRest))}</p> : null}
            {result.notes.map((n) => (
              <p key={n} className="ci-calc-note">
                {regionalNote(n, rules, locale)}
              </p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
