"use client";

import { useId, useRef, useState, type FormEvent } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import type { Locale } from "@/lib/i18n/config";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { money } from "@/lib/programmatic/lottery-tax/copy";
import { NINO_CHECKER_COPY, categoryLabel, madridTime } from "@/lib/programmatic/nino-check/client-copy";
import type { NinoCheckerData } from "@/lib/programmatic/nino-check/data";
import { check, isNumber, withStake } from "@/lib/programmatic/nino-check/engine";
import { DECIMO_PRICE, NINO_YEAR, programmeProblems } from "@/lib/programmatic/nino-check/programme";

/**
 * The El Niño checker: a five-digit number and what the reader plays on it →
 * every prize it wins (per décimo and per euro) and what they keep after the
 * levy. The numbers and SELAE's programme come from the JSON the page serves
 * (NINO_DATA_PATH), fetched once on the first focus or submit; the programme
 * is re-validated in the browser before anything is shown.
 */

type Load = { state: "idle" | "loading" | "error" } | { state: "ready"; data: NinoCheckerData };

export function NinoChecker({ locale, dataUrl }: { locale: Locale; dataUrl: string }) {
  const t = NINO_CHECKER_COPY[locale];
  const id = useId();
  const [number, setNumber] = useState("");
  const [played, setPlayed] = useState(String(DECIMO_PRICE));
  const [submitted, setSubmitted] = useState(false);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const started = useRef(false);

  function fetchData() {
    if (started.current) return;
    started.current = true;
    setLoad({ state: "loading" });
    fetch(dataUrl, { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: NinoCheckerData) => {
        if (data?.schema !== 1 || data.game !== "nino" || !data.available || !data.draw || !data.programme || data.year !== NINO_YEAR || programmeProblems(data.programme).length) throw new Error("no data");
        setLoad({ state: "ready", data });
      })
      .catch(() => {
        started.current = false;
        setLoad({ state: "error" });
      });
  }

  const clean = number.trim();
  const amount = parseAmount(played);
  const validNumber = isNumber(clean);
  const data = load.state === "ready" ? load.data : null;
  const programme = data?.programme ?? null;
  const result = data?.draw && programme && validNumber ? check(clean, data.draw, programme) : null;
  const stake = result && programme ? withStake(result.perDecimo, amount, programme) : null;
  const calcUse = useCalculatorUse("nino-check", locale, result ? [result.number, result.perDecimo, stake?.status === "ok" ? stake.total.net : null] : null);
  const M = (n: number) => money(n, locale);
  const showErrors = submitted || clean.length >= 5;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    fetchData();
  }

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>
      <form onSubmit={onSubmit} noValidate>
        <div className="ci-calc-inputs">
          <p className="ci-calc-row">
            <label htmlFor={`${id}-number`}>{t.number}</label>
            <span className="ci-calc-number">
              <input
                id={`${id}-number`}
                className="ci-field"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={5}
                pattern="[0-9]{5}"
                aria-describedby={`${id}-number-hint`}
                aria-invalid={showErrors && !validNumber ? true : undefined}
                value={number}
                onFocus={fetchData}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 5))}
              />
            </span>
            <span id={`${id}-number-hint`} className="ci-calc-note">
              {t.numberHint}
            </span>
          </p>
          <p className="ci-calc-row">
            <label htmlFor={`${id}-played`}>{t.played}</label>
            <span className="ci-calc-number">
              <input id={`${id}-played`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-played-hint`} value={played} onChange={(e) => setPlayed(e.target.value)} />
              <span className="ci-calc-suffix">€</span>
            </span>
            <span id={`${id}-played-hint`} className="ci-calc-note">
              {t.playedHint}
            </span>
          </p>
        </div>
        <p>
          <button type="submit" className="ci-btn ci-btn-primary">
            {t.submit}
          </button>
        </p>
      </form>

      <div aria-live="polite">
        {load.state === "loading" ? <p className="ci-calc-note">{t.loading}</p> : null}
        {load.state === "error" ? <p role="alert">{t.loadError}</p> : null}
        {showErrors && !validNumber ? <p role="alert">{t.badNumber}</p> : null}
        {result && stake?.status === "invalid" ? <p role="alert">{t.badPlayed}</p> : null}
        {result && data && programme ? (
          <>
            {result.status === "prize" ? (
              <>
                <p>
                  <strong>{t.prizeFor(result.number)}</strong>
                </p>
                <div className="ci-table-scroll">
                  <table className="ci-local-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.colPrize}</th>
                        <th scope="col">{t.colDecimo}</th>
                        <th scope="col">{t.colEuro}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.hits.map((h, i) => {
                        const c = programme.categories.find((x) => x.id === h.category)!;
                        return (
                          <tr key={`${h.category}-${h.from}-${i}`}>
                            <th scope="row" className="font-normal">
                              {categoryLabel(c, locale)}
                              {h.from !== result.number ? ` (${t.from(h.from)})` : ""}
                            </th>
                            <td>{M(h.perDecimo)}</td>
                            <td>{M(h.perDecimo / programme.decimoPrice)}</td>
                          </tr>
                        );
                      })}
                      {result.hits.length > 1 ? (
                        <tr>
                          <th scope="row">{t.total}</th>
                          <td>
                            <strong>{M(result.perDecimo)}</strong>
                          </td>
                          <td>
                            <strong>{M(result.perEuro)}</strong>
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                {stake?.status === "ok" ? (
                  <>
                    <dl className="ci-calc-results">
                      <div className="ci-calc-total">
                        <dt>{t.net}</dt>
                        <dd>{M(stake.total.net)}</dd>
                      </div>
                      <div>
                        <dt>{t.gross(M(amount))}</dt>
                        <dd>{M(stake.total.gross)}</dd>
                      </div>
                      <div>
                        <dt>{t.exempt}</dt>
                        <dd>{M(stake.total.exempt)}</dd>
                      </div>
                      <div>
                        <dt>{t.withholding}</dt>
                        <dd>{M(stake.total.withholding)}</dd>
                      </div>
                    </dl>
                    {stake.total.withholding === 0 ? <p className="ci-calc-note">{t.noTax}</p> : null}
                  </>
                ) : null}
              </>
            ) : (
              <p>
                <strong>{result.status === "none" ? t.none(result.number) : t.noneYet(result.number, data.readAt ? madridTime(data.readAt) : "")}</strong>
              </p>
            )}
            {data.readAt ? <p className="ci-calc-note">{t.readAt(madridTime(data.readAt), data.complete)}</p> : null}
            <p className="ci-calc-note">{t.official}</p>
          </>
        ) : null}
      </div>
    </section>
  );
}
