import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { ISD_LOCALES, money, percent, type IsdLocale } from "./copy";
import { calculateRegionalOk, regionalInputOf, type RegionalInput, type RegionalOk } from "./regional-engine";
import { REGION_AGENCY, REGION_IN, regionEditions } from "./regional-copy";
import { ANDALUCIA_RULES } from "./regions/andalucia";
import { MADRID_RULES } from "./regions/madrid";
import { DEADLINE, RULES_AS_OF } from "./regions/state";
import { REGION_IDS, type RegionId, type RegionRules } from "./regions/types";
import { VALENCIA_DATES, VALENCIA_RULES } from "./regions/valencia";

/**
 * Pure pieces of the Madrid, Andalucía and Comunitat Valenciana pages:
 * titles, the worked examples (Madrid's own published figure and our cases,
 * checked by hand in tests/inheritance-tax-regions.test.ts), the FAQ and the
 * sitemap entries. Every figure comes from the engine.
 */

export const REGION_RULES: Record<RegionId, RegionRules> = { madrid: MADRID_RULES, andalucia: ANDALUCIA_RULES, valencia: VALENCIA_RULES };

export interface RegionExample {
  id: string;
  label: Record<IsdLocale, string>;
  input: RegionalInput;
  /** A figure the community itself publishes for this case. */
  official?: { quotaIntegra: number; toPay: number };
}

const child = (age: number, share: number, extra: Partial<RegionalInput> = {}) => regionalInputOf({ relation: "child", age, share, ...extra });

/** The first one is what the server renders in the calculator. */
export const REGION_EXAMPLES: Record<RegionId, readonly RegionExample[]> = {
  madrid: [
    { id: "son-300k", label: { ca: "Fill de 30 anys, 300.000 €", es: "Hijo de 30 años, 300.000 €", en: "Son aged 30, €300,000" }, input: child(30, 300_000) },
    {
      id: "official-1250",
      label: { ca: "Exemple de la Comunitat de Madrid: quota íntegra d'1.250 € (fill de 30 anys, 31.537,20 €)", es: "Ejemplo de la Comunidad de Madrid: cuota íntegra de 1.250 € (hijo de 30 años, 31.537,20 €)", en: "The Madrid region's own example: €1,250 gross tax (son aged 30, €31,537.20)" },
      input: child(30, 31_537.2),
      official: { quotaIntegra: 1_250, toPay: 12.5 },
    },
    { id: "son-15", label: { ca: "Fill de 15 anys, 200.000 €", es: "Hijo de 15 años, 200.000 €", en: "Son aged 15, €200,000" }, input: child(15, 200_000) },
    { id: "daughter-home", label: { ca: "Filla de 50 anys, 400.000 € amb la meitat d'un habitatge de 300.000 €", es: "Hija de 50 años, 400.000 € con la mitad de una vivienda de 300.000 €", en: "Daughter aged 50, €400,000 including half of a €300,000 home" }, input: child(50, 400_000, { homeValue: 300_000, homeHeirPct: 50 }) },
    { id: "brother", label: { ca: "Germà de 60 anys, 150.000 €", es: "Hermano de 60 años, 150.000 €", en: "Brother aged 60, €150,000" }, input: regionalInputOf({ relation: "collateral", age: 60, share: 150_000 }) },
    { id: "friend", label: { ca: "Amic sense parentiu, 100.000 €", es: "Amigo sin parentesco, 100.000 €", en: "Unrelated friend, €100,000" }, input: regionalInputOf({ relation: "unrelated", age: 50, share: 100_000 }) },
  ],
  andalucia: [
    { id: "son-1200k", label: { ca: "Fill de 30 anys, 1.200.000 €", es: "Hijo de 30 años, 1.200.000 €", en: "Son aged 30, €1,200,000" }, input: child(30, 1_200_000) },
    { id: "daughter-600k", label: { ca: "Filla de 40 anys, 600.000 €", es: "Hija de 40 años, 600.000 €", en: "Daughter aged 40, €600,000" }, input: child(40, 600_000) },
    { id: "son-home", label: { ca: "Fill de 50 anys, 1.300.000 € amb un habitatge de 250.000 €", es: "Hijo de 50 años, 1.300.000 € con una vivienda de 250.000 €", en: "Son aged 50, €1,300,000 including a €250,000 home" }, input: child(50, 1_300_000, { homeValue: 250_000 }) },
    { id: "nephew", label: { ca: "Nebot de 45 anys, 100.000 €", es: "Sobrino de 45 años, 100.000 €", en: "Nephew aged 45, €100,000" }, input: regionalInputOf({ relation: "collateral", age: 45, share: 100_000 }) },
    { id: "friend", label: { ca: "Amic sense parentiu, 100.000 €", es: "Amigo sin parentesco, 100.000 €", en: "Unrelated friend, €100,000" }, input: regionalInputOf({ relation: "unrelated", age: 50, share: 100_000 }) },
  ],
  valencia: [
    { id: "son-300k", label: { ca: "Fill de 30 anys, 300.000 €", es: "Hijo de 30 años, 300.000 €", en: "Son aged 30, €300,000" }, input: child(30, 300_000) },
    { id: "daughter-home", label: { ca: "Filla de 40 anys, 400.000 € amb la meitat d'un habitatge de 300.000 €", es: "Hija de 40 años, 400.000 € con la mitad de una vivienda de 300.000 €", en: "Daughter aged 40, €400,000 including half of a €300,000 home" }, input: child(40, 400_000, { homeValue: 300_000, homeHeirPct: 50 }) },
    { id: "brother", label: { ca: "Germà de 60 anys, 100.000 €", es: "Hermano de 60 años, 100.000 €", en: "Brother aged 60, €100,000" }, input: regionalInputOf({ relation: "collateral", age: 60, share: 100_000 }) },
    { id: "brother-in-law", label: { ca: "Cunyat de 60 anys, 100.000 €", es: "Cuñado de 60 años, 100.000 €", en: "Brother-in-law aged 60, €100,000" }, input: regionalInputOf({ relation: "affinity", age: 60, share: 100_000 }) },
    { id: "friend", label: { ca: "Amic sense parentiu, 100.000 €", es: "Amigo sin parentesco, 100.000 €", en: "Unrelated friend, €100,000" }, input: regionalInputOf({ relation: "unrelated", age: 50, share: 100_000 }) },
    { id: "friend-disability", label: { ca: "Amic amb discapacitat del 65 %, 300.000 €", es: "Amigo con discapacidad del 65 %, 300.000 €", en: "Unrelated friend with a 65% disability, €300,000" }, input: regionalInputOf({ relation: "unrelated", age: 50, share: 300_000, disability: 65 }) },
  ],
};

