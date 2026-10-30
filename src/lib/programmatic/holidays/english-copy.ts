import { EN_LARGEST, EN_RESORTS, TOURISM_REGISTER } from "@/lib/programmatic/elections/english";

import { NEXT, SNAPSHOT, YEAR, aranSwap, isAran, regionalDays } from "./data";
import { dateContent } from "./dates";
import { englishTowns, englishWithoutDays } from "./english";
import { dayMonth, weekdayDayMonth, weekdayName } from "./format";
import { joinList } from "./names";
import { DATE_PAGES, type DatePage } from "./paths";
import type { SnapshotMunicipality } from "./types";

/**
 * Words for the English town pages (`/en/holidays/<slug>/`) and the English
 * hub (`/en/holidays/`). Written for visitors and people who have just moved
 * here, not translated from the Catalan pages: the answer (the two local
 * dates) first, then what a holiday shuts. Every date comes from the
 * snapshot (DOGC orders, the shop-opening resolution); nothing here knows
 * what day it is, so the server HTML is the same on every request.
 */

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const fit = (candidates: string[], max: number): string => candidates.find((c) => c.length <= max) ?? candidates.at(-1) ?? "";

/** English writes the article capitalised everywhere, as Spanish does: "L'Hospitalet de Llobregat", "L'Escala". */
export function enName(m: Pick<SnapshotMunicipality, "name">): string {
  return m.name.charAt(0).toUpperCase() + m.name.slice(1);
}

const dates = (list: readonly string[]) => joinList(list.map((d) => dayMonth(d, "en")), "en");
const wdDates = (list: readonly string[]) => joinList(list.map((d) => weekdayDayMonth(d, "en")), "en");
const count = (n: number) => (n === 1 ? "one" : n === 2 ? "two" : String(n));

const ORDER = "Order EMT/208/2025 (DOGC, 17 December 2025)";
const AMENDMENT = "Order EMT/3/2026 (DOGC, 20 January 2026)";
const amended = (m: SnapshotMunicipality) => m.correction?.by === "Ordre EMT/3/2026";

/** 12: the Catalonia-wide days of a year (11 + the Festa d'Aran in Aran). */
function regionalCount(year: number): number {
  return regionalDays(year).length;
}

/* -------------------------------------------------------------------------- */
/* Town page: metadata                                                        */
/* -------------------------------------------------------------------------- */

/**
 * "Sitges public holidays 2026 and 2027: local dates": the town first, as
 * people type it ("public holidays barcelona 2026", "sitges public holidays
 * 2026"), then both years.
 */
export function englishTownTitle(m: SnapshotMunicipality): string {
  const name = enName(m);
  return fit(
    [
      `${name} public holidays ${YEAR} and ${NEXT}: local dates`,
      `${name} public holidays ${YEAR} and ${NEXT}`,
      // Castell d'Aro, Platja d'Aro i s'Agaró (37 characters).
      `${name} holidays ${YEAR} and ${NEXT}`,
      `${name} public holidays ${YEAR}`,
    ],
    TITLE_MAX,
  );
}

export function englishTownH1(m: SnapshotMunicipality): string {
  return `Public holidays in ${enName(m)} ${YEAR} and ${NEXT}`;
}

/** What the town's own local days are, for the description and the lead. */
function localPhrase(m: SnapshotMunicipality): string {
  if (m.local.length > 0) return `${count(m.local.length)} local ${m.local.length === 1 ? "holiday" : "holidays"} in ${YEAR}: ${dates(m.local)}`;
  return `local holidays set village by village in ${YEAR}`;
}

/** Both local dates first, then what else the page answers. */
export function englishTownDescription(m: SnapshotMunicipality): string {
  const name = enName(m);
  const head = `${name} has ${localPhrase(m)}, plus Catalonia's ${regionalCount(YEAR)}.`;
  return fit(
    [
      `${head} Is today a holiday? Also the ${NEXT} bank holidays and shop opening days.`,
      `${head} Is today a holiday? Also the ${NEXT} bank holidays.`,
      `${head} Is today a holiday here?`,
      head,
    ],
    DESCRIPTION_MAX,
  );
}

/* -------------------------------------------------------------------------- */
/* Town page: body                                                            */
/* -------------------------------------------------------------------------- */

