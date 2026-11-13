"use client";

import { useId, useState } from "react";

import { isIsoDate } from "@/lib/programmatic/employment/dates";
import { dateWords, money, num, parseAmount } from "@/lib/programmatic/employment/paths";
import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { END_REASONS, defaultPendingDays, settlement, type EndReason, type ExtraAccrual } from "@/lib/programmatic/employment/settlement";

/**
 * Final settlement (finiquito) calculator. Server-rendered with the page's
 * example; recomputes in the browser with settlement.ts. No storage.
 */

export interface SettlementInitial {
  start: string;
  end: string;
  monthly: string;
  extrasProrated: boolean;
  extraAmount: string;
  accrual: ExtraAccrual;
  vacationPerYear: string;
  vacationTaken: string;
  /** "" = worked out from the last day. */
  pendingDays: string;
  reason: EndReason;
  noticeMissing: boolean;
}

type Copy = {
  title: string;
  intro: string;
  noscript: string;
  start: string;
  end: string;
  monthly: string;
  monthlyHelp: string;
  prorated: string;
  extraAmount: string;
  extraAmountHelp: string;
  accrual: string;
  accruals: Record<ExtraAccrual, string>;
  vacationPerYear: string;
  vacationTaken: string;
  vacationHelp: string;
  pendingDays: string;
  pendingHelp: (auto: number) => string;
  reason: string;
  reasons: Record<EndReason, string>;
  notice: string;
  lines: {
    salary: (days: number) => string;
    summer: (from: string, days: number, of: number) => string;
    christmas: (from: string, days: number, of: number) => string;
    vacation: (days: string) => string;
    vacationOwed: (days: string) => string;
    notice: string;
    settlementTotal: string;
    dismissal: (days: string) => string;
    total: string;
  };
  proratedNote: string;
  invalidDates: string;
  invalidSalary: string;
  gross: string;
};

