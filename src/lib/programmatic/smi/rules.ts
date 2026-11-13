/**
 * The official figures behind "Salario mínimo (SMI) 2027"
 * (lib/programmatic/smi/). Client-safe: no data files, no server code.
 *
 * Every amount below was read on SMI_RULES_AS_OF in the BOE's own XML of
 * each royal decree (https://www.boe.es/diario_boe/xml.php?id=<BOE id>):
 * article 1 (per day and per month), article 3.1 (the yearly floor, "sin que
 * en ningún caso pueda considerarse una cuantía anual inferior a …"),
 * article 4.1 (per day for fixed-term contracts of up to 120 days) and
 * article 4.2 (per hour for domestic workers paid by the hour). The yearly
 * figure is always the monthly one × 14 (a test checks it).
 *
 * 2027, as of SMI_RULES_AS_OF (13 Nov 2026), only from official documents:
 *  - The Ministry of Labour's draft royal decree for 2027 and its impact
 *    report (MAIN, 4 Nov 2026), in public hearing from 5 to 16 Nov 2026 on
 *    the Ministry's participation portal. The MAIN says the advisory
 *    committee (CAASMI) delivered its report on 3 Nov 2026 and that a social
 *    dialogue table was called on 4 Nov 2026.
 *  - Not approved by the Council of Ministers and not in the BOE: the BOE's
 *    open-data search for "salario mínimo interprofesional para 2027" is
 *    empty (13 Nov 2026).
 * Press figures (union demands, leaks) are never stored here.
 *
 * When the BOE publishes the 2027 decree the page shows it the same day by
 * itself (boe.ts searches the BOE every hour and reads the figures from the
 * decree's XML); then copy them into OFFICIAL_2027 below. A test fails from
 * OFFICIAL_2027_DUE while it is null.
 */

/** The day every figure and quote below was read on the official text. */
export const SMI_RULES_AS_OF = "2026-11-13";

/** The year the page is about. */
export const TARGET_YEAR = 2027;

/** From this day a test fails while OFFICIAL_2027 is null (in 2023–2026 the decree came out between 7 and 23 February: then move this date and say so on the page). */
export const OFFICIAL_2027_DUE = "2027-01-15";

/** The 2027 status (draft, hearing, Council of Ministers) must be re-read by this day; a test fails after it. */
export const STATUS_RECHECK_BY = "2026-12-01";

export interface SmiYear {
  year: number;
  /** "Real Decreto 126/2026, de 18 de febrero". */
  norm: string;
  boeId: string;
  /** The day the BOE published it. */
  published: string;
  /** The first day the amounts apply (1 January, or 1 September in 2021). */
  effectiveFrom: string;
  /** Euros a month, in 14 payments (art. 1). */
  monthly: number;
  /** Euros a day (art. 1). */
  daily: number;
  /** The yearly floor (art. 3.1) = monthly × 14. */
  annual: number;
  /** Domestic workers paid by the hour, euros per hour actually worked, all items included (art. 4.2). */
  domesticHourly: number;
  /** Fixed-term contracts of up to 120 days with one employer, euros per legal working day (art. 4.1). */
  temporaryDaily: number;
}

const boe = (id: string) => `https://www.boe.es/buscar/act.php?id=${id}`;

/** The decree's page on the BOE. */
export function boeUrl(year: Pick<SmiYear, "boeId">): string {
  return boe(year.boeId);
}

