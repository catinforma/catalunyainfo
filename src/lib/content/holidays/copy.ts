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
    seoTitle: "Calendari laboral 2027 Catalunya: festius i ponts",
    seoDescription:
      "Tots els festius laborals del 2027 a Catalunya, els millors ponts i quins dies demanar de vacances per aconseguir més dies lliures.",
    excerpt:
      "Els 12 festius oficials del 2027, els ponts que deixa el calendari i quins dies de vacances rendeixen més. Amb descàrrega per al teu calendari.",

    lead: [
      "El calendari laboral de Catalunya per al 2027 ja és oficial. Hi haurà 12 festius fixats per la Generalitat, als quals cada ajuntament podrà afegir dues festes locals.",
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
      { label: "Última verificació", value: "24 de setembre de 2026" },
    ],

    tableTitle: "Tots els festius laborals de Catalunya el 2027",
    tableIntro: [
      "El calendari oficial fixa aquestes dotze dates:",
    ],
    tableCaption: "Festius laborals a Catalunya, 2027",
    tableHeaders: ["Data", "Dia", "Festiu"],
    tableNote:
      "Font: Ordre EMT/52/2026, de 25 de març (DOGC 9637, 1 d'abril de 2026). A aquests dies cal afegir-hi dues festes locals que determina cada ajuntament.",

    saturdayTitle: "Quins festius cauen en dissabte?",
    saturday: [
      "El 2027 hi ha tres dels dotze festius generals que cauen en dissabte: l'1 de maig, l'11 de setembre i el 25 de desembre.",
      "Per a una persona amb jornada ordinària de dilluns a divendres, aquestes dates no generen per si soles un dia laborable addicional de descans. La situació concreta pot variar segons el calendari laboral, els torns i el conveni aplicable.",
    ],

    bridgesTitle: "Els millors ponts del 2027",
    bridgesIntro: [
      "Tot el que ve a continuació pressuposa una setmana laboral habitual de dilluns a divendres. No és una regla universal: torns, convenis i calendaris d'empresa poden canviar-ho del tot.",
    ],

    efficiencyTitle: "Quins dies val més la pena demanar?",
    efficiencyCaption: "Rendiment de cada dia de vacances",
    efficiencyHeaders: ["Vacances", "Dies que demanes", "Descans total"],
    efficiencyNone: efficiencyLabels.ca.none,
    efficiencyDays: efficiencyLabels.ca.day,
    efficiencyResult: efficiencyLabels.ca.result,
    efficiencyNote:
      "Càlcul editorial de CatalunyaInfo sobre el calendari oficial, per a una setmana de dilluns a divendres. No substitueix el calendari laboral de cada empresa ni el conveni aplicable, i demanar un dia de vacances no vol dir que estigui concedit.",

    barcelonaTitle: "Festes locals de Barcelona el 2027",
    barcelona: [
      "Els dotze festius generals no són tot el calendari: cada municipi hi afegeix dues festes locals. A Barcelona, l'Ajuntament ja les ha fixades oficialment.",
      "Totes dues cauen en dilluns o divendres, de manera que creen directament caps de setmana de tres dies per a moltes persones amb jornada de dilluns a divendres.",
      "Si treballes en un altre municipi, consulta els dos festius locals corresponents: no els donem per suposats.",
    ],

    aranTitle: "L'excepció d'Aran",
    aran: [
      "Al territori d'Aran el calendari és lleugerament diferent. El **29 de març**, Dilluns de Pasqua Florida, queda **substituït** pel **17 de juny**, Festa d'Aran, que el 2027 cau en dijous.",
      "No és un festiu addicional: és un canvi. Per tant, els càlculs de ponts relacionats amb aquestes dues dates no s'apliquen igual al territori aranès.",
    ],

    calendarTitle: "Afegeix els festius al teu calendari",
    calendarIntro:
      "El fitxer conté només els **dotze festius oficials de Catalunya**. No inclou ni les festes locals ni els dies de vacances suggerits: aquests són recomanacions editorials, no festius.",
    calendarDownload: "Descarrega els festius (.ics)",
    calendarFilename: "festius-catalunya-2027",
    calendarNote: "Dates transcrites de l'Ordre EMT/52/2026, verificades el 24 de setembre de 2026.",

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
    seoTitle: "Calendario laboral 2027 Cataluña: festivos y puentes",
    seoDescription:
      "Todos los festivos de 2027 en Cataluña, los mejores puentes y qué días pedir de vacaciones para conseguir más días libres.",
    excerpt:
      "Los 12 festivos oficiales de 2027, los puentes que deja el calendario y qué días de vacaciones rinden más. Con descarga para tu calendario.",

    lead: [
      "El calendario laboral de Cataluña para 2027 ya es oficial. La Generalitat ha fijado 12 días festivos, a los que cada ayuntamiento puede añadir dos fiestas locales.",
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
      { label: "Última verificación", value: "24 de septiembre de 2026" },
    ],

    tableTitle: "Festivos oficiales en Cataluña en 2027",
    tableIntro: ["La Generalitat establece estas doce fechas:"],
    tableCaption: "Festivos laborales en Cataluña, 2027",
    tableHeaders: ["Fecha", "Día", "Festivo"],
    tableNote:
      "Fuente: Orden EMT/52/2026, de 25 de marzo (DOGC 9637, 1 de abril de 2026). A estas fechas se suman dos festivos locales determinados por cada ayuntamiento.",

    saturdayTitle: "Festivos que caen en sábado",
    saturday: [
      "Tres de los doce festivos generales caen en sábado: el 1 de mayo, el 11 de septiembre y el 25 de diciembre.",
      "Para una persona con horario habitual de lunes a viernes, estas fechas no generan por sí solas otro día laborable libre. El resultado concreto puede variar según jornada, turnos, calendario de empresa o convenio.",
    ],

    bridgesTitle: "Los mejores puentes de 2027",
    bridgesIntro: [
      "Todo lo que sigue presupone una semana laboral habitual de lunes a viernes. No es una regla universal: turnos, convenios y calendarios de empresa pueden cambiarlo por completo.",
    ],

    efficiencyTitle: "Qué días sale más a cuenta pedir",
    efficiencyCaption: "Rendimiento de cada día de vacaciones",
    efficiencyHeaders: ["Vacaciones", "Días solicitados", "Descanso resultante"],
    efficiencyNone: efficiencyLabels.es.none,
    efficiencyDays: efficiencyLabels.es.day,
    efficiencyResult: efficiencyLabels.es.result,
    efficiencyNote:
      "Cálculo editorial de CatalunyaInfo sobre las fechas oficiales, para una semana laboral de lunes a viernes. No sustituye el calendario laboral de cada empresa ni el convenio aplicable, y pedir un día de vacaciones no significa tenerlo concedido.",

    barcelonaTitle: "Festivos locales de Barcelona en 2027",
    barcelona: [
      "Los doce festivos generales no son todo el calendario: cada municipio añade dos fiestas locales. Barcelona ya ha aprobado oficialmente las suyas.",
      "Ambas crean fines de semana de tres días para una jornada convencional de lunes a viernes.",
      "En el resto de municipios deben consultarse las dos fiestas locales correspondientes: no las damos por supuestas.",
    ],

    aranTitle: "La excepción de Arán",
    aran: [
      "En Arán el calendario es ligeramente distinto. El **29 de marzo**, Lunes de Pascua Florida, queda **sustituido** por el **17 de junio**, Festa d'Aran, que en 2027 cae en jueves.",
      "No es un festivo adicional: es un cambio. Por tanto, algunos de los cálculos anteriores no se aplican igual en este territorio.",
    ],

    calendarTitle: "Añade los festivos a tu calendario",
    calendarIntro:
      "El archivo contiene únicamente los **doce festivos oficiales de Cataluña**. No incluye fiestas locales ni los días de vacaciones sugeridos: eso son recomendaciones editoriales, no festivos.",
    calendarDownload: "Descargar los festivos (.ics)",
    calendarFilename: "festivos-cataluna-2027",
    calendarNote: "Fechas transcritas de la Orden EMT/52/2026, verificadas el 24 de septiembre de 2026.",

    closingTitle: "Guarda esta guía",
    closing: [
      "Mantendremos esta página en la misma dirección y la actualizaremos si hay cualquier modificación oficial o cuando se completen los calendarios locales. No habrá que buscar una URL nueva el año que viene.",
    ],

    weekdays: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  },

  en: {
    path: "guides/catalonia-public-holidays",
    title: "Catalonia public holidays 2027: official dates, long weekends and days to take off",
    seoTitle: "Catalonia public holidays 2027: dates & long weekends",
    seoDescription:
      "Official Catalonia public holidays for 2027, plus Barcelona's local holidays and the best days to take off to create longer breaks.",
    excerpt:
      "The 12 official 2027 holidays, the long weekends the calendar creates, and which days of leave go furthest. With a calendar file to download.",

    lead: [
      "Catalonia's official 2027 public holiday calendar has been published. It sets 12 holidays for Catalonia, and each municipality adds two local holidays of its own.",
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
      { label: "Last verified", value: "24 September 2026" },
    ],

    tableTitle: "Official Catalonia public holidays in 2027",
    tableIntro: ["The official calendar lists these twelve dates:"],
    tableCaption: "Public holidays in Catalonia, 2027",
    tableHeaders: ["Date", "Day", "Holiday"],
    tableNote:
      "Source: Order EMT/52/2026 of 25 March (DOGC 9637, 1 April 2026). Each municipality adds two local holidays on top of these.",

    saturdayTitle: "Which holidays fall on a Saturday?",
    saturday: [
      "Three of the twelve fall on a Saturday in 2027: 1 May, 11 September and 25 December.",
      "For someone on a conventional Monday-to-Friday schedule, these do not by themselves add another weekday off. Actual working calendars differ depending on shifts, collective agreements and employer arrangements.",
    ],

    bridgesTitle: "The best long weekends in 2027",
    bridgesIntro: [
      "Everything below assumes a conventional Monday-to-Friday working week. It is not a universal rule: shifts, collective agreements and company calendars can change it entirely.",
    ],

    efficiencyTitle: "Which days of leave go furthest",
    efficiencyCaption: "What each day of leave buys",
    efficiencyHeaders: ["Leave used", "Days to book", "Consecutive days off"],
    efficiencyNone: efficiencyLabels.en.none,
    efficiencyDays: efficiencyLabels.en.day,
    efficiencyResult: efficiencyLabels.en.result,
    efficiencyNote:
      "CatalunyaInfo editorial calculations based on the official calendar, assuming a Monday-to-Friday week. They are not a substitute for your employer's working calendar or collective agreement, and booking a day of leave is not the same as having it approved.",

    barcelonaTitle: "Barcelona's local holidays in 2027",
    barcelona: [
      "The twelve Catalonia-wide dates are not the whole calendar: every municipality adds two local holidays. Barcelona has officially approved its two.",
      "Both fall on a Monday or a Friday, creating natural three-day weekends for many Monday-to-Friday workers.",
      "If you work elsewhere in Catalonia, check the two local holidays set by that municipality. We do not guess at them.",
    ],

    aranTitle: "The Aran exception",
    aran: [
      "The calendar works differently in Aran. **29 March**, Easter Monday, is **replaced** by **17 June**, the Festa d'Aran, which falls on a Thursday in 2027.",
      "It is a substitution, not an extra holiday. Some of the combinations above therefore do not apply in the same way there.",
    ],

    calendarTitle: "Add the holidays to your calendar",
    calendarIntro:
      "The file contains only the **twelve official Catalonia-wide holidays**. It does not include local holidays or the suggested days of leave: those are editorial recommendations, not public holidays.",
    calendarDownload: "Download the holidays (.ics)",
    calendarFilename: "catalonia-public-holidays-2027",
    calendarNote: "Dates transcribed from Order EMT/52/2026, verified on 24 September 2026.",

    closingTitle: "Save this guide",
    closing: [
      "We will keep this page at the same address and update it if anything official changes, or once the local calendars are complete. There will be no new URL to find next year.",
    ],

    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};
