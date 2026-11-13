/**
 * Words of the Christmas fair pages, in Catalan, Spanish and English. Pure:
 * titles, descriptions, headings and the guidance block. No clock: the only
 * dates are the fairs' own and the day the sources were read.
 *
 * Facts quoted, read on 30 Oct 2026:
 *  - Calendari de fires (`vm32-przc`): its rows carry dates, place, organiser
 *    and website, and no opening hours.
 *  - Generalitat open-data licence: cite "Generalitat de Catalunya.
 *    Departament de …", give the date of the last update, do not alter the
 *    content (as the weekend pages do).
 *  - Mou-te (mou-te.gencat.cat), "Mou-te amb transport públic": the
 *    Generalitat's public transport journey planner (opened 30 Oct 2026).
 */

import { caA, caDe, caStart, esName, joinList } from "@/lib/programmatic/holidays/names";

import { SEASON_YEAR, fold, shortFairName } from "./classify";
import { capitalize, fullDate, rangeText, shortRange } from "./format";
import type { FairsLocale } from "./paths";
import type { StatusLabels } from "./today";
import type { Fair } from "./types";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

const first = (options: readonly string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;

/** "Barcelona"; "la Pobla de Segur" (ca) / "La Pobla de Segur" (es, en). */
export function townName(name: string, locale: FairsLocale): string {
  return locale === "ca" ? name : esName(name);
}

/** "24a Fira de Santa Llúcia" -> "Fira de Santa Llúcia"; "6è Mercat de Nadal…" -> "Mercat de Nadal…". */
export function stripOrdinal(name: string): string {
  return name.replace(/^\d+\s*(?:a|è|e|r|n|t|ª|º|\.ª|\.º)\s+/i, "").trim();
}

const contains = (text: string, town: string) => fold(text).includes(fold(town.replace(/^(el|la|les|els) |^l'/i, "")));

/**
 * "Fira de Santa Llúcia a l'Avinguda de la Catedral de Barcelona" -> "Fira de
 * Santa Llúcia": the agenda sometimes puts the street in the name, which
 * would push the town out of a 60-character title. Only a street-type word
 * after " a " is cut, so names like "Fira d'Artesans i de Nadal" stay whole.
 */
export function stripVenue(name: string): string {
  const cut = name.replace(/\s+a\s+(?:l'|l’|la\s+|les\s+|el\s+|els\s+)?(?:avinguda|plaça|rambla|passeig|carrer|pla)(?=\s|$).*$/iu, "").trim();
  return cut.length >= 8 ? cut : name;
}

/** The fair's name as a heading uses it, in the page's language. */
export function fairShortName(f: Pick<Fair, "name" | "nameEs">, locale: FairsLocale): string {
  const ca = stripVenue(stripOrdinal(shortFairName(f.name)));
  if (locale !== "es") return ca;
  if (f.nameEs) return stripVenue(stripOrdinal(shortFairName(f.nameEs)));
  // No Spanish name in the calendar (an organiser's own announcement or an agenda row).
  if (/^fira de santa llúcia$/i.test(ca)) return "Feria de Santa Llúcia";
  return /^mercat/i.test(ca) ? "Mercado de Navidad" : "Feria de Navidad";
}

interface TownLike {
  name: string;
  fairs: (Pick<Fair, "name" | "nameEs" | "start" | "end" | "place"> & { id?: string })[];
}

/**
 * Towns whose title and description stay on one fair while a measurement
 * window is open (docs/SEO_EXPERIMENTS.md), even if the page now lists more:
 * town INE -> the fair the snippet keeps talking about, and the last day of
 * the hold. Barcelona: the 3 Nov 2026 entry measures the Santa Llúcia title
 * on 17 Nov and 1 Dec; the Sagrada Família and Nadal al Port fairs (added 13
 * Nov) go into the page body and H1 only. Remove the entry after 1 Dec
 * (tests/christmas-fairs.test.ts fails from 2 Dec 2026 as a reminder).
 */
export const SNIPPET_HOLDS: Readonly<Record<string, { fairId: string; until: string }>> = {
  "08019": { fairId: "agenda:2026110300020", until: "2026-12-01" },
};

/** The fairs the title and description speak of: all of the town's, or the held one. */
function snippetTown<T extends TownLike & { ine?: string }>(town: T): T {
  const hold = town.ine ? SNIPPET_HOLDS[town.ine] : undefined;
  if (!hold) return town;
  const fair = town.fairs.find((f) => f.id === hold.fairId);
  return fair ? { ...town, fairs: [fair] } : town;
}

/**
 * The page's subject, without the year: "Fira del Tió de Solsona", "Fira de
 * Nadal de Vallirana" (the name already says the town), "Fires de Nadal a
 * Barcelona" (several fairs), "Vic Christmas market".
 */
export function headline(town: TownLike, locale: FairsLocale): string {
  const many = town.fairs.length > 1;
  if (locale === "en") return many ? `Christmas markets in ${townName(town.name, "en")}` : `${townName(town.name, "en")} Christmas market`;
  if (many) return locale === "es" ? `Ferias de Navidad en ${townName(town.name, "es")}` : `Fires de Nadal ${caA(town.name)}`;
  const name = fairShortName(town.fairs[0]!, locale);
  if (contains(name, town.name)) return name;
  return locale === "es" ? `${name} de ${townName(town.name, "es")}` : `${name} ${caDe(town.name)}`;
}

export function townH1(town: TownLike, locale: FairsLocale): string {
  return `${headline(town, locale)} ${SEASON_YEAR}`;
}

const TITLE_TAIL: Record<FairsLocale, { one: string; many: string }> = {
  ca: { one: "dates i lloc", many: "dates i llocs" },
  es: { one: "fechas y lugar", many: "fechas y lugares" },
  en: { one: "dates and place", many: "dates and places" },
};

/**
 * Title experiment (docs/SEO_EXPERIMENTS.md, 13 Nov 2026): towns whose title
 * gives the fair's days instead of "dates i lloc", once the organiser has
 * confirmed them. Canyelles and Espinelves: the two most-searched fair pages,
 * 0-2 % CTR at positions 8-10 for queries that ask for the date ("fira santa
 * llucia canyelles 2026", "fira espinelves 2026"). Review 20 and 27 Nov.
 */
export const DATED_TITLE_TOWNS: readonly string[] = ["08043", "17063"];

export function townTitle(subject: TownLike & { ine?: string }, locale: FairsLocale): string {
  const town = snippetTown(subject);
  const h = `${headline(town, locale)} ${SEASON_YEAR}`;
  const tail = town.fairs.length > 1 ? TITLE_TAIL[locale].many : TITLE_TAIL[locale].one;
  const generic =
    locale === "ca"
      ? `Fira de Nadal ${caDe(town.name)} ${SEASON_YEAR}`
      : locale === "es"
        ? `Feria de Navidad de ${townName(town.name, "es")} ${SEASON_YEAR}`
        : `${townName(town.name, "en")} Christmas market ${SEASON_YEAR}`;
  const only = town.fairs.length === 1 ? town.fairs[0]! : null;
  const dated =
    only && subject.ine && DATED_TITLE_TOWNS.includes(subject.ine)
      ? [`${h}: ${rangeText(only.start, only.end, locale, { weekdays: false, year: false })}`, `${h}: ${shortRange(only.start, only.end, locale)}`]
      : [];
  return first([...dated, `${h}: ${tail}`, h, generic], TITLE_LIMIT);
}

const placeNote = (place: string | null) => (place ? ` (${place})` : "");

export function townDescription(subject: TownLike & { ine?: string }, locale: FairsLocale): string {
  const town = snippetTown(subject);
  const h = headline(town, locale);
  if (town.fairs.length === 1) {
    const f = town.fairs[0]!;
    const when = rangeText(f.start, f.end, locale, { weekdays: false });
    const tail =
      locale === "ca"
        ? ["Dates oficials, com arribar-hi i què obre aquells dies.", "Dates oficials i com arribar-hi.", ""]
        : locale === "es"
          ? ["Fechas oficiales, cómo llegar y qué abre esos días.", "Fechas oficiales y cómo llegar.", ""]
          : ["Official dates, how to get there and what is open.", "Official dates and how to get there.", ""];
    const lead = locale === "en" ? `${h} ${SEASON_YEAR}: ${fairShortName(f, "en")}, ${when}` : `${h}: ${when}`;
    const options = tail.flatMap((t) => [`${lead}${placeNote(f.place)}. ${t}`.trim(), `${lead}. ${t}`.trim()]);
    return first(options, DESCRIPTION_LIMIT);
  }
  const list = town.fairs.map((f) => `${fairShortName(f, locale)} (${shortRange(f.start, f.end, locale)})`);
  const options =
    locale === "ca"
      ? [`${h} el ${SEASON_YEAR}: ${joinList(list, "ca")}. Dates oficials i com arribar-hi.`, `${h} el ${SEASON_YEAR}: ${town.fairs.length} fires amb dates oficials, llocs i com arribar-hi.`]
      : locale === "es"
        ? [`${h} en ${SEASON_YEAR}: ${joinList(list, "es")}. Fechas oficiales y cómo llegar.`, `${h} en ${SEASON_YEAR}: ${town.fairs.length} ferias con fechas oficiales, lugares y cómo llegar.`]
        : [`${h} ${SEASON_YEAR}: ${joinList(list, "en")}. Official dates and how to get there.`, `${h} ${SEASON_YEAR}: ${town.fairs.length} fairs with official dates, places and how to get there.`];
  return first(options, DESCRIPTION_LIMIT);
}

/**
 * One sentence after the lead on whether the 2026 edition is confirmed: every
 * fair on the page read on an official page for 2026, or every fair still
 * waiting for its organiser. Mixed pages say it fair by fair, in the cards.
 */
export function confirmationNote(fairs: readonly Pick<Fair, "checked" | "unconfirmed">[], locale: FairsLocale): string | null {
  if (fairs.length === 0) return null;
  const one = fairs.length === 1;
  if (fairs.every((f) => f.unconfirmed)) {
    if (locale === "ca")
      return `${one ? "L'organitzador encara no ha confirmat" : "Els organitzadors encara no han confirmat"} l'edició del 2026 al seu web: les dates són les del calendari oficial de fires.`;
    if (locale === "es")
      return `${one ? "El organizador aún no ha confirmado" : "Los organizadores aún no han confirmado"} la edición de 2026 en su web: las fechas son las del calendario oficial de ferias.`;
    return `${one ? "The organiser has not confirmed the 2026 edition on its website" : "The organisers have not confirmed the 2026 edition on their websites"} yet: the dates are the official fairs calendar's.`;
  }
  if (fairs.every((f) => f.checked)) {
    if (locale === "ca") return one ? "Dates del 2026 confirmades a la pàgina oficial de la fira." : "Dates del 2026 confirmades a la pàgina oficial de cada fira.";
    if (locale === "es") return one ? "Fechas de 2026 confirmadas en la página oficial de la feria." : "Fechas de 2026 confirmadas en la página oficial de cada feria.";
    return one ? "2026 dates confirmed on the market's official page." : "2026 dates confirmed on each market's official page.";
  }
  return null;
}

/** The sentence under the H1. Markdown links allowed. */
export function townLead(town: TownLike & { comarcaName: string }, locale: FairsLocale, checked: string): string {
  const where = locale === "ca" ? `${caStart(town.name)} (${town.comarcaName})` : `${townName(town.name, locale)} (${town.comarcaName})`;
  const n = town.fairs.length;
  if (locale === "ca") {
    const what = n === 1 ? "té una fira de Nadal amb data oficial" : `té ${n} fires de Nadal amb data oficial`;
    return `${where} ${what} aquesta temporada. Revisat el ${fullDate(checked, "ca")} al calendari oficial de fires de la Generalitat i als webs dels organitzadors.`;
  }
  if (locale === "es") {
    const what = n === 1 ? "tiene una feria de Navidad con fecha oficial" : `tiene ${n} ferias de Navidad con fecha oficial`;
    return `${where} ${what} esta temporada. Revisado el ${fullDate(checked, "es")} en el calendario oficial de ferias de la Generalitat y en las webs de los organizadores.`;
  }
  const what = n === 1 ? "has one Christmas market with official dates" : `has ${n} Christmas markets with official dates`;
  return `${where} ${what} this season. Checked on ${fullDate(checked, "en")} against the Catalan government's official fairs calendar and the organisers' own websites.`;
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface HubMeta {
  title: string;
  description: string;
  h1: string;
  crumb: string;
}

export function hubMeta(locale: FairsLocale, counts: { fairs: number; towns: number }, checked: string): HubMeta {
  const y = SEASON_YEAR;
  if (locale === "ca") {
    return {
      title: first([`Fires de Nadal ${y} a Catalunya: dates per municipi`, `Fires de Nadal ${y} a Catalunya`], TITLE_LIMIT),
      description: first(
        [
          `Les ${counts.fairs} fires i mercats de Nadal del ${y} amb data oficial a ${counts.towns} municipis de Catalunya: dates, lloc i com arribar-hi. Revisat el ${fullDate(checked, "ca")}.`,
          `Les ${counts.fairs} fires i mercats de Nadal del ${y} amb data oficial a Catalunya, municipi per municipi.`,
        ],
        DESCRIPTION_LIMIT,
      ),
      h1: `Fires i mercats de Nadal ${y} a Catalunya`,
      crumb: "Fires de Nadal",
    };
  }
  if (locale === "es") {
    return {
      title: first([`Ferias de Navidad ${y} en Cataluña: fechas por municipio`, `Ferias de Navidad ${y} en Cataluña`], TITLE_LIMIT),
      description: first(
        [
          `Las ${counts.fairs} ferias y mercados de Navidad de ${y} con fecha oficial en ${counts.towns} municipios de Cataluña: fechas, lugar y cómo llegar. Revisado el ${fullDate(checked, "es")}.`,
          `Las ${counts.fairs} ferias y mercados de Navidad de ${y} con fecha oficial en Cataluña, municipio por municipio.`,
        ],
        DESCRIPTION_LIMIT,
      ),
      h1: `Ferias y mercados de Navidad ${y} en Cataluña`,
      crumb: "Ferias de Navidad",
    };
  }
  return {
    title: first([`Christmas markets in Catalonia ${y}: dates by town`, `Christmas markets in Catalonia ${y}`], TITLE_LIMIT),
    description: first(
      [
        `All ${counts.fairs} Christmas markets and fairs in Catalonia with official ${y} dates, town by town: when, where and how to get there. Checked ${fullDate(checked, "en")}.`,
        `All ${counts.fairs} Christmas markets and fairs in Catalonia with official ${y} dates, town by town.`,
      ],
      DESCRIPTION_LIMIT,
    ),
    h1: `Christmas markets in Catalonia ${y}`,
    crumb: "Christmas markets",
  };
}

export function hubLead(locale: FairsLocale, counts: { fairs: number; towns: number }, checked: string): string {
  if (locale === "ca") {
    return `Les ${counts.fairs} fires i mercats de Nadal que tenen data oficial aquesta temporada, a ${counts.towns} municipis: les del calendari oficial de fires de la Generalitat i les que els ajuntaments han anunciat al seu web. Revisat el ${fullDate(checked, "ca")}; la llista creix al novembre, a mesura que els organitzadors publiquen les dates.`;
  }
  if (locale === "es") {
    return `Las ${counts.fairs} ferias y mercados de Navidad con fecha oficial esta temporada, en ${counts.towns} municipios: las del calendario oficial de ferias de la Generalitat y las que los ayuntamientos han anunciado en su web. Revisado el ${fullDate(checked, "es")}; la lista crece en noviembre, a medida que los organizadores publican las fechas.`;
  }
  return `The ${counts.fairs} Christmas markets and fairs in Catalonia with official dates this season, in ${counts.towns} towns: those in the Catalan government's official fairs calendar and those town councils have announced on their own websites. Checked on ${fullDate(checked, "en")}; the list grows through November as organisers publish their dates.`;
}

/* -------------------------------------------------------------------------- */
/* Section titles and labels                                                  */
/* -------------------------------------------------------------------------- */

export interface Labels {
  fairs: string;
  fairsMany: string;
  stillPending: string;
  pending: string;
  pendingIntro: string;
  byDate: string;
  byProvince: string;
  getThere: string;
  holidays: string;
  weekend: string;
  nearby: string;
  guides: string;
  sources: string;
  howToRead: string;
  place: string;
  organiser: string;
  since: string;
  website: string;
  councilWebsite: string;
  fromCalendar: string;
  fromAgenda: string;
  fromOrganiser: (publisher: string, date: string) => string;
  /** The calendar's (or agenda's) dates, confirmed on the organiser's page for this edition. */
  confirmed: (publisher: string, date: string) => string;
  /** Lead-in of the note on a fair whose organiser has not published the 2026 edition yet. */
  notConfirmed: string;
  checkedOn: (date: string) => string;
  hours: string;
  corrected: (calendarDates: string) => string;
  toConfirm: string;
  readOn: (date: string) => string;
  allFairs: string;
  provinces: Record<string, string>;
}

export function labels(locale: FairsLocale): Labels {
  if (locale === "ca") {
    return {
      fairs: "La fira",
      fairsMany: "Les fires",
      stillPending: "Encara sense dates",
      pending: "Encara sense dates del 2026",
      pendingIntro: "Aquests mercats encara no han publicat les dates d'aquest any (revisat el dia que s'indica). Els afegirem el dia que surtin.",
      byDate: "Totes les fires, per data",
      byProvince: "Per municipi",
      getThere: "Com arribar-hi",
      holidays: "Festius i botigues aquells dies",
      weekend: "La resta del cap de setmana",
      nearby: "Altres fires de Nadal a prop",
      guides: "Per seguir llegint",
      sources: "Fonts",
      howToRead: "Com llegir aquesta pàgina",
      place: "Lloc",
      organiser: "Organitza",
      since: "Primera edició",
      website: "Web de l'organitzador",
      councilWebsite: "Web de l'Ajuntament",
      fromCalendar: "Dates del calendari oficial de fires de la Generalitat.",
      fromAgenda: "Dates de l'Agenda Cultural de Catalunya.",
      fromOrganiser: (publisher, date) => `Dates del web de l'organitzador (${publisher}), llegit el ${date}.`,
      confirmed: (publisher, date) => `Dates del 2026 confirmades a la pàgina oficial (${publisher}), llegida el ${date}.`,
      notConfirmed: "Edició 2026 encara sense confirmar per l'organitzador:",
      checkedOn: (date) => `revisat el ${date}. Fins que no la confirmi, les dates d'aquí dalt són les del calendari oficial de fires: torna-ho a mirar abans d'anar-hi.`,
      hours: "Horari",
      corrected: (dates) => `El calendari oficial de fires diu ${dates}; donem les dates de l'organitzador, que són més recents.`,
      toConfirm: "Dates pendents de confirmar segons el calendari oficial.",
      readOn: (date) => `Dades llegides el ${date}.`,
      allFairs: "Totes les fires de Nadal de Catalunya",
      provinces: { "08": "Província de Barcelona", "17": "Província de Girona", "25": "Província de Lleida", "43": "Província de Tarragona" },
    };
  }
  if (locale === "es") {
    return {
      fairs: "La feria",
      fairsMany: "Las ferias",
      stillPending: "Todavía sin fechas",
      pending: "Todavía sin fechas de 2026",
      pendingIntro: "Estos mercados aún no han publicado las fechas de este año (revisado el día que se indica). Los añadiremos el día que salgan.",
      byDate: "Todas las ferias, por fecha",
      byProvince: "Por municipio",
      getThere: "Cómo llegar",
      holidays: "Festivos y tiendas esos días",
      weekend: "El resto del fin de semana",
      nearby: "Otras ferias de Navidad cerca",
      guides: "Para seguir leyendo",
      sources: "Fuentes",
      howToRead: "Cómo leer esta página",
      place: "Lugar",
      organiser: "Organiza",
      since: "Primera edición",
      website: "Web del organizador",
      councilWebsite: "Web del Ayuntamiento",
      fromCalendar: "Fechas del calendario oficial de ferias de la Generalitat.",
      fromAgenda: "Fechas de la Agenda Cultural de Catalunya.",
      fromOrganiser: (publisher, date) => `Fechas de la web del organizador (${publisher}), leída el ${date}.`,
      confirmed: (publisher, date) => `Fechas de 2026 confirmadas en la página oficial (${publisher}), leída el ${date}.`,
      notConfirmed: "Edición 2026 aún sin confirmar por el organizador:",
      checkedOn: (date) => `revisado el ${date}. Hasta que la confirme, las fechas de arriba son las del calendario oficial de ferias: vuelve a mirarlo antes de ir.`,
      hours: "Horario",
      corrected: (dates) => `El calendario oficial de ferias dice ${dates}; damos las fechas del organizador, que son más recientes.`,
      toConfirm: "Fechas pendientes de confirmar según el calendario oficial.",
      readOn: (date) => `Datos leídos el ${date}.`,
      allFairs: "Todas las ferias de Navidad de Cataluña",
      provinces: { "08": "Provincia de Barcelona", "17": "Provincia de Girona", "25": "Provincia de Lleida", "43": "Provincia de Tarragona" },
    };
  }
  return {
    fairs: "The market",
    fairsMany: "The markets",
    stillPending: "No dates yet",
    pending: "No 2026 dates yet",
    pendingIntro: "These markets have not published this year's dates yet (checked on the day shown). We add each one the day its dates appear.",
    byDate: "Every market, by date",
    byProvince: "By town",
    getThere: "Getting there",
    holidays: "Holidays and shops on those days",
    weekend: "The rest of the weekend",
    nearby: "Other Christmas markets nearby",
    guides: "Read next",
    sources: "Sources",
    howToRead: "How to read this page",
    place: "Where",
    organiser: "Run by",
    since: "First held",
    website: "Organiser's website",
    councilWebsite: "Town council website",
    fromCalendar: "Dates from the Catalan government's official fairs calendar.",
    fromAgenda: "Dates from the Agenda Cultural de Catalunya.",
    fromOrganiser: (publisher, date) => `Dates from the organiser's website (${publisher}), read on ${date}.`,
    confirmed: (publisher, date) => `2026 dates confirmed on the official page (${publisher}), read on ${date}.`,
    notConfirmed: "2026 edition not yet confirmed by the organiser:",
    checkedOn: (date) => `checked on ${date}. Until it is, the dates above are the official fairs calendar's: check again before you go.`,
    hours: "Opening hours",
    corrected: (dates) => `The official fairs calendar says ${dates}; we give the organiser's dates, which are more recent.`,
    toConfirm: "Dates still to be confirmed, according to the official calendar.",
    readOn: (date) => `Data read on ${date}.`,
    allFairs: "All Christmas markets in Catalonia",
    provinces: { "08": "Province of Barcelona", "17": "Province of Girona", "25": "Province of Lleida", "43": "Province of Tarragona" },
  };
}

/** The browser's "today" box: on a town page (one place) or on the hub (all of Catalonia). */
export function statusLabels(locale: FairsLocale, scope: "town" | "hub", place: string): StatusLabels {
  const hub = scope === "hub";
  if (locale === "ca") {
    return {
      fallback: hub ? "Les fires són a la llista de sota, per data. Amb JavaScript actiu, aquí veuràs quines són obertes avui." : `Les dates són a sota. Amb JavaScript actiu, aquí veuràs si avui hi ha fira ${caA(place)}.`,
      openOne: hub ? "Avui és oberta: {n} ({t}), fins {until}." : "Avui és oberta: {n}, fins {until}.",
      openMany: hub ? "Avui hi ha {count} fires de Nadal obertes a Catalunya." : `Avui hi ha {count} fires obertes ${caA(place)}.`,
      upcoming: hub ? "La pròxima: {n} ({t}), {when} ({in})." : "La pròxima: {n}, {when} ({in}).",
      next: "La pròxima",
      tomorrow: "demà",
      inDays: "d'aquí a {n} dies",
      over: hub ? "Les fires de Nadal d'aquesta temporada ja s'han fet (l'última, {last})." : `Les fires de Nadal d'aquesta temporada ${caA(place)} ja s'han fet (l'última, {last}).`,
      timezone: "Calculat amb l'hora de Catalunya.",
    };
  }
  if (locale === "es") {
    const p = townName(place, "es");
    return {
      fallback: hub ? "Las ferias están en la lista de abajo, por fecha. Con JavaScript activo, aquí verás cuáles están abiertas hoy." : `Las fechas están abajo. Con JavaScript activo, aquí verás si hoy hay feria en ${p}.`,
      openOne: hub ? "Hoy está abierta: {n} ({t}), hasta {until}." : "Hoy está abierta: {n}, hasta {until}.",
      openMany: hub ? "Hoy hay {count} ferias de Navidad abiertas en Cataluña." : `Hoy hay {count} ferias abiertas en ${p}.`,
      upcoming: hub ? "La próxima: {n} ({t}), el {when} ({in})." : "La próxima: {n}, el {when} ({in}).",
      next: "La próxima",
      tomorrow: "mañana",
      inDays: "dentro de {n} días",
      over: hub ? "Las ferias de Navidad de esta temporada ya se han celebrado (la última, {last})." : `Las ferias de Navidad de esta temporada en ${p} ya se han celebrado (la última, {last}).`,
      timezone: "Calculado con la hora de Cataluña.",
    };
  }
  const p = townName(place, "en");
  return {
    fallback: hub ? "The markets are listed below by date. With JavaScript on, this box shows which are open today." : `The dates are below. With JavaScript on, this box shows whether a market is on in ${p} today.`,
    openOne: hub ? "Open today: {n} ({t}), until {until}." : "Open today: {n}, until {until}.",
    openMany: hub ? "{count} Christmas markets are open in Catalonia today." : `{count} markets are open in ${p} today.`,
    upcoming: hub ? "Next: {n} ({t}), {when} ({in})." : "Next: {n}, {when} ({in}).",
    next: "Next",
    tomorrow: "tomorrow",
    inDays: "in {n} days",
    over: hub ? "This season's Christmas markets are over (the last closed on {last})." : `This season's Christmas markets in ${p} are over (the last closed on {last}).`,
    timezone: "Worked out in Catalan time.",
  };
}

/* -------------------------------------------------------------------------- */
/* Guidance                                                                   */
/* -------------------------------------------------------------------------- */

export const MOUTE_URL = "https://mou-te.gencat.cat/";

/** The "how to read" block every page carries. Inline Markdown only. */
export function guidance(locale: FairsLocale, fairsUrl: string, agendaUrl: string): string[] {
  if (locale === "ca") {
    return [
      `**D'on surten les dates.** Del [calendari oficial de fires de Catalunya](${fairsUrl}) (Departament d'Empresa i Treball), on els organitzadors registren cada fira amb les dates i el lloc, i de l'[Agenda Cultural de Catalunya](${agendaUrl}). Hi entren les fires que tenen el Nadal al nom: Nadal, Santa Llúcia, el tió, l'avet, el pessebre, Reis. Quan un ajuntament ha publicat les dates al seu web i el calendari no les té, o en té unes altres, donem les de l'ajuntament i diem on les hem llegit.`,
      "**Els horaris no surten al calendari oficial**: són al web de l'organitzador, que enllacem a cada fira.",
      `**Abans de sortir**, torna a mirar el web de l'organitzador: una fira a l'aire lliure pot canviar de dia per mal temps. En transport públic, si el poble té estació la tens aquí amb l'estat del servei en directe; si no, l'opció és l'autobús interurbà: busca el trajecte a [Mou-te](${MOUTE_URL}), el cercador de transport públic de la Generalitat.`,
    ];
  }
  if (locale === "es") {
    return [
      `**De dónde salen las fechas.** Del [calendario oficial de ferias de Cataluña](${fairsUrl}) (Departament d'Empresa i Treball), donde los organizadores registran cada feria con sus fechas y lugar, y de la [Agenda Cultural de Catalunya](${agendaUrl}). Entran las ferias que llevan la Navidad en el nombre: Nadal, Santa Llúcia, el tió, el avet (abeto), el pessebre (belén), Reis. Cuando un ayuntamiento ha publicado las fechas en su web y el calendario no las tiene, o tiene otras, damos las del ayuntamiento y decimos dónde las hemos leído.`,
      "**Los horarios no salen en el calendario oficial**: están en la web del organizador, que enlazamos en cada feria.",
      `**Antes de salir**, vuelve a mirar la web del organizador: una feria al aire libre puede cambiar de día por mal tiempo. En transporte público, si el pueblo tiene estación la tienes aquí con el estado del servicio en directo; si no, la opción es el autobús interurbano: busca el trayecto en [Mou-te](${MOUTE_URL}), el buscador de transporte público de la Generalitat.`,
    ];
  }
  return [
    `**Where the dates come from.** The [official fairs calendar of Catalonia](${fairsUrl}) (Catalan government, Department of Business and Labour), where organisers register each fair with its dates and place, and the [Agenda Cultural de Catalunya](${agendaUrl}). A fair is listed when its name says Christmas: Nadal, Santa Llúcia, the tió (Yule log), the avet (fir tree), the pessebre (nativity scene), Reis (Epiphany). When a town council has published dates on its own website that the calendar lacks, or that differ from it, we give the council's dates and say where we read them.`,
    "**Opening hours are not in the official calendar**: the organiser's website, linked for each market, has them.",
    `**Before you set off**, check the organiser's website again: an outdoor market can move because of bad weather. By public transport, if the town has a station it is listed here with the live service status; if not, the option is the intercity bus: plan the journey on [Mou-te](${MOUTE_URL}), the Catalan government's public transport planner.`,
  ];
}

/** Attribution in the form the Generalitat's open-data licence asks for. */
export function attribution(locale: FairsLocale, dates: { fairs: string; agenda: string }): string {
  if (locale === "ca") {
    return `Fonts: Generalitat de Catalunya. Departament d'Empresa i Treball (calendari de fires, actualitzat el ${dates.fairs}) i Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, actualitzada el ${dates.agenda}), i els webs dels organitzadors que s'indiquen. CatalunyaInfo tria les fires de Nadal i no en modifica les dades; la Generalitat no participa en aquesta pàgina.`;
  }
  if (locale === "es") {
    return `Fuentes: Generalitat de Catalunya. Departament d'Empresa i Treball (calendario de ferias, actualizado el ${dates.fairs}) y Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, actualizada el ${dates.agenda}), y las webs de los organizadores que se indican. CatalunyaInfo selecciona las ferias de Navidad y no modifica sus datos; la Generalitat no participa en esta página.`;
  }
  return `Sources: Generalitat de Catalunya. Departament d'Empresa i Treball (fairs calendar, updated ${dates.fairs}) and Generalitat de Catalunya. Departament de Cultura (Agenda Cultural de Catalunya, updated ${dates.agenda}), plus the organisers' websites named on the page. CatalunyaInfo selects the Christmas fairs and does not alter the data; the Catalan government is not involved in this page.`;
}

export { capitalize };
