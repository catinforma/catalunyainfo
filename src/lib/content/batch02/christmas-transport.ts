import type { Block } from "@/lib/content/blocks";
import { addDays, holidayOn, weekdayIndex } from "@/lib/content/holidays/calendar";
import { metroDay } from "@/lib/content/metro/tonight";
import type { Locale } from "@/lib/i18n/config";

import { DAYS, PAST, dateYear, dayDate, metroRows } from "./festive";
import { TRANSPORT_2026, allTowns } from "./reis";
import { trafficBlocks, trafficSources } from "./traffic-dec-2026";
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
  type B2Key,
  type B2Source,
} from "./shared";

/**
 * Transport in Barcelona over Christmas, New Year and Reis 2026-27: metro,
 * TMB buses, NitBus, Rodalies, FGC and tram on 24, 25, 26 and 31 December
 * and 1, 5 and 6 January. Year-free URLs (guies/transport-nadal-cap-d-any-
 * barcelona, guias/transporte-navidad-nochevieja-barcelona, guides/barcelona-
 * public-transport-christmas-new-year), the season in the titles.
 *
 * Why (5 Nov 2026): the metro-hours guide takes 1.2k Spanish impressions a
 * fortnight at position 10.5 with no clicks and 1.75k English ones at 0.2 %,
 * and the New Year's Eve guide 359 (es) and 199 (ca); the holiday questions
 * ("metro 24 diciembre", "metro nochevieja", "rodalies nochevieja", "fgc cap
 * d'any") peak from 20 December to 6 January and no page of ours answers them
 * day by day for every operator. The two guides link here from their body
 * (titles and descriptions untouched: the EN metro-hours description is in
 * the 3 Nov window).
 *
 * What is printed, and how it is labelled:
 *  - Metro and tram: each operator's standing timetable (TMB's hours page,
 *    re-read 5 Nov 2026: "24 de desembre De 5.00 a 23.00 hores", "31 de
 *    desembre Servei continu tota la nit de Cap d'Any"; tram.cat FAQ, last
 *    updated 30 Sep 2024: "24 de desembre: de 5.00 a 22.30 h", "Vigílies de
 *    l'1 de gener ... servei continu tota la nit"), applied to the 2026-27
 *    days by code, so a weekday shift (26 December 2026 is a Saturday) is
 *    computed, not copied. Each operator confirms in December.
 *  - Everything else: last season's official notices (Christmas 2025 and
 *    New Year / Reis 2026), always printed with their year and "per
 *    confirmar" until the operator publishes 2026-27's. Sources:
 *    TMB / Barcelona City Council 23 Dec 2025 (24-26 Dec, Bus Turístic,
 *    6 Jan); TMB 30 Dec 2025 (New Year's Eve, metro 43 hours); TMB 5 Jan 2026
 *    (the parade night, reis.ts TRANSPORT_2026); ATM 5 Dec 2025 (joint note:
 *    NitBus, TRAM, FGC on 24-26 and 31 Dec); FGC through the Generalitat's
 *    press room 18 Dec 2025 (24-26 Dec, the all-night lines and intervals);
 *    Rodalies 16 Dec 2025 (24-25 Dec, holiday timetables on 26 Dec, 1 and
 *    6 Jan); Barcelona's Christmas site (5 Jan: eve-of-holiday hours).
 *    Fact pack: research_notes/x10/reis-transport-nadal-2026.md.
 *
 * Left out on purpose: AMB's daytime metropolitan buses (amb.cat refuses
 * automated requests and the ATM note gives no hours), the NitBus line count
 * and hours as this year's (23 lines, 22:30-6:00 in 2025; 23:00-5:00 in
 * 2023), FGC on Sant Esteve as a rule (2:00 in 2025, midnight in 2024),
 * Rodalies on New Year's Eve (no official word in 2025), the ATM note's
 * Rodalies line for 24 Dec 2025 (it contradicts Rodalies' own page), the
 * City Council's Christmas-site metro line for 25 Dec (it carries 2024's
 * weekday and contradicts TMB), and every press report.
 *
 * HOW TO UPDATE (by 18 December 2026, when a test starts failing):
 *  - Read each operator's `watch` page. When its 2026-27 notice is out, fill
 *    ANNOUNCED_2026_27[key] with the notice's URL, the read date and, for
 *    each day it covers, what it says (ca/es/en). That line replaces last
 *    season's on the page; the others stay labelled with their year.
 *  - Move TRANSPORT_NADAL_AS_OF to the day every operator was re-read.
 *  - Run the tests, deploy, publish `?only=transport-nadal`.
 *
 * No new photograph: the hero is the metro-hours guide's (line 1 platform at
 * Catalunya), with its exact alt text and caption, because media rows are
 * keyed by file; a test holds the copy equal to HOURS.
 */

/** The day every operator below was last read. Every "checked" line reads this, never the clock. */
export const TRANSPORT_NADAL_AS_OF = "2026-11-05";

/**
 * From this day the page must have been re-read (a test fails otherwise). In
 * 2025 the operators published between 26 Nov (TMB's season preview) and
 * 23 Dec (TMB's special hours); FGC on 18 Dec, Rodalies on 16 Dec, ATM on
 * 5 Dec.
 */
export const TRANSPORT_NADAL_REREAD_BY = "2026-12-18";

/** The first day this page checked the operators: no 2026-27 notice can be read before it. */
const FIRST_CHECKED = "2026-11-05";

export type DayKey = keyof typeof DAYS;

/** The days the page covers, in order (festive.ts DAYS: 24, 25, 26, 31 Dec 2026, 1, 5, 6 Jan 2027). */
export const TRANSPORT_DAYS: readonly DayKey[] = ["christmasEve", "christmas", "santEsteve", "newYearsEve", "newYear", "reisEve", "reis"];

export type OperatorKey = "metro" | "tmbBus" | "nitbus" | "rodalies" | "fgc" | "tram";

/** What last season's official notice said about one day. */
export interface DayFact {
  /** The year of the day it describes: 2025 for 24-31 December 2025, 2026 for January 2026. */
  year: 2025 | 2026;
  /** Short form for the key facts, without the year. */
  short: Record<Locale, string>;
  /** The full line, without the year. */
  text: Record<Locale, string>;
  url: string;
}

export interface Notice {
  name: string;
  url: string;
  /** The day the notice was published, ISO. */
  published: string;
  publisher: string;
}

export interface Operator {
  key: OperatorKey;
  name: Record<Locale, string>;
  /** The operator's own hosts (or its public owner's): every URL of the row must be on one of them. */
  hosts: RegExp;
  /** Where the 2026-27 notice is expected. */
  watch: string;
  /** Last season's notices, with their publication day. */
  notices: readonly Notice[];
  days: Partial<Record<DayKey, DayFact>>;
}

/** An operator's 2026-27 notice, once out: replaces last season's lines for the days it covers. */
export interface Announced {
  url: string;
  /** The day it was read, ISO. */
  read: string;
  days: Partial<Record<DayKey, Record<Locale, string>>>;
}

/**
 * The operators' 2026-27 notices, as each publishes. `null` = nothing on
 * TRANSPORT_NADAL_AS_OF. Fill only from the operator's own page;
 * announcedProblems() refuses another host.
 */
export const ANNOUNCED_2026_27: Record<OperatorKey, Announced | null> = {
  metro: null,
  tmbBus: null,
  nitbus: null,
  rodalies: null,
  fgc: null,
  tram: null,
};

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const TRANSPORT_URLS = {
  tmbHours: "https://www.tmb.cat/ca/transport-barcelona/horari-metro-bus",
  tmbNews: "https://noticies.tmb.cat/sala-de-premsa",
  tmbChristmas2025: PAST.tmbChristmas2025.url,
  tmbInfographic2025: "https://pro.static.noticies.tmb.cat/s3fs-public/2025-12/nadal2_231225.pdf",
  tmbNewYear2025: "https://noticies.tmb.cat/sala-de-premsa/cap-dany-metro-funcionara-43-hores-sense-interrupcio-3",
  tmbReis2026: TRANSPORT_2026.url,
  atm2025: "https://www.atm.cat/w/ndp-horaris-nadal2025",
  atmPress: "https://www.atm.cat/comunicacio/sala-de-premsa/notes-de-premsa",
  fgc2025: "https://govern.cat/salapremsa/notes-premsa/775716/ferrocarrils-adapta-el-servei-a-les-festes-de-nadal-i-de-cap-d-any",
  fgcPress: "https://govern.cat/salapremsa/notes-premsa",
  fgcHolidaysBV: "https://www.fgc.cat/fgc-faq/quins-dies-son-festius-a-la-linia-barcelona-valles/",
  fgcHolidaysLA: "https://www.fgc.cat/fgc-faq/quins-dies-son-festius-a-la-linia-llobregat-anoia/",
  rodalies2025: "https://rodalies.gencat.cat/ca/detalls/article/12_12_Nadal",
  rodaliesNews: "https://rodalies.gencat.cat/ca/sobre-rodalies/actualitat/",
  tramFaq: "https://www.tram.cat/ca/faq",
  bcnChristmasTransport: "https://www.barcelona.cat/nadal/ca/informacio-practica/dispositiu-especial-de-transport-public",
} as const;

const U = TRANSPORT_URLS;

