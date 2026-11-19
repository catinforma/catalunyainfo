import { ARANCEL_REBATE, BOE_TEXTS, NOTARY_COPY_PER_FOLIO, NOTARY_SCALE, QUOTE as HT_QUOTE, REGISTRY_CAP, REGISTRY_SCALE, type FeeSlice } from "@/lib/programmatic/home-purchase-tax/rules";

/**
 * The regulated fees of buying a home: the notary's and the Land Registry's
 * official scales (aranceles), read in the BOE's consolidated texts on
 * RULES_AS_OF (curl + grep, every quote below checked word for word against
 * the downloaded text). Data only: the calculator imports it.
 *
 * The two scales (número 2.1 of each arancel), the 5 % rebaja and the
 * registry's cap are not typed again here: they live in
 * home-purchase-tax/rules.ts, which printed them first, and are re-exported.
 *
 * - Notaries: Real Decreto 1426/1989 (BOE-A-1989-28111, consolidated
 *   17/11/2011): número 2.1 (scale; 0,3 per mille up to 6.010.121,04 €,
 *   free above; the 5 % rebaja of RDL 8/2010 DA 8ª.Uno.1 written into the
 *   arancel by RD 1612/2011), 2.2 (25 % off loans; 50 % off second and later
 *   transfers of protected housing, letra e), 2.3 (VPO benefits of other
 *   laws kept), número 4 (copias autorizadas 3,005061 € a folio, half from
 *   the 12th; copias simples 0,601012 €), número 7 (matrix folios from the
 *   5th, 3,005061 € per written side), normas generales primera, segunda,
 *   sexta, novena, décima.
 *   RDL 6/2000 (BOE-A-2000-11836) art. 35.1: the notary may discount up to
 *   10 % (optional: the calculator never applies it).
 * - Registrars: Real Decreto 1427/1989 (BOE-A-1989-28112, consolidated
 *   17/11/2011): número 1 (presentación 6,010121 €), 2.1 (scale, minimum
 *   24,040484 €, maximum 2.181,673939 €, 5 % rebaja), 2.4.b (50 % off second
 *   and later transfers of protected housing), 2.5, número 3.3 and 4.1.f
 *   (extras not computed), normas generales primera, segunda (pro indiviso:
 *   the value split by shares, never above 1 % of it; spouses in community
 *   property: one base), sexta, octava.
 *   RDL 6/2000 art. 36.1: a further 5 % off "la compraventa de viviendas",
 *   applied on the amount left after the arancel's own rebaja.
 * - Protected housing (VPO), first transfer: Ley 41/1980 (BOE-A-1980-15958)
 *   art. 8 as worded by RDL 6/2000 art. 37: 50 % off matrix, first copy and
 *   registration; a home of up to 90 m² of useful floor area, the buyer's
 *   only home and permanent residence, pays a fixed amount "por todos los
 *   conceptos", in euros since the DGRN Instruction of 22 May 2002
 *   (BOE-A-2002-12290) arts. 5 and 11: 60,047119 € (notary), 24,016444 €
 *   (registrar).
 * - Who pays: Código Civil art. 1455 (seller the deed, buyer the first copy
 *   and after, unless agreed); TRLITP (RDLeg 1/1993) arts. 8.a and 29 (the
 *   buyer pays the purchase taxes whatever the parties agree; the lender the
 *   mortgage deed's AJD, RDL 17/2018); Ley 5/2019 (BOE-A-2019-3814) art.
 *   14.1.e (on a mortgage the lender pays the notary of the loan deed, its
 *   registration and the gestoría; the borrower the valuation; copies whoever
 *   asks for them).
 * - IVA on the fees: Ley 37/1992 art. 90.Uno, 21 %. The Canary Islands, Ceuta
 *   and Melilla are outside the IVA (art. 3.Dos.1.º): IGIC or IPSI instead,
 *   not computed here.
 * - Matrix sides: Reglamento Notarial (BOE-A-1944-6578) art. 155 lays the
 *   matrix out on the four planas of each pliego, so a folio counts two
 *   written sides (the calculator's assumption, printed).
 * - Catalonia: Código civil de Cataluña (Ley 25/2010, BOE-A-2010-13312) art.
 *   231-10.2, separate property by default: a couple buying half each is a
 *   pro indiviso for the Registry (the page's FAQ).
 * - Gestoría and valuation (tasación): no official scale; never estimated.
 *
 * RULES_UNTIL: tests/purchase-costs.test.ts fails from that day until the
 * texts are read again (a January decree can change any of them).
 */

