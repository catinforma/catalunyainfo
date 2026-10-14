import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Barcelona's weather month by month, from AEMET's climate normals.
 *
 * The monthly table is AEMET's Barcelona Aeropuerto (0076) normals exactly
 * as the agency publishes them — period 1981-2010, the only full table on
 * its site (a 1991-2020 one is not online). The city-centre figures are
 * Meteocat's el Raval station, 2010-2025, labelled as such. Records are
 * AEMET's annual extremes as updated on 30 Sep 2026. Checked 12 Oct 2026
 * (research_notes/blog-batch-03/climate.md).
 *
 * Not printed: September and annual sunshine at the airport (AEMET shows no
 * value), any monthly sea temperature (no official monthly average exists for
 * Barcelona) and monthly records (not retrievable).
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Valores climatológicos normales: Barcelona Aeropuerto", url: "https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=0076&k=cat", publisher: "AEMET" },
  { name: "Valores extremos: Barcelona Aeropuerto", url: "https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/efemerides_extremos?w=0&k=cat&datos=det&l=0076", publisher: "AEMET" },
  { name: "Climatologia XEMA: Barcelona - el Raval, 2010-2025", url: "https://static-m.meteo.cat/content/climatologia/xema/X4_2010-2025.pdf", publisher: "Servei Meteorològic de Catalunya" },
  { name: "Atles climàtic de Catalunya 1991-2020", url: "https://www.meteo.cat/wpweb/climatologia/el-clima/atles-climatic/", publisher: "Servei Meteorològic de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/temps-barcelona-mes-a-mes",
    title: "El temps a Barcelona mes a mes: temperatures, pluja i sol",
    seoTitle: "El temps a Barcelona mes a mes: temperatures i pluja",
    seoDescription:
      "Temperatures màximes i mínimes, pluja i hores de sol de cada mes a Barcelona segons l'AEMET: l'agost és el més calorós, l'octubre el més plujós.",
    excerpt:
      "Quin temps fa a Barcelona cada mes, amb les mitjanes oficials de l'AEMET i el que diu el Meteocat del centre de la ciutat.",
  },
  es: {
    path: "guias/tiempo-barcelona-mes-a-mes",
    title: "El tiempo en Barcelona mes a mes: temperaturas, lluvia y sol",
    seoTitle: "El tiempo en Barcelona mes a mes: temperaturas y lluvia",
    seoDescription:
      "Temperaturas máximas y mínimas, lluvia y horas de sol de cada mes en Barcelona según la AEMET: agosto es el más caluroso, octubre el más lluvioso.",
    excerpt:
      "Qué tiempo hace en Barcelona cada mes, con las medias oficiales de la AEMET y lo que dice el Meteocat del centro de la ciudad.",
  },
  en: {
    path: "guides/barcelona-weather-by-month",
    title: "Barcelona weather by month: temperatures, rain and sunshine",
    seoTitle: "Barcelona weather by month: temperatures, rain, sunshine",
    seoDescription:
      "Average highs and lows, rainfall and sunshine for every month in Barcelona from Spain's weather agency, AEMET: August is warmest, October wettest.",
    excerpt:
      "What the weather is like in Barcelona each month, from AEMET's official averages and Meteocat's figures for the city centre.",
  },
};

/** AEMET 0076, 1981-2010: [TM, Tm, R mm, DR days, I hours | null]. */
const NORMALS: [number, number, number, number, number | null][] = [
  [13.6, 4.7, 37, 3.7, 151],
  [14.3, 5.4, 35, 4.0, 163],
  [16.1, 7.4, 36, 4.5, 206],
  [18.0, 9.4, 40, 5.1, 228],
  [21.1, 12.8, 47, 4.7, 250],
  [24.9, 16.8, 30, 3.6, 266],
  [28.0, 19.8, 21, 1.8, 305],
  [28.5, 20.2, 62, 4.5, 278],
  [26.0, 17.4, 81, 5.2, null],
  [22.1, 13.5, 91, 6.3, 182],
  [17.3, 8.6, 59, 5.1, 145],
  [14.3, 5.7, 40, 4.4, 141],
];

