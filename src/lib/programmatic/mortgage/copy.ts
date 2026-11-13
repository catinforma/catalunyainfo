import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { euros, monthText, num, pct } from "@/lib/programmatic/rent-update/copy";

import type { MortgageKind } from "./engine";

/**
 * Paths and words of the mortgage calculator, small enough for the browser
 * (both client calculators import this file):
 *
 *   /es/calculadoras/hipoteca/
 *   /ca/calculadores/hipoteca/
 *   /en/calculators/mortgage-calculator-spain/
 *
 * Slugs from the calculators registry (hub group "housing").
 */

export type MortgageLocale = DateLocale;
export const MORTGAGE_LOCALES: readonly MortgageLocale[] = ["es", "ca", "en"];

export const MORTGAGE_SLUG: Record<MortgageLocale, string> = calculatorSlugs("mortgage");

export function mortgagePath(locale: MortgageLocale): string {
  return calcPath("mortgage", locale);
}

export function mortgageEditions(): Record<MortgageLocale, string> {
  return { es: mortgagePath("es"), ca: mortgagePath("ca"), en: mortgagePath("en") };
}

export { euros, monthText, num, pct };

/** Cents as euros: "711,32 €" / "€711.32". */
export function centsText(cents: number, locale: MortgageLocale): string {
  return euros(cents / 100, locale);
}

/** A signed difference in cents: "+66,31 €" / "−12,00 €". */
export function signedCents(cents: number, locale: MortgageLocale): string {
  const t = centsText(Math.abs(cents), locale);
  return cents > 0 ? `+${t}` : cents < 0 ? `−${t}` : t;
}

/** One official month for the Euribor selects: its label and value. */
export interface EuriborOption {
  month: string;
  value: number;
  boe: string;
}

export interface MortgageCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  kind: string;
  kinds: Record<MortgageKind, string>;
  amount: string;
  amountHint: string;
  years: string;
  fixedPct: string;
  fixedHint: string;
  fixedYears: string;
  euribor: string;
  euriborHint: (value: string, month: string) => string;
  resetEuribor: string;
  spread: string;
  spreadHint: string;
  initialPct: string;
  initialMonths: string;
  initialHint: string;
  results: string;
  firstPayment: string;
  laterPayment: (fromYear: number, rate: string) => string;
  totalInterest: string;
  totalPaid: string;
  floored: string;
  assumption: (euribor: string, month: string) => string;
  yearly: string;
  yearlyCaption: string;
  cols: { year: string; paid: string; interest: string; principal: string; balance: string };
  invalid: Record<"amount" | "years" | "rate" | "fixedYears" | "initialMonths", string>;
  years1: (n: number) => string;
  months1: (n: number) => string;
}

