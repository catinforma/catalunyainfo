"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import {
  CALC_COPY,
  CHANNEL_LABEL,
  SEVERITY_LABEL,
  STAGE_LABEL,
  SURCHARGE_LABEL,
  calendarOf,
  dateLabel,
  dueNote,
  money,
  monthsText,
  weekdayDay,
  type TfLocale,
} from "@/lib/programmatic/traffic-fines/copy";
import { CHANNELS, SEVERITIES, STAGES, calculate, type Channel, type Due, type FineInput, type SeverityInput, type Stage } from "@/lib/programmatic/traffic-fines/engine";
import { SURCHARGES } from "@/lib/programmatic/traffic-fines/rules";
import { dayNumber } from "@/lib/programmatic/working-days/engine";

/**
 * "¿Hasta cuándo puedo pagar la multa con el 50 %?": the stage (denuncia,
 * resolution, providencia de apremio), the channel, the date, the amount and
 * the offence's type in; the last day to pay with the discount, to contest
 * or name the driver, what follows if nothing is done, the surcharges, the
 * prescription and the points' return out, each deadline with the day it
 * moves to when it falls on a Saturday, Sunday or holiday (Ley 39/2015 art.
 * 30.5). Server-rendered on DEFAULT_INPUT (page.ts), so it answers without
 * JavaScript; the days-left line appears only in the browser, where today is
 * known. No plate, ID or file number is ever asked for.
 */

export interface PlaceOption {
  id: string;
  label: string;
  dates: string;
}

const noop = () => () => {};

