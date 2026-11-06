import type { Block } from "@/lib/content/blocks";

import { dateYear, dayDate } from "./festive";
import {
  RELATED_HEADING,
  b2link,
  callout,
  faq,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Source,
  type B2SpanishArticle,
} from "./shared";
import { STRIKE_11N_DATE, STRIKE_11N_URLS, strikePhase, type StrikePhase } from "./strike-11n";
import {
  CITIES,
  CITY_STATE_URLS,
  STATE_SERVICES,
  STRIKE_11N_CITIES_AS_OF,
  STRIKE_11N_CITIES_VERIFIED,
} from "./strike-11n-cities-data";
import type { CityService, CityServiceGroup, MsSlot, StateService, Strike11nCity } from "./strike-11n-cities-model";
import { STRIKE_11N_CITY_REFS, strike11nCityHref, type Strike11nCityKey } from "./strike-11n-city-paths";
import { STRIKES, isUpcoming } from "./strikes";

/**
 * "Huelga general del 11 de noviembre en <ciudad>": one Spanish-only page per
 * large city outside Catalonia (6 Nov 2026).
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
 * HOW TO UPDATE: edit `strike-11n-cities-data.ts` only (each service's
 * status, text and source; the State slots; demonstrations), move
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
/* Titles and descriptions                                                    */
/* -------------------------------------------------------------------------- */

export const SEO_TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

function firstFit(candidates: string[], limit: number): string {
  return candidates.find((candidate) => candidate.length <= limit) ?? candidates[candidates.length - 1]!;
}

/** "Huelga general del 11 de noviembre en Madrid: servicios mínimos y qué funciona" (the H1). */
export function cityTitle(city: Strike11nCity): string {
  return `Huelga general del 11 de noviembre en ${city.name}: servicios mínimos y qué funciona`;
}

/** The searched words first: "huelga 11 noviembre madrid", then the services. */
export function citySeoTitle(city: Strike11nCity): string {
  return firstFit(
    [
      `Huelga 11 noviembre ${city.name}: servicios mínimos de ${city.titleTransport}`,
      `Huelga 11 de noviembre en ${city.name}: servicios mínimos`,
      `Huelga 11 noviembre ${city.name}: servicios mínimos`,
      `Huelga 11N ${city.name}: servicios mínimos`,
    ],
    SEO_TITLE_LIMIT,
  );
}

