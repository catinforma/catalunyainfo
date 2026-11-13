import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { netSalaryPath } from "@/lib/programmatic/net-salary/copy";
import { bandName, bandRangeText, money, percent, selfEmployedEditions, selfEmployedPath, type SeLocale } from "@/lib/programmatic/self-employed/copy";
import { DEFAULT_INPUT, bandTable, calculateSelfEmployed, contribution, type SelfEmployedResult } from "@/lib/programmatic/self-employed/engine";
import {
  BANDS_2026,
  BASE_CHANGE_DATES_2026,
  CORPORATE_MIN_BASE,
  FLAT_RATE,
  GENERIC_EXPENSES,
  MAX_BASE,
  MIN_BASE,
  OFFICIAL_LINKS,
  QUOTE,
  RATES,
  RULES_AS_OF,
  RULES_YEAR,
  SMI_ANNUAL,
  SOURCES,
  STATUS_2027,
  TOTAL_RATE,
} from "@/lib/programmatic/self-employed/rules-2026";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { SelfEmployedCalculator } from "./SelfEmployedCalculator";

/**
 * "Cuota de autónomos 2026 (y 2027)" / "Quota d'autònoms 2026" / "Spain
 * self-employed contributions 2026": the calculator (server-rendered with
 * the default example), then the full 2026 table of bands, where 2027
 * stands (official texts only), how net earnings are counted, the rates,
 * the tarifa plana, the yearly regularisation, questions, sources and
 * limits. Every figure comes from rules-2026.ts through the engine.
 */

const L = <T,>(locale: SeLocale, v: Record<SeLocale, T>): T => v[locale];
const Y = RULES_YEAR;

export const SE_META: Record<SeLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: `Cuota de autónomos ${Y}: tramos, tarifa plana y calculadora`,
    description: `Calcula tu cuota de autónomo ${Y} según tus rendimientos netos: los 15 tramos del BOE, base mínima y máxima, tarifa plana de 80 € y qué se sabe de 2027.`,
    h1: `Cuota de autónomos ${Y} (y 2027): tramos y calculadora`,
    breadcrumb: "Cuota de autónomos",
    appName: `Calculadora de cuota de autónomos ${Y}`,
  },
  ca: {
    title: `Quota d'autònoms ${Y}: trams, tarifa plana i calculadora`,
    description: `Calcula la teva quota d'autònom del ${Y} segons els rendiments nets: els 15 trams del BOE, base mínima i màxima, tarifa plana de 80 € i què se sap del 2027.`,
    h1: `Quota d'autònoms ${Y} (i 2027): trams i calculadora`,
    breadcrumb: "Quota d'autònoms",
    appName: `Calculadora de quota d'autònoms ${Y}`,
  },
  en: {
    title: `Spain self-employed contributions ${Y}: bands and calculator`,
    description: `Work out your ${Y} autónomo contribution (cuota) in Spain from net earnings: the 15 BOE bands, minimum and maximum bases, the €80 flat rate and 2027.`,
    h1: `Spain self-employed contributions ${Y} (and 2027)`,
    breadcrumb: "Self-employed contributions",
    appName: `Spain self-employed contribution calculator ${Y}`,
  },
};

export function selfEmployedCrumbs(locale: SeLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: SE_META[locale].breadcrumb, href: selfEmployedPath(locale) },
  ];
}

export function selfEmployedMetadata(locale: SeLocale): Metadata {
  const m = SE_META[locale];
  return buildMetadata({ locale, path: selfEmployedPath(locale), title: m.title, description: m.description, translations: selfEmployedEditions() });
}

