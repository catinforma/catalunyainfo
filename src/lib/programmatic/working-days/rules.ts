/**
 * The legal texts the working-days calculator applies, quoted from the BOE's
 * consolidated texts as read on `RULES_AS_OF`, and the yearly "calendario de
 * días inhábiles" of the Administración General del Estado (AGE).
 *
 * Read on 13 Nov 2026 at boe.es/buscar/act.php:
 *  - Ley 39/2015 (BOE-A-2015-10565), art. 30: the original text (the BOE
 *    lists no change to the article; the law's last change was published
 *    6.11.2024).
 *  - LOPJ, Ley Orgánica 6/1985 (BOE-A-1985-12666), arts. 182, 183, 185: 182.1
 *    and 183 as worded by Ley Orgánica 14/2022 (BOE-A-2022-21800, in force
 *    23.12.2022), which added 24 December to 6 January. Ley Orgánica 1/2025
 *    did not change them (the BOE's version list for both articles ends in
 *    2022).
 *  - LEC, Ley 1/2000 (BOE-A-2000-323), arts. 130.2 (as worded by LO 14/2022),
 *    133 (Ley 13/2009) and 135.5 (RDL 6/2023, in force 20.3.2024).
 *
 * Nothing here is computed: engine.ts implements these sentences and the tests
 * hold the two together.
 */

/** The day the texts below were last read on the BOE. */
export const RULES_AS_OF = "2026-11-13";
/** Read them again by this day (tests/working-days.test.ts fails after it). */
export const RULES_RECHECK_BY = "2027-05-13";

export interface LegalText {
  id: "art30" | "lopj182" | "lopj183" | "lopj185" | "lec130" | "lec133" | "lec135";
  /** "Ley 39/2015, art. 30". */
  cite: string;
  url: string;
  /** Verbatim from the BOE consolidated text (Spanish). */
  quote: string;
}

const L39 = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a30";
const LOPJ = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-12666";
const LEC = "https://www.boe.es/buscar/act.php?id=BOE-A-2000-323";

export const LEGAL_TEXTS: Record<LegalText["id"], LegalText> = {
  art30: {
    id: "art30",
    cite: "Ley 39/2015, de 1 de octubre, art. 30",
    url: L39,
    quote: [
      "2. Siempre que por Ley o en el Derecho de la Unión Europea no se exprese otro cómputo, cuando los plazos se señalen por días, se entiende que éstos son hábiles, excluyéndose del cómputo los sábados, los domingos y los declarados festivos.",
      "3. Los plazos expresados en días se contarán a partir del día siguiente a aquel en que tenga lugar la notificación o publicación del acto de que se trate, o desde el siguiente a aquel en que se produzca la estimación o la desestimación por silencio administrativo.",
      "4. […] El plazo concluirá el mismo día en que se produjo la notificación, publicación o silencio administrativo en el mes o el año de vencimiento. Si en el mes de vencimiento no hubiera día equivalente a aquel en que comienza el cómputo, se entenderá que el plazo expira el último día del mes.",
      "5. Cuando el último día del plazo sea inhábil, se entenderá prorrogado al primer día hábil siguiente.",
      "6. Cuando un día fuese hábil en el municipio o Comunidad Autónoma en que residiese el interesado, e inhábil en la sede del órgano administrativo, o a la inversa, se considerará inhábil en todo caso.",
    ].join("\n"),
  },
  lopj182: {
    id: "lopj182",
    cite: "Ley Orgánica 6/1985, del Poder Judicial, art. 182.1",
    url: LOPJ,
    quote: "Son inhábiles a efectos procesales los sábados y domingos, los días de fiesta nacional y los festivos a efectos laborales en la respectiva Comunidad Autónoma o localidad.",
  },
  lopj183: {
    id: "lopj183",
    cite: "Ley Orgánica 6/1985, del Poder Judicial, art. 183",
    url: LOPJ,
    quote:
      "Serán inhábiles los días del mes de agosto, así como todos los días desde el 24 de diciembre hasta el 6 de enero del año siguiente, ambos inclusive, para todas las actuaciones judiciales, excepto las que se declaren urgentes por las leyes procesales.",
  },
  lopj185: {
    id: "lopj185",
    cite: "Ley Orgánica 6/1985, del Poder Judicial, art. 185",
    url: LOPJ,
    quote: "1. Los plazos procesales se computarán con arreglo a lo dispuesto en el Código Civil. En los señalados por días quedarán excluidos los inhábiles.\n2. Si el último día de plazo fuere inhábil, se entenderá prorrogado al primer día hábil siguiente.",
  },
  lec130: {
    id: "lec130",
    cite: "Ley 1/2000, de Enjuiciamiento Civil, art. 130.2",
    url: LEC,
    quote:
      "Son días inhábiles a efectos procesales los sábados y domingos, y los días que median entre el 24 de diciembre y el 6 de enero del año siguiente, ambos inclusive, los días de fiesta nacional y los festivos a efectos laborales en la respectiva Comunidad Autónoma o localidad. También serán inhábiles los días del mes de agosto.",
  },
  lec133: {
    id: "lec133",
    cite: "Ley 1/2000, de Enjuiciamiento Civil, art. 133",
    url: LEC,
    quote:
      "1. Los plazos comenzarán a correr desde el día siguiente a aquel en que se hubiere efectuado el acto de comunicación del que la Ley haga depender el inicio del plazo, y se contará en ellos el día del vencimiento, que expirará a las veinticuatro horas. […]\n2. En el cómputo de los plazos señalados por días se excluirán los inhábiles. […]\n4. Los plazos que concluyan en sábado, domingo u otro día inhábil se entenderán prorrogados hasta el siguiente hábil.",
  },
  lec135: {
    id: "lec135",
    cite: "Ley 1/2000, de Enjuiciamiento Civil, art. 135.5",
    url: LEC,
    quote: "La presentación de escritos y documentos, cualquiera que fuera la forma, si estuviere sujeta a plazo, procesal o sustantivo, podrá efectuarse hasta las quince horas del día hábil siguiente al del vencimiento del plazo.",
  },
};

