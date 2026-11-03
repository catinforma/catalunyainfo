import type { Block } from "@/lib/content/blocks";
import { addDays, holidayOn, weekdayIndex } from "@/lib/content/holidays/calendar";
import { CATALONIA_HOLIDAYS, SOURCES as HOLIDAY_SOURCES_2027 } from "@/lib/content/holidays/payload";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SCHOOL_SOURCE, SCHOOL_YEARS } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";

import { DAYS, PAST, dateYear, dayDate } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  lead,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";
import { OPENING_2027, SHOPS } from "./shops";

/**
 * Cavalcada de Reis 2027: the Three Kings parade in Barcelona and in the
 * larger towns of Catalonia, on year-free URLs (the same pages serve every
 * January) with the year in the titles.
 *
 * Why a page of its own: until now the parade was one sentence in three
 * pages (Christmas in Barcelona and New Year's Eve through
 * `cavalcadaSentence`, Barcelona in December as a "still to be announced"
 * item, Christmas traditions in its "Cap d'Any i Reis" section). None of them
 * could carry a route, a timetable or other towns, and "cabalgata reyes
 * barcelona 2027 recorrido horario" or "cavalcada reis girona 2027" want
 * exactly that. Those pages now link here (group `reis-2027-links`).
 *
 * Every fact was read on 31 Oct 2026 on the council's own pages
 * (research_notes/reis-2027.md): Barcelona's press notes of 12 Nov 2025 and
 * 2 Jan 2026, its 2026 press dossier, its Christmas and Cultura Popular pages
 * and TMB's note of 5 Jan 2026; the councils of Girona, Lleida (La Paeria),
 * Tarragona, Reus, Sabadell, Mataró, Badalona and Igualada; and the DOGC
 * (Acord GOV/166/2016, Igualada's festival of national heritage interest).
 * Terrassa is left out: terrassa.cat answered every request with a bot
 * challenge, so nothing of it could be read. On that day no council had
 * published a 2027 time or route; Mataró (30 Oct 2026) and Badalona (13 Oct
 * 2026) had confirmed the date, 5 January 2027.
 *
 * Dates are not typed twice: 6 January comes from Ordre EMT/52/2026
 * (holidays/payload.ts), the parade day is the day before it, the school
 * holidays from Ordre EDF/66/2026 (school/calendar.ts), the shop days from
 * Ordre EMT/89/2026 (shops.ts OPENING_2027), Barcelona's 2025 programme and
 * 2026 route dates from festive.ts PAST.
 *
 * HOW TO UPDATE:
 *  - Barcelona publishes (in 2025: programme with arrival and start time on
 *    12 Nov, full route and passing times on 2 Jan): fill
 *    ANNOUNCED_2027.barcelona with what the council's page says (date, time,
 *    and whatever of arrival, start, end, route and stops it gives), its URL
 *    and the read date; fill festive.ts ANNOUNCED_2026.cavalcada with the
 *    same date, time and URL (a test holds the two together); move
 *    REIS_AS_OF to the check date; run the tests; deploy; publish
 *    `?only=reis-2027` (and `?only=christmas-bcn`, `?only=nye` and
 *    `?only=barcelona-december`, which read festive.ts's cavalcada). Title,
 *    description, lead, key facts, route table and FAQ switch by themselves;
 *    the timetable moves to 2027 once `stops` is filled. Fill again when the
 *    route comes out (in place: same object, more fields, new URL and read).
 *  - A town publishes: fill ANNOUNCED_2027.towns[key] the same way (its
 *    council's host only), move REIS_AS_OF, test, deploy, `?only=reis-2027`.
 *  - From 7 January 2027 the test "the Barcelona 2027 slot is filled after
 *    the parade" fails while ANNOUNCED_2027.barcelona is still null.
 *
 * 3 Nov 2026 (Christmas cluster refresh): Barcelona re-read (press room
 * "reis" tag and "cavalcada" search, latest 11 Jan 2026; the parade page
 * still "Cavalcada de Reis 2026"): slot stays null. Igualada: the council's
 * Festa de Reis page is yearless ("Dia 5 de gener A partir de les 6 de la
 * tarda"); the Generalitat's cultural agenda posted the 2027 Festa de Reis
 * that day (activity 2026110300017: cavalcada 5 Jan at 18 h, Pg. Verdaguer to
 * Pl. Castells), but this slot takes the council's own host only, so it stays
 * null until igualada.cat publishes. The other towns were not re-read, so
 * REIS_AS_OF stays. The traditions paragraph now links the Christmas markets
 * guide and the living nativities.
 *
 * No new photograph: the hero is the shops guide's lead picture (Christmas
 * lights on a Barcelona shopping street), also the Christmas in Barcelona
 * hero, with its exact alt text and caption, because media rows are keyed by
 * file.
 */

/** The day the page was last brought up to date. Every "checked" line reads this, never the clock. */
export const REIS_AS_OF = "2026-10-31";

/* -------------------------------------------------------------------------- */
/* The days, from the shared modules                                          */
/* -------------------------------------------------------------------------- */

const REIS_HOLIDAY = CATALONIA_HOLIDAYS.find((holiday) => holiday.date.endsWith("-01-06"));
if (!REIS_HOLIDAY) throw new Error("reis: 6 January is missing from Ordre EMT/52/2026 (holidays/payload.ts)");

/** Reis, Wednesday 6 January 2027: a Catalonia-wide holiday (Ordre EMT/52/2026). */
export const REIS_DAY: string = REIS_HOLIDAY.date;
/** The parade is on the evening before. */
export const PARADE_DAY: string = addDays(REIS_DAY, -1);

const SCHOOL_YEAR = SCHOOL_YEARS.find((year) => year.christmas[0] <= REIS_DAY && REIS_DAY <= year.christmas[1]);
if (!SCHOOL_YEAR) throw new Error("reis: no school year in Ordre EDF/66/2026 covers 6 January 2027");

/** The 2026-2027 school Christmas holidays, both days inclusive (Ordre EDF/66/2026). */
export const SCHOOL_CHRISTMAS = { label: SCHOOL_YEAR.label, from: SCHOOL_YEAR.christmas[0], to: SCHOOL_YEAR.christmas[1] } as const;

/** Shops around Reis, from Ordre EMT/89/2026 (shops.ts). */
export const SHOP_DAYS = {
  /** Whether 6 January is one of the general opening days of 2027. */
  reisIsOpeningDay: (OPENING_2027.general as readonly string[]).includes(REIS_DAY),
  /** General opening days before Reis, for the presents. */
  before: OPENING_2027.general.filter((iso) => iso.startsWith("2027-01") && iso < REIS_DAY),
  /** The default municipal day in January (for councils that choose none). */
  municipalJanuary: OPENING_2027.municipalDefault.find((iso) => iso.startsWith("2027-01")),
} as const;

/* -------------------------------------------------------------------------- */
/* Parades                                                                    */
/* -------------------------------------------------------------------------- */

export interface RouteStop {
  /** Expected passing time, "18:35". */
  time: string;
  /** Where, as the council names it. */
  place: string;
}

/** What a council publishes about one parade. Place names stay as the council writes them. */
export interface Parade {
  /** ISO day of the parade. */
  date: string;
  /** Start of the parade, "18:00". */
  time: string;
  /** Where it sets off. */
  start?: string;
  /** Streets and squares in order, between the start and the end. */
  route?: readonly string[];
  /** Where it ends. */
  end?: string;
  /** When it is expected at the end, "21:10". */
  endTime?: string;
  /** The Kings' arrival before the parade, when the council gives it. */
  arrival?: { time?: string; place: string };
  /** Expected passing times (Barcelona publishes them). */
  stops?: readonly RouteStop[];
  /** The council's own page. */
  url: string;
  /** The day that page was read, ISO. */
  read: string;
}

/** A past parade, always printed with its year. */
export interface PastParade extends Parade {
  /** The arrival as one short phrase, for the towns table. */
  arrivalText: Record<Locale, string>;
  /** The start as one short phrase, when "time, start" would mislead. */
  startText?: Record<Locale, string>;
  /** What else the council said, in each language. */
  notes: Record<Locale, string>;
  /** The route is the one the council announced (it may have changed on the day). */
  announcedRoute?: true;
  /** The day the council published the programme, when its page shows it. */
  published?: string;
  /** Every official page used. */
  sources: B2Source[];
}

export type TownKey = "girona" | "lleida" | "tarragona" | "reus" | "sabadell" | "mataro" | "badalona" | "igualada";

export interface Town {
  key: TownKey;
  name: string;
  /** The council's hosts: a 2027 slot must cite one of them. */
  hosts: RegExp;
  /** Where the 2027 programme is expected. */
  watch: string;
  past: PastParade;
  /** Something official about 2027 already out (the date, a call for volunteers), never a time. */
  news2027?: { published: string; url: string; text: Record<Locale, string> };
  /** Our guide to getting there from Barcelona. */
  guide?: B2Key;
}

/* -------------------------------------------------------------------------- */
/* The slots: filled as each council publishes                                */
/* -------------------------------------------------------------------------- */

export interface Announced2027 {
  barcelona: Parade | null;
  towns: Record<TownKey, Parade | null>;
}

/**
 * The 5 January 2027 parades, as each council publishes them. `null` = nothing
 * official on REIS_AS_OF. Fill only from the council's own page; a press
 * cutting, an aggregator or last year's page is refused by paradeProblems().
 *
 * Template (Barcelona 2026, as a shape only; the tests refuse a 2026 date):
 *
 *   barcelona: {
 *     date: "2027-01-05",
 *     time: "18:00",
 *     arrival: { time: "16:30", place: "Portal de la Pau" },
 *     start: "Parc de la Ciutadella",
 *     end: "Font Màgica de Montjuïc",
 *     route: ["passeig de Colom", "avinguda del Paral·lel", ...],
 *     stops: [{ time: "18:00", place: "Parc de la Ciutadella" }, { time: "18:35", place: "Passeig de Colom amb Via Laietana" }, ...],
 *     endTime: "21:10",
 *     url: "https://ajuntament.barcelona.cat/premsa/2027/01/0X/...",
 *     read: "2027-01-0X",
 *   },
 */
export const ANNOUNCED_2027: Announced2027 = {
  barcelona: null,
  towns: {
    girona: null,
    lleida: null,
    tarragona: null,
    reus: null,
    sabadell: null,
    mataro: null,
    badalona: null,
    igualada: null,
  },
};

/** The first day this page checked every council: no 2027 time existed before it. */
const FIRST_CHECKED = "2026-10-31";

/** The window a 2027 parade must fall in. */
export const SEASON_2027 = { from: "2027-01-02", to: REIS_DAY } as const;

/** Barcelona City Council's hosts (its press room serves dossiers from dtibcn.cat): ANNOUNCED_2027.barcelona must cite one. */
export const BARCELONA_HOSTS = /(^|\.)(barcelona\.cat|dtibcn\.cat)$/;

/** Where to watch for each 2027 programme. */
export const REIS_WATCH = {
  barcelonaPage: "https://www.barcelona.cat/nadal/ca/els-reis-dorient/la-cavalcada-de-reis",
  barcelonaPress: "https://ajuntament.barcelona.cat/premsa/tag/reis/",
  tmbNews: "https://noticies.tmb.cat/sala-de-premsa",
} as const;

/** Why a filled slot cannot be printed, or nothing when it can. */
export function paradeProblems(parade: Parade, hosts: RegExp): string[] {
  const problems: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const valid = (value: string) => iso.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!valid(parade.date)) problems.push(`date ${parade.date} is not an ISO date`);
  else if (parade.date < SEASON_2027.from || parade.date > SEASON_2027.to) problems.push(`date ${parade.date} is not in January 2027 before Reis`);
  if (!hhmm.test(parade.time)) problems.push(`time ${parade.time} is not HH:MM`);
  if (parade.arrival?.time !== undefined && !hhmm.test(parade.arrival.time)) problems.push(`arrival time ${parade.arrival.time} is not HH:MM`);
  if (parade.arrival && !parade.arrival.place.trim()) problems.push("arrival place is empty");
  if (parade.endTime !== undefined && !hhmm.test(parade.endTime)) problems.push(`end time ${parade.endTime} is not HH:MM`);
  for (const name of [parade.start, parade.end, ...(parade.route ?? [])]) {
    if (name !== undefined && !name.trim()) problems.push("an empty place name");
  }
  const stops = parade.stops ?? [];
  for (const [i, stop] of stops.entries()) {
    if (!hhmm.test(stop.time)) problems.push(`stop ${stop.place}: ${stop.time} is not HH:MM`);
    if (!stop.place.trim()) problems.push(`stop ${i + 1} has no place`);
    if (i > 0 && stop.time < stops[i - 1]!.time) problems.push(`stop ${stop.place} is earlier than the one before`);
  }
  try {
    const url = new URL(parade.url);
    if (url.protocol !== "https:") problems.push(`${parade.url} is not https`);
    if (!hosts.test(url.host)) problems.push(`${url.host} is not the council's own site`);
    if (/[?&]utm_/.test(parade.url)) problems.push(`${parade.url} carries tracking`);
  } catch {
    problems.push(`${parade.url} is not a URL`);
  }
  if (!valid(parade.read)) problems.push(`read ${parade.read} is not an ISO date`);
  else if (parade.read < FIRST_CHECKED) problems.push(`read ${parade.read} is before this page first checked the councils`);
  return problems;
}

/** True once `today` is past Reis but Barcelona's 2027 parade was never filled in. */
export function isStale(today: string, barcelona: Parade | null = ANNOUNCED_2027.barcelona): boolean {
  return today > REIS_DAY && barcelona === null;
}

/* -------------------------------------------------------------------------- */
/* 2026: Barcelona                                                            */
/* -------------------------------------------------------------------------- */

const U = {
  bcnRoute2026: PAST.cavalcada2026.url,
  bcnDossier2026: "https://prod.premsa.dtibcn.cat/premsa/wp-content/uploads/2026/01/Dossier-Reis-2026.pdf",
  bcnProgramme2025: PAST.programme2025.url,
  bcnParadePage: REIS_WATCH.barcelonaPage,
  bcnReisPage: "https://www.barcelona.cat/nadal/ca/els-reis-dorient",
  bcnTraditions: "https://www.barcelona.cat/nadal/ca/tradicions/tradicions-de-reis",
  bcnCulturaPopular: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/cavalcada-de-reis",
  tmb2026: "https://noticies.tmb.cat/sala-de-premsa/transport-public-cavalcada-de-reis-de-barcelona-2026",
} as const;

