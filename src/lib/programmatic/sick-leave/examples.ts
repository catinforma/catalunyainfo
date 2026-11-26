import { money, percent, type SlLocale } from "./copy";
import { DEFAULT_INPUT, calculateSickLeave, type Contingency } from "./engine";
import { PCT, REFORM_FROM } from "./rules";

/**
 * "Cuánto se cobra de baja según tu base" (26 Nov 2026): worked examples for
 * the sick-leave page, every amount from `calculateSickLeave`, the function the
 * calculator runs, for a baja starting on REFORM_FROM (1 Dec 2026, the rules
 * of RDL 31/2026) with no convenio top-up. Queries it answers (GSC, 28 days to
 * 25 Nov, es): "cuanto se cobra de baja" 42 at 65.2, "cuanto se cobra estando
 * de baja" 12 at 77.7, "salario baja laboral" 12 at 76.0, "calculadora salario
 * estando de baja" 7 at 63.3, "cuanto se cobra de baja por enfermedad comun" 5
 * at 63.4. Pure; client-safe.
 *
 * Catalonia: who issues and follows the baja, from the Generalitat's Canal
 * Salut pages, curled and grepped on 26 Nov 2026 (quotes in CATALONIA.quote*):
 *  - ".../baixa-medica/comunicat/": «Generalment, el comunicat de baixa el fa el
 *    metge o metgessa del sistema públic de salut sempre després d'una
 *    valoració mèdica.» and, since 1 Apr 2023, «els treballadors deixen de tenir
 *    l'obligació de presentar els comunicats mèdics de baixa, confirmació i alta
 *    mèdica a la seva empresa.»
 *  - ".../baixa-medica/seguiment/": «De manera general, el seguiment de la baixa
 *    correspon al metge o metgessa de capçalera del CAP», «En cas
 *    d'incompareixença no justificada, el metge o la metgessa pot emetre l'alta»,
 *    and the control reviews «per part de la Mútua Col·laboradora amb la
 *    Seguretat Social o l'SGAM».
 */

/** Monthly contribution bases of the table (common contingencies). */
export const EXAMPLE_BASES = [1200, 1500, 1800, 2000, 2500, 3000] as const;
/** The base of the "si cobro 1.500" answer. */
export const ANSWER_BASE = 1500;

const run = (contingency: Contingency, base: number, days: number) =>
  calculateSickLeave({ ...DEFAULT_INPUT, contingency, base, days, start: REFORM_FROM, complementPct: 0 });

export interface BaseRow {
  base: number;
  /** Common illness, first 30 days (days 1-3 unpaid, 4-20 at 60 %, 21-30 at 75 %). */
  firstMonth: number;
  /** Common illness, days 31 to 60: a whole month at 75 %. */
  nextMonth: number;
  /** Work accident, first 30 days: the benefit of days 2-30 (day 1 is full salary, paid by the employer). */
  accidentMonth: number;
  /** firstMonth as a share of the base, in %. */
  firstShare: number;
}

export function baseRows(): BaseRow[] {
  return EXAMPLE_BASES.map((base) => {
    const first = run("common", base, 30).totals.total;
    const two = run("common", base, 60).totals.total;
    return {
      base,
      firstMonth: first,
      nextMonth: Math.round((two - first) * 100) / 100,
      accidentMonth: run("professional", base, 30).totals.total,
      firstShare: Math.round((first / base) * 1000) / 10,
    };
  });
}

/** Canal Salut (Generalitat de Catalunya), read 26 Nov 2026. */
export const CATALONIA = {
  read: "2026-11-26",
  notice: "https://canalsalut.gencat.cat/ca/salut-a-z/a/avaluacions-mediques/baixa-medica/comunicat/",
  followUp: "https://canalsalut.gencat.cat/ca/salut-a-z/a/avaluacions-mediques/baixa-medica/seguiment/",
  quoteNotice: "Generalment, el comunicat de baixa el fa el metge o metgessa del sistema públic de salut sempre després d’una valoració mèdica.",
  quoteNoPaper: "els treballadors deixen de tenir l'obligació de presentar els comunicats mèdics de baixa, confirmació i alta mèdica a la seva empresa.",
  quoteFollowUp: "De manera general, el seguiment de la baixa correspon al metge o metgessa de capçalera del CAP",
  quoteNoShow: "En cas d’incompareixença no justificada, el metge o la metgessa pot emetre l’alta",
} as const;

export interface SickExampleCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string, string];
  note: string;
  catTitle: string;
  cat: string;
  catSources: [string, string];
  faq: { q: string; a: string }[];
}

