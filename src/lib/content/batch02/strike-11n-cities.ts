import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import {
  B2_TITLES,
  RELATED_HEADING,
  b2href,
  b2link,
  callout,
  faq,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Edition,
  type B2Source,
  type B2UnkeyedArticle,
} from "./shared";
import { STRIKE_11N_DATE, STRIKE_11N_URLS, nextDatesBlocks, strikePhase, type StrikePhase } from "./strike-11n";
import {
  CITIES,
  CITY_STATE_URLS,
  STATE_SERVICES,
  STRIKE_11N_CITIES_AS_OF,
  STRIKE_11N_CITIES_VERIFIED,
} from "./strike-11n-cities-data";
import type { CityService, CityServiceGroup, MsSlot, StateService, Strike11nCity } from "./strike-11n-cities-model";
import { CITY_TR, STATE_TR } from "./strike-11n-cities-i18n";
import { STRIKE_11N_CITY_REFS, STRIKE_11N_SPAIN_PATHS, strike11nCityHref, strike11nCityRef, type Strike11nCityKey } from "./strike-11n-city-paths";
import { cityNextBlocks } from "./strike-11n-next";
import { STRIKES, isUpcoming } from "./strikes";

/**
 * "Huelga general del 11 de noviembre en <ciudad>": one page per large city
 * outside Catalonia (6 Nov 2026), Spanish first; Catalan and English editions
 * since 10 Nov 2026 ("Vaga general de l'11 de novembre a <ciutat>", "General
 * strike on 11 November in <city>"), with the words of
 * `strike-11n-cities-i18n/<key>.ts` over the same Spanish facts.
 *
 * Why: the Spanish 11N page (`strike-11n.ts`) made 31% of all clicks on
 * 2-4 Nov 2026, but it answers for Catalonia, and Search Console shows about
 * five times the demand for the rest of Spain ("huelga 11 noviembre madrid",
 * "servicios mínimos huelga 11 noviembre metro valencia", "manifestación 11
 * noviembre sevilla"). Each page answers on its first screen what runs in that
 * city: metro, buses, tram, Cercanías, health, schools and public offices.
 *
 * Discipline (fact pack: research_notes/x10/strike-11n-cities-factpack.md):
 *  - Facts only from the BOE, the regional bulletins and governments, the
 *    operators' own notices and, for the call and demonstrations only, the
 *    unions' own sites. Nothing the press reports and no official page says.
 *  - Minimum services are a slot per service (`strike-11n-cities-data.ts`):
 *    "pending" prints who sets them and where they will appear; "published"
 *    prints the order's own figures with the link. Trains and flights are one
 *    State slot shared by every page.
 *  - Demonstrations only when the organisers themselves published the time
 *    and the place.
 *
 * HOW TO UPDATE: edit `strike-11n-cities-data.ts` (each service's
 * status, text and source; the State slots; demonstrations) and write the
 * same sentences, same links and figures, in `strike-11n-cities-i18n/<key>.ts`
 * (Catalan and English; `state.ts` for trains and flights), move
 * STRIKE_11N_CITIES_AS_OF to the day you checked, run the tests, deploy and
 * publish `?only=strike-11n-cities`. The day after the strike (12 Nov) move
 * the date again so the lead speaks in the past and record what was set: the
 * test "the city pages are brought up to date after the strike" fails from
 * 13 Nov until you do.
 */

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

export { STRIKE_11N_CITIES_AS_OF, STRIKE_11N_CITIES_VERIFIED };

export type CityMsState = "pending" | "partial" | "published";

/** Every slot on a city's page: its own services and the State's trains and flights. */
function allSlots(city: Strike11nCity, state: Record<string, StateService>): MsSlot[] {
  return [...city.services, ...Object.values(state)];
}

export function cityMsState(city: Strike11nCity, state: Record<string, StateService> = STATE_SERVICES): CityMsState {
  const slots = allSlots(city, state);
  const published = slots.filter((slot) => slot.status === "published").length;
  if (published === 0) return "pending";
  return published === slots.length ? "published" : "partial";
}

/** Whether any of the city's own services (the regional order) is out. */
export function regionalOrderPublished(city: Strike11nCity): boolean {
  return city.services.some((service) => service.status === "published");
}

/**
 * True once `today` is past 12 November (the day after the strike) and the
 * pages still speak from before the strike: the strike watch must record what
 * was set and move STRIKE_11N_CITIES_AS_OF.
 */