/** Answer-first: the day, the hours, and where minimum services stand. */
export function cityDescription(
  city: Strike11nCity,
  asOf: string = STRIKE_11N_CITIES_AS_OF,
  state: Record<string, StateService> = STATE_SERVICES,
): string {
  // The city's own services only: Cercanías is the State's, and the status below is the city's.
  const services = `${city.titleTransport}, sanidad y colegios`;
  if (strikePhase(asOf) === "past") {
    return firstFit(
      [
        `La huelga general del 11 de noviembre de 2026 en ${city.name}: quién la convocó, los servicios mínimos de ${services}, y qué dice la ley.`,
        `La huelga general del 11 de noviembre de 2026 en ${city.name}: quién la convocó, los servicios mínimos y qué dice la ley.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  const published = city.services.filter((service) => service.status === "published").length;
  const status = published === 0 ? "aún no publicados" : published === city.services.length ? "ya publicados" : "publicados en parte";
  void state;
  return firstFit(
    [
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}, 24 horas. Servicios mínimos de ${services}: ${status}.`,
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}, 24 horas. Servicios mínimos de ${city.titleTransport}: ${status}.`,
      `Huelga general el miércoles 11 de noviembre de 2026 en ${city.name}. Servicios mínimos: ${status}.`,
    ],
    DESCRIPTION_LIMIT,
  );
}

function cityExcerpt(city: Strike11nCity): string {
  return firstFit(
    [
      `La huelga general del 11 de noviembre de 2026 en ${city.name}: servicios mínimos de ${city.titleTransport}${city.cercanias ? ", Cercanías" : ""}, sanidad y colegios, la manifestación y los derechos de quien hace huelga.`,
      `La huelga general del 11 de noviembre de 2026 en ${city.name}: servicios mínimos, manifestación y derechos de quien hace huelga.`,
    ],
    200,
  );
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Ctx {
  city: Strike11nCity;
  asOf: string;
  /** "miércoles 11 de noviembre de 2026" */
  day: string;
  /** "6 de noviembre de 2026" */
  checked: string;
  phase: StrikePhase;
  state: CityMsState;
  rail: StateService;
  air: StateService;
}

const NOT_PUBLISHED = "Aún no publicados";

/** The convening organisations, as CCOO listed them on 19 Oct 2026. */
const CALLED_BY = "CCOO y UGT, con CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas y la Unión de Actores y Actrices";

/** "**Servicios mínimos:** …", published or pending, for one slot. */
function msLine(c: Ctx, slot: MsSlot & { pending: string }): string {
  return slot.status === "published" && slot.text
    ? `**Servicios mínimos:** ${slot.text}`
    : `**Servicios mínimos:** aún no publicados (consultado el ${c.checked}). ${slot.pending}`;
}

/** The same answer as plain text, for the FAQ. */
function slotAnswer(c: Ctx, slot: MsSlot & { pending: string }, yes: string): string {
  return slot.status === "published" && slot.text
    ? `${yes} ${strip(slot.text)}`
    : `${yes} Los servicios mínimos aún no se han publicado (consultado el ${c.checked}). ${strip(slot.pending)}`;
}

const byGroup = (city: Strike11nCity, group: CityServiceGroup): CityService[] => city.services.filter((service) => service.group === group);

/** The SEMAF strike at Renfe either side of 11N, while it is still to come on the as-of date. */
const RENFE_NOV = STRIKES.find((strike) => strike.id === "vaga-renfe-2026-11-10");

function railName(city: Strike11nCity): string {
  return city.cercanias ? `${city.cercanias} y trenes de Renfe` : "Trenes de Renfe";
}

function leadText(c: Ctx): string {
  const { city } = c;
  if (c.phase === "past") {
    return `**El ${c.day} hubo huelga general de 24 horas en toda España, también en ${city.name},** convocada por CCOO y UGT con CGT, CNT y otras organizaciones. En la tabla de más abajo están los servicios mínimos que se fijaron para cada servicio, con el enlace a cada orden.`;
  }
  const first =
    c.phase === "today"
      ? `**Hoy, ${c.day}, hay huelga general de 24 horas en toda España, también en ${city.name}:** la convocan CCOO y UGT, con CGT, CNT y otras organizaciones.`
      : `**El ${c.day} hay huelga general de 24 horas en toda España, también en ${city.name}:** la convocan CCOO y UGT, con CGT, CNT y otras organizaciones.`;
  const trains = city.cercanias ? `los de ${city.cercanias}, los demás trenes de Renfe y los vuelos` : "los de los trenes de Renfe y los vuelos";
  const statePending = [c.rail, c.air].some((slot) => slot.status !== "published");
  const missing = city.services.filter((service) => service.status !== "published").map((service) => service.name);
  let ms: string;
  if (c.state === "published") {
    ms = ` **Los servicios mínimos de ${city.name} ya se han publicado:** ${city.msSummary ? `${city.msSummary}.` : "los tienes en la tabla de más abajo, servicio por servicio, con el enlace a cada orden."}`;
  } else if (regionalOrderPublished(city)) {
    ms = [
      ` **Servicios mínimos en ${city.name} ya publicados:** ${city.msSummary ? `${city.msSummary}.` : "los tienes en la tabla de más abajo, con el enlace a cada orden."}`,
      missing.length > 0 ? ` Aún faltan los de ${andJoin(missing)}.` : "",
      statePending ? ` Los de ${trains.replace(/^los de /, "")} los fija el Ministerio de Transportes y aún no se han publicado (consultado el ${c.checked}).` : "",
    ].join("");
  } else if (c.state === "pending") {
    ms = ` **Servicios mínimos en ${city.name}: aún no publicados** (consultado el ${c.checked}). Los de ${city.transportShort}, sanidad y colegios los fija ${city.authority}; ${trains}, el Ministerio de Transportes. Los pondremos aquí, servicio por servicio, en cuanto salgan.`;
  } else {
    ms = ` **Servicios mínimos en ${city.name}: los de ${city.transportShort}, sanidad y colegios aún no se han publicado** (consultado el ${c.checked}); los fija ${city.authority}. Los de los trenes y los vuelos, en la tabla de más abajo.`;
  }
  return `${first}${ms}`;
}

function andJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function keyFactItems(c: Ctx): { label: string; value: string }[] {
  const { city } = c;
  const rail = c.rail.status === "published" && c.rail.text ? strip(c.rail.text) : `Servicios mínimos aún no publicados: los fija el Ministerio de Transportes`;
  const renfeStrike = RENFE_NOV && isUpcoming(RENFE_NOV, c.asOf) ? ". Además, SEMAF convoca huelga de maquinistas en Renfe el 10 y el 12 de noviembre" : "";
  return [
    { label: "Día", value: cap(c.day) },
    { label: "Horario", value: "De 0 a 24 h del miércoles 11. Donde se trabaja por turnos, desde el primer turno, aunque empiece antes de las 0 h, hasta el último" },
    {
      label: `Servicios mínimos en ${city.name}`,
      value: regionalOrderPublished(city)
        ? city.msSummary
          ? cap(strip(city.msSummary))
          : `Publicados (consultado el ${c.checked}): mira la tabla por servicios`
        : c.state === "pending"
          ? `Aún no publicados (consultado el ${c.checked}). Los fija ${city.authorityShort}`
          : `Los de ${city.name}, aún no publicados (consultado el ${c.checked}). Los fija ${city.authorityShort}`,
    },
    { label: railName(city), value: `${rail}${renfeStrike}` },
    { label: "Colegios", value: city.schoolShort },
    {
      label: `Manifestación en ${city.name}`,
      value: city.demoShort ?? `Sin hora y lugar publicados por los convocantes para ${city.name} (consultado el ${c.checked})`,
    },
    { label: "Convocatoria", value: CALLED_BY },
  ];
}

function msTable(c: Ctx): Block {
  const { city } = c;
  const rows = [
    ...city.services.map((service) => [
      service.name,
      service.setBy,
      service.status === "published" && service.text ? service.text : NOT_PUBLISHED,
      service.where,
    ]),
    [
      railName(city),
      c.rail.setBy,
      c.rail.status === "published" && c.rail.text ? c.rail.text : NOT_PUBLISHED,
      `La resolución, en la ${link(U.ministryRail, "lista del Ministerio")}; los trenes que circulan, en ${link(U.renfe, "renfe.com")}`,
    ],
    [
      `Vuelos (aeropuerto de ${city.airport})`,
      c.air.setBy,
      c.air.status === "published" && c.air.text ? c.air.text : NOT_PUBLISHED,
      `La resolución, en la ${link(U.ministryAir, "lista del Ministerio")}; tu vuelo, en ${link(U.aena, "Infovuelos de Aena")} y en tu compañía aérea`,
    ],
  ];
  return table(
    `Servicios mínimos del 11 de noviembre en ${city.name}: quién los fija y dónde se consultan`,
    ["Servicio", "Quién los fija", "Servicios mínimos", "Dónde se consultan"],
    rows,
    `Consultado el ${c.checked}. Cuando salga cada orden, la añadiremos a esta tabla con su enlace.`,
  );
}

function msIntro(c: Ctx): string[] {
  const { city } = c;
  const law = `Los fija, para cada servicio, el gobierno del que depende, como prevé el ${link(U.rdl17, "artículo 10 del Real Decreto-ley 17/1977")}: «la Autoridad gubernativa podrá acordar las medidas necesarias para asegurar el funcionamiento de los servicios».`;
  if (c.state === "pending") {
    return [
      `**Aún no se han publicado.** El ${c.checked} no había en ${city.bulletin} ninguna orden de servicios mínimos para el 11 de noviembre, ni ninguna resolución del Ministerio de Transportes. Los de ${city.transportShort}, la sanidad, los colegios y la administración autonómica los fija ${city.authority}; los de los trenes de Renfe y los vuelos, el Ministerio de Transportes.`,
      law,
    ];
  }
  return [
    `Aquí tienes lo que fijan las órdenes y resoluciones publicadas, servicio por servicio, tal como estaban el ${c.checked}. En caso de duda, cuenta el texto oficial enlazado en cada fila.`,
    law,
  ];
}

function railParagraphs(c: Ctx): string[] {
  const renfe =
    RENFE_NOV && isUpcoming(RENFE_NOV, c.asOf)
      ? [
          `**El 10 y el 12 de noviembre también hay huelga en Renfe:** el sindicato de maquinistas SEMAF la ha convocado en el Grupo Renfe, con un paro total el martes 10 y paros parciales el jueves 12, según ${link(U.semaf1012, "su comunicado del 29 de octubre")}.`,
        ]
      : [];
  return [
    msLine(c, c.rail),
    ...c.city.railNotes,
    `${c.city.cercanias ? `${c.city.cercanias}, los` : "Los"} Media Distancia, el AVE y la larga distancia de Renfe son servicios del Estado: sus servicios mínimos los fija el Ministerio de Transportes por resolución, que publica en su ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}. Los trenes que circulan, en ${link(U.renfe, "renfe.com")}.`,
    ...renfe,
  ];
}

function airParagraphs(c: Ctx): string[] {
  return [
    msLine(c, c.air),
    `En los aeropuertos y las compañías aéreas los fija el Ministerio de Transportes, que publica sus resoluciones en su ${link(U.ministryAir, "página de servicios mínimos del transporte aéreo")}. El estado de tu vuelo, en ${link(U.aena, "Infovuelos de Aena")} y en tu compañía aérea.`,
    `**Vigilantes de seguridad:** el Ministerio del Interior ya ha fijado los de la seguridad privada. En los «transportes públicos (puertos, aeropuertos, ferrocarriles, etc.)», el 90% del personal de seguridad, según ${link(U.securityOrder, "la resolución de la Secretaría de Estado de Seguridad del 30 de octubre")}, publicada en el BOE el 4 de noviembre.`,
  ];
}

/** The State's offices: Real Decreto 1479/1988, in force, read on the BOE. */
const STATE_OFFICES = `**Oficinas del Estado** (ministerios, sus organismos autónomos, como el SEPE, y la Seguridad Social): según el ${link(U.rd1479, "Real Decreto 1479/1988")}, «las dependencias permanecerán abiertas durante la situación de huelga, salvo que por razones fundadas el Departamento, Organismo o Servicio decida su cierre», y se mantienen como servicios mínimos, entre otros, el registro de documentos, la información, la atención telefónica y los trámites cuyo plazo acabe ese día.`;

/** Correos: Orden INT/1170/2026 (BOE, 6 Nov 2026), for the postal vote of 29 November. */
const CORREOS = `**Correos:** el Ministerio del Interior ha declarado esenciales los servicios del voto por correo para las elecciones del 29 de noviembre: las oficinas abren «en el horario habitual, turno de mañana, o de mañana y tarde en las que lo tengan establecido» para admitir solicitudes y votos por correo y entregar la documentación electoral, con 1 a 3 empleados por turno según su plantilla (${link(U.correosOrder, "Orden INT/1170/2026")}, BOE del 6 de noviembre). Cómo votar por correo, en ${b2link("postalVote", "es", "nuestra guía del voto por correo")}.`;

function callParagraphs(c: Ctx): { intro: string; demands: string[]; notes: string[] } {
  return {
    intro: `Es una huelga general de 24 horas en toda España. Según la convocatoria, tal como la recoge el BOE en la ${link(U.correosOrder, "orden de servicios mínimos de Correos")}, «tendrá lugar durante la jornada del día 11 de noviembre de 2026, comenzando a las 0 horas y terminando a las 24 horas», y donde hay varios turnos empieza con el primero, «aunque empiece antes de las 0 horas del día 11». CCOO informó el 19 de octubre de 2026 de que «ya está registrada» y la presentó ese día en el Ministerio de Trabajo y Economía Social, con UGT y «Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS, y Unión de Actores y Actrices» (${link(U.ccooRegistered, "CCOO")}).`,
    demands: [
      `**CCOO y UGT** (${link(U.ccooCall, "convocatoria del 7 de octubre")}): llaman a la huelga «para desbloquear la negociación colectiva» y para subir salarios, reducir la jornada, mejorar la salud de las personas trabajadoras y erradicar la precariedad, y piden a las administraciones «políticas que acaben con la especulación de la vivienda».`,
      `**UGT** (${link(U.ugt, "ugt.es")}): «Reclamamos una subida del SMI de, al menos, un 7% en 2027».`,
    ],
    notes: c.city.callNotes,
  };
}

const RIGHTS_INTRO = `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». El artículo 6 del ${link(U.rdl17, "Real Decreto-ley 17/1977")} fija sus efectos:`;

const RIGHTS = [
  "**No te pueden despedir ni sancionar por hacer huelga:** «El ejercicio del derecho de huelga no extingue la relación de trabajo, ni puede dar lugar a sanción alguna, salvo que el trabajador, durante la misma, incurriera en falta laboral» (artículo 6.1).",
  "**Ese día no cobras:** «Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario» (artículo 6.2). UGT añade que el descuento «puede afectar proporcionalmente a determinados conceptos salariales vinculados a ese periodo», pero que la empresa «no puede imponerte un descuento adicional como castigo».",
  "**Seguridad Social:** sigues «en situación de alta especial en la Seguridad Social, con suspensión de la obligación de cotización por parte del empresario y del propio trabajador» (artículo 6.3).",
  "**Quien no quiera hacer huelga puede trabajar:** «Se respetará la libertad de trabajo de aquellos trabajadores que no quisieran sumarse a la huelga» (artículo 6.4).",
  "**La empresa no puede sustituirte** por personas que no estuvieran vinculadas a ella cuando se comunicó la huelga (artículo 6.5).",
  `**No tienes que avisar:** «No tienes obligación de comunicar previamente a tu empresa que vas a secundar una huelga legal», según ${link(U.ugt, "UGT")}. El preaviso lo dan los sindicatos convocantes: diez días naturales cuando la huelga afecta a servicios públicos (artículo 4 del Real Decreto-ley 17/1977).`,
  "**Servicios mínimos:** según UGT, que haya servicios mínimos «no significa que toda la plantilla tenga que trabajar»; si la empresa te designa, «comprueba qué horario debes cumplir y qué funciones tienes asignadas».",
  "**Teletrabajo:** para UGT, «si el 11 de noviembre te obligan a teletrabajar es una vulneración del derecho fundamental de la huelga que puede ser denunciada».",
];

function faqItems(c: Ctx): { question: string; answer: string }[] {
  const { city } = c;
  const pendingCheck = `aún no se han publicado (consultado el ${c.checked})`;
  const asked = city.services.filter((service) => service.question);
  const schools = byGroup(city, "schools");
  return [
    {
      question: `¿Qué funciona el 11 de noviembre en ${city.name}?`,
      answer:
        c.state === "pending"
          ? `Los servicios esenciales, como el transporte público, la sanidad y los colegios, funcionan con los servicios mínimos que fije el gobierno del que dependen. Los de ${city.name} ${pendingCheck}: los de ${city.transportShort}, sanidad y colegios los fija ${strip(city.authority)}, y los de los trenes de Renfe y los vuelos, el Ministerio de Transportes. Los pondremos en esta página en cuanto salgan.`
          : `Los servicios esenciales funcionan con servicios mínimos. Los que ya se han publicado están en la tabla de esta página, servicio por servicio, con el enlace a cada orden: ${andJoin([...city.services, c.rail, c.air].filter((slot) => slot.status === "published").map((slot) => ("name" in slot ? slot.name : slot.key === "rail" ? railName(city) : "vuelos")))}.`,
    },
    ...asked.map((service) => ({ question: service.question!, answer: slotAnswer(c, service, "Sí, con servicios mínimos.") })),
    ...(city.cercanias
      ? [{ question: `¿Hay ${city.cercanias} el 11 de noviembre?`, answer: slotAnswer(c, c.rail, "Sí, con servicios mínimos, que fija el Ministerio de Transportes.") }]
      : []),
    {
      question: `¿Hay colegio el 11 de noviembre en ${city.name}?`,
      answer: [
        city.school ? strip(city.school) : city.schoolShort,
        ...schools.map((service) =>
          service.status === "published" && service.text
            ? `Servicios mínimos: ${strip(service.text)}`
            : `Los servicios mínimos de los colegios ${pendingCheck}.`,
        ),
      ].join(" "),
    },
    {
      question: `¿Dónde es la manifestación del 11N en ${city.name}?`,
      answer:
        city.demos.length > 0
          ? city.demos.map(strip).join(" ")
          : `El ${c.checked} los convocantes aún no habían publicado la hora ni el lugar de la manifestación en ${city.name}. ${strip(city.demoWhere)}`,
    },
    {
      question: "¿Cuándo se publican los servicios mínimos del 11N?",
      answer: regionalOrderPublished(city)
        ? `Los de ${city.name} ya se han publicado, al menos en parte: están en la tabla de esta página, con el enlace a cada orden. Los de los trenes y los vuelos los publica el Ministerio de Transportes en su web.`
        : `Los fija ${strip(city.authorityShort)} por orden, y los de los trenes y los vuelos, el Ministerio de Transportes en su web. El ${c.checked} aún no se habían publicado.`,
    },
    {
      question: "¿Me descuentan el sueldo si hago huelga?",
      answer: "Sí. Durante la huelga el contrato queda suspendido y no tienes derecho al salario (artículo 6.2 del Real Decreto-ley 17/1977), y ese día ni tú ni la empresa cotizáis a la Seguridad Social, aunque sigues de alta. No te pueden despedir ni sancionar por hacer huelga.",
    },
    {
      question: "¿Tengo que avisar a mi empresa si hago huelga?",
      answer: "No. Según UGT, no tienes obligación de comunicar previamente a tu empresa que vas a secundar una huelga legal. Si la empresa te designa formalmente para los servicios mínimos, sí tienes que ir a trabajar.",
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

/** "Cataluña" first (the 11N page), then every other city, in population order. */
function otherCitiesList(city: Strike11nCity): Block {
  return list(
    `[Cataluña (Barcelona)](/es/guias/huelga-general-11-noviembre/)`,
    ...STRIKE_11N_CITY_REFS.filter((other) => other.key !== city.key).map((other) => `[${other.name}](${strike11nCityHref(other.key)})`),
  );
}

export function buildCityBody(
  city: Strike11nCity,
  asOf: string = STRIKE_11N_CITIES_AS_OF,
  state: Record<string, StateService> = STATE_SERVICES,
): Block[] {
  const c: Ctx = {
    city,
    asOf,
    day: dayDate(STRIKE_11N_DATE, "es"),
    checked: dateYear(asOf, "es"),
    phase: strikePhase(asOf),
    state: cityMsState(city, state),
    rail: state.rail!,
    air: state.air!,
  };

  const blocks: Block[] = [];
  blocks.push(lead(leadText(c)));
  blocks.push(keyFacts(`La huelga del 11 de noviembre en ${city.name}, de un vistazo`, keyFactItems(c)));
  blocks.push(
    callout(
      "official",
      verifiedLine("es", asOf),
      `Solo ponemos lo que publican el BOE, ${city.bulletin}, los gobiernos, los operadores de transporte y los sindicatos convocantes, y no lo que adelanta la prensa.${c.state === "published" ? "" : " Cuando salgan los servicios mínimos que faltan, los añadiremos a la tabla con el enlace a la orden."}`,
    ),
  );

  // Minimum services: the answer most readers came for, first.
  blocks.push(heading(2, `Servicios mínimos del 11 de noviembre en ${city.name}: qué funciona`, "servicios-minimos"));
  blocks.push(...paras(...msIntro(c), ...city.msNotes));
  blocks.push(msTable(c));

  // Transport, service by service, then the State's trains and flights.
  blocks.push(heading(2, `Transporte en ${city.name} el 11 de noviembre`, "transporte"));
  for (const service of byGroup(city, "transport")) {
    blocks.push(heading(3, service.name));
    blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));
  }
  blocks.push(heading(3, railName(city)));
  blocks.push(...paras(...railParagraphs(c)));
  blocks.push(heading(3, `Vuelos: aeropuerto de ${city.airport}`));
  blocks.push(...paras(...airParagraphs(c)));

  blocks.push(heading(2, "Sanidad: hospitales y centros de salud", "sanidad"));
  for (const service of byGroup(city, "health")) blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));

  blocks.push(heading(2, `¿Hay colegio el 11 de noviembre en ${city.name}?`, "colegios"));
  blocks.push(...paras(city.school ?? city.schoolShort));
  for (const service of byGroup(city, "schools")) blocks.push(...paras(msLine(c, service), ...(service.notes ?? []), service.where));

  blocks.push(heading(2, "Administración pública y trámites", "administracion"));
  for (const service of byGroup(city, "administration")) blocks.push(...paras(`**${service.name}.** ${msLine(c, service)}`, ...(service.notes ?? []), service.where));
  blocks.push(...paras(STATE_OFFICES, CORREOS));

  blocks.push(heading(2, `Manifestación del 11 de noviembre en ${city.name}`, "manifestacion"));
  if (city.demos.length > 0) {
    blocks.push(...paras(...city.demos));
  } else {
    blocks.push(
      ...paras(`**Aún sin convocatoria con hora y lugar en ${city.name}.** El ${c.checked}, los convocantes no habían publicado en sus webs la hora y el lugar de la manifestación en ${city.name}. ${city.demoWhere}`),
    );
  }

  const call = callParagraphs(c);
  blocks.push(heading(2, "Quién convoca la huelga general y por qué"));
  blocks.push(...paras(call.intro));
  blocks.push(list(...call.demands));
  if (call.notes.length > 0) blocks.push(...paras(...call.notes));

  blocks.push(heading(2, "Derechos de quien hace huelga (y de quien no): qué dice la ley"));
  blocks.push(...paras(RIGHTS_INTRO));
  blocks.push(list(...RIGHTS));

  blocks.push(faq(faqItems(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));

  blocks.push(heading(2, "La huelga del 11 de noviembre en otras ciudades", "otras-ciudades"));
  blocks.push(otherCitiesList(city));

  blocks.push(...paras(verifiedLine("es", STRIKE_11N_CITIES_VERIFIED)));
  // The related rail (its first two links also become the read-next box): the
  // 11N page and the strikes hub, both in Spanish.
  blocks.push(heading(2, RELATED_HEADING.es));
  blocks.push(
    list(
      b2link("strike11n", "es", "Huelga general del 11 de noviembre en Cataluña: servicios mínimos"),
      b2link("strikes", "es", "Huelga hoy en Cataluña: qué funciona"),
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

function cityArticle(city: Strike11nCity): B2SpanishArticle {
  return {
    entryKey: `guide-general-strike-11-november-2026-${city.key.toLowerCase()}`,
    categoryKey: "public-services",
    sources: citySources(city),
    heroKey: CITY_HERO.key,
    heroAlt: { ...CITY_HERO.alt },
    heroCaption: { ...CITY_HERO.caption },
    verifiedAt: STRIKE_11N_CITIES_VERIFIED,
    publishedAt: "2026-11-06T01:00:00+01:00",
    editions: {
      es: {
        path: city.path,
        title: cityTitle(city),
        seoTitle: citySeoTitle(city),
        seoDescription: cityDescription(city),
        excerpt: cityExcerpt(city),
        blocks: buildCityBody(city),
      },
    },
  };
}

/** One page per city, in the order of STRIKE_11N_CITY_REFS. */
export const STRIKE_11N_CITY_ARTICLES: B2SpanishArticle[] = STRIKE_11N_CITY_REFS.flatMap((ref) => {
  const city = CITIES.find((candidate) => candidate.key === ref.key);
  return city ? [cityArticle(city)] : [];
});

export function strike11nCity(key: Strike11nCityKey): Strike11nCity {
  const city = CITIES.find((candidate) => candidate.key === key);
  if (!city) throw new Error(`no 11N city page for ${key}`);
  return city;
}
