/**
 * The text of /llms.txt, built from data the site already holds.
 *
 * No network, no database. The route passes in the published guides;
 * everything else (which live tools exist, their URLs, how many towns or
 * stations they cover) comes from the same modules that render and list those
 * pages, so the file cannot name a page that does not exist. Guides are sorted
 * by URL, so the same content on the same day always produces the same bytes.
 * The day (`today`, the clock when omitted) only decides which pages are out
 * of the index (lib/seo/low-demand.ts), so llms.txt never names a noindex URL.
 *
 * Format: the llms.txt proposal (llmstxt.org) - a title, a one-paragraph
 * summary in a blockquote, then sections of `- [name](url): notes`.
 */

import { leaveEditions } from "@/lib/programmatic/leave-2027/copy";
import { netSalaryEditions } from "@/lib/programmatic/net-salary/copy";
import { extraPayEditions } from "@/lib/programmatic/extra-pay/copy";
import { selfEmployedEditions } from "@/lib/programmatic/self-employed/copy";
import { sickLeaveEditions } from "@/lib/programmatic/sick-leave/copy";
import { paidLeaveEditions } from "@/lib/programmatic/paid-leave/copy";
import { subsidyEditions } from "@/lib/programmatic/unemployment-subsidy/copy";
import { calcEditions, calculatorsHubEditions } from "@/lib/programmatic/calculators/paths";
import { num, rentEditions } from "@/lib/programmatic/rent-update/copy";
import { IPREM_14, IPREM_ANNUAL, IPREM_DAILY, IPREM_MONTHLY, IPREM_YEAR } from "@/lib/programmatic/iprem/rules";
import { pensionEditions } from "@/lib/programmatic/pensions-2027/copy";
import { retirementEditions } from "@/lib/programmatic/retirement-age/copy";
import { widowEditions } from "@/lib/programmatic/widow-pension/copy";
import { ncEditions } from "@/lib/programmatic/non-contributory-pension/copy";
import { AMOUNTS_YEAR as NC_AMOUNTS_YEAR, FREE_INCOME as NC_FREE_INCOME, MINIMUM_ANNUAL as NC_MINIMUM, PNC_ANNUAL as NC_ANNUAL, RENT_SUPPLEMENT as NC_RENT, THIRD_PERSON_ANNUAL as NC_THIRD, WORK_LIMIT as NC_WORK_LIMIT, householdLimit as ncHouseholdLimit, monthly as ncMonthly } from "@/lib/programmatic/non-contributory-pension/rules";
import { AMOUNTS_YEAR as WIDOW_AMOUNTS_YEAR, INCOME_LIMIT as WIDOW_INCOME_LIMIT, WIDOW_MINIMUMS } from "@/lib/programmatic/widow-pension/rules";
import { workingDaysEditions } from "@/lib/programmatic/working-days/copy";
import { smiEditions } from "@/lib/programmatic/smi/copy";
import { ipremEditions } from "@/lib/programmatic/iprem/copy";
import { ipcEditions } from "@/lib/programmatic/ipc/copy";
import { euros as wageMoney, wageEditions } from "@/lib/programmatic/average-salary/copy";
import { SALARY_SNAPSHOT } from "@/lib/programmatic/average-salary/data";
import { headline as wageHeadline } from "@/lib/programmatic/average-salary/page";
import { letrasEditions } from "@/lib/programmatic/treasury-bills/copy";
import { euriborEditions } from "@/lib/programmatic/euribor/copy";
import { mortgageEditions } from "@/lib/programmatic/mortgage/copy";
import { itvEditions } from "@/lib/programmatic/itv/copy";
import { htEditions } from "@/lib/programmatic/home-purchase-tax/copy";
import { pcEditions } from "@/lib/programmatic/purchase-costs/copy";
import { pvEditions } from "@/lib/programmatic/plusvalia/copy";
import { isdEditions } from "@/lib/programmatic/inheritance-tax/copy";
import { regionEditions as isdRegionEditions } from "@/lib/programmatic/inheritance-tax/regional-copy";
import { giftEditions } from "@/lib/programmatic/gift-tax/copy";
import { extremes as cmpExtremes } from "@/lib/programmatic/inheritance-compare/copy";
import { cmpEditions } from "@/lib/programmatic/inheritance-compare/paths";
import { lotteryTaxEditions, money as lotteryMoney } from "@/lib/programmatic/lottery-tax/copy";
import { headline as lotteryHeadline } from "@/lib/programmatic/lottery-tax/page";
import { bonoSocialEditions } from "@/lib/programmatic/bono-social/copy";
import { trafficFinesEditions } from "@/lib/programmatic/traffic-fines/copy";
import { ztEditions } from "@/lib/programmatic/zona-tensionada/copy";
import { gordoHubTranslations } from "@/lib/programmatic/gordo/paths";
import { checkEditions } from "@/lib/programmatic/lottery-check/paths";
import { CATEGORIES as CHECK_CATEGORIES, PROGRAMME_YEAR as CHECK_YEAR } from "@/lib/programmatic/lottery-check/programme";
import { grossaCheckEditions } from "@/lib/programmatic/grossa-check/paths";
import { GROSSA_YEAR, eurosPerSeries as grossaEurosPerSeries } from "@/lib/programmatic/grossa-check/programme";
import { ninoCheckEditions } from "@/lib/programmatic/nino-check/paths";
import { NINO_YEAR } from "@/lib/programmatic/nino-check/programme";
import { PROGRAMME_2027 as NINO_PROGRAMME } from "@/lib/programmatic/nino-check/programme-data";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { siteAuthorPath } from "@/lib/content/author";
import { b2href } from "@/lib/content/batch02/shared";
import { OWNER } from "@/lib/content/pages/institutional";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SITE, WHATSAPP_CHANNEL } from "@/lib/site";
import { isLowDemandPath } from "@/lib/seo/low-demand";
import { latestBodyDate, latestDate } from "@/lib/seo/body-dates";
import { CITIES as SPAIN_CITIES } from "@/lib/programmatic/spain-2027/cities";
import { COMMUNITIES as SPAIN_COMMUNITIES } from "@/lib/programmatic/spain-2027/communities";
import { editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { FAIRS as CHRISTMAS_FAIRS, englishTowns as christmasEnglishTowns, towns as christmasTowns } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { hubPath as electionsHub, PAGES_PER_LOCALE } from "@/lib/programmatic/elections/paths";
import { electionDescription, electionTitle, electionTranslations, municipalitiesFor } from "@/lib/programmatic/elections/pages";
import { STATIONS, selectPages } from "@/lib/programmatic/fuel/data";
import { fuelHubPath, spainHubTranslations } from "@/lib/programmatic/fuel/paths";
import { spainProvinces } from "@/lib/programmatic/fuel/spain";
import { SNAPSHOT as HOLIDAYS, YEAR } from "@/lib/programmatic/holidays/data";
import { englishTowns } from "@/lib/programmatic/holidays/english";
import { reportEditions } from "@/lib/programmatic/holidays/report-copy";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { DATE_PAGES, DATE_PAGE_RANGE, datePath, hubPath as holidaysHub } from "@/lib/programmatic/holidays/paths";
import { pvpcPath, pvpcTranslations } from "@/lib/programmatic/pvpc/paths";
import { PUBLISH_DEADLINE as PVPC_PUBLISH_DEADLINE } from "@/lib/programmatic/pvpc/view";
import { butaneTranslations } from "@/lib/programmatic/butane/paths";
import { warningsTranslations } from "@/lib/programmatic/warnings/paths";
import { RESERVOIR_DATA } from "@/lib/programmatic/reservoirs/data";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { lineIds } from "@/lib/programmatic/rodalies/pages";
import { todayPath } from "@/lib/programmatic/today/paths";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";
import { shippedZones } from "@/lib/programmatic/weekend/data";
import { englishHubPath, englishZonePath, weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import { fairShortName } from "@/lib/programmatic/christmas-fairs/copy";
import { townBySlug as christmasTownBySlug } from "@/lib/programmatic/christmas-fairs/data";
import { townPath as christmasTownPath } from "@/lib/programmatic/christmas-fairs/paths";
import { pollsTranslations } from "@/lib/programmatic/polls/paths";
import { ZBE_CITIES } from "@/lib/programmatic/zbe/cities";
import { zbeHubTranslations } from "@/lib/programmatic/zbe/paths";
import { CITIES as ZONA_AZUL_CITIES } from "@/lib/programmatic/zona-azul/data";
import { marketsHubTranslations } from "@/lib/programmatic/weekly-markets/paths";
import { zaHubTranslations } from "@/lib/programmatic/zona-azul/paths";

export interface LlmsEntry {
  title: string;
  href: string;
  excerpt: string | null;
  /** The guide's last publish that changed what a reader sees (entries.updated_at). */
  updatedAt?: Date | string | null;
}

/**
 * 27 Nov 2026 (live audit): the file had no date. "Updated: YYYY-MM-DD" is the
 * newest of the body dates (body-dates.json, stamped by the deploy that changed
 * a page family) and the guides' last publish, as a Madrid calendar day. Never
 * a date typed by hand, never the request's clock.
 */
export function llmsUpdatedLine(guides: Partial<Record<Locale, readonly LlmsEntry[]>>, bodyDate: Date | null = latestBodyDate()): string | null {
  const newest = latestDate(bodyDate, ...Object.values(guides).flatMap((list) => (list ?? []).map((e) => e.updatedAt)));
  if (!newest) return null;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(newest);
  return `Updated: ${day}`;
}

const LANGUAGE_NAME: Record<Locale, string> = { ca: "Català", es: "Español", en: "English" };

const GUIDE_HEADINGS: Record<Locale, string> = {
  ca: "Guies en català",
  es: "Guías en castellano",
  en: "Guides in English",
};

export const LLMS_SUMMARY =
  "> Practical, verified information in Catalan, Spanish and English about Catalonia and, where it affects people living in or travelling to Spain, the whole country: strikes and their minimum services, public holidays and work and school calendars, elections, Spain-wide calculators (net salary, severance, unemployment, sick pay, self-employed contributions, pensions, minimum wage, rent, mortgage, home-purchase taxes) and live official data (electricity price, butane, fuel, reservoirs, Rodalies, CPI, Euribor). Every variable figure is taken from the official source (BOE, DOGC, the Tax Agency, Social Security, INE, the operators), linked on the page with the date it was read.";

/**
 * The pages that say who makes the site, how a figure is checked and how to
 * report an error, listed after the tools so an assistant that quotes a page
 * can also say where its method is written down. One line each, stating only
 * what the page itself says.
 */
export interface TrustPage {
  name: string;
  hubs: Partial<Record<Locale, string>>;
  description: string;
}

export function trustPages(): TrustPage[] {
  const per = (f: (l: Locale) => string) => Object.fromEntries(LOCALES.map((l) => [l, f(l)])) as Record<Locale, string>;
  return [
    {
      name: "About CatalunyaInfo",
      hubs: per((l) => sectionPath("about", l)),
      description: `who makes the site (founder ${OWNER.name}), what it covers, how it is funded and how AI tools are used.`,
    },
    {
      name: "Author page",
      hubs: per((l) => siteAuthorPath(l)),
      description: `${OWNER.name}, who signs the guides, with his public profiles and his recently updated pieces.`,
    },
    {
      name: "Editorial policy",
      hubs: per((l) => legalPath("editorial-policy", l)),
      description: "what gets published and what does not, how facts are verified and dated, how the calculators and live data are built, the use of AI, and why the site takes no paid content.",
    },
    {
      name: "Sources",
      hubs: per((l) => legalPath("sources", l)),
      description: "the order of preference (official source, primary document, press only to find the original), what is never accepted as a source, and how sources are cited at the foot of each page.",
    },
    {
      name: "Corrections",
      hubs: per((l) => legalPath("corrections", l)),
      description: "how to report an error, what happens to the report, and how a substantial correction is noted on the page with its date.",
    },
    {
      name: "Contact",
      hubs: per((l) => sectionPath("contact", l)),
      description: `contact form and email (${SITE.contactEmail}) for corrections, suggestions, press and data protection.`,
    },
  ];
}

export interface LiveTool {
  name: string;
  /** Site-relative hub path per language edition that exists. */
  hubs: Partial<Record<Locale, string>>;
  description: string;
}

/**
 * The first date page still in the index on `today` (Madrid ISO date; the
 * clock when omitted): a date page leaves it DATE_PAGE_GRACE_DAYS after its
 * day (low-demand.ts), so the range's first date is noindex by mid-November.
 */
export function firstIndexableDatePage(today?: string): string {
  return DATE_PAGES.find((iso) => LOCALES.every((l) => !isLowDemandPath(datePath(l, iso), today))) ?? DATE_PAGE_RANGE.last;
}

/** English names of the weekend zones listed below (the zone pages have Catalan and Spanish names only). */
const WEEKEND_ZONES_LISTED: readonly { slug: string; english: string }[] = [
  { slug: "provincia-de-barcelona", english: "the province of Barcelona" },
  { slug: "barcelona", english: "Barcelona city" },
  { slug: "girona", english: "Girona and its comarques" },
  { slug: "costa-brava", english: "the Costa Brava" },
  // 25 Nov 2026 (GA4 "AI Assistant", 28 days, 3 or more sessions): Spanish editions.
  { slug: "lleida", english: "Lleida and its comarques" },
  { slug: "baix-emporda", english: "the Baix Empordà" },
  { slug: "valles-occidental", english: "the Vallès Occidental" },
];

/**
 * Town election pages (slug in the Catalan edition) that drew 3 or more
 * "AI Assistant" sessions in the 28 days to 25 Nov 2026: Badalona 3, El
 * Masnou 3, Martorell 3, Mollet del Vallès 4. Each line reuses the page's own
 * title and description, so it cannot drift from the page (the pages' wording
 * changes after the 29 Nov vote). The other 940 towns stay behind the hub.
 */
const ELECTION_TOWNS_LISTED: readonly string[] = ["mollet-del-valles", "badalona", "el-masnou", "martorell"];

/**
 * Pages assistants send readers to (GA4 "AI Assistant" channel, 28 days to 25
 * Nov 2026: docs/SEO_EXPERIMENTS.md, 25 Nov) that the file did not name, and
 * the family hubs it lacked: the Barcelona Christmas markets page in English,
 * the four weekend zone pages with most AI visits, the official polls page,
 * the low-emission zones and the blue-zone parking hubs. Each exists only
 * while its family ships it. Only indexable pages (tests/llms-and-metadata.test.ts
 * checks none is on the low-demand list): the 11N Sevilla and Madrid strike
 * pages that also drew visits are noindex since the strike ended, so they are
 * not listed.
 */
function topLandingTools(): LiveTool[] {
  const out: LiveTool[] = [];
  const barcelona = christmasTownBySlug("barcelona");
  if (barcelona) {
    const names = barcelona.fairs.map((f) => fairShortName(f, "en"));
    out.push({
      name: "Christmas markets in Barcelona",
      hubs: { ca: christmasTownPath("ca", barcelona.slug), es: christmasTownPath("es", barcelona.slug), en: christmasTownPath("en", barcelona.slug) },
      description: `the ${barcelona.fairs.length} Christmas markets of Barcelona this season (${names.join(", ")}) with their dates, hours and place in a table, how to get there and a short FAQ, read on the organisers' own pages and the Generalitat's fairs calendar with the reading date.`,
    });
  }
  const zones = shippedZones();
  for (const listed of WEEKEND_ZONES_LISTED) {
    const zone = zones.find((z) => z.slug.ca === listed.slug);
    if (!zone) continue;
    const english = englishZonePath(zone);
    out.push({
      name: `What to do this weekend in ${listed.english}`,
      hubs: { ca: zonePath("ca", zone), es: zonePath("es", zone), ...(english ? { en: english } : {}) },
      description: `this weekend's cultural agenda, fairs and markets in ${listed.english}, by day, from the Generalitat's official agenda and fairs calendar, with the weekend's train and weather notes.`,
    });
  }
  out.push({
    name: "Official polls for Spain's 29 November general election in Catalonia (CIS and CEO)",
    hubs: pollsTranslations(),
    description: "the vote and Congress seat estimates for Catalonia from the two public pollsters, the CIS and the CEO, with each poll's technical sheet and no private or media polls; during the legal ban on publishing polls around polling day (LOREG art. 69.7) the page shows no figures.",
  });
  const towns = municipalitiesFor("ca");
  for (const slug of ELECTION_TOWNS_LISTED) {
    const town = towns.find((m) => m.slug === slug);
    if (!town) continue;
    const hubs = electionTranslations(town);
    const main: Locale = hubs.en ? "en" : "ca";
    out.push({ name: electionTitle(main, town), hubs, description: electionDescription(main, town) });
  }
  out.push({
    name: "Electricity price in Spain tomorrow (PVPC), hour by hour",
    hubs: pvpcTranslations("tomorrow"),
    description: `the regulated PVPC 2.0TD price for each hour of tomorrow, with the cheapest and dearest hours and the daily average, as soon as Red Eléctrica publishes it (every day before ${PVPC_PUBLISH_DEADLINE}); until then the page says it is not yet published, read from REE's open REData API every 15 minutes.`,
  });
  out.push({
    name: "Low-emission zones (ZBE) in Spain by city",
    hubs: zbeHubTranslations(),
    description: `the low-emission zones of ${ZBE_CITIES.map((c) => c.name.en).join(", ")}: which DGT environmental labels are restricted, on which days and hours, and whether fines apply, with the official source of each.`,
  });
  out.push({
    name: "Blue-zone street parking in Spain by city (zona azul)",
    hubs: zaHubTranslations(),
    description: `the hours and prices of regulated street parking in ${ZONA_AZUL_CITIES.map((c) => c.name.en).join(", ")}: weekdays, Saturdays, Sundays and holidays, price per hour and maximum stay, read in each council's own rules.`,
  });
  out.push({
    name: "Weekly street markets in Vic and Mataró",
    hubs: marketsHubTranslations(),
    description: "when and where the next weekly market is in Vic (Tuesday, Saturday, Sunday) and Mataró (six Saturday markets, Plaça Gran Monday to Saturday, Thursday at Plaça de Cuba), with hours per square, the holiday changes the councils publish and the Generalitat census as cross-check.",
  });
  return out;
}

/** The live tools and data hubs, in a fixed order. `today` only picks the first date page still indexed. */
export function liveTools(today?: string): LiveTool[] {
  const fuelPages = selectPages().length;
  const firstDate = firstIndexableDatePage(today);
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
      name: "Catalonia local holidays: the data",
      hubs: reportEditions(),
      description: `which local holiday dates repeat most in Catalonia and where, computed from the ${YEAR} DOGC order of local holidays (${HOLIDAYS.municipalities.length} municipalities) and, for ${YEAR + 1}, the councils' own approvals until the order is out: top dates by towns and by population, weekday, month, comarca, with a CSV under CC BY 4.0 citing the official sources.`,
    },
    {
      name: "Spain 2027 public holidays and work calendar",
      hubs: { es: spainHubPath(), ca: editionHubPath("ca"), en: editionHubPath("en") },
      description: `the 2027 holidays of all Spain from the BOE list (BOE-A-2026-21254): the national days, one page for each of the ${SPAIN_COMMUNITIES.length} autonomous communities and cities, one for each of ${SPAIN_CITIES.length} cities with its local days where the council or regional bulletin has published them, and every long weekend.`,
    },
    {
      name: "Is it a public holiday on…?",
      hubs: { ca: datePath("ca", firstDate), es: datePath("es", firstDate), en: datePath("en", firstDate) },
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
      description: "gross annual salary to net pay for 2026 anywhere in Spain's common tax regime (plus Ceuta, Melilla and La Palma): IRPF withholding with the Tax Agency's official 2026 algorithm and the worker's Social Security contributions (Orden PJC/297/2026), in 12 or 14 payments, by family situation, children, age, disability and contract type; checked against the Tax Agency's own withholding service. A second mode puts the special regime for workers posted to Spain (\"Beckham law\", IRPF Law art. 93: 24% of gross pay up to 600,000 euros, 47% above, same Social Security) side by side with the standard result, with who qualifies, the modelo 149 deadline (six months from the Social Security registration, IRPF Regulation art. 116), the 183-day residence rule and the NIE and Social Security number steps.",
    },
    {
      name: "Spain Christmas extra pay calculator 2026 (paga extra de Navidad)",
      hubs: extraPayEditions(),
      description: "the Christmas extra payment of an employee in Spain: the gross amount (set by the collective agreement, ET art. 31; one month's pay unless entered), the part earned by someone who started during the accrual period (yearly 1 Jan-31 Dec or half-yearly 1 Jul-31 Dec, calendar days), the IRPF withheld at the same rate as every payslip (IRPF Regulation arts. 82.5 and 83.2; payslip rate or the Tax Agency's 2026 algorithm via the net salary engine) and the net; why no Social Security is deducted in the extra pay's month (LGSS art. 147.1 and Orden PJC/297/2026 art. 1: the monthly base already includes one twelfth of the extras); prorated payments (12 payslips) versus 14; pensioners' extra accrued in November (LGSS art. 46).",
    },
    {
      name: "Spain self-employed contributions (cuota de autónomos) 2026 calculator",
      hubs: selfEmployedEditions(),
      description: "the 2026 self-employed (RETA) contribution from expected income and expenses: net earnings as Social Security counts them (LGSS art. 308.1.c, 7% generic expenses, 3% for corporate self-employed), the band of the reduced or general table with its minimum and maximum base (Orden PJC/297/2026 art. 18, the 2025 tables kept by Royal Decree-law 3/2026, maximum base 5,101.20 euros), the monthly contribution at 31.50% (common 28.30, professional 1.30, cessation 0.90, training 0.10, MEI 0.90), the 80-euro flat rate (88.64 with MEI per the TGSS) and its extension below the minimum wage, what the yearly regularisation would pay or refund, and the 2027 status (no official tables yet; MEI 1% by law).",
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
      description: `contributory unemployment benefit (paro): duration from days contributed (LGSS art. 269 scale), 70% of the base for 180 days then 60%, the 2026 minimum and maximum by children (IPREM ${IPREM_MONTHLY} €), and the Social Security deduction.`,
    },
    {
      name: "Sick pay calculator (Spain, incapacidad temporal / baja laboral)",
      hubs: sickLeaveEditions(),
      description: "Social Security sick pay for employees day by day: ordinary illness or non-work accident nothing on days 1-3, 60% of the daily base reguladora on days 4-20 (employer bears days 4-15, INSS or mutua from day 16), 75% from day 21; work accident or occupational disease 75% from the day after; the special cases (menstruation, termination of pregnancy, pregnancy from week 39, donation at 100%, and from 1 Dec 2026 menopause and gender-violence injuries); the Royal Decree-law 31/2026 changes from 1 Dec 2026 (base of the month before last, special cases paid from the day after); 365 + 180 days, 545 maximum; optional collective-agreement top-up; gross, IRPF withheld (LGSS arts. 169-176, RD 53/1980, Decreto 3158/1966).",
    },
    {
      name: "Paid leave in Spain (permisos laborales, Estatuto de los Trabajadores)",
      hubs: paidLeaveEditions(),
      description: "the legal minimum paid leave for employees with who pays each and a calculator of the last day: marriage or registered partnership 15 calendar days (ET art. 37.3.a); a relative's serious accident or illness, hospitalisation or surgery with home rest 5 days (37.3.b); bereavement leave since 26 Nov 2026 (RDL 42/2026): 10 working days for a spouse, partner, parent or child, 3 working days (5 when travelling) for other relatives up to the second degree, startable within 4 weeks (37.3.b bis); moving house 1 day (37.3.c); public duty for the time needed; up to 4 days when work cannot be reached (37.3.g); force majeure hours equal to 4 days a year (37.9); nursing hour to 9 months (37.4); at least 30 calendar days of holiday (38.1); all paid by the employer. Marriage and holidays say calendar days and bereavement says working days; for the others the ET says just 'días', so both the consecutive and the Monday-to-Friday count (national and regional holidays) are shown. Birth and childcare leave 20 weeks per parent, 34 for a single parent, for births from 26 Nov 2026 (6 mandatory after the birth + 11 until 12 months + 3 until age 8; RDL 42/2026, the new week requestable from 1 Mar 2027; 19 and 32 weeks for earlier births), paid by Social Security at 100% of the base reguladora (LGSS art. 179), exempt from IRPF except in Navarre; parental leave 8 weeks until age 8 (art. 48 bis), unpaid by law. Collective agreements can improve all of them.",
    },
    {
      name: "Unemployment subsidy checker (Spain, subsidio por desempleo) + Minimum Living Income 2026",
      hubs: subsidyEditions(),
      description: `who qualifies for the non-contributory unemployment subsidy after the 2024 reform (RDL 2/2024, from 1 Nov 2024): benefit exhausted (6 months; 24 or 30 with family responsibilities; under 45 without family needs a 360-day benefit), insufficient contributions 90-359 days (3-6 months, 21 with family), aged 52+ (80% IPREM until retirement, retirement contributions paid), returning emigrants (18 months), victims of gender or sexual violence (30 months); income test: own gross income of the previous month, or family-unit income per head, no more than 75% of the SMI without extra payments = 915.75 EUR in 2026; amounts 95/90/80% of the ${IPREM_MONTHLY} EUR IPREM = 570/540/480 EUR; the employment support top-up (CAE) when working; IMV 2026 guaranteed income 733.60 EUR a month for one adult and the household scale (LGSS arts. 274-282, DA 57-58; Ley 19/2021 art. 13; RDL 3/2026 art. 2.5).`,
    },
    {
      name: "Rent increase calculator (Spain)",
      hubs: rentEditions(),
      description: "the annual rent update for any Spanish housing or commercial lease: the INE's IRAV and CPI read daily, the month that applies on the anniversary from the INE's release calendar, and the legal cap by signing date and update date (Ley 12/2023, RDL 29/2026, the 2023 IGC and 2024 3% caps), including the 2% cap of RDL 29/2026's sixth final provision for housing updates due from 8 October 2026 to 31 December 2027 without a new agreement (none if the rent is above the reference index), with the BOE texts.",
    },
    {
      name: "Euribor today: the official monthly figure (Banco de España, BOE)",
      hubs: euriborEditions(),
      description: "the official monthly 12-month Euribor as the Banco de España publishes it in the BOE (Orden EHA/2899/2011 art. 27; table 19.1, be1901.csv, read daily, every value since January 2024 checked against its BOE resolution), the change on the month and the year, the last 24 months with the other official mortgage reference rates (IRPH entidades, euro-area housing loan rate, 5-year IRS, one-year €STR-based rate, 2-6 year public debt yield, Míbor), the BOE days each is published on, and a variable-mortgage revision calculator. Monthly official figures only: no daily Euribor (EMMI licence). Not financial advice.",
    },
    {
      name: "Spain mortgage calculator (fixed, variable, mixed) and revision",
      hubs: mortgageEditions(),
      description: "monthly instalment with French amortisation to the cent, total interest and a year-by-year amortisation table for fixed, variable (Euribor + spread, optional initial months, never below 0% under Ley 5/2019 art. 21.4) and mixed loans, with the latest official Euribor prefilled; the revision calculator (new vs old instalment on the outstanding capital); and the Ley 5/2019 basics quoted from the BOE (FIPRE, FEIN as binding offer, FiAE, 10 calendar days, free notary act, no floor clause, early-repayment fee caps, default interest). No lender named. Not financial advice.",
    },
    {
      name: "Spain pension increase 2027 calculator",
      hubs: pensionEditions(),
      description: "the January 2027 revaluation of Spanish contributory pensions: the average of the INE's annual CPI rates from December 2025 to November 2026 (LGSS art. 58), read daily and marked provisional until November's figure is out, a monthly and yearly calculator, no catch-up payment, and the 2026 minimum and non-contributory pensions and IPREM from the BOE (RDL 3/2026, RD 241/2026).",
    },
    {
      name: "Spain retirement age calculator (edad de jubilación): when can I retire?",
      hubs: retirementEditions(),
      description: "the day you reach Spain's ordinary retirement age from your date of birth and years contributed, quoted from the BOE (General Social Security Act, consolidated text of 11/11/2026): 67, or 65 with 38 years and 6 months of contributions from 2027 (art. 205.1.a), and the seventh transitional provision's phase-in table 2013-2027 cell by cell (2026: 66 years 10 months, or 65 with 38 years 3 months), applied by the year in which the age is reached and counted date to date as the Seguridad Social does; at least 15 years for a contributory pension, 2 of them in the last 15 (art. 205.1.b); involuntary early retirement up to 4 years before with 33 years, 6 months as a job seeker and a listed cause, not for the self-employed (arts. 207, 318.d); voluntary up to 2 years before with 35 years and a pension above the minimum (art. 208); both monthly reduction tables of Law 21/2021 (per month or fraction since 2022, not per quarter: up to 30% at 48 months involuntary, 21% at 24 months voluntary, lower with longer careers), the reference age as if contributions continued, the 0.50% per quarter cap on the maximum pension (art. 210.4); delay bonus 4% per full year plus 2% for more than 6 months from the second full year (art. 210.2, Royal Decree-law 11/2024), lump-sum and mixed options explained, active retirement 45-100% (art. 214) and partial retirement (art. 215). No pension amount estimate and no personal data: links the Seguridad Social's own simulator and legal retirement age report.",
    },
    {
      name: "Spain widow's pension calculator (pensión de viudedad): requirements and amount",
      hubs: widowEditions(),
      description: `who is entitled to Spain's widow's pension and how much, quoted from the BOE (General Social Security Act, consolidated text of 11/11/2026): the deceased needs 500 days of contributions in the last 5 years if registered (alta), 15 years if not, none after an accident or occupational illness, and nothing more if a retirement or permanent disability pensioner (arts. 217, 219.1); spouses need a year of marriage, common children or more than 2 years with prior cohabitation only when the fatal common illness came first (art. 219.2); unmarried partners need 5 years living together on the padrón and a registration 2 years before, or since 21 October 2026, with common children, only 2 years on the padrón (art. 221.2 as amended by Royal Decree-law 31/2026, ratified by Congress on 18 November 2026); separated or divorced people need a compensatory pension, which caps the widow's pension, except women victims of gender violence (art. 220, transitional rule 13 for pre-2008 divorces); a 2-year temporary benefit (art. 222); 52% of the base reguladora (Decreto 3158/1966 art. 31.1), 60% from 65 with no other public pension, no work income and other income within ${WIDOW_INCOME_LIMIT} euros (Royal Decree 900/2018), 70% with family dependants, main income and an income ceiling, cut by art. 31.3; the ${WIDOW_AMOUNTS_YEAR} minimums of Royal Decree 241/2026 (${(WIDOW_MINIMUMS.widowUnder60 / 14).toFixed(2)} to ${(WIDOW_MINIMUMS.widowCharges / 14).toFixed(2)} euros a month in 14 payments) with the partial top-up rule, the non-contributory cap and residence; compatibility with work and own pension, loss on remarriage with the over-61 exception (Order of 13 February 1967 art. 11), the base reguladora as the Seguridad Social computes it, and the official application (Portal de Prestaciones, form, CAISS). No personal data.`,
    },
    {
      name: "Spain non-contributory pension calculator (pensión no contributiva, PNC): who qualifies and how much",
      hubs: ncEditions(),
      description: `who qualifies for Spain's non-contributory retirement and invalidity pensions and how much, quoted from the BOE (General Social Security Act, consolidated text of 11/11/2026, arts. 363 to 372): retirement from 65 with 10 years of legal residence between 16 and the application, 2 of them right before (art. 369.1); invalidity from 18 to 64 with a 65% disability or chronic illness and 5 years of residence, 2 right before (art. 363.1); own income under the annual pension, ${NC_ANNUAL} euros in ${NC_AMOUNTS_YEAR} (Royal Decree-law 3/2026 art. 2.5, Royal Decree 241/2026 art. 21.1), ${ncMonthly(NC_ANNUAL).toFixed(2)} euros a month in 14 payments; the household unit (spouse and blood relatives to the second degree) under the limit of the pension plus 70% per extra member, ${ncHouseholdLimit(2, false)} euros for two, times 2.5 with a parent or child (art. 363.2-4); the amount: the pension shared with 70% per extra beneficiary (art. 364.1), minus own income above 35% (${NC_FREE_INCOME} euros, art. 364.2), cut to the household limit (art. 364.3), never under 25% (${NC_MINIMUM} euros, art. 364.4), plus ${NC_THIRD} euros with a 75% disability and the need for another person (art. 364.6); invalidity pensioners who start work keep pension plus earnings up to the IPREM plus the pension, ${NC_WORK_LIMIT} euros, for 4 years (art. 366); the ${NC_RENT}-euro rent supplement (Royal Decree 241/2026 art. 21.2, Royal Decree 1191/2012); paid from the 1st of the month after the application; in Catalonia managed by the Generalitat (Departament de Drets Socials i Inclusió), with its official procedures linked, elsewhere by each region and IMSERSO. No personal data.`,
    },
    {
      name: "Spain working days and deadline calculator (días hábiles)",
      hubs: workingDaysEditions(),
      description: "the last day of a Spanish administrative deadline (Ley 39/2015 art. 30: from the day after notification, Saturdays, Sundays and national, regional and local holidays excluded, months to the same day, a last day that is inhábil moves to the next hábil one) or court deadline (LOPJ arts. 182-183, LEC arts. 130.2 and 133: also August and 24 December to 6 January), or the working days between two dates, for any Spanish region, every Catalan town and the Spanish cities with a page, with the official 2026 and 2027 holidays (BOE, DOGC, regional bulletins).",
    },
    {
      name: `Spain's IPREM ${IPREM_YEAR} (indicador público de renta de efectos múltiples)`,
      hubs: ipremEditions(),
      description: `the IPREM in force from the BOE: ${num(IPREM_DAILY, 0, "en")} euros a day, ${num(IPREM_MONTHLY, 0, "en")} a month, ${num(IPREM_ANNUAL, 0, "en")} a year in 12 payments and ${num(IPREM_14, 0, "en")} in 14 (Law 31/2022, the 2023 budget act, additional provision 90, still applied because no budget has been passed since: Constitution art. 134.4, General Budget Act art. 38.1; SEPE publishes the same figures for ${IPREM_YEAR}); when to use the 12- or the 14-payment figure (letter d; Royal Decree-law 3/2004 art. 2.3); ${IPREM_YEAR + 1}: no budget bill (Cortes dissolved by Royal Decree 806/2026, new chambers 23 December 2026), so the figure stays until a new budget act; every amount from 2004 to 2023 quoted from its own BOE text (years with an extended budget and no text of their own left blank); common limits in IPREM multiples, each from its rule: bono social for electricity (1.5 x the 14-payment IPREM + 0.3 per adult + 0.5 per minor, RD 897/2017 art. 3), free legal aid (2 / 2.5 / 3 x, exceptionally 5 x, the yearly IPREM, Law 1/1996 arts. 3 and 5), State Housing Plan 2026-2030 rent aid (5 / 5.5 / 6 x the 14-payment IPREM, RD 326/2026 arts. 8.2.b and 116.1.c), unemployment subsidy (95/90/80% of the monthly IPREM, LGSS arts. 278 and 280.4) and contributory benefit limits (art. 270.3), with the warning that the subsidy's income test is 75% of the minimum wage, not the IPREM (art. 275.1); a calculator for any multiple and for "my income is x times the IPREM".`,
    },
    {
      name: "Spain minimum wage (SMI) 2027",
      hubs: smiEditions(),
      description: "Spain's minimum wage from the BOE: 2026 (RD 126/2026: 1,221 euros a month in 14 payments, 17,094 a year, 40.70 a day, 9.55 an hour for domestic workers), every decree since 2018 with its BOE link, where 2027 stands from official documents only (advisory committee report, the Ministry of Labour's draft, Council of Ministers, BOE checked hourly) and a part-time / 12-or-14-payments calculator linked to the net salary calculator.",
    },
    {
      name: "Average salary in Spain (INE): by region, age, sex, sector and occupation, with EPA wage deciles",
      hubs: wageEditions(),
      description: `the INE's latest annual gross salary per worker from the Annual Wage Structure Survey (EAES, year ${wageHeadline().year}, released ${wageHeadline().released}: mean ${wageMoney(wageHeadline().mean, "en")}, median ${wageMoney(wageHeadline().median, "en")}${wageHeadline().modal ? `, most common ${wageMoney(wageHeadline().modal!.value, "en")}` : ""}; women ${wageMoney(wageHeadline().women, "en")}, men ${wageMoney(wageHeadline().men, "en")}): mean, 10th/25th/50th/75th/90th percentiles by autonomous community and sex (table 28191), by community and age (28201), sector (28192) and occupation level (28193), Spain by 5-year age band (28189), CNAE-09 section (28185), CNO-11 occupation group (28186) and full/part-time (28187); the EPA's monthly gross wage deciles of the main job (${SALARY_SNAPSHOT.epa.year}, released ${SALARY_SNAPSHOT.epa.released}: tables 66252, 66237${SALARY_SNAPSHOT.epa.next ? `; the ${SALARY_SNAPSHOT.epa.next.year} deciles are scheduled for ${SALARY_SNAPSHOT.epa.next.day}` : ""}); a finder that places a yearly gross salary among its region's percentiles and the national deciles; mean vs median vs mode, gross vs net (linked to the net salary calculator), why the data lag about a year and a half, and a CSV of every figure with 'Fuente: INE' (CC BY 4.0). Figures flagged by the INE as resting on 100-500 observations are marked; none are estimated.`,
    },
    {
      name: "Spain CPI (IPC) today and INE release calendar",
      hubs: ipcEditions(),
      description: "the INE's latest all-items and core CPI, annual and monthly change, read daily from the INE's API (series IPC290750, IPC290752, IPC292510, IPC292512), the last 24 months, the flash and final release dates from the INE's official calendar, and what the CPI is used for (pensions, rent, minimum wage).",
    },
    {
      name: "Spanish Treasury bills (Letras del Tesoro): auctions, latest rates and calculator",
      hubs: letrasEditions(),
      description: "the Tesoro Público's latest 3-, 6-, 9- and 12-month Letras auction results (average and marginal rate, price, issue and maturity dates) read from tesoro.es every 3 hours, every 2026 auction month by month, the official 2026 auction calendar with the Banco de España request and payment deadlines, a calculator (face value in multiples of 1,000 euros, price, return at maturity, equivalent TAE, savings-scale IRPF estimate, Banco de España fee), how to buy (Tesoro online service, Banco de España Cuenta Directa, banks), competitive vs non-competitive bids (Orden ECM/2/2026), and the tax rules (LIRPF arts. 25.2, 66, 76, 96; no withholding under RIRPF art. 75.3.b). Not investment advice.",
    },
    {
      name: "Spanish lottery prize tax calculator (El Gordo, El Niño, La Grossa)",
      hubs: lotteryTaxEditions(),
      description: `what you keep from a Spanish lottery prize after the special levy of Law 35/2006 on income tax, additional provision 33, quoted from the BOE: each winning décimo (ticket or bet) has its own 40,000 euros tax-free and 20% of the rest is withheld when it is paid; shared décimos and participaciones split the tax-free part by each holder's share; not declared on the income tax return. Presets for the Christmas Lottery 2026 prizes per 20-euro décimo (El Gordo ${lotteryMoney(lotteryHeadline().gordo.total.gross, "en")}: ${lotteryMoney(lotteryHeadline().gordo.total.withholding, "en")} withheld, ${lotteryMoney(lotteryHeadline().gordo.total.net, "en")} kept), El Niño 2027's first prize and La Grossa de Cap d'Any 2026 (Catalan government lottery, DOGC 9640), any other amount, non-residents (treaty refund on form 210) and the Agencia Tributaria's forms 136 and 230.`,
    },
    {
      name: `Spanish Christmas Lottery ${CHECK_YEAR} ticket checker (comprobar décimo, pedrea)`,
      hubs: checkEditions(),
      description: `on 22 December, type a five-digit number and the amount played to see every prize it wins in SELAE's ${CHECK_YEAR} programme (${CHECK_CATEGORIES.length} categories: El Gordo, second, third, fourth and fifth prizes, the 1,794-number pedrea, aproximaciones, centenas, last two digits, reintegro) per 20-euro décimo and per euro, and the net after the special levy (40,000 euros tax-free per décimo, 20% of the rest); the drawn numbers and the full pedrea grouped by thousand, read from SELAE's own pages, never from other outlets; never says "no prize" until all 1,807 numbers are in. Before the draw: the programme with every amount, how the derived prizes are assigned (quoted from the last programme the BOE published, pending SELAE's 2026 wording), the draw, collecting and the official ways to check. Only SELAE's Lista Oficial de Premios is valid for payment.`,
    },
    {
      name: `La Grossa de Cap d'Any ${GROSSA_YEAR} ticket checker (comprovar La Grossa, Catalan government New Year's Eve lottery)`,
      hubs: grossaCheckEditions(),
      description: `on 31 December, type a five-digit number and the amount played to see every prize it wins in La Grossa de Cap d'Any ${GROSSA_YEAR} (Loteries de Catalunya) per 10-euro ticket and per euro, and the net after the special levy (40,000 euros tax-free per ticket, 20% of the rest), from the eight winning numbers Loteries de Catalunya publishes, never from other outlets. Rules and amounts quoted from the DOGC (no. 9640, 8 April 2026, annex 3): eight extractions (three fifth prizes of 5,000 euros, two fourths of 10,000, third 30,000, second 65,000, first 200,000), each also paying the last four, three and two digits and the numbers either side (first prize: 1,000, 250, 35 and 2,000 euros, plus 10 euros for its last digit); only the highest category per extraction (point 8.2), prizes from different extractions add up (8.3); ${grossaEurosPerSeries().toLocaleString("en")} euros per series of 100,000 tickets, the 61.59% the DOGC sets; 90 days to collect (Resolution ECO/425/2022).`,
    },
    {
      name: `El Niño lottery ${NINO_YEAR} ticket checker (comprobar Lotería del Niño, 6 January)`,
      hubs: ninoCheckEditions(),
      description: NINO_PROGRAMME
        ? `on 6 January ${NINO_YEAR}, type a five-digit number and the amount played to see every prize it wins in SELAE's ${NINO_YEAR} El Niño programme (${NINO_PROGRAMME.categories.length} categories, ${NINO_PROGRAMME.prizesPerSeries.toLocaleString("en")} prizes per series) per 20-euro décimo and per euro, and the net after the special levy, from SELAE's own numbers; only SELAE's official list is valid for payment.`
        : `the Sorteo Extraordinario de El Niño on Wednesday 6 January ${NINO_YEAR} (SELAE): 20-euro décimos and a first prize of 2,000,000 euros per series (200,000 per décimo, 168,000 after the special levy), as SELAE's Lotería Nacional page states; how aproximaciones, centenas, endings and reintegros are assigned, quoted from the last El Niño programme the BOE published (BOE-A-2010-20031, for 2011) and marked pending confirmation against SELAE's ${NINO_YEAR} programme, whose other amounts are not printed until read; on the day, a checker on SELAE's numbers per décimo, per euro and after tax.`,
    },
    {
      name: "Spanish Christmas Lottery results: where El Gordo was sold",
      hubs: gordoHubTranslations(),
      description: "on 22 December, El Gordo and the other main prizes of the Christmas draw and every lottery shop SELAE lists for each, by province and town (one page each, only where SELAE lists a sale); before the draw, how SELAE publishes the winners and points of sale, how to check a décimo and where to collect.",
    },
    {
      name: "Bono social eléctrico checker (Spain's electricity discount for vulnerable consumers)",
      hubs: bonoSocialEditions(),
      description: `who qualifies for Spain's bono social for electricity and what it gives, quoted from the BOE: holder of the contract at the main home, 10 kW or less, on the regulated PVPC tariff, which only a reference supplier (comercializadora de referencia) sells; vulnerable with household income up to 1.5 times the 14-payment IPREM (${num(IPREM_14, 0, "en")} euros: 12,600 euros alone, +2,520 per further adult, +4,200 per minor, +8,400 with disability of 33% or more, gender or terrorism victim, dependency II/III, single parent or electrodependency), or a large-family title, minimum pensioners or IMV recipients; severely vulnerable at half the limit (1 x IPREM for minimum pensioners, 2 x IPREM for large families); at risk of social exclusion when social services pay at least half the bill (Royal Decree 897/2017 arts. 3-4; income = general + savings taxable base, Orden ETU/943/2017 art. 4). Discount 42.5% / 57.5% from 1 January to 31 December 2026 (Royal Decree-law 7/2026 art. 1, after Royal Decree-laws 16/2025 and 2/2026 were repealed), back to 35% / 50% from 1 January 2027 unless extended (RD 897/2017 art. 6.3); yearly kWh caps 1,587 / 2,222 / 2,698 / 4,761 (Annex I); no cut-offs until 31 December 2026 (RDL 7/2026 art. 4); how to apply, documents, the reference suppliers' phones (MITECO) and the thermal bono.`,
    },
    {
      name: "Is my town a zona tensionada? Spain's declared tight housing market areas",
      hubs: ztEditions(),
      description: "every declared zona de mercado residencial tensionado (Ley 12/2023 art. 18) from the Ministry of Housing's quarterly lists in the BOE (BOE-A-2024-5214 to BOE-A-2026-23088), checked against the Ministry's own page: 271 towns in Catalonia (140 from 16 March 2024 to 16 March 2027, 131 from 10 October 2024 to 10 October 2027), 21 in the Basque Country (Galdakao district 2 only; Vitoria-Gasteiz except its rural area), 21 in Navarre, A Coruña and Santiago de Compostela in Galicia, and six declared areas in five Asturian councils (Llanes twice, Cabrales, Gijón, Avilés, Gozón), all partial; the Generalitat's resolutions of 16 October 2026 (DOGC 19 October): TER/3739/2026 extends 118 of the first 140 and leaves out 22 (Lleida, Reus, Granollers, Figueres among them), TER/3740/2026 declares 53 more, both awaiting a BOE list, from whose next day the limits apply. Per declaration the large-landlord (gran tenedor) threshold quoted from the BOE: 5 or more homes in Catalonia, Navarre, Santiago and most Basque towns, more than 5 in Pasaia, the general more than 10 homes or 1,500 m2 in Bilbao, Zestoa, A Coruña and Asturias (art. 3 k, Registry certificate since Royal Decree-law 29/2026). What changes: new-lease rent capped at the previous rent of the last 5 years, +10% only for works or 10-year leases, no new charges (LAU art. 17.6), the state reference index (SERPAVI, upper value) for large landlords and homes not let in 5 years (art. 17.7), up to 3 years' extraordinary extension (art. 10.3), information duty (Ley 12/2023 art. 31.3); one page, a checker over all 947 Catalan towns, the full list by region.",
    },
    {
      name: "When is my ITV due? Spain vehicle inspection calculator",
      hubs: itvEditions(),
      description: "the next ITV (Spanish periodic vehicle inspection) date from vehicle category and first registration, with Royal Decree 920/2017 art. 6 quoted from the BOE (private car: exempt until 4 years, then every 2 years, every year from 10; vans, motorcycles, mopeds, caravans, buses, taxis, tractors), the 30-day early rule that keeps the date (art. 6.5), the fine for driving with it expired (Traffic Act art. 76.o: 200 euros, 100 if paid within 20 days), the V-19 sticker, historic vehicles, and the fee per autonomous community only where the community publishes an official tariff, with each region's official station list.",
    },
    {
      name: "Spanish traffic fines: deadlines, the 50% discount and appeals (calculator)",
      hubs: trafficFinesEditions(),
      description: "the last day to pay a Spanish traffic fine with 50% off, contest it or name the driver, quoted from the BOE (Traffic Act, Royal Legislative Decree 6/2015, consolidated text of 26/06/2026): 20 calendar days counted from the day after the notification (arts. 93.1, 94, 95.1); paying waives the right to contest, ends the procedure and makes the sanction final, and the points still come off (arts. 64, 94); no discount for the ten offences of art. 93.2 (art. 77 h, j, n, ñ, o, p, q, r, s, t: driving with or installing a radar jammer, not truthfully naming the driver, roadworks, industry, centres, courses, operators; s and t added by Law 18/2021 from 21 March 2022, which is why DGT and SCT pages list fewer); when a fine counts as notified (on the spot, post, DEV opened or 10 days after it arrives unopened, art. 90.2; the BOE notice board: the DGT counts from publication, art. 91 says 20 days later); a last day on a Saturday, Sunday or holiday moves to the next working day under Law 39/2015 art. 30.5 (applied by art. 83.1; not stated by the DGT or SCT), with national and regional holidays; doing nothing: the notice becomes the decision for the art. 95.4 cases and the DGT gives 45 days to pay in full (30 + 15, art. 110.1), otherwise a decision with one month for reposición (art. 96.2) and two months for court (Law 29/1998 art. 46.1); enforcement surcharges 5% / 10% / 20% plus interest (General Tax Act arts. 28 and 62.5; AEAT for the DGT, ATC for the Servei Català de Trànsit); amounts (art. 80: up to 100 / 200 / 500 euros, 1,000 alcohol and drugs, 6,000 jammer) and the annex IV speeding table; annex II points, 12 points back after 2 years without final sanctions (art. 65.1; the 3-year rule was deleted in 2022), recovery course 4 points (Orden INT/914/2024); prescription 3 / 6 months (art. 112); who fines (DGT on interurban roads, councils in town, the Servei Català de Trànsit in Catalonia). Links the official DGT and SCT services; never asks for a plate or ID. Not legal advice.",
    },
    {
      name: "Spain home purchase taxes calculator (ITP, IVA and AJD by region)",
      hubs: htEditions(),
      description: "the taxes on buying a home in each Spanish region: ITP (transfer tax) on a resale home at the region's general rate or scale, or the reduced rate a buyer qualifies for (young buyers, large families, disability, main or first home, protected housing, price caps, with the income limits and other conditions the law sets), and on a new home IVA 10% (4% for special-regime VPO, VAT Act art. 91; IGIC in the Canary Islands, IPSI in Ceuta and Melilla) plus the AJD on the deed; each rate with the article of the region's consolidated tax law (BOE, regional bulletins, the Basque and Navarre foral norms) and the reading date, the mortgage AJD paid by the lender (TRLITP art. 29, Royal Decree-law 17/2018), and the notary and registry fee scales (RD 1426/1989, RD 1427/1989) without invented totals. Not tax advice.",
    },
    {
      name: "Spain home buying costs calculator (notary and Land Registry fees, gastos de compraventa)",
      hubs: pcEditions(),
      description: "the regulated fees of buying a home in Spain, computed from the official scales quoted from the BOE: the notary (Royal Decree 1426/1989, item 2.1: 90.15 euros up to 6,010.12 then 4.5, 1.5, 1, 0.5 and 0.3 per thousand by slices up to 6,010,121.04, free above, less a compulsory 5% rebate; matrix folios from the fifth at 3.005061 euros per written side, item 7; the authorised copy at 3.005061 euros a folio and half from the twelfth, simple copies 0.601012, item 4; an optional discount of up to 10%, Royal Decree-law 6/2000 art. 35) and the Land Registry (Royal Decree 1427/1989, item 2.1: 24.04 euros then 1.75, 1.25, 0.75, 0.30 and 0.20 per thousand, never below 24.04 or above 2,181.67, less the 5% rebate and another 5% on a home sale, Royal Decree-law 6/2000 art. 36; presentation entry 6.01; buyers in pro indiviso pay the scale on each share up to 1% of the value, spouses under community property one base); protected housing (VPO): 50% off on later sales (items 2.2.e and 2.4.b), 50% off the first sale and fixed 60.05 / 24.02 euros up to 90 m2 when it is the buyer's only home (Ley 41/1980 art. 8, DGRN Instruction of 22 May 2002); 21% VAT on the fees (IGIC or IPSI in the Canaries, Ceuta and Melilla, not computed); who pays (Civil Code art. 1455: the deed the seller, the first copy and registration the buyer unless agreed; the taxes always the buyer, ITPAJD act arts. 8 and 29; with a mortgage the bank pays its notary, registration, gestoria and AJD, the borrower the valuation, Ley 5/2019 art. 14.1.e); the purchase taxes for the chosen region from the home purchase tax calculator's engine; a fee table by price and worked examples. Gestoria and valuation have no official price and are never estimated; folios and copies are the reader's estimate and the final invoice may differ. Not legal or tax advice.",
    },
    {
      name: "Spain plusvalía municipal tax calculator (IIVTNU, both methods)",
      hubs: pvEditions(),
      description: "the Spanish municipal tax on the increase in value of urban land (plusvalía municipal, IIVTNU) on a sale, inheritance or gift, under arts. 104 to 110 of the consolidated Local Finance Act (Royal Legislative Decree 2/2004) as reformed by Royal Decree-law 26/2021 after Constitutional Court ruling 182/2021, each step with the BOE article quoted: the objective method (the land's cadastral value for IBI at the transfer date times the coefficient for the full years held, at most 20; under a year the annual coefficient prorated by full months; the council's coefficient never above the legal maximum, art. 107.4), the real-gain method (transfer minus acquisition value, each the higher of deed and checked value with no costs, times the land's share of the total cadastral value; zero or less means no taxable event, art. 104.5; the lower base at the taxpayer's request, art. 107.5), the council's rate (at most 30%, art. 108.1) and the inheritance rebate (up to 95% for descendants, spouses and ascendants, art. 108.4). Maximum coefficients by transfer date: Royal Decree-law 8/2023 (in force again after Congress derogated RDL 9/2024 and RDL 16/2025, which applied only 1-22 January 2025 and 1-27 January 2026) until 30 November 2026, and Royal Decree-law 29/2026 art. 10 (ratified 12 November 2026) from 1 December 2026 (for example 0.11 for 14 years and 0.30 for 20 or more, against 0.09 and 0.40 before); no 2027 update published as of 19 November 2026. Who pays (seller on a sale, buyer as substitute for a non-resident seller, heir or donee otherwise, art. 106), deadlines (30 working days inter vivos, six months extendable to one year on death, art. 110.2), and Barcelona's ordinance 1.3 (30% rate, own coefficients, 95% habitual-home rebate, self-assessment with the IMH). Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Catalonia inheritance tax calculator (impost sobre successions, one heir)",
      hubs: isdEditions(),
      description: "one heir's Catalan inheritance tax under book six of the Catalan Tax Code (Legislative Decree 1/2024, which replaced Law 19/2010; consolidated text in force since 14 July 2026), step by step with each article quoted: taxable base (net share plus life insurance on a policy the deceased took out), kinship reductions (art. 631-2: group I 100,000 euros plus 12,000 per year under 21, up to 196,000; spouse and child 100,000, other descendants 50,000, ascendants 30,000; group III 8,000; group IV none), disability 275,000 / 650,000 (art. 631-3) or 275,000 at 75 or over in group II (art. 631-4, never both), life insurance up to 25,000 (art. 631-5), 95% of the deceased's habitual home with a 500,000-euro cap shared by the heirs and a 180,000-euro floor each (art. 631-17); the scale 7% to 32% (art. 633-1), coefficients by group and prior wealth (art. 633-3: 1 to 1.2 for groups I-II, 1.5882 group III, 2 group IV) with the excess rule, and the rebate (art. 633-4: 99% for spouses and stable partners; weighted average by taxable-base slices for the rest of groups I and II, 99% to 20% and 60% to 0%). Reproduces the Catalan Tax Agency's six worked examples; deadline six months from the death plus a six-month extension asked within five (RD 1629/1991 arts. 67-68), forms 660 and 650 and the ATC's help program. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Madrid inheritance tax calculator (impuesto sobre sucesiones, one heir)",
      hubs: isdRegionEditions("madrid"),
      description: "one heir's inheritance tax in the Comunidad de Madrid under Legislative Decree 1/2010 (texto refundido of ceded taxes; BOE consolidated text, art. 21 in force since 1 July 2026), step by step with each article quoted: kinship reductions replacing the state's (art. 21.Uno: group I 16,000 euros plus 4,000 per year under 21, up to 48,000; group II 16,000; group III 8,000; group IV none), disability 55,000 / 153,000, life insurance up to 9,200, 95% of the deceased's habitual home up to 123,000 per heir; Madrid's scale 7.65% to 34% (art. 23), coefficients by group and prior wealth with the excess rule (art. 24), and the rebate (art. 25.1: 99% for groups I and II; 50% for the whole of group III for deaths since 1 July 2025, on the tax of assets declared on time). Reproduces the Comunidad de Madrid's own figure (gross tax 1,250 euros, 12.50 to pay); deadline six months plus a six-month extension asked within five (RD 1629/1991 arts. 67-68), form 650 through the Oficina Virtual Tributaria. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Andalusia inheritance tax calculator (impuesto sobre sucesiones, one heir)",
      hubs: isdRegionEditions("andalucia"),
      description: "one heir's inheritance tax in Andalusia under Law 5/2021 on ceded taxes (in force since 1 January 2022, BOE consolidated text), step by step with each article quoted: kinship reductions (art. 28: 1,000,000 euros for groups I and II, 10,000 for group III, none for group IV), disability 250,000 / 500,000 (art. 29), 99% of the deceased's habitual home with the state limit of 122,606.47 per heir (art. 27; kept three years), the state life-insurance reduction up to 9,195.49 (Law 29/1987 art. 20.2.b); Andalusia's scale 7% to 26% (art. 37), coefficients by group only, 1 / 1.5 / 1.9 (art. 38), and the 99% rebate for groups I and II (art. 39). Deadline six months plus a six-month extension asked within five (RD 1629/1991 arts. 67-68), forms 650 and 660 with the Agencia Tributaria de Andalucía. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Valencia region inheritance tax calculator (impuesto sobre sucesiones, one heir)",
      hubs: isdRegionEditions("valencia"),
      description: "one heir's inheritance tax in the Comunitat Valenciana under Valencian Law 13/1997 (BOE consolidated text, arts. 10 and 12 bis as worded from 11 August 2026), step by step with each article quoted: kinship reductions for groups I and II (art. 10.1.a: 100,000 euros plus 8,000 per year under 21, up to 156,000; 100,000), the state's 7,993.46 for group III and none for group IV (Law 29/1987 art. 20.2.a, as the ATV's form 650 instructions apply it), disability 120,000 / 240,000 (65%, or intellectual or mental 33%), the state life-insurance reduction up to 9,195.49, 95% of the deceased's habitual home up to 150,000 per heir; the Valencian scale 7.65% to 34% (art. 11) and coefficients with the excess rule (art. 12), and the rebates (art. 12 bis: 99% for groups I and II and for heirs with a 65% or intellectual/mental 33% disability; 25% for blood siblings, nephews, nieces, uncles and aunts for deaths since 1 June 2026, 50% from 1 June 2027). Deadline six months plus a six-month extension (art. 12 ter, RD 1629/1991), form 650 with the Agència Tributària Valenciana's online help program. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Catalonia gift tax calculator (impost sobre donacions, one gift)",
      hubs: giftEditions("catalonia"),
      description: "one gift's tax in Catalonia under book six of the Catalan Tax Code (Legislative Decree 1/2024; consolidated text in force since 14 July 2026), step by step with each article quoted: no kinship reduction and no rebate on gifts; groups I and II (children, grandchildren, spouse or stable partner, parents) pay the reduced scale (art. 633-2: 5% up to 200,000 euros, 7% up to 600,000, 9% above) when the gift is in a public deed, signed within a month of handing over cash, otherwise the general 7% to 32% scale (art. 633-1); coefficients by group and prior wealth (art. 633-3) with the excess rule; the first-habitual-home reduction for descendants aged 36 or under (arts. 632-20 and 632-21: 95%, at most 60,000 euros, 120,000 with a 65% disability; income up to 36,000; buy within six months); earlier gifts from the same donor in three years accumulated at the average rate (Law 29/1987 art. 30). Reproduces nine of the Catalan Tax Agency's eleven worked gift examples to the cent; deadline one month (Decree 414/2011 art. 10.b), form 651 online. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Madrid gift tax calculator (impuesto sobre donaciones, one gift)",
      hubs: giftEditions("madrid"),
      description: "one gift's tax in the Comunidad de Madrid under Legislative Decree 1/2010 (BOE consolidated text, last updated 10 July 2026), step by step with each article quoted: no kinship reduction on gifts (Law 29/1987 art. 20.5); 100% reduction of cash that groups I and II or a sibling spend on the habitual home within a year, up to 250,000 euros over three years (art. 22 bis); Madrid's scale 7.65% to 34% and coefficients (arts. 23 and 24); rebates (art. 25.2, from 1 July 2025): 100% when gifts from one donor add up to 1,000 euros or less in three years, 99% for groups I and II, 50% for group III, with a public document above 10,000 euros and, for cash, the origin of the funds justified and stated; earlier gifts accumulated (Law 29/1987 art. 30). Reproduces the Comunidad de Madrid's two worked figures (316.21 and 16.90 euros); deadline 30 working days (RD 1629/1991 art. 67.1.b), form 651. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Andalusia gift tax calculator (impuesto sobre donaciones, one gift)",
      hubs: giftEditions("andalucia"),
      description: "one gift's tax in Andalusia under Law 5/2021 on ceded taxes (BOE consolidated text, art. 40 as worded from 1 January 2026), step by step with each article quoted: no kinship reduction on gifts; 99% of cash from parents or grandparents to buy the habitual home in Andalusia, or of the home given, on a base of up to 150,000 euros (250,000 with a disability) for donees under 35 or disabled with prior wealth up to 402,678.11 (arts. 32 and 33); the scale 7% to 26% and coefficients by group only (arts. 37 and 38); the 99% rebate for groups I and II (art. 40), with a public document when gifts from one donor exceed 5,000 euros in three years and, for cash above 5,000, the deed within a month and the origin of the funds stated. Reproduces the Andalusian Tax Agency's guide figures (126.20 and 14.73 euros); deadline two months (art. 68.1), form 651. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Valencia region gift tax calculator (impuesto sobre donaciones, one gift)",
      hubs: giftEditions("valencia"),
      description: "one gift's tax in the Comunitat Valenciana under Valencian Law 13/1997 (BOE consolidated text, arts. 10 bis and 12 bis as worded from 11 August 2026), step by step with each article quoted: kinship reductions on gifts (art. 10 bis.2.a: 100,000 euros for children and grandchildren aged 21 or over, the spouse, parents and grandparents; up to 156,000 under 21) and disability ones (240,000 / 120,000), with a public document (or digitally signed documents up to 4,000 euros in cash or a vehicle) and, for cash, the origin of the funds; the Valencian scale 7.65% to 34% and coefficients (arts. 11 and 12) with the excess rule; rebates (art. 12 bis: 99% for those relatives and for donees with a 65% or intellectual/mental 33% disability; 25% for blood siblings, nephews, nieces, uncles and aunts since 1 June 2026, 50% from 1 June 2027); earlier gifts accumulated (Law 29/1987 art. 30). Deadline one month (art. 12 ter), no extension, form 651 with the ATV's help program. Re-checked from 1 January 2027. An estimate, not tax advice.",
    },
    {
      name: "Inheritance tax by region in Spain: the 21 territories compared (impuesto de sucesiones por comunidad)",
      hubs: cmpEditions(),
      description: `the inheritance and gift tax rules of all 21 Spanish territories side by side: the 15 common-regime communities, Ceuta and Melilla (Law 29/1987 in full, with its art. 23 bis rebate: 99% for groups I and II, 50% for the rest) and the foral Álava, Bizkaia, Gipuzkoa and Navarre (their own norma foral or ley foral, basics for groups I and II). For each: the reductions for children aged 21 or more and the spouse, the rebate on the tax for groups I and II, the deceased's habitual home, siblings (group III), and a gift from a parent to an adult child (reduction or rebate, and the formal requirement: public document, origin of cash); every cell with its article, the date its wording applies from and the law's own words, read on 19 November 2026 in the BOE's consolidated texts, the regional bulletins and the diputaciones' consolidated foral texts; a cell not read with confidence says "pendiente de verificar". One worked example in every territory (a 30-year-old only child inheriting €300,000 net, €150,000 of it the deceased's home, no prior wealth), computed with the site's calculators for Catalonia, Madrid, Andalusia and Valencia and from the quoted rules elsewhere: €${cmpExtremes().lowPay} in ${cmpExtremes().low.length} of the ${cmpExtremes().total} territories, up to €${cmpExtremes().highPay.toFixed(2)} in ${cmpExtremes().high.map((t) => t.name.en).join(" and ")}. CSV download (CC BY 4.0). Which rules apply: the region where the deceased lived the most days of the last five years (Law 22/2009 arts. 28 and 32). Re-checked from 1 January 2027. Not tax advice.`,
    },
    {
      name: "Strikes in Catalonia today",
      hubs: { ...GUIDES.strikes },
      description: "upcoming and current strikes affecting transport, schools and health in Catalonia, with the official minimum services for each.",
    },
    {
      name: "Strikes in Spain: calendar and minimum services",
      hubs: { es: b2href("strikesSpain", "es"), ca: b2href("strikesSpain", "ca"), en: b2href("strikesSpain", "en") },
      description: "the dated strikes called across Spain, this week day by day and a calendar of the rest: who calls each one, its status, and the minimum services with the official resolution that sets them; the open-ended airport strikes, and what was postponed or called off, listed apart.",
    },
    {
      name: "Official warnings in Catalonia now",
      hubs: warningsTranslations(),
      description: "AEMET Meteoalerta weather warnings in force and coming up for each Catalan zone (level, phenomenon, start and end), Protecció Civil plans in pre-alert, alert or emergency, and Servei Català de Trànsit road incidents and closures, read from the three official open feeds every five minutes with the time of each reading.",
    },
    {
      name: "Rodalies live service notices",
      hubs: { ca: rodaliesHub("ca"), es: rodaliesHub("es"), en: rodaliesHub("en") },
      description: `live notices and incidents for every Rodalies de Catalunya line (${lineIds().length} line pages in Catalan, Spanish and English), read from Rodalies de Catalunya and Renfe's open data, with each line's stations and a summary of Renfe's official timetable (GTFS, CC BY 4.0): first and last train from the main stations, trains per hour by time band on weekdays, Saturdays and Sundays, and journey times.`,
    },
    {
      name: "Cheapest petrol stations",
      hubs: { ca: fuelHubPath("ca"), es: fuelHubPath("es"), en: fuelHubPath("en") },
      description: `today's petrol and diesel prices at Catalonia's ${STATIONS.stations.length} public stations, cheapest first, with today's cheapest and median price in every province, city and chain, and ${fuelPages} area pages per language in Catalan and Spanish, from the Ministry for the Ecological Transition (CC BY 4.0).`,
    },
    {
      name: "Petrol and diesel prices in every province of Spain",
      hubs: spainHubTranslations(),
      description: `today's cheapest and median petrol 95 and diesel price in each of Spain's 52 provinces and autonomous cities against the national median, and one page for each of the ${spainProvinces().length} outside Catalonia with its ten cheapest stations (brand, address, opening hours) and its main towns, read every half hour from the Ministry for the Ecological Transition's national list (CC BY 4.0) with the Ministry's time.`,
    },
    {
      name: "Electricity price in Spain today and tomorrow (PVPC)",
      hubs: { es: pvpcPath("es"), ca: pvpcPath("ca"), en: pvpcPath("en") },
      description: "the regulated PVPC 2.0TD electricity price for every hour of today and, once Red Eléctrica publishes it before 20:15, tomorrow: cheapest and dearest hours, daily average, peak/standard/off-peak periods and the Ceuta and Melilla prices, read from REE's open REData API every 15 minutes.",
    },
    {
      name: "Butane bottle price in Spain today",
      hubs: butaneTranslations(),
      description: "the regulated maximum price of the 12.5 kg butane bottle from each BOE resolution of the Directorate-General for Energy Policy and Mines: today's price with taxes for the mainland and Balearics, the next revision date (third Tuesday of every other month, ±5% cap, RDL 25/2026 ceiling to 30 June 2027), every revision since 2024 with its BOE link, and the home-delivery operators.",
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
      hubs: { ca: weekendHubPath("ca"), es: weekendHubPath("es"), en: englishHubPath() },
      description: `this weekend's fairs, Christmas markets and cultural agenda by day and by type, across Catalonia and in ${shippedZones().length} zones (cities, provinces and coasts), from the Generalitat's official agenda and fairs calendar, and for Barcelona the Ajuntament's own agenda (Open Data BCN); refreshed every hour, with times, prices and the official page of each activity.`,
    },
    {
      name: "Christmas markets by town",
      hubs: { ca: fairsHubPath("ca"), es: fairsHubPath("es"), en: fairsHubPath("en") },
      description: `the ${CHRISTMAS_FAIRS.length} Christmas fairs and markets of the ${SEASON_YEAR} season with official dates, one page per town (${christmasTowns().length} towns in Catalan and Spanish, ${christmasEnglishTowns().length} in English), from the Generalitat's fairs calendar and the organisers' own announcements.`,
    },
    ...topLandingTools(),
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
function toolLine(tool: Pick<LiveTool, "name" | "hubs" | "description">, origin: string): string {
  const main: Locale = tool.hubs.en ? "en" : "ca";
  const others = LOCALES.filter((l) => l !== main && tool.hubs[l]).map((l) => `[${LANGUAGE_NAME[l]}](${origin}${tool.hubs[l]})`);
  const description = tool.description.charAt(0).toUpperCase() + tool.description.slice(1);
  return `- [${tool.name}](${origin}${tool.hubs[main]}): ${description}${others.length ? ` Also in: ${others.join(", ")}.` : ""}`;
}

/**
 * `today` (Madrid ISO date; the clock when omitted) decides which pages are
 * out of the index: a guide on the low-demand list (lib/seo/low-demand.ts:
 * finished events such as the 11N city pages) is left out, as the sitemap
 * leaves it out (site audit, 19 Nov 2026: 43 noindex URLs in the file).
 */
export function buildLlmsTxt(origin: string, siteName: string, guides: Partial<Record<Locale, readonly LlmsEntry[]>>, today?: string): string {
  const updated = llmsUpdatedLine(guides);
  const parts: string[] = [`# ${siteName}`, "", LLMS_SUMMARY, "", ...(updated ? [updated, ""] : []), "## Live tools and data", ""];
  for (const tool of liveTools(today)) parts.push(toolLine(tool, origin));
  parts.push("", "## About this site and how we verify", "");
  for (const page of trustPages()) parts.push(toolLine(page, origin));
  parts.push(`- [WhatsApp channel](${WHATSAPP_CHANNEL}): The site's own channel, a daily post in Catalan with what to know today.`);
  parts.push("");

  // A page already named above (a strike or weekend guide is both a live tool
  // and a guide) is not listed a second time.
  const named = new Set<string>();
  for (const entry of [...liveTools(today), ...trustPages()]) for (const hub of Object.values(entry.hubs)) named.add(hub);

  for (const locale of LOCALES) {
    const entries = [...(guides[locale] ?? [])]
      .filter((e) => !isLowDemandPath(e.href, today) && !named.has(e.href))
      .sort((a, b) => (a.href < b.href ? -1 : a.href > b.href ? 1 : 0));
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