export function sickExampleCopy(locale: SlLocale): SickExampleCopy {
  const rows = baseRows();
  const r = rows.find((x) => x.base === ANSWER_BASE)!;
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const share = percent(r.firstShare, locale, Number.isInteger(r.firstShare) ? 0 : 1);
  const p60 = percent(PCT.early, locale, 0);
  const p75 = percent(PCT.standard, locale, 0);
  if (locale === "es") {
    return {
      title: "Cuánto se cobra de baja según tu base de cotización: ejemplos",
      intro: `Calculado con la misma función que la calculadora, para una baja que empieza el 1 de diciembre de 2026 y sin complemento del convenio. La base es la de cotización por contingencias comunes de tu nómina (con un sueldo fijo, aproximadamente tu bruto anual entre 12). El primer mes de una baja por enfermedad común cobras alrededor del ${share} de tu base (los días 1 a 3 no se pagan y del 4 al 20 es el ${p60}); desde el día 21, el ${p75}.`,
      caption: "Prestación bruta por incapacidad temporal según la base mensual (baja desde el 1 de diciembre de 2026)",
      cols: ["Base de cotización al mes", "Enfermedad común: primer mes (30 días)", `Enfermedad común: cada mes siguiente (${p75})`, "Accidente de trabajo: primer mes"],
      note: `Importes brutos, antes de la retención de IRPF y de tu cotización. En el accidente de trabajo, el día de la baja la empresa paga el salario íntegro (no está en la columna). Tu convenio puede completar la prestación hasta el 100 %.`,
      catTitle: "En Cataluña: quién da la baja y quién la sigue",
      cat: "En Cataluña la baja por enfermedad común la da, en general, el médico o la médica del sistema público de salud (el CAP) después de valorarte, y el seguimiento lo hace tu médico de cabecera, que te cita a visitas de control. Ir a esas visitas es obligatorio: si faltas sin justificarlo, te pueden dar el alta y dejas de cobrar la prestación. Desde el 1 de abril de 2023 no tienes que llevar los partes de baja, confirmación ni alta a la empresa. En un accidente de trabajo, la baja y el seguimiento son de la mutua. Lo que cobras es lo mismo que en el resto de España: lo fija la Ley General de la Seguridad Social.",
      catSources: ["Canal Salut: el comunicat de baixa", "Canal Salut: seguiment de la baixa"],
      faq: [
        {
          q: "¿Cuánto se cobra de baja si cobro 1.500 € al mes?",
          a: `Con una base de cotización de ${m(ANSWER_BASE, 0)} al mes y una baja por enfermedad común, ${m(r.firstMonth)} brutos el primer mes (30 días) y ${m(r.nextMonth)} cada mes completo desde el día 21. Por un accidente de trabajo, ${m(r.accidentMonth)} el primer mes más el salario del día del accidente.`,
        },
        {
          q: "¿Cuánto se cobra estando de baja el primer mes?",
          a: `En enfermedad común, alrededor del ${share} de tu base de cotización: nada los días 1 a 3, el ${p60} del día 4 al 20 y el ${p75} del 21 al 30. Desde el segundo mes, el ${p75} de la base. Ejemplos por base en la tabla de arriba.`,
        },
        {
          q: "¿Quién da la baja en Cataluña y qué pasa si no voy a la revisión?",
          a: "El médico o la médica del sistema público de salud (tu CAP), que también la sigue con visitas de control; en un accidente de trabajo, la mutua. Ir a las visitas es obligatorio: si no vas sin justificarlo, te pueden dar el alta y dejas de cobrar la prestación (Canal Salut, Generalitat de Catalunya).",
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant es cobra de baixa segons la teva base de cotització: exemples",
      intro: `Calculat amb la mateixa funció que la calculadora, per a una baixa que comença l'1 de desembre de 2026 i sense complement del conveni. La base és la de cotització per contingències comunes de la teva nòmina (amb un sou fix, aproximadament el teu brut anual entre 12). El primer mes d'una baixa per malaltia comuna cobres al voltant del ${share} de la teva base (els dies 1 a 3 no es paguen i del 4 al 20 és el ${p60}); des del dia 21, el ${p75}.`,
      caption: "Prestació bruta per incapacitat temporal segons la base mensual (baixa des de l'1 de desembre de 2026)",
      cols: ["Base de cotització al mes", "Malaltia comuna: primer mes (30 dies)", `Malaltia comuna: cada mes següent (${p75})`, "Accident de treball: primer mes"],
      note: "Imports bruts, abans de la retenció d'IRPF i de la teva cotització. En l'accident de treball, el dia de la baixa l'empresa paga el salari íntegre (no és a la columna). El teu conveni pot completar la prestació fins al 100 %.",
      catTitle: "A Catalunya: qui dona la baixa i qui la segueix",
      cat: "A Catalunya la baixa per malaltia comuna la dona, en general, el metge o la metgessa del sistema públic de salut (el CAP) després de valorar-te, i el seguiment el fa el teu metge de capçalera, que et cita a visites de control. Anar a aquestes visites és obligatori: si hi faltes sense justificar-ho, et poden donar l'alta i deixes de cobrar la prestació. Des de l'1 d'abril de 2023 no has de portar els comunicats de baixa, confirmació ni alta a l'empresa. En un accident de treball, la baixa i el seguiment són de la mútua. El que cobres és el mateix que a la resta d'Espanya: ho fixa la Llei general de la Seguretat Social.",
      catSources: ["Canal Salut: el comunicat de baixa", "Canal Salut: seguiment de la baixa"],
      faq: [
        {
          q: "Quant es cobra de baixa si cobro 1.500 € al mes?",
          a: `Amb una base de cotització de ${m(ANSWER_BASE, 0)} al mes i una baixa per malaltia comuna, ${m(r.firstMonth)} bruts el primer mes (30 dies) i ${m(r.nextMonth)} cada mes complet des del dia 21. Per un accident de treball, ${m(r.accidentMonth)} el primer mes més el salari del dia de l'accident.`,
        },
        {
          q: "Quant es cobra estant de baixa el primer mes?",
          a: `En malaltia comuna, al voltant del ${share} de la teva base de cotització: res els dies 1 a 3, el ${p60} del dia 4 al 20 i el ${p75} del 21 al 30. Des del segon mes, el ${p75} de la base. Exemples per base a la taula de dalt.`,
        },
        {
          q: "Qui dona la baixa a Catalunya i què passa si no vaig a la revisió?",
          a: "El metge o la metgessa del sistema públic de salut (el teu CAP), que també la segueix amb visites de control; en un accident de treball, la mútua. Anar a les visites és obligatori: si no hi vas sense justificar-ho, et poden donar l'alta i deixes de cobrar la prestació (Canal Salut, Generalitat de Catalunya).",
        },
      ],
    };
  }
  return {
    title: "How much sick pay you get by contribution base: examples",
    intro: `Worked out with the same function as the calculator, for sick leave starting on 1 December 2026 with no top-up from your agreement. The base is the common-contingencies contribution base on your payslip (on a fixed salary, roughly your gross annual pay divided by 12). In the first month of sick leave for an ordinary illness you get about ${share} of your base (days 1 to 3 are unpaid and days 4 to 20 are at ${p60}); from day 21, ${p75}.`,
    caption: "Gross sick pay (incapacidad temporal) by monthly base (leave from 1 December 2026)",
    cols: ["Monthly contribution base", "Ordinary illness: first month (30 days)", `Ordinary illness: each following month (${p75})`, "Work accident: first month"],
    note: "Gross amounts, before income-tax withholding and your own contributions. For a work accident, the employer pays your full salary for the day of the accident (not in the column). Your collective agreement can top the benefit up to 100%.",
    catTitle: "In Catalonia: who signs you off and who follows up",
    cat: "In Catalonia, sick leave for an ordinary illness is generally issued by a doctor of the public health system (your CAP, the local health centre) after examining you, and your GP follows it up with check-up appointments. Going to them is compulsory: if you miss one without a reason, you can be signed back to work and the benefit stops. Since 1 April 2023 you no longer have to take the sick notes to your employer. For a work accident, the mutua issues and follows the leave. What you are paid is the same as anywhere in Spain: it is set by the General Social Security Act.",
    catSources: ["Canal Salut: the sick note (in Catalan)", "Canal Salut: follow-up of sick leave (in Catalan)"],
    faq: [
      {
        q: "How much sick pay do I get on €1,500 a month in Spain?",
        a: `On a contribution base of ${m(ANSWER_BASE, 0)} a month and sick leave for an ordinary illness, ${m(r.firstMonth)} gross for the first month (30 days) and ${m(r.nextMonth)} for each whole month from day 21. For a work accident, ${m(r.accidentMonth)} for the first month plus your salary for the day of the accident.`,
      },
      {
        q: "How much do you get in the first month of sick leave?",
        a: `For an ordinary illness, about ${share} of your contribution base: nothing for days 1 to 3, ${p60} from day 4 to 20 and ${p75} from day 21 to 30. From the second month, ${p75} of the base. Examples by base in the table above.`,
      },
      {
        q: "Who signs you off in Catalonia, and what if you miss a check-up?",
        a: "A doctor of the public health system (your CAP), who also follows it up with check-ups; for a work accident, the mutua. The check-ups are compulsory: if you miss one without a reason, you can be signed back to work and the benefit stops (Canal Salut, Government of Catalonia).",
      },
    ],
  };
}
