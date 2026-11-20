import type { Locale } from "@/lib/i18n/config";
import { SEASONAL } from "@/lib/content/home-tools";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { butanePath } from "@/lib/programmatic/butane/paths";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { hubPath as rodaliesHubPath } from "@/lib/programmatic/rodalies/paths";
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
