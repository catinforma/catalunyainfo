import { aranSwap, NEXT, NEXT_YEAR, nextYearPublished, SNAPSHOT, YEAR, yearRows, type HolidayRow } from "@/lib/programmatic/holidays/data";
import { dayMonth } from "@/lib/programmatic/holidays/format";
import { caDe, joinList } from "@/lib/programmatic/holidays/names";
import { fullPagePath, placeName, type EmbedLocale, type EmbedPlace } from "@/lib/programmatic/embed-2027/places";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";
import { YEAR as SPAIN_YEAR } from "@/lib/programmatic/spain-2027/calendar";
import { cityCalendar, commonLocalDays, islandDay, local2027, type City, type CityDayKind } from "@/lib/programmatic/spain-2027/cities";
import { CITIES_AS_OF } from "@/lib/programmatic/spain-2027/cities-data";
import { caOf, localNameIntl, localNoteIntl } from "@/lib/programmatic/spain-2027/city-copy-intl";
import { localName } from "@/lib/programmatic/spain-2027/city-copy";
import { dayName } from "@/lib/programmatic/spain-2027/copy";
import { dayNameIntl } from "@/lib/programmatic/spain-2027/copy-intl";
import { editionNames } from "@/lib/programmatic/spain-2027/editions";
import { BOE_REF, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { SITE, absoluteUrl } from "@/lib/site";

import { serializeCalendar, type IcsCalendar, type IcsEvent } from "./serialize";

/**
 * Subscribable holiday calendars (.ics), one per Catalan town and one per
 * Spanish city of the 2027 pages, in ca, es and en:
 *
 *   /ics/<locale>/<municipi>.ics                        a Catalan town (holidays/data.ts)
 *   /ics/<locale>/2027/<comunidad>/<ciudad>.ics         a Spanish city (spain-2027/cities.ts),
 *                                                       the Spanish community slug in every locale
 *
 * Served by src/app/ics/ (text/calendar, noindex from next.config.ts via
 * ALWAYS_NOINDEX_SOURCES, never in the sitemap) and offered on each town and
 * city page by components/programmatic/ics/CalendarSubscribe.tsx.
 *
 * Only what the pages state as confirmed goes in, read from the same
 * functions the pages use:
 *  - Catalan towns: `yearRows` for 2026 and 2027 without the council's
 *    pending days: the Catalonia-wide days (and Aran's swap) of both years,
 *    the DOGC local days of 2026, and the 2027 local days once the DOGC
 *    order is parsed (`local-2027.json`). Never the days a council has
 *    approved that the DOGC has not yet published.
 *  - Spanish cities: `cityCalendar` (2027): the BOE days, the island day,
 *    the local days only where the city's 2027 list is published, and a day
 *    an official text has fixed for the whole community (Navarra's 3 Dec).
 * Each event says whether it is a regional or a local holiday (summary,
 * category, description).
 */

export type FeedLocale = EmbedLocale;
export const FEED_LOCALES: readonly FeedLocale[] = ["ca", "es", "en"];
export const FEED_ROOT = "/ics";
/** Clients are asked to fetch again daily; the route revalidates daily too. */
export const FEED_REFRESH = "P1D";
const UID_DOMAIN = "catalunyainfo.com";

export function isFeedLocale(locale: string): locale is FeedLocale {
  return (FEED_LOCALES as readonly string[]).includes(locale);
}

/** "barcelona.ics" → "barcelona"; null for anything else. */
export function slugFromFile(file: string): string | null {
  const m = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.ics$/.exec(file);
  return m ? m[1]! : null;
}

export function townFeedPath(locale: FeedLocale, slug: string): string {
  return `${FEED_ROOT}/${locale}/${slug}.ics`;
}

export function cityFeedPath(locale: FeedLocale, c: Pick<City, "slug" | "community">): string {
  return `${FEED_ROOT}/${locale}/${SPAIN_YEAR}/${c.community.slug}/${c.slug}.ics`;
}

export function feedPath(locale: FeedLocale, place: EmbedPlace): string {
  return place.kind === "town" ? townFeedPath(locale, place.m.slug) : cityFeedPath(locale, place.c);
}

/* ---------------------------------------------------------------- Model --- */

export type FeedScope = "regional" | "local";

export interface FeedEvent extends IcsEvent {
  scope: FeedScope;
}

export interface FeedModel {
  locale: FeedLocale;
  calendar: Omit<IcsCalendar, "events"> & { events: FeedEvent[] };
  /** The years with at least one event, ascending. */
  years: number[];
  /** True when local days the place will have are not in the feed yet (not published, or only council-approved). */
  localPending: boolean;
  /** The year whose local days are pending, when `localPending`. */
  pendingYear: number | null;
}

const latest = (...dates: (string | null | undefined)[]) => dates.filter((d): d is string => Boolean(d)).sort().at(-1)!;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** The order's short name: "Ordre EMT/52/2026". */
const shortOrder = (name: string) => name.split(",")[0] ?? name;
const uid = (locale: FeedLocale, place: string, date: string, kind: string) => `${locale}-${place}-${date.replace(/-/g, "")}-${kind}@${UID_DOMAIN}`;

const SOURCE_WORD: Record<FeedLocale, string> = { ca: "Font", es: "Fuente", en: "Source" };
const MORE: Record<FeedLocale, string> = { ca: "Tots els festius", es: "Todos los festivos", en: "All the holidays" };

/* -------------------------------------------------------- Catalan towns --- */

const TOWN_CATEGORY: Record<FeedLocale, Record<HolidayRow["kind"], string>> = {
  ca: { catalonia: "Festiu de Catalunya", aran: "Festiu de l'Aran", local: "Festa local" },
  es: { catalonia: "Festivo de Cataluña", aran: "Festivo de Arán", local: "Fiesta local" },
  en: { catalonia: "Catalonia-wide holiday", aran: "Aran holiday", local: "Local holiday" },
};

const TOWN_REGION: Record<FeedLocale, Record<"catalonia" | "aran", string>> = {
  ca: { catalonia: "Catalunya", aran: "Aran" },
  es: { catalonia: "Cataluña", aran: "Arán" },
  en: { catalonia: "Catalonia", aran: "Aran" },
};

function townSource(year: number, kind: HolidayRow["kind"]): string | null {
  if (kind !== "local") {
    const r = SNAPSHOT.sources.regional[String(year)];
    return r ? `${shortOrder(r.name)} (${r.ref})` : null;
  }
  if (year === YEAR) return `${shortOrder(SNAPSHOT.sources.localOrder.name)} (${SNAPSHOT.sources.localOrder.ref})`;
  return NEXT_YEAR.order ? `${shortOrder(NEXT_YEAR.order.name)} (${NEXT_YEAR.order.ref})` : null;
}

function townWhat(locale: FeedLocale, row: HolidayRow, year: number, name: string): string {
  if (row.kind === "catalonia") return { ca: "Festiu a tot Catalunya.", es: "Festivo en toda Cataluña.", en: "Public holiday across Catalonia." }[locale];
  if (row.kind === "aran") {
    const swap = aranSwap(year);
    const instead = swap ? dayMonth(swap.replaces, locale) : null;
    return {
      ca: `Festiu a l'Aran${instead ? `, en lloc del ${instead}` : ""}.`,
      es: `Festivo en Arán${instead ? `, en lugar del ${instead}` : ""}.`,
      en: `Holiday in Aran${instead ? `, instead of ${instead}` : ""}.`,
    }[locale];
  }
  const where = row.where?.length ? joinList(row.where, locale) : null;
  return {
    ca: `Festa local ${caDe(name)}${where ? ` (només a ${where})` : ""}.`,
    es: `Fiesta local de ${name}${where ? ` (solo en ${where})` : ""}.`,
    en: `Local holiday in ${name}${where ? ` (only in ${where})` : ""}.`,
  }[locale];
}

/** The rows of one year that the feed carries: never a council-approved day still pending the DOGC. */
export function townFeedRows(m: SnapshotMunicipality, year: number, locale: FeedLocale): HolidayRow[] {
  return yearRows(m, year, locale).filter((r) => !r.pending);
}

export function townFeed(locale: FeedLocale, m: SnapshotMunicipality): FeedModel {
  const place: EmbedPlace = { kind: "town", m };
  const name = placeName(locale, place);
  const pageUrl = absoluteUrl(fullPagePath(locale, place));
  const events: FeedEvent[] = [];
  for (const year of [YEAR, NEXT]) {
    for (const row of townFeedRows(m, year, locale)) {
      const region = row.kind === "local" ? (row.where?.length ? `${name} (${row.where.join(", ")})` : name) : TOWN_REGION[locale][row.kind];
      const source = townSource(year, row.kind);
      events.push({
        uid: uid(locale, m.slug, row.date, row.kind),
        date: row.date,
        summary: `${cap(row.name)} · ${region}`,
        description: [townWhat(locale, row, year, name), source ? `${SOURCE_WORD[locale]}: ${source}.` : null, `${MORE[locale]}: ${pageUrl}`]
          .filter(Boolean)
          .join("\n"),
        categories: [TOWN_CATEGORY[locale][row.kind]],
        url: pageUrl,
        scope: row.kind === "local" ? "local" : "regional",
      });
    }
  }
  // Until the DOGC order for next year is parsed; once it is, a town it leaves out has no local days to wait for.
  const localPending = !nextYearPublished();
  const title = { ca: `Festius ${caDe(name)}`, es: `Festivos de ${name}`, en: `${name} public holidays` }[locale];
  const years = [...new Set(events.map((e) => Number(e.date.slice(0, 4))))].sort();
  return {
    locale,
    calendar: {
      prodId: `-//${SITE.name}//Festius//${locale.toUpperCase()}`,
      name: `${title} · ${SITE.name}`,
      description: [
        {
          ca: `Festius ${caDe(name)} (${joinList(years.map(String), locale)}): els de tot Catalunya i els locals publicats al DOGC.`,
          es: `Festivos de ${name} (${joinList(years.map(String), locale)}): los de toda Cataluña y los locales publicados en el DOGC.`,
          en: `${name} public holidays (${joinList(years.map(String), locale)}): the Catalonia-wide days and the local days published in the DOGC.`,
        }[locale],
        localPending ? pendingLocalSentence(locale, NEXT) : null,
        pageUrl,
      ]
        .filter(Boolean)
        .join("\n"),
      url: pageUrl,
      source: absoluteUrl(townFeedPath(locale, m.slug)),
      refresh: FEED_REFRESH,
      stamp: latest(SNAPSHOT.readOn, NEXT_YEAR.readOn),
      events,
    },
    years,
    localPending,
    pendingYear: localPending ? NEXT : null,
  };
}

function pendingLocalSentence(locale: FeedLocale, year: number): string {
  return {
    ca: `Els festius locals del ${year} s'hi afegiran quan es publiquin.`,
    es: `Los festivos locales de ${year} se añadirán cuando se publiquen.`,
    en: `The ${year} local holidays will be added once they are published.`,
  }[locale];
}

/* ------------------------------------------------------- Spanish cities --- */

const CITY_CATEGORY: Record<FeedLocale, Record<CityDayKind, string>> = {
  ca: { national: "Festiu estatal", "national-kept": "Festiu estatal", regional: "Festiu autonòmic", island: "Festiu insular", local: "Festa local" },
  es: { national: "Festivo nacional", "national-kept": "Festivo nacional", regional: "Festivo autonómico", island: "Festivo insular", local: "Fiesta local" },
  en: { national: "National holiday", "national-kept": "National holiday", regional: "Regional holiday", island: "Island holiday", local: "Local holiday" },
};

const SPAIN: Record<FeedLocale, string> = { ca: "Espanya", es: "España", en: "Spain" };

export function cityFeed(locale: FeedLocale, c: City): FeedModel {
  const place: EmbedPlace = { kind: "city", c };
  const name = placeName(locale, place);
  const community = locale === "es" ? c.community.short : editionNames(c.region, locale).short;
  const pageUrl = absoluteUrl(fullPagePath(locale, place));
  const list = local2027(c);
  const island = islandDay(c);
  const events: FeedEvent[] = cityCalendar(c).map((d) => {
    const label =
      d.kind === "local"
        ? locale === "es"
          ? localName({ date: d.date, name: d.name })
          : localNameIntl({ date: d.date, name: d.name }, locale)
        : d.kind === "island"
          ? (d.name ?? "")
          : locale === "es"
            ? dayName({ name: d.name ?? "", replaces: d.replaces ?? null })
            : dayNameIntl({ name: d.name ?? "", replaces: d.replaces ?? null }, locale);
    const region = d.kind === "national" ? SPAIN[locale] : d.kind === "island" ? (island?.place ?? community) : d.kind === "local" ? name : community;
    const note = locale === "es" ? d.note : localNoteIntl(d.note, locale);
    const what =
      d.kind === "local"
        ? { ca: `Festa local ${caOf(name)}.`, es: `Fiesta local de ${name}.`, en: `Local holiday in ${name}.` }[locale]
        : `${CITY_CATEGORY[locale][d.kind]} (${region}).`;
    const source = d.kind === "local" ? (list ? `${list.source.title} (${list.source.ref})` : null) : d.kind === "island" ? null : BOE_REF.id;
    return {
      uid: uid(locale, `${c.community.slug}-${c.slug}`, d.date, d.kind),
      date: d.date,
      summary: `${label} · ${region}`,
      description: [what, note ? cap(note) : null, source ? `${SOURCE_WORD[locale]}: ${source}.` : null, `${MORE[locale]}: ${pageUrl}`].filter(Boolean).join("\n"),
      categories: [CITY_CATEGORY[locale][d.kind]],
      url: pageUrl,
      scope: d.kind === "local" ? "local" : "regional",
    };
  });
  // "pending": the community has not published its 2027 list yet ("missing": it has, without the city).
  const localPending = c.status2027 === "pending";
  const title = { ca: `Festius ${caOf(name)} ${SPAIN_YEAR}`, es: `Festivos de ${name} ${SPAIN_YEAR}`, en: `${name} public holidays ${SPAIN_YEAR}` }[locale];
  const covered = commonLocalDays(c).length > 0;
  return {
    locale,
    calendar: {
      prodId: `-//${SITE.name}//Festivos ${SPAIN_YEAR}//${locale.toUpperCase()}`,
      name: `${title} · ${SITE.name}`,
      description: [
        {
          ca: `Festius ${caOf(name)} (${community}) del ${SPAIN_YEAR}: els estatals i autonòmics del BOE${list || covered ? " i els locals publicats" : ""}.`,
          es: `Festivos de ${name} (${community}) de ${SPAIN_YEAR}: los nacionales y autonómicos del BOE${list || covered ? " y los locales publicados" : ""}.`,
          en: `${name} (${community}) public holidays ${SPAIN_YEAR}: the national and regional days in the BOE${list || covered ? " and the published local days" : ""}.`,
        }[locale],
        localPending ? pendingLocalSentence(locale, SPAIN_YEAR) : null,
        pageUrl,
      ]
        .filter(Boolean)
        .join("\n"),
      url: pageUrl,
      source: absoluteUrl(cityFeedPath(locale, c)),
      refresh: FEED_REFRESH,
      stamp: latest(SOURCES_READ_ON, CITIES_AS_OF),
      events,
    },
    years: [...new Set(events.map((e) => Number(e.date.slice(0, 4))))].sort(),
    localPending,
    pendingYear: localPending ? SPAIN_YEAR : null,
  };
}

export function feedModel(locale: FeedLocale, place: EmbedPlace): FeedModel {
  return place.kind === "town" ? townFeed(locale, place.m) : cityFeed(locale, place.c);
}

export function renderFeed(model: FeedModel): string {
  return serializeCalendar(model.calendar);
}

/* ------------------------------------------------------------ Responses --- */

export const ICS_CONTENT_TYPE = "text/calendar; charset=utf-8";

export function feedResponse(model: FeedModel, filename: string): Response {
  return new Response(renderFeed(model), {
    headers: {
      "content-type": ICS_CONTENT_TYPE,
      // Shown inline by browsers that can (iOS offers "Add all"), saved under its own name otherwise.
      "content-disposition": `inline; filename="${filename}"`,
    },
  });
}

export function feedNotFound(): Response {
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}

/* ---------------------------------------------------- The page's block --- */

export interface SubscribeLink {
  href: string;
  label: string;
  /** For the plain download only: the file's media type. */
  type?: string;
}

export interface SubscribeBlock {
  title: string;
  lead: string;
  links: SubscribeLink[];
  /** "Feed address for any other app:" and the https URL, printed as text to copy. */
  urlLabel: string;
  url: string;
}

/** webcal:// for the same URL: what Apple Calendar and Outlook open as a subscription. */
export function webcalUrl(httpsUrl: string): string {
  return httpsUrl.replace(/^https?:\/\//, "webcal://");
}

/** Google Calendar's "add by URL" link. */
export function googleCalendarUrl(httpsUrl: string): string {
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl(httpsUrl))}`;
}

const BLOCK: Record<FeedLocale, { title: string; apple: string; google: string; download: string; urlLabel: string }> = {
  ca: {
    title: "Afegeix al teu calendari",
    apple: "Apple Calendar (iPhone, Mac) i Outlook",
    google: "Google Calendar",
    download: "Descarrega el fitxer .ics (una còpia que no s'actualitza)",
    urlLabel: "Adreça per subscriure-t'hi des d'una altra aplicació:",
  },
  es: {
    title: "Añádelo a tu calendario",
    apple: "Apple Calendar (iPhone, Mac) y Outlook",
    google: "Google Calendar",
    download: "Descarga el archivo .ics (una copia que no se actualiza)",
    urlLabel: "Dirección para suscribirte desde otra aplicación:",
  },
  en: {
    title: "Add to your calendar",
    apple: "Apple Calendar (iPhone, Mac) and Outlook",
    google: "Google Calendar",
    download: "Download the .ics file (a copy that does not update)",
    urlLabel: "Feed address for any other calendar app:",
  },
};

export function subscribeBlock(locale: FeedLocale, place: EmbedPlace): SubscribeBlock {
  const model = feedModel(locale, place);
  const name = placeName(locale, place);
  const path = feedPath(locale, place);
  const url = absoluteUrl(path);
  const years = joinList(model.years.map(String), locale);
  const t = BLOCK[locale];
  const lead = {
    ca: `Subscriu-te als festius confirmats ${place.kind === "town" ? caDe(name) : caOf(name)} (${years}) per veure'ls al teu calendari.`,
    es: `Suscríbete a los festivos confirmados de ${name} (${years}) para verlos en tu calendario.`,
    en: `Subscribe to ${name}'s confirmed public holidays (${years}) to see them in your calendar.`,
  }[locale];
  return {
    title: t.title,
    lead: model.localPending && model.pendingYear ? `${lead} ${pendingLocalSentence(locale, model.pendingYear)}` : lead,
    links: [
      { href: webcalUrl(url), label: t.apple },
      { href: googleCalendarUrl(url), label: t.google },
      { href: path, label: t.download, type: "text/calendar" },
    ],
    urlLabel: t.urlLabel,
    url,
  };
}
