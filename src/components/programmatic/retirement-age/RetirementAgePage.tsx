import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

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
import { pensionPath } from "@/lib/programmatic/pensions-2027/copy";
import { OFFICIAL_LINKS as PENSION_LINKS } from "@/lib/programmatic/pensions-2027/rules";
import { COLUMN_LABEL, COLUMN_SHORT, coef, day, elDay, monthsText, retirementEditions, retirementPath, whole, ymText, type RaLocale } from "@/lib/programmatic/retirement-age/copy";
import type { EarlyOutcome } from "@/lib/programmatic/retirement-age/engine";
import { DEFAULT_INPUT, delayTable, examples, headline, retirementFaq, retirementMeta, type ExampleId } from "@/lib/programmatic/retirement-age/page";
import {
  ACTIVE_STEP,
  COLUMNS,
  EARLY_MAX_MONTHS,
  INVOLUNTARY_COEFFICIENTS,
  JOB_SEEKER_MONTHS,
  LGSS_ANCHOR,
  OFFICIAL_TOOLS,
  PARTIAL_CUT,
  PARTIAL_MAX_MONTHS,
  PARTIAL_MIN_CONTRIBUTION,
  PARTIAL_MIN_CONTRIBUTION_DISABILITY,
  PARTIAL_SENIORITY_YEARS,
  PHASE_IN,
  QUOTE,
  REDUCED_AGE_FLOOR,
  RULES_AS_OF,
  SOURCES,
  SUBSIDY_MONTHS,
  VOLUNTARY_COEFFICIENTS,
  type PhaseInRow,
  type YM,
} from "@/lib/programmatic/retirement-age/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { RetirementAgeCalculator } from "./RetirementAgeCalculator";

/**
 * "¿A qué edad me puedo jubilar?" / "A quina edat em puc jubilar?" / "When
 * can I retire in Spain?": the calculator (server-rendered on a person born
 * 20 June 1965 with 35 years contributed, on RULES_AS_OF), then the phase-in
 * table of DT 7ª as the BOE prints it, how the date is counted, early
 * retirement (arts. 207 and 208) with both coefficient tables, delayed,
 * active and partial retirement, lower ages, worked examples, the pension
 * amount (not estimated: links to the official simulator), questions,
 * sources and limits. Every figure comes from rules.ts through the engine.
 */

const L = <T,>(locale: RaLocale, v: Record<RaLocale, T>): T => v[locale];

export function retirementCrumbs(locale: RaLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: retirementMeta(locale).breadcrumb, href: retirementPath(locale) }];
}

