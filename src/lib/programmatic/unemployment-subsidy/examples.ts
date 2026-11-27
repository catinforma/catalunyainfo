import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { socCopy } from "@/lib/programmatic/employment/catalonia-soc";
import { benefitLimits } from "@/lib/programmatic/employment/unemployment";
import { SMI_MONTHLY } from "@/lib/programmatic/employment/rules";

import { money } from "./copy";
import { DEFAULT_INPUT, checkSubsidy, type SubsidyInput, type SubsidyResult } from "./engine";
import { INCOME_LIMIT, INCOME_LIMIT_SHARE } from "./rules";

/**
 * "Cuánto cobras de subsidio en total según tu caso" (27 Nov 2026, batch
 * 8J): six common cases run through `checkSubsidy`, the function the checker
 * runs, so the table can never disagree with it. Queries (GSC 28 days to
 * 25 Nov): "cuanto es el subsidio por desempleo" 7 at 3.9, "cuanto se cobra
 * de subsidio" 3 at 21.3, "ingresos familiares para cobrar subsidio 2026",
 * "maximo paro 2026" 2 at 9.0, "cual es el 75 del salario minimo" 1 at 5.0.
 * Pure; 2026 rules (rules.ts, valid until SUBSIDY_RULES_UNTIL).
 */

export interface SubsidyCase {
  id: string;
  input: SubsidyInput;
}

const base: SubsidyInput = { ...DEFAULT_INPUT, ownIncome: 0, retirementRecord: "unknown", unemploymentYears: "unknown" };

export const SUBSIDY_CASES: readonly SubsidyCase[] = [
  { id: "young-alone", input: { ...base, situation: "exhausted", age: 30, exhaustedDays: 360, familyMembers: 0, householdIncome: 0 } },
  { id: "family-120", input: { ...base, situation: "exhausted", age: 38, exhaustedDays: 120, familyMembers: 2, householdIncome: 1200 } },
  { id: "family-360", input: { ...base, situation: "exhausted", age: 47, exhaustedDays: 360, familyMembers: 2, householdIncome: 1200 } },
  { id: "short-alone", input: { ...base, situation: "insufficient", age: 25, contributedDays: 200, familyMembers: 0, householdIncome: 0 } },
  { id: "short-family", input: { ...base, situation: "insufficient", age: 40, contributedDays: 200, familyMembers: 2, householdIncome: 1200 } },
  { id: "over52", input: { ...base, situation: "exhausted", age: 55, exhaustedDays: 480, familyMembers: 0, householdIncome: 0, retirementRecord: "yes", unemploymentYears: "yes" } },
];

export function subsidyCaseRows(): { id: string; result: SubsidyResult }[] {
  return SUBSIDY_CASES.map((c) => ({ id: c.id, result: checkSubsidy(c.input) }));
}

export interface SubsidyExamplesCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string, string];
  labels: Record<string, string>;
  untilRetirement: string;
  note: string;
  faq: { q: string; a: string }[];
}