/* -------------------------------------------------------------------------- */
/* The operators: last season's notices                                       */
/* -------------------------------------------------------------------------- */

export const OPERATORS: readonly Operator[] = [
  {
    key: "metro",
    name: { ca: "Metro", es: "Metro", en: "Metro" },
    hosts: /(^|\.)(tmb\.cat|barcelona\.cat)$/,
    watch: U.tmbNews,
    notices: [
      { name: "Horaris especials del metro i els autobusos de TMB la vigília de Nadal (23/12/2025)", url: U.tmbChristmas2025, published: PAST.tmbChristmas2025.published, publisher: "Ajuntament de Barcelona / TMB" },
      { name: "Per Cap d'Any, el metro funcionarà 43 hores sense interrupció (30/12/2025)", url: U.tmbNewYear2025, published: "2025-12-30", publisher: "TMB" },
      { name: "Transport públic per a la Cavalcada de Reis de Barcelona 2026 (5/1/2026)", url: U.tmbReis2026, published: TRANSPORT_2026.published, publisher: "TMB" },
    ],
    days: {
      // "Dijous, dia de Nadal, i divendres, Sant Esteve, el metro circularà de 5 del matí a 2 de la matinada." (23 Dec 2025)
      christmas: {
        year: 2025,
        short: { ca: "de 5:00 a 2:00", es: "de 5:00 a 2:00", en: "5:00 to 2:00" },
        text: { ca: "el dia de Nadal va funcionar de 5:00 a 2:00", es: "el día de Navidad funcionó de 5:00 a 2:00", en: "on Christmas Day it ran from 5:00 to 2:00" },
        url: U.tmbChristmas2025,
      },
      santEsteve: {
        year: 2025,
        short: { ca: "de 5:00 a 2:00", es: "de 5:00 a 2:00", en: "5:00 to 2:00" },
        text: { ca: "per Sant Esteve, que va caure en divendres, va funcionar de 5:00 a 2:00", es: "por San Esteban, que cayó en viernes, funcionó de 5:00 a 2:00", en: "on Sant Esteve, a Friday that year, it ran from 5:00 to 2:00" },
        url: U.tmbChristmas2025,
      },
      // "vuit línies i 165 estacions de la xarxa de metro funcionaran des de les 5 del matí de demà dimecres, 31 de desembre, fins que finalitzi el servei de demà passat dijous, 1 de gener, a la mitjanit." (30 Dec 2025)
      newYearsEve: {
        year: 2025,
        short: { ca: "43 hores seguides", es: "43 horas seguidas", en: "43 hours non-stop" },
        text: {
          ca: "va funcionar 43 hores seguides, amb vuit línies i 165 estacions, des de les 5:00 del 31 de desembre fins a la mitjanit de l'1 de gener",
          es: "funcionó 43 horas seguidas, con ocho líneas y 165 estaciones, desde las 5:00 del 31 de diciembre hasta la medianoche del 1 de enero",
          en: "it ran for 43 hours non-stop, with eight lines and 165 stations, from 5:00 on 31 December to midnight on 1 January",
        },
        url: U.tmbNewYear2025,
      },
      // "La xarxa de metro funcionarà avui, dilluns 5 de gener, fins a les 2 de la matinada" (5 Jan 2026).
      reisEve: {
        year: 2026,
        short: { ca: "fins a les 2:00, reforçat des de les 17:00", es: "hasta las 2:00, reforzado desde las 17:00", en: "until 2:00, extra trains from 17:00" },
        text: {
          ca: `el dia de la cavalcada va funcionar fins a les ${TRANSPORT_2026.metroUntil}, per ser vigília de festiu, amb més trens a partir de les ${TRANSPORT_2026.reinforcedFrom}`,
          es: `el día de la cabalgata funcionó hasta las ${TRANSPORT_2026.metroUntil}, por ser víspera de festivo, con más trenes a partir de las ${TRANSPORT_2026.reinforcedFrom}`,
          en: `on the day of the parade it ran until ${TRANSPORT_2026.metroUntil}, as the eve of a holiday, with extra trains from ${TRANSPORT_2026.reinforcedFrom}`,
        },
        url: U.tmbReis2026,
      },
      // "Dimarts 6 de gener, dia de Reis, els últims combois de metro sortiran a la mitjanit." (23 Dec 2025)
      reis: {
        year: 2026,
        short: { ca: "últims trens a mitjanit", es: "últimos trenes a medianoche", en: "last trains at midnight" },
        text: { ca: "el dia de Reis, els últims trens van sortir a mitjanit", es: "el día de Reyes, los últimos trenes salieron a medianoche", en: "on Three Kings' Day the last trains left at midnight" },
        url: U.tmbChristmas2025,
      },
    },
  },
  {
    key: "tmbBus",
    name: { ca: "Bus de TMB", es: "Bus de TMB", en: "TMB buses" },
    hosts: /(^|\.)(tmb\.cat|barcelona\.cat)$/,
    watch: U.tmbNews,
    notices: [
      { name: "Horaris especials del metro i els autobusos de TMB la vigília de Nadal (23/12/2025)", url: U.tmbChristmas2025, published: PAST.tmbChristmas2025.published, publisher: "Ajuntament de Barcelona / TMB" },
      { name: "Infografia: horaris de TMB per Nadal 2025-26", url: U.tmbInfographic2025, published: PAST.tmbChristmas2025.published, publisher: "TMB" },
    ],
    days: {
      // "els autobusos de Transports Metropolitans de Barcelona (TMB) faran l'última sortida des de les parades d'origen a les 22 hores" (23 Dec 2025).
      christmasEve: {
        year: 2025,
        short: { ca: "últimes sortides a les 22:00", es: "últimas salidas a las 22:00", en: "last departures at 22:00" },
        text: { ca: "els autobusos van fer l'última sortida des de les parades d'origen a les 22:00", es: "los autobuses hicieron la última salida desde las paradas de origen a las 22:00", en: "the last buses left their starting stops at 22:00" },
        url: U.tmbChristmas2025,
      },
      // Infographic: "Servei habitual"; note: "Les línies del Barcelona Bus Turístic no prestaran servei les festivitats de Nadal i Any Nou."
      christmas: {
        year: 2025,
        short: { ca: "servei habitual", es: "servicio habitual", en: "usual service" },
        text: { ca: "TMB va anunciar servei habitual; el Barcelona Bus Turístic no va circular", es: "TMB anunció servicio habitual; el Barcelona Bus Turístic no circuló", en: "TMB announced its usual service; the Barcelona Bus Turístic did not run" },
        url: U.tmbInfographic2025,
      },
      santEsteve: {
        year: 2025,
        short: { ca: "servei habitual", es: "servicio habitual", en: "usual service" },
        text: { ca: "TMB va anunciar servei habitual", es: "TMB anunció servicio habitual", en: "TMB announced its usual service" },
        url: U.tmbInfographic2025,
      },
      // "hi hauran desviaments de bus a partir de les 19 hores a les línies 13, 23, 150, X3 i a la ruta vermella del Barcelona Bus Turístic, afectacions que s'ampliaran a partir de les 20 hores a les línies D20, H12, H16, 46, 65. 91, 109 i X2." (30 Dec 2025)
      newYearsEve: {
        year: 2025,
        short: { ca: "desviaments a la plaça d'Espanya des de les 19:00", es: "desvíos en la plaza de España desde las 19:00", en: "diversions around Plaça d'Espanya from 19:00" },
        text: {
          ca: "servei habitual, però amb desviaments per la festa de Montjuïc: des de les 19:00, les línies 13, 23, 150 i X3 i la ruta vermella del Bus Turístic, i des de les 20:00, també la D20, H12, H16, 46, 65, 91, 109 i X2",
          es: "servicio habitual, pero con desvíos por la fiesta de Montjuïc: desde las 19:00, las líneas 13, 23, 150 y X3 y la ruta roja del Bus Turístic, y desde las 20:00, también la D20, H12, H16, 46, 65, 91, 109 y X2",
          en: "usual service, but with diversions for the Montjuïc show: from 19:00, lines 13, 23, 150 and X3 and the Bus Turístic red route, and from 20:00 also D20, H12, H16, 46, 65, 91, 109 and X2",
        },
        url: U.tmbNewYear2025,
      },
      newYear: {
        year: 2026,
        short: { ca: "servei habitual; sense Bus Turístic", es: "servicio habitual; sin Bus Turístic", en: "usual service; no Bus Turístic" },
        text: { ca: "TMB va anunciar servei habitual; el Barcelona Bus Turístic no va circular", es: "TMB anunció servicio habitual; el Barcelona Bus Turístic no circuló", en: "TMB announced its usual service; the Barcelona Bus Turístic did not run" },
        url: U.tmbInfographic2025,
      },
      // "afectacions en el recorregut de la gran majoria de línies d'autobús, que seran limitades o desviades entre les 16 i les 21.30 hores, aproximadament." (5 Jan 2026)
      reisEve: {
        year: 2026,
        short: { ca: "línies limitades o desviades de 16:00 a 21:30", es: "líneas limitadas o desviadas de 16:00 a 21:30", en: "lines cut short or diverted 16:00-21:30" },
        text: {
          ca: `per la cavalcada, la gran majoria de línies van anar limitades o desviades entre les ${TRANSPORT_2026.busFrom} i les ${TRANSPORT_2026.busTo}, aproximadament`,
          es: `por la cabalgata, la gran mayoría de líneas fueron limitadas o desviadas entre las ${TRANSPORT_2026.busFrom} y las ${TRANSPORT_2026.busTo}, aproximadamente`,
          en: `because of the parade, most lines were cut short or diverted between about ${TRANSPORT_2026.busFrom} and ${TRANSPORT_2026.busTo}`,
        },
        url: U.tmbReis2026,
      },
      reis: {
        year: 2026,
        short: { ca: "servei habitual", es: "servicio habitual", en: "usual service" },
        text: { ca: "TMB va anunciar servei habitual", es: "TMB anunció servicio habitual", en: "TMB announced its usual service" },
        url: U.tmbInfographic2025,
      },
    },
  },
  {
    key: "nitbus",
    name: { ca: "NitBus", es: "NitBus", en: "NitBus (night buses)" },
    hosts: /(^|\.)(atm\.cat|amb\.cat|ambmobilitat\.cat)$/,
    watch: U.atmPress,
    notices: [{ name: "Horaris del transport públic per Nadal 2025 (5/12/2025)", url: U.atm2025, published: "2025-12-05", publisher: "ATM Àrea de Barcelona" }],
    days: {
      // "El Nitbus de l'AMB ... oferirà el seu servei habitual, amb una freqüència de pas de 20 minuts en totes les línies durant tota la nit. Actualment té 23 línies, que circulen de 22.30 h a 6 h." (ATM, 5 Dec 2025)
      christmasEve: {
        year: 2025,
        short: { ca: "servei habitual, cada 20 minuts", es: "servicio habitual, cada 20 minutos", en: "usual service, every 20 minutes" },
        text: { ca: "va fer el servei habitual, cada 20 minuts a totes les línies durant tota la nit (23 línies, de 22:30 a 6:00)", es: "hizo el servicio habitual, cada 20 minutos en todas las líneas durante toda la noche (23 líneas, de 22:30 a 6:00)", en: "ran its usual service, every 20 minutes on every line all night (23 lines, 22:30 to 6:00)" },
        url: U.atm2025,
      },
      // "El Nitbus de l'AMB també oferirà el seu servei habitual, amb una freqüència de pas de 20 minuts en totes les línies durant tota la nit." (ATM, 5 Dec 2025)
      newYearsEve: {
        year: 2025,
        short: { ca: "servei habitual, cada 20 minuts", es: "servicio habitual, cada 20 minutos", en: "usual service, every 20 minutes" },
        text: { ca: "va fer el servei habitual, cada 20 minuts a totes les línies durant tota la nit", es: "hizo el servicio habitual, cada 20 minutos en todas las líneas durante toda la noche", en: "ran its usual service, every 20 minutes on every line all night" },
        url: U.atm2025,
      },
    },
  },
  {
    key: "rodalies",
    name: { ca: "Rodalies", es: "Rodalies", en: "Rodalies (commuter trains)" },
    hosts: /(^|\.)(rodalies\.gencat\.cat|renfe\.com)$/,
    watch: U.rodaliesNews,
    notices: [{ name: "Horaris de Rodalies per Nadal (16/12/2025)", url: U.rodalies2025, published: "2025-12-16", publisher: "Rodalies de Catalunya" }],
    days: {
      // "El 24 de desembre el servei ferroviari es redueix a totes les línies, finalitzant aproximadament a les 23 h, mentre que el dia de Nadal el servei s'inicia al voltant de les 7 h del matí." (16 Dec 2025)
      christmasEve: {
        year: 2025,
        short: { ca: "servei reduït fins a les 23:00 aprox.", es: "servicio reducido hasta las 23:00 aprox.", en: "reduced service until about 23:00" },
        text: { ca: "el servei es va reduir a totes les línies i va acabar cap a les 23:00; les línies R1, R2, R3, R4, R8, R11 i R15 van tenir horaris especials", es: "el servicio se redujo en todas las líneas y terminó hacia las 23:00; las líneas R1, R2, R3, R4, R8, R11 y R15 tuvieron horarios especiales", en: "service was reduced on every line and ended at about 23:00; lines R1, R2, R3, R4, R8, R11 and R15 ran special timetables" },
        url: U.rodalies2025,
      },
      christmas: {
        year: 2025,
        short: { ca: "primers trens cap a les 7:00", es: "primeros trenes hacia las 7:00", en: "first trains at about 7:00" },
        text: { ca: "el servei va començar cap a les 7:00 del matí", es: "el servicio empezó hacia las 7:00 de la mañana", en: "service started at about 7:00 in the morning" },
        url: U.rodalies2025,
      },
      // "El día 26 de desembre 1 i 6 de gener els horaris seran de dia festiu." (16 Dec 2025)
      santEsteve: {
        year: 2025,
        short: { ca: "horari de festiu", es: "horario de festivo", en: "holiday timetable" },
        text: { ca: "va circular amb horari de dia festiu", es: "circuló con horario de día festivo", en: "it ran its holiday timetable" },
        url: U.rodalies2025,
      },
      newYear: {
        year: 2026,
        short: { ca: "horari de festiu", es: "horario de festivo", en: "holiday timetable" },
        text: { ca: "va circular amb horari de dia festiu", es: "circuló con horario de día festivo", en: "it ran its holiday timetable" },
        url: U.rodalies2025,
      },
      reis: {
        year: 2026,
        short: { ca: "horari de festiu", es: "horario de festivo", en: "holiday timetable" },
        text: { ca: "va circular amb horari de dia festiu", es: "circuló con horario de día festivo", en: "it ran its holiday timetable" },
        url: U.rodalies2025,
      },
    },
  },
  {
    key: "fgc",
    name: { ca: "FGC", es: "FGC", en: "FGC trains" },
    hosts: /(^|\.)(fgc\.cat|govern\.cat|gencat\.cat|atm\.cat|barcelona\.cat)$/,
    watch: U.fgcPress,
    notices: [{ name: "Ferrocarrils adapta el servei a les festes de Nadal i de Cap d'Any (18/12/2025)", url: U.fgc2025, published: "2025-12-18", publisher: "Govern de la Generalitat / FGC" }],
    days: {
      // "el dimecres 24 de desembre, vigília de Nadal, el servei de trens finalitzarà a les 23 h a totes les línies." (18 Dec 2025)
      christmasEve: {
        year: 2025,
        short: { ca: "fins a les 23:00", es: "hasta las 23:00", en: "until 23:00" },
        text: { ca: "el servei va acabar a les 23:00 a totes les línies", es: "el servicio terminó a las 23:00 en todas las líneas", en: "service ended at 23:00 on every line" },
        url: U.fgc2025,
      },
      // "Els dies de Nadal i Sant Esteve els trens circularan fins a les 2 h." (18 Dec 2025)
      christmas: {
        year: 2025,
        short: { ca: "fins a les 2:00", es: "hasta las 2:00", en: "until 2:00" },
        text: { ca: "els trens van circular fins a les 2:00", es: "los trenes circularon hasta las 2:00", en: "trains ran until 2:00" },
        url: U.fgc2025,
      },
      santEsteve: {
        year: 2025,
        short: { ca: "fins a les 2:00", es: "hasta las 2:00", en: "until 2:00" },
        text: { ca: "els trens van circular fins a les 2:00 (el 2024, per Sant Esteve, fins a mitjanit)", es: "los trenes circularon hasta las 2:00 (en 2024, por San Esteban, hasta medianoche)", en: "trains ran until 2:00 (on Sant Esteve 2024, until midnight)" },
        url: U.fgc2025,
      },
      // "Com és habitual, FGC oferirà servei ininterromput la nit de Cap d'Any." L6, L12, L7 every 20 min; S1, S2 every 45; Funicular de Vallvidrera every 10; L8 every 20. (18 Dec 2025)
      newYearsEve: {
        year: 2025,
        short: { ca: "tota la nit a S1, S2, L6, L7, L12 i L8", es: "toda la noche en S1, S2, L6, L7, L12 y L8", en: "all night on S1, S2, L6, L7, L12 and L8" },
        text: {
          ca: "va circular tota la nit, com és habitual, per la zona urbana de Barcelona i fins a Sabadell i Terrassa: L6, L7 i L12 cada 20 minuts, S1 i S2 cada 45 minuts, L8 cada 20 minuts i el Funicular de Vallvidrera cada 10 minuts",
          es: "circuló toda la noche, como es habitual, por la zona urbana de Barcelona y hasta Sabadell y Terrassa: L6, L7 y L12 cada 20 minutos, S1 y S2 cada 45 minutos, L8 cada 20 minutos y el Funicular de Vallvidrera cada 10 minutos",
          en: "it ran all night, as usual, in Barcelona and out to Sabadell and Terrassa: L6, L7 and L12 every 20 minutes, S1 and S2 every 45 minutes, L8 every 20 minutes and the Vallvidrera funicular every 10 minutes",
        },
        url: U.fgc2025,
      },
      // Barcelona's Christmas site (updated 21 Nov 2025): "La nit de Reis Tots els transports (bus, metro, TRAM i FGC) seguiran els seus horaris habituals de vigília de festiu."
      reisEve: {
        year: 2026,
        short: { ca: "horari de vigília de festiu", es: "horario de víspera de festivo", en: "eve-of-holiday timetable" },
        text: { ca: "va seguir l'horari habitual de vigília de festiu, segons l'Ajuntament de Barcelona", es: "siguió el horario habitual de víspera de festivo, según el Ayuntamiento de Barcelona", en: "it kept its usual eve-of-holiday timetable, according to Barcelona City Council" },
        url: U.bcnChristmasTransport,
      },
    },
  },
  {
    key: "tram",
    name: { ca: "TRAM", es: "TRAM (tranvía)", en: "TRAM (tram)" },
    hosts: /(^|\.)(tram\.cat|atm\.cat|barcelona\.cat)$/,
    watch: U.tramFaq,
    notices: [{ name: "Horaris del transport públic per Nadal 2025 (5/12/2025)", url: U.atm2025, published: "2025-12-05", publisher: "ATM Àrea de Barcelona" }],
    days: {
      // "Tramvia i els busos de TMB, per la seva banda, faran les darreres sortides a les 22 hores." (ATM, 5 Dec 2025)
      christmasEve: {
        year: 2025,
        short: { ca: "darreres sortides a les 22:00", es: "últimas salidas a las 22:00", en: "last departures at 22:00" },
        text: { ca: "va fer les darreres sortides a les 22:00", es: "hizo las últimas salidas a las 22:00", en: "the last trams left at 22:00" },
        url: U.atm2025,
      },
      // "Els dies de Nadal i Sant Esteve, tant les línies del metro de Barcelona com els trens d'FGC i de TRAM circularan fins a les 2h de la matinada." (ATM, 5 Dec 2025)
      christmas: {
        year: 2025,
        short: { ca: "fins a les 2:00", es: "hasta las 2:00", en: "until 2:00" },
        text: { ca: "va circular fins a les 2:00", es: "circuló hasta las 2:00", en: "it ran until 2:00" },
        url: U.atm2025,
      },
      santEsteve: {
        year: 2025,
        short: { ca: "fins a les 2:00", es: "hasta las 2:00", en: "until 2:00" },
        text: { ca: "va circular fins a les 2:00", es: "circuló hasta las 2:00", en: "it ran until 2:00" },
        url: U.atm2025,
      },
      // "La nit del 31 de desembre a l'1 de gener, tant el metro de Barcelona com les línies d'FGC i de TRAM Barcelona oferiran servei ininterromput." (ATM, 5 Dec 2025)
      newYearsEve: {
        year: 2025,
        short: { ca: "tota la nit", es: "toda la noche", en: "all night" },
        text: { ca: "va circular tota la nit", es: "circuló toda la noche", en: "it ran all night" },
        url: U.atm2025,
      },
      reisEve: {
        year: 2026,
        short: { ca: "horari de vigília de festiu", es: "horario de víspera de festivo", en: "eve-of-holiday timetable" },
        text: { ca: "va seguir l'horari habitual de vigília de festiu, segons l'Ajuntament de Barcelona", es: "siguió el horario habitual de víspera de festivo, según el Ayuntamiento de Barcelona", en: "it kept its usual eve-of-holiday timetable, according to Barcelona City Council" },
        url: U.bcnChristmasTransport,
      },
    },
  },
];

