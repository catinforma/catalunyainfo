import type { MetadataRoute } from "next";

import { AMOUNT_BANDS, INCOME_LIMIT, INCOME_LIMIT_SHARE, OVER52_SHARE, monthlyAmount } from "@/lib/programmatic/unemployment-subsidy/rules";
import { IPREM_PLUS_SIXTH, MAX_PCT, MIN_PCT } from "@/lib/programmatic/employment/rules";
import { SMI_2026 } from "@/lib/programmatic/smi/rules";
import { thresholdsFor } from "@/lib/programmatic/bono-social/engine";
import { absoluteUrl } from "@/lib/site";

import { IPREM_LOCALES, bareDay, elDay, ipremEditions, money, num, times, type IpremLocale } from "./copy";
import { cents, commonLimits, multipleOf, riseOver } from "./engine";
import { HOUSING_RENT_MULTIPLES, IPREM_14, IPREM_ANNUAL, IPREM_CURRENT, IPREM_DAILY, IPREM_LAWS, IPREM_MONTHLY, IPREM_RULES_AS_OF, IPREM_YEAR, IPREM_YEARS, LEGAL_AID_MULTIPLES, STATUS_2027, type IpremLaw } from "./rules";

/**
 * The words and tables of "IPREM 2026" that hold figures: title,
 * description, lead, freshness line, the history rows, the thresholds and
 * the FAQ. Pure: the tests run it. Every euro amount comes from rules.ts (or
 * the bono social, subsidy and paro modules, which read rules.ts too).
 */

const L = <T>(locale: IpremLocale, v: Record<IpremLocale, T>): T => v[locale];

export function ipremMeta(locale: IpremLocale): { title: string; description: string; h1: string; breadcrumb: string; appName: string } {
  const M = (n: number) => money(n, locale);
  const y = IPREM_YEAR;
  return L(locale, {
    es: {
      title: `IPREM ${y}: ${M(IPREM_MONTHLY)} al mes, ${num(IPREM_ANNUAL, 0, "es")} o ${M(IPREM_14)} al año`,
      description: `IPREM ${y} oficial: ${M(IPREM_DAILY)} al día, ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} al año o ${M(IPREM_14)} en 14 pagas (Ley 31/2022, prorrogada). Historia desde 2004, qué pasa en 2027 y calculadora.`,
      h1: `IPREM ${y}: cuantía oficial, historia y calculadora`,
      breadcrumb: `IPREM ${y}`,
      appName: `Calculadora del IPREM ${y}`,
    },
    ca: {
      title: `IPREM ${y}: ${M(IPREM_MONTHLY)} al mes, ${num(IPREM_ANNUAL, 0, "ca")} o ${M(IPREM_14)} l'any`,
      description: `IPREM ${y} oficial: ${M(IPREM_DAILY)} al dia, ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} l'any o ${M(IPREM_14)} en 14 pagues (Llei 31/2022, prorrogada). Història des del 2004, el 2027 i calculadora.`,
      h1: `IPREM ${y}: quantia oficial, història i calculadora`,
      breadcrumb: `IPREM ${y}`,
      appName: `Calculadora de l'IPREM ${y}`,
    },
    en: {
      title: `IPREM ${y} (Spain): ${M(IPREM_MONTHLY)} a month, ${M(IPREM_ANNUAL)} or ${M(IPREM_14)} a year`,
      description: `Spain's official ${y} IPREM: ${M(IPREM_DAILY)} a day, ${M(IPREM_MONTHLY)} a month, ${M(IPREM_ANNUAL)} a year or ${M(IPREM_14)} in 14 payments (Law 31/2022, extended). History since 2004, 2027 and a calculator.`,
      h1: `IPREM ${y} in Spain: official amount, history and calculator`,
      breadcrumb: `IPREM ${y}`,
      appName: `IPREM ${y} calculator`,
    },
  });
}