/* -------------------------------------------------------------------------- */
/* The AGE's yearly calendar of días inhábiles (Ley 39/2015 art. 30.7)        */
/* -------------------------------------------------------------------------- */

export interface AgeCalendar {
  year: number;
  name: string;
  ref: string;
  url: string;
  /** BOE publication day. */
  published: string;
}

/**
 * The 2026 calendar, read on 13 Nov 2026. Its annex lists the weekday
 * inhábiles by community; `AGE_2026_ANNEX` transcribes it and a test holds it
 * to the BOE's 2026 holiday list (`boe-2026.ts`), the data the calculator
 * counts with.
 */
export const AGE_2026: AgeCalendar = {
  year: 2026,
  name: "Resolución de 18 de noviembre de 2025, de la Secretaría de Estado de Función Pública, por la que se establece a efectos de cómputo de plazos, el calendario de días inhábiles en el ámbito de la Administración General del Estado para el año 2026",
  ref: "BOE-A-2025-23702",
  url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-23702",
  published: "2025-11-24",
};

/**
 * The 2027 calendar: not in the BOE yet. The BOE's daily summaries were read
 * up to `AGE_2027_CHECKED_ON` (the 2026 one came out on 24 November 2025).
 * When it is out: fill `AGE_2027` and `AGE_2027_ANNEX` (the test then holds
 * it to the 2027 holiday list), and the page names it. Until then the
 * calculator counts the BOE's 2027 list of fiestas laborales (BOE-A-2026-21254),
 * which the AGE calendar has to follow ("con sujeción al calendario laboral
 * oficial", art. 30.7), and says so.
 */
export const AGE_2027: AgeCalendar | null = null;
export const AGE_2027_CHECKED_ON = "2026-11-13";
/** tests/working-days.test.ts fails from this day while `AGE_2027` is null. */
export const AGE_2027_RECHECK_BY = "2026-12-31";

/** "ALL" or the communities (boe-2027.ts `Region` codes), as the annex lists each weekday date. */
export type AnnexRow = { date: string; where: "ALL" | readonly string[] };

/** BOE-A-2025-23702, annex, every "Día N" line (Saturdays and Sundays are inhábiles anyway). */
export const AGE_2026_ANNEX: readonly AnnexRow[] = [
  { date: "2026-01-01", where: "ALL" },
  { date: "2026-01-06", where: "ALL" },
  { date: "2026-03-02", where: ["IB"] },
  { date: "2026-03-19", where: ["GA", "MC", "PV", "VC", "NC"] },
  { date: "2026-03-20", where: ["ML"] },
  { date: "2026-04-02", where: ["AN", "AR", "AS", "IB", "CN", "CB", "CM", "EX", "GA", "MC", "PV", "RI", "CL", "MD", "NC", "CE", "ML"] },
  { date: "2026-04-03", where: "ALL" },
  { date: "2026-04-06", where: ["IB", "CM", "CT", "PV", "RI", "NC", "VC"] },
  { date: "2026-04-23", where: ["AR", "CL"] },
  { date: "2026-05-01", where: "ALL" },
  { date: "2026-05-27", where: ["CE", "ML"] },
  { date: "2026-06-04", where: ["CM"] },
  { date: "2026-06-09", where: ["RI", "MC"] },
  { date: "2026-06-24", where: ["CT", "GA", "VC"] },
  { date: "2026-07-28", where: ["CB"] },
  { date: "2026-08-05", where: ["CE"] },
  { date: "2026-09-02", where: ["CE"] },
  { date: "2026-09-08", where: ["AS", "EX"] },
  { date: "2026-09-11", where: ["CT"] },
  { date: "2026-09-15", where: ["CB"] },
  { date: "2026-10-09", where: ["VC"] },
  { date: "2026-10-12", where: "ALL" },
  { date: "2026-11-02", where: ["AN", "AR", "AS", "CN", "CM", "EX", "CL", "MD", "NC"] },
  { date: "2026-12-07", where: ["AN", "AR", "AS", "CB", "EX", "MC", "RI", "CL", "MD", "ML"] },
  { date: "2026-12-08", where: "ALL" },
  { date: "2026-12-25", where: "ALL" },
];

/**
 * The annex's note 1: each island of Canarias has a fiesta laboral of its own
 * in 2026 (Decreto 61/2025, BOC 5.5.2025), quoted by BOE-A-2025-23702. Keys
 * are the island names of `spain-2027/sources.ts` (CN subRegional).
 */
export const CANARIAS_ISLAND_DAYS_2026: Record<string, string> = {
  "El Hierro": "2026-09-24",
  Fuerteventura: "2026-09-18",
  "Gran Canaria": "2026-09-08",
  "La Gomera": "2026-10-05",
  "La Palma": "2026-08-05",
  "Lanzarote y La Graciosa": "2026-09-15",
  Tenerife: "2026-02-02",
};

/** The years the holiday data covers: no answer outside them. */
export const COVER_FROM = "2026-01-01";
export const COVER_TO = "2027-12-31";
/** The tool needs the 2028 lists before this day (a test fails from it). */
export const COVER_EXTEND_BY = "2027-11-15";
