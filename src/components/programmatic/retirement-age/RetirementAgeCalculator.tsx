"use client";

import { useId, useState, useSyncExternalStore } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { CALC_COPY, COLUMN_LABEL, TYPE_LABEL, coef, day, monthsText, whole, ymText, type RaLocale } from "@/lib/programmatic/retirement-age/copy";
import { RETIREMENT_TYPES, calculate, type RetirementInput, type RetirementType } from "@/lib/programmatic/retirement-age/engine";
import { fromMonths, type EarlyKind } from "@/lib/programmatic/retirement-age/rules";

/**
 * "¿A qué edad me puedo jubilar?": date of birth, years and months
 * contributed so far, whether contributions go on and the type of
 * retirement in; out come the day the ordinary age is reached (LGSS art.
 * 205.1.a and DT 7ª) and whether the 65 rule applies, the earliest early
 * retirement with its coefficient (arts. 207 and 208) and the delay bonus
 * (art. 210.2). Server-rendered on the page's default person and on
 * RULES_AS_OF, so it answers without JavaScript; in the browser the
 * contributions are counted on today's date in Madrid. Nothing personal is
 * asked for and nothing leaves the browser.
 */

const noop = () => () => {};

function madridToday(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const EARLY: EarlyKind[] = ["involuntary", "voluntary"];

export function RetirementAgeCalculator({ locale, initial, asOf }: { locale: RaLocale; initial: RetirementInput; asOf: string }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [birth, setBirth] = useState(initial.birth);
  const [years, setYears] = useState(String(initial.years));
  const [months, setMonths] = useState(String(initial.months));
  const [keep, setKeep] = useState(initial.keepContributing);
  const [type, setType] = useState<RetirementType>(initial.type);
  const [delay, setDelay] = useState(String(initial.delayMonths));
  // Today in Madrid in the browser only (null on the server), so the cached HTML carries the rules' day, labelled as such.
  const today = useSyncExternalStore(noop, madridToday, () => null);
  const on = today ?? asOf;

  const count = (text: string) => (text.trim() === "" ? Number.NaN : Number(text.trim()));
  const r = calculate({ birth, years: count(years), months: months.trim() === "" ? 0 : count(months), keepContributing: keep, type, delayMonths: count(delay) }, on);
  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("retirement-age", locale, r);

  const D = (iso: string) => day(iso, locale);
  const Y = (p: Parameters<typeof ymText>[0]) => ymText(p, locale);
  const total = (k: RetirementType) => (type === k ? "ci-calc-total" : undefined);

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
          <label htmlFor={`${id}-birth`}>{t.birth}</label>
          <input id={`${id}-birth`} type="date" className="ci-field" min="1948-01-01" max={on} value={birth} onChange={(e) => setBirth(e.target.value)} aria-describedby={`${id}-birth-hint`} />
          <span id={`${id}-birth-hint`} className="ci-calc-note">
            {t.birthHint}
          </span>
        </p>
        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.contributed}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 font-normal" htmlFor={`${id}-years`}>
              <span>{t.years}</span>
              <span className="ci-calc-number">
                <input id={`${id}-years`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={years} onChange={(e) => setYears(e.target.value)} aria-describedby={`${id}-contrib-hint`} />
              </span>
            </label>
            <label className="flex items-center gap-2 font-normal" htmlFor={`${id}-months`}>
              <span>{t.months}</span>
              <span className="ci-calc-number">
                <input id={`${id}-months`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={months} onChange={(e) => setMonths(e.target.value)} aria-describedby={`${id}-contrib-hint`} />
              </span>
            </label>
          </div>
          <span id={`${id}-contrib-hint`} className="ci-calc-note">
            {t.contributedHint}
          </span>
        </fieldset>
        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.keep}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[true, false].map((v) => (
              <label key={String(v)} className="flex items-center gap-2 font-normal">
                <input type="radio" name={`${id}-keep`} value={v ? "yes" : "no"} checked={keep === v} onChange={() => setKeep(v)} />
                <span>{v ? t.keepYes : t.keepNo}</span>
              </label>
            ))}
          </div>
          <span className="ci-calc-note">{t.keepHint}</span>
        </fieldset>
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-type`}>{t.type}</label>
          <select id={`${id}-type`} className="ci-field" value={type} onChange={(e) => setType(e.target.value as RetirementType)}>
            {RETIREMENT_TYPES.map((k) => (
              <option key={k} value={k}>
                {TYPE_LABEL[k][locale]}
              </option>
            ))}
          </select>
        </p>
        {type === "delayed" ? (
          <p className="ci-calc-row">
            <label htmlFor={`${id}-delay`}>{t.delay}</label>
            <span className="ci-calc-number">
              <input id={`${id}-delay`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={delay} onChange={(e) => setDelay(e.target.value)} aria-describedby={`${id}-delay-hint`} />
            </span>
            <span id={`${id}-delay-hint`} className="ci-calc-note">
              {t.delayHint}
            </span>
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        {r.status === "invalid" ? (
          <p role="alert">{t.invalid[r.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className={total("ordinary")}>
                <dt>{t.ordinary}</dt>
                <dd>
                  <time dateTime={r.ordinary.date}>{D(r.ordinary.date)}</time>, {t.ordinaryAt(Y(r.ordinary.age))}
                  <span className="ci-calc-note block">
                    {r.ordinary.reached
                      ? t.reached(D(r.ordinary.date))
                      : r.ordinary.via === "65"
                        ? t.via65(Y(r.ordinary.row.threshold), D(r.ordinary.date))
                        : t.viaFull(Y(r.ordinary.row.age), r.ordinary.date.slice(0, 4))}
                  </span>
                  <span className="ci-calc-note block">
                    {(r.at65.met ? t.rule65Yes : t.rule65No)(Y(fromMonths(r.at65.contributed)), Y(r.at65.threshold))}
                  </span>
                  {r.minimum.met ? null : <span className="ci-calc-note block">{t.minimumNo(r.minimum.from ? D(r.minimum.from) : null)}</span>}
                </dd>
              </div>
              {EARLY.map((k) => {
                const e = r.early[k];
                return (
                  <div key={k} className={total(k)}>
                    <dt>{t.earlyTitle[k]}</dt>
                    <dd>
                      {e.status === "ok" ? (
                        <>
                          <time dateTime={e.date}>{(e.now ? t.earlyNow : t.earlyAt)(D(e.date), Y(e.age))}</time>
                          <span className="ci-calc-note block">{t.earlyCut(coef(e.coefficient, locale), monthsText(e.monthsAhead, locale), COLUMN_LABEL[e.column][locale].toLowerCase())}</span>
                          <span className="ci-calc-note block">{k === "involuntary" ? t.earlyInvoluntaryNote : t.earlyVoluntaryNote}</span>
                          {k === "voluntary" && !keep ? <span className="ci-calc-note block">{t.earlyVoluntaryStopped}</span> : null}
                        </>
                      ) : (
                        t.earlyNone[e.reason][k]
                      )}
                    </dd>
                  </div>
                );
              })}
              <div className={total("delayed")}>
                <dt>{t.delayTitle}</dt>
                <dd>
                  <time dateTime={r.delay.date}>{t.delayAt(D(r.delay.date), monthsText(r.delay.months, locale))}</time>
                  {r.delay.status === "ok" ? (
                    <>
                      <span className="ci-calc-note block">{t.delayBonus(whole(r.delay.bonus, locale))}</span>
                      {r.delay.activeShare !== null ? <span className="ci-calc-note block">{t.delayActive(whole(r.delay.activeShare, locale))}</span> : null}
                      {r.delay.months > 12 && r.delay.months < 24 && r.delay.months % 12 > 6 ? <span className="ci-calc-note block">{t.delayHalfYear}</span> : null}
                    </>
                  ) : (
                    <span className="ci-calc-note block">{t.delayNone[r.delay.reason]}</span>
                  )}
                </dd>
              </div>
            </dl>
            <p className="ci-calc-note">{t.asOfLine(D(r.asOf))}</p>
            <p className="ci-calc-note">{t.articles}</p>
          </>
        )}
      </div>
    </section>
  );
}
