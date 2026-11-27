import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CITIES, localDays } from "../src/lib/programmatic/spain-2027/cities.ts";
import { DAY_CITIES_UI, dayCityLinks, localCitiesOn } from "../src/lib/programmatic/spain-2027/day-cities.ts";
import { DAY_PAGES } from "../src/lib/programmatic/spain-2027/days.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";
import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { fairTownHref, linkLeadingTown } from "../src/lib/content/batch02/christmas-town-links.ts";
import { townPath as fairPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { buildIncomeTaxBody } from "../src/lib/content/batch02/income-tax.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { buildStrikesSpainBody, recentGuideLinks, recentSpainStrikes } from "../src/lib/content/batch02/strikes-spain.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { TRAINS, lineLinks } from "../src/lib/content/features/trains.ts";
import { AIRPORT } from "../src/lib/content/batch02/airport.ts";
import { linePath } from "../src/lib/programmatic/rodalies/paths.ts";
import { buildPayBody } from "../src/lib/content/batch02/pay-dates.ts";

/**
 * Internal-link audit, round 3 (27 Nov 2026, docs/SEO_EXPERIMENTS.md): pages
 * with impressions that only their own family linked get links from the pages
 * whose readers need them. Every link is same-language, indexable and once.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
const PREFIX = { ca: "/ca/festius/2027/", es: "/es/festivos/2027/", en: "/en/holidays/2027/" } as const;

test("2027 day pages list exactly the cities whose 2027 local days fall on that date, most populous first", () => {
  for (const iso of DAY_PAGES) {
    const listed = localCitiesOn(iso);
    const expected = CITIES.filter((c) => localDays(c).some((d) => d.date === iso));
    assert.equal(listed.length, expected.length, iso);
    for (const c of listed) assert.ok(localDays(c).some((d) => d.date === iso), `${iso}: ${c.slug}`);
    for (let i = 1; i < listed.length; i++) assert.ok(listed[i - 1]!.population >= listed[i]!.population, `${iso}: order`);
    assert.equal(new Set(listed.map((c) => `${c.region}/${c.slug}`)).size, listed.length, `${iso}: a city twice`);
  }
});

test("2027 day-page city links: same language, indexable only, every city named in the three languages", () => {
  for (const iso of DAY_PAGES) {
    const counts = new Set<number>();
    for (const locale of LOCALES) {
      const rows = dayCityLinks(iso, locale);
      counts.add(rows.length);
      for (const r of rows) {
        assert.ok(r.name && !/undefined|null/.test(r.name), `${locale} ${iso}: name`);
        if (r.href === null) continue;
        assert.ok(r.href.startsWith(PREFIX[locale]) && r.href.endsWith("/"), `${locale} ${iso}: ${r.href}`);
        assert.ok(!isLowDemandPath(r.href), `${locale} ${iso}: ${r.href} is noindex`);
      }
    }
    assert.equal(counts.size, 1, `${iso}: the count differs between languages`);
  }
  // Spanish: every city page is linked (none is on the low-demand list today).
  for (const iso of DAY_PAGES) for (const r of dayCityLinks(iso, "es")) assert.ok(r.href, `es ${iso}: ${r.city.slug} not linked`);
});

test("2027 city pages: 200+ Spanish city pages get at least one link from a day page (27 Nov: 240 of 541 with a 2027 list)", () => {
  const inbound = new Map<string, number>();
  for (const iso of DAY_PAGES) for (const r of dayCityLinks(iso, "es")) if (r.href) inbound.set(r.href, (inbound.get(r.href) ?? 0) + 1);
  assert.ok(inbound.size >= 200, `only ${inbound.size}`);
  for (const [href, n] of inbound) assert.ok(n >= 1 && n <= 2, `${href}: ${n}`);
});

test("2027 day-page city block: headings in ca/es/en and wired into the 'where' section after the region lists", () => {
  assert.equal(DAY_CITIES_UI.es.heading("8 de septiembre", 77), "Ciudades con fiesta local el 8 de septiembre (77)");
  assert.equal(DAY_CITIES_UI.ca.heading("8 de setembre", 77), "Ciutats amb festa local el 8 de setembre (77)");
  assert.equal(DAY_CITIES_UI.en.heading("8 September", 77), "Cities with a local holiday on 8 September (77)");
  const src = read("src/components/programmatic/spain-2027/days.tsx");
  assert.match(src, /<WhereLists day=\{day\} locale=\{locale\} \/>\s*<DayCities iso=\{iso\} locale=\{locale\} \/>/);
  assert.match(src, /c\.href \? <Link href=\{c\.href\}>\{c\.name\}<\/Link> : c\.name/);
});

/* --------------------------------------------- Christmas markets guide --- */

const FAIR_PREFIX = { ca: "/ca/fires-de-nadal/", es: "/es/mercados-navidad/", en: "/en/christmas-markets/" } as const;
const guideBody = (locale: (typeof LOCALES)[number]) => JSON.stringify(CHRISTMAS.editions[locale].blocks);
const linksTo = (body: string, href: string) => body.split(`](${href})`).length - 1;

test("Christmas markets guide links Canyelles and Espinelves (ca/es) and the other dated towns, once each, same language", () => {
  for (const locale of ["ca", "es"] as const) {
    const body = guideBody(locale);
    for (const slug of ["canyelles", "espinelves", "figueres", "granollers", "cubelles", "garriguella", "altafulla"]) {
      assert.equal(linksTo(body, fairPath(locale, slug)), 1, `${locale}: ${slug}`);
    }
  }
  // English pages exist for a selection only: Figueres is linked, Espinelves (no English page) is not.
  const en = guideBody("en");
  assert.equal(linksTo(en, fairPath("en", "figueres")), 1);
  assert.equal(linksTo(en, fairPath("en", "espinelves")), 0);
  for (const locale of LOCALES) {
    const hrefs = [...guideBody(locale).matchAll(/\]\((\/[a-z]{2}\/(?:fires-de-nadal|mercados-navidad|christmas-markets)\/[a-z0-9-]+\/)\)/g)].map((m) => m[1]!);
    assert.ok(hrefs.length >= 3, `${locale}: ${hrefs.length} town links`);
    for (const h of hrefs) {
      assert.ok(h.startsWith(FAIR_PREFIX[locale]), `${locale}: ${h}`);
      assert.ok(!isLowDemandPath(h), `${locale}: ${h} noindex`);
    }
  }
});

