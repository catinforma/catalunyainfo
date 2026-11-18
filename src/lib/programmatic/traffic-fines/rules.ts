/**
 * Every rule and figure of "Multas de tráfico: plazos, descuento del 50 % y
 * recursos", each with its source. Nothing numeric is typed anywhere else:
 * the engine, the page and the tests read from here. Client-safe: no data
 * files, no server code.
 *
 * ## Read on 18 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, Real Decreto Legislativo 6/2015, texto refundido de la Ley sobre
 *    Tráfico (BOE-A-2015-11722), consolidated text "Última actualización
 *    publicada el 26/06/2026": arts. 63-65 (points), 71 (losing them all), 77
 *    (muy graves, for the letters of 93.2), 80-81 (amounts), 83.1 (Ley
 *    39/2015 applies supletoriamente), 84 (who fines), 87.3, 89-96
 *    (notification, procedures, 50 %, alegaciones, recurso), 110 (payment,
 *    apremio), 112 (prescription, caducidad), annexes II and IV. Art. 93.2
 *    as worded by Ley 18/2021 (in force 21 Mar 2022) adds 77 s) and t) to
 *    the 2015 list; art. 65.1 lost its second paragraph (three years after
 *    a muy grave) the same day.
 *  - BOE, Ley 39/2015 (BOE-A-2015-10565, last updated 06/11/2024), art. 30
 *    (30.2, 30.4, 30.5, 30.6) and art. 43.2 (electronic notification
 *    rejected after ten natural days).
 *  - BOE, Ley 58/2003 General Tributaria (BOE-A-2003-23186, last updated
 *    21/12/2024), arts. 28 (5 / 10 / 20 % surcharges) and 62.5 (deadline of
 *    the providencia de apremio); Ley 47/2003 General Presupuestaria
 *    (BOE-A-2003-21614), art. 10.1 (state revenue collected with the LGT and
 *    the Reglamento General de Recaudación). Ley 29/1998 (LJCA,
 *    BOE-A-1998-16718), art. 46.1 (two months for the court appeal).
 *  - BOE, Orden INT/914/2024 (BOE-A-2024-17780, in force 4 Nov 2024), arts.
 *    3 a) and 4: the partial recovery course gives back four points.
 *  - DGT (dgt.es, read 18 Nov 2026): "¿Qué hacer si has recibido una multa?"
 *    (updated 26/07/2023: 45 days, AEAT 20 % surcharge, only four groups of
 *    offences without the 50 %), "¿Cómo quieres que te notifiquemos tus
 *    multas?" (05/09/2022: the TEU publication date counts as the
 *    notification date), "¿Quién puede multarte?" (22/10/2020),
 *    "Recuperación de permisos y puntos" (30/10/2025: four points, ten
 *    hours). sede.dgt.gob.es does not answer from our server (timeout,
 *    connection refused): we link dgt.es's own links to it, which answer a
 *    302 to the sede.
 *  - Servei Català de Trànsit, "Pagament de sancions" (29.10.2024: eight
 *    offences without the 50 %, the 2015 list) and "Presentació
 *    d'al·legacions i recursos" (the ATC collects unpaid fines); Agència
 *    Tributària de Catalunya, "Com presentar un recurs contra una multa"
 *    (10 % / 20 % surcharges).
 *
 * ## Where the sources disagree (the page says so, the calculator takes the stricter one)
 *
 *  - Tablón Edictal: art. 91 deems the notification made twenty natural days
 *    after its BOE publication; the DGT takes the publication date itself.
 *    The calculator counts from the publication date and shows the later
 *    date as the law's reading, not to rely on.
 *  - Identifying the driver: twenty natural days in art. 93.1; "10 días" on
 *    the DGT's page. We print the law and say: do it at once.
 *  - Fines without the 50 %: ten letters of art. 77 in the law since 2022;
 *    the DGT lists four groups, the SCT eight (the 2015 text).
 *  - The recovery course: "hasta un máximo de seis puntos" in art. 65.4; the
 *    Orden INT/914/2024 sets four, and that is what the DGT applies.
 *  - Last day on a Saturday, Sunday or holiday: neither the DGT nor the SCT
 *    say; Ley 39/2015 art. 30.5 moves it to the next working day. The
 *    calculator gives the 20th natural day as the safe day and the moved day
 *    as the legal one.
 *
 * ## Do not print
 *
 * Three years to recover the points after a muy grave (deleted 21 Mar
 * 2022); six points per course; a council's own amounts (each ordinance);
 * case law (not read); what sede.dgt.gob.es says (not readable from here).
 *
 * A test fails from RULES_UNTIL: re-read the consolidated Ley de Tráfico
 * (its "última actualización"), the DGT and SCT pages, then move both dates.
 */

export const RULES_AS_OF = "2026-11-18";
/** From this day a test fails: re-read the BOE consolidated text and the DGT and SCT pages (six months). */
export const RULES_UNTIL = "2027-05-18";
/** The consolidated Ley de Tráfico we read: "Última actualización publicada el …". */
export const LSV_LAST_UPDATE = "2026-06-26";