export interface EnglishTownCopy {
  lead: string;
  source: string;
  correction: string | null;
  nucleiLead: string | null;
  statusTitle: string;
  tableTitle: string;
  tableCaption: string;
  nucleiTitle: string;
  nucleiCols: { place: string; days: string };
  nextTitle: string;
  /** Paragraphs before the 2027 table. */
  next: string[];
  nextCaption: string;
  closesTitle: string;
  shops: { title: string; lead: string; local: string[]; rules: string[]; guide: string };
  schools: { title: string; text: string };
  work: { title: string; text: string };
  /** Barcelonès only: a pointer to the metro hours guide. */
  metro: { title: string; text: string; label: string } | null;
  datesTitle: string;
  datesLead: string;
  dateCols: { date: string; answer: string; shops: string };
  strikeNote: string;
  strikeLink: string;
  strikesLine: { before: string; label: string; after: string };
  othersTitle: string;
  largestLabel: string;
  resortsLabel: string;
  otherEditions: string;
  hubLink: string;
  faqTitle: string;
  guidesTitle: string;
  sourcesTitle: string;
}

export function englishTownCopy(m: SnapshotMunicipality, next: { local: string[] } | null): EnglishTownCopy {
  const name = enName(m);
  const regional = regionalCount(YEAR);
  const own = m.local.length > 0;
  const aran = isAran(m);
  const c = m.correction;

  const lead = own
    ? `${name} has ${count(m.local.length)} local public ${m.local.length === 1 ? "holiday" : "holidays"} in ${YEAR}: ${wdDates(m.local)}. ${m.local.length === 1 ? "It comes" : "They come"} on top of the ${regional} public holidays that apply across Catalonia${aran ? " (in Aran, with the Festa d'Aran in place of one of them)" : ""}, so the town has ${regional + m.local.length} in all, every one of them in the table below.`
    : `In ${name} the local holidays are set village by village rather than for the whole municipality; each village's days are in the table below, on top of the ${regional} public holidays that apply across Catalonia.`;

  const correction = c
    ? `${c.openData.length ? `The Generalitat's open-data table still gives ${dates(c.openData)}` : `The Generalitat's open-data table does not list any local holiday for ${name} yet`}; the official text in the DOGC${amended(m) ? ", as amended in January 2026," : ""} gives ${own ? dates(m.local) : "the days village by village"}, and that is what this page uses.`
    : null;

  const shopsOnLocal = (d: string) => m.shops.includes(d);
  const isBarcelones = m.comarca === "Barcelonès";

  return {
    lead,
    source: `The dates are set by ${ORDER}${amended(m) ? `, as amended by ${AMENDMENT}` : ""}: the Catalan government's list of local holidays, drawn up from each council's proposal.`,
    correction,
    nucleiLead:
      own && m.nuclei.length > 0
        ? `${m.nuclei.length === 1 ? "One village" : "Some villages"} in the municipality ${m.nuclei.length === 1 ? "has" : "have"} local holidays of ${m.nuclei.length === 1 ? "its" : "their"} own: ${joinList(m.nuclei.map((n) => `${n.name} (${dates(n.dates)})`), "en")}.`
        : null,
    statusTitle: `Is today a public holiday in ${name}?`,
    tableTitle: `All public holidays in ${name} in ${YEAR}`,
    tableCaption: `Catalonia-wide and local public holidays in ${name}, ${YEAR}`,
    nucleiTitle: own ? "Villages with holidays of their own" : `Local holidays in each village of ${name}`,
    nucleiCols: { place: "Village", days: `Local holidays ${YEAR}` },
    nextTitle: `Public holidays in ${name} in ${NEXT}`,
    next: next
      ? [`The local holidays in ${name} in ${NEXT} are ${wdDates(next.local)}, on top of Catalonia's ${regionalCount(NEXT)}.`]
      : [
          `Catalonia's ${regionalCount(NEXT)} public holidays for ${NEXT} are already official (Order EMT/52/2026), and they are all in the table below. The local holidays of ${name} for ${NEXT} are not out yet: every year an order of the Catalan government's Department of Enterprise and Labour sets them from each council's proposal, and the one for ${YEAR} appeared in the DOGC on 17 December 2025.`,
          `We will add the ${NEXT} local dates here as soon as the order is published. Until then, do not assume they repeat: councils move their local holidays more often than you might think.`,
        ],
    nextCaption: next ? `Catalonia-wide and local public holidays in ${name}, ${NEXT}` : `Catalonia-wide public holidays, ${NEXT} (local days not yet published)`,
    closesTitle: `What closes on a public holiday in ${name}`,
    shops: {
      title: "Shops",
      lead: m.shopsOwnList
        ? `On Sundays and public holidays, shops on the general timetable may open on only ten days a year, and a council can choose its own. ${name} did (Resolution EMT/4342/2025); in ${YEAR} its ten opening days are:`
        : `On Sundays and public holidays, shops on the general timetable may open on only ten days a year. ${name} is not among the councils that chose their own (Resolution EMT/4342/2025), so the default ten apply: the eight of the general calendar plus 11 January and 8 December (Order EMT/77/2025, articles 1 and 6). In ${YEAR} they are:`,
      local: m.local.map((d) =>
        shopsOnLocal(d)
          ? `${weekdayDayMonth(d, "en")}, a local holiday, is one of those opening days.`
          : `${weekdayDayMonth(d, "en")}, a local holiday, is not one of them: shops on the general timetable stay closed.`,
      ),
      rules: [
        "Whatever the town, they must stay closed on 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September and 25 and 26 December (Llei 18/2017, article 36.2.d).",
        `Allowed to open does not mean open: each shop decides. Bakeries, pastry shops, convenience stores, florists, pharmacies and shops inside stations, among others, are outside these limits, and so are shops in municipalities declared tourist areas, during the approved period (Llei 18/2017, article 37). Whether ${name} has such a declaration, and for which months, is not part of the official calendars this page is built from.`,
      ],
      guide: `Shops open on Sundays and holidays in Catalonia, ${YEAR}`,
    },
    schools: {
      title: "Schools",
      text: `There are no classes on ${name}'s local holidays: the school calendar counts the Catalonia-wide holidays and the town's local ones as days off. Each school also picks four days of its own, so two schools in the same town can close on different days (Order EDF/66/2026).`,
    },
    work: {
      title: "Work",
      text: `Public holidays are paid and are not made up later. A local holiday follows the workplace, not your home: if you work in ${name}, you get its local holidays wherever you live. If you have to work that day, your collective agreement says how it is compensated.`,
    },
    metro: isBarcelones
      ? { title: "Getting around", text: "For how the Barcelona metro runs on public holidays and the nights before them, see", label: "Barcelona metro hours" }
      : null,
    datesTitle: `Is it a public holiday in ${name} on…?`,
    datesLead: `The dates people ask about most, answered for ${name}. Each one links to its page for the whole of Catalonia, with every town that has a local holiday that day.`,
    dateCols: { date: "Date", answer: `In ${name}`, shops: "Shops (general timetable)" },
    strikeNote: "A general strike has been called for that day:",
    strikeLink: "what runs",
    strikesLine: {
      before: "Strikes are a separate matter: a strike does not turn the day into a holiday. What runs and what does not: ",
      label: "strikes in Catalonia today",
      after: ".",
    },
    othersTitle: "Public holidays in other towns",
    largestLabel: "Largest towns",
    resortsLabel: "Resorts",
    otherEditions: `In Catalan and Spanish, the same calendar exists for all ${SNAPSHOT.municipalities.length} towns with local holidays in ${YEAR}.`,
    hubLink: `Catalonia's bank holidays and the ${englishTowns().length} towns in English`,
    faqTitle: "Questions people ask",
    guidesTitle: "More on public holidays",
    sourcesTitle: "Sources",
  };
}