test("income tax guide: the savings-scale section links the Treasury bills calculator once, same language", () => {
  for (const locale of LOCALES) {
    const blocks = buildIncomeTaxBody(locale) as unknown[];
    const json = JSON.stringify(blocks);
    const href = calcPath("treasury-bills", locale);
    assert.equal(linksTo(json, href), 1, `${locale}: ${href}`);
    const at = blocks.findIndex((b) => JSON.stringify(b).includes(`](${href})`));
    const table = blocks.findIndex((b) => (b as { type?: string }).type === "table" && /estalvi|ahorro|savings/i.test(JSON.stringify(b)));
    assert.ok(table >= 0 && at === table + 1, `${locale}: the sentence follows the savings table (${table}, ${at})`);
  }
});

test("Spain strikes hub: each recent strike links its own guides, day pages included, same language and indexable", () => {
  const STRIKE_GUIDE = { ca: "/ca/guies/", es: "/es/guias/", en: "/en/guides/" } as const;
  for (const locale of LOCALES) {
    const blocks = buildStrikesSpainBody(locale, "2026-11-27") as { type: string; text?: string; items?: string[] }[];
    const at = blocks.findIndex((b) => b.type === "heading" && b.text === ({ ca: "Vagues recents", es: "Huelgas recientes", en: "Recent strikes" } as const)[locale]);
    assert.ok(at >= 0, `${locale}: no recent heading`);
    const listBlock = blocks.slice(at).find((b) => b.type === "list")!;
    const json = JSON.stringify(listBlock);
    // The 19 Nov day page (rail strike entry) is linked once its day has passed.
    assert.equal(linksTo(json, b2href("strike19n", locale)), 1, `${locale}: 19N day page`);
    assert.equal(linksTo(json, b2href("strikes", locale)), 0, `${locale}: standing page in recent`);
    for (const m of json.matchAll(/\]\((\/[^)]+)\)/g)) {
      assert.ok(m[1]!.startsWith(STRIKE_GUIDE[locale]), `${locale}: ${m[1]}`);
      assert.ok(!isLowDemandPath(m[1]!), `${locale}: ${m[1]} noindex`);
    }
  }
  // A strike with no guide gets no "More details".
  const bare = recentSpainStrikes("2026-11-27").find((s) => !(s.guides ?? []).length)!;
  assert.deepEqual(recentGuideLinks(bare, "es"), []);
  // 30 Nov: the Correos entry is recent; its 23N day page is linked, the postal-vote guide is not.
  const correos = recentSpainStrikes("2026-11-30").find((s) => s.id === "huelga-correos-2026-11-23")!;
  const links = recentGuideLinks(correos, "es").join(" ");
  assert.ok(links.includes(b2href("strike23n", "es")) && !links.includes(b2href("postalVote", "es")), links);
});

