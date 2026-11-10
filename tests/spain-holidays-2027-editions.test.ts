import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

/**
 * The Catalan and English editions of the Spain 2027 calendar
 * (/ca/festius/2027/, /en/holidays/2027/; editions.ts): every page in the
 * three languages, hreflang reciprocal, every text written in ca and en, the
 * same facts and BOE links as the Spanish edition, links to the same
 * language only.
 */

const { BOE_2027_ROWS, REGIONS } = await import("../src/lib/programmatic/holidays/boe-2027.ts");
const { municipalities } = await import("../src/lib/programmatic/holidays/data.ts");
const { COMMON_DATES, communityDays, dayCount } = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { CITIES } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { COMMUNITIES } = await import("../src/lib/programmatic/spain-2027/communities.ts");
const {
  BRIDGES_INTL,
  EDITION_DESCRIPTION_LIMIT,
  EDITION_TITLE_LIMIT,
  HOLIDAY_NAME,
  HUB_INTL,
  bridgesDescriptionIntl,
  communityDescriptionIntl,
  communityFaqIntl,
  communityH1Intl,
  communityLeadIntl,
  communityTitleIntl,
  decreeLineIntl,
  hubDescriptionIntl,
  hubLeadIntl,
  localStatusLineIntl,
  notKeptLineIntl,
  weekendLineIntl,
} = await import("../src/lib/programmatic/spain-2027/copy-intl.ts");
const {
  EDITIONS,
  EDITION_BRIDGES_SLUG,
  allEditions,
  editionCommunities,
  editionCommunityParams,
  editionCityParams,
  editionHubPath,
  editionNames,
  editionPaths,
  editionSitemapEntries,
  resolveEditionCity,
  resolveEditionCommunity,
} = await import("../src/lib/programmatic/spain-2027/editions.ts");
const { spainPaths, spainSitemapEntries } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { SOURCE_PROSE, missingProse } = await import("../src/lib/programmatic/spain-2027/sources-intl.ts");

const ROOT = join(import.meta.dirname, "..");
const PUBLIC = join(ROOT, "src", "app", "(public)", "[locale]");
const SITE = "https://www.catalunyainfo.com";

/** Words that only Spanish copy would use: none may appear in a Catalan or English title, description, H1 or lead. */
const SPANISH = /\b(festivos|según|también|todavía|aún|puentes|fines de semana|comunidad autónoma|vacaciones)\b/i;

test("every BOE row and every sources.ts text has its Catalan and English words", () => {
  for (const row of BOE_2027_ROWS) {
    assert.ok(HOLIDAY_NAME[row.name]?.ca, `ca: ${row.name}`);
    assert.ok(HOLIDAY_NAME[row.name]?.en, `en: ${row.name}`);
  }
  assert.deepEqual(missingProse(), []);
  for (const r of REGIONS) {
    for (const l of EDITIONS) {
      const p = SOURCE_PROSE[r][l];
      assert.ok(p.how && p.bulletinShort, `${r} ${l}`);
      assert.equal(Boolean(p.subRegional), Boolean(SOURCES[r].subRegional), `${r} ${l} island days`);
      assert.doesNotMatch(p.how, SPANISH, `${r} ${l}: ${p.how}`);
    }
  }
});

