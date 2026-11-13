/**
 * The figures and legal rules behind the three employment calculators
 * (dismissal pay, final settlement, unemployment benefit). Nothing here is
 * estimated: every number was read on the official text on RULES_AS_OF and is
 * quoted in the comment above it. Client-safe (no data files, no server code).
 *
 * Re-read every January (a test fails from RULES_VALID_UNTIL + 1 day):
 *  - IPREM: set by the State Budget law. The 2023 budget (Ley 31/2022, DA 90ª)
 *    fixed 600 €/month; with no budget since, it is still the figure SEPE
 *    applies in 2026 ("Cuantías anuales", read 13 Nov 2026: "Del indicador
 *    público de renta de efectos múltiples (IPREM) fijado en: Ley 31/2022").
 *    A 2027 budget or decree-law can change it.
 *  - SMI 2026: Real Decreto 126/2026 (BOE-A-2026-3815), 1.221 €/month in 14
 *    payments, 17.094 €/year, in force 1 Jan to 31 Dec 2026.
 *  - Contribution caps and rates 2026: Orden PJC/297/2026 (BOE-A-2026-7296).
 *  - The ET and LGSS articles: BOE consolidated texts (ET last updated
 *    21/10/2026, LGSS 11/11/2026 when read). Art. 270.2 LGSS still says 70 %
 *    for the first 180 days and 60 % from day 181 (wording of Ley 31/2022, in
 *    force 1 Jan 2023). RDL 2/2024 did NOT change it: it changed the
 *    *subsidio* (95 % / 90 % / 80 % of IPREM, art. 278) and art. 269.3.
 */

/** The day every figure below was read on the official text. */
export const RULES_AS_OF = "2026-11-13";
/** The figures are the 2026 ones: from 1 Jan 2027 a test fails until IPREM, SMI and the 2027 caps are re-read. */
export const RULES_VALID_UNTIL = "2026-12-31";
export const RULES_YEAR = 2026;

/* -------------------------------------------------------------------------- */
/* Dismissal pay (Estatuto de los Trabajadores)                               */
/* -------------------------------------------------------------------------- */

/**
 * Art. 56.1 ET: «una indemnización equivalente a treinta y tres días de
 * salario por año de servicio, prorrateándose por meses los periodos de tiempo
 * inferiores a un año, hasta un máximo de veinticuatro mensualidades».
 */
export const UNFAIR_DAYS_PER_YEAR = 33;
/**
 * DT 11ª.2 ET (contracts signed before 12 Feb 2012): «cuarenta y cinco días de
 * salario por año de servicio por el tiempo de prestación de servicios anterior
 * a dicha fecha … y a razón de treinta y tres días … por el tiempo … posterior
 * … no podrá ser superior a setecientos veinte días de salario, salvo que del
 * cálculo de la indemnización por el periodo anterior al 12 de febrero de 2012
 * resultase un número de días superior, en cuyo caso se aplicará este como
 * importe indemnizatorio máximo, sin que dicho importe pueda ser superior a
 * cuarenta y dos mensualidades, en ningún caso».
 */
export const UNFAIR_OLD_DAYS_PER_YEAR = 45;
/** The day the 33-day rule starts (RDL 3/2012; DT 11ª.1 ET): service before it earns 45 days a year. */
export const REFORM_2012 = "2012-02-12";
/** 24 mensualidades = 720 days of salary (DT 11ª.2 says "setecientos veinte días"). */
export const UNFAIR_CAP_DAYS = 720;
/** 42 mensualidades, the absolute cap of DT 11ª.2. */
export const UNFAIR_OLD_CAP_DAYS = 42 * 30;
/**
 * Art. 53.1.b ET (objective dismissal; also collective dismissal, ERE, whose
 * art. 51.4 sends the individual notices "conforme a lo establecido en el
 * artículo 53.1"): «veinte días por año de servicio, prorrateándose por meses
 * los periodos de tiempo inferiores a un año y con un máximo de doce
 * mensualidades».
 */
export const OBJECTIVE_DAYS_PER_YEAR = 20;
export const OBJECTIVE_CAP_DAYS = 12 * 30;
/** Art. 53.1.c ET: «un plazo de preaviso de quince días»; 53.4: if not given, the employer pays the salary for that period. */
export const OBJECTIVE_NOTICE_DAYS = 15;
/**
 * Art. 49.1.c ET (end of a fixed-term contract): «excepto en los contratos
 * formativos y el contrato de duración determinada por causa de sustitución …
 * una indemnización de cuantía equivalente a la parte proporcional de la
 * cantidad que resultaría de abonar doce días de salario por cada año de
 * servicio». No cap in the article.
 */
export const TEMPORARY_DAYS_PER_YEAR = 12;
/**
 * Art. 7.e Ley 35/2006 (IRPF): dismissal pay is exempt «en la cuantía
 * establecida con carácter obligatorio en el … Estatuto de los Trabajadores
 * … El importe de la indemnización exenta … tendrá como límite la cantidad de
 * 180.000 euros». Art. 147.2.c LGSS: also out of the contribution base, in the
 * same obligatory amount.
 */
export const IRPF_EXEMPT_CAP = 180_000;

/* -------------------------------------------------------------------------- */
/* Final settlement (finiquito)                                               */
/* -------------------------------------------------------------------------- */