export function SelfEmployedRoute({ locale }: { locale: SeLocale }) {
  const meta = SE_META[locale];
  const crumbs = selfEmployedCrumbs(locale);
  const ex = calculateSelfEmployed(DEFAULT_INPUT);
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale);
  const asOf = dayMonthYear(RULES_AS_OF, locale);
  const rows = bandTable();
  const lowest = contribution(MIN_BASE);
  const generalLowest = contribution(BANDS_2026.find((b) => b.table === "general")!.minBase);
  const highest = contribution(MAX_BASE);
  const exBand = bandName(ex.band, locale);

  const lead = L(locale, {
    es: `En ${Y} la cuota de autónomos es el ${pc(TOTAL_RATE)} de la base de cotización que eliges dentro de tu tramo de rendimientos netos: desde ${m(lowest)} al mes (tramo 1 de la tabla reducida) hasta ${m(highest)} (base máxima). Con ${m(ex.annual.income, 0)} de ingresos y ${m(ex.annual.expenses, 0)} de gastos al año estás en el ${exBand.toLowerCase()} y pagas desde ${m(ex.full.monthly)} al mes. Si te das de alta por primera vez, la tarifa plana es de ${m(FLAT_RATE.fee, 0)} (${m(FLAT_RATE.totalWithMei)} con el MEI). Para 2027 todavía no hay tabla oficial.`,
    ca: `El ${Y} la quota d'autònoms és el ${pc(TOTAL_RATE)} de la base de cotització que tries dins del teu tram de rendiments nets: des de ${m(lowest)} al mes (tram 1 de la taula reduïda) fins a ${m(highest)} (base màxima). Amb ${m(ex.annual.income, 0)} d'ingressos i ${m(ex.annual.expenses, 0)} de despeses l'any ets al ${exBand.toLowerCase()} i pagues des de ${m(ex.full.monthly)} al mes. Si et dones d'alta per primera vegada, la tarifa plana és de ${m(FLAT_RATE.fee, 0)} (${m(FLAT_RATE.totalWithMei)} amb l'MEI). Per al 2027 encara no hi ha taula oficial.`,
    en: `In ${Y} the self-employed contribution (cuota de autónomos) is ${pc(TOTAL_RATE)} of the contribution base you choose within your band of net earnings: from ${m(lowest)} a month (reduced table, band 1) to ${m(highest)} (maximum base). With ${m(ex.annual.income, 0)} income and ${m(ex.annual.expenses, 0)} expenses a year you are in the ${exBand.toLowerCase()} and pay from ${m(ex.full.monthly)} a month. Registering for the first time, the flat rate is ${m(FLAT_RATE.fee, 0)} (${m(FLAT_RATE.totalWithMei)} with the MEI). There is no official table for 2027 yet.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas el ${asOf} en el BOE (Orden PJC/297/2026 y Real Decreto-ley 3/2026) y en la Seguridad Social.`,
    ca: `Normes revisades el ${asOf} al BOE (Ordre PJC/297/2026 i Reial decret llei 3/2026) i a la Seguretat Social.`,
    en: `Rules checked on ${asOf} in the BOE (Orden PJC/297/2026 and Royal Decree-law 3/2026) and with Social Security.`,
  });

  const h = L(locale, {
    es: { table: `Tabla de tramos de autónomos ${Y}`, y2027: "¿Y la cuota de autónomos 2027?", earnings: "Cómo se calculan los rendimientos netos", rates: `Tipos de cotización ${Y}`, flat: `Tarifa plana ${Y}`, reg: "La regularización: qué pasa cuando Hacienda da tus datos", change: `Cambiar de base en ${Y}`, faq: "Preguntas frecuentes", sources: "Fuentes", limits: "Qué no incluye" },
    ca: { table: `Taula de trams d'autònoms ${Y}`, y2027: "I la quota d'autònoms 2027?", earnings: "Com es calculen els rendiments nets", rates: `Tipus de cotització ${Y}`, flat: `Tarifa plana ${Y}`, reg: "La regularització: què passa quan Hisenda dona les teves dades", change: `Canviar de base el ${Y}`, faq: "Preguntes freqüents", sources: "Fonts", limits: "Què no inclou" },
    en: { table: `${Y} table of self-employed bands`, y2027: "What about 2027?", earnings: "How net earnings are counted", rates: `${Y} contribution rates`, flat: `Flat rate (tarifa plana) ${Y}`, reg: "The year-end adjustment (regularización)", change: `Changing your base in ${Y}`, faq: "Questions", sources: "Sources", limits: "What it leaves out" },
  });

  const tableLead = L(locale, {
    es: `Rendimientos netos en promedio mensual. Si prevés quedarte por debajo de ${m(1166.7)} al mes usas la tabla reducida; si no, la general. Eliges cualquier base entre la mínima y la máxima de tu tramo; la cuota es la base por el ${pc(TOTAL_RATE)}. Desde el 1 de enero de ${Y}, la base máxima es de ${m(MAX_BASE)} para todos.`,
    ca: `Rendiments nets en mitjana mensual. Si preveus quedar per sota de ${m(1166.7)} al mes fas servir la taula reduïda; si no, la general. Tries qualsevol base entre la mínima i la màxima del teu tram; la quota és la base pel ${pc(TOTAL_RATE)}. Des de l'1 de gener del ${Y}, la base màxima és de ${m(MAX_BASE)} per a tothom.`,
    en: `Net earnings as a monthly average. If you expect to stay below ${m(1166.7)} a month you use the reduced table; otherwise the general one. You choose any base between your band's minimum and maximum; the contribution is the base times ${pc(TOTAL_RATE)}. From 1 January ${Y} the maximum base is ${m(MAX_BASE)} for everyone.`,
  });
  const cols = L(locale, {
    es: ["Tramo", "Rendimientos netos al mes (€)", "Base mínima", "Base máxima", "Cuota mínima", "Cuota máxima"],
    ca: ["Tram", "Rendiments nets al mes (€)", "Base mínima", "Base màxima", "Quota mínima", "Quota màxima"],
    en: ["Band", "Net earnings a month (€)", "Minimum base", "Maximum base", "Minimum contribution", "Maximum contribution"],
  });
  const caption = L(locale, {
    es: `Tramos de rendimientos netos ${Y} (Orden PJC/297/2026, art. 18.1) y cuota mensual al ${pc(TOTAL_RATE)}`,
    ca: `Trams de rendiments nets ${Y} (Ordre PJC/297/2026, art. 18.1) i quota mensual al ${pc(TOTAL_RATE)}`,
    en: `${Y} net earnings bands (Orden PJC/297/2026, art. 18.1) and monthly contribution at ${pc(TOTAL_RATE)}`,
  });

  const text2027 = L(locale, {
    es: [
      `Pendiente: a ${asOf} no hay ninguna tabla oficial de tramos para 2027. Ni ley de presupuestos, ni real decreto-ley, ni orden de cotización con cifras de 2027 se han publicado en el BOE. Las cifras de 2027 que circulan son propuestas negociadas con las asociaciones o estimaciones, no normas, y no las publicamos.`,
      `Cómo se fijó la de ${Y}: el Real Decreto-ley 13/2022 solo tenía tablas para 2023, 2024 y 2025, y desde ${Y} la ley encarga cada tabla a los presupuestos del año. Sin presupuestos para ${Y}, el Real Decreto-ley 3/2026, convalidado por el Congreso, mantuvo las tablas de 2025 y solo subió la base máxima de los tramos 11 y 12 a ${m(MAX_BASE)}:`,
      `Lo único ya fijado por ley para 2027 es el MEI: pasa del ${pc(RATES.intergenerationalEquity)} al ${pc(STATUS_2027.intergenerationalEquity)} (disposición transitoria cuadragésima tercera de la Ley General de la Seguridad Social). Hasta que se publique la norma de 2027, quien cotiza sigue con su base; los cambios de base que pidas del 1 de noviembre al 31 de diciembre de ${Y} tienen efecto el 1 de enero de 2027. Actualizaremos esta página el día que el BOE publique la tabla.`,
    ],
    ca: [
      `Pendent: a ${asOf} no hi ha cap taula oficial de trams per al 2027. Ni llei de pressupostos, ni reial decret llei, ni ordre de cotització amb xifres del 2027 s'han publicat al BOE. Les xifres del 2027 que circulen són propostes negociades amb les associacions o estimacions, no normes, i no les publiquem.`,
      `Com es va fixar la del ${Y}: el Reial decret llei 13/2022 només tenia taules per al 2023, el 2024 i el 2025, i des del ${Y} la llei encarrega cada taula als pressupostos de l'any. Sense pressupostos per al ${Y}, el Reial decret llei 3/2026, convalidat pel Congrés, va mantenir les taules del 2025 i només va apujar la base màxima dels trams 11 i 12 a ${m(MAX_BASE)}:`,
      `L'únic ja fixat per llei per al 2027 és l'MEI: passa del ${pc(RATES.intergenerationalEquity)} al ${pc(STATUS_2027.intergenerationalEquity)} (disposició transitòria quadragèsima tercera de la Llei general de la Seguretat Social). Fins que es publiqui la norma del 2027, qui cotitza continua amb la seva base; els canvis de base que demanis de l'1 de novembre al 31 de desembre del ${Y} tenen efecte l'1 de gener del 2027. Actualitzarem aquesta pàgina el dia que el BOE publiqui la taula.`,
    ],
    en: [
      `Pending: as of ${asOf} there is no official table of bands for 2027. No budget law, royal decree-law or contribution order with 2027 figures has been published in the BOE. The 2027 figures going round are proposals negotiated with self-employed associations or estimates, not rules, and we do not publish them.`,
      `How ${Y}'s was set: Royal Decree-law 13/2022 only had tables for 2023, 2024 and 2025, and from ${Y} the law leaves each table to that year's budget. With no ${Y} budget, Royal Decree-law 3/2026, ratified by Congress, kept the 2025 tables and only raised the maximum base of bands 11 and 12 to ${m(MAX_BASE)}:`,
      `The only 2027 figure already in the law is the MEI: it goes from ${pc(RATES.intergenerationalEquity)} to ${pc(STATUS_2027.intergenerationalEquity)} (General Social Security Act, transitional provision 43). Until the 2027 rule is published, you keep paying on your base; base changes you request from 1 November to 31 December ${Y} take effect on 1 January 2027. We will update this page the day the BOE publishes the table.`,
    ],
  });

  const earningsText = L(locale, {
    es: [
      `La Seguridad Social parte del rendimiento neto de tu actividad según las normas del IRPF. En estimación directa le suma tus propias cuotas de autónomo (casillas 0224 + 0186 de la Renta): por eso en la calculadora pones los gastos sin la cuota. Al resultado le resta un ${GENERIC_EXPENSES.general} % de gastos genéricos, o un ${GENERIC_EXPENSES.corporate} % si eres socio o administrador de una sociedad o socio de una sociedad laboral. Lo que queda, dividido entre 12, decide tu tramo.`,
      `Ejemplo: ${m(ex.annual.income, 0)} de ingresos − ${m(ex.annual.expenses, 0)} de gastos = ${m(ex.annual.net, 0)}; menos el ${ex.annual.genericPct} % (${m(ex.annual.genericDeduction)}) = ${m(ex.annual.computable)} al año, ${m(ex.monthlyEarnings)} al mes: ${exBand.toLowerCase()}, base de ${m(ex.range.min)} a ${m(ex.range.max)}, cuota de ${m(ex.bandMonthly.min)} a ${m(ex.bandMonthly.max)} al mes.`,
    ],
    ca: [
      `La Seguretat Social parteix del rendiment net de la teva activitat segons les normes de l'IRPF. En estimació directa hi suma les teves pròpies quotes d'autònom (caselles 0224 + 0186 de la renda): per això a la calculadora poses les despeses sense la quota. Al resultat li resta un ${GENERIC_EXPENSES.general} % de despeses genèriques, o un ${GENERIC_EXPENSES.corporate} % si ets soci o administrador d'una societat o soci d'una societat laboral. El que queda, dividit entre 12, decideix el teu tram.`,
      `Exemple: ${m(ex.annual.income, 0)} d'ingressos − ${m(ex.annual.expenses, 0)} de despeses = ${m(ex.annual.net, 0)}; menys el ${ex.annual.genericPct} % (${m(ex.annual.genericDeduction)}) = ${m(ex.annual.computable)} l'any, ${m(ex.monthlyEarnings)} al mes: ${exBand.toLowerCase()}, base de ${m(ex.range.min)} a ${m(ex.range.max)}, quota de ${m(ex.bandMonthly.min)} a ${m(ex.bandMonthly.max)} al mes.`,
    ],
    en: [
      `Social Security starts from your activity's net earnings under income tax (IRPF) rules. Under estimación directa it adds back your own self-employed contributions (boxes 0224 + 0186 of the Renta return): that is why the calculator asks for expenses without the contribution. It then takes off ${GENERIC_EXPENSES.general}% for generic expenses, or ${GENERIC_EXPENSES.corporate}% if you are a partner or director of a company or a partner in a sociedad laboral. What is left, divided by 12, sets your band.`,
      `Example: ${m(ex.annual.income, 0)} income − ${m(ex.annual.expenses, 0)} expenses = ${m(ex.annual.net, 0)}; minus ${ex.annual.genericPct}% (${m(ex.annual.genericDeduction)}) = ${m(ex.annual.computable)} a year, ${m(ex.monthlyEarnings)} a month: ${exBand.toLowerCase()}, base ${m(ex.range.min)} to ${m(ex.range.max)}, contribution ${m(ex.bandMonthly.min)} to ${m(ex.bandMonthly.max)} a month.`,
    ],
  });

  const rateCols = L(locale, { es: ["Concepto", "Tipo", "Norma"], ca: ["Concepte", "Tipus", "Norma"], en: ["Item", "Rate", "Rule"] });
  const art = (n: string) => L(locale, { es: `Orden PJC/297/2026, art. ${n}`, ca: `Ordre PJC/297/2026, art. ${n}`, en: `Orden PJC/297/2026, art. ${n}` });
  const rateRows: [string, string, string][] = [
    [L(locale, { es: "Contingencias comunes", ca: "Contingències comunes", en: "Common contingencies" }), pc(RATES.commonContingencies), art("18.2.a")],
    [L(locale, { es: "Contingencias profesionales", ca: "Contingències professionals", en: "Professional contingencies" }), pc(RATES.professionalContingencies), art("18.2.b")],
    [L(locale, { es: "Cese de actividad", ca: "Cessament d'activitat", en: "Cessation of activity" }), pc(RATES.cessation), art("37.5.a")],
    [L(locale, { es: "Formación profesional", ca: "Formació professional", en: "Vocational training" }), pc(RATES.vocationalTraining), art("37.6")],
    [L(locale, { es: "Mecanismo de equidad intergeneracional (MEI)", ca: "Mecanisme d'equitat intergeneracional (MEI)", en: "Intergenerational equity mechanism (MEI)" }), pc(RATES.intergenerationalEquity), art("18.2.c")],
    [L(locale, { es: "Total", ca: "Total", en: "Total" }), pc(TOTAL_RATE), ""],
  ];

  const flatText = L(locale, {
    es: [
      `Si te das de alta como autónomo por primera vez, o no has estado de alta en los últimos ${FLAT_RATE.yearsOut} años (${FLAT_RATE.yearsOutIfUsedBefore} si ya la disfrutaste), puedes pedir en el alta una cuota reducida de ${m(FLAT_RATE.fee, 0)} al mes durante los ${FLAT_RATE.firstMonths} meses naturales completos siguientes, sin cotizar por cese de actividad ni formación profesional (Estatuto del trabajo autónomo, art. 38 ter):`,
      `Para ${Y} la Tesorería General de la Seguridad Social indica que hay que sumarle el MEI:`,
      `Después puedes pedir ${FLAT_RATE.secondMonths} meses más si tus rendimientos netos del año (calculados como arriba) van a ser inferiores al salario mínimo anual, ${m(SMI_ANNUAL, 0)} en ${Y}, con una declaración antes de que empiece ese periodo. Si al final los superas, al regularizar te reclaman lo que la tarifa plana dejó sin pagar. Con discapacidad del 33 % o más, o siendo víctima de violencia de género o de terrorismo, los periodos son de ${FLAT_RATE.specialFirstMonths} y ${FLAT_RATE.specialSecondMonths} meses. No la tienen los familiares colaboradores. Durante la tarifa plana, tus prestaciones se calculan con la base mínima del tramo 1 de la tabla general.`,
    ],
    ca: [
      `Si et dones d'alta com a autònom per primera vegada, o no has estat d'alta els últims ${FLAT_RATE.yearsOut} anys (${FLAT_RATE.yearsOutIfUsedBefore} si ja en vas gaudir), pots demanar a l'alta una quota reduïda de ${m(FLAT_RATE.fee, 0)} al mes durant els ${FLAT_RATE.firstMonths} mesos naturals complets següents, sense cotitzar per cessament d'activitat ni formació professional (Estatut del treball autònom, art. 38 ter):`,
      `Per al ${Y} la Tresoreria General de la Seguretat Social indica que s'hi ha de sumar l'MEI:`,
      `Després pots demanar ${FLAT_RATE.secondMonths} mesos més si els teus rendiments nets de l'any (calculats com a dalt) seran inferiors al salari mínim anual, ${m(SMI_ANNUAL, 0)} el ${Y}, amb una declaració abans que comenci aquest període. Si al final el superes, en regularitzar et reclamen el que la tarifa plana va deixar sense pagar. Amb discapacitat del 33 % o més, o si ets víctima de violència de gènere o de terrorisme, els períodes són de ${FLAT_RATE.specialFirstMonths} i ${FLAT_RATE.specialSecondMonths} mesos. No la tenen els familiars col·laboradors. Durant la tarifa plana, les prestacions es calculen amb la base mínima del tram 1 de la taula general.`,
    ],
    en: [
      `If you register as self-employed for the first time, or have not been registered in the last ${FLAT_RATE.yearsOut} years (${FLAT_RATE.yearsOutIfUsedBefore} if you had it before), you can ask when registering for a reduced fee of ${m(FLAT_RATE.fee, 0)} a month for the next ${FLAT_RATE.firstMonths} full calendar months, with no cessation or training contributions (Self-Employment Statute, art. 38 ter):`,
      `For ${Y} the Social Security Treasury (TGSS) says the MEI is added on top:`,
      `You can then ask for ${FLAT_RATE.secondMonths} more months if your year's net earnings (counted as above) will be below the annual minimum wage, ${m(SMI_ANNUAL, 0)} in ${Y}, with a declaration before that period starts. If you end up above it, the year-end adjustment claims back what the flat rate left unpaid. With a disability of 33% or more, or as a victim of gender violence or terrorism, the periods are ${FLAT_RATE.specialFirstMonths} and ${FLAT_RATE.specialSecondMonths} months. Collaborating family members can't have it. While on the flat rate, your benefits are worked out on the general table's band 1 minimum base.`,
    ],
  });

  const regText = L(locale, {
    es: [
      "La base que eliges durante el año es provisional. Cuando la Agencia Tributaria (o la hacienda foral) comunica a la Tesorería tus rendimientos del año, la Tesorería los reparte entre los meses de alta, mira en qué tramo caen y compara (Ley General de la Seguridad Social, art. 308.1.c):",
      `No tienes que pedir nada: recibes la resolución por notificación electrónica (Seguridad Social o DEHú). No se regularizan la tarifa plana, las bajas y prestaciones cobradas durante el año ni las altas fuera de plazo. Quien no presenta la Renta, o no declara ingresos en estimación directa, queda con la base mínima del grupo 7 del Régimen General (${m(CORPORATE_MIN_BASE)} en ${Y}).`,
    ],
    ca: [
      "La base que tries durant l'any és provisional. Quan l'Agència Tributària (o la hisenda foral) comunica a la Tresoreria els teus rendiments de l'any, la Tresoreria els reparteix entre els mesos d'alta, mira en quin tram cauen i compara (Llei general de la Seguretat Social, art. 308.1.c):",
      `No has de demanar res: reps la resolució per notificació electrònica (Seguretat Social o DEHú). No es regularitzen la tarifa plana, les baixes i prestacions cobrades durant l'any ni les altes fora de termini. Qui no presenta la renda, o no declara ingressos en estimació directa, es queda amb la base mínima del grup 7 del règim general (${m(CORPORATE_MIN_BASE)} el ${Y}).`,
    ],
    en: [
      "The base you choose during the year is provisional. When the Tax Agency (or the foral treasury) reports your year's earnings to the Treasury, the Treasury spreads them over the months you were registered, sees which band they fall in, and compares (General Social Security Act, art. 308.1.c):",
      `You don't have to ask: the decision arrives as an electronic notice (Social Security or DEHú). The flat-rate period, sick leave and benefits drawn during the year, and late registrations are not adjusted. If you don't file the Renta, or declare no income under estimación directa, the General Regime's group 7 minimum base applies (${m(CORPORATE_MIN_BASE)} in ${Y}).`,
    ],
  });
  const regCases = L(locale, {
    es: [
      "Si tu base estaba entre la mínima y la máxima de ese tramo: no pasa nada.",
      "Si estaba por debajo de la mínima: pagas la diferencia hasta el último día del mes siguiente a la notificación, sin intereses ni recargo (después, recargo del 10 % o del 20 %).",
      "Si estaba por encima de la máxima: te devuelven la diferencia de oficio, sin intereses, antes del 30 de abril del año siguiente a la comunicación de Hacienda.",
    ],
    ca: [
      "Si la teva base era entre la mínima i la màxima d'aquell tram: no passa res.",
      "Si era per sota de la mínima: pagues la diferència fins a l'últim dia del mes següent a la notificació, sense interessos ni recàrrec (després, recàrrec del 10 % o del 20 %).",
      "Si era per sobre de la màxima: et retornen la diferència d'ofici, sense interessos, abans del 30 d'abril de l'any següent a la comunicació d'Hisenda.",
    ],
    en: [
      "If your base was between that band's minimum and maximum: nothing happens.",
      "If it was below the minimum: you pay the difference by the last day of the month after the notice, with no interest or surcharge (later, a 10% or 20% surcharge).",
      "If it was above the maximum: the difference is refunded automatically, without interest, before 30 April of the year after the Tax Agency's report.",
    ],
  });
  const changeText = L(locale, {
    es: `Puedes cambiar de base hasta seis veces al año en Import@ss (servicio «Base de cotización y rendimientos»), y conviene hacerlo si tus ingresos cambian para que la regularización salga a cero. En ${Y} el cambio surte efecto el ${BASE_CHANGE_DATES_2026.map((d) => dayMonthYear(d, "es")).join(", ")}, según cuándo lo pidas (el último, para lo pedido en noviembre y diciembre).`,
    ca: `Pots canviar de base fins a sis vegades l'any a Import@ss (servei «Base de cotización y rendimientos»), i convé fer-ho si els teus ingressos canvien perquè la regularització surti a zero. El ${Y} el canvi té efecte l'${BASE_CHANGE_DATES_2026.map((d) => dayMonthYear(d, "ca")).join(", l'")}, segons quan el demanis (l'últim, per al que es demana al novembre i al desembre).`,
    en: `You can change your base up to six times a year on Import@ss ("Base de cotización y rendimientos" service), and should do so if your income changes, so the year-end adjustment comes out at zero. In ${Y} a change takes effect on ${BASE_CHANGE_DATES_2026.map((d) => dayMonthYear(d, "en")).join(", ")}, depending on when you ask (the last one for requests in November and December).`,
  });

  const g2 = BANDS_2026.find((b) => b.table === "general" && b.n === 2)!;
  const faq = L(locale, {
    es: [
      { q: `¿Cuánto paga como mínimo un autónomo en ${Y}?`, a: `${m(lowest)} al mes con la base mínima del tramo 1 de la tabla reducida (rendimientos de hasta 670 € al mes), y ${m(generalLowest)} con la mínima de la tabla general (desde ${m(1166.7)} al mes). La máxima posible es ${m(highest)}. Los nuevos autónomos con tarifa plana pagan ${m(FLAT_RATE.totalWithMei)} (${m(FLAT_RATE.fee, 0)} más el MEI).` },
      { q: "¿Qué cuota pago si gano 1.500 € netos al mes?", a: `Con 1.500 € de rendimientos netos computables al mes (ya restado el ${GENERIC_EXPENSES.general} %) estás en el tramo 2 de la tabla general: base de ${m(g2.minBase)} a ${m(g2.maxBase)}, cuota de ${m(contribution(g2.minBase))} a ${m(contribution(g2.maxBase))} al mes. Usa la calculadora con tus ingresos y gastos.` },
      { q: "¿Qué ingresos cuentan para el tramo?", a: earningsText[0]! },
      { q: `¿Cuánto es la tarifa plana en ${Y}?`, a: `${m(FLAT_RATE.fee, 0)} al mes más el MEI: ${m(FLAT_RATE.totalWithMei)} en total, según la Tesorería General de la Seguridad Social, durante los primeros ${FLAT_RATE.firstMonths} meses, y ${FLAT_RATE.secondMonths} más si tus rendimientos netos son inferiores al salario mínimo anual (${m(SMI_ANNUAL, 0)}).` },
      { q: "¿Puedo cotizar por una base más alta que la mínima?", a: "Sí, por cualquier base hasta la máxima de tu tramo. Pagas más, pero tus prestaciones (baja, jubilación, cese de actividad) se calculan sobre esa base. Si eliges una base por encima de la máxima de tu tramo, al regularizar te devuelven la diferencia, salvo que ya cotizaras por una base superior a 31 de diciembre de 2022 y decidas mantenerla." },
      { q: "¿Cuándo regulariza la Seguridad Social?", a: "Cuando Hacienda le comunica tus rendimientos del año, lo que ocurre a partir del año siguiente (Ley General de la Seguridad Social, art. 308.1.c). La Tesorería lo hace sola y te lo notifica: si sale a pagar, tienes hasta el último día del mes siguiente; si sale a devolver, te ingresa la diferencia antes del 30 de abril." },
      { q: "¿Cuál es la cuota de autónomos en 2027?", a: text2027[0]! },
    ],
    ca: [
      { q: `Quant paga com a mínim un autònom el ${Y}?`, a: `${m(lowest)} al mes amb la base mínima del tram 1 de la taula reduïda (rendiments de fins a 670 € al mes), i ${m(generalLowest)} amb la mínima de la taula general (des de ${m(1166.7)} al mes). La màxima possible és ${m(highest)}. Els autònoms nous amb tarifa plana paguen ${m(FLAT_RATE.totalWithMei)} (${m(FLAT_RATE.fee, 0)} més l'MEI).` },
      { q: "Quina quota pago si guanyo 1.500 € nets al mes?", a: `Amb 1.500 € de rendiments nets computables al mes (ja restat el ${GENERIC_EXPENSES.general} %) ets al tram 2 de la taula general: base de ${m(g2.minBase)} a ${m(g2.maxBase)}, quota de ${m(contribution(g2.minBase))} a ${m(contribution(g2.maxBase))} al mes. Fes servir la calculadora amb els teus ingressos i despeses.` },
      { q: "Quins ingressos compten per al tram?", a: earningsText[0]! },
      { q: `Quant és la tarifa plana el ${Y}?`, a: `${m(FLAT_RATE.fee, 0)} al mes més l'MEI: ${m(FLAT_RATE.totalWithMei)} en total, segons la Tresoreria General de la Seguretat Social, durant els primers ${FLAT_RATE.firstMonths} mesos, i ${FLAT_RATE.secondMonths} més si els teus rendiments nets són inferiors al salari mínim anual (${m(SMI_ANNUAL, 0)}).` },
      { q: "Puc cotitzar per una base més alta que la mínima?", a: "Sí, per qualsevol base fins a la màxima del teu tram. Pagues més, però les prestacions (baixa, jubilació, cessament d'activitat) es calculen sobre aquesta base. Si tries una base per sobre de la màxima del teu tram, en regularitzar et retornen la diferència, llevat que ja cotitzessis per una base superior a 31 de desembre de 2022 i decideixis mantenir-la." },
      { q: "Quan regularitza la Seguretat Social?", a: "Quan Hisenda li comunica els teus rendiments de l'any, cosa que passa a partir de l'any següent (Llei general de la Seguretat Social, art. 308.1.c). La Tresoreria ho fa sola i t'ho notifica: si surt a pagar, tens fins a l'últim dia del mes següent; si surt a retornar, t'ingressa la diferència abans del 30 d'abril." },
      { q: "Quina és la quota d'autònoms el 2027?", a: text2027[0]! },
    ],
    en: [
      { q: `What is the lowest self-employed contribution in ${Y}?`, a: `${m(lowest)} a month on the minimum base of the reduced table's band 1 (net earnings up to €670 a month), and ${m(generalLowest)} on the general table's minimum (from ${m(1166.7)} a month). The highest possible is ${m(highest)}. New self-employed workers on the flat rate pay ${m(FLAT_RATE.totalWithMei)} (${m(FLAT_RATE.fee, 0)} plus the MEI).` },
      { q: "What do I pay on €1,500 net a month?", a: `With €1,500 of counted net earnings a month (after the ${GENERIC_EXPENSES.general}% deduction) you are in the general table's band 2: base ${m(g2.minBase)} to ${m(g2.maxBase)}, contribution ${m(contribution(g2.minBase))} to ${m(contribution(g2.maxBase))} a month. Use the calculator with your income and expenses.` },
      { q: "Which earnings count for the band?", a: earningsText[0]! },
      { q: `How much is the flat rate in ${Y}?`, a: `${m(FLAT_RATE.fee, 0)} a month plus the MEI: ${m(FLAT_RATE.totalWithMei)} in all, according to the Social Security Treasury, for the first ${FLAT_RATE.firstMonths} months, and ${FLAT_RATE.secondMonths} more if your net earnings are below the annual minimum wage (${m(SMI_ANNUAL, 0)}).` },
      { q: "Can I pay on a higher base than the minimum?", a: "Yes, on any base up to your band's maximum. You pay more, but your benefits (sick pay, pension, cessation benefit) are worked out on that base. If you choose a base above your band's maximum, the year-end adjustment refunds the difference, unless you were already paying on a higher base on 31 December 2022 and choose to keep it." },
      { q: "When does Social Security make the year-end adjustment?", a: "When the Tax Agency reports your year's earnings, which happens from the following year on (General Social Security Act, art. 308.1.c). The Treasury does it on its own and notifies you: if you owe, you have until the last day of the following month; if you are owed, it pays the difference before 30 April." },
      { q: "What is the self-employed contribution in 2027?", a: text2027[0]! },
    ],
  });

  const sourceList = [SOURCES.order, SOURCES.rdl3, SOURCES.rdl13, SOURCES.lgss, SOURCES.leta, SOURCES.tgssGuide, SOURCES.ssSystem];
  const sourcesLead = L(locale, {
    es: `Solo fuentes oficiales, leídas el ${asOf}. Las citas son del BOE y de la Tesorería General de la Seguridad Social.`,
    ca: `Només fonts oficials, llegides el ${asOf}. Les cites són del BOE i de la Tresoreria General de la Seguretat Social.`,
    en: `Official sources only, read on ${asOf}. Quotes are from the BOE and the Social Security Treasury (in Spanish).`,
  });
  const officialTools = L(locale, {
    es: { sim: "Simulador oficial de cuotas de autónomos (Import@ss)", change: "Cambiar la base de cotización y los rendimientos previstos (Import@ss)", reg: "Alta como autónomo (Import@ss)", intro: "Herramientas oficiales de la Seguridad Social:" },
    ca: { sim: "Simulador oficial de quotes d'autònoms (Import@ss)", change: "Canviar la base de cotització i els rendiments previstos (Import@ss)", reg: "Alta com a autònom (Import@ss)", intro: "Eines oficials de la Seguretat Social:" },
    en: { sim: "Official self-employed contribution simulator (Import@ss)", change: "Change your contribution base and expected earnings (Import@ss)", reg: "Register as self-employed (Import@ss)", intro: "Social Security's own tools:" },
  });
  const limits = L(locale, {
    es: [
      "Altas o bajas a mitad de año: la regularización reparte los rendimientos por días de alta.",
      "Pluriactividad (trabajar a la vez por cuenta ajena) y su devolución del 50 % del exceso.",
      "Familiares colaboradores, religiosos, artistas con base reducida, venta ambulante, Sistema Especial Agrario y Régimen del Mar.",
      "Otras bonificaciones (nacimiento, cuidado de menores, reincorporación, Cuenca, Soria y Teruel) y la tarifa plana de 24 y 36 meses.",
      "El IRPF y el IVA de tu actividad.",
    ],
    ca: [
      "Altes o baixes a mitjan any: la regularització reparteix els rendiments per dies d'alta.",
      "Pluriactivitat (treballar alhora per compte d'altri) i el seu retorn del 50 % de l'excés.",
      "Familiars col·laboradors, religiosos, artistes amb base reduïda, venda ambulant, sistema especial agrari i règim del mar.",
      "Altres bonificacions (naixement, cura de menors, reincorporació, Conca, Sòria i Terol) i la tarifa plana de 24 i 36 mesos.",
      "L'IRPF i l'IVA de la teva activitat.",
    ],
    en: [
      "Registering or leaving mid-year: the adjustment spreads earnings over the days registered.",
      "Pluriactivity (also working as an employee) and its 50% refund of the excess.",
      "Collaborating family members, religious orders, artists' reduced base, street vendors, the agrarian special system and sea workers.",
      "Other reductions (birth, childcare, return to work, Cuenca, Soria and Teruel) and the 24 + 36-month flat rate.",
      "Income tax (IRPF) and VAT on your activity.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(selfEmployedPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const quoteFooter = (url: string, label: string) => (
    <footer className="text-sm">
      <a href={url} rel="noopener" target="_blank">
        {label}
      </a>
    </footer>
  );

  return (
    <>
      <SiteHeader locale={locale} translations={selfEmployedEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{fresh}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <SelfEmployedCalculator locale={locale} initial={DEFAULT_INPUT} />
              <p className="text-sm">
                {officialTools.intro}{" "}
                <a href={OFFICIAL_LINKS.simulator} rel="noopener" target="_blank">
                  {officialTools.sim}
                </a>
                .
              </p>

              <h2 id="tramos">{h.table}</h2>
              <p>{tableLead}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ band, minMonthly, maxMonthly }) => (
                      <tr key={`${band.table}-${band.n}`} id={`tramo-${band.table === "reduced" ? "r" : "g"}${band.n}`}>
                        <th scope="row" className="font-normal">
                          {bandName(band, locale)}
                        </th>
                        <td data-label={cols[1]} className="whitespace-nowrap tabular-nums">
                          {bandRangeText(band, locale)}
                        </td>
                        <td data-label={cols[2]} className="whitespace-nowrap tabular-nums">
                          {m(band.minBase)}
                        </td>
                        <td data-label={cols[3]} className="whitespace-nowrap tabular-nums">
                          {m(band.maxBase)}
                        </td>
                        <td data-label={cols[4]} className="whitespace-nowrap tabular-nums">
                          {m(minMonthly)}
                        </td>
                        <td data-label={cols[5]} className="whitespace-nowrap tabular-nums">
                          {m(maxMonthly)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="2027">{h.y2027}</h2>
              <p>{text2027[0]}</p>
              <p>{text2027[1]}</p>
              <blockquote lang="es">
                <p>«{QUOTE.rdl3art34}»</p>
                {quoteFooter(SOURCES.rdl3.url, `Real Decreto-ley 3/2026, art. 3.4 (${SOURCES.rdl3.ref})`)}
              </blockquote>
              <p>{text2027[2]}</p>

              <h2 id="rendimientos">{h.earnings}</h2>
              <p>{earningsText[0]}</p>
              <blockquote lang="es">
                <p>«{QUOTE.lgss308deduction}»</p>
                {quoteFooter(SOURCES.lgss.url, L(locale, { es: "Ley General de la Seguridad Social, art. 308.1.c), regla 2.ª", ca: "Llei general de la Seguretat Social, art. 308.1.c), regla 2a", en: "General Social Security Act, art. 308.1.c), rule 2" }))}
              </blockquote>
              <p>{earningsText[1]}</p>

              <h2 id="tipos">{h.rates}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {rateCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rateRows.map(([name, rate, rule]) => (
                      <tr key={name}>
                        <th scope="row" className="font-normal">
                          {name}
                        </th>
                        <td data-label={rateCols[1]}>{rate}</td>
                        <td data-label={rateCols[2]}>{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="tarifa-plana">{h.flat}</h2>
              <p>{flatText[0]}</p>
              <blockquote lang="es">
                <p>«{QUOTE.leta38ter1}»</p>
                {quoteFooter(SOURCES.leta.url, L(locale, { es: "Ley 20/2007, art. 38 ter.1", ca: "Llei 20/2007, art. 38 ter.1", en: "Ley 20/2007, art. 38 ter.1" }))}
              </blockquote>
              <p>{flatText[1]}</p>
              <blockquote lang="es">
                <p>«{QUOTE.tgssFlatRate}»</p>
                {quoteFooter(SOURCES.tgssGuide.url, `${SOURCES.tgssGuide.name} (${dayMonthYear(SOURCES.tgssGuide.date, locale)})`)}
              </blockquote>
              <p>{flatText[2]}</p>

              <h2 id="regularizacion">{h.reg}</h2>
              <p>{regText[0]}</p>
              <ul>
                {regCases.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p>{regText[1]}</p>

              <h2 id="cambiar-base">{h.change}</h2>
              <p>{changeText}</p>
              <ul>
                <li>
                  <a href={OFFICIAL_LINKS.baseChange} rel="noopener" target="_blank">
                    {officialTools.change}
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL_LINKS.simulator} rel="noopener" target="_blank">
                    {officialTools.sim}
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL_LINKS.registration} rel="noopener" target="_blank">
                    {officialTools.reg}
                  </a>
                </li>
              </ul>

              <h2 id="preguntas">{h.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}
              <p>
                {L(locale, { es: "¿Trabajas por cuenta ajena?", ca: "Treballes per compte d'altri?", en: "Working as an employee?" })}{" "}
                <Link href={netSalaryPath(locale)}>{L(locale, { es: "Calcula tu sueldo neto", ca: "Calcula el teu sou net", en: "Work out your net salary" })}</Link>.
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {sourceList.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener" target="_blank">
                      {s.name}
                    </a>{" "}
                    ({s.ref}, {dayMonthYear(s.date, locale)})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>

              <MoreCalculators current="self-employed" locale={locale} />
            </div>
            <ShareBar locale={locale} path={selfEmployedPath(locale)} title={meta.h1} contentType="self_employed_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/** For the tests: the default example the page's lead is written from. */
export function defaultExample(): SelfEmployedResult {
  return calculateSelfEmployed(DEFAULT_INPUT);
}