export function operatorByKey(key: OperatorKey): Operator {
  const op = OPERATORS.find((o) => o.key === key);
  if (!op) throw new Error(`christmas-transport: no operator ${key}`);
  return op;
}

/* -------------------------------------------------------------------------- */
/* Standing timetables, applied to the 2026-27 days                           */
/* -------------------------------------------------------------------------- */

const ALL_NIGHT_TRAM = new Set(["06-23", "09-23", "12-31"]);

/**
 * The tram's standing timetable (tram.cat FAQ, last updated 30 Sep 2024):
 * Monday-Thursday, Sundays and holidays 5:00-24:00; Fridays, Saturdays and
 * the eves of holidays 5:00-2:00; the eves of 1 January, 24 June and
 * 24 September all night; 24 December 5:00-22:30.
 */
export function tramDay(iso: string): { opensAtFive: boolean; close: "midnight" | "two" | "allNight" | "tenThirty" } {
  const closeOn = (day: string): "midnight" | "two" | "allNight" | "tenThirty" => {
    const md = day.slice(5, 10);
    if (ALL_NIGHT_TRAM.has(md)) return "allNight";
    if (md === "12-24") return "tenThirty";
    const weekday = weekdayIndex(day);
    if (weekday === 5 || weekday === 6 || holidayOn(addDays(day, 1))) return "two";
    return "midnight";
  };
  return { opensAtFive: closeOn(addDays(iso, -1)) !== "allNight", close: closeOn(iso) };
}

