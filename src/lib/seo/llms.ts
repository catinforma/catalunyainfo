/**
 * The text of /llms.txt, built from data the site already holds.
 *
 * Pure: no clock, no network, no database. The route passes in the published
 * guides; everything else (which live tools exist, their URLs, how many towns
 * or stations they cover) comes from the same modules that render and list
 * those pages, so the file cannot name a page that does not exist. Guides are
 * sorted by URL, so the same content always produces the same bytes.
 *
 * Format: the llms.txt proposal (llmstxt.org) - a title, a one-paragraph
 * summary in a blockquote, then sections of `- [name](url): notes`.
 */

import { LOCALES, type Locale } from "@/lib/i18n/config";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { FAIRS as CHRISTMAS_FAIRS, englishTowns as christmasEnglishTowns, towns as christmasTowns } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { hubPath as electionsHub, PAGES_PER_LOCALE } from "@/lib/programmatic/elections/paths";
import { STATIONS, selectPages } from "@/lib/programmatic/fuel/data";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { SNAPSHOT as HOLIDAYS, YEAR } from "@/lib/programmatic/holidays/data";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { DATE_PAGES, datePath, hubPath as holidaysHub } from "@/lib/programmatic/holidays/paths";
import { RESERVOIR_DATA } from "@/lib/programmatic/reservoirs/data";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { lineIds } from "@/lib/programmatic/rodalies/pages";
import { todayPath } from "@/lib/programmatic/today/paths";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";
import { shippedZones } from "@/lib/programmatic/weekend/data";
import { weekendHubPath } from "@/lib/programmatic/weekend/paths";

export interface LlmsEntry {
  title: string;
  href: string;
  excerpt: string | null;
}

const LANGUAGE_NAME: Record<Locale, string> = { ca: "Català", es: "Español", en: "English" };

const GUIDE_HEADINGS: Record<Locale, string> = {
  ca: "Guies en català",
  es: "Guías en castellano",
  en: "Guides in English",
};

export const LLMS_SUMMARY =
  "> Practical, verified information about Catalonia in Catalan, Spanish and English: transport, public holidays, taxes, weekend agenda, nature conditions and day trips. Every figure is checked against an official source, linked on each page.";

export interface LiveTool {
  name: string;
  /** Site-relative hub path per language edition that exists. */
  hubs: Partial<Record<Locale, string>>;
  description: string;
}

