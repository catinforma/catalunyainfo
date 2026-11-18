"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, LIMIT_LABEL, PAYMENTS_LABEL, euros, money, times, type IpremLocale } from "@/lib/programmatic/iprem/copy";
import { commonLimits, floor2, incomeInIprem, multipleOf, withinLimit, type Payments } from "@/lib/programmatic/iprem/engine";
import { IPREM_14, IPREM_ANNUAL } from "@/lib/programmatic/iprem/rules";

/**
 * The IPREM calculator: "x veces el IPREM" in a month, a day and a year in 12
 * or 14 payments, and "mis ingresos son x veces el IPREM" against the common
 * limits whose rule names a multiple and a base. Server-rendered on 1.5 times
 * (14 payments) and 12,000 € a year, so it answers without JavaScript.
 */

const DEFAULT_MULTIPLE = "1,5";
const DEFAULT_PAYMENTS: Payments = 14;
const DEFAULT_INCOME = "12.000";

export function IpremCalculator({ locale }: { locale: IpremLocale }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [multiple, setMultiple] = useState(locale === "en" ? DEFAULT_MULTIPLE.replace(",", ".") : DEFAULT_MULTIPLE);
  const [payments, setPayments] = useState<Payments>(DEFAULT_PAYMENTS);
  const [income, setIncome] = useState(locale === "en" ? DEFAULT_INCOME.replace(".", ",") : DEFAULT_INCOME);
  const result = multipleOf(parseAmount(multiple));
  const ratio = incomeInIprem(parseAmount(income));
  const other: Payments = payments === 14 ? 12 : 14;
  const limits = commonLimits();
  const M = (n: number) => money(n, locale);

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("iprem", locale, [result, ratio]);

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
          <label htmlFor={`${id}-multiple`}>{t.multiple}</label>
          <span className="ci-calc-number">
            <input id={`${id}-multiple`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-multiple-hint`} value={multiple} onChange={(e) => setMultiple(e.target.value)} />
            <span className="ci-calc-suffix">×</span>
          </span>
          <span id={`${id}-multiple-hint`} className="ci-calc-note">
            {t.multipleHint}
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
          <p role="alert">{t.invalidMultiple}</p>
        ) : (
          <dl className="ci-calc-results">
            <div className="ci-calc-total">
              <dt>{t.yearly(payments)}</dt>
              <dd>{euros(payments === 14 ? result.annual14 : result.annual12, locale)}</dd>
            </div>
            <div>
              <dt>{t.other(other)}</dt>
              <dd>{euros(other === 14 ? result.annual14 : result.annual12, locale)}</dd>
            </div>
            <div>
              <dt>{t.monthly}</dt>
              <dd>{euros(result.monthly, locale)}</dd>
            </div>
            <div>
              <dt>{t.daily}</dt>
              <dd>{euros(result.daily, locale)}</dd>
            </div>
          </dl>
        )}
      </div>

      <h3 className="ci-calc-title">{t.incomeTitle}</h3>
      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-income`}>{t.income}</label>
          <span className="ci-calc-number">
            <input id={`${id}-income`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-income-hint`} value={income} onChange={(e) => setIncome(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-income-hint`} className="ci-calc-note">
            {t.incomeHint}
          </span>
        </p>
      </div>
      <div aria-live="polite">
        {ratio.status === "invalid" ? (
          <p role="alert">{t.invalidIncome}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.ratio(12, M(IPREM_ANNUAL))}</dt>
                <dd>{times(floor2(ratio.times12), locale)} ×</dd>
              </div>
              <div>
                <dt>{t.ratio(14, M(IPREM_14))}</dt>
                <dd>{times(floor2(ratio.times14), locale)} ×</dd>
              </div>
            </dl>
            <div className="ci-table-scroll mt-4">
              <table className="ci-local-table ci-stack-table">
                <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{t.compare}</caption>
                <thead>
                  <tr>
                    {t.compareCols.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {limits.map((l) => (
                    <tr key={l.id}>
                      <th scope="row" className="font-normal">
                        {LIMIT_LABEL[l.id][locale]}: {times(l.multiple, locale)} × IPREM, {PAYMENTS_LABEL[locale][`${l.payments}`]}
                      </th>
                      <td data-label={t.compareCols[1]}>{M(l.amount)}</td>
                      <td data-label={t.compareCols[2]}>{withinLimit(ratio.income, l) ? t.within : t.above}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ci-calc-note">{t.compareNote}</p>
          </>
        )}
      </div>
    </section>
  );
}
