import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PRODUCTION_ALLOW, PRODUCTION_DISALLOW, RENDERING_DATA_ENDPOINTS } from "../src/lib/seo/robots-rules.ts";
import { FUEL_ENDPOINT } from "../src/lib/programmatic/fuel/live.ts";
import { ALERTS_ENDPOINT } from "../src/lib/programmatic/rodalies/live.ts";
import { LEVELS_ENDPOINT } from "../src/lib/programmatic/reservoirs/live.ts";
import { AGENDA_ENDPOINT } from "../src/lib/programmatic/weekend/live.ts";

/**
 * Google's robots.txt matching (RFC 9309 as Google implements it): the rule
 * with the longest matching path wins; on a tie, Allow wins. `*` matches any
 * run of characters and `$` anchors the end.
 */
function matches(rule: string, path: string): boolean {
  const anchored = rule.endsWith("$");
  const body = (anchored ? rule.slice(0, -1) : rule).split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path);
}

function allowed(path: string): boolean {
  const best = (rules: readonly string[]) => Math.max(-1, ...rules.filter((r) => matches(r, path)).map((r) => r.length));
  return best(PRODUCTION_ALLOW) >= best(PRODUCTION_DISALLOW);
}

test("Google's renderer may fetch the four data endpoints the live boxes read", () => {
  assert.deepEqual([...RENDERING_DATA_ENDPOINTS].sort(), [AGENDA_ENDPOINT, ALERTS_ENDPOINT, FUEL_ENDPOINT, LEVELS_ENDPOINT].sort());
  for (const endpoint of RENDERING_DATA_ENDPOINTS) {
    assert.match(endpoint, /^\/api\/[a-z]+\/[a-z]+\/$/, "an exact path, no query string");
    assert.equal(allowed(endpoint), true, `${endpoint} must be crawlable for rendering`);
  }
});

test("the rest of the API, admin, search and query-string URLs stay disallowed", () => {
  for (const path of [
    "/api/contact/",
    "/api/feedback/",
    "/api/cron/publish-scheduled/",
    "/api/admin/publish/",
    "/api/elections/municipal/?code=08019",
    "/api/fuel/catalonia/?x=1",
    "/api/fuel/",
    "/admin/",
    "/es/buscar/",
    "/ca/internal-search/",
    "/es/gasolineras/?utm_source=x",
  ]) {
    assert.equal(allowed(path), false, `${path} must stay disallowed`);
  }
  for (const path of ["/", "/es/gasolineras/terrassa/", "/_next/image?url=%2Fimages%2Fa.webp&w=828&q=75"]) {
    assert.equal(allowed(path), true, `${path} must stay crawlable`);
  }
});

test("robots.txt is built from these rules and the live components fetch these constants", () => {
  const src = join(import.meta.dirname, "..", "src");
  const robots = readFileSync(join(src, "app", "robots.ts"), "utf8");
  assert.match(robots, /allow: \[\.\.\.PRODUCTION_ALLOW\]/);
  assert.match(robots, /disallow: \[\.\.\.PRODUCTION_DISALLOW\]/);
  assert.match(readFileSync(join(src, "components/programmatic/fuel/FuelPrices.tsx"), "utf8"), /fetch\(FUEL_ENDPOINT\)/);
});
