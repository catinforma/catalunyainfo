/**
 * The law and the dated figures behind "Subida de las pensiones 2027"
 * (lib/programmatic/pensions-2027/). Every figure was read on the official
 * text on PENSION_RULES_AS_OF and is quoted in the comment above it.
 * Client-safe (no data files, no server code).
 *
 * The rule (LGSS art. 58.2, wording of Ley 21/2021 and RDL 2/2023, read in
 * the BOE consolidated text 13 Nov 2026): contributory pensions rise each
 * January by the mean of the twelve annual CPI rates of December to
 * November. The INE's CPI comes from the rent-update module's loader and
 * snapshot (series IPC290750); this file only holds what a person must type
 * in from an official text, with the day it becomes due:
 *
 *  - NOVEMBER_FLASH: the INE's flash estimate for November 2026, scheduled
 *    for 27 Nov 2026 ("Índice de Precios de Consumo. Avance. Noviembre
 *    2026", INE release calendar 8, read 13 Nov 2026). Not in the INE's API
 *    tables: copy it from the press release. A test fails from 28 Nov 2026
 *    while it is null.
 *  - The final November CPI arrives by itself (INE API, 15 Dec 2026); a
 *    test fails from 15 Dec 2026 until the committed snapshot has it
 *    (`npm run rent:snapshot -- build`).
 *  - OFFICIAL_2027: the percentage and the 2027 amounts once the BOE
 *    publishes the revaluation norm (for 2026 it was RDL 3/2026, BOE 4 Feb
 *    2026, after RDL 16/2025 was not validated). A test fails from 1 Feb
 *    2027 while it is null.
 */

/** The day every figure and quote below was read on the official text. */
export const PENSION_RULES_AS_OF = "2026-11-13";

/** The year whose revaluation the page computes. */
export const TARGET_YEAR = 2027;
/** "los doce meses previos a diciembre del año anterior": December 2025 to November 2026. */
export const WINDOW_FROM = "2025-12";
export const WINDOW_TO = "2026-11";

/** INE release calendar (PUBLICACIONFECHA_PUBLICACION/8, read 13 Nov 2026): flash ("Avance") and final November 2026 CPI. */
export const INE_FLASH_DAY = "2026-11-27";
export const INE_FINAL_DAY = "2026-12-15";

export interface FlashFigure {
  /** "2026-11". */
  month: string;
  /** The annual rate of the all-items CPI in the INE's flash estimate, as printed. */
  value: number;
  /** The day the INE published it. */
  published: string;
  /** The INE press release. */
  url: string;
}

/** Fill on 27 Nov 2026 from the INE's press release (indicador adelantado del IPC, noviembre 2026). */
export const NOVEMBER_FLASH: FlashFigure | null = null;

export interface OfficialMinimum {
  id: MinimumId;
  /** Annual amounts in 14 payments; null where the BOE table leaves the cell empty. */
  spouse: number | null;
  single: number;
  spouseNotDependent: number | null;
}

export interface Official2027 {
  /** The general revaluation percentage the norm states. */
  percent: number;
  /** "Real Decreto-ley 1/2027, de …". */
  norm: string;
  /** "BOE-A-2027-…". */
  boeId: string;
  /** BOE publication day. */
  published: string;
  url: string;
  /** The 2027 minimum pensions table, when the norm (or a later one) has it. */
  minimums: OfficialMinimum[] | null;
  /** Non-contributory retirement and invalidity pension, annual, when published. */
  pncAnnual: number | null;
}

/** Fill when the BOE publishes the 2027 revaluation norm; a test fails from 1 Feb 2027 while it is null. */
export const OFFICIAL_2027: Official2027 | null = null;
/** From this day a test fails while OFFICIAL_2027 is null. */
export const OFFICIAL_DUE = "2027-02-01";

/* -------------------------------------------------------------------------- */
/* The law, quoted                                                            */
/* -------------------------------------------------------------------------- */

