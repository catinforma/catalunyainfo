"use client";

import { useId, useState } from "react";

import { isIsoDate } from "@/lib/programmatic/employment/dates";
import { DISMISSAL_TYPES, compareDismissals, type DismissalResult, type DismissalType } from "@/lib/programmatic/employment/dismissal";
import { dateWords, money, num, parseAmount } from "@/lib/programmatic/employment/paths";
import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { SMI_ANNUAL } from "@/lib/programmatic/employment/rules";

/**
 * Dismissal pay calculator. Server-rendered with the page's example (so the
 * answer is in the HTML without JavaScript); every change recomputes in the
 * browser with dismissal.ts. No storage, nothing leaves the page.
 */

export interface DismissalInitial {
  type: DismissalType;
  start: string;
  end: string;
  salary: string;
  salaryKind: "annual" | "daily";
}

type Copy = {
  title: string;
  intro: string;
  noscript: string;
  type: string;
  types: Record<DismissalType, string>;
  typeHelp: Record<DismissalType, string>;
  start: string;
  end: string;
  salaryKind: string;
  annual: string;
  daily: string;
  salaryAnnual: string;
  salaryDaily: string;
  annualHelp: string;
  amount: string;
  days: string;
  dailySalary: string;
  service: (months: number, days: number) => string;
  tranche: (from: string, to: string, months: number, rate: number, days: string) => string;
  temporaryLine: (calendarDays: number, days: string) => string;
  capped: (cap: string) => string;
  basis: Record<DismissalResult["rule"], string>;
  compareTitle: string;
  compareCols: [string, string, string];
  invalidDates: string;
  invalidSalary: string;
  belowSmi: (smi: string) => string;
  tempNote: string;
};

