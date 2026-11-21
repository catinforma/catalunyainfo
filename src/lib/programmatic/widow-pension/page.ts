import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { WP_LOCALES, day, euros, perMonth, whole, widowEditions, type WpLocale } from "./copy";
import { calculateOk, widowCase, type WidowInput, type WidowResult } from "./engine";
import {
  BURDEN_THRESHOLD,
  BURDENS_CEILING_SS,
  BURDENS_PERCENT,
  COMPLEMENT_CAP,
  GENERAL_PERCENT,
  INCOME_LIMIT,
  NO_ALTA_YEARS,
  ALTA_DAYS,
  PARTNER_CHILDREN_COHABITATION_YEARS,
  PARTNER_COHABITATION_YEARS,
  PARTNER_REGISTRATION_YEARS,
  PAYMENTS_ORDINARY,
  RDL31_CONVALIDATED,
  REMARRIAGE_AGE,
  REMARRIAGE_INCOME_LIMIT,
  RETRO_MONTHS,
  RULES_AS_OF,
  SENIOR_AGE,
  SENIOR_PERCENT,
  TEMPORAL_YEARS,
  WIDOW_MINIMUMS,
  burdensCeiling,
  round2,
} from "./rules";

/**
 * Pure pieces of the widow's pension page: titles, the default input, the
 * worked examples (computed by the engine, so the HTML and the calculator
 * always agree), the FAQ and the sitemap entries.
 */

/** The calculator's first render: a 66-year-old widow or widower of a retirement pensioner, no other income, base 1.600 € a month. */
export const DEFAULT_INPUT: WidowInput = widowCase();

/** The figures the titles, lead and FAQ quote, straight from the rules. */
export function headline() {
  const m = (id: keyof typeof WIDOW_MINIMUMS) => round2(WIDOW_MINIMUMS[id] / PAYMENTS_ORDINARY);
  return {
    general: GENERAL_PERCENT,
    senior: SENIOR_PERCENT,
    burdens: BURDENS_PERCENT,
    seniorAge: SENIOR_AGE,
    minUnder60: m("widowUnder60"),
    min60: m("widow60"),
    min65: m("widow65"),
    minCharges: m("widowCharges"),
    incomeLimit: INCOME_LIMIT,
    burdenThreshold: BURDEN_THRESHOLD,
    ceilingUnder60: burdensCeiling(59),
    ceilingSS: BURDENS_CEILING_SS,
    complementCap: COMPLEMENT_CAP,
    altaDays: ALTA_DAYS,
    noAltaYears: NO_ALTA_YEARS,
    cohabitation: PARTNER_COHABITATION_YEARS,
    registration: PARTNER_REGISTRATION_YEARS,
    childrenCohabitation: PARTNER_CHILDREN_COHABITATION_YEARS,
    temporalYears: TEMPORAL_YEARS,
    remarriageAge: REMARRIAGE_AGE,
    remarriageIncome: REMARRIAGE_INCOME_LIMIT,
    retroMonths: RETRO_MONTHS,
  };
}

