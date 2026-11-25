import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { TOWN_HUB_ELECTION_DAY, townHub, type TownFamily, type TownHub } from "../src/lib/engagement/town-hub.ts";
import type { Locale } from "../src/lib/i18n/config.ts";
import { townName } from "../src/lib/programmatic/christmas-fairs/copy.ts";
import { englishTowns as englishFairTowns, towns } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { townPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { resolveTown } from "../src/lib/programmatic/christmas-fairs/routing.ts";
import { christmasFairEvents } from "../src/lib/programmatic/christmas-fairs/structured.ts";
import { ELECTION_DAY } from "../src/lib/programmatic/elections/election-day.ts";
import { electionPath, municipalitiesFor, placeName, resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";
import { electionDataset } from "../src/lib/programmatic/elections/structured.ts";
import { displayName } from "../src/lib/programmatic/holidays/copy.ts";
import { SNAPSHOT as HOLIDAYS, municipalityBySlug, unlistedTowns } from "../src/lib/programmatic/holidays/data.ts";
import { englishTowns } from "../src/lib/programmatic/holidays/english.ts";
import { enName } from "../src/lib/programmatic/holidays/english-copy.ts";
import { municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { resolveMunicipality, townRouteExists } from "../src/lib/programmatic/holidays/routing.ts";
import { englishTownDataset, municipalityDataset } from "../src/lib/programmatic/holidays/structured.ts";
import { workingDaysPath } from "../src/lib/programmatic/working-days/copy.ts";
import { townPlaceId } from "../src/lib/seo/jsonld.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * Town hubs (18 Nov 2026, lib/engagement/town-hub.ts): each municipality's
 * holiday, Christmas fair and election pages list each other, low on the page,
 * only where the target exists in that language and is indexable; the holiday
 * page leads; the three families describe the same Place.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const TODAY = "2026-11-18";
const pathOnly = (href: string) => href.split("#")[0]!;

type Page = { family: TownFamily; locale: Locale; slug: string; path: string };

/** Every per-town page of the three families, in every language it has. */
function allPages(): Page[] {
  const out: Page[] = [];
  for (const locale of ["ca", "es"] as const) {
    for (const m of HOLIDAYS.municipalities) out.push({ family: "holidays", locale, slug: m.slug, path: municipalityPath(locale, m.slug) });
    for (const u of unlistedTowns()) out.push({ family: "holidays", locale, slug: u.slug, path: municipalityPath(locale, u.slug) });
    for (const t of towns()) out.push({ family: "fair", locale, slug: t.slug, path: townPath(locale, t.slug) });
    for (const m of municipalitiesFor(locale)) out.push({ family: "elections", locale, slug: m.slug, path: electionPath(locale, m.slug) });
  }
  for (const m of englishTowns()) out.push({ family: "holidays", locale: "en", slug: m.slug, path: municipalityPath("en", m.slug) });
  for (const t of englishFairTowns()) out.push({ family: "fair", locale: "en", slug: t.slug, path: townPath("en", t.slug) });
  for (const m of municipalitiesFor("en")) out.push({ family: "elections", locale: "en", slug: m.slug, path: electionPath("en", m.slug) });
  return out;
}
const PAGES = allPages();

/** Which family a site path belongs to, and whether that page exists for the slug. */
function targetExists(path: string, locale: Locale, slug: string): TownFamily | "workingDays" | null {
  if (path === workingDaysPath(locale)) return "workingDays";
  if (path === municipalityPath(locale, slug)) {
    const ok = locale === "en" ? Boolean(resolveMunicipality("en", "en", slug)) : townRouteExists(locale, locale, slug);
    return ok ? "holidays" : null;
  }
  if (path === townPath(locale, slug)) return resolveTown(locale, locale, slug) ? "fair" : null;
  if (path === electionPath(locale, slug)) return resolveElectionPage(locale, locale, slug) ? "elections" : null;
  return null;
}

/** Markup TownHub.tsx renders for a block, for the size guard. */
function markup(hub: TownHub): string {
  let html = `<nav aria-labelledby="ci-town-hub" class="ci-town-hub" data-ci-placement="town_hub"><h2 id="ci-town-hub" class="ci-town-hub-title">${hub.title}</h2><ul class="ci-town-hub-list">`;
  for (const l of hub.links) {
    html += `<li><a href="${l.href}">${l.label}</a>${(l.more ?? []).map((m) => ` · <a href="${m.href}">${m.label}</a>`).join("")}</li>`;
  }
  return `${html}</ul></nav>`;
}

test("every link is a page the town has in the reader's language, indexable, never the page's own family", () => {
  let blocks = 0;
  for (const p of PAGES) {
    const hub = townHub(p.slug, p.locale, p.family, TODAY);
    if (!hub) continue;
    blocks += 1;
    const what = `${p.path}`;
    assert.ok(hub.links.some((l) => l.family !== "workingDays" && l.family !== p.family), `${what}: no other family's page`);
    const hrefs = hub.links.flatMap((l) => [l.href, ...(l.more ?? []).map((m) => m.href)]);
    assert.equal(new Set(hrefs).size, hrefs.length, `${what}: a link twice`);
    for (const href of hrefs) {
      const path = pathOnly(href);
      const family = targetExists(path, p.locale, p.slug);
      assert.ok(family, `${what}: ${href} is not one of the town's pages in ${p.locale}`);
      assert.notEqual(family, p.family, `${what}: links its own family (${href})`);
      assert.notEqual(path, p.path, `${what}: links itself`);
      assert.equal(isLowDemandPath(path, TODAY), false, `${what}: links the noindex ${path}`);
    }
    for (const l of hub.links) assert.ok(l.label.length >= 12 && !/^(aquí|here|click|clic|más|more|leer|llegir)/i.test(l.label), `${what}: anchor "${l.label}"`);
  }
  assert.ok(blocks > 1000, `only ${blocks} pages carry the block`);
});

test("the pages of one town link each other both ways, the holiday page first", () => {
  const indexable = PAGES.filter((p) => !isLowDemandPath(p.path, TODAY));
  const bySlugLocale = new Map<string, Page[]>();
  for (const p of indexable) bySlugLocale.set(`${p.locale}/${p.slug}`, [...(bySlugLocale.get(`${p.locale}/${p.slug}`) ?? []), p]);
  let pairs = 0;
  for (const group of bySlugLocale.values()) {
    for (const a of group) {
      const links = townHub(a.slug, a.locale, a.family, TODAY)?.links.map((l) => pathOnly(l.href)) ?? [];
      for (const b of group) {
        if (a === b) continue;
        // A fair page is linked while one of its fairs is still to end.
        const fairOver = b.family === "fair" && !towns().find((t) => t.slug === b.slug)!.fairs.some((f) => f.end >= TODAY);
        if (fairOver) continue;
        assert.ok(links.includes(b.path), `${a.path} does not link ${b.path}`);
        pairs += 1;
      }
      const hub = townHub(a.slug, a.locale, a.family, TODAY);
      if (hub && a.family !== "holidays" && group.some((g) => g.family === "holidays")) {
        assert.equal(pathOnly(hub.links[0]!.href), municipalityPath(a.locale, a.slug), `${a.path}: the holiday page is not first`);
      }
    }
  }
  assert.ok(pairs > 500, `only ${pairs} links between indexable pages`);
});

test("the holiday page's own sections are reached through it, and the .ics feed (noindex) through its subscribe box", () => {
  // Mataró has a Christmas fair page since 25 Nov 2026 (Fira de Nadal, 27 Nov - 23 Dec): the hub links it.
  const ca = townHub("mataro", "ca", "elections", TODAY)!;
  assert.equal(ca.title, "Mataró: tot el que hi ha a CatalunyaInfo");
  assert.deepEqual(
    ca.links.flatMap((l) => [l.href, ...(l.more ?? []).map((m) => m.href)]),
    ["/ca/festius/mataro/", "/ca/festius/mataro/#festius-2027", "/ca/festius/mataro/#avui", "/ca/fires-de-nadal/mataro/", "/ca/calculadores/dies-habils/#p=mataro", "/ca/festius/mataro/#afegeix-calendari"],
  );
  const en = townHub("barcelona", "en", "elections", TODAY)!;
  assert.ok(en.links.some((l) => l.more?.some((m) => m.href === "/en/holidays/barcelona/#holidays-2027")));
  assert.ok(en.links.some((l) => l.more?.some((m) => m.href === "/en/holidays/barcelona/#today")));
  // On the holiday page itself: none of its own sections, no feed.
  const hub = townHub("mataro", "es", "holidays", TODAY)!;
  assert.ok(hub.links.every((l) => !l.href.startsWith("/es/festivos/mataro/")));
  // The ids those links open exist where they point.
  assert.match(read("src/components/programmatic/holidays/MunicipalityPage.tsx"), /<h2 id="festius-2027">[^]*<h2 id="avui">|<h2 id="avui">[^]*<h2 id="festius-2027">/);
  assert.match(read("src/components/programmatic/holidays/EnglishTownPage.tsx"), /<h2 id="today">[^]*<h2 id="holidays-2027">/);
  assert.match(read("src/components/programmatic/ics/CalendarSubscribe.tsx"), /const id = "afegeix-calendari";/);
  // Feeds are never linked directly from the block.
  for (const p of PAGES.slice(0, 400)) {
    for (const l of townHub(p.slug, p.locale, p.family, TODAY)?.links ?? []) assert.doesNotMatch(l.href, /\.ics|^webcal:/);
  }
});

test("the election item says where to vote until 29N, then the results; a fair leaves once its season is over", () => {
  assert.equal(TOWN_HUB_ELECTION_DAY, ELECTION_DAY.day);
  const label = (today: string, locale: Locale) => townHub("sabadell", locale, "holidays", today)!.links.find((l) => l.family === "elections")!.label;
  assert.equal(label("2026-11-29", "ca"), "On votar el 29N a Sabadell: locals electorals i meses");
  assert.equal(label("2026-11-30", "ca"), "Resultats de les eleccions a Sabadell");
  assert.equal(label("2026-11-30", "es"), "Resultados de las elecciones en Sabadell");
  // The Catalan article: "al Prat", as the election page's own H1 writes it.
  assert.equal(townHub("el-prat-de-llobregat", "ca", "holidays", "2026-11-30")!.links.find((l) => l.family === "elections")!.label, "Resultats de les eleccions al Prat de Llobregat");

  const town = towns().find((t) => t.fairs.every((f) => f.end))!;
  const last = town.fairs.map((f) => f.end).sort().at(-1)!;
  const during = townHub(town.slug, "ca", "holidays", last);
  const after = townHub(town.slug, "ca", "holidays", "2027-02-01");
  const fair = townPath("ca", town.slug);
  if (during) assert.ok(during.links.some((l) => l.href === fair) || isLowDemandPath(fair), `${town.slug}: fair missing on its last day`);
  assert.ok(!(after?.links ?? []).some((l) => l.href === fair), `${town.slug}: fair still linked after the season`);
});

test("the election pages this block assumes are exactly the elections family's", () => {
  // ca/es: every municipality; en: the English selection (english.ts, shared by both families).
  for (const locale of ["ca", "es", "en"] as const) {
    for (const m of municipalitiesFor(locale)) {
      const hub = townHub(m.slug, locale, "fair", TODAY);
      // Reaching the elections item: present unless noindex.
      const linked = hub?.links.some((l) => l.href === electionPath(locale, m.slug)) ?? false;
      if (!isLowDemandPath(electionPath(locale, m.slug), TODAY)) assert.ok(linked, `${locale}/${m.slug}: election page not offered`);
    }
  }
  const enSlugs = new Set(municipalitiesFor("en").map((m) => m.slug));
  for (const m of HOLIDAYS.municipalities) {
    const hub = townHub(m.slug, "en", "fair", TODAY);
    if (!enSlugs.has(m.slug)) assert.ok(!(hub?.links ?? []).some((l) => l.family === "elections"), `en/${m.slug}: no English election page`);
  }
});

test("the block stays small: under 1.2 KB of markup on every page", () => {
  let max = 0;
  for (const p of PAGES) {
    const hub = townHub(p.slug, p.locale, p.family, TODAY);
    if (hub) max = Math.max(max, Buffer.byteLength(markup(hub), "utf8"));
  }
  assert.ok(max > 0 && max <= 1200, `largest block ${max} bytes`);
});

test("one Place per town: the holiday, election and fair pages share its @id, and the crumbs its name", () => {
  const fairTown = towns().find((t) => municipalityBySlug(t.slug) && t.fairs.some((f) => !f.toConfirm))!;
  const m = municipalityBySlug(fairTown.slug)!;
  const e = municipalitiesFor("ca").find((x) => x.slug === m.slug)!;
  const id = townPlaceId(m.ine);
  assert.equal(id, `https://www.catalunyainfo.com/#municipality-${m.ine}`);
  for (const locale of ["ca", "es"] as const) {
    const hol = municipalityDataset(m, locale) as { spatialCoverage: Record<string, string> };
    const ele = electionDataset(e, locale, "x") as { spatialCoverage: Record<string, string> } | null;
    assert.equal(hol.spatialCoverage["@id"], id);
    if (ele) assert.equal(ele.spatialCoverage["@id"], id);
    const events = christmasFairEvents(fairTown.fairs, townPath(locale, fairTown.slug), locale) as { location: Record<string, unknown> }[];
    assert.ok(events.length > 0);
    for (const ev of events) {
      assert.equal(ev.location["@id"], id);
      // Nothing invented: no coordinates, no population.
      assert.equal(ev.location.geo, undefined);
    }
    assert.equal(hol.spatialCoverage.geo, undefined);
  }
  const en = englishTowns()[0]!;
  assert.equal((englishTownDataset(en) as { spatialCoverage: Record<string, string> }).spatialCoverage["@id"], townPlaceId(en.ine));
  // INE codes and names agree across the families, so the town crumb reads the same on all three.
  const elections = new Map(municipalitiesFor("ca").map((x) => [x.code, x]));
  for (const h of HOLIDAYS.municipalities) {
    const x = elections.get(h.ine)!;
    assert.equal(x.slug, h.slug, h.ine);
    for (const locale of ["ca", "es"] as const) assert.equal(placeName(x, locale), displayName(h, locale), `${h.ine} ${locale}`);
    assert.equal(placeName(x, "en"), enName(h));
  }
  for (const t of towns()) {
    const x = elections.get(t.ine)!;
    assert.equal(x.slug, t.slug, t.ine);
    for (const locale of ["ca", "es", "en"] as const) assert.equal(townName(t.name, locale), placeName(x, locale), `${t.ine} ${locale}`);
  }
});

test("templates render the block server-side, low on the page: after the answer, the next-step box and the FAQ", () => {
  const box = read("src/components/TownHub.tsx");
  assert.doesNotMatch(box, /"use client"/);
  assert.match(box, /data-ci-placement="town_hub"/);
  assert.match(box, /prefetch=\{false\}/);
  for (const [file, re] of [
    ["src/components/programmatic/holidays/MunicipalityPage.tsx", /<NextStep step=\{townNextStep\([^]*?<h2 id="preguntes">[^]*?<TownHub hub=\{townHub\(m\.slug, locale, "holidays"/],
    ["src/components/programmatic/holidays/UnlistedTownPage.tsx", /<h2 id="preguntes">[^]*?<TownHub hub=\{townHub\(u\.slug, locale, "holidays"/],
    ["src/components/programmatic/holidays/EnglishTownPage.tsx", /<NextStep step=\{townNextStep\([^]*?<h2 id="faq">[^]*?<TownHub hub=\{townHub\(m\.slug, "en", "holidays"/],
    ["src/components/programmatic/christmas-fairs/TownPage.tsx", /<NextStep\s+step=\{christmasNextStep\([^]*?<GuidanceShort locale=\{locale\} \/>\s*\{\/\*[^*]*\*\/\}\s*<TownHub hub=\{townHub\(town\.slug, locale, "fair", checked\)\} \/>/],
    ["src/components/programmatic/ElectionResultsPage.tsx", /<NextStep step=\{electionTownNextStep\([^]*?\{model\.faqTitle\}[^]*?<TownHub hub=\{townHub\(municipality\.slug, locale, "elections"[^]*?ci-elections-siblings/],
  ] as const) {
    assert.match(read(file), re, file);
    assert.equal((read(file).match(/<TownHub /g) ?? []).length, 1, file);
  }
});

test("a click in the block is related_content_click with link_context town_hub", () => {
  const base = { siteHost: "www.catalunyainfo.com", locale: "ca", channelUrl: "https://whatsapp.com/channel/x", inSources: false, inCalculator: false };
  assert.deepEqual(classifyLinkClick({ ...base, href: "https://www.catalunyainfo.com/ca/festius/mataro/#avui", placement: "town_hub" }), {
    name: "related_content_click",
    params: { link_context: "town_hub", link_url: "/ca/festius/mataro/", locale: "ca" },
  });
});