/* -------------------------------------------------------------------------- */
/* Deadlines (días naturales)                                                 */
/* -------------------------------------------------------------------------- */

/** Arts. 93.1, 94 and 95.1: pay with the 50 % off, or file alegaciones, within 20 natural days from the day after the notification. */
export const DISCOUNT_DAYS = 20;
/** Art. 93.1, second paragraph: the owner identifies the driver within 20 natural days when the vehicle was not stopped. */
export const IDENTIFY_DAYS = 20;
/** The DGT's page: "debes indicarnos en un plazo de 10 días" (conflicts with art. 93.1). */
export const IDENTIFY_DAYS_DGT_PAGE = 10;
/** Art. 94 a): the reduction. */
export const DISCOUNT_RATE = 0.5;
/** Art. 95.4: the sanction can be enforced 30 natural days after the notification of the denuncia. */
export const ENFORCEABLE_DAYS = 30;
/** Art. 110.1: once firm, a final period of 15 natural days to pay. */
export const FINAL_PAYMENT_DAYS = 15;
/** The DGT: "un plazo de 45 días despues de que recibas la notificación" = 30 (art. 95.4) + 15 (art. 110.1). */
export const FULL_PAYMENT_DAYS = ENFORCEABLE_DAYS + FINAL_PAYMENT_DAYS;
/** Art. 90.2 and Ley 39/2015 art. 43.2: a DEV notification not opened in 10 natural days counts as rejected and the step as done. */
export const DEV_REJECT_DAYS = 10;
/** Art. 91: a BOE notification is deemed made 20 natural days after publication (the DGT counts from the publication itself). */
export const BOE_DEEMED_DAYS = 20;
/** Art. 96.2: recurso de reposición within one month from the day after the resolution's notification. */
export const REPOSICION_MONTHS = 1;
/** LJCA art. 46.1: two months for the contencioso-administrativo appeal. */
export const CONTENCIOSO_MONTHS = 2;

/* -------------------------------------------------------------------------- */
/* Prescription (art. 112)                                                    */
/* -------------------------------------------------------------------------- */

export type Severity = "leve" | "grave" | "muy-grave";

/** Art. 112.1: months from the day of the facts. */
export const PRESCRIPTION_MONTHS: Record<Severity, number> = { leve: 3, grave: 6, "muy-grave": 6 };
/** Art. 112.3: the procedure lapses (caducidad) one year after it began without a resolution. */
export const CADUCIDAD_YEARS = 1;
/** Art. 112.4: a firm fine prescribes in four years. */
export const SANCTION_PRESCRIPTION_YEARS = 4;

/* -------------------------------------------------------------------------- */
/* Surcharges when unpaid (LGT art. 28, through LSV art. 110.2)                */
/* -------------------------------------------------------------------------- */

export type Surcharge = "executive" | "reduced" | "ordinary";
export const SURCHARGES: readonly Surcharge[] = ["executive", "reduced", "ordinary"];
/** LGT art. 28.2-28.4: 5 % before the providencia de apremio, 10 % within its deadline, 20 % (and interest) after. */
export const SURCHARGE_RATE: Record<Surcharge, number> = { executive: 0.05, reduced: 0.1, ordinary: 0.2 };
/** LGT art. 62.5: providencia notified on days 1-15 → pay by the 20th of that month; 16 to the end → by the 5th of the next. */
export const APREMIO_DAY = { firstHalfUntil: 15, thisMonth: 20, nextMonth: 5 } as const;

/* -------------------------------------------------------------------------- */
/* Amounts (arts. 80 and 81)                                                  */
/* -------------------------------------------------------------------------- */

/** Art. 80.1: leves up to 100 €, graves 200 €, muy graves 500 € (speeding: annex IV). */
export const BASE_FINE = { leveMax: 100, grave: 200, muyGrave: 500 } as const;
/** Art. 80.2 a): alcohol (with conditions) and drugs, 1,000 €; c) radar jammers, 6,000 €; d) 77 n)-t), 3,000 to 20,000 €. */
export const SPECIAL_FINE = { alcoholDrugs: 1_000, jammer: 6_000, businessMin: 3_000, businessMax: 20_000 } as const;
/** Art. 81: up to +30 % for the seriousness, record, danger and proportionality. */
export const GRADUATION_MAX = 0.3;

/* -------------------------------------------------------------------------- */
/* Fines without the 50 % (art. 93.2 as worded by Ley 18/2021)                 */
/* -------------------------------------------------------------------------- */

