import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";
import { comarcaBySlug, municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { englishTownBySlug } from "../src/lib/programmatic/holidays/english.ts";
import { DATE_LOCALES, DATE_PAGES, datePath } from "../src/lib/programmatic/holidays/paths.ts";
import { editionPaths } from "../src/lib/programmatic/spain-2027/editions.ts";
import { spainDayPath, spainDayPaths } from "../src/lib/programmatic/spain-2027/paths.ts";
import { DAY_PAGES } from "../src/lib/programmatic/spain-2027/days.ts";
import {
  DATE_PAGE_GRACE_DAYS,
  LOW_DEMAND_AS_OF,
  LOW_DEMAND_PATHS,
  LOW_DEMAND_REVIEW_BY,
  LOW_DEMAND_RULES,
  datePageIso,
  expiredDatePage,
  isLowDemandPath,
  lowDemandRule,
} from "../src/lib/seo/low-demand.ts";

const FAMILIES = [
  /^\/(ca\/festius|es\/festivos)\/(comarca\/)?[a-z0-9-]+\/$/,
  /^\/en\/holidays\/[a-z0-9-]+\/$/,
  /^\/(ca\/eleccions|es\/elecciones)\/(comarca\/)?[a-z0-9-]+\/$/,
  /^\/(ca\/benzineres|es\/gasolineras)\/((comarca|provincia)\/)?[a-z0-9-]+\/$/,
];

test("low-demand list: unique paths, only the templated families, never a hub or a 2027 page", () => {
  assert.equal(new Set(LOW_DEMAND_PATHS).size, LOW_DEMAND_PATHS.length);
  for (const p of LOW_DEMAND_PATHS) {
    assert.ok(FAMILIES.some((re) => re.test(p)), `unexpected path ${p}`);
    // Ponts is also a town (Noguera): /ca/eleccions/ponts/ is fine; the 2027 bridges pages sit one level deeper.
    assert.doesNotMatch(p, /\/(2027|dia|day)\/$/, p);
  }
});

test("low-demand list: every holiday page names a real municipality, comarca or English town page", () => {
  for (const p of LOW_DEMAND_PATHS) {
    const m = p.match(/^\/(?:ca\/festius|es\/festivos)\/(comarca\/)?([a-z0-9-]+)\/$/);
    if (m) {
      const slug = m[2] ?? "";
      const found = m[1] ? comarcaBySlug(slug) : municipalityBySlug(slug);
      assert.ok(found, `no such ${m[1] ? "comarca" : "municipality"}: ${p}`);
    }
    const en = p.match(/^\/en\/holidays\/([a-z0-9-]+)\/$/);
    if (en) assert.ok(englishTownBySlug(en[1] ?? ""), `no English town page: ${p}`);
  }
  // 17 Nov 2026: Ponts (Noguera) was skipped on 11 Nov by the script's "ponts" exclusion.
  assert.ok(isLowDemandPath("/es/festivos/ponts/"));
});

test("low-demand list: every election town page names a real municipality", () => {
  let n = 0;
  for (const p of LOW_DEMAND_PATHS) {
    const m = p.match(/^\/(ca|es)\/(?:eleccions|elecciones)\/([a-z0-9-]+)\/$/);
    if (!m) continue;
    const locale = m[1] === "ca" ? "ca" : "es";
    assert.ok(resolveElectionPage(locale, locale, m[2] ?? ""), `no such election page: ${p}`);
    n++;
  }
  assert.ok(n > 900, `phase 2 election pages on the list (${n})`);
});

test("isLowDemandPath: paths and absolute URLs, with or without the trailing slash", () => {
  const p = LOW_DEMAND_PATHS[0] ?? "";
  assert.ok(p);
  assert.ok(isLowDemandPath(p));
  assert.ok(isLowDemandPath(p.slice(0, -1)));
  assert.ok(isLowDemandPath(`https://www.catalunyainfo.com${p}`));
  assert.ok(!isLowDemandPath("/ca/festius/"));
  assert.ok(!isLowDemandPath("/ca/festius/barcelona/"));
  assert.ok(!isLowDemandPath("not a url"));
  // Rules work on absolute URLs too.
  assert.ok(isLowDemandPath("https://www.catalunyainfo.com/ca/festius/2027/madrid/madrid"));
});

/* ------------------------------------------------------- Rules, 17 Nov 2026 --- */

test("rules: ids unique; every kept page is in its rule's group, once", () => {
  assert.equal(new Set(LOW_DEMAND_RULES.map((r) => r.id)).size, LOW_DEMAND_RULES.length);
  for (const rule of LOW_DEMAND_RULES) {
    const keep = rule.keep ?? [];
    assert.equal(new Set(keep).size, keep.length, rule.id);
    for (const p of keep) {
      assert.match(p, rule.pattern, `${rule.id}: kept page outside the group ${p}`);
      assert.equal(lowDemandRule(p), null, p);
      assert.ok(!isLowDemandPath(p, "2026-11-17"), p);
    }
  }
});

test("rule spain-2027-ca / -en: the Catalan and English Spain-wide pages, minus Catalonia's, the hubs and the kept ones", () => {
  const ca = editionPaths("ca");
  const en = editionPaths("en");
  const days = spainDayPaths();
  // Every page of the two editions is a real route, so every kept page is too.
  for (const rule of LOW_DEMAND_RULES.filter((r) => r.id.startsWith("spain-2027-"))) {
    const pages = new Set([...ca, ...en, ...days]);
    for (const p of rule.keep ?? []) assert.ok(pages.has(p), `${rule.id}: no such page ${p}`);
  }
  const covered = [...ca, ...en, ...days.filter((p) => !p.startsWith("/es/"))].filter((p) => lowDemandRule(p));
  const kept = LOW_DEMAND_RULES.filter((r) => r.id.startsWith("spain-2027-")).reduce((n, r) => n + (r.keep?.length ?? 0), 0);
  // Hub + bridges per edition, and Catalonia's community page, stay out of the groups.
  assert.equal(covered.length, ca.length + en.length + 2 * DAY_PAGES.length - 2 * 3 - kept);
  for (const p of ["/ca/festius/2027/", "/ca/festius/2027/ponts/", "/ca/festius/2027/catalunya/", "/ca/festius/2027/al-teu-web/", "/ca/festius/2027/aprofitar-vacances/"]) {
    assert.equal(lowDemandRule(p), null, p);
  }
  for (const p of ["/en/holidays/2027/", "/en/holidays/2027/long-weekends/", "/en/holidays/2027/catalonia/", "/en/holidays/2027/for-your-website/", "/en/holidays/2027/leave-planner/"]) {
    assert.equal(lowDemandRule(p), null, p);
  }
  // The Spanish edition is untouched (its own review: 15 Jan 2027, docs/SEO_EXPERIMENTS.md 13 Nov).
  for (const p of [spainDayPath(DAY_PAGES[0]!, "es"), "/es/festivos/2027/madrid/madrid/", "/es/festivos/2027/andalucia/"]) {
    assert.ok(!isLowDemandPath(p, "2026-11-17"), p);
  }
  assert.equal(lowDemandRule("/ca/festius/2027/madrid/madrid/")?.id, "spain-2027-ca");
  assert.equal(lowDemandRule("/en/holidays/2027/madrid/madrid/")?.id, "spain-2027-en");
  // Catalonia's own date pages (/ca/festius/dia/…-2027/) are not in the group.
  assert.equal(lowDemandRule("/ca/festius/dia/29-marc-2027/"), null);
});

test("rule strike-11n-cities: the city pages in three languages; the guides and Spain pages that still earn stay", () => {
  const cities = ["a-coruna", "alicante", "bilbao", "las-palmas-gran-canaria", "madrid", "malaga", "murcia", "palma-mallorca", "sevilla", "valencia", "valladolid", "vigo", "zaragoza"];
  for (const c of cities) assert.equal(lowDemandRule(`/es/guias/huelga-general-11-noviembre-${c}/`)?.id, "strike-11n-cities", c);
  for (const p of ["/ca/guies/vaga-general-11-novembre-saragossa/", "/ca/guies/vaga-general-11-novembre-alacant/", "/en/guides/general-strike-11-november-seville/", "/es/guias/huelga-general-11-noviembre-espana/"]) {
    assert.equal(lowDemandRule(p)?.id, "strike-11n-cities", p);
  }
  for (const p of [
    "/es/guias/huelga-general-11-noviembre/",
    "/ca/guies/vaga-general-11-novembre/",
    "/en/guides/general-strike-11-november-spain/",
    "/en/guides/general-strike-11-november-spain-by-city/",
    "/ca/guies/vaga-general-11-novembre-espanya/",
    "/es/guias/huelgas-espana/",
  ]) {
    assert.equal(lowDemandRule(p), null, p);
  }
});

test("date pages: every date page's slug parses back to its date, in each language", () => {
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) assert.equal(datePageIso(datePath(locale, iso)), iso, `${locale} ${iso}`);
    for (const iso of DAY_PAGES) assert.equal(datePageIso(spainDayPath(iso, locale)), iso, `${locale} ${iso}`);
  }
  assert.equal(datePageIso("/ca/festius/barcelona/"), null);
  assert.equal(datePageIso("/es/festivos/2027/madrid/madrid/"), null);
});

