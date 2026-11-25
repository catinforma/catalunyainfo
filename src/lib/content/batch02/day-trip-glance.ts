import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { callout, table, type B2Article } from "./shared";

/**
 * "How to get there from Barcelona, how long, how much", dated, on the first
 * screen of the day-trip guides (25 Nov 2026).
 *
 * Why: GA4's "AI Assistant" channel sent 1,041 sessions in 28 days; day trips
 * from Barcelona are ~9 % of them, and the page that gets cited most, the
 * Montserrat guide, opens with the answer, a table and a dated source. The
 * other day-trip guides already answer in the lead (journey time and fare),
 * so nothing is rewritten. This module adds, without touching a title,
 * description, H1 or lead:
 *  - a line under the first "official" callout (or a new callout where the
 *    guide has none at the top) saying what was re-read today and where, and
 *  - for the two guides whose first table is not about transport (Núria,
 *    PortAventura), one compact table "how / time / fare / source".
 *
 * Everything below was read on 25 Nov 2026 from the operators' own data:
 *  - Rodalies' journey planner (serveisgrs.rodalies.gencat.cat/api/timetables,
 *    the API behind rodalies.gencat.cat/horaris), Barcelona-Sants to Girona
 *    (23 trains, 5:56-21:46, 1 h 19 to 1 h 41, single 8.95 EUR regional and
 *    12 EUR MD), Figueres (21 trains, 1 h 50 to 2 h 18, 12.80 / 17.10 EUR),
 *    Tarragona (32 trains :03 and :33 from 6:03 to 22:03, 69 min, 8.60 EUR),
 *    Salou-Port Aventura (R17: 8:33, 10:33, 12:33, 1 h 24, 9.35 EUR) and
 *    Tarragona to the park (RT2 and R17, 13 min, 2.70 EUR).
 *  - Renfe's open GTFS (ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip,
 *    services 25 Nov-7 Dec): AVE / Avant / Euromed Sants-Girona 39-49 min,
 *    15 trains Monday to Thursday, 13 on Friday, 9 on Saturday; Sants to
 *    Figueres-Vilafant 53-65 min, 15 / 13 / 9; the same file's R11 regional
 *    trains confirm 23 on weekdays and 15 on Saturdays.
 *  - FGC Turistren (turistren.cat/trens/cremallera-de-nuria/ and the 2026
 *    fares PDF): adult 34 EUR from Ribes and 31 EUR from Queralbs return,
 *    child (4-13) 22 and 20 EUR, under 4 free, "vigents fins el 30 de novembre
 *    2026"; the climb "en tan sols 40 minuts".
 *  - Rodalies' R3 notice (rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3):
 *    "una oferta de circulacions del 50% respecte a la que hi havia abans del
 *    20 de gener"; from 16 Nov no trains between La Garriga and Figaró, the R3
 *    runs from Sant Martí de Centelles to Puigcerdà.
 *  - PortAventura World's calendar feed (api/club/calendar/influx/{park}/MM/YYYY,
 *    Nov 2026 - May 2027) and its tickets page: one day from 43 EUR, 37 EUR
 *    online (junior and senior 39 / 33), two parks 55 / 44.
 *  - Fundació Gala-Salvador Dalí (visit page): from 18.50 EUR; Tuesday to
 *    Sunday 10:30-18:00 from 1 Oct to 22 March (and 1 Oct - 31 Dec).
 *  - tarragona.cat (Museu d'Història, prices): joint ticket for five Roman
 *    sites 15 EUR.
 *  - Andbus (andorrabybus.com/es/horarios-y-tarifas): airport to Andorra
 *    33 EUR single, 56 EUR return, T1 00:45 to 22:45 every two hours, arrival
 *    03:15 later; Direct Bus (andorradirectbus.es/es/horarios): Sants 06:15
 *    to 23:45 eight times, "llegadas 3h más tarde aprox. (3h 30 aeropuerto)".
 * Not re-read, so not repeated here: the Girona fares of the high-speed trains
 * (28 Oct, "from 17.40 / 36.50 EUR"), PortAventura's "10 EUR more at the
 * ticket office" (the tickets page now prints a separate ticket-booth price
 * that this page cannot explain).
 */

