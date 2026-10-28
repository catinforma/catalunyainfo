/**
 * Words of the mountain-weather pages. Pure: every fact comes from the
 * snapshot (Meteocat stations, ICGC toponyms, distances) or from places.ts
 * and the links below (official pages read on 28 Oct 2026). Nothing here
 * states a temperature, a wind or a snow depth: those are the browser's, from
 * the readings it fetches, so the cached HTML can never be out of date.
 */

import { b2href, type B2Key } from "@/lib/content/batch02/shared";
import { AREA_ORDER, METEOCAT_XEMA_URL, formatInt, stationUrl } from "@/lib/content/snow/depth";
import type { Locale } from "@/lib/i18n/config";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";

import { HUB_ONLY_PLACES, PAGE_PLACES, SNAPSHOT, siblings, type Place, type PlaceStation } from "./data";
import type { Measures } from "./live";
import { hubMeta, placeTitle } from "./pages";
import { MAX_DISTANCE_KM, ALTITUDE_MARGIN_M, MIN_SKI_STATION_ALTITUDE_M } from "./prepare";
import { hubPath, placePath, type PlaceLocale } from "./paths";
import type { SnapshotStation } from "./types";

const link = (label: string, url: string) => `[${label}](${url})`;

export interface LinkItem {
  label: string;
  href: string;
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

/** Props of the client block for one station: labels only, no readings. */
export interface LiveStationProps {
  code: string;
  label: string;
  detail: string;
  measures: Measures;
  url: string;
}

/* -------------------------------------------------------------------------- */
/* Official URLs (checked 28 Oct 2026)                                        */
/* -------------------------------------------------------------------------- */

export const OFFICIAL = {
  meteocatSki: "https://www.meteo.cat/prediccio/esqui",
  meteocatPyrenees: "https://www.meteo.cat/prediccio/pirineu",
  meteocatMunicipal: (code: string) => `https://www.meteo.cat/prediccio/municipal/${code}`,
  aemetMountain: (locale: Locale) => `https://www.aemet.es/${locale === "ca" ? "ca" : locale === "en" ? "en" : "es"}/eltiempo/prediccion/montana?w=&p=cat1`,
  bpa: (locale: Locale) =>
    locale === "ca"
      ? "https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Butlleti-de-Perill-dAllaus-BPA"
      : locale === "es"
        ? "https://www.icgc.cat/es/Ambitos-tematicos/Riesgos-y-emergencias/Aludes/Boletin-de-Peligro-de-Aludes-BPA"
        : "https://www.icgc.cat/en/Thematic-areas/Risks-and-emergencies/Avalanches/Avalanche-Danger-Bulletin-BPA",
  bpaNivo: "https://bpa.icgc.cat/",
  traffic: (locale: Locale) => `https://transit.gencat.cat/${locale === "es" ? "es" : "ca"}/informacio-viaria/estat-transit/`,
  meteocatLegal: "https://www.meteo.cat/wpweb/avis-legal/",
  xemaDataset: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee",
  stationsDataset: "https://analisi.transparenciacatalunya.cat/d/yqwd-vj5e",
  icgcGeocoder: "https://eines.icgc.cat/geocodificador/",
} as const;

/** The day the ICGC notice says the daily avalanche bulletin resumes (notice of 26 May 2026, read 28 Oct 2026). */
export const BPA_RESUMES = "2026-12-01";

/* -------------------------------------------------------------------------- */
/* Small words                                                                */
/* -------------------------------------------------------------------------- */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Catalan "de" + a name: "del Montseny", "dels Ports", "d'Espot Esquí", "de la Molina". */
export function caOf(name: string): string {
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(l'|[aeiouàèéíòóúAEIOUÀÈÉÍÒÓÚhH])/.test(name) && !name.startsWith("l'")) return `d'${name}`;
  return `de ${name}`;
}

/** Spanish "de" + a name: "del Montseny", "de La Molina". */
export const esOf = (name: string) => (name.startsWith("el ") ? `del ${name.slice(3)}` : `de ${name}`);

export function onDate(iso: string, locale: Locale): string {
  if (locale === "ca") return `${caDayArticle(iso)}${dayMonthYear(iso, "ca")}`;
  if (locale === "es") return `el ${dayMonthYear(iso, "es")}`;
  return `on ${dayMonthYear(iso, "en")}`;
}

export const km = (n: number, locale: Locale) => `${locale === "en" ? n.toFixed(1) : n.toFixed(1).replace(".", ",")} km`;
export const metres = (n: number, locale: Locale) => `${formatInt(n, locale)} m`;
const range = (min: number, max: number, locale: Locale) => `${formatInt(min, locale)}–${metres(max, locale)}`;

/** "la Tosa d'Alp (2.478 m)". */
export const stationLabel = (s: SnapshotStation, locale: Locale) => `${s.name} (${metres(s.altitude, locale)})`;

function measuresText(s: SnapshotStation, locale: Locale): string {
  const parts: string[] = [];
  const m = s.measures;
  if (locale === "ca") {
    if (m.temperature) parts.push("temperatura");
    if (m.wind) parts.push(`vent (a ${m.wind} m)`);
    if (m.snow) parts.push("gruix de neu a terra");
    return `${cap(parts.join(", "))}${m.snow ? "" : "; no mesura el gruix de neu"}`;
  }
  if (locale === "es") {
    if (m.temperature) parts.push("temperatura");
    if (m.wind) parts.push(`viento (a ${m.wind} m)`);
    if (m.snow) parts.push("espesor de nieve en el suelo");
    return `${cap(parts.join(", "))}${m.snow ? "" : "; no mide el espesor de nieve"}`;
  }
  if (m.temperature) parts.push("temperature");
  if (m.wind) parts.push(`wind (at ${m.wind} m)`);
  if (m.snow) parts.push("snow depth");
  return `${cap(parts.join(", "))}${m.snow ? "" : "; no snow-depth sensor"}`;
}

const KIND: Record<Place["kind"], Record<Locale, string>> = {
  resort: { ca: "Estació d'esquí alpí", es: "Estación de esquí alpino", en: "Alpine ski resort" },
  nordic: { ca: "Esquí nòrdic", es: "Esquí nórdico", en: "Cross-country ski area" },
  area: { ca: "Muntanya", es: "Montaña", en: "Mountain" },
};

/** "temperatura, vent i gruix de neu": what the place's stations measure, between them. */
export function variablesText(place: Place, locale: PlaceLocale): string {
  const m = place.stations.map((s) => s.station.measures);
  const words =
    locale === "ca"
      ? [m.some((x) => x.temperature) && "temperatura", m.some((x) => x.wind) && "vent", m.some((x) => x.snow) && "gruix de neu"]
      : [m.some((x) => x.temperature) && "temperatura", m.some((x) => x.wind) && "viento", m.some((x) => x.snow) && "espesor de nieve"];
  const list = words.filter((w): w is string => Boolean(w));
  const and = locale === "ca" ? " i " : " y ";
  return list.length > 1 ? `${list.slice(0, -1).join(", ")}${and}${list.at(-1)}` : (list[0] ?? "");
}

/** Where the station sits against the pistes, when the operator publishes their range. */
function altitudeRelation(place: Place, ps: PlaceStation, locale: PlaceLocale): string | null {
  if (!place.altitude) return null;
  const { min, max } = place.altitude;
  const a = ps.station.altitude;
  const r = range(min, max, locale);
  if (a > max) {
    const d = metres(a - max, locale);
    return locale === "ca"
      ? `És ${d} per sobre del punt més alt de les pistes (${r}): a les pistes, sobretot a la cota baixa, el temps pot ser molt diferent.`
      : `Está ${d} por encima del punto más alto de las pistas (${r}): en las pistas, sobre todo en la cota baja, el tiempo puede ser muy distinto.`;
  }
  if (a < min) {
    const d = metres(min - a, locale);
    return locale === "ca"
      ? `És ${d} per sota de la cota més baixa de les pistes (${r}): a dalt de tot hi pot fer més fred i més vent.`
      : `Está ${d} por debajo de la cota más baja de las pistas (${r}): arriba del todo puede hacer más frío y más viento.`;
  }
  const share = (a - min) / (max - min);
  const part = share > 2 / 3 ? (locale === "ca" ? "alta" : "alta") : share < 1 / 3 ? (locale === "ca" ? "baixa" : "baja") : locale === "ca" ? "mitjana" : "media";
  return locale === "ca"
    ? `És dins del desnivell de les pistes (${r}), a la part ${part}: a la resta del domini el temps pot ser diferent, sobretot entre la base i el cim.`
    : `Está dentro del desnivel de las pistas (${r}), en la parte ${part}: en el resto del dominio el tiempo puede ser distinto, sobre todo entre la base y la cima.`;
}

/** Labels for the client block. */
export function liveStationsFor(place: Place, locale: PlaceLocale): LiveStationProps[] {
  return place.stations.map((ps) => ({
    code: ps.station.code,
    label: cap(stationLabel(ps.station, locale)),
    detail: locale === "ca" ? `a ${km(ps.distanceKm, locale)} · codi ${ps.station.code}` : `a ${km(ps.distanceKm, locale)} · código ${ps.station.code}`,
    measures: ps.station.measures,
    url: stationUrl(ps.station.code),
  }));
}

/* -------------------------------------------------------------------------- */
/* The delay of the open data, measured on the snapshot day                   */
/* -------------------------------------------------------------------------- */

/** Measured on 28 Oct 2026 (observations.ts): newest row 26 Oct; validated temperature and wind to 19 Oct. */
const DELAY = { readOn: "2026-10-28", newest: "2026-10-26", validatedWeather: "2026-10-19" } as const;

function delayParagraph(locale: Locale): string {
  if (locale === "ca") {
    return `**Per què sovint no hi ha temperatura ni vent.** El Meteocat publica aquestes dades obertes amb retard i valida cada lectura després: ${onDate(DELAY.readOn, "ca")} la lectura més recent publicada era del ${dayMonthYear(DELAY.newest, "ca").replace(" de 2026", "")}, i la temperatura i el vent validats arribaven fins al ${dayMonthYear(DELAY.validatedWeather, "ca").replace(" de 2026", "")}. Només mostrem lectures validades de les últimes 48 hores, de manera que el gruix de neu (que el Meteocat valida abans) hi surt més sovint que la temperatura. Per a la lectura d'aquest moment, sense validar, l'enllaç de cada estació porta a la seva fitxa al web del Meteocat.`;
  }
  if (locale === "es") {
    return `**Por qué a menudo no hay temperatura ni viento.** Meteocat publica estos datos abiertos con retraso y valida cada lectura después: ${onDate(DELAY.readOn, "es")} la lectura más reciente publicada era del ${dayMonthYear(DELAY.newest, "es").replace(" de 2026", "")}, y la temperatura y el viento validados llegaban hasta el ${dayMonthYear(DELAY.validatedWeather, "es").replace(" de 2026", "")}. Solo mostramos lecturas validadas de las últimas 48 horas, así que el espesor de nieve (que Meteocat valida antes) aparece más a menudo que la temperatura. Para la lectura de este momento, sin validar, el enlace de cada estación lleva a su ficha en la web de Meteocat.`;
  }
  return `**Why temperature and wind are often missing.** Meteocat publishes this open data with a delay and validates each reading afterwards: ${onDate(DELAY.readOn, "en")} the newest published reading was from ${dayMonthYear(DELAY.newest, "en").replace(" 2026", "")}, and validated temperature and wind went up to ${dayMonthYear(DELAY.validatedWeather, "en").replace(" 2026", "")}. We only show validated readings from the last 48 hours, so snow depth (which Meteocat validates sooner) appears more often than temperature. For the reading right now, unvalidated, each station links to its page on Meteocat's website.`;
}

/* -------------------------------------------------------------------------- */
/* One place                                                                  */
/* -------------------------------------------------------------------------- */

export interface PlacePageCopy {
  h1: string;
  kicker: string;
  lead: string;
  readLine: string;
  facts: { label: string; value: string }[];
  liveTitle: string;
  liveStations: LiveStationProps[];
  meteocatUrl: string;
  forecastUrl: string | null;
  stationTitle: string;
  station: string[];
  forecastTitle: string;
  forecast: string[];
  slopesTitle: string | null;
  slopes: string[];
  safetyTitle: string;
  safety: string[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
  siblingsTitle: string;
  siblings: LinkItem[];
  hubLink: LinkItem;
  relatedTitle: string;
  related: LinkItem[];
  sourcesTitle: string;
  sourcesNote: string;
  sources: SourceItem[];
}

const GUIDE_LABEL: Partial<Record<B2Key, Record<PlaceLocale, string>>> = {
  snowNow: { ca: "Hi ha neu al Pirineu avui? Gruix de neu per estacions", es: "¿Hay nieve en el Pirineo hoy? Espesor por estación" },
  ski: { ca: "Estacions d'esquí de Catalunya 2026-27: obertura i forfets", es: "Estaciones de esquí de Cataluña 2026-27: apertura y forfait" },
  snow: { ca: "On veure neu a Catalunya sense esquiar", es: "Dónde ver nieve en Cataluña sin esquiar" },
  cerdanya: { ca: "La Cerdanya sense cotxe", es: "La Cerdanya sin coche" },
  nuria: { ca: "Cremallera de la Vall de Núria: horaris i preus", es: "Cremallera de la Vall de Núria: horarios y precios" },
  ripolles: { ca: "Guia del Ripollès", es: "Guía del Ripollès" },
  setcases: { ca: "Setcases", es: "Setcases" },
};

function related(place: Place, locale: PlaceLocale): LinkItem[] {
  return place.guides.filter((key) => GUIDE_LABEL[key]).map((key) => ({ label: GUIDE_LABEL[key]![locale], href: b2href(key, locale) }));
}

function placeSources(place: Place, locale: PlaceLocale): SourceItem[] {
  const ca = locale === "ca";
  const read = onDate(SNAPSHOT.readOn, locale);
  const out: SourceItem[] = [
    {
      name: ca ? "Dades meteorològiques de la XEMA (lectures validades)" : "Datos meteorológicos de la XEMA (lecturas validadas)",
      publisher: "Servei Meteorològic de Catalunya (Meteocat)",
      url: OFFICIAL.xemaDataset,
      note: ca ? "es llegeixen en obrir la pàgina; reutilització segons l'avís legal del Meteocat" : "se leen al abrir la página; reutilización según el aviso legal de Meteocat",
    },
    {
      name: ca ? "Metadades de les estacions automàtiques (altitud, coordenades)" : "Metadatos de las estaciones automáticas (altitud, coordenadas)",
      publisher: "Servei Meteorològic de Catalunya (Meteocat)",
      url: OFFICIAL.stationsDataset,
      note: ca ? `llegides ${read}` : `leídos ${read}`,
    },
    {
      name: ca ? `Nomenclàtor: «${place.point.name}»` : `Nomenclátor: «${place.point.name}»`,
      publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)",
      url: OFFICIAL.icgcGeocoder,
      note: ca ? `punt de referència per a les distàncies, llegit ${read}` : `punto de referencia para las distancias, leído ${read}`,
    },
  ];
  for (const l of place.links) out.push({ name: l.label[locale], publisher: publisherOf(l.url), url: l.url, note: ca ? `consultat ${read}` : `consultado ${read}` });
  if (place.altitude && !place.links.some((l) => l.url === place.altitude!.source)) {
    out.push({ name: ca ? "Altituds de les pistes" : "Altitudes de las pistas", publisher: publisherOf(place.altitude.source), url: place.altitude.source, note: ca ? `consultat ${read}` : `consultado ${read}` });
  }
  if (place.pyrenees) {
    out.push({
      name: ca ? "Butlletí de Perill d'Allaus (BPA)" : "Boletín de Peligro de Aludes (BPA)",
      publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)",
      url: OFFICIAL.bpa(locale),
      note: ca ? `avís del 26 de maig de 2026, consultat ${read}` : `aviso del 26 de mayo de 2026, consultado ${read}`,
    });
  }
  return out;
}

function publisherOf(url: string): string {
  if (url.includes("baqueira.es")) return "Baqueira Beret";
  if (url.includes("pirineu365.cat")) return "FGC (PIRINEU365)";
  if (url.includes("masella.com")) return "Masella";
  if (url.includes("portdelcomte.net")) return "Port del Comte";
  if (url.includes("tavascan365.com")) return "Tavascan";
  if (url.includes("guils.com")) return "Guils Fontanera";
  return new URL(url).host;
}

export function placeCopy(place: Place, locale: PlaceLocale): PlacePageCopy {
  const main = place.stations[0]!;
  const read = onDate(SNAPSHOT.readOn, locale);
  const name = place.name[locale];
  const Name = cap(name);
  const where = place.inPlace[locale];
  const muni = `${place.point.municipality} (${place.point.comarca})`;
  const snowAnywhere = place.stations.some((s) => s.station.measures.snow);
  const resort = place.kind !== "area";
  const and = locale === "ca" ? "i" : "y";
  const variables = variablesText(place, locale);
  const stationsText = place.stations.map((ps) => `${ps.station.name} (${ps.station.code}), a ${metres(ps.station.altitude, locale)} ${and} a ${km(ps.distanceKm, locale)}`);
  const snowLinks = place.links.filter((l) => l.kind === "snow" || l.kind === "webcams");
  const siteLinks = place.links.filter((l) => l.kind === "site" || l.kind === "access");
  const forecastUrl = place.pyrenees ? OFFICIAL.aemetMountain(locale) : null;
  const ca = locale === "ca";

  const facts: { label: string; value: string }[] = [];
  if (place.altitude) facts.push({ label: ca ? "Pistes" : "Pistas", value: range(place.altitude.min, place.altitude.max, locale) });
  facts.push({ label: ca ? "Municipi" : "Municipio", value: muni });
  for (const ps of place.stations) {
    facts.push({
      label: ca ? `Estació del Meteocat` : `Estación de Meteocat`,
      value: `${cap(ps.station.name)} (${ps.station.code}): ${metres(ps.station.altitude, locale)}, a ${km(ps.distanceKm, locale)}`,
    });
    facts.push({ label: ca ? "Què mesura" : "Qué mide", value: measuresText(ps.station, locale) });
  }
  facts.push({ label: ca ? "Punt de referència" : "Punto de referencia", value: `${place.point.name} (ICGC)` });

  const relation = place.stations.map((ps) => altitudeRelation(place, ps, locale)).filter((s): s is string => Boolean(s));
  const others = place.stations.slice(1);

  if (ca) {
    const lead = resort
      ? `${Name} és una ${place.kind === "nordic" ? "estació d'esquí nòrdic" : "estació d'esquí"} a ${muni}${place.altitude ? `, amb pistes entre ${formatInt(place.altitude.min, locale)} i ${metres(place.altitude.max, locale)}` : ""}. L'estació meteorològica del Meteocat que la representa és ${stationsText.join(" i ")}. A sota hi ha les seves últimes lectures validades de ${variables}, cadascuna amb la seva hora, i els enllaços oficials a l'estat de les pistes, la previsió i el perill d'allaus.`
      : `${Name} és a ${muni}. L'estació meteorològica del Meteocat més propera és ${stationsText.join(" i ")} del punt que en dona el nomenclàtor de l'ICGC. A sota hi ha les seves últimes lectures validades de ${variables}, cadascuna amb la seva hora, i els enllaços a la previsió oficial.`;
    return {
      h1: placeTitle(place, locale),
      kicker: `${KIND[place.kind].ca} · ${place.point.comarca}`,
      lead,
      readLine: `Estacions, altituds i distàncies llegides del Meteocat i l'ICGC ${read}`,
      facts,
      liveTitle: `Últimes lectures del Meteocat`,
      liveStations: liveStationsFor(place, locale),
      meteocatUrl: stationUrl(main.station.code),
      forecastUrl,
      stationTitle: "Què representa aquesta estació meteorològica",
      station: [
        `**${cap(main.station.name)}** (${main.station.code}) és a ${metres(main.station.altitude, locale)}, a ${km(main.distanceKm, locale)} en línia recta del punt de referència ${caOf(name)} al nomenclàtor oficial de l'ICGC («${place.point.name}»). ${relation[0] ?? "La lectura és la d'aquest punt: als vessants i als cims del voltant el vent i la temperatura poden ser molt diferents."}`,
        ...others.map(
          (ps) => `També hi ha **${cap(ps.station.name)}** (${ps.station.code}), a ${metres(ps.station.altitude, locale)} i a ${km(ps.distanceKm, locale)}. ${altitudeRelation(place, ps, locale) ?? ""}`.trim(),
        ),
        ...(!snowAnywhere
          ? [
              resort
                ? `**Aquesta estació no mesura el gruix de neu.** La neu de les pistes la dona cada dia ${name} al seu parte oficial (enllaços a sota); el gruix a terra mesurat pel Meteocat en altres estacions de muntanya és a ${link("la pàgina de la neu d'avui", b2href("snowNow", locale))}.`
              : `**Aquesta estació no mesura el gruix de neu.** El gruix de neu que mesura el Meteocat a les estacions de muntanya és a ${link("la pàgina de la neu d'avui", b2href("snowNow", locale))}.`,
            ]
          : [
              `**El gruix de neu del Meteocat no és el de les pistes.** Es mesura en un punt fix i amb neu natural; ${resort ? "el parte de l'estació d'esquí dona el gruix a les pistes, que inclou la neu produïda i trepitjada." : "en un altre vessant, a l'obaga o a la solana, hi pot haver molta més o molta menys neu."}`,
            ]),
        delayParagraph(locale),
      ],
      forecastTitle: "Previsió oficial",
      forecast: [
        ...(resort ? [`**Pistes d'esquí:** la ${link("predicció per a les pistes d'esquí", OFFICIAL.meteocatSki)} del Meteocat, per a cotes superiors a 1.500 m.`] : []),
        ...(place.pyrenees
          ? [
              `**Pirineu:** la ${link("predicció per al Pirineu", OFFICIAL.meteocatPyrenees)} del Meteocat i la ${link("predicció de muntanya del Pirineu català", OFFICIAL.aemetMountain(locale))} d'AEMET.`,
            ]
          : []),
        `**${place.point.municipality}:** la ${link(`predicció municipal de ${place.point.municipality}`, OFFICIAL.meteocatMunicipal(place.point.municipalityCode))} del Meteocat, hora a hora per a tres dies.`,
        "Aquí no fem previsions pròpies: només enllacem les oficials.",
      ],
      slopesTitle: resort ? "Estat de les pistes i informació de l'estació" : null,
      slopes: resort
        ? [
            ...(snowLinks.length
              ? [`**Pistes obertes i gruix a les pistes:** ${snowLinks.map((l) => link(l.label.ca, l.url)).join(", ")}. Abans de l'obertura de la temporada surten buits.`]
              : [`**Pistes obertes i gruix a les pistes:** ${name} no publica un parte diari en una pàgina pròpia que hàgim pogut verificar; consulta el seu web abans de sortir.`]),
            ...(siteLinks.length ? [`**L'estació:** ${siteLinks.map((l) => link(l.label.ca, l.url)).join(", ")}.`] : []),
            ...(place.access ? [`**Com arribar-hi en transport públic:** ${place.access.ca} (${link("font", place.access.source)}).`] : []),
            ...(place.note ? [`${place.note.ca.replace(/\.$/, "")} (${link("font", place.note.source)}).`] : []),
            `Obertura, preus del forfet i transport de totes les estacions: ${link("estacions d'esquí de Catalunya", b2href("ski", locale))}.`,
          ]
        : [],
      safetyTitle: place.pyrenees ? "Allaus i carreteres" : "Abans de sortir",
      safety: [
        ...(place.pyrenees
          ? [
              `**Perill d'allaus:** l'ICGC publica el ${link("Butlletí de Perill d'Allaus", OFFICIAL.bpa(locale))} del Pirineu de Catalunya, vàlid fora de pistes i de zones no controlades, amb la col·laboració del Meteocat. Segons el seu avís, el servei diari es reprèn ${onDate(BPA_RESUMES, "ca")}, o abans si l'estat de la neu ho requereix. La ${link("informació nivològica", OFFICIAL.bpaNivo)} és al mateix web.`,
            ]
          : []),
        `**Carreteres:** l'${link("estat del trànsit", OFFICIAL.traffic(locale))} del Servei Català de Trànsit dona les incidències de les carreteres, també les causades per la neu i el gel.`,
        `**Emergències:** 112.`,
      ],
      faqTitle: "Preguntes freqüents",
      faq: [
        {
          question: `Quina temperatura fa ara ${where}?`,
          answer: `Aquesta pàgina mostra l'última lectura validada de ${main.station.name} (${metres(main.station.altitude, locale)}), l'estació del Meteocat a ${km(main.distanceKm, locale)}, amb la seva hora. El Meteocat la valida amb uns dies de retard: la lectura d'aquest moment, sense validar, és a la fitxa de l'estació al web del Meteocat.`,
        },
        resort
          ? {
              question: `Hi ha neu ${where}?`,
              answer: snowAnywhere
                ? `Les pistes obertes i el gruix a les pistes els publica ${name} al seu parte oficial. L'estació del Meteocat ${main.station.name} mesura el gruix de neu a terra al seu punt; l'última lectura validada és a dalt.`
                : `Les pistes obertes i el gruix a les pistes els publica ${name} al seu parte oficial. L'estació del Meteocat més propera, ${main.station.name}, no mesura el gruix de neu.`,
            }
          : {
              question: `On miro la previsió ${where}?`,
              answer: `A la predicció municipal de ${place.point.municipality} del Meteocat${place.pyrenees ? ", a la predicció per al Pirineu del Meteocat i a la de muntanya d'AEMET" : ""}. Aquí no fem previsions pròpies.`,
            },
      ],
      siblingsTitle: "Altres estacions i muntanyes",
      siblings: siblings(place).map((p) => ({ label: cap(p.name.ca), href: placePath("ca", p.slug) })),
      hubLink: { label: "Totes les estacions d'esquí i muntanyes, amb les lectures del Meteocat", href: hubPath("ca") },
      relatedTitle: "Guies relacionades",
      related: related(place, locale),
      sourcesTitle: "Fonts",
      sourcesNote: `Dades oficials. Les lectures es llegeixen en obrir la pàgina, amb l'hora de cadascuna; la resta, ${read}.`,
      sources: placeSources(place, locale),
    };
  }

  const leadEs = resort
    ? `${Name} es una ${place.kind === "nordic" ? "estación de esquí nórdico" : "estación de esquí"} en ${muni}${place.altitude ? `, con pistas entre ${formatInt(place.altitude.min, locale)} y ${metres(place.altitude.max, locale)}` : ""}. La estación meteorológica de Meteocat que la representa es ${stationsText.join(" y ")}. Abajo están sus últimas lecturas validadas de ${variables}, cada una con su hora, y los enlaces oficiales al estado de las pistas, la previsión y el peligro de aludes.`
    : `${Name} está en ${muni}. La estación meteorológica de Meteocat más cercana es ${stationsText.join(" y ")} del punto que da el nomenclátor del ICGC. Abajo están sus últimas lecturas validadas de ${variables}, cada una con su hora, y los enlaces a la previsión oficial.`;
  return {
    h1: placeTitle(place, locale),
    kicker: `${KIND[place.kind].es} · ${place.point.comarca}`,
    lead: leadEs,
    readLine: `Estaciones, altitudes y distancias leídas de Meteocat y el ICGC ${read}`,
    facts,
    liveTitle: "Últimas lecturas de Meteocat",
    liveStations: liveStationsFor(place, locale),
    meteocatUrl: stationUrl(main.station.code),
    forecastUrl,
    stationTitle: "Qué representa esta estación meteorológica",
    station: [
      `**${cap(main.station.name)}** (${main.station.code}) está a ${metres(main.station.altitude, locale)}, a ${km(main.distanceKm, locale)} en línea recta del punto de referencia ${esOf(name)} en el nomenclátor oficial del ICGC («${place.point.name}»). ${relation[0] ?? "La lectura es la de ese punto: en las laderas y las cimas de alrededor el viento y la temperatura pueden ser muy distintos."}`,
      ...others.map(
        (ps) => `También está **${cap(ps.station.name)}** (${ps.station.code}), a ${metres(ps.station.altitude, locale)} y a ${km(ps.distanceKm, locale)}. ${altitudeRelation(place, ps, locale) ?? ""}`.trim(),
      ),
      ...(!snowAnywhere
        ? [
            resort
              ? `**Esta estación no mide el espesor de nieve.** La nieve de las pistas la da cada día ${name} en su parte oficial (enlaces abajo); el espesor en el suelo que mide Meteocat en otras estaciones de montaña está en ${link("la página de la nieve de hoy", b2href("snowNow", locale))}.`
              : `**Esta estación no mide el espesor de nieve.** El espesor de nieve que mide Meteocat en las estaciones de montaña está en ${link("la página de la nieve de hoy", b2href("snowNow", locale))}.`,
          ]
        : [
            `**El espesor de nieve de Meteocat no es el de las pistas.** Se mide en un punto fijo y con nieve natural; ${resort ? "el parte de la estación de esquí da el espesor en las pistas, que incluye la nieve producida y pisada." : "en otra ladera, en umbría o en solana, puede haber mucha más o mucha menos nieve."}`,
          ]),
      delayParagraph(locale),
    ],
    forecastTitle: "Previsión oficial",
    forecast: [
      ...(resort ? [`**Pistas de esquí:** la ${link("predicción para las pistas de esquí", OFFICIAL.meteocatSki)} de Meteocat, para cotas superiores a 1.500 m.`] : []),
      ...(place.pyrenees
        ? [`**Pirineo:** la ${link("predicción para el Pirineo", OFFICIAL.meteocatPyrenees)} de Meteocat y la ${link("predicción de montaña del Pirineo catalán", OFFICIAL.aemetMountain(locale))} de AEMET.`]
        : []),
      `**${place.point.municipality}:** la ${link(`predicción municipal de ${place.point.municipality}`, OFFICIAL.meteocatMunicipal(place.point.municipalityCode))} de Meteocat, hora a hora para tres días.`,
      "Aquí no hacemos previsiones propias: solo enlazamos las oficiales.",
    ],
    slopesTitle: resort ? "Estado de las pistas e información de la estación" : null,
    slopes: resort
      ? [
          ...(snowLinks.length
            ? [`**Pistas abiertas y espesor en pistas:** ${snowLinks.map((l) => link(l.label.es, l.url)).join(", ")}. Antes de la apertura de la temporada salen vacíos.`]
            : [`**Pistas abiertas y espesor en pistas:** ${name} no publica un parte diario en una página propia que hayamos podido verificar; consulta su web antes de salir.`]),
          ...(siteLinks.length ? [`**La estación:** ${siteLinks.map((l) => link(l.label.es, l.url)).join(", ")}.`] : []),
          ...(place.access ? [`**Cómo llegar en transporte público:** ${place.access.es} (${link("fuente", place.access.source)}).`] : []),
          ...(place.note ? [`${place.note.es.replace(/\.$/, "")} (${link("fuente", place.note.source)}).`] : []),
          `Apertura, precios del forfait y transporte de todas las estaciones: ${link("estaciones de esquí de Cataluña", b2href("ski", locale))}.`,
        ]
      : [],
    safetyTitle: place.pyrenees ? "Aludes y carreteras" : "Antes de salir",
    safety: [
      ...(place.pyrenees
        ? [
            `**Peligro de aludes:** el ICGC publica el ${link("Boletín de Peligro de Aludes", OFFICIAL.bpa(locale))} del Pirineo de Cataluña, válido fuera de pistas y de zonas no controladas, con la colaboración de Meteocat. Según su aviso, el servicio diario se reanuda ${onDate(BPA_RESUMES, "es")}, o antes si el estado de la nieve lo requiere. La ${link("información nivológica", OFFICIAL.bpaNivo)} está en la misma web.`,
          ]
        : []),
      `**Carreteras:** el ${link("estado del tráfico", OFFICIAL.traffic(locale))} del Servei Català de Trànsit da las incidencias de las carreteras, también las causadas por la nieve y el hielo.`,
      `**Emergencias:** 112.`,
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        question: `¿Qué temperatura hace ahora ${where}?`,
        answer: `Esta página muestra la última lectura validada de ${main.station.name} (${metres(main.station.altitude, locale)}), la estación de Meteocat a ${km(main.distanceKm, locale)}, con su hora. Meteocat la valida con unos días de retraso: la lectura de este momento, sin validar, está en la ficha de la estación en la web de Meteocat.`,
      },
      resort
        ? {
            question: `¿Hay nieve ${where}?`,
            answer: snowAnywhere
              ? `Las pistas abiertas y el espesor en pistas los publica ${name} en su parte oficial. La estación de Meteocat ${main.station.name} mide el espesor de nieve en el suelo en su punto; la última lectura validada está arriba.`
              : `Las pistas abiertas y el espesor en pistas los publica ${name} en su parte oficial. La estación de Meteocat más cercana, ${main.station.name}, no mide el espesor de nieve.`,
          }
        : {
            question: `¿Dónde miro la previsión ${where}?`,
            answer: `En la predicción municipal de ${place.point.municipality} de Meteocat${place.pyrenees ? ", en la predicción para el Pirineo de Meteocat y en la de montaña de AEMET" : ""}. Aquí no hacemos previsiones propias.`,
          },
    ],
    siblingsTitle: "Otras estaciones y montañas",
    siblings: siblings(place).map((p) => ({ label: cap(p.name.es), href: placePath("es", p.slug) })),
    hubLink: { label: "Todas las estaciones de esquí y montañas, con las lecturas de Meteocat", href: hubPath("es") },
    relatedTitle: "Guías relacionadas",
    related: related(place, locale),
    sourcesTitle: "Fuentes",
    sourcesNote: `Datos oficiales. Las lecturas se leen al abrir la página, con la hora de cada una; el resto, ${read}.`,
    sources: placeSources(place, locale),
  };
}

