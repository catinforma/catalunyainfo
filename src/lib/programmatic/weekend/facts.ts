import { shortDate, WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dayHeading, itemRange, stamp } from "./agenda-copy";
import { buildView, inPlace, mergeBarcelona, type AgendaItem, type AgendaSourceId, type SourceView } from "./agenda-list";
import { BCN_SOURCE, GENCAT_SOURCE } from "./agenda-upstream";
import { christmasFairsThisWeekend } from "./christmas-weekend";
import { SNAPSHOT, listedFairs } from "./data";
import type { SnapshotFair } from "./types";
import { zoneFilter, type ZoneDef } from "./zones";

/**
 * The "key facts" block and the short FAQ of the weekend pages (25 Nov 2026):
 * what dates the page covers, how many activities and fairs the official
 * sources list for them, where each list comes from and when it was read.
 *
 * Every number is counted from the lists the same page prints (`buildView`
 * for the agenda, `listedFairs` for the fairs calendar, `christmasFairsThisWeekend`
 * for the Christmas towns), so the block can never disagree with the page, and
 * nothing is said that the sources did not publish: an unread agenda is
 * written as unread, never as empty. Pure: nothing here reads the clock; the
 * route passes the window, the render date and the reads.
 */

export interface FactRow {
  key: "dates" | "agenda" | "fairs" | "christmas" | "sources" | "read";
  label: string;
  value: string;
  /** The sources named in the value: the component shows these as links instead of the plain text. */
  links?: { label: string; href: string }[];
}

export interface FactsFaqItem {
  question: string;
  answer: string;
}

export interface WeekendFacts {
  heading: string;
  caption: string;
  rows: FactRow[];
  faqHeading: string;
  /** Empty below two answerable questions. */
  faq: FactsFaqItem[];
}

export interface FactsInput {
  locale: Locale;
  /** "a la Costa Brava" / "en Cataluña" / "in Barcelona": how a sentence places the page. */
  where: string;
  window: { from: string; to: string; long: boolean };
  today: string;
  /** The reads behind `items`, in the order the page names them. */
  sources: { source: AgendaSourceId; view: SourceView }[];
  items: readonly AgendaItem[];
  /** The fairs the page lists for these dates. */
  fairs: readonly SnapshotFair[];
  /** Municipalities with a Christmas fair open on these dates. */
  christmasTowns: number;
}

interface Copy {
  heading: (long: boolean) => string;
  caption: (where: string) => string;
  labels: Record<FactRow["key"], string>;
  agendaCounts: (c: { all: number; free: number; family: number; fairs: number; music: number; exhibitions: number }) => string;
  agendaEmpty: string;
  agendaUnread: string;
  fairsCount: (n: number) => string;
  fairsNone: string;
  christmas: (n: number) => string;
  sourceNames: { gencat: string; bcn: string; fairs: string };
  readLive: (agenda: string, fairs: string) => string;
  readHeld: (agenda: string, fairs: string) => string;
  readNone: (fairs: string) => string;
  faqHeading: string;
  q: { activities: (w: string, long: boolean) => string; fairs: (w: string, long: boolean) => string; sources: string };
  a: {
    activities: (c: { all: number; free: number; family: number; music: number; exhibitions: number }, dates: string, stamp: string) => string;
    fairs: (n: number, list: string, christmas: number, fairsRead: string) => string;
    fairsNone: (christmas: number, fairsRead: string) => string;
    sources: (sources: string, agendaRead: string | null, fairsRead: string) => string;
  };
}

