import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { NC_LOCALES, euros, ncEditions, perMonth, whole, type NcLocale } from "./copy";
import { calculateOk, pncCase, workCompatibility, type PncInput, type PncResult } from "./engine";
import {
  DISABILITY_MIN,
  DISABILITY_THIRD_PERSON,
  FREE_INCOME,
  GENCAT_ANSWER_DAYS,
  MINIMUM_ANNUAL,
  PNC_ANNUAL,
  RENT_SUPPLEMENT,
  RESIDENCE_YEARS,
  RETIREMENT_AGE,
  RULES_AS_OF,
  THIRD_PERSON_ANNUAL,
  WORK_LIMIT,
  WORK_YEARS,
  householdLimit,
  individualAmount,
  monthly,
} from "./rules";

/**
 * Pure pieces of the non-contributory pension page: titles, the default
 * input, the worked examples (computed by the engine, so the HTML and the
 * calculator always agree), the FAQ and the sitemap entries.
 */

/** The calculator's first render: 67, living alone, no income, 40 years in Spain. */
export const DEFAULT_INPUT: PncInput = pncCase();

/** The figures the titles, lead and FAQ quote, straight from the rules. */
export function headline() {
  return {
    annual: PNC_ANNUAL,
    monthly: monthly(PNC_ANNUAL),
    minAnnual: MINIMUM_ANNUAL,
    minMonthly: monthly(MINIMUM_ANNUAL),
    thirdAnnual: THIRD_PERSON_ANNUAL,
    thirdMonthly: monthly(THIRD_PERSON_ANNUAL),
    withThirdMonthly: monthly(PNC_ANNUAL + THIRD_PERSON_ANNUAL),
    free: FREE_INCOME,
    rent: RENT_SUPPLEMENT,
    age: RETIREMENT_AGE,
    disability: DISABILITY_MIN,
    disabilityThird: DISABILITY_THIRD_PERSON,
    resRetirement: RESIDENCE_YEARS.retirement,
    resInvalidity: RESIDENCE_YEARS.invalidity,
    limit2: householdLimit(2, false),
    limit2First: householdLimit(2, true),
    limit3: householdLimit(3, false),
    couple: individualAmount(2),
    coupleMonthly: monthly(individualAmount(2)),
    workLimit: WORK_LIMIT,
    workYears: WORK_YEARS,
    answerDays: GENCAT_ANSWER_DAYS,
  };
}

