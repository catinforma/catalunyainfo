"use client";

import { useId, useState, type FormEvent } from "react";

import { LiveStatus } from "@/components/programmatic/lottery-live/LiveStatus";
import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import type { Locale } from "@/lib/i18n/config";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { GROSSA_CHECKER_COPY, PRIZE_LABEL, TIER_LABEL, barcelonaTime } from "@/lib/programmatic/grossa-check/client-copy";
import type { GrossaCheckerData } from "@/lib/programmatic/grossa-check/data";
import { useLiveFeed } from "@/lib/programmatic/lottery-live/use-live-feed";
import { check, isNumber, withStake } from "@/lib/programmatic/grossa-check/engine";
import { TICKET_PRICE } from "@/lib/programmatic/grossa-check/programme";
import { money } from "@/lib/programmatic/lottery-tax/copy";

/**
 * The La Grossa de Cap d'Any checker: a five-digit number and what the
 * reader plays on it → every prize it wins (per ticket and per euro) and
 * what they keep after the levy. The numbers come from the JSON the page
 * serves (GROSSA_DATA_PATH), fetched once on the first focus or submit; the
 * arithmetic is the engine's (DOGC 9640 annex 3), the same the tests run.
 */

export function GrossaChecker({ locale, dataUrl, officialHref, initial = null }: { locale: Locale; dataUrl: string; officialHref: string; initial?: GrossaCheckerData | null }) {
  const t = GROSSA_CHECKER_COPY[locale];
  const id = useId();
  const [number, setNumber] = useState("");
  const [played, setPlayed] = useState(String(TICKET_PRICE));
  const [submitted, setSubmitted] = useState(false);
  const feed = useLiveFeed<GrossaCheckerData>("grossa", dataUrl, initial);

  const clean = number.trim();
  const amount = parseAmount(played);
  const validNumber = isNumber(clean);
  const data = feed.data?.available && feed.data.draw ? feed.data : null;
  const result = data?.draw && validNumber ? check(clean, data.draw) : null;
  const stake = result ? withStake(result.perTicket, amount) : null;
  const calcUse = useCalculatorUse("grossa-check", locale, result ? [result.number, result.perTicket, stake?.status === "ok" ? stake.total.net : null] : null);
  const M = (n: number) => money(n, locale);
  const showErrors = submitted || clean.length >= 5;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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

      <LiveStatus game="grossa" locale={locale} feed={feed} officialHref={officialHref} number={submitted && validNumber ? clean : undefined} />

      <div aria-live="polite">
        {showErrors && !validNumber ? <p role="alert">{t.badNumber}</p> : null}
        {result && stake?.status === "invalid" ? <p role="alert">{t.badPlayed}</p> : null}
        {result && data ? (
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
                        <th scope="col">{t.colTicket}</th>
                        <th scope="col">{t.colEuro}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.hits.map((h) => (
                        <tr key={`${h.extraction}-${h.tier}`}>
                          <th scope="row" className="font-normal">
                            {t.hitLabel(PRIZE_LABEL[h.prize][locale], TIER_LABEL[h.tier][locale], h.from, h.tier === "five")}
                          </th>
                          <td>{M(h.perTicket)}</td>
                          <td>{M(h.perTicket / TICKET_PRICE)}</td>
                        </tr>
                      ))}
                      {result.hits.length > 1 ? (
                        <tr>
                          <th scope="row">{t.total}</th>
                          <td>
                            <strong>{M(result.perTicket)}</strong>
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
                <strong>{result.status === "none" ? t.none(result.number) : t.noneYet(result.number, data.readAt ? barcelonaTime(data.readAt) : "")}</strong>
              </p>
            )}
            {data.readAt ? <p className="ci-calc-note">{t.readAt(barcelonaTime(data.readAt), data.complete)}</p> : null}
            <p className="ci-calc-note">{t.official}</p>
          </>
        ) : null}
      </div>
    </section>
  );
}
