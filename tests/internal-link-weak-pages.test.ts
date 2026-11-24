import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { englishTowns, hasEnglish, nearbyTowns, townBySlug } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { SNAPSHOT, keptComarcaSiblings, siblings as holidaySiblings } from "../src/lib/programmatic/holidays/data.ts";
import { municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { MIN_SIBLINGS, electionPath, keptSiblings, municipalitiesFor, siblings as electionSiblings } from "../src/lib/programmatic/elections/pages.ts";
import { buildElectionPage } from "../src/lib/programmatic/elections/model.ts";
import { CITIES, MIN_CITY_LINKS, citiesOf, similarCities } from "../src/lib/programmatic/spain-2027/cities.ts";
import { editionCityPath } from "../src/lib/programmatic/spain-2027/editions.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * Weakly linked pages (25 Nov 2026, docs/SEO_EXPERIMENTS.md): the town and
 * city pages Google keeps were linked from the hub and, at best, one
 * neighbour, because their neighbours-in-size are pages kept out of the index.
 * These tests pin the template-level fix: indexable pages are added to the
 * neighbour blocks, never a noindex one, and the number of indexable pages
 * with two or fewer indexable in-body links from neighbour blocks cannot grow
 * back. Counts measured on 25 Nov 2026 (before in the comments).
 */

const ROOT = join(import.meta.dirname, "..");
const TODAY = "2026-11-25";
const kept = (path: string) => !isLowDemandPath(path, TODAY);

function weak(counts: Map<string, number>, keys: string[], max = 2): number {
  return keys.filter((k) => (counts.get(k) ?? 0) <= max).length;
}

test("holiday town pages: extra comarca links go to indexable towns only, not listed yet, at most six", () => {
  for (const locale of ["ca", "es"] as const) {
    const isKept = (o: { slug: string }) => kept(municipalityPath(locale, o.slug));
    for (const m of SNAPSHOT.municipalities) {
      const listed = holidaySiblings(m).sameComarca;
      const extra = keptComarcaSiblings(m, listed, isKept);
      assert.ok(extra.length <= 6, m.slug);
      for (const o of extra) {
        assert.ok(isKept(o), `${locale}/${m.slug} -> ${o.slug} is noindex`);
        assert.equal(o.comarca, m.comarca);
        assert.notEqual(o.slug, m.slug);
        assert.ok(!listed.some((l) => l.slug === o.slug), `${m.slug}: ${o.slug} listed twice`);
      }
    }
  }
});

test("holiday town pages: indexable towns with two or fewer indexable neighbour links fall by a third or more (25 Nov: ca 62 -> 30, es 59 -> 31)", () => {
  for (const locale of ["ca", "es"] as const) {
    const isKept = (o: { slug: string }) => kept(municipalityPath(locale, o.slug));
    const keptTowns = SNAPSHOT.municipalities.filter(isKept);
    const before = new Map<string, number>();
    const after = new Map<string, number>();
    for (const m of keptTowns) {
      const s = holidaySiblings(m);
      for (const o of [...s.sameComarca, ...s.others]) if (isKept(o)) before.set(o.slug, (before.get(o.slug) ?? 0) + 1);
      for (const o of [...s.sameComarca, ...keptComarcaSiblings(m, s.sameComarca, isKept), ...s.others]) if (isKept(o)) after.set(o.slug, (after.get(o.slug) ?? 0) + 1);
    }
    const slugs = keptTowns.map((m) => m.slug);
    const [b, a] = [weak(before, slugs), weak(after, slugs)];
    assert.ok(a <= Math.ceil(b * 0.67), `${locale}: ${b} -> ${a}`);
  }
  // A town the live crawl found linked from the hub and one neighbour only (ca "ordis", 66 impressions).
  const ordis = SNAPSHOT.municipalities.find((m) => m.slug === "ordis")!;
  const isKept = (o: { slug: string }) => kept(municipalityPath("ca", o.slug));
  const into = SNAPSHOT.municipalities.filter(
    (m) => isKept(m) && m.slug !== "ordis" && [...holidaySiblings(m).sameComarca, ...keptComarcaSiblings(m, holidaySiblings(m).sameComarca, isKept)].some((o) => o.slug === ordis.slug),
  );
  assert.ok(into.length >= 3, `Ordis is linked from ${into.length} indexable town pages`);
});

test("the holiday town page merges the extra towns into its comarca list", () => {
  const page = readFileSync(join(ROOT, "src/components/programmatic/holidays/MunicipalityPage.tsx"), "utf8");
  assert.match(page, /keptComarcaSiblings\(m, listedComarca/);
  assert.match(page, /!isLowDemandPath\(municipalityPath\(locale, o\.slug\)\)/);
});

test("election town pages: extra links are indexable pages of the same language; weak pages fall by two thirds or more (25 Nov: ca 70 -> 6, es 73 -> 15)", () => {
  for (const locale of ["ca", "es"] as const) {
    const isKept = (x: { slug: string }) => kept(electionPath(locale, x.slug));
    const keptTowns = municipalitiesFor(locale).filter(isKept);
    const before = new Map<string, number>();
    const after = new Map<string, number>();
    for (const m of keptTowns) {
      const s = electionSiblings(m, locale);
      const listed = [...s.sameComarca, ...s.sameProvince];
      const extra = keptSiblings(m, locale, listed);
      assert.equal(extra.elsewhere.length, 0, `${locale}/${m.slug}: padded although it has siblings`);
      assert.ok(extra.sameComarca.length <= 6);
      for (const o of extra.sameComarca) {
        assert.ok(isKept(o), `${locale}/${m.slug} -> ${o.slug} is noindex`);
        assert.equal(o.comarca, m.comarca);
        assert.ok(!listed.some((l) => l.slug === o.slug));
      }
      for (const o of listed) if (isKept(o)) before.set(o.slug, (before.get(o.slug) ?? 0) + 1);
      for (const o of [...listed, ...extra.sameComarca]) if (isKept(o)) after.set(o.slug, (after.get(o.slug) ?? 0) + 1);
    }
    const slugs = keptTowns.map((m) => m.slug);
    const [b, a] = [weak(before, slugs), weak(after, slugs)];
    assert.ok(a <= Math.ceil(b * 0.34), `${locale}: ${b} -> ${a}`);
  }
});

test("election town pages: the built page carries the extra links, once each, in the reader's language", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    for (const m of municipalitiesFor(locale).slice(0, 40)) {
      const links = buildElectionPage(m, locale).siblings.groups.flatMap((g) => g.links.map((l) => l.href));
      assert.equal(new Set(links).size, links.length, `${locale}/${m.slug}: a target linked twice`);
      assert.ok(links.every((href) => href.startsWith(`/${locale}/`)), `${locale}/${m.slug}: a link in another language`);
      assert.ok(!links.includes(electionPath(locale, m.slug)), `${locale}/${m.slug}: links itself`);
    }
  }
  // Catalan page of a big comarca: Alt Empordà's small indexable town now carries indexable comarca-mates.
  const ca = municipalitiesFor("ca").find((m) => m.slug === "l-albiol")!;
  const group = buildElectionPage(ca, "ca").siblings.groups[0]!;
  assert.ok(group.links.length >= 7, "comarca group grew by the indexable towns");
});

