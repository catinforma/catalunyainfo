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
import { lotteryTaxEditions, money as lotteryMoney } from "@/lib/programmatic/lottery-tax/copy";
import { headline as lotteryHeadline } from "@/lib/programmatic/lottery-tax/page";
import { bonoSocialEditions } from "@/lib/programmatic/bono-social/copy";
import { trafficFinesEditions } from "@/lib/programmatic/traffic-fines/copy";
import { ztEditions } from "@/lib/programmatic/zona-tensionada/copy";
import { gordoHubTranslations } from "@/lib/programmatic/gordo/paths";
import { checkEditions } from "@/lib/programmatic/lottery-check/paths";
import { CATEGORIES as CHECK_CATEGORIES, PROGRAMME_YEAR as CHECK_YEAR } from "@/lib/programmatic/lottery-check/programme";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { siteAuthorPath } from "@/lib/content/author";
import { b2href } from "@/lib/content/batch02/shared";
import { OWNER } from "@/lib/content/pages/institutional";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SITE, WHATSAPP_CHANNEL } from "@/lib/site";
import { isLowDemandPath } from "@/lib/seo/low-demand";
import { CITIES as SPAIN_CITIES } from "@/lib/programmatic/spain-2027/cities";
import { COMMUNITIES as SPAIN_COMMUNITIES } from "@/lib/programmatic/spain-2027/communities";
import { editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { SEASON_YEAR } from "@/lib/programmatic/christmas-fairs/classify";
import { FAIRS as CHRISTMAS_FAIRS, englishTowns as christmasEnglishTowns, towns as christmasTowns } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { hubPath as electionsHub, PAGES_PER_LOCALE } from "@/lib/programmatic/elections/paths";
import { STATIONS, selectPages } from "@/lib/programmatic/fuel/data";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { SNAPSHOT as HOLIDAYS, YEAR } from "@/lib/programmatic/holidays/data";
import { englishTowns } from "@/lib/programmatic/holidays/english";
import { reportEditions } from "@/lib/programmatic/holidays/report-copy";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { DATE_PAGES, DATE_PAGE_RANGE, datePath, hubPath as holidaysHub } from "@/lib/programmatic/holidays/paths";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { butaneTranslations } from "@/lib/programmatic/butane/paths";
import { warningsTranslations } from "@/lib/programmatic/warnings/paths";
import { RESERVOIR_DATA } from "@/lib/programmatic/reservoirs/data";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { lineIds } from "@/lib/programmatic/rodalies/pages";
import { todayPath } from "@/lib/programmatic/today/paths";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";
import { shippedZones } from "@/lib/programmatic/weekend/data";
import { englishHubPath, weekendHubPath } from "@/lib/programmatic/weekend/paths";

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
      description: "the legal minimum paid leave for employees with who pays each and a calculator of the last day: marriage or registered partnership 15 calendar days (ET art. 37.3.a); a relative's serious accident or illness, hospitalisation or surgery with home rest 5 days (37.3.b); death 2 days, 4 when travelling (37.3.b bis); moving house 1 day (37.3.c); public duty for the time needed; up to 4 days when work cannot be reached (37.3.g); force majeure hours equal to 4 days a year (37.9); nursing hour to 9 months (37.4); at least 30 calendar days of holiday (38.1); all paid by the employer. Only marriage and holidays say calendar days: for the others the ET says just 'días', so both the consecutive and the Monday-to-Friday count (national and regional holidays) are shown. Birth and childcare leave 19 weeks per parent, 32 for a single parent (6 mandatory after the birth + 11 until 12 months + 2 until age 8; RDL 9/2025), paid by Social Security at 100% of the base reguladora (LGSS art. 179), exempt from IRPF except in Navarre; parental leave 8 weeks until age 8 (art. 48 bis), unpaid by law. Collective agreements can improve all of them.",
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
      description: `who is entitled to Spain's widow's pension and how much, quoted from the BOE (General Social Security Act, consolidated text of 11/11/2026): the deceased needs 500 days of contributions in the last 5 years if registered (alta), 15 years if not, none after an accident or occupational illness, and nothing more if a retirement or permanent disability pensioner (arts. 217, 219.1); spouses need a year of marriage, common children or more than 2 years with prior cohabitation only when the fatal common illness came first (art. 219.2); unmarried partners need 5 years living together on the padrón and a registration 2 years before, or since 21 October 2026, with common children, only 2 years on the padrón (art. 221.2 as amended by Royal Decree-law 31/2026, awaiting ratification); separated or divorced people need a compensatory pension, which caps the widow's pension, except women victims of gender violence (art. 220, transitional rule 13 for pre-2008 divorces); a 2-year temporary benefit (art. 222); 52% of the base reguladora (Decreto 3158/1966 art. 31.1), 60% from 65 with no other public pension, no work income and other income within ${WIDOW_INCOME_LIMIT} euros (Royal Decree 900/2018), 70% with family dependants, main income and an income ceiling, cut by art. 31.3; the ${WIDOW_AMOUNTS_YEAR} minimums of Royal Decree 241/2026 (${(WIDOW_MINIMUMS.widowUnder60 / 14).toFixed(2)} to ${(WIDOW_MINIMUMS.widowCharges / 14).toFixed(2)} euros a month in 14 payments) with the partial top-up rule, the non-contributory cap and residence; compatibility with work and own pension, loss on remarriage with the over-61 exception (Order of 13 February 1967 art. 11), the base reguladora as the Seguridad Social computes it, and the official application (Portal de Prestaciones, form, CAISS). No personal data.`,
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
  const parts: string[] = [`# ${siteName}`, "", LLMS_SUMMARY, "", "## Live tools and data", ""];
  for (const tool of liveTools(today)) parts.push(toolLine(tool, origin));
  parts.push("", "## About this site and how we verify", "");
  for (const page of trustPages()) parts.push(toolLine(page, origin));
  parts.push(`- [WhatsApp channel](${WHATSAPP_CHANNEL}): The site's own channel, a daily post in Catalan with what to know today.`);
  parts.push("");

  for (const locale of LOCALES) {
    const entries = [...(guides[locale] ?? [])]
      .filter((e) => !isLowDemandPath(e.href, today))
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
