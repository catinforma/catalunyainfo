"use client";

import { useEffect, useId, useState } from "react";

import {
  CALC_COPY,
  bandDates,
  bandDays,
  daysFromEnd,
  endFromDays,
  money,
  parseAmount,
  percent,
  readHash,
  writeHash,
  type SlLocale,
} from "@/lib/programmatic/sick-leave/copy";
import { CONTINGENCIES, SPECIAL_KINDS, baseFromAnnualGross, calculateSickLeave, type Contingency, type SickLeaveInput, type SpecialKind } from "@/lib/programmatic/sick-leave/engine";
import { isIsoDate } from "@/lib/programmatic/employment/dates";

/**
 * The sick-leave pay calculator. Server-rendered with the page's default
 * example, so the result is in the HTML without JavaScript; in the browser
 * every change recomputes in place (engine.ts) and is written to the URL
 * hash, so a result can be shared.
 */

export function SickLeaveCalculator({ locale, initial }: { locale: SlLocale; initial: SickLeaveInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<SickLeaveInput>(initial);
  const [baseText, setBaseText] = useState(() => String(initial.base));
  const [daysText, setDaysText] = useState(() => String(initial.days));
  const [endText, setEndText] = useState(() => endFromDays(initial.start, initial.days));
  const [grossText, setGrossText] = useState("");
  const [baseDaysText, setBaseDaysText] = useState(() => String(initial.baseDays));
  const [overtimeText, setOvertimeText] = useState(() => (initial.overtime > 0 ? String(initial.overtime) : ""));
  const [complementText, setComplementText] = useState(() => (initial.complementPct > 0 ? String(initial.complementPct) : ""));
  const [fromText, setFromText] = useState(() => String(initial.complementFrom));

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      // Only a calculator hash ("#t=…"): an in-page anchor such as "#porcentajes" must not reset the inputs.
      if (!/^#(?:.*&)?t=/.test(window.location.hash)) return;
      const next = readHash(window.location.hash, initial);
      setInput(next);
      setBaseText(String(next.base));
      setDaysText(String(next.days));
      setEndText(endFromDays(next.start, next.days));
      setBaseDaysText(String(next.baseDays));
      setOvertimeText(next.overtime > 0 ? String(next.overtime) : "");
      setComplementText(next.complementPct > 0 ? String(next.complementPct) : "");
      setFromText(String(next.complementFrom));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [initial]);

  function update(patch: Partial<SickLeaveInput>) {
    const next = { ...input, ...patch };
    setInput(next);
    window.history.replaceState(null, "", writeHash(next));
  }

  const r = calculateSickLeave(input);
  const mo = (v: number) => money(v, locale);
  const pc = (v: number) => percent(v, locale, 0);
  const field = (name: string) => `${id}-${name}`;

  return (
    <section className="ci-calc" aria-labelledby={field("title")}>
      <h2 id={field("title")} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={field("type")}>{t.contingency}</label>
          <select
            id={field("type")}
            className="ci-field"
            value={input.contingency}
            onChange={(e) => update({ contingency: CONTINGENCIES.find((c) => c === e.target.value) ?? "common" })}
          >
            {CONTINGENCIES.map((c: Contingency) => (
              <option key={c} value={c}>
                {t.contingencyOptions[c]}
              </option>
            ))}
          </select>
        </p>

        {input.contingency === "special" ? (
          <p className="ci-calc-row ci-calc-wide">
            <label htmlFor={field("special")}>{t.special}</label>
            <select id={field("special")} className="ci-field" value={input.special} onChange={(e) => update({ special: SPECIAL_KINDS.find((k) => k === e.target.value) ?? "menstruation" })}>
              {SPECIAL_KINDS.map((k: SpecialKind) => (
                <option key={k} value={k}>
                  {t.specialOptions[k]}
                </option>
              ))}
            </select>
          </p>
        ) : null}

        <p className="ci-calc-row">
          <label htmlFor={field("start")}>{t.start}</label>
          <input
            id={field("start")}
            className="ci-field"
            type="date"
            value={input.start}
            onChange={(e) => {
              if (!isIsoDate(e.target.value)) return;
              update({ start: e.target.value });
              setEndText(endFromDays(e.target.value, input.days));
            }}
          />
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("days")}>{t.days}</label>
          <input
            id={field("days")}
            className="ci-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={daysText}
            onChange={(e) => {
              setDaysText(e.target.value);
              const n = Math.round(parseAmount(e.target.value));
              if (n >= 1) {
                update({ days: n });
                setEndText(endFromDays(input.start, n));
              }
            }}
          />
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("end")}>{t.end}</label>
          <input
            id={field("end")}
            className="ci-field"
            type="date"
            min={input.start}
            value={endText}
            aria-describedby={field("end-hint")}
            onChange={(e) => {
              setEndText(e.target.value);
              const n = daysFromEnd(input.start, e.target.value);
              if (n >= 1) {
                update({ days: n });
                setDaysText(String(n));
              }
            }}
          />
          <span id={field("end-hint")} className="ci-calc-note">
            {t.endHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("base")}>{t.base(r, input.contingency)}</label>
          <span className="ci-calc-number">
            <input
              id={field("base")}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={baseText}
              aria-describedby={field("base-hint")}
              onChange={(e) => {
                setBaseText(e.target.value);
                update({ base: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={field("base-hint")} className="ci-calc-note">
            {t.baseHint(r)}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("gross")}>{t.gross}</label>
          <span className="ci-calc-number">
            <input
              id={field("gross")}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={grossText}
              aria-describedby={field("gross-hint")}
              onChange={(e) => setGrossText(e.target.value)}
            />
            <button
              type="button"
              className="ci-btn ci-btn-quiet"
              onClick={() => {
                const b = baseFromAnnualGross(parseAmount(grossText));
                if (b <= 0) return;
                setBaseText(String(b));
                update({ base: b });
              }}
            >
              {t.grossButton}
            </button>
          </span>
          <span id={field("gross-hint")} className="ci-calc-note">
            {t.grossHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("base-days")}>{t.baseDays}</label>
          <input
            id={field("base-days")}
            className="ci-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={baseDaysText}
            aria-describedby={field("base-days-hint")}
            onChange={(e) => {
              setBaseDaysText(e.target.value);
              const n = Math.round(parseAmount(e.target.value));
              update({ baseDays: n >= 1 && n <= 31 ? n : 30 });
            }}
          />
          <span id={field("base-days-hint")} className="ci-calc-note">
            {t.baseDaysHint}
          </span>
        </p>

        {input.contingency === "professional" ? (
          <p className="ci-calc-row">
            <label htmlFor={field("overtime")}>{t.overtime}</label>
            <span className="ci-calc-number">
              <input
                id={field("overtime")}
                className="ci-field"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={overtimeText}
                aria-describedby={field("overtime-hint")}
                onChange={(e) => {
                  setOvertimeText(e.target.value);
                  update({ overtime: parseAmount(e.target.value) });
                }}
              />
              <span className="ci-calc-suffix">€</span>
            </span>
            <span id={field("overtime-hint")} className="ci-calc-note">
              {t.overtimeHint}
            </span>
          </p>
        ) : null}

        <p className="ci-calc-row">
          <label htmlFor={field("complement")}>{t.complement}</label>
          <span className="ci-calc-number">
            <input
              id={field("complement")}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={complementText}
              aria-describedby={field("complement-hint")}
              onChange={(e) => {
                setComplementText(e.target.value);
                update({ complementPct: Math.min(100, parseAmount(e.target.value)) });
              }}
            />
            <span className="ci-calc-suffix">%</span>
          </span>
          <span id={field("complement-hint")} className="ci-calc-note">
            {t.complementHint}
          </span>
        </p>

        {input.complementPct > 0 ? (
          <p className="ci-calc-row">
            <label htmlFor={field("from")}>{t.complementFrom}</label>
            <input
              id={field("from")}
              className="ci-field"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={fromText}
              onChange={(e) => {
                setFromText(e.target.value);
                const n = Math.round(parseAmount(e.target.value));
                update({ complementFrom: n >= 1 ? n : 1 });
              }}
            />
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        <h3 className="ci-calc-title mt-4">{t.results}</h3>
        <dl className="ci-calc-results">
          <div className="ci-calc-total">
            <dt>{t.total(r)}</dt>
            <dd className="ci-numeric">{mo(r.totals.total)}</dd>
          </div>
          <div>
            <dt>{t.benefit}</dt>
            <dd className="ci-numeric">{mo(r.totals.benefit)}</dd>
          </div>
          {r.totals.employer > 0 ? (
            <div className="ps-4 text-[var(--color-muted)]">
              <dt>{t.employer}</dt>
              <dd className="ci-numeric">{mo(r.totals.employer)}</dd>
            </div>
          ) : null}
          <div className="ps-4 text-[var(--color-muted)]">
            <dt>{t.entity}</dt>
            <dd className="ci-numeric">{mo(r.totals.entity)}</dd>
          </div>
          {r.totals.complement > 0 ? (
            <div>
              <dt>{t.complementTotal}</dt>
              <dd className="ci-numeric">{mo(r.totals.complement)}</dd>
            </div>
          ) : null}
          <div>
            <dt>{t.dailyBase}</dt>
            <dd className="ci-numeric">{mo(r.dailyBase)}</dd>
          </div>
        </dl>

        <div className="ci-table-scroll">
          <table className="ci-local-table ci-stack-table">
            <thead>
              <tr>
                <th scope="col">{t.cols.days}</th>
                <th scope="col">{t.cols.dates}</th>
                <th scope="col">{t.cols.pct}</th>
                <th scope="col">{t.cols.payer}</th>
                <th scope="col">{t.cols.amount}</th>
                {r.totals.complement > 0 ? <th scope="col">{t.cols.complement}</th> : null}
              </tr>
            </thead>
            <tbody>
              {r.bands.map((b) => (
                <tr key={b.from}>
                  <th scope="row" className="font-normal whitespace-nowrap">
                    {bandDays(b, locale)}
                  </th>
                  <td data-label={t.cols.dates}>{bandDates(b, locale)}</td>
                  <td data-label={t.cols.pct} className="tabular-nums">
                    {b.kind === "benefit" ? pc(b.pct) : "—"}
                  </td>
                  <td data-label={t.cols.payer}>{t.payer(b)}</td>
                  <td data-label={t.cols.amount} className="whitespace-nowrap tabular-nums">
                    {b.kind === "benefit" ? mo(b.amount) : "—"}
                  </td>
                  {r.totals.complement > 0 ? (
                    <td data-label={t.cols.complement} className="whitespace-nowrap tabular-nums">
                      {b.complement > 0 ? `${mo(b.complement)} (${pc(b.complementPct)})` : "—"}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r.totals.salaryDays > 0 ? <p className="ci-calc-note">{t.salaryDays(r.totals.salaryDays)}</p> : null}
        <p className="ci-calc-note">{t.regime(r)}</p>
        {r.specialNotYet ? <p className="ci-calc-note">{t.specialNotYet}</p> : null}
        {input.contingency === "special" && input.special === "pregnancy" ? <p className="ci-calc-note">{t.pregnancy}</p> : null}
        {r.clamped ? <p className="ci-calc-note">{t.clamped}</p> : null}
        {!r.maxBaseKnown ? <p className="ci-calc-note">{t.maxUnknown}</p> : null}
        {r.days > 365 ? <p className="ci-calc-note">{t.extension}</p> : null}
        {r.capped ? <p className="ci-calc-note">{t.capped}</p> : null}
        <p className="ci-calc-note">{t.irpf}</p>
      </div>
      <p className="ci-calc-note">{t.share}</p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
