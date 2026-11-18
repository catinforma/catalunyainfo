import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { RA_LOCALES, coef, day, retirementEditions, whole, ymText, type RaLocale } from "./copy";
import { calculateOk, person, type RetirementInput, type RetirementResult } from "./engine";
import {
  DELAY_HALF_YEAR,
  DELAY_PER_YEAR,
  EARLY_MAX_MONTHS,
  EARLY_MIN_CONTRIBUTION,
  INVOLUNTARY_COEFFICIENTS,
  MIN_CONTRIBUTION,
  RULES_AS_OF,
  VOLUNTARY_COEFFICIENTS,
  activeShareFor,
  delayBonus,
  phaseInRow,
} from "./rules";

/**
 * Pure pieces of the retirement-age page: titles, the default input, the
 * worked examples and the delay table (all computed by the engine on
 * RULES_AS_OF, so the HTML and the calculator always agree), the FAQ and the
 * sitemap entries.
 */

/** The calculator's first render, on the server: born 20 June 1965, 35 years contributed, still contributing. */
export const DEFAULT_INPUT: RetirementInput = person("1965-06-20", 35);

/** The figures the titles, lead and FAQ quote, straight from the rules. */
export function headline() {
  const y2026 = phaseInRow(2026);
  const y2027 = phaseInRow(2027);
  const first = (rows: typeof INVOLUNTARY_COEFFICIENTS) => rows[0]![1];
  return {
    y2026,
    y2027,
    involuntaryMax: EARLY_MAX_MONTHS.involuntary,
    voluntaryMax: EARLY_MAX_MONTHS.voluntary,
    involuntaryMin: EARLY_MIN_CONTRIBUTION.involuntary,
    voluntaryMin: EARLY_MIN_CONTRIBUTION.voluntary,
    /** The cut at the maximum advance: first and last column. */
    involuntaryCut: { most: first(INVOLUNTARY_COEFFICIENTS)[0], least: first(INVOLUNTARY_COEFFICIENTS)[3] },
    voluntaryCut: { most: first(VOLUNTARY_COEFFICIENTS)[0], least: first(VOLUNTARY_COEFFICIENTS)[3] },
    perYear: DELAY_PER_YEAR,
    halfYear: DELAY_HALF_YEAR,
    minimum: MIN_CONTRIBUTION,
  };
}

