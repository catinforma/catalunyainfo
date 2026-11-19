"use client";

import { useId, useState, type ReactNode } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/rent-update/engine";
import {
  CALC_COPY,
  CAUSE_LABEL,
  COHABITATION_LABEL,
  MIN_LABEL,
  REGISTRATION_LABEL,
  RELATIONSHIP_LABEL,
  STATUS_LABEL,
  day,
  euros,
  paymentsText,
  perMonth,
  perYear,
  whole,
  type WpLocale,
} from "@/lib/programmatic/widow-pension/copy";
import {
  CAUSES,
  COHABITATIONS,
  DECEASED_STATUSES,
  REGISTRATIONS,
  RELATIONSHIPS,
  calculate,
  type Cause,
  type Cohabitation,
  type DeceasedStatus,
  type Registration,
  type Relationship,
  type WidowInput,
  type WidowResult,
} from "@/lib/programmatic/widow-pension/engine";
import { BURDEN_THRESHOLD, COMPLEMENT_CAP, INCOME_LIMIT, MAX_PENSION } from "@/lib/programmatic/widow-pension/rules";

/**
 * "¿Tengo derecho a la pensión de viudedad y cuánto cobraré?": the
 * relationship, the deceased's situation and the cause of death, the
 * survivor's age, family burdens and other income, and (optionally) the
 * base reguladora in; out come the access (pension, prestación temporal or
 * none, with the article), the percentage (52, 60 or 70 %), the amount in 14
 * (or 12) payments and the 2026 minimum with its complement. Server-rendered
 * on the page's default case, so it answers without JavaScript. Nothing
 * personal is asked for and nothing leaves the browser.
 */

function YesNo({ name, value, onChange, yes, no }: { name: string; value: boolean; onChange: (v: boolean) => void; yes: string; no: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {[true, false].map((v) => (
        <label key={String(v)} className="flex items-center gap-2 font-normal">
          <input type="radio" name={name} value={v ? "yes" : "no"} checked={value === v} onChange={() => onChange(v)} />
          <span>{v ? yes : no}</span>
        </label>
      ))}
    </div>
  );
}

function Question({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="ci-calc-row ci-calc-wide">
      <legend className="text-sm font-medium">{legend}</legend>
      {children}
      {hint ? <span className="ci-calc-note">{hint}</span> : null}
    </fieldset>
  );
}