/** The letters of art. 77 the abbreviated procedure (and so the 50 %) does not apply to. */
export const NO_DISCOUNT_LETTERS = ["h", "j", "n", "ñ", "o", "p", "q", "r", "s", "t"] as const;
export type NoDiscountLetter = (typeof NO_DISCOUNT_LETTERS)[number];
/** The 2015 text (and the SCT's page): the same without s) and t). */
export const NO_DISCOUNT_LETTERS_2015 = ["h", "j", "n", "ñ", "o", "p", "q", "r"] as const;
/** The letters a private driver can meet: driving with a jammer, not identifying the driver, installing a jammer. */
export const NO_DISCOUNT_DRIVER: readonly NoDiscountLetter[] = ["h", "j", "p"];

/* -------------------------------------------------------------------------- */
/* Points (arts. 63-65 and 71; Orden INT/914/2024)                            */
/* -------------------------------------------------------------------------- */

export const POINTS = {
  /** Art. 63.1. */
  initial: 12,
  /** Art. 63.2: licences of three years or less, and after losing them all. */
  novice: 8,
  /** Art. 63.4: +2 after three years without firm sanctions, +1 after three more, up to 15. */
  max: 15,
  bonusFirst: 2,
  bonusSecond: 1,
  bonusYears: 3,
  /** Art. 64.4: no more than 8 a day, except the muy graves of 77 a), c)-i). */
  dayCap: 8,
  /** Art. 65.1 and 65.2: two years without firm sanctions with points → 12 again. */
  recoveryYears: 2,
  /** Orden INT/914/2024 art. 3 a): the partial recovery course gives back four points (art. 65.4 allows up to six). */
  course: 4,
  courseLawMax: 6,
  /** Orden INT/914/2024 art. 4: at least ten hours; once every two years, yearly for professional drivers. */
  courseHours: 10,
  courseEveryYears: 2,
  /** Art. 63.5: a safe and efficient driving course adds two, up to 15, one of each kind every two years. */
  safeDrivingCourse: 2,
  /** Art. 71: after losing them all, no new licence for six months (three for professionals), twelve (six) if it happens again within three years. */
  waitMonths: 6,
  waitMonthsProfessional: 3,
  waitMonthsAgain: 12,
  waitMonthsAgainProfessional: 6,
} as const;

/** Annex II: the offences that take points away, in the annex's order (speeding: annex IV). */
export interface PointsRow {
  n: string;
  points: number;
  /** The annex's words (Spanish, as published). */
  text: string;
}

export const ANNEX_II: readonly PointsRow[] = [
  { n: "1", points: 6, text: "Conducir con una tasa de alcohol superior a la reglamentariamente establecida: Valores mg/l aire espirado, más de 0,50 (profesionales y titulares de permisos de conducción con menos de dos años de antigüedad más de 0,30 mg/l)." },
  { n: "1", points: 4, text: "Conducir con una tasa de alcohol superior a la reglamentariamente establecida: Valores mg/l aire espirado, superior a 0,25 hasta 0,50 (profesionales y titulares de permisos de conducción con menos de dos años de antigüedad más de 0,15 hasta 0,30 mg/l)." },
  { n: "2", points: 6, text: "Conducir con presencia de drogas en el organismo." },
  { n: "3", points: 6, text: "Incumplir la obligación de someterse a las pruebas de detección de alcohol o de la presencia de drogas en el organismo." },
  { n: "4", points: 6, text: "Conducir de forma temeraria, circular en sentido contrario al establecido o participar en carreras o competiciones no autorizadas." },
  { n: "5", points: 6, text: "Conducir vehículos que tengan instalados inhibidores de radares o cinemómetros o cualesquiera otros mecanismos encaminados a interferir en el correcto funcionamiento de los sistemas de vigilancia del tráfico." },
  { n: "6", points: 6, text: "El exceso en más del 50 por ciento en los tiempos de conducción o la minoración en más del 50 por ciento en los tiempos de descanso establecidos en la legislación sobre transporte terrestre." },
  { n: "7", points: 6, text: "La participación o colaboración necesaria de los conductores en la colocación o puesta en funcionamiento de elementos que alteren el normal funcionamiento del tacógrafo o del limitador de velocidad." },
  { n: "8", points: 6, text: "Utilizar, sujetando con la mano, dispositivos de telefonía móvil mientras se conduce." },
  { n: "9", points: 6, text: "Arrojar a la vía o en sus inmediaciones objetos que puedan producir incendios o accidentes." },
  { n: "10", points: 4, text: "Incumplir las disposiciones legales sobre preferencia de paso, y la obligación de detenerse en la señal de stop, ceda el paso y en los semáforos con luz roja encendida." },
  { n: "11", points: 4, text: "Incumplir las disposiciones legales sobre adelantamiento poniendo en peligro o entorpeciendo a quienes circulen en sentido contrario y adelantar en lugares o circunstancias de visibilidad reducida." },
  { n: "12", points: 6, text: "Adelantar poniendo en peligro o entorpeciendo a ciclistas o sin dejar la separación mínima de 1,5 metros." },
  { n: "13", points: 4, text: "No respetar las señales o las órdenes de la autoridad encargada de la regulación, ordenación, gestión, vigilancia y disciplina del tráfico, o de sus agentes." },
  { n: "14", points: 4, text: "No mantener la distancia de seguridad con el vehículo que le precede." },
  { n: "15", points: 4, text: "No hacer uso, o no hacerlo de forma adecuada, del cinturón de seguridad, sistemas de retención infantil, casco y demás elementos de protección obligatorios." },
  { n: "16", points: 4, text: "Conducir un vehículo con un permiso o licencia de conducción que no le habilite para ello." },
  { n: "17", points: 4, text: "Conducir un vehículo teniendo suspendida la autorización administrativa para conducir o teniendo prohibido el uso del vehículo que se conduce." },
  { n: "18", points: 4, text: "Realizar la maniobra de marcha atrás en autopistas y autovías." },
  { n: "19", points: 3, text: "Efectuar el cambio de sentido incumpliendo las disposiciones recogidas en esta Ley y en los términos establecidos reglamentariamente." },
  {
    n: "20",
    points: 3,
    text: "Conducir utilizando cualquier tipo de casco de audio o auricular conectado a aparatos receptores o reproductores de sonido u otros dispositivos que disminuyan la atención permanente a la conducción, o manteniendo ajustado entre el casco y la cabeza del usuario dispositivos de telefonía móvil mientras se conduce, o utilizando manualmente navegadores o cualquier otro medio o sistema de comunicación, así como dispositivos de telefonía móvil en condiciones distintas a las previstas en el ordinal 8.",
  },
  { n: "21", points: 3, text: "Conducir vehículos que lleven mecanismos de detección de radares o cinemómetros." },
];

