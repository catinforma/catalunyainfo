import type { IsdLocale } from "../copy";
import { ANDALUCIA_DATES, ANDALUCIA_QUOTE, ANDALUCIA_SOURCES } from "./andalucia";
import { MADRID_DATES, MADRID_QUOTE, MADRID_SOURCES } from "./madrid";
import { STATE_QUOTE, STATE_SOURCES, type Source } from "./state";
import type { Cite, RegionId } from "./types";
import { VALENCIA_DATES, VALENCIA_QUOTE, VALENCIA_SOURCES } from "./valencia";

/**
 * What each community's page quotes, section by section, with the source of
 * each quote, plus the dates it prints and its change log. Server-only (the
 * quotes are long): the calculator never imports this file.
 */

export interface QuoteRef {
  text: string;
  href: string;
  /** The article quoted; or, for an agency page, `label`. */
  cite?: Cite;
  label?: Record<IsdLocale, string>;
}

export interface RegionProfile {
  dates: { consolidatedFrom: string; scaleFrom: string; bonusFrom: string };
  sources: readonly Source[];
  /** The agency's page on the tax, and where form 650 is prepared. */
  info: Source;
  file: Source;
  quotes: { reductions: QuoteRef[]; scale: QuoteRef[]; coefficient: QuoteRef[]; bonus: QuoteRef[]; examples: QuoteRef[]; filing: QuoteRef[] };
  /** Which reductions are the community's and which the state's, in a few lines. */
  reductionsNote: Record<IsdLocale, string>;
  bonusNote: Record<IsdLocale, string>;
  changes: Record<IsdLocale, string[]>;
  limits: Record<IsdLocale, string[]>;
}

const S = STATE_SOURCES;
const stateFiling: QuoteRef[] = [
  { text: STATE_QUOTE.deadline, href: S.risd.url, cite: { law: "risd", art: "67.1.a" } },
  { text: STATE_QUOTE.extension, href: S.risd.url, cite: { law: "risd", art: "68.2" } },
  { text: STATE_QUOTE.residence, href: S.lofca.url, cite: { law: "lofca", art: "28.1" } },
  { text: STATE_QUOTE.connection, href: S.lofca.url, cite: { law: "lofca", art: "32.2.a" } },
];
const insuranceAccumulates: QuoteRef = { text: STATE_QUOTE.insuranceAccumulates, href: S.risd.url, cite: { law: "risd", art: "39.1" } };

const MS = MADRID_SOURCES;
const MQ = MADRID_QUOTE;
const madridPage = { ca: "Comunitat de Madrid, pàgina de l'impost de successions (en castellà)", es: "Comunidad de Madrid, página del Impuesto de Sucesiones", en: "Madrid region, inheritance tax page (in Spanish)" };

const AS = ANDALUCIA_SOURCES;
const AQ = ANDALUCIA_QUOTE;
const andaluciaGuide = { ca: "Agència Tributària d'Andalusia, guia de l'impost de successions (en castellà)", es: "Agencia Tributaria de Andalucía, guía del Impuesto sobre Sucesiones", en: "Andalusian Tax Agency, inheritance tax guide (in Spanish)" };

const VS = VALENCIA_SOURCES;
const VQ = VALENCIA_QUOTE;
const atvInstructions = { ca: "Generalitat Valenciana, instruccions del model 650 (legislació a 1-1-2017)", es: "Generalitat Valenciana, instrucciones del modelo 650 (legislación a 1-1-2017)", en: "Generalitat Valenciana, form 650 instructions (law as of 1 Jan 2017, in Spanish)" };
const atvPage = { ca: "Agència Tributària Valenciana, vull declarar una herència", es: "Agència Tributària Valenciana, quiero declarar una herencia", en: "Valencian Tax Agency, declaring an inheritance (in Spanish)" };

const noChange2027 = {
  ca: "A 19 de novembre de 2026 no s'havia publicat cap altre canvi per al 2027. Ho tornarem a mirar a partir de l'1 de gener de 2027, quan solen entrar en vigor les lleis de mesures fiscals.",
  es: "A 19 de noviembre de 2026 no se había publicado ningún otro cambio para 2027. Lo volveremos a mirar a partir del 1 de enero de 2027, cuando suelen entrar en vigor las leyes de medidas fiscales.",
  en: "As of 19 November 2026 no other change for 2027 had been published. We will check again from 1 January 2027, when fiscal-measures laws usually take effect.",
};

