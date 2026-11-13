import type { Locale } from "@/lib/i18n/config";
import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";

import type { AgeBand, Contract, Disability, FamilySituation, SalaryInput } from "./engine";
import { IRPF, SOCIAL_SECURITY } from "./rules-2026";

/**
 * Paths and words of the net salary calculator, small enough for the
 * browser (the client component imports this file, the engine, the regions
 * and the rules; nothing that reads data).
 *
 *   /es/calculadoras/sueldo-neto/
 *   /ca/calculadores/sou-net/
 *   /en/calculators/net-salary-spain/
 */

export type NetLocale = Locale;
export const NET_LOCALES: readonly NetLocale[] = ["es", "ca", "en"];
/** From the family registry (lib/programmatic/calculators/paths.ts). */
export const NET_SLUG: Record<NetLocale, string> = calculatorSlugs("net-salary");

export function netSalaryPath(locale: NetLocale): string {
  return calcPath("net-salary", locale);
}

export function netSalaryEditions(): Record<NetLocale, string> {
  return { ca: netSalaryPath("ca"), es: netSalaryPath("es"), en: netSalaryPath("en") };
}

/* -------------------------------------------------------------------------- */
/* Numbers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * "1.628,50 €" (es, ca), "€1,628.50" (en). Written by hand, not with Intl:
 * the server and the browser must print the same characters (hydration), and
 * Spanish CLDR leaves four-digit amounts ungrouped ("1628,50"), which reads
 * oddly in a salary table.
 */
export function money(value: number, locale: NetLocale, decimals: 0 | 2 = 2): string {
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [int = "0", dec] = fixed.split(".");
  const group = locale === "en" ? "," : ".";
  const point = locale === "en" ? "." : ",";
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const body = dec ? `${grouped}${point}${dec}` : grouped;
  const sign = negative ? "−" : "";
  return locale === "en" ? `${sign}€${body}` : `${sign}${body} €`;
}

/** "16,42 %" (es, ca), "16.42%" (en). */
export function percent(value: number, locale: NetLocale, decimals = 2): string {
  const s = value.toFixed(decimals);
  return locale === "en" ? `${s}%` : `${s.replace(".", ",")} %`;
}

/**
 * Reads what people type as euros: "30000", "30.000", "30 000 €", "30,000",
 * "30.000,50", "30,000.50", "1500,5". A separator followed by exactly three
 * digits (and nothing else after the last group) groups thousands; otherwise
 * the last separator is the decimal point.
 */
export function parseAmount(text: string): number {
  const t = text.replace(/[€\s\u00a0]/g, "");
  if (!/^\d[\d.,]*$/.test(t)) return 0;
  const grouped = /^\d{1,3}([.,]\d{3})+$/.test(t) && !(t.includes(".") && t.includes(","));
  let n: number;
  if (grouped) n = Number(t.replace(/[.,]/g, ""));
  else {
    const last = Math.max(t.lastIndexOf("."), t.lastIndexOf(","));
    n = last < 0 ? Number(t) : Number(`${t.slice(0, last).replace(/[.,]/g, "")}.${t.slice(last + 1)}`);
  }
  return Number.isFinite(n) ? n : 0;
}

/* -------------------------------------------------------------------------- */
/* Shareable state in the URL hash                                            */
/* -------------------------------------------------------------------------- */