export interface WpMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function widowMeta(locale: WpLocale): WpMeta {
  const h = headline();
  const P = (n: number) => whole(n, locale);
  const E = (n: number) => euros(n, locale);
  return {
    es: {
      title: "Pensión de viudedad: requisitos y cuánto se cobra",
      description: `El ${P(h.general)} de la base reguladora (${P(h.senior)} desde los 65, ${P(h.burdens)} con cargas familiares) y en 2026 un mínimo de ${E(h.minUnder60)} a ${E(h.minCharges)} al mes. Calculadora.`,
      h1: "Pensión de viudedad: requisitos y cuánto se cobra (calculadora 2026)",
      breadcrumb: "Pensión de viudedad",
      appName: "Calculadora de la pensión de viudedad (Ley General de la Seguridad Social, arts. 219 a 223; Decreto 3158/1966, art. 31; Real Decreto 900/2018)",
    },
    ca: {
      title: "Pensió de viduïtat: requisits i quant es cobra",
      description: `El ${P(h.general)} de la base reguladora (${P(h.senior)} des dels 65, ${P(h.burdens)} amb càrregues familiars) i el 2026 un mínim de ${E(h.minUnder60)} a ${E(h.minCharges)} al mes. Calculadora.`,
      h1: "Pensió de viduïtat: requisits i quant es cobra (calculadora 2026)",
      breadcrumb: "Pensió de viduïtat",
      appName: "Calculadora de la pensió de viduïtat (Llei general de la Seguretat Social, arts. 219 a 223; Decret 3158/1966, art. 31; Reial decret 900/2018)",
    },
    en: {
      title: "Spain widow's pension: requirements and amount",
      description: `${P(h.general)} of the base reguladora (${P(h.senior)} from 65, ${P(h.burdens)} with dependants) and a 2026 minimum of ${E(h.minUnder60)} to ${E(h.minCharges)} a month. Calculator.`,
      h1: "Spain's widow's pension (viudedad): requirements and amount, 2026 calculator",
      breadcrumb: "Widow's pension",
      appName: "Spain widow's pension calculator (General Social Security Act, arts. 219 to 223; Decreto 3158/1966, art. 31; Royal Decree 900/2018)",
    },
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

export type ExampleId = "married-52" | "retired-60" | "burdens-70" | "divorced" | "temporal" | "work-accident" | "partner-none" | "no-base";

export function exampleInputs(): [ExampleId, WidowInput][] {
  return [
    // 55, works (18.000 € a year): the general 52 %, above the under-60 minimum.
    ["married-52", widowCase({ status: "alta-500", age: 55, otherIncome: 18000, workIncome: true, baseReguladora: 1800 })],
    // 70, a retirement pensioner's widow, 1.200 € of savings income: 60 %, topped up to the 65+ minimum.
    ["retired-60", widowCase({ status: "pensioner", age: 70, otherIncome: 1200, baseReguladora: 1400 })],
    // Pareja de hecho with two children, 3 years together, never registered (RDL 31/2026), a traffic accident: 70 % with family burdens.
    ["burdens-70", widowCase({ relationship: "partner", status: "alta-500", cause: "accident", commonChildren: true, cohabitation: "2-to-5", registration: "none", age: 42, familyBurdens: true, otherIncome: 0, baseReguladora: 1900 })],
    // Divorced with a compensatory pension of 6.000 € a year: the widow's pension is cut to it (art. 220.1).
    ["divorced", widowCase({ relationship: "separated", status: "pensioner", age: 63, compensatory: true, compensatoryAnnual: 6000, baseReguladora: 1600 })],
    // Married eight months, the illness was diagnosed before the wedding, no children: two years of prestación temporal (art. 222).
    ["temporal", widowCase({ status: "alta-500", illnessBefore: true, marriageCondition: false, age: 50, otherIncome: 20000, workIncome: true, baseReguladora: 2000 })],
    // A work accident in the first months of a job: no period needed, paid in 12 payments.
    ["work-accident", widowCase({ status: "alta-short", cause: "work", age: 50, otherIncome: 0, baseReguladora: 2400 })],
    // Pareja de hecho, no children, 3 years together, never registered: no pension (art. 221.2).
    ["partner-none", widowCase({ relationship: "partner", status: "alta-500", commonChildren: false, cohabitation: "2-to-5", registration: "none", age: 48, baseReguladora: 1500 })],
    // 67, a pensioner's widow, base not known yet: 60 % and the 65+ minimum.
    ["no-base", widowCase({ status: "pensioner", age: 67, otherIncome: 0, baseReguladora: null })],
  ];
}

export function examples(): { id: ExampleId; input: WidowInput; result: WidowResult }[] {
  return exampleInputs().map(([id, input]) => ({ id, input, result: calculateOk(input) }));
}

/* -------------------------------------------------------------------------- */
/* Sitemap and FAQ                                                            */
/* -------------------------------------------------------------------------- */

export function widowSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = widowEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return WP_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the rules (also the FAQPage JSON-LD). */
export function widowFaq(locale: WpLocale): { q: string; a: string }[] {
  const h = headline();
  const P = (n: number) => whole(n, locale);
  const E = (n: number) => euros(n, locale);
  const M = (n: number) => perMonth(n, locale);
  const convalidated = day(RDL31_CONVALIDATED, locale);
  return {
    es: [
      {
        q: "¿Cuánto se cobra de pensión de viudedad?",
        a: `El ${P(h.general)} de la base reguladora del fallecido, en 14 pagas. Sube al ${P(h.senior)} si tienes ${h.seniorAge} años o más, no cobras otra pensión pública, no trabajas y tus rentas no pasan de ${E(h.incomeLimit)} al año, y al ${P(h.burdens)} si tienes cargas familiares, la pensión es tu principal ingreso y tus ingresos no pasan de un límite (${E(h.ceilingUnder60)} al año si tienes menos de 60). En 2026 la pensión mínima va de ${M(h.minUnder60)} (menores de 60) a ${M(h.minCharges)} (con cargas familiares), si tus otros ingresos no pasan de ${E(h.incomeLimit)} al año.`,
      },
      {
        q: "¿Qué requisitos tiene que cumplir el fallecido?",
        a: `Si estaba de alta o en una situación asimilada (trabajando, en el paro, de baja), ${h.altaDays} días cotizados en los últimos 5 años; si no estaba de alta, ${h.noAltaYears} años cotizados. Si murió por un accidente, laboral o no, o por una enfermedad profesional, no se pide ningún periodo. Si cobraba una pensión de jubilación o de incapacidad permanente, tampoco.`,
      },
      {
        q: "¿Tienen derecho las parejas de hecho?",
        a: `Sí. Sin hijos en común, hacen falta ${h.cohabitation} años de convivencia empadronados justo antes del fallecimiento y la inscripción de la pareja en un registro (o una escritura pública) con ${h.registration} años de antelación. Con hijos en común, desde el 21 de octubre de 2026 basta con ${h.childrenCohabitation} años de convivencia empadronados, sin inscripción (Real Decreto-ley 31/2026, convalidado por el Congreso el ${convalidated}).`,
      },
      {
        q: "¿Cobra la viudedad un divorciado o separado?",
        a: `Solo si no se ha vuelto a casar ni tiene nueva pareja de hecho y cobraba una pensión compensatoria que se extingue con la muerte; la viudedad no puede superar esa compensatoria. Las mujeres víctimas de violencia de género al separarse tienen derecho sin compensatoria. Si hay varios beneficiarios tras un divorcio, se reparte según el tiempo vivido con el fallecido, con un mínimo del 40 % para el cónyuge o la pareja del momento.`,
      },
      {
        q: "¿Qué es la prestación temporal de viudedad?",
        a: `Una prestación de ${h.temporalYears} años, del mismo importe que la pensión, para quien no llega a la pensión vitalicia porque el matrimonio duró menos de un año (cuando la enfermedad que causó la muerte ya existía) y no hay hijos comunes, o porque la pareja de hecho se inscribió menos de ${h.registration} años antes.`,
      },
      {
        q: "¿Es compatible la pensión de viudedad con trabajar o con mi jubilación?",
        a: `Sí: es compatible con cualquier sueldo y con tu propia pensión de jubilación o incapacidad. Lo que cambia es el porcentaje (el ${P(h.senior)} exige no trabajar) y el complemento a mínimos, que se pierde si tus otros ingresos pasan de ${E(h.incomeLimit)} al año más el mínimo.`,
      },
      {
        q: "¿Se pierde la pensión de viudedad si me vuelvo a casar?",
        a: `Por regla general, sí, también con una nueva pareja de hecho. Se mantiene si tienes más de ${h.remarriageAge} años (o una incapacidad permanente absoluta, gran invalidez o discapacidad del 65 %), la viudedad es al menos el 75 % de tus ingresos y la pareja no ingresa más de ${E(h.remarriageIncome)} al año (dos veces el salario mínimo de 2026).`,
      },
      {
        q: "¿Cómo se pide y desde cuándo se cobra?",
        a: `En el Portal de Prestaciones de la Seguridad Social o con el formulario oficial en un CAISS (con cita previa). Si la pides en los ${h.retroMonths} meses siguientes al fallecimiento, se cobra desde el día siguiente (desde el día 1 del mes siguiente si el fallecido era pensionista); si tardas más, con ${h.retroMonths} meses de atrasos. El derecho no prescribe.`,
      },
    ],
    ca: [
      {
        q: "Quant es cobra de pensió de viduïtat?",
        a: `El ${P(h.general)} de la base reguladora de la persona morta, en 14 pagues. Puja al ${P(h.senior)} si tens ${h.seniorAge} anys o més, no cobres cap altra pensió pública, no treballes i les teves rendes no passen de ${E(h.incomeLimit)} l'any, i al ${P(h.burdens)} si tens càrregues familiars, la pensió és el teu ingrés principal i els teus ingressos no passen d'un límit (${E(h.ceilingUnder60)} l'any si tens menys de 60 anys). El 2026 la pensió mínima va de ${M(h.minUnder60)} (menors de 60) a ${M(h.minCharges)} (amb càrregues familiars), si els teus altres ingressos no passen de ${E(h.incomeLimit)} l'any.`,
      },
      {
        q: "Quins requisits ha de complir la persona morta?",
        a: `Si estava d'alta o en una situació assimilada (treballant, a l'atur, de baixa), ${h.altaDays} dies cotitzats en els últims 5 anys; si no estava d'alta, ${h.noAltaYears} anys cotitzats. Si va morir per un accident, laboral o no, o per una malaltia professional, no es demana cap període. Si cobrava una pensió de jubilació o d'incapacitat permanent, tampoc.`,
      },
      {
        q: "Hi tenen dret les parelles de fet?",
        a: `Sí. Sense fills en comú, calen ${h.cohabitation} anys de convivència empadronats just abans de la mort i la inscripció de la parella en un registre (o una escriptura pública) amb ${h.registration} anys d'antelació. Amb fills en comú, des del 21 d'octubre de 2026 n'hi ha prou amb ${h.childrenCohabitation} anys de convivència empadronats, sense inscripció (Reial decret llei 31/2026, convalidat pel Congrés el ${convalidated}).`,
      },
      {
        q: "Cobra la viduïtat un divorciat o separat?",
        a: `Només si no s'ha tornat a casar ni té una nova parella de fet i cobrava una pensió compensatòria que s'extingeix amb la mort; la viduïtat no pot superar aquesta compensatòria. Les dones víctimes de violència de gènere en separar-se hi tenen dret sense compensatòria. Si hi ha diversos beneficiaris després d'un divorci, es reparteix segons el temps viscut amb la persona morta, amb un mínim del 40 % per al cònjuge o la parella del moment.`,
      },
      {
        q: "Què és la prestació temporal de viduïtat?",
        a: `Una prestació de ${h.temporalYears} anys, del mateix import que la pensió, per a qui no arriba a la pensió vitalícia perquè el matrimoni va durar menys d'un any (quan la malaltia que va causar la mort ja existia) i no hi ha fills comuns, o perquè la parella de fet es va inscriure menys de ${h.registration} anys abans.`,
      },
      {
        q: "És compatible la pensió de viduïtat amb treballar o amb la meva jubilació?",
        a: `Sí: és compatible amb qualsevol sou i amb la teva pròpia pensió de jubilació o d'incapacitat. El que canvia és el percentatge (el ${P(h.senior)} exigeix no treballar) i el complement a mínims, que es perd si els teus altres ingressos passen de ${E(h.incomeLimit)} l'any més el mínim.`,
      },
      {
        q: "Es perd la pensió de viduïtat si em torno a casar?",
        a: `Per regla general, sí, també amb una nova parella de fet. Es manté si tens més de ${h.remarriageAge} anys (o una incapacitat permanent absoluta, gran invalidesa o discapacitat del 65 %), la viduïtat és com a mínim el 75 % dels teus ingressos i la parella no ingressa més de ${E(h.remarriageIncome)} l'any (dues vegades el salari mínim del 2026).`,
      },
      {
        q: "Com es demana i des de quan es cobra?",
        a: `Al Portal de Prestaciones de la Seguretat Social o amb el formulari oficial en un CAISS (amb cita prèvia). Si la demanes en els ${h.retroMonths} mesos següents a la mort, es cobra des de l'endemà (des del dia 1 del mes següent si la persona morta era pensionista); si trigues més, amb ${h.retroMonths} mesos d'endarreriments. El dret no prescriu.`,
      },
    ],
    en: [
      {
        q: "How much is Spain's widow's pension?",
        a: `${P(h.general)} of the deceased's base reguladora, in 14 payments. It rises to ${P(h.senior)} if you are ${h.seniorAge} or over, get no other public pension, do not work and have no more than ${E(h.incomeLimit)} a year of other income, and to ${P(h.burdens)} if you have family dependants, the pension is your main income and your income is within a ceiling (${E(h.ceilingUnder60)} a year under 60). In 2026 the minimum pension runs from ${M(h.minUnder60)} (under 60) to ${M(h.minCharges)} (with family dependants), if your other income is no more than ${E(h.incomeLimit)} a year.`,
      },
      {
        q: "What must the person who died have contributed?",
        a: `If they were registered (alta) or in an equivalent situation (working, on unemployment benefit, on sick leave), ${h.altaDays} days in the last 5 years; if not registered, ${h.noAltaYears} years. After an accident, at work or not, or an occupational illness, no period is required. Nor if they were drawing a retirement or permanent disability pension.`,
      },
      {
        q: "Are unmarried partners (parejas de hecho) entitled?",
        a: `Yes. Without children together, you need ${h.cohabitation} years living together on the padrón right before the death and the partnership registered (or set up by public deed) ${h.registration} years before. With children together, since 21 October 2026 ${h.childrenCohabitation} years living together on the padrón are enough, with no registration (Royal Decree-law 31/2026, ratified by Congress on ${convalidated}).`,
      },
      {
        q: "Can a divorced or separated spouse get it?",
        a: `Only if they have not remarried or formed a new partnership and were receiving a compensatory pension that ends with the death; the widow's pension cannot exceed that compensatory pension. Women who were victims of gender violence at the separation are entitled without one. With several beneficiaries after a divorce, it is shared by the time each lived with the deceased, with at least 40% for the spouse or partner at the time.`,
      },
      {
        q: "What is the temporary widow's benefit?",
        a: `A ${h.temporalYears}-year benefit, the same amount as the pension, for those who miss the lifelong pension because the marriage lasted under a year (when the fatal illness already existed) and there are no children together, or the partnership was registered under ${h.registration} years before.`,
      },
      {
        q: "Can I work, or draw my own retirement pension, as well?",
        a: `Yes: it is compatible with any salary and with your own retirement or disability pension. What changes is the percentage (the ${P(h.senior)} requires no work income) and the minimum top-up, lost if your other income is over ${E(h.incomeLimit)} a year plus the minimum.`,
      },
      {
        q: "Do I lose it if I remarry?",
        a: `As a rule, yes, also with a new registered partnership. You keep it if you are over ${h.remarriageAge} (or have an absolute permanent disability, gran invalidez or a 65% disability), the widow's pension is at least 75% of your income and the couple's income is no more than ${E(h.remarriageIncome)} a year (twice the 2026 minimum wage).`,
      },
      {
        q: "How do I apply, and from when is it paid?",
        a: `On the Seguridad Social's Portal de Prestaciones, or with the official form at a CAISS office (by appointment). Apply within ${h.retroMonths} months of the death and it is paid from the next day (from the 1st of the next month if the deceased was a pensioner); later, with ${h.retroMonths} months of arrears. The right never lapses.`,
      },
    ],
  }[locale];
}
