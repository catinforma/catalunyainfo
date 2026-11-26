import type { CalcLocale } from "@/lib/programmatic/calculators/paths";

import { addDays, addMonths } from "./dates";
import { dismissalPay } from "./dismissal";
import { money, num } from "./paths";
import { OBJECTIVE_CAP_DAYS, OBJECTIVE_DAYS_PER_YEAR, RULES_AS_OF, TEMPORARY_DAYS_PER_YEAR, UNFAIR_CAP_DAYS, UNFAIR_DAYS_PER_YEAR, UNFAIR_OLD_DAYS_PER_YEAR } from "./rules";

/**
 * "Cuánto te toca por despido según los años trabajados" (26 Nov 2026): worked
 * examples for the dismissal-pay page, every amount from `dismissalPay`, the
 * function the calculator runs, on one salary and whole years of service ending
 * on RULES_AS_OF (all after 12 Feb 2012, so no 45-day tranche: that case has its
 * own section). Queries it answers (GSC, 28 days to 25 Nov): "calculo despido
 * procedente" 10 at 69.6, "calcular despido" 8 at 26.0, "calculo indemnizacion
 * por despido improcedente" 6 at 47.0, "dias por despido" 5 at 48.8, "despido
 * improcedente dias por año" 4 at 69.2, "calculo despido objetivo" 4 at 67.0.
 * The rules are the ET articles quoted in rules.ts (re-read on boe.es on
 * 26 Nov 2026: art. 56.1, 53.1.b and 49.1.c unchanged by the 25 Nov update).
 * Pure; client-safe.
 */

/** Gross annual salary of the table, extra payments included (2.000 € in 12 payments). */
export const EXAMPLE_SALARY = 24_000;
/** Whole years of service, all starting after 12 Feb 2012 when they end on RULES_AS_OF. */
export const EXAMPLE_YEARS = [1, 2, 3, 5, 10, 14] as const;
/** The end of every example: the day the rules were read. */
export const EXAMPLE_END = RULES_AS_OF;

/** First day of service so that the service is exactly `years` whole years up to EXAMPLE_END (both days worked). */
export function startFor(years: number, end: string = EXAMPLE_END): string {
  return addMonths(addDays(end, 1), -12 * years);
}

export interface YearsRow {
  years: number;
  start: string;
  unfair: { days: number; amount: number };
  objective: { days: number; amount: number };
  temporary: { days: number; amount: number };
}

export function yearsRows(salary: number = EXAMPLE_SALARY): YearsRow[] {
  return EXAMPLE_YEARS.map((years) => {
    const start = startFor(years);
    const pay = (type: "unfair" | "objective" | "temporary") => {
      const r = dismissalPay({ type, start, end: EXAMPLE_END, annualSalary: salary });
      return { days: r.days, amount: r.amount };
    };
    return { years, start, unfair: pay("unfair"), objective: pay("objective"), temporary: pay("temporary") };
  });
}

export interface DismissalExampleCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string];
  note: string;
  faq: { q: string; a: string }[];
}

