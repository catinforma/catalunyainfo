import { calcPath } from "@/lib/programmatic/calculators/paths";
import { caDayArticle, dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num, pct } from "@/lib/programmatic/rent-update/copy";

import type { Disability, InvalidReason, IsdNote, ReductionId, Relation } from "./engine";
import { ARTICLE, type Group } from "./rules";

/**
 * Paths and words of the Catalan inheritance tax calculator, small enough
 * for the browser (the client component imports this file, the engine and
 * the rules; nothing that reads data).
 *
 *   /ca/calculadores/impost-successions-catalunya/
 *   /es/calculadoras/impuesto-sucesiones-cataluna/
 *   /en/calculators/catalonia-inheritance-tax/
 */

export type IsdLocale = DateLocale;
export const ISD_LOCALES: readonly IsdLocale[] = ["ca", "es", "en"];

export function isdPath(locale: IsdLocale): string {
  return calcPath("inheritance-tax", locale);
}

export function isdEditions(): Record<IsdLocale, string> {
  return { ca: isdPath("ca"), es: isdPath("es"), en: isdPath("en") };
}

export { elDay, euros, num, pct };

/** "des del 14 de juliol de 2026" / "desde el 14 de julio de 2026" / "since 14 July 2026" (ca: "des de l'1 de gener"). */
export function sinceDay(iso: string, locale: IsdLocale): string {
  const d = dayMonthYear(iso, locale);
  if (locale === "ca") return caDayArticle(iso) === "l'" ? `des de l'${d}` : `des del ${d}`;
  return locale === "es" ? `desde el ${d}` : `since ${d}`;
}

/** "a partir de l'1 de gener de 2027" / "a partir del 1 de enero de 2027" / "from 1 January 2027". */
export function fromDay(iso: string, locale: IsdLocale): string {
  const d = dayMonthYear(iso, locale);
  if (locale === "ca") return caDayArticle(iso) === "l'" ? `a partir de l'${d}` : `a partir del ${d}`;
  return locale === "es" ? `a partir del ${d}` : `from ${d}`;
}

