import { CALCULATORS, CALCULATORS_ROOT } from "@/lib/programmatic/calculators/paths";
import { elDay, euros, monthText, num, pct } from "@/lib/programmatic/rent-update/copy";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

import type { PensionNote, RateStatus } from "./engine";
import type { MinimumId } from "./rules";

/**
 * Paths and words of "Subida de las pensiones 2027", small enough for the
 * browser (the client component imports this file, never server.ts):
 *
 *   /es/calculadoras/subida-pensiones-2027/
 *   /ca/calculadores/pujada-pensions-2027/
 *   /en/calculators/spain-pension-increase-2027/
 *
 * Number and date words are the rent-update calculator's (same output in
 * Node and every browser).
 */

export type PensionLocale = DateLocale;
export const PENSION_LOCALES: readonly PensionLocale[] = ["es", "ca", "en"];

const ENTRY = CALCULATORS.find((c) => c.id === "pensions-2027")!;
export const PENSION_SLUG: Record<PensionLocale, string> = ENTRY.slugs;

export function pensionPath(locale: PensionLocale): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/${PENSION_SLUG[locale]}/`;
}

export function pensionEditions(): Record<PensionLocale, string> {
  return { es: pensionPath("es"), ca: pensionPath("ca"), en: pensionPath("en") };
}

export { elDay, euros, monthText, num, pct };

/** "3,47 %" (two decimals while provisional), "3,6 %" otherwise. */
export function percentText(status: Pick<RateStatus, "kind" | "percent">, locale: PensionLocale): string {
  return pct(status.percent, status.kind === "provisional" ? 2 : 1, locale);
}

/** The bare day: "27 de noviembre de 2026" / "27 November 2026". */
export function bareDay(iso: string, locale: PensionLocale): string {
  return elDay(iso, locale).replace(/^(el |l'|la |on )/, "");
}

/* -------------------------------------------------------------------------- */
/* Minimum pensions table labels                                              */
/* -------------------------------------------------------------------------- */

export const MINIMUM_LABEL: Record<PensionLocale, Record<MinimumId, string>> = {
  es: {
    ret65: "Jubilación, titular con 65 años",
    retUnder65: "Jubilación, titular menor de 65 años",
    ret65Gi: "Jubilación con 65 años procedente de gran incapacidad",
    ipGi: "Incapacidad permanente: gran incapacidad",
    ipAbs: "Incapacidad permanente absoluta",
    ipTotal65: "Incapacidad permanente total, titular con 65 años",
    ipTotal60: "Incapacidad permanente total, titular de 60 a 64 años",
    ipTotalUnder60: "Incapacidad permanente total por enfermedad común, menor de 60 años",
    widowCharges: "Viudedad, titular con cargas familiares",
    widow65: "Viudedad, titular con 65 años o discapacidad del 65 % o más",
    widow60: "Viudedad, titular de 60 a 64 años",
    widowUnder60: "Viudedad, titular menor de 60 años",
    orphan: "Orfandad, por beneficiario",
    family: "En favor de familiares, por beneficiario",
  },
  ca: {
    ret65: "Jubilació, titular amb 65 anys",
    retUnder65: "Jubilació, titular menor de 65 anys",
    ret65Gi: "Jubilació amb 65 anys procedent de gran invalidesa",
    ipGi: "Incapacitat permanent: gran invalidesa",
    ipAbs: "Incapacitat permanent absoluta",
    ipTotal65: "Incapacitat permanent total, titular amb 65 anys",
    ipTotal60: "Incapacitat permanent total, titular de 60 a 64 anys",
    ipTotalUnder60: "Incapacitat permanent total per malaltia comuna, menor de 60 anys",
    widowCharges: "Viduïtat, titular amb càrregues familiars",
    widow65: "Viduïtat, titular amb 65 anys o discapacitat del 65 % o més",
    widow60: "Viduïtat, titular de 60 a 64 anys",
    widowUnder60: "Viduïtat, titular menor de 60 anys",
    orphan: "Orfandat, per beneficiari",
    family: "En favor de familiars, per beneficiari",
  },
  en: {
    ret65: "Retirement, aged 65 or over",
    retUnder65: "Retirement, under 65",
    ret65Gi: "Retirement at 65 from severe disability (gran incapacidad)",
    ipGi: "Permanent disability: severe (gran incapacidad)",
    ipAbs: "Permanent disability: absolute",
    ipTotal65: "Permanent disability: total, aged 65 or over",
    ipTotal60: "Permanent disability: total, aged 60 to 64",
    ipTotalUnder60: "Permanent disability: total, common illness, under 60",
    widowCharges: "Widow's or widower's, with family dependants",
    widow65: "Widow's or widower's, aged 65+ or 65%+ disability",
    widow60: "Widow's or widower's, aged 60 to 64",
    widowUnder60: "Widow's or widower's, under 60",
    orphan: "Orphan's, per beneficiary",
    family: "In favour of relatives, per beneficiary",
  },
};

export const MINIMUM_COLS: Record<PensionLocale, { kind: string; spouse: string; single: string; spouseNot: string }> = {
  es: { kind: "Clase de pensión", spouse: "Con cónyuge a cargo", single: "Sin cónyuge (unipersonal)", spouseNot: "Con cónyuge no a cargo" },
  ca: { kind: "Classe de pensió", spouse: "Amb cònjuge a càrrec", single: "Sense cònjuge (unipersonal)", spouseNot: "Amb cònjuge no a càrrec" },
  en: { kind: "Type of pension", spouse: "Dependent spouse", single: "No spouse (single-person household)", spouseNot: "Non-dependent spouse" },
};

/* -------------------------------------------------------------------------- */
/* The calculator                                                             */
/* -------------------------------------------------------------------------- */

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  amount: string;
  amountHint: string;
  payments: string;
  paymentOptions: Record<"14" | "12", string>;
  rateLabel: (status: RateStatus) => string;
  monthly2027: string;
  monthlyRise: string;
  annual2027: string;
  annualRise: string;
  invalid: string;
  basis: (status: RateStatus, percent: string) => string;
  notes: Record<PensionNote, string>;
  provisional: string;
}

export const CALC_COPY: Record<PensionLocale, CalcCopy> = {
  es: {
    title: "Calcula tu pensión de 2027",
    intro: "Escribe lo que cobras ahora al mes, en bruto (lo que figura en tu carta de revalorización o en el portal de la Seguridad Social, antes de la retención del IRPF).",
    noscript: "Sin JavaScript ves el ejemplo de 1.000 € al mes; actívalo para calcular tu importe.",
    amount: "Pensión bruta mensual en 2026",
    amountHint: "Sin el complemento a mínimos, si lo cobras: ese complemento no sube con el IPC.",
    payments: "Pagas al año",
    paymentOptions: { "14": "14 pagas (12 + extra en junio y noviembre)", "12": "12 pagas (extras prorrateadas, p. ej. accidente de trabajo)" },
    rateLabel: (s) => ({ provisional: "Subida provisional", flash: "Subida con el IPC adelantado", final: "Subida con el dato definitivo del INE", official: "Subida oficial" })[s.kind],
    monthly2027: "Pensión mensual en 2027",
    monthlyRise: "Subida al mes",
    annual2027: "Total anual en 2027",
    annualRise: "Subida al año",
    invalid: "Escribe un importe mensual entre 1 y 20.000 €.",
    basis: (s, p) =>
      ({
        provisional: `Calculado con ${p}, la media de los ${s.known} meses del IPC que ha publicado el INE. No es la cifra oficial: cambiará con el dato de noviembre.`,
        flash: `Calculado con ${p}: la media de los 12 meses con el IPC adelantado de noviembre. El definitivo del INE puede moverla una décima.`,
        final: `Calculado con ${p}: la media de los 12 meses con los datos definitivos del INE. Falta que el Gobierno la apruebe en el BOE.`,
        official: `Calculado con ${p}, el porcentaje publicado en el BOE.`,
      })[s.kind],
    notes: {
      "above-max": "Tu importe supera la pensión máxima de 2026 (3.359,60 € al mes en 14 pagas): la suma de pensiones públicas tiene ese límite, que también se revaloriza.",
      minimums: "Si cobras complemento a mínimos, la Seguridad Social revaloriza tu pensión y después la completa hasta la pensión mínima de 2027, que fija la norma de cada año (puede subir más que el IPC).",
    },
    provisional: "Provisional",
  },
  ca: {
    title: "Calcula la teva pensió del 2027",
    intro: "Escriu el que cobres ara al mes, en brut (el que figura a la carta de revaloració o al portal de la Seguretat Social, abans de la retenció de l'IRPF).",
    noscript: "Sense JavaScript veus l'exemple de 1.000 € al mes; activa'l per calcular el teu import.",
    amount: "Pensió bruta mensual el 2026",
    amountHint: "Sense el complement a mínims, si el cobres: aquest complement no puja amb l'IPC.",
    payments: "Pagues l'any",
    paymentOptions: { "14": "14 pagues (12 + extra al juny i al novembre)", "12": "12 pagues (extres prorratejades, p. ex. accident de treball)" },
    rateLabel: (s) => ({ provisional: "Pujada provisional", flash: "Pujada amb l'IPC avançat", final: "Pujada amb la dada definitiva de l'INE", official: "Pujada oficial" })[s.kind],
    monthly2027: "Pensió mensual el 2027",
    monthlyRise: "Pujada al mes",
    annual2027: "Total anual el 2027",
    annualRise: "Pujada a l'any",
    invalid: "Escriu un import mensual entre 1 i 20.000 €.",
    basis: (s, p) =>
      ({
        provisional: `Calculat amb ${p}, la mitjana dels ${s.known} mesos de l'IPC que ha publicat l'INE. No és la xifra oficial: canviarà amb la dada de novembre.`,
        flash: `Calculat amb ${p}: la mitjana dels 12 mesos amb l'IPC avançat de novembre. El definitiu de l'INE la pot moure una dècima.`,
        final: `Calculat amb ${p}: la mitjana dels 12 mesos amb les dades definitives de l'INE. Falta que el Govern l'aprovi al BOE.`,
        official: `Calculat amb ${p}, el percentatge publicat al BOE.`,
      })[s.kind],
    notes: {
      "above-max": "El teu import supera la pensió màxima del 2026 (3.359,60 € al mes en 14 pagues): la suma de pensions públiques té aquest límit, que també es revaloritza.",
      minimums: "Si cobres complement a mínims, la Seguretat Social revaloritza la pensió i després la completa fins a la pensió mínima del 2027, que fixa la norma de cada any (pot pujar més que l'IPC).",
    },
    provisional: "Provisional",
  },
  en: {
    title: "Work out your 2027 pension",
    intro: "Type what you get now each month, gross (the amount on your revaluation letter or in the Social Security portal, before income tax is withheld).",
    noscript: "Without JavaScript you see the example of €1,000 a month; turn it on to work out your own amount.",
    amount: "Gross monthly pension in 2026",
    amountHint: "Leave out any minimum-pension top-up (complemento a mínimos): it does not rise with the CPI.",
    payments: "Payments a year",
    paymentOptions: { "14": "14 payments (12 + extra in June and November)", "12": "12 payments (extras prorated, e.g. work accident)" },
    rateLabel: (s) => ({ provisional: "Provisional increase", flash: "Increase on the flash CPI", final: "Increase on the final INE figure", official: "Official increase" })[s.kind],
    monthly2027: "Monthly pension in 2027",
    monthlyRise: "Increase per month",
    annual2027: "Yearly total in 2027",
    annualRise: "Increase per year",
    invalid: "Type a monthly amount between €1 and €20,000.",
    basis: (s, p) =>
      ({
        provisional: `Worked out with ${p}, the average of the ${s.known} CPI months the INE has released. It is not the official figure: it will change with November's figure.`,
        flash: `Worked out with ${p}: the 12-month average including the INE's flash estimate for November. The final figure can move it by a tenth.`,
        final: `Worked out with ${p}: the 12-month average on the INE's final figures. The government still has to approve it in the BOE.`,
        official: `Worked out with ${p}, the percentage published in the BOE.`,
      })[s.kind],
    notes: {
      "above-max": "Your amount is above the 2026 maximum pension (€3,359.60 a month in 14 payments): the sum of public pensions is capped there, and the cap is revalued too.",
      minimums: "If you get a minimum-pension top-up, Social Security revalues your pension and then tops it up to the 2027 minimum, which each year's rules set (it can rise more than the CPI).",
    },
    provisional: "Provisional",
  },
};

/** "diciembre de 2025 a octubre de 2026". */
export function rangeText(from: string, to: string, locale: PensionLocale): string {
  if (locale === "en") return `${monthText(from, "en")} to ${monthText(to, "en")}`;
  return `${monthText(from, locale)} a ${monthText(to, locale)}`;
}
