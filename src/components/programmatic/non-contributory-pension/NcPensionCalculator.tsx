"use client";

import { useId, useState, type ReactNode } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/rent-update/engine";
import { CALC_COPY, TYPE_LABEL, day, euros, perMonth, perYear, type NcLocale } from "@/lib/programmatic/non-contributory-pension/copy";
import { DISABILITY_THIRD_PERSON, FREE_INCOME, MINIMUM_ANNUAL, PNC_ANNUAL } from "@/lib/programmatic/non-contributory-pension/rules";
import { MAX_MEMBERS, PNC_TYPES, calculate, type PncInput, type PncResult, type PncType } from "@/lib/programmatic/non-contributory-pension/engine";

/**
 * "¿Tengo derecho a la pensión no contributiva y cuánto cobraré?": the type
 * (retirement or invalidity), age, disability, residence, the household unit
 * (members, a parent or child among them, beneficiaries) and everyone's
 * income in; out come the eligibility with the article of every unmet
 * condition, the household limit, the amount in 14 payments with each step
 * (art. 364) and whether the rent supplement may apply. Server-rendered on
 * the page's default case, so it answers without JavaScript. Nothing
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

const COUNTS = Array.from({ length: MAX_MEMBERS }, (_, i) => i + 1);

export function NcPensionCalculator({ locale, initial, asOf }: { locale: NcLocale; initial: PncInput; asOf: string }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [type, setType] = useState<PncType>(initial.type);
  const [age, setAge] = useState(String(initial.age));
  const [disability, setDisability] = useState(String(initial.disability));
  const [thirdPerson, setThirdPerson] = useState(initial.thirdPerson);
  const [residenceYears, setResidenceYears] = useState(String(initial.residenceYears));
  const [lastTwoYears, setLastTwoYears] = useState(initial.lastTwoYears);
  const [members, setMembers] = useState(initial.members);
  const [firstDegree, setFirstDegree] = useState(initial.firstDegree);
  const [beneficiaries, setBeneficiaries] = useState(initial.beneficiaries);
  const [ownIncome, setOwnIncome] = useState(String(initial.ownIncome));
  const [householdIncome, setHouseholdIncome] = useState(String(initial.householdIncome));
  const [renting, setRenting] = useState(initial.renting);
  const [rentHolder, setRentHolder] = useState(initial.rentHolder);
  const [ownsHome, setOwnsHome] = useState(initial.ownsHome);
  const [landlordKin, setLandlordKin] = useState(initial.landlordKin);
  const [rentHabitual, setRentHabitual] = useState(initial.rentHabitual);

  const number = (text: string) => (text.trim() === "" ? Number.NaN : Number(text.trim().replace(",", ".")));
  const money = (text: string) => (text.trim() === "" ? 0 : parseAmount(text));
  const invalidity = type === "invalidity";
  const input: PncInput = {
    type,
    age: number(age),
    disability: invalidity ? number(disability) : 0,
    thirdPerson: invalidity && thirdPerson,
    residenceYears: number(residenceYears),
    lastTwoYears,
    members,
    firstDegree: members > 1 && firstDegree,
    beneficiaries: Math.min(beneficiaries, members),
    ownIncome: money(ownIncome),
    householdIncome: members > 1 ? money(householdIncome) : 0,
    renting,
    rentHolder,
    ownsHome,
    landlordKin,
    rentHabitual,
  };
  const r = calculate(input);
  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("non-contributory-pension", locale, r);
  const yn = { yes: t.yes, no: t.no };

  const field = (key: string, label: string, value: string, onChange: (v: string) => void, mode: "numeric" | "decimal", hint?: string) => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <span className="ci-calc-number">
        <input id={`${id}-${key}`} className="ci-field" type="text" inputMode={mode} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-${key}-hint` : undefined} />
      </span>
      {hint ? (
        <span id={`${id}-${key}-hint`} className="ci-calc-note">
          {hint}
        </span>
      ) : null}
    </p>
  );
  const count = (key: string, label: string, value: number, max: number, onChange: (v: number) => void, hint?: string) => (
    <p className="ci-calc-row ci-calc-wide">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <select id={`${id}-${key}`} className="ci-field" value={value} onChange={(e) => onChange(Number(e.target.value))} aria-describedby={hint ? `${id}-${key}-hint` : undefined}>
        {COUNTS.filter((n) => n <= max).map((n) => (
          <option key={n} value={n}>
            {n}
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
          <label htmlFor={`${id}-type`}>{t.type}</label>
          <select id={`${id}-type`} className="ci-field" value={type} onChange={(e) => setType(e.target.value as PncType)}>
            {PNC_TYPES.map((o) => (
              <option key={o} value={o}>
                {TYPE_LABEL[o][locale]}
              </option>
            ))}
          </select>
        </p>
        {field("age", t.age, age, setAge, "numeric")}
        {invalidity ? (
          <>
            {field("disability", t.disability, disability, setDisability, "numeric", t.disabilityHint)}
            {number(disability) >= DISABILITY_THIRD_PERSON ? (
              <Question legend={t.thirdPerson} hint={t.thirdPersonHint}>
                <YesNo name={`${id}-third`} value={thirdPerson} onChange={setThirdPerson} {...yn} />
              </Question>
            ) : null}
          </>
        ) : null}
        {field("residence", t.residence[type], residenceYears, setResidenceYears, "numeric", t.residenceHint[type])}
        <Question legend={t.lastTwo} hint={t.lastTwoHint}>
          <YesNo name={`${id}-two`} value={lastTwoYears} onChange={setLastTwoYears} {...yn} />
        </Question>
        {count("members", t.members, members, MAX_MEMBERS, setMembers, t.membersHint)}
        {members > 1 ? (
          <>
            <Question legend={t.firstDegree}>
              <YesNo name={`${id}-first`} value={firstDegree} onChange={setFirstDegree} {...yn} />
            </Question>
            {count("beneficiaries", t.beneficiaries, Math.min(beneficiaries, members), members, setBeneficiaries, t.beneficiariesHint)}
          </>
        ) : null}
        {field("own", t.ownIncome, ownIncome, setOwnIncome, "decimal", t.ownIncomeHint)}
        {members > 1 ? field("household", t.householdIncome, householdIncome, setHouseholdIncome, "decimal", t.householdIncomeHint) : null}
        <Question legend={t.renting}>
          <YesNo name={`${id}-rent`} value={renting} onChange={setRenting} {...yn} />
        </Question>
        {renting ? (
          <>
            <Question legend={t.rentHolder}>
              <YesNo name={`${id}-holder`} value={rentHolder} onChange={setRentHolder} {...yn} />
            </Question>
            <Question legend={t.ownsHome}>
              <YesNo name={`${id}-owns`} value={ownsHome} onChange={setOwnsHome} {...yn} />
            </Question>
            <Question legend={t.landlordKin}>
              <YesNo name={`${id}-kin`} value={landlordKin} onChange={setLandlordKin} {...yn} />
            </Question>
            <Question legend={t.rentHabitual}>
              <YesNo name={`${id}-habitual`} value={rentHabitual} onChange={setRentHabitual} {...yn} />
            </Question>
          </>
        ) : null}
      </div>

      <div aria-live="polite">{r.status === "invalid" ? <p role="alert">{t.invalid[r.reason]}</p> : <NcResults r={r} locale={locale} asOf={asOf} />}</div>
    </section>
  );
}

function NcResults({ r, locale, asOf }: { r: PncResult; locale: NcLocale; asOf: string }) {
  const t = CALC_COPY[locale];
  const E = (n: number) => euros(n, locale);
  const Y = (n: number) => perYear(n, locale);
  const i = r.input;
  const failed = r.checks.filter((c) => !c.ok);
  const params = { type: i.type, own: Y(i.ownIncome), unit: Y(r.unitIncome), limit: E(r.limit ?? 0), pnc: E(PNC_ANNUAL) };
  const a = r.amount;
  const rent = r.rent;

  return (
    <>
      <dl className="ci-calc-results">
        <div className="ci-calc-total">
          <dt>{t.rAccess}</dt>
          <dd>
            {r.eligible ? (
              t.accessYes
            ) : (
              <>
                {t.accessNo}
                <ul>
                  {failed.map((c) => (
                    <li key={c.id}>{t.fail[c.id](params)}</li>
                  ))}
                </ul>
              </>
            )}
            {r.suggest ? <span className="ci-calc-note block">{t.suggest[r.suggest]}</span> : null}
          </dd>
        </div>
        <div>
          <dt>{t.rLimit}</dt>
          <dd>{r.limit === null ? t.limitAlone : t.limitLine(Y(r.unitIncome), E(r.limit))}</dd>
        </div>
        {a ? (
          <div>
            <dt>{t.rAmount}</dt>
            <dd>
              <strong>{perMonth(a.monthly, locale)}</strong>
              <span className="ci-calc-note block">{t.amountLine(perMonth(a.monthly, locale), Y(a.annual))}</span>
              <span className="ci-calc-note block">{t.full(E(a.full), i.beneficiaries)}</span>
              {a.ownCut > 0 ? <span className="ci-calc-note block">{t.ownCut(E(a.ownCut), E(FREE_INCOME))}</span> : null}
              {a.householdCut > 0 ? <span className="ci-calc-note block">{t.householdCut(E(a.householdCut))}</span> : null}
              {a.floorApplied ? <span className="ci-calc-note block">{t.floor(E(MINIMUM_ANNUAL))}</span> : null}
              {a.complement > 0 ? <span className="ci-calc-note block">{t.complement(E(a.complement))}</span> : null}
              {a.thirdPersonHousehold ? <span className="ci-calc-note block">{t.thirdHousehold}</span> : null}
              <span className="ci-calc-note block">{t.effects}</span>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>{t.rRent}</dt>
          <dd>
            {rent.status === "may" ? (
              <>
                {t.rent.may(E(rent.annual))}
                {rent.shared ? <span className="ci-calc-note block">{t.rent.shared}</span> : null}
              </>
            ) : rent.status === "no" ? (
              t.rent.no(rent.reasons.map((x) => t.rentReason[x]).join("; "))
            ) : (
              t.rent[rent.status]
            )}
          </dd>
        </div>
      </dl>
      <p className="ci-calc-note">{t.asOfLine(day(asOf, locale))}</p>
      <p className="ci-calc-note">{t.articles}</p>
    </>
  );
}
