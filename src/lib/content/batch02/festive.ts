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
 * republish the "christmas-bcn", "nye" and "barcelona-december" groups (the
 * December hub moves the date into its day-by-day table). The leads switch from "not
 * announced yet" to the date on their own. Last year's dates stay labelled
 * with their year and are never shown as this year's.
 *
 * For the lights switch-on also fill `who`, `until` (the last night the lights
 * are on) and `hours` when the announcement gives them, move
 * LIGHTS_SWITCH_ON_CHECKED, and republish "llums-nadal" too: the lights page
 * (christmas-lights.ts) switches its title, description, lead, key facts and
 * FAQ to the date by itself.
 */

export const FESTIVE_VERIFIED = "2026-10-25";

/**
 * The day the City Council's press room (ajuntament.barcelona.cat/premsa,
 * latest items and the "nadal-2026" tag), barcelona.cat/nadal and
 * firadesantallucia.cat were last read for 2026-27 dates. Printed next to
 * every "not announced yet". Re-read on 30 Oct 2026: no switch-on, nativity
 * scene, Sant Jaume projection, New Year's Eve or parade date; the Christmas
 * site still says it will be updated "al voltant del mes de novembre del
 * 2026"; the Santa Llúcia fair's site still shows its 2025 calendar. The other
 * facts (TMB, sights, shops) keep FESTIVE_VERIFIED.
 *
 * Read again in the afternoon of 30 Oct 2026 (seasonal top-3 push): press
 * room home (latest items 29-30 Oct, none about Christmas), the "nadal-2026"
 * tag (latest 9 Jul 2026) and barcelona.cat/nadal: still nothing. In 2023,
 * 2024 and 2025 the date was out by 23, 14 and 16 October.
 *
 * Read again on 3 Nov 2026 (CTR sweep): press room search for "llums nadal"
 * and the "nadal-2026" tag (latest Christmas items 8-9 Jul 2026; the 3 Nov
 * items are about other things), barcelona.cat/nadal (still "es tornarà a
 * actualitzar al voltant del mes de novembre del 2026") and
 * firadesantallucia.cat (still the 2025 fair, "© ... 2025"): no 2026-27
 * date for any of them. The printed date stays 30 Oct: a November 2026 date
 * in these pages would read as a switch-on date, and festive-pages.test.ts
 * refuses any (the 30 Oct check is still true).
 *
 * Read again on the morning of 4 Nov 2026 (new lights page): press room home
 * (latest items 3-4 Nov, none about Christmas), press-room searches for
 * "llums nadal" and "encesa" (newest 2026 results: 8 and 9 Jul 2026, the
 * lighting plan), the "nadal-2026" tag, and barcelona.cat/nadal/ca (still
 * "Nadal 2025", "Aquest web es tornarà a actualitzar al voltant del mes de
 * novembre del 2026"): no switch-on date. The lights page prints that check
 * as LIGHTS_SWITCH_ON_CHECKED; this date stays for the reason above.
 */
export const ANNOUNCEMENTS_CHECKED = "2026-10-30";

/**
 * The day the City Council's press room and barcelona.cat/nadal were last read
 * for the lights switch-on alone. Printed by the lights page
 * (christmas-lights.ts), whose town table carries November 2026 dates anyway,
 * next to its "not announced yet". The Christmas hub and the New Year's Eve
 * page keep ANNOUNCEMENTS_CHECKED. Move it on every re-read.
 */
export const LIGHTS_SWITCH_ON_CHECKED = "2026-11-12";

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
  /**
   * Lights switch-on only: the moment the lights come on, when the
   * announcement gives it apart from the start of the ceremony (2026: the act
   * starts at 18:00 and the lights come on at 18:30).
   */
  lightsOn?: string;
  /** Where, as the source states it, in each language. */
  place?: Record<Locale, string>;
  /**
   * The place with its preposition, for the middle of a sentence ("al passeig
   * de Gràcia, ...", "en el paseo de Gràcia, ...", "on Passeig de Gràcia, ..."),
   * when "a"/"en"/"at" + `place` would read wrong (Catalan "a el" → "al").
   */
  placeAt?: Record<Locale, string>;
  /**
   * Lights switch-on only: the kilometres of lit streets the announcement
   * gives, approximately ("prop de 140 km"): always printed with "about".
   */
  km?: number;
  /** Who switches the lights on (or presides), as the source names them, in each language. */
  who?: Record<Locale, string>;
  /**
   * Lights switch-on only: the nightly lighting hours, as the announcement
   * gives them, in each language ("de 17:30 a 1:00 de diumenge a dijous...").
   * `until` is then the last night the lights are on.
   */
  hours?: Record<Locale, string>;
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
  /**
   * The Three Kings parade; `time` the start of the parade. Fill it together
   * with ANNOUNCED_2027.barcelona in reis.ts (same date, time and URL): a test
   * holds the two together.
   */
  cavalcada: Announcement | null;
}

