import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import { HUB_PATHS as SCHOOL_SPAIN_HUB_PATHS } from "../src/lib/content/school-spain/regions.ts";
import { calculatorOnwardExclude, calculatorScope, calculatorSeasonal } from "../src/lib/engagement/continue-calculators.ts";
import { continueReading, seasonalCandidates, type ContinueReading } from "../src/lib/engagement/continue-reading.ts";
import { dateOnward, dateOnwardExclude, pathsIn, townFamilyOnward, townGuideKeys, townHubHrefs, townOnward, townOnwardExclude } from "../src/lib/engagement/continue-templates.ts";
import { christmasNextStep, electionTownNextStep } from "../src/lib/engagement/next-step.ts";
import { pathOnly } from "../src/lib/engagement/next-step-core.ts";
import { townNextStep } from "../src/lib/engagement/next-step-towns.ts";
import { returnStepForElectionTown } from "../src/lib/engagement/return-step.ts";
import { townHub } from "../src/lib/engagement/town-hub.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { CALCULATOR_IDS, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { englishTowns as englishFairTowns, familyLastChecked, lastChecked, towns } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { fairsHubPath, townPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { electionPhase } from "../src/lib/programmatic/elections/election-day.ts";
import { buildElectionPage, townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { electionPath, municipalitiesFor } from "../src/lib/programmatic/elections/pages.ts";
import { displayName, municipalityFaq } from "../src/lib/programmatic/holidays/copy.ts";
import { SNAPSHOT, nextYearFor } from "../src/lib/programmatic/holidays/data.ts";
import { englishTowns } from "../src/lib/programmatic/holidays/english.ts";
import { enName } from "../src/lib/programmatic/holidays/english-copy.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { DATE_PAGES, municipalityPath, datePath } from "../src/lib/programmatic/holidays/paths.ts";
import { hubEditions as spain2027HubEditions } from "../src/lib/programmatic/spain-2027/editions.ts";

/**
 * The 8S chooser on the programmatic templates (27 Nov 2026, batch 8U,
 * lib/engagement/continue-templates.ts and continue-calculators.ts): one
 * seasonal link, never the page itself, never a path another box of the page
 * links, always in the page's language, always a page the site builds.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const DAYS = ["2026-11-27", "2026-12-08", "2026-12-09", "2026-12-22", "2026-12-23", "2026-12-31", "2027-01-06", "2027-01-07", "2027-03-01"];

function known(locale: Locale): Set<string> {
  return new Set([...Object.values(B2_PATHS).map((paths) => `/${locale}/${paths[locale]}/`), `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`, spain2027HubEditions()[locale]]);
}
const KNOWN = Object.fromEntries(LOCALES.map((locale) => [locale, known(locale)])) as Record<Locale, Set<string>>;

function assertSeasonalOnly(box: ContinueReading | null, locale: Locale, self: string, exclude: readonly string[], what: string): string | null {
  if (!box) return null;
  assert.equal(box.topical.length, 0, `${what}: topical`);
  assert.equal(box.rest.length, 0, `${what}: rest`);
  assert.ok(box.seasonal, `${what}: no seasonal`);
  const path = pathOnly(box.seasonal.href);
  assert.notEqual(path, pathOnly(self), `${what}: itself`);
  assert.ok(path.startsWith(`/${locale}/`), `${what}: ${path} not ${locale}`);
  assert.ok(KNOWN[locale].has(path), `${what}: unknown ${path}`);
  assert.ok(!exclude.map(pathOnly).includes(path), `${what}: ${path} already on the page`);
  assert.ok(box.seasonal.label.length > 0, `${what}: label`);
  return path;
}

test("continueReading: a template's family replaces the content family, and the seasonal pick is the first candidate not on the page", () => {
  const locale = "es";
  const candidates = seasonalCandidates("catalonia", locale, "2026-11-27");
  const box = continueReading({ entry: { href: "/es/x/", locale }, stored: [], exclude: [candidates[0]!.href], family: { links: [], scope: "catalonia" }, today: "2026-11-27" })!;
  assert.equal(box.seasonal!.href, candidates[1]!.href);
  assert.deepEqual(box.topical, []);
  const spain = continueReading({ entry: { href: "/es/x/", locale }, stored: [], exclude: [], family: { links: [], scope: "spain" }, today: "2026-11-27" })!;
  assert.equal(spain.seasonal!.href, seasonalCandidates("spain", locale, "2026-11-27")[0]!.href);
});

test("date pages: one seasonal link, never a path of the next step, election line, calculator line, guides, notices or other dates", () => {
  for (const iso of DATE_PAGES) {
    for (const locale of LOCALES) {
      for (const today of DAYS) {
        const exclude = dateOnwardExclude(iso, locale, today);
        const path = assertSeasonalOnly(dateOnward(iso, locale, today), locale, datePath(locale, iso), exclude, `${iso} ${locale} ${today}`);
        // To Reis every date page has one; after it the 2027 pages are often in the page's guides already, so none.
        if (today <= "2027-01-06") assert.ok(path, `${iso} ${locale} ${today}: none`);
      }
    }
  }
  // 7 December, before the bridge: the bridge and the shops are in its next-step box, so the Christmas calendar.
  for (const locale of LOCALES) {
    const box = dateOnward("2026-12-07", locale, "2026-11-27")!;
    assert.equal(box.seasonal!.href, b2href("christmas", locale), locale);
  }
});

test("holiday town pages (ca/es, every town; en, the selection): one seasonal link, never a link of the next step, town hub, guides or FAQ", () => {
  for (const locale of ["ca", "es"] as const) {
    for (const m of SNAPSHOT.municipalities) {
      const name = displayName(m, locale);
      const self = municipalityPath(locale, m.slug);
      for (const today of ["2026-11-27", "2026-12-09", "2026-12-31", "2027-01-07"]) {
        const input = {
          slug: m.slug,
          locale,
          step: townNextStep(m.slug, name, locale, self, today),
          hub: townHub(m.slug, locale, "holidays", today),
          guides: townGuideKeys(m.slug),
          faqLinks: municipalityFaq(m, locale, nextYearFor(m.slug), today).map((item) => item.link?.href),
        };
        const exclude = townOnwardExclude(input);
        assert.ok(assertSeasonalOnly(townOnward({ ...input, today }), locale, self, exclude, `${m.slug} ${locale} ${today}`), `${m.slug} ${locale} ${today}: none`);
      }
    }
  }
  // Barcelona on 27 Nov: the December bridge is in its guides list, so the Christmas calendar.
  const bcn = SNAPSHOT.municipalities.find((m) => m.slug === "barcelona")!;
  const box = townOnward({ slug: "barcelona", locale: "es", step: null, hub: null, guides: townGuideKeys("barcelona"), today: "2026-11-27" })!;
  assert.equal(box.seasonal!.href, b2href("christmas", "es"));
  assert.ok(bcn);
  const checked = familyLastChecked();
  for (const m of englishTowns()) {
    const self = municipalityPath("en", m.slug);
    const input = {
      slug: m.slug,
      locale: "en" as const,
      step: townNextStep(m.slug, enName(m), "en", self),
      hub: townHub(m.slug, "en", "holidays", checked),
      guides: ["holidayToday", "workCalendar", "localHolidays", "shops", "metroHours", "strikes", "decemberBridge", "school"] as const,
    };
    assertSeasonalOnly(townOnward({ ...input, guides: [...input.guides], today: checked }), "en", self, townOnwardExclude({ ...input, guides: [...input.guides] }), `en ${m.slug}`);
  }
});

test("Christmas fair town pages: one seasonal link, never the step, the town hub, the guides list, the hub or a town list", () => {
  const FAIR_GUIDES = ["christmas", "christmasBarcelona", "decemberBridge", "pessebres", "reis", "christmasTraditions", "shops", "barcelonaDecember"] as const;
  const today = familyLastChecked();
  for (const locale of LOCALES) {
    for (const town of locale === "en" ? englishFairTowns() : towns()) {
      const checked = lastChecked(town);
      const self = townPath(locale, town.slug);
      const step = christmasNextStep(locale, self, checked, { barcelona: town.ine === "08019" });
      const hub = townHub(town.slug, locale, "fair", checked);
      const guides = FAIR_GUIDES.map((key) => ({ href: b2href(key, locale) }));
      const box = townFamilyOnward({ self, locale, today, steps: [step], hub, links: [...guides, { href: fairsHubPath(locale) }], markdown: [] });
      const exclude = [...(step?.links ?? []).map((l) => l.href), ...townHubHrefs(hub), ...guides.map((g) => g.href), fairsHubPath(locale)];
      assert.ok(assertSeasonalOnly(box, locale, self, exclude, `fair ${town.slug} ${locale}`), `fair ${town.slug} ${locale}: none`);
    }
  }
});

test("election town pages: one seasonal link, never a link of the keep-it block, next step, election-day block, town hub or the model", () => {
  const moments = [new Date("2026-11-27T12:00:00+01:00"), new Date("2026-11-29T21:00:00+01:00"), new Date("2026-11-30T12:00:00+01:00"), new Date("2026-12-09T12:00:00+01:00")];
  for (const locale of LOCALES) {
    const sample = municipalitiesFor(locale).slice(0, 25);
    for (const m of sample) {
      for (const now of moments) {
        const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
        const phase = electionPhase(now);
        const model = buildElectionPage(m, locale, undefined, phase, now);
        const day = townElectionDay(m, locale, phase, model.polling, undefined, now);
        const self = electionPath(locale, m.slug);
        const steps = [returnStepForElectionTown(m.slug, locale, self, today), electionTownNextStep(locale, self, today)];
        const hub = townHub(m.slug, locale, "elections", today);
        const links = pathsIn([model, day]).map((href) => ({ href }));
        const box = townFamilyOnward({ self, locale, today, steps, hub, links, markdown: [] });
        const exclude = [...steps.flatMap((s) => (s?.links ?? []).map((l) => l.href)), ...townHubHrefs(hub), ...links.map((l) => l.href)];
        // The model's own guides list (electionNight, voting, candidates, results) is in `exclude` through pathsIn.
        assert.ok(exclude.includes(b2href("electionNight", locale)), `${m.slug} ${locale}: guides list read`);
        assertSeasonalOnly(box, locale, self, exclude, `election ${m.slug} ${locale} ${today}`);
      }
    }
  }
  assert.deepEqual(pathsIn({ md: ["see [x](/es/a/#b) and [y](/es/c/)"], link: { href: "/es/d/" } }).sort(), ["/es/a/", "/es/c/", "/es/d/"]);
});

test("calculators: one seasonal link in the related box, never the tool, a calculator, its next step or a guide its body links; Spain season in es/en", () => {
  for (const id of CALCULATOR_IDS) {
    for (const locale of LOCALES) {
      for (const today of DAYS) {
        const link = calculatorSeasonal(id, locale, today);
        assert.ok(link, `${id} ${locale} ${today}: none`);
        const box: ContinueReading = { topical: [], seasonal: link, rest: [] };
        assertSeasonalOnly(box, locale, calcPath(id, locale), calculatorOnwardExclude(id, locale), `${id} ${locale} ${today}`);
      }
    }
  }
  assert.equal(calculatorScope("ca"), "catalonia");
  assert.equal(calculatorScope("es"), "spain");
  // The lottery tool already links the lottery and La Grossa guides.
  for (const today of DAYS) {
    const link = calculatorSeasonal("lottery-tax", "es", today)!;
    assert.notEqual(link.href, b2href("loteriaNadal", "es"));
    assert.notEqual(link.href, b2href("grossa", "es"));
  }
  assert.notEqual(calculatorSeasonal("working-days", "ca", "2027-03-01")!.href, GUIDES.workCalendar.ca);
});

test("wiring: each template renders the box from the same calls its other boxes use; the calculators' seasonal item is classified seasonal_next", () => {
  const date = read("src/components/programmatic/holidays/DatePage.tsx");
  assert.match(date, /<ContinueReading data=\{dateOnward\(iso, locale, todayInCatalonia\(\)\)\} locale=\{locale\}[^>]*\/>\s*<\/div>\s*<section className="mt-12" aria-labelledby="ci-hol-other-dates">/);
  const muni = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  assert.match(muni, /step: townNextStep\(m\.slug, name, locale, crumbPath\(crumbs\), todayInCatalonia\(\)\),\s*hub: townHub\(m\.slug, locale, "holidays", todayInCatalonia\(\)\),\s*guides: townGuideKeys\(m\.slug\),/);
  // The page's guides list is the list townGuideKeys returns.
  const listed = /<GuideLinks\s+keys=\{\[([^\n]*)\]\}/.exec(muni)![1]!;
  const lib = /export function townGuideKeys\(slug: string\): GuideKey\[\] \{\s*return \[([^\n]*)\];/.exec(read("src/lib/engagement/continue-templates.ts"))![1]!;
  assert.equal(listed.replace(/m\.slug/g, "slug"), lib);
  assert.match(muni, /<TownHub hub=\{townHub\(m\.slug, locale, "holidays", todayInCatalonia\(\)\)\} \/>\s*\{\/\*[^*]*\*\/\}\s*<ContinueReading data=\{onward\}/);
  const en = read("src/components/programmatic/holidays/EnglishTownPage.tsx");
  assert.match(en, /step: townNextStep\(m\.slug, name, "en", crumbPath\(englishTownCrumbs\(m\)\)\),\s*hub: townHub\(m\.slug, "en", "holidays", familyLastChecked\(\)\),\s*guides,/);
  assert.match(en, /<TownHub hub=\{townHub\(m\.slug, "en", "holidays", familyLastChecked\(\)\)\} \/>\s*\{\/\*[^*]*\*\/\}\s*<ContinueReading data=\{onward\}/);
  const fair = read("src/components/programmatic/christmas-fairs/TownPage.tsx");
  assert.match(fair, /steps: \[christmasNextStep\(locale, crumbPath\(townCrumbs\(town, locale\)\), checked, \{ barcelona: town\.ine === BARCELONA_INE \}\)\],\s*hub: townHub\(town\.slug, locale, "fair", checked\),\s*links: \[\.\.\.guides, \.\.\.sameWeekendLinks, \.\.\.nearby, \{ href: fairsHubPath\(locale\) \}\],/);
  assert.match(fair, /markdown: \[trains\.intro, \.\.\.trains\.items,[^\n]*\.\.\.holidays,[^\n]*weekendSentence\(zone, locale\)[^\n]*guidanceShort\(locale, fairsHubPath\(locale\)\)\],/);
  assert.match(fair, /<TownHub hub=\{townHub\(town\.slug, locale, "fair", checked\)\} \/>\s*\{\/\*[^*]*\*\/\}\s*<ContinueReading data=\{onward\}/);
  const election = read("src/components/programmatic/ElectionResultsPage.tsx");
  assert.match(election, /returnStepForElectionTown\(municipality\.slug, locale, crumbPath\(crumbs\), todayInCatalonia\(\)\),\s*electionTownNextStep\(locale, crumbPath\(crumbs\), todayInCatalonia\(\)\),\s*\],\s*hub: townHub\(municipality\.slug, locale, "elections", todayInCatalonia\(\)\),\s*links: pathsIn\(\[model, day\]\)/);
  assert.match(election, /<TownHub hub=\{townHub\(municipality\.slug, locale, "elections", todayInCatalonia\(\)\)\} \/>\s*\{\/\*[^*]*\*\/\}\s*<ContinueReading data=\{onward\}/);
  const calc = read("src/components/programmatic/calculators/MoreCalculators.tsx");
  assert.match(calc, /const seasonal = calculatorSeasonal\(current, locale, todayInCatalonia\(\)\);/);
  assert.match(calc, /<li data-ci-placement="seasonal_next">\s*<IntentLink href=\{seasonal\.href\}>/);
  // The box without a heading of its own is named by aria-label.
  const box = read("src/components/ContinueReading.tsx");
  assert.match(box, /labelledBy \? \{ "aria-labelledby": labelledBy \} : \{ "aria-label": RELATED_HEADING\[locale\] \}/);
});