const MONTHS: Record<Locale, string[]> = {
  ca: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const fmt = (locale: Locale, value: number) =>
  locale === "en" ? value.toFixed(1) : value.toFixed(1).replace(".", ",");

type T = {
  lead: string;
  note: string;
  tableTitle: string;
  tableCaption: string;
  tableHeaders: string[];
  tableNote: string;
  noValue: string;
  seasonsTitle: string;
  seasons: string[];
  cityTitle: string;
  city: string[];
  recordsTitle: string;
  records: string[];
  seaTitle: string;
  sea: string;
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Barcelona té un clima mediterrani suau: hiverns amb màximes al voltant dels 14 °C i estius amb màximes de 28 °C. L'**agost** és el mes més calorós, el **gener** el més fred i l'**octubre** el més plujós. Aquí tens les mitjanes oficials de cada mes, segons l'AEMET.",
    note: "Les mitjanes mensuals són les de l'estació de l'AEMET a l'aeroport del Prat (1981-2010), la taula completa que publica l'agència. Al centre de la ciutat fa més calor, sobretot de nit.",
    tableTitle: "Mes a mes",
    tableCaption: "Clima de Barcelona per mesos (AEMET, Barcelona Aeroport, 1981-2010)",
    tableHeaders: ["Mes", "Màxima mitjana", "Mínima mitjana", "Pluja", "Dies de pluja", "Hores de sol"],
    tableNote: "Temperatures en °C. Pluja en mm. Dies de pluja: amb 1 mm o més. L'AEMET no dona hores de sol per al setembre.",
    noValue: "—",
    seasonsTitle: "Què esperar cada estació",
    seasons: [
      "**Hivern (desembre-febrer):** màximes mitjanes de 14 °C i mínimes de 5 °C a l'aeroport. Les glaçades hi són rares: unes quatre l'any, i la neu, menys d'un dia l'any de mitjana.",
      "**Primavera (març-maig):** les màximes pugen de 16 a 21 °C, amb unes cinc jornades de pluja al mes.",
      "**Estiu (juny-agost):** màximes de 25 a 28,5 °C i el juliol és el mes més sec (21 mm) i el més assolellat (305 hores de sol). L'agost ja porta tempestes: 62 mm de pluja de mitjana.",
      "**Tardor (setembre-novembre):** és l'època més plujosa. L'octubre suma 91 mm i el setembre, 81, en uns sis dies de pluja.",
    ],
    cityTitle: "Al centre de la ciutat fa més calor",
    city: [
      "L'estació del Meteocat al Raval, al centre, dona mitjanes més altes que l'aeroport: entre el 2010 i el 2025, la mínima mitjana del gener hi va ser de 8,6 °C, i **no hi va haver cap dia de glaçada**.",
      "A l'estiu, les nits hi costen de refrescar: el Raval suma **98 nits tropicals l'any** (mínimes per sobre de 20 °C), gairebé totes de juny a setembre. L'Atles climàtic del Meteocat ho atribueix a l'illa de calor urbana de Barcelona.",
    ],
    recordsTitle: "Rècords",
    records: [
      "Segons l'AEMET, la temperatura més alta registrada a l'aeroport és de **37,7 °C, el 8 de juliol del 2026**, i la més baixa, de **-8,0 °C, el 27 de desembre del 1962**. El dia més plujós va deixar 186,7 mm, el 25 de setembre del 1953.",
      "A l'Observatori Fabra, a 408 metres d'altitud al vessant de Collserola, el màxim és de 40,9 °C, també del 8 de juliol del 2026.",
    ],
    seaTitle: "I la temperatura de l'aigua?",
    sea: "No hi ha una mitjana oficial mes a mes de la temperatura del mar a Barcelona. La boia de Ports de l'Estat davant de Barcelona en dona la lectura del moment al portal PORTUS, i la pàgina de cada platja a barcelona.cat informa de l'estat del mar.",
    faq: [
      { question: "Quin és el mes més calorós a Barcelona?", answer: "L'agost, amb una màxima mitjana de 28,5 °C i una mitjana de 24,4 °C a l'estació de l'aeroport (AEMET, 1981-2010). El juliol el segueix de prop." },
      { question: "Quin és el mes més plujós a Barcelona?", answer: "L'octubre, amb 91 mm de mitjana, seguit del setembre amb 81 mm. El juliol és el més sec, amb 21 mm." },
      { question: "Neva a Barcelona?", answer: "Molt poc: l'AEMET compta 0,4 dies de neu l'any de mitjana a l'aeroport." },
      { question: "Quin temps fa a Barcelona al novembre?", answer: "Màximes mitjanes de 17,3 °C i mínimes de 8,6 °C, amb 59 mm de pluja en uns cinc dies, segons l'AEMET." },
    ],
  },
  es: {
    lead: "Barcelona tiene un clima mediterráneo suave: inviernos con máximas en torno a los 14 °C y veranos con máximas de 28 °C. **Agosto** es el mes más caluroso, **enero** el más frío y **octubre** el más lluvioso. Aquí tienes las medias oficiales de cada mes, según la AEMET.",
    note: "Las medias mensuales son las de la estación de la AEMET en el aeropuerto de El Prat (1981-2010), la tabla completa que publica la agencia. En el centro de la ciudad hace más calor, sobre todo de noche.",
    tableTitle: "Mes a mes",
    tableCaption: "Clima de Barcelona por meses (AEMET, Barcelona Aeropuerto, 1981-2010)",
    tableHeaders: ["Mes", "Máxima media", "Mínima media", "Lluvia", "Días de lluvia", "Horas de sol"],
    tableNote: "Temperaturas en °C. Lluvia en mm. Días de lluvia: con 1 mm o más. La AEMET no da horas de sol para septiembre.",
    noValue: "—",
    seasonsTitle: "Qué esperar cada estación",
    seasons: [
      "**Invierno (diciembre-febrero):** máximas medias de 14 °C y mínimas de 5 °C en el aeropuerto. Las heladas son raras: unas cuatro al año, y la nieve, menos de un día al año de media.",
      "**Primavera (marzo-mayo):** las máximas suben de 16 a 21 °C, con unas cinco jornadas de lluvia al mes.",
      "**Verano (junio-agosto):** máximas de 25 a 28,5 °C y julio es el mes más seco (21 mm) y el más soleado (305 horas de sol). Agosto ya trae tormentas: 62 mm de lluvia de media.",
      "**Otoño (septiembre-noviembre):** es la época más lluviosa. Octubre suma 91 mm y septiembre, 81, en unos seis días de lluvia.",
    ],
    cityTitle: "En el centro de la ciudad hace más calor",
    city: [
      "La estación del Meteocat en el Raval, en el centro, da medias más altas que el aeropuerto: entre 2010 y 2025, la mínima media de enero fue de 8,6 °C, y **no hubo ningún día de helada**.",
      "En verano, las noches cuestan de refrescar: el Raval suma **98 noches tropicales al año** (mínimas por encima de 20 °C), casi todas de junio a septiembre. El Atles climàtic del Meteocat lo atribuye a la isla de calor urbana de Barcelona.",
    ],
    recordsTitle: "Récords",
    records: [
      "Según la AEMET, la temperatura más alta registrada en el aeropuerto es de **37,7 °C, el 8 de julio de 2026**, y la más baja, de **-8,0 °C, el 27 de diciembre de 1962**. El día más lluvioso dejó 186,7 mm, el 25 de septiembre de 1953.",
      "En el Observatori Fabra, a 408 metros de altitud en la ladera de Collserola, el máximo es de 40,9 °C, también del 8 de julio de 2026.",
    ],
    seaTitle: "¿Y la temperatura del agua?",
    sea: "No existe una media oficial mes a mes de la temperatura del mar en Barcelona. La boya de Puertos del Estado frente a Barcelona da la lectura del momento en el portal PORTUS, y la página de cada playa en barcelona.cat informa del estado del mar.",
    faq: [
      { question: "¿Cuál es el mes más caluroso en Barcelona?", answer: "Agosto, con una máxima media de 28,5 °C y una media de 24,4 °C en la estación del aeropuerto (AEMET, 1981-2010). Julio le sigue de cerca." },
      { question: "¿Cuál es el mes más lluvioso en Barcelona?", answer: "Octubre, con 91 mm de media, seguido de septiembre con 81 mm. Julio es el más seco, con 21 mm." },
      { question: "¿Nieva en Barcelona?", answer: "Muy poco: la AEMET cuenta 0,4 días de nieve al año de media en el aeropuerto." },
      { question: "¿Qué tiempo hace en Barcelona en noviembre?", answer: "Máximas medias de 17,3 °C y mínimas de 8,6 °C, con 59 mm de lluvia en unos cinco días, según la AEMET." },
    ],
  },
  en: {
    lead: "Barcelona has a mild Mediterranean climate: winters with highs around 14 °C and summers with highs of 28 °C. **August** is the warmest month, **January** the coldest and **October** the wettest. Here are the official averages for every month from AEMET, Spain's weather agency.",
    note: "The monthly averages are from AEMET's station at El Prat airport (1981-2010), the full table the agency publishes. The city centre is warmer, especially at night.",
    tableTitle: "Month by month",
    tableCaption: "Barcelona climate by month (AEMET, Barcelona airport, 1981-2010)",
    tableHeaders: ["Month", "Average high", "Average low", "Rain", "Rain days", "Sunshine hours"],
    tableNote: "Temperatures in °C. Rain in mm. Rain days: 1 mm or more. AEMET gives no sunshine figure for September.",
    noValue: "—",
    seasonsTitle: "What to expect each season",
    seasons: [
      "**Winter (December-February):** average highs of 14 °C and lows of 5 °C at the airport. Frost is rare, about four days a year, and snow less than one day a year on average.",
      "**Spring (March-May):** highs climb from 16 to 21 °C, with about five rainy days a month.",
      "**Summer (June-August):** highs of 25 to 28.5 °C; July is the driest month (21 mm) and the sunniest (305 hours). August brings storms: 62 mm of rain on average.",
      "**Autumn (September-November):** the wettest season. October averages 91 mm and September 81, over about six rainy days.",
    ],
    cityTitle: "The city centre is warmer",
    city: [
      "Meteocat's station in el Raval, in the centre, records higher averages than the airport: between 2010 and 2025 its average January low was 8.6 °C, and **it had no frost at all**.",
      "In summer, nights are slow to cool down: el Raval averages **98 tropical nights a year** (lows above 20 °C), almost all from June to September. Meteocat's climate atlas puts it down to Barcelona's urban heat island.",
    ],
    recordsTitle: "Records",
    records: [
      "According to AEMET, the highest temperature recorded at the airport is **37.7 °C on 8 July 2026**, and the lowest **-8.0 °C on 27 December 1962**. The wettest day brought 186.7 mm, on 25 September 1953.",
      "At the Fabra Observatory, 408 metres up the Collserola hillside, the record is 40.9 °C, also on 8 July 2026.",
    ],
    seaTitle: "What about the sea temperature?",
    sea: "There is no official month-by-month average for the sea temperature in Barcelona. Puertos del Estado's buoy off Barcelona gives the current reading on its PORTUS portal, and each beach page on barcelona.cat reports the sea conditions.",
    faq: [
      { question: "What is the hottest month in Barcelona?", answer: "August, with an average high of 28.5 °C and a mean of 24.4 °C at the airport station (AEMET, 1981-2010). July is close behind." },
      { question: "What is the rainiest month in Barcelona?", answer: "October, with 91 mm on average, followed by September with 81 mm. July is the driest, with 21 mm." },
      { question: "Does it snow in Barcelona?", answer: "Hardly ever: AEMET counts 0.4 snow days a year on average at the airport." },
      { question: "What is the weather like in Barcelona in November?", answer: "Average highs of 17.3 °C and lows of 8.6 °C, with 59 mm of rain over about five days, according to AEMET." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  const rows = NORMALS.map(([high, low, rain, days, sun], i) => [
    MONTHS[locale][i] ?? "",
    fmt(locale, high),
    fmt(locale, low),
    String(rain),
    fmt(locale, days),
    sun === null ? t.noValue : String(sun),
  ]);
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.tableTitle),
    table(t.tableCaption, t.tableHeaders, rows, t.tableNote),
    ...h2(t.seasonsTitle),
    list(...t.seasons),
    ...h2(t.cityTitle, ...t.city),
    ...h2(t.recordsTitle, ...t.records),
    ...h2(t.seaTitle, t.sea),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "beaches", "museums", "snow"], locale),
  ];
}

export const CLIMATE: B2Article = {
  key: "climate",
  entryKey: "guide-barcelona-weather-by-month",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "clima-rambla-sol-hivern",
  heroAlt: {
    ca: "La Rambla de Barcelona un dia assolellat de gener, amb gent amb abric i els plàtans sense fulles",
    es: "La Rambla de Barcelona un día soleado de enero, con gente con abrigo y los plátanos sin hojas",
    en: "La Rambla in Barcelona on a sunny January day, people in coats under bare plane trees",
  },
  heroCaption: {
    ca: "La Rambla, un dia de sol de gener.",
    es: "La Rambla, un día de sol de enero.",
    en: "La Rambla on a sunny January day.",
  },
  secondaryKey: "clima-pluja-barcelona",
  secondaryAlt: {
    ca: "Una plaça mullada per la pluja a Barcelona, amb una persona amb paraigua i pins",
    es: "Una plaza mojada por la lluvia en Barcelona, con una persona con paraguas y pinos",
    en: "A rain-soaked square in Barcelona, with a person holding an umbrella and pine trees",
  },
  secondaryCaption: {
    ca: "Pluja a Barcelona.",
    es: "Lluvia en Barcelona.",
    en: "Rain in Barcelona.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-14T13:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CLIMATE_META };
