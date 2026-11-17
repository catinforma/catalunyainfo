"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, DRAW_LABEL, PRESET_LABEL, money, sharePct, unitWord, type LtLocale } from "@/lib/programmatic/lottery-tax/copy";
import { calculate, exemptForStake } from "@/lib/programmatic/lottery-tax/engine";
import { DRAWS, PRESETS, presetOf, type DrawId, type PresetId } from "@/lib/programmatic/lottery-tax/rules";

/**
 * The lottery prize tax calculator: a prize (SELAE's Christmas 2026
 * programme, El Niño's first prize, La Grossa de Cap d'Any 2026, or any
 * amount), the reader's stake in each décimo (a whole one or a
 * participación) and how many décimos; out come the gross prize, the exempt
 * part, the 20 % withheld and what is left. Server-rendered on one whole
 * El Gordo décimo, so it answers without JavaScript.
 */

type Choice = PresetId | "custom";

const DRAW_ORDER: DrawId[] = ["navidad-2026", "nino-2027", "grossa-2026"];

export function LotteryTaxCalculator({ locale, initial }: { locale: LtLocale; initial: PresetId }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const first = presetOf(initial);
  const [choice, setChoice] = useState<Choice>(initial);
  const [customPrize, setCustomPrize] = useState(String(first.prize));
  const [customPrice, setCustomPrice] = useState(String(DRAWS[first.draw].price));
  const [played, setPlayed] = useState(String(DRAWS[first.draw].price));
  const [tickets, setTickets] = useState("1");

  const preset = choice === "custom" ? null : presetOf(choice);
  const draw: DrawId | "custom" = preset ? preset.draw : "custom";
  const price = preset ? DRAWS[preset.draw].price : parseAmount(customPrice);
  const prize = preset ? preset.prize : parseAmount(customPrize);
  const count = Number(tickets.trim());
  const result = calculate({ prize, price, played: parseAmount(played), tickets: count });
  const unit = unitWord(draw, locale);

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("lottery-tax", locale, result);

  function choose(next: Choice) {
    const oldPrice = price;
    const nextPrice = next === "custom" ? parseAmount(customPrice) : DRAWS[presetOf(next).draw].price;
    // A whole décimo stays whole when the draw's price changes (20 € décimo → 10 € Grossa ticket).
    if (parseAmount(played) === oldPrice || parseAmount(played) > nextPrice) setPlayed(String(nextPrice));
    setChoice(next);
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

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-prize`}>{t.prize}</label>
          <select id={`${id}-prize`} className="ci-field" value={choice} onChange={(e) => choose(e.target.value as Choice)} aria-describedby={`${id}-prize-hint`}>
            {DRAW_ORDER.map((d) => (
              <optgroup key={d} label={DRAW_LABEL[d][locale]}>
                {PRESETS.filter((p) => p.draw === d).map((p) => (
                  <option key={p.id} value={p.id}>
                    {PRESET_LABEL[p.id][locale]}: {money(p.prize, locale)}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="custom">{t.custom}</option>
          </select>
          {preset ? (
            <span id={`${id}-prize-hint`} className="ci-calc-note">
              {t.presetNote(money(preset.prize, locale), unit, money(DRAWS[preset.draw].price, locale), DRAW_LABEL[preset.draw][locale])}
            </span>
          ) : (
            <span id={`${id}-prize-hint`} className="ci-calc-note">
              {t.customPrizeHint}
            </span>
          )}
        </p>
        {preset ? null : (
          <>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-custom`}>{t.customPrize}</label>
              <span className="ci-calc-number">
                <input id={`${id}-custom`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={customPrize} onChange={(e) => setCustomPrize(e.target.value)} />
                <span className="ci-calc-suffix">€</span>
              </span>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-price`}>{t.customPrice}</label>
              <span className="ci-calc-number">
                <input id={`${id}-price`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
                <span className="ci-calc-suffix">€</span>
              </span>
            </p>
          </>
        )}
        <p className="ci-calc-row">
          <label htmlFor={`${id}-played`}>{t.played}</label>
          <span className="ci-calc-number">
            <input id={`${id}-played`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-played-hint`} value={played} onChange={(e) => setPlayed(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-played-hint`} className="ci-calc-note">
            {t.playedHint(price > 0 ? money(price, locale) : "—", unit)}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-tickets`}>{t.tickets}</label>
          <span className="ci-calc-number">
            <input id={`${id}-tickets`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" aria-describedby={`${id}-tickets-hint`} value={tickets} onChange={(e) => setTickets(e.target.value)} />
          </span>
          <span id={`${id}-tickets-hint`} className="ci-calc-note">
            {t.ticketsHint}
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
                <dt>{t.net}</dt>
                <dd>{money(result.total.net, locale)}</dd>
              </div>
              <div>
                <dt>{t.gross}</dt>
                <dd>{money(result.total.gross, locale)}</dd>
              </div>
              <div>
                <dt>{t.exempt}</dt>
                <dd>{money(result.total.exempt, locale)}</dd>
              </div>
              <div>
                <dt>{t.withholding}</dt>
                <dd>{money(result.total.withholding, locale)}</dd>
              </div>
            </dl>
            {result.total.withholding === 0 ? <p className="ci-calc-note">{t.noTax}</p> : <p className="ci-calc-note">{t.effective(sharePct(result.effectiveRate, locale))}</p>}
            {result.share < 1 ? <p className="ci-calc-note">{t.share(sharePct(result.share, locale), money(exemptForStake(price) * result.share, locale), money(exemptForStake(price), locale), unit)}</p> : null}
            {result.tickets > 1 ? <p className="ci-calc-note">{t.perTicket(unit, money(result.perTicket.net, locale), money(result.perTicket.withholding, locale))}</p> : null}
          </>
        )}
      </div>
    </section>
  );
}