/* -------------------------------------------------------------------------- */
/* The hub                                                                    */
/* -------------------------------------------------------------------------- */

export interface HubEntry {
  name: string;
  href: string | null;
  text: string;
}

export interface HubCopy {
  h1: string;
  lead: string;
  readLine: string;
  liveTitle: string;
  liveNote: string;
  liveStations: LiveStationProps[];
  groups: { title: string; entries: HubEntry[] }[];
  belowTitle: string;
  belowNote: string;
  below: HubEntry[];
  howTitle: string;
  how: string[];
  officialTitle: string;
  official: string[];
  relatedTitle: string;
  related: LinkItem[];
  sourcesTitle: string;
  sourcesNote: string;
  sources: SourceItem[];
}

/** Every live station once, west to east as the snow page orders them, with the places it stands for. */
export function hubStations(locale: Locale): LiveStationProps[] {
  const byCode = new Map<string, { station: SnapshotStation; places: string[] }>();
  for (const place of PAGE_PLACES) {
    for (const ps of place.stations) {
      const entry = byCode.get(ps.station.code) ?? { station: ps.station, places: [] };
      entry.places.push(cap(place.name[locale]));
      byCode.set(ps.station.code, entry);
    }
  }
  const areaIndex = (code: string) => AREA_ORDER.indexOf(PAGE_PLACES.find((p) => p.stations.some((s) => s.station.code === code))!.area);
  return [...byCode.values()]
    .sort((a, b) => areaIndex(a.station.code) - areaIndex(b.station.code) || a.station.lon - b.station.lon)
    .map(({ station, places }) => ({
      code: station.code,
      label: cap(stationLabel(station, locale)),
      detail: places.join(" · "),
      measures: station.measures,
      url: stationUrl(station.code),
    }));
}

