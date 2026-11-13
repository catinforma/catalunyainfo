import { IPREM_MONTHLY, SMI_MONTHLY } from "@/lib/programmatic/employment/rules";

/**
 * The rules behind the unemployment subsidy checker (subsidio por desempleo)
 * and the short Ingreso Mínimo Vital section. Nothing is estimated: every
 * figure and rule below was read on SUBSIDY_RULES_AS_OF on the official text
 * quoted next to it. Client-safe (no data files, no server code).
 *
 * The law: Ley General de la Seguridad Social (LGSS), arts. 274 to 282 and
 * DA 57ª, 58ª and 59ª, in the BOE consolidated text (last update published
 * 11/11/2026 when read), as worded by Real Decreto-ley 2/2024 (BOE-A-2024-10235),
 * in force for subsidies from 1 November 2024 (its DT 1ª keeps the old wording
 * until 31 October 2024).
 *
 * IPREM and SMI are the employment module's (one source for every calculator):
 * IPREM 600 €/month (Ley 31/2022 DA 90ª, budget prorogued; SEPE "Cuantías
 * anuales" 2026), SMI 2026 1.221 €/month (RD 126/2026). From 1 Jan 2027 a test
 * fails until both are re-read (a 2027 budget, decree-law or SMI decree can
 * change them) and SUBSIDY_RULES_UNTIL moves.
 */

/** The day every rule and figure here was read on the BOE, SEPE and Seguridad Social pages. */
export const SUBSIDY_RULES_AS_OF = "2026-11-13";
/** A test fails from this day: re-read IPREM 2027, SMI 2027 and the IMV 2027 amounts. */
export const SUBSIDY_RULES_UNTIL = "2027-01-01";
/** RDL 2/2024 applies to subsidies whose hecho causante is on or after this day (DT 1ª). */
export const REFORM_FROM = "2024-11-01";
export const RULES_YEAR = 2026;

export { IPREM_MONTHLY, SMI_MONTHLY };

const cents = (x: number) => Math.round(x * 100) / 100;

/* -------------------------------------------------------------------------- */
/* Income test (art. 275)                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Art. 275.1 and 275.2: rents of the month before the application «no superen
 * el 75 por ciento del salario mínimo interprofesional, excluida la parte
 * proporcional de dos pagas extraordinarias». So 75 % of the monthly SMI, not of
 * SMI × 14 / 12. SEPE "Cuantías anuales" prints «75% SMI 915,75 €».
 */
export const INCOME_LIMIT_SHARE = 0.75;
export const INCOME_LIMIT = cents(SMI_MONTHLY * INCOME_LIMIT_SHARE);
/** What SEPE prints for 2026; a test checks the computed limit against it. */
export const SEPE_INCOME_LIMIT_2026 = 915.75;

/* -------------------------------------------------------------------------- */
/* Amount (art. 278, art. 280.4)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Art. 278: «el 95 por ciento durante los ciento ochenta primeros días, el 90
 * por ciento desde el día ciento ochenta y uno al día trescientos sesenta, y el
 * 80 por ciento a partir del día trescientos sesenta y uno». SEPE pays in
 * 30-day months, so days 1–180 are months 1–6 and 181–360 months 7–12.
 */
export const AMOUNT_BANDS: readonly { fromMonth: number; toMonth: number | null; share: number }[] = [
  { fromMonth: 1, toMonth: 6, share: 0.95 },
  { fromMonth: 7, toMonth: 12, share: 0.9 },
  { fromMonth: 13, toMonth: null, share: 0.8 },
];
/** Art. 280.4: over-52 subsidy «igual al 80 por ciento del indicador público de rentas de efectos múltiples mensual». */
export const OVER52_SHARE = 0.8;
/** SEPE "Cuantías anuales" 2026 (read 13 Nov 2026): 570,00 / 540,00 / 480,00 €; over-52 480,00 €. */
export const SEPE_AMOUNTS_2026 = [570, 540, 480] as const;

export function monthlyAmount(share: number): number {
  return cents(IPREM_MONTHLY * share);
}

/* -------------------------------------------------------------------------- */
/* Who and for how long (arts. 274, 277, 280, DA 57ª, DA 58ª)                 */
/* -------------------------------------------------------------------------- */

/** Art. 274.1.b: «siempre que hayan cotizado al menos noventa días». */
export const MIN_DAYS_INSUFFICIENT = 90;
/** From 360 days contributed there is a contributory benefit (art. 269.1), and the subsidy needs «no tener derecho a la prestación contributiva» (art. 274.2). */
export const CONTRIBUTORY_MIN_DAYS = 360;
/** Art. 274.1.a: «En caso de ser menor de cuarenta y cinco años sin responsabilidades familiares se exigirá, además, que la prestación por desempleo agotada haya tenido una duración igual o superior a trescientos sesenta días». */
export const YOUNG_AGE = 45;
export const YOUNG_MIN_EXHAUSTED_DAYS = 360;
/** The shortest contributory benefit (art. 269.1: 360 days contributed → 120 days of benefit). */
export const MIN_EXHAUSTED_DAYS = 120;