/** 2026-27 dates the City Council has published. `null` = not yet, at FESTIVE_VERIFIED. */
export const ANNOUNCED_2026: Announcements = {
  /**
   * City Council press note of 9 Nov 2026 (read 12 Nov 2026), "Barcelona Llums
   * de Nadal arrenca amb l'encesa de l'enllumenat nadalenc el 26 de novembre":
   * "Barcelona encendrà els llums de Nadal amb un acte festiu el proper 26 de
   * novembre al passeig de Gràcia"; "l'escenari ocuparà la franja de passeig de
   * Gràcia entre els carrers Rosselló i Diagonal"; "L'acte començarà a les 18
   * hores i acabarà amb l'encesa dels llums, a les 18.30 hores"; "estarà encès
   * a Barcelona des del 26 de novembre fins al 6 de gener [...] de diumenge a
   * dijous, ambdós inclosos, des de les 17:30 hores fins a les 01:00 hores; els
   * divendres i dissabtes de les 17:30 hores fins a les 02:00 hores, i els dies
   * extraordinaris com el 24, 25 i 31 de desembre i 5 de gener, també de 17:30
   * a 02:00 hores"; "La il·luminació nadalenca arriba a prop de 140 km de
   * carrer". It does not say who switches them on: `who` stays empty.
   */
  lightsSwitchOn: {
    date: "2026-11-26",
    until: "2027-01-06",
    time: "18:00",
    lightsOn: "18:30",
    place: {
      ca: "passeig de Gràcia, entre el carrer de Rosselló i la Diagonal",
      es: "paseo de Gràcia, entre la calle Rosselló y la Diagonal",
      en: "Passeig de Gràcia, between Carrer de Rosselló and Diagonal",
    },
    placeAt: {
      ca: "al passeig de Gràcia, entre el carrer de Rosselló i la Diagonal",
      es: "en el paseo de Gràcia, entre la calle Rosselló y la Diagonal",
      en: "on Passeig de Gràcia, between Carrer de Rosselló and Diagonal",
    },
    hours: {
      ca: "de les 17:30 a la 1:00 de diumenge a dijous, i de les 17:30 a les 2:00 els divendres, els dissabtes i els dies 24, 25 i 31 de desembre i 5 de gener",
      es: "de 17:30 a 1:00 de domingo a jueves, y de 17:30 a 2:00 los viernes, los sábados y los días 24, 25 y 31 de diciembre y 5 de enero",
      en: "17:30 to 1:00 from Sunday to Thursday, and 17:30 to 2:00 on Fridays, Saturdays and on 24, 25 and 31 December and 5 January",
    },
    km: 140,
    url: "https://ajuntament.barcelona.cat/premsa/2026/11/09/barcelona-llums-de-nadal-arrenca-amb-lencesa-de-lenllumenat-nadalenc-el-26-de-novembre/",
  },
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
  if (item.lightsOn !== undefined) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.lightsOn)) problems.push(`lightsOn ${item.lightsOn} is not HH:MM`);
    else if (item.time !== undefined && item.lightsOn < item.time) problems.push(`lightsOn ${item.lightsOn} is before the start, ${item.time}`);
  }
  if (item.km !== undefined && !(Number.isInteger(item.km) && item.km > 0 && item.km < 1000)) problems.push(`km ${item.km} is not a plausible length`);
  if (!OFFICIAL_HOSTS.test(item.url)) problems.push(`${item.url} is not an official City Council, TMB or Generalitat page`);
  if (/[?&]utm_/.test(item.url)) problems.push(`${item.url} carries tracking`);
  return problems;
}