export type GlanceKey = "girona" | "figueres" | "tarragona" | "andorra" | "portaventura" | "nuria";

/** The day every figure above was read. */
export const GLANCE_READ = "2026-11-25";

/**
 * Each guide's own re-read date: a test fails from that day. Núria's fares end
 * on 30 Nov 2026; Renfe's timetable file covers services to 7 Dec; PortAventura's
 * Christmas hours and the RT2 timetable change in early December.
 */
export const GLANCE_REREAD_BY: Record<GlanceKey, string> = {
  nuria: "2026-12-01",
  portaventura: "2026-12-05",
  girona: "2026-12-07",
  figueres: "2026-12-07",
  tarragona: "2026-12-07",
  andorra: "2026-12-22",
};

type Copy = Record<Locale, string>;

const DATE: Copy = { ca: "25 de novembre de 2026", es: "25 de noviembre de 2026", en: "25 November 2026" };
const LABEL: Copy = { ca: "Transport i tarifes verificats", es: "Transporte y tarifas verificados", en: "Transport and fares verified" };

/** One sentence, no clock time (Girona's text blocks may not carry a departure time: batch02.test.ts). */
const NOTE: Record<GlanceKey, Copy> = {
  girona: {
    ca: "Tornats a llegir el 25 de novembre de 2026, sense canvis: l'R11 al cercador d'horaris de Rodalies (23 trens en un dia feiner, d'1 h 19 a 1 h 41, 8,95 € el regional i 12 € el MD) i l'alta velocitat a les dades obertes d'horaris de Renfe (15 trens de dilluns a dijous, de 39 a 49 minuts).",
    es: "Releídos el 25 de noviembre de 2026, sin cambios: la R11 en el buscador de horarios de Rodalies (23 trenes en un día laborable, de 1 h 19 a 1 h 41, 8,95 € el regional y 12 € el MD) y la alta velocidad en los datos abiertos de horarios de Renfe (15 trenes de lunes a jueves, de 39 a 49 minutos).",
    en: "Re-read on 25 November 2026, unchanged: the R11 in Rodalies' journey planner (23 trains on a weekday, 1 h 19 to 1 h 41, €8.95 regional and €12 MD) and high-speed in Renfe's open timetable data (15 trains Monday to Thursday, 39 to 49 minutes).",
  },
  figueres: {
    ca: "Tornats a llegir el 25 de novembre de 2026: l'R11 (21 trens en un dia feiner, d'1 h 50 a 2 h 18, 12,80 € el regional i 17,10 € el MD) i l'alta velocitat fins a Figueres-Vilafant (de 53 a 65 minuts, 15 trens de dilluns a dijous) segueixen igual; la Fundació Gala-Salvador Dalí manté les entrades des de 18,50 € i l'obertura de dimarts a diumenge, de 10:30 a 18:00.",
    es: "Releídos el 25 de noviembre de 2026: la R11 (21 trenes en un día laborable, de 1 h 50 a 2 h 18, 12,80 € el regional y 17,10 € el MD) y la alta velocidad hasta Figueres-Vilafant (de 53 a 65 minutos, 15 trenes de lunes a jueves) siguen igual; la Fundació Gala-Salvador Dalí mantiene las entradas desde 18,50 € y la apertura de martes a domingo, de 10:30 a 18:00.",
    en: "Re-read on 25 November 2026: the R11 (21 trains on a weekday, 1 h 50 to 2 h 18, €12.80 regional and €17.10 MD) and high-speed to Figueres-Vilafant (53 to 65 minutes, 15 trains Monday to Thursday) are unchanged; the Gala-Salvador Dalí Foundation still gives tickets from €18.50 and opening Tuesday to Sunday, 10:30 to 18:00.",
  },
  tarragona: {
    ca: "Tornats a llegir el 25 de novembre de 2026, sense canvis: els regionals R14 a R17 des de Sants (69 minuts, 8,60 € el senzill, un tren al minut 3 i un al 33 de cada hora, de 6:03 a 22:03) al cercador d'horaris de Rodalies, i l'entrada conjunta als cinc recintes romans (15 €) a l'Ajuntament de Tarragona.",
    es: "Releídos el 25 de noviembre de 2026, sin cambios: los regionales R14 a R17 desde Sants (69 minutos, 8,60 € el sencillo, un tren al minuto 3 y otro al 33 de cada hora, de 6:03 a 22:03) en el buscador de horarios de Rodalies, y la entrada conjunta a los cinco recintos romanos (15 €) en el Ayuntamiento de Tarragona.",
    en: "Re-read on 25 November 2026, unchanged: the R14 to R17 regional trains from Sants (69 minutes, €8.60 single, one train at :03 and one at :33 past the hour, from 6:03 to 22:03) in Rodalies' journey planner, and the combined ticket for the five Roman sites (€15) on the Tarragona City Council's site.",
  },
  andorra: {
    ca: "Tornats a llegir als horaris de cada operador el 25 de novembre de 2026, sense canvis: Andbus (33 € el senzill i 56 € d'anada i tornada des de l'aeroport comprant en línia; 3 h 15 des de la T1 i 2 h 45 des de Diagonal) i Direct Bus (8 sortides des de Sants, de 6:15 a 23:45; unes 3 hores).",
    es: "Releídos en los horarios de cada operador el 25 de noviembre de 2026, sin cambios: Andbus (33 € el sencillo y 56 € de ida y vuelta desde el aeropuerto comprando en línea; 3 h 15 desde la T1 y 2 h 45 desde Diagonal) y Direct Bus (8 salidas desde Sants, de 6:15 a 23:45; unas 3 horas).",
    en: "Re-read on each operator's timetable page on 25 November 2026, unchanged: Andbus (€33 single and €56 return from the airport, buying online; 3 h 15 from T1 and 2 h 45 from Diagonal) and Direct Bus (8 departures from Sants, 6:15 to 23:45; about 3 hours).",
  },
  portaventura: {
    ca: "Tornats a llegir el 25 de novembre de 2026: el calendari oficial ja publica els horaris de febrer a maig de 2027 (vegeu la taula d'horaris) i les entrades (des de 43 €, 37 € en línia) i els trens R17 i RT2 segueixen igual.",
    es: "Releídos el 25 de noviembre de 2026: el calendario oficial ya publica los horarios de febrero a mayo de 2027 (véase la tabla de horarios) y las entradas (desde 43 €, 37 € en línea) y los trenes R17 y RT2 siguen igual.",
    en: "Re-read on 25 November 2026: the official calendar now publishes the hours for February to May 2027 (see the opening-times table) and the tickets (from €43, €37 online) and the R17 and RT2 trains are unchanged.",
  },
  nuria: {
    ca: "Tornats a llegir a FGC Turistren el 25 de novembre de 2026, sense canvis: tarifes del cremallera (encara vigents fins al 30 de novembre) i pujada d'uns 40 minuts; avís de l'R3 de Rodalies llegit el mateix dia.",
    es: "Releídos en FGC Turistren el 25 de noviembre de 2026, sin cambios: tarifas del cremallera (aún vigentes hasta el 30 de noviembre) y subida de unos 40 minutos; aviso de la R3 de Rodalies leído el mismo día.",
    en: "Re-read on FGC Turistren on 25 November 2026, unchanged: the rack railway fares (still valid until 30 November) and the climb of about 40 minutes; Rodalies' R3 notice read the same day.",
  },
};