export const QUOTE = {
  /** LGSS art. 58.2 (in force since 1 Jan 2024, RDL 2/2023). */
  art58_2:
    "todas las pensiones de Seguridad Social, en su modalidad contributiva, incluido el complemento de brecha de género, se revalorizarán al comienzo de cada año en el porcentaje equivalente al valor medio de las tasas de variación interanual expresadas en tanto por ciento del Índice de Precios al Consumo de los doce meses previos a diciembre del año anterior.",
  /** LGSS art. 58.3. */
  art58_3: "Si el valor medio al que se refiere el apartado anterior fuera negativo, el importe de las pensiones no variará al comienzo del año.",
  /** LGSS art. 58.2, second paragraph. */
  art58_2b:
    "En ese mismo porcentaje se actualizarán anualmente en la correspondiente Ley de Presupuestos Generales del Estado la cuantía máxima de las pensiones a que se refiere el artículo 57 y la cuantía mínima de las pensiones prevista en el artículo 59.",
  /** LGSS art. 62. */
  art62:
    "Las pensiones no contributivas de la Seguridad Social serán actualizadas en la correspondiente Ley de Presupuestos Generales del Estado, al menos, en el mismo porcentaje que dicha ley establezca como incremento general de las pensiones contributivas de la Seguridad Social.",
  /** LGSS DA 53ª.2, last step. */
  da53_2027:
    "El 1 de enero de 2027 la cuantía de referencia se incrementará adicionalmente, si ello fuese necesario, hasta alcanzar el umbral de pobreza calculado para un hogar de dos adultos.",
  /** LGSS DA 53ª.6. */
  da53_6: "La determinación de las cuantías a las que se refieren los apartados anteriores se efectuarán por las respectivas leyes presupuestos generales del Estado para cada año.",
  /** RDL 3/2026, art. 2.1. */
  rdl3_2026: "se revalorizarán en 2026 con carácter general el 2,7 por ciento respecto del importe que tuvieran a 31 de diciembre de 2025",
  /** RDL 3/2026, preamble: how the percentage was expressed. */
  rdl3_decimal: "expresado con un decimal, resultando un 2,7 por ciento",
  /** LGSS 1994 art. 48.1.2 (wording of Ley 24/1997, replaced by Ley 23/2013): the old deviation payment. */
  oldArt48: "se les abonará la diferencia en un pago único, antes del 1 de abril del ejercicio posterior",
} as const;

/* -------------------------------------------------------------------------- */
/* 2026 figures (RDL 3/2026 and RD 241/2026)                                  */
/* -------------------------------------------------------------------------- */

/** RDL 3/2026 art. 2.1: «el 2,7 por ciento». */
export const REVALUATION_2026 = 2.7;
/** RDL 3/2026 art. 1 / RD 241/2026 art. 3: «3.359,60 euros mensuales o 47.034,40 euros anuales». */
export const MAX_PENSION_2026 = { monthly: 3359.6, annual: 47_034.4 } as const;
/** RDL 3/2026 art. 2.2: brecha de género «36,90 euros mensuales». */
export const GENDER_GAP_2026 = 36.9;
/** RDL 3/2026 art. 2.5 / RD 241/2026 art. 21.1: non-contributory retirement and invalidity «8.803,20 euros anuales». */
export const PNC_2026_ANNUAL = 8803.2;
/** RD 241/2026 art. 21.2: rent supplement for non-contributory pensioners «525,00 euros anuales». */
export const PNC_RENT_SUPPLEMENT_2026 = 525;
/** RD 241/2026 anexo I: «Límite de ingresos para el reconocimiento de cuantías mínimas de pensión: – Sin cónyuge a cargo 9.442,00 euros/año. – Con cónyuge a cargo 11.013,00 euros/año.» */
export const MINIMUM_INCOME_LIMIT_2026 = { single: 9442, spouse: 11_013 } as const;
/** Pensions are paid in 14 payments (12 + June and November). */
export const PAYMENTS = 14;

export type MinimumId =
  | "ret65"
  | "retUnder65"
  | "ret65Gi"
  | "ipGi"
  | "ipAbs"
  | "ipTotal65"
  | "ipTotal60"
  | "ipTotalUnder60"
  | "widowCharges"
  | "widow65"
  | "widow60"
  | "widowUnder60"
  | "orphan"
  | "family";

export type MinimumGroup = "retirement" | "invalidity" | "widow" | "other";