export function regionDefaultInput(region: RegionId): RegionalInput {
  return REGION_EXAMPLES[region][0]!.input;
}

export function regionExampleResults(region: RegionId): (RegionExample & { result: RegionalOk })[] {
  return REGION_EXAMPLES[region].map((e) => ({ ...e, result: calculateRegionalOk(REGION_RULES[region], e.input) }));
}

/** One example's result by id. */
export function regionExample(region: RegionId, id: string): RegionalOk {
  const e = REGION_EXAMPLES[region].find((x) => x.id === id);
  if (!e) throw new Error(`inheritance-tax ${region}: no example ${id}`);
  return calculateRegionalOk(REGION_RULES[region], e.input);
}

export interface RegionMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function regionMeta(region: RegionId, locale: IsdLocale): RegionMeta {
  const M = (n: number) => money(n, locale);
  if (region === "madrid") {
    const son = regionExample("madrid", "son-300k");
    return {
      ca: {
        title: "Impost de successions a Madrid 2026: calculadora",
        description: `Un fill de 30 anys que hereta 300.000 € paga ${M(son.toPay)}. Calcula l'impost de successions a Madrid pas a pas: reduccions, tarifa i bonificació del 99 % o el 50 %.`,
        h1: "Impost de successions a la Comunitat de Madrid: calculadora pas a pas",
        breadcrumb: "Successions a Madrid",
        appName: "Calculadora de l'impost de successions a la Comunitat de Madrid (Decret legislatiu 1/2010)",
      },
      es: {
        title: "Impuesto de sucesiones en Madrid 2026: calculadora",
        description: `Un hijo de 30 años que hereda 300.000 € paga ${M(son.toPay)}. Impuesto de sucesiones en Madrid paso a paso: reducciones, tarifa y bonificación del 99 % o el 50 %.`,
        h1: "Impuesto de sucesiones en la Comunidad de Madrid: calculadora paso a paso",
        breadcrumb: "Sucesiones en Madrid",
        appName: "Calculadora del impuesto de sucesiones en la Comunidad de Madrid (Decreto Legislativo 1/2010)",
      },
      en: {
        title: "Madrid inheritance tax calculator 2026",
        description: `A 30-year-old son inheriting €300,000 pays ${M(son.toPay)}. Work out Madrid inheritance tax with the reductions, scale and 99% or 50% rebate, step by step.`,
        h1: "Madrid inheritance tax: step-by-step calculator",
        breadcrumb: "Madrid inheritance tax",
        appName: "Madrid region inheritance tax calculator (Legislative Decree 1/2010)",
      },
    }[locale];
  }
  if (region === "andalucia") {
    const son = regionExample("andalucia", "son-1200k");
    return {
      ca: {
        title: "Impost de successions a Andalusia 2026: calculadora",
        description: `Fills, cònjuge i pares redueixen 1.000.000 € i es bonifiquen el 99 %: qui hereta 1.200.000 € paga ${M(son.toPay)}. L'impost de successions a Andalusia, pas a pas.`,
        h1: "Impost de successions a Andalusia: calculadora pas a pas",
        breadcrumb: "Successions a Andalusia",
        appName: "Calculadora de l'impost de successions a Andalusia (Llei 5/2021 de tributs cedits)",
      },
      es: {
        title: "Impuesto de sucesiones en Andalucía 2026: calculadora",
        description: `Hijos, cónyuge y padres reducen 1.000.000 € y se bonifican el 99 %: quien hereda 1.200.000 € paga ${M(son.toPay)}. El impuesto de sucesiones en Andalucía, paso a paso.`,
        h1: "Impuesto de sucesiones en Andalucía: calculadora paso a paso",
        breadcrumb: "Sucesiones en Andalucía",
        appName: "Calculadora del impuesto de sucesiones en Andalucía (Ley 5/2021 de Tributos Cedidos)",
      },
      en: {
        title: "Andalusia inheritance tax calculator 2026",
        description: `Children, spouses and parents deduct €1,000,000 and get a 99% rebate: an heir to €1,200,000 pays ${M(son.toPay)}. Work out Andalusian inheritance tax step by step.`,
        h1: "Andalusia inheritance tax: step-by-step calculator",
        breadcrumb: "Andalusia inheritance tax",
        appName: "Andalusia inheritance tax calculator (Ceded Taxes Act, Law 5/2021)",
      },
    }[locale];
  }
  const son = regionExample("valencia", "son-300k");
  return {
    ca: {
      title: "Impost de successions a la Comunitat Valenciana 2026",
      description: `Un fill de 30 anys que hereta 300.000 € paga ${M(son.toPay)}. Calcula l'impost de successions a la Comunitat Valenciana amb reduccions i bonificacions, pas a pas.`,
      h1: "Impost de successions a la Comunitat Valenciana: calculadora pas a pas",
      breadcrumb: "Successions a la C. Valenciana",
      appName: "Calculadora de l'impost de successions a la Comunitat Valenciana (Llei 13/1997)",
    },
    es: {
      title: "Impuesto de sucesiones Comunidad Valenciana 2026",
      description: `Un hijo de 30 años que hereda 300.000 € paga ${M(son.toPay)}. Calcula paso a paso el impuesto de sucesiones en la Comunidad Valenciana: reducciones y bonificaciones.`,
      h1: "Impuesto de sucesiones en la Comunidad Valenciana: calculadora paso a paso",
      breadcrumb: "Sucesiones en la C. Valenciana",
      appName: "Calculadora del impuesto de sucesiones en la Comunitat Valenciana (Ley 13/1997)",
    },
    en: {
      title: "Valencia region inheritance tax calculator 2026",
      description: `A 30-year-old son inheriting €300,000 pays ${M(son.toPay)}. Work out inheritance tax in the Valencia region (Comunitat Valenciana) with its reductions and rebates.`,
      h1: "Valencia region inheritance tax: step-by-step calculator",
      breadcrumb: "Valencia inheritance tax",
      appName: "Valencia region inheritance tax calculator (Valencian Law 13/1997)",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function regionSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  return REGION_IDS.flatMap((region) => {
    const e = regionEditions(region);
    const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
    return ISD_LOCALES.map((locale) => ({
      url: absoluteUrl(e[locale]),
      lastModified: new Date(`${lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.6 : 0.8,
      alternates: { languages },
    }));
  });
}

/** The FAQ, every figure from the engine and the rules (also the FAQPage JSON-LD). */
export function regionFaq(region: RegionId, locale: IsdLocale): { q: string; a: string }[] {
  const rules = REGION_RULES[region];
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const where = REGION_IN[region][locale];
  const agency = REGION_AGENCY[region][locale];
  const k = rules.kinship;
  const first = regionExample(region, REGION_EXAMPLES[region][0]!.id);
  const firstLabel = REGION_EXAMPLES[region][0]!.label[locale];
  const friend = regionExample(region, "friend");
  const sibling = regionExample(region, region === "andalucia" ? "nephew" : "brother");
  const siblingLabel = REGION_EXAMPLES[region].find((e) => e.id === (region === "andalucia" ? "nephew" : "brother"))!.label[locale];
  const h = rules.home;
  const m = DEADLINE.months;
  const groupIIIBonus = rules.bonus.groupIII;

  const siblingRule = {
    madrid: {
      ca: `Són del grup III: ${M(k.groupIII)} de reducció, coeficient 1,5882 i, per a les morts des de l'1 de juliol de 2025, una bonificació del ${groupIIIBonus} % (també cunyats, sogres, gendres i joves).`,
      es: `Son del grupo III: ${M(k.groupIII)} de reducción, coeficiente 1,5882 y, para los fallecimientos desde el 1 de julio de 2025, una bonificación del ${groupIIIBonus} % (también cuñados, suegros, yernos y nueras).`,
      en: `They are group III: a ${M(k.groupIII)} reduction, a 1.5882 coefficient and, for deaths since 1 July 2025, a ${groupIIIBonus}% rebate (in-laws too).`,
    },
    andalucia: {
      ca: `Són del grup III: ${M(k.groupIII)} de reducció, coeficient 1,5 i cap bonificació.`,
      es: `Son del grupo III: ${M(k.groupIII)} de reducción, coeficiente 1,5 y ninguna bonificación.`,
      en: `They are group III: a ${M(k.groupIII)} reduction, a 1.5 coefficient and no rebate.`,
    },
    valencia: {
      ca: `Són del grup III: la reducció estatal de ${M(k.groupIII)}, coeficient 1,5882 i, per als germans, nebots i oncles de sang, una bonificació del ${groupIIIBonus} % per a les morts des de l'1 de juny de 2026 (del ${VALENCIA_DATES.groupIIIBonusNext} % des de l'1 de juny de 2027). Els parents per afinitat no en tenen.`,
      es: `Son del grupo III: la reducción estatal de ${M(k.groupIII)}, coeficiente 1,5882 y, para hermanos, sobrinos y tíos de sangre, una bonificación del ${groupIIIBonus} % para los fallecimientos desde el 1 de junio de 2026 (del ${VALENCIA_DATES.groupIIIBonusNext} % desde el 1 de junio de 2027). Los parientes por afinidad no la tienen.`,
      en: `They are group III: the state's ${M(k.groupIII)} reduction, a 1.5882 coefficient and, for blood siblings, nephews, nieces, uncles and aunts, a ${groupIIIBonus}% rebate for deaths since 1 June 2026 (${VALENCIA_DATES.groupIIIBonusNext}% from 1 June 2027). In-laws get none.`,
    },
  }[region][locale];

  const simulator = {
    madrid: {
      ca: "No. La Comunitat de Madrid fa el càlcul dins de l'autoliquidació de l'Oficina Virtual Tributària (també sense certificat, per preparar-la i pagar al banc), i la seva pàgina de l'impost en dona un exemple: una quota íntegra d'1.250 € deixa 12,50 € a pagar. Aquesta calculadora és una estimació.",
      es: "No. La Comunidad de Madrid hace el cálculo dentro de la autoliquidación de la Oficina Virtual Tributaria (también sin certificado, para prepararla y pagar en el banco), y su página del impuesto da un ejemplo: una cuota íntegra de 1.250 € deja 12,50 € a pagar. Esta calculadora es una estimación.",
      en: "No. The Madrid region works the tax out inside the self-assessment of its Oficina Virtual Tributaria (also without a certificate, to prepare it and pay at a bank), and its tax page gives one example: a €1,250 gross tax leaves €12.50 to pay. This calculator is an estimate.",
    },
    andalucia: {
      ca: "No en té cap de vigent: el càlcul oficial és l'autoliquidació dels models 650 i 660, que es fan amb el programa de la Junta d'Andalusia. Aquesta calculadora és una estimació.",
      es: "No tiene ninguno vigente: el cálculo oficial es la autoliquidación de los modelos 650 y 660, que se hacen con el programa de la Junta de Andalucía. Esta calculadora es una estimación.",
      en: "None is in service: the official calculation is the self-assessment on forms 650 and 660, prepared with the Junta de Andalucía's program. This calculator is an estimate.",
    },
    valencia: {
      ca: "No. L'ATV té simuladors del valor dels immobles i dels vehicles, però no de l'impost: el càlcul oficial el fa el programa d'ajuda en línia del model 650. Aquesta calculadora és una estimació.",
      es: "No. La ATV tiene simuladores del valor de los inmuebles y de los vehículos, pero no del impuesto: el cálculo oficial lo hace el programa de ayuda en línea del modelo 650. Esta calculadora es una estimación.",
      en: "No. The ATV has simulators for the value of property and vehicles, not for the tax: the official calculation is form 650's online help program. This calculator is an estimate.",
    },
  }[region][locale];

  return {
    ca: [
      { q: `Quant paga un fill per l'impost de successions ${where}?`, a: `Amb 21 anys o més té ${M(k.groupII)} de reducció per parentiu i, sobre la quota, una bonificació del ${rules.bonus.groupsIandII} %. ${firstLabel}: paga ${M(first.toPay)} (base liquidable ${M(first.baseLiquidable)}, quota ${M(first.quotaTributaria)}).` },
      { q: "El cònjuge o la parella de fet pagan?", a: `Tenen les mateixes regles que un fill de 21 anys o més: ${M(k.groupII)} de reducció i el ${rules.bonus.groupsIandII} % de bonificació. La parella de fet compta com a cònjuge si està inscrita (art. ${rules.cite.partners.art}); si no, és del grup IV.` },
      { q: "Quant paga un germà, un nebot o un oncle?", a: `${siblingRule} ${siblingLabel}: paga ${M(sibling.toPay)}, el ${P(sibling.effectiveRate * 100)} del que rep. Sense parentiu, amb 100.000 € es paguen ${M(friend.toPay)}.` },
      { q: "Com funciona la reducció per l'habitatge habitual?", a: `Es redueix el ${h.percent} % del valor de l'habitatge de la persona morta que et toca, amb un límit de ${M(h.capPerHeir)} per hereu, si ets cònjuge, descendent o ascendent (o col·lateral de més de 65 anys que hi convivia dos anys). Cal conservar-lo ${h.keepYears} anys.` },
      { q: "Quin termini hi ha per pagar?", a: `${m} mesos des de la mort. Durant els ${DEADLINE.askWithinMonths} primers mesos es pot demanar una pròrroga de ${DEADLINE.extensionMonths} mesos més, amb interessos de demora. Es presenta a ${agency} amb el model 650 (un per hereu).` },
      { q: "L'assegurança de vida paga successions?", a: `Sí, si la va contractar la persona morta: se suma al que reps. El cònjuge, els descendents i els ascendents en redueixen el 100 % fins a ${M(rules.insurance.max)}, una sola vegada per hereu.` },
      { q: `Quan es paga ${where} i no en una altra comunitat?`, a: "Si la persona morta vivia a Espanya i tu també, es paga a la comunitat on va viure més dies dels cinc anys anteriors a la mort, amb les seves normes (Llei 22/2009, arts. 28 i 32). Si l'hereu no viu a Espanya, l'impost el gestiona l'Agència Tributària de l'Estat." },
      { q: "Hi ha un simulador oficial?", a: simulator },
    ],
    es: [
      { q: `¿Cuánto paga un hijo por el impuesto de sucesiones ${where}?`, a: `Con 21 años o más tiene ${M(k.groupII)} de reducción por parentesco y, sobre la cuota, una bonificación del ${rules.bonus.groupsIandII} %. ${firstLabel}: paga ${M(first.toPay)} (base liquidable ${M(first.baseLiquidable)}, cuota ${M(first.quotaTributaria)}).` },
      { q: "¿El cónyuge o la pareja de hecho pagan?", a: `Tienen las mismas reglas que un hijo de 21 años o más: ${M(k.groupII)} de reducción y el ${rules.bonus.groupsIandII} % de bonificación. La pareja de hecho cuenta como cónyuge si está inscrita (art. ${rules.cite.partners.art}); si no, es del grupo IV.` },
      { q: "¿Cuánto paga un hermano, un sobrino o un tío?", a: `${siblingRule} ${siblingLabel}: paga ${M(sibling.toPay)}, el ${P(sibling.effectiveRate * 100)} de lo que recibe. Sin parentesco, con 100.000 € se pagan ${M(friend.toPay)}.` },
      { q: "¿Cómo funciona la reducción por la vivienda habitual?", a: `Se reduce el ${h.percent} % del valor de la vivienda de la persona fallecida que te toca, con un límite de ${M(h.capPerHeir)} por heredero, si eres cónyuge, descendiente o ascendiente (o colateral mayor de 65 años que convivió dos años con ella). Hay que conservarla ${h.keepYears} años.` },
      { q: "¿Qué plazo hay para pagar?", a: `${m} meses desde el fallecimiento. Durante los ${DEADLINE.askWithinMonths} primeros meses se puede pedir una prórroga de ${DEADLINE.extensionMonths} meses más, con intereses de demora. Se presenta en ${agency} con el modelo 650 (uno por heredero).` },
      { q: "¿El seguro de vida paga sucesiones?", a: `Sí, si lo contrató la persona fallecida: se suma a lo que recibes. El cónyuge, los descendientes y los ascendientes reducen el 100 % hasta ${M(rules.insurance.max)}, una sola vez por heredero.` },
      { q: `¿Cuándo se paga ${where} y no en otra comunidad?`, a: "Si la persona fallecida vivía en España y tú también, se paga en la comunidad donde vivió más días de los cinco años anteriores al fallecimiento, con sus normas (Ley 22/2009, arts. 28 y 32). Si el heredero no vive en España, el impuesto lo gestiona la Agencia Tributaria del Estado." },
      { q: "¿Hay un simulador oficial?", a: simulator },
    ],
    en: [
      { q: `How much inheritance tax does a child pay ${where}?`, a: `At 21 or over, a ${M(k.groupII)} kinship reduction and a ${rules.bonus.groupsIandII}% rebate on the tax. ${firstLabel}: pays ${M(first.toPay)} (net taxable base ${M(first.baseLiquidable)}, tax ${M(first.quotaTributaria)}).` },
      { q: "Does a spouse or partner pay?", a: `The same rules as a child aged 21 or over: a ${M(k.groupII)} reduction and a ${rules.bonus.groupsIandII}% rebate. A partner counts as a spouse when the partnership is registered (art. ${rules.cite.partners.art}); otherwise they are group IV.` },
      { q: "How much does a brother, sister, nephew or niece pay?", a: `${siblingRule} ${siblingLabel}: pays ${M(sibling.toPay)}, ${P(sibling.effectiveRate * 100)} of what they receive. With no relationship, €100,000 pays ${M(friend.toPay)}.` },
      { q: "How does the habitual home reduction work?", a: `${h.percent}% of the value of the deceased's home in your share comes off, up to ${M(h.capPerHeir)} per heir, if you are the spouse, a descendant or an ascendant (or a collateral over 65 who lived with them for two years). The home must be kept for ${h.keepYears} years.` },
      { q: "What is the deadline?", a: `${m} months from the death. In the first ${DEADLINE.askWithinMonths} months you can ask for ${DEADLINE.extensionMonths} more, with late-payment interest. It is filed with ${agency} on form 650 (one per heir).` },
      { q: "Is life insurance subject to inheritance tax?", a: `Yes, when the deceased took the policy out: it is added to what you receive. Spouses, descendants and ascendants deduct 100% up to ${M(rules.insurance.max)}, once per heir.` },
      { q: `When is it paid ${where} rather than in another region?`, a: "If the deceased lived in Spain and so do you, it is paid in the region where the deceased lived the most days of the five years before the death, under its rules (Law 22/2009, arts. 28 and 32). If the heir does not live in Spain, the State Tax Agency handles it." },
      { q: "Is there an official simulator?", a: simulator },
    ],
  }[locale];
}
