/**
 * Every rule of "¿A qué edad me puedo jubilar?" (lib/programmatic/retirement-age/),
 * each with its source. Nothing numeric is typed anywhere else: the engine,
 * the page and the tests read from here. Client-safe: no data files, no
 * server code.
 *
 * ## Read on 18 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, Real Decreto Legislativo 8/2015, texto refundido de la Ley General
 *    de la Seguridad Social (BOE-A-2015-11724), consolidated text "Última
 *    actualización publicada el 11/11/2026":
 *      art. 205.1.a (67, or 65 with 38 years and 6 months; full years and
 *      months, no extra-pay share) and 205.1.b (15 years, 2 of them in the
 *      last 15);
 *      disposición transitoria séptima (the phase-in table 2013–2027, typed
 *      below cell by cell as the BOE prints it);
 *      art. 207 (involuntary early retirement: up to 4 years before, 6
 *      months as a job seeker, 33 years, the causes; monthly coefficients
 *      table, 48 rows, wording of Ley 21/2021, in force 1 Jan 2022) and
 *      art. 208 (voluntary: up to 2 years before, 35 years, pension above
 *      the minimum; 24-row table; 208.3 subsidy rule) — the coefficients
 *      are per MONTH or fraction of a month since Ley 21/2021, not per
 *      quarter; the quarter survives only in art. 210.4 (the cap on the
 *      maximum pension, 0.50 % per quarter);
 *      art. 210.2 as worded by RDL 11/2024 (in force 1 Apr 2025): 4 % per
 *      full year after the ordinary age, 2 % for more than 6 months from
 *      the second full year; the lump-sum formula is an image in the BOE
 *      (not computed here);
 *      arts. 206, 206 bis (activity and disability: lower ages by royal
 *      decree, never below 52), 214 (jubilación activa: 45/55/65/80/100 %),
 *      215 (partial: up to 3 years before with a relief contract, 33
 *      years) and 318.d (self-employed: art. 207 is not in the list).
 *  - Seguridad Social, "Jubilación ordinaria – Requisitos": the same table,
 *    months counted "de fecha a fecha" from the birth date (last day of the
 *    month when the day does not exist), 365-day years and 30.41666-day
 *    months, childcare and birth periods counted.
 *  - Seguridad Social, early retirement pages (cese no voluntario / voluntad
 *    del trabajador) and "Cuantía" (complemento por demora).
 *  - Revista de la Seguridad Social, 30/09/2026: the "Informe de edad legal
 *    de jubilación" in Tu Seguridad Social assumes "que la situación laboral
 *    actual de la persona se mantiene" — the same premise as the
 *    "keep contributing" switch here; the official simulator
 *    (prestaciones.seg-social.es) needs identification by SMS.
 *  - Revista, 25/09/2026 and 27/05/2025: Real Decreto 416/2026 (BOE-A-2026-
 *    11474, in force 28 Aug 2026) regulates flexible retirement and the
 *    mixed delay option (RD 371/2023); it does not touch the 4 % / 2 %.
 *
 * ## Readings (where the text leaves room)
 *
 *  - The year of the table is the year in which the age is reached: the
 *    ordinary date is the first day on which the person's age is at least
 *    the one the table asks for that day's year (the Seguridad Social prints
 *    a single "edad legal ordinaria … y la fecha en la que alcanzará esa
 *    edad").
 *  - Early retirement: the reference ordinary age assumes contributions
 *    continue from the early date (arts. 207.2 and 208.2, last paragraphs).
 *  - Delay: the extra 2 % for more than 6 months counts only once two full
 *    years of delay are complete ("A partir del segundo año completo"): the
 *    stricter reading; the Revista's example (2 years 7 months = 10 %) fits.
 *
 * ## Do not print
 *
 * A pension amount (it needs the person's own contribution bases, 25+
 * years); the lump-sum delay amount (formula published as an image); ages
 * reduced by activity or disability (each royal decree has its own table);
 * the pre-2013 legislation (DT 4ª) as a computed case.
 *
 * A test fails from RULES_UNTIL (1 Jan 2027, the day the table's last row,
 * 38 years 6 months / 67, starts to apply): re-read the LGSS consolidated
 * text (its "última actualización"), DT 7ª, arts. 207, 208 and 210 and the
 * Seguridad Social pages, then move RULES_AS_OF and RULES_UNTIL.
 */