export const CALC_COPY: Record<MortgageLocale, MortgageCalcCopy> = {
  es: {
    title: "Calculadora de hipoteca",
    intro: "Cuota mensual con el sistema francés (cuota constante en cada tramo), intereses totales y resumen por años. En las variables y mixtas, el tipo es Euríbor + diferencial, con el último Euríbor oficial ya puesto.",
    noscript: "Sin JavaScript ves el ejemplo por defecto (150.000 € a 25 años, variable). Activa JavaScript para cambiar los datos.",
    kind: "Tipo de hipoteca",
    kinds: { fixed: "Fija", variable: "Variable", mixed: "Mixta" },
    amount: "Importe del préstamo",
    amountHint: "El capital que pides al banco, no el precio de la vivienda.",
    years: "Plazo (años)",
    fixedPct: "Tipo fijo (TIN anual)",
    fixedHint: "El valor puesto es solo un ejemplo: escribe el TIN de tu oferta (FEIN).",
    fixedYears: "Años a tipo fijo",
    euribor: "Euríbor a un año",
    euriborHint: (v, m) => `Último dato oficial: ${v} (${m}). Puedes poner otro para simular.`,
    resetEuribor: "Volver al dato oficial",
    spread: "Diferencial",
    spreadHint: "Lo que suma tu banco al Euríbor (el valor puesto es un ejemplo); viene en la FEIN y en la escritura.",
    initialPct: "Tipo inicial (TIN)",
    initialMonths: "Meses a tipo inicial",
    initialHint: "Muchas variables fijan los primeros 6 o 12 meses; pon 0 si la tuya no.",
    results: "Resultado",
    firstPayment: "Cuota mensual",
    laterPayment: (y, r) => `Cuota desde el año ${y} (al ${r})`,
    totalInterest: "Intereses totales",
    totalPaid: "Total pagado (capital + intereses)",
    floored: "Euríbor + diferencial sale negativo: se aplica el 0 %, porque la ley no permite intereses negativos (Ley 5/2019, art. 21.4).",
    assumption: (e, m) => `Supone que el Euríbor se queda en el ${e} (${m}) toda la vida del préstamo. No será así: en cada revisión tu cuota cambiará con el Euríbor de ese momento.`,
    yearly: "Cuadro de amortización por años",
    yearlyCaption: "Importes de cada año; capital pendiente al final del año.",
    cols: { year: "Año", paid: "Pagado", interest: "Intereses", principal: "Capital amortizado", balance: "Capital pendiente" },
    invalid: {
      amount: "Escribe un importe entre 1.000 y 10.000.000 €.",
      years: "Escribe un plazo entero entre 1 y 40 años.",
      rate: "Revisa los tipos: un número como 2,5 (en %).",
      fixedYears: "Los años a tipo fijo tienen que ser al menos 1 y menos que el plazo.",
      initialMonths: "Los meses a tipo inicial tienen que ser menos que el plazo.",
    },
    years1: (n) => (n === 1 ? "1 año" : `${n} años`),
    months1: (n) => (n === 1 ? "1 mes" : `${n} meses`),
  },
  ca: {
    title: "Calculadora d'hipoteca",
    intro: "Quota mensual amb el sistema francès (quota constant a cada tram), interessos totals i resum per anys. A les variables i mixtes, el tipus és Euríbor + diferencial, amb l'últim Euríbor oficial ja posat.",
    noscript: "Sense JavaScript veus l'exemple per defecte (150.000 € a 25 anys, variable). Activa JavaScript per canviar les dades.",
    kind: "Tipus d'hipoteca",
    kinds: { fixed: "Fixa", variable: "Variable", mixed: "Mixta" },
    amount: "Import del préstec",
    amountHint: "El capital que demanes al banc, no el preu de l'habitatge.",
    years: "Termini (anys)",
    fixedPct: "Tipus fix (TIN anual)",
    fixedHint: "El valor posat és només un exemple: escriu el TIN de la teva oferta (FEIN).",
    fixedYears: "Anys a tipus fix",
    euribor: "Euríbor a un any",
    euriborHint: (v, m) => `Última dada oficial: ${v} (${m}). En pots posar un altre per simular.`,
    resetEuribor: "Tornar a la dada oficial",
    spread: "Diferencial",
    spreadHint: "El que el banc suma a l'Euríbor (el valor posat és un exemple); és a la FEIN i a l'escriptura.",
    initialPct: "Tipus inicial (TIN)",
    initialMonths: "Mesos a tipus inicial",
    initialHint: "Moltes variables fixen els primers 6 o 12 mesos; posa-hi 0 si la teva no.",
    results: "Resultat",
    firstPayment: "Quota mensual",
    laterPayment: (y, r) => `Quota des de l'any ${y} (al ${r})`,
    totalInterest: "Interessos totals",
    totalPaid: "Total pagat (capital + interessos)",
    floored: "Euríbor + diferencial surt negatiu: s'aplica el 0 %, perquè la llei no permet interessos negatius (Llei 5/2019, art. 21.4).",
    assumption: (e, m) => `Suposa que l'Euríbor es queda al ${e} (${m}) tota la vida del préstec. No serà així: a cada revisió la quota canviarà amb l'Euríbor d'aquell moment.`,
    yearly: "Quadre d'amortització per anys",
    yearlyCaption: "Imports de cada any; capital pendent a final d'any.",
    cols: { year: "Any", paid: "Pagat", interest: "Interessos", principal: "Capital amortitzat", balance: "Capital pendent" },
    invalid: {
      amount: "Escriu un import entre 1.000 i 10.000.000 €.",
      years: "Escriu un termini sencer entre 1 i 40 anys.",
      rate: "Revisa els tipus: un número com 2,5 (en %).",
      fixedYears: "Els anys a tipus fix han de ser com a mínim 1 i menys que el termini.",
      initialMonths: "Els mesos a tipus inicial han de ser menys que el termini.",
    },
    years1: (n) => (n === 1 ? "1 any" : `${n} anys`),
    months1: (n) => (n === 1 ? "1 mes" : `${n} mesos`),
  },
  en: {
    title: "Mortgage calculator",
    intro: "Monthly instalment with the French system Spanish loans use (a constant instalment in each rate period), total interest and a year-by-year summary. Variable and mixed loans use Euribor + spread, with the latest official Euribor filled in.",
    noscript: "Without JavaScript you see the default example (€150,000 over 25 years, variable). Turn JavaScript on to change the figures.",
    kind: "Type of mortgage",
    kinds: { fixed: "Fixed", variable: "Variable", mixed: "Mixed" },
    amount: "Loan amount",
    amountHint: "What you borrow from the bank, not the price of the home.",
    years: "Term (years)",
    fixedPct: "Fixed rate (annual TIN)",
    fixedHint: "The value shown is only an example: type the TIN of your offer (FEIN).",
    fixedYears: "Years at the fixed rate",
    euribor: "12-month Euribor",
    euriborHint: (v, m) => `Latest official figure: ${v} (${m}). Type another one to simulate.`,
    resetEuribor: "Back to the official figure",
    spread: "Spread (diferencial)",
    spreadHint: "What your bank adds to the Euribor (the value shown is an example); it is in your FEIN and your deed.",
    initialPct: "Initial rate (TIN)",
    initialMonths: "Months at the initial rate",
    initialHint: "Many variable loans fix the first 6 or 12 months; type 0 if yours does not.",
    results: "Result",
    firstPayment: "Monthly instalment",
    laterPayment: (y, r) => `Instalment from year ${y} (at ${r})`,
    totalInterest: "Total interest",
    totalPaid: "Total paid (capital + interest)",
    floored: "Euribor + spread comes out negative: 0% applies, because the law forbids negative interest (Ley 5/2019, art. 21.4).",
    assumption: (e, m) => `It assumes the Euribor stays at ${e} (${m}) for the whole loan. It will not: at each revision your instalment changes with the Euribor of the time.`,
    yearly: "Amortisation table by year",
    yearlyCaption: "Amounts for each year; capital outstanding at the end of the year.",
    cols: { year: "Year", paid: "Paid", interest: "Interest", principal: "Capital repaid", balance: "Outstanding" },
    invalid: {
      amount: "Type an amount between €1,000 and €10,000,000.",
      years: "Type a whole term between 1 and 40 years.",
      rate: "Check the rates: a number such as 2.5 (in %).",
      fixedYears: "The fixed years must be at least 1 and less than the term.",
      initialMonths: "The months at the initial rate must be fewer than the term.",
    },
    years1: (n) => (n === 1 ? "1 year" : `${n} years`),
    months1: (n) => (n === 1 ? "1 month" : `${n} months`),
  },
};

