import type { Block } from "@/lib/content/blocks";
import { changesInYear } from "@/lib/content/clock/rule";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { B2_PATHS, b2Related, b2link, callout, faq, keyFacts, lead, list, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * "When does winter start?" (27 Nov 2026, ci-demanda batch 7B): the start of
 * winter 2026-27, the shortest day, sunrise and sunset in Catalonia's four
 * capitals and Madrid, the Geminids and the winter sky, in ca/es/en.
 *
 * Why: the December demand of the site was mapped on 26-27 Nov (GSC rising,
 * gaps and query-level reads) and every candidate in the brief already had a
 * page (Christmas transport, New Year, La Grossa, Reis, ski, snow, pay dates,
 * 2027 calendars, school holidays). This one had none: Google's autocomplete
 * for "cuando empieza el invierno" returns "... 2026 en españa", "... en
 * barcelona"; "dia mas corto del año" returns "... 2026 españa", "... en
 * barcelona", "... a que hora anochece"; "geminidas 2026" returns "lluvia
 * geminidas 2026", "geminidas diciembre 2026"; "quan comença l'hivern" returns
 * "... 2026". Our only answer was one sentence in the Barcelona weather guide.
 * Information gain over the usual article: the official times for Barcelona,
 * Girona, Lleida and Tarragona, and the two dates readers do not expect (the
 * earliest sunset comes before the solstice, the latest sunrise after it),
 * read off the same official tables.
 *
 * Sources, all read with curl on 27 Nov 2026 between 00:03 and 00:40 CET:
 *  - IGN / Observatorio Astronómico Nacional, "Invierno"
 *    (astronomia.ign.es/es/inicio-estaciones/invierno, and the /en/ page):
 *    «El invierno de 2026-2027 en el hemisferio norte comenzará el día 21 de
 *    diciembre de 2026 a las 21 horas 50 minutos hora oficial peninsular»,
 *    «Esta estación durará aproximadamente 88 días y 23 horas, y terminará el
 *    20 de marzo de 2027 con el comienzo de la primavera», «ese es el día con
 *    menos horas de Sol del año», «solsticio de invierno (del latín solstitium,
 *    Sol quieto)», «las úrsidas, cuyo máximo se espera hacia el 22 de
 *    diciembre, y las cuadrántidas, cuyo máximo se espera hacia el 4 de enero»,
 *    «Las lunas llenas del invierno tendrán lugar los días 24 de diciembre, 22
 *    de enero y 21 de febrero», «El 3 de enero de 2027 ... perihelio ... poco
 *    más de 147 millones de km ... unos 5 millones de km menos ... (afelio),
 *    que sucederá el 5 de julio de 2027», eclipses «El eclipse solar tendrá
 *    lugar el 6 de febrero ... Desde España se podrá ver como parcial de baja
 *    magnitud en las islas Canarias, Andalucía, Ceuta y Melilla. El de Luna será
 *    el 20 de febrero», planets (Saturn at dusk, joined by Mars and Jupiter in
 *    mid-February; Venus, Mars and Jupiter at dawn), «del 20 al 23 de
 *    diciembre», «A lo largo del siglo XXI el invierno se iniciará en los días
 *    20 a 22 de diciembre (fecha oficial española), siendo su inicio más
 *    tempranero el del año 2096 y el inicio más tardío el de 2003», «Con algo
 *    menos de 89 días de duración, el invierno en el hemisferio norte es la
 *    estación más corta del año», «Para la latitud de Madrid, el día del
 *    solsticio de invierno tendrá 9 horas y 17 minutos de Sol, a comparar con
 *    las 15 horas y 3 minutos de Sol que tuvo el día más largo».
 *  - IGN, "Primavera", "Verano", "Otoño" (same site): 2026 starts «20 de marzo
 *    a las 15 horas 46 minutos», «21 de junio a las 10 horas 24 minutos», «23
 *    de septiembre a las 02 horas 05 minutos». Spring 2027 has no hour yet: the
 *    winter page only says it ends on 20 March 2027, so no hour is printed.
 *  - IGN, "Gemínidas" (astronomia.ign.es/es/web/guest/geminidas): «En 2026 el
 *    pico de actividad estará centrado el día 14 de diciembre, en torno a las
 *    15 horas de tiempo oficial peninsular», «un máximo bastante amplio, de
 *    unas 12 horas, por lo que tanto la noche anterior como la siguiente
 *    tendrán alta actividad», «La Luna todavía no habrá alcanzado el cuarto
 *    creciente, con una iluminación en torno al 20%, y se pondrá al principio
 *    de la noche», «visibles desde todo el hemisferio norte entre el 4 y el 17
 *    de diciembre», «hasta 150 estrellas fugaces por hora», «35 kilómetros por
 *    segundo», «las coma berenícidas del 19 de diciembre y las úrsidas el 22
 *    ... de entre 3 y 10 meteoros por hora», and the viewing advice.
 *  - IGN sunrise/sunset tables, official peninsular time, 2026 and 2027:
 *    cdn.mitma.gob.es/portal-web-drupal/salidapuestasol/{2026,2027}/{Barcelona,
 *    Girona,Lleida,Tarragona,Madrid}-{year}.txt, header «SALIDA Y PUESTA DE SOL
 *    PARA 2026», «Hora oficial en la península y Baleares», «Observatorio
 *    Astronómico Nacional». The times below are copied from those files;
 *    daylight is sunset minus sunrise, computed here (Madrid's 9 h 17 min on
 *    21 Dec and 15 h 3 min on 21 Jun match IGN's own sentence). The earliest
 *    sunset and latest sunrise are the minimum and maximum of the files over
 *    1 Dec 2026 - 31 Jan 2027.
 * Left out: the hour of spring 2027 (not published), moonrise times (IGN
 * publishes them as images), Montsec and other dark-sky sites (no official
 * page read today), the Canary Islands' hour (not on the IGN page).
 *
 * Stale on 21 March 2027 (winter over). WINTER_REREAD_BY makes a test fail on
 * 15 Jan 2027 so the page is re-read for the hour of spring 2027 (IGN adds it
 * on its spring page) and rolled to the next season.
 */

export const WINTER_AS_OF = "2026-11-27";
export const WINTER_REREAD_BY = "2027-01-15";

export const WINTER_2026 = {
  start: "2026-12-21",
  time: "21:50",
  days: 88,
  hours: 23,
  end: "2027-03-20",
} as const;

/** IGN season starts, official peninsular time. `time: null` = not published yet. */
export const SEASONS: readonly { key: "spring" | "summer" | "autumn" | "winter"; date: string; time: string | null; days: number | null; hours: number | null }[] = [
  { key: "spring", date: "2026-03-20", time: "15:46", days: 92, hours: 18 },
  { key: "summer", date: "2026-06-21", time: "10:24", days: 93, hours: 16 },
  { key: "autumn", date: "2026-09-23", time: "02:05", days: 89, hours: 21 },
  { key: "winter", date: "2026-12-21", time: "21:50", days: 88, hours: 23 },
  { key: "spring", date: "2027-03-20", time: null, days: null, hours: null },
];

export const GEMINIDS_2026 = {
  peak: "2026-12-14",
  peakTime: "15:00",
  visibleFrom: "2026-12-04",
  visibleTo: "2026-12-17",
  perHour: 150,
  moonPercent: 20,
} as const;

type HM = readonly [number, number];
export interface SunRow { city: string; rise: HM; set: HM }

/** IGN tables, 21 December 2026 (and 21 June 2026 for the comparison). */
export const SOLSTICE_SUN: readonly (SunRow & { juneRise: HM; juneSet: HM })[] = [
  { city: "Barcelona", rise: [8, 14], set: [17, 25], juneRise: [6, 18], juneSet: [21, 28] },
  { city: "Girona", rise: [8, 13], set: [17, 20], juneRise: [6, 13], juneSet: [21, 28] },
  { city: "Lleida", rise: [8, 21], set: [17, 30], juneRise: [6, 23], juneSet: [21, 35] },
  { city: "Tarragona", rise: [8, 17], set: [17, 29], juneRise: [6, 23], juneSet: [21, 31] },
  { city: "Madrid", rise: [8, 34], set: [17, 51], juneRise: [6, 45], juneSet: [21, 48] },
];

/** IGN tables, 1 Dec 2026 - 31 Jan 2027: earliest sunset and latest sunrise, with the first and last day each holds. */
export const EARLY_LATE: readonly { city: string; set: HM; setFrom: string; setTo: string; rise: HM; riseFrom: string; riseTo: string }[] = [
  { city: "Barcelona", set: [17, 22], setFrom: "2026-12-02", setTo: "2026-12-14", rise: [8, 18], riseFrom: "2027-01-03", riseTo: "2027-01-05" },
  { city: "Girona", set: [17, 17], setFrom: "2026-12-05", setTo: "2026-12-12", rise: [8, 17], riseFrom: "2026-12-31", riseTo: "2027-01-07" },
  { city: "Lleida", set: [17, 27], setFrom: "2026-12-04", setTo: "2026-12-12", rise: [8, 24], riseFrom: "2026-12-28", riseTo: "2027-01-10" },
  { city: "Tarragona", set: [17, 26], setFrom: "2026-12-04", setTo: "2026-12-12", rise: [8, 20], riseFrom: "2026-12-29", riseTo: "2027-01-10" },
  { city: "Madrid", set: [17, 48], setFrom: "2026-12-03", setTo: "2026-12-12", rise: [8, 38], riseFrom: "2026-12-31", riseTo: "2027-01-09" },
];

/** IGN Barcelona tables: the festive days and the first day of spring. */
export const BARCELONA_DAYS: readonly { date: string; rise: HM; set: HM }[] = [
  { date: "2026-12-13", rise: [8, 9], set: [17, 22] },
  { date: "2026-12-21", rise: [8, 14], set: [17, 25] },
  { date: "2026-12-24", rise: [8, 15], set: [17, 26] },
  { date: "2026-12-25", rise: [8, 16], set: [17, 27] },
  { date: "2026-12-31", rise: [8, 17], set: [17, 31] },
  { date: "2027-01-01", rise: [8, 17], set: [17, 32] },
  { date: "2027-01-06", rise: [8, 17], set: [17, 37] },
  { date: "2027-03-20", rise: [6, 55], set: [19, 3] },
];

/** At minute precision the Barcelona table gives 9 h 11 min every day from 17 to 25 December 2026. */
export const BARCELONA_FLAT = { from: "2026-12-17", to: "2026-12-25", minutes: 551 } as const;

export const IGN = {
  winter: "https://astronomia.ign.es/es/inicio-estaciones/invierno",
  winterEn: "https://astronomia.ign.es/en/inicio-estaciones/invierno",
  spring: "https://astronomia.ign.es/es/inicio-estaciones/primavera",
  geminids: "https://astronomia.ign.es/es/web/guest/geminidas",
  sunPage: "https://astronomia.ign.es/en/web/guest/hora-salidas-y-puestas-de-sol",
  sunTable: (city: string, year: number) => `https://cdn.mitma.gob.es/portal-web-drupal/salidapuestasol/${year}/${city}-${year}.txt`,
} as const;

export const WINTER_SOURCES: B2Source[] = [
  { name: "Inicio del invierno 2026-2027", url: IGN.winter, publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
  { name: "Start of winter 2026-2027", url: IGN.winterEn, publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
  { name: "Inicio de la primavera, el verano y el otoño 2026", url: IGN.spring, publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
  { name: "Gemínidas 2026", url: IGN.geminids, publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
  ...["Barcelona", "Girona", "Lleida", "Tarragona", "Madrid"].map((city) => ({
    name: `Salida y puesta de sol, ${city}, 2026 (Hora oficial en la península y Baleares)`,
    url: IGN.sunTable(city, 2026),
    publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional",
  })),
  { name: "Salida y puesta de sol, Barcelona, 2027", url: IGN.sunTable("Barcelona", 2027), publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional" },
];

/* ------------------------------------------------------------------------ */

export const minutesOf = (t: HM): number => t[0] * 60 + t[1];
export const hm = (t: HM): string => `${t[0]}:${String(t[1]).padStart(2, "0")}`;
/** Daylight as "9 h 11 min" (sunset minus sunrise). */
export function daylight(rise: HM, set: HM): string {
  const m = minutesOf(set) - minutesOf(rise);
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

const MONTHS: Record<Locale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const WEEKDAYS: Record<Locale, string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** "21 de desembre", "21 de diciembre", "21 December"; with `year`, "... de 2026" / "21 December 2026". */
export function dm(iso: string, L: Locale, year = false): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const day = d.getUTCDate();
  const month = MONTHS[L][d.getUTCMonth()]!;
  const y = d.getUTCFullYear();
  if (L === "en") return `${day} ${month}${year ? ` ${y}` : ""}`;
  const de = L === "ca" && /^[ao]/.test(month) ? "d'" : "de ";
  return `${day} ${de}${month}${year ? ` de ${y}` : ""}`;
}
/** "dilluns 21 de desembre", "lunes 21 de diciembre", "Monday 21 December". */
export function wdm(iso: string, L: Locale, year = false): string {
  return `${WEEKDAYS[L][new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${dm(iso, L, year)}`;
}
/** "del 2 al 14 de desembre" / "del 31 de desembre al 7 de gener". */
function fromTo(a: string, b: string, L: Locale): string {
  const sameMonth = a.slice(0, 7) === b.slice(0, 7);
  const da = Number(a.slice(8));
  if (L === "en") return sameMonth ? `${da}-${dm(b, L)}` : `${dm(a, L)} - ${dm(b, L)}`;
  if (sameMonth) return `del ${da} al ${dm(b, L)}`;
  return `del ${dm(a, L)} al ${dm(b, L)}`;
}

const SEASON_NAME: Record<Locale, Record<string, string>> = {
  ca: { spring: "Primavera", summer: "Estiu", autumn: "Tardor", winter: "Hivern" },
  es: { spring: "Primavera", summer: "Verano", autumn: "Otoño", winter: "Invierno" },
  en: { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" },
};

function h2(text: string, id: string): Block {
  return { type: "heading", level: 2, text, id } as Block;
}
function p(text: string): Block {
  return { type: "paragraph", text } as Block;
}

/* ------------------------------------------------------------------------ */

const W = WINTER_2026;
const BCN = SOLSTICE_SUN[0]!;
const MAD = SOLSTICE_SUN[4]!;
const BCN_EL = EARLY_LATE[0]!;
const G = GEMINIDS_2026;
const [lastChange, nextChange] = [changesInYear(2026)[1]!.date, changesInYear(2027)[0]!.date];
const ign = (L: Locale, label?: string) => `[${label ?? (L === "en" ? "Spain's National Astronomical Observatory (IGN)" : L === "ca" ? "l'Observatori Astronòmic Nacional (IGN)" : "el Observatorio Astronómico Nacional (IGN)")}](${IGN.winter})`;

function solsticeRows(): string[][] {
  return SOLSTICE_SUN.map((r) => [r.city, hm(r.rise), hm(r.set), daylight(r.rise, r.set), daylight(r.juneRise, r.juneSet)]);
}
function earlyLateRows(L: Locale): string[][] {
  return EARLY_LATE.map((r) => [r.city, `${hm(r.set)} (${fromTo(r.setFrom, r.setTo, L)})`, `${hm(r.rise)} (${fromTo(r.riseFrom, r.riseTo, L)})`]);
}
function festiveRows(L: Locale): string[][] {
  const label: Record<Locale, Record<string, string>> = {
    ca: { "2026-12-13": "Nit de les Gemínides", "2026-12-21": "Solstici d'hivern", "2026-12-24": "Nit de Nadal", "2026-12-25": "Nadal", "2026-12-31": "Cap d'Any", "2027-01-01": "Any Nou", "2027-01-06": "Reis", "2027-03-20": "Primer dia de primavera" },
    es: { "2026-12-13": "Noche de las Gemínidas", "2026-12-21": "Solsticio de invierno", "2026-12-24": "Nochebuena", "2026-12-25": "Navidad", "2026-12-31": "Nochevieja", "2027-01-01": "Año Nuevo", "2027-01-06": "Reyes", "2027-03-20": "Primer día de primavera" },
    en: { "2026-12-13": "Geminids night", "2026-12-21": "Winter solstice", "2026-12-24": "Christmas Eve", "2026-12-25": "Christmas Day", "2026-12-31": "New Year's Eve", "2027-01-01": "New Year's Day", "2027-01-06": "Three Kings", "2027-03-20": "First day of spring" },
  };
  return BARCELONA_DAYS.map((r) => [`${wdm(r.date, L, true)}`, label[L][r.date]!, hm(r.rise), hm(r.set), daylight(r.rise, r.set)]);
}
function seasonRows(L: Locale): string[][] {
  const pending = { ca: "per publicar", es: "por publicar", en: "not yet published" }[L];
  return SEASONS.map((s) => [
    `${SEASON_NAME[L][s.key]} ${s.key === "winter" ? `${s.date.slice(0, 4)}-${Number(s.date.slice(0, 4)) + 1}` : s.date.slice(0, 4)}`,
    wdm(s.date, L, true),
    s.time ?? pending,
    s.days === null ? pending : L === "en" ? `about ${s.days} days ${s.hours} h` : L === "ca" ? `uns ${s.days} dies i ${s.hours} h` : `unos ${s.days} días y ${s.hours} h`,
  ]);
}

interface Copy {
  lead: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  whenH: string;
  when: string[];
  shortH: string;
  short: string;
  shortCaption: string;
  shortHead: string[];
  shortNote: string;
  shortAfter: string;
  earlyH: string;
  early: string;
  earlyCaption: string;
  earlyHead: string[];
  earlyAfter: string;
  festiveH: string;
  festiveCaption: string;
  festiveHead: string[];
  festiveAfter: string;
  geminidsH: string;
  geminids: string[];
  showers: string[];
  skyH: string;
  sky: string;
  skyList: string[];
  seasonsH: string;
  seasonsCaption: string;
  seasonsHead: string[];
  seasonsAfter: string;
  clockH: string;
  clock: string;
  whyH: string;
  why: string[];
  climateH: string;
  climate: string;
  faqH: string;
  faq: { question: string; answer: string }[];
  calloutTitle: string;
  callout: string;
}

function copy(L: Locale): Copy {
  const start = wdm(W.start, L, true);
  const bDay = daylight(BCN.rise, BCN.set);
  const mDay = daylight(MAD.rise, MAD.set);
  const sunTable = `[${L === "en" ? "IGN sunrise and sunset tables" : L === "ca" ? "taules de sortida i posta de sol de l'IGN" : "tablas de salida y puesta de sol del IGN"}](${IGN.sunPage})`;
  const gem = `[${L === "en" ? "IGN's Geminids page" : L === "ca" ? "pàgina de les Gemínides de l'IGN" : "página de las Gemínidas del IGN"}](${IGN.geminids})`;

  if (L === "ca") {
    return {
      lead: `**L'hivern 2026-2027 comença el ${start} a les ${W.time}, hora oficial peninsular**, segons ${ign(L)}. Durarà uns ${W.days} dies i ${W.hours} hores, fins al ${dm(W.end, L, true)}, quan comença la primavera. El 21 de desembre és el dia amb menys hores de sol de l'any: a Barcelona el sol surt a les ${hm(BCN.rise)} i es pon a les ${hm(BCN.set)} (${bDay} de llum).`,
      factsTitle: "L'hivern 2026-2027, d'un cop d'ull",
      facts: [
        { label: "Comença", value: `${start}, a les ${W.time}` },
        { label: "Acaba", value: `${dm(W.end, L, true)} (primavera)` },
        { label: "Durada", value: `Uns ${W.days} dies i ${W.hours} hores` },
        { label: "Dia més curt", value: `21 de desembre: a Barcelona, ${hm(BCN.rise)}-${hm(BCN.set)}` },
        { label: "Posta de sol més d'hora", value: `${hm(BCN_EL.set)} a Barcelona, ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}` },
        { label: "Gemínides", value: `Nits del 13 al 14 i del 14 al 15 de desembre` },
      ],
      whenH: "Quin dia i a quina hora comença l'hivern 2026?",
      when: [
        `L'hivern astronòmic comença el **${start} a les ${W.time}** (hora oficial a la península i a les Balears). És el càlcul de ${ign(L)}, que depèn del Ministeri de Transports. No és el 22: aquest any el solstici cau el dia 21, i al vespre.`,
        `L'inici de l'hivern és l'instant en què el Sol arriba al punt més al sud del seu recorregut anual. Aquell dia el Sol queda més baix que mai al migdia i fa l'arc més curt al cel; durant uns quants dies l'altura del Sol al migdia sembla no canviar, i per això se'n diu solstici (del llatí *solstitium*, "Sol quiet"). A l'hemisferi sud, al mateix instant, comença l'estiu.`,
      ],
      shortH: "El dia més curt de l'any: a quina hora surt i es pon el sol",
      short: `El 21 de desembre és el dia amb menys hores de sol. Aquestes són les hores oficials de les quatre capitals catalanes i de Madrid, segons les ${sunTable}:`,
      shortCaption: "Sortida i posta de sol el 21 de desembre de 2026 (hora oficial)",
      shortHead: ["Ciutat", "Surt el sol", "Es pon el sol", "Hores de llum", "El 21 de juny"],
      shortNote: "Hores de llum: posta menys sortida, calculades amb les hores de l'IGN. L'IGN dona per a Madrid 9 h 17 min el dia del solstici d'hivern i 15 h 3 min el dia més llarg.",
      shortAfter: `A Barcelona hi ha unes sis hores menys de llum que al juny. Arrodonit al minut, la taula de l'IGN dona les mateixes ${bDay} cada dia ${fromTo(BARCELONA_FLAT.from, BARCELONA_FLAT.to, L)}: al voltant del solstici, la durada del dia gairebé no canvia.`,
      earlyH: "Per què es fa fosc més tard abans de Nadal, però al matí no es fa de dia més d'hora",
      early: `Sembla una contradicció, però surt de les mateixes taules oficials: **la posta de sol més d'hora de l'any no és el 21 de desembre, sinó a principis de mes**, i **la sortida de sol més tard arriba a principis de gener**. A Barcelona el sol es pon a les ${hm(BCN_EL.set)} ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}, i surt a les ${hm(BCN_EL.rise)} ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}.`,
      earlyCaption: "Posta de sol més d'hora i sortida més tard, desembre de 2026 - gener de 2027",
      earlyHead: ["Ciutat", "Posta més d'hora (dies)", "Sortida més tard (dies)"],
      earlyAfter: "És a dir: a partir de mitjan desembre les tardes ja s'allarguen, però els matins es continuen enfosquint fins a la primera setmana de gener. El total d'hores de llum és el mínim al solstici.",
      festiveH: "Hores de sol a Barcelona per Nadal, Cap d'Any i Reis",
      festiveCaption: "Barcelona: sortida i posta de sol en dies assenyalats (IGN, hora oficial)",
      festiveHead: ["Dia", "Què és", "Surt el sol", "Es pon el sol", "Hores de llum"],
      festiveAfter: `Per moure't aquests dies: ${b2link("christmasTransport", L, "transport per Nadal, Cap d'Any i Reis a Barcelona")}; la nit del 31: ${b2link("newYear", L, "Cap d'Any a Barcelona")}; el 5 de gener: ${b2link("reis", L, "la Cavalcada de Reis")}.`,
      geminidsH: "Gemínides 2026: la pluja d'estels de desembre",
      geminids: [
        `Les Gemínides són la pluja d'estels més forta de l'any. El 2026 el **màxim serà el ${wdm(G.peak, L)} cap a les ${G.peakTime}** (hora oficial peninsular), segons la ${gem}. Com que el màxim dura unes 12 hores, **les millors nits són la del 13 al 14 i la del 14 al 15 de desembre**, amb fins a ${G.perHour} estels fugaços per hora.`,
        `Aquest any és bo per veure-les: la Lluna estarà il·luminada només un ${G.moonPercent} % i es pondrà a primera hora de la nit. Es veuen del ${dm(G.visibleFrom, L).replace(/ de.*/, "")} al ${dm(G.visibleTo, L)}, amb menys activitat.`,
        `Com mirar-les, segons l'IGN: un lloc fosc i sense obstacles (edificis, arbres o muntanyes), sense prismàtics ni telescopi, estirat i esperant que la vista s'acostumi a la foscor. Semblen venir de la constel·lació de Bessons, però es veuen a tot el cel: mira cap a la zona més fosca, d'esquena a la Lluna. A Barcelona, el 13 de desembre es fa fosc a les ${hm(BARCELONA_DAYS[0]!.set)}.`,
      ],
      showers: [
        "**Coma Berenícides:** 19 de desembre, de 3 a 10 meteors per hora.",
        "**Úrsides:** màxim cap al 22 de desembre, de 3 a 10 meteors per hora.",
        "**Quadràntides:** màxim cap al 4 de gener del 2027, una de les més actives de l'any amb les Gemínides i les Perseides.",
      ],
      skyH: "El cel de l'hivern 2026-2027",
      sky: `Les nits d'hivern són llargues i sovint seques: bones per mirar el cel. Al vespre es veurà Saturn, i a mitjan febrer s'hi afegiran Mart i Júpiter; a la matinada, l'hivern comença amb Venus, Mart i Júpiter. Orió, el Brau, el Ca Major (amb Sírius, l'estrella més brillant) i els Bessons dominen el cel del vespre. Altres dates, segons ${ign(L, "l'IGN")}:`,
      skyList: [
        "**Llunes plenes:** 24 de desembre (la nit de Nadal), 22 de gener i 21 de febrer.",
        "**Perihelí, 3 de gener del 2027:** la Terra passa més a prop del Sol, a poc més de 147 milions de km (uns 5 milions menys que el 5 de juliol).",
        "**Eclipsi anular de Sol, 6 de febrer:** des d'Espanya, només parcial i petit, a Canàries, Andalusia, Ceuta i Melilla.",
        "**Eclipsi penombral de Lluna, 20 de febrer:** visible des d'Europa.",
      ],
      seasonsH: "Quan comencen les estacions del 2026 i el 2027",
      seasonsCaption: "Inici de les estacions (IGN, hora oficial peninsular)",
      seasonsHead: ["Estació", "Dia", "Hora", "Durada"],
      seasonsAfter: `La primavera del 2027 comença el ${wdm(W.end, L, true)}; l'IGN encara no n'ha publicat l'hora.`,
      clockH: "L'hivern no és l'horari d'hivern",
      clock: `L'horari d'hivern va començar el ${wdm(lastChange, L)} de 2026, quan els rellotges van endarrerir una hora, i dura fins al ${wdm(nextChange, L, true)}: ${b2link("clockChange", L, "quan és el canvi d'hora")}. Per això el dia més curt a Barcelona acaba a les ${hm(BCN.set)}: sense el canvi d'octubre, el sol es pondria a les ${BCN.set[0] + 1}:${String(BCN.set[1]).padStart(2, "0")}.`,
      whyH: "Per què l'hivern és l'estació més curta, i per què no sempre comença el mateix dia",
      why: [
        `Amb poc menys de 89 dies, l'hivern és l'estació més curta a l'hemisferi nord. L'òrbita de la Terra és el·líptica i a l'hivern som més a prop del Sol, de manera que la Terra hi va més de pressa i arriba abans a l'inici de la primavera. Per comparar: l'estiu del 2026 va durar uns 93 dies i 16 hores.`,
        "L'hivern pot començar en quatre dies del calendari, del 20 al 23 de desembre. Al segle XXI, amb l'hora oficial espanyola, sempre començarà entre el 20 i el 22: el més d'hora, l'any 2096, i el més tard va ser el 2003. La diferència d'un any a l'altre ve de com encaixen els anys de traspàs amb la durada real de l'òrbita.",
      ],
      climateH: "Hivern astronòmic i temps d'hivern a Barcelona",
      climate: `L'hivern dels astrònoms comença el 21 de desembre; el fred, abans. A Barcelona, desembre, gener i febrer són els mesos més freds, amb màximes mitjanes d'uns 14 °C i mínimes d'uns 5 °C a l'aeroport (AEMET): ho tens mes a mes a ${b2link("climate", L, "el temps a Barcelona mes a mes")}. Si vols neu: ${b2link("snowNow", L, "la neu al Pirineu avui")} i ${b2link("ski", L, "les estacions d'esquí de Catalunya")}.`,
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Quan comença l'hivern 2026?", answer: `El ${start} a les ${W.time}, hora oficial peninsular, segons l'Observatori Astronòmic Nacional (IGN). Acaba el ${dm(W.end, L, true)}.` },
        { question: "L'hivern comença el 21 o el 22 de desembre?", answer: `El 2026, el 21, a les ${W.time}. Al segle XXI pot començar entre el 20 i el 22 de desembre, segons l'any.` },
        { question: "Quin és el dia més curt de l'any 2026?", answer: `El ${wdm(W.start, L)}, el dia del solstici. A Barcelona hi ha ${bDay} de llum; a Madrid, ${mDay}.` },
        { question: "A quina hora es fa fosc el dia més curt de l'any a Barcelona?", answer: `El 21 de desembre de 2026 el sol es pon a les ${hm(BCN.set)} i surt a les ${hm(BCN.rise)}. La posta més d'hora, però, és a les ${hm(BCN_EL.set)}, ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}.` },
        { question: "Quan es comencen a allargar els dies?", answer: `Les tardes, ja a partir de mitjan desembre: a Barcelona la posta torna a ser més tard a partir del 15 de desembre. Els matins no: la sortida de sol més tard (${hm(BCN_EL.rise)}) és ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}. Les hores totals de llum creixen després del solstici.` },
        { question: "Quant dura l'hivern 2026-2027?", answer: `Uns ${W.days} dies i ${W.hours} hores: del 21 de desembre de 2026 al ${dm(W.end, L, true)}. És l'estació més curta de l'any.` },
        { question: "Quan són les Gemínides 2026?", answer: `El màxim és el ${dm(G.peak, L)} cap a les ${G.peakTime}; les millors nits, la del 13 al 14 i la del 14 al 15 de desembre. La Lluna, al ${G.moonPercent} %, es pon d'hora: bon any per veure-les.` },
        { question: "Quan és la lluna plena de desembre del 2026?", answer: "El 24 de desembre, la nit de Nadal. Les següents, el 22 de gener i el 21 de febrer del 2027 (IGN)." },
      ],
      calloutTitle: "D'on surten aquestes dates",
      callout: "Totes les dates i hores són de l'Observatori Astronòmic Nacional (Institut Geogràfic Nacional, Ministeri de Transports): l'inici de les estacions, les Gemínides, el cel d'hivern i les taules oficials de sortida i posta de sol de cada capital. Les hores de llum i les dates de posta més d'hora i sortida més tard les hem calculat a partir d'aquestes taules. L'hora de la primavera del 2027 encara no és publicada.",
    };
  }

  if (L === "es") {
    return {
      lead: `**El invierno 2026-2027 empieza el ${start} a las ${W.time}, hora oficial peninsular**, según ${ign(L)}. Durará unos ${W.days} días y ${W.hours} horas, hasta el ${dm(W.end, L, true)}, cuando empieza la primavera. El 21 de diciembre es el día con menos horas de sol del año: en Barcelona el sol sale a las ${hm(BCN.rise)} y se pone a las ${hm(BCN.set)} (${bDay} de luz); en Madrid, de ${hm(MAD.rise)} a ${hm(MAD.set)}.`,
      factsTitle: "El invierno 2026-2027, de un vistazo",
      facts: [
        { label: "Empieza", value: `${start}, a las ${W.time}` },
        { label: "Termina", value: `${dm(W.end, L, true)} (primavera)` },
        { label: "Duración", value: `Unos ${W.days} días y ${W.hours} horas` },
        { label: "Día más corto", value: `21 de diciembre: en Barcelona, ${hm(BCN.rise)}-${hm(BCN.set)}` },
        { label: "Puesta de sol más temprana", value: `${hm(BCN_EL.set)} en Barcelona, ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}` },
        { label: "Gemínidas", value: `Noches del 13 al 14 y del 14 al 15 de diciembre` },
      ],
      whenH: "¿Qué día y a qué hora empieza el invierno 2026?",
      when: [
        `El invierno astronómico empieza el **${start} a las ${W.time}** (hora oficial en la península y Baleares). Es el cálculo de ${ign(L)}, que depende del Ministerio de Transportes. No es el 22: este año el solsticio cae el día 21, y por la noche.`,
        `El inicio del invierno es el instante en que el Sol llega al punto más al sur de su recorrido anual. Ese día el Sol queda más bajo que nunca a mediodía y describe el arco más corto en el cielo; durante varios días su altura a mediodía parece no cambiar, y por eso se llama solsticio (del latín *solstitium*, "Sol quieto"). En el hemisferio sur, en el mismo instante, empieza el verano.`,
      ],
      shortH: "El día más corto del año: a qué hora sale y se pone el sol",
      short: `El 21 de diciembre es el día con menos horas de sol. Estas son las horas oficiales de las cuatro capitales catalanas y de Madrid, según las ${sunTable}:`,
      shortCaption: "Salida y puesta de sol el 21 de diciembre de 2026 (hora oficial)",
      shortHead: ["Ciudad", "Sale el sol", "Se pone el sol", "Horas de luz", "El 21 de junio"],
      shortNote: "Horas de luz: puesta menos salida, calculadas con las horas del IGN. El IGN da para Madrid 9 h 17 min el día del solsticio de invierno y 15 h 3 min el día más largo.",
      shortAfter: `En Barcelona hay unas seis horas menos de luz que en junio. Redondeado al minuto, la tabla del IGN da las mismas ${bDay} cada día ${fromTo(BARCELONA_FLAT.from, BARCELONA_FLAT.to, L)}: alrededor del solsticio, la duración del día apenas cambia.`,
      earlyH: "Por qué anochece más tarde antes de Navidad, pero no amanece antes",
      early: `Parece una contradicción, pero sale de las mismas tablas oficiales: **la puesta de sol más temprana del año no es el 21 de diciembre, sino a principios de mes**, y **la salida del sol más tardía llega a principios de enero**. En Barcelona el sol se pone a las ${hm(BCN_EL.set)} ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}, y sale a las ${hm(BCN_EL.rise)} ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}.`,
      earlyCaption: "Puesta de sol más temprana y salida más tardía, diciembre de 2026 - enero de 2027",
      earlyHead: ["Ciudad", "Puesta más temprana (días)", "Salida más tardía (días)"],
      earlyAfter: "Es decir: desde mediados de diciembre las tardes ya se alargan, pero las mañanas siguen oscureciéndose hasta la primera semana de enero. El total de horas de luz es mínimo en el solsticio.",
      festiveH: "Horas de sol en Barcelona en Navidad, Nochevieja y Reyes",
      festiveCaption: "Barcelona: salida y puesta de sol en días señalados (IGN, hora oficial)",
      festiveHead: ["Día", "Qué es", "Sale el sol", "Se pone el sol", "Horas de luz"],
      festiveAfter: `Para moverte esos días: ${b2link("christmasTransport", L, "transporte en Navidad, Nochevieja y Reyes en Barcelona")}; la noche del 31: ${b2link("newYear", L, "Nochevieja en Barcelona")}; el 5 de enero: ${b2link("reis", L, "la Cabalgata de Reyes")}.`,
      geminidsH: "Gemínidas 2026: la lluvia de estrellas de diciembre",
      geminids: [
        `Las Gemínidas son la lluvia de estrellas más fuerte del año. En 2026 el **máximo será el ${wdm(G.peak, L)} hacia las ${G.peakTime}** (hora oficial peninsular), según la ${gem}. Como el máximo dura unas 12 horas, **las mejores noches son la del 13 al 14 y la del 14 al 15 de diciembre**, con hasta ${G.perHour} estrellas fugaces por hora.`,
        `Este año es bueno para verlas: la Luna estará iluminada solo un ${G.moonPercent} % y se pondrá al principio de la noche. Se ven del ${dm(G.visibleFrom, L).replace(/ de.*/, "")} al ${dm(G.visibleTo, L)}, con menos actividad.`,
        `Cómo mirarlas, según el IGN: un lugar oscuro y sin obstáculos (edificios, árboles o montañas), sin prismáticos ni telescopio, tumbado y esperando a que la vista se acostumbre a la oscuridad. Parecen venir de la constelación de Géminis, pero se ven en todo el cielo: mira hacia la zona más oscura, de espaldas a la Luna. En Barcelona, el 13 de diciembre anochece a las ${hm(BARCELONA_DAYS[0]!.set)}.`,
      ],
      showers: [
        "**Coma Berenícidas:** 19 de diciembre, de 3 a 10 meteoros por hora.",
        "**Úrsidas:** máximo hacia el 22 de diciembre, de 3 a 10 meteoros por hora.",
        "**Cuadrántidas:** máximo hacia el 4 de enero de 2027, una de las más activas del año junto a las Gemínidas y las Perseidas.",
      ],
      skyH: "El cielo del invierno 2026-2027",
      sky: `Las noches de invierno son largas y a menudo secas: buenas para mirar el cielo. Al anochecer se verá Saturno, y a mediados de febrero se le unirán Marte y Júpiter; al amanecer, el invierno empieza con Venus, Marte y Júpiter. Orión, Tauro, Can Mayor (con Sirio, la estrella más brillante) y Géminis dominan el cielo del anochecer. Otras fechas, según ${ign(L, "el IGN")}:`,
      skyList: [
        "**Lunas llenas:** 24 de diciembre (Nochebuena), 22 de enero y 21 de febrero.",
        "**Perihelio, 3 de enero de 2027:** la Tierra pasa más cerca del Sol, a poco más de 147 millones de km (unos 5 millones menos que el 5 de julio).",
        "**Eclipse anular de Sol, 6 de febrero:** desde España, solo parcial y pequeño, en Canarias, Andalucía, Ceuta y Melilla.",
        "**Eclipse penumbral de Luna, 20 de febrero:** visible desde Europa.",
      ],
      seasonsH: "Cuándo empiezan las estaciones de 2026 y 2027",
      seasonsCaption: "Inicio de las estaciones (IGN, hora oficial peninsular)",
      seasonsHead: ["Estación", "Día", "Hora", "Duración"],
      seasonsAfter: `La primavera de 2027 empieza el ${wdm(W.end, L, true)}; el IGN aún no ha publicado la hora.`,
      clockH: "El invierno no es el horario de invierno",
      clock: `El horario de invierno empezó el ${wdm(lastChange, L)} de 2026, cuando los relojes se atrasaron una hora, y dura hasta el ${wdm(nextChange, L, true)}: ${b2link("clockChange", L, "cuándo es el cambio de hora")}. Por eso el día más corto en Barcelona acaba a las ${hm(BCN.set)}: sin el cambio de octubre, el sol se pondría a las ${BCN.set[0] + 1}:${String(BCN.set[1]).padStart(2, "0")}.`,
      whyH: "Por qué el invierno es la estación más corta, y por qué no siempre empieza el mismo día",
      why: [
        `Con algo menos de 89 días, el invierno es la estación más corta en el hemisferio norte. La órbita de la Tierra es elíptica y en invierno estamos más cerca del Sol, así que la Tierra va más deprisa y llega antes al inicio de la primavera. Para comparar: el verano de 2026 duró unos 93 días y 16 horas.`,
        "El invierno puede empezar en cuatro días del calendario, del 20 al 23 de diciembre. En el siglo XXI, con la hora oficial española, siempre empezará entre el 20 y el 22: el más temprano, en 2096, y el más tardío fue el de 2003. La diferencia de un año a otro viene de cómo encajan los años bisiestos con la duración real de la órbita.",
      ],
      climateH: "Invierno astronómico y tiempo de invierno en Barcelona",
      climate: `El invierno de los astrónomos empieza el 21 de diciembre; el frío, antes. En Barcelona, diciembre, enero y febrero son los meses más fríos, con máximas medias de unos 14 °C y mínimas de unos 5 °C en el aeropuerto (AEMET): lo tienes mes a mes en ${b2link("climate", L, "el tiempo en Barcelona mes a mes")}. Si buscas nieve: ${b2link("snowNow", L, "la nieve en el Pirineo hoy")} y ${b2link("ski", L, "las estaciones de esquí de Cataluña")}.`,
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Cuándo empieza el invierno 2026 en España?", answer: `El ${start} a las ${W.time}, hora oficial peninsular, según el Observatorio Astronómico Nacional (IGN). Termina el ${dm(W.end, L, true)}.` },
        { question: "¿El invierno empieza el 21 o el 22 de diciembre?", answer: `En 2026, el 21, a las ${W.time}. En el siglo XXI puede empezar entre el 20 y el 22 de diciembre, según el año.` },
        { question: "¿Cuál es el día más corto del año 2026?", answer: `El ${wdm(W.start, L)}, el día del solsticio. En Barcelona hay ${bDay} de luz; en Madrid, ${mDay}.` },
        { question: "¿A qué hora anochece el día más corto del año en Barcelona?", answer: `El 21 de diciembre de 2026 el sol se pone a las ${hm(BCN.set)} y sale a las ${hm(BCN.rise)}. La puesta más temprana, sin embargo, es a las ${hm(BCN_EL.set)}, ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}.` },
        { question: "¿Cuándo empiezan a alargarse los días?", answer: `Las tardes, ya desde mediados de diciembre: en Barcelona la puesta vuelve a ser más tarde a partir del 15 de diciembre. Las mañanas no: la salida del sol más tardía (${hm(BCN_EL.rise)}) es ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}. Las horas totales de luz crecen después del solsticio.` },
        { question: "¿Cuánto dura el invierno 2026-2027?", answer: `Unos ${W.days} días y ${W.hours} horas: del 21 de diciembre de 2026 al ${dm(W.end, L, true)}. Es la estación más corta del año.` },
        { question: "¿Cuándo son las Gemínidas 2026?", answer: `El máximo es el ${dm(G.peak, L)} hacia las ${G.peakTime}; las mejores noches, la del 13 al 14 y la del 14 al 15 de diciembre. La Luna, al ${G.moonPercent} %, se pone pronto: buen año para verlas.` },
        { question: "¿Cuándo es la luna llena de diciembre de 2026?", answer: "El 24 de diciembre, en Nochebuena. Las siguientes, el 22 de enero y el 21 de febrero de 2027 (IGN)." },
      ],
      calloutTitle: "De dónde salen estas fechas",
      callout: "Todas las fechas y horas son del Observatorio Astronómico Nacional (Instituto Geográfico Nacional, Ministerio de Transportes): el inicio de las estaciones, las Gemínidas, el cielo de invierno y las tablas oficiales de salida y puesta de sol de cada capital. Las horas de luz y las fechas de puesta más temprana y salida más tardía las hemos calculado a partir de esas tablas. La hora de la primavera de 2027 aún no está publicada.",
    };
  }

  return {
    lead: `**Winter 2026-27 begins on ${start} at ${W.time}, Spanish mainland time**, according to ${ign(L)}. It lasts about ${W.days} days and ${W.hours} hours, until ${dm(W.end, L, true)}, when spring begins. 21 December is the day with the fewest hours of sunlight of the year: in Barcelona the sun rises at ${hm(BCN.rise)} and sets at ${hm(BCN.set)} (${bDay} of daylight).`,
    factsTitle: "Winter 2026-27 at a glance",
    facts: [
      { label: "Begins", value: `${start}, at ${W.time}` },
      { label: "Ends", value: `${dm(W.end, L, true)} (spring)` },
      { label: "Length", value: `About ${W.days} days and ${W.hours} hours` },
      { label: "Shortest day", value: `21 December: in Barcelona, ${hm(BCN.rise)}-${hm(BCN.set)}` },
      { label: "Earliest sunset", value: `${hm(BCN_EL.set)} in Barcelona, ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}` },
      { label: "Geminids", value: "Nights of 13-14 and 14-15 December" },
    ],
    whenH: "What day and time does winter start in 2026?",
    when: [
      `Astronomical winter begins on **${start} at ${W.time}** (official time on the mainland and the Balearic Islands). The time is calculated by ${ign(L)}, part of the Ministry of Transport. It is not the 22nd: this year the solstice falls on the 21st, in the evening.`,
      `The start of winter is the moment the Sun reaches the southernmost point of its yearly path. That day the Sun is at its lowest at noon and draws its shortest arc across the sky; for several days its noon height seems not to change, hence the name solstice (Latin *solstitium*, "the Sun standing still"). At the same moment, summer begins in the southern hemisphere.`,
    ],
    shortH: "The shortest day of the year: sunrise and sunset times",
    short: `21 December is the day with the fewest hours of sunlight. These are the official times for Catalonia's four provincial capitals and Madrid, from the ${sunTable}:`,
    shortCaption: "Sunrise and sunset on 21 December 2026 (official time)",
    shortHead: ["City", "Sunrise", "Sunset", "Daylight", "On 21 June"],
    shortNote: "Daylight: sunset minus sunrise, worked out from IGN's times. IGN gives Madrid 9 h 17 min on the winter solstice and 15 h 3 min on the longest day.",
    shortAfter: `Barcelona gets about six hours less daylight than in June. Rounded to the minute, IGN's table gives the same ${bDay} every day ${fromTo(BARCELONA_FLAT.from, BARCELONA_FLAT.to, L)}: around the solstice the length of the day hardly changes.`,
    earlyH: "Why evenings get lighter before Christmas but mornings do not",
    early: `It looks like a contradiction, but it comes from the same official tables: **the earliest sunset of the year is not on 21 December but early in the month**, and **the latest sunrise comes in early January**. In Barcelona the sun sets at ${hm(BCN_EL.set)} on ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}, and rises at ${hm(BCN_EL.rise)} on ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}.`,
    earlyCaption: "Earliest sunset and latest sunrise, December 2026 - January 2027",
    earlyHead: ["City", "Earliest sunset (days)", "Latest sunrise (days)"],
    earlyAfter: "So from mid-December the evenings are already drawing out, while the mornings keep getting darker until the first week of January. Total daylight is at its lowest on the solstice.",
    festiveH: "Daylight in Barcelona at Christmas, New Year and Three Kings",
    festiveCaption: "Barcelona: sunrise and sunset on key days (IGN, official time)",
    festiveHead: ["Day", "What it is", "Sunrise", "Sunset", "Daylight"],
    festiveAfter: `Getting around on those days: ${b2link("christmasTransport", L, "Barcelona public transport over Christmas, New Year and Three Kings")}; the night of the 31st: ${b2link("newYear", L, "New Year's Eve in Barcelona")}; 5 January: ${b2link("reis", L, "the Three Kings parade")}.`,
    geminidsH: "Geminids 2026: December's meteor shower",
    geminids: [
      `The Geminids are the strongest meteor shower of the year. In 2026 the **peak is on ${wdm(G.peak, L)} at around ${G.peakTime}** (Spanish mainland time), according to ${gem}. The peak is broad, about 12 hours, so **the best nights are 13-14 and 14-15 December**, with up to ${G.perHour} shooting stars an hour.`,
      `It is a good year to see them: the Moon will be only about ${G.moonPercent}% lit and will set early in the night. They can be seen from ${dm(G.visibleFrom, L).replace(/ .*/, "")} to ${dm(G.visibleTo, L)}, with less activity.`,
      `How to watch, according to IGN: a dark place with no obstacles (buildings, trees or mountains), no binoculars or telescope, lying down and waiting for your eyes to get used to the dark. They seem to come from the constellation Gemini but appear all over the sky: look at the darkest part, away from the Moon. In Barcelona it gets dark at ${hm(BARCELONA_DAYS[0]!.set)} on 13 December.`,
    ],
    showers: [
      "**Coma Berenicids:** 19 December, 3 to 10 meteors an hour.",
      "**Ursids:** peak around 22 December, 3 to 10 meteors an hour.",
      "**Quadrantids:** peak around 4 January 2027, one of the year's most active with the Geminids and the Perseids.",
    ],
    skyH: "The winter sky 2026-27",
    sky: `Winter nights are long and often dry, good for stargazing. Saturn is visible at dusk, joined by Mars and Jupiter in mid-February; before dawn, winter begins with Venus, Mars and Jupiter. Orion, Taurus, Canis Major (with Sirius, the brightest star) and Gemini fill the evening sky. Other dates, according to ${ign(L, "IGN")}:`,
    skyList: [
      "**Full moons:** 24 December (Christmas Eve), 22 January and 21 February.",
      "**Perihelion, 3 January 2027:** the Earth is at its closest to the Sun, just over 147 million km (about 5 million less than on 5 July).",
      "**Annular solar eclipse, 6 February:** from Spain only a small partial eclipse, in the Canary Islands, Andalusia, Ceuta and Melilla.",
      "**Penumbral lunar eclipse, 20 February:** visible from Europe.",
    ],
    seasonsH: "When the seasons start in 2026 and 2027",
    seasonsCaption: "Start of the seasons (IGN, Spanish mainland time)",
    seasonsHead: ["Season", "Day", "Time", "Length"],
    seasonsAfter: `Spring 2027 begins on ${wdm(W.end, L, true)}; IGN has not published the time yet.`,
    clockH: "Winter is not winter time",
    clock: `Winter time began on ${wdm(lastChange, L)} 2026, when the clocks went back an hour, and lasts until ${wdm(nextChange, L, true)}: ${b2link("clockChange", L, "when the clocks change in Spain")}. That is why the shortest day in Barcelona ends at ${hm(BCN.set)}: without October's change, the sun would set at ${BCN.set[0] + 1}:${String(BCN.set[1]).padStart(2, "0")}.`,
    whyH: "Why winter is the shortest season, and why it does not always start on the same day",
    why: [
      "At just under 89 days, winter is the shortest season in the northern hemisphere. The Earth's orbit is an ellipse and in winter we are closest to the Sun, so the Earth moves faster and reaches the start of spring sooner. For comparison, summer 2026 lasted about 93 days and 16 hours.",
      "Winter can start on four calendar days, 20 to 23 December. In the 21st century, on Spanish official time, it always starts between the 20th and the 22nd: the earliest in 2096; the latest was in 2003. The year-to-year shift comes from how leap years fit the real length of the orbit.",
    ],
    climateH: "Astronomical winter and winter weather in Barcelona",
    climate: `Astronomers' winter starts on 21 December; the cold comes earlier. In Barcelona, December, January and February are the coldest months, with average highs of about 14 °C and lows of about 5 °C at the airport (AEMET): month by month in ${b2link("climate", L, "Barcelona weather by month")}. For snow: ${b2link("snowNow", L, "snow in the Pyrenees today")} and ${b2link("ski", L, "ski resorts in Catalonia")}.`,
    faqH: "Frequently asked questions",
    faq: [
      { question: "When does winter start in 2026 in Spain?", answer: `On ${start} at ${W.time}, Spanish mainland time, according to the National Astronomical Observatory (IGN). It ends on ${dm(W.end, L, true)}.` },
      { question: "Does winter start on 21 or 22 December?", answer: `In 2026, on the 21st, at ${W.time}. In the 21st century it can start between 20 and 22 December, depending on the year.` },
      { question: "What is the shortest day of 2026?", answer: `${wdm(W.start, L)}, the solstice. Barcelona gets ${bDay} of daylight; Madrid ${mDay}.` },
      { question: "What time does it get dark on the shortest day in Barcelona?", answer: `On 21 December 2026 the sun sets at ${hm(BCN.set)} and rises at ${hm(BCN.rise)}. The earliest sunset, though, is ${hm(BCN_EL.set)}, on ${fromTo(BCN_EL.setFrom, BCN_EL.setTo, L)}.` },
      { question: "When do the days start getting longer?", answer: `The evenings, from mid-December: in Barcelona sunset starts getting later from 15 December. The mornings do not: the latest sunrise (${hm(BCN_EL.rise)}) is on ${fromTo(BCN_EL.riseFrom, BCN_EL.riseTo, L)}. Total daylight grows after the solstice.` },
      { question: "How long is winter 2026-27?", answer: `About ${W.days} days and ${W.hours} hours: from 21 December 2026 to ${dm(W.end, L, true)}. It is the shortest season of the year.` },
      { question: "When are the Geminids in 2026?", answer: `The peak is on ${dm(G.peak, L)} at around ${G.peakTime}; the best nights are 13-14 and 14-15 December. The Moon, about ${G.moonPercent}% lit, sets early: a good year to watch.` },
      { question: "When is the December 2026 full moon?", answer: "On 24 December, Christmas Eve. The next ones are on 22 January and 21 February 2027 (IGN)." },
    ],
    calloutTitle: "Where these dates come from",
    callout: "Every date and time is from Spain's National Astronomical Observatory (National Geographic Institute, Ministry of Transport): the start of the seasons, the Geminids, the winter sky and the official sunrise and sunset tables for each capital. Daylight and the dates of the earliest sunset and latest sunrise are worked out from those tables. The time of spring 2027 has not been published yet.",
  };
}

export function buildWinterStartBody(L: Locale): Block[] {
  const t = copy(L);
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    h2(t.whenH, "when"),
    ...t.when.map(p),
    h2(t.shortH, "shortest-day"),
    p(t.short),
    table(t.shortCaption, t.shortHead, solsticeRows(), t.shortNote),
    p(t.shortAfter),
    h2(t.earlyH, "sunset-sunrise"),
    p(t.early),
    table(t.earlyCaption, t.earlyHead, earlyLateRows(L)),
    p(t.earlyAfter),
    h2(t.festiveH, "christmas-daylight"),
    table(t.festiveCaption, t.festiveHead, festiveRows(L)),
    p(t.festiveAfter),
    h2(t.geminidsH, "geminids"),
    ...t.geminids.map(p),
    list(...t.showers),
    h2(t.skyH, "winter-sky"),
    p(t.sky),
    list(...t.skyList),
    h2(t.seasonsH, "seasons"),
    table(t.seasonsCaption, t.seasonsHead, seasonRows(L)),
    p(t.seasonsAfter),
    h2(t.clockH, "winter-time"),
    p(t.clock),
    h2(t.whyH, "why"),
    ...t.why.map(p),
    h2(t.climateH, "weather"),
    p(t.climate),
    h2(t.faqH, "faq"),
    faq(t.faq),
    callout("official", t.calloutTitle, t.callout),
    p(verifiedLine(L, WINTER_AS_OF)),
    ...b2Related(["climate", "clockChange", "barcelonaDecember", "barcelonaWinter", "christmasTransport", "snowNow"], L),
  ];
}

const META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Quan comença l'hivern 2026: el 21 de desembre a les 21:50, el dia més curt i el cel d'hivern",
    seoTitle: "Quan comença l'hivern 2026? El 21 de desembre a les 21:50",
    seoDescription: `L'hivern comença el dilluns 21 de desembre de 2026 a les 21:50 (IGN). Dia més curt: a Barcelona surt el sol a les ${hm(BCN.rise)} i es pon a les ${hm(BCN.set)}. Gemínides, 13-14 de desembre.`,
    excerpt: "L'inici de l'hivern 2026-2027 segons l'Observatori Astronòmic Nacional, el dia més curt amb les hores de sol a Barcelona, Girona, Lleida i Tarragona, les Gemínides i el cel d'hivern.",
  },
  es: {
    title: "Cuándo empieza el invierno 2026: el 21 de diciembre a las 21:50, el día más corto y el cielo de invierno",
    seoTitle: "¿Cuándo empieza el invierno 2026? El 21 de diciembre, 21:50",
    seoDescription: `El invierno empieza el lunes 21 de diciembre de 2026 a las 21:50 (IGN). Día más corto: en Barcelona sale el sol a las ${hm(BCN.rise)} y se pone a las ${hm(BCN.set)}. Gemínidas, 13-14 de diciembre.`,
    excerpt: "El inicio del invierno 2026-2027 según el Observatorio Astronómico Nacional, el día más corto con las horas de sol en Barcelona, Girona, Lleida, Tarragona y Madrid, las Gemínidas y el cielo de invierno.",
  },
  en: {
    title: "When does winter start in 2026? 21 December at 21:50, the shortest day and the winter sky",
    seoTitle: "When does winter start in 2026? 21 December, 21:50 in Spain",
    seoDescription: `Winter starts on Monday 21 December 2026 at 21:50, Spanish time (IGN). Shortest day: in Barcelona the sun rises at ${hm(BCN.rise)} and sets at ${hm(BCN.set)}. Geminids: 13-14 December.`,
    excerpt: "The start of winter 2026-27 from Spain's National Astronomical Observatory, the shortest day with sunrise and sunset in Barcelona, Girona, Lleida and Tarragona, the Geminids and the winter sky.",
  },
};

export const WINTER_START_META = META;

export const WINTER_START_GUIDE: B2Article = {
  key: "winterStart",
  entryKey: "guide-when-does-winter-start",
  categoryKey: "public-services",
  sources: WINTER_SOURCES,
  // Reused from the manifest (Wikimedia Commons, CC0, credit in images.ts), same photo as the weather guide's hero.
  heroKey: "clima-rambla-sol-hivern",
  heroAlt: {
    ca: "La Rambla de Barcelona un dia assolellat de gener, amb gent amb abric i els plàtans sense fulles",
    es: "La Rambla de Barcelona un día soleado de enero, con gente con abrigo y los plátanos sin hojas",
    en: "La Rambla in Barcelona on a sunny January day, people in coats under bare plane trees",
  },
  heroCaption: {
    ca: "Sol baix d'hivern a la Rambla de Barcelona.",
    es: "Sol bajo de invierno en la Rambla de Barcelona.",
    en: "Low winter sun on La Rambla, Barcelona.",
  },
  verifiedAt: WINTER_AS_OF,
  publishedAt: "2026-11-27T04:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.winterStart[locale], ...META[locale], blocks: buildWinterStartBody(locale) }]),
  ) as B2Article["editions"],
};
