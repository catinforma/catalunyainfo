import assert from "node:assert/strict";
import { todayPath } from "../src/lib/programmatic/today/paths.ts";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { buildLlmsTxt, liveTools, trustPages, LLMS_SUMMARY } = await import("../src/lib/seo/llms.ts");
const { legalPath, sectionPath } = await import("../src/lib/i18n/routes.ts");
const { siteAuthorPath } = await import("../src/lib/content/author.ts");
const { b2href } = await import("../src/lib/content/batch02/shared.ts");
const { SITE, WHATSAPP_CHANNEL } = await import("../src/lib/site.ts");
const { spainHubPath } = await import("../src/lib/programmatic/spain-2027/paths.ts");
const { editionHubPath, editionPaths } = await import("../src/lib/programmatic/spain-2027/editions.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");

// Every family's own list of URLs (what its sitemap emits).
const { holidayFamilyPaths } = await import("../src/lib/programmatic/holidays/paths.ts");
const { fuelFamilyPaths } = await import("../src/lib/programmatic/fuel/sitemap.ts");
const { spainFamilyPaths } = await import("../src/lib/programmatic/fuel/spain-sitemap.ts");
const { rodaliesFamilyPaths } = await import("../src/lib/programmatic/rodalies/pages.ts");
const { reservoirFamilyPaths } = await import("../src/lib/programmatic/reservoirs/pages.ts");
const { pvpcFamilyPaths } = await import("../src/lib/programmatic/pvpc/pages.ts");
const { butaneFamilyPaths } = await import("../src/lib/programmatic/butane/page.ts");
const { warningsFamilyPaths } = await import("../src/lib/programmatic/warnings/page.ts");
const { electionsSitemapPaths } = await import("../src/lib/programmatic/elections/pages.ts");
const { weekendFamilyPaths } = await import("../src/lib/programmatic/weekend/sitemap.ts");
const { christmasFairsPaths } = await import("../src/lib/programmatic/christmas-fairs/sitemap.ts");
const { GUIDES } = await import("../src/lib/programmatic/holidays/links.ts");
const { leaveEditions } = await import("../src/lib/programmatic/leave-2027/copy.ts");
const { netSalaryEditions } = await import("../src/lib/programmatic/net-salary/copy.ts");
const { extraPayEditions } = await import("../src/lib/programmatic/extra-pay/copy.ts");
const { selfEmployedEditions } = await import("../src/lib/programmatic/self-employed/copy.ts");
const { sickLeaveEditions } = await import("../src/lib/programmatic/sick-leave/copy.ts");
const { paidLeaveEditions } = await import("../src/lib/programmatic/paid-leave/copy.ts");
const { subsidyEditions } = await import("../src/lib/programmatic/unemployment-subsidy/copy.ts");
const { CALC_KEYS, calcEditions, calculatorsHubEditions } = await import("../src/lib/programmatic/calculators/paths.ts");
const { rentEditions } = await import("../src/lib/programmatic/rent-update/copy.ts");
const { pensionEditions } = await import("../src/lib/programmatic/pensions-2027/copy.ts");
const { workingDaysEditions } = await import("../src/lib/programmatic/working-days/copy.ts");
const { smiEditions } = await import("../src/lib/programmatic/smi/copy.ts");
const { ipremEditions } = await import("../src/lib/programmatic/iprem/copy.ts");
const { ipcEditions } = await import("../src/lib/programmatic/ipc/copy.ts");
const { wageEditions } = await import("../src/lib/programmatic/average-salary/copy.ts");
const { letrasEditions } = await import("../src/lib/programmatic/treasury-bills/copy.ts");
const { euriborEditions } = await import("../src/lib/programmatic/euribor/copy.ts");
const { mortgageEditions } = await import("../src/lib/programmatic/mortgage/copy.ts");
const { itvEditions } = await import("../src/lib/programmatic/itv/copy.ts");
const { htEditions } = await import("../src/lib/programmatic/home-purchase-tax/copy.ts");
const { pcEditions } = await import("../src/lib/programmatic/purchase-costs/copy.ts");
const { pvEditions } = await import("../src/lib/programmatic/plusvalia/copy.ts");
const { isdEditions } = await import("../src/lib/programmatic/inheritance-tax/copy.ts");
const { regionEditions: isdRegionEditions } = await import("../src/lib/programmatic/inheritance-tax/regional-copy.ts");
const { giftEditions } = await import("../src/lib/programmatic/gift-tax/copy.ts");
const { cmpEditions } = await import("../src/lib/programmatic/inheritance-compare/paths.ts");
const { lotteryTaxEditions } = await import("../src/lib/programmatic/lottery-tax/copy.ts");
const { checkEditions } = await import("../src/lib/programmatic/lottery-check/paths.ts");
const { grossaCheckEditions } = await import("../src/lib/programmatic/grossa-check/paths.ts");
const { ninoCheckEditions } = await import("../src/lib/programmatic/nino-check/paths.ts");
const { gordoHubTranslations } = await import("../src/lib/programmatic/gordo/paths.ts");
const { bonoSocialEditions } = await import("../src/lib/programmatic/bono-social/copy.ts");
const { trafficFinesEditions } = await import("../src/lib/programmatic/traffic-fines/copy.ts");
const { retirementEditions } = await import("../src/lib/programmatic/retirement-age/copy.ts");
const { widowEditions } = await import("../src/lib/programmatic/widow-pension/copy.ts");
const { ncEditions } = await import("../src/lib/programmatic/non-contributory-pension/copy.ts");
const { ztEditions } = await import("../src/lib/programmatic/zona-tensionada/copy.ts");
const { reportEditions } = await import("../src/lib/programmatic/holidays/report-copy.ts");
const { PATHS: TOOL_PATHS } = await import("../src/lib/content/home-tools.ts");
const { zbeFamilyPaths } = await import("../src/lib/programmatic/zbe/sitemap.ts");
const { zonaAzulPaths } = await import("../src/lib/programmatic/zona-azul/sitemap.ts");
const { weeklyMarketsPaths } = await import("../src/lib/programmatic/weekly-markets/sitemap.ts");
const { pollsTranslations } = await import("../src/lib/programmatic/polls/paths.ts");

