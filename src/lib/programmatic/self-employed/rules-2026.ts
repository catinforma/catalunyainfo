import { SMI_2026 } from "@/lib/programmatic/smi/rules";

/**
 * Every figure the self-employed contributions calculator ("cuota de
 * autónomos") uses for 2026, each with its source. Nothing numeric is typed
 * anywhere else: the engine, the page and the tests read from here.
 *
 * ## Which instrument fixed the 2026 tables
 *
 * Real Decreto-ley 13/2022 (disposición transitoria primera) set the tables of
 * net-earnings bands ("tramos de rendimientos netos") for 2023, 2024 and 2025
 * only; from 2026 LGSS art. 308.1 leaves them to each year's budget law (Ley
 * de Presupuestos Generales del Estado). There is no 2026 budget law (the 2023
 * one is rolled over), so:
 *  - Real Decreto-ley 3/2026, de 3 de febrero (BOE núm. 31, 4 Feb 2026,
 *    BOE-A-2026-2548; convalidated by Resolución de 26 de febrero de 2026,
 *    BOE-A-2026-4668), art. 3.4, keeps the 2025 tables "desde el 1 de enero de
 *    2026 y hasta la aprobación de la correspondiente Ley de Presupuestos",
 *    raising only the maximum base of bands 11 and 12 to the general cap
 *    (5.101,20 €). Its art. 3.2 sets the MEI at 0,90 points.
 *  - Orden PJC/297/2026, de 30 de marzo (BOE núm. 79, 31 Mar 2026,
 *    BOE-A-2026-7296), art. 18, prints the resulting 2026 tables and the
 *    rates; art. 37.5 and 37.6 the cessation (cese de actividad) and
 *    vocational-training rates. Consolidated text read on 13 Nov 2026 (no
 *    later amendment).
 *
 * ## 2027
 *
 * Nothing official on 13 Nov 2026: no 2027 budget law, no royal decree-law
 * and no contribution order with 2027 tables (BOE; the LGSS consolidated text
 * of 11 Nov 2026 still sends art. 308.1 to the budget law). The only 2027
 * figure fixed by law is the MEI: 1 point (LGSS, disposición transitoria
 * cuadragésima tercera). The page says "pendiente"; `RULES_UNTIL` makes a
 * test fail on 1 Jan 2027 and `STATUS_2027_RECHECK_BY` earlier.
 *
 * ## Read on 13 Nov 2026
 *
 * The four BOE texts below (consolidated), the Seguridad Social pages on the
 * self-employed contribution system and its 2026 bases, and the TGSS
 * "Guía de trabajo autónomo" on Import@ss (2026 figures: bases, the 31,50 %
 * breakdown, the tarifa plana total with MEI).
 */

export const RULES_YEAR = 2026;
/** When every source below was last read in full. */
export const RULES_AS_OF = "2026-11-13";
/** From this day the 2027 rules apply: a test fails until they are loaded (or the page says why not). */
export const RULES_UNTIL = "2027-01-01";
/** Re-read the BOE for 2027 tables (a royal decree-law in late December is how 2026's came): a test fails from this day. */
export const STATUS_2027_RECHECK_BY = "2026-12-15";

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** Publication or version date (ISO). */
  date: string;
}

