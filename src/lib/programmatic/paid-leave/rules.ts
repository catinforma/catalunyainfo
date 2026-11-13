/**
 * Every rule the paid-leave reference and calculator ("permisos laborales")
 * uses, each with its source. Nothing numeric is typed anywhere else: the
 * engine, the page and the tests read from here. Client-safe.
 *
 * ## Read on 13 Nov 2026 (BOE consolidated texts and Seguridad Social)
 *
 *  - Estatuto de los Trabajadores (Real Decreto Legislativo 2/2015,
 *    BOE-A-2015-11430), consolidated text "última actualización publicada el
 *    21/10/2026":
 *     - art. 37.3 as written by Real Decreto-ley 5/2023, art. 127.3
 *       (BOE-A-2023-15135; letters a, b and b bis), Real Decreto-ley 8/2024
 *       and Ley 6/2024 (the two letters "g"): marriage or registered
 *       partnership "Quince días naturales"; serious accident or illness,
 *       hospitalisation or outpatient surgery needing rest at home "Cinco
 *       días"; death "Dos días", "el plazo se ampliará en dos días" when the
 *       worker has to travel; moving house "Un día"; public duty and the
 *       other letters "por el tiempo indispensable"; impossibility of reaching
 *       work (authorities' restrictions, catastrophe, adverse weather) "Hasta
 *       cuatro días".
 *     - Only letter a) says "naturales". Letters b), b bis) and c) say "días"
 *       with no qualifier, and the words "días hábiles" or "laborables" do not
 *       appear anywhere in art. 37.3. The page says exactly that and shows
 *       both counts; it does not summarise case law.
 *     - art. 37.4 (nursing hour until nine months, twelve with both parents
 *       and a proportional salary cut from month nine), art. 37.9 (force
 *       majeure, "equivalentes a cuatro días al año" paid), art. 38.1
 *       (holidays "En ningún caso la duración será inferior a treinta días
 *       naturales") and 38.3 (holidays overlapping birth leave or sick leave).
 *     - art. 48.4 as written by Real Decreto-ley 9/2025, de 29 de julio
 *       (BOE-A-2025-15741, in force 31 Jul 2025, convalidated by Resolución de
 *       9 de septiembre de 2025, BOE-A-2025-17999): birth leave "durante
 *       diecinueve semanas" (32 for a single parent) = 6 mandatory weeks right
 *       after the birth, full time + 11 weeks (22) in weekly periods until the
 *       child turns twelve months (the biological mother may start up to four
 *       weeks before the due date) + 2 weeks (4) until the child turns eight.
 *       Disposición transitoria única: the 2 extra weeks apply to births from
 *       2 Aug 2024 and could be requested from 1 Jan 2026.
 *     - art. 48 bis (parental leave, added by RDL 5/2023 art. 127.7): up to
 *       eight weeks until the child turns eight. Art. 45.1.o) makes it a
 *       suspension and art. 45.2 says a suspension "exonera de las
 *       obligaciones recíprocas de trabajar y remunerar el trabajo". The LGSS
 *       (consolidated 11/11/2026) has no benefit for it: no "permiso
 *       parental" anywhere in its text. So: unpaid by law.
 *  - LGSS (BOE-A-2015-11724, update 11/11/2026), arts. 177 to 179: birth and
 *    childcare benefit, "un subsidio equivalente al 100 por ciento de la base
 *    reguladora", paid by the INSS; arts. 183 to 185: the benefit for both
 *    parents reducing their day by half an hour from month nine to twelve.
 *  - Seguridad Social, "Prestación de Nacimiento y Cuidado de menor"
 *    (Información útil, read 13 Nov 2026): 100 % of the base reguladora and
 *    "Esta prestación está exenta de tributación por IRPF, salvo en
 *    territorio foral navarro".
 */

export const RULES_AS_OF = "2026-11-13";
/** From this day the rules must be re-read (new year: any 2027 reform of arts. 37, 38, 48, 48 bis and the 2027 holidays): a test fails. */
export const RULES_UNTIL = "2027-01-01";

/** The short leaves the calculator counts, with the Estatuto's own wording. */
export type ShortEvent = "marriage" | "illness" | "death" | "move" | "vacation";
export type EventId = ShortEvent | "birth";
export const EVENTS: readonly EventId[] = ["illness", "death", "marriage", "move", "vacation", "birth"];
export const SHORT_EVENTS: readonly ShortEvent[] = ["illness", "death", "marriage", "move", "vacation"];

/** "natural": the ET says "días naturales"; "unspecified": the ET says "días" only. */
export type DayCount = "natural" | "unspecified";

export interface ShortRule {
  days: number;
  /** Days added when the worker has to travel (death only). */
  travelExtra: number;
  count: DayCount;
  /** Article of the Estatuto, as the page cites it. */
  article: string;
  /** Who pays it by law. */
  payer: "employer";
}

