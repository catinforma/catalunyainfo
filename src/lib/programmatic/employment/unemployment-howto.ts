import type { CalcLocale } from "@/lib/programmatic/calculators/paths";

import { dateWords, money, num, pct } from "./paths";
import { BENEFIT_SS_RATE, SOURCE } from "./rules";
import { benefitLimits, unemploymentBenefit, type BenefitPhase, type UnemploymentResult } from "./unemployment";

/**
 * "How is the paro calculated?": the three steps (base reguladora, 70 % /
 * 60 %, minimum and maximum) with a table of worked bases and the answer to
 * "si cobro 1.200, ¿cuánto me queda de paro?". Every figure is
 * unemploymentBenefit() (the calculator's own function) on the 2026 rules, so
 * the text can never drift from the calculator; tests/employment-calculators
 * .test.ts pins the numbers and checks the SEPE quotes against the text read
 * on SEPE_READ. Pure.
 */

const L = <T>(locale: CalcLocale, v: Record<CalcLocale, T>): T => v[locale];

/** The day the SEPE texts below were read with curl (tests/fixtures/sepe-paro-20261124.txt is that text). */
export const SEPE_READ = "2026-11-24";
/** The quotes and limits are 2026's: a test fails from this day until the SEPE pages are read again (the IPREM and caps guard, RULES_VALID_UNTIL, already fails on 1 Jan). */
export const SEPE_REREAD_BY = "2027-01-15";

/** SEPE, "Prestación contributiva", section Cuantía, verbatim. */
export const SEPE_QUOTE = {
  rate: "La base reguladora de la prestación es la media de la base de cotización del periodo indicado. El importe diario que se percibe es el 70 % de la base reguladora durante los primeros 180 días de prestación y el 60 % a partir del día 181 hasta el final de la misma.",
  limits: "Los importes así calculados no pueden ser superiores al tope máximo, ni inferiores al tope mínimo, legalmente establecidos.",
} as const;

/** The BOE, verbatim (LGSS consolidated text and Orden PJC/297/2026, read on SEPE_READ; tests/fixtures/boe-paro-lgss270-273-orden-art8-20261124.txt). */
export const BOE_QUOTE = {
  /** LGSS art. 270.3: the minimum and maximum follow the hours worked. */
  partTime: "calculado en función del promedio de las horas trabajadas durante el período de los últimos 180 días",
  /** LGSS art. 273.1: who pays the contribution while on benefit. */
  contribution: "asumiendo la aportación empresarial y descontando de la cuantía de la prestación, incluidos los supuestos a que hace referencia el artículo 270.3, la aportación que corresponda al trabajador",
  /** Orden PJC/297/2026 art. 8.1: the contribution base. */
  base: "será la base reguladora de la prestación por desempleo",
} as const;
/** SEPE, "Cuantías anuales" (2026), verbatim. */
export const SEPE_SS_QUOTE = "Cotización a la Seguridad Social: 4,85 %";

/** The table: 1.500 days contributed (480 days of benefit), no children, four monthly bases. */
export const HOWTO_DAYS = 1500;
export const HOWTO_BASES = [700, 1200, 1800, 3000] as const;
/** The base of the query "si cobro 1200 cuánto me queda de paro". */
export const HOWTO_ASKED_BASE = 1200;

export interface HowToRow {
  base: number;
  result: UnemploymentResult;
  first: BenefitPhase;
  after: BenefitPhase;
}

export function howToRows(): HowToRow[] {
  return HOWTO_BASES.map((base) => {
    const result = unemploymentBenefit({ contributedDays: HOWTO_DAYS, monthlyBase: base, children: 0 });
    const [first, after] = result.phases;
    if (!first || !after) throw new Error(`paro how-to: base ${base} gives no two phases`);
    return { base, result, first, after };
  });
}

export interface UnemploymentHowTo {
  heading: string;
  steps: string[];
  quotes: readonly string[];
  /** The answer to "si cobro 1.200…". */
  asked: string;
  caption: string;
  cols: string[];
  /** The table's rows, formatted. */
  rows: string[][];
  note: string;
  source: string;
}

