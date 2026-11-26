/**
 * The analytics contract.
 *
 * One typed list of events, one `track()` entry point. Anything not in this
 * list cannot be sent, which is what keeps GA4 from filling up with ad-hoc
 * event names that nobody can interpret six months later.
 *
 * Rules, enforced by the shape of the types below:
 *  - no personal data, ever: no email, no name, no free-text search term tied
 *    to a session, no IP, no user id;
 *  - no full URLs with query strings as parameter values;
 *  - parameter names follow GA4 snake_case so they map cleanly to custom
 *    dimensions without a transformation layer.
 *
 * Validation plan once GA4 is connected: DebugView for the shape of each
 * event, then Realtime for delivery, then a 48-hour check that the custom
 * dimensions registered in the property are populated. See docs/ANALYTICS.md.
 */

export type AnalyticsEvent =
  | { name: "article_view"; params: ContentParams }
  | { name: "news_view"; params: ContentParams }
  // Fired once by the results page (SearchAnalytics.tsx). The term itself is
  // never sent: enhanced measurement's `view_search_results` already carries
  // it, and this event adds what that one lacks, the number of results.
  | { name: "internal_search"; params: { search_term_length: number; results_count: number; locale: string } }
  // 18 Nov 2026: a click on one of our own pages from an onward-links box
  // (the "next useful step", components/NextStep.tsx). `link_context` is the
  // registered dimension the other link events use; `link_url` is the target
  // path (no origin, query or hash), read by GA4's built-in "Link URL"; the
  // page it was clicked on is GA4's own page path.
  | { name: "related_content_click"; params: { link_context: RelatedLinkContext; link_url: string; locale: string } }
  // 25 Nov 2026: a click in the "keep it" block of the strike and election
  // pages (components/ReturnStep.tsx): the WhatsApp alert, the town's
  // calendar, "is today a holiday?", the strikes hub. `block_position` is
  // where the block sits, `target_type` what the link is, `step_family` the
  // page family. `link_url` is the target path, only for our own pages (the
  // channel link has none). One event per click on top of the link's own:
  // the WhatsApp link also sends whatsapp_channel_click (link_context
  // "return_step").
  | { name: "next_step_click"; params: { block_position: ReturnPosition; target_type: ReturnTarget; step_family: ReturnFamily; link_url?: string; locale: string } }
  // 25 Nov 2026: the "keep it" block was on screen (at least half of it, once
  // per page view; components/NextStepView.tsx). The denominator of the
  // block's click rate. Same closed lists as next_step_click, no link data.
  | { name: "next_step_view"; params: { block_position: ReturnPosition; step_family: ReturnFamily; locale: string } }
  | { name: "language_change"; params: { from_locale: string; to_locale: string } }
  // A click to an official or primary source (clicks.ts decides which links
  // count). Domain only, never the URL: a BOE or SEPE link can carry a query.
  | { name: "outbound_official_source_click"; params: { link_domain: string; link_context: OfficialLinkContext; locale: string } }
  | { name: "map_interaction"; params: { place_kind: string; locale: string } }
  | { name: "affiliate_click"; params: { partner: string; placement: string; locale: string } }
  | { name: "useful_feedback"; params: { is_useful: boolean; content_type: string; locale: string } }
  | { name: "newsletter_signup"; params: { placement: string; locale: string } }
  // GA4's recommended `share` event. `item_id` is the shared page's path (no
  // query string); `method` is the channel, the same value as `utm_medium`.
  | { name: "share"; params: { method: string; content_type: string; item_id: string; locale: string } }
  // First result change in a calculator, once per tab session per tool
  // (calculator-use.ts). Answers "is the tool used, or only read about?".
  | { name: "calculator_use"; params: { calculator_id: CalculatorUseId; locale: string } }
  // The WhatsApp channel is the owned audience. `link_context` is where the
  // link sits; it reuses the dimension already registered for links.
  | { name: "whatsapp_channel_click"; params: { link_context: ChannelLinkContext; locale: string } }
  // The town/city "add to your calendar" block. `method` is GA4's own
  // dimension, the same one `share` fills.
  | { name: "ics_subscribe_click"; params: { method: IcsMethod; locale: string } }
  // 25 Nov 2026: a visitor picked a municipality (or a year) in one of the
  // selectors the audit found unmeasured. `tool` is a closed list (the town's
  // name is never sent): is the municipal search used at all? One event per
  // deliberate choice, never for the server-rendered default or a #hash link.
  | { name: "town_select"; params: { tool: TownSelectTool; locale: string } }
  // 25 Nov 2026: the results page found nothing for a query of 2+ characters.
  // Count only: no query text, no length (internal_search carries the length).
  | { name: "search_no_results"; params: { locale: string } }
  // 25 Nov 2026: a tap on one of the "Go to your community" links above the
  // Spain school calendar's Christmas table (a same-page anchor, no script of
  // its own). `region` is the community's slug from a closed list; the
  // question it answers: do families use the list, and which communities?
  | { name: "school_region_jump"; params: { region: SchoolJumpRegion; locale: string } };

