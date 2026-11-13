"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, euros, money, netSalaryPreset, pct, type SmiLocale } from "@/lib/programmatic/smi/copy";
import { domesticFor, smiFor, type Payments } from "@/lib/programmatic/smi/engine";
import type { SmiYear } from "@/lib/programmatic/smi/rules";

/**
 * The SMI calculator: the decree's amount for your weekly hours ("si se
 * realizase jornada inferior se percibirá a prorrata", art. 1), in 14 or 12
 * payments, and the domestic-work hourly rate. Server-rendered on a 40-hour
 * week in 14 payments, so it answers without JavaScript. Only years with a
 * decree in the BOE are offered: never a draft figure.
 */

export function SmiCalculator({ locale, years, initialYear }: { locale: SmiLocale; years: SmiYear[]; initialYear: number }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [year, setYear] = useState(initialYear);
  const [hours, setHours] = useState("40");
  const [full, setFull] = useState("40");
  const [payments, setPayments] = useState<Payments>(14);
  const [domHours, setDomHours] = useState("10");
  const entry = years.find((y) => y.year === year) ?? years.at(-1)!;
  const result = smiFor(entry, { weeklyHours: parseAmount(hours), fullTimeHours: parseAmount(full), payments });
  const domestic = domesticFor(entry, parseAmount(domHours));
  const choices = years.filter((y) => y.year >= 2025).reverse();

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
          <label htmlFor={`${id}-year`}>{t.year}</label>
          <select id={`${id}-year`} className="ci-field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {choices.map((y) => (
              <option key={y.year} value={y.year}>
                {t.yearOption(y.year)}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-hours`}>{t.hours}</label>
          <span className="ci-calc-number">
            <input id={`${id}-hours`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-hours-hint`} value={hours} onChange={(e) => setHours(e.target.value)} />
            <span className="ci-calc-suffix">h</span>
          </span>
          <span id={`${id}-hours-hint`} className="ci-calc-note">
            {t.hoursHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-full`}>{t.fullTime}</label>
          <span className="ci-calc-number">
            <input id={`${id}-full`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-full-hint`} value={full} onChange={(e) => setFull(e.target.value)} />
            <span className="ci-calc-suffix">h</span>
          </span>
          <span id={`${id}-full-hint`} className="ci-calc-note">
            {t.fullTimeHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-payments`}>{t.payments}</label>
          <select id={`${id}-payments`} className="ci-field" value={payments} onChange={(e) => setPayments(Number(e.target.value) === 12 ? 12 : 14)}>
            <option value={14}>{t.paymentOptions["14"]}</option>
            <option value={12}>{t.paymentOptions["12"]}</option>
          </select>
        </p>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.perPayment(payments)}</dt>
                <dd>{euros(result.perPayment, locale)}</dd>
              </div>
              <div>
                <dt>{t.yearly}</dt>
                <dd>{euros(result.yearly, locale)}</dd>
              </div>
              <div>
                <dt>{t.monthlyAverage}</dt>
                <dd>{euros(result.monthlyAverage, locale)}</dd>
              </div>
              <div>
                <dt>{t.daily}</dt>
                <dd>{euros(result.daily, locale)}</dd>
              </div>
            </dl>
            {result.share < 1 ? <p className="ci-calc-note">{t.share(pct(result.share * 100, 1, locale))}</p> : null}
            <p className="ci-calc-note">
              <Link href={netSalaryPreset(locale, result.yearly, payments)}>{t.net}</Link>. {t.netHint}
            </p>
          </>
        )}
      </div>

      <h3 className="ci-calc-title">{t.domesticTitle}</h3>
      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-dom`}>{t.domesticHours}</label>
          <span className="ci-calc-number">
            <input id={`${id}-dom`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={domHours} onChange={(e) => setDomHours(e.target.value)} />
            <span className="ci-calc-suffix">h</span>
          </span>
        </p>
      </div>
      <div aria-live="polite">{domestic ? <p className="ci-calc-note">{t.domesticResult(money(entry.domesticHourly, locale), euros(domestic.weekly, locale), euros(domestic.monthly, locale))}</p> : null}</div>
    </section>
  );
}