export function isCityPagesStale(today: string, asOf: string = STRIKE_11N_CITIES_AS_OF): boolean {
  return today > "2026-11-12" && asOf <= STRIKE_11N_DATE;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const U = { ...STRIKE_11N_URLS, ...CITY_STATE_URLS };
const link = (href: string, label: string) => `[${label}](${href})`;
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** Catalan "de" before a word: "de metro", "d'autobusos". */
const deCa = (text: string) => (/^[aeiouàèéíòóúh]/i.test(text) ? `d'${text}` : `de ${text}`);

/** The sources every city page cites: the call, the law, the State's lists, Renfe and Aena. */
export const NATIONAL_SOURCES: B2Source[] = [
  { name: "Registro de la huelga general del 11N (19/10/2026)", url: U.ccooRegistered, publisher: "CCOO" },
  { name: "Convocamos huelga general para el 11 de noviembre (07/10/2026)", url: U.ccooCall, publisher: "CCOO" },
  { name: "Huelga general de 24 horas este 11 de noviembre", url: U.ugt, publisher: "UGT" },
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "BOE" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo (artículos 3, 4, 6 y 10)", url: U.rdl17, publisher: "BOE" },
  {
    name: "Real Decreto 1479/1988, de 9 de diciembre, normas para garantizar el funcionamiento de los servicios esenciales en la Administración del Estado durante una huelga",
    url: U.rd1479,
    publisher: "BOE",
  },
  {
    name: "Resolución de 30 de octubre de 2026, de la Secretaría de Estado de Seguridad: personal de seguridad privada en los servicios esenciales durante la huelga general del 11 de noviembre de 2026 (BOE núm. 274, 4 de noviembre)",
    url: U.securityOrder,
    publisher: "BOE",
  },
  {
    name: "Orden INT/1170/2026, de 5 de noviembre: servicios esenciales en Correos durante las huelgas del 11 de noviembre de 2026 (BOE, 6 de noviembre)",
    url: U.correosOrder,
    publisher: "BOE",
  },
  { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
  { name: "Resoluciones de servicios mínimos (transporte aéreo)", url: U.ministryAir, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
  { name: "Renfe", url: U.renfe, publisher: "Renfe" },
  { name: "Infovuelos", url: U.aena, publisher: "Aena" },
  { name: "SEMAF continúa convocando huelgas los días 10 y 12 de noviembre en el Grupo Renfe (nº 2026-51, 29/10/2026)", url: U.semaf1012, publisher: "SEMAF" },
  { name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" },
];

/** Every source a city page cites, once: published orders first, then the city's own, then the national ones. */
export function citySources(city: Strike11nCity, state: Record<string, StateService> = STATE_SERVICES): B2Source[] {
  const seen = new Set<string>();
  const all: B2Source[] = [];
  const published = allSlots(city, state).flatMap((slot) => (slot.status === "published" && slot.source ? [slot.source] : []));
  for (const source of [...published, ...city.sources, ...NATIONAL_SOURCES]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher ?? null });
  }
  return all;
}

/* -------------------------------------------------------------------------- */
/* Catalan and English editions (10 Nov 2026)                                 */
/* -------------------------------------------------------------------------- */

/**
 * The city in one language: the Spanish facts (status, sources) with the
 * Catalan or English words of `strike-11n-cities-i18n/<key>.ts`. A published
 * Spanish slot with no translated sentence keeps the Spanish one, so a page
 * never loses a figure; the test "the Catalan and English words match the
 * Spanish facts" fails until the sentence is written.
 */
export function localizeCity(city: Strike11nCity, locale: Locale): Strike11nCity {
  if (locale === "es") return city;
  const tr = CITY_TR[city.key]?.[locale];
  const ref = strike11nCityRef(city.key);
  if (!tr) return { ...city, name: ref.names[locale], path: ref.paths[locale] };
  return {
    ...city,
    name: ref.names[locale],
    path: ref.paths[locale],
    titleTransport: tr.titleTransport,
    transportShort: tr.transportShort,
    authority: tr.authority,
    authorityShort: tr.authorityShort,
    bulletin: tr.bulletin,
    cercanias: tr.cercanias,
    airport: tr.airport,
    ...(city.airNotes ? { airNotes: tr.airNotes ?? city.airNotes } : {}),
    msSummary: city.msSummary === null ? null : (tr.msSummary ?? city.msSummary),
    msNotes: tr.msNotes,
    railNotes: tr.railNotes,
    school: tr.school,
    schoolShort: tr.schoolShort,
    demos: tr.demos,
    demoShort: city.demoShort === null ? null : (tr.demoShort ?? city.demoShort),
    demoWhere: tr.demoWhere,
    callNotes: tr.callNotes,
    services: city.services.map((service) => {
      const t = tr.services[service.id];
      if (!t) return service;
      const { question, notes, ...rest } = service;
      void question;
      void notes;
      return {
        ...rest,
        name: t.name,
        setBy: t.setBy,
        pending: t.pending,
        where: t.where,
        text: service.status === "published" ? (t.text ?? service.text) : null,
        ...(t.question ? { question: t.question } : {}),
        ...(t.notes ? { notes: t.notes } : {}),
      };
    }),
  };
}

/** The State's trains and flights in one language: the Spanish status and source, the translated words. */
export function localizeState(state: Record<string, StateService>, locale: Locale): Record<string, StateService> {
  if (locale === "es") return state;
  return Object.fromEntries(
    Object.entries(state).map(([key, slot]) => {
      const t = STATE_TR[locale][key as "rail" | "air"];
      if (!t) return [key, slot];
      return [key, { ...slot, setBy: t.setBy, pending: t.pending, text: slot.status === "published" ? (t.text ?? slot.text) : null }];
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

export const SEO_TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

function firstFit(candidates: string[], limit: number): string {
  return candidates.find((candidate) => candidate.length <= limit) ?? candidates[candidates.length - 1]!;
}

/** "Huelga general del 11 de noviembre en Madrid: servicios mínimos y qué funciona" (the H1). `city` in `locale` (localizeCity). */
export function cityTitle(city: Strike11nCity, locale: Locale = "es"): string {
  return {
    es: `Huelga general del 11 de noviembre en ${city.name}: servicios mínimos y qué funciona`,
    ca: `Vaga general de l'11 de novembre a ${city.name}: serveis mínims i què funciona`,
    en: `General strike on 11 November in ${city.name}: minimum services and what runs`,
  }[locale];
}

/** The searched words first: "huelga 11 noviembre madrid", then the services. */
export function citySeoTitle(city: Strike11nCity, locale: Locale = "es"): string {
  const candidates: Record<Locale, string[]> = {
    es: [
      `Huelga 11 noviembre ${city.name}: servicios mínimos de ${city.titleTransport}`,
      `Huelga 11 de noviembre en ${city.name}: servicios mínimos`,
      `Huelga 11 noviembre ${city.name}: servicios mínimos`,
      `Huelga 11N ${city.name}: servicios mínimos`,
    ],
    ca: [
      `Vaga 11 novembre ${city.name}: serveis mínims ${deCa(city.titleTransport)}`,
      `Vaga 11 de novembre a ${city.name}: serveis mínims`,
      `Vaga 11 novembre ${city.name}: serveis mínims`,
      `Vaga 11N ${city.name}: serveis mínims`,
    ],
    en: [
      `${city.name} strike 11 November: ${city.titleTransport} minimum services`,
      `General strike 11 November in ${city.name}: minimum services`,
      `${city.name} strike 11 November: minimum services`,
      `11N strike in ${city.name}: minimum services`,
    ],
  };
  return firstFit(candidates[locale], SEO_TITLE_LIMIT);
}

/** Answer-first: the day, the hours, and where minimum services stand. */
export function cityDescription(
  city: Strike11nCity,
  asOf: string = STRIKE_11N_CITIES_AS_OF,
  state: Record<string, StateService> = STATE_SERVICES,
  locale: Locale = "es",
): string {
  void state;
  const published = city.services.filter((service) => service.status === "published").length;
  const which = published === 0 ? 0 : published === city.services.length ? 2 : 1;
  const past = strikePhase(asOf) === "past";
  if (locale === "ca") {
    const services = `${city.titleTransport}, sanitat i escoles`;
    if (past) {
      return firstFit(
        [
          `La vaga general de l'11 de novembre de 2026 a ${city.name}: qui la va convocar, els serveis mínims ${deCa(services)}, i què diu la llei.`,
          `La vaga general de l'11 de novembre de 2026 a ${city.name}: qui la va convocar, els serveis mínims i què diu la llei.`,
        ],
        DESCRIPTION_LIMIT,
      );
    }
    const status = ["encara no publicats", "publicats en part", "ja publicats"][which];
    return firstFit(
      [
        `Vaga general el dimecres 11 de novembre de 2026 a ${city.name}, 24 hores. Serveis mínims ${deCa(services)}: ${status}.`,
        `Vaga general el dimecres 11 de novembre de 2026 a ${city.name}, 24 hores. Serveis mínims ${deCa(city.titleTransport)}: ${status}.`,
        `Vaga general el dimecres 11 de novembre de 2026 a ${city.name}. Serveis mínims: ${status}.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  if (locale === "en") {
    const services = `${city.titleTransport}, healthcare and schools`;
    if (past) {
      return firstFit(
        [
          `The general strike of 11 November 2026 in ${city.name}: who called it, the minimum services for ${services}, and what the law says.`,
          `The general strike of 11 November 2026 in ${city.name}: who called it, the minimum services and what the law says.`,
        ],
        DESCRIPTION_LIMIT,
      );
    }
    const status = ["not published yet", "partly published", "published"][which];
    return firstFit(
      [
        `General strike on Wednesday 11 November 2026 in ${city.name}, 24 hours. Minimum services for ${services}: ${status}.`,
        `General strike on Wednesday 11 November 2026 in ${city.name}, 24 hours. Minimum services for ${city.titleTransport}: ${status}.`,
        `General strike on Wednesday 11 November 2026 in ${city.name}. Minimum services: ${status}.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  // The city's own services only: Cercanías is the State's, and the status below is the city's.
  const services = `${city.titleTransport}, sanidad y colegios`;
  if (past) {
    return firstFit(
      [
        `La huelga general del 11 de noviembre de 2026 en ${city.name}: quién la convocó, los servicios mínimos de ${services}, y qué dice la ley.`,
        `La huelga general del 11 de noviembre de 2026 en ${city.name}: quién la convocó, los servicios mínimos y qué dice la ley.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  const status = ["aún no publicados", "publicados en parte", "ya publicados"][which];
  return firstFit(
    [
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}, 24 horas. Servicios mínimos de ${services}: ${status}.`,
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}, 24 horas. Servicios mínimos de ${city.titleTransport}: ${status}.`,
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}. Servicios mínimos: ${status}.`,
    ],
    DESCRIPTION_LIMIT,
  );
}

function cityExcerpt(city: Strike11nCity, locale: Locale): string {
  const cerc = city.cercanias ? ", Cercanías" : "";
  const candidates: Record<Locale, string[]> = {
    es: [
      `La huelga general del 11 de noviembre de 2026 en ${city.name}: servicios mínimos de ${city.titleTransport}${cerc}, sanidad y colegios, la manifestación y los derechos de quien hace huelga.`,
      `La huelga general del 11 de noviembre de 2026 en ${city.name}: servicios mínimos, manifestación y derechos de quien hace huelga.`,
    ],
    ca: [
      `La vaga general de l'11 de novembre de 2026 a ${city.name}: serveis mínims ${deCa(city.titleTransport)}${cerc}, sanitat i escoles, la manifestació i els drets de qui fa vaga.`,
      `La vaga general de l'11 de novembre de 2026 a ${city.name}: serveis mínims, manifestació i drets de qui fa vaga.`,
    ],
    en: [
      `The general strike of 11 November 2026 in ${city.name}: minimum services for ${city.titleTransport}${cerc}, healthcare and schools, the demonstration and strikers' rights.`,
      `The general strike of 11 November 2026 in ${city.name}: minimum services, the demonstration and strikers' rights.`,
    ],
  };
  return firstFit(candidates[locale], 200);
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Ctx {
  city: Strike11nCity;
  locale: Locale;
  asOf: string;
  /** "miércoles 11 de noviembre de 2026" */
  day: string;
  /** "6 de noviembre de 2026" */
  checked: string;
  /** "el 6 de noviembre de 2026", "l'11 de novembre de 2026", "on 6 November 2026" */
  on: string;
  phase: StrikePhase;
  state: CityMsState;
  rail: StateService;
  air: StateService;
}

/** One string per language, picked for the page's. */
const T = (c: Ctx, texts: Record<Locale, string>): string => texts[c.locale];

const NOT_PUBLISHED: Record<Locale, string> = { es: "Aún no publicados", ca: "Encara no publicats", en: "Not published yet" };
/** After the strike: what was not found is said as such, with no promise to add it. */
const NOT_FOUND: Record<Locale, string> = { es: "No localizamos la orden publicada", ca: "No vam localitzar l'ordre publicada", en: "We found no published order" };
/** Where the organisers announce the march; after the strike, without the promise to add it here. */
const demoWhereFor = (c: Ctx, text: string) =>
  c.phase === "past"
    ? text.replace(/(?:[:;,]\s*|\.\s+)(?:en cuanto|cuando|tan bon punt|quan|as soon as|once|when)\b[^.]*\.\s*$/i, ".")
    : text;
const notPublished = (c: Ctx) => (c.phase === "past" ? NOT_FOUND : NOT_PUBLISHED)[c.locale];

/** The convening organisations, as CCOO listed them on 19 Oct 2026. */
const CALLED_BY: Record<Locale, string> = {
  es: "CCOO y UGT, con CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas y la Unión de Actores y Actrices",
  ca: "CCOO i UGT, amb la CGT, la CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas i la Unión de Actores y Actrices",
  en: "CCOO and UGT, with CGT, CNT, Confederación Intersindical, CO.BAS, the Sindicato de Inquilinas tenants' union and the actors' union Unión de Actores y Actrices",
};

/** "consultado el 6 de noviembre de 2026" */
const checkedNote = (c: Ctx) =>
  c.phase === "past"
    ? T(c, { es: `última consulta ${c.on}`, ca: `última consulta ${c.on}`, en: `last checked ${c.on}` })
    : T(c, { es: `consultado ${c.on}`, ca: `consultat ${c.on}`, en: `checked ${c.on}` });

/** "**Servicios mínimos:** …", published or pending, for one slot. */
function msLine(c: Ctx, slot: MsSlot & { pending: string }): string {
  const label = T(c, { es: "**Servicios mínimos:**", ca: "**Serveis mínims:**", en: "**Minimum services:**" });
  return slot.status === "published" && slot.text
    ? `${label} ${slot.text}`
    : c.phase === "past"
      ? `${label} ${notPublished(c).toLowerCase()} (${checkedNote(c)}). ${demoWhereFor(c, slot.pending)}`
      : `${label} ${T(c, { es: "aún no publicados", ca: "encara no publicats", en: "not published yet" })} (${checkedNote(c)}). ${slot.pending}`;
}

/** The same answer as plain text, for the FAQ. */
function slotAnswer(c: Ctx, slot: MsSlot & { pending: string }, yes: string): string {
  return slot.status === "published" && slot.text
    ? `${yes} ${strip(slot.text)}`
    : c.phase === "past"
      ? `${yes} ${notPublished(c)} (${checkedNote(c)}). ${strip(demoWhereFor(c, slot.pending))}`
      : `${yes} ${T(c, {
        es: "Los servicios mínimos aún no se han publicado",
        ca: "Els serveis mínims encara no s'han publicat",
        en: "The minimum services have not been published yet",
      })} (${checkedNote(c)}). ${strip(slot.pending)}`;
}

const byGroup = (city: Strike11nCity, group: CityServiceGroup): CityService[] => city.services.filter((service) => service.group === group);

/** The SEMAF strike at Renfe either side of 11N, while it is still to come on the as-of date. */
const RENFE_NOV = STRIKES.find((strike) => strike.id === "vaga-renfe-2026-11-10");
/** 11 Nov 2026: SEMAF called off the 12th on 10 Nov; the wording follows the entry's days. */
const RENFE_12 = RENFE_NOV?.dates.includes("2026-11-12") ?? false;

function railName(city: Strike11nCity, locale: Locale = "es"): string {
  const trains = { es: "trenes de Renfe", ca: "trens de Renfe", en: "Renfe trains" }[locale];
  const and = { es: "y", ca: "i", en: "and" }[locale];
  return city.cercanias ? `${city.cercanias} ${and} ${trains}` : cap(trains);
}

function andJoin(items: string[], locale: Locale = "es"): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${{ es: "y", ca: "i", en: "and" }[locale]} ${items[items.length - 1]}`;
}

function leadText(c: Ctx): string {
  const { city } = c;
  const n = city.name;
  if (c.phase === "past") {
    return T(c, {
      es: `**El ${c.day} hubo huelga general de 24 horas en toda España, también en ${n},** convocada por CCOO y UGT con CGT, CNT y otras organizaciones. En la tabla de más abajo están los servicios mínimos que se fijaron para cada servicio, con el enlace a cada orden.`,
      ca: `**El ${c.day} hi va haver vaga general de 24 hores a tot Espanya, també a ${n},** convocada per CCOO i UGT amb la CGT, la CNT i altres organitzacions. A la taula de més avall hi ha els serveis mínims que es van fixar per a cada servei, amb l'enllaç a cada ordre.`,
      en: `**On ${c.day} there was a 24-hour general strike across Spain, including ${n},** called by CCOO and UGT with CGT, CNT and other organisations. The table below shows the minimum services set for each service, with a link to each order.`,
    });
  }
  const first =
    c.phase === "today"
      ? T(c, {
          es: `**Hoy, ${c.day}, hay huelga general de 24 horas en toda España, también en ${n}:** la convocan CCOO y UGT, con CGT, CNT y otras organizaciones.`,
          ca: `**Avui, ${c.day}, hi ha vaga general de 24 hores a tot Espanya, també a ${n}:** la convoquen CCOO i UGT, amb la CGT, la CNT i altres organitzacions.`,
          en: `**Today, ${c.day}, there is a 24-hour general strike across Spain, including ${n}:** it is called by CCOO and UGT, with CGT, CNT and other organisations.`,
        })
      : T(c, {
          es: `**El ${c.day} hay huelga general de 24 horas en toda España, también en ${n}:** la convocan CCOO y UGT, con CGT, CNT y otras organizaciones.`,
          ca: `**El ${c.day} hi ha vaga general de 24 hores a tot Espanya, també a ${n}:** la convoquen CCOO i UGT, amb la CGT, la CNT i altres organitzacions.`,
          en: `**On ${c.day} there is a 24-hour general strike across Spain, including ${n}:** it is called by CCOO and UGT, with CGT, CNT and other organisations.`,
        });
  const cerc = city.cercanias;
  const statePending = [c.rail, c.air].some((slot) => slot.status !== "published");
  const missing = city.services.filter((service) => service.status !== "published").map((service) => service.name);
  let ms: string;
  if (c.state === "published") {
    ms = city.msSummary
      ? T(c, {
          es: ` **Los servicios mínimos de ${n} ya se han publicado:** ${city.msSummary}.`,
          ca: ` **Els serveis mínims de ${n} ja s'han publicat:** ${city.msSummary}.`,
          en: ` **${n}'s minimum services have been published:** ${city.msSummary}.`,
        })
      : T(c, {
          es: ` **Los servicios mínimos de ${n} ya se han publicado:** los tienes en la tabla de más abajo, servicio por servicio, con el enlace a cada orden.`,
          ca: ` **Els serveis mínims de ${n} ja s'han publicat:** els tens a la taula de més avall, servei per servei, amb l'enllaç a cada ordre.`,
          en: ` **${n}'s minimum services have been published:** they are in the table below, service by service, with a link to each order.`,
        });
  } else if (regionalOrderPublished(city)) {
    const head = city.msSummary
      ? T(c, {
          es: ` **Servicios mínimos en ${n} ya publicados:** ${city.msSummary}.`,
          ca: ` **Serveis mínims a ${n} ja publicats:** ${city.msSummary}.`,
          en: ` **Minimum services in ${n} already published:** ${city.msSummary}.`,
        })
      : T(c, {
          es: ` **Servicios mínimos en ${n} ya publicados:** los tienes en la tabla de más abajo, con el enlace a cada orden.`,
          ca: ` **Serveis mínims a ${n} ja publicats:** els tens a la taula de més avall, amb l'enllaç a cada ordre.`,
          en: ` **Minimum services in ${n} already published:** they are in the table below, with a link to each order.`,
        });
    const rest =
      missing.length > 0
        ? T(c, {
            es: ` Aún faltan los de ${andJoin(missing)}.`,
            ca: ` Encara falten: ${andJoin(missing, "ca")}.`,
            en: ` Still to come: ${andJoin(missing, "en")}.`,
          })
        : "";
    const stateLine = statePending
      ? T(c, {
          es: ` Los de ${cerc ? `${cerc}, los demás trenes de Renfe y los vuelos` : "los trenes de Renfe y los vuelos"} los fija el Ministerio de Transportes y aún no se han publicado (${checkedNote(c)}).`,
          ca: ` Els de ${cerc ? `${cerc}, els altres trens de Renfe i els vols` : "els trens de Renfe i els vols"} els fixa el Ministeri de Transports i encara no s'han publicat (${checkedNote(c)}).`,
          en: ` Those for ${cerc ? `${cerc}, other Renfe trains and flights` : "Renfe trains and flights"} are set by the Ministry of Transport and have not been published yet (${checkedNote(c)}).`,
        })
      : "";
    ms = `${head}${rest}${stateLine}`;
  } else if (c.state === "pending") {
    ms = T(c, {
      es: ` **Servicios mínimos en ${n}: aún no publicados** (${checkedNote(c)}). Los de ${city.transportShort}, sanidad y colegios los fija ${city.authority}; ${cerc ? `los de ${cerc}, los demás trenes de Renfe y los vuelos` : "los de los trenes de Renfe y los vuelos"}, el Ministerio de Transportes. Los pondremos aquí, servicio por servicio, en cuanto salgan.`,
      ca: ` **Serveis mínims a ${n}: encara no publicats** (${checkedNote(c)}). Els ${deCa(city.transportShort)}, sanitat i escoles els fixa ${city.authority}; ${cerc ? `els de ${cerc}, els altres trens de Renfe i els vols` : "els dels trens de Renfe i els vols"}, el Ministeri de Transports. Els posarem aquí, servei per servei, tan bon punt surtin.`,
      en: ` **Minimum services in ${n}: not published yet** (${checkedNote(c)}). Those for ${city.transportShort}, healthcare and schools are set by ${city.authority}; those for ${cerc ? `${cerc}, other Renfe trains and flights` : "Renfe trains and flights"}, by the Ministry of Transport. We will add them here, service by service, as soon as they are out.`,
    });
  } else {
    ms = T(c, {
      es: ` **Servicios mínimos en ${n}: los de ${city.transportShort}, sanidad y colegios aún no se han publicado** (${checkedNote(c)}); los fija ${city.authority}. Los de los trenes y los vuelos, en la tabla de más abajo.`,
      ca: ` **Serveis mínims a ${n}: els ${deCa(city.transportShort)}, sanitat i escoles encara no s'han publicat** (${checkedNote(c)}); els fixa ${city.authority}. Els dels trens i els vols, a la taula de més avall.`,
      en: ` **Minimum services in ${n}: those for ${city.transportShort}, healthcare and schools have not been published yet** (${checkedNote(c)}); they are set by ${city.authority}. Trains and flights are in the table below.`,
    });
  }
  return `${first}${ms}`;
}

function keyFactItems(c: Ctx): { label: string; value: string }[] {
  const { city } = c;
  const n = city.name;
  const rail =
    c.rail.status === "published" && c.rail.text
      ? strip(c.rail.text)
      : T(c, {
          es: "Servicios mínimos aún no publicados: los fija el Ministerio de Transportes",
          ca: "Serveis mínims encara no publicats: els fixa el Ministeri de Transports",
          en: "Minimum services not published yet: set by the Ministry of Transport",
        });
  const renfeStrike =
    RENFE_NOV && isUpcoming(RENFE_NOV, c.asOf)
      ? RENFE_12
        ? T(c, {
            es: ". Además, SEMAF convoca huelga de maquinistas en Renfe el 10 y el 12 de noviembre",
            ca: ". A més, el SEMAF convoca vaga de maquinistes a Renfe el 10 i el 12 de novembre",
            en: ". SEMAF has also called a train drivers' strike at Renfe on 10 and 12 November",
          })
        : T(c, {
            es: ". Además, SEMAF convoca huelga de maquinistas en Renfe el 10 de noviembre (los paros del 12 se desconvocaron)",
            ca: ". A més, el SEMAF convoca vaga de maquinistes a Renfe el 10 de novembre (les aturades del 12 es van desconvocar)",
            en: ". SEMAF has also called a train drivers' strike at Renfe on 10 November (the 12th's stoppages were called off)",
          })
      : "";
  const ms = regionalOrderPublished(city)
    ? city.msSummary
      ? cap(strip(city.msSummary))
      : T(c, {
          es: `Publicados (${checkedNote(c)}): mira la tabla por servicios`,
          ca: `Publicats (${checkedNote(c)}): mira la taula per serveis`,
          en: `Published (${checkedNote(c)}): see the table by service`,
        })
    : c.phase === "past"
      ? `${notPublished(c)} (${checkedNote(c)})`
      : c.state === "pending"
      ? T(c, {
          es: `Aún no publicados (${checkedNote(c)}). Los fija ${city.authorityShort}`,
          ca: `Encara no publicats (${checkedNote(c)}). Els fixa ${city.authorityShort}`,
          en: `Not published yet (${checkedNote(c)}). Set by ${city.authorityShort}`,
        })
      : T(c, {
          es: `Los de ${n}, aún no publicados (${checkedNote(c)}). Los fija ${city.authorityShort}`,
          ca: `Els de ${n}, encara no publicats (${checkedNote(c)}). Els fixa ${city.authorityShort}`,
          en: `${n}'s own, not published yet (${checkedNote(c)}). Set by ${city.authorityShort}`,
        });
  return [
    { label: T(c, { es: "Día", ca: "Dia", en: "Day" }), value: cap(c.day) },
    {
      label: T(c, { es: "Horario", ca: "Horari", en: "Hours" }),
      value: T(c, {
        es: "De 0 a 24 h del miércoles 11. Donde se trabaja por turnos, desde el primer turno, aunque empiece antes de las 0 h, hasta el último",
        ca: "De 0 a 24 h del dimecres 11. On es treballa per torns, des del primer torn, encara que comenci abans de les 0 h, fins a l'últim",
        en: "From 0 to 24 h on Wednesday 11 November. Where people work in shifts, from the first shift, even if it starts before 0 h, to the last",
      }),
    },
    { label: T(c, { es: `Servicios mínimos en ${n}`, ca: `Serveis mínims a ${n}`, en: `Minimum services in ${n}` }), value: ms },
    { label: railName(city, c.locale), value: `${renfeStrike ? rail.replace(/\.$/, "") : rail}${renfeStrike}` },
    { label: T(c, { es: "Colegios", ca: "Escoles", en: "Schools" }), value: city.schoolShort },
    {
      label: T(c, { es: `Manifestación en ${n}`, ca: `Manifestació a ${n}`, en: `Demonstration in ${n}` }),
      value:
        city.demoShort ??
        T(c, {
          es: `Sin hora y lugar publicados por los convocantes para ${n} (${checkedNote(c)})`,
          ca: `Sense hora ni lloc publicats pels convocants per a ${n} (${checkedNote(c)})`,
          en: `No time or place published by the organisers for ${n} (${checkedNote(c)})`,
        }),
    },
    { label: T(c, { es: "Convocatoria", ca: "Convocatòria", en: "Called by" }), value: CALLED_BY[c.locale] },
  ];
}

function msTable(c: Ctx): Block {
  const { city } = c;
  const np = notPublished(c);
  const rows = [
    ...city.services.map((service) => [service.name, service.setBy, service.status === "published" && service.text ? service.text : np, service.where]),
    [
      railName(city, c.locale),
      c.rail.setBy,
      c.rail.status === "published" && c.rail.text ? c.rail.text : np,
      T(c, {
        es: `La resolución, en la ${link(U.ministryRail, "lista del Ministerio")}; los trenes que circulan, en ${link(U.renfe, "renfe.com")}`,
        ca: `La resolució, a la ${link(U.ministryRail, "llista del Ministeri")}; els trens que circulen, a ${link(U.renfe, "renfe.com")}`,
        en: `The resolution, in the ${link(U.ministryRail, "Ministry's list")}; the trains that run, on ${link(U.renfe, "renfe.com")}`,
      }),
    ],
    [
      T(c, { es: `Vuelos (aeropuerto de ${city.airport})`, ca: `Vols (aeroport de ${city.airport})`, en: `Flights (${city.airport} airport)` }),
      c.air.setBy,
      c.air.status === "published" && c.air.text ? (city.airNotes?.[0] ?? c.air.text) : np,
      T(c, {
        es: `La resolución, en la ${link(U.ministryAir, "lista del Ministerio")}; tu vuelo, en ${link(U.aena, "Infovuelos de Aena")} y en tu compañía aérea`,
        ca: `La resolució, a la ${link(U.ministryAir, "llista del Ministeri")}; el teu vol, a ${link(U.aena, "Infovuelos d'Aena")} i a la teva companyia aèria`,
        en: `The resolution, in the ${link(U.ministryAir, "Ministry's list")}; your flight, on ${link(U.aena, "Aena's Infovuelos")} and with your airline`,
      }),
    ],
  ];
  return table(
    T(c, {
      es: `Servicios mínimos del 11 de noviembre en ${city.name}: quién los fija y dónde se consultan`,
      ca: `Serveis mínims de l'11 de novembre a ${city.name}: qui els fixa i on es consulten`,
      en: `Minimum services on 11 November in ${city.name}: who sets them and where to check`,
    }),
    {
      es: ["Servicio", "Quién los fija", "Servicios mínimos", "Dónde se consultan"],
      ca: ["Servei", "Qui els fixa", "Serveis mínims", "On es consulten"],
      en: ["Service", "Set by", "Minimum services", "Where to check"],
    }[c.locale],
    rows,
    c.phase === "past"
      ? T(c, { es: `Última consulta el ${c.checked}.`, ca: `Última consulta ${c.on}.`, en: `Last checked on ${c.checked}.` })
      : T(c, {
      es: `Consultado el ${c.checked}. Cuando salga cada orden, la añadiremos a esta tabla con su enlace.`,
      ca: `Consultat ${c.on}. Quan surti cada ordre, l'afegirem a aquesta taula amb el seu enllaç.`,
      en: `Checked on ${c.checked}. When each order comes out, we will add it to this table with its link.`,
    }),
  );
}

function msIntro(c: Ctx): string[] {
  const { city } = c;
  const law = T(c, {
    es: `Los fija, para cada servicio, el gobierno del que depende, como prevé el ${link(U.rdl17, "artículo 10 del Real Decreto-ley 17/1977")}: «la Autoridad gubernativa podrá acordar las medidas necesarias para asegurar el funcionamiento de los servicios».`,
    ca: `Els fixa, per a cada servei, el govern del qual depèn, com preveu l'${link(U.rdl17, "article 10 del Reial decret llei 17/1977")}: «l'autoritat governativa podrà acordar les mesures necessàries per assegurar el funcionament dels serveis».`,
    en: `For each service they are set by the government it depends on, as ${link(U.rdl17, "Article 10 of Royal Decree-Law 17/1977")} provides: "the governmental authority may agree the measures necessary to ensure the functioning of the services".`,
  });
  if (c.state === "pending") {
    return [
      T(c, {
        es: `**${c.phase === "past" ? "No localizamos ninguna orden publicada." : "Aún no se han publicado."}** El ${c.checked} no había en ${city.bulletin} ninguna orden de servicios mínimos para el 11 de noviembre, ni ninguna resolución del Ministerio de Transportes. Los de ${city.transportShort}, la sanidad, los colegios y la administración autonómica los fija ${city.authority}; los de los trenes de Renfe y los vuelos, el Ministerio de Transportes.`,
        ca: `**${c.phase === "past" ? "No vam localitzar cap ordre publicada." : "Encara no s'han publicat."}** ${cap(c.on)} no hi havia a ${city.bulletin} cap ordre de serveis mínims per a l'11 de novembre, ni cap resolució del Ministeri de Transports. Els ${deCa(city.transportShort)}, la sanitat, les escoles i l'administració autonòmica els fixa ${city.authority}; els dels trens de Renfe i els vols, el Ministeri de Transports.`,
        en: `**${c.phase === "past" ? "We found no published order." : "Not published yet."}** ${cap(c.on)} there was no minimum-services order for 11 November in ${city.bulletin}, and no Ministry of Transport resolution. Those for ${city.transportShort}, healthcare, schools and the regional administration are set by ${city.authority}; those for Renfe trains and flights, by the Ministry of Transport.`,
      }),
      law,
    ];
  }
  return [
    T(c, {
      es: `Aquí tienes lo que fijan las órdenes y resoluciones publicadas, servicio por servicio, tal como estaban el ${c.checked}. En caso de duda, cuenta el texto oficial enlazado en cada fila.`,
      ca: `Aquí tens el que fixen les ordres i resolucions publicades, servei per servei, tal com estaven ${c.on}. En cas de dubte, val el text oficial enllaçat a cada fila.`,
      en: `Here is what the published orders and resolutions set, service by service, as they stood ${c.on}. If in doubt, the official text linked in each row is what counts.`,
    }),
    law,
  ];
}

function railParagraphs(c: Ctx): string[] {
  const cerc = c.city.cercanias;
  const renfe =
    RENFE_NOV && isUpcoming(RENFE_NOV, c.asOf)
      ? [
          RENFE_12
            ? T(c, {
                es: `**El 10 y el 12 de noviembre también hay huelga en Renfe:** el sindicato de maquinistas SEMAF la ha convocado en el Grupo Renfe, con un paro total el martes 10 y paros parciales el jueves 12, según ${link(U.semaf1012, "su comunicado del 29 de octubre")}.`,
                ca: `**El 10 i el 12 de novembre també hi ha vaga a Renfe:** el sindicat de maquinistes SEMAF l'ha convocada al Grup Renfe, amb una aturada total el dimarts 10 i aturades parcials el dijous 12, segons ${link(U.semaf1012, "el seu comunicat del 29 d'octubre")}.`,
                en: `**There is also a strike at Renfe on 10 and 12 November:** the train drivers' union SEMAF has called it across the Renfe Group, with a full stoppage on Tuesday 10 and partial stoppages on Thursday 12, according to ${link(U.semaf1012, "its statement of 29 October")}.`,
              })
            : T(c, {
                es: `**El 10 de noviembre también hay huelga en Renfe:** el sindicato de maquinistas SEMAF la ha convocado en el Grupo Renfe, con un paro total el martes 10, según ${link(U.semaf1012, "su comunicado del 29 de octubre")}. Los paros parciales del jueves 12 los desconvocó el 10 de noviembre y los sustituyó por una nueva huelga el lunes 23, según ${link(U.semaf23, "otro comunicado")}.`,
                ca: `**El 10 de novembre també hi ha vaga a Renfe:** el sindicat de maquinistes SEMAF l'ha convocada al Grup Renfe, amb una aturada total el dimarts 10, segons ${link(U.semaf1012, "el seu comunicat del 29 d'octubre")}. Les aturades parcials del dijous 12 les va desconvocar el 10 de novembre i les va substituir per una nova vaga el dilluns 23, segons ${link(U.semaf23, "un altre comunicat")}.`,
                en: `**There is also a strike at Renfe on 10 November:** the train drivers' union SEMAF has called it across the Renfe Group, with a full stoppage on Tuesday 10, according to ${link(U.semaf1012, "its statement of 29 October")}. It called off the partial stoppages of Thursday 12 on 10 November and replaced them with a new strike on Monday 23, according to ${link(U.semaf23, "a later statement")}.`,
              }),
        ]
      : [];
  return [
    msLine(c, c.rail),
    ...c.city.railNotes,
    T(c, {
      es: `${cerc ? `${cerc}, los` : "Los"} Media Distancia, el AVE y la larga distancia de Renfe son servicios del Estado: sus servicios mínimos los fija el Ministerio de Transportes por resolución, que publica en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}. Los trenes que circulan, en ${link(U.renfe, "renfe.com")}.`,
      ca: `${cerc ? `${cerc}, els` : "Els"} trens de Mitjana Distància, l'AVE i la llarga distància de Renfe són serveis de l'Estat: els seus serveis mínims els fixa el Ministeri de Transports per resolució, que publica a la seva ${link(U.ministryRail, "llista de resolucions de serveis mínims ferroviaris")}. Els trens que circulen, a ${link(U.renfe, "renfe.com")}.`,
      en: `${cerc ? `${cerc} and Renfe's` : "Renfe's"} Media Distancia, AVE and long-distance trains are State services: their minimum services are set by the Ministry of Transport by resolution, published in its ${link(U.ministryRail, "list of rail minimum-services resolutions")}. The trains that run are on ${link(U.renfe, "renfe.com")}.`,
    }),
    ...renfe,
  ];
}

function airParagraphs(c: Ctx): string[] {
  return [
    msLine(c, c.air),
    ...(c.air.status === "published" ? (c.city.airNotes ?? []) : []),
    T(c, {
      es: `En los aeropuertos y las compañías aéreas los fija el Ministerio de Transportes, que publica sus resoluciones en su ${link(U.ministryAir, "página de servicios mínimos del transporte aéreo")}. El estado de tu vuelo, en ${link(U.aena, "Infovuelos de Aena")} y en tu compañía aérea.`,
      ca: `Als aeroports i les companyies aèries els fixa el Ministeri de Transports, que publica les seves resolucions a la seva ${link(U.ministryAir, "pàgina de serveis mínims del transport aeri")}. L'estat del teu vol, a ${link(U.aena, "Infovuelos d'Aena")} i a la teva companyia aèria.`,
      en: `At airports and airlines they are set by the Ministry of Transport, which publishes its resolutions on its ${link(U.ministryAir, "air transport minimum-services page")}. Check your flight on ${link(U.aena, "Aena's Infovuelos")} and with your airline.`,
    }),
    T(c, {
      es: `**Vigilantes de seguridad:** el Ministerio del Interior ya ha fijado los de la seguridad privada. En los «transportes públicos (puertos, aeropuertos, ferrocarriles, etc.)», el 90% del personal de seguridad, según ${link(U.securityOrder, "la resolución de la Secretaría de Estado de Seguridad del 30 de octubre")}, publicada en el BOE el 4 de noviembre.`,
      ca: `**Vigilants de seguretat:** el Ministeri de l'Interior ja ha fixat els de la seguretat privada. Als «transports públics (ports, aeroports, ferrocarrils, etc.)», el 90% del personal de seguretat, segons ${link(U.securityOrder, "la resolució de la Secretaria d'Estat de Seguretat del 30 d'octubre")}, publicada al BOE el 4 de novembre.`,
      en: `**Security guards:** the Ministry of the Interior has already set those for private security. In "public transport (ports, airports, railways, etc.)", 90% of security staff, under ${link(U.securityOrder, "the Secretariat of State for Security's resolution of 30 October")}, published in the BOE on 4 November.`,
    }),
  ];
}

/** The State's offices: Real Decreto 1479/1988, in force, read on the BOE. */
const STATE_OFFICES: Record<Locale, string> = {
  es: `**Oficinas del Estado** (ministerios, sus organismos autónomos, como el SEPE, y la Seguridad Social): según el ${link(U.rd1479, "Real Decreto 1479/1988")}, «las dependencias permanecerán abiertas durante la situación de huelga, salvo que por razones fundadas el Departamento, Organismo o Servicio decida su cierre», y se mantienen como servicios mínimos, entre otros, el registro de documentos, la información, la atención telefónica y los trámites cuyo plazo acabe ese día.`,
  ca: `**Oficines de l'Estat** (ministeris, els seus organismes autònoms, com el SEPE, i la Seguretat Social): segons el ${link(U.rd1479, "Reial decret 1479/1988")}, «les dependències romandran obertes durant la situació de vaga, llevat que per raons fonamentades el Departament, Organisme o Servei en decideixi el tancament», i es mantenen com a serveis mínims, entre d'altres, el registre de documents, la informació, l'atenció telefònica i els tràmits el termini dels quals acabi aquell dia.`,
  en: `**State offices** (ministries, their autonomous bodies such as the SEPE, and Social Security): under ${link(U.rd1479, "Royal Decree 1479/1988")}, "the premises will remain open during the strike, unless for well-founded reasons the Department, Body or Service decides to close them", and the minimum services kept include, among others, the document registry, information, telephone assistance and procedures whose deadline ends that day.`,
};

/** Correos: Orden INT/1170/2026 (BOE, 6 Nov 2026), for the postal vote of 29 November. */
const CORREOS: Record<Locale, string> = {
  es: `**Correos:** el Ministerio del Interior ha declarado esenciales los servicios del voto por correo para las elecciones del 29 de noviembre: las oficinas abren «en el horario habitual, turno de mañana, o de mañana y tarde en las que lo tengan establecido» para admitir solicitudes y votos por correo y entregar la documentación electoral, con 1 a 3 empleados por turno según su plantilla (${link(U.correosOrder, "Orden INT/1170/2026")}, BOE del 6 de noviembre). Cómo votar por correo, en ${b2link("postalVote", "es", "nuestra guía del voto por correo")}.`,
  ca: `**Correus:** el Ministeri de l'Interior ha declarat essencials els serveis del vot per correu per a les eleccions del 29 de novembre: les oficines obren «en l'horari habitual, torn de matí, o de matí i tarda en les que el tinguin establert» per admetre sol·licituds i vots per correu i lliurar la documentació electoral, amb d'1 a 3 empleats per torn segons la plantilla (${link(U.correosOrder, "Ordre INT/1170/2026")}, BOE del 6 de novembre). Com votar per correu, a ${b2link("postalVote", "ca", "la nostra guia del vot per correu")}.`,
  en: `**Correos (post offices):** the Ministry of the Interior has declared the postal-vote services for the 29 November elections essential: offices open "during their usual hours, morning shift, or morning and afternoon where they have them" to accept postal-vote applications and votes and to hand out the electoral documents, with 1 to 3 staff per shift depending on their workforce (${link(U.correosOrder, "Order INT/1170/2026")}, BOE of 6 November). How to vote by post, in ${b2link("postalVote", "en", "our postal vote guide")}.`,
};

function callParagraphs(c: Ctx): { intro: string; demands: string[]; notes: string[] } {
  return {
    intro: T(c, {
      es: `Es una huelga general de 24 horas en toda España. Según la convocatoria, tal como la recoge el BOE en la ${link(U.correosOrder, "orden de servicios mínimos de Correos")}, «tendrá lugar durante la jornada del día 11 de noviembre de 2026, comenzando a las 0 horas y terminando a las 24 horas», y donde hay varios turnos empieza con el primero, «aunque empiece antes de las 0 horas del día 11». CCOO informó el 19 de octubre de 2026 de que «ya está registrada» y la presentó ese día en el Ministerio de Trabajo y Economía Social, con UGT y «Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS, y Unión de Actores y Actrices» (${link(U.ccooRegistered, "CCOO")}).`,
      ca: `És una vaga general de 24 hores a tot Espanya. Segons la convocatòria, tal com la recull el BOE a l'${link(U.correosOrder, "ordre de serveis mínims de Correus")}, «tindrà lloc durant la jornada del dia 11 de novembre de 2026, i començarà a les 0 hores i acabarà a les 24 hores», i on hi ha diversos torns comença amb el primer, «encara que comenci abans de les 0 hores del dia 11». CCOO va informar el 19 d'octubre de 2026 que «ja està registrada» i la va presentar aquell dia al Ministeri de Treball i Economia Social, amb UGT i «Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS i Unión de Actores y Actrices» (${link(U.ccooRegistered, "CCOO")}).`,
      en: `It is a 24-hour general strike across Spain. According to the call, as the BOE records it in the ${link(U.correosOrder, "Correos minimum-services order")}, it "will take place during the day of 11 November 2026, starting at 0 hours and ending at 24 hours", and where there are several shifts it starts with the first, "even if it begins before 0 hours on the 11th". CCOO reported on 19 October 2026 that it "is now registered" and filed it that day with the Ministry of Labour and Social Economy, together with UGT and "Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS, and Unión de Actores y Actrices" (${link(U.ccooRegistered, "CCOO")}).`,
    }),
    demands: [
      T(c, {
        es: `**CCOO y UGT** (${link(U.ccooCall, "convocatoria del 7 de octubre")}): llaman a la huelga «para desbloquear la negociación colectiva» y para subir salarios, reducir la jornada, mejorar la salud de las personas trabajadoras y erradicar la precariedad, y piden a las administraciones «políticas que acaben con la especulación de la vivienda».`,
        ca: `**CCOO i UGT** (${link(U.ccooCall, "convocatòria del 7 d'octubre")}): criden a la vaga «per desbloquejar la negociació col·lectiva» i per apujar els salaris, reduir la jornada, millorar la salut de les persones treballadores i eradicar la precarietat, i demanen a les administracions «polítiques que acabin amb l'especulació de l'habitatge».`,
        en: `**CCOO and UGT** (${link(U.ccooCall, "call of 7 October")}): they call the strike "to unblock collective bargaining" and to raise wages, cut working hours, improve workers' health and eradicate job precariousness, and ask the authorities for "policies that put an end to housing speculation".`,
      }),
      T(c, {
        es: `**UGT** (${link(U.ugt, "ugt.es")}): «Reclamamos una subida del SMI de, al menos, un 7% en 2027».`,
        ca: `**UGT** (${link(U.ugt, "ugt.es")}): «Reclamem una pujada de l'SMI d'almenys un 7% el 2027».`,
        en: `**UGT** (${link(U.ugt, "ugt.es")}): "We demand a rise in the SMI minimum wage of at least 7% in 2027".`,
      }),
    ],
    notes: c.city.callNotes,
  };
}

const RIGHTS_INTRO: Record<Locale, string> = {
  es: `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». El artículo 6 del ${link(U.rdl17, "Real Decreto-ley 17/1977")} fija sus efectos:`,
  ca: `El dret de vaga el reconeix ${link(U.constitution, "l'article 28.2 de la Constitució")}: «Es reconeix el dret dels treballadors a la vaga per a la defensa dels seus interessos». L'article 6 del ${link(U.rdl17, "Reial decret llei 17/1977")} en fixa els efectes:`,
  en: `The right to strike is recognised by ${link(U.constitution, "Article 28.2 of the Spanish Constitution")}: "The right of workers to strike in defence of their interests is recognised". Article 6 of ${link(U.rdl17, "Royal Decree-Law 17/1977")} sets out its effects:`,
};

const RIGHTS: Record<Locale, string[]> = {
  es: [
    "**No te pueden despedir ni sancionar por hacer huelga:** «El ejercicio del derecho de huelga no extingue la relación de trabajo, ni puede dar lugar a sanción alguna, salvo que el trabajador, durante la misma, incurriera en falta laboral» (artículo 6.1).",
    "**Ese día no cobras:** «Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario» (artículo 6.2). UGT añade que el descuento «puede afectar proporcionalmente a determinados conceptos salariales vinculados a ese periodo», pero que la empresa «no puede imponerte un descuento adicional como castigo».",
    "**Seguridad Social:** sigues «en situación de alta especial en la Seguridad Social, con suspensión de la obligación de cotización por parte del empresario y del propio trabajador» (artículo 6.3).",
    "**Quien no quiera hacer huelga puede trabajar:** «Se respetará la libertad de trabajo de aquellos trabajadores que no quisieran sumarse a la huelga» (artículo 6.4).",
    "**La empresa no puede sustituirte** por personas que no estuvieran vinculadas a ella cuando se comunicó la huelga (artículo 6.5).",
    `**No tienes que avisar:** «No tienes obligación de comunicar previamente a tu empresa que vas a secundar una huelga legal», según ${link(U.ugt, "UGT")}. El preaviso lo dan los sindicatos convocantes: diez días naturales cuando la huelga afecta a servicios públicos (artículo 4 del Real Decreto-ley 17/1977).`,
    "**Servicios mínimos:** según UGT, que haya servicios mínimos «no significa que toda la plantilla tenga que trabajar»; si la empresa te designa, «comprueba qué horario debes cumplir y qué funciones tienes asignadas».",
    "**Teletrabajo:** para UGT, «si el 11 de noviembre te obligan a teletrabajar es una vulneración del derecho fundamental de la huelga que puede ser denunciada».",
  ],
  ca: [
    "**No et poden acomiadar ni sancionar per fer vaga:** «L'exercici del dret de vaga no extingeix la relació de treball, ni pot donar lloc a cap sanció, llevat que el treballador, durant la vaga, incorri en falta laboral» (article 6.1).",
    "**Aquell dia no cobres:** «Durant la vaga s'entendrà suspès el contracte de treball i el treballador no tindrà dret al salari» (article 6.2). UGT hi afegeix que el descompte «pot afectar proporcionalment determinats conceptes salarials vinculats a aquest període», però que l'empresa «no et pot imposar un descompte addicional com a càstig».",
    "**Seguretat Social:** continues «en situació d'alta especial a la Seguretat Social, amb suspensió de l'obligació de cotitzar per part de l'empresari i del mateix treballador» (article 6.3).",
    "**Qui no vulgui fer vaga pot treballar:** «Es respectarà la llibertat de treball dels treballadors que no vulguin sumar-se a la vaga» (article 6.4).",
    "**L'empresa no et pot substituir** per persones que no hi estiguessin vinculades quan es va comunicar la vaga (article 6.5).",
    `**No has d'avisar:** «No tens l'obligació de comunicar prèviament a la teva empresa que secundaràs una vaga legal», segons ${link(U.ugt, "UGT")}. El preavís el donen els sindicats convocants: deu dies naturals quan la vaga afecta serveis públics (article 4 del Reial decret llei 17/1977).`,
    "**Serveis mínims:** segons UGT, que hi hagi serveis mínims «no vol dir que tota la plantilla hagi de treballar»; si l'empresa et designa, «comprova quin horari has de complir i quines funcions tens assignades».",
    "**Teletreball:** per a UGT, «si l'11 de novembre t'obliguen a teletreballar és una vulneració del dret fonamental de vaga que es pot denunciar».",
  ],
  en: [
    `**You cannot be dismissed or sanctioned for striking:** "Exercising the right to strike does not end the employment relationship, nor may it give rise to any sanction, unless the worker commits a disciplinary offence during the strike" (Article 6.1).`,
    `**You are not paid for the day:** "During the strike the employment contract shall be deemed suspended and the worker shall not be entitled to wages" (Article 6.2). UGT adds that the deduction "may proportionally affect certain pay items linked to that period", but that your employer "cannot impose an additional deduction on you as a punishment".`,
    `**Social Security:** you remain "registered with Social Security under a special status, with the employer's and the worker's own obligation to pay contributions suspended" (Article 6.3).`,
    `**Anyone who does not want to strike can work:** "The freedom to work of those workers who do not wish to join the strike shall be respected" (Article 6.4).`,
    "**Your employer cannot replace you** with people who were not linked to the company when the strike was notified (Article 6.5).",
    `**You do not have to tell your employer:** "You have no obligation to tell your company in advance that you are going to join a legal strike", according to ${link(U.ugt, "UGT")}. Notice is given by the unions calling the strike: ten calendar days when it affects public services (Article 4 of Royal Decree-Law 17/1977).`,
    `**Minimum services:** according to UGT, minimum services "do not mean that the whole workforce has to work"; if your employer designates you, "check which hours you must work and which tasks you have been assigned".`,
    `**Remote work:** for UGT, "if on 11 November they force you to work from home, that is a violation of the fundamental right to strike that can be reported".`,
  ],
};

function faqItems(c: Ctx): { question: string; answer: string }[] {
  const { city } = c;
  const n = city.name;
  const loc = c.locale;
  const pendingCheck =
    c.phase === "past"
      ? T(c, {
          es: `no los localizamos publicados (${checkedNote(c)})`,
          ca: `no els vam localitzar publicats (${checkedNote(c)})`,
          en: `were not found published (${checkedNote(c)})`,
        })
      : T(c, {
          es: `aún no se han publicado (consultado el ${c.checked})`,
          ca: `encara no s'han publicat (${checkedNote(c)})`,
          en: `have not been published yet (${checkedNote(c)})`,
        });
  const willAdd = (text: string) => (c.phase === "past" ? "" : text);
  const asked = city.services.filter((service) => service.question);
  const schools = byGroup(city, "schools");
  const publishedNames = andJoin(
    [...city.services, c.rail, c.air]
      .filter((slot) => slot.status === "published")
      .map((slot) => ("name" in slot ? slot.name : slot.key === "rail" ? railName(city, loc) : T(c, { es: "vuelos", ca: "vols", en: "flights" }))),
    loc,
  );
  return [
    {
      question: T(c, { es: `¿Qué funciona el 11 de noviembre en ${n}?`, ca: `Què funciona l'11 de novembre a ${n}?`, en: `What runs on 11 November in ${n}?` }),
      answer:
        c.state === "pending"
          ? T(c, {
              es: `Los servicios esenciales, como el transporte público, la sanidad y los colegios, funcionan con los servicios mínimos que fije el gobierno del que dependen. Los de ${n} ${pendingCheck}: los de ${city.transportShort}, sanidad y colegios los fija ${strip(city.authority)}, y los de los trenes de Renfe y los vuelos, el Ministerio de Transportes.${willAdd(" Los pondremos en esta página en cuanto salgan.")}`,
              ca: `Els serveis essencials, com el transport públic, la sanitat i les escoles, funcionen amb els serveis mínims que fixi el govern del qual depenen. Els de ${n} ${pendingCheck}: els ${deCa(city.transportShort)}, sanitat i escoles els fixa ${strip(city.authority)}, i els dels trens de Renfe i els vols, el Ministeri de Transports.${willAdd(" Els posarem en aquesta pàgina tan bon punt surtin.")}`,
              en: `Essential services such as public transport, healthcare and schools run with the minimum services set by the government they depend on. ${n}'s ${pendingCheck}: those for ${city.transportShort}, healthcare and schools are set by ${strip(city.authority)}, and those for Renfe trains and flights by the Ministry of Transport.${willAdd(" We will add them to this page as soon as they are out.")}`,
            })
          : T(c, {
              es: `Los servicios esenciales funcionan con servicios mínimos. Los que ya se han publicado están en la tabla de esta página, servicio por servicio, con el enlace a cada orden: ${publishedNames}.`,
              ca: `Els serveis essencials funcionen amb serveis mínims. Els que ja s'han publicat són a la taula d'aquesta pàgina, servei per servei, amb l'enllaç a cada ordre: ${publishedNames}.`,
              en: `Essential services run with minimum services. Those already published are in the table on this page, service by service, with a link to each order: ${publishedNames}.`,
            }),
    },
    ...asked.map((service) => ({ question: service.question!, answer: slotAnswer(c, service, T(c, { es: "Sí, con servicios mínimos.", ca: "Sí, amb serveis mínims.", en: "Yes, with minimum services." })) })),
    ...(city.cercanias
      ? [
          {
            question: T(c, {
              es: `¿Hay ${city.cercanias} el 11 de noviembre?`,
              ca: `Hi ha ${city.cercanias} l'11 de novembre?`,
              en: `Is ${city.cercanias} running on 11 November?`,
            }),
            answer: slotAnswer(
              c,
              c.rail,
              T(c, {
                es: "Sí, con servicios mínimos, que fija el Ministerio de Transportes.",
                ca: "Sí, amb serveis mínims, que fixa el Ministeri de Transports.",
                en: "Yes, with minimum services set by the Ministry of Transport.",
              }),
            ),
          },
        ]
      : []),
    {
      question: T(c, {
        es: `¿Hay colegio el 11 de noviembre en ${n}?`,
        ca: `Hi ha escola l'11 de novembre a ${n}?`,
        en: `Are schools open on 11 November in ${n}?`,
      }),
      answer: [
        city.school ? strip(city.school) : city.schoolShort,
        ...schools.map((service) =>
          service.status === "published" && service.text
            ? `${T(c, { es: "Servicios mínimos:", ca: "Serveis mínims:", en: "Minimum services:" })} ${strip(service.text)}`
            : T(c, {
                es: `Los servicios mínimos de los colegios ${pendingCheck}.`,
                ca: `Els serveis mínims de les escoles ${pendingCheck}.`,
                en: `Minimum services for schools ${pendingCheck}.`,
              }),
        ),
      ].join(" "),
    },
    {
      question: T(c, {
        es: `¿Dónde es la manifestación del 11N en ${n}?`,
        ca: `On és la manifestació de l'11N a ${n}?`,
        en: `Where is the 11N demonstration in ${n}?`,
      }),
      answer:
        city.demos.length > 0
          ? city.demos.map(strip).join(" ")
          : T(c, {
              es: `El ${c.checked} los convocantes aún no habían publicado la hora ni el lugar de la manifestación en ${n}. ${strip(demoWhereFor(c, city.demoWhere))}`,
              ca: `${cap(c.on)} els convocants encara no havien publicat l'hora ni el lloc de la manifestació a ${n}. ${strip(demoWhereFor(c, city.demoWhere))}`,
              en: `${cap(c.on)} the organisers had not yet published the time or place of the demonstration in ${n}. ${strip(demoWhereFor(c, city.demoWhere))}`,
            }),
    },
    {
      question: T(c, {
        es: "¿Cuándo se publican los servicios mínimos del 11N?",
        ca: "Quan es publiquen els serveis mínims de l'11N?",
        en: "When are the 11N minimum services published?",
      }),
      answer: regionalOrderPublished(city)
        ? T(c, {
            es: `Los de ${n} ya se han publicado, al menos en parte: están en la tabla de esta página, con el enlace a cada orden. Los de los trenes y los vuelos los publica el Ministerio de Transportes en su web.`,
            ca: `Els de ${n} ja s'han publicat, almenys en part: són a la taula d'aquesta pàgina, amb l'enllaç a cada ordre. Els dels trens i els vols els publica el Ministeri de Transports al seu web.`,
            en: `${n}'s have been published, at least in part: they are in the table on this page, with a link to each order. Those for trains and flights are published by the Ministry of Transport on its website.`,
          })
        : T(c, {
            es: `Los fija ${strip(city.authorityShort)} por orden, y los de los trenes y los vuelos, el Ministerio de Transportes en su web. El ${c.checked} aún no se habían publicado.`,
            ca: `Els fixa ${strip(city.authorityShort)} per ordre, i els dels trens i els vols, el Ministeri de Transports al seu web. ${cap(c.on)} encara no s'havien publicat.`,
            en: `They are set by ${strip(city.authorityShort)} by order, and those for trains and flights by the Ministry of Transport on its website. ${cap(c.on)} they had not been published yet.`,
          }),
    },
    {
      question: T(c, { es: "¿Me descuentan el sueldo si hago huelga?", ca: "Em descompten el sou si faig vaga?", en: "Will I lose pay if I strike?" }),
      answer: T(c, {
        es: "Sí. Durante la huelga el contrato queda suspendido y no tienes derecho al salario (artículo 6.2 del Real Decreto-ley 17/1977), y ese día ni tú ni la empresa cotizáis a la Seguridad Social, aunque sigues de alta. No te pueden despedir ni sancionar por hacer huelga.",
        ca: "Sí. Durant la vaga el contracte queda suspès i no tens dret al salari (article 6.2 del Reial decret llei 17/1977), i aquell dia ni tu ni l'empresa no cotitzeu a la Seguretat Social, tot i que continues d'alta. No et poden acomiadar ni sancionar per fer vaga.",
        en: "Yes. During the strike your contract is suspended and you are not entitled to pay (Article 6.2 of Royal Decree-Law 17/1977), and that day neither you nor your employer pays Social Security contributions, although you stay registered. You cannot be dismissed or sanctioned for striking.",
      }),
    },
    {
      question: T(c, {
        es: "¿Tengo que avisar a mi empresa si hago huelga?",
        ca: "He d'avisar la meva empresa si faig vaga?",
        en: "Do I have to tell my employer if I strike?",
      }),
      answer: T(c, {
        es: "No. Según UGT, no tienes obligación de comunicar previamente a tu empresa que vas a secundar una huelga legal. Si la empresa te designa formalmente para los servicios mínimos, sí tienes que ir a trabajar.",
        ca: "No. Segons UGT, no tens l'obligació de comunicar prèviament a la teva empresa que secundaràs una vaga legal. Si l'empresa et designa formalment per als serveis mínims, sí que hi has d'anar a treballar.",
        en: "No. According to UGT, you have no obligation to tell your company in advance that you will join a legal strike. If your employer formally designates you for minimum services, you do have to go to work.",
      }),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

/** "Cataluña" first (the 11N page), then every other city, in population order, in the page's language. */
function otherCitiesList(city: Strike11nCity, locale: Locale): Block {
  const catalonia = { es: "Cataluña (Barcelona)", ca: "Catalunya (Barcelona)", en: "Catalonia (Barcelona)" }[locale];
  return list(
    `[${catalonia}](${b2href("strike11n", locale)})`,
    ...STRIKE_11N_CITY_REFS.filter((other) => other.key !== city.key).map((other) => `[${other.names[locale]}](${strike11nCityHref(other.key, locale)})`),
  );
}

/** Section ids, per language. */
const IDS: Record<string, Record<Locale, string>> = {
  ms: { es: "servicios-minimos", ca: "serveis-minims", en: "minimum-services" },
  transport: { es: "transporte", ca: "transport", en: "transport" },
  health: { es: "sanidad", ca: "sanitat", en: "healthcare" },
  schools: { es: "colegios", ca: "escoles", en: "schools" },
  admin: { es: "administracion", ca: "administracio", en: "administration" },
  demo: { es: "manifestacion", ca: "manifestacio", en: "demonstration" },
  others: { es: "otras-ciudades", ca: "altres-ciutats", en: "other-cities" },
};

/**
 * The page in one language. `city` and `state` are the Spanish facts; they are
 * localized here (localizeCity, localizeState), so the strike watch and the
 * tests pass the same data for every language.
 */
export function buildCityBody(
  city: Strike11nCity,
  asOf: string = STRIKE_11N_CITIES_AS_OF,
  state: Record<string, StateService> = STATE_SERVICES,
  locale: Locale = "es",
  localized = false,
): Block[] {
  const lc = localized ? city : localizeCity(city, locale);
  const ls = localized ? state : localizeState(state, locale);
  // After the strike nobody re-read the orders: the date shown stays the last real check.
  const checkedOn = strikePhase(asOf) === "past" && STRIKE_11N_CITIES_VERIFIED < asOf ? STRIKE_11N_CITIES_VERIFIED : asOf;
  const checked = dateYear(checkedOn, locale);
  const c: Ctx = {
    city: lc,
    locale,
    asOf,
    day: dayDate(STRIKE_11N_DATE, locale),
    checked,
    on: locale === "en" ? `on ${checked}` : locale === "ca" && /^1?1 /.test(checked) ? `l'${checked}` : `el ${checked}`,
    phase: strikePhase(asOf),
    state: cityMsState(lc, ls),
    rail: ls.rail!,
    air: ls.air!,
  };
  const n = lc.name;
  const id = (key: string) => IDS[key]![locale];

  const blocks: Block[] = [];
  blocks.push(lead(leadText(c)));
  blocks.push(
    keyFacts(
      T(c, {
        es: `La huelga del 11 de noviembre en ${n}, de un vistazo`,
        ca: `La vaga de l'11 de novembre a ${n}, d'un cop d'ull`,
        en: `The 11 November strike in ${n} at a glance`,
      }),
      keyFactItems(c),
    ),
  );
  blocks.push(
    callout(
      "official",
      verifiedLine(locale, checkedOn),
      T(c, {
        es: `Solo ponemos lo que publican el BOE, ${lc.bulletin}, los gobiernos, los operadores de transporte y los sindicatos convocantes, y no lo que adelanta la prensa.${c.state === "published" || c.phase === "past" ? "" : " Cuando salgan los servicios mínimos que faltan, los añadiremos a la tabla con el enlace a la orden."}`,
        ca: `Només hi posem el que publiquen el BOE, ${lc.bulletin}, els governs, els operadors de transport i els sindicats convocants, i no el que avança la premsa.${c.state === "published" || c.phase === "past" ? "" : " Quan surtin els serveis mínims que falten, els afegirem a la taula amb l'enllaç a l'ordre."}`,
        en: `We only include what the BOE, ${lc.bulletin}, the governments, the transport operators and the unions calling the strike publish, not what the press reports in advance.${c.state === "published" || c.phase === "past" ? "" : " When the missing minimum services come out, we will add them to the table with a link to the order."}`,
      }),
    ),
  );

  // 11 Nov 2026: what comes next (strike-11n.ts, nextDatesBlocks), for the readers who arrive after the day.
  blocks.push(...nextDatesBlocks(locale, asOf, "strikesSpain"));
  // 13 Nov 2026: once the strike is past, evergreen pages for this city and its community
  // (strike-11n-next.ts). Stored after the upcoming block, which the answer-first layout moves
  // to the end, so it renders right under the lead that says the strike is over.
  if (c.phase === "past") blocks.push(...cityNextBlocks(lc.key, n, locale));

  // Minimum services: the answer most readers came for, first.
  blocks.push(
    heading(
      2,
      T(c, {
        es: `Servicios mínimos del 11 de noviembre en ${n}: qué funciona`,
        ca: `Serveis mínims de l'11 de novembre a ${n}: què funciona`,
        en: `Minimum services on 11 November in ${n}: what runs`,
      }),
      id("ms"),
    ),
  );
  blocks.push(...paras(...msIntro(c), ...lc.msNotes));
  blocks.push(msTable(c));

  // Transport, service by service, then the State's trains and flights.
  blocks.push(heading(2, T(c, { es: `Transporte en ${n} el 11 de noviembre`, ca: `Transport a ${n} l'11 de novembre`, en: `Transport in ${n} on 11 November` }), id("transport")));
  for (const service of byGroup(lc, "transport")) {
    blocks.push(heading(3, service.name));
    blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));
  }
  blocks.push(heading(3, railName(lc, locale)));
  blocks.push(...paras(...railParagraphs(c)));
  blocks.push(heading(3, T(c, { es: `Vuelos: aeropuerto de ${lc.airport}`, ca: `Vols: aeroport de ${lc.airport}`, en: `Flights: ${lc.airport} airport` })));
  blocks.push(...paras(...airParagraphs(c)));

  blocks.push(heading(2, T(c, { es: "Sanidad: hospitales y centros de salud", ca: "Sanitat: hospitals i centres de salut", en: "Healthcare: hospitals and health centres" }), id("health")));
  for (const service of byGroup(lc, "health")) blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));

  blocks.push(heading(2, T(c, { es: `¿Hay colegio el 11 de noviembre en ${n}?`, ca: `Hi ha escola l'11 de novembre a ${n}?`, en: `Are schools open on 11 November in ${n}?` }), id("schools")));
  blocks.push(...paras(lc.school ?? lc.schoolShort));
  for (const service of byGroup(lc, "schools")) blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));

  blocks.push(heading(2, T(c, { es: "Administración pública y trámites", ca: "Administració pública i tràmits", en: "Public offices and official procedures" }), id("admin")));
  for (const service of byGroup(lc, "administration")) blocks.push(...paras(`**${service.name}.** ${msLine(c, service)}`, ...(service.notes ?? []), service.where));
  blocks.push(...paras(STATE_OFFICES[locale], CORREOS[locale]));

  blocks.push(heading(2, T(c, { es: `Manifestación del 11 de noviembre en ${n}`, ca: `Manifestació de l'11 de novembre a ${n}`, en: `11 November demonstration in ${n}` }), id("demo")));
  if (lc.demos.length > 0) {
    blocks.push(...paras(...lc.demos));
  } else {
    blocks.push(
      ...paras(
        T(c, {
          es: `**${c.phase === "past" ? "Sin convocatoria localizada con hora y lugar en" : "Aún sin convocatoria con hora y lugar en"} ${n}.** El ${c.checked}, los convocantes no habían publicado en sus webs la hora y el lugar de la manifestación en ${n}. ${demoWhereFor(c, lc.demoWhere)}`,
          ca: `**${c.phase === "past" ? "Sense convocatòria localitzada amb hora i lloc a" : "Encara sense convocatòria amb hora i lloc a"} ${n}.** ${cap(c.on)}, els convocants no havien publicat als seus webs l'hora i el lloc de la manifestació a ${n}. ${demoWhereFor(c, lc.demoWhere)}`,
          en: `**${c.phase === "past" ? `No demonstration with a time and place found in ${n}.` : `No demonstration with a time and place in ${n} yet.`}** ${cap(c.on)}, the organisers had not published the time and place of the demonstration in ${n} on their websites. ${demoWhereFor(c, lc.demoWhere)}`,
        }),
      ),
    );
  }

  const call = callParagraphs(c);
  blocks.push(heading(2, T(c, { es: "Quién convoca la huelga general y por qué", ca: "Qui convoca la vaga general i per què", en: "Who is calling the general strike and why" })));
  blocks.push(...paras(call.intro));
  blocks.push(list(...call.demands));
  if (call.notes.length > 0) blocks.push(...paras(...call.notes));

  blocks.push(
    heading(
      2,
      T(c, {
        es: "Derechos de quien hace huelga (y de quien no): qué dice la ley",
        ca: "Drets de qui fa vaga (i de qui no): què diu la llei",
        en: "Rights of those who strike (and those who don't): what the law says",
      }),
    ),
  );
  blocks.push(...paras(RIGHTS_INTRO[locale]));
  blocks.push(list(...RIGHTS[locale]));

  blocks.push(faq(faqItems(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));

  blocks.push(heading(2, T(c, { es: "La huelga del 11 de noviembre en otras ciudades", ca: "La vaga de l'11 de novembre en altres ciutats", en: "The 11 November strike in other cities" }), id("others")));
  blocks.push(otherCitiesList(lc, locale));

  blocks.push(...paras(verifiedLine(locale, STRIKE_11N_CITIES_VERIFIED)));
  // The related rail (its first two links also become the read-next box): the
  // Spain-wide 11N page and the Spain strikes hub, in the page's language. Until
  // 13 Nov 2026 these were the Catalan 11N page and the Catalan strikes hub,
  // pages about somewhere else for these readers; the Catalan 11N page stays in
  // the other-cities list above.
  blocks.push(heading(2, RELATED_HEADING[locale]));
  blocks.push(
    list(
      `[${T(c, {
        es: "Huelga general del 11 de noviembre en España, ciudad por ciudad",
        ca: "Vaga general de l'11 de novembre a Espanya, ciutat per ciutat",
        en: "General strike on 11 November in Spain, city by city",
      })}](/${locale}/${STRIKE_11N_SPAIN_PATHS[locale]}/)`,
      b2link("strikesSpain", locale, B2_TITLES.strikesSpain[locale]),
    ),
  );
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The photograph: a march in Madrid beside an EMT bus during the general
 * strike of 14 November 2012 (Israel Hergón, CC BY-SA 2.0, Wikimedia
 * Commons), downloaded for these pages on 6 Nov 2026. One file for every city,
 * with one alt text and caption, since media rows are keyed by file.
 */
export const CITY_HERO = {
  key: "huelga-general-madrid-14n-emt",
  alt: {
    ca: "Manifestants caminant per un carrer de Madrid al costat d'un autobús de l'EMT durant la vaga general del 14 de novembre de 2012",
    es: "Manifestantes caminando por una calle de Madrid junto a un autobús de la EMT durante la huelga general del 14 de noviembre de 2012",
    en: "Marchers walking down a Madrid street beside an EMT bus during the general strike of 14 November 2012",
  },
  caption: {
    ca: "Vaga general del 14 de novembre de 2012 a Madrid.",
    es: "Huelga general del 14 de noviembre de 2012 en Madrid.",
    en: "The general strike of 14 November 2012 in Madrid.",
  },
} as const;

/** One city edition in one language. */
export function cityEdition(city: Strike11nCity, locale: Locale): B2Edition {
  const lc = localizeCity(city, locale);
  return {
    path: lc.path,
    title: cityTitle(lc, locale),
    seoTitle: citySeoTitle(lc, locale),
    seoDescription: cityDescription(lc, STRIKE_11N_CITIES_AS_OF, STATE_SERVICES, locale),
    excerpt: cityExcerpt(lc, locale),
    blocks: buildCityBody(city, STRIKE_11N_CITIES_AS_OF, STATE_SERVICES, locale),
  };
}

/** The languages a city page is published in: Spanish always; Catalan and English once its words are written. */
export function cityLocales(city: Strike11nCity): Locale[] {
  return CITY_TR[city.key] ? ["ca", "es", "en"] : ["es"];
}

/**
 * The cities whose page carries CITY_HERO: only the city it was taken in. On
 * the Sevilla or Vigo page a Madrid march read as a picture of the wrong city
 * (11 Nov 2026), and no licensed file of ours shows a strike anywhere else, so
 * those pages go without a photograph and their preview is the social card.
 */
export const CITY_HERO_CITIES: ReadonlySet<Strike11nCity["key"]> = new Set(["madrid"]);

export const CITY_NO_PHOTO_REASON =
  "No licensed photograph of a strike in this city; the only one (CITY_HERO) shows Madrid in 2012.";

function cityPhoto(city: Strike11nCity): Pick<B2UnkeyedArticle, "heroKey" | "heroAlt" | "heroCaption" | "noPhotoReason"> {
  if (!CITY_HERO_CITIES.has(city.key)) return { noPhotoReason: CITY_NO_PHOTO_REASON };
  return { heroKey: CITY_HERO.key, heroAlt: { ...CITY_HERO.alt }, heroCaption: { ...CITY_HERO.caption } };
}

function cityArticle(city: Strike11nCity): B2UnkeyedArticle {
  const editions = Object.fromEntries(cityLocales(city).map((locale) => [locale, cityEdition(city, locale)])) as B2UnkeyedArticle["editions"];
  return {
    entryKey: `guide-general-strike-11-november-2026-${city.key.toLowerCase()}`,
    categoryKey: "public-services",
    sources: citySources(city),
    ...cityPhoto(city),
    verifiedAt: STRIKE_11N_CITIES_VERIFIED,
    publishedAt: "2026-11-06T01:00:00+01:00",
    editions,
  };
}

/** One page per city, in the order of STRIKE_11N_CITY_REFS, in ca, es and en. */
export const STRIKE_11N_CITY_ARTICLES: B2UnkeyedArticle[] = STRIKE_11N_CITY_REFS.flatMap((ref) => {
  const city = CITIES.find((candidate) => candidate.key === ref.key);
  return city ? [cityArticle(city)] : [];
});

export function strike11nCity(key: Strike11nCityKey): Strike11nCity {
  const city = CITIES.find((candidate) => candidate.key === key);
  if (!city) throw new Error(`no 11N city page for ${key}`);
  return city;
}