export function retirementMetadata(locale: RaLocale): Metadata {
  const m = retirementMeta(locale);
  return buildMetadata({ locale, path: retirementPath(locale), title: m.title, description: m.description, translations: retirementEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

/** The DT 7ª cells: verbatim in Spanish, the same numbers in Catalan and English. */
function phaseInCells(row: PhaseInRow, locale: RaLocale): [string, string, string, string, string] {
  if (locale === "es") return [...row.cells];
  const Y = (p: YM) => ymText(p, locale);
  const year = row.year >= 2027 ? L(locale, { es: "", ca: "A partir del 2027", en: "From 2027" }) : String(row.year);
  return locale === "ca"
    ? [year, `${Y(row.threshold)} o més`, "65 anys", `Menys de ${Y(row.threshold)}`, Y(row.age)]
    : [year, `${Y(row.threshold)} or more`, "65", `Under ${Y(row.threshold)}`, Y(row.age)];
}

function earlyCell(e: EarlyOutcome, locale: RaLocale): string {
  if (e.status !== "ok") return L(locale, { es: "No (le falta cotización)", ca: "No (li falta cotització)", en: "No (not enough contributions)" });
  return `${day(e.date, locale)} · ${coef(e.coefficient, locale)}`;
}

function exampleLabel(id: ExampleId, locale: RaLocale): string {
  const labels: Record<ExampleId, Record<RaLocale, string>> = {
    "rule-65": { es: "Nacido el 20/06/1965, 35 años cotizados, sigue cotizando", ca: "Nascut el 20/06/1965, 35 anys cotitzats, continua cotitzant", en: "Born 20/06/1965, 35 years contributed, still contributing" },
    "age-67": { es: "Nacida el 10/03/1964, 30 años cotizados, sigue cotizando", ca: "Nascuda el 10/03/1964, 30 anys cotitzats, continua cotitzant", en: "Born 10/03/1964, 30 years contributed, still contributing" },
    "dec-2026": { es: "Nacido el 15/02/1960, 37 años cotizados", ca: "Nascut el 15/02/1960, 37 anys cotitzats", en: "Born 15/02/1960, 37 years contributed" },
    "apr-1960": { es: "Nacida el 15/04/1960, 37 años cotizados", ca: "Nascuda el 15/04/1960, 37 anys cotitzats", en: "Born 15/04/1960, 37 years contributed" },
    "long-career": { es: "Nacido el 10/09/1967, 38 años cotizados, sigue cotizando", ca: "Nascut el 10/09/1967, 38 anys cotitzats, continua cotitzant", en: "Born 10/09/1967, 38 years contributed, still contributing" },
    keeps: { es: "Nacida el 01/10/1966, 37 años cotizados, sigue cotizando", ca: "Nascuda l'01/10/1966, 37 anys cotitzats, continua cotitzant", en: "Born 01/10/1966, 37 years contributed, still contributing" },
    stops: { es: "La misma persona, si deja de cotizar hoy", ca: "La mateixa persona, si deixa de cotitzar avui", en: "The same person, if they stop contributing today" },
  };
  return labels[id][locale];
}

export function RetirementAgeRoute({ locale }: { locale: RaLocale }) {
  const meta = retirementMeta(locale);
  const crumbs = retirementCrumbs(locale);
  const h = headline();
  const faq = retirementFaq(locale);
  const Y = (p: YM) => ymText(p, locale);
  const P = (n: number) => whole(n, locale);
  const C = (n: number) => coef(n, locale);
  const D = (iso: string) => day(iso, locale);
  const on = (iso: string) => elDay(iso, locale);

  const lead = L(locale, {
    es: `En 2027 la edad de jubilación es de ${Y(h.y2027.age)}, o 65 si has cotizado al menos ${Y(h.y2027.threshold)}; en 2026 es de ${Y(h.y2026.age)}, o 65 con ${Y(h.y2026.threshold)}. Cuenta el año en que cumples la edad. Puedes adelantarla hasta 2 años (voluntaria, con ${Y(h.voluntaryMin)} cotizados) o hasta 4 (por despido, con ${Y(h.involuntaryMin)}), con un recorte por cada mes, o retrasarla y ganar un ${P(h.perYear)} por año. Pon tus datos y te damos la fecha exacta.`,
    ca: `El 2027 l'edat de jubilació és de ${Y(h.y2027.age)}, o 65 si has cotitzat com a mínim ${Y(h.y2027.threshold)}; el 2026 és de ${Y(h.y2026.age)}, o 65 amb ${Y(h.y2026.threshold)}. Compta l'any en què fas l'edat. La pots avançar fins a 2 anys (voluntària, amb ${Y(h.voluntaryMin)} cotitzats) o fins a 4 (per acomiadament, amb ${Y(h.involuntaryMin)}), amb una retallada per cada mes, o endarrerir-la i guanyar un ${P(h.perYear)} per any. Posa les teves dades i et donem la data exacta.`,
    en: `In 2027 Spain's retirement age is ${Y(h.y2027.age)}, or 65 if you have contributed at least ${Y(h.y2027.threshold)}; in 2026 it is ${Y(h.y2026.age)}, or 65 with ${Y(h.y2026.threshold)}. The year you reach the age is what counts. You can retire up to 2 years early (voluntary, with ${Y(h.voluntaryMin)} of contributions) or up to 4 (after dismissal, with ${Y(h.involuntaryMin)}), with a cut for each month, or delay it and gain ${P(h.perYear)} a year. Enter your details for the exact date.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE (Ley General de la Seguridad Social, texto consolidado con última actualización del 11/11/2026: arts. 205 a 215, 318 y disposición transitoria séptima) y en la Seguridad Social.`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE (Llei general de la Seguretat Social, text consolidat amb última actualització de l'11/11/2026: arts. 205 a 215, 318 i disposició transitòria setena) i a la Seguretat Social.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE (General Social Security Act, consolidated text last updated 11/11/2026: arts. 205 to 215, 318 and the seventh transitional provision) and with Social Security.`,
  });
  const disclaimer = L(locale, {
    es: "Simulación orientativa, no vinculante, con las normas del Régimen General y de autónomos. Tu edad exacta la fija la Seguridad Social con tu vida laboral real: lagunas, periodos por cuidado de hijos, pluriempleo o trabajos con edad reducida pueden cambiarla. Compruébala con la Seguridad Social:",
    ca: "Simulació orientativa, no vinculant, amb les normes del règim general i d'autònoms. La teva edat exacta la fixa la Seguretat Social amb la teva vida laboral real: llacunes, períodes per cura de fills, pluriocupació o feines amb edat reduïda la poden canviar. Comprova-la amb la Seguretat Social:",
    en: "An estimate for guidance only, not binding, under the rules for employees (Régimen General) and the self-employed. Social Security sets your exact age from your real working life: gaps, childcare periods, several jobs or work with a reduced age can change it. Check it with Social Security:",
  });
  const simulatorLink = L(locale, {
    es: "simulador de pensión de jubilación (Tu Seguridad Social)",
    ca: "simulador de pensió de jubilació (Tu Seguridad Social, en castellà)",
    en: "retirement pension simulator (Tu Seguridad Social, in Spanish)",
  });

  const hd = L(locale, {
    es: { table: "Edad de jubilación por año: la tabla del BOE", count: "Cómo se calcula tu fecha", involuntary: "Jubilación anticipada por despido o cese involuntario", voluntary: "Jubilación anticipada voluntaria", coef: "Coeficientes reductores: cuánto se recorta por mes", coefInv: "Anticipada involuntaria: hasta 48 meses", coefVol: "Anticipada voluntaria: hasta 24 meses", delay: "Jubilación demorada: cuánto ganas", active: "Jubilación activa y jubilación parcial", special: "Edades más bajas: actividad, discapacidad y mutualistas", examples: "Ejemplos", amount: "¿Y cuánto cobraré?", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { table: "Edat de jubilació per any: la taula del BOE", count: "Com es calcula la teva data", involuntary: "Jubilació anticipada per acomiadament o cessament involuntari", voluntary: "Jubilació anticipada voluntària", coef: "Coeficients reductors: quant es retalla per mes", coefInv: "Anticipada involuntària: fins a 48 mesos", coefVol: "Anticipada voluntària: fins a 24 mesos", delay: "Jubilació demorada: quant hi guanyes", active: "Jubilació activa i jubilació parcial", special: "Edats més baixes: activitat, discapacitat i mutualistes", examples: "Exemples", amount: "I quant cobraré?", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { table: "Retirement age by year: the BOE table", count: "How your date is worked out", involuntary: "Early retirement after dismissal or involuntary job loss", voluntary: "Voluntary early retirement", coef: "Reduction coefficients: the cut per month", coefInv: "Involuntary early retirement: up to 48 months", coefVol: "Voluntary early retirement: up to 24 months", delay: "Delayed retirement: what you gain", active: "Active and partial retirement", special: "Lower ages: activity, disability and mutualistas", examples: "Worked examples", amount: "And how much will I get?", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  const lgss = (art: string) => L(locale, { es: `Ley General de la Seguridad Social, ${art}`, ca: `Llei general de la Seguretat Social, ${art}`, en: `General Social Security Act, ${art}` });
  const ss = L(locale, { es: "Seguridad Social", ca: "Seguretat Social (en castellà)", en: "Social Security (in Spanish)" });

  /* Table ---------------------------------------------------------------- */
  const tableCols = L(locale, {
    es: ["Año", "Períodos cotizados", "Edad exigida", "Períodos cotizados", "Edad exigida"],
    ca: ["Any", "Períodes cotitzats", "Edat exigida", "Períodes cotitzats", "Edat exigida"],
    en: ["Year", "Contributions", "Age required", "Contributions", "Age required"],
  });
  const tableCaption = L(locale, {
    es: `Disposición transitoria séptima de la Ley General de la Seguridad Social, como la publica el BOE (texto consolidado, leído ${on(RULES_AS_OF)}).`,
    ca: `Disposició transitòria setena de la Llei general de la Seguretat Social; l'original, en castellà, al BOE (text consolidat, llegit ${on(RULES_AS_OF)}).`,
    en: `Seventh transitional provision of the General Social Security Act; the original, in Spanish, in the BOE (consolidated text, read ${on(RULES_AS_OF)}).`,
  });
  const tableNote = L(locale, {
    es: `**Desde el 1 de enero de 2027 la tabla se acaba**: ${Y(h.y2027.age)}, o 65 con ${Y(h.y2027.threshold)} cotizados, para siempre (art. 205.1.a). En 2026, ${Y(h.y2026.age)}, o 65 con ${Y(h.y2026.threshold)}.`,
    ca: `**Des de l'1 de gener de 2027 la taula s'acaba**: ${Y(h.y2027.age)}, o 65 amb ${Y(h.y2027.threshold)} cotitzats, per sempre (art. 205.1.a). El 2026, ${Y(h.y2026.age)}, o 65 amb ${Y(h.y2026.threshold)}.`,
    en: `**From 1 January 2027 the table ends**: ${Y(h.y2027.age)}, or 65 with ${Y(h.y2027.threshold)} of contributions, for good (art. 205.1.a). In 2026, ${Y(h.y2026.age)}, or 65 with ${Y(h.y2026.threshold)}.`,
  });

  /* How it is counted ----------------------------------------------------- */
  const ex = Object.fromEntries(examples().map((e) => [e.id, e])) as Record<ExampleId, ReturnType<typeof examples>[number]>;
  const countItems = L(locale, {
    es: [
      `**Cuenta el año en que cumples la edad.** Quien nació el 15/02/1960 cumple ${Y(ex["dec-2026"].result.ordinary.age)} el ${D(ex["dec-2026"].result.ordinary.date)}, dentro de 2026. Quien nació el 15/04/1960 los cumpliría en febrero de 2027, que ya pide ${Y(h.y2027.age)}: se jubila el ${D(ex["apr-1960"].result.ordinary.date)}.`,
      "**De fecha a fecha** desde el día en que naciste; si el mes no tiene ese día (un 31, un 29 de febrero), el último día del mes.",
      "**Años y meses completos**, sin la parte proporcional de las pagas extra. Cuentan también como cotizados los periodos por cuidado de hijos o menores, los de excedencia que la ley asimila y los días asimilados por parto.",
      `**Si sigues cotizando**, la regla de los 65 se mira con lo que tendrás entonces. Es lo mismo que hace la Seguridad Social en su informe de edad legal de jubilación.`,
      `**Hacen falta al menos ${Y(h.minimum)} cotizados**, dos de ellos en los quince años antes de jubilarte, para tener pensión contributiva.`,
    ],
    ca: [
      `**Compta l'any en què fas l'edat.** Qui va néixer el 15/02/1960 fa ${Y(ex["dec-2026"].result.ordinary.age)} el ${D(ex["dec-2026"].result.ordinary.date)}, dins del 2026. Qui va néixer el 15/04/1960 els faria el febrer del 2027, que ja demana ${Y(h.y2027.age)}: es jubila el ${D(ex["apr-1960"].result.ordinary.date)}.`,
      "**De data a data** des del dia en què vas néixer; si el mes no té aquell dia (un 31, un 29 de febrer), l'últim dia del mes.",
      "**Anys i mesos complets**, sense la part proporcional de les pagues extra. També compten com a cotitzats els períodes per cura de fills o menors, els d'excedència que la llei assimila i els dies assimilats per part.",
      `**Si continues cotitzant**, la regla dels 65 es mira amb el que tindràs aleshores. És el mateix que fa la Seguretat Social al seu informe d'edat legal de jubilació.`,
      `**Calen com a mínim ${Y(h.minimum)} cotitzats**, dos dels quals en els quinze anys abans de jubilar-te, per tenir pensió contributiva.`,
    ],
    en: [
      `**The year you reach the age counts.** Someone born on 15/02/1960 turns ${Y(ex["dec-2026"].result.ordinary.age)} on ${D(ex["dec-2026"].result.ordinary.date)}, within 2026. Someone born on 15/04/1960 would reach it in February 2027, which already asks for ${Y(h.y2027.age)}: they retire on ${D(ex["apr-1960"].result.ordinary.date)}.`,
      "**Date to date** from your date of birth; if the month has no such day (a 31st, 29 February), the last day of the month.",
      "**Whole years and months**, without the proportional share of the extra payments. Childcare periods, the leave of absence the law treats as contributed and the days credited for giving birth also count.",
      `**If you keep contributing**, the 65 rule is checked with what you will have by then. Social Security does the same in its legal retirement age report.`,
      `**You need at least ${Y(h.minimum)} of contributions**, two of them within the fifteen years before retiring, for a contributory pension.`,
    ],
  });

  /* Early retirement ------------------------------------------------------ */
  const involuntaryItems = L(locale, {
    es: [
      `Hasta **4 años antes** de tu edad ordinaria (${EARLY_MAX_MONTHS.involuntary} meses).`,
      `**${Y(h.involuntaryMin)} cotizados de forma efectiva**, sin la parte de pagas extra; del servicio militar o la prestación social sustitutoria solo cuenta un año.`,
      `**${JOB_SEEKER_MONTHS} meses inscrito como demandante de empleo** justo antes de pedirla.`,
      "**Un cese que no depende de ti**: despido colectivo (art. 51 del Estatuto de los Trabajadores), despido objetivo (art. 52), extinción por resolución judicial en un concurso, muerte, jubilación o incapacidad del empresario individual o extinción de la empresa, fuerza mayor, baja voluntaria por traslado, modificación sustancial o incumplimiento grave de la empresa (arts. 40.1, 41.3 y 50) y la extinción por ser víctima de violencia de género o sexual.",
      "En el despido colectivo, el objetivo y los arts. 40.1, 41.3 y 50, hay que acreditar que **cobraste la indemnización o que la reclamaste** en el juzgado.",
      "**No existe para autónomos**: el art. 318.d no incluye el art. 207 entre las normas de jubilación del régimen de autónomos.",
    ],
    ca: [
      `Fins a **4 anys abans** de la teva edat ordinària (${EARLY_MAX_MONTHS.involuntary} mesos).`,
      `**${Y(h.involuntaryMin)} cotitzats de manera efectiva**, sense la part de pagues extra; del servei militar o la prestació social substitutòria només compta un any.`,
      `**${JOB_SEEKER_MONTHS} mesos inscrit com a demandant d'ocupació** just abans de demanar-la.`,
      "**Un cessament que no depèn de tu**: acomiadament col·lectiu (art. 51 de l'Estatut dels treballadors), acomiadament objectiu (art. 52), extinció per resolució judicial en un concurs, mort, jubilació o incapacitat de l'empresari individual o extinció de l'empresa, força major, baixa voluntària per trasllat, modificació substancial o incompliment greu de l'empresa (arts. 40.1, 41.3 i 50) i l'extinció per ser víctima de violència de gènere o sexual.",
      "En l'acomiadament col·lectiu, l'objectiu i els arts. 40.1, 41.3 i 50, cal acreditar que **vas cobrar la indemnització o que la vas reclamar** al jutjat.",
      "**No existeix per als autònoms**: l'art. 318.d no inclou l'art. 207 entre les normes de jubilació del règim d'autònoms.",
    ],
    en: [
      `Up to **4 years before** your ordinary age (${EARLY_MAX_MONTHS.involuntary} months).`,
      `**${Y(h.involuntaryMin)} of effective contributions**, without the extra-payment share; only one year of military or substitute social service counts.`,
      `**${JOB_SEEKER_MONTHS} months registered as a job seeker** right before applying.`,
      "**A job loss that was not your choice**: collective dismissal (Workers' Statute art. 51), objective dismissal (art. 52), termination by a court in insolvency, death, retirement or incapacity of an individual employer or the end of the company, force majeure, resigning over relocation, a substantial change or a serious breach by the employer (arts. 40.1, 41.3 and 50), and termination as a victim of gender or sexual violence.",
      "For collective and objective dismissals and arts. 40.1, 41.3 and 50 you must show **you were paid the severance or claimed it** in court.",
      "**Not available to the self-employed**: art. 318.d leaves art. 207 out of the retirement rules of the self-employed regime.",
    ],
  });
  const voluntaryItems = L(locale, {
    es: [
      `Hasta **2 años antes** de tu edad ordinaria (${EARLY_MAX_MONTHS.voluntary} meses), en cualquier régimen, también como autónomo.`,
      `**${Y(h.voluntaryMin)} cotizados de forma efectiva**, sin la parte de pagas extra; del servicio militar o la prestación social solo cuenta un año.`,
      "**Estar de alta o en situación asimilada** cuando la pides.",
      "**La pensión que te quede tiene que superar la pensión mínima** que te correspondería a los 65 por tu situación familiar; si no, no puedes jubilarte así.",
      `Si cobras el **subsidio por desempleo** desde hace al menos ${SUBSIDY_MONTHS} meses, se aplican los coeficientes de la anticipada involuntaria (más suaves).`,
    ],
    ca: [
      `Fins a **2 anys abans** de la teva edat ordinària (${EARLY_MAX_MONTHS.voluntary} mesos), en qualsevol règim, també com a autònom.`,
      `**${Y(h.voluntaryMin)} cotitzats de manera efectiva**, sense la part de pagues extra; del servei militar o la prestació social només compta un any.`,
      "**Estar d'alta o en situació assimilada** quan la demanes.",
      "**La pensió que et quedi ha de superar la pensió mínima** que et correspondria als 65 per la teva situació familiar; si no, no et pots jubilar així.",
      `Si cobres el **subsidi per desocupació** des de fa com a mínim ${SUBSIDY_MONTHS} mesos, s'apliquen els coeficients de l'anticipada involuntària (més suaus).`,
    ],
    en: [
      `Up to **2 years before** your ordinary age (${EARLY_MAX_MONTHS.voluntary} months), in any regime, the self-employed included.`,
      `**${Y(h.voluntaryMin)} of effective contributions**, without the extra-payment share; only one year of military or social service counts.`,
      "**Being registered (alta) or in an equivalent situation** when you apply.",
      "**The pension left must be above the minimum pension** you would get at 65 for your family situation; otherwise you cannot retire this way.",
      `If you have been on the **unemployment subsidy** for at least ${SUBSIDY_MONTHS} months, the involuntary coefficients (lower) apply.`,
    ],
  });

  /* Coefficients ---------------------------------------------------------- */
  const coefText = L(locale, {
    es: [
      "La pensión se recorta **por cada mes o fracción de mes** que te falte para la edad ordinaria, con el porcentaje de la fila de esos meses y la columna de lo que tengas cotizado ese día. El recorte es para siempre.",
      "La edad ordinaria con la que se cuenta es **la que tendrías si siguieras cotizando** desde el día en que te jubilas: por eso la calculadora lo supone así para la anticipada, aunque marques que no seguirás cotizando.",
      "**Desde el 1 de enero de 2022 los coeficientes son mensuales** (Ley 21/2021); antes eran por trimestre. El trimestre solo queda en un tope: en la anticipada involuntaria, la pensión no puede pasar de la pensión máxima rebajada un 0,50 % por trimestre o fracción de adelanto (art. 210.4). Si tu pensión superaría la máxima, en la voluntaria se aplica una tabla transitoria (disposición transitoria trigésima cuarta) que no calculamos.",
    ],
    ca: [
      "La pensió es retalla **per cada mes o fracció de mes** que et falti per a l'edat ordinària, amb el percentatge de la fila d'aquells mesos i la columna del que tinguis cotitzat aquell dia. La retallada és per sempre.",
      "L'edat ordinària amb què es compta és **la que tindries si continuessis cotitzant** des del dia en què et jubiles: per això la calculadora ho suposa així per a l'anticipada, encara que marquis que no continuaràs cotitzant.",
      "**Des de l'1 de gener de 2022 els coeficients són mensuals** (Llei 21/2021); abans eren per trimestre. El trimestre només queda en un límit: en l'anticipada involuntària, la pensió no pot passar de la pensió màxima rebaixada un 0,50 % per trimestre o fracció d'avançament (art. 210.4). Si la teva pensió superaria la màxima, en la voluntària s'aplica una taula transitòria (disposició transitòria trenta-quatrena) que no calculem.",
    ],
    en: [
      "The pension is cut **for each month or part of a month** left until your ordinary age, by the percentage in the row for those months and the column for what you have contributed on that day. The cut is for life.",
      "The ordinary age it is measured against is **the one you would have if you kept contributing** from the day you retire: that is why the calculator assumes so for early retirement, even if you say you will not keep contributing.",
      "**Since 1 January 2022 the coefficients are monthly** (Law 21/2021); before, they were per quarter. The quarter survives only as a cap: in involuntary early retirement the pension cannot exceed the maximum pension reduced by 0.50% per quarter or part of a quarter early (art. 210.4). If your pension would exceed the maximum, voluntary early retirement uses a transitional table (thirty-fourth transitional provision) that we do not compute.",
    ],
  });
  const coefCols = L(locale, { es: "Meses de adelanto", ca: "Mesos d'avançament", en: "Months early" });
  const coefCaption = L(locale, {
    es: "Porcentaje de reducción de la pensión según el período cotizado, como lo publica el BOE.",
    ca: "Percentatge de reducció de la pensió segons el període cotitzat, com el publica el BOE.",
    en: "Percentage cut of the pension by contribution period, as the BOE prints it.",
  });

  /* Delay ------------------------------------------------------------------ */
  const delayCols = L(locale, {
    es: ["Retraso después de la edad ordinaria", "Pensión más alta", "Si sigues trabajando (jubilación activa)"],
    ca: ["Retard després de l'edat ordinària", "Pensió més alta", "Si continues treballant (jubilació activa)"],
    en: ["Delay after the ordinary age", "Higher pension", "If you keep working (active retirement)"],
  });
  const delayText = L(locale, {
    es: [
      `Por cada **año completo cotizado** después de la edad ordinaria, la pensión sube un **${P(h.perYear)}**. Desde el segundo año completo, un periodo de **más de 6 meses** suma un ${P(h.halfYear)} más. Hace falta tener ${Y(h.minimum)} cotizados al llegar a la edad ordinaria.`,
      "En lugar del porcentaje puedes elegir **un pago único** por cada año (su fórmula depende de tu pensión inicial y de los años cotizados) o **una combinación** de los dos, desde dos años de demora. Se elige una vez, al pedir la pensión; si no eliges, se aplica el porcentaje. El simulador oficial calcula las tres opciones.",
      "El complemento por demora es **compatible con la jubilación activa** desde el 1 de abril de 2025, pero lo que cotices en jubilación activa ya no lo aumenta.",
    ],
    ca: [
      `Per cada **any complet cotitzat** després de l'edat ordinària, la pensió puja un **${P(h.perYear)}**. Des del segon any complet, un període de **més de 6 mesos** suma un ${P(h.halfYear)} més. Cal tenir ${Y(h.minimum)} cotitzats en arribar a l'edat ordinària.`,
      "En lloc del percentatge pots triar **un pagament únic** per cada any (la fórmula depèn de la pensió inicial i dels anys cotitzats) o **una combinació** de tots dos, des de dos anys de demora. Es tria una vegada, quan demanes la pensió; si no tries, s'aplica el percentatge. El simulador oficial calcula les tres opcions.",
      "El complement per demora és **compatible amb la jubilació activa** des de l'1 d'abril de 2025, però el que cotitzis en jubilació activa ja no l'augmenta.",
    ],
    en: [
      `For each **full year contributed** after the ordinary age, the pension rises by **${P(h.perYear)}**. From the second full year, a period of **more than 6 months** adds another ${P(h.halfYear)}. You need ${Y(h.minimum)} of contributions when you reach the ordinary age.`,
      "Instead of the percentage you can choose **a lump sum** per year (its formula depends on your initial pension and years contributed) or **a mix** of both, from two years of delay. You choose once, when applying; if you do not, the percentage applies. The official simulator works out all three.",
      "The delay bonus has been **compatible with active retirement** since 1 April 2025, but contributions made in active retirement no longer increase it.",
    ],
  });
  const delayReading = L(locale, {
    es: "El 2 % por «periodos superiores a 6 meses» lo aplicamos solo cuando ya hay dos años completos de demora, como dice el BOE («A partir del segundo año completo»): 1 año y 7 meses dan un 4 %; 2 años y 7 meses, un 10 %, como en el ejemplo de la Revista de la Seguridad Social.",
    ca: "El 2 % per «periodos superiores a 6 meses» l'apliquem només quan ja hi ha dos anys complets de demora, com diu el BOE («A partir del segundo año completo»): 1 any i 7 mesos donen un 4 %; 2 anys i 7 mesos, un 10 %, com a l'exemple de la Revista de la Seguridad Social.",
    en: "We apply the 2% for «periodos superiores a 6 meses» only once two full years of delay are complete, as the BOE says («A partir del segundo año completo»): 1 year 7 months gives 4%; 2 years 7 months gives 10%, as in the Revista de la Seguridad Social's example.",
  });

  /* Active and partial ------------------------------------------------------ */
  const activeText = L(locale, {
    es: [
      `**Jubilación activa**: si te jubilas al menos un año después de tu edad ordinaria, puedes cobrar parte de la pensión y trabajar (por cuenta ajena o como autónomo): 45 % con un año de demora, 55 % con dos, 65 % con tres, 80 % con cuatro y 100 % con cinco o más, y ${ACTIVE_STEP} puntos más por cada 12 meses seguidos en jubilación activa. No vale si te jubilaste anticipadamente.`,
      `**Jubilación parcial**: reduces la jornada entre un ${P(PARTIAL_CUT.min)} y un ${P(PARTIAL_CUT.max)} y cobras la parte de pensión que corresponde. Desde la edad ordinaria, sin más. Antes, hasta ${PARTIAL_MAX_MONTHS / 12} años antes, solo si la empresa firma a la vez un contrato de relevo, con ${Y(PARTIAL_MIN_CONTRIBUTION)} cotizados (${Y(PARTIAL_MIN_CONTRIBUTION_DISABILITY)} con una discapacidad del 33 % o más) y ${PARTIAL_SENIORITY_YEARS} años en la empresa.`,
    ],
    ca: [
      `**Jubilació activa**: si et jubiles com a mínim un any després de l'edat ordinària, pots cobrar part de la pensió i treballar (per compte d'altri o com a autònom): 45 % amb un any de demora, 55 % amb dos, 65 % amb tres, 80 % amb quatre i 100 % amb cinc o més, i ${ACTIVE_STEP} punts més per cada 12 mesos seguits en jubilació activa. No val si et vas jubilar anticipadament.`,
      `**Jubilació parcial**: redueixes la jornada entre un ${P(PARTIAL_CUT.min)} i un ${P(PARTIAL_CUT.max)} i cobres la part de pensió que correspon. Des de l'edat ordinària, sense més. Abans, fins a ${PARTIAL_MAX_MONTHS / 12} anys abans, només si l'empresa signa alhora un contracte de relleu, amb ${Y(PARTIAL_MIN_CONTRIBUTION)} cotitzats (${Y(PARTIAL_MIN_CONTRIBUTION_DISABILITY)} amb una discapacitat del 33 % o més) i ${PARTIAL_SENIORITY_YEARS} anys a l'empresa.`,
    ],
    en: [
      `**Active retirement (jubilación activa)**: if you retire at least a year after your ordinary age, you can draw part of the pension and work (employed or self-employed): 45% after one year of delay, 55% after two, 65% after three, 80% after four and 100% after five or more, plus ${ACTIVE_STEP} points for each 12 months in a row in active retirement. Not if you retired early.`,
      `**Partial retirement**: you cut your working time by ${P(PARTIAL_CUT.min)} to ${P(PARTIAL_CUT.max)} and draw the matching share of the pension. From the ordinary age, with no further condition. Before it, up to ${PARTIAL_MAX_MONTHS / 12} years early, only if the employer signs a relief contract (contrato de relevo) at the same time, with ${Y(PARTIAL_MIN_CONTRIBUTION)} of contributions (${Y(PARTIAL_MIN_CONTRIBUTION_DISABILITY)} with a disability of 33% or more) and ${PARTIAL_SENIORITY_YEARS} years in the company.`,
    ],
  });
  const specialText = L(locale, {
    es: `Algunas profesiones (por ejemplo, minería, personal de vuelo, ferroviarios, bomberos o la Ertzaintza) y las personas con una discapacidad del 65 % o más, o del 45 % en las que fija un real decreto, tienen una edad más baja, con coeficientes propios; nunca por debajo de ${REDUCED_AGE_FLOOR} años. Quien cotizó a una mutualidad laboral antes del 1 de enero de 1967 puede jubilarse antes con la legislación anterior. Estos casos no los calcula esta página: mira la Seguridad Social.`,
    ca: `Algunes professions (per exemple, mineria, personal de vol, ferroviaris, bombers o l'Ertzaintza) i les persones amb una discapacitat del 65 % o més, o del 45 % en les que fixa un reial decret, tenen una edat més baixa, amb coeficients propis; mai per sota de ${REDUCED_AGE_FLOOR} anys. Qui va cotitzar a una mutualitat laboral abans de l'1 de gener de 1967 es pot jubilar abans amb la legislació anterior. Aquests casos no els calcula aquesta pàgina: mira la Seguretat Social.`,
    en: `Some occupations (for example mining, flight crew, railway workers, firefighters or the Ertzaintza) and people with a disability of 65% or more, or 45% in the conditions a royal decree sets, have a lower age with their own coefficients; never below ${REDUCED_AGE_FLOOR}. Whoever contributed to a mutualidad laboral before 1 January 1967 can retire earlier under the previous legislation. This page does not compute these cases: see Social Security.`,
  });

  /* Examples ----------------------------------------------------------------- */
  const exCols = L(locale, {
    es: ["Persona", "Edad ordinaria", "Anticipada involuntaria (lo antes posible)", "Anticipada voluntaria (lo antes posible)"],
    ca: ["Persona", "Edat ordinària", "Anticipada involuntària (com més aviat millor)", "Anticipada voluntària (com més aviat millor)"],
    en: ["Person", "Ordinary age", "Involuntary early (earliest)", "Voluntary early (earliest)"],
  });
  const exNote = L(locale, {
    es: `Calculado ${on(RULES_AS_OF)}, con lo cotizado hasta ese día; las personas son supuestas, las reglas son las del BOE. En la anticipada, la fecha y el recorte de la pensión.`,
    ca: `Calculat ${on(RULES_AS_OF)}, amb el que s'ha cotitzat fins aquell dia; les persones són suposades, les regles són les del BOE. En l'anticipada, la data i la retallada de la pensió.`,
    en: `Worked out ${on(RULES_AS_OF)}, with contributions up to that day; the people are hypothetical, the rules are the BOE's. For early retirement, the date and the cut of the pension.`,
  });

  /* Amount -------------------------------------------------------------------- */
  const amountText = L(locale, {
    es: "Esta página no estima el importe: la pensión sale de tu base reguladora (tus bases de cotización de los últimos 25 años o más, actualizadas con el IPC) y de un porcentaje según los años cotizados, y eso solo lo tiene la Seguridad Social. Su simulador lo calcula con tu vida laboral; nosotros no te pedimos ningún dato personal.",
    ca: "Aquesta pàgina no n'estima l'import: la pensió surt de la teva base reguladora (les bases de cotització dels últims 25 anys o més, actualitzades amb l'IPC) i d'un percentatge segons els anys cotitzats, i això només ho té la Seguretat Social. El seu simulador ho calcula amb la teva vida laboral; nosaltres no et demanem cap dada personal.",
    en: "This page does not estimate the amount: the pension comes from your regulatory base (your contribution bases over the last 25 years or more, updated with the CPI) and a percentage by years contributed, and only Social Security has those. Its simulator works it out from your working life; we never ask for personal data.",
  });
  const links = L(locale, {
    es: { pension: "Subida de las pensiones 2027: cuánto sube tu pensión en enero", pay: "Cuándo se cobra la pensión: calendario de pagos y pagas extra", pnc: "Pensión no contributiva (IMSERSO), si no llegas a 15 años cotizados" },
    ca: { pension: "Pujada de les pensions 2027: quant puja la teva pensió el gener", pay: "Quan es cobra la pensió: calendari de pagaments i pagues extra", pnc: "Pensió no contributiva (IMSERSO, en castellà), si no arribes a 15 anys cotitzats" },
    en: { pension: "Spain's 2027 pension increase: how much your pension rises in January", pay: "When pensions are paid: payment calendar and extra payments", pnc: "Non-contributory pension (IMSERSO, in Spanish), if you do not reach 15 years" },
  });

  /* Sources and limits ----------------------------------------------------------- */
  const sourcesLead = L(locale, {
    es: `Todo leído ${on(RULES_AS_OF)}; las citas son literales y las tablas, copiadas celda a celda del BOE.`,
    ca: `Tot llegit ${on(RULES_AS_OF)}; les cites són literals, en castellà, i les taules, copiades cel·la a cel·la del BOE.`,
    en: `All read ${on(RULES_AS_OF)}; quotes are verbatim, in Spanish, and the tables are copied cell by cell from the BOE.`,
  });
  const limits = L(locale, {
    es: [
      "El importe de la pensión y la cantidad del pago único por demora.",
      "Edades reducidas por actividad o discapacidad, la jubilación de mutualistas (antes de 1967) y las normas de Clases Pasivas (funcionarios del Estado).",
      "Lo cotizado se cuenta en meses completos a partir del día del cálculo; la Seguridad Social lo cuenta en días (años de 365 días, meses de 30,41666) y suma periodos asimilados.",
      "Para fechas pasadas supone que cotizaste sin interrupción hasta hoy.",
      "Si llegarías a 38 años y 6 meses cotizados entre los 65 y los 67, damos el día en que los cumplirías; la Seguridad Social fija tu caso.",
      "No comprueba los dos años cotizados en los últimos quince, la inscripción como demandante de empleo ni la causa del cese.",
    ],
    ca: [
      "L'import de la pensió i la quantitat del pagament únic per demora.",
      "Edats reduïdes per activitat o discapacitat, la jubilació de mutualistes (abans del 1967) i les normes de Classes Passives (funcionaris de l'Estat).",
      "El que s'ha cotitzat es compta en mesos complets a partir del dia del càlcul; la Seguretat Social ho compta en dies (anys de 365 dies, mesos de 30,41666) i hi suma períodes assimilats.",
      "Per a dates passades suposa que vas cotitzar sense interrupció fins avui.",
      "Si arribaries a 38 anys i 6 mesos cotitzats entre els 65 i els 67, donem el dia en què els compliries; la Seguretat Social fixa el teu cas.",
      "No comprova els dos anys cotitzats en els últims quinze, la inscripció com a demandant d'ocupació ni la causa del cessament.",
    ],
    en: [
      "The pension amount and the lump-sum delay payment.",
      "Ages reduced by occupation or disability, mutualistas (before 1967) and the rules for Clases Pasivas (state civil servants).",
      "Contributions are counted in whole months from the day of the calculation; Social Security counts days (365-day years, 30.41666-day months) and adds credited periods.",
      "For past dates it assumes you contributed without a break up to today.",
      "If you would reach 38 years 6 months of contributions between 65 and 67, we give the day you would reach them; Social Security decides your case.",
      "It does not check the two years contributed within the last fifteen, registration as a job seeker or the cause of the job loss.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(retirementPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const coefTable = (rows: typeof INVOLUNTARY_COEFFICIENTS, caption: string) => (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{coefCols}</th>
            {COLUMNS.map((c) => (
              <th key={c} scope="col">
                {COLUMN_LABEL[c][locale]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([months, values]) => (
            <tr key={months}>
              <th scope="row" className="font-normal">
                {monthsText(months, locale)}
              </th>
              {values.map((v, i) => (
                <td key={COLUMNS[i]} data-label={COLUMN_SHORT[COLUMNS[i]!][locale]}>
                  {C(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <SiteHeader locale={locale} translations={retirementEditions()} />
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
              <RetirementAgeCalculator locale={locale} initial={DEFAULT_INPUT} asOf={RULES_AS_OF} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={OFFICIAL_TOOLS.simulator}>{simulatorLink}</A>.
              </p>
              <CalculatorNextStep current="retirement-age" locale={locale} />

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <h2 id="tabla">{hd.table}</h2>
              <p>{md(tableNote)}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table" lang={locale === "es" ? "es" : undefined}>
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{tableCaption}</caption>
                  <thead>
                    <tr>
                      {tableCols.map((c, i) => (
                        <th key={i} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PHASE_IN.map((row) => {
                      const cells = phaseInCells(row, locale);
                      const now = row.year >= 2026;
                      return (
                        <tr key={row.year}>
                          <th scope="row" className={now ? undefined : "font-normal"}>
                            {cells[0]}
                          </th>
                          {cells.slice(1).map((c, i) => (
                            <td key={i} data-label={tableCols[i + 1]}>
                              {now ? <strong>{c}</strong> : c}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.art205a} href={LGSS_ANCHOR.art205} label={lgss("art. 205.1.a")} />
              <Quote text={QUOTE.dt7} href={LGSS_ANCHOR.dt7} label={lgss(L(locale, { es: "disposición transitoria séptima", ca: "disposició transitòria setena", en: "seventh transitional provision" }))} />

              <h2 id="como-se-calcula">{hd.count}</h2>
              <ul>
                {countItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art205count} href={LGSS_ANCHOR.art205} label={lgss("art. 205.1.a")} />
              <Quote text={QUOTE.ssDateToDate} href={SOURCES.ssRequisitos.url} label={`${ss}, ${L(locale, { es: "requisitos de la jubilación ordinaria", ca: "requisits de la jubilació ordinària", en: "ordinary retirement requirements" })}`} />
              <Quote text={QUOTE.ssPremise} href={SOURCES.revistaInforme.url} label={L(locale, { es: "Revista de la Seguridad Social, 30/09/2026", ca: "Revista de la Seguridad Social, 30/09/2026", en: "Revista de la Seguridad Social, 30/09/2026" })} />
              <Quote text={QUOTE.art205b} href={LGSS_ANCHOR.art205} label={lgss("art. 205.1.b")} />

              <h2 id="anticipada-involuntaria">{hd.involuntary}</h2>
              <ul>
                {involuntaryItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art207a} href={LGSS_ANCHOR.art207} label={lgss("art. 207.1.a")} />
              <Quote text={QUOTE.art207b} href={LGSS_ANCHOR.art207} label={lgss("art. 207.1.b")} />
              <Quote text={QUOTE.art207c} href={LGSS_ANCHOR.art207} label={lgss("art. 207.1.c")} />
              <Quote text={QUOTE.art318d} href={LGSS_ANCHOR.art318} label={lgss("art. 318.d")} />

              <h2 id="anticipada-voluntaria">{hd.voluntary}</h2>
              <ul>
                {voluntaryItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art208a} href={LGSS_ANCHOR.art208} label={lgss("art. 208.1.a")} />
              <Quote text={QUOTE.art208b} href={LGSS_ANCHOR.art208} label={lgss("art. 208.1.b")} />
              <Quote text={QUOTE.art208c} href={LGSS_ANCHOR.art208} label={lgss("art. 208.1.c")} />
              <Quote text={QUOTE.art208_3} href={LGSS_ANCHOR.art208} label={lgss("art. 208.3")} />
              <Quote text={QUOTE.ssAnyRegime} href={SOURCES.ssVoluntaria.url} label={`${ss}, ${L(locale, { es: "jubilación anticipada por voluntad del trabajador", ca: "jubilació anticipada per voluntat del treballador", en: "voluntary early retirement" })}`} />

              <h2 id="coeficientes">{hd.coef}</h2>
              {coefText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.perMonth} href={LGSS_ANCHOR.art207} label={lgss(L(locale, { es: "arts. 207.2 y 208.2", ca: "arts. 207.2 i 208.2", en: "arts. 207.2 and 208.2" }))} />
              <Quote text={QUOTE.fiction} href={LGSS_ANCHOR.art207} label={lgss(L(locale, { es: "arts. 207.2 y 208.2", ca: "arts. 207.2 i 208.2", en: "arts. 207.2 and 208.2" }))} />
              <h3 id="coeficientes-involuntaria">{hd.coefInv}</h3>
              {coefTable(INVOLUNTARY_COEFFICIENTS, `${coefCaption} ${lgss("art. 207.2")}.`)}
              <h3 id="coeficientes-voluntaria">{hd.coefVol}</h3>
              {coefTable(VOLUNTARY_COEFFICIENTS, `${coefCaption} ${lgss("art. 208.2")}.`)}
              <Quote text={QUOTE.art210_4} href={LGSS_ANCHOR.art210} label={lgss("art. 210.4")} />

              <h2 id="demorada">{hd.delay}</h2>
              {delayText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {delayCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {delayTable().map((row) => (
                      <tr key={row.months}>
                        <th scope="row" className="font-normal">
                          {Y({ y: Math.floor(row.months / 12), m: row.months % 12 })}
                        </th>
                        <td data-label={delayCols[1]}>
                          <strong>+{P(row.bonus)}</strong>
                        </td>
                        <td data-label={delayCols[2]}>{row.active === null ? "—" : P(row.active)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{delayReading}</p>
              <Quote text={QUOTE.art210_2} href={LGSS_ANCHOR.art210} label={lgss("art. 210.2")} />
              <Quote text={`${QUOTE.art210_2a} ${QUOTE.art210_2aHalf}`} href={LGSS_ANCHOR.art210} label={lgss(L(locale, { es: "art. 210.2.a (Real Decreto-ley 11/2024)", ca: "art. 210.2.a (Reial decret llei 11/2024)", en: "art. 210.2.a (Royal Decree-law 11/2024)" }))} />

              <h2 id="activa-parcial">{hd.active}</h2>
              {activeText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={`${QUOTE.art214a} […] ${QUOTE.art214e}`} href={LGSS_ANCHOR.art214} label={lgss("art. 214.2")} />
              <Quote text={QUOTE.art215} href={LGSS_ANCHOR.art215} label={lgss("art. 215.2.a")} />
              <ul>
                <li>
                  <A href={SOURCES.ssActiva.url}>{`${ss}: ${L(locale, { es: "pensión de jubilación activa", ca: "pensió de jubilació activa", en: "active retirement pension" })}`}</A>
                </li>
                <li>
                  <A href={SOURCES.ssParcial.url}>{`${ss}: ${L(locale, { es: "jubilación parcial", ca: "jubilació parcial", en: "partial retirement" })}`}</A>
                </li>
              </ul>

              <h2 id="casos-especiales">{hd.special}</h2>
              <p>{specialText}</p>
              <Quote text={QUOTE.floor52} href={LGSS_ANCHOR.art206bis} label={lgss("art. 206 bis.2")} />
              <p className="text-sm">
                <A href={SOURCES.ssModalidades.url}>
                  {`${ss}: ${L(locale, { es: "todas las modalidades de jubilación", ca: "totes les modalitats de jubilació", en: "every kind of retirement" })}`}
                </A>
              </p>

              <h2 id="ejemplos">{hd.examples}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {exCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {examples().map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {exampleLabel(id, locale)}
                        </th>
                        <td data-label={exCols[1]}>
                          <strong>{Y(result.ordinary.age)}</strong> ({D(result.ordinary.date)})
                        </td>
                        <td data-label={exCols[2]}>{earlyCell(result.early.involuntary, locale)}</td>
                        <td data-label={exCols[3]}>{earlyCell(result.early.voluntary, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{exNote}</p>

              <h2 id="cuanto-cobrare">{hd.amount}</h2>
              <p>{amountText}</p>
              <ul>
                <li>
                  <A href={OFFICIAL_TOOLS.simulator}>{simulatorLink}</A>
                </li>
                <li>
                  <Link href={pensionPath(locale)}>{links.pension}</Link>
                </li>
                <li>
                  <Link href={PAY_DATES_PATH[locale]}>{links.pay}</Link>
                </li>
                <li>
                  <A href={PENSION_LINKS.imsersoPnc}>{links.pnc}</A>
                </li>
                <li>
                  <Link href={calcPath("widow-pension", locale)}>
                    {L(locale, { es: "Pensión de viudedad: requisitos y cuánto se cobra", ca: "Pensió de viduïtat: requisits i quant es cobra", en: "Spain widow's pension: requirements and amount" })}
                  </Link>
                </li>
                <li>
                  <Link href={calcPath("non-contributory-pension", locale)}>
                    {L(locale, { es: "Pensión no contributiva: requisitos y cuánto se cobra", ca: "Pensió no contributiva: requisits i quant es cobra", en: "Spain non-contributory pension: rules and amount" })}
                  </Link>
                </li>
              </ul>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {Object.values(SOURCES).map((src) => (
                  <li key={src.url}>
                    <A href={src.url}>{src.name}</A> ({src.publisher}, {src.ref}; {L(locale, { es: "leído", ca: "llegit", en: "read" })} {on(src.read)})
                  </li>
                ))}
                <li>
                  <A href={OFFICIAL_TOOLS.tuss}>Tu Seguridad Social</A> ({L(locale, { es: "informe de vida laboral e informe de edad legal de jubilación", ca: "informe de vida laboral i informe d'edat legal de jubilació", en: "working-life report and legal retirement age report" })})
                </li>
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={OFFICIAL_TOOLS.simulator}>{simulatorLink}</A>.
              </p>

              <MoreCalculators current="retirement-age" locale={locale} />
            </div>
            <ShareBar locale={locale} path={retirementPath(locale)} title={meta.h1} contentType="retirement_age_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