const join = (parts: readonly string[], and: string) => (parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} ${and} ${parts.at(-1)}`);

const COPY: Record<Locale, Copy> = {
  ca: {
    heading: (long) => (long ? "Dades clau del pont" : "Dades clau d'aquest cap de setmana"),
    caption: (where) => `Què cobreix aquesta pàgina ${where}, quantes activitats hi ha i d'on surten les dades`,
    labels: { dates: "Dates", agenda: "Activitats a l'agenda oficial", fairs: "Fires del calendari oficial", christmas: "Fires de Nadal obertes", sources: "Fonts", read: "Llegit" },
    agendaCounts: (c) => `${c.all} (${c.free} gratuïtes, ${c.family} amb nens, ${c.fairs} fires i mercats, ${c.music} de música, ${c.exhibitions} exposicions)`,
    agendaEmpty: "Cap activitat per als dies que queden",
    agendaUnread: "No hem pogut llegir l'agenda oficial ara, i no en mostrem la d'un altre cap de setmana",
    fairsCount: (n) => `${n} (llista més avall)`,
    fairsNone: "Cap per a aquestes dates",
    christmas: (n) => (n === 1 ? "1 municipi (llista més avall)" : `${n} municipis (llista més avall)`),
    sourceNames: {
      gencat: "Agenda Cultural de Catalunya (Generalitat de Catalunya, Departament de Cultura)",
      bcn: "Guia Barcelona (Ajuntament de Barcelona, Open Data BCN)",
      fairs: "Calendari de fires (Generalitat de Catalunya, Departament d'Empresa i Treball)",
    },
    readLive: (agenda, fairs) => `Agenda: ${agenda}, i s'actualitza cada hora. Calendari de fires: ${fairs}.`,
    readHeld: (agenda, fairs) => `Agenda: darrera lectura el ${agenda} (la font no respon ara; és d'aquest mateix cap de setmana). Calendari de fires: ${fairs}.`,
    readNone: (fairs) => `Agenda: sense lectura d'aquest cap de setmana. Calendari de fires: ${fairs}.`,
    faqHeading: "Preguntes freqüents",
    q: {
      activities: (w, long) => `Quines activitats hi ha ${long ? "aquest pont" : "aquest cap de setmana"} ${w}?`,
      fairs: (w, long) => `Hi ha fires ${long ? "aquest pont" : "aquest cap de setmana"} ${w}?`,
      sources: "D'on surt aquesta informació i quan s'ha llegit?",
    },
    a: {
      activities: (c, dates, at) =>
        `L'agenda oficial llista ${c.all} activitats ${dates}: ${c.free} gratuïtes, ${c.family} amb nens, ${c.music} de música i ${c.exhibitions} exposicions. Les trobaràs dia a dia en aquesta pàgina, cadascuna amb el seu enllaç oficial. Llegit el ${at}.`,
      fairs: (n, list, christmas, fairsRead) =>
        `Sí: el calendari oficial de fires de la Generalitat (llegit el ${fairsRead}) n'hi té ${n}${list ? `: ${list}` : ""}.${christmas > 0 ? ` A més, hi ha fires de Nadal obertes a ${christmas} ${christmas === 1 ? "municipi" : "municipis"}.` : ""}`,
      fairsNone: (christmas, fairsRead) =>
        `El calendari oficial de fires de la Generalitat (llegit el ${fairsRead}) no en té cap per a aquestes dates.${christmas > 0 ? ` Sí que hi ha fires de Nadal obertes a ${christmas} ${christmas === 1 ? "municipi" : "municipis"}, llistades en aquesta pàgina.` : ""}`,
      sources: (sources, agendaRead, fairsRead) =>
        `Activitats: ${sources}. Fires: calendari de fires de la Generalitat (Departament d'Empresa i Treball), llegit el ${fairsRead}. ${agendaRead ? `L'agenda es va llegir el ${agendaRead} i la pàgina l'actualitza cada hora` : "Ara no hem pogut llegir l'agenda oficial d'aquest cap de setmana"}; mai no mostrem la d'un altre cap de setmana. Els noms, els horaris i els preus són els de l'organisme que els publica.`,
    },
  },
  es: {
    heading: (long) => (long ? "Datos clave del puente" : "Datos clave de este fin de semana"),
    caption: (where) => `Qué cubre esta página ${where}, cuántas actividades hay y de dónde salen los datos`,
    labels: { dates: "Fechas", agenda: "Actividades en la agenda oficial", fairs: "Ferias del calendario oficial", christmas: "Mercados de Navidad abiertos", sources: "Fuentes", read: "Leído" },
    agendaCounts: (c) => `${c.all} (${c.free} gratuitas, ${c.family} con niños, ${c.fairs} ferias y mercados, ${c.music} de música, ${c.exhibitions} exposiciones)`,
    agendaEmpty: "Ninguna actividad para los días que quedan",
    agendaUnread: "No hemos podido leer la agenda oficial ahora, y no mostramos la de otro fin de semana",
    fairsCount: (n) => `${n} (lista más abajo)`,
    fairsNone: "Ninguna para estas fechas",
    christmas: (n) => (n === 1 ? "1 municipio (lista más abajo)" : `${n} municipios (lista más abajo)`),
    sourceNames: {
      gencat: "Agenda Cultural de Catalunya (Generalitat de Catalunya, Departament de Cultura)",
      bcn: "Guia Barcelona (Ayuntamiento de Barcelona, Open Data BCN)",
      fairs: "Calendario de ferias (Generalitat de Catalunya, Departament d'Empresa i Treball)",
    },
    readLive: (agenda, fairs) => `Agenda: ${agenda}, y se actualiza cada hora. Calendario de ferias: ${fairs}.`,
    readHeld: (agenda, fairs) => `Agenda: última lectura el ${agenda} (la fuente no responde ahora; es de este mismo fin de semana). Calendario de ferias: ${fairs}.`,
    readNone: (fairs) => `Agenda: sin lectura de este fin de semana. Calendario de ferias: ${fairs}.`,
    faqHeading: "Preguntas frecuentes",
    q: {
      activities: (w, long) => `¿Qué actividades hay ${long ? "este puente" : "este fin de semana"} ${w}?`,
      fairs: (w, long) => `¿Hay ferias ${long ? "este puente" : "este fin de semana"} ${w}?`,
      sources: "¿De dónde sale esta información y cuándo se ha leído?",
    },
    a: {
      activities: (c, dates, at) =>
        `La agenda oficial lista ${c.all} actividades ${dates}: ${c.free} gratuitas, ${c.family} con niños, ${c.music} de música y ${c.exhibitions} exposiciones. Las encontrarás día a día en esta página, cada una con su enlace oficial. Leído el ${at}.`,
      fairs: (n, list, christmas, fairsRead) =>
        `Sí: el calendario oficial de ferias de la Generalitat (leído el ${fairsRead}) tiene ${n}${list ? `: ${list}` : ""}.${christmas > 0 ? ` Además, hay mercados de Navidad abiertos en ${christmas} ${christmas === 1 ? "municipio" : "municipios"}.` : ""}`,
      fairsNone: (christmas, fairsRead) =>
        `El calendario oficial de ferias de la Generalitat (leído el ${fairsRead}) no tiene ninguna para estas fechas.${christmas > 0 ? ` Sí hay mercados de Navidad abiertos en ${christmas} ${christmas === 1 ? "municipio" : "municipios"}, listados en esta página.` : ""}`,
      sources: (sources, agendaRead, fairsRead) =>
        `Actividades: ${sources}. Ferias: calendario de ferias de la Generalitat (Departament d'Empresa i Treball), leído el ${fairsRead}. ${agendaRead ? `La agenda se leyó el ${agendaRead} y la página la actualiza cada hora` : "Ahora no hemos podido leer la agenda oficial de este fin de semana"}; nunca mostramos la de otro fin de semana. Los nombres, los horarios y los precios son los del organismo que los publica.`,
    },
  },
  en: {
    heading: (long) => (long ? "Key facts for this long weekend" : "Key facts for this weekend"),
    caption: (where) => `What this page covers ${where}, how many activities there are and where the data comes from`,
    labels: { dates: "Dates", agenda: "Activities in the official agenda", fairs: "Fairs in the official calendar", christmas: "Christmas markets open", sources: "Sources", read: "Read" },
    agendaCounts: (c) => `${c.all} (${c.free} free, ${c.family} for children, ${c.fairs} fairs and markets, ${c.music} music, ${c.exhibitions} exhibitions)`,
    agendaEmpty: "None for the days left",
    agendaUnread: "We cannot read the official agenda right now, and we do not show another weekend's instead",
    fairsCount: (n) => `${n} (listed below)`,
    fairsNone: "None for these dates",
    christmas: (n) => (n === 1 ? "1 municipality (listed below)" : `${n} municipalities (listed below)`),
    sourceNames: {
      gencat: "Agenda Cultural de Catalunya (Generalitat de Catalunya, Departament de Cultura)",
      bcn: "Guia Barcelona (Ajuntament de Barcelona, Open Data BCN)",
      fairs: "Fairs calendar (Generalitat de Catalunya, Departament d'Empresa i Treball)",
    },
    readLive: (agenda, fairs) => `Agenda: ${agenda}, refreshed every hour. Fairs calendar: ${fairs}.`,
    readHeld: (agenda, fairs) => `Agenda: last read on ${agenda} (the source is not answering now; it is for this same weekend). Fairs calendar: ${fairs}.`,
    readNone: (fairs) => `Agenda: no read for this weekend. Fairs calendar: ${fairs}.`,
    faqHeading: "Frequently asked questions",
    q: {
      activities: (w, long) => `What is on ${w} this ${long ? "long weekend" : "weekend"}?`,
      fairs: (w, long) => `Are there any fairs ${w} this ${long ? "long weekend" : "weekend"}?`,
      sources: "Where does this information come from and when was it read?",
    },
    a: {
      activities: (c, dates, at) =>
        `The official agenda lists ${c.all} activities ${dates}: ${c.free} free, ${c.family} for children, ${c.music} music and ${c.exhibitions} exhibitions. You will find them day by day on this page, each with its official link. Read on ${at}.`,
      fairs: (n, list, christmas, fairsRead) =>
        `Yes: the Generalitat's official fairs calendar (read on ${fairsRead}) has ${n}${list ? `: ${list}` : ""}.${christmas > 0 ? ` Christmas markets are also open in ${christmas} ${christmas === 1 ? "municipality" : "municipalities"}.` : ""}`,
      fairsNone: (christmas, fairsRead) =>
        `The Generalitat's official fairs calendar (read on ${fairsRead}) has none for these dates.${christmas > 0 ? ` Christmas markets are open in ${christmas} ${christmas === 1 ? "municipality" : "municipalities"}, listed on this page.` : ""}`,
      sources: (sources, agendaRead, fairsRead) =>
        `Activities: ${sources}. Fairs: the Generalitat's fairs calendar (Departament d'Empresa i Treball), read on ${fairsRead}. ${agendaRead ? `The agenda was read on ${agendaRead} and the page refreshes it every hour` : "We cannot read the official agenda for this weekend right now"}; we never show another weekend's. Names, times and prices are the publisher's own.`,
    },
  },
};

