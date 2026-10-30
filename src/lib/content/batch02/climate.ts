import { link as featureLink } from "@/lib/content/features/shared";
import type { Locale } from "@/lib/i18n/config";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";

import {
  b2Related,
  callout,
  faq,
  h2,
  h3,
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
 * as the agency publishes them — period 1981-2010. Re-checked on 28 Oct 2026:
 * the station page still reads "Periodo: 1981-2010" and AEMET's help page for
 * its normals says they correspond "al periodo de referencia 1981-2010"; a
 * 1991-2020 station table is not on its website (OpenData needs a key and was
 * not used), and Meteocat says its 1991-2020 climatologies are still being
 * prepared ("s'està treballant en l'elaboració"). So the page says 1981-2010
 * and never calls anything 1991-2020.
 *
 * The city-centre table is Meteocat's el Raval station sheet, 2010-2025
 * (version 22/6/2026, re-read 28 Oct 2026). Records are AEMET's absolute
 * extremes at the airport, read month by month on 28 Oct 2026 (page updated
 * 30 Sep 2026; temperature series 1924-2026). The Fabra record is Meteocat's
 * summer 2026 bulletin (published 19 Oct 2026), which gives 40.9 °C in the
 * 6-9 July heat wave but no day, so no day is printed. The start of winter is
 * IGN's (astronomia.ign.es).
 *
 * Not printed: September and annual sunshine at the airport (AEMET shows no
 * value), any monthly sea temperature (no official monthly average exists for
 * Barcelona), and AEMET's 1991-2020 rainfall reproduced by the MAPA yearbook
 * (its February column is a misprint).
 */

// 30 Oct 2026: AEMET 0076 normals re-read (same values, still "Periodo:
// 1981-2010"); relative humidity added from the same table. Records, the
// Raval sheet and IGN as read on 28 Oct (historical values).
const VERIFIED = "2026-10-30";

const SOURCES: B2Source[] = [
  { name: "Valores climatológicos normales: Barcelona Aeropuerto", url: "https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=0076&k=cat", publisher: "AEMET" },
  { name: "Valores climatológicos normales: interpretación (periodo 1981-2010)", url: "https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos/ayuda", publisher: "AEMET" },
  { name: "Valores extremos: Barcelona Aeropuerto", url: "https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/efemerides_extremos?w=0&k=cat&datos=det&l=0076", publisher: "AEMET" },
  { name: "Climatologia XEMA: Barcelona - el Raval, 2010-2025", url: "https://static-m.meteo.cat/content/climatologia/xema/X4_2010-2025.pdf", publisher: "Servei Meteorològic de Catalunya" },
  { name: "Climatologies comarcals (1991-2020 en elaboració)", url: "https://www.meteo.cat/wpweb/climatologia/el-clima/climatologies-comarcals/", publisher: "Servei Meteorològic de Catalunya" },
  { name: "Atles climàtic de Catalunya 1991-2020", url: "https://www.meteo.cat/wpweb/climatologia/el-clima/atles-climatic/", publisher: "Servei Meteorològic de Catalunya" },
  { name: "Butlletí climàtic de l'estiu del 2026", url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-estacional/", publisher: "Servei Meteorològic de Catalunya" },
  { name: "Start of winter 2026-2027", url: "https://astronomia.ign.es/en/inicio-estaciones/invierno", publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/temps-barcelona-mes-a-mes",
    title: "El temps a Barcelona mes a mes: temperatures, pluja i sol",
    seoTitle: "Temps i clima a Barcelona mes a mes: temperatures i pluja",
    seoDescription:
      "Gener, el mes més fred a Barcelona (13,6 °C de màxima, 4,7 °C de mínima); octubre, el més plujós (91 mm). Mitjanes AEMET, el centre i rècords de cada mes.",
    excerpt:
      "Quin temps fa a Barcelona cada mes, amb les mitjanes oficials de l'AEMET, les del centre de la ciutat segons el Meteocat i els rècords de cada mes.",
  },
  es: {
    path: "guias/tiempo-barcelona-mes-a-mes",
    title: "El tiempo en Barcelona mes a mes: clima, temperaturas y lluvia",
    seoTitle: "Clima y tiempo en Barcelona por meses: temperatura y lluvia",
    seoDescription:
      "Enero, el mes más frío en Barcelona (13,6 °C de máxima, 4,7 °C de mínima); octubre, el más lluvioso (91 mm). Medias AEMET, el centro y récords de cada mes.",
    excerpt:
      "Qué tiempo hace en Barcelona cada mes, con las medias oficiales de la AEMET, las del centro de la ciudad según el Meteocat y los récords de cada mes.",
  },
  en: {
    path: "guides/barcelona-weather-by-month",
    title: "Barcelona weather and temperature by month (°C and °F)",
    seoTitle: "Barcelona weather and temperature by month (°C and °F)",
    seoDescription:
      "Coldest: January, highs of 13.6 °C (56 °F), lows of 4.7 °C (40 °F). Warmest: August, 28.5 °C (83 °F). Wettest: October, 91 mm. AEMET monthly averages.",
    excerpt:
      "What the weather is like in Barcelona each month, from AEMET's official averages and Meteocat's figures for the city centre.",
  },
};

/** AEMET 0076, 1981-2010: [T mean, TM, Tm, R mm, DR days, I hours | null]. */
const NORMALS: [number, number, number, number, number, number | null][] = [
  [9.2, 13.6, 4.7, 37, 3.7, 151],
  [9.9, 14.3, 5.4, 35, 4.0, 163],
  [11.8, 16.1, 7.4, 36, 4.5, 206],
  [13.7, 18.0, 9.4, 40, 5.1, 228],
  [16.9, 21.1, 12.8, 47, 4.7, 250],
  [20.9, 24.9, 16.8, 30, 3.6, 266],
  [23.9, 28.0, 19.8, 21, 1.8, 305],
  [24.4, 28.5, 20.2, 62, 4.5, 278],
  [21.7, 26.0, 17.4, 81, 5.2, null],
  [17.8, 22.1, 13.5, 91, 6.3, 182],
  [13.0, 17.3, 8.6, 59, 5.1, 145],
  [10.0, 14.3, 5.7, 40, 4.4, 141],
];
/** AEMET 0076's "Año" row; sunshine is "-" for the year. */
const YEAR: [number, number, number, number, number] = [16.1, 20.3, 11.8, 588, 53.3];
/** AEMET 0076, 1981-2010: mean relative humidity (%) per month, then the year (column H). */
const HUMIDITY = [70, 70, 70, 69, 70, 68, 67, 68, 70, 73, 71, 69] as const;
const HUMIDITY_YEAR = 69;

/** °C to whole °F, for the English edition: a unit conversion, not a new figure. */
const toF = (celsius: number) => Math.round((celsius * 9) / 5 + 32);
/** "13.6 (56)": the English table cell, °C first. */
const cf = (celsius: number) => `${celsius.toFixed(1)} (${toF(celsius)})`;

/** Meteocat, Barcelona - el Raval (X4), 2010-2025: [TXm, TNm, PPT mm, tropical nights]. */
const RAVAL: [number, number, number, number][] = [
  [14.9, 8.6, 31.8, 0.0],
  [15.5, 9.0, 31.9, 0.0],
  [17.1, 10.7, 70.6, 0.0],
  [19.3, 13.0, 55.4, 0.0],
  [22.6, 16.0, 51.3, 0.9],
  [26.9, 20.5, 25.0, 17.8],
  [29.2, 23.3, 36.4, 28.8],
  [29.5, 23.6, 35.4, 29.2],
  [26.4, 20.5, 77.9, 17.4],
  [23.2, 17.2, 76.9, 4.1],
  [18.6, 12.4, 64.7, 0.0],
  [16.0, 9.8, 29.3, 0.0],
];
/** The Raval sheet's "ANY" column: [TXm, TNm, PPT, tropical nights, TMm]. */
const RAVAL_YEAR: [number, number, number, number, number] = [21.6, 15.4, 586.5, 98.3, 18.2];

/**
 * AEMET 0076 absolute extremes per month (series 1924-2026, updated 30 Sep
 * 2026): [highest °C, [d, m, y], lowest °C, [d, m, y]].
 */
type Day = [number, number, number];
const RECORDS: [number, Day, number, Day][] = [
  [23.8, [21, 1, 2018], -7.2, [16, 1, 1985]],
  [24.5, [27, 2, 1990], -6.6, [11, 2, 1956]],
  [27.5, [14, 3, 1926], -1.4, [1, 3, 1988]],
  [26.5, [1, 4, 1926], 0.1, [12, 4, 1973]],
  [32.0, [30, 5, 1926], 3.0, [2, 5, 1945]],
  [35.0, [29, 6, 2019], 7.8, [7, 6, 1984]],
  [37.7, [8, 7, 2026], 11.4, [9, 7, 1978]],
  [37.4, [27, 8, 2010], 9.5, [7, 8, 1944]],
  [34.0, [17, 9, 1926], 7.6, [30, 9, 1974]],
  [30.4, [10, 10, 1997], 3.8, [30, 10, 2008]],
  [27.0, [2, 11, 1927], -1.4, [20, 11, 1985]],
  [27.0, [31, 12, 1925], -8.0, [27, 12, 1962]],
];

const MONTHS: Record<Locale, string[]> = {
  ca: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const fmt = (locale: Locale, value: number) =>
  locale === "en" ? value.toFixed(1) : value.toFixed(1).replace(".", ",");

/** "el 21 de gener del 2018", "l'1 de març del 1988" / "el 21 de enero de 2018" / "on 21 January 2018". */
function onDay(locale: Locale, [d, m, y]: Day): string {
  const month = (MONTHS[locale][m - 1] ?? "").toLowerCase();
  if (locale === "en") return `on ${d} ${MONTHS.en[m - 1]} ${y}`;
  if (locale === "es") return `el ${d} de ${month} de ${y}`;
  const article = d === 1 || d === 11 ? "l'" : "el ";
  return `${article}${d} ${/^[ao]/.test(month) ? "d'" : "de "}${month} del ${y}`;
}

/** Heading for each month: "Barcelona al gener" / "Barcelona en enero" / "Barcelona in January". */
function monthHeading(locale: Locale, i: number): string {
  const month = MONTHS[locale][i] ?? "";
  if (locale === "en") return `Barcelona in ${month}`;
  if (locale === "es") return `Barcelona en ${month.toLowerCase()}`;
  const lower = month.toLowerCase();
  return `Barcelona ${/^[ao]/.test(lower) ? "a l'" : "al "}${lower}`;
}

/** What singles a month out, read straight off the two tables. */
const MONTH_NOTE: Record<Locale, (string | null)[]> = {
  ca: ["És el mes més fred.", null, null, null, null, "Les nits tropicals es tornen habituals al centre.", "És el mes més sec i el més assolellat.", "És el mes més calorós i, amb el setembre, el de més dies de tempesta.", "És el segon mes més plujós.", "És el mes més plujós.", "Les temperatures baixen de cop: la màxima mitjana cau gairebé 5 graus respecte a l'octubre.", "És el mes amb menys hores de sol."],
  es: ["Es el mes más frío.", null, null, null, null, "Las noches tropicales se vuelven habituales en el centro.", "Es el mes más seco y el más soleado.", "Es el mes más caluroso y, con septiembre, el de más días de tormenta.", "Es el segundo mes más lluvioso.", "Es el mes más lluvioso.", "Las temperaturas bajan de golpe: la máxima media cae casi 5 grados respecto a octubre.", "Es el mes con menos horas de sol."],
  en: ["The coldest month.", null, null, null, null, "Tropical nights become common in the city centre.", "The driest and sunniest month.", "The warmest month and, with September, the one with the most thunderstorm days.", "The second-wettest month.", "The wettest month.", "Temperatures drop sharply: the average high falls almost 5 degrees from October.", "The month with the least sunshine."],
};

function monthText(locale: Locale, i: number): string {
  const [mean, high, low, rain, days, sun] = NORMALS[i]!;
  const [cHigh, cLow, , tropical] = RAVAL[i]!;
  const [rMax, dMax, rMin, dMin] = RECORDS[i]!;
  const f = (v: number) => fmt(locale, v);
  const note = MONTH_NOTE[locale][i];
  const lead = note ? `${note} ` : "";
  if (locale === "en") {
    const sunPart = sun === null ? " (AEMET gives no sunshine figure for September)" : `; sunshine: ${sun} hours`;
    const trop = tropical >= 1 ? ` El Raval averages ${f(tropical)} tropical nights (lows above 20 °C).` : "";
    return `${lead}Average high ${f(high)} °C (${toF(high)} °F) and low ${f(low)} °C (${toF(low)} °F) at the airport (mean ${f(mean)} °C, ${toF(mean)} °F); in el Raval, in the centre, ${f(cHigh)} and ${f(cLow)} °C (${toF(cHigh)} and ${toF(cLow)} °F). Rain: ${rain} mm on ${f(days)} days on average${sunPart}; humidity ${HUMIDITY[i]} %.${trop} Records for the month at the airport: ${f(rMax)} °C (${toF(rMax)} °F) ${onDay(locale, dMax)} and ${f(rMin)} °C (${toF(rMin)} °F) ${onDay(locale, dMin)}.`;
  }
  if (locale === "es") {
    const sunPart = sun === null ? " (la AEMET no da horas de sol para septiembre)" : `, y hay ${sun} horas de sol`;
    const trop = tropical >= 1 ? ` El Raval suma de media ${f(tropical)} noches tropicales (mínimas por encima de 20 °C).` : "";
    return `${lead}Máxima media de ${f(high)} °C y mínima de ${f(low)} °C en el aeropuerto (media de ${f(mean)} °C); en el Raval, en el centro, ${f(cHigh)} y ${f(cLow)} °C. Caen ${rain} mm de lluvia en ${f(days)} días de media${sunPart}.${trop} Récords del mes en el aeropuerto: ${f(rMax)} °C ${onDay(locale, dMax)} y ${f(rMin)} °C ${onDay(locale, dMin)}.`;
  }
  const sunPart = sun === null ? " (l'AEMET no dona hores de sol per al setembre)" : `, i hi ha ${sun} hores de sol`;
  const trop = tropical >= 1 ? ` El Raval suma de mitjana ${f(tropical)} nits tropicals (mínimes per sobre de 20 °C).` : "";
  return `${lead}Màxima mitjana de ${f(high)} °C i mínima de ${f(low)} °C a l'aeroport (mitjana de ${f(mean)} °C); al Raval, al centre, ${f(cHigh)} i ${f(cLow)} °C. Hi cauen ${rain} mm de pluja en ${f(days)} dies de mitjana${sunPart}.${trop} Rècords del mes a l'aeroport: ${f(rMax)} °C ${onDay(locale, dMax)} i ${f(rMin)} °C ${onDay(locale, dMin)}.`;
}

type T = {
  lead: string;
  note: string;
  tableTitle: string;
  tableCaption: string;
  tableHeaders: string[];
  yearLabel: string;
  tableNote: string;
  noValue: string;
  monthsTitle: string;
  monthsIntro: string;
  seasonsTitle: string;
  seasons: string[];
  cityTitle: string;
  city: string[];
  cityCaption: string;
  cityHeaders: string[];
  cityNote: string;
  recordsTitle: string;
  records: string[];
  seaTitle: string;
  sea: string;
  faq: { question: string; answer: string }[];
};

const RAINY_LINK: Record<Locale, string> = {
  ca: `Per als dies de pluja, mira ${featureLink("rainy", "ca", "què fer a Barcelona i Catalunya quan plou")}.`,
  es: `Para los días de lluvia, mira ${featureLink("rainy", "es", "qué hacer en Barcelona y Cataluña cuando llueve")}.`,
  en: `For the wet days, see ${featureLink("rainy", "en", "things to do in Barcelona on a rainy day")}.`,
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Barcelona té un clima mediterrani suau: hiverns amb màximes al voltant dels 14 °C i estius amb màximes de 28 °C. L'**agost** és el mes més calorós, el **gener** el més fred (màxima mitjana de 13,6 °C i mínima de 4,7 °C a l'aeroport) i l'**octubre** el més plujós, amb 91 mm. Aquí tens les mitjanes oficials de cada mes segons l'AEMET, les del centre de la ciutat segons el Meteocat i els rècords de cada mes.",
    note: "Les mitjanes mensuals són les de l'estació de l'AEMET a l'aeroport del Prat per al període 1981-2010: és el període de referència que l'AEMET publica al seu web, que no té cap taula 1991-2020 per a l'estació, i el Meteocat encara elabora les seves climatologies 1991-2020. Per al centre, l'estació del Meteocat al Raval (2010-2025).",
    tableTitle: "Clima de Barcelona per mesos",
    tableCaption: "Clima de Barcelona per mesos (AEMET, Barcelona Aeroport, 1981-2010)",
    tableHeaders: ["Mes", "Mitjana", "Màxima mitjana", "Mínima mitjana", "Pluja", "Dies de pluja", "Humitat", "Hores de sol"],
    yearLabel: "Any",
    tableNote: "Temperatures en °C. Pluja en mm. Dies de pluja: amb 1 mm o més. Humitat: humitat relativa mitjana, en %. L'AEMET no dona hores de sol per al setembre ni per a l'any.",
    noValue: "—",
    monthsTitle: "El temps a Barcelona cada mes",
    monthsIntro: "Mes per mes, les mitjanes de l'aeroport (AEMET, 1981-2010), les del centre (Meteocat, el Raval, 2010-2025) i els rècords del mes a l'aeroport des del 1924 (AEMET, actualitzats el 30 de setembre de 2026).",
    seasonsTitle: "Què esperar cada estació",
    seasons: [
      "**Hivern (desembre-febrer):** màximes mitjanes de 14 °C i mínimes de 5 °C a l'aeroport. Les glaçades hi són rares: unes quatre l'any, i la neu, menys d'un dia l'any de mitjana. L'hivern astronòmic 2026-27 comença el 21 de desembre de 2026 a les 21:50 (hora oficial peninsular), segons l'Institut Geogràfic Nacional.",
      "**Primavera (març-maig):** les màximes pugen de 16 a 21 °C, amb unes cinc jornades de pluja al mes.",
      "**Estiu (juny-agost):** màximes de 25 a 28,5 °C i el juliol és el mes més sec (21 mm) i el més assolellat (305 hores de sol). L'agost ja porta tempestes: 62 mm de pluja de mitjana.",
      `**Tardor (setembre-novembre):** és l'època més plujosa. L'octubre suma 91 mm i el setembre, 81, en uns sis dies de pluja. Per veure com estan els pantans, consulta [l'estat dels embassaments avui](/ca/${TOOL_PATHS.reservoirs.ca}/), amb la dada diària de l'ACA. ${RAINY_LINK.ca}`,
    ],
    cityTitle: "Al centre de la ciutat fa més calor",
    city: [
      "L'estació del Meteocat al Raval, al centre, dona mitjanes més altes que l'aeroport: entre el 2010 i el 2025, la mínima mitjana del gener hi va ser de 8,6 °C, i **no hi va haver cap dia de glaçada**.",
      "A l'estiu, les nits hi costen de refrescar: el Raval suma **98 nits tropicals l'any** (mínimes per sobre de 20 °C), gairebé totes de juny a setembre. L'Atles climàtic del Meteocat ho atribueix a l'illa de calor urbana de Barcelona.",
    ],
    cityCaption: "Centre de Barcelona per mesos (Meteocat, el Raval, 2010-2025)",
    cityHeaders: ["Mes", "Màxima mitjana", "Mínima mitjana", "Pluja", "Nits tropicals"],
    cityNote: "Temperatures en °C, pluja en mm. Nits tropicals: mínima per sobre de 20 °C. És una mitjana de 16 anys (2010-2025), no una normal de 30 anys, i no es pot comparar fil per randa amb la taula de l'aeroport.",
    recordsTitle: "Rècords",
    records: [
      "Segons l'AEMET, la temperatura més alta registrada a l'aeroport és de **37,7 °C, el 8 de juliol del 2026**, i la més baixa, de **-8,0 °C, el 27 de desembre del 1962**. El dia més plujós va deixar 186,7 mm, el 25 de setembre del 1953. Els rècords de cada mes són a l'apartat de cada mes.",
      "A l'Observatori Fabra, a 408 metres d'altitud al vessant de Collserola, l'onada de calor del 6 al 9 de juliol del 2026 va arribar a 40,9 °C, la temperatura més alta en els 113 anys de dades de l'observatori, segons el Meteocat.",
    ],
    seaTitle: "I la temperatura de l'aigua?",
    sea: "No hi ha una mitjana oficial mes a mes de la temperatura del mar a Barcelona. La boia de Ports de l'Estat davant de Barcelona en dona la lectura del moment al portal PORTUS, i la pàgina de cada platja a barcelona.cat informa de l'estat del mar.",
    faq: [
      { question: "Quin és el mes més calorós a Barcelona?", answer: "L'agost, amb una màxima mitjana de 28,5 °C i una mitjana de 24,4 °C a l'estació de l'aeroport (AEMET, 1981-2010). El juliol el segueix de prop." },
      { question: "Quin és el mes més fred a Barcelona?", answer: "El gener, amb una màxima mitjana de 13,6 °C, una mínima de 4,7 °C i una mitjana de 9,2 °C a l'estació de l'aeroport (AEMET, 1981-2010). Al centre, l'estació del Meteocat al Raval va donar una mínima mitjana de 8,6 °C al gener entre el 2010 i el 2025." },
      { question: "En quin mes plou més a Barcelona?", answer: "A l'octubre, amb 91 mm de mitjana, seguit del setembre amb 81 mm (AEMET, aeroport). Al centre, el Raval també té el setembre i l'octubre com els mesos més plujosos (77,9 i 76,9 mm, 2010-2025). El juliol és el més sec a l'aeroport, amb 21 mm." },
      { question: "Quina és la temperatura mitjana de Barcelona?", answer: "16,1 °C l'any a l'aeroport (AEMET, 1981-2010), amb 588 mm de pluja en 53,3 dies. Al Raval, al centre, la mitjana anual va ser de 18,2 °C entre el 2010 i el 2025." },
      { question: "Quan comencen a baixar les temperatures a Barcelona?", answer: "Al setembre: la màxima mitjana passa de 28,5 °C a l'agost a 26,0 °C al setembre, 22,1 °C a l'octubre i 17,3 °C al novembre (AEMET, aeroport, 1981-2010). La baixada més gran és entre l'octubre i el novembre, gairebé 5 graus." },
      { question: "Quina temperatura fa a Barcelona a l'hivern?", answer: "De desembre a febrer, màximes mitjanes de 13,6 a 14,3 °C i mínimes de 4,7 a 5,7 °C a l'aeroport (AEMET, 1981-2010). Al centre, al Raval, les mínimes mitjanes van de 8,6 a 9,8 °C (2010-2025)." },
      { question: "Quin temps fa a Barcelona al gener?", answer: "Màximes mitjanes de 13,6 °C i mínimes de 4,7 °C, amb 37 mm de pluja en uns quatre dies i 151 hores de sol, segons l'AEMET." },
      { question: "Quin temps fa a Barcelona a l'agost?", answer: "Màximes mitjanes de 28,5 °C i mínimes de 20,2 °C a l'aeroport, amb 62 mm de pluja, sovint en tempestes, i 278 hores de sol (AEMET). Al Raval les mínimes mitjanes són de 23,6 °C i gairebé totes les nits són tropicals." },
      { question: "Quin temps fa a Barcelona a l'octubre?", answer: "Màximes mitjanes de 22,1 °C i mínimes de 13,5 °C. És el mes més plujós, amb 91 mm en uns sis dies, i té 182 hores de sol, segons l'AEMET." },
      { question: "Quin temps fa a Barcelona al novembre?", answer: "Màximes mitjanes de 17,3 °C i mínimes de 8,6 °C, amb 59 mm de pluja en uns cinc dies, segons l'AEMET." },
      { question: "Quin temps fa a Barcelona al desembre?", answer: "Màximes mitjanes de 14,3 °C i mínimes de 5,7 °C a l'aeroport, amb 40 mm de pluja en uns quatre dies i 141 hores de sol, el mínim de l'any (AEMET). Al Raval la mínima mitjana és de 9,8 °C." },
      { question: "Quan comença l'hivern a Barcelona?", answer: "L'hivern astronòmic 2026-27 comença el 21 de desembre de 2026 a les 21:50, hora oficial peninsular, segons l'Institut Geogràfic Nacional. Climàticament, desembre, gener i febrer són els mesos més freds." },
      { question: "Neva a Barcelona?", answer: "Molt poc: l'AEMET compta 0,4 dies de neu l'any de mitjana a l'aeroport." },
      { question: "Barcelona és humida?", answer: "Moderadament, tot l'any: la humitat relativa mitjana a l'aeroport va del 67 % (juliol) al 73 % (octubre), i és del 69 % de mitjana anual (AEMET, 1981-2010). L'estiu es fa xafogós per les nits càlides, no perquè la humitat pugi." },
      { question: "Per què les mitjanes són del 1981-2010 i no del 1991-2020?", answer: "Perquè és el període de referència que l'AEMET publica al seu web per a l'estació de l'aeroport (comprovat el 28 d'octubre de 2026), i el Meteocat encara està elaborant les seves climatologies 1991-2020. Per veure anys més recents, la taula del Raval cobreix del 2010 al 2025." },
    ],
  },
  es: {
    lead: "Barcelona tiene un clima mediterráneo suave: inviernos con máximas en torno a los 14 °C y veranos con máximas de 28 °C. **Agosto** es el mes más caluroso, **enero** el más frío (máxima media de 13,6 °C y mínima de 4,7 °C en el aeropuerto) y **octubre** el más lluvioso, con 91 mm. Aquí tienes las medias oficiales de cada mes según la AEMET, las del centro de la ciudad según el Meteocat y los récords de cada mes.",
    note: "Las medias mensuales son las de la estación de la AEMET en el aeropuerto de El Prat para el periodo 1981-2010: es el periodo de referencia que la AEMET publica en su web, que no tiene tabla 1991-2020 para la estación, y el Meteocat aún elabora sus climatologías 1991-2020. Para el centro, la estación del Meteocat en el Raval (2010-2025).",
    tableTitle: "Clima de Barcelona por meses",
    tableCaption: "Clima de Barcelona por meses (AEMET, Barcelona Aeropuerto, 1981-2010)",
    tableHeaders: ["Mes", "Media", "Máxima media", "Mínima media", "Lluvia", "Días de lluvia", "Humedad", "Horas de sol"],
    yearLabel: "Año",
    tableNote: "Temperaturas en °C. Lluvia en mm. Días de lluvia: con 1 mm o más. Humedad: humedad relativa media, en %. La AEMET no da horas de sol para septiembre ni para el año.",
    noValue: "—",
    monthsTitle: "El tiempo en Barcelona cada mes",
    monthsIntro: "Mes a mes, las medias del aeropuerto (AEMET, 1981-2010), las del centro (Meteocat, el Raval, 2010-2025) y los récords del mes en el aeropuerto desde 1924 (AEMET, actualizados el 30 de septiembre de 2026).",
    seasonsTitle: "Qué esperar cada estación",
    seasons: [
      "**Invierno (diciembre-febrero):** máximas medias de 14 °C y mínimas de 5 °C en el aeropuerto. Las heladas son raras: unas cuatro al año, y la nieve, menos de un día al año de media. El invierno astronómico 2026-27 empieza el 21 de diciembre de 2026 a las 21:50 (hora oficial peninsular), según el Instituto Geográfico Nacional.",
      "**Primavera (marzo-mayo):** las máximas suben de 16 a 21 °C, con unas cinco jornadas de lluvia al mes.",
      "**Verano (junio-agosto):** máximas de 25 a 28,5 °C y julio es el mes más seco (21 mm) y el más soleado (305 horas de sol). Agosto ya trae tormentas: 62 mm de lluvia de media.",
      `**Otoño (septiembre-noviembre):** es la época más lluviosa. Octubre suma 91 mm y septiembre, 81, en unos seis días de lluvia. Para ver cómo están los pantanos, consulta [el nivel de los embalses hoy](/es/${TOOL_PATHS.reservoirs.es}/), con el dato diario de la ACA. ${RAINY_LINK.es}`,
    ],
    cityTitle: "En el centro de la ciudad hace más calor",
    city: [
      "La estación del Meteocat en el Raval, en el centro, da medias más altas que el aeropuerto: entre 2010 y 2025, la mínima media de enero fue de 8,6 °C, y **no hubo ningún día de helada**.",
      "En verano, las noches cuestan de refrescar: el Raval suma **98 noches tropicales al año** (mínimas por encima de 20 °C), casi todas de junio a septiembre. El Atles climàtic del Meteocat lo atribuye a la isla de calor urbana de Barcelona.",
    ],
    cityCaption: "Centro de Barcelona por meses (Meteocat, el Raval, 2010-2025)",
    cityHeaders: ["Mes", "Máxima media", "Mínima media", "Lluvia", "Noches tropicales"],
    cityNote: "Temperaturas en °C, lluvia en mm. Noches tropicales: mínima por encima de 20 °C. Es una media de 16 años (2010-2025), no una normal de 30 años, y no se compara al pie de la letra con la tabla del aeropuerto.",
    recordsTitle: "Récords",
    records: [
      "Según la AEMET, la temperatura más alta registrada en el aeropuerto es de **37,7 °C, el 8 de julio de 2026**, y la más baja, de **-8,0 °C, el 27 de diciembre de 1962**. El día más lluvioso dejó 186,7 mm, el 25 de septiembre de 1953. Los récords de cada mes están en el apartado de cada mes.",
      "En el Observatori Fabra, a 408 metros de altitud en la ladera de Collserola, la ola de calor del 6 al 9 de julio de 2026 llegó a 40,9 °C, la temperatura más alta en los 113 años de datos del observatorio, según el Meteocat.",
    ],
    seaTitle: "¿Y la temperatura del agua?",
    sea: "No existe una media oficial mes a mes de la temperatura del mar en Barcelona. La boya de Puertos del Estado frente a Barcelona da la lectura del momento en el portal PORTUS, y la página de cada playa en barcelona.cat informa del estado del mar.",
    faq: [
      { question: "¿Cuál es el mes más caluroso en Barcelona?", answer: "Agosto, con una máxima media de 28,5 °C y una media de 24,4 °C en la estación del aeropuerto (AEMET, 1981-2010). Julio le sigue de cerca." },
      { question: "¿Cuál es el mes más frío en Barcelona?", answer: "Enero, con una máxima media de 13,6 °C, una mínima de 4,7 °C y una media de 9,2 °C en la estación del aeropuerto (AEMET, 1981-2010). En el centro, la estación del Meteocat en el Raval dio una mínima media de 8,6 °C en enero entre 2010 y 2025." },
      { question: "¿En qué mes llueve más en Barcelona?", answer: "En octubre, con 91 mm de media, seguido de septiembre con 81 mm (AEMET, aeropuerto). En el centro, el Raval también tiene septiembre y octubre como los meses más lluviosos (77,9 y 76,9 mm, 2010-2025). Julio es el más seco en el aeropuerto, con 21 mm." },
      { question: "¿Cuál es la temperatura media de Barcelona?", answer: "16,1 °C al año en el aeropuerto (AEMET, 1981-2010), con 588 mm de lluvia en 53,3 días. En el Raval, en el centro, la media anual fue de 18,2 °C entre 2010 y 2025." },
      { question: "¿Cuándo empiezan a bajar las temperaturas en Barcelona?", answer: "En septiembre: la máxima media pasa de 28,5 °C en agosto a 26,0 °C en septiembre, 22,1 °C en octubre y 17,3 °C en noviembre (AEMET, aeropuerto, 1981-2010). La bajada más grande es entre octubre y noviembre, casi 5 grados." },
      { question: "¿Qué temperatura hace en Barcelona en invierno?", answer: "De diciembre a febrero, máximas medias de 13,6 a 14,3 °C y mínimas de 4,7 a 5,7 °C en el aeropuerto (AEMET, 1981-2010). En el centro, en el Raval, las mínimas medias van de 8,6 a 9,8 °C (2010-2025)." },
      { question: "¿Qué tiempo hace en Barcelona en enero?", answer: "Máximas medias de 13,6 °C y mínimas de 4,7 °C, con 37 mm de lluvia en unos cuatro días y 151 horas de sol, según la AEMET." },
      { question: "¿Qué tiempo hace en Barcelona en agosto?", answer: "Máximas medias de 28,5 °C y mínimas de 20,2 °C en el aeropuerto, con 62 mm de lluvia, a menudo en tormentas, y 278 horas de sol (AEMET). En el Raval las mínimas medias son de 23,6 °C y casi todas las noches son tropicales." },
      { question: "¿Qué clima hace en Barcelona en octubre?", answer: "Máximas medias de 22,1 °C y mínimas de 13,5 °C. Es el mes más lluvioso, con 91 mm en unos seis días, y tiene 182 horas de sol, según la AEMET." },
      { question: "¿Qué tiempo hace en Barcelona en noviembre?", answer: "Máximas medias de 17,3 °C y mínimas de 8,6 °C, con 59 mm de lluvia en unos cinco días, según la AEMET." },
      { question: "¿Qué tiempo hace en Barcelona en diciembre?", answer: "Máximas medias de 14,3 °C y mínimas de 5,7 °C en el aeropuerto, con 40 mm de lluvia en unos cuatro días y 141 horas de sol, el mínimo del año (AEMET). En el Raval la mínima media es de 9,8 °C." },
      { question: "¿Cuándo empieza el invierno en Barcelona?", answer: "El invierno astronómico 2026-27 empieza el 21 de diciembre de 2026 a las 21:50, hora oficial peninsular, según el Instituto Geográfico Nacional. En el clima, diciembre, enero y febrero son los meses más fríos." },
      { question: "¿Nieva en Barcelona?", answer: "Muy poco: la AEMET cuenta 0,4 días de nieve al año de media en el aeropuerto." },
      { question: "¿Es húmeda Barcelona?", answer: "Moderadamente, todo el año: la humedad relativa media en el aeropuerto va del 67 % (julio) al 73 % (octubre), y es del 69 % de media anual (AEMET, 1981-2010). El verano resulta bochornoso por las noches cálidas, no porque suba la humedad." },
      { question: "¿Por qué las medias son de 1981-2010 y no de 1991-2020?", answer: "Porque es el periodo de referencia que la AEMET publica en su web para la estación del aeropuerto (comprobado el 28 de octubre de 2026), y el Meteocat aún está elaborando sus climatologías 1991-2020. Para ver años más recientes, la tabla del Raval cubre de 2010 a 2025." },
    ],
  },
  en: {
    lead: "**January** is Barcelona's coldest month, with an average high of 13.6 °C (56 °F) and a low of 4.7 °C (40 °F); **August** is the warmest, 28.5 °C (83 °F) by day and 20.2 °C (68 °F) at night; **October** is the wettest, with 91 mm. It is a mild Mediterranean climate: frost is rare and snow almost never settles. Below are the official averages for every month from AEMET, Spain's weather agency, in °C and °F, the city-centre figures from Meteocat and each month's records.",
    note: "The monthly averages are from AEMET's station at El Prat airport for 1981-2010: that is the reference period AEMET publishes on its website, which has no 1991-2020 table for the station, and Meteocat is still preparing its 1991-2020 climatologies. For the city centre, Meteocat's el Raval station (2010-2025).",
    tableTitle: "Barcelona temperature and rainfall by month",
    tableCaption: "Barcelona weather by month (AEMET, Barcelona airport, 1981-2010)",
    tableHeaders: ["Month", "Mean °C (°F)", "Average high °C (°F)", "Average low °C (°F)", "Rain (mm)", "Rain days", "Humidity", "Sunshine hours"],
    yearLabel: "Year",
    tableNote: "Temperatures in °C, with °F in brackets (rounded). Rain days: 1 mm or more. Humidity: average relative humidity, %. AEMET gives no sunshine figure for September or for the year.",
    noValue: "—",
    monthsTitle: "Barcelona weather month by month",
    monthsIntro: "Month by month: the airport averages (AEMET, 1981-2010), the city-centre ones (Meteocat, el Raval, 2010-2025) and each month's records at the airport since 1924 (AEMET, updated 30 September 2026).",
    seasonsTitle: "Barcelona weather in winter, spring, summer and autumn",
    seasons: [
      "**Winter (December-February):** average highs of 14 °C and lows of 5 °C at the airport. Frost is rare, about four days a year, and snow less than one day a year on average. Astronomical winter 2026-27 begins on 21 December 2026 at 21:50 (Spanish mainland time), according to Spain's National Geographic Institute.",
      "**Spring (March-May):** highs climb from 16 to 21 °C, with about five rainy days a month.",
      "**Summer (June-August):** highs of 25 to 28.5 °C; July is the driest month (21 mm) and the sunniest (305 hours). August brings storms: 62 mm of rain on average.",
      `**Autumn (September-November):** the wettest season. October averages 91 mm and September 81, over about six rainy days. To see how the reservoirs stand, check [Catalonia's reservoir levels today](/en/${TOOL_PATHS.reservoirs.en}/), from the water agency's daily data. ${RAINY_LINK.en}`,
    ],
    cityTitle: "The city centre is warmer",
    city: [
      "Meteocat's station in el Raval, in the centre, records higher averages than the airport: between 2010 and 2025 its average January low was 8.6 °C, and **it had no frost at all**.",
      "In summer, nights are slow to cool down: el Raval averages **98 tropical nights a year** (lows above 20 °C), almost all from June to September. Meteocat's climate atlas puts it down to Barcelona's urban heat island.",
    ],
    cityCaption: "Barcelona city centre by month (Meteocat, el Raval, 2010-2025)",
    cityHeaders: ["Month", "Average high", "Average low", "Rain", "Tropical nights"],
    cityNote: "Temperatures in °C, rain in mm. Tropical night: low above 20 °C. A 16-year average (2010-2025), not a 30-year normal, so it does not compare exactly with the airport table.",
    recordsTitle: "Barcelona's lowest and highest temperatures on record",
    records: [
      "According to AEMET, the highest temperature recorded at the airport is **37.7 °C on 8 July 2026**, and the lowest **-8.0 °C on 27 December 1962**. The wettest day brought 186.7 mm, on 25 September 1953. Each month's records are in that month's section.",
      "At the Fabra Observatory, 408 metres up the Collserola hillside, the heat wave of 6 to 9 July 2026 reached 40.9 °C, the highest temperature in the observatory's 113 years of data, according to Meteocat.",
    ],
    seaTitle: "What about the sea temperature?",
    sea: "There is no official month-by-month average for the sea temperature in Barcelona. Puertos del Estado's buoy off Barcelona gives the current reading on its PORTUS portal, and each beach page on barcelona.cat reports the sea conditions.",
    faq: [
      { question: "What is the hottest month in Barcelona?", answer: "August, with an average high of 28.5 °C (83 °F) and a mean of 24.4 °C (76 °F) at the airport station (AEMET, 1981-2010). July is close behind, with a high of 28.0 °C (82 °F)." },
      { question: "What is the coldest month in Barcelona?", answer: "January, with an average high of 13.6 °C (56 °F), an average low of 4.7 °C (40 °F) and a mean of 9.2 °C (49 °F) at the airport station (AEMET, 1981-2010). February is next, with a low of 5.4 °C, then December (5.7 °C). In the centre, Meteocat's el Raval station averaged a January low of 8.6 °C (47 °F) between 2010 and 2025." },
      { question: "What is the rainiest month in Barcelona?", answer: "October, with 91 mm on average, followed by September with 81 mm (AEMET, airport). In the centre, el Raval also has September and October as its wettest months (77.9 and 76.9 mm, 2010-2025). July is the driest at the airport, with 21 mm." },
      { question: "What is the average temperature in Barcelona?", answer: "16.1 °C over the year at the airport (AEMET, 1981-2010), with 588 mm of rain on 53.3 days. In el Raval, in the centre, the annual mean was 18.2 °C between 2010 and 2025." },
      { question: "When does it start to cool down in Barcelona?", answer: "In September: the average high goes from 28.5 °C in August to 26.0 °C in September, 22.1 °C in October and 17.3 °C in November (AEMET, airport, 1981-2010). The biggest drop is between October and November, almost 5 degrees." },
      { question: "What is the temperature in Barcelona in winter?", answer: "From December to February, average highs of 13.6 to 14.3 °C and lows of 4.7 to 5.7 °C at the airport (AEMET, 1981-2010). In the centre, el Raval's average lows run from 8.6 to 9.8 °C (2010-2025)." },
      { question: "What is the weather like in Barcelona in January?", answer: "Average highs of 13.6 °C (56 °F) and lows of 4.7 °C (40 °F), with 37 mm of rain over about four days and 151 hours of sunshine, according to AEMET. Frost is possible at the airport (1.4 days in January on average) but not in the centre." },
      { question: "What is the weather like in Barcelona in August?", answer: "Average highs of 28.5 °C (83 °F) and lows of 20.2 °C (68 °F) at the airport, a mean of 24.4 °C (76 °F), with 62 mm of rain, often in storms, and 278 hours of sunshine (AEMET). In el Raval the average low is 23.6 °C (74 °F) and nearly every night is tropical." },
      { question: "What is the weather like in Barcelona in October?", answer: "Average highs of 22.1 °C and lows of 13.5 °C. It is the wettest month, with 91 mm over about six days, and has 182 hours of sunshine, according to AEMET." },
      { question: "What is the weather like in Barcelona in November?", answer: "Average highs of 17.3 °C (63 °F) and lows of 8.6 °C (47 °F), with 59 mm of rain over about five days and 145 hours of sunshine, according to AEMET." },
      { question: "What is the weather like in Barcelona in December?", answer: "Average highs of 14.3 °C (58 °F) and lows of 5.7 °C (42 °F) at the airport, with 40 mm of rain over about four days and 141 hours of sunshine, the least of the year (AEMET). In el Raval the average low is 9.8 °C." },
      { question: "When does winter start in Barcelona?", answer: "Astronomical winter 2026-27 begins on 21 December 2026 at 21:50, Spanish mainland time, according to Spain's National Geographic Institute. By climate, December, January and February are the coldest months." },
      { question: "Does it snow in Barcelona?", answer: "Hardly ever: AEMET counts 0.4 snow days a year on average at the airport." },
      { question: "Is Barcelona humid?", answer: "Moderately, all year: average relative humidity at the airport stays between 67 % (July) and 73 % (October), 69 % over the year (AEMET, 1981-2010). Summer feels muggier because of the warm nights, not because humidity rises." },
      { question: "Why are the averages for 1981-2010 and not 1991-2020?", answer: "Because 1981-2010 is the reference period AEMET publishes on its website for the airport station (checked on 28 October 2026), and Meteocat is still preparing its 1991-2020 climatologies. For more recent years, the el Raval table covers 2010 to 2025." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  const f = (v: number) => fmt(locale, v);
  // English readers search in °F as often as °C: the conversion sits beside each temperature.
  const temp = (v: number) => (locale === "en" ? cf(v) : f(v));
  const rows = NORMALS.map(([mean, high, low, rain, days, sun], i) => [
    MONTHS[locale][i] ?? "",
    temp(mean),
    temp(high),
    temp(low),
    String(rain),
    f(days),
    `${HUMIDITY[i]} %`,
    sun === null ? t.noValue : String(sun),
  ]);
  const [yMean, yHigh, yLow, yRain, yDays] = YEAR;
  rows.push([t.yearLabel, temp(yMean), temp(yHigh), temp(yLow), String(yRain), f(yDays), `${HUMIDITY_YEAR} %`, t.noValue]);
  const cityRows = RAVAL.map(([high, low, rain, tropical], i) => [
    MONTHS[locale][i] ?? "",
    f(high),
    f(low),
    f(rain),
    f(tropical),
  ]);
  const [cHigh, cLow, cRain, cTropical] = RAVAL_YEAR;
  cityRows.push([t.yearLabel, f(cHigh), f(cLow), f(cRain), f(cTropical)]);
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.tableTitle),
    table(t.tableCaption, t.tableHeaders, rows, t.tableNote),
    ...h2(t.cityTitle, ...t.city),
    table(t.cityCaption, t.cityHeaders, cityRows, t.cityNote),
    ...h2(t.monthsTitle, t.monthsIntro),
    ...MONTHS[locale].flatMap((_, i) => h3(monthHeading(locale, i), monthText(locale, i))),
    ...h2(t.seasonsTitle),
    list(...t.seasons),
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