export const RULES_AS_OF = "2026-11-18";
/** From this day a test fails: re-read the rules (the 2027 row of DT 7ª starts on it). */
export const RULES_UNTIL = "2027-01-01";

/* -------------------------------------------------------------------------- */
/* Ordinary age (LGSS art. 205.1 and DT 7ª)                                   */
/* -------------------------------------------------------------------------- */

/** A period in whole years and months. */
export interface YM {
  y: number;
  m: number;
}

export const ym = (y: number, m = 0): YM => ({ y, m });
export const toMonths = (p: YM): number => p.y * 12 + p.m;
export const fromMonths = (months: number): YM => ({ y: Math.floor(months / 12), m: months % 12 });

/** Art. 205.1.a: the lower age, for whoever has the contribution period of the year. */
export const LOWER_AGE: YM = ym(65);

export interface PhaseInRow {
  /** The year, or 2027 for "A partir del año 2027". */
  year: number;
  /** "Períodos cotizados" for the lower age (65). */
  threshold: YM;
  /** "Edad exigida" with less than that period. */
  age: YM;
  /** The BOE's cells, verbatim: year, the threshold, 65, "Menos de …", the age. */
  cells: readonly [string, string, string, string, string];
}

/** DT 7ª LGSS, read on RULES_AS_OF: every row as the BOE prints it. */
export const PHASE_IN: readonly PhaseInRow[] = [
  { year: 2013, threshold: ym(35, 3), age: ym(65, 1), cells: ["2013", "35 años y 3 meses o más.", "65 años.", "Menos de 35 años y 3 meses.", "65 años y 1 mes."] },
  { year: 2014, threshold: ym(35, 6), age: ym(65, 2), cells: ["2014", "35 años y 6 meses o más.", "65 años.", "Menos de 35 años y 6 meses.", "65 años y 2 meses."] },
  { year: 2015, threshold: ym(35, 9), age: ym(65, 3), cells: ["2015", "35 años y 9 meses o más.", "65 años.", "Menos de 35 años y 9 meses.", "65 años y 3 meses."] },
  { year: 2016, threshold: ym(36), age: ym(65, 4), cells: ["2016", "36 o más años.", "65 años.", "Menos de 36 años.", "65 años y 4 meses."] },
  { year: 2017, threshold: ym(36, 3), age: ym(65, 5), cells: ["2017", "36 años y 3 meses o más.", "65 años.", "Menos de 36 años y 3 meses.", "65 años y 5 meses."] },
  { year: 2018, threshold: ym(36, 6), age: ym(65, 6), cells: ["2018", "36 años y 6 meses o más.", "65 años.", "Menos de 36 años y 6 meses.", "65 años y 6 meses."] },
  { year: 2019, threshold: ym(36, 9), age: ym(65, 8), cells: ["2019", "36 años y 9 meses o más.", "65 años.", "Menos de 36 años y 9 meses.", "65 años y 8 meses."] },
  { year: 2020, threshold: ym(37), age: ym(65, 10), cells: ["2020", "37 o más años.", "65 años.", "Menos de 37 años.", "65 años y 10 meses."] },
  { year: 2021, threshold: ym(37, 3), age: ym(66), cells: ["2021", "37 años y 3 meses o más.", "65 años.", "Menos de 37 años y 3 meses.", "66 años."] },
  { year: 2022, threshold: ym(37, 6), age: ym(66, 2), cells: ["2022", "37 años y 6 meses o más.", "65 años.", "Menos de 37 años y 6 meses.", "66 años y 2 meses."] },
  { year: 2023, threshold: ym(37, 9), age: ym(66, 4), cells: ["2023", "37 años y 9 meses o más.", "65 años.", "Menos de 37 años y 9 meses.", "66 años y 4 meses."] },
  { year: 2024, threshold: ym(38), age: ym(66, 6), cells: ["2024", "38 o más años.", "65 años.", "Menos de 38 años.", "66 años y 6 meses."] },
  { year: 2025, threshold: ym(38, 3), age: ym(66, 8), cells: ["2025", "38 años y 3 meses o más.", "65 años.", "Menos de 38 años y 3 meses.", "66 años y 8 meses."] },
  { year: 2026, threshold: ym(38, 3), age: ym(66, 10), cells: ["2026", "38 años y 3 meses o más.", "65 años.", "Menos de 38 años y 3 meses.", "66 años y 10 meses."] },
  { year: 2027, threshold: ym(38, 6), age: ym(67), cells: ["A partir del año 2027", "38 años y 6 meses o más.", "65 años.", "Menos de 38 años y 6 meses.", "67 años."] },
];

