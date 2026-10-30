import type { Locale } from "@/lib/i18n/config";

/** Editorial copy for the public holiday guide, as supplied. */

export interface HolidayCopy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;

  lead: string[];
  directAnswerTitle: string;
  directAnswer: string;

  keyFactsTitle: string;
  keyFacts: { label: string; value: string }[];

  tableTitle: string;
  tableIntro: string[];
  tableCaption: string;
  tableHeaders: string[];
  tableNote: string;

  /** Which of the twelve are national, and which only Catalan (BOE list). */
  nationalTitle: string;
  national: string[];

  saturdayTitle: string;
  saturday: string[];

  bridgesTitle: string;
  bridgesIntro: string[];

  efficiencyTitle: string;
  efficiencyCaption: string;
  efficiencyHeaders: string[];
  efficiencyNone: string;
  efficiencyDays: (n: number) => string;
  efficiencyResult: (n: number) => string;
  efficiencyNote: string;

  barcelonaTitle: string;
  barcelona: string[];

  aranTitle: string;
  aran: string[];

  /** Easter 2027: which of the days around it are holidays (rows built from the payload). */
  easterTitle: string;
  easterIntro: string;
  easterHeaders: string[];
  easterNames: { maundy: string; sunday: string };
  easterStatus: { maundy: string; holiday: string; exceptAran: string; sunday: string; barcelona: string };
  /** `{from}`, `{to}`: the school Easter holidays (Ordre EDF/66/2026). */
  easterSchool: string;

  /** Local holidays of other towns: when next year's appear, where this year's are. `{towns}`, `{count}` (how many towns have a page). */
  localTitle: string;
  local: string[];

  /** The current year, for searches that still name it. `{last}`, `{dec7}`, `{bcn}`. */
  year2026Title: string;
  year2026Intro: string;
  year2026Note: string;

  /** One line to the school calendar, for parents. */
  schoolLine: string;

  calendarTitle: string;
  calendarIntro: string;
  calendarDownload: string;
  calendarFilename: string;
  calendarNote: string;

  closingTitle: string;
  closing: string[];

  /** Weekday names, index 0 = Sunday, for rendering dates from ISO. */
  weekdays: string[];
  months: string[];
}

const efficiencyLabels = {
  ca: { none: "Cap", day: (n: number) => (n === 1 ? "1 dia" : `${n} dies`), result: (n: number) => `${n} dies` },
  es: { none: "Ninguno", day: (n: number) => (n === 1 ? "1 día" : `${n} días`), result: (n: number) => `${n} días` },
  en: { none: "None", day: (n: number) => (n === 1 ? "1 day" : `${n} days`), result: (n: number) => `${n} days` },
};

