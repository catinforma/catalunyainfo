/**
 * The daily post for the WhatsApp channel, in Catalan, ready to paste.
 *
 * WhatsApp has no API for posting to a channel, so the owner pastes this by
 * hand every morning from a private page (`/canal/<token>/` on the phone, or
 * `/admin/canal/` through the SSH tunnel). It is built only from data the site
 * already shows as verified, for the date it is about, through the same
 * functions as "Avui a Catalunya" (lib/programmatic/today/logic.ts):
 *
 *   holidays   holidayData(): the Generalitat's calendar + every town's local
 *              days (a local holiday counts only in a town of 50,000+)
 *   strikes    todayStrikes(): STRIKES as of STRIKES_AS_OF; nothing at all once
 *              the list is more than a week old (the daily page then says it
 *              may have moved; a post cannot carry that caveat)
 *   election   the 29N line of the sitewide alert strip (lib/alerts/news-alerts.ts)
 *   weekend    weekendFor(), the weekend agenda's own rule (Thursdays)
 *   live       fuel medians and the reservoir total, read when the page is
 *              opened (channel-live.ts), today's post only, each with its date
 *   quiet day  one of the homepage's seasonal pages (home-tools SEASONAL),
 *              never a made-up headline
 *
 * Pure: no clock, no network. Every function takes the date it writes for.
 *
 * Links carry `utm_source=whatsapp&utm_medium=channel&utm_campaign=daily` so
 * GA4 attributes the visits (Acquisition > Traffic acquisition, session
 * source / medium "whatsapp / channel"). The pages' canonical tags are built
 * from the path alone (lib/seo/metadata.ts) and robots.txt disallows query
 * strings, so the tagged URLs never compete with the clean ones; Cloudflare
 * caches only query-less URLs, so these are served from the origin's ISR copy.
 */

