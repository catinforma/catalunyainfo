import { shortDate, WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import { weekendRange } from "@/lib/content/live-title";
import type { Locale } from "@/lib/i18n/config";

import type { AgendaSourceId, ItemType } from "./agenda-list";

/**
 * The words around the server-rendered weekend lists, in the three editions.
 * The activities themselves are never translated: their names, times and
 * prices are the publishers' (mostly Catalan), and the Spanish and English
 * pages say so.
 */

export interface ListCopy {
  heading: string;
  headingLong: string;
  summary: (c: { all: number; free: number } & Record<ItemType, number>) => string;
  multiHeading: string;
  multiNote: string;
  types: Record<ItemType, string>;
  free: string;
  more: (n: number, source: string) => string;
  moreVenues: (n: number) => string;
  /** Null in Catalan, the publishers' language. */
  languageNote: string | null;
  unavailable: string;
  empty: string;
  held: (stamp: string) => string;
  readAt: (stamp: string) => string;
  allAgenda: string;
  sourceName: Record<AgendaSourceId, string>;
  attribution: Record<AgendaSourceId, (updated: string) => string>;
  sourcesHeading: string;
}

const join = (parts: string[], and: string) => (parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} ${and} ${parts.at(-1)}`);

export const LIST_COPY: Record<Locale, ListCopy> = {
  ca: {
    heading: "L'agenda del cap de setmana, dia a dia",
    headingLong: "L'agenda del pont, dia a dia",
    summary: (c) =>
      `${c.all} activitats a l'agenda oficial: ${join(
        [`${c.free} gratuïtes`, `${c.family} amb nens`, `${c.fairs} fires i mercats`, `${c.music} de música`, `${c.exhibitions} exposicions`],
        "i",
      )}. A cada grup, primer les gratuïtes i les recomanades per l'organisme que les publica.`,
    multiHeading: "Tot el cap de setmana o diversos dies",
    multiNote: "Activitats de més d'un dia d'aquest cap de setmana, o que la font no detalla per sessions: comprova l'horari de cada dia a la seva pàgina.",
    types: { fairs: "Fires i mercats", family: "Amb nens", music: "Música", exhibitions: "Exposicions", stage: "Teatre, dansa i circ", other: "Festes, rutes, cinema i altres" },
    free: "Gratuït",
    more: (n, source) => `${n} més a ${source}`,
    moreVenues: (n) => (n === 1 ? "i 1 espai més" : `i ${n} espais més`),
    languageNote: null,
    unavailable: "Ara no podem llegir l'agenda oficial d'aquest cap de setmana, i no en mostrarem la d'un altre. Consulta-la directament a",
    empty: "L'agenda oficial no publica cap activitat per als dies que queden d'aquest cap de setmana. Consulta-la directament a",
    held: (stamp) => `L'agenda oficial no respon ara: aquesta llista és la que en vam llegir el ${stamp}, per a aquest mateix cap de setmana.`,
    readAt: (stamp) => `Llegit de la font oficial el ${stamp}; s'actualitza cada hora.`,
    allAgenda: "Tota l'agenda",
    sourceName: { gencat: "l'Agenda Cultural de Catalunya", bcn: "la Guia Barcelona" },
    attribution: {
      gencat: (updated) =>
        `Font: Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, dades obertes \`rhpv-yr4f\`, Llicència oberta d'ús d'informació - Catalunya), darrera actualització el ${updated}.`,
      bcn: (updated) =>
        `Font de les dades: Ajuntament de Barcelona (Open Data BCN, agenda d'esdeveniments i activitats de la ciutat, CC BY 4.0), darrera modificació de les activitats llistades el ${updated}.`,
    },
    sourcesHeading: "D'on surt aquesta agenda",
  },
  es: {
    heading: "La agenda del fin de semana, día a día",
    headingLong: "La agenda del puente, día a día",
    summary: (c) =>
      `${c.all} actividades en la agenda oficial: ${join(
        [`${c.free} gratuitas`, `${c.family} con niños`, `${c.fairs} ferias y mercados`, `${c.music} de música`, `${c.exhibitions} exposiciones`],
        "y",
      )}. En cada grupo, primero las gratuitas y las recomendadas por el organismo que las publica.`,
    multiHeading: "Todo el fin de semana o varios días",
    multiNote: "Actividades de más de un día de este fin de semana, o que la fuente no detalla por sesiones: comprueba el horario de cada día en su página.",
    types: { fairs: "Ferias y mercados", family: "Con niños", music: "Música", exhibitions: "Exposiciones", stage: "Teatro, danza y circo", other: "Fiestas, rutas, cine y otros" },
    free: "Gratis",
    more: (n, source) => `${n} más en ${source}`,
    moreVenues: (n) => (n === 1 ? "y 1 espacio más" : `y ${n} espacios más`),
    languageNote: "Los nombres, horarios y precios de las actividades aparecen tal como los publican la Generalitat y el Ayuntamiento, casi siempre en catalán.",
    unavailable: "Ahora no podemos leer la agenda oficial de este fin de semana, y no mostraremos la de otro. Consúltala directamente en",
    empty: "La agenda oficial no publica ninguna actividad para los días que quedan de este fin de semana. Consúltala directamente en",
    held: (stamp) => `La agenda oficial no responde ahora: esta lista es la que leímos el ${stamp}, para este mismo fin de semana.`,
    readAt: (stamp) => `Leído de la fuente oficial el ${stamp}; se actualiza cada hora.`,
    allAgenda: "Toda la agenda",
    sourceName: { gencat: "la Agenda Cultural de Catalunya", bcn: "la Guia Barcelona" },
    attribution: {
      gencat: (updated) =>
        `Fuente: Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, datos abiertos \`rhpv-yr4f\`, Llicència oberta d'ús d'informació - Catalunya), última actualización el ${updated}.`,
      bcn: (updated) =>
        `Fuente de los datos: Ajuntament de Barcelona (Open Data BCN, agenda de acontecimientos y actividades de la ciudad, CC BY 4.0), última modificación de las actividades listadas el ${updated}.`,
    },
    sourcesHeading: "De dónde sale esta agenda",
  },
  en: {
    heading: "This weekend's agenda, day by day",
    headingLong: "This long weekend's agenda, day by day",
    summary: (c) =>
      `${c.all} activities in the official agenda: ${join(
        [`${c.free} free`, `${c.family} for children`, `${c.fairs} fairs and markets`, `${c.music} music`, `${c.exhibitions} exhibitions`],
        "and",
      )}. In each group, free activities and the publisher's own picks come first.`,
    multiHeading: "All weekend or several days",
    multiNote: "Activities on more than one day this weekend, or whose sessions the source does not list: check each day's times on the activity's page.",
    types: { fairs: "Fairs and markets", family: "With children", music: "Music", exhibitions: "Exhibitions", stage: "Theatre, dance and circus", other: "Festivals, tours, film and more" },
    free: "Free",
    more: (n, source) => `${n} more in ${source}`,
    moreVenues: (n) => (n === 1 ? "and 1 more venue" : `and ${n} more venues`),
    languageNote: "Activity names, times and prices are shown as the Generalitat and the City Council publish them, mostly in Catalan (\"a les 18.00 h\" = at 6 pm; \"Entrada gratuïta\" = free entry).",
    unavailable: "We cannot read the official agenda for this weekend right now, and we will not show another weekend's instead. Check it directly at",
    empty: "The official agenda lists no activities for the days left this weekend. Check it directly at",
    held: (stamp) => `The official agenda is not answering right now: this is the list we read on ${stamp}, for this same weekend.`,
    readAt: (stamp) => `Read from the official source on ${stamp}; refreshed every hour.`,
    allAgenda: "The whole agenda",
    sourceName: { gencat: "the Agenda Cultural de Catalunya", bcn: "Guia Barcelona" },
    attribution: {
      gencat: (updated) =>
        `Source: Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, open data \`rhpv-yr4f\`, Llicència oberta d'ús d'informació - Catalunya), last updated ${updated}.`,
      bcn: (updated) =>
        `Data source: Ajuntament de Barcelona (Open Data BCN, the city's events and activities agenda, CC BY 4.0), activities listed last changed ${updated}.`,
    },
    sourcesHeading: "Where this agenda comes from",
  },
};

