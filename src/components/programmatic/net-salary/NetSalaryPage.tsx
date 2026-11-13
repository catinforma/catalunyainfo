import type { Metadata } from "next";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { money, netSalaryEditions, netSalaryPath, percent, type NetLocale } from "@/lib/programmatic/net-salary/copy";
import { DEFAULT_INPUT, calculateNetSalary, scale, type SalaryResult } from "@/lib/programmatic/net-salary/engine";
import { REGIONS, regionById } from "@/lib/programmatic/net-salary/regions";
import { AEAT_VALIDATION, FORAL_LINKS, IRPF, SALARY_RULES_AS_OF, SALARY_RULES_YEAR, SOCIAL_SECURITY, SOURCES } from "@/lib/programmatic/net-salary/rules-2026";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { NetSalaryCalculator } from "./NetSalaryCalculator";

/**
 * "Calculadora de sueldo neto 2026" / "Calculadora de sou net 2026" / "Spain
 * net salary calculator 2026": the calculator (server-rendered with the
 * default example), then what the reader needs to trust it: a table of net
 * pay by gross salary, the worked example step by step, why the community
 * does not change the payslip, the 2026 rates, questions, sources and limits.
 * Every figure is computed at build time by the engine from rules-2026.ts.
 */

const L = <T,>(locale: NetLocale, v: Record<NetLocale, T>): T => v[locale];
const Y = SALARY_RULES_YEAR;

/** Gross salaries of the table (single, no children, open-ended contract, under 65). */
export const TABLE_SALARIES = [15000, 18000, 20000, 22000, 24000, 25000, 28000, 30000, 32000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 100000] as const;

export const NET_META: Record<NetLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: `Calculadora de sueldo neto ${Y}: de bruto a neto, por comunidad`,
    description: `Calcula tu sueldo neto ${Y} en cualquier comunidad: retención de IRPF con el algoritmo oficial de la Agencia Tributaria y cotizaciones a la Seguridad Social, en 12 o 14 pagas.`,
    h1: `Calculadora de sueldo neto ${Y}`,
    breadcrumb: "Calculadora de sueldo neto",
    appName: `Calculadora de sueldo neto ${Y}`,
  },
  ca: {
    title: `Calculadora de sou net ${Y}: de brut a net, a tot Espanya`,
    description: `Calcula el teu sou net del ${Y}: retenció d'IRPF amb l'algoritme oficial de l'Agència Tributària i cotitzacions a la Seguretat Social, en 12 o 14 pagues.`,
    h1: `Calculadora de sou net ${Y}`,
    breadcrumb: "Calculadora de sou net",
    appName: `Calculadora de sou net ${Y}`,
  },
  en: {
    title: `Spain net salary calculator ${Y}: gross to net pay`,
    description: `Work out your ${Y} take-home pay in Spain: IRPF withholding with the Tax Agency's official algorithm and Social Security contributions, in 12 or 14 payments.`,
    h1: `Spain net salary calculator ${Y}`,
    breadcrumb: "Net salary calculator",
    appName: `Spain net salary calculator ${Y}`,
  },
};

export function netSalaryCrumbs(locale: NetLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: NET_META[locale].breadcrumb, href: netSalaryPath(locale) },
  ];
}

export function netSalaryMetadata(locale: NetLocale): Metadata {
  const m = NET_META[locale];
  return buildMetadata({ locale, path: netSalaryPath(locale), title: m.title, description: m.description, translations: netSalaryEditions() });
}

function tableRows() {
  return TABLE_SALARIES.map((gross) => {
    const r14 = calculateNetSalary({ ...DEFAULT_INPUT, gross, payments: 14 });
    const r12 = calculateNetSalary({ ...DEFAULT_INPUT, gross, payments: 12 });
    return { gross, r14, r12 };
  });
}

/** The worker's total rate for an open-ended and a fixed-term contract (6.50 / 6.55). */
function workerRate(fixedTerm: boolean): number {
  const s = SOCIAL_SECURITY.rates;
  return Math.round((s.commonContingencies + (fixedTerm ? s.unemploymentFixedTerm : s.unemploymentOpenEnded) + s.vocationalTraining + s.intergenerationalEquity) * 100) / 100;
}