/** 2018 to 2026, oldest first: each year's royal decree as published in the BOE. */
export const SMI_HISTORY: readonly SmiYear[] = [
  { year: 2018, norm: "Real Decreto 1077/2017, de 29 de diciembre", boeId: "BOE-A-2017-15848", published: "2017-12-30", effectiveFrom: "2018-01-01", monthly: 735.9, daily: 24.53, annual: 10302.6, domesticHourly: 5.76, temporaryDaily: 34.85 },
  { year: 2019, norm: "Real Decreto 1462/2018, de 21 de diciembre", boeId: "BOE-A-2018-17773", published: "2018-12-27", effectiveFrom: "2019-01-01", monthly: 900, daily: 30, annual: 12600, domesticHourly: 7.04, temporaryDaily: 42.62 },
  { year: 2020, norm: "Real Decreto 231/2020, de 4 de febrero", boeId: "BOE-A-2020-1652", published: "2020-02-05", effectiveFrom: "2020-01-01", monthly: 950, daily: 31.66, annual: 13300, domesticHourly: 7.43, temporaryDaily: 44.99 },
  // January–August 2021 kept the 2020 amounts (disposición adicional sexta del Real Decreto-ley 38/2020, as RD 817/2021 recalls).
  { year: 2021, norm: "Real Decreto 817/2021, de 28 de septiembre", boeId: "BOE-A-2021-15770", published: "2021-09-29", effectiveFrom: "2021-09-01", monthly: 965, daily: 32.17, annual: 13510, domesticHourly: 7.55, temporaryDaily: 45.7 },
  { year: 2022, norm: "Real Decreto 152/2022, de 22 de febrero", boeId: "BOE-A-2022-2851", published: "2022-02-23", effectiveFrom: "2022-01-01", monthly: 1000, daily: 33.33, annual: 14000, domesticHourly: 7.82, temporaryDaily: 47.36 },
  { year: 2023, norm: "Real Decreto 99/2023, de 14 de febrero", boeId: "BOE-A-2023-3982", published: "2023-02-15", effectiveFrom: "2023-01-01", monthly: 1080, daily: 36, annual: 15120, domesticHourly: 8.45, temporaryDaily: 51.15 },
  { year: 2024, norm: "Real Decreto 145/2024, de 6 de febrero", boeId: "BOE-A-2024-2251", published: "2024-02-07", effectiveFrom: "2024-01-01", monthly: 1134, daily: 37.8, annual: 15876, domesticHourly: 8.87, temporaryDaily: 53.71 },
  { year: 2025, norm: "Real Decreto 87/2025, de 11 de febrero", boeId: "BOE-A-2025-2576", published: "2025-02-12", effectiveFrom: "2025-01-01", monthly: 1184, daily: 39.47, annual: 16576, domesticHourly: 9.26, temporaryDaily: 56.08 },
  { year: 2026, norm: "Real Decreto 126/2026, de 18 de febrero", boeId: "BOE-A-2026-3815", published: "2026-02-19", effectiveFrom: "2026-01-01", monthly: 1221, daily: 40.7, annual: 17094, domesticHourly: 9.55, temporaryDaily: 57.82 },
];

/** The newest decree in force (2026). */
export const SMI_2026: SmiYear = SMI_HISTORY.at(-1)!;

/**
 * The 2027 decree once the BOE publishes it, copied from its XML like the
 * rows above. Null until then; the page reads the BOE live meanwhile.
 */
export const OFFICIAL_2027: SmiYear | null = null;

/* -------------------------------------------------------------------------- */
/* 2027: where it stands, from official documents only                        */
/* -------------------------------------------------------------------------- */

export interface Draft2027 {
  /** What the draft says (art. 1, 3.1, 4.1, 4.2 of the "Proyecto de Real Decreto … para 2027"). */
  monthly: number;
  daily: number;
  annual: number;
  domesticHourly: number;
  temporaryDaily: number;
  /** "un incremento del 5,3 por ciento respecto de las previstas en el Real Decreto 126/2026". */
  increase: number;
  /** The draft's own entry into force (disposición final tercera). */
  plannedFrom: string;
  /** Published on the Ministry's participation portal. */
  published: string;
  hearingFrom: string;
  hearingTo: string;
  /** The advisory committee's report, as the MAIN reports it. */
  committee: { delivered: string; increase: number; annual: number; monthly: number };
  /** "el 4 de noviembre de 2026 se convocó una mesa de diálogo social formada por el Gobierno, CEOE, CEPYME, CCOO y UGT". */
  socialDialogue: string;
  urls: { listing: string; draft: string; main: string };
}

/** Read 13 Nov 2026 in the draft and the MAIN (expinterweb.mites.gob.es/participa, "Audiencia e Información Pública", trámites abiertos). */
export const DRAFT_2027: Draft2027 = {
  monthly: 1286,
  daily: 42.87,
  annual: 18004,
  domesticHourly: 10.06,
  temporaryDaily: 60.88,
  increase: 5.3,
  plannedFrom: "2027-01-01",
  published: "2026-11-04",
  hearingFrom: "2026-11-05",
  hearingTo: "2026-11-16",
  committee: { delivered: "2026-11-03", increase: 4.9, annual: 17934, monthly: 1281 },
  socialDialogue: "2026-11-04",
  urls: {
    listing: "https://expinterweb.mites.gob.es/participa/listado?tramite=1&estado=1",
    draft: "https://expinterweb.mites.gob.es/participa/listado/download/5c937eaf-6f84-4380-9bb7-78c45a543294",
    main: "https://expinterweb.mites.gob.es/participa/listado/download/7481ca38-f550-49a6-9391-85e7d057a0a2",
  },
};