/** `data-ci-placement` of the school calendar's "go to your community" list, and the prefix of its row ids (school-spain/body.ts CCAA_ROW_PREFIX). */
export const SCHOOL_JUMP_PLACEMENT = "school_jump";
export const SCHOOL_ROW_PREFIX = "ccaa-";
/** The community slugs of the Christmas table (a test keeps this list in step with school-spain/regions.ts). */
export const SCHOOL_JUMP_REGIONS = [
  "andalucia", "aragon", "asturias", "baleares", "pais-vasco", "canarias", "cantabria", "castilla-y-leon", "castilla-la-mancha", "cataluna",
  "ceuta", "extremadura", "galicia", "la-rioja", "madrid", "melilla", "murcia", "navarra", "comunidad-valenciana",
] as const;
export type SchoolJumpRegion = (typeof SCHOOL_JUMP_REGIONS)[number];

/** The selectors that report `town_select`. */
export const TOWN_SELECT_TOOLS = ["municipal_results", "embed_builder_town", "embed_builder_year", "embed_working_days", "market_square"] as const;
export type TownSelectTool = (typeof TOWN_SELECT_TOOLS)[number];

/** Where an official link sits: a page's source list, inside a calculator, or anywhere else in the content. */
export type OfficialLinkContext = "sources" | "calculator" | "content";
/** The end-of-article box, the "every morning" box of daily pages, the footer line. */
export type ChannelLinkContext = "article_box" | "daily_box" | "footer" | "return_step" | "other";
/** The box an internal onward link sits in (`data-ci-placement`): the "next useful step" box, a town's list of its other pages (TownHub.tsx), the strike pages' "useful now" list (UsefulNow.tsx), or the 29N election line (ElectionLine.tsx, 26 Nov to 7 Dec 2026). */
export type RelatedLinkContext = "next_step" | "town_hub" | "useful_now" | "election_line";
export const RELATED_LINK_CONTEXTS: readonly RelatedLinkContext[] = ["next_step", "town_hub", "useful_now", "election_line"];
/** `data-ci-placement` of the strike and election pages' "keep it" block (components/ReturnStep.tsx). */
export const RETURN_STEP_PLACEMENT = "return_step";
/** Where the block sits: right after the page's answer, or after the intro of a hub page. */
export const RETURN_POSITIONS = ["after_answer", "after_intro"] as const;
export type ReturnPosition = (typeof RETURN_POSITIONS)[number];
/** What a link in the block is. */
export const RETURN_TARGETS = ["whatsapp_channel", "town_calendar", "holiday_today", "strikes_hub", "strikes_spain_hub", "spain_holidays"] as const;
export type ReturnTarget = (typeof RETURN_TARGETS)[number];
export const RETURN_FAMILIES = ["strikes", "elections"] as const;
export type ReturnFamily = (typeof RETURN_FAMILIES)[number];
/** webcal:// subscription, Google Calendar's add-by-URL, or the plain .ics download. */
export type IcsMethod = "apple" | "google" | "download";

