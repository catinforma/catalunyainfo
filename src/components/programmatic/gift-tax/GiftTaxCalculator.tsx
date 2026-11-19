"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { GIFT_CALC_COPY, GIFT_KIND_LABEL, GIFT_REDUCTION_LABEL, GIFT_REGION_NAME, giftCite, giftFormLabels, giftNote, giftReductionCite, giftRelationLabel, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { calculateGift, type GiftInput } from "@/lib/programmatic/gift-tax/engine";
import { GIFT_KINDS, GIFT_RELATIONS, type GiftKind, type GiftRelation, type GiftRules } from "@/lib/programmatic/gift-tax/regions/types";
import { DISABILITY_LABEL, GROUP_LABEL, money, num, percent } from "@/lib/programmatic/inheritance-tax/copy";
import type { Disability } from "@/lib/programmatic/inheritance-tax/engine";

/**
 * One gift's tax in Catalonia, Madrid, Andalucía or the Comunitat
 * Valenciana: the community's rules arrive as a prop (numbers only); the
 * inputs are who the donee is, their age and disability, what is given, the
 * formal requirements (public document, origin of cash), the home purpose
 * where the community has a reduction for it, prior wealth and earlier gifts
 * from the same donor. Server-rendered on the page's first example, so it
 * answers without JavaScript.
 */

const DISABILITIES: Disability[] = [0, 33, 65];

