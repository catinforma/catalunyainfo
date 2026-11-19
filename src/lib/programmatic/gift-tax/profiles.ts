import type { GiftLocale } from "./copy";
import { ANDALUCIA_GIFT_DATES, ANDALUCIA_GIFT_QUOTE, ANDALUCIA_GIFT_SOURCES } from "./regions/andalucia";
import { CATALONIA_GIFT_DATES, CATALONIA_GIFT_QUOTE, CATALONIA_GIFT_SOURCES } from "./regions/catalonia";
import { MADRID_GIFT_DATES, MADRID_GIFT_QUOTE, MADRID_GIFT_SOURCES } from "./regions/madrid";
import { GIFT_STATE_QUOTE, GIFT_STATE_SOURCES, type GiftSource } from "./regions/state";
import type { GiftCite, GiftRegionId } from "./regions/types";
import { VALENCIA_GIFT_DATES, VALENCIA_GIFT_QUOTE, VALENCIA_GIFT_SOURCES } from "./regions/valencia";

/**
 * What each community's gift tax page quotes, section by section, with the
 * source of each quote, plus the formal requirements, the dates it prints,
 * its change log and its limits. Server-only (the quotes are long): the
 * calculator never imports this file.
 */

export interface GiftQuoteRef {
  text: string;
  href: string;
  /** Catalan sources are quoted in Catalan; the rest in Spanish. */
  lang: "ca" | "es";
  cite?: GiftCite;
  label?: Record<GiftLocale, string>;
}

export interface GiftProfile {
  dates: { consolidatedFrom: string; scaleFrom: string };
  sources: readonly GiftSource[];
  /** The agency's page on the tax, and where form 651 is prepared. */
  info: GiftSource;
  file: GiftSource;
  quotes: { reductions: GiftQuoteRef[]; scale: GiftQuoteRef[]; coefficient: GiftQuoteRef[]; bonus: GiftQuoteRef[]; accumulation: GiftQuoteRef[]; examples: GiftQuoteRef[]; filing: GiftQuoteRef[] };
  /** The formal requirements, one line each (public document, cash, deadline, where). */
  requirements: Record<GiftLocale, string[]>;
  reductionsNote: Record<GiftLocale, string>;
  bonusNote: Record<GiftLocale, string>;
  changes: Record<GiftLocale, string[]>;
  limits: Record<GiftLocale, string[]>;
}

const S = GIFT_STATE_SOURCES;
const SQ = GIFT_STATE_QUOTE;
const es = (text: string, href: string, cite?: GiftCite, label?: Record<GiftLocale, string>): GiftQuoteRef => ({ text, href, lang: "es", cite, label });
const ca = (text: string, href: string, cite?: GiftCite, label?: Record<GiftLocale, string>): GiftQuoteRef => ({ text, href, lang: "ca", cite, label });

const stateBase: GiftQuoteRef[] = [es(SQ.noReductions, S.lisd.url, { law: "lisd", art: "20.5" })];
const accumulation: GiftQuoteRef[] = [es(SQ.accumulation, S.lisd.url, { law: "lisd", art: "30.1" }), es(SQ.theoreticalBase, S.lisd.url, { law: "lisd", art: "30.3" }), es(SQ.averageRate, S.risd.url, { law: "risd", art: "46.b" })];
const whereFiled: GiftQuoteRef[] = [es(SQ.realEstate, S.lofca.url, { law: "lofca", art: "32.2.b" }), es(SQ.otherAssets, S.lofca.url, { law: "lofca", art: "32.2.c" }), es(SQ.residence, S.lofca.url, { law: "lofca", art: "28.1" })];

const noChange2027 = {
  ca: "A 19 de novembre de 2026 no s'havia publicat cap altre canvi per al 2027. Ho tornarem a mirar a partir de l'1 de gener de 2027, quan solen entrar en vigor les lleis de mesures fiscals.",
  es: "A 19 de noviembre de 2026 no se había publicado ningún otro cambio para 2027. Lo volveremos a mirar a partir del 1 de enero de 2027, cuando suelen entrar en vigor las leyes de medidas fiscales.",
  en: "As of 19 November 2026 no other change for 2027 had been published. We will check again from 1 January 2027, when fiscal-measures laws usually take effect.",
};

const commonLimits = {
  ca: [
    "Nua propietat i usdefruit (es paga un tipus mitjà sobre el valor del ple domini), i la consolidació del domini quan s'extingeix l'usdefruit.",
    "Reduccions per donació d'empresa, negoci o participacions, explotacions agràries, finques forestals, patrimoni cultural o patrimonis protegits.",
    "La valoració dels béns (el valor de referència del Cadastre en els habitatges) i els deutes que es poden restar: escriu el valor net.",
    "L'acumulació d'aquesta donació a l'herència de la mateixa persona si mor dins dels quatre anys següents (Llei 29/1987, art. 30.2).",
  ],
  es: [
    "Nuda propiedad y usufructo (se paga un tipo medio sobre el valor del pleno dominio), y la consolidación del dominio cuando se extingue el usufructo.",
    "Reducciones por donación de empresa, negocio o participaciones, explotaciones agrarias, fincas forestales, patrimonio cultural o patrimonios protegidos.",
    "La valoración de los bienes (el valor de referencia del Catastro en las viviendas) y las deudas que se pueden restar: escribe el valor neto.",
    "La acumulación de esta donación a la herencia de la misma persona si fallece dentro de los cuatro años siguientes (Ley 29/1987, art. 30.2).",
  ],
  en: [
    "Bare ownership and usufruct (an average rate on the full-ownership value is paid), and the consolidation of ownership when the usufruct ends.",
    "Reductions for gifts of a business or shares, farms, forest land, cultural heritage or protected assets for disabled people.",
    "Valuing the assets (the Cadastre reference value for homes) and the debts that can be deducted: enter the net value.",
    "Adding this gift to the same person's estate if they die within the following four years (Law 29/1987, art. 30.2).",
  ],
};

const CS = CATALONIA_GIFT_SOURCES;
const CQ = CATALONIA_GIFT_QUOTE;
const atcExamples = { ca: "Agència Tributària de Catalunya, exemples de donacions", es: "Agència Tributària de Catalunya, ejemplos de donaciones (en catalán)", en: "Catalan Tax Agency, worked gift examples (in Catalan)" };
const atcPage = { ca: "Agència Tributària de Catalunya, termini de les donacions", es: "Agència Tributària de Catalunya, plazo de las donaciones (en catalán)", en: "Catalan Tax Agency, gift deadline (in Catalan)" };
const atcForm = { ca: "Agència Tributària de Catalunya, declarar una donació", es: "Agència Tributària de Catalunya, declarar una donación (en catalán)", en: "Catalan Tax Agency, declaring a gift (in Catalan)" };
const atcReductions = { ca: "Agència Tributària de Catalunya, reduccions de les donacions", es: "Agència Tributària de Catalunya, reducciones de las donaciones (en catalán)", en: "Catalan Tax Agency, gift reductions (in Catalan)" };

