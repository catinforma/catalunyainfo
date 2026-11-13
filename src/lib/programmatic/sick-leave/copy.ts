import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { addDays, daysBetween, isIsoDate } from "@/lib/programmatic/employment/dates";
import { MONTHS, dayMonth, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { money, parseAmount, percent } from "@/lib/programmatic/net-salary/copy";

import { CONTINGENCIES, SPECIAL_KINDS, type Band, type Contingency, type Payer, type SickLeaveInput, type SickLeaveResult, type SpecialKind } from "./engine";
import { DAYS, MAX_BASE_2026, MAX_BASE_YEAR, REFORM_FROM } from "./rules";

/**
 * Paths and words of the sick-leave pay calculator, small enough for the
 * browser (the client component imports this file, the engine and the
 * rules; nothing that reads data).
 *
 *   /es/calculadoras/baja-laboral/
 *   /ca/calculadores/baixa-laboral/
 *   /en/calculators/sick-leave-pay-spain/
 */

export type SlLocale = Locale;
export const SL_LOCALES: readonly SlLocale[] = ["es", "ca", "en"];

export { money, parseAmount, percent };

export function sickLeavePath(locale: SlLocale): string {
  return calcPath("sick-leave", locale);
}

export function sickLeaveEditions(): Record<SlLocale, string> {
  return { ca: sickLeavePath("ca"), es: sickLeavePath("es"), en: sickLeavePath("en") };
}

/** "octubre de 2026" / "d'octubre de 2026" (ca, after "base de") / "October 2026". */
export function monthYear(ref: { year: number; month: number }, locale: SlLocale): string {
  const name = MONTHS[locale][ref.month - 1] ?? "";
  if (locale === "en") return `${name} ${ref.year}`;
  return `${name} de ${ref.year}`;
}

/** "de octubre de 2026" / "d'octubre de 2026" / "for October 2026". */
export function ofMonthYear(ref: { year: number; month: number }, locale: SlLocale): string {
  const text = monthYear(ref, locale);
  if (locale === "en") return `for ${text}`;
  if (locale === "ca" && /^[aeiouàèéíòóú]/i.test(text)) return `d'${text}`;
  return `de ${text}`;
}

/** "Días 4 a 15" / "Dies 4 a 15" / "Days 4 to 15"; a single day: "Día 1". */
export function bandDays(b: Band, locale: SlLocale): string {
  if (b.from === b.to) return { es: `Día ${b.from}`, ca: `Dia ${b.from}`, en: `Day ${b.from}` }[locale];
  return { es: `Días ${b.from} a ${b.to}`, ca: `Dies ${b.from} a ${b.to}`, en: `Days ${b.from} to ${b.to}` }[locale];
}

/** "4 dic – 15 dic" style, from the ISO dates. */
export function bandDates(b: Band, locale: SlLocale): string {
  const a = dayMonth(b.startDate, locale);
  if (b.startDate === b.endDate) return a;
  return `${a} – ${dayMonth(b.endDate, locale)}`;
}

/** Last day of the baja from the first and the number of days (both counted). */
export function endFromDays(start: string, days: number): string {
  return addDays(start, Math.max(1, days) - 1);
}

/** Number of days from the first to the last day of baja, both counted; 0 if the end is before the start. */
export function daysFromEnd(start: string, end: string): number {
  if (!isIsoDate(start) || !isIsoDate(end)) return 0;
  return Math.max(0, daysBetween(start, end) + 1);
}

/* -------------------------------------------------------------------------- */
/* Shareable state in the URL hash                                            */
/* -------------------------------------------------------------------------- */

const C_CODE: Record<Contingency, string> = { common: "c", professional: "p", special: "s" };
const K_CODE: Record<SpecialKind, string> = { menstruation: "m", pregnancy: "e", menopause: "n", violence: "v", donation: "d" };

/** "#t=c&b=1800&s=2026-12-01&n=30" (+ "k", "d", "o", "x", "f" when not the default). */
export function writeHash(s: SickLeaveInput): string {
  const p = new URLSearchParams();
  p.set("t", C_CODE[s.contingency]);
  if (s.contingency === "special") p.set("k", K_CODE[s.special]);
  p.set("b", String(s.base));
  if (s.baseDays !== 30) p.set("d", String(s.baseDays));
  if (s.contingency === "professional" && s.overtime > 0) p.set("o", String(s.overtime));
  p.set("s", s.start);
  p.set("n", String(s.days));
  if (s.complementPct > 0) {
    p.set("x", String(s.complementPct));
    if (s.complementFrom !== 1) p.set("f", String(s.complementFrom));
  }
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: SickLeaveInput): SickLeaveInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: SickLeaveInput = { ...base };
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : NaN);
  const c = CONTINGENCIES.find((x) => C_CODE[x] === p.get("t"));
  if (c) out.contingency = c;
  const k = SPECIAL_KINDS.find((x) => K_CODE[x] === p.get("k"));
  if (k) out.special = k;
  const b = num("b");
  if (Number.isFinite(b) && b >= 0 && b <= 100_000) out.base = b;
  const d = num("d");
  if (Number.isInteger(d) && d >= 1 && d <= 31) out.baseDays = d;
  const o = num("o");
  out.overtime = Number.isFinite(o) && o >= 0 && o <= 1_000_000 ? o : 0;
  const s = p.get("s") ?? "";
  if (isIsoDate(s) && s >= "2000-01-01" && s <= "2100-12-31") out.start = s;
  const n = num("n");
  if (Number.isInteger(n) && n >= 1 && n <= 5000) out.days = n;
  const x = num("x");
  out.complementPct = Number.isFinite(x) && x >= 0 && x <= 100 ? x : 0;
  const f = num("f");
  out.complementFrom = Number.isInteger(f) && f >= 1 && f <= DAYS.absoluteMax ? f : 1;
  return out;
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