export const RULES_AS_OF = "2026-11-19";
export const RULES_UNTIL = "2027-01-01";

export { ARANCEL_REBATE, NOTARY_COPY_PER_FOLIO, NOTARY_SCALE, REGISTRY_CAP, REGISTRY_SCALE, type FeeSlice };

/** Above this value the notary's fee on the excess is agreed freely (RD 1426/1989, número 2.1): the calculator stops here. */
export const NOTARY_FREE_ABOVE = 6010121.04;

/** Número 4.1: from the 12th folio of an authorised copy, half the fee. */
export const COPY_HALF_FROM_FOLIO = 12;
/** Número 4.2: a copia simple, per folio. */
export const SIMPLE_COPY_PER_FOLIO = 0.601012;
/** Número 7: matrix folios from the 5th, per written side. */
export const MATRIX_PER_SIDE = 3.005061;
export const MATRIX_FREE_FOLIOS = 4;

/** Número 2.2 (notary) and 2.4.b (registrar): second and later transfers of protected housing. */
export const VPO_RESALE_CUT = 50;
/** Ley 41/1980 art. 8.1-8.2: first transfer of protected housing. */
export const VPO_FIRST_CUT = 50;
/** Ley 41/1980 art. 8.2 in euros (DGRN Instruction of 22 May 2002, arts. 5.a and 11.a), "por todos los conceptos". */
export const VPO_FIXED = { notary: 60.047119, registry: 24.016444, maxUsefulArea: 90 } as const;
/** Arts. 5.b and 11.b of the same Instruction: what the fixed amount may rise by with a linked parking space and a storeroom. */
export const VPO_FIXED_ANNEX = { notary: { parking: 9.015182, storeroom: 6.010121 }, registry: { parking: 6.010121, storeroom: 3.005061 } } as const;

/** RD 1427/1989, número 1: the presentation entry, per title. */
export const REGISTRY_PRESENTATION = 6.010121;
/** RDL 6/2000 art. 36.1: the registrar's fees on a home sale, after the arancel's own rebaja. */
export const REGISTRY_HOME_SALE_CUT = 5;
/** RD 1427/1989, norma segunda.1: in pro indiviso the total never exceeds 1 % of the value. */
export const PRO_INDIVISO_MAX_PCT = 1;

/** RDL 6/2000 art. 35.1: an optional notary discount (never applied by the calculator). */
export const NOTARY_OPTIONAL_DISCOUNT_MAX = 10;

/** Ley 37/1992 art. 90.Uno. */
export const FEES_VAT = 21;

/** Extras the invoices may carry, printed and never added (their count depends on the deed). */
export const EXTRAS = { notaSimple: 3.005061, affectionNote: 3.005061, cancellationNotary: 30.050605, cancellationRegistryBaseCut: 90 } as const;

export interface Source {
  id: string;
  name: string;
  url: string;
  /** The BOE's "última actualización" of the consolidated text, or null when the BOE prints the text as published. */
  consolidated: string | null;
  read: string;
}

const boe = (id: string) => `https://www.boe.es/buscar/act.php?id=${id}`;
const boeDoc = (id: string) => `https://www.boe.es/buscar/doc.php?id=${id}`;

