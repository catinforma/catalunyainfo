import { calcPath } from "@/lib/programmatic/calculators/paths";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

import type { InvalidReason } from "./engine";
import { DRAWS, type DrawId, type PresetId } from "./rules";

/**
 * Paths and words of the lottery prize tax calculator, small enough for the
 * browser (the client component imports this file, the engine and the
 * rules; nothing that reads data).
 *
 *   /es/calculadoras/premios-loteria/
 *   /ca/calculadores/premis-loteria/
 *   /en/calculators/spain-lottery-prize-tax/
 *
 * Numbers and dates in the rent-update module's words (same output in Node
 * and every browser).
 */

export type LtLocale = DateLocale;
export const LT_LOCALES: readonly LtLocale[] = ["es", "ca", "en"];

export function lotteryTaxPath(locale: LtLocale): string {
  return calcPath("lottery-tax", locale);
}

export function lotteryTaxEditions(): Record<LtLocale, string> {
  return { ca: lotteryTaxPath("ca"), es: lotteryTaxPath("es"), en: lotteryTaxPath("en") };
}

export { elDay, euros, num, pct };

/** "400.000 €" with no decimals when whole, "1.250,50 €" otherwise; "€400,000" in English. */
export function money(n: number, locale: LtLocale): string {
  if (Math.abs(n - Math.round(n)) >= 0.005) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** "25 %" / "25%", with decimals only when needed. */
export function sharePct(share: number, locale: LtLocale): string {
  const p = share * 100;
  const decimals = Math.abs(p - Math.round(p)) < 0.005 ? 0 : 2;
  return pct(p, decimals, locale);
}

export const DRAW_LABEL: Record<DrawId, Record<LtLocale, string>> = {
  "navidad-2026": { es: "Lotería de Navidad (22 de diciembre de 2026)", ca: "Loteria de Nadal (22 de desembre de 2026)", en: "Christmas Lottery (22 December 2026)" },
  "nino-2027": { es: "El Niño (6 de enero de 2027)", ca: "El Nen (El Niño, 6 de gener de 2027)", en: "El Niño (6 January 2027)" },
  "grossa-2026": { es: "La Grossa de Cap d'Any (31 de diciembre de 2026)", ca: "La Grossa de Cap d'Any (31 de desembre de 2026)", en: "La Grossa de Cap d'Any (31 December 2026)" },
};

/** Short draw names for tables. */
export const DRAW_SHORT: Record<DrawId, Record<LtLocale, string>> = {
  "navidad-2026": { es: "Navidad 2026", ca: "Nadal 2026", en: "Christmas 2026" },
  "nino-2027": { es: "El Niño 2027", ca: "El Nen 2027", en: "El Niño 2027" },
  "grossa-2026": { es: "La Grossa 2026", ca: "La Grossa 2026", en: "La Grossa 2026" },
};

export const PRESET_LABEL: Record<PresetId, Record<LtLocale, string>> = {
  gordo: { es: "El Gordo (primer premio)", ca: "El Gordo (primer premi)", en: "El Gordo (first prize)" },
  segundo: { es: "Segundo premio", ca: "Segon premi", en: "Second prize" },
  tercero: { es: "Tercer premio", ca: "Tercer premi", en: "Third prize" },
  cuarto: { es: "Cuarto premio", ca: "Quart premi", en: "Fourth prize" },
  quinto: { es: "Quinto premio", ca: "Cinquè premi", en: "Fifth prize" },
  pedrea: { es: "Pedrea", ca: "Pedrea", en: "Pedrea (small prize)" },
  reintegro: { es: "Reintegro", ca: "Reintegrament", en: "Reintegro (money back)" },
  "nino-primero": { es: "Primer premio de El Niño", ca: "Primer premi del Nen", en: "El Niño first prize" },
  "grossa-primer": { es: "Primer premio de La Grossa", ca: "Primer premi de La Grossa", en: "La Grossa first prize" },
  "grossa-segon": { es: "Segundo premio de La Grossa", ca: "Segon premi de La Grossa", en: "La Grossa second prize" },
  "grossa-tercer": { es: "Tercer premio de La Grossa", ca: "Tercer premi de La Grossa", en: "La Grossa third prize" },
};

/** "décimo" for Lotería Nacional draws, "billete/bitllet/ticket" for La Grossa. */
export function unitWord(draw: DrawId | "custom", locale: LtLocale): string {
  if (draw === "grossa-2026") return { es: "billete", ca: "bitllet", en: "ticket" }[locale];
  if (draw === "custom") return { es: "décimo o billete", ca: "dècim o bitllet", en: "décimo or ticket" }[locale];
  return { es: "décimo", ca: "dècim", en: "décimo" }[locale];
}

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  prize: string;
  custom: string;
  customPrize: string;
  customPrizeHint: string;
  customPrice: string;
  presetNote: (prize: string, unit: string, price: string, draw: string) => string;
  played: string;
  playedHint: (price: string, unit: string) => string;
  tickets: string;
  ticketsHint: string;
  gross: string;
  exempt: string;
  withholding: string;
  net: string;
  perTicket: (unit: string, net: string, withholding: string) => string;
  share: (share: string, exempt: string, whole: string, unit: string) => string;
  effective: (rate: string) => string;
  noTax: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<LtLocale, CalcCopy> = {
  es: {
    title: "Calculadora: cuánto te queda de un premio de lotería",
    intro: "Elige el premio, di cuánto juegas de cada décimo (entero o una participación) y cuántos décimos tienes.",
    noscript: "Sin JavaScript verás el ejemplo de un décimo entero del Gordo; las tablas de abajo tienen todos los premios.",
    prize: "Premio",
    custom: "Otro importe",
    customPrize: "Premio de un décimo o billete entero",
    customPrizeHint: "Lo que paga el décimo entero, antes de impuestos.",
    customPrice: "Precio del décimo o billete",
    presetNote: (prize, unit, price, draw) => `${prize} por ${unit} de ${price}: ${draw}.`,
    played: "Lo que juegas de cada décimo",
    playedHint: (price, unit) => `${price} si tienes el ${unit} entero; si tu participación dice «juega 5 €», escribe 5.`,
    tickets: "Número de décimos",
    ticketsHint: "Del mismo premio. Cada décimo tiene sus propios 40.000 € exentos.",
    gross: "Premio bruto",
    exempt: "Exento",
    withholding: "Retención de Hacienda (20 %)",
    net: "Cobras",
    perTicket: (unit, net, withholding) => `Por cada ${unit}: cobras ${net} y Hacienda retiene ${withholding}.`,
    share: (share, exempt, whole, unit) => `Tienes el ${share} del ${unit}: te corresponden ${exempt} de sus ${whole} exentos.`,
    effective: (rate) => `Hacienda se queda el ${rate} de tu premio.`,
    noTax: "No pagas nada: el premio no pasa de la parte exenta.",
    invalid: {
      prize: "Escribe el premio de un décimo entero, en euros.",
      price: "Escribe el precio del décimo o billete, en euros.",
      played: "Escribe cuánto juegas de cada décimo, en euros.",
      "played-above-price": "Lo que juegas no puede ser más que el precio del décimo: escribe tu parte de un solo décimo.",
      tickets: "Escribe cuántos décimos tienes (de 1 a 1.000).",
    },
  },
  ca: {
    title: "Calculadora: quant et queda d'un premi de loteria",
    intro: "Tria el premi, digues quant jugues de cada dècim (sencer o una participació) i quants dècims tens.",
    noscript: "Sense JavaScript veuràs l'exemple d'un dècim sencer del Gordo; les taules de sota tenen tots els premis.",
    prize: "Premi",
    custom: "Un altre import",
    customPrize: "Premi d'un dècim o bitllet sencer",
    customPrizeHint: "El que paga el dècim sencer, abans d'impostos.",
    customPrice: "Preu del dècim o bitllet",
    presetNote: (prize, unit, price, draw) => `${prize} per ${unit} de ${price}: ${draw}.`,
    played: "El que jugues de cada dècim",
    playedHint: (price, unit) => `${price} si tens el ${unit} sencer; si la teva participació diu «juega 5 €», escriu 5.`,
    tickets: "Nombre de dècims",
    ticketsHint: "Del mateix premi. Cada dècim té els seus propis 40.000 € exempts.",
    gross: "Premi brut",
    exempt: "Exempt",
    withholding: "Retenció d'Hisenda (20 %)",
    net: "Cobres",
    perTicket: (unit, net, withholding) => `Per cada ${unit}: cobres ${net} i Hisenda reté ${withholding}.`,
    share: (share, exempt, whole, unit) => `Tens el ${share} del ${unit}: et corresponen ${exempt} dels seus ${whole} exempts.`,
    effective: (rate) => `Hisenda es queda el ${rate} del teu premi.`,
    noTax: "No pagues res: el premi no passa de la part exempta.",
    invalid: {
      prize: "Escriu el premi d'un dècim sencer, en euros.",
      price: "Escriu el preu del dècim o bitllet, en euros.",
      played: "Escriu quant jugues de cada dècim, en euros.",
      "played-above-price": "El que jugues no pot ser més que el preu del dècim: escriu la teva part d'un sol dècim.",
      tickets: "Escriu quants dècims tens (d'1 a 1.000).",
    },
  },
  en: {
    title: "Calculator: what you keep from a lottery prize",
    intro: "Pick the prize, say how much of each décimo you hold (the whole one or a share) and how many décimos you have.",
    noscript: "Without JavaScript you see the example of one whole El Gordo décimo; the tables below cover every prize.",
    prize: "Prize",
    custom: "Another amount",
    customPrize: "Prize of one whole décimo or ticket",
    customPrizeHint: "What the whole décimo pays, before tax.",
    customPrice: "Price of the décimo or ticket",
    presetNote: (prize, unit, price, draw) => `${prize} per ${price} ${unit}: ${draw}.`,
    played: "Your stake in each décimo",
    playedHint: (price, unit) => `${price} if you hold the whole ${unit}; if your share slip (participación) says «juega 5 €», type 5.`,
    tickets: "Number of décimos",
    ticketsHint: "Of the same prize. Each décimo has its own €40,000 tax-free.",
    gross: "Gross prize",
    exempt: "Tax-free",
    withholding: "Tax withheld (20%)",
    net: "You get",
    perTicket: (unit, net, withholding) => `Per ${unit}: you get ${net} and ${withholding} is withheld.`,
    share: (share, exempt, whole, unit) => `You hold ${share} of the ${unit}: ${exempt} of its ${whole} tax-free allowance is yours.`,
    effective: (rate) => `The tax office keeps ${rate} of your prize.`,
    noTax: "You pay nothing: the prize does not go over the tax-free part.",
    invalid: {
      prize: "Type the prize of one whole décimo, in euros.",
      price: "Type the price of the décimo or ticket, in euros.",
      played: "Type your stake in each décimo, in euros.",
      "played-above-price": "Your stake cannot be more than the décimo's price: type your share of a single décimo.",
      tickets: "Type how many décimos you have (1 to 1,000).",
    },
  },
};

/** The price of a draw's décimo or ticket. */
export function drawPrice(draw: DrawId): number {
  return DRAWS[draw].price;
}
