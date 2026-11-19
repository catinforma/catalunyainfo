import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";

import { money, type IsdLocale } from "./copy";
import type { Relation } from "./engine";
import type { RegionalInvalid, RegionalNote, RegionalReductionId } from "./regional-engine";
import type { Cite, LawId, RegionCalculatorId, RegionId, RegionRules } from "./regions/types";
import type { Group } from "./rules";

/**
 * Paths and words of the Madrid, Andalucía and Comunitat Valenciana
 * inheritance tax calculators, small enough for the browser (the client
 * component imports this file and the engine; the rules arrive as a prop).
 *
 *   /es/calculadoras/impuesto-sucesiones-madrid/              (ca, en: calculators/paths.ts)
 *   /es/calculadoras/impuesto-sucesiones-andalucia/
 *   /es/calculadoras/impuesto-sucesiones-comunidad-valenciana/
 */

export const REGION_CALCULATOR: Record<RegionId, RegionCalculatorId> = {
  madrid: "inheritance-tax-madrid",
  andalucia: "inheritance-tax-andalucia",
  valencia: "inheritance-tax-valencia",
};

export function regionPath(region: RegionId, locale: IsdLocale): string {
  return calcPath(REGION_CALCULATOR[region], locale);
}

export function regionEditions(region: RegionId): Record<IsdLocale, string> {
  return { ca: regionPath(region, "ca"), es: regionPath(region, "es"), en: regionPath(region, "en") };
}