/** The answer-first lead. */
export function leadText(locale: IpremLocale): string {
  const M = (n: number) => money(n, locale);
  return L(locale, {
    es: `El IPREM de ${IPREM_YEAR} es de ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_DAILY)} al día y ${M(IPREM_ANNUAL)} al año en 12 pagas, o ${M(IPREM_14)} en 14 pagas cuando la norma lo pide así. Son las cuantías de la Ley 31/2022 de Presupuestos para 2023, que siguen vigentes porque desde entonces no se ha aprobado ningún presupuesto; el SEPE las aplica en ${IPREM_YEAR}. Con él se fijan el subsidio por desempleo, el bono social, la justicia gratuita o las ayudas al alquiler.`,
    ca: `L'IPREM del ${IPREM_YEAR} és de ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_DAILY)} al dia i ${M(IPREM_ANNUAL)} l'any en 12 pagues, o ${M(IPREM_14)} en 14 pagues quan la norma ho demana així. Són les quanties de la Llei 31/2022 de pressupostos per al 2023, que continuen vigents perquè des d'aleshores no s'ha aprovat cap pressupost; el SEPE les aplica el ${IPREM_YEAR}. Amb l'IPREM es fixen el subsidi per desocupació, el bo social, la justícia gratuïta o els ajuts al lloguer.`,
    en: `Spain's ${IPREM_YEAR} IPREM is ${M(IPREM_MONTHLY)} a month, ${M(IPREM_DAILY)} a day and ${M(IPREM_ANNUAL)} a year in 12 payments, or ${M(IPREM_14)} in 14 payments where a rule says so. These are the amounts of Law 31/2022, the 2023 budget act, still in force because no budget has been passed since; SEPE applies them in ${IPREM_YEAR}. The IPREM sets the unemployment subsidy, the bono social, free legal aid and rent aid, among others.`,
  });
}

export function freshnessText(locale: IpremLocale): string {
  return L(locale, {
    es: `Cifras leídas en el BOE y en el SEPE ${elDay(IPREM_RULES_AS_OF, "es")}. Las revisamos en cuanto el BOE publique otra cuantía.`,
    ca: `Xifres llegides al BOE i al SEPE ${elDay(IPREM_RULES_AS_OF, "ca")}. Les revisem tan bon punt el BOE publiqui una altra quantia.`,
    en: `Figures read on the BOE and SEPE websites ${elDay(IPREM_RULES_AS_OF, "en")}. We update them as soon as the BOE publishes a new amount.`,
  });
}

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

export interface HistoryRow {
  year: number;
  /** The amounts, or null where no official text we hold gives them. */
  amounts: Pick<IpremLaw, "daily" | "monthly" | "annual" | "annual14"> | null;
  /** The text that fixed them, or the budget act that was extended. */
  law: IpremLaw;
  kind: "law" | "extended";
  /** Rise of the monthly figure over the last year with figures (percent), or null. */
  rise: number | null;
}

/** 2004 to 2026, oldest first. */
export function historyRows(): HistoryRow[] {
  let prev: IpremLaw | null = null;
  return IPREM_YEARS.map((r) => {
    if (r.kind === "law") {
      const rise = riseOver(prev, r.law);
      prev = r.law;
      return { year: r.year, amounts: r.law, law: r.law, kind: "law", rise };
    }
    return { year: r.year, amounts: r.quoted ? r.extends : null, law: r.extends, kind: "extended", rise: null };
  });
}