/** "Del divendres 27 de novembre al diumenge 29 de novembre de 2026", the way each page's date line writes it. */
export function datesText(window: { from: string; to: string }, locale: Locale): string {
  if (locale === "en") return `${dayHeading(window.from, "en")} – ${dayHeading(window.to, "en")} ${window.to.slice(0, 4)}`;
  const day = (iso: string) => `${WEEKDAY_NAMES[locale][new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${shortDate(iso, locale)}`;
  return `Del ${day(window.from)} al ${day(window.to)} de ${window.to.slice(0, 4)}`;
}

/** "entre el divendres 27 de novembre i el diumenge 29 de novembre de 2026": the same dates inside a sentence. */
export function spanText(window: { from: string; to: string }, locale: Locale): string {
  const day = (iso: string) => `${WEEKDAY_NAMES[locale][new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${shortDate(iso, locale)}`;
  const year = window.to.slice(0, 4);
  if (locale === "ca") return `entre el ${day(window.from)} i el ${day(window.to)} de ${year}`;
  if (locale === "es") return `entre el ${day(window.from)} y el ${day(window.to)} de ${year}`;
  return `from ${dayHeading(window.from, "en")} to ${dayHeading(window.to, "en")} ${year}`;
}

/** Up to three fairs by name, town and dates, as the calendar gives them. */
function fairList(fairs: readonly SnapshotFair[], locale: Locale): string {
  const shown = fairs.slice(0, 3).map((f) => `${f.name} (${f.town}, ${itemRange(f.start, f.end, locale)})`);
  const more = fairs.length - shown.length;
  const tail = more > 0 ? (locale === "en" ? ` and ${more} more` : locale === "es" ? ` y ${more} más` : ` i ${more} més`) : "";
  return `${shown.join("; ")}${tail}`;
}

