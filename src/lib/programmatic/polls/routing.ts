/**
 * Which route serves the public polls URLs, decided per request by the proxy
 * (src/proxy.ts) from the clock. No figures here: anything may import it.
 *
 * Inside the LOREG 69.7 window (window.ts) the page shows no figure, so its
 * content does not depend on the time any more and it can be static: the
 * proxy rewrites the public URL to `internal-polls/blackout/`, a prerendered
 * route that renders `BLACKOUT_VIEW` and cannot reach `figures.ts` at all
 * (it never imports data.ts). That covers the busy days, 24-29 Nov, and
 * polling day until 21:00, with no render per request.
 *
 * Outside the window the proxy passes the request through, and the
 * next.config rewrite sends it to the force-dynamic `internal-polls/` route,
 * which reads the clock at request time as before (a copy with figures must
 * never be stored, so that one stays dynamic).
 *
 * Deterministic both ways: the same instant gives the same route, and an
 * invalid clock counts as inside the window (`isPollBlackout` fails closed).
 * If the proxy did not run at all, the dynamic route's own clock check still
 * applies, so the failure mode is "rendered per request", never "figures in
 * the window".
 */

import type { Locale } from "@/lib/i18n/config";

import { pollsBlackoutInternalPath, pollsLocaleForPath } from "./paths";
import { BLACKOUT_END, isPollBlackout } from "./window";

/** What the static blackout route renders: the gate's blackout state, built from the window alone. */
export const BLACKOUT_VIEW = { state: "blackout", returnsAt: BLACKOUT_END.toISOString() } as const;

/**
 * The internal path the proxy rewrites a request to, or null to let it through
 * (to the dynamic route, or to whatever else owns the path).
 */
export function pollsProxyRewrite(pathname: string, now: Date): string | null {
  const locale: Locale | null = pollsLocaleForPath(pathname);
  if (!locale) return null;
  return isPollBlackout(now) ? pollsBlackoutInternalPath(locale) : null;
}
