/**
 * Every figure the net salary calculator uses for 2026, each with its source.
 * Nothing numeric is typed anywhere else: the engine, the page's words and
 * the tables read from here.
 *
 * ## IRPF withholding (retención)
 *
 * The AEAT's "Algoritmo de cálculo del tipo de retención a cuenta del IRPF
 * para los rendimientos del trabajo personal. Ejercicio 2026", in two
 * versions on https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml
 * (both downloaded and read on 13 Nov 2026):
 *  - 1 January to 9 September 2026 (dated 09-09-2026, ALGORITMO_2026.pdf);
 *  - from 10 September 2026 (dated 10-09-2026,
 *    "Algoritmo Retenciones-2026_10sept.pdf").
 * The only change between them is Real Decreto-ley 23/2026 (BOE 9 Sep 2026,
 * in force 10 Sep): residents of the island of La Palma get the Ceuta and
 * Melilla treatment again for 2026 (cuota × 0.40). Every other figure is the
 * same in both, so a mainland result is right for the whole year.
 *
 * The algorithm applies ONE scale (its "Tabla 2", art. 101.1 LIRPF) whatever
 * the common-regime community: the regional IRPF scales only come in with
 * the annual return (Renta). Navarra and the three Basque provinces apply
 * their own foral withholding tables; the calculator does not model them.
 *
 * ## Social Security (worker's share)
 *
 * Orden PJC/297/2026, de 30 de marzo (BOE núm. 79, 31 Mar 2026,
 * BOE-A-2026-7296; consolidated text read on 13 Nov 2026): arts. 2, 3, 4,
 * 16, 17 and 33.
 *
 * Validated on 13 Nov 2026 against the AEAT's own retention service
 * (tests/fixtures/net-salary-aeat-2026.json, tests/net-salary.test.ts).
 */

/** The tax year these rules are for. */
export const SALARY_RULES_YEAR = 2026;
/** When every source below was last read in full. */
export const SALARY_RULES_AS_OF = "2026-11-13";
/** From this date the 2027 algorithm and contribution order apply: a test fails until they are loaded. */
export const SALARY_RULES_UNTIL = "2027-01-01";

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** Publication or version date (ISO). */
  date: string;
}

export const SOURCES = {
  algorithm: {
    name: "Algoritmo de cálculo del tipo de retención a cuenta del IRPF para los rendimientos del trabajo personal. Ejercicio 2026 (a partir del 10 de septiembre)",
    ref: "AEAT, versión 10-09-2026",
    url: "https://sede.agenciatributaria.gob.es/static_files/Sede/Programas_ayuda/Retenciones/2026/Algoritmo%20Retenciones-2026_10sept.pdf",
    date: "2026-09-10",
  },
  algorithmJanuary: {
    name: "Algoritmo de cálculo del tipo de retención a cuenta del IRPF para los rendimientos del trabajo personal. Ejercicio 2026 (1 de enero a 9 de septiembre)",
    ref: "AEAT, versión 09-09-2026",
    url: "https://sede.agenciatributaria.gob.es/static_files/Sede/Programas_ayuda/Retenciones/2026/ALGORITMO_2026.pdf",
    date: "2026-09-09",
  },
  retentionsPage: {
    name: "Agencia Tributaria: Retenciones",
    ref: "sede.agenciatributaria.gob.es",
    url: "https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml",
    date: "2026-09-10",
  },
  contributions: {
    name: "Orden PJC/297/2026, de 30 de marzo, por la que se desarrollan las normas legales de cotización a la Seguridad Social, desempleo, protección por cese de actividad, Fondo de Garantía Salarial y formación profesional para el ejercicio 2026",
    ref: "BOE-A-2026-7296",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296",
    date: "2026-03-31",
  },
  laPalma: {
    name: "Real Decreto-ley 23/2026, de 8 de septiembre (isla de La Palma)",
    ref: "BOE-A-2026-18828",
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-18828",
    date: "2026-09-09",
  },
} as const satisfies Record<string, Source>;

/**
 * The check against the AEAT's own calculation (the retention web service
 * it offers payroll software, PRET-R200, no login): the same inputs, rate and
 * annual amount equal in every case. The cases are
 * tests/fixtures/net-salary-aeat-2026.json (a test holds the count).
 */
export const AEAT_VALIDATION = { date: "2026-11-13", cases: 39 } as const;

