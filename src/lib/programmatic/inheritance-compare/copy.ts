import { calcPath } from "@/lib/programmatic/calculators/paths";
import { elDay, fromDay, money } from "@/lib/programmatic/inheritance-tax/copy";

import { EXAMPLE } from "./engine";
import { RULES_AS_OF, RULES_UNTIL } from "./state";
import { TERRITORIES, exampleRows, type ExampleRow } from "./territories";
import type { CmpLocale, Territory } from "./types";

/**
 * The words of the comparison page (titles, the lead, the FAQ), every figure
 * read from the territories' data and the worked example's engine.
 */

const L = <T,>(locale: CmpLocale, v: Record<CmpLocale, T>): T => v[locale];

export interface CmpMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
}

/** The example's results: the ones computed, cheapest first. */
function computed(): (ExampleRow & { result: NonNullable<ExampleRow["result"]> })[] {
  return exampleRows().filter((r): r is ExampleRow & { result: NonNullable<ExampleRow["result"]> } => r.result !== null);
}

/** "Andalucía, Madrid y Ceuta" in the reader's language. */
export function listNames(names: readonly string[], locale: CmpLocale): string {
  if (names.length <= 1) return names[0] ?? "";
  const and = { ca: " i ", es: " y ", en: " and " }[locale];
  return `${names.slice(0, -1).join(", ")}${and}${names[names.length - 1]}`;
}

/** The territories where the example pays the least and the most. */
export function extremes(): { low: Territory[]; lowPay: number; high: Territory[]; highPay: number; computed: number; total: number } {
  const done = computed();
  const lowPay = done[0]!.result.toPay;
  const highPay = done[done.length - 1]!.result.toPay;
  return {
    low: done.filter((r) => r.result.toPay === lowPay).map((r) => r.territory),
    lowPay,
    high: done.filter((r) => r.result.toPay === highPay).map((r) => r.territory),
    highPay,
    computed: done.length,
    total: TERRITORIES.length,
  };
}

export function cmpMeta(locale: CmpLocale): CmpMeta {
  const x = extremes();
  const M = (n: number) => money(Math.round(n), locale);
  return L(locale, {
    ca: {
      title: "Impost de successions per comunitat 2026: comparativa",
      description: `Un fill que hereta ${money(EXAMPLE.share, "ca")} paga de ${M(x.lowPay)} a ${M(x.highPay)} segons on vivia el difunt. Reduccions, bonificacions i habitatge de cada territori, amb l'article.`,
      h1: "Impost de successions per comunitat: on es paga menys el 2026",
      breadcrumb: "Successions per comunitat",
    },
    es: {
      title: "Impuesto de sucesiones por comunidad 2026: comparativa",
      description: `Un hijo que hereda ${money(EXAMPLE.share, "es")} paga de ${M(x.lowPay)} a ${M(x.highPay)} según dónde vivía el fallecido. Reducciones, bonificaciones y vivienda de cada territorio, con su artículo.`,
      h1: "Impuesto de sucesiones por comunidad: dónde se paga menos en 2026",
      breadcrumb: "Sucesiones por comunidad",
    },
    en: {
      title: "Spain inheritance tax by region 2026: comparison",
      description: `A child inheriting ${money(EXAMPLE.share, "en")} pays from ${M(x.lowPay)} to ${M(x.highPay)} depending on where the deceased lived. Each region's reductions, rebates and home relief, with the article.`,
      h1: "Inheritance tax by region in Spain: where you pay least in 2026",
      breadcrumb: "Inheritance tax by region",
    },
  });
}

export const CMP_HEADINGS = {
  ca: {
    example: "El mateix cas a cada territori",
    inheritance: "Herències: fills, cònjuge, habitatge i germans",
    gifts: "Donacions de pares a fills",
    which: "Quina norma s'aplica",
    texts: "El text de cada norma",
    calculators: "Calcula el teu cas",
    csv: "Descarrega les dades (CSV) i com citar-les",
    faq: "Preguntes freqüents",
    sources: "Fonts oficials",
    limits: "Què no compara",
  },
  es: {
    example: "El mismo caso en cada territorio",
    inheritance: "Herencias: hijos, cónyuge, vivienda y hermanos",
    gifts: "Donaciones de padres a hijos",
    which: "Qué norma se aplica",
    texts: "El texto de cada norma",
    calculators: "Calcula tu caso",
    csv: "Descarga los datos (CSV) y cómo citarlos",
    faq: "Preguntas frecuentes",
    sources: "Fuentes oficiales",
    limits: "Qué no compara",
  },
  en: {
    example: "The same case in every territory",
    inheritance: "Inheritances: children, spouse, home and siblings",
    gifts: "Gifts from parents to children",
    which: "Which rules apply",
    texts: "The text of each law",
    calculators: "Work out your own case",
    csv: "Download the data (CSV) and how to cite it",
    faq: "Questions",
    sources: "Official sources",
    limits: "What it does not compare",
  },
} as const satisfies Record<CmpLocale, Record<string, string>>;

