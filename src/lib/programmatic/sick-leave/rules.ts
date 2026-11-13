/**
 * Every rule the sick-leave pay calculator ("baja laboral", incapacidad
 * temporal) uses, each with its source. Nothing numeric is typed anywhere
 * else: the engine, the page and the tests read from here. Client-safe.
 *
 * ## Read on 13 Nov 2026 (BOE consolidated texts and Seguridad Social)
 *
 *  - LGSS (Real Decreto Legislativo 8/2015), arts. 169 to 176, consolidated
 *    text "última actualización publicada el 11/11/2026". Both versions:
 *    the one in force (Ley 6/2024, from 3 Mar 2025) and the one in force
 *    from 1 Dec 2026 ("[No vigente aún]"), written by the Real Decreto-ley
 *    31/2026, de 20 de octubre (BOE-A-2026-21872), art. 1.3 to 1.6 and
 *    disposición final cuarta.2 ("producirán efectos el día primero del
 *    segundo mes siguiente al de la publicación": published 21 Oct 2026, so
 *    1 Dec 2026).
 *  - What changes on 1 Dec 2026 (RDL 31/2026):
 *     a) art. 171.2: the base reguladora is the contribution base of "el
 *        mes inmediatamente anterior al mes previo al del hecho causante"
 *        (two months back: a baja in December uses October), divided by
 *        the days it covers, 30 for a monthly salary and a whole month;
 *        before, Decreto 1646/1972 art. 13 took "el mes anterior".
 *     b) art. 169.1.a): two new special situations, a menopausal disorder
 *        ("trastorno menopáusico secundario codificado") and injuries from
 *        gender violence, next to secondary incapacitating menstruation,
 *        termination of pregnancy, pregnancy from week 39 and organ donation.
 *     c) art. 173.1: every special situation is paid from the day after the
 *        baja, the employer paying the full salary of that day (until
 *        30 Nov, menstruation and donation were paid from the same day).
 *    Disposición transitoria primera: the special-situation changes apply
 *    to processes started after its entry into force; since those articles
 *    only take effect on 1 Dec 2026, the calculator applies the rules in
 *    force on the baja's first day (and says so). Unchanged: 60 % / 75 %, the
 *    employer's days 4 to 15, the 365 + 180 days, the 545-day end.
 *  - RDL 31/2026 needs Congress's ratification (Constitución, art. 86.2).
 *    The BOE sumarios of 22 Oct to 13 Nov 2026 carry no resolution of
 *    convalidación or derogación; `CONVALIDATION_RECHECK_BY` makes a test
 *    fail before 1 Dec so someone looks again.
 *  - Decreto 3158/1966, art. 2.1 (75 %), with Real Decreto 53/1980, artículo
 *    único (60 % "entre el cuarto día ... y hasta el veinteavo día,
 *    inclusive" for common illness and non-work accidents).
 *  - Decreto 1646/1972, art. 13 (base reguladora until 30 Nov 2026) and the
 *    Orden de 13 de octubre de 1967, art. 6 (payment, "pago delegado").
 *  - Orden PJC/297/2026, art. 2.1: maximum contribution base 5.101,20 € a
 *    month from 1 Jan 2026.
 *  - Ley 35/2006 (IRPF), art. 17.2.a).1.ª: the benefit is earned income.
 *  - Seguridad Social, "Prestación de Incapacidad Temporal" (Información
 *    útil) and "Cuantía" (Prestaciones): the percentages of the special
 *    situations per day, and who pays from day 16. Neither page shows the
 *    1 Dec 2026 changes yet (read 13 Nov 2026).
 *
 * Not in the LGSS on 13 Nov 2026: any "flexible" or part-time return from
 * sick leave. The page says nothing about it.
 */

export const RULES_AS_OF = "2026-11-13";
/** From this day the 2026 maximum base no longer covers new bajas' reference months and the year's rules must be re-read: a test fails. */
export const RULES_UNTIL = "2027-01-01";
/** RDL 31/2026 changes apply from this day (disposición final cuarta.2). */
export const REFORM_FROM = "2026-12-01";
/** Re-read the BOE for the convalidación (or derogación) of RDL 31/2026 before its changes start: a test fails from this day. */
export const CONVALIDATION_RECHECK_BY = "2026-11-28";