/** The table's first year: before it the old rule (65) applied and the tool does not compute. */
export const PHASE_IN_FROM = 2013;
/** From this year on, the last row: 65 with 38 years and 6 months, otherwise 67 (art. 205.1.a). */
export const FINAL_YEAR = 2027;

/** The row for a calendar year (2027 and later share the last one). */
export function phaseInRow(year: number): PhaseInRow {
  if (year < PHASE_IN_FROM) throw new Error(`no phase-in row before ${PHASE_IN_FROM}: ${year}`);
  return PHASE_IN.find((r) => r.year === Math.min(year, FINAL_YEAR))!;
}

/** Art. 205.1.b: at least 15 years contributed… */
export const MIN_CONTRIBUTION: YM = ym(15);
/** …two of them within the 15 years before retiring. */
export const MIN_RECENT: YM = ym(2);

/* -------------------------------------------------------------------------- */
/* Early retirement (LGSS arts. 207 and 208, wording of Ley 21/2021)          */
/* -------------------------------------------------------------------------- */

export type EarlyKind = "involuntary" | "voluntary";

/** Art. 207.1.a: up to four years before; art. 208.1.a: up to two. In months. */
export const EARLY_MAX_MONTHS: Record<EarlyKind, number> = { involuntary: 48, voluntary: 24 };
/** Art. 207.1.c: 33 years of effective contributions; art. 208.1.b: 35. */
export const EARLY_MIN_CONTRIBUTION: Record<EarlyKind, YM> = { involuntary: ym(33), voluntary: ym(35) };
/** Art. 207.1.b: registered as a job seeker for at least six months before applying. */
export const JOB_SEEKER_MONTHS = 6;
/** Art. 208.3: voluntary retirement on the unemployment subsidy for at least three months takes the art. 207 coefficients. */
export const SUBSIDY_MONTHS = 3;

/** The four columns of both tables: contribution period at the early date. */
export type ColumnId = "under-38-6" | "38-6-to-41-6" | "41-6-to-44-6" | "44-6-plus";
export const COLUMNS: readonly ColumnId[] = ["under-38-6", "38-6-to-41-6", "41-6-to-44-6", "44-6-plus"];
/** Lower bound of each column (the first has none). */
export const COLUMN_FROM: Record<ColumnId, YM> = { "under-38-6": ym(0), "38-6-to-41-6": ym(38, 6), "41-6-to-44-6": ym(41, 6), "44-6-plus": ym(44, 6) };

export function columnFor(contributedMonths: number): ColumnId {
  let col: ColumnId = "under-38-6";
  for (const c of COLUMNS) if (contributedMonths >= toMonths(COLUMN_FROM[c])) col = c;
  return col;
}