export interface CalculatorCopy {
  title: string;
  intro: string;
  noscript: string;
  contingency: string;
  contingencyOptions: Record<Contingency, string>;
  special: string;
  specialOptions: Record<SpecialKind, string>;
  start: string;
  days: string;
  end: string;
  endHint: string;
  base: (r: SickLeaveResult, c: Contingency) => string;
  baseHint: (r: SickLeaveResult) => string;
  gross: string;
  grossButton: string;
  grossHint: string;
  baseDays: string;
  baseDaysHint: string;
  overtime: string;
  overtimeHint: string;
  complement: string;
  complementHint: string;
  complementFrom: string;
  results: string;
  total: (r: SickLeaveResult) => string;
  benefit: string;
  employer: string;
  entity: string;
  complementTotal: string;
  dailyBase: string;
  salaryDays: (n: number) => string;
  cols: { days: string; dates: string; pct: string; payer: string; amount: string; complement: string };
  payer: (b: Band) => string;
  regime: (r: SickLeaveResult) => string;
  irpf: string;
  clamped: string;
  maxUnknown: string;
  capped: string;
  extension: string;
  specialNotYet: string;
  pregnancy: string;
  share: string;
  disclaimer: string;
}

const MAX = (l: SlLocale) => money(MAX_BASE_2026, l);
const REFORM_DATE = (l: SlLocale) => dayMonthYear(REFORM_FROM, l);

const PAYER_WORDS: Record<SlLocale, Record<Payer | "salary", string>> = {
  es: { none: "Nadie: sin prestación (salvo convenio)", employer: "Empresa (a su cargo)", entity: "INSS o mutua (te lo abona la empresa en nómina)", salary: "Empresa: salario íntegro del día" },
  ca: { none: "Ningú: sense prestació (llevat de conveni)", employer: "Empresa (a càrrec seu)", entity: "INSS o mútua (te l'abona l'empresa a la nòmina)", salary: "Empresa: salari íntegre del dia" },
  en: { none: "Nobody: no benefit (unless your agreement pays)", employer: "Employer (at its own cost)", entity: "INSS or mutua (your employer pays it with your salary)", salary: "Employer: that day's full salary" },
};

export function payerText(b: Band, locale: SlLocale): string {
  return b.kind === "salary" ? PAYER_WORDS[locale].salary : PAYER_WORDS[locale][b.payer];
}