/** "#b=30000&n=14&r=cataluna&a=0&f=3&h=0&u=0&w=0&d=0&c=i&m=0&v=0". */
export function writeHash(s: SalaryInput): string {
  const p = new URLSearchParams();
  p.set("b", String(s.gross));
  p.set("n", String(s.payments));
  p.set("r", s.region);
  p.set("a", { under65: "0", "65to74": "1", "75plus": "2" }[s.age]);
  p.set("f", String(s.family));
  p.set("h", String(s.children));
  p.set("u", String(s.childrenUnder3));
  p.set("w", s.childrenWhole ? "1" : "0");
  p.set("d", { none: "0", "33": "1", "33mobility": "2", "65": "3" }[s.disability]);
  p.set("c", { "open-ended": "i", "fixed-term": "t", short: "s" }[s.contract]);
  if (s.mobility) p.set("m", "1");
  if (s.housingLoan) p.set("v", "1");
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: SalaryInput, knownRegion: (id: string) => boolean): SalaryInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: SalaryInput = { ...base };
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : NaN);
  const gross = num("b");
  if (Number.isFinite(gross) && gross >= 0 && gross <= 10_000_000) out.gross = gross;
  if (p.get("n") === "12" || p.get("n") === "14") out.payments = Number(p.get("n")) as 12 | 14;
  const region = p.get("r");
  if (region && knownRegion(region)) out.region = region;
  const age = ({ "0": "under65", "1": "65to74", "2": "75plus" } as Record<string, AgeBand>)[p.get("a") ?? ""];
  if (age) out.age = age;
  const family = num("f");
  if (family === 1 || family === 2 || family === 3) out.family = family as FamilySituation;
  const h = num("h");
  if (Number.isInteger(h) && h >= 0 && h <= 10) out.children = h;
  const u = num("u");
  if (Number.isInteger(u) && u >= 0 && u <= out.children) out.childrenUnder3 = u;
  if (p.has("w")) out.childrenWhole = p.get("w") === "1";
  const d = ({ "0": "none", "1": "33", "2": "33mobility", "3": "65" } as Record<string, Disability>)[p.get("d") ?? ""];
  if (d) out.disability = d;
  const c = ({ i: "open-ended", t: "fixed-term", s: "short" } as Record<string, Contract>)[p.get("c") ?? ""];
  if (c) out.contract = c;
  out.mobility = p.get("m") === "1";
  out.housingLoan = p.get("v") === "1";
  return out;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface CalculatorCopy {
  title: string;
  intro: string;
  noscript: string;
  gross: string;
  grossHint: string;
  payments: string;
  paymentsOption: (n: 12 | 14) => string;
  region: string;
  age: string;
  ageOptions: Record<AgeBand, string>;
  family: string;
  familyOptions: Record<FamilySituation, string>;
  family1NeedsChild: string;
  children: string;
  childrenUnder3: string;
  childrenWhole: string;
  disability: string;
  disabilityOptions: Record<Disability, string>;
  contract: string;
  contractOptions: Record<Contract, string>;
  more: string;
  mobility: string;
  housingLoan: string;
  results: string;
  netPayment: (n: 12 | 14) => string;
  extraPayment: string;
  netAnnual: string;
  grossAnnual: string;
  ss: string;
  irpf: string;
  irpfRate: string;
  effective: string;
  ssLines: Record<"commonContingencies" | "unemployment" | "vocationalTraining" | "intergenerationalEquity" | "solidarity", string>;
  exempt: string;
  limited: string;
  minimumRate: string;
  ceuta: string;
  capped: string;
  belowMinimum: string;
  foral: string;
  foralLinks: string;
  share: string;
  disclaimer: string;
}