test("English election pages with few neighbours are padded to the minimum with indexable pages", () => {
  const lleida = municipalitiesFor("en").find((m) => m.slug === "lleida")!;
  const s = electionSiblings(lleida, "en");
  const listed = [...s.sameComarca, ...s.sameProvince];
  const extra = keptSiblings(lleida, "en", listed);
  assert.ok(listed.length + extra.sameComarca.length + extra.elsewhere.length >= MIN_SIBLINGS);
  for (const o of [...extra.sameComarca, ...extra.elsewhere]) assert.ok(kept(electionPath("en", o.slug)), o.slug);
});

test("Spain 2027 city pages: pages with few indexable neighbours get cities of a similar size elsewhere, indexable only", () => {
  for (const edition of ["ca", "en"] as const) {
    const isKept = (x: (typeof CITIES)[number]) => kept(editionCityPath(edition, x));
    for (const c of CITIES.filter((x) => x.region === "MC" || x.region === "PV" || x.region === "VC")) {
      const neighbours = citiesOf(c.region).filter((x) => x.slug !== c.slug);
      const keptNeighbours = neighbours.filter(isKept).length;
      const similar = similarCities(c, keptNeighbours, isKept);
      assert.equal(similar.length, keptNeighbours >= MIN_CITY_LINKS ? 0 : Math.min(MIN_CITY_LINKS - keptNeighbours, CITIES.filter((x) => x.region !== c.region && isKept(x)).length));
      for (const x of similar) {
        assert.ok(isKept(x), `${edition}: ${c.slug} -> ${x.slug} is noindex`);
        assert.notEqual(x.region, c.region);
      }
    }
  }
  // Mazarron (Murcia): every neighbour is out of the English index, so it links six indexable cities.
  const mazarron = CITIES.find((c) => c.slug === "mazarron")!;
  const isKeptEn = (x: (typeof CITIES)[number]) => kept(editionCityPath("en", x));
  const mz = similarCities(mazarron, citiesOf(mazarron.region).filter((x) => x.slug !== "mazarron").filter(isKeptEn).length, isKeptEn);
  assert.equal(mz.length, MIN_CITY_LINKS);
});