import { PATHS as TOOL_PATHS, SEASONAL, type ToolKey } from "@/lib/content/home-tools";
import { addDays, capitalize, dayMonth, daysBetween, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import {
  formatRange,
  holidayDay,
  inSeason,
  joinList,
  nextRegional,
  strikesListStale,
  strikesOn,
  weekday,
  weekendFor,
  type HolidayData,
  type LocalPlace,
  type TodayStrike,
} from "@/lib/programmatic/today/logic";
import { SITE } from "@/lib/site";

/** The three UTM parameters every link in the post carries. */
export const CHANNEL_UTM = "utm_source=whatsapp&utm_medium=channel&utm_campaign=daily";

/** WhatsApp folds long posts; the owner asked for 4–7 short lines. */
export const MIN_LINES = 4;
export const MAX_LINES = 7;

/** Within this many days, the next strike on the list gets a heads-up line. */
export const NEXT_STRIKE_DAYS = 7;

/** Towns named in a local-holiday line before "i N llocs més". */
const LOCAL_SHOWN = 3;

/**
 * A local holiday is news only where many people live: almost every day some
 * village has one. Towns of at least this population (the holiday snapshot's
 * INE figure; about 23 towns) make the line, and the link, on their own.
 */
export const MAJOR_TOWN_POPULATION = 50_000;

/**
 * A site path to the absolute URL the post carries: production host, trailing
 * slash, the UTM query, and the path's #anchor kept after the query.
 * `content` (utm_content) tells two links of one post apart in GA4.
 */
export function channelUrl(path: string, content?: string): string {
  const [beforeHash = "/", hash] = path.split("#");
  const [clean = "/"] = beforeHash.split("?");
  const withSlash = clean.endsWith("/") ? clean : `${clean}/`;
  const query = content ? `${CHANNEL_UTM}&utm_content=${encodeURIComponent(content)}` : CHANNEL_UTM;
  return `${SITE.productionOrigin}${withSlash.startsWith("/") ? "" : "/"}${withSlash}?${query}${hash ? `#${hash}` : ""}`;
}

/** Facts read live when today's post is generated; each is dated by its source. */
export interface ChannelLive {
  /** Median €/l over every station in Catalonia, Ministry data; `time` "HH:MM". */
  fuel?: { e95: number | null; goa: number | null; count: number; time: string } | null;
  /** ACA total, with how old the reading is ("lectura de l'ACA d'ahir"). */
  reservoirs?: { percent: number; when: string } | null;
}

/** Labels of the seasonal pages (the homepage strip's own titles and blurbs). */
export type SeasonalLabels = Partial<Record<ToolKey, { title: string; desc: string }>>;

export interface ChannelInput {
  /** The day the post is for (YYYY-MM-DD, Catalan civil date). */
  date: string;
  holidays: HolidayData;
  strikes: readonly TodayStrike[];
  strikesAsOf: string;
  /** The election day and the window the alert strip shows it in (ISO instants). */
  election: { day: string; start: string; end: string; href: string } | null;
  links: {
    /** "És festiu avui?" guide, when a date has no page of its own. */
    holidayToday: string;
    weekendHub: string;
  };
  seasonal: SeasonalLabels;
  /** Municipalities of at least MAJOR_TOWN_POPULATION, by name. */
  majorTowns: ReadonlySet<string>;
  live?: ChannelLive;
}

export interface ChannelMessage {
  date: string;
  /** What gets pasted. */
  text: string;
  lines: string[];
  /** The post's main link (with UTM). */
  link: string;
  /** False on a quiet day: then the link is a seasonal page. */
  notable: boolean;
  /** For the owner only, never in the post: what to check before pasting. */
  warnings: string[];
}

/** The major towns among `places` (municipalities, not nuclei), largest first as listed. */
function majorPlaces(places: readonly LocalPlace[], major: ReadonlySet<string>): LocalPlace[] {
  return places.filter((place) => place.p === null && major.has(place.n));
}

/** "Girona, Terrassa i 5 llocs més": the major towns, then how many other places. */
function localList(major: readonly LocalPlace[], all: readonly LocalPlace[]): string {
  const names = major.slice(0, LOCAL_SHOWN).map((place) => place.n);
  const rest = all.length - names.length;
  if (rest <= 0) return joinList(names, "ca");
  return `${names.join(", ")} i ${rest} ${rest === 1 ? "lloc" : "llocs"} més`;
}

/** "1,489 €/l". */
function euros(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat("ca-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value)} €/l`;
}

/** "38,5 %". */
function percent(value: number): string {
  return `${new Intl.NumberFormat("ca-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} %`;
}

/** Midday in Madrid on `date`, as an instant: inside the date whatever the offset. */
const middayOf = (date: string) => Date.parse(`${date}T11:00:00Z`);

/**
 * The seasonal page for a quiet day: one of the homepage strip's seasonal
 * pages in season on `date`, rotating day by day so a quiet week does not
 * link the same page every morning. Null out of every season.
 */
export function seasonalPick(date: string, labels: SeasonalLabels): { key: ToolKey; path: string; title: string; desc: string } | null {
  const keys = SEASONAL.filter((s) => inSeason(date, s.from, s.to) && labels[s.key]).map((s) => s.key);
  if (keys.length === 0) return null;
  const key = keys[daysBetween("2026-01-01", date) % keys.length]!;
  const label = labels[key]!;
  return { key, path: `/ca/${TOOL_PATHS[key].ca}/`, title: label.title, desc: label.desc };
}

/**
 * A line of the post: the lowest `priority` lines are kept when there is no
 * room for all, and the kept ones are printed by `order` (today first, then
 * tomorrow, then what comes later, then the live figures).
 */
type Fact = { text: string; priority: number; order: number };

const ORDER = { today: 10, strikeToday: 20, ongoing: 25, election: 28, tomorrow: 30, nextStrike: 40, nextHoliday: 45, fuel: 50, reservoirs: 55 } as const;

export function buildChannelMessage(input: ChannelInput): ChannelMessage {
  const { date, holidays } = input;
  const tomorrow = addDays(date, 1);
  const warnings: string[] = [];
  const facts: Fact[] = [];
  /** The main link, by the most important notable thing found (lowest rank). */
  const candidates: { path: string; label: string; rank: number }[] = [];
  const datePage = (iso: string) => holidays.datePages[iso]?.href ?? input.links.holidayToday;

  /* Holidays --------------------------------------------------------------- */
  const day = holidayDay(date, holidays);
  const next = holidayDay(tomorrow, holidays);
  let holidayToday = false;
  if (!day.regionalKnown) {
    warnings.push(`El calendari oficial de festius de ${date.slice(0, 4)} no és a les dades: el missatge no en diu res.`);
  } else if (day.regional) {
    holidayToday = true;
    facts.push({ text: `🎉 Avui és festiu a tot Catalunya: ${day.regional.n}.${day.regional.xa ? " A l'Aran, no." : ""}`, priority: 0, order: ORDER.today });
    candidates.push({ path: datePage(date), label: "On és festiu avui", rank: 2 });
  } else if (day.aranOnly) {
    holidayToday = true;
    facts.push({ text: `Avui és festiu només a l'Aran (${day.aranOnly.n}).`, priority: 1, order: ORDER.today });
  }
  const majorToday = day.localKnown ? majorPlaces(day.local, input.majorTowns) : [];
  if (day.regionalKnown && !day.regional && majorToday.length > 0) {
    holidayToday = true;
    facts.push({ text: `📍 Festa local avui a ${localList(majorToday, day.local)}.`, priority: 1, order: ORDER.today });
    candidates.push({ path: datePage(date), label: "On és festiu avui", rank: 5 });
  }
  const majorTomorrow = next.localKnown ? majorPlaces(next.local, input.majorTowns) : [];
  if (next.regionalKnown && next.regional) {
    facts.push({ text: `Demà és festiu a tot Catalunya: ${next.regional.n}.`, priority: 1, order: ORDER.tomorrow });
    candidates.push({ path: datePage(tomorrow), label: "On és festiu demà", rank: 6 });
  } else if (next.regionalKnown && majorTomorrow.length > 0) {
    facts.push({ text: `Demà és festa local a ${joinList(majorTomorrow.slice(0, LOCAL_SHOWN).map((p) => p.n), "ca")}.`, priority: 4, order: ORDER.tomorrow });
    candidates.push({ path: datePage(tomorrow), label: "On és festiu demà", rank: 7 });
  }

  /* Strikes ---------------------------------------------------------------- */
  const stale = strikesListStale(date, input.strikesAsOf);
  let strikeToday = false;
  let anyStrikeToday = false;
  if (stale) {
    warnings.push(
      `La llista de vagues és del ${dayMonth(input.strikesAsOf, "ca")} (fa més d'una setmana): el missatge no diu res de vagues fins que es revisi.`,
    );
  } else {
    const now = strikesOn(date, input.strikes);
    const then = strikesOn(tomorrow, input.strikes).filter((s) => !s.indefinite);
    anyStrikeToday = now.length > 0;
    for (const strike of now) {
      if (strike.indefinite) {
        facts.push({ text: `Continua la ${strike.title}.`, priority: 3, order: ORDER.ongoing });
      } else {
        strikeToday = true;
        facts.push({ text: `⚠️ Avui hi ha ${strike.title}. ${strike.ms}.`, priority: 0, order: ORDER.strikeToday });
        candidates.push({ path: strike.href, label: "Què funciona i serveis mínims", rank: 0 });
      }
    }
    for (const strike of then) {
      facts.push({ text: `⚠️ Demà hi ha ${strike.title}. ${strike.ms}.`, priority: 1, order: ORDER.tomorrow });
      candidates.push({ path: strike.href, label: "Què funciona i serveis mínims", rank: 3 });
    }
    if (then.length === 0) {
      const upcoming = input.strikes
        .filter((s) => !s.indefinite)
        .flatMap((s) => s.dates.filter((d) => d > tomorrow).map((d) => ({ strike: s, date: d })))
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      if (upcoming && daysBetween(date, upcoming.date) <= NEXT_STRIKE_DAYS) {
        facts.push({ text: `Propera vaga, ${weekdayDayMonth(upcoming.date, "ca")}: ${upcoming.strike.title}.`, priority: 4, order: ORDER.nextStrike });
      }
    }
    if (date > input.strikesAsOf) {
      warnings.push(`Vagues: llista revisada el ${dayMonth(input.strikesAsOf, "ca")}. Si saps d'algun canvi, no publiquis la línia de vagues.`);
    }
  }

  /* Election (the alert strip's line) ------------------------------------ */
  const election = input.election;
  if (election && middayOf(date) >= Date.parse(election.start) && middayOf(date) < Date.parse(election.end)) {
    const inDays = daysBetween(date, election.day);
    if (inDays === 0) {
      facts.push({ text: "🗳️ Avui hi ha eleccions generals.", priority: 0, order: ORDER.today });
      candidates.push({ path: election.href, label: "On i com votar", rank: 1 });
    } else if (inDays === 1) {
      facts.push({ text: `🗳️ Demà, ${weekdayDayMonth(election.day, "ca")}, hi ha eleccions generals.`, priority: 1, order: ORDER.tomorrow });
      candidates.push({ path: election.href, label: "On i com votar", rank: 4 });
    } else if (inDays > 1) {
      facts.push({ text: `🗳️ Eleccions generals el ${weekdayDayMonth(election.day, "ca")}, d'aquí a ${inDays} dies.`, priority: inDays <= 3 ? 4 : 7, order: ORDER.election });
    }
  }

  /* The plain answer when nothing big happens today ----------------------- */
  // On a strike or election day that is the news; "not a holiday" would only push it down.
  const bigToday = strikeToday || (election !== null && election.day === date);
  if (day.regionalKnown && !holidayToday && !bigToday) {
    const noStrike = !stale && !anyStrikeToday;
    facts.push({
      text: noStrike ? "Avui no és festiu a Catalunya i no hi ha cap vaga a la nostra llista." : "Avui no és festiu a Catalunya.",
      priority: 2,
      order: ORDER.today,
    });
  } else if (!day.regionalKnown && !stale && !anyStrikeToday) {
    facts.push({ text: "Avui no hi ha cap vaga a la nostra llista.", priority: 2, order: ORDER.today });
  }
  if (day.regionalKnown && !next.regional) {
    const coming = nextRegional(tomorrow, holidays);
    if (coming) {
      facts.push({
        text: `Proper festiu a tot Catalunya: ${coming.day.n}, ${weekdayDayMonth(coming.day.d, "ca")}.`,
        priority: coming.inDays <= 7 ? 4 : 8,
        order: ORDER.nextHoliday,
      });
    }
  }

  /* Live facts, today's post only ---------------------------------------- */
  const live = input.live;
  if (live?.fuel && live.fuel.count > 0) {
    facts.push({
      text: `Gasolina 95: ${euros(live.fuel.e95)} · gasoil: ${euros(live.fuel.goa)} (mediana de ${new Intl.NumberFormat("ca-ES").format(live.fuel.count)} benzineres, Ministeri, ${live.fuel.time} h).`,
      priority: 5,
      order: ORDER.fuel,
    });
  }
  if (live?.reservoirs) {
    facts.push({ text: `Embassaments: ${percent(live.reservoirs.percent)} de capacitat (${live.reservoirs.when}).`, priority: 6, order: ORDER.reservoirs });
  }

  /* Assemble -------------------------------------------------------------- */
  const header = `*Avui a Catalunya* · ${weekdayDayMonth(date, "ca")}`;
  const notable = candidates.length > 0;
  const main = [...candidates].sort((a, b) => a.rank - b.rank)[0];

  const tail: string[] = [];
  let link: string;
  if (main) {
    link = channelUrl(main.path);
    tail.push(`👉 ${main.label}: ${link}`);
  } else {
    const pick = seasonalPick(date, input.seasonal);
    if (pick) {
      link = channelUrl(pick.path);
      tail.push(`💡 ${pick.title}. ${capitalize(pick.desc)}`);
      tail.push(`👉 ${link}`);
    } else {
      link = channelUrl("/ca/avui/");
      tail.push(`👉 El dia, punt per punt: ${link}`);
    }
  }

  // Thursdays: the weekend ahead, on the weekend agenda's own dates.
  if (weekday(date) === 4) {
    const span = weekendFor(date, holidays);
    const range = formatRange(span.from, span.to, "ca");
    tail.push(`🗓️ Cap de setmana${span.long ? " llarg" : ""} (${range}): fires i mercats per zones ${channelUrl(input.links.weekendHub, "weekend")}`);
  }

  const room = Math.max(0, MAX_LINES - 1 - tail.length);
  const body = facts
    .map((fact, index) => ({ ...fact, index }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .slice(0, room)
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map((fact) => fact.text);

  const lines = [header, ...body, ...tail];
  if (lines.length < MIN_LINES) warnings.push(`Només ${lines.length} línies: avui no hi ha més dades verificades.`);
  if (facts.length > room) warnings.push(`${facts.length - room} línia/es secundàries s'han deixat fora per no passar de ${MAX_LINES}.`);

  return { date, text: lines.join("\n"), lines, link, notable, warnings };
}