/** Art. 38.1 ET: «En ningún caso la duración será inferior a treinta días naturales.» */
export const MIN_VACATION_DAYS = 30;
/** Art. 31 ET: «dos gratificaciones extraordinarias al año», amount set by the collective agreement, may be spread over 12 months. */
export const EXTRA_PAYMENTS = 2;

/* -------------------------------------------------------------------------- */
/* Unemployment benefit (LGSS, SEPE)                                          */
/* -------------------------------------------------------------------------- */

/**
 * Art. 269.1 LGSS: days contributed in the last six years → days of benefit.
 * «Desde 360 hasta 539: 120 … Desde 2.160: 720». [from, days of benefit].
 */
export const DURATION_SCALE: readonly (readonly [number, number])[] = [
  [360, 120],
  [540, 180],
  [720, 240],
  [900, 300],
  [1080, 360],
  [1260, 420],
  [1440, 480],
  [1620, 540],
  [1800, 600],
  [1980, 660],
  [2160, 720],
];
/** Art. 266.b + 269.1 LGSS: below 360 days there is no contributory benefit. */
export const MIN_CONTRIBUTED_DAYS = 360;
/** Art. 270.2 LGSS: «el 70 por ciento durante los ciento ochenta primeros días y el 60 por ciento a partir del día ciento ochenta y uno». */
export const RATE_FIRST = 0.7;
export const RATE_AFTER = 0.6;
export const FIRST_PERIOD_DAYS = 180;
/** Ley 31/2022 DA 90ª: «b) El IPREM mensual, 600 euros». Still applied by SEPE in 2026 (budget prorogued). */
export const IPREM_MONTHLY = 600;
/** Art. 270.3 LGSS: limits use «el indicador … mensual vigente en el momento del nacimiento del derecho, incrementado en una sexta parte». */
export const IPREM_PLUS_SIXTH = (IPREM_MONTHLY * 7) / 6;
/**
 * Art. 270.3 LGSS: maximum 175 % of IPREM (+1/6) with no children, 200 % with
 * one, 225 % with two or more; minimum 80 % with no children, 107 % with at
 * least one. SEPE "Cuantías anuales" (read 13 Nov 2026): max 1.225 / 1.400 /
 * 1.575 €, min 560 / 749 € — the same figures this computes.
 */
export const MAX_PCT = { 0: 1.75, 1: 2, 2: 2.25 } as const;
export const MIN_PCT = { 0: 0.8, 1: 1.07, 2: 1.07 } as const;
/** SEPE "Cuantías anuales", 2026: «Cotización a la Seguridad Social: 4,85 %» (4,70 % common contingencies + 0,15 % MEI, Orden PJC/297/2026 art. 16). */
export const BENEFIT_SS_RATE = 0.0485;
/** Orden PJC/297/2026 art. 8.1: while on benefit after a dismissal the contribution base is the benefit's base reguladora. */
/** Orden PJC/297/2026: «El tope máximo de la base de cotización … desde el 1 de enero de 2026, de 5.101,20 euros mensuales». */
export const MAX_CONTRIBUTION_BASE = 5101.2;
/** Orden PJC/297/2026: minimum base for contribution groups 4 to 11 (groups 1–3 are higher). */
export const MIN_CONTRIBUTION_BASE = 1424.4;
/** SEPE pays «por mensualidades de treinta días». */
export const BENEFIT_MONTH_DAYS = 30;
/** SEPE, subsidio (RDL 2/2024): 95 % / 90 % / 80 % of IPREM → 570 / 540 / 480 € a month. Only quoted, not computed. */
export const SUBSIDY_MONTHLY = [570, 540, 480] as const;

/** RD 126/2026: «40,70 euros/día o 1 221 euros/mes»; 17.094 € a year in 14 payments. */
export const SMI_MONTHLY = 1221;
export const SMI_ANNUAL = 17_094;

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const SOURCE = {
  et: { name: "Estatuto de los Trabajadores (RDL 2/2015), texto consolidado", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430" },
  etArt56: { name: "ET, art. 56", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a56" },
  etArt53: { name: "ET, art. 53", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53" },
  etArt49: { name: "ET, art. 49", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a49" },
  etDt11: { name: "ET, disposición transitoria 11ª", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#dtundecima" },
  etArt38: { name: "ET, art. 38", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a38" },
  etArt31: { name: "ET, art. 31", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a31" },
  lgss: { name: "Ley General de la Seguridad Social (RDL 8/2015), texto consolidado", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724" },
  lgssArt269: { name: "LGSS, art. 269", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a269" },
  lgssArt270: { name: "LGSS, art. 270", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a270" },
  irpf: { name: "Ley 35/2006 del IRPF, art. 7.e", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a7" },
  sepeAmounts: { name: "Cuantías anuales (prestaciones por desempleo)", publisher: "SEPE", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html" },
  sepeContributory: { name: "Prestación contributiva", publisher: "SEPE", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/prestacion-contributiva/prestacion-contributiva-mas-de-un-anyo.html" },
  pge2023: { name: "Ley 31/2022, PGE 2023, DA 90ª (IPREM)", publisher: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128" },
  smi2026: { name: "Real Decreto 126/2026, SMI 2026", publisher: "BOE", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3815" },
  cotizacion2026: { name: "Orden PJC/297/2026, cotización 2026", publisher: "BOE", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296" },
} as const;
export type SourceKey = keyof typeof SOURCE;