export function unemploymentHowTo(locale: CalcLocale): UnemploymentHowTo {
  const m = (x: number) => money(x, locale);
  const rows = howToRows();
  const lim = ([0, 1, 2] as const).map((c) => benefitLimits(c));
  const word = L(locale, { es: { min: "mínimo", max: "máximo" }, ca: { min: "mínim", max: "màxim" }, en: { min: "minimum", max: "maximum" } });
  const cell = (p: BenefitPhase) => (p.limit ? `${m(p.monthly)} (${word[p.limit]})` : m(p.monthly));
  const ss = pct(BENEFIT_SS_RATE, locale);
  const asked = rows.find((r) => r.base === HOWTO_ASKED_BASE)!;
  if (asked.first.limit || asked.after.limit) throw new Error("paro how-to: the asked base must sit inside the limits");
  const ssAsked = asked.result.ssMonthly;
  const long = rows[0]!.result;
  const half = benefitLimits(0, 50);

  return {
    heading: L(locale, {
      es: "¿Cómo se calcula el paro? Base reguladora, 70 % y 60 %",
      ca: "Com es calcula l'atur? Base reguladora, 70 % i 60 %",
      en: "How is unemployment benefit calculated? Base reguladora, 70% and 60%",
    }),
    steps: L(locale, {
      es: [
        "Base reguladora: la media de tus bases de cotización por contingencias profesionales de los últimos 180 días cotizados, sin horas extra (art. 270.1). Con nóminas parecidas, es la base mensual de tu nómina; al día, se divide entre 30.",
        "Porcentaje: el 70 % de la base reguladora los primeros 180 días de paro y el 60 % desde el día 181 (art. 270.2).",
        `Límites: el resultado no baja del mínimo ni sube del máximo de tu situación familiar: ${m(lim[0]!.min)} y ${m(lim[0]!.max)} al mes sin hijos a cargo; ${m(lim[1]!.min)} y ${m(lim[1]!.max)} con un hijo; ${m(lim[2]!.min)} y ${m(lim[2]!.max)} con dos o más (art. 270.3; SEPE, «Cuantías anuales», 2026). A tiempo parcial el mismo artículo toma el indicador «${BOE_QUOTE.partTime}», así que mínimo y máximo se reducen con las horas: a media jornada y sin hijos, ${m(half.min)} y ${m(half.max)}.`,
      ],
      ca: [
        "Base reguladora: la mitjana de les teves bases de cotització per contingències professionals dels últims 180 dies cotitzats, sense hores extra (art. 270.1). Amb nòmines semblants, és la base mensual de la teva nòmina; al dia, es divideix entre 30.",
        "Percentatge: el 70 % de la base reguladora els primers 180 dies d'atur i el 60 % des del dia 181 (art. 270.2).",
        `Límits: el resultat no baixa del mínim ni puja del màxim de la teva situació familiar: ${m(lim[0]!.min)} i ${m(lim[0]!.max)} al mes sense fills a càrrec; ${m(lim[1]!.min)} i ${m(lim[1]!.max)} amb un fill; ${m(lim[2]!.min)} i ${m(lim[2]!.max)} amb dos o més (art. 270.3; SEPE, «Cuantías anuales», 2026). A temps parcial el mateix article pren l'indicador «${BOE_QUOTE.partTime}» (text oficial en castellà), de manera que mínim i màxim es redueixen amb les hores: a mitja jornada i sense fills, ${m(half.min)} i ${m(half.max)}.`,
      ],
      en: [
        "Base reguladora: the average of your contribution bases for occupational contingencies over the last 180 days contributed, overtime excluded (art. 270.1). With similar payslips it is your payslip's monthly base; per day, divide by 30.",
        "Percentage: 70% of the base reguladora for the first 180 days of benefit and 60% from day 181 (art. 270.2).",
        `Limits: the result never falls below the minimum or rises above the maximum for your family situation: ${m(lim[0]!.min)} and ${m(lim[0]!.max)} a month with no children in care; ${m(lim[1]!.min)} and ${m(lim[1]!.max)} with one; ${m(lim[2]!.min)} and ${m(lim[2]!.max)} with two or more (art. 270.3; SEPE, "Cuantías anuales", 2026). For part-time work the same article takes the indicator “${BOE_QUOTE.partTime}” (official text in Spanish), so the minimum and maximum shrink with the hours: at half time and no children, ${m(half.min)} and ${m(half.max)}.`,
      ],
    }),
    quotes: [SEPE_QUOTE.rate, SEPE_QUOTE.limits],
    asked: L(locale, {
      es: `Si tu base reguladora es de ${m(asked.base)} al mes: ${m(asked.base)} × 70 % = ${m(asked.first.monthly)} al mes los primeros 180 días y ${m(asked.base)} × 60 % = ${m(asked.after.monthly)} desde el día 181, los dos dentro de los límites. Mientras cobras, el SEPE ingresa las cotizaciones, «${BOE_QUOTE.contribution}» (LGSS, art. 273.1); la base de cotización «${BOE_QUOTE.base}» (Orden PJC/297/2026, art. 8.1) y el SEPE publica «${SEPE_SS_QUOTE}». Con ese ${ss}: ${m(asked.base)} × ${ss} = ${m(ssAsked)} al mes, así que te quedan ${m(asked.first.monthly - ssAsked)} y ${m(asked.after.monthly - ssAsked)}, antes de la retención de IRPF si te corresponde. La base no es tu sueldo neto: es la base de contingencias profesionales de tu nómina.`,
      ca: `Si la teva base reguladora és de ${m(asked.base)} al mes: ${m(asked.base)} × 70 % = ${m(asked.first.monthly)} al mes els primers 180 dies i ${m(asked.base)} × 60 % = ${m(asked.after.monthly)} des del dia 181, tots dos dins dels límits. Mentre cobres, el SEPE ingressa les cotitzacions, «${BOE_QUOTE.contribution}» (LGSS, art. 273.1); la base de cotització «${BOE_QUOTE.base}» (Orden PJC/297/2026, art. 8.1) i el SEPE publica «${SEPE_SS_QUOTE}» (text oficial en castellà). Amb aquest ${ss}: ${m(asked.base)} × ${ss} = ${m(ssAsked)} al mes, així que et queden ${m(asked.first.monthly - ssAsked)} i ${m(asked.after.monthly - ssAsked)}, abans de la retenció d'IRPF si et correspon. La base no és el teu sou net: és la base de contingències professionals de la teva nòmina.`,
      en: `If your base reguladora is ${m(asked.base)} a month: ${m(asked.base)} × 70% = ${m(asked.first.monthly)} a month for the first 180 days and ${m(asked.base)} × 60% = ${m(asked.after.monthly)} from day 181, both within the limits. While you receive it, SEPE pays in the contributions, “${BOE_QUOTE.contribution}” (LGSS, art. 273.1); the contribution base “${BOE_QUOTE.base}” (Orden PJC/297/2026, art. 8.1) and SEPE publishes “${SEPE_SS_QUOTE}” (official text in Spanish). At that ${ss}: ${m(asked.base)} × ${ss} = ${m(ssAsked)} a month, so you are left with ${m(asked.first.monthly - ssAsked)} and ${m(asked.after.monthly - ssAsked)}, before income tax withholding if it applies. The base is not your net pay: it is the occupational-contingencies base on your payslip.`,
    }),
    caption: L(locale, {
      es: `Con ${num(HOWTO_DAYS, "es")} días cotizados (${long.durationDays} días de paro: ${rows[0]!.first.days} al 70 % y ${rows[0]!.after.days} al 60 %) y sin hijos a cargo, con los límites de 2026.`,
      ca: `Amb ${num(HOWTO_DAYS, "ca")} dies cotitzats (${long.durationDays} dies d'atur: ${rows[0]!.first.days} al 70 % i ${rows[0]!.after.days} al 60 %) i sense fills a càrrec, amb els límits del 2026.`,
      en: `With ${num(HOWTO_DAYS, "en")} days contributed (${long.durationDays} days of benefit: ${rows[0]!.first.days} at 70% and ${rows[0]!.after.days} at 60%) and no children in care, with the 2026 limits.`,
    }),
    cols: L(locale, {
      es: ["Base reguladora al mes", "Días 1 a 180 (70 %)", "Desde el día 181 (60 %)", `Seguridad Social (${ss})`],
      ca: ["Base reguladora al mes", "Dies 1 a 180 (70 %)", "Des del dia 181 (60 %)", `Seguretat Social (${ss})`],
      en: ["Base reguladora a month", "Days 1 to 180 (70%)", "From day 181 (60%)", `Social Security (${ss})`],
    }),
    rows: rows.map((r) => [m(r.base), cell(r.first), cell(r.after), m(r.result.ssMonthly)]),
    note: L(locale, {
      es: "Importes brutos al mes (mensualidades de 30 días), antes del IRPF. «Mínimo» y «máximo» indican que el 70 % o el 60 % se quedaba fuera de los límites. El SEPE descuenta de la prestación la aportación del trabajador a la Seguridad Social (LGSS, art. 273.1).",
      ca: "Imports bruts al mes (mensualitats de 30 dies), abans de l'IRPF. «Mínim» i «màxim» indiquen que el 70 % o el 60 % quedava fora dels límits. El SEPE descompta de la prestació l'aportació del treballador a la Seguretat Social (LGSS, art. 273.1).",
      en: "Gross amounts a month (30-day months), before income tax. “Minimum” and “maximum” mean the 70% or 60% fell outside the limits. SEPE deducts the worker's Social Security contribution from the benefit (LGSS art. 273.1).",
    }),
    source: L(locale, {
      es: `Fuente: SEPE, «Prestación contributiva» y «Cuantías anuales», leídas el ${dateWords(SEPE_READ, locale)}; LGSS arts. 270 y 273 y Orden PJC/297/2026 art. 8 (BOE), leídos el mismo día. El cálculo es el de la calculadora de arriba.`,
      ca: `Font: SEPE, «Prestación contributiva» i «Cuantías anuales», llegides el ${dateWords(SEPE_READ, locale)}; LGSS arts. 270 i 273 i Orden PJC/297/2026 art. 8 (BOE), llegits el mateix dia. El càlcul és el de la calculadora de dalt.`,
      en: `Source: SEPE, "Prestación contributiva" and "Cuantías anuales", read on ${dateWords(SEPE_READ, locale)}; LGSS arts. 270 and 273 and Orden PJC/297/2026 art. 8 (BOE), read the same day. The calculation is the calculator above's.`,
    }),
  };
}

/** The two SEPE pages the section cites. */
export const HOWTO_LINKS = { contributory: SOURCE.sepeContributory, amounts: SOURCE.sepeAmounts, lgss270: SOURCE.lgssArt270 } as const;
