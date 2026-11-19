import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { money, type IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";

import type { GiftInvalid, GiftNote, GiftReductionId } from "./engine";
import type { GiftCalculatorId, GiftCite, GiftKind, GiftLawId, GiftRegionId, GiftRelation, GiftRules } from "./regions/types";

/**
 * Paths and words of the four gift tax calculators, small enough for the
 * browser (the client component imports this file and the engine; the rules
 * arrive as a prop).
 *
 *   /es/calculadoras/impuesto-donaciones-cataluna/            (ca, en: calculators/paths.ts)
 *   /es/calculadoras/impuesto-donaciones-madrid/
 *   /es/calculadoras/impuesto-donaciones-andalucia/
 *   /es/calculadoras/impuesto-donaciones-comunidad-valenciana/
 */

export type GiftLocale = IsdLocale;

export const GIFT_CALCULATOR: Record<GiftRegionId, GiftCalculatorId> = {
  catalonia: "gift-tax-catalonia",
  madrid: "gift-tax-madrid",
  andalucia: "gift-tax-andalucia",
  valencia: "gift-tax-valencia",
};

/** The inheritance tax calculator of the same community (the pages link each other). */
export const INHERITANCE_OF: Record<GiftRegionId, CalculatorId> = {
  catalonia: "inheritance-tax",
  madrid: "inheritance-tax-madrid",
  andalucia: "inheritance-tax-andalucia",
  valencia: "inheritance-tax-valencia",
};

/** The gift tax calculator of an inheritance calculator's community. */
export const GIFT_OF_INHERITANCE: Partial<Record<CalculatorId, GiftCalculatorId>> = {
  "inheritance-tax": "gift-tax-catalonia",
  "inheritance-tax-madrid": "gift-tax-madrid",
  "inheritance-tax-andalucia": "gift-tax-andalucia",
  "inheritance-tax-valencia": "gift-tax-valencia",
};

export function giftPath(region: GiftRegionId, locale: GiftLocale): string {
  return calcPath(GIFT_CALCULATOR[region], locale);
}

export function giftEditions(region: GiftRegionId): Record<GiftLocale, string> {
  return { ca: giftPath(region, "ca"), es: giftPath(region, "es"), en: giftPath(region, "en") };
}

/** "Comunidad de Madrid": the short name. */
export const GIFT_REGION_NAME: Record<GiftRegionId, Record<GiftLocale, string>> = {
  catalonia: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" },
  madrid: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid region" },
  andalucia: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" },
  valencia: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region (Comunitat Valenciana)" },
};

/** The four gift tax calculators, Catalonia first (the "by community" links). */
export const GIFT_FAMILY: readonly { id: GiftCalculatorId; region: GiftRegionId; name: Record<GiftLocale, string> }[] = [
  { id: "gift-tax-catalonia", region: "catalonia", name: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" } },
  { id: "gift-tax-madrid", region: "madrid", name: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid" } },
  { id: "gift-tax-andalucia", region: "andalucia", name: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" } },
  { id: "gift-tax-valencia", region: "valencia", name: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region" } },
];

/** "a Catalunya" / "en la Comunidad de Madrid" / "in Andalusia". */
export const GIFT_REGION_IN: Record<GiftRegionId, Record<GiftLocale, string>> = {
  catalonia: { ca: "a Catalunya", es: "en Cataluña", en: "in Catalonia" },
  madrid: { ca: "a la Comunitat de Madrid", es: "en la Comunidad de Madrid", en: "in the Madrid region" },
  andalucia: { ca: "a Andalusia", es: "en Andalucía", en: "in Andalusia" },
  valencia: { ca: "a la Comunitat Valenciana", es: "en la Comunidad Valenciana", en: "in the Valencia region" },
};

/** The tax administration that receives form 651. */
export const GIFT_AGENCY: Record<GiftRegionId, Record<GiftLocale, string>> = {
  catalonia: { ca: "l'Agència Tributària de Catalunya (ATC)", es: "la Agència Tributària de Catalunya (ATC)", en: "the Catalan Tax Agency (Agència Tributària de Catalunya, ATC)" },
  madrid: { ca: "l'Administració Tributària de la Comunitat de Madrid", es: "la Administración Tributaria de la Comunidad de Madrid", en: "the Madrid regional tax administration" },
  andalucia: { ca: "l'Agència Tributària d'Andalusia", es: "la Agencia Tributaria de Andalucía", en: "the Andalusian Tax Agency (Agencia Tributaria de Andalucía)" },
  valencia: { ca: "l'Agència Tributària Valenciana (ATV)", es: "la Agència Tributària Valenciana (ATV)", en: "the Valencian Tax Agency (Agència Tributària Valenciana, ATV)" },
};

const LAW_SHORT: Record<GiftLawId, Record<GiftLocale, string>> = {
  catalonia: { ca: "Codi tributari de Catalunya", es: "Código tributario de Cataluña", en: "Catalan Tax Code" },
  catReg: { ca: "Reglament de l'impost (Decret 414/2011)", es: "Reglamento del impuesto en Cataluña (Decreto 414/2011)", en: "Catalan tax regulation (Decree 414/2011)" },
  madrid: { ca: "Decret legislatiu 1/2010 de Madrid", es: "Decreto Legislativo 1/2010 de Madrid", en: "Madrid Legislative Decree 1/2010" },
  andalucia: { ca: "Llei 5/2021 de tributs cedits d'Andalusia", es: "Ley 5/2021 de Tributos Cedidos de Andalucía", en: "Andalusian Ceded Taxes Act (Law 5/2021)" },
  valencia: { ca: "Llei valenciana 13/1997", es: "Ley valenciana 13/1997", en: "Valencian Law 13/1997" },
  lisd: { ca: "Llei 29/1987 de l'impost sobre successions i donacions", es: "Ley 29/1987 del Impuesto sobre Sucesiones y Donaciones", en: "Inheritance and Gift Tax Act (Law 29/1987)" },
  risd: { ca: "Reial decret 1629/1991", es: "Real Decreto 1629/1991", en: "Royal Decree 1629/1991" },
  lofca: { ca: "Llei 22/2009", es: "Ley 22/2009", en: "Law 22/2009" },
};

export function giftLawName(law: GiftLawId, locale: GiftLocale): string {
  return LAW_SHORT[law][locale];
}

/** "Ley 5/2021 de Tributos Cedidos de Andalucía, art. 40". */
export function giftCite(c: GiftCite, locale: GiftLocale): string {
  return `${LAW_SHORT[c.law][locale]}, art. ${c.art}`;
}

const RELATION_LABEL: Record<GiftRelation, Record<GiftLocale, string>> = {
  child: { ca: "Fill o filla (també adoptat)", es: "Hijo o hija (también adoptado)", en: "Son or daughter (also adopted)" },
  grandchild: { ca: "Nét o néta", es: "Nieto o nieta", en: "Grandchild" },
  spouse: { ca: "Cònjuge o parella de fet inscrita", es: "Cónyuge o pareja de hecho inscrita", en: "Spouse or registered partner" },
  parent: { ca: "Pare o mare", es: "Padre o madre", en: "Father or mother" },
  grandparent: { ca: "Avi o àvia", es: "Abuelo o abuela", en: "Grandparent" },
  sibling: { ca: "Germà o germana", es: "Hermano o hermana", en: "Brother or sister" },
  nephew: { ca: "Nebot, neboda, oncle o tia (de sang)", es: "Sobrino, sobrina, tío o tía (de sangre)", en: "Nephew, niece, uncle or aunt (by blood)" },
  affinity: {
    ca: "Parent per afinitat (sogres, gendre o jove, fillastres, cunyats)",
    es: "Pariente por afinidad (suegros, yerno o nuera, hijastros, cuñados)",
    en: "In-law or stepchild (parent-, son-, daughter-, brother- or sister-in-law)",
  },
  distant: { ca: "Cosí, cosina o parent més llunyà", es: "Primo, prima o pariente más lejano", en: "Cousin or more distant relative" },
  unrelated: { ca: "Sense parentiu (també la parella no inscrita)", es: "Sin parentesco (también la pareja no inscrita)", en: "Not related (an unregistered partner too)" },
};

/** Catalonia counts stepchildren as children (art. 634-2) and stable partners as spouses (art. 634-1). */
const CATALONIA_RELATION_LABEL: Partial<Record<GiftRelation, Record<GiftLocale, string>>> = {
  child: { ca: "Fill o filla (també adoptat o del cònjuge o la parella)", es: "Hijo o hija (también adoptado o del cónyuge o la pareja)", en: "Son or daughter (also adopted, or your spouse's or partner's)" },
  spouse: { ca: "Cònjuge o parella estable", es: "Cónyuge o pareja estable", en: "Spouse or stable partner" },
  parent: { ca: "Pare o mare (també el cònjuge o la parella del pare o la mare)", es: "Padre o madre (también el cónyuge o la pareja del padre o la madre)", en: "Father or mother (also a parent's spouse or partner)" },
  affinity: { ca: "Parent per afinitat (sogres, gendre o jove, cunyats)", es: "Pariente por afinidad (suegros, yerno o nuera, cuñados)", en: "In-law (parent-, son-, daughter-, brother- or sister-in-law)" },
  unrelated: { ca: "Sense parentiu", es: "Sin parentesco", en: "Not related" },
};

export function giftRelationLabel(region: GiftRegionId, relation: GiftRelation, locale: GiftLocale): string {
  return ((region === "catalonia" ? CATALONIA_RELATION_LABEL[relation] : undefined) ?? RELATION_LABEL[relation])[locale];
}

export const GIFT_KIND_LABEL: Record<GiftKind, Record<GiftLocale, string>> = {
  money: { ca: "Diners (efectiu o transferència)", es: "Dinero (efectivo o transferencia)", en: "Money (cash or a transfer)" },
  home: { ca: "Un habitatge", es: "Una vivienda", en: "A home" },
  other: { ca: "Un altre bé (immoble, accions, cotxe…)", es: "Otro bien (inmueble, acciones, coche…)", en: "Something else (property, shares, a car…)" },
};

export const GIFT_REDUCTION_LABEL: Record<GiftRegionId, Record<GiftReductionId, Record<GiftLocale, string>>> = {
  catalonia: {
    kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
    disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
    home: { ca: "Reducció per primer habitatge habitual", es: "Reducción por primera vivienda habitual", en: "First habitual home reduction" },
  },
  madrid: {
    kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
    disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
    home: { ca: "Reducció per diners per a l'habitatge habitual", es: "Reducción por dinero para la vivienda habitual", en: "Cash for the habitual home reduction" },
  },
  andalucia: {
    kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
    disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
    home: { ca: "Reducció per habitatge habitual", es: "Reducción por vivienda habitual", en: "Habitual home reduction" },
  },
  valencia: {
    kinship: { ca: "Reducció per parentiu", es: "Reducción por parentesco", en: "Kinship reduction" },
    disability: { ca: "Reducció per discapacitat", es: "Reducción por discapacidad", en: "Disability reduction" },
    home: { ca: "Reducció per habitatge", es: "Reducción por vivienda", en: "Home reduction" },
  },
};

/** The article each reduction cites. */
export function giftReductionCite(rules: GiftRules, id: GiftReductionId, kind: GiftKind): GiftCite {
  if (id === "kinship") return rules.cite.kinship!;
  if (id === "disability") return rules.cite.disability!;
  // Andalucía: cash for the home is art. 32, the home itself art. 33.
  if (rules.id === "andalucia" && kind === "home") return { law: "andalucia", art: "33" };
  return rules.cite.home!;
}

/** The form's region-specific labels: the public deed, the origin of cash and the home purpose. */
export function giftFormLabels(region: GiftRegionId, locale: GiftLocale): { deed: string; deedHint: string; funds: string; fundsHint: string; home: string | null; homeHint: string | null } {
  const funds = { ca: "Diners: el document diu d'on surten i es pot justificar", es: "Dinero: el documento dice de dónde sale y se puede justificar", en: "Money: the document states where it comes from and it can be shown" }[locale];
  return {
    catalonia: {
      ca: {
        deed: "Donació en escriptura pública davant notari",
        deedHint: "Si són diners, l'escriptura s'ha de signar dins del mes següent a l'entrega (la transferència). Sense escriptura, tarifa general.",
        funds,
        fundsHint: "",
        home: "És per al teu primer habitatge habitual (diners per comprar-lo o l'habitatge mateix) i compleixes els requisits",
        homeHint: "Descendents de 36 anys o menys (o amb discapacitat del 65 %), renda de l'última declaració fins a 36.000 € i compra en sis mesos.",
      },
      es: {
        deed: "Donación en escritura pública ante notario",
        deedHint: "Si es dinero, la escritura se tiene que firmar dentro del mes siguiente a la entrega (la transferencia). Sin escritura, tarifa general.",
        funds,
        fundsHint: "",
        home: "Es para tu primera vivienda habitual (dinero para comprarla o la vivienda misma) y cumples los requisitos",
        homeHint: "Descendientes de 36 años o menos (o con discapacidad del 65 %), renta de la última declaración hasta 36.000 € y compra en seis meses.",
      },
      en: {
        deed: "The gift is in a public deed before a notary",
        deedHint: "For money, the deed must be signed within a month of the handover (the transfer). Without a deed, the general scale applies.",
        funds,
        fundsHint: "",
        home: "It is for your first habitual home (money to buy it, or the home itself) and you meet the conditions",
        homeHint: "Descendants aged 36 or under (or with a 65% disability), income on the last tax return up to €36,000, and the purchase within six months.",
      },
    },
    madrid: {
      ca: {
        deed: "Donació en document públic (escriptura davant notari)",
        deedHint: "Cal per a la bonificació quan les donacions de la mateixa persona en tres anys passen de 10.000 €.",
        funds,
        fundsHint: "Sense això, la donació de diners no té bonificació.",
        home: "Són diners per comprar el teu habitatge habitual dins d'un any",
        homeHint: "Grups I i II o germans; el document ha de dir-ne el destí.",
      },
      es: {
        deed: "Donación en documento público (escritura ante notario)",
        deedHint: "Hace falta para la bonificación cuando las donaciones de la misma persona en tres años pasan de 10.000 €.",
        funds,
        fundsHint: "Sin esto, la donación de dinero no tiene bonificación.",
        home: "Es dinero para comprar tu vivienda habitual dentro de un año",
        homeHint: "Grupos I y II o hermanos; el documento tiene que decir el destino.",
      },
      en: {
        deed: "The gift is in a public document (a deed before a notary)",
        deedHint: "Needed for the rebate when the gifts from the same person in three years exceed €10,000.",
        funds,
        fundsHint: "Without it, a gift of money gets no rebate.",
        home: "It is money to buy your habitual home within a year",
        homeHint: "Groups I and II or siblings; the document must state what it is for.",
      },
    },
    andalucia: {
      ca: {
        deed: "Donació en document públic (escriptura davant notari)",
        deedHint: "Cal per a la bonificació quan les donacions de la mateixa persona en tres anys passen de 5.000 €; si són diners, signada dins del mes següent a l'entrega.",
        funds,
        fundsHint: "Per sobre de 5.000 €, sense això no hi ha bonificació.",
        home: "És per al teu habitatge habitual a Andalusia (diners per comprar-lo o l'habitatge mateix) i compleixes els requisits",
        homeHint: "De pares o avis a descendents menors de 35 anys o amb discapacitat, amb un patrimoni previ fins a 402.678,11 €.",
      },
      es: {
        deed: "Donación en documento público (escritura ante notario)",
        deedHint: "Hace falta para la bonificación cuando las donaciones de la misma persona en tres años pasan de 5.000 €; si es dinero, firmada dentro del mes siguiente a la entrega.",
        funds,
        fundsHint: "Por encima de 5.000 €, sin esto no hay bonificación.",
        home: "Es para tu vivienda habitual en Andalucía (dinero para comprarla o la vivienda misma) y cumples los requisitos",
        homeHint: "De padres o abuelos a descendientes menores de 35 años o con discapacidad, con un patrimonio previo de hasta 402.678,11 €.",
      },
      en: {
        deed: "The gift is in a public document (a deed before a notary)",
        deedHint: "Needed for the rebate when the gifts from the same person in three years exceed €5,000; for money, signed within a month of the handover.",
        funds,
        fundsHint: "Above €5,000, without it there is no rebate.",
        home: "It is for your habitual home in Andalusia (money to buy it, or the home itself) and you meet the conditions",
        homeHint: "From parents or grandparents to descendants under 35 or with a disability, with prior wealth up to €402,678.11.",
      },
    },
    valencia: {
      ca: {
        deed: "Donació en document públic (o, fins a 4.000 € en diners o un vehicle, documents signats digitalment amb un servei de confiança qualificat)",
        deedHint: "Sense això no hi ha reducció per parentiu ni bonificació.",
        funds,
        fundsHint: "També cal que el document identifiqui com es lliuren els diners.",
        home: null,
        homeHint: null,
      },
      es: {
        deed: "Donación en documento público (o, hasta 4.000 € en dinero o un vehículo, documentos firmados digitalmente con un servicio de confianza cualificado)",
        deedHint: "Sin esto no hay reducción por parentesco ni bonificación.",
        funds,
        fundsHint: "También hace falta que el documento identifique cómo se entrega el dinero.",
        home: null,
        homeHint: null,
      },
      en: {
        deed: "The gift is in a public document (or, up to €4,000 in money or a vehicle, documents signed digitally through a qualified trust service)",
        deedHint: "Without it there is no kinship reduction and no rebate.",
        funds,
        fundsHint: "The document must also identify how the money is handed over.",
        home: null,
        homeHint: null,
      },
    },
  }[region][locale];
}

/** Each note the result can carry, in the community's terms. */
export function giftNote(note: GiftNote, rules: GiftRules, locale: GiftLocale): string {
  const M = (n: number) => money(n, locale);
  const r = rules.id;
  const h = rules.home;
  const pick = (v: Record<GiftLocale, string>) => v[locale];
  switch (note) {
    case "reduced-scale-deed":
      return pick({
        ca: "Sense escriptura pública (signada, si són diners, dins del mes següent a l'entrega) s'aplica la tarifa general, del 7 % al 32 %. Amb escriptura, els grups I i II tenen la tarifa reduïda: 5 % fins a 200.000 €, 7 % fins a 600.000 € i 9 % a partir d'aquí.",
        es: "Sin escritura pública (firmada, si es dinero, dentro del mes siguiente a la entrega) se aplica la tarifa general, del 7 % al 32 %. Con escritura, los grupos I y II tienen la tarifa reducida: 5 % hasta 200.000 €, 7 % hasta 600.000 € y 9 % a partir de ahí.",
        en: "Without a public deed (signed, for money, within a month of the handover) the general scale applies, 7% to 32%. With a deed, groups I and II get the reduced scale: 5% up to €200,000, 7% up to €600,000 and 9% above that.",
      });
    case "bonus-deed":
      if (r === "madrid")
        return pick({
          ca: "Per sobre de 10.000 € en tres anys de la mateixa persona, la bonificació exigeix document públic. En document privat, Madrid divideix la donació que travessa el límit en dues autoliquidacions: la part fins a 10.000 € té bonificació i la resta no. La calculadora no fa aquesta divisió: treu la bonificació.",
          es: "Por encima de 10.000 € en tres años de la misma persona, la bonificación exige documento público. En documento privado, Madrid divide la donación que cruza el límite en dos autoliquidaciones: la parte hasta 10.000 € tiene bonificación y el resto no. La calculadora no hace esa división: quita la bonificación.",
          en: "Above €10,000 in three years from the same person, the rebate needs a public document. In a private document, Madrid splits the gift that crosses the limit into two self-assessments: the part up to €10,000 keeps the rebate, the rest does not. The calculator does not split it: it drops the rebate.",
        });
      if (r === "andalucia")
        return pick({
          ca: "Per sobre de 5.000 € en tres anys de la mateixa persona, la bonificació exigeix document públic amb l'entrega del bé alhora (si són diners, signat dins del mes següent a l'entrega).",
          es: "Por encima de 5.000 € en tres años de la misma persona, la bonificación exige documento público con la entrega simultánea del bien (si es dinero, firmado dentro del mes siguiente a la entrega).",
          en: "Above €5,000 in three years from the same person, the rebate needs a public document with the asset handed over at the same time (for money, signed within a month of the handover).",
        });
      return pick({
        ca: "La bonificació exigeix document públic, o formalitzar-la així dins del termini de declaració. Fins a 4.000 € en diners o un vehicle en tres anys, valen documents signats digitalment amb un servei de confiança qualificat.",
        es: "La bonificación exige documento público, o formalizarla así dentro del plazo de declaración. Hasta 4.000 € en dinero o un vehículo en tres años, valen documentos firmados digitalmente con un servicio de confianza cualificado.",
        en: "The rebate needs a public document, or the gift put in one within the filing period. Up to €4,000 in money or a vehicle in three years, documents signed digitally through a qualified trust service will do.",
      });
    case "bonus-funds":
      return pick({
        ca: `Amb diners, la bonificació només s'aplica si l'origen dels fons està justificat i consta al document de la donació${r === "valencia" ? ", amb els mitjans de l'entrega" : ""}${r === "andalucia" ? " (per sobre de 5.000 €)" : ""}.`,
        es: `Con dinero, la bonificación solo se aplica si el origen de los fondos está justificado y consta en el documento de la donación${r === "valencia" ? ", con los medios de la entrega" : ""}${r === "andalucia" ? " (por encima de 5.000 €)" : ""}.`,
        en: `With money, the rebate only applies if the origin of the funds is justified and stated in the gift document${r === "valencia" ? ", with how it is handed over" : ""}${r === "andalucia" ? " (above €5,000)" : ""}.`,
      });
    case "small-gift":
      return pick({
        ca: `Les donacions d'una mateixa persona que no passen de ${M(rules.bonus?.smallGiftMax ?? 0)} en tres anys es bonifiquen al 100 %, sigui quin sigui el parentiu, i no cal presentar autoliquidació (llevat de béns que s'han d'inscriure en un registre públic).`,
        es: `Las donaciones de una misma persona que no pasan de ${M(rules.bonus?.smallGiftMax ?? 0)} en tres años se bonifican al 100 %, sea cual sea el parentesco, y no hay que presentar autoliquidación (salvo bienes que se inscriben en un registro público).`,
        en: `Gifts from the same person adding up to no more than ${M(rules.bonus?.smallGiftMax ?? 0)} in three years get 100% off, whatever the relationship, and no self-assessment is needed (except for assets entered in a public register).`,
      });
    case "reductions-deed":
      return pick({
        ca: "Sense document públic (o, fins a 4.000 € en diners o un vehicle, documents signats digitalment) no hi ha reducció per parentiu ni per discapacitat, ni bonificació.",
        es: "Sin documento público (o, hasta 4.000 € en dinero o un vehículo, documentos firmados digitalmente) no hay reducción por parentesco ni por discapacidad, ni bonificación.",
        en: "Without a public document (or, up to €4,000 in money or a vehicle, digitally signed documents) there is no kinship or disability reduction, and no rebate.",
      });
    case "reductions-funds":
      return pick({
        ca: "Amb diners, la reducció i la bonificació exigeixen justificar l'origen dels fons i que el document ho digui, amb el mitjà de l'entrega.",
        es: "Con dinero, la reducción y la bonificación exigen justificar el origen de los fondos y que el documento lo diga, con el medio de la entrega.",
        en: "With money, the reduction and the rebate need the origin of the funds justified and stated in the document, with how it is handed over.",
      });
    case "home-kind":
      return pick(
        r === "madrid"
          ? { ca: "La reducció de Madrid és per a donacions de diners.", es: "La reducción de Madrid es para donaciones de dinero.", en: "Madrid's reduction is for gifts of money." }
          : r === "andalucia"
            ? { ca: "La reducció és per a diners destinats a comprar l'habitatge habitual (art. 32) o per a l'habitatge mateix (art. 33).", es: "La reducción es para dinero destinado a comprar la vivienda habitual (art. 32) o para la vivienda misma (art. 33).", en: "The reduction is for money to buy the habitual home (art. 32) or for the home itself (art. 33)." }
            : { ca: "La reducció és per a diners destinats a comprar el primer habitatge habitual o per a l'habitatge (o el terreny) mateix.", es: "La reducción es para dinero destinado a comprar la primera vivienda habitual o para la vivienda (o el terreno) misma.", en: "The reduction is for money to buy the first habitual home, or for the home (or the plot) itself." },
      );
    case "home-relation":
      return pick(
        r === "madrid"
          ? { ca: "Sense reducció: és per als grups I i II (fills, néts, cònjuge, pares, avis) i els germans.", es: "Sin reducción: es para los grupos I y II (hijos, nietos, cónyuge, padres, abuelos) y los hermanos.", en: "No reduction: it is for groups I and II (children, grandchildren, spouse, parents, grandparents) and siblings." }
          : r === "andalucia"
            ? { ca: "Sense reducció: és per a descendents que reben de pares o avis.", es: "Sin reducción: es para descendientes que reciben de padres o abuelos.", en: "No reduction: it is for descendants receiving from parents or grandparents." }
            : { ca: "Sense reducció: és per a descendents (fills, néts…).", es: "Sin reducción: es para descendientes (hijos, nietos…).", en: "No reduction: it is for descendants (children, grandchildren…)." },
      );
    case "home-age":
      return pick(
        r === "andalucia"
          ? { ca: "Sense reducció: és per a menors de 35 anys o persones amb discapacitat (també víctimes de violència domèstica o del terrorisme, que la calculadora no pregunta).", es: "Sin reducción: es para menores de 35 años o personas con discapacidad (también víctimas de violencia doméstica o del terrorismo, que la calculadora no pregunta).", en: "No reduction: it is for donees under 35 or with a disability (also victims of domestic violence or terrorism, which the calculator does not ask)." }
          : { ca: `Sense reducció: el donatari no pot tenir més de ${h?.maxAge} anys, llevat d'una discapacitat del 65 % o més.`, es: `Sin reducción: el donatario no puede tener más de ${h?.maxAge} años, salvo una discapacidad del 65 % o más.`, en: `No reduction: the donee must be ${h?.maxAge} or younger, unless they have a 65% disability or more.` },
      );
    case "home-prior":
      return pick({
        ca: `Sense reducció: el teu patrimoni previ ha de ser al primer tram de la Llei 29/1987 (fins a ${M(h?.priorWealthMax ?? 0)}).`,
        es: `Sin reducción: tu patrimonio previo tiene que estar en el primer tramo de la Ley 29/1987 (hasta ${M(h?.priorWealthMax ?? 0)}).`,
        en: `No reduction: your prior wealth must be in the first bracket of Law 29/1987 (up to ${M(h?.priorWealthMax ?? 0)}).`,
      });
    case "home-deed":
      return pick(
        r === "madrid"
          ? { ca: "Sense reducció: per sobre de 10.000 € en tres anys cal document públic que digui el destí dels diners.", es: "Sin reducción: por encima de 10.000 € en tres años hace falta documento público que diga el destino del dinero.", en: "No reduction: above €10,000 in three years it needs a public document stating what the money is for." }
          : r === "andalucia"
            ? { ca: "Sense reducció: la donació de l'habitatge ha de ser en escriptura que digui que serà el teu habitatge habitual i el compromís de mantenir-lo tres anys.", es: "Sin reducción: la donación de la vivienda tiene que ser en escritura que diga que será tu vivienda habitual y el compromiso de mantenerla tres años.", en: "No reduction: the home must be given in a deed stating it will be your habitual home and the commitment to keep it three years." }
            : { ca: "Sense reducció: cal escriptura pública que digui la finalitat (amb diners, signada dins del mes següent a l'entrega).", es: "Sin reducción: hace falta escritura pública que diga la finalidad (con dinero, firmada dentro del mes siguiente a la entrega).", en: "No reduction: it needs a public deed stating the purpose (for money, signed within a month of the handover)." },
      );
    case "home-capped":
      return pick(
        r === "madrid"
          ? { ca: `La reducció arriba al màxim: ${M(h?.cap ?? 0)}, comptant tres anys de donacions de la mateixa persona per a aquest fi.`, es: `La reducción llega al máximo: ${M(h?.cap ?? 0)}, contando tres años de donaciones de la misma persona para este fin.`, en: `The reduction reaches its cap: ${M(h?.cap ?? 0)}, counting three years of gifts from the same person for this purpose.` }
          : r === "andalucia"
            ? { ca: `La base de la reducció arriba al màxim: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} amb discapacitat).`, es: `La base de la reducción llega al máximo: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} con discapacidad).`, en: `The reduction's base reaches its cap: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} with a disability).` }
            : { ca: `La reducció arriba al màxim: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} amb discapacitat del 65 %), comptant totes les donacions per al primer habitatge.`, es: `La reducción llega al máximo: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} con discapacidad del 65 %), contando todas las donaciones para la primera vivienda.`, en: `The reduction reaches its cap: ${M(h?.cap ?? 0)} (${M(h?.capDisability ?? 0)} with a 65% disability), counting every gift for the first home.` },
      );
    case "home-conditions":
      return pick(
        r === "madrid"
          ? { ca: "A més, el document ha de dir el destí dels diners, has de comprar l'habitatge dins d'un any i viure-hi. Si no, cal una autoliquidació complementària en un mes.", es: "Además, el documento tiene que decir el destino del dinero, tienes que comprar la vivienda dentro de un año y vivir en ella. Si no, hay que presentar una autoliquidación complementaria en un mes.", en: "Also, the document must state what the money is for, and you must buy the home within a year and live in it. If not, a supplementary self-assessment is due within a month." }
          : r === "andalucia"
            ? { ca: "A més, tots els diners han d'anar a la compra d'un habitatge a Andalusia, comprat dins del termini de l'autoliquidació amb escriptura que esmenti la donació, i l'has de mantenir tres anys.", es: "Además, todo el dinero tiene que ir a la compra de una vivienda en Andalucía, comprada dentro del plazo de la autoliquidación con escritura que mencione la donación, y la tienes que mantener tres años.", en: "Also, all the money must go to buying a home in Andalusia, bought within the self-assessment period with a deed mentioning the gift, and you must keep it three years." }
            : { ca: "La reducció és provisional: a més, la teva última declaració de renda (bases general i de l'estalvi menys els mínims) no pot passar de 36.000 €, l'escriptura ha de dir que és per al primer habitatge habitual i, amb diners, l'has de comprar en sis mesos i viure-hi.", es: "La reducción es provisional: además, tu última declaración de la renta (bases general y del ahorro menos los mínimos) no puede pasar de 36.000 €, la escritura tiene que decir que es para la primera vivienda habitual y, con dinero, la tienes que comprar en seis meses y vivir en ella.", en: "The reduction is provisional: also, your last income tax return (general and savings bases less the personal and family minimums) must not exceed €36,000, the deed must say it is for the first habitual home and, with money, you must buy it within six months and live in it." },
      );
    case "accumulated":
      return pick({
        ca: "Amb donacions anteriors de la mateixa persona en els tres anys previs, la tarifa s'aplica a la suma i el seu tipus mitjà, amb dos decimals, s'aplica a aquesta donació (Llei 29/1987, art. 30).",
        es: "Con donaciones anteriores de la misma persona en los tres años previos, la tarifa se aplica a la suma y su tipo medio, con dos decimales, se aplica a esta donación (Ley 29/1987, art. 30).",
        en: "With earlier gifts from the same person in the three years before, the scale runs on the sum and its average rate, to two decimals, applies to this gift (Law 29/1987, art. 30).",
      });
    case "five-years":
      return pick({
        ca: "Els límits de les reduccions compten totes les donacions de la mateixa persona dels cinc anys anteriors (i, per a la de discapacitat, totes les que has rebut): si ja en vas gastar una part, en queda menys. La calculadora aplica la reducció sencera.",
        es: "Los límites de las reducciones cuentan todas las donaciones de la misma persona de los cinco años anteriores (y, para la de discapacidad, todas las que has recibido): si ya gastaste una parte, queda menos. La calculadora aplica la reducción entera.",
        en: "The reductions' limits count every gift from the same person in the five years before (and, for the disability one, every gift you received): if part was used, less is left. The calculator applies the full reduction.",
      });
    case "mental-as-65":
      return pick({
        ca: `Una discapacitat intel·lectual o mental del 33 % o més, reconeguda de manera permanent, compta com la del 65 %: reducció de ${M(rules.disability?.from65 ?? 0)} i bonificació del ${rules.bonus?.disability ?? 0} %.`,
        es: `Una discapacidad intelectual o mental del 33 % o más, reconocida de forma permanente, cuenta como la del 65 %: reducción de ${M(rules.disability?.from65 ?? 0)} y bonificación del ${rules.bonus?.disability ?? 0} %.`,
        en: `An intellectual or mental disability of 33% or more, permanently recognised, counts as a 65% one: a ${M(rules.disability?.from65 ?? 0)} reduction and a ${rules.bonus?.disability ?? 0}% rebate.`,
      });
    case "declared-on-time":
      return pick({
        ca: "La bonificació només s'aplica a la part de la quota dels béns declarats dins de termini (o abans d'un requeriment de l'Administració): la calculadora suposa que ho declares tot.",
        es: "La bonificación solo se aplica a la parte de la cuota de los bienes declarados en plazo (o antes de un requerimiento de la Administración): la calculadora supone que lo declaras todo.",
        en: "The rebate only covers the part of the tax for assets declared on time (or before the tax office asks): the calculator assumes you declare everything.",
      });
  }
}

export interface GiftCalcCopy {
  title: (region: string) => string;
  intro: string;
  noscript: string;
  relation: string;
  age: string;
  ageHint: string;
  disability: string;
  mental: string;
  kind: string;
  amount: string;
  amountHint: string;
  prior: string;
  priorHint: (flat: boolean) => string;
  previous: string;
  previousHint: string;
  toPay: string;
  stepsTitle: string;
  baseImposable: string;
  baseLiquidable: string;
  quotaIntegra: string;
  reducedScale: string;
  theoreticalBase: string;
  theoreticalQuota: string;
  averageRate: (rate: string) => string;
  quotaFromRate: (base: string, rate: string) => string;
  row: (from: string, quota: string, rest: string, rate: string, onRest: string) => string;
  coefficient: (c: string, group: string) => string;
  excess: string;
  quotaTributaria: string;
  bonus: (p: string) => string;
  bonusNone: string;
  noBonusRegion: string;
  noBase: string;
  effective: (rate: string, base: string) => string;
  zero: string;
  groupLine: (group: string) => string;
  invalid: Record<GiftInvalid, string>;
}

export const GIFT_CALC_COPY: Record<GiftLocale, GiftCalcCopy> = {
  ca: {
    title: (region) => `Calculadora de l'impost de donacions: ${region}`,
    intro: "Una donació d'una persona a una altra: escriu qui te la fa, la teva edat i què reps. El resultat mostra cada pas amb l'article de la llei.",
    noscript: "Sense JavaScript veuràs el primer exemple de la pàgina; les taules de sota tenen la tarifa, les reduccions i la bonificació.",
    relation: "Qui ets per a la persona que et fa la donació",
    age: "La teva edat el dia de la donació",
    ageHint: "En anys complerts. Fins als 20 anys, fills i néts són del grup I.",
    disability: "Grau de discapacitat reconegut",
    mental: "És una discapacitat intel·lectual o mental reconeguda de manera permanent",
    kind: "Què reps",
    amount: "Valor del que reps, en net",
    amountHint: "Els diners, o el valor fiscal del bé (el de referència del Cadastre si és un habitatge) menys els deutes que assumeixes.",
    prior: "El teu patrimoni abans de la donació",
    priorHint: (flat) => (flat ? "Aquí no canvia el coeficient, que només depèn del parentiu." : "Per al coeficient multiplicador. Al primer tram no canvia res."),
    previous: "Donacions anteriors de la mateixa persona en els tres anys anteriors",
    previousHint: "La seva base liquidable (sense reduccions, el que et va donar). Se sumen per calcular el tipus mitjà. 0 si no n'hi ha.",
    toPay: "Impost a pagar (estimació)",
    stepsTitle: "Càlcul pas a pas",
    baseImposable: "Base imposable (el que reps)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Quota íntegra segons la tarifa",
    reducedScale: "tarifa reduïda",
    theoreticalBase: "Base liquidable teòrica (amb les donacions anteriors)",
    theoreticalQuota: "Quota tributària teòrica",
    averageRate: (rate) => `Tipus mitjà: ${rate}`,
    quotaFromRate: (base, rate) => `Quota d'aquesta donació: ${base} × ${rate}`,
    row: (from, quota, rest, rate, onRest) => `Fins a ${from}: ${quota}; la resta, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Coeficient multiplicador: ${c} (${group})`,
    excess: "Menys l'excés de quota",
    quotaTributaria: "Quota tributària",
    bonus: (p) => `Bonificació (${p})`,
    bonusNone: "Bonificació: no n'hi ha en aquest cas",
    noBonusRegion: "Bonificació: Catalunya no en té per a les donacions",
    noBase: "Les reduccions cobreixen tota la base: no hi ha impost.",
    effective: (rate, base) => `Pagues el ${rate} dels ${base} que reps.`,
    zero: "No pagues res, però igualment has de presentar l'autoliquidació (model 651), encara que surti a zero.",
    groupLine: (group) => `Parentiu: ${group}.`,
    invalid: {
      amount: "Escriu el valor del que reps, en euros (més de 0).",
      age: "Escriu la teva edat en anys complerts (de 0 a 120).",
      prior: "Escriu el teu patrimoni anterior, en euros (0 si no en saps la xifra).",
      previous: "Escriu les donacions anteriors en euros (0 si no n'hi ha).",
    },
  },
  es: {
    title: (region) => `Calculadora del impuesto de donaciones: ${region}`,
    intro: "Una donación de una persona a otra: escribe quién te la hace, tu edad y qué recibes. El resultado muestra cada paso con el artículo de la ley.",
    noscript: "Sin JavaScript verás el primer ejemplo de la página; las tablas de abajo tienen la tarifa, las reducciones y la bonificación.",
    relation: "Quién eres para la persona que te dona",
    age: "Tu edad el día de la donación",
    ageHint: "En años cumplidos. Hasta los 20 años, hijos y nietos son del grupo I.",
    disability: "Grado de discapacidad reconocido",
    mental: "Es una discapacidad intelectual o mental reconocida de forma permanente",
    kind: "Qué recibes",
    amount: "Valor de lo que recibes, en neto",
    amountHint: "El dinero, o el valor fiscal del bien (el de referencia del Catastro si es una vivienda) menos las deudas que asumes.",
    prior: "Tu patrimonio antes de la donación",
    priorHint: (flat) => (flat ? "Aquí no cambia el coeficiente, que solo depende del parentesco." : "Para el coeficiente multiplicador. En el primer tramo no cambia nada."),
    previous: "Donaciones anteriores de la misma persona en los tres años anteriores",
    previousHint: "Su base liquidable (sin reducciones, lo que te dio). Se suman para calcular el tipo medio. 0 si no hay.",
    toPay: "Impuesto a pagar (estimación)",
    stepsTitle: "Cálculo paso a paso",
    baseImposable: "Base imponible (lo que recibes)",
    baseLiquidable: "Base liquidable",
    quotaIntegra: "Cuota íntegra según la tarifa",
    reducedScale: "tarifa reducida",
    theoreticalBase: "Base liquidable teórica (con las donaciones anteriores)",
    theoreticalQuota: "Cuota tributaria teórica",
    averageRate: (rate) => `Tipo medio: ${rate}`,
    quotaFromRate: (base, rate) => `Cuota de esta donación: ${base} × ${rate}`,
    row: (from, quota, rest, rate, onRest) => `Hasta ${from}: ${quota}; el resto, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Coeficiente multiplicador: ${c} (${group})`,
    excess: "Menos el exceso de cuota",
    quotaTributaria: "Cuota tributaria",
    bonus: (p) => `Bonificación (${p})`,
    bonusNone: "Bonificación: no hay en este caso",
    noBonusRegion: "Bonificación: Cataluña no tiene para las donaciones",
    noBase: "Las reducciones cubren toda la base: no hay impuesto.",
    effective: (rate, base) => `Pagas el ${rate} de los ${base} que recibes.`,
    zero: "No pagas nada, pero igualmente tienes que presentar la autoliquidación (modelo 651), aunque salga a cero.",
    groupLine: (group) => `Parentesco: ${group}.`,
    invalid: {
      amount: "Escribe el valor de lo que recibes, en euros (más de 0).",
      age: "Escribe tu edad en años cumplidos (de 0 a 120).",
      prior: "Escribe tu patrimonio anterior, en euros (0 si no sabes la cifra).",
      previous: "Escribe las donaciones anteriores en euros (0 si no hay).",
    },
  },
  en: {
    title: (region) => `Gift tax calculator: ${region}`,
    intro: "One gift from one person to another: enter who gives it to you, your age and what you receive. The result shows each step with its article of the law.",
    noscript: "Without JavaScript you see the page's first example; the tables below have the scale, the reductions and the rebate.",
    relation: "Who you are to the person giving you the gift",
    age: "Your age on the day of the gift",
    ageHint: "In completed years. Children and grandchildren are in group I up to the age of 20.",
    disability: "Officially recognised disability",
    mental: "It is an intellectual or mental disability, permanently recognised",
    kind: "What you receive",
    amount: "Value of what you receive, net",
    amountHint: "The money, or the asset's tax value (the Cadastre reference value for a home) less any debts you take on.",
    prior: "Your own wealth before the gift",
    priorHint: (flat) => (flat ? "The coefficient does not change here: it depends only on the relationship." : "For the multiplying coefficient. Nothing changes in the first bracket."),
    previous: "Earlier gifts from the same person in the previous three years",
    previousHint: "Their net taxable base (with no reductions, what you were given). They are added to work out the average rate. 0 if none.",
    toPay: "Tax to pay (estimate)",
    stepsTitle: "Step by step",
    baseImposable: "Taxable base (what you receive)",
    baseLiquidable: "Net taxable base (base liquidable)",
    quotaIntegra: "Gross tax from the scale (cuota íntegra)",
    reducedScale: "reduced scale",
    theoreticalBase: "Theoretical net base (with the earlier gifts)",
    theoreticalQuota: "Theoretical tax after the coefficient",
    averageRate: (rate) => `Average rate: ${rate}`,
    quotaFromRate: (base, rate) => `Tax on this gift: ${base} × ${rate}`,
    row: (from, quota, rest, rate, onRest) => `Up to ${from}: ${quota}; the rest, ${rest} × ${rate} = ${onRest}.`,
    coefficient: (c, group) => `Multiplying coefficient: ${c} (${group})`,
    excess: "Less the excess-tax adjustment",
    quotaTributaria: "Tax after the coefficient (cuota tributaria)",
    bonus: (p) => `Rebate (bonificación, ${p})`,
    bonusNone: "Rebate: none in this case",
    noBonusRegion: "Rebate: Catalonia has none for gifts",
    noBase: "The reductions cover the whole base: there is no tax.",
    effective: (rate, base) => `You pay ${rate} of the ${base} you receive.`,
    zero: "You pay nothing, but you still have to file the self-assessment (form 651), even when it comes to zero.",
    groupLine: (group) => `Kinship: ${group}.`,
    invalid: {
      amount: "Enter the value of what you receive, in euros (more than 0).",
      age: "Enter your age in completed years (0 to 120).",
      prior: "Enter your prior wealth, in euros (0 if you do not know it).",
      previous: "Enter the earlier gifts in euros (0 if none).",
    },
  },
};
