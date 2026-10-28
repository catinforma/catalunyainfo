/**
 * Words of the weekend zone pages, in Catalan and Spanish. Pure: titles,
 * descriptions, headings, the labels of the live list and the guidance block.
 *
 * Facts quoted in the guidance, read on 28 Oct 2026:
 *  - Agenda Cultural de Catalunya (`rhpv-yr4f`), dataset description: the
 *    Departament de Cultura "ofereix un recull d'activitats culturals
 *    destacades que es realitzen per tot Catalunya".
 *  - Calendari de fires (`vm32-przc`), dataset description: "Si aquesta
 *    activitat s'adreça principalment al públic professional serà una fira;
 *    mentre que si s'adreça al públic en general serà una fira mercat."
 *  - Generalitat open-data licence (web.gencat.cat/ca/generalitat/
 *    dades-indicadors/dades-obertes/llicencies): cite "Generalitat de
 *    Catalunya. Departament de …", give the date of the last update, do not
 *    alter the content.
 */

import type { WeekendWindow } from "@/lib/content/weekend/agenda";
import { WEEKDAY_NAMES, holidayOn, addDays, shortDate } from "@/lib/content/holidays/calendar";
import { weekendRange } from "@/lib/content/live-title";
import type { Category } from "./live";
import { MIN_EVENTS, type WeekendLocale, type ZoneDef } from "./zones";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