export interface RevisionCopy {
  title: string;
  intro: string;
  noscript: string;
  balance: string;
  balanceHint: string;
  yearsLeft: string;
  monthsLeft: string;
  spread: string;
  oldEuribor: string;
  newEuribor: string;
  monthHint: string;
  other: string;
  otherValue: string;
  oldPayment: (rate: string) => string;
  newPayment: (rate: string) => string;
  monthly: string;
  yearly: string;
  up: string;
  down: string;
  same: string;
  approx: string;
  floored: string;
  invalid: Record<"balance" | "months" | "rate", string>;
  optionLabel: (month: string, value: string) => string;
}

export const REVISION_COPY: Record<MortgageLocale, RevisionCopy> = {
  es: {
    title: "Revisión de tu hipoteca variable",
    intro: "Con tu diferencial y el Euríbor del mes que aplica tu contrato, la cuota nueva frente a la anterior, sobre el capital que te queda.",
    noscript: "Sin JavaScript ves el ejemplo por defecto. Activa JavaScript para poner tus datos.",
    balance: "Capital pendiente",
    balanceHint: "Lo que aún debes; sale en el recibo o en la app del banco.",
    yearsLeft: "Años que faltan",
    monthsLeft: "y meses",
    spread: "Tu diferencial",
    oldEuribor: "Euríbor de la revisión anterior",
    newEuribor: "Euríbor que aplica ahora",
    monthHint: "Tu escritura dice qué mes cuenta (a menudo, el publicado uno o dos meses antes de la revisión).",
    other: "Otro valor",
    otherValue: "Valor (%)",
    oldPayment: (r) => `Cuota con el Euríbor anterior (${r})`,
    newPayment: (r) => `Cuota nueva (${r})`,
    monthly: "Diferencia al mes",
    yearly: "Diferencia en 12 meses",
    up: "Tu cuota sube",
    down: "Tu cuota baja",
    same: "Tu cuota no cambia",
    approx: "Cálculo con el capital y el plazo de hoy: tu banco parte de los del día de la revisión, así que puede variar unos euros.",
    floored: "Euríbor + diferencial sale negativo: se aplica el 0 % (Ley 5/2019, art. 21.4).",
    invalid: { balance: "Escribe el capital pendiente (por ejemplo, 120.000).", months: "Revisa el plazo que falta: entre 1 mes y 40 años.", rate: "Revisa el diferencial y el Euríbor: un número como 0,8 (en %)." },
    optionLabel: (m, v) => `${m}: ${v}`,
  },
  ca: {
    title: "Revisió de la teva hipoteca variable",
    intro: "Amb el teu diferencial i l'Euríbor del mes que aplica el contracte, la quota nova davant de l'anterior, sobre el capital que et queda.",
    noscript: "Sense JavaScript veus l'exemple per defecte. Activa JavaScript per posar-hi les teves dades.",
    balance: "Capital pendent",
    balanceHint: "El que encara deus; surt al rebut o a l'app del banc.",
    yearsLeft: "Anys que falten",
    monthsLeft: "i mesos",
    spread: "El teu diferencial",
    oldEuribor: "Euríbor de la revisió anterior",
    newEuribor: "Euríbor que s'aplica ara",
    monthHint: "L'escriptura diu quin mes compta (sovint, el publicat un o dos mesos abans de la revisió).",
    other: "Un altre valor",
    otherValue: "Valor (%)",
    oldPayment: (r) => `Quota amb l'Euríbor anterior (${r})`,
    newPayment: (r) => `Quota nova (${r})`,
    monthly: "Diferència al mes",
    yearly: "Diferència en 12 mesos",
    up: "La quota puja",
    down: "La quota baixa",
    same: "La quota no canvia",
    approx: "Càlcul amb el capital i el termini d'avui: el banc parteix dels del dia de la revisió, així que pot variar uns euros.",
    floored: "Euríbor + diferencial surt negatiu: s'aplica el 0 % (Llei 5/2019, art. 21.4).",
    invalid: { balance: "Escriu el capital pendent (per exemple, 120.000).", months: "Revisa el termini que falta: entre 1 mes i 40 anys.", rate: "Revisa el diferencial i l'Euríbor: un número com 0,8 (en %)." },
    optionLabel: (m, v) => `${m}: ${v}`,
  },
  en: {
    title: "Your variable mortgage revision",
    intro: "With your spread and the Euribor of the month your contract uses, the new instalment against the previous one, on the capital you still owe.",
    noscript: "Without JavaScript you see the default example. Turn JavaScript on to enter your figures.",
    balance: "Capital outstanding",
    balanceHint: "What you still owe; it is on your statement or in your bank's app.",
    yearsLeft: "Years left",
    monthsLeft: "and months",
    spread: "Your spread",
    oldEuribor: "Euribor at the previous revision",
    newEuribor: "Euribor that applies now",
    monthHint: "Your deed says which month counts (often the one published one or two months before the revision).",
    other: "Another value",
    otherValue: "Value (%)",
    oldPayment: (r) => `Instalment with the previous Euribor (${r})`,
    newPayment: (r) => `New instalment (${r})`,
    monthly: "Difference a month",
    yearly: "Difference over 12 months",
    up: "Your instalment goes up",
    down: "Your instalment goes down",
    same: "Your instalment does not change",
    approx: "Worked out on today's balance and term: your bank starts from those of the revision day, so it can differ by a few euros.",
    floored: "Euribor + spread comes out negative: 0% applies (Ley 5/2019, art. 21.4).",
    invalid: { balance: "Type the capital outstanding (for example, 120,000).", months: "Check the time left: between 1 month and 40 years.", rate: "Check the spread and the Euribor: a number such as 0.8 (in %)." },
    optionLabel: (m, v) => `${m}: ${v}`,
  },
};

/** "octubre de 2026" for the selects (shared with the Euribor page). */
export function optionMonth(month: string, locale: MortgageLocale): string {
  return monthText(month, locale);
}

/** A typed-back rate for inputs: "3,239" / "3.239". */
export function rateInput(n: number, locale: MortgageLocale): string {
  return num(n, 3, locale);
}

/** A rate with as many decimals as it has (up to 3): "3,989 %", "2,5 %", "0 %". */
export function rateText(n: number, locale: MortgageLocale): string {
  const fixed = n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  const decimals = fixed.includes(".") ? fixed.split(".")[1]!.length : 0;
  return pct(n, decimals, locale);
}
