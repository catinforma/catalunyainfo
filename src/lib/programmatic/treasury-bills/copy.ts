import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";

import type { Term } from "./results";

/**
 * Paths and words of "Letras del Tesoro: próximas subastas, último tipo y
 * calculadora", small enough for the browser (the calculator imports this
 * file, never server.ts):
 *
 *   /es/calculadoras/letras-del-tesoro/
 *   /ca/calculadores/lletres-del-tresor/
 *   /en/calculators/spain-treasury-bills/
 *
 * Slugs from the calculators registry (hub group "official"); numbers and
 * dates in the rent-update module's words (same output in Node and every
 * browser).
 */

export type LetrasLocale = DateLocale;
export const LETRAS_LOCALES: readonly LetrasLocale[] = ["es", "ca", "en"];

export const LETRAS_SLUG: Record<LetrasLocale, string> = calculatorSlugs("treasury-bills");

export function letrasPath(locale: LetrasLocale): string {
  return calcPath("treasury-bills", locale);
}

export function letrasEditions(): Record<LetrasLocale, string> {
  return { es: letrasPath("es"), ca: letrasPath("ca"), en: letrasPath("en") };
}

export { elDay, euros, num, pct };

/** A rate as the Tesoro prints it, three decimals: "3,045 %" / "3.045%". */
export function rate3(n: number, locale: LetrasLocale): string {
  return pct(n, 3, locale);
}

/** A price in % of face value, three decimals: "97,014 %". */
export function price3(n: number, locale: LetrasLocale): string {
  return pct(n, 3, locale);
}

/** Millions of euros as the Tesoro gives them: "4.044,79 M€" / "€4,044.79m". */
export function millions(n: number, locale: LetrasLocale): string {
  return locale === "en" ? `€${num(n, 2, "en")}m` : `${num(n, 2, locale)} M€`;
}

/** "1.000 €" with no decimals. */
export function wholeEuros(n: number, locale: LetrasLocale): string {
  return locale === "en" ? `€${num(n, 0, "en")}` : `${num(n, 0, locale)} €`;
}