/** The foral systems the calculator does not model, with their official withholding pages (checked 13 Nov 2026). */
export const FORAL_LINKS = {
  navarra: [{ name: "Hacienda Foral de Navarra: cálculo de retenciones por rendimientos del trabajo", url: "https://www.navarra.es/es/tramites/on/-/line/Calculo-de-retenciones-por-rendimientos-del-trabajo" }],
  "pais-vasco": [
    { name: "Bizkaia: retenciones de trabajo", url: "https://www.bizkaia.eus/es/normativa-tributaria/retenciones-de-trabajo" },
    { name: "Gipuzkoa: Hacienda Foral", url: "https://www.gipuzkoa.eus/es/web/ogasuna" },
    { name: "Araba/Álava: Hacienda Foral", url: "https://web.araba.eus/es/hacienda" },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* IRPF: AEAT algorithm 2026                                                  */
/* -------------------------------------------------------------------------- */

export const IRPF = {
  /** "OTROS GASTOS", page 21: GASTOSGEN, INCREGASMOVIL, INCREGASDISTRA. */
  otherExpenses: 2000,
  mobilityExpenses: 2000,
  disabilityExpenses33: 3500,
  /** ≥ 65 %, or 33–65 % needing help or with reduced mobility. */
  disabilityExpenses65: 7750,

  /** Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF, art. 83.3.d RIRPF), page 22. */
  workReduction: {
    full: 7302,
    upTo: 14852,
    /** 14,852 < RNT ≤ 17,673.52: 7,302 − 1.75 × (RNT − 14,852). */
    secondTo: 17673.52,
    secondSlope: 1.75,
    /** 17,673.52 < RNT < 19,747.50: 2,364.34 − 1.14 × (RNT − 17,673.52). */
    thirdBase: 2364.34,
    thirdTo: 19747.5,
    thirdSlope: 1.14,
  },

  /** "REDUCCIÓN MAS DE DOS DESCENDIENTES", page 22. */
  moreThanTwoChildren: 600,

  /** Mínimo personal y familiar, pages 23-27. */
  personalMinimum: 5550,
  over65: 1150,
  over75: 1400,
  /** First, second, third, fourth and later descendant (× 1 or × 0.5). */
  childMinimum: [2400, 2700, 4000, 4500] as const,
  /** Each descendant under 3 (born after 2023). */
  childUnder3: 2800,
  disabilityMinimum33: 3000,
  disabilityMinimum65: 9000,
  /** Gastos de asistencia: ≥ 65 %, or 33–65 % with reduced mobility. */
  assistance: 3000,

  /**
   * TABLA 1, page 28: annual pay at or under which there is no withholding
   * (art. 81 RIRPF, RD 142/2024), by family situation and descendants (0, 1, 2 or more).
   * Situation 1 needs at least one descendant.
   */
  exemptUpTo: {
    1: [null, 17644, 18694],
    2: [17197, 18130, 19262],
    3: [15876, 16342, 16867],
  } as const satisfies Record<1 | 2 | 3, readonly (number | null)[]>,

  /** TABLA 2, page 29: "ESCALA DE RETENCIÓN" (art. 101.1 LIRPF). [from, cuota at from, rate %]. */
  scale: [
    [0, 0, 19],
    [12450, 2365.5, 24],
    [20200, 4225.5, 30],
    [35200, 8725.5, 37],
    [60000, 17901.5, 45],
    [300000, 125901.5, 47],
  ] as const,

  /** Límite del 43 % (art. 85.3 RIRPF), page 30: only for pay ≤ 35,200. */
  limitRate: 0.43,
  limitPayUpTo: 35200,

  /** Ceuta, Melilla (and La Palma from 10 Sep 2026): DIFERENCIA POSITIVA = CUOTA × 0.40, page 31. */
  ceutaFactor: 0.4,

  /** Housing loan before 2013 (RD 1975/2008), page 31: 2 % of pay when pay < 33,007.20. */
  housingRate: 0.02,
  housingPayUnder: 33007.2,

  /** Minimum rate, page 32: contracts or relations of less than a year. */
  minRateShortContract: 2,
} as const;

/* -------------------------------------------------------------------------- */
/* Social Security: Orden PJC/297/2026                                        */
/* -------------------------------------------------------------------------- */

export const SOCIAL_SECURITY = {
  /** Art. 2.1 and art. 3: tope máximo / base máxima, euros a month. */
  maxBaseMonthly: 5101.2,
  /** Art. 3: base mínima of groups 4 to 7 (and 47.48 €/day for 8 to 11, × 30 = the same). Groups 1-3 are higher. */
  minBaseMonthly: 1424.4,
  /** Worker's share, in %. */
  rates: {
    /** Art. 4.a: contingencias comunes 28.30, of which 4.70 the worker. */
    commonContingencies: 4.7,
    /** Art. 33.2.a.1º: open-ended contracts (also fixed-discontinuous, part-time, relief, substitution), 7.05 of which 1.55 the worker. */
    unemploymentOpenEnded: 1.55,
    /** Art. 33.2.a.2º: fixed-term contracts, 8.30 of which 1.60 the worker. */
    unemploymentFixedTerm: 1.6,
    /** Art. 33.2.c: formación profesional 0.70, of which 0.10 the worker. */
    vocationalTraining: 0.1,
    /** Art. 16: mecanismo de equidad intergeneracional 0.90, of which 0.15 the worker. */
    intergenerationalEquity: 0.15,
    /** The whole MEI rate (employer + worker), for the page's words. */
    intergenerationalEquityTotal: 0.9,
  },
  /**
   * Art. 17: cotización adicional de solidaridad on the monthly pay above the
   * maximum base; worker's share per band. [band upper limit in €/month, worker rate %].
   * 5,101.21–5,611.32: 0.19; 5,611.33–7,651.80: 0.21; above 7,651.80: 0.24.
   */
  solidarity: [
    [5611.32, 0.19],
    [7651.8, 0.21],
    [Infinity, 0.24],
  ] as const,
} as const;
