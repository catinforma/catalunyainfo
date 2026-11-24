import { bareDay, money, num, pct, type SmiLocale } from "./copy";
import { domesticFor, prorated12, smiFor } from "./engine";
import { SMI_HOWTO_READ, type SmiYear } from "./rules";

/**
 * "How is the SMI calculated?" (12 payments, part time, per hour): the
 * answer under the amounts table. Every number is the calculator's own
 * function (smiFor, domesticFor, prorated12) on the decree `y`, so the text
 * can never drift from the calculator; tests/smi-2027.test.ts pins the
 * figures. Pure.
 */

const L = <T>(locale: SmiLocale, v: Record<SmiLocale, T>): T => v[locale];

/** The part-time examples: [hours worked a week, the agreement's full-time week]. */
export const HOWTO_PART_TIME: readonly (readonly [number, number])[] = [
  [20, 40],
  [30, 37.5],
];
/** Hours a week of domestic work in the hourly example. */
export const HOWTO_DOMESTIC_HOURS = 10;

export interface SmiHowTo {
  heading: string;
  /** Art. 3.1: 14 payments make the year. */
  yearly: string;
  /** The same year in 12 payments. */
  twelve: string;
  /** The prorrata rule (art. 1), followed by its quote. */
  partTimeRule: string;
  examplesIntro: string;
  /** One line per example, every figure from smiFor(). */
  examples: string[];
  hourly: string;
  source: string;
}

/** "Real Decreto 1013/2026, BOE del 19 de noviembre de 2026". */
function normRef(y: Pick<SmiYear, "norm" | "published">, locale: SmiLocale): string {
  const short = y.norm.replace(/, de \d{1,2} de [a-záéíóú]+$/i, "");
  return L(locale, {
    es: `${short}, BOE del ${bareDay(y.published, "es")}`,
    ca: `${short}, BOE del ${bareDay(y.published, "ca")}`,
    en: `${short}, BOE of ${bareDay(y.published, "en")}`,
  });
}