/** [months brought forward, % reduction per column], art. 207.2 as the BOE prints it (48 to 1). */
export const INVOLUNTARY_COEFFICIENTS: readonly (readonly [number, readonly [number, number, number, number]])[] = [
  [48, [30.0, 28.0, 26.0, 24.0]],
  [47, [29.38, 27.42, 25.46, 23.5]],
  [46, [28.75, 26.83, 24.92, 23.0]],
  [45, [28.13, 26.25, 24.38, 22.5]],
  [44, [27.5, 25.67, 23.83, 22.0]],
  [43, [26.88, 25.08, 23.29, 21.5]],
  [42, [26.25, 24.5, 22.75, 21.0]],
  [41, [25.63, 23.92, 22.21, 20.5]],
  [40, [25.0, 23.33, 21.67, 20.0]],
  [39, [24.38, 22.75, 21.13, 19.5]],
  [38, [23.75, 22.17, 20.58, 19.0]],
  [37, [23.13, 21.58, 20.04, 18.5]],
  [36, [22.5, 21.0, 19.5, 18.0]],
  [35, [21.88, 20.42, 18.96, 17.5]],
  [34, [21.25, 19.83, 18.42, 17.0]],
  [33, [20.63, 19.25, 17.88, 16.5]],
  [32, [20.0, 18.67, 17.33, 16.0]],
  [31, [19.38, 18.08, 16.79, 15.5]],
  [30, [18.75, 17.5, 16.25, 15.0]],
  [29, [18.13, 16.92, 15.71, 14.5]],
  [28, [17.5, 16.33, 15.17, 14.0]],
  [27, [16.88, 15.75, 14.63, 13.5]],
  [26, [16.25, 15.17, 14.08, 13.0]],
  [25, [15.63, 14.58, 13.54, 12.5]],
  [24, [15.0, 14.0, 13.0, 12.0]],
  [23, [14.38, 13.42, 12.46, 11.5]],
  [22, [13.75, 12.83, 11.92, 11.0]],
  [21, [12.57, 12.0, 11.38, 10.0]],
  [20, [11.0, 10.5, 10.0, 9.2]],
  [19, [9.78, 9.33, 8.89, 8.4]],
  [18, [8.8, 8.4, 8.0, 7.6]],
  [17, [8.0, 7.64, 7.27, 6.91]],
  [16, [7.33, 7.0, 6.67, 6.33]],
  [15, [6.77, 6.46, 6.15, 5.85]],
  [14, [6.29, 6.0, 5.71, 5.43]],
  [13, [5.87, 5.6, 5.33, 5.07]],
  [12, [5.5, 5.25, 5.0, 4.75]],
  [11, [5.18, 4.94, 4.71, 4.47]],
  [10, [4.89, 4.67, 4.44, 4.22]],
  [9, [4.63, 4.42, 4.21, 4.0]],
  [8, [4.4, 4.2, 4.0, 3.8]],
  [7, [4.19, 4.0, 3.81, 3.62]],
  [6, [3.75, 3.5, 3.25, 3.0]],
  [5, [3.13, 2.92, 2.71, 2.5]],
  [4, [2.5, 2.33, 2.17, 2.0]],
  [3, [1.88, 1.75, 1.63, 1.5]],
  [2, [1.25, 1.17, 1.08, 1.0]],
  [1, [0.63, 0.58, 0.54, 0.5]],
];

/** [months brought forward, % reduction per column], art. 208.2 as the BOE prints it (24 to 1). */
export const VOLUNTARY_COEFFICIENTS: readonly (readonly [number, readonly [number, number, number, number]])[] = [
  [24, [21.0, 19.0, 17.0, 13.0]],
  [23, [17.6, 16.5, 15.0, 12.0]],
  [22, [14.67, 14.0, 13.33, 11.0]],
  [21, [12.57, 12.0, 11.43, 10.0]],
  [20, [11.0, 10.5, 10.0, 9.2]],
  [19, [9.78, 9.33, 8.89, 8.4]],
  [18, [8.8, 8.4, 8.0, 7.6]],
  [17, [8.0, 7.64, 7.27, 6.91]],
  [16, [7.33, 7.0, 6.67, 6.33]],
  [15, [6.77, 6.46, 6.15, 5.85]],
  [14, [6.29, 6.0, 5.71, 5.43]],
  [13, [5.87, 5.6, 5.33, 5.07]],
  [12, [5.5, 5.25, 5.0, 4.75]],
  [11, [5.18, 4.94, 4.71, 4.47]],
  [10, [4.89, 4.67, 4.44, 4.22]],
  [9, [4.63, 4.42, 4.21, 4.0]],
  [8, [4.4, 4.2, 4.0, 3.8]],
  [7, [4.19, 4.0, 3.81, 3.62]],
  [6, [4.0, 3.82, 3.64, 3.45]],
  [5, [3.83, 3.65, 3.48, 3.3]],
  [4, [3.67, 3.5, 3.33, 3.17]],
  [3, [3.52, 3.36, 3.2, 3.04]],
  [2, [3.38, 3.23, 3.08, 2.92]],
  [1, [3.26, 3.11, 2.96, 2.81]],
];