interface GlanceTable {
  caption: string;
  headers: string[];
  rows: string[][];
  note: string;
}

const HEADERS: Record<Locale, string[]> = {
  ca: ["Com s'hi va", "Durada", "Preu", "Font"],
  es: ["Cómo se va", "Duración", "Precio", "Fuente"],
  en: ["How to go", "Journey", "Fare", "Source"],
};

const PLANNER = "https://rodalies.gencat.cat/ca/horaris/";
const FGC = "https://turistren.cat/trens/cremallera-de-nuria/";
const R3 = "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3";
const PA_TICKETS = "https://www.portaventuraworld.com/en/tickets/portaventura";

/** The compact table for the two guides whose first table is not about transport. */
const TABLES: Partial<Record<GlanceKey, Record<Locale, GlanceTable>>> = {
  nuria: {
    ca: {
      caption: "Com arribar a la Vall de Núria des de Barcelona",
      headers: HEADERS.ca,
      rows: [
        ["Cremallera de Núria, de Ribes-Enllaç a la Vall de Núria", "Uns 40 minuts", "34 € d'anada i tornada des de Ribes i 31 € des de Queralbs (adult); infants de 4 a 13 anys, 22 i 20 €; fins a 3 anys, gratis. Tarifes vigents fins al 30 de novembre de 2026", `[FGC Turistren](${FGC})`],
        ["R3 de Rodalies fins a Ribes-Enllaç", "Més llarg que l'habitual: l'R3 circula amb el 50 % dels trens d'abans del 20 de gener i, des del 16 de novembre, els trens surten de Sant Martí de Centelles (obres entre la Garriga i Figaró)", "Consulta el cercador de Rodalies", `[Rodalies, avís de l'R3](${R3})`],
      ],
      note: "Llegit el 25 de novembre de 2026. Rodalies no publica una durada de Barcelona a Ribes-Enllaç mentre duren les obres: consulta'n els horaris el mateix dia.",
    },
    es: {
      caption: "Cómo llegar a la Vall de Núria desde Barcelona",
      headers: HEADERS.es,
      rows: [
        ["Cremallera de Núria, de Ribes-Enllaç a la Vall de Núria", "Unos 40 minutos", "34 € de ida y vuelta desde Ribes y 31 € desde Queralbs (adulto); niños de 4 a 13 años, 22 y 20 €; hasta 3 años, gratis. Tarifas vigentes hasta el 30 de noviembre de 2026", `[FGC Turistren](${FGC})`],
        ["R3 de Rodalies hasta Ribes-Enllaç", "Más largo de lo habitual: la R3 circula con el 50 % de los trenes de antes del 20 de enero y, desde el 16 de noviembre, los trenes salen de Sant Martí de Centelles (obras entre La Garriga y Figaró)", "Consulta el buscador de Rodalies", `[Rodalies, aviso de la R3](${R3})`],
      ],
      note: "Leído el 25 de noviembre de 2026. Rodalies no publica una duración de Barcelona a Ribes-Enllaç mientras duran las obras: consulta los horarios el mismo día.",
    },
    en: {
      caption: "How to get to the Vall de Núria from Barcelona",
      headers: HEADERS.en,
      rows: [
        ["Núria rack railway, Ribes-Enllaç to the Vall de Núria", "About 40 minutes", "€34 return from Ribes and €31 from Queralbs (adult); children 4 to 13, €22 and €20; under 4, free. Fares valid until 30 November 2026", `[FGC Turistren](${FGC})`],
        ["Rodalies R3 to Ribes-Enllaç", "Longer than usual: the R3 runs 50% of the trains it had before 20 January and, since 16 November, its trains start at Sant Martí de Centelles (works between La Garriga and Figaró)", "Check Rodalies' journey planner", `[Rodalies, R3 notice](${R3})`],
      ],
      note: "Read on 25 November 2026. Rodalies publishes no journey time from Barcelona to Ribes-Enllaç while the works last: check the timetable on the day.",
    },
  },
  portaventura: {
    ca: {
      caption: "Com arribar a PortAventura des de Barcelona i quant costa",
      headers: HEADERS.ca,
      rows: [
        ["R17 directe, de Barcelona-Sants a Salou-Port Aventura", "1 h 24; 3 trens al dia (8:33, 10:33 i 12:33 des de Sants); l'estació és a 10 minuts a peu del parc", "9,35 € el senzill", `[Rodalies, cercador d'horaris](${PLANNER})`],
        ["Regional fins a Tarragona i RT2 fins al parc", "69 min + 13 min", "8,60 € + 2,70 € el senzill", `[Rodalies, cercador d'horaris](${PLANNER})`],
        ["Entrada d'un dia a PortAventura Park (adult)", "Obre cada dia fins al 6 de gener, normalment de 10:30 a 18:00", "Des de 43 € (37 € en línia el 25 de novembre de 2026)", `[PortAventura World, entrades](${PA_TICKETS})`],
      ],
      note: "Llegit el 25 de novembre de 2026. Els horaris i els preus canvien amb la data: consulta'ls per al teu dia.",
    },
    es: {
      caption: "Cómo llegar a PortAventura desde Barcelona y cuánto cuesta",
      headers: HEADERS.es,
      rows: [
        ["R17 directo, de Barcelona-Sants a Salou-Port Aventura", "1 h 24; 3 trenes al día (8:33, 10:33 y 12:33 desde Sants); la estación está a 10 minutos a pie del parque", "9,35 € el sencillo", `[Rodalies, buscador de horarios](${PLANNER})`],
        ["Regional hasta Tarragona y RT2 hasta el parque", "69 min + 13 min", "8,60 € + 2,70 € el sencillo", `[Rodalies, buscador de horarios](${PLANNER})`],
        ["Entrada de un día a PortAventura Park (adulto)", "Abre cada día hasta el 6 de enero, normalmente de 10:30 a 18:00", "Desde 43 € (37 € en línea el 25 de noviembre de 2026)", `[PortAventura World, entradas](${PA_TICKETS})`],
      ],
      note: "Leído el 25 de noviembre de 2026. Los horarios y los precios cambian con la fecha: consúltalos para tu día.",
    },
    en: {
      caption: "How to get to PortAventura from Barcelona and what it costs",
      headers: HEADERS.en,
      rows: [
        ["Direct R17, Barcelona-Sants to Salou-Port Aventura", "1 h 24; 3 trains a day (8:33, 10:33 and 12:33 from Sants); the station is a 10-minute walk from the park", "€9.35 single", `[Rodalies, journey planner](${PLANNER})`],
        ["Regional train to Tarragona and the RT2 to the park", "69 min + 13 min", "€8.60 + €2.70 single", `[Rodalies, journey planner](${PLANNER})`],
        ["One-day ticket to PortAventura Park (adult)", "Open every day until 6 January, usually 10:30 to 18:00", "From €43 (€37 online on 25 November 2026)", `[PortAventura World, tickets](${PA_TICKETS})`],
      ],
      note: "Read on 25 November 2026. Times and prices change with the date: check them for your day.",
    },
  },
};

