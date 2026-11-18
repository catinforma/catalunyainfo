/**
 * The rules behind "¿Está mi municipio en zona tensionada?", each quoted from
 * the official text and dated. Client-safe: no data files. The declared
 * municipalities are in declarations.json (built by
 * scripts/zonas-tensionadas-snapshot.ts from the BOE lists).
 *
 * ## Read on 18 Nov 2026 (curl + grep of every quoted text)
 *
 *  - BOE, Ley 12/2023 por el derecho a la vivienda (BOE-A-2023-12203),
 *    consolidated "Última actualización publicada el 07/10/2026": art. 3 k)
 *    (gran tenedor; RDL 29/2026 art. 4.1 added the Registry certificate and the
 *    unit-by-unit count, thresholds unchanged), art. 18 (declaration, criteria,
 *    three years, yearly extensions, the Ministry's quarterly list), art. 31.3
 *    (what the landlord must tell you). Arts. 3 k) and 18 were upheld by the
 *    Constitutional Court (STC 79/2024; STC 41/2026 and STC 64/2026,
 *    BOE-A-2026-13753 and BOE-A-2026-22715, dismiss the rest of those appeals).
 *  - BOE, Ley 29/1994 de Arrendamientos Urbanos (BOE-A-1994-26003),
 *    consolidated "Última actualización publicada el 13/11/2026": art. 10.3
 *    (extraordinary extension, up to three years), art. 17.6 and 17.7 as worded
 *    by RDL 29/2026 art. 3.10 (in force 8 Oct 2026), art. 17.9 (rooms), DT 7ª.
 *  - BOE, Real Decreto-ley 29/2026 (BOE-A-2026-20823), validated by the
 *    Congress's Diputación Permanente on 12 Nov 2026 (BOE-A-2026-23755, BOE 13
 *    Nov 2026). Its DF 6ª (yearly updates to 31 Dec 2027) is quoted.
 *  - BOE, Resolución de 14 de marzo de 2024 (BOE-A-2024-5213): the state
 *    reference index system; the cap is "el valor superior del rango".
 *  - MIVAU: SERPAVI page and its lookup (serpavi.mivau.gob.es); "Consultar
 *    zonas de mercado residencial tensionado" (the dates of each zone).
 *  - Generalitat (habitatge.gencat.cat): "Limitació del preu del lloguer",
 *    FAQ (the limit applies from the day after the BOE list; the index is the
 *    Ministry's), rules page; DOGC TER/3739/2026 and TER/3740/2026 (19 Oct 2026).
 *
 * ## Do not print
 *
 * The new end date of the 118 Catalan towns extended by TER/3739/2026 (no BOE
 * list yet), any date for the next BOE list, the Catalan Agència de
 * l'Habitatge's own index (its site did not answer: unverified), and the
 * Generalitat FAQ's line that new taxes may be passed on (LAU 17.6 as worded
 * by RDL 29/2026 forbids it: the BOE wins).
 *
 * Two dates make a test fail (tests/zona-tensionada.test.ts): RECHECK_BY, a
 * month on, because the Ministry's list for the 4th quarter of 2026 will turn
 * the 53 pending Catalan towns into in-force ones and date the extension of
 * the 118; and 14 days before each zone's last day (declarations.json).
 */

export const RULES_AS_OF = "2026-11-18";
/** Re-read the BOE (the Ministry's quarterly list), the DOGC and the LAU by this day. */
export const RECHECK_BY = "2026-12-16";
/** The rules quoted here (RDL 29/2026 DF 6ª ends on 31 Dec 2027); the data guard is RECHECK_BY. */
export const RULES_UNTIL = "2027-12-31";

export interface Source {
  name: string;
  ref: string;
  url: string;
  publisher: string;
}