/** The live tools and data hubs, in a fixed order. */
export function liveTools(): LiveTool[] {
  const fuelPages = selectPages().length;
  return [
    {
      name: "Today in Catalonia",
      hubs: { ca: todayPath("ca"), es: todayPath("es"), en: todayPath("en") },
      description: "one daily page: whether today and tomorrow are holidays and where there is a local holiday, strikes today and tomorrow, Rodalies notices, reservoir levels and the median fuel price, each linked to its full page.",
    },
    {
      name: "Public holidays by town",
      hubs: { ca: holidaysHub("ca"), es: holidaysHub("es") },
      description: `the ${YEAR} local holidays of the ${HOLIDAYS.municipalities.length} most populous municipalities of Catalonia, one page per town, with the Catalonia-wide days, whether today is a holiday and the Sundays shops may open (DOGC order and Generalitat open data).`,
    },
    {
      name: "Is it a public holiday on…?",
      hubs: { ca: datePath("ca", DATE_PAGES[0]), es: datePath("es", DATE_PAGES[0]), en: datePath("en", DATE_PAGES[0]) },
      description: `one page per date (${DATE_PAGES.length} dates from ${DATE_PAGES[0]} to ${DATE_PAGES[DATE_PAGES.length - 1]}): whether the day is a holiday across Catalonia, which towns have a local holiday, shops and schools.`,
    },
    {
      name: "Strikes in Catalonia today",
      hubs: { ...GUIDES.strikes },
      description: "upcoming and current strikes affecting transport, schools and health in Catalonia, with the official minimum services for each.",
    },
    {
      name: "Rodalies live service notices",
      hubs: { ca: rodaliesHub("ca"), es: rodaliesHub("es"), en: rodaliesHub("en") },
      description: `live notices and incidents for every Rodalies de Catalunya line (${lineIds().length} line pages in Catalan and Spanish), read from Rodalies de Catalunya and Renfe's open data, with each line's stations and official timetable.`,
    },
    {
      name: "Cheapest petrol stations",
      hubs: { ca: fuelHubPath("ca"), es: fuelHubPath("es") },
      description: `today's petrol and diesel prices at Catalonia's ${STATIONS.stations.length} public stations, cheapest first, by province, comarca, town and chain (${fuelPages} pages per language), from the Ministry for the Ecological Transition (CC BY 4.0).`,
    },
    {
      name: "Reservoir levels",
      hubs: { ca: reservoirHubPath("ca"), es: reservoirHubPath("es"), en: reservoirHubPath("en") },
      description: `the daily level of each of the ${RESERVOIR_DATA.length} reservoirs of Catalonia's internal basins (Sau, Susqueda, la Baells…), in % and hm³, from the Catalan Water Agency's open data.`,
    },
    {
      name: "Election results by town",
      hubs: { ca: electionsHub("ca"), es: electionsHub("es"), en: electionsHub("en") },
      description: `2023 local, 2023 general and 2024 Catalan Parliament results for all ${PAGES_PER_LOCALE.ca} municipalities in Catalonia (${PAGES_PER_LOCALE.en} in English), with a table per comarca, from the Generalitat's open data.`,
    },
    {
      name: "What to do this weekend",
      hubs: { ca: weekendHubPath("ca"), es: weekendHubPath("es") },
      description: `this weekend's fairs and cultural agenda across Catalonia and in ${shippedZones().length} zones (cities, provinces and coasts), from the Generalitat's official agenda and fairs calendar.`,
    },
    {
      name: "Christmas markets by town",
      hubs: { ca: fairsHubPath("ca"), es: fairsHubPath("es"), en: fairsHubPath("en") },
      description: `the ${CHRISTMAS_FAIRS.length} Christmas fairs and markets of the ${SEASON_YEAR} season with official dates, one page per town (${christmasTowns().length} towns in Catalan and Spanish, ${christmasEnglishTowns().length} in English), from the Generalitat's fairs calendar and the organisers' own announcements.`,
    },
    {
      name: "This weekend in Catalonia (guide)",
      hubs: { ca: `/ca/${TOOL_PATHS.weekend.ca}/`, es: `/es/${TOOL_PATHS.weekend.es}/`, en: `/en/${TOOL_PATHS.weekend.en}/` },
      description: "the weekend's plans in one page per language, with the official agenda.",
    },
  ];
}

/**
 * `- [Name](main edition): description. Also in: [Español](…), …`. The main
 * edition follows the site's x-default rule: English when it exists, else
 * Catalan.
 */
function toolLine(tool: LiveTool, origin: string): string {
  const main: Locale = tool.hubs.en ? "en" : "ca";
  const others = LOCALES.filter((l) => l !== main && tool.hubs[l]).map((l) => `[${LANGUAGE_NAME[l]}](${origin}${tool.hubs[l]})`);
  const description = tool.description.charAt(0).toUpperCase() + tool.description.slice(1);
  return `- [${tool.name}](${origin}${tool.hubs[main]}): ${description}${others.length ? ` Also in: ${others.join(", ")}.` : ""}`;
}

export function buildLlmsTxt(origin: string, siteName: string, guides: Partial<Record<Locale, readonly LlmsEntry[]>>): string {
  const parts: string[] = [`# ${siteName}`, "", LLMS_SUMMARY, "", "## Live tools and data", ""];
  for (const tool of liveTools()) parts.push(toolLine(tool, origin));
  parts.push("");

  for (const locale of LOCALES) {
    const entries = [...(guides[locale] ?? [])].sort((a, b) => (a.href < b.href ? -1 : a.href > b.href ? 1 : 0));
    if (entries.length === 0) continue;
    parts.push(`## ${GUIDE_HEADINGS[locale]}`, "");
    for (const entry of entries) {
      const summary = (entry.excerpt ?? "").replace(/\s+/g, " ").trim();
      parts.push(`- [${entry.title}](${origin}${entry.href})${summary ? `: ${summary}` : ""}`);
    }
    parts.push("");
  }
  return parts.join("\n");
}
