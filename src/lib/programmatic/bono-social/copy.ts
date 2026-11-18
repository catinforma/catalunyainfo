import { calcPath } from "@/lib/programmatic/calculators/paths";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

import type { Category, InvalidReason, Route, SpecialId, Tariff } from "./engine";
import { IPREM_14, type CapRow } from "./rules";

/**
 * Paths and words of the bono social eléctrico checker, small enough for the
 * browser (the client component imports this file, the engine and the rules;
 * nothing that reads data).
 *
 *   /es/calculadoras/bono-social-electrico/
 *   /ca/calculadores/bo-social-electric/
 *   /en/calculators/bono-social-electricity-spain/
 *
 * Numbers and dates in the rent-update module's words (same output in Node
 * and every browser).
 */

export type BsLocale = DateLocale;
export const BS_LOCALES: readonly BsLocale[] = ["es", "ca", "en"];

export function bonoSocialPath(locale: BsLocale): string {
  return calcPath("bono-social", locale);
}

export function bonoSocialEditions(): Record<BsLocale, string> {
  return { ca: bonoSocialPath("ca"), es: bonoSocialPath("es"), en: bonoSocialPath("en") };
}

export { elDay, euros, num, pct };

/** "12.600 €" with no decimals when whole, "1.250,50 €" otherwise; "€12,600" in English. */
export function money(n: number, locale: BsLocale): string {
  if (Math.abs(n - Math.round(n)) >= 0.005) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** A rate as a percentage: 0.425 → "42,5 %" / "42.5%". */
export function rate(r: number, locale: BsLocale): string {
  const p = Math.round(r * 1000) / 10;
  return pct(p, Number.isInteger(p) ? 0 : 1, locale);
}

/** "1.587 kWh" / "1,587 kWh". */
export function kwh(n: number, locale: BsLocale): string {
  return `${num(n, 0, locale)} kWh`;
}

/** A multiplier: 2.3 → "2,3" / "2.3". */
export function times(m: number, locale: BsLocale): string {
  return num(m, Number.isInteger(m) ? 0 : 1, locale);
}

export const CATEGORY_LABEL: Record<Category, Record<BsLocale, string>> = {
  none: { es: "No cumples los requisitos", ca: "No compleixes els requisits", en: "You do not qualify" },
  vulnerable: { es: "Consumidor vulnerable", ca: "Consumidor vulnerable", en: "Vulnerable consumer" },
  severe: { es: "Consumidor vulnerable severo", ca: "Consumidor vulnerable sever", en: "Severely vulnerable consumer" },
  exclusion: { es: "Consumidor en riesgo de exclusión social", ca: "Consumidor en risc d'exclusió social", en: "Consumer at risk of social exclusion" },
};

export const ROUTE_LABEL: Record<Route, Record<BsLocale, string>> = {
  income: { es: "por ingresos", ca: "per ingressos", en: "by income" },
  "large-family": { es: "por el título de familia numerosa", ca: "pel títol de família nombrosa", en: "by the large-family title" },
  "minimum-pension": { es: "por pensión mínima", ca: "per pensió mínima", en: "by minimum pension" },
  imv: { es: "por el ingreso mínimo vital", ca: "per l'ingrés mínim vital", en: "by the minimum living income (IMV)" },
};

export const SPECIAL_LABEL: Record<SpecialId, Record<BsLocale, string>> = {
  disability: { es: "Discapacidad reconocida igual o superior al 33 %", ca: "Discapacitat reconeguda igual o superior al 33 %", en: "Recognised disability of 33% or more" },
  "gender-violence": { es: "Víctima de violencia de género", ca: "Víctima de violència de gènere", en: "Victim of gender violence" },
  terrorism: { es: "Víctima de terrorismo", ca: "Víctima de terrorisme", en: "Victim of terrorism" },
  dependency: { es: "Dependencia reconocida de grado II o III", ca: "Dependència reconeguda de grau II o III", en: "Recognised dependency, grade II or III" },
  "single-parent": { es: "Familia monoparental: un solo progenitor con al menos un menor", ca: "Família monoparental: un sol progenitor amb almenys un menor", en: "Single-parent household: one parent with at least one minor" },
  "electro-dependency": { es: "Persona electrodependiente", ca: "Persona electrodependent", en: "Person dependent on electrical medical equipment (electrodependencia)" },
};

/** The Annex I row, in words. */
export const CAP_ROW_LABEL: Record<CapRow, Record<BsLocale, string>> = {
  "one-two": { es: "Una persona o dos", ca: "Una persona o dues", en: "One or two people" },
  three: {
    es: "Tres personas, dos con un menor o pensionistas de cuantía mínima",
    ca: "Tres persones, dues amb un menor o pensionistes de quantia mínima",
    en: "Three people, two with one minor, or minimum pensioners",
  },
  four: { es: "Cuatro personas o tres con dos menores", ca: "Quatre persones o tres amb dos menors", en: "Four people, or three with two minors" },
  five: {
    es: "Cinco o más personas, cuatro con tres menores o familia numerosa",
    ca: "Cinc o més persones, quatre amb tres menors o família nombrosa",
    en: "Five or more people, four with three minors, or a large family",
  },
};

export const TARIFF_LABEL: Record<Tariff, Record<BsLocale, string>> = {
  pvpc: { es: "PVPC (tarifa regulada) con una comercializadora de referencia", ca: "PVPC (tarifa regulada) amb una comercialitzadora de referència", en: "PVPC (regulated tariff) with a reference supplier" },
  free: { es: "Mercado libre (cualquier otra oferta)", ca: "Mercat lliure (qualsevol altra oferta)", en: "Free market (any other offer)" },
  unsure: { es: "No lo sé", ca: "No ho sé", en: "I don't know" },
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  household: string;
  adults: string;
  adultsHint: string;
  minors: string;
  income: string;
  incomeHint: string;
  situation: string;
  largeFamily: string;
  minimumPension: string;
  imv: string;
  specialLegend: string;
  specialHint: string;
  socialServices: string;
  tariff: string;
  tariffHint: string;
  result: string;
  discount2026: string;
  discount2027: string;
  limitVulnerable: string;
  limitSevere: string;
  cap: string;
  capValue: (yearly: string, monthly: string) => string;
  qualifiesBy: (routes: string) => string;
  multiplier: (m: string) => string;
  severityUnknown: string;
  notEligible: (limit: string) => string;
  exclusion: string;
  socialServicesIgnored: string;
  needsPvpc: string;
  needsPvpcUnsure: string;
  onPvpc: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<BsLocale, CalcCopy> = {
  es: {
    title: "Calculadora: ¿tienes derecho al bono social eléctrico?",
    intro: "Indica quién vive en casa, los ingresos anuales de todos y tu situación. El resultado dice si cumples los requisitos, con qué descuento y hasta cuántos kWh.",
    noscript: "Sin JavaScript verás el ejemplo de dos adultos y dos menores con 20.000 € al año; las tablas de abajo tienen los límites de todos los hogares.",
    household: "Tu hogar",
    adults: "Adultos (con el titular)",
    adultsHint: "Mayores de edad de tu unidad de convivencia: pareja y familiares hasta segundo grado que viven contigo.",
    minors: "Menores de edad",
    income: "Ingresos anuales del hogar",
    incomeHint: "Suma de la base imponible general y del ahorro de la última declaración de la renta de todos. Déjalo vacío si cumples por familia numerosa, pensión mínima o IMV.",
    situation: "Tu situación",
    largeFamily: "Tenemos título de familia numerosa en vigor",
    minimumPension: "Todos los que tienen ingresos cobran la pensión mínima de jubilación o incapacidad permanente (y menos de 500 € al año de otros ingresos)",
    imv: "Alguien del hogar cobra el ingreso mínimo vital",
    specialLegend: `Circunstancias especiales (suman ${money(IPREM_14, "es")} al límite)`,
    specialHint: "Cuenta una sola vez aunque se den varias.",
    socialServices: "Los servicios sociales de mi comunidad o ayuntamiento pagan al menos la mitad de mi factura de la luz",
    tariff: "Tarifa de luz que tienes ahora",
    tariffHint: "Mira tu factura: el PVPC lo vende solo una comercializadora de referencia (la lista está más abajo).",
    result: "Resultado",
    discount2026: "Descuento hasta el 31 de diciembre de 2026",
    discount2027: "Desde el 1 de enero de 2027, si no se prorroga",
    limitVulnerable: "Límite de ingresos para vulnerable",
    limitSevere: "Límite para vulnerable severo",
    cap: "Energía con descuento",
    capValue: (yearly, monthly) => `${yearly} al año (unos ${monthly} al mes)`,
    qualifiesBy: (routes) => `Cumples ${routes}.`,
    multiplier: (m) => `Tu límite de ingresos es ${m} veces el IPREM de 14 pagas (${money(IPREM_14, "es")}).`,
    severityUnknown: "Para saber si eres vulnerable severo, escribe los ingresos del hogar.",
    notEligible: (limit) => `Con estos ingresos no cumples el requisito de renta: el límite de tu hogar es ${limit} al año. Revisa si tenéis familia numerosa, pensión mínima, IMV o alguna circunstancia especial.`,
    exclusion: "No pagas la factura: la cubren los servicios sociales (al menos el 50 %) y el resto lo financian las empresas eléctricas. Tampoco te pueden cortar la luz.",
    socialServicesIgnored: "La ayuda de los servicios sociales solo te convierte en consumidor en riesgo de exclusión social si eres vulnerable severo.",
    needsPvpc: "Cumples los requisitos, pero el bono social solo se aplica en el PVPC: al pedirlo, la comercializadora de referencia te pasa al PVPC, gratis si mantienes la potencia.",
    needsPvpcUnsure: "Comprueba en tu factura si tienes el PVPC con una comercializadora de referencia: si no, al pedir el bono social te cambian a él, gratis si mantienes la potencia.",
    onPvpc: "Ya tienes el PVPC: pide el bono social a tu comercializadora de referencia.",
    invalid: {
      adults: "Escribe cuántos adultos sois, del 1 al 20 (cuenta al titular del contrato).",
      minors: "Escribe cuántos menores hay, del 0 al 20 (en total no más de 20 personas).",
      income: "Escribe los ingresos anuales en euros, sin signo negativo.",
      "income-needed": "Escribe los ingresos anuales del hogar, o marca si tenéis familia numerosa, pensión mínima o IMV.",
      "single-parent": "La familia monoparental necesita al menos un menor: añádelo en «Menores de edad».",
    },
  },
  ca: {
    title: "Calculadora: tens dret al bo social elèctric?",
    intro: "Indica qui viu a casa, els ingressos anuals de tothom i la teva situació. El resultat diu si compleixes els requisits, amb quin descompte i fins a quants kWh.",
    noscript: "Sense JavaScript veuràs l'exemple de dos adults i dos menors amb 20.000 € l'any; les taules de sota tenen els límits de totes les llars.",
    household: "La teva llar",
    adults: "Adults (amb el titular)",
    adultsHint: "Majors d'edat de la teva unitat de convivència: parella i familiars fins a segon grau que viuen amb tu.",
    minors: "Menors d'edat",
    income: "Ingressos anuals de la llar",
    incomeHint: "Suma de la base imposable general i de l'estalvi de l'última declaració de la renda de tothom. Deixa-ho buit si compleixes per família nombrosa, pensió mínima o IMV.",
    situation: "La teva situació",
    largeFamily: "Tenim títol de família nombrosa vigent",
    minimumPension: "Tots els qui tenen ingressos cobren la pensió mínima de jubilació o d'incapacitat permanent (i menys de 500 € l'any d'altres ingressos)",
    imv: "Algú de la llar cobra l'ingrés mínim vital",
    specialLegend: `Circumstàncies especials (sumen ${money(IPREM_14, "ca")} al límit)`,
    specialHint: "Compta una sola vegada encara que se'n donin diverses.",
    socialServices: "Els serveis socials de la meva comunitat o ajuntament paguen almenys la meitat de la meva factura de la llum",
    tariff: "Tarifa de llum que tens ara",
    tariffHint: "Mira la factura: el PVPC només el ven una comercialitzadora de referència (la llista és més avall).",
    result: "Resultat",
    discount2026: "Descompte fins al 31 de desembre de 2026",
    discount2027: "Des de l'1 de gener de 2027, si no es prorroga",
    limitVulnerable: "Límit d'ingressos per a vulnerable",
    limitSevere: "Límit per a vulnerable sever",
    cap: "Energia amb descompte",
    capValue: (yearly, monthly) => `${yearly} l'any (uns ${monthly} al mes)`,
    qualifiesBy: (routes) => `Compleixes ${routes}.`,
    multiplier: (m) => `El teu límit d'ingressos és ${m} vegades l'IPREM de 14 pagues (${money(IPREM_14, "ca")}).`,
    severityUnknown: "Per saber si ets vulnerable sever, escriu els ingressos de la llar.",
    notEligible: (limit) => `Amb aquests ingressos no compleixes el requisit de renda: el límit de la teva llar és ${limit} l'any. Revisa si teniu família nombrosa, pensió mínima, IMV o alguna circumstància especial.`,
    exclusion: "No pagues la factura: la cobreixen els serveis socials (almenys el 50 %) i la resta la financen les empreses elèctriques. Tampoc no et poden tallar la llum.",
    socialServicesIgnored: "L'ajuda dels serveis socials només et converteix en consumidor en risc d'exclusió social si ets vulnerable sever.",
    needsPvpc: "Compleixes els requisits, però el bo social només s'aplica al PVPC: quan el demanes, la comercialitzadora de referència et passa al PVPC, de franc si mantens la potència.",
    needsPvpcUnsure: "Comprova a la factura si tens el PVPC amb una comercialitzadora de referència: si no, quan demanis el bo social et canvien a aquesta tarifa, de franc si mantens la potència.",
    onPvpc: "Ja tens el PVPC: demana el bo social a la teva comercialitzadora de referència.",
    invalid: {
      adults: "Escriu quants adults sou, de l'1 al 20 (compta el titular del contracte).",
      minors: "Escriu quants menors hi ha, del 0 al 20 (en total no més de 20 persones).",
      income: "Escriu els ingressos anuals en euros, sense signe negatiu.",
      "income-needed": "Escriu els ingressos anuals de la llar, o marca si teniu família nombrosa, pensió mínima o IMV.",
      "single-parent": "La família monoparental necessita almenys un menor: afegeix-lo a «Menors d'edat».",
    },
  },
  en: {
    title: "Checker: do you qualify for Spain's bono social for electricity?",
    intro: "Say who lives at home, everyone's yearly income and your situation. The result says whether you qualify, at what discount and for how many kWh.",
    noscript: "Without JavaScript you see the example of two adults and two minors on €20,000 a year; the tables below give every household's limits.",
    household: "Your household",
    adults: "Adults (including the contract holder)",
    adultsHint: "Adults in your household (unidad de convivencia): partner and relatives up to the second degree who live with you.",
    minors: "Minors (under 18)",
    income: "Household yearly income",
    incomeHint: "Everyone's general plus savings taxable base on the last income tax return, added up. Leave it empty if you qualify by large family, minimum pension or IMV.",
    situation: "Your situation",
    largeFamily: "We hold a valid large-family title (familia numerosa)",
    minimumPension: "Everyone with income gets the minimum retirement or permanent incapacity pension (and under €500 a year of other income)",
    imv: "Someone in the household gets the minimum living income (IMV)",
    specialLegend: `Special circumstances (add ${money(IPREM_14, "en")} to the limit)`,
    specialHint: "Counts once, however many apply.",
    socialServices: "My region's or town council's social services pay at least half of my electricity bill",
    tariff: "Your electricity tariff now",
    tariffHint: "Check your bill: only a reference supplier sells the PVPC (the list is further down).",
    result: "Result",
    discount2026: "Discount until 31 December 2026",
    discount2027: "From 1 January 2027, unless extended",
    limitVulnerable: "Income limit for vulnerable",
    limitSevere: "Limit for severely vulnerable",
    cap: "Energy with the discount",
    capValue: (yearly, monthly) => `${yearly} a year (about ${monthly} a month)`,
    qualifiesBy: (routes) => `You qualify ${routes}.`,
    multiplier: (m) => `Your income limit is ${m} times the 14-payment IPREM (${money(IPREM_14, "en")}).`,
    severityUnknown: "To know whether you are severely vulnerable, type the household's income.",
    notEligible: (limit) => `With this income you do not meet the income test: your household's limit is ${limit} a year. Check whether you have a large-family title, a minimum pension, the IMV or a special circumstance.`,
    exclusion: "You pay nothing: social services cover at least 50% of the bill and the electricity companies fund the rest. Your supply cannot be cut off either.",
    socialServicesIgnored: "Help from social services only makes you a consumer at risk of social exclusion if you are severely vulnerable.",
    needsPvpc: "You qualify, but the bono social only applies on the PVPC: when you apply, the reference supplier moves you to it, free of charge if you keep the same contracted power.",
    needsPvpcUnsure: "Check your bill for the PVPC with a reference supplier: if not, applying for the bono social moves you to it, free of charge if you keep the same contracted power.",
    onPvpc: "You are already on the PVPC: apply to your reference supplier.",
    invalid: {
      adults: "Type how many adults there are, from 1 to 20 (count the contract holder).",
      minors: "Type how many minors there are, from 0 to 20 (no more than 20 people in all).",
      income: "Type the yearly income in euros, with no minus sign.",
      "income-needed": "Type the household's yearly income, or tick large family, minimum pension or IMV.",
      "single-parent": "A single-parent household needs at least one minor: add it under «Minors».",
    },
  },
};