export const SOURCES = {
  ley12: { name: "Ley 12/2023, de 24 de mayo, por el derecho a la vivienda (texto consolidado)", ref: "BOE-A-2023-12203", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203", publisher: "BOE" },
  lau: { name: "Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (texto consolidado)", ref: "BOE-A-1994-26003", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003", publisher: "BOE" },
  rdl29: { name: "Real Decreto-ley 29/2026, de 6 de octubre", ref: "BOE-A-2026-20823", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20823", publisher: "BOE" },
  rdl29Valid: { name: "Resolución de 12 de noviembre de 2026, del Congreso (convalidación del RDL 29/2026)", ref: "BOE-A-2026-23755", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23755", publisher: "BOE" },
  index: { name: "Resolución de 14 de marzo de 2024, sistema de índices de precios de referencia (art. 17.7 LAU)", ref: "BOE-A-2024-5213", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-5213", publisher: "BOE" },
  serpavi: { name: "Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (SERPAVI)", ref: "MIVAU", url: "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi", publisher: "Ministerio de Vivienda y Agenda Urbana" },
  serpaviApp: { name: "Índice alquiler de vivienda: consulta del rango de referencia", ref: "MIVAU", url: "https://serpavi.mivau.gob.es/", publisher: "Ministerio de Vivienda y Agenda Urbana" },
  mivauZones: { name: "Consultar zonas de mercado residencial tensionado", ref: "MIVAU", url: "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi/consultar-zonas-de-mercado-residencial-tensionado", publisher: "Ministerio de Vivienda y Agenda Urbana" },
  gencatLimit: { name: "Limitació del preu del lloguer de l'habitatge", ref: "Generalitat", url: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/", publisher: "Generalitat de Catalunya" },
  gencatFaq: { name: "Preguntes freqüents sobre la limitació del preu del lloguer", ref: "Generalitat", url: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/preguntes-frequents-zmrt/", publisher: "Generalitat de Catalunya" },
  gencatRules: { name: "Normativa de les zones de mercat residencial tensat", ref: "Generalitat", url: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/normativa/", publisher: "Generalitat de Catalunya" },
} as const satisfies Record<string, Source>;

/** Fragments of the BOE consolidated texts (the BOE's own block anchors). */
export const ANCHOR = {
  ley12Art3: `${SOURCES.ley12.url}#a3`,
  ley12Art18: `${SOURCES.ley12.url}#a1-10`,
  ley12Art31: `${SOURCES.ley12.url}#a3-3`,
  lauArt10: `${SOURCES.lau.url}#a10`,
  lauArt17: `${SOURCES.lau.url}#a17`,
  lauDt7: `${SOURCES.lau.url}#dt`,
} as const;

/**
 * The official words, in Spanish (or Catalan for the Generalitat). Each is a
 * verbatim extract of the text named in its key; "[…]" never appears inside.
 */
export const QUOTE = {
  /** Ley 12/2023 art. 3 k), first paragraph. */
  granTenedor:
    "la persona física o jurídica que sea titular de más de diez inmuebles urbanos de uso residencial o una superficie construida de más de 1.500 m² de uso residencial, excluyendo en todo caso garajes y trasteros. Esta definición podrá ser particularizada en la declaración de entornos de mercado residencial tensionado hasta aquellos titulares de cinco o más inmuebles de uso residencial ubicadas en dicho ámbito, cuando así sea motivado por la comunidad autónoma en la correspondiente memoria justificativa.",
  /** Ley 12/2023 art. 3 k), as amended by RDL 29/2026 art. 4.1. */
  granTenedorRegistry: "Dicha condición se deberá acreditar mediante certificación del Registro de la Propiedad en el que consten la relación de propiedades a su nombre.",
  granTenedorUnits:
    "Cuando una finca registral comprenda un edificio compuesto por varias unidades susceptibles de uso residencial, se entenderá que cada una de dichas unidades constituye un inmueble independiente a efectos de cómputo, con independencia de que no exista división horizontal inscrita.",
  /** Ley 12/2023 art. 18.2 d). */
  validity:
    "La vigencia de la declaración de un ámbito territorial como zona de mercado residencial tensionado será de tres años, pudiendo prorrogarse anualmente siguiendo el mismo procedimiento, cuando subsistan las circunstancias que motivaron tal declaración y previa justificación de las medidas y acciones públicas adoptadas para revertir o mejorar la situación desde la anterior declaración.",
  quarterlyList:
    "Para la aplicación de las medidas contenidas en esta ley, con carácter trimestral el Ministerio de Transportes, Movilidad y Agenda Urbana aprobará una resolución que recoja la relación de zonas de mercado residencial tensionado que hayan sido declaradas en virtud del procedimiento establecido en este artículo.",
  /** Ley 12/2023 art. 18.3 a) and b). */
  criterionBurden:
    "Que la carga media del coste de la hipoteca o del alquiler en el presupuesto personal o de la unidad de convivencia, más los gastos y suministros básicos, supere el treinta por ciento de los ingresos medios o de la renta media de los hogares.",
  criterionPrices:
    "Que el precio de compra o alquiler de la vivienda haya experimentado en los cinco años anteriores a la declaración como área de mercado de vivienda tensionado, un porcentaje de crecimiento acumulado al menos tres puntos porcentuales superior al porcentaje de crecimiento acumulado del índice de precios de consumo de la comunidad autónoma correspondiente.",
  /** Ley 12/2023 art. 31.3. */
  information:
    "el propietario y, en su caso, la persona que intervenga en la intermediación en la operación deberá indicar tal circunstancia e informar, con anterioridad a la formalización del arrendamiento, y en todo caso en el documento del contrato, de la cuantía de la última renta del contrato de arrendamiento de vivienda habitual que hubiese estado vigente en los últimos cinco años en la misma vivienda, así como del valor que le pueda corresponder atendiendo al índice de referencia de precios de alquiler de viviendas que resulte de aplicación.",
  /** LAU art. 17.6, first, second and third paragraphs (RDL 29/2026 wording). */
  cap: "la renta pactada al inicio del nuevo contrato no podrá exceder de la última renta de contrato de arrendamiento de vivienda que hubiese estado vigente en los últimos cinco años en la misma vivienda, una vez aplicada la cláusula de actualización anual de la renta del contrato anterior.",
  noNewCharges:
    "En ningún caso podrán fijarse nuevas condiciones contractuales que supongan la repercusión al arrendatario de cuotas, gastos generales, servicios, impuestos, tasas, cánones, contribuciones especiales u otros conceptos análogos que no estuviesen recogidas en el contrato anterior.",
  tenPercent:
    "Únicamente podrá incrementarse, más allá de lo que proceda de la aplicación de la cláusula de actualización anual de la renta del contrato anterior, en un máximo del 10 por ciento sobre la última renta de contrato de arrendamiento de vivienda habitual que hubiese estado vigente en los últimos cinco años en la misma vivienda, cuando se acredite alguno de los siguientes supuestos:",
  /** LAU art. 17.7, first and second paragraphs. */
  indexCap:
    "en los contratos de arrendamiento de vivienda sujetos a la presente ley en los que el arrendador sea un gran tenedor de vivienda de acuerdo con la definición establecida en la Ley 12/2023, de 24 de mayo, por el derecho a la vivienda, y en los que el inmueble se ubique en una zona de mercado residencial tensionado dentro del periodo de vigencia de la declaración de la referida zona en los términos dispuestos en la referida Ley 12/2023, de 24 de mayo, la renta pactada al inicio del nuevo contrato no podrá exceder del límite máximo del precio aplicable conforme al sistema de índices de precios de referencia",
  neverRented:
    "y sobre el que no hubiese estado vigente ningún contrato de arrendamiento de vivienda en los últimos cinco años, siempre que así se recoja en la resolución del Ministerio de Vivienda y Agenda Urbana, al haberse justificado dicha aplicación en la declaración de la zona de mercado residencial tensionado.",
  /** LAU art. 17.9, second paragraph. */
  rooms:
    "Si la vivienda arrendada se ubica en zona de mercado residencial tensionado, la renta del contrato unitario de la vivienda completa o, en defecto de este, la suma de las rentas de los contratos parciales vigentes de manera simultánea sobre la misma vivienda deberá respetar, en todo caso, las limitaciones previstas en los apartados 6, 7 y 8.",
  /** LAU art. 10.3. */
  extension:
    "previa solicitud del arrendatario, podrá prorrogarse de manera extraordinaria el contrato de arrendamiento por plazos anuales, por un periodo máximo de tres años, durante los cuales se seguirán aplicando los términos y condiciones establecidos para el contrato en vigor. Esta solicitud de prórroga extraordinaria deberá ser aceptada obligatoriamente por el arrendador",
  /** BOE-A-2024-5213, Segundo. */
  indexUpper: "tomando el valor superior del rango de valores individualizados que resultan de la localización y las diferentes características de la vivienda objeto de arrendamiento.",
  /** Every Ministry list, column a). */
  listPeriod: "Tres años desde el día siguiente a la publicación de la presente resolución, de acuerdo con el artículo 18.2.d) de la Ley 12/2023, de 24 de mayo.",
  /** RDL 29/2026 DF 6ª a) and b). */
  updateAboveIndex: "En el caso de que la renta sea superior al límite máximo del precio aplicable conforme al sistema de índices de precios de referencia, no procederá la aplicación de incremento alguno de la renta.",
  updateTwoPercent: "En ausencia de este nuevo pacto entre las partes, el incremento de la renta a aplicar no podrá ser superior al dos por ciento.",
  /** Generalitat FAQ (Catalan). */
  gencatBoe: "A més, el municipi on és l’habitatge ha de constar a la declaració de la zona de mercat residencial tensat publicada al BOE.",
  gencatIndex: "Aquest índex, determinat pel Ministeri d’Habitatge i Agenda Urbana, ofereix un valor inferior i un de superior. El preu del lloguer no pot superar en cap cas el valor superior.",
  gencatSince: "Des del 10 d’octubre de 2024, als 131 municipis de la segona zona (Resolució publicada al BOE núm. 244, de 9.10.2024).",
  /** DOGC TER/3739/2026, items 1 and 2 (Catalan). */
  catExtended: "Prorrogar la vigència de la declaració de zona de mercat residencial tensat acordada mitjançant la Resolució TER/800/2024, de 13 de març, en els municipis que es relacionen a continuació:",
  catDropped:
    "Concretar els municipis que formaven part de la zona de mercat residencial tensat declarada mitjançant la Resolució TER/800/2024, que ja no reuneixen les condicions establertes a l'article 18.3 de la Llei 12/2023, de 24 de maig, pel dret a l'habitatge, per a formar part de la zona de mercat residencial tensat prorrogada",
} as const;

/** RDL 29/2026 DF 6ª: the window of its yearly-update rule. */
export const UPDATE_RULE = { from: "2026-10-08", until: "2027-12-31" } as const;
/** LAU art. 17.6: the extra increase allowed for works or a 10-year contract. */
export const EXTRA_PCT = 10;
/** LAU art. 10.3: the extraordinary extension, in years. */
export const EXTENSION_YEARS = 3;
/** Ley 12/2023 art. 3 k): the general threshold (more than ten homes or 1,500 m²) and the lowest a declaration may set. */
export const GENERAL_HOMES = 10;
export const GENERAL_M2 = 1500;
export const LOWEST_HOMES = 5;