export const SHORT_RULES: Record<ShortEvent, ShortRule> = {
  marriage: { days: 15, travelExtra: 0, count: "natural", article: "37.3.a", payer: "employer" },
  illness: { days: 5, travelExtra: 0, count: "unspecified", article: "37.3.b", payer: "employer" },
  death: { days: 2, travelExtra: 2, count: "unspecified", article: "37.3.b bis", payer: "employer" },
  move: { days: 1, travelExtra: 0, count: "unspecified", article: "37.3.c", payer: "employer" },
  vacation: { days: 30, travelExtra: 0, count: "natural", article: "38.1", payer: "employer" },
};

/** ET art. 37.9: force majeure hours paid, "equivalentes a cuatro días al año". */
export const FORCE_MAJEURE_DAYS_PER_YEAR = 4;
/** ET art. 37.3.g): "Hasta cuatro días" when the authorities' restrictions or a catastrophe make work unreachable. */
export const UNREACHABLE_WORK_DAYS = 4;

/** ET art. 37.4: one hour a day (or half an hour less, or accumulated in full days) until nine months; twelve if both parents take it alike. */
export const NURSING = { hoursPerDay: 1, untilMonths: 9, sharedUntilMonths: 12 } as const;

/** ET art. 48.4 (RDL 9/2025): birth and childcare leave per parent, in weeks. */
export const BIRTH = {
  totalWeeks: 19,
  mandatoryWeeks: 6,
  flexibleWeeks: 11,
  childcareWeeks: 2,
  /** "hasta que el hijo o la hija cumpla doce meses". */
  flexibleUntilMonths: 12,
  /** "hasta que el hijo o la hija cumpla los ocho años". */
  childcareUntilYears: 8,
  /** The biological mother "podrá anticipar su ejercicio hasta cuatro semanas antes de la fecha previsible del parto". */
  beforeDueWeeks: 4,
  /** Hospitalisation of the newborn over seven days: "con un máximo de trece semanas adicionales". */
  hospitalMaxExtraWeeks: 13,
  /** Art. 48.6: disability, or each child after the first in a multiple birth: two more weeks, one per parent. */
  extraWeeksPerCase: 2,
  /** "La persona trabajadora deberá comunicar a la empresa, con una antelación mínima de quince días" (letters b and c). */
  noticeDays: 15,
  /** Single parent (monoparentalidad). */
  single: { totalWeeks: 32, flexibleWeeks: 22, childcareWeeks: 4 },
  /** LGSS art. 179.1: "un subsidio equivalente al 100 por ciento de la base reguladora". */
  benefitPct: 100,
  /** RDL 9/2025, disposición transitoria única. */
  extraWeeksBirthsFrom: "2024-08-02",
  extraWeeksRequestFrom: "2026-01-01",
} as const;

/** ET art. 48 bis: parental leave. */
export const PARENTAL = { weeks: 8, untilYears: 8, noticeDays: 10 } as const;

export interface Source {
  name: string;
  ref: string;
  url: string;
  /** Publication or version date (ISO). */
  date: string;
}

export const SOURCES = {
  et: {
    name: "Texto refundido de la Ley del Estatuto de los Trabajadores, arts. 37, 38, 45, 48 y 48 bis",
    ref: "BOE-A-2015-11430, actualización del 21-10-2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a37",
    date: "2026-10-21",
  },
  rdl5: {
    name: "Real Decreto-ley 5/2023, de 28 de junio, art. 127 (permisos del art. 37.3, fuerza mayor y permiso parental)",
    ref: "BOE-A-2023-15135",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-15135",
    date: "2023-06-29",
  },
  rdl9: {
    name: "Real Decreto-ley 9/2025, de 29 de julio, por el que se amplía el permiso de nacimiento y cuidado",
    ref: "BOE-A-2025-15741",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-15741",
    date: "2025-07-30",
  },
  rdl9convalidation: {
    name: "Resolución de 9 de septiembre de 2025, del Congreso de los Diputados, de convalidación del Real Decreto-ley 9/2025",
    ref: "BOE-A-2025-17999",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-17999",
    date: "2025-09-11",
  },
  lgss: {
    name: "Texto refundido de la Ley General de la Seguridad Social, arts. 177 a 185 (nacimiento y cuidado de menor; cuidado corresponsable del lactante)",
    ref: "BOE-A-2015-11724, actualización del 11-11-2026",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a177",
    date: "2026-11-11",
  },
  ssBirth: {
    name: "Seguridad Social: Prestación de Nacimiento y Cuidado de menor",
    ref: "seg-social.es",
    url: "https://www.seg-social.es/wps/portal/wss/internet/InformacionUtil/44539/de513c99-5885-48bd-8c66-45d2c97ad947/41021nycm",
    date: "2026-11-13",
  },
} as const satisfies Record<string, Source>;

