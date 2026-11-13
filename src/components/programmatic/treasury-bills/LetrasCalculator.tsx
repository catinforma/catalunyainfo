"use client";

import { useId, useState } from "react";

import { CALC_COPY, bareDay, euros, num, pct, price3, rate3, weekdayDay, type LetrasLocale } from "@/lib/programmatic/treasury-bills/copy";
import { computeBill, parseEuros, parseRate } from "@/lib/programmatic/treasury-bills/engine";
import type { Term } from "@/lib/programmatic/treasury-bills/results";

/**
 * The Letras del Tesoro calculator: face value (multiples of 1,000 €), term
 * and rate (prefilled with the term's latest average rate from the Tesoro,
 * editable) → price per bill, what you pay, what you get back, the gross
 * return, the TAE-equivalent, the IRPF estimate and the Banco de España fee.
 * Server-rendered on 10,000 € at 12 months, so it answers without
 * JavaScript. Only terms with a checked Tesoro result are offered.
 */

export interface TermOption {
  term: Term;
  days: number;
  avgRate: number;
  auction: string;
  maturity: string;
  next: { auction: string; requestsBy: string } | null;
}

export function LetrasCalculator({ locale, options, initialTerm, initialAmount }: { locale: LetrasLocale; options: TermOption[]; initialTerm: Term; initialAmount: number }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const start = options.find((o) => o.term === initialTerm) ?? options.at(-1)!;
  const [term, setTerm] = useState<Term>(start.term);
  const [amount, setAmount] = useState(num(initialAmount, 0, locale));
  const [rate, setRate] = useState(num(start.avgRate, 3, locale));
  const option = options.find((o) => o.term === term) ?? start;
  const avgText = num(option.avgRate, 3, locale);
  const result = computeBill({ nominal: parseEuros(amount), ratePct: parseRate(rate), days: option.days });

  function pickTerm(value: number) {
    const next = options.find((o) => o.term === value);
    if (!next) return;
    setTerm(next.term);
    setRate(num(next.avgRate, 3, locale));
  }

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
            <input id={`${id}-amount`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" aria-describedby={`${id}-amount-hint`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-amount-hint`} className="ci-calc-note">
            {t.amountHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-term`}>{t.term}</label>
          <select id={`${id}-term`} className="ci-field" value={term} onChange={(e) => pickTerm(Number(e.target.value))}>
            {options.map((o) => (
              <option key={o.term} value={o.term}>
                {t.termOption(o.term, o.days, bareDay(o.auction, locale))}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-rate`}>{t.rate}</label>
          <span className="ci-calc-number">
            <input id={`${id}-rate`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-rate-hint`} value={rate} onChange={(e) => setRate(e.target.value)} />
            <span className="ci-calc-suffix">%</span>
          </span>
          <span id={`${id}-rate-hint`} className="ci-calc-note">
            {t.rateHint(rate3(option.avgRate, locale), bareDay(option.auction, locale))}{" "}
            {rate !== avgText ? (
              <button type="button" className="underline" onClick={() => setRate(avgText)}>
                {t.resetRate}
              </button>
            ) : null}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.gross}</dt>
                <dd>{euros(result.gross, locale)}</dd>
              </div>
              <div>
                <dt>{t.paid}</dt>
                <dd>
                  {euros(result.paid, locale)} <span className="text-sm">({t.bills(result.bills)})</span>
                </dd>
              </div>
              <div>
                <dt>{t.repaid(bareDay(option.maturity, locale))}</dt>
                <dd>{euros(result.nominal, locale)}</dd>
              </div>
              <div>
                <dt>{t.price}</dt>
                <dd>
                  {price3(result.pricePct, locale)} · {euros((1000 * result.pricePct) / 100, locale)}
                </dd>
              </div>
              <div>
                <dt>{t.tae}</dt>
                <dd>{pct(result.taePct, 3, locale)}</dd>
              </div>
              <div>
                <dt>{t.tax}</dt>
                <dd>{euros(result.tax, locale)}</dd>
              </div>
              <div>
                <dt>{t.net}</dt>
                <dd>{euros(result.net, locale)}</dd>
              </div>
              <div>
                <dt>{t.fee}</dt>
                <dd>{euros(result.bdeFee, locale)}</dd>
              </div>
            </dl>
            <p className="ci-calc-note">{t.taeHint(option.days)}</p>
            <p className="ci-calc-note">{t.taxHint}</p>
            <p className="ci-calc-note">{t.feeHint}</p>
          </>
        )}
        <p className="ci-calc-note">{option.next ? t.next(weekdayDay(option.next.auction, locale), weekdayDay(option.next.requestsBy, locale)) : t.noNext}</p>
      </div>
    </section>
  );
}