const METRO_CLOSE: Record<Locale, Record<"midnight" | "two" | "allNight" | "eleven" | "tenThirty", string>> = {
  ca: { midnight: "tanca a mitjanit", two: "tanca a les 2:00", allNight: "no tanca en tota la nit", eleven: "tanca a les 23:00", tenThirty: "tanca a les 22:30" },
  es: { midnight: "cierra a medianoche", two: "cierra a las 2:00", allNight: "no cierra en toda la noche", eleven: "cierra a las 23:00", tenThirty: "cierra a las 22:30" },
  en: { midnight: "closes at midnight", two: "closes at 2:00", allNight: "runs all night", eleven: "closes at 23:00", tenThirty: "closes at 22:30" },
};

const OPENS: Record<Locale, { five: string; on: string }> = {
  ca: { five: "obre a les 5:00", on: "funciona sense parar des de la nit anterior" },
  es: { five: "abre a las 5:00", on: "funciona sin parar desde la noche anterior" },
  en: { five: "opens at 5:00", on: "runs on from the night before" },
};

/** "obre a les 5:00 i tanca a les 23:00" for the metro on a 2026-27 day, from TMB's standing rules. */
export function metroLine(iso: string, locale: Locale): string {
  const day = metroDay(iso);
  const and = { ca: "i", es: "y", en: "and" }[locale];
  return `${day.opensAtFive ? OPENS[locale].five : OPENS[locale].on} ${and} ${METRO_CLOSE[locale][day.close]}`;
}

/** The same for the tram, from its standing rules. */
export function tramLine(iso: string, locale: Locale): string {
  const day = tramDay(iso);
  const and = { ca: "i", es: "y", en: "and" }[locale];
  return `${day.opensAtFive ? OPENS[locale].five : OPENS[locale].on} ${and} ${METRO_CLOSE[locale][day.close]}`;
}

/** Short metro hours for the key facts: "5:00-23:00", "tota la nit", "fins a les 2:00". */
function metroShort(iso: string, locale: Locale): string {
  const day = metroDay(iso);
  const close = { ca: { midnight: "fins a mitjanit", two: "fins a les 2:00", allNight: "tota la nit", eleven: "fins a les 23:00" }, es: { midnight: "hasta medianoche", two: "hasta las 2:00", allNight: "toda la noche", eleven: "hasta las 23:00" }, en: { midnight: "until midnight", two: "until 2:00", allNight: "all night", eleven: "until 23:00" } }[locale][day.close];
  return close;
}

/* -------------------------------------------------------------------------- */
/* Validation and freshness                                                   */
/* -------------------------------------------------------------------------- */

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validIso = (value: string) => ISO.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;

function urlProblems(href: string, hosts: RegExp, who: string): string[] {
  try {
    const url = new URL(href);
    const out: string[] = [];
    if (url.protocol !== "https:") out.push(`${href} is not https`);
    if (!hosts.test(url.host)) out.push(`${who}: ${url.host} is not the operator's own site`);
    if (/[?&]utm_/.test(href)) out.push(`${href} carries tracking`);
    if (/aerobusbcn\.com/.test(url.host)) out.push(`${href}: never link aerobusbcn.com`);
    return out;
  } catch {
    return [`${who}: ${href} is not a URL`];
  }
}

/** Why an operator's row cannot be printed, or nothing when it can. */
export function operatorProblems(op: Operator): string[] {
  const problems: string[] = [...urlProblems(op.watch, op.hosts, `${op.key} watch`)];
  for (const notice of op.notices) {
    problems.push(...urlProblems(notice.url, op.hosts, `${op.key} notice`));
    if (!validIso(notice.published)) problems.push(`${op.key}: notice date ${notice.published}`);
    else if (notice.published < "2025-11-01" || notice.published > "2026-01-31") problems.push(`${op.key}: notice of ${notice.published} is not last season's`);
  }
  for (const [day, fact] of Object.entries(op.days) as [DayKey, DayFact][]) {
    problems.push(...urlProblems(fact.url, op.hosts, `${op.key} ${day}`));
    const expected = DAYS[day] < "2027-01-01" ? 2025 : 2026;
    if (fact.year !== expected) problems.push(`${op.key} ${day}: year ${fact.year}, expected ${expected}`);
    for (const locale of ["ca", "es", "en"] as Locale[]) {
      if (!fact.text[locale].trim() || !fact.short[locale].trim()) problems.push(`${op.key} ${day}: empty ${locale} text`);
      if (/\b2026-27\b|\b2027\b/.test(fact.text[locale])) problems.push(`${op.key} ${day}: last season's line names this season`);
    }
  }
  return problems;
}