/** The example, in words. */
export function exampleCase(locale: CmpLocale): string {
  const M = (n: number) => money(n, locale);
  return L(locale, {
    ca: `Un fill de ${EXAMPLE.age} anys, hereu únic, rep ${M(EXAMPLE.share)} nets (base imposable), dels quals ${M(EXAMPLE.home)} són l'habitatge habitual de la persona morta, on ell no vivia. La persona morta vivia al territori des de feia més de cinc anys; el fill viu a Espanya, no té discapacitat, ni patrimoni previ ni assegurança de vida, presenta dins de termini i conserva l'habitatge els anys que demana la llei.`,
    es: `Un hijo de ${EXAMPLE.age} años, heredero único, recibe ${M(EXAMPLE.share)} netos (base imponible), de los que ${M(EXAMPLE.home)} son la vivienda habitual de la persona fallecida, en la que él no vivía. La persona fallecida vivía en el territorio desde hacía más de cinco años; el hijo vive en España, no tiene discapacidad, ni patrimonio previo ni seguro de vida, presenta en plazo y conserva la vivienda los años que pide la ley.`,
    en: `A ${EXAMPLE.age}-year-old child, the only heir, receives ${M(EXAMPLE.share)} net (the taxable base), of which ${M(EXAMPLE.home)} is the deceased's habitual home, where the child did not live. The deceased had lived in the territory for more than five years; the child lives in Spain, has no disability, no prior wealth and no life insurance, files on time and keeps the home for the years the law requires.`,
  });
}

/** The page's first paragraph. */
export function cmpLead(locale: CmpLocale): string {
  const x = extremes();
  // More than four territories at the lowest figure: their number, not the list (the FAQ names them).
  const names = (ts: Territory[]) =>
    ts.length > 4 ? L(locale, { ca: `${ts.length} dels ${x.total} territoris`, es: `${ts.length} de los ${x.total} territorios`, en: `${ts.length} of the ${x.total} territories` }) : listNames(ts.map((t) => t.name[locale]), locale);
  const M = (n: number) => money(n, locale);
  return L(locale, {
    ca: `Els mateixos ${M(EXAMPLE.share)} que hereta un fill de ${EXAMPLE.age} anys (amb ${M(EXAMPLE.home)} d'habitatge) paguen ${M(x.lowPay)} a ${names(x.low)} i ${M(x.highPay)} a ${names(x.high)}. Mana la norma del territori on vivia la persona morta: aquí hi ha les reduccions, la bonificació i l'habitatge de cada un, amb l'article i la data, i el mateix cas calculat ${x.computed === x.total ? `als ${x.total} territoris` : `a ${x.computed} dels ${x.total} territoris`}.`,
    es: `Los mismos ${M(EXAMPLE.share)} que hereda un hijo de ${EXAMPLE.age} años (con ${M(EXAMPLE.home)} de vivienda) pagan ${M(x.lowPay)} en ${names(x.low)} y ${M(x.highPay)} en ${names(x.high)}. Manda la norma del territorio donde vivía la persona fallecida: aquí están las reducciones, la bonificación y la vivienda de cada uno, con su artículo y su fecha, y el mismo caso calculado ${x.computed === x.total ? `en los ${x.total} territorios` : `en ${x.computed} de los ${x.total} territorios`}.`,
    en: `The same ${M(EXAMPLE.share)} inherited by a ${EXAMPLE.age}-year-old child (${M(EXAMPLE.home)} of it the home) pays ${M(x.lowPay)} in ${names(x.low)} and ${M(x.highPay)} in ${names(x.high)}. The rules of the territory where the deceased lived apply: here are each one's reductions, rebate and home relief, with the article and its date, and the same case worked out ${x.computed === x.total ? `in all ${x.total} territories` : `in ${x.computed} of the ${x.total} territories`}.`,
  });
}

export function cmpFresh(locale: CmpLocale): string {
  return L(locale, {
    ca: `Normes llegides ${elDay(RULES_AS_OF, "ca")} als textos consolidats del BOE, als butlletins i a les normes forals. Es tornen a revisar ${fromDay(RULES_UNTIL, "ca")}, quan entren en vigor moltes lleis de pressupostos.`,
    es: `Normas leídas ${elDay(RULES_AS_OF, "es")} en los textos consolidados del BOE, los boletines y las normas forales. Se revisan de nuevo ${fromDay(RULES_UNTIL, "es")}, cuando entran en vigor muchas leyes de presupuestos.`,
    en: `Rules read ${elDay(RULES_AS_OF, "en")} in the BOE's consolidated texts, the regional bulletins and the foral norms. Due for a fresh check ${fromDay(RULES_UNTIL, "en")}, when many budget laws take effect.`,
  });
}

export function cmpDisclaimer(locale: CmpLocale): string {
  return L(locale, {
    ca: "Informació orientativa, no assessorament fiscal. Cada cel·la resumeix la norma vigent el dia de la lectura i n'enllaça el text; el càlcul oficial és la teva autoliquidació davant l'administració del territori, que valora els béns i comprova cada requisit. Una herència amb empreses, usdefruits, finques rústiques, béns a l'estranger o hereus amb discapacitat necessita les normes completes o un assessor.",
    es: "Información orientativa, no asesoramiento fiscal. Cada celda resume la norma vigente el día de la lectura y enlaza su texto; el cálculo oficial es tu autoliquidación ante la administración del territorio, que valora los bienes y comprueba cada requisito. Una herencia con empresas, usufructos, fincas rústicas, bienes en el extranjero o herederos con discapacidad necesita las normas completas o un asesor.",
    en: "Guidance, not tax advice. Each cell sums up the rule in force on the day it was read and links its text; the official figure is your self-assessment with the territory's tax office, which values the assets and checks every condition. An estate with businesses, usufructs, rural land, assets abroad or heirs with a disability needs the full rules or an adviser.",
  });
}

/** The calculators on the site for one territory, if any. */
export function calculatorLinks(t: Territory, locale: CmpLocale): { inheritance: string; gift: string } | null {
  return t.calculator ? { inheritance: calcPath(t.calculator.inheritance, locale), gift: calcPath(t.calculator.gift, locale) } : null;
}
