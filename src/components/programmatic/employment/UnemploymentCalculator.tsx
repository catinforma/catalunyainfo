"use client";

import { useId, useState } from "react";

import { money, num, parseAmount, pct, type CalcLocale } from "@/lib/programmatic/employment/paths";
import { BENEFIT_SS_RATE, SUBSIDY_MONTHLY } from "@/lib/programmatic/employment/rules";
import { unemploymentBenefit, type Children } from "@/lib/programmatic/employment/unemployment";

/**
 * Unemployment benefit (paro) calculator. Server-rendered with the page's
 * example; recomputes in the browser with unemployment.ts. No storage.
 */

export interface UnemploymentInitial {
  contributedDays: string;
  monthlyBase: string;
  children: Children;
  partTimePct: string;
}

type Copy = {
  title: string;
  intro: string;
  noscript: string;
  days: string;
  daysHelp: string;
  base: string;
  baseHelp: string;
  children: string;
  childrenOpts: [string, string, string];
  partTime: string;
  partTimeHelp: string;
  duration: string;
  durationValue: (days: number, months: string) => string;
  first: (to: number) => string;
  after: (from: number, to: number) => string;
  perMonth: string;
  total: string;
  ss: (rate: string) => string;
  limitMax: (x: string) => string;
  limitMin: (x: string) => string;
  baseLine: (monthly: string, daily: string) => string;
  baseCapped: string;
  next: (at: number, more: number) => string;
  top: string;
  notEligible: (subsidy: string) => string;
  noBase: string;
  irpf: string;
};