/** Benefit percentages of the base reguladora. */
export const PCT = {
  /** RD 53/1980: common illness / non-work accident, days 4 to 20. */
  early: 60,
  /** Decreto 3158/1966 art. 2.1: from day 21 (common) and from the day after the baja (professional). */
  standard: 75,
  /** LGSS art. 171.1: organ or tissue donation. */
  donation: 100,
} as const;

/** Days, counted from the day of the baja (day 1). */
export const DAYS = {
  /** LGSS art. 173.1: common contingencies are paid "a partir del cuarto día". */
  commonFirstPaid: 4,
  /** LGSS art. 173.1: "desde el día cuarto al decimoquinto de baja, ambos inclusive, el subsidio estará a cargo del empresario". */
  employerLast: 15,
  /** RD 53/1980: 60 % "hasta el veinteavo día, inclusive". */
  earlyLast: 20,
  /** LGSS art. 169.1.a): 365 days, extendable by 180. */
  ordinaryMax: 365,
  extension: 180,
  /** LGSS art. 174.1: the right ends at 545 calendar days. */
  absoluteMax: 545,
} as const;

/** Orden PJC/297/2026, art. 2.1: "5.101,20 euros mensuales" from 1 Jan 2026. */
export const MAX_BASE_2026 = 5101.2;
/** The year the maximum base above belongs to. */
export const MAX_BASE_YEAR = 2026;
/** Decreto 1646/1972 art. 13.2 and LGSS art. 171.2 (from 1 Dec 2026): a monthly salary and a whole month, divided by 30. */
export const MONTH_DIVISOR = 30;
/** LGSS art. 171.2 (from 1 Dec 2026), professional contingencies: last year's overtime divided by 365. */
export const OVERTIME_DIVISOR = 365;

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** Publication or version date (ISO). */
  date: string;
}

export const SOURCES = {
  lgss: {
    name: "Texto refundido de la Ley General de la Seguridad Social, arts. 169 a 176 (incapacidad temporal)",
    ref: "BOE-A-2015-11724, actualización del 11-11-2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a169",
    date: "2026-11-11",
  },
  rdl31: {
    name: "Real Decreto-ley 31/2026, de 20 de octubre, para la mejora de la acción protectora de la Seguridad Social y de otras normas sociales",
    ref: "BOE-A-2026-21872, art. 1.3 a 1.6, disposición transitoria primera y disposición final cuarta",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-21872",
    date: "2026-10-21",
  },
  d3158: {
    name: "Decreto 3158/1966, de 23 de diciembre, Reglamento general de la cuantía de las prestaciones económicas del Régimen General, art. 2",
    ref: "BOE-A-1966-21116",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1966-21116#asegundo",
    date: "1966-12-30",
  },
  rd53: {
    name: "Real Decreto 53/1980, de 11 de enero, por el que se modifica el artículo segundo del Reglamento General de la cuantía de las prestaciones",
    ref: "BOE-A-1980-1003",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-1980-1003",
    date: "1980-01-16",
  },
  d1646: {
    name: "Decreto 1646/1972, de 23 de junio, en materia de prestaciones del Régimen General, art. 13 (base reguladora)",
    ref: "BOE-A-1972-944",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1972-944",
    date: "1972-06-28",
  },
  orden1967: {
    name: "Orden de 13 de octubre de 1967, normas para la aplicación y desarrollo de la prestación por incapacidad laboral transitoria, art. 6 (pago)",
    ref: "BOE-A-1967-19566",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1967-19566#a6",
    date: "1967-11-04",
  },
  orden2026: {
    name: "Orden PJC/297/2026, de 30 de marzo, normas de cotización a la Seguridad Social para 2026, art. 2.1 (tope máximo)",
    ref: "BOE-A-2026-7296",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296#a2",
    date: "2026-03-31",
  },
  irpf: {
    name: "Ley 35/2006, del Impuesto sobre la Renta de las Personas Físicas, art. 17.2.a).1.ª",
    ref: "BOE-A-2006-20764",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a17",
    date: "2026-11-11",
  },
  ssInfo: {
    name: "Seguridad Social: Prestación de Incapacidad Temporal",
    ref: "seg-social.es",
    url: "https://www.seg-social.es/wps/portal/wss/internet/InformacionUtil/44539/44667",
    date: "2026-11-13",
  },
  ssAmount: {
    name: "Seguridad Social: Incapacidad temporal, cuantía",
    ref: "seg-social.es",
    url: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10952/28362/28365/cuantia",
    date: "2026-11-13",
  },
} as const satisfies Record<string, Source>;