// Titles and descriptions of every programmatic page.
const holidayCopy = await import("../src/lib/programmatic/holidays/copy.ts");
const holidayData = await import("../src/lib/programmatic/holidays/data.ts");
const holidayEnglish = await import("../src/lib/programmatic/holidays/english-copy.ts");
const holidayEnglishTowns = await import("../src/lib/programmatic/holidays/english.ts");
const { DATE_PAGES } = await import("../src/lib/programmatic/holidays/paths.ts");
const { dateContent, dateTitle } = await import("../src/lib/programmatic/holidays/dates.ts");
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
    "/es/precio-luz/", "/ca/preu-llum/", "/en/electricity-price-spain/",
    "/es/precio-butano/", "/ca/preu-buta/", "/en/butane-price-spain/",
    "/ca/avisos/", "/es/avisos/", "/en/warnings/",
    "/ca/eleccions/", "/es/elecciones/", "/en/elections/",
    "/ca/cap-de-setmana/", "/es/fin-de-semana/",
    "/ca/fires-de-nadal/", "/es/mercados-navidad/", "/en/christmas-markets/",
    GUIDES.strikes.ca, GUIDES.strikes.es, GUIDES.strikes.en,
  ];
  for (const hub of hubs) assert.ok(text.includes(`(${ORIGIN}${hub})`), `llms.txt does not link ${hub}`);
  const toolsSection = text.split("\n## ")[1] ?? "";
  assert.ok(toolsSection.startsWith("Live tools and data"));
  const lines = toolsSection.split("\n").filter((l) => l.startsWith("- ["));
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
    ...spainFamilyPaths().map((p) => p.path),
    ...rodaliesFamilyPaths().map((p) => p.path),
    ...reservoirFamilyPaths().map((p) => p.path),
    ...pvpcFamilyPaths().map((p) => p.path),
    ...butaneFamilyPaths().map((p) => p.path),
    ...warningsFamilyPaths().map((p) => p.path),
    ...electionsSitemapPaths().map((p) => p.path),
    ...weekendFamilyPaths().map((p) => p.path),
    ...christmasFairsPaths().map((p) => p.path),
    ...zbeFamilyPaths().map((p) => p.path),
    ...zonaAzulPaths().map((p) => p.path),
    ...weeklyMarketsPaths().map((p) => p.path),
    ...Object.values(pollsTranslations()),
    ...Object.values(GUIDES.strikes),
    ...LOCALES.map((l) => `/${l}/${TOOL_PATHS.weekend[l]}/`),
    ...LOCALES.map((l) => todayPath(l)),
    ...Object.values(leaveEditions()),
    ...Object.values(netSalaryEditions()),
    ...Object.values(extraPayEditions()),
    ...Object.values(selfEmployedEditions()),
    ...Object.values(sickLeaveEditions()),
    ...Object.values(paidLeaveEditions()),
    ...Object.values(subsidyEditions()),
    ...CALC_KEYS.flatMap((k) => Object.values(calcEditions(k))),
    ...Object.values(rentEditions()),
    ...Object.values(calculatorsHubEditions()),
    ...Object.values(pensionEditions()),
    ...Object.values(workingDaysEditions()),
    ...Object.values(smiEditions()),
    ...Object.values(ipremEditions()),
    ...Object.values(ipcEditions()),
    ...Object.values(wageEditions()),
    ...Object.values(letrasEditions()),
    ...Object.values(euriborEditions()),
    ...Object.values(mortgageEditions()),
    ...Object.values(itvEditions()),
    ...Object.values(htEditions()),
    ...Object.values(pcEditions()),
    ...Object.values(pvEditions()),
    ...Object.values(isdEditions()),
    ...Object.values(isdRegionEditions("madrid")),
    ...Object.values(isdRegionEditions("andalucia")),
    ...Object.values(isdRegionEditions("valencia")),
    ...Object.values(giftEditions("catalonia")),
    ...Object.values(giftEditions("madrid")),
    ...Object.values(giftEditions("andalucia")),
    ...Object.values(giftEditions("valencia")),
    ...Object.values(cmpEditions()),
    ...Object.values(lotteryTaxEditions()),
    ...Object.values(bonoSocialEditions()),
    ...Object.values(trafficFinesEditions()),
    ...Object.values(retirementEditions()),
    ...Object.values(widowEditions()),
    ...Object.values(ncEditions()),
    ...Object.values(ztEditions()),
    ...Object.values(checkEditions()),
    ...Object.values(grossaCheckEditions()),
    ...Object.values(ninoCheckEditions()),
    ...Object.values(gordoHubTranslations()),
    ...Object.values(reportEditions()),
  ]);
  for (const href of [spainHubPath(), ...editionPaths()]) known.add(href);
  for (const l of LOCALES) known.add(b2href("strikesSpain", l));
  for (const tool of liveTools()) {
    for (const href of Object.values(tool.hubs)) assert.ok(known.has(href!), `${tool.name}: ${href} is not a published page`);
  }
});