/**
 * Every tool that reports `calculator_use`: the calculators registry
 * (lib/programmatic/calculators/paths.ts) plus the tools that live inside
 * other pages. Spelled out rather than imported, so this module stays free of
 * the registry and the click listener on every page does not ship it; a test
 * (tests/analytics-events.test.ts) keeps the two lists in step.
 */
export const CALCULATOR_USE_IDS = [
  "net-salary",
  "extra-pay",
  "self-employed",
  "dismissal",
  "settlement",
  "unemployment",
  "unemployment-subsidy",
  "sick-leave",
  "paid-leave",
  "rent-update",
  "euribor",
  "mortgage",
  "mortgage-revision",
  "home-purchase-tax",
  "home-purchase-costs",
  "plusvalia",
  "inheritance-tax",
  "inheritance-tax-madrid",
  "inheritance-tax-andalucia",
  "inheritance-tax-valencia",
  "gift-tax-catalonia",
  "gift-tax-madrid",
  "gift-tax-andalucia",
  "gift-tax-valencia",
  "pensions-2027",
  "retirement-age",
  "widow-pension",
  "non-contributory-pension",
  "working-days",
  "smi-2027",
  "iprem",
  "average-salary",
  "treasury-bills",
  "lottery-tax",
  // The Christmas lottery checker (lib/programmatic/lottery-check): not in the calculators registry, same event.
  "lottery-check",
  // The El Niño and La Grossa de Cap d'Any checkers (lib/programmatic/nino-check, grossa-check): same event.
  "nino-check",
  "grossa-check",
  "itv",
  "traffic-fines",
  "bono-social",
  "zona-tensionada",
  "leave-planner-2027",
  "tourist-tax",
  "transport-pass",
  "block-calculator",
] as const;
export type CalculatorUseId = (typeof CALCULATOR_USE_IDS)[number];

export interface ContentParams {
  content_type: string;
  /** The path, without the origin and without any query string. */
  content_path: string;
  locale: string;
  category?: string;
  /** Days since the page was last verified by a human. */
  days_since_verified?: number;
}

export type AnalyticsEventName = AnalyticsEvent["name"];

export const ANALYTICS_EVENTS: AnalyticsEventName[] = [
  "article_view",
  "news_view",
  "internal_search",
  "related_content_click",
  "next_step_click",
  "next_step_view",
  "language_change",
  "outbound_official_source_click",
  "map_interaction",
  "affiliate_click",
  "useful_feedback",
  "newsletter_signup",
  "share",
  "calculator_use",
  "whatsapp_channel_click",
  "ics_subscribe_click",
  "town_select",
  "search_no_results",
  "school_region_jump",
];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends an event if, and only if, measurement consent has been granted and a
 * measurement id is configured. Silent no-op otherwise — never a thrown error
 * in a user's browser because of analytics.
 *
 * `window.gtag` only exists once ConsentGate has inserted the tag, which it
 * does only after the visitor accepted measurement, so its presence is the
 * consent check. Returns whether the event was handed to gtag, so a
 * once-per-session event is not marked as sent while consent is missing.
 */
export function track(event: AnalyticsEvent): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.gtag !== "function") return false;
  try {
    window.gtag("event", event.name, event.params);
    return true;
  } catch {
    // Analytics must never break the page.
    return false;
  }
}

/** Strips query and hash so a path never carries a search term into GA4. */
export function safePath(url: string): string {
  const [pathOnly = "/"] = url.split(/[?#]/);
  return pathOnly;
}

/** Host of an outbound link without `www.`, for `outbound_official_source_click`. */
export function linkDomain(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}