const MS = MADRID_GIFT_SOURCES;
const MQ = MADRID_GIFT_QUOTE;
const madridPage = { ca: "Comunitat de Madrid, pàgina de l'impost de donacions (en castellà)", es: "Comunidad de Madrid, página del Impuesto sobre Donaciones", en: "Madrid region, gift tax page (in Spanish)" };

const AS = ANDALUCIA_GIFT_SOURCES;
const AQ = ANDALUCIA_GIFT_QUOTE;
const andaluciaGuide = { ca: "Agència Tributària d'Andalusia, guia de l'impost de donacions (en castellà)", es: "Agencia Tributaria de Andalucía, guía del Impuesto sobre Donaciones", en: "Andalusian Tax Agency, gift tax guide (in Spanish)" };
const andaluciaBefore = { ca: "Llei 5/2021, art. 40, redacció del 2022 al 2025", es: "Ley 5/2021, art. 40, redacción de 2022 a 2025", en: "Law 5/2021, art. 40, as worded from 2022 to 2025" };

const VS = VALENCIA_GIFT_SOURCES;
const VQ = VALENCIA_GIFT_QUOTE;
const atvPage = { ca: "Agència Tributària Valenciana, vull declarar una donació", es: "Agència Tributària Valenciana, quiero declarar una donación", en: "Valencian Tax Agency, declaring a gift (in Spanish)" };
const valenciaNext = { ca: "Llei valenciana 5/2026, art. 25 (disposició final quarta de la Llei 5/2025)", es: "Ley valenciana 5/2026, art. 25 (disposición final cuarta de la Ley 5/2025)", en: "Valencian Law 5/2026, art. 25 (fourth final provision of Law 5/2025)" };