/* -------------------------------------------------------------------------- */
/* Quotes (verbatim from the BOE and the Ministry's documents)                */
/* -------------------------------------------------------------------------- */

export const QUOTE = {
  /** Estatuto de los Trabajadores, art. 27.1 (BOE consolidated text, read 13 Nov 2026). */
  et27:
    "El Gobierno fijará, previa consulta con las organizaciones sindicales y asociaciones empresariales más representativas, anualmente, el salario mínimo interprofesional, teniendo en cuenta: a) El índice de precios de consumo. b) La productividad media nacional alcanzada. c) El incremento de la participación del trabajo en la renta nacional. d) La coyuntura económica general.",
  /** RD 126/2026, art. 1. */
  rd126art1:
    "El salario mínimo para cualesquiera actividades en la agricultura, en la industria y en los servicios, sin distinción de sexo ni edad de las personas trabajadoras, queda fijado en 40,70 euros/día o 1 221 euros/mes, según el salario esté fijado por días o por meses.",
  /** RD 126/2026, art. 1, third paragraph: part-time work. */
  rd126partTime: "Este salario se entiende referido a la jornada legal de trabajo en cada actividad, sin incluir en el caso del salario diario la parte proporcional de los domingos y festivos. Si se realizase jornada inferior se percibirá a prorrata.",
  /** RD 126/2026, art. 3.1. */
  rd126annual: "sin que en ningún caso pueda considerarse una cuantía anual inferior a 17 094 euros.",
  /** RD 126/2026, art. 4.2. */
  rd126domestic: "el salario mínimo de dichas empleadas y empleados de hogar será de 9,55 euros por hora efectivamente trabajada.",
  /** RD 126/2026, disposición final tercera. */
  rd126effects:
    "Este real decreto entrará en vigor el día siguiente al de su publicación en el «Boletín Oficial del Estado» y surtirá efectos durante el período comprendido entre el 1 de enero y el 31 de diciembre de 2026, procediendo, en consecuencia, el abono del salario mínimo fijado en este con efectos desde el 1 de enero de 2026.",
  /** Real Decreto-ley 5/2026 (BOE-A-2026-3810), preamble: why its art. 28 rewrites the IRPF deduction. */
  rdl5irpf: "resulta necesario adoptar los cambios necesarios en la normativa del impuesto que impida que los perceptores del nuevo salario mínimo interprofesional tengan que tributar por él.",
  /** Draft royal decree for 2027, art. 1. */
  draftArt1: "queda fijado para 2027 en 42,87 euros/día o 1 286 euros/mes, según el salario esté fijado por días o por meses.",
  /** MAIN of the draft, V.1.4. */
  mainProposal: "el Gobierno ha propuesto incrementar el SMI para 2027 en un 5,3 por ciento, quedando fijado en 18004 euros al año, 1286 euros al mes y 42,87 euros al día, con carácter general.",
  /** MAIN of the draft: the advisory committee's proposal. */
  mainCommittee: "la CAASMI propone elevar el SMI un 4,9%, hasta 17.934 euros anuales (1.281 euros mensuales en catorce pagas).",
} as const;

/** The other official texts the page cites. */
export const NORMS = {
  et: { name: "Estatuto de los Trabajadores (Real Decreto Legislativo 2/2015), arts. 27 y 34", ref: "BOE-A-2015-11430", url: boe("BOE-A-2015-11430") },
  rdl38_2020: { name: "Real Decreto-ley 38/2020, de 29 de diciembre (disposición adicional sexta: prórroga del SMI de 2020)", ref: "BOE-A-2020-17266", url: boe("BOE-A-2020-17266") },
  rdl5_2026: { name: "Real Decreto-ley 5/2026, de 17 de febrero, art. 28 (deducción del IRPF para el SMI), convalidado (BOE-A-2026-6483)", ref: "BOE-A-2026-3810", url: boe("BOE-A-2026-3810") },
  rd1620_2011: { name: "Real Decreto 1620/2011 (empleo de hogar), art. 8.5", ref: "BOE-A-2011-17975", url: boe("BOE-A-2011-17975") },
} as const;

/** The legal maximum ordinary working week (ET art. 34.1: "cuarenta horas semanales de trabajo efectivo de promedio en cómputo anual"). */
export const LEGAL_MAX_WEEKLY_HOURS = 40;

/** The BOE's open-data search the page runs for the 2027 decree (readers can click it too). */
export const BOE_SEARCH_PAGE = "https://www.boe.es/buscar/legislacion.php";