/* -------------------------------------------------------------------------- */
/* Speeding (annex IV)                                                        */
/* -------------------------------------------------------------------------- */

/** The speed limits of annex IV's table, km/h. */
export const SPEED_LIMITS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130] as const;

export interface SpeedBand {
  fine: number;
  points: number;
  severity: "grave" | "muy-grave";
  /** Measured speed from (inclusive), per limit, in SPEED_LIMITS order. */
  from: readonly number[];
  /** Measured speed up to (inclusive), per limit; null for the last band ("and above"). */
  to: readonly number[] | null;
}

/** Annex IV, "Cuadro de sanciones y puntos por exceso de velocidad", as published (radar-measured speed). */
export const SPEED_BANDS: readonly SpeedBand[] = [
  { fine: 100, points: 0, severity: "grave", from: [21, 31, 41, 51, 61, 71, 81, 91, 101, 111, 121, 131], to: [40, 50, 60, 70, 90, 100, 110, 120, 130, 140, 150, 150] },
  { fine: 300, points: 2, severity: "grave", from: [41, 51, 61, 71, 91, 101, 111, 121, 131, 141, 151, 151], to: [50, 60, 70, 80, 110, 120, 130, 140, 150, 160, 170, 170] },
  { fine: 400, points: 4, severity: "grave", from: [51, 61, 71, 81, 111, 121, 131, 141, 151, 161, 171, 171], to: [60, 70, 80, 90, 120, 130, 140, 150, 160, 170, 180, 180] },
  { fine: 500, points: 6, severity: "grave", from: [61, 71, 81, 91, 121, 131, 141, 151, 161, 171, 181, 181], to: [70, 80, 90, 100, 130, 140, 150, 160, 170, 180, 190, 190] },
  { fine: 600, points: 6, severity: "muy-grave", from: [71, 81, 91, 101, 131, 141, 151, 161, 171, 181, 191, 191], to: null },
];

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

const LSV = "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722";