/** The four inheritance tax calculators, Catalonia first (the "by community" links). */
export const INHERITANCE_FAMILY: readonly { id: CalculatorId; name: Record<IsdLocale, string> }[] = [
  { id: "inheritance-tax", name: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" } },
  { id: "inheritance-tax-madrid", name: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid" } },
  { id: "inheritance-tax-andalucia", name: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" } },
  { id: "inheritance-tax-valencia", name: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region" } },
];

/** "Madrid" / "Andalucía" / "Comunidad Valenciana": the short name. */
export const REGION_NAME: Record<RegionId, Record<IsdLocale, string>> = {
  madrid: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid region" },
  andalucia: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" },
  valencia: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region (Comunitat Valenciana)" },
};

/** "en la Comunidad de Madrid" / "a Andalusia" / "in the Valencia region". */
export const REGION_IN: Record<RegionId, Record<IsdLocale, string>> = {
  madrid: { ca: "a la Comunitat de Madrid", es: "en la Comunidad de Madrid", en: "in the Madrid region" },
  andalucia: { ca: "a Andalusia", es: "en Andalucía", en: "in Andalusia" },
  valencia: { ca: "a la Comunitat Valenciana", es: "en la Comunidad Valenciana", en: "in the Valencia region" },
};

/** The tax administration that receives form 650. */
export const REGION_AGENCY: Record<RegionId, Record<IsdLocale, string>> = {
  madrid: { ca: "l'Administració Tributària de la Comunitat de Madrid", es: "la Administración Tributaria de la Comunidad de Madrid", en: "the Madrid regional tax administration" },
  andalucia: { ca: "l'Agència Tributària d'Andalusia", es: "la Agencia Tributaria de Andalucía", en: "the Andalusian Tax Agency (Agencia Tributaria de Andalucía)" },
  valencia: { ca: "l'Agència Tributària Valenciana (ATV)", es: "la Agència Tributària Valenciana (ATV)", en: "the Valencian Tax Agency (Agència Tributària Valenciana, ATV)" },
};

const LAW_SHORT: Record<LawId, Record<IsdLocale, string>> = {
  madrid: { ca: "Decret legislatiu 1/2010 de Madrid", es: "Decreto Legislativo 1/2010 de Madrid", en: "Madrid Legislative Decree 1/2010" },
  andalucia: { ca: "Llei 5/2021 de tributs cedits d'Andalusia", es: "Ley 5/2021 de Tributos Cedidos de Andalucía", en: "Andalusian Ceded Taxes Act (Law 5/2021)" },
  valencia: { ca: "Llei valenciana 13/1997", es: "Ley valenciana 13/1997", en: "Valencian Law 13/1997" },
  lisd: { ca: "Llei 29/1987 de l'impost sobre successions", es: "Ley 29/1987 del Impuesto sobre Sucesiones", en: "Inheritance and Gift Tax Act (Law 29/1987)" },
  risd: { ca: "Reial decret 1629/1991", es: "Real Decreto 1629/1991", en: "Royal Decree 1629/1991" },
  lofca: { ca: "Llei 22/2009", es: "Ley 22/2009", en: "Law 22/2009" },
};

/** "Ley 5/2021 de Tributos Cedidos de Andalucía". */
export function lawName(law: LawId, locale: IsdLocale): string {
  return LAW_SHORT[law][locale];
}

/** "Ley 5/2021 de Tributos Cedidos de Andalucía, art. 28". */
export function cite(c: Cite, locale: IsdLocale): string {
  return `${LAW_SHORT[c.law][locale]}, art. ${c.art}`;
}

/** Who is in each group under the state's art. 20.2.a (no stepchild or partner assimilation beyond the community's). */
export const STATE_GROUP_WHO: Record<Group, Record<IsdLocale, string>> = {
  I: { ca: "Fills i altres descendents menors de 21 anys", es: "Hijos y otros descendientes menores de 21 años", en: "Children and other descendants under 21" },
  II: {
    ca: "Cònjuge o parella de fet inscrita, fills i descendents de 21 anys o més, pares i altres ascendents",
    es: "Cónyuge o pareja de hecho inscrita, hijos y descendientes de 21 años o más, padres y otros ascendientes",
    en: "Spouse or registered partner, children and descendants aged 21 or over, parents and other ascendants",
  },
  III: {
    ca: "Germans, nebots, oncles; sogres, gendre o jove, fillastres, cunyats i altres parents per afinitat",
    es: "Hermanos, sobrinos, tíos; suegros, yerno o nuera, hijastros, cuñados y otros parientes por afinidad",
    en: "Siblings, nephews, nieces, uncles, aunts; in-laws and stepchildren",
  },
  IV: { ca: "Cosins, parents més llunyans i persones sense parentiu (també la parella no inscrita)", es: "Primos, parientes más lejanos y personas sin parentesco (también la pareja no inscrita)", en: "Cousins, more distant relatives and unrelated people (an unregistered partner too)" },
};

export const REGIONAL_RELATION_LABEL: Record<Relation, Record<IsdLocale, string>> = {
  spouse: { ca: "Cònjuge o parella de fet inscrita", es: "Cónyuge o pareja de hecho inscrita", en: "Spouse or registered partner" },
  child: { ca: "Fill o filla (també adoptat)", es: "Hijo o hija (también adoptado)", en: "Son or daughter (also adopted)" },
  descendant: { ca: "Nét, néta o altre descendent", es: "Nieto, nieta u otro descendiente", en: "Grandchild or other descendant" },
  ascendant: { ca: "Pare, mare, avi, àvia o altre ascendent", es: "Padre, madre, abuelo, abuela u otro ascendiente", en: "Parent, grandparent or other ascendant" },
  collateral: { ca: "Germà, germana, nebot, neboda, oncle o tia (de sang)", es: "Hermano, hermana, sobrino, sobrina, tío o tía (de sangre)", en: "Sibling, nephew, niece, uncle or aunt (by blood)" },
  affinity: {
    ca: "Parent per afinitat (sogres, gendre o jove, fillastres, cunyats)",
    es: "Pariente por afinidad (suegros, yerno o nuera, hijastros, cuñados)",
    en: "In-law or stepchild (parent-, son-, daughter-, brother- or sister-in-law)",
  },
  distant: { ca: "Cosí, cosina o parent més llunyà", es: "Primo, prima o pariente más lejano", en: "Cousin or more distant relative" },
  unrelated: { ca: "Sense parentiu (també la parella no inscrita)", es: "Sin parentesco (también la pareja no inscrita)", en: "Not related (an unregistered partner too)" },
};

export const REGIONAL_REDUCTION_LABEL: Record<RegionalReductionId, Record<IsdLocale, string>> = {
  kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
  disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
  insurance: { ca: "Reducció per assegurança de vida", es: "Reducción por seguro de vida", en: "Life insurance reduction" },
  home: { ca: "Reducció per habitatge habitual", es: "Reducción por vivienda habitual", en: "Habitual home reduction" },
};

/** The article each reduction cites (the group III one may be the state's). */
export function reductionCite(rules: RegionRules, id: RegionalReductionId, group: Group): Cite {
  if (id === "kinship") return group === "III" ? rules.cite.groupIII : rules.cite.kinship;
  return rules.cite[id];
}

export function regionalNote(note: RegionalNote, rules: RegionRules, locale: IsdLocale): string {
  const M = (n: number) => money(n, locale);
  const agency = REGION_AGENCY[rules.id][locale];
  return {
    "insurance-relation": {
      ca: `L'assegurança de vida se suma a la base, però la reducció de ${M(rules.insurance.max)} només és per al cònjuge, els descendents i els ascendents de qui va contractar la pòlissa.`,
      es: `El seguro de vida se suma a la base, pero la reducción de ${M(rules.insurance.max)} solo es para el cónyuge, los descendientes y los ascendientes de quien contrató la póliza.`,
      en: `The life insurance is added to the base, but the ${M(rules.insurance.max)} reduction is only for the spouse, descendants and ascendants of the policyholder.`,
    },
    "home-relation": {
      ca: `Sense reducció per habitatge: la llei la dona al cònjuge, als descendents, als ascendents i als col·laterals de més de 65 anys que hi convivien. Si ets parent per afinitat i creus que t'hi pots acollir, pregunta-ho a ${agency}.`,
      es: `Sin reducción por vivienda: la ley la da al cónyuge, a los descendientes, a los ascendientes y a los colaterales mayores de 65 años que convivían con la persona fallecida. Si eres pariente por afinidad y crees que puedes aplicarla, pregúntalo a ${agency}.`,
      en: `No home reduction: the law gives it to the spouse, descendants, ascendants and collaterals over 65 who lived with the deceased. If you are an in-law and think it applies to you, ask ${agency}.`,
    },
    "home-collateral": {
      ca: "Sense reducció per habitatge: un col·lateral només la té amb més de 65 anys i havent conviscut amb la persona morta com a mínim els dos anys anteriors a la mort.",
      es: "Sin reducción por vivienda: un colateral solo la tiene con más de 65 años y si convivió con la persona fallecida al menos los dos años anteriores al fallecimiento.",
      en: "No home reduction: a collateral relative only gets it when over 65 and after living with the deceased for at least the two years before the death.",
    },
    "home-capped": {
      ca: `La reducció per habitatge arriba al límit: ${M(rules.home.capPerHeir)} per hereu.`,
      es: `La reducción por vivienda llega a su límite: ${M(rules.home.capPerHeir)} por heredero.`,
      en: `The home reduction reaches its cap: ${M(rules.home.capPerHeir)} per heir.`,
    },
    "mental-as-65": {
      ca: `Una discapacitat intel·lectual o mental del 33 % o més, reconeguda de manera permanent, compta com la del 65 %: reducció de ${M(rules.disability.from65)} i bonificació del ${rules.bonus.disability} %.`,
      es: `Una discapacidad intelectual o mental del 33 % o más, reconocida de forma permanente, cuenta como la del 65 %: reducción de ${M(rules.disability.from65)} y bonificación del ${rules.bonus.disability} %.`,
      en: `An intellectual or mental disability of 33% or more, permanently recognised, counts as a 65% one: a ${M(rules.disability.from65)} reduction and a ${rules.bonus.disability}% rebate.`,
    },
    "declared-on-time": {
      ca: "La bonificació només s'aplica a la part de la quota dels béns declarats dins de termini (o abans d'un requeriment de l'Administració): la calculadora suposa que ho declares tot.",
      es: "La bonificación solo se aplica a la parte de la cuota de los bienes declarados en plazo (o antes de un requerimiento de la Administración): la calculadora supone que lo declaras todo.",
      en: "The rebate only covers the part of the tax for assets declared on time (or before the tax office asks): the calculator assumes you declare everything.",
    },
  }[note][locale];
}

export interface RegionalCalcCopy {
  title: (region: string) => string;
  intro: string;
  noscript: string;
  relation: string;
  age: string;
  ageHint: string;
  disability: string;
  mental: string;
  share: string;
  shareHint: string;
  insurance: string;
  insuranceHint: string;
  homeLegend: string;
  homeValue: string;
  homeValueHint: string;
  homeOwned: string;
  homeOwnedHint: string;
  homeHeir: string;
  homeHeirHint: string;
  livedTogether: string;
  prior: string;
  priorHint: (flat: boolean) => string;
  toPay: string;
  stepsTitle: string;
  baseImposable: string;
  baseLiquidable: string;
  quotaIntegra: string;
  row: (from: string, quota: string, rest: string, rate: string, onRest: string) => string;
  coefficient: (c: string, group: string) => string;
  excess: string;
  quotaTributaria: string;
  bonus: (p: string) => string;
  bonusNone: string;
  noBase: string;
  effective: (rate: string, base: string) => string;
  zero: string;
  groupLine: (group: string) => string;
  invalid: Record<RegionalInvalid, string>;
}

export const REGIONAL_CALC_COPY: Record<IsdLocale, RegionalCalcCopy> = {
  ca: {
    title: (region) => `Calculadora de l'impost de successions: ${region}`,
    intro: "Una autoliquidació per hereu: escriu el teu parentiu, la teva edat i el que reps tu. El resultat mostra cada pas amb l'article de la llei.",
    noscript: "Sense JavaScript veuràs el primer exemple de la pàgina; les taules de sota tenen la tarifa, les reduccions i la bonificació.",
    relation: "Parentiu amb la persona morta",
    age: "La teva edat el dia de la mort",
    ageHint: "En anys complerts. Fins als 20 anys, els descendents són del grup I.",
    disability: "Grau de discapacitat reconegut",
    mental: "És una discapacitat intel·lectual o mental reconeguda de manera permanent",
    share: "El que reps de l'herència, en net",
    shareHint: "La teva part dels béns, menys deutes i despeses deduïbles (enterrament, per exemple). Inclou-hi l'habitatge si et toca part. Sense l'assegurança de vida.",
    insurance: "Assegurança de vida que cobres per aquesta mort",
    insuranceHint: "Només la de pòlisses que va contractar la persona morta (o de què era l'assegurada, si és col·lectiva). Se suma a la base.",
    homeLegend: "Habitatge habitual de la persona morta (si n'hi ha a l'herència)",
    homeValue: "Valor de tot l'habitatge",
    homeValueHint: "El valor fiscal del 100 % de l'habitatge. 0 si no n'hi ha.",
    homeOwned: "Part de l'habitatge que era de la persona morta",
    homeOwnedHint: "100 % si era tot seu; 50 % si era a mitges amb el cònjuge.",
    homeHeir: "La teva part d'aquesta part",
    homeHeirHint: "50 % si l'hereteu a parts iguals entre dos.",
    livedTogether: "Vaig conviure amb la persona morta, com a mínim, els dos anys anteriors a la mort",
    prior: "El teu patrimoni abans de l'herència",
    priorHint: (flat) => (flat ? "Aquí no canvia res: el coeficient només depèn del parentiu." : "Per al coeficient multiplicador. Al primer tram no canvia res."),
    toPay: "Impost a pagar (estimació)",
    stepsTitle: "Càlcul pas a pas",
    baseImposable: "Base imposable (el que reps + assegurança)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Quota íntegra segons la tarifa",
    row: (from, quota, rest, rate, onRest) => `Fins a ${from}: ${quota}; la resta, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Coeficient multiplicador: ${c} (${group})`,
    excess: "Menys l'excés de quota",
    quotaTributaria: "Quota tributària",
    bonus: (p) => `Bonificació (${p})`,
    bonusNone: "Bonificació: no n'hi ha per al teu parentiu",
    noBase: "Les reduccions cobreixen tota la base: no hi ha impost.",
    effective: (rate, base) => `Pagues el ${rate} dels ${base} que reps.`,
    zero: "No pagues res, però igualment has de presentar l'autoliquidació (model 650), encara que surti a zero.",
    groupLine: (group) => `Parentiu: ${group}.`,
    invalid: {
      share: "Escriu el que reps de l'herència, en euros.",
      insurance: "Escriu l'import de l'assegurança de vida, en euros (0 si no n'hi ha).",
      nothing: "Escriu el que reps de l'herència o de l'assegurança de vida.",
      age: "Escriu la teva edat en anys complerts (de 0 a 120).",
      "home-value": "Escriu el valor de l'habitatge, en euros (0 si no n'hi ha).",
      "home-pct": "Els percentatges de l'habitatge han de ser de més de 0 fins a 100.",
      "home-above-share": "La teva part de l'habitatge no pot valer més que tot el que reps: inclou l'habitatge en l'import que reps.",
      prior: "Escriu el teu patrimoni anterior, en euros (0 si no en saps la xifra).",
    },
  },
  es: {
    title: (region) => `Calculadora del impuesto de sucesiones: ${region}`,
    intro: "Una autoliquidación por heredero: escribe tu parentesco, tu edad y lo que recibes tú. El resultado muestra cada paso con el artículo de la ley.",
    noscript: "Sin JavaScript verás el primer ejemplo de la página; las tablas de abajo tienen la tarifa, las reducciones y la bonificación.",
    relation: "Parentesco con la persona fallecida",
    age: "Tu edad el día del fallecimiento",
    ageHint: "En años cumplidos. Hasta los 20 años, los descendientes son del grupo I.",
    disability: "Grado de discapacidad reconocido",
    mental: "Es una discapacidad intelectual o mental reconocida de forma permanente",
    share: "Lo que recibes de la herencia, en neto",
    shareHint: "Tu parte de los bienes, menos deudas y gastos deducibles (el entierro, por ejemplo). Incluye la vivienda si te toca parte. Sin el seguro de vida.",
    insurance: "Seguro de vida que cobras por este fallecimiento",
    insuranceHint: "Solo el de pólizas que contrató la persona fallecida (o de las que era la asegurada, si es colectiva). Se suma a la base.",
    homeLegend: "Vivienda habitual de la persona fallecida (si está en la herencia)",
    homeValue: "Valor de toda la vivienda",
    homeValueHint: "El valor fiscal del 100 % de la vivienda. 0 si no hay.",
    homeOwned: "Parte de la vivienda que era de la persona fallecida",
    homeOwnedHint: "100 % si era toda suya; 50 % si era a medias con el cónyuge.",
    homeHeir: "Tu parte de esa parte",
    homeHeirHint: "50 % si la heredáis a partes iguales entre dos.",
    livedTogether: "Conviví con la persona fallecida, al menos, los dos años anteriores a su muerte",
    prior: "Tu patrimonio antes de la herencia",
    priorHint: (flat) => (flat ? "Aquí no cambia nada: el coeficiente solo depende del parentesco." : "Para el coeficiente multiplicador. En el primer tramo no cambia nada."),
    toPay: "Impuesto a pagar (estimación)",
    stepsTitle: "Cálculo paso a paso",
    baseImposable: "Base imponible (lo que recibes + seguro)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Cuota íntegra según la tarifa",
    row: (from, quota, rest, rate, onRest) => `Hasta ${from}: ${quota}; el resto, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Coeficiente multiplicador: ${c} (${group})`,
    excess: "Menos el exceso de cuota",
    quotaTributaria: "Cuota tributaria",
    bonus: (p) => `Bonificación (${p})`,
    bonusNone: "Bonificación: no hay para tu parentesco",
    noBase: "Las reducciones cubren toda la base: no hay impuesto.",
    effective: (rate, base) => `Pagas el ${rate} de los ${base} que recibes.`,
    zero: "No pagas nada, pero igualmente tienes que presentar la autoliquidación (modelo 650), aunque salga a cero.",
    groupLine: (group) => `Parentesco: ${group}.`,
    invalid: {
      share: "Escribe lo que recibes de la herencia, en euros.",
      insurance: "Escribe el importe del seguro de vida, en euros (0 si no hay).",
      nothing: "Escribe lo que recibes de la herencia o del seguro de vida.",
      age: "Escribe tu edad en años cumplidos (de 0 a 120).",
      "home-value": "Escribe el valor de la vivienda, en euros (0 si no hay).",
      "home-pct": "Los porcentajes de la vivienda tienen que ser de más de 0 hasta 100.",
      "home-above-share": "Tu parte de la vivienda no puede valer más que todo lo que recibes: incluye la vivienda en el importe que recibes.",
      prior: "Escribe tu patrimonio anterior, en euros (0 si no sabes la cifra).",
    },
  },
  en: {
    title: (region) => `Inheritance tax calculator: ${region}`,
    intro: "One self-assessment per heir: enter your relationship, your age and what you receive. The result shows each step with its article of the law.",
    noscript: "Without JavaScript you see the page's first example; the tables below have the scale, the reductions and the rebate.",
    relation: "Your relationship to the deceased",
    age: "Your age on the day of the death",
    ageHint: "In completed years. Descendants are in group I up to the age of 20.",
    disability: "Officially recognised disability",
    mental: "It is an intellectual or mental disability, permanently recognised",
    share: "What you receive from the estate, net",
    shareHint: "Your part of the assets, less debts and deductible costs (the funeral, for instance). Include your part of the home, if any. Without the life insurance.",
    insurance: "Life insurance you receive because of this death",
    insuranceHint: "Only from policies the deceased took out (or on which they were the insured person, for group policies). It is added to the base.",
    homeLegend: "The deceased's habitual home (if it is in the estate)",
    homeValue: "Value of the whole home",
    homeValueHint: "The tax value of 100% of the home. 0 if there is none.",
    homeOwned: "Part of the home the deceased owned",
    homeOwnedHint: "100% if it was all theirs; 50% if they owned it half and half with their spouse.",
    homeHeir: "Your share of that part",
    homeHeirHint: "50% if two of you inherit it in equal shares.",
    livedTogether: "I lived with the deceased for at least the two years before the death",
    prior: "Your own wealth before the inheritance",
    priorHint: (flat) => (flat ? "Nothing changes here: the coefficient depends only on the relationship." : "For the multiplying coefficient. Nothing changes in the first bracket."),
    toPay: "Tax to pay (estimate)",
    stepsTitle: "Step by step",
    baseImposable: "Taxable base (what you receive + insurance)",
    baseLiquidable: "Net taxable base (base liquidable)",
    quotaIntegra: "Gross tax from the scale (cuota íntegra)",
    row: (from, quota, rest, rate, onRest) => `Up to ${from}: ${quota}; the rest, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Multiplying coefficient: ${c} (${group})`,
    excess: "Less the excess-tax adjustment",
    quotaTributaria: "Tax after the coefficient (cuota tributaria)",
    bonus: (p) => `Rebate (bonificación, ${p})`,
    bonusNone: "Rebate: none for your relationship",
    noBase: "The reductions cover the whole base: there is no tax.",
    effective: (rate, base) => `You pay ${rate} of the ${base} you receive.`,
    zero: "You pay nothing, but you still have to file the self-assessment (form 650), even when it comes to zero.",
    groupLine: (group) => `Kinship: ${group}.`,
    invalid: {
      share: "Enter what you receive from the estate, in euros.",
      insurance: "Enter the life insurance amount, in euros (0 if none).",
      nothing: "Enter what you receive from the estate or the life insurance.",
      age: "Enter your age in completed years (0 to 120).",
      "home-value": "Enter the value of the home, in euros (0 if none).",
      "home-pct": "The home percentages must be above 0 and up to 100.",
      "home-above-share": "Your part of the home cannot be worth more than all you receive: include the home in the amount you receive.",
      prior: "Enter your prior wealth, in euros (0 if you do not know it).",
    },
  },
};