test(`date pages leave the index ${DATE_PAGE_GRACE_DAYS} days after their date, and only then`, () => {
  const p = datePath("es", "2026-11-01");
  assert.equal(p, "/es/festivos/dia/1-noviembre-2026/");
  assert.ok(!expiredDatePage(p, "2026-11-01"));
  assert.ok(!expiredDatePage(p, "2026-11-14"));
  assert.ok(expiredDatePage(p, "2026-11-15"));
  assert.ok(isLowDemandPath(p, "2026-11-15"));
  assert.ok(!isLowDemandPath(p, "2026-11-10"));
  // Year boundary, and the Spain-wide 2027 slugs (no year in the slug).
  assert.ok(!expiredDatePage(datePath("en", "2026-12-31"), "2027-01-13"));
  assert.ok(expiredDatePage(datePath("en", "2026-12-31"), "2027-01-14"));
  assert.ok(expiredDatePage(spainDayPath("2027-01-01", "es"), "2027-01-15"));
  assert.ok(!expiredDatePage(spainDayPath("2027-01-01", "es"), "2027-01-14"));
  // Today, every page dated in the future is indexable unless a rule says otherwise.
  for (const iso of DATE_PAGES.filter((d) => d > "2026-12-01")) assert.ok(!isLowDemandPath(datePath("es", iso), "2026-11-17"), iso);
});