export const SOURCES = {
  order: {
    name: "Orden PJC/297/2026, de 30 de marzo, por la que se desarrollan las normas legales de cotización a la Seguridad Social, desempleo, protección por cese de actividad, Fondo de Garantía Salarial y formación profesional para el ejercicio 2026",
    ref: "BOE-A-2026-7296, arts. 18 y 37",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296#a1-10",
    date: "2026-03-31",
  },
  rdl3: {
    name: "Real Decreto-ley 3/2026, de 3 de febrero, para la revalorización de las pensiones públicas y otras medidas urgentes en materia de Seguridad Social",
    ref: "BOE-A-2026-2548, art. 3; convalidado (BOE-A-2026-4668)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548",
    date: "2026-02-04",
  },
  rdl13: {
    name: "Real Decreto-ley 13/2022, de 26 de julio, por el que se establece un nuevo sistema de cotización para los trabajadores por cuenta propia o autónomos y se mejora la protección por cese de actividad",
    ref: "BOE-A-2022-12482",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-12482",
    date: "2022-07-27",
  },
  lgss: {
    name: "Texto refundido de la Ley General de la Seguridad Social, art. 308 (cotización y regularización) y disposición transitoria cuadragésima tercera (MEI)",
    ref: "BOE-A-2015-11724, actualización del 11-11-2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724",
    date: "2026-11-11",
  },
  leta: {
    name: "Ley 20/2007, de 11 de julio, del Estatuto del trabajo autónomo, art. 38 ter (tarifa plana)",
    ref: "BOE-A-2007-13409",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409",
    date: "2026-09-02",
  },
  tgssGuide: {
    name: "Tesorería General de la Seguridad Social: Guía de trabajo autónomo (Import@ss)",
    ref: "portal.seg-social.gob.es",
    url: "https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/trabajo+autonomo/guia",
    date: "2026-11-13",
  },
  ssSystem: {
    name: "Seguridad Social: Sistema de cotización para autónomos",
    ref: "seg-social.es",
    url: "https://www.seg-social.es/wps/portal/wss/internet/HerramientasWeb/9d2fd4f1-ab0f-42a6-8d10-2e74b378ee24",
    date: "2026-11-13",
  },
} as const satisfies Record<string, Source>;

/** The Seguridad Social's own tools, linked from the page. */
export const OFFICIAL_LINKS = {
  simulator: "https://portal.seg-social.gob.es/wps/portal/importass/importass/tramites/simuladorRETAPublico",
  baseChange: "https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/Altas%2C+bajas+y+modificaciones/Bajas+y+modificaciones/BCRendimientos",
  registration: "https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/Altas%2C+bajas+y+modificaciones/Altas+y+afiliacion+de+trabajadores/Alta_trabajo_autonomo",
  importass: "https://portal.seg-social.gob.es/wps/portal/importass/importass",
} as const;

/* -------------------------------------------------------------------------- */
/* The 2026 tables (Orden PJC/297/2026, art. 18.1)                            */
/* -------------------------------------------------------------------------- */

export type TableKind = "reduced" | "general";

export interface Band {
  table: TableKind;
  /** "Tramo 1" … within its table. */
  n: number;
  /** Monthly average net earnings: the band ends at `upTo` (null: no ceiling). */
  upTo: number | null;
  /** True for "≤ upTo", false for "< upTo" (only reduced band 3: "< 1.166,70"). */
  upToInclusive: boolean;
  /** Euros a month. */
  minBase: number;
  maxBase: number;
}

/**
 * "Tramos de rendimientos netos 2026", art. 18.1, in order. Each band starts
 * just above the previous one's ceiling (general band 1 at "≥ 1.166,70").
 */
export const BANDS_2026: readonly Band[] = [
  { table: "reduced", n: 1, upTo: 670, upToInclusive: true, minBase: 653.59, maxBase: 718.94 },
  { table: "reduced", n: 2, upTo: 900, upToInclusive: true, minBase: 718.95, maxBase: 900 },
  { table: "reduced", n: 3, upTo: 1166.7, upToInclusive: false, minBase: 849.67, maxBase: 1166.7 },
  { table: "general", n: 1, upTo: 1300, upToInclusive: true, minBase: 950.98, maxBase: 1300 },
  { table: "general", n: 2, upTo: 1500, upToInclusive: true, minBase: 960.78, maxBase: 1500 },
  { table: "general", n: 3, upTo: 1700, upToInclusive: true, minBase: 960.78, maxBase: 1700 },
  { table: "general", n: 4, upTo: 1850, upToInclusive: true, minBase: 1143.79, maxBase: 1850 },
  { table: "general", n: 5, upTo: 2030, upToInclusive: true, minBase: 1209.15, maxBase: 2030 },
  { table: "general", n: 6, upTo: 2330, upToInclusive: true, minBase: 1274.51, maxBase: 2330 },
  { table: "general", n: 7, upTo: 2760, upToInclusive: true, minBase: 1356.21, maxBase: 2760 },
  { table: "general", n: 8, upTo: 3190, upToInclusive: true, minBase: 1437.91, maxBase: 3190 },
  { table: "general", n: 9, upTo: 3620, upToInclusive: true, minBase: 1519.61, maxBase: 3620 },
  { table: "general", n: 10, upTo: 4050, upToInclusive: true, minBase: 1601.31, maxBase: 4050 },
  { table: "general", n: 11, upTo: 6000, upToInclusive: true, minBase: 1732.03, maxBase: 5101.2 },
  { table: "general", n: 12, upTo: null, upToInclusive: true, minBase: 1928.1, maxBase: 5101.2 },
];