export const COPY: Record<Locale, HolidayCopy> = {
  ca: {
    path: "guies/calendari-laboral-catalunya",
    title: "Calendari laboral 2027 a Catalunya: tots els festius, ponts i dies per demanar vacances",
    seoTitle: "Calendari laboral 2027 Catalunya: festius, ponts i Pasqua",
    seoDescription:
      "Els 12 festius 2027 a Catalunya: 1 i 6 de gener, 26 i 29 de març, 1 de maig, 24 de juny, 11 de set., 12 d'oct., 1 de nov., 6, 8 i 25 de des. I els ponts.",
    excerpt:
      "Els 12 festius oficials del 2027, els ponts que deixa el calendari i quins dies de vacances rendeixen més. Amb descàrrega per al teu calendari.",

    lead: [
      "Catalunya té 12 festius el 2027: l'1 i el 6 de gener, el 26 i el 29 de març, l'1 de maig, el 24 de juny, l'11 de setembre, el 12 d'octubre, l'1 de novembre i el 6, el 8 i el 25 de desembre. Els fixa l'Ordre EMT/52/2026 (DOGC de l'1 d'abril de 2026) i el BOE del 13 d'octubre de 2026 els recull a la relació estatal de festes del 2027; cada ajuntament hi afegeix dues festes locals.",
      "La distribució deixa diverses oportunitats: Setmana Santa ofereix quatre dies seguits sense gastar vacances, Sant Joan i el 12 d'octubre permeten fer pont demanant un sol dia, i el desembre és especialment favorable per encadenar dies lliures.",
    ],
    directAnswerTitle: "En resum",
    directAnswer:
      "Per a una persona que treballi habitualment de dilluns a divendres, un dels millors moviments del 2027 serà demanar el **7 de desembre**: un sol dia de vacances permet encadenar cinc dies lliures, del 4 al 8 de desembre.",

    keyFactsTitle: "Dades clau",
    keyFacts: [
      { label: "Any", value: "2027" },
      { label: "Festius a tot Catalunya", value: "12" },
      { label: "Festes locals", value: "2 per municipi" },
      { label: "Millor pont d'un dia", value: "7 de desembre" },
      { label: "Excepció d'Aran", value: "Sí, el 29 de març se substitueix" },
      { label: "Última verificació", value: "30 d'octubre de 2026" },
    ],

    tableTitle: "Tots els festius laborals de Catalunya el 2027",
    tableIntro: [
      "El calendari oficial fixa aquestes dotze dates:",
    ],
    tableCaption: "Festius laborals a Catalunya, 2027",
    tableHeaders: ["Data", "Dia", "Festiu"],
    tableNote:
      "Font: Ordre EMT/52/2026, de 25 de març (DOGC de l'1 d'abril de 2026), publicada també al BOE del 13 d'octubre de 2026. A aquests dies cal afegir-hi dues festes locals que determina cada ajuntament.",

    nationalTitle: "Quins festius són estatals i quins només de Catalunya?",
    national: [
      "Nou dels dotze festius són comuns a tota Espanya el 2027: l'1 i el 6 de gener, Divendres Sant (26 de març), l'1 de maig, el 12 d'octubre, l'1 de novembre i el 6, el 8 i el 25 de desembre. Els altres tres són propis de Catalunya: el Dilluns de Pasqua Florida (29 de març), Sant Joan (24 de juny) i la Diada (11 de setembre).",
      "El **Dijous Sant** (25 de març de 2027) és festiu a la majoria de comunitats, però **no a Catalunya**. El 15 d'agost i el 26 de desembre, que el 2026 són festius aquí, el 2027 cauen en diumenge i no formen part del calendari català.",
      "Font: Resolució de 8 d'octubre de 2026 de la Direcció General de Treball, que publica la relació de festes laborals del 2027 (BOE del 13 d'octubre de 2026).",
    ],

    saturdayTitle: "Quins festius cauen en dissabte?",
    saturday: [
      "El 2027 hi ha tres dels dotze festius generals que cauen en dissabte: l'1 de maig, l'11 de setembre i el 25 de desembre.",
      "Per a una persona amb jornada ordinària de dilluns a divendres, aquestes dates no generen per si soles un dia laborable addicional de descans. La situació concreta pot variar segons el calendari laboral, els torns i el conveni aplicable.",
    ],

    bridgesTitle: "Els millors ponts del 2027",
    bridgesIntro: [
      "Tot el que ve a continuació pressuposa una setmana laboral habitual de dilluns a divendres. No és una regla universal: torns, convenis i calendaris d'empresa poden canviar-ho del tot.",
      "Si el que busques és el pont d'enguany, el 2026 a Catalunya només és festiu el dimarts 8 de desembre: ho expliquem a [pont de desembre 2026](/ca/guies/pont-desembre-catalunya/).",
    ],

    efficiencyTitle: "Quins dies val més la pena demanar?",
    efficiencyCaption: "Rendiment de cada dia de vacances",
    efficiencyHeaders: ["Vacances", "Dies que demanes", "Descans total"],
    efficiencyNone: efficiencyLabels.ca.none,
    efficiencyDays: efficiencyLabels.ca.day,
    efficiencyResult: efficiencyLabels.ca.result,
    efficiencyNote:
      "Càlcul editorial de CatalunyaInfo sobre el calendari oficial, per a una setmana de dilluns a divendres. No substitueix el calendari laboral de cada empresa ni el conveni aplicable, i demanar un dia de vacances no vol dir que estigui concedit.",

    barcelonaTitle: "Calendari laboral de Barcelona 2027: les festes locals",
    barcelona: [
      "Els dotze festius generals no són tot el calendari: cada municipi hi afegeix dues festes locals. A Barcelona, l'Ajuntament ja les ha fixades oficialment, de manera que la ciutat té catorze festius el 2027.",
      "Totes dues cauen en dilluns o divendres, de manera que creen directament caps de setmana de tres dies per a moltes persones amb jornada de dilluns a divendres.",
      "Tots els festius de Barcelona, dia a dia i amb les botigues que poden obrir, són a [festius de Barcelona](/ca/festius/barcelona/). Si treballes en un altre municipi, consulta els seus dos festius locals: no els donem per suposats.",
    ],

    aranTitle: "L'excepció d'Aran",
    aran: [
      "Al territori d'Aran el calendari és lleugerament diferent. El **29 de març**, Dilluns de Pasqua Florida, queda **substituït** pel **17 de juny**, Festa d'Aran, que el 2027 cau en dijous.",
      "No és un festiu addicional: és un canvi. Per tant, els càlculs de ponts relacionats amb aquestes dues dates no s'apliquen igual al territori aranès.",
    ],

    easterTitle: "Setmana Santa i Pasqua 2027: quins dies són festius",
    easterIntro:
      "A Catalunya són festius el Divendres Sant i el Dilluns de Pasqua Florida, de manera que, amb el cap de setmana, fan quatre dies seguits de festa. El Dijous Sant, que és festiu a la majoria de comunitats, aquí és laborable. La Pasqua Granada, set setmanes després, només és festa local als municipis que la trien, com Barcelona.",
    easterHeaders: ["Data", "Dia", "Què és", "És festiu?"],
    easterNames: { maundy: "Dijous Sant", sunday: "Diumenge de Pasqua" },
    easterStatus: {
      maundy: "No a Catalunya (sí a la majoria de comunitats)",
      holiday: "Sí, a tot Catalunya",
      exceptAran: "Sí, a tot Catalunya excepte l'Aran",
      sunday: "Diumenge",
      barcelona: "Festa local a Barcelona, no a tot Catalunya",
    },
    easterSchool:
      "Les vacances escolars de Setmana Santa van del {from} al {to}, tots dos inclosos (Ordre EDF/66/2026): tot el curs és al [calendari escolar 2026-2027](/ca/guies/calendari-escolar-catalunya/).",

    localTitle: "Festes locals del 2027: quan es publiquen",
    local: [
      "A més dels dotze festius, cada municipi en té dos de locals, que fixa una ordre del Departament d'Empresa i Treball a proposta dels ajuntaments. Les del 2027 encara no s'han publicat: a 30 d'octubre de 2026, les dades obertes de la Generalitat no en tenen cap. Les del 2026 van sortir al DOGC el 17 de desembre de 2025 (Ordre EMT/208/2025).",
      "Mentrestant, les festes locals del 2026 són a [festius locals per municipi](/ca/festius/), amb una pàgina per a cadascun dels {count} municipis més poblats ({towns}), i la resta a [festius locals de tots els municipis](/ca/guies/festius-locals-catalunya/). Hi afegirem les del 2027 quan surti l'ordre.",
    ],

    year2026Title: "Calendari laboral 2026 a Catalunya",
    year2026Intro:
      "El 2026 també té dotze festius a tot Catalunya, fixats per l'Ordre EMT/66/2025. Els últims de l'any són el {last}. El {dec7}, en canvi, no és festiu a Catalunya: només és festa local en alguns municipis.",
    year2026Note:
      "Font: Ordre EMT/66/2025, de 30 d'abril (DOGC del 6 de maig de 2025). A l'Aran, el 26 de desembre se substitueix pel 17 de juny (Festa d'Aran). A Barcelona, les festes locals del 2026 són {bcn}.",

    schoolLine:
      "Si tens fills en edat escolar, les vacances de l'escola no coincideixen amb aquests festius: mira el [calendari escolar 2026-2027](/ca/guies/calendari-escolar-catalunya/).",

    calendarTitle: "Afegeix els festius al teu calendari",
    calendarIntro:
      "El fitxer conté només els **dotze festius oficials de Catalunya**. No inclou ni les festes locals ni els dies de vacances suggerits: aquests són recomanacions editorials, no festius.",
    calendarDownload: "Descarrega els festius (.ics)",
    calendarFilename: "festius-catalunya-2027",
    calendarNote: "Dates transcrites de l'Ordre EMT/52/2026, comprovades amb el BOE del 13 d'octubre i, el 30 d'octubre de 2026, amb el calendari del Departament d'Empresa i Treball.",

    closingTitle: "Guarda aquesta guia",
    closing: [
      "Mantindrem aquesta pàgina a la mateixa adreça i l'actualitzarem si hi ha qualsevol modificació oficial o quan es completin els calendaris locals. No caldrà buscar una URL nova l'any que ve.",
    ],

    weekdays: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    months: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  },

  es: {
    path: "guias/calendario-laboral-cataluna",
    title: "Calendario laboral 2027 en Cataluña: festivos, puentes y mejores días para pedir vacaciones",
    seoTitle: "Calendario laboral 2027 Cataluña: 12 festivos y puentes",
    seoDescription:
      "Los 12 festivos 2027 en Cataluña: 1 y 6 de enero, 26 y 29 de marzo, 1 de mayo, 24 de junio, 11 sept., 12 oct., 1 nov., 6, 8 y 25 dic. Y los puentes.",
    excerpt:
      "Los 12 festivos oficiales de 2027, los puentes que deja el calendario y qué días de vacaciones rinden más. Con descarga para tu calendario.",

    lead: [
      "Cataluña tiene 12 festivos en 2027: 1 y 6 de enero, 26 y 29 de marzo, 1 de mayo, 24 de junio, 11 de septiembre, 12 de octubre, 1 de noviembre y 6, 8 y 25 de diciembre. Los fija la Orden EMT/52/2026 (DOGC del 1 de abril de 2026) y el BOE del 13 de octubre de 2026 los recoge en la relación estatal de fiestas de 2027; cada ayuntamiento añade dos fiestas locales.",
      "El reparto de las fechas deja varias oportunidades para quienes trabajan de lunes a viernes: Semana Santa ofrece cuatro días consecutivos sin gastar vacaciones, y pedir un solo día en junio, octubre o diciembre permite crear puentes especialmente largos.",
    ],
    directAnswerTitle: "En resumen",
    directAnswer:
      "La combinación más eficiente: pedir libre el **7 de diciembre** permite enlazar cinco días consecutivos, del 4 al 8 de diciembre, utilizando un único día de vacaciones.",

    keyFactsTitle: "Datos clave",
    keyFacts: [
      { label: "Año", value: "2027" },
      { label: "Festivos en toda Cataluña", value: "12" },
      { label: "Fiestas locales", value: "2 por municipio" },
      { label: "Mejor puente de un día", value: "7 de diciembre" },
      { label: "Excepción de Arán", value: "Sí, el 29 de marzo se sustituye" },
      { label: "Última verificación", value: "30 de octubre de 2026" },
    ],

    tableTitle: "Festivos oficiales en Cataluña en 2027",
    tableIntro: ["La Generalitat establece estas doce fechas:"],
    tableCaption: "Festivos laborales en Cataluña, 2027",
    tableHeaders: ["Fecha", "Día", "Festivo"],
    tableNote:
      "Fuente: Orden EMT/52/2026, de 25 de marzo (DOGC del 1 de abril de 2026), recogida también en el BOE del 13 de octubre de 2026. A estas fechas se suman dos festivos locales determinados por cada ayuntamiento.",

    nationalTitle: "¿Qué festivos son nacionales y cuáles solo de Cataluña?",
    national: [
      "Nueve de los doce festivos son comunes a toda España en 2027: 1 y 6 de enero, Viernes Santo (26 de marzo), 1 de mayo, 12 de octubre, 1 de noviembre y 6, 8 y 25 de diciembre. Los otros tres son propios de Cataluña: el Lunes de Pascua (29 de marzo), San Juan (24 de junio) y la Diada (11 de septiembre).",
      "El **Jueves Santo** (25 de marzo de 2027) es festivo en la mayoría de comunidades, pero **no en Cataluña**. El 15 de agosto y el 26 de diciembre, que en 2026 son festivos aquí, en 2027 caen en domingo y no forman parte del calendario catalán.",
      "Fuente: Resolución de 8 de octubre de 2026 de la Dirección General de Trabajo, por la que se publica la relación de fiestas laborales para 2027 (BOE del 13 de octubre de 2026).",
    ],

    saturdayTitle: "Festivos que caen en sábado",
    saturday: [
      "Tres de los doce festivos generales caen en sábado: el 1 de mayo, el 11 de septiembre y el 25 de diciembre.",
      "Para una persona con horario habitual de lunes a viernes, estas fechas no generan por sí solas otro día laborable libre. El resultado concreto puede variar según jornada, turnos, calendario de empresa o convenio.",
    ],

    bridgesTitle: "Los mejores puentes de 2027",
    bridgesIntro: [
      "Todo lo que sigue presupone una semana laboral habitual de lunes a viernes. No es una regla universal: turnos, convenios y calendarios de empresa pueden cambiarlo por completo.",
      "Si lo que buscas es el puente de este año, en 2026 en Cataluña solo es festivo el martes 8 de diciembre: lo explicamos en [puente de diciembre 2026](/es/guias/puente-diciembre-cataluna/).",
    ],

    efficiencyTitle: "Qué días sale más a cuenta pedir",
    efficiencyCaption: "Rendimiento de cada día de vacaciones",
    efficiencyHeaders: ["Vacaciones", "Días solicitados", "Descanso resultante"],
    efficiencyNone: efficiencyLabels.es.none,
    efficiencyDays: efficiencyLabels.es.day,
    efficiencyResult: efficiencyLabels.es.result,
    efficiencyNote:
      "Cálculo editorial de CatalunyaInfo sobre las fechas oficiales, para una semana laboral de lunes a viernes. No sustituye el calendario laboral de cada empresa ni el convenio aplicable, y pedir un día de vacaciones no significa tenerlo concedido.",

    barcelonaTitle: "Calendario laboral Barcelona 2027: festivos locales",
    barcelona: [
      "Los doce festivos generales no son todo el calendario: cada municipio añade dos fiestas locales. Barcelona ya ha aprobado oficialmente las suyas, así que la ciudad tiene catorce festivos en 2027.",
      "Ambas crean fines de semana de tres días para una jornada convencional de lunes a viernes.",
      "Todos los festivos de Barcelona, día a día y con las tiendas que pueden abrir, están en [festivos de Barcelona](/es/festivos/barcelona/). En el resto de municipios deben consultarse sus dos fiestas locales: no las damos por supuestas.",
    ],

    aranTitle: "La excepción de Arán",
    aran: [
      "En Arán el calendario es ligeramente distinto. El **29 de marzo**, Lunes de Pascua Florida, queda **sustituido** por el **17 de junio**, Festa d'Aran, que en 2027 cae en jueves.",
      "No es un festivo adicional: es un cambio. Por tanto, algunos de los cálculos anteriores no se aplican igual en este territorio.",
    ],

    easterTitle: "Semana Santa 2027 en Cataluña: qué días son festivos",
    easterIntro:
      "En Cataluña son festivos el Viernes Santo y el Lunes de Pascua Florida, así que, con el fin de semana, suman cuatro días seguidos de fiesta. El Jueves Santo, festivo en la mayoría de comunidades, aquí es laborable. La Pascua Granada, siete semanas después, solo es fiesta local en los municipios que la eligen, como Barcelona.",
    easterHeaders: ["Fecha", "Día", "Qué es", "¿Es festivo?"],
    easterNames: { maundy: "Jueves Santo", sunday: "Domingo de Pascua" },
    easterStatus: {
      maundy: "No en Cataluña (sí en la mayoría de comunidades)",
      holiday: "Sí, en toda Cataluña",
      exceptAran: "Sí, en toda Cataluña excepto en Arán",
      sunday: "Domingo",
      barcelona: "Fiesta local en Barcelona, no en toda Cataluña",
    },
    easterSchool:
      "Las vacaciones escolares de Semana Santa van del {from} al {to}, ambos incluidos (Orden EDF/66/2026): el curso entero está en el [calendario escolar 2026-2027](/es/guias/calendario-escolar-cataluna/).",

    localTitle: "Fiestas locales 2027: cuándo se publican",
    local: [
      "Además de los doce festivos, cada municipio tiene dos fiestas locales, que fija una orden del Departament d'Empresa i Treball a propuesta de los ayuntamientos. Las de 2027 todavía no se han publicado: a 30 de octubre de 2026, los datos abiertos de la Generalitat no tienen ninguna. Las de 2026 salieron en el DOGC el 17 de diciembre de 2025 (Orden EMT/208/2025).",
      "Mientras tanto, las fiestas locales de 2026 están en [festivos locales por municipio](/es/festivos/), con una página para cada uno de los {count} municipios más poblados ({towns}), y el resto en [festivos locales de todos los municipios](/es/guias/festivos-locales-cataluna/). Añadiremos las de 2027 cuando salga la orden.",
    ],

    year2026Title: "Calendario laboral 2026 en Cataluña",
    year2026Intro:
      "2026 también tiene doce festivos en toda Cataluña, fijados por la Orden EMT/66/2025. Los últimos del año son el {last}. El {dec7}, en cambio, no es festivo en Cataluña: solo es fiesta local en algunos municipios.",
    year2026Note:
      "Fuente: Orden EMT/66/2025, de 30 de abril (DOGC del 6 de mayo de 2025). En Arán, el 26 de diciembre se sustituye por el 17 de junio (Festa d'Aran). En Barcelona, las fiestas locales de 2026 son {bcn}.",

    schoolLine:
      "Si tienes hijos en edad escolar, las vacaciones del colegio no coinciden con estos festivos: mira el [calendario escolar 2026-2027](/es/guias/calendario-escolar-cataluna/).",

    calendarTitle: "Añade los festivos a tu calendario",
    calendarIntro:
      "El archivo contiene únicamente los **doce festivos oficiales de Cataluña**. No incluye fiestas locales ni los días de vacaciones sugeridos: eso son recomendaciones editoriales, no festivos.",
    calendarDownload: "Descargar los festivos (.ics)",
    calendarFilename: "festivos-cataluna-2027",
    calendarNote: "Fechas transcritas de la Orden EMT/52/2026, comprobadas con el BOE del 13 de octubre y, el 30 de octubre de 2026, con el calendario del Departament d'Empresa i Treball.",

    closingTitle: "Guarda esta guía",
    closing: [
      "Mantendremos esta página en la misma dirección y la actualizaremos si hay cualquier modificación oficial o cuando se completen los calendarios locales. No habrá que buscar una URL nueva el año que viene.",
    ],

    weekdays: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  },

  en: {
    path: "guides/catalonia-public-holidays",
    title: "Catalonia and Barcelona public holidays 2027: official dates, long weekends and days to take off",
    seoTitle: "Barcelona & Catalonia public holidays 2027: all dates",
    seoDescription:
      "All 12 Catalonia public holidays for 2027 (DOGC and BOE), Barcelona's two local days, the Easter dates, long weekends and the holidays left in 2026.",
    excerpt:
      "The 12 official 2027 holidays, the long weekends the calendar creates, and which days of leave go furthest. With a calendar file to download.",

    lead: [
      "Catalonia has 12 public holidays in 2027: 1 and 6 January, 26 March (Good Friday), 29 March (Easter Monday), 1 May, 24 June, 11 September, 12 October, 1 November, and 6, 8 and 25 December. They are set by Order EMT/52/2026 (DOGC, 1 April 2026) and appear in the national list of 2027 holidays published in Spain's official gazette (BOE) on 13 October 2026; each town adds two local holidays of its own.",
      "For people who normally work Monday to Friday, the calendar creates several useful opportunities. Easter already produces a four-day break, and a single day of leave in June, October or December can create a four- or five-day one.",
    ],
    directAnswerTitle: "In short",
    directAnswer:
      "The best-value day to take off is Tuesday **7 December**. It connects the weekend with the public holidays on 6 and 8 December, creating five consecutive days off from one day of leave.",

    keyFactsTitle: "Key facts",
    keyFacts: [
      { label: "Year", value: "2027" },
      { label: "Catalonia-wide holidays", value: "12" },
      { label: "Local holidays", value: "2 per municipality" },
      { label: "Best one-day bridge", value: "7 December" },
      { label: "Aran exception", value: "Yes — 29 March is replaced" },
      { label: "Last verified", value: "30 October 2026" },
    ],

    tableTitle: "Official Catalonia public holidays in 2027",
    tableIntro: ["The official calendar lists these twelve dates:"],
    tableCaption: "Public holidays in Catalonia, 2027",
    tableHeaders: ["Date", "Day", "Holiday"],
    tableNote:
      "Source: Order EMT/52/2026 of 25 March (DOGC, 1 April 2026), also listed in the BOE of 13 October 2026. Each municipality adds two local holidays on top of these.",

    nationalTitle: "Which holidays are national and which only Catalan?",
    national: [
      "Nine of the twelve are common to the whole of Spain in 2027: 1 and 6 January, Good Friday (26 March), 1 May, 12 October, 1 November, and 6, 8 and 25 December. The other three are Catalonia's own: Easter Monday (29 March), Sant Joan (24 June) and the Diada, Catalonia's national day (11 September).",
      "**Maundy Thursday** (25 March 2027) is a holiday in most of Spain, but **not in Catalonia**. 15 August and 26 December, holidays here in 2026, fall on a Sunday in 2027 and are not part of the Catalan calendar.",
      "Source: Resolution of 8 October 2026 of the Directorate-General for Labour publishing the 2027 list of public holidays (BOE, 13 October 2026).",
    ],

    saturdayTitle: "Which holidays fall on a Saturday?",
    saturday: [
      "Three of the twelve fall on a Saturday in 2027: 1 May, 11 September and 25 December.",
      "For someone on a conventional Monday-to-Friday schedule, these do not by themselves add another weekday off. Actual working calendars differ depending on shifts, collective agreements and employer arrangements.",
    ],

    bridgesTitle: "The best long weekends in 2027",
    bridgesIntro: [
      "Everything below assumes a conventional Monday-to-Friday working week. It is not a universal rule: shifts, collective agreements and company calendars can change it entirely.",
      "If it is this year's December bridge you are after, in 2026 Catalonia's only holiday that week is Tuesday 8 December, as explained in [December 2026 public holidays in Catalonia](/en/guides/december-long-weekend-catalonia/).",
    ],

    efficiencyTitle: "Which days of leave go furthest",
    efficiencyCaption: "What each day of leave buys",
    efficiencyHeaders: ["Leave used", "Days to book", "Consecutive days off"],
    efficiencyNone: efficiencyLabels.en.none,
    efficiencyDays: efficiencyLabels.en.day,
    efficiencyResult: efficiencyLabels.en.result,
    efficiencyNote:
      "CatalunyaInfo editorial calculations based on the official calendar, assuming a Monday-to-Friday week. They are not a substitute for your employer's working calendar or collective agreement, and booking a day of leave is not the same as having it approved.",

    barcelonaTitle: "Barcelona public holidays 2027: the two local days",
    barcelona: [
      "The twelve Catalonia-wide dates are not the whole calendar: every municipality adds two local holidays. Barcelona has officially approved its two, so the city has fourteen public (bank) holidays in 2027.",
      "Both fall on a Monday or a Friday, creating natural three-day weekends for many Monday-to-Friday workers.",
      "If you work elsewhere in Catalonia, check the two local holidays set by that municipality in [local holidays in Catalonia](/en/guides/local-holidays-catalonia/). We do not guess at them.",
    ],

    aranTitle: "The Aran exception",
    aran: [
      "The calendar works differently in Aran. **29 March**, Easter Monday, is **replaced** by **17 June**, the Festa d'Aran, which falls on a Thursday in 2027.",
      "It is a substitution, not an extra holiday. Some of the combinations above therefore do not apply in the same way there.",
    ],

    easterTitle: "Easter 2027 in Catalonia: which days are holidays",
    easterIntro:
      "Good Friday and Easter Monday are public holidays in Catalonia, so with the weekend they make four days off in a row. Maundy Thursday, a holiday in most of Spain, is a working day here. Whit Monday (Pasqua Granada), seven weeks later, is only a local holiday in the towns that choose it, such as Barcelona.",
    easterHeaders: ["Date", "Day", "What it is", "Public holiday?"],
    easterNames: { maundy: "Maundy Thursday", sunday: "Easter Sunday" },
    easterStatus: {
      maundy: "Not in Catalonia (it is in most of Spain)",
      holiday: "Yes, across Catalonia",
      exceptAran: "Yes, across Catalonia except Aran",
      sunday: "Sunday",
      barcelona: "Local holiday in Barcelona, not Catalonia-wide",
    },
    easterSchool:
      "School Easter holidays run from {from} to {to}, both included (Order EDF/66/2026): the whole year is in the [Catalonia school calendar 2026-2027](/en/guides/catalonia-school-calendar/).",

    localTitle: "Local holidays in 2027: when they are published",
    local: [
      "On top of the twelve, each town has two local holidays, set by an order of the Catalan labour department on the town councils' proposals. The 2027 ones are not out yet: on 30 October 2026 the Catalan government's open data had none. The 2026 ones were published in the DOGC on 17 December 2025 (Order EMT/208/2025).",
      "Until then, each town's 2026 local holidays are in [local holidays in Catalonia](/en/guides/local-holidays-catalonia/). We will add the 2027 ones when the order appears.",
    ],

    year2026Title: "Catalonia public holidays 2026",
    year2026Intro:
      "2026 also has twelve Catalonia-wide holidays, set by Order EMT/66/2025. The last ones of the year are {last}. {dec7}, on the other hand, is not a public holiday in Catalonia, only a local holiday in some towns.",
    year2026Note:
      "Source: Order EMT/66/2025 of 30 April (DOGC, 6 May 2025). In Aran, 26 December is replaced by 17 June (Festa d'Aran). Barcelona's 2026 local holidays are {bcn}.",

    schoolLine:
      "If you have school-age children, school holidays do not line up with these dates: see the [Catalonia school calendar 2026-2027](/en/guides/catalonia-school-calendar/).",

    calendarTitle: "Add the holidays to your calendar",
    calendarIntro:
      "The file contains only the **twelve official Catalonia-wide holidays**. It does not include local holidays or the suggested days of leave: those are editorial recommendations, not public holidays.",
    calendarDownload: "Download the holidays (.ics)",
    calendarFilename: "catalonia-public-holidays-2027",
    calendarNote: "Dates transcribed from Order EMT/52/2026, checked against the BOE of 13 October and, on 30 October 2026, against the Catalan labour department's calendar.",

    closingTitle: "Save this guide",
    closing: [
      "We will keep this page at the same address and update it if anything official changes, or once the local calendars are complete. There will be no new URL to find next year.",
    ],

    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};
