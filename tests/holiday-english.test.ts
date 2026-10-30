import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { buildMetadata } = await import("../src/lib/seo/metadata.ts");
const { municipalitiesFor } = await import("../src/lib/programmatic/elections/pages.ts");
const { EN_LARGEST, EN_RESORTS } = await import("../src/lib/programmatic/elections/english.ts");
const { NEXT, SNAPSHOT, YEAR } = await import("../src/lib/programmatic/holidays/data.ts");
const { englishSelectionSlugs, englishTownBySlug, englishTowns, englishWithoutDays, hasEnglishPage, isLargestTown } = await import(
  "../src/lib/programmatic/holidays/english.ts"
);
const { DESCRIPTION_MAX, TITLE_MAX, enName, englishHubCopy, englishTownCopy, englishTownDescription, englishTownFaq, englishTownH1, englishTownTitle, townDateAnswers } =
  await import("../src/lib/programmatic/holidays/english-copy.ts");
const { dayMonth } = await import("../src/lib/programmatic/holidays/format.ts");
const { DATE_PAGES, datePath, holidayFamilyPaths, holidaySitemapEntries, hubPath, hubTranslations, municipalityPath, municipalityTranslations } = await import(
  "../src/lib/programmatic/holidays/paths.ts"
);
const { englishTownStaticParams, hubAllowed, resolveMunicipality } = await import("../src/lib/programmatic/holidays/routing.ts");
const { slugify } = await import("../src/lib/programmatic/holidays/slug.ts");
const { englishHubDataset, englishTownDataset } = await import("../src/lib/programmatic/holidays/structured.ts");

const ROOT = join(import.meta.dirname, "..");
const ORIGIN = "https://www.catalunyainfo.com";
const town = (slug: string) => {
  const m = englishTownBySlug(slug);
  assert.ok(m, slug);
  return m;
};

/* -------------------------------------------------------------------------- */
/* The selection                                                              */
/* -------------------------------------------------------------------------- */

test("English towns: the elections family's 30, minus the one the order gives no days", () => {
  // One rule, two families: the same 30 slugs, largest first.
  const elections = municipalitiesFor("en").map((m) => m.slug);
  assert.equal(elections.length, 30);
  assert.deepEqual([...englishSelectionSlugs()].sort(), [...elections].sort());
  assert.equal(EN_LARGEST + EN_RESORTS.length, 30);
  // Malgrat de Mar: "proposta no formulada" in Ordre EMT/208/2025, untouched by EMT/3/2026.
  assert.deepEqual(englishWithoutDays().map((e) => e.name), ["Malgrat de Mar"]);
  assert.equal(englishTowns().length, 29);
  assert.equal(hasEnglishPage("malgrat-de-mar"), false);
  for (const slug of elections.filter((s) => s !== "malgrat-de-mar")) assert.ok(hasEnglishPage(slug), slug);
  // The 11 largest, the four provincial capitals among them; the rest are resorts.
  const largest = englishTowns().filter((m) => isLargestTown(m));
  assert.equal(largest.length, EN_LARGEST);
  for (const capital of ["barcelona", "girona", "lleida", "tarragona"]) assert.ok(largest.some((m) => m.slug === capital), capital);
  for (const slug of EN_RESORTS) assert.ok(!isLargestTown({ slug }), slug);
  // Every English town has its own two local days in the order (none is nuclei-only).
  for (const m of englishTowns()) assert.equal(m.local.length, 2, m.slug);
});

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