export const COEFFICIENTS: Record<EarlyKind, typeof INVOLUNTARY_COEFFICIENTS> = { involuntary: INVOLUNTARY_COEFFICIENTS, voluntary: VOLUNTARY_COEFFICIENTS };

/** The % reduction for a number of months brought forward and a contribution period; null outside the table. */
export function coefficient(kind: EarlyKind, monthsAhead: number, contributedMonths: number): number | null {
  const row = COEFFICIENTS[kind].find(([m]) => m === monthsAhead);
  if (!row) return null;
  return row[1][COLUMNS.indexOf(columnFor(contributedMonths))]!;
}

/** Art. 210.4: for involuntary early retirement the pension may not exceed the maximum reduced by 0.50 % per quarter or fraction brought forward. */
export const MAX_PENSION_CUT_PER_QUARTER = 0.5;

/* -------------------------------------------------------------------------- */
/* Delayed retirement (LGSS art. 210.2, wording of RDL 11/2024)               */
/* -------------------------------------------------------------------------- */

/** Art. 210.2.a: 4 % per full year contributed after the ordinary age. */
export const DELAY_PER_YEAR = 4;
/** Art. 210.2.a, second paragraph: 2 % for more than 6 months and less than a year, from the second full year. */
export const DELAY_HALF_YEAR = 2;
export const DELAY_HALF_YEAR_FROM_YEARS = 2;
export const DELAY_HALF_YEAR_MORE_THAN_MONTHS = 6;

/** The extra percentage for a delay of whole months, all of them contributed (art. 210.2.a). */
export function delayBonus(months: number): number {
  if (!(months > 0)) return 0;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return years * DELAY_PER_YEAR + (years >= DELAY_HALF_YEAR_FROM_YEARS && rest > DELAY_HALF_YEAR_MORE_THAN_MONTHS ? DELAY_HALF_YEAR : 0);
}

/** Art. 214.2: share of the pension paid while working in jubilación activa, by full years of delay (5 or more: 100 %). */
export const ACTIVE_SHARE: readonly (readonly [number, number])[] = [
  [1, 45],
  [2, 55],
  [3, 65],
  [4, 80],
  [5, 100],
];
/** Art. 214.2: +5 points per 12 uninterrupted months in jubilación activa, up to 100 %. */
export const ACTIVE_STEP = 5;

/** Art. 214.2: the share of the pension paid in jubilación activa after this many months of delay (null under a full year; fractions do not count). */
export function activeShareFor(delayMonths: number): number | null {
  const years = Math.floor(delayMonths / 12);
  if (years < 1) return null;
  const last = ACTIVE_SHARE[ACTIVE_SHARE.length - 1]!;
  return (ACTIVE_SHARE.find(([y]) => y === years) ?? last)[1];
}

/* -------------------------------------------------------------------------- */
/* Partial retirement (LGSS art. 215.2)                                       */
/* -------------------------------------------------------------------------- */

/** Up to three years before the ordinary age, with a relief contract (contrato de relevo). */
export const PARTIAL_MAX_MONTHS = 36;
/** 33 years contributed (25 with a disability of 33 % or more). */
export const PARTIAL_MIN_CONTRIBUTION: YM = ym(33);
export const PARTIAL_MIN_CONTRIBUTION_DISABILITY: YM = ym(25);
/** Six years in the company. */
export const PARTIAL_SENIORITY_YEARS = 6;
/** Working time cut between 25 % and 75 % (20–33 % in the first year when more than two years early). */
export const PARTIAL_CUT = { min: 25, max: 75 } as const;

/** Art. 206.6 and 206 bis.2: lower ages by activity or disability never go below 52. */
export const REDUCED_AGE_FLOOR = 52;

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

const LGSS = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724";
const SS = "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28393";

/** Article anchors inside the BOE consolidated text. */
export const LGSS_ANCHOR = {
  art205: `${LGSS}#a205`,
  art206: `${LGSS}#a206`,
  art206bis: `${LGSS}#a2-4`,
  art207: `${LGSS}#a207`,
  art208: `${LGSS}#a208`,
  art210: `${LGSS}#a210`,
  art214: `${LGSS}#a214`,
  art215: `${LGSS}#a215`,
  art318: `${LGSS}#a318`,
  dt7: `${LGSS}#dtseptima`,
} as const;

