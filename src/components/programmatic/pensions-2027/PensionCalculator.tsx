"use client";

import { useId, useState } from "react";

import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, euros, percentText, type PensionLocale } from "@/lib/programmatic/pensions-2027/copy";
import { revaluePension, type Payments, type PensionInput, type RateStatus } from "@/lib/programmatic/pensions-2027/engine";

/**
 * The 2027 pension calculator: gross monthly pension and payments a year.
 * Server-rendered with the page's worked example (1.000 € in 14 payments),
 * so it answers without JavaScript; in the browser every change recomputes
 * in place with `engine.ts` and the percentage the server worked out from
 * the INE's figures of this render.
 */

export function PensionCalculator({ locale, status, initial }: { locale: PensionLocale; status: RateStatus; initial: PensionInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [amount, setAmount] = useState(String(initial.monthly));
  const [payments, setPayments] = useState<Payments>(initial.payments);
  const result = revaluePension({ monthly: parseAmount(amount), payments }, status.percent);
  const p = percentText(status, locale);

  return (
    <section className="ci-calc" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-amount`}>{t.amount}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-amount`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-describedby={`${id}-hint`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-hint`} className="ci-calc-note">
            {t.amountHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-payments`}>{t.payments}</label>
          <select id={`${id}-payments`} className="ci-field" value={payments} onChange={(e) => setPayments(Number(e.target.value) === 12 ? 12 : 14)}>
            <option value={14}>{t.paymentOptions["14"]}</option>
            <option value={12}>{t.paymentOptions["12"]}</option>
          </select>
        </p>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.monthly2027}</dt>
                <dd>{euros(result.monthly2027, locale)}</dd>
              </div>
              <div>
                <dt>{t.rateLabel(status)}</dt>
                <dd>{p}</dd>
              </div>
              <div>
                <dt>{t.monthlyRise}</dt>
                <dd>+{euros(result.monthlyRise, locale)}</dd>
              </div>
              <div>
                <dt>{t.annual2027}</dt>
                <dd>{euros(result.annual2027, locale)}</dd>
              </div>
              <div>
                <dt>{t.annualRise}</dt>
                <dd>+{euros(result.annualRise, locale)}</dd>
              </div>
            </dl>
            <p className="ci-calc-note">{t.basis(status, p)}</p>
            {result.notes.map((n) => (
              <p key={n} className="ci-calc-note">
                {t.notes[n]}
              </p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