test("llms.txt names the Spain-wide families and the trust pages, in all three languages", () => {
  const text = buildLlmsTxt(ORIGIN, "CatalunyaInfo", {});
  // The summary says what the site covers today, not only Catalonia.
  assert.match(LLMS_SUMMARY, /Spain/);
  assert.match(LLMS_SUMMARY, /calculators/);
  for (const hub of [spainHubPath(), editionHubPath("ca"), editionHubPath("en"), ...LOCALES.map((l) => b2href("strikesSpain", l))]) {
    assert.ok(text.includes(`(${ORIGIN}${hub})`), `llms.txt does not link ${hub}`);
  }
  const about = text.split("\n## ").find((s) => s.startsWith("About this site"));
  assert.ok(about, "no About section");
  for (const page of trustPages()) {
    for (const l of LOCALES) {
      const href = page.hubs[l]!;
      assert.ok(about!.includes(`${ORIGIN}${href}`), `${page.name}: ${l} edition missing`);
    }
  }
  for (const href of [legalPath("editorial-policy", "es"), legalPath("sources", "ca"), legalPath("corrections", "en"), sectionPath("about", "es"), siteAuthorPath("ca")]) {
    assert.ok(about!.includes(href), `About section lacks ${href}`);
  }
  // Only the publication's own channel; never the founder's personal profiles.
  assert.ok(about!.includes(WHATSAPP_CHANNEL));
  assert.deepEqual([...SITE.sameAs], [WHATSAPP_CHANNEL]);
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
  // Rodalies line pages in English (21 Nov 2026).
  for (const line of LINES) {
    out.push({ path: `rodalies-en-${line.id}`, title: rodalies.lineTitle(line, "en"), description: rodalies.lineDescription(line, "en") });
  }
  for (const m of holidayEnglishTowns.englishTowns()) {
    out.push({ path: `holidays-en-${m.slug}`, title: holidayEnglish.englishTownTitle(m), description: holidayEnglish.englishTownDescription(m) });
  }
  for (const locale of LOCALES) {
    for (const iso of DATE_PAGES) {
      // The page's own <title> (the 2027 pages add the day's name to the question).
      out.push({ path: `date-${locale}-${iso}`, title: dateTitle(iso, locale), description: dateContent(iso, locale).description });
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

/** Site audit, 19 Nov 2026: llms.txt named 43 noindex URLs (the finished 11N city pages and the 1 Nov 2026 date pages). */
test("llms.txt leaves out noindex pages: low-demand guides, and date pages past their grace days", async () => {
  const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
  const { datePath } = await import("../src/lib/programmatic/holidays/paths.ts");
  const { firstIndexableDatePage } = await import("../src/lib/seo/llms.ts");
  const finished = "/es/guias/huelga-general-11-noviembre-madrid/";
  assert.ok(isLowDemandPath(finished), "fixture: a finished 11N city page is low-demand");
  const guides = [
    { title: "Madrid 11N", href: finished, excerpt: null },
    { title: "Alfa", href: "/es/guias/a/", excerpt: null },
  ];
  const text = buildLlmsTxt(ORIGIN, "CatalunyaInfo", { es: guides }, "2026-11-19");
  assert.ok(!text.includes(finished));
  assert.ok(text.includes(`${ORIGIN}/es/guias/a/`));
  // 1 Nov 2026 is past its 14 grace days on 19 Nov: the tool line opens on the next date still indexed.
  const first = firstIndexableDatePage("2026-11-19");
  assert.ok(first > "2026-11-05", first);
  for (const l of LOCALES) assert.ok(!isLowDemandPath(datePath(l, first), "2026-11-19"), `${l} ${first}`);
  assert.ok(text.includes(`(${ORIGIN}${datePath("en", first)})`));
  assert.ok(!text.includes(`(${ORIGIN}${datePath("en", "2026-11-01")})`));
  // Before the range starts, the first date is the range's first.
  assert.equal(firstIndexableDatePage("2026-10-01"), "2026-11-01");
});

/** ai-traffic analysis, 25 Nov 2026: the pages assistants send readers to that llms.txt did not name, and the hubs it lacked. */
test("llms.txt names the top AI-landing pages and the family hubs it lacked, and only indexable ones", async () => {
  const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
  const text = buildLlmsTxt(ORIGIN, "CatalunyaInfo", {});
  const wanted = [
    "/en/christmas-markets/barcelona/", "/es/mercados-navidad/barcelona/", "/ca/fires-de-nadal/barcelona/",
    "/es/fin-de-semana/provincia-de-barcelona/", "/es/fin-de-semana/barcelona/", "/es/fin-de-semana/girona/", "/es/fin-de-semana/costa-brava/",
    "/es/guias/encuestas-elecciones-generales-cataluna/", "/en/guides/spain-general-election-polls-catalonia/",
    "/es/zbe/", "/ca/zbe/", "/en/low-emission-zones/", "/es/zona-azul/", "/ca/zona-blava/", "/en/blue-zone-parking/",
  ];
  for (const href of wanted) {
    assert.ok(text.includes(`(${ORIGIN}${href})`) || text.includes(`](${ORIGIN}${href})`), `llms.txt does not link ${href}`);
    assert.ok(!isLowDemandPath(href), `${href} is low-demand (noindex)`);
  }
  // Every tool page, new or old, is indexable today.
  for (const tool of liveTools()) for (const href of Object.values(tool.hubs)) assert.ok(!isLowDemandPath(href!), `${tool.name}: ${href} is noindex`);
  // The two 11N city pages that drew AI visits are noindex since the strike: not listed.
  for (const href of ["/es/guias/huelga-general-11-noviembre-sevilla/", "/es/guias/huelga-general-11-noviembre-madrid/"]) {
    assert.ok(isLowDemandPath(href));
    assert.ok(!text.includes(href));
  }
});

/** 25 Nov 2026 pass: AI-landed pages with 3 or more sessions in 28 days that the file did not name, and no URL twice. */
test("llms.txt names the weekend zones, town election pages and tomorrow's PVPC page that AI assistants landed on, and lists no URL twice", async () => {
  const { isLowDemandPath } = await import("../src/lib/seo/low-demand.ts");
  const guide = (href: string) => ({ title: `Guide ${href}`, href, excerpt: "A guide." });
  // Pages that are both a live tool and a published guide, as the database returns them.
  const strikes = Object.values(GUIDES.strikes).map(guide);
  const text = buildLlmsTxt(ORIGIN, "CatalunyaInfo", { ca: strikes, es: strikes, en: strikes });
  const wanted = [
    "/es/fin-de-semana/lleida/", "/ca/cap-de-setmana/lleida/",
    "/es/fin-de-semana/baix-emporda/", "/ca/cap-de-setmana/baix-emporda/",
    "/es/fin-de-semana/valles-occidental/", "/ca/cap-de-setmana/valles-occidental/",
    "/es/precio-luz/manana/", "/ca/preu-llum/dema/", "/en/electricity-price-spain/tomorrow/",
    "/ca/eleccions/mollet-del-valles/", "/es/elecciones/mollet-del-valles/",
    "/en/elections/badalona/", "/ca/eleccions/badalona/", "/es/elecciones/badalona/",
    "/ca/eleccions/el-masnou/", "/es/elecciones/el-masnou/",
    "/ca/eleccions/martorell/", "/es/elecciones/martorell/",
  ];
  for (const href of wanted) {
    assert.ok(text.includes(`](${ORIGIN}${href})`), `llms.txt does not link ${href}`);
    assert.ok(!isLowDemandPath(href), `${href} is noindex`);
  }
  // Every URL appears once, whatever the section.
  const seen = new Map<string, number>();
  for (const m of text.matchAll(/\]\((https:\/\/[^)]+)\)/g)) seen.set(m[1]!, (seen.get(m[1]!) ?? 0) + 1);
  const twice = [...seen].filter(([, n]) => n > 1).map(([u]) => u);
  assert.deepEqual(twice, []);
  // The strike guides are still there, once, as tools.
  for (const href of Object.values(GUIDES.strikes)) assert.equal(seen.get(`${ORIGIN}${href}`), 1, href);
  // The tool lines of the new entries are one line of the page's own language: the election lines carry the page's description.
  assert.ok(/Badalona elections: where to vote/.test(text));
  assert.ok(/\[Eleccions el Masnou: on votar/.test(text));
});

/**
 * The polls line names the 29 November 2026 general election and the LOREG art. 69.7 ban on publishing polls (src/lib/seo/llms.ts,
 * `topLandingTools`). It is true until the election: after 30 Nov 2026 re-read what the polls page says and reword the line
 * (and the name), then move this date.
 */
test("date guard: the polls line in llms.txt is re-read after the 29 November 2026 election", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today <= "2026-11-30", `${today}: re-read the polls page and reword its llms.txt line (29 November election, LOREG art. 69.7)`);
});