/** "la base máxima de cotización será de 5.101,20 euros mensuales" (art. 18.1). */
export const MAX_BASE = 5101.2;
/** The lowest base of either table (reduced band 1). */
export const MIN_BASE = BANDS_2026[0]!.minBase;

/* -------------------------------------------------------------------------- */
/* Rates                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Percent of the chosen base. Common and professional contingencies and MEI:
 * Orden PJC/297/2026 art. 18.2 a), b), c); cessation and vocational training:
 * art. 37.5 a) and 37.6. Total 31,50 % (the TGSS guide lists the same five
 * items).
 */
export const RATES = {
  commonContingencies: 28.3,
  professionalContingencies: 1.3,
  cessation: 0.9,
  vocationalTraining: 0.1,
  intergenerationalEquity: 0.9,
} as const;

export type RateKey = keyof typeof RATES;
export const RATE_KEYS: readonly RateKey[] = ["commonContingencies", "professionalContingencies", "cessation", "vocationalTraining", "intergenerationalEquity"];
export const TOTAL_RATE = Math.round(RATE_KEYS.reduce((s, k) => s + RATES[k], 0) * 100) / 100;

/* -------------------------------------------------------------------------- */
/* Net earnings for the bands (LGSS art. 308.1.c)                             */
/* -------------------------------------------------------------------------- */

/**
 * "Deducción por gastos genéricos" (LGSS art. 308.1.c, regla 2.ª): 7 %, or 3 %
 * for the people of art. 305.2 b) and e) (company partners and directors:
 * ≥ 33 % of the capital, or a director with ≥ 25 %; partners of sociedades
 * laborales), once they have been registered for 90 days in the year.
 */
export const GENERIC_EXPENSES = { general: 7, corporate: 3 } as const;

/**
 * Corporate self-employed (art. 305.2 b, e) cannot choose a base below the
 * General Regime minimum of contribution group 7 (LGSS art. 308.1.a, regla
 * 4.ª; RDL 13/2022 DT 7.ª: from 2026), which is 1.424,40 € in 2026 (Orden
 * PJC/297/2026, art. 3); the definitive base at regularisation can't be lower
 * either. Art. 18.4 lets those already registered keep their 2025
 * provisional base during 2026 (the TGSS guide: "no inferior a 1.000 euros"),
 * but the regularisation applies 1.424,40 €.
 */
export const CORPORATE_MIN_BASE = 1424.4;
export const CORPORATE_LEGACY_PROVISIONAL_BASE = 1000;

/* -------------------------------------------------------------------------- */
/* Tarifa plana (Ley 20/2007, art. 38 ter)                                    */
/* -------------------------------------------------------------------------- */

/**
 * The reduced flat fee for a first registration (or none in the previous two
 * years; three if the reduction was used before): 80 € a month for the 12
 * full calendar months after registering, without cessation or vocational
 * training (art. 38 ter.1). 80 € comes from RDL 13/2022 DT 5.ª for 2023–2025;
 * for 2026 the TGSS guide states the same 80 € plus the MEI: "Al importe de la
 * tarifa plana hay que añadirle la cotización correspondiente al Mecanismo de
 * Equidad Intergeneracional (0,9%), ascendiendo a un total de 88,64€." We
 * print the TGSS total as published; we do not recompute it.
 *
 * Second period (art. 38 ter.2 and .3): 12 more months if the year's net
 * earnings (art. 308.1.c terms) are below the annual minimum wage, asked for
 * before it starts with a declaration; regularised if they turn out higher
 * (art. 38 ter.6). Disability ≥ 33 %, gender-violence or terrorism victims:
 * 24 + 36 months (art. 38 ter.10).
 */