test("routing: /en/holidays/<slug>/ answers the 29 towns in English only; everything else is a 404", () => {
  for (const m of englishTowns()) {
    assert.equal(resolveMunicipality("en", "en", m.slug), m);
    assert.equal(resolveMunicipality("en", "ca", m.slug), null, `/ca/holidays/${m.slug}/`);
    assert.equal(resolveMunicipality("en", "es", m.slug), null, `/es/holidays/${m.slug}/`);
    // The Catalan and Spanish routes keep answering in their own locale only.
    assert.equal(resolveMunicipality("ca", "en", m.slug), null, `/en/festius/${m.slug}/`);
  }
  // Every other town has ca/es pages but no English one.
  const others = SNAPSHOT.municipalities.filter((m) => !hasEnglishPage(m.slug));
  assert.equal(others.length, SNAPSHOT.municipalities.length - 29);
  for (const m of others) {
    assert.equal(resolveMunicipality("en", "en", m.slug), null, m.slug);
    assert.ok(resolveMunicipality("ca", "ca", m.slug), m.slug);
  }
  for (const slug of ["malgrat-de-mar", "day", "8-december-2026", "Sitges", "sitges-2026", "", "comarca", "garraf"]) {
    assert.equal(resolveMunicipality("en", "en", slug), null, slug);
  }
  // The date pages keep their own folder: /en/holidays/day/<date>/.
  assert.equal(datePath("en", "2026-12-08"), "/en/holidays/day/8-december-2026/");
  assert.equal(municipalityPath("en", "sitges"), "/en/holidays/sitges/");
  assert.equal(hubPath("en"), "/en/holidays/");
  assert.ok(hubAllowed("en", "en"));
  assert.ok(!hubAllowed("en", "ca") && !hubAllowed("en", "es"));
  // All 29 built at deploy, complete params in the route's own locale.
  const params = englishTownStaticParams();
  assert.equal(params.length, 29);
  assert.ok(params.every((p) => p.locale === "en" && resolveMunicipality("en", p.locale, p.municipi)));
  assert.equal(params[0]?.municipi, "barcelona");
});

test("route files: the English hub and town pages are static, English-only, and 404 anything else", () => {
  const app = join(ROOT, "src/app/(public)/[locale]/holidays");
  const hub = readFileSync(join(app, "page.tsx"), "utf8");
  assert.match(hub, /hubAllowed\("en", locale\)/);
  const townRoute = readFileSync(join(app, "[municipi]/page.tsx"), "utf8");
  assert.match(townRoute, /resolveMunicipality\("en", locale, municipi\)/);
  assert.match(townRoute, /englishTownStaticParams\(\)/);
  for (const source of [hub, townRoute]) {
    assert.match(source, /export const revalidate = false;/);
    assert.match(source, /export const dynamicParams = false;/);
    assert.match(source, /notFound\(\)/);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/);
  }
  // The date pages still live in their static "day" folder beside [municipi].
  assert.ok(readFileSync(join(app, "day/[dia]/page.tsx"), "utf8").includes('resolveDatePage("en"'));
});

/* -------------------------------------------------------------------------- */
/* hreflang                                                                   */
/* -------------------------------------------------------------------------- */

function alternatesOf(locale: "ca" | "es" | "en", path: string, translations: Partial<Record<"ca" | "es" | "en", string>>) {
  const meta = buildMetadata({ locale, path, title: "t", translations });
  return meta.alternates as { canonical: string; languages: Record<string, string> };
}