/** Why a filled 2026-27 slot cannot be printed. */
export function announcedProblems(slot: Announced, op: Operator): string[] {
  const problems = urlProblems(slot.url, op.hosts, `${op.key} 2026-27`);
  if (!validIso(slot.read)) problems.push(`${op.key} 2026-27: read ${slot.read} is not an ISO date`);
  else if (slot.read < FIRST_CHECKED) problems.push(`${op.key} 2026-27: read ${slot.read} is before this page first checked`);
  else if (slot.read > TRANSPORT_NADAL_AS_OF) problems.push(`${op.key} 2026-27: read ${slot.read} is after TRANSPORT_NADAL_AS_OF`);
  if (!Object.keys(slot.days).length) problems.push(`${op.key} 2026-27: no day filled`);
  return problems;
}

/** True once `today` is on or after the re-read day while the page was last read before it. */
export function needsReread(today: string, asOf: string = TRANSPORT_NADAL_AS_OF): boolean {
  return today >= TRANSPORT_NADAL_REREAD_BY && asOf < TRANSPORT_NADAL_REREAD_BY;
}

/* -------------------------------------------------------------------------- */
/* Wording                                                                    */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const AS_OF: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(TRANSPORT_NADAL_AS_OF, "ca")}`,
  es: `comprobado el ${dateYear(TRANSPORT_NADAL_AS_OF, "es")}`,
  en: `checked on ${dateYear(TRANSPORT_NADAL_AS_OF, "en")}`,
};

const PENDING: Record<Locale, string> = { ca: "per confirmar", es: "por confirmar", en: "to be confirmed" };

const SOURCE: Record<Locale, string> = { ca: "font", es: "fuente", en: "source" };

/** "**Rodalies** (2025, per confirmar): el servei ... ([font](url))." or the 2026-27 line once out. */
function operatorLine(op: Operator, day: DayKey, locale: Locale, announced: Record<OperatorKey, Announced | null>): string | null {
  const slot = announced[op.key];
  const now = slot?.days[day];
  if (slot && now) {
    return `**${op.name[locale]}** (2026-27): ${now[locale]} ([${SOURCE[locale]}](${slot.url}))`;
  }
  const fact = op.days[day];
  if (!fact) return null;
  return `**${op.name[locale]}** (${fact.year}, ${PENDING[locale]}): ${fact.text[locale]} ([${SOURCE[locale]}](${fact.url})).`;
}

const STANDING: Record<Locale, { metro: string; tram: string }> = {
  ca: { metro: "Metro, horari general de TMB per al 2026-27", tram: "TRAM, horari general per al 2026-27" },
  es: { metro: "Metro, horario general de TMB para 2026-27", tram: "TRAM, horario general para 2026-27" },
  en: { metro: "Metro, TMB's standing timetable for 2026-27", tram: "TRAM, standing timetable for 2026-27" },
};

/** The list of what runs on one day: metro and tram from the standing rules, the rest from last season (or this season's notice). */
export function dayItems(day: DayKey, locale: Locale, announced: Record<OperatorKey, Announced | null> = ANNOUNCED_2026_27): string[] {
  const iso = DAYS[day];
  const items: string[] = [];
  const metroSlot = announced.metro?.days[day];
  items.push(
    metroSlot
      ? `**${operatorByKey("metro").name[locale]}** (2026-27): ${metroSlot[locale]} ([${SOURCE[locale]}](${announced.metro!.url}))`
      : `**${STANDING[locale].metro}:** ${metroLine(iso, locale)}.`,
  );
  const metroLast = operatorByKey("metro").days[day];
  if (metroLast && !metroSlot) {
    items.push(`**${operatorByKey("metro").name[locale]}** (${metroLast.year}): ${metroLast.text[locale]} ([${SOURCE[locale]}](${metroLast.url})).`);
  }
  for (const key of ["tmbBus", "nitbus", "rodalies", "fgc"] as const) {
    const line = operatorLine(operatorByKey(key), day, locale, announced);
    if (line) items.push(line);
  }
  const tramSlot = announced.tram?.days[day];
  if (tramSlot) items.push(`**${operatorByKey("tram").name[locale]}** (2026-27): ${tramSlot[locale]} ([${SOURCE[locale]}](${announced.tram!.url}))`);
  else {
    items.push(`**${STANDING[locale].tram}:** ${tramLine(iso, locale)}.`);
    const tramLast = operatorLine(operatorByKey("tram"), day, locale, { ...announced, tram: null });
    if (tramLast) items.push(tramLast);
  }
  return items;
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

export const TRANSPORT_NADAL_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/transport-nadal-cap-d-any-barcelona",
    title: "Transport per Nadal i Cap d'Any 2026-27: metro, bus, Rodalies, FGC i tram",
    seoTitle: "Horaris metro, bus i Rodalies per Nadal i Cap d'Any 2026",
    seoDescription: "Nit de Nadal: metro fins a les 23:00; Rodalies i FGC, fins a les 23:00 (2025). Cap d'Any: metro, FGC i tram tota la nit. Dia a dia, del 24/12 al 6/1.",
    excerpt: "Metro, bus, NitBus, Rodalies, FGC i tram el 24, 25, 26 i 31 de desembre i l'1 i el 6 de gener: horari del 2026-27 o, si encara no s'ha publicat, el del Nadal passat.",
  },
  es: {
    path: "guias/transporte-navidad-nochevieja-barcelona",
    title: "Transporte en Navidad y Nochevieja 2026-27: metro, bus, Rodalies, FGC y tranvía",
    seoTitle: "Horarios metro, bus y Rodalies en Navidad y Nochevieja 2026",
    seoDescription: "Nochebuena: metro hasta las 23:00; Rodalies y FGC, hasta las 23:00 (2025). Nochevieja: metro, FGC y tranvía toda la noche. Día a día, del 24/12 al 6/1.",
    excerpt: "Metro, bus, NitBus, Rodalies, FGC y tranvía el 24, 25, 26 y 31 de diciembre y el 1 y el 6 de enero: horario de 2026-27 o, si aún no se ha publicado, el de la Navidad pasada.",
  },
  en: {
    path: "guides/barcelona-public-transport-christmas-new-year",
    title: "Barcelona public transport at Christmas and New Year 2026-27: metro, bus, trains, tram",
    seoTitle: "Barcelona metro and train hours: Christmas & New Year 2026",
    seoDescription: "Christmas Eve: metro until 23:00, Rodalies and FGC until about 23:00 (2025). New Year's Eve: metro, FGC and tram all night. Day by day, 24 Dec to 6 Jan.",
    excerpt: "Metro, buses, NitBus, Rodalies, FGC and tram on 24, 25, 26 and 31 December and 1 and 6 January: the 2026-27 hours or, until they are out, last Christmas's.",
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const DAY_NAME: Record<DayKey, Record<Locale, string>> = {
  christmasEve: { ca: "Nit de Nadal", es: "Nochebuena", en: "Christmas Eve" },
  christmas: { ca: "Nadal", es: "Navidad", en: "Christmas Day" },
  santEsteve: { ca: "Sant Esteve", es: "San Esteban", en: "Sant Esteve (Boxing Day)" },
  newYearsEve: { ca: "Cap d'Any", es: "Nochevieja", en: "New Year's Eve" },
  newYear: { ca: "Any Nou", es: "Año Nuevo", en: "New Year's Day" },
  reisEve: { ca: "Nit de Reis i cavalcada", es: "Noche de Reyes y cabalgata", en: "Three Kings' Eve and parade" },
  reis: { ca: "Reis", es: "Reyes", en: "Three Kings' Day" },
};

function dayHeading(day: DayKey, locale: Locale): string {
  return `${DAY_NAME[day][locale]}: ${dayDate(DAYS[day], locale, false)}`;
}

/** What else to say under a day, after the list (links to the pages about that day). */
function dayExtra(day: DayKey, locale: Locale): string[] {
  const L = <T,>(v: Record<Locale, T>) => v[locale];
  if (day === "newYearsEve") {
    return [
      L({
        ca: `El metro no tanca la nit del 31 de desembre: ho diu l'horari general de TMB, i ho va fer el 2024 i el 2025. Les estacions properes a la festa de la ciutat, els accessos i el que se sap del 2026, a ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}.`,
        es: `El metro no cierra la noche del 31 de diciembre: lo dice el horario general de TMB, y así fue en 2024 y 2025. Las estaciones cercanas a la fiesta de la ciudad, los accesos y lo que se sabe de 2026, en ${b2link("newYear", "es", "Nochevieja en Barcelona")}.`,
        en: `The metro does not close on the night of 31 December: TMB's standing timetable says so, and it ran all night in 2024 and 2025. The stations nearest the city's celebration, the entry points and what is known about 2026 are in ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
      }),
    ];
  }
  if (day === "reisEve") {
    return [
      L({
        ca: `L'hora i el recorregut de la cavalcada de Barcelona i de ${allTowns().length} ciutats més, a ${b2link("reis", "ca", "la Cavalcada de Reis 2027")}.`,
        es: `La hora y el recorrido de la cabalgata de Barcelona y de ${allTowns().length} ciudades más, en ${b2link("reis", "es", "la Cabalgata de Reyes 2027")}.`,
        en: `The time and route of the Barcelona parade and ${allTowns().length} other towns' are in ${b2link("reis", "en", "the 2027 Three Kings parade guide")}.`,
      }),
    ];
  }
  return [];
}

