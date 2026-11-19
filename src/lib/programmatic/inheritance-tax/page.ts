import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { ISD_LOCALES, isdEditions, money, percent, type IsdLocale } from "./copy";
import { calculateOk, inputOf, type IsdInput, type IsdOk } from "./engine";
import { DEADLINE, HOME, INSURANCE, KINSHIP, RULES_AS_OF } from "./rules";

/**
 * Pure pieces of the inheritance tax page: titles, the default input, the
 * ATC's worked examples (each with the figures the ATC prints, which the
 * tests compare with the engine), our own hand-checked cases, the FAQ and the
 * sitemap entries. Every figure the page prints comes from the engine.
 */

/** The first render, on the server: the ATC's worked example 1 (a 30-year-old son, 120.000 €). */
export const DEFAULT_INPUT: IsdInput = inputOf({ relation: "child", age: 30, share: 120_000 });

export type AtcExampleId = "son" | "mother" | "brother" | "spouse" | "spouse-home" | "spouse-usufruct";

/**
 * The ATC's "Exemples pràctics d'herències" (deaths in 2023, the rules still
 * in force), as inputs to the engine and the ATC's own results. Case 4's base
 * imposable already includes the household goods and takes off the funeral;
 * case 6 is the widow's usufruct (351.000 €, prior wealth 600.000 €), whose
 * self-assessment needs nothing the calculator lacks (the son's bare
 * ownership does: it is left out).
 */
export const ATC_EXAMPLES: readonly { id: AtcExampleId; input: IsdInput; official: { baseLiquidable: number; quotaTributaria: number; toPay: number } }[] = [
  { id: "son", input: inputOf({ relation: "child", age: 30, share: 120_000 }), official: { baseLiquidable: 20_000, quotaTributaria: 1_400, toPay: 571.62 } },
  { id: "mother", input: inputOf({ relation: "ascendant", age: 75, share: 100_000, insurance: 50_000 }), official: { baseLiquidable: 0, quotaTributaria: 0, toPay: 0 } },
  { id: "brother", input: inputOf({ relation: "collateral", age: 60, share: 100_000 }), official: { baseLiquidable: 92_000, quotaTributaria: 12_896.18, toPay: 12_896.18 } },
  { id: "spouse", input: inputOf({ relation: "spouse", age: 70, share: 107_600 }), official: { baseLiquidable: 7_600, quotaTributaria: 532, toPay: 5.32 } },
  { id: "spouse-home", input: inputOf({ relation: "spouse", age: 70, share: 107_600, homeValue: 100_000 }), official: { baseLiquidable: 0, quotaTributaria: 0, toPay: 0 } },
  { id: "spouse-usufruct", input: inputOf({ relation: "spouse", age: 62, share: 351_000, priorWealth: 600_000 }), official: { baseLiquidable: 251_000, quotaTributaria: 34_837, toPay: 348.37 } },
];

/** The ATC's three habitual-home examples (reductions page) and the reduction it gives each heir. */
export const ATC_HOME_EXAMPLES: readonly { id: "home-460k" | "home-1m" | "home-half-1m"; input: IsdInput; official: number }[] = [
  { id: "home-460k", input: inputOf({ relation: "child", age: 40, share: 230_000, homeValue: 460_000, homeHeirPct: 50 }), official: 218_500 },
  { id: "home-1m", input: inputOf({ relation: "child", age: 40, share: 500_000, homeValue: 1_000_000, homeHeirPct: 50 }), official: 250_000 },
  { id: "home-half-1m", input: inputOf({ relation: "child", age: 40, share: 250_000, homeValue: 1_000_000, homeOwnedPct: 50, homeHeirPct: 50 }), official: 180_000 },
];

export type OwnExampleId = "child-15" | "daughter-home" | "niece" | "friend";

/** Our own cases, checked by hand against the quoted scale in tests/inheritance-tax.test.ts. */
export const OWN_EXAMPLES: readonly { id: OwnExampleId; input: IsdInput }[] = [
  { id: "child-15", input: inputOf({ relation: "child", age: 15, share: 300_000 }) },
  { id: "daughter-home", input: inputOf({ relation: "child", age: 50, share: 400_000, homeValue: 300_000, homeHeirPct: 50 }) },
  { id: "niece", input: inputOf({ relation: "collateral", age: 45, share: 200_000 }) },
  { id: "friend", input: inputOf({ relation: "unrelated", age: 50, share: 100_000 }) },
];