test("hreflang: each English town and its Catalan and Spanish pages list one another, x-default English", () => {
  for (const m of englishTowns()) {
    const translations = municipalityTranslations(m.slug);
    const expected = {
      ca: `${ORIGIN}/ca/festius/${m.slug}/`,
      es: `${ORIGIN}/es/festivos/${m.slug}/`,
      en: `${ORIGIN}/en/holidays/${m.slug}/`,
      "x-default": `${ORIGIN}/en/holidays/${m.slug}/`,
    };
    for (const locale of ["ca", "es", "en"] as const) {
      const alternates = alternatesOf(locale, municipalityPath(locale, m.slug), translations);
      assert.deepEqual(alternates.languages, expected, `${locale} ${m.slug}`);
      assert.equal(alternates.canonical, expected[locale]);
    }
  }
  // A town outside the selection: Catalan and Spanish only, x-default Catalan, no English URL anywhere.
  for (const slug of ["sentmenat", "vilanova-i-la-geltru", "figueres"]) {
    const translations = municipalityTranslations(slug);
    assert.deepEqual(Object.keys(translations).sort(), ["ca", "es"], slug);
    const alternates = alternatesOf("ca", municipalityPath("ca", slug), translations);
    assert.deepEqual(Object.keys(alternates.languages).sort(), ["ca", "es", "x-default"]);
    assert.equal(alternates.languages["x-default"], `${ORIGIN}/ca/festius/${slug}/`);
  }
  // The three hubs.
  assert.deepEqual(hubTranslations(), { ca: "/ca/festius/", es: "/es/festivos/", en: "/en/holidays/" });
  for (const locale of ["ca", "es", "en"] as const) {
    const alternates = alternatesOf(locale, hubPath(locale), hubTranslations());
    assert.equal(alternates.languages["x-default"], `${ORIGIN}/en/holidays/`);
    assert.equal(Object.keys(alternates.languages).length, 4);
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

test("metadata: titles <= 60 with the town and both years, descriptions <= 155 with both local dates", () => {
  const titles = new Set<string>();
  for (const m of englishTowns()) {
    const title = englishTownTitle(m);
    const description = englishTownDescription(m);
    assert.ok(title.length <= TITLE_MAX && TITLE_MAX === 60, `${title} (${title.length})`);
    assert.ok(description.length <= DESCRIPTION_MAX && DESCRIPTION_MAX === 155, `${description} (${description.length})`);
    assert.ok(description.length >= 70, description);
    assert.ok(title.startsWith(enName(m)), title);
    assert.ok(title.includes(String(YEAR)) && title.includes(String(NEXT)), title);
    assert.match(title, /holidays/);
    for (const d of m.local) assert.ok(description.includes(dayMonth(d, "en")), `${m.slug}: ${description}`);
    assert.ok(description.includes(enName(m)), description);
    titles.add(title);
  }
  assert.equal(titles.size, 29, "unique titles");
  assert.equal(englishTownTitle(town("sitges")), "Sitges public holidays 2026 and 2027: local dates");
  assert.equal(englishTownTitle(town("barcelona")), "Barcelona public holidays 2026 and 2027: local dates");
  // The longest name drops "public" rather than a year.
  assert.equal(englishTownTitle(town("castell-d-aro-platja-d-aro-i-s-agaro")), "Castell d'Aro, Platja d'Aro i s'Agaró holidays 2026 and 2027");
  assert.equal(englishTownH1(town("l-escala")), "Public holidays in L'Escala 2026 and 2027");

  const hub = englishHubCopy();
  assert.ok(hub.title.length <= 60 && hub.description.length <= 155 && hub.description.length >= 70, hub.title);
  assert.equal(hub.title, "Catalonia bank holidays 2026 and 2027, town by town");
  // The towns the description names are on the hub; "26 more" adds up to the 29.
  for (const name of hub.named) assert.ok(englishTowns().some((m) => enName(m) === name), name);
  assert.ok(hub.description.includes(`and ${29 - hub.named.length} more towns`), hub.description);
  assert.ok(hub.withoutDays?.startsWith("Malgrat de Mar"));
});

/* -------------------------------------------------------------------------- */
/* Known answers (DOGC: Ordre EMT/208/2025 and Ordre EMT/3/2026)              */
/* -------------------------------------------------------------------------- */

test("known answers: five towns' 2026 local holidays, as the DOGC order prints them", () => {
  // "Barcelona, 25 de maig i 24 de setembre." (Barcelonès)
  // "Sitges, 23 de setembre." amended by EMT/3/2026 to "Sitges, 24 d'agost i 23 de setembre." (Garraf)
  // "Salou, 6 de febrer i 30 d'octubre." (Tarragonès)
  // "Girona, 25 de juliol i 29 d'octubre." (Gironès)
  // "Lloret de Mar, 24 de juliol i 18 de novembre." (Selva)
  const known: Record<string, { local: string[]; words: string }> = {
    barcelona: { local: ["2026-05-25", "2026-09-24"], words: "Monday 25 May and Thursday 24 September" },
    sitges: { local: ["2026-08-24", "2026-09-23"], words: "Monday 24 August and Wednesday 23 September" },
    salou: { local: ["2026-02-06", "2026-10-30"], words: "Friday 6 February and Friday 30 October" },
    girona: { local: ["2026-07-25", "2026-10-29"], words: "Saturday 25 July and Thursday 29 October" },
    "lloret-de-mar": { local: ["2026-07-24", "2026-11-18"], words: "Friday 24 July and Wednesday 18 November" },
  };
  for (const [slug, expected] of Object.entries(known)) {
    const m = town(slug);
    assert.deepEqual(m.local, expected.local, slug);
    const copy = englishTownCopy(m, null);
    assert.ok(copy.lead.includes(expected.words), `${slug}: ${copy.lead}`);
    const faq = englishTownFaq(m, null);
    assert.ok(faq.some((f) => f.answer.includes(expected.words)), slug);
  }
  assert.equal(
    englishTownDescription(town("sitges")),
    "Sitges has two local holidays in 2026: 24 August and 23 September, plus Catalonia's 12. Is today a holiday? Also the 2027 bank holidays.",
  );
  // Sitges is the amended entry: the page says so, and why the open data differs.
  const sitges = englishTownCopy(town("sitges"), null);
  assert.match(sitges.source, /as amended by Order EMT\/3\/2026/);
  assert.match(sitges.correction ?? "", /open-data table still gives 23 September/);
  assert.equal(englishTownCopy(town("salou"), null).correction, null);
  // A resort with a village of its own days: Miami Platja in Mont-roig del Camp.
  assert.match(englishTownCopy(town("mont-roig-del-camp"), null).nucleiLead ?? "", /Miami Platja \(19 March and 27 July\)/);
});

test("known answers: 'is <date> a holiday in <town>?' per town, from the snapshot", () => {
  const answer = (slug: string, iso: string) => townDateAnswers(town(slug)).find((a) => a.iso === iso)!;
  assert.equal(townDateAnswers(town("salou")).length, DATE_PAGES.length);
  // Catalonia-wide.
  assert.equal(answer("salou", "2026-12-08").answer, "Yes: Immaculate Conception, across Catalonia.");
  assert.equal(answer("salou", "2026-12-26").answer, "Yes: Saint Stephen's Day, across Catalonia.");
  assert.equal(answer("salou", "2027-01-06").answer, "Yes: Epiphany, across Catalonia.");
  // Local: Calonge i Sant Antoni on 11 November, Torroella de Montgrí on 30 November.
  assert.equal(answer("calonge-i-sant-antoni", "2026-11-11").state, "yes");
  assert.match(answer("calonge-i-sant-antoni", "2026-11-11").answer, /local holidays/);
  assert.equal(answer("torroella-de-montgri", "2026-11-30").state, "yes");
  // Working days elsewhere; 1 November is a Sunday the order leaves out.
  assert.equal(answer("sitges", "2026-11-30").answer, "No: a working day in Sitges.");
  assert.equal(answer("barcelona", "2026-12-24").state, "no");
  assert.match(answer("barcelona", "2026-11-01").answer, /^No: a Sunday/);
  // 11 November: the general strike the date page announces.
  assert.ok(answer("barcelona", "2026-11-11").strike);
  assert.ok(!answer("barcelona", "2026-11-30").strike);
  // Shops: 8 December is one of Sitges's default opening days, not one of Badalona's own (Resolució EMT/4342/2025).
  assert.match(answer("sitges", "2026-12-08").shops, /^May open/);
  assert.match(answer("badalona", "2026-12-08").shops, /^Stay closed/);
  assert.equal(answer("sitges", "2026-12-24").shops, "Usual hours");
  // 1 and 6 January 2027: compulsory closing days whatever the town (Llei 18/2017, art. 36.2.d).
  for (const m of englishTowns()) {
    for (const a of townDateAnswers(m)) {
      if (a.iso.startsWith("2027-")) assert.match(a.shops, /^Stay closed/, `${m.slug} ${a.iso}`);
      assert.ok(!/undefined|NaN|\$\{/.test(a.answer + a.shops), `${m.slug} ${a.iso}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Structured data, FAQ, determinism                                          */
/* -------------------------------------------------------------------------- */

test("JSON-LD: Dataset like the Catalan and Spanish town pages, FAQ in the searchers' words", () => {
  for (const m of englishTowns()) {
    const dataset = englishTownDataset(m) as Record<string, unknown>;
    assert.equal(dataset["@type"], "Dataset");
    assert.equal(dataset.url, `${ORIGIN}/en/holidays/${m.slug}/`);
    assert.equal(dataset.inLanguage, "en");
    assert.equal(dataset.name, englishTownH1(m));
    assert.equal(dataset.description, englishTownDescription(m));
    assert.equal(dataset.temporalCoverage, String(YEAR));
    assert.equal(dataset.dateModified, SNAPSHOT.readOn);
    assert.deepEqual((dataset.spatialCoverage as { name: string }).name, `${enName(m)}, Catalonia`);

    const faq = englishTownFaq(m, null);
    assert.deepEqual(
      faq.map((f) => f.question),
      [
        `Is today a public holiday in ${enName(m)}?`,
        `Is tomorrow a holiday in ${enName(m)}?`,
        `What are the public holidays in ${enName(m)} in ${YEAR}?`,
        `What are the bank holidays in ${enName(m)} in ${NEXT}?`,
        `Are shops open on public holidays in ${enName(m)}?`,
      ],
    );
    for (const f of faq) assert.ok(!/undefined|NaN|\$\{|\{\w+\}/.test(f.question + f.answer), f.answer);
  }
  const hub = englishHubDataset() as Record<string, unknown>;
  assert.equal(hub.url, `${ORIGIN}/en/holidays/`);
  assert.equal(hub.inLanguage, "en");
  const routes = readFileSync(join(ROOT, "src/components/programmatic/holidays/routes.tsx"), "utf8");
  assert.match(routes, /breadcrumbSchema\(englishTownCrumbs\(m\)\),\s*englishTownDataset\(m\),\s*\/\/[^\n]*\n\s*faqSchema\(/);
  assert.match(routes, /breadcrumbSchema\(englishHubCrumbs\(\)\), englishHubDataset\(\)/);
});

test("deterministic: the English copy depends on the snapshot only, never on the clock", () => {
  for (const m of englishTowns()) {
    assert.deepEqual(englishTownFaq(m, null), englishTownFaq(m, null));
    assert.deepEqual(townDateAnswers(m), townDateAnswers(m));
  }
  for (const file of [
    "src/lib/programmatic/holidays/english.ts",
    "src/lib/programmatic/holidays/english-copy.ts",
    "src/lib/programmatic/elections/english.ts",
    "src/components/programmatic/holidays/EnglishTownPage.tsx",
    "src/components/programmatic/holidays/EnglishHubPage.tsx",
  ]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(source, /new Date\(\)|Date\.now\(|todayInCatalonia/, file);
  }
  // "Is today a holiday here?" is the existing client component, which reads the date after mount.
  const page = readFileSync(join(ROOT, "src/components/programmatic/holidays/EnglishTownPage.tsx"), "utf8");
  assert.match(page, /<HolidayStatus/);
  assert.match(page, /GUIDES\.strikes\.en/);
  assert.match(page, /GUIDES\.shops\.en/);
  assert.match(page, /GUIDES\.metroHours\.en/);
  assert.match(page, /datePath\("en", a\.iso\)/);
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: the English hub and 29 towns, with the ca/es pages pointing back", () => {
  const entries = holidaySitemapEntries();
  const english = entries.filter((e) => e.url.startsWith(`${ORIGIN}/en/holidays/`) && !e.url.includes("/day/"));
  assert.equal(english.length, 30);
  assert.ok(english.some((e) => e.url === `${ORIGIN}/en/holidays/`));
  for (const m of englishTowns()) {
    for (const locale of ["ca", "es", "en"] as const) {
      const entry = entries.find((e) => e.url === `${ORIGIN}${municipalityPath(locale, m.slug)}`);
      assert.ok(entry, `${locale} ${m.slug}`);
      const languages = entry.alternates?.languages as Record<string, string>;
      assert.equal(languages.en, `${ORIGIN}/en/holidays/${m.slug}/`, `${locale} ${m.slug}`);
      assert.equal(languages.ca, `${ORIGIN}/ca/festius/${m.slug}/`);
      assert.equal(languages.es, `${ORIGIN}/es/festivos/${m.slug}/`);
      assert.equal(languages["x-default"], languages.en);
    }
  }
  // No English URL for any other town, and none for the council without days.
  const otherEn = entries.filter((e) => /\/en\/holidays\/[^/]+\/$/.test(e.url) && !englishTowns().some((m) => e.url.endsWith(`/en/holidays/${m.slug}/`)));
  assert.deepEqual(otherEn.map((e) => e.url), []);
  const hub = entries.find((e) => e.url === `${ORIGIN}/en/holidays/`)!;
  assert.deepEqual(Object.keys(hub.alternates?.languages as Record<string, string>).sort(), ["ca", "en", "es", "x-default"]);
  assert.ok(!entries.some((e) => e.url.endsWith(`/en/holidays/${slugify("Malgrat de Mar")}/`)));
  const sentmenat = entries.find((e) => e.url.endsWith("/ca/festius/sentmenat/"))!;
  assert.ok(!("en" in (sentmenat.alternates?.languages as Record<string, string>)));
  assert.equal(holidayFamilyPaths().length, entries.length);
});

/* -------------------------------------------------------------------------- */
/* Date pages link the new pages                                              */
/* -------------------------------------------------------------------------- */

test("English date pages: the hub as parent, English town pages linked where they exist", () => {
  const datePage = readFileSync(join(ROOT, "src/components/programmatic/holidays/DatePage.tsx"), "utf8");
  assert.match(datePage, /href: hubPath\(locale\)/);
  assert.match(datePage, /hasEnglishPage\(slug\) \? municipalityPath\("en", slug\) : null/);
  // 11 November: Calonge i Sant Antoni, an English town, is on the list of places with a local holiday.
  assert.ok((SNAPSHOT.localByDate["2026-11-11"] ?? []).some((p) => p.slug === "calonge-i-sant-antoni"));
});