export const REIS_URLS = U;

/**
 * Barcelona, 5 January 2026 (press note and dossier of 2 Jan 2026; the
 * Christmas site's parade page). The same route as 2025.
 */
export const BARCELONA_2026: PastParade = {
  date: "2026-01-05",
  time: "18:00",
  start: "Parc de la Ciutadella",
  route: ["avinguda del Marquès de l'Argentera", "passeig de Colom", "avinguda del Paral·lel", "ronda de Sant Pau", "carrer d'Urgell", "carrer de Sepúlveda", "avinguda de la Reina Maria Cristina"],
  end: "Font Màgica de Montjuïc",
  endTime: "21:10",
  arrival: { time: "16:30", place: "Portal de la Pau" },
  stops: [
    { time: "18:00", place: "Parc de la Ciutadella" },
    { time: "18:35", place: "Passeig de Colom amb Via Laietana" },
    { time: "18:55", place: "Monument a Colom" },
    { time: "19:10", place: "Portal de Santa Madrona" },
    { time: "19:30", place: "Avinguda del Paral·lel amb ronda de Sant Pau" },
    { time: "19:45", place: "Mercat de Sant Antoni" },
    { time: "20:10", place: "Carrer de Sepúlveda amb Comte Borrell" },
    { time: "20:30", place: "Carrer de Sepúlveda amb Entença" },
    { time: "20:50", place: "Avinguda de la Reina Maria Cristina" },
    { time: "21:10", place: "Avinguda de Francesc Ferrer i Guàrdia" },
  ],
  url: U.bcnRoute2026,
  read: "2026-10-31",
  published: PAST.cavalcada2026.route,
  arrivalText: {
    ca: "16:30, per mar, al Portal de la Pau",
    es: "16:30, por mar, en el Portal de la Pau",
    en: "16:30, by sea, at Portal de la Pau",
  },
  notes: {
    ca: "Els Reis van arribar per mar a bord de les Golondrines i l'alcalde els va donar el pa, la sal i la clau màgica de la ciutat. La comitiva feia més d'un quilòmetre, amb gairebé 1.300 ajudants, i no hi va haver aforaments limitats.",
    es: "Los Reyes llegaron por mar a bordo de las Golondrinas y el alcalde les dio el pan, la sal y la llave mágica de la ciudad. La comitiva medía más de un kilómetro, con casi 1.300 ayudantes, y no hubo aforos limitados.",
    en: "The Kings arrived by sea on one of the Golondrinas harbour boats, and the mayor gave them bread, salt and the magic key to the city. The procession was over a kilometre long, with almost 1,300 helpers, and there were no capacity limits.",
  },
  sources: [],
};

/** Where people with a disability card could watch in 2026 (the Christmas site's parade page). */
export const BARCELONA_RESERVED_2026: Record<Locale, readonly string[]> = {
  ca: ["el pla de Palau (costat mar)", "la cantonada de la plaça de les Drassanes amb l'avinguda del Paral·lel", "el Mercat de Sant Antoni (carrer de Manso amb carrer del Comte d'Urgell)", "la plaça d'Espanya (L3, costat Paral·lel)"],
  es: ["el pla de Palau (lado mar)", "la esquina de la plaza de les Drassanes con la avenida del Paral·lel", "el Mercat de Sant Antoni (calle de Manso con calle del Comte d'Urgell)", "la plaza d'Espanya (L3, lado Paral·lel)"],
  en: ["Pla de Palau (sea side)", "the corner of Plaça de les Drassanes and Avinguda del Paral·lel", "Mercat de Sant Antoni (Carrer de Manso at Carrer del Comte d'Urgell)", "Plaça d'Espanya (L3, Paral·lel side)"],
};

/** TMB's note of 5 January 2026, the day itself. */
export const TRANSPORT_2026 = {
  published: "2026-01-05",
  metroUntil: "2:00",
  reinforcedFrom: "17:00",
  busFrom: "16:00",
  busTo: "21:30",
  stations: ["Drassanes", "Paral·lel", "Sant Antoni", "Poble Sec", "Espanya"],
  url: U.tmb2026,
} as const;

/** The Fira de Reis on the Gran Via, 2025-26 season (the Christmas site's Reis page). */
export const FIRA_DE_REIS_2025 = { from: "2025-12-18", to: "2026-01-06", url: U.bcnReisPage } as const;

/* -------------------------------------------------------------------------- */
/* 2026: the towns                                                            */
/* -------------------------------------------------------------------------- */