const T: Record<CalcLocale, Copy> = {
  es: {
    title: "Calcula tu indemnización",
    intro: "Pon las fechas, el salario y el tipo de despido. El cálculo se hace en tu navegador: no guardamos nada.",
    noscript: "Sin JavaScript ves el ejemplo; para tus datos, activa JavaScript o usa la tabla de abajo.",
    type: "Tipo de despido o extinción",
    types: { unfair: "Despido improcedente", objective: "Despido objetivo o ERE (procedente)", temporary: "Fin de contrato temporal" },
    typeHelp: {
      unfair: "Lo declara un juez o lo reconoce la empresa: 33 días por año (45 por el tiempo anterior al 12 de febrero de 2012).",
      objective: "Causas económicas, técnicas, organizativas o de producción, también en un despido colectivo (ERE): 20 días por año.",
      temporary: "Al acabar un contrato de duración determinada: 12 días por año. No se aplica a los contratos formativos ni a los de sustitución.",
    },
    start: "Fecha de inicio (antigüedad)",
    end: "Fecha del despido o fin del contrato",
    salaryKind: "Salario que conoces",
    annual: "Bruto anual",
    daily: "Bruto diario",
    salaryAnnual: "Salario bruto anual, con pagas extra (€)",
    salaryDaily: "Salario bruto diario (€)",
    annualHelp: "Todo lo que cobras en un año antes de impuestos, pagas extra y complementos incluidos. Lo dividimos entre 365.",
    amount: "Indemnización",
    days: "Días de salario",
    dailySalary: "Salario diario",
    service: (m, d) => `Antigüedad: ${m} meses (${d} días naturales); cada fracción de mes cuenta como un mes entero.`,
    tranche: (from, to, m, rate, d) => `Del ${from} al ${to}: ${m} meses × ${rate} días / 12 = ${d} días.`,
    temporaryLine: (cd, d) => `${cd} días trabajados × 12 días / 365 = ${d} días.`,
    capped: (cap) => `Se aplica el tope legal: ${cap} días de salario.`,
    basis: {
      "33": "Art. 56.1 del Estatuto de los Trabajadores: 33 días de salario por año, prorrateando por meses, hasta 24 mensualidades (720 días).",
      "45+33": "Disposición transitoria 11ª del Estatuto: 45 días por año hasta el 11 de febrero de 2012 y 33 desde el 12; tope de 720 días, salvo que el tramo anterior a 2012 ya dé más, y nunca más de 42 mensualidades.",
      "20": "Art. 53.1.b del Estatuto (y 51.4 para el ERE): 20 días de salario por año, prorrateando por meses, hasta 12 mensualidades.",
      "12": "Art. 49.1.c del Estatuto: la parte proporcional de 12 días de salario por año de servicio.",
    },
    compareTitle: "Con las mismas fechas y salario",
    compareCols: ["Supuesto", "Días", "Importe"],
    invalidDates: "La fecha de fin tiene que ser igual o posterior a la de inicio.",
    invalidSalary: "Pon un salario mayor que cero.",
    belowSmi: (smi) => `Es menos que el salario mínimo anual de 2026 a jornada completa (${smi}). Si trabajas a tiempo parcial es normal; si no, revisa la cifra.`,
    tempNote: "Si tu contrato temporal era en fraude de ley, el despido puede ser improcedente: compara con la primera fila.",
  },
  ca: {
    title: "Calcula la teva indemnització",
    intro: "Posa les dates, el salari i el tipus d'acomiadament. El càlcul es fa al teu navegador: no desem res.",
    noscript: "Sense JavaScript veus l'exemple; per a les teves dades, activa JavaScript o fes servir la taula de sota.",
    type: "Tipus d'acomiadament o extinció",
    types: { unfair: "Acomiadament improcedent", objective: "Acomiadament objectiu o ERO (procedent)", temporary: "Fi de contracte temporal" },
    typeHelp: {
      unfair: "El declara un jutge o el reconeix l'empresa: 33 dies per any (45 pel temps anterior al 12 de febrer de 2012).",
      objective: "Causes econòmiques, tècniques, organitzatives o de producció, també en un acomiadament col·lectiu (ERO): 20 dies per any.",
      temporary: "En acabar un contracte de durada determinada: 12 dies per any. No s'aplica als contractes formatius ni als de substitució.",
    },
    start: "Data d'inici (antiguitat)",
    end: "Data de l'acomiadament o fi del contracte",
    salaryKind: "Salari que coneixes",
    annual: "Brut anual",
    daily: "Brut diari",
    salaryAnnual: "Salari brut anual, amb pagues extra (€)",
    salaryDaily: "Salari brut diari (€)",
    annualHelp: "Tot el que cobres en un any abans d'impostos, pagues extra i complements inclosos. Ho dividim entre 365.",
    amount: "Indemnització",
    days: "Dies de salari",
    dailySalary: "Salari diari",
    service: (m, d) => `Antiguitat: ${m} mesos (${d} dies naturals); cada fracció de mes compta com un mes sencer.`,
    tranche: (from, to, m, rate, d) => `Del ${from} al ${to}: ${m} mesos × ${rate} dies / 12 = ${d} dies.`,
    temporaryLine: (cd, d) => `${cd} dies treballats × 12 dies / 365 = ${d} dies.`,
    capped: (cap) => `S'aplica el límit legal: ${cap} dies de salari.`,
    basis: {
      "33": "Art. 56.1 de l'Estatut dels Treballadors: 33 dies de salari per any, prorratejant per mesos, fins a 24 mensualitats (720 dies).",
      "45+33": "Disposició transitòria 11a de l'Estatut: 45 dies per any fins a l'11 de febrer de 2012 i 33 des del 12; límit de 720 dies, tret que el tram anterior al 2012 ja en doni més, i mai més de 42 mensualitats.",
      "20": "Art. 53.1.b de l'Estatut (i 51.4 per a l'ERO): 20 dies de salari per any, prorratejant per mesos, fins a 12 mensualitats.",
      "12": "Art. 49.1.c de l'Estatut: la part proporcional de 12 dies de salari per any de servei.",
    },
    compareTitle: "Amb les mateixes dates i salari",
    compareCols: ["Supòsit", "Dies", "Import"],
    invalidDates: "La data de fi ha de ser igual o posterior a la d'inici.",
    invalidSalary: "Posa un salari més gran que zero.",
    belowSmi: (smi) => `És menys que el salari mínim anual del 2026 a jornada completa (${smi}). Si treballes a temps parcial és normal; si no, revisa la xifra.`,
    tempNote: "Si el teu contracte temporal era en frau de llei, l'acomiadament pot ser improcedent: compara-ho amb la primera fila.",
  },
  en: {
    title: "Work out your severance pay",
    intro: "Enter the dates, your salary and the type of dismissal. It is calculated in your browser: nothing is stored.",
    noscript: "Without JavaScript you see the example; for your own figures, turn JavaScript on or use the table below.",
    type: "Type of dismissal or termination",
    types: { unfair: "Unfair dismissal (improcedente)", objective: "Objective dismissal or ERE (procedente)", temporary: "End of a fixed-term contract" },
    typeHelp: {
      unfair: "Declared by a court or accepted by the employer: 33 days a year (45 for service before 12 February 2012).",
      objective: "Economic, technical, organisational or production reasons, including collective dismissals (ERE): 20 days a year.",
      temporary: "When a fixed-term contract ends: 12 days a year. Not for training contracts or replacement (sustitución) contracts.",
    },
    start: "Start date (length of service)",
    end: "Date of dismissal or end of contract",
    salaryKind: "Salary you know",
    annual: "Gross annual",
    daily: "Gross daily",
    salaryAnnual: "Gross annual salary, extra payments included (€)",
    salaryDaily: "Gross daily salary (€)",
    annualHelp: "Everything you earn in a year before tax, extra payments and bonuses included. We divide it by 365.",
    amount: "Severance pay",
    days: "Days of salary",
    dailySalary: "Daily salary",
    service: (m, d) => `Length of service: ${m} months (${d} calendar days); any part of a month counts as a full month.`,
    tranche: (from, to, m, rate, d) => `${from} to ${to}: ${m} months × ${rate} days / 12 = ${d} days.`,
    temporaryLine: (cd, d) => `${cd} days worked × 12 days / 365 = ${d} days.`,
    capped: (cap) => `The legal cap applies: ${cap} days of salary.`,
    basis: {
      "33": "Art. 56.1 of the Workers' Statute: 33 days' salary per year, prorated by months, up to 24 months' pay (720 days).",
      "45+33": "Transitional provision 11 of the Statute: 45 days a year up to 11 February 2012 and 33 from the 12th; capped at 720 days, unless the pre-2012 part alone gives more, and never more than 42 months' pay.",
      "20": "Art. 53.1.b of the Statute (and 51.4 for an ERE): 20 days' salary per year, prorated by months, up to 12 months' pay.",
      "12": "Art. 49.1.c of the Statute: the proportional part of 12 days' salary per year of service.",
    },
    compareTitle: "Same dates and salary, each case",
    compareCols: ["Case", "Days", "Amount"],
    invalidDates: "The end date must be on or after the start date.",
    invalidSalary: "Enter a salary above zero.",
    belowSmi: (smi) => `That is below the 2026 full-time minimum wage for a year (${smi}). Normal if you work part-time; otherwise check the figure.`,
    tempNote: "If your fixed-term contract was not lawful, the dismissal may be unfair: compare with the first row.",
  },
};

