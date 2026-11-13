/**
 * Puts together the WhatsApp channel post's input from the site's own
 * modules (no new data): the "Avui a Catalunya" lists, the alert strip's
 * election line, the homepage's seasonal pages and the weekend hub.
 */

import { NEWS_ALERTS, alertHref } from "@/lib/alerts/news-alerts";
import { getMessages } from "@/lib/i18n/index";
import { GENERAL_ELECTION_DAY } from "@/lib/programmatic/elections/today";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { HOLIDAY_SNAPSHOT, STRIKES_AS_OF, holidayData, todayStrikes } from "@/lib/programmatic/today/data";
import { weekendHubPath } from "@/lib/programmatic/weekend/paths";

import {
  MAJOR_TOWN_POPULATION,
  buildChannelMessage,
  type ChannelInput,
  type ChannelLive,
  type ChannelMessage,
  type SeasonalLabels,
} from "./channel-message";

/** The alert strip's 29N line (lib/alerts/news-alerts.ts); the post stops naming it once it is gone there. */
export const ELECTION_ALERT_ID = "election-29n";

/** The homepage strip's title and blurb of every tool, in Catalan. */
function seasonalLabels(): SeasonalLabels {
  const tools = getMessages("ca").home.tools as unknown as Record<string, unknown>;
  const out: SeasonalLabels = {};
  for (const [key, value] of Object.entries(tools)) {
    const v = value as { title?: unknown; desc?: unknown } | null;
    if (v && typeof v === "object" && typeof v.title === "string" && typeof v.desc === "string") {
      out[key as keyof SeasonalLabels] = { title: v.title, desc: v.desc };
    }
  }
  return out;
}

/** Municipalities of at least MAJOR_TOWN_POPULATION, by the name the holiday lists use. */
export function majorTowns(): Set<string> {
  return new Set(HOLIDAY_SNAPSHOT.municipalities.filter((m) => m.population >= MAJOR_TOWN_POPULATION).map((m) => m.name));
}

export function channelInput(date: string, live?: ChannelLive): ChannelInput {
  const alert = NEWS_ALERTS.find((a) => a.id === ELECTION_ALERT_ID);
  return {
    date,
    holidays: holidayData("ca"),
    strikes: todayStrikes("ca"),
    strikesAsOf: STRIKES_AS_OF,
    election: alert ? { day: GENERAL_ELECTION_DAY, start: alert.start, end: alert.end, href: alertHref(alert, "ca") } : null,
    links: { holidayToday: GUIDES.holidayToday.ca, weekendHub: weekendHubPath("ca") },
    seasonal: seasonalLabels(),
    majorTowns: majorTowns(),
    ...(live ? { live } : {}),
  };
}

/** The post for `date`, with live facts when given (today's post only). */
export function channelMessage(date: string, live?: ChannelLive): ChannelMessage {
  return buildChannelMessage(channelInput(date, live));
}