const commonLimits = {
  ca: [
    "Usdefruits i nua propietat, consolidació del domini.",
    "Reduccions per empresa familiar, participacions, explotacions agràries, patrimoni històric o cultural i transmissions successives en deu anys.",
    "Pòlisses d'assegurança contractades abans del 19 de gener de 1987, donacions anteriors que s'acumulen i deducció per doble imposició internacional.",
    "La valoració dels béns, l'aixovar domèstic i els deutes deduïbles: escriu el net que et toca.",
  ],
  es: [
    "Usufructos y nuda propiedad, consolidación del dominio.",
    "Reducciones por empresa familiar, participaciones, explotaciones agrarias, patrimonio histórico o cultural y transmisiones sucesivas en diez años.",
    "Pólizas de seguro contratadas antes del 19 de enero de 1987, donaciones anteriores que se acumulan y deducción por doble imposición internacional.",
    "La valoración de los bienes, el ajuar doméstico y las deudas deducibles: escribe el neto que te toca.",
  ],
  en: [
    "Usufruct and bare ownership, consolidation of ownership.",
    "Reductions for family businesses, shareholdings, farms, historic or cultural heritage and repeated transfers within ten years.",
    "Insurance policies taken out before 19 January 1987, earlier gifts that are added in, and the international double-taxation deduction.",
    "Valuing the assets, household goods and deductible debts: enter the net amount that is yours.",
  ],
};

