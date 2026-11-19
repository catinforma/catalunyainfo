import {
  GENDER_GAP_2026,
  MAX_PENSION_2026,
  MINIMUMS_2026,
  MINIMUM_INCOME_LIMIT_2026,
  NORMS as PENSION_NORMS,
  PAYMENTS,
  PNC_2026_ANNUAL,
  type MinimumId,
} from "@/lib/programmatic/pensions-2027/rules";
import { CONVALIDATION_RECHECK_BY } from "@/lib/programmatic/sick-leave/rules";
import { SMI_2026, boeUrl as smiBoeUrl } from "@/lib/programmatic/smi/rules";

/**
 * Every rule of "Pensión de viudedad: requisitos y cuánto se cobra"
 * (lib/programmatic/widow-pension/), each with its source. Nothing numeric
 * is typed anywhere else: the engine, the page and the tests read from here.
 * The 2026 amounts are NOT typed here either: the minimum pensions, their
 * income limit, the maximum and non-contributory pensions and the gender-gap
 * complement come from the pensions-2027 module (RD 241/2026 anexo I and RDL
 * 3/2026, read there on 13 Nov 2026 and re-read here), the SMI from the smi
 * module (RD 126/2026). Client-safe: no data files, no server code.
 *
 * ## Read on 18 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, LGSS (RDLeg 8/2015, BOE-A-2015-11724), consolidated text "Última
 *    actualización publicada el 11/11/2026": arts. 216, 217 (causantes),
 *    219 (spouse; 500 days in 5 years in alta, 15 years without alta, no
 *    period for accidents; 219.2 one year of marriage when the illness came
 *    first), 220 (separation, divorce, nullity: compensatory pension, the
 *    gender-violence exception, 40 % in concurrence), 221 (parejas de hecho,
 *    apartado 2 as worded by RDL 31/2026 art. 1.10, "en vigor a partir del
 *    21/10/2026"), 222 (prestación temporal, Ley 21/2021), 223
 *    (compatibility and extinction, Ley 21/2021), 57, 59, 60, 228, 229, 230
 *    and DT 13ª (as worded by RDL 31/2026 art. 1.18).
 *  - The earlier wording of art. 221.2 (Ley 21/2021, in force 1 Jan 2022 to
 *    20 Oct 2026), read in the BOE's version selector (p=20211229): with
 *    common children only the registration (2 years) was needed and no 5
 *    years' cohabitation. RDL 31/2026 turned it round: with common children,
 *    two years' cohabitation by padrón and no registration.
 *  - RDL 31/2026 (BOE-A-2026-21872, BOE 21 Oct 2026, in force that day,
 *    disposición final cuarta.1): it needs the Congress's convalidación
 *    within 30 days (Constitución, art. 86.2). The BOE's daily summaries
 *    from 22 Oct to 19 Nov 2026 carry none (RDL 29/2026's was published on
 *    13 Nov); the sick-leave module's CONVALIDATION_RECHECK_BY makes a test
 *    fail on 28 Nov 2026 in both modules.
 *  - Decreto 3158/1966 (BOE-A-1966-21116), art. 31 ("Última actualización,
 *    publicada el 27/12/2003"): 52 % (RD 1795/2003), 70 % with family
 *    burdens, main source of income and the income ceiling, 31.3 reduction,
 *    31.4 loss of the 70 %.
 *  - Real Decreto 900/2018 (BOE-A-2018-10397, unchanged since 24/07/2018):
 *    60 % from 1 Jan 2019, the four conditions of art. 2, art. 7 (the 70 %
 *    when more favourable, never both).
 *  - Orden de 13 de febrero de 1967 (BOE-A-1967-2876), art. 11 (RD 1465/2001
 *    and RD 296/2009): remarriage or a new pareja de hecho keeps the pension
 *    only over 61 (or with absolute permanent incapacity, gran invalidez or
 *    a 65 % disability), with the pension at least 75 % of income and the
 *    couple's income at most twice the SMI.
 *  - RD 241/2026 (BOE-A-2026-6977): anexo I (the four viudedad minimums, the
 *    9.442 € income limit), art. 9.2 (partial complement), 9.5 (residence,
 *    capped at the non-contributory pension).
 *  - Seguridad Social, "Pensión de viudedad" (Régimen General): causantes y
 *    beneficiarios, cuantía y abono (base reguladora; 14 payments, 12 for
 *    work accidents), hecho causante y efectos, compatibilidades, extinción,
 *    solicitudes; "Prestación temporal de viudedad"; "Presentación de
 *    solicitudes" and the form page (PDF dated 11/08/2026).
 *
 * ## Conflicts and readings (printed on the page)
 *
 *  - 70 % income ceiling: Decreto 3158/1966 art. 31.2 adds the minimum
 *    viudedad pension "en función de la edad del pensionista"; the Seguridad
 *    Social's cuantía page (still with 2025 figures) adds the minimum "con
 *    cargas familiares". The calculator applies the BOE (stricter) and
 *    answers "check" between the two ceilings.
 *  - The 70 % income test counts income other than the widow's pension
 *    itself; art. 31.3 then caps pension + income at the same ceiling. The
 *    reduced 70 % is kept only if it beats the 60 % or 52 % (RD 900/2018
 *    art. 7 says "de resultar más favorable"; the floor at 52 % is ours).
 *  - Pareja de hecho with no registration at all and no common children:
 *    no pension and no prestación temporal (art. 222 speaks of a
 *    registration made less than two years before).
 *  - Separated or divorced: the compensatory pension is compared per year.
 *    RD 241/2026 art. 9.9 says a viudedad equal to the compensatory pension
 *    "no podrán ser complementadas", but in the paragraph on Clases Pasivas:
 *    the calculator does not add a minimum complement in that case and says
 *    why.
 *
 * ## Do not print
 *
 * The Seguridad Social pages' 2025 figures (9.193 €, 24.979,4 €); any 2027
 * minimum; a figure for the prestación temporal's minimum (no text gives
 * one); the orphan's or the lump sum's amounts.
 *
 * A test fails from RULES_UNTIL (1 Jan 2027, when the 2027 minimums, income
 * limit and SMI replace the 2026 ones) and from CONVALIDATION_RECHECK_BY.
 */