export interface NcMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function ncMeta(locale: NcLocale): NcMeta {
  const h = headline();
  const E = (n: number) => euros(n, locale);
  const P = (n: number) => whole(n, locale);
  return {
    es: {
      title: "Pensión no contributiva 2026: requisitos y cuánto se cobra",
      description: `${E(h.monthly)} al mes en 14 pagas (mínimo ${E(h.minMonthly)}) desde los 65 o con un ${P(h.disability)} de discapacidad. Límites de ingresos del hogar y calculadora.`,
      h1: "Pensión no contributiva (PNC) 2026: requisitos y cuánto se cobra, calculadora",
      breadcrumb: "Pensión no contributiva",
      appName: "Calculadora de la pensión no contributiva de jubilación e incapacidad (Ley General de la Seguridad Social, arts. 363 a 372)",
    },
    ca: {
      title: "Pensió no contributiva 2026: requisits i quant es cobra",
      description: `${E(h.monthly)} al mes en 14 pagues (mínim ${E(h.minMonthly)}) des dels 65 o amb un ${P(h.disability)} de discapacitat. Límits d'ingressos de la llar i calculadora.`,
      h1: "Pensió no contributiva (PNC) 2026: requisits i quant es cobra, calculadora",
      breadcrumb: "Pensió no contributiva",
      appName: "Calculadora de la pensió no contributiva de jubilació i incapacitat (Llei general de la Seguretat Social, arts. 363 a 372)",
    },
    en: {
      title: "Spain non-contributory pension 2026: rules and amount",
      description: `${E(h.monthly)} a month in 14 payments (minimum ${E(h.minMonthly)}) from 65 or with a ${P(h.disability)} disability. Household income limits and a calculator.`,
      h1: "Spain's non-contributory pension (PNC) 2026: who qualifies and how much, calculator",
      breadcrumb: "Non-contributory pension",
      appName: "Spain non-contributory retirement and invalidity pension calculator (General Social Security Act, arts. 363 to 372)",
    },
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

export type ExampleId = "alone" | "own-income" | "couple" | "with-daughter" | "with-brother" | "third-person" | "minimum" | "residence";

export function exampleInputs(): [ExampleId, PncInput][] {
  return [
    // 70, alone, no income, renting: the full amount, and the rent supplement may apply.
    ["alone", pncCase({ age: 70, renting: true })],
    // 68, alone, 5.000 € a year of own income: only what passes the 35 % (3.081,12 €) is deducted.
    ["own-income", pncCase({ age: 68, ownIncome: 5000 })],
    // A married couple, both 66 and both asking: the art. 364.1 share each.
    ["couple", pncCase({ age: 66, members: 2, beneficiaries: 2 })],
    // 45, 70 % disability, lives with a daughter who earns 30.000 €: the 2,5 limit and the household cut.
    ["with-daughter", pncCase({ type: "invalidity", age: 45, disability: 70, residenceYears: 20, members: 2, firstDegree: true, householdIncome: 30_000 })],
    // 67, lives with a brother who earns 16.000 €: over the second-degree limit, no pension.
    ["with-brother", pncCase({ age: 67, members: 2, householdIncome: 16_000 })],
    // 30, 80 % and needs another person, alone, no income: the PNC + 50 %.
    ["third-person", pncCase({ type: "invalidity", age: 30, disability: 80, thirdPerson: true, residenceYears: 30 })],
    // 66, married, the husband's pension 14.000 €: the household cut leaves the 25 % floor.
    ["minimum", pncCase({ age: 66, members: 2, householdIncome: 14_000 })],
    // 70, 8 years in Spain: short of the 10 years.
    ["residence", pncCase({ age: 70, residenceYears: 8 })],
  ];
}

export function examples(): { id: ExampleId; input: PncInput; result: PncResult }[] {
  return exampleInputs().map(([id, input]) => ({ id, input, result: calculateOk(input) }));
}

/** Art. 366, worked on the full PNC: earnings of 6.000, 10.000 and the whole limit. */
export function workExamples(): { work: number; pension: number; cut: number; suspended: boolean }[] {
  return [6000, 10_000, WORK_LIMIT].map((work) => ({ work, ...workCompatibility(PNC_ANNUAL, work) }));
}

/* -------------------------------------------------------------------------- */
/* Sitemap and FAQ                                                            */
/* -------------------------------------------------------------------------- */

export function ncSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = ncEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return NC_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the rules (also the FAQPage JSON-LD). */
export function ncFaq(locale: NcLocale): { q: string; a: string }[] {
  const h = headline();
  const E = (n: number) => euros(n, locale);
  const M = (n: number) => perMonth(n, locale);
  const P = (n: number) => whole(n, locale);
  return {
    es: [
      {
        q: "¿Cuánto es la pensión no contributiva en 2026?",
        a: `${E(h.annual)} al año, ${M(h.monthly)} en 14 pagas, si no tienes otros ingresos. Con ingresos propios o de la familia baja, pero nunca de ${M(h.minMonthly)} (el 25 %). Si la cobráis dos en la misma casa, ${M(h.coupleMonthly)} cada uno. Con un ${P(h.disabilityThird)} de discapacidad y necesidad de otra persona se suman ${M(h.thirdMonthly)}.`,
      },
      {
        q: "¿Qué requisitos tiene la pensión no contributiva de jubilación?",
        a: `Haber cumplido ${h.age} años, residir legalmente en España y haberlo hecho ${h.resRetirement} años entre los 16 y la solicitud, 2 de ellos seguidos justo antes, y no llegar a los límites de ingresos: ${E(h.annual)} al año de ingresos propios y, si vives con familia, el límite de la unidad económica.`,
      },
      {
        q: "¿Y la de incapacidad (antes invalidez)?",
        a: `Tener de 18 a 64 años, un grado de discapacidad o enfermedad crónica del ${P(h.disability)} o más, ${h.resInvalidity} años de residencia legal en España (los 2 últimos seguidos) y los mismos límites de ingresos. A los 65 pasa a llamarse de jubilación, sin cambiar nada más.`,
      },
      {
        q: "¿Qué ingresos de la familia cuentan y cuál es el límite?",
        a: `Los de quienes viven contigo y son tu cónyuge o parientes de sangre hasta segundo grado (padres, hijos, abuelos, nietos, hermanos). Para 2 personas el límite es ${E(h.limit2)} al año, para 3, ${E(h.limit3)}; si entre ellos está tu padre, tu madre o un hijo, se multiplica por 2,5 (${E(h.limit2First)} para 2). Cuentan los ingresos brutos de trabajo, capital y prestaciones, no la vivienda en la que vives.`,
      },
      {
        q: "Si tengo algún ingreso, ¿cuánto me descuentan?",
        a: `Solo lo que pase de ${E(h.free)} al año (el 35 % de la pensión). Si vives con familia y los ingresos de todos más la pensión pasan del límite, la pensión baja lo que se pase, hasta un mínimo de ${E(h.minAnnual)} al año.`,
      },
      {
        q: "¿Puedo trabajar cobrando la pensión no contributiva?",
        a: `Con la de incapacidad, sí: durante ${h.workYears} años desde que empiezas a trabajar, pensión más sueldo pueden llegar a ${E(h.workLimit)} al año (IPREM más la pensión); si pasas, la pensión baja. Al dejar el trabajo se recupera. La de jubilación no tiene esa regla: el sueldo cuenta como cualquier ingreso.`,
      },
      {
        q: "¿Qué es el complemento de alquiler de la pensión no contributiva?",
        a: `${E(h.rent)} al año, en un solo pago, para quien cobra la no contributiva, vive de alquiler como titular del contrato, no tiene vivienda en propiedad y no alquila a un familiar hasta tercer grado. El contrato tiene que ser de un año o más y llevar 180 días viviendo allí. No cuenta como ingreso.`,
      },
      {
        q: "¿Dónde se pide en Cataluña y desde cuándo se cobra?",
        a: `En Cataluña la gestiona la Generalitat (Departament de Drets Socials i Inclusió): se pide por internet con certificado digital o idCAT Mòbil, en una oficina de atención ciudadana (con cita previa, también en el 012) o por videollamada, y responde en ${h.answerDays} días como máximo. En el resto de España, el órgano de cada comunidad; en Ceuta y Melilla, el Imserso. Se cobra desde el día 1 del mes siguiente a la solicitud.`,
      },
    ],
    ca: [
      {
        q: "Quant és la pensió no contributiva el 2026?",
        a: `${E(h.annual)} l'any, ${M(h.monthly)} en 14 pagues, si no tens altres ingressos. Amb ingressos propis o de la família baixa, però mai per sota de ${M(h.minMonthly)} (el 25 %). Si la cobreu dos a la mateixa casa, ${M(h.coupleMonthly)} cadascú. Amb un ${P(h.disabilityThird)} de discapacitat i necessitat d'una altra persona s'hi sumen ${M(h.thirdMonthly)}.`,
      },
      {
        q: "Quins requisits té la pensió no contributiva de jubilació?",
        a: `Haver complert ${h.age} anys, residir legalment a Espanya i haver-ho fet ${h.resRetirement} anys entre els 16 i la sol·licitud, 2 d'ells seguits just abans, i no arribar als límits d'ingressos: ${E(h.annual)} l'any d'ingressos propis i, si vius amb família, el límit de la unitat econòmica.`,
      },
      {
        q: "I la d'incapacitat (abans invalidesa)?",
        a: `Tenir de 18 a 64 anys, un grau de discapacitat o malaltia crònica del ${P(h.disability)} o més, ${h.resInvalidity} anys de residència legal a Espanya (els 2 últims seguits) i els mateixos límits d'ingressos. Als 65 passa a dir-se de jubilació, sense canviar res més.`,
      },
      {
        q: "Quins ingressos de la família compten i quin és el límit?",
        a: `Els de qui viu amb tu i és el teu cònjuge o parent de sang fins a segon grau (pares, fills, avis, néts, germans). Per a 2 persones el límit és ${E(h.limit2)} l'any, per a 3, ${E(h.limit3)}; si entre ells hi ha el teu pare, la teva mare o un fill, es multiplica per 2,5 (${E(h.limit2First)} per a 2). Compten els ingressos bruts de feina, capital i prestacions, no l'habitatge on vius.`,
      },
      {
        q: "Si tinc algun ingrés, quant em descompten?",
        a: `Només el que passi de ${E(h.free)} l'any (el 35 % de la pensió). Si vius amb família i els ingressos de tots més la pensió passen del límit, la pensió baixa el que se'n passi, fins a un mínim de ${E(h.minAnnual)} l'any.`,
      },
      {
        q: "Puc treballar cobrant la pensió no contributiva?",
        a: `Amb la d'incapacitat, sí: durant ${h.workYears} anys des que comences a treballar, pensió més sou poden arribar a ${E(h.workLimit)} l'any (IPREM més la pensió); si en passes, la pensió baixa. En deixar la feina es recupera. La de jubilació no té aquesta regla: el sou compta com qualsevol ingrés.`,
      },
      {
        q: "Què és el complement de lloguer de la pensió no contributiva?",
        a: `${E(h.rent)} l'any, en un sol pagament, per a qui cobra la no contributiva, viu de lloguer com a titular del contracte, no té habitatge en propietat i no lloga a un familiar fins a tercer grau. El contracte ha de ser d'un any o més i fer 180 dies que hi vius. No compta com a ingrés.`,
      },
      {
        q: "On es demana a Catalunya i des de quan es cobra?",
        a: `A Catalunya la gestiona la Generalitat (Departament de Drets Socials i Inclusió): es demana per internet amb certificat digital o idCAT Mòbil, en una oficina d'atenció ciutadana (amb cita prèvia, també al 012) o per videotrucada, i respon en ${h.answerDays} dies com a màxim. A la resta d'Espanya, l'òrgan de cada comunitat; a Ceuta i Melilla, l'Imserso. Es cobra des del dia 1 del mes següent a la sol·licitud.`,
      },
    ],
    en: [
      {
        q: "How much is Spain's non-contributory pension in 2026?",
        a: `${E(h.annual)} a year, ${M(h.monthly)} in 14 payments, if you have no other income. Your own or your family's income lowers it, but never below ${M(h.minMonthly)} (25%). If two of you in the same home get it, ${M(h.coupleMonthly)} each. With a ${P(h.disabilityThird)} disability and the need for another person's help, ${M(h.thirdMonthly)} is added.`,
      },
      {
        q: "What are the requirements for the non-contributory retirement pension?",
        a: `Being ${h.age} or over, living legally in Spain and having done so for ${h.resRetirement} years between age 16 and the application, the last 2 in a row, and staying under the income limits: ${E(h.annual)} a year of your own income and, if you live with family, the household unit's limit.`,
      },
      {
        q: "And the invalidity one?",
        a: `Being 18 to 64, a degree of disability or chronic illness of ${P(h.disability)} or more, ${h.resInvalidity} years of legal residence in Spain (the last 2 in a row) and the same income limits. At 65 it is renamed a retirement pension, with nothing else changing.`,
      },
      {
        q: "Whose income counts, and what is the household limit?",
        a: `That of the people you live with who are your spouse or blood relatives up to the second degree (parents, children, grandparents, grandchildren, siblings). For 2 people the limit is ${E(h.limit2)} a year, for 3, ${E(h.limit3)}; if your father, mother or a child is among them, it is multiplied by 2.5 (${E(h.limit2First)} for 2). Gross income from work, capital and benefits counts, not the home you live in.`,
      },
      {
        q: "If I have some income, how much is deducted?",
        a: `Only what is above ${E(h.free)} a year (35% of the pension). If you live with family and everyone's income plus the pension is over the limit, the pension drops by the excess, down to a minimum of ${E(h.minAnnual)} a year.`,
      },
      {
        q: "Can I work while drawing it?",
        a: `With the invalidity pension, yes: for ${h.workYears} years from starting work, pension plus earnings can reach ${E(h.workLimit)} a year (the IPREM plus the pension); above that, the pension is cut. It comes back when the job ends. The retirement one has no such rule: wages count like any other income.`,
      },
      {
        q: "What is the rent supplement?",
        a: `${E(h.rent)} a year, in one payment, for non-contributory pensioners who rent their home with the lease in their name, own no home and do not rent from a relative up to the third degree. The lease must be for a year or more, with 180 days lived there. It does not count as income.`,
      },
      {
        q: "Where do I apply in Catalonia, and from when is it paid?",
        a: `In Catalonia the Generalitat runs it (Departament de Drets Socials i Inclusió): apply online with a digital certificate or idCAT Mòbil, at a citizen service office (by appointment, also on 012) or by video call; it answers within ${h.answerDays} days at most. Elsewhere in Spain, each region's body; in Ceuta and Melilla, IMSERSO. It is paid from the 1st of the month after the application.`,
      },
    ],
  }[locale];
}