const T: Record<CalcLocale, Copy> = {
  es: {
    title: "Calcula tu finiquito",
    intro: "Datos de tu última nómina y de tus vacaciones. El cálculo se hace en tu navegador: no guardamos nada.",
    noscript: "Sin JavaScript ves el ejemplo; para tus datos, activa JavaScript.",
    start: "Fecha de inicio del contrato",
    end: "Último día trabajado",
    monthly: "Salario bruto mensual (€)",
    monthlyHelp: "El bruto de la nómina, sin horas extra. Si las pagas extra van prorrateadas, con la prorrata incluida.",
    prorated: "Mis pagas extra van prorrateadas en la nómina",
    extraAmount: "Importe bruto de cada paga extra (€)",
    extraAmountHelp: "Vacío = una mensualidad, lo más habitual. Lo fija tu convenio.",
    accrual: "Cómo se generan las pagas extra",
    accruals: { annual: "Anual: cada paga, en 12 meses (Navidad: enero–diciembre; verano: julio–junio)", semester: "Semestral: verano, enero–junio; Navidad, julio–diciembre" },
    vacationPerYear: "Días de vacaciones al año (naturales)",
    vacationTaken: "Días de vacaciones ya disfrutados este año",
    vacationHelp: "Mínimo legal: 30 días naturales. Si tu convenio cuenta días laborables, 22 laborables equivalen más o menos a 30 naturales.",
    pendingDays: "Días del último mes sin cobrar",
    pendingHelp: (auto) => `Vacío = ${auto} (los días de este mes hasta el último día trabajado; el mes completo cuenta como 30).`,
    reason: "Motivo del fin del contrato",
    reasons: { none: "Baja voluntaria, despido disciplinario procedente o mutuo acuerdo (sin indemnización)", temporary: "Fin de contrato temporal (12 días por año)", objective: "Despido objetivo o ERE (20 días por año)", unfair: "Despido improcedente reconocido (33/45 días por año)" },
    notice: "La empresa no me dio los 15 días de preaviso",
    lines: {
      salary: (n) => `Salario de ${n} días del último mes`,
      summer: (from, n, of) => `Paga de verano: ${n} de ${of} días desde el ${from}`,
      christmas: (from, n, of) => `Paga de Navidad: ${n} de ${of} días desde el ${from}`,
      vacation: (n) => `Vacaciones no disfrutadas: ${n} días`,
      vacationOwed: (n) => `Vacaciones disfrutadas de más: ${n} días (se pueden descontar)`,
      notice: "Preaviso no concedido: 15 días de salario",
      settlementTotal: "Finiquito (bruto)",
      dismissal: (n) => `Indemnización: ${n} días de salario`,
      total: "Total a cobrar (bruto)",
    },
    proratedNote: "Pagas prorrateadas: ya las has cobrado mes a mes, no se suman.",
    invalidDates: "El último día tiene que ser igual o posterior al inicio del contrato.",
    invalidSalary: "Pon un salario mensual mayor que cero.",
    gross: "Importes brutos: el salario, las pagas y las vacaciones tributan IRPF y cotizan; la indemnización legal, no.",
  },
  ca: {
    title: "Calcula la teva quitança",
    intro: "Dades de la teva última nòmina i de les vacances. El càlcul es fa al teu navegador: no desem res.",
    noscript: "Sense JavaScript veus l'exemple; per a les teves dades, activa JavaScript.",
    start: "Data d'inici del contracte",
    end: "Últim dia treballat",
    monthly: "Salari brut mensual (€)",
    monthlyHelp: "El brut de la nòmina, sense hores extra. Si les pagues extra van prorratejades, amb la prorrata inclosa.",
    prorated: "Les meves pagues extra van prorratejades a la nòmina",
    extraAmount: "Import brut de cada paga extra (€)",
    extraAmountHelp: "Buit = una mensualitat, el més habitual. Ho fixa el teu conveni.",
    accrual: "Com es generen les pagues extra",
    accruals: { annual: "Anual: cada paga, en 12 mesos (Nadal: gener–desembre; estiu: juliol–juny)", semester: "Semestral: estiu, gener–juny; Nadal, juliol–desembre" },
    vacationPerYear: "Dies de vacances l'any (naturals)",
    vacationTaken: "Dies de vacances ja gaudits aquest any",
    vacationHelp: "Mínim legal: 30 dies naturals. Si el teu conveni compta dies laborables, 22 laborables equivalen més o menys a 30 naturals.",
    pendingDays: "Dies de l'últim mes sense cobrar",
    pendingHelp: (auto) => `Buit = ${auto} (els dies d'aquest mes fins a l'últim dia treballat; el mes sencer compta com 30).`,
    reason: "Motiu de la fi del contracte",
    reasons: { none: "Baixa voluntària, acomiadament disciplinari procedent o mutu acord (sense indemnització)", temporary: "Fi de contracte temporal (12 dies per any)", objective: "Acomiadament objectiu o ERO (20 dies per any)", unfair: "Acomiadament improcedent reconegut (33/45 dies per any)" },
    notice: "L'empresa no em va donar els 15 dies de preavís",
    lines: {
      salary: (n) => `Salari de ${n} dies de l'últim mes`,
      summer: (from, n, of) => `Paga d'estiu: ${n} de ${of} dies des del ${from}`,
      christmas: (from, n, of) => `Paga de Nadal: ${n} de ${of} dies des del ${from}`,
      vacation: (n) => `Vacances no gaudides: ${n} dies`,
      vacationOwed: (n) => `Vacances gaudides de més: ${n} dies (es poden descomptar)`,
      notice: "Preavís no concedit: 15 dies de salari",
      settlementTotal: "Quitança (brut)",
      dismissal: (n) => `Indemnització: ${n} dies de salari`,
      total: "Total a cobrar (brut)",
    },
    proratedNote: "Pagues prorratejades: ja les has cobrat mes a mes, no se sumen.",
    invalidDates: "L'últim dia ha de ser igual o posterior a l'inici del contracte.",
    invalidSalary: "Posa un salari mensual més gran que zero.",
    gross: "Imports bruts: el salari, les pagues i les vacances tributen IRPF i cotitzen; la indemnització legal, no.",
  },
  en: {
    title: "Work out your final settlement",
    intro: "Figures from your last payslip and your holidays. It is calculated in your browser: nothing is stored.",
    noscript: "Without JavaScript you see the example; for your own figures, turn JavaScript on.",
    start: "Contract start date",
    end: "Last day worked",
    monthly: "Gross monthly salary (€)",
    monthlyHelp: "Gross pay on the payslip, no overtime. If your extra payments are spread over the year, include that share.",
    prorated: "My extra payments are spread over my monthly payslips",
    extraAmount: "Gross amount of each extra payment (€)",
    extraAmountHelp: "Empty = one month's pay, the usual case. Your collective agreement sets it.",
    accrual: "How the extra payments accrue",
    accruals: { annual: "Yearly: each over 12 months (Christmas: January–December; summer: July–June)", semester: "Half-yearly: summer, January–June; Christmas, July–December" },
    vacationPerYear: "Holiday days a year (calendar days)",
    vacationTaken: "Holiday days already taken this year",
    vacationHelp: "Legal minimum: 30 calendar days. If your agreement counts working days, 22 working days are roughly 30 calendar days.",
    pendingDays: "Days of the last month not yet paid",
    pendingHelp: (auto) => `Empty = ${auto} (this month's days up to your last day; a full month counts as 30).`,
    reason: "Why the contract ends",
    reasons: { none: "Resignation, fair disciplinary dismissal or mutual agreement (no severance)", temporary: "End of a fixed-term contract (12 days a year)", objective: "Objective dismissal or ERE (20 days a year)", unfair: "Unfair dismissal accepted (33/45 days a year)" },
    notice: "My employer did not give me the 15 days' notice",
    lines: {
      salary: (n) => `Salary for ${n} days of the last month`,
      summer: (from, n, of) => `Summer extra payment: ${n} of ${of} days since ${from}`,
      christmas: (from, n, of) => `Christmas extra payment: ${n} of ${of} days since ${from}`,
      vacation: (n) => `Unused holiday: ${n} days`,
      vacationOwed: (n) => `Holiday taken in excess: ${n} days (may be deducted)`,
      notice: "Notice not given: 15 days' salary",
      settlementTotal: "Final settlement (gross)",
      dismissal: (n) => `Severance pay: ${n} days' salary`,
      total: "Total to be paid (gross)",
    },
    proratedNote: "Spread extra payments: already paid month by month, not added.",
    invalidDates: "The last day must be on or after the contract start.",
    invalidSalary: "Enter a monthly salary above zero.",
    gross: "Gross amounts: salary, extra payments and holiday pay are taxed and pay contributions; statutory severance pay does not.",
  },
};