export function WidowPensionCalculator({ locale, initial, asOf }: { locale: WpLocale; initial: WidowInput; asOf: string }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [relationship, setRelationship] = useState<Relationship>(initial.relationship);
  const [status, setStatus] = useState<DeceasedStatus>(initial.status);
  const [cause, setCause] = useState<Cause>(initial.cause);
  const [illnessBefore, setIllnessBefore] = useState(initial.illnessBefore);
  const [marriageCondition, setMarriageCondition] = useState(initial.marriageCondition);
  const [commonChildren, setCommonChildren] = useState(initial.commonChildren);
  const [cohabitation, setCohabitation] = useState<Cohabitation>(initial.cohabitation);
  const [registration, setRegistration] = useState<Registration>(initial.registration);
  const [remarried, setRemarried] = useState(initial.remarried);
  const [compensatory, setCompensatory] = useState(initial.compensatory);
  const [genderViolence, setGenderViolence] = useState(initial.genderViolence);
  const [compensatoryAnnual, setCompensatoryAnnual] = useState(initial.compensatoryAnnual === null ? "" : String(initial.compensatoryAnnual));
  const [age, setAge] = useState(String(initial.age));
  const [disability65, setDisability65] = useState(initial.disability65);
  const [familyBurdens, setFamilyBurdens] = useState(initial.familyBurdens);
  const [otherIncome, setOtherIncome] = useState(String(initial.otherIncome));
  const [workIncome, setWorkIncome] = useState(initial.workIncome);
  const [otherPension, setOtherPension] = useState(initial.otherPension);
  const [base, setBase] = useState(initial.baseReguladora === null ? "" : String(initial.baseReguladora));

  const optional = (text: string) => (text.trim() === "" ? null : parseAmount(text));
  const input: WidowInput = {
    relationship,
    status,
    cause,
    illnessBefore,
    marriageCondition,
    commonChildren,
    cohabitation,
    registration,
    remarried,
    compensatory,
    genderViolence,
    compensatoryAnnual: optional(compensatoryAnnual),
    age: age.trim() === "" ? Number.NaN : Number(age.trim()),
    disability65,
    familyBurdens,
    otherIncome: otherIncome.trim() === "" ? 0 : parseAmount(otherIncome),
    workIncome,
    otherPension,
    baseReguladora: optional(base),
  };
  const r = calculate(input);
  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("widow-pension", locale, r);

  const E = (n: number) => euros(n, locale);
  const P = (n: number) => whole(n, locale);
  const M = (n: number) => perMonth(n, locale);
  const yn = { yes: t.yes, no: t.no };

  const select = <T extends string>(key: string, label: string, value: T, options: readonly T[], labels: Record<T, Record<WpLocale, string>>, onChange: (v: T) => void, hint?: string) => (
    <p className="ci-calc-row ci-calc-wide">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <select id={`${id}-${key}`} className="ci-field" value={value} onChange={(e) => onChange(e.target.value as T)} aria-describedby={hint ? `${id}-${key}-hint` : undefined}>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o][locale]}
          </option>
        ))}
      </select>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );
  const money = (key: string, label: string, value: string, onChange: (v: string) => void, hint: string) => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <span className="ci-calc-number">
        <input id={`${id}-${key}`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-${key}-hint`} />
      </span>
      <span id={`${id}-${key}-hint`} className="ci-calc-note">
        {hint}
      </span>
    </p>
  );

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
        {select("relationship", t.relationship, relationship, RELATIONSHIPS, RELATIONSHIP_LABEL, setRelationship)}
        {select("status", `${t.deceased}: ${t.status.toLowerCase()}`, status, DECEASED_STATUSES, STATUS_LABEL, setStatus, t.statusHint)}
        {select("cause", t.cause, cause, CAUSES, CAUSE_LABEL, setCause)}

        {relationship === "married" && cause === "common" ? (
          <>
            <Question legend={t.illnessBefore} hint={t.illnessBeforeHint}>
              <YesNo name={`${id}-illness`} value={illnessBefore} onChange={setIllnessBefore} {...yn} />
            </Question>
            {illnessBefore ? (
              <Question legend={t.marriageCondition}>
                <YesNo name={`${id}-marriage`} value={marriageCondition} onChange={setMarriageCondition} {...yn} />
              </Question>
            ) : null}
          </>
        ) : null}

        {relationship === "partner" ? (
          <>
            <Question legend={t.commonChildren}>
              <YesNo name={`${id}-children`} value={commonChildren} onChange={setCommonChildren} {...yn} />
            </Question>
            {select("cohabitation", t.cohabitation, cohabitation, COHABITATIONS, COHABITATION_LABEL, setCohabitation, t.cohabitationHint)}
            {commonChildren ? null : select("registration", t.registration, registration, REGISTRATIONS, REGISTRATION_LABEL, setRegistration)}
          </>
        ) : null}

        {relationship === "separated" ? (
          <>
            <Question legend={t.remarried}>
              <YesNo name={`${id}-remarried`} value={remarried} onChange={setRemarried} {...yn} />
            </Question>
            <Question legend={t.compensatory}>
              <YesNo name={`${id}-compensatory`} value={compensatory} onChange={setCompensatory} {...yn} />
            </Question>
            {compensatory ? (
              money("comp", t.compensatoryAnnual, compensatoryAnnual, setCompensatoryAnnual, t.compensatoryHint)
            ) : (
              <Question legend={t.genderViolence}>
                <YesNo name={`${id}-violence`} value={genderViolence} onChange={setGenderViolence} {...yn} />
              </Question>
            )}
          </>
        ) : null}

        <p className="ci-calc-row">
          <label htmlFor={`${id}-age`}>{t.age}</label>
          <span className="ci-calc-number">
            <input id={`${id}-age`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={age} onChange={(e) => setAge(e.target.value)} />
          </span>
        </p>
        <p className="ci-calc-row">
          <label className="flex items-center gap-2 font-normal">
            <input type="checkbox" checked={disability65} onChange={(e) => setDisability65(e.target.checked)} />
            <span>{t.disability65}</span>
          </label>
        </p>
        <Question legend={t.burdens} hint={t.burdensHint(E(BURDEN_THRESHOLD))}>
          <YesNo name={`${id}-burdens`} value={familyBurdens} onChange={setFamilyBurdens} {...yn} />
        </Question>
        {money("income", t.otherIncome, otherIncome, setOtherIncome, t.otherIncomeHint)}
        <Question legend={t.workIncome}>
          <YesNo name={`${id}-work`} value={workIncome} onChange={setWorkIncome} {...yn} />
        </Question>
        <Question legend={t.otherPension}>
          <YesNo name={`${id}-pension`} value={otherPension} onChange={setOtherPension} {...yn} />
        </Question>
        {money("base", t.base, base, setBase, t.baseHint)}
      </div>

      <div aria-live="polite">{r.status === "invalid" ? <p role="alert">{t.invalid[r.reason]}</p> : <WidowResults r={r} locale={locale} asOf={asOf} M={M} E={E} P={P} />}</div>
    </section>
  );
}

function WidowResults({ r, locale, asOf, M, E, P }: { r: WidowResult; locale: WpLocale; asOf: string; M: (n: number) => string; E: (n: number) => string; P: (n: number) => string }) {
  const t = CALC_COPY[locale];
  const i = r.input;
  const a = r.access;
  const accessText =
    a.kind === "pension"
      ? t.accessPension
      : a.kind === "temporal"
        ? t.accessTemporal[a.reason]
        : a.reason === "partner-cohabitation" && i.commonChildren
          ? t.partnerChildrenNone
          : t.accessNone[a.reason];

  // Why not 60 % (shown when 65 or over and still 52 %).
  const s = r.senior;
  const not60 = [s.noPension ? null : t.why60.noPension, s.noWork ? null : t.why60.noWork, s.income ? null : t.why60.income(E(INCOME_LIMIT))].filter(Boolean);
  const b = r.burdens;
  const amt = r.amount;

  return (
    <>
      <dl className="ci-calc-results">
        <div className="ci-calc-total">
          <dt>{t.rAccess}</dt>
          <dd>{accessText}</dd>
        </div>
        {a.kind === "none" ? null : (
          <>
            <div>
              <dt>{t.rPercent}</dt>
              <dd>
                <strong>{P(r.percent)}</strong>
                <span className="ci-calc-note block">
                  {r.percent === 70 ? t.pct70(E(i.otherIncome), E(b.ceiling)) : r.percent === 60 ? t.pct60(E(INCOME_LIMIT)) : t.pct52}
                </span>
                {r.percent === 70 && amt?.reducedBy313 ? <span className="ci-calc-note block">{t.pct70Reduced(E(b.ceiling))}</span> : null}
                {b.met && r.percent !== 70 ? <span className="ci-calc-note block">{t.better52}</span> : null}
                {r.percent === 52 && s.age && not60.length ? <span className="ci-calc-note block">{t.not60(not60.join("; "))}</span> : null}
                {b.possible ? <span className="ci-calc-note block">{b.income === "check" ? t.possible70(E(b.ceiling), E(b.ceilingSS)) : t.possible70Main}</span> : null}
                {b.burdens && !b.met && !b.possible && b.mainSource === false ? <span className="ci-calc-note block">{t.not70Main}</span> : null}
              </dd>
            </div>
            <div>
              <dt>{t.rAmount}</dt>
              <dd>
                {amt ? (
                  <>
                    <strong>{M(amt.monthly)}</strong>
                    <span className="ci-calc-note block">{t.amountLine(M(amt.monthly), paymentsText(amt.payments, locale), perYear(amt.annual, locale))}</span>
                    {amt.payments === 12 ? <span className="ci-calc-note block">{t.amount12}</span> : null}
                    {amt.cappedByMaximum ? <span className="ci-calc-note block">{t.amountMax(M(MAX_PENSION.monthly))}</span> : null}
                    {amt.cappedByCompensatory && i.compensatoryAnnual !== null ? <span className="ci-calc-note block">{t.amountCompensatory(perYear(i.compensatoryAnnual, locale))}</span> : null}
                    {a.kind === "temporal" ? <span className="ci-calc-note block">{t.amountTemporal}</span> : null}
                  </>
                ) : (
                  <>
                    {t.amountNoBase(P(r.percent))}
                    {a.kind === "temporal" ? <span className="ci-calc-note block">{t.amountTemporal}</span> : null}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>{t.rMinimum}</dt>
              <dd>
                {t.minimumLine(MIN_LABEL[locale][r.minimum.row], M(r.minimum.monthly))}
                {r.complement && r.total ? (
                  <span className="ci-calc-note block">
                    {r.complement.status === "full" || r.complement.status === "partial"
                      ? t.complement[r.complement.status](M(r.complement.monthly), M(r.total.monthly))
                      : t.complement[r.complement.status]}
                  </span>
                ) : (
                  <span className="ci-calc-note block">
                    {r.floor.status === "full" || r.floor.status === "partial"
                      ? `${t.floor[r.floor.status](M(r.floor.monthly))} ${t.floor.capNote(E(COMPLEMENT_CAP))}`
                      : t.complement[r.floor.status]}
                  </span>
                )}
                {r.floor.status === "full" || r.floor.status === "partial" ? <span className="ci-calc-note block">{t.residence}</span> : null}
              </dd>
            </div>
          </>
        )}
      </dl>
      <p className="ci-calc-note">{t.asOfLine(day(asOf, locale))}</p>
      <p className="ci-calc-note">{t.articles}</p>
    </>
  );
}