export const RULES_AS_OF = "2026-11-18";
/** From this day a test fails: the 2026 minimums, limits and SMI stop applying (re-read the 2027 revaluation norm). */
export const RULES_UNTIL = "2027-01-01";
/** The year of the amounts below. */
export const AMOUNTS_YEAR = 2026;

/* -------------------------------------------------------------------------- */
/* Percentages (Decreto 3158/1966 art. 31; RD 900/2018)                       */
/* -------------------------------------------------------------------------- */

export type Percent = 52 | 60 | 70;
/** Art. 31.1 (RD 1795/2003): «será del 52 por ciento». */
export const GENERAL_PERCENT = 52;
/** RD 900/2018 art. 3 and DT 1ª.b: «el porcentaje del 60 por ciento», from 1 Jan 2019. */
export const SENIOR_PERCENT = 60;
/** Art. 31.2: «será del 70 por 100». */
export const BURDENS_PERCENT = 70;

/** RD 900/2018 art. 2.a: «Haber cumplido una edad igual o superior a los 65 años». */
export const SENIOR_AGE = 65;
/** Art. 31.2, cargas familiares: «hijos menores de veintiséis años o mayores incapacitados, o menores acogidos». */
export const CHILD_AGE_LIMIT = 26;
/** Seguridad Social, cuantía: «se considera que existe incapacidad cuando acredite una discapacidad igual o superior al 33%». */
export const CHILD_DISABILITY = 33;
/** Art. 31.2: per-member family income at most «el 75 por 100 del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias». */
export const BURDEN_SMI_SHARE = 75;
/** Art. 31.2: the pension is the main source when it is «como mínimo, el 50 por 100 del total de los ingresos». */
export const MAIN_SOURCE_SHARE = 50;

/** The SMI behind the two SMI thresholds (RD 126/2026: 1.221 € a month, 14 payments). */
export const SMI = SMI_2026;
/** Family burdens: per-member income a year, 75 % of 12 SMI months (the two extra payments left out). */
export const BURDEN_THRESHOLD = Math.round(SMI.monthly * 12 * BURDEN_SMI_SHARE) / 100;

/* -------------------------------------------------------------------------- */
/* 2026 amounts, read from the pensions-2027 module (RD 241/2026, RDL 3/2026) */
/* -------------------------------------------------------------------------- */

export type WidowMinimumId = Extract<MinimumId, "widowCharges" | "widow65" | "widow60" | "widowUnder60">;
export const WIDOW_MINIMUM_IDS: readonly WidowMinimumId[] = ["widowCharges", "widow65", "widow60", "widowUnder60"];

/** RD 241/2026 anexo I, viudedad, euros a year in 14 payments. */
export const WIDOW_MINIMUMS: Record<WidowMinimumId, number> = Object.fromEntries(
  WIDOW_MINIMUM_IDS.map((id) => [id, MINIMUMS_2026.find((m) => m.id === id)!.single]),
) as Record<WidowMinimumId, number>;