/** What we do to the data, as Open Data BCN's terms ask ("tota modificació … serà identificada"). */
export const TRANSFORMATION: Record<Locale, string> = {
  ca: "CatalunyaInfo en tria les activitats d'aquest cap de setmana (fins a 45 dies de durada; sense cursos per trimestres ni avisos de trànsit), les agrupa per dia i per tipus, en mostra unes quantes per grup i escurça els textos llargs (marcats amb «…»). No en canvia ni en tradueix el contingut. Ni la Generalitat ni l'Ajuntament participen en aquesta pàgina.",
  es: "CatalunyaInfo selecciona las actividades de este fin de semana (de hasta 45 días de duración; sin cursos trimestrales ni avisos de tráfico), las agrupa por día y por tipo, muestra unas cuantas por grupo y acorta los textos largos (marcados con «…»). No cambia ni traduce su contenido. Ni la Generalitat ni el Ayuntamiento participan en esta página.",
  en: "CatalunyaInfo picks this weekend's activities (up to 45 days long; no term courses or traffic notices), groups them by day and by type, shows a few per group and shortens long texts (marked with \"…\"). It does not change or translate them. Neither the Generalitat nor the City Council takes part in this page.",
};

/** "Dissabte, 21 de novembre" / "Sábado, 21 de noviembre" / "Saturday 21 November". */
export function dayHeading(iso: string, locale: Locale): string {
  const weekday = WEEKDAY_NAMES[locale][new Date(`${iso}T12:00:00Z`).getUTCDay()] ?? "";
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return locale === "en" ? `${cap} ${shortDate(iso, locale)}` : `${cap}, ${shortDate(iso, locale)}`;
}