export const FLAT_RATE = {
  fee: 80,
  /** "ascendiendo a un total de 88,64€" (TGSS guide, read 13 Nov 2026). */
  totalWithMei: 88.64,
  firstMonths: 12,
  secondMonths: 12,
  specialFirstMonths: 24,
  specialSecondMonths: 36,
  /** Years without being registered (three if it was used before). */
  yearsOut: 2,
  yearsOutIfUsedBefore: 3,
} as const;

/** The annual minimum wage the second period is measured against: 2026, RD 126/2026 (17.094 €). */
export const SMI_ANNUAL = SMI_2026.annual;

/* -------------------------------------------------------------------------- */
/* Regularisation (LGSS art. 308.1.c, reglas 3.ª y 4.ª)                       */
/* -------------------------------------------------------------------------- */

/** "antes del 30 de abril del ejercicio siguiente" to the tax data reaching the TGSS: refunds. */
export const REFUND_BEFORE = "30 April";
/** Base changes: up to six a year, effective 1 Mar, 1 May, 1 Jul, 1 Sep, 1 Nov and 1 Jan (TGSS guide). */
export const BASE_CHANGE_DATES_2026 = ["2026-03-01", "2026-05-01", "2026-07-01", "2026-09-01", "2026-11-01", "2027-01-01"] as const;

/* -------------------------------------------------------------------------- */
/* 2027                                                                       */
/* -------------------------------------------------------------------------- */

export interface Status2027 {
  /** The 2027 tables once a law, royal decree-law or contribution order prints them; null until then. */
  bands: readonly Band[] | null;
  /** The instrument that fixed them. */
  source: Source | null;
  /** MEI 2027, already in the LGSS (DT 43.ª): "En el año 2027, será de 1 punto porcentual". */
  intergenerationalEquity: number;
}

export const STATUS_2027: Status2027 = {
  bands: null,
  source: null,
  intergenerationalEquity: 1,
};

/* -------------------------------------------------------------------------- */
/* Quotes, as printed in the BOE (Spanish), for the page                      */
/* -------------------------------------------------------------------------- */

export const QUOTE = {
  rdl3art34:
    "Desde el 1 de enero de 2026, y hasta la aprobación de la correspondiente Ley de Presupuestos Generales del Estado, la tabla general y la tabla reducida aplicables a los diferentes tramos de rendimientos netos, para las personas trabajadoras incluidas en el Régimen Especial de la Seguridad Social de los Trabajadores por Cuenta Propia o Autónomos, serán las previstas en la disposición transitoria primera del Real Decreto-ley 13/2022, de 26 de julio, […] para el año 2025",
  lgss308deduction:
    "A los rendimientos indicados en la regla anterior se les aplicará una deducción por gastos genéricos del 7 por ciento, salvo en el caso de las personas trabajadoras por cuenta propia o autónomas incluidos en este régimen especial al amparo de lo establecido en las letras b) y e) del artículo 305.2 de esta ley, en que la deducción será del 3 por ciento.",
  leta38ter1:
    "Con carácter general, se aplicará una cuota reducida por contingencias comunes y profesionales, a contar desde la fecha de efectos del alta y durante los doce meses naturales completos siguientes, quedando los trabajadores excepcionados de cotizar por cese de actividad y por formación profesional.",
  tgssFlatRate:
    "Al importe de la tarifa plana hay que añadirle la cotización correspondiente al Mecanismo de Equidad Intergeneracional (0,9%), ascendiendo a un total de 88,64€.",
  lgssMei2027: "En el año 2027, será de 1 punto porcentual, del que el 0,83 corresponderá a la empresa y el 0,17 al trabajador.",
} as const;
