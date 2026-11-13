"use client";

import { useEffect, useId, useState } from "react";

import { CALC_COPY, bandName, money, parseAmount, percent, rangeText, readHash, writeHash, type SeLocale } from "@/lib/programmatic/self-employed/copy";
import { calculateSelfEmployed, type FlatRate, type Period, type SelfEmployedInput } from "@/lib/programmatic/self-employed/engine";

/**
 * The self-employed contributions calculator. Server-rendered with the
 * page's default example (30.000 € income, 6.000 € expenses), so the result
 * is in the HTML without JavaScript; in the browser every change recomputes
 * in place (engine.ts) and is written to the URL hash, so a result can be
 * shared.
 */

export function SelfEmployedCalculator({ locale, initial }: { locale: SeLocale; initial: SelfEmployedInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<SelfEmployedInput>(initial);
  const [incomeText, setIncomeText] = useState(() => String(initial.income));
  const [expensesText, setExpensesText] = useState(() => String(initial.expenses));
  const [baseText, setBaseText] = useState(() => (initial.base === null ? "" : String(initial.base)));

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      // Only a calculator hash ("#i=…"): an in-page anchor such as "#tramos" must not reset the inputs.
      if (!/^#(?:.*&)?i=/.test(window.location.hash)) return;
      const next = readHash(window.location.hash, initial);
      setInput(next);
      setIncomeText(String(next.income));
      setExpensesText(String(next.expenses));
      setBaseText(next.base === null ? "" : String(next.base));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [initial]);

  function update(patch: Partial<SelfEmployedInput>) {
    const next = { ...input, ...patch };
    setInput(next);
    window.history.replaceState(null, "", writeHash(next));
  }

  const r = calculateSelfEmployed(input);
  const mo = (v: number) => money(v, locale);

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
          <label htmlFor={`${id}-period`}>{t.period}</label>
          <select id={`${id}-period`} className="ci-field" value={input.period} onChange={(e) => update({ period: e.target.value === "monthly" ? "monthly" : "annual" })}>
            {(["annual", "monthly"] as Period[]).map((p) => (
              <option key={p} value={p}>
                {t.periodOptions[p]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-income`}>{t.income(input.period)}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-income`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={incomeText}
              aria-describedby={`${id}-income-hint`}
              onChange={(e) => {
                setIncomeText(e.target.value);
                update({ income: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-income-hint`} className="ci-calc-note">
            {t.incomeHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-expenses`}>{t.expenses(input.period)}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-expenses`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={expensesText}
              aria-describedby={`${id}-expenses-hint`}
              onChange={(e) => {
                setExpensesText(e.target.value);
                update({ expenses: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-expenses-hint`} className="ci-calc-note">
            {t.expensesHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-flat`}>{t.flatRate}</label>
          <select id={`${id}-flat`} className="ci-field" value={input.flatRate} onChange={(e) => update({ flatRate: (["none", "first", "second"] as FlatRate[]).find((f) => f === e.target.value) ?? "none" })}>
            {(["none", "first", "second"] as FlatRate[]).map((f) => (
              <option key={f} value={f}>
                {t.flatRateOptions[f]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-base`}>{t.base}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-base`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={baseText}
              aria-describedby={`${id}-base-hint`}
              onChange={(e) => {
                setBaseText(e.target.value);
                const v = parseAmount(e.target.value);
                update({ base: e.target.value.trim() === "" || v <= 0 ? null : v });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-base-hint`} className="ci-calc-note">
            {t.baseHint(r)}
          </span>
        </p>

        <div className="ci-calc-row ci-calc-wide">
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={input.corporate} aria-describedby={`${id}-corporate-hint`} onChange={(e) => update({ corporate: e.target.checked })} />
            <span>{t.corporate}</span>
          </label>
          <span id={`${id}-corporate-hint`} className="ci-calc-note">
            {t.corporateHint}
          </span>
        </div>
      </div>

      <div aria-live="polite">
        <h3 className="ci-calc-title mt-4">{t.results}</h3>
        <dl className="ci-calc-results">
          <div className="ci-calc-total">
            <dt>{t.pay(r.pay.flatRate)}</dt>
            <dd className="ci-numeric">{mo(r.pay.monthly)}</dd>
          </div>
          <div>
            <dt>{t.payAnnual(r.pay.flatRate)}</dt>
            <dd className="ci-numeric">{mo(r.pay.annual)}</dd>
          </div>
          <div>
            <dt>{t.band}</dt>
            <dd>{bandName(r.band, locale)}</dd>
          </div>
          <div>
            <dt>{t.range}</dt>
            <dd className="ci-numeric">{rangeText(r.range.min, r.range.max, locale)}</dd>
          </div>
          <div>
            <dt>{t.earningsNet}</dt>
            <dd className="ci-numeric">{mo(r.annual.net)}</dd>
          </div>
          <div className="ps-4 text-[var(--color-muted)]">
            <dt>{t.earningsGeneric(r.annual.genericPct)}</dt>
            <dd className="ci-numeric">− {mo(r.annual.genericDeduction)}</dd>
          </div>
          <div>
            <dt>{t.earningsComputable}</dt>
            <dd className="ci-numeric">{mo(r.annual.computable)}</dd>
          </div>
          <div>
            <dt>{t.earningsMonthly}</dt>
            <dd className="ci-numeric">{mo(r.monthlyEarnings)}</dd>
          </div>
          <div>
            <dt>{r.pay.flatRate ? `${t.full}. ${t.breakdown(r.base)}` : t.breakdown(r.base)}</dt>
            <dd className="ci-numeric">{mo(r.full.monthly)}</dd>
          </div>
          {r.full.lines.map((l) => (
            <div key={l.key} className="ps-4 text-[var(--color-muted)]">
              <dt>
                {t.lines[l.key]} ({percent(l.rate, locale)})
              </dt>
              <dd className="ci-numeric">{mo(l.monthly)}</dd>
            </div>
          ))}
        </dl>
        {t.flatNote(r) ? <p className="ci-calc-note">{t.flatNote(r)}</p> : null}
        <p className="ci-calc-note">{t.regularisation(r)}</p>
        {input.corporate ? <p className="ci-calc-note">{t.corporateNote}</p> : null}
        {r.baseSource === "clamped" ? <p className="ci-calc-note">{t.clamped}</p> : null}
      </div>
      <p className="ci-calc-note">{t.share}</p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