test("low-demand list is wired into the robots meta and the sitemap", () => {
  const meta = readFileSync("src/lib/seo/metadata.ts", "utf8");
  assert.match(meta, /const lowDemand = isLowDemandPath\(path\)/);
  assert.match(meta, /lowDemand && indexingAllowed\(\) && !noindex\s*\? \{ index: false, follow: true \}/);
  assert.match(readFileSync("src/app/sitemap.ts", "utf8"), /filter\(\(entry\) => !isLowDemandPath\(entry\.url\)\)/);
});

test("low-demand list is re-read before the holidays season (LOW_DEMAND_REVIEW_BY)", () => {
  assert.ok(LOW_DEMAND_AS_OF < LOW_DEMAND_REVIEW_BY);
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(
    today < LOW_DEMAND_REVIEW_BY,
    "re-read the list and the rules' keep lists against fresh Search Console data (scripts/low-demand.py, docs/SEO_EXPERIMENTS.md 17 Nov 2026) and move LOW_DEMAND_REVIEW_BY",
  );
});

/*
 * Site audit, 17 Nov 2026: low-demand pages are chosen per language, so 400
 * indexable sitemap pages named a noindex sibling as an hreflang alternate
 * (HTML and sitemap alike). The cluster is now the indexable editions only.
 */