export function subsidyExamplesCopy(locale: CalcLocale): SubsidyExamplesCopy {
  const m = (x: number) => money(x, locale);
  const m0 = (x: number) => money(x, locale, Number.isInteger(x) ? 0 : 2);
  const lim = [benefitLimits(0), benefitLimits(1), benefitLimits(2)];
  const limit = m(INCOME_LIMIT);
  const share = `${Math.round(INCOME_LIMIT_SHARE * 100)} %`;
  const soc = socCopy(locale).faq;
  if (locale === "es") {
    return {
      title: "Cuánto cobras de subsidio en total: seis casos",
      intro: "Calculados con la misma función que el comprobador, con ingresos propios de 0 € y, cuando hay familia, pareja y un hijo con 1.200 € de ingresos en casa (400 € por persona, por debajo del límite).",
      caption: "Subsidio por desempleo 2026: duración y total según el caso",
      cols: ["Caso", "Tipo", "Duración", "Total"],
      labels: {
        "young-alone": "30 años, sin familia, agota un paro de 360 días",
        "family-120": "38 años, pareja y un hijo, agota un paro de 120 días",
        "family-360": "47 años, pareja y un hijo, agota un paro de 360 días",
        "short-alone": "25 años, sin familia, 200 días cotizados (sin paro)",
        "short-family": "40 años, pareja y un hijo, 200 días cotizados (sin paro)",
        over52: "55 años, agota el paro, cumple los requisitos de jubilación",
        exhausted: "Agotamiento",
        insufficient: "Cotización insuficiente",
        over52kind: "Mayores de 52",
      },
      untilRetirement: "Hasta la jubilación",
      note: "Totales brutos. El de mayores de 52 no tiene total: se cobra cada mes hasta la edad de jubilación.",
      faq: [
        {
          q: "¿Qué diferencia hay entre el paro y el subsidio?",
          a: `El paro (prestación contributiva) depende de lo que cotizaste: el 70 % de tu base reguladora los primeros 180 días y el 60 % después, con un máximo en 2026 de ${m(lim[0]!.max)} al mes sin hijos y ${m(lim[2]!.max)} con dos o más. El subsidio es una cantidad fija para todos, del 95 %, el 90 % y el 80 % del IPREM, y pide no superar un límite de ingresos.`,
        },
        {
          q: "¿Cuánto es el 75 % del salario mínimo en 2026?",
          a: `${limit} al mes: el ${share} de ${m0(SMI_MONTHLY)}, el salario mínimo de 2026 en 14 pagas, sin prorratear las extras. Es el límite de ingresos del subsidio, propios o por miembro de la familia.`,
        },
        soc,
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant cobres de subsidi en total: sis casos",
      intro: "Calculats amb la mateixa funció que el comprovador, amb ingressos propis de 0 € i, quan hi ha família, parella i un fill amb 1.200 € d'ingressos a casa (400 € per persona, per sota del límit).",
      caption: "Subsidi per desocupació 2026: durada i total segons el cas",
      cols: ["Cas", "Tipus", "Durada", "Total"],
      labels: {
        "young-alone": "30 anys, sense família, esgota un atur de 360 dies",
        "family-120": "38 anys, parella i un fill, esgota un atur de 120 dies",
        "family-360": "47 anys, parella i un fill, esgota un atur de 360 dies",
        "short-alone": "25 anys, sense família, 200 dies cotitzats (sense atur)",
        "short-family": "40 anys, parella i un fill, 200 dies cotitzats (sense atur)",
        over52: "55 anys, esgota l'atur, compleix els requisits de jubilació",
        exhausted: "Esgotament",
        insufficient: "Cotització insuficient",
        over52kind: "Més grans de 52",
      },
      untilRetirement: "Fins a la jubilació",
      note: "Totals bruts. El de més grans de 52 no té total: es cobra cada mes fins a l'edat de jubilació.",
      faq: [
        {
          q: "Quina diferència hi ha entre l'atur i el subsidi?",
          a: `L'atur (prestació contributiva) depèn del que vas cotitzar: el 70 % de la base reguladora els primers 180 dies i el 60 % després, amb un màxim el 2026 de ${m(lim[0]!.max)} al mes sense fills i ${m(lim[2]!.max)} amb dos o més. El subsidi és una quantitat fixa per a tothom, del 95 %, el 90 % i el 80 % de l'IPREM, i demana no superar un límit d'ingressos.`,
        },
        {
          q: "Quant és el 75 % del salari mínim el 2026?",
          a: `${limit} al mes: el ${share} de ${m0(SMI_MONTHLY)}, el salari mínim del 2026 en 14 pagues, sense prorratejar les extres. És el límit d'ingressos del subsidi, propis o per membre de la família.`,
        },
        soc,
      ],
    };
  }
  return {
    title: "How much the subsidy pays in total: six cases",
    intro: "Worked out with the same function as the checker, with no income of your own and, where there is a family, a partner and one child with €1,200 of household income (€400 per person, under the limit).",
    caption: "Spain's unemployment subsidy 2026: length and total by case",
    cols: ["Case", "Kind", "Length", "Total"],
    labels: {
      "young-alone": "Aged 30, no family, 360-day benefit runs out",
      "family-120": "Aged 38, partner and one child, 120-day benefit runs out",
      "family-360": "Aged 47, partner and one child, 360-day benefit runs out",
      "short-alone": "Aged 25, no family, 200 days contributed (no benefit)",
      "short-family": "Aged 40, partner and one child, 200 days contributed (no benefit)",
      over52: "Aged 55, benefit runs out, meets the pension requirements",
      exhausted: "Benefit exhausted",
      insufficient: "Insufficient contributions",
      over52kind: "Over 52",
    },
    untilRetirement: "Until retirement",
    note: "Gross totals. The over-52 subsidy has no total: it is paid every month until state pension age.",
    faq: [
      {
        q: "What is the difference between unemployment benefit and the subsidy?",
        a: `Unemployment benefit (the contributory prestación) depends on what you paid in: 70% of your base reguladora for the first 180 days and 60% after, with a 2026 maximum of ${m(lim[0]!.max)} a month without children and ${m(lim[2]!.max)} with two or more. The subsidy is the same flat amount for everyone, 95%, 90% and 80% of the IPREM, and has an income limit.`,
      },
      {
        q: "What is 75% of the minimum wage in 2026?",
        a: `${limit} a month: ${share} of ${m0(SMI_MONTHLY)}, the 2026 minimum wage in 14 payments, without spreading the extra payments. It is the subsidy's income limit, for your own income or per family member.`,
      },
      soc,
    ],
  };
}