export function examples(): { atc: { id: AtcExampleId; input: IsdInput; result: IsdOk }[]; own: { id: OwnExampleId; input: IsdInput; result: IsdOk }[] } {
  return {
    atc: ATC_EXAMPLES.map((e) => ({ id: e.id, input: e.input, result: calculateOk(e.input) })),
    own: OWN_EXAMPLES.map((e) => ({ id: e.id, input: e.input, result: calculateOk(e.input) })),
  };
}

const atc = (id: AtcExampleId) => calculateOk(ATC_EXAMPLES.find((e) => e.id === id)!.input);
const own = (id: OwnExampleId) => calculateOk(OWN_EXAMPLES.find((e) => e.id === id)!.input);

export interface IsdMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function isdMeta(locale: IsdLocale): IsdMeta {
  const son = atc("son");
  const M = (n: number) => money(n, locale);
  return {
    ca: {
      title: "Impost de successions a Catalunya 2026: calculadora",
      description: `Un fill de 30 anys que hereta 120.000 € paga ${M(son.toPay)}. Calcula l'impost de successions amb reduccions, tarifa i bonificació, pas a pas i amb l'article.`,
      h1: "Impost de successions a Catalunya: calculadora pas a pas",
      breadcrumb: "Impost de successions",
      appName: "Calculadora de l'impost de successions a Catalunya (Codi tributari, llibre sisè)",
    },
    es: {
      title: "Impuesto de sucesiones en Cataluña 2026: calculadora",
      description: `Un hijo de 30 años que hereda 120.000 € paga ${M(son.toPay)}. Calcula el impuesto de sucesiones con reducciones, tarifa y bonificación, paso a paso y con el artículo.`,
      h1: "Impuesto de sucesiones en Cataluña: calculadora paso a paso",
      breadcrumb: "Impuesto de sucesiones",
      appName: "Calculadora del impuesto de sucesiones en Cataluña (Código tributario, libro sexto)",
    },
    en: {
      title: "Catalonia inheritance tax calculator 2026",
      description: `A 30-year-old son inheriting €120,000 pays ${M(son.toPay)}. Work out Catalan inheritance tax with the reductions, scale and rebate, step by step, article by article.`,
      h1: "Catalonia inheritance tax: step-by-step calculator",
      breadcrumb: "Inheritance tax",
      appName: "Catalonia inheritance tax calculator (Catalan Tax Code, book six)",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function isdSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = isdEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return ISD_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "en" ? 0.6 : 0.8,
    alternates: { languages },
  }));
}