export const SOURCES = {
  lgss: {
    name: "Real Decreto Legislativo 8/2015, de 30 de octubre, por el que se aprueba el texto refundido de la Ley General de la Seguridad Social (arts. 205 a 215, 318 y disposición transitoria séptima)",
    url: LGSS,
    publisher: "BOE",
    ref: "BOE-A-2015-11724, texto consolidado, última actualización publicada el 11/11/2026",
    read: RULES_AS_OF,
  },
  ley21: {
    name: "Ley 21/2021, de 28 de diciembre, de garantía del poder adquisitivo de las pensiones (nuevos arts. 207.2 y 208.2: coeficientes por mes)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652",
    publisher: "BOE",
    ref: "BOE-A-2021-21652, en vigor desde el 01/01/2022",
    read: RULES_AS_OF,
  },
  rdl11: {
    name: "Real Decreto-ley 11/2024, de 23 de diciembre, para la mejora de la compatibilidad de la pensión de jubilación con el trabajo (arts. 210.2, 214 y 215)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-26917",
    publisher: "BOE",
    ref: "BOE-A-2024-26917, en vigor desde el 01/04/2025",
    read: RULES_AS_OF,
  },
  rd416: {
    name: "Real Decreto 416/2026, de 27 de mayo, por el que se regula el régimen jurídico de la jubilación flexible y se modifica el régimen de la jubilación demorada",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-11474",
    publisher: "BOE",
    ref: "BOE-A-2026-11474, en vigor desde el 28/08/2026",
    read: RULES_AS_OF,
  },
  ssModalidades: {
    name: "Jubilación en el Régimen General: todas las modalidades (actividad, discapacidad, mutualistas, flexible, parcial)",
    url: SS,
    publisher: "Seguridad Social",
    ref: "índice de modalidades de jubilación",
    read: RULES_AS_OF,
  },
  ssRequisitos: {
    name: "Jubilación ordinaria: requisitos (edad, período mínimo de cotización y cuadro de aplicación gradual)",
    url: `${SS}/28396/28472`,
    publisher: "Seguridad Social",
    ref: "cómputo de fecha a fecha y períodos que cuentan como cotizados",
    read: RULES_AS_OF,
  },
  ssCuantia: {
    name: "Jubilación ordinaria: cuantía (porcentaje y complemento por demora)",
    url: `${SS}/28396/28475`,
    publisher: "Seguridad Social",
    ref: "porcentaje adicional del 4 % y del 2 %, cantidad a tanto alzado y opción mixta",
    read: RULES_AS_OF,
  },
  ssInvoluntaria: {
    name: "Jubilación anticipada derivada del cese no voluntario en el trabajo",
    url: `${SS}/2529`,
    publisher: "Seguridad Social",
    ref: "requisitos, causas del cese y límite de la cuantía",
    read: RULES_AS_OF,
  },
  ssVoluntaria: {
    name: "Jubilación anticipada por voluntad del trabajador",
    url: `${SS}/2528`,
    publisher: "Seguridad Social",
    ref: "requisitos y coeficientes reductores",
    read: RULES_AS_OF,
  },
  ssParcial: {
    name: "Jubilación parcial",
    url: `${SS}/28399`,
    publisher: "Seguridad Social",
    ref: "requisitos y contrato de relevo",
    read: RULES_AS_OF,
  },
  ssActiva: {
    name: "Jubilación ordinaria: compatibilidades (pensión de jubilación activa, art. 214)",
    url: `${SS}/28396/28478`,
    publisher: "Seguridad Social",
    ref: "porcentajes del 45 % al 100 %",
    read: RULES_AS_OF,
  },
  revistaInforme: {
    name: "Guía para obtener el informe que acredita tu edad legal de jubilación",
    url: "https://revista.seg-social.es/-/guia-para-obtener-el-informe-que-acredita-tu-edad-legal-de-jubilacion",
    publisher: "Revista de la Seguridad Social",
    ref: "30/09/2026",
    read: RULES_AS_OF,
  },
  revistaDemora: {
    name: "Guía para conocer los beneficios de demorar tu jubilación",
    url: "https://revista.seg-social.es/-/20220321-guia-jubilacion-demorada2",
    publisher: "Revista de la Seguridad Social",
    ref: "27/05/2025",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** The official tools: never asked for here, only linked. */
export const OFFICIAL_TOOLS = {
  /** The Seguridad Social's own simulator (identification by SMS code; it reads your working life). */
  simulator: "https://prestaciones.seg-social.es/simulador-servicio/simulador-pension-jubilacion.html",
  /** Tu Seguridad Social: the working-life report and the "Informe de edad legal de jubilación". */
  tuss: "https://portal.seg-social.gob.es/wps/portal/importass/importass",
} as const;

/** Verbatim quotes (Spanish, as published), read on RULES_AS_OF. */
export const QUOTE = {
  /** LGSS art. 205.1.a, first paragraph. */
  art205a:
    "Haber cumplido sesenta y siete años de edad, o sesenta y cinco años cuando se acrediten treinta y ocho años y seis meses de cotización, sin que se tenga en cuenta la parte proporcional correspondiente a las pagas extraordinarias.",
  /** LGSS art. 205.1.a, second paragraph. */
  art205count: "Para el cómputo de los períodos de cotización se tomarán años y meses completos, sin que se equiparen a ellos las fracciones de los mismos.",
  /** LGSS art. 205.1.b, first sentence. */
  art205b:
    "Tener cubierto un período mínimo de cotización de quince años, de los cuales al menos dos deberán estar comprendidos dentro de los quince años inmediatamente anteriores al momento de causar el derecho.",
  /** LGSS DT 7ª, opening words before the table. */
  dt7: "Las edades de jubilación y el período de cotización a que se refiere el artículo 205.1.a), así como las referencias a la edad que se contienen en los artículos 152.1, 207.1.a) y 2, 208.1.a) y 2, 214.1.a) y 311.1 se aplicarán de forma gradual, en los términos que resultan del siguiente cuadro:",
  /** LGSS art. 207.1.a. */
  art207a:
    "Tener cumplida una edad que sea inferior en cuatro años, como máximo, a la edad que en cada caso resulte de aplicación según lo establecido en el artículo 205.1.a) sin que a estos efectos resulten de aplicación los coeficientes reductores a que se refieren los artículos 206 y 206 bis.",
  /** LGSS art. 207.1.b. */
  art207b: "Encontrarse inscrito en las oficinas de empleo como demandante de empleo durante un plazo de, al menos, seis meses inmediatamente anteriores a la fecha de la solicitud de la jubilación.",
  /** LGSS art. 207.1.c, first sentence. */
  art207c: "Acreditar un período mínimo de cotización efectiva de 33 años, sin que, a tales efectos, se tenga en cuenta la parte proporcional por pagas extraordinarias.",
  /** LGSS art. 207.2, the rule before the table (the same words open art. 208.2). */
  perMonth:
    "la pensión será objeto de reducción mediante la aplicación, por cada mes o fracción de mes que, en el momento del hecho causante, le falte al trabajador para cumplir la edad legal de jubilación",
  /** LGSS arts. 207.2 and 208.2, the paragraph after the table. */
  fiction:
    "A los exclusivos efectos de determinar dicha edad legal de jubilación, se considerará como tal la que le hubiera correspondido al trabajador de haber seguido cotizando durante el plazo comprendido entre la fecha del hecho causante y el cumplimiento de la edad legal de jubilación que en cada caso resulte de la aplicación de lo establecido en el artículo 205.1.a).",
  /** LGSS art. 208.1.a. */
  art208a:
    "Tener cumplida una edad que sea inferior en dos años, como máximo, a la edad que en cada caso resulte de aplicación según lo establecido en el artículo 205.1.a), sin que a estos efectos resulten de aplicación los coeficientes reductores a que se refieren los artículos 206 y 206 bis.",
  /** LGSS art. 208.1.b, first sentence. */
  art208b: "Acreditar un período mínimo de cotización efectiva de treinta y cinco años, sin que, a tales efectos, se tenga en cuenta la parte proporcional por pagas extraordinarias.",
  /** LGSS art. 208.1.c, end. */
  art208c:
    "el importe de la pensión a percibir ha de resultar superior a la cuantía de la pensión mínima que correspondería al interesado por su situación familiar al cumplimiento de los sesenta y cinco años de edad. En caso contrario, no se podrá acceder a esta fórmula de jubilación anticipada.",
  /** LGSS art. 208.3. */
  art208_3:
    "Cuando en el momento de acogerse a esta modalidad de jubilación el trabajador esté percibiendo el subsidio por desempleo del artículo 274, y lo haya hecho durante al menos tres meses, serán de aplicación los coeficientes reductores previstos para la jubilación anticipada por causas no imputables al trabajador, sin perjuicio del cumplimiento de los requisitos del apartado 1 de este precepto.",
  /** LGSS art. 210.2, opening condition. */
  art210_2:
    "siempre que al cumplir esta edad se hubiera reunido el período mínimo de cotización establecido en el artículo 205.1.b), se reconocerá al interesado un complemento económico que se abonará de alguna de las siguientes maneras, a elección del interesado.",
  /** LGSS art. 210.2.a, first paragraph. */
  art210_2a:
    "Un porcentaje adicional de un 4 por ciento por cada año completo cotizado entre la fecha en que cumplió dicha edad y la del hecho causante de la pensión, siempre que acredite el resto de los requisitos legales exigidos.",
  /** LGSS art. 210.2.a, second paragraph (RDL 11/2024). */
  art210_2aHalf: "A partir del segundo año completo de demora, para el cálculo del porcentaje se podrán computar periodos superiores a 6 meses e inferiores a un año, correspondiendo a dichos periodos un 2 por ciento adicional.",
  /** LGSS art. 210.4, second sentence. */
  art210_4:
    "Una vez aplicados los referidos coeficientes reductores, el importe resultante de la pensión no podrá ser superior a la cuantía que resulte de reducir el tope máximo de pensión en un 0,50 por ciento por cada trimestre o fracción de trimestre de anticipación.",
  /** LGSS art. 214.2.a. */
  art214a: "Si se demora un año el acceso a la pensión de jubilación de acuerdo con lo establecido en el apartado 1.a), el porcentaje será del 45 por ciento de la pensión.",
  /** LGSS art. 214.2.e. */
  art214e: "Si se demora cinco años o más el acceso a la pensión de jubilación, el porcentaje será del 100 por ciento de la pensión.",
  /** LGSS art. 215.2.a, first paragraph up to the 33 years. */
  art215:
    "Tener cumplida en la fecha del hecho causante una edad que sea inferior en tres años, como máximo, a la edad que en cada caso resulte de aplicación según lo establecido en el artículo 205.1.a), y acreditar un periodo de cotización de treinta y tres años",
  /** LGSS art. 318.d: the self-employed (RETA) list leaves out art. 207. */
  art318d: "En materia de jubilación, lo dispuesto en los artículos 205; 206 y 206 bis; 208; 209, excepto la letra b) del apartado 1; 210; 213, 214, 249 quater y la disposición transitoria trigésima cuarta.",
  /** LGSS art. 206 bis.2 (and 206.6): never below 52. */
  floor52: "La aplicación de los correspondientes coeficientes reductores de la edad en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años.",
  /** Seguridad Social, requisitos: how the age is counted. */
  ssDateToDate:
    "El cómputo de los meses se realizará de fecha a fecha a partir de la correspondiente al nacimiento. Cuando en el mes del vencimiento no hubiera día equivalente al inicial del cómputo, se considerará que el cumplimiento de la edad tiene lugar el último día del mes.",
  /** Seguridad Social, voluntary early retirement page: every regime. */
  ssAnyRegime: "Podrán acceder a esta modalidad de jubilación anticipada los trabajadores, incluidos en cualquiera de los regímenes del sistema de la Seguridad Social, que reúnan los siguientes requisitos:",
  /** Revista de la Seguridad Social, 30/09/2026: the official report's premise. */
  ssPremise: "se considera que todas las cotizaciones están ingresadas y que la situación laboral actual de la persona se mantiene hasta la fecha en la que alcance su edad legal ordinaria de jubilación.",
} as const;
