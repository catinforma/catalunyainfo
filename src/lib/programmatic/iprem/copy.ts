import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num } from "@/lib/programmatic/rent-update/copy";
import { bareDay, money } from "@/lib/programmatic/smi/copy";

import type { LimitId, Payments } from "./engine";
import { IPREM_14, IPREM_ANNUAL } from "./rules";

/**
 * Paths and words of "IPREM 2026", small enough for the browser:
 *
 *   /es/calculadoras/iprem/
 *   /ca/calculadores/iprem/
 *   /en/calculators/iprem-spain/
 *
 * Slugs from the calculators registry (no year in them: the page carries
 * each year's figures at the same URL); numbers and dates in the
 * rent-update and SMI modules' words (same output in Node and browsers).
 */

export type IpremLocale = DateLocale;
export const IPREM_LOCALES: readonly IpremLocale[] = ["es", "ca", "en"];

export const IPREM_SLUG: Record<IpremLocale, string> = calculatorSlugs("iprem");

export function ipremPath(locale: IpremLocale): string {
  return calcPath("iprem", locale);
}

export function ipremEditions(): Record<IpremLocale, string> {
  return { es: ipremPath("es"), ca: ipremPath("ca"), en: ipremPath("en") };
}

export { bareDay, elDay, euros, money, num };

/** "1,5" / "1.5"; up to two decimals, no trailing zeros. */
export function times(n: number, locale: IpremLocale): string {
  const r = Math.round(n * 100) / 100;
  const decimals = Number.isInteger(r) ? 0 : Number.isInteger(r * 10) ? 1 : 2;
  return num(r, decimals, locale);
}

/* -------------------------------------------------------------------------- */
/* Labels shared by the page and the calculator                               */
/* -------------------------------------------------------------------------- */

export const PAYMENTS_LABEL: Record<IpremLocale, Record<`${Payments}`, string>> = {
  es: { "12": "12 pagas", "14": "14 pagas" },
  ca: { "12": "12 pagues", "14": "14 pagues" },
  en: { "12": "12 payments", "14": "14 payments" },
};

export const LIMIT_LABEL: Record<LimitId, Record<IpremLocale, string>> = {
  "bono-social-alone": { es: "Bono social eléctrico, persona sola", ca: "Bo social elèctric, persona sola", en: "Bono social (electricity), one person alone" },
  "legal-aid-alone": { es: "Justicia gratuita, sin unidad familiar", ca: "Justícia gratuïta, sense unitat familiar", en: "Free legal aid, no family unit" },
  "legal-aid-under4": { es: "Justicia gratuita, unidad familiar de 2 o 3", ca: "Justícia gratuïta, unitat familiar de 2 o 3", en: "Free legal aid, family unit of 2 or 3" },
  "legal-aid-from4": { es: "Justicia gratuita, 4 o más o familia numerosa", ca: "Justícia gratuïta, 4 o més o família nombrosa", en: "Free legal aid, 4 or more or large family" },
  "housing-rent": { es: "Ayuda al alquiler del Plan Estatal de Vivienda (general)", ca: "Ajut al lloguer del Pla Estatal d'Habitatge (general)", en: "State Housing Plan rent aid (general)" },
  "legal-aid-exceptional": { es: "Justicia gratuita excepcional (art. 5)", ca: "Justícia gratuïta excepcional (art. 5)", en: "Free legal aid, exceptional (art. 5)" },
};

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface IpremCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  multiple: string;
  multipleHint: string;
  payments: string;
  paymentOptions: Record<`${Payments}`, string>;
  yearly: (p: Payments) => string;
  other: (p: Payments) => string;
  monthly: string;
  daily: string;
  invalidMultiple: string;
  incomeTitle: string;
  income: string;
  incomeHint: string;
  ratio: (p: Payments, base: string) => string;
  compare: string;
  compareCols: [string, string, string];
  within: string;
  above: string;
  compareNote: string;
  invalidIncome: string;
}