export const GIFT_PROFILES: Record<GiftRegionId, GiftProfile> = {
  catalonia: {
    dates: { consolidatedFrom: CATALONIA_GIFT_DATES.consolidatedFrom, scaleFrom: CATALONIA_GIFT_DATES.scaleFrom },
    sources: [...Object.values(CS), S.lisd, S.risd, S.lofca],
    info: CS.atcExamples,
    file: CS.atcFile,
    quotes: {
      reductions: [
        ca(CQ.reductionsLead, CS.code.url, { law: "catalonia", art: "632-1.1" }),
        ca(CQ.home, CS.code.url, { law: "catalonia", art: "632-20.1" }),
        ca(`${CQ.homeDeed} […] ${CQ.homeCash}`, CS.code.url, { law: "catalonia", art: "632-21.1.a" }),
        ca(`${CQ.homeAge} ${CQ.homeIncome} ${CQ.homeSixMonths}`, CS.code.url, { law: "catalonia", art: "632-21.1.b-d" }),
        ca(CQ.atcSixMonths, CS.atcReductions.url, undefined, atcReductions),
        ca(`${CQ.partners} ${CQ.stepchildren}`, CS.code.url, { law: "catalonia", art: "634-1 i 634-2" }),
      ],
      scale: [
        ca(CQ.scale, CS.code.url, { law: "catalonia", art: "633-1" }),
        ca(`${CQ.reducedScale} […] ${CQ.reducedScaleDeed} ${CQ.reducedScaleMonth}`, CS.code.url, { law: "catalonia", art: "633-2" }),
      ],
      coefficient: [ca(CQ.coefficient, CS.code.url, { law: "catalonia", art: "633-3" }), ca(CQ.excess, CS.atcScale.url, undefined, { ca: "Agència Tributària de Catalunya, nota sobre la reducció per excés de quota", es: "Agència Tributària de Catalunya, nota sobre el exceso de cuota (en catalán)", en: "Catalan Tax Agency, note on the excess-tax adjustment (in Catalan)" })],
      bonus: [],
      accumulation: [...accumulation, ca(CQ.atcExample11, CS.atcExamples.url, undefined, atcExamples)],
      examples: [ca(`${CQ.atcExample1} […] ${CQ.atcExample1Result}`, CS.atcExamples.url, undefined, atcExamples), ca(CQ.atcExample2, CS.atcExamples.url, undefined, atcExamples)],
      filing: [ca(CQ.deadline, CS.regulation.url, { law: "catReg", art: "10.b" }), ca(CQ.atcDeadline, CS.atcDeadline.url, undefined, atcPage), ca(CQ.atcForm, CS.atcFile.url, undefined, atcForm), ...whereFiled],
    },
    requirements: {
      ca: [
        "**Escriptura pública** davant notari (o sentència judicial) per a la tarifa reduïda dels grups I i II. Si són diners, l'escriptura s'ha de signar dins del mes següent a l'entrega; l'ATC compta la data de la transferència. Fora d'aquest mes o en document privat, tarifa general.",
        "**Primer habitatge:** a més de l'escriptura, ha de dir que els diners o l'habitatge són per al primer habitatge habitual del donatari.",
        "**Termini:** un mes des del dia de la donació, sense pròrroga (Reglament de l'impost, art. 10.b).",
        "**Model 651,** un per donatari, amb el formulari en línia de l'ATC (identificació digital).",
      ],
      es: [
        "**Escritura pública** ante notario (o sentencia judicial) para la tarifa reducida de los grupos I y II. Si es dinero, la escritura se tiene que firmar dentro del mes siguiente a la entrega; la ATC cuenta la fecha de la transferencia. Fuera de ese mes o en documento privado, tarifa general.",
        "**Primera vivienda:** además de la escritura, tiene que decir que el dinero o la vivienda son para la primera vivienda habitual del donatario.",
        "**Plazo:** un mes desde el día de la donación, sin prórroga (Reglamento del impuesto, art. 10.b).",
        "**Modelo 651,** uno por donatario, con el formulario en línea de la ATC (identificación digital).",
      ],
      en: [
        "**A public deed** before a notary (or a court ruling) for groups I and II's reduced scale. For money, the deed must be signed within a month of the handover; the ATC counts the transfer date. Outside that month or in a private document, the general scale applies.",
        "**First home:** besides the deed, it must say the money or the home is for the donee's first habitual home.",
        "**Deadline:** one month from the day of the gift, with no extension (tax regulation, art. 10.b).",
        "**Form 651,** one per donee, through the ATC's online form (digital ID).",
      ],
    },
    reductionsNote: {
      ca: "Catalunya no té reducció per parentiu en les donacions: la base liquidable és tot el que reps, llevat de reduccions concretes. La més habitual és la del primer habitatge habitual d'un descendent (arts. 632-20 i 632-21). També n'hi ha per a diners per crear o comprar la primera empresa (95 %, fins a 200.000 €), per a empreses i participacions familiars, finques forestals i explotacions agràries, que la calculadora no aplica. Les parelles estables compten com a cònjuges i els fills del cònjuge o la parella, com a fills (arts. 634-1 i 634-2).",
      es: "Cataluña no tiene reducción por parentesco en las donaciones: la base liquidable es todo lo que recibes, salvo reducciones concretas. La más habitual es la de la primera vivienda habitual de un descendiente (arts. 632-20 y 632-21). También las hay para dinero para crear o comprar la primera empresa (95 %, hasta 200.000 €), para empresas y participaciones familiares, fincas forestales y explotaciones agrarias, que la calculadora no aplica. Las parejas estables cuentan como cónyuges y los hijos del cónyuge o la pareja, como hijos (arts. 634-1 y 634-2).",
      en: "Catalonia has no kinship reduction on gifts: the net taxable base is all you receive, save for specific reductions. The most common is for a descendant's first habitual home (arts. 632-20 and 632-21). There are others for money to set up or buy a first business (95%, up to €200,000), family businesses and shares, forest land and farms, which the calculator does not apply. Stable partners count as spouses and a spouse's or partner's children as children (arts. 634-1 and 634-2).",
    },
    bonusNote: {
      ca: "Catalunya no bonifica la quota de les donacions: la bonificació de l'art. 633-4 és només per a les herències. El que abarateix les donacions de pares a fills és la tarifa reduïda del 5 %, el 7 % i el 9 % amb escriptura pública.",
      es: "Cataluña no bonifica la cuota de las donaciones: la bonificación del art. 633-4 es solo para las herencias. Lo que abarata las donaciones de padres a hijos es la tarifa reducida del 5 %, el 7 % y el 9 % con escritura pública.",
      en: "Catalonia gives no rebate on gifts: the art. 633-4 rebate is for inheritances only. What makes gifts from parents to children cheaper is the reduced 5%, 7% and 9% scale with a public deed.",
    },
    changes: {
      ca: [
        "Des del 27 de juny de 2025 (Decret llei 5/2025), qui rep diners per al primer habitatge té sis mesos per comprar-lo; abans en tenia tres. El mateix decret va afegir una reducció per a víctimes de violència masclista (habitatge habitual, fins a 100.000 €).",
        "La tarifa general i la reduïda s'apliquen des de l'1 de gener de 2010, i els coeficients actuals des de l'1 de maig de 2020, segons l'ATC.",
        "Des del 15 de març de 2024 les normes són al llibre sisè del Codi tributari (Decret legislatiu 1/2024), text refós que va substituir la Llei 19/2010. La Llei 11/2026 no va canviar res del que fa servir la calculadora.",
        noChange2027.ca,
      ],
      es: [
        "Desde el 27 de junio de 2025 (Decreto ley 5/2025), quien recibe dinero para la primera vivienda tiene seis meses para comprarla; antes tenía tres. El mismo decreto añadió una reducción para víctimas de violencia machista (vivienda habitual, hasta 100.000 €).",
        "La tarifa general y la reducida se aplican desde el 1 de enero de 2010, y los coeficientes actuales desde el 1 de mayo de 2020, según la ATC.",
        "Desde el 15 de marzo de 2024 las normas están en el libro sexto del Código tributario (Decreto legislativo 1/2024), texto refundido que sustituyó a la Ley 19/2010. La Ley 11/2026 no cambió nada de lo que usa la calculadora.",
        noChange2027.es,
      ],
      en: [
        "Since 27 June 2025 (Decree-law 5/2025), someone given money for a first home has six months to buy it; before, three. The same decree added a reduction for victims of gender violence (habitual home, up to €100,000).",
        "The general and reduced scales apply since 1 January 2010, and today's coefficients since 1 May 2020, according to the ATC.",
        "Since 15 March 2024 the rules are in book six of the Catalan Tax Code (Legislative Decree 1/2024), a recast text that replaced Law 19/2010. Law 11/2026 changed nothing the calculator uses.",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "La reducció per a víctimes de violència masclista, la de diners per a la primera empresa i la condonació d'un préstec per comprar l'habitatge. Donacions que no gestiona l'ATC (immobles fora de Catalunya, donatari que viu en una altra comunitat o a l'estranger)."],
      es: [...commonLimits.es, "La reducción para víctimas de violencia machista, la de dinero para la primera empresa y la condonación de un préstamo para comprar la vivienda. Donaciones que no gestiona la ATC (inmuebles fuera de Cataluña, donatario que vive en otra comunidad o en el extranjero)."],
      en: [...commonLimits.en, "The reduction for victims of gender violence, the one for money for a first business, and forgiving a loan used to buy the home. Gifts the ATC does not handle (property outside Catalonia, a donee living in another region or abroad)."],
    },
  },
  madrid: {
    dates: { consolidatedFrom: MADRID_GIFT_DATES.consolidatedFrom, scaleFrom: MADRID_GIFT_DATES.scaleFrom },
    sources: [...Object.values(MS), S.lisd, S.risd, S.lofca],
    info: MS.agency,
    file: MS.office,
    quotes: {
      reductions: [...stateBase, es(MQ.cash, MS.law.url, { law: "madrid", art: "22 bis.1" }), es(MQ.cashPurpose, MS.law.url, { law: "madrid", art: "22 bis.2" }), es(MQ.cashDocument, MS.law.url, { law: "madrid", art: "22 bis.3" }), es(MQ.partners, MS.law.url, { law: "madrid", art: "26.1" })],
      scale: [es(MQ.scale, MS.law.url, { law: "madrid", art: "23" })],
      coefficient: [es(MQ.coefficient, MS.law.url, { law: "madrid", art: "24.1" }), es(MQ.excess, MS.law.url, { law: "madrid", art: "24.2" })],
      bonus: [
        es(`${MQ.smallGift} […] ${MQ.smallGiftNoFiling}`, MS.law.url, { law: "madrid", art: "25.2.a" }),
        es(`${MQ.bonusGroupsIandII} ${MQ.bonusGroupIII}`, MS.law.url, { law: "madrid", art: "25.2.b" }),
        es(`${MQ.fundsOrigin} ${MQ.publicDocument}`, MS.law.url, { law: "madrid", art: "25.2.b" }),
        es(MQ.lateDeed, MS.law.url, { law: "madrid", art: "25.2.b" }),
        es(MQ.agencyGroupIIIBefore, MS.agency.url, undefined, madridPage),
      ],
      accumulation: [...accumulation, es(`${MQ.agencyAccumulation} […] ${MQ.agencyAccumulationRate} […] ${MQ.agencyAccumulationResult}`, MS.agency.url, undefined, madridPage)],
      examples: [es(MQ.agencyExample, MS.agency.url, undefined, madridPage)],
      filing: [es(MQ.agencyDeadline, MS.agency.url, undefined, madridPage), es(SQ.deadline, S.risd.url, { law: "risd", art: "67.1.b" }), es(MQ.agencyTwoDonors, MS.agency.url, undefined, madridPage), es(MQ.agencyCompetence, MS.agency.url, undefined, madridPage), ...whereFiled],
    },
    requirements: {
      ca: [
        "**Document públic** (escriptura davant notari) quan les donacions de la mateixa persona en tres anys passen de 10.000 €; fins aquí n'hi ha prou amb un document privat. Si s'eleva a públic un document privat, s'ha de fer abans que acabi el termini de declaració.",
        "**Diners:** la bonificació exigeix que l'origen dels fons estigui justificat i consti al document. La Comunitat de Madrid demana el justificant bancari de la transferència.",
        "**Fins a 1.000 €** en tres anys de la mateixa persona: bonificació del 100 % i cap autoliquidació (llevat de béns registrables).",
        "**Termini:** 30 dies hàbils des de l'endemà de la donació (sense dissabtes, diumenges ni festius), sense pròrroga.",
        "**Model 651,** un per donatari i per donant, a l'Oficina Virtual Tributària o amb cita.",
      ],
      es: [
        "**Documento público** (escritura ante notario) cuando las donaciones de la misma persona en tres años pasan de 10.000 €; hasta ahí basta un documento privado. Si se eleva a público un documento privado, tiene que hacerse antes de que acabe el plazo de declaración.",
        "**Dinero:** la bonificación exige que el origen de los fondos esté justificado y conste en el documento. La Comunidad de Madrid pide el justificante bancario de la transferencia.",
        "**Hasta 1.000 €** en tres años de la misma persona: bonificación del 100 % y ninguna autoliquidación (salvo bienes registrables).",
        "**Plazo:** 30 días hábiles desde el día siguiente a la donación (sin sábados, domingos ni festivos), sin prórroga.",
        "**Modelo 651,** uno por donatario y por donante, en la Oficina Virtual Tributaria o con cita.",
      ],
      en: [
        "**A public document** (a deed before a notary) when the gifts from the same person in three years exceed €10,000; up to that, a private document is enough. A private document raised to a public one must be so before the filing period ends.",
        "**Money:** the rebate needs the origin of the funds justified and stated in the document. The Madrid region asks for the bank transfer receipt.",
        "**Up to €1,000** in three years from the same person: a 100% rebate and no self-assessment (except registrable assets).",
        "**Deadline:** 30 working days from the day after the gift (no Saturdays, Sundays or holidays), with no extension.",
        "**Form 651,** one per donee and per donor, through the Oficina Virtual Tributaria or by appointment.",
      ],
    },
    reductionsNote: {
      ca: "Madrid no té reducció per parentiu en les donacions (la de l'art. 21 és per a herències): la base liquidable és el que reps (Llei 29/1987, art. 20.5). Té la reducció del 100 % dels diners que els grups I i II o un germà destinen a l'habitatge habitual, a un negoci o a participacions en la constitució o l'ampliació de capital d'una societat (art. 22 bis), i la del 99 % per a empreses i participacions familiars donades des de l'1 de juliol de 2026 (art. 22), que la calculadora no aplica.",
      es: "Madrid no tiene reducción por parentesco en las donaciones (la del art. 21 es para herencias): la base liquidable es lo que recibes (Ley 29/1987, art. 20.5). Tiene la reducción del 100 % del dinero que los grupos I y II o un hermano destinan a la vivienda habitual, a un negocio o a participaciones en la constitución o ampliación de capital de una sociedad (art. 22 bis), y la del 99 % para empresas y participaciones familiares donadas desde el 1 de julio de 2026 (art. 22), que la calculadora no aplica.",
      en: "Madrid has no kinship reduction on gifts (art. 21's is for inheritances): the net taxable base is what you receive (Law 29/1987, art. 20.5). It has a 100% reduction for money groups I and II or a sibling spend on the habitual home, a business or shares issued when a company is set up or raises capital (art. 22 bis), and a 99% one for family businesses and shares given since 1 July 2026 (art. 22), which the calculator does not apply.",
    },
    bonusNote: {
      ca: "Els grups I i II (fills, néts, cònjuge o parella inscrita, pares i avis) es bonifiquen el 99 % de la quota: paguen l'1 %. Des de l'1 de juliol de 2025, tot el grup III (germans, nebots, oncles, també cunyats, sogres, gendres i joves) es bonifica el 50 %. Les dues, sobre la part de la quota dels béns declarats a temps i amb els requisits de document i d'origen dels diners. Fins a 1.000 € de la mateixa persona en tres anys, el 100 % per a qualsevol parentiu.",
      es: "Los grupos I y II (hijos, nietos, cónyuge o pareja inscrita, padres y abuelos) se bonifican el 99 % de la cuota: pagan el 1 %. Desde el 1 de julio de 2025, todo el grupo III (hermanos, sobrinos, tíos, también cuñados, suegros, yernos y nueras) se bonifica el 50 %. Las dos, sobre la parte de la cuota de los bienes declarados a tiempo y con los requisitos de documento y de origen del dinero. Hasta 1.000 € de la misma persona en tres años, el 100 % para cualquier parentesco.",
      en: "Groups I and II (children, grandchildren, spouse or registered partner, parents and grandparents) get 99% off the tax: they pay 1%. Since 1 July 2025, the whole of group III (siblings, nephews, nieces, uncles, aunts and in-laws) gets 50% off. Both apply to the part of the tax for assets declared on time and with the document and origin-of-money requirements. Up to €1,000 from the same person in three years, 100% off for any relationship.",
    },
    changes: {
      ca: [
        "Des de l'1 de juliol de 2025 (Llei 2/2025): bonificació del 50 % per a tot el grup III; el document públic només cal per sobre de 10.000 € en tres anys; i les donacions de fins a 1.000 € no paguen ni es declaren. Del 28 d'octubre de 2022 al 30 de juny de 2025 el grup III tenia el 25 %, només germans, oncles i nebots de sang, i la bonificació sempre exigia document públic.",
        "La reducció del 100 % dels diners per a l'habitatge (art. 22 bis) existeix des de l'1 de gener de 2019 (Llei 6/2018); des de l'1 de juliol de 2025 admet document privat fins a 10.000 €.",
        "L'1 de juliol de 2026 va entrar en vigor la Llei 3/2026, de suport a l'empresa familiar: reduccions del 99 % per a donacions d'empreses i participacions. No canvia les donacions de diners ni d'habitatges.",
        noChange2027.ca,
      ],
      es: [
        "Desde el 1 de julio de 2025 (Ley 2/2025): bonificación del 50 % para todo el grupo III; el documento público solo hace falta por encima de 10.000 € en tres años; y las donaciones de hasta 1.000 € no pagan ni se declaran. Del 28 de octubre de 2022 al 30 de junio de 2025 el grupo III tenía el 25 %, solo hermanos, tíos y sobrinos de sangre, y la bonificación siempre exigía documento público.",
        "La reducción del 100 % del dinero para la vivienda (art. 22 bis) existe desde el 1 de enero de 2019 (Ley 6/2018); desde el 1 de julio de 2025 admite documento privado hasta 10.000 €.",
        "El 1 de julio de 2026 entró en vigor la Ley 3/2026, de Apoyo a la Empresa Familiar: reducciones del 99 % para donaciones de empresas y participaciones. No cambia las donaciones de dinero ni de viviendas.",
        noChange2027.es,
      ],
      en: [
        "Since 1 July 2025 (Law 2/2025): a 50% rebate for the whole of group III; a public document only above €10,000 in three years; and gifts up to €1,000 neither pay nor are declared. From 28 October 2022 to 30 June 2025 group III had 25%, only blood siblings, uncles and nephews, and the rebate always needed a public document.",
        "The 100% reduction for money for the home (art. 22 bis) exists since 1 January 2019 (Law 6/2018); since 1 July 2025 it accepts a private document up to €10,000.",
        "On 1 July 2026 Law 3/2026 on family businesses took effect: 99% reductions for gifts of businesses and shares. It does not change gifts of money or homes.",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "La divisió en dues autoliquidacions quan les donacions en document privat travessen els 10.000 €, i els diners per a un negoci o per a participacions d'una societat (art. 22 bis.2.b i c). Donacions que no gestiona la Comunitat de Madrid (immobles d'altres comunitats, donatari que viu fora de Madrid o a l'estranger)."],
      es: [...commonLimits.es, "La división en dos autoliquidaciones cuando las donaciones en documento privado cruzan los 10.000 €, y el dinero para un negocio o para participaciones de una sociedad (art. 22 bis.2.b y c). Donaciones que no gestiona la Comunidad de Madrid (inmuebles de otras comunidades, donatario que vive fuera de Madrid o en el extranjero)."],
      en: [...commonLimits.en, "The split into two self-assessments when private-document gifts cross €10,000, and money for a business or for shares in a company (art. 22 bis.2.b and c). Gifts the Madrid region does not handle (property in other regions, a donee living outside Madrid or abroad)."],
    },
  },
  andalucia: {
    dates: { consolidatedFrom: ANDALUCIA_GIFT_DATES.consolidatedFrom, scaleFrom: ANDALUCIA_GIFT_DATES.scaleFrom },
    sources: [...Object.values(AS), S.lisd, S.risd, S.lofca],
    info: AS.faq,
    file: AS.agency,
    quotes: {
      reductions: [
        ...stateBase,
        es(`${AQ.cashHome} ${AQ.cashHomeWho} ${AQ.cashHomePrior} ${AQ.cashHomeRest} ${AQ.homeCap}`, AS.law.url, { law: "andalucia", art: "32" }),
        es(`${AQ.homeGift} […] ${AQ.homeGiftDeed}`, AS.law.url, { law: "andalucia", art: "33" }),
        es(AQ.partners, AS.law.url, { law: "andalucia", art: "26.1" }),
      ],
      scale: [es(AQ.scale, AS.law.url, { law: "andalucia", art: "37" })],
      coefficient: [es(AQ.coefficient, AS.law.url, { law: "andalucia", art: "38.1" })],
      bonus: [
        es(`${AQ.bonus} ${AQ.bonusDeclared} ${AQ.bonusDocument} […] ${AQ.bonusCash}`, AS.law.url, { law: "andalucia", art: "40" }),
        es(AQ.bonusBefore2026, AS.law.url, undefined, andaluciaBefore),
        es(AQ.guideBonusFrom, AS.guide.url, undefined, andaluciaGuide),
      ],
      accumulation: [...accumulation, es(`${AQ.guideAccumulation} […] ${AQ.guideAccumulationPay}`, AS.guide.url, undefined, andaluciaGuide)],
      examples: [es(`${AQ.guideExample} […] ${AQ.guideExampleResult}`, AS.guide.url, undefined, andaluciaGuide)],
      filing: [es(AQ.deadline, AS.law.url, { law: "andalucia", art: "68.1" }), es(AQ.guideDeadline, AS.guide.url, undefined, andaluciaGuide), ...whereFiled],
    },
    requirements: {
      ca: [
        "**Document públic** amb l'entrega del bé alhora quan les donacions de la mateixa persona en tres anys passen de 5.000 € (des de l'1 de gener de 2026; abans, sempre).",
        "**Diners per sobre de 5.000 €:** l'escriptura s'ha de signar dins del mes següent a l'entrega i ha de dir d'on surten els diners, que s'ha de poder justificar. Si són entregues a terminis, una sola escriptura amb totes.",
        "**Habitatge:** els diners s'han de fer servir sencers per comprar l'habitatge a Andalusia dins del termini de l'autoliquidació, amb escriptura de compra que esmenti la donació; si et donen l'habitatge, l'escriptura ha de dir que serà el teu habitatge habitual.",
        "**Termini:** dos mesos des de l'endemà de la donació, sense pròrroga (art. 68.1).",
        "**Model 651,** un per donatari, a l'Agència Tributària d'Andalusia.",
      ],
      es: [
        "**Documento público** con la entrega simultánea del bien cuando las donaciones de la misma persona en tres años pasan de 5.000 € (desde el 1 de enero de 2026; antes, siempre).",
        "**Dinero por encima de 5.000 €:** la escritura se tiene que firmar dentro del mes siguiente a la entrega y tiene que decir de dónde sale el dinero, que se tiene que poder justificar. Si son entregas a plazos, una sola escritura con todas.",
        "**Vivienda:** el dinero se tiene que usar entero para comprar la vivienda en Andalucía dentro del plazo de la autoliquidación, con escritura de compra que mencione la donación; si te donan la vivienda, la escritura tiene que decir que será tu vivienda habitual.",
        "**Plazo:** dos meses desde el día siguiente a la donación, sin prórroga (art. 68.1).",
        "**Modelo 651,** uno por donatario, en la Agencia Tributaria de Andalucía.",
      ],
      en: [
        "**A public document** with the asset handed over at the same time when the gifts from the same person in three years exceed €5,000 (since 1 January 2026; before, always).",
        "**Money above €5,000:** the deed must be signed within a month of the handover and say where the money comes from, which must be provable. For instalments, one single deed listing them all.",
        "**Home:** all the money must buy the home in Andalusia within the self-assessment period, with a purchase deed that mentions the gift; if you are given the home, the deed must say it will be your habitual home.",
        "**Deadline:** two months from the day after the gift, with no extension (art. 68.1).",
        "**Form 651,** one per donee, with the Andalusian Tax Agency.",
      ],
    },
    reductionsNote: {
      ca: "Andalusia no té reducció per parentiu en les donacions: la base liquidable és el que reps (Llei 29/1987, art. 20.5). La reducció habitual és la del 99 % dels diners de pares o avis per comprar l'habitatge habitual (art. 32) o de l'habitatge que et donen (art. 33), sobre una base de fins a 150.000 € (250.000 € amb discapacitat), per a menors de 35 anys o amb discapacitat (també víctimes de violència domèstica o del terrorisme) amb un patrimoni previ de fins a 402.678,11 €. També n'hi ha per a diners per a un negoci (99 %, fins a 1.000.000 €), empreses i participacions, que la calculadora no aplica. Les parelles de fet inscrites compten com a cònjuges (art. 26).",
      es: "Andalucía no tiene reducción por parentesco en las donaciones: la base liquidable es lo que recibes (Ley 29/1987, art. 20.5). La reducción habitual es la del 99 % del dinero de padres o abuelos para comprar la vivienda habitual (art. 32) o de la vivienda que te donan (art. 33), sobre una base de hasta 150.000 € (250.000 € con discapacidad), para menores de 35 años o con discapacidad (también víctimas de violencia doméstica o del terrorismo) con un patrimonio previo de hasta 402.678,11 €. También las hay para dinero para un negocio (99 %, hasta 1.000.000 €), empresas y participaciones, que la calculadora no aplica. Las parejas de hecho inscritas cuentan como cónyuges (art. 26).",
      en: "Andalusia has no kinship reduction on gifts: the net taxable base is what you receive (Law 29/1987, art. 20.5). The usual reduction is 99% of money from parents or grandparents to buy the habitual home (art. 32) or of the home they give you (art. 33), on a base of up to €150,000 (€250,000 with a disability), for donees under 35 or disabled (also victims of domestic violence or terrorism) with prior wealth up to €402,678.11. There are others for money for a business (99%, up to €1,000,000), businesses and shares, which the calculator does not apply. Registered partners count as spouses (art. 26).",
    },
    bonusNote: {
      ca: "Els grups I i II (fills, néts, cònjuge o parella inscrita, pares i avis) es bonifiquen el 99 % de la quota (art. 40), sobre la part dels béns declarats espontàniament, amb els requisits de document per sobre de 5.000 €. Els grups III i IV no tenen bonificació, i el seu coeficient és d'1,5 i 1,9 sigui quin sigui el patrimoni.",
      es: "Los grupos I y II (hijos, nietos, cónyuge o pareja inscrita, padres y abuelos) se bonifican el 99 % de la cuota (art. 40), sobre la parte de los bienes declarados espontáneamente, con los requisitos de documento por encima de 5.000 €. Los grupos III y IV no tienen bonificación, y su coeficiente es de 1,5 y 1,9 sea cual sea el patrimonio.",
      en: "Groups I and II (children, grandchildren, spouse or registered partner, parents and grandparents) get 99% off the tax (art. 40), on the part for assets declared spontaneously, with the document requirements above €5,000. Groups III and IV get no rebate, and their coefficients are 1.5 and 1.9 whatever their wealth.",
    },
    changes: {
      ca: [
        "Des de l'1 de gener de 2026 (Llei 8/2025, del pressupost): la bonificació del 99 % només exigeix document públic per sobre de 5.000 € de la mateixa persona en tres anys, i l'origen dels diners, per sobre de 5.000 €. Del 2022 al 2025 el document públic era sempre obligatori.",
        "La bonificació del 99 % dels grups I i II en les donacions s'aplica des de l'11 d'abril de 2019, segons la guia de l'Agència Tributària d'Andalusia; la tarifa del 7 % al 26 % i els coeficients per grup, des de l'1 de gener de 2022 (Llei 5/2021).",
        "El termini de dos mesos s'aplica des de l'1 de gener de 2022 (art. 68.1).",
        noChange2027.ca,
      ],
      es: [
        "Desde el 1 de enero de 2026 (Ley 8/2025, del presupuesto): la bonificación del 99 % solo exige documento público por encima de 5.000 € de la misma persona en tres años, y el origen del dinero, por encima de 5.000 €. De 2022 a 2025 el documento público era siempre obligatorio.",
        "La bonificación del 99 % de los grupos I y II en las donaciones se aplica desde el 11 de abril de 2019, según la guía de la Agencia Tributaria de Andalucía; la tarifa del 7 % al 26 % y los coeficientes por grupo, desde el 1 de enero de 2022 (Ley 5/2021).",
        "El plazo de dos meses se aplica desde el 1 de enero de 2022 (art. 68.1).",
        noChange2027.es,
      ],
      en: [
        "Since 1 January 2026 (Law 8/2025, the budget): the 99% rebate only needs a public document above €5,000 from the same person in three years, and the origin of the money above €5,000. From 2022 to 2025 the public document was always compulsory.",
        "The 99% rebate for groups I and II on gifts applies since 11 April 2019, according to the Andalusian Tax Agency's guide; the 7% to 26% scale and coefficients by group since 1 January 2022 (Law 5/2021).",
        "The two-month deadline applies since 1 January 2022 (art. 68.1).",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "Les víctimes de violència domèstica o del terrorisme (també tenen la reducció per habitatge sense límit d'edat), els diners per a un negoci i el còmput dels 5.000 €, que no compta els béns que necessiten escriptura per ser vàlids. Donacions que no gestiona la Junta d'Andalusia (immobles d'altres comunitats, donatari que viu fora d'Andalusia o a l'estranger)."],
      es: [...commonLimits.es, "Las víctimas de violencia doméstica o del terrorismo (también tienen la reducción por vivienda sin límite de edad), el dinero para un negocio y el cómputo de los 5.000 €, que no cuenta los bienes que necesitan escritura para ser válidos. Donaciones que no gestiona la Junta de Andalucía (inmuebles de otras comunidades, donatario que vive fuera de Andalucía o en el extranjero)."],
      en: [...commonLimits.en, "Victims of domestic violence or terrorism (they also get the home reduction with no age limit), money for a business, and the €5,000 count, which leaves out assets that need a deed to be valid. Gifts the Junta de Andalucía does not handle (property in other regions, a donee living outside Andalusia or abroad)."],
    },
  },
  valencia: {
    dates: { consolidatedFrom: VALENCIA_GIFT_DATES.consolidatedFrom, scaleFrom: VALENCIA_GIFT_DATES.scaleFrom },
    sources: [...Object.values(VS), S.lisd, S.risd, S.lofca],
    info: VS.agency,
    file: VS.model651,
    quotes: {
      reductions: [
        es(`${VQ.kinshipLead} ${VQ.kinship} ${VQ.kinshipFiveYears}`, VS.law.url, { law: "valencia", art: "10 bis.2.a" }),
        es(VQ.disability, VS.law.url, { law: "valencia", art: "10 bis.2.b" }),
        es(`${VQ.reductionsDocument} ${VQ.smallDigital} ${VQ.reductionsFunds}`, VS.law.url, { law: "valencia", art: "10 bis.2" }),
        es(VQ.partners, VS.law.url, { law: "valencia", art: "12 quáter" }),
      ],
      scale: [es(VQ.scale, VS.law.url, { law: "valencia", art: "11" })],
      coefficient: [es(VQ.coefficient, VS.law.url, { law: "valencia", art: "12" }), es(SQ.excess, S.lisd.url, { law: "lisd", art: "22.2" })],
      bonus: [
        es(`${VQ.bonusLead} […] ${VQ.bonusDirect} ${VQ.bonusDisability}`, VS.law.url, { law: "valencia", art: "12 bis.1" }),
        es(`${VQ.bonusGroupIIILead} […] ${VQ.bonusGroupIII}`, VS.law.url, { law: "valencia", art: "12 bis.2" }),
        es(`${VQ.bonusDocument} […] ${VQ.bonusFunds}`, VS.law.url, { law: "valencia", art: "12 bis.4" }),
        es(`${VQ.bonusGroupIIINextFrom} […] ${VQ.bonusGroupIIINext}`, VS.ley5_2026.url, undefined, valenciaNext),
      ],
      accumulation,
      examples: [],
      filing: [es(VQ.deadline, VS.law.url, { law: "valencia", art: "12 ter" }), es(`${VQ.atvDeadline} ${VQ.atvNoExtension}`, VS.agency.url, undefined, atvPage), es(VQ.atvForm, VS.agency.url, undefined, atvPage), ...whereFiled],
    },
    requirements: {
      ca: [
        "**Document públic** (o formalitzar-la així dins del termini de declaració) per a la reducció per parentiu, la de discapacitat i les bonificacions. Fins a 4.000 € en diners o un vehicle en tres anys, valen documents signats digitalment amb un servei de confiança qualificat.",
        "**Diners:** l'origen dels fons s'ha de justificar i constar al document, amb el mitjà de l'entrega (la transferència, per exemple).",
        "**Termini:** un mes des del dia de la donació, sense pròrroga (art. 12 ter; l'ATV: la pròrroga és només per a herències).",
        "**Model 651,** un per donatari, amb el programa d'ajuda de l'ATV.",
      ],
      es: [
        "**Documento público** (o formalizarla así dentro del plazo de declaración) para la reducción por parentesco, la de discapacidad y las bonificaciones. Hasta 4.000 € en dinero o un vehículo en tres años, valen documentos firmados digitalmente con un servicio de confianza cualificado.",
        "**Dinero:** el origen de los fondos se tiene que justificar y constar en el documento, con el medio de la entrega (la transferencia, por ejemplo).",
        "**Plazo:** un mes desde el día de la donación, sin prórroga (art. 12 ter; la ATV: la prórroga es solo para herencias).",
        "**Modelo 651,** uno por donatario, con el programa de ayuda de la ATV.",
      ],
      en: [
        "**A public document** (or the gift put in one within the filing period) for the kinship reduction, the disability one and the rebates. Up to €4,000 in money or a vehicle in three years, documents signed digitally through a qualified trust service will do.",
        "**Money:** the origin of the funds must be justified and stated in the document, with how it is handed over (a bank transfer, for instance).",
        "**Deadline:** one month from the day of the gift, with no extension (art. 12 ter; the ATV: extensions are only for inheritances).",
        "**Form 651,** one per donee, with the ATV's help program.",
      ],
    },
    reductionsNote: {
      ca: "La Comunitat Valenciana sí que té reducció per parentiu en les donacions (art. 10 bis.2.a): 100.000 € per a fills i néts de 21 anys o més, el cònjuge, els pares i els avis, i fins a 156.000 € per a fills i néts més joves. Per discapacitat, 240.000 € (65 %, o intel·lectual o mental del 33 %) per a qualsevol donatari, o 120.000 € (33 %) per a la família directa, que se sumen a la de parentiu. Els límits compten totes les donacions de la mateixa persona dels cinc anys anteriors. No hi ha reducció per al grup III ni el IV. Les parelles de fet inscrites compten com a cònjuges (art. 12 quàter).",
      es: "La Comunidad Valenciana sí tiene reducción por parentesco en las donaciones (art. 10 bis.2.a): 100.000 € para hijos y nietos de 21 años o más, el cónyuge, los padres y los abuelos, y hasta 156.000 € para hijos y nietos más jóvenes. Por discapacidad, 240.000 € (65 %, o intelectual o mental del 33 %) para cualquier donatario, o 120.000 € (33 %) para la familia directa, que se suman a la de parentesco. Los límites cuentan todas las donaciones de la misma persona de los cinco años anteriores. No hay reducción para el grupo III ni el IV. Las parejas de hecho inscritas cuentan como cónyuges (art. 12 quáter).",
      en: "The Valencia region does have a kinship reduction on gifts (art. 10 bis.2.a): €100,000 for children and grandchildren aged 21 or over, the spouse, parents and grandparents, and up to €156,000 for younger children and grandchildren. For disability, €240,000 (65%, or an intellectual or mental one of 33%) for any donee, or €120,000 (33%) for close family, on top of the kinship one. The limits count every gift from the same person in the five years before. There is none for groups III and IV. Registered partners count as spouses (art. 12 quáter).",
    },
    bonusNote: {
      ca: "El cònjuge, els pares, els fills, els néts i els avis es bonifiquen el 99 % de la quota. També el 99 %, sigui qui sigui el donant, qui té una discapacitat del 65 % o més, o intel·lectual o mental del 33 % o més. Des de l'1 de juny de 2026, els germans, nebots i oncles de sang es bonifiquen el 25 %, i des de l'1 de juny de 2027, el 50 %; els parents per afinitat i el grup IV, res. Totes sobre la part de la quota dels béns declarats a temps i amb el document i l'origen dels diners.",
      es: "El cónyuge, los padres, los hijos, los nietos y los abuelos se bonifican el 99 % de la cuota. También el 99 %, sea quien sea el donante, quien tiene una discapacidad del 65 % o más, o intelectual o mental del 33 % o más. Desde el 1 de junio de 2026, los hermanos, sobrinos y tíos de sangre se bonifican el 25 %, y desde el 1 de junio de 2027, el 50 %; los parientes por afinidad y el grupo IV, nada. Todas sobre la parte de la cuota de los bienes declarados a tiempo y con el documento y el origen del dinero.",
      en: "Spouses, parents, children, grandchildren and grandparents get 99% off the tax. So does anyone, whoever the donor, with a disability of 65% or more, or an intellectual or mental one of 33% or more. Since 1 June 2026 blood siblings, nephews, nieces, uncles and aunts get 25% off, and from 1 June 2027, 50%; in-laws and group IV, nothing. All on the part of the tax for assets declared on time and with the document and the origin of the money.",
    },
    changes: {
      ca: [
        "L'11 d'agost de 2026 va entrar en vigor la Llei 5/2026, que va redactar de nou els arts. 10 bis i 12 bis amb els mateixos imports i va permetre documents signats digitalment fins a 4.000 € en diners o vehicles.",
        "Des de l'1 de juny de 2026 els germans, nebots i oncles de sang tenen una bonificació del 25 %, i des de l'1 de juny de 2027 serà del 50 % (Llei 5/2025). La calculadora aplica el 25 %, el de les donacions d'avui.",
        "Per a les donacions des del 28 de maig de 2023 (Llei 6/2023) hi ha la bonificació del 99 % i la reducció de 100.000 € sense límit de patrimoni previ, també per al cònjuge i per a néts i avis. Fins al 27 de maig de 2023, la reducció exigia un patrimoni previ de fins a 600.000 € i les donacions no tenien bonificació.",
        "La tarifa i els coeficients actuals s'apliquen des de l'1 de gener de 2024 (Llei 7/2023), i el termini d'un mes, des del 6 d'agost de 2013.",
        noChange2027.ca,
      ],
      es: [
        "El 11 de agosto de 2026 entró en vigor la Ley 5/2026, que redactó de nuevo los arts. 10 bis y 12 bis con los mismos importes y permitió documentos firmados digitalmente hasta 4.000 € en dinero o vehículos.",
        "Desde el 1 de junio de 2026 los hermanos, sobrinos y tíos de sangre tienen una bonificación del 25 %, y desde el 1 de junio de 2027 será del 50 % (Ley 5/2025). La calculadora aplica el 25 %, el de las donaciones de hoy.",
        "Para las donaciones desde el 28 de mayo de 2023 (Ley 6/2023) hay bonificación del 99 % y reducción de 100.000 € sin límite de patrimonio previo, también para el cónyuge y para nietos y abuelos. Hasta el 27 de mayo de 2023, la reducción exigía un patrimonio previo de hasta 600.000 € y las donaciones no tenían bonificación.",
        "La tarifa y los coeficientes actuales se aplican desde el 1 de enero de 2024 (Ley 7/2023), y el plazo de un mes, desde el 6 de agosto de 2013.",
        noChange2027.es,
      ],
      en: [
        "On 11 August 2026 Law 5/2026 took effect, rewording arts. 10 bis and 12 bis with the same amounts and allowing digitally signed documents up to €4,000 in money or vehicles.",
        "Since 1 June 2026 blood siblings, nephews, nieces, uncles and aunts get a 25% rebate, and from 1 June 2027 it will be 50% (Law 5/2025). The calculator applies 25%, the rule for gifts today.",
        "For gifts since 28 May 2023 (Law 6/2023) there is the 99% rebate and the €100,000 reduction with no prior-wealth limit, also for spouses, grandchildren and grandparents. Until 27 May 2023, the reduction needed prior wealth of €600,000 or less and gifts had no rebate.",
        "Today's scale and coefficients apply since 1 January 2024 (Law 7/2023), and the one-month deadline since 6 August 2013.",
        noChange2027.en,
      ],
    },
    limits: {
      ca: [...commonLimits.ca, "Els besnéts i besavis (la llei valenciana només anomena néts i avis), la reducció per a dones víctimes de violència de gènere per comprar l'habitatge, i les reduccions ja gastades en donacions dels cinc anys anteriors. Donacions que no gestiona l'ATV (immobles d'altres comunitats, donatari que viu fora o a l'estranger) i les fetes a partir de l'1 de juny de 2027 (grup III al 50 %)."],
      es: [...commonLimits.es, "Los bisnietos y bisabuelos (la ley valenciana solo nombra nietos y abuelos), la reducción para mujeres víctimas de violencia de género para comprar la vivienda, y las reducciones ya gastadas en donaciones de los cinco años anteriores. Donaciones que no gestiona la ATV (inmuebles de otras comunidades, donatario que vive fuera o en el extranjero) y las hechas a partir del 1 de junio de 2027 (grupo III al 50 %)."],
      en: [...commonLimits.en, "Great-grandchildren and great-grandparents (Valencian law names only grandchildren and grandparents), the reduction for women victims of gender violence buying a home, and reductions already used on gifts in the previous five years. Gifts the ATV does not handle (property in other regions, a donee living elsewhere or abroad) and gifts from 1 June 2027 (group III at 50%)."],
    },
  },
};