/**
 * The guide with the dated re-read line under its first official callout (a
 * new one right after the lead where the guide has none at the top) and, for
 * Núria and PortAventura, the compact table. Never touches the lead, the
 * title, the description or any existing block.
 */
export function withGlance(article: B2Article, key: GlanceKey): B2Article {
  const editions = { ...article.editions };
  for (const locale of Object.keys(editions) as Locale[]) {
    const edition = editions[locale];
    const blocks: Block[] = [...edition.blocks];
    const leadAt = blocks.findIndex((b) => b.type === "paragraph" && b.lead);
    const officialAt = blocks.findIndex((b) => b.type === "callout" && b.tone === "official");
    let after = leadAt;
    if (officialAt > leadAt && officialAt <= leadAt + 3) {
      const existing = blocks[officialAt] as Extract<Block, { type: "callout" }>;
      blocks[officialAt] = { ...existing, text: `${existing.text} ${NOTE[key][locale]}` };
      // The compact table follows the callout only when it already follows the lead.
      if (officialAt === leadAt + 1) after = officialAt;
    } else {
      blocks.splice(leadAt + 1, 0, callout("official", `${LABEL[locale]}: ${DATE[locale]}.`, NOTE[key][locale]));
      after = leadAt + 1;
    }
    const glance = TABLES[key]?.[locale];
    if (glance) blocks.splice(after + 1, 0, table(glance.caption, glance.headers, glance.rows, glance.note));
    editions[locale] = { ...edition, blocks };
  }
  return { ...article, editions };
}