export interface Minimum2026 extends OfficialMinimum {
  group: MinimumGroup;
}

/**
 * RD 241/2026 anexo I (= RDL 3/2026 anexo I), «Cuadro de cuantías mínimas
 * de las pensiones de la modalidad contributiva para el año 2026», euros a
 * year: con cónyuge a cargo / sin cónyuge (unidad económica unipersonal) /
 * con cónyuge no a cargo. Monthly = annual ÷ 14.
 */
export const MINIMUMS_2026: readonly Minimum2026[] = [
  { id: "ret65", group: "retirement", spouse: 17_592.4, single: 13_106.8, spouseNotDependent: 12_441.8 },
  { id: "retUnder65", group: "retirement", spouse: 17_592.4, single: 12_262.6, spouseNotDependent: 11_590.6 },
  { id: "ret65Gi", group: "retirement", spouse: 26_385.8, single: 19_660.2, spouseNotDependent: 18_662 },
  { id: "ipGi", group: "invalidity", spouse: 26_385.8, single: 19_660.2, spouseNotDependent: 18_662 },
  { id: "ipAbs", group: "invalidity", spouse: 17_592.4, single: 13_106.8, spouseNotDependent: 12_441.8 },
  { id: "ipTotal65", group: "invalidity", spouse: 17_592.4, single: 13_106.8, spouseNotDependent: 12_441.8 },
  { id: "ipTotal60", group: "invalidity", spouse: 17_592.4, single: 12_262.6, spouseNotDependent: 11_590.6 },
  { id: "ipTotalUnder60", group: "invalidity", spouse: 9662.8, single: 9662.8, spouseNotDependent: 9580.2 },
  { id: "widowCharges", group: "widow", spouse: null, single: 17_592.4, spouseNotDependent: null },
  { id: "widow65", group: "widow", spouse: null, single: 13_106.8, spouseNotDependent: null },
  { id: "widow60", group: "widow", spouse: null, single: 12_262.6, spouseNotDependent: null },
  { id: "widowUnder60", group: "widow", spouse: null, single: 9931.6, spouseNotDependent: null },
  { id: "orphan", group: "other", spouse: null, single: 4011, spouseNotDependent: null },
  { id: "family", group: "other", spouse: null, single: 4011, spouseNotDependent: null },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export interface Norm {
  name: string;
  ref: string;
  url: string;
}

export const NORMS = {
  lgss58: { name: "Ley General de la Seguridad Social, art. 58", ref: "RDLeg 8/2015, texto consolidado", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a58" },
  lgss62: { name: "Ley General de la Seguridad Social, art. 62", ref: "RDLeg 8/2015, texto consolidado", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a62" },
  lgssDa53: { name: "Ley General de la Seguridad Social, disposición adicional 53ª", ref: "RDLeg 8/2015, texto consolidado", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#da-29" },
  ley21: { name: "Ley 21/2021, de garantía del poder adquisitivo de las pensiones", ref: "BOE-A-2021-21652", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652" },
  rdl3: { name: "Real Decreto-ley 3/2026, revalorización de las pensiones públicas", ref: "BOE-A-2026-2548, BOE 4 feb 2026", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548" },
  rd241: { name: "Real Decreto 241/2026, revalorización de las pensiones para 2026", ref: "BOE-A-2026-6977, BOE 26 mar 2026", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-6977" },
  pge2023: { name: "Ley 31/2022, PGE 2023, disposición adicional 90ª (IPREM)", ref: "BOE-A-2022-22128", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128" },
  lgss1994: { name: "LGSS de 1994, art. 48 (redacción anterior a 2014)", ref: "BOE-A-1994-14960", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-14960" },
} as const satisfies Record<string, Norm>;
export type NormId = keyof typeof NORMS;

export const OFFICIAL_LINKS = {
  ssRevaluation: "https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Revalorizacion",
  ineCalendar: "https://www.ine.es/daco/daco41/calen.htm",
  ineIpc: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802&menu=ultiDatos&idp=1254735976607",
  imsersoPnc: "https://imserso.es/el-imserso/documentacion/estadisticas/pensiones-no-contributivas-jubilacion-incapacidad-pnc",
} as const;
