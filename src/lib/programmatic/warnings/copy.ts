/**
 * Words of the "warnings in force" page (ca, es, en). Pure: the view and
 * `now` come in. Every figure, zone, time and text printed comes from a
 * source read (view.ts); the sentences here only frame it.
 */

import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { caDel, caEl, liveStamp } from "@/lib/programmatic/live-stamp";
import { hubPath as rodaliesHubPath } from "@/lib/programmatic/rodalies/paths";
import { todayPath } from "@/lib/programmatic/today/paths";

import { LEVEL_NAMES, PLAN_TYPES, phaseName, phenomenonName, provinceOf } from "./names";
import type { CivilPlan, RoadIncident, SourceState, WarningLevel, WarningsView, WeatherWarning } from "./types";
import { groupRoads, maxLevel, phenomena, splitWarnings } from "./view";

export const URLS = {
  aemetWarnings: { ca: "https://www.aemet.es/ca/eltiempo/prediccion/avisos?k=cat", es: "https://www.aemet.es/es/eltiempo/prediccion/avisos?k=cat", en: "https://www.aemet.es/en/eltiempo/prediccion/avisos?k=cat" },
  aemetRssInfo: "https://www.aemet.es/es/rss_info/avisos/cat",
  aemetLegal: "https://www.aemet.es/es/nota_legal",
  aemetHelp: "https://www.aemet.es/es/eltiempo/prediccion/avisos/ayuda",
  sctStatus: { ca: "https://transit.gencat.cat/ca/informacio-viaria/estat-transit/", es: "https://transit.gencat.cat/es/informacio-viaria/estat-transit/", en: "https://transit.gencat.cat/ca/informacio-viaria/estat-transit/" },
  sctDataset: "https://analisi.transparenciacatalunya.cat/d/uyam-bs37",
  civilDataset: "https://analisi.transparenciacatalunya.cat/d/wj9c-j6vf",
  civilPlansDataset: "https://analisi.transparenciacatalunya.cat/d/wfei-fjk5",
  civilHome: { ca: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/", es: "https://interior.gencat.cat/es/arees_dactuacio/proteccio_civil/", en: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/" },
  gencatLicence: "https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/",
  meteocatSmp: "https://www.meteo.cat/wpweb/serveis/avisos/",
} as const;

/** The attribution the Generalitat's open-data licence asks for ("Generalitat de Catalunya. Departament de …"). */
export const SCT_CREDIT = "Generalitat de Catalunya. Departament d'Interior i Seguretat Pública. Servei Català de Trànsit";
export const CIVIL_CREDIT = "Generalitat de Catalunya. Departament d'Interior i Seguretat Pública. Direcció General de Protecció Civil";
/** One of the two attributions AEMET's legal notice allows for unaltered information. */
export const AEMET_CREDIT = "© AEMET. Información elaborada por la Agencia Estatal de Meteorología";

/* -------------------------------------------------------------------------- */
/* Times                                                                      */
/* -------------------------------------------------------------------------- */

const WEEKDAYS: Record<Locale, string[]> = {
  ca: ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."],
  es: ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function madrid(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(Date.parse(iso)));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: WEEKDAYS.en.indexOf(get("weekday")), y: get("year"), m: get("month"), d: get("day"), time: `${get("hour")}:${get("minute")}` };
}

/** "dc. 19/11 00:00", "mié. 19/11 00:00", "Thu 19 Nov 00:00" (Madrid time; AEMET's 09:59:59 prints 09:59, as AEMET's own feed does). */
export function rowTime(iso: string, locale: Locale): string {
  const t = madrid(iso);
  const day = WEEKDAYS[locale][t.weekday] ?? "";
  return locale === "en" ? `${day} ${Number(t.d)} ${EN_MONTHS[Number(t.m) - 1]} ${t.time}` : `${day} ${t.d}/${t.m} ${t.time}`;
}

/** "dc. 18/11 a les 21:00" / "mié. 18/11 a las 21:00" / "Wed 18 Nov at 21:00". */
export function startText(iso: string, locale: Locale): string {
  const t = madrid(iso);
  const day = WEEKDAYS[locale][t.weekday] ?? "";
  if (locale === "en") return `${day} ${Number(t.d)} ${EN_MONTHS[Number(t.m) - 1]} at ${t.time}`;
  return `${day} ${t.d}/${t.m} ${locale === "ca" ? "a les" : "a las"} ${t.time}`;
}

/** "18/11 06:00", or with the year when it is not the year of `now` ("02/11/2025 07:46"). */
export function sinceTime(iso: string, locale: Locale, now: number): string {
  const t = madrid(iso);
  const sameYear = t.y === madrid(new Date(now).toISOString()).y;
  if (locale === "en") return `${Number(t.d)} ${EN_MONTHS[Number(t.m) - 1]}${sameYear ? "" : ` ${t.y}`} ${t.time}`;
  return `${t.d}/${t.m}${sameYear ? "" : `/${t.y}`} ${t.time}`;
}

/** "a les 12:35" / "a las 12:35" / "at 12:35". */
function atTime(iso: string, locale: Locale): string {
  const s = liveStamp(iso, locale);
  if (!s) return "";
  return locale === "ca" ? `a les ${s.time}` : locale === "es" ? `a las ${s.time}` : `at ${s.time}`;
}

/** "el 18/11/2026 a les 10:57" / "el 18/11/2026 a las 10:57" / "on 18 Nov 2026 at 10:57". */
function onDateAt(iso: string, locale: Locale): string {
  const s = liveStamp(iso, locale);
  if (!s) return "";
  if (locale === "ca") return `${caEl(s.date)} a les ${s.time}`;
  if (locale === "es") return `el ${s.date} a las ${s.time}`;
  return `on ${s.date} at ${s.time}`;
}

/* -------------------------------------------------------------------------- */
/* Presentation of source text                                                */
/* -------------------------------------------------------------------------- */

const LOWER_WORDS = new Set(["de", "del", "dels", "la", "les", "el", "els", "i", "a"]);