export const TOWNS: readonly Town[] = [
  {
    key: "girona",
    name: "Girona",
    hosts: /(^|\.)girona\.cat$/,
    watch: "https://web.girona.cat/nadal/reis/cavalcada",
    guide: "girona",
    past: {
      date: "2026-01-05",
      time: "18:00",
      start: "Camp de Mart del parc de la Devesa",
      route: ["carrer de Caterina Albert", "carrer del Mestre Francesc Civil", "carrer de Santa Eugènia", "plaça del Marquès de Camps", "carrer de Barcelona", "avinguda de Mariano Álvarez de Castro", "Gran Via de Jaume I", "avinguda de Sant Francesc", "carrer de Santa Clara", "carrer d'Anselm Clavé", "carrer de Francesc Eiximenis"],
      end: "plaça de l'U d'Octubre de 2017",
      endTime: "19:45",
      arrival: { time: "16:00", place: "Campament Reial, Camp de Mart (parc de la Devesa)" },
      url: "https://web.girona.cat/nadal/reis/cavalcada",
      read: "2026-10-31",
      startText: {
        ca: "18:00, Camp de Mart (parc de la Devesa)",
        es: "18:00, Camp de Mart (parque de la Devesa)",
        en: "18:00, Camp de Mart (La Devesa park)",
      },
      arrivalText: {
        ca: "Campament Reial al Camp de Mart (la Devesa), de 16:00 a 18:00",
        es: "Campamento Real en el Camp de Mart (la Devesa), de 16:00 a 18:00",
        en: "Royal camp at Camp de Mart (La Devesa park), 16:00 to 18:00",
      },
      notes: {
        ca: "Els Reis van passar la tarda als tres espais del Campament Reial, on se'ls podia veure de prop, i a les 18:00 van sortir en carrossa; l'últim tram el van fer a peu. A les 19:45, a la plaça de l'U d'Octubre de 2017, va començar l'acte final, amb les sis bandes de la cavalcada i la benvinguda de l'alcalde. Al matí, de 10:30 a 12:30, els patges reials havien fet actuacions als barris. Hi havia espais reservats per a persones amb mobilitat reduïda al carrer de Santa Eugènia (davant de la plaça de Joan Brossa), a la plaça de l'U d'Octubre (cantonada amb la plaça de Josep Pla) i al Campament Reial, i un punt silenciós per a infants amb sensibilitat acústica a la Gran Via de Jaume I, entre l'avinguda de Mariano Álvarez de Castro i l'avinguda de Sant Francesc.",
        es: "Los Reyes pasaron la tarde en los tres espacios del Campamento Real, donde se les podía ver de cerca, y a las 18:00 salieron en carroza; el último tramo lo hicieron a pie. A las 19:45, en la plaza de l'U d'Octubre de 2017, empezó el acto final, con las seis bandas de la cabalgata y la bienvenida del alcalde. Por la mañana, de 10:30 a 12:30, los pajes reales habían actuado en los barrios. Había espacios reservados para personas con movilidad reducida en la calle de Santa Eugènia (frente a la plaza de Joan Brossa), en la plaza de l'U d'Octubre (esquina con la plaza de Josep Pla) y en el Campamento Real, y un punto silencioso para niños con sensibilidad acústica en la Gran Via de Jaume I, entre la avenida de Mariano Álvarez de Castro y la avenida de Sant Francesc.",
        en: "The Kings spent the afternoon in the three areas of the royal camp, where children could see them up close, and set off on their floats at 18:00, walking the last stretch. The closing event began at 19:45 in Plaça de l'U d'Octubre de 2017, with the parade's six bands and a welcome from the mayor. That morning, from 10:30 to 12:30, the royal pages had performed around the neighbourhoods. There were reserved areas for people with reduced mobility on Carrer de Santa Eugènia (opposite Plaça de Joan Brossa), in Plaça de l'U d'Octubre (corner of Plaça de Josep Pla) and at the royal camp, and a quiet spot for children sensitive to noise on Gran Via de Jaume I, between Avinguda de Mariano Álvarez de Castro and Avinguda de Sant Francesc.",
      },
      sources: [{ name: "Cavalcada dels Reis d'Orient (2026)", url: "https://web.girona.cat/nadal/reis/cavalcada", publisher: "Ajuntament de Girona" }],
    },
  },
  {
    key: "lleida",
    name: "Lleida",
    hosts: /(^|\.)paeria\.cat$/,
    watch: "https://www.paeria.cat/ca/actualitat/agenda/",
    past: {
      date: "2026-01-05",
      time: "18:00",
      start: "plaça de l'Estació",
      route: ["plaça de Ramon Berenguer IV", "rambla de Ferran", "avinguda de Francesc Macià", "avinguda de Blondel", "avinguda de Madrid", "plaça d'Espanya", "avinguda de Blondel"],
      end: "la Paeria",
      endTime: "20:00",
      arrival: { time: "17:30", place: "estació de Lleida-Pirineus" },
      url: "https://www.paeria.cat/ca/actualitat/agenda/cavalcada-de-reis-2026",
      read: "2026-10-31",
      arrivalText: {
        ca: "17:30, en tren, a l'estació de Lleida-Pirineus",
        es: "17:30, en tren, en la estación de Lleida-Pirineus",
        en: "17:30, by train, at Lleida-Pirineus station",
      },
      notes: {
        ca: "Des de les 17:00 hi havia animació a l'escenari de la plaça de l'Estació. A les 20:00 els Reis van saludar des del balcó de la Paeria, on van rebre les claus de la ciutat. La cavalcada, de més de 2 quilòmetres, tenia 12 carrosses i es van llançar 2 tones de caramels sense al·lèrgens. Al llarg del recorregut hi havia espais inclusius senyalitzats, i a la porta de l'estació per on sortien els Reis, un espai tranquil per a infants amb trastorn de l'espectre autista.",
        es: "Desde las 17:00 había animación en el escenario de la plaza de l'Estació. A las 20:00 los Reyes saludaron desde el balcón de la Paeria, donde recibieron las llaves de la ciudad. La cabalgata, de más de 2 kilómetros, tenía 12 carrozas y se lanzaron 2 toneladas de caramelos sin alérgenos. A lo largo del recorrido había espacios inclusivos señalizados, y en la puerta de la estación por donde salían los Reyes, un espacio tranquilo para niños con trastorno del espectro autista.",
        en: "There was entertainment on the stage in Plaça de l'Estació from 17:00. At 20:00 the Kings greeted the crowd from the balcony of the Paeria, the town hall, where they received the keys to the city. The parade, over 2 kilometres long, had 12 floats and threw 2 tonnes of allergen-free sweets. There were signposted inclusive areas along the route, and a quiet area for autistic children at the station door the Kings came out of.",
      },
      sources: [
        { name: "Cavalcada de Reis 2026", url: "https://www.paeria.cat/ca/actualitat/agenda/cavalcada-de-reis-2026", publisher: "La Paeria, Ajuntament de Lleida" },
        { name: "La Factoria dels Reixos incorpora nous oficis i l'espai de la plaça de la Llotja (30/12/2025)", url: "https://www.paeria.cat/ca/actualitat/noticies/la-factoria-dels-reixos-incorpora-nous-oficis-i-l2019espai-de-la-placa-de-la-llotja", publisher: "La Paeria, Ajuntament de Lleida" },
      ],
    },
  },
  {
    key: "tarragona",
    name: "Tarragona",
    hosts: /(^|\.)tarragona\.cat$/,
    watch: "https://www.tarragona.cat/cultura/agenda/2027/gener",
    guide: "tarragona",
    past: {
      date: "2026-01-05",
      time: "19:00",
      start: "carrer Reial",
      route: ["plaça dels Carros", "carrer Apodaca", "plaça de la Mitja Lluna", "carrer Unió", "Rambla Nova (dos tombs)", "carrer Sant Agustí", "Portalet"],
      end: "plaça de la Font",
      endTime: "20:30",
      arrival: { time: "18:15", place: "el Serrallo" },
      url: "https://www.tarragona.cat/cultura/agenda/2026/gener/arribada-cavalcada-reis-dorient-tarragona",
      read: "2026-10-31",
      arrivalText: {
        ca: "18:15, per mar, al Serrallo",
        es: "18:15, por mar, en el Serrallo",
        en: "18:15, by sea, at El Serrallo",
      },
      notes: {
        ca: "Els Reis van arribar amb vaixell al barri mariner del Serrallo, saludats per les sirenes dels vaixells del port i 21 salves, i van saludar des del balcó del Teatret del Serrallo. La cavalcada la va obrir la carrossa del Fanal de la ciutat, amb les de l'Estel, la Sínia, el Dromedari, el Camell i l'Elefant. Cap a les 20:30 va arribar a la plaça de la Font, on l'alcalde va lliurar als Reis les claus de la ciutat. L'organitzen l'Ajuntament i el Consell Municipal de la Cavalcada de Reis i l'Home dels Nassos.",
        es: "Los Reyes llegaron en barco al barrio marinero del Serrallo, saludados por las sirenas de los barcos del puerto y 21 salvas, y saludaron desde el balcón del Teatret del Serrallo. Abrió la cabalgata la carroza del Fanal de la ciudad, con las de l'Estel, la Sínia, el Dromedari, el Camell y l'Elefant. Hacia las 20:30 llegó a la plaza de la Font, donde el alcalde entregó a los Reyes las llaves de la ciudad. La organizan el Ayuntamiento y el Consell Municipal de la Cavalcada de Reis i l'Home dels Nassos.",
        en: "The Kings arrived by boat in the fishermen's quarter of El Serrallo, greeted by the sirens of the ships in the port and a 21-shot salute, and spoke from the balcony of the Teatret del Serrallo. The city's Fanal float opened the parade, followed by others such as the Star, the Water Wheel, the Dromedary, the Camel and the Elephant. At about 20:30 it reached Plaça de la Font, where the mayor handed the Kings the keys to the city. It is run by the City Council and its Cavalcada de Reis and Home dels Nassos council.",
      },
      sources: [{ name: "L'arribada, la cavalcada i la salutació de Ses Majestats els Reis Mags d'Orient a Tarragona (2026)", url: "https://www.tarragona.cat/cultura/agenda/2026/gener/arribada-cavalcada-reis-dorient-tarragona", publisher: "Ajuntament de Tarragona" }],
    },
  },
  {
    key: "reus",
    name: "Reus",
    hosts: /(^|\.)reus\.cat$/,
    watch: "https://www.reus.cat/ajuntament/notes-de-premsa",
    past: {
      date: "2026-01-05",
      time: "18:30",
      start: "passeig de Sunyer",
      route: ["plaça del Nen de les Oques", "carrer de Sant Joan", "raval de Jesús", "raval de Martí Folguera", "raval de Robuster", "raval de Sant Pere", "raval del Pallol", "carrer de la Selva del Camp", "carrer de l'Amargura", "plaça del Pintor Fortuny", "carrer de Llovera"],
      end: "plaça del Mercadal",
      arrival: { time: "16:30", place: "plaça d'Anton Borrell" },
      url: "https://www.reus.cat/noticia/la-cavalcada-de-reis-2026-tindra-un-nou-recorregut",
      read: "2026-10-31",
      announcedRoute: true,
      published: "2025-12-15",
      arrivalText: {
        ca: "16:30, a la plaça d'Anton Borrell",
        es: "16:30, en la plaza d'Anton Borrell",
        en: "16:30, at Plaça d'Anton Borrell",
      },
      notes: {
        ca: "L'Ajuntament va presentar la cavalcada del 2026 el 15 de desembre de 2025, amb un recorregut diferent de l'habitual. Segons aquell anunci, les autoritats municipals havien de rebre els Reis a la plaça d'Anton Borrell i, al final, els Reis havien de baixar pel carrer de Llovera fins a la plaça del Mercadal per recollir les claus de la ciutat. Es preveien un tram tranquil per a persones amb sensibilitats sensorials al carrer de l'Amargura (entre els carrers de Salvador Espriu i de Nolla), un espai per a persones amb mobilitat reduïda al raval del Pallol i el repartiment de 4,5 tones de caramels. Els patges arribaven el 29 de desembre al balcó de la Casa Rull.",
        es: "El Ayuntamiento presentó la cabalgata de 2026 el 15 de diciembre de 2025, con un recorrido distinto del habitual. Según ese anuncio, las autoridades municipales tenían que recibir a los Reyes en la plaza d'Anton Borrell y, al final, los Reyes tenían que bajar por la calle de Llovera hasta la plaza del Mercadal para recoger las llaves de la ciudad. Se preveían un tramo tranquilo para personas con sensibilidades sensoriales en la calle de l'Amargura (entre las calles de Salvador Espriu y de Nolla), un espacio para personas con movilidad reducida en el raval del Pallol y el reparto de 4,5 toneladas de caramelos. Los pajes llegaban el 29 de diciembre al balcón de la Casa Rull.",
        en: "The City Council presented the 2026 parade on 15 December 2025, with a route that differed from the usual one. Under that plan, municipal officials were to receive the Kings in Plaça d'Anton Borrell and, at the end, the Kings were to come down Carrer de Llovera to Plaça del Mercadal to collect the keys to the city. It provided for a quiet stretch for people with sensory sensitivities on Carrer de l'Amargura (between Carrer de Salvador Espriu and Carrer de Nolla), an area for people with reduced mobility on Raval del Pallol and 4.5 tonnes of sweets. The royal pages were due on 29 December, on the balcony of the Casa Rull.",
      },
      sources: [{ name: "La Cavalcada de Reis 2026 tindrà un nou recorregut (15/12/2025)", url: "https://www.reus.cat/noticia/la-cavalcada-de-reis-2026-tindra-un-nou-recorregut", publisher: "Ajuntament de Reus" }],
    },
  },
  {
    key: "sabadell",
    name: "Sabadell",
    hosts: /(^|\.)sabadell\.cat$/,
    watch: "https://www.sabadell.cat/ca/?option=com_content&view=article&id=246271&Itemid=2907",
    past: {
      date: "2026-01-05",
      time: "18:00",
      start: "ronda de Pau Vila amb carretera de Barcelona",
      route: ["carretera de Barcelona", "avinguda de Barberà", "Rambla", "plaça del Doctor Robert", "passeig de la Plaça Major", "passeig de Manresa", "via de Massagué", "avinguda de l'Onze de Setembre", "plaça de la Creu Alta", "carretera de Prats de Lluçanès", "carrer de Francesc Layret", "avinguda de la Concòrdia", "avinguda de Matadepera"],
      end: "avinguda de Can Deu",
      endTime: "21:00",
      url: "https://www.sabadell.cat/ca/?option=com_content&view=article&id=246271&Itemid=2907",
      read: "2026-10-31",
      startText: {
        ca: "18:00, ronda de Pau Vila amb carretera de Barcelona",
        es: "18:00, ronda de Pau Vila con carretera de Barcelona",
        en: "18:00, Ronda de Pau Vila at Carretera de Barcelona",
      },
      arrivalText: {
        ca: "La pàgina de la cavalcada no la detalla",
        es: "La página de la cabalgata no la detalla",
        en: "Not given on the parade page",
      },
      notes: {
        ca: "La cavalcada va anar de sud a nord: va sortir a les 18:00 de la ronda de Pau Vila amb la carretera de Barcelona i havia d'arribar a les 21:00 a l'avinguda de Can Deu, a la zona nord. Hi havia un tram de baix impacte sonor i lumínic.",
        es: "La cabalgata fue de sur a norte: salió a las 18:00 de la ronda de Pau Vila con la carretera de Barcelona y tenía que llegar a las 21:00 a la avenida de Can Deu, en la zona norte. Había un tramo de bajo impacto sonoro y lumínico.",
        en: "The parade ran south to north: it left the corner of Ronda de Pau Vila and Carretera de Barcelona at 18:00 and was due at Avinguda de Can Deu, in the north of the city, at 21:00. One stretch had low noise and low light.",
      },
      sources: [{ name: "Cavalcada de Reis (2026)", url: "https://www.sabadell.cat/ca/?option=com_content&view=article&id=246271&Itemid=2907", publisher: "Ajuntament de Sabadell" }],
    },
  },
  {
    key: "mataro",
    name: "Mataró",
    hosts: /(^|\.)(mataro\.cat|culturamataro\.cat)$/,
    watch: "https://www.mataro.cat/ca/actualitat/noticies",
    news2027: {
      published: "2026-10-30",
      url: "https://www.mataro.cat/ca/actualitat/noticies/2026/l2019ajuntament-obre-la-cavalcada-de-reis-a-la-ciutadania-amb-una-carrossa-participativa",
      text: {
        ca: "L'Ajuntament ja ha confirmat que la cavalcada serà el 5 de gener de 2027: el 30 d'octubre de 2026 va obrir 20 places de figurant per a la nova carrossa dels Serenins, amb preinscripció fins al 22 de novembre.",
        es: "El Ayuntamiento ya ha confirmado que la cabalgata será el 5 de enero de 2027: el 30 de octubre de 2026 abrió 20 plazas de figurante para la nueva carroza de los Serenins, con preinscripción hasta el 22 de noviembre.",
        en: "The City Council has already confirmed the parade for 5 January 2027: on 30 October 2026 it opened 20 places for members of the public on the new Serenins float, with applications until 22 November.",
      },
    },
    past: {
      date: "2026-01-05",
      time: "17:00",
      start: "plaça de Josep Cusachs",
      route: ["avinguda del Perú", "passeig de Rocafonda", "ronda d'Alfons X el Savi", "plaça d'Espanya", "camí de la Geganta", "plaça de Granollers", "avinguda de Puig i Cadafalch", "avinguda de la Gatassa", "plaça de Manuel Serra i Xifra", "ronda de Leopoldo O'Donnell", "carrer de Joan Larrea", "ronda de Francesc Macià", "Camí Ral", "ronda de Barceló", "avinguda del Maresme", "carrer de Lepant", "la Rambla"],
      end: "la Riera",
      endTime: "21:30",
      arrival: { time: "12:00", place: "port de Mataró" },
      url: "https://www.mataro.cat/ca/actualitat/avisos/afectacions-al-transit-per-la-cavalcada-de-reis-2026-el-dia-5-de-gener",
      read: "2026-10-31",
      published: "2025-11-20",
      arrivalText: {
        ca: "12:00, per mar, al port de Mataró",
        es: "12:00, por mar, en el puerto de Mataró",
        en: "12:00, by sea, at Mataró harbour",
      },
      notes: {
        ca: "Els Reis van arribar al port amb el llaüt Sant Ramon i l'alcalde els va lliurar la clau de la ciutat. A la tarda, la cavalcada (21 grups i més de 700 participants) va sortir a les 17:00 i havia d'arribar a l'Ajuntament cap a les 21:00, on els Reis i l'alcalde parlaven als infants des del balcó; l'avís de trànsit en preveia el final a les 21:30. Hi havia sis espais accessibles, i el Campament Reial del Parc Central va obrir de l'1 al 4 de gener. L'Ajuntament en va publicar el programa el 20 de novembre de 2025 i el recorregut, el 22 de desembre.",
        es: "Los Reyes llegaron al puerto en el llaüt Sant Ramon y el alcalde les entregó la llave de la ciudad. Por la tarde, la cabalgata (21 grupos y más de 700 participantes) salió a las 17:00 y tenía que llegar al Ayuntamiento hacia las 21:00, donde los Reyes y el alcalde hablaban a los niños desde el balcón; el aviso de tráfico preveía el final a las 21:30. Había seis espacios accesibles, y el Campamento Real del Parc Central abrió del 1 al 4 de enero. El Ayuntamiento publicó el programa el 20 de noviembre de 2025 y el recorrido, el 22 de diciembre.",
        en: "The Kings landed at the harbour from the llaüt (a traditional boat) Sant Ramon, and the mayor gave them the key to the city. The afternoon parade (21 groups and over 700 participants) left at 17:00 and was due at the town hall at about 21:00, where the Kings and the mayor spoke to the children from the balcony; the traffic notice put the end at 21:30. There were six accessible areas, and the royal camp in Parc Central was open from 1 to 4 January. The City Council published the programme on 20 November 2025 and the route on 22 December.",
      },
      sources: [
        { name: "Tot a punt per viure un Nadal amb més llums que mai, i amb noves carrosses i nous personatges a la Cavalcada (20/11/2025)", url: "https://www.mataro.cat/ca/actualitat/noticies/2025/tot-a-punt-per-viure-un-nadal-amb-mes-llums-que-mai-i-amb-noves-carrosses-i-nous-personatges-a-la-cavalcada-1", publisher: "Ajuntament de Mataró" },
        { name: "Afectacions al trànsit per la Cavalcada de Reis 2026 el dia 5 de gener (22/12/2025)", url: "https://www.mataro.cat/ca/actualitat/avisos/afectacions-al-transit-per-la-cavalcada-de-reis-2026-el-dia-5-de-gener", publisher: "Ajuntament de Mataró" },
        { name: "L'Ajuntament obre la Cavalcada de Reis a la ciutadania amb una carrossa participativa (30/10/2026)", url: "https://www.mataro.cat/ca/actualitat/noticies/2026/l2019ajuntament-obre-la-cavalcada-de-reis-a-la-ciutadania-amb-una-carrossa-participativa", publisher: "Ajuntament de Mataró" },
      ],
    },
  },
  {
    key: "badalona",
    name: "Badalona",
    hosts: /(^|\.)badalona\.cat$/,
    watch: "https://www.badalona.cat/ca/serveis-ajuntament/cultura/festes/reis",
    news2027: {
      published: "2026-10-13",
      url: "https://www.badalona.cat/ca/actualitat/noticies/el-proxim-dilluns-19-doctubre-sobre-el-termini-de-presentacio-de-sol-licituds-per-als-infants-que-vulguin-participar-en-la-cavalcada-de-reis-anant-a-dalt-de-les-carrosses",
      text: {
        ca: "L'Ajuntament ja prepara la Cavalcada de Reis 2027: el sorteig dels infants que aniran a dalt de les carrosses és el 12 de novembre, i hi entren els que tinguin entre 9 i 14 anys el 5 de gener de 2027.",
        es: "El Ayuntamiento ya prepara la Cabalgata de Reyes 2027: el sorteo de los niños que irán en las carrozas es el 12 de noviembre, y entran los que tengan entre 9 y 14 años el 5 de enero de 2027.",
        en: "The City Council is already preparing the 2027 parade: the draw for the children who will ride on the floats is on 12 November, open to those aged 9 to 14 on 5 January 2027.",
      },
    },
    past: {
      date: "2026-01-05",
      time: "18:00",
      start: "avinguda de Pius XII amb carrer de Ramiro de Maeztu",
      arrival: { time: "16:00", place: "Estadi Municipal de Badalona" },
      url: "https://www.badalona.cat/ca/serveis-ajuntament/cultura/festes/reis/reis-2025-2026",
      read: "2026-10-31",
      startText: {
        ca: "18:00, avinguda de Pius XII, cantonada amb el carrer de Ramiro de Maeztu",
        es: "18:00, avenida de Pius XII, esquina con la calle de Ramiro de Maeztu",
        en: "18:00, Avinguda de Pius XII at Carrer de Ramiro de Maeztu",
      },
      arrivalText: {
        ca: "16:00, en helicòpter, a l'Estadi Municipal",
        es: "16:00, en helicóptero, en el Estadi Municipal",
        en: "16:00, by helicopter, at the Estadi Municipal",
      },
      notes: {
        ca: "La rebuda a l'Estadi Municipal era gratuïta però calia reservar l'entrada (des del 22 de desembre a badalona.cat); les portes obrien a les 14:30 i tancaven a les 15:30. L'alcalde va lliurar als Reis la Clau Màgica que obre totes les llars de la ciutat. El lema de la cavalcada era «El somni que ens guia». Al carrer de Sant Bru, entre el carrer de Martí i Julià i la riera de Canyadó, hi havia un tram amigable amb les persones neurodiverses: la música baixava, la llum s'atenuava i els caramels es repartien en lloc de llançar-se. L'Ajuntament només en va detallar en text el punt de sortida.",
        es: "La recepción en el Estadi Municipal era gratuita pero había que reservar la entrada (desde el 22 de diciembre en badalona.cat); las puertas abrían a las 14:30 y cerraban a las 15:30. El alcalde entregó a los Reyes la Llave Mágica que abre todos los hogares de la ciudad. El lema de la cabalgata era «El somni que ens guia». En la calle de Sant Bru, entre la calle de Martí i Julià y la riera de Canyadó, había un tramo amigable con las personas neurodiversas: la música bajaba, la luz se atenuaba y los caramelos se repartían en lugar de lanzarse. El Ayuntamiento solo detalló por escrito el punto de salida.",
        en: "The welcome at the Estadi Municipal was free but needed a ticket (bookable from 22 December on badalona.cat); doors opened at 14:30 and closed at 15:30. The mayor handed the Kings the Magic Key that opens every home in the city. The parade's theme was 'El somni que ens guia' (the dream that guides us). On Carrer de Sant Bru, between Carrer de Martí i Julià and Riera de Canyadó, a stretch was friendly to neurodivergent people: music down, lights dimmed and sweets handed out rather than thrown. The council gave only the starting point in writing.",
      },
      sources: [
        { name: "Reis 2025-2026", url: "https://www.badalona.cat/ca/serveis-ajuntament/cultura/festes/reis/reis-2025-2026", publisher: "Ajuntament de Badalona" },
        { name: "Cavalcada de Reis (agenda, 5/1/2026)", url: "https://www.badalona.cat/ca/serveis-ajuntament/cultura/agenda/cavalcada-de-reis-1", publisher: "Ajuntament de Badalona" },
        { name: "Sol·licituds per als infants que vulguin participar en la Cavalcada de Reis 2027 (13/10/2026)", url: "https://www.badalona.cat/ca/actualitat/noticies/el-proxim-dilluns-19-doctubre-sobre-el-termini-de-presentacio-de-sol-licituds-per-als-infants-que-vulguin-participar-en-la-cavalcada-de-reis-anant-a-dalt-de-les-carrosses", publisher: "Ajuntament de Badalona" },
      ],
    },
  },
  {
    key: "igualada",
    name: "Igualada",
    hosts: /(^|\.)igualada\.cat$/,
    watch: "https://www.igualada.cat/ca/la-ciutat/festes-i-tradicions/festa-de-reis",
    past: {
      date: "2026-01-05",
      time: "18:00",
      url: "https://www.igualada.cat/ca/noticies/ses-majestats-i-el-patge-faruk-a-punt-d2019arribar-a-igualada-tot-preparat-per-la-cxxxi-festa-de-reis-d2019igualada",
      read: "2026-10-31",
      published: "2025-12-11",
      arrivalText: {
        ca: "Concert de bandes a les 17:15 i rebuda de l'alcalde cap a les 18:00",
        es: "Concierto de bandas a las 17:15 y recepción del alcalde hacia las 18:00",
        en: "Band concert at 17:15, mayor's welcome at about 18:00",
      },
      startText: {
        ca: "Cap a les 18:00, pels carrers del centre",
        es: "Hacia las 18:00, por las calles del centro",
        en: "About 18:00, through the town centre",
      },
      notes: {
        ca: "La Festa dels Reis d'Igualada és festa patrimonial d'interès nacional des del 2016 (Acord GOV/166/2016 de la Generalitat). Segons la declaració, la primera cavalcada documentada és del 1899, i el repartiment de regals ja es feia abans, amb referències orals des del 1895. El que la fa única: centenars de patges pugen als balcons amb llargues escales de fusta de colors i lliuren els regals a les cases del recorregut, i quan acaba la cavalcada reparteixen la resta per tota la ciutat. Abans, el 28 de desembre arriba el patge Faruk, que porta un llibre blanc i un de negre, i l'1 de gener els infants li lliuren la carta al Teatre Municipal l'Ateneu. El 2026, el 5 de gener, hi va haver concert de bandes al passeig de Verdaguer a les 17:15; cap a les 18:00 l'alcalde va rebre els Reis, i la carrossa del patge Faruk va obrir la cavalcada. Hi havia una zona tranquil·la al final del passeig de Mossèn Jacint Verdaguer, a l'altura de l'estació de tren. L'organitza la Comissió Cavalcada de Reis d'Igualada amb el suport de l'Ajuntament, que en va publicar el programa l'11 de desembre de 2025.",
        es: "La Festa dels Reis de Igualada es fiesta patrimonial de interés nacional desde 2016 (Acuerdo GOV/166/2016 de la Generalitat). Según la declaración, la primera cabalgata documentada es de 1899, y el reparto de regalos ya se hacía antes, con referencias orales desde 1895. Lo que la hace única: cientos de pajes suben a los balcones con largas escaleras de madera de colores y entregan los regalos en las casas del recorrido, y cuando acaba la cabalgata reparten el resto por toda la ciudad. Antes, el 28 de diciembre llega el paje Faruk, que lleva un libro blanco y uno negro, y el 1 de enero los niños le entregan la carta en el Teatre Municipal l'Ateneu. En 2026, el 5 de enero, hubo concierto de bandas en el paseo de Verdaguer a las 17:15; hacia las 18:00 el alcalde recibió a los Reyes, y la carroza del paje Faruk abrió la cabalgata. Había una zona tranquila al final del paseo de Mossèn Jacint Verdaguer, a la altura de la estación de tren. La organiza la Comissió Cavalcada de Reis d'Igualada con el apoyo del Ayuntamiento, que publicó el programa el 11 de diciembre de 2025.",
        en: "Igualada's Festa dels Reis has been a festival of national heritage interest since 2016 (Generalitat agreement GOV/166/2016). According to the declaration, the first documented parade dates from 1899, and presents were already being handed out before that, with oral accounts from 1895. What makes it unique: hundreds of royal pages climb long, coloured wooden ladders to the balconies and deliver the presents to the homes along the route, then hand out the rest across town once the parade is over. Before that, Patge Faruk, the royal messenger, arrives on 28 December with a white book and a black one, and on 1 January children give him their letters at the Teatre Municipal l'Ateneu. On 5 January 2026 there was a band concert on Passeig de Verdaguer at 17:15; at about 18:00 the mayor welcomed the Kings, and Patge Faruk's float opened the parade. There was a quiet area at the end of Passeig de Mossèn Jacint Verdaguer, by the train station. It is run by the Comissió Cavalcada de Reis d'Igualada with the City Council's support; the council published the programme on 11 December 2025.",
      },
      sources: [
        { name: "Ses Majestats i el Patge Faruk, a punt d'arribar a Igualada: tot preparat per la CXXXI Festa de Reis d'Igualada (11/12/2025)", url: "https://www.igualada.cat/ca/noticies/ses-majestats-i-el-patge-faruk-a-punt-d2019arribar-a-igualada-tot-preparat-per-la-cxxxi-festa-de-reis-d2019igualada", publisher: "Ajuntament d'Igualada" },
        { name: "Festa de Reis", url: "https://www.igualada.cat/ca/la-ciutat/festes-i-tradicions/festa-de-reis", publisher: "Ajuntament d'Igualada" },
        { name: "ACORD GOV/166/2016, de 27 de desembre, pel qual es declara festa patrimonial d'interès nacional la Festa dels Reis d'Igualada (DOGC núm. 7276, 29.12.2016)", url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=770302", publisher: "DOGC" },
      ],
    },
  },
];

/** Igualada's declaration (DOGC núm. 7276, 29.12.2016). */
export const IGUALADA_DECLARATION = {
  name: "Acord GOV/166/2016",
  agreed: "2016-12-27",
  published: "2016-12-29",
  url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=770302",
} as const;

export function townByKey(key: TownKey): Town {
  const town = TOWNS.find((t) => t.key === key);
  if (!town) throw new Error(`reis: no town ${key}`);
  return town;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const shopsSource = (part: string) => SHOPS.sources.find((s) => s.name.includes(part));

const BASE_SOURCES: B2Source[] = [
  { name: "Els Reis d'Orient tornen a Barcelona amb una Cavalcada plena de novetats (2/1/2026)", url: U.bcnRoute2026, publisher: "Ajuntament de Barcelona" },
  { name: "Dossier de premsa: Reis 2026 (2/1/2026)", url: U.bcnDossier2026, publisher: "Ajuntament de Barcelona" },
  { name: "Cavalcada de Reis 2026: horari i recorregut", url: U.bcnParadePage, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona vibra amb la màgia del Nadal (programa del 2025, 12/11/2025)", url: U.bcnProgramme2025, publisher: "Ajuntament de Barcelona" },
  { name: "Els Reis d'Orient (Nadal 2025)", url: U.bcnReisPage, publisher: "Ajuntament de Barcelona" },
  { name: "Tradicions de Reis", url: U.bcnTraditions, publisher: "Ajuntament de Barcelona" },
  { name: "Cavalcada de Reis", url: U.bcnCulturaPopular, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Servei de Premsa: Reis", url: REIS_WATCH.barcelonaPress, publisher: "Ajuntament de Barcelona" },
  { name: "Transport públic per a la Cavalcada de Reis de Barcelona 2026 (5/1/2026)", url: U.tmb2026, publisher: "TMB" },
  ...HOLIDAY_SOURCES_2027.slice(0, 1).map((s) => ({ name: s.name, url: s.url, publisher: s.publisher })),
  { name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: SCHOOL_SOURCE.publisher },
  ...[shopsSource("EMT/89/2026"), shopsSource("Llei 18/2017")].filter((s): s is B2Source => Boolean(s)),
];

/** Every source the page cites, the 2027 slots' pages first, each once. */
export function reisSources(announced: Announced2027 = ANNOUNCED_2027): B2Source[] {
  const filled: B2Source[] = [];
  if (announced.barcelona) filled.push({ name: "Cavalcada de Reis 2027", url: announced.barcelona.url, publisher: "Ajuntament de Barcelona" });
  for (const town of TOWNS) {
    const slot = announced.towns[town.key];
    if (slot) filled.push({ name: `Cavalcada de Reis 2027 (${town.name})`, url: slot.url, publisher: town.past.sources[0]?.publisher ?? town.name });
  }
  const seen = new Set<string>();
  const out: B2Source[] = [];
  for (const source of [...filled, ...BASE_SOURCES, ...TOWNS.flatMap((t) => t.past.sources)]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    out.push(source);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Wording helpers                                                            */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function joinList(items: readonly string[], locale: Locale): string {
  const and = { ca: "i", es: "y", en: "and" }[locale];
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/**
 * A council's place name in the page's language: "amb" (at the corner of)
 * and "dos tombs" (twice round) translated, and a capital in English, where
 * street names are proper nouns ("Passeig de Colom").
 */
export function localPlace(place: string, locale: Locale): string {
  if (locale === "ca") return place;
  const out = place
    .replace(/ amb /g, locale === "es" ? " con " : " at ")
    .replace("(dos tombs)", locale === "es" ? "(dos vueltas)" : "(twice)");
  return locale === "en" ? cap(out).replace(/ at ([a-zà-ú])/g, (_, c: string) => ` at ${c.toUpperCase()}`) : out;
}

/** "a les 18:00" / "a las 18:00" / "at 18:00". */
function at(time: string, locale: Locale): string {
  return { ca: `a les ${time}`, es: `a las ${time}`, en: `at ${time}` }[locale];
}

/** "Sortida: X. Recorregut: a, b, c. Arribada: Y (21:10)." for any council's list. */
function routeLine(p: Parade, locale: Locale): string {
  const t = {
    ca: { start: "Sortida", route: "Recorregut", end: "Arribada" },
    es: { start: "Salida", route: "Recorrido", end: "Llegada" },
    en: { start: "Start", route: "Route", end: "End" },
  }[locale];
  const parts: string[] = [];
  if (p.start) parts.push(`${t.start}: ${localPlace(p.start, locale)} (${p.time})`);
  if (p.route?.length) parts.push(`${t.route}: ${p.route.map((name) => localPlace(name, locale)).join(", ")}`);
  if (p.end) parts.push(`${t.end}: ${localPlace(p.end, locale)}${p.endTime ? ` (${p.endTime})` : ""}`);
  return parts.length ? `${parts.join(". ")}.` : "";
}

const AS_OF: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(REIS_AS_OF, "ca")}`,
  es: `comprobado el ${dateYear(REIS_AS_OF, "es")}`,
  en: `checked on ${dateYear(REIS_AS_OF, "en")}`,
};

const COUNCIL: Record<Locale, string> = { ca: "Ajuntament", es: "Ayuntamiento", en: "City Council" };

/** The towns the page covers, in order: "Girona, Lleida, ... i Igualada". */
export function townNames(locale: Locale): string {
  return joinList(TOWNS.map((t) => t.name), locale);
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; excerpt: string };

export const REIS_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/cavalcada-de-reis-barcelona",
    title: "Cavalcada de Reis 2027 a Barcelona i Catalunya: horari i recorregut",
    excerpt: "La Cavalcada de Reis 2027 a Barcelona, Girona, Lleida, Tarragona, Igualada i altres ciutats: a quina hora és, el recorregut, on arriben els Reis i què obre el dia 6.",
  },
  es: {
    path: "guias/cabalgata-de-reyes-barcelona",
    title: "Cabalgata de Reyes 2027 en Barcelona y Cataluña: horario y recorrido",
    excerpt: "La Cabalgata de Reyes 2027 en Barcelona, Girona, Lleida, Tarragona, Igualada y otras ciudades: a qué hora es, el recorrido, dónde llegan los Reyes y qué abre el día 6.",
  },
  en: {
    path: "guides/three-kings-parade-barcelona",
    title: "Three Kings Parade 2027 in Barcelona and Catalonia: times and route",
    excerpt: "The 2027 Three Kings parade in Barcelona, Girona, Lleida, Tarragona, Igualada and other towns: what time it starts, the route, where the Kings arrive and what opens on the 6th.",
  },
};

/** The search title: "horari i recorregut" until Barcelona publishes, then the start time. */
export function reisSeoTitle(locale: Locale, barcelona: Parade | null = ANNOUNCED_2027.barcelona): string {
  if (barcelona) {
    return {
      ca: `Cavalcada de Reis 2027 Barcelona: recorregut i hora, ${barcelona.time}`,
      es: `Cabalgata de Reyes 2027 Barcelona: recorrido y hora, ${barcelona.time}`,
      en: `Three Kings Parade 2027 Barcelona: ${barcelona.time} start and route`,
    }[locale];
  }
  return {
    ca: "Cavalcada de Reis 2027 Barcelona: horari i recorregut",
    es: "Cabalgata de Reyes 2027 Barcelona: horario y recorrido",
    en: "Three Kings Parade 2027 Barcelona: times and route",
  }[locale];
}

/** Answer-first description: the day until Barcelona publishes, then its times. */
export function reisDescription(locale: Locale, barcelona: Parade | null = ANNOUNCED_2027.barcelona): string {
  if (barcelona) {
    const day = dayDate(barcelona.date, locale, false);
    const arrival = barcelona.arrival?.time;
    return {
      ca: `Cavalcada de Reis 2027 a Barcelona: ${day}, ${arrival ? `arribada dels Reis a les ${arrival} i ` : ""}sortida a les ${barcelona.time}. Recorregut, horaris i altres ciutats.`,
      es: `Cabalgata de Reyes 2027 en Barcelona: ${day}, ${arrival ? `llegada de los Reyes a las ${arrival} y ` : ""}salida a las ${barcelona.time}. Recorrido, horarios y otras ciudades.`,
      en: `Barcelona's 2027 Three Kings parade: ${day}, ${arrival ? `Kings arrive at ${arrival}, ` : ""}parade starts at ${barcelona.time}. Route, passing times and other towns.`,
    }[locale];
  }
  return {
    ca: `La Cavalcada de Reis 2027 de Barcelona és el vespre del ${dayDate(PARADE_DAY, "ca", false)}. Horari i recorregut del 2026, i les de Girona, Lleida i Tarragona.`,
    es: `La Cabalgata de Reyes 2027 de Barcelona es la tarde del ${dayDate(PARADE_DAY, "es", false)}. Horario y recorrido de 2026, y las de Girona, Lleida y Tarragona.`,
    en: `Barcelona's 2027 Three Kings parade is on the evening of ${dayDate(PARADE_DAY, "en", false)}. The 2026 route and times, plus Girona, Lleida and Tarragona.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Barcelona                                                                  */
/* -------------------------------------------------------------------------- */

const B = BARCELONA_2026;
const B_ARRIVAL = B.arrival?.time ?? "";

/** The lead: Barcelona's 2027 parade, or the day and last year's times until it is published. */
export function reisLead(locale: Locale, barcelona: Parade | null = ANNOUNCED_2027.barcelona): string {
  const holiday = holidayOn(REIS_DAY);
  const reis = dayDate(REIS_DAY, locale, false);
  const holidayLine = holiday
    ? { ca: `El ${reis} és festiu a tot Catalunya.`, es: `El ${reis} es festivo en toda Cataluña.`, en: `${cap(reis)} is a public holiday across Catalonia.` }[locale]
    : "";
  if (barcelona) {
    const where = [barcelona.start, barcelona.end].filter(Boolean).join(" → ");
    const arrival = barcelona.arrival
      ? {
          ca: ` Els Reis arriben${barcelona.arrival.time ? ` ${at(barcelona.arrival.time, "ca")}` : ""} (${barcelona.arrival.place}).`,
          es: ` Los Reyes llegan${barcelona.arrival.time ? ` ${at(barcelona.arrival.time, "es")}` : ""} (${barcelona.arrival.place}).`,
          en: ` The Kings arrive${barcelona.arrival.time ? ` ${at(barcelona.arrival.time, "en")}` : ""} (${barcelona.arrival.place}).`,
        }[locale]
      : "";
    const more = barcelona.stops?.length
      ? { ca: " L'horari de pas, carrer a carrer, és a la taula de sota.", es: " El horario de paso, calle a calle, está en la tabla de abajo.", en: " The passing times, street by street, are in the table below." }[locale]
      : barcelona.route?.length
        ? { ca: " El recorregut és a sota.", es: " El recorrido está abajo.", en: " The route is below." }[locale]
        : { ca: " L'Ajuntament encara no n'ha publicat el recorregut complet.", es: " El Ayuntamiento aún no ha publicado el recorrido completo.", en: " The City Council has not published the full route yet." }[locale];
    return {
      ca: `**La Cavalcada de Reis 2027 de Barcelona és el ${dayDate(barcelona.date, "ca")} ${at(barcelona.time, "ca")}${where ? ` (${where})` : ""}.**${arrival} ${holidayLine}${more} Font: [Ajuntament de Barcelona](${barcelona.url}), consultada el ${dateYear(barcelona.read, "ca")}.`,
      es: `**La Cabalgata de Reyes 2027 de Barcelona es el ${dayDate(barcelona.date, "es")} ${at(barcelona.time, "es")}${where ? ` (${where})` : ""}.**${arrival} ${holidayLine}${more} Fuente: [Ayuntamiento de Barcelona](${barcelona.url}), consultada el ${dateYear(barcelona.read, "es")}.`,
      en: `**Barcelona's 2027 Three Kings parade is on ${dayDate(barcelona.date, "en")} ${at(barcelona.time, "en")}${where ? ` (${where})` : ""}.**${arrival} ${holidayLine}${more} Source: [Barcelona City Council](${barcelona.url}), read on ${dateYear(barcelona.read, "en")}.`,
    }[locale];
  }
  return {
    ca: `**La Cavalcada de Reis de Barcelona del 2027 és el vespre del ${dayDate(PARADE_DAY, "ca")}, i el ${reis} és festiu a tot Catalunya.** L'Ajuntament encara no n'ha publicat l'horari ni el recorregut (${AS_OF.ca}). El 2026 els Reis van arribar per mar al Portal de la Pau a les ${B_ARRIVAL}, i a les ${B.time} la cavalcada va sortir del parc de la Ciutadella cap a la Font Màgica de Montjuïc; l'horari previst acabava a les ${B.endTime}. Aquí tens el recorregut i l'horari de pas del 2026 i les cavalcades de ${townNames("ca")}; els del 2027 els afegim el dia que es publiquin.`,
    es: `**La Cabalgata de Reyes de Barcelona de 2027 es la tarde del ${dayDate(PARADE_DAY, "es")}, y el ${reis} es festivo en toda Cataluña.** El Ayuntamiento aún no ha publicado el horario ni el recorrido (${AS_OF.es}). En 2026 los Reyes llegaron por mar al Portal de la Pau a las ${B_ARRIVAL}, y a las ${B.time} la cabalgata salió del parque de la Ciutadella hacia la Font Màgica de Montjuïc; el horario previsto terminaba a las ${B.endTime}. Aquí tienes el recorrido y el horario de paso de 2026 y las cabalgatas de ${townNames("es")}; los de 2027 los añadimos el día que se publiquen.`,
    en: `**Barcelona's 2027 Three Kings parade is on the evening of ${dayDate(PARADE_DAY, "en")}, and ${reis} is a public holiday across Catalonia.** The City Council has not published the times or the route yet (${AS_OF.en}). In 2026 the Kings arrived by sea at Portal de la Pau at ${B_ARRIVAL}, and at ${B.time} the parade left Parc de la Ciutadella for the Magic Fountain of Montjuïc; the timetable ended at ${B.endTime}. Here are the 2026 route and passing times and the parades in ${townNames("en")}; the 2027 ones go in the day they are published.`,
  }[locale];
}

/** The route table: 2027's stops once published, 2026's (labelled) until then. */
export function stopsTable(locale: Locale, barcelona: Parade | null = ANNOUNCED_2027.barcelona): Block {
  const current = barcelona?.stops?.length ? barcelona : null;
  const p = current ?? B;
  const year = current ? current.date.slice(0, 4) : B.date.slice(0, 4);
  const caption = {
    ca: `Horari de pas previst de la Cavalcada de Reis de Barcelona, ${year}`,
    es: `Horario de paso previsto de la Cabalgata de Reyes de Barcelona, ${year}`,
    en: `Barcelona Three Kings parade: expected passing times, ${year}`,
  }[locale];
  const headers = { ca: ["Hora", "Punt del recorregut"], es: ["Hora", "Punto del recorrido"], en: ["Time", "Point on the route"] }[locale];
  const startLabel = { ca: "sortida", es: "salida", en: "start" }[locale];
  const rows = (p.stops ?? []).map((stop, i) => [stop.time, i === 0 ? `${localPlace(stop.place, locale)} (${startLabel})` : localPlace(stop.place, locale)]);
  const source = current
    ? { ca: `Font: [Ajuntament de Barcelona](${current.url}), consultada el ${dateYear(current.read, "ca")}.`, es: `Fuente: [Ayuntamiento de Barcelona](${current.url}), consultada el ${dateYear(current.read, "es")}.`, en: `Source: [Barcelona City Council](${current.url}), read on ${dateYear(current.read, "en")}.` }[locale]
    : {
        ca: `Horari del 2026, publicat per l'Ajuntament el ${dateYear(PAST.cavalcada2026.route, "ca")}; el del 2027 encara no s'ha publicat. Les hores són previstes: la cavalcada pot anar més lenta.`,
        es: `Horario de 2026, publicado por el Ayuntamiento el ${dateYear(PAST.cavalcada2026.route, "es")}; el de 2027 aún no se ha publicado. Las horas son previstas: la cabalgata puede ir más lenta.`,
        en: `The 2026 timetable, published by the City Council on ${dateYear(PAST.cavalcada2026.route, "en")}; the 2027 one is not out yet. Times are expected times: the parade can run late.`,
      }[locale];
  // The table note is plain text: strip the link markdown there.
  return table(caption, headers, rows, source.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
}

/* -------------------------------------------------------------------------- */
/* The towns                                                                  */
/* -------------------------------------------------------------------------- */

function townStatus(town: Town, slot: Parade | null, locale: Locale): string {
  if (slot) {
    const arrival = slot.arrival ? { ca: `Arribada dels Reis: ${slot.arrival.place}${slot.arrival.time ? ` (${slot.arrival.time})` : ""}. `, es: `Llegada de los Reyes: ${slot.arrival.place}${slot.arrival.time ? ` (${slot.arrival.time})` : ""}. `, en: `The Kings arrive: ${slot.arrival.place}${slot.arrival.time ? ` (${slot.arrival.time})` : ""}. ` }[locale] : "";
    return {
      ca: `**2027:** ${dayDate(slot.date, "ca")}, ${at(slot.time, "ca")}. ${arrival}${routeLine(slot, "ca")} Font: [${COUNCIL.ca}](${slot.url}), consultada el ${dateYear(slot.read, "ca")}.`,
      es: `**2027:** ${dayDate(slot.date, "es")}, ${at(slot.time, "es")}. ${arrival}${routeLine(slot, "es")} Fuente: [${COUNCIL.es}](${slot.url}), consultada el ${dateYear(slot.read, "es")}.`,
      en: `**2027:** ${dayDate(slot.date, "en")}, ${at(slot.time, "en")}. ${arrival}${routeLine(slot, "en")} Source: [${COUNCIL.en}](${slot.url}), read on ${dateYear(slot.read, "en")}.`,
    }[locale];
  }
  const news = town.news2027 ? ` ${town.news2027.text[locale]}` : "";
  return {
    ca: `**2027:** l'Ajuntament encara no n'ha publicat l'horari (${AS_OF.ca}).${news}`,
    es: `**2027:** el Ayuntamiento aún no ha publicado el horario (${AS_OF.es}).${news}`,
    en: `**2027:** the council has not published the times yet (${AS_OF.en}).${news}`,
  }[locale];
}

function townPast(town: Town, locale: Locale): string[] {
  const p = town.past;
  const route = routeLine(p, locale);
  const routeLabel = p.announcedRoute
    ? { ca: "Recorregut del 2026, tal com el va anunciar l'Ajuntament", es: "Recorrido de 2026, tal como lo anunció el Ayuntamiento", en: "The 2026 route as the council announced it" }[locale]
    : { ca: "Recorregut del 2026", es: "Recorrido de 2026", en: "The 2026 route" }[locale];
  const how = { ca: "Com va ser el 2026", es: "Cómo fue en 2026", en: "How 2026 went" }[locale];
  const out = [`**${how}:** ${p.notes[locale]}`];
  if (route && p.route?.length) out.push(`**${routeLabel}:** ${route}`);
  return out;
}

const GUIDE_LINE: Partial<Record<B2Key, Record<Locale, string>>> = {
  girona: { ca: "Si hi vas des de Barcelona", es: "Si vas desde Barcelona", en: "Going from Barcelona" },
  tarragona: { ca: "Si hi vas des de Barcelona", es: "Si vas desde Barcelona", en: "Going from Barcelona" },
};

function townBlocks(locale: Locale, announced: Announced2027): Block[] {
  const blocks: Block[] = [];
  for (const town of TOWNS) {
    const texts = [townStatus(town, announced.towns[town.key], locale), ...townPast(town, locale)];
    if (town.guide) {
      const label = GUIDE_LINE[town.guide]?.[locale] ?? "";
      const title = { ca: `${town.name} des de Barcelona en tren`, es: `${town.name} desde Barcelona en tren`, en: `${town.name} from Barcelona by train` }[locale];
      texts.push(`${label}: ${b2link(town.guide, locale, title)}.`);
    }
    blocks.push(...h3(town.name, ...texts));
  }
  return blocks;
}

/** The towns at a glance: 2026 arrival and start, and where 2027 stands. */
export function townRows(locale: Locale, announced: Announced2027 = ANNOUNCED_2027): string[][] {
  return TOWNS.map((town) => {
    const p = town.past;
    const slot = announced.towns[town.key];
    const start = p.startText?.[locale] ?? `${p.time}, ${localPlace(p.start ?? "", locale)}`;
    const pending = town.news2027
      ? { ca: "Data confirmada (5 de gener); horari pendent", es: "Fecha confirmada (5 de enero); horario pendiente", en: "Date confirmed (5 January); times to come" }[locale]
      : { ca: "Encara no publicat", es: "Aún no publicado", en: "Not published yet" }[locale];
    const now = slot ? `${cap(dayDate(slot.date, locale, false))}, ${slot.time}` : pending;
    return [town.name, p.arrivalText[locale], start, now];
  });
}

function townTable(locale: Locale, announced: Announced2027): Block {
  const caption = { ca: "Cavalcades de Reis a les grans ciutats: el 2026 i el 2027", es: "Cabalgatas de Reyes en las grandes ciudades: 2026 y 2027", en: "Three Kings parades in the larger towns: 2026 and 2027" }[locale];
  const headers = {
    ca: ["Ciutat", "Arribada dels Reis (2026)", "Cavalcada (2026)", "2027"],
    es: ["Ciudad", "Llegada de los Reyes (2026)", "Cabalgata (2026)", "2027"],
    en: ["Town", "Kings arrive (2026)", "Parade starts (2026)", "2027"],
  }[locale];
  const note = {
    ca: `De la web de cada ajuntament, ${AS_OF.ca}. Les dades del 2026 són de l'any passat: l'horari del 2027 pot canviar.`,
    es: `De la web de cada ayuntamiento, ${AS_OF.es}. Los datos de 2026 son del año pasado: el horario de 2027 puede cambiar.`,
    en: `From each council's website, ${AS_OF.en}. The 2026 details are last year's: 2027 times may change.`,
  }[locale];
  return table(caption, headers, townRows(locale, announced), note);
}

/** Where the towns stand: who has published 2027, who has confirmed the date, who is left out. */
export function townsIntro(locale: Locale, announced: Announced2027 = ANNOUNCED_2027): string {
  const published = TOWNS.filter((t) => announced.towns[t.key]).map((t) => t.name);
  const dated = TOWNS.filter((t) => !announced.towns[t.key] && t.news2027).map((t) => t.name);
  const status = published.length
    ? {
        ca: `Ja han publicat l'horari del 2027: ${joinList(published, "ca")}. La resta, encara no (${AS_OF.ca}).`,
        es: `Ya han publicado el horario de 2027: ${joinList(published, "es")}. El resto, aún no (${AS_OF.es}).`,
        en: `Already published for 2027: ${joinList(published, "en")}. The rest, not yet (${AS_OF.en}).`,
      }[locale]
    : {
        ca: `Cap ajuntament no ha publicat encara l'horari del 2027 (${AS_OF.ca}).`,
        es: `Ningún ayuntamiento ha publicado aún el horario de 2027 (${AS_OF.es}).`,
        en: `No council has published its 2027 times yet (${AS_OF.en}).`,
      }[locale];
  const confirmed = dated.length
    ? {
        ca: ` ${joinList(dated, "ca")} ja ${dated.length > 1 ? "n'han" : "n'ha"} confirmat la data, el 5 de gener.`,
        es: ` ${joinList(dated, "es")} ya ${dated.length > 1 ? "han" : "ha"} confirmado la fecha, el 5 de enero.`,
        en: ` ${joinList(dated, "en")} ${dated.length > 1 ? "have" : "has"} confirmed the date, 5 January.`,
      }[locale]
    : "";
  return {
    ca: `${status}${confirmed} Així van ser les del 2026, segons la web de cada ajuntament. Terrassa no hi és perquè la seva web no s'ha pogut consultar.`,
    es: `${status}${confirmed} Así fueron las de 2026, según la web de cada ayuntamiento. Terrassa no está porque su web no se ha podido consultar.`,
    en: `${status}${confirmed} This is how the 2026 parades went, from each council's website. Terrassa is missing because its website could not be read.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* 5 and 6 January                                                            */
/* -------------------------------------------------------------------------- */

function daysParas(locale: Locale): string[] {
  const holiday = holidayOn(REIS_DAY);
  const reis = dayDate(REIS_DAY, locale);
  const eve = dayDate(PARADE_DAY, locale, false);
  const from = dayDate(SCHOOL_CHRISTMAS.from, locale);
  const to = dayDate(SCHOOL_CHRISTMAS.to, locale);
  const before = SHOP_DAYS.before.map((iso) => dayDate(iso, locale, false));
  const municipal = SHOP_DAYS.municipalJanuary ? dayDate(SHOP_DAYS.municipalJanuary, locale, false) : "";
  const schoolLink = (label: string) => `[${label}](/${locale}/${TOOL_PATHS.school[locale]}/)`;
  const T = TRANSPORT_2026;
  const published = dateYear(T.published, locale);
  const stations = joinList(T.stations, locale);

  const holidayText = holiday
    ? {
        ca: `**Festiu.** El ${reis} és festiu a tot Catalunya (${holiday.name.ca}, Ordre EMT/52/2026). El ${eve}, dia de la cavalcada, és feiner.`,
        es: `**Festivo.** El ${reis} es festivo en toda Cataluña (${holiday.name.es}, Orden EMT/52/2026). El ${eve}, día de la cabalgata, es laborable.`,
        en: `**Public holiday.** ${cap(reis)} is a public holiday across Catalonia (${holiday.name.en}, Order EMT/52/2026). ${cap(eve)}, the day of the parade, is a working day.`,
      }[locale]
    : "";
  const shops = SHOP_DAYS.reisIsOpeningDay
    ? {
        ca: `**Botigues.** El 6 de gener és un dels dies d'obertura del calendari general del 2027 (Ordre EMT/89/2026).`,
        es: `**Tiendas.** El 6 de enero es uno de los días de apertura del calendario general de 2027 (Orden EMT/89/2026).`,
        en: `**Shops.** 6 January is one of the general opening days of 2027 (Order EMT/89/2026).`,
      }[locale]
    : {
        ca: `**Botigues.** El 5 de gener cada botiga obre amb el seu horari. El 6 no és cap dels dies d'obertura del calendari general del 2027 (Ordre EMT/89/2026): les botigues amb horari general tanquen, i només poden obrir les exemptes, com els forns i les pastisseries, les floristeries o les botigues de conveniència.${before.length ? ` Per als regals, el ${joinList(before, locale)} sí que és dia d'obertura del calendari general` : ""}${municipal ? `, i el ${municipal} és el dia d'obertura municipal per defecte als municipis que no en triïn un altre.` : "."} Tots els dies, a ${b2link("shops", "ca", "botigues obertes en festius")}.`,
        es: `**Tiendas.** El 5 de enero cada tienda abre con su horario. El 6 no es ninguno de los días de apertura del calendario general de 2027 (Orden EMT/89/2026): las tiendas con horario general cierran, y solo pueden abrir las exentas, como las panaderías y pastelerías, las floristerías o las tiendas de conveniencia.${before.length ? ` Para los regalos, el ${joinList(before, locale)} sí es día de apertura del calendario general` : ""}${municipal ? `, y el ${municipal} es el día de apertura municipal por defecto en los municipios que no elijan otro.` : "."} Todos los días, en ${b2link("shops", "es", "tiendas abiertas en festivos")}.`,
        en: `**Shops.** On 5 January each shop keeps its own hours. The 6th is not one of the general opening days of 2027 (Order EMT/89/2026): shops on the general timetable close, and only exempt ones may open, such as bakeries and cake shops, florists and convenience stores.${before.length ? ` For the presents, ${joinList(before, locale)} is a general opening day` : ""}${municipal ? `, and ${municipal} is the default municipal opening day in towns that do not choose another.` : "."} Every date is in ${b2link("shops", "en", "shops open on Sundays and holidays")}.`,
      }[locale];
  return [
    holidayText,
    {
      ca: `**Escola.** Les vacances de Nadal del curs ${SCHOOL_CHRISTMAS.label} van del ${from} al ${to}, tots dos inclosos (Ordre EDF/66/2026): el dia de la cavalcada i el de Reis encara són de vacances. Tot el curs, al ${schoolLink("calendari escolar")}.`,
      es: `**Colegio.** Las vacaciones de Navidad del curso ${SCHOOL_CHRISTMAS.label} van del ${from} al ${to}, ambos incluidos (Orden EDF/66/2026): el día de la cabalgata y el de Reyes aún son de vacaciones. Todo el curso, en el ${schoolLink("calendario escolar")}.`,
      en: `**School.** The ${SCHOOL_CHRISTMAS.label} Christmas holidays run from ${from} to ${to}, both inclusive (Order EDF/66/2026), so children are still off on the day of the parade and on Reis. The whole year is in the ${schoolLink("school calendar")}.`,
    }[locale],
    shops,
    {
      ca: `**Metro i bus a Barcelona.** TMB publica les mesures el mateix dia. El ${published} va anunciar que el metro funcionaria fins a les ${T.metroUntil}, per ser vigília de festiu, amb més trens a partir de les ${T.reinforcedFrom}, i que la majoria de línies de bus serien limitades o desviades entre les ${T.busFrom} i les ${T.busTo}, aproximadament; va reforçar el personal d'estacions com ${stations}. Per al 2027 encara no ha publicat res. Els horaris de cada nit, a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}.`,
      es: `**Metro y bus en Barcelona.** TMB publica las medidas el mismo día. El ${published} anunció que el metro funcionaría hasta las ${T.metroUntil}, por ser víspera de festivo, con más trenes a partir de las ${T.reinforcedFrom}, y que la mayoría de líneas de bus serían limitadas o desviadas entre las ${T.busFrom} y las ${T.busTo}, aproximadamente; reforzó el personal de estaciones como ${stations}. Para 2027 aún no ha publicado nada. Los horarios de cada noche, en ${b2link("hours", "es", "el horario del metro de Barcelona")}.`,
      en: `**Metro and buses in Barcelona.** TMB announces its arrangements on the day itself. On ${published} it said the metro would run until ${T.metroUntil}, as it was the eve of a holiday, with extra trains from ${T.reinforcedFrom}, and that most bus lines would be cut short or diverted between about ${T.busFrom} and ${T.busTo}; it added staff at stations such as ${stations}. Nothing has been published for 2027 yet. Each night's hours are in ${b2link("hours", "en", "Barcelona metro hours")}.`,
    }[locale],
    {
      ca: `**Pont.** El 6 cau en dimecres: si vols fer pont, mira ${b2link("bridges2027", "ca", "els ponts del 2027")}.`,
      es: `**Puente.** El 6 cae en miércoles: si quieres hacer puente, mira ${b2link("bridges2027", "es", "los puentes de 2027")}.`,
      en: `**Long weekend.** The 6th falls on a Wednesday: to make a long weekend of it, see ${b2link("bridges2027", "en", "the 2027 long weekends")}.`,
    }[locale],
  ].filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["christmasBarcelona", "christmasTraditions", "barcelonaDecember", "newYear", "shops", "bridges2027", "hours"] as const;

function keyFactItems(locale: Locale, barcelona: Parade | null): { label: string; value: string }[] {
  const L = <T,>(value: Record<Locale, T>) => value[locale];
  const holiday = holidayOn(REIS_DAY);
  const time = barcelona
    ? barcelona.time
    : L({ ca: `Encara no anunciada (el 2026, a les ${B.time})`, es: `Aún no anunciada (en 2026, a las ${B.time})`, en: `Not announced yet (${B.time} in 2026)` });
  const arrival = barcelona?.arrival
    ? `${barcelona.arrival.place}${barcelona.arrival.time ? `, ${barcelona.arrival.time}` : ""}`
    : L({ ca: `El 2026, per mar al Portal de la Pau, a les ${B_ARRIVAL}`, es: `En 2026, por mar al Portal de la Pau, a las ${B_ARRIVAL}`, en: `In 2026, by sea at Portal de la Pau, ${B_ARRIVAL}` });
  const route = barcelona && (barcelona.start || barcelona.end)
    ? [barcelona.start, barcelona.end].filter(Boolean).join(" → ")
    : L({ ca: "El 2026, del parc de la Ciutadella a la Font Màgica de Montjuïc", es: "En 2026, del parque de la Ciutadella a la Font Màgica de Montjuïc", en: "In 2026, Parc de la Ciutadella to the Magic Fountain of Montjuïc" });
  return [
    { label: L({ ca: "Cavalcada de Barcelona", es: "Cabalgata de Barcelona", en: "Barcelona parade" }), value: cap(dayDate(barcelona?.date ?? PARADE_DAY, locale)) },
    { label: L({ ca: "Hora de sortida", es: "Hora de salida", en: "Start time" }), value: time },
    { label: L({ ca: "Arribada dels Reis", es: "Llegada de los Reyes", en: "The Kings arrive" }), value: arrival },
    { label: L({ ca: "Recorregut", es: "Recorrido", en: "Route" }), value: route },
    ...(holiday ? [{ label: L({ ca: "Dia de Reis", es: "Día de Reyes", en: "Three Kings' Day" }), value: L({ ca: `${cap(dayDate(REIS_DAY, "ca"))}, festiu a tot Catalunya`, es: `${cap(dayDate(REIS_DAY, "es"))}, festivo en toda Cataluña`, en: `${dayDate(REIS_DAY, "en")}, public holiday across Catalonia` }) }] : []),
    { label: L({ ca: "Vacances escolars", es: "Vacaciones escolares", en: "School holidays" }), value: L({ ca: `Fins al ${dayDate(SCHOOL_CHRISTMAS.to, "ca")}`, es: `Hasta el ${dayDate(SCHOOL_CHRISTMAS.to, "es")}`, en: `Until ${dayDate(SCHOOL_CHRISTMAS.to, "en")}` }) },
    { label: L({ ca: "Altres ciutats", es: "Otras ciudades", en: "Other towns" }), value: townNames(locale) },
  ];
}

export function buildReisBody(locale: Locale, announced: Announced2027 = ANNOUNCED_2027): Block[] {
  const L = <T,>(value: Record<Locale, T>) => value[locale];
  const bcn = announced.barcelona;
  const programme = dateYear(PAST.programme2025.published, locale);
  const routeDay = dateYear(PAST.cavalcada2026.route, locale);
  const fira = { from: dayDate(FIRA_DE_REIS_2025.from, locale), to: dayDate(FIRA_DE_REIS_2025.to, locale) };
  const reserved = joinList(BARCELONA_RESERVED_2026[locale], locale);
  const bRoute = joinList((B.route ?? []).map((name) => localPlace(name, locale)), locale);

  const whenParas: string[] = bcn
    ? [
        L({
          ca: `L'Ajuntament ha publicat la cavalcada del 2027: ${dayDate(bcn.date, "ca")}, sortida ${at(bcn.time, "ca")}.${bcn.arrival ? ` Arribada dels Reis: ${bcn.arrival.place}${bcn.arrival.time ? `, ${at(bcn.arrival.time, "ca")}` : ""}.` : ""} ${routeLine(bcn, "ca")} ([font](${bcn.url}), consultada el ${dateYear(bcn.read, "ca")}).`,
          es: `El Ayuntamiento ha publicado la cabalgata de 2027: ${dayDate(bcn.date, "es")}, salida ${at(bcn.time, "es")}.${bcn.arrival ? ` Llegada de los Reyes: ${bcn.arrival.place}${bcn.arrival.time ? `, ${at(bcn.arrival.time, "es")}` : ""}.` : ""} ${routeLine(bcn, "es")} ([fuente](${bcn.url}), consultada el ${dateYear(bcn.read, "es")}).`,
          en: `The City Council has published the 2027 parade: ${dayDate(bcn.date, "en")}, starting ${at(bcn.time, "en")}.${bcn.arrival ? ` The Kings arrive: ${bcn.arrival.place}${bcn.arrival.time ? `, ${at(bcn.arrival.time, "en")}` : ""}.` : ""} ${routeLine(bcn, "en")} ([source](${bcn.url}), read on ${dateYear(bcn.read, "en")}).`,
        }),
      ]
    : [
        L({
          ca: `Encara no s'ha anunciat (${AS_OF.ca}). La cavalcada és sempre el vespre del 5 de gener, la vigília de Reis, i el 2027 cau en ${dayDate(PARADE_DAY, "ca", false).split(" ")[0]}. L'Ajuntament en publica l'horari en dues fases: per a la del 2026, el ${programme} va anunciar l'arribada dels Reis i l'hora de sortida, i el ${routeDay} el recorregut complet amb l'horari de pas.`,
          es: `Aún no se ha anunciado (${AS_OF.es}). La cabalgata es siempre la tarde del 5 de enero, la víspera de Reyes, y en 2027 cae en ${dayDate(PARADE_DAY, "es", false).split(" ")[0]}. El Ayuntamiento publica el horario en dos fases: para la de 2026, el ${programme} anunció la llegada de los Reyes y la hora de salida, y el ${routeDay} el recorrido completo con el horario de paso.`,
          en: `Not announced yet (${AS_OF.en}). The parade is always on the evening of 5 January, the eve of Three Kings' Day, which in 2027 is a ${dayDate(PARADE_DAY, "en", false).split(" ")[0]}. The City Council publishes the times in two stages: for the 2026 parade, it announced the Kings' arrival and the start time on ${programme}, and the full route with passing times on ${routeDay}.`,
        }),
        L({
          ca: `Com a referència, el 2026 els Reis van arribar al Portal de la Pau a les ${B_ARRIVAL} i la cavalcada va sortir a les ${B.time}; l'horari previst la feia arribar al final, l'avinguda de Francesc Ferrer i Guàrdia, a les ${B.endTime}. ${B.notes.ca}`,
          es: `Como referencia, en 2026 los Reyes llegaron al Portal de la Pau a las ${B_ARRIVAL} y la cabalgata salió a las ${B.time}; el horario previsto la hacía llegar al final, la avenida de Francesc Ferrer i Guàrdia, a las ${B.endTime}. ${B.notes.es}`,
          en: `For reference, in 2026 the Kings arrived at Portal de la Pau at ${B_ARRIVAL} and the parade set off at ${B.time}; the timetable had it reaching the end, Avinguda de Francesc Ferrer i Guàrdia, at ${B.endTime}. ${B.notes.en}`,
        }),
      ];

  return [
    lead(reisLead(locale, bcn)),
    keyFacts(L({ ca: "La Cavalcada de Reis 2027, d'un cop d'ull", es: "La Cabalgata de Reyes 2027, de un vistazo", en: "The 2027 Three Kings parade at a glance" }), keyFactItems(locale, bcn)),
    callout(
      "official",
      L({ ca: "Com tractem les dates", es: "Cómo tratamos las fechas", en: "How we handle dates" }),
      L({
        ca: "Només donem un horari o un recorregut del 2027 quan l'ha publicat l'ajuntament; els del 2026 sempre porten l'any al costat. Les cavalcades poden canviar a l'últim moment per la meteorologia: el mateix dia, mira els avisos de l'ajuntament.",
        es: "Solo damos un horario o un recorrido de 2027 cuando lo ha publicado el ayuntamiento; los de 2026 siempre llevan el año al lado. Las cabalgatas pueden cambiar en el último momento por el tiempo: el mismo día, mira los avisos del ayuntamiento.",
        en: "We only give a 2027 time or route once the council has published it; the 2026 ones always carry their year. Parades can change at the last minute because of the weather: on the day, check the council's notices.",
      }),
    ),
    ...h2(L({ ca: "A quina hora és la Cavalcada de Reis 2027 a Barcelona?", es: "¿A qué hora es la Cabalgata de Reyes 2027 en Barcelona?", en: "What time is the 2027 Three Kings parade in Barcelona?" }), ...whenParas),
    ...h2(
      L({ ca: "Recorregut i horari de pas a Barcelona", es: "Recorrido y horario de paso en Barcelona", en: "Barcelona parade route and passing times" }),
      bcn?.route?.length
        ? L({ ca: `Recorregut del 2027: ${routeLine(bcn, "ca")}`, es: `Recorrido de 2027: ${routeLine(bcn, "es")}`, en: `The 2027 route: ${routeLine(bcn, "en")}` })
        : L({
            ca: `El recorregut del 2026 va ser el mateix que el del 2025: va sortir del parc de la Ciutadella i va seguir, per aquest ordre, ${bRoute}, fins a la Font Màgica de Montjuïc. És un recorregut d'uns cinc quilòmetres per carrers amples del centre.`,
            es: `El recorrido de 2026 fue el mismo que el de 2025: salió del parque de la Ciutadella y siguió, por este orden, ${bRoute}, hasta la Font Màgica de Montjuïc. Es un recorrido de unos cinco kilómetros por calles anchas del centro.`,
            en: `The 2026 route was the same as in 2025: from Parc de la Ciutadella along, in this order, ${bRoute}, to the Magic Fountain of Montjuïc. It covers about five kilometres of wide central streets.`,
          }),
    ),
    stopsTable(locale, bcn),
    ...paras(
      L({
        ca: `**Espais reservats.** El 2026 hi havia espais reservats per a persones amb discapacitat, amb rampa d'accés, en quatre punts del recorregut: ${reserved}. N'hi havia un altre al Portal de la Pau per a l'arribada. Calia portar la targeta acreditativa i arribar-hi amb temps; les persones amb cadira de rodes hi podien anar amb una o dues persones com a màxim. L'Ajuntament també publica una guia cognitivament accessible per a persones amb trastorn de l'espectre autista.`,
        es: `**Espacios reservados.** En 2026 había espacios reservados para personas con discapacidad, con rampa de acceso, en cuatro puntos del recorrido: ${reserved}. Había otro en el Portal de la Pau para la llegada. Había que llevar la tarjeta acreditativa y llegar con tiempo; las personas en silla de ruedas podían ir con una o dos personas como máximo. El Ayuntamiento también publica una guía cognitivamente accesible para personas con trastorno del espectro autista.`,
        en: `**Reserved areas.** In 2026 there were reserved areas with ramps for disabled people at four points on the route: ${reserved}. There was another at Portal de la Pau for the arrival. You needed your disability card and to arrive in good time; wheelchair users could bring one or two companions at most. The City Council also publishes an easy-to-understand guide for autistic people.`,
      }),
      L({
        ca: "**Consells de l'Ajuntament.** Quedeu-vos darrere les tanques, no baixeu a la calçada a agafar caramels mentre passen les carrosses, no us enfileu a contenidors ni semàfors i, si aneu en grup, acordeu un punt de trobada fora de la zona plena de gent.",
        es: "**Consejos del Ayuntamiento.** Quedaos detrás de las vallas, no bajéis a la calzada a coger caramelos mientras pasan las carrozas, no os subáis a contenedores ni semáforos y, si vais en grupo, acordad un punto de encuentro fuera de la zona llena de gente.",
        en: "**The City Council's advice.** Stay behind the barriers, never step into the road for sweets while floats are passing, do not climb on bins or traffic lights, and if you are in a group, agree a meeting point away from the crowd.",
      }),
    ),
    ...h2(
      L({ ca: "On arriben els Reis a Barcelona?", es: "¿Dónde llegan los Reyes a Barcelona?", en: "Where do the Three Kings arrive in Barcelona?" }),
      L({
        ca: `Per mar. Des dels anys seixanta els Reis arriben a Barcelona amb vaixell i l'alcalde els rep al moll, els dona pa i sal com a símbol d'hospitalitat i els lliura la clau màgica que obre totes les cases de la ciutat durant una nit. El 2026 van arribar a les ${B_ARRIVAL} al Portal de la Pau, a bord de les Golondrines, i en cotxes d'època van anar fins al passeig de la Circumval·lació, a la Ciutadella, d'on surt la cavalcada.`,
        es: `Por mar. Desde los años sesenta los Reyes llegan a Barcelona en barco y el alcalde los recibe en el muelle, les da pan y sal como símbolo de hospitalidad y les entrega la llave mágica que abre todas las casas de la ciudad durante una noche. En 2026 llegaron a las ${B_ARRIVAL} al Portal de la Pau, a bordo de las Golondrinas, y en coches de época fueron hasta el paseo de la Circumval·lació, en la Ciutadella, de donde sale la cabalgata.`,
        en: `By sea. Since the 1960s the Kings have come to Barcelona by boat, and the mayor meets them on the quay, gives them bread and salt as a sign of hospitality and hands them the magic key that opens every home in the city for one night. In 2026 they arrived at ${B_ARRIVAL} at Portal de la Pau on the Golondrinas harbour boats and rode in vintage cars to Passeig de la Circumval·lació, by the Ciutadella, where the parade starts.`,
      }),
      L({
        ca: `**Més Reis a la ciutat.** Molts barris fan la seva pròpia cavalcada, i la Fira de Reis omple de parades la Gran Via: l'última, del ${fira.from} al ${fira.to}. Les dates de la del 2026-27 encara no s'han publicat.`,
        es: `**Más Reyes en la ciudad.** Muchos barrios hacen su propia cabalgata, y la Fira de Reis llena de puestos la Gran Via: la última, del ${fira.from} al ${fira.to}. Las fechas de la de 2026-27 aún no se han publicado.`,
        en: `**More Kings in the city.** Many neighbourhoods hold their own parade, and the Fira de Reis fills the Gran Via with stalls: last season, from ${fira.from} to ${fira.to}. The 2026-27 dates are not out yet.`,
      }),
    ),
    ...h2(
      L({ ca: "Cavalcades de Reis 2027 a Girona, Lleida, Tarragona i altres ciutats", es: "Cabalgatas de Reyes 2027 en Girona, Lleida, Tarragona y otras ciudades", en: "Three Kings parades 2027 in Girona, Lleida, Tarragona and other towns" }),
      townsIntro(locale, announced),
    ),
    townTable(locale, announced),
    ...townBlocks(locale, announced),
    ...h2(L({ ca: "El 5 i el 6 de gener: festiu, escola, botigues i metro", es: "El 5 y el 6 de enero: festivo, colegio, tiendas y metro", en: "5 and 6 January: holiday, school, shops and the metro" }), ...daysParas(locale)),
    ...h2(
      L({ ca: "Tradicions de Reis: la carta, el carbó i el tortell", es: "Tradiciones de Reyes: la carta, el carbón y el roscón", en: "Three Kings traditions: the letter, the coal and the tortell" }),
      L({
        ca: `A Catalunya els regals de Reis els porten Melcior, Gaspar i Baltasar. Els infants els escriuen abans una carta per demanar els jocs i les joguines que volen, i la donen als patges i carters reials, que la recullen els dies abans i fins i tot durant la cavalcada. La nit del 5 al 6 els Reis van de casa en casa, i el 6 al matí s'obren els regals; qui no ha fet bondat pot trobar carbó al costat de les sabates. El dia de Reis és costum compartir en família el tortell de Reis, que amaga una fava seca i una figureta de rei: qui troba la fava paga el tortell, i qui troba la figureta és coronat rei. Les altres tradicions, del tió al caganer, són a ${b2link("christmasTraditions", "ca", "les tradicions de Nadal a Catalunya")}, i abans, al desembre, hi ha ${b2link("christmas", "ca", "les fires de Nadal")}, com la de Santa Llúcia, i ${b2link("pessebres", "ca", "els pessebres vivents")}.`,
        es: `En Cataluña los regalos de Reyes los traen Melchor, Gaspar y Baltasar. Los niños les escriben antes una carta para pedir los juegos y juguetes que quieren, y la dan a los pajes y carteros reales, que la recogen los días antes e incluso durante la cabalgata. La noche del 5 al 6 los Reyes van de casa en casa, y el 6 por la mañana se abren los regalos; quien no se ha portado bien puede encontrar carbón junto a los zapatos. El día de Reyes es costumbre compartir en familia el tortell de Reis, el roscón catalán, que esconde un haba seca y una figurita de rey: quien encuentra el haba paga el tortell, y quien encuentra la figurita es coronado rey. Las demás tradiciones, del tió al caganer, están en ${b2link("christmasTraditions", "es", "las tradiciones de Navidad en Cataluña")}, y antes, en diciembre, hay ${b2link("christmas", "es", "mercados de Navidad")}, como la Fira de Santa Llúcia, y ${b2link("pessebres", "es", "belenes vivientes")}.`,
        en: `In Catalonia it is the Three Kings, Melcior, Gaspar and Baltasar, who bring children their presents, on the night of 5 January. Children write them a letter asking for the games and toys they want and hand it to the royal pages and postmen, who collect letters in the days before and even during the parade. That night the Kings go from house to house, and the presents are opened on the morning of the 6th; a child who has misbehaved may find coal beside their shoes. On Three Kings' Day families share a tortell de Reis, a ring-shaped pastry hiding a dried broad bean and a little king figure: whoever finds the bean pays for the tortell, and whoever finds the king is crowned. The other traditions, from the tió log to the caganer, are in ${b2link("christmasTraditions", "en", "Catalan Christmas traditions")}; before that, in December, come ${b2link("christmas", "en", "the Christmas markets")}, Santa Llúcia's among them, and ${b2link("pessebres", "en", "the living nativity scenes")}.`,
      }),
    ),
    faq(faqItems(locale, announced)),
    ...paras(verifiedLine(locale, REIS_AS_OF)),
    ...b2Related([...RELATED], locale),
  ].filter((block) => !(block.type === "paragraph" && !(block as { text: string }).text));

  function faqItems(loc: Locale, a: Announced2027): { question: string; answer: string }[] {
    const LL = <T,>(value: Record<Locale, T>) => value[loc];
    const b = a.barcelona;
    const girona = townByKey("girona");
    const gironaSlot = a.towns.girona;
    const tarragona = townByKey("tarragona");
    const lleida = townByKey("lleida");
    const holiday = holidayOn(REIS_DAY);
    const T = TRANSPORT_2026;
    const mariaCristina = B.stops?.find((stop) => stop.place.includes("Maria Cristina"))?.time ?? "";
    return [
      {
        question: LL({ ca: "A quina hora és la Cavalcada de Reis 2027 a Barcelona?", es: "¿A qué hora es la Cabalgata de Reyes 2027 en Barcelona?", en: "What time is the Three Kings parade in Barcelona in 2027?" }),
        answer: b
          ? LL({
              ca: `El ${dayDate(b.date, "ca")}, ${at(b.time, "ca")}${b.arrival?.time ? `; els Reis arriben ${at(b.arrival.time, "ca")} (${b.arrival.place})` : ""}, segons l'Ajuntament.`,
              es: `El ${dayDate(b.date, "es")}, ${at(b.time, "es")}${b.arrival?.time ? `; los Reyes llegan ${at(b.arrival.time, "es")} (${b.arrival.place})` : ""}, según el Ayuntamiento.`,
              en: `On ${dayDate(b.date, "en")} ${at(b.time, "en")}${b.arrival?.time ? `; the Kings arrive ${at(b.arrival.time, "en")} (${b.arrival.place})` : ""}, according to the City Council.`,
            })
          : LL({
              ca: `L'Ajuntament encara no ho ha publicat (${AS_OF.ca}). Serà el vespre del ${dayDate(PARADE_DAY, "ca")}. El 2026 els Reis van arribar al Portal de la Pau a les ${B_ARRIVAL} i la cavalcada va sortir a les ${B.time}.`,
              es: `El Ayuntamiento aún no lo ha publicado (${AS_OF.es}). Será la tarde del ${dayDate(PARADE_DAY, "es")}. En 2026 los Reyes llegaron al Portal de la Pau a las ${B_ARRIVAL} y la cabalgata salió a las ${B.time}.`,
              en: `The City Council has not published it yet (${AS_OF.en}). It will be on the evening of ${dayDate(PARADE_DAY, "en")}. In 2026 the Kings arrived at Portal de la Pau at ${B_ARRIVAL} and the parade set off at ${B.time}.`,
            }),
      },
      {
        question: LL({ ca: "Quin és el recorregut de la Cavalcada de Reis de Barcelona?", es: "¿Cuál es el recorrido de la Cabalgata de Reyes de Barcelona?", en: "What is the route of the Barcelona Three Kings parade?" }),
        answer: b?.route?.length
          ? routeLine(b, loc)
          : LL({
              ca: `El del 2027 encara no s'ha publicat. El 2026 va sortir del parc de la Ciutadella i va passar per ${bRoute} fins a la Font Màgica de Montjuïc, el mateix recorregut que el 2025.`,
              es: `El de 2027 aún no se ha publicado. En 2026 salió del parque de la Ciutadella y pasó por ${bRoute} hasta la Font Màgica de Montjuïc, el mismo recorrido que en 2025.`,
              en: `The 2027 route is not out yet. In 2026 the parade left Parc de la Ciutadella and followed ${bRoute} to the Magic Fountain of Montjuïc, the same route as in 2025.`,
            }),
      },
      {
        question: LL({ ca: "On arriben els Reis a Barcelona?", es: "¿Dónde llegan los Reyes Magos a Barcelona?", en: "Where do the Three Kings arrive in Barcelona?" }),
        answer: b?.arrival
          ? LL({ ca: `El 2027, a ${b.arrival.place}${b.arrival.time ? ` ${at(b.arrival.time, "ca")}` : ""}.`, es: `En 2027, en ${b.arrival.place}${b.arrival.time ? ` ${at(b.arrival.time, "es")}` : ""}.`, en: `In 2027, at ${b.arrival.place}${b.arrival.time ? ` ${at(b.arrival.time, "en")}` : ""}.` })
          : LL({
              ca: `Per mar. El 2026 van arribar al Portal de la Pau a les ${B_ARRIVAL}, a bord de les Golondrines, i l'alcalde els va donar el pa, la sal i la clau màgica de la ciutat.`,
              es: `Por mar. En 2026 llegaron al Portal de la Pau a las ${B_ARRIVAL}, a bordo de las Golondrinas, y el alcalde les dio el pan, la sal y la llave mágica de la ciudad.`,
              en: `By sea. In 2026 they arrived at Portal de la Pau at ${B_ARRIVAL} on the Golondrinas harbour boats, and the mayor gave them bread, salt and the magic key to the city.`,
            }),
      },
      {
        question: LL({ ca: "A quina hora arriba la cavalcada a la Font Màgica?", es: "¿A qué hora llega la cabalgata a la Font Màgica?", en: "What time does the parade reach the Magic Fountain?" }),
        answer: b?.endTime
          ? LL({ ca: `El 2027, l'horari previst la fa arribar al final ${at(b.endTime, "ca")}.`, es: `En 2027, el horario previsto la hace llegar al final ${at(b.endTime, "es")}.`, en: `In 2027 the timetable has it reaching the end ${at(b.endTime, "en")}.` })
          : LL({
              ca: `El 2026 l'horari previst la feia passar per l'avinguda de la Reina Maria Cristina a les ${mariaCristina} i arribar a l'avinguda de Francesc Ferrer i Guàrdia, al final, a les ${B.endTime}. L'horari del 2027 encara no s'ha publicat.`,
              es: `En 2026 el horario previsto la hacía pasar por la avenida de la Reina Maria Cristina a las ${mariaCristina} y llegar a la avenida de Francesc Ferrer i Guàrdia, al final, a las ${B.endTime}. El horario de 2027 aún no se ha publicado.`,
              en: `In 2026 the timetable had it on Avinguda de la Reina Maria Cristina at ${mariaCristina} and at the end, Avinguda de Francesc Ferrer i Guàrdia, at ${B.endTime}. The 2027 timetable is not out yet.`,
            }),
      },
      {
        question: LL({ ca: "Hi ha espais reservats per a persones amb discapacitat a la cavalcada de Barcelona?", es: "¿Hay espacios reservados para personas con discapacidad en la cabalgata de Barcelona?", en: "Are there reserved viewing areas for disabled people at the Barcelona parade?" }),
        answer: LL({
          ca: `Sí. El 2026 n'hi havia quatre al llarg del recorregut, amb accés amb la targeta acreditativa: ${reserved}. N'hi havia un altre al Portal de la Pau per a l'arribada.`,
          es: `Sí. En 2026 había cuatro a lo largo del recorrido, con acceso con la tarjeta acreditativa: ${reserved}. Había otro en el Portal de la Pau para la llegada.`,
          en: `Yes. In 2026 there were four along the route, entered with a disability card: ${reserved}. There was another at Portal de la Pau for the arrival.`,
        }),
      },
      {
        question: LL({ ca: "Quan és la Cavalcada de Reis 2027 a Girona?", es: "¿Cuándo es la Cabalgata de Reyes 2027 en Girona?", en: "When is the 2027 Three Kings parade in Girona?" }),
        answer: gironaSlot
          ? LL({ ca: `El ${dayDate(gironaSlot.date, "ca")}, ${at(gironaSlot.time, "ca")}, segons l'Ajuntament de Girona.`, es: `El ${dayDate(gironaSlot.date, "es")}, ${at(gironaSlot.time, "es")}, según el Ayuntamiento de Girona.`, en: `On ${dayDate(gironaSlot.date, "en")} ${at(gironaSlot.time, "en")}, according to Girona City Council.` })
          : LL({
              ca: `L'Ajuntament encara no n'ha publicat l'horari (${AS_OF.ca}). El 2026 els Reis van estar al Campament Reial del Camp de Mart, a la Devesa, de 16:00 a 18:00, i la cavalcada va sortir a les ${girona.past.time} cap a la plaça de l'U d'Octubre de 2017, on l'acte final va començar a les ${girona.past.endTime}.`,
              es: `El Ayuntamiento aún no ha publicado el horario (${AS_OF.es}). En 2026 los Reyes estuvieron en el Campamento Real del Camp de Mart, en la Devesa, de 16:00 a 18:00, y la cabalgata salió a las ${girona.past.time} hacia la plaza de l'U d'Octubre de 2017, donde el acto final empezó a las ${girona.past.endTime}.`,
              en: `The council has not published the times yet (${AS_OF.en}). In 2026 the Kings were at the royal camp at Camp de Mart, in La Devesa park, from 16:00 to 18:00, and the parade left at ${girona.past.time} for Plaça de l'U d'Octubre de 2017, where the closing event began at ${girona.past.endTime}.`,
            }),
      },
      {
        question: LL({ ca: "A quina hora arriben els Reis a Tarragona i a Lleida?", es: "¿A qué hora llegan los Reyes a Tarragona y a Lleida?", en: "What time do the Kings arrive in Tarragona and Lleida?" }),
        answer: LL({
          ca: `El 2026, a Tarragona van arribar per mar al Serrallo a les ${tarragona.past.arrival?.time} i la cavalcada va sortir a les ${tarragona.past.time}; a Lleida van arribar en tren a l'estació a les ${lleida.past.arrival?.time} i la cavalcada va sortir a les ${lleida.past.time}. Els horaris del 2027 encara no s'han publicat.`,
          es: `En 2026, en Tarragona llegaron por mar al Serrallo a las ${tarragona.past.arrival?.time} y la cabalgata salió a las ${tarragona.past.time}; en Lleida llegaron en tren a la estación a las ${lleida.past.arrival?.time} y la cabalgata salió a las ${lleida.past.time}. Los horarios de 2027 aún no se han publicado.`,
          en: `In 2026 the Kings reached Tarragona by sea at El Serrallo at ${tarragona.past.arrival?.time} and the parade left at ${tarragona.past.time}; in Lleida they came by train at ${lleida.past.arrival?.time} and the parade left at ${lleida.past.time}. The 2027 times are not out yet.`,
        }),
      },
      {
        question: LL({ ca: "Per què és famosa la Cavalcada de Reis d'Igualada?", es: "¿Por qué es famosa la Cabalgata de Reyes de Igualada?", en: "Why is the Igualada Three Kings parade famous?" }),
        answer: LL({
          ca: `Perquè és una de les més antigues de Catalunya (la primera documentada és del 1899) i perquè els patges pugen als balcons amb escales de fusta per lliurar els regals. És festa patrimonial d'interès nacional des del 2016.`,
          es: `Porque es una de las más antiguas de Cataluña (la primera documentada es de 1899) y porque los pajes suben a los balcones con escaleras de madera para entregar los regalos. Es fiesta patrimonial de interés nacional desde 2016.`,
          en: `It is one of the oldest in Catalonia (the first documented one was in 1899), and its pages climb wooden ladders to the balconies to deliver the presents. It has been a festival of national heritage interest since 2016.`,
        }),
      },
      ...(holiday
        ? [
            {
              question: LL({ ca: "El 6 de gener de 2027 és festiu?", es: "¿El 6 de enero de 2027 es festivo?", en: "Is 6 January 2027 a public holiday?" }),
              answer: LL({
                ca: `Sí, a tot Catalunya: el ${dayDate(REIS_DAY, "ca")}, Reis, és un dels ${CATALONIA_HOLIDAYS.length} festius del 2027 a Catalunya (Ordre EMT/52/2026). El 5 és feiner.`,
                es: `Sí, en toda Cataluña: el ${dayDate(REIS_DAY, "es")}, Reyes, es uno de los ${CATALONIA_HOLIDAYS.length} festivos de 2027 en Cataluña (Orden EMT/52/2026). El 5 es laborable.`,
                en: `Yes, across Catalonia: ${dayDate(REIS_DAY, "en")}, Three Kings' Day, is one of Catalonia's ${CATALONIA_HOLIDAYS.length} public holidays in 2027 (Order EMT/52/2026). The 5th is a working day.`,
              }),
            },
          ]
        : []),
      {
        question: LL({ ca: "Obren les botigues el dia de Reis?", es: "¿Abren las tiendas el día de Reyes?", en: "Are shops open on Three Kings' Day?" }),
        answer: SHOP_DAYS.reisIsOpeningDay
          ? LL({ ca: "Sí: el 6 de gener és dia d'obertura del calendari general del 2027.", es: "Sí: el 6 de enero es día de apertura del calendario general de 2027.", en: "Yes: 6 January is a general opening day in 2027." })
          : LL({
              ca: "La majoria no: el 6 de gener no és dia d'obertura comercial i les botigues amb horari general tanquen. Poden obrir les exemptes, com els forns i les pastisseries, les floristeries i les botigues de conveniència.",
              es: "La mayoría no: el 6 de enero no es día de apertura comercial y las tiendas con horario general cierran. Pueden abrir las exentas, como las panaderías y pastelerías, las floristerías y las tiendas de conveniencia.",
              en: "Most are not: 6 January is not a trading day, so shops on the general timetable close. Exempt shops, such as bakeries and cake shops, florists and convenience stores, may open.",
            }),
      },
      {
        question: LL({ ca: "Funciona el metro de Barcelona la nit de la cavalcada?", es: "¿Funciona el metro de Barcelona la noche de la cabalgata?", en: "Does the Barcelona metro run late on the night of the parade?" }),
        answer: LL({
          ca: `El 2026, sí: TMB va allargar el metro fins a les ${T.metroUntil}, per ser vigília de festiu, i en va reforçar el servei des de les ${T.reinforcedFrom}. Ho anuncia el mateix dia; per al 2027 encara no ha publicat res.`,
          es: `En 2026, sí: TMB alargó el metro hasta las ${T.metroUntil}, por ser víspera de festivo, y reforzó el servicio desde las ${T.reinforcedFrom}. Lo anuncia el mismo día; para 2027 aún no ha publicado nada.`,
          en: `In 2026 it did: TMB ran the metro until ${T.metroUntil}, as it was the eve of a holiday, with extra trains from ${T.reinforcedFrom}. It announces this on the day; nothing has been published for 2027 yet.`,
        }),
      },
    ];
  }
}

/* -------------------------------------------------------------------------- */
/* The article                                                                */
/* -------------------------------------------------------------------------- */

export const REIS: B2Article = {
  key: "reis",
  entryKey: "guide-three-kings-parade-barcelona",
  categoryKey: "festivals",
  sources: reisSources(),
  // Reused from the manifest, not a new photograph. Same alt and caption as
  // the shops guide: media rows are keyed by file.
  heroKey: SHOPS.heroKey,
  heroAlt: SHOPS.heroAlt,
  heroCaption: SHOPS.heroCaption,
  verifiedAt: REIS_AS_OF,
  publishedAt: "2026-10-31T18:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...REIS_META[locale], seoTitle: reisSeoTitle(locale), seoDescription: reisDescription(locale), blocks: buildReisBody(locale) },
    ]),
  ) as B2Article["editions"],
};

/** For tests: the weekday of the parade day, from the date itself. */
export const PARADE_WEEKDAY = weekdayIndex(PARADE_DAY);

/** For tests: the festive.ts day the other pages print for the parade. */
export const FESTIVE_PARADE_DAY = DAYS.reisEve;