export const SOURCES = {
  notaries: { id: BOE_TEXTS.notaries.id, name: "Real Decreto 1426/1989, de 17 de noviembre, por el que se aprueba el Arancel de los Notarios", url: BOE_TEXTS.notaries.url, consolidated: "2011-11-17", read: RULES_AS_OF },
  registries: { id: BOE_TEXTS.registries.id, name: "Real Decreto 1427/1989, de 17 de noviembre, por el que se aprueba el Arancel de los Registradores de la Propiedad", url: BOE_TEXTS.registries.url, consolidated: "2011-11-17", read: RULES_AS_OF },
  rd1612: { id: "BOE-A-2011-17962", name: "Real Decreto 1612/2011, de 14 de noviembre, por el que se modifican los aranceles de los notarios y los registradores", url: boeDoc("BOE-A-2011-17962"), consolidated: null, read: RULES_AS_OF },
  rdl6_2000: { id: "BOE-A-2000-11836", name: "Real Decreto-ley 6/2000, de 23 de junio, de Medidas Urgentes de Intensificación de la Competencia en Mercados de Bienes y Servicios", url: boe("BOE-A-2000-11836"), consolidated: "2017-04-07", read: RULES_AS_OF },
  rdl8_2010: { id: "BOE-A-2010-8228", name: "Real Decreto-ley 8/2010, de 20 de mayo, por el que se adoptan medidas extraordinarias para la reducción del déficit público", url: boe("BOE-A-2010-8228"), consolidated: "2017-06-28", read: RULES_AS_OF },
  ley41_1980: { id: "BOE-A-1980-15958", name: "Ley 41/1980, de 5 de julio, de medidas urgentes de apoyo a la vivienda", url: boe("BOE-A-1980-15958"), consolidated: "2001-12-21", read: RULES_AS_OF },
  instruction2002: { id: "BOE-A-2002-12290", name: "Instrucción de 22 de mayo de 2002, de la Dirección General de los Registros y del Notariado, por la que se convierten a euros los Aranceles de los Notarios y Registradores", url: boeDoc("BOE-A-2002-12290"), consolidated: null, read: RULES_AS_OF },
  civilCode: { id: "BOE-A-1889-4763", name: "Código Civil (Real Decreto de 24 de julio de 1889)", url: boe("BOE-A-1889-4763"), consolidated: "2025-01-03", read: RULES_AS_OF },
  ley5_2019: { id: "BOE-A-2019-3814", name: "Ley 5/2019, de 15 de marzo, reguladora de los contratos de crédito inmobiliario", url: boe("BOE-A-2019-3814"), consolidated: "2026-10-07", read: RULES_AS_OF },
  trlitp: { id: BOE_TEXTS.trlitp.id, name: BOE_TEXTS.trlitp.name, url: BOE_TEXTS.trlitp.url, consolidated: BOE_TEXTS.trlitp.consolidated, read: RULES_AS_OF },
  liva: { id: BOE_TEXTS.liva.id, name: BOE_TEXTS.liva.name, url: BOE_TEXTS.liva.url, consolidated: BOE_TEXTS.liva.consolidated, read: RULES_AS_OF },
  catalanFamilyCode: { id: "BOE-A-2010-13312", name: "Ley 25/2010, de 29 de julio, del libro segundo del Código civil de Cataluña, relativo a la persona y la familia", url: boe("BOE-A-2010-13312"), consolidated: "2021-12-02", read: RULES_AS_OF },
  notarialRegulation: { id: "BOE-A-1944-6578", name: "Decreto de 2 de junio de 1944, Reglamento de la organización y régimen del Notariado", url: boe("BOE-A-1944-6578"), consolidated: "2015-11-07", read: RULES_AS_OF },
} as const satisfies Record<string, Source>;

