import type { CalcLocale } from "@/lib/programmatic/calculators/paths";

import { money, num, pct } from "./paths";
import { BENEFIT_MONTH_DAYS, BENEFIT_SS_RATE, DURATION_SCALE, FIRST_PERIOD_DAYS, MIN_CONTRIBUTED_DAYS, RATE_AFTER, RATE_FIRST } from "./rules";
import { benefitDays, benefitLimits, unemploymentBenefit } from "./unemployment";

/**
 * "Cuánto paro cobras": worked examples for the unemployment calculator page
 * (25 Nov 2026). Every number comes from `unemploymentBenefit`, the function the
 * calculator runs, with the 2026 limits of LGSS art. 270.3 (no children, full
 * time). The queries it answers (GSC, 90 days to 24 Nov): "cuantía diaria inicial paro", "cuánto paro me corresponde
 * por 6 meses trabajados", "cuanto paro me corresponde por 3 años trabajados",
 * "calcular prestación por desempleo". The monthly amount by base and the "si cobro
 * 1200" answer are in the how-it-is-calculated section (unemployment-howto.ts).
 *
 * "Paid the following month": RD 625/1985 art. 26.1, re-read on boe.es/eli/es/rd/1985/04/02/625/con
 * on 25 Nov 2026: «El abono de la prestación o subsidio por desempleo se realizará por mensualidades
 * de treinta días, dentro del mes inmediato siguiente al que corresponda el devengo».
 *
 * The bases are the monthly contribution base for unemployment (the payslip's
 * base de contingencias profesionales), not the net salary. Pure; client-safe.
 */

/** Days contributed of the table: 1, 2, 3, 4 and 6 years (the art. 269.1 steps), on a 1.200 € and a 1.800 € base. */
export const EXAMPLE_DAYS = [360, 720, 1080, 1440, 2160] as const;
export const EXAMPLE_TABLE2_BASES = [1200, 1800] as const;
/** The base of the "daily amount" example. */
export const DAILY_EXAMPLE_BASE = 1500;
/** What the rule says about six months of work: 6 × 30 days. */
export const SIX_MONTHS_DAYS = 180;

export interface DaysRow {
  days: number;
  benefitDays: number;
  months: number;
  totals: number[];
}

export function daysRows(): DaysRow[] {
  return EXAMPLE_DAYS.map((days) => ({
    days,
    benefitDays: benefitDays(days),
    months: benefitDays(days) / BENEFIT_MONTH_DAYS,
    totals: EXAMPLE_TABLE2_BASES.map((base) => unemploymentBenefit({ contributedDays: days, monthlyBase: base, children: 0 }).total),
  }));
}

export interface ExampleFigures {
  limits: { min: number; max: number };
  daily: { baseDaily: number; firstDaily: number; afterDaily: number };
  minDays: number;
  oneYear: { benefitDays: number; months: number };
  threeYears: { benefitDays: number };
}

export function exampleFigures(): ExampleFigures {
  const d = unemploymentBenefit({ contributedDays: 1500, monthlyBase: DAILY_EXAMPLE_BASE, children: 0 });
  const cents = (x: number) => Math.round(x * 100) / 100;
  return {
    limits: benefitLimits(0),
    daily: { baseDaily: d.baseDaily, firstDaily: cents(d.phases[0]!.monthly / BENEFIT_MONTH_DAYS), afterDaily: cents(d.phases[1]!.monthly / BENEFIT_MONTH_DAYS) },
    minDays: MIN_CONTRIBUTED_DAYS,
    oneYear: { benefitDays: benefitDays(360), months: benefitDays(360) / BENEFIT_MONTH_DAYS },
    threeYears: { benefitDays: benefitDays(1080) },
  };
}

export interface ExampleCopy {
  title: string;
  intro: string;
  daysCaption: string;
  daysCols: [string, string, string, string, string];
  daysNote: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
}