test("Spain 2027 city pages: indexable English cities with two or fewer indexable city links fall by half or more (25 Nov: 10 -> 3)", () => {
  const isKept = (x: (typeof CITIES)[number]) => kept(editionCityPath("en", x));
  const keptCities = CITIES.filter(isKept);
  const before = new Map<string, number>();
  const after = new Map<string, number>();
  const key = (x: (typeof CITIES)[number]) => `${x.region}/${x.slug}`;
  for (const c of keptCities) {
    const neighbours = citiesOf(c.region).filter((x) => x.slug !== c.slug).filter(isKept);
    for (const x of neighbours) before.set(key(x), (before.get(key(x)) ?? 0) + 1);
    for (const x of [...neighbours, ...similarCities(c, neighbours.length, isKept)]) after.set(key(x), (after.get(key(x)) ?? 0) + 1);
  }
  const keys = keptCities.map(key);
  const [b, a] = [weak(before, keys), weak(after, keys)];
  assert.ok(a <= Math.ceil(b * 0.5), `${b} -> ${a}`);
});

test("the city pages render the similar-size block in es, ca and en", () => {
  const es = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/city-page.tsx"), "utf8");
  const intl = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/city-page-intl.tsx"), "utf8");
  assert.match(es, /similarCities\(c, neighbours\.length/);
  assert.match(es, /Ciudades de otras comunidades de tamaño parecido/);
  assert.match(intl, /similarCities\(c, neighbours\.filter\(isKept\)\.length, isKept\)/);
  assert.match(intl, /Ciutats d'altres comunitats de mida semblant/);
  assert.match(intl, /Cities of a similar size in other regions/);
});

test("English Christmas market pages link the other English pages (Vic was linked from two pages)", () => {
  const vic = townBySlug("vic")!;
  const en = englishTowns();
  assert.ok(en.length >= 4);
  // The accept filter runs before the limit: every English page is a candidate, not only those among the 12 nearest.
  const nearbyEn = nearbyTowns(vic, 12, hasEnglish);
  assert.ok(nearbyEn.every(hasEnglish));
  assert.ok(nearbyEn.some((t) => t.slug === "barcelona"));
  // Every English market page is linked from every other English one through nearby or same-weekend links.
  const page = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/TownPage.tsx"), "utf8");
  assert.match(page, /sameWeekendFairs\(town, locale === "en" \? 99 : 16\)/);
  assert.match(page, /nearbyTowns\(town, 12, locale === "en" \? hasEnglish : undefined\)/);
  // Default behaviour (no filter) is unchanged.
  assert.deepEqual(
    nearbyTowns(vic, 6).map((t) => t.slug),
    nearbyTowns(vic, 6, () => true).map((t) => t.slug),
  );
});