test("hreflang clusters: a noindex (low-demand) sibling is left out, and a low-demand page lists none", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  const { buildAlternates, indexableSitemapLanguages } = await import("../src/lib/seo/metadata.ts");
  const ORIGIN = "https://www.catalunyainfo.com";
  const ca = "/ca/eleccions/pineda-de-mar/";
  const es = "/es/elecciones/pineda-de-mar/";
  assert.ok(isLowDemandPath(es) && !isLowDemandPath(ca), "fixture: es is low-demand, ca is not");

  const indexed = buildAlternates({ path: ca, translations: { ca, es } });
  assert.deepEqual(indexed?.languages, { ca: `${ORIGIN}${ca}`, "x-default": `${ORIGIN}${ca}` });
  assert.equal(indexed?.canonical, `${ORIGIN}${ca}`);

  const noindexed = buildAlternates({ path: es, translations: { ca, es } });
  assert.equal(noindexed?.languages, undefined);
  assert.equal(noindexed?.canonical, `${ORIGIN}${es}`, "the canonical stays self-referencing");

  // The sitemap entry for the same page names the same cluster as its HTML.
  assert.deepEqual(
    indexableSitemapLanguages(`${ORIGIN}${ca}`, { ca: `${ORIGIN}${ca}`, es: `${ORIGIN}${es}`, "x-default": `${ORIGIN}${ca}` }),
    indexed?.languages,
  );
  // An x-default that pointed at a noindex edition falls back as buildAlternates does (en, ca, the page).
  assert.deepEqual(
    indexableSitemapLanguages(`${ORIGIN}${ca}`, { ca: `${ORIGIN}${ca}`, es: `${ORIGIN}${es}`, "x-default": `${ORIGIN}${es}` }),
    { ca: `${ORIGIN}${ca}`, "x-default": `${ORIGIN}${ca}` },
  );
  // The home cluster keeps "/" as x-default.
  assert.deepEqual(indexableSitemapLanguages(`${ORIGIN}/ca/`, { ca: `${ORIGIN}/ca/`, es: `${ORIGIN}/es/`, "x-default": `${ORIGIN}/` }), {
    ca: `${ORIGIN}/ca/`,
    es: `${ORIGIN}/es/`,
    "x-default": `${ORIGIN}/`,
  });
  assert.match(readFileSync("src/app/sitemap.ts", "utf8"), /indexableSitemapLanguages\(entry\.url, languages\)/);
});

/** Site audit, 19 Nov 2026: the noindex author indexes (/ca/autors/, /es/autores/, /en/authors/) named each other as alternates. */
test("hreflang clusters: a page marked noindex lists no alternates and keeps its self canonical", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  const { buildMetadata } = await import("../src/lib/seo/metadata.ts");
  const ORIGIN = "https://www.catalunyainfo.com";
  const translations = { ca: "/ca/autors/", es: "/es/autores/", en: "/en/authors/" };
  const hidden = buildMetadata({ locale: "ca", path: "/ca/autors/", title: "Equip", noindex: true, translations });
  const alt = hidden.alternates as { canonical: string; languages?: Record<string, string> };
  assert.equal(alt.languages, undefined);
  assert.equal(alt.canonical, `${ORIGIN}/ca/autors/`);
  const shown = buildMetadata({ locale: "ca", path: "/ca/autors/", title: "Equip", translations });
  assert.deepEqual(Object.keys((shown.alternates as { languages: Record<string, string> }).languages).sort(), ["ca", "en", "es", "x-default"]);
});
