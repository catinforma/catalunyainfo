"use client";

import { useMemo, useState } from "react";

import {
  ACCOMMODATION_LABEL,
  ACCOMMODATION_ORDER,
  EXEMPT_AGE_AT_OR_BELOW,
  MAX_STAY_UNITS,
  RATE_PERIODS,
  SCOPE_LABEL,
  calculateTax,
  type AccommodationType,
  type Scope,
} from "@/lib/content/tourist-tax/rates";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * The tourist tax calculator.
 *
 * It carries no configuration from the database. The block that places it is
 * `{ type: "touristTax" }` and nothing else, so an editor can decide where the
 * calculator appears but cannot change a tax rate from the CMS. Every figure
 * comes from `rates.ts`, which is version-controlled and reviewed.
 *
 * Three behaviours are deliberate, and all three are about not lying:
 *
 *  - When no verified rate covers the chosen date, it says so and shows
 *    nothing. Outside Barcelona there is no verified period before 1 April
 *    2026, and no Barcelona period after 31 March 2027.
 *  - Outside Barcelona it never adds a municipal surcharge. Municipalities may
 *    levy one for stays from 1 October 2026; we do not know which have, and
 *    inventing a zero would read as "there is none".
 *  - The seven-unit cap is applied and *stated* when it bites, because a
 *    reader comparing against their own arithmetic needs to know why the
 *    figure is lower than nights × rate.
 */

/** Today, in the ISO form the rate table uses. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The first and last dates any verified period covers, for the input bounds. */
const DATE_MIN = RATE_PERIODS.reduce(
  (min, period) => (period.from < min ? period.from : min),
  RATE_PERIODS[0]?.from ?? "2026-04-01",
);

export function TouristTaxCalculator({ locale }: { locale: Locale }) {
  const t = getMessages(locale).touristTax;

  const [scope, setScope] = useState<Scope>("barcelona");
  const [date, setDate] = useState(() => {
    const today = todayIso();
    return today < DATE_MIN ? DATE_MIN : today;
  });
  const [accommodation, setAccommodation] = useState<AccommodationType>("hotel-4");
  const [guests, setGuests] = useState("2");
  const [exempt, setExempt] = useState("0");
  const [nights, setNights] = useState("4");

  const result = useMemo(
    () =>
      calculateTax({
        scope,
        date,
        accommodation,
        liableGuests: Number(guests) || 0,
        nights: Number(nights) || 0,
      }),
    [scope, date, accommodation, guests, nights],
  );

  const money = (value: number) =>
    value.toLocaleString(locale, { style: "currency", currency: "EUR" });

  const id = "tt";

  return (
    <section className="ci-calc" aria-label={t.title}>
      <h3 className="ci-calc-title">{t.title}</h3>
      <p className="ci-calc-intro">{t.intro}</p>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-scope`}>{t.where}</label>
          <select
            id={`${id}-scope`}
            className="ci-field"
            value={scope}
            onChange={(event) => setScope(event.target.value as Scope)}
          >
            <option value="barcelona">{SCOPE_LABEL.barcelona[locale]}</option>
            <option value="rest-of-catalonia">{SCOPE_LABEL["rest-of-catalonia"][locale]}</option>
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-date`}>{t.date}</label>
          <input
            id={`${id}-date`}
            className="ci-field"
            type="date"
            min={DATE_MIN}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </p>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-acc`}>{t.accommodation}</label>
          <select
            id={`${id}-acc`}
            className="ci-field"
            value={accommodation}
            onChange={(event) => setAccommodation(event.target.value as AccommodationType)}
          >
            {ACCOMMODATION_ORDER.map((type) => (
              <option key={type} value={type}>
                {ACCOMMODATION_LABEL[type][locale]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-guests`}>{t.guests}</label>
          <input
            id={`${id}-guests`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={0}
            max={40}
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
          />
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-exempt`}>{t.exempt}</label>
          <input
            id={`${id}-exempt`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={0}
            max={40}
            value={exempt}
            onChange={(event) => setExempt(event.target.value)}
            aria-describedby={`${id}-exempt-hint`}
          />
          <span id={`${id}-exempt-hint`} className="ci-calc-suffix">
            {t.exemptHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-nights`}>{t.nights}</label>
          <input
            id={`${id}-nights`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            value={nights}
            onChange={(event) => setNights(event.target.value)}
          />
        </p>
      </div>

      <dl className="ci-calc-results" aria-live="polite">
        {result.period === null ? (
          <div>
            <dt>{t.noRateTitle}</dt>
            <dd>{t.noRate}</dd>
          </div>
        ) : (
          <>
            <div>
              <dt>{t.regional}</dt>
              <dd className="ci-numeric">{money(result.regional ?? 0)}</dd>
            </div>
            <div>
              <dt>{t.surcharge}</dt>
              <dd className="ci-numeric">
                {result.surcharge === null ? t.surchargeUnknown : money(result.surcharge)}
              </dd>
            </div>
            <div>
              <dt>{t.perPerson}</dt>
              <dd className="ci-numeric">{money(result.perPersonPerUnit ?? 0)}</dd>
            </div>
            <div>
              <dt>{t.units}</dt>
              <dd className="ci-numeric">
                {result.taxableUnits}
                {result.capped ? ` ${t.cappedShort}` : ""}
              </dd>
            </div>
            <div className="ci-calc-total">
              <dt>{t.total}</dt>
              <dd className="ci-numeric">{money(result.total ?? 0)}</dd>
            </div>
          </>
        )}
      </dl>

      {result.capped ? <p className="ci-calc-note">{t.cappedNote}</p> : null}
      {result.period && result.surcharge === null ? (
        <p className="ci-calc-note">{t.checkMunicipal}</p>
      ) : null}

      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={result.period?.sourceUrl ?? RATE_PERIODS[0]?.sourceUrl} rel="noopener" target="_blank">
          Agència Tributària de Catalunya
        </a>
        .
      </p>
      <p className="ci-calc-note">{t.disclaimer}</p>
      <p className="ci-calc-note">
        {t.rules
          .replace("{max}", String(MAX_STAY_UNITS))
          .replace("{age}", String(EXEMPT_AGE_AT_OR_BELOW))}
      </p>
    </section>
  );
}
