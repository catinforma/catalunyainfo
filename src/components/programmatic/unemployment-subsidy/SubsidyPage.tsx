import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { money, percent, subsidyEditions, subsidyPath, type SubLocale } from "@/lib/programmatic/unemployment-subsidy/copy";
import { DEFAULT_INPUT, checkSubsidy, type SubsidyResult } from "@/lib/programmatic/unemployment-subsidy/engine";
import {
  AMOUNT_BANDS,
  CAE_JOBS,
  CAE_MAX_DAYS,
  CAE_SHARES,
  EMIGRANT_MONTHS,
  EXHAUSTED_MONTHS,
  IMV_CHILD_2026,
  IMV_SINGLE_MONTHLY,
  INCOME_LIMIT,
  INSUFFICIENT_SCALE,
  IPREM_MONTHLY,
  OFFICIAL_LINKS,
  OVER52_SHARE,
  PNC_ANNUAL_2026,
  QUOTE,
  SMI_MONTHLY,
  SOURCES,
  SUBSIDY_RULES_AS_OF,
  VICTIM_MONTHS,
  imvGuaranteed,
  monthlyAmount,
} from "@/lib/programmatic/unemployment-subsidy/rules";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { SubsidyCalculator } from "./SubsidyCalculator";

/**
 * "Subsidio por desempleo 2026" / "Subsidi per desocupació 2026" / "Spain
 * unemployment subsidy 2026": the checker (server-rendered with the default
 * example), then the amounts, the kinds of subsidy, the income test, duration,
 * the over-52 subsidy, working while on it (CAE), how to apply, a short
 * Ingreso Mínimo Vital 2026 section, questions, sources and limits. Every
 * figure comes from rules.ts through the engine.
 */

const L = <T,>(locale: SubLocale, v: Record<SubLocale, T>): T => v[locale];

export const SUB_META: Record<SubLocale, { title: string; description: string; h1: string; breadcrumb: string; appName: string }> = {
  es: {
    title: "Subsidio por desempleo 2026: quién lo cobra, cuánto y cuánto tiempo",
    description: "Comprueba si te corresponde el subsidio por desempleo: 570, 540 y 480 € al mes, límite de rentas de 915,75 €, de 3 a 30 meses y mayores de 52. Con el IMV 2026.",
    h1: "Subsidio por desempleo 2026: quién lo cobra, cuánto y cuánto tiempo",
    breadcrumb: "Subsidio por desempleo",
    appName: "Comprobador del subsidio por desempleo 2026",
  },
  ca: {
    title: "Subsidi per desocupació 2026: qui el cobra, quant i quant de temps",
    description: "Comprova si et correspon el subsidi per desocupació: 570, 540 i 480 € al mes, límit de rendes de 915,75 €, de 3 a 30 mesos i més grans de 52. Amb l'IMV 2026.",
    h1: "Subsidi per desocupació 2026: qui el cobra, quant i quant de temps",
    breadcrumb: "Subsidi per desocupació",
    appName: "Comprovador del subsidi per desocupació 2026",
  },
  en: {
    title: "Spain unemployment subsidy 2026: who gets it, how much, how long",
    description: "Check whether you qualify for Spain's unemployment subsidy (subsidio por desempleo): €570, €540 and €480 a month, the €915.75 income limit, 3 to 30 months, over-52s, plus the 2026 IMV.",
    h1: "Spain unemployment subsidy 2026 (subsidio por desempleo): who gets it, how much and for how long",
    breadcrumb: "Unemployment subsidy",
    appName: "Spain unemployment subsidy checker 2026",
  },
};

export function subsidyCrumbs(locale: SubLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: SUB_META[locale].breadcrumb, href: subsidyPath(locale) }];
}

export function subsidyMetadata(locale: SubLocale): Metadata {
  const m = SUB_META[locale];
  return buildMetadata({ locale, path: subsidyPath(locale), title: m.title, description: m.description, translations: subsidyEditions() });
}

/** For the tests: the default example the page's lead is written from. */
export function defaultExample(): SubsidyResult {
  return checkSubsidy(DEFAULT_INPUT);
}

function Quote({ text, url, label }: { text: string; url: string; label: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <a href={url} rel="noopener" target="_blank">
          {label}
        </a>
      </footer>
    </blockquote>
  );
}

