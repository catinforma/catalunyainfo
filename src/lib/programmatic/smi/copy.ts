import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

import type { Payments } from "./engine";

/**
 * Paths and words of "Salario mínimo (SMI) 2027", small enough for the
 * browser (the calculator imports this file, never boe.ts):
 *
 *   /es/calculadoras/salario-minimo-2027/
 *   /ca/calculadores/salari-minim-2027/
 *   /en/calculators/spain-minimum-wage-2027/
 *
 * Slugs from the calculators registry; numbers and dates in the
 * rent-update module's words (same output in Node and every browser).
 */

export type SmiLocale = DateLocale;
export const SMI_LOCALES: readonly SmiLocale[] = ["es", "ca", "en"];

export const SMI_SLUG: Record<SmiLocale, string> = calculatorSlugs("smi-2027");

export function smiPath(locale: SmiLocale): string {
  return calcPath("smi-2027", locale);
}

export function smiEditions(): Record<SmiLocale, string> {
  return { es: smiPath("es"), ca: smiPath("ca"), en: smiPath("en") };
}

/**
 * The net salary calculator opened on the SMI: its URL hash takes the gross
 * yearly salary (`b`) and the number of payments (`n`), see
 * net-salary/copy.ts readHash.
 */
export function netSalaryPreset(locale: SmiLocale, annual: number, payments: Payments): string {
  return `${calcPath("net-salary", locale)}#b=${annual}&n=${payments}`;
}

export { elDay, euros, num, pct };

