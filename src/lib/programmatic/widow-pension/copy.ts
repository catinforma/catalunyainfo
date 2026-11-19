import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { MINIMUM_LABEL } from "@/lib/programmatic/pensions-2027/copy";
import { elDay, euros, num } from "@/lib/programmatic/rent-update/copy";

import type { Cause, Cohabitation, DeceasedStatus, InvalidReason, NoneReason, Registration, Relationship, TemporalReason } from "./engine";
import type { WidowMinimumId } from "./rules";

/**
 * Paths and words of "Pensión de viudedad: requisitos y cuánto se cobra",
 * small enough for the browser (the client component imports this file, the
 * engine and the rules; nothing that reads data).
 *
 *   /es/calculadoras/pension-viudedad/
 *   /ca/calculadores/pensio-viduitat/
 *   /en/calculators/spain-widows-pension/
 *
 * Numbers and dates in the rent-update module's words; the minimum rows'
 * names are the pensions-2027 page's (one wording for the same BOE table).
 */

export type WpLocale = DateLocale;
export const WP_LOCALES: readonly WpLocale[] = ["es", "ca", "en"];

export function widowPath(locale: WpLocale): string {
  return calcPath("widow-pension", locale);
}

export function widowEditions(): Record<WpLocale, string> {
  return { ca: widowPath("ca"), es: widowPath("es"), en: widowPath("en") };
}

export { elDay, euros, num };

export function day(iso: string, locale: WpLocale): string {
  return dayMonthYear(iso, locale);
}

/** A whole percentage: "52 %" / "52%". */
export function whole(n: number, locale: WpLocale): string {
  return locale === "en" ? `${num(n, 0, locale)}%` : `${num(n, 0, locale)} %`;
}

/** "936,20 € al mes" / "936,20 € al mes" / "€936.20 a month". */
export function perMonth(n: number, locale: WpLocale): string {
  return { es: `${euros(n, locale)} al mes`, ca: `${euros(n, locale)} al mes`, en: `${euros(n, locale)} a month` }[locale];
}

/** "13.106,80 € al año" / "13.106,80 € l'any" / "€13,106.80 a year". */
export function perYear(n: number, locale: WpLocale): string {
  return { es: `${euros(n, locale)} al año`, ca: `${euros(n, locale)} l'any`, en: `${euros(n, locale)} a year` }[locale];
}

/** "14 pagas" / "14 pagues" / "14 payments". */
export function paymentsText(n: number, locale: WpLocale): string {
  return { es: `${n} pagas`, ca: `${n} pagues`, en: `${n} payments` }[locale];
}

export const MIN_LABEL: Record<WpLocale, Record<WidowMinimumId, string>> = {
  es: { widowCharges: MINIMUM_LABEL.es.widowCharges, widow65: MINIMUM_LABEL.es.widow65, widow60: MINIMUM_LABEL.es.widow60, widowUnder60: MINIMUM_LABEL.es.widowUnder60 },
  ca: { widowCharges: MINIMUM_LABEL.ca.widowCharges, widow65: MINIMUM_LABEL.ca.widow65, widow60: MINIMUM_LABEL.ca.widow60, widowUnder60: MINIMUM_LABEL.ca.widowUnder60 },
  en: { widowCharges: MINIMUM_LABEL.en.widowCharges, widow65: MINIMUM_LABEL.en.widow65, widow60: MINIMUM_LABEL.en.widow60, widowUnder60: MINIMUM_LABEL.en.widowUnder60 },
};

export const RELATIONSHIP_LABEL: Record<Relationship, Record<WpLocale, string>> = {
  married: { es: "Casado o casada con la persona fallecida", ca: "Casat o casada amb la persona morta", en: "Married to the person who died" },
  partner: { es: "Pareja de hecho", ca: "Parella de fet", en: "Unmarried partner (pareja de hecho)" },
  separated: { es: "Separado, divorciado o expareja de hecho", ca: "Separat, divorciat o exparella de fet", en: "Separated, divorced or former partner" },
};