function Table({ head, rows, caption }: { head: string[]; rows: string[][]; caption?: string }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        {caption ? <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              <th scope="row" className="font-normal">
                {row[0]}
              </th>
              {row.slice(1).map((cell, i) => (
                <td key={`${i}-${cell}`} data-label={head[i + 1]} className="tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubsidyRoute({ locale }: { locale: SubLocale }) {
  const meta = SUB_META[locale];
  const crumbs = subsidyCrumbs(locale);
  const ex = defaultExample();
  const m = (v: number) => money(v, locale);
  const m0 = (v: number) => money(v, locale, Number.isInteger(v) ? 0 : 2);
  const pc = (share: number) => percent(share * 100, locale, 0);
  const asOf = dayMonthYear(SUBSIDY_RULES_AS_OF, locale);
  const [a1, a2, a3] = AMOUNT_BANDS.map((b) => monthlyAmount(b.share)) as [number, number, number];
  const over52 = monthlyAmount(OVER52_SHARE);
  const limit = m(INCOME_LIMIT);
  const lgss = (art: string) => L(locale, { es: `Ley General de la Seguridad Social, ${art}`, ca: `Llei general de la Seguretat Social, ${art}`, en: `General Social Security Act (LGSS), ${art}` });
  const paro = calcPath("unemployment", locale);
  const payDates = PAY_DATES_PATH[locale];

  const lead = L(locale, {
    es: `El subsidio por desempleo es de ${m0(a1)} al mes los seis primeros meses, ${m0(a2)} del 7.º al 12.º y ${m0(a3)} desde el 13.º (el ${pc(0.95)}, el ${pc(0.9)} y el ${pc(0.8)} del IPREM de ${m0(IPREM_MONTHLY)}). Lo cobra quien ha agotado el paro o se ha quedado sin trabajo con 90 a 359 días cotizados, siempre que sus ingresos del mes anterior no pasen de ${limit} (el 75 % del salario mínimo) o que tenga responsabilidades familiares. Dura de 3 a 30 meses; con 52 años o más, ${m0(over52)} al mes hasta la jubilación. Ejemplo: 47 años, paro de 360 días agotado, pareja y un hijo con 1.200 € de ingresos en casa: ${ex.months} meses y ${m(ex.total ?? 0)} en total.`,
    ca: `El subsidi per desocupació és de ${m0(a1)} al mes els sis primers mesos, ${m0(a2)} del 7è al 12è i ${m0(a3)} des del 13è (el ${pc(0.95)}, el ${pc(0.9)} i el ${pc(0.8)} de l'IPREM de ${m0(IPREM_MONTHLY)}). El cobra qui ha esgotat l'atur o s'ha quedat sense feina amb 90 a 359 dies cotitzats, sempre que els seus ingressos del mes anterior no passin de ${limit} (el 75 % del salari mínim) o que tingui responsabilitats familiars. Dura de 3 a 30 mesos; amb 52 anys o més, ${m0(over52)} al mes fins a la jubilació. Exemple: 47 anys, atur de 360 dies esgotat, parella i un fill amb 1.200 € d'ingressos a casa: ${ex.months} mesos i ${m(ex.total ?? 0)} en total.`,
    en: `Spain's unemployment subsidy (subsidio por desempleo) pays ${m0(a1)} a month for the first six months, ${m0(a2)} in months 7 to 12 and ${m0(a3)} from month 13 (${pc(0.95)}, ${pc(0.9)} and ${pc(0.8)} of the ${m0(IPREM_MONTHLY)} IPREM). It is for people whose contributory benefit has run out, or who lost a job with 90 to 359 days of contributions, if last month's income was no more than ${limit} (75% of the minimum wage) or they have family responsibilities. It lasts 3 to 30 months; at 52 or over it is ${m0(over52)} a month until retirement. Example: aged 47, a 360-day benefit used up, a partner and a child, €1,200 household income: ${ex.months} months and ${m(ex.total ?? 0)} in all.`,
  });
  const fresh = L(locale, {
    es: `Normas leídas en el BOE, el SEPE y la Seguridad Social el ${asOf}. IPREM y SMI de 2026; se revisan en enero de 2027.`,
    ca: `Normes llegides al BOE, el SEPE i la Seguretat Social el ${asOf}. IPREM i SMI del 2026; es revisen el gener del 2027.`,
    en: `Rules read on the BOE, SEPE and Social Security websites on ${asOf}. 2026 IPREM and minimum wage; reviewed in January 2027.`,
  });

  const h = L(locale, {
    es: { amount: "Cuánto se cobra en 2026", kinds: "Tipos de subsidio y quién puede cobrarlo", income: "El límite de rentas: 915,75 € al mes", duration: "Cuánto tiempo dura", over52: "Subsidio para mayores de 52 años", cae: "Trabajar y cobrar el subsidio: el complemento de apoyo al empleo", apply: "Cómo y cuándo pedirlo", imv: "Ingreso Mínimo Vital 2026", faq: "Preguntas frecuentes", sources: "Fuentes", limits: "Qué no calcula" },
    ca: { amount: "Quant es cobra el 2026", kinds: "Tipus de subsidi i qui el pot cobrar", income: "El límit de rendes: 915,75 € al mes", duration: "Quant de temps dura", over52: "Subsidi per a més grans de 52 anys", cae: "Treballar i cobrar el subsidi: el complement de suport a l'ocupació", apply: "Com i quan demanar-lo", imv: "Ingrés Mínim Vital 2026", faq: "Preguntes freqüents", sources: "Fonts", limits: "Què no calcula" },
    en: { amount: "How much it pays in 2026", kinds: "Kinds of subsidy and who can get them", income: "The income limit: €915.75 a month", duration: "How long it lasts", over52: "The subsidy for people aged 52 and over", cae: "Working while on the subsidy: the employment support top-up (CAE)", apply: "How and when to apply", imv: "Minimum Living Income (IMV) 2026", faq: "Questions", sources: "Sources", limits: "What it does not cover" },
  });

  /* Amounts --------------------------------------------------------------- */
  const amountHead = L(locale, { es: ["Periodo", "% del IPREM", "Al mes"], ca: ["Període", "% de l'IPREM", "Al mes"], en: ["Period", "% of IPREM", "Per month"] });
  const amountRows = [
    [L(locale, { es: "Meses 1 a 6 (días 1 a 180)", ca: "Mesos 1 a 6 (dies 1 a 180)", en: "Months 1 to 6 (days 1 to 180)" }), pc(0.95), m(a1)],
    [L(locale, { es: "Meses 7 a 12 (días 181 a 360)", ca: "Mesos 7 a 12 (dies 181 a 360)", en: "Months 7 to 12 (days 181 to 360)" }), pc(0.9), m(a2)],
    [L(locale, { es: "Desde el mes 13 (día 361)", ca: "Des del mes 13 (dia 361)", en: "From month 13 (day 361)" }), pc(0.8), m(a3)],
    [L(locale, { es: "Mayores de 52 años, todo el periodo", ca: "Més grans de 52 anys, tot el període", en: "Aged 52 and over, throughout" }), pc(OVER52_SHARE), m(over52)],
  ];
  const amountText = L(locale, {
    es: `La cuantía es la misma para todos, sin importar lo que cotizaste ni los hijos: un porcentaje del IPREM mensual, que en 2026 sigue en ${m0(IPREM_MONTHLY)} porque los Presupuestos de 2023 están prorrogados. Se paga en mensualidades de 30 días. Si trabajas a tiempo parcial, en lugar del subsidio entero cobras el complemento de apoyo al empleo (más abajo).`,
    ca: `La quantia és la mateixa per a tothom, sense importar què vas cotitzar ni els fills: un percentatge de l'IPREM mensual, que el 2026 continua en ${m0(IPREM_MONTHLY)} perquè els pressupostos del 2023 estan prorrogats. Es paga en mensualitats de 30 dies. Si treballes a temps parcial, en lloc del subsidi sencer cobres el complement de suport a l'ocupació (més avall).`,
    en: `The amount is the same for everyone, whatever you contributed and however many children you have: a share of the monthly IPREM, still ${m0(IPREM_MONTHLY)} in 2026 because the 2023 State Budget has been rolled over. It is paid in 30-day months. If you work part-time you get the employment support top-up instead of the full subsidy (see below).`,
  });

  /* Kinds ----------------------------------------------------------------- */
  const kindsHead = L(locale, { es: ["Subsidio", "Quién", "Duración máxima", "Base legal"], ca: ["Subsidi", "Qui", "Durada màxima", "Base legal"], en: ["Subsidy", "Who", "Maximum length", "Legal basis"] });
  const months = (n: number) => L(locale, { es: `${n} meses`, ca: `${n} mesos`, en: `${n} months` });
  const kindsRows = L(locale, {
    es: [
      ["Agotamiento de la prestación", "Has agotado el paro contributivo (si tienes menos de 45 años y no tienes responsabilidades familiares, uno de 360 días o más)", `${months(6)}, o ${months(EXHAUSTED_MONTHS.family120)} a ${months(EXHAUSTED_MONTHS.family180)} con responsabilidades familiares`, "Arts. 274.1.a y 277.1 LGSS"],
      ["Cotización insuficiente", "Te has quedado sin trabajo (situación legal de desempleo) con al menos 90 días cotizados y menos de 360", `De ${months(3)} a ${months(6)}; ${months(21)} con responsabilidades familiares y 180 días`, "Arts. 274.1.b y 277.2 LGSS"],
      ["Mayores de 52 años", "Tienes 52 años o más, cumples los requisitos de la jubilación salvo la edad y has cotizado 6 años por desempleo", "Hasta la edad ordinaria de jubilación", "Art. 280 LGSS"],
      ["Emigrante retornado", "Vuelves de un país de fuera del Espacio Económico Europeo (o sin convenio) donde trabajaste 12 meses en los últimos 6 años", months(EMIGRANT_MONTHS), "DA 57ª LGSS"],
      ["Víctimas de violencia de género o sexual", "Acreditas ser víctima (también de violencia de padres o hijos) y no tienes derecho al paro contributivo", `${months(VICTIM_MONTHS[0])} (${months(VICTIM_MONTHS[1])} o ${months(VICTIM_MONTHS[2])} si ya tuviste la Renta Activa de Inserción)`, "DA 58ª LGSS"],
    ],
    ca: [
      ["Esgotament de la prestació", "Has esgotat l'atur contributiu (si tens menys de 45 anys i no tens responsabilitats familiars, un de 360 dies o més)", `${months(6)}, o ${months(EXHAUSTED_MONTHS.family120)} a ${months(EXHAUSTED_MONTHS.family180)} amb responsabilitats familiars`, "Arts. 274.1.a i 277.1 LGSS"],
      ["Cotització insuficient", "T'has quedat sense feina (situació legal de desocupació) amb almenys 90 dies cotitzats i menys de 360", `De ${months(3)} a ${months(6)}; ${months(21)} amb responsabilitats familiars i 180 dies`, "Arts. 274.1.b i 277.2 LGSS"],
      ["Més grans de 52 anys", "Tens 52 anys o més, compleixes els requisits de la jubilació llevat de l'edat i has cotitzat 6 anys per desocupació", "Fins a l'edat ordinària de jubilació", "Art. 280 LGSS"],
      ["Emigrant retornat", "Tornes d'un país de fora de l'Espai Econòmic Europeu (o sense conveni) on vas treballar 12 mesos en els últims 6 anys", months(EMIGRANT_MONTHS), "DA 57a LGSS"],
      ["Víctimes de violència de gènere o sexual", "Acredites ser víctima (també de violència de pares o fills) i no tens dret a l'atur contributiu", `${months(VICTIM_MONTHS[0])} (${months(VICTIM_MONTHS[1])} o ${months(VICTIM_MONTHS[2])} si ja vas tenir la Renda Activa d'Inserció)`, "DA 58a LGSS"],
    ],
    en: [
      ["Benefit exhausted", "Your contributory benefit has run out (under 45 without family responsibilities, it must have lasted 360 days or more)", `${months(6)}, or ${months(EXHAUSTED_MONTHS.family120)} to ${months(EXHAUSTED_MONTHS.family180)} with family responsibilities`, "LGSS arts. 274.1.a and 277.1"],
      ["Insufficient contributions", "You lost your job (legal unemployment) with at least 90 and fewer than 360 days of contributions", `${months(3)} to ${months(6)}; ${months(21)} with family responsibilities and 180 days`, "LGSS arts. 274.1.b and 277.2"],
      ["Aged 52 and over", "You are 52 or over, meet every retirement-pension requirement except age, and have 6 years of unemployment contributions", "Until the ordinary retirement age", "LGSS art. 280"],
      ["Returning emigrant", "You come back from a country outside the European Economic Area (or without an agreement) where you worked 12 months in the last 6 years", months(EMIGRANT_MONTHS), "LGSS add. provision 57"],
      ["Victims of gender-based or sexual violence", "You are a recognised victim (including violence by parents or children) and not entitled to contributory benefit", `${months(VICTIM_MONTHS[0])} (${months(VICTIM_MONTHS[1])} or ${months(VICTIM_MONTHS[2])} after earlier RAI awards)`, "LGSS add. provision 58"],
    ],
  });
  const kindsText = L(locale, {
    es: "En todos hace falta estar inscrito como demandante de empleo y firmar el acuerdo de actividad, no tener derecho al paro contributivo y no trabajar por cuenta propia. Desde el 1 de noviembre de 2024 (Real Decreto-ley 2/2024) ya no hay un subsidio propio para quien sale de prisión: el preámbulo de la reforma dice que",
    ca: "En tots cal estar inscrit com a demandant d'ocupació i signar l'acord d'activitat, no tenir dret a l'atur contributiu i no treballar per compte propi. Des de l'1 de novembre de 2024 (Reial decret llei 2/2024) ja no hi ha un subsidi propi per a qui surt de presó: el preàmbul de la reforma diu que",
    en: "All of them require registering as a jobseeker and signing the activity agreement, having no right to contributory benefit, and no self-employment. Since 1 November 2024 (Royal Decree-law 2/2024) there is no separate subsidy for people released from prison: the reform's preamble says that",
  });
  const prisonAfter = L(locale, {
    es: "y lo adapta al Ingreso Mínimo Vital. Si es tu caso, consulta en el SEPE.",
    ca: "i ho adapta a l'Ingrés Mínim Vital. Si és el teu cas, consulta-ho al SEPE.",
    en: "and adapts the Minimum Living Income instead. If that is your case, ask SEPE.",
  });

  /* Income ---------------------------------------------------------------- */
  const incomeText = L(locale, {
    es: [
      `Se miran los ingresos brutos del mes natural anterior a la solicitud (y a cada prórroga). El límite es el 75 % del salario mínimo mensual sin las pagas extra: el 75 % de ${m0(SMI_MONTHLY)}, ${limit} en 2026. Es lo que publica el SEPE; no se calcula sobre el salario mínimo en 12 pagas.`,
      `Basta con una de dos: que tus propios ingresos no pasen de ${limit}, o tener responsabilidades familiares, es decir, que los ingresos de toda la unidad familiar divididos entre sus miembros no pasen de ${limit} por persona. Ejemplo: pareja e hijo con 1.200 € al mes en casa son ${m(1200 / 3)} por persona.`,
      "Cuentan el sueldo, los alquileres, los intereses, las pensiones y prestaciones y las ganancias de patrimonio; no cuentan la indemnización legal por despido (sí lo que se pacte por encima), las becas de formación ni la vivienda habitual.",
    ],
    ca: [
      `Es miren els ingressos bruts del mes natural anterior a la sol·licitud (i a cada pròrroga). El límit és el 75 % del salari mínim mensual sense les pagues extra: el 75 % de ${m0(SMI_MONTHLY)}, ${limit} el 2026. És el que publica el SEPE; no es calcula sobre el salari mínim en 12 pagues.`,
      `N'hi ha prou amb una de dues: que els teus ingressos no passin de ${limit}, o tenir responsabilitats familiars, és a dir, que els ingressos de tota la unitat familiar dividits entre els seus membres no passin de ${limit} per persona. Exemple: parella i fill amb 1.200 € al mes a casa són ${m(1200 / 3)} per persona.`,
      "Compten el sou, els lloguers, els interessos, les pensions i prestacions i els guanys de patrimoni; no compten la indemnització legal per acomiadament (sí el que es pacti per sobre), les beques de formació ni l'habitatge habitual.",
    ],
    en: [
      `What counts is gross income in the calendar month before you apply (and before each extension). The limit is 75% of the monthly minimum wage without the extra payments: 75% of ${m0(SMI_MONTHLY)}, ${limit} in 2026. That is the figure SEPE publishes; it is not worked out on the minimum wage spread over 12 payments.`,
      `One of two is enough: your own income is no more than ${limit}, or you have family responsibilities, meaning the whole family unit's income divided by its members is no more than ${limit} per person. Example: a couple and a child with €1,200 a month coming in is ${m(1200 / 3)} per person.`,
      "Wages, rent, interest, pensions and benefits and capital gains count; statutory severance pay (but not anything agreed above it), training grants and your home do not.",
    ],
  });

  /* Duration -------------------------------------------------------------- */
  const exHead = L(locale, {
    es: ["Responsabilidades familiares", "Edad al agotar el paro", "Paro agotado", "Duración máxima"],
    ca: ["Responsabilitats familiars", "Edat en esgotar l'atur", "Atur esgotat", "Durada màxima"],
    en: ["Family responsibilities", "Age when the benefit ran out", "Benefit used up", "Maximum length"],
  });
  const yes = L(locale, { es: "Sí", ca: "Sí", en: "Yes" });
  const no = L(locale, { es: "No", ca: "No", en: "No" });
  const any = L(locale, { es: "Cualquiera", ca: "Qualsevol", en: "Any" });
  const daysW = (n: number) => L(locale, { es: `${n} días o más`, ca: `${n} dies o més`, en: `${n} days or more` });
  const exRows = [
    [no, L(locale, { es: "Menos de 45", ca: "Menys de 45", en: "Under 45" }), daysW(360), months(EXHAUSTED_MONTHS.noFamily)],
    [no, L(locale, { es: "45 o más", ca: "45 o més", en: "45 or over" }), daysW(120), months(EXHAUSTED_MONTHS.noFamily)],
    [yes, any, L(locale, { es: "120 días", ca: "120 dies", en: "120 days" }), months(EXHAUSTED_MONTHS.family120)],
    [yes, any, daysW(180), months(EXHAUSTED_MONTHS.family180)],
  ];
  const insHead = L(locale, {
    es: ["Días cotizados", "Sin responsabilidades familiares", "Con responsabilidades familiares"],
    ca: ["Dies cotitzats", "Sense responsabilitats familiars", "Amb responsabilitats familiars"],
    en: ["Days contributed", "No family responsibilities", "With family responsibilities"],
  });
  const insRows = INSUFFICIENT_SCALE.map(([from, noFam, fam], i) => {
    const to = INSUFFICIENT_SCALE[i + 1]?.[0];
    const label = to ? L(locale, { es: `${from} a ${to - 1}`, ca: `${from} a ${to - 1}`, en: `${from} to ${to - 1}` }) : L(locale, { es: `${from} a 359`, ca: `${from} a 359`, en: `${from} to 359` });
    return [label, months(noFam), months(fam)];
  });
  const durationText = L(locale, {
    es: [
      "Tras agotar el paro, la duración depende de la edad que tenías ese día, de si tienes responsabilidades familiares y de cuánto duró el paro agotado:",
      "Si te quedas sin trabajo sin llegar a 360 días cotizados, depende de los días cotizados en los últimos seis años. Esos días ya no sirven para otro paro o subsidio futuro:",
      "En todos los casos se concede por trimestres: cada tres meses hay que pedir la prórroga acreditando que sigues cumpliendo los requisitos. Si accediste sin responsabilidades familiares y luego las tienes, puedes pedir la ampliación dentro de los 12 meses siguientes.",
    ],
    ca: [
      "Després d'esgotar l'atur, la durada depèn de l'edat que tenies aquell dia, de si tens responsabilitats familiars i de quant va durar l'atur esgotat:",
      "Si et quedes sense feina sense arribar a 360 dies cotitzats, depèn dels dies cotitzats en els últims sis anys. Aquests dies ja no serveixen per a un altre atur o subsidi futur:",
      "En tots els casos es concedeix per trimestres: cada tres mesos cal demanar la pròrroga acreditant que continues complint els requisits. Si hi vas accedir sense responsabilitats familiars i després les tens, pots demanar l'ampliació dins dels 12 mesos següents.",
    ],
    en: [
      "After the benefit runs out, the length depends on your age that day, whether you have family responsibilities and how long the benefit you used up lasted:",
      "If you lose a job with fewer than 360 days of contributions, it depends on the days contributed in the last six years. Those days cannot be used again for a later benefit or subsidy:",
      "It is always granted quarter by quarter: every three months you apply for the extension, showing you still qualify. If you started without family responsibilities and later have them, you can ask for the longer length within 12 months.",
    ],
  });

  /* Over 52 --------------------------------------------------------------- */
  const over52Text = L(locale, {
    es: [
      `Con 52 años o más el día en que agotas el paro o te quedas sin trabajo (con 90 días cotizados), cobras ${m(over52)} al mes (el ${pc(OVER52_SHARE)} del IPREM) hasta la edad ordinaria de jubilación, y el SEPE cotiza por tu jubilación (sobre el 125 % de la base mínima). Requisitos: tener todos los de la pensión de jubilación salvo la edad (15 años cotizados, 2 de ellos en los últimos 15), haber cotizado por desempleo al menos 6 años en tu vida laboral y que tus propios ingresos no pasen de ${limit}: aquí no valen las responsabilidades familiares.`,
      "Si tenías todo menos la edad, puedes pedirlo al cumplir los 52 si has seguido inscrito como demandante de empleo. Quien cobró la Renta Activa de Inserción, el cese de actividad de autónomos o el subsidio extraordinario no accede por esa vía. Cada 12 meses hay que presentar la declaración anual de rentas.",
    ],
    ca: [
      `Amb 52 anys o més el dia que esgotes l'atur o et quedes sense feina (amb 90 dies cotitzats), cobres ${m(over52)} al mes (el ${pc(OVER52_SHARE)} de l'IPREM) fins a l'edat ordinària de jubilació, i el SEPE cotitza per la teva jubilació (sobre el 125 % de la base mínima). Requisits: tenir tots els de la pensió de jubilació llevat de l'edat (15 anys cotitzats, 2 d'ells en els últims 15), haver cotitzat per desocupació com a mínim 6 anys en la teva vida laboral i que els teus ingressos no passin de ${limit}: aquí no valen les responsabilitats familiars.`,
      "Si ho tenies tot menys l'edat, el pots demanar en complir els 52 si has continuat inscrit com a demandant d'ocupació. Qui va cobrar la Renda Activa d'Inserció, el cessament d'activitat d'autònoms o el subsidi extraordinari no hi accedeix per aquesta via. Cada 12 mesos cal presentar la declaració anual de rendes.",
    ],
    en: [
      `If you are 52 or over on the day your benefit runs out or you lose your job (with 90 days of contributions), you get ${m(over52)} a month (${pc(OVER52_SHARE)} of the IPREM) until the ordinary retirement age, and SEPE pays retirement contributions for you (on 125% of the minimum base). Requirements: every retirement-pension condition except age (15 years of contributions, 2 of them in the last 15), at least 6 years of unemployment contributions over your working life, and your own income no more than ${limit}: family responsibilities do not replace it here.`,
      "If you met everything but the age, you can apply on turning 52 if you stayed registered as a jobseeker. People who had the Renta Activa de Inserción, the self-employed cessation benefit or the extraordinary subsidy cannot use that route. Every 12 months you file the annual income statement.",
    ],
  });

  /* CAE ------------------------------------------------------------------- */
  const caeHead = L(locale, {
    es: ["Trimestre del subsidio", "Jornada completa", "Parcial ≥ 75 %", "Parcial 50–75 %", "Parcial < 50 %"],
    ca: ["Trimestre del subsidi", "Jornada completa", "Parcial ≥ 75 %", "Parcial 50–75 %", "Parcial < 50 %"],
    en: ["Quarter of the subsidy", "Full time", "Part time ≥ 75%", "Part time 50–75%", "Part time < 50%"],
  });
  const caeRows = CAE_SHARES.map((row, i) => [
    i === CAE_SHARES.length - 1 ? L(locale, { es: `${i + 1}.º y siguientes`, ca: `${i + 1}è i següents`, en: `${i + 1}th and later` }) : L(locale, { es: `${i + 1}.º`, ca: `${i + 1}${i === 0 ? "r" : i === 1 ? "n" : i === 2 ? "r" : "t"}`, en: `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}` }),
    ...CAE_JOBS.map((j) => `${m0(monthlyAmount(row[j]))} (${pc(row[j])})`),
  ]);
  const caeText = L(locale, {
    es: `Si encuentras trabajo por cuenta ajena (a jornada completa o parcial) mientras cobras el subsidio, o ya tenías un contrato a tiempo parcial, no lo pierdes: pasa a ser el complemento de apoyo al empleo, que cobras además del sueldo. La cantidad depende de la jornada y del trimestre del subsidio en que empiezas, y baja cada trimestre. Dura hasta ${CAE_MAX_DAYS} días y consume días del subsidio. No vale si te contrata una empresa en la que trabajaste en los 12 meses anteriores, una con un ERE autorizado o un familiar hasta el segundo grado. Importes al mes en 2026:`,
    ca: `Si trobes feina per compte d'altri (a jornada completa o parcial) mentre cobres el subsidi, o ja tenies un contracte a temps parcial, no el perds: passa a ser el complement de suport a l'ocupació, que cobres a més del sou. La quantitat depèn de la jornada i del trimestre del subsidi en què comences, i baixa cada trimestre. Dura fins a ${CAE_MAX_DAYS} dies i consumeix dies del subsidi. No val si et contracta una empresa on vas treballar en els 12 mesos anteriors, una amb un ERO autoritzat o un familiar fins al segon grau. Imports al mes el 2026:`,
    en: `If you take a job as an employee (full or part time) while on the subsidy, or already had a part-time contract, you keep it as the employment support top-up (complemento de apoyo al empleo, CAE), paid on top of your wage. The amount depends on your working hours and the quarter of the subsidy you start in, and falls each quarter. It lasts up to ${CAE_MAX_DAYS} days and uses up subsidy days. It does not apply if the employer is one you worked for in the previous 12 months, one with an authorised redundancy plan (ERE) or a relative up to the second degree. Monthly amounts in 2026:`,
  });

  /* Apply ----------------------------------------------------------------- */
  const applyText = L(locale, {
    es: (
      <>
        Pídelo en los 15 días hábiles siguientes a agotar el paro o a quedarte sin trabajo: así se cobra desde el día siguiente. Si lo pides más tarde (hasta seis meses), se cobra desde la solicitud; después se deniega. Se tramita en la{" "}
        <a href={OFFICIAL_LINKS.sepeApply} rel="noopener" target="_blank">
          sede electrónica del SEPE
        </a>{" "}
        o con cita en la oficina de prestaciones. El SEPE lo paga por mensualidades de 30 días: <Link href={payDates}>calendario de pagos del paro y el subsidio</Link>.
      </>
    ),
    ca: (
      <>
        Demana&apos;l en els 15 dies hàbils següents a esgotar l&apos;atur o a quedar-te sense feina: així es cobra des de l&apos;endemà. Si el demanes més tard (fins a sis mesos), es cobra des de la sol·licitud; després es denega. Es tramita a la{" "}
        <a href={OFFICIAL_LINKS.sepeApply} rel="noopener" target="_blank">
          seu electrònica del SEPE
        </a>{" "}
        o amb cita a l&apos;oficina de prestacions. El SEPE el paga per mensualitats de 30 dies: <Link href={payDates}>calendari de pagaments de l&apos;atur i el subsidi</Link>.
      </>
    ),
    en: (
      <>
        Apply within 15 working days of your benefit running out or your job ending, and it is paid from the next day. Apply later (up to six months) and it is paid from the application; after that it is refused. Apply on{" "}
        <a href={OFFICIAL_LINKS.sepeApply} rel="noopener" target="_blank">
          SEPE&apos;s online office
        </a>{" "}
        or with an appointment at a benefits office. SEPE pays it in 30-day months: <Link href={payDates}>unemployment benefit and subsidy payment dates</Link>.
      </>
    ),
  });

  /* IMV ------------------------------------------------------------------- */
  const imvHead = L(locale, {
    es: ["Unidad de convivencia", "Renta garantizada al mes", "Si es monoparental"],
    ca: ["Unitat de convivència", "Renda garantida al mes", "Si és monoparental"],
    en: ["Household", "Guaranteed income a month", "Single parent"],
  });
  const imvLabels = L(locale, {
    es: ["Un adulto solo", "2 personas (un adulto y un menor, o dos adultos)", "3 personas", "4 personas", "5 o más personas"],
    ca: ["Un adult sol", "2 persones (un adult i un menor, o dos adults)", "3 persones", "4 persones", "5 persones o més"],
    en: ["One adult living alone", "2 people (one adult and a child, or two adults)", "3 people", "4 people", "5 or more people"],
  });
  const imvRows = imvLabels.map((label, i) => [label, m(imvGuaranteed(i + 1)), i === 0 ? "—" : m(imvGuaranteed(i + 1, true))]);
  const imvText = L(locale, {
    es: [
      `El Ingreso Mínimo Vital (IMV) es otra prestación, de la Seguridad Social, para hogares con pocos ingresos y patrimonio. Completa los ingresos del hogar hasta una renta garantizada: en 2026, ${m(IMV_SINGLE_MONTHLY)} al mes para un adulto solo (el importe anual de la pensión no contributiva, ${m(PNC_ANNUAL_2026)}, entre doce), con un 30 % más por cada miembro adicional hasta el 220 %. Lo que cobras es la diferencia entre esa cantidad y los ingresos del hogar del año anterior, si es de 10 € o más.`,
      `Con menores se suma el complemento de ayuda para la infancia, por niño y mes según la Seguridad Social: ${m(IMV_CHILD_2026.under3)} hasta 3 años, ${m(IMV_CHILD_2026.under6)} de 3 a 6 y ${m(IMV_CHILD_2026.under18)} de 6 a 18. Hay un 22 % más si alguien tiene una discapacidad del 65 % o más.`,
      "El subsidio y el IMV son compatibles, pero el subsidio cuenta como ingreso al calcular el IMV, salvo que ya se haya extinguido cuando lo pides. Los requisitos (residencia, edad, patrimonio) son más que los de esta tabla: compruébalos en el simulador oficial.",
    ],
    ca: [
      `L'Ingrés Mínim Vital (IMV) és una altra prestació, de la Seguretat Social, per a llars amb pocs ingressos i patrimoni. Completa els ingressos de la llar fins a una renda garantida: el 2026, ${m(IMV_SINGLE_MONTHLY)} al mes per a un adult sol (l'import anual de la pensió no contributiva, ${m(PNC_ANNUAL_2026)}, entre dotze), amb un 30 % més per cada membre addicional fins al 220 %. El que cobres és la diferència entre aquesta quantitat i els ingressos de la llar de l'any anterior, si és de 10 € o més.`,
      `Amb menors s'hi suma el complement d'ajuda per a la infància, per infant i mes segons la Seguretat Social: ${m(IMV_CHILD_2026.under3)} fins a 3 anys, ${m(IMV_CHILD_2026.under6)} de 3 a 6 i ${m(IMV_CHILD_2026.under18)} de 6 a 18. Hi ha un 22 % més si algú té una discapacitat del 65 % o més.`,
      "El subsidi i l'IMV són compatibles, però el subsidi compta com a ingrés en calcular l'IMV, llevat que ja s'hagi extingit quan el demanes. Els requisits (residència, edat, patrimoni) són més que els d'aquesta taula: comprova'ls al simulador oficial.",
    ],
    en: [
      `The Minimum Living Income (Ingreso Mínimo Vital, IMV) is a separate Social Security benefit for households with low income and assets. It tops household income up to a guaranteed amount: in 2026, ${m(IMV_SINGLE_MONTHLY)} a month for one adult living alone (the annual non-contributory pension, ${m(PNC_ANNUAL_2026)}, divided by twelve), plus 30% for each extra member up to 220%. You receive the difference between that amount and the household's income in the previous year, if it is €10 or more.`,
      `With children there is the child support top-up, per child per month according to Social Security: ${m(IMV_CHILD_2026.under3)} under 3, ${m(IMV_CHILD_2026.under6)} from 3 to 6 and ${m(IMV_CHILD_2026.under18)} from 6 to 18. It is 22% more if someone has a disability of 65% or more.`,
      "You can get the subsidy and the IMV at once, but the subsidy counts as income for the IMV unless it has already ended when you apply. The requirements (residence, age, assets) go beyond this table: check them on the official simulator.",
    ],
  });

  /* FAQ ------------------------------------------------------------------- */
  const faq = L(locale, {
    es: [
      { q: "¿Cuánto es el subsidio por desempleo en 2026?", a: `${m(a1)} al mes los primeros 180 días, ${m(a2)} del día 181 al 360 y ${m(a3)} desde el 361. El de mayores de 52 años, ${m(over52)} todo el tiempo. Son el 95 %, el 90 % y el 80 % del IPREM, que sigue en ${m0(IPREM_MONTHLY)}.` },
      { q: "¿Cuál es el límite de ingresos para cobrar el subsidio?", a: `${limit} brutos al mes en 2026: el 75 % del salario mínimo (${m0(SMI_MONTHLY)}) sin pagas extra. Si tienes familia, también vale que los ingresos del hogar divididos entre sus miembros no pasen de esa cifra.` },
      { q: "¿Cuánto dura el subsidio?", a: `Entre 3 y 30 meses: 6 meses tras agotar el paro sin responsabilidades familiares, 24 o 30 con ellas; de 3 a 6 meses (21 con familia) por cotización insuficiente; ${EMIGRANT_MONTHS} los emigrantes retornados, ${VICTIM_MONTHS[0]} las víctimas de violencia; los mayores de 52, hasta la jubilación.` },
      { q: "¿Puedo trabajar mientras cobro el subsidio?", a: `Sí, por cuenta ajena: cobras el complemento de apoyo al empleo además del sueldo, de ${m0(monthlyAmount(CAE_SHARES[0]!.full))} el primer trimestre a jornada completa a ${m0(monthlyAmount(CAE_SHARES[4]!.full))} desde el quinto, hasta ${CAE_MAX_DAYS} días. Por cuenta propia, no.` },
      { q: "¿El subsidio de mayores de 52 cotiza para la jubilación?", a: "Sí: el SEPE cotiza por jubilación sobre el 125 % de la base mínima de cotización mientras lo cobras. Esas cotizaciones cuentan para la cuantía de la pensión, pero no para los 15 años mínimos." },
      { q: "¿Es compatible el subsidio con el Ingreso Mínimo Vital?", a: "Sí, la ley los permite a la vez, pero el subsidio cuenta como ingreso del hogar para calcular el IMV (salvo que ya se haya extinguido al pedirlo)." },
    ],
    ca: [
      { q: "Quant és el subsidi per desocupació el 2026?", a: `${m(a1)} al mes els primers 180 dies, ${m(a2)} del dia 181 al 360 i ${m(a3)} des del 361. El de més grans de 52 anys, ${m(over52)} tot el temps. Són el 95 %, el 90 % i el 80 % de l'IPREM, que continua en ${m0(IPREM_MONTHLY)}.` },
      { q: "Quin és el límit d'ingressos per cobrar el subsidi?", a: `${limit} bruts al mes el 2026: el 75 % del salari mínim (${m0(SMI_MONTHLY)}) sense pagues extra. Si tens família, també val que els ingressos de la llar dividits entre els seus membres no passin d'aquesta xifra.` },
      { q: "Quant dura el subsidi?", a: `Entre 3 i 30 mesos: 6 mesos després d'esgotar l'atur sense responsabilitats familiars, 24 o 30 amb elles; de 3 a 6 mesos (21 amb família) per cotització insuficient; ${EMIGRANT_MONTHS} els emigrants retornats, ${VICTIM_MONTHS[0]} les víctimes de violència; els més grans de 52, fins a la jubilació.` },
      { q: "Puc treballar mentre cobro el subsidi?", a: `Sí, per compte d'altri: cobres el complement de suport a l'ocupació a més del sou, de ${m0(monthlyAmount(CAE_SHARES[0]!.full))} el primer trimestre a jornada completa a ${m0(monthlyAmount(CAE_SHARES[4]!.full))} des del cinquè, fins a ${CAE_MAX_DAYS} dies. Per compte propi, no.` },
      { q: "El subsidi de més grans de 52 cotitza per a la jubilació?", a: "Sí: el SEPE cotitza per jubilació sobre el 125 % de la base mínima de cotització mentre el cobres. Aquestes cotitzacions compten per a la quantia de la pensió, però no per als 15 anys mínims." },
      { q: "És compatible el subsidi amb l'Ingrés Mínim Vital?", a: "Sí, la llei els permet alhora, però el subsidi compta com a ingrés de la llar per calcular l'IMV (llevat que ja s'hagi extingit en demanar-lo)." },
    ],
    en: [
      { q: "How much is the unemployment subsidy in Spain in 2026?", a: `${m(a1)} a month for the first 180 days, ${m(a2)} from day 181 to 360 and ${m(a3)} from day 361. The over-52 subsidy is ${m(over52)} throughout. That is 95%, 90% and 80% of the IPREM, still ${m0(IPREM_MONTHLY)}.` },
      { q: "What is the income limit for the subsidy?", a: `${limit} gross a month in 2026: 75% of the minimum wage (${m0(SMI_MONTHLY)}) without extra payments. With a family, it is also enough that household income divided by its members is no more than that.` },
      { q: "How long does the subsidy last?", a: `3 to 30 months: 6 months after the benefit runs out without family responsibilities, 24 or 30 with them; 3 to 6 months (21 with a family) for insufficient contributions; ${EMIGRANT_MONTHS} for returning emigrants, ${VICTIM_MONTHS[0]} for victims of violence; over-52s until retirement.` },
      { q: "Can I work while on the subsidy?", a: `Yes, as an employee: you get the employment support top-up on top of your wage, from ${m0(monthlyAmount(CAE_SHARES[0]!.full))} in the first quarter full time to ${m0(monthlyAmount(CAE_SHARES[4]!.full))} from the fifth, for up to ${CAE_MAX_DAYS} days. Not if self-employed.` },
      { q: "Does the over-52 subsidy count towards my pension?", a: "Yes: SEPE pays retirement contributions on 125% of the minimum contribution base while you get it. They count towards the pension amount, but not towards the 15-year minimum." },
      { q: "Can I get the subsidy and the Minimum Living Income?", a: "Yes, the law allows both, but the subsidy counts as household income when the IMV is worked out (unless it has already ended when you apply)." },
    ],
  });

  const sourceList = Object.values(SOURCES);
  const limitsList = L(locale, {
    es: [
      "El subsidio agrario y la renta agraria, ni los fijos discontinuos.",
      "Los subsidios nacidos antes del 1 de noviembre de 2024, que siguen con las normas anteriores.",
      "La retención de IRPF y si te toca hacer la declaración de la renta.",
      "Situaciones que no están en la ley de subsidios (salida de prisión, baja voluntaria, autónomos): consulta en el SEPE.",
    ],
    ca: [
      "El subsidi agrari i la renda agrària, ni els fixos discontinus.",
      "Els subsidis nascuts abans de l'1 de novembre de 2024, que continuen amb les normes anteriors.",
      "La retenció d'IRPF i si et toca fer la declaració de la renda.",
      "Situacions que no són a la llei de subsidis (sortida de presó, baixa voluntària, autònoms): consulta-ho al SEPE.",
    ],
    en: [
      "The farm-worker subsidy and renta agraria, and fijos discontinuos.",
      "Subsidies that started before 1 November 2024, which keep the old rules.",
      "Income tax withholding and whether you must file a tax return.",
      "Situations outside the subsidy law (release from prison, resigning, self-employment): ask SEPE.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(subsidyPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <SiteHeader locale={locale} translations={subsidyEditions()} />
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
              <SubsidyCalculator locale={locale} initial={DEFAULT_INPUT} />

              <h2 id="cuantia">{h.amount}</h2>
              <p>{amountText}</p>
              <Table head={amountHead} rows={amountRows} />
              <Quote text={QUOTE.art278} url={SOURCES.lgss.url} label={lgss(L(locale, { es: "art. 278", ca: "art. 278", en: "art. 278" }))} />

              <h2 id="tipos">{h.kinds}</h2>
              <Table head={kindsHead} rows={kindsRows} />
              <p>
                {kindsText} «{QUOTE.rdl2Prison}» {prisonAfter}
              </p>
              <Quote text={QUOTE.art274} url={SOURCES.lgss.url} label={lgss("art. 274.1")} />

              <h2 id="rentas">{h.income}</h2>
              {incomeText.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <Quote text={QUOTE.art275_1} url={SOURCES.lgss.url} label={lgss("art. 275.1")} />
              <Quote text={QUOTE.art275_2} url={SOURCES.lgss.url} label={lgss("art. 275.2")} />
              <Quote text={QUOTE.art275_3} url={SOURCES.lgss.url} label={lgss("art. 275.3")} />

              <h2 id="duracion">{h.duration}</h2>
              <p>{durationText[0]}</p>
              <Table head={exHead} rows={exRows} caption={lgss("art. 277.1")} />
              <p>{durationText[1]}</p>
              <Table head={insHead} rows={insRows} caption={lgss("art. 277.2")} />
              <p>{durationText[2]}</p>

              <h2 id="mayores-52">{h.over52}</h2>
              {over52Text.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <Quote text={QUOTE.art280_1} url={SOURCES.lgss.url} label={lgss("art. 280.1")} />
              <Quote text={QUOTE.art280_9} url={SOURCES.lgss.url} label={lgss("art. 280.9")} />
              <Quote text={QUOTE.sepeOver52Duration} url={SOURCES.sepeOver52.url} label={`${SOURCES.sepeOver52.name} (${asOf})`} />

              <h2 id="complemento-apoyo-empleo">{h.cae}</h2>
              <p>{caeText}</p>
              <Table head={caeHead} rows={caeRows} />
              <Quote text={QUOTE.art282_3} url={SOURCES.lgss.url} label={lgss("art. 282.3")} />

              <h2 id="solicitud">{h.apply}</h2>
              <p>{applyText}</p>
              <Quote text={QUOTE.art276_1} url={SOURCES.lgss.url} label={lgss("art. 276.1")} />
              <Quote text={QUOTE.sepePayment} url={SOURCES.sepeOver52.url} label={`SEPE (${asOf})`} />
              <p>
                {L(locale, { es: "¿Aún tienes derecho al paro contributivo (360 días cotizados o más)?", ca: "Encara tens dret a l'atur contributiu (360 dies cotitzats o més)?", en: "Still entitled to contributory benefit (360 days of contributions or more)?" })}{" "}
                <Link href={paro}>{L(locale, { es: "Calcula tu paro", ca: "Calcula el teu atur", en: "Work out your unemployment benefit" })}</Link>.
              </p>

              <h2 id="ingreso-minimo-vital">{h.imv}</h2>
              <p>{imvText[0]}</p>
              <Table head={imvHead} rows={imvRows} caption={L(locale, { es: "Renta garantizada del IMV, 2026 (Ley 19/2021, art. 13 y anexo I)", ca: "Renda garantida de l'IMV, 2026 (Llei 19/2021, art. 13 i annex I)", en: "IMV guaranteed income, 2026 (Ley 19/2021, art. 13 and annex I)" })} />
              <p>{imvText[1]}</p>
              <p>{imvText[2]}</p>
              <Quote text={QUOTE.imv13} url={SOURCES.imvLaw.url} label={L(locale, { es: "Ley 19/2021, art. 13.2.a", ca: "Llei 19/2021, art. 13.2.a", en: "Ley 19/2021, art. 13.2.a" })} />
              <Quote text={QUOTE.rdl3Pnc} url={SOURCES.rdl3.url} label={L(locale, { es: "Real Decreto-ley 3/2026, art. 2.5", ca: "Reial decret llei 3/2026, art. 2.5", en: "Royal Decree-law 3/2026, art. 2.5" })} />
              <Quote text={QUOTE.art282_4} url={SOURCES.lgss.url} label={lgss("art. 282.4")} />
              <p>
                <a href={OFFICIAL_LINKS.imvSimulator} rel="noopener" target="_blank">
                  {L(locale, { es: "Simulador del Ingreso Mínimo Vital (Seguridad Social)", ca: "Simulador de l'Ingrés Mínim Vital (Seguretat Social)", en: "Minimum Living Income simulator (Social Security)" })}
                </a>
                {L(locale, { es: " · ", ca: " · ", en: " · " })}
                <a href={SOURCES.ssImv.url} rel="noopener" target="_blank">
                  {SOURCES.ssImv.name}
                </a>
              </p>

              <h2 id="preguntas">{h.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{h.sources}</h2>
              <p>{L(locale, { es: `Todas las cifras salen de estos textos oficiales, leídos el ${asOf}:`, ca: `Totes les xifres surten d'aquests textos oficials, llegits el ${asOf}:`, en: `Every figure comes from these official texts, read on ${asOf}:` })}</p>
              <ul>
                {sourceList.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener" target="_blank">
                      {s.name}
                    </a>{" "}
                    ({s.ref})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{h.limits}</h2>
              <ul>
                {limitsList.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">
                {L(locale, {
                  es: "Información general, no asesoramiento: quien reconoce el subsidio y su cuantía es el SEPE, con tu vida laboral y tus ingresos reales. Ante cualquier duda, consulta en el SEPE.",
                  ca: "Informació general, no assessorament: qui reconeix el subsidi i la seva quantia és el SEPE, amb la teva vida laboral i els teus ingressos reals. Davant qualsevol dubte, consulta-ho al SEPE.",
                  en: "General information, not advice: SEPE decides whether you get the subsidy and how much, from your contribution record and actual income. If in doubt, ask SEPE.",
                })}
              </p>

              <MoreCalculators
                current="unemployment-subsidy"
                locale={locale}
                extra={
                  <li>
                    <Link href={payDates}>{L(locale, { es: "Cuándo se cobra el paro y el subsidio", ca: "Quan es cobra l'atur i el subsidi", en: "When unemployment benefit and the subsidy are paid" })}</Link>
                  </li>
                }
              />
            </div>
            <ShareBar locale={locale} path={subsidyPath(locale)} title={meta.h1} contentType="unemployment_subsidy_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}