/** Quotes, verbatim (Spanish), as the page prints them. */
export const QUOTE = {
  et373intro: "La persona trabajadora, previo aviso y justificación, podrá ausentarse del trabajo, con derecho a remuneración, por alguno de los motivos y por el tiempo siguiente:",
  marriage: "Quince días naturales en caso de matrimonio o registro de pareja de hecho.",
  illness:
    "Cinco días por accidente o enfermedad graves, hospitalización o intervención quirúrgica sin hospitalización que precise reposo domiciliario del cónyuge, pareja de hecho o parientes hasta el segundo grado por consanguineidad o afinidad, incluido el familiar consanguíneo de la pareja de hecho, así como de cualquier otra persona distinta de las anteriores, que conviva con la persona trabajadora en el mismo domicilio y que requiera el cuidado efectivo de aquella.",
  death:
    "Dos días por el fallecimiento del cónyuge, pareja de hecho o parientes hasta el segundo grado de consanguinidad o afinidad. Cuando con tal motivo la persona trabajadora necesite hacer un desplazamiento al efecto, el plazo se ampliará en dos días.",
  move: "Un día por traslado del domicilio habitual.",
  publicDuty: "Por el tiempo indispensable, para el cumplimiento de un deber inexcusable de carácter público y personal, comprendido el ejercicio del sufragio activo.",
  unreachable:
    "Hasta cuatro días por imposibilidad de acceder al centro de trabajo o transitar por las vías de circulación necesarias para acudir al mismo, como consecuencia de las recomendaciones, limitaciones o prohibiciones al desplazamiento establecidas por las autoridades competentes, así como cuando concurra una situación de riesgo grave e inminente, incluidas las derivadas de una catástrofe o fenómeno meteorológico adverso.",
  forceMajeure:
    "Las personas trabajadoras tendrán derecho a que sean retribuidas las horas de ausencia por las causas previstas en el presente apartado equivalentes a cuatro días al año, conforme a lo establecido en convenio colectivo o, en su defecto, en acuerdo entre la empresa y la representación legal de las personas trabajadoras aportando las personas trabajadoras, en su caso, acreditación del motivo de ausencia.",
  forceMajeureCause:
    "La persona trabajadora tendrá derecho a ausentarse del trabajo por causa de fuerza mayor cuando sea necesario por motivos familiares urgentes relacionados con familiares o personas convivientes, en caso de enfermedad o accidente que hagan indispensable su presencia inmediata.",
  nursing:
    "las personas trabajadoras tendrán derecho a una hora de ausencia del trabajo, que podrán dividir en dos fracciones, para el cuidado del lactante hasta que este cumpla nueve meses.",
  vacation:
    "El periodo de vacaciones anuales retribuidas, no sustituible por compensación económica, será el pactado en convenio colectivo o contrato individual. En ningún caso la duración será inferior a treinta días naturales.",
  birth: "El nacimiento, que comprende el parto y el cuidado de menor, suspenderá el contrato de trabajo de la madre biológica y el del progenitor distinto de la madre biológica durante diecinueve semanas.",
  birthMandatory: "Seis semanas ininterrumpidas inmediatamente posteriores al parto serán obligatorias y habrán de disfrutarse a jornada completa.",
  birthFlexible:
    "Once semanas, veintidós en el caso de monoparentalidad, que podrán distribuirse a voluntad de la persona trabajadora, en períodos semanales a disfrutar de forma acumulada o interrumpida y ejercitarse desde la finalización de la suspensión obligatoria posterior al parto hasta que el hijo o la hija cumpla doce meses.",
  birthChildcare:
    "Dos semanas, cuatro en el caso de monoparentalidad, para el cuidado del menor que podrán distribuirse a voluntad de la persona trabajadora, en períodos semanales de forma acumulada o interrumpida hasta que el hijo o la hija cumpla los ocho años.",
  rdl9transitional:
    "respecto de la adición de las dos semanas, cuatro en el caso de monoparentalidad, de suspensión del contrato de trabajo o del permiso por nacimiento y cuidado de menor que se pueden disfrutar hasta que el menor cumpla los ocho años de edad, será de aplicación a los hechos causantes producidos a partir del 2 de agosto de 2024.",
  benefit: "La prestación económica por nacimiento y cuidado de menor consistirá en un subsidio equivalente al 100 por ciento de la base reguladora correspondiente.",
  ssTax: "Esta prestación está exenta de tributación por IRPF, salvo en territorio foral navarro.",
  parental:
    "Este permiso, que tendrá una duración no superior a ocho semanas, continuas o discontinuas, podrá disfrutarse a tiempo completo, o en régimen de jornada a tiempo parcial conforme a lo establecido reglamentariamente.",
  suspension: "La suspensión exonera de las obligaciones recíprocas de trabajar y remunerar el trabajo.",
} as const;