const first = (options: readonly string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

/** "Del divendres 30 d'octubre al diumenge 1 de novembre de 2026". */
export function rangeLong(window: Pick<WeekendWindow, "from" | "to">, locale: WeekendLocale): string {
  const day = (iso: string) => `${WEEKDAY_NAMES[locale][new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${shortDate(iso, locale)}`;
  return `Del ${day(window.from)} al ${day(window.to)} de ${window.to.slice(0, 4)}`;
}

/** "28 d'octubre de 2026" / "28 de octubre de 2026". */
export function fullDate(iso: string, locale: WeekendLocale): string {
  return `${shortDate(iso, locale)} de ${iso.slice(0, 4)}`;
}

const PROVINCE_NAMES: Record<string, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

/** How the page names the wider area it falls back to: "de tota la província de Girona", "de Barcelona". */
export function widerPhrase(wider: ZoneDef, locale: WeekendLocale): string {
  const province = wider.provinces?.[0];
  if (wider.kind === "province" && province) {
    return locale === "es" ? `de toda la provincia de ${PROVINCE_NAMES[province]}` : `de tota la província de ${PROVINCE_NAMES[province]}`;
  }
  return wider.of[locale];
}

/** "30 d'octubre – 1 de novembre", or one day. */
export function dayRange(start: string, end: string, locale: WeekendLocale): string {
  return start === end ? shortDate(start, locale) : `${shortDate(start, locale)} – ${shortDate(end, locale)}`;
}

/** The Catalonia-wide holidays inside a long weekend, as a sentence; null for an ordinary one. */
export function longWeekendNote(window: WeekendWindow, locale: WeekendLocale): string | null {
  if (!window.long) return null;
  const days: string[] = [];
  for (let d = window.from; d <= window.to; d = addDays(d, 1)) {
    const holiday = holidayOn(d);
    if (holiday) days.push(`${holiday.name[locale]} (${WEEKDAY_NAMES[locale][new Date(`${d}T12:00:00Z`).getUTCDay()]} ${shortDate(d, locale)})`);
  }
  if (days.length === 0) return null;
  const many = days.length > 1;
  return locale === "es"
    ? `Es puente: ${days.join(" y ")} ${many ? "son festivos" : "es festivo"} en toda Cataluña, y la agenda cubre los ${countDays(window)} días.`
    : `És pont: ${days.join(" i ")} ${many ? "són festius" : "és festiu"} a tot Catalunya, i l'agenda cobreix els ${countDays(window)} dies.`;
}

function countDays(window: Pick<WeekendWindow, "from" | "to">): number {
  return Math.round((Date.parse(`${window.to}T12:00:00Z`) - Date.parse(`${window.from}T12:00:00Z`)) / 86_400_000) + 1;
}

/* -------------------------------------------------------------------------- */
/* Titles, descriptions, H1                                                   */
/* -------------------------------------------------------------------------- */

/**
 * "Què fer aquest cap de setmana a Girona (30 oct–1 nov)". The dates come
 * from the same window as the rest of the page, in the same words the
 * Catalonia weekend page uses (`weekendRange`); a shorter form is used when
 * the zone's name and the dates would pass 60 characters.
 */
export function zoneTitle(zone: ZoneDef, locale: WeekendLocale, window: Pick<WeekendWindow, "from" | "to">): string {
  const r = weekendRange(locale, window);
  const where = zone.in[locale];
  return first(
    locale === "es"
      ? [`Qué hacer este fin de semana ${where} (${r})`, `Planes de fin de semana ${where} (${r})`, `Fin de semana ${where}: planes (${r})`, `Qué hacer ${where} (${r})`]
      : [`Què fer aquest cap de setmana ${where} (${r})`, `Plans de cap de setmana ${where} (${r})`, `Cap de setmana ${where}: plans (${r})`, `Què fer ${where} (${r})`],
    TITLE_LIMIT,
  );
}

export function zoneDescription(zone: ZoneDef, locale: WeekendLocale, window: Pick<WeekendWindow, "from" | "to">): string {
  const r = weekendRange(locale, window);
  const where = zone.in[locale];
  return first(
    locale === "es"
      ? [
          `Qué hacer este fin de semana ${where} (${r}): ferias y mercados, conciertos, teatro y planes con niños, con la agenda oficial de la Generalitat.`,
          `Qué hacer ${where} este fin de semana (${r}): ferias, conciertos y planes con niños, con la agenda oficial de la Generalitat.`,
          `Ferias, conciertos y planes ${where} este fin de semana (${r}), con la agenda oficial de la Generalitat.`,
        ]
      : [
          `Què fer aquest cap de setmana ${where} (${r}): fires i mercats, concerts, teatre i plans amb nens, amb l'agenda oficial de la Generalitat.`,
          `Què fer ${where} aquest cap de setmana (${r}): fires, concerts i plans amb nens, amb l'agenda oficial de la Generalitat.`,
          `Fires, concerts i plans ${where} aquest cap de setmana (${r}), amb l'agenda oficial de la Generalitat.`,
        ],
    DESCRIPTION_LIMIT,
  );
}

export function zoneH1(zone: ZoneDef, locale: WeekendLocale): string {
  return locale === "es" ? `Qué hacer este fin de semana ${zone.h1In.es}` : `Què fer aquest cap de setmana ${zone.h1In.ca}`;
}

export const HUB_CRUMB: Record<WeekendLocale, string> = { ca: "Cap de setmana", es: "Fin de semana" };

export interface HubMeta {
  title: string;
  description: string;
  h1: string;
  crumb: string;
}

export function hubMeta(locale: WeekendLocale, window: Pick<WeekendWindow, "from" | "to">): HubMeta {
  const r = weekendRange(locale, window);
  return locale === "es"
    ? {
        title: first([`Ferias y mercados este fin de semana (${r})`, `Ferias y mercados (${r})`], TITLE_LIMIT),
        description: first(
          [
            `Las ferias y mercados de este fin de semana en Cataluña (${r}), del calendario oficial de ferias, y qué hacer por zonas: Girona, Costa Brava, Pirineo…`,
            `Ferias y mercados de este fin de semana en Cataluña (${r}), del calendario oficial, y qué hacer por zonas.`,
          ],
          DESCRIPTION_LIMIT,
        ),
        h1: "Ferias, mercados y planes de este fin de semana, por zonas",
        crumb: HUB_CRUMB.es,
      }
    : {
        title: first([`Fires i mercats aquest cap de setmana (${r})`, `Fires i mercats (${r})`], TITLE_LIMIT),
        description: first(
          [
            `Les fires i mercats d'aquest cap de setmana a Catalunya (${r}), del calendari oficial de fires, i què fer per zones: Girona, Costa Brava, Pirineu…`,
            `Fires i mercats d'aquest cap de setmana a Catalunya (${r}), del calendari oficial, i què fer per zones.`,
          ],
          DESCRIPTION_LIMIT,
        ),
        h1: "Fires, mercats i plans d'aquest cap de setmana, per zones",
        crumb: HUB_CRUMB.ca,
      };
}

/* -------------------------------------------------------------------------- */
/* Page text                                                                  */
/* -------------------------------------------------------------------------- */

export function zoneLead(zone: ZoneDef, locale: WeekendLocale): string {
  return locale === "es"
    ? `Las actividades de este fin de semana ${zone.in.es} que publica la Agenda Cultural de Catalunya y las ferias del calendario oficial de la Generalitat, con cómo llegar en tren, el tiempo y otras zonas cerca.`
    : `Les activitats d'aquest cap de setmana ${zone.in.ca} que publica l'Agenda Cultural de Catalunya i les fires del calendari oficial de la Generalitat, amb com arribar-hi en tren, el temps i altres zones a prop.`;
}

/** What the zone is, in official units. `comarques` already in sentence form and joined. */
export function zoneScope(
  zone: ZoneDef,
  locale: WeekendLocale,
  info: { towns: number; comarques: string; comarcaCount: number; capital: string | null; brandNames: string },
): string {
  const es = locale === "es";
  switch (zone.kind) {
    case "city":
      return es
        ? `Solo el municipio de ${zone.name.es}; el resto de la provincia tiene su propia página.`
        : `Només el municipi de ${zone.name.ca}; la resta de la província té la seva pàgina.`;
    case "province":
      return es
        ? `Los ${info.towns} municipios de la provincia, en ${info.comarcaCount} comarcas. Primero salen las actividades de la ciudad de ${info.capital}.`
        : `Els ${info.towns} municipis de la província, en ${info.comarcaCount} comarques. Primer surten les activitats de la ciutat de ${info.capital}.`;
    case "brand":
      return es
        ? `Según ${info.brandNames} (clasificación de marcas turísticas del Idescat), son ${info.comarcaCount} comarcas: ${info.comarques}. En total, ${info.towns} municipios.`
        : `Segons ${info.brandNames} (classificació de marques turístiques de l'Idescat), són ${info.comarcaCount} comarques: ${info.comarques}. En total, ${info.towns} municipis.`;
    case "comarca":
      return es ? `Los ${info.towns} municipios de la comarca ${zone.of.es}.` : `Els ${info.towns} municipis de la comarca ${zone.of.ca}.`;
  }
}

export interface Guidance {
  title: string;
  paragraphs: string[];
}

/** How to read the page: the block of original guidance every zone page carries. Inline Markdown only. */
export function guidance(locale: WeekendLocale, zone: ZoneDef | null, widerName: string | null, agendaUrl: string, fairsUrl: string): Guidance {
  const es = locale === "es";
  const short =
    zone === null
      ? null
      : widerName
        ? es
          ? `**Si un fin de semana hay menos de ${MIN_EVENTS} actividades ${zone.in.es}**, la página lo dice y también muestra las ${widerName}.`
          : `**Si un cap de setmana hi ha menys de ${MIN_EVENTS} activitats ${zone.in.ca}**, la pàgina ho diu i també mostra les ${widerName}.`
        : es
          ? `**Si un fin de semana hay menos de ${MIN_EVENTS} actividades ${zone.in.es}**, la página lo dice y te enlaza la agenda de toda Cataluña.`
          : `**Si un cap de setmana hi ha menys de ${MIN_EVENTS} activitats ${zone.in.ca}**, la pàgina ho diu i t'enllaça l'agenda de tot Catalunya.`;
  const paragraphs = es
    ? [
        `**La agenda** es la [Agenda Cultural de Catalunya](${agendaUrl}), que el Departament de Cultura describe como «un recull d'activitats culturals destacades» (una selección de actividades culturales destacadas) de toda Cataluña. Es una selección, no la lista completa: mira también la agenda de tu ayuntamiento. Se lee en directo cuando abres la página y cambia sola de fin de semana.`,
        `**Las ferias** salen del [calendario oficial de ferias de Cataluña](${fairsUrl}) (Departament d'Empresa i Treball). Hay ferias para profesionales y ferias mercado para el público general: antes de ir, comprueba en la web del organizador si está abierta a todo el mundo y en qué horario.`,
        ...(short ? [short] : []),
        "**Gratuito quiere decir entrada libre**, no sin reserva: muchos conciertos y visitas gratuitos tienen aforo limitado y hay que inscribirse.",
        "**Si el viernes o el lunes es festivo en toda Cataluña**, la página cubre el puente entero.",
      ]
    : [
        `**L'agenda** és l'[Agenda Cultural de Catalunya](${agendaUrl}), que segons el Departament de Cultura «ofereix un recull d'activitats culturals destacades» de tot Catalunya. És una selecció, no la llista completa: mira també l'agenda del teu ajuntament. Es llegeix en directe quan obres la pàgina i canvia sola de cap de setmana.`,
        `**Les fires** surten del [calendari oficial de fires de Catalunya](${fairsUrl}) (Departament d'Empresa i Treball). Hi ha fires per a professionals i fires mercat per al públic general: abans d'anar-hi, comprova al web de l'organitzador si és oberta a tothom i en quin horari.`,
        ...(short ? [short] : []),
        "**Gratuït vol dir entrada lliure**, no sense reserva: molts concerts i visites gratuïts tenen aforament limitat i cal inscriure-s'hi.",
        "**Si el divendres o el dilluns és festiu a tot Catalunya**, la pàgina cobreix el pont sencer.",
      ];
  return { title: es ? "Cómo leer esta página" : "Com llegir aquesta pàgina", paragraphs };
}

/** Attribution in the form the Generalitat's open-data licence asks for. */
export function attribution(locale: WeekendLocale, dates: { agenda: string; fairs: string }): string {
  return locale === "es"
    ? `Fuentes: Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, leída en directo; datos actualizados el ${dates.agenda} cuando preparamos esta página) y Generalitat de Catalunya. Departament d'Empresa i Treball (calendario de ferias, actualizado el ${dates.fairs}). CatalunyaInfo filtra los datos por zona y no los modifica; la Generalitat no participa en esta página.`
    : `Fonts: Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, llegida en directe; dades actualitzades el ${dates.agenda} quan vam preparar aquesta pàgina) i Generalitat de Catalunya. Departament d'Empresa i Treball (calendari de fires, actualitzat el ${dates.fairs}). CatalunyaInfo filtra les dades per zona i no les modifica; la Generalitat no participa en aquesta pàgina.`;
}

/* -------------------------------------------------------------------------- */
/* Section titles and labels                                                  */
/* -------------------------------------------------------------------------- */

export interface SectionTitles {
  fairsNow: string;
  fairsNext: string;
  agenda: string;
  agendaLong: string;
  train: string;
  car: string;
  weather: string;
  guides: string;
  zones: string;
  sources: string;
  allZones: string;
  cataloniaPage: string;
  hubZones: string;
  noFairs: string;
  noFairsAfter: (readOn: string) => string;
  fairsNote: string;
  stationsIn: string;
  noStations: string;
  liveStatus: string;
  fuelLine: string;
  weatherLine: string;
  moreLines: string;
}

export function sectionTitles(locale: WeekendLocale): SectionTitles {
  return locale === "es"
    ? {
        fairsNow: "Ferias y mercados este fin de semana",
        fairsNext: "Próximas ferias",
        agenda: "Agenda de este fin de semana",
        agendaLong: "Agenda de este puente",
        train: "Cómo llegar en tren",
        car: "Si vas en coche",
        weather: "El tiempo",
        guides: "Para leer después",
        zones: "Otras zonas",
        sources: "Fuentes",
        allZones: "Todas las zonas y las ferias de este fin de semana",
        cataloniaPage: "Qué hacer este fin de semana en toda Cataluña",
        hubZones: "Qué hacer este fin de semana, por zonas",
        noFairs: "Ninguna feria del calendario oficial coincide con este fin de semana aquí.",
        noFairsAfter: (readOn) => `El calendario de ferias que leímos el ${readOn} no tiene más ferias después de esta fecha. La Generalitat publica el del año siguiente en su portal de datos abiertos.`,
        fairsNote: "Hay ferias para profesionales y ferias mercado para todo el mundo: comprueba en la web del organizador si está abierta al público.",
        stationsIn: "estaciones aquí",
        noStations: "La lista oficial de líneas de Rodalies de Catalunya no tiene ninguna estación en esta zona.",
        liveStatus: "Avisos de Rodalies en directo, línea por línea",
        fuelLine: "Precio de la gasolina y el diésel hoy:",
        weatherLine: "Previsión del Servei Meteorològic de Catalunya (Meteocat) para",
        moreLines: "Todas las líneas con estación aquí:",
      }
    : {
        fairsNow: "Fires i mercats aquest cap de setmana",
        fairsNext: "Pròximes fires",
        agenda: "Agenda d'aquest cap de setmana",
        agendaLong: "Agenda d'aquest pont",
        train: "Com arribar-hi en tren",
        car: "Si hi vas amb cotxe",
        weather: "El temps",
        guides: "Per llegir després",
        zones: "Altres zones",
        sources: "Fonts",
        allZones: "Totes les zones i les fires d'aquest cap de setmana",
        cataloniaPage: "Què fer aquest cap de setmana a tot Catalunya",
        hubZones: "Què fer aquest cap de setmana, per zones",
        noFairs: "Cap fira del calendari oficial no coincideix amb aquest cap de setmana aquí.",
        noFairsAfter: (readOn) => `El calendari de fires que vam llegir el ${readOn} no té més fires després d'aquesta data. La Generalitat publica el de l'any següent al seu portal de dades obertes.`,
        fairsNote: "Hi ha fires per a professionals i fires mercat per a tothom: comprova al web de l'organitzador si és oberta al públic.",
        stationsIn: "estacions aquí",
        noStations: "La llista oficial de línies de Rodalies de Catalunya no té cap estació en aquesta zona.",
        liveStatus: "Avisos de Rodalies en directe, línia per línia",
        fuelLine: "Preu de la gasolina i el dièsel avui:",
        weatherLine: "Previsió del Servei Meteorològic de Catalunya (Meteocat) per a",
        moreLines: "Totes les línies amb estació aquí:",
      };
}

/** Labels of the live list, passed to the browser component. */
export interface LiveLabels {
  heading: string;
  headingLong: string;
  fallback: string;
  loading: string;
  failed: string;
  stale: string;
  summary: string;
  none: string;
  short: string;
  shortCatalonia: string;
  widerHeading: string;
  capital: string;
  free: string;
  more: string;
  official: string;
  check: string;
  catalonia: string;
  categories: Record<Category, string>;
}

export function liveLabels(locale: WeekendLocale, categories: Record<Category, string>, free: string): LiveLabels {
  return locale === "es"
    ? {
        heading: "Agenda de este fin de semana",
        headingLong: "Agenda de este puente",
        fallback: "Las actividades de este fin de semana se cargan de la Agenda Cultural de Catalunya al abrir la página, con JavaScript activado. Sin él, consúltalas en la web oficial:",
        loading: "Cargando la agenda oficial…",
        failed: "Ahora no podemos leer la agenda oficial. No te mostraremos la de un fin de semana pasado: consúltala directamente en la web oficial:",
        stale: "La agenda del nuevo fin de semana se está actualizando. Mientras tanto, consúltala en la web oficial:",
        summary: "Actividades {where}: {count} (gratuitas: {free}).",
        none: "La agenda oficial no tiene ninguna actividad {where} este fin de semana.",
        short: "Este fin de semana la agenda oficial tiene pocas actividades {where} ({count}). Debajo, también las {wider}.",
        shortCatalonia: "Este fin de semana la agenda oficial tiene pocas actividades {where} ({count}). Mira también:",
        widerHeading: "Otras actividades {wider}",
        capital: "En la ciudad de {capital}",
        free,
        more: "Y {n} más en la agenda oficial.",
        official: "Agenda Cultural de Catalunya",
        check: "Comprueba horarios y entradas en la web de cada organizador antes de ir. Fuente:",
        catalonia: "Qué hacer este fin de semana en Cataluña",
        categories,
      }
    : {
        heading: "Agenda d'aquest cap de setmana",
        headingLong: "Agenda d'aquest pont",
        fallback: "Les activitats d'aquest cap de setmana es carreguen de l'Agenda Cultural de Catalunya en obrir la pàgina, amb el JavaScript activat. Sense, consulta-les al web oficial:",
        loading: "Carregant l'agenda oficial…",
        failed: "Ara no podem llegir l'agenda oficial. No et mostrarem la d'un cap de setmana passat: consulta-la directament al web oficial:",
        stale: "L'agenda del nou cap de setmana s'està actualitzant. Mentrestant, consulta-la al web oficial:",
        summary: "Activitats {where}: {count} (gratuïtes: {free}).",
        none: "L'agenda oficial no té cap activitat {where} aquest cap de setmana.",
        short: "Aquest cap de setmana l'agenda oficial té poques activitats {where} ({count}). A sota, també les {wider}.",
        shortCatalonia: "Aquest cap de setmana l'agenda oficial té poques activitats {where} ({count}). Mira també:",
        widerHeading: "Altres activitats {wider}",
        capital: "A la ciutat de {capital}",
        free,
        more: "I {n} més a l'agenda oficial.",
        official: "Agenda Cultural de Catalunya",
        check: "Comprova horaris i entrades al web de cada organitzador abans d'anar-hi. Font:",
        catalonia: "Què fer aquest cap de setmana a Catalunya",
        categories,
      };
}
