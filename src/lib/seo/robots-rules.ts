import { AGENDA_ENDPOINT } from "@/lib/programmatic/weekend/live";
import { ALERTS_ENDPOINT } from "@/lib/programmatic/rodalies/live";
import { FUEL_ENDPOINT } from "@/lib/programmatic/fuel/live";
import { LEVELS_ENDPOINT } from "@/lib/programmatic/reservoirs/live";

/**
 * The read-only, CDN-cached JSON the live boxes fetch in the browser, which
 * Google's renderer has to be able to fetch too.
 *
 * Google renders pages with robots.txt applied to every subresource, fetches
 * included. With all of /api/ disallowed, the renderer's fetch failed and it
 * indexed each box's failure state: on every fuel page the price box read
 * "Ahora no podemos mostrar los precios: el servicio del Ministerio no
 * responde" (reproduced on /es/gasolineras/terrassa/ on 30 Oct 2026 by
 * rejecting /api/ fetches), and the Rodalies and weekend boxes their own
 * "cannot read" lines. Allowing these four exact paths lets the renderer see
 * the data a reader sees. They answer GET only, carry no query string, are
 * cached by the CDN (an hour for fuel and reservoirs, 30 minutes for the
 * agenda, two minutes for Rodalies), so a render costs no function run, and are sent
 * `X-Robots-Tag: noindex`, so they are fetched, never listed. Everything
 * else under /api/ (contact, feedback, cron, admin, the per-town elections
 * relay that takes a query) stays disallowed.
 */
export const RENDERING_DATA_ENDPOINTS: readonly string[] = [FUEL_ENDPOINT, ALERTS_ENDPOINT, LEVELS_ENDPOINT, AGENDA_ENDPOINT];

/** `$` anchors each endpoint: the exact path only, so `?anything` variants stay under `/*?*`. */
export const PRODUCTION_ALLOW: readonly string[] = ["/", "/_next/image", ...RENDERING_DATA_ENDPOINTS.map((endpoint) => `${endpoint}$`)];

export const PRODUCTION_DISALLOW: readonly string[] = [
  "/admin",
  "/admin/",
  "/api/",
  "/ca/cerca/",
  "/es/buscar/",
  "/en/search/",
  "/*/internal-search/",
  "/*?*",
];
