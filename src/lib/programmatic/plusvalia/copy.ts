import { calcPath } from "@/lib/programmatic/calculators/paths";
import { caDayArticle, dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";

import type { InvalidReason, Kind, PvNote } from "./engine";
import { DEADLINE, MAX_BONUS, MAX_RATE, type TableId } from "./rules";

/**
 * Paths and words of the plusvalía municipal calculator, small enough for
 * the browser (the client component imports this file, the engine and the
 * rules; nothing that reads data).
 *
 *   /es/calculadoras/plusvalia-municipal/
 *   /ca/calculadores/plusvalua-municipal/
 *   /en/calculators/spain-plusvalia-tax/
 */

export type PvLocale = DateLocale;
export const PV_LOCALES: readonly PvLocale[] = ["ca", "es", "en"];

export function pvPath(locale: PvLocale): string {
  return calcPath("plusvalia", locale);
}

export function pvEditions(): Record<PvLocale, string> {
  return { ca: pvPath("ca"), es: pvPath("es"), en: pvPath("en") };
}

export { elDay, euros, num, pct };

/** "120.000 €" with no decimals when whole, "1.620,50 €" otherwise; "€120,000" in English. */
export function money(n: number, locale: PvLocale): string {
  if (Math.abs(n - Math.round(n)) >= 0.005) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** "30 %" / "30%", with decimals only when needed. */
export function percent(p: number, locale: PvLocale): string {
  return pct(p, Math.abs(p - Math.round(p)) < 0.005 ? 0 : 2, locale);
}

/** A coefficient as the BOE prints it ("0,09"); a prorated one with up to four decimals ("0,1275"). */
export function coef(n: number, locale: PvLocale): string {
  const two = Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
  return num(n, two ? 2 : 4, locale);
}

/** "TRLRHL, art. 107.4": the texto refundido de la Ley Reguladora de las Haciendas Locales. */
export function art(article: string): string {
  return `TRLRHL, art. ${article}`;
}

/** "desde el 1 de diciembre de 2026" / "des de l'1 de desembre de 2026" / "from 1 December 2026". */
export function fromDay(iso: string, locale: PvLocale): string {
  const d = dayMonthYear(iso, locale);
  if (locale === "ca") return caDayArticle(iso) === "l'" ? `des de l'${d}` : `des del ${d}`;
  return locale === "es" ? `desde el ${d}` : `from ${d}`;
}

/** "hasta el 30 de noviembre de 2026" / "fins al 30 de novembre de 2026" / "until 30 November 2026". */
export function untilDay(iso: string, locale: PvLocale): string {
  const d = dayMonthYear(iso, locale);
  if (locale === "ca") return caDayArticle(iso) === "l'" ? `fins a l'${d}` : `fins al ${d}`;
  return locale === "es" ? `hasta el ${d}` : `until ${d}`;
}

/** The norm of each maximum-coefficient table, short. */
export const TABLE_LABEL: Record<TableId, Record<PvLocale, string>> = {
  "rdl8-2023": { ca: "RDL 8/2023", es: "RDL 8/2023", en: "RDL 8/2023" },
  "rdl9-2024": { ca: "RDL 9/2024, derogat", es: "RDL 9/2024, derogado", en: "RDL 9/2024, later derogated" },
  "rdl16-2025": { ca: "RDL 16/2025, derogat", es: "RDL 16/2025, derogado", en: "RDL 16/2025, later derogated" },
  "rdl29-2026": { ca: "RDL 29/2026", es: "RDL 29/2026", en: "RDL 29/2026" },
};

export const KIND_LABEL: Record<Kind, Record<PvLocale, string>> = {
  sale: { ca: "Venda (o altra transmissió onerosa)", es: "Venta (u otra transmisión onerosa)", en: "Sale (or other transfer for value)" },
  inheritance: { ca: "Herència", es: "Herencia", en: "Inheritance" },
  gift: { ca: "Donació", es: "Donación", en: "Gift" },
};

/** Who pays (art. 106) and, for gifts, who must also tell the council (art. 110.6). */
export const WHO_PAYS: Record<Kind, Record<PvLocale, string>> = {
  sale: {
    ca: "Paga qui ven (art. 106.1.b). Si és una persona física no resident a Espanya, paga qui compra, com a substitut (art. 106.2).",
    es: "Paga quien vende (art. 106.1.b). Si es una persona física no residente en España, paga quien compra, como sustituto (art. 106.2).",
    en: "The seller pays (art. 106.1.b). If the seller is an individual not resident in Spain, the buyer pays as a substitute (art. 106.2).",
  },
  inheritance: {
    ca: "Paga qui hereta (art. 106.1.a).",
    es: "Paga quien hereda (art. 106.1.a).",
    en: "The heir pays (art. 106.1.a).",
  },
  gift: {
    ca: "Paga qui rep la donació (art. 106.1.a); qui la fa també l'ha de comunicar a l'ajuntament (art. 110.6.a).",
    es: "Paga quien recibe la donación (art. 106.1.a); quien dona también tiene que comunicarla al ayuntamiento (art. 110.6.a).",
    en: "The person receiving the gift pays (art. 106.1.a); the donor must also notify the council (art. 110.6.a).",
  },
};

/** The filing deadline counted from the devengo (art. 110.2). */
export function deadlineText(kind: Kind, devengo: string, locale: PvLocale): string {
  const from = fromDay(devengo, locale);
  if (kind === "inheritance") {
    return {
      ca: `Termini: ${DEADLINE.mortisCausaMonths} mesos ${from}, prorrogables fins a un any si ho demanes (art. 110.2.b).`,
      es: `Plazo: ${DEADLINE.mortisCausaMonths} meses ${from}, prorrogables hasta un año si lo pides (art. 110.2.b).`,
      en: `Deadline: ${DEADLINE.mortisCausaMonths} months ${from}, extendable to one year if you ask (art. 110.2.b).`,
    }[locale];
  }
  return {
    ca: `Termini: ${DEADLINE.interVivosWorkingDays} dies hàbils ${from} (art. 110.2.a).`,
    es: `Plazo: ${DEADLINE.interVivosWorkingDays} días hábiles ${from} (art. 110.2.a).`,
    en: `Deadline: ${DEADLINE.interVivosWorkingDays} working days ${from} (art. 110.2.a).`,
  }[locale];
}

/** "14 anys" / "9 meses" / "less than a month". */
export function periodText(years: number, months: number, locale: PvLocale): string {
  if (years >= 1) return { ca: years === 1 ? "1 any" : `${years} anys`, es: years === 1 ? "1 año" : `${years} años`, en: years === 1 ? "1 year" : `${years} years` }[locale];
  if (months >= 1) return { ca: months === 1 ? "1 mes" : `${months} mesos`, es: months === 1 ? "1 mes" : `${months} meses`, en: months === 1 ? "1 month" : `${months} months` }[locale];
  return { ca: "menys d'un mes", es: "menos de un mes", en: "less than a month" }[locale];
}

/** The table's row label: "Inferior a 1 año", "1 año" … "Igual o superior a 20 años". */
export function rowLabel(index: number, locale: PvLocale): string {
  if (index === 0) return { ca: "Menys d'1 any", es: "Inferior a 1 año", en: "Under 1 year" }[locale];
  if (index >= 20) return { ca: "20 anys o més", es: "Igual o superior a 20 años", en: "20 years or more" }[locale];
  return periodText(index, 0, locale);
}

export const NOTE_TEXT: Record<PvNote, Record<PvLocale, string>> = {
  "council-above-max": {
    ca: "El coeficient que has escrit supera el màxim legal per a aquesta data: s'aplica directament el màxim fins que l'ordenança es corregeixi (art. 107.4).",
    es: "El coeficiente que has escrito supera el máximo legal para esta fecha: se aplica directamente el máximo hasta que la ordenanza se corrija (art. 107.4).",
    en: "The coefficient you typed is above the legal maximum for this date: the maximum applies directly until the ordinance is corrected (art. 107.4).",
  },
  "derogated-window": {
    ca: "En aquesta data regien els coeficients d'un reial decret llei que el Congrés va derogar després (el RDL 9/2024 fins al 22 de gener de 2025; el RDL 16/2025 fins al 27 de gener de 2026). La calculadora els aplica: confirma-ho amb el teu ajuntament.",
    es: "En esta fecha regían los coeficientes de un real decreto-ley que el Congreso derogó después (el RDL 9/2024 hasta el 22 de enero de 2025; el RDL 16/2025 hasta el 27 de enero de 2026). La calculadora los aplica: confírmalo con tu ayuntamiento.",
    en: "On this date the coefficients of a decree-law later derogated by Congress were in force (RDL 9/2024 until 22 January 2025; RDL 16/2025 until 27 January 2026). The calculator applies them: check with your council.",
  },
  "future-table": {
    ca: "Per a dates des de l'1 de gener de 2027 es fa servir la taula del RDL 29/2026, la vigent avui. L'art. 107.4 preveu actualitzar-la cada any per una norma amb rang de llei; a 19 de novembre de 2026 no se n'ha publicat cap per al 2027.",
    es: "Para fechas desde el 1 de enero de 2027 se usa la tabla del RDL 29/2026, la vigente hoy. El art. 107.4 prevé actualizarla cada año por norma con rango de ley; a 19 de noviembre de 2026 no se ha publicado ninguna para 2027.",
    en: "For dates from 1 January 2027 the calculator uses the RDL 29/2026 table, the one in force today. Art. 107.4 says it is updated every year by a norm with the rank of law; as of 19 November 2026 none has been published for 2027.",
  },
  "under-month": {
    ca: "Amb menys d'un mes complet no hi ha mesos per prorratejar: el coeficient és 0.",
    es: "Con menos de un mes completo no hay meses que prorratear: el coeficiente es 0.",
    en: "With less than one full month there are no months to prorate: the coefficient is 0.",
  },
  "capped-20": {
    ca: "El període compta com a màxim 20 anys (art. 107.1): s'aplica el coeficient de «20 anys o més».",
    es: "El periodo cuenta como máximo 20 años (art. 107.1): se aplica el coeficiente de «20 años o más».",
    en: "The period counts at most 20 years (art. 107.1): the “20 years or more” coefficient applies.",
  },
  "real-missing": {
    ca: "Per comparar-ho amb l'increment real, afegeix el valor cadastral total i els dos valors (d'adquisició i de transmissió).",
    es: "Para compararlo con el incremento real, añade el valor catastral total y los dos valores (de adquisición y de transmisión).",
    en: "To compare with the real gain, add the total cadastral value and both values (acquisition and transfer).",
  },
  "no-gain": {
    ca: "No hi ha increment de valor: la transmissió no està subjecta (art. 104.5). L'has de declarar igualment a l'ajuntament, amb els títols de l'adquisició i de la transmissió.",
    es: "No hay incremento de valor: la transmisión no está sujeta (art. 104.5). Tienes que declararla igualmente en el ayuntamiento, con los títulos de la adquisición y de la transmisión.",
    en: "There is no increase in value: the transfer is not subject to the tax (art. 104.5). You must still declare it to the council, with the acquisition and transfer deeds.",
  },
  "real-lower": {
    ca: "L'increment real és més baix que la base objectiva: pots demanar que sigui la base (art. 107.5).",
    es: "El incremento real es menor que la base objetiva: puedes pedir que sea la base (art. 107.5).",
    en: "The real gain is below the objective base: you can ask for it to be the base (art. 107.5).",
  },
  "bonus-inheritance-only": {
    ca: "La bonificació de l'art. 108.4 només és per a herències: no s'aplica a vendes ni donacions.",
    es: "La bonificación del art. 108.4 es solo para herencias: no se aplica a ventas ni donaciones.",
    en: "The art. 108.4 rebate is for inheritances only: it does not apply to sales or gifts.",
  },
};

export interface PvCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  kind: string;
  acquired: Record<Kind, string>;
  acquiredHint: string;
  transferred: Record<Kind, string>;
  transferredHint: string;
  land: string;
  landHint: string;
  total: string;
  totalHint: string;
  share: string;
  shareHint: string;
  realLegend: string;
  acquisitionValue: string;
  acquisitionHint: string;
  transferValue: string;
  transferHint: string;
  councilLegend: string;
  rate: string;
  rateHint: string;
  coefficient: string;
  coefficientHint: (max: string) => string;
  bonus: string;
  bonusHint: string;
  invalid: Record<InvalidReason, string>;
  toPay: string;
  notSubject: string;
  period: string;
  maxCoefficient: (norm: string) => string;
  coefficientApplied: string;
  objectiveTitle: string;
  realTitle: string;
  landLine: string;
  base: string;
  cuotaIntegra: (rate: string) => string;
  bonusLine: (p: string) => string;
  cuotaLiquida: string;
  landRatio: string;
  realGain: string;
  chosenObjective: string;
  chosenReal: string;
  workingDaysLink: string;
}

export const CALC_COPY: Record<PvLocale, PvCalcCopy> = {
  es: {
    title: "Calcula tu plusvalía municipal",
    intro: "Escribe las fechas, el valor catastral del suelo y el tipo de tu ayuntamiento. Si añades los dos precios y el valor catastral total, la calculadora compara el método objetivo con el del incremento real y te dice cuál es menor.",
    noscript: "Sin JavaScript se muestra el ejemplo calculado en el servidor; para calcular con tus datos hace falta JavaScript.",
    kind: "Tipo de transmisión",
    acquired: { sale: "Fecha en que lo adquiriste", inheritance: "Fecha en que lo adquirió la persona fallecida", gift: "Fecha en que lo adquirió quien lo dona" },
    acquiredHint: "La compra, herencia o donación anterior: desde ahí cuentan los años (art. 107.4).",
    transferred: { sale: "Fecha de la venta (escritura)", inheritance: "Fecha del fallecimiento", gift: "Fecha de la donación" },
    transferredHint: "Es el devengo (art. 109.1.a): decide la tabla de coeficientes y el plazo.",
    land: "Valor catastral del suelo",
    landHint: "De todo el inmueble, el que tiene a efectos del IBI en la fecha de la transmisión (art. 107.2.a). Si tu ordenanza aplica un coeficiente reductor o la reducción tras una revisión catastral, escribe el valor ya reducido.",
    total: "Valor catastral total (suelo y construcción)",
    totalHint: "Opcional: hace falta para el método real, porque da la parte del precio que corresponde al suelo (art. 104.5).",
    share: "Tu parte del inmueble",
    shareHint: "Si el inmueble es de varias personas, cada una declara su parte.",
    realLegend: "Método del incremento real (opcional)",
    acquisitionValue: "Valor de adquisición",
    acquisitionHint: "De todo el inmueble: el precio de la escritura o, si se heredó o se recibió como donación, el valor declarado en sucesiones o donaciones. Sin gastos ni impuestos (art. 104.5).",
    transferValue: "Valor de transmisión",
    transferHint: "De todo el inmueble: el precio de venta de la escritura, o el valor declarado en sucesiones o donaciones.",
    councilLegend: "Lo que fija tu ayuntamiento",
    rate: "Tipo de gravamen",
    rateHint: `El de tu ordenanza fiscal, como máximo el ${MAX_RATE} % (art. 108.1). En Barcelona, el 30 %.`,
    coefficient: "Coeficiente de tu ordenanza (opcional)",
    coefficientHint: (max) => `Vacío: el máximo legal (${max} para este periodo). Si tu ordenanza fija uno más bajo, escríbelo; para menos de un año, el anual: se prorratea por meses.`,
    bonus: "Bonificación de tu ayuntamiento",
    bonusHint: `Hasta el ${MAX_BONUS} % en herencias a descendientes, cónyuge o ascendientes, si tu ordenanza la regula y cumples sus condiciones (art. 108.4).`,
    invalid: {
      dates: "Escribe las dos fechas.",
      order: "La fecha de adquisición tiene que ser anterior a la de la transmisión.",
      range: "La calculadora cubre transmisiones del 1 de enero de 2024 al 31 de diciembre de 2027.",
      land: "Escribe el valor catastral del suelo.",
      total: "El valor catastral total no puede ser menor que el del suelo.",
      share: "Tu parte tiene que estar entre el 0 y el 100 %.",
      rate: `El tipo tiene que ser mayor que 0 y como máximo del ${MAX_RATE} % (art. 108.1).`,
      coefficient: "El coeficiente se escribe como en la ordenanza, por ejemplo 0,12.",
      bonus: `La bonificación puede llegar como máximo al ${MAX_BONUS} % (art. 108.4).`,
      values: "Los valores no pueden ser negativos.",
    },
    toPay: "A pagar",
    notSubject: "No se paga: no hay incremento de valor",
    period: "Periodo de generación (art. 107.4)",
    maxCoefficient: (norm) => `Coeficiente máximo (${norm})`,
    coefficientApplied: "Coeficiente aplicado",
    objectiveTitle: "Método objetivo (art. 107.1 a 107.4)",
    realTitle: "Método del incremento real (arts. 104.5 y 107.5)",
    landLine: "Valor catastral del suelo de tu parte",
    base: "Base imponible",
    cuotaIntegra: (rate) => `Cuota íntegra, al ${rate} (art. 108.2)`,
    bonusLine: (p) => `Bonificación del ${p} (art. 108.4)`,
    cuotaLiquida: "Cuota",
    landRatio: "Parte del suelo en el valor catastral",
    realGain: "Incremento real: (transmisión − adquisición) × parte del suelo",
    chosenObjective: "Pagas por el método objetivo: el incremento real es mayor.",
    chosenReal: "Pagas por el incremento real, que es menor, si lo pides al declarar (art. 107.5).",
    workingDaysLink: "Calcula el último día con los festivos de tu municipio",
  },
  ca: {
    title: "Calcula la teva plusvàlua municipal",
    intro: "Escriu les dates, el valor cadastral del sòl i el tipus del teu ajuntament. Si hi afegeixes els dos preus i el valor cadastral total, la calculadora compara el mètode objectiu amb el de l'increment real i et diu quin és més baix.",
    noscript: "Sense JavaScript es mostra l'exemple calculat al servidor; per calcular amb les teves dades cal JavaScript.",
    kind: "Tipus de transmissió",
    acquired: { sale: "Data en què el vas adquirir", inheritance: "Data en què el va adquirir la persona morta", gift: "Data en què el va adquirir qui el dona" },
    acquiredHint: "La compra, herència o donació anterior: des d'aquí compten els anys (art. 107.4).",
    transferred: { sale: "Data de la venda (escriptura)", inheritance: "Data de la mort", gift: "Data de la donació" },
    transferredHint: "És la meritació (art. 109.1.a): decideix la taula de coeficients i el termini.",
    land: "Valor cadastral del sòl",
    landHint: "De tot l'immoble, el que té a efectes de l'IBI en la data de la transmissió (art. 107.2.a). Si la teva ordenança aplica un coeficient reductor o la reducció després d'una revisió cadastral, escriu el valor ja reduït.",
    total: "Valor cadastral total (sòl i construcció)",
    totalHint: "Opcional: cal per al mètode real, perquè dona la part del preu que correspon al sòl (art. 104.5).",
    share: "La teva part de l'immoble",
    shareHint: "Si l'immoble és de diverses persones, cadascuna declara la seva part.",
    realLegend: "Mètode de l'increment real (opcional)",
    acquisitionValue: "Valor d'adquisició",
    acquisitionHint: "De tot l'immoble: el preu de l'escriptura o, si es va heretar o rebre en donació, el valor declarat a successions o donacions. Sense despeses ni impostos (art. 104.5).",
    transferValue: "Valor de transmissió",
    transferHint: "De tot l'immoble: el preu de venda de l'escriptura, o el valor declarat a successions o donacions.",
    councilLegend: "El que fixa el teu ajuntament",
    rate: "Tipus de gravamen",
    rateHint: `El de la teva ordenança fiscal, com a màxim el ${MAX_RATE} % (art. 108.1). A Barcelona, el 30 %.`,
    coefficient: "Coeficient de la teva ordenança (opcional)",
    coefficientHint: (max) => `Buit: el màxim legal (${max} per a aquest període). Si la teva ordenança en fixa un de més baix, escriu-lo; per a menys d'un any, l'anual: es prorrateja per mesos.`,
    bonus: "Bonificació del teu ajuntament",
    bonusHint: `Fins al ${MAX_BONUS} % en herències a descendents, cònjuge o ascendents, si la teva ordenança la regula i en compleixes les condicions (art. 108.4).`,
    invalid: {
      dates: "Escriu les dues dates.",
      order: "La data d'adquisició ha de ser anterior a la de la transmissió.",
      range: "La calculadora cobreix transmissions de l'1 de gener de 2024 al 31 de desembre de 2027.",
      land: "Escriu el valor cadastral del sòl.",
      total: "El valor cadastral total no pot ser més baix que el del sòl.",
      share: "La teva part ha d'estar entre el 0 i el 100 %.",
      rate: `El tipus ha de ser més gran que 0 i com a màxim del ${MAX_RATE} % (art. 108.1).`,
      coefficient: "El coeficient s'escriu com a l'ordenança, per exemple 0,12.",
      bonus: `La bonificació pot arribar com a màxim al ${MAX_BONUS} % (art. 108.4).`,
      values: "Els valors no poden ser negatius.",
    },
    toPay: "A pagar",
    notSubject: "No es paga: no hi ha increment de valor",
    period: "Període de generació (art. 107.4)",
    maxCoefficient: (norm) => `Coeficient màxim (${norm})`,
    coefficientApplied: "Coeficient aplicat",
    objectiveTitle: "Mètode objectiu (art. 107.1 a 107.4)",
    realTitle: "Mètode de l'increment real (arts. 104.5 i 107.5)",
    landLine: "Valor cadastral del sòl de la teva part",
    base: "Base imposable",
    cuotaIntegra: (rate) => `Quota íntegra, al ${rate} (art. 108.2)`,
    bonusLine: (p) => `Bonificació del ${p} (art. 108.4)`,
    cuotaLiquida: "Quota",
    landRatio: "Part del sòl en el valor cadastral",
    realGain: "Increment real: (transmissió − adquisició) × part del sòl",
    chosenObjective: "Pagues pel mètode objectiu: l'increment real és més alt.",
    chosenReal: "Pagues per l'increment real, que és més baix, si ho demanes en declarar (art. 107.5).",
    workingDaysLink: "Calcula l'últim dia amb els festius del teu municipi",
  },
  en: {
    title: "Work out your plusvalía tax",
    intro: "Enter the dates, the land's cadastral value and your council's rate. Add both prices and the total cadastral value and the calculator compares the objective method with the real-gain method and tells you which is lower.",
    noscript: "Without JavaScript you see the example worked out on the server; calculating with your own figures needs JavaScript.",
    kind: "Type of transfer",
    acquired: { sale: "Date you acquired it", inheritance: "Date the deceased acquired it", gift: "Date the donor acquired it" },
    acquiredHint: "The previous purchase, inheritance or gift: the years count from there (art. 107.4).",
    transferred: { sale: "Date of the sale (deed)", inheritance: "Date of death", gift: "Date of the gift" },
    transferredHint: "This is the accrual date (devengo, art. 109.1.a): it sets the coefficient table and the deadline.",
    land: "Cadastral value of the land",
    landHint: "For the whole property, as set for IBI (council property tax) on the transfer date (art. 107.2.a). If your ordinance applies a reducing coefficient or the reduction after a cadastral revaluation, enter the reduced value.",
    total: "Total cadastral value (land and building)",
    totalHint: "Optional: needed for the real-gain method, as it gives the land's share of the price (art. 104.5).",
    share: "Your share of the property",
    shareHint: "If several people own it, each declares their own share.",
    realLegend: "Real-gain method (optional)",
    acquisitionValue: "Acquisition value",
    acquisitionHint: "For the whole property: the deed price or, if inherited or received as a gift, the value declared for inheritance or gift tax. No costs or taxes (art. 104.5).",
    transferValue: "Transfer value",
    transferHint: "For the whole property: the sale price in the deed, or the value declared for inheritance or gift tax.",
    councilLegend: "What your council sets",
    rate: "Tax rate",
    rateHint: `Your council's ordinance rate, at most ${MAX_RATE}% (art. 108.1). Barcelona: 30%.`,
    coefficient: "Your ordinance's coefficient (optional)",
    coefficientHint: (max) => `Blank: the legal maximum (${max} for this period). If your ordinance sets a lower one, enter it; under one year, the annual one: it is prorated by months.`,
    bonus: "Your council's rebate",
    bonusHint: `Up to ${MAX_BONUS}% on inheritances by descendants, spouses or ascendants, if your ordinance provides it and you meet its conditions (art. 108.4).`,
    invalid: {
      dates: "Enter both dates.",
      order: "The acquisition date must be before the transfer date.",
      range: "The calculator covers transfers from 1 January 2024 to 31 December 2027.",
      land: "Enter the land's cadastral value.",
      total: "The total cadastral value cannot be below the land's.",
      share: "Your share must be between 0 and 100%.",
      rate: `The rate must be above 0 and at most ${MAX_RATE}% (art. 108.1).`,
      coefficient: "Enter the coefficient as the ordinance prints it, for example 0.12.",
      bonus: `The rebate can be at most ${MAX_BONUS}% (art. 108.4).`,
      values: "Values cannot be negative.",
    },
    toPay: "To pay",
    notSubject: "Nothing to pay: no increase in value",
    period: "Period held (art. 107.4)",
    maxCoefficient: (norm) => `Maximum coefficient (${norm})`,
    coefficientApplied: "Coefficient applied",
    objectiveTitle: "Objective method (art. 107.1 to 107.4)",
    realTitle: "Real-gain method (arts. 104.5 and 107.5)",
    landLine: "Land cadastral value of your share",
    base: "Taxable base",
    cuotaIntegra: (rate) => `Gross tax at ${rate} (art. 108.2)`,
    bonusLine: (p) => `Rebate of ${p} (art. 108.4)`,
    cuotaLiquida: "Tax",
    landRatio: "Land's share of the cadastral value",
    realGain: "Real gain: (transfer − acquisition) × land share",
    chosenObjective: "You pay under the objective method: the real gain is higher.",
    chosenReal: "You pay on the real gain, which is lower, if you ask for it when filing (art. 107.5).",
    workingDaysLink: "Work out the last day with your town's holidays",
  },
};