export function weekendFacts(input: FactsInput): WeekendFacts {
  const { locale, window } = input;
  const c = COPY[locale];
  const readSources = input.sources.filter((s) => s.view.read);
  const counts = readSources.length > 0 ? buildView(input.items, window, input.today).counts : null;
  const fairsRead = stamp(SNAPSHOT.readOn, locale);
  const dates = datesText(window, locale);
  const names = readSources.map((s) => c.sourceNames[s.source]);
  const sourceLabel = names.length > 0 ? join(names, locale === "en" ? "and" : locale === "es" ? "y" : "i") : null;

  const newest = readSources.map((s) => s.view.read!.fetchedAt).sort().at(-1) ?? null;
  const held = readSources.some((s) => s.view.status === "kept" || s.view.status === "snapshot");
  const agendaRead = newest ? stamp(newest, locale) : null;

  const rows: FactRow[] = [{ key: "dates", label: c.labels.dates, value: dates }];
  rows.push({
    key: "agenda",
    label: c.labels.agenda,
    value: !counts ? c.agendaUnread : counts.all === 0 ? c.agendaEmpty : c.agendaCounts(counts),
  });
  rows.push({ key: "fairs", label: c.labels.fairs, value: input.fairs.length > 0 ? c.fairsCount(input.fairs.length) : c.fairsNone });
  if (input.christmasTowns > 0) rows.push({ key: "christmas", label: c.labels.christmas, value: c.christmas(input.christmasTowns) });
  const links = [
    ...readSources.map((s) => ({ label: c.sourceNames[s.source], href: s.source === "bcn" ? BCN_SOURCE.guide[locale] : GENCAT_SOURCE.url })),
    { label: c.sourceNames.fairs, href: SNAPSHOT.sources.fairs.url },
  ];
  rows.push({ key: "sources", label: c.labels.sources, value: links.map((l) => l.label).join(" · "), links });
  rows.push({
    key: "read",
    label: c.labels.read,
    value: !agendaRead ? c.readNone(fairsRead) : held ? c.readHeld(agendaRead, fairsRead) : c.readLive(agendaRead, fairsRead),
  });

  const faq: FactsFaqItem[] = [];
  if (counts && counts.all > 0 && agendaRead) {
    faq.push({ question: c.q.activities(input.where, window.long), answer: c.a.activities(counts, spanText(window, locale), agendaRead) });
  }
  faq.push({
    question: c.q.fairs(input.where, window.long),
    answer: input.fairs.length > 0 ? c.a.fairs(input.fairs.length, fairList(input.fairs, locale), input.christmasTowns, fairsRead) : c.a.fairsNone(input.christmasTowns, fairsRead),
  });
  faq.push({ question: c.q.sources, answer: c.a.sources(sourceLabel ?? c.sourceNames.gencat, agendaRead, fairsRead) });

  return { heading: c.heading(window.long), caption: c.caption(input.where), rows, faqHeading: c.faqHeading, faq: faq.length >= 2 ? faq : [] };
}