function noticeRows(locale: Locale): string[][] {
  const where: Record<OperatorKey, Record<Locale, string>> = {
    metro: { ca: "Sala de premsa de TMB", es: "Sala de prensa de TMB", en: "TMB press room" },
    tmbBus: { ca: "Sala de premsa de TMB", es: "Sala de prensa de TMB", en: "TMB press room" },
    nitbus: { ca: "Notes de premsa de l'ATM", es: "Notas de prensa de la ATM", en: "ATM press releases" },
    rodalies: { ca: "Actualitat de Rodalies", es: "Actualidad de Rodalies", en: "Rodalies news" },
    fgc: { ca: "Sala de premsa del Govern (Ferrocarrils)", es: "Sala de prensa del Govern (Ferrocarrils)", en: "Generalitat press room (Ferrocarrils)" },
    tram: { ca: "Preguntes freqüents de TRAM i nota de l'ATM", es: "Preguntas frecuentes de TRAM y nota de la ATM", en: "TRAM FAQ and the ATM note" },
  };
  return OPERATORS.filter((op) => op.key !== "metro").map((op) => {
    const last = op.notices.map((n) => dateYear(n.published, locale)).filter((v, i, a) => a.indexOf(v) === i).join("; ");
    const status = ANNOUNCED_2026_27[op.key] ? { ca: "Publicat", es: "Publicado", en: "Published" }[locale] : cap(PENDING[locale]);
    return [op.name[locale], last, where[op.key][locale], status];
  });
}

const RELATED: B2Key[] = ["hours", "newYear", "reis", "christmasBarcelona", "transport", "barcelonaDecember", "strikes"];

