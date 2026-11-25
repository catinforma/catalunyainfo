import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { POSTAL_29N } from "@/lib/content/batch02/postal-vote";
import type { ReturnFamily, ReturnPosition, ReturnTarget } from "@/lib/analytics/events";
import type { Locale } from "@/lib/i18n/config";
import { WHATSAPP_CHANNEL_URL } from "@/lib/share/channel";

import { CATALONIA_STRIKE_KEYS, DECEMBER_BRIDGE_LAST_DAY, ELECTION_KEYS, SPAIN_STRIKE_KEYS, STRIKE_11N_SPAIN_KEY_PREFIX, b2KeyForHref } from "./next-step";
import { pathOnly } from "./next-step-core";
import { townCalendarLink } from "./town-hub";

/**
 * The "keep it" block of the strike and election pages (25 Nov 2026), the
 * redesign of the "next useful step" box for readers who came for one event.
 *
 * Why (GA4 28 Oct - 24 Nov 2026, docs/SEO_EXPERIMENTS.md has the baseline):
 * 83.5 % of the clicks land on strike and election pages, 1.09 pages per
 * session, 8.5 % returning sessions, and the old box (a list of long page
 * titles) got 0.4 clicks per 100 sessions. An event reader needs something
 * they can reuse after the event: an alert for the next one, their town's
 * calendar, "is today a holiday?", the strikes hub. So the block is one
 * compact card right after the answer: the WhatsApp channel button (the
 * alert), and at most two short links.
 *
 * Rules:
 *  - Links only, no fact of its own; every target is a path the site builds
 *    (tests/return-step.test.ts resolves them). The WhatsApp link is the
 *    channel URL as it is: it leaves the site, so a utm on it would measure
 *    nothing (visits that come back from the channel carry the utm of the
 *    channel's own posts, lib/share/channel-message.ts).
 *  - The channel posts are in Catalan: the button says so in es and en.
 *  - Server-rendered (components/ReturnStep.tsx), no state: no layout shift.
 *  - Dated choices read the `today` the page already renders with.
 *  - Clicks: `next_step_click` (block position, target type) plus the
 *    WhatsApp link's own `whatsapp_channel_click` (lib/analytics/clicks.ts).
 */

export interface ReturnLink {
  href: string;
  label: string;
  target: ReturnTarget;
}

export interface ReturnStep {
  family: ReturnFamily;
  position: ReturnPosition;
  whatsapp: { href: string; label: string; note: string };
  /** One or two short links. */
  links: ReturnLink[];
}

export const RETURN_MAX_LINKS = 2;

/** The block's accessible name. */
export const RETURN_STEP_TITLE: Record<Locale, string> = {
  ca: "Per tornar-hi sense buscar",
  es: "Para volver sin buscar",
  en: "Come back without searching",
};

const WHATSAPP_NOTE: Record<Locale, string> = {
  ca: "Canal de WhatsApp · cada matí",
  es: "Canal de WhatsApp en catalán",
  en: "WhatsApp channel, in Catalan",
};

/** The 29N election day (a test holds it equal to POSTAL_29N.election). */
const ELECTION_DAY = POSTAL_29N.election;

/** The button's words: the next strike on strike pages; the 29N and the strikes on election pages until polling day. */
export function whatsappLabel(family: ReturnFamily, locale: Locale, today: string): string {
  if (family === "strikes") {
    return { ca: "Avisa'm de la pròxima vaga", es: "Avísame de la próxima huelga", en: "Alert me to the next strike" }[locale];
  }
  if (today <= ELECTION_DAY) {
    return { ca: "Avisa'm del 29N i vagues", es: "Avísame del 29N y huelgas", en: "Alert me to 29N and strikes" }[locale];
  }
  return { ca: "Avisa'm de vagues i festius", es: "Avísame de huelgas y festivos", en: "Strike and holiday alerts" }[locale];
}

/**
 * Short anchors: the two links must share one line at 360 px (about 295 px of
 * text room, 14 px bold), which the targets' own titles do not allow. Each
 * says what the target answers; tests/return-step.test.ts caps their length.
 */