/** The bare day: "13 de noviembre de 2026" / "13 November 2026". */
export function bareDay(iso: string, locale: LetrasLocale): string {
  return elDay(iso, locale).replace(/^(el |l'|la |on )/, "");
}

/** "dd/mm/aaaa" for dense tables (en: dd/mm/yyyy too, as Spanish documents print it). */
export function shortDay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const WEEKDAYS: Record<LetrasLocale, string[]> = {
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** "martes 1 de diciembre de 2026" / "dimarts 1 de desembre de 2026" / "Tuesday 1 December 2026". */
export function weekdayDay(iso: string, locale: LetrasLocale): string {
  const wd = WEEKDAYS[locale][new Date(`${iso}T12:00:00Z`).getUTCDay()]!;
  return `${wd} ${bareDay(iso, locale)}`;
}

export function termName(term: Term, locale: LetrasLocale): string {
  return locale === "en" ? `${term}-month` : locale === "ca" ? `${term} mesos` : `${term} meses`;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface LetrasCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  amount: string;
  amountHint: string;
  term: string;
  termOption: (term: Term, days: number, auction: string) => string;
  rate: string;
  rateHint: (avg: string, auction: string) => string;
  resetRate: string;
  invalid: Record<"amount" | "multiple" | "rate" | "days", string>;
  bills: (n: number) => string;
  price: string;
  paid: string;
  repaid: (maturity: string) => string;
  gross: string;
  tae: string;
  taeHint: (days: number) => string;
  tax: string;
  taxHint: string;
  net: string;
  fee: string;
  feeHint: string;
  next: (auction: string, requestsBy: string) => string;
  noNext: string;
}

export const CALC_COPY: Record<LetrasLocale, LetrasCalcCopy> = {
  es: {
    title: "Calculadora de Letras del Tesoro",
    intro: "Escribe cuánto quieres invertir (valor nominal: 1.000 € por letra) y el plazo. El tipo viene del tipo medio de la última subasta de ese plazo; cámbialo para simular otro.",
    noscript: "Sin JavaScript ves el ejemplo de 10.000 € a 12 meses con el tipo medio de la última subasta; la tabla de abajo da lo mismo para cada plazo.",
    amount: "Importe nominal",
    amountHint: "Mínimo 1.000 €, en múltiplos de 1.000 € (cada letra vale 1.000 € al vencimiento).",
    term: "Plazo",
    termOption: (term, days, auction) => `${term} meses (${days} días, subasta del ${auction})`,
    rate: "Tipo de interés",
    rateHint: (avg, auction) => `Tipo medio de la subasta del ${auction}: ${avg}. Una petición no competitiva paga el precio de ese tipo medio.`,
    resetRate: "Volver al tipo medio",
    invalid: {
      amount: "Escribe un importe de 1.000 € o más.",
      multiple: "El importe debe ser múltiplo de 1.000 € (1.000, 2.000, 15.000…).",
      rate: "Escribe un tipo de interés válido, por ejemplo 2,9.",
      days: "No hay plazo para calcular.",
    },
    bills: (n) => `${num(n, 0, "es")} ${n === 1 ? "letra" : "letras"}`,
    price: "Precio por letra",
    paid: "Pagas al comprar",
    repaid: (m) => `Cobras al vencimiento (${m})`,
    gross: "Rendimiento bruto",
    tae: "TAE equivalente",
    taeHint: (days) => `El tipo de las letras es simple sobre ${days} días (base 360); la TAE lo pasa a un año de 365 días con capitalización, para compararlo con un depósito.`,
    tax: "IRPF estimado (escala del ahorro, 19 % hasta 6.000 €)",
    taxHint: "No hay retención: lo pagas en la Renta del año en que cobras la letra. Si tienes otras rentas del ahorro, los tramos se reparten entre todas.",
    net: "Rendimiento después del IRPF",
    fee: "Comisión del Banco de España al cobrar (Cuenta Directa)",
    feeHint: "1,5 por mil de lo que te transfiere al vencimiento, mínimo 0,90 € y máximo 200 €. Si compras en un banco o agencia, aplica sus propias comisiones.",
    next: (a, r) => `Próxima subasta de este plazo: ${a}. Peticiones en el Banco de España hasta el ${r}, a las 14:00.`,
    noNext: "La próxima subasta de este plazo aún no está en el calendario publicado por el Tesoro.",
  },
  ca: {
    title: "Calculadora de lletres del Tresor",
    intro: "Escriu quant vols invertir (valor nominal: 1.000 € per lletra) i el termini. El tipus surt del tipus mitjà de l'última subhasta d'aquest termini; canvia'l per simular-ne un altre.",
    noscript: "Sense JavaScript veus l'exemple de 10.000 € a 12 mesos amb el tipus mitjà de l'última subhasta; la taula de sota dona el mateix per a cada termini.",
    amount: "Import nominal",
    amountHint: "Mínim 1.000 €, en múltiples de 1.000 € (cada lletra val 1.000 € al venciment).",
    term: "Termini",
    termOption: (term, days, auction) => `${term} mesos (${days} dies, subhasta del ${auction})`,
    rate: "Tipus d'interès",
    rateHint: (avg, auction) => `Tipus mitjà de la subhasta del ${auction}: ${avg}. Una petició no competitiva paga el preu d'aquest tipus mitjà.`,
    resetRate: "Tornar al tipus mitjà",
    invalid: {
      amount: "Escriu un import de 1.000 € o més.",
      multiple: "L'import ha de ser múltiple de 1.000 € (1.000, 2.000, 15.000…).",
      rate: "Escriu un tipus d'interès vàlid, per exemple 2,9.",
      days: "No hi ha termini per calcular.",
    },
    bills: (n) => `${num(n, 0, "ca")} ${n === 1 ? "lletra" : "lletres"}`,
    price: "Preu per lletra",
    paid: "Pagues en comprar",
    repaid: (m) => `Cobres al venciment (${m})`,
    gross: "Rendiment brut",
    tae: "TAE equivalent",
    taeHint: (days) => `El tipus de les lletres és simple sobre ${days} dies (base 360); la TAE el passa a un any de 365 dies amb capitalització, per comparar-lo amb un dipòsit.`,
    tax: "IRPF estimat (escala de l'estalvi, 19 % fins a 6.000 €)",
    taxHint: "No hi ha retenció: el pagues a la Renda de l'any en què cobres la lletra. Si tens altres rendes de l'estalvi, els trams es reparteixen entre totes.",
    net: "Rendiment després de l'IRPF",
    fee: "Comissió del Banc d'Espanya en cobrar (compte directe)",
    feeHint: "1,5 per mil del que et transfereix al venciment, mínim 0,90 € i màxim 200 €. Si compres en un banc o una agència, s'hi apliquen les seves comissions.",
    next: (a, r) => `Propera subhasta d'aquest termini: ${a}. Peticions al Banc d'Espanya fins al ${r}, a les 14.00.`,
    noNext: "La propera subhasta d'aquest termini encara no és al calendari publicat pel Tresor.",
  },
  en: {
    title: "Spanish Treasury bill calculator",
    intro: "Type how much you want to invest (face value: €1,000 per bill) and the term. The rate is the average rate of the term's latest auction; change it to try another.",
    noscript: "Without JavaScript you see the example of €10,000 for 12 months at the latest auction's average rate; the table below gives the same for each term.",
    amount: "Face value",
    amountHint: "At least €1,000, in multiples of €1,000 (each bill repays €1,000 at maturity).",
    term: "Term",
    termOption: (term, days, auction) => `${term} months (${days} days, auction of ${auction})`,
    rate: "Interest rate",
    rateHint: (avg, auction) => `Average rate at the auction of ${auction}: ${avg}. A non-competitive bid pays the price of that average rate.`,
    resetRate: "Back to the average rate",
    invalid: {
      amount: "Type an amount of €1,000 or more.",
      multiple: "The amount must be a multiple of €1,000 (1,000, 2,000, 15,000…).",
      rate: "Type a valid interest rate, for example 2.9.",
      days: "There is no term to calculate.",
    },
    bills: (n) => `${num(n, 0, "en")} ${n === 1 ? "bill" : "bills"}`,
    price: "Price per bill",
    paid: "You pay when buying",
    repaid: (m) => `You get back at maturity (${m})`,
    gross: "Gross return",
    tae: "Equivalent APY (TAE)",
    taeHint: (days) => `Bill rates are simple interest over ${days} days (360-day basis); the TAE turns that into a compounded 365-day year, to compare with a deposit.`,
    tax: "Estimated income tax (savings scale, 19% up to €6,000)",
    taxHint: "Spanish residents: nothing is withheld; you pay it in the tax return for the year the bill is repaid. Other savings income shares the same brackets.",
    net: "Return after income tax",
    fee: "Banco de España fee at maturity (Cuenta Directa)",
    feeHint: "1.5 per mille of what it transfers to you at maturity, minimum €0.90, maximum €200. A bank or broker charges its own fees instead.",
    next: (a, r) => `Next auction for this term: ${a}. Requests at the Banco de España by ${r}, 14:00.`,
    noNext: "The next auction for this term is not in the Treasury's published calendar yet.",
  },
};