export const CALC_COPY: Record<NetLocale, CalculatorCopy> = {
  es: {
    title: "Calcula tu sueldo neto",
    intro: "Escribe tu sueldo bruto anual y tu situación: el cálculo aplica las cotizaciones de 2026 y el algoritmo de retención de la Agencia Tributaria.",
    noscript: "Sin JavaScript ves el ejemplo de 30.000 € en Cataluña y la tabla de sueldos de abajo; para tu caso hace falta activarlo.",
    gross: "Sueldo bruto anual",
    grossHint: "Todo lo que cobras al año antes de impuestos, pagas extra incluidas.",
    payments: "Número de pagas",
    paymentsOption: (n) => (n === 14 ? "14 pagas (12 + 2 extra)" : "12 pagas (extras prorrateadas)"),
    region: "Dónde vives",
    age: "Edad a 31 de diciembre de 2026",
    ageOptions: { under65: "Menos de 65 años", "65to74": "De 65 a 74 años", "75plus": "75 años o más" },
    family: "Situación familiar (modelo 145)",
    familyOptions: {
      1: "1. Soltero, viudo, divorciado o separado, con hijos menores que viven solo contigo",
      2: "2. Casado, y tu cónyuge no gana más de 1.500 € al año",
      3: "3. Cualquier otra situación (soltero sin hijos, casado con cónyuge que trabaja…)",
    },
    family1NeedsChild: "La situación 1 exige al menos un hijo: sin hijos se calcula como situación 3.",
    children: "Hijos menores de 25 que viven contigo",
    childrenUnder3: "De ellos, nacidos en 2024 o después",
    childrenWhole: "Solo yo tengo derecho al mínimo por estos hijos (se computan por entero, no por mitad)",
    disability: "Discapacidad reconocida",
    disabilityOptions: { none: "Ninguna", "33": "Del 33 % al 64 %", "33mobility": "Del 33 % al 64 %, con ayuda de terceros o movilidad reducida", "65": "Del 65 % o más" },
    contract: "Tipo de contrato",
    contractOptions: { "open-ended": "Indefinido (también fijo discontinuo)", "fixed-term": "Temporal de un año o más", short: "Temporal de menos de un año" },
    more: "Otras circunstancias",
    mobility: "Me he mudado de municipio por este empleo (movilidad geográfica)",
    housingLoan: "Pago una hipoteca de vivienda habitual anterior a 2013 con deducción (y gano menos de {housing})",
    results: "Resultado",
    netPayment: (n) => (n === 14 ? "Neto en cada una de las 12 nóminas ordinarias" : "Neto al mes"),
    extraPayment: "Neto en cada paga extra (junio y diciembre)",
    netAnnual: "Neto al año",
    grossAnnual: "Bruto al año",
    ss: "Seguridad Social (tu parte)",
    irpf: "Retención de IRPF",
    irpfRate: "Tipo de retención",
    effective: "Lo que se va en total",
    ssLines: {
      commonContingencies: "Contingencias comunes",
      unemployment: "Desempleo",
      vocationalTraining: "Formación profesional",
      intergenerationalEquity: "Mecanismo de equidad intergeneracional (MEI)",
      solidarity: "Cotización de solidaridad",
    },
    exempt: "Con este sueldo y esta situación no hay retención: estás por debajo del límite del artículo 81 del Reglamento del IRPF.",
    limited: "Se aplica el límite del 43 %: la retención no puede pasar del 43 % de lo que cobras por encima del mínimo exento.",
    minimumRate: "Contrato de menos de un año: la retención mínima es del 2 % (0,80 % en Ceuta, Melilla y La Palma).",
    ceuta: "Residente en Ceuta, Melilla o La Palma con ingresos obtenidos allí: la retención se reduce un 60 %. En La Palma, desde el 10 de septiembre de 2026 (Real Decreto-ley 23/2026).",
    capped: "Tu sueldo supera la base máxima de cotización: cotizas por {max} al mes, más la cotización de solidaridad sobre el exceso.",
    belowMinimum: "Por debajo de la base mínima de cotización de jornada completa ({min} al mes): solo es posible a tiempo parcial, y el cálculo usa tu sueldo real.",
    foral: "Navarra y el País Vasco tienen su propio IRPF y sus propias tablas de retención, que esta calculadora no incluye. Consulta la Hacienda Foral:",
    foralLinks: "Tablas y simuladores oficiales",
    share: "El enlace de la página guarda tus datos: puedes copiarlo y compartirlo.",
    disclaimer: "Es una estimación de la retención y de las cotizaciones, no el impuesto final: lo que pagas de IRPF se decide en la declaración de la Renta, con la escala de tu comunidad y tus deducciones. Tu empresa puede aplicar un convenio, pluses o conceptos que cambian la nómina.",
  },
  ca: {
    title: "Calcula el teu sou net",
    intro: "Escriu el teu sou brut anual i la teva situació: el càlcul aplica les cotitzacions del 2026 i l'algoritme de retenció de l'Agència Tributària.",
    noscript: "Sense JavaScript veus l'exemple de 30.000 € a Catalunya i la taula de sous de sota; per al teu cas cal activar-lo.",
    gross: "Sou brut anual",
    grossHint: "Tot el que cobres a l'any abans d'impostos, pagues extra incloses.",
    payments: "Nombre de pagues",
    paymentsOption: (n) => (n === 14 ? "14 pagues (12 + 2 extra)" : "12 pagues (extres prorratejades)"),
    region: "On vius",
    age: "Edat a 31 de desembre de 2026",
    ageOptions: { under65: "Menys de 65 anys", "65to74": "De 65 a 74 anys", "75plus": "75 anys o més" },
    family: "Situació familiar (model 145)",
    familyOptions: {
      1: "1. Solter, vidu, divorciat o separat, amb fills menors que viuen només amb tu",
      2: "2. Casat, i el teu cònjuge no guanya més de 1.500 € l'any",
      3: "3. Qualsevol altra situació (solter sense fills, casat amb cònjuge que treballa…)",
    },
    family1NeedsChild: "La situació 1 demana com a mínim un fill: sense fills es calcula com a situació 3.",
    children: "Fills menors de 25 anys que viuen amb tu",
    childrenUnder3: "D'aquests, nascuts el 2024 o després",
    childrenWhole: "Només jo tinc dret al mínim per aquests fills (es computen sencers, no per meitat)",
    disability: "Discapacitat reconeguda",
    disabilityOptions: { none: "Cap", "33": "Del 33 % al 64 %", "33mobility": "Del 33 % al 64 %, amb ajuda de terceres persones o mobilitat reduïda", "65": "Del 65 % o més" },
    contract: "Tipus de contracte",
    contractOptions: { "open-ended": "Indefinit (també fix discontinu)", "fixed-term": "Temporal d'un any o més", short: "Temporal de menys d'un any" },
    more: "Altres circumstàncies",
    mobility: "M'he traslladat de municipi per aquesta feina (mobilitat geogràfica)",
    housingLoan: "Pago una hipoteca d'habitatge habitual anterior al 2013 amb deducció (i guanyo menys de {housing})",
    results: "Resultat",
    netPayment: (n) => (n === 14 ? "Net a cadascuna de les 12 nòmines ordinàries" : "Net al mes"),
    extraPayment: "Net a cada paga extra (juny i desembre)",
    netAnnual: "Net a l'any",
    grossAnnual: "Brut a l'any",
    ss: "Seguretat Social (la teva part)",
    irpf: "Retenció d'IRPF",
    irpfRate: "Tipus de retenció",
    effective: "El que se'n va en total",
    ssLines: {
      commonContingencies: "Contingències comunes",
      unemployment: "Atur",
      vocationalTraining: "Formació professional",
      intergenerationalEquity: "Mecanisme d'equitat intergeneracional (MEI)",
      solidarity: "Cotització de solidaritat",
    },
    exempt: "Amb aquest sou i aquesta situació no hi ha retenció: estàs per sota del límit de l'article 81 del Reglament de l'IRPF.",
    limited: "S'aplica el límit del 43 %: la retenció no pot superar el 43 % del que cobres per sobre del mínim exempt.",
    minimumRate: "Contracte de menys d'un any: la retenció mínima és del 2 % (0,80 % a Ceuta, Melilla i La Palma).",
    ceuta: "Resident a Ceuta, Melilla o La Palma amb ingressos obtinguts allà: la retenció es redueix un 60 %. A La Palma, des del 10 de setembre de 2026 (Reial decret llei 23/2026).",
    capped: "El teu sou supera la base màxima de cotització: cotitzes per {max} al mes, més la cotització de solidaritat sobre l'excés.",
    belowMinimum: "Per sota de la base mínima de cotització de jornada completa ({min} al mes): només és possible a temps parcial, i el càlcul fa servir el teu sou real.",
    foral: "Navarra i el País Basc tenen el seu propi IRPF i les seves taules de retenció, que aquesta calculadora no inclou. Consulta la Hisenda Foral:",
    foralLinks: "Taules i simuladors oficials",
    share: "L'enllaç de la pàgina guarda les teves dades: el pots copiar i compartir.",
    disclaimer: "És una estimació de la retenció i de les cotitzacions, no l'impost final: el que pagues d'IRPF es decideix a la declaració de la renda, amb l'escala de la teva comunitat i les teves deduccions. La teva empresa pot aplicar un conveni, plusos o conceptes que canvien la nòmina.",
  },
  en: {
    title: "Work out your net salary",
    intro: "Enter your gross annual salary and your situation: the result applies the 2026 Social Security contributions and the Spanish Tax Agency's withholding algorithm.",
    noscript: "Without JavaScript you see the €30,000 Catalonia example and the salary table below; your own case needs it switched on.",
    gross: "Gross annual salary",
    grossHint: "Everything you earn in a year before tax, extra payments included.",
    payments: "Number of payments",
    paymentsOption: (n) => (n === 14 ? "14 payments (12 + 2 extra)" : "12 payments (extras spread over the year)"),
    region: "Where you live",
    age: "Age on 31 December 2026",
    ageOptions: { under65: "Under 65", "65to74": "65 to 74", "75plus": "75 or over" },
    family: "Family situation (form 145)",
    familyOptions: {
      1: "1. Single, widowed, divorced or separated, with under-age children living only with you",
      2: "2. Married, and your spouse earns no more than €1,500 a year",
      3: "3. Any other situation (single without children, married to a working spouse…)",
    },
    family1NeedsChild: "Situation 1 needs at least one child: without children it is worked out as situation 3.",
    children: "Children under 25 living with you",
    childrenUnder3: "Of them, born in 2024 or later",
    childrenWhole: "Only I claim the allowance for these children (counted in full, not by half)",
    disability: "Recognised disability",
    disabilityOptions: { none: "None", "33": "33% to 64%", "33mobility": "33% to 64%, needing help or with reduced mobility", "65": "65% or more" },
    contract: "Contract type",
    contractOptions: { "open-ended": "Open-ended (also fijo discontinuo)", "fixed-term": "Fixed-term, one year or more", short: "Fixed-term, under one year" },
    more: "Other circumstances",
    mobility: "I moved to another town for this job (geographic mobility)",
    housingLoan: "I pay a pre-2013 mortgage on my main home with the deduction (and earn under {housing})",
    results: "Result",
    netPayment: (n) => (n === 14 ? "Net in each of the 12 ordinary payslips" : "Net per month"),
    extraPayment: "Net in each extra payment (June and December)",
    netAnnual: "Net per year",
    grossAnnual: "Gross per year",
    ss: "Social Security (your share)",
    irpf: "IRPF withholding",
    irpfRate: "Withholding rate",
    effective: "Total taken off",
    ssLines: {
      commonContingencies: "Common contingencies",
      unemployment: "Unemployment",
      vocationalTraining: "Vocational training",
      intergenerationalEquity: "Intergenerational equity mechanism (MEI)",
      solidarity: "Solidarity contribution",
    },
    exempt: "With this salary and situation there is no withholding: you are under the limit of article 81 of the IRPF Regulation.",
    limited: "The 43% cap applies: withholding cannot exceed 43% of what you earn above the exempt minimum.",
    minimumRate: "Contract under one year: the minimum withholding is 2% (0.80% in Ceuta, Melilla and La Palma).",
    ceuta: "Resident in Ceuta, Melilla or La Palma with income earned there: withholding is cut by 60%. In La Palma, from 10 September 2026 (Royal Decree-law 23/2026).",
    capped: "Your salary is above the maximum contribution base: you contribute on {max} a month, plus the solidarity contribution on the excess.",
    belowMinimum: "Below the full-time minimum contribution base ({min} a month): only possible part-time, and the result uses your actual pay.",
    foral: "Navarre and the Basque Country have their own income tax and withholding tables, which this calculator does not cover. See the regional tax office:",
    foralLinks: "Official tables and simulators",
    share: "The page link keeps your figures: you can copy and share it.",
    disclaimer: "This estimates withholding and contributions, not your final tax: what you owe in IRPF is settled in the annual return (Renta), with your region's scale and your deductions. Your employer may apply a collective agreement, bonuses or items that change the payslip.",
  },
};

/** Puts the order's and the algorithm's figures into a sentence: {max}, {min}, {housing}. */
export function fillFigures(text: string, locale: NetLocale): string {
  return text
    .replace("{max}", money(SOCIAL_SECURITY.maxBaseMonthly, locale))
    .replace("{min}", money(SOCIAL_SECURITY.minBaseMonthly, locale))
    .replace("{housing}", money(IRPF.housingPayUnder, locale));
}
