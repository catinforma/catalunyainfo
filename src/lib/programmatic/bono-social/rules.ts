/**
 * Every rule and figure of the bono social eléctrico checker, each with its
 * source. Nothing numeric is typed anywhere else: the engine, the page and the
 * tests read from here. Client-safe: no data files, no server code.
 *
 * ## Read on 18 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, Real Decreto 897/2017 (BOE-A-2017-11505), consolidated text
 *    "Última actualización publicada el 28/01/2026": art. 2.1 (natural
 *    persons, habitual residence, 10 kW or less), art. 3 (vulnerable: PVPC,
 *    income 1.5 × IPREM of 14 payments + 0.3 per extra adult + 0.5 per minor,
 *    large family, minimum pensioners, IMV; +1 for the special
 *    circumstances, electrodependency added by Ley 3/2024; severe: 50 % of
 *    the threshold, 1 × IPREM for minimum pensioners, 2 × IPREM for large
 *    families), art. 4 (at risk of social exclusion), art. 5.1 (PVPC and bono
 *    social only from a reference supplier), art. 6.3 (35 % / 50 %, the
 *    permanent rule), art. 6.4 (the reference supplier applies it), arts.
 *    8.2, 9.1, 9.2, 9.3 (10 working days, from the billing cycle of the
 *    complete application, two years, large families for the title's life),
 *    art. 12.1, Annex I (kWh caps as amended by RDL 18/2022, carry-over).
 *    The consolidated text still shows only 35 % / 50 % and the repeal of RDL
 *    16/2025: it does NOT carry RDL 7/2026.
 *  - BOE, Real Decreto-ley 7/2026 (BOE-A-2026-6544, BOE 21 Mar 2026, in force
 *    22 Mar), art. 1: 42.5 % / 57.5 % "con carácter excepcional" from 1 Jan
 *    to 31 Dec 2026; art. 4: the supply guarantee of RDL 8/2021 art. 4 from
 *    1 Jan to 31 Dec 2026. Validated by Congress on 26 Mar 2026
 *    (BOE-A-2026-7125). The BOE's analysis lists no later change to arts. 1
 *    or 4 (RDL 9, 10, 14, 18 and 25/2026 touch other articles).
 *  - Why other pages disagree: RDL 16/2025 (same 2026 rates) was repealed by
 *    Congress on 27 Jan 2026 (BOE-A-2026-2024); RDL 2/2026 (same rates
 *    again) on 26 Feb 2026 (BOE-A-2026-4667). RDL 7/2026 art. 1.2 makes the
 *    reference suppliers refund the days from 26 Feb 2026.
 *  - BOE, Real Decreto-ley 8/2021 (BOE-A-2021-7351), art. 4.1 (no cut-off).
 *  - BOE, Orden ETU/943/2017 (BOE-A-2017-11532, last updated 19/10/2022),
 *    art. 4.1: income = base imponible general + del ahorro of the last tax
 *    period the AEAT knows, summed for the household; art. 2.7 documents.
 *  - BOE, Ley 31/2022 (PGE 2023, BOE-A-2022-22128), DA 90ª: IPREM 600 € a
 *    month, 7,200 € a year (12 payments), 8,400 € (14). No budget since:
 *    SEPE "Cuantías anuales" (read 18 Nov 2026) still gives the IPREM "fijado
 *    en: Ley 31/2022" (600,00 €); MITECO: "IPREM de 14 pagas: 8.400€".
 *  - MITECO (bonosocial.gob.es redirects to miteco.gob.es …/pe-001.html):
 *    requisitos, que-es, como-solicitarlo (reference suppliers, phones) and
 *    the FAQ (euro examples, power term in full, the most favourable kWh row,
 *    switching to the PVPC free with the same power). The Catalan and English
 *    editions of these pages are in Spanish. bonosocial.gob.es serves an
 *    incomplete TLS chain (curl and Python fail): the page links MITECO.
 *  - CNMC, "Bono social eléctrico": 42.5 % / 57.5 % "establecidos en el Real
 *    Decreto-ley 7/2026".
 *
 * ## Do not print
 *
 * Any 2027 rate other than "35 % / 50 % unless a new decree-law extends the
 * 2026 ones" (nothing published on 18 Nov 2026); the 10 % VAT for severely
 * vulnerable consumers (RDL 25/2026 arts. 18-19, conditional on the CPI);
 * euro savings (they need the PVPC price and the household's consumption);
 * reference suppliers' websites (two answer 403, one 404).
 *
 * A test fails from RULES_UNTIL (31 Dec 2026, the last day of the 2026 rates
 * and of the supply guarantee): re-read the BOE for a decree-law extending
 * them, the IPREM for 2027, MITECO and the CNMC, then move both dates.
 */

