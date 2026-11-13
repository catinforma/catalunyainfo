"use client";

import { useId, useState } from "react";

import { CALC_COPY, DECIMALS, decimalsOf, elDay, euros, indexOfMonth, pct, type RentLocale } from "@/lib/programmatic/rent-update/copy";
import { anniversaryIn, computeRentUpdate, parseAmount, validIso, type AgreedIndex, type LeaseUse, type RentInput, type RentResult, type RentSeries } from "@/lib/programmatic/rent-update/engine";
import { MONTHS } from "@/lib/programmatic/holidays/format";
import { SERIES, apiSeriesUrl, latestPoint, tableUrl, type SeriesId } from "@/lib/programmatic/rent-update/ine";
import { FIRST_UPDATE, LAST_UPDATE, NORMS } from "@/lib/programmatic/rent-update/rules";

/**
 * The rent-update calculator: rent, lease type, signing date, the month of
 * the update, the agreed index. Server-rendered with the page's worked
 * example (so it answers without JavaScript); in the browser every change
 * recomputes in place with `engine.ts` and the INE series the server read.
 */

const YEARS = Array.from({ length: Number(LAST_UPDATE.slice(0, 4)) - Number(FIRST_UPDATE.slice(0, 4)) + 1 }, (_, i) => Number(FIRST_UPDATE.slice(0, 4)) + i);

interface State {
  rent: string;
  use: LeaseUse;
  signed: string;
  month: number;
  year: number;
  index: AgreedIndex;
  fixed: string;
}

function latestText(series: RentSeries, id: SeriesId, locale: RentLocale): string | null {
  const p = latestPoint(series[id]);
  return p && p.value !== null ? `${indexOfMonth(id, p.month, locale)}, ${pct(p.value, DECIMALS[id], locale)}` : null;
}

function SourceLinks({ ids, locale }: { ids: SeriesId[]; locale: RentLocale }) {
  const t = CALC_COPY[locale];
  return (
    <p className="ci-calc-note">
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 ? " · " : null}
          <a href={tableUrl(SERIES[id])} rel="noopener" target="_blank">
            {t.sourceLink}: {SERIES[id].code}
          </a>
          {" · "}
          <a href={apiSeriesUrl(SERIES[id])} rel="noopener" target="_blank">
            API
          </a>
        </span>
      ))}
    </p>
  );
}