/**
 * Art. 277.1 (subsidy after exhausting the benefit), the BOE table:
 * no family responsibilities: under 45 with ≥ 360 days exhausted, or 45 and
 * over with ≥ 120 days → 6 months; with family responsibilities, any age:
 * ≥ 120 days → 24 months, ≥ 180 days → 30 months.
 */
export const EXHAUSTED_MONTHS = { noFamily: 6, family120: 24, family180: 30 } as const;
export const FAMILY_LONG_FROM_DAYS = 180;

/**
 * Art. 277.2 (insufficient contributions), the BOE table: 90 days → 3 months,
 * 120 → 4, 150 → 5, 180 → 6 without family responsibilities or 21 with them.
 * [from days contributed, months without RF, months with RF].
 */
export const INSUFFICIENT_SCALE: readonly (readonly [number, number, number])[] = [
  [90, 3, 3],
  [120, 4, 4],
  [150, 5, 5],
  [180, 6, 21],
];

/** Art. 280.1: «tengan cumplida dicha edad» (52) when they exhaust the benefit or become unemployed. */
export const OVER52_AGE = 52;
/** Art. 280.1: «hayan cotizado efectivamente en España por desempleo durante al menos seis años a lo largo de su vida laboral». */
export const OVER52_UNEMPLOYMENT_YEARS = 6;
/** Art. 205.1.b LGSS (the retirement requirement art. 280.1 asks for, «salvo la edad»): «quince años, de los cuales al menos dos deberán estar comprendidos dentro de los quince años inmediatamente anteriores». */
export const RETIREMENT_MIN_YEARS = 15;
export const RETIREMENT_RECENT_YEARS = 2;

/** DA 57ª.4: emigrantes retornados, «La duración máxima del subsidio será de dieciocho meses». */
export const EMIGRANT_MONTHS = 18;
/** DA 57ª.1.d: «Haber trabajado en los citados países, como mínimo, doce meses en los últimos seis años desde su última salida de España». */
export const EMIGRANT_MONTHS_ABROAD = 12;
/** DA 58ª.7: víctimas de violencia de género o sexual, 30 months, 20 or 10 after one or two earlier Renta Activa de Inserción rights. Index = earlier RAI rights. */
export const VICTIM_MONTHS = [30, 20, 10] as const;

/** Art. 277.3: «el subsidio se reconocerá por periodos trimestrales, prorrogables hasta agotar la duración máxima». */
export const PERIOD_MONTHS = 3;

/* -------------------------------------------------------------------------- */
/* Complemento de apoyo al empleo (art. 282.3)                                */
/* -------------------------------------------------------------------------- */

export const CAE_JOBS = ["full", "part75", "part50", "partLow"] as const;
export type CaeJob = (typeof CAE_JOBS)[number];
/**
 * Art. 282.3, % of IPREM by quarter of the subsidy (1st … 5th and later), for
 * a full-time job, part-time ≥ 75 %, < 75 % and ≥ 50 %, and < 50 % of the
 * working day. SEPE prints the same in euros (480 / 450 / 420 / 360 € in the
 * first quarter … 120 / 90 / 60 / 30 € from the fifth).
 */
export const CAE_SHARES: readonly Record<CaeJob, number>[] = [
  { full: 0.8, part75: 0.75, part50: 0.7, partLow: 0.6 },
  { full: 0.6, part75: 0.5, part50: 0.45, partLow: 0.4 },
  { full: 0.4, part75: 0.35, part50: 0.3, partLow: 0.25 },
  { full: 0.3, part75: 0.25, part50: 0.2, partLow: 0.15 },
  { full: 0.2, part75: 0.15, part50: 0.1, partLow: 0.05 },
];
/** Art. 282.3: «Su duración máxima será de ciento ochenta días». */
export const CAE_MAX_DAYS = 180;

/* -------------------------------------------------------------------------- */
/* Ingreso Mínimo Vital 2026 (Ley 19/2021, art. 13; RDL 3/2026, art. 2.5)     */
/* -------------------------------------------------------------------------- */