export function SettlementCalculator({ locale, initial }: { locale: CalcLocale; initial: SettlementInitial }) {
  const t = T[locale];
  const id = useId();
  const [s, setS] = useState<SettlementInitial>(initial);
  const set = (next: Partial<SettlementInitial>) => setS((prev) => ({ ...prev, ...next }));

  const monthly = parseAmount(s.monthly);
  const datesOk = isIsoDate(s.start) && isIsoDate(s.end) && s.end >= s.start;
  const autoDays = isIsoDate(s.end) ? defaultPendingDays(s.end) : 30;
  const r =
    datesOk && monthly > 0
      ? settlement({
          start: s.start,
          end: s.end,
          monthly,
          extrasProrated: s.extrasProrated,
          extraAmount: parseAmount(s.extraAmount) || undefined,
          accrual: s.accrual,
          vacationPerYear: parseAmount(s.vacationPerYear),
          vacationTaken: parseAmount(s.vacationTaken),
          pendingDays: s.pendingDays.trim() ? parseAmount(s.pendingDays) : undefined,
          reason: s.reason,
          noticeMissing: s.noticeMissing,
        })
      : null;
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale);

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
          <label htmlFor={`${id}-start`}>{t.start}</label>
          <input id={`${id}-start`} type="date" className="ci-field" value={s.start} onChange={(e) => set({ start: e.target.value })} />
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-end`}>{t.end}</label>
          <input id={`${id}-end`} type="date" className="ci-field" value={s.end} onChange={(e) => set({ end: e.target.value })} />
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-monthly`}>{t.monthly}</label>
          <input id={`${id}-monthly`} type="text" inputMode="decimal" autoComplete="off" className="ci-field" value={s.monthly} onChange={(e) => set({ monthly: e.target.value })} aria-describedby={`${id}-monthly-help`} />
          <span id={`${id}-monthly-help`} className="ci-calc-note">
            {t.monthlyHelp}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-pending`}>{t.pendingDays}</label>
          <input id={`${id}-pending`} type="text" inputMode="numeric" autoComplete="off" className="ci-field" value={s.pendingDays} placeholder={String(autoDays)} onChange={(e) => set({ pendingDays: e.target.value })} aria-describedby={`${id}-pending-help`} />
          <span id={`${id}-pending-help`} className="ci-calc-note">
            {t.pendingHelp(autoDays)}
          </span>
        </p>
        <div className="ci-calc-row ci-calc-wide">
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={s.extrasProrated} onChange={(e) => set({ extrasProrated: e.target.checked })} />
            <span>{t.prorated}</span>
          </label>
        </div>
        {!s.extrasProrated ? (
          <>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-extra`}>{t.extraAmount}</label>
              <input id={`${id}-extra`} type="text" inputMode="decimal" autoComplete="off" className="ci-field" value={s.extraAmount} placeholder={s.monthly} onChange={(e) => set({ extraAmount: e.target.value })} aria-describedby={`${id}-extra-help`} />
              <span id={`${id}-extra-help`} className="ci-calc-note">
                {t.extraAmountHelp}
              </span>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-accrual`}>{t.accrual}</label>
              <select id={`${id}-accrual`} className="ci-field" value={s.accrual} onChange={(e) => set({ accrual: e.target.value as ExtraAccrual })}>
                {(["annual", "semester"] as const).map((k) => (
                  <option key={k} value={k}>
                    {t.accruals[k]}
                  </option>
                ))}
              </select>
            </p>
          </>
        ) : null}
        <p className="ci-calc-row">
          <label htmlFor={`${id}-vac`}>{t.vacationPerYear}</label>
          <input id={`${id}-vac`} type="text" inputMode="numeric" autoComplete="off" className="ci-field" value={s.vacationPerYear} onChange={(e) => set({ vacationPerYear: e.target.value })} aria-describedby={`${id}-vac-help`} />
          <span id={`${id}-vac-help`} className="ci-calc-note">
            {t.vacationHelp}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-taken`}>{t.vacationTaken}</label>
          <input id={`${id}-taken`} type="text" inputMode="decimal" autoComplete="off" className="ci-field" value={s.vacationTaken} onChange={(e) => set({ vacationTaken: e.target.value })} />
        </p>
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-reason`}>{t.reason}</label>
          <select id={`${id}-reason`} className="ci-field" value={s.reason} onChange={(e) => set({ reason: e.target.value as EndReason })}>
            {END_REASONS.map((k) => (
              <option key={k} value={k}>
                {t.reasons[k]}
              </option>
            ))}
          </select>
        </p>
        {s.reason === "objective" ? (
          <div className="ci-calc-row ci-calc-wide">
            <label className="flex items-start gap-2 font-normal">
              <input type="checkbox" className="mt-1" checked={s.noticeMissing} onChange={(e) => set({ noticeMissing: e.target.checked })} />
              <span>{t.notice}</span>
            </label>
          </div>
        ) : null}
      </div>

      <div aria-live="polite">
        {!datesOk ? <p className="ci-calc-note">{t.invalidDates}</p> : null}
        {datesOk && monthly <= 0 ? <p className="ci-calc-note">{t.invalidSalary}</p> : null}
        {r ? (
          <dl className="ci-calc-results">
            <div>
              <dt>{t.lines.salary(r.pendingDays)}</dt>
              <dd className="ci-numeric">{m(r.salary)}</dd>
            </div>
            {r.extras.map((e) => (
              <div key={e.which}>
                <dt>{(e.which === "summer" ? t.lines.summer : t.lines.christmas)(dateWords(e.from > s.start ? e.from : s.start, locale), e.accruedDays, e.periodDays)}</dt>
                <dd className="ci-numeric">{m(e.amount)}</dd>
              </div>
            ))}
            <div>
              <dt>{r.vacation.pending >= 0 ? t.lines.vacation(n(r.vacation.pending)) : t.lines.vacationOwed(n(-r.vacation.pending))}</dt>
              <dd className="ci-numeric">{m(r.vacation.amount)}</dd>
            </div>
            {r.notice > 0 ? (
              <div>
                <dt>{t.lines.notice}</dt>
                <dd className="ci-numeric">{m(r.notice)}</dd>
              </div>
            ) : null}
            <div className="ci-calc-total">
              <dt>{t.lines.settlementTotal}</dt>
              <dd className="ci-numeric">{m(r.settlementTotal)}</dd>
            </div>
            {r.dismissal ? (
              <>
                <div>
                  <dt>{t.lines.dismissal(n(r.dismissal.days))}</dt>
                  <dd className="ci-numeric">{m(r.dismissal.amount)}</dd>
                </div>
                <div className="ci-calc-total">
                  <dt>{t.lines.total}</dt>
                  <dd className="ci-numeric">{m(r.total)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        ) : null}
      </div>
      {r && s.extrasProrated ? <p className="ci-calc-note">{t.proratedNote}</p> : null}
      {r ? <p className="ci-calc-note">{t.gross}</p> : null}
    </section>
  );
}