/** The section's words in the page's three languages; figures come from `exampleFigures`, `daysRows`. */
export function exampleCopy(locale: CalcLocale): ExampleCopy {
  const f = exampleFigures();
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale, 0);
  const P = (x: number) => pct(x, locale);
  const first = P(RATE_FIRST);
  const after = P(RATE_AFTER);
  const ss = P(BENEFIT_SS_RATE);
  const dailyDays = FIRST_PERIOD_DAYS;
  const monthsOf = (x: number) => num(x, locale, 0);
  if (locale === "es") {
    return {
      title: "Cuánto paro cobras en total según los días cotizados",
      intro: `Importe mensual por base: ver «¿Cómo se calcula el paro?», arriba. Aquí, el total que suma la prestación entera según los días cotizados (escala del art. 269.1), calculado con la misma función que la calculadora, sin hijos a cargo y con los límites de 2026 (mínimo ${m(f.limits.min)}, máximo ${m(f.limits.max)} al mes). La «base» es la base de cotización por desempleo de tu nómina (la de contingencias profesionales), no tu sueldo neto.`,
      daysCaption: "Total del paro según los días cotizados (sin hijos a cargo, 2026)",
      daysCols: ["Días cotizados", "Días de paro", "Meses", `Total con base de ${m(EXAMPLE_TABLE2_BASES[0])}`, `Total con base de ${m(EXAMPLE_TABLE2_BASES[1])}`],
      daysNote: "Total bruto antes de IRPF y de la cuota de la Seguridad Social: suma de los primeros 180 días al 70 % y el resto al 60 %.",
      faqTitle: "Preguntas frecuentes sobre cuánto paro te corresponde",
      faq: [
        {
          q: "¿Cuánto paro me corresponde por 6 meses trabajados?",
          a: `Con solo 6 meses cotizados (unos ${n(SIX_MONTHS_DAYS)} días) en los últimos seis años no llegas a la prestación contributiva: hacen falta ${n(f.minDays)} días (LGSS, art. 269.1). Con ${n(360)} días (un año) cobras ${n(f.oneYear.benefitDays)} días de paro, ${monthsOf(f.oneYear.months)} meses. Si no llegas a los ${n(f.minDays)} días, comprueba si te corresponde el subsidio por desempleo.`,
        },
        {
          q: "¿Cuál es la cuantía diaria inicial del paro?",
          a: `El ${first} de la base reguladora diaria durante los primeros ${dailyDays} días (art. 270.2), entre el mínimo y el máximo de 2026. La base diaria es la suma de tus bases de los últimos 180 días dividida entre 180; con seis bases iguales, la base mensual entre ${BENEFIT_MONTH_DAYS}. Ejemplo: base de ${m(DAILY_EXAMPLE_BASE)} al mes, ${m(f.daily.baseDaily)} al día, ${m(f.daily.firstDaily)} al día los primeros ${dailyDays} días y ${m(f.daily.afterDaily)} después.`,
        },
        {
          q: "¿Cuánto paro cobro con 3 años trabajados?",
          a: `Con ${n(1080)} días cotizados (tres años) la escala del art. 269.1 da ${n(f.threeYears.benefitDays)} días de paro, ${monthsOf(f.threeYears.benefitDays / BENEFIT_MONTH_DAYS)} meses. El importe mensual depende de tu base, no de los años: mira la tabla de arriba.`,
        },
        {
          q: "¿Cuándo se cobra el paro?",
          a: `El SEPE paga el día 10 de cada mes, o el primer día hábil siguiente si es festivo. La prestación se abona por mensualidades de treinta días, dentro del mes inmediato siguiente al que corresponda el devengo (Real Decreto 625/1985, art. 26.1): cada pago llega, pues, al mes siguiente. Fechas mes a mes en la guía de días de pago.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant atur cobres en total segons els dies cotitzats",
      intro: `Import mensual per base: mira «Com es calcula l'atur?», a dalt. Aquí, el total que suma tota la prestació segons els dies cotitzats (escala de l'art. 269.1), calculat amb la mateixa funció que la calculadora, sense fills a càrrec i amb els límits del 2026 (mínim ${m(f.limits.min)}, màxim ${m(f.limits.max)} al mes). La «base» és la base de cotització per desocupació de la teva nòmina (la de contingències professionals), no el teu sou net.`,
      daysCaption: "Total de l'atur segons els dies cotitzats (sense fills a càrrec, 2026)",
      daysCols: ["Dies cotitzats", "Dies d'atur", "Mesos", `Total amb base de ${m(EXAMPLE_TABLE2_BASES[0])}`, `Total amb base de ${m(EXAMPLE_TABLE2_BASES[1])}`],
      daysNote: "Total brut abans d'IRPF i de la quota de la Seguretat Social: suma dels primers 180 dies al 70 % i la resta al 60 %.",
      faqTitle: "Preguntes freqüents sobre quant atur et correspon",
      faq: [
        {
          q: "Quant atur em correspon per 6 mesos treballats?",
          a: `Amb només 6 mesos cotitzats (uns ${n(SIX_MONTHS_DAYS)} dies) en els últims sis anys no arribes a la prestació contributiva: calen ${n(f.minDays)} dies (LGSS, art. 269.1). Amb ${n(360)} dies (un any) cobres ${n(f.oneYear.benefitDays)} dies d'atur, ${monthsOf(f.oneYear.months)} mesos. Si no arribes als ${n(f.minDays)} dies, comprova si et correspon el subsidi per desocupació.`,
        },
        {
          q: "Quina és la quantia diària inicial de l'atur?",
          a: `El ${first} de la base reguladora diària durant els primers ${dailyDays} dies (art. 270.2), entre el mínim i el màxim del 2026. La base diària és la suma de les teves bases dels últims 180 dies dividida entre 180; amb sis bases iguals, la base mensual entre ${BENEFIT_MONTH_DAYS}. Exemple: base de ${m(DAILY_EXAMPLE_BASE)} al mes, ${m(f.daily.baseDaily)} al dia, ${m(f.daily.firstDaily)} al dia els primers ${dailyDays} dies i ${m(f.daily.afterDaily)} després.`,
        },
        {
          q: "Quant atur cobro amb 3 anys treballats?",
          a: `Amb ${n(1080)} dies cotitzats (tres anys) l'escala de l'art. 269.1 dona ${n(f.threeYears.benefitDays)} dies d'atur, ${monthsOf(f.threeYears.benefitDays / BENEFIT_MONTH_DAYS)} mesos. L'import mensual depèn de la teva base, no dels anys: mira la taula de dalt.`,
        },
        {
          q: "Quan es cobra l'atur?",
          a: `El SEPE paga el dia 10 de cada mes, o el primer dia hàbil següent si és festiu. La prestació s'abona per mensualitats de trenta dies, dins del mes immediat següent al que correspongui la meritació (Reial decret 625/1985, art. 26.1): cada pagament arriba, doncs, al mes següent. Dates mes a mes a la guia de dies de pagament.`,
        },
      ],
    };
  }
  return {
    title: "How much unemployment benefit you get in total, by days contributed",
    intro: `Monthly amount by base: see "How is unemployment benefit calculated?", above. Here, the total of the whole benefit by days contributed (the art. 269.1 scale), worked out with the same function as the calculator, no children in your care and the 2026 limits (minimum ${m(f.limits.min)}, maximum ${m(f.limits.max)} a month). The "base" is the unemployment contribution base on your payslip (the one for occupational contingencies), not your net salary.`,
    daysCaption: "Total unemployment benefit by days contributed (no children in care, 2026)",
    daysCols: ["Days contributed", "Days of benefit", "Months", `Total on a ${m(EXAMPLE_TABLE2_BASES[0])} base`, `Total on a ${m(EXAMPLE_TABLE2_BASES[1])} base`],
    daysNote: "Gross total before income tax and Social Security: the first 180 days at 70% and the rest at 60%.",
    faqTitle: "Questions on how much unemployment benefit you get",
    faq: [
      {
        q: "How much unemployment benefit do I get after 6 months of work in Spain?",
        a: `With only 6 months contributed (about ${n(SIX_MONTHS_DAYS)} days) in the last six years you do not reach the contributory benefit: it takes ${n(f.minDays)} days (LGSS, art. 269.1). With ${n(360)} days (one year) you get ${n(f.oneYear.benefitDays)} days of benefit, ${monthsOf(f.oneYear.months)} months. Short of ${n(f.minDays)} days, check whether you qualify for the unemployment subsidy.`,
      },
      {
        q: "What is the daily amount of unemployment benefit at the start?",
        a: `${first} of the daily base reguladora for the first ${dailyDays} days (art. 270.2), between the 2026 minimum and maximum. The daily base is the sum of your bases over the last 180 days divided by 180; with six equal bases, the monthly base divided by ${BENEFIT_MONTH_DAYS}. Example: a base of ${m(DAILY_EXAMPLE_BASE)} a month is ${m(f.daily.baseDaily)} a day, ${m(f.daily.firstDaily)} a day for the first ${dailyDays} days and ${m(f.daily.afterDaily)} after.`,
      },
      {
        q: "How much unemployment benefit do I get after 3 years of work?",
        a: `With ${n(1080)} days contributed (three years) the art. 269.1 scale gives ${n(f.threeYears.benefitDays)} days of benefit, ${monthsOf(f.threeYears.benefitDays / BENEFIT_MONTH_DAYS)} months. The monthly amount depends on your base, not on the years: see the table above.`,
      },
      {
        q: "When is unemployment benefit paid in Spain?",
        a: `SEPE pays on the 10th of each month, or the next business day if it is a holiday. The benefit is paid in months of thirty days, within the month immediately following the one it accrues for (Royal Decree 625/1985, art. 26.1), so each payment arrives the month after. Month-by-month dates are in the payment-dates guide.`,
      },
    ],
  };
}

/** The duration scale is the one of the page (LGSS art. 269.1); this guards the 360 and 1,080 rows the copy quotes. */
export const SCALE_ROWS_USED = DURATION_SCALE.filter(([from]) => from === 360 || from === 1080);