/** RDL 3/2026 art. 2.5: «Las pensiones no contributivas … tendrán un importe anual de 8.803,20 euros» (2026). */
export const PNC_ANNUAL_2026 = 8803.2;
/** Ley 19/2021 art. 13.2.a: renta garantizada individual = «100 por ciento del importe anual de las pensiones no contributivas … dividido por doce». */
export const IMV_SINGLE_MONTHLY = cents(PNC_ANNUAL_2026 / 12);
/** Art. 13.2.b and Anexo I: +30 % per additional member, up to 220 %. Index = members − 1 (5 or more → 2.2). */
export const IMV_SCALE = [1, 1.3, 1.6, 1.9, 2.2] as const;
/** Art. 13.2.c and d: one-adult-with-children (monoparental) and disability ≥ 65 % supplements, each 22 % of the single amount. */
export const IMV_SUPPLEMENT_SHARE = 0.22;
/**
 * Complemento de ayuda para la infancia, 2026, per child a month, as the
 * Seguridad Social IMV page prints it (read 13 Nov 2026): under 3: 115 €,
 * 3 to 5: 80,50 €, 6 to 17: 57,50 €. (The consolidated art. 13.2.e still
 * shows the 2021 figures, 100 / 70 / 50 €.)
 */
export const IMV_CHILD_2026 = { under3: 115, under6: 80.5, under18: 57.5 } as const;
/** The Seguridad Social page's 2026 figures, checked by a test against what art. 13 computes. */
export const SS_IMV_2026 = { single: 733.6, scale: [733.6, 953.68, 1173.76, 1393.84, 1613.92], monoparental: [1115.07, 1335.15, 1555.23, 1775.31] } as const;

/** Monthly guaranteed income for a household of `members` (1–5+), with the monoparental supplement when one adult lives with children. */
export function imvGuaranteed(members: number, monoparental = false): number {
  const i = Math.min(IMV_SCALE.length, Math.max(1, Math.floor(members))) - 1;
  const base = IMV_SINGLE_MONTHLY * IMV_SCALE[i]!;
  return cents(base + (monoparental && members >= 2 ? IMV_SINGLE_MONTHLY * IMV_SUPPLEMENT_SHARE : 0));
}

/* -------------------------------------------------------------------------- */
/* Quotes and sources                                                         */
/* -------------------------------------------------------------------------- */

export const QUOTE = {
  art274: "Serán beneficiarios del subsidio los desempleados que, cumpliendo los requisitos establecidos en el apartado 2, se encuentren en alguna de las siguientes situaciones: a) Haber agotado la prestación por desempleo. […] b) Encontrarse en situación legal de desempleo sin tener cubierto el periodo mínimo de cotización para tener derecho a la prestación contributiva, siempre que hayan cotizado al menos noventa días.",
  art274_2: "Además, en la fecha de la solicitud del subsidio se exigirá no tener derecho a la prestación contributiva por desempleo, no encontrase en supuesto de incompatibilidad y carecer de rentas propias, o bien, alternativamente, acreditar responsabilidades familiares.",
  art275_1: "Se entenderá cumplido el requisito de carencia de rentas propias […] cuando las rentas de cualquier naturaleza de la persona solicitante o beneficiaria durante el mes natural anterior a dichas fechas no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias.",
  art275_2: "Se entenderá cumplido el requisito de responsabilidades familiares […] cuando la suma de las rentas obtenidas durante el mes natural anterior a dichas fechas por el conjunto de la unidad familiar, incluida la persona solicitante o beneficiaria, dividida entre el número de miembros que la componen, no supere el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias.",
  art275_3: "se entenderá por unidad familiar la compuesta por la persona solicitante o beneficiaria, su cónyuge o pareja de hecho y los hijos e hijas menores de veintiséis años, o mayores con discapacidad, o menores acogidos y acogidas o en guarda con fines de adopción o acogimiento, que convivan o dependan económicamente de la persona solicitante o beneficiaria.",
  art278: "La cuantía del subsidio será igual a los siguientes porcentajes del indicador público de rentas de efectos múltiples mensual vigente en cada momento: el 95 por ciento durante los ciento ochenta primeros días, el 90 por ciento desde el día ciento ochenta y uno al día trescientos sesenta, y el 80 por ciento a partir del día trescientos sesenta y uno.",
  art280_1: "Podrán acceder al subsidio para mayores de cincuenta y dos años los trabajadores que, en la fecha en que se encuentren en el supuesto previsto en el artículo 274.1 tengan cumplida dicha edad y además en la fecha del hecho causante […] acrediten todos los requisitos, salvo la edad, para acceder a cualquier tipo de pensión contributiva de jubilación en el sistema de la Seguridad Social, hayan cotizado efectivamente en España por desempleo durante al menos seis años a lo largo de su vida laboral […]",
  art280_9: "La entidad gestora cotizará por la contingencia de jubilación durante la percepción del subsidio por desempleo para trabajadores mayores de cincuenta y dos años.",
  sepeOver52Duration: "La duración será hasta que alcances la edad ordinaria que se exija para tener derecho a la pensión contributiva de jubilación en el sistema de la Seguridad Social.",
  art282_3: "Para quienes accedan al subsidio por desempleo manteniendo uno o varios contratos a tiempo parcial así como para quienes siendo beneficiarios del mismo inicien una relación laboral a tiempo completo o parcial, el subsidio se compatibilizará como complemento de apoyo al empleo […]",
  art276_1: "El derecho al subsidio por desempleo nace a partir del día siguiente al del hecho causante siempre que se solicite en los quince días hábiles siguientes a la fecha del mismo. Solicitado fuera de dicho plazo, pero dentro de los seis meses siguientes a la fecha del hecho causante, nacerá el día de presentación de la solicitud.",
  sepePayment: "El pago del subsidio se realizará por mensualidades de 30 días, entre los días 10 y 15 del mes inmediato siguiente al que corresponda el devengo.",
  rdl2Prison: "se eliminan las particularidades de acceso al subsidio por desempleo hasta el momento previstas para el colectivo de personas liberadas de prisión",
  imv13: "En el caso de una persona beneficiaria individual, la cuantía mensual de renta garantizada ascenderá al 100 por ciento del importe anual de las pensiones no contributivas fijadas anualmente en la Ley de Presupuestos Generales del Estado, dividido por doce.",
  rdl3Pnc: "Las pensiones no contributivas del sistema de la Seguridad Social de incapacidad y jubilación tendrán un importe anual de 8.803,20 euros.",
  art282_4: "La prestación y el subsidio serán compatibles con la percepción de cualquier tipo de rentas mínimas, salarios sociales o ayudas análogas de asistencia social concedidas por cualquier Administración Pública, y con la percepción de las prestaciones económicas no contributivas de la Seguridad Social, excepto la de jubilación.",
} as const;

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** The day it was read. */
  date: string;
}