test("train day trips table links R2 Sud, R11 and R3 once each (first row that names them); the airport guide links the R2 Nord in English too", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(TRAINS.editions[locale].blocks);
    for (const id of ["R2S", "R11", "R3"] as const) assert.equal(linksTo(json, linePath(locale, id)), 1, `${locale}: ${id}`);
    // R1, R2 and R4 stay linked once, from the sentence after the table.
    for (const id of ["R1", "R2", "R4"] as const) assert.equal(linksTo(json, linePath(locale, id)), 1, `${locale}: ${id}`);
    assert.equal(linksTo(JSON.stringify(AIRPORT.editions[locale].blocks), linePath(locale, "R2N")), 1, `${locale}: airport → R2 Nord`);
  }
  const rows = lineLinks("es", [
    ["Sitges", "R2 Sud", "x"],
    ["Vilanova", "R2 Sud y regionales", "x"],
    ["Girona", "R11 o alta velocidad", "x"],
    ["X", "R14–R17", "x"],
  ]);
  assert.deepEqual(
    rows.map((r) => r[1]),
    ["[R2 Sud](/es/rodalies/r2-sud/)", "R2 Sud y regionales", "[R11](/es/rodalies/r11/) o alta velocidad", "R14–R17"],
  );
});

test("pay-dates guide links the non-contributory pension calculator once, on the line about who pays it, indexable", () => {
  for (const locale of LOCALES) {
    const href = calcPath("non-contributory-pension", locale);
    const json = JSON.stringify(buildPayBody(locale));
    assert.equal(linksTo(json, href), 1, `${locale}: ${href}`);
    assert.ok(!isLowDemandPath(href), href);
    assert.match(json, new RegExp(`(Seguridad Social|Seguretat Social|Social Security Treasury)[^"]*\\]\\(${href.replace(/\//g, "\\/")}\\)`), locale);
  }
});

test("fair town links: only towns with a page, bold kept, unknown towns untouched", () => {
  assert.equal(fairTownHref("Lleida", "es"), null);
  assert.equal(linkLeadingTown("**Canyelles** (Garraf): x.", "es"), "**[Canyelles](/es/mercados-navidad/canyelles/)** (Garraf): x.");
  assert.equal(linkLeadingTown("**Poble Inventat** (X): y.", "ca"), "**Poble Inventat** (X): y.");
  assert.equal(linkLeadingTown("Sense negreta", "ca"), "Sense negreta");
});