const SHORT: Record<"holidayToday" | "strikesHub" | "strikesSpain" | "decemberBridge" | "townCalendar", Record<Locale, string>> = {
  holidayToday: { ca: "Festiu avui o demà?", es: "¿Festivo hoy?", en: "Holiday today?" },
  strikesHub: { ca: "Vagues d'avui", es: "Huelgas de hoy", en: "Strikes today" },
  strikesSpain: { ca: "Vagues a Espanya", es: "Huelgas en España", en: "Strikes in Spain" },
  decemberBridge: { ca: "Pont de desembre", es: "Puente de diciembre", en: "December long weekend" },
  townCalendar: { ca: "Festius al calendari", es: "Calendario de festivos", en: "Holidays calendar" },
};

const link = (key: B2Key, locale: Locale, target: ReturnTarget, label?: string): ReturnLink => ({
  href: b2href(key, locale),
  label: label ?? B2_TITLES[key][locale],
  target,
});

const holidayToday = (locale: Locale): ReturnLink => link("holidayToday", locale, "holiday_today", SHORT.holidayToday[locale]);
const strikesCatalonia = (locale: Locale): ReturnLink => link("strikes", locale, "strikes_hub", SHORT.strikesHub[locale]);
const strikesSpain = (locale: Locale): ReturnLink => link("strikesSpain", locale, "strikes_spain_hub", SHORT.strikesSpain[locale]);

/** Never the page itself, no repeats, at most RETURN_MAX_LINKS. */
function build(
  family: ReturnFamily,
  position: ReturnPosition,
  locale: Locale,
  self: string,
  today: string,
  candidates: (ReturnLink | null)[],
): ReturnStep {
  const seen = new Set<string>([pathOnly(self)]);
  const links: ReturnLink[] = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const path = pathOnly(candidate.href);
    if (seen.has(path)) continue;
    seen.add(path);
    links.push(candidate);
    if (links.length >= RETURN_MAX_LINKS) break;
  }
  return { family, position, whatsapp: { href: WHATSAPP_CHANNEL_URL, label: whatsappLabel(family, locale, today), note: WHATSAPP_NOTE[locale] }, links };
}

/**
 * A content page (EntryArticle): the strike pages (Catalonia, Spain, the 11N
 * Spain and city pages) and the election guides. Null off those families.
 * Catalonia: "is today a holiday?" and the strikes hub; Spain: the Spain
 * strikes calendar and, while the December long weekend is ahead, its page.
 */
export function returnStepForEntry(entry: { href: string; key?: string | null; locale: Locale }, today: string): ReturnStep | null {
  const { href, locale } = entry;
  if (entry.key?.startsWith(STRIKE_11N_SPAIN_KEY_PREFIX)) return spainStrikeStep(locale, href, today);
  const key = b2KeyForHref(href);
  if (!key) return null;
  if (CATALONIA_STRIKE_KEYS.includes(key)) {
    return build("strikes", "after_answer", locale, href, today, [holidayToday(locale), strikesCatalonia(locale), strikesSpain(locale)]);
  }
  if (SPAIN_STRIKE_KEYS.includes(key)) return spainStrikeStep(locale, href, today);
  if (ELECTION_KEYS.includes(key)) {
    return build("elections", "after_answer", locale, href, today, [holidayToday(locale), strikesCatalonia(locale)]);
  }
  return null;
}

function spainStrikeStep(locale: Locale, self: string, today: string): ReturnStep {
  const december = today <= DECEMBER_BRIDGE_LAST_DAY ? link("decemberBridgeSpain", locale, "spain_holidays", SHORT.decemberBridge[locale]) : null;
  return build("strikes", "after_answer", locale, self, today, [strikesSpain(locale), december, strikesCatalonia(locale)]);
}

/** A town's election page: its holiday calendar when the town has the full holiday page, then "is today a holiday?". */
export function returnStepForElectionTown(slug: string, locale: Locale, self: string, today: string): ReturnStep {
  const calendar = townCalendarLink(slug, locale);
  return build("elections", "after_answer", locale, self, today, [
    calendar ? { href: calendar.href, label: SHORT.townCalendar[locale], target: "town_calendar" } : null,
    holidayToday(locale),
    strikesCatalonia(locale),
  ]);
}

/** The election hub and the comarca pages: after their intro. */
export function returnStepForElectionHub(locale: Locale, self: string, today: string): ReturnStep {
  return build("elections", "after_intro", locale, self, today, [holidayToday(locale), strikesCatalonia(locale)]);
}
