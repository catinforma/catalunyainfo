import assert from "node:assert/strict";
import { todayPath } from "../src/lib/programmatic/today/paths.ts";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { buildLlmsTxt, liveTools } = await import("../src/lib/seo/llms.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");

// Every family's own list of URLs (what its sitemap emits).
const { holidayFamilyPaths } = await import("../src/lib/programmatic/holidays/paths.ts");
const { fuelFamilyPaths } = await import("../src/lib/programmatic/fuel/sitemap.ts");
const { rodaliesFamilyPaths } = await import("../src/lib/programmatic/rodalies/pages.ts");
const { reservoirFamilyPaths } = await import("../src/lib/programmatic/reservoirs/pages.ts");
const { electionsSitemapPaths } = await import("../src/lib/programmatic/elections/pages.ts");
const { weekendFamilyPaths } = await import("../src/lib/programmatic/weekend/sitemap.ts");
const { christmasFairsPaths } = await import("../src/lib/programmatic/christmas-fairs/sitemap.ts");
const { GUIDES } = await import("../src/lib/programmatic/holidays/links.ts");
const { PATHS: TOOL_PATHS } = await import("../src/lib/content/home-tools.ts");

// Titles and descriptions of every programmatic page.
const holidayCopy = await import("../src/lib/programmatic/holidays/copy.ts");
const holidayData = await import("../src/lib/programmatic/holidays/data.ts");
const holidayEnglish = await import("../src/lib/programmatic/holidays/english-copy.ts");
const holidayEnglishTowns = await import("../src/lib/programmatic/holidays/english.ts");
const { DATE_PAGES } = await import("../src/lib/programmatic/holidays/paths.ts");
const { dateContent } = await import("../src/lib/programmatic/holidays/dates.ts");
const fuelCopy = await import("../src/lib/programmatic/fuel/copy.ts");
const fuelData = await import("../src/lib/programmatic/fuel/data.ts");
const rodalies = await import("../src/lib/programmatic/rodalies/pages.ts");
const { LINES } = await import("../src/lib/programmatic/rodalies/data.ts");
const reservoirCopy = await import("../src/lib/programmatic/reservoirs/copy.ts");
const { RESERVOIR_DATA } = await import("../src/lib/programmatic/reservoirs/data.ts");
const elections = await import("../src/lib/programmatic/elections/pages.ts");
const weekendCopy = await import("../src/lib/programmatic/weekend/copy.ts");
const { shippedZones } = await import("../src/lib/programmatic/weekend/data.ts");
const { weekendWindow } = await import("../src/lib/content/weekend/agenda.ts");

const ORIGIN = "https://www.catalunyainfo.com";

/* -------------------------------------------------------------------------- */
/* llms.txt                                                                   */
/* -------------------------------------------------------------------------- */

test("llms.txt lists every live tool and hub, each with a one-line description", () => {
  const text = buildLlmsTxt(ORIGIN, "CatalunyaInfo", {});
  const hubs = [
    "/ca/festius/", "/es/festivos/", "/en/holidays/",
    "/ca/benzineres/", "/es/gasolineras/",
    "/ca/rodalies/", "/es/rodalies/", "/en/rodalies/",
    "/ca/embassaments/", "/es/embalses/", "/en/reservoirs/",
    "/ca/eleccions/", "/es/elecciones/", "/en/elections/",
    "/ca/cap-de-setmana/", "/es/fin-de-semana/",
    "/ca/fires-de-nadal/", "/es/mercados-navidad/", "/en/christmas-markets/",
    GUIDES.strikes.ca, GUIDES.strikes.es, GUIDES.strikes.en,
  ];
  for (const hub of hubs) assert.ok(text.includes(`(${ORIGIN}${hub})`), `llms.txt does not link ${hub}`);
  const lines = text.split("\n").filter((l) => l.startsWith("- ["));
  assert.equal(lines.length, liveTools().length);
  for (const line of lines) {
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/www\.catalunyainfo\.com\/[^)]+\): [A-Z0-9]/, line);
    assert.ok(!line.includes("\n"));
  }
});

test("every URL llms.txt names is a page a family or guide publishes", () => {
  const known = new Set<string>([
    ...holidayFamilyPaths().map((p) => p.path),
    ...fuelFamilyPaths().map((p) => p.path),
    ...rodaliesFamilyPaths().map((p) => p.path),
    ...reservoirFamilyPaths().map((p) => p.path),
    ...electionsSitemapPaths().map((p) => p.path),
    ...weekendFamilyPaths().map((p) => p.path),
    ...christmasFairsPaths().map((p) => p.path),
    ...Object.values(GUIDES.strikes),
    ...LOCALES.map((l) => `/${l}/${TOOL_PATHS.weekend[l]}/`),
    ...LOCALES.map((l) => todayPath(l)),
  ]);
  for (const tool of liveTools()) {
    for (const href of Object.values(tool.hubs)) assert.ok(known.has(href!), `${tool.name}: ${href} is not a published page`);
  }
});

