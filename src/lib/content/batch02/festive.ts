import { WEEKDAY_NAMES, holidayOn, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { metroDay } from "@/lib/content/metro/tonight";
import type { Locale } from "@/lib/i18n/config";

/**
 * Every official fact on the "Christmas in Barcelona" and "New Year's Eve in
 * Barcelona" pages, in one place.
 *
 * Checked on 25 October 2026 against the City Council's press room and
 * Christmas website, TMB, the Generalitat's holiday calendars, the DOGC/BOE
 * shop rules and each sight's own opening-hours page
 * (research_notes/festive-2026.md). On that day the City Council had published
 * its 2026 lighting plan (9 July) but no 2026-27 date: not the lights
 * switch-on, the nativity scene, the Plaça de Sant Jaume projection, the New
 * Year's Eve show or the Three Kings parade. barcelona.cat/nadal says the site
 * "es tornarà a actualitzar al voltant del mes de novembre del 2026".
 *
 * HOW TO UPDATE: when one of those dates is published, fill the matching field
 * of ANNOUNCED_2026 (ISO date, optional end date, time and place, and the
 * official URL), set FESTIVE_VERIFIED to the check date, run the tests and
 * republish the "christmas-bcn" and "nye" groups. The leads switch from "not
 * announced yet" to the date on their own. Last year's dates stay labelled
 * with their year and are never shown as this year's.
 */

export const FESTIVE_VERIFIED = "2026-10-25";

/** The pages to watch for the 2026-27 dates. */
export const WATCH = {
  pressTag: "https://ajuntament.barcelona.cat/premsa/tag/nadal-2026/",
  christmasSite: "https://www.barcelona.cat/nadal/ca",
  tmbNews: "https://noticies.tmb.cat/sala-de-premsa",
  tmbHours: "https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus",
} as const;

export interface Announcement {
  /** First day, ISO. */
  date: string;
  /** Last day, ISO, for something that runs over several days. */
  until?: string;
  /** Start time as the source gives it, "18:30". */
  time?: string;
  /** Where, as the source states it, in each language. */
  place?: Record<Locale, string>;
  /** The official page that announced it. */
  url: string;
}

export interface Announcements {
  /** The lights switch-on (encesa de llums). */
  lightsSwitchOn: Announcement | null;
  /** The traditional nativity scene in City Hall. */
  pessebre: Announcement | null;
  /** The light projection on the façades of Plaça de Sant Jaume. */
  santJaume: Announcement | null;
  /** The New Year's Eve show; `date` is 31 December, `time` the start. */
  newYearShow: Announcement | null;
  /** The Three Kings parade; `time` the start of the parade. */
  cavalcada: Announcement | null;
}

/** 2026-27 dates the City Council has published. `null` = not yet, at FESTIVE_VERIFIED. */
export const ANNOUNCED_2026: Announcements = {
  lightsSwitchOn: null,
  pessebre: null,
  santJaume: null,
  newYearShow: null,
  cavalcada: null,
};

/** The window a 2026-27 announcement must fall in. */
export const SEASON = { from: "2026-11-01", to: "2027-01-31" } as const;

const OFFICIAL_HOSTS = /^https:\/\/(?:[a-z0-9-]+\.)*(?:barcelona\.cat|tmb\.cat|gencat\.cat)\//;

/**
 * Why an announcement cannot be printed, or nothing when it can. A filled
 * field with a typo in the date, a press cutting instead of the council's own
 * page, or last year's date pasted by mistake is refused by the tests.
 */
export function announcementProblems(item: Announcement): string[] {
  const problems: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const valid = (value: string) => iso.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  if (!valid(item.date)) problems.push(`date ${item.date} is not an ISO date`);
  else if (item.date < SEASON.from || item.date > SEASON.to) problems.push(`date ${item.date} is outside the 2026-27 season`);
  if (item.until !== undefined) {
    if (!valid(item.until)) problems.push(`until ${item.until} is not an ISO date`);
    else if (item.until < item.date) problems.push(`until ${item.until} is before ${item.date}`);
  }
  if (item.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) problems.push(`time ${item.time} is not HH:MM`);
  if (!OFFICIAL_HOSTS.test(item.url)) problems.push(`${item.url} is not an official City Council, TMB or Generalitat page`);
  if (/[?&]utm_/.test(item.url)) problems.push(`${item.url} carries tracking`);
  return problems;
}

/** The days the pages are about. */
export const DAYS = {
  christmasEve: "2026-12-24",
  christmas: "2026-12-25",
  santEsteve: "2026-12-26",
  newYearsEve: "2026-12-31",
  newYear: "2027-01-01",
  reisEve: "2027-01-05",
  reis: "2027-01-06",
} as const;

/** Previous seasons, always printed with their year. */
export const PAST = {
  lights2024: {
    announced: "2024-10-14",
    switchOn: "2024-11-28",
    url: "https://ajuntament.barcelona.cat/premsa/2024/10/14/barcelona-prepara-un-nadal-amb-mes-llums-figures-illuminades-a-tots-els-districtes-i-rutes-denllumenats/",
  },
  lights2025: {
    announced: "2025-10-16",
    switchOn: "2025-11-22",
    until: "2026-01-06",
    km: 126,
    url: "https://ajuntament.barcelona.cat/premsa/2025/10/16/barcelona-encendra-els-llums-de-nadal-el-dissabte-22-de-novembre-i-busca-idees-ja-per-lenllumenat-de-2026/",
  },
  /** The 2025 Christmas programme: Sant Jaume, the nativity, the festival, New Year's Eve, the parade. */
  programme2025: {
    published: "2025-11-12",
    url: "https://ajuntament.barcelona.cat/premsa/2025/11/12/barcelona-vibra-amb-la-magia-del-nadal-llums-espectacles-i-emocions-compartides/",
  },
  santJaume2025: { from: "2025-11-22", to: "2026-01-05" },
  pessebre2025: {
    from: "2025-12-13",
    to: "2026-01-05",
    url: "https://www.barcelona.cat/culturapopular/ca/noticia/infobarcelonacabarcelona-presenta-el-pessebre-tradicional-de-sant-jaume-inspirat-en-els-paisatges-de-muntanya-catalans_1583530",
  },
  pessebre2024: {
    url: "https://www.barcelona.cat/culturapopular/ca/noticia/infobarcelonacael-pessebre-tradicional-de-barcelona-2024-es-trasllada-a-lajuntament_1455895",
  },
  pedralbes2025Until: "2026-02-02",
  festival2025: { from: "2025-12-20", to: "2025-12-30", shows: 357 },
  concert2025: "2025-12-29",
  newYear2025: {
    url: "https://www.barcelona.cat/nadal/ca/campanades-de-cap-dany",
  },
  newYearOps2025: {
    published: "2025-12-29",
    url: "https://ajuntament.barcelona.cat/premsa/2025/12/29/dispositiu-per-a-la-nit-de-cap-dany-6/",
  },
  newYearOps2024: {
    published: "2024-12-29",
    url: "https://ajuntament.barcelona.cat/premsa/2024/12/29/dispositiu-de-cap-dany-3/",
  },
  tmbChristmas2025: {
    published: "2025-12-23",
    url: "https://ajuntament.barcelona.cat/premsa/2025/12/23/horaris-especials-del-metro-i-els-autobusos-de-tmb-la-vigilia-de-nadal-2/",
  },
  cavalcada2026: {
    route: "2026-01-02",
    url: "https://ajuntament.barcelona.cat/premsa/2026/01/02/els-reis-dorient-tornen-a-barcelona-amb-una-cavalcada-plena-de-novetats/",
  },
} as const;

/** The 2026 lighting plan the City Council presented on 9 July 2026: no dates in it. */
export const LIGHTS_PLAN_2026 = {
  presented: "2026-07-09",
  km: 130,
  url: "https://ajuntament.barcelona.cat/premsa/2026/07/09/barcelona-consolida-el-festival-de-llums-de-nadal/",
} as const;

/* -------------------------------------------------------------------------- */
/* Date wording                                                               */
/* -------------------------------------------------------------------------- */

/** "dissabte 22 de novembre de 2025" / "sábado 22 de noviembre de 2025" / "Saturday 22 November 2025". */
export function dayDate(iso: string, locale: Locale, withYear = true): string {
  const weekday = WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
  const year = withYear ? (locale === "en" ? ` ${iso.slice(0, 4)}` : ` de ${iso.slice(0, 4)}`) : "";
  return `${weekday} ${shortDate(iso, locale)}${year}`;
}

/** "22 de novembre de 2025" / "22 November 2025". */
export function dateYear(iso: string, locale: Locale): string {
  return `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
}

/**
 * "del 13 de desembre al 5 de gener" / "del 13 de diciembre al 5 de enero" /
 * "13 December to 5 January". Catalan elides before 1 and 11 ("de l'1",
 * "a l'11"), which are said with a vowel.
 */
export function span(from: string, to: string, locale: Locale): string {
  const b = shortDate(to, locale);
  // Same month: "del 20 al 30 de desembre", "20 to 30 December".
  const a = from.slice(0, 7) === to.slice(0, 7) ? String(Number(from.slice(8, 10))) : shortDate(from, locale);
  if (locale === "en") return `${a} to ${b}`;
  if (locale === "es") return `del ${a} al ${b}`;
  const vowel = (iso: string) => ["01", "11"].includes(iso.slice(8, 10));
  return `${vowel(from) ? "de l'" : "del "}${a} ${vowel(to) ? "a l'" : "al "}${b}`;
}

/* -------------------------------------------------------------------------- */
/* Metro over the holidays                                                    */
/* -------------------------------------------------------------------------- */

/** The days the metro table lists, in order. */
export const METRO_DAYS = [
  DAYS.christmasEve,
  DAYS.christmas,
  DAYS.santEsteve,
  DAYS.newYearsEve,
  DAYS.newYear,
  DAYS.reisEve,
  DAYS.reis,
] as const;

const METRO_COPY: Record<Locale, { opens: string; continues: string; close: Record<"midnight" | "two" | "allNight" | "eleven", string>; holiday: string; workday: string }> = {
  ca: {
    opens: "obre a les 5:00",
    continues: "funciona sense parar des de la nit anterior",
    close: { midnight: "tanca a mitjanit", two: "tanca a les 2:00", allNight: "no tanca en tota la nit", eleven: "tanca a les 23:00" },
    holiday: "Festiu",
    workday: "Feiner",
  },
  es: {
    opens: "abre a las 5:00",
    continues: "funciona sin parar desde la noche anterior",
    close: { midnight: "cierra a medianoche", two: "cierra a las 2:00", allNight: "no cierra en toda la noche", eleven: "cierra a las 23:00" },
    holiday: "Festivo",
    workday: "Laborable",
  },
  en: {
    opens: "opens at 5:00",
    continues: "runs on from the night before",
    close: { midnight: "closes at midnight", two: "closes at 2:00", allNight: "runs all night", eleven: "closes at 23:00" },
    holiday: "Public holiday",
    workday: "Working day",
  },
};

/**
 * One row per holiday day: the date, whether it is a public holiday and the
 * metro hours TMB's standing rules give for it (the same rules the metro-hours
 * guide and its live block use). TMB confirms its Christmas hours in a December
 * notice; the table says so in its note.
 */
export function metroRows(locale: Locale, days: readonly string[] = METRO_DAYS): string[][] {
  const t = METRO_COPY[locale];
  return days.map((iso) => {
    const day = metroDay(iso);
    const holiday = holidayOn(iso);
    const hours = `${day.opensAtFive ? t.opens : t.continues}; ${t.close[day.close]}`;
    const label = holiday ? `${t.holiday} (${holiday.name[locale]})` : t.workday;
    const date = dayDate(iso, locale);
    return [date.charAt(0).toUpperCase() + date.slice(1), label, hours.charAt(0).toUpperCase() + hours.slice(1)];
  });
}

/* -------------------------------------------------------------------------- */
/* Sights on the holidays                                                     */
/* -------------------------------------------------------------------------- */

/** What each sight's own hours page says about the holidays (checked FESTIVE_VERIFIED). */
export const SIGHT_SOURCES = {
  sagradaFamilia: "https://sagradafamilia.org/en/schedules-how-to-get",
  pedrera: "https://www.lapedrera.com/en/practical-information/",
  batllo: "https://www.casabatllo.es/en/visit/opening-hours/",
  mnac: "https://www.museunacional.cat/ca/horaris-i-preus",
  picasso: "https://museupicassobcn.cat/en/plan-your-visit/buy-tickets-and-opening-hours",
} as const;

export function sightRows(locale: Locale): string[][] {
  const rows: Record<Locale, string[][]> = {
    ca: [
      ["Sagrada Família", "El 25 i el 26 de desembre i l'1 i el 6 de gener, de 9:00 a 14:00"],
      ["La Pedrera", "Tancada el 25 de desembre de 2026; del 26 de desembre al 3 de gener, de 9:00 a 20:30 (l'1 de gener, d'11:00 a 20:30); tancada de l'11 al 17 de gener de 2027"],
      ["Casa Batlló", "Diu que obre cada dia de l'any"],
      ["MNAC (Museu Nacional d'Art de Catalunya)", "Tancat el 25 de desembre i l'1 de gener; a l'hivern, diumenges i festius de 10:00 a 15:00"],
      ["Museu Picasso", "Tancat el 25 de desembre, l'1 de gener i els dilluns; el 24 i el 31 de desembre, de 10:00 a 14:00"],
    ],
    es: [
      ["Sagrada Familia", "El 25 y el 26 de diciembre y el 1 y el 6 de enero, de 9:00 a 14:00"],
      ["La Pedrera", "Cerrada el 25 de diciembre de 2026; del 26 de diciembre al 3 de enero, de 9:00 a 20:30 (el 1 de enero, de 11:00 a 20:30); cerrada del 11 al 17 de enero de 2027"],
      ["Casa Batlló", "Dice que abre todos los días del año"],
      ["MNAC (Museu Nacional d'Art de Catalunya)", "Cerrado el 25 de diciembre y el 1 de enero; en invierno, domingos y festivos de 10:00 a 15:00"],
      ["Museu Picasso", "Cerrado el 25 de diciembre, el 1 de enero y los lunes; el 24 y el 31 de diciembre, de 10:00 a 14:00"],
    ],
    en: [
      ["Sagrada Família", "25 and 26 December, 1 and 6 January: 9:00 to 14:00"],
      ["La Pedrera", "Closed on 25 December 2026; 26 December to 3 January, 9:00 to 20:30 (1 January from 11:00); closed 11 to 17 January 2027"],
      ["Casa Batlló", "Says it opens every day of the year"],
      ["MNAC (National Art Museum of Catalonia)", "Closed on 25 December and 1 January; in winter, Sundays and holidays 10:00 to 15:00"],
      ["Museu Picasso", "Closed on 25 December, 1 January and Mondays; 24 and 31 December, 10:00 to 14:00"],
    ],
  };
  return rows[locale];
}
