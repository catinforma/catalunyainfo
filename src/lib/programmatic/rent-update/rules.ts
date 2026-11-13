/**
 * The legal rules of the annual rent update in Spain, as dated constants.
 * Every date and figure here was read in the BOE's consolidated texts on
 * 13 Nov 2026 (RENT_RULES_AS_OF); a test fails from RENT_RULES_REVIEW_BY
 * until they are read again, because rent caps have changed by decree-law
 * three times in 2026 alone.
 *
 * Housing (LAU, "arrendamiento de vivienda"), by the day the rent is updated
 * (the contract's anniversary):
 *
 *  1. 31 Mar 2022 – 31 Dec 2023: RDL 6/2022 art. 46.1 (as worded by Ley
 *     12/2023 DF 6): without a new agreement, at most the annual change of
 *     the Índice de Garantía de Competitividad (IGC). Ley 2/2015, annex: an
 *     IGC rate above 2 % counts as 2 %, a negative one as 0. A landlord who
 *     is not a "gran tenedor" may agree a different increase with the tenant.
 *  2. 1 Jan – 31 Dec 2024: RDL 6/2022 art. 46.2: at most 3 % (same
 *     gran-tenedor rule).
 *  3. From 2025, contracts signed from 26 May 2023 (Ley 12/2023 in force):
 *     at most the IRAV (LAU DA 11; the INE's page: "Los contratos de alquiler
 *     firmados con posterioridad al 26 de mayo de 2023 se revisarán en base
 *     al IRAV").
 *  4. Contracts signed before 26 May 2023 keep the regime of their signing
 *     day (Ley 12/2023 DT 4.1, original wording): what the contract says,
 *     capped by the IPC for contracts signed from 6 Mar 2019 (LAU art. 18.1
 *     as worded by RDL 7/2019), no legal cap before.
 *  5. 22 Mar – 29 Apr 2026: RDL 8/2026 art. 2: at most 2 % (gran-tenedor
 *     rule as in 1). Repealed by the Congress (Resolución de 28 de abril de
 *     2026, BOE 30 Apr 2026).
 *  6. 1 Oct 2026 (RDL 26/2026, in force 1 Oct, repealed by the Congress on
 *     2 Oct) and from 8 Oct 2026 (RDL 29/2026, validated by the Congress on
 *     12 Nov 2026, BOE 13 Nov 2026): Ley 12/2023 DT 4.1 now says contracts
 *     signed before 26 May 2023 "se actualizarán con el límite máximo
 *     aplicable de acuerdo con la disposición adicional undécima … y la
 *     redacción dada al artículo 18.1": the IRAV cap applies to every
 *     housing contract, whatever its signing date. LAU art. 18.1 itself now
 *     names the IRAV as the cap and as the default index.
 *
 * Commercial and other non-housing leases ("uso distinto del de vivienda",
 * LAU art. 4.3): what the contract says; none of these caps applies.
 */

export const RENT_RULES_AS_OF = "2026-11-13";
/** Re-read every rule here on this day (a test fails from then on). */
export const RENT_RULES_REVIEW_BY = "2027-01-01";

/** The calculator answers for anniversaries in this range. */
export const FIRST_UPDATE = "2023-01-01";
export const LAST_UPDATE = "2027-12-31";

/** Ley 12/2023 in force (BOE 25 May 2023, "al día siguiente"). */
export const LEY_12_2023_IN_FORCE = "2023-05-26";
/** RDL 7/2019 in force (IPC cap in LAU art. 18.1). */
export const RDL_7_2019_IN_FORCE = "2019-03-06";

/** RDL 6/2022 art. 46 windows (the calculator starts on FIRST_UPDATE). */
export const IGC_CAP_TO = "2023-12-31";
export const THREE_PCT_FROM = "2024-01-01";
export const THREE_PCT_TO = "2024-12-31";
export const THREE_PCT = 3;
/** Ley 2/2015, annex: the IGC rate used for reviews, between 0 and 2 %. */
export const IGC_CEILING = 2;

/** From here, the IRAV caps contracts signed from LEY_12_2023_IN_FORCE. */
export const IRAV_CAP_FROM = "2025-01-01";

/** RDL 8/2026 art. 2: 2 % from its entry into force to the day before its repeal was published. */
export const RDL_8_2026_FROM = "2026-03-22";
export const RDL_8_2026_TO = "2026-04-29";
export const RDL_8_2026_PCT = 2;

/** RDL 26/2026 (one day in force) and RDL 29/2026: the IRAV caps every housing contract. */
export const RDL_26_2026_DAY = "2026-10-01";
export const RDL_29_2026_FROM = "2026-10-08";