/* -------------------------------------------------------------------------- */
/* Town page: "Is it a holiday in <town> on …?"                               */
/* -------------------------------------------------------------------------- */

export interface TownDateAnswer {
  iso: DatePage;
  answer: string;
  /** One of the yes/no/partly states, for styling. */
  state: "yes" | "no" | "partly";
  shops: string;
  /** A general strike has been called for this day (the date page carries the notice). */
  strike: boolean;
}

const NOV1 = "2026-11-01";
const NOV2 = "2026-11-02";

/** Llei 18/2017, article 36.2.d, fixed-date closing days (Easter Sunday and Monday move, and are left out here). */
const COMPULSORY_CLOSING = new Set(["01-01", "01-06", "05-01", "06-24", "09-11", "12-25", "12-26"]);

/**
 * The eleven date pages, answered for one town from the snapshot: a
 * Catalonia-wide holiday, the town's own local day, a village's, or a working
 * day; and whether shops on the general timetable may open, from the town's
 * own ten opening days (Resolució EMT/4342/2025 or the defaults). The
 * snapshot's opening days are the current year's: a later date is answered
 * only when the law closes shops on it whatever the town (1 and 6 January).
 */
export function townDateAnswers(m: SnapshotMunicipality): TownDateAnswer[] {
  const name = enName(m);
  return DATE_PAGES.map((iso) => {
    const regional = regionalDays(Number(iso.slice(0, 4)), isAran(m)).find((d) => d.date === iso);
    const villages = m.nuclei.filter((n) => n.dates.includes(iso)).map((n) => n.name);
    const sunday = weekdayName(iso, "en") === "Sunday";
    const strike = Boolean(dateContent(iso, "en").notice);
    const opening = Number(iso.slice(0, 4)) === YEAR && m.shops.includes(iso);
    const known = Number(iso.slice(0, 4)) === YEAR || COMPULSORY_CLOSING.has(iso.slice(5));
    const closedShops = opening
      ? "May open: one of its ten opening days"
      : known
        ? "Stay closed, except exempt shops"
        : `Opening days for ${iso.slice(0, 4)} not covered here`;

    if (regional) return { iso, state: "yes", answer: `Yes: ${regional.name.en}, across Catalonia.`, shops: closedShops, strike };
    if (m.local.includes(iso)) return { iso, state: "yes", answer: `Yes: one of ${name}'s local holidays.`, shops: closedShops, strike };
    if (villages.length > 0) {
      return {
        iso,
        state: "partly",
        answer: `Only in ${joinList(villages, "en")}, where it is a local holiday; a working day in the rest of ${name}.`,
        shops: opening ? "May open: one of its ten opening days" : `Usual hours outside ${joinList(villages, "en")}`,
        strike,
      };
    }
    if (iso === NOV1) {
      const monday = m.local.includes(NOV2) ? ` Monday 2 November is a local holiday in ${name}.` : " Nor is Monday 2 November.";
      return { iso, state: "no", answer: `No: a Sunday, and not one of Catalonia's official holidays this year.${monday}`, shops: closedShops, strike };
    }
    return { iso, state: "no", answer: `No: a working day in ${name}.`, shops: sunday ? closedShops : "Usual hours", strike };
  });
}