const T: Record<CalcLocale, Copy> = {
  es: {
    title: "Calcula tu paro",
    intro: "Días cotizados, base de cotización y si tienes hijos a cargo. El cálculo se hace en tu navegador: no guardamos nada.",
    noscript: "Sin JavaScript ves el ejemplo; para tus datos, activa JavaScript o usa las tablas de abajo.",
    days: "Días cotizados en los últimos 6 años",
    daysHelp: "Los que no hayas usado ya para otro paro. Salen en tu informe de vida laboral de la Seguridad Social.",
    base: "Base de cotización mensual media (€)",
    baseHelp: "La «base de contingencias profesionales» o de desempleo de tus nóminas de los últimos 6 meses, sin horas extra. Si no la tienes, el bruto mensual con la prorrata de las pagas extra se le parece.",
    children: "Hijos a cargo",
    childrenOpts: ["Ninguno", "Uno", "Dos o más"],
    partTime: "Jornada (% de una completa)",
    partTimeHelp: "100 si trabajabas a jornada completa. Los topes se reducen en proporción.",
    duration: "Duración",
    durationValue: (d, m) => `${d} días (${m} meses)`,
    first: (to) => `Días 1 a ${to} (70 %)`,
    after: (from, to) => `Días ${from} a ${to} (60 %)`,
    perMonth: "/mes",
    total: "Total bruto de toda la prestación",
    ss: (rate) => `Cotización a la Seguridad Social que te descuenta el SEPE (${rate} de la base, aprox.)`,
    limitMax: (x) => `Limitado al máximo legal: ${x} al mes.`,
    limitMin: (x) => `Elevado al mínimo legal: ${x} al mes.`,
    baseLine: (mo, da) => `Base reguladora: ${mo} al mes (${da} al día).`,
    baseCapped: "Tu base supera la base máxima de cotización de 2026: contamos la máxima.",
    next: (at, more) => `Con ${at} días cotizados (te faltan ${more}) pasarías al siguiente tramo de duración.`,
    top: "Ya estás en el tramo más alto: 720 días, dos años.",
    notEligible: (s) => `Con menos de 360 días cotizados no hay prestación contributiva. Puede corresponderte el subsidio por cotización insuficiente (${s} al mes los primeros 180 días, según el SEPE), si cumples sus requisitos de rentas.`,
    noBase: "Pon tu base de cotización mensual.",
    irpf: "El SEPE también retiene IRPF si corresponde: depende de lo que vayas a cobrar en el año y de tu situación familiar.",
  },
  ca: {
    title: "Calcula el teu atur",
    intro: "Dies cotitzats, base de cotització i si tens fills a càrrec. El càlcul es fa al teu navegador: no desem res.",
    noscript: "Sense JavaScript veus l'exemple; per a les teves dades, activa JavaScript o fes servir les taules de sota.",
    days: "Dies cotitzats en els últims 6 anys",
    daysHelp: "Els que no hagis fet servir ja per a un altre atur. Surten a l'informe de vida laboral de la Seguretat Social.",
    base: "Base de cotització mensual mitjana (€)",
    baseHelp: "La «base de contingències professionals» o d'atur de les nòmines dels últims 6 mesos, sense hores extra. Si no la tens, el brut mensual amb la prorrata de les pagues extra s'hi assembla.",
    children: "Fills a càrrec",
    childrenOpts: ["Cap", "Un", "Dos o més"],
    partTime: "Jornada (% d'una completa)",
    partTimeHelp: "100 si treballaves a jornada completa. Els límits es redueixen en proporció.",
    duration: "Durada",
    durationValue: (d, m) => `${d} dies (${m} mesos)`,
    first: (to) => `Dies 1 a ${to} (70 %)`,
    after: (from, to) => `Dies ${from} a ${to} (60 %)`,
    perMonth: "/mes",
    total: "Total brut de tota la prestació",
    ss: (rate) => `Cotització a la Seguretat Social que et descompta el SEPE (${rate} de la base, aprox.)`,
    limitMax: (x) => `Limitat al màxim legal: ${x} al mes.`,
    limitMin: (x) => `Elevat al mínim legal: ${x} al mes.`,
    baseLine: (mo, da) => `Base reguladora: ${mo} al mes (${da} al dia).`,
    baseCapped: "La teva base supera la base màxima de cotització del 2026: comptem la màxima.",
    next: (at, more) => `Amb ${at} dies cotitzats (te'n falten ${more}) passaries al tram següent de durada.`,
    top: "Ja ets al tram més alt: 720 dies, dos anys.",
    notEligible: (s) => `Amb menys de 360 dies cotitzats no hi ha prestació contributiva. Et pot correspondre el subsidi per cotització insuficient (${s} al mes els primers 180 dies, segons el SEPE), si compleixes els requisits de rendes.`,
    noBase: "Posa la teva base de cotització mensual.",
    irpf: "El SEPE també reté IRPF si correspon: depèn del que cobraràs durant l'any i de la teva situació familiar.",
  },
  en: {
    title: "Work out your unemployment benefit",
    intro: "Days contributed, contribution base and children in your care. It is calculated in your browser: nothing is stored.",
    noscript: "Without JavaScript you see the example; for your own figures, turn JavaScript on or use the tables below.",
    days: "Days contributed in the last 6 years",
    daysHelp: "Those not already used for an earlier benefit. They are on your Social Security employment record (informe de vida laboral).",
    base: "Average monthly contribution base (€)",
    baseHelp: "The \"base de contingencias profesionales\" (or unemployment base) on your last 6 months' payslips, without overtime. If you do not have it, gross monthly pay with the extra payments spread is close.",
    children: "Children in your care",
    childrenOpts: ["None", "One", "Two or more"],
    partTime: "Working hours (% of full time)",
    partTimeHelp: "100 if you worked full time. The limits shrink in proportion.",
    duration: "Duration",
    durationValue: (d, m) => `${d} days (${m} months)`,
    first: (to) => `Days 1 to ${to} (70%)`,
    after: (from, to) => `Days ${from} to ${to} (60%)`,
    perMonth: "/month",
    total: "Gross total over the whole benefit",
    ss: (rate) => `Social Security contribution SEPE deducts (${rate} of the base, approx.)`,
    limitMax: (x) => `Capped at the legal maximum: ${x} a month.`,
    limitMin: (x) => `Raised to the legal minimum: ${x} a month.`,
    baseLine: (mo, da) => `Base reguladora: ${mo} a month (${da} a day).`,
    baseCapped: "Your base is above the 2026 maximum contribution base: we use the maximum.",
    next: (at, more) => `At ${at} days contributed (${more} more) you would move up a duration bracket.`,
    top: "You are already in the top bracket: 720 days, two years.",
    notEligible: (s) => `With fewer than 360 days contributed there is no contributory benefit. You may get the subsidy for insufficient contributions (${s} a month for the first 180 days, per SEPE) if you meet its income test.`,
    noBase: "Enter your monthly contribution base.",
    irpf: "SEPE also withholds income tax (IRPF) where due: it depends on what you will receive in the year and your family situation.",
  },
};