function entryText(place: Place, locale: Locale): string {
  const ps = place.stations[0]!;
  const s = `${ps.station.name} (${metres(ps.station.altitude, locale)})`;
  const alt = place.altitude ? `${range(place.altitude.min, place.altitude.max, locale)}; ` : "";
  if (locale === "ca") return `${alt}estació del Meteocat: ${s}, a ${km(ps.distanceKm, locale)}`;
  if (locale === "es") return `${alt}estación de Meteocat: ${s}, a ${km(ps.distanceKm, locale)}`;
  return `${alt}Meteocat station: ${s}, ${km(ps.distanceKm, locale)} away`;
}

function belowText(place: Place, locale: Locale): string {
  const n = place.nearest[0];
  const snow = place.links.find((l) => l.kind === "snow");
  if (!n) return "";
  const s = `${n.station.name} (${metres(n.station.altitude, locale)}), a ${km(n.distanceKm, locale)}`;
  const far = n.distanceKm > MAX_DISTANCE_KM[place.kind];
  const low = n.station.altitude < (place.altitude ? place.altitude.min - ALTITUDE_MARGIN_M : MIN_SKI_STATION_ALTITUDE_M);
  const max = MAX_DISTANCE_KM[place.kind];
  if (locale === "ca") {
    const why = [far ? `és a més de ${max} km` : null, low ? "és una estació de vall, massa baixa per descriure les pistes" : null].filter(Boolean).join(" i ");
    return `l'estació del Meteocat més propera és ${s}: ${why}.${snow ? ` Estat de la neu: ${link(snow.label.ca, snow.url)}.` : ""}`;
  }
  if (locale === "es") {
    const why = [far ? `está a más de ${max} km` : null, low ? "es una estación de valle, demasiado baja para describir las pistas" : null].filter(Boolean).join(" y ");
    return `la estación de Meteocat más cercana es ${s}: ${why}.${snow ? ` Estado de la nieve: ${link(snow.label.es, snow.url)}.` : ""}`;
  }
  const why = [far ? `more than ${max} km away` : null, low ? "a valley station, too low to describe the slopes" : null].filter(Boolean).join(" and ");
  return `the nearest Meteocat station is ${n.station.name} (${metres(n.station.altitude, locale)}), ${km(n.distanceKm, locale)} away: ${why}.${snow ? ` Snow report: ${link(snow.label.en, snow.url)}.` : ""}`;
}