export const RULES_AS_OF = "2026-11-18";
/** From this day a test fails: the 2026 discounts and the no-cut-off guarantee end on it (RDL 7/2026 arts. 1 and 4). */
export const RULES_UNTIL = "2026-12-31";

/* -------------------------------------------------------------------------- */
/* Income thresholds (RD 897/2017 art. 3; IPREM, Ley 31/2022 DA 90ª)          */
/* -------------------------------------------------------------------------- */

/** IPREM a month in 2026 (Ley 31/2022 DA 90ª b, budget prorogued; SEPE 2026). */
export const IPREM_MONTHLY = 600;
/** "IPREM de 14 pagas": 14 × 600 = 8,400 € (Ley 31/2022 DA 90ª d; MITECO). */
export const IPREM_14 = IPREM_MONTHLY * 14;
/** Art. 3.2.a: 1.5 × IPREM for the holder alone. */
export const BASE_MULTIPLIER = 1.5;
/** Art. 3.2.a: +0.3 for each further adult of the household. */
export const PER_EXTRA_ADULT = 0.3;
/** Art. 3.2.a: +0.5 for each minor. */
export const PER_MINOR = 0.5;
/** Art. 3.3: +1 when any special circumstance is proven (once, however many apply). */
export const SPECIAL_BONUS = 1;
/** Art. 3.4: severely vulnerable at or below 50 % of the threshold. */
export const SEVERE_SHARE = 0.5;
/** Art. 3.4: minimum pensioners are severely vulnerable at or below 1 × IPREM. */
export const SEVERE_PENSION_MULTIPLIER = 1;
/** Art. 3.4: large families are severely vulnerable at or below 2 × IPREM. */
export const SEVERE_LARGE_FAMILY_MULTIPLIER = 2;
/** Art. 3.2.c: minimum pensioners may have other income of up to 500 € a year. */
export const PENSION_OTHER_INCOME_MAX = 500;
/** Art. 2.1: contracted power of 10 kW or less (also the PVPC's own limit). */
export const MAX_POWER_KW = 10;

/* -------------------------------------------------------------------------- */
/* Discounts (RD 897/2017 art. 6.3; RDL 7/2026 art. 1)                        */
/* -------------------------------------------------------------------------- */

export type Severity = "vulnerable" | "severe";

/** The permanent rule of art. 6.3, in force again from 1 Jan 2027 unless a decree-law extends the 2026 rates. */
export const PERMANENT_DISCOUNT: Record<Severity, number> = { vulnerable: 0.35, severe: 0.5 };

/** RDL 7/2026 art. 1: «con carácter excepcional», 1 Jan to 31 Dec 2026. */
export const DISCOUNT_2026 = { from: "2026-01-01", until: "2026-12-31", rate: { vulnerable: 0.425, severe: 0.575 } as Record<Severity, number> } as const;

/** The discount in force on an ISO day: the 2026 rates inside their window, the permanent ones otherwise. */
export function discountOn(severity: Severity, iso: string): number {
  return iso >= DISCOUNT_2026.from && iso <= DISCOUNT_2026.until ? DISCOUNT_2026.rate[severity] : PERMANENT_DISCOUNT[severity];
}

/** RDL 7/2026 art. 4 (RDL 1/2025 art. 83): no cut-off for vulnerable, severe and at-risk consumers until this day. */
export const NO_CUTOFF_UNTIL = "2026-12-31";

/* -------------------------------------------------------------------------- */
/* kWh with the discount (RD 897/2017 Annex I.2, as amended by RDL 18/2022)    */
/* -------------------------------------------------------------------------- */