export function UnemploymentCalculator({ locale, initial }: { locale: CalcLocale; initial: UnemploymentInitial }) {
  const t = T[locale];
  const id = useId();
  const [s, setS] = useState<UnemploymentInitial>(initial);
  const set = (next: Partial<UnemploymentInitial>) => setS((prev) => ({ ...prev, ...next }));

  const contributed = Math.floor(parseAmount(s.contributedDays));
  const base = parseAmount(s.monthlyBase);
  const partTime = parseAmount(s.partTimePct) || 100;
  const r = unemploymentBenefit({ contributedDays: contributed, monthlyBase: base, children: s.children, partTimePct: partTime });
  const m = (x: number) => money(x, locale);

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
          <label htmlFor={`${id}-days`}>{t.days}</label>
          <input id={`${id}-days`} type="text" inputMode="numeric" autoComplete="off" className="ci-field" value={s.contributedDays} onChange={(e) => set({ contributedDays: e.target.value })} aria-describedby={`${id}-days-help`} />
          <span id={`${id}-days-help`} className="ci-calc-note">
            {t.daysHelp}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-base`}>{t.base}</label>
          <input id={`${id}-base`} type="text" inputMode="decimal" autoComplete="off" className="ci-field" value={s.monthlyBase} onChange={(e) => set({ monthlyBase: e.target.value })} aria-describedby={`${id}-base-help`} />
          <span id={`${id}-base-help`} className="ci-calc-note">
            {t.baseHelp}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-children`}>{t.children}</label>
          <select id={`${id}-children`} className="ci-field" value={s.children} onChange={(e) => set({ children: Number(e.target.value) as Children })}>
            {t.childrenOpts.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-pt`}>{t.partTime}</label>
          <span className="ci-calc-number">
            <input id={`${id}-pt`} type="text" inputMode="numeric" autoComplete="off" className="ci-field" value={s.partTimePct} onChange={(e) => set({ partTimePct: e.target.value })} aria-describedby={`${id}-pt-help`} />
            <span className="ci-calc-suffix">%</span>
          </span>
          <span id={`${id}-pt-help`} className="ci-calc-note">
            {t.partTimeHelp}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {contributed < 360 ? <p className="ci-calc-note">{t.notEligible(m(SUBSIDY_MONTHLY[0]))}</p> : null}
        {contributed >= 360 && base <= 0 ? <p className="ci-calc-note">{t.noBase}</p> : null}
        {r.eligible ? (
          <dl className="ci-calc-results">
            <div>
              <dt>{t.duration}</dt>
              <dd className="ci-numeric">{t.durationValue(r.durationDays, num(r.durationMonths, locale, 1))}</dd>
            </div>
            {r.phases.map((p) => (
              <div key={p.fromDay} className={p.fromDay === 1 ? "ci-calc-total" : undefined}>
                <dt>{p.fromDay === 1 ? t.first(p.toDay) : t.after(p.fromDay, p.toDay)}</dt>
                <dd className="ci-numeric">
                  {m(p.monthly)}
                  {t.perMonth}
                </dd>
              </div>
            ))}
            <div>
              <dt>{t.total}</dt>
              <dd className="ci-numeric">{m(r.total)}</dd>
            </div>
            <div>
              <dt>{t.ss(pct(BENEFIT_SS_RATE, locale))}</dt>
              <dd className="ci-numeric">
                −{m(r.ssMonthly)}
                {t.perMonth}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
      {r.eligible ? (
        <ul className="mt-2 text-sm">
          <li>{t.baseLine(m(r.baseMonthly), m(r.baseDaily))}</li>
          {r.baseCapped ? <li>{t.baseCapped}</li> : null}
          {r.phases.some((p) => p.limit === "max") ? <li>{t.limitMax(m(r.maxMonthly))}</li> : null}
          {r.phases.some((p) => p.limit === "min") ? <li>{t.limitMin(m(r.minMonthly))}</li> : null}
          <li>{r.nextBracketAt === null ? t.top : t.next(r.nextBracketAt, r.nextBracketAt - contributed)}</li>
          <li>{t.irpf}</li>
        </ul>
      ) : null}
    </section>
  );
}
