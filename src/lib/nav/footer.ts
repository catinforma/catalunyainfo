import type { Locale } from "@/lib/i18n/config";
import { SEASONAL } from "@/lib/content/home-tools";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { butanePath } from "@/lib/programmatic/butane/paths";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { hubPath as rodaliesHubPath, linePath as rodaliesLinePath } from "@/lib/programmatic/rodalies/paths";
import { todayPath } from "@/lib/programmatic/today/paths";
import { warningsPath } from "@/lib/programmatic/warnings/paths";

/**
 * Seasonal entries of the footer's first column, in the windows of the
 * homepage's seasonal tools (lib/content/home-tools.ts SEASONAL).
 *
 * Why the footer: the site audit of 17 Nov 2026 measured click depth from the
 * three home pages over every internal link. Since the homepage strip of
 * seasonal tools was removed (12 Nov, owner, phone layout), the Christmas
 * fairs hub sat 3 clicks deep and its 44 town pages per language 4 clicks
 * deep (84 sitemap URLs), in the weeks those pages are searched. A footer
 * link puts the hub at 1 and every town at 2 without adding anything to the
 * header or the homepage.
 */
export interface FooterLink {
  key: "christmasFairs";
  href: string;
  label: string;
}

const LABELS: Record<FooterLink["key"], Record<Locale, string>> = {
  christmasFairs: { ca: "Fires de Nadal", es: "Mercados de Navidad", en: "Christmas markets" },
};