test("titles ≤ 60, descriptions ≤ 155, in both languages, answering first", () => {
  for (const l of EDITIONS) {
    for (const c of editionCommunities(l)) {
      const n = dayCount(c.region);
      const title = communityTitleIntl(c, l);
      assert.ok(title.length <= EDITION_TITLE_LIMIT, `${l} ${title} (${title.length})`);
      assert.ok(title.includes("2027") && title.includes(String(n)), `${l} ${title}`);
      const description = communityDescriptionIntl(c, l);
      assert.ok(description.length <= EDITION_DESCRIPTION_LIMIT, `${l} ${c.slug}: ${description.length} ${description}`);
      assert.ok(description.includes(String(communityDays(c.region).length)), description);
      for (const text of [title, description, communityH1Intl(c, l), communityLeadIntl(c, l)]) {
        assert.doesNotMatch(text, SPANISH, `${l}: ${text}`);
        assert.doesNotMatch(text, /undefined|null|NaN/, text);
      }
      const faq = communityFaqIntl(c, l);
      assert.equal(faq.length, 4);
      for (const f of faq) assert.doesNotMatch(`${f.question} ${f.answer}`, /undefined|NaN|\bnull\b/, f.question);
      assert.match(faq[0]!.answer, l === "ca" ? /BOE del 13 d'octubre de 2026/ : /BOE of 13 October 2026/);
      for (const line of [decreeLineIntl(c, l), localStatusLineIntl(c, SOURCES[c.region].local, l), weekendLineIntl(c, l) ?? "", notKeptLineIntl(c, l) ?? ""]) {
        assert.doesNotMatch(line, /undefined|NaN/, line);
      }
    }
    for (const t of [HUB_INTL[l].title, BRIDGES_INTL[l].title]) assert.ok(t.length <= EDITION_TITLE_LIMIT, t);
    for (const d of [hubDescriptionIntl(l), bridgesDescriptionIntl(l)]) {
      assert.ok(d.length <= EDITION_DESCRIPTION_LIMIT, `${d.length}: ${d}`);
      assert.doesNotMatch(d, SPANISH, d);
    }
    assert.doesNotMatch(hubLeadIntl(l), SPANISH);
    assert.ok(hubDescriptionIntl(l).startsWith(`${COMMON_DATES.length} `));
  }
  assert.equal(communityH1Intl(editionNames("PV", "ca"), "ca"), "Calendari laboral 2027 del País Basc: festius i ponts");
  assert.equal(communityH1Intl(editionNames("AR", "ca"), "ca"), "Calendari laboral 2027 de l'Aragó: festius i ponts");
  assert.match(communityDescriptionIntl(editionNames("MD", "en"), "en"), /^The Community of Madrid has 12 public holidays in 2027 \(BOE\): 1 and 6 Jan, 19, 25 and 26 Mar, 1 May, 16 Aug, 12 Oct, 1 Nov, 6, 8 and 25 Dec\./);
  assert.match(communityDescriptionIntl(editionNames("MD", "ca"), "ca"), /^La Comunitat de Madrid té 12 festius el 2027 \(BOE\): 1 i 6 gen, 19, 25 i 26 març, 1 maig, 16 ag, 12 oct, 1 nov, 6, 8 i 25 des\./);
});

test("URLs: one slug per community and language, no clash with the static folders or the town slugs", () => {
  assert.equal(editionHubPath("ca"), "/ca/festius/2027/");
  assert.equal(editionHubPath("en"), "/en/holidays/2027/");
  for (const l of EDITIONS) {
    const slugs = editionCommunities(l).map((c) => c.slug);
    assert.equal(new Set(slugs).size, 19);
    for (const s of slugs) assert.match(s, /^[a-z]+(-[a-z]+)*$/, s);
    for (const reserved of [EDITION_BRIDGES_SLUG[l], "ponts", "long-weekends", "dia", "day", "comarca"]) assert.ok(!slugs.includes(reserved), reserved);
    assert.deepEqual(
      editionCommunityParams(l, "x").map((p) => p.x),
      slugs,
    );
    assert.equal(editionCityParams(l, "a", "b").length, CITIES.length);
    assert.equal(resolveEditionCommunity(l, l, editionNames("MD", l).slug)?.region, "MD");
    assert.equal(resolveEditionCommunity(l, "es", editionNames("MD", l).slug), null);
    assert.equal(resolveEditionCommunity(l, l, EDITION_BRIDGES_SLUG[l]), null);
  }
  assert.ok(!municipalities().some((m) => m.slug === "2027"));
  assert.equal(resolveEditionCity("ca", "ca", "andalusia", "sevilla")?.ine, "41091");
  assert.equal(resolveEditionCity("en", "en", "andalusia", "sevilla")?.ine, "41091");
  assert.equal(resolveEditionCity("en", "ca", "andalusia", "sevilla"), null);
  assert.equal(resolveEditionCity("ca", "ca", "arago", "sevilla"), null);
  // Every Spanish page has a Catalan and an English one, and nothing more.
  const perLocale = 21 + CITIES.length;
  assert.equal(spainPaths().length, perLocale);
  assert.equal(editionPaths().length, 2 * perLocale);
  assert.equal(new Set(editionPaths()).size, 2 * perLocale);
  assert.equal(allEditions().length, perLocale);
  for (const e of allEditions()) {
    assert.ok(e.ca.startsWith("/ca/festius/2027/") && e.es.startsWith("/es/festivos/2027/") && e.en.startsWith("/en/holidays/2027/"), JSON.stringify(e));
    assert.ok(spainPaths().includes(e.es), e.es);
  }
  assert.equal(COMMUNITIES.length, 19);
});

test("hreflang: every cluster of the three editions is reciprocal, self-referencing and agrees on x-default", () => {
  type Entry = { url: string; alternates?: { languages?: Record<string, string> } };
  const entries = [...spainSitemapEntries(), ...editionSitemapEntries()] as Entry[];
  assert.equal(entries.length, 3 * (21 + CITIES.length));
  const clusters = new Map<string, Record<string, string>>();
  for (const e of entries) {
    assert.ok(!clusters.has(e.url), `listed twice: ${e.url}`);
    clusters.set(e.url, e.alternates?.languages ?? {});
  }
  const defects: string[] = [];
  for (const [url, languages] of clusters) {
    const locale = url.match(/^https:\/\/www\.catalunyainfo\.com\/(ca|es|en)\//)?.[1] ?? "";
    if (languages[locale] !== url) defects.push(`not self-referencing: ${url}`);
    for (const l of ["ca", "es", "en"]) if (!languages[l]?.startsWith(`${SITE}/${l}/`)) defects.push(`${l} missing: ${url}`);
    if (languages["x-default"] !== languages.en) defects.push(`x-default is not the English page: ${url}`);
    for (const [hreflang, href] of Object.entries(languages)) {
      if (hreflang === "x-default") continue;
      const back = clusters.get(href);
      if (!back) defects.push(`alternate not in the sitemap: ${url} -> ${href}`);
      else if (back[locale] !== url) defects.push(`not reciprocal: ${url} -> ${href}`);
    }
  }
  assert.deepEqual(defects.slice(0, 10), [], `${defects.length} defects`);
});

test("routes: eight new pages, dynamicParams = true (publish group), revalidate = false, notFound() for the rest", () => {
  const files = [
    "festius/2027/page.tsx",
    "festius/2027/ponts/page.tsx",
    "festius/2027/[comunitat]/page.tsx",
    "festius/2027/[comunitat]/[ciutat]/page.tsx",
    "holidays/2027/page.tsx",
    "holidays/2027/long-weekends/page.tsx",
    "holidays/2027/[community]/page.tsx",
    "holidays/2027/[community]/[city]/page.tsx",
  ];
  for (const file of files) {
    const path = join(PUBLIC, file);
    assert.ok(existsSync(path), file);
    const source = readFileSync(path, "utf8");
    assert.match(source, /^export const dynamicParams = true;$/m, file);
    assert.match(source, /^export const revalidate = false;$/m, file);
    assert.match(source, /notFound\(\)/, file);
    assert.match(source, /generateStaticParams/, file);
    const route = file.startsWith("festius") ? "ca" : "en";
    assert.match(source, new RegExp(`"${route}"`), `${file} answers ${route} only`);
  }
});

test("sitemap, publish group and the Spanish pages carry the editions", () => {
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.editionSitemapEntries\(\)/);
  const publish = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(publish, /wants\("calendario-2027-espana"\) \? \[\.\.\.spainPaths\(\), \.\.\.editionPaths\(\)\] : \[\]/);
  const routes = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/routes.tsx"), "utf8");
  assert.match(routes, /editionsOf\(path\)/, "the Spanish pages list their ca and en editions");
  for (const e of spainSitemapEntries()) assert.ok(e.alternates?.languages?.ca && e.alternates.languages.en, e.url);
});

test("links: the Catalan and English pages link only to pages of their own language", () => {
  for (const file of ["pages-intl.tsx", "city-page-intl.tsx", "routes-intl.tsx"]) {
    const source = readFileSync(join(ROOT, "src/components/programmatic/spain-2027", file), "utf8");
    assert.doesNotMatch(source, /["'`]\/es\//, `${file}: a literal Spanish URL`);
    assert.doesNotMatch(source, /spain-2027\/paths"/, `${file}: the Spanish paths`);
    assert.doesNotMatch(source, /(municipalityPath|hubPath)\("es"/, file);
    assert.doesNotMatch(source, /GUIDES\.\w+\.es\b/, file);
    assert.doesNotMatch(source, /href=\{`?\/(es)\//, file);
  }
  // The BOE links are the Spanish edition's, unchanged.
  const pages = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/pages-intl.tsx"), "utf8");
  assert.match(pages, /BOE_REF/);
});
