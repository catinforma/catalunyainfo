"use client";

import { useId, useState } from "react";

import { REVISION_COPY, centsText, num, optionMonth, rateText, signedCents, type EuriborOption, type MortgageLocale } from "@/lib/programmatic/mortgage/copy";
import { computeRevision, parseAmount, parsePct, parseWhole } from "@/lib/programmatic/mortgage/engine";

/**
 * "Revisión de tu hipoteca": capital outstanding, time left and spread, the
 * Euribor of the previous revision and the one that applies now, each
 * picked from the official months (Banco de España / BOE, newest first) or
 * typed; → the old and new instalment and the difference. Server-rendered
 * on the default example (new = latest official month, old = the same month
 * a year earlier), so it answers without JavaScript.
 */

const OTHER = "other";

export interface RevisionDefaults {
  balance: number;
  years: number;
  months: number;
  spreadPct: number;
}

export function RevisionCalculator({ locale, options, defaults }: { locale: MortgageLocale; options: EuriborOption[]; defaults: RevisionDefaults }) {
  const t = REVISION_COPY[locale];
  const id = useId();
  const latest = options[0] ?? null;
  const yearAgo = latest ? (options.find((o) => o.month === `${Number(latest.month.slice(0, 4)) - 1}${latest.month.slice(4)}`) ?? options.at(-1) ?? null) : null;
  const [balance, setBalance] = useState(num(defaults.balance, 0, locale));
  const [years, setYears] = useState(String(defaults.years));
  const [months, setMonths] = useState(String(defaults.months));
  const [spread, setSpread] = useState(num(defaults.spreadPct, 2, locale));
  const [oldPick, setOldPick] = useState(yearAgo?.month ?? OTHER);
  const [newPick, setNewPick] = useState(latest?.month ?? OTHER);
  const [oldOther, setOldOther] = useState("");
  const [newOther, setNewOther] = useState("");

  const valueOf = (pick: string, other: string) => (pick === OTHER ? parsePct(other) : (options.find((o) => o.month === pick)?.value ?? Number.NaN));
  const y = parseWhole(years);
  const m = parseWhole(months);
  const result = computeRevision({
    balance: parseAmount(balance),
    monthsLeft: Number.isFinite(y) && Number.isFinite(m) && m < 12 ? y * 12 + m : Number.NaN,
    spreadPct: parsePct(spread),
    oldEuriborPct: valueOf(oldPick, oldOther),
    newEuriborPct: valueOf(newPick, newOther),
  });

  const pick = (key: string, label: string, value: string, set: (v: string) => void, other: string, setOther: (v: string) => void) => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <select id={`${id}-${key}`} className="ci-field" value={value} aria-describedby={`${id}-month-hint`} onChange={(e) => set(e.target.value)}>
        {options.map((o) => (
          <option key={o.month} value={o.month}>
            {t.optionLabel(optionMonth(o.month, locale), rateText(o.value, locale))}
          </option>
        ))}
        <option value={OTHER}>{t.other}</option>
      </select>
      {value === OTHER ? (
        <span className="ci-calc-number">
          <input aria-label={`${label}: ${t.otherValue}`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={other} onChange={(e) => setOther(e.target.value)} />
          <span className="ci-calc-suffix">%</span>
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
        <p className="ci-calc-row">
          <label htmlFor={`${id}-balance`}>{t.balance}</label>
          <span className="ci-calc-number">
            <input id={`${id}-balance`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" aria-describedby={`${id}-balance-hint`} value={balance} onChange={(e) => setBalance(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-balance-hint`} className="ci-calc-note">
            {t.balanceHint}
          </span>
        </p>
        <fieldset className="ci-calc-row m-0 border-0 p-0">
          <legend className="mb-1 text-sm font-medium">{t.yearsLeft}</legend>
          <span className="ci-calc-number">
            <input aria-label={t.yearsLeft} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={years} onChange={(e) => setYears(e.target.value)} />
            <span className="ci-calc-suffix">{t.monthsLeft}</span>
            <input aria-label={t.monthsLeft} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={months} onChange={(e) => setMonths(e.target.value)} />
          </span>
        </fieldset>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-spread`}>{t.spread}</label>
          <span className="ci-calc-number">
            <input id={`${id}-spread`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={spread} onChange={(e) => setSpread(e.target.value)} />
            <span className="ci-calc-suffix">%</span>
          </span>
        </p>
        {pick("old", t.oldEuribor, oldPick, setOldPick, oldOther, setOldOther)}
        {pick("new", t.newEuribor, newPick, setNewPick, newOther, setNewOther)}
        <p id={`${id}-month-hint`} className="ci-calc-note ci-calc-wide">
          {t.monthHint}
        </p>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <p className="mt-2 font-semibold">{result.monthly > 0 ? t.up : result.monthly < 0 ? t.down : t.same}</p>
            <dl className="ci-calc-results">
              <div>
                <dt>{t.oldPayment(rateText(result.oldPct, locale))}</dt>
                <dd>{centsText(result.oldPayment, locale)}</dd>
              </div>
              <div className="ci-calc-total">
                <dt>{t.newPayment(rateText(result.newPct, locale))}</dt>
                <dd>{centsText(result.newPayment, locale)}</dd>
              </div>
              <div>
                <dt>{t.monthly}</dt>
                <dd>{signedCents(result.monthly, locale)}</dd>
              </div>
              <div>
                <dt>{t.yearly}</dt>
                <dd>{signedCents(result.yearly, locale)}</dd>
              </div>
            </dl>
            {result.floored ? <p className="ci-calc-note">{t.floored}</p> : null}
            <p className="ci-calc-note">{t.approx}</p>
          </>
        )}
      </div>
    </section>
  );
}