export const STATUS_LABEL: Record<DeceasedStatus, Record<WpLocale, string>> = {
  pensioner: { es: "Cobraba una pensión de jubilación o de incapacidad permanente", ca: "Cobrava una pensió de jubilació o d'incapacitat permanent", en: "Was drawing a retirement or permanent disability pension" },
  "alta-500": { es: "De alta (trabajando, en el paro, de baja…) con 500 días cotizados en los últimos 5 años", ca: "D'alta (treballant, a l'atur, de baixa…) amb 500 dies cotitzats en els últims 5 anys", en: "Registered (working, on unemployment benefit, on sick leave…) with 500 days contributed in the last 5 years" },
  "alta-short": { es: "De alta, pero con menos de 500 días en los últimos 5 años", ca: "D'alta, però amb menys de 500 dies en els últims 5 anys", en: "Registered, but under 500 days in the last 5 years" },
  "no-alta-15": { es: "Sin alta, con 15 años cotizados o más", ca: "Sense alta, amb 15 anys cotitzats o més", en: "Not registered, with 15 or more years contributed" },
  "no-alta-short": { es: "Sin alta y con menos de 15 años cotizados", ca: "Sense alta i amb menys de 15 anys cotitzats", en: "Not registered and under 15 years contributed" },
};

export const CAUSE_LABEL: Record<Cause, Record<WpLocale, string>> = {
  common: { es: "Enfermedad común u otra causa", ca: "Malaltia comuna o una altra causa", en: "Common illness or another cause" },
  accident: { es: "Accidente no laboral (de tráfico, doméstico…)", ca: "Accident no laboral (de trànsit, domèstic…)", en: "Non-work accident (traffic, at home…)" },
  work: { es: "Accidente de trabajo o enfermedad profesional", ca: "Accident de treball o malaltia professional", en: "Work accident or occupational illness" },
};

export const COHABITATION_LABEL: Record<Cohabitation, Record<WpLocale, string>> = {
  "5-plus": { es: "5 años o más", ca: "5 anys o més", en: "5 years or more" },
  "2-to-5": { es: "De 2 a 5 años", ca: "De 2 a 5 anys", en: "2 to 5 years" },
  "under-2": { es: "Menos de 2 años", ca: "Menys de 2 anys", en: "Under 2 years" },
};

