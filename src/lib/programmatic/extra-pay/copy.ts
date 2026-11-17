import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import type { Contract, FamilySituation } from "@/lib/programmatic/net-salary/engine";

import type { SalaryMode, WithholdingMode } from "./engine";
import { EXTRA_PAY_YEAR, type Accrual } from "./rules";

/**
 * Paths and calculator words of the Christmas extra pay calculator, small
 * enough for the browser (the client component imports this file, the
 * engine and the rules; nothing that reads data).
 *
 *   /es/calculadoras/paga-extra/
 *   /ca/calculadores/paga-extra/
 *   /en/calculators/christmas-extra-pay-spain/
 */

export type EpLocale = Locale;
export const EP_LOCALES: readonly EpLocale[] = ["es", "ca", "en"];

export function extraPayPath(locale: EpLocale): string {
  return calcPath("extra-pay", locale);
}

export function extraPayEditions(): Record<EpLocale, string> {
  return { ca: extraPayPath("ca"), es: extraPayPath("es"), en: extraPayPath("en") };
}

const Y = EXTRA_PAY_YEAR;

/** Title, description, H1 and breadcrumb of each edition (a test holds the snippet lengths). */
export const EXTRA_META: Record<EpLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: `Paga extra de Navidad ${Y}: cuánto cobrarás neto y cuándo`,
    description: `Calcula tu paga extra de Navidad ${Y}: bruto, parte proporcional si entraste este año, IRPF y neto. Prorrateada o no, y por qué no lleva Seguridad Social.`,
    h1: `Calculadora de la paga extra de Navidad ${Y}`,
    breadcrumb: "Paga extra de Navidad",
    appName: `Calculadora de la paga extra de Navidad ${Y}`,
  },
  ca: {
    title: `Paga extra de Nadal ${Y}: quant cobraràs net i quan`,
    description: `Calcula la teva paga extra de Nadal ${Y}: brut, part proporcional si vas entrar aquest any, IRPF i net. Prorratejada o no, i per què no porta Seguretat Social.`,
    h1: `Calculadora de la paga extra de Nadal ${Y}`,
    breadcrumb: "Paga extra de Nadal",
    appName: `Calculadora de la paga extra de Nadal ${Y}`,
  },
  en: {
    title: `Spain Christmas extra pay ${Y}: net amount calculator`,
    description: `Work out your ${Y} Christmas extra pay in Spain (paga extra): gross, the part earned if you started this year, IRPF and net, and why no Social Security comes off.`,
    h1: `Spain Christmas extra pay calculator ${Y}`,
    breadcrumb: "Christmas extra pay",
    appName: `Spain Christmas extra pay calculator ${Y}`,
  },
};

export interface ExtraPayCopy {
  title: string;
  intro: string;
  noscript: string;
  mode: string;
  modeOptions: Record<SalaryMode, string>;
  salary: Record<SalaryMode, string>;
  salaryHint: Record<SalaryMode, string>;
  payments: string;
  paymentsOptions: Record<12 | 14, string>;
  extraAmount: string;
  extraAmountHint: string;
  accrual: string;
  accrualOptions: Record<Accrual, string>;
  accrualHint: string;
  start: string;
  startHint: string;
  withholding: string;
  withholdingOptions: Record<WithholdingMode, string>;
  rate: string;
  rateHint: string;
  region: string;
  family: string;
  familyOptions: Record<FamilySituation, string>;
  children: string;
  contract: string;
  contractOptions: Record<Contract, string>;
  results: string;
  net: string;
  gross: string;
  grossOf: (full: string) => string;
  irpf: (rate: string) => string;
  ss: string;
  proratedNone: string;
  proratedShare: string;
  proratedShareNet: string;
  proratedYear: string;
  /** Days earned when the job started inside the accrual period; in Catalan `start` carries its article ("l'1 de setembre de 2026"). */
  newHire: (start: string, days: number, of: number, pct: string) => string;
  estimateNote: (annual: string, rate: string) => string;
  estimateNewHire: string;
  ssNote: (rate: string, gross: string, paid: string) => string;
  ssCapped: (max: string) => string;
  errors: { salary: string; start: string; rate: string; foral: string };
  disclaimer: string;
}

