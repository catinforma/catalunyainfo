import type { RegionCalendar } from "./types";

/**
 * The 2026-2027 school calendars, one record per official text, transcribed
 * on 6 Nov 2026. The sentence behind each date is quoted in the fact pack
 * (research_notes/x10/calendario-escolar-espana-2026-27.md).
 *
 * Conventions (types.ts): `christmas` and `easter` run from the first day
 * without class to the last one the text gives, both included; when the text
 * glues extra non-teaching days to the holidays (Madrid, Murcia, Ceuta,
 * Melilla), they are inside the period and `note` says what the text calls
 * the holidays. When the text gives only the last day of class and the day
 * classes resume (Castilla y León), the period is the days in between.
 * Public holidays come from the BOE tables (holidays.ts); `nonTeaching` holds
 * only the other days the text declares without class.
 */
export type RegionData = Omit<RegionCalendar, "slug" | "name" | "short" | "inName" | "deName">;

const ANDALUCIA_PORTAL = "web de la Consejería de Desarrollo Educativo";

export const REGION_DATA: readonly RegionData[] = [
  /* --------------------------------------------------------------- Andalucía */
  {
    boe: "AN",
    order: {
      short: "Decreto 301/2009, de 14 de julio",
      title: "Decreto 301/2009, de 14 de julio, por el que se regula el calendario y la jornada escolar en los centros docentes, a excepción de los universitarios",
      issuer: "Consejería de Desarrollo Educativo y Formación Profesional de la Junta de Andalucía",
      bulletin: "BOJA",
      number: "139",
      date: "2009-07-20",
      url: "https://www.juntadeandalucia.es/boja/2009/139/1",
      departmentUrl: "https://www.juntadeandalucia.es/educacion/portales/web/educacion/w/calendario-escolar",
    },
    levels: [
      {
        levels: "Infantil (2.º ciclo), Primaria y Educación Especial",
        start: "2026-09-10",
        end: "2027-06-24",
        endEarliest: "2027-06-22",
        endText: "entre el 22 y el 24 de junio de 2027, según la provincia",
      },
      {
        levels: "ESO, 1.º de Bachillerato y FP",
        start: "2026-09-15",
        end: "2027-06-24",
        endText: "entre el 22 y el 24 de junio de 2027, según la provincia",
      },
      { levels: "2.º de Bachillerato", start: "2026-09-15", end: "2027-05-24", note: "el 21 de mayo en Córdoba y Huelva; después, clases de repaso hasta el fin de curso" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-21", end: null },
    ],
    christmas: {
      from: "2026-12-24",
      to: "2027-01-06",
      label: "del 23 de diciembre (24 en Sevilla) al 6, 7 u 8 de enero, según la provincia",
      labelShort: "23-24 dic – 6-8 ene",
    },
    easter: {
      from: "2027-03-22",
      to: "2027-03-28",
      note: "En Almería el lunes 29 de marzo también es no lectivo.",
      label: "del 22 al 28 de marzo (en Almería, hasta el lunes 29)",
      labelShort: "22-28 mar (Almería, 22-29)",
    },
    otherBreaks: [],
    hubOther: "Málaga: Semana Blanca, 22-26 feb",
    nonTeaching: [],
    localDays:
      "No hay clase en las fiestas locales de cada municipio (dos como máximo). Cuántos días más puede fijar cada localidad, quién los propone (ayuntamiento, Consejo Escolar Municipal o consejo escolar del centro) y hasta cuándo lo dice la resolución de cada provincia: está en la tabla por provincias.",
    notes: [
      "En todas las provincias leídas el curso tiene 178 días lectivos en Infantil y Primaria y 175 en ESO, Bachillerato y FP.",
      "El 26 de febrero de 2027, Día de la Comunidad Educativa, no hay clase en Almería, Córdoba, Granada, Huelva, Málaga y Sevilla; Cádiz lo pasa al 30 de abril.",
      "Las resoluciones provinciales no se publican en el BOJA: están en la web de la Consejería, en la página de cada Delegación Territorial.",
    ],
    provincesNote:
      "Todas empiezan el 10 de septiembre y tienen la Semana Santa del 22 al 28 de marzo, pero la Navidad y el último día cambian de una provincia a otra.",
    pendingProvinces: ["Jaén"],
    provinces: [
      {
        name: "Almería",
        order: {
          short: "Resolución de la Delegación Territorial en Almería",
          title: "Resolución de la Delegación Territorial de Desarrollo Educativo y Formación Profesional y de Universidad, Investigación e Innovación en Almería, por la que se aprueba el calendario escolar en los centros docentes no universitarios, a excepción de los de primer ciclo de educación infantil, de esta provincia para el curso académico 2026-2027",
          issuer: "Delegación Territorial en Almería",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-28",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1183913/3343033/Resoluci%C3%B3n_calendario_escolar_26_27_Almer%C3%ADa%28F%29.pdf/fb0a8b29-7d79-13a6-dd6d-caf9340047ef?t=1780046260347",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-22" }],
        christmas: { from: "2026-12-23", to: "2027-01-06", note: "vacaciones del 24 de diciembre al 6 de enero y el 23 de diciembre no lectivo" },
        easter: { from: "2027-03-22", to: "2027-03-29", note: "vacaciones del 21 al 28 de marzo y el 29 de marzo no lectivo" },
        nonTeaching: [
          { date: "2026-10-09", reason: "día no lectivo provincial" },
          { date: "2026-10-30", reason: "día no lectivo provincial" },
          { date: "2027-02-26", reason: "Día de la Comunidad Educativa" },
          { date: "2027-04-30", reason: "día no lectivo provincial" },
        ],
        localDays:
          "Si las fiestas locales caen en día lectivo, los consejos escolares piden a la Delegación cambiarlas por alguno de los días no lectivos provinciales (9 y 30 de octubre, 23 de diciembre, 26 de febrero, 29 de marzo, 30 de abril), antes del 1 de febrero de 2027.",
      },
      {
        name: "Cádiz",
        order: {
          short: "Resolución de la Delegación Territorial en Cádiz",
          title: "Resolución de la Delegación Territorial de Desarrollo Educativo y Formación Profesional y de Universidad, Investigación e Innovación en Cádiz, por la que se aprueba el calendario y la jornada escolar en los centros docentes, a excepción de los universitarios, para el curso académico 2026/2027",
          issuer: "Delegación Territorial en Cádiz",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-29",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1197071/0/Resoluci%C3%B3n%20calendario%20escolar%202026_2027.pdf/5c97e0d2-d79a-e80a-9433-d3f1e305f8fd?version=1.0",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-23" }],
        christmas: { from: "2026-12-23", to: "2027-01-08" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        nonTeaching: [{ date: "2027-04-30", reason: "Día de la Comunidad Educativa" }],
        localDays:
          "Cada ayuntamiento puede pedir a la Delegación, tras consultar al Consejo Escolar Municipal, hasta tres días no lectivos si sus fiestas locales no caen en periodo lectivo (plazo: 30 de septiembre de 2026).",
      },
      {
        name: "Córdoba",
        order: {
          short: "Resolución de la Delegación Territorial en Córdoba",
          title: "Resolución de la Delegación Territorial de Desarrollo Educativo y Formación Profesional y de Universidad, Investigación e Innovación en Córdoba, por la que se aprueban el calendario y la jornada escolar en los centros docentes no universitarios para el curso académico 2026/2027",
          issuer: "Delegación Territorial en Córdoba",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-21",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1197067/4486666/Resoluci%C3%B3n%20Calendario%20Escolar%202026_2027(F).pdf/92aee8f6-6e23-e2c8-0f0e-a118ecf2e271",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-22" }],
        christmas: { from: "2026-12-23", to: "2027-01-07", note: "vacaciones del 23 de diciembre al 6 de enero y el 7 de enero no lectivo provincial" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        nonTeaching: [{ date: "2027-02-26", reason: "Día de la Comunidad Educativa" }],
        localDays:
          "Cada ayuntamiento puede pedir a la Delegación, tras consultar al Consejo Escolar Municipal, hasta tres días no lectivos si sus fiestas locales no caen en periodo lectivo.",
      },
      {
        name: "Granada",
        order: {
          short: "Resolución de 27 de mayo de 2026 de la Delegación Territorial en Granada",
          title: "Resolución de 27 de mayo de 2026 de la Delegación Territorial de la Consejería de Desarrollo Educativo y Formación Profesional en Granada por la que se dictan las normas que han de regir el calendario escolar para el curso escolar 2026/2027",
          issuer: "Delegación Territorial en Granada",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-27",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1197087/4286700/Resoluci%C3%B3n%2027%20mayo%202026%20calendario%20escolar%20curso%202026-2027%20Granada%20-%20con%20anexos.pdf/f7a1efc3-e16c-b891-4179-8c29ab1288cf",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-22" }],
        christmas: { from: "2026-12-23", to: "2027-01-06" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        nonTeaching: [
          { date: "2027-02-26", reason: "Día de la Comunidad Educativa" },
          { date: "2027-05-28", reason: "día no lectivo provincial" },
        ],
        localDays:
          "Además de las fiestas locales, los consejos escolares municipales pueden fijar hasta tres días no lectivos: tres si ninguna fiesta local cae en periodo lectivo, dos si cae una y uno si caen las dos.",
      },
      {
        name: "Huelva",
        order: {
          short: "Resolución de 29 de mayo de 2026 de la Delegación Territorial en Huelva",
          title: "Resolución de 29 de mayo de 2026 de la Delegación Territorial en Huelva, por la que se aprueba el calendario escolar en los centros docentes no universitarios para el curso académico 2026/2027",
          issuer: "Delegación Territorial en Huelva",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-29",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1197074/4609198/Resoluci%C3%B3n%20calendario%20Huelva%2026-27.pdf/4338f98f-b951-7f3a-7921-052dcc0a1ffb",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-22" }],
        christmas: { from: "2026-12-23", to: "2027-01-07" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        nonTeaching: [{ date: "2027-02-26", reason: "Día de la Comunidad Educativa" }],
        localDays:
          "Los consejos escolares municipales fijan los días vacacionales locales: cinco, que incluyen las dos fiestas locales si caen en periodo lectivo.",
      },
      {
        name: "Málaga",
        order: {
          short: "Resolución de 20 de mayo de 2026 de la Delegación Territorial en Málaga",
          title: "Resolución de 20 de mayo de 2026 de la Delegación Territorial de la Consejería de Desarrollo Educativo y Formación Profesional en Málaga por la que se dictan las normas que han de regir el calendario escolar para el curso escolar 2026/2027",
          issuer: "Delegación Territorial en Málaga",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-20",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/2854624/4501041/RESOLUCION%20CALENDARIO%20ESCOLAR%202026_27%20MALAGA.pdf/6f0af8f4-b17b-3b67-2797-e53eb85376e9",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-24" }],
        christmas: { from: "2026-12-23", to: "2027-01-06" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        otherBreaks: [{ name: "Semana Blanca", from: "2027-02-22", to: "2027-02-26", note: "con el lunes 1 de marzo, festivo, se vuelve el martes 2" }],
        localDays:
          "La resolución fija los días según dónde caigan las fiestas locales: si ninguna cae en periodo lectivo, no hay clase el 29 de marzo y el 3 de mayo; si cae una, esa fiesta y el 3 de mayo; si caen las dos, solo ellas.",
      },
      {
        name: "Sevilla",
        order: {
          short: "Resolución de la Delegación Territorial en Sevilla",
          title: "Resolución del Delegado Territorial de Desarrollo Educativo y Formación Profesional y de Universidad, Investigación e Innovación en Sevilla, por la que se aprueba el calendario y la jornada escolar en los centros docentes no universitarios para el curso académico 2026/2027",
          issuer: "Delegación Territorial en Sevilla",
          bulletin: ANDALUCIA_PORTAL,
          number: null,
          date: "2026-05-28",
          url: "https://www.juntadeandalucia.es/educacion/portales/documents/1176698/3340178/RESOL%20CALEND%2026_27(F).pdf/8c2fd440-3e04-a1c5-d497-2170af36e265?version=1.0",
        },
        levels: [{ levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-10", end: "2027-06-23" }],
        christmas: { from: "2026-12-24", to: "2027-01-08", note: "vacaciones del 24 de diciembre al 7 de enero y el 8 de enero no lectivo provincial" },
        easter: { from: "2027-03-22", to: "2027-03-28" },
        nonTeaching: [{ date: "2027-02-26", reason: "Día de la Comunidad Educativa" }],
        localDays:
          "Los consejos escolares municipales acuerdan hasta dos días de libre disposición y los proponen a la Delegación antes del 15 de octubre de 2026.",
      },
    ],
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------------------ Aragón */
  {
    boe: "AR",
    order: {
      short: "Resolución de 29 de abril de 2025",
      title:
        "Resolución de 29 de abril de 2025, del Director General de Planificación, Centros y Formación Profesional, por la que se aprueban los calendarios escolares de los cursos 2025-2026 y 2026-2027 correspondientes a las enseñanzas de niveles no universitarios de la Comunidad Autónoma de Aragón",
      issuer: "Dirección General de Planificación, Centros y Formación Profesional del Departamento de Educación",
      bulletin: "BOA",
      number: "88",
      date: "2025-05-12",
      url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1392479120808",
      departmentUrl: "https://educa.aragon.es/calendario-escolar",
    },
    levels: [
      { levels: "Infantil, Primaria, Educación Especial y ESO", start: "2026-09-08", end: "2027-06-18" },
      { levels: "Bachillerato", start: "2026-09-09", end: "2027-06-18" },
      { levels: "Formación Profesional presencial", start: "2026-09-10", end: "2027-06-18" },
      { levels: "Educación de Personas Adultas", start: "2026-09-14", end: "2027-06-18" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-10-01", end: "2027-06-18" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-06",
      note: "La resolución las cuenta desde el final de las clases de la mañana del martes 22 de diciembre: ese día solo hay clase por la mañana.",
    },
    easter: { from: "2027-03-25", to: "2027-04-02" },
    otherBreaks: [],
    hubOther: "Por provincias: Huesca y Teruel 18-19 feb; Zaragoza 13-14 oct",
    nonTeaching: [
      { date: "2026-10-13", reason: "vacaciones provinciales", levels: "en la provincia de Zaragoza", partial: true },
      { date: "2026-10-14", reason: "vacaciones provinciales", levels: "en la provincia de Zaragoza", partial: true },
      { date: "2027-02-18", reason: "vacaciones provinciales", levels: "en las provincias de Huesca y Teruel", partial: true },
      { date: "2027-02-19", reason: "vacaciones provinciales", levels: "en las provincias de Huesca y Teruel", partial: true },
      { date: "2027-04-26", reason: "vacaciones provinciales", levels: "en la provincia de Teruel", partial: true },
      { date: "2027-05-03", reason: "vacaciones provinciales", levels: "en las provincias de Huesca y Zaragoza", partial: true },
    ],
    localDays:
      "Además de los días de cada provincia, no hay clase en las dos fiestas locales del calendario laboral de cada localidad. El ayuntamiento comunica sus fechas al Servicio Provincial antes del 1 de septiembre; si alguna cae en día no lectivo, señala (oído el Consejo Escolar Municipal o, si no lo hay, los consejos escolares de los centros) el día lectivo que la sustituye. También puede cambiar los días provinciales por otros para ampliar sus fiestas.",
    notes: [
      "Una sola resolución aprueba los calendarios de 2025-2026 y 2026-2027. El curso 2026-2027 tiene 176 días lectivos en Infantil, Primaria, Educación Especial y ESO.",
      "Del martes 8 al martes 15 de septiembre de 2026 y todos los días lectivos de junio de 2027, los colegios de Infantil, Primaria y Educación Especial sostenidos con fondos públicos tienen jornada continuada reducida de mañana.",
      "El Día de la Educación en Aragón es el miércoles 24 de marzo de 2027, y es lectivo.",
    ],
    schoolDays: 176,
    verifiedAt: "2026-11-06",
  },

  /* ---------------------------------------------------------------- Asturias */
  {
    boe: "AS",
    order: {
      short: "Resolución de 13 de mayo de 2026",
      title:
        "Resolución de 13 de mayo de 2026, de la Consejería de Educación, por la que se aprueba el calendario escolar para el curso 2026-2027 y las instrucciones necesarias para su aplicación",
      issuer: "Consejería de Educación",
      bulletin: "BOPA",
      number: "103",
      date: "2026-06-01",
      url: "https://www.asturias.es/bopa/2026/06/01/2026-04361.pdf",
      departmentUrl: "https://www.educastur.es/-/calendario-escolar-2026-2027",
    },
    levels: [
      { levels: "Infantil (3 a 6 años), Primaria, Educación Especial, ESO y Bachillerato", start: "2026-09-09", end: "2027-06-23" },
      { levels: "Formación Profesional", start: "2026-09-14", end: "2027-06-18" },
      { levels: "Educación de Personas Adultas", start: "2026-10-05", end: "2027-06-18" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-10-05", end: "2027-05-27" },
      { levels: "Escuelas de Educación Infantil (0 a 3 años)", start: "2026-09-09", end: "2027-07-26" },
    ],
    christmas: { from: "2026-12-23", to: "2027-01-10" },
    easter: { from: "2027-03-22", to: "2027-03-28" },
    otherBreaks: [
      { name: "Carnaval", from: "2027-02-08", to: "2027-02-09" },
      { name: "Puente de mayo", from: "2027-04-30", to: "2027-05-03" },
    ],
    nonTeaching: [
      { date: "2026-10-30", reason: "día no lectivo" },
      { date: "2026-11-03", reason: "día no lectivo" },
      { date: "2026-11-04", reason: "día no lectivo" },
    ],
    localDays:
      "Los dos festivos locales del calendario laboral de cada municipio son no lectivos. Si alguno cae en un día que ya no tiene clase, los consejos escolares de los centros de la localidad (o el Consejo Escolar Municipal, si existe) fijan de común acuerdo el día que lo sustituye, que no puede estar pegado a unas vacaciones o a otro día no lectivo.",
    notes: [
      "Con la aprobación del consejo escolar, los centros de Infantil, Primaria y Educación Especial pueden tener jornada reducida en septiembre y junio, de al menos cuatro horas lectivas. Los de jornada partida pueden hacer jornada continua el día anterior a cada periodo de vacaciones.",
      "Las escuelas de Educación Infantil de 0 a 3 años tienen sus propios días no lectivos (anexo II de la resolución).",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ---------------------------------------------------------------- Canarias */
  {
    boe: "CN",
    order: {
      short: "Resolución n.º 196/2026, de 17 de marzo",
      title:
        "Resolución de 17 de marzo de 2026, por la que se establece el calendario escolar y se dictan instrucciones para la organización y desarrollo de las actividades de comienzo y finalización del curso 2026-2027, para los centros de enseñanzas no universitarias de la Comunidad Autónoma de Canarias",
      issuer: "Consejería de Educación, Formación Profesional, Actividad Física y Deportes",
      bulletin: "BOC",
      number: "61",
      date: "2026-03-30",
      url: "https://sede.gobiernodecanarias.org/boc/boc-a-2026-061-1025.pdf",
      departmentUrl: "https://www.gobiernodecanarias.org/educacion/web/centros/calendario_escolar/",
    },
    levels: [
      { levels: "Infantil y Primaria", start: "2026-09-09", end: "2027-06-22" },
      { levels: "ESO", start: "2026-09-10", end: "2027-06-22" },
      { levels: "1.º de Bachillerato", start: "2026-09-11", end: "2027-06-18" },
      { levels: "2.º de Bachillerato", start: "2026-09-11", end: "2027-05-14" },
      { levels: "Formación Profesional (grado básico, medio y superior)", start: "2026-09-16", end: "2027-06-22", note: "2.º de grado superior termina el 27 de mayo" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-21", end: "2027-05-27" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-08",
      note: "Son las fechas corregidas por la Resolución de 10 de abril de 2026 (BOC núm. 75): el texto original decía del 22 de diciembre al 7 de enero.",
    },
    easter: { from: "2027-03-22", to: "2027-03-26" },
    otherBreaks: [],
    nonTeaching: [
      { date: "2026-12-07", reason: "Día del Enseñante y del Estudiante" },
      { date: "2026-09-15", reason: "fiesta insular", levels: "en Lanzarote y La Graciosa", partial: true },
      { date: "2026-09-18", reason: "fiesta insular", levels: "en Fuerteventura", partial: true },
      { date: "2026-09-24", reason: "fiesta insular", levels: "en El Hierro", partial: true },
      { date: "2026-10-05", reason: "fiesta insular", levels: "en La Gomera", partial: true },
      { date: "2027-02-02", reason: "fiesta insular de la Candelaria", levels: "en Tenerife", partial: true },
    ],
    localDays:
      "Además de los festivos (también los insulares de cada isla y los locales de cada municipio), el consejo escolar de cada centro, oído el Consejo Escolar Municipal donde lo haya, puede fijar hasta cuatro días no lectivos de libre disposición, sin dejar un solo día lectivo suelto en una semana. Las fechas se comunican antes del 31 de octubre de 2026, y los centros que comparten transporte o comedor deben acordar un calendario común.",
    notes: [
      "En Infantil (2.º ciclo), Primaria y Educación Especial hay jornada intensiva desde el inicio de las clases hasta el 11 de septiembre y a partir del 14 de junio.",
      "Si el día de inicio de una enseñanza es festivo en el municipio o la isla, las clases empiezan el siguiente día lectivo.",
      "La fiesta insular de Tenerife de 2027 (2 de febrero, Candelaria) sale del calendario de fiestas laborales de Canarias para 2027 (Decreto 115/2026), al que remite la resolución.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* --------------------------------------------------------------- Cantabria */
  {
    boe: "CB",
    order: {
      short: "Orden EDU/10/2026, de 24 de marzo",
      title: "Orden EDU/10/2026, de 24 de marzo, por la que se establece el calendario escolar para el curso 2026-2027 para centros docentes no universitarios",
      issuer: "Consejería de Educación, Formación Profesional y Universidades",
      bulletin: "BOC",
      number: "75",
      date: "2026-04-21",
      url: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=434226",
    },
    levels: [
      { levels: "Infantil, Primaria y Educación Especial", start: "2026-09-08", end: "2027-06-23" },
      { levels: "ESO, Bachillerato y Formación Profesional", start: "2026-09-09", end: "2027-06-24" },
      { levels: "Artes Plásticas y Diseño y Personas Adultas", start: "2026-09-16", end: "2027-06-24" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-10-05", end: "2027-05-31" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-08",
      note: "La orden no da un periodo sino la lista de días: 23, 24, 28, 29, 30 y 31 de diciembre y 4, 5, 7 y 8 de enero, además de los festivos.",
    },
    easter: {
      from: "2027-03-22",
      to: "2027-03-26",
      note: "La orden declara no lectivos el 22, 23 y 24 de marzo, y el 25 y el 26 si no son festivos.",
    },
    otherBreaks: [
      { name: "Vacaciones de otoño", from: "2026-11-02", to: "2026-11-06" },
      { name: "Vacaciones de invierno", from: "2027-02-10", to: "2027-02-12" },
      { name: "Vacaciones de primavera", from: "2027-05-03", to: "2027-05-04" },
    ],
    nonTeaching: [],
    localDays:
      "No hay días de libre disposición. Las fiestas locales no tienen clase, pero cuando un día lectivo es festivo (local, autonómico o nacional) el curso de Infantil, Primaria, ESO y Bachillerato termina los días necesarios más tarde para llegar al mínimo de días lectivos: el centro comunica la nueva fecha de fin a la inspección y a las familias.",
    notes: [
      "175 días lectivos en Infantil, Primaria, Educación Especial y Secundaria.",
      "En septiembre de 2026 y junio de 2027, Infantil, Primaria y Educación Especial tienen cuatro horas de clase al día; en los centros públicos la Consejería garantiza la atención del alumnado que se quede la hora siguiente, y el comedor y el transporte se adaptan.",
    ],
    schoolDays: 175,
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------ Castilla-La Mancha */
  {
    boe: "CM",
    order: {
      short: "Orden 79/2026, de 26 de mayo",
      title:
        "Orden 79/2026, de 26 de mayo, de la Consejería de Educación, Cultura y Deportes, por la que se establece el calendario escolar para el curso 2026/2027, y los criterios y el procedimiento para la elaboración de los calendarios escolares provinciales en enseñanzas no universitarias de la comunidad de Castilla-La Mancha",
      issuer: "Consejería de Educación, Cultura y Deportes",
      bulletin: "DOCM",
      number: "104",
      date: "2026-06-03",
      url: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2026/06/03/pdf/2026_4106.pdf&tipo=rutaDocm",
      departmentUrl: "https://educacion.castillalamancha.es/calendario-escolar",
    },
    levels: [
      { levels: "Infantil (2.º ciclo), Primaria, Educación Especial y ESO", start: "2026-09-08", end: "2027-06-22" },
      { levels: "Bachillerato (salvo 2.º), FP de Grado Básico, Medio y Superior", start: "2026-09-08", end: "2027-06-22" },
      { levels: "2.º de Bachillerato", start: "2026-09-08", end: null, note: "termina según las fechas de la prueba de acceso a la universidad" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-23", end: "2027-06-22" },
      { levels: "Escuelas infantiles autonómicas (primer ciclo)", start: "2026-09-08", end: "2027-07-23" },
    ],
    christmas: { from: "2026-12-23", to: "2027-01-08" },
    easter: { from: "2027-03-22", to: "2027-03-29" },
    otherBreaks: [
      {
        name: "Días de libre disposición (Carnaval)",
        from: "2027-02-08",
        to: "2027-02-09",
        note: "los ayuntamientos pueden trasladarlos; no se aplican en las escuelas infantiles autonómicas",
      },
    ],
    nonTeaching: [
      { date: "2026-11-20", reason: "Día de la Enseñanza" },
      { date: "2026-12-07", reason: "día no lectivo" },
      { date: "2027-05-28", reason: "día no lectivo" },
    ],
    localDays:
      "No hay clase en las dos fiestas locales de cada ayuntamiento, publicadas en el Boletín Oficial de la Provincia. Si una cae en un periodo sin clase, el ayuntamiento puede pedir a la Delegación Provincial, antes del 30 de noviembre de 2026 y con informe favorable del Consejo Escolar de Localidad, que se declaren no lectivas otras fechas; también puede trasladar los dos días de libre disposición del 8 y 9 de febrero.",
    notes: [
      "Los centros de Infantil, Primaria y Educación Especial pueden hacer jornada única en septiembre y junio.",
      "Los días de libre disposición del 8 y 9 de febrero se mantienen siempre que se cumpla el mínimo de 175 días lectivos.",
    ],
    provinces: [
      {
        name: "Albacete",
        order: {
          short: "Resolución de 19 de junio de 2026",
          title: "Resolución de 19 de junio de 2026, de la Delegación Provincial de Educación, Cultura y Deportes de Albacete, calendario escolar provincial 2026-2027",
          issuer: "Delegación Provincial de Albacete",
          bulletin: "web de la Consejería",
          number: null,
          date: "2026-06-19",
          url: "https://educacion.castillalamancha.es/sites/default/files/2026-06/ALBACETE%20-%20RESOLUCION%20CALENDARIO%20ESCOLAR%20PROVINCIAL%202026-2027%20ALBACETE.pdf",
        },
      },
      {
        name: "Ciudad Real",
        order: {
          short: "Resolución de 25 de junio de 2026",
          title: "Resolución de 25 de junio de 2026, de la Delegación Provincial de Ciudad Real, calendario escolar provincial 2026-2027",
          issuer: "Delegación Provincial de Ciudad Real",
          bulletin: "web de la Consejería",
          number: null,
          date: "2026-06-25",
          url: "https://educacion.castillalamancha.es/sites/default/files/2026-06/RESOLUCI%C3%93N%20CALENDARIO%20ESCOLAR%20PROVINCIAL%20CIUDAD%20REAL%2026-27.pdf",
        },
      },
      {
        name: "Cuenca",
        order: {
          short: "Resolución de 24 de junio de 2026",
          title: "Resolución de 24 de junio de 2026, de la Delegación Provincial de Cuenca, calendario escolar provincial 2026-2027",
          issuer: "Delegación Provincial de Cuenca",
          bulletin: "web de la Consejería",
          number: null,
          date: "2026-06-24",
          url: "https://educacion.castillalamancha.es/sites/default/files/2026-06/CUENCA%20-%20RESOLUCION%20CALENDARIO%20ESCOLAR%20PROVINCIAL%202026-2027%20CUENCA.pdf",
        },
      },
      {
        name: "Guadalajara",
        order: {
          short: "Resolución de 11 de junio de 2026",
          title: "Resolución de 11 de junio de 2026, de la Delegación Provincial de Guadalajara, calendario escolar provincial 2026-2027",
          issuer: "Delegación Provincial de Guadalajara",
          bulletin: "web de la Consejería",
          number: null,
          date: "2026-06-11",
          url: "https://educacion.castillalamancha.es/sites/default/files/2026-06/GUADALAJARA%20-%20RESOLUCION%20CALENDARIO%20ESCOLAR%20PROVINCIAL%202026-2027%20GUADALAJARA.pdf",
        },
      },
      {
        name: "Toledo",
        order: {
          short: "Resolución de 24 de junio de 2026",
          title: "Resolución de 24 de junio de 2026, de la Delegación Provincial de Toledo, calendario escolar provincial 2026-2027",
          issuer: "Delegación Provincial de Toledo",
          bulletin: "web de la Consejería",
          number: null,
          date: "2026-06-24",
          url: "https://educacion.castillalamancha.es/sites/default/files/2026-06/TOLEDO%20-%20RESOLUCION%20CALENDARIO%20ESCOLAR%20PROVINCIAL%202026-2027%20TOLEDO.pdf",
        },
      },
    ],
    provincesNote:
      "Las cinco resoluciones provinciales repiten las fechas de la Orden 79/2026 (inicio, Navidad, Semana Santa, días no lectivos y fin de curso); lo que cambia de una provincia a otra es cómo se fijan los días locales. En Ciudad Real, Cuenca y Toledo, si un ayuntamiento no propone a tiempo sus días, pasan a ser el 21 y/o el 22 de junio.",
    verifiedAt: "2026-11-06",
  },

  /* --------------------------------------------------------- Castilla y León */
  {
    boe: "CL",
    order: {
      short: "Orden EDU/478/2026, de 25 de mayo",
      title:
        "Orden EDU/478/2026, de 25 de mayo, por la que se aprueba el calendario escolar para el curso académico 2026-2027 en los centros docentes que impartan enseñanzas no universitarias en la Comunidad de Castilla y León",
      issuer: "Consejería de Educación",
      bulletin: "BOCYL",
      number: "101",
      date: "2026-05-28",
      url: "https://bocyl.jcyl.es/boletines/2026/05/28/pdf/BOCYL-D-28052026-101-28.pdf",
      departmentUrl: "https://www.educa.jcyl.es/es/calendario-escolar-e1c54",
    },
    levels: [
      { levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-09", end: "2027-06-24" },
      { levels: "ESO", start: "2026-09-15", end: "2027-06-24", note: "el alumnado de ESO escolarizado en colegios de Primaria empieza el 9 de septiembre" },
      { levels: "1.º de Bachillerato", start: "2026-09-15", end: "2027-06-17" },
      { levels: "2.º de Bachillerato", start: "2026-09-15", end: "2027-05-21" },
      { levels: "Formación Profesional presencial", start: "2026-09-15", end: "2027-06-17", note: "2.º de Grado Superior empieza el 9 de septiembre" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-10-05", end: "2027-05-28" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-10",
      note: "La orden fija el último día de clase, el martes 22 de diciembre, y la vuelta, el lunes 11 de enero.",
    },
    easter: {
      from: "2027-03-20",
      to: "2027-03-30",
      note: "La orden fija el último día de clase, el viernes 19 de marzo, y la vuelta, el miércoles 31 de marzo.",
    },
    otherBreaks: [{ name: "Carnaval", from: "2027-02-08", to: "2027-02-09" }],
    nonTeaching: [{ date: "2026-10-30", reason: "Día del Docente" }],
    localDays:
      "Son festivos los dos días de fiesta local de cada municipio, publicados en el boletín oficial de la provincia, si caen dentro del curso. La orden no da días de libre elección; las peticiones de cambio de calendario de los centros las resuelven las direcciones provinciales de educación.",
    notes: [
      "En septiembre de 2026 y junio de 2027, los centros de Infantil (2.º ciclo), Primaria y Educación Especial tienen jornada continua de cuatro horas por la mañana.",
      "2.º de Bachillerato termina las clases el 21 de mayo de 2027; sus pruebas extraordinarias son entre el 16 y el 22 de junio.",
      "El primer ciclo de Infantil (0 a 3 años) no lo regula esta orden.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------------------- Ceuta */
  {
    boe: "CE",
    order: {
      short: "Calendario escolar 2026-2027 de la Dirección Provincial de Ceuta",
      title: "Calendario escolar 2026-2027 de la Dirección Provincial de Ceuta (Ministerio de Educación, Formación Profesional y Deportes)",
      issuer: "Dirección Provincial de Ceuta del Ministerio de Educación, Formación Profesional y Deportes",
      bulletin: "web del Ministerio de Educación",
      number: null,
      date: null,
      url: "https://www.educacionfpydeportes.gob.es/dam/jcr:a9cf685a-32f4-480f-8878-c06cae54fc37/26-158-01-calendario-escolar-26-27-v1-01.pdf",
      departmentUrl: "https://www.educacionfpydeportes.gob.es/contenidos/ba/ceuta-melilla/ceuta/portada.html",
    },
    levels: [
      { levels: "Infantil, Primaria, Educación Especial, ESO y Bachillerato", start: "2026-09-08", end: "2027-06-23" },
      { levels: "Formación Profesional, Escuela Oficial de Idiomas y Artes Plásticas", start: "2026-09-10", end: "2027-06-23" },
      { levels: "Educación de Personas Adultas", start: "2026-09-23", end: "2027-06-23" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-08",
      note: "El calendario marca vacaciones de Navidad del 23 de diciembre al 7 de enero, y el 8 de enero como día de libre disposición.",
    },
    easter: {
      from: "2027-03-22",
      to: "2027-04-02",
      note: "El calendario marca Semana Santa del 22 al 26 de marzo, y del 29 de marzo al 2 de abril como días de libre disposición.",
    },
    otherBreaks: [],
    nonTeaching: [
      { date: "2026-11-02", reason: "día de libre disposición" },
      { date: "2026-11-03", reason: "día de libre disposición" },
      { date: "2026-12-07", reason: "día de libre disposición" },
      { date: "2027-02-12", reason: "día de libre disposición" },
      { date: "2027-03-09", reason: "día de fiesta en el calendario escolar" },
      { date: "2027-05-18", reason: "día de libre disposición" },
    ],
    localDays:
      "En Ceuta no hay días que elija cada centro: el calendario de la Dirección Provincial fija para todos los mismos días de libre disposición (2 y 3 de noviembre, 7 de diciembre, 8 de enero, 12 de febrero, del 29 de marzo al 2 de abril y 18 de mayo). Una vez aprobado, solo puede cambiarse con autorización expresa de la Dirección Provincial.",
    notes: [
      "La fuente es el calendario gráfico que publica la Dirección Provincial en la web del Ministerio; no hay una resolución en un boletín.",
      "Las actividades académicas terminan el 30 de junio de 2027.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------ Comunitat Valenciana */
  {
    boe: "VC",
    order: {
      short: "Resolución de 15 de junio de 2026",
      title: "Resolución de 15 de junio de 2026, de la Dirección General de Centros Docentes, por la que se fija el calendario escolar del curso académico 2026-2027 en la Comunitat Valenciana",
      issuer: "Dirección General de Centros Docentes de la Conselleria de Educación, Cultura y Universidades",
      bulletin: "DOGV",
      number: "10387",
      date: "2026-06-18",
      url: "https://dogv.gva.es/datos/2026/06/18/pdf/2026_20810_es.pdf",
      departmentUrl: "https://ceice.gva.es/es/web/centros-docentes/calendario-escolar",
    },
    levels: [
      { levels: "Infantil y Primaria", start: "2026-09-09", end: "2027-06-18" },
      { levels: "ESO y Bachillerato", start: "2026-09-09", end: "2027-06-18", note: "en 2.º de Bachillerato la evaluación se programa según la prueba de acceso a la universidad" },
      { levels: "Formación Profesional", start: "2026-09-09", end: "2027-06-18" },
      { levels: "Formación de Personas Adultas", start: "2026-09-14", end: "2027-06-11" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-28", end: "2027-06-18" },
    ],
    christmas: { from: "2026-12-22", to: "2027-01-06" },
    easter: { from: "2027-03-25", to: "2027-04-05", note: "La resolución las llama vacaciones de Pascua." },
    otherBreaks: [],
    nonTeaching: [],
    localDays:
      "Cada ayuntamiento, con el acuerdo previo de su consejo escolar municipal, puede proponer hasta tres días no lectivos de carácter local (Fallas, fiestas patronales...). Por eso el calendario real cambia de un municipio a otro: para el tuyo, pregunta en el ayuntamiento o en el centro.",
    notes: ["La resolución no fija vacaciones de Carnaval ni otros días no lectivos para toda la Comunitat aparte de los festivos."],
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------------- Extremadura */
  {
    boe: "EX",
    order: {
      short: "Resolución de 15 de junio de 2026",
      title: "Resolución de 15 de junio de 2026, de la Secretaría General de Educación, por la que se aprueba el calendario escolar para el curso 2026/2027",
      issuer: "Secretaría General de Educación de la Consejería de Educación y Formación Profesional",
      bulletin: "DOE",
      number: "116",
      date: "2026-06-18",
      url: "https://doe.juntaex.es/pdfs/doe/2026/1160o/26061567.pdf",
    },
    levels: [
      { levels: "Infantil (2.º ciclo), Primaria, Educación Especial y ESO", start: "2026-09-10", end: "2027-06-18" },
      { levels: "1.º de Bachillerato", start: "2026-09-11", end: "2027-06-17" },
      { levels: "2.º de Bachillerato", start: "2026-09-11", end: "2027-05-07" },
      { levels: "FP de Grado Medio y Superior", start: "2026-09-10", end: "2027-06-04" },
      { levels: "FP de Grado Básico", start: "2026-09-10", end: "2027-06-18" },
      { levels: "Primer ciclo de Infantil (centros de la Consejería)", start: "2026-09-10", end: "2027-07-23" },
    ],
    christmas: { from: "2026-12-23", to: "2027-01-07" },
    easter: { from: "2027-03-22", to: "2027-03-29" },
    otherBreaks: [{ name: "Carnavales", from: "2027-02-08", to: "2027-02-09" }],
    nonTeaching: [
      { date: "2026-11-23", reason: "Santa Cecilia", levels: "en los conservatorios oficiales de música", partial: true },
      { date: "2027-01-29", reason: "Día del Docente", levels: "en todas las enseñanzas salvo los conservatorios" },
    ],
    localDays:
      "No hay clase en las fiestas locales que fija cada ayuntamiento. Si una o las dos caen en días sin clase, los consejos escolares de los centros de la localidad (o el Consejo Escolar Municipal, si existe) pueden fijar de común acuerdo días lectivos que las sustituyan, que no pueden estar pegados al principio o al final del curso, y deben comunicarlos a la Delegación Provincial antes del 30 de septiembre (primer trimestre) o del 31 de enero (resto del curso).",
    notes: [
      "El primer ciclo de Infantil tiene calendario propio: además, no son lectivos el 28, 29 y 30 de diciembre, el 4 y 5 de enero y el 22, 23 y 24 de marzo.",
      "Cada centro celebra un Día del Centro, que es lectivo.",
      "Con aviso amarillo por calor los centros pueden reducir la jornada; con aviso naranja o rojo, la Secretaría General de Educación puede flexibilizar o suspender las clases.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ----------------------------------------------------------------- Galicia */
  {
    boe: "GA",
    order: {
      short: "Orden de 4 de junio de 2026",
      title: "Orden de 4 de junio de 2026 por la que se aprueba el calendario escolar para el curso 2026/27 en los centros docentes sostenidos con fondos públicos en la Comunidad Autónoma de Galicia",
      issuer: "Consellería de Educación, Ciencia, Universidades y Formación Profesional",
      bulletin: "DOG",
      number: "110",
      date: "2026-06-15",
      url: "https://www.xunta.gal/dog/Publicados/2026/20260615/AnuncioG0761-050626-0001_es.html",
    },
    levels: [
      { levels: "Infantil, Primaria, ESO, Bachillerato y 1.º de FP", start: "2026-09-09", end: "2027-06-21" },
      { levels: "2.º de FP (Grado Básico, Medio y Superior)", start: "2026-09-09", end: "2027-06-15" },
      { levels: "2.º de Bachillerato", start: "2026-09-09", end: null, note: "termina según las fechas de la PAU" },
    ],
    christmas: { from: "2026-12-22", to: "2027-01-07" },
    easter: { from: "2027-03-22", to: "2027-03-29" },
    otherBreaks: [{ name: "Entroido (Carnaval)", from: "2027-02-08", to: "2027-02-10" }],
    nonTeaching: [{ date: "2026-12-07", reason: "Día de la Enseñanza" }],
    localDays:
      "Las dos fiestas laborales locales son días no lectivos. Si una o las dos no caen en día lectivo, el consejo escolar del centro puede pedir a la dirección territorial, antes del 16 de octubre de 2026, uno o dos días no lectivos que las sustituyan; la orden recomienda que los centros de una misma localidad elijan los mismos.",
    notes: [
      "En Infantil, la incorporación gradual del primer curso no puede alargarse más allá del 15 de septiembre de 2026.",
      "Los comedores escolares de los centros públicos funcionan del 9 de septiembre de 2026 al 21 de junio de 2027.",
      "Los centros que tenían jornada matinal en junio y septiembre en 2025/26 la mantienen.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ----------------------------------------------------------- Illes Balears */
  {
    boe: "IB",
    order: {
      short: "Resolución de 27 de marzo de 2026",
      title:
        "Resolución del consejero de Educación y Universidades por la que se establece el calendario escolar del curso 2026-2027 para los centros docentes no universitarios de la comunidad autónoma de las Illes Balears",
      issuer: "Consejería de Educación y Universidades",
      bulletin: "BOIB",
      number: "41",
      date: "2026-03-31",
      url: "https://www.caib.es/eboibfront/pdf/es/2026/41/1216209",
      departmentUrl: "https://www.caib.es/sites/planificacioicentres/es/calendari_escolar_2023-2024/",
    },
    levels: [
      { levels: "Infantil, Primaria, Educación Especial, ESO y Bachillerato", start: "2026-09-10", end: "2027-06-18" },
      { levels: "2.º de Bachillerato", start: "2026-09-10", end: "2027-05-20", note: "alumnado que se gradúa; luego, actividades de preparación hasta la PAU" },
      { levels: "Formación Profesional", start: "2026-09-21", end: "2027-06-18" },
      { levels: "Educación de adultos", start: "2026-09-23", end: "2027-06-18" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-28", end: "2027-05-31" },
    ],
    christmas: { from: "2026-12-23", to: "2027-01-06" },
    easter: { from: "2027-03-25", to: "2027-04-04", note: "La resolución las llama vacaciones de Pascua." },
    otherBreaks: [
      {
        name: "Fiesta escolar unificada y Día de las Illes Balears",
        from: "2027-02-26",
        to: "2027-03-01",
        note: "viernes 26 de febrero, no lectivo, y lunes 1 de marzo, festivo",
      },
    ],
    nonTeaching: [],
    localDays:
      "Son festivas las dos fiestas locales de cada municipio. Si una o las dos caen en día no lectivo, el centro puede fijar tantos días sustitutorios como coincidencias (dos como máximo). Además, cada centro puede establecer dos días festivos de libre disposición; los consejos escolares municipales deben procurar que todos los centros del municipio elijan los mismos.",
    notes: [
      "176 días lectivos en Infantil, Primaria, Educación Especial, Secundaria y Bachillerato. El primer ciclo de Infantil (0 a 3 años) sigue las mismas fechas.",
      "El 22 de diciembre y el 24 de marzo, los centros con jornada partida pueden concentrar las clases en un solo periodo.",
      "Una resolución de 25 de junio de 2026 (BOIB núm. 82) modificó la redacción sobre horarios y autorizaciones, sin cambiar ninguna fecha.",
    ],
    schoolDays: 176,
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------------------ Madrid */
  {
    boe: "MD",
    order: {
      short: "Orden 2034/2026, de 25 de mayo",
      title:
        "Orden 2034/2026, de 25 de mayo, de la Consejera de Educación, Ciencia y Universidades, por la que se establece el calendario escolar para el curso 2026/2027 en los centros educativos no universitarios sostenidos con fondos públicos de la Comunidad de Madrid",
      issuer: "Consejería de Educación, Ciencia y Universidades",
      bulletin: "BOCM",
      number: "131",
      date: "2026-06-04",
      url: "https://www.bocm.es/boletin/CM_Orden_BOCM/2026/06/04/BOCM-20260604-13.PDF",
      departmentUrl: "https://www.comunidad.madrid/servicios/educacion/calendario-escolar",
    },
    levels: [
      { levels: "Infantil (2.º ciclo), Primaria y Educación Especial", start: "2026-09-07", end: "2027-06-18" },
      { levels: "ESO, Bachillerato y Formación Profesional", start: "2026-09-08", end: "2027-06-18" },
      { levels: "2.º de Bachillerato", start: "2026-09-08", end: null, note: "termina según la prueba de acceso a la universidad" },
      { levels: "Educación de Personas Adultas", start: "2026-09-21", end: "2027-06-18" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-08", end: "2027-06-25" },
      { levels: "Escuelas Infantiles y Casas de Niños (0 a 3 años)", start: "2026-09-07", end: "2027-07-30" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-08",
      note: "La orden fija las vacaciones del 23 de diciembre al 6 de enero y declara no lectivos el 7 y el 8 de enero.",
    },
    easter: {
      from: "2027-03-19",
      to: "2027-03-29",
      note: "La orden fija las vacaciones del 20 al 28 de marzo y declara no lectivos el viernes 19 y el lunes 29.",
    },
    otherBreaks: [{ name: "Días no lectivos de febrero", from: "2027-02-12", to: "2027-02-15", note: "viernes 12 y lunes 15 de febrero" }],
    nonTeaching: [],
    localDays:
      "No hay clase en las fiestas locales que fija cada municipio para 2026 y 2027, publicadas en el BOCM. Los centros privados concertados pueden cambiar uno de los días no lectivos de la orden para celebrar a su patrón, con acuerdo del consejo escolar y aviso a la Dirección de Área Territorial y a las familias.",
    notes: [
      "En los colegios públicos de Infantil, Primaria y Educación Especial las clases pueden ser solo de mañana, en jornada de cuatro horas, del 7 al 30 de septiembre de 2026 y del 1 al 18 de junio de 2027, y también el 22 de diciembre si lo acuerda el consejo escolar. El comedor sigue abierto.",
      "Las escuelas infantiles y unidades de 0 a 3 años solo tienen como no lectivos el 7 y el 8 de enero: para ellas el 12 y 15 de febrero y el 19 y 29 de marzo son lectivos.",
    ],
    verifiedAt: "2026-11-06",
  },

  /* ----------------------------------------------------------------- Melilla */
  {
    boe: "ML",
    order: {
      short: "Resolución de la Dirección General de Planificación y Gestión Educativa de 10 de junio de 2026",
      title:
        "Resolución del Director General de Planificación y Gestión Educativa por la que se establece el calendario escolar para el curso 2026-2027 en los centros docentes no universitarios de la Ciudad de Melilla",
      issuer: "Dirección General de Planificación y Gestión Educativa del Ministerio de Educación, Formación Profesional y Deportes",
      bulletin: "web del Ministerio de Educación",
      number: null,
      date: "2026-06-10",
      url: "https://www.educacionfpydeportes.gob.es/dam/jcr:97a96fff-bae7-4388-a5ec-bb6b7e564abc/resolucion-calendario-escolar-26-27.pdf",
      departmentUrl: "https://www.educacionfpydeportes.gob.es/contenidos/ba/ceuta-melilla/melilla/portada/curso-academico-26-27.html",
    },
    levels: [
      { levels: "Infantil, Primaria, Educación Especial, ESO, FP de Grado Básico y Bachillerato", start: "2026-09-09", end: "2027-06-23", note: "2.º de Bachillerato se adapta a la prueba de acceso a la universidad" },
      { levels: "FP presencial y Artes Plásticas y Diseño", start: "2026-09-14", end: "2027-06-23" },
      { levels: "Personas Adultas, Escuela Oficial de Idiomas y Música", start: "2026-09-24", end: "2027-06-23" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-08",
      note: "La resolución fija las vacaciones del 23 de diciembre al 7 de enero, y el 8 de enero como día de libre disposición.",
    },
    easter: {
      from: "2027-03-22",
      to: "2027-04-02",
      note: "La resolución fija la Semana Santa del 22 al 26 de marzo, y del 29 de marzo al 2 de abril como días de libre disposición.",
    },
    otherBreaks: [],
    nonTeaching: [
      { date: "2026-09-17", reason: "Día de Melilla" },
      { date: "2026-09-21", reason: "día de libre disposición" },
      { date: "2026-11-02", reason: "día de libre disposición" },
    ],
    localDays:
      "En Melilla no hay días que elija cada centro: la resolución fija para todos los días de libre disposición (21 de septiembre, 2 de noviembre, 8 de enero y del 29 de marzo al 2 de abril). Solo puede cambiarse con autorización de la Dirección Provincial.",
    notes: [
      "175 días lectivos. En junio y septiembre, Infantil y Primaria pueden tener jornada reducida de 9 a 13 horas.",
      "El calendario gráfico da como fechas aproximadas de las fiestas musulmanas el 9 de marzo (fin del Ramadán) y el 17 de mayo (Fiesta del Sacrificio); el calendario laboral de 2027 publicado en el BOE fija el miércoles 10 de marzo y el lunes 17 de mayo.",
      "La resolución no está en un boletín: es un documento firmado el 10 de junio de 2026 y publicado en la página de la Dirección Provincial de Melilla.",
    ],
    schoolDays: 175,
    verifiedAt: "2026-11-06",
  },

  /* ------------------------------------------------------------------ Murcia */
  {
    boe: "MC",
    order: {
      short: "Resolución de 8 de junio de 2026",
      title: "Resolución de 8 de junio de 2026 de la Dirección General de Centros Educativos e Infraestructuras por la que se establece el período lectivo del curso escolar 2026-2027",
      issuer: "Dirección General de Centros Educativos e Infraestructuras de la Consejería de Educación y Formación Profesional",
      bulletin: "BORM",
      number: "132",
      date: "2026-06-11",
      url: "https://www.borm.es/services/anuncio/ano/2026/numero/2748/pdf?id=843430",
    },
    levels: [
      { levels: "Infantil, Primaria y Educación Especial", start: "2026-09-08", end: "2027-06-22" },
      { levels: "ESO, FP de Grado Básico y Bachillerato", start: "2026-09-10", end: "2027-06-21", note: "2.º de Bachillerato termina según la evaluación final y la PAU" },
      { levels: "FP de Grado Medio y Superior", start: "2026-09-14", end: "2027-06-21" },
      { levels: "Educación de Personas Adultas", start: "2026-09-10", end: "2027-06-21" },
      { levels: "Escuelas Oficiales de Idiomas", start: "2026-09-07", end: "2027-05-06" },
      { levels: "Escuelas infantiles de primer ciclo de la Comunidad", start: "2026-09-08", end: "2027-07-15" },
    ],
    christmas: {
      from: "2026-12-23",
      to: "2027-01-06",
      note: "La resolución fija las vacaciones del 24 de diciembre al 6 de enero y declara no lectivo el 23 de diciembre en toda la Región.",
    },
    easter: { from: "2027-03-22", to: "2027-03-29" },
    otherBreaks: [],
    nonTeaching: [
      { date: "2026-11-27", reason: "fiesta del patrón", levels: "en Infantil, Primaria y Educación Especial" },
      { date: "2027-01-29", reason: "fiesta del patrón", levels: "en ESO, Bachillerato, Adultos, Idiomas y FP de Grado Básico", partial: true },
      { date: "2027-02-01", reason: "fiesta del patrón", levels: "en Formación Profesional", partial: true },
    ],
    localDays:
      "Cada municipio tiene sus dos festivos locales (si caen en día sin clase, se trasladan a un día lectivo) y otros tres días no lectivos que propone el Consejo Escolar Municipal. Todos están en el anexo V de la resolución, municipio por municipio, y valen para todos los centros del municipio: están en la tabla de abajo.",
    notes: [
      "Muchos municipios añaden como no lectivos días alrededor de la Semana Santa (del 30 de marzo al 2 de abril): mira el tuyo en la tabla.",
      "Una modificación de 12 de julio de 2026 (BORM núm. 167) cambió solo los días de Alguazas.",
    ],
    townDays: [
      { town: "Abanilla", local: ["2026-09-14", "2027-05-03"], other: ["2027-03-30", "2027-04-30", "2027-05-04"] },
      { town: "Abarán", local: ["2026-09-28", "2027-03-30"], other: ["2026-09-29", "2027-01-07", "2027-03-31"] },
      { town: "Águilas", local: ["2027-02-09", "2027-04-30"], other: ["2027-01-07", "2027-01-08", "2027-02-08"] },
      { town: "Albudeite", local: ["2026-09-08", "2027-04-02"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Alcantarilla", local: ["2026-09-15", "2027-05-14"], other: ["2027-03-30", "2027-03-31", "2027-05-13"] },
      { town: "Aledo", local: ["2027-03-31", "2027-05-10"], other: ["2027-01-07", "2027-01-08", "2027-03-30"] },
      { town: "Alguazas", local: ["2027-03-30", "2027-06-11"], other: ["2027-03-31", "2027-04-01", "2027-04-02"], note: "corregido en el BORM de 22 de julio de 2026" },
      { town: "Alhama de Murcia", local: ["2026-10-07", "2027-02-02"], other: ["2027-02-01", "2027-03-30", "2027-04-30"] },
      { town: "Archena", local: ["2027-05-27", "2027-05-28"], other: ["2027-01-07", "2027-03-30", "2027-03-31"] },
      { town: "Beniel", local: ["2027-02-02", "2027-04-02"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Blanca", local: ["2027-04-01", "2027-04-02"], other: ["2027-01-07", "2027-03-30", "2027-03-31"] },
      { town: "Bullas", local: ["2026-10-05", "2026-10-06"], other: ["2027-01-07", "2027-01-08", "2027-04-26"] },
      { town: "Calasparra", local: ["2026-09-08", "2027-01-07"], other: ["2027-03-30", "2027-04-30", "2027-05-03"] },
      { town: "Campos del Río", local: ["2027-01-07", "2027-03-30"], other: ["2027-03-31", "2027-04-01", "2027-04-02"] },
      { town: "Caravaca de la Cruz", local: ["2027-05-03", "2027-05-04"], other: ["2027-01-07", "2027-05-05", "2027-05-06"] },
      { town: "Cartagena", local: ["2026-09-25", "2027-01-07"], other: ["2026-09-24", "2027-01-08", "2027-02-08"] },
      { town: "Cehegín", local: ["2026-09-10", "2026-09-14"], other: ["2026-09-11", "2027-03-30", "2027-03-31"] },
      { town: "Ceutí", local: ["2027-04-01", "2027-04-02"], other: ["2027-01-07", "2027-03-30", "2027-03-31"] },
      { town: "Cieza", local: ["2026-09-08", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-30"] },
      { town: "Fortuna", local: ["2027-04-02", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Fuente Álamo", local: ["2027-04-02", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Jumilla", local: ["2027-04-02", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "La Unión", local: ["2026-10-07", "2027-05-03"], other: ["2027-01-07", "2027-01-08", "2027-03-30"] },
      { town: "Las Torres de Cotillas", local: ["2027-03-30", "2027-05-03"], other: ["2027-03-31", "2027-04-01", "2027-04-02"] },
      { town: "Librilla", local: ["2027-03-30", "2027-03-31"], other: ["2027-01-07", "2027-04-01", "2027-04-02"] },
      { town: "Lorca", local: ["2026-09-08", "2026-11-23"], other: ["2026-11-20", "2027-01-07", "2027-05-03"] },
      { town: "Lorquí", local: ["2027-01-18", "2027-04-02"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Los Alcázares", local: ["2026-10-13", "2027-04-02"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Mazarrón", local: ["2026-11-17", "2027-06-14"], other: ["2026-11-16", "2027-03-30", "2027-04-30"] },
      { town: "Molina de Segura", local: ["2026-09-21", "2027-01-22"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Moratalla", local: ["2027-04-19", "2027-06-15"], other: ["2026-09-29", "2027-01-07", "2027-05-03"] },
      { town: "Mula", local: ["2026-09-21", "2026-09-23"], other: ["2026-09-22", "2027-03-30", "2027-05-17"] },
      { town: "Murcia", local: ["2026-09-15", "2027-03-30"], other: ["2027-03-31", "2027-04-01", "2027-04-02"] },
      { town: "Ojós", local: ["2027-04-01", "2027-04-02"], other: ["2027-01-07", "2027-03-30", "2027-03-31"] },
      { town: "Pliego", local: ["2026-09-08", "2027-02-02"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Puerto Lumbreras", local: ["2026-10-07", "2027-05-03"], other: ["2026-10-02", "2027-02-08", "2027-04-30"] },
      { town: "Ricote", local: ["2027-01-20", "2027-01-22"], other: ["2027-01-21", "2027-03-30", "2027-03-31"] },
      { town: "San Javier", local: ["2026-12-03", "2027-02-03"], other: ["2026-12-04", "2027-03-30", "2027-03-31"] },
      { town: "San Pedro del Pinatar", local: ["2027-04-02", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Santomera", local: ["2026-09-29", "2026-10-07"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Torre Pacheco", local: ["2026-10-07", "2026-10-09"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Totana", local: ["2026-12-10", "2027-01-07"], other: ["2026-12-09", "2027-01-08", "2027-03-30"] },
      { town: "Ulea", local: ["2027-04-02", "2027-05-03"], other: ["2027-03-30", "2027-03-31", "2027-04-01"] },
      { town: "Villanueva del Río Segura", local: ["2027-04-01", "2027-05-28"], other: ["2027-01-07", "2027-03-30", "2027-03-31"] },
      { town: "Yecla", local: ["2026-09-14", "2026-12-09"], other: ["2027-03-30", "2027-06-10", "2027-06-11"] },
    ],
    verifiedAt: "2026-11-06",
  },

  /* ----------------------------------------------------------------- Navarra */
  {
    boe: "NC",
    order: {
      short: "Resolución 143/2026, de 31 de marzo",
      title:
        "Resolución 143/2026, de 31 de marzo, del director general de Educación y Formación Profesional, por la que se aprueban las instrucciones para la elaboración del calendario y horario correspondiente a las enseñanzas de segundo ciclo de Educación Infantil, de Educación Primaria, de Educación Especial, de Educación Secundaria Obligatoria y de Bachillerato, impartidas en centros educativos de la Comunidad Foral de Navarra, para el curso 2026-2027",
      issuer: "Dirección General de Educación y Formación Profesional del Departamento de Educación",
      bulletin: "BON",
      number: "77",
      date: "2026-04-21",
      url: "https://bon.navarra.es/es/anuncio/-/texto/2026/77/6",
    },
    flexible:
      "En Navarra la resolución fija un margen y cada colegio aprueba su propio calendario: en Infantil y Primaria, el primer día está entre el 4 y el 8 de septiembre y el último entre el 18 y el 22 de junio.",
    levels: [
      {
        levels: "Infantil (2.º ciclo), Primaria y Educación Especial",
        start: "2026-09-04",
        end: "2027-06-22",
        startLatest: "2026-09-08",
        endEarliest: "2027-06-18",
        startText: "entre el 4 y el 8 de septiembre de 2026, según el centro",
        endText: "entre el 18 y el 22 de junio de 2027, según el centro",
      },
      { levels: "ESO y 1.º de Bachillerato", start: "2026-09-04", end: "2027-06-18" },
      { levels: "2.º de Bachillerato", start: "2026-09-04", end: null, note: "exámenes ordinarios hasta el 17 de mayo; después, preparación de la PAU" },
      { levels: "FP de Grado Básico", start: "2026-09-04", end: "2027-06-21" },
      { levels: "FP de Grado Medio", start: "2026-09-11", end: "2027-06-21" },
    ],
    christmas: { from: "2026-12-23", to: "2027-01-10", note: "El 22 de diciembre solo hay clase por la mañana." },
    easter: { from: "2027-03-25", to: "2027-04-04", note: "El 24 de marzo solo hay clase por la mañana." },
    otherBreaks: [],
    nonTeaching: [
      { date: "2026-12-03", reason: "San Francisco Javier" },
      { date: "2026-11-27", reason: "fiesta patronal (cada centro puede cambiarla de día)", levels: "en Infantil, Primaria, Educación Especial y ESO de los colegios", partial: true },
      { date: "2027-01-28", reason: "fiesta patronal (cada centro puede cambiarla de día)", levels: "en ESO de los institutos y en Bachillerato", partial: true },
    ],
    localDays:
      "No hay clase el día de la fiesta de la localidad (si cae en día sin clase, el centro puede elegir otra fecha). Además, cada centro puede fijar como máximo cinco días laborables no lectivos durante el curso, que no pueden servir para alargar Navidad ni Semana Santa. El consejo escolar aprueba el calendario y la inspección lo valida.",
    notes: [
      "Al menos 175 días lectivos en Infantil, Primaria, Educación Especial, ESO y 1.º de Bachillerato.",
      "La Formación Profesional tiene su propia resolución (225/2026, modificada por la 351/2026), con las mismas vacaciones de Navidad y Semana Santa.",
    ],
    schoolDays: 175,
    verifiedAt: "2026-11-06",
  },

  /* -------------------------------------------------------------- País Vasco */
  {
    boe: "PV",
    order: {
      short: "Resolución de 21 de abril de 2026 de la Viceconsejera de Políticas Educativas",
      title:
        "Resolución de la Viceconsejera de Políticas Educativas, por la que se dictan normas complementarias que han de regular la elaboración del calendario escolar para el curso 2026-2027 de los centros públicos de la Comunidad Autónoma del País Vasco, en las etapas educativas de Educación Infantil y Primaria",
      issuer: "Viceconsejería de Políticas Educativas del Departamento de Educación",
      bulletin: "euskadi.eus",
      number: null,
      date: "2026-04-21",
      url: "https://www.euskadi.eus/contenidos/informacion/cee_organizacioncentros_calend/es_def/adjuntos/2026_2027/Resolucion-calendario-Primaria-2026_27-cast-.pdf",
      departmentUrl: "https://www.euskadi.eus/contenidos/informacion/cee_organizacioncentros_calend/es_def/index.shtml",
    },
    flexible:
      "En Euskadi el Departamento de Educación fija un marco y cada centro aprueba su propio calendario: inicio, fin, vacaciones (que puede alargar) y días festivos. Las fechas de abajo son los límites y mínimos para todos; las de tu centro están en su calendario.",
    levels: [
      {
        levels: "Infantil y Primaria (centros públicos)",
        start: "2026-09-07",
        end: "2027-06-18",
        startText: "no antes del lunes 7 de septiembre de 2026",
        endText: "como muy tarde el viernes 18 de junio de 2027",
      },
      {
        levels: "ESO y Bachillerato",
        start: "2026-09-07",
        end: "2027-06-18",
        startText: "no antes del lunes 7 de septiembre de 2026",
        endText: "como muy tarde el viernes 18 de junio de 2027",
      },
      { levels: "1.º de Bachillerato", start: null, end: "2027-05-28", note: "fin de las clases; hasta el 18 de junio, pruebas y evaluaciones finales" },
      { levels: "2.º de Bachillerato", start: null, end: "2027-05-14", note: "fin de las clases ordinarias; después, evaluaciones y preparación de la prueba de acceso" },
      {
        levels: "Formación Profesional",
        start: "2026-09-03",
        end: "2027-06-18",
        startText: "no antes del jueves 3 de septiembre de 2026",
        endText: "como muy tarde el viernes 18 de junio de 2027",
      },
    ],
    christmas: { from: "2026-12-24", to: "2027-01-06", minimum: true, note: "Es el mínimo: cada centro puede alargarlas en su calendario." },
    easter: { from: "2027-03-25", to: "2027-03-29", minimum: true, note: "Es el mínimo, de Jueves Santo a Lunes de Pascua: cada centro puede alargarlas." },
    otherBreaks: [],
    nonTeaching: [],
    localDays:
      "Son festivos los del calendario laboral de Euskadi y las fiestas patronales de la localidad y del territorio. Cada centro puede declarar festivo el día del patrón de una etapa (o cambiarlo por otro). El consejo escolar propone el calendario completo del centro y la Delegación Territorial de Educación lo aprueba.",
    notes: [
      "Al menos 175 días lectivos. Ninguna resolución del curso fija Carnavales ni otros días no lectivos: los decide cada centro.",
      "En Infantil y Primaria puede suprimirse la tarde en septiembre y junio y la del último día antes de Navidad, Semana Santa y Carnavales (dos tardes como máximo), con un máximo de cuatro horas por la mañana.",
      "ESO, Bachillerato y FP tienen su propia resolución, de la misma fecha, con las mismas vacaciones mínimas.",
    ],
    schoolDays: 175,
    verifiedAt: "2026-11-06",
  },
];