export const REGISTRATION_LABEL: Record<Registration, Record<WpLocale, string>> = {
  "2-plus": { es: "Inscrita (o escritura pública) 2 años o más antes", ca: "Inscrita (o escriptura pública) 2 anys o més abans", en: "Registered (or public deed) 2 or more years before" },
  "under-2": { es: "Inscrita hace menos de 2 años", ca: "Inscrita fa menys de 2 anys", en: "Registered under 2 years before" },
  none: { es: "Sin inscribir", ca: "Sense inscriure", en: "Never registered" },
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  relationship: string;
  deceased: string;
  status: string;
  statusHint: string;
  cause: string;
  illnessBefore: string;
  illnessBeforeHint: string;
  marriageCondition: string;
  commonChildren: string;
  cohabitation: string;
  cohabitationHint: string;
  registration: string;
  remarried: string;
  compensatory: string;
  genderViolence: string;
  compensatoryAnnual: string;
  compensatoryHint: string;
  you: string;
  age: string;
  disability65: string;
  burdens: string;
  burdensHint: (threshold: string) => string;
  otherIncome: string;
  otherIncomeHint: string;
  workIncome: string;
  otherPension: string;
  base: string;
  baseHint: string;
  yes: string;
  no: string;
  rAccess: string;
  accessPension: string;
  accessTemporal: Record<TemporalReason, string>;
  accessNone: Record<NoneReason, string>;
  partnerChildrenNone: string;
  rPercent: string;
  pct70: (income: string, ceiling: string) => string;
  pct70Reduced: (ceiling: string) => string;
  pct60: (limit: string) => string;
  pct52: string;
  why60: { noPension: string; noWork: string; income: (limit: string) => string };
  not60: (reasons: string) => string;
  possible70: (ceiling: string, ceilingSS: string) => string;
  possible70Main: string;
  not70Main: string;
  better52: string;
  rAmount: string;
  amountLine: (monthly: string, payments: string, annual: string) => string;
  amount12: string;
  amountMax: (max: string) => string;
  amountCompensatory: (comp: string) => string;
  amountTemporal: string;
  amountNoBase: (pct: string) => string;
  rMinimum: string;
  minimumLine: (label: string, monthly: string) => string;
  complement: {
    "none-needed": string;
    full: (monthly: string, total: string) => string;
    partial: (monthly: string, total: string) => string;
    "over-limit": string;
    "other-pension": string;
    compensatory: string;
    temporal: string;
  };
  floor: { full: (monthly: string) => string; partial: (monthly: string) => string; capNote: (cap: string) => string };
  residence: string;
  asOfLine: (date: string) => string;
  articles: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<WpLocale, CalcCopy> = {
  es: {
    title: "¿Tengo derecho a la pensión de viudedad y cuánto cobraré?",
    intro: "Contesta lo que sepas. La base reguladora es opcional: sin ella te damos el porcentaje y el mínimo de 2026. No pedimos DNI ni número de la Seguridad Social: nada sale de tu navegador.",
    noscript: "Sin JavaScript ves el resultado de una persona de 66 años, viuda de un pensionista de jubilación, sin otros ingresos y con una base reguladora de 1.600 € al mes.",
    relationship: "Tu relación con la persona fallecida",
    deceased: "La persona fallecida",
    status: "Su situación el día del fallecimiento",
    statusHint: "El paro, la baja médica o el convenio especial cuentan como situación asimilada al alta.",
    cause: "Causa del fallecimiento",
    illnessBefore: "¿La enfermedad ya existía antes de casaros?",
    illnessBeforeHint: "Solo importa si la muerte fue por enfermedad común.",
    marriageCondition: "¿Lleváis al menos 1 año casados, tenéis hijos comunes o sumáis más de 2 años entre la convivencia previa y el matrimonio?",
    commonChildren: "¿Tenéis hijos en común?",
    cohabitation: "Convivencia empadronados juntos, justo antes del fallecimiento",
    cohabitationHint: "Se acredita con el certificado de empadronamiento.",
    registration: "Registro de parejas de hecho o escritura pública",
    remarried: "¿Te has vuelto a casar o has formado otra pareja de hecho?",
    compensatory: "¿Cobrabas una pensión compensatoria que se extingue con el fallecimiento?",
    genderViolence: "¿Eras víctima de violencia de género cuando os separasteis o divorciasteis?",
    compensatoryAnnual: "Pensión compensatoria al año (opcional)",
    compensatoryHint: "Lo que cobrabas en un año, en euros. La viudedad no puede superarla.",
    you: "Tú",
    age: "Tu edad",
    disability65: "Tengo una discapacidad del 65 % o más",
    burdens: "¿Tienes cargas familiares?",
    burdensHint: (t) => `Convives con hijos menores de 26 años, con hijos con discapacidad del 33 % o más o con menores acogidos, y los ingresos de la familia divididos entre sus miembros no pasan de ${t} al año (75 % del salario mínimo sin pagas extra).`,
    otherIncome: "Tus otros ingresos al año, sin contar esta pensión",
    otherIncomeHint: "Sueldo, rentas, intereses, otras pensiones… en euros al año.",
    workIncome: "¿Alguno es de trabajo (nómina o autónomo)?",
    otherPension: "¿Cobras otra pensión pública (española o extranjera)?",
    base: "Base reguladora al mes (opcional)",
    baseHint: "Si la sabes. Si el fallecido era pensionista, es la de su pensión; si trabajaba, la suma de 24 meses de bases dividida entre 28.",
    yes: "Sí",
    no: "No",
    rAccess: "¿Tienes derecho?",
    accessPension: "Sí: pensión de viudedad vitalicia.",
    accessTemporal: {
      marriage: "Prestación temporal de viudedad durante 2 años: la enfermedad era anterior a la boda, el matrimonio duró menos de un año y no hay hijos comunes (arts. 219.2 y 222).",
      registration: "Prestación temporal de viudedad durante 2 años: la pareja se inscribió menos de 2 años antes del fallecimiento (art. 222).",
    },
    accessNone: {
      contributions: "No: la persona fallecida no reúne la cotización. Si estaba de alta, 500 días en los últimos 5 años (no hace falta si murió por accidente o enfermedad profesional); si no lo estaba, 15 años (art. 219.1).",
      "partner-cohabitation": "No: sin hijos en común hacen falta 5 años de convivencia empadronados justo antes del fallecimiento y la inscripción de la pareja con 2 años de antelación (art. 221.2).",
      "partner-registration": "No: sin hijos en común la pareja tenía que estar inscrita en un registro o constituida en escritura pública (art. 221.2); sin inscripción tampoco hay prestación temporal (art. 222).",
      remarried: "No: como excónyuge o expareja no tienes derecho si te has vuelto a casar o has formado otra pareja de hecho (arts. 220.1 y 221.3).",
      compensatory: "No: hace falta una pensión compensatoria que se extinga con el fallecimiento, o ser mujer víctima de violencia de género al separarte (art. 220.1). Si os separasteis o divorciasteis antes de 2008, mira la regla transitoria de abajo.",
    },
    partnerChildrenNone: "No: con hijos en común hacen falta al menos 2 años de convivencia empadronados justo antes del fallecimiento (art. 221.2).",
    rPercent: "Porcentaje de la base reguladora",
    pct70: (income, ceiling) => `70 %: tienes cargas familiares, tus otros ingresos (${income}) no pasan de ${ceiling} y la pensión es tu fuente principal de ingresos (Decreto 3158/1966, art. 31.2).`,
    pct70Reduced: (ceiling) => `El 70 % se reduce para que pensión e ingresos no pasen de ${ceiling} (art. 31.3).`,
    pct60: (limit) => `60 %: tienes 65 años o más, ninguna otra pensión pública, no trabajas y tus rentas no pasan de ${limit} al año (Real Decreto 900/2018).`,
    pct52: "52 %: el porcentaje general (Decreto 3158/1966, art. 31.1).",
    why60: { noPension: "cobras otra pensión pública", noWork: "tienes ingresos de trabajo", income: (l) => `tus rentas pasan de ${l}` },
    not60: (r) => `No llega al 60 %: ${r} (Real Decreto 900/2018, art. 2).`,
    possible70: (c, css) => `Podría ser el 70 %: tus ingresos pasan del límite del BOE (${c}) pero no del que publica la Seguridad Social (${css}). Pídelo y que lo decida el INSS.`,
    possible70Main: "Podría ser el 70 % si la pensión llega al menos a la mitad de todos tus ingresos: pon la base reguladora para comprobarlo.",
    not70Main: "No llega al 70 %: la pensión no sería al menos la mitad de tus ingresos.",
    better52: "Con la reducción del art. 31.3, el porcentaje general sale más alto: se aplica ese.",
    rAmount: "Cuánto cobrarías",
    amountLine: (m, p, a) => `${m} en ${p} (${a}).`,
    amount12: "Por accidente de trabajo o enfermedad profesional se cobra en 12 pagas, con las extra prorrateadas.",
    amountMax: (max) => `Rebajada a la pensión máxima de 2026 (${max}).`,
    amountCompensatory: (c) => `Rebajada a tu pensión compensatoria (${c}), como manda el art. 220.1.`,
    amountTemporal: "Durante 2 años, y después se acaba.",
    amountNoBase: (p) => `Será el ${p} de tu base reguladora: ponla arriba para ver el importe.`,
    rMinimum: "Mínimo de 2026",
    minimumLine: (label, m) => `${label}: ${m}.`,
    complement: {
      "none-needed": "Tu pensión ya supera el mínimo: no hay complemento.",
      full: (m, t) => `La Seguridad Social la completa con ${m} hasta el mínimo: cobrarías ${t}.`,
      partial: (m, t) => `Tus ingresos pasan de 9.442 €: complemento parcial de ${m}, total ${t}.`,
      "over-limit": "Con tus otros ingresos no hay complemento a mínimos.",
      "other-pension": "Cobras otra pensión pública: el mínimo se calcula con las reglas de concurrencia de pensiones, que no calculamos.",
      compensatory: "Tu viudedad se ha rebajado a la compensatoria. El Real Decreto 241/2026 dice que esas pensiones «no podrán ser complementadas» (en el apartado de Clases Pasivas): pregunta a la Seguridad Social.",
      temporal: "La tabla de mínimos es de pensiones; la ficha oficial de la prestación temporal no habla de complementos.",
    },
    floor: {
      full: (m) => `Si tu pensión queda por debajo, la Seguridad Social la completa hasta ${m}.`,
      partial: (m) => `Tus ingresos pasan de 9.442 €: el complemento solo te llevaría hasta ${m}.`,
      capNote: (c) => `El complemento nunca pasa de ${c} al año.`,
    },
    residence: "El complemento a mínimos exige residir en España y se pide con la pensión.",
    asOfLine: (date) => `Normas vigentes ${date}; cuantías de 2026.`,
    articles: "Arts. 219 a 223 de la Ley General de la Seguridad Social; Decreto 3158/1966, art. 31; Real Decreto 900/2018; Real Decreto 241/2026.",
    invalid: {
      age: "Pon tu edad en años (de 14 a 110).",
      income: "Pon tus otros ingresos al año (0 si no tienes).",
      base: "La base reguladora va en euros al mes (por ejemplo, 1500).",
      compensatory: "Pon la pensión compensatoria en euros al año, o déjala vacía.",
    },
  },
  ca: {
    title: "Tinc dret a la pensió de viduïtat i quant cobraré?",
    intro: "Contesta el que sàpigues. La base reguladora és opcional: sense ella et donem el percentatge i el mínim del 2026. No demanem DNI ni número de la Seguretat Social: res no surt del navegador.",
    noscript: "Sense JavaScript veus el resultat d'una persona de 66 anys, vídua d'un pensionista de jubilació, sense altres ingressos i amb una base reguladora de 1.600 € al mes.",
    relationship: "La teva relació amb la persona morta",
    deceased: "La persona morta",
    status: "La seva situació el dia de la mort",
    statusHint: "L'atur, la baixa mèdica o el conveni especial compten com a situació assimilada a l'alta.",
    cause: "Causa de la mort",
    illnessBefore: "La malaltia ja existia abans de casar-vos?",
    illnessBeforeHint: "Només importa si la mort va ser per malaltia comuna.",
    marriageCondition: "Porteu com a mínim 1 any casats, teniu fills comuns o sumeu més de 2 anys entre la convivència prèvia i el matrimoni?",
    commonChildren: "Teniu fills en comú?",
    cohabitation: "Convivència empadronats junts, just abans de la mort",
    cohabitationHint: "S'acredita amb el certificat d'empadronament.",
    registration: "Registre de parelles de fet o escriptura pública",
    remarried: "T'has tornat a casar o has format una altra parella de fet?",
    compensatory: "Cobraves una pensió compensatòria que s'extingeix amb la mort?",
    genderViolence: "Eres víctima de violència de gènere quan us vau separar o divorciar?",
    compensatoryAnnual: "Pensió compensatòria l'any (opcional)",
    compensatoryHint: "El que cobraves en un any, en euros. La viduïtat no la pot superar.",
    you: "Tu",
    age: "La teva edat",
    disability65: "Tinc una discapacitat del 65 % o més",
    burdens: "Tens càrregues familiars?",
    burdensHint: (t) => `Convius amb fills menors de 26 anys, amb fills amb discapacitat del 33 % o més o amb menors acollits, i els ingressos de la família dividits entre els seus membres no passen de ${t} l'any (75 % del salari mínim sense pagues extra).`,
    otherIncome: "Els teus altres ingressos l'any, sense comptar aquesta pensió",
    otherIncomeHint: "Sou, rendes, interessos, altres pensions… en euros l'any.",
    workIncome: "Algun és de feina (nòmina o autònom)?",
    otherPension: "Cobres una altra pensió pública (espanyola o estrangera)?",
    base: "Base reguladora al mes (opcional)",
    baseHint: "Si la saps. Si la persona morta era pensionista, és la de la seva pensió; si treballava, la suma de 24 mesos de bases dividida entre 28.",
    yes: "Sí",
    no: "No",
    rAccess: "Tens dret?",
    accessPension: "Sí: pensió de viduïtat vitalícia.",
    accessTemporal: {
      marriage: "Prestació temporal de viduïtat durant 2 anys: la malaltia era anterior al casament, el matrimoni va durar menys d'un any i no hi ha fills comuns (arts. 219.2 i 222).",
      registration: "Prestació temporal de viduïtat durant 2 anys: la parella es va inscriure menys de 2 anys abans de la mort (art. 222).",
    },
    accessNone: {
      contributions: "No: la persona morta no reuneix la cotització. Si estava d'alta, 500 dies en els últims 5 anys (no cal si va morir per accident o malaltia professional); si no ho estava, 15 anys (art. 219.1).",
      "partner-cohabitation": "No: sense fills en comú calen 5 anys de convivència empadronats just abans de la mort i la inscripció de la parella amb 2 anys d'antelació (art. 221.2).",
      "partner-registration": "No: sense fills en comú la parella havia d'estar inscrita en un registre o constituïda en escriptura pública (art. 221.2); sense inscripció tampoc no hi ha prestació temporal (art. 222).",
      remarried: "No: com a excònjuge o exparella no hi tens dret si t'has tornat a casar o has format una altra parella de fet (arts. 220.1 i 221.3).",
      compensatory: "No: cal una pensió compensatòria que s'extingeixi amb la mort, o ser dona víctima de violència de gènere en separar-te (art. 220.1). Si us vau separar o divorciar abans del 2008, mira la regla transitòria de més avall.",
    },
    partnerChildrenNone: "No: amb fills en comú calen com a mínim 2 anys de convivència empadronats just abans de la mort (art. 221.2).",
    rPercent: "Percentatge de la base reguladora",
    pct70: (income, ceiling) => `70 %: tens càrregues familiars, els teus altres ingressos (${income}) no passen de ${ceiling} i la pensió és la teva font principal d'ingressos (Decret 3158/1966, art. 31.2).`,
    pct70Reduced: (ceiling) => `El 70 % es redueix perquè pensió i ingressos no passin de ${ceiling} (art. 31.3).`,
    pct60: (limit) => `60 %: tens 65 anys o més, cap altra pensió pública, no treballes i les teves rendes no passen de ${limit} l'any (Reial decret 900/2018).`,
    pct52: "52 %: el percentatge general (Decret 3158/1966, art. 31.1).",
    why60: { noPension: "cobres una altra pensió pública", noWork: "tens ingressos de feina", income: (l) => `les teves rendes passen de ${l}` },
    not60: (r) => `No arriba al 60 %: ${r} (Reial decret 900/2018, art. 2).`,
    possible70: (c, css) => `Podria ser el 70 %: els teus ingressos passen del límit del BOE (${c}) però no del que publica la Seguretat Social (${css}). Demana-ho i que ho decideixi l'INSS.`,
    possible70Main: "Podria ser el 70 % si la pensió arriba com a mínim a la meitat de tots els teus ingressos: posa la base reguladora per comprovar-ho.",
    not70Main: "No arriba al 70 %: la pensió no seria com a mínim la meitat dels teus ingressos.",
    better52: "Amb la reducció de l'art. 31.3, el percentatge general surt més alt: s'aplica aquest.",
    rAmount: "Quant cobraries",
    amountLine: (m, p, a) => `${m} en ${p} (${a}).`,
    amount12: "Per accident de treball o malaltia professional es cobra en 12 pagues, amb les extra prorratejades.",
    amountMax: (max) => `Rebaixada a la pensió màxima del 2026 (${max}).`,
    amountCompensatory: (c) => `Rebaixada a la teva pensió compensatòria (${c}), com mana l'art. 220.1.`,
    amountTemporal: "Durant 2 anys, i després s'acaba.",
    amountNoBase: (p) => `Serà el ${p} de la teva base reguladora: posa-la a dalt per veure'n l'import.`,
    rMinimum: "Mínim del 2026",
    minimumLine: (label, m) => `${label}: ${m}.`,
    complement: {
      "none-needed": "La teva pensió ja supera el mínim: no hi ha complement.",
      full: (m, t) => `La Seguretat Social la completa amb ${m} fins al mínim: cobraries ${t}.`,
      partial: (m, t) => `Els teus ingressos passen de 9.442 €: complement parcial de ${m}, total ${t}.`,
      "over-limit": "Amb els teus altres ingressos no hi ha complement a mínims.",
      "other-pension": "Cobres una altra pensió pública: el mínim es calcula amb les regles de concurrència de pensions, que no calculem.",
      compensatory: "La teva viduïtat s'ha rebaixat a la compensatòria. El Reial decret 241/2026 diu que aquestes pensions «no podrán ser complementadas» (a l'apartat de Classes Passives): pregunta-ho a la Seguretat Social.",
      temporal: "La taula de mínims és de pensions; la fitxa oficial de la prestació temporal no parla de complements.",
    },
    floor: {
      full: (m) => `Si la teva pensió queda per sota, la Seguretat Social la completa fins a ${m}.`,
      partial: (m) => `Els teus ingressos passen de 9.442 €: el complement només t'arribaria fins a ${m}.`,
      capNote: (c) => `El complement mai no passa de ${c} l'any.`,
    },
    residence: "El complement a mínims exigeix residir a Espanya i es demana amb la pensió.",
    asOfLine: (date) => `Normes vigents ${date}; quanties del 2026.`,
    articles: "Arts. 219 a 223 de la Llei general de la Seguretat Social; Decret 3158/1966, art. 31; Reial decret 900/2018; Reial decret 241/2026.",
    invalid: {
      age: "Posa la teva edat en anys (de 14 a 110).",
      income: "Posa els teus altres ingressos l'any (0 si no en tens).",
      base: "La base reguladora va en euros al mes (per exemple, 1500).",
      compensatory: "Posa la pensió compensatòria en euros l'any, o deixa-la buida.",
    },
  },
  en: {
    title: "Am I entitled to a widow's pension, and how much?",
    intro: "Answer what you know. The base reguladora is optional: without it you get the percentage and the 2026 minimum. We never ask for your ID or Social Security number: nothing leaves your browser.",
    noscript: "Without JavaScript you see the result for a 66-year-old widow or widower of a retirement pensioner, with no other income and a base reguladora of €1,600 a month.",
    relationship: "Your relationship to the person who died",
    deceased: "The person who died",
    status: "Their situation on the day of death",
    statusHint: "Unemployment benefit, sick leave or a special agreement (convenio especial) count as equivalent to registration (alta).",
    cause: "Cause of death",
    illnessBefore: "Did the illness exist before you married?",
    illnessBeforeHint: "Only matters if the death was from a common illness.",
    marriageCondition: "Had you been married for at least a year, do you have children together, or do cohabitation before the wedding and the marriage add up to more than 2 years?",
    commonChildren: "Do you have children together?",
    cohabitation: "Living together on the same padrón, right before the death",
    cohabitationHint: "Proved with the certificado de empadronamiento.",
    registration: "Partnership registry or public deed",
    remarried: "Have you remarried or formed a new registered partnership?",
    compensatory: "Were you receiving a compensatory pension (pensión compensatoria) that ends with the death?",
    genderViolence: "Were you a victim of gender violence when you separated or divorced?",
    compensatoryAnnual: "Compensatory pension a year (optional)",
    compensatoryHint: "What you received in a year, in euros. The widow's pension cannot exceed it.",
    you: "You",
    age: "Your age",
    disability65: "I have a disability of 65% or more",
    burdens: "Do you have family dependants (cargas familiares)?",
    burdensHint: (t) => `You live with children under 26, children with a 33%+ disability or fostered minors, and the family's income divided by its members is no more than ${t} a year (75% of the minimum wage without extra payments).`,
    otherIncome: "Your other income a year, not counting this pension",
    otherIncomeHint: "Salary, rents, interest, other pensions… in euros a year.",
    workIncome: "Is any of it from work (employed or self-employed)?",
    otherPension: "Do you get another public pension (Spanish or foreign)?",
    base: "Base reguladora a month (optional)",
    baseHint: "If you know it. If the person was a pensioner, it is their pension's base; if they worked, 24 months of contribution bases divided by 28.",
    yes: "Yes",
    no: "No",
    rAccess: "Are you entitled?",
    accessPension: "Yes: a lifelong widow's pension.",
    accessTemporal: {
      marriage: "A temporary widow's benefit for 2 years: the illness came before the wedding, the marriage lasted under a year and there are no children together (arts. 219.2 and 222).",
      registration: "A temporary widow's benefit for 2 years: the partnership was registered under 2 years before the death (art. 222).",
    },
    accessNone: {
      contributions: "No: the person who died does not meet the contribution rule. If registered (alta), 500 days in the last 5 years (not needed after an accident or occupational illness); if not, 15 years (art. 219.1).",
      "partner-cohabitation": "No: without children together you need 5 years living together on the padrón right before the death and a partnership registered 2 years before (art. 221.2).",
      "partner-registration": "No: without children together the partnership had to be registered or set up by public deed (art. 221.2); with no registration there is no temporary benefit either (art. 222).",
      remarried: "No: as a former spouse or partner you are not entitled once you have remarried or formed a new partnership (arts. 220.1 and 221.3).",
      compensatory: "No: you need a compensatory pension that ends with the death, or to be a woman who was a victim of gender violence at the separation (art. 220.1). If you separated or divorced before 2008, see the transitional rule below.",
    },
    partnerChildrenNone: "No: with children together you need at least 2 years living together on the padrón right before the death (art. 221.2).",
    rPercent: "Percentage of the base reguladora",
    pct70: (income, ceiling) => `70%: you have family dependants, your other income (${income}) is no more than ${ceiling} and the pension is your main income (Decreto 3158/1966, art. 31.2).`,
    pct70Reduced: (ceiling) => `The 70% is cut so that pension plus income stays within ${ceiling} (art. 31.3).`,
    pct60: (limit) => `60%: you are 65 or over, with no other public pension, no work income and no more than ${limit} a year of other income (Royal Decree 900/2018).`,
    pct52: "52%: the general rate (Decreto 3158/1966, art. 31.1).",
    why60: { noPension: "you get another public pension", noWork: "you have work income", income: (l) => `your other income is over ${l}` },
    not60: (r) => `Not 60%: ${r} (Royal Decree 900/2018, art. 2).`,
    possible70: (c, css) => `It could be 70%: your income is over the BOE's ceiling (${c}) but not over the one Social Security publishes (${css}). Apply and let the INSS decide.`,
    possible70Main: "It could be 70% if the pension is at least half of all your income: enter the base reguladora to check.",
    not70Main: "Not 70%: the pension would not be at least half of your income.",
    better52: "After the art. 31.3 cut, the general rate gives more: that one applies.",
    rAmount: "How much you would get",
    amountLine: (m, p, a) => `${m} in ${p} (${a}).`,
    amount12: "After a work accident or occupational illness it is paid in 12 payments, the extras spread over them.",
    amountMax: (max) => `Cut to the 2026 maximum pension (${max}).`,
    amountCompensatory: (c) => `Cut to your compensatory pension (${c}), as art. 220.1 requires.`,
    amountTemporal: "For 2 years, then it ends.",
    amountNoBase: (p) => `It will be ${p} of your base reguladora: enter it above to see the amount.`,
    rMinimum: "2026 minimum",
    minimumLine: (label, m) => `${label}: ${m}.`,
    complement: {
      "none-needed": "Your pension is above the minimum: no top-up.",
      full: (m, t) => `Social Security tops it up by ${m} to the minimum: you would get ${t}.`,
      partial: (m, t) => `Your income is over €9,442: a partial top-up of ${m}, ${t} in all.`,
      "over-limit": "With your other income there is no minimum top-up.",
      "other-pension": "You get another public pension: the minimum follows the rules for concurrent pensions, which we do not compute.",
      compensatory: "Your widow's pension was cut to the compensatory pension. Royal Decree 241/2026 says such pensions «no podrán ser complementadas» (in its paragraph on Clases Pasivas): ask Social Security.",
      temporal: "The minimums table is for pensions; the official page on the temporary benefit says nothing about top-ups.",
    },
    floor: {
      full: (m) => `If your pension falls short, Social Security tops it up to ${m}.`,
      partial: (m) => `Your income is over €9,442: the top-up would only take you to ${m}.`,
      capNote: (c) => `The top-up is never more than ${c} a year.`,
    },
    residence: "The minimum top-up requires living in Spain and is applied for with the pension.",
    asOfLine: (date) => `Rules in force ${date}; 2026 amounts.`,
    articles: "General Social Security Act, arts. 219 to 223; Decreto 3158/1966, art. 31; Royal Decree 900/2018; Royal Decree 241/2026.",
    invalid: {
      age: "Enter your age in years (14 to 110).",
      income: "Enter your other income a year (0 if none).",
      base: "The base reguladora is in euros a month (for example, 1500).",
      compensatory: "Enter the compensatory pension in euros a year, or leave it empty.",
    },
  },
};
