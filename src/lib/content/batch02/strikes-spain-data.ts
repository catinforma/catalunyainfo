import { B2_TITLES, b2link, type B2Source } from "./shared";
import { strike11nCityLinks } from "./strike-11n-city-paths";
import { CITY_STATE_URLS } from "./strike-11n-cities-data";
import { STRIKE_URLS } from "./strikes";
import type { SpainSectorStatus, SpainStrike } from "./strikes-spain-model";

/**
 * The facts of the Spain-wide strikes hub (`strikes-spain.ts`): the one file
 * the strike watch edits. Read on 6 Nov 2026 on the organisers' own sites, the
 * BOE and the Ministry of Transport's lists (fact pack:
 * research_notes/x10/huelgas-espana-factpack.md).
 *
 * HOW TO UPDATE: see the header of `strikes-spain.ts`. In short: re-read the
 * organisers and the official lists, edit the entries below (only what an
 * organiser or an official source says), move STRIKES_SPAIN_AS_OF to the day
 * you checked, run the tests, deploy, publish `?only=huelgas-espana`.
 */

/**
 * The day the list was last brought up to date. Upcoming and past, and the
 * month in the title, are decided against this date, never the clock: the
 * HTML is the same whichever day it is rendered. A test fails 4 days after it.
 */
export const STRIKES_SPAIN_AS_OF = "2026-11-06";

/** The facts were re-read on the sources on the as-of day: one constant to move. */
export const STRIKES_SPAIN_VERIFIED = STRIKES_SPAIN_AS_OF;

/** The URLs this page adds to STRIKE_URLS and CITY_STATE_URLS. */
export const SPAIN_STRIKE_URLS = {
  // Ministry of Transport, 23 Oct 2026: SEMAF at Grupo Renfe, 29 Oct 2026, all of Spain (amended 28 Oct; the list's link
  // for the amendment points at an older file, so only the resolution itself is cited).
  renfe29Resolution: "https://cdn.transportes.gob.es/portal-web-transportes/transporte-terrestre/servicios-minimos/20261023_resolucion_ssmm_renfe__nacional_conduccion.pdf",
  // ALFERRO, comunicado 80/2026 (4 Nov 2026): its Grupo Renfe strike moves from 10 and 12 Nov to 17 Nov.
  alferro80: "https://alferro.org/comunicado/comunicado-80-2026-modificacion-de-las-fechas-de-huelga-de-noviembre-de-2026/",
  // CCOO's state rail sector (3 Nov 2026): rally on 16 Nov and a 24-hour strike on 17 Nov, agreed in Adif's works council.
  ccooRail17: "https://ferroviario.fsc.ccoo.es/noticia:771650--CCOO_anuncia_movilizaciones_los_dias_16_y_17_de_noviembre_para_exigir_un_cambio_de_modelo_ferroviario_y_garantizar_la_seguridad",
  // USCA (7 Apr 2026): USCA and CCOO call an indefinite strike at SAERCO's control towers from 17 Apr 2026.
  uscaSaerco: "https://www.usca.es/usca-y-ccoo-convocan-huelga-indefinida-en-saerco-por-recortes-de-plantilla-y-riesgos-para-la-seguridad-operacional/",
  // Ministry of Transport, 28 Sep 2026: SAERCO minimum services, in force 1 Oct to 30 Nov 2026.
  saercoResolution: "https://cdn.transportes.gob.es/portal-web-transportes/aereo/huelga-servicios-minimos/51_26-10-01--resolucion-huelga-saerco_vi.pdf",
  // CESM (7 Oct 2026): the doctors' strike committee (CESM, SMA, SME) postpones the state-wide indefinite strike due from 28 Oct.
  cesmPostponed: "https://www.cesm.org/2026/10/07/el-comite-de-huelga-aplaza-los-paros-indefinidos-tras-la-convocatoria-electoral-pero-mantiene-vivo-el-conflicto/",
  // CCOO Educación: calls education staff to join the 11 Nov general strike (page undated, documents of 20-27 Oct 2026).
  feccoo11n: "https://fe.ccoo.es/Huelgageneral",
  // CCOO Justicia (4 Nov 2026): agreement with UGT and the Ministry of Justice on 11N minimum services, pending signature.
  ccooJusticia11n: "https://justicia.fsc.ccoo.es/noticia:771809",
  // Sindicato de Estudiantes (30 Oct 2026): European students' strike on 20 Nov, rallies at 12:00.
  estudiantes20n: "https://www.sindicatodeestudiantes.net/index.php/noticias/internacional/20n-huelga-estudiantil-europea",
  // CSIF (9 Oct 2026): suspends its Correos protests until after the general election.
  csifCorreos: "https://www.csif.es/es/noticia/portada/andalucia/articulo/98192",
} as const;

