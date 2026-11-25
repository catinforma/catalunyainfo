import { RETURN_FAMILIES, RETURN_POSITIONS, track, type AnalyticsEvent } from "./events";

/**
 * `next_step_view`, the denominator of the "keep it" block's click rate
 * (docs/ANALYTICS.md "Next-step metric"). The event for a block: its position
 * and family are checked against the closed lists (a value outside them sends
 * nothing), the same lists `next_step_click` uses.
 */
export function nextStepViewEvent(position: string | null | undefined, family: string | null | undefined, locale: string): AnalyticsEvent | null {
  const block_position = RETURN_POSITIONS.find((p) => p === position);
  const step_family = RETURN_FAMILIES.find((f) => f === family);
  if (!block_position || !step_family) return null;
  return { name: "next_step_view", params: { block_position, step_family, locale } };
}

interface Observer {
  observe(target: Element): void;
  disconnect(): void;
}
type ObserverFactory = (callback: (entries: { isIntersecting: boolean }[]) => void) => Observer;

/**
 * Sends the view once per page view, when at least half the block is in the
 * viewport. The `sent` flag and the disconnect make a second intersection (a
 * scroll back, a re-render) count for nothing; the event goes out through
 * track(), so it is a no-op without consent. Returns the cleanup. Without
 * IntersectionObserver nothing is sent (no view is better than a false one).
 */
export function watchNextStepView(el: Element, event: AnalyticsEvent, factory?: ObserverFactory): () => void {
  const make: ObserverFactory | null =
    factory ?? (typeof IntersectionObserver === "undefined" ? null : (cb) => new IntersectionObserver((entries) => cb(entries), { threshold: 0.5 }));
  if (!make) return () => {};
  let sent = false;
  const observer = make((entries) => {
    if (sent || !entries.some((e) => e.isIntersecting)) return;
    sent = true;
    observer.disconnect();
    track(event);
  });
  observer.observe(el);
  return () => observer.disconnect();
}