test("llms.txt is deterministic: guides are sorted by URL whatever order they arrive in", () => {
  const guides = [
    { title: "Zeta", href: "/es/guias/z/", excerpt: "Z  with   spaces" },
    { title: "Alfa", href: "/es/guias/a/", excerpt: null },
    { title: "Mid", href: "/es/guias/m/", excerpt: "M" },
  ];
  const a = buildLlmsTxt(ORIGIN, "CatalunyaInfo", { es: guides });
  const b = buildLlmsTxt(ORIGIN, "CatalunyaInfo", { es: [...guides].reverse() });
  assert.equal(a, b);
  assert.ok(a.indexOf("/es/guias/a/") < a.indexOf("/es/guias/m/") && a.indexOf("/es/guias/m/") < a.indexOf("/es/guias/z/"));
  assert.ok(a.includes("): Z with spaces"));
  assert.ok(a.includes(`- [Alfa](${ORIGIN}/es/guias/a/)\n`));
  // Same input, same bytes, call after call.
  assert.equal(buildLlmsTxt(ORIGIN, "CatalunyaInfo", { es: guides }), a);
});

/* -------------------------------------------------------------------------- */
/* Titles and descriptions of the programmatic families                       */
/* -------------------------------------------------------------------------- */

interface Meta {
  path: string;
  title: string;
  description: string;
}

function allProgrammaticMeta(): Meta[] {
  const out: Meta[] = [];
  for (const locale of ["ca", "es"] as const) {
    const hub = holidayCopy.hubCopy(locale);
    out.push({ path: `holidays-hub-${locale}`, title: hub.title, description: hub.description });
    for (const m of holidayData.municipalities()) {
      out.push({ path: `holidays-${locale}-${m.slug}`, title: holidayCopy.municipalityTitle(m, locale), description: holidayCopy.municipalityDescription(m, locale) });
    }
    const fuelHub = fuelCopy.hubMeta(locale, fuelData.STATIONS.stations.length);
    out.push({ path: `fuel-hub-${locale}`, title: fuelHub.title, description: fuelHub.description });
    for (const place of fuelData.selectPages()) {
      out.push({ path: `fuel-${locale}-${place.kind}-${place.slug}`, title: fuelCopy.fuelTitle(place, locale), description: fuelCopy.fuelDescription(place, locale) });
    }
    for (const line of LINES) {
      out.push({ path: `rodalies-${locale}-${line.id}`, title: rodalies.lineTitle(line, locale), description: rodalies.lineDescription(line, locale) });
    }
    const window = weekendWindow("2026-10-30");
    const weekendHub = weekendCopy.hubMeta(locale, window);
    out.push({ path: `weekend-hub-${locale}`, title: weekendHub.title, description: weekendHub.description });
    for (const zone of shippedZones()) {
      out.push({ path: `weekend-${locale}-${zone.id}`, title: weekendCopy.zoneTitle(zone, locale, window), description: weekendCopy.zoneDescription(zone, locale, window) });
    }
  }
  const englishHub = holidayEnglish.englishHubCopy();
  out.push({ path: "holidays-hub-en", title: englishHub.title, description: englishHub.description });
  for (const m of holidayEnglishTowns.englishTowns()) {
    out.push({ path: `holidays-en-${m.slug}`, title: holidayEnglish.englishTownTitle(m), description: holidayEnglish.englishTownDescription(m) });
  }
  for (const locale of LOCALES) {
    for (const iso of DATE_PAGES) {
      out.push({ path: `date-${locale}-${iso}`, title: holidayCopy.dateQuestion(iso, locale), description: dateContent(iso, locale).description });
    }
    const rh = rodalies.hubMeta(locale);
    out.push({ path: `rodalies-hub-${locale}`, title: rh.title, description: rh.description });
    const resHub = reservoirCopy.hubCopy(locale);
    out.push({ path: `reservoirs-hub-${locale}`, title: resHub.title, description: resHub.description });
    for (const r of RESERVOIR_DATA) {
      out.push({ path: `reservoir-${locale}-${r.slug}`, title: reservoirCopy.reservoirTitle(r, locale), description: reservoirCopy.reservoirDescription(r, locale) });
    }
    const eh = elections.hubMeta(locale);
    out.push({ path: `elections-hub-${locale}`, title: eh.title, description: eh.description });
    for (const m of elections.municipalitiesFor(locale)) {
      out.push({ path: `elections-${locale}-${m.slug}`, title: elections.electionTitle(locale, m), description: elections.electionDescription(locale, m) });
    }
  }
  return out;
}

const META = allProgrammaticMeta();

function duplicates(key: "title" | "description"): string[] {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const m of META) {
    const value = m[key].trim().toLowerCase();
    const first = seen.get(value);
    if (first) dupes.push(`${first} = ${m.path}: ${m[key]}`);
    else seen.set(value, m.path);
  }
  return dupes;
}

test("the programmatic families cover the ~1,600 pages the sitemap lists", () => {
  assert.ok(META.length > 1500, `only ${META.length} pages enumerated`);
});

test("no two programmatic pages share a title", () => {
  assert.deepEqual(duplicates("title"), []);
});

test("no two programmatic pages share a meta description", () => {
  assert.deepEqual(duplicates("description"), []);
});

test("every programmatic title and description fits the snippet", () => {
  for (const m of META) {
    assert.ok(m.title.length <= 62, `${m.path}: title ${m.title.length} chars: ${m.title}`);
    assert.ok(m.description.length >= 70 && m.description.length <= 165, `${m.path}: description ${m.description.length} chars`);
  }
});