export function buildTransportBody(locale: Locale, announced: Record<OperatorKey, Announced | null> = ANNOUNCED_2026_27): Block[] {
  const L = <T,>(v: Record<Locale, T>) => v[locale];
  const anyOut = (Object.values(announced) as (Announced | null)[]).some(Boolean);
  const eve = dayDate(DAYS.christmasEve, locale, false);
  const nye = dayDate(DAYS.newYearsEve, locale, false);
  const fgc = operatorByKey("fgc");
  const rod = operatorByKey("rodalies");

  const leadText = L({
    ca: `**Per Nadal i Cap d'Any 2026-27, el metro de Barcelona tanca a les 23:00 la Nit de Nadal (${eve}) i no tanca en tota la nit de Cap d'Any (${nye}), segons l'horari general de TMB.** ${anyOut ? `Alguns operadors ja han publicat els horaris d'aquest any (marcats amb 2026-27); per als altres, el del Nadal passat, amb l'any i ${PENDING.ca}.` : `Cap operador no ha publicat encara els horaris especials d'aquest any (${AS_OF.ca}): per al bus, el NitBus, Rodalies, FGC i el tram, aquí tens el que van fer el Nadal passat, amb l'any al costat i ${PENDING.ca}; els del 2026-27 els afegim el dia que surtin.`} El 2025, Rodalies i FGC van acabar el servei cap a les 23:00 la Nit de Nadal, i FGC i el tram van circular tota la nit de Cap d'Any.`,
    es: `**En Navidad y Nochevieja 2026-27, el metro de Barcelona cierra a las 23:00 en Nochebuena (${eve}) y no cierra en toda la noche de Fin de Año (${nye}), según el horario general de TMB.** ${anyOut ? `Algunos operadores ya han publicado los horarios de este año (marcados con 2026-27); para los demás, el de la Navidad pasada, con el año y ${PENDING.es}.` : `Ningún operador ha publicado aún los horarios especiales de este año (${AS_OF.es}): para el bus, el NitBus, Rodalies, FGC y el tranvía, aquí tienes lo que hicieron la Navidad pasada, con el año al lado y ${PENDING.es}; los de 2026-27 los añadimos el día que salgan.`} En 2025, Rodalies y FGC terminaron el servicio hacia las 23:00 en Nochebuena, y FGC y el tranvía circularon toda la noche de Fin de Año.`,
    en: `**Over Christmas and New Year 2026-27, the Barcelona metro closes at 23:00 on Christmas Eve (${eve}) and runs all night on New Year's Eve (${nye}), according to TMB's standing timetable.** ${anyOut ? `Some operators have published this year's hours (marked 2026-27); for the others, last Christmas's, with the year and ${PENDING.en}.` : `No operator has published this year's special hours yet (${AS_OF.en}): for buses, the NitBus, Rodalies, FGC and the tram, here is what they did last Christmas, with the year next to it and ${PENDING.en}; the 2026-27 hours go in the day they come out.`} In 2025 Rodalies and FGC stopped at about 23:00 on Christmas Eve, and FGC and the tram ran all night on New Year's Eve.`,
  });

  const keyItems = (["christmasEve", "christmas", "santEsteve", "newYearsEve", "newYear", "reis"] as DayKey[]).map((day) => {
    const metro = metroShort(DAYS[day], locale);
    const extra = (["rodalies", "fgc"] as const)
      .map((key) => {
        const f = operatorByKey(key).days[day];
        return f ? `${operatorByKey(key).name[locale].split(" (")[0]} ${f.short[locale]} (${f.year})` : "";
      })
      .filter(Boolean);
    return {
      label: cap(`${DAY_NAME[day][locale]}, ${dayDate(DAYS[day], locale, false)}`),
      value: [`${L({ ca: "Metro", es: "Metro", en: "Metro" })} ${metro}`, ...extra].join("; "),
    };
  });

  const metroNote = L({
    ca: `Horari general de TMB (comprovat el ${dateYear(TRANSPORT_NADAL_AS_OF, "ca")}), aplicat als dies d'aquest any: mitjanit; les 2:00 els divendres i les vigílies de festiu; tota la nit els dissabtes i el 31 de desembre; les 23:00 el 24 de desembre. TMB confirma l'horari de Nadal al desembre (el 2025, el dia 23).`,
    es: `Horario general de TMB (comprobado el ${dateYear(TRANSPORT_NADAL_AS_OF, "es")}), aplicado a los días de este año: medianoche; las 2:00 los viernes y las vísperas de festivo; toda la noche los sábados y el 31 de diciembre; las 23:00 el 24 de diciembre. TMB confirma el horario de Navidad en diciembre (en 2025, el día 23).`,
    en: `TMB's standing timetable (checked ${dateYear(TRANSPORT_NADAL_AS_OF, "en")}) applied to this year's days: midnight; 2:00 on Fridays and nights before holidays; all night on Saturdays and 31 December; 23:00 on 24 December. TMB confirms its Christmas hours in December (on the 23rd in 2025).`,
  });

  const daySections: Block[] = [];
  const groups: { days: DayKey[]; heading: string }[] = [
    { days: ["christmasEve"], heading: dayHeading("christmasEve", locale) },
    { days: ["christmas", "santEsteve"], heading: L({ ca: `Nadal i Sant Esteve: ${dayDate(DAYS.christmas, "ca", false)} i ${dayDate(DAYS.santEsteve, "ca", false)}`, es: `Navidad y San Esteban: ${dayDate(DAYS.christmas, "es", false)} y ${dayDate(DAYS.santEsteve, "es", false)}`, en: `Christmas Day and Sant Esteve: ${dayDate(DAYS.christmas, "en", false)} and ${dayDate(DAYS.santEsteve, "en", false)}` }) },
    { days: ["newYearsEve"], heading: dayHeading("newYearsEve", locale) },
    { days: ["newYear"], heading: dayHeading("newYear", locale) },
    { days: ["reisEve", "reis"], heading: L({ ca: `Reis: ${dayDate(DAYS.reisEve, "ca", false)} i ${dayDate(DAYS.reis, "ca", false)}`, es: `Reyes: ${dayDate(DAYS.reisEve, "es", false)} y ${dayDate(DAYS.reis, "es", false)}`, en: `Three Kings: ${dayDate(DAYS.reisEve, "en", false)} and ${dayDate(DAYS.reis, "en", false)}` }) },
  ];
  for (const group of groups) {
    daySections.push({ type: "heading", level: 2, text: group.heading } as Block);
    for (const day of group.days) {
      const holiday = holidayOn(DAYS[day]);
      const kind = holiday
        ? L({ ca: `festiu a tot Catalunya (${holiday.name.ca})`, es: `festivo en toda Cataluña (${holiday.name.es})`, en: `public holiday across Catalonia (${holiday.name.en})` })
        : L({ ca: "dia feiner", es: "día laborable", en: "working day" });
      if (group.days.length > 1) daySections.push({ type: "heading", level: 3, text: cap(`${DAY_NAME[day][locale]}, ${dayDate(DAYS[day], locale, false)}`) } as Block);
      daySections.push(...paras(`${cap(kind)}.`));
      daySections.push(list(...dayItems(day, locale, announced)));
      daySections.push(...paras(...dayExtra(day, locale)));
    }
  }

  const noticeTable = table(
    L({ ca: "Quan van publicar els horaris de Nadal el 2025 i on sortiran els del 2026-27", es: "Cuándo publicaron los horarios de Navidad en 2025 y dónde saldrán los de 2026-27", en: "When the operators published their Christmas hours in 2025, and where 2026-27's will appear" }),
    L({ ca: ["Operador", "Avís del 2025", "On es publica", "2026-27"], es: ["Operador", "Aviso de 2025", "Dónde se publica", "2026-27"], en: ["Operator", "2025 notice", "Where it appears", "2026-27"] }),
    noticeRows(locale),
    L({ ca: `Comprovat el ${dateYear(TRANSPORT_NADAL_AS_OF, "ca")}.`, es: `Comprobado el ${dateYear(TRANSPORT_NADAL_AS_OF, "es")}.`, en: `Checked on ${dateYear(TRANSPORT_NADAL_AS_OF, "en")}.` }),
  );

  return [
    lead(leadText),
    keyFacts(L({ ca: "Metro i trens per Nadal i Cap d'Any, d'un cop d'ull", es: "Metro y trenes en Navidad y Nochevieja, de un vistazo", en: "Metro and trains over Christmas and New Year at a glance" }), keyItems),
    callout(
      "official",
      L({ ca: "Com tractem els horaris", es: "Cómo tratamos los horarios", en: "How we handle the hours" }),
      L({
        ca: "El metro i el tram tenen un horari general publicat que preveu el 24 i el 31 de desembre: l'apliquem als dies d'aquest any. Per a la resta, només donem un horari del 2026-27 quan l'ha publicat l'operador; fins aleshores, el del Nadal passat, sempre amb l'any i com a per confirmar. Cada operador pot canviar-lo amb poc avís: el mateix dia, mira'n els avisos.",
        es: "El metro y el tranvía tienen un horario general publicado que prevé el 24 y el 31 de diciembre: lo aplicamos a los días de este año. Para el resto, solo damos un horario de 2026-27 cuando lo ha publicado el operador; hasta entonces, el de la Navidad pasada, siempre con el año y como por confirmar. Cada operador puede cambiarlo con poco aviso: el mismo día, mira sus avisos.",
        en: "The metro and the tram publish a standing timetable that covers 24 and 31 December: we apply it to this year's days. For everything else we only give a 2026-27 time once the operator has published it; until then, last Christmas's, always with its year and marked to be confirmed. Any operator can change its hours at short notice: on the day, check its notices.",
      }),
    ),
    ...h2(
      L({ ca: "Horari del metro de Barcelona per Nadal, Cap d'Any i Reis 2026-27", es: "Horario del metro de Barcelona en Navidad, Nochevieja y Reyes 2026-27", en: "Barcelona metro hours over Christmas, New Year and Reis 2026-27" }),
      L({
        ca: `Aquest any el calendari canvia respecte del 2025: la Nit de Nadal i la de Cap d'Any cauen en dijous, Sant Esteve en dissabte (el metro no tanca la nit del dissabte) i l'1 de gener en divendres (tanca a les 2:00). La resta de dies, l'horari de cada nit és a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}.`,
        es: `Este año el calendario cambia respecto a 2025: Nochebuena y Nochevieja caen en jueves, San Esteban en sábado (el metro no cierra la noche del sábado) y el 1 de enero en viernes (cierra a las 2:00). El resto de días, el horario de cada noche está en ${b2link("hours", "es", "el horario del metro de Barcelona")}.`,
        en: `The calendar differs from 2025: Christmas Eve and New Year's Eve fall on Thursdays, Sant Esteve on a Saturday (the metro runs all Saturday night) and 1 January on a Friday (it closes at 2:00). For the rest of the year, each night's hours are in ${b2link("hours", "en", "Barcelona metro hours")}.`,
      }),
    ),
    table(
      L({ ca: "El metro de Barcelona per Nadal, Cap d'Any i Reis (2026-27)", es: "El metro de Barcelona en Navidad, Nochevieja y Reyes (2026-27)", en: "Barcelona metro over Christmas, New Year and Reis (2026-27)" }),
      L({ ca: ["Dia", "Tipus de dia", "Metro"], es: ["Día", "Tipo de día", "Metro"], en: ["Day", "Type of day", "Metro"] }),
      metroRows(locale, TRANSPORT_DAYS.map((d) => DAYS[d])),
      metroNote,
    ),
    ...daySections,
    ...trafficBlocks("christmas", locale),
    ...h2(
      L({ ca: "Quan es publiquen els horaris del 2026-27?", es: "¿Cuándo se publican los horarios de 2026-27?", en: "When do the 2026-27 hours come out?" }),
      L({
        ca: `Cada operador publica el seu avís entre finals de novembre i la vigília de Nadal. El 2025, l'ATM (la nota conjunta del NitBus, el tram i FGC) va sortir el ${dateYear("2025-12-05", "ca")}, Rodalies el ${dateYear(rod.notices[0]!.published, "ca")}, FGC el ${dateYear(fgc.notices[0]!.published, "ca")} i TMB el ${dateYear(PAST.tmbChristmas2025.published, "ca")} (i el ${dateYear("2025-12-30", "ca")} per a Cap d'Any). Revisem cada font i actualitzem aquesta pàgina el dia que surt.`,
        es: `Cada operador publica su aviso entre finales de noviembre y la víspera de Navidad. En 2025, la ATM (la nota conjunta del NitBus, el tranvía y FGC) salió el ${dateYear("2025-12-05", "es")}, Rodalies el ${dateYear(rod.notices[0]!.published, "es")}, FGC el ${dateYear(fgc.notices[0]!.published, "es")} y TMB el ${dateYear(PAST.tmbChristmas2025.published, "es")} (y el ${dateYear("2025-12-30", "es")} para Nochevieja). Revisamos cada fuente y actualizamos esta página el día que sale.`,
        en: `Each operator publishes its notice between late November and Christmas Eve. In 2025 the ATM (the joint note covering the NitBus, the tram and FGC) came out on ${dateYear("2025-12-05", "en")}, Rodalies on ${dateYear(rod.notices[0]!.published, "en")}, FGC on ${dateYear(fgc.notices[0]!.published, "en")} and TMB on ${dateYear(PAST.tmbChristmas2025.published, "en")} (and on ${dateYear("2025-12-30", "en")} for New Year's Eve). We check each source and update this page the day it comes out.`,
      }),
    ),
    noticeTable,
    ...paras(
      L({
        ca: "**Què no hi trobaràs.** Els horaris dels autobusos metropolitans de dia de l'AMB aquests dies (la nota de l'ATM del 2025 no els donava) i el que farà Rodalies la nit de Cap d'Any: el 2025 no va anunciar cap servei especial. Si hi ha vaga i serveis mínims, mira " + b2link("strikes", "ca", "què funciona els dies de vaga") + ".",
        es: "**Qué no encontrarás.** Los horarios de los autobuses metropolitanos de día del AMB estos días (la nota de la ATM de 2025 no los daba) y lo que hará Rodalies la noche de Fin de Año: en 2025 no anunció ningún servicio especial. Si hay huelga con servicios mínimos, mira " + b2link("strikes", "es", "qué funciona los días de huelga") + ".",
        en: "**What is not here.** AMB's daytime metropolitan bus hours on these days (the 2025 ATM note did not give them) and what Rodalies will run on New Year's Eve: in 2025 it announced no special service. If a strike brings minimum services, see " + b2link("strikes", "en", "what runs on strike days") + ".",
      }),
    ),
    faq([
      {
        question: L({ ca: "Fins a quina hora funciona el metro la Nit de Nadal?", es: "¿Hasta qué hora funciona el metro en Nochebuena?", en: "What time does the Barcelona metro close on Christmas Eve?" }),
        answer: L({
          ca: `Fins a les 23:00: és l'horari general de TMB per al 24 de desembre, que aquest any cau en ${eve.split(" ")[0]}. El 2025 els autobusos de TMB van fer l'última sortida a les 22:00.`,
          es: `Hasta las 23:00: es el horario general de TMB para el 24 de diciembre, que este año cae en ${eve.split(" ")[0]}. En 2025 los autobuses de TMB hicieron la última salida a las 22:00.`,
          en: `Until 23:00: that is TMB's standing timetable for 24 December, a ${eve.split(" ")[0]} this year. In 2025 TMB's last buses left at 22:00.`,
        }),
      },
      {
        question: L({ ca: "El metro de Barcelona funciona tota la nit de Cap d'Any?", es: "¿El metro de Barcelona funciona toda la noche en Nochevieja?", en: "Does the Barcelona metro run all night on New Year's Eve?" }),
        answer: L({
          ca: "Sí. L'horari general de TMB preveu servei continu la nit del 31 de desembre. El 2025 va funcionar 43 hores seguides, des de les 5:00 del 31 fins a la mitjanit de l'1 de gener; el 2026-27, l'1 de gener cau en divendres, i els divendres l'horari general arriba fins a les 2:00.",
          es: "Sí. El horario general de TMB prevé servicio continuo la noche del 31 de diciembre. En 2025 funcionó 43 horas seguidas, desde las 5:00 del 31 hasta la medianoche del 1 de enero; en 2026-27, el 1 de enero cae en viernes, y los viernes el horario general llega hasta las 2:00.",
          en: "Yes. TMB's standing timetable has continuous service on the night of 31 December. In 2025 it ran for 43 hours non-stop, from 5:00 on the 31st to midnight on 1 January; this time 1 January is a Friday, and on Fridays the standing timetable runs to 2:00.",
        }),
      },
      {
        question: L({ ca: "Quins trens d'FGC funcionen tota la nit de Cap d'Any?", es: "¿Qué trenes de FGC funcionan toda la noche de Fin de Año?", en: "Which FGC trains run all night on New Year's Eve?" }),
        answer: L({
          ca: `El 2025, les línies S1 (Terrassa), S2 (Sabadell), L6, L7, L12 i L8 i el Funicular de Vallvidrera; FGC diu que ho fa "com és habitual". Les freqüències són a la secció de Cap d'Any. El 2026-27, ${PENDING.ca}.`,
          es: `En 2025, las líneas S1 (Terrassa), S2 (Sabadell), L6, L7, L12 y L8 y el Funicular de Vallvidrera; FGC dice que lo hace "como es habitual". Las frecuencias están en la sección de Nochevieja. En 2026-27, ${PENDING.es}.`,
          en: `In 2025, lines S1 (Terrassa), S2 (Sabadell), L6, L7, L12 and L8 and the Vallvidrera funicular; FGC calls it its usual New Year's Eve service. The frequencies are in the New Year's Eve section. For 2026-27, ${PENDING.en}.`,
        }),
      },
      {
        question: L({ ca: "Hi ha Rodalies la Nit de Nadal i el dia de Nadal?", es: "¿Hay Rodalies en Nochebuena y el día de Navidad?", en: "Do Rodalies trains run on Christmas Eve and Christmas Day?" }),
        answer: L({
          ca: `El 24 de desembre de 2025 el servei es va reduir a totes les línies i va acabar cap a les 23:00, i el dia de Nadal va començar cap a les 7:00. El 26 de desembre i l'1 i el 6 de gener va circular amb horari de festiu. El 2026-27, ${PENDING.ca}.`,
          es: `El 24 de diciembre de 2025 el servicio se redujo en todas las líneas y terminó hacia las 23:00, y el día de Navidad empezó hacia las 7:00. El 26 de diciembre y el 1 y el 6 de enero circuló con horario de festivo. En 2026-27, ${PENDING.es}.`,
          en: `On 24 December 2025 service was reduced on every line and ended at about 23:00, and on Christmas Day it started at about 7:00. On 26 December and 1 and 6 January it ran its holiday timetable. For 2026-27, ${PENDING.en}.`,
        }),
      },
      {
        question: L({ ca: "Funciona el NitBus la Nit de Nadal i la de Cap d'Any?", es: "¿Funciona el NitBus en Nochebuena y Nochevieja?", en: "Does the NitBus run on Christmas Eve and New Year's Eve?" }),
        answer: L({
          ca: "El 2025, sí: les dues nits va fer el servei habitual, cada 20 minuts a totes les línies durant tota la nit, segons l'ATM. El 2026-27, per confirmar.",
          es: "En 2025, sí: las dos noches hizo el servicio habitual, cada 20 minutos en todas las líneas durante toda la noche, según la ATM. En 2026-27, por confirmar.",
          en: "In 2025 it did: on both nights it ran its usual service, every 20 minutes on every line all night, according to the ATM. For 2026-27, to be confirmed.",
        }),
      },
      {
        question: L({ ca: "Funciona el metro el dia de Nadal?", es: "¿Funciona el metro el día de Navidad?", en: "Is the Barcelona metro open on Christmas Day?" }),
        answer: L({
          ca: `Sí. ${cap(dayDate(DAYS.christmas, "ca", false))}, segons l'horari general de TMB, ${metroLine(DAYS.christmas, "ca")}. El 2025 va funcionar de 5:00 a 2:00.`,
          es: `Sí. El ${dayDate(DAYS.christmas, "es", false)}, según el horario general de TMB, ${metroLine(DAYS.christmas, "es")}. En 2025 funcionó de 5:00 a 2:00.`,
          en: `Yes. On ${dayDate(DAYS.christmas, "en", false)}, under TMB's standing timetable, it ${metroLine(DAYS.christmas, "en")}. In 2025 it ran from 5:00 to 2:00.`,
        }),
      },
      {
        question: L({ ca: "Quan publiquen TMB, Rodalies i FGC els horaris de Nadal 2026?", es: "¿Cuándo publican TMB, Rodalies y FGC los horarios de Navidad 2026?", en: "When do TMB, Rodalies and FGC publish their Christmas 2026 hours?" }),
        answer: L({
          ca: `El 2025, l'ATM el ${dateYear("2025-12-05", "ca")}, Rodalies el ${dateYear(rod.notices[0]!.published, "ca")}, FGC el ${dateYear(fgc.notices[0]!.published, "ca")} i TMB el ${dateYear(PAST.tmbChristmas2025.published, "ca")}. Ho afegim aquí el dia que surten.`,
          es: `En 2025, la ATM el ${dateYear("2025-12-05", "es")}, Rodalies el ${dateYear(rod.notices[0]!.published, "es")}, FGC el ${dateYear(fgc.notices[0]!.published, "es")} y TMB el ${dateYear(PAST.tmbChristmas2025.published, "es")}. Lo añadimos aquí el día que salen.`,
          en: `In 2025: the ATM on ${dateYear("2025-12-05", "en")}, Rodalies on ${dateYear(rod.notices[0]!.published, "en")}, FGC on ${dateYear(fgc.notices[0]!.published, "en")} and TMB on ${dateYear(PAST.tmbChristmas2025.published, "en")}. We add them here the day they come out.`,
        }),
      },
    ]),
    ...paras(verifiedLine(locale, TRANSPORT_NADAL_AS_OF)),
    ...b2Related(RELATED, locale),
  ].filter((block) => !(block.type === "paragraph" && !(block as { text: string }).text));

}