export const SOURCES = {
  lsv: {
    name: "Real Decreto Legislativo 6/2015, de 30 de octubre, por el que se aprueba el texto refundido de la Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial",
    url: LSV,
    publisher: "BOE",
    ref: "BOE-A-2015-11722, texto consolidado, última actualización publicada el 26/06/2026",
    read: RULES_AS_OF,
  },
  l39: {
    name: "Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas (arts. 30 y 43)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565",
    publisher: "BOE",
    ref: "BOE-A-2015-10565, texto consolidado, última actualización publicada el 06/11/2024",
    read: RULES_AS_OF,
  },
  lgt: {
    name: "Ley 58/2003, de 17 de diciembre, General Tributaria (arts. 28 y 62.5)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186",
    publisher: "BOE",
    ref: "BOE-A-2003-23186, texto consolidado, última actualización publicada el 21/12/2024",
    read: RULES_AS_OF,
  },
  lgp: {
    name: "Ley 47/2003, de 26 de noviembre, General Presupuestaria (art. 10.1)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2003-21614",
    publisher: "BOE",
    ref: "BOE-A-2003-21614, texto consolidado",
    read: RULES_AS_OF,
  },
  ljca: {
    name: "Ley 29/1998, de 13 de julio, reguladora de la Jurisdicción Contencioso-administrativa (art. 46.1)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1998-16718",
    publisher: "BOE",
    ref: "BOE-A-1998-16718, texto consolidado",
    read: RULES_AS_OF,
  },
  int914: {
    name: "Orden INT/914/2024, de 2 de septiembre, por la que se regulan los cursos de sensibilización y reeducación vial (arts. 3 y 4)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2024-17780",
    publisher: "BOE",
    ref: "BOE-A-2024-17780, en vigor desde el 4/11/2024",
    read: RULES_AS_OF,
  },
  dgtFine: {
    name: "¿Qué hacer si has recibido una multa?",
    url: "https://www.dgt.es/nuestros-servicios/multas-y-sanciones/que-hacer-si-has-recibido-una-multa/",
    publisher: "Dirección General de Tráfico",
    ref: "actualizada el 26/07/2023",
    read: RULES_AS_OF,
  },
  dgtNotify: {
    name: "¿Cómo quieres que te notifiquemos tus multas?",
    url: "https://www.dgt.es/nuestros-servicios/multas-y-sanciones/como-y-donde-quieres-que-te-notifiquemos-tus-multas/",
    publisher: "Dirección General de Tráfico",
    ref: "actualizada el 05/09/2022",
    read: RULES_AS_OF,
  },
  dgtWho: {
    name: "¿Quién puede multarte?",
    url: "https://www.dgt.es/nuestros-servicios/multas-y-sanciones/quien-puede-multarte/",
    publisher: "Dirección General de Tráfico",
    ref: "actualizada el 22/10/2020",
    read: RULES_AS_OF,
  },
  dgtPoints: {
    name: "Recuperación de permisos y puntos",
    url: "https://www.dgt.es/nuestros-servicios/permisos-de-conducir/tus-puntos-y-tus-permisos/recupera-tus-puntos/",
    publisher: "Dirección General de Tráfico",
    ref: "actualizada el 30/10/2025",
    read: RULES_AS_OF,
  },
  sctPay: {
    name: "Pagament de sancions",
    url: "https://transit.gencat.cat/ca/gestions/multes-i-sancions/pagament-sancions/",
    publisher: "Servei Català de Trànsit",
    ref: "actualitzada el 29.10.2024",
    read: RULES_AS_OF,
  },
  sctAppeal: {
    name: "Presentació d'al·legacions i recursos",
    url: "https://transit.gencat.cat/ca/gestions/multes-i-sancions/presentacio-escrits/",
    publisher: "Servei Català de Trànsit",
    ref: "al·legacions, recurs de reposició i constrenyiment per l'ATC",
    read: RULES_AS_OF,
  },
  atc: {
    name: "Com presentar un recurs contra una multa",
    url: "https://atc.gencat.cat/ca/que-cal-fer/com-recurs-multa/",
    publisher: "Agència Tributària de Catalunya",
    ref: "recàrrecs del 10 % i del 20 %",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/**
 * The official services we link (we never ask for a plate, an ID or a file
 * number). The DGT's are its own dgt.es links, which answer a 302 to
 * sede.dgt.gob.es (checked 18 Nov 2026: /es/multas/pago-de-multas/,
 * /es/multas/direccion-electronica-vial/,
 * /es/multas/consulta-del-tablon-edictal-de-sanciones/,
 * /es/multas/presentacion-de-alegacion-o-recurso-a-una-multa/).
 */
export const SERVICES = {
  dgtPay: "https://www.dgt.es/.galleries/enlaces/sede/multas/pago-multas.html",
  dgtDev: "https://www.dgt.es/.galleries/enlaces/sede/multas/dev.html",
  dgtTeu: "https://www.dgt.es/.galleries/enlaces/sede/multas/teu.html",
  dgtAppeal: "https://www.dgt.es/.galleries/enlaces/sede/multas/alegaciones.html",
  dgtPoints: "https://www.dgt.es/nuestros-servicios/permisos-de-conducir/tus-puntos-y-tus-permisos/consulta-y-certificado-de-puntos/",
  sctPay: { ca: "https://transit.gencat.cat/ca/gestions/multes-i-sancions/pagament-sancions/", es: "https://transit.gencat.cat/es/gestions/multes-i-sancions/pagament-sancions/" },
} as const;

/** Verbatim quotes (Spanish, as published), read on RULES_AS_OF. */
export const QUOTE = {
  /** LSV art. 93.1, first paragraph. */
  twentyDays:
    "Notificada la denuncia, ya sea en el acto o en un momento posterior, el denunciado dispondrá de un plazo de veinte días naturales para realizar el pago voluntario con reducción de la sanción de multa, o para formular las alegaciones y proponer o aportar las pruebas que estime oportunas.",
  /** LSV art. 93.1, second paragraph, first sentence. */
  identify:
    "En el supuesto de que no se haya producido la detención del vehículo, el titular, el arrendatario a largo plazo o el conductor habitual, en su caso, dispondrán de un plazo de veinte días naturales para identificar al conductor responsable de la infracción, contra el que se iniciará el procedimiento sancionador.",
  /** LSV art. 93.2. */
  excluded: "El procedimiento sancionador abreviado no será de aplicación a las infracciones previstas en el artículo 77.h), j), n), ñ), o), p), q), r), s) y t).",
  /** LSV art. 94, opening. */
  abbreviated:
    "Una vez realizado el pago voluntario de la multa, ya sea en el acto de entrega de la denuncia o dentro del plazo de veinte días naturales contados desde el día siguiente al de su notificación, concluirá el procedimiento sancionador con las siguientes consecuencias:",
  /** LSV art. 94 a), b), c), f), g). */
  reduction: "La reducción del 50 por ciento del importe de la sanción.",
  waiver: "La renuncia a formular alegaciones. En el caso de que se formulen se tendrán por no presentadas.",
  ends: "La terminación del procedimiento, sin necesidad de dictar resolución expresa, el día en que se realice el pago.",
  firm: "La firmeza de la sanción en la vía administrativa desde el momento del pago, produciendo plenos efectos desde el día siguiente.",
  noRecord:
    "La sanción no computará como antecedente en el Registro de Conductores e Infractores del organismo autónomo Jefatura Central de Tráfico, siempre que se trate de infracciones graves que no lleven aparejada pérdida de puntos.",
  /** LSV art. 95.1. */
  alegaciones: "Notificada la denuncia, el interesado dispondrá de un plazo de veinte días naturales para formular las alegaciones que tenga por conveniente y proponer o aportar las pruebas que estime oportunas.",
  /** LSV art. 95.4. */
  nothing:
    "Si el denunciado no formula alegaciones ni abona el importe de la multa en el plazo de veinte días naturales siguientes al de la notificación de la denuncia, ésta surtirá el efecto de acto resolutorio del procedimiento sancionador en los siguientes casos:",
  nothingCases:
    "a) Infracciones leves en todos los casos. b) Infracciones graves que no supongan la detracción de puntos cuya notificación no se haya podido efectuar en el acto de la denuncia. c) Infracciones graves y muy graves cuya notificación se efectuase en el acto de la denuncia, supongan o no la detracción de puntos.",
  enforceable: "En estos supuestos, la sanción podrá ejecutarse transcurridos treinta días naturales desde la notificación de la denuncia.",
  /** LSV art. 96.2 and 96.3. */
  reposicion: "Contra las resoluciones sancionadoras, podrá interponerse recurso de reposición, con carácter potestativo, en el plazo de un mes contado desde el día siguiente al de su notificación.",
  noSuspension: "La interposición del recurso de reposición no suspenderá la ejecución del acto impugnado ni la de la sanción.",
  /** LSV art. 96.1. */
  resolutionEnds:
    "La resolución sancionadora pondrá fin a la vía administrativa y la sanción se podrá ejecutar desde el día siguiente a aquel en que se notifique al interesado, produciendo plenos efectos, o, en su caso, una vez haya transcurrido el plazo indicado en el artículo 95.4.",
  /** LSV art. 110.1. */
  finalPayment:
    "Una vez firme la sanción, el interesado dispondrá de un plazo final de quince días naturales para el pago de la multa. Finalizado el plazo establecido sin que se haya pagado la multa, se iniciará el procedimiento de apremio.",
  /** LSV art. 90.1. */
  devFirst:
    "Las Administraciones con competencias sancionadoras en materia de tráfico notificarán las denuncias que no se entreguen en el acto y las demás notificaciones a que dé lugar el procedimiento sancionador en la Dirección Electrónica Vial (DEV).",
  /** LSV art. 90.2, second paragraph, first sentence. */
  devRejected:
    "Si existiendo constancia de la recepción de la notificación en la Dirección Electrónica Vial (DEV), transcurrieran diez días naturales sin que se acceda a su contenido, se entenderá que aquélla ha sido rechazada, salvo que de oficio o a instancia del destinatario se compruebe la imposibilidad técnica o material del acceso.",
  /** LSV art. 90.3, second paragraph. */
  paperTwice:
    "Si nadie se hiciera cargo de la notificación, se dejará constancia de esta circunstancia en el procedimiento sancionador, junto con el día y la hora en que se intentó, y se practicará de nuevo dentro de los tres días siguientes. Si tampoco fuera posible la entrega, se dará por cumplido el trámite, procediéndose a la publicación en el Boletín Oficial del Estado.",
  /** LSV art. 91, last sentence. */
  boe: "Transcurrido el período de veinte días naturales desde que la notificación se hubiese publicado en el BOE se entenderá que ésta ha sido practicada, dándose por cumplido dicho trámite.",
  /** LSV art. 92.1. */
  testra:
    "Con carácter previo y facultativo, las notificaciones a que se refiere el artículo anterior podrán practicarse también en el Tablón Edictal de Sanciones de Tráfico (TESTRA), que será gestionado por el organismo autónomo Jefatura Central de Tráfico.",
  /** DGT, "¿Cómo quieres que te notifiquemos tus multas?". */
  dgtTeu: "La notificación se entenderá por realizada y se tomará como fecha de notificación de cara a realizar los pagos y alegaciones la fecha de publicación en el TEU.",
  /** LSV art. 83.1. */
  supletoria:
    "No se podrá imponer sanción alguna por las infracciones tipificadas en esta ley sino en virtud de procedimiento instruido con arreglo a lo dispuesto en este capítulo y, supletoriamente, en la normativa de procedimiento administrativo común.",
  /** Ley 39/2015 art. 30.5 and 30.6. */
  lastDayInhabil: "Cuando el último día del plazo sea inhábil, se entenderá prorrogado al primer día hábil siguiente.",
  eitherPlace: "Cuando un día fuese hábil en el municipio o Comunidad Autónoma en que residiese el interesado, e inhábil en la sede del órgano administrativo, o a la inversa, se considerará inhábil en todo caso.",
  /** Ley 39/2015 art. 30.2, second paragraph. */
  naturalStated: "Cuando los plazos se hayan señalado por días naturales por declararlo así una ley o por el Derecho de la Unión Europea, se hará constar esta circunstancia en las correspondientes notificaciones.",
  /** LSV art. 112.1 and 112.2. */
  prescription: "El plazo de prescripción de las infracciones previstas en esta ley será de tres meses para las infracciones leves y de seis meses para las infracciones graves y muy graves.",
  prescriptionStart: "El plazo de prescripción comenzará a contar a partir del mismo día en que los hechos se hubieran cometido.",
  interruption:
    "La prescripción se interrumpe por cualquier actuación administrativa de la que tenga conocimiento el denunciado o esté encaminada a averiguar su identidad o domicilio y se practique con otras administraciones, instituciones u organismos. También se interrumpe por la notificación efectuada de acuerdo con los artículos 89, 90 y 91.",
  /** LSV art. 112.3, first paragraph. */
  caducidad:
    "Si no se hubiera producido la resolución sancionadora transcurrido un año desde la iniciación del procedimiento, se producirá su caducidad y se procederá al archivo de las actuaciones, a solicitud de cualquier interesado o de oficio por el órgano competente para dictar resolución.",
  /** LSV art. 112.4, first sentence. */
  sanctionPrescription:
    "El plazo de prescripción de las sanciones consistentes en multa será de cuatro años y el de la suspensión prevista en el artículo 80 será de un año, computados desde el día siguiente a aquel en que adquiera firmeza la sanción en vía administrativa.",
  /** LSV art. 80.1. */
  amounts:
    "Las infracciones leves serán sancionadas con multa de hasta 100 euros; las graves, con multa de 200 euros, y las muy graves, con multa de 500 euros. No obstante, las infracciones consistentes en no respetar los límites de velocidad se sancionarán en la cuantía prevista en el anexo IV.",
  /** LSV art. 80.2 b). */
  noIdentifyFine: "La multa por la infracción prevista en el artículo 77. j) será el doble de la prevista para la infracción originaria que la motivó, si es infracción leve, y el triple, si es infracción grave o muy grave.",
  /** LSV art. 77 h) and j). */
  jammer:
    "Conducir vehículos que tengan instalados inhibidores de radares o cinemómetros o cualesquiera otros mecanismos encaminados a interferir en el correcto funcionamiento de los sistemas de vigilancia del tráfico.",
  noIdentify:
    "Incumplir el titular o el arrendatario del vehículo con el que se haya cometido la infracción la obligación de identificar verazmente al conductor responsable de dicha infracción, cuando sean debidamente requeridos para ello en el plazo establecido.",
  /** LSV art. 64.1. */
  pointsLost:
    "El número de puntos inicialmente asignado al titular de un permiso o licencia de conducción se verá reducido por cada sanción firme en vía administrativa que se le imponga por la comisión de infracciones graves o muy graves que lleven aparejada la pérdida de puntos, de acuerdo con el baremo establecido en los anexos II y IV.",
  /** LSV art. 64.4. */
  dayCap:
    "Los conductores no perderán más de ocho puntos por acumulación de infracciones en un solo día, salvo que concurra alguna de las infracciones muy graves a que se refieren los párrafos a), c), d), e), f), g), h) e i) del artículo 77, en cuyo caso perderán el número total de puntos que correspondan.",
  /** LSV art. 65.1. */
  twoYears:
    "Transcurridos dos años sin haber sido sancionados en firme en vía administrativa por la comisión de infracciones que lleven aparejada la pérdida de puntos, el titular de un permiso o licencia de conducción afectado por la pérdida parcial de puntos recuperará la totalidad del crédito inicial de doce puntos.",
  /** The paragraph Ley 18/2021 deleted from art. 65.1 (2015 text), which pages still repeat. */
  threeYearsDeleted: "No obstante, en el caso de que la pérdida de alguno de los puntos se debiera a la comisión de infracciones muy graves, el plazo para recuperar la totalidad del crédito será de tres años.",
  /** LSV art. 65.4, first paragraph. */
  courseLaw:
    "El titular de un permiso o licencia de conducción que haya perdido una parte del crédito inicial de puntos asignado, podrá optar a su recuperación parcial, hasta un máximo de seis puntos, por una sola vez cada dos años, realizando y superando con aprovechamiento un curso de sensibilización y reeducación vial, con la excepción de los conductores profesionales que podrán realizar el citado curso con frecuencia anual.",
  /** Orden INT/914/2024 art. 3 a). */
  courseOrder:
    "De recuperación parcial de puntos. La realización y superación con aprovechamiento de este curso permitirá al titular de la autorización para conducir la recuperación de cuatro puntos, sin que en ningún caso se puedan recuperar más puntos de los que se hubieran perdido.",
  /** LSV art. 84.1 and 84.4, first sentences. */
  interurban:
    "La competencia para sancionar las infracciones cometidas en vías interurbanas y travesías corresponde al Jefe de Tráfico de la provincia en que se haya cometido el hecho.",
  regions: "En las comunidades autónomas que hayan recibido el traspaso de funciones y servicios en materia de tráfico y circulación de vehículos a motor serán competentes para sancionar los órganos previstos en la normativa autonómica.",
  urban: "La sanción por infracción a normas de circulación cometidas en vías urbanas corresponderá a los respectivos Alcaldes, los cuales podrán delegar esta competencia de acuerdo con la normativa aplicable.",
  /** LSV art. 110.2. */
  collection: "Los órganos y procedimientos de la recaudación ejecutiva serán los establecidos en la normativa tributaria que le sea de aplicación, según las autoridades que las hayan impuesto.",
  /** LGT art. 28.2-28.4. */
  surchargeExecutive: "El recargo ejecutivo será del cinco por ciento y se aplicará cuando se satisfaga la totalidad de la deuda no ingresada en periodo voluntario antes de la notificación de la providencia de apremio.",
  surchargeReduced:
    "El recargo de apremio reducido será del 10 por ciento y se aplicará cuando se satisfaga la totalidad de la deuda no ingresada en periodo voluntario y el propio recargo antes de la finalización del plazo previsto en el apartado 5 del artículo 62 de esta ley para las deudas apremiadas.",
  surchargeOrdinary: "El recargo de apremio ordinario será del 20 por ciento y será aplicable cuando no concurran las circunstancias a las que se refieren los apartados 2 y 3 de este artículo.",
  /** LGT art. 62.5 a) and b). */
  apremioFirst:
    "Si la notificación de la providencia se realiza entre los días uno y 15 de cada mes, desde la fecha de recepción de la notificación hasta el día 20 de dicho mes o, si éste no fuera hábil, hasta el inmediato hábil siguiente.",
  apremioSecond:
    "Si la notificación de la providencia se realiza entre los días 16 y último de cada mes, desde la fecha de recepción de la notificación hasta el día cinco del mes siguiente o, si éste no fuera hábil, hasta el inmediato hábil siguiente.",
  /** DGT, "¿Qué hacer si has recibido una multa?". */
  dgt45: "Este periodo ordinario te da un plazo de 45 días despues de que recibas la notificación para realizar el pago de la multa. En este caso tendrás que abonar el 100% del importe.",
  dgtAeat: "Una vez finalizado el plazo de 45 días desde la notificiación de la sanción, si no has pagado, la multa será remitida a la Agencia Estatal de la Administración Tributaria, que se encargará de cobrarla con un 20% de recargo.",
  dgtNoSplit: "Recuerda que no puedes fraccionar o aplazar el pago de una multa.",
  dgtIdentify10: "Si no eras el conductor, debes indicarnos en un plazo de 10 días desde que te notificamos la infracción quién es el responsable de la infracción, y así poder aplicar la sanción al responsable.",
  dgtEmail: "La DGT NUNCA notifica sus multas a través de correo electrónico.",
  /** SCT, "Pagament de sancions" (Catalan, as published). */
  sct: "D'acord amb el que estableix la legislació vigent, les sancions de multa es poden pagar en el termini de 20 dies naturals següents a la data de notificació de la denúncia amb una reducció del 50% de la quantia consignada a la notificació.",
  /** SCT, "Presentació d'al·legacions i recursos" (Catalan). */
  sctAtc: "Quan no s’ha efectuat el pagament d’una sanció en el període voluntari, s'inicia la recaptació per via executiva que correspon a l’Agència Tributària de Catalunya (ATC).",
  /** ATC (Catalan). */
  atc: "l'ATC et reclama l’import de la multa més un recàrrec reduït del 10 % si el pagues dins del termini indicat a la notificació, o bé un recàrrec ordinari del 20 % més interessos de demora si l'ingresses més tard.",
} as const;

/** The quotes in Catalan (SCT, ATC); every other quote is in Spanish. */
export const CATALAN_QUOTES: readonly (keyof typeof QUOTE)[] = ["sct", "sctAtc", "atc"];