export const REGION_PROFILES: Record<RegionId, RegionProfile> = {
  madrid: {
    dates: { consolidatedFrom: MADRID_DATES.consolidatedFrom, scaleFrom: MADRID_DATES.scaleFrom, bonusFrom: MADRID_DATES.bonusFrom },
    sources: [...Object.values(MS), S.lisd, S.risd, S.lofca],
    info: MS.agency,
    file: MS.office,
    quotes: {
      reductions: [
        { text: `${MQ.kinshipLead} ${MQ.groupI} ${MQ.groupII} ${MQ.groupIII} ${MQ.groupIV}`, href: MS.law.url, cite: { law: "madrid", art: "21.Uno.1" } },
        { text: MQ.disability, href: MS.law.url, cite: { law: "madrid", art: "21.Uno.2" } },
        { text: MQ.insurance, href: MS.law.url, cite: { law: "madrid", art: "21.Uno.3" } },
        insuranceAccumulates,
        { text: MQ.home, href: MS.law.url, cite: { law: "madrid", art: "21.Uno.4" } },
        { text: `${MQ.partners} ${MQ.minors}`, href: MS.law.url, cite: { law: "madrid", art: "26.1" } },
      ],
      scale: [{ text: MQ.scale, href: MS.law.url, cite: { law: "madrid", art: "23" } }],
      coefficient: [
        { text: MQ.coefficient, href: MS.law.url, cite: { law: "madrid", art: "24.1" } },
        { text: MQ.excess, href: MS.law.url, cite: { law: "madrid", art: "24.2" } },
      ],
      bonus: [
        { text: MQ.bonusGroupsIandII, href: MS.law.url, cite: { law: "madrid", art: "25.1" } },
        { text: MQ.bonusGroupIII, href: MS.law.url, cite: { law: "madrid", art: "25.1" } },
        { text: `${MQ.agencyGroupIII} ${MQ.agencyGroupIIIBefore}`, href: MS.agency.url, label: madridPage },
      ],
      examples: [{ text: MQ.agencyExample, href: MS.agency.url, label: madridPage }],
      filing: [{ text: `${MQ.agencyDeadline} ${MQ.agencyExtension}`, href: MS.agency.url, label: madridPage }, ...stateFiling],
    },
    reductionsNote: {
      ca: "Madrid regula totes les reduccions de l'article 20.2 de la llei estatal i les substitueix (art. 21.Uno): parentiu, discapacitat, assegurança de vida i habitatge habitual tenen imports propis. Les parelles de fet inscrites compten com a cònjuges i els menors en tutela o acolliment, com a descendents (art. 26).",
      es: "Madrid regula todas las reducciones del artículo 20.2 de la ley estatal y las sustituye (art. 21.Uno): parentesco, discapacidad, seguro de vida y vivienda habitual tienen importes propios. Las parejas de hecho inscritas cuentan como cónyuges y los menores en tutela o acogimiento, como descendientes (art. 26).",
      en: "Madrid sets every reduction of art. 20.2 of the state law itself and replaces the state's (art. 21.Uno): kinship, disability, life insurance and the habitual home have Madrid amounts. Registered partners count as spouses, and minors under guardianship or in foster care as descendants (art. 26).",
    },
    bonusNote: {
      ca: "Els grups I i II (fills, néts, cònjuge o parella inscrita, pares i avis) es bonifiquen el 99 % de la quota: paguen l'1 %. Per a les morts des de l'1 de juliol de 2025, tot el grup III (germans, nebots, oncles, també cunyats, sogres, gendres i joves) es bonifica el 50 %, però només sobre la part de la quota dels béns declarats a temps. El grup IV no té bonificació.",
      es: "Los grupos I y II (hijos, nietos, cónyuge o pareja inscrita, padres y abuelos) se bonifican el 99 % de la cuota: pagan el 1 %. Para los fallecimientos desde el 1 de julio de 2025, todo el grupo III (hermanos, sobrinos, tíos, también cuñados, suegros, yernos y nueras) se bonifica el 50 %, pero solo sobre la parte de la cuota de los bienes declarados a tiempo. El grupo IV no tiene bonificación.",
      en: "Groups I and II (children, grandchildren, spouse or registered partner, parents and grandparents) get 99% off the tax: they pay 1%. For deaths since 1 July 2025, the whole of group III (siblings, nephews, nieces, uncles, aunts and in-laws) gets 50% off, but only on the part of the tax for assets declared on time. Group IV gets no rebate.",
    },
    changes: {
      ca: [
        "L'1 de juliol de 2026 va entrar en vigor la Llei 3/2026, de suport a l'empresa familiar, que va reordenar l'article 21 i les reduccions per empresa: els imports per parentiu, discapacitat, assegurança de vida i habitatge habitual no van canviar.",
        "Des de l'1 de juliol de 2025 (Llei 2/2025) la bonificació del grup III és del 50 % per a tot el grup. Del 28 d'octubre de 2022 al 30 de juny de 2025 era del 25 % i només per a germans, nebots i oncles de sang.",
        "La bonificació del 99 % dels grups I i II s'aplica des de l'1 de gener de 2007, segons la Comunitat de Madrid.",
        noChange2027.ca,
      ],
      es: [
        "El 1 de julio de 2026 entró en vigor la Ley 3/2026, de Apoyo a la Empresa Familiar, que reordenó el artículo 21 y las reducciones por empresa: los importes por parentesco, discapacidad, seguro de vida y vivienda habitual no cambiaron.",
        "Desde el 1 de julio de 2025 (Ley 2/2025) la bonificación del grupo III es del 50 % para todo el grupo. Del 28 de octubre de 2022 al 30 de junio de 2025 era del 25 % y solo para hermanos, sobrinos y tíos de sangre.",
        "La bonificación del 99 % de los grupos I y II se aplica desde el 1 de enero de 2007, según la Comunidad de Madrid.",
        noChange2027.es,
      ],
      en: [
        "On 1 July 2026 Law 3/2026 on family businesses took effect: it reordered art. 21 and the business reductions; the kinship, disability, life insurance and habitual home amounts did not change.",
        "Since 1 July 2025 (Law 2/2025) the group III rebate is 50% for the whole group. From 28 October 2022 to 30 June 2025 it was 25%, and only for blood siblings, nephews, nieces, uncles and aunts.",
        "The 99% rebate for groups I and II has applied since 1 January 2007, according to the Madrid region.",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "Herències que no gestiona la Comunitat de Madrid (persona morta resident en una altra comunitat o a l'estranger, hereu no resident) i morts anteriors a l'1 de juliol de 2025 (grup III al 25 % o sense bonificació)."],
      es: [...commonLimits.es, "Herencias que no gestiona la Comunidad de Madrid (persona fallecida residente en otra comunidad o en el extranjero, heredero no residente) y fallecimientos anteriores al 1 de julio de 2025 (grupo III al 25 % o sin bonificación)."],
      en: [...commonLimits.en, "Estates the Madrid region does not handle (the deceased lived in another region or abroad, or the heir lives outside Spain) and deaths before 1 July 2025 (group III at 25% or no rebate)."],
    },
  },
  andalucia: {
    dates: { consolidatedFrom: ANDALUCIA_DATES.consolidatedFrom, scaleFrom: ANDALUCIA_DATES.scaleFrom, bonusFrom: ANDALUCIA_DATES.bonusFrom },
    sources: [...Object.values(AS), S.lisd, S.risd, S.lofca],
    info: AS.faq,
    file: AS.agency,
    quotes: {
      reductions: [
        { text: AQ.kinship, href: AS.law.url, cite: { law: "andalucia", art: "28.1" } },
        { text: STATE_QUOTE.groupIV, href: S.lisd.url, cite: { law: "lisd", art: "20.2.a" } },
        { text: AQ.disability, href: AS.law.url, cite: { law: "andalucia", art: "29" } },
        { text: AQ.insuranceGuide, href: AS.guide.url, label: andaluciaGuide },
        { text: STATE_QUOTE.insurance, href: S.lisd.url, cite: { law: "lisd", art: "20.2.b" } },
        insuranceAccumulates,
        { text: `${AQ.home} ${AQ.homeConditions}`, href: AS.law.url, cite: { law: "andalucia", art: "27" } },
        { text: AQ.homeCapGuide, href: AS.guide.url, label: andaluciaGuide },
        { text: `${AQ.partners} ${AQ.foster}`, href: AS.law.url, cite: { law: "andalucia", art: "26.1" } },
      ],
      scale: [{ text: AQ.scale, href: AS.law.url, cite: { law: "andalucia", art: "37" } }],
      coefficient: [
        { text: AQ.coefficient, href: AS.law.url, cite: { law: "andalucia", art: "38.1" } },
        { text: AQ.coefficientGuide, href: AS.guide.url, label: andaluciaGuide },
      ],
      bonus: [{ text: AQ.bonus, href: AS.law.url, cite: { law: "andalucia", art: "39" } }],
      examples: [],
      filing: stateFiling,
    },
    reductionsNote: {
      ca: "Andalusia millora la reducció estatal per parentiu (1.000.000 € per als grups I i II, 10.000 € per al grup III) i la de discapacitat (art. 28 i 29), i puja al 99 % la de l'habitatge habitual (art. 27) però manté el límit estatal de 122.606,47 € per hereu. L'assegurança de vida té la reducció estatal (100 % fins a 9.195,49 €). Les parelles de fet inscrites compten com a cònjuges (art. 26).",
      es: "Andalucía mejora la reducción estatal por parentesco (1.000.000 € para los grupos I y II, 10.000 € para el grupo III) y la de discapacidad (arts. 28 y 29), y sube al 99 % la de vivienda habitual (art. 27) pero mantiene el límite estatal de 122.606,47 € por heredero. El seguro de vida tiene la reducción estatal (100 % hasta 9.195,49 €). Las parejas de hecho inscritas cuentan como cónyuges (art. 26).",
      en: "Andalusia improves the state's kinship reduction (€1,000,000 for groups I and II, €10,000 for group III) and the disability one (arts. 28 and 29), and raises the habitual home reduction to 99% (art. 27) while keeping the state limit of €122,606.47 per heir. Life insurance has the state reduction (100% up to €9,195.49). Registered partners count as spouses (art. 26).",
    },
    bonusNote: {
      ca: "Els grups I i II es bonifiquen el 99 % del que quedi de quota (art. 39), i com que abans ja han restat 1.000.000 €, la majoria no paguen res. Els grups III i IV no tenen bonificació, i el seu coeficient és d'1,5 i d'1,9 sigui quin sigui el seu patrimoni.",
      es: "Los grupos I y II se bonifican el 99 % de lo que quede de cuota (art. 39), y como antes ya han restado 1.000.000 €, la mayoría no paga nada. Los grupos III y IV no tienen bonificación, y su coeficiente es de 1,5 y de 1,9 sea cual sea su patrimonio.",
      en: "Groups I and II get 99% off whatever tax is left (art. 39) and, having already deducted €1,000,000, most pay nothing. Groups III and IV get no rebate, and their coefficients are 1.5 and 1.9 whatever their wealth.",
    },
    changes: {
      ca: [
        "Des de l'1 de gener de 2022 s'aplica la Llei 5/2021, que va substituir el Decret legislatiu 1/2018: reducció d'1.000.000 € per als grups I i II, tarifa del 7 % al 26 % i coeficients que ja no depenen del patrimoni previ.",
        "La bonificació del 99 % dels grups I i II ve de l'11 d'abril de 2019 (art. 33 bis del Decret legislatiu 1/2018, segons la guia de l'Agència Tributària d'Andalusia); la Llei 5/2021 la manté (art. 39).",
        "La Llei 8/2025, del pressupost del 2026, només va canviar els terminis de les donacions i de les transmissions patrimonials (arts. 68 i 69), no les herències.",
        noChange2027.ca,
      ],
      es: [
        "Desde el 1 de enero de 2022 se aplica la Ley 5/2021, que sustituyó al Decreto Legislativo 1/2018: reducción de 1.000.000 € para los grupos I y II, tarifa del 7 % al 26 % y coeficientes que ya no dependen del patrimonio previo.",
        "La bonificación del 99 % de los grupos I y II viene del 11 de abril de 2019 (art. 33 bis del Decreto Legislativo 1/2018, según la guía de la Agencia Tributaria de Andalucía); la Ley 5/2021 la mantiene (art. 39).",
        "La Ley 8/2025, del presupuesto de 2026, solo cambió los plazos de las donaciones y de las transmisiones patrimoniales (arts. 68 y 69), no las herencias.",
        noChange2027.es,
      ],
      en: [
        "Since 1 January 2022 Law 5/2021 applies; it replaced Legislative Decree 1/2018: a €1,000,000 reduction for groups I and II, a 7% to 26% scale and coefficients that no longer depend on prior wealth.",
        "The 99% rebate for groups I and II dates from 11 April 2019 (art. 33 bis of Legislative Decree 1/2018, according to the Andalusian Tax Agency's guide); Law 5/2021 keeps it (art. 39).",
        "Law 8/2025, the 2026 budget, only changed the deadlines for gifts and property transfers (arts. 68 and 69), not inheritances.",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "Herències que no gestiona la Junta d'Andalusia (persona morta resident en una altra comunitat o a l'estranger, hereu no resident) i morts anteriors a l'1 de gener de 2022."],
      es: [...commonLimits.es, "Herencias que no gestiona la Junta de Andalucía (persona fallecida residente en otra comunidad o en el extranjero, heredero no residente) y fallecimientos anteriores al 1 de enero de 2022."],
      en: [...commonLimits.en, "Estates the Junta de Andalucía does not handle (the deceased lived in another region or abroad, or the heir lives outside Spain) and deaths before 1 January 2022."],
    },
  },
  valencia: {
    dates: { consolidatedFrom: VALENCIA_DATES.consolidatedFrom, scaleFrom: VALENCIA_DATES.scaleFrom, bonusFrom: VALENCIA_DATES.bonusFrom },
    sources: [...Object.values(VS), S.lisd, S.risd, S.lofca],
    info: VS.agency,
    file: VS.model650,
    quotes: {
      reductions: [
        { text: `${VQ.lead} ${VQ.groupI} ${VQ.groupII}`, href: VS.law.url, cite: { law: "valencia", art: "10.1.a" } },
        { text: `${VQ.atvStateReduction} ${VQ.atvGroupIII}`, href: VS.instructions.url, label: atvInstructions },
        { text: `${STATE_QUOTE.groupIII} ${STATE_QUOTE.groupIV}`, href: S.lisd.url, cite: { law: "lisd", art: "20.2.a" } },
        { text: STATE_QUOTE.improved, href: S.lofca.url, cite: { law: "lofca", art: "48.1.a" } },
        { text: VQ.disability, href: VS.law.url, cite: { law: "valencia", art: "10.1.b" } },
        { text: STATE_QUOTE.insurance, href: S.lisd.url, cite: { law: "lisd", art: "20.2.b" } },
        insuranceAccumulates,
        { text: VQ.home, href: VS.law.url, cite: { law: "valencia", art: "10.1.c" } },
        { text: VQ.partners, href: VS.law.url, cite: { law: "valencia", art: "12 quáter" } },
      ],
      scale: [{ text: VQ.scale, href: VS.law.url, cite: { law: "valencia", art: "11" } }],
      coefficient: [
        { text: VQ.coefficient, href: VS.law.url, cite: { law: "valencia", art: "12" } },
        { text: STATE_QUOTE.excess, href: S.lisd.url, cite: { law: "lisd", art: "22.2" } },
        { text: VQ.atvExcess, href: VS.instructions.url, label: atvInstructions },
      ],
      bonus: [
        { text: `${VQ.bonusGroupsIandII} ${VQ.bonusDisability}`, href: VS.law.url, cite: { law: "valencia", art: "12 bis.1" } },
        { text: `${VQ.bonusGroupIIIFrom} […] ${VQ.bonusGroupIII}`, href: VS.ley5_2025.url, label: { ca: "Llei valenciana 5/2025, disposició transitòria segona", es: "Ley valenciana 5/2025, disposición transitoria segunda", en: "Valencian Law 5/2025, second transitional provision" } },
        { text: `${VQ.bonusGroupIIINextFrom} […] ${VQ.bonusGroupIIINext}`, href: VS.ley5_2026.url, label: { ca: "Llei valenciana 5/2026, art. 25 (disposició final quarta de la Llei 5/2025)", es: "Ley valenciana 5/2026, art. 25 (disposición final cuarta de la Ley 5/2025)", en: "Valencian Law 5/2026, art. 25 (fourth final provision of Law 5/2025)" } },
        { text: VQ.declared, href: VS.law.url, cite: { law: "valencia", art: "12 bis.3" } },
      ],
      examples: [],
      filing: [
        { text: VQ.deadline, href: VS.law.url, cite: { law: "valencia", art: "12 ter" } },
        { text: VQ.atvExtension, href: VS.agency.url, label: atvPage },
        ...stateFiling.slice(1),
      ],
    },
    reductionsNote: {
      ca: "La llei valenciana fixa les reduccions dels grups I i II, la de discapacitat i la de l'habitatge habitual (art. 10.1), que substitueixen les estatals. No en té per al grup III ni per a l'assegurança de vida, i per això s'apliquen les de l'Estat: 7.993,46 € per al grup III i el 100 % de l'assegurança fins a 9.195,49 €, com indiquen les instruccions del model 650 de l'ATV. El grup IV no té reducció. Les parelles de fet inscrites compten com a cònjuges (art. 12 quàter).",
      es: "La ley valenciana fija las reducciones de los grupos I y II, la de discapacidad y la de vivienda habitual (art. 10.1), que sustituyen a las estatales. No tiene para el grupo III ni para el seguro de vida, y por eso se aplican las del Estado: 7.993,46 € para el grupo III y el 100 % del seguro hasta 9.195,49 €, como indican las instrucciones del modelo 650 de la ATV. El grupo IV no tiene reducción. Las parejas de hecho inscritas cuentan como cónyuges (art. 12 quáter).",
      en: "Valencian law sets the reductions for groups I and II, disability and the habitual home (art. 10.1), which replace the state's. It has none for group III or life insurance, so the state's apply: €7,993.46 for group III and 100% of the insurance up to €9,195.49, as the ATV's form 650 instructions say. Group IV gets no reduction. Registered partners count as spouses (art. 12 quáter).",
    },
    bonusNote: {
      ca: "Els grups I i II es bonifiquen el 99 % de la quota. També el 99 %, sigui quin sigui el parentiu, qui té una discapacitat del 65 % o més, o intel·lectual o mental del 33 % o més. Per a les morts des de l'1 de juny de 2026, els germans, nebots i oncles de sang (grup III) es bonifiquen el 25 %, i des de l'1 de juny de 2027, el 50 %; els parents per afinitat i el grup IV, res. Totes les bonificacions s'apliquen només a la quota dels béns declarats a temps.",
      es: "Los grupos I y II se bonifican el 99 % de la cuota. También el 99 %, sea cual sea el parentesco, quien tiene una discapacidad del 65 % o más, o intelectual o mental del 33 % o más. Para los fallecimientos desde el 1 de junio de 2026, los hermanos, sobrinos y tíos de sangre (grupo III) se bonifican el 25 %, y desde el 1 de junio de 2027, el 50 %; los parientes por afinidad y el grupo IV, nada. Todas las bonificaciones se aplican solo a la cuota de los bienes declarados a tiempo.",
      en: "Groups I and II get 99% off the tax. So does anyone, whatever the relationship, with a disability of 65% or more, or an intellectual or mental one of 33% or more. For deaths since 1 June 2026, blood siblings, nephews, nieces, uncles and aunts (group III) get 25% off, and from 1 June 2027, 50%; in-laws and group IV, nothing. Every rebate applies only to the tax on assets declared on time.",
    },
    changes: {
      ca: [
        "L'11 d'agost de 2026 va entrar en vigor la Llei 5/2026, de mesures fiscals, que va redactar de nou els articles 10 i 12 bis amb els mateixos imports.",
        "Des de l'1 de juny de 2026 els germans, nebots i oncles de sang tenen una bonificació del 25 % (Llei 5/2025, disposició transitòria segona); abans no en tenien.",
        "Des de l'1 de juny de 2027 aquesta bonificació serà del 50 % (Llei 5/2025, disposició final quarta, en la redacció de la Llei 5/2026). La calculadora aplica el 25 %, el de les morts d'avui.",
        "La tarifa i els coeficients actuals s'apliquen des de l'1 de gener de 2024 (Llei 7/2023), i la bonificació del 99 % dels grups I i II, a les morts des del 28 de maig de 2023 (Llei 6/2023).",
        noChange2027.ca,
      ],
      es: [
        "El 11 de agosto de 2026 entró en vigor la Ley 5/2026, de medidas fiscales, que redactó de nuevo los artículos 10 y 12 bis con los mismos importes.",
        "Desde el 1 de junio de 2026 los hermanos, sobrinos y tíos de sangre tienen una bonificación del 25 % (Ley 5/2025, disposición transitoria segunda); antes no tenían ninguna.",
        "Desde el 1 de junio de 2027 esa bonificación será del 50 % (Ley 5/2025, disposición final cuarta, en la redacción de la Ley 5/2026). La calculadora aplica el 25 %, el de los fallecimientos de hoy.",
        "La tarifa y los coeficientes actuales se aplican desde el 1 de enero de 2024 (Ley 7/2023), y la bonificación del 99 % de los grupos I y II, a los fallecimientos desde el 28 de mayo de 2023 (Ley 6/2023).",
        noChange2027.es,
      ],
      en: [
        "On 11 August 2026 Law 5/2026 on fiscal measures took effect, rewording arts. 10 and 12 bis with the same amounts.",
        "Since 1 June 2026 blood siblings, nephews, nieces, uncles and aunts get a 25% rebate (Law 5/2025, second transitional provision); before, they had none.",
        "From 1 June 2027 that rebate will be 50% (Law 5/2025, fourth final provision, as worded by Law 5/2026). The calculator applies 25%, the rule for deaths today.",
        "The current scale and coefficients apply since 1 January 2024 (Law 7/2023), and the 99% rebate for groups I and II to deaths since 28 May 2023 (Law 6/2023).",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "Herències que no gestiona l'ATV (persona morta resident en una altra comunitat o a l'estranger, hereu no resident) i morts anteriors a l'1 de juny de 2026 (el grup III no tenia bonificació) o posteriors al 31 de maig de 2027 (50 %)."],
      es: [...commonLimits.es, "Herencias que no gestiona la ATV (persona fallecida residente en otra comunidad o en el extranjero, heredero no residente) y fallecimientos anteriores al 1 de junio de 2026 (el grupo III no tenía bonificación) o posteriores al 31 de mayo de 2027 (50 %)."],
      en: [...commonLimits.en, "Estates the ATV does not handle (the deceased lived in another region or abroad, or the heir lives outside Spain) and deaths before 1 June 2026 (group III had no rebate) or after 31 May 2027 (50%)."],
    },
  },
};
