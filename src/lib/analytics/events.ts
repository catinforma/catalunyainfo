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
  | { name: "related_content_click"; params: { from_type: string; to_type: string; position: number; locale: string } }
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
  | { name: "ics_subscribe_click"; params: { method: IcsMethod; locale: string } };

/** Where an official link sits: a page's source list, inside a calculator, or anywhere else in the content. */
export type OfficialLinkContext = "sources" | "calculator" | "content";
/** The end-of-article box, the "every morning" box of daily pages, the footer line. */
export type ChannelLinkContext = "article_box" | "daily_box" | "footer" | "other";
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
  "pensions-2027",
  "working-days",
  "smi-2027",
  "treasury-bills",
  "itv",
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