const LGSS = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724";

export const SOURCES = {
  lgss: { name: "Ley General de la Seguridad Social (RDL 8/2015), texto consolidado, arts. 274 a 282 y DA 57ª a 59ª", ref: "BOE-A-2015-11724, actualización del 11/11/2026", url: LGSS, date: SUBSIDY_RULES_AS_OF },
  rdl2: { name: "Real Decreto-ley 2/2024, de 21 de mayo (reforma del nivel asistencial)", ref: "BOE-A-2024-10235", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2024-10235", date: SUBSIDY_RULES_AS_OF },
  sepeAmounts: { name: "SEPE, Cuantías anuales (IPREM, SMI, subsidios, CAE)", ref: "sepe.es", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html", date: SUBSIDY_RULES_AS_OF },
  sepeSubsidy: { name: "SEPE, Subsidios por desempleo", ref: "sepe.es", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo.html", date: SUBSIDY_RULES_AS_OF },
  sepeOver52: { name: "SEPE, Tengo más de 52 años", ref: "sepe.es", url: "https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo/tengo-mas-de-52.html", date: SUBSIDY_RULES_AS_OF },
  pge2023: { name: "Ley 31/2022, PGE 2023, DA 90ª (IPREM 600 €, prorrogada)", ref: "BOE-A-2022-22128", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128", date: SUBSIDY_RULES_AS_OF },
  smi2026: { name: "Real Decreto 126/2026, SMI 2026", ref: "BOE-A-2026-3815", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3815", date: SUBSIDY_RULES_AS_OF },
  imvLaw: { name: "Ley 19/2021, del ingreso mínimo vital, texto consolidado (art. 13 y anexo I)", ref: "BOE-A-2021-21007", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007", date: SUBSIDY_RULES_AS_OF },
  rdl3: { name: "Real Decreto-ley 3/2026, revalorización de las pensiones 2026 (art. 2.5), convalidado", ref: "BOE-A-2026-2548", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548", date: SUBSIDY_RULES_AS_OF },
  ssImv: { name: "Seguridad Social, Ingreso mínimo vital (cuantías 2026)", ref: "seg-social.es", url: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/65850d68-8d06-4645-bde7-05374ee42ac7", date: SUBSIDY_RULES_AS_OF },
} as const satisfies Record<string, Source>;

/** Article anchors on the BOE consolidated LGSS. */
export const LGSS_ART = (anchor: string) => `${LGSS}#${anchor}`;

/** Linked from the SEPE and Seguridad Social pages above (read 13 Nov 2026). */
export const OFFICIAL_LINKS = {
  sepeApply: "https://sede.sepe.gob.es/portalSede/procedimientos-y-servicios/personas/proteccion-por-desempleo/solicitud-de-prestaciones.html",
  imvSimulator: "https://imv.seg-social.es/",
} as const;
