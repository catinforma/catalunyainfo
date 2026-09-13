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
  | { name: "internal_search"; params: { search_term_length: number; results_count: number; locale: string } }
  | { name: "related_content_click"; params: { from_type: string; to_type: string; position: number; locale: string } }
  | { name: "language_change"; params: { from_locale: string; to_locale: string } }
  | { name: "external_link"; params: { link_domain: string; link_context: "source" | "official" | "body" } }
  | { name: "map_interaction"; params: { place_kind: string; locale: string } }
  | { name: "affiliate_click"; params: { partner: string; placement: string; locale: string } }
  | { name: "useful_feedback"; params: { is_useful: boolean; content_type: string; locale: string } }
  | { name: "newsletter_signup"; params: { placement: string; locale: string } };

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
  "external_link",
  "map_interaction",
  "affiliate_click",
  "useful_feedback",
  "newsletter_signup",
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
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  try {
    window.gtag("event", event.name, event.params);
  } catch {
    // Analytics must never break the page.
  }
}

/** Strips query and hash so a path never carries a search term into GA4. */
export function safePath(url: string): string {
  const [pathOnly = "/"] = url.split(/[?#]/);
  return pathOnly;
}

/** Registrable domain of an outbound link, for the `external_link` event. */
export function linkDomain(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}