/** Quotes, verbatim (Spanish), as the page prints them. */
export const QUOTE = {
  lgss173common:
    "En caso de enfermedad común o de accidente no laboral, el subsidio se abonará a partir del cuarto día de baja en el trabajo, si bien desde el día cuarto al decimoquinto de baja, ambos inclusive, el subsidio estará a cargo del empresario.",
  lgss173professional:
    "En caso de accidente de trabajo o enfermedad profesional, el subsidio se abonará desde el día siguiente al de la baja en el trabajo, estando a cargo del empresario el salario íntegro correspondiente al día de la baja.",
  rd53:
    "será, durante el periodo comprendido entre el cuarto día a partir del de la baja en el trabajo ocasionada por la enfermedad o el accidente y hasta el veinteavo día, inclusive, de permanencia en tal situación, de un subsidio equivalente al sesenta por ciento de la base reguladora correspondiente.",
  d3158:
    "consistirá en un subsidio equivalente al setenta y cinco por ciento de la base de cotización del trabajador en la fecha en que se declare iniciada legalmente la incapacidad.",
  lgss171base2026:
    "La base reguladora para el cálculo del subsidio de incapacidad temporal por contingencias comunes será el resultado de dividir el importe de la base de cotización por dichas contingencias del mes inmediatamente anterior al mes previo al del hecho causante, por el número de días a que dicha cotización se refiera.",
  d1646art13:
    "La base reguladora para el cálculo de la cuantía del subsidio de incapacidad laboral transitoria será el resultado de dividir el importe de la base de cotización del trabajador, correspondiente a la contingencia de la que aquella se derive, en el mes anterior al de la fecha de iniciación de la situación de incapacidad",
  lgss173special2026:
    "En las situaciones especiales de incapacidad temporal previstas en el artículo 169.1.a), el subsidio se abonará, a cargo de la entidad gestora o colaboradora que cubra la incapacidad temporal por contingencias comunes, desde el día siguiente al de la baja en el trabajo, estando a cargo del empresario el salario íntegro correspondiente al día de la baja.",
  lgss169duration:
    "con una duración máxima de trescientos sesenta y cinco días, prorrogables por otros 180 días cuando se presuma que durante ellos puede el trabajador ser dado de alta médica por curación.",
  ssPayment: "En general, el pago lo efectúa la empresa como pago delegado con la misma periodicidad que los salarios.",
  ssFrom16: "a partir del 16º la responsabilidad de pago será del INSS o de la mutua",
  irpf:
    "Las pensiones y haberes pasivos percibidos de los regímenes públicos de la Seguridad Social y clases pasivas y demás prestaciones públicas por situaciones de incapacidad, jubilación, accidente, enfermedad, viudedad, o similares",
  rdl31transitional:
    "Las modificaciones introducidas por este real decreto-ley en materia de situaciones especiales de incapacidad temporal por contingencias comunes serán aplicables a los procesos de incapacidad temporal iniciados a partir de su entrada en vigor.",
} as const;

/** The Seguridad Social's own pages, linked from the page. */
export const OFFICIAL_LINKS = {
  info: SOURCES.ssInfo.url,
  amount: SOURCES.ssAmount.url,
} as const;