export const CALC_COPY: Record<SlLocale, CalculatorCopy> = {
  es: {
    title: "Calcula lo que cobras de baja",
    intro: "Para trabajadores por cuenta ajena del Régimen General. Elige el tipo de baja, la fecha de inicio y los días, y la base de cotización que figura en tu nómina.",
    noscript: "Sin JavaScript ves el ejemplo de abajo (baja por enfermedad común de 30 días desde el 1 de diciembre de 2026, base de 1.800 €). Activa JavaScript para calcular tu caso.",
    contingency: "Tipo de baja",
    contingencyOptions: {
      common: "Enfermedad común o accidente no laboral",
      professional: "Accidente de trabajo o enfermedad profesional",
      special: "Situación especial (menstruación, embarazo, menopausia, violencia de género, donación)",
    },
    special: "Situación especial",
    specialOptions: {
      menstruation: "Menstruación incapacitante secundaria",
      pregnancy: "Interrupción del embarazo o gestación desde la semana 39",
      menopause: "Trastorno menopáusico (bajas desde el 1-12-2026)",
      violence: "Lesiones por violencia de género (bajas desde el 1-12-2026)",
      donation: "Donación de órganos o tejidos",
    },
    start: "Primer día de baja",
    days: "Días de baja",
    end: "Último día de baja",
    endHint: "El último día que estás de baja, no el día que vuelves. Cambia los días o esta fecha: se recalculan entre sí.",
    base: (r, c) => `Base de cotización por contingencias ${c === "professional" ? "profesionales (sin horas extra)" : "comunes"} ${ofMonthYear(r.referenceMonth, "es")}`,
    baseHint: (r) =>
      r.regime === "from-dec-2026"
        ? `Desde el ${REFORM_DATE("es")} cuenta la base del mes anterior al anterior a la baja (art. 171.2 de la Ley General de la Seguridad Social). Está en la nómina de ese mes. Máximo en ${MAX_BASE_YEAR}: ${MAX("es")}.`
        : `Para bajas hasta el 30 de noviembre de 2026 cuenta la base del mes anterior a la baja. Está en la nómina de ese mes. Máximo en ${MAX_BASE_YEAR}: ${MAX("es")}.`,
    gross: "¿No la tienes? Salario bruto anual",
    grossButton: "Usar como base",
    grossHint: `Estimación: la doceava parte (con las pagas extra prorrateadas), hasta ${MAX("es")}. La base real de la nómina manda.`,
    baseDays: "Días a los que se refiere esa base",
    baseDaysHint: "30 si cobras por meses y estuviste de alta todo el mes; si cobras por días, los días de ese mes.",
    overtime: "Horas extra cotizadas el año anterior (opcional)",
    overtimeHint: "Solo en accidente de trabajo o enfermedad profesional: se suman divididas entre 365.",
    complement: "Complemento del convenio: hasta el % de la base (opcional)",
    complementHint: "Si tu convenio o contrato completa la prestación (por ejemplo, hasta el 100 %), escribe el porcentaje. Lo paga la empresa. Déjalo en 0 si no lo sabes.",
    complementFrom: "El complemento empieza el día",
    results: "Resultado",
    total: (r) => (r.totals.complement > 0 ? "Total bruto (prestación + complemento)" : "Prestación bruta total"),
    benefit: "Prestación de la Seguridad Social",
    employer: "De ella, a cargo de la empresa (días 4 a 15)",
    entity: "De ella, a cargo del INSS o la mutua",
    complementTotal: "Complemento del convenio (empresa)",
    dailyBase: "Base reguladora diaria",
    salaryDays: (n) => `${n === 1 ? "1 día" : `${n} días`} con salario íntegro a cargo de la empresa (no es prestación; no se suma arriba)`,
    cols: { days: "Días", dates: "Fechas", pct: "% de la base", payer: "Quién paga", amount: "Prestación", complement: "Complemento" },
    payer: (b) => payerText(b, "es"),
    regime: (r) =>
      r.regime === "from-dec-2026"
        ? `Baja iniciada desde el ${REFORM_DATE("es")}: se aplica la Ley General de la Seguridad Social con los cambios del Real Decreto-ley 31/2026.`
        : `Baja iniciada antes del ${REFORM_DATE("es")}: se aplica la Ley General de la Seguridad Social anterior al Real Decreto-ley 31/2026.`,
    irpf: "Importes brutos. La prestación tributa en el IRPF como rendimiento del trabajo: se te aplica la retención como al sueldo, y durante la baja sigues cotizando (tu parte se descuenta en la nómina).",
    clamped: `La base supera el máximo de ${MAX_BASE_YEAR} (${MAX("es")}): se calcula con el máximo.`,
    maxUnknown: `El mes de la base es posterior a ${MAX_BASE_YEAR}: no se aplica ningún máximo porque el de ese año no está publicado en esta calculadora.`,
    capped: `La baja no puede pasar de ${DAYS.absoluteMax} días (365 + 180 de prórroga): se calcula hasta el día ${DAYS.absoluteMax}.`,
    extension: "A partir del día 366 hace falta la prórroga del INSS (solo su inspección médica puede darla).",
    specialNotYet: `Antes del ${REFORM_DATE("es")} esta baja no era una situación especial: se calcula como enfermedad común.`,
    pregnancy: "En la baja desde la semana 39 de gestación la prestación dura hasta el parto.",
    share: "El enlace de esta página guarda los datos que has puesto: puedes copiarlo para compartir el cálculo.",
    disclaimer: "Cálculo orientativo con las normas publicadas en el BOE; no sustituye la resolución del INSS o de la mutua ni tu convenio. No incluye recaídas, pluriempleo, contratos a tiempo parcial o fijos discontinuos, autónomos ni regímenes especiales.",
  },
  ca: {
    title: "Calcula què cobres de baixa",
    intro: "Per a treballadors per compte d'altri del règim general. Tria el tipus de baixa, la data d'inici i els dies, i la base de cotització que surt a la teva nòmina.",
    noscript: "Sense JavaScript veus l'exemple de sota (baixa per malaltia comuna de 30 dies des de l'1 de desembre de 2026, base de 1.800 €). Activa JavaScript per calcular el teu cas.",
    contingency: "Tipus de baixa",
    contingencyOptions: {
      common: "Malaltia comuna o accident no laboral",
      professional: "Accident de treball o malaltia professional",
      special: "Situació especial (menstruació, embaràs, menopausa, violència de gènere, donació)",
    },
    special: "Situació especial",
    specialOptions: {
      menstruation: "Menstruació incapacitant secundària",
      pregnancy: "Interrupció de l'embaràs o gestació des de la setmana 39",
      menopause: "Trastorn menopàusic (baixes des de l'1-12-2026)",
      violence: "Lesions per violència de gènere (baixes des de l'1-12-2026)",
      donation: "Donació d'òrgans o teixits",
    },
    start: "Primer dia de baixa",
    days: "Dies de baixa",
    end: "Últim dia de baixa",
    endHint: "L'últim dia que estàs de baixa, no el dia que tornes. Canvia els dies o aquesta data: es recalculen entre si.",
    base: (r, c) => `Base de cotització per contingències ${c === "professional" ? "professionals (sense hores extra)" : "comunes"} ${ofMonthYear(r.referenceMonth, "ca")}`,
    baseHint: (r) =>
      r.regime === "from-dec-2026"
        ? `Des de l'${REFORM_DATE("ca")} compta la base del mes anterior a l'anterior a la baixa (art. 171.2 de la Llei general de la Seguretat Social). És a la nòmina d'aquell mes. Màxim el ${MAX_BASE_YEAR}: ${MAX("ca")}.`
        : `Per a baixes fins al 30 de novembre de 2026 compta la base del mes anterior a la baixa. És a la nòmina d'aquell mes. Màxim el ${MAX_BASE_YEAR}: ${MAX("ca")}.`,
    gross: "No la tens? Salari brut anual",
    grossButton: "Fer-lo servir com a base",
    grossHint: `Estimació: la dotzena part (amb les pagues extra prorratejades), fins a ${MAX("ca")}. Mana la base real de la nòmina.`,
    baseDays: "Dies als quals es refereix aquesta base",
    baseDaysHint: "30 si cobres per mesos i vas estar d'alta tot el mes; si cobres per dies, els dies d'aquell mes.",
    overtime: "Hores extra cotitzades l'any anterior (opcional)",
    overtimeHint: "Només en accident de treball o malaltia professional: se sumen dividides entre 365.",
    complement: "Complement del conveni: fins al % de la base (opcional)",
    complementHint: "Si el teu conveni o contracte completa la prestació (per exemple, fins al 100 %), escriu el percentatge. El paga l'empresa. Deixa-ho en 0 si no ho saps.",
    complementFrom: "El complement comença el dia",
    results: "Resultat",
    total: (r) => (r.totals.complement > 0 ? "Total brut (prestació + complement)" : "Prestació bruta total"),
    benefit: "Prestació de la Seguretat Social",
    employer: "D'aquesta, a càrrec de l'empresa (dies 4 a 15)",
    entity: "D'aquesta, a càrrec de l'INSS o la mútua",
    complementTotal: "Complement del conveni (empresa)",
    dailyBase: "Base reguladora diària",
    salaryDays: (n) => `${n === 1 ? "1 dia" : `${n} dies`} amb salari íntegre a càrrec de l'empresa (no és prestació; no se suma a dalt)`,
    cols: { days: "Dies", dates: "Dates", pct: "% de la base", payer: "Qui paga", amount: "Prestació", complement: "Complement" },
    payer: (b) => payerText(b, "ca"),
    regime: (r) =>
      r.regime === "from-dec-2026"
        ? `Baixa iniciada des de l'${REFORM_DATE("ca")}: s'aplica la Llei general de la Seguretat Social amb els canvis del Reial decret llei 31/2026.`
        : `Baixa iniciada abans de l'${REFORM_DATE("ca")}: s'aplica la Llei general de la Seguretat Social anterior al Reial decret llei 31/2026.`,
    irpf: "Imports bruts. La prestació tributa a l'IRPF com a rendiment del treball: se t'aplica la retenció com al sou, i durant la baixa continues cotitzant (la teva part es descompta a la nòmina).",
    clamped: `La base supera el màxim del ${MAX_BASE_YEAR} (${MAX("ca")}): es calcula amb el màxim.`,
    maxUnknown: `El mes de la base és posterior al ${MAX_BASE_YEAR}: no s'aplica cap màxim perquè el d'aquell any no és publicat en aquesta calculadora.`,
    capped: `La baixa no pot passar de ${DAYS.absoluteMax} dies (365 + 180 de pròrroga): es calcula fins al dia ${DAYS.absoluteMax}.`,
    extension: "A partir del dia 366 cal la pròrroga de l'INSS (només la seva inspecció mèdica la pot donar).",
    specialNotYet: `Abans de l'${REFORM_DATE("ca")} aquesta baixa no era una situació especial: es calcula com a malaltia comuna.`,
    pregnancy: "En la baixa des de la setmana 39 de gestació la prestació dura fins al part.",
    share: "L'enllaç d'aquesta pàgina guarda les dades que has posat: el pots copiar per compartir el càlcul.",
    disclaimer: "Càlcul orientatiu amb les normes publicades al BOE; no substitueix la resolució de l'INSS o de la mútua ni el teu conveni. No inclou recaigudes, pluriocupació, contractes a temps parcial o fixos discontinus, autònoms ni règims especials.",
  },
  en: {
    title: "Work out your sick pay",
    intro: "For employees in Spain's General Social Security Regime. Choose the kind of sick leave, the first day and the number of days, and the contribution base on your payslip.",
    noscript: "Without JavaScript you see the example below (30 days of ordinary illness from 1 December 2026, a €1,800 base). Turn JavaScript on to work out your own case.",
    contingency: "Kind of sick leave",
    contingencyOptions: {
      common: "Ordinary illness or non-work accident",
      professional: "Work accident or occupational disease",
      special: "Special case (menstruation, pregnancy, menopause, gender violence, donation)",
    },
    special: "Special case",
    specialOptions: {
      menstruation: "Secondary incapacitating menstruation",
      pregnancy: "Termination of pregnancy, or pregnancy from week 39",
      menopause: "Menopausal disorder (leave from 1 Dec 2026)",
      violence: "Injuries from gender violence (leave from 1 Dec 2026)",
      donation: "Organ or tissue donation",
    },
    start: "First day of sick leave",
    days: "Days of sick leave",
    end: "Last day of sick leave",
    endHint: "The last day you are off, not the day you go back. Change the days or this date: each updates the other.",
    base: (r, c) => `${c === "professional" ? "Professional-contingencies" : "Common-contingencies"} contribution base ${ofMonthYear(r.referenceMonth, "en")}${c === "professional" ? " (without overtime)" : ""}`,
    baseHint: (r) =>
      r.regime === "from-dec-2026"
        ? `From ${REFORM_DATE("en")} the base of the month before last counts (General Social Security Act, art. 171.2). It is on that month's payslip. ${MAX_BASE_YEAR} maximum: ${MAX("en")}.`
        : `For sick leave starting up to 30 November 2026 the base of the month before counts. It is on that month's payslip. ${MAX_BASE_YEAR} maximum: ${MAX("en")}.`,
    gross: "Don't have it? Gross annual salary",
    grossButton: "Use as base",
    grossHint: `Estimate: one twelfth (extra payments spread over the year), up to ${MAX("en")}. The base on your payslip is what counts.`,
    baseDays: "Days that base covers",
    baseDaysHint: "30 if you are paid monthly and worked the whole month; if paid by the day, that month's days.",
    overtime: "Overtime contributed last year (optional)",
    overtimeHint: "Work accidents and occupational diseases only: added divided by 365.",
    complement: "Collective agreement top-up: up to % of the base (optional)",
    complementHint: "If your agreement (convenio) or contract tops the benefit up (say, to 100%), enter the percentage. Your employer pays it. Leave 0 if you don't know.",
    complementFrom: "Top-up starts on day",
    results: "Result",
    total: (r) => (r.totals.complement > 0 ? "Gross total (benefit + top-up)" : "Total gross benefit"),
    benefit: "Social Security benefit",
    employer: "Of which borne by the employer (days 4 to 15)",
    entity: "Of which borne by the INSS or the mutua",
    complementTotal: "Agreement top-up (employer)",
    dailyBase: "Daily base (base reguladora)",
    salaryDays: (n) => `${n === 1 ? "1 day" : `${n} days`} on full salary paid by the employer (not a benefit; not added above)`,
    cols: { days: "Days", dates: "Dates", pct: "% of base", payer: "Who pays", amount: "Benefit", complement: "Top-up" },
    payer: (b) => payerText(b, "en"),
    regime: (r) =>
      r.regime === "from-dec-2026"
        ? `Leave starting on or after ${REFORM_DATE("en")}: the General Social Security Act applies as amended by Royal Decree-law 31/2026.`
        : `Leave starting before ${REFORM_DATE("en")}: the General Social Security Act applies as it stood before Royal Decree-law 31/2026.`,
    irpf: "Gross amounts. The benefit is taxed as employment income: income tax (IRPF) is withheld from it as from your salary, and you keep paying Social Security contributions during the leave (your share comes off the payslip).",
    clamped: `The base is above the ${MAX_BASE_YEAR} maximum (${MAX("en")}): the maximum is used.`,
    maxUnknown: `The base month is after ${MAX_BASE_YEAR}: no maximum is applied because that year's is not loaded in this calculator.`,
    capped: `Sick leave cannot go beyond ${DAYS.absoluteMax} days (365 + a 180-day extension): worked out up to day ${DAYS.absoluteMax}.`,
    extension: "From day 366 the INSS must grant the extension (only its medical inspectors can).",
    specialNotYet: `Before ${REFORM_DATE("en")} this was not a special case: worked out as ordinary illness.`,
    pregnancy: "Leave from week 39 of pregnancy is paid until the birth.",
    share: "This page's link keeps what you entered: copy it to share the calculation.",
    disclaimer: "An estimate under the rules published in the BOE; it does not replace the INSS's or the mutua's decision or your collective agreement. It leaves out relapses, several jobs at once, part-time and fijo-discontinuo contracts, the self-employed and special regimes.",
  },
};