/** "1.221 €" with no decimals when the amount is whole, "40,70 €" otherwise. */
export function money(n: number, locale: SmiLocale): string {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  if (!whole) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** The bare day: "19 de febrero de 2026" / "19 February 2026". */
export function bareDay(iso: string, locale: SmiLocale): string {
  return elDay(iso, locale).replace(/^(el |l'|la |on )/, "");
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface SmiCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  year: string;
  yearOption: (year: number) => string;
  hours: string;
  hoursHint: string;
  fullTime: string;
  fullTimeHint: string;
  payments: string;
  paymentOptions: Record<`${Payments}`, string>;
  perPayment: (p: Payments) => string;
  monthlyAverage: string;
  yearly: string;
  daily: string;
  share: (pct: string) => string;
  invalid: string;
  domesticTitle: string;
  domesticHours: string;
  domesticResult: (hourly: string, weekly: string, monthly: string) => string;
  net: string;
  netHint: string;
}

export const CALC_COPY: Record<SmiLocale, SmiCalcCopy> = {
  es: {
    title: "Calcula tu salario mínimo",
    intro: "El SMI se fija para la jornada completa; si trabajas menos horas, te corresponde la parte proporcional («a prorrata»).",
    noscript: "Sin JavaScript verás el cálculo de una jornada completa de 40 horas en 14 pagas.",
    year: "Año",
    yearOption: (y) => `SMI ${y}`,
    hours: "Horas que trabajas a la semana",
    hoursHint: "Las de tu contrato.",
    fullTime: "Jornada completa de tu convenio (horas a la semana)",
    fullTimeHint: "Máximo legal: 40 horas (art. 34.1 del Estatuto de los Trabajadores).",
    payments: "Pagas al año",
    paymentOptions: { "14": "14 pagas (12 meses + 2 extra)", "12": "12 pagas (extras prorrateadas)" },
    perPayment: (p) => (p === 14 ? "Cada una de las 14 pagas" : "Cada una de las 12 pagas"),
    monthlyAverage: "Media al mes (anual ÷ 12)",
    yearly: "Al año",
    daily: "Por día (salario fijado por días)",
    share: (p) => `Tu jornada es el ${p} de la completa.`,
    invalid: "Revisa las horas: deben ser más de 0 y no más que la jornada completa, que no puede pasar de 40.",
    domesticTitle: "Empleo de hogar por horas",
    domesticHours: "Horas a la semana",
    domesticResult: (h, w, m) => `A ${h} la hora (incluye pagas extra y vacaciones): ${w} a la semana, unos ${m} al mes (52 semanas ÷ 12).`,
    net: "¿Cuánto es en neto? Calcula el sueldo neto del SMI",
    netHint: "Abre la calculadora de sueldo neto con este importe anual y estas pagas: cotización a la Seguridad Social y retención de IRPF de tu comunidad.",
  },
  ca: {
    title: "Calcula el teu salari mínim",
    intro: "L'SMI es fixa per a la jornada completa; si treballes menys hores, et correspon la part proporcional («a prorrata»).",
    noscript: "Sense JavaScript veuràs el càlcul d'una jornada completa de 40 hores en 14 pagues.",
    year: "Any",
    yearOption: (y) => `SMI ${y}`,
    hours: "Hores que treballes a la setmana",
    hoursHint: "Les del teu contracte.",
    fullTime: "Jornada completa del teu conveni (hores a la setmana)",
    fullTimeHint: "Màxim legal: 40 hores (art. 34.1 de l'Estatut dels Treballadors).",
    payments: "Pagues l'any",
    paymentOptions: { "14": "14 pagues (12 mesos + 2 extra)", "12": "12 pagues (extres prorratejades)" },
    perPayment: (p) => (p === 14 ? "Cadascuna de les 14 pagues" : "Cadascuna de les 12 pagues"),
    monthlyAverage: "Mitjana al mes (anual ÷ 12)",
    yearly: "L'any",
    daily: "Per dia (salari fixat per dies)",
    share: (p) => `La teva jornada és el ${p} de la completa.`,
    invalid: "Revisa les hores: han de ser més de 0 i no més que la jornada completa, que no pot passar de 40.",
    domesticTitle: "Treball de la llar per hores",
    domesticHours: "Hores a la setmana",
    domesticResult: (h, w, m) => `A ${h} l'hora (inclou pagues extra i vacances): ${w} a la setmana, uns ${m} al mes (52 setmanes ÷ 12).`,
    net: "Quant és en net? Calcula el sou net de l'SMI",
    netHint: "Obre la calculadora de sou net amb aquest import anual i aquestes pagues: cotització a la Seguretat Social i retenció d'IRPF de la teva comunitat.",
  },
  en: {
    title: "Work out your minimum wage",
    intro: "The SMI is set for a full-time week; if you work fewer hours, you are owed the proportional part (“a prorrata”).",
    noscript: "Without JavaScript you see the figures for a 40-hour full-time week in 14 payments.",
    year: "Year",
    yearOption: (y) => `SMI ${y}`,
    hours: "Hours you work a week",
    hoursHint: "As in your contract.",
    fullTime: "Full-time week in your collective agreement (hours)",
    fullTimeHint: "Legal maximum: 40 hours (Workers' Statute, art. 34.1).",
    payments: "Payments a year",
    paymentOptions: { "14": "14 payments (12 months + 2 extra)", "12": "12 payments (extras spread out)" },
    perPayment: (p) => (p === 14 ? "Each of the 14 payments" : "Each of the 12 payments"),
    monthlyAverage: "Monthly average (yearly ÷ 12)",
    yearly: "A year",
    daily: "Per day (pay set by the day)",
    share: (p) => `Your week is ${p} of full time.`,
    invalid: "Check the hours: more than 0, and no more than full time, which cannot exceed 40.",
    domesticTitle: "Domestic work paid by the hour",
    domesticHours: "Hours a week",
    domesticResult: (h, w, m) => `At ${h} an hour (extra payments and holidays included): ${w} a week, about ${m} a month (52 weeks ÷ 12).`,
    net: "What is it after tax? Work out the SMI's net pay",
    netHint: "Opens the net salary calculator with this yearly amount and these payments: Social Security contributions and income tax withholding for your region.",
  },
};
