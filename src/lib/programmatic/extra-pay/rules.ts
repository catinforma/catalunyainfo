/**
 * The rules behind the Christmas extra pay calculator ("paga extra de
 * Navidad"), each quoted from the official text it comes from. Nothing
 * numeric is typed here except the dates: the withholding rate and the
 * contribution rates come from the net salary calculator's rules
 * (net-salary/rules-2026.ts), whose engine this tool reuses. Client-safe.
 *
 * ## Read on 17 Nov 2026 (fact pack: research_notes/paga-extra-navidad-2026.md)
 *
 *  - Estatuto de los Trabajadores (RDL 2/2015, BOE-A-2015-11430),
 *    consolidated text "última actualización publicada el 21/10/2026":
 *    art. 31 (two extra pays, one at Christmas; amount set by the
 *    collective agreement; may be spread over the 12 months) and art. 29.1
 *    (salary paid on the agreed date or by custom). The law sets neither the
 *    day of payment nor the accrual period (devengo): the collective
 *    agreement does, so the calculator asks.
 *  - Ley General de la Seguridad Social (RDL 8/2015, BOE-A-2015-11724),
 *    update of 11/11/2026: art. 147.1 (payments due less often than monthly
 *    are spread over the twelve months of the contribution base) and art.
 *    46 (pensions: 14 payments, extras accrued in June and November).
 *  - Orden PJC/297/2026 (BOE-A-2026-7296), consolidated 31/03/2026: art. 1.1,
 *    rule two (the proportional part of the "gratificaciones
 *    extraordinarias" is added to each month's base; monthly pay: annual
 *    estimate ÷ 12) and art. 29.2 (a complementary settlement when the
 *    amount could not be known in advance).
 *  - Reglamento del IRPF (RD 439/2007, BOE-A-2007-6820), update of
 *    07/10/2026: art. 82.5ª (the rate applies to every payment), 83.2.1ª
 *    (the rate is worked out on the year's expected pay, extras included)
 *    and 87 (regularisations during the year).
 *
 * Seguridad Social's own "Bases y tipos de cotización 2026" page states the
 * prorating rule only for household employees (citing art. 147.1 LGSS), so
 * the general rule is quoted from the BOE texts above.
 */

/** When every source below was last read in full. */
export const EXTRA_PAY_RULES_AS_OF = "2026-11-17";
/**
 * The Christmas pay this edition is about (paid in December 2026), with the
 * 2026 withholding algorithm and contribution order. From this day a test
 * fails until the year, the example and the net salary rules move to 2027.
 */
export const EXTRA_PAY_RULES_UNTIL = "2027-01-01";
export const EXTRA_PAY_YEAR = 2026;

/** Accrual period of the Christmas pay, set by the collective agreement: the calendar year or the second half. */
export type Accrual = "annual" | "semester";

/** First and last day of the Christmas pay's accrual period in `year`. */
export function accrualPeriod(accrual: Accrual, year: number = EXTRA_PAY_YEAR): { from: string; to: string } {
  return accrual === "semester" ? { from: `${year}-07-01`, to: `${year}-12-31` } : { from: `${year}-01-01`, to: `${year}-12-31` };
}

/** Verbatim from the BOE consolidated texts, read on EXTRA_PAY_RULES_AS_OF. */
export const QUOTE = {
  et31:
    "El trabajador tiene derecho a dos gratificaciones extraordinarias al año, una de ellas con ocasión de las fiestas de Navidad y la otra en el mes que se fije por convenio colectivo o por acuerdo entre el empresario y los representantes legales de los trabajadores. Igualmente se fijará por convenio colectivo la cuantía de tales gratificaciones. No obstante, podrá acordarse en convenio colectivo que las gratificaciones extraordinarias se prorrateen en las doce mensualidades.",
  et29: "La liquidación y el pago del salario se harán puntual y documentalmente en la fecha y lugar convenidos o conforme a los usos y costumbres.",
  lgss147: "Las percepciones de vencimiento superior al mensual se prorratearán a lo largo de los doce meses del año.",
  orden1:
    "A la remuneración computada conforme a la norma anterior se añadirá la parte proporcional de las gratificaciones extraordinarias establecidas y de aquellos otros conceptos retributivos que tengan una periodicidad en su devengo superior a la mensual o que no tengan carácter periódico y se satisfagan dentro del ejercicio económico del año.",
  orden1Monthly: "En el caso de que la remuneración que corresponda a la persona trabajadora tenga carácter mensual, el indicado importe anual se dividirá por 12.",
  rirpf82:
    "El importe de la retención será el resultado de aplicar el tipo de retención a la cuantía total de las retribuciones que se satisfagan o abonen, teniendo en cuenta las regularizaciones que procedan de acuerdo al artículo 87 de este Reglamento.",
  rirpf83: "se tomará la suma de las retribuciones, dinerarias o en especie que, de acuerdo con las normas o estipulaciones contractuales aplicables y demás circunstancias previsibles, vaya normalmente a percibir el contribuyente en el año natural",
  lgss46:
    "Las pensiones contributivas derivadas de contingencias comunes de cualquiera de los regímenes que integran el sistema de la Seguridad Social serán satisfechas en catorce pagas, correspondientes a cada uno de los meses del año y dos pagas extraordinarias que se devengarán en los meses de junio y noviembre.",
} as const;

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** Date of the consolidated version read (ISO). */
  date: string;
}

export const SOURCES = {
  et: {
    name: "Estatuto de los Trabajadores (Real Decreto Legislativo 2/2015), arts. 29 y 31, texto consolidado",
    ref: "BOE-A-2015-11430",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a31",
    date: "2026-10-21",
  },
  lgss: {
    name: "Ley General de la Seguridad Social (Real Decreto Legislativo 8/2015), arts. 46 y 147, texto consolidado",
    ref: "BOE-A-2015-11724",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a147",
    date: "2026-11-11",
  },
  orden: {
    name: "Orden PJC/297/2026, de 30 de marzo, normas de cotización a la Seguridad Social para 2026, arts. 1 y 29",
    ref: "BOE-A-2026-7296",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296#a1",
    date: "2026-03-31",
  },
  rirpf: {
    name: "Reglamento del IRPF (Real Decreto 439/2007), arts. 82, 83 y 87, texto consolidado",
    ref: "BOE-A-2007-6820",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a82",
    date: "2026-10-07",
  },
} as const satisfies Record<string, Source>;

/** Official tools the page sends the reader to (both answered 200 on 17 Nov 2026). */
export const OFFICIAL_LINKS = {
  /** AEAT: "Servicio de Cálculo de Retenciones (a partir del 10 de septiembre de 2026)", linked from sede.agenciatributaria.gob.es/Sede/Retenciones.shtml. */
  aeatSimulator: "https://www2.agenciatributaria.gob.es/wlpl/PRET-R200/R261/index.zul",
  /** Ministerio de Trabajo: Registro y Depósito de Convenios Colectivos (REGCON), to find one's collective agreement. */
  regcon: "https://expinterweb.mites.gob.es/regcon/index.htm",
} as const;