export function GiftTaxCalculator({ locale, rules, initial }: { locale: GiftLocale; rules: GiftRules; initial: GiftInput }) {
  const t = GIFT_CALC_COPY[locale];
  const f = giftFormLabels(rules.id, locale);
  const id = useId();
  const [relation, setRelation] = useState<GiftRelation>(initial.relation);
  const [age, setAge] = useState(String(initial.age));
  const [disability, setDisability] = useState<Disability>(initial.disability);
  const [mental, setMental] = useState(initial.mentalDisability);
  const [kind, setKind] = useState<GiftKind>(initial.kind);
  const [amount, setAmount] = useState(String(initial.amount));
  const [deed, setDeed] = useState(initial.publicDeed);
  const [funds, setFunds] = useState(initial.fundsOrigin);
  const [forHome, setForHome] = useState(initial.forHome);
  const [prior, setPrior] = useState(String(initial.priorWealth));
  const [previous, setPrevious] = useState(String(initial.previousGifts));

  const ageText = age.trim();
  const homeOffered = rules.home !== null && rules.home.kinds.includes(kind);
  const fundsOffered = kind === "money" && rules.bonus !== null;
  const result = calculateGift(rules, {
    relation,
    age: /^\d{1,3}$/.test(ageText) ? Number(ageText) : Number.NaN,
    disability,
    mentalDisability: mental,
    amount: parseAmount(amount),
    kind,
    publicDeed: deed,
    fundsOrigin: fundsOffered && funds,
    forHome: homeOffered && forHome,
    priorWealth: parseAmount(prior),
    previousGifts: parseAmount(previous),
  });
  const calcUse = useCalculatorUse(rules.calculatorId, locale, result);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const flat = rules.coefficients.length === 1;

  const amountField = (key: string, label: string, value: string, set: (v: string) => void, hint?: string) => (
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
        <span className="ci-calc-suffix">€</span>
      </span>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );

  const check = (key: string, label: string, checked: boolean, set: (v: boolean) => void, hint?: string | null) => (
    <p className="ci-calc-row ci-calc-wide">
      <label htmlFor={`${id}-${key}`} className="flex items-start gap-2 font-normal">
        <input id={`${id}-${key}`} type="checkbox" className="mt-1" checked={checked} onChange={(e) => set(e.target.checked)} aria-describedby={hint ? `${id}-${key}-hint` : undefined} />
        <span>{label}</span>
      </label>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );

  const scaleCite = result.status === "ok" && result.scaleUsed === "reduced" ? rules.cite.reducedScale! : rules.cite.scale;

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title(GIFT_REGION_NAME[rules.id][locale])}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-relation`}>{t.relation}</label>
          <select id={`${id}-relation`} className="ci-field" value={relation} onChange={(e) => setRelation(e.target.value as GiftRelation)}>
            {GIFT_RELATIONS.map((r) => (
              <option key={r} value={r}>
                {giftRelationLabel(rules.id, r, locale)}
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
        {rules.disability?.mentalFrom33As65 && disability === 33 ? check("mental", t.mental, mental, setMental) : null}
        <p className="ci-calc-row">
          <label htmlFor={`${id}-kind`}>{t.kind}</label>
          <select id={`${id}-kind`} className="ci-field" value={kind} onChange={(e) => setKind(e.target.value as GiftKind)}>
            {GIFT_KINDS.map((k) => (
              <option key={k} value={k}>
                {GIFT_KIND_LABEL[k][locale]}
              </option>
            ))}
          </select>
        </p>
        {amountField("amount", t.amount, amount, setAmount, t.amountHint)}
        {check("deed", f.deed, deed, setDeed, f.deedHint)}
        {fundsOffered ? check("funds", f.funds, funds, setFunds, f.fundsHint || null) : null}
        {homeOffered && f.home ? check("home", f.home, forHome, setForHome, f.homeHint) : null}
        {amountField("prior", t.prior, prior, setPrior, t.priorHint(flat))}
        {amountField("previous", t.previous, previous, setPrevious, t.previousHint)}
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
              {t.groupLine(GROUP_LABEL[result.group][locale])} {result.toPay > 0 ? t.effective(P(result.effectiveRate * 100), M(result.baseImposable)) : result.bonusRule === "small" ? null : t.zero}
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
                    {GIFT_REDUCTION_LABEL[rules.id][r.id][locale]} ({giftCite(giftReductionCite(rules, r.id, kind), locale)})
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
                  {result.accumulation ? (
                    <div>
                      <dt>{t.theoreticalBase}</dt>
                      <dd>{M(result.accumulation.theoreticalBase)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>
                      {t.quotaIntegra} ({giftCite(scaleCite, locale)}
                      {result.scaleUsed === "reduced" ? `, ${t.reducedScale}` : ""})
                    </dt>
                    <dd>{M(result.quotaIntegra)}</dd>
                  </div>
                  <div>
                    <dt>
                      {t.coefficient(num(result.coefficient, 4, locale), GROUP_LABEL[result.group][locale])} ({giftCite(rules.cite.coefficient, locale)})
                    </dt>
                    <dd>{M(result.quotaIntegra * result.coefficient)}</dd>
                  </div>
                  {result.excess > 0 ? (
                    <div>
                      <dt>
                        {t.excess} ({giftCite(rules.cite.excess, locale)})
                      </dt>
                      <dd>−{M(result.excess)}</dd>
                    </div>
                  ) : null}
                  {result.accumulation ? (
                    <>
                      <div>
                        <dt>{t.theoreticalQuota}</dt>
                        <dd>{M(result.accumulation.theoreticalTax)}</dd>
                      </div>
                      <div>
                        <dt>{t.quotaFromRate(M(result.baseLiquidable), P(result.accumulation.averageRate))}</dt>
                        <dd>{M(result.quotaTributaria)}</dd>
                      </div>
                    </>
                  ) : (
                    <div>
                      <dt>{t.quotaTributaria}</dt>
                      <dd>{M(result.quotaTributaria)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>
                      {rules.bonus === null ? t.noBonusRegion : result.bonusRule === "none" ? t.bonusNone : t.bonus(P(result.bonusPct))}
                      {rules.bonus !== null ? ` (${giftCite((result.bonusRule === "small" ? rules.cite.smallGift : rules.cite.bonus)!, locale)})` : ""}
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
                {giftNote(n, rules, locale)}
              </p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