/** "al passeig de Gràcia, ..." / "en el paseo de Gràcia, ..." / "on Passeig de Gràcia, ...", or "" with no place. */
export function placePhrase(item: Announcement, locale: Locale): string {
  if (item.placeAt) return item.placeAt[locale];
  if (!item.place) return "";
  return { ca: `a ${item.place.ca}`, es: `en ${item.place.es}`, en: `at ${item.place.en}` }[locale];
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
  lights2023: {
    announced: "2023-10-23",
    switchOn: "2023-11-23",
    url: "https://ajuntament.barcelona.cat/premsa/2023/10/23/la-comissio-de-govern-aprova-els-horaris-de-lenllumenat-de-nadal/",
  },
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
    /**
     * Nightly lighting hours from the switch-on to `until`, as the note of
     * 16 Oct 2025 gives them (re-read 4 Nov 2026): "de 17.30 hores fins a la 1
     * de la matinada de diumenge a dijous; els divendres i dissabtes de les
     * 17.30 hores fins a les 2.00 hores, i els dies extraordinaris de 17.30
     * hores a 2.00 hores, que són els dies 24, 25 i 31 de desembre i 5 de
     * gener". The same hours as 2024, the note says.
     */
    hours: {
      on: "17:30",
      offSundayToThursday: "1:00",
      offFridaySaturday: "2:00",
      lateDays: ["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-05"],
    },
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

/**
 * The day the last three switch-ons were read on the City Council's own notes
 * (research_notes/seasonal-top3-30oct.md): the call to the press of the week
 * itself for the time and place, and the note published that evening for who
 * switched the lights on.
 */
export const SWITCH_ON_HISTORY_CHECKED = "2026-10-30";

export interface PastSwitchOn {
  /** ISO day of the switch-on. */
  date: string;
  /** Start time in the City Council's note of that week. */
  time: string;
  /** The time the first announcement gave, when the note of the week changed it. */
  firstAnnounced?: string;
  /** The stretch of Passeig de Gràcia, when the note names it. */
  stretch: boolean;
  /** Who switched the lights on or presided, as the City Council's notes say. */
  who: Record<Locale, string>;
  /** The note of the week (time and place) and the note of the evening (who). */
  callUrl: string;
  reportUrl: string;
}

/**
 * The last three switch-ons, newest first. All on Passeig de Gràcia at 18:00.
 * In 2023 and 2025 the October announcement said 18:30 and the note of the
 * week 18:00; the page prints 18:00 and says so. The 2024 pair are described,
 * not named: one of them was 16.
 */
export const SWITCH_ON_HISTORY: readonly PastSwitchOn[] = [
  {
    date: PAST.lights2025.switchOn,
    time: "18:00",
    firstAnnounced: "18:30",
    stretch: true,
    who: {
      ca: "L'alcalde, Jaume Collboni, i l'alcalde de Betlem, Maher Canawatique, van prémer el polsador",
      es: "El alcalde, Jaume Collboni, y el alcalde de Belén, Maher Canawatique, pulsaron el botón",
      en: "The mayor, Jaume Collboni, and the mayor of Bethlehem, Maher Canawatique, pressed the button",
    },
    callUrl: "https://ajuntament.barcelona.cat/premsa/2025/11/19/acreditacio-per-a-cobrir-lencesa-de-llums-de-barcelona-del-nadal-2025/",
    reportUrl: "https://ajuntament.barcelona.cat/premsa/2025/11/22/barcelona-encen-el-nadal-amb-la-illuminacio-simultania-de-tots-els-barris-despres-de-lespectacle-inaugural-del-passeig-de-gracia/",
  },
  {
    date: PAST.lights2024.switchOn,
    time: "18:00",
    stretch: true,
    who: {
      ca: "Dos joves de 18 i 16 anys de la campanya «Veus contra el racisme», amb un dispositiu mòbil i amb l'alcalde present",
      es: "Dos jóvenes de 18 y 16 años de la campaña «Veus contra el racisme», con un dispositivo móvil y con el alcalde presente",
      en: "Two young people aged 18 and 16 from the 'Veus contra el racisme' (Voices against racism) campaign, from a mobile device, with the mayor present",
    },
    callUrl: "https://ajuntament.barcelona.cat/premsa/2024/11/27/jaume-collboni-presideix-lacte-dencesa-dels-llums-de-nadal/",
    reportUrl: "https://ajuntament.barcelona.cat/premsa/2024/11/28/barcelona-encen-els-llums-de-nadal-2024/",
  },
  {
    date: PAST.lights2023.switchOn,
    time: "18:00",
    firstAnnounced: "18:30",
    stretch: false,
    who: {
      ca: "L'alcalde, Jaume Collboni, va presidir l'acte",
      es: "El alcalde, Jaume Collboni, presidió el acto",
      en: "The mayor, Jaume Collboni, presided",
    },
    callUrl: "https://ajuntament.barcelona.cat/premsa/2023/11/21/lalcalde-jaume-collboni-presideix-lacte-dencesa-de-llums-de-nadal-2023/",
    reportUrl: "https://ajuntament.barcelona.cat/premsa/2023/11/23/barcelona-encen-els-llums-de-nadal-2023/",
  },
];

/** The 2025 traffic notice: Passeig de Gràcia closed from 17:30 between Gran Via and Aragó. */
export const MOBILITY_2025 = {
  published: "2025-11-21",
  url: "https://www.barcelona.cat/mobilitat/ca/actualitat-i-recursos/noticies/afectacions-de-la-mobilitat-per-lencesa-de-llums-de-nadal-2025-1574224",
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

/**
 * "del 28 de novembre al 23 de desembre de 2026", or with both years when the
 * range crosses New Year: "del 13 de desembre de 2025 a l'1 de febrer de 2026".
 * English has no leading "from", so the sentence supplies it. (Lives here, not
 * in christmas-traditions.ts, so the markets guide can use it without an
 * import cycle; christmas-traditions.ts re-exports it.)
 */
export function range(from: string, to: string, locale: Locale): string {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  if (sameYear) return locale === "en" ? `${span(from, to, "en")} ${from.slice(0, 4)}` : `${span(from, to, locale)} de ${from.slice(0, 4)}`;
  if (locale === "en") return `${dateYear(from, "en")} to ${dateYear(to, "en")}`;
  if (locale === "es") return `del ${dateYear(from, "es")} al ${dateYear(to, "es")}`;
  const vowel = (iso: string) => ["01", "11"].includes(iso.slice(8, 10));
  return `${vowel(from) ? "de l'" : "del "}${dateYear(from, "ca")} ${vowel(to) ? "a l'" : "al "}${dateYear(to, "ca")}`;
}

/** "a, b i c" / "a, b y c" / "a, b and c". */
function joinList(items: readonly string[], locale: Locale): string {
  const and = { ca: " i ", es: " y ", en: " and " }[locale];
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

/**
 * "24, 25 i 31 de desembre i 5 de gener" / "24, 25 y 31 de diciembre y 5 de
 * enero" / "24, 25 and 31 December and 5 January": the month said once,
 * after its last day.
 */
export function dayList(days: readonly string[], locale: Locale): string {
  const months: string[][] = [];
  for (const day of days) {
    const last = months[months.length - 1];
    if (last && last[0]!.slice(0, 7) === day.slice(0, 7)) last.push(day);
    else months.push([day]);
  }
  return joinList(
    months.map((group) => {
      const month = shortDate(group[group.length - 1]!, locale).replace(/^\d+ /, "");
      return `${joinList(group.map((day) => String(Number(day.slice(8, 10)))), locale)} ${month}`;
    }),
    locale,
  );
}

/**
 * The 2025 nightly lighting hours (PAST.lights2025.hours) in words: "de les
 * 17:30 a la 1:00 de diumenge a dijous, i de les 17:30 a les 2:00 els
 * divendres, els dissabtes i els dies 24, 25 i 31 de desembre i 5 de gener".
 */
export function lightingHours2025(locale: Locale): string {
  const h = PAST.lights2025.hours;
  const late = dayList(h.lateDays, locale);
  return {
    ca: `de les ${h.on} a la ${h.offSundayToThursday} de diumenge a dijous, i de les ${h.on} a les ${h.offFridaySaturday} els divendres, els dissabtes i els dies ${late}`,
    es: `de ${h.on} a ${h.offSundayToThursday} de domingo a jueves, y de ${h.on} a ${h.offFridaySaturday} los viernes, los sábados y los días ${late}`,
    en: `${h.on} to ${h.offSundayToThursday} from Sunday to Thursday, and ${h.on} to ${h.offFridaySaturday} on Fridays, Saturdays and on ${late}`,
  }[locale];
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