/* -------------------------------------------------------------------------- */
/* Town page: questions in the searchers' words                               */
/* -------------------------------------------------------------------------- */

export interface EnglishFaqItem {
  question: string;
  answer: string;
}

/**
 * "is today a holiday in sitges", "is tomorrow a bank holiday in barcelona",
 * "salou public holidays 2026", "bank holidays catalonia 2027", "are shops
 * open on public holidays in lloret": answered from the snapshot. Fixed
 * questions, no date picked from the build day, so the answers never go
 * stale before the data does.
 */
export function englishTownFaq(m: SnapshotMunicipality, next: { local: string[] } | null): EnglishFaqItem[] {
  const name = enName(m);
  const own = m.local.length > 0;
  const aran = isAran(m);
  const regional2026 = regionalDays(YEAR, aran);
  const regionalNext = regionalDays(NEXT, aran);
  const locals = own ? `its ${count(m.local.length)} local ${m.local.length === 1 ? "holiday" : "holidays"}, ${wdDates(m.local)}` : "the local holidays of each village, listed in the table";

  return [
    {
      question: `Is today a public holiday in ${name}?`,
      answer: `The box at the top of this page works it out from today's date in Catalan time. In ${YEAR} ${name} has Catalonia's ${regional2026.length} public holidays${aran ? " (with the Festa d'Aran)" : ""} and ${locals}.`,
    },
    {
      question: `Is tomorrow a holiday in ${name}?`,
      answer: `The "Tomorrow" line in the same box says so, along with the next holiday and how many days away it is. Tomorrow is a holiday in ${name} only if it is one of the dates in the ${YEAR} table: Catalonia's ${regional2026.length} or the town's local holidays.`,
    },
    {
      question: `What are the public holidays in ${name} in ${YEAR}?`,
      answer: `${own ? `The local holidays are ${wdDates(m.local)}` : "The local holidays are set village by village"}, under Order EMT/208/2025${amended(m) ? " as amended by Order EMT/3/2026" : ""}. On top of them come Catalonia's ${regional2026.length}: ${dates(regional2026.map((d) => d.date))}.`,
    },
    {
      question: `What are the bank holidays in ${name} in ${NEXT}?`,
      answer: next
        ? `The local holidays are ${wdDates(next.local)}, and Catalonia's ${regionalNext.length} are ${dates(regionalNext.map((d) => d.date))}.`
        : `Catalonia's ${regionalNext.length} public holidays for ${NEXT} are official (Order EMT/52/2026): ${dates(regionalNext.map((d) => d.date))}. The local holidays of ${name} for ${NEXT} have not been published yet; the order for ${YEAR} came out on 17 December 2025.`,
    },
    {
      question: `Are shops open on public holidays in ${name}?`,
      answer: `Shops on the general timetable may open on only ten Sundays and public holidays a year. In ${name} in ${YEAR} they are ${dates(m.shops)}. Bakeries, pastry shops, convenience stores, florists and pharmacies, among others, are outside these limits (Llei 18/2017, article 37).`,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* English hub                                                                */
/* -------------------------------------------------------------------------- */

export function englishHubCopy() {
  const towns = englishTowns();
  const without = englishWithoutDays();
  const named = ["Barcelona", "Sitges", "Salou"];
  const others = towns.length - named.length;
  const aranLine = [YEAR, NEXT]
    .map((year) => {
      const swap = aranSwap(year);
      if (!swap) return null;
      const replaced = regionalDays(year).find((d) => d.date === swap.replaces);
      return replaced ? `in ${year} it replaces ${weekdayDayMonth(swap.replaces, "en")}, ${replaced.name.en}` : null;
    })
    .filter(Boolean);
  const withoutNames = joinList(without.map((e) => enName(e)), "en");

  return {
    title: fit([`Catalonia bank holidays ${YEAR} and ${NEXT}, town by town`, `Catalonia bank holidays ${YEAR} and ${NEXT}`], TITLE_MAX),
    description: fit(
      [
        `Catalonia's ${regionalCount(YEAR)} bank holidays in ${YEAR} and ${NEXT}, and the local holidays of ${joinList([...named, `${others} more towns`], "en")}, from the official gazette (DOGC).`,
        `Catalonia's bank holidays in ${YEAR} and ${NEXT}, and the local holidays of ${named.join(", ")} and ${others} more towns.`,
      ],
      DESCRIPTION_MAX,
    ),
    named,
    h1: `Public holidays in Catalonia ${YEAR} and ${NEXT}, town by town`,
    breadcrumb: "Public holidays",
    lead: `Catalonia has ${regionalCount(YEAR)} public holidays (bank holidays) a year that apply everywhere, and every town adds local holidays of its own, usually two. Here are the Catalonia-wide dates for ${YEAR} and ${NEXT}, and the ${YEAR} local holidays of ${towns.length} towns: the largest cities and the main resorts. Each town has a page of its own, with every holiday of the year, whether today is a holiday there and the Sundays and holidays when shops may open.`,
    regionalTitle: (year: number) => `Catalonia-wide public holidays in ${year}`,
    regionalCaption: (year: number) => `The ${regionalCount(year)} public holidays across Catalonia, ${year} (${year === YEAR ? "Order EMT/66/2025" : "Order EMT/52/2026"})`,
    aran: aranLine.length ? `In Aran one of these days is swapped for the Festa d'Aran on 17 June: ${aranLine.join("; ")}.` : null,
    townsTitle: `Local holidays in ${YEAR}, town by town`,
    townsLead: `Each town's local holidays come on top of the Catalonia-wide days above. Dates from ${ORDER}, as amended by ${AMENDMENT}.`,
    largestTitle: "Largest towns",
    resortsTitle: "Resorts",
    cols: { town: "Town", comarca: "Comarca", days: `Local holidays ${YEAR}` },
    withoutDays: without.length
      ? without.length === 1
        ? `${withoutNames}, one of the selected towns, has no local holidays in the ${YEAR} order: the order lists it as "proposta no formulada" (the council made no proposal in time), and the January 2026 amendment did not change that, so it has no page.`
        : `${withoutNames}, among the selected towns, have no local holidays in the ${YEAR} order: the order lists them as "proposta no formulada" (the councils made no proposal in time), and the January 2026 amendment did not change that, so they have no page.`
      : null,
    selection: {
      before: `The towns are the ${EN_LARGEST} largest by population on 1 January ${SNAPSHOT.sources.population.year} (Idescat), the four provincial capitals among them, and the ${EN_RESORTS.length} with the most places in the Generalitat's `,
      label: "register of tourist accommodation",
      href: TOURISM_REGISTER.url,
      after: " (hotels, campsites, rural tourism, tourist flats and homes). They are the same towns as our ",
      electionsLabel: "election results in English",
    },
    editions: `The Catalan and Spanish editions cover all ${SNAPSHOT.municipalities.length} towns with local holidays in ${YEAR}, with a table for each comarca:`,
    next: `The local holidays for ${NEXT} have not been published yet; the order for ${YEAR} appeared in the DOGC on 17 December 2025.`,
    datesTitle: "Is it a public holiday on…?",
    guidesTitle: "More on public holidays",
    sourcesTitle: "Sources",
  };
}

export type EnglishHubCopy = ReturnType<typeof englishHubCopy>;
