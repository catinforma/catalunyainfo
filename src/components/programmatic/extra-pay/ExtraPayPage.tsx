import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { EXTRA_META, extraPayEditions, extraPayPath, type EpLocale } from "@/lib/programmatic/extra-pay/copy";
import { DEFAULT_INPUT, EXAMPLE_START, pageExamples } from "@/lib/programmatic/extra-pay/engine";
import { EXTRA_PAY_RULES_AS_OF, EXTRA_PAY_YEAR, OFFICIAL_LINKS, QUOTE, SOURCES } from "@/lib/programmatic/extra-pay/rules";
import { LEY33_URL, whenBox, whenFaq } from "@/lib/programmatic/extra-pay/when";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { money, netSalaryPath, percent } from "@/lib/programmatic/net-salary/copy";
import { REGIONS, regionById } from "@/lib/programmatic/net-salary/regions";
import { SOCIAL_SECURITY, SOURCES as SALARY_SOURCES } from "@/lib/programmatic/net-salary/rules-2026";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { ExtraPayCalculator } from "./ExtraPayCalculator";

/**
 * "Paga extra de Navidad 2026" / "Paga extra de Nadal 2026" / "Spain
 * Christmas extra pay 2026": the answer (server-rendered with the default
 * example), the calculator, then when it is paid, how much, prorated or
 * not, the part earned by a new hire, why no Social Security comes off,
 * the IRPF withholding, worked examples, questions, sources and limits.
 * Every figure is computed at build time by extra-pay/engine.ts, which
 * reuses the net salary engine (AEAT 2026 algorithm, Orden PJC/297/2026).
 */

const L = <T,>(locale: EpLocale, v: Record<EpLocale, T>): T => v[locale];
const Y = EXTRA_PAY_YEAR;

export function extraPayCrumbs(locale: EpLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: EXTRA_META[locale].breadcrumb, href: extraPayPath(locale) },
  ];
}

export function extraPayMetadata(locale: EpLocale): Metadata {
  const m = EXTRA_META[locale];
  return buildMetadata({ locale, path: extraPayPath(locale), title: m.title, description: m.description, translations: extraPayEditions() });
}

function Quote({ text, cite, href }: { text: string; cite: string; href: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <a href={href} rel="noopener" target="_blank">
          {cite}
        </a>
      </footer>
    </blockquote>
  );
}