/** The note under a history row (mid-year acts, extended budgets). */
export function historyNote(row: HistoryRow, locale: IpremLocale): string | null {
  const d = (iso: string) => bareDay(iso, locale);
  if (row.kind === "extended") {
    const extended = row.law.year;
    if (row.amounts)
      return L(locale, {
        es: `Sin presupuestos nuevos: prorrogados los de ${extended} (art. 134.4 de la Constitución). El SEPE da estas cuantías «fijado en: Ley 31/2022».`,
        ca: `Sense pressupostos nous: prorrogats els del ${extended} (art. 134.4 de la Constitució). El SEPE dona aquestes quanties «fijado en: Ley 31/2022».`,
        en: `No new budget: the ${extended} one was extended (Constitution, art. 134.4). SEPE gives these amounts, «fijado en: Ley 31/2022».`,
      });
    return L(locale, {
      es: `Sin presupuestos nuevos: prorrogados los de ${extended} (art. 134.4 de la Constitución). Ningún texto del BOE fija una cuantía para este año.`,
      ca: `Sense pressupostos nous: prorrogats els del ${extended} (art. 134.4 de la Constitució). Cap text del BOE no fixa una quantia per a aquest any.`,
      en: `No new budget: the ${extended} one was extended (Constitution, art. 134.4). No BOE text sets an amount for this year.`,
    });
  }
  const l = row.law;
  if (l.year === 2004)
    return L(locale, { es: `Creado por este real decreto-ley: cuantías del 1 de julio al 31 de diciembre de 2004.`, ca: `Creat per aquest reial decret llei: quanties de l'1 de juliol al 31 de desembre de 2004.`, en: `Created by this decree-law: amounts from 1 July to 31 December 2004.` });
  if (l.inForce > `${l.year}-01-01`)
    return L(locale, {
      es: `Ley en vigor desde el ${d(l.inForce)}; hasta entonces, presupuestos de ${l.year - 1} prorrogados.`,
      ca: `Llei en vigor des del ${d(l.inForce)}; fins aleshores, pressupostos del ${l.year - 1} prorrogats.`,
      en: `Act in force from ${d(l.inForce)}; until then, the ${l.year - 1} budget extended.`,
    });
  return null;
}

/* -------------------------------------------------------------------------- */
/* Thresholds                                                                 */
/* -------------------------------------------------------------------------- */

/** RD 897/2017 art. 3.2.a: the households the table shows (vulnerable / severe, no special circumstance). */
export function bonoSocialRows() {
  const rows: [number, number][] = [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
    [2, 2],
  ];
  return rows.map(([adults, minors]) => ({ adults, minors, ...thresholdsFor({ adults, minors, largeFamily: false, minimumPension: false, special: false }) }));
}

/** Ley 1/1996 arts. 3.1 and 5.1 on the yearly IPREM (12 payments). */
export function legalAidRows() {
  const at = (m: number) => cents(m * IPREM_ANNUAL);
  return [
    { id: "alone", multiple: LEGAL_AID_MULTIPLES.alone, amount: at(LEGAL_AID_MULTIPLES.alone) },
    { id: "under4", multiple: LEGAL_AID_MULTIPLES.under4, amount: at(LEGAL_AID_MULTIPLES.under4) },
    { id: "from4", multiple: LEGAL_AID_MULTIPLES.from4, amount: at(LEGAL_AID_MULTIPLES.from4) },
    { id: "exceptional", multiple: LEGAL_AID_MULTIPLES.exceptional, amount: at(LEGAL_AID_MULTIPLES.exceptional) },
  ] as const;
}

/** RD 326/2026 art. 116.1.c on the 14-payment IPREM (art. 8.2.b). */
export function housingRows() {
  const at = (m: number) => cents(m * IPREM_14);
  return [
    { id: "general", multiple: HOUSING_RENT_MULTIPLES.general, amount: at(HOUSING_RENT_MULTIPLES.general) },
    { id: "raised", multiple: HOUSING_RENT_MULTIPLES.raised, amount: at(HOUSING_RENT_MULTIPLES.raised) },
    { id: "highest", multiple: HOUSING_RENT_MULTIPLES.highest, amount: at(HOUSING_RENT_MULTIPLES.highest) },
  ] as const;
}

/** LGSS arts. 278 and 280.4 (subsidy) and 270.3 (contributory benefit limits), from the subsidy and paro modules. */
export function unemploymentRows() {
  return {
    subsidy: AMOUNT_BANDS.map((b) => ({ ...b, monthly: monthlyAmount(b.share) })),
    over52: { share: OVER52_SHARE, monthly: monthlyAmount(OVER52_SHARE) },
    sixth: cents(IPREM_PLUS_SIXTH),
    min: { none: cents(IPREM_PLUS_SIXTH * MIN_PCT[0]), children: cents(IPREM_PLUS_SIXTH * MIN_PCT[1]) },
    max: { none: cents(IPREM_PLUS_SIXTH * MAX_PCT[0]), one: cents(IPREM_PLUS_SIXTH * MAX_PCT[1]), two: cents(IPREM_PLUS_SIXTH * MAX_PCT[2]) },
    pct: { min: MIN_PCT, max: MAX_PCT },
    /** Art. 275.1: 75 % of the SMI without extra payments (not the IPREM). */
    incomeLimit: INCOME_LIMIT,
    smiMonthly: SMI_2026.monthly,
  };
}