const U = { ...STRIKE_URLS, ...CITY_STATE_URLS, ...SPAIN_STRIKE_URLS };
const link = (href: string, label: string) => `[${label}](${href})`;

/** The legal basis, from the BOE only. */
export const SPAIN_FRAMEWORK_SOURCES: B2Source[] = [
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "BOE" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo (artículos 3, 4 y 10)", url: U.rdl17, publisher: "BOE" },
];

const SEMAF_1012: B2Source = {
  name: "SEMAF continúa convocando huelgas los días 10 y 12 de noviembre en el Grupo Renfe (nº 2026-51, 29/10/2026)",
  url: U.semaf1012,
  publisher: "SEMAF",
};
const SEMAF_CUERPO: B2Source = {
  name: "Encuentro con el ministro Carlos Cuerpo: Ni una tragedia más (05/11/2026)",
  url: U.semafCuerpo,
  publisher: "SEMAF",
};
const ALFERRO_80: B2Source = { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026 (04/11/2026)", url: U.alferro80, publisher: "ALFERRO" };
const MINISTRY_RAIL: B2Source = { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" };

/** While the Ministry's resolution is not out: who sets the State's rail minimum services, and where. */
const RAIL_PENDING = `los del resto de España (Cercanías, Media Distancia, alta velocidad y larga distancia) los fija el Ministerio de Transportes por resolución, que aún no ha publicado (consultado el 6 de noviembre de 2026 en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")})`;

export const SPAIN_STRIKES: SpainStrike[] = [
  /* ------------------------------------------------------------------------ */
  /* Past: kept as a compact record under "Huelgas recientes".                */
  /* ------------------------------------------------------------------------ */
  {
    id: "huelga-renfe-2026-10-29",
    dates: ["2026-10-29"],
    sector: "rail",
    call: "convocada",
    title: "huelga de maquinistas del Grupo Renfe (SEMAF)",
    label: "Renfe",
    scope: "toda España",
    hours: "de 0.01 a 23.59 h.",
    calledBy: `el sindicato de maquinistas SEMAF, para todo el personal de conducción del Grupo Renfe (${link(U.semaf29, "su convocatoria")}).`,
    who: "al personal de conducción de las empresas del Grupo Renfe.",
    notes: [],
    minimumServices: {
      status: "published",
      short: "Publicados por el Ministerio de Transportes",
      text: `Los fijó el Ministerio de Transportes en ${link(U.renfe29Resolution, "su resolución del 23 de octubre de 2026")}, para todo el territorio nacional.`,
    },
    guides: [],
    sources: [
      { name: "SEMAF convoca huelga en el Grupo Renfe para el 29 de octubre", url: U.semaf29, publisher: "SEMAF" },
      {
        name: "Resolución de 23 de octubre de 2026: servicios mínimos durante la huelga convocada por SEMAF en el Grupo Renfe en todo el territorio nacional el día 29 de octubre de 2026",
        url: U.renfe29Resolution,
        publisher: "Ministerio de Transportes y Movilidad Sostenible",
      },
    ],
    catalanEntry: "vaga-renfe-2026-10-29",
  },
  {
    id: "huelga-ouigo-2026-10-30",
    dates: ["2026-10-30", "2026-11-02"],
    sector: "rail",
    call: "convocada",
    title: "huelga de maquinistas de Ouigo (SEMAF)",
    label: "Ouigo",
    scope: "las líneas de alta velocidad de Ouigo",
    hours: "de 0.00 a 23.59 h, según la resolución de servicios mínimos.",
    calledBy: "el sindicato de maquinistas SEMAF.",
    who: "a todo el personal de conducción de Ouigo España.",
    notes: [],
    minimumServices: {
      status: "published",
      short: "El 72,41% de los trenes (Ministerio de Transportes)",
      text: `El 72,41% de las circulaciones previstas, según ${link(U.ouigoResolution, "la resolución del Ministerio de Transportes del 27 de octubre de 2026")}. SEMAF desconvocó el 5 de noviembre los paros parciales de la misma convocatoria (6 y 9 de noviembre, 4 y 8 de diciembre) tras firmar un acuerdo con la empresa, según ${link(U.semafOuigo, "su comunicado")}.`,
    },
    guides: [],
    sources: [
      {
        name: "Resolución de 27 de octubre de 2026: servicios mínimos durante la huelga convocada por SEMAF en OUIGO España (30 de octubre, 2, 6 y 9 de noviembre, 4 y 8 de diciembre)",
        url: U.ouigoResolution,
        publisher: "Ministerio de Transportes y Movilidad Sostenible",
      },
      { name: "Ouigo firma todas las reivindicaciones tras dos días sin circular ningún tren (05/11/2026)", url: U.semafOuigo, publisher: "SEMAF" },
    ],
    catalanEntry: "vaga-ouigo-2026-10-30",
  },

  /* ------------------------------------------------------------------------ */
  /* Upcoming                                                                 */
  /* ------------------------------------------------------------------------ */
  {
    id: "huelga-saerco-2026-04-17",
    dates: ["2026-04-17"],
    indefinite: {},
    sector: "air",
    call: "convocada",
    title: "huelga indefinida de controladores aéreos de SAERCO en nueve aeropuertos",
    label: "controladores aéreos",
    scope: "Jerez, Sevilla, A Coruña, Vigo, Madrid-Cuatro Vientos, El Hierro, Fuerteventura, Lanzarote y La Palma",
    hours: "indefinida, desde las 0.00 h del 17 de abril de 2026, en todos los servicios, según la resolución de servicios mínimos del Ministerio de Transportes.",
    calledBy: `los sindicatos USCA y CCOO, que la preavisaron en abril (${link(U.uscaSaerco, "comunicado de USCA")}).`,
    who: "a los controladores aéreos de la empresa SAERCO en las torres de control de esos nueve aeropuertos.",
    notes: [
      "**Sigue convocada:** USCA y CCOO no han anunciado su desconvocatoria (consultado el 6 de noviembre de 2026), y el Ministerio de Transportes ha ido renovando los servicios mínimos desde abril.",
    ],
    minimumServices: {
      status: "published",
      short: "Publicados por el Ministerio de Transportes, hasta el 30 de noviembre",
      text: `Los fija el Ministerio de Transportes en ${link(U.saercoResolution, "su resolución del 28 de septiembre de 2026")}, vigente del 1 de octubre al 30 de noviembre: en noviembre, según el aeropuerto, entre el 65% y el 80% de los vuelos con las islas y de las rutas de servicio público, entre el 51% y el 58% de los internacionales y de los peninsulares cuya alternativa en transporte público supera las cinco horas, y entre el 32% y el 36% del resto de rutas peninsulares, además de todos los vuelos de emergencia. Si la huelga sigue en diciembre, hará falta una resolución nueva. El estado de tu vuelo, en tu compañía aérea.`,
    },
    msValidUntil: "2026-11-30",
    guides: [],
    sources: [
      { name: "USCA y CCOO convocan huelga indefinida en SAERCO por recortes de plantilla y riesgos para la seguridad operacional (07/04/2026)", url: U.uscaSaerco, publisher: "USCA" },
      {
        name: "Resolución de 28 de septiembre de 2026: servicios mínimos durante la huelga convocada por USCA y CCOO en SAERCO (vigente del 1 de octubre al 30 de noviembre de 2026)",
        url: U.saercoResolution,
        publisher: "Ministerio de Transportes y Movilidad Sostenible",
      },
    ],
  },
  {
    id: "huelga-renfe-2026-11-10",
    dates: ["2026-11-10", "2026-11-12"],
    sector: "rail",
    call: "convocada",
    title: "huelga de maquinistas del Grupo Renfe (SEMAF)",
    label: "Renfe",
    scope: "Grupo Renfe, en toda España",
    hours: `el martes 10, «paro total», de 0.01 a 23.59 h; el jueves 12, «paros parciales a lo largo de la jornada», de 6.20 a 9.20 h, de 14.20 a 17.20 h y de 21.20 a 23.20 h, según ${link(U.ordreRenfe1012, "la orden de servicios mínimos de la Generalitat del 5 de noviembre")}.`,
    calledBy: `el sindicato de maquinistas SEMAF, que la anunció el 29 de octubre en ${link(U.semaf1012, "su comunicado n.º 2026-51")} y la mantenía el 5 de noviembre, tras reunirse sin acuerdo con el ministro de Transportes, Carlos Cuerpo, según ${link(U.semafCuerpo, "su comunicado de ese día")}. El Ministerio lo volvió a citar el viernes 6.`,
    who: "al personal de conducción del Grupo Renfe.",
    notes: [
      `**ALFERRO ya no hace huelga estos días:** el sindicato, que también había convocado al personal del Grupo Renfe el 10 y el 12, ha acordado «sustituir las jornadas de huelga de los días 10 y 12 de noviembre por una jornada el próximo 17 de noviembre de 2026», según ${link(U.alferro80, "su comunicado 80/2026 del 4 de noviembre")}.`,
    ],
    minimumServices: {
      status: "partial",
      short: "Publicados en Cataluña (Rodalies); pendientes los del Ministerio de Transportes",
      text: `En **Cataluña**, ${link(U.ordreRenfe1012, "la orden de la Generalitat del 5 de noviembre")} fija para Rodalies y los regionales el 66% del servicio en hora punta y el 33% el resto del día. ${RAIL_PENDING.charAt(0).toUpperCase()}${RAIL_PENDING.slice(1)}.`,
    },
    guides: [b2link("strikeRenfe", "es", B2_TITLES.strikeRenfe.es)],
    sources: [
      SEMAF_1012,
      ALFERRO_80,
      { name: "Por el cumplimiento inmediato de los compromisos en seguridad ferroviaria (nº 2026-52, 02/11/2026)", url: U.semaf52, publisher: "SEMAF" },
      SEMAF_CUERPO,
      {
        name: "Ordre EMT/ /2026, de 5 de novembre, per la qual es garanteix el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe (e-Tauler, 5/11/2026; al DOGC quan es publiqui)",
        url: U.treballMs,
        publisher: "Departament d'Empresa i Treball",
      },
      MINISTRY_RAIL,
    ],
    catalanEntry: "vaga-renfe-2026-11-10",
  },
  {
    id: "huelga-general-2026-11-11",
    dates: ["2026-11-11"],
    sector: "general",
    call: "convocada",
    title: "huelga general de 24 horas",
    label: "huelga general",
    scope: "toda España",
    hours: `de 0 a 24 h del miércoles 11. Donde se trabaja por turnos, desde el primer turno, aunque empiece antes de las 0 h, hasta el último, según la convocatoria tal como la recoge ${link(U.correosOrder, "la Orden INT/1170/2026 del BOE")}.`,
    calledBy: `CCOO y UGT, que la registraron y presentaron el 19 de octubre de 2026 en el Ministerio de Trabajo con «Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS, y Unión de Actores y Actrices», según ${link(U.ccooRegistered, "CCOO")}. ${link(U.ccooCall, "Su convocatoria")} pide «desbloquear la negociación colectiva», subir salarios, reducir la jornada y políticas contra la especulación de la vivienda; ${link(U.ugt, "UGT")}, una subida del salario mínimo «de, al menos, un 7% en 2027».`,
    who: "a todas las personas trabajadoras, del sector público y del privado.",
    notes: [
      `**En la educación:** CCOO convoca «a las personas trabajadoras de la educación y de los sectores socioeducativos a secundar la huelga general del 11 de noviembre» (${link(U.feccoo11n, "CCOO Educación")}).`,
      `**En los juzgados:** CCOO informó el 4 de noviembre de un acuerdo con UGT y el Ministerio de Justicia sobre los servicios mínimos en los juzgados que dependen del Ministerio, «pendiente de la firma y publicidad» de la resolución (${link(U.ccooJusticia11n, "CCOO Justicia")}).`,
    ],
    minimumServices: "strike11n",
    guides: [
      b2link("strike11n", "es", "Huelga general del 11 de noviembre en Cataluña"),
      `por ciudades: ${strike11nCityLinks()}`,
    ],
    sources: [
      { name: "Registro de la huelga general del 11N (19/10/2026)", url: U.ccooRegistered, publisher: "CCOO" },
      { name: "Convocamos huelga general para el 11 de noviembre (07/10/2026)", url: U.ccooCall, publisher: "CCOO" },
      { name: "Huelga general de 24 horas este 11 de noviembre", url: U.ugt, publisher: "UGT" },
      { name: "Huelga general del 11 de noviembre: «¡La huelga general también es nuestra huelga!»", url: U.feccoo11n, publisher: "CCOO Educación" },
      { name: "Acuerdo de CCOO con el Ministerio de Justicia para los servicios mínimos de la Huelga General del 11N en el ámbito no transferido (04/11/2026)", url: U.ccooJusticia11n, publisher: "CCOO Justicia" },
    ],
    catalanEntry: "vaga-general-2026-11-11",
  },
  {
    id: "huelga-estudiantes-2026-11-20",
    dates: ["2026-11-20"],
    sector: "education",
    call: "convocada",
    title: "huelga estudiantil (Sindicato de Estudiantes)",
    label: "estudiantes",
    scope: "institutos y universidades de toda España",
    hours: `todo el día, con «movilizaciones a las 12h», según ${link(U.estudiantes20n, "el Sindicato de Estudiantes")}.`,
    calledBy: `el Sindicato de Estudiantes, dentro de una «huelga estudiantil europea» (${link(U.estudiantes20n, "su convocatoria del 30 de octubre")}).`,
    who: "al alumnado de institutos y universidades. Es una huelga de estudiantes: no convoca al profesorado ni al resto del personal de los centros.",
    notes: [],
    minimumServices: {
      status: "none",
      short: "Ninguno (huelga de estudiantes)",
      text: "No hay servicios mínimos: es una huelga de estudiantes, no de trabajadores.",
    },
    guides: [],
    sources: [{ name: "20N Huelga Estudiantil europea (30/10/2026)", url: U.estudiantes20n, publisher: "Sindicato de Estudiantes" }],
  },
  {
    id: "huelga-maquinistas-2026-11-17",
    dates: ["2026-11-17"],
    sector: "rail",
    call: "convocada",
    title: "huelga de maquinistas de todas las operadoras ferroviarias (SEMAF)",
    label: "maquinistas",
    scope: "todas las operadoras ferroviarias, en toda España",
    hours: "SEMAF aún no ha publicado el horario.",
    calledBy: `el sindicato de maquinistas SEMAF, que ha presentado «una propia convocatoria en el conjunto de las operadoras del sector», según ${link(U.semafCuerpo, "su comunicado del 5 de noviembre")}.`,
    who: "«todos los maquinistas de Renfe, Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain y Medway», según SEMAF.",
    notes: [],
    minimumServices: {
      status: "pending",
      short: "Aún no publicados",
      text: `**Aún no publicados** (consultado el 6 de noviembre de 2026). Los de los trenes los fija el Ministerio de Transportes por resolución, que publica en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}; en Cataluña, los de Rodalies y los regionales, la Generalitat.`,
    },
    guides: [],
    sources: [SEMAF_CUERPO, MINISTRY_RAIL],
  },
  {
    id: "huelga-adif-renfe-2026-11-17",
    dates: ["2026-11-17"],
    sector: "rail",
    call: "anunciada",
    title: "huelga de 24 horas en Adif y el Grupo Renfe (comités generales de empresa)",
    label: "Adif y Renfe",
    scope: "Adif y Grupo Renfe, en toda España",
    hours: "24 horas, según CCOO. Aún no se ha publicado el horario exacto.",
    calledBy: `los sindicatos del comité general de empresa de Adif: el sector ferroviario de CCOO anunció el 3 de noviembre «una concentración para el próximo 16 de noviembre y una huelga de 24 horas el día 17», «consensuadas con todas las organizaciones sindicales representadas en el Comité General de Empresa de Adif» (${link(U.ccooRail17, "CCOO")}). Según ${link(U.alferro80, "ALFERRO")}, el comité general de empresa de Renfe «se ha sumado» a esta «convocatoria de huelga unitaria», y ALFERRO ha trasladado a este día su huelga en el Grupo Renfe.`,
    who: "al personal de Adif y, según ALFERRO, al del Grupo Renfe. SEMAF dice que participa en esta convocatoria conjunta, además de la suya propia para los maquinistas.",
    notes: [],
    minimumServices: {
      status: "pending",
      short: "Aún no publicados",
      text: `**Aún no publicados** (consultado el 6 de noviembre de 2026). Los fija el Ministerio de Transportes por resolución, que publica en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}; en Cataluña, los de Rodalies y los regionales, la Generalitat.`,
    },
    guides: [],
    sources: [
      { name: "CCOO anuncia movilizaciones los días 16 y 17 de noviembre para exigir un cambio de modelo ferroviario y garantizar la seguridad (03/11/2026)", url: U.ccooRail17, publisher: "CCOO (sector ferroviario)" },
      ALFERRO_80,
      SEMAF_CUERPO,
      MINISTRY_RAIL,
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Sectors with no dated state-wide strike of their own                       */
/* -------------------------------------------------------------------------- */

/**
 * What doctors, schools, the courts and Correos have called, checked on
 * 6 Nov 2026 on the unions' own pages. Re-check with every update: a dated
 * strike goes in SPAIN_STRIKES, and the line here says what changed.
 */
export const SPAIN_SECTOR_STATUS: SpainSectorStatus[] = [
  {
    sector: "health",
    heading: "Médicos y sanidad",
    text: [
      `**La huelga estatal de médicos está aplazada.** El Comité de Huelga de CESM, el Sindicato Médico Andaluz y el Sindicato Médico de Euskadi «ha decidido aplazar los paros indefinidos previstos a partir del 28 de octubre ante la convocatoria de elecciones generales», aunque «la convocatoria de huelga continúa vigente y la movilización podrá reactivarse si el próximo Gobierno no atiende las reivindicaciones del colectivo», según ${link(U.cesmPostponed, "CESM")} (7 de octubre de 2026). No hay fecha nueva (consultado el 6 de noviembre de 2026).`,
    ],
    sources: [
      { name: "El Comité de Huelga aplaza los paros indefinidos tras la convocatoria electoral, pero mantiene vivo el conflicto (07/10/2026)", url: U.cesmPostponed, publisher: "CESM" },
    ],
  },
  {
    sector: "education",
    heading: "Educación",
    text: [
      `**El profesorado no tiene convocada ninguna huelga estatal propia** en las webs de CCOO, UGT, STEs, CSIF y ANPE (consultadas el 6 de noviembre de 2026). CCOO llama al personal de la educación a secundar la huelga general del 11 de noviembre (${link(U.feccoo11n, "CCOO Educación")}).`,
    ],
    sources: [{ name: "Huelga general del 11 de noviembre: «¡La huelga general también es nuestra huelga!»", url: U.feccoo11n, publisher: "CCOO Educación" }],
  },
  {
    sector: "justice",
    heading: "Justicia",
    text: [
      `**Ninguna huelga propia en la justicia** en las webs de los sindicatos de la Administración de Justicia (STAJ, CSIF, CCOO, UGT) ni de las asociaciones de jueces y fiscales (consultadas el 6 de noviembre de 2026). El 11 de noviembre, CCOO informa de un acuerdo de servicios mínimos para los juzgados que dependen del Ministerio de Justicia, aún «pendiente de la firma y publicidad» (${link(U.ccooJusticia11n, "CCOO Justicia")}).`,
    ],
    sources: [
      { name: "Acuerdo de CCOO con el Ministerio de Justicia para los servicios mínimos de la Huelga General del 11N en el ámbito no transferido (04/11/2026)", url: U.ccooJusticia11n, publisher: "CCOO Justicia" },
    ],
  },
  {
    sector: "postal",
    heading: "Correos",
    text: [
      `**Correos no tiene convocada ninguna huelga propia** (consultado el 6 de noviembre de 2026 en las webs de CCOO, UGT y CSIF). CSIF «suspende las movilizaciones convocadas en Correos hasta la celebración de las próximas elecciones generales y la constitución de un nuevo Gobierno» (${link(U.csifCorreos, "CSIF")}, 9 de octubre de 2026). El 11 de noviembre, las oficinas abren «en el horario habitual, turno de mañana, o de mañana y tarde en las que lo tengan establecido» para el voto por correo, según la ${link(U.correosOrder, "Orden INT/1170/2026")} del BOE.`,
    ],
    sources: [
      { name: "CSIF suspende las movilizaciones en Correos hasta después de las elecciones (09/10/2026)", url: U.csifCorreos, publisher: "CSIF" },
      {
        name: "Orden INT/1170/2026, de 5 de noviembre: servicios esenciales en Correos durante las huelgas del 11 de noviembre de 2026 (BOE, 6 de noviembre)",
        url: U.correosOrder,
        publisher: "BOE",
      },
    ],
  },
];