export function ExtraPayRoute({ locale }: { locale: EpLocale }) {
  const meta = EXTRA_META[locale];
  const crumbs = extraPayCrumbs(locale);
  const { base: ex, hireAnnual, hireSemester, prorated } = pageExamples();
  const m = (v: number | null, d: 0 | 2 = 2) => (v === null ? "—" : money(v, locale, d));
  const pc = (v: number | null) => (v === null ? "—" : percent(v, locale));
  const asOf = dayMonthYear(EXTRA_PAY_RULES_AS_OF, locale);
  const exRegion = regionById(DEFAULT_INPUT.region)!.names[locale];
  const common = REGIONS.filter((r) => r.regime === "common").length;
  const startWords = dayMonthYear(EXAMPLE_START, locale);
  // Catalan puts the article before the day: "l'1 de setembre", "el 17 de novembre".
  const caStart = `${caDayArticle(EXAMPLE_START)}${startWords}`;
  const caAsOf = `${caDayArticle(EXTRA_PAY_RULES_AS_OF)}${asOf}`;
  const share = prorated.monthlyShare!;
  const shareIrpf = Math.round((share.gross - (share.net ?? 0)) * 100) / 100;
  const net = netSalaryPath(locale);
  const settlement = calcPath("settlement", locale);
  const payDates = PAY_DATES_PATH[locale];
  const maxBase = SOCIAL_SECURITY.maxBaseMonthly;

  const lead = L(locale, {
    es: `Con ${m(ex.annualGross, 0)} brutos al año en 14 pagas, la paga extra de Navidad de ${Y} es de ${m(ex.gross)} brutos y te quedan ${m(ex.net)} netos: se retiene el mismo IRPF que en tus nóminas (${pc(ex.rate)} si eres soltero y sin hijos, ${m(ex.irpf)}) y ese mes no se descuenta Seguridad Social, porque ya se cotiza prorrateada cada mes. Cuándo se cobra lo fija tu convenio: la ley solo dice «con ocasión de las fiestas de Navidad». Cambia los datos para tu caso.`,
    ca: `Amb ${m(ex.annualGross, 0)} bruts l'any en 14 pagues, la paga extra de Nadal del ${Y} és de ${m(ex.gross)} bruts i et queden ${m(ex.net)} nets: es reté el mateix IRPF que a les teves nòmines (${pc(ex.rate)} si ets solter i sense fills, ${m(ex.irpf)}) i aquell mes no es descompta Seguretat Social, perquè ja es cotitza prorratejada cada mes. Quan es cobra ho fixa el teu conveni: la llei només diu que és amb ocasió de les festes de Nadal. Canvia les dades per al teu cas.`,
    en: `On ${m(ex.annualGross, 0)} gross a year in 14 payments, the ${Y} Christmas extra pay is ${m(ex.gross)} gross and you keep ${m(ex.net)} net: the same IRPF rate as your payslips is withheld (${pc(ex.rate)} if single with no children, ${m(ex.irpf)}) and no Social Security comes off that month, because it is already paid, prorated, every month. When it is paid is up to your collective agreement: the law only says it comes at Christmas. Change the figures for your own case.`,
  });

  const h = L(locale, {
    es: { when: "¿Cuándo se cobra la paga extra de Navidad?", amount: "¿Cuánto es la paga extra?", prorated: "Paga extra prorrateada o en diciembre", hire: "Si empezaste este año: la parte proporcional", ss: "¿Por qué no se descuenta Seguridad Social en la paga extra?", irpf: "La retención de IRPF en la paga extra", examples: "Ejemplos", faq: "Preguntas frecuentes", sources: "Fuentes y herramientas oficiales", limits: "Qué no incluye" },
    ca: { when: "Quan es cobra la paga extra de Nadal?", amount: "Quant és la paga extra?", prorated: "Paga extra prorratejada o al desembre", hire: "Si vas començar aquest any: la part proporcional", ss: "Per què no es descompta Seguretat Social a la paga extra?", irpf: "La retenció d'IRPF a la paga extra", examples: "Exemples", faq: "Preguntes freqüents", sources: "Fonts i eines oficials", limits: "Què no inclou" },
    en: { when: "When is the Christmas extra pay paid?", amount: "How much is the extra pay?", prorated: "Prorated extra pay or a December payment", hire: "If you started this year: the part you have earned", ss: "Why is no Social Security deducted from the extra pay?", irpf: "IRPF withholding on the extra pay", examples: "Worked examples", faq: "Questions", sources: "Sources and official tools", limits: "What it leaves out" },
  });

  const when = L(locale, {
    es: [
      "El Estatuto de los Trabajadores da derecho a dos pagas extra al año y deja casi todo lo demás al convenio colectivo:",
      "La ley no pone día. El artículo 29.1 añade que el salario se paga «en la fecha y lugar convenidos o conforme a los usos y costumbres»: el día exacto de la paga de Navidad, su importe y su periodo de devengo están en tu convenio o en tu contrato. Puedes buscar tu convenio en el",
      "Si cobras una pensión contributiva de la Seguridad Social, la paga extra de final de año no es la de diciembre: se devenga en noviembre.",
    ],
    ca: [
      "L'Estatut dels Treballadors dona dret a dues pagues extra l'any i deixa gairebé tota la resta al conveni col·lectiu (text oficial en castellà):",
      "La llei no fixa cap dia. L'article 29.1 hi afegeix que el salari es paga en la data i el lloc convinguts o segons els usos i costums: el dia exacte de la paga de Nadal, l'import i el període de meritació són al teu conveni o al teu contracte. Pots buscar el teu conveni al",
      "Si cobres una pensió contributiva de la Seguretat Social, la paga extra de final d'any no és la de desembre: es merita al novembre.",
    ],
    en: [
      "The Workers' Statute (Estatuto de los Trabajadores) gives employees two extra payments a year, one of them at Christmas, and leaves almost everything else to the collective agreement (official text in Spanish):",
      "The law sets no day. Article 29.1 adds that pay is due on the date and at the place agreed, or as custom has it: the exact day of the Christmas payment, its amount and its accrual period are in your collective agreement or your contract. You can look your agreement up in the",
      "If you draw a contributory Social Security pension, your end-of-year extra payment is not December's: it accrues in November.",
    ],
  });
  const whenLinks = L(locale, {
    es: { inline: "registro oficial de convenios colectivos (REGCON) del Ministerio de Trabajo", regcon: "Registro de convenios colectivos (REGCON), Ministerio de Trabajo", payDates: "Cuándo se cobran la pensión y sus pagas extra" },
    ca: { inline: "registre oficial de convenis col·lectius (REGCON) del Ministeri de Treball", regcon: "Registre de convenis col·lectius (REGCON), Ministeri de Treball", payDates: "Quan es cobren la pensió i les pagues extra" },
    en: { inline: "Ministry of Labour's official register of collective agreements (REGCON)", regcon: "Register of collective agreements (REGCON), Ministry of Labour", payDates: "When pensions and their extra payments arrive" },
  });

  const amount = L(locale, {
    es: `Lo que diga tu convenio: el artículo 31 deja la cuantía al convenio colectivo. La calculadora pone una mensualidad, tu bruto mensual o, si das el anual, el anual entre 14 (${m(ex.annualGross, 0)} ÷ 14 = ${m(ex.full)}), lo mismo que la calculadora de sueldo neto. Si tu convenio fija otra cifra, por ejemplo solo el salario base, escríbela en «Importe de la paga según tu convenio».`,
    ca: `El que digui el teu conveni: l'article 31 deixa la quantia al conveni col·lectiu. La calculadora posa una mensualitat, el teu brut mensual o, si dones l'anual, l'anual entre 14 (${m(ex.annualGross, 0)} ÷ 14 = ${m(ex.full)}), el mateix que la calculadora de sou net. Si el teu conveni fixa una altra xifra, per exemple només el salari base, escriu-la a «Import de la paga segons el teu conveni».`,
    en: `Whatever your collective agreement says: article 31 leaves the amount to it. The calculator assumes one month's pay, your gross monthly salary or, if you give the annual figure, the annual divided by 14 (${m(ex.annualGross, 0)} ÷ 14 = ${m(ex.full)}), as the net salary calculator does. If your agreement sets another figure, base salary only for example, enter it under "Amount set by your collective agreement".`,
  });

  const proratedText = L(locale, {
    es: `El mismo artículo 31 permite que el convenio reparta las pagas extra en las doce nóminas. Entonces no hay paga aparte en diciembre: cada nómina lleva la doceava parte de cada extra. Con ${m(ex.annualGross, 0)} al año, ${m(share.gross)} brutos al mes de la paga de Navidad (${m(share.net)} tras la retención). Al año cobras lo mismo en 12 que en 14 pagas: cambia cuándo llega el dinero, no cuánto.`,
    ca: `El mateix article 31 permet que el conveni reparteixi les pagues extra en les dotze nòmines. Llavors no hi ha paga a part al desembre: cada nòmina porta la dotzena part de cada extra. Amb ${m(ex.annualGross, 0)} l'any, ${m(share.gross)} bruts al mes de la paga de Nadal (${m(share.net)} després de la retenció). A l'any cobres el mateix en 12 que en 14 pagues: canvia quan arriben els diners, no quants.`,
    en: `The same article 31 lets the collective agreement spread the extra payments over the twelve monthly payslips. Then there is no separate December payment: each payslip carries one twelfth of each extra. On ${m(ex.annualGross, 0)} a year, ${m(share.gross)} gross a month of the Christmas pay (${m(share.net)} after withholding). Over the year you earn the same on 12 or 14 payments: what changes is when the money arrives, not how much.`,
  });

  const hireText = L(locale, {
    es: [
      `La paga se gana a lo largo de un periodo de devengo que fija el convenio: el año natural (del 1 de enero al 31 de diciembre) o el segundo semestre (del 1 de julio al 31 de diciembre). Si entraste durante ese periodo, te toca la parte proporcional a los días trabajados. Ejemplo: alta el ${startWords} con ${m(ex.annualGross, 0)} al año.`,
      `Con devengo anual cuentan ${hireAnnual.accrued.days} de ${hireAnnual.period.days} días: ${m(hireAnnual.gross)} brutos, ${m(hireAnnual.net)} netos. Con devengo semestral, ${hireSemester.accrued.days} de ${hireSemester.period.days}: ${m(hireSemester.gross)} brutos, ${m(hireSemester.net)} netos. La calculadora cuenta días naturales, como la de finiquito; tu convenio puede contar por meses o descontar algunas ausencias.`,
      "Si dejas la empresa antes de cobrarla, la parte devengada va en el finiquito:",
    ],
    ca: [
      `La paga es guanya al llarg d'un període de meritació que fixa el conveni: l'any natural (de l'1 de gener al 31 de desembre) o el segon semestre (de l'1 de juliol al 31 de desembre). Si vas entrar durant aquest període, et toca la part proporcional als dies treballats. Exemple: alta ${caStart} amb ${m(ex.annualGross, 0)} l'any.`,
      `Amb meritació anual compten ${hireAnnual.accrued.days} de ${hireAnnual.period.days} dies: ${m(hireAnnual.gross)} bruts, ${m(hireAnnual.net)} nets. Amb meritació semestral, ${hireSemester.accrued.days} de ${hireSemester.period.days}: ${m(hireSemester.gross)} bruts, ${m(hireSemester.net)} nets. La calculadora compta dies naturals, com la de quitança; el teu conveni pot comptar per mesos o descomptar algunes absències.`,
      "Si deixes l'empresa abans de cobrar-la, la part meritada va a la quitança:",
    ],
    en: [
      `The payment is earned over an accrual period set by the collective agreement: the calendar year (1 January to 31 December) or the second half (1 July to 31 December). If you joined during that period, you are owed the part for the days you worked. Example: joined on ${startWords} on ${m(ex.annualGross, 0)} a year.`,
      `With yearly accrual ${hireAnnual.accrued.days} of ${hireAnnual.period.days} days count: ${m(hireAnnual.gross)} gross, ${m(hireAnnual.net)} net. With half-yearly accrual, ${hireSemester.accrued.days} of ${hireSemester.period.days}: ${m(hireSemester.gross)} gross, ${m(hireSemester.net)} net. The calculator counts calendar days, like the final settlement calculator; your agreement may count months instead, or leave some absences out.`,
      "If you leave before it is paid, the part earned goes into your final settlement (finiquito):",
    ],
  });
  const settlementLabel = L(locale, { es: "Calculadora de finiquito", ca: "Calculadora de quitança", en: "Final settlement calculator" });

  const ssText = L(locale, {
    es: [
      "Porque ya la has cotizado. La Ley General de la Seguridad Social reparte en la base de cada mes lo que se cobra con menos frecuencia, y la orden de cotización de 2026 lo concreta para las pagas extra:",
      `En la práctica, cada mes cotizas por tu sueldo más la doceava parte de las dos extras: con ${m(ex.annualGross, 0)} al año, una base de ${m(ex.ss.baseMonthly)} al mes (${m(ex.annualGross, 0)} ÷ 12), aunque tu nómina ordinaria sea de ${m(ex.ordinaryMonthly)}. Por la paga de Navidad pagas el ${pc(ex.ss.workerRate)} de ${m(ex.gross)} (${m(ex.ss.alreadyPaid)} al año), repartido en las nóminas, y en el mes de la paga no se cotiza más. Por encima de la base máxima, ${m(maxBase)} al mes, solo se paga la cotización de solidaridad. Si la paga acaba siendo distinta de la prevista, la empresa hace una liquidación complementaria (Orden PJC/297/2026, art. 29.2).`,
    ],
    ca: [
      "Perquè ja l'has cotitzada. La Llei general de la Seguretat Social reparteix a la base de cada mes el que es cobra amb menys freqüència, i l'ordre de cotització del 2026 ho concreta per a les pagues extra (textos oficials en castellà):",
      `A la pràctica, cada mes cotitzes pel teu sou més la dotzena part de les dues extres: amb ${m(ex.annualGross, 0)} l'any, una base de ${m(ex.ss.baseMonthly)} al mes (${m(ex.annualGross, 0)} ÷ 12), encara que la teva nòmina ordinària sigui de ${m(ex.ordinaryMonthly)}. Per la paga de Nadal pagues el ${pc(ex.ss.workerRate)} de ${m(ex.gross)} (${m(ex.ss.alreadyPaid)} l'any), repartit a les nòmines, i al mes de la paga no es cotitza més. Per sobre de la base màxima, ${m(maxBase)} al mes, només es paga la cotització de solidaritat. Si la paga acaba sent diferent de la prevista, l'empresa fa una liquidació complementària (Ordre PJC/297/2026, art. 29.2).`,
    ],
    en: [
      "Because you have already paid it. The General Social Security Act spreads anything paid less often than monthly over each month's contribution base, and the 2026 contributions order spells it out for extra payments (official texts in Spanish):",
      `In practice, each month you contribute on your salary plus one twelfth of the two extras: on ${m(ex.annualGross, 0)} a year, a base of ${m(ex.ss.baseMonthly)} a month (${m(ex.annualGross, 0)} ÷ 12), even though your ordinary payslip is ${m(ex.ordinaryMonthly)}. On the Christmas payment you pay ${pc(ex.ss.workerRate)} of ${m(ex.gross)} (${m(ex.ss.alreadyPaid)} a year), spread over your payslips, and nothing more in the month it is paid. Above the maximum base, ${m(maxBase)} a month, only the solidarity contribution applies. If the payment turns out different from the forecast, the employer files a complementary settlement (Orden PJC/297/2026, art. 29.2).`,
    ],
  });

  const irpfText = L(locale, {
    es: [
      "El tipo de retención se calcula sobre todo lo que vas a cobrar en el año, pagas extra incluidas, y se aplica igual a cada nómina y a cada paga extra:",
      `Por eso la paga extra lleva el mismo tipo que tus nóminas: con ${m(ex.annualGross, 0)}, soltero y sin hijos, el ${pc(ex.rate)} (en cualquiera de las ${common} comunidades de régimen común; Navarra y el País Vasco tienen tablas forales). Si en diciembre ves otro tipo, es una regularización del artículo 87 del Reglamento: un cambio de sueldo, un hijo más, el fin de un contrato temporal. La calculadora estima el tipo con el algoritmo de la Agencia Tributaria de ${Y}, el mismo de la calculadora de sueldo neto, o usa el de tu nómina.`,
    ],
    ca: [
      "El tipus de retenció es calcula sobre tot el que cobraràs durant l'any, pagues extra incloses, i s'aplica igual a cada nòmina i a cada paga extra (Reglament de l'IRPF, text oficial en castellà):",
      `Per això la paga extra porta el mateix tipus que les teves nòmines: amb ${m(ex.annualGross, 0)}, solter i sense fills, el ${pc(ex.rate)} (a qualsevol de les ${common} comunitats de règim comú; Navarra i el País Basc tenen taules forals). Si al desembre veus un altre tipus, és una regularització de l'article 87 del Reglament: un canvi de sou, un fill més, la fi d'un contracte temporal. La calculadora estima el tipus amb l'algoritme de l'Agència Tributària del ${Y}, el mateix de la calculadora de sou net, o fa servir el de la teva nòmina.`,
    ],
    en: [
      "The withholding rate is worked out on everything you will earn in the year, extra payments included, and applied in the same way to every payslip and every extra payment (IRPF Regulation, official text in Spanish):",
      `So the extra payment carries the same rate as your payslips: on ${m(ex.annualGross, 0)}, single, no children, ${pc(ex.rate)} (in any of the ${common} common-regime regions; Navarre and the Basque Country have foral tables). If December shows a different rate, it is an adjustment under article 87 of the Regulation: a pay change, another child, the end of a fixed-term contract. The calculator estimates the rate with the Tax Agency's ${Y} algorithm, the one in the net salary calculator, or uses the rate on your payslip.`,
    ],
  });
  const netLabel = L(locale, { es: "Calculadora de sueldo neto", ca: "Calculadora de sou net", en: "Net salary calculator" });
  const aeatLabel = L(locale, {
    es: "Servicio de cálculo de retenciones de la Agencia Tributaria",
    ca: "Servei de càlcul de retencions de l'Agència Tributària",
    en: "The Tax Agency's withholding calculator (Servicio de Cálculo de Retenciones)",
  });

  const exCols = L(locale, {
    es: ["Caso", "Bruto", "IRPF", "Neto"],
    ca: ["Cas", "Brut", "IRPF", "Net"],
    en: ["Case", "Gross", "IRPF", "Net"],
  });
  const exRows: [string, number, number | null, number | null][] = [
    [L(locale, { es: "Todo el año trabajado, 14 pagas", ca: "Tot l'any treballat, 14 pagues", en: "Whole year worked, 14 payments" }), ex.gross, ex.irpf, ex.net],
    [L(locale, { es: `Alta el ${startWords}, devengo anual`, ca: `Alta ${caStart}, meritació anual`, en: `Joined ${startWords}, yearly accrual` }), hireAnnual.gross, hireAnnual.irpf, hireAnnual.net],
    [L(locale, { es: `Alta el ${startWords}, devengo semestral`, ca: `Alta ${caStart}, meritació semestral`, en: `Joined ${startWords}, half-yearly accrual` }), hireSemester.gross, hireSemester.irpf, hireSemester.net],
    [L(locale, { es: "12 pagas prorrateadas: cada mes", ca: "12 pagues prorratejades: cada mes", en: "12 prorated payments: each month" }), share.gross, shareIrpf, share.net],
  ];
  const exCaption = L(locale, {
    es: `Paga extra de Navidad ${Y} con ${m(ex.annualGross, 0)} brutos al año; soltero, sin hijos, contrato indefinido, ${exRegion}; retención del ${pc(ex.rate)}`,
    ca: `Paga extra de Nadal ${Y} amb ${m(ex.annualGross, 0)} bruts l'any; solter, sense fills, contracte indefinit, ${exRegion}; retenció del ${pc(ex.rate)}`,
    en: `${Y} Christmas extra pay on ${m(ex.annualGross, 0)} gross a year; single, no children, open-ended contract, ${exRegion}; ${pc(ex.rate)} withholding`,
  });
  const exNote = L(locale, {
    es: "La retención es la misma en las comunidades de régimen común. En los dos casos de alta en septiembre, tu tipo real puede ser algo más bajo: la empresa lo calcula con lo que cobras en el año natural.",
    ca: "La retenció és la mateixa a les comunitats de règim comú. En els dos casos d'alta al setembre, el teu tipus real pot ser una mica més baix: l'empresa el calcula amb el que cobres durant l'any natural.",
    en: "Withholding is the same in every common-regime region. In the two September cases your real rate may be a little lower: the employer works it out on what you earn in the calendar year.",
  });

  const faq = L(locale, {
    es: [
      { q: "¿Cuánto cobraré de paga extra en diciembre?", a: `Lo que fije tu convenio, menos la retención de IRPF de tus nóminas. Si la paga es una mensualidad: con ${m(ex.annualGross, 0)} brutos al año en 14 pagas, ${m(ex.gross)} brutos y ${m(ex.net)} netos (soltero, sin hijos, retención del ${pc(ex.rate)}). Si entraste este año, solo la parte proporcional.` },
      { q: "¿Cuándo se cobra la paga extra de Navidad?", a: "El Estatuto de los Trabajadores (art. 31) solo dice que una de las dos pagas extra es «con ocasión de las fiestas de Navidad»; el día lo fija tu convenio, tu contrato o la costumbre de la empresa (art. 29.1). Si tus extras van prorrateadas, no hay paga aparte en diciembre." },
      { q: "¿La paga extra lleva Seguridad Social?", a: `No se descuenta en el mes de la paga, porque ya se cotiza cada mes: la base de cotización incluye la doceava parte de las pagas extra (Ley General de la Seguridad Social, art. 147.1). Con ${m(ex.annualGross, 0)} al año pagas ${m(ex.ss.alreadyPaid)} por la paga de Navidad, repartidos en las doce nóminas.` },
      { q: "¿Me retienen más IRPF en la paga extra?", a: "No: se aplica el mismo tipo que a tus nóminas ordinarias (Reglamento del IRPF, art. 82). Si el porcentaje cambia en diciembre, es porque la empresa ha regularizado el tipo, por ejemplo por un cambio de sueldo o de situación familiar (art. 87)." },
      { q: "Si entré a trabajar en septiembre, ¿cuánto me toca?", a: `La parte de los días trabajados en el periodo de devengo de tu convenio. Con alta el ${startWords} y ${m(ex.annualGross, 0)} al año: ${m(hireAnnual.gross)} brutos con devengo anual (${hireAnnual.accrued.days} de ${hireAnnual.period.days} días) o ${m(hireSemester.gross)} con devengo semestral (${hireSemester.accrued.days} de ${hireSemester.period.days}).` },
      { q: "¿Qué significa paga extra prorrateada?", a: `Que en lugar de cobrarla en diciembre, cada nómina lleva una doceava parte; lo permite el convenio (art. 31). Con ${m(ex.annualGross, 0)}, ${m(share.gross)} brutos al mes de la paga de Navidad. Al año cobras lo mismo.` },
      { q: "¿Los pensionistas cobran paga extra en diciembre?", a: "Las pensiones contributivas de la Seguridad Social tienen dos pagas extraordinarias que se devengan en junio y en noviembre (Ley General de la Seguridad Social, art. 46.1): la de final de año va con la pensión de noviembre. Las fechas de cobro, en nuestra guía de pagos de pensiones." },
    ],
    ca: [
      { q: "Quant cobraré de paga extra al desembre?", a: `El que fixi el teu conveni, menys la retenció d'IRPF de les teves nòmines. Si la paga és una mensualitat: amb ${m(ex.annualGross, 0)} bruts l'any en 14 pagues, ${m(ex.gross)} bruts i ${m(ex.net)} nets (solter, sense fills, retenció del ${pc(ex.rate)}). Si vas entrar aquest any, només la part proporcional.` },
      { q: "Quan es cobra la paga extra de Nadal?", a: "L'Estatut dels Treballadors (art. 31) només diu que una de les dues pagues extra és amb ocasió de les festes de Nadal; el dia el fixa el teu conveni, el teu contracte o el costum de l'empresa (art. 29.1). Si les extres van prorratejades, no hi ha paga a part al desembre." },
      { q: "La paga extra porta Seguretat Social?", a: `No es descompta al mes de la paga, perquè ja es cotitza cada mes: la base de cotització inclou la dotzena part de les pagues extra (Llei general de la Seguretat Social, art. 147.1). Amb ${m(ex.annualGross, 0)} l'any pagues ${m(ex.ss.alreadyPaid)} per la paga de Nadal, repartits a les dotze nòmines.` },
      { q: "Em retenen més IRPF a la paga extra?", a: "No: s'aplica el mateix tipus que a les nòmines ordinàries (Reglament de l'IRPF, art. 82). Si el percentatge canvia al desembre, és perquè l'empresa ha regularitzat el tipus, per exemple per un canvi de sou o de situació familiar (art. 87)." },
      { q: "Si vaig entrar a treballar al setembre, quant em toca?", a: `La part dels dies treballats en el període de meritació del teu conveni. Amb alta ${caStart} i ${m(ex.annualGross, 0)} l'any: ${m(hireAnnual.gross)} bruts amb meritació anual (${hireAnnual.accrued.days} de ${hireAnnual.period.days} dies) o ${m(hireSemester.gross)} amb meritació semestral (${hireSemester.accrued.days} de ${hireSemester.period.days}).` },
      { q: "Què vol dir paga extra prorratejada?", a: `Que en lloc de cobrar-la al desembre, cada nòmina en porta una dotzena part; ho permet el conveni (art. 31). Amb ${m(ex.annualGross, 0)}, ${m(share.gross)} bruts al mes de la paga de Nadal. A l'any cobres el mateix.` },
      { q: "Els pensionistes cobren paga extra al desembre?", a: "Les pensions contributives de la Seguretat Social tenen dues pagues extraordinàries que es meriten al juny i al novembre (Llei general de la Seguretat Social, art. 46.1): la de final d'any va amb la pensió de novembre. Les dates de cobrament, a la nostra guia de pagaments de pensions." },
    ],
    en: [
      { q: "How much will I get as extra pay in December?", a: `Whatever your collective agreement sets, minus the IRPF rate of your payslips. If the payment is one month's pay: on ${m(ex.annualGross, 0)} gross a year in 14 payments, ${m(ex.gross)} gross and ${m(ex.net)} net (single, no children, ${pc(ex.rate)} withholding). If you started this year, only the part you have earned.` },
      { q: "When is the Christmas extra pay paid in Spain?", a: "The Workers' Statute (art. 31) only says that one of the two extra payments comes at Christmas; the day is set by your collective agreement, your contract or the employer's custom (art. 29.1). If your extras are prorated, there is no separate December payment." },
      { q: "Is Social Security deducted from the extra pay?", a: `Not in the month it is paid, because it is paid every month: the contribution base includes one twelfth of the extra payments (General Social Security Act, art. 147.1). On ${m(ex.annualGross, 0)} a year you pay ${m(ex.ss.alreadyPaid)} on the Christmas payment, spread over the twelve payslips.` },
      { q: "Is more IRPF withheld from the extra pay?", a: "No: the same rate as your ordinary payslips applies (IRPF Regulation, art. 82). If the percentage changes in December, your employer has adjusted the rate, for example after a pay change or a change in your family situation (art. 87)." },
      { q: "If I started work in September, how much do I get?", a: `The part for the days worked in your agreement's accrual period. Joining on ${startWords} on ${m(ex.annualGross, 0)} a year: ${m(hireAnnual.gross)} gross with yearly accrual (${hireAnnual.accrued.days} of ${hireAnnual.period.days} days) or ${m(hireSemester.gross)} with half-yearly accrual (${hireSemester.accrued.days} of ${hireSemester.period.days}).` },
      { q: "What does prorated extra pay mean?", a: `That instead of a December payment, each payslip carries one twelfth of it; the collective agreement can provide for this (art. 31). On ${m(ex.annualGross, 0)}, ${m(share.gross)} gross a month of the Christmas pay. Over the year you earn the same.` },
      { q: "Do pensioners get an extra payment in December?", a: "Contributory Social Security pensions have two extra payments that accrue in June and November (General Social Security Act, art. 46.1): the end-of-year one comes with the November pension. Payment dates are in our pension payments guide." },
    ],
  });

  const sourcesLead = L(locale, {
    es: `Textos oficiales leídos el ${asOf} en el BOE (versiones consolidadas). La retención sale del algoritmo de la Agencia Tributaria de ${Y}, el de la calculadora de sueldo neto, contrastado con el servicio de cálculo de retenciones de la propia Agencia.`,
    ca: `Textos oficials llegits ${caAsOf} al BOE (versions consolidades). La retenció surt de l'algoritme de l'Agència Tributària del ${Y}, el de la calculadora de sou net, contrastat amb el servei de càlcul de retencions de la mateixa Agència.`,
    en: `Official texts read on ${asOf} in the BOE (consolidated versions). Withholding comes from the Tax Agency's ${Y} algorithm, the one in the net salary calculator, checked against the Agency's own withholding calculation service.`,
  });
  const sourceList = [SOURCES.et, SOURCES.lgss, SOURCES.orden, SOURCES.rirpf, SALARY_SOURCES.algorithm];
  const toolsLabel = L(locale, { es: "Herramientas oficiales:", ca: "Eines oficials:", en: "Official tools:" });

  const limits = L(locale, {
    es: [
      "Lo que diga tu convenio: importe, día de pago, periodo de devengo y cómo cuentan bajas, permisos, ERTE o excedencias.",
      "Navarra y el País Vasco: tablas de retención forales (pon el tipo de tu nómina).",
      "En la estimación del IRPF: edad de 65 años o más, discapacidad, hijos menores de 3 años, regularizaciones y varios pagadores (usa la calculadora de sueldo neto o el tipo de tu nómina).",
      "La paga de verano, el finiquito y las pensiones, que se explican pero no se calculan aquí.",
    ],
    ca: [
      "El que digui el teu conveni: import, dia de pagament, període de meritació i com compten baixes, permisos, ERTO o excedències.",
      "Navarra i el País Basc: taules de retenció forals (posa el tipus de la teva nòmina).",
      "A l'estimació de l'IRPF: edat de 65 anys o més, discapacitat, fills menors de 3 anys, regularitzacions i diversos pagadors (fes servir la calculadora de sou net o el tipus de la teva nòmina).",
      "La paga d'estiu, la quitança i les pensions, que s'expliquen però no es calculen aquí.",
    ],
    en: [
      "Anything your collective agreement sets: amount, payment day, accrual period and how sick leave, other leave, furlough (ERTE) or unpaid leave count.",
      "Navarre and the Basque Country: foral withholding tables (enter your payslip rate).",
      "In the IRPF estimate: age 65 or over, disability, children under 3, rate adjustments and several payers (use the net salary calculator or your payslip rate).",
      "The summer extra payment, the final settlement and pensions, which are explained but not calculated here.",
    ],
  });
  const disclaimer = L(locale, {
    es: `Estimación orientativa con las reglas generales vigentes a ${asOf}; no sustituye a tu nómina, a tu convenio ni al asesoramiento de un profesional. Ante una discrepancia, consulta a tu empresa, a la representación de los trabajadores o a la Inspección de Trabajo.`,
    ca: `Estimació orientativa amb les regles generals vigents ${caAsOf}; no substitueix la teva nòmina, el teu conveni ni l'assessorament d'un professional. Si hi ha una discrepància, consulta l'empresa, la representació dels treballadors o la Inspecció de Treball.`,
    en: `A guide estimate under the general rules in force on ${asOf}; it does not replace your payslip, your collective agreement or professional advice. If something does not match, ask your employer, the workers' representatives or the Labour Inspectorate.`,
  });
  const payDatesLabel = L(locale, {
    es: "Cuándo se cobra el paro y la pensión",
    ca: "Quan es cobra l'atur i la pensió",
    en: "When unemployment benefit and pensions are paid",
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(extraPayPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  // The civil servants' question (Ley 33/1987 art. 33), after the page's own.
  faq.push(...whenFaq(locale));
  const when0 = whenBox(locale);
  const ley33 = L(locale, { es: "Ley 33/1987, art. 33 (BOE)", ca: "Llei 33/1987, art. 33 (BOE)", en: "Law 33/1987, art. 33 (BOE)" });

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <SiteHeader locale={locale} translations={extraPayEditions()} />
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
              <aside className="ci-callout ci-callout-info" aria-labelledby="extra-when-title">
                <p id="extra-when-title">
                  <strong>{when0.title}</strong>
                </p>
                <ul>
                  {when0.items.map((i) => (
                    <li key={i.who}>
                      <strong>{i.who}:</strong> {i.text}
                    </li>
                  ))}
                </ul>
                <p className="text-sm">
                  <a href="#cuando">{h.when}</a> ·{" "}
                  <a href={LEY33_URL} rel="noopener" target="_blank">
                    {ley33}
                  </a>
                </p>
              </aside>
              <ExtraPayCalculator locale={locale} initial={DEFAULT_INPUT} />
              <CalculatorNextStep current="extra-pay" locale={locale} />

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <h2 id="cuando">{h.when}</h2>
              <p>{when[0]}</p>
              <Quote text={QUOTE.et31} cite={L(locale, { es: "Estatuto de los Trabajadores, art. 31", ca: "Estatut dels Treballadors, art. 31", en: "Workers' Statute, art. 31" })} href={SOURCES.et.url} />
              <p>
                {when[1]}{" "}
                <a href={OFFICIAL_LINKS.regcon} rel="noopener" target="_blank">
                  {whenLinks.inline}
                </a>
                .
              </p>
              <p>
                {when[2]} <Link href={payDates}>{whenLinks.payDates}</Link>.
              </p>

              <h2 id="cuanto">{h.amount}</h2>
              <p>{amount}</p>

              <h2 id="prorrateada">{h.prorated}</h2>
              <p>{proratedText}</p>

              <h2 id="proporcional">{h.hire}</h2>
              <p>{hireText[0]}</p>
              <p>{hireText[1]}</p>
              <p>
                {hireText[2]} <Link href={settlement}>{settlementLabel}</Link>.
              </p>

              <h2 id="seguridad-social">{h.ss}</h2>
              <p>{ssText[0]}</p>
              <Quote text={QUOTE.lgss147} cite={L(locale, { es: "Ley General de la Seguridad Social, art. 147.1", ca: "Llei general de la Seguretat Social, art. 147.1", en: "General Social Security Act, art. 147.1" })} href={SOURCES.lgss.url} />
              <Quote text={`${QUOTE.orden1} […] ${QUOTE.orden1Monthly}`} cite={L(locale, { es: "Orden PJC/297/2026, art. 1.1, norma segunda", ca: "Ordre PJC/297/2026, art. 1.1, norma segona", en: "Orden PJC/297/2026, art. 1.1, rule two" })} href={SOURCES.orden.url} />
              <p>{ssText[1]}</p>

              <h2 id="irpf">{h.irpf}</h2>
              <p>{irpfText[0]}</p>
              <Quote text={QUOTE.rirpf82} cite={L(locale, { es: "Reglamento del IRPF, art. 82, operación 5.ª", ca: "Reglament de l'IRPF, art. 82, operació 5a", en: "IRPF Regulation, art. 82, step 5" })} href={SOURCES.rirpf.url} />
              <p>
                {irpfText[1]} <Link href={net}>{netLabel}</Link> ·{" "}
                <a href={OFFICIAL_LINKS.aeatSimulator} rel="noopener" target="_blank">
                  {aeatLabel}
                </a>
                .
              </p>

              <h2 id="ejemplos">{h.examples}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{exCaption}</caption>
                  <thead>
                    <tr>
                      {exCols.map((c, k) => (
                        <th key={c} scope="col" className={k > 0 ? "text-right" : undefined}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exRows.map(([label, gross, irpf, netAmount]) => (
                      <tr key={label}>
                        <th scope="row" className="font-normal">
                          {label}
                        </th>
                        <td data-label={exCols[1]} className="whitespace-nowrap text-right tabular-nums">
                          {m(gross)}
                        </td>
                        <td data-label={exCols[2]} className="whitespace-nowrap text-right tabular-nums">
                          {irpf === null ? "—" : `− ${m(irpf)}`}
                        </td>
                        <td data-label={exCols[3]} className="whitespace-nowrap text-right tabular-nums">
                          {m(netAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{exNote}</p>

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
              <p>{toolsLabel}</p>
              <ul>
                <li>
                  <a href={OFFICIAL_LINKS.aeatSimulator} rel="noopener" target="_blank">
                    {aeatLabel}
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL_LINKS.regcon} rel="noopener" target="_blank">
                    {whenLinks.regcon}
                  </a>
                </li>
              </ul>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm">{disclaimer}</p>

              <MoreCalculators
                current="extra-pay"
                locale={locale}
                extra={
                  <li>
                    <Link href={payDates}>{payDatesLabel}</Link>
                  </li>
                }
              />
            </div>
            <ShareBar locale={locale} path={extraPayPath(locale)} title={meta.h1} contentType="extra_pay_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