/** The words of each rule, as the BOE prints them (Spanish originals; the tests check every figure appears in its quote). */
export const QUOTE = {
  /* RD 1426/1989 (notaries) */
  notaryScaleLead: HT_QUOTE.notaryScale,
  notaryScale: [
    "a) Cuando el valor no exceda de 6.010,12 euros: 90,151816 euros.",
    "b) Por el exceso comprendido entre 6.010,13 y 30.050,61 euros: 4,5 por mil.",
    "c) Por el exceso comprendido entre 30.050,62 y 60.101,21 euros: 1,50 por mil.",
    "d) Por el exceso comprendido entre 60.101,22 y 150.253,03 euros: 1 por mil.",
    "e) Por el exceso comprendido entre 150.253,04 y 601.012,10 euros: 0,5 por mil.",
    "f) Por lo que excede de 601.012,10 euros hasta 6.010.121,04 euros: 0,3 por mil.",
  ],
  notaryFree: "Por lo que excede de 6.010.121,04 euros el Notario percibirá la cantidad que libremente acuerde con las partes otorgantes.",
  notaryRebate: `${HT_QUOTE.notaryRebate} Esta rebaja también se llevará a cabo, en todo caso, en los supuestos previstos en los apartados siguientes de este número que resulten de la aplicación de esta escala y con carácter adicional a los demás descuentos y rebajas previstos en la normativa vigente.`,
  notaryLoan: "Los derechos establecidos en el apartado 1, se reducirán en un 25 por 100 en los préstamos y créditos personales o con garantía hipotecaria.",
  notaryHalfLead: "La reducción alcanzará un 50 por 100 en los casos siguientes:",
  notaryVpoResale: "e) Segundas o posteriores transmisiones de edificios y viviendas que hayan obtenido la calificación o certificación de actuación protegible por reunir los requisitos exigidos en la normativa vigente.",
  notaryOtherBenefits: "Quedan a salvo, además, las exenciones o bonificaciones en materia de concentración parcelaria, Viviendas de Protección Oficial, explotaciones familiares y demás establecidas por la Ley.",
  notaryCopies: `${HT_QUOTE.notaryCopies} A partir del duodécimo folio inclusive, se percibirá la mitad de la cantidad anterior.`,
  notarySimpleCopies: "Las copias simples devengarán a razón de 0,601012 euros por folio.",
  notaryMatrixFolios: "Los folios de matriz, a partir del quinto folio inclusive, devengarán 3,005061 euros por cara escrita.",
  /** Reglamento Notarial art. 155: the matrix is written on the four planas (sides) of each pliego, which is why the calculator counts two sides a folio. */
  notarySides: "Las planas segunda y cuarta tendrán también al lado izquierdo un margen de la cuarta parte del ancho del papel y al lado derecho el necesario para la encuadernación de los protocolos.",
  notaryBase: "El Arancel se aplicará sobre la base del valor comprobado fiscalmente de los hechos, actos o negocios jurídicos, y, a falta de aquéllos, sobre los consignados por las partes en el correspondiente documento.",
  notaryNoAdvice: "El Notario no podrá percibir cantidad alguna por asesoramiento o configuración del acto o negocio, cuya documentación autorice.",
  notaryWhoPays: "La obligación de pago de los derechos corresponderá a los que hubieren requerido la prestación de funciones o los servicios del Notario y, en su caso, a los interesados según las normas sustantivas y fiscales, y si fueren varios, a todos ellos solidariamente.",
  notaryInvoice: "Los derechos que los Notarios devenguen con arreglo a estos aranceles se consignarán en la oportuna minuta en la que se expresarán los suplidos, conceptos, bases y números del arancel aplicados que deberá firmar el Notario",
  notaryAppeal: "Los interesados podrán impugnar la minuta formulada por el Notario dentro del plazo de quince días hábiles siguientes al de su notificación o entrega.",
  notaryCancellation: "Por las escrituras de cancelación de crédito o préstamo hipotecario, y con independencia del capital pendiente de amortizar y de que la operación se integre en un proceso de subrogación o novación hipotecaria, se percibirá 30,050605 euros, sin que se devengue cantidad alguna a partir del quinto folio de matriz y de copia, sea copia autorizada o copia simple.",

  /* RD 1427/1989 (registrars) */
  registryPresentation: "Por el asiento de presentación de cada título, cualquiera que sea el número de documentos complementarios que lo acompañen, ya se presenten al tiempo o dentro del plazo de vigencia del asiento de presentación, cualquiera que sea la clase y número de asientos que se pretendan, las fincas que comprenda y las notas complementarias que dé lugar el asiento de presentación, incluida, en su caso, la nota de suspensión o denegación del asiento solicitado 6,010121 euros.",
  registryScaleLead: "Por la inscripción, anotación o cancelación de cada finca o derecho, se percibirán las cantidades que fijan las siguientes escalas:",
  registryScale: [
    "a) Si el valor de la finca o derecho no excede de 6.010,12 euros, 24,040484 euros.",
    "b) Por el exceso comprendido entre 6.010,13 y 30.050,61 euros, 1,75 por 1.000.",
    "c) Por el exceso comprendido entre 30.050,62 y 60.101,21 euros, 1,25 por 1.000.",
    "d) Por el exceso comprendido entre 60.101,22 y 150.253,03 euros, 0,75 por 1.000.",
    "e) Por el exceso comprendido entre 150.253,04 y 601.012,10 euros, 0,30 por 1.000.",
    "f) Por el valor que exceda de 601.012,10 euros 0,20 por 1.000.",
  ],
  registryCap: HT_QUOTE.registryCap,
  registryRebate: `${HT_QUOTE.registryRebate} Esta rebaja también se llevará a cabo, en todo caso, en los supuestos previstos en los apartados siguientes de este número y con carácter adicional a los demás descuentos y rebajas previstos en la normativa vigente y sin que resulte de aplicación a la misma lo dispuesto en el apartado 6 de este número.`,
  registryHalfLead: "Los derechos de este número se bonificarán igualmente en un 50 por 100 en los casos siguientes:",
  registryVpoResale: "b) Las segundas o posteriores transmisiones de edificios y viviendas que hayan obtenido calificación o certificación de actuación protegible por reunir los requisitos exigidos en la normativa vigente.",
  registryOtherBenefits: "Quedan además a salvo las exenciones o bonificaciones en materia de concentración parcelaria, Viviendas de Protección Oficial, explotaciones familiares y demás establecidas por Ley.",
  registryBase: "El Arancel se aplicará sobre los valores comprobados fiscalmente de los hechos, actos o negocios jurídicos, y, a falta de aquéllos, sobre los consignados por las partes en el correspondiente documento.",
  registryProIndiviso: "Para la regulación de derechos en las inscripciones y anotaciones en los casos de pro indiviso, se distribuirá el valor total de las fincas o derechos objeto de la adquisición entre los distintos partícipes en proporción a su respectivo haber, aplicando a cada una de las participaciones los derechos que correspondan, y sin que en ningún caso pueda exceder el total de los derechos el 1 por 100 del valor de la finca o derecho.",
  registrySpouses: "En las adquisiciones efectuadas por personas casadas en régimen de gananciales o cualquier otro de comunidad matrimonial, se tomará como única base el valor total de la finca o derecho adquirido.",
  registryWhoPays: "Los derechos del Registrador se pagarán por aquél o aquéllos a cuyo favor se inscriba o anote inmediatamente el derecho, siendo exigibles también a la persona que haya presentado el documento",
  registryAffection: "Por las notas de afección en garantía de débitos fiscales se devengarán: 3,005061 euros.",
  registryNotaSimple: "Por nota simple informativa o exhibición, por cada finca, y cualquiera que sea el número de asientos que contenga el folio registral: 3,005061 euros.",
  registryAppeal: "Los interesados podrán impugnar la minuta formulada por el Registrador dentro del plazo de quince días hábiles siguientes al de su notificación o entrega.",
  registryCancellation: "El arancel aplicable a la inscripción de escrituras de subrogación, novación modificativa y cancelación de créditos o préstamos hipotecarios será el contemplado en este apartado, tomando como base el capital pendiente de amortizar reducido en un 90 por 100 y con independencia de que la operación se integre o no en un proceso de subrogación o novación hipotecaria.",

  /* RDL 6/2000 and RDL 8/2010 */
  notaryDiscount: "En relación con los aranceles establecidos por el Real Decreto 1426/1989, de 17 de noviembre y sus modificaciones posteriores, se podrá efectuar un descuento de hasta el 10 por 100.",
  registryHomeSale: "Los aranceles de los Registradores de la Propiedad, establecidos por el Real Decreto 1427/1989, de 17 de noviembre, y sus modificaciones posteriores, se reducen en un 5 por 100 en el caso de constitución, modificación, subrogación y cancelación de préstamos y créditos con garantía hipotecaria y en la compraventa de viviendas, y en un 15 por 100 en el caso de la inscripción de documentos previstos en la legislación urbanística en los que se formalicen actos de ejecución del planeamiento dirigidos a la preparación de suelo urbanizado.",
  registryHomeSaleOrder: "En el supuesto de que en las referidas disposiciones reglamentarias, o en la normativa especial, se contemplen algún tipo de rebajas arancelarias, la reducción prevista en esta norma se aplicará a la cantidad que resulte una vez deducida la rebaja inicial.",
  da8Notary: "Se aplicará una rebaja del 5% al importe de los derechos notariales resultantes de la aplicación de lo previsto en el Número 2.1 del arancel de los notarios, aprobado por Real Decreto 1426/1989, de 17 de noviembre, por el que se aprueba el arancel de los notarios. Esta rebaja es adicional respecto de la aplicación de los demás descuentos o rebajas previstos en la normativa vigente.",
  da8Invoice: "Las minutas de los Notarios y Registradores de la Propiedad, Mercantiles y bienes muebles, además de cumplir la normativa aplicable, expresarán separadamente, y con la debida claridad:",

  /* Ley 41/1980 art. 8 (RDL 6/2000 art. 37) and the 2002 Instruction */
  vpoFirst: "Los honorarios de Notarios y Registradores de la Propiedad tendrán una reducción de un 50 por 100 de los derechos correspondientes, respectivamente, a escritura matriz, primera copia e inscripción de los actos de cuantía referentes a viviendas calificadas de protección oficial o declaradas protegidas.",
  vpoFirstSale: "La primera transmisión o adjudicación, así como en su caso la subrogación en el préstamo hipotecario cualificado, de cada una de dichas viviendas gozará de la expresada reducción del 50 por 100 de los derechos de matriz, primera copia e inscripción; y tratándose de viviendas cuya superficie útil no exceda de noventa metros cuadrados devengarán exclusivamente y por todos los conceptos la cantidad de 9.991 pesetas como derechos del Notario y 3.996 como derechos del Registrador de la Propiedad. Para gozar de las bonificaciones a que se refiere este párrafo se precisará que sea la única vivienda del adquirente y se destine a su residencia habitual y permanente.",
  vpoEurosNotary: "a) Primera transmisión o adjudicación de viviendas cuya superficie útil no exceda de noventa metros cuadrados, así como en su caso la subrogación en el préstamo hipotecario cualificado de cada una de dichas viviendas: 60,047119 Euros.",
  vpoEurosRegistry: "a) Primera transmisión o adjudicación de viviendas cuya superficie útil no exceda de noventa metros cuadrados, así como en su caso la subrogación en el préstamo hipotecario cualificado de cada una de dichas viviendas: 24,016444 Euros.",

  /* Who pays */
  civilCode1455: "Los gastos de otorgamiento de escrituras serán de cuenta del vendedor, y los de la primera copia y los demás posteriores a la venta serán de cuenta del comprador, salvo pacto en contrario.",
  taxBuyer: "Estará obligado al pago del Impuesto a título de contribuyente, y cualesquiera que sean las estipulaciones establecidas por las partes en contrario:",
  taxBuyerWho: "a) En las transmisiones de bienes y derechos de toda clase, el que los adquiere.",
  ajdBuyer: "Será sujeto pasivo el adquirente del bien o derecho y, en su defecto, las personas que insten o soliciten los documentos notariales, o aquellos en cuyo interés se expidan.",
  mortgageAjdLender: HT_QUOTE.mortgageLender,
  ley5Lead: "Información clara y veraz de los gastos que corresponden al prestamista y los que corresponden al prestatario. Los siguientes gastos se distribuirán del siguiente modo:",
  ley5Valuation: "Los gastos de tasación del inmueble corresponderán a prestatario y los de gestoría al prestamista.",
  ley5Notary: "El prestamista asumirá el coste de los aranceles notariales de la escritura de préstamo hipotecario y los de las copias los asumirá quien las solicite.",
  ley5Registry: "Los gastos de inscripción de las garantías en el registro de la propiedad corresponderán al prestamista.",
  ley5Tax: "El pago del impuesto de transmisiones patrimoniales y actos jurídicos documentados se realizará de conformidad con lo establecido en la normativa tributaria aplicable.",

  /** Código civil de Cataluña art. 231-10.2 (BOE's Spanish text): spouses without a marriage contract are in separate property, so a couple buying half each is a pro indiviso for the Registry. */
  catalanSeparation: "Si no existe pacto o si los capítulos matrimoniales son ineficaces, el régimen económico es el de separación de bienes.",

  /* IVA */
  vatGeneral: HT_QUOTE.vatGeneral,
} as const;
