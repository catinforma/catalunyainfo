"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, KIND_LABEL, NOTE_TEXT, TABLE_LABEL, WHO_PAYS, coef, deadlineText, money, percent, periodText, type PvLocale } from "@/lib/programmatic/plusvalia/copy";
import { KINDS, calculate, tableValue, type Kind, type MethodResult, type PvInput } from "@/lib/programmatic/plusvalia/engine";

/**
 * The plusvalía municipal of one transfer: kind, dates, the land's and the
 * total cadastral value, the share, the two prices and what the council sets
 * (rate, coefficient, rebate); out come the period and coefficient, the
 * objective and the real-gain bases and taxes, the lower one, who pays and
 * the deadline, each step with its article. Server-rendered on a December
 * 2026 sale, so it answers without JavaScript.
 */

export function PlusvaliaCalculator({ locale, initial }: { locale: PvLocale; initial: PvInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [kind, setKind] = useState<Kind>(initial.kind);
  const [acquired, setAcquired] = useState(initial.acquired);
  const [transferred, setTransferred] = useState(initial.transferred);
  const [land, setLand] = useState(String(initial.landValue));
  const [total, setTotal] = useState(initial.totalValue ? String(initial.totalValue) : "");
  const [share, setShare] = useState(String(initial.sharePct));
  const [acq, setAcq] = useState(initial.acquisitionValue ? String(initial.acquisitionValue) : "");
  const [trans, setTrans] = useState(initial.transferValue ? String(initial.transferValue) : "");
  const [rate, setRate] = useState(String(initial.rate));
  const [councilCoef, setCouncilCoef] = useState(initial.councilCoefficient === null ? "" : String(initial.councilCoefficient));
  const [bonus, setBonus] = useState(initial.bonusPct ? String(initial.bonusPct) : "");

  const inheritance = kind === "inheritance";
  const result = calculate({
    kind,
    acquired,
    transferred,
    landValue: parseAmount(land),
    totalValue: parseAmount(total),
    acquisitionValue: parseAmount(acq),
    transferValue: parseAmount(trans),
    sharePct: parseAmount(share),
    rate: parseAmount(rate),
    councilCoefficient: councilCoef.trim() ? parseAmount(councilCoef) : null,
    bonusPct: inheritance ? parseAmount(bonus) : 0,
  });
  const calcUse = useCalculatorUse("plusvalia", locale, result);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const C = (n: number) => coef(n, locale);
  const maxHint = result.status === "ok" ? C(tableValue(result.table, result.years)) : "—";

  const field = (key: string, label: string, value: string, set: (v: string) => void, hint?: string, suffix = "€", mode: "decimal" | "numeric" = "decimal") => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <span className="ci-calc-number">
        <input
          id={`${id}-${key}`}
          className="ci-field"
          type="text"
          inputMode={mode}
          autoComplete="off"
          value={value}
          onChange={(e) => set(e.target.value)}
          aria-describedby={hint ? `${id}-${key}-hint` : undefined}
        />
        {suffix ? <span className="ci-calc-suffix">{suffix}</span> : null}
      </span>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );

  const methodRows = (m: MethodResult) => (
    <>
      <div>
        <dt>{t.cuotaIntegra(P(parseAmount(rate)))}</dt>
        <dd>{M(m.cuotaIntegra)}</dd>
      </div>
      {result.status === "ok" && result.bonusApplies && m.bonus > 0 ? (
        <div>
          <dt>{t.bonusLine(P(parseAmount(bonus)))}</dt>
          <dd>−{M(m.bonus)}</dd>
        </div>
      ) : null}
      <div>
        <dt>{t.cuotaLiquida}</dt>
        <dd>{M(m.cuotaLiquida)}</dd>
      </div>
    </>
  );

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-kind`}>{t.kind}</label>
          <select id={`${id}-kind`} className="ci-field" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k][locale]}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-acquired`}>{t.acquired[kind]}</label>
          <input id={`${id}-acquired`} className="ci-field" type="date" value={acquired} onChange={(e) => setAcquired(e.target.value)} aria-describedby={`${id}-acquired-hint`} />
          <span id={`${id}-acquired-hint`} className="ci-calc-note">
            {t.acquiredHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-transferred`}>{t.transferred[kind]}</label>
          <input id={`${id}-transferred`} className="ci-field" type="date" value={transferred} onChange={(e) => setTransferred(e.target.value)} aria-describedby={`${id}-transferred-hint`} />
          <span id={`${id}-transferred-hint`} className="ci-calc-note">
            {t.transferredHint}
          </span>
        </p>
        {field("land", t.land, land, setLand, t.landHint)}
        {field("share", t.share, share, setShare, t.shareHint, "%")}

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.realLegend}</legend>
          {field("total", t.total, total, setTotal, t.totalHint)}
          {field("acq", t.acquisitionValue, acq, setAcq, t.acquisitionHint)}
          {field("trans", t.transferValue, trans, setTrans, t.transferHint)}
        </fieldset>

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.councilLegend}</legend>
          {field("rate", t.rate, rate, setRate, t.rateHint, "%")}
          {field("coef", t.coefficient, councilCoef, setCouncilCoef, t.coefficientHint(maxHint), "")}
          {inheritance ? field("bonus", t.bonus, bonus, setBonus, t.bonusHint, "%") : null}
        </fieldset>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{result.notSubject ? t.notSubject : t.toPay}</dt>
                <dd>{M(result.toPay)}</dd>
              </div>
            </dl>
            <p className="ci-calc-note">
              {result.chosen === "real" ? t.chosenReal : result.chosen === "objective" && result.real ? t.chosenObjective : null} {WHO_PAYS[result.kind][locale]}{" "}
              {deadlineText(result.kind, transferred, locale)}{" "}
              {result.kind !== "inheritance" ? <Link href={calcPath("working-days", locale)}>{t.workingDaysLink}</Link> : null}
            </p>

            <h3 className="mt-4 text-base">{t.objectiveTitle}</h3>
            <dl className="ci-calc-results">
              <div>
                <dt>{t.period}</dt>
                <dd>{periodText(result.years, result.months, locale)}</dd>
              </div>
              <div>
                <dt>{t.maxCoefficient(TABLE_LABEL[result.table.id][locale])}</dt>
                <dd>{C(result.maxCoefficient)}</dd>
              </div>
              {result.coefficient !== result.maxCoefficient ? (
                <div>
                  <dt>{t.coefficientApplied}</dt>
                  <dd>{C(result.coefficient)}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t.landLine} (art. 107.2.a)</dt>
                <dd>{M(result.land)}</dd>
              </div>
              <div>
                <dt>{t.base} (art. 107.1)</dt>
                <dd>
                  {M(result.land)} × {C(result.coefficient)} = {M(result.objective.base)}
                </dd>
              </div>
              {methodRows(result.objective)}
            </dl>

            {result.realGain !== null && result.landRatio !== null ? (
              <>
                <h3 className="mt-4 text-base">{t.realTitle}</h3>
                <dl className="ci-calc-results">
                  <div>
                    <dt>{t.landRatio}</dt>
                    <dd>{P(result.landRatio * 100)}</dd>
                  </div>
                  <div>
                    <dt>{t.realGain}</dt>
                    <dd>{M(result.realGain)}</dd>
                  </div>
                  {result.real ? methodRows(result.real) : null}
                </dl>
              </>
            ) : null}

            {result.notes
              .filter((n) => n !== "real-lower")
              .map((n) => (
                <p key={n} className="ci-calc-note">
                  {NOTE_TEXT[n][locale]}
                </p>
              ))}
          </>
        )}
      </div>
    </section>
  );
}