function madridToday(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function DueLine({ label, due, locale, today, total = false, extra }: { label: string; due: Due; locale: TfLocale; today: string | null; total?: boolean; extra?: string | null }) {
  const t = CALC_COPY[locale];
  const note = dueNote(due, locale);
  const last = due.legal ?? due.nominal;
  const left = today ? dayNumber(last) - dayNumber(today) : null;
  return (
    <div className={total ? "ci-calc-total" : undefined}>
      <dt>{label}</dt>
      <dd>
        <time dateTime={due.nominal}>{weekdayDay(due.nominal, locale)}</time>
        {note ? <span className="ci-calc-note block">{note}</span> : null}
        {extra ? <span className="ci-calc-note block">{extra}</span> : null}
        {left === null ? null : <span className="ci-calc-note block">{left > 0 ? t.left(left) : left === 0 ? t.today : t.expired}</span>}
      </dd>
    </div>
  );
}

export function TrafficFinesCalculator({ locale, initial, places, defaultPlace }: { locale: TfLocale; initial: FineInput; places: PlaceOption[]; defaultPlace: string }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [stage, setStage] = useState<Stage>(initial.stage);
  const [channel, setChannel] = useState<Channel>(initial.channel);
  const [date, setDate] = useState(initial.date);
  const [amount, setAmount] = useState(String(initial.amount));
  const [severity, setSeverity] = useState<SeverityInput>(initial.severity);
  const [points, setPoints] = useState(initial.points);
  const [excluded, setExcluded] = useState(initial.excluded);
  const [offence, setOffence] = useState(initial.offence ?? "");
  const [place, setPlace] = useState(defaultPlace);
  const [touched, setTouched] = useState(false);
  // Today in Madrid in the browser only (null on the server), so the cached HTML never carries a date.
  const today = useSyncExternalStore(noop, madridToday, () => null);

  const cal = useMemo(() => calendarOf(places.find((p) => p.id === place) ?? places[0]!), [places, place]);
  const amt = amount.trim() === "" ? Number.NaN : Number(amount.replace(",", "."));
  const r = calculate({ stage, channel, date, amount: amt, severity, points, excluded, offence: offence || null }, cal);
  const calcUse = useCalculatorUse("traffic-fines", locale, r);
  const on = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setTouched(true);
  };
  const M = (n: number) => money(n, locale);

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
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-stage`}>{t.stage}</label>
          <select id={`${id}-stage`} className="ci-field" value={stage} onChange={(e) => on(setStage)(e.target.value as Stage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s][locale]}
              </option>
            ))}
          </select>
        </p>
        {stage === "denuncia" ? (
          <p className="ci-calc-row ci-calc-wide">
            <label htmlFor={`${id}-channel`}>{t.channel}</label>
            <select id={`${id}-channel`} className="ci-field" value={channel} onChange={(e) => on(setChannel)(e.target.value as Channel)}>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c][locale]}
                </option>
              ))}
            </select>
          </p>
        ) : null}
        <p className="ci-calc-row">
          <label htmlFor={`${id}-date`}>{dateLabel(stage, channel, locale)}</label>
          <input id={`${id}-date`} className="ci-field" type="date" required value={date} onChange={(e) => on(setDate)(e.target.value)} />
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-amount`}>{t.amount}</label>
          <input id={`${id}-amount`} className="ci-field" type="number" inputMode="decimal" min="1" step="0.01" aria-describedby={`${id}-amount-hint`} value={amount} onChange={(e) => on(setAmount)(e.target.value)} />
          <span id={`${id}-amount-hint`} className="ci-calc-note">
            {t.amountHint}
          </span>
        </p>
        {stage === "denuncia" ? (
          <>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-sev`}>{t.severity}</label>
              <select id={`${id}-sev`} className="ci-field" aria-describedby={`${id}-sev-hint`} value={severity} onChange={(e) => on(setSeverity)(e.target.value as SeverityInput)}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABEL[s][locale]}
                  </option>
                ))}
              </select>
              <span id={`${id}-sev-hint`} className="ci-calc-note">
                {t.severityHint}
              </span>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-offence`}>{t.offence}</label>
              <input id={`${id}-offence`} className="ci-field" type="date" aria-describedby={`${id}-offence-hint`} value={offence} onChange={(e) => on(setOffence)(e.target.value)} />
              <span id={`${id}-offence-hint`} className="ci-calc-note">
                {t.offenceHint}
              </span>
            </p>
            <p className="ci-calc-row ci-calc-wide">
              <label>
                <input type="checkbox" checked={points} onChange={(e) => on(setPoints)(e.target.checked)} /> {t.points}
              </label>
            </p>
            <p className="ci-calc-row ci-calc-wide">
              <label>
                <input type="checkbox" checked={excluded} aria-describedby={`${id}-excl-hint`} onChange={(e) => on(setExcluded)(e.target.checked)} /> {t.excluded}
              </label>
              <span id={`${id}-excl-hint`} className="ci-calc-note">
                {t.excludedHint}
              </span>
            </p>
          </>
        ) : null}
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-place`}>{t.place}</label>
          <select id={`${id}-place`} className="ci-field" aria-describedby={`${id}-place-hint`} value={place} onChange={(e) => on(setPlace)(e.target.value)}>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <span id={`${id}-place-hint`} className="ci-calc-note">
            {t.placeHint}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {r.status === "invalid" ? (
          <p role="alert">{t.invalid[r.reason]}</p>
        ) : (
          <>
            {touched ? null : <p className="ci-calc-note">{t.example}</p>}
            {r.stage === "denuncia" ? (
              <>
                <dl className="ci-calc-results">
                  {r.discount ? (
                    <DueLine label={t.discount} due={r.discount} locale={locale} today={today} total extra={r.discountLaw ? t.discountLaw(weekdayDay(r.discountLaw.legal ?? r.discountLaw.nominal, locale)) : null} />
                  ) : null}
                  {r.reduced !== null ? (
                    <div>
                      <dt>{locale === "en" ? "You pay" : locale === "ca" ? "Pagues" : "Pagas"}</dt>
                      <dd>
                        <strong>{M(r.reduced)}</strong>
                      </dd>
                    </div>
                  ) : null}
                  <DueLine label={t.alegaciones} due={r.alegaciones} locale={locale} today={today} total={!r.discount} />
                  {r.identify ? <DueLine label={t.identify} due={r.identify} locale={locale} today={null} extra={t.identifyNote} /> : null}
                  <div>
                    <dt>{t.notified}</dt>
                    <dd>
                      <time dateTime={r.notified}>{weekdayDay(r.notified, locale)}</time>
                      {channel === "dev-unopened" ? <span className="ci-calc-note block">{t.notifiedDev(weekdayDay(date, locale), weekdayDay(r.notified, locale))}</span> : null}
                      {r.notifiedLaw ? <span className="ci-calc-note block">{t.notifiedTeu(weekdayDay(r.notifiedLaw, locale))}</span> : null}
                    </dd>
                  </div>
                  {r.fullUntil ? <DueLine label={t.fullUntil(M(amt))} due={r.fullUntil} locale={locale} today={null} /> : null}
                </dl>
                <p className="ci-calc-note">{r.reduced !== null ? t.reduced(M(r.reduced), M(amt)) : t.noDiscount}</p>
                <p className="ci-calc-note">{t.ifNothing[r.ifNothing]}</p>
                <p className="ci-calc-note">{t.surcharges}</p>
                <ul className="ci-calc-note">
                  {SURCHARGES.map((s) => (
                    <li key={s}>
                      {SURCHARGE_LABEL[s][locale]}: <strong>{M(r.surcharged[s])}</strong>
                    </li>
                  ))}
                </ul>
                {r.pointsBackIfPaidOn ? <p className="ci-calc-note">{t.pointsBack(weekdayDay(r.pointsBackIfPaidOn.paid, locale), weekdayDay(r.pointsBackIfPaidOn.back, locale))}</p> : null}
                {r.prescription ? (
                  <p className="ci-calc-note">
                    {t.prescription(r.prescription.months.map((m) => monthsText(m, locale)).join(locale === "en" ? " or " : " o "), r.prescription.until.map((d) => weekdayDay(d, locale)).join(" / "))}{" "}
                    {r.prescription.notifiedInside === true ? t.prescriptionInside : r.prescription.notifiedInside === false ? t.prescriptionAfter : t.prescriptionBetween}
                  </p>
                ) : null}
              </>
            ) : r.stage === "resolucion" ? (
              <>
                <dl className="ci-calc-results">
                  <DueLine label={t.payFull(M(amt))} due={r.payFull} locale={locale} today={today} total />
                  <DueLine label={t.reposicion} due={r.reposicion} locale={locale} today={today} />
                </dl>
                <p className="ci-calc-note">{t.resolutionNote}</p>
                <ul className="ci-calc-note">
                  {SURCHARGES.map((s) => (
                    <li key={s}>
                      {SURCHARGE_LABEL[s][locale]}: <strong>{M(r.surcharged[s])}</strong>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <dl className="ci-calc-results">
                  <DueLine label={t.apremioDue(M(r.surcharged.reduced))} due={r.due} locale={locale} today={today} total />
                </dl>
                <p className="ci-calc-note">{t.apremioLater(M(r.surcharged.ordinary))}</p>
                <p className="ci-calc-note">{t.apremioNote}</p>
              </>
            )}
            <p className="ci-calc-note">{t.check}</p>
          </>
        )}
      </div>
    </section>
  );
}