/** The FAQ, every figure from the engine (also the FAQPage JSON-LD). */
export function isdFaq(locale: IsdLocale): { q: string; a: string }[] {
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const son = atc("son");
  const spouse = atc("spouse");
  const brother = atc("brother");
  const child15 = own("child-15");
  const dh = own("daughter-home");
  const k = M(KINSHIP.child);
  const floor = M(HOME.individualFloor);
  const cap = M(HOME.sharedCap);
  const ins = M(INSURANCE.max);
  const m = DEADLINE.months;
  return {
    ca: [
      { q: "Quant paga un fill per l'impost de successions a Catalunya?", a: `Si té 21 anys o més, la reducció per parentiu és de ${k} i la resta paga amb la tarifa, menys una bonificació que depèn de la base. En el cas pràctic de l'ATC, un fill de 30 anys que hereta 120.000 € paga ${M(son.toPay)}: base liquidable ${M(son.baseLiquidable)}, quota ${M(son.quotaTributaria)}, bonificació del ${P(son.bonusPct)}. Un fill de 15 anys que hereta 300.000 € en paga ${M(child15.toPay)}.` },
      { q: "El cònjuge paga impost de successions a Catalunya?", a: `Molt poc: té ${M(KINSHIP.spouse)} de reducció i una bonificació del 99 % de la quota (art. 633-4.1), la mateixa per a la parella estable. En el cas pràctic 4 de l'ATC, una vídua amb una base de 107.600 € paga ${M(spouse.toPay)}.` },
      { q: "Quant paga un germà o un nebot?", a: `Són del grup III: només ${M(KINSHIP.groupIII)} de reducció, coeficient 1,5882 i cap bonificació. Un germà que hereta 100.000 € paga ${M(brother.toPay)} (cas pràctic 3 de l'ATC), el ${P(brother.effectiveRate * 100)} del que rep.` },
      { q: "Com funciona la reducció per l'habitatge habitual?", a: `Es redueix el 95 % del valor de l'habitatge de la persona morta, amb un límit de ${cap} per a tot l'habitatge repartit entre els hereus segons la seva part, però mai menys de ${floor} per hereu. Cal conservar-lo ${HOME.keepYears} anys (art. 631-19). Una filla que hereta 400.000 €, entre els quals la meitat d'un habitatge de 300.000 €, té ${M(dh.home.theoretical)} de reducció i paga ${M(dh.toPay)}.` },
      { q: "Quin termini hi ha per pagar l'impost de successions?", a: `${m} mesos des de la mort. Durant els ${DEADLINE.askWithinMonths} primers mesos es pot demanar una pròrroga de ${DEADLINE.extensionMonths} mesos més, amb interessos de demora pels dies prorrogats. Es presenta a l'Agència Tributària de Catalunya amb els models 660 i 650 (un per hereu).` },
      { q: "L'assegurança de vida paga successions?", a: `Sí, si la va contractar la persona morta: se suma al que reps. El cònjuge, els descendents i els ascendents tenen una reducció del 100 % fins a ${ins}, una sola vegada per hereu (art. 631-5).` },
      { q: "Quan es paga a Catalunya i no a una altra comunitat?", a: "Si la persona morta vivia a Espanya i tu també, es paga a la comunitat on va viure més dies dels últims cinc anys, amb les seves normes. Si l'hereu no viu a Espanya, l'impost el gestiona l'Agència Tributària de l'Estat (AEAT)." },
      { q: "Hi ha un simulador oficial de l'ATC?", a: "L'ATC no en té cap a la seva pàgina de simuladors. El càlcul oficial és l'autoliquidació: el programa d'ajuda del model 650, que es descarrega del web de l'ATC, o el servei d'assistència a les oficines. Aquesta calculadora és una estimació." },
    ],
    es: [
      { q: "¿Cuánto paga un hijo por el impuesto de sucesiones en Cataluña?", a: `Si tiene 21 años o más, la reducción por parentesco es de ${k} y el resto paga con la tarifa, menos una bonificación que depende de la base. En el caso práctico de la ATC, un hijo de 30 años que hereda 120.000 € paga ${M(son.toPay)}: base liquidable ${M(son.baseLiquidable)}, cuota ${M(son.quotaTributaria)}, bonificación del ${P(son.bonusPct)}. Un hijo de 15 años que hereda 300.000 € paga ${M(child15.toPay)}.` },
      { q: "¿El cónyuge paga impuesto de sucesiones en Cataluña?", a: `Muy poco: tiene ${M(KINSHIP.spouse)} de reducción y una bonificación del 99 % de la cuota (art. 633-4.1), la misma para la pareja estable. En el caso práctico 4 de la ATC, una viuda con una base de 107.600 € paga ${M(spouse.toPay)}.` },
      { q: "¿Cuánto paga un hermano o un sobrino?", a: `Son del grupo III: solo ${M(KINSHIP.groupIII)} de reducción, coeficiente 1,5882 y ninguna bonificación. Un hermano que hereda 100.000 € paga ${M(brother.toPay)} (caso práctico 3 de la ATC), el ${P(brother.effectiveRate * 100)} de lo que recibe.` },
      { q: "¿Cómo funciona la reducción por la vivienda habitual?", a: `Se reduce el 95 % del valor de la vivienda de la persona fallecida, con un límite de ${cap} para toda la vivienda repartido entre los herederos según su parte, pero nunca menos de ${floor} por heredero. Hay que conservarla ${HOME.keepYears} años (art. 631-19). Una hija que hereda 400.000 €, entre ellos la mitad de una vivienda de 300.000 €, tiene ${M(dh.home.theoretical)} de reducción y paga ${M(dh.toPay)}.` },
      { q: "¿Qué plazo hay para pagar el impuesto de sucesiones?", a: `${m} meses desde el fallecimiento. Durante los ${DEADLINE.askWithinMonths} primeros meses se puede pedir una prórroga de ${DEADLINE.extensionMonths} meses más, con intereses de demora por los días prorrogados. Se presenta en la Agència Tributària de Catalunya con los modelos 660 y 650 (uno por heredero).` },
      { q: "¿El seguro de vida paga sucesiones?", a: `Sí, si lo contrató la persona fallecida: se suma a lo que recibes. El cónyuge, los descendientes y los ascendientes tienen una reducción del 100 % hasta ${ins}, una sola vez por heredero (art. 631-5).` },
      { q: "¿Cuándo se paga en Cataluña y no en otra comunidad?", a: "Si la persona fallecida vivía en España y tú también, se paga en la comunidad donde vivió más días de los últimos cinco años, con sus normas. Si el heredero no vive en España, el impuesto lo gestiona la Agencia Tributaria del Estado (AEAT)." },
      { q: "¿Hay un simulador oficial de la ATC?", a: "La ATC no tiene ninguno en su página de simuladores. El cálculo oficial es la autoliquidación: el programa de ayuda del modelo 650, que se descarga de la web de la ATC, o el servicio de asistencia en sus oficinas. Esta calculadora es una estimación." },
    ],
    en: [
      { q: "How much inheritance tax does a child pay in Catalonia?", a: `At 21 or over, the kinship reduction is ${k}; the rest is taxed on the scale, less a rebate that depends on the base. In the ATC's worked example a 30-year-old son inheriting €120,000 pays ${M(son.toPay)}: net taxable base ${M(son.baseLiquidable)}, tax ${M(son.quotaTributaria)}, rebate ${P(son.bonusPct)}. A 15-year-old inheriting €300,000 pays ${M(child15.toPay)}.` },
      { q: "Does a surviving spouse pay inheritance tax in Catalonia?", a: `Very little: a ${M(KINSHIP.spouse)} reduction and a 99% rebate on the tax (art. 633-4.1), the same for a stable partner. In the ATC's worked example 4, a widow with a €107,600 base pays ${M(spouse.toPay)}.` },
      { q: "How much does a brother, sister, nephew or niece pay?", a: `They are group III: only ${M(KINSHIP.groupIII)} of reduction, a 1.5882 coefficient and no rebate. A brother inheriting €100,000 pays ${M(brother.toPay)} (ATC worked example 3), ${P(brother.effectiveRate * 100)} of what he receives.` },
      { q: "How does the habitual home reduction work?", a: `95% of the value of the deceased's home comes off, with a ${cap} cap for the whole home split between the heirs by their share, but never below ${floor} per heir. The heir must keep it for ${HOME.keepYears} years (art. 631-19). A daughter who inherits €400,000, including half of a €300,000 home, gets ${M(dh.home.theoretical)} off and pays ${M(dh.toPay)}.` },
      { q: "What is the deadline to pay Catalan inheritance tax?", a: `${m} months from the death. In the first ${DEADLINE.askWithinMonths} months you can ask for ${DEADLINE.extensionMonths} more months, with late-payment interest for the extra days. It is filed with the Agència Tributària de Catalunya (ATC) on forms 660 and 650 (one per heir).` },
      { q: "Is life insurance subject to inheritance tax?", a: `Yes, when the deceased took the policy out: it is added to what you receive. Spouses, descendants and ascendants get a 100% reduction up to ${ins}, once per heir (art. 631-5).` },
      { q: "When is it paid in Catalonia rather than another region?", a: "If the deceased lived in Spain and so do you, it is paid in the region where the deceased lived the most days of the last five years, under its rules. If the heir does not live in Spain, the State Tax Agency (AEAT) handles it." },
      { q: "Is there an official ATC simulator?", a: "The ATC lists none on its simulators page. The official calculation is the self-assessment: the help program for form 650, downloaded from the ATC's website, or the assistance service at its offices. This calculator is an estimate." },
    ],
  }[locale];
}