/* -------------------------------------------------------------------------- */
/* The article                                                                */
/* -------------------------------------------------------------------------- */

function transportSources(announced: Record<OperatorKey, Announced | null> = ANNOUNCED_2026_27): B2Source[] {
  const out: B2Source[] = [];
  const seen = new Set<string>();
  const push = (s: B2Source) => {
    if (seen.has(s.url)) return;
    seen.add(s.url);
    out.push(s);
  };
  for (const op of OPERATORS) {
    const slot = announced[op.key];
    if (slot) push({ name: `${op.name.ca}: horaris de Nadal 2026-27`, url: slot.url, publisher: op.notices[0]?.publisher ?? op.name.ca });
  }
  push({ name: "Horaris de metro, bus i funicular de Montjuïc", url: U.tmbHours, publisher: "TMB" });
  push({ name: "Preguntes freqüents (horaris del TRAM)", url: U.tramFaq, publisher: "TRAM" });
  for (const op of OPERATORS) for (const n of op.notices) push({ name: n.name, url: n.url, publisher: n.publisher });
  push({ name: "Dispositiu especial de transport públic (Nadal 2025)", url: U.bcnChristmasTransport, publisher: "Ajuntament de Barcelona" });
  push({ name: "Quins dies són festius a la línia Barcelona-Vallès?", url: U.fgcHolidaysBV, publisher: "FGC" });
  push({ name: "Quins dies són festius a la línia Llobregat-Anoia?", url: U.fgcHolidaysLA, publisher: "FGC" });
  return out;
}

/** The metro-hours guide's hero, typed here (hours.ts does not import this module); a test holds it equal to HOURS. */
const HOURS_HERO = {
  key: "horaris-metro-catalunya-l1",
  alt: {
    ca: "Andana de la línia 1 a l'estació de Catalunya, amb un tren arribant",
    es: "Andén de la línea 1 en la estación de Catalunya, con un tren llegando",
    en: "Line 1 platform at Catalunya station, with a train pulling in",
  },
  caption: {
    ca: "El metro tanca a mitjanit entre setmana i no tanca la nit del dissabte.",
    es: "El metro cierra a medianoche entre semana y no cierra la noche del sábado.",
    en: "The metro closes at midnight on weeknights and runs all night on Saturdays.",
  },
} as const;

export const CHRISTMAS_TRANSPORT: B2Article = {
  key: "christmasTransport",
  entryKey: "guide-barcelona-transport-christmas-new-year",
  categoryKey: "public-services",
  sources: [...transportSources(), ...trafficSources("christmas")],
  heroKey: HOURS_HERO.key,
  heroAlt: { ...HOURS_HERO.alt },
  heroCaption: { ...HOURS_HERO.caption },
  verifiedAt: TRANSPORT_NADAL_AS_OF,
  publishedAt: "2026-11-05T13:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...TRANSPORT_NADAL_META[locale], blocks: buildTransportBody(locale) }]),
  ) as B2Article["editions"],
};

/**
 * One body sentence for the New Year's Eve and metro-hours guides, linking
 * here (their titles and descriptions are not touched).
 */
export function christmasTransportMention(locale: Locale): string {
  return {
    ca: `Bus, NitBus, Rodalies, FGC i tram, dia a dia del 24 de desembre al 6 de gener: ${b2link("christmasTransport", "ca", "transport per Nadal i Cap d'Any 2026-27")}.`,
    es: `Bus, NitBus, Rodalies, FGC y tranvía, día a día del 24 de diciembre al 6 de enero: ${b2link("christmasTransport", "es", "transporte en Navidad y Nochevieja 2026-27")}.`,
    en: `Buses, NitBus, Rodalies, FGC and the tram, day by day from 24 December to 6 January: ${b2link("christmasTransport", "en", "public transport at Christmas and New Year 2026-27")}.`,
  }[locale];
}
