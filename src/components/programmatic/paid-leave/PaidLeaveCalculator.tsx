"use client";

import { useEffect, useId, useState } from "react";

import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { CALC_COPY, DISCLAIMER, EVENT_LABEL, REASON_LABEL, calendarOf, etArticle, eventArticle, fullDate, readHash, writeHash, type PlLocale, type PlPlace } from "@/lib/programmatic/paid-leave/copy";
import { birthPlan, isShortEvent, shortLeave, validDate, type PaidLeaveInput } from "@/lib/programmatic/paid-leave/engine";
import { BIRTH, EVENTS, type EventId } from "@/lib/programmatic/paid-leave/rules";

/**
 * The paid-leave calculator. Server-rendered with the page's default example,
 * so the result is in the HTML without JavaScript; in the browser every change
 * recomputes in place (engine.ts) and is written to the URL hash, so a result
 * can be shared.
 */

export function PaidLeaveCalculator({ locale, initial, places }: { locale: PlLocale; initial: PaidLeaveInput; places: PlPlace[] }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<PaidLeaveInput>(initial);

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      // Only a calculator hash ("#e=…"): an in-page anchor such as "#nacimiento" must not reset the inputs.
      if (!/^#(?:.*&)?e=/.test(window.location.hash)) return;
      setInput(readHash(window.location.hash, initial, places));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [initial, places]);

  function update(patch: Partial<PaidLeaveInput>) {
    const next = { ...input, ...patch };
    setInput(next);
    window.history.replaceState(null, "", writeHash(next));
  }

  const field = (name: string) => `${id}-${name}`;
  const d = (iso: string) => fullDate(iso, locale);
  const short = isShortEvent(input.event) ? shortLeave(input.event, input.start, input.travel, calendarOf(places, input.place)) : null;
  const birth = input.event === "birth" ? birthPlan(input.birth, input.single) : null;

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
          <label htmlFor={field("event")}>{t.event}</label>
          <select id={field("event")} className="ci-field" value={input.event} onChange={(e) => update({ event: EVENTS.find((x) => x === e.target.value) ?? "illness" })}>
            {EVENTS.map((e: EventId) => (
              <option key={e} value={e}>
                {EVENT_LABEL[locale][e]}
              </option>
            ))}
          </select>
        </p>

        {input.event === "birth" ? (
          <>
            <p className="ci-calc-row">
              <label htmlFor={field("birth")}>{t.birth}</label>
              <input
                id={field("birth")}
                className="ci-field"
                type="date"
                value={input.birth}
                onChange={(e) => {
                  if (validDate(e.target.value)) update({ birth: e.target.value });
                }}
              />
            </p>
            <p className="ci-calc-row ci-calc-wide">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={input.single} onChange={(e) => update({ single: e.target.checked })} />
                <span>{t.single}</span>
              </label>
            </p>
          </>
        ) : (
          <>
            <p className="ci-calc-row">
              <label htmlFor={field("start")}>{t.start}</label>
              <input
                id={field("start")}
                className="ci-field"
                type="date"
                value={input.start}
                aria-describedby={field("start-hint")}
                onChange={(e) => {
                  if (validDate(e.target.value)) update({ start: e.target.value });
                }}
              />
              <span id={field("start-hint")} className="ci-calc-note">
                {t.startHint}
              </span>
            </p>
            {short && short.count === "unspecified" ? (
              <p className="ci-calc-row">
                <label htmlFor={field("place")}>{t.place}</label>
                <select id={field("place")} className="ci-field" value={input.place} aria-describedby={field("place-hint")} onChange={(e) => update({ place: e.target.value })}>
                  {places.map((p) => (
                    <option key={p[0]} value={p[0]}>
                      {p[1]}
                    </option>
                  ))}
                </select>
                <span id={field("place-hint")} className="ci-calc-note">
                  {t.placeHint}
                </span>
              </p>
            ) : null}
            {input.event === "death" ? (
              <p className="ci-calc-row ci-calc-wide">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" checked={input.travel} onChange={(e) => update({ travel: e.target.checked })} />
                  <span>{t.travel}</span>
                </label>
              </p>
            ) : null}
          </>
        )}
      </div>

      <div aria-live="polite">
        <h3 className="ci-calc-title mt-4">{t.results}</h3>
        {short ? (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{EVENT_LABEL[locale][short.event].replace(/ \(.*\)$/, "")}</dt>
                <dd className="ci-numeric">{t.days(short.days, short.count === "natural")}</dd>
              </div>
              <div>
                <dt>{t.lastCalendar}</dt>
                <dd>{d(short.lastCalendar)}</dd>
              </div>
              {short.working ? (
                <>
                  <div>
                    <dt>{t.lastWorking}</dt>
                    <dd>{d(short.working.last)}</dd>
                  </div>
                  {short.working.first !== input.start ? (
                    <div className="ps-4 text-[var(--color-muted)]">
                      <dt>{t.firstWorking}</dt>
                      <dd>{d(short.working.first)}</dd>
                    </div>
                  ) : null}
                  {short.working.skipped.length > 0 ? (
                    <div className="ps-4 text-[var(--color-muted)]">
                      <dt>{t.skipped}</dt>
                      <dd>{short.working.skipped.map((s) => `${dayMonthYear(s.date, locale)} (${REASON_LABEL[locale][s.reason]})`).join(", ")}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
            {short.outOfRange ? <p className="ci-calc-note">{t.outOfRange}</p> : null}
            <p className="ci-calc-note">{short.count === "natural" ? t.naturalNote(short.event) : t.unspecifiedNote}</p>
            <p className="ci-calc-note">
              {t.payer(short.event)} {etArticle(eventArticle(short.event), locale)}.
            </p>
          </>
        ) : null}
        {birth ? (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{EVENT_LABEL[locale].birth.replace(/ \(.*\)$/, "")}</dt>
                <dd className="ci-numeric">{{ es: `${birth.totalWeeks} semanas`, ca: `${birth.totalWeeks} setmanes`, en: `${birth.totalWeeks} weeks` }[locale]}</dd>
              </div>
              <div>
                <dt>{t.birthRows.mandatory}</dt>
                <dd>
                  {d(birth.birth)} – {d(birth.mandatoryEnd)}
                </dd>
              </div>
              <div>
                <dt>{t.birthRows.flexible}</dt>
                <dd>{t.birthFlexibleValue(dayMonthYear(birth.flexibleFrom, locale), dayMonthYear(birth.flexibleUntil, locale), birth.flexibleWeeks)}</dd>
              </div>
              <div className="ps-4 text-[var(--color-muted)]">
                <dt>{t.birthRows.continuous}</dt>
                <dd>{d(birth.continuousEnd)}</dd>
              </div>
              <div>
                <dt>{t.birthRows.childcare}</dt>
                <dd>{t.birthChildcareValue(dayMonthYear(birth.childcareUntil, locale), birth.childcareWeeks)}</dd>
              </div>
              <div>
                <dt>{t.birthRows.nursing}</dt>
                <dd>{t.birthNursingValue(dayMonthYear(birth.nursingUntil, locale), dayMonthYear(birth.nursingSharedUntil, locale))}</dd>
              </div>
              <div>
                <dt>{t.birthRows.parental}</dt>
                <dd>{t.birthParentalValue(dayMonthYear(birth.parentalUntil, locale))}</dd>
              </div>
            </dl>
            <p className="ci-calc-note">{t.birthPay}</p>
            <p className="ci-calc-note">
              {t.birthNote} {etArticle(`48.4 (${BIRTH.mandatoryWeeks} + ${birth.flexibleWeeks} + ${birth.childcareWeeks})`, locale)}.
            </p>
          </>
        ) : null}
      </div>
      <p className="ci-calc-note">{t.share}</p>
      <p className="ci-calc-note">{DISCLAIMER[locale]}</p>
    </section>
  );
}