/** The agenda a zone page lists: the Generalitat's items placed in the zone; Barcelona's own merged in first. */
export function zoneAgendaItems(zone: ZoneDef, agendas: { gencat: SourceView; bcn: SourceView }): { items: AgendaItem[]; sources: { source: AgendaSourceId; view: SourceView }[] } {
  const filter = zoneFilter(zone);
  const zoneItems = (agendas.gencat.read?.items ?? []).filter((i) => inPlace(i, filter));
  if (zone.id === "barcelona") {
    return {
      items: agendas.bcn.read ? mergeBarcelona(agendas.bcn.read.items, zoneItems) : zoneItems,
      sources: [
        { source: "bcn", view: agendas.bcn },
        { source: "gencat", view: agendas.gencat },
      ],
    };
  }
  return { items: zoneItems, sources: [{ source: "gencat", view: agendas.gencat }] };
}

interface Agendas {
  window: { from: string; to: string; long: boolean };
  today: string;
  gencat: SourceView;
  bcn: SourceView;
}

/** A zone page's facts: the zone's own list, never the wider zone it falls back to. */
export function zoneFacts(zone: ZoneDef, locale: Locale, agendas: Agendas, where: string): WeekendFacts {
  const { items, sources } = zoneAgendaItems(zone, agendas);
  const filter = zoneFilter(zone);
  return weekendFacts({
    locale,
    where,
    window: agendas.window,
    today: agendas.today,
    sources,
    items,
    fairs: listedFairs(zone, agendas.window).now,
    christmasTowns: christmasFairsThisWeekend(agendas.window, agendas.today, locale, filter).length,
  });
}

/** The Catalonia-wide page's facts. */
export function hubFacts(locale: Locale, agendas: Agendas, where: string): WeekendFacts {
  return weekendFacts({
    locale,
    where,
    window: agendas.window,
    today: agendas.today,
    sources: [{ source: "gencat", view: agendas.gencat }],
    items: agendas.gencat.read?.items ?? [],
    fairs: listedFairs(null, agendas.window).now,
    christmasTowns: christmasFairsThisWeekend(agendas.window, agendas.today, locale).length,
  });
}