export type CapRow = "one-two" | "three" | "four" | "five";

/** Yearly kWh of the energy term with the discount, per Annex I row. */
export const KWH_CAP: Record<CapRow, number> = { "one-two": 1_587, three: 2_222, four: 2_698, five: 4_761 };
/** MITECO's FAQ: the same caps per month ("Límite máximo mensual (kWh)"). */
export const KWH_CAP_MONTHLY: Record<CapRow, number> = { "one-two": 132, three: 185, four: 224, five: 396 };
export const CAP_ROWS: readonly CapRow[] = ["one-two", "three", "four", "five"];

/* -------------------------------------------------------------------------- */
/* Reference suppliers (MITECO, "¿Cómo solicitar el Bono Social?")            */
/* -------------------------------------------------------------------------- */

export interface ReferenceSupplier {
  name: string;
  phone: string;
  /** Set when the supplier serves only one territory. */
  only?: "Ceuta" | "Melilla";
}

/** MITECO's table, read 18 Nov 2026: name and phone only (their websites are not all reachable). */
export const REFERENCE_SUPPLIERS: readonly ReferenceSupplier[] = [
  { name: "Energía XXI Comercializadora de Referencia", phone: "800 760 333" },
  { name: "Curenergía Comercializador de Último Recurso", phone: "900 200 708" },
  { name: "Comercializadora Regulada, Gas & Power", phone: "900 100 502" },
  { name: "Baser Comercializadora de Referencia", phone: "900 902 947" },
  { name: "Régsiti Comercializadora Regulada", phone: "900 10 10 05" },
  { name: "Comercializador de Referencia Energético", phone: "900 814 023" },
  { name: "Teramelcor", phone: "800 00 79 43", only: "Melilla" },
  { name: "Energía Ceuta XXI Comercializadora de Referencia", phone: "900 103 306", only: "Ceuta" },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export interface Source {
  name: string;
  url: string;
  publisher: string;
  /** Reference shown next to the name (BOE id, page date). */
  ref: string;
  /** ISO day we read it. */
  read: string;
}

export const SOURCES = {
  rd897: {
    name: "Real Decreto 897/2017, de 6 de octubre, por el que se regula la figura del consumidor vulnerable, el bono social y otras medidas de protección para los consumidores domésticos de energía eléctrica",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11505",
    publisher: "BOE",
    ref: "BOE-A-2017-11505, texto consolidado, última actualización publicada el 28/01/2026",
    read: RULES_AS_OF,
  },
  rdl7: {
    name: "Real Decreto-ley 7/2026, de 20 de marzo, por el que se aprueba el Plan Integral de Respuesta a la Crisis en Oriente Medio (arts. 1 y 4)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-6544",
    publisher: "BOE",
    ref: "BOE-A-2026-6544, BOE de 21/03/2026; convalidado el 26/03/2026 (BOE-A-2026-7125)",
    read: RULES_AS_OF,
  },
  rdl7conv: {
    name: "Resolución de 26 de marzo de 2026, del Congreso de los Diputados: convalidación del Real Decreto-ley 7/2026",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-7125",
    publisher: "BOE",
    ref: "BOE-A-2026-7125",
    read: RULES_AS_OF,
  },
  rdl16repeal: {
    name: "Resolución de 27 de enero de 2026, del Congreso de los Diputados: derogación del Real Decreto-ley 16/2025",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-2024",
    publisher: "BOE",
    ref: "BOE-A-2026-2024",
    read: RULES_AS_OF,
  },
  rdl2repeal: {
    name: "Resolución de 26 de febrero de 2026, del Congreso de los Diputados: derogación del Real Decreto-ley 2/2026",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-4667",
    publisher: "BOE",
    ref: "BOE-A-2026-4667",
    read: RULES_AS_OF,
  },
  rdl8_2021: {
    name: "Real Decreto-ley 8/2021, de 4 de mayo, art. 4 (garantía de suministro de agua y energía a consumidores vulnerables)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-7351",
    publisher: "BOE",
    ref: "BOE-A-2021-7351",
    read: RULES_AS_OF,
  },
  etu943: {
    name: "Orden ETU/943/2017, de 6 de octubre, por la que se desarrolla el Real Decreto 897/2017 (arts. 2 a 4)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11532",
    publisher: "BOE",
    ref: "BOE-A-2017-11532, texto consolidado, última actualización publicada el 19/10/2022",
    read: RULES_AS_OF,
  },
  iprem: {
    name: "Ley 31/2022, de Presupuestos Generales del Estado para el año 2023, disposición adicional nonagésima (IPREM)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128",
    publisher: "BOE",
    ref: "BOE-A-2022-22128; presupuestos prorrogados",
    read: RULES_AS_OF,
  },
  sepe: {
    name: "Cuantías anuales: valores mensuales y anuales del SMI y del IPREM",
    url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html",
    publisher: "SEPE",
    ref: "IPREM 2026: 600 € al mes, fijado en la Ley 31/2022",
    read: RULES_AS_OF,
  },
  mitecoRequisitos: {
    name: "¿Cuáles son los requisitos para solicitar el bono social?",
    url: "https://www.miteco.gob.es/es/energia/pobreza-energetica/pe-001/requisitos.html",
    publisher: "Ministerio para la Transición Ecológica y el Reto Demográfico (bonosocial.gob.es)",
    ref: "requisitos, umbrales de renta y límites de energía",
    read: RULES_AS_OF,
  },
  mitecoSolicitud: {
    name: "¿Cómo solicitar el Bono Social?",
    url: "https://www.miteco.gob.es/es/energia/pobreza-energetica/pe-001/como-solicitarlo.html",
    publisher: "Ministerio para la Transición Ecológica y el Reto Demográfico (bonosocial.gob.es)",
    ref: "comercializadoras de referencia y medios de solicitud",
    read: RULES_AS_OF,
  },
  mitecoFaq: {
    name: "Preguntas frecuentes sobre el bono social",
    url: "https://www.miteco.gob.es/es/energia/pobreza-energetica/pe-001/preguntas-frecuentes-bono-social.html",
    publisher: "Ministerio para la Transición Ecológica y el Reto Demográfico (bonosocial.gob.es)",
    ref: "ejemplos de renta, documentación, plazos y renovación",
    read: RULES_AS_OF,
  },
  cnmc: {
    name: "Bono social eléctrico",
    url: "https://www.cnmc.es/facil-para-ti/que-hace-la-cnmc-para-consumidores/bono-social-electrico",
    publisher: "CNMC",
    ref: "descuentos del Real Decreto-ley 7/2026",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** Verbatim quotes (Spanish, as published), read on RULES_AS_OF. */
export const QUOTE = {
  /** RD 897/2017 art. 3.1. */
  who: "tendrá la consideración de consumidor vulnerable la persona titular de un punto de suministro de electricidad en su vivienda habitual que, siendo persona física, esté acogida al precio voluntario para el pequeño consumidor (PVPC) y cumpla los restantes requisitos del presente artículo.",
  /** RD 897/2017 art. 3.2.a, first paragraph. */
  income:
    "Que su renta o, en caso de formar parte de una unidad de convivencia, la renta conjunta anual de la unidad de convivencia a la que pertenezca sea igual o inferior a 1,5 veces el Indicador Público de Renta de Efectos Múltiples (IPREM) de 14 pagas.",
  /** RD 897/2017 art. 3.2.a, second paragraph. */
  increments:
    "Cuando la unidad de convivencia esté formada por más de una persona, el multiplicador de renta respecto al índice IPREM de 14 pagas se incrementará en 0,3 por cada miembro adicional mayor de edad que conforme la unidad de convivencia y 0,5 por cada menor de edad de la unidad de convivencia.",
  /** RD 897/2017 art. 3.3, opening words. */
  special: "Los multiplicadores de renta respecto del índice IPREM de 14 pagas establecidos en el apartado 2.a) se incrementarán, en cada caso, en 1 siempre que se acredite alguna de las siguientes circunstancias especiales:",
  /** RD 897/2017 art. 3.4. */
  severe:
    "Cuando, cumpliendo los requisitos anteriores, el consumidor y, en su caso, la unidad de convivencia a la que pertenezca, tenga una renta anual inferior o igual al 50 % del umbral que corresponda según el apartado 2.a), incrementados en su caso conforme a lo dispuesto en el apartado 3, el consumidor será considerado vulnerable severo.",
  /** RD 897/2017 art. 3.4, second sentence. */
  severeOther:
    "Asimismo, también será considerado vulnerable severo cuando el consumidor, y, en su caso, la unidad de convivencia a que pertenezca, tenga una renta anual inferior o igual a una vez el IPREM a 14 pagas, en el caso de que se encuentre en la situación del apartado 2.c), o dos veces el mismo en el caso de que se encuentre en la situación del apartado 2.b).",
  /** RD 897/2017 art. 4.1, first sentence up to the documents. */
  exclusion:
    "se denominará consumidor en riesgo de exclusión social al consumidor que reúna los requisitos para ser vulnerable severo, según lo establecido en el artículo 3, y que sea atendido por los servicios sociales de una Administración autonómica o local que financie al menos el 50 por ciento del importe de su factura",
  /** RD 897/2017 art. 5.1, last sentence. */
  onlyCor: "Asimismo, el comercializador informará al consumidor de que el PVPC, y en su caso, el bono social, sólo le podrá ser aplicado por un comercializador de referencia.",
  /** RD 897/2017 art. 6.3, first two sentences: the permanent rule. */
  permanent: "La TUR de aplicación al consumidor vulnerable será el precio resultante de aplicar un descuento del 35 por ciento en todos los términos que componen el PVPC.",
  permanentSevere: "En el caso del consumidor vulnerable severo, el descuento será del 50 por ciento.",
  /** RDL 7/2026 art. 1.1, end of the first paragraph and the second. */
  window2026: "serán los siguientes con carácter excepcional, en el período comprendido entre el 1 de enero y el 31 de diciembre de 2026.",
  rates2026: "El descuento correspondiente al consumidor vulnerable será del 42,5 por ciento. En el caso del consumidor vulnerable severo, el descuento será del 57,5 por ciento.",
  /** RDL 8/2021 art. 4.1, the guarantee itself. */
  noCutoff:
    "no podrá suspenderse el suministro de energía eléctrica, gas natural y agua a aquellos consumidores en los que concurra la condición de consumidor vulnerable, vulnerable severo o en riesgo de exclusión social definidas en los artículos 3 y 4 del Real Decreto 897/2017",
  /** RDL 7/2026 art. 4 (new wording of RDL 1/2025 art. 83), end. */
  noCutoff2026: "se aplicará desde 1 de enero de 2026 hasta el 31 de diciembre de 2026.",
  /** Orden ETU/943/2017 art. 4.1. */
  incomeCounted:
    "se considerará la cuantía de la base imponible general y del ahorro, reguladas en los artículos 48 y 49, respectivamente, de la Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas, relativa al último período impositivo del que tenga constancia la Agencia Estatal de la Administración Tributaria",
  /** RD 897/2017 Annex I.1.b: unused discounted energy carries over. */
  carryOver:
    "A la cantidad de energía obtenida según el apartado anterior para el periodo de facturación, se añadirá la energía no consumida con derecho a descuento de los periodos de facturación correspondientes a los doce meses completos anteriores.",
  /** RD 897/2017 art. 9.2, first sentence. */
  twoYears: "El bono social se aplicará durante el plazo de dos años, salvo que con anterioridad se produzca la pérdida de alguna de las condiciones que dan derecho a su percepción.",
  /** MITECO FAQ: power term in full, energy term up to the cap. */
  powerTerm:
    "El descuento por bono social en el término de potencia del PVPC se aplica íntegramente. El descuento en el término de energía del PVPC sólo se aplica hasta un límite de energía consumida, establecido en la normativa.",
  /** MITECO FAQ: the most favourable row. */
  favourable: "En caso de que pueda resultar de aplicación más de un límite máximo de energía anual, se aplicará el que resulte más favorable para el consumidor vulnerable.",
  /** MITECO FAQ: applying from the free market. */
  implicitSwitch: "la solicitud del bono social conlleva implícitamente la solicitud de cambio a un contrato a PVPC con el comercializador de referencia.",
  freeSwitch: "Este cambio a PVPC se realiza de forma gratuita siempre que mantenga la potencia contratada.",
} as const;