export function hubCopy(locale: Locale): HubCopy {
  const meta = hubMeta(locale);
  const read = onDate(SNAPSHOT.readOn, locale);
  const href = (p: Place) => (locale === "en" ? null : placePath(locale, p.slug));
  const entries = (kind: Place["kind"]) => PAGE_PLACES.filter((p) => p.kind === kind).map((p) => ({ name: cap(p.name[locale]), href: href(p), text: entryText(p, locale) }));
  const below = HUB_ONLY_PLACES.map((p) => ({ name: cap(p.name[locale]), href: null, text: belowText(p, locale) }));
  const stations = hubStations(locale);
  const counts = { resorts: PAGE_PLACES.filter((p) => p.kind !== "area").length, areas: PAGE_PLACES.filter((p) => p.kind === "area").length, stations: stations.length };
  const sources: SourceItem[] = [
    { name: "Dades meteorològiques de la XEMA", publisher: "Servei Meteorològic de Catalunya (Meteocat)", url: OFFICIAL.xemaDataset, note: locale === "ca" ? "lectures validades, llegides en obrir la pàgina" : locale === "es" ? "lecturas validadas, leídas al abrir la página" : "validated readings, read when the page opens" },
    { name: "Metadades estacions meteorològiques automàtiques", publisher: "Servei Meteorològic de Catalunya (Meteocat)", url: OFFICIAL.stationsDataset, note: locale === "ca" ? `llegides ${read}` : locale === "es" ? `leídos ${read}` : `read ${read}` },
    { name: locale === "en" ? "Geocoder (official place names)" : "Geocodificador (nomenclàtor oficial)", publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)", url: OFFICIAL.icgcGeocoder, note: locale === "ca" ? `llegit ${read}` : locale === "es" ? `leído ${read}` : `read ${read}` },
    { name: locale === "ca" ? "Avís legal del Meteocat (reutilització)" : locale === "es" ? "Aviso legal de Meteocat (reutilización)" : "Meteocat legal notice (reuse)", publisher: "Servei Meteorològic de Catalunya (Meteocat)", url: OFFICIAL.meteocatLegal, note: locale === "ca" ? `consultat ${read}` : locale === "es" ? `consultado ${read}` : `checked ${read}` },
    { name: locale === "ca" ? "Butlletí de Perill d'Allaus (BPA)" : locale === "es" ? "Boletín de Peligro de Aludes (BPA)" : "Avalanche Danger Bulletin (BPA)", publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)", url: OFFICIAL.bpa(locale), note: locale === "ca" ? `consultat ${read}` : locale === "es" ? `consultado ${read}` : `checked ${read}` },
  ];

  if (locale === "ca") {
    return {
      h1: meta.h1,
      lead: `Per a ${counts.resorts} estacions d'esquí i ${counts.areas} muntanyes de Catalunya, l'estació meteorològica del Meteocat que la representa (la més propera, a una altitud comparable) i les seves últimes lectures validades de temperatura, vent i gruix de neu, amb l'hora de cadascuna. A cada pàgina hi ha, a més, l'estat de les pistes, la previsió oficial i el perill d'allaus.`,
      readLine: `Estacions, altituds i distàncies llegides del Meteocat i l'ICGC ${read}`,
      liveTitle: "Últimes lectures validades, estació per estació",
      liveNote: `${counts.stations} estacions del Meteocat. Cada valor porta l'hora de la lectura; si no n'hi ha cap de validada de les últimes 48 hores, la casella queda buida i el nom de l'estació porta a la seva fitxa al web del Meteocat.`,
      liveStations: stations,
      groups: [
        { title: "Estacions d'esquí alpí", entries: entries("resort") },
        { title: "Esquí nòrdic", entries: entries("nordic") },
        { title: "Cims, estanys i ports de muntanya", entries: entries("area") },
      ],
      belowTitle: "Estacions d'esquí sense una estació del Meteocat prou a prop",
      belowNote: `Una estació d'esquí té pàgina pròpia quan una estació del Meteocat és a menys de ${MAX_DISTANCE_KM.resort} km i a una altitud comparable (dins del desnivell de les pistes, amb ${ALTITUDE_MARGIN_M} m de marge); un cim o un estany, quan n'és a menys de ${MAX_DISTANCE_KM.area} km. Aquestes no hi arriben:`,
      below,
      howTitle: "Com llegir aquestes dades",
      how: [
        "**Són lectures, no previsions.** Cada estació del Meteocat mesura en un punt i a una altitud concreta; a la base de les pistes, en un altre vessant o al cim, el temps pot ser molt diferent.",
        delayParagraph(locale),
        `**El gruix de neu del Meteocat no és el de les pistes.** El parte de cada estació d'esquí dona el gruix a les pistes, amb neu produïda i trepitjada; el Meteocat el mesura en un punt fix amb neu natural. La foto de tot el Pirineu és a ${link("la pàgina de la neu d'avui", b2href("snowNow", locale))}.`,
      ],
      officialTitle: "Previsió i perill d'allaus",
      official: [
        `**Previsió:** la ${link("predicció per a les pistes d'esquí", OFFICIAL.meteocatSki)} i la ${link("predicció per al Pirineu", OFFICIAL.meteocatPyrenees)} del Meteocat, i la ${link("predicció de muntanya del Pirineu català", OFFICIAL.aemetMountain(locale))} d'AEMET. Aquí no fem previsions pròpies.`,
        `**Allaus:** el ${link("Butlletí de Perill d'Allaus", OFFICIAL.bpa(locale))} de l'ICGC, vàlid fora de pistes. Segons el seu avís, el servei diari es reprèn ${onDate(BPA_RESUMES, "ca")}, o abans si l'estat de la neu ho requereix.`,
        `**Carreteres:** l'${link("estat del trànsit", OFFICIAL.traffic(locale))} del Servei Català de Trànsit.`,
      ],
      relatedTitle: "Guies relacionades",
      related: [
        { label: GUIDE_LABEL.snowNow!.ca, href: b2href("snowNow", locale) },
        { label: GUIDE_LABEL.ski!.ca, href: b2href("ski", locale) },
        { label: GUIDE_LABEL.snow!.ca, href: b2href("snow", locale) },
        { label: GUIDE_LABEL.cerdanya!.ca, href: b2href("cerdanya", locale) },
        { label: GUIDE_LABEL.nuria!.ca, href: b2href("nuria", locale) },
      ],
      sourcesTitle: "Fonts",
      sourcesNote: `Dades oficials. Les lectures es llegeixen en obrir la pàgina; la resta, ${read}.`,
      sources,
    };
  }
  if (locale === "es") {
    return {
      h1: meta.h1,
      lead: `Para ${counts.resorts} estaciones de esquí y ${counts.areas} montañas de Cataluña, la estación meteorológica de Meteocat que la representa (la más cercana, a una altitud comparable) y sus últimas lecturas validadas de temperatura, viento y espesor de nieve, con la hora de cada una. En cada página están, además, el estado de las pistas, la previsión oficial y el peligro de aludes.`,
      readLine: `Estaciones, altitudes y distancias leídas de Meteocat y el ICGC ${read}`,
      liveTitle: "Últimas lecturas validadas, estación por estación",
      liveNote: `${counts.stations} estaciones de Meteocat. Cada valor lleva la hora de la lectura; si no hay ninguna validada de las últimas 48 horas, la casilla queda vacía y el nombre de la estación lleva a su ficha en la web de Meteocat.`,
      liveStations: stations,
      groups: [
        { title: "Estaciones de esquí alpino", entries: entries("resort") },
        { title: "Esquí nórdico", entries: entries("nordic") },
        { title: "Cimas, lagos y puertos de montaña", entries: entries("area") },
      ],
      belowTitle: "Estaciones de esquí sin una estación de Meteocat lo bastante cerca",
      belowNote: `Una estación de esquí tiene página propia cuando una estación de Meteocat está a menos de ${MAX_DISTANCE_KM.resort} km y a una altitud comparable (dentro del desnivel de las pistas, con ${ALTITUDE_MARGIN_M} m de margen); una cima o un lago, cuando está a menos de ${MAX_DISTANCE_KM.area} km. Estas no llegan:`,
      below,
      howTitle: "Cómo leer estos datos",
      how: [
        "**Son lecturas, no previsiones.** Cada estación de Meteocat mide en un punto y a una altitud concreta; en la base de las pistas, en otra ladera o en la cima, el tiempo puede ser muy distinto.",
        delayParagraph(locale),
        `**El espesor de nieve de Meteocat no es el de las pistas.** El parte de cada estación de esquí da el espesor en las pistas, con nieve producida y pisada; Meteocat lo mide en un punto fijo con nieve natural. La foto de todo el Pirineo está en ${link("la página de la nieve de hoy", b2href("snowNow", locale))}.`,
      ],
      officialTitle: "Previsión y peligro de aludes",
      official: [
        `**Previsión:** la ${link("predicción para las pistas de esquí", OFFICIAL.meteocatSki)} y la ${link("predicción para el Pirineo", OFFICIAL.meteocatPyrenees)} de Meteocat, y la ${link("predicción de montaña del Pirineo catalán", OFFICIAL.aemetMountain(locale))} de AEMET. Aquí no hacemos previsiones propias.`,
        `**Aludes:** el ${link("Boletín de Peligro de Aludes", OFFICIAL.bpa(locale))} del ICGC, válido fuera de pistas. Según su aviso, el servicio diario se reanuda ${onDate(BPA_RESUMES, "es")}, o antes si el estado de la nieve lo requiere.`,
        `**Carreteras:** el ${link("estado del tráfico", OFFICIAL.traffic(locale))} del Servei Català de Trànsit.`,
      ],
      relatedTitle: "Guías relacionadas",
      related: [
        { label: GUIDE_LABEL.snowNow!.es, href: b2href("snowNow", locale) },
        { label: GUIDE_LABEL.ski!.es, href: b2href("ski", locale) },
        { label: GUIDE_LABEL.snow!.es, href: b2href("snow", locale) },
        { label: GUIDE_LABEL.cerdanya!.es, href: b2href("cerdanya", locale) },
        { label: GUIDE_LABEL.nuria!.es, href: b2href("nuria", locale) },
      ],
      sourcesTitle: "Fuentes",
      sourcesNote: `Datos oficiales. Las lecturas se leen al abrir la página; el resto, ${read}.`,
      sources,
    };
  }
  return {
    h1: meta.h1,
    lead: `For ${counts.resorts} ski resorts and ${counts.areas} mountain spots in Catalonia: the Meteocat weather station that stands for it (the nearest one at a comparable altitude) and its latest validated temperature, wind and snow-depth readings, each with its time. Below are the official snow reports, forecasts and the avalanche bulletin.`,
    readLine: `Stations, altitudes and distances read from Meteocat and the ICGC ${read}`,
    liveTitle: "Latest validated readings, station by station",
    liveNote: `${counts.stations} Meteocat stations. Every value carries its reading time; when there is no validated reading from the last 48 hours the cell stays empty, and the station name links to its page on Meteocat's website.`,
    liveStations: stations,
    groups: [
      { title: "Alpine ski resorts", entries: entries("resort") },
      { title: "Cross-country skiing", entries: entries("nordic") },
      { title: "Peaks, lakes and mountain passes", entries: entries("area") },
    ],
    belowTitle: "Resorts with no Meteocat station close enough",
    belowNote: `We pair a resort with a Meteocat station only when it is less than ${MAX_DISTANCE_KM.resort} km away and at a comparable altitude (within the resort's vertical range, give or take ${ALTITUDE_MARGIN_M} m); a peak or a lake, when it is less than ${MAX_DISTANCE_KM.area} km away. These do not qualify:`,
    below,
    howTitle: "How to read this data",
    how: [
      "**These are readings, not forecasts.** Each Meteocat station measures at one point and one altitude; at the bottom of the slopes, on another face or on the summit, the weather can be very different.",
      delayParagraph(locale),
      `**Meteocat's snow depth is not the resort's.** A resort's snow report gives the depth on its runs, including machine-made and groomed snow; Meteocat measures natural snow at a fixed point. For the whole Pyrenees, see ${link("today's snow depth", b2href("snowNow", locale))}.`,
    ],
    officialTitle: "Snow reports, forecasts and avalanches",
    official: [
      `**Snow reports:** the six FGC resorts (La Molina, Vall de Núria, Vallter, Espot, Port Ainé, Boí Taüll) on ${link("PIRINEU365 Infoneu", "https://pirineu365.cat/infoneu-pirineu365/")}; Baqueira Beret on its ${link("resort status page", "https://www.baqueira.es/es/estado-de-la-estacion")}; Port del Comte on ${link("its runs page", "https://portdelcomte.net/pistes/")}. Before the season opens they are empty.`,
      `**Forecasts:** Meteocat's ${link("ski-slope forecast", OFFICIAL.meteocatSki)} and ${link("Pyrenees forecast", OFFICIAL.meteocatPyrenees)} (in Catalan), and AEMET's ${link("Catalan Pyrenees mountain forecast", OFFICIAL.aemetMountain(locale))}. We do not make forecasts of our own.`,
      `**Avalanches:** the ICGC's ${link("Avalanche Danger Bulletin", OFFICIAL.bpa(locale))}, valid off-piste. Its notice says the daily service resumes on ${dayMonthYear(BPA_RESUMES, "en")}, or earlier if snow conditions require it.`,
      `**Roads:** the Catalan traffic service's ${link("road status", OFFICIAL.traffic(locale))} page. **Emergencies:** 112.`,
    ],
    relatedTitle: "Related guides",
    related: [
      { label: "Is there snow in the Catalan Pyrenees today?", href: b2href("snowNow", locale) },
      { label: "Ski resorts in Catalonia 2026-27", href: b2href("ski", locale) },
      { label: "Where to see snow in Catalonia without skiing", href: b2href("snow", locale) },
      { label: "Cerdanya without a car", href: b2href("cerdanya", locale) },
      { label: "Vall de Núria rack railway", href: b2href("nuria", locale) },
    ],
    sourcesTitle: "Sources",
    sourcesNote: `Official data. Readings are fetched when the page opens; everything else was read ${read}.`,
    sources,
  };
}

/** The Meteocat page for the hub's fallback link. */
export const METEOCAT_MAP_URL = METEOCAT_XEMA_URL;
