"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { CALC_COPY, type EpLocale } from "@/lib/programmatic/extra-pay/copy";
import { calculateExtraPay, type ExtraPayInput, type SalaryMode, type WithholdingMode } from "@/lib/programmatic/extra-pay/engine";
import { EXTRA_PAY_YEAR, type Accrual } from "@/lib/programmatic/extra-pay/rules";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { money, parseAmount, percent, smiDeductionNote } from "@/lib/programmatic/net-salary/copy";
import type { Contract, FamilySituation } from "@/lib/programmatic/net-salary/engine";
import { REGIONS, regionById } from "@/lib/programmatic/net-salary/regions";
import { FORAL_LINKS, SOCIAL_SECURITY } from "@/lib/programmatic/net-salary/rules-2026";

/**
 * The Christmas extra pay calculator. Server-rendered with the page's
 * default example (30,000 € a year in 14 payments, the whole year worked),
 * so the result is in the HTML without JavaScript; in the browser every
 * change recomputes in place with extra-pay/engine.ts. Nothing is stored.
 */

const MAX_CHILDREN = 10;

export function ExtraPayCalculator({ locale, initial }: { locale: EpLocale; initial: ExtraPayInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<ExtraPayInput>(initial);
  const [salaryText, setSalaryText] = useState(() => String(initial.salary));
  const [extraText, setExtraText] = useState(() => (initial.extraAmount > 0 ? String(initial.extraAmount) : ""));
  const [rateText, setRateText] = useState(() => String(initial.rate));

  const update = (patch: Partial<ExtraPayInput>) => setInput((prev) => ({ ...prev, ...patch }));

  const r = calculateExtraPay(input);
  const m = (v: number) => money(v, locale);
  const pc = (v: number) => percent(v, locale);
  const region = regionById(input.region);
  const foral = region?.regime === "foral" ? FORAL_LINKS[region.id as keyof typeof FORAL_LINKS] : null;
  const smiNote = r.estimate && r.error === null ? smiDeductionNote(r.estimate, locale) : null;

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("extra-pay", locale, r);

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
          <label htmlFor={`${id}-mode`}>{t.mode}</label>
          <select id={`${id}-mode`} className="ci-field" value={input.mode} onChange={(e) => update({ mode: e.target.value as SalaryMode })}>
            {(["annual", "monthly"] as const).map((k) => (
              <option key={k} value={k}>
                {t.modeOptions[k]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-salary`}>{t.salary[input.mode]}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-salary`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={salaryText}
              aria-describedby={`${id}-salary-hint`}
              onChange={(e) => {
                setSalaryText(e.target.value);
                update({ salary: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-salary-hint`} className="ci-calc-note">
            {t.salaryHint[input.mode]}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-payments`}>{t.payments}</label>
          <select id={`${id}-payments`} className="ci-field" value={input.payments} onChange={(e) => update({ payments: Number(e.target.value) === 12 ? 12 : 14 })}>
            {([14, 12] as const).map((n) => (
              <option key={n} value={n}>
                {t.paymentsOptions[n]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-extra`}>{t.extraAmount}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-extra`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={extraText}
              aria-describedby={`${id}-extra-hint`}
              onChange={(e) => {
                setExtraText(e.target.value);
                update({ extraAmount: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-extra-hint`} className="ci-calc-note">
            {t.extraAmountHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-accrual`}>{t.accrual}</label>
          <select id={`${id}-accrual`} className="ci-field" value={input.accrual} aria-describedby={`${id}-accrual-hint`} onChange={(e) => update({ accrual: e.target.value as Accrual })}>
            {(["annual", "semester"] as const).map((k) => (
              <option key={k} value={k}>
                {t.accrualOptions[k]}
              </option>
            ))}
          </select>
          <span id={`${id}-accrual-hint`} className="ci-calc-note">
            {t.accrualHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-start`}>{t.start}</label>
          <input
            id={`${id}-start`}
            className="ci-field"
            type="date"
            min={`${EXTRA_PAY_YEAR - 60}-01-01`}
            max={`${EXTRA_PAY_YEAR}-12-31`}
            value={input.start}
            aria-describedby={`${id}-start-hint`}
            onChange={(e) => update({ start: e.target.value })}
          />
          <span id={`${id}-start-hint`} className="ci-calc-note">
            {t.startHint}
          </span>
        </p>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-withholding`}>{t.withholding}</label>
          <select id={`${id}-withholding`} className="ci-field" value={input.withholding} onChange={(e) => update({ withholding: e.target.value as WithholdingMode })}>
            {(["estimate", "payslip"] as const).map((k) => (
              <option key={k} value={k}>
                {t.withholdingOptions[k]}
              </option>
            ))}
          </select>
        </p>

        {input.withholding === "payslip" ? (
          <p className="ci-calc-row">
            <label htmlFor={`${id}-rate`}>{t.rate}</label>
            <span className="ci-calc-number">
              <input
                id={`${id}-rate`}
                className="ci-field"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={rateText}
                aria-describedby={`${id}-rate-hint`}
                onChange={(e) => {
                  setRateText(e.target.value);
                  const v = e.target.value.trim().replace(",", ".");
                  update({ rate: v === "" ? 0 : /^\d+(\.\d+)?$/.test(v) ? Number(v) : Number.NaN });
                }}
              />
              <span className="ci-calc-suffix">%</span>
            </span>
            <span id={`${id}-rate-hint`} className="ci-calc-note">
              {t.rateHint}
            </span>
          </p>
        ) : (
          <>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-region`}>{t.region}</label>
              <select id={`${id}-region`} className="ci-field" value={input.region} onChange={(e) => update({ region: e.target.value })}>
                {REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.names[locale]}
                  </option>
                ))}
              </select>
            </p>
            <p className="ci-calc-row ci-calc-wide">
              <label htmlFor={`${id}-family`}>{t.family}</label>
              <select id={`${id}-family`} className="ci-field" value={input.family} onChange={(e) => update({ family: Number(e.target.value) as FamilySituation })}>
                {([1, 2, 3] as const).map((s) => (
                  <option key={s} value={s}>
                    {t.familyOptions[s]}
                  </option>
                ))}
              </select>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-children`}>{t.children}</label>
              <select id={`${id}-children`} className="ci-field" value={input.children} onChange={(e) => update({ children: Number(e.target.value) })}>
                {Array.from({ length: MAX_CHILDREN + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </p>
          </>
        )}

        <p className="ci-calc-row">
          <label htmlFor={`${id}-contract`}>{t.contract}</label>
          <select id={`${id}-contract`} className="ci-field" value={input.contract} onChange={(e) => update({ contract: e.target.value as Contract })}>
            {(Object.keys(t.contractOptions) as Contract[]).map((c) => (
              <option key={c} value={c}>
                {t.contractOptions[c]}
              </option>
            ))}
          </select>
        </p>
      </div>

      <div aria-live="polite">
        <h3 className="ci-calc-title mt-4">{t.results}</h3>
        {r.error ? (
          <div className="ci-calc-results">
            <p className="ci-calc-note">{t.errors[r.error]}</p>
            {r.error === "foral" && foral ? (
              <ul className="ci-calc-note">
                {foral.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} rel="noopener" target="_blank">
                      {l.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <>
            {r.prorated ? <p className="ci-calc-note">{t.proratedNone}</p> : null}
            <dl className="ci-calc-results">
              {r.prorated && r.monthlyShare ? (
                <>
                  <div className="ci-calc-total">
                    <dt>{t.proratedShareNet}</dt>
                    <dd className="ci-numeric">{r.monthlyShare.net === null ? "—" : m(r.monthlyShare.net)}</dd>
                  </div>
                  <div>
                    <dt>{t.proratedShare}</dt>
                    <dd className="ci-numeric">{m(r.monthlyShare.gross)}</dd>
                  </div>
                  <div>
                    <dt>{t.proratedYear}</dt>
                    <dd className="ci-numeric">{m(r.gross)}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="ci-calc-total">
                    <dt>{t.net}</dt>
                    <dd className="ci-numeric">{r.net === null ? "—" : m(r.net)}</dd>
                  </div>
                  <div>
                    <dt>
                      {t.gross}
                      {r.newHire ? ` (${t.grossOf(m(r.full))})` : ""}
                    </dt>
                    <dd className="ci-numeric">{m(r.gross)}</dd>
                  </div>
                  <div>
                    <dt>{t.irpf(r.rate === null ? "—" : pc(r.rate))}</dt>
                    <dd className="ci-numeric">− {r.irpf === null ? "—" : m(r.irpf)}</dd>
                  </div>
                  <div>
                    <dt>{t.ss}</dt>
                    <dd className="ci-numeric">{m(0)}</dd>
                  </div>
                </>
              )}
            </dl>
            {r.newHire ? <p className="ci-calc-note">{t.newHire(`${locale === "ca" ? caDayArticle(r.input.start) : ""}${dayMonthYear(r.input.start, locale)}`, r.accrued.days, r.period.days, pc(r.accrued.share * 100))}</p> : null}
            {r.ss.capped || r.ss.alreadyPaid === null ? (
              <p className="ci-calc-note">{t.ssCapped(m(SOCIAL_SECURITY.maxBaseMonthly))}</p>
            ) : (
              <p className="ci-calc-note">{t.ssNote(pc(r.ss.workerRate), m(r.gross), m(r.ss.alreadyPaid))}</p>
            )}
            {r.estimate && r.rate !== null ? <p className="ci-calc-note">{t.estimateNote(money(r.annualGross, locale, 0), pc(r.rate))}</p> : null}
            {r.estimate && r.newHire ? <p className="ci-calc-note">{t.estimateNewHire}</p> : null}
            {smiNote ? <p className="ci-calc-note">{smiNote}</p> : null}
          </>
        )}
      </div>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
