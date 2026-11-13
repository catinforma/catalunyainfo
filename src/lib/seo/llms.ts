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

import { leaveEditions } from "@/lib/programmatic/leave-2027/copy";
import { netSalaryEditions } from "@/lib/programmatic/net-salary/copy";
import { calcEditions, calculatorsHubEditions } from "@/lib/programmatic/calculators/paths";
import { rentEditions } from "@/lib/programmatic/rent-update/copy";
import { pensionEditions } from "@/lib/programmatic/pensions-2027/copy";
import { smiEditions } from "@/lib/programmatic/smi/copy";
import { ipcEditions } from "@/lib/programmatic/ipc/copy";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { FAIRS as CHRISTMAS_FAIRS, englishTowns as christmasEnglishTowns, towns as christmasTowns } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { hubPath as electionsHub, PAGES_PER_LOCALE } from "@/lib/programmatic/elections/paths";
import { STATIONS, selectPages } from "@/lib/programmatic/fuel/data";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { SNAPSHOT as HOLIDAYS, YEAR } from "@/lib/programmatic/holidays/data";
import { englishTowns } from "@/lib/programmatic/holidays/english";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { DATE_PAGES, DATE_PAGE_RANGE, datePath, hubPath as holidaysHub } from "@/lib/programmatic/holidays/paths";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
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
      description: "one daily page: whether today and tomorrow are holidays and where there is a local holiday, strikes today and tomorrow, Rodalies notices, reservoir levels, the median fuel price and the current hour's electricity price, each linked to its full page.",
    },
    {
      name: "Public holidays by town",
      hubs: { ca: holidaysHub("ca"), es: holidaysHub("es"), en: holidaysHub("en") },
      description: `the ${YEAR} local holidays of the ${HOLIDAYS.municipalities.length} municipalities of Catalonia that have them, one page per town (${englishTowns().length} in English: the largest cities and the main resorts), with the Catalonia-wide days, whether today is a holiday and the Sundays shops may open (DOGC order and Generalitat open data).`,
    },
    {
      name: "Is it a public holiday on…?",
      hubs: { ca: datePath("ca", DATE_PAGE_RANGE.first), es: datePath("es", DATE_PAGE_RANGE.first), en: datePath("en", DATE_PAGE_RANGE.first) },
      description: `one page per date (${DATE_PAGES.length} dates from ${DATE_PAGE_RANGE.first} to ${DATE_PAGE_RANGE.last}): whether the day is a holiday across Catalonia and in the rest of Spain, which towns have a local holiday, shops and schools.`,
    },
    {
      name: "2027 leave planner",
      hubs: leaveEditions(),
      description: "pick a Catalan town, a Spanish city or region and 1 to 25 days of leave: which working days to book in 2027 for the most days off in a row, ranked by days off per day of leave, from the official 2027 holiday lists (DOGC, BOE, city bulletins).",
    },
    {
      name: "Calculators for Spain (hub)",
      hubs: calculatorsHubEditions(),
      description: "every calculator on the site in one page, grouped by work and pay, housing, official figures (minimum wage, CPI), holidays and live data, each with the question it answers and the law or official data it is built on.",
    },
    {
      name: "Spain net salary calculator 2026",
      hubs: netSalaryEditions(),
      description: "gross annual salary to net pay for 2026 anywhere in Spain's common tax regime (plus Ceuta, Melilla and La Palma): IRPF withholding with the Tax Agency's official 2026 algorithm and the worker's Social Security contributions (Orden PJC/297/2026), in 12 or 14 payments, by family situation, children, age, disability and contract type; checked against the Tax Agency's own withholding service.",
    },
    {
      name: "Severance pay calculator (Spain)",
      hubs: calcEditions("dismissal"),
      description: "statutory dismissal pay in Spain from start and end dates and salary: unfair dismissal (33 days a year, 45 before 12 Feb 2012, DT 11ª caps), objective dismissal or ERE (20 days, 12 months' cap) and end of a fixed-term contract (12 days), Estatuto de los Trabajadores.",
    },
    {
      name: "Final settlement (finiquito) calculator",
      hubs: calcEditions("settlement"),
      description: "what an employer owes on the last day in Spain: unpaid days of the last month, accrued extra payments (yearly or half-yearly), unused holiday, and severance pay where due; gross amounts, ET arts. 31, 38 and 49.",
    },
    {
      name: "Unemployment benefit calculator (Spain)",
      hubs: calcEditions("unemployment"),
      description: "contributory unemployment benefit (paro): duration from days contributed (LGSS art. 269 scale), 70% of the base for 180 days then 60%, the 2026 minimum and maximum by children (IPREM 600 €), and the Social Security deduction.",
    },
    {
      name: "Rent increase calculator (Spain)",
      hubs: rentEditions(),
      description: "the annual rent update for any Spanish housing or commercial lease: the INE's IRAV and CPI read daily, the month that applies on the anniversary from the INE's release calendar, and the legal cap by signing date (Ley 12/2023, RDL 29/2026, the 2023 IGC and 2024 3% caps), with the BOE texts.",
    },
    {
      name: "Spain pension increase 2027 calculator",
      hubs: pensionEditions(),
      description: "the January 2027 revaluation of Spanish contributory pensions: the average of the INE's annual CPI rates from December 2025 to November 2026 (LGSS art. 58), read daily and marked provisional until November's figure is out, a monthly and yearly calculator, no catch-up payment, and the 2026 minimum and non-contributory pensions and IPREM from the BOE (RDL 3/2026, RD 241/2026).",
    },
    {
      name: "Spain minimum wage (SMI) 2027",
      hubs: smiEditions(),
      description: "Spain's minimum wage from the BOE: 2026 (RD 126/2026: 1,221 euros a month in 14 payments, 17,094 a year, 40.70 a day, 9.55 an hour for domestic workers), every decree since 2018 with its BOE link, where 2027 stands from official documents only (advisory committee report, the Ministry of Labour's draft, Council of Ministers, BOE checked hourly) and a part-time / 12-or-14-payments calculator linked to the net salary calculator.",
    },
    {
      name: "Spain CPI (IPC) today and INE release calendar",
      hubs: ipcEditions(),
      description: "the INE's latest all-items and core CPI, annual and monthly change, read daily from the INE's API (series IPC290750, IPC290752, IPC292510, IPC292512), the last 24 months, the flash and final release dates from the INE's official calendar, and what the CPI is used for (pensions, rent, minimum wage).",
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
      name: "Electricity price in Spain today and tomorrow (PVPC)",
      hubs: { es: pvpcPath("es"), ca: pvpcPath("ca"), en: pvpcPath("en") },
      description: "the regulated PVPC 2.0TD electricity price for every hour of today and, once Red Eléctrica publishes it before 20:15, tomorrow: cheapest and dearest hours, daily average, peak/standard/off-peak periods and the Ceuta and Melilla prices, read from REE's open REData API every 15 minutes.",
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