export const CALC_COPY: Record<IpremLocale, IpremCalcCopy> = {
  es: {
    title: "Calcula con el IPREM de 2026",
    intro: "Cada norma dice cuántas veces el IPREM y si es el de 12 o el de 14 pagas. Escribe el múltiplo para ver el importe, o tus ingresos para ver cuántas veces el IPREM son.",
    noscript: "Sin JavaScript verás 1,5 veces el IPREM en 14 pagas y unos ingresos de 12.000 € al año.",
    multiple: "Veces el IPREM",
    multipleHint: "Por ejemplo 1,5, 2 o 2,5.",
    payments: "IPREM anual de",
    paymentOptions: { "12": `12 pagas (${money(IPREM_ANNUAL, "es")})`, "14": `14 pagas (${money(IPREM_14, "es")})` },
    yearly: (p) => `Al año, IPREM de ${p} pagas`,
    other: (p) => `Al año, IPREM de ${p} pagas`,
    monthly: "Al mes (IPREM mensual)",
    daily: "Al día (IPREM diario)",
    invalidMultiple: "Escribe un múltiplo mayor que 0 (hasta 100).",
    incomeTitle: "¿Cuántas veces el IPREM son mis ingresos?",
    income: "Ingresos al año (€)",
    incomeHint: "Los que cuente la norma: cada una dice cuáles (por ejemplo, la base imponible del IRPF) y de quién (tú solo o todo el hogar).",
    ratio: (p, base) => `Veces el IPREM de ${p} pagas (${base})`,
    compare: "Frente a límites habituales",
    compareCols: ["Límite", "Importe", "Tus ingresos"],
    within: "Dentro",
    above: "Por encima",
    compareNote: "Orientativo: cada ayuda tiene más requisitos y cuenta los ingresos a su manera. El bono social y la justicia gratuita suben con el tamaño del hogar.",
    invalidIncome: "Escribe unos ingresos de 0 € o más.",
  },
  ca: {
    title: "Calcula amb l'IPREM del 2026",
    intro: "Cada norma diu quantes vegades l'IPREM i si és el de 12 o el de 14 pagues. Escriu el múltiple per veure l'import, o els teus ingressos per veure quantes vegades l'IPREM són.",
    noscript: "Sense JavaScript veuràs 1,5 vegades l'IPREM en 14 pagues i uns ingressos de 12.000 € l'any.",
    multiple: "Vegades l'IPREM",
    multipleHint: "Per exemple 1,5, 2 o 2,5.",
    payments: "IPREM anual de",
    paymentOptions: { "12": `12 pagues (${money(IPREM_ANNUAL, "ca")})`, "14": `14 pagues (${money(IPREM_14, "ca")})` },
    yearly: (p) => `L'any, IPREM de ${p} pagues`,
    other: (p) => `L'any, IPREM de ${p} pagues`,
    monthly: "Al mes (IPREM mensual)",
    daily: "Al dia (IPREM diari)",
    invalidMultiple: "Escriu un múltiple més gran que 0 (fins a 100).",
    incomeTitle: "Quantes vegades l'IPREM són els meus ingressos?",
    income: "Ingressos l'any (€)",
    incomeHint: "Els que compti la norma: cadascuna diu quins (per exemple, la base imposable de l'IRPF) i de qui (tu sol o tota la llar).",
    ratio: (p, base) => `Vegades l'IPREM de ${p} pagues (${base})`,
    compare: "Davant de límits habituals",
    compareCols: ["Límit", "Import", "Els teus ingressos"],
    within: "Dins",
    above: "Per sobre",
    compareNote: "Orientatiu: cada ajut té més requisits i compta els ingressos a la seva manera. El bo social i la justícia gratuïta pugen amb la mida de la llar.",
    invalidIncome: "Escriu uns ingressos de 0 € o més.",
  },
  en: {
    title: "Work it out with the 2026 IPREM",
    intro: "Each rule says how many times the IPREM and whether it is the 12- or the 14-payment one. Type the multiple to see the amount, or your income to see how many times the IPREM it is.",
    noscript: "Without JavaScript you see 1.5 times the 14-payment IPREM and an income of €12,000 a year.",
    multiple: "Times the IPREM",
    multipleHint: "For example 1.5, 2 or 2.5.",
    payments: "Yearly IPREM of",
    paymentOptions: { "12": `12 payments (${money(IPREM_ANNUAL, "en")})`, "14": `14 payments (${money(IPREM_14, "en")})` },
    yearly: (p) => `A year, ${p}-payment IPREM`,
    other: (p) => `A year, ${p}-payment IPREM`,
    monthly: "A month (monthly IPREM)",
    daily: "A day (daily IPREM)",
    invalidMultiple: "Type a multiple above 0 (up to 100).",
    incomeTitle: "How many times the IPREM is my income?",
    income: "Yearly income (€)",
    incomeHint: "The income the rule counts: each one says which (for example the income tax base) and whose (yours alone or the whole household's).",
    ratio: (p, base) => `Times the ${p}-payment IPREM (${base})`,
    compare: "Against common limits",
    compareCols: ["Limit", "Amount", "Your income"],
    within: "Within",
    above: "Above",
    compareNote: "A guide only: each benefit has more requirements and counts income its own way. The bono social and legal aid limits rise with household size.",
    invalidIncome: "Type an income of €0 or more.",
  },
};