/** RD 241/2026 anexo I: «Sin cónyuge a cargo 9.442,00 euros/año» (also RD 900/2018 art. 2.d and art. 31.2's «límite»). */
export const INCOME_LIMIT = MINIMUM_INCOME_LIMIT_2026.single;
/** LGSS art. 59.4 and RD 241/2026 art. 9.5: the complement never exceeds the non-contributory pension (8.803,20 € a year). */
export const COMPLEMENT_CAP = PNC_2026_ANNUAL;
/** LGSS art. 57: the initial amount never exceeds the maximum pension (3.359,60 € a month, 47.034,40 € a year). */
export const MAX_PENSION = MAX_PENSION_2026;
/** LGSS art. 60 and RDL 3/2026 art. 2.2: gender-gap complement, euros a month per child (up to four). */
export const GENDER_GAP = GENDER_GAP_2026;
export const GENDER_GAP_MAX_CHILDREN = 4;
/** Ordinary pensions: 12 months + June and November. */
export const PAYMENTS_ORDINARY = PAYMENTS;
/** Seguridad Social: work accidents and occupational illness have the extras «prorrateadas dentro de las doce mensualidades ordinarias». */
export const PAYMENTS_WORK_ACCIDENT = 12;

/** The minimum's row for an age: 65 or more (or a 65 % disability), 60 to 64, under 60; with family burdens the higher row. */
export function minimumRow(age: number, burdens: boolean, disability65: boolean): WidowMinimumId {
  if (burdens) return "widowCharges";
  if (age >= SENIOR_AGE || disability65) return "widow65";
  if (age >= 60) return "widow60";
  return "widowUnder60";
}

/** The minimum "en función de la edad del pensionista" (art. 31.2), by age only. */
export function ageMinimum(age: number): number {
  return WIDOW_MINIMUMS[age >= SENIOR_AGE ? "widow65" : age >= 60 ? "widow60" : "widowUnder60"];
}

/** Art. 31.2's ceiling for the 70 % as the BOE words it: the income limit + the minimum for the age. */
export function burdensCeiling(age: number): number {
  return round2(INCOME_LIMIT + ageMinimum(age));
}

/** The same ceiling as the Seguridad Social's page words it: the income limit + the minimum with family burdens. */
export const BURDENS_CEILING_SS = round2(INCOME_LIMIT + WIDOW_MINIMUMS.widowCharges);

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* -------------------------------------------------------------------------- */
/* Access (LGSS arts. 217, 219 to 223)                                        */
/* -------------------------------------------------------------------------- */

/** Art. 219.1: in alta or asimilada, 500 days within the five years before. */
export const ALTA_DAYS = 500;
export const ALTA_WINDOW_YEARS = 5;
/** Art. 219.1, second paragraph: without alta, 15 years. */
export const NO_ALTA_YEARS = 15;
/** Art. 219.2: one year of marriage, or common children, or cohabitation + marriage over two years. */
export const MARRIAGE_YEARS = 1;
export const MARRIAGE_PLUS_COHABITATION_YEARS = 2;
/** Art. 221.2: five years' cohabitation and a registration two years before the death; with common children two years' cohabitation. */
export const PARTNER_COHABITATION_YEARS = 5;
export const PARTNER_REGISTRATION_YEARS = 2;
export const PARTNER_CHILDREN_COHABITATION_YEARS = 2;
/** Art. 222: the prestación temporal lasts two years. */
export const TEMPORAL_YEARS = 2;
/** Art. 220.2: in a concurrence after divorce, 40 % for the spouse or partner at the time of death. */
export const CONCURRENCE_MIN_SHARE = 40;
/** Art. 229.3: when the viudedad is above 52 %, orphans' pensions together up to 48 % of the base. */
export const ORPHANS_MAX_SHARE = 48;
/** Art. 230 and the Seguridad Social: effects from the day after the death if applied for within three months; otherwise three months back. */
export const RETRO_MONTHS = 3;

/** Orden 13/02/1967 art. 11.1: a new marriage or partner keeps the pension over 61 … */
export const REMARRIAGE_AGE = 61;
/** … when the pension is at least 75 % of income … */
export const REMARRIAGE_MAIN_SHARE = 75;
/** … and the couple's income is at most twice the SMI a year. */
export const REMARRIAGE_SMI_TIMES = 2;
export const REMARRIAGE_INCOME_LIMIT = SMI.annual * REMARRIAGE_SMI_TIMES;

/** DT 13ª: separations and divorces before this day may not need the compensatory pension. */
export const DT13_BEFORE = "2008-01-01";
/** DT 13ª.1: at most 10 years between divorce and death, 10 years' marriage, common children or over 50. */
export const DT13 = { yearsSinceDivorce: 10, marriageYears: 10, age: 50, age65: 65, marriageYears65: 15 } as const;

/** RDL 31/2026: published and in force on this day (disposición final cuarta.1). */
export const RDL31_IN_FORCE = "2026-10-21";
/** No convalidación in the BOE's summaries up to RDL31_CHECKED; a test fails from CONVALIDATION_RECHECK_BY (shared with the sick-leave module). */
export const RDL31_STATUS: "pending" | "convalidated" | "repealed" = "pending";
export const RDL31_CHECKED = "2026-11-19";
export { CONVALIDATION_RECHECK_BY };

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export interface Source {
  name: string;
  url: string;
  publisher: string;
  ref: string;
  read: string;
}

