"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { calcPath } from "@/lib/programmatic/calculators/paths";
import { CALC_COPY, money, parseAmount, percent, readHash, writeHash, type SubLocale } from "@/lib/programmatic/unemployment-subsidy/copy";
import { ANSWERS, EXHAUSTED_OPTIONS, SITUATIONS, checkSubsidy, type Answer, type Situation, type SubsidyInput } from "@/lib/programmatic/unemployment-subsidy/engine";
import { MIN_DAYS_INSUFFICIENT, OVER52_AGE } from "@/lib/programmatic/unemployment-subsidy/rules";

/**
 * The unemployment subsidy checker. Server-rendered with the page's default
 * example, so the verdict is in the HTML without JavaScript; in the browser
 * every change recomputes in place (engine.ts) and is written to the URL hash,
 * so a result can be shared.
 */

const PARO_LINK = { es: "Calcula tu paro", ca: "Calcula el teu atur", en: "Unemployment benefit calculator" } as const;

export function SubsidyCalculator({ locale, initial }: { locale: SubLocale; initial: SubsidyInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<SubsidyInput>(initial);
  const [text, setText] = useState(() => textsOf(initial));

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      // Only a calculator hash ("#s=…"): an in-page anchor such as "#cuantia" must not reset the inputs.
      if (!/^#(?:.*&)?s=/.test(window.location.hash)) return;
      const next = readHash(window.location.hash, initial);
      setInput(next);
      setText(textsOf(next));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [initial]);

  function update(patch: Partial<SubsidyInput>) {
    const next = { ...input, ...patch };
    setInput(next);
    window.history.replaceState(null, "", writeHash(next));
  }

  /** A text box: keeps what the reader typed, updates the input when it reads as a number. */
  function onNumber(key: keyof typeof text, field: "age" | "contributedDays" | "familyMembers" | "ownIncome" | "householdIncome", value: string) {
    setText((s) => ({ ...s, [key]: value }));
    const n = parseAmount(value);
    update({ [field]: field === "ownIncome" || field === "householdIncome" ? n : Math.round(n) } as Partial<SubsidyInput>);
  }

  const r = checkSubsidy(input);
  const mo = (v: number) => money(v, locale);
  const field = (name: string) => `${id}-${name}`;
  const showOver52 = input.age >= OVER52_AGE && (input.situation === "exhausted" || input.situation === "insufficient");
  const answerSelect = (name: string, label: string, value: Answer, onChange: (a: Answer) => void) => (
    <p className="ci-calc-row">
      <label htmlFor={field(name)}>{label}</label>
      <select id={field(name)} className="ci-field" value={value} onChange={(e) => onChange(ANSWERS.find((a) => a === e.target.value) ?? "unknown")}>
        {ANSWERS.map((a) => (
          <option key={a} value={a}>
            {t.answerOptions[a]}
          </option>
        ))}
      </select>
    </p>
  );

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
          <label htmlFor={field("situation")}>{t.situation}</label>
          <select id={field("situation")} className="ci-field" value={input.situation} onChange={(e) => update({ situation: SITUATIONS.find((s) => s === e.target.value) ?? "exhausted" })}>
            {SITUATIONS.map((s: Situation) => (
              <option key={s} value={s}>
                {t.situationOptions[s]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("age")}>{t.age}</label>
          <input id={field("age")} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={text.age} aria-describedby={field("age-hint")} onChange={(e) => onNumber("age", "age", e.target.value)} />
          <span id={field("age-hint")} className="ci-calc-note">
            {t.ageHint}
          </span>
        </p>

        {input.situation === "exhausted" ? (
          <p className="ci-calc-row">
            <label htmlFor={field("exhausted")}>{t.exhausted}</label>
            <select id={field("exhausted")} className="ci-field" value={input.exhaustedDays} onChange={(e) => update({ exhaustedDays: Number(e.target.value) })}>
              {EXHAUSTED_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {t.exhaustedOption(d)}
                </option>
              ))}
            </select>
          </p>
        ) : null}

        {input.situation === "insufficient" ? (
          <p className="ci-calc-row">
            <label htmlFor={field("contributed")}>{t.contributed}</label>
            <input
              id={field("contributed")}
              className="ci-field"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={text.contributed}
              aria-describedby={field("contributed-hint")}
              onChange={(e) => onNumber("contributed", "contributedDays", e.target.value)}
            />
            <span id={field("contributed-hint")} className="ci-calc-note">
              {t.contributedHint}
            </span>
          </p>
        ) : null}

        {input.situation === "emigrant" ? <div className="ci-calc-wide">{answerSelect("abroad", t.workedAbroad, input.workedAbroad, (a) => update({ workedAbroad: a }))}</div> : null}

        {input.situation === "victim" ? (
          <p className="ci-calc-row">
            <label htmlFor={field("rai")}>{t.priorRai}</label>
            <select id={field("rai")} className="ci-field" value={input.priorRai} onChange={(e) => update({ priorRai: Math.min(3, Math.max(0, Number(e.target.value))) as 0 | 1 | 2 | 3 })}>
              {t.priorRaiOptions.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </p>
        ) : null}

        <p className="ci-calc-row">
          <label htmlFor={field("members")}>{t.members}</label>
          <input
            id={field("members")}
            className="ci-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text.members}
            aria-describedby={field("members-hint")}
            onChange={(e) => onNumber("members", "familyMembers", e.target.value)}
          />
          <span id={field("members-hint")} className="ci-calc-note">
            {t.membersHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={field("own")}>{t.ownIncome}</label>
          <span className="ci-calc-number">
            <input id={field("own")} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={text.own} aria-describedby={field("own-hint")} onChange={(e) => onNumber("own", "ownIncome", e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={field("own-hint")} className="ci-calc-note">
            {t.ownIncomeHint}
          </span>
        </p>

        {input.familyMembers > 0 ? (
          <p className="ci-calc-row">
            <label htmlFor={field("household")}>{t.household}</label>
            <span className="ci-calc-number">
              <input
                id={field("household")}
                className="ci-field"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={text.household}
                aria-describedby={field("household-hint")}
                onChange={(e) => onNumber("household", "householdIncome", e.target.value)}
              />
              <span className="ci-calc-suffix">€</span>
            </span>
            <span id={field("household-hint")} className="ci-calc-note">
              {t.householdHint}
            </span>
          </p>
        ) : null}

        {showOver52 ? (
          <fieldset className="ci-calc-wide m-0 mb-2 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">{t.over52Legend}</legend>
            {answerSelect("retirement", t.retirementRecord, input.retirementRecord, (a) => update({ retirementRecord: a }))}
            {answerSelect("unemployment-years", t.unemploymentYears, input.unemploymentYears, (a) => update({ unemploymentYears: a }))}
          </fieldset>
        ) : null}
      </div>

      <div aria-live="polite">
        <h3 className="ci-calc-title mt-4">{t.result}</h3>
        <dl className="ci-calc-results">
          <div className="ci-calc-total">
            <dt>{t.verdict(r)}</dt>
            <dd>{r.kind && r.status === "eligible" ? t.kindName[r.kind] : null}</dd>
          </div>
          {r.status === "eligible" ? (
            <>
              <div>
                <dt>{t.first}</dt>
                <dd className="ci-numeric">{mo(r.firstMonthly)}</dd>
              </div>
              <div>
                <dt>{t.duration(r)}</dt>
                <dd className="ci-numeric">{r.total !== null ? `${t.total}: ${mo(r.total)}` : null}</dd>
              </div>
            </>
          ) : null}
        </dl>

        {r.phases.length > 0 ? (
          <div className="ci-table-scroll">
            <table className="ci-local-table ci-stack-table">
              <thead>
                <tr>
                  <th scope="col">{t.cols.months}</th>
                  <th scope="col">{t.cols.pct}</th>
                  <th scope="col">{t.cols.monthly}</th>
                  <th scope="col">{t.cols.total}</th>
                </tr>
              </thead>
              <tbody>
                {r.phases.map((p) => (
                  <tr key={p.fromMonth}>
                    <th scope="row" className="font-normal whitespace-nowrap">
                      {t.monthsLabel(p.fromMonth, p.toMonth)}
                    </th>
                    <td data-label={t.cols.pct} className="tabular-nums">
                      {percent(p.share * 100, locale, 0)}
                    </td>
                    <td data-label={t.cols.monthly} className="whitespace-nowrap tabular-nums">
                      {mo(p.monthly)}
                    </td>
                    <td data-label={t.cols.total} className="whitespace-nowrap tabular-nums">
                      {p.total !== null ? mo(p.total) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {r.reasons.map((reason) => (
          <p key={reason} className="ci-calc-note">
            {t.reason[reason]}
            {reason === "contributory" ? (
              <>
                {" "}
                <Link href={calcPath("unemployment", locale)}>{PARO_LINK[locale]}</Link>.
              </>
            ) : null}
          </p>
        ))}
        {input.situation !== "other" && r.status !== "contributory" && !(input.situation === "insufficient" && input.contributedDays < MIN_DAYS_INSUFFICIENT) ? (
          <>
            <p className="ci-calc-note">{t.incomeLine(r)}</p>
            <p className="ci-calc-note">{t.familyLine(r, input.familyMembers)}</p>
          </>
        ) : null}
        {r.status === "eligible" && r.kind ? <p className="ci-calc-note">{t.basis[r.kind]}</p> : null}
        {r.retirementContribution ? <p className="ci-calc-note">{t.retirement}</p> : null}
        {r.status === "eligible" && r.kind !== "over52" ? <p className="ci-calc-note">{t.periods}</p> : null}
      </div>
      <p className="ci-calc-note">{t.share}</p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}

function textsOf(s: SubsidyInput) {
  return {
    age: String(s.age),
    contributed: String(s.contributedDays),
    members: String(s.familyMembers),
    own: String(s.ownIncome),
    household: String(s.householdIncome),
  };
}