/** "SANT JOAN DE LES ABADESSES" → "Sant Joan de les Abadesses", "LA SEU D'URGELL" → "La Seu d'Urgell". Presentation only. */
export function townCase(value: string): string {
  const cap = (w: string) => w.charAt(0).toLocaleUpperCase("ca") + w.slice(1);
  let first = true;
  return value
    .toLocaleLowerCase("ca")
    .split(/(\s+|-)/)
    .map((token) => {
      if (/^\s+$|^-$/.test(token) || token === "") return token;
      const isFirst = first;
      first = false;
      const elided = /^([dl]')(.+)$/.exec(token);
      if (elided) return `${isFirst ? cap(elided[1] ?? "") : elided[1]}${cap(elided[2] ?? "")}`;
      if (!isFirst && LOWER_WORDS.has(token)) return token;
      return cap(token);
    })
    .join("");
}

const ROAD_WORDS: Record<"es" | "en", Record<string, string>> = {
  es: {
    Obres: "Obras",
    "Retenció": "Retención",
    "Calçada restringida": "Calzada restringida",
    "Calçada tallada": "Calzada cortada",
    "Calçada restringida. Desviaments": "Calzada restringida. Desvíos",
    "Calçada tallada. Desviaments": "Calzada cortada. Desvíos",
    "Circulació intensa": "Circulación intensa",
    "Circulació amb retencions": "Circulación con retenciones",
    "Circulació amb congestió": "Circulación con congestión",
    "Circulació aturada": "Circulación detenida",
    Accident: "Accidente",
    Avaria: "Avería",
    "Circulació": "Circulación",
    "Retirada de vehicle": "Retirada de vehículo",
    "Treballs de manteniment": "Trabajos de mantenimiento",
    "Obres en general": "Obras en general",
    Neteja: "Limpieza",
    "Senyalització horitzontal": "Señalización horizontal",
    "Treballs de jardineria": "Trabajos de jardinería",
    "Millora de traçat": "Mejora del trazado",
    "Manteniment de túnel": "Mantenimiento de túnel",
    "Reforçament de ferm": "Refuerzo del firme",
    "Reasfaltat": "Reasfaltado",
    "Esllavissada": "Desprendimiento",
  },
  en: {
    Obres: "Roadworks",
    "Retenció": "Queue",
    "Calçada restringida": "Lane restrictions",
    "Calçada tallada": "Road closed",
    "Calçada restringida. Desviaments": "Lane restrictions. Diversions",
    "Calçada tallada. Desviaments": "Road closed. Diversions",
    "Circulació intensa": "Heavy traffic",
    "Circulació amb retencions": "Slow traffic with queues",
    "Circulació amb congestió": "Congestion",
    "Circulació aturada": "Traffic stopped",
    Accident: "Accident",
    Avaria: "Breakdown",
    "Circulació": "Traffic",
    "Retirada de vehicle": "Vehicle recovery",
    "Treballs de manteniment": "Maintenance work",
    "Obres en general": "Roadworks",
    Neteja: "Cleaning",
    "Senyalització horitzontal": "Road markings",
    "Treballs de jardineria": "Verge maintenance",
    "Millora de traçat": "Road realignment",
    "Manteniment de túnel": "Tunnel maintenance",
    "Reforçament de ferm": "Resurfacing",
    "Reasfaltat": "Resurfacing",
    "Esllavissada": "Landslide",
  },
};

/** A closed-vocabulary SCT term in the reader's language; `lang` says when it stays in Catalan. */
export function roadWord(value: string, locale: Locale): { text: string; lang?: "ca" } {
  if (locale === "ca" || !value) return { text: value };
  const known = ROAD_WORDS[locale][value];
  return known ? { text: known } : { text: value, lang: "ca" };
}

const CARDINAL: Record<"es" | "en", Record<string, string>> = {
  es: { Nord: "Norte", Sud: "Sur", Est: "Este", Oest: "Oeste" },
  en: { Nord: "North", Sud: "South", Est: "East", Oest: "West" },
};

/** "Nord cap a GIRONA" → "Norte hacia GIRONA" / "North towards GIRONA"; the destination stays as SCT wrote it. */
export function directionText(direction: string, locale: Locale): string {
  if (locale === "ca") return direction;
  return direction
    .replace(/^Ambdós sentits/i, locale === "es" ? "Ambos sentidos" : "Both directions")
    .replace(/^(Nord|Sud|Est|Oest)\b/, (word) => CARDINAL[locale][word] ?? word)
    .replace(/\s+cap a\s+/i, locale === "es" ? " hacia " : " towards ");
}

function probabilityText(value: string, locale: Locale): string {
  if (/^mayor\s+70\s*%$/i.test(value)) return locale === "ca" ? "més del 70%" : locale === "es" ? "más del 70%" : "over 70%";
  return value;
}

/* -------------------------------------------------------------------------- */
/* Page words                                                                 */
/* -------------------------------------------------------------------------- */

export interface Words {
  title: string;
  description: string;
  h1: string;
  crumb: string;
  kicker: string;
  weatherTitle: string;
  inForceTitle: string;
  upcomingTitle: string;
  weatherCols: string[];
  civilTitle: string;
  civilCols: string[];
  roadsTitle: string;
  trafficTitle: string;
  trafficCols: string[];
  closuresTitle: string;
  worksTitle: string;
  worksCols: string[];
  /** "{n}" */
  worksSummary: string;
  levelsTitle: string;
  phasesTitle: string;
  methodTitle: string;
  meteocatTitle: string;
  related: string;
  sourcesTitle: string;
  sourcesNote: string;
  yes: string;
  no: string;
  textInSpanish: string;
  textInCatalan: string;
}

const WORDS: Record<Locale, Words> = {
  ca: {
    title: "Avisos ara a Catalunya: AEMET, trànsit i Protecció Civil",
    description:
      "Avisos meteorològics de l'AEMET en vigor, plans de Protecció Civil activats i incidències de trànsit del SCT, amb l'hora de cada lectura. Dades oficials.",
    h1: "Avisos ara a Catalunya",
    crumb: "Avisos ara",
    kicker: "En directe",
    weatherTitle: "Avisos meteorològics de l'AEMET",
    inForceTitle: "En vigor ara",
    upcomingTitle: "Previstos per a les pròximes hores i dies",
    weatherCols: ["Nivell", "Fenomen", "Zona de l'AEMET", "Província", "Des de", "Fins a", "Detall de l'AEMET"],
    civilTitle: "Plans de Protecció Civil activats",
    civilCols: ["Pla", "Fase", "Activat", "Des de", "Descripció", "Comunicat del CECAT"],
    roadsTitle: "Carreteres: incidències del Servei Català de Trànsit",
    trafficTitle: "Incidències de circulació",
    trafficCols: ["Tipus", "Carretera", "Municipi", "Sentit", "Km", "Què hi passa", "Des de"],
    closuresTitle: "Obres amb la calçada tallada",
    worksTitle: "Altres obres (calçada restringida)",
    worksCols: ["Carretera", "Municipi", "Sentit", "Km", "Què hi passa", "Des de"],
    worksSummary: "Veure les {n} obres amb restriccions de pas",
    levelsTitle: "Què vol dir cada nivell de l'AEMET",
    phasesTitle: "Prealerta, alerta i emergència",
    methodTitle: "Com es fa aquesta pàgina",
    meteocatTitle: "I els avisos del Meteocat?",
    related: "També en directe",
    sourcesTitle: "Fonts oficials",
    sourcesNote: "Llegides cada cinc minuts. Les dades es reprodueixen sense canviar-ne el contingut.",
    yes: "Sí",
    no: "No",
    textInSpanish: "Text de l'AEMET, en castellà.",
    textInCatalan: "",
  },
  es: {
    title: "Avisos hoy en Cataluña: AEMET, tráfico y Protección Civil",
    description:
      "Avisos meteorológicos de la AEMET en vigor, planes de Protección Civil activados e incidencias de tráfico del SCT, con la hora de cada lectura oficial.",
    h1: "Avisos hoy en Cataluña",
    crumb: "Avisos hoy",
    kicker: "En directo",
    weatherTitle: "Avisos meteorológicos de la AEMET",
    inForceTitle: "En vigor ahora",
    upcomingTitle: "Previstos para las próximas horas y días",
    weatherCols: ["Nivel", "Fenómeno", "Zona de la AEMET", "Provincia", "Desde", "Hasta", "Detalle de la AEMET"],
    civilTitle: "Planes de Protección Civil activados",
    civilCols: ["Plan", "Fase", "Activado", "Desde", "Descripción", "Comunicado del CECAT"],
    roadsTitle: "Carreteras: incidencias del Servei Català de Trànsit",
    trafficTitle: "Incidencias de circulación",
    trafficCols: ["Tipo", "Carretera", "Municipio", "Sentido", "Km", "Qué pasa", "Desde"],
    closuresTitle: "Obras con la calzada cortada",
    worksTitle: "Otras obras (calzada restringida)",
    worksCols: ["Carretera", "Municipio", "Sentido", "Km", "Qué pasa", "Desde"],
    worksSummary: "Ver las {n} obras con restricciones de paso",
    levelsTitle: "Qué significa cada nivel de la AEMET",
    phasesTitle: "Prealerta, alerta y emergencia",
    methodTitle: "Cómo se hace esta página",
    meteocatTitle: "¿Y los avisos de Meteocat?",
    related: "También en directo",
    sourcesTitle: "Fuentes oficiales",
    sourcesNote: "Leídas cada cinco minutos. Los datos se reproducen sin cambiar su contenido.",
    yes: "Sí",
    no: "No",
    textInSpanish: "",
    textInCatalan: "Texto del Servei Català de Trànsit, en catalán.",
  },
  en: {
    title: "Warnings in Catalonia now: weather, roads, civil protection",
    description:
      "AEMET weather warnings in force, Civil Protection plans activated and road incidents from Catalonia's traffic service, with the time of each reading.",
    h1: "Warnings in Catalonia now",
    crumb: "Warnings now",
    kicker: "Live",
    weatherTitle: "AEMET weather warnings",
    inForceTitle: "In force now",
    upcomingTitle: "Coming up in the next hours and days",
    weatherCols: ["Level", "Phenomenon", "AEMET zone", "Province", "From", "Until", "AEMET's details"],
    civilTitle: "Civil Protection plans activated",
    civilCols: ["Plan", "Phase", "Activated", "Since", "Description", "CECAT statement"],
    roadsTitle: "Roads: Servei Català de Trànsit incidents",
    trafficTitle: "Traffic incidents",
    trafficCols: ["Type", "Road", "Town", "Direction", "Km", "What", "Since"],
    closuresTitle: "Roadworks with the road closed",
    worksTitle: "Other roadworks (lane restrictions)",
    worksCols: ["Road", "Town", "Direction", "Km", "What", "Since"],
    worksSummary: "Show the {n} roadworks with lane restrictions",
    levelsTitle: "What each AEMET level means",
    phasesTitle: "Pre-alert, alert and emergency",
    methodTitle: "How this page works",
    meteocatTitle: "What about Meteocat's warnings?",
    related: "Also live",
    sourcesTitle: "Official sources",
    sourcesNote: "Read every five minutes. The data is reproduced without changing its content.",
    yes: "Yes",
    no: "No",
    textInSpanish: "AEMET's text, in Spanish.",
    textInCatalan: "Servei Català de Trànsit's text, in Catalan.",
  },
};

export function words(locale: Locale): Words {
  return WORDS[locale];
}

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/* -------------------------------------------------------------------------- */
/* Answer lines (header)                                                      */
/* -------------------------------------------------------------------------- */

function warningCount(n: number, locale: Locale): string {
  if (locale === "ca") return n === 1 ? "1 avís" : `${n} avisos`;
  if (locale === "es") return n === 1 ? "1 aviso" : `${n} avisos`;
  return n === 1 ? "1 warning" : `${n} warnings`;
}

function listNames(names: string[], locale: Locale): string {
  if (names.length <= 1) return names.join("");
  const and = locale === "ca" ? " i " : locale === "es" ? " y " : " and ";
  return `${names.slice(0, -1).join(", ")}${and}${names.at(-1)}`;
}

function phenomenaList(warnings: WeatherWarning[], locale: Locale): string {
  return listNames(phenomena(warnings).map((p) => phenomenonName(p.code, p.es, locale).toLocaleLowerCase(locale)), locale);
}

function levelWord(level: WarningLevel, locale: Locale): string {
  return LEVEL_NAMES[locale][level];
}

function failedLine(source: "weather" | "roads" | "civil", now: string, locale: Locale): string {
  const at = atTime(now, locale);
  const links = {
    weather: { ca: `No hem pogut llegir els avisos de l'AEMET ${at}: consulta'ls a [la web de l'AEMET](${URLS.aemetWarnings.ca}).`, es: `No hemos podido leer los avisos de la AEMET ${at}: consúltalos en [la web de la AEMET](${URLS.aemetWarnings.es}).`, en: `We could not read AEMET's warnings ${at}: check them on [AEMET's website](${URLS.aemetWarnings.en}).` },
    roads: { ca: `No hem pogut llegir una llista actual del Servei Català de Trànsit ${at}: consulta-la a [Estat del trànsit](${URLS.sctStatus.ca}).`, es: `No hemos podido leer una lista actual del Servei Català de Trànsit ${at}: consúltala en [Estat del trànsit](${URLS.sctStatus.es}).`, en: `We could not read a current list from the Servei Català de Trànsit ${at}: check its [traffic status page](${URLS.sctStatus.en}) (in Catalan).` },
    civil: { ca: `No hem pogut llegir les dades de Protecció Civil ${at}: consulta [Protecció Civil](${URLS.civilHome.ca}).`, es: `No hemos podido leer los datos de Protección Civil ${at}: consulta [Protecció Civil](${URLS.civilHome.es}).`, en: `We could not read Civil Protection's data ${at}: see [Protecció Civil](${URLS.civilHome.en}) (in Catalan).` },
  };
  return links[source][locale];
}

/** The three one-line answers under the H1, in this order: weather, Civil Protection, roads. */
export function answerLines(view: WarningsView, locale: Locale): string[] {
  const now = new Date(view.now).toISOString();
  const at = atTime(now, locale);
  const lines: string[] = [];

  if (view.weather.kind === "none") lines.push(failedLine("weather", now, locale));
  else {
    const { inForce, upcoming } = splitWarnings(view.weather.read.warnings, view.now);
    const top = maxLevel(inForce);
    if (top) {
      const n = warningCount(inForce.length, locale);
      const list = phenomenaList(inForce, locale);
      lines.push(
        locale === "ca"
          ? `**Ara hi ha ${n} de l'AEMET en vigor a Catalunya** (nivell màxim: ${levelWord(top, locale)}): ${list}.`
          : locale === "es"
            ? `**Ahora hay ${n} de la AEMET en vigor en Cataluña** (nivel máximo: ${levelWord(top, locale)}): ${list}.`
            : `**${n.charAt(0).toUpperCase()}${n.slice(1)} from AEMET in force in Catalonia now** (highest level: ${levelWord(top, locale)}): ${list}.`,
      );
    } else {
      lines.push(locale === "ca" ? `**No hi ha avisos en vigor segons l'AEMET ${at}.**` : locale === "es" ? `**No hay avisos en vigor según la AEMET ${at}.**` : `**No warnings in force according to AEMET ${at}.**`);
    }
    if (upcoming.length > 0) {
      const first = startText(upcoming[0]!.onset, locale);
      const n = warningCount(upcoming.length, locale);
      const one = upcoming.length === 1;
      const up = maxLevel(upcoming)!;
      const list = phenomenaList(upcoming, locale);
      lines.push(
        locale === "ca"
          ? `${top ? "A més, hi ha" : "Hi ha"} ${n} ${one ? "previst" : "previstos"}; ${one ? "comença" : "el primer comença"} ${first} (nivell màxim: ${levelWord(up, locale)}): ${list}.`
          : locale === "es"
            ? `${top ? "Además, hay" : "Hay"} ${n} ${one ? "previsto" : "previstos"}; ${one ? "empieza" : "el primero empieza"} el ${first} (nivel máximo: ${levelWord(up, locale)}): ${list}.`
            : `${n.charAt(0).toUpperCase()}${n.slice(1)} ${top ? "more " : ""}coming up; ${one ? "it starts" : "the first starts"} ${first} (highest level: ${levelWord(up, locale)}): ${list}.`,
      );
    }
  }

  if (view.civil.kind === "none") lines.push(failedLine("civil", now, locale));
  else if (view.civil.read.plans.length === 0) {
    lines.push(
      locale === "ca"
        ? "Protecció Civil: cap pla en prealerta, alerta o emergència."
        : locale === "es"
          ? "Protección Civil: ningún plan en prealerta, alerta o emergencia."
          : "Civil Protection: no plan in pre-alert, alert or emergency.",
    );
  } else {
    const list = listNames(view.civil.read.plans.map((p) => `**${p.acronym || p.name}** (${phaseName(p.phase, locale).toLocaleLowerCase(locale)})`), locale);
    lines.push(locale === "ca" ? `Protecció Civil: ${list}.` : locale === "es" ? `Protección Civil: ${list}.` : `Civil Protection: ${list}.`);
  }

  if (view.roads.kind === "none") lines.push(failedLine("roads", now, locale));
  else {
    const g = groupRoads(view.roads.read.incidents);
    const t = g.traffic.length;
    const c = g.closures.length;
    lines.push(
      locale === "ca"
        ? `Carreteres: ${t === 1 ? "1 incidència" : `${t} incidències`} de circulació i ${c === 1 ? "1 obra" : `${c} obres`} amb la calçada tallada, segons el Servei Català de Trànsit.`
        : locale === "es"
          ? `Carreteras: ${t === 1 ? "1 incidencia" : `${t} incidencias`} de circulación y ${c === 1 ? "1 obra" : `${c} obras`} con la calzada cortada, según el Servei Català de Trànsit.`
          : `Roads: ${t === 1 ? "1 traffic incident" : `${t} traffic incidents`} and ${c === 1 ? "1 roadworks closure" : `${c} roadworks closures`}, according to the Servei Català de Trànsit.`,
    );
  }
  return lines;
}

/** "Dades llegides a les 12:35 del 18/11/2026 (hora de Catalunya)…" */
export function readLine(view: WarningsView, locale: Locale): string {
  const s = liveStamp(new Date(view.now).toISOString(), locale);
  if (!s) return "";
  if (locale === "ca") return `Dades llegides a les ${s.time} ${caDel(s.date)} (hora de Catalunya). La pàgina es torna a llegir cada 5 minuts.`;
  if (locale === "es") return `Datos leídos a las ${s.time} del ${s.date} (hora de Cataluña). La página se vuelve a leer cada 5 minutos.`;
  return `Data read at ${s.time} on ${s.date} (Catalan time). The page is read again every 5 minutes.`;
}

/* -------------------------------------------------------------------------- */
/* Section notes                                                              */
/* -------------------------------------------------------------------------- */

/** Said when the source did not answer this time and an earlier read is shown. */
function keptNote(state: SourceState<{ answeredAt: string }>, name: Record<Locale, string>, now: number, locale: Locale): string | null {
  if (state.kind !== "kept") return null;
  const nowIso = new Date(now).toISOString();
  const was = atTime(state.read.answeredAt, locale);
  if (locale === "ca") return `${name.ca} no ha respost ${atTime(nowIso, locale)}: és la darrera lectura correcta, ${was}.`;
  if (locale === "es") return `${name.es} no ha respondido ${atTime(nowIso, locale)}: es la última lectura correcta, ${was}.`;
  return `${name.en} did not answer ${atTime(nowIso, locale)}: this is the last good reading, ${was}.`;
}

const NAMES = {
  aemet: { ca: "L'AEMET", es: "La AEMET", en: "AEMET" },
  sct: { ca: "El Servei Català de Trànsit", es: "El Servei Català de Trànsit", en: "The Servei Català de Trànsit" },
  civil: { ca: "Protecció Civil", es: "Protección Civil", en: "Civil Protection" },
};

export function weatherNotes(view: WarningsView, locale: Locale): { empty: { inForce: string; upcoming: string }; kept: string | null; unread: string | null; failed: string; source: string } {
  const nowIso = new Date(view.now).toISOString();
  const at = atTime(nowIso, locale);
  const read = view.weather.kind === "none" ? null : view.weather.read;
  const issued = read ? onDateAt(read.issued, locale) : "";
  const answered = read ? atTime(read.answeredAt, locale) : "";
  const unread = read && read.unread > 0 ? read.unread : 0;
  const t = {
    ca: {
      inForce: `No hi ha avisos en vigor segons l'AEMET ${at}.`,
      upcoming: "Tampoc no n'hi ha cap de previst als avisos que l'AEMET ha emès per als pròxims dies.",
      unread: `El fitxer de l'AEMET llista ${unread} ${unread === 1 ? "avís" : "avisos"} més que no hem pogut llegir: consulta'ls a [la web de l'AEMET](${URLS.aemetWarnings.ca}).`,
      source: `Font: ${AEMET_CREDIT} (pla Meteoalerta). Fitxer d'avisos per a Catalunya elaborat ${issued}; llegit ${answered}. Els noms dels fenòmens són traducció nostra; la zona i el detall, tal com els escriu l'AEMET. L'AEMET no participa en aquesta pàgina ni la patrocina. [Avisos de l'AEMET per a Catalunya](${URLS.aemetWarnings.ca}).`,
    },
    es: {
      inForce: `No hay avisos en vigor según la AEMET ${at}.`,
      upcoming: "Tampoco hay ninguno previsto en los avisos que la AEMET ha emitido para los próximos días.",
      unread: `El fichero de la AEMET lista ${unread} ${unread === 1 ? "aviso" : "avisos"} más que no hemos podido leer: consúltalos en [la web de la AEMET](${URLS.aemetWarnings.es}).`,
      source: `Fuente: ${AEMET_CREDIT} (plan Meteoalerta). Fichero de avisos para Cataluña elaborado ${issued}; leído ${answered}. La AEMET no participa en esta página ni la patrocina. [Avisos de la AEMET para Cataluña](${URLS.aemetWarnings.es}).`,
    },
    en: {
      inForce: `No warnings in force according to AEMET ${at}.`,
      upcoming: "Nor are there any coming up in the warnings AEMET has issued for the next few days.",
      unread: `AEMET's file lists ${unread} more ${unread === 1 ? "warning" : "warnings"} we could not read: check them on [AEMET's website](${URLS.aemetWarnings.en}).`,
      source: `Source: ${AEMET_CREDIT} (information produced by Spain's State Meteorological Agency, Meteoalerta plan). Catalonia warnings file built ${issued}; read ${answered}. Phenomenon names are our translation; zones and details as AEMET writes them. AEMET does not take part in or sponsor this page. [AEMET warnings for Catalonia](${URLS.aemetWarnings.en}).`,
    },
  }[locale];
  return {
    empty: { inForce: t.inForce, upcoming: t.upcoming },
    kept: keptNote(view.weather, NAMES.aemet, view.now, locale),
    unread: unread > 0 ? t.unread : null,
    failed: failedLine("weather", nowIso, locale),
    source: t.source,
  };
}

export function civilNotes(view: WarningsView, locale: Locale): { empty: string; kept: string | null; failed: string; source: string } {
  const nowIso = new Date(view.now).toISOString();
  const at = atTime(nowIso, locale);
  const read = view.civil.kind === "none" ? null : view.civil.read;
  const updated = read?.updated ? onDateAt(read.updated, locale) : null;
  const answered = read ? atTime(read.answeredAt, locale) : "";
  const t = {
    ca: {
      empty: `No hi ha cap pla de Protecció Civil en prealerta, alerta o emergència segons les dades obertes de Protecció Civil ${at}.`,
      source: `Font: ${CIVIL_CREDIT}, [Plans de protecció civil en fase de prealerta, alerta o emergència](${URLS.civilDataset}) (dades obertes, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})).${updated ? ` Darrera actualització del conjunt de dades: ${updated}.` : ""} Llegit ${answered}.`,
    },
    es: {
      empty: `No hay ningún plan de Protección Civil en prealerta, alerta o emergencia según los datos abiertos de Protecció Civil ${at}.`,
      source: `Fuente: ${CIVIL_CREDIT}, [Plans de protecció civil en fase de prealerta, alerta o emergència](${URLS.civilDataset}) (datos abiertos, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})).${updated ? ` Última actualización del conjunto de datos: ${updated}.` : ""} Leído ${answered}.`,
    },
    en: {
      empty: `No Civil Protection plan in pre-alert, alert or emergency according to Protecció Civil's open data ${at}.`,
      source: `Source: ${CIVIL_CREDIT}, [Plans de protecció civil en fase de prealerta, alerta o emergència](${URLS.civilDataset}) (open data, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})).${updated ? ` Dataset last updated ${updated}.` : ""} Read ${answered}.`,
    },
  }[locale];
  return { empty: t.empty, kept: keptNote(view.civil, NAMES.civil, view.now, locale), failed: failedLine("civil", nowIso, locale), source: t.source };
}

export function roadsNotes(view: WarningsView, locale: Locale): { emptyTraffic: string; emptyClosures: string; kept: string | null; failed: string; source: string; language: string | null } {
  const nowIso = new Date(view.now).toISOString();
  const at = atTime(nowIso, locale);
  const read = view.roads.kind === "none" ? null : view.roads.read;
  const published = read ? onDateAt(read.published, locale) : "";
  const answered = read ? atTime(read.answeredAt, locale) : "";
  const t = {
    ca: {
      emptyTraffic: `No hi ha incidències de circulació segons el Servei Català de Trànsit ${at}.`,
      emptyClosures: "Cap obra amb la calçada tallada.",
      source: `Font: ${SCT_CREDIT}, [Incidències viàries en temps real a Catalunya](${URLS.sctDataset}) (dades obertes, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})). Darrera actualització del Servei Català de Trànsit: ${published}; llegit ${answered}. [Estat del trànsit](${URLS.sctStatus.ca}).`,
      language: null,
    },
    es: {
      emptyTraffic: `No hay incidencias de circulación según el Servei Català de Trànsit ${at}.`,
      emptyClosures: "Ninguna obra con la calzada cortada.",
      source: `Fuente: ${SCT_CREDIT}, [Incidències viàries en temps real a Catalunya](${URLS.sctDataset}) (datos abiertos, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})). Última actualización del Servei Català de Trànsit: ${published}; leído ${answered}. [Estat del trànsit](${URLS.sctStatus.es}).`,
      language: "El Servei Català de Trànsit publica las incidencias en catalán: traducimos los tipos y los términos fijos; los municipios, los destinos y los términos que no tenemos traducidos quedan como los escribe.",
    },
    en: {
      emptyTraffic: `No traffic incidents according to the Servei Català de Trànsit ${at}.`,
      emptyClosures: "No roadworks with the road closed.",
      source: `Source: ${SCT_CREDIT}, [Incidències viàries en temps real a Catalunya](${URLS.sctDataset}) (open data, [Llicència oberta d'ús d'informació – Catalunya](${URLS.gencatLicence})). Last updated by the Servei Català de Trànsit ${published}; read ${answered}. [Traffic status page](${URLS.sctStatus.en}) (in Catalan).`,
      language: "The Servei Català de Trànsit publishes incidents in Catalan: we translate the types and fixed terms; town names, destinations and any term we have no translation for stay as it writes them.",
    },
  }[locale];
  return { emptyTraffic: t.emptyTraffic, emptyClosures: t.emptyClosures, kept: keptNote(view.roads, NAMES.sct, view.now, locale), failed: failedLine("roads", nowIso, locale), source: t.source, language: t.language };
}

/* -------------------------------------------------------------------------- */
/* Rows                                                                       */
/* -------------------------------------------------------------------------- */

export interface Cell {
  text: string;
  lang?: "ca" | "es";
  href?: string;
  level?: WarningLevel;
}

export function weatherRow(w: WeatherWarning, locale: Locale): Cell[] {
  const detail = [w.description, w.probability ? `(${locale === "ca" ? "probabilitat" : locale === "es" ? "probabilidad" : "probability"} ${probabilityText(w.probability, locale)})` : ""].filter(Boolean).join(" ");
  return [
    { text: levelWord(w.level, locale), level: w.level },
    { text: phenomenonName(w.phenomenon, w.phenomenonEs, locale) },
    { text: w.zone, lang: locale === "es" ? undefined : "es" },
    { text: provinceOf(w.zoneCode) ?? "—" },
    { text: rowTime(w.onset, locale) },
    { text: rowTime(w.expires, locale) },
    { text: detail || "—", lang: locale === "es" ? undefined : "es" },
  ];
}

function what(i: RoadIncident, locale: Locale): Cell {
  const cause = roadWord(i.cause, locale);
  const description = roadWord(i.description, locale);
  const text = [cause.text, description.text].filter(Boolean).join(". ");
  return { text, lang: cause.lang ?? description.lang };
}

export function roadRow(i: RoadIncident, locale: Locale, now: number, withType: boolean): Cell[] {
  const type = roadWord(i.type, locale);
  const cells: Cell[] = [
    { text: i.road },
    { text: i.municipality ? townCase(i.municipality) : "—" },
    { text: i.direction ? directionText(i.direction, locale) : "—" },
    { text: i.km ? i.km.replace("-", "–") : "—" },
    what(i, locale),
    { text: sinceTime(i.since, locale, now) },
  ];
  return withType ? [{ text: type.text, lang: type.lang }, ...cells] : cells;
}

export function civilRow(p: CivilPlan, locale: Locale): Cell[] {
  const w = words(locale);
  const activated = p.activated === null ? "—" : /^s[ií]$/i.test(p.activated) ? w.yes : /^no$/i.test(p.activated) ? w.no : p.activated;
  return [
    { text: [p.acronym, p.name].filter(Boolean).join(" — "), lang: locale === "ca" ? undefined : "ca" },
    { text: phaseName(p.phase, locale) },
    { text: activated },
    { text: p.since ?? "—" },
    { text: p.description ?? "—", lang: locale === "ca" ? undefined : "ca" },
    p.communique ? { text: "PDF", href: p.communique } : { text: "—" },
  ];
}

/* -------------------------------------------------------------------------- */
/* Guidance                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * AEMET's level definitions, from its warnings guide (aemet.es/es/eltiempo/
 * prediccion/avisos/ayuda, read 18 Nov 2026; the page is in Spanish only):
 * quoted in Spanish, translated by us in Catalan and English.
 */
export function levelItems(locale: Locale): { level: WarningLevel; text: string }[] {
  const L = {
    es: [
      "el peligro es bajo, pero los bienes y la población vulnerables o en zonas expuestas al FMA podrían sufrir algunos impactos. Recomendación: «ESTÉ ATENTO. Manténgase informado de la predicción meteorológica más actualizada».",
      "el peligro es importante. Los bienes y la población vulnerables o en zonas expuestas podrían sufrir impactos graves. Recomendación: «ESTÉ PREPARADO. Tome precauciones y manténgase informado de la predicción meteorológica más actualizada».",
      "el peligro es extraordinario. Los bienes y la población vulnerables o en zonas expuestas podrían sufrir impactos muy graves o catastróficos. Recomendación: «Tome medidas preventivas y ACTÚE según las indicaciones de las autoridades. Manténgase informado de la predicción meteorológica más actualizada. No viaje salvo que sea estrictamente necesario».",
    ],
    ca: [
      "el perill és baix, però els béns i la població vulnerables o en zones exposades al fenomen podrien patir alguns impactes. Recomanació: estigues atent i informa't de la predicció meteorològica més actualitzada.",
      "el perill és important. Els béns i la població vulnerables o en zones exposades podrien patir impactes greus. Recomanació: estigues preparat, pren precaucions i informa't de la predicció més actualitzada.",
      "el perill és extraordinari. Els béns i la població vulnerables o en zones exposades podrien patir impactes molt greus o catastròfics. Recomanació: pren mesures preventives i actua segons les indicacions de les autoritats; no viatgis si no és estrictament necessari.",
    ],
    en: [
      "the danger is low, but vulnerable or exposed people and property could suffer some impacts. Advice: be aware and keep up to date with the latest forecast.",
      "the danger is significant. Vulnerable or exposed people and property could suffer serious impacts. Advice: be prepared, take precautions and keep up to date with the latest forecast.",
      "the danger is extraordinary. Vulnerable or exposed people and property could suffer very serious or catastrophic impacts. Advice: take preventive measures and act on the authorities' instructions; do not travel unless strictly necessary.",
    ],
  }[locale];
  return (["yellow", "orange", "red"] as const).map((level, i) => ({ level, text: L[i] ?? "" }));
}

export function levelsNote(locale: Locale): string {
  if (locale === "ca") return `Definicions de la [guia d'avisos de l'AEMET](${URLS.aemetHelp}), en castellà a l'original (traducció nostra). L'AEMET emet els avisos preferentment de 07:30 a 09:00 (per a avui) i de 10:30 a 11:30 (per a demà i demà passat), i els revisa de 17:00 a 19:00.`;
  if (locale === "es") return `Definiciones de la [guía de avisos de la AEMET](${URLS.aemetHelp}). FMA: fenómeno meteorológico adverso. La AEMET emite los avisos preferentemente de 07:30 a 09:00 (para hoy) y de 10:30 a 11:30 (para mañana y pasado mañana), y los revisa de 17:00 a 19:00.`;
  return `Definitions from [AEMET's warnings guide](${URLS.aemetHelp}), in Spanish in the original (our translation). AEMET issues warnings mainly from 07:30 to 09:00 (for today) and from 10:30 to 11:30 (for the next two days), and reviews them from 17:00 to 19:00.`;
}

/** Phases as the dataset's own description defines them. */
export function phaseParagraphs(locale: Locale): string[] {
  const plans = Object.entries(PLAN_TYPES).map(([acronym, type]) => `${acronym} (${type[locale]})`);
  if (locale === "ca") {
    return [
      "Segons la fitxa del conjunt de dades de Protecció Civil: la **prealerta** es produeix quan és previsible un fenomen que pot produir situacions de risc per a la població a mitjà termini, i també en el seguiment d'incidències o al final d'una emergència; **no implica l'activació del pla**. El pla s'activa en **alerta** quan hi ha paràmetres objectius que fan preveure una situació d'emergència important a curt termini, o afectacions que no afecten de forma greu o generalitzada persones, béns o vies de comunicació. L'**emergència** és per a les situacions que comporten, o poden comportar per la seva evolució, un greu risc per a la població.",
      `Els plans de la Generalitat i el risc de cadascun, segons les dades obertes de Protecció Civil: ${plans.join(", ")}. Quan un pla està activat, els comunicats del Centre de Coordinació Operativa de Catalunya (CECAT) poden incloure consells d'autoprotecció, comarques afectades o restriccions. En una emergència, truca al **112**.`,
    ];
  }
  if (locale === "es") {
    return [
      "Según la ficha del conjunto de datos de Protecció Civil: la **prealerta** se produce cuando es previsible un fenómeno que puede producir situaciones de riesgo para la población a medio plazo, y también en el seguimiento de incidencias o al final de una emergencia; **no implica la activación del plan**. El plan se activa en **alerta** cuando hay parámetros objetivos que hacen prever una situación de emergencia importante a corto plazo, o afectaciones que no afectan de forma grave o generalizada a personas, bienes o vías de comunicación. La **emergencia** es para las situaciones que comportan, o pueden comportar por su evolución, un riesgo grave para la población.",
      `Los planes de la Generalitat y el riesgo de cada uno, según los datos abiertos de Protecció Civil: ${plans.join(", ")}. Cuando un plan está activado, los comunicados del Centre de Coordinació Operativa de Catalunya (CECAT) pueden incluir consejos de autoprotección, comarcas afectadas o restricciones. En una emergencia, llama al **112**.`,
    ];
  }
  return [
    "According to the dataset's own description: **pre-alert** is declared when a phenomenon that may put people at risk in the medium term is foreseeable, and also while incidents are monitored or as an emergency ends; **it does not mean the plan is activated**. A plan is activated in **alert** when objective parameters point to a serious emergency in the short term, or when there are impacts that do not seriously or widely affect people, property or roads. **Emergency** is for situations that carry, or may carry as they develop, a serious risk to the population.",
    `The Generalitat's plans and the risk each covers, from Protecció Civil's open data: ${plans.join(", ")}. When a plan is active, the statements of the Catalan Operational Coordination Centre (CECAT) may include self-protection advice, affected counties or restrictions. In an emergency, call **112**.`,
  ];
}

export function methodParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [
      "Aquesta pàgina llegeix cada cinc minuts tres fonts oficials i en mostra les dades com les publiquen, amb l'hora de cada lectura: els avisos del pla Meteoalerta de l'AEMET per a Catalunya, el conjunt de dades obertes de Protecció Civil amb els plans en prealerta, alerta o emergència, i les incidències viàries del Servei Català de Trànsit.",
      "No hi afegim res: no calculem cap avís ni omplim cap buit, i el text de cada avís de l'AEMET es reprodueix en castellà, tal com l'escriu. Un avís surt fins a l'hora de final que li dona l'AEMET. Si una font no respon, la pàgina mostra la darrera lectura correcta amb la seva hora, només si és recent (tres hores per a l'AEMET i Protecció Civil, 45 minuts per a Trànsit); si no, ho diu i enllaça la font.",
      "La pàgina no substitueix els canals oficials: per a una emergència, el 112; per a les indicacions de les autoritats, Protecció Civil i el Servei Català de Trànsit.",
    ];
  }
  if (locale === "es") {
    return [
      "Esta página lee cada cinco minutos tres fuentes oficiales y muestra sus datos como los publican, con la hora de cada lectura: los avisos del plan Meteoalerta de la AEMET para Cataluña, el conjunto de datos abiertos de Protecció Civil con los planes en prealerta, alerta o emergencia, y las incidencias viarias del Servei Català de Trànsit.",
      "No añadimos nada: no calculamos ningún aviso ni rellenamos huecos, y el texto de cada aviso de la AEMET se reproduce tal como lo escribe. Un aviso aparece hasta la hora de fin que le da la AEMET. Si una fuente no responde, la página muestra la última lectura correcta con su hora, solo si es reciente (tres horas para la AEMET y Protección Civil, 45 minutos para Trànsit); si no, lo dice y enlaza la fuente.",
      "La página no sustituye a los canales oficiales: para una emergencia, el 112; para las indicaciones de las autoridades, Protecció Civil y el Servei Català de Trànsit.",
    ];
  }
  return [
    "This page reads three official sources every five minutes and shows their data as published, with the time of each reading: AEMET's Meteoalerta warnings for Catalonia, Protecció Civil's open dataset of plans in pre-alert, alert or emergency, and the Servei Català de Trànsit's road incidents.",
    "We add nothing: no warning is worked out or filled in, and the text of each AEMET warning is reproduced in Spanish, as AEMET writes it. A warning is shown until the end time AEMET gives it. If a source does not answer, the page shows the last good reading with its time, only while recent (three hours for AEMET and Civil Protection, 45 minutes for traffic); otherwise it says so and links the source.",
    "The page does not replace the official channels: in an emergency call 112; for the authorities' instructions, follow Protecció Civil and the Servei Català de Trànsit.",
  ];
}

