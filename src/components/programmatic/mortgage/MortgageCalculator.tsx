"use client";

import { useId, useState } from "react";

import { CALC_COPY, centsText, monthText, num, rateInput, rateText, type MortgageLocale } from "@/lib/programmatic/mortgage/copy";
import { computeMortgage, parseAmount, parsePct, parseWhole, type MortgageKind } from "@/lib/programmatic/mortgage/engine";

/**
 * The mortgage calculator: fixed, variable (Euribor + spread, optional
 * initial months) or mixed; French amortisation in cents (mortgage/engine.ts).
 * The Euribor field starts on the latest official monthly figure (Banco de
 * España / BOE), passed in by the server. Server-rendered on the default
 * example, so the result and the yearly table are in the HTML without
 * JavaScript.
 */

export interface MortgageDefaults {
  kind: MortgageKind;
  amount: number;
  years: number;
  fixedPct: number;
  fixedYears: number;
  spreadPct: number;
}

export function MortgageCalculator({ locale, euribor, defaults }: { locale: MortgageLocale; euribor: { value: number; month: string } | null; defaults: MortgageDefaults }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const official = euribor ? rateInput(euribor.value, locale) : "";
  const [kind, setKind] = useState<MortgageKind>(euribor ? defaults.kind : "fixed");
  const [amount, setAmount] = useState(num(defaults.amount, 0, locale));
  const [years, setYears] = useState(String(defaults.years));
  const [fixedPct, setFixedPct] = useState(num(defaults.fixedPct, 2, locale));
  const [fixedYears, setFixedYears] = useState(String(defaults.fixedYears));
  const [eur, setEur] = useState(official);
  const [spread, setSpread] = useState(num(defaults.spreadPct, 2, locale));
  const [initialPct, setInitialPct] = useState(num(defaults.fixedPct, 2, locale));
  const [initialMonths, setInitialMonths] = useState("0");

  const result = computeMortgage({
    kind,
    amount: parseAmount(amount),
    years: parseWhole(years),
    fixedPct: parsePct(fixedPct),
    fixedYears: parseWhole(fixedYears),
    euriborPct: parsePct(eur),
    spreadPct: parsePct(spread),
    initialPct: parsePct(initialPct),
    initialMonths: parseWhole(initialMonths),
  });
  const variable = kind !== "fixed";
  const eurNum = parsePct(eur);

  const field = (key: string, label: string, value: string, set: (v: string) => void, suffix: string, opts: { hint?: string; mode?: "decimal" | "numeric" } = {}) => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <span className="ci-calc-number">
        <input
          id={`${id}-${key}`}
          className="ci-field"
          type="text"
          inputMode={opts.mode ?? "decimal"}
          autoComplete="off"
          aria-describedby={opts.hint ? `${id}-${key}-hint` : undefined}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        {suffix ? <span className="ci-calc-suffix">{suffix}</span> : null}
      </span>
      {opts.hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {opts.hint}
        </span>
      ) : null}
    </p>
  );

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
        <fieldset className="ci-calc-row ci-calc-wide m-0 border-0 p-0">
          <legend className="mb-1 text-sm font-medium">{t.kind}</legend>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {(["fixed", "variable", "mixed"] as const).map((k) => (
              <label key={k} className="inline-flex items-center gap-1.5">
                <input type="radio" name={`${id}-kind`} value={k} checked={kind === k} disabled={k !== "fixed" && !euribor} onChange={() => setKind(k)} />
                {t.kinds[k]}
              </label>
            ))}
          </span>
        </fieldset>
        {field("amount", t.amount, amount, setAmount, "€", { hint: t.amountHint, mode: "numeric" })}
        {field("years", t.years, years, setYears, "", { mode: "numeric" })}
        {kind !== "variable" ? field("fixed", t.fixedPct, fixedPct, setFixedPct, "%", { hint: t.fixedHint }) : null}
        {kind === "mixed" ? field("fixedYears", t.fixedYears, fixedYears, setFixedYears, "", { mode: "numeric" }) : null}
        {variable ? (
          <p className="ci-calc-row">
            <label htmlFor={`${id}-eur`}>{t.euribor}</label>
            <span className="ci-calc-number">
              <input id={`${id}-eur`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-eur-hint`} value={eur} onChange={(e) => setEur(e.target.value)} />
              <span className="ci-calc-suffix">%</span>
            </span>
            {euribor ? (
              <span id={`${id}-eur-hint`} className="ci-calc-note">
                {t.euriborHint(rateText(euribor.value, locale), monthText(euribor.month, locale))}{" "}
                {eur !== official ? (
                  <button type="button" className="underline" onClick={() => setEur(official)}>
                    {t.resetEuribor}
                  </button>
                ) : null}
              </span>
            ) : null}
          </p>
        ) : null}
        {variable ? field("spread", t.spread, spread, setSpread, "%", { hint: t.spreadHint }) : null}
        {kind === "variable" ? field("initialMonths", t.initialMonths, initialMonths, setInitialMonths, "", { hint: t.initialHint, mode: "numeric" }) : null}
        {kind === "variable" && parseWhole(initialMonths) > 0 ? field("initialPct", t.initialPct, initialPct, setInitialPct, "%") : null}
      </div>

      <div aria-live="polite">
        <h3 className="mt-2 text-base">{t.results}</h3>
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>
                  {t.firstPayment}
                  {result.schedule.periods.length > 1 ? ` (${rateText(result.schedule.periods[0]!.annualPct, locale)})` : ""}
                </dt>
                <dd>{centsText(result.schedule.periods[0]!.payment, locale)}</dd>
              </div>
              {result.schedule.periods.slice(1).map((p) => (
                <div key={p.from} className="ci-calc-total">
                  <dt>{t.laterPayment(Math.floor((p.from - 1) / 12) + 1, rateText(p.annualPct, locale))}</dt>
                  <dd>{centsText(p.payment, locale)}</dd>
                </div>
              ))}
              <div>
                <dt>{t.totalInterest}</dt>
                <dd>{centsText(result.schedule.totalInterest, locale)}</dd>
              </div>
              <div>
                <dt>{t.totalPaid}</dt>
                <dd>{centsText(result.schedule.totalPaid, locale)}</dd>
              </div>
            </dl>
            {result.floored ? <p className="ci-calc-note">{t.floored}</p> : null}
            {variable && Number.isFinite(eurNum) ? <p className="ci-calc-note">{t.assumption(rateText(eurNum, locale), euribor && eur === official ? monthText(euribor.month, locale) : t.euribor)}</p> : null}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">{t.yearly}</summary>
              <div className="ci-table-scroll mt-2">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{t.yearlyCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t.cols.year}</th>
                      <th scope="col">{t.cols.paid}</th>
                      <th scope="col">{t.cols.interest}</th>
                      <th scope="col">{t.cols.principal}</th>
                      <th scope="col">{t.cols.balance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.years.map((y) => (
                      <tr key={y.year}>
                        <th scope="row" className="font-normal">
                          {y.year}
                        </th>
                        <td data-label={t.cols.paid}>{centsText(y.paid, locale)}</td>
                        <td data-label={t.cols.interest}>{centsText(y.interest, locale)}</td>
                        <td data-label={t.cols.principal}>{centsText(y.principal, locale)}</td>
                        <td data-label={t.cols.balance}>{centsText(y.balance, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </div>
    </section>
  );
}
