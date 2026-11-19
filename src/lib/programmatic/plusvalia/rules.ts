/**
 * Every rule and figure of the plusvalía municipal calculator (Impuesto sobre
 * el Incremento de Valor de los Terrenos de Naturaleza Urbana, IIVTNU), each
 * with the article and the words of the law. Nothing numeric is typed
 * anywhere else: the engine, the page and the tests read from here.
 * Client-safe.
 *
 * ## Read on 19 Nov 2026 (curl, BOE open-data API and diario XML)
 *
 *  - Texto refundido de la Ley Reguladora de las Haciendas Locales (Real
 *    Decreto Legislativo 2/2004, BOE-A-2004-4214), consolidated text updated
 *    7 Oct 2026: arts. 59.2 and 104 to 110, as reformed by Real Decreto-ley
 *    26/2021 (BOE-A-2021-18276, in force 10 Nov 2021) after STC 182/2021
 *    (BOE-A-2021-19511). The BOE's list of later norms names nothing after
 *    RDL 29/2026 that touches arts. 104 to 110.
 *  - The maximum coefficients of art. 107.4, which "serán actualizados
 *    anualmente mediante norma con rango legal", by devengo date:
 *      · RDL 8/2023, art. 24 (BOE-A-2023-26452): from 1 Jan 2024. Back in
 *        force from 23 Jan 2025 and from 28 Jan 2026, when the Congress
 *        derogated the two decree-laws that had replaced it.
 *      · RDL 9/2024, art. 9 (BOE-A-2024-26915), from 1 Jan 2025, derogated by
 *        the Resolución of 22 Jan 2025 (BOE-A-2025-1136, BOE 23 Jan 2025);
 *        RDL 16/2025, art. 18 (BOE-A-2025-26458), from 1 Jan 2026, derogated
 *        by the Resolución of 27 Jan 2026 (BOE-A-2026-2024, BOE 28 Jan 2026).
 *        Both printed the same table.
 *      · RDL 26/2026, art. 10 (from 1 Dec 2026), derogated by the Resolución
 *        of 2 Oct 2026 (BOE-A-2026-20526) before it applied.
 *      · RDL 29/2026, art. 10 (BOE-A-2026-20823, BOE 7 Oct 2026), "con
 *        efectos desde el 1 de diciembre de 2026", convalidated by the
 *        Diputación Permanente on 12 Nov 2026 (BOE-A-2026-23755, BOE 13 Nov
 *        2026).
 *    No norm sets coefficients for 2027 (no 2027 budget law): from 1 Jan
 *    2027 the engine keeps the RDL 29/2026 table and says so.
 *  - Barcelona: Ordenança fiscal 1.3 (BOP 23-12-2024, in force from 1 Jan
 *    2025 "mentre no se n'acordi la modificació o derogació"; the 2026
 *    modification, BOP of the Plenari of 30 Jan 2026, changed only 2.1, 2.2
 *    and 3.12) and the Institut Municipal d'Hisenda's plusvàlua page.
 *  - ORGT (Diputació de Barcelona) homepage; Sede Electrónica del Catastro.
 *
 * ## Do not print
 *
 * Any other council's rate or coefficient; how Barcelona's own 0,05 for
 * periods under one year meets the 1 Dec 2026 update (its ordinance says
 * updates apply automatically and no more); the role of BASE, XALOC or the
 * Lleida agency (not read); late-filing surcharges; the exact last day of
 * the 30 working days (it depends on local holidays: the working-days
 * calculator does that); any 2027 coefficient.
 *
 * A test fails from RULES_UNTIL: re-read art. 107.4 in the BOE (a 2027
 * update by budget law or decree-law, and whether the Congress kept it),
 * then move both dates.
 */