/** Common multiples, both bases: the "¿cuánto es x veces el IPREM?" table. */
export const COMMON_MULTIPLES = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6] as const;

export function multiplesTable() {
  return COMMON_MULTIPLES.map((m) => {
    const r = multipleOf(m);
    if (r.status !== "ok") throw new Error("iprem: bad multiple");
    return r;
  });
}

export { commonLimits };

/* -------------------------------------------------------------------------- */
/* FAQ and sitemap                                                            */
/* -------------------------------------------------------------------------- */

export function ipremFaq(locale: IpremLocale): { q: string; a: string }[] {
  const M = (n: number) => money(n, locale);
  const T = (n: number) => times(n, locale);
  const y = IPREM_YEAR;
  const next = y + 1;
  const m15 = multipleOf(1.5);
  const m2 = multipleOf(2);
  const m3 = multipleOf(3);
  if (m15.status !== "ok" || m2.status !== "ok" || m3.status !== "ok") throw new Error("iprem: faq multiples");
  const u = unemploymentRows();
  const constitutive = bareDay(STATUS_2027.dissolution.constitutive, locale);
  return L(locale, {
    es: [
      { q: `¿Cuánto es el IPREM en ${y}?`, a: `${M(IPREM_MONTHLY)} al mes, ${M(IPREM_DAILY)} al día y ${M(IPREM_ANNUAL)} al año (12 pagas), o ${M(IPREM_14)} al año en 14 pagas. Lo fija la disposición adicional nonagésima de la Ley 31/2022, de Presupuestos para 2023, que sigue aplicándose porque los presupuestos están prorrogados; el SEPE publica las mismas cifras para ${y}.` },
      { q: "¿Por qué el IPREM no sube desde 2023?", a: `Porque la cuantía se fija cada año en la Ley de Presupuestos Generales del Estado (Real Decreto-ley 3/2004, art. 2.2) y desde la de 2023 no se ha aprobado ninguna. Sin ley nueva, la Constitución (art. 134.4) prorroga automáticamente los presupuestos anteriores, y con ellos el IPREM de ${M(IPREM_MONTHLY)} al mes.` },
      { q: `¿Cuánto será el IPREM en ${next}?`, a: `No hay presupuestos de ${next} en el BOE ni en trámite: las Cortes se disolvieron el 6 de octubre de 2026 (Real Decreto 806/2026) y las nuevas cámaras se constituyen el ${constitutive}. Si el 1 de enero no hay ley, los presupuestos se prorrogan otra vez (art. 134.4 de la Constitución) y el IPREM sigue en ${M(IPREM_MONTHLY)} al mes hasta que una nueva ley de presupuestos fije otra cuantía. Actualizaremos esta página el día que el BOE la publique.` },
      { q: "¿IPREM de 12 o de 14 pagas?", a: `Lo dice cada norma. El IPREM anual es de ${M(IPREM_ANNUAL)} (12 pagas). Se usa el de ${M(IPREM_14)} (14 pagas) cuando la norma lo pide expresamente, como el bono social eléctrico o el Plan Estatal de Vivienda, o cuando antes de 2004 se refería al salario mínimo en cómputo anual (letra d de la disposición adicional nonagésima).` },
      { q: "¿Cuánto es 1,5, 2 o 3 veces el IPREM?", a: `En 12 pagas: 1,5 veces son ${M(m15.annual12)}, 2 veces ${M(m2.annual12)} y 3 veces ${M(m3.annual12)} al año. En 14 pagas: ${M(m15.annual14)}, ${M(m2.annual14)} y ${M(m3.annual14)}. Al mes: ${M(m15.monthly)}, ${M(m2.monthly)} y ${M(m3.monthly)}.` },
      { q: "¿Qué diferencia hay entre el IPREM y el salario mínimo?", a: `El salario mínimo (SMI) es lo mínimo que se puede cobrar por trabajar: ${M(u.smiMonthly)} al mes en 14 pagas en ${y} (Real Decreto 126/2026). El IPREM se creó en 2004 para sustituir al SMI como referencia de las ayudas y es mucho más bajo. Ojo: el límite de ingresos del subsidio por desempleo es el ${T(INCOME_LIMIT_SHARE * 100)} % del SMI (${M(u.incomeLimit)} al mes), no el IPREM.` },
      { q: "¿Para qué sirve el IPREM?", a: `Para fijar cuánto se cobra o hasta qué ingresos se tiene derecho a una ayuda. Por ejemplo: subsidio por desempleo (95 %, 90 % u 80 % del IPREM: ${M(u.subsidy[0]!.monthly)}, ${M(u.subsidy[1]!.monthly)} y ${M(u.subsidy[2]!.monthly)} al mes), bono social eléctrico (1,5 veces el de 14 pagas para una persona sola), justicia gratuita (2 veces para una persona sin unidad familiar) o la ayuda al alquiler del Plan Estatal de Vivienda (5 veces el de 14 pagas).` },
    ],
    ca: [
      { q: `Quant és l'IPREM el ${y}?`, a: `${M(IPREM_MONTHLY)} al mes, ${M(IPREM_DAILY)} al dia i ${M(IPREM_ANNUAL)} l'any (12 pagues), o ${M(IPREM_14)} l'any en 14 pagues. El fixa la disposició addicional norantena de la Llei 31/2022, de pressupostos per al 2023, que es continua aplicant perquè els pressupostos estan prorrogats; el SEPE publica les mateixes xifres per al ${y}.` },
      { q: "Per què l'IPREM no puja des del 2023?", a: `Perquè la quantia es fixa cada any a la Llei de pressupostos generals de l'Estat (Reial decret llei 3/2004, art. 2.2) i des de la del 2023 no se n'ha aprovat cap. Sense llei nova, la Constitució (art. 134.4) prorroga automàticament els pressupostos anteriors, i amb ells l'IPREM de ${M(IPREM_MONTHLY)} al mes.` },
      { q: `Quant serà l'IPREM el ${next}?`, a: `No hi ha pressupostos del ${next} al BOE ni en tràmit: les Corts es van dissoldre el 6 d'octubre de 2026 (Reial decret 806/2026) i les noves cambres es constitueixen el ${constitutive}. Si l'1 de gener no hi ha llei, els pressupostos es prorroguen una altra vegada (art. 134.4 de la Constitució) i l'IPREM continua en ${M(IPREM_MONTHLY)} al mes fins que una nova llei de pressupostos en fixi una altra quantia. Actualitzarem aquesta pàgina el dia que el BOE la publiqui.` },
      { q: "IPREM de 12 o de 14 pagues?", a: `Ho diu cada norma. L'IPREM anual és de ${M(IPREM_ANNUAL)} (12 pagues). S'usa el de ${M(IPREM_14)} (14 pagues) quan la norma ho demana expressament, com el bo social elèctric o el Pla Estatal d'Habitatge, o quan abans del 2004 es referia al salari mínim en còmput anual (lletra d de la disposició addicional norantena).` },
      { q: "Quant és 1,5, 2 o 3 vegades l'IPREM?", a: `En 12 pagues: 1,5 vegades són ${M(m15.annual12)}, 2 vegades ${M(m2.annual12)} i 3 vegades ${M(m3.annual12)} l'any. En 14 pagues: ${M(m15.annual14)}, ${M(m2.annual14)} i ${M(m3.annual14)}. Al mes: ${M(m15.monthly)}, ${M(m2.monthly)} i ${M(m3.monthly)}.` },
      { q: "Quina diferència hi ha entre l'IPREM i el salari mínim?", a: `El salari mínim (SMI) és el mínim que es pot cobrar per treballar: ${M(u.smiMonthly)} al mes en 14 pagues el ${y} (Reial decret 126/2026). L'IPREM es va crear el 2004 per substituir l'SMI com a referència dels ajuts i és molt més baix. Compte: el límit d'ingressos del subsidi per desocupació és el ${T(INCOME_LIMIT_SHARE * 100)} % de l'SMI (${M(u.incomeLimit)} al mes), no l'IPREM.` },
      { q: "Per a què serveix l'IPREM?", a: `Per fixar quant es cobra o fins a quins ingressos es té dret a un ajut. Per exemple: subsidi per desocupació (95 %, 90 % o 80 % de l'IPREM: ${M(u.subsidy[0]!.monthly)}, ${M(u.subsidy[1]!.monthly)} i ${M(u.subsidy[2]!.monthly)} al mes), bo social elèctric (1,5 vegades el de 14 pagues per a una persona sola), justícia gratuïta (2 vegades per a una persona sense unitat familiar) o l'ajut al lloguer del Pla Estatal d'Habitatge (5 vegades el de 14 pagues).` },
    ],
    en: [
      { q: `How much is the IPREM in ${y}?`, a: `${M(IPREM_MONTHLY)} a month, ${M(IPREM_DAILY)} a day and ${M(IPREM_ANNUAL)} a year (12 payments), or ${M(IPREM_14)} a year in 14 payments. It is set by additional provision 90 of Law 31/2022, the 2023 budget act, still applied because the budget has been extended; SEPE publishes the same figures for ${y}.` },
      { q: "Why has the IPREM not gone up since 2023?", a: `Because the amount is set each year in the State Budget Act (Royal Decree-law 3/2004, art. 2.2), and none has been passed since the 2023 one. With no new act, the Constitution (art. 134.4) automatically extends the previous budget, and with it the IPREM of ${M(IPREM_MONTHLY)} a month.` },
      { q: `What will the IPREM be in ${next}?`, a: `There is no ${next} budget in the BOE or before parliament: the Cortes were dissolved on 6 October 2026 (Royal Decree 806/2026) and the new chambers meet on ${constitutive}. If there is no act on 1 January, the budget is extended again (Constitution, art. 134.4) and the IPREM stays at ${M(IPREM_MONTHLY)} a month until a new budget act sets another amount. We will update this page the day the BOE publishes it.` },
      { q: "12-payment or 14-payment IPREM?", a: `Each rule says. The yearly IPREM is ${M(IPREM_ANNUAL)} (12 payments). The ${M(IPREM_14)} figure (14 payments) applies where the rule asks for it, like the bono social for electricity or the State Housing Plan, or where before 2004 it referred to the minimum wage in annual terms (letter d of additional provision 90).` },
      { q: "How much is 1.5, 2 or 3 times the IPREM?", a: `In 12 payments: 1.5 times is ${M(m15.annual12)}, twice ${M(m2.annual12)} and 3 times ${M(m3.annual12)} a year. In 14 payments: ${M(m15.annual14)}, ${M(m2.annual14)} and ${M(m3.annual14)}. A month: ${M(m15.monthly)}, ${M(m2.monthly)} and ${M(m3.monthly)}.` },
      { q: "What is the difference between the IPREM and the minimum wage?", a: `The minimum wage (SMI) is the least anyone can be paid for work: ${M(u.smiMonthly)} a month in 14 payments in ${y} (Royal Decree 126/2026). The IPREM was created in 2004 to replace the SMI as the yardstick for benefits, and it is much lower. Note: the unemployment subsidy's income limit is ${T(INCOME_LIMIT_SHARE * 100)}% of the SMI (${M(u.incomeLimit)} a month), not the IPREM.` },
      { q: "What is the IPREM used for?", a: `To set how much a benefit pays or the income up to which you qualify. For example: the unemployment subsidy (95%, 90% or 80% of the IPREM: ${M(u.subsidy[0]!.monthly)}, ${M(u.subsidy[1]!.monthly)} and ${M(u.subsidy[2]!.monthly)} a month), the bono social for electricity (1.5 times the 14-payment IPREM for one person alone), free legal aid (twice for a person with no family unit) or State Housing Plan rent aid (5 times the 14-payment IPREM).` },
    ],
  });
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function ipremSitemapEntries(lastModified: string = IPREM_RULES_AS_OF): MetadataRoute.Sitemap {
  const e = ipremEditions();
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return IPREM_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** Every law of the table, newest first (sources list). */
export function lawsNewestFirst(): IpremLaw[] {
  return [...IPREM_LAWS].reverse();
}

export { IPREM_CURRENT };
