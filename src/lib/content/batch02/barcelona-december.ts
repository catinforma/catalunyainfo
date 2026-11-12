import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, daysBetween, holidayOn, isAranOnly, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { metroDay } from "@/lib/content/metro/tonight";
import { agendaPageUrl } from "@/lib/content/pessebres/agenda";
import type { Locale } from "@/lib/i18n/config";
import { townBySlug } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath, townPath as fairsTownPath } from "@/lib/programmatic/christmas-fairs/paths";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";

import { CHRISTMAS, FAMILY, SANTA_LLUCIA_2025, hoursText } from "./christmas";
import { metroTable, when } from "./christmas-barcelona";
import { LIGHTS_TOWNS } from "./christmas-lights-towns";
import { ANNOUNCED_TRADITIONS, pastoretsSentence, range, santaLluciaSource, type TraditionAnnouncements } from "./christmas-traditions";
import { CLIMATE, climateMonth, WINTER_START } from "./climate";
import { BRIDGE_DAYS, LOCAL_MONDAY_7, runWords } from "./december-bridge";
import {
  ANNOUNCED_2026,
  DAYS,
  FESTIVE_VERIFIED,
  LIGHTS_PLAN_2026,
  PAST,
  SIGHT_SOURCES,
  SWITCH_ON_HISTORY,
  WATCH,
  dateYear,
  dayDate,
  sightRows,
  type Announcement,
  type Announcements,
} from "./festive";
import { DRAW_TIME_2026, GROSSA_DRAW_DATE, GROSSA_URLS, type DrawTime } from "./grossa";
import { MARATO } from "./marato";
import { KNOWN as NATIVITIES } from "./pessebres";
import { SKI, SKI_OPENING_2026 } from "./ski";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Barcelona in December 2026: the dated hub for the month, over the pages
 * that already answer each part of it (the lights, the markets, the bridge,
 * La Marató, the nativities, New Year's Eve, La Grossa, shops, weather,
 * metro, ski).
 *
 * Nothing here is typed twice. Holidays come from the Catalonia calendar
 * (Ordre EMT/66/2025), Barcelona's shop-opening days and local holidays from
 * the holiday engine's snapshot of Resolució EMT/4342/2025 and Ordre
 * EMT/208/2025, metro hours from TMB's standing rules (`metroDay`), sights
 * from `festive.ts`, weather from the climate guide's AEMET/Meteocat tables,
 * and the dated events from their own modules (MARATO, GROSSA_DRAW_DATE,
 * SKI_OPENING_2026, the Torre del Suro nativity in KNOWN).
 *
 * Read on 31 Oct 2026 (research_notes/barcelona-december.md):
 *  - firadesantallucia.cat/calendari.php still headed "Calendari - 2025";
 *    the City Council's press room (home and the "nadal-2026" tag, latest
 *    Christmas item 9 Jul) and barcelona.cat/nadal ("es tornarà a actualitzar
 *    al voltant del mes de novembre del 2026"): no switch-on, nativity,
 *    New Year's Eve or parade date. So ANNOUNCED_2026 and
 *    ANNOUNCED_TRADITIONS stay empty and the page says "not announced yet".
 *  - City Council press note of 29 Oct 2026: L2 suspended between La Pau and
 *    Gorg from 2 Nov; "Es preveu la normalització de la circulació de trens
 *    el divendres 4 de desembre a les 5 de la matinada."
 *  - The Generalitat's cultural agenda (open data rhpv-yr4f, Socrata API),
 *    Barcelona rows dated in December 2026: the seven listed in
 *    AGENDA_DECEMBER, each with the agenda's own page (all returned 200).
 *    No prices are printed: they belong to the organisers and change.
 *
 * HOW TO UPDATE: the lights, the City Hall nativity, the Sant Jaume light show
 * and the New Year's Eve show switch on by themselves when ANNOUNCED_2026 is
 * filled (festive.ts); Santa Llúcia when ANNOUNCED_TRADITIONS.santaLlucia is;
 * La Grossa's time when DRAW_TIME_2026 is. Each moves from "still to be
 * announced" into the day-by-day table. Then move BARCELONA_DECEMBER_AS_OF to
 * the check date, run the tests and republish `?only=barcelona-december`.
 *
 * No new photograph: the hero is the Christmas markets guide's lead picture
 * (the Fira de Santa Llúcia at night), with its exact alt text and caption,
 * because media rows are keyed by file.
 *
 * 3 Nov 2026 (Christmas cluster refresh): Santa Llúcia is announced in the
 * Generalitat's cultural agenda (27 Nov - 23 Dec 2026, 10:00-21:00; see
 * christmas.ts SANTA_LLUCIA_2026), so it leaves "still to be announced" for
 * the day-by-day table, the key facts and the FAQ by itself, credited to the
 * agenda; the "Fires" paragraph (fairsParagraph) gives the dates and links
 * the fairs family's new Barcelona page. Re-read the same day: the press room
 * (home, "nadal-2026" and "reis" tags, searches for "llums nadal",
 * "cavalcada" and "cap d'any": latest Christmas items 8-9 Jul 2026),
 * barcelona.cat/nadal (still "es tornarà a actualitzar al voltant del mes de
 * novembre del 2026"), the Reis page (still 2026) and the seven agenda rows
 * in AGENDA_DECEMBER (same dates). So the lights, nativity scene, New Year's
 * Eve and parade stay "not announced yet", now "checked on 3 November".
 *
 * 31 Oct 2026: the "Tradicions" paragraph links the Three Kings parade page
 * (group `reis-2027-links`). Not the "still to be announced" item: that one
 * disappears once the parade is announced, and the link would go with it.
 */

/** The day the page was last brought up to date. Every "checked" line reads this, never the clock. */
export const BARCELONA_DECEMBER_AS_OF = "2026-11-03";

/** Barcelona (INE 08019) in the holiday engine's snapshot. */
const BCN = municipalityBySlug("barcelona");
if (!BCN) throw new Error("barcelona-december: Barcelona is missing from the holiday snapshot");

/** Barcelona's shop-opening days in December 2026 (Resolució EMT/4342/2025). */
export const BCN_SHOP_DAYS: readonly string[] = BCN.shops.filter((iso) => iso.startsWith("2026-12"));
/** Barcelona's two local holidays in 2026 (Ordre EMT/208/2025). */
export const BCN_LOCAL_DAYS: readonly string[] = BCN.local;

/** Every day of December 2026. */
const DECEMBER: string[] = Array.from({ length: 31 }, (_, i) => `2026-12-${String(i + 1).padStart(2, "0")}`);

/** The Catalonia-wide public holidays in December 2026 (Aran-only swaps excluded). */
export const DECEMBER_HOLIDAYS: readonly string[] = DECEMBER.filter((iso) => holidayOn(iso) !== null && !isAranOnly(iso));

/** The days the "what closes" table covers. */
export const SPECIAL_DAYS = [
  BRIDGE_DAYS.constitution,
  BRIDGE_DAYS.monday,
  BRIDGE_DAYS.immaculada,
  DAYS.christmasEve,
  DAYS.christmas,
  DAYS.santEsteve,
  DAYS.newYearsEve,
] as const;

/** The metro days the transport table lists. */
const METRO_DECEMBER = [DAYS.christmasEve, DAYS.christmas, DAYS.santEsteve, DAYS.newYearsEve] as const;

/** City Council press note of 29 Oct 2026 on the L2 works (read 31 Oct 2026). */
export const L2_WORKS = {
  /** Last day without trains between La Pau and Gorg. */
  until: "2026-12-03",
  /** Trains expected back at 5:00 on this day. */
  back: "2026-12-04",
  published: "2026-10-29",
  url: "https://ajuntament.barcelona.cat/premsa/2026/10/29/suspensio-del-servei-a-ll2-de-metro-entre-la-pau-i-gorg-des-del-dilluns-2-de-novembre-fins-al-dijous-3-de-desembre/",
} as const;

/** The Barcelona living nativity with a published 2026 date (pessebres.ts, KNOWN). */
const TORRE_DEL_SURO = NATIVITIES.find((n) => n.name.includes("Torre del Suro"));
if (!TORRE_DEL_SURO) throw new Error("barcelona-december: the Torre del Suro nativity is missing from KNOWN");
export const TORRE_DEL_SURO_2026 = { date: "2026-12-21", time: "18:00", url: TORRE_DEL_SURO.url } as const;

/* -------------------------------------------------------------------------- */
/* The cultural agenda (rhpv-yr4f), Barcelona, December 2026                  */
/* -------------------------------------------------------------------------- */

export interface AgendaItem {
  /** The agenda's `codi`; its page is agendaPageUrl(codi). */
  codi: string;
  /** The activity's name as the organiser wrote it. */
  name: string;
  venue: string;
  from: string;
  /** Last day, when it runs over several days in December. */
  to?: string;
  /** Start time as the agenda gives it, HH:MM. */
  time?: string;
  note: Record<Locale, string>;
}

/**
 * Barcelona activities in the Generalitat's cultural agenda with a December
 * 2026 date, read through the Socrata API on 31 Oct 2026. Chosen for the
 * season (Christmas, the Liceu's December titles, the two commemorations of
 * 2026: Any Gaudí and Any Pau Casals). Notes paraphrase the agenda row.
 */
export const AGENDA_DECEMBER: readonly AgendaItem[] = [
  {
    codi: "2026090200008",
    name: "Concert de carilló al Palau de la Generalitat",
    venue: "Palau de la Generalitat",
    from: "2026-12-06",
    time: "12:00",
    note: {
      ca: "Carilló i tenor, amb Jordi Mas. Cal inscriure-s'hi: les inscripcions tanquen el divendres abans del concert",
      es: "Carillón y tenor, con Jordi Mas. Hay que inscribirse: las inscripciones cierran el viernes anterior al concierto",
      en: "Carillon and tenor, with Jordi Mas. Registration required; it closes on the Friday before the concert",
    },
  },
  {
    codi: "2026092100023",
    name: "El trencanous",
    venue: "Gran Teatre del Liceu",
    from: "2026-12-08",
    to: "2026-12-12",
    note: {
      ca: "El ballet de Txaikovski, pel Badisches Staatsballett Karlsruhe",
      es: "El ballet de Chaikovski, por el Badisches Staatsballett Karlsruhe",
      en: "Tchaikovsky's Nutcracker, danced by the Badisches Staatsballett Karlsruhe",
    },
  },
  {
    codi: "2026092100025",
    name: "El conte de Nadal de Charles Dickens",
    venue: "Gran Teatre del Liceu",
    from: "2026-12-12",
    time: "11:30",
    note: {
      ca: "A Christmas Carol amb música d'Albert Guinovart; a partir de 8 anys",
      es: "Cuento de Navidad con música de Albert Guinovart; a partir de 8 años",
      en: "A Christmas Carol with music by Albert Guinovart; from age 8",
    },
  },
  {
    codi: "2026083100010",
    name: "Concert de l'Oratori El Pessebre",
    venue: "Palau de la Música Catalana",
    from: "2026-12-15",
    time: "20:00",
    note: {
      ca: "L'oratori de Pau Casals, dins l'Any Pau Casals",
      es: "El oratorio de Pau Casals, dentro del Año Pau Casals",
      en: "Pau Casals' oratorio, part of the Pau Casals year",
    },
  },
  {
    codi: "2026101600022",
    name: "El Trencanous",
    venue: "Teatre Coliseum",
    from: "2026-12-15",
    to: "2026-12-27",
    note: {
      ca: "Pel Ballet de Kíev",
      es: "Por el Ballet de Kiev",
      en: "Danced by the Kyiv Ballet",
    },
  },
  {
    codi: "20260304014",
    name: "Per Nadal l'originalitat és tornar a l'origen",
    venue: "Sagrada Família",
    from: "2026-12-18",
    time: "19:00",
    note: {
      ca: "L'Escolania de Montserrat i l'Orquestra Simfònica del Vallès obren un acte de Nadal centrat en la façana del Naixement, dins l'Any Gaudí",
      es: "La Escolania de Montserrat y la Orquestra Simfònica del Vallès abren un acto de Navidad centrado en la fachada del Nacimiento, dentro del Año Gaudí",
      en: "The Montserrat boys' choir and the Vallès Symphony Orchestra open a Christmas event centred on the Nativity façade, part of the Gaudí year",
    },
  },
  {
    codi: "2026092100028",
    name: "La bohème",
    venue: "Gran Teatre del Liceu",
    from: "2026-12-30",
    note: {
      ca: "L'òpera de Puccini, amb funcions fins al 19 de gener de 2027",
      es: "La ópera de Puccini, con funciones hasta el 19 de enero de 2027",
      en: "Puccini's opera, with performances until 19 January 2027",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Wording                                                                    */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function joinList(items: readonly string[], locale: Locale): string {
  const and = { ca: " i ", es: " y ", en: " and " }[locale];
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

/** "14,3" / "14.3". */
const num = (value: number, locale: Locale) => (locale === "en" ? value.toFixed(1) : value.toFixed(1).replace(".", ","));
/** °C to whole °F for the English edition: a unit conversion, not a new figure. */
const toF = (celsius: number) => Math.round((celsius * 9) / 5 + 32);

/** "dimarts 8" / "martes 8" / "Tuesday 8". */
function weekdayDay(iso: string, locale: Locale): string {
  return `${WEEKDAY_NAMES[locale][weekdayIndex(iso)]} ${Number(iso.slice(8, 10))}`;
}

/** "Dimarts 8 de desembre", or "Del dissabte 5 al dimarts 8 de desembre". */
export function dayLabel(from: string, to: string | undefined, locale: Locale): string {
  if (!to || to === from) return cap(dayDate(from, locale, false));
  const words = runWords({ from, to, days: daysBetween(from, to) + 1 }, locale);
  const year = to.slice(0, 4) !== from.slice(0, 4) ? (locale === "en" ? ` ${to.slice(0, 4)}` : ` de ${to.slice(0, 4)}`) : "";
  return `${cap(words)}${year}`;
}

const AS_OF: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(BARCELONA_DECEMBER_AS_OF, "ca")}`,
  es: `comprobado el ${dateYear(BARCELONA_DECEMBER_AS_OF, "es")}`,
  en: `checked on ${dateYear(BARCELONA_DECEMBER_AS_OF, "en")}`,
};

const at = (time: string | undefined, locale: Locale) => (time ? { ca: ` a les ${time}`, es: ` a las ${time}`, en: ` at ${time}` }[locale] : "");

/** The holidays as a phrase: "el dimarts 8 (la Immaculada), el divendres 25 (Nadal) i el dissabte 26 (Sant Esteve)". */
export function holidaysPhrase(locale: Locale, article = true): string {
  return joinList(
    DECEMBER_HOLIDAYS.map((iso) => {
      const name = holidayOn(iso)!.name[locale];
      const the = article && locale !== "en" ? "el " : "";
      return `${the}${weekdayDay(iso, locale)} (${name})`;
    }),
    locale,
  );
}

/** Barcelona's local holidays: "el 25 de maig i el 24 de setembre" / "25 May and 24 September". */
function localDaysPhrase(locale: Locale): string {
  return joinList(BCN_LOCAL_DAYS.map((iso) => `${locale === "en" ? "" : "el "}${shortDate(iso, locale)}`), locale);
}

/** The shop days as a phrase: "els diumenges 6, 13, 20 i 27 i el dimarts 8". */
export function shopDaysPhrase(locale: Locale): string {
  const sundays = BCN_SHOP_DAYS.filter((iso) => weekdayIndex(iso) === 0).map((iso) => String(Number(iso.slice(8))));
  const others = BCN_SHOP_DAYS.filter((iso) => weekdayIndex(iso) !== 0).map((iso) => weekdayDay(iso, locale));
  const sun = { ca: `els diumenges ${joinList(sundays, "ca")}`, es: `los domingos ${joinList(sundays, "es")}`, en: `Sundays ${joinList(sundays, "en")}` }[locale];
  if (!others.length) return sun;
  const rest = others.map((o) => ({ ca: `el ${o}`, es: `el ${o}`, en: o }[locale]));
  return joinList([sun, ...rest], locale);
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const climateSource = (part: string) => CLIMATE.sources.find((s) => s.url.includes(part));
const skiSource = (part: string) => SKI.sources.find((s) => s.url.includes(part));

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/66/2025, de 30 d'abril, calendari oficial de festes laborals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Calendari de festes laborals 2026", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/", publisher: "Departament d'Empresa i Treball" },
  { name: "Ordre EMT/208/2025, calendari de festes locals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1032232&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/77/2025, calendari d'obertura comercial en diumenges i festius per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1015009&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Resolució EMT/4342/2025, dies festius d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Ordre EDF/66/2026, calendari escolar dels cursos 2026-2027, 2027-2028 i 2028-2029", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1042830&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Metro and bus opening hours", url: WATCH.tmbHours, publisher: "TMB" },
  { name: "Suspensió del servei a l'L2 de metro entre La Pau i Gorg fins al dijous 3 de desembre", url: L2_WORKS.url, publisher: "Ajuntament de Barcelona" },
  { name: "Sagrada Família: schedules", url: SIGHT_SOURCES.sagradaFamilia, publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "La Pedrera: practical information", url: SIGHT_SOURCES.pedrera, publisher: "Fundació Catalunya La Pedrera" },
  { name: "Casa Batlló: opening hours", url: SIGHT_SOURCES.batllo, publisher: "Casa Batlló" },
  { name: "MNAC: horaris i preus", url: SIGHT_SOURCES.mnac, publisher: "Museu Nacional d'Art de Catalunya" },
  { name: "Museu Picasso: tickets and opening hours", url: SIGHT_SOURCES.picasso, publisher: "Museu Picasso" },
  ...[climateSource("valoresclimatologicos?l=0076"), climateSource("efemerides_extremos"), climateSource("X4_2010-2025"), climateSource("astronomia.ign.es")].filter((s): s is B2Source => Boolean(s)),
  { name: "Barcelona consolida el festival de Llums de Nadal (pla del 2026)", url: LIGHTS_PLAN_2026.url, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona encendrà els llums de Nadal el dissabte 22 de novembre (2025)", url: PAST.lights2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Servei de Premsa: Nadal 2026", url: WATCH.pressTag, publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: WATCH.christmasSite, publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Santa Llúcia: calendari", url: SANTA_LLUCIA_2025.url, publisher: "Associació Fira de Santa Llúcia" },
  { name: "La Marató 2026", url: MARATO.hub2026.ca, publisher: "Fundació La Marató de 3Cat" },
  { name: "La Grossa de Cap d'Any: el joc, els premis i el sorteig", url: GROSSA_URLS.game, publisher: "Loteries de Catalunya" },
  { name: "Agenda cultural de Catalunya (dades obertes)", url: "https://analisi.transparenciacatalunya.cat/d/rhpv-yr4f", publisher: "Departament de Cultura, Generalitat de Catalunya" },
  ...(ANNOUNCED_TRADITIONS.santaLlucia?.via === "agenda"
    ? [{ name: "Agenda Cultural de Catalunya: Fira de Santa Llúcia a l'Avinguda de la Catedral de Barcelona (2026)", url: ANNOUNCED_TRADITIONS.santaLlucia.url, publisher: "Departament de Cultura, Generalitat de Catalunya" }]
    : []),
  { name: "Carilló del Palau de la Generalitat", url: "https://presidencia.gencat.cat/ca/ambits_d_actuacio/palau-de-la-generalitat/carillo-del-palau/", publisher: "Generalitat de Catalunya" },
  { name: "33è Pessebre Vivent de la Torre del Suro", url: TORRE_DEL_SURO_2026.url, publisher: TORRE_DEL_SURO.publisher },
  ...[skiSource("baqueira-beret-activa-el-invierno"), skiSource("lamolina/estacio/informacio-tecnica")].filter((s): s is B2Source => Boolean(s)),
];

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

const W = climateMonth(11);

/**
 * "Hi haurà prop de 140 km de carrers il·luminats" once the switch-on note
 * gives the length, else the 9 Jul plan's "Per al 2026 preveu 130 km".
 */
function lightsKm(locale: Locale, facts: Announcements): string {
  const km = facts.lightsSwitchOn?.km;
  if (km) return { ca: `Hi haurà prop de ${km} km de carrers il·luminats`, es: `Habrá cerca de ${km} km de calles iluminadas`, en: `There will be about ${km} km of lit streets` }[locale];
  return { ca: `Per al 2026 preveu ${LIGHTS_PLAN_2026.km} km de carrers il·luminats`, es: `Para 2026 prevé ${LIGHTS_PLAN_2026.km} km de calles iluminadas`, en: `For 2026 it plans ${LIGHTS_PLAN_2026.km} km of lit streets` }[locale];
}

export const BARCELONA_DECEMBER_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/barcelona-al-desembre",
    title: "Què fer a Barcelona al desembre 2026: agenda, festius i què obre",
    seoTitle: "Què fer a Barcelona al desembre 2026: agenda i festius",
    seoDescription: `Què fer a Barcelona al desembre del 2026: festius el 8, 25 i 26, diumenges d'obertura comercial, La Marató el 13 i màximes de ${num(W.high, "ca")} °C. Dia a dia.`,
    excerpt: "El desembre del 2026 a Barcelona en una pàgina: els festius i què tanca, les botigues, el metro, el temps, els llums i les fires, i les dates clau, dia a dia.",
  },
  es: {
    path: "guias/barcelona-en-diciembre",
    title: "Qué hacer en Barcelona en diciembre 2026: agenda, festivos y qué abre",
    seoTitle: "Qué hacer en Barcelona en diciembre 2026: agenda y festivos",
    seoDescription: `Qué hacer en Barcelona en diciembre de 2026: festivos el 8, 25 y 26, domingos de apertura comercial, La Marató el 13 y máximas de ${num(W.high, "es")} °C. Día a día.`,
    excerpt: "Diciembre de 2026 en Barcelona en una página: los festivos y qué cierra, las tiendas, el metro, el tiempo, las luces y las ferias, y las fechas clave, día a día.",
  },
  en: {
    path: "guides/barcelona-in-december",
    title: "Barcelona in December 2026: what's on, holidays and what's open",
    seoTitle: "Barcelona in December 2026: what's on, holidays, weather",
    seoDescription: `Barcelona in December 2026: holidays on the 8th, 25th and 26th, Sunday shop openings, La Marató on the 13th, ${num(W.high, "en")} °C highs. Key dates, day by day.`,
    excerpt: "December 2026 in Barcelona on one page: public holidays and what closes, shops, the metro, the weather, the lights and markets, and the key dates day by day.",
  },
};

/* -------------------------------------------------------------------------- */
/* Day by day                                                                 */
/* -------------------------------------------------------------------------- */

interface Entry {
  from: string;
  to?: string;
  text: string;
  source: string;
}

const SRC = {
  holidays: { ca: "Ordre EMT/66/2025 (DOGC)", es: "Orden EMT/66/2025 (DOGC)", en: "Order EMT/66/2025 (DOGC)" },
  shops: { ca: "Resolució EMT/4342/2025 (DOGC)", es: "Resolución EMT/4342/2025 (DOGC)", en: "Resolution EMT/4342/2025 (DOGC)" },
  tmb: { ca: "Horari de TMB", es: "Horario de TMB", en: "TMB timetable" },
  ski: { ca: "Calendari de cada estació", es: "Calendario de cada estación", en: "Each resort's calendar" },
  school: { ca: "Ordre EDF/66/2026 (DOGC)", es: "Orden EDF/66/2026 (DOGC)", en: "Order EDF/66/2026 (DOGC)" },
  ign: { ca: "Institut Geogràfic Nacional", es: "Instituto Geográfico Nacional", en: "Spain's National Geographic Institute" },
} as const;

function agendaSource(codi: string, locale: Locale): string {
  const label = { ca: "Agenda Cultural de Catalunya", es: "Agenda Cultural de Catalunya", en: "Catalan government's cultural agenda" }[locale];
  return `[${label}](${agendaPageUrl(codi)})`;
}

function councilSource(url: string, locale: Locale): string {
  return `[${{ ca: "Ajuntament de Barcelona", es: "Ayuntamiento de Barcelona", en: "Barcelona City Council" }[locale]}](${url})`;
}

/** The "how we handle dates" callout's last sentence: what is still undated, from the slots. */
function stillUndated(locale: Locale, facts: Announcements, traditions: TraditionAnnouncements): string {
  const names = {
    ca: [!facts.lightsSwitchOn && "els llums", !traditions.santaLlucia && "la Fira de Santa Llúcia", !facts.newYearShow && "la festa de Cap d'Any"],
    es: [!facts.lightsSwitchOn && "las luces", !traditions.santaLlucia && "la Fira de Santa Llúcia", !facts.newYearShow && "la fiesta de Nochevieja"],
    en: [!facts.lightsSwitchOn && "the lights", !traditions.santaLlucia && "the Fira de Santa Llúcia", !facts.newYearShow && "the New Year's Eve show"],
  }[locale].filter((n): n is string => Boolean(n));
  if (names.length === 0) return { ca: "Tot el que ja és oficial és a la taula.", es: "Todo lo que ya es oficial está en la tabla.", en: "Everything already official is in the table." }[locale];
  const list = names.length === 1 ? names[0]! : `${names.slice(0, -1).join(", ")}${{ ca: " i ", es: " y ", en: " and " }[locale]}${names.at(-1)}`;
  const subject = `${list.charAt(0).toUpperCase()}${list.slice(1)}`;
  const one = names.length === 1;
  return {
    ca: `${subject} encara no ${one ? "té data" : "tenen data"} (${AS_OF.ca}): ${one ? "l'afegim el dia que sigui oficial" : "les afegim el dia que siguin oficials"}.`,
    es: `${subject} aún no ${one ? "tiene fecha" : "tienen fecha"} (${AS_OF.es}): ${one ? "la añadimos el día que sea oficial" : "las añadimos el día que sean oficiales"}.`,
    en: `${subject} ${one ? "has" : "have"} no date yet (${AS_OF.en}): we add each one the day it becomes official.`,
  }[locale];
}

/** The fairs family's Barcelona page, linked only while it exists (Barcelona has a dated fair in the snapshot). */
function bcnFairsPage(locale: Locale, label: string): string {
  return townBySlug("barcelona") ? `[${label}](${fairsTownPath(locale, "barcelona")})` : label;
}

/** The "Fires" paragraph: Santa Llúcia's dates once announced, the Sagrada Família, and the rest of Catalonia. */
export function fairsParagraph(locale: Locale, traditions: TraditionAnnouncements = ANNOUNCED_TRADITIONS): string {
  const s = traditions.santaLlucia;
  const hub = { ca: `[fires de Nadal per municipi](${fairsHubPath("ca")})`, es: `[ferias de Navidad por municipio](${fairsHubPath("es")})`, en: `[Christmas markets by town](${fairsHubPath("en")})` }[locale];
  const guide = { ca: b2link("christmas", "ca", "la guia de mercats de Nadal"), es: b2link("christmas", "es", "la guía de mercados de Navidad"), en: b2link("christmas", "en", "our Christmas markets guide") }[locale];
  if (s) {
    const hours = s.hours ? `, ${hoursText(s.hours, locale)}` : "";
    return {
      ca: `**Fires.** La Fira de Santa Llúcia es fa ${range(s.from, s.to, "ca")}${hours}, davant de la Catedral, segons ${santaLluciaSource(s, "ca")}; com arribar-hi i què és festiu aquells dies, a ${bcnFairsPage("ca", "fires de Nadal a Barcelona")}. La de la Sagrada Família encara no ha publicat les dates del 2026. A tot Catalunya, ${FAMILY.fairs} fires de Nadal ja tenen data oficial: són a ${hub} i a ${guide}.`,
      es: `**Ferias.** La Fira de Santa Llúcia se celebra ${range(s.from, s.to, "es")}${hours}, frente a la Catedral, según ${santaLluciaSource(s, "es")}; cómo llegar y qué es festivo esos días, en ${bcnFairsPage("es", "ferias de Navidad en Barcelona")}. La de la Sagrada Família aún no ha publicado sus fechas de 2026. En toda Cataluña, ${FAMILY.fairs} ferias de Navidad ya tienen fecha oficial: están en ${hub} y en ${guide}.`,
      en: `**Markets.** The Fira de Santa Llúcia runs from ${range(s.from, s.to, "en")}${hours}, in front of the Cathedral, according to ${santaLluciaSource(s, "en")}; getting there and the holidays on those days: ${bcnFairsPage("en", "Christmas markets in Barcelona")}. The Sagrada Família fair has not published its 2026 dates yet. Across Catalonia, ${FAMILY.fairs} Christmas fairs already have an official date: see ${hub} and ${guide}.`,
    }[locale];
  }
  return {
    ca: `**Fires.** La Fira de Santa Llúcia, davant de la Catedral, i la de la Sagrada Família encara no han publicat les dates del 2026. A la resta de Catalunya, ${FAMILY.fairs} fires de Nadal ja tenen data oficial: són a ${hub} i a ${guide}.`,
    es: `**Ferias.** La Fira de Santa Llúcia, frente a la Catedral, y la de la Sagrada Família aún no han publicado sus fechas de 2026. En el resto de Cataluña, ${FAMILY.fairs} ferias de Navidad ya tienen fecha oficial: están en ${hub} y en ${guide}.`,
    en: `**Markets.** The Fira de Santa Llúcia, in front of the Cathedral, and the Sagrada Família fair have not published their 2026 dates yet. Elsewhere in Catalonia, ${FAMILY.fairs} Christmas fairs already have an official date: see ${hub} and ${guide}.`,
  }[locale];
}

function agendaText(item: AgendaItem, locale: Locale): string {
  // "Concert de carilló al Palau de la Generalitat" already says where.
  const venue = item.name.includes(item.venue) ? "" : `, ${item.venue}`;
  return `**${item.name}**${venue}${at(item.time, locale)}. ${item.note[locale]}.`;
}

function announcedEntries(locale: Locale, facts: Announcements, traditions: TraditionAnnouncements): Entry[] {
  const out: Entry[] = [];
  const add = (a: Announcement | null, text: Record<Locale, string>) => {
    if (!a) return;
    const place = a.place ? ` (${a.place[locale]})` : "";
    out.push({ from: a.date, to: a.until, text: `${text[locale]}${at(a.time, locale)}${place}.`, source: councilSource(a.url, locale) });
  };
  add(facts.lightsSwitchOn, { ca: "**Encesa dels llums de Nadal**", es: "**Encendido de las luces de Navidad**", en: "**Christmas lights switch-on**" });
  add(facts.pessebre, { ca: "**Pessebre de l'Ajuntament**, a la plaça de Sant Jaume", es: "**Belén del Ayuntamiento**, en la plaza de Sant Jaume", en: "**City Hall nativity scene**, Plaça de Sant Jaume" });
  add(facts.santJaume, { ca: "**Espectacle de llum** a les façanes de la plaça de Sant Jaume", es: "**Espectáculo de luz** en las fachadas de la plaza de Sant Jaume", en: "**Light show** on the façades of Plaça de Sant Jaume" });
  const s = traditions.santaLlucia;
  if (s) {
    out.push({
      from: s.from,
      to: s.to,
      text: `${{ ca: "**Fira de Santa Llúcia**, davant de la Catedral", es: "**Fira de Santa Llúcia**, frente a la Catedral", en: "**Fira de Santa Llúcia** Christmas market, in front of the Cathedral" }[locale]}${s.hours ? `, ${hoursText(s.hours, locale)}` : ""}.`,
      source:
        s.via === "agenda"
          ? `[${{ ca: "Agenda Cultural de la Generalitat", es: "Agenda Cultural de la Generalitat", en: "Catalan government's cultural agenda" }[locale]}](${s.url})`
          : `[${{ ca: "Organització", es: "Organización", en: "Organisers" }[locale]}](${s.url})`,
    });
  }
  return out;
}

function fixedEntries(locale: Locale, facts: Announcements, drawTime: DrawTime | null): Entry[] {
  const L = <T,>(value: Record<Locale, T>) => value[locale];
  const out: Entry[] = [];

  out.push({
    from: "2026-12-01",
    to: L2_WORKS.until,
    text: L({
      ca: `L'**L2 de metro** continua tallada entre La Pau i Gorg, amb bus llançadora; TMB preveu que els trens tornin a circular el ${weekdayDay(L2_WORKS.back, "ca")} a les 5:00.`,
      es: `La **L2 de metro** sigue cortada entre La Pau y Gorg, con bus lanzadera; TMB prevé que vuelvan los trenes el ${weekdayDay(L2_WORKS.back, "es")} a las 5:00.`,
      en: `**Metro line L2** is still closed between La Pau and Gorg, with a shuttle bus; TMB expects trains back on ${weekdayDay(L2_WORKS.back, "en")} at 5:00.`,
    }),
    source: `${councilSource(L2_WORKS.url, locale)}, ${dateYear(L2_WORKS.published, locale)}`,
  });

  out.push({
    from: SKI_OPENING_2026.fgc,
    text: L({
      ca: `Obertura prevista de la Molina, Vallter, Port Ainé i Boí Taüll (Espot, el ${weekdayDay(SKI_OPENING_2026.espot, "ca")}), si la neu ho permet: ${b2link("ski", "ca", "estacions d'esquí")}.`,
      es: `Apertura prevista de La Molina, Vallter, Port Ainé y Boí Taüll (Espot, el ${weekdayDay(SKI_OPENING_2026.espot, "es")}), si la nieve lo permite: ${b2link("ski", "es", "estaciones de esquí")}.`,
      en: `La Molina, Vallter, Port Ainé and Boí Taüll plan to open (Espot on ${weekdayDay(SKI_OPENING_2026.espot, "en")}), snow permitting: ${b2link("ski", "en", "ski resorts")}.`,
    }),
    source: L(SRC.ski),
  });

  out.push({
    from: BRIDGE_DAYS.saturday,
    to: BRIDGE_DAYS.immaculada,
    text: L({
      ca: `${b2link("decemberBridge", "ca", "Pont de desembre")}: l'únic festiu és el ${weekdayDay(BRIDGE_DAYS.immaculada, "ca")}; el ${weekdayDay(BRIDGE_DAYS.constitution, "ca")} no és festiu a Catalunya i el ${weekdayDay(BRIDGE_DAYS.monday, "ca")} és feiner a Barcelona.`,
      es: `${b2link("decemberBridge", "es", "Puente de diciembre")}: el único festivo es el ${weekdayDay(BRIDGE_DAYS.immaculada, "es")}; el ${weekdayDay(BRIDGE_DAYS.constitution, "es")} no es festivo en Cataluña y el ${weekdayDay(BRIDGE_DAYS.monday, "es")} es laborable en Barcelona.`,
      en: `${b2link("decemberBridge", "en", "December long weekend")}: the only holiday is ${weekdayDay(BRIDGE_DAYS.immaculada, "en")}; ${weekdayDay(BRIDGE_DAYS.constitution, "en")} is not a holiday in Catalonia and ${weekdayDay(BRIDGE_DAYS.monday, "en")} is a working day in Barcelona.`,
    }),
    source: L(SRC.holidays),
  });

  for (const iso of DECEMBER_HOLIDAYS) {
    const name = holidayOn(iso)!.name[locale];
    const shopsOpen = BCN_SHOP_DAYS.includes(iso);
    const shops = shopsOpen
      ? L({ ca: " Les botigues de Barcelona poden obrir.", es: " Las tiendas de Barcelona pueden abrir.", en: " Shops in Barcelona may open." })
      : L({ ca: " Botigues tancades, llevat de les exemptes (forns, botigues de conveniència, botigues petites...).", es: " Tiendas cerradas, salvo las exentas (panaderías, tiendas de conveniencia, tiendas pequeñas...).", en: " Shops closed, except exempt ones (bakeries, convenience stores, small shops...)." });
    out.push({ from: iso, text: `**${L({ ca: "Festiu", es: "Festivo", en: "Public holiday" })}: ${name}.**${shops}`, source: shopsOpen ? `${L(SRC.holidays)}; ${L(SRC.shops)}` : L(SRC.holidays) });
  }

  for (const iso of BCN_SHOP_DAYS.filter((d) => !DECEMBER_HOLIDAYS.includes(d))) {
    out.push({
      from: iso,
      text: L({ ca: "Les botigues de Barcelona poden obrir (diumenge d'obertura comercial).", es: "Las tiendas de Barcelona pueden abrir (domingo de apertura comercial).", en: "Shops in Barcelona may open (a Sunday trading day)." }),
      source: L(SRC.shops),
    });
  }

  for (const item of AGENDA_DECEMBER) out.push({ from: item.from, to: item.to, text: agendaText(item, locale), source: agendaSource(item.codi, locale) });

  out.push({
    from: MARATO.date,
    text: L({
      ca: `${b2link("marato", "ca", "La Marató de 3Cat")}, a TV3 i Catalunya Ràdio, per les malalties neurodegeneratives i neuromusculars.`,
      es: `${b2link("marato", "es", "La Marató de 3Cat")}, en TV3 y Catalunya Ràdio, para las enfermedades neurodegenerativas y neuromusculares.`,
      en: `${b2link("marato", "en", "La Marató de 3Cat")}, the TV3 and Catalunya Ràdio telethon, for neurodegenerative and neuromuscular diseases.`,
    }),
    source: `[Fundació La Marató de 3Cat](${MARATO.hub2026[locale]})`,
  });

  out.push({
    from: TORRE_DEL_SURO_2026.date,
    text: L({
      ca: `**Pessebre vivent de la Torre del Suro** (el Guinardó) a les ${TORRE_DEL_SURO_2026.time}, amb entrada lliure.`,
      es: `**Belén viviente de la Torre del Suro** (el Guinardó) a las ${TORRE_DEL_SURO_2026.time}, con entrada libre.`,
      en: `**Torre del Suro living nativity** (el Guinardó) at ${TORRE_DEL_SURO_2026.time}, free entry.`,
    }),
    source: `[${TORRE_DEL_SURO!.publisher}](${TORRE_DEL_SURO_2026.url})`,
  });
  out.push({
    from: WINTER_START.date,
    text: L({ ca: `Comença l'hivern astronòmic, a les ${WINTER_START.time}.`, es: `Empieza el invierno astronómico, a las ${WINTER_START.time}.`, en: `Astronomical winter begins, at ${WINTER_START.time}.` }),
    source: L(SRC.ign),
  });

  out.push({
    from: BRIDGE_DAYS.schoolChristmasFrom,
    text: L({
      ca: `Comencen les vacances escolars de Nadal, fins al ${dateYear(BRIDGE_DAYS.schoolChristmasTo, "ca")}.`,
      es: `Empiezan las vacaciones escolares de Navidad, hasta el ${dateYear(BRIDGE_DAYS.schoolChristmasTo, "es")}.`,
      en: `School Christmas holidays begin, until ${dateYear(BRIDGE_DAYS.schoolChristmasTo, "en")}.`,
    }),
    source: L(SRC.school),
  });

  out.push({
    from: DAYS.christmasEve,
    text: L({ ca: "**Nit de Nadal**, dia feiner. El metro tanca a les 23:00.", es: "**Nochebuena**, día laborable. El metro cierra a las 23:00.", en: "**Christmas Eve**, a working day. The metro closes at 23:00." }),
    source: L(SRC.tmb),
  });

  const nye = facts.newYearShow
    ? L({ ca: ` La festa de la ciutat és ${when(facts.newYearShow, "ca")}.`, es: ` La fiesta de la ciudad es ${when(facts.newYearShow, "es")}.`, en: ` The city's celebration is on ${when(facts.newYearShow, "en")}.` })
    : L({ ca: ` La festa de la ciutat encara no s'ha anunciat: ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}.`, es: ` La fiesta de la ciudad aún no se ha anunciado: ${b2link("newYear", "es", "Nochevieja en Barcelona")}.`, en: ` The city's celebration has not been announced yet: ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.` });
  const draw = drawTime ? at(drawTime.time, locale) : L({ ca: " (hora encara no anunciada)", es: " (hora aún no anunciada)", en: " (time not announced yet)" });
  out.push({
    from: GROSSA_DRAW_DATE,
    text: L({
      ca: `**Cap d'Any.** Sorteig de ${b2link("grossa", "ca", "La Grossa de Cap d'Any")}${draw}. El metro funciona tota la nit.${nye}`,
      es: `**Nochevieja.** Sorteo de ${b2link("grossa", "es", "La Grossa de Cap d'Any")}${draw}. El metro funciona toda la noche.${nye}`,
      en: `**New Year's Eve.** ${b2link("grossa", "en", "La Grossa de Cap d'Any")} lottery draw${draw}. The metro runs all night.${nye}`,
    }),
    source: `[Loteries de Catalunya](${GROSSA_URLS.game}); ${L(SRC.tmb)}`,
  });

  return out;
}

/** The table rows: one per day (or run of days), in date order, entries of the same day merged. */
export function keyDateRows(
  locale: Locale,
  facts: Announcements = ANNOUNCED_2026,
  traditions: TraditionAnnouncements = ANNOUNCED_TRADITIONS,
  drawTime: DrawTime | null = DRAW_TIME_2026,
): string[][] {
  const entries = [...announcedEntries(locale, facts, traditions), ...fixedEntries(locale, facts, drawTime)];
  const groups = new Map<string, { from: string; to?: string; texts: string[]; sources: string[] }>();
  for (const e of entries) {
    const to = e.to && e.to !== e.from ? e.to : undefined;
    const key = `${e.from}|${to ?? ""}`;
    const group = groups.get(key) ?? { from: e.from, to, texts: [], sources: [] };
    group.texts.push(e.text);
    for (const part of e.source.split("; ")) if (!group.sources.includes(part)) group.sources.push(part);
    groups.set(key, group);
  }
  // Date order; on the same first day, a run of days before a single day.
  const ordered = [...groups.values()].sort((a, b) => a.from.localeCompare(b.from) || (b.to ?? b.from).localeCompare(a.to ?? a.from));
  return ordered.map((g) => [dayLabel(g.from, g.to, locale), g.texts.join(" "), g.sources.join("; ")]);
}

function keyDateTable(locale: Locale, facts: Announcements, traditions: TraditionAnnouncements, drawTime: DrawTime | null): Block {
  const caption = { ca: "El desembre del 2026 a Barcelona, dia a dia", es: "Diciembre de 2026 en Barcelona, día a día", en: "December 2026 in Barcelona, day by day" }[locale];
  const headers = { ca: ["Dia", "Què hi ha", "Font"], es: ["Día", "Qué hay", "Fuente"], en: ["Day", "What's on", "Source"] }[locale];
  const note = {
    ca: `Només hi ha dates publicades per l'organitzador o per l'administració, ${AS_OF.ca}. Preus i entrades, al web de cada organitzador.`,
    es: `Solo hay fechas publicadas por el organizador o por la administración, ${AS_OF.es}. Precios y entradas, en la web de cada organizador.`,
    en: `Only dates published by the organiser or an official body, ${AS_OF.en}. Prices and tickets on each organiser's website.`,
  }[locale];
  return table(caption, headers, keyDateRows(locale, facts, traditions, drawTime), note);
}

/* -------------------------------------------------------------------------- */
/* Still to be announced                                                      */
/* -------------------------------------------------------------------------- */

/** The last three switch-ons, oldest first, each with its year. */
function switchOnHistory(locale: Locale): string {
  const days = [...SWITCH_ON_HISTORY].reverse().map((s) => `${locale === "en" ? "" : "el "}${dayDate(s.date, locale)}`);
  return joinList(days, locale);
}

export function pendingItems(
  locale: Locale,
  facts: Announcements = ANNOUNCED_2026,
  traditions: TraditionAnnouncements = ANNOUNCED_TRADITIONS,
  drawTime: DrawTime | null = DRAW_TIME_2026,
): string[] {
  const L = <T,>(value: Record<Locale, T>) => value[locale];
  const items: string[] = [];
  if (!facts.lightsSwitchOn) {
    items.push(
      L({
        ca: `**Encesa dels llums de Nadal.** L'Ajuntament encara no n'ha anunciat la data (${AS_OF.ca}). Els tres últims anys es va fer al passeig de Gràcia a les 18:00: ${switchOnHistory("ca")}. Tot el que se'n sap, a ${b2link("christmasBarcelona", "ca", "l'encesa de llums de Nadal a Barcelona")}.`,
        es: `**Encendido de las luces de Navidad.** El Ayuntamiento aún no ha anunciado la fecha (${AS_OF.es}). Los tres últimos años fue en el paseo de Gràcia a las 18:00: ${switchOnHistory("es")}. Todo lo que se sabe, en ${b2link("christmasBarcelona", "es", "el encendido de luces de Navidad en Barcelona")}.`,
        en: `**Christmas lights switch-on.** The City Council has not announced the date yet (${AS_OF.en}). For the last three years it was on Passeig de Gràcia at 18:00: on ${switchOnHistory("en")}. Everything known so far: ${b2link("christmasBarcelona", "en", "the Barcelona Christmas lights switch-on")}.`,
      }),
    );
  }
  if (!traditions.santaLlucia) {
    const last = range(SANTA_LLUCIA_2025.from, SANTA_LLUCIA_2025.to, locale);
    items.push(
      L({
        ca: `**Fira de Santa Llúcia.** Les dates del 2026 encara no s'han anunciat (${AS_OF.ca}): el web de l'organització encara mostra el calendari del 2025, quan la fira es va fer ${last}, davant de la Catedral. Segons l'Ajuntament, s'instal·la cada any a final de novembre o a principi de desembre, sempre abans del dia de Santa Llúcia, el 13.`,
        es: `**Fira de Santa Llúcia.** Las fechas de 2026 aún no se han anunciado (${AS_OF.es}): la web de la organización todavía muestra el calendario de 2025, cuando la feria se celebró ${last}, frente a la Catedral. Según el Ayuntamiento, se instala cada año a finales de noviembre o principios de diciembre, siempre antes del día de Santa Llúcia, el 13.`,
        en: `**Fira de Santa Llúcia.** The 2026 dates have not been announced yet (${AS_OF.en}): the organisers' website still shows the 2025 calendar, when the fair ran from ${last}, in front of the Cathedral. According to the City Council, it goes up every year in late November or early December, always before Santa Llúcia's day, the 13th.`,
      }),
    );
  }
  if (!facts.pessebre) {
    const last = range(PAST.pessebre2025.from, PAST.pessebre2025.to, locale);
    items.push(
      L({
        ca: `**Pessebre de la plaça de Sant Jaume.** Dates del 2026 pendents. El 2025 es va poder visitar ${last}, de franc, a dins de l'Ajuntament.`,
        es: `**Belén de la plaza de Sant Jaume.** Fechas de 2026 pendientes. En 2025 se pudo visitar ${last}, gratis, dentro del Ayuntamiento.`,
        en: `**Plaça de Sant Jaume nativity scene.** 2026 dates not announced. In 2025 it was open from ${last}, free, inside City Hall.`,
      }),
    );
  }
  if (!facts.newYearShow) {
    items.push(
      L({
        ca: `**Festa de Cap d'Any de la ciutat.** Encara no s'ha anunciat; el 2024 i el 2025 es va fer a l'avinguda de la Reina Maria Cristina, als peus de Montjuïc. Com va anar i què cal saber, a ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}.`,
        es: `**Fiesta de Nochevieja de la ciudad.** Aún no se ha anunciado; en 2024 y 2025 se hizo en la avenida de la Reina Maria Cristina, a los pies de Montjuïc. Cómo fue y qué hay que saber, en ${b2link("newYear", "es", "Nochevieja en Barcelona")}.`,
        en: `**The city's New Year's Eve show.** Not announced yet; in 2024 and 2025 it was on Avinguda de la Reina Maria Cristina, at the foot of Montjuïc. How it worked and what to know: ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
      }),
    );
  }
  if (!drawTime) {
    items.push(
      L({
        ca: `**Hora del sorteig de La Grossa.** El sorteig és el ${dayDate(GROSSA_DRAW_DATE, "ca")}; Loteries de Catalunya encara no n'ha anunciat l'hora.`,
        es: `**Hora del sorteo de La Grossa.** El sorteo es el ${dayDate(GROSSA_DRAW_DATE, "es")}; Loteries de Catalunya aún no ha anunciado la hora.`,
        en: `**La Grossa draw time.** The draw is on ${dayDate(GROSSA_DRAW_DATE, "en")}; Loteries de Catalunya has not announced the time yet.`,
      }),
    );
  }
  if (!facts.cavalcada) {
    items.push(
      L({
        ca: `**Cavalcada de Reis**, el vespre del ${dateYear(DAYS.reisEve, "ca")}: l'Ajuntament en publica l'horari i el recorregut les setmanes abans.`,
        es: `**Cabalgata de Reyes**, la tarde del ${dateYear(DAYS.reisEve, "es")}: el Ayuntamiento publica su horario y su recorrido las semanas antes.`,
        en: `**Three Kings parade**, on the evening of ${dateYear(DAYS.reisEve, "en")}: the City Council publishes its times and route in the weeks before.`,
      }),
    );
  }
  return items;
}

/* -------------------------------------------------------------------------- */
/* Holidays: what closes                                                      */
/* -------------------------------------------------------------------------- */

export function specialDayRows(locale: Locale): string[][] {
  const L = <T,>(value: Record<Locale, T>) => value[locale];
  return SPECIAL_DAYS.map((iso) => {
    const holiday = holidayOn(iso);
    const weekday = weekdayIndex(iso);
    let what: string;
    if (holiday) what = `**${L({ ca: "Festiu", es: "Festivo", en: "Public holiday" })}:** ${holiday.name[locale]}`;
    else if (iso === BRIDGE_DAYS.constitution) what = L({ ca: "Dia de la Constitució, en diumenge: no és festiu a Catalunya", es: "Día de la Constitución, en domingo: no es festivo en Cataluña", en: "Constitution Day, on a Sunday: not a holiday in Catalonia" });
    else if (iso === BRIDGE_DAYS.monday) what = L({ ca: `Feiner a Barcelona (festa local en ${LOCAL_MONDAY_7.municipalities} municipis)`, es: `Laborable en Barcelona (fiesta local en ${LOCAL_MONDAY_7.municipalities} municipios)`, en: `Working day in Barcelona (a local holiday in ${LOCAL_MONDAY_7.municipalities} other towns)` });
    else if (iso === DAYS.christmasEve) what = L({ ca: "Nit de Nadal: dia feiner", es: "Nochebuena: día laborable", en: "Christmas Eve: working day" });
    else if (iso === DAYS.newYearsEve) what = L({ ca: "Cap d'Any: dia feiner", es: "Nochevieja: día laborable", en: "New Year's Eve: working day" });
    else what = L({ ca: "Dia feiner", es: "Día laborable", en: "Working day" });
    let shops: string;
    if (BCN_SHOP_DAYS.includes(iso)) shops = L({ ca: "Poden obrir (dia d'obertura comercial)", es: "Pueden abrir (día de apertura comercial)", en: "May open (a trading day)" });
    else if (holiday || weekday === 0) shops = L({ ca: "Tancades, llevat de les exemptes", es: "Cerradas, salvo las exentas", en: "Closed, except exempt shops" });
    else shops = L({ ca: "Horari de cada botiga", es: "Horario de cada tienda", en: "Each shop's own hours" });
    const day = dayDate(iso, locale, false);
    return [cap(day), what, shops];
  });
}

function specialDayTable(locale: Locale): Block {
  const caption = { ca: "Festius i dies especials del desembre del 2026 a Barcelona", es: "Festivos y días especiales de diciembre de 2026 en Barcelona", en: "Holidays and special days in Barcelona, December 2026" }[locale];
  const headers = { ca: ["Dia", "Què és", "Botigues"], es: ["Día", "Qué es", "Tiendas"], en: ["Day", "What it is", "Shops"] }[locale];
  const note = {
    ca: "Fonts: Ordre EMT/66/2025 (festius), Ordre EMT/208/2025 (festes locals) i Resolució EMT/4342/2025 (obertura comercial a Barcelona), al DOGC.",
    es: "Fuentes: Orden EMT/66/2025 (festivos), Orden EMT/208/2025 (fiestas locales) y Resolución EMT/4342/2025 (apertura comercial en Barcelona), en el DOGC.",
    en: "Sources: Order EMT/66/2025 (holidays), Order EMT/208/2025 (local holidays) and Resolution EMT/4342/2025 (Barcelona's trading days), in the DOGC.",
  }[locale];
  return table(caption, headers, specialDayRows(locale), note);
}

function sightTable(locale: Locale): Block {
  const caption = { ca: "Grans visites durant les festes", es: "Grandes visitas durante las fiestas", en: "Big sights over the holidays" }[locale];
  const headers = { ca: ["Lloc", "El que diu la seva web oficial"], es: ["Lugar", "Lo que dice su web oficial"], en: ["Sight", "What its official page says"] }[locale];
  const checked = dateYear(FESTIVE_VERIFIED, locale);
  const note = {
    ca: `De la pàgina d'horaris de cada lloc, comprovada el ${checked}. Poden canviar per actes especials: mira-ho el dia abans.`,
    es: `De la página de horarios de cada lugar, comprobada el ${checked}. Pueden cambiar por actos especiales: compruébalo el día antes.`,
    en: `From each sight's own opening-hours page, checked ${checked}. Hours can change for special events, so check the day before.`,
  }[locale];
  return table(caption, headers, sightRows(locale), note);
}

/* -------------------------------------------------------------------------- */
/* Key facts                                                                  */
/* -------------------------------------------------------------------------- */

function lightsFact(locale: Locale, facts: Announcements): string {
  const a = facts.lightsSwitchOn;
  if (a) return cap(when(a, locale).replace(/^el /, ""));
  const last = dayDate(PAST.lights2025.switchOn, locale);
  return {
    ca: `Encara no s'ha anunciat (el 2025: ${last}, a les 18:00 al passeig de Gràcia)`,
    es: `Aún no se ha anunciado (en 2025: ${last}, a las 18:00 en el paseo de Gràcia)`,
    en: `Not announced yet (2025: ${last}, 18:00 on Passeig de Gràcia)`,
  }[locale];
}

function santaLluciaFact(locale: Locale, traditions: TraditionAnnouncements): string {
  const s = traditions.santaLlucia;
  if (s) {
    const when = cap(range(s.from, s.to, locale).replace(/^de?l /, ""));
    return s.hours ? `${when}, ${hoursText(s.hours, locale)}` : when;
  }
  return { ca: `Dates del 2026 encara no anunciades (${AS_OF.ca})`, es: `Fechas de 2026 aún no anunciadas (${AS_OF.es})`, en: `2026 dates not announced yet (${AS_OF.en})` }[locale];
}

function weatherFact(locale: Locale): string {
  if (locale === "en") return `Average highs of ${num(W.high, "en")} °C (${toF(W.high)} °F) and lows of ${num(W.low, "en")} °C (${toF(W.low)} °F); ${W.rain} mm of rain (AEMET)`;
  if (locale === "es") return `Máximas medias de ${num(W.high, "es")} °C y mínimas de ${num(W.low, "es")} °C; ${W.rain} mm de lluvia (AEMET)`;
  return `Màximes mitjanes de ${num(W.high, "ca")} °C i mínimes de ${num(W.low, "ca")} °C; ${W.rain} mm de pluja (AEMET)`;
}

/* -------------------------------------------------------------------------- */
/* Weather                                                                    */
/* -------------------------------------------------------------------------- */

/** "el 31 de desembre del 1925" / "el 31 de diciembre de 1925" / "on 31 December 1925". */
function onDay(locale: Locale, [d, m, y]: [number, number, number]): string {
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const short = dateYear(iso, locale);
  if (locale === "en") return `on ${short}`;
  if (locale === "es") return `el ${short}`;
  return `${d === 1 || d === 11 ? "l'" : "el "}${short.replace(/ de (\d{4})$/, " del $1")}`;
}

function weatherParas(locale: Locale): string[] {
  const winter = `${dayDate(WINTER_START.date, locale, false)}${at(WINTER_START.time, locale)}`;
  if (locale === "ca") {
    return [
      `**Al desembre, Barcelona té màximes mitjanes de ${num(W.high, "ca")} °C i mínimes de ${num(W.low, "ca")} °C** a l'aeroport (AEMET, 1981-2010), amb una mitjana de ${num(W.mean, "ca")} °C. Al centre fa una mica més de calor: l'estació del Meteocat al Raval dona ${num(W.cityHigh, "ca")} i ${num(W.cityLow, "ca")} °C (2010-2025).`,
      `Hi cauen ${W.rain} mm de pluja en ${num(W.rainDays, "ca")} dies de mitjana, la humitat relativa és del ${W.humidity} % i hi ha ${W.sun} hores de sol: és el mes amb menys sol de l'any. Rècords del mes a l'aeroport: ${num(W.recordHigh, "ca")} °C ${onDay("ca", W.recordHighDay)} i ${num(W.recordLow, "ca")} °C ${onDay("ca", W.recordLowDay)}.`,
      `L'hivern astronòmic comença el ${winter}, hora oficial peninsular, segons l'Institut Geogràfic Nacional. Totes les mitjanes, mes a mes, són a ${b2link("climate", "ca", "el temps a Barcelona mes a mes")}; per als pròxims dies, la [predicció del Meteocat per a Barcelona](https://www.meteo.cat/prediccio/municipal/080193).`,
    ];
  }
  if (locale === "es") {
    return [
      `**En diciembre, Barcelona tiene máximas medias de ${num(W.high, "es")} °C y mínimas de ${num(W.low, "es")} °C** en el aeropuerto (AEMET, 1981-2010), con una media de ${num(W.mean, "es")} °C. En el centro hace algo más de calor: la estación del Meteocat en el Raval da ${num(W.cityHigh, "es")} y ${num(W.cityLow, "es")} °C (2010-2025).`,
      `Caen ${W.rain} mm de lluvia en ${num(W.rainDays, "es")} días de media, la humedad relativa es del ${W.humidity} % y hay ${W.sun} horas de sol: es el mes con menos sol del año. Récords del mes en el aeropuerto: ${num(W.recordHigh, "es")} °C ${onDay("es", W.recordHighDay)} y ${num(W.recordLow, "es")} °C ${onDay("es", W.recordLowDay)}.`,
      `El invierno astronómico empieza el ${winter}, hora oficial peninsular, según el Instituto Geográfico Nacional. Todas las medias, mes a mes, están en ${b2link("climate", "es", "el tiempo en Barcelona mes a mes")}; para los próximos días, la [predicción de la AEMET para Barcelona](https://www.aemet.es/es/eltiempo/prediccion/municipios/barcelona-id08019).`,
    ];
  }
  return [
    `**In December Barcelona averages highs of ${num(W.high, "en")} °C (${toF(W.high)} °F) and lows of ${num(W.low, "en")} °C (${toF(W.low)} °F)** at the airport (AEMET, 1981-2010), a mean of ${num(W.mean, "en")} °C. The centre is a little warmer: Meteocat's el Raval station gives ${num(W.cityHigh, "en")} and ${num(W.cityLow, "en")} °C (${toF(W.cityHigh)} and ${toF(W.cityLow)} °F, 2010-2025).`,
    `Expect ${W.rain} mm of rain over ${num(W.rainDays, "en")} days on average, ${W.humidity} % relative humidity and ${W.sun} hours of sunshine, the least of any month. The month's records at the airport: ${num(W.recordHigh, "en")} °C ${onDay("en", W.recordHighDay)} and ${num(W.recordLow, "en")} °C ${onDay("en", W.recordLowDay)}.`,
    `Astronomical winter begins on ${winter}, Spanish mainland time, according to Spain's National Geographic Institute. Every month's averages are in ${b2link("climate", "en", "Barcelona weather by month")}; for the next few days, see [AEMET's forecast for Barcelona](https://www.aemet.es/es/eltiempo/prediccion/municipios/barcelona-id08019).`,
  ];
}

/* -------------------------------------------------------------------------- */
/* New for 2026                                                               */
/* -------------------------------------------------------------------------- */

function agendaList(locale: Locale): Block {
  return list(
    ...AGENDA_DECEMBER.map((item) => {
      const when = item.to ? dayLabel(item.from, item.to, locale) : cap(dayDate(item.from, locale, false));
      return `**${item.name}** (${item.venue}). ${when}${at(item.time, locale)}. ${item.note[locale]}. ${agendaSource(item.codi, locale)}.`;
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["christmasBarcelona", "decemberBridge", "christmas", "newYear", "shops", "climate", "marato", "grossa", "pessebres"] as const;

export function buildBarcelonaDecemberBody(
  locale: Locale,
  facts: Announcements = ANNOUNCED_2026,
  traditions: TraditionAnnouncements = ANNOUNCED_TRADITIONS,
  drawTime: DrawTime | null = DRAW_TIME_2026,
): Block[] {
  const holidays = holidaysPhrase(locale);
  const shopDays = shopDaysPhrase(locale);
  const marato = dayDate(MARATO.date, locale, false);
  const grossa = dayDate(GROSSA_DRAW_DATE, locale, false);
  const pending = pendingItems(locale, facts, traditions, drawTime);
  const torre = dayDate(TORRE_DEL_SURO_2026.date, locale, false);
  const baqueira = dayDate(SKI_OPENING_2026.baqueira, locale, false);
  const fgc = dayDate(SKI_OPENING_2026.fgc, locale, false);
  const lightsNews = facts.lightsSwitchOn
    ? { ca: `L'encesa dels llums de Nadal és ${when(facts.lightsSwitchOn, "ca")}.`, es: `El encendido de las luces de Navidad es ${when(facts.lightsSwitchOn, "es")}.`, en: `The Christmas lights switch-on is on ${when(facts.lightsSwitchOn, "en")}.` }[locale]
    : { ca: "L'Ajuntament encara no ha anunciat l'encesa dels llums de Nadal.", es: "El Ayuntamiento aún no ha anunciado el encendido de las luces de Navidad.", en: "The City Council has not announced the Christmas lights switch-on yet." }[locale];

  if (locale === "ca") {
    return [
      lead(
        `**Al desembre del 2026, Barcelona té tres festius: ${holidays}.** Les botigues poden obrir ${shopDays}; el 25 i el 26 només hi poden obrir les exemptes. La Marató de 3Cat és el ${marato} i La Grossa de Cap d'Any se sorteja el ${grossa}. Les màximes mitjanes són de ${num(W.high, "ca")} °C i les mínimes, de ${num(W.low, "ca")} °C. ${lightsNews}`,
      ),
      keyFacts("El desembre del 2026 a Barcelona, d'un cop d'ull", [
        { label: "Festius", value: cap(holidaysPhrase("ca", false)) },
        { label: "Botigues", value: `Poden obrir ${shopDays}; el 25 i el 26, només les exemptes` },
        { label: "Temps", value: weatherFact("ca") },
        { label: "Metro", value: "Fins a les 23:00 el 24; tota la nit el 31 (horari de TMB)" },
        { label: "La Marató", value: cap(marato) },
        { label: "La Grossa de Cap d'Any", value: `${cap(grossa)}${drawTime ? `, a les ${drawTime.time}` : " (hora encara no anunciada)"}` },
        { label: "Encesa de llums", value: lightsFact("ca", facts) },
        { label: "Fira de Santa Llúcia", value: santaLluciaFact("ca", traditions) },
      ]),
      callout(
        "official",
        "Com tractem les dates",
        `Només hi posem una data del 2026 quan l'ha publicada l'organitzador o l'administració; les dels anys anteriors sempre porten l'any al costat. ${stillUndated("ca", facts, traditions)}`,
      ),
      ...h2(
        "Què fer a Barcelona al desembre del 2026: les dates clau",
        "Dia a dia, el que ja té data oficial: festius, botigues, concerts i espectacles, La Marató, els pessebres i Cap d'Any.",
      ),
      keyDateTable("ca", facts, traditions, drawTime),
      ...(pending.length
        ? [...h2("Què encara no té data", "Aquestes cites del desembre encara no s'han anunciat. Les afegim a la taula el dia que surtin:"), list(...pending)]
        : []),
      ...h2(
        "Quins dies són festius a Barcelona al desembre del 2026?",
        `Tres, i són de tot Catalunya: ${holidays}. El diumenge 6, Dia de la Constitució, no és festiu a Catalunya, i el dilluns 7 és feiner a Barcelona, perquè les seves festes locals del 2026 són ${localDaysPhrase("ca")}. El 24 i el 31 de desembre també són dies feiners.`,
        `Si vols fer pont, mira ${b2link("decemberBridge", "ca", "el pont de desembre del 2026")}.`,
      ),
      specialDayTable("ca"),
      ...h2(
        "Què obre i què tanca: botigues, museus i monuments",
        `**Botigues.** A Barcelona poden obrir ${shopDays}, segons el calendari comercial del 2026. El 25 i el 26 de desembre la llei de comerç obliga a tancar les botigues amb horari general; poden obrir, perquè en queden excloses, els forns i pastisseries, les floristeries, les botigues de conveniència, les farmàcies, les botigues de dins de les estacions i les de fins a 300 m² d'alimentació o de petites i mitjanes empreses. Poder obrir no vol dir que obrin: cada botiga decideix. El detall és a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
        "**Museus i monuments.** Aquests són els horaris de festes que publiquen els grans llocs a la seva web oficial. Per a la resta, mira la web de cada museu abans d'anar-hi: els horaris de festius canvien d'un any a l'altre.",
      ),
      sightTable("ca"),
      ...paras(
        `Les entrades de la Sagrada Família, el Park Güell i la Casa Batlló són a ${b2link("monuments", "ca", "la guia d'entrades")}, i els museus que es poden visitar de franc, a ${b2link("museums", "ca", "museus gratis a Barcelona")}.`,
      ),
      ...h2(
        "Metro i transport al desembre",
        "El metro funciona tots els dies de festes. Aquesta taula aplica l'horari general de TMB als dies especials del mes:",
      ),
      metroTable("ca", METRO_DECEMBER),
      ...paras(
        `**L2:** fins al ${weekdayDay(L2_WORKS.until, "ca")} de desembre no hi ha trens entre La Pau i Gorg, per obres; hi ha bus llançadora i alternatives com l'L4, l'L10, el tramvia i la R1. TMB preveu que tornin a circular el ${weekdayDay(L2_WORKS.back, "ca")} a les 5:00 ([Ajuntament de Barcelona](${L2_WORKS.url}), ${dateYear(L2_WORKS.published, "ca")}).`,
        `Per als autobusos nocturns i l'horari de cada nit, mira ${b2link("hours", "ca", "l'horari del metro i del NitBus")}.`,
      ),
      ...h2("Quin temps fa a Barcelona al desembre?", ...weatherParas("ca")),
      ...h2(
        "Nadal a Barcelona: llums, fires i pessebres",
        facts.lightsSwitchOn
          ? `**Llums.** ${lightsNews} ${lightsKm("ca", facts)}, i el 2026 Barcelona és capital europea del Nadal. L'hora, el lloc, l'horari dels llums i les dates de ${LIGHTS_TOWNS.length} municipis més, a ${b2link("christmasLights", "ca", "l'encesa de llums de Nadal 2026 a Barcelona i Catalunya")}.`
          : `**Llums.** ${lightsNews} Per al 2026 preveu ${LIGHTS_PLAN_2026.km} km de carrers il·luminats, i el 2026 Barcelona és capital europea del Nadal. La data, l'hora i el lloc de l'encesa, quan surtin, a ${b2link("christmasBarcelona", "ca", "l'encesa de llums de Nadal a Barcelona")}.`,
        fairsParagraph("ca", traditions),
        `**Pessebres.** A la ciutat, el 33è Pessebre Vivent de la Torre del Suro, al Guinardó, és el ${torre} a les ${TORRE_DEL_SURO_2026.time}, amb entrada lliure, segons els organitzadors. La resta de pessebres vivents de Catalunya, a ${b2link("pessebres", "ca", "la guia de pessebres vivents")}.`,
        `**Tradicions.** El tió es comença a alimentar per la Immaculada, el 8 de desembre, i el 26, Sant Esteve, és festiu. ${pastoretsSentence("ca")} Com es fa cagar el tió i què es menja per Nadal, a ${b2link("christmasTraditions", "ca", "les tradicions de Nadal a Catalunya")}. I per acabar les festes, l'horari i el recorregut dels Reis, a ${b2link("reis", "ca", "la Cavalcada de Reis 2027")}.`,
      ),
      ...h2(
        "Novetats del 2026: concerts i espectacles amb data",
        `Algunes de les activitats de desembre a Barcelona que ja són a l'agenda cultural de la Generalitat (dades obertes, ${AS_OF.ca}). Preus i entrades, al web de cada organitzador:`,
      ),
      agendaList("ca"),
      ...h2(
        "Escapades i neu",
        `Baqueira Beret té previst obrir la temporada el ${baqueira} i les estacions d'FGC (la Molina, Vallter, Port Ainé i Boí Taüll), el ${fgc}, si la meteorologia i la neu ho permeten. A la Molina s'hi arriba en tren des de Barcelona. Totes les estacions, a ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}.`,
      ),
      faq([
        { question: "Què fer a Barcelona al desembre del 2026?", answer: `Hi ha els llums i les fires de Nadal, concerts com l'Oratori El Pessebre al Palau de la Música (${dayDate("2026-12-15", "ca", false)}), El trencanous al Liceu, La Marató de 3Cat (${marato}) i Cap d'Any. Les botigues poden obrir ${shopDays}.` },
        { question: "Quins dies són festius a Barcelona al desembre del 2026?", answer: `${cap(holidays)}. El 6 i el 7 de desembre no són festius a Barcelona, i el 24 i el 31 són feiners.` },
        { question: "Quin temps fa a Barcelona al desembre?", answer: `Màximes mitjanes de ${num(W.high, "ca")} °C i mínimes de ${num(W.low, "ca")} °C a l'aeroport, amb ${W.rain} mm de pluja en uns quatre dies i ${W.sun} hores de sol (AEMET). Al centre, la mínima mitjana és de ${num(W.cityLow, "ca")} °C.` },
        { question: "Obren les botigues els diumenges de desembre a Barcelona?", answer: `Sí: poden obrir ${shopDays}. El 25 i el 26 de desembre, festius, només poden obrir les botigues exemptes, com els forns, les de conveniència o les de fins a 300 m².` },
        { question: "Què obre a Barcelona el dia de Nadal?", answer: "El 25 de desembre és festiu: la majoria de botigues tanquen per llei, però el metro funciona i alguns monuments obren amb horari reduït, com la Sagrada Família, de 9:00 a 14:00. El MNAC, la Pedrera i el Museu Picasso tanquen." },
        { question: "Quan s'encenen els llums de Nadal de Barcelona el 2026?", answer: facts.lightsSwitchOn ? `L'Ajuntament ha anunciat l'encesa per al ${dayDate(facts.lightsSwitchOn.date, "ca")}${at(facts.lightsSwitchOn.time, "ca")}.` : `Encara no s'ha anunciat (${AS_OF.ca}). Els tres últims anys es van encendre al passeig de Gràcia a les 18:00: ${switchOnHistory("ca")}.` },
        { question: "Quan és la Fira de Santa Llúcia 2026?", answer: traditions.santaLlucia ? `Es fa ${range(traditions.santaLlucia.from, traditions.santaLlucia.to, "ca")}, davant de la Catedral.` : `Les dates del 2026 encara no s'han anunciat (${AS_OF.ca}). El 2025 es va fer ${range(SANTA_LLUCIA_2025.from, SANTA_LLUCIA_2025.to, "ca")}, davant de la Catedral.` },
        { question: "Funciona el metro de Barcelona la nit de Nadal i la de Cap d'Any?", answer: "Sí. Segons l'horari general de TMB, el 24 de desembre tanca a les 23:00 i el 31 no tanca en tota la nit. TMB confirma l'horari de Nadal al desembre." },
      ]),
      ...paras(verifiedLine("ca", BARCELONA_DECEMBER_AS_OF)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**En diciembre de 2026, Barcelona tiene tres festivos: ${holidays}.** Las tiendas pueden abrir ${shopDays}; el 25 y el 26 solo pueden abrir las exentas. La Marató de 3Cat es el ${marato} y La Grossa de Cap d'Any se sortea el ${grossa}. Las máximas medias son de ${num(W.high, "es")} °C y las mínimas, de ${num(W.low, "es")} °C. ${lightsNews}`,
      ),
      keyFacts("Diciembre de 2026 en Barcelona, de un vistazo", [
        { label: "Festivos", value: cap(holidaysPhrase("es", false)) },
        { label: "Tiendas", value: `Pueden abrir ${shopDays}; el 25 y el 26, solo las exentas` },
        { label: "Tiempo", value: weatherFact("es") },
        { label: "Metro", value: "Hasta las 23:00 el 24; toda la noche el 31 (horario de TMB)" },
        { label: "La Marató", value: cap(marato) },
        { label: "La Grossa de Cap d'Any", value: `${cap(grossa)}${drawTime ? `, a las ${drawTime.time}` : " (hora aún no anunciada)"}` },
        { label: "Encendido de luces", value: lightsFact("es", facts) },
        { label: "Fira de Santa Llúcia", value: santaLluciaFact("es", traditions) },
      ]),
      callout(
        "official",
        "Cómo tratamos las fechas",
        `Solo ponemos una fecha de 2026 cuando la ha publicado el organizador o la administración; las de años anteriores siempre llevan el año al lado. ${stillUndated("es", facts, traditions)}`,
      ),
      ...h2(
        "Qué hacer en Barcelona en diciembre de 2026: las fechas clave",
        "Día a día, lo que ya tiene fecha oficial: festivos, tiendas, conciertos y espectáculos, La Marató, los belenes y Nochevieja.",
      ),
      keyDateTable("es", facts, traditions, drawTime),
      ...(pending.length
        ? [...h2("Lo que aún no tiene fecha", "Estas citas de diciembre aún no se han anunciado. Las añadimos a la tabla el día que salgan:"), list(...pending)]
        : []),
      ...h2(
        "¿Qué días son festivos en Barcelona en diciembre de 2026?",
        `Tres, y son de toda Cataluña: ${holidays}. El domingo 6, Día de la Constitución, no es festivo en Cataluña, y el lunes 7 es laborable en Barcelona, porque sus fiestas locales de 2026 son ${localDaysPhrase("es")}. El 24 y el 31 de diciembre también son laborables.`,
        `Si quieres hacer puente, mira ${b2link("decemberBridge", "es", "el puente de diciembre de 2026")}.`,
      ),
      specialDayTable("es"),
      ...h2(
        "Qué abre y qué cierra: tiendas, museos y monumentos",
        `**Tiendas.** En Barcelona pueden abrir ${shopDays}, según el calendario comercial de 2026. El 25 y el 26 de diciembre la ley de comercio obliga a cerrar a las tiendas con horario general; pueden abrir, porque quedan excluidas, las panaderías y pastelerías, las floristerías, las tiendas de conveniencia, las farmacias, las tiendas dentro de las estaciones y las de hasta 300 m² de alimentación o de pequeñas y medianas empresas. Poder abrir no quiere decir que abran: cada tienda decide. El detalle está en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
        "**Museos y monumentos.** Estos son los horarios de fiestas que publican los grandes lugares en su web oficial. Para el resto, mira la web de cada museo antes de ir: los horarios de festivos cambian de un año a otro.",
      ),
      sightTable("es"),
      ...paras(
        `Las entradas de la Sagrada Familia, el Park Güell y la Casa Batlló están en ${b2link("monuments", "es", "la guía de entradas")}, y los museos que se pueden visitar gratis, en ${b2link("museums", "es", "museos gratis en Barcelona")}.`,
      ),
      ...h2(
        "Metro y transporte en diciembre",
        "El metro funciona todos los días de fiestas. Esta tabla aplica el horario general de TMB a los días especiales del mes:",
      ),
      metroTable("es", METRO_DECEMBER),
      ...paras(
        `**L2:** hasta el ${weekdayDay(L2_WORKS.until, "es")} de diciembre no hay trenes entre La Pau y Gorg, por obras; hay bus lanzadera y alternativas como la L4, la L10, el tranvía y la R1. TMB prevé que vuelvan a circular el ${weekdayDay(L2_WORKS.back, "es")} a las 5:00 ([Ayuntamiento de Barcelona](${L2_WORKS.url}), ${dateYear(L2_WORKS.published, "es")}).`,
        `Para los autobuses nocturnos y el horario de cada noche, mira ${b2link("hours", "es", "el horario del metro y del NitBus")}.`,
      ),
      ...h2("¿Qué tiempo hace en Barcelona en diciembre?", ...weatherParas("es")),
      ...h2(
        "Navidad en Barcelona: luces, ferias y belenes",
        facts.lightsSwitchOn
          ? `**Luces.** ${lightsNews} ${lightsKm("es", facts)}, y en 2026 Barcelona es capital europea de la Navidad. La hora, el lugar, el horario de las luces y las fechas de ${LIGHTS_TOWNS.length} municipios más, en ${b2link("christmasLights", "es", "el encendido de luces de Navidad 2026 en Barcelona y Cataluña")}.`
          : `**Luces.** ${lightsNews} Para 2026 prevé ${LIGHTS_PLAN_2026.km} km de calles iluminadas, y en 2026 Barcelona es capital europea de la Navidad. La fecha, la hora y el lugar del encendido, cuando salgan, en ${b2link("christmasBarcelona", "es", "el encendido de luces de Navidad en Barcelona")}.`,
        fairsParagraph("es", traditions),
        `**Belenes.** En la ciudad, el 33.º Pessebre Vivent de la Torre del Suro, en el Guinardó, es el ${torre} a las ${TORRE_DEL_SURO_2026.time}, con entrada libre, según los organizadores. El resto de belenes vivientes de Cataluña, en ${b2link("pessebres", "es", "la guía de belenes vivientes")}.`,
        `**Tradiciones.** Al tió se le empieza a alimentar por la Inmaculada, el 8 de diciembre, y el 26, San Esteban, es festivo. ${pastoretsSentence("es")} Cómo se hace cagar el tió y qué se come en Navidad, en ${b2link("christmasTraditions", "es", "las tradiciones de Navidad en Cataluña")}. Y para cerrar las fiestas, el horario y el recorrido de los Reyes, en ${b2link("reis", "es", "la Cabalgata de Reyes 2027")}.`,
      ),
      ...h2(
        "Novedades de 2026: conciertos y espectáculos con fecha",
        `Algunas de las actividades de diciembre en Barcelona que ya están en la agenda cultural de la Generalitat (datos abiertos, ${AS_OF.es}). Precios y entradas, en la web de cada organizador:`,
      ),
      agendaList("es"),
      ...h2(
        "Escapadas y nieve",
        `Baqueira Beret tiene previsto abrir la temporada el ${baqueira} y las estaciones de FGC (La Molina, Vallter, Port Ainé y Boí Taüll), el ${fgc}, siempre que las condiciones meteorológicas y de nieve lo permitan. A La Molina se llega en tren desde Barcelona. Todas las estaciones, en ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}.`,
      ),
      faq([
        { question: "¿Qué hacer en Barcelona en diciembre de 2026?", answer: `Están las luces y las ferias de Navidad, conciertos como el Oratorio El Pessebre en el Palau de la Música (${dayDate("2026-12-15", "es", false)}), El trencanous en el Liceu, La Marató de 3Cat (${marato}) y Nochevieja. Las tiendas pueden abrir ${shopDays}.` },
        { question: "¿Qué días son festivos en Barcelona en diciembre de 2026?", answer: `${cap(holidays)}. El 6 y el 7 de diciembre no son festivos en Barcelona, y el 24 y el 31 son laborables.` },
        { question: "¿Qué tiempo hace en Barcelona en diciembre?", answer: `Máximas medias de ${num(W.high, "es")} °C y mínimas de ${num(W.low, "es")} °C en el aeropuerto, con ${W.rain} mm de lluvia en unos cuatro días y ${W.sun} horas de sol (AEMET). En el centro, la mínima media es de ${num(W.cityLow, "es")} °C.` },
        { question: "¿Abren las tiendas los domingos de diciembre en Barcelona?", answer: `Sí: pueden abrir ${shopDays}. El 25 y el 26 de diciembre, festivos, solo pueden abrir las tiendas exentas, como las panaderías, las de conveniencia o las de hasta 300 m².` },
        { question: "¿Qué abre en Barcelona el día de Navidad?", answer: "El 25 de diciembre es festivo: la mayoría de tiendas cierran por ley, pero el metro funciona y algunos monumentos abren con horario reducido, como la Sagrada Familia, de 9:00 a 14:00. El MNAC, La Pedrera y el Museu Picasso cierran." },
        { question: "¿Cuándo encienden las luces de Navidad en Barcelona en 2026?", answer: facts.lightsSwitchOn ? `El Ayuntamiento ha anunciado el encendido para el ${dayDate(facts.lightsSwitchOn.date, "es")}${at(facts.lightsSwitchOn.time, "es")}.` : `Aún no se ha anunciado (${AS_OF.es}). Los tres últimos años se encendieron en el paseo de Gràcia a las 18:00: ${switchOnHistory("es")}.` },
        { question: "¿Cuándo es la Fira de Santa Llúcia 2026?", answer: traditions.santaLlucia ? `Se celebra ${range(traditions.santaLlucia.from, traditions.santaLlucia.to, "es")}, frente a la Catedral.` : `Las fechas de 2026 aún no se han anunciado (${AS_OF.es}). En 2025 se celebró ${range(SANTA_LLUCIA_2025.from, SANTA_LLUCIA_2025.to, "es")}, frente a la Catedral.` },
        { question: "¿Funciona el metro de Barcelona en Nochebuena y Nochevieja?", answer: "Sí. Según el horario general de TMB, el 24 de diciembre cierra a las 23:00 y el 31 no cierra en toda la noche. TMB confirma el horario de Navidad en diciembre." },
      ]),
      ...paras(verifiedLine("es", BARCELONA_DECEMBER_AS_OF)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**In December 2026 Barcelona has three public holidays: ${holidays}.** Shops may open on ${shopDays}; on the 25th and 26th only exempt shops may. La Marató de 3Cat is on ${marato} and La Grossa de Cap d'Any is drawn on ${grossa}. Average highs are ${num(W.high, "en")} °C (${toF(W.high)} °F) and lows ${num(W.low, "en")} °C (${toF(W.low)} °F). ${lightsNews}`,
    ),
    keyFacts("December 2026 in Barcelona at a glance", [
      { label: "Public holidays", value: holidaysPhrase("en", false) },
      { label: "Shops", value: `May open on ${shopDays}; on the 25th and 26th, exempt shops only` },
      { label: "Weather", value: weatherFact("en") },
      { label: "Metro", value: "Until 23:00 on the 24th; all night on the 31st (TMB timetable)" },
      { label: "La Marató", value: marato },
      { label: "La Grossa de Cap d'Any", value: `${grossa}${drawTime ? `, at ${drawTime.time}` : " (time not announced yet)"}` },
      { label: "Lights switch-on", value: lightsFact("en", facts) },
      { label: "Fira de Santa Llúcia", value: santaLluciaFact("en", traditions) },
    ]),
    callout(
      "official",
      "How we handle dates",
      `We give a 2026 date only once the organiser or an official body has published it; dates from earlier years always carry their year. ${stillUndated("en", facts, traditions)}`,
    ),
    ...h2(
      "Things to do in Barcelona in December 2026: the key dates",
      "Day by day, everything that already has an official date: holidays, shops, concerts and shows, La Marató, nativity scenes and New Year's Eve.",
    ),
    keyDateTable("en", facts, traditions, drawTime),
    ...(pending.length
      ? [...h2("Still to be announced", "These December dates have not been announced yet. We add each to the table the day it is out:"), list(...pending)]
      : []),
    ...h2(
      "Public holidays in Barcelona in December 2026",
      `Three, all Catalonia-wide: ${holidays}. Sunday 6 December, Constitution Day, is not a holiday in Catalonia, and Monday the 7th is a working day in Barcelona, whose 2026 local holidays are ${localDaysPhrase("en")}. 24 and 31 December are working days too.`,
      `For a long weekend, see ${b2link("decemberBridge", "en", "the December 2026 long weekend")}.`,
    ),
    specialDayTable("en"),
    ...h2(
      "What's open and what's closed: shops, museums and sights",
      `**Shops.** In Barcelona they may open on ${shopDays}, under the 2026 shopping calendar. On 25 and 26 December Catalan retail law keeps shops on the general timetable closed; exempt, and so free to open, are bakeries and cake shops, florists, convenience stores, pharmacies, shops inside stations, and shops of up to 300 m² that sell everyday food or are run by small and medium-sized businesses. Being allowed to open does not mean every shop will: each decides. Details in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
      "**Museums and sights.** These are the holiday hours the big sights publish on their official websites. For anywhere else, check the museum's own site before you go: holiday hours change from year to year.",
    ),
    sightTable("en"),
    ...paras(
      `Sagrada Família, Park Güell and Casa Batlló tickets are in ${b2link("monuments", "en", "our tickets guide")}, and the museums you can visit for free in ${b2link("museums", "en", "free museums in Barcelona")}.`,
    ),
    ...h2(
      "Metro and transport in December",
      "The metro runs on every day of the holidays. This table applies TMB's standing timetable to the month's special days:",
    ),
    metroTable("en", METRO_DECEMBER),
    ...paras(
      `**L2:** until ${weekdayDay(L2_WORKS.until, "en")} December there are no trains between La Pau and Gorg because of engineering work; a shuttle bus runs, and the L4, L10, the tram and the R1 are alternatives. TMB expects trains back on ${weekdayDay(L2_WORKS.back, "en")} at 5:00 ([Barcelona City Council](${L2_WORKS.url}), ${dateYear(L2_WORKS.published, "en")}).`,
      `For night buses and each night's hours, see ${b2link("hours", "en", "Barcelona metro hours and night buses")}.`,
    ),
    ...h2("What is the weather like in Barcelona in December?", ...weatherParas("en")),
    ...h2(
      "Christmas in Barcelona: lights, markets and nativity scenes",
      facts.lightsSwitchOn
        ? `**Lights.** ${lightsNews} ${lightsKm("en", facts)}, and 2026 is the year Barcelona is European Capital of Christmas. The time, the place, the nightly lighting hours and the dates in ${LIGHTS_TOWNS.length} other towns are in ${b2link("christmasLights", "en", "the 2026 Christmas lights switch-on in Barcelona and Catalonia")}.`
        : `**Lights.** ${lightsNews} For 2026 it plans ${LIGHTS_PLAN_2026.km} km of lit streets, and 2026 is the year Barcelona is European Capital of Christmas. The date, time and place of the switch-on, once out, are in ${b2link("christmasBarcelona", "en", "the Barcelona Christmas lights switch-on")}.`,
      fairsParagraph("en", traditions),
      `**Nativity scenes.** In the city, the 33rd Torre del Suro living nativity, in el Guinardó, is on ${torre} at ${TORRE_DEL_SURO_2026.time}, free, according to its organisers. Catalonia's other living nativities are in ${b2link("pessebres", "en", "our living nativity scenes guide")}.`,
      `**Traditions.** Children start "feeding" the tió log on 8 December, the Immaculada, and the 26th, Sant Esteve, is a public holiday. ${pastoretsSentence("en")} How to make the tió poo and what Catalans eat at Christmas: ${b2link("christmasTraditions", "en", "Catalan Christmas traditions")}. And to close the season, the Kings' times and route: ${b2link("reis", "en", "the 2027 Three Kings parade")}.`,
    ),
    ...h2(
      "New for 2026: concerts and shows with a date",
      `Some of the December events in Barcelona already in the Catalan government's cultural agenda (open data, ${AS_OF.en}). Prices and tickets are on each organiser's website:`,
    ),
    agendaList("en"),
    ...h2(
      "Day trips and snow",
      `Baqueira Beret plans to open its season on ${baqueira} and the FGC resorts (La Molina, Vallter, Port Ainé and Boí Taüll) on ${fgc}, weather and snow permitting. La Molina can be reached by train from Barcelona. Every resort is in ${b2link("ski", "en", "Catalonia's ski resorts")}.`,
    ),
    faq([
      { question: "What is there to do in Barcelona in December 2026?", answer: `The Christmas lights and markets, concerts such as Pau Casals' oratorio El Pessebre at the Palau de la Música (${dayDate("2026-12-15", "en", false)}), The Nutcracker at the Liceu, La Marató de 3Cat (${marato}) and New Year's Eve. Shops may open on ${shopDays}.` },
      { question: "What are the public holidays in Barcelona in December 2026?", answer: `${cap(holidays)}. 6 and 7 December are not holidays in Barcelona, and the 24th and 31st are working days.` },
      { question: "What is the weather like in Barcelona in December?", answer: `Average highs of ${num(W.high, "en")} °C (${toF(W.high)} °F) and lows of ${num(W.low, "en")} °C (${toF(W.low)} °F) at the airport, with ${W.rain} mm of rain over about four days and ${W.sun} hours of sunshine (AEMET). In the city centre the average low is ${num(W.cityLow, "en")} °C.` },
      { question: "Are shops open on Sundays in Barcelona in December?", answer: `Yes: they may open on ${shopDays}. On 25 and 26 December, public holidays, only exempt shops may open, such as bakeries, convenience stores or shops of up to 300 m².` },
      { question: "Is Barcelona open on Christmas Day?", answer: "Partly. 25 December is a public holiday: most shops are closed by law, but the metro runs and some sights open for shorter hours, such as the Sagrada Família, 9:00 to 14:00. MNAC, La Pedrera and the Museu Picasso are closed." },
      { question: "When are the Barcelona Christmas lights switched on in 2026?", answer: facts.lightsSwitchOn ? `The City Council has announced the switch-on for ${dayDate(facts.lightsSwitchOn.date, "en")}${at(facts.lightsSwitchOn.time, "en")}.` : `It has not been announced yet (${AS_OF.en}). For the last three years the lights were switched on on Passeig de Gràcia at 18:00: on ${switchOnHistory("en")}.` },
      { question: "When is the Santa Llúcia Christmas market in 2026?", answer: traditions.santaLlucia ? `It runs from ${range(traditions.santaLlucia.from, traditions.santaLlucia.to, "en")}, in front of the Cathedral.` : `The 2026 dates have not been announced yet (${AS_OF.en}). In 2025 it ran from ${range(SANTA_LLUCIA_2025.from, SANTA_LLUCIA_2025.to, "en")}, in front of the Cathedral.` },
      { question: "Does the Barcelona metro run on Christmas Eve and New Year's Eve?", answer: "Yes. By TMB's standing timetable it closes at 23:00 on 24 December and runs all night on the 31st. TMB confirms its Christmas hours in December." },
    ]),
    ...paras(verifiedLine("en", BARCELONA_DECEMBER_AS_OF)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const BARCELONA_DECEMBER: B2Article = {
  key: "barcelonaDecember",
  entryKey: "guide-barcelona-in-december",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph. Same alt and caption as
  // the Christmas markets guide: media rows are keyed by file.
  heroKey: CHRISTMAS.heroKey,
  heroAlt: CHRISTMAS.heroAlt,
  heroCaption: CHRISTMAS.heroCaption,
  verifiedAt: BARCELONA_DECEMBER_AS_OF,
  publishedAt: "2026-10-31T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...BARCELONA_DECEMBER_META[locale], blocks: buildBarcelonaDecemberBody(locale) }]),
  ) as B2Article["editions"],
};

/** For tests: the metro hours the page states in prose, as TMB's standing rules compute them. */
export const METRO_PROSE = {
  christmasEve: metroDay(DAYS.christmasEve).close,
  newYearsEve: metroDay(DAYS.newYearsEve).close,
} as const;
