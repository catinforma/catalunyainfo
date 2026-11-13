"use client";

import { useEffect, useId, useState } from "react";

import { CALC_COPY, CATEGORY_LABEL, EXAMPLE, bareDay, dayInText, frequencyText, weekdayDay, yearsText, type ItvLocale } from "@/lib/programmatic/itv/copy";
import { addDays, nextItv } from "@/lib/programmatic/itv/engine";
import { CATEGORIES, COMMON_CATEGORIES, type CategoryId } from "@/lib/programmatic/itv/rules";

/**
 * "¿Cuándo me toca pasar la ITV?": vehicle type + first registration (+ last
 * inspection and the expiry it replaced, both optional) → the next due date,
 * the 30-day window that keeps it (RD 920/2017 art. 6.5) and the following
 * dates. Server-rendered on a fixed example (EXAMPLE in copy.ts), so it
 * answers without JavaScript; the days-left line appears only in the browser,
 * where today's date is known.
 */

function madridToday(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function ItvCalculator({ locale }: { locale: ItvLocale }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [category, setCategory] = useState<CategoryId>(EXAMPLE.category);
  const [reg, setReg] = useState(EXAMPLE.firstRegistration);
  const [last, setLast] = useState(EXAMPLE.lastInspection);
  const [prev, setPrev] = useState(EXAMPLE.previousExpiry);
  const [today, setToday] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setToday(madridToday());
  }, []);

  const r = nextItv({ category, firstRegistration: reg, lastInspection: last || null, previousExpiry: prev || null, today });
  const others = CATEGORIES.filter((c) => !COMMON_CATEGORIES.includes(c.id));
  const on = (setter: (v: string) => void) => (e: { target: { value: string } }) => {
    setter(e.target.value);
    setTouched(true);
  };

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
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-cat`}>{t.category}</label>
          <select
            id={`${id}-cat`}
            className="ci-field"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as CategoryId);
              setTouched(true);
            }}
          >
            <optgroup label={t.commonGroup}>
              {COMMON_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c][locale]}
                </option>
              ))}
            </optgroup>
            <optgroup label={t.otherGroup}>
              {others.map((c) => (
                <option key={c.id} value={c.id}>
                  {CATEGORY_LABEL[c.id][locale]}
                </option>
              ))}
            </optgroup>
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-reg`}>{t.registration}</label>
          <input id={`${id}-reg`} className="ci-field" type="date" required aria-describedby={`${id}-reg-hint`} value={reg} onChange={on(setReg)} />
          <span id={`${id}-reg-hint`} className="ci-calc-note">
            {t.registrationHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-last`}>{t.last}</label>
          <input id={`${id}-last`} className="ci-field" type="date" aria-describedby={`${id}-last-hint`} value={last} onChange={on(setLast)} />
          <span id={`${id}-last-hint`} className="ci-calc-note">
            {t.lastHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-prev`}>{t.previous}</label>
          <input id={`${id}-prev`} className="ci-field" type="date" aria-describedby={`${id}-prev-hint`} value={prev} onChange={on(setPrev)} />
          <span id={`${id}-prev-hint`} className="ci-calc-note">
            {t.previousHint}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {r.status === "invalid" ? (
          <p role="alert">{t.invalid[r.reason]}</p>
        ) : (
          <>
            {touched ? null : <p className="ci-calc-note">{t.example}</p>}
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.due}</dt>
                <dd>
                  <time dateTime={r.due}>{weekdayDay(r.due, locale)}</time>
                </dd>
              </div>
              {r.then.length > 0 ? (
                <div>
                  <dt>{t.then}</dt>
                  <dd>{r.then.map((d) => bareDay(d, locale)).join(" · ")}</dd>
                </div>
              ) : null}
            </dl>
            {r.daysLeft === null ? null : <p className="ci-calc-note">{r.daysLeft > 0 ? t.left(r.daysLeft) : r.daysLeft === 0 ? t.today : t.expired(-r.daysLeft)}</p>}
            <p className="ci-calc-note">{t.basis[r.basis]}</p>
            {r.every === "exempt" ? null : <p className="ci-calc-note">{t.every(frequencyText(r.every, locale))}</p>}
            <p className="ci-calc-note">{r.earlyFrom ? t.early(dayInText(r.earlyFrom, locale), dayInText(addDays(r.due, -1), locale)) : t.firstNoEarly}</p>
            {r.bandChange ? <p className="ci-calc-note">{t.bandChange(dayInText(r.bandChange.on, locale), yearsText(r.bandChange.years, locale), frequencyText(r.bandChange.every, locale))}</p> : null}
            <p className="ci-calc-note">{t.check}</p>
          </>
        )}
      </div>
    </section>
  );
}