export interface RaMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function retirementMeta(locale: RaLocale): RaMeta {
  const h = headline();
  const Y = (p: Parameters<typeof ymText>[0]) => ymText(p, locale);
  const P = (n: number) => whole(n, locale);
  return {
    es: {
      title: "Edad de jubilación: ¿a qué edad me puedo jubilar? 2027",
      description: `En 2027, ${Y(h.y2027.age)}, o 65 si has cotizado ${Y(h.y2027.threshold)}. Calcula tu fecha exacta, la anticipada con su recorte y el ${P(h.perYear)} por año de demora.`,
      h1: "¿A qué edad me puedo jubilar? Calculadora de la edad de jubilación",
      breadcrumb: "Edad de jubilación",
      appName: "Calculadora de la edad de jubilación (Ley General de la Seguridad Social, arts. 205 a 210 y disposición transitoria séptima)",
    },
    ca: {
      title: "Edat de jubilació: a quina edat em puc jubilar? 2027",
      description: `El 2027, ${Y(h.y2027.age)}, o 65 si has cotitzat ${Y(h.y2027.threshold)}. Calcula la teva data exacta, l'anticipada amb la retallada i el ${P(h.perYear)} per any de demora.`,
      h1: "A quina edat em puc jubilar? Calculadora de l'edat de jubilació",
      breadcrumb: "Edat de jubilació",
      appName: "Calculadora de l'edat de jubilació (Llei general de la Seguretat Social, arts. 205 a 210 i disposició transitòria setena)",
    },
    en: {
      title: "Spain retirement age 2027: when can I retire?",
      description: `In 2027, ${Y(h.y2027.age)}, or 65 with ${Y(h.y2027.threshold)} of contributions. Work out your exact date, early retirement with its cut and the ${P(h.perYear)} a year for delaying.`,
      h1: "When can I retire in Spain? Retirement age calculator",
      breadcrumb: "Retirement age",
      appName: "Spain retirement age calculator (General Social Security Act, arts. 205 to 210 and seventh transitional provision)",
    },
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

export type ExampleId = "rule-65" | "age-67" | "dec-2026" | "apr-1960" | "long-career" | "keeps" | "stops";

export function exampleInputs(): [ExampleId, RetirementInput][] {
  return [
    // 35 years now, 38 years 7 months at 65 if they keep contributing: the 65 rule.
    ["rule-65", DEFAULT_INPUT],
    // 30 years now: 32 years 3 months at 65, so 67; 33 years (involuntary) only at 65 and 8 months, 35 (voluntary) after 67.
    ["age-67", person("1964-03-10", 30)],
    // Born February 1960: 66 and 10 months falls in December 2026, inside the 2026 row.
    ["dec-2026", person("1960-02-15", 37)],
    // Born April 1960: 66 and 10 months would fall in February 2027, whose row asks for 67.
    ["apr-1960", person("1960-04-15", 37)],
    // A long career: 65, and the early cuts of the second and third columns.
    ["long-career", person("1967-09-10", 38)],
    // The same 37 years, with and without contributing until retiring: 65 or 67.
    ["keeps", person("1966-10-01", 37)],
    ["stops", person("1966-10-01", 37, 0, false)],
  ];
}

export function examples(): { id: ExampleId; input: RetirementInput; result: RetirementResult }[] {
  return exampleInputs().map(([id, input]) => ({ id, input, result: calculateOk(input, RULES_AS_OF) }));
}

/** The delay table: months after the ordinary age → extra percentage (art. 210.2.a) and the jubilación activa share (art. 214.2). */
export const DELAY_ROWS: readonly number[] = [12, 19, 24, 30, 31, 36, 42, 43, 48, 60];

export function delayTable(): { months: number; bonus: number; active: number | null }[] {
  return DELAY_ROWS.map((months) => ({ months, bonus: delayBonus(months), active: activeShareFor(months) }));
}

/* -------------------------------------------------------------------------- */
/* Sitemap and FAQ                                                            */
/* -------------------------------------------------------------------------- */

export function retirementSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = retirementEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return RA_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the rules and the engine (also the FAQPage JSON-LD). */
export function retirementFaq(locale: RaLocale): { q: string; a: string }[] {
  const h = headline();
  const Y = (p: Parameters<typeof ymText>[0]) => ymText(p, locale);
  const P = (n: number) => whole(n, locale);
  const C = (n: number) => coef(n, locale);
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result])) as Record<ExampleId, RetirementResult>;
  const dec = ex["dec-2026"].ordinary;
  const apr = ex["apr-1960"].ordinary;
  const D = (iso: string) => day(iso, locale);
  return {
    es: [
      {
        q: "¿Cuál es la edad de jubilación en 2027?",
        a: `${Y(h.y2027.age)}, o 65 años si has cotizado al menos ${Y(h.y2027.threshold)}. Es la última fila de la tabla de la Ley General de la Seguridad Social y se queda fija desde el 1 de enero de 2027. Para el cómputo cuentan años y meses completos, sin la parte proporcional de las pagas extra.`,
      },
      {
        q: "¿Y en 2026?",
        a: `${Y(h.y2026.age)}, o 65 años con ${Y(h.y2026.threshold)} cotizados. Cuenta el año en que cumples la edad: quien llega a los ${Y(h.y2026.age)} antes de que acabe 2026 se jubila con esa edad; quien llega después ya necesita ${Y(h.y2027.age)} (o 65 con ${Y(h.y2027.threshold)}).`,
      },
      {
        q: "¿Cuántos años hay que cotizar para jubilarse?",
        a: `Para cobrar una pensión de jubilación, al menos ${Y(h.minimum)}, dos de ellos en los últimos quince. Para jubilarte a los 65 sin recorte, ${Y(h.y2027.threshold)} desde 2027. Para la anticipada, ${Y(h.voluntaryMin)} si es voluntaria y ${Y(h.involuntaryMin)} si es por despido o cese involuntario.`,
      },
      {
        q: "¿Me puedo jubilar a los 63?",
        a: `Sí, con la jubilación anticipada voluntaria, si tu edad ordinaria es 65 (porque llegarías a ${Y(h.y2027.threshold)} cotizados) y tienes al menos ${Y(h.voluntaryMin)} cotizados. Si tu edad ordinaria es 67, lo antes posible es a los 65. La pensión se recorta para siempre: con 24 meses de adelanto, del ${C(h.voluntaryCut.most)} al ${C(h.voluntaryCut.least)} según lo cotizado.`,
      },
      {
        q: "¿Cuánto se pierde con la jubilación anticipada?",
        a: `Un porcentaje por cada mes o fracción de mes que adelantas, que depende de lo cotizado. Voluntaria (hasta 24 meses antes): ${C(h.voluntaryCut.most)} con menos de 38 años y 6 meses cotizados y ${C(h.voluntaryCut.least)} con 44 años y 6 meses o más. Por despido o cese involuntario (hasta 48 meses antes): del ${C(h.involuntaryCut.most)} al ${C(h.involuntaryCut.least)}. Desde 2022 los coeficientes son por meses, no por trimestres.`,
      },
      {
        q: "¿Qué gano si retraso la jubilación?",
        a: `Un ${P(h.perYear)} más de pensión por cada año completo cotizado después de la edad ordinaria; desde el segundo año completo, más de seis meses sueltos suman un ${P(h.halfYear)}. En lugar del porcentaje puedes pedir un pago único o una mezcla de los dos. Hace falta tener ${Y(h.minimum)} cotizados al llegar a la edad ordinaria.`,
      },
      {
        q: "¿Cuenta el año en que cumplo la edad o el año en que me jubilo?",
        a: `El año en que cumples la edad que pide la tabla. Quien nació el 15 de febrero de 1960 cumple ${Y(dec.age)} el ${D(dec.date)}, aún en 2026: esa es su edad. Quien nació el 15 de abril de 1960 cumpliría ${Y(h.y2026.age)} en 2027, que ya pide ${Y(apr.age)}: se jubila el ${D(apr.date)}.`,
      },
      {
        q: "¿Dónde consulto mi edad exacta de jubilación?",
        a: "En Tu Seguridad Social: el «Informe de edad legal de jubilación» (en «Otras gestiones») o el simulador de pensión de jubilación, que lee tu vida laboral. Para descargarlo basta un código que llega por SMS al móvil registrado en la Seguridad Social. Esta calculadora no te pide ningún dato personal.",
      },
    ],
    ca: [
      {
        q: "Quina és l'edat de jubilació el 2027?",
        a: `${Y(h.y2027.age)}, o 65 anys si has cotitzat com a mínim ${Y(h.y2027.threshold)}. És l'última fila de la taula de la Llei general de la Seguretat Social i queda fixa des de l'1 de gener de 2027. Per al còmput compten anys i mesos complets, sense la part proporcional de les pagues extra.`,
      },
      {
        q: "I el 2026?",
        a: `${Y(h.y2026.age)}, o 65 anys amb ${Y(h.y2026.threshold)} cotitzats. Compta l'any en què fas l'edat: qui arriba als ${Y(h.y2026.age)} abans que acabi el 2026 es jubila amb aquesta edat; qui hi arriba després ja necessita ${Y(h.y2027.age)} (o 65 amb ${Y(h.y2027.threshold)}).`,
      },
      {
        q: "Quants anys cal cotitzar per jubilar-se?",
        a: `Per cobrar una pensió de jubilació, com a mínim ${Y(h.minimum)}, dos dels quals en els últims quinze. Per jubilar-te als 65 sense retallada, ${Y(h.y2027.threshold)} des del 2027. Per a l'anticipada, ${Y(h.voluntaryMin)} si és voluntària i ${Y(h.involuntaryMin)} si és per acomiadament o cessament involuntari.`,
      },
      {
        q: "Em puc jubilar als 63?",
        a: `Sí, amb la jubilació anticipada voluntària, si la teva edat ordinària és 65 (perquè arribaries a ${Y(h.y2027.threshold)} cotitzats) i tens com a mínim ${Y(h.voluntaryMin)} cotitzats. Si la teva edat ordinària és 67, com més aviat és als 65. La pensió es retalla per sempre: amb 24 mesos d'avançament, del ${C(h.voluntaryCut.most)} al ${C(h.voluntaryCut.least)} segons el que hagis cotitzat.`,
      },
      {
        q: "Quant es perd amb la jubilació anticipada?",
        a: `Un percentatge per cada mes o fracció de mes que avances, que depèn del que hagis cotitzat. Voluntària (fins a 24 mesos abans): ${C(h.voluntaryCut.most)} amb menys de 38 anys i 6 mesos cotitzats i ${C(h.voluntaryCut.least)} amb 44 anys i 6 mesos o més. Per acomiadament o cessament involuntari (fins a 48 mesos abans): del ${C(h.involuntaryCut.most)} al ${C(h.involuntaryCut.least)}. Des del 2022 els coeficients són per mesos, no per trimestres.`,
      },
      {
        q: "Què guanyo si endarrereixo la jubilació?",
        a: `Un ${P(h.perYear)} més de pensió per cada any complet cotitzat després de l'edat ordinària; des del segon any complet, més de sis mesos solts sumen un ${P(h.halfYear)}. En lloc del percentatge pots demanar un pagament únic o una barreja de tots dos. Cal tenir ${Y(h.minimum)} cotitzats en arribar a l'edat ordinària.`,
      },
      {
        q: "Compta l'any en què faig l'edat o l'any en què em jubilo?",
        a: `L'any en què fas l'edat que demana la taula. Qui va néixer el 15 de febrer de 1960 fa ${Y(dec.age)} el ${D(dec.date)}, encara el 2026: aquesta és la seva edat. Qui va néixer el 15 d'abril de 1960 faria ${Y(h.y2026.age)} el 2027, que ja demana ${Y(apr.age)}: es jubila el ${D(apr.date)}.`,
      },
      {
        q: "On consulto la meva edat exacta de jubilació?",
        a: "A Tu Seguridad Social: l'«Informe de edad legal de jubilación» (a «Otras gestiones») o el simulador de pensió de jubilació, que llegeix la teva vida laboral. Per descarregar-lo n'hi ha prou amb un codi que arriba per SMS al mòbil registrat a la Seguretat Social. Aquesta calculadora no et demana cap dada personal.",
      },
    ],
    en: [
      {
        q: "What is the retirement age in Spain in 2027?",
        a: `${Y(h.y2027.age)}, or 65 if you have contributed at least ${Y(h.y2027.threshold)}. It is the last row of the General Social Security Act's table and stays fixed from 1 January 2027. Whole years and months count, without the proportional share of the extra payments.`,
      },
      {
        q: "And in 2026?",
        a: `${Y(h.y2026.age)}, or 65 with ${Y(h.y2026.threshold)} of contributions. What counts is the year you reach the age: if you reach ${Y(h.y2026.age)} before the end of 2026, that is your age; if you reach it later, you need ${Y(h.y2027.age)} (or 65 with ${Y(h.y2027.threshold)}).`,
      },
      {
        q: "How many years must I contribute to retire in Spain?",
        a: `For a retirement pension, at least ${Y(h.minimum)}, two of them within the last fifteen. To retire at 65 with no reduction, ${Y(h.y2027.threshold)} from 2027. For early retirement, ${Y(h.voluntaryMin)} if voluntary and ${Y(h.involuntaryMin)} after dismissal or involuntary job loss.`,
      },
      {
        q: "Can I retire at 63?",
        a: `Yes, with voluntary early retirement, if your ordinary age is 65 (because you would reach ${Y(h.y2027.threshold)} of contributions) and you have at least ${Y(h.voluntaryMin)}. If your ordinary age is 67, the earliest is 65. The pension is cut for life: 24 months early, from ${C(h.voluntaryCut.most)} to ${C(h.voluntaryCut.least)} depending on your contributions.`,
      },
      {
        q: "How much do I lose by retiring early?",
        a: `A percentage for each month or part of a month early, depending on your contributions. Voluntary (up to 24 months): ${C(h.voluntaryCut.most)} with under 38 years 6 months of contributions and ${C(h.voluntaryCut.least)} with 44 years 6 months or more. After dismissal or involuntary job loss (up to 48 months): from ${C(h.involuntaryCut.most)} to ${C(h.involuntaryCut.least)}. Since 2022 the coefficients are per month, not per quarter.`,
      },
      {
        q: "What do I gain by delaying retirement?",
        a: `${P(h.perYear)} more pension for each full year contributed after the ordinary age; from the second full year, more than six extra months add ${P(h.halfYear)}. Instead of the percentage you can ask for a lump sum or a mix of both. You need ${Y(h.minimum)} of contributions when you reach the ordinary age.`,
      },
      {
        q: "Does the year I reach the age count, or the year I retire?",
        a: `The year you reach the age the table asks for. Someone born on 15 February 1960 turns ${Y(dec.age)} on ${D(dec.date)}, still in 2026: that is their age. Someone born on 15 April 1960 would turn ${Y(h.y2026.age)} in 2027, which already asks for ${Y(apr.age)}: they retire on ${D(apr.date)}.`,
      },
      {
        q: "Where can I check my exact retirement age?",
        a: "In Tu Seguridad Social: the «Informe de edad legal de jubilación» (under «Otras gestiones») or the retirement pension simulator, which reads your working life. A code sent by SMS to the mobile registered with Social Security is enough to download it. This calculator asks for no personal data.",
      },
    ],
  }[locale];
}