export function DismissalCalculator({ locale, initial }: { locale: CalcLocale; initial: DismissalInitial }) {
  const t = T[locale];
  const id = useId();
  const [s, setS] = useState<DismissalInitial>(initial);
  const set = (next: Partial<DismissalInitial>) => setS((prev) => ({ ...prev, ...next }));

  const amount = parseAmount(s.salary);
  const datesOk = isIsoDate(s.start) && isIsoDate(s.end) && s.end >= s.start;
  const salaryOk = amount > 0;
  const all = datesOk && salaryOk ? compareDismissals({ start: s.start, end: s.end, ...(s.salaryKind === "annual" ? { annualSalary: amount } : { dailySalary: amount }) }) : null;
  const r = all ? all[s.type] : null;
  const fmt = (iso: string) => dateWords(iso, locale);

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
          <label htmlFor={`${id}-type`}>{t.type}</label>
          <select id={`${id}-type`} className="ci-field" value={s.type} onChange={(e) => set({ type: e.target.value as DismissalType })} aria-describedby={`${id}-type-help`}>
            {DISMISSAL_TYPES.map((k) => (
              <option key={k} value={k}>
                {t.types[k]}
              </option>
            ))}
          </select>
          <span id={`${id}-type-help`} className="ci-calc-note">
            {t.typeHelp[s.type]}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-start`}>{t.start}</label>
          <input id={`${id}-start`} type="date" className="ci-field" value={s.start} max={s.end || undefined} onChange={(e) => set({ start: e.target.value })} />
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-end`}>{t.end}</label>
          <input id={`${id}-end`} type="date" className="ci-field" value={s.end} min={s.start || undefined} onChange={(e) => set({ end: e.target.value })} />
        </p>
        <fieldset className="ci-calc-row">
          <legend className="text-sm font-medium">{t.salaryKind}</legend>
          <div className="flex flex-wrap gap-4">
            {(["annual", "daily"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 font-normal">
                <input type="radio" name={`${id}-kind`} value={k} checked={s.salaryKind === k} onChange={() => set({ salaryKind: k })} />
                <span>{k === "annual" ? t.annual : t.daily}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-salary`}>{s.salaryKind === "annual" ? t.salaryAnnual : t.salaryDaily}</label>
          <span className="ci-calc-number">
            <input id={`${id}-salary`} type="text" inputMode="decimal" autoComplete="off" className="ci-field" value={s.salary} onChange={(e) => set({ salary: e.target.value })} aria-describedby={`${id}-salary-help`} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-salary-help`} className="ci-calc-note">
            {s.salaryKind === "annual" ? t.annualHelp : null}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {!datesOk ? <p className="ci-calc-note">{t.invalidDates}</p> : null}
        {datesOk && !salaryOk ? <p className="ci-calc-note">{t.invalidSalary}</p> : null}
        {r ? (
          <dl className="ci-calc-results">
            <div className="ci-calc-total">
              <dt>{t.amount}</dt>
              <dd className="ci-numeric">{money(r.amount, locale)}</dd>
            </div>
            <div>
              <dt>{t.days}</dt>
              <dd className="ci-numeric">{num(r.days, locale)}</dd>
            </div>
            <div>
              <dt>{t.dailySalary}</dt>
              <dd className="ci-numeric">{money(r.dailySalary, locale)}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {r ? (
        <>
          {s.salaryKind === "annual" && amount > 0 && amount < SMI_ANNUAL ? <p className="ci-calc-note">{t.belowSmi(money(SMI_ANNUAL, locale))}</p> : null}
          <ul className="mt-2 text-sm">
            {r.type === "temporary" ? (
              <li>{t.temporaryLine(r.serviceDays, num(r.days, locale))}</li>
            ) : (
              r.tranches.map((tr) => <li key={tr.from}>{t.tranche(fmt(tr.from), fmt(tr.to), tr.months, tr.daysPerYear, num(Math.round(tr.days * 100) / 100, locale))}</li>)
            )}
            {r.capped && r.capDays !== null ? <li>{t.capped(num(Math.round(r.capDays * 100) / 100, locale))}</li> : null}
          </ul>
          {r.type !== "temporary" ? <p className="ci-calc-note">{t.service(r.tranches.reduce((n, tr) => n + tr.months, 0), r.serviceDays)}</p> : null}
          <p className="ci-calc-note">{t.basis[r.rule]}</p>

          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{t.compareTitle}</caption>
              <thead>
                <tr>
                  {t.compareCols.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DISMISSAL_TYPES.map((k) => (
                  <tr key={k} aria-current={k === s.type ? "true" : undefined}>
                    <th scope="row" className="font-normal">
                      {k === s.type ? <strong>{t.types[k]}</strong> : t.types[k]}
                    </th>
                    <td>{num(all![k].days, locale)}</td>
                    <td>{money(all![k].amount, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.type === "temporary" ? <p className="ci-calc-note">{t.tempNote}</p> : null}
        </>
      ) : null}
    </section>
  );
}