/** "21 nov–23 des": an activity's own dates, as the weekend titles write ranges. */
export function itemRange(start: string, end: string, locale: Locale): string {
  return start === end ? weekendRange(locale, { from: start, to: start }).replace(/^(\d+)–\1 /, "$1 ") : weekendRange(locale, { from: start, to: end });
}

const MADRID_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/**
 * "18 de novembre de 2026 a les 18.30" for an instant (Madrid time) or a
 * local timestamp without a zone (Open Data BCN's `modified`), or the date
 * alone for a bare date.
 */
export function stamp(value: string, locale: Locale): string {
  let date = value.slice(0, 10);
  let time: string | null = null;
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)) {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) {
      const parts = Object.fromEntries(MADRID_TIME.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
      date = `${parts.year}-${parts.month}-${parts.day}`;
      time = `${parts.hour}:${parts.minute}`;
    }
  } else if (/T\d{2}:\d{2}/.test(value)) time = value.slice(11, 16);
  const year = date.slice(0, 4);
  const day = shortDate(date, locale);
  if (locale === "en") return time ? `${day} ${year}, ${time}` : `${day} ${year}`;
  if (!time) return `${day} de ${year}`;
  return locale === "ca" ? `${day} de ${year} a les ${time.replace(":", ".")}` : `${day} de ${year} a las ${time}`;
}

/* -------------------------------------------------------------------------- */
/* Christmas fairs this weekend                                               */
/* -------------------------------------------------------------------------- */

export const CHRISTMAS_COPY: Record<Locale, { heading: string; note: string; hub: string }> = {
  ca: {
    heading: "Fires de Nadal obertes aquest cap de setmana",
    note: "Del nostre calendari de fires de Nadal, amb les dates comprovades a la web de cada organitzador. Cada enllaç porta a la pàgina del municipi, amb horaris i com arribar-hi.",
    hub: "Totes les fires de Nadal per municipi",
  },
  es: {
    heading: "Mercados de Navidad abiertos este fin de semana",
    note: "De nuestro calendario de mercados de Navidad, con las fechas comprobadas en la web de cada organizador. Cada enlace lleva a la página del municipio, con horarios y cómo llegar.",
    hub: "Todos los mercados de Navidad por municipio",
  },
  en: {
    heading: "Christmas markets open this weekend",
    note: "From our Christmas markets calendar, with the dates checked on each organiser's site. Each link opens the town's page, with opening times and how to get there.",
    hub: "All Christmas markets by town",
  },
};

/* -------------------------------------------------------------------------- */
/* English pages                                                              */
/* -------------------------------------------------------------------------- */

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;
const first = (candidates: string[], limit: number) => candidates.find((c) => c.length <= limit) ?? candidates.at(-1)!;

export function englishHubMeta(window: { from: string; to: string }): { title: string; description: string; h1: string; lead: string } {
  const r = weekendRange("en", window);
  return {
    title: first([`Fairs and events in Catalonia this weekend (${r})`, `Catalonia this weekend (${r})`], TITLE_LIMIT),
    description: first(
      [
        `This weekend in Catalonia (${r}): the official fairs calendar, Christmas markets and the Generalitat's agenda by day: free plans, family, music, exhibitions.`,
        `This weekend in Catalonia (${r}): official fairs, Christmas markets and the Generalitat's agenda, by day and by type.`,
      ],
      DESCRIPTION_LIMIT,
    ),
    h1: "Fairs, markets and events in Catalonia this weekend",
    lead: "This weekend's fairs from the Generalitat's official fairs calendar, the Christmas markets that are open, and the Generalitat's cultural agenda grouped by day and by type, refreshed every hour.",
  };
}

export function englishBarcelonaMeta(window: { from: string; to: string }): { title: string; description: string; h1: string; lead: string } {
  const r = weekendRange("en", window);
  return {
    title: first([`Things to do in Barcelona this weekend (${r})`, `Barcelona this weekend (${r})`], TITLE_LIMIT),
    description: first(
      [
        `What's on in Barcelona this weekend (${r}): free plans, kids, markets, concerts and exhibitions from the City Council's official agenda, day by day.`,
        `What's on in Barcelona this weekend (${r}), from the City Council's official agenda, day by day.`,
      ],
      DESCRIPTION_LIMIT,
    ),
    h1: "Things to do in Barcelona this weekend",
    lead: "What's on in Barcelona this weekend, from the Ajuntament de Barcelona's own agenda and the Generalitat's, grouped by day and by type, with times and prices as published and the official page of every activity.",
  };
}