function Result({ result, series, locale }: { result: RentResult; series: RentSeries; locale: RentLocale }) {
  const t = CALC_COPY[locale];
  if (result.status === "invalid") return <p role="alert">{t.invalid[result.reason]}</p>;
  if (result.status === "out-of-range") return <p role="alert">{t.outOfRange(result.first, result.last)}</p>;
  if (result.status === "pending") {
    return (
      <>
        <p>{t.pending(result, latestText(series, result.series, locale))}</p>
        <SourceLinks ids={[result.series]} locale={locale} />
      </>
    );
  }
  const { agreed, caps, binding } = result;
  const appliedDecimals = binding ? (binding.index ? DECIMALS[binding.index.series] : 0) : agreed.source ? DECIMALS[agreed.source.series] : decimalsOf(agreed.percent);
  const usedSeries = [...new Set([agreed.source?.series, ...caps.map((c) => c.index?.series)].filter((s): s is SeriesId => Boolean(s)))];
  return (
    <>
      <dl className="ci-calc-results" aria-live="polite">
        <div className="ci-calc-total">
          <dt>{t.newRent}</dt>
          <dd>{euros(result.newRent, locale)}</dd>
        </div>
        <div>
          <dt>{t.change}</dt>
          <dd>{pct(result.percent, appliedDecimals, locale)}</dd>
        </div>
        <div>
          <dt>{t.monthly}</dt>
          <dd>{euros(result.monthly, locale)}</dd>
        </div>
        <div>
          <dt>{t.yearly}</dt>
          <dd>{euros(result.yearly, locale)}</dd>
        </div>
      </dl>
      <ul className="mt-2 space-y-1 pl-5">
        <li>
          {agreed.source
            ? t.agreedLine(indexOfMonth(agreed.source.series, agreed.source.month, locale), pct(agreed.source.value, DECIMALS[agreed.source.series], locale), elDay(agreed.source.published, locale))
            : t.fixedLine(pct(agreed.percent, decimalsOf(agreed.percent), locale))}
        </li>
        {caps
          .filter((c) => !(c.kind === "irav" && agreed.source?.series === "irav"))
          .map((c) => (
            <li key={c.kind}>{t.capLine(c, locale)}</li>
          ))}
        <li>{caps.length === 0 ? t.noCap : binding ? t.capBinds : agreed.source?.series === "irav" && caps.some((c) => c.kind === "irav") ? t.iravIsCap : t.capDoesNotBind}</li>
      </ul>
      {usedSeries.length ? <SourceLinks ids={usedSeries} locale={locale} /> : null}
      {result.notes.map((n) => (
        <p key={n} className="ci-calc-note">
          {t.notes[n]}
        </p>
      ))}
      <h3 className="mt-4 text-base">{t.basis}</h3>
      <ul className="mt-1 pl-5 text-sm">
        {result.norms.map((id) => (
          <li key={id}>
            <a href={NORMS[id].url} rel="noopener" target="_blank">
              {NORMS[id].name}
            </a>{" "}
            <span className="text-[var(--color-muted)]">({NORMS[id].ref})</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function RentCalculator({ locale, series, initial }: { locale: RentLocale; series: RentSeries; initial: RentInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [state, setState] = useState<State>({
    rent: String(initial.rent),
    use: initial.use,
    signed: initial.signed,
    month: Number(initial.update.slice(5, 7)),
    year: Number(initial.update.slice(0, 4)),
    index: initial.index,
    fixed: initial.fixedPercent === undefined ? "3" : String(initial.fixedPercent),
  });
  const set = (next: Partial<State>) => setState((s) => ({ ...s, ...next }));

  const signedOk = validIso(state.signed);
  const update = signedOk ? anniversaryIn(state.signed, `${state.year}-${String(state.month).padStart(2, "0")}`) : "";
  const input: RentInput = {
    rent: parseAmount(state.rent),
    signed: state.signed,
    update,
    index: state.index,
    fixedPercent: state.index === "fixed" ? parseAmount(state.fixed) : undefined,
    use: state.use,
  };
  const result = computeRentUpdate(input, series);

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
          <label htmlFor={`${id}-rent`}>{t.rent}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-rent`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={state.rent}
              onChange={(e) => set({ rent: e.target.value })}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-use`}>{t.use}</label>
          <select id={`${id}-use`} className="ci-field" value={state.use} onChange={(e) => set({ use: e.target.value as LeaseUse })}>
            <option value="housing">{t.useOptions.housing}</option>
            <option value="commercial">{t.useOptions.commercial}</option>
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-signed`}>{t.signed}</label>
          <input
            id={`${id}-signed`}
            className="ci-field"
            type="date"
            min="1995-01-01"
            max={LAST_UPDATE}
            value={state.signed}
            onChange={(e) => set(validIso(e.target.value) ? { signed: e.target.value, month: Number(e.target.value.slice(5, 7)) } : { signed: e.target.value })}
          />
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-index`}>{t.index}</label>
          <select id={`${id}-index`} className="ci-field" value={state.index} onChange={(e) => set({ index: e.target.value as AgreedIndex })}>
            <option value="irav">{t.indexOptions.irav}</option>
            <option value="ipc">{t.indexOptions.ipc}</option>
            <option value="fixed">{t.indexOptions.fixed}</option>
          </select>
        </p>
        <fieldset className="ci-calc-row ci-calc-wide m-0 border-0 p-0">
          <legend className="mb-1 text-sm font-medium">{t.updateMonth}</legend>
          <span className="flex gap-2">
            <select aria-label={t.updateMonth} className="ci-field" value={state.month} onChange={(e) => set({ month: Number(e.target.value) })}>
              {MONTHS[locale].map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select aria-label={t.updateYear} className="ci-field" value={state.year} onChange={(e) => set({ year: Number(e.target.value) })}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </span>
          {update ? <span className="ci-calc-note">{t.updateHint(elDay(update, locale))}</span> : null}
        </fieldset>
        {state.index === "fixed" ? (
          <p className="ci-calc-row">
            <label htmlFor={`${id}-fixed`}>{t.fixed}</label>
            <span className="ci-calc-number">
              <input
                id={`${id}-fixed`}
                className="ci-field"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={state.fixed}
                onChange={(e) => set({ fixed: e.target.value })}
              />
              <span className="ci-calc-suffix">%</span>
            </span>
          </p>
        ) : null}
      </div>

      <div>
        <Result result={result} series={series} locale={locale} />
      </div>
    </section>
  );
}