export function smiHowTo(locale: SmiLocale, y: SmiYear): SmiHowTo {
  const m = (n: number) => money(n, locale);
  const hrs = (n: number) => num(n, Number.isInteger(n) ? 0 : 1, locale);
  const examples = HOWTO_PART_TIME.map(([h, full]) => {
    const p14 = smiFor(y, { weeklyHours: h, fullTimeHours: full, payments: 14 });
    const p12 = smiFor(y, { weeklyHours: h, fullTimeHours: full, payments: 12 });
    if (p14.status !== "ok" || p12.status !== "ok") throw new Error(`SMI how-to example ${h}/${full} is invalid`);
    const share = pct(p14.share * 100, 0, locale);
    return L(locale, {
      es: `${hrs(h)} horas a la semana con una jornada completa de ${hrs(full)} (${share}): ${m(p14.perPayment)} en cada una de las 14 pagas, ${m(p12.perPayment)} al mes en 12 pagas y ${m(p14.yearly)} al año.`,
      ca: `${hrs(h)} hores a la setmana amb una jornada completa de ${hrs(full)} (${share}): ${m(p14.perPayment)} a cadascuna de les 14 pagues, ${m(p12.perPayment)} al mes en 12 pagues i ${m(p14.yearly)} l'any.`,
      en: `${hrs(h)} hours a week with a full-time week of ${hrs(full)} (${share}): ${m(p14.perPayment)} in each of the 14 payments, ${m(p12.perPayment)} a month in 12 payments and ${m(p14.yearly)} a year.`,
    });
  });
  const dom = domesticFor(y, HOWTO_DOMESTIC_HOURS);
  if (!dom) throw new Error("SMI how-to domestic example is invalid");
  const n = y.year;
  const ref = normRef(y, locale);
  return {
    heading: L(locale, {
      es: `¿Cómo se calcula el SMI de ${n}? En 12 pagas, a media jornada y por hora`,
      ca: `Com es calcula l'SMI del ${n}? En 12 pagues, a mitja jornada i per hora`,
      en: `How is the ${n} SMI worked out? In 12 payments, part time and per hour`,
    }),
    yearly: L(locale, {
      es: `El decreto fija ${m(y.monthly)} al mes (art. 1; ${m(y.daily)} por día) y un mínimo anual de ${m(y.annual)} (art. 3.1). Es lo mismo que 14 pagas: ${m(y.monthly)} × 14 = ${m(y.annual)}.`,
      ca: `El decret fixa ${m(y.monthly)} al mes (art. 1; ${m(y.daily)} per dia) i un mínim anual de ${m(y.annual)} (art. 3.1). És el mateix que 14 pagues: ${m(y.monthly)} × 14 = ${m(y.annual)}.`,
      en: `The decree sets ${m(y.monthly)} a month (art. 1; ${m(y.daily)} a day) and a yearly minimum of ${m(y.annual)} (art. 3.1). That equals 14 payments: ${m(y.monthly)} × 14 = ${m(y.annual)}.`,
    }),
    twelve: L(locale, {
      es: `En 12 pagas (con las extras prorrateadas) se reparte ese mismo total entre 12 meses: ${m(y.annual)} ÷ 12 = ${m(prorated12(y))} al mes. Al año se cobra lo mismo, solo cambia cuándo.`,
      ca: `En 12 pagues (amb les extres prorratejades) es reparteix aquest mateix total entre 12 mesos: ${m(y.annual)} ÷ 12 = ${m(prorated12(y))} al mes. L'any es cobra el mateix, només canvia quan.`,
      en: `In 12 payments (extra pay spread over the year) the same total is split into 12 months: ${m(y.annual)} ÷ 12 = ${m(prorated12(y))} a month. You earn the same over the year; only the timing changes.`,
    }),
    partTimeRule: L(locale, {
      es: "Si trabajas menos horas que la jornada completa de tu convenio, se cobra a prorrata (art. 1):",
      ca: "Si treballes menys hores que la jornada completa del teu conveni, es cobra a prorrata (art. 1):",
      en: "If you work fewer hours than your agreement's full-time week, you are paid a prorrata (art. 1):",
    }),
    examplesIntro: L(locale, {
      es: `Es el importe de arriba por tus horas ÷ las horas de la jornada completa. Ejemplos con el SMI de ${n}, los mismos que da la calculadora de arriba:`,
      ca: `És l'import de dalt per les teves hores ÷ les hores de la jornada completa. Exemples amb l'SMI del ${n}, els mateixos que dona la calculadora de dalt:`,
      en: `It is the amount above times your hours ÷ the full-time hours. Examples with the ${n} SMI, the same as the calculator above gives:`,
    }),
    examples,
    hourly: L(locale, {
      es: `Por hora, el decreto solo fija un SMI para el empleo de hogar: ${m(y.domesticHourly)} por hora efectivamente trabajada (art. 4.2), que ya incluye pagas extra y vacaciones. ${hrs(HOWTO_DOMESTIC_HOURS)} horas a la semana son ${m(dom.weekly)} a la semana, unos ${m(dom.monthly)} al mes (52 semanas ÷ 12). Para el resto de trabajos no hay SMI por hora: vale la prorrata de arriba.`,
      ca: `Per hora, el decret només fixa un SMI per al treball de la llar: ${m(y.domesticHourly)} per hora efectivament treballada (art. 4.2), que ja inclou pagues extra i vacances. ${hrs(HOWTO_DOMESTIC_HOURS)} hores a la setmana són ${m(dom.weekly)} a la setmana, uns ${m(dom.monthly)} al mes (52 setmanes ÷ 12). Per a la resta de feines no hi ha SMI per hora: val la prorrata de dalt.`,
      en: `Per hour, the decree only sets an SMI for domestic work: ${m(y.domesticHourly)} per hour actually worked (art. 4.2), which already includes extra pay and holidays. ${hrs(HOWTO_DOMESTIC_HOURS)} hours a week are ${m(dom.weekly)} a week, about ${m(dom.monthly)} a month (52 weeks ÷ 12). For every other job there is no hourly SMI: the prorrata above applies.`,
    }),
    source: L(locale, {
      es: `Fuente: ${ref}, texto leído en el BOE el ${bareDay(SMI_HOWTO_READ, "es")}.`,
      ca: `Font: ${ref}, text llegit al BOE el ${bareDay(SMI_HOWTO_READ, "ca")}.`,
      en: `Source: ${ref}, text read in the BOE on ${bareDay(SMI_HOWTO_READ, "en")}.`,
    }),
  };
}
