import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import type { Locale } from "../src/lib/i18n/config.ts";
import { placesAndTables } from "../src/lib/programmatic/elections/election-day.ts";
import { buildElectionPage, townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { municipalitiesFor, resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";

/**
 * 26 Nov 2026 (docs/SEO_EXPERIMENTS.md, "29N town pages: warm the top 150 after a deploy"):
 * the deploy warms the most-searched town pages on the local origin before the Cloudflare
 * purge, and the eve / polling-day block names a single polling place in the singular.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const SEGMENT: Record<string, Locale> = { "ca/eleccions": "ca", "es/elecciones": "es", "en/elections": "en" };

test("warm list: every line is an existing town page, no duplicates, most-searched first", () => {
  const lines = read("ops/vps/warm-elections.txt")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  assert.ok(lines.length >= 100 && lines.length <= 200, `${lines.length} paths`);
  assert.equal(new Set(lines).size, lines.length, "duplicates");
  for (const path of lines) {
    const m = /^\/(ca\/eleccions|es\/elecciones|en\/elections)\/([a-z0-9-]+)\/$/.exec(path);
    assert.ok(m, `not a town page path: ${path}`);
    const locale = SEGMENT[m[1]!]!;
    assert.ok(resolveElectionPage(locale, locale, m[2]!), `no such page: ${path}`);
  }
  assert.match(read("ops/vps/warm-elections.txt"), /Google Search Console[^\n]*read 26 Nov 2026/);
});

test("warm script: local origin only, one request at a time, bounded, never fails", () => {
  const script = read("ops/vps/warm-elections.sh");
  assert.match(script, /case \$APP_URL in\n\s+http:\/\/127\.0\.0\.1:\* \| http:\/\/localhost:\*\) ;;\n\s+\*\) [^\n]*exit 0 ;;/);
  assert.match(script, /WARM_BUDGET_S=\$\{WARM_BUDGET_S:-60\}/);
  assert.match(script, /--max-time 20/);
  assert.doesNotMatch(script, /xargs|parallel|&\s*$|&$/m, "requests must stay sequential");
  assert.match(script, /\nexit 0\n$/);
  assert.doesNotMatch(script, /set -e/, "a failed request must not stop the deploy");
});

test("deploy warms the town list inside warm_routes, before the purge, without failing", () => {
  const deploy = read("ops/vps/deploy.sh");
  const fn = /warm_routes\(\) \{[^]*?\n\}/.exec(deploy)?.[0] ?? "";
  assert.match(fn, /bash "\$DIR\/ops\/vps\/warm-elections\.sh" "\$DIR\/ops\/vps\/warm-elections\.txt" \|\| true/);
  assert.match(fn, /APP_URL=\$APP_URL CANONICAL_HOST=\$CANONICAL_HOST/);
  assert.match(deploy, /\n {2}warm_routes\n {2}purge_cdn\n/);
});

test("placesAndTables: singular article for one polling place or one table, plural otherwise", () => {
  assert.equal(placesAndTables("ca", 1, 1), "el local electoral i la mesa");
  assert.equal(placesAndTables("ca", 1, 20), "el local electoral i les 20 meses");
  assert.equal(placesAndTables("ca", 43, 256), "els 43 locals electorals i les 256 meses");
  assert.equal(placesAndTables("es", 1, 1), "el local electoral y la mesa");
  assert.equal(placesAndTables("es", 1, 11), "el local electoral y las 11 mesas");
  assert.equal(placesAndTables("es", 43, 256), "los 43 locales electorales y las 256 mesas");
  assert.equal(placesAndTables("en", 1, 1), "the polling place and its table");
  assert.equal(placesAndTables("en", 1, 10), "the polling place and 10 tables");
  assert.equal(placesAndTables("en", 43, 256), "the 43 polling places and 256 tables");
});

test("eve and polling day: no town page writes 'els 1 local' / 'los 1 local' / 'the 1 polling place'", () => {
  const BAD = /\b(els|les|los|las) 1 |\bthe 1 /;
  for (const iso of ["2026-11-28T10:00:00Z", "2026-11-29T09:30:00Z"]) {
    const now = new Date(iso);
    const phase = iso.startsWith("2026-11-28") ? "eve" : "polling";
    for (const locale of ["ca", "es", "en"] as const) {
      let single = 0;
      for (const m of municipalitiesFor(locale)) {
        const model = buildElectionPage(m, locale, undefined, phase, now);
        const day = townElectionDay(m, locale, phase, model.polling, undefined, now);
        assert.ok(day, `${locale} ${m.slug}: no block on ${iso}`);
        const where = day.md.find((line) => line.includes("](#") || line.includes(`/${m.slug}/#`));
        assert.ok(where, `${locale} ${m.slug}: no where-you-vote line`);
        assert.doesNotMatch(where, BAD, `${locale} ${m.slug}: ${where.slice(0, 120)}`);
        if (/\[(el local electoral|the polling place) /.test(where)) single++;
      }
      // 708 of 947 towns vote in one polling place (BOP lists, read for tranche 3); English has 4 of 30.
      assert.ok(single > 0, `${locale}: no single-place town found`);
    }
  }
});