export function meteocatParagraph(locale: Locale): string {
  if (locale === "ca") return `El Servei Meteorològic de Catalunya emet els seus propis avisos de situació meteorològica de perill (SMP). Encara no surten en aquesta pàgina perquè l'API del Meteocat demana una clau d'accés amb registre; es poden consultar a la [pàgina d'avisos SMP del Meteocat](${URLS.meteocatSmp}).`;
  if (locale === "es") return `El Servei Meteorològic de Catalunya emite sus propios avisos de situación meteorológica de peligro (SMP). Aún no aparecen en esta página porque la API de Meteocat pide una clave de acceso con registro; se pueden consultar en la [página de avisos SMP de Meteocat](${URLS.meteocatSmp}).`;
  return `The Catalan Meteorological Service (Meteocat) issues its own dangerous-weather warnings (SMP). They are not on this page yet because Meteocat's API requires a registered access key; see [Meteocat's SMP warnings page](${URLS.meteocatSmp}) (in Catalan).`;
}

/* -------------------------------------------------------------------------- */
/* Links and sources                                                          */
/* -------------------------------------------------------------------------- */

export function relatedLinks(locale: Locale): { label: string; href: string }[] {
  return [
    { label: { ca: "Avui a Catalunya: festius, vagues, Rodalies i preus", es: "Hoy en Cataluña: festivos, huelgas, Rodalies y precios", en: "Today in Catalonia: holidays, strikes, Rodalies and prices" }[locale], href: todayPath(locale) },
    { label: { ca: "Hi ha neu al Pirineu avui?", es: "¿Hay nieve en el Pirineo hoy?", en: "Is there snow in the Pyrenees today?" }[locale], href: b2href("snowNow", locale) },
    { label: { ca: "Rodalies en directe", es: "Rodalies en directo", en: "Rodalies trains live" }[locale], href: rodaliesHubPath(locale) },
    { label: { ca: "El temps a Barcelona mes a mes", es: "El tiempo en Barcelona mes a mes", en: "Barcelona weather by month" }[locale], href: b2href("climate", locale) },
  ];
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

export function sources(locale: Locale): SourceItem[] {
  const live = locale === "ca" ? "en directe" : locale === "es" ? "en directo" : "live";
  const licence = locale === "ca" ? "reutilització autoritzada citant la font" : locale === "es" ? "reutilización autorizada citando la fuente" : "reuse authorised with attribution";
  return [
    { name: "Avisos de fenómenos meteorológicos adversos — Cataluña (RSS y CAP)", publisher: "AEMET", url: URLS.aemetRssInfo, note: `${live}; ${licence}` },
    { name: "Nota legal (uso y reutilización)", publisher: "AEMET", url: URLS.aemetLegal, note: licence },
    { name: "Avisos: ayuda (niveles)", publisher: "AEMET", url: URLS.aemetHelp, note: locale === "ca" ? "llegit el 18/11/2026" : locale === "es" ? "leído el 18/11/2026" : "read 18 Nov 2026" },
    { name: "Plans de protecció civil en fase de prealerta, alerta o emergència", publisher: CIVIL_CREDIT, url: URLS.civilDataset, note: `${live}; Llicència oberta d'ús d'informació – Catalunya` },
    { name: "Nombre d'avisos i activacions dels plans de Protecció Civil", publisher: CIVIL_CREDIT, url: URLS.civilPlansDataset, note: locale === "ca" ? "plans i riscos, llegit el 18/11/2026" : locale === "es" ? "planes y riesgos, leído el 18/11/2026" : "plans and risks, read 18 Nov 2026" },
    { name: "Incidències viàries en temps real a Catalunya", publisher: SCT_CREDIT, url: URLS.sctDataset, note: `${live}; Llicència oberta d'ús d'informació – Catalunya` },
    { name: "Llicència oberta d'ús d'informació – Catalunya", publisher: "Generalitat de Catalunya", url: URLS.gencatLicence, note: licence },
    { name: "Avisos de situació meteorològica de perill (SMP)", publisher: "Servei Meteorològic de Catalunya", url: URLS.meteocatSmp, note: locale === "ca" ? "no inclosos aquí" : locale === "es" ? "no incluidos aquí" : "not included here" },
  ];
}