function inWindow(monthDay: string, from: string, to: string): boolean {
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

function todayInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** `today` as YYYY-MM-DD in Catalan time. */
export function seasonalFooterLinks(locale: Locale, today: string = todayInMadrid()): FooterLink[] {
  const monthDay = today.slice(5, 10);
  const christmas = SEASONAL.find((s) => s.key === "christmas");
  const out: FooterLink[] = [];
  if (christmas && inWindow(monthDay, christmas.from, christmas.to)) {
    out.push({ key: "christmasFairs", href: fairsHubPath(locale), label: LABELS.christmasFairs[locale] });
  }
  return out;
}

/**
 * The footer's "live data" column: the pages fed by official data read at
 * render, which people check every day.
 *
 * Why (20 Nov 2026): since the "Útil ara mateix" grid left the homepage
 * (12 Nov, owner, phone layout) no page of the header, footer or homepage
 * linked any of them, in any language. Search Console's URL inspection on
 * 20 Nov: /es/avisos/ and /en/warnings/ (live since 18 Nov, in the sitemap)
 * "unknown to Google"; /es/rodalies/r1/ and /r4/ last crawled 30 Oct,
 * /es/embalses/ 1 Nov, /es/gasolineras/ 6 Nov, all before their HTML carried
 * the live figures (13 Nov). One link from every page puts each hub one click
 * from anywhere and its line, reservoir or zone pages two, without adding
 * anything to the header or the homepage's first screen. Anchors in the words
 * people search, in every language (the English fuel hub exists since the
 * same day, /en/fuel-prices-catalonia/).
 */
export type LiveFooterKey = "rodalies" | "electricity" | "fuel" | "reservoirs" | "warnings" | "butane" | "today";

export interface LiveFooterLink {
  key: LiveFooterKey;
  href: string;
  label: string;
}

export const LIVE_FOOTER_TITLE: Record<Locale, string> = { ca: "Dades en directe", es: "Datos en directo", en: "Live data" };

const LIVE_LABELS: Record<LiveFooterKey, Partial<Record<Locale, string>>> = {
  rodalies: { ca: "Rodalies avui: incidències", es: "Rodalies hoy: incidencias", en: "Rodalies trains today" },
  electricity: { ca: "Preu de la llum avui", es: "Precio de la luz hoy", en: "Electricity price today" },
  fuel: { ca: "Benzineres barates avui", es: "Gasolineras baratas hoy", en: "Petrol and diesel prices today" },
  reservoirs: { ca: "Embassaments de Catalunya avui", es: "Embalses de Cataluña hoy", en: "Catalonia reservoir levels" },
  warnings: { ca: "Avisos ara: AEMET i trànsit", es: "Avisos hoy: AEMET y tráfico", en: "Weather and traffic warnings" },
  butane: { ca: "Preu de la bombona de butà", es: "Precio de la bombona de butano", en: "Butane price in Spain" },
  today: { ca: "Avui a Catalunya", es: "Hoy en Cataluña", en: "Today in Catalonia" },
};

function liveHref(key: LiveFooterKey, locale: Locale): string | null {
  switch (key) {
    case "rodalies":
      return rodaliesHubPath(locale);
    case "electricity":
      return pvpcPath(locale);
    case "fuel":
      return fuelHubPath(locale);
    case "reservoirs":
      return reservoirHubPath(locale);
    case "warnings":
      return warningsPath(locale);
    case "butane":
      return butanePath(locale);
    case "today":
      return todayPath(locale);
  }
}

const LIVE_ORDER: readonly LiveFooterKey[] = ["rodalies", "electricity", "fuel", "reservoirs", "warnings", "butane", "today"];

export function liveFooterLinks(locale: Locale): LiveFooterLink[] {
  return LIVE_ORDER.flatMap((key) => {
    const href = liveHref(key, locale);
    const label = LIVE_LABELS[key][locale];
    return href && label ? [{ key, href, label }] : [];
  });
}

/**
 * "Most searched": four evergreen pages that lost their only sitewide links
 * on 12 Nov 2026 and then fell in the November core update (10-24 Nov).
 *
 * Search Console, fixed query+page cohort, 7-13 Nov against 14-20 Nov
 * (docs/SEO_EXPERIMENTS.md, entry of 24 Nov 2026): /es/festivos/barcelona/
 * 9.2 -> 33.5 ("hoy es festivo", "mañana es festivo"), the "¿Es festivo
 * hoy?" guide 15.2 -> 53.8, /es/rodalies/r4/ 11.2 -> 34.2, the metro hours
 * guide 11.1 -> 22.1. Since the homepage grid went (12 Nov, owner, phone
 * layout) none of them had a link from the homepage, the header or the footer.
 * Four links from every page, in the words people search, in every language,
 * without touching the homepage or the header. The Rodalies hub, the day's
 * page and the work and school calendars are already linked (live-data
 * column, header menu).
 */
export type FrequentFooterKey = "holidayToday" | "barcelonaHolidays" | "metroHours" | "rodaliesR4";

export interface FrequentFooterLink {
  key: FrequentFooterKey;
  href: string;
  label: string;
}

export const FREQUENT_FOOTER_TITLE: Record<Locale, string> = { ca: "El més consultat", es: "Lo más consultado", en: "Most searched" };

const FREQUENT_LABELS: Record<FrequentFooterKey, Record<Locale, string>> = {
  holidayToday: { ca: "És festiu avui o demà a Catalunya?", es: "¿Es festivo hoy o mañana en Cataluña?", en: "Is today or tomorrow a holiday in Catalonia?" },
  barcelonaHolidays: { ca: "Festius a Barcelona: avui, demà i tot l'any", es: "Festivos en Barcelona: hoy, mañana y todo el año", en: "Barcelona public holidays and local days" },
  metroHours: { ca: "Horaris del metro de Barcelona", es: "Horarios del metro de Barcelona", en: "Barcelona metro hours" },
  rodaliesR4: { ca: "Rodalies R4: incidències i horaris", es: "Rodalies R4: incidencias y horarios", en: "Rodalies R4: disruptions and timetable" },
};

const FREQUENT_ORDER: readonly FrequentFooterKey[] = ["holidayToday", "barcelonaHolidays", "metroHours", "rodaliesR4"];

/**
 * Written out, not built with holidays/paths.ts municipalityPath: that module
 * imports the whole holiday snapshot, and the footer is on every page.
 * tests/footer-links.test.ts holds these equal to municipalityPath.
 */
const BARCELONA_HOLIDAYS: Record<Locale, string> = { ca: "/ca/festius/barcelona/", es: "/es/festivos/barcelona/", en: "/en/holidays/barcelona/" };

function frequentHref(key: FrequentFooterKey, locale: Locale): string {
  switch (key) {
    case "holidayToday":
      return GUIDES.holidayToday[locale];
    case "barcelonaHolidays":
      return BARCELONA_HOLIDAYS[locale];
    case "metroHours":
      return GUIDES.metroHours[locale];
    case "rodaliesR4":
      return rodaliesLinePath(locale, "R4");
  }
}

export function frequentFooterLinks(locale: Locale): FrequentFooterLink[] {
  return FREQUENT_ORDER.map((key) => ({ key, href: frequentHref(key, locale), label: FREQUENT_LABELS[key][locale] }));
}