/** The section's words in three languages; every figure from `yearsRows`. */
export function dismissalExampleCopy(locale: CalcLocale): DismissalExampleCopy {
  const rows = yearsRows();
  const by = (y: number) => rows.find((r) => r.years === y)!;
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale, x % 1 === 0 ? 0 : 2);
  const salary = m(EXAMPLE_SALARY);
  const daily = m(dismissalPay({ type: "unfair", start: startFor(1), end: EXAMPLE_END, annualSalary: EXAMPLE_SALARY }).dailySalary);
  const y1 = by(1);
  const y5 = by(5);
  const y10 = by(10);
  if (locale === "es") {
    return {
      title: "Cuánto te toca por despido según los años trabajados",
      intro: `Con un salario de ${salary} brutos al año (pagas extra incluidas; ${daily} al día) y la misma función que la calculadora. Si cobras más o menos, el importe sube o baja en la misma proporción: los días no cambian.`,
      caption: `Indemnización por años trabajados con ${salary} brutos al año (antigüedad desde 2012)`,
      cols: ["Años trabajados", `Despido improcedente (${UNFAIR_DAYS_PER_YEAR} días por año)`, `Despido objetivo o ERE (${OBJECTIVE_DAYS_PER_YEAR} días por año)`],
      note: `Días de salario e importe bruto. El improcedente tiene un tope de ${n(UNFAIR_CAP_DAYS)} días (24 mensualidades) y el objetivo de ${n(OBJECTIVE_CAP_DAYS)} (12 mensualidades): el objetivo llega al tope a los ${n(OBJECTIVE_CAP_DAYS / OBJECTIVE_DAYS_PER_YEAR)} años trabajados. Si empezaste antes del 12 de febrero de 2012, mira la sección de más abajo.`,
      faq: [
        {
          q: "¿Cuántos días por año corresponden en un despido improcedente?",
          a: `${UNFAIR_DAYS_PER_YEAR} días de salario por año trabajado, con un máximo de 24 mensualidades (${n(UNFAIR_CAP_DAYS)} días); el tiempo trabajado antes del 12 de febrero de 2012 se paga a ${UNFAIR_OLD_DAYS_PER_YEAR} días por año (Estatuto de los Trabajadores, art. 56.1 y disposición transitoria 11.ª). Los meses sueltos se prorratean. Con ${salary} al año y 5 años, ${n(y5.unfair.days)} días: ${m(y5.unfair.amount)}.`,
        },
        {
          q: "¿Cuánto me corresponde por un despido procedente?",
          a: `Depende del tipo. En un despido objetivo (o un ERE) declarado procedente, ${OBJECTIVE_DAYS_PER_YEAR} días por año con un máximo de 12 mensualidades (art. 53.1.b): con ${salary} al año y 5 años, ${n(y5.objective.days)} días, ${m(y5.objective.amount)}. En un despido disciplinario procedente no hay indemnización: solo el finiquito.`,
        },
        {
          q: "¿Cuánto me corresponde por fin de contrato temporal?",
          a: `La parte proporcional de ${TEMPORARY_DAYS_PER_YEAR} días de salario por año de servicio (art. 49.1.c), salvo en los contratos formativos y en el de sustitución. Con ${salary} al año, un contrato de un año da ${n(y1.temporary.days)} días: ${m(y1.temporary.amount)}.`,
        },
        {
          q: "¿Cuánto es la indemnización por despido con 10 años trabajados?",
          a: `Con ${salary} brutos al año, ${m(y10.unfair.amount)} si el despido es improcedente (${n(y10.unfair.days)} días) y ${m(y10.objective.amount)} si es objetivo o un ERE (${n(y10.objective.days)} días). Para tu salario y tus fechas exactas, usa la calculadora de arriba.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant et toca per acomiadament segons els anys treballats",
      intro: `Amb un salari de ${salary} bruts l'any (pagues extra incloses; ${daily} al dia) i la mateixa funció que la calculadora. Si cobres més o menys, l'import puja o baixa en la mateixa proporció: els dies no canvien.`,
      caption: `Indemnització per anys treballats amb ${salary} bruts l'any (antiguitat des del 2012)`,
      cols: ["Anys treballats", `Acomiadament improcedent (${UNFAIR_DAYS_PER_YEAR} dies per any)`, `Acomiadament objectiu o ERO (${OBJECTIVE_DAYS_PER_YEAR} dies per any)`],
      note: `Dies de salari i import brut. L'improcedent té un límit de ${n(UNFAIR_CAP_DAYS)} dies (24 mensualitats) i l'objectiu de ${n(OBJECTIVE_CAP_DAYS)} (12 mensualitats): l'objectiu arriba al límit als ${n(OBJECTIVE_CAP_DAYS / OBJECTIVE_DAYS_PER_YEAR)} anys treballats. Si vas començar abans del 12 de febrer de 2012, mira la secció de més avall.`,
      faq: [
        {
          q: "Quants dies per any corresponen en un acomiadament improcedent?",
          a: `${UNFAIR_DAYS_PER_YEAR} dies de salari per any treballat, amb un màxim de 24 mensualitats (${n(UNFAIR_CAP_DAYS)} dies); el temps treballat abans del 12 de febrer de 2012 es paga a ${UNFAIR_OLD_DAYS_PER_YEAR} dies per any (Estatut dels treballadors, art. 56.1 i disposició transitòria 11a). Els mesos solts es prorrategen. Amb ${salary} l'any i 5 anys, ${n(y5.unfair.days)} dies: ${m(y5.unfair.amount)}.`,
        },
        {
          q: "Quant em correspon per un acomiadament procedent?",
          a: `Depèn del tipus. En un acomiadament objectiu (o un ERO) declarat procedent, ${OBJECTIVE_DAYS_PER_YEAR} dies per any amb un màxim de 12 mensualitats (art. 53.1.b): amb ${salary} l'any i 5 anys, ${n(y5.objective.days)} dies, ${m(y5.objective.amount)}. En un acomiadament disciplinari procedent no hi ha indemnització: només la quitança.`,
        },
        {
          q: "Quant em correspon per fi de contracte temporal?",
          a: `La part proporcional de ${TEMPORARY_DAYS_PER_YEAR} dies de salari per any de servei (art. 49.1.c), excepte en els contractes formatius i en el de substitució. Amb ${salary} l'any, un contracte d'un any dona ${n(y1.temporary.days)} dies: ${m(y1.temporary.amount)}.`,
        },
        {
          q: "Quant és la indemnització per acomiadament amb 10 anys treballats?",
          a: `Amb ${salary} bruts l'any, ${m(y10.unfair.amount)} si l'acomiadament és improcedent (${n(y10.unfair.days)} dies) i ${m(y10.objective.amount)} si és objectiu o un ERO (${n(y10.objective.days)} dies). Per al teu salari i les teves dates exactes, fes servir la calculadora de dalt.`,
        },
      ],
    };
  }
  return {
    title: "Severance pay by years worked",
    intro: `On a gross salary of ${salary} a year (extra payments included; ${daily} a day), with the same function as the calculator. If you earn more or less, the amount moves in proportion: the days stay the same.`,
    caption: `Severance pay by years worked on ${salary} gross a year (service since 2012)`,
    cols: ["Years worked", `Unfair dismissal (${UNFAIR_DAYS_PER_YEAR} days a year)`, `Objective dismissal or ERE (${OBJECTIVE_DAYS_PER_YEAR} days a year)`],
    note: `Days of salary and gross amount. Unfair dismissal is capped at ${n(UNFAIR_CAP_DAYS)} days (24 months' pay) and objective dismissal at ${n(OBJECTIVE_CAP_DAYS)} (12 months' pay): objective dismissal reaches the cap after ${n(OBJECTIVE_CAP_DAYS / OBJECTIVE_DAYS_PER_YEAR)} years of service. If you started before 12 February 2012, see the section below.`,
    faq: [
      {
        q: "How many days per year do you get for unfair dismissal in Spain?",
        a: `${UNFAIR_DAYS_PER_YEAR} days' salary per year worked, capped at 24 months' pay (${n(UNFAIR_CAP_DAYS)} days); service before 12 February 2012 is paid at ${UNFAIR_OLD_DAYS_PER_YEAR} days a year (Workers' Statute, art. 56.1 and transitional provision 11). Part years are prorated by months. On ${salary} a year with 5 years, ${n(y5.unfair.days)} days: ${m(y5.unfair.amount)}.`,
      },
      {
        q: "How much do I get for a fair (procedente) dismissal?",
        a: `It depends on the type. An objective dismissal (or ERE) found fair pays ${OBJECTIVE_DAYS_PER_YEAR} days a year, capped at 12 months' pay (art. 53.1.b): on ${salary} a year with 5 years, ${n(y5.objective.days)} days, ${m(y5.objective.amount)}. A fair disciplinary dismissal pays no severance: only the final settlement.`,
      },
      {
        q: "How much do I get when a fixed-term contract ends?",
        a: `The proportional part of ${TEMPORARY_DAYS_PER_YEAR} days' salary per year of service (art. 49.1.c), except for training contracts and replacement (sustitución) contracts. On ${salary} a year, a one-year contract gives ${n(y1.temporary.days)} days: ${m(y1.temporary.amount)}.`,
      },
      {
        q: "How much severance pay after 10 years of work?",
        a: `On ${salary} gross a year, ${m(y10.unfair.amount)} if the dismissal is unfair (${n(y10.unfair.days)} days) and ${m(y10.objective.amount)} if it is objective or an ERE (${n(y10.objective.days)} days). For your own salary and dates, use the calculator above.`,
      },
    ],
  };
}