export const RULES_AS_OF = "2026-11-19";
/** From this day a test fails: the coefficients are updated every year by a norm with legal rank (art. 107.4). */
export const RULES_UNTIL = "2027-01-01";
/** The BOE consolidated text read (its "fecha_actualizacion"). */
export const CONSOLIDATED_AS_OF = "2026-10-07";
/** RDL 29/2026 art. 10: the new maximum coefficients apply to devengos from this day. */
export const NEW_TABLE_FROM = "2026-12-01";
/** Resolución de 12 de noviembre de 2026 (BOE 13-11-2026): RDL 29/2026 convalidated. */
export const RDL29_CONVALIDATED = "2026-11-12";
/** The engine's range of devengo dates: the 2024 table onwards, and 2027 on the table in force today. */
export const DEVENGO_MIN = "2024-01-01";
export const DEVENGO_MAX = "2027-12-31";

export interface Source {
  name: string;
  publisher: string;
  ref: string;
  url: string;
  /** Pages with a Spanish edition (Barcelona's IMH), for the es and en pages. */
  urlEs?: string;
  read: string;
}

const BOE_DOC = (id: string) => `https://www.boe.es/buscar/doc.php?id=${id}`;

export const SOURCES = {
  trlrhl: {
    name: "Real Decreto Legislativo 2/2004, de 5 de marzo, por el que se aprueba el texto refundido de la Ley Reguladora de las Haciendas Locales",
    publisher: "BOE",
    ref: "BOE-A-2004-4214, arts. 59.2 y 104 a 110; texto consolidado actualizado el 7/10/2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214",
    read: RULES_AS_OF,
  },
  rdl29_2026: {
    name: "Real Decreto-ley 29/2026, de 6 de octubre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible",
    publisher: "BOE",
    ref: "BOE-A-2026-20823, art. 10 (coeficientes desde el 1/12/2026)",
    url: BOE_DOC("BOE-A-2026-20823"),
    read: RULES_AS_OF,
  },
  rdl29Convalidation: {
    name: "Resolución de 12 de noviembre de 2026, del Congreso de los Diputados, por la que se ordena la publicación del Acuerdo de convalidación del Real Decreto-ley 29/2026",
    publisher: "BOE",
    ref: "BOE-A-2026-23755, BOE núm. 283, 13/11/2026",
    url: BOE_DOC("BOE-A-2026-23755"),
    read: RULES_AS_OF,
  },
  rdl8_2023: {
    name: "Real Decreto-ley 8/2023, de 27 de diciembre",
    publisher: "BOE",
    ref: "BOE-A-2023-26452, art. 24 (coeficientes desde el 1/1/2024)",
    url: BOE_DOC("BOE-A-2023-26452"),
    read: RULES_AS_OF,
  },
  rdl16_2025: {
    name: "Real Decreto-ley 16/2025, de 23 de diciembre",
    publisher: "BOE",
    ref: "BOE-A-2025-26458, art. 18 (coeficientes desde el 1/1/2026); derogado",
    url: BOE_DOC("BOE-A-2025-26458"),
    read: RULES_AS_OF,
  },
  rdl16Derogation: {
    name: "Resolución de 27 de enero de 2026, del Congreso de los Diputados, por la que se ordena la publicación del Acuerdo de derogación del Real Decreto-ley 16/2025",
    publisher: "BOE",
    ref: "BOE-A-2026-2024, BOE núm. 25, 28/01/2026",
    url: BOE_DOC("BOE-A-2026-2024"),
    read: RULES_AS_OF,
  },
  rdl9_2024: {
    name: "Real Decreto-ley 9/2024, de 23 de diciembre",
    publisher: "BOE",
    ref: "BOE-A-2024-26915, art. 9 (coeficientes desde el 1/1/2025); derogado",
    url: BOE_DOC("BOE-A-2024-26915"),
    read: RULES_AS_OF,
  },
  rdl9Derogation: {
    name: "Resolución de 22 de enero de 2025, del Congreso de los Diputados, por la que se ordena la publicación del Acuerdo de derogación del Real Decreto-ley 9/2024",
    publisher: "BOE",
    ref: "BOE-A-2025-1136, BOE núm. 20, 23/01/2025",
    url: BOE_DOC("BOE-A-2025-1136"),
    read: RULES_AS_OF,
  },
  rdl26_2021: {
    name: "Real Decreto-ley 26/2021, de 8 de noviembre, por el que se adapta el texto refundido de la Ley Reguladora de las Haciendas Locales a la reciente jurisprudencia del Tribunal Constitucional respecto del Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana",
    publisher: "BOE",
    ref: "BOE-A-2021-18276, en vigor desde el 10/11/2021",
    url: BOE_DOC("BOE-A-2021-18276"),
    read: RULES_AS_OF,
  },
  stc182_2021: {
    name: "Sentencia del Tribunal Constitucional 182/2021, de 26 de octubre de 2021",
    publisher: "BOE",
    ref: "BOE-A-2021-19511, BOE núm. 282, 25/11/2021",
    url: BOE_DOC("BOE-A-2021-19511"),
    read: RULES_AS_OF,
  },
  bcnOrdinance: {
    name: "Ordenança fiscal núm. 1.3. Impost sobre l'increment de valor dels terrenys de naturalesa urbana (Ajuntament de Barcelona)",
    publisher: "Institut Municipal d'Hisenda de Barcelona",
    ref: "BOP de Barcelona, 23/12/2024; vigent des de l'1/1/2025",
    url: "https://ajuntament.barcelona.cat/hisenda/sites/default/files/normativa/2022-06/1.3-ordenanca-iivtnu-plusvalua.pdf",
    read: RULES_AS_OF,
  },
  bcnProcedure: {
    name: "Plusvàlua, Impost sobre l'increment de valor dels terrenys de naturalesa urbana",
    publisher: "Institut Municipal d'Hisenda de Barcelona",
    ref: "tràmits, terminis i bonificació",
    url: "https://ajuntament.barcelona.cat/hisenda/ca/tramits-gestions/plusvalua-impost-sobre-lincrement-de-valor-dels-terrenys-de-naturalesa-urbana",
    urlEs: "https://ajuntament.barcelona.cat/hisenda/es/tramites-gestiones/plusvalia-impuesto-sobre-el-incremento-de-valor-de-los-terrenos-de-naturaleza",
    read: RULES_AS_OF,
  },
  orgt: {
    name: "Organisme de Gestió Tributària (ORGT) de la Diputació de Barcelona",
    publisher: "Diputació de Barcelona",
    ref: "tràmits de l'IIVTNU (plusvàlua) dels ajuntaments que l'hi deleguen",
    url: "https://orgt.diba.cat/ca/",
    read: RULES_AS_OF,
  },
  catastro: {
    name: "Sede Electrónica del Catastro: Inmuebles",
    publisher: "Dirección General del Catastro",
    ref: "datos de los inmuebles de un titular",
    url: "https://www.sedecatastro.gob.es/",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** Article labels, as the page cites them ("TRLRHL, art. 107.4"). */
export const ARTICLE = {
  optional: "59.2",
  taxableEvent: "104.1",
  notSubject: "104.3",
  noGain: "104.5",
  exemptions: "105",
  dacion: "105.1.c",
  taxpayer: "106",
  base: "107.1",
  landValue: "107.2.a",
  revaluation: "107.3",
  coefficients: "107.4",
  realGain: "107.5",
  rate: "108.1",
  cuotaIntegra: "108.2",
  cuotaLiquida: "108.3",
  bonus: "108.4",
  accrual: "109.1",
  deadlines: "110.2",
  selfAssessment: "110.4",
  communicate: "110.6",
} as const;

/* ------------------------------------------------------- Coefficients --- */

export type TableId = "rdl8-2023" | "rdl9-2024" | "rdl16-2025" | "rdl29-2026";

/**
 * Maximum coefficients of art. 107.4 as each norm prints them: index 0 is
 * "Inferior a 1 año", 1 to 19 the full years, 20 "Igual o superior a 20 años".
 */
export interface CoefficientTable {
  id: TableId;
  /** "Real Decreto-ley 29/2026, art. 10". */
  norm: string;
  source: SourceId;
  /** "Con efectos desde el …": the first devengo it applies to. */
  effectiveFrom: string;
  /** Set when the Congress derogated the decree-law: the day the previous table came back. */
  derogatedFrom?: string;
  values: readonly number[];
}

export const TABLES: Record<TableId, CoefficientTable> = {
  "rdl8-2023": {
    id: "rdl8-2023",
    norm: "Real Decreto-ley 8/2023, art. 24",
    source: "rdl8_2023",
    effectiveFrom: "2024-01-01",
    values: [0.15, 0.15, 0.14, 0.14, 0.16, 0.18, 0.19, 0.2, 0.19, 0.15, 0.12, 0.1, 0.09, 0.09, 0.09, 0.09, 0.1, 0.13, 0.17, 0.23, 0.4],
  },
  "rdl9-2024": {
    id: "rdl9-2024",
    norm: "Real Decreto-ley 9/2024, art. 9",
    source: "rdl9_2024",
    effectiveFrom: "2025-01-01",
    derogatedFrom: "2025-01-23",
    values: [0.16, 0.15, 0.15, 0.15, 0.16, 0.18, 0.2, 0.22, 0.23, 0.21, 0.16, 0.13, 0.11, 0.1, 0.1, 0.1, 0.1, 0.12, 0.16, 0.22, 0.35],
  },
  "rdl16-2025": {
    id: "rdl16-2025",
    norm: "Real Decreto-ley 16/2025, art. 18",
    source: "rdl16_2025",
    effectiveFrom: "2026-01-01",
    derogatedFrom: "2026-01-28",
    values: [0.16, 0.15, 0.15, 0.15, 0.16, 0.18, 0.2, 0.22, 0.23, 0.21, 0.16, 0.13, 0.11, 0.1, 0.1, 0.1, 0.1, 0.12, 0.16, 0.22, 0.35],
  },
  "rdl29-2026": {
    id: "rdl29-2026",
    norm: "Real Decreto-ley 29/2026, art. 10",
    source: "rdl29_2026",
    effectiveFrom: NEW_TABLE_FROM,
    values: [0.17, 0.16, 0.16, 0.17, 0.17, 0.19, 0.21, 0.23, 0.24, 0.25, 0.22, 0.18, 0.14, 0.12, 0.11, 0.11, 0.11, 0.11, 0.13, 0.2, 0.3],
  },
};

/** Which table a devengo date takes, as the BOE consolidated versions of art. 107 run (inclusive ranges). */
export const TABLE_WINDOWS: readonly { from: string; to: string; table: TableId }[] = [
  { from: "2024-01-01", to: "2024-12-31", table: "rdl8-2023" },
  { from: "2025-01-01", to: "2025-01-22", table: "rdl9-2024" },
  { from: "2025-01-23", to: "2025-12-31", table: "rdl8-2023" },
  { from: "2026-01-01", to: "2026-01-27", table: "rdl16-2025" },
  { from: "2026-01-28", to: "2026-11-30", table: "rdl8-2023" },
  { from: NEW_TABLE_FROM, to: DEVENGO_MAX, table: "rdl29-2026" },
];

/** Art. 107.1: "a lo largo de un periodo máximo de veinte años". */
export const MAX_YEARS = 20;

/** Art. 108.1: the council's rate, "sin que dicho tipo pueda exceder del 30 por ciento". */
export const MAX_RATE = 30;
/** Art. 108.4: "una bonificación de hasta el 95 por ciento de la cuota íntegra" (mortis causa to descendants, spouses, ascendants). */
export const MAX_BONUS = 95;
/** Art. 107.2.a: a reducing coefficient on the cadastral value "con el máximo del 15 por ciento". */
export const MAX_REDUCING_COEFFICIENT = 15;
/** Art. 107.3: after a general revaluation, up to 60 % for the first five years. */
export const REVALUATION_REDUCTION = { maxPercent: 60, years: 5 } as const;

/** Art. 110.2: from the devengo, 30 working days inter vivos; six months mortis causa, extendable to one year. */
export const DEADLINE = { interVivosWorkingDays: 30, mortisCausaMonths: 6, mortisCausaMaxMonths: 12 } as const;

/* ---------------------------------------------------------- Barcelona --- */

/**
 * Ordenança fiscal 1.3 of Barcelona (BOP 23-12-2024), art. 5.3: the 2024
 * legal maxima except under one year, 0,05 ("excloses les transmissions
 * gratuïtes mortis causa", where only complete years count); art. 7, 30 %;
 * art. 9.1, 95 % for the deceased's habitual home.
 */
export const BARCELONA = {
  rate: 30,
  bonus: 95,
  keepYears: 3,
  coefficients: [0.05, 0.15, 0.14, 0.14, 0.16, 0.18, 0.19, 0.2, 0.19, 0.15, 0.12, 0.1, 0.09, 0.09, 0.09, 0.09, 0.1, 0.13, 0.17, 0.23, 0.4],
} as const;

/* ------------------------------------------------------------- Quotes --- */

/** The words of the law and of the official pages, as read (Spanish BOE; Catalan for Barcelona and the ORGT). */
export const QUOTE = {
  optional:
    "Asimismo, los ayuntamientos podrán establecer y exigir el Impuesto sobre Construcciones, Instalaciones y Obras y el Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana, de acuerdo con esta ley, las disposiciones que la desarrollen y las respectivas ordenanzas fiscales.",
  taxableEvent:
    "El Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana es un tributo directo que grava el incremento de valor que experimenten dichos terrenos y se ponga de manifiesto a consecuencia de la transmisión de la propiedad de los terrenos por cualquier título o de la constitución o transmisión de cualquier derecho real de goce, limitativo del dominio, sobre los referidos terrenos.",
  notSubjectDivorce:
    "Tampoco se producirá la sujeción al impuesto en los supuestos de transmisiones de bienes inmuebles entre cónyuges o a favor de los hijos, como consecuencia del cumplimiento de sentencias en los casos de nulidad, separación o divorcio matrimonial, sea cual sea el régimen económico matrimonial.",
  noGain:
    "No se producirá la sujeción al impuesto en las transmisiones de terrenos respecto de los cuales se constate la inexistencia de incremento de valor por diferencia entre los valores de dichos terrenos en las fechas de transmisión y adquisición.",
  noGainDeclare:
    "Para ello, el interesado en acreditar la inexistencia de incremento de valor deberá declarar la transmisión, así como aportar los títulos que documenten la transmisión y la adquisición, entendiéndose por interesados, a estos efectos, las personas o entidades a que se refiere el artículo 106.",
  noGainValues:
    "Para constatar la inexistencia de incremento de valor, como valor de transmisión o de adquisición del terreno se tomará en cada caso el mayor de los siguientes valores, sin que a estos efectos puedan computarse los gastos o tributos que graven dichas operaciones: el que conste en el título que documente la operación o el comprobado, en su caso, por la Administración tributaria.",
  landShare:
    "Cuando se trate de la transmisión de un inmueble en el que haya suelo y construcción, se tomará como valor del suelo a estos efectos el que resulte de aplicar la proporción que represente en la fecha de devengo del impuesto el valor catastral del terreno respecto del valor catastral total y esta proporción se aplicará tanto al valor de transmisión como, en su caso, al de adquisición.",
  lucrativeValue:
    "Si la adquisición o la transmisión hubiera sido a título lucrativo se aplicarán las reglas de los párrafos anteriores tomando, en su caso, por el primero de los dos valores a comparar señalados anteriormente, el declarado en el Impuesto sobre Sucesiones y Donaciones.",
  dacion:
    "Las transmisiones realizadas por personas físicas con ocasión de la dación en pago de la vivienda habitual del deudor hipotecario o garante del mismo, para la cancelación de deudas garantizadas con hipoteca que recaiga sobre la misma, contraídas con entidades de crédito o cualquier otra entidad que, de manera profesional, realice la actividad de concesión de préstamos o créditos hipotecarios.",
  taxpayerLucrative:
    "En las transmisiones de terrenos o en la constitución o transmisión de derechos reales de goce limitativos del dominio a título lucrativo, la persona física o jurídica, o la entidad a que se refiere el artículo 35.4 de la Ley 58/2003, de 17 de diciembre, General Tributaria, que adquiera el terreno o a cuyo favor se constituya o transmita el derecho real de que se trate.",
  taxpayerOnerous:
    "En las transmisiones de terrenos o en la constitución o transmisión de derechos reales de goce limitativos del dominio a título oneroso, la persona física o jurídica, o la entidad a que se refiere el artículo 35.4 de la Ley 58/2003, de 17 de diciembre, General Tributaria, que transmita el terreno, o que constituya o transmita el derecho real de que se trate.",
  substitute:
    "En los supuestos a que se refiere el párrafo b) del apartado anterior, tendrá la consideración de sujeto pasivo sustituto del contribuyente, la persona física o jurídica, o la entidad a que se refiere el artículo 35.4 de la Ley 58/2003, de 17 de diciembre, General Tributaria, que adquiera el terreno o a cuyo favor se constituya o transmita el derecho real de que se trate, cuando el contribuyente sea una persona física no residente en España.",
  base:
    "La base imponible de este impuesto está constituida por el incremento del valor de los terrenos puesto de manifiesto en el momento del devengo y experimentado a lo largo de un periodo máximo de veinte años, y se determinará, sin perjuicio de lo dispuesto en el apartado 5 de este artículo, multiplicando el valor del terreno en el momento del devengo calculado conforme a lo establecido en sus apartados 2 y 3, por el coeficiente que corresponda al periodo de generación conforme a lo previsto en su apartado 4.",
  landValue: "En las transmisiones de terrenos, el valor de estos en el momento del devengo será el que tengan determinado en dicho momento a efectos del Impuesto sobre Bienes Inmuebles.",
  reducingCoefficient:
    "Los ayuntamientos podrán establecer en la ordenanza fiscal un coeficiente reductor sobre el valor señalado en los párrafos anteriores que pondere su grado de actualización, con el máximo del 15 por ciento.",
  revaluation:
    "Los ayuntamientos podrán establecer una reducción cuando se modifiquen los valores catastrales como consecuencia de un procedimiento de valoración colectiva de carácter general.",
  revaluationMax: "La reducción tendrá como porcentaje máximo el 60 por ciento.",
  period: "El periodo de generación del incremento de valor será el número de años a lo largo de los cuales se haya puesto de manifiesto dicho incremento.",
  fullYears:
    "En el cómputo del número de años transcurridos se tomarán años completos, es decir, sin tener en cuenta las fracciones de año. En el caso de que el periodo de generación sea inferior a un año, se prorrateará el coeficiente anual teniendo en cuenta el número de meses completos, es decir, sin tener en cuenta las fracciones de mes.",
  councilCoefficient:
    "El coeficiente a aplicar sobre el valor del terreno en el momento del devengo, calculado conforme a lo dispuesto en los apartados anteriores, será el que corresponda de los aprobados por el ayuntamiento según el periodo de generación del incremento de valor, sin que pueda exceder de los límites siguientes:",
  yearlyUpdate: "Estos coeficientes máximos serán actualizados anualmente mediante norma con rango legal, pudiendo llevarse a cabo dicha actualización mediante las leyes de presupuestos generales del Estado.",
  ordinanceExcess:
    "Si, como consecuencia de la actualización referida en el párrafo anterior, alguno de los coeficientes aprobados por la vigente ordenanza fiscal resultara ser superior al correspondiente nuevo máximo legal, se aplicará este directamente hasta que entre en vigor la nueva ordenanza fiscal que corrija dicho exceso.",
  realGain:
    "Cuando, a instancia del sujeto pasivo, conforme al procedimiento establecido en el artículo 104.5, se constate que el importe del incremento de valor es inferior al importe de la base imponible determinada con arreglo a lo dispuesto en los apartados anteriores de este artículo, se tomará como base imponible el importe de dicho incremento de valor.",
  rate: "El tipo de gravamen del impuesto será el fijado por cada ayuntamiento, sin que dicho tipo pueda exceder del 30 por ciento.",
  ratePerPeriod: "Dentro del límite señalado en el párrafo anterior, los ayuntamientos podrán fijar un solo tipo de gravamen o uno para cada uno de los períodos de generación del incremento de valor indicados en el apartado 4 del artículo anterior.",
  cuotaIntegra: "La cuota íntegra del impuesto será el resultado de aplicar a la base imponible el tipo de gravamen.",
  cuotaLiquida: "La cuota líquida del impuesto será el resultado de aplicar sobre la cuota íntegra, en su caso, las bonificaciones a que se refieren los apartados siguientes.",
  bonus:
    "Las ordenanzas fiscales podrán regular una bonificación de hasta el 95 por ciento de la cuota íntegra del impuesto, en las transmisiones de terrenos, y en la transmisión o constitución de derechos reales de goce limitativos del dominio, realizadas a título lucrativo por causa de muerte a favor de los descendientes y adoptados, los cónyuges y los ascendientes y adoptantes.",
  accrual: "Cuando se transmita la propiedad del terreno, ya sea a título oneroso o gratuito, entre vivos o por causa de muerte, en la fecha de la transmisión.",
  filing:
    "Los sujetos pasivos vendrán obligados a presentar ante el ayuntamiento correspondiente la declaración que determine la ordenanza respectiva, conteniendo los elementos de la relación tributaria imprescindibles para practicar la liquidación procedente.",
  deadlineInterVivos: "Cuando se trate de actos ínter vivos, el plazo será de treinta días hábiles.",
  deadlineMortisCausa: "Cuando se trate de actos por causa de muerte, el plazo será de seis meses prorrogables hasta un año a solicitud del sujeto pasivo.",
  selfAssessment:
    "Los ayuntamientos quedan facultados para establecer el sistema de autoliquidación por el sujeto pasivo, que llevará consigo el ingreso de la cuota resultante de aquella dentro de los plazos previstos en el apartado 2 de este artículo.",
  communicateDonor:
    "En los supuestos contemplados en el párrafo a) del artículo 106 de esta ley, siempre que se hayan producido por negocio jurídico entre vivos, el donante o la persona que constituya o transmita el derecho real de que se trate.",
  communicateBuyer: "En los supuestos contemplados en el párrafo b) de dicho artículo, el adquirente o la persona a cuyo favor se constituya o transmita el derecho real de que se trate.",
  rdl29:
    "Con efectos desde el 1 de diciembre de 2026, los importes máximos de los coeficientes a aplicar sobre el valor del terreno en el momento del devengo, según el periodo de generación del incremento de valor a que se refiere el apartado 4 del artículo 107 del texto refundido de la Ley Reguladora de las Haciendas Locales, aprobado por el Real Decreto Legislativo 2/2004, de 5 de marzo, serán los siguientes:",
  rdl29Convalidation:
    "De conformidad con lo dispuesto en el artículo 86.2 de la Constitución, la Diputación Permanente del Congreso de los Diputados, en su sesión del día de hoy, acordó convalidar el Real Decreto-ley 29/2026, de 6 de octubre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible, publicado en el «Boletín Oficial del Estado» número 249, de 7 de octubre de 2026.",
  rdl8:
    "Con efectos desde el día 1 de enero de 2024, los importes máximos de los coeficientes a aplicar sobre el valor del terreno en el momento del devengo, según el periodo de generación del incremento de valor, a que se refiere el apartado 4 del artículo 107 del texto refundido de la Ley reguladora de las Haciendas Locales, aprobado por el Real Decreto Legislativo 2/2004, de 5 de marzo, serán los siguientes:",
  rdl16:
    "Con efectos desde el día 1 de enero de 2026, los importes máximos de los coeficientes a aplicar sobre el valor del terreno en el momento del devengo, según el periodo de generación del incremento de valor, a que se refiere el apartado 4 del artículo 107 del texto refundido de la Ley Reguladora de las Haciendas Locales, aprobado por el Real Decreto Legislativo 2/2004, de 5 de marzo, serán los siguientes:",
  rdl16Derogation:
    "De conformidad con lo dispuesto en el artículo 86.2 de la Constitución, el Congreso de los Diputados, en su sesión del día de hoy, acordó derogar el Real Decreto-ley 16/2025, de 23 de diciembre, por el que se prorrogan determinadas medidas para hacer frente a situaciones de vulnerabilidad social, y se adoptan medidas urgentes en materia tributaria y de Seguridad Social, publicado en el «Boletín Oficial del Estado» número 309, de 24 de diciembre de 2025.",
  rdl9:
    "Con efectos desde el día 1 de enero de 2025, los importes máximos de los coeficientes a aplicar sobre el valor del terreno en el momento del devengo, según el periodo de generación del incremento de valor, a que se refiere el apartado 4 del artículo 107 del texto refundido de la Ley Reguladora de las Haciendas Locales, aprobado por el Real Decreto Legislativo 2/2004, de 5 de marzo, serán los siguientes:",
  stcRuling:
    "declarar la inconstitucionalidad y nulidad de los arts. 107.1, segundo párrafo, 107.2 a) y 107.4 del texto refundido de la Ley reguladora de las haciendas locales, aprobado por el Real Decreto Legislativo 2/2004, de 5 de marzo, en los términos previstos en el fundamento jurídico 6.",
  stcConsolidated:
    "Por otro lado, no pueden considerarse situaciones susceptibles de ser revisadas con fundamento en la presente sentencia aquellas obligaciones tributarias devengadas por este impuesto que, a la fecha de dictarse la misma, hayan sido decididas definitivamente mediante sentencia con fuerza de cosa juzgada o mediante resolución administrativa firme.",
  rdl26Purpose:
    "se mejora técnicamente la determinación de la base imponible para que refleje en todo momento la realidad del mercado inmobiliario, reconociéndose la posibilidad de que los ayuntamientos corrijan a la baja los valores catastrales del suelo en función de su grado de actualización, y sustituyéndose los anteriormente vigentes porcentajes anuales aplicables sobre el valor del terreno para la determinación de la base imponible del impuesto por unos coeficientes máximos establecidos en función del número de años transcurridos desde la adquisición del terreno, que serán actualizados anualmente, mediante norma con rango legal, teniendo en cuenta la evolución de los precios de las compraventas realizadas.",
  bcnRate: "El tipus impositiu és del 30%.",
  bcnUnderYear:
    "En el cas de què el període de generació sigui inferior a un any, a excepció de les transmissions gratuïtes per causa de mort, en les quals només es consideren els anys complets que integren el període impositiu, es prorratejarà el coeficient anual tenint en compte el nombre de mesos complets, és a dir, sense tenir en compte les fraccions del mes.",
  bcnBonus:
    "En les transmissions mortis causa referents a l’habitatge habitual de la persona causant, es considerarà com a tal, llevat de prova en contrari, el que hi figuri al Padró d’Habitants i es podrà gaudir d’un 95% de bonificació en la quota, quan les persones adquirents siguin el/la cònjuge, els/les descendents o adoptats/es o els/les ascendents o adoptants.",
  bcnKeep:
    "El gaudi definitiu d’aquesta bonificació resta condicionat al manteniment de l’adquisició en el patrimoni de l’adquirent, durant els tres anys següents a la mort de la persona causant, llevat que morís l’adquirent dins aquest termini.",
  bcnAutomatic:
    "Les modificacions produïdes per la Llei de pressupostos generals de l'Estat o qualsevol altra norma de rang legal que afectin qualsevol element del present impost, inclosa l’actualització dels coeficients previstos a l’article 5è d’aquesta ordenança, seran d'aplicació automàtica dins l'àmbit d’aquesta Ordenança.",
  bcnInForce: "La present Ordenança, aprovada definitivament pel Plenari del Consell Municipal en data 20 de desembre de 2024, començarà a regir a partir de l’1 de gener de 2025 i continuarà vigent mentre no se n’acordi la modificació o derogació.",
  bcnSelfAssessment:
    "El subjecte passiu ha de practicar l'autoliquidació d'acord amb la manera i els efectes establerts en l'Ordenança fiscal general, excepte en el supòsit que el terreny no tingui determinat el valor cadastral en el moment de la transmissió.",
  bcnEstimate: "També podeu fer una estimació de l’import a pagar en el mateix tràmit.",
  bcnDeclareAll: "Totes les transmissions, amb increment de valor o sense, s'han de declarar mitjançant aquest tràmit.",
  orgtProcedure: "Nou tràmit: sol.licitud de pròrroga IIVTNU (plusvàlua)",
  catastro: "Permite conocer los datos de los inmuebles que figuran a nombre de un ciudadano en la base de datos catastral.",
} as const;