/** "120.000 €" with no decimals when whole, "571,62 €" otherwise; "€120,000" in English. */
export function money(n: number, locale: IsdLocale): string {
  if (Math.abs(n - Math.round(n)) >= 0.005) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** "59,17 %" / "59.17%", without decimals when whole. */
export function percent(p: number, locale: IsdLocale): string {
  return pct(p, Math.abs(p - Math.round(p)) < 0.005 ? 0 : 2, locale);
}

/** "Codi tributari de Catalunya, art. 631-2" in the reader's language. */
export function codeArticle(article: string, locale: IsdLocale): string {
  return { ca: `Codi tributari de Catalunya, art. ${article}`, es: `Código tributario de Cataluña, art. ${article}`, en: `Catalan Tax Code, art. ${article}` }[locale];
}

export const GROUP_LABEL: Record<Group, Record<IsdLocale, string>> = {
  I: { ca: "Grup I", es: "Grupo I", en: "Group I" },
  II: { ca: "Grup II", es: "Grupo II", en: "Group II" },
  III: { ca: "Grup III", es: "Grupo III", en: "Group III" },
  IV: { ca: "Grup IV", es: "Grupo IV", en: "Group IV" },
};

/** Who is in each group (art. 631-2 and the ATC's examples). */
export const GROUP_WHO: Record<Group, Record<IsdLocale, string>> = {
  I: { ca: "Fills i altres descendents menors de 21 anys", es: "Hijos y otros descendientes menores de 21 años", en: "Children and other descendants under 21" },
  II: { ca: "Cònjuge o parella estable, fills i descendents de 21 anys o més, ascendents", es: "Cónyuge o pareja estable, hijos y descendientes de 21 años o más, ascendientes", en: "Spouse or stable partner, children and descendants aged 21 or over, ascendants" },
  III: {
    ca: "Germans, nebots, oncles; sogres, gendre o jove, cunyats i altres parents per afinitat",
    es: "Hermanos, sobrinos, tíos; suegros, yerno o nuera, cuñados y otros parientes por afinidad",
    en: "Siblings, nephews, nieces, uncles, aunts; in-laws",
  },
  IV: { ca: "Cosins, parents més llunyans i persones sense parentiu", es: "Primos, parientes más lejanos y personas sin parentesco", en: "Cousins, more distant relatives and people who are not related" },
};

export const RELATION_LABEL: Record<Relation, Record<IsdLocale, string>> = {
  spouse: { ca: "Cònjuge o parella estable", es: "Cónyuge o pareja estable", en: "Spouse or stable partner (parella estable)" },
  child: { ca: "Fill o filla (també del cònjuge o la parella, o acollit)", es: "Hijo o hija (también del cónyuge o la pareja, o acogido)", en: "Son or daughter (also a stepchild or foster child)" },
  descendant: { ca: "Nét, néta o altre descendent", es: "Nieto, nieta u otro descendiente", en: "Grandchild or other descendant" },
  ascendant: { ca: "Pare, mare, avi, àvia o altre ascendent", es: "Padre, madre, abuelo, abuela u otro ascendiente", en: "Parent, grandparent or other ascendant" },
  collateral: { ca: "Germà, germana, nebot, neboda, oncle o tia", es: "Hermano, hermana, sobrino, sobrina, tío o tía", en: "Sibling, nephew, niece, uncle or aunt" },
  affinity: { ca: "Parent per afinitat (sogres, gendre o jove, cunyats)", es: "Pariente por afinidad (suegros, yerno o nuera, cuñados)", en: "In-law (parent-, son-, daughter-, brother- or sister-in-law)" },
  distant: { ca: "Cosí, cosina o parent més llunyà", es: "Primo, prima o pariente más lejano", en: "Cousin or more distant relative" },
  unrelated: { ca: "Sense parentiu", es: "Sin parentesco", en: "Not related" },
};

export const DISABILITY_LABEL: Record<Disability, Record<IsdLocale, string>> = {
  0: { ca: "No, o menys del 33 %", es: "No, o menos del 33 %", en: "No, or under 33%" },
  33: { ca: "Del 33 % al 64 %", es: "Del 33 % al 64 %", en: "33% to 64%" },
  65: { ca: "65 % o més", es: "65 % o más", en: "65% or more" },
};

export const REDUCTION_LABEL: Record<ReductionId, Record<IsdLocale, string>> = {
  kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
  disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
  elderly: { ca: "Reducció per tenir 75 anys o més", es: "Reducción por tener 75 años o más", en: "Reduction for heirs aged 75 or over" },
  insurance: { ca: "Reducció per assegurança de vida", es: "Reducción por seguro de vida", en: "Life insurance reduction" },
  home: { ca: "Reducció per habitatge habitual (95 %)", es: "Reducción por vivienda habitual (95 %)", en: "Habitual home reduction (95%)" },
};

export const REDUCTION_ARTICLE: Record<ReductionId, string> = {
  kinship: ARTICLE.kinship,
  disability: ARTICLE.disability,
  elderly: ARTICLE.elderly,
  insurance: ARTICLE.insurance,
  home: ARTICLE.home,
};

export const NOTE_TEXT: Record<IsdNote, Record<IsdLocale, string>> = {
  "elderly-with-disability": {
    ca: "La reducció per tenir 75 anys o més no se suma a la de discapacitat (són incompatibles, art. 631-4.2): s'aplica la de discapacitat, que és igual o més alta.",
    es: "La reducción por tener 75 años o más no se suma a la de discapacidad (son incompatibles, art. 631-4.2): se aplica la de discapacidad, que es igual o mayor.",
    en: "The reduction for heirs aged 75 or over does not add to the disability one (art. 631-4.2 makes them incompatible): the disability reduction, equal or larger, applies.",
  },
  "insurance-relation": {
    ca: "L'assegurança de vida es suma a la base, però la reducció de 25.000 € només és per al cònjuge, els descendents i els ascendents de qui va contractar la pòlissa (art. 631-5).",
    es: "El seguro de vida se suma a la base, pero la reducción de 25.000 € solo es para el cónyuge, los descendientes y los ascendientes de quien contrató la póliza (art. 631-5).",
    en: "The life insurance is added to the base, but the €25,000 reduction is only for the spouse, descendants and ascendants of the policyholder (art. 631-5).",
  },
  "home-relation": {
    ca: "Sense reducció per habitatge: la llei la dona al cònjuge, als descendents, als ascendents i als col·laterals (art. 631-17). Si ets parent per afinitat i creus que t'hi pots acollir, pregunta-ho a l'ATC.",
    es: "Sin reducción por vivienda: la ley la da al cónyuge, a los descendientes, a los ascendientes y a los colaterales (art. 631-17). Si eres pariente por afinidad y crees que puedes aplicarla, pregúntalo a la ATC.",
    en: "No home reduction: the law gives it to the spouse, descendants, ascendants and collaterals (art. 631-17). If you are an in-law and think it applies to you, ask the ATC.",
  },
  "home-collateral": {
    ca: "Sense reducció per habitatge: un col·lateral l'ha de tenir amb més de 65 anys i havent conviscut amb la persona morta com a mínim els dos anys anteriors a la mort (art. 631-18.2).",
    es: "Sin reducción por vivienda: un colateral solo la tiene con más de 65 años y si convivió con la persona fallecida al menos los dos años anteriores a la muerte (art. 631-18.2).",
    en: "No home reduction: a collateral relative only gets it when over 65 and after living with the deceased for at least the two years before the death (art. 631-18.2).",
  },
  "home-capped": {
    ca: "La reducció per habitatge arriba al límit: 500.000 € per a tot l'habitatge, repartits segons la part de cada hereu, i mai menys de 180.000 € per hereu (art. 631-17).",
    es: "La reducción por vivienda llega al límite: 500.000 € para toda la vivienda, repartidos según la parte de cada heredero, y nunca menos de 180.000 € por heredero (art. 631-17).",
    en: "The home reduction reaches its cap: €500,000 for the whole home, split by each heir's part, and never below €180,000 per heir (art. 631-17).",
  },
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  relation: string;
  age: string;
  ageHint: string;
  disability: string;
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
  priorHint: string;
  toPay: string;
  stepsTitle: string;
  baseImposable: string;
  baseLiquidable: string;
  quotaIntegra: string;
  coefficient: (c: string, group: string) => string;
  excess: string;
  quotaTributaria: string;
  bonus: (p: string) => string;
  bonusNone: string;
  noBase: string;
  effective: (rate: string, base: string) => string;
  zero: string;
  groupLine: (group: string) => string;
  article: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<IsdLocale, CalcCopy> = {
  ca: {
    title: "Calculadora de l'impost de successions a Catalunya",
    intro: "Una autoliquidació per hereu: escriu el teu parentiu, la teva edat i el que reps tu. El resultat mostra cada pas amb l'article del Codi tributari de Catalunya.",
    noscript: "Sense JavaScript veuràs el cas pràctic 1 de l'ATC (un fill de 30 anys que hereta 120.000 €); les taules de sota tenen la tarifa, les reduccions i la bonificació.",
    relation: "Parentiu amb la persona morta",
    age: "La teva edat el dia de la mort",
    ageHint: "En anys complerts. Fins als 20 anys, els descendents són del grup I.",
    disability: "Grau de discapacitat reconegut",
    share: "El que reps de l'herència, en net",
    shareHint: "La teva part dels béns, menys deutes i despeses deduïbles (enterrament, per exemple). Inclou-hi l'habitatge si et toca part. Sense l'assegurança de vida.",
    insurance: "Assegurança de vida que cobres per aquesta mort",
    insuranceHint: "Només la de pòlisses que va contractar la persona morta (o de què era l'assegurada, si és col·lectiva). Es suma a la base.",
    homeLegend: "Habitatge habitual de la persona morta (si n'hi ha a l'herència)",
    homeValue: "Valor de tot l'habitatge",
    homeValueHint: "El valor fiscal del 100 % de l'habitatge (amb el traster i fins a dues places d'aparcament). 0 si no n'hi ha.",
    homeOwned: "Part de l'habitatge que era de la persona morta",
    homeOwnedHint: "100 % si era tot seu; 50 % si era a mitges amb el cònjuge.",
    homeHeir: "La teva part d'aquesta part",
    homeHeirHint: "50 % si l'hereteu a parts iguals entre dos.",
    livedTogether: "Vaig conviure amb la persona morta, com a mínim, els dos anys anteriors a la mort",
    prior: "El teu patrimoni abans de l'herència",
    priorHint: "Per al coeficient multiplicador. Fins a 500.000 € no canvia res per als grups I i II.",
    toPay: "Impost a pagar (estimació)",
    stepsTitle: "Càlcul pas a pas",
    baseImposable: "Base imposable (el que reps + assegurança)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Quota íntegra segons la tarifa",
    coefficient: (c, group) => `Coeficient multiplicador: ${c} (${group})`,
    excess: "Menys l'excés de quota (Llei 29/1987, art. 22.2)",
    quotaTributaria: "Quota tributària",
    bonus: (p) => `Bonificació (${p})`,
    bonusNone: "Bonificació: no n'hi ha per als grups III i IV",
    noBase: "Les reduccions cobreixen tota la base: no hi ha impost.",
    effective: (rate, base) => `Pagues el ${rate} dels ${base} que reps.`,
    zero: "No pagues res, però el Codi tributari t'obliga igualment a presentar la declaració i l'autoliquidació (art. 682-1): el model 650, encara que surti a zero.",
    groupLine: (group) => `Parentiu: ${group}.`,
    article: "art.",
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
    title: "Calculadora del impuesto de sucesiones en Cataluña",
    intro: "Una autoliquidación por heredero: escribe tu parentesco, tu edad y lo que recibes tú. El resultado muestra cada paso con el artículo del Código tributario de Cataluña.",
    noscript: "Sin JavaScript verás el caso práctico 1 de la ATC (un hijo de 30 años que hereda 120.000 €); las tablas de abajo tienen la tarifa, las reducciones y la bonificación.",
    relation: "Parentesco con la persona fallecida",
    age: "Tu edad el día del fallecimiento",
    ageHint: "En años cumplidos. Hasta los 20 años, los descendientes son del grupo I.",
    disability: "Grado de discapacidad reconocido",
    share: "Lo que recibes de la herencia, en neto",
    shareHint: "Tu parte de los bienes, menos deudas y gastos deducibles (el entierro, por ejemplo). Incluye la vivienda si te toca parte. Sin el seguro de vida.",
    insurance: "Seguro de vida que cobras por este fallecimiento",
    insuranceHint: "Solo el de pólizas que contrató la persona fallecida (o de las que era la asegurada, si es colectiva). Se suma a la base.",
    homeLegend: "Vivienda habitual de la persona fallecida (si está en la herencia)",
    homeValue: "Valor de toda la vivienda",
    homeValueHint: "El valor fiscal del 100 % de la vivienda (con el trastero y hasta dos plazas de aparcamiento). 0 si no hay.",
    homeOwned: "Parte de la vivienda que era de la persona fallecida",
    homeOwnedHint: "100 % si era toda suya; 50 % si era a medias con el cónyuge.",
    homeHeir: "Tu parte de esa parte",
    homeHeirHint: "50 % si la heredáis a partes iguales entre dos.",
    livedTogether: "Conviví con la persona fallecida, al menos, los dos años anteriores a su muerte",
    prior: "Tu patrimonio antes de la herencia",
    priorHint: "Para el coeficiente multiplicador. Hasta 500.000 € no cambia nada para los grupos I y II.",
    toPay: "Impuesto a pagar (estimación)",
    stepsTitle: "Cálculo paso a paso",
    baseImposable: "Base imponible (lo que recibes + seguro)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Cuota íntegra según la tarifa",
    coefficient: (c, group) => `Coeficiente multiplicador: ${c} (${group})`,
    excess: "Menos el exceso de cuota (Ley 29/1987, art. 22.2)",
    quotaTributaria: "Cuota tributaria",
    bonus: (p) => `Bonificación (${p})`,
    bonusNone: "Bonificación: no hay para los grupos III y IV",
    noBase: "Las reducciones cubren toda la base: no hay impuesto.",
    effective: (rate, base) => `Pagas el ${rate} de los ${base} que recibes.`,
    zero: "No pagas nada, pero el Código tributario te obliga igualmente a presentar la declaración y la autoliquidación (art. 682-1): el modelo 650, aunque salga a cero.",
    groupLine: (group) => `Parentesco: ${group}.`,
    article: "art.",
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
    title: "Catalonia inheritance tax calculator",
    intro: "One self-assessment per heir: enter your relationship, your age and what you receive. The result shows each step with its article of the Catalan Tax Code.",
    noscript: "Without JavaScript you see the ATC's worked example 1 (a 30-year-old son inheriting €120,000); the tables below have the scale, the reductions and the rebate.",
    relation: "Your relationship to the deceased",
    age: "Your age on the day of the death",
    ageHint: "In completed years. Descendants are in group I up to the age of 20.",
    disability: "Officially recognised disability",
    share: "What you receive from the estate, net",
    shareHint: "Your part of the assets, less debts and deductible costs (the funeral, for instance). Include your part of the home, if any. Without the life insurance.",
    insurance: "Life insurance you receive because of this death",
    insuranceHint: "Only from policies the deceased took out (or on which they were the insured person, for group policies). It is added to the base.",
    homeLegend: "The deceased's habitual home (if it is in the estate)",
    homeValue: "Value of the whole home",
    homeValueHint: "The tax value of 100% of the home (with its storage room and up to two parking spaces). 0 if there is none.",
    homeOwned: "Part of the home the deceased owned",
    homeOwnedHint: "100% if it was all theirs; 50% if they owned it half and half with their spouse.",
    homeHeir: "Your share of that part",
    homeHeirHint: "50% if two of you inherit it in equal shares.",
    livedTogether: "I lived with the deceased for at least the two years before the death",
    prior: "Your own wealth before the inheritance",
    priorHint: "For the multiplying coefficient. Up to €500,000 nothing changes for groups I and II.",
    toPay: "Tax to pay (estimate)",
    stepsTitle: "Step by step",
    baseImposable: "Taxable base (what you receive + insurance)",
    baseLiquidable: "Net taxable base (base liquidable)",
    quotaIntegra: "Gross tax from the scale (quota íntegra)",
    coefficient: (c, group) => `Multiplying coefficient: ${c} (${group})`,
    excess: "Less the excess-tax rule (Law 29/1987, art. 22.2)",
    quotaTributaria: "Tax after the coefficient (quota tributària)",
    bonus: (p) => `Rebate (bonificació, ${p})`,
    bonusNone: "Rebate: none for groups III and IV",
    noBase: "The reductions cover the whole base: there is no tax.",
    effective: (rate, base) => `You pay ${rate} of the ${base} you receive.`,
    zero: "You pay nothing, but the Catalan Tax Code still requires you to file the return and self-assessment (art. 682-1): form 650, even when it comes to zero.",
    groupLine: (group) => `Kinship: ${group}.`,
    article: "art.",
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
