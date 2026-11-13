/**
 * The legal basics the mortgage calculator page explains, each from the BOE
 * consolidated text read on RULES_AS_OF (BOE open-data API, blocks of Ley
 * 5/2019 and Orden EHA/2899/2011), quoted word for word. Client-safe.
 *
 *  - Ley 5/2019, reguladora de los contratos de crédito inmobiliario
 *    (BOE-A-2019-3814): art. 14.1 (FEIN, FiAE, scenarios document, 10
 *    calendar days), art. 15 (notary's free prior act), art. 21.3–21.4 (no
 *    floor clause, no negative interest), art. 23.5 and 23.7 (early
 *    repayment fee caps; art. 23.6 as amended by RDL 8/2023), art. 25.1
 *    (default interest).
 *  - Orden EHA/2899/2011 (BOE-A-2011-17015): art. 21 (FIPRE, general
 *    information) and art. 22 (FiAE), as amended by Orden ECE/482/2019.
 *
 * Only these basics: the page sends readers to the BOE for the rest, and
 * names no lender.
 */

export const RULES_AS_OF = "2026-11-13";
/** From this day a test fails until the texts are re-read. */
export const RULES_REREAD_BY = "2027-05-13";

export const URLS = {
  ley5: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814",
  ley5Art14: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814#ar-14",
  ley5Art15: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814#ar-15",
  ley5Art21: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814#ar-21",
  ley5Art23: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814#ar-23",
  ley5Art25: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814#ar-25",
  orden: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-17015",
  ordenArt21: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-17015#a21",
  ordenArt22: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-17015#a22",
} as const;

export const NORMS = {
  ley5: { name: "Ley 5/2019, de 15 de marzo, reguladora de los contratos de crédito inmobiliario", ref: "BOE-A-2019-3814", url: URLS.ley5 },
  orden: { name: "Orden EHA/2899/2011, de 28 de octubre, de transparencia y protección del cliente de servicios bancarios", ref: "BOE-A-2011-17015", url: URLS.orden },
} as const;

/** Official words the page quotes (Spanish originals). */
export const QUOTE = {
  /** Orden EHA/2899/2011 art. 21.1. */
  fipre:
    "Esta información, que será gratuita y tendrá carácter orientativo, se facilitará mediante la ficha de información precontractual (FIPRE) que figura en el anexo I.",
  /** Ley 5/2019 art. 14.1 (opening). */
  art14: "El prestamista, intermediario de crédito o su representante designado, en su caso, deberá entregar al prestatario o potencial prestatario, con una antelación mínima de diez días naturales respecto al momento de la firma del contrato, la siguiente documentación:",
  /** Ley 5/2019 art. 14.1.a. */
  fein: "La Ficha Europea de Información Normalizada (FEIN), contenida en el Anexo I de esta Ley, que tendrá la consideración de oferta vinculante para la entidad durante el plazo pactado hasta la firma del contrato que, como mínimo, deberá de ser de diez días.",
  /** Ley 5/2019 art. 14.1.c. */
  scenarios: "En caso de tratarse de un préstamo a tipo de interés variable, de un documento separado con una referencia especial a las cuotas periódicas a satisfacer por el prestatario en diferentes escenarios de evolución de los tipos de interés.",
  /** Ley 5/2019 art. 15.8. */
  notaryFree: "El acta donde conste la entrega y asesoramiento imparcial al prestatario no generará coste arancelario alguno.",
  /** Ley 5/2019 art. 21.3 and 21.4. */
  noFloor: "En las operaciones con tipo de interés variable no se podrá fijar un límite a la baja del tipo de interés.",
  noNegative: "El interés remuneratorio en dichas operaciones no podrá ser negativo.",
  /** Ley 5/2019 art. 25.1. */
  defaultInterest: "el interés de demora será el interés remuneratorio más tres puntos porcentuales a lo largo del período en el que aquel resulte exigible.",
} as const;

/**
 * Early-repayment fee caps of Ley 5/2019 art. 23 (never above the lender's
 * actual financial loss, art. 23.8), in % of the capital repaid early.
 *  - Variable loans (art. 23.5), one of two options agreed in the contract:
 *    0.15 % during the first 5 years, or 0.25 % during the first 3; nothing after.
 *  - Fixed loans (art. 23.7): 2 % during the first 10 years (or from the day
 *    the fixed rate applies), 1.5 % after.
 */
export const EARLY_REPAYMENT = {
  variable: [
    { years: 5, capPct: 0.15 },
    { years: 3, capPct: 0.25 },
  ],
  fixed: { firstYears: 10, firstCapPct: 2, afterCapPct: 1.5 },
} as const;