const LGSS = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724";
const D3158 = "https://www.boe.es/buscar/act.php?id=BOE-A-1966-21116";
const O1967 = "https://www.boe.es/buscar/act.php?id=BOE-A-1967-2876";
const SS = "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966";
const SS_WIDOW = `${SS}/28489`;

export const LGSS_ANCHOR = {
  art57: `${LGSS}#a57`,
  art59: `${LGSS}#a59`,
  art60: `${LGSS}#a60`,
  art217: `${LGSS}#a217`,
  art219: `${LGSS}#a219`,
  art220: `${LGSS}#a220`,
  art221: `${LGSS}#a221`,
  art222: `${LGSS}#a222`,
  art223: `${LGSS}#a223`,
  art229: `${LGSS}#a229`,
  art230: `${LGSS}#a230`,
  dt13: `${LGSS}#dtdecimotercera`,
} as const;

export const SOURCES = {
  lgss: {
    name: "Real Decreto Legislativo 8/2015, texto refundido de la Ley General de la Seguridad Social (arts. 57, 59, 60, 216 a 223, 228 a 230 y disposición transitoria decimotercera)",
    url: LGSS,
    publisher: "BOE",
    ref: "BOE-A-2015-11724, texto consolidado, última actualización publicada el 11/11/2026",
    read: RULES_AS_OF,
  },
  rdl31: {
    name: "Real Decreto-ley 31/2026, de 20 de octubre, para la mejora de la acción protectora de la Seguridad Social y de otras normas sociales (art. 1.10: parejas de hecho; art. 1.18: DT 13ª; DT 48ª)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-21872",
    publisher: "BOE",
    ref: "BOE-A-2026-21872, en vigor desde el 21/10/2026; convalidación pendiente",
    read: RULES_AS_OF,
  },
  ley21: {
    name: "Ley 21/2021, de 28 de diciembre, de garantía del poder adquisitivo de las pensiones (arts. 221, 222 y 223 LGSS)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652",
    publisher: "BOE",
    ref: "BOE-A-2021-21652, en vigor desde el 01/01/2022",
    read: RULES_AS_OF,
  },
  d3158: {
    name: "Decreto 3158/1966, de 23 de diciembre, Reglamento general de la cuantía de las prestaciones del Régimen General (art. 31: 52 % y 70 %)",
    url: `${D3158}#atreintayuno`,
    publisher: "BOE",
    ref: "BOE-A-1966-21116, art. 31 en la redacción de los Reales Decretos 1465/2001 y 1795/2003",
    read: RULES_AS_OF,
  },
  rd1795: {
    name: "Real Decreto 1795/2003, de 26 de diciembre, de mejora de las pensiones de viudedad (el 52 %)",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2003-23712",
    publisher: "BOE",
    ref: "BOE-A-2003-23712",
    read: RULES_AS_OF,
  },
  rd900: {
    name: "Real Decreto 900/2018, de 20 de julio, en materia de pensión de viudedad (el 60 % desde los 65 años)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-10397",
    publisher: "BOE",
    ref: "BOE-A-2018-10397, 60 % desde el 01/01/2019",
    read: RULES_AS_OF,
  },
  orden1967: {
    name: "Orden de 13 de febrero de 1967, prestaciones de muerte y supervivencia (art. 11: nuevo matrimonio o pareja de hecho)",
    url: `${O1967}#a11`,
    publisher: "BOE",
    ref: "BOE-A-1967-2876, art. 11 en la redacción de los Reales Decretos 1465/2001 y 296/2009",
    read: RULES_AS_OF,
  },
  rd241: {
    name: `${PENSION_NORMS.rd241.name} (anexo I: cuantías mínimas; art. 9: límite de ingresos y complementos)`,
    url: PENSION_NORMS.rd241.url,
    publisher: "BOE",
    ref: PENSION_NORMS.rd241.ref,
    read: RULES_AS_OF,
  },
  rd126: {
    name: `${SMI.norm}, salario mínimo interprofesional para 2026`,
    url: smiBoeUrl(SMI),
    publisher: "BOE",
    ref: SMI.boeId,
    read: RULES_AS_OF,
  },
  ssWidow: {
    name: "Pensión de viudedad (Régimen General): causantes, beneficiarios, cuantía, efectos, compatibilidades, extinción y solicitudes",
    url: SS_WIDOW,
    publisher: "Seguridad Social",
    ref: "ficha de la prestación",
    read: RULES_AS_OF,
  },
  ssBeneficiaries: {
    name: "Pensión de viudedad: causantes y beneficiarios",
    url: `${SS_WIDOW}/28490`,
    publisher: "Seguridad Social",
    ref: "requisitos del fallecido, del cónyuge, de los separados y divorciados y de la pareja de hecho",
    read: RULES_AS_OF,
  },
  ssAmount: {
    name: "Pensión de viudedad: cuantía y abono",
    url: `${SS_WIDOW}/28492`,
    publisher: "Seguridad Social",
    ref: "porcentajes, base reguladora y pagas (la página aún muestra cifras de 2025)",
    read: RULES_AS_OF,
  },
  ssEffects: {
    name: "Pensión de viudedad: hecho causante y efectos económicos",
    url: `${SS_WIDOW}/28493`,
    publisher: "Seguridad Social",
    ref: "desde el día siguiente al fallecimiento o con 3 meses de retroactividad",
    read: RULES_AS_OF,
  },
  ssCompatibility: {
    name: "Pensión de viudedad: compatibilidades e incompatibilidades",
    url: `${SS_WIDOW}/28496`,
    publisher: "Seguridad Social",
    ref: "rentas de trabajo, jubilación, incapacidad permanente y SOVI",
    read: RULES_AS_OF,
  },
  ssExtinction: {
    name: "Pensión de viudedad: extinción",
    url: `${SS_WIDOW}/28497`,
    publisher: "Seguridad Social",
    ref: "nuevo matrimonio o pareja de hecho y sus excepciones",
    read: RULES_AS_OF,
  },
  ssApplication: {
    name: "Pensión de viudedad: solicitudes (documentos)",
    url: `${SS_WIDOW}/28498`,
    publisher: "Seguridad Social",
    ref: "documentos que acompañan la solicitud",
    read: RULES_AS_OF,
  },
  ssTemporal: {
    name: "Prestación temporal de viudedad",
    url: `${SS}/252`,
    publisher: "Seguridad Social",
    ref: "beneficiarios, cuantía y duración (2 años)",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** The official procedure: never done here, only linked. */
export const OFFICIAL_PROCEDURE = {
  /** "Presentación de solicitudes": the Portal de Prestaciones or the form, CAISS with an appointment, any official registry. */
  howTo: "https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Servicios/34887/34924",
  /** The online application (Portal de Prestaciones de la Seguridad Social). */
  portal: "https://prestaciones.seg-social.es/",
  /** The form page: "Solicitud de viudedad, orfandad y favor de familiares" (PDF dated 11/08/2026). */
  form: "https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Servicios/34887/40968/41026",
  /** Appointment at a CAISS office. */
  appointment: "https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/cita+previa+para+pensiones+y+otras+prestaciones/13cita+previa+para+pensiones+y+otras+prestaciones",
} as const;

/** The form's date on the Seguridad Social's page. */
export const FORM_DATE = "2026-08-11";

/** Verbatim quotes (Spanish, as published), read on RULES_AS_OF. */
export const QUOTE = {
  /** LGSS art. 217.1.c. */
  art217c: "Los titulares de pensiones contributivas de jubilación e incapacidad permanente.",
  /** LGSS art. 219.1, the 500 days. */
  art219alta:
    "siempre que si el sujeto causante se encontrase en alta o en situación asimilada a la de alta en la fecha de su fallecimiento hubiera completado un período de cotización de quinientos días, dentro de los cinco años inmediatamente anteriores a la fecha del hecho causante de la pensión.",
  /** LGSS art. 219.1, accidents. */
  art219accident: "En cualquier caso, si la causa de la muerte fuera un accidente, sea o no de trabajo, o una enfermedad profesional, no se exigirá ningún período previo de cotización.",
  /** LGSS art. 219.1, second paragraph. */
  art219noAlta:
    "También tendrá derecho a la pensión de viudedad el cónyuge superviviente aunque el causante, a la fecha de fallecimiento, no se encontrase en alta o en situación asimilada a la de alta, siempre que el mismo hubiera completado un período mínimo de cotización de quince años.",
  /** LGSS art. 219.2. */
  art219_2:
    "En los supuestos excepcionales en que el fallecimiento del causante derivara de enfermedad común, no sobrevenida tras el vínculo conyugal, se requerirá, además, que el matrimonio se hubiera celebrado con un año de antelación como mínimo a la fecha del fallecimiento o, alternativamente, la existencia de hijos comunes. No se exigirá dicha duración del vínculo matrimonial cuando en la fecha de celebración del mismo se acreditara un período de convivencia con el causante, en los términos establecidos en el artículo 221.2, que, sumado al de duración del matrimonio, hubiera superado los dos años.",
  /** LGSS art. 220.1, second paragraph. */
  art220comp:
    "Asimismo, se requerirá que las personas divorciadas o separadas judicialmente sean acreedoras de la pensión compensatoria a que se refiere el artículo 97 del Código Civil y esta quedara extinguida a la muerte del causante. En el supuesto de que la cuantía de la pensión de viudedad fuera superior a la pensión compensatoria, aquella se disminuirá hasta alcanzar la cuantía de esta última.",
  /** LGSS art. 220.1, third paragraph (opening). */
  art220violence:
    "En todo caso, tendrán derecho a la pensión de viudedad las mujeres que, aun no siendo acreedoras de pensión compensatoria, pudieran acreditar que eran víctimas de violencia de género en el momento de la separación judicial o el divorcio",
  /** LGSS art. 220.2. */
  art220_2:
    "Si, habiendo mediado divorcio, se produjera una concurrencia de beneficiarios con derecho a pensión, esta será reconocida en cuantía proporcional al tiempo vivido por cada uno de ellos con el causante, garantizándose, en todo caso, el 40 por ciento a favor del cónyuge superviviente o, en su caso, del que, sin ser cónyuge, conviviera con el causante en el momento del fallecimiento y resultara beneficiario de la pensión de viudedad en los términos a que se refiere el artículo siguiente.",
  /** LGSS art. 221.2, first paragraph (RDL 31/2026). */
  art221cohabitation:
    "A efectos de lo establecido en este artículo, se reconocerá como pareja de hecho la constituida, con análoga relación de afectividad a la conyugal, por quienes, no hallándose impedidos para contraer matrimonio, no tengan vínculo matrimonial con otra persona ni constituida pareja de hecho, y acrediten, mediante el correspondiente certificado de empadronamiento, una convivencia estable y notoria con carácter inmediato al fallecimiento del causante y con una duración ininterrumpida no inferior a cinco años.",
  /** LGSS art. 221.2, second paragraph. */
  art221registration:
    "La existencia de pareja de hecho se acreditará mediante certificación de la inscripción en alguno de los registros específicos existentes en las comunidades autónomas o ayuntamientos del lugar de residencia o mediante documento público en el que conste la constitución de dicha pareja. Tanto la mencionada inscripción como la formalización del correspondiente documento público deberán haberse producido con una antelación mínima de dos años con respecto a la fecha del fallecimiento del causante.",
  /** LGSS art. 221.2, third paragraph, added by RDL 31/2026 art. 1.10. */
  art221children:
    "En el caso de que existan hijos en común únicamente será exigible el requisito de una convivencia estable y notoria durante un periodo de al menos dos años ininterrumpidos, con carácter inmediato al fallecimiento del causante. Dicha convivencia deberá ser acreditada mediante el correspondiente certificado de empadronamiento.",
  /** LGSS art. 221.2 as worded by Ley 21/2021 (1 Jan 2022 to 20 Oct 2026), the end of its first paragraph. */
  art221children2021: "salvo que existan hijos en común, en cuyo caso solo deberán acreditar la constitución de la pareja de hecho de conformidad con lo previsto en el párrafo siguiente.",
  /** RDL 31/2026, preamble. */
  rdl31why:
    "se flexibilizan determinados requisitos de acceso a la pensión de viudedad de las parejas de hecho que tengan hijos o hijas en común, eliminando exigencias formales que han venido generando situaciones de desprotección y una elevada litigiosidad.",
  /** LGSS DT 48ª.1.c (RDL 31/2026 art. 1.19). */
  dt48:
    "la correspondiente solicitud deberá ser presentada en el plazo improrrogable de los doce meses siguientes a la entrada en vigor del Real Decreto-ley 31/2026, de 20 de octubre.",
  /** LGSS art. 222. */
  art222:
    "Cuando el cónyuge o la pareja de hecho superviviente no pueda acceder al derecho a pensión de viudedad por no acreditar, respectivamente, que su matrimonio con el causante ha tenido una duración de un año en los términos del artículo 219.2, o por la inexistencia de hijos comunes, o que su inscripción como pareja de hecho en alguno de los registros específicos existentes en las comunidades autónomas o ayuntamientos del lugar de residencia o su constitución mediante documento público se han producido con una antelación mínima de dos años respecto de la fecha del fallecimiento del causante, pero concurran el resto de requisitos enumerados en el artículo 219, tendrá derecho a una prestación temporal en cuantía igual a la de la pensión de viudedad que le hubiera correspondido y con una duración de dos años.",
  /** LGSS art. 223.1, first paragraph. */
  art223work: "La pensión de viudedad será compatible con cualesquiera rentas de trabajo.",
  /** LGSS art. 223.1, second paragraph. */
  art223other:
    "La pensión de viudedad, causada en las condiciones establecidas en el segundo párrafo del artículo 219.1, incluido el supuesto de parejas de hecho, será incompatible con el reconocimiento de otra pensión de viudedad, en cualquiera de los regímenes de la Seguridad Social, salvo que las cotizaciones acreditadas en cada uno de los regímenes se superpongan, al menos, durante quince años.",
  /** LGSS art. 223.2. */
  art223end:
    "El derecho a pensión de viudedad se extinguirá, en todo caso, cuando el beneficiario contraiga matrimonio o constituya una pareja de hecho en los términos regulados en el artículo 221, sin perjuicio de las excepciones establecidas reglamentariamente.",
  /** LGSS art. 229.3. */
  art229_3:
    "el límite establecido podrá ser rebasado en caso de concurrencia de varias pensiones de orfandad con una pensión de viudedad cuando el porcentaje a aplicar a la correspondiente base reguladora para el cálculo de esta última sea superior al 52 por ciento, si bien, en ningún caso, la suma de las pensiones de orfandad podrá superar el 48 por ciento de la base reguladora que corresponda.",
  /** LGSS art. 230. */
  art230:
    "El derecho al reconocimiento de las prestaciones por muerte y supervivencia, con excepción del auxilio por defunción, será imprescriptible, sin perjuicio de que los efectos de tal reconocimiento se produzcan a partir de los tres meses anteriores a la fecha en que se presente la correspondiente solicitud.",
  /** LGSS art. 59.1, second paragraph. */
  art59income:
    "Los complementos por mínimos serán incompatibles con la percepción por el pensionista de los rendimientos indicados en el párrafo anterior cuando la suma de todas las percepciones mencionadas, excluida la pensión que se vaya a complementar, exceda el límite fijado en la correspondiente Ley de Presupuestos Generales del Estado para cada ejercicio.",
  /** LGSS art. 59.4, first sentence. */
  art59cap: "El importe de los complementos en ningún caso podrá superar la cuantía establecida en cada ejercicio para las pensiones no contributivas de jubilación e invalidez.",
  /** LGSS art. 60.1, opening. */
  art60: "Las mujeres que hayan tenido uno o más hijos o hijas y que sean beneficiarias de una pensión contributiva de jubilación, de incapacidad permanente o de viudedad, tendrán derecho a un complemento por cada hijo o hija",
  /** LGSS DT 13ª.1, opening. */
  dt13:
    "El reconocimiento del derecho a la pensión de viudedad no quedará condicionado a que la persona divorciada o separada judicialmente sea acreedora de la pensión compensatoria a que se refiere el párrafo segundo del artículo 220.1, cuando entre la fecha del divorcio o de la separación judicial y la fecha del fallecimiento del causante de la pensión de viudedad haya transcurrido un periodo de tiempo no superior a diez años, siempre que el vínculo matrimonial haya tenido una duración mínima de diez años y además concurra en el beneficiario alguna de las condiciones siguientes:",
  /** LGSS DT 13ª.2 (RDL 31/2026). */
  dt13_2:
    "También tendrán derecho a la pensión de viudedad las personas que se encuentren en la situación señalada en el primer párrafo del apartado anterior, aunque no reúnan los requisitos señalados en el mismo, siempre que se trate de personas con sesenta y cinco o más años y la duración del matrimonio con el causante de la pensión no haya sido inferior a quince años.",
  /** Decreto 3158/1966 art. 31.1 (RD 1795/2003). */
  d31_1: "El porcentaje a aplicar a la correspondiente base reguladora para la determinación de la cuantía de la pensión de viudedad será del 52 por ciento.",
  /** Decreto 3158/1966 art. 31.2, first paragraph. */
  d31_2:
    "Cuando la pensión de viudedad constituya la principal o única fuente de ingresos del pensionista, aquéllos no superen la cuantía a que se refiere el párrafo siguiente y el pensionista tenga cargas familiares, el porcentaje señalado en el apartado 1 será del 70 por 100.",
  /** Decreto 3158/1966 art. 31.2, second paragraph. */
  d31_2limit:
    "Para la aplicación del porcentaje señalado, será necesario que los rendimientos anuales del pensionista por todos los conceptos no superen la cuantía resultante de sumar al límite que, en cada ejercicio económico, esté previsto para el reconocimiento de los complementos por mínimos de las pensiones contributivas, el importe anual que, en cada ejercicio, corresponda a la pensión mínima de viudedad en función de la edad del pensionista, entendiéndose que la pensión constituye la principal o única fuente de ingresos del pensionista, cuando el importe anual de la misma represente, como mínimo, el 50 por 100 del total de los ingresos de aquél, también en cómputo anual. A tales efectos, como cuantía de la pensión se tendrá en cuenta también el importe del complemento a mínimo que pudiera corresponder.",
  /** Decreto 3158/1966 art. 31.2, third paragraph. */
  d31_2burdens:
    "Se entenderá por cargas familiares la convivencia del beneficiario con hijos menores de veintiséis años o mayores incapacitados, o menores acogidos, cuando los rendimientos del conjunto de la unidad familiar, así constituida, incluido el pensionista, dividida entre el número de miembros que la compongan, no supere, en cómputo anual, el 75 por 100 del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias.",
  /** Decreto 3158/1966 art. 31.3. */
  d31_3:
    "La aplicación del porcentaje del 70 por 100 sobre la respectiva base reguladora no podrá dar lugar a que la suma de la cuantía, en cómputo anual, de la pensión de viudedad, más los rendimientos anuales percibidos por el interesado, excedan del límite a que se refiere el párrafo segundo del apartado anterior. En caso contrario, se procederá a reducir la cuantía de la pensión de viudedad, a fin de no superar el límite señalado.",
  /** RD 900/2018 art. 2, letters a to d. */
  rd900a: "Haber cumplido una edad igual o superior a los 65 años.",
  rd900b: "No tener derecho a otra pensión pública española o extranjera.",
  rd900c: "No percibir ingresos por la realización de trabajo, ya sea por cuenta propia o ajena.",
  rd900d:
    "No percibir rendimientos del capital, de actividades económicas o ganancias patrimoniales, de acuerdo con el concepto establecido para dichas rentas en el Impuesto sobre la Renta de las Personas Físicas, que en cómputo anual superen el límite de ingresos establecido en la correspondiente Ley de Presupuestos Generales del Estado para ser beneficiario de la pensión mínima de viudedad.",
  /** RD 900/2018 art. 3. */
  rd900_3: "Cuando concurran los requisitos recogidos en el artículo anterior, el importe de la pensión de viudedad se determinará aplicando a la base reguladora que corresponda el porcentaje del 60 por ciento.",
  /** RD 900/2018 art. 7, end. */
  rd900_7: "procederá el reconocimiento de aquel, de resultar más favorable, no pudiendo acumularse a la mejora regulada en este real decreto.",
  /** Orden 13/02/1967 art. 11.1.a. */
  o11a: "Ser mayor de sesenta y un años o menor de dicha edad, siempre que, en este último caso, tengan reconocida también una pensión de incapacidad permanente, en el grado de incapacidad absoluta o de gran invalidez, o acrediten una minusvalía en un grado igual o superior al 65 por 100.",
  /** Orden 13/02/1967 art. 11.1.b, second sentence. */
  o11b: "Se entenderá que la pensión o pensiones de viudedad constituye la principal fuente de rendimientos, cuando el importe anual de la misma o de las mismas represente, como mínimo, el 75 por 100 del total de ingresos de aquél, en cómputo anual.",
  /** Orden 13/02/1967 art. 11.1.c, first paragraph. */
  o11c: "Tener el matrimonio unos ingresos anuales, de cualquier naturaleza, incluida la pensión o pensiones de viudedad, que no superen dos veces el importe, en cómputo anual, del salario mínimo interprofesional, vigente en cada momento.",
  /** RD 241/2026 art. 9.2, second paragraph. */
  rd241partial:
    "Cuando la suma, en cómputo anual, de los rendimientos referidos en el párrafo anterior y los correspondientes a la pensión resulte inferior a la suma de 9.442,00 euros anuales más el importe, también en cómputo anual, de la cuantía mínima fijada para la clase de pensión de que se trate, se reconocerá un complemento igual a la diferencia, distribuido entre el número de mensualidades en que se devenga la pensión.",
  /** RD 241/2026 art. 9.9, second paragraph (inside the Clases Pasivas paragraph). */
  rd241compensatory:
    "Las pensiones de viudedad causadas a partir de 1 de enero de 2013, cuyo importe sea equivalente al de la pensión compensatoria que le hubiere correspondido en el momento de la separación o divorcio, no podrán ser complementadas.",
  /** Seguridad Social, cuantía: the 70 % ceiling as its page words it. */
  ssCeiling: "el importe anual que, en cada ejercicio económico, corresponda a la pensión mínima de viudedad con cargas familiares.",
  /** Seguridad Social, cuantía: the base for a death from common contingencies. */
  ssBaseCommon:
    "La base reguladora será el cociente que resulte de dividir por 28 la suma de las bases de cotización del interesado durante un período ininterrumpido de 24 meses",
  ssBaseWindow: "Dicho período será elegido por los beneficiarios dentro de los 15 años inmediatamente anteriores al mes previo al del hecho causante (fallecimiento) de la pensión.",
  /** Seguridad Social, cuantía: a pensioner's death. */
  ssBasePensioner: "La base reguladora será la misma que sirvió para determinar la pensión de jubilación o incapacidad permanente del fallecido",
  /** Seguridad Social, cuantía: payments. */
  ssPayments:
    "La pensión se abona a los beneficiarios mensualmente, con dos pagas extraordinarias al año, que se hacen efectivas con las mensualidades de junio y noviembre, salvo en los casos de accidente de trabajo y enfermedad profesional, en que están prorrateadas dentro de las doce mensualidades ordinarias.",
  /** Seguridad Social, compatibilidades. */
  ssCompatible: "La pensión de viudedad es compatible con cualquier renta de trabajo del beneficiario y con la pensión de jubilación o incapacidad permanente a que el mismo tuviera derecho.",
  /** Seguridad Social, efectos (alta o asimilada). */
  ssEffects: "Día siguiente al del fallecimiento, si la solicitud se presenta dentro de los 3 meses siguientes al mismo.",
  /** Seguridad Social, presentación de solicitudes. */
  ssHowTo:
    "Las solicitudes se presentarán a través del Portal de Prestaciones de la Seguridad Social, o mediante el modelo oficial de formulario, el cual incluye instrucciones claras y sencillas para su correcta cumplimentación.",
} as const;