export const CALC_COPY: Record<EpLocale, ExtraPayCopy> = {
  es: {
    title: "Calcula tu paga extra de Navidad",
    intro: "Pon tu sueldo y cómo te pagan las extras: sale el bruto, la parte que te toca si entraste este año, la retención de IRPF y el neto. Se calcula en tu navegador; no guardamos nada.",
    noscript: "Sin JavaScript ves el ejemplo de 30.000 € al año; para tu caso hace falta activarlo.",
    mode: "Conozco mi sueldo bruto",
    modeOptions: { annual: "Anual", monthly: "Mensual" },
    salary: { annual: "Sueldo bruto anual", monthly: "Sueldo bruto mensual" },
    salaryHint: {
      annual: "Todo el año antes de impuestos, con las dos pagas extra.",
      monthly: "Lo de una nómina ordinaria, sin la línea de prorrata de pagas extra ni horas extra.",
    },
    payments: "Cómo cobras las pagas extra",
    paymentsOptions: { 14: "Aparte, en su mes (14 pagas)", 12: "Prorrateadas en cada nómina (12 pagas)" },
    extraAmount: "Importe de la paga según tu convenio (opcional)",
    extraAmountHint: "Vacío = una mensualidad: el bruto mensual, o el anual entre 14. Si tu convenio fija otra cifra (por ejemplo, solo el salario base), escríbela.",
    accrual: "Periodo de devengo de la paga de Navidad",
    accrualOptions: { annual: "Anual: del 1 de enero al 31 de diciembre", semester: "Semestral: del 1 de julio al 31 de diciembre" },
    accrualHint: "Lo dice tu convenio. Solo cambia algo si empezaste a trabajar este año.",
    start: "Fecha de alta en la empresa (solo si fue en 2026)",
    startHint: "Vacío = has trabajado todo el periodo de devengo.",
    withholding: "Retención de IRPF",
    withholdingOptions: { estimate: "Estimarla (algoritmo de la Agencia Tributaria)", payslip: "Usar el tipo de mi nómina" },
    rate: "Tipo de retención de tu nómina",
    rateHint: "El porcentaje de IRPF que aparece en tu última nómina.",
    region: "Dónde vives",
    family: "Situación familiar (modelo 145)",
    familyOptions: {
      1: "1. Soltero, viudo, divorciado o separado con hijos menores que viven solo contigo",
      2: "2. Casado, y tu cónyuge no gana más de 1.500 € al año",
      3: "3. Cualquier otra situación",
    },
    children: "Hijos menores de 25 que viven contigo",
    contract: "Tipo de contrato",
    contractOptions: { "open-ended": "Indefinido (también fijo discontinuo)", "fixed-term": "Temporal de un año o más", short: "Temporal de menos de un año" },
    results: "Resultado",
    net: "Paga extra de Navidad neta",
    gross: "Paga extra bruta",
    grossOf: (full) => `de ${full} por el periodo entero`,
    irpf: (rate) => `Retención de IRPF (${rate})`,
    ss: "Seguridad Social en el mes de la paga",
    proratedNone: "Con las pagas prorrateadas no hay paga extra en diciembre: la cobras repartida en las 12 nóminas.",
    proratedShare: "Parte de la paga de Navidad en cada nómina (bruta)",
    proratedShareNet: "Neto de la paga de Navidad en cada nómina",
    proratedYear: "Paga de Navidad en todo el año (bruta)",
    newHire: (start, days, of, pct) => `Entraste el ${start}: cuentan ${days} de los ${of} días del periodo de devengo, el ${pct} de la paga.`,
    estimateNote: (annual, rate) => `Retención estimada con el algoritmo de la Agencia Tributaria para ${annual} brutos al año: ${rate}, el mismo tipo que en tus nóminas ordinarias. Edad menor de 65 y sin discapacidad; para otros casos, usa la calculadora de sueldo neto o el tipo de tu nómina.`,
    estimateNewHire: "Has empezado este año: tu empresa calcula el tipo con lo que vas a cobrar en el año natural, que es menos que un año entero de sueldo, así que tu tipo real puede ser más bajo. Para afinar, usa el de tu nómina.",
    ssNote: (rate, gross, paid) => `Sin Seguridad Social en la paga: ya se cotiza cada mes, porque la base de cada nómina incluye la doceava parte de las extras. Por esta paga pagas el ${rate} de ${gross}, unos ${paid} repartidos en tus nóminas del año.`,
    ssCapped: (max) => `Sin Seguridad Social en la paga: ya se cotiza cada mes con la prorrata de las extras. Tu base llega al tope (${max} al mes): por encima solo se paga la cotización de solidaridad.`,
    errors: {
      salary: "Escribe tu sueldo bruto.",
      start: "La fecha de alta tiene que ser una fecha de 2026 como mucho, hasta el 31 de diciembre.",
      rate: "El tipo de retención tiene que estar entre 0 y 100 %.",
      foral: "En Navarra y el País Vasco la retención sigue tablas forales que esta calculadora no estima: elige «Usar el tipo de mi nómina».",
    },
    disclaimer: "Es una estimación con las reglas generales. Tu convenio colectivo fija el importe, el periodo de devengo y cómo cuentan las bajas o los permisos; la retención real puede cambiar si tu empresa regulariza el tipo. Ante una duda, tu nómina y tu convenio mandan.",
  },
  ca: {
    title: "Calcula la teva paga extra de Nadal",
    intro: "Posa el teu sou i com et paguen les extres: en surt el brut, la part que et toca si vas entrar aquest any, la retenció d'IRPF i el net. Es calcula al teu navegador; no desem res.",
    noscript: "Sense JavaScript veus l'exemple de 30.000 € l'any; per al teu cas cal activar-lo.",
    mode: "Conec el meu sou brut",
    modeOptions: { annual: "Anual", monthly: "Mensual" },
    salary: { annual: "Sou brut anual", monthly: "Sou brut mensual" },
    salaryHint: {
      annual: "Tot l'any abans d'impostos, amb les dues pagues extra.",
      monthly: "El d'una nòmina ordinària, sense la línia de prorrata de pagues extra ni hores extra.",
    },
    payments: "Com cobres les pagues extra",
    paymentsOptions: { 14: "A part, al seu mes (14 pagues)", 12: "Prorratejades a cada nòmina (12 pagues)" },
    extraAmount: "Import de la paga segons el teu conveni (opcional)",
    extraAmountHint: "Buit = una mensualitat: el brut mensual, o l'anual entre 14. Si el teu conveni fixa una altra xifra (per exemple, només el salari base), escriu-la.",
    accrual: "Període de meritació de la paga de Nadal",
    accrualOptions: { annual: "Anual: de l'1 de gener al 31 de desembre", semester: "Semestral: de l'1 de juliol al 31 de desembre" },
    accrualHint: "Ho diu el teu conveni. Només canvia res si vas començar a treballar aquest any.",
    start: "Data d'alta a l'empresa (només si va ser el 2026)",
    startHint: "Buit = has treballat tot el període de meritació.",
    withholding: "Retenció d'IRPF",
    withholdingOptions: { estimate: "Estimar-la (algoritme de l'Agència Tributària)", payslip: "Fer servir el tipus de la meva nòmina" },
    rate: "Tipus de retenció de la teva nòmina",
    rateHint: "El percentatge d'IRPF que surt a la teva última nòmina.",
    region: "On vius",
    family: "Situació familiar (model 145)",
    familyOptions: {
      1: "1. Solter, vidu, divorciat o separat amb fills menors que viuen només amb tu",
      2: "2. Casat, i el teu cònjuge no guanya més de 1.500 € l'any",
      3: "3. Qualsevol altra situació",
    },
    children: "Fills menors de 25 anys que viuen amb tu",
    contract: "Tipus de contracte",
    contractOptions: { "open-ended": "Indefinit (també fix discontinu)", "fixed-term": "Temporal d'un any o més", short: "Temporal de menys d'un any" },
    results: "Resultat",
    net: "Paga extra de Nadal neta",
    gross: "Paga extra bruta",
    grossOf: (full) => `de ${full} pel període sencer`,
    irpf: (rate) => `Retenció d'IRPF (${rate})`,
    ss: "Seguretat Social al mes de la paga",
    proratedNone: "Amb les pagues prorratejades no hi ha paga extra al desembre: la cobres repartida en les 12 nòmines.",
    proratedShare: "Part de la paga de Nadal a cada nòmina (bruta)",
    proratedShareNet: "Net de la paga de Nadal a cada nòmina",
    proratedYear: "Paga de Nadal en tot l'any (bruta)",
    newHire: (start, days, of, pct) => `Vas entrar ${start}: compten ${days} dels ${of} dies del període de meritació, el ${pct} de la paga.`,
    estimateNote: (annual, rate) => `Retenció estimada amb l'algoritme de l'Agència Tributària per a ${annual} bruts l'any: ${rate}, el mateix tipus que a les teves nòmines ordinàries. Edat de menys de 65 anys i sense discapacitat; per a altres casos, fes servir la calculadora de sou net o el tipus de la teva nòmina.`,
    estimateNewHire: "Has començat aquest any: la teva empresa calcula el tipus amb el que cobraràs durant l'any natural, que és menys que un any sencer de sou, així que el teu tipus real pot ser més baix. Per afinar, fes servir el de la teva nòmina.",
    ssNote: (rate, gross, paid) => `Sense Seguretat Social a la paga: ja es cotitza cada mes, perquè la base de cada nòmina inclou la dotzena part de les extres. Per aquesta paga pagues el ${rate} de ${gross}, uns ${paid} repartits a les teves nòmines de l'any.`,
    ssCapped: (max) => `Sense Seguretat Social a la paga: ja es cotitza cada mes amb la prorrata de les extres. La teva base arriba al topall (${max} al mes): per sobre només es paga la cotització de solidaritat.`,
    errors: {
      salary: "Escriu el teu sou brut.",
      start: "La data d'alta ha de ser del 2026 com a molt, fins al 31 de desembre.",
      rate: "El tipus de retenció ha d'estar entre 0 i 100 %.",
      foral: "A Navarra i al País Basc la retenció segueix taules forals que aquesta calculadora no estima: tria «Fer servir el tipus de la meva nòmina».",
    },
    disclaimer: "És una estimació amb les regles generals. El teu conveni col·lectiu fixa l'import, el període de meritació i com compten les baixes o els permisos; la retenció real pot canviar si l'empresa regularitza el tipus. En cas de dubte, manen la teva nòmina i el teu conveni.",
  },
  en: {
    title: "Work out your Christmas extra pay",
    intro: "Enter your salary and how your extra payments are paid: you get the gross, the part you have earned if you started this year, the IRPF withheld and the net. It runs in your browser; nothing is stored.",
    noscript: "Without JavaScript you see the €30,000-a-year example; your own case needs it switched on.",
    mode: "I know my gross salary",
    modeOptions: { annual: "Per year", monthly: "Per month" },
    salary: { annual: "Gross annual salary", monthly: "Gross monthly salary" },
    salaryHint: {
      annual: "The whole year before tax, both extra payments included.",
      monthly: "One ordinary payslip, without the prorated extra-pay line or overtime.",
    },
    payments: "How your extra payments are paid",
    paymentsOptions: { 14: "Separately, in their own month (14 payments)", 12: "Spread over each payslip (12 payments)" },
    extraAmount: "Amount set by your collective agreement (optional)",
    extraAmountHint: "Empty = one month's pay: the monthly gross, or the annual gross divided by 14. If your agreement sets another figure (for example, base salary only), enter it.",
    accrual: "Accrual period of the Christmas pay",
    accrualOptions: { annual: "Yearly: 1 January to 31 December", semester: "Half-yearly: 1 July to 31 December" },
    accrualHint: "Your collective agreement says which. It only matters if you started work this year.",
    start: "Date you joined the company (only if in 2026)",
    startHint: "Empty = you worked the whole accrual period.",
    withholding: "IRPF withholding",
    withholdingOptions: { estimate: "Estimate it (Tax Agency algorithm)", payslip: "Use the rate on my payslip" },
    rate: "Withholding rate on your payslip",
    rateHint: "The IRPF percentage on your latest payslip.",
    region: "Where you live",
    family: "Family situation (form 145)",
    familyOptions: {
      1: "1. Single, widowed, divorced or separated, with under-age children living only with you",
      2: "2. Married, and your spouse earns no more than €1,500 a year",
      3: "3. Any other situation",
    },
    children: "Children under 25 living with you",
    contract: "Contract type",
    contractOptions: { "open-ended": "Open-ended (also fijo discontinuo)", "fixed-term": "Fixed-term, one year or more", short: "Fixed-term, under one year" },
    results: "Result",
    net: "Net Christmas extra pay",
    gross: "Gross extra pay",
    grossOf: (full) => `of ${full} for the whole period`,
    irpf: (rate) => `IRPF withholding (${rate})`,
    ss: "Social Security in the extra pay's month",
    proratedNone: "With prorated payments there is no extra payment in December: you get it spread over the 12 payslips.",
    proratedShare: "Christmas pay share in each payslip (gross)",
    proratedShareNet: "Net Christmas pay share in each payslip",
    proratedYear: "Christmas pay over the whole year (gross)",
    newHire: (start, days, of, pct) => `You joined on ${start}: ${days} of the period's ${of} days count, ${pct} of the payment.`,
    estimateNote: (annual, rate) => `Withholding estimated with the Tax Agency's algorithm for ${annual} gross a year: ${rate}, the same rate as on your ordinary payslips. Under 65 and no disability; for other cases, use the net salary calculator or the rate on your payslip.`,
    estimateNewHire: "You started this year: your employer works out the rate on what you will earn in the calendar year, which is less than a full year's salary, so your real rate may be lower. For a closer figure, use the one on your payslip.",
    ssNote: (rate, gross, paid) => `No Social Security on the extra payment: it is paid every month, because each payslip's contribution base includes one twelfth of the extras. On this payment you pay ${rate} of ${gross}, about ${paid} spread over the year's payslips.`,
    ssCapped: (max) => `No Social Security on the extra payment: the extras' monthly share is already in every payslip's base. Your base reaches the cap (${max} a month): above it only the solidarity contribution applies.`,
    errors: {
      salary: "Enter your gross salary.",
      start: "The start date must be in 2026 at the latest, up to 31 December.",
      rate: "The withholding rate must be between 0 and 100%.",
      foral: "In Navarre and the Basque Country withholding follows foral tables this calculator does not estimate: choose \"Use the rate on my payslip\".",
    },
    disclaimer: "This is an estimate under the general rules. Your collective agreement sets the amount, the accrual period and how sick leave or other leave counts; the actual withholding can change if your employer adjusts the rate. If in doubt, your payslip and your agreement prevail.",
  },
};