export type NormId =
  | "lau18"
  | "lau4"
  | "lauDa11"
  | "ley12Dt4"
  | "rdl6art46"
  | "ley2Annex"
  | "rdl7"
  | "rdl8"
  | "rdl8Repeal"
  | "rdl26"
  | "rdl29"
  | "rdl29Valid";

export interface Norm {
  /** The norm's short name, as the BOE titles it. */
  name: string;
  /** BOE reference. */
  ref: string;
  url: string;
}

/** Every norm the calculator cites (BOE consolidated text or ELI where there is one). */
export const NORMS: Record<NormId, Norm> = {
  lau18: { name: "Ley 29/1994, de Arrendamientos Urbanos, art. 18", ref: "BOE-A-1994-26003", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003#a18" },
  lau4: { name: "Ley 29/1994, de Arrendamientos Urbanos, art. 4.3", ref: "BOE-A-1994-26003", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003#a4" },
  lauDa11: { name: "Ley 29/1994, de Arrendamientos Urbanos, disposición adicional undécima", ref: "BOE-A-1994-26003", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003#da" },
  ley12Dt4: { name: "Ley 12/2023, por el derecho a la vivienda, disposición transitoria cuarta", ref: "BOE-A-2023-12203", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203#dt-4" },
  rdl6art46: { name: "Real Decreto-ley 6/2022, art. 46 (redacción de la Ley 12/2023)", ref: "BOE-A-2022-4972", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-4972#a4-8" },
  ley2Annex: { name: "Ley 2/2015, de desindexación de la economía española, anexo", ref: "BOE-A-2015-3443", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-3443#an" },
  rdl7: { name: "Real Decreto-ley 7/2019, de medidas urgentes en materia de vivienda y alquiler", ref: "BOE-A-2019-3108", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2019-3108" },
  rdl8: { name: "Real Decreto-ley 8/2026, art. 2", ref: "BOE-A-2026-6545", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-6545" },
  rdl8Repeal: { name: "Resolución de 28 de abril de 2026, del Congreso (derogación del RDL 8/2026)", ref: "BOE-A-2026-9359", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-9359" },
  rdl26: { name: "Real Decreto-ley 26/2026 (derogado el 2 de octubre de 2026)", ref: "BOE-A-2026-20266", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-20266" },
  rdl29: { name: "Real Decreto-ley 29/2026, de 6 de octubre", ref: "BOE-A-2026-20823", url: "https://www.boe.es/eli/es/rdl/2026/10/06/29" },
  rdl29Valid: { name: "Resolución de 12 de noviembre de 2026, del Congreso (convalidación del RDL 29/2026)", ref: "BOE-A-2026-23755", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23755" },
};

/** Official pages the page links (read 13 Nov 2026). */
export const OFFICIAL_LINKS = {
  /** INE's IRAV page: definition and "contratos firmados con posterioridad al 26 de mayo de 2023". */
  iravPage: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177110&idp=1254735976607",
  iravMethod: "https://www.ine.es/daco/daco42/irav/meto_IRAV.pdf",
  /** The ministry's own calculator, which the INE's IRAV page points to. */
  ministryCalculator: "https://www.mivau.gob.es/vivienda/calculadora-precio-alquiler",
  /** Generalitat: rent limits in tensioned areas (list of towns, rules, state index calculator). */
  gencatLimit: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/",
  gencatTowns: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/llistat-municipis-zmrt/",
  gencatRules: "https://habitatge.gencat.cat/ca/ambits/preus-ingressos-i-zones/limit-preu-lloguer/normativa/",
} as const;

/**
 * The INE's definition of the IRAV, quoted from its IRAV page (13 Nov 2026).
 * Spanish only: it is a quotation.
 */
export const IRAV_DEFINITION_ES =
  "El IRAV se define como el valor mínimo entre la tasa de variación anual del Índice de Precios de Consumo, la tasa de variación anual del Índice de Precios de Consumo subyacente y las tasas de variación anual media ajustada del IPC y del IPC subyacente, medidas como la diferencia entre las tasas de crecimiento anual tanto del Índice de Precios de Consumo como del Índice de Precios de Consumo subyacente de cada mes y un parámetro de referencia que representa la inflación esperada a medio plazo, ajustadas con un coeficiente moderador.";

/** The Generalitat's latest tensioned-area resolutions, as listed on its rules page (13 Nov 2026). */
export const GENCAT_LATEST_RESOLUTIONS = {
  names: ["Resolució TER/3739/2026", "Resolució TER/3740/2026"],
  dogc: "DOGC núm. 9775",
  date: "2026-10-19",
} as const;