export function NetSalaryRoute({ locale }: { locale: NetLocale }) {
  const meta = NET_META[locale];
  const crumbs = netSalaryCrumbs(locale);
  const ex = calculateNetSalary(DEFAULT_INPUT);
  const exRegion = regionById(DEFAULT_INPUT.region)!.names[locale];
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale);
  const rows = tableRows();
  const asOf = dayMonthYear(SALARY_RULES_AS_OF, locale);
  const validated = dayMonthYear(AEAT_VALIDATION.date, locale);
  const rateOpen = workerRate(false);
  const rateFixed = workerRate(true);
  const common = REGIONS.filter((r) => r.regime === "common").length;
  const maxAnnual = SOCIAL_SECURITY.maxBaseMonthly * 12;

  const lead = L(locale, {
    es: `Con ${m(ex.input.gross, 0)} brutos al año en ${exRegion}, soltero, sin hijos y con contrato indefinido, cobras ${m(ex.net.perPayment)} netos al mes en 14 pagas (${m(ex.net.monthlyAverage)} en 12): la Seguridad Social se lleva ${m(ex.ss.annual, 0)} y la retención de IRPF, del ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual, 0)} al año. Cambia los datos y el cálculo se rehace con las reglas oficiales de ${Y}.`,
    ca: `Amb ${m(ex.input.gross, 0)} bruts l'any a ${exRegion}, solter, sense fills i amb contracte indefinit, cobres ${m(ex.net.perPayment)} nets al mes en 14 pagues (${m(ex.net.monthlyAverage)} en 12): la Seguretat Social s'emporta ${m(ex.ss.annual, 0)} i la retenció d'IRPF, del ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual, 0)} l'any. Canvia les dades i el càlcul es refà amb les regles oficials del ${Y}.`,
    en: `On ${m(ex.input.gross, 0)} gross a year in ${exRegion}, single, no children, open-ended contract, you take home ${m(ex.net.perPayment)} a month in 14 payments (${m(ex.net.monthlyAverage)} in 12): Social Security takes ${m(ex.ss.annual, 0)} and IRPF withholding, at ${pc(ex.irpf.rate)}, ${m(ex.irpf.annual, 0)} a year. Change the figures and it recalculates with the official ${Y} rules.`,
  });

  const h = L(locale, {
    es: { table: `Sueldo neto ${Y} según el bruto anual`, how: "Cómo se calcula, paso a paso", regions: "¿Cambia el sueldo neto según la comunidad autónoma?", rates: `Cotizaciones y escala de retención ${Y}`, faq: "Preguntas frecuentes", sources: "Fuentes y comprobación", limits: "Qué no incluye" },
    ca: { table: `Sou net ${Y} segons el brut anual`, how: "Com es calcula, pas a pas", regions: "Canvia el sou net segons la comunitat autònoma?", rates: `Cotitzacions i escala de retenció ${Y}`, faq: "Preguntes freqüents", sources: "Fonts i comprovació", limits: "Què no inclou" },
    en: { table: `Net salary ${Y} by gross annual pay`, how: "How it is worked out, step by step", regions: "Does your region change your net pay?", rates: `${Y} contribution rates and withholding scale`, faq: "Questions", sources: "Sources and checks", limits: "What it leaves out" },
  });

  const tableLead = L(locale, {
    es: `Soltero (situación 3), sin hijos, menos de 65 años, contrato indefinido, en cualquiera de las ${common} comunidades de régimen común (también Cataluña o Madrid: la retención es la misma). En 14 pagas, las dos extra no llevan cotización: cobras un poco más que en una nómina ordinaria.`,
    ca: `Solter (situació 3), sense fills, menys de 65 anys, contracte indefinit, a qualsevol de les ${common} comunitats de règim comú (també Catalunya o Madrid: la retenció és la mateixa). En 14 pagues, les dues extres no porten cotització: cobres una mica més que en una nòmina ordinària.`,
    en: `Single (situation 3), no children, under 65, open-ended contract, in any of the ${common} common-regime regions (Catalonia and Madrid included: withholding is the same). In 14 payments, the two extras carry no contributions, so they pay a little more than an ordinary payslip.`,
  });
  const cols = L(locale, {
    es: ["Bruto anual", "Neto al mes (14 pagas)", "Neto al mes (12 pagas)", "Neto al año", "Retención IRPF", "Seguridad Social"],
    ca: ["Brut anual", "Net al mes (14 pagues)", "Net al mes (12 pagues)", "Net a l'any", "Retenció IRPF", "Seguretat Social"],
    en: ["Gross a year", "Net a month (14 payments)", "Net a month (12 payments)", "Net a year", "IRPF withheld", "Social Security"],
  });
  const caption = L(locale, {
    es: `Sueldo neto ${Y} por tramos de bruto anual; soltero, sin hijos, contrato indefinido`,
    ca: `Sou net ${Y} per trams de brut anual; solter, sense fills, contracte indefinit`,
    en: `Net salary ${Y} by gross annual pay; single, no children, open-ended contract`,
  });

  const i = ex.irpf;
  const steps = L(locale, {
    es: [
      `Seguridad Social. Base de cotización: el bruto entre 12 (las pagas extra se prorratean), ${m(ex.ss.baseMonthly)} al mes, con un máximo de ${m(SOCIAL_SECURITY.maxBaseMonthly)}. Tu parte es el ${pc(rateOpen)} con contrato indefinido (${pc(rateFixed)} si es temporal): ${m(ex.ss.monthly)} al mes, ${m(ex.ss.annual)} al año.`,
      `Rendimiento neto: ${m(ex.input.gross)} menos las cotizaciones, ${m(i.netIncome)}. Se restan ${m(IRPF.otherExpenses, 0)} de gastos generales y la reducción por rendimientos del trabajo (${m(i.workReduction)} en este caso: solo existe por debajo de ${m(IRPF.workReduction.thirdTo)} de rendimiento). Queda la base de retención: ${m(i.base)}.`,
      `Cuota: se aplica la escala de retención a la base (${m(i.cuota1)}) y se resta la misma escala aplicada al mínimo personal y familiar, ${m(i.minimum)} (${m(i.cuota2)}). Resultado: ${m(i.cuota)}.`,
      `Tipo de retención: la cuota entre el bruto, ${pc(i.rate)}, truncado a dos decimales. Es lo que tu empresa aplica a cada nómina: ${m(i.annual)} al año.`,
      `Neto: ${m(ex.input.gross)} − ${m(ex.ss.annual)} − ${m(i.annual)} = ${m(ex.net.annual)} al año. En 14 pagas, ${m(ex.net.perPayment)} en cada nómina ordinaria y ${m(ex.net.extraPayment ?? 0)} en cada paga extra.`,
    ],
    ca: [
      `Seguretat Social. Base de cotització: el brut entre 12 (les pagues extra es prorratgen), ${m(ex.ss.baseMonthly)} al mes, amb un màxim de ${m(SOCIAL_SECURITY.maxBaseMonthly)}. La teva part és el ${pc(rateOpen)} amb contracte indefinit (${pc(rateFixed)} si és temporal): ${m(ex.ss.monthly)} al mes, ${m(ex.ss.annual)} l'any.`,
      `Rendiment net: ${m(ex.input.gross)} menys les cotitzacions, ${m(i.netIncome)}. Es resten ${m(IRPF.otherExpenses, 0)} de despeses generals i la reducció per rendiments del treball (${m(i.workReduction)} en aquest cas: només existeix per sota de ${m(IRPF.workReduction.thirdTo)} de rendiment). Queda la base de retenció: ${m(i.base)}.`,
      `Quota: s'aplica l'escala de retenció a la base (${m(i.cuota1)}) i es resta la mateixa escala aplicada al mínim personal i familiar, ${m(i.minimum)} (${m(i.cuota2)}). Resultat: ${m(i.cuota)}.`,
      `Tipus de retenció: la quota entre el brut, ${pc(i.rate)}, truncat a dos decimals. És el que la teva empresa aplica a cada nòmina: ${m(i.annual)} l'any.`,
      `Net: ${m(ex.input.gross)} − ${m(ex.ss.annual)} − ${m(i.annual)} = ${m(ex.net.annual)} l'any. En 14 pagues, ${m(ex.net.perPayment)} a cada nòmina ordinària i ${m(ex.net.extraPayment ?? 0)} a cada paga extra.`,
    ],
    en: [
      `Social Security. Contribution base: gross pay divided by 12 (extra payments are spread over the year), ${m(ex.ss.baseMonthly)} a month, capped at ${m(SOCIAL_SECURITY.maxBaseMonthly)}. Your share is ${pc(rateOpen)} on an open-ended contract (${pc(rateFixed)} fixed-term): ${m(ex.ss.monthly)} a month, ${m(ex.ss.annual)} a year.`,
      `Net earnings: ${m(ex.input.gross)} minus contributions, ${m(i.netIncome)}. Then ${m(IRPF.otherExpenses, 0)} of general expenses and the earned-income reduction come off (${m(i.workReduction)} here: it only exists below ${m(IRPF.workReduction.thirdTo)} of net earnings). That leaves the withholding base: ${m(i.base)}.`,
      `Tax due: the withholding scale on the base (${m(i.cuota1)}) minus the same scale on the personal and family allowance, ${m(i.minimum)} (${m(i.cuota2)}). Result: ${m(i.cuota)}.`,
      `Withholding rate: tax due divided by gross pay, ${pc(i.rate)}, cut to two decimals. Your employer applies it to every payslip: ${m(i.annual)} a year.`,
      `Net: ${m(ex.input.gross)} − ${m(ex.ss.annual)} − ${m(i.annual)} = ${m(ex.net.annual)} a year. In 14 payments, ${m(ex.net.perPayment)} in each ordinary payslip and ${m(ex.net.extraPayment ?? 0)} in each extra one.`,
    ],
  });
  const howNotes = L(locale, {
    es: `Además: no hay retención por debajo de un mínimo que depende de la familia (${m(IRPF.exemptUpTo[3][0], 0)} para un soltero sin hijos); hasta ${m(IRPF.limitPayUpTo, 0)} la retención no puede pasar del 43 % de lo que supera ese mínimo; con contrato de menos de un año es al menos del ${pc(IRPF.minRateShortContract)}; en Ceuta, Melilla y, desde el 10 de septiembre de ${Y}, la isla de La Palma, la cuota se reduce un 60 %.`,
    ca: `A més: no hi ha retenció per sota d'un mínim que depèn de la família (${m(IRPF.exemptUpTo[3][0], 0)} per a un solter sense fills); fins a ${m(IRPF.limitPayUpTo, 0)} la retenció no pot superar el 43 % del que excedeix aquest mínim; amb contracte de menys d'un any és com a mínim del ${pc(IRPF.minRateShortContract)}; a Ceuta, Melilla i, des del 10 de setembre de ${Y}, l'illa de La Palma, la quota es redueix un 60 %.`,
    en: `Also: there is no withholding below a minimum that depends on your family (${m(IRPF.exemptUpTo[3][0], 0)} for a single person without children); up to ${m(IRPF.limitPayUpTo, 0)}, withholding cannot exceed 43% of the pay above that minimum; on a contract under one year it is at least ${pc(IRPF.minRateShortContract)}; in Ceuta, Melilla and, from 10 September ${Y}, the island of La Palma, tax due is cut by 60%.`,
  });

  const regionsText = L(locale, {
    es: [
      `En las ${common} comunidades de régimen común la nómina es la misma: la Agencia Tributaria calcula la retención con una sola escala estatal para todas, la del artículo 101 de la Ley del IRPF. Con el mismo sueldo y la misma familia, te retienen igual en Madrid, en Cataluña o en Andalucía.`,
      "La comunidad pesa después, en la declaración de la Renta: allí se aplican la escala estatal y la autonómica de tu comunidad, más sus deducciones. Por eso, con el mismo sueldo, en unas comunidades sale a devolver y en otras a pagar. Esta calculadora no estima la Renta.",
      "Ceuta y Melilla, y la isla de La Palma desde el 10 de septiembre de 2026, tienen una retención un 60 % menor si vives y trabajas allí: la calculadora la aplica.",
      "Navarra y el País Vasco (Álava, Bizkaia y Gipuzkoa) tienen su propio IRPF, con tablas de retención forales que la calculadora no incluye. Las cotizaciones sí son las mismas en toda España.",
    ],
    ca: [
      `A les ${common} comunitats de règim comú la nòmina és la mateixa: l'Agència Tributària calcula la retenció amb una sola escala estatal per a totes, la de l'article 101 de la Llei de l'IRPF. Amb el mateix sou i la mateixa família, et retenen igual a Madrid, a Catalunya o a Andalusia.`,
      "La comunitat pesa després, a la declaració de la renda: s'hi apliquen l'escala estatal i l'autonòmica de la teva comunitat, més les seves deduccions. Per això, amb el mateix sou, a unes comunitats surt a retornar i a d'altres a pagar. Aquesta calculadora no estima la renda.",
      "Ceuta i Melilla, i l'illa de La Palma des del 10 de setembre de 2026, tenen una retenció un 60 % menor si hi vius i hi treballes: la calculadora l'aplica.",
      "Navarra i el País Basc (Àlaba, Biscaia i Guipúscoa) tenen el seu propi IRPF, amb taules de retenció forals que la calculadora no inclou. Les cotitzacions sí que són les mateixes a tot Espanya.",
    ],
    en: [
      `In the ${common} common-regime regions the payslip is the same: the Tax Agency works out withholding with one state scale for all of them, article 101 of the IRPF Law. Same salary, same family: the same withholding in Madrid, Catalonia or Andalusia.`,
      "The region comes in later, in the annual return (Renta): that is where the state scale and your region's own scale apply, plus its deductions. That is why, on the same salary, some regions end up with a refund and others with a bill. This calculator does not estimate the return.",
      "Ceuta and Melilla, and the island of La Palma from 10 September 2026, withhold 60% less if you live and work there: the calculator applies it.",
      "Navarre and the Basque Country (Álava, Biscay and Gipuzkoa) have their own income tax, with foral withholding tables the calculator does not cover. Social Security contributions are the same everywhere in Spain.",
    ],
  });

  const rateCols = L(locale, {
    es: ["Concepto", "Tu parte", "Norma"],
    ca: ["Concepte", "La teva part", "Norma"],
    en: ["Item", "Your share", "Rule"],
  });
  const S = SOCIAL_SECURITY;
  const art = (n: string) => L(locale, { es: `Orden PJC/297/2026, art. ${n}`, ca: `Ordre PJC/297/2026, art. ${n}`, en: `Orden PJC/297/2026, art. ${n}` });
  const rateRows: [string, string, string][] = [
    [L(locale, { es: "Contingencias comunes", ca: "Contingències comunes", en: "Common contingencies" }), pc(S.rates.commonContingencies), art("4")],
    [L(locale, { es: "Desempleo, contrato indefinido", ca: "Atur, contracte indefinit", en: "Unemployment, open-ended contract" }), pc(S.rates.unemploymentOpenEnded), art("33")],
    [L(locale, { es: "Desempleo, contrato temporal", ca: "Atur, contracte temporal", en: "Unemployment, fixed-term contract" }), pc(S.rates.unemploymentFixedTerm), art("33")],
    [L(locale, { es: "Formación profesional", ca: "Formació professional", en: "Vocational training" }), pc(S.rates.vocationalTraining), art("33")],
    [L(locale, { es: "Mecanismo de equidad intergeneracional (MEI)", ca: "Mecanisme d'equitat intergeneracional (MEI)", en: "Intergenerational equity mechanism (MEI)" }), pc(S.rates.intergenerationalEquity), art("16")],
    [
      L(locale, { es: "Solidaridad, sobre lo que supera la base máxima", ca: "Solidaritat, sobre el que supera la base màxima", en: "Solidarity, on pay above the maximum base" }),
      S.solidarity.map(([, r]) => pc(r)).join(" / "),
      art("17"),
    ],
  ];
  const ratesLead = L(locale, {
    es: `Base máxima de cotización: ${m(S.maxBaseMonthly)} al mes (${m(maxAnnual)} al año); por encima, cada euro solo paga la cotización de solidaridad. Base mínima a jornada completa: ${m(S.minBaseMonthly)} al mes (grupos 4 a 11; más alta en los grupos 1 a 3).`,
    ca: `Base màxima de cotització: ${m(S.maxBaseMonthly)} al mes (${m(maxAnnual)} l'any); per sobre, cada euro només paga la cotització de solidaritat. Base mínima a jornada completa: ${m(S.minBaseMonthly)} al mes (grups 4 a 11; més alta als grups 1 a 3).`,
    en: `Maximum contribution base: ${m(S.maxBaseMonthly)} a month (${m(maxAnnual)} a year); above it, each euro only pays the solidarity contribution. Full-time minimum base: ${m(S.minBaseMonthly)} a month (groups 4 to 11; higher in groups 1 to 3).`,
  });
  const scaleCols = L(locale, {
    es: ["Base desde", "Cuota hasta ese punto", "Tipo del tramo"],
    ca: ["Base des de", "Quota fins a aquest punt", "Tipus del tram"],
    en: ["Base from", "Tax up to that point", "Band rate"],
  });

  const faq = L(locale, {
    es: [
      { q: "¿Cobro lo mismo al año en 12 que en 14 pagas?", a: `Sí. El bruto y el neto anual son los mismos; en 14 pagas se reparte en 12 nóminas y dos pagas extra, y como la Seguridad Social se cotiza cada mes con las extras prorrateadas, las pagas extra no llevan cotización. Con ${m(ex.input.gross, 0)}: ${m(ex.net.perPayment)} al mes y ${m(ex.net.extraPayment ?? 0)} en cada extra, o ${m(ex.net.monthlyAverage)} en 12 pagas.` },
      { q: "¿La retención es lo que pago de IRPF?", a: "No: es un pago a cuenta. El impuesto final se calcula en la declaración de la Renta, con la escala de tu comunidad, tus deducciones y el resto de ingresos del año. Si te retuvieron más de lo que toca, Hacienda te devuelve la diferencia; si fue menos, pagas." },
      { q: "¿Por qué mi nómina no coincide con la calculadora?", a: "Lo habitual: pluses, horas extra o retribución en especie que no son parte del bruto que has puesto; una regularización del tipo a mitad de año (cambio de sueldo o de familia); datos del modelo 145 distintos de los que has marcado; o un tipo más alto pedido por escrito a la empresa, que se puede solicitar." },
      { q: "¿Cambia algo si vivo en Madrid o en Cataluña?", a: regionsText[0]! },
      { q: "¿Qué es el MEI que aparece en la nómina?", a: `El mecanismo de equidad intergeneracional, una cotización adicional para el fondo de reserva de las pensiones: en ${Y} es el ${pc(S.rates.intergenerationalEquityTotal)} de la base, del que tú pagas el ${pc(S.rates.intergenerationalEquity)} y la empresa el resto (Orden PJC/297/2026, art. 16).` },
    ],
    ca: [
      { q: "Cobro el mateix l'any en 12 que en 14 pagues?", a: `Sí. El brut i el net anual són els mateixos; en 14 pagues es reparteix en 12 nòmines i dues pagues extra, i com que la Seguretat Social es cotitza cada mes amb les extres prorratejades, les pagues extra no porten cotització. Amb ${m(ex.input.gross, 0)}: ${m(ex.net.perPayment)} al mes i ${m(ex.net.extraPayment ?? 0)} a cada extra, o ${m(ex.net.monthlyAverage)} en 12 pagues.` },
      { q: "La retenció és el que pago d'IRPF?", a: "No: és un pagament a compte. L'impost final es calcula a la declaració de la renda, amb l'escala de la teva comunitat, les teves deduccions i la resta d'ingressos de l'any. Si t'han retingut més del que toca, Hisenda et retorna la diferència; si ha estat menys, pagues." },
      { q: "Per què la meva nòmina no coincideix amb la calculadora?", a: "El més habitual: plusos, hores extra o retribució en espècie que no formen part del brut que has posat; una regularització del tipus a mitjan any (canvi de sou o de família); dades del model 145 diferents de les que has marcat; o un tipus més alt demanat per escrit a l'empresa, que es pot sol·licitar." },
      { q: "Canvia res si visc a Madrid o a Catalunya?", a: regionsText[0]! },
      { q: "Què és l'MEI que surt a la nòmina?", a: `El mecanisme d'equitat intergeneracional, una cotització addicional per al fons de reserva de les pensions: el ${Y} és el ${pc(S.rates.intergenerationalEquityTotal)} de la base, del qual tu pagues el ${pc(S.rates.intergenerationalEquity)} i l'empresa la resta (Ordre PJC/297/2026, art. 16).` },
    ],
    en: [
      { q: "Do I earn the same in a year on 12 or 14 payments?", a: `Yes. Gross and net annual pay are the same; 14 payments split it into 12 payslips and two extra payments, and since Social Security is paid monthly with the extras spread over the year, the extra payments carry no contributions. On ${m(ex.input.gross, 0)}: ${m(ex.net.perPayment)} a month and ${m(ex.net.extraPayment ?? 0)} in each extra, or ${m(ex.net.monthlyAverage)} on 12 payments.` },
      { q: "Is withholding the income tax I pay?", a: "No: it is a payment on account. The final tax is worked out in the annual return (Renta), with your region's scale, your deductions and the rest of the year's income. If more was withheld than you owe, the Tax Agency refunds the difference; if less, you pay it." },
      { q: "Why does my payslip differ from the calculator?", a: "Usually: bonuses, overtime or benefits in kind that are not in the gross you entered; a mid-year rate adjustment (a pay or family change); form 145 details that differ from what you ticked; or a higher rate you asked your employer for in writing, which you are allowed to do." },
      { q: "Does it matter whether I live in Madrid or Catalonia?", a: regionsText[0]! },
      { q: "What is the MEI on my payslip?", a: `The intergenerational equity mechanism, an extra contribution to the pensions reserve fund: in ${Y} it is ${pc(S.rates.intergenerationalEquityTotal)} of the base, of which you pay ${pc(S.rates.intergenerationalEquity)} and your employer the rest (Orden PJC/297/2026, art. 16).` },
    ],
  });

  const sourcesLead = L(locale, {
    es: `Fuentes oficiales, leídas el ${asOf}. Comprobación: el ${validated} enviamos ${AEAT_VALIDATION.cases} casos distintos (sueldos de 12.000 a 350.000 €, las tres situaciones familiares, hijos, edad, discapacidad, contratos temporales, Ceuta, Melilla y La Palma, movilidad, hipoteca) al servicio de cálculo de retenciones de la Agencia Tributaria: el tipo y el importe de la retención coinciden en todos.`,
    ca: `Fonts oficials, llegides el ${asOf}. Comprovació: el ${validated} vam enviar ${AEAT_VALIDATION.cases} casos diferents (sous de 12.000 a 350.000 €, les tres situacions familiars, fills, edat, discapacitat, contractes temporals, Ceuta, Melilla i La Palma, mobilitat, hipoteca) al servei de càlcul de retencions de l'Agència Tributària: el tipus i l'import de la retenció coincideixen en tots.`,
    en: `Official sources, read on ${asOf}. Check: on ${validated} we sent ${AEAT_VALIDATION.cases} different cases (salaries from €12,000 to €350,000, all three family situations, children, age, disability, fixed-term contracts, Ceuta, Melilla and La Palma, mobility, mortgage) to the Tax Agency's withholding calculation service: the rate and the amount withheld match in every one.`,
  });
  const sourceList = [SOURCES.algorithm, SOURCES.algorithmJanuary, SOURCES.contributions, SOURCES.laPalma];
  const sourceNote = L(locale, {
    es: `La Agencia Tributaria publicó en ${Y} dos versiones del algoritmo: la del 10 de septiembre solo añade la isla de La Palma (Real Decreto-ley 23/2026). Para el resto de España las cifras son las mismas todo el año.`,
    ca: `L'Agència Tributària va publicar el ${Y} dues versions de l'algoritme: la del 10 de setembre només hi afegeix l'illa de La Palma (Reial decret llei 23/2026). Per a la resta d'Espanya les xifres són les mateixes tot l'any.`,
    en: `The Tax Agency published two versions of the ${Y} algorithm: the 10 September one only adds the island of La Palma (Royal Decree-law 23/2026). For the rest of Spain the figures are the same all year.`,
  });
  const limits = L(locale, {
    es: [
      "Navarra y el País Vasco (tablas forales).",
      "Ascendientes a cargo, hijos con discapacidad e hijos de 25 años o más.",
      "Rendimientos irregulares, atrasos, pensión compensatoria y anualidades por alimentos.",
      "Regularizaciones a mitad de año, varios pagadores, pensionistas y relaciones laborales especiales.",
      "La declaración de la Renta: escalas y deducciones autonómicas.",
    ],
    ca: [
      "Navarra i el País Basc (taules forals).",
      "Ascendents a càrrec, fills amb discapacitat i fills de 25 anys o més.",
      "Rendiments irregulars, endarreriments, pensió compensatòria i anualitats per aliments.",
      "Regularitzacions a mitjan any, diversos pagadors, pensionistes i relacions laborals especials.",
      "La declaració de la renda: escales i deduccions autonòmiques.",
    ],
    en: [
      "Navarre and the Basque Country (foral tables).",
      "Dependent parents, children with a disability and children aged 25 or over.",
      "Irregular income, back pay, compensatory and child maintenance payments.",
      "Mid-year adjustments, several payers, pensioners and special employment relations.",
      "The annual return: regional scales and deductions.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(netSalaryPath(locale)),
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

  return (
    <>
      <SiteHeader locale={locale} translations={netSalaryEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <NetSalaryCalculator locale={locale} initial={DEFAULT_INPUT} />

              <h2 id="tabla">{h.table}</h2>
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
                    {rows.map(({ gross, r14, r12 }) => (
                      <tr key={gross}>
                        <th scope="row" className="font-normal">
                          {m(gross, 0)}
                        </th>
                        <td data-label={cols[1]}>{m(r14.net.perPayment)}</td>
                        <td data-label={cols[2]}>{m(r12.net.perPayment)}</td>
                        <td data-label={cols[3]}>{m(r14.net.annual)}</td>
                        <td data-label={cols[4]}>
                          {m(r14.irpf.annual)} ({pc(r14.irpf.rate)})
                        </td>
                        <td data-label={cols[5]}>{m(r14.ss.annual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="calculo">{h.how}</h2>
              <ol>
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p>{howNotes}</p>

              <h2 id="comunidades">{h.regions}</h2>
              {regionsText.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <ul>
                {[...FORAL_LINKS.navarra, ...FORAL_LINKS["pais-vasco"]].map((l) => (
                  <li key={l.url}>
                    <a href={l.url} rel="noopener" target="_blank">
                      {l.name}
                    </a>
                  </li>
                ))}
              </ul>

              <h2 id="tipos">{h.rates}</h2>
              <p>{ratesLead}</p>
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
              <div className="ci-table-scroll mt-6">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                    {L(locale, { es: `Escala de retención ${Y} (algoritmo de la AEAT, tabla 2)`, ca: `Escala de retenció ${Y} (algoritme de l'AEAT, taula 2)`, en: `${Y} withholding scale (AEAT algorithm, table 2)` })}
                  </caption>
                  <thead>
                    <tr>
                      {scaleCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {IRPF.scale.map(([from, , rate]) => (
                      <tr key={from}>
                        <th scope="row" className="font-normal">
                          {m(from)}
                        </th>
                        <td data-label={scaleCols[1]}>{m(scale(from))}</td>
                        <td data-label={scaleCols[2]}>{pc(rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="preguntas">{h.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

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
              <p>{sourceNote}</p>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>

              <MoreCalculators current="net-salary" locale={locale} />
            </div>
            <ShareBar locale={locale} path={netSalaryPath(locale)} title={meta.h1} contentType="net_salary_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/** For the tests: the default example the page's lead is written from. */
export function defaultExample(): SalaryResult {
  return calculateNetSalary(DEFAULT_INPUT);
}
