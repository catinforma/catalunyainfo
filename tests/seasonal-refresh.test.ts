import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { PURGE_EVERYTHING_ABOVE } from "../src/lib/cdn/purge.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { addDays, todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { calculatorSeasonal } from "../src/lib/engagement/continue-calculators.ts";
import { SEASON } from "../src/lib/engagement/continue-reading.ts";
import { dateOnward, townFamilyOnward, townOnward } from "../src/lib/engagement/continue-templates.ts";
import { townNextStep } from "../src/lib/engagement/next-step-towns.ts";
import { SEASONAL_SWITCH_NIGHTS, seasonalRefreshDue, seasonalRefreshPaths, seasonalTemplatePaths } from "../src/lib/engagement/seasonal-refresh.ts";
import { townHub } from "../src/lib/engagement/town-hub.ts";
import { CALCULATORS_ROOT, CALCULATOR_IDS, CALC_LOCALES, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { familyLastChecked } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { FAIRS_LOCALES, fairsHubPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { municipalities } from "../src/lib/programmatic/holidays/data.ts";
import { englishTowns } from "../src/lib/programmatic/holidays/english.ts";
import { enName } from "../src/lib/programmatic/holidays/english-copy.ts";
import { DATE_LOCALES, DATE_PAGES, MUNI_LOCALES, datePath, municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { holidayRefreshPaths } from "../src/lib/programmatic/holidays/routing.ts";
import { weeklyMarketsRefreshPaths } from "../src/lib/programmatic/weekly-markets/routing.ts";

/**
 * The seasonal "coming up" link of the static templates is rebuilt by the
 * 00:05 cron on the nights it changes, and only then (27 Nov 2026, batch 9B,
 * lib/engagement/seasonal-refresh.ts).
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const noSlash = (path: string) => path.replace(/\/$/, "");
const NIGHTS = ["2026-12-09", "2026-12-23", "2027-01-01", "2027-01-07"];

function days(from: string, to: string): string[] {
  const out: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) out.push(day);
  return out;
}

test("switch nights: the day after each window of the season (bridge, lottery, La Grossa, Reis)", () => {
  assert.deepEqual([...SEASONAL_SWITCH_NIGHTS], NIGHTS);
  assert.deepEqual(SEASON.map((w) => w.until), ["2026-12-08", "2026-12-22", "2026-12-31", "2027-01-06"]);
  for (const night of NIGHTS) assert.ok(seasonalRefreshDue(night), night);
});

test("switch nights are Madrid days: the 23:05 UTC run is 00:05 the next day in winter", () => {
  // The timer the cron runs on stays the one it had (no new timer, no other time).
  assert.match(read("ops/vps/catalunyainfo-cron.timer"), /^OnCalendar=\*-\*-\* 23:05:00 UTC$/m);
  const cases: [string, string, boolean][] = [
    ["2026-12-08T23:05:00Z", "2026-12-09", true],
    ["2026-12-08T22:55:00Z", "2026-12-08", false], // 23:55 on the last bridge day: not yet
    ["2026-12-22T23:05:00Z", "2026-12-23", true],
    ["2026-12-31T23:05:00Z", "2027-01-01", true],
    ["2027-01-06T23:05:00Z", "2027-01-07", true],
    ["2027-01-07T23:05:00Z", "2027-01-08", false],
  ];
  for (const [instant, day, due] of cases) {
    const today = todayInCatalonia(new Date(instant));
    assert.equal(today, day, instant);
    assert.equal(seasonalRefreshDue(today), due, instant);
    assert.equal(seasonalRefreshPaths(today).length > 0, due, instant);
  }
});

test("no change on the other nights: empty list every other day of 2026 and 2027", () => {
  for (const day of days("2026-01-01", "2027-12-31")) {
    if (NIGHTS.includes(day)) continue;
    assert.deepEqual(seasonalRefreshPaths(day), [], day);
  }
});

test("page list: every date page, calculator, Christmas fair town page and English holiday town page; nothing else", () => {
  const paths = seasonalTemplatePaths();
  assert.equal(new Set(paths).size, paths.length, "no duplicates");
  for (const path of paths) assert.ok(path.startsWith("/") && !path.endsWith("/"), `${path}: revalidatePath form`);

  const dates = DATE_LOCALES.flatMap((l) => DATE_PAGES.map((iso) => noSlash(datePath(l, iso))));
  const calculators = CALC_LOCALES.flatMap((l) => CALCULATOR_IDS.map((id) => noSlash(calcPath(id, l))));
  const hubs = new Set(FAIRS_LOCALES.map((l) => fairsHubPath(l)));
  const fairs = christmasFairsPaths().filter((p) => !hubs.has(p.path)).map((p) => noSlash(p.path));
  const english = englishTowns().map((m) => noSlash(municipalityPath("en", m.slug)));
  assert.deepEqual(new Set(paths), new Set([...dates, ...calculators, ...fairs, ...english]));
  assert.equal(paths.length, dates.length + calculators.length + fairs.length + english.length);

  // Not the ca/es holiday town pages (holidayRefreshPaths, below), not the hubs.
  const caEsTowns = new Set(MUNI_LOCALES.flatMap((l) => municipalities().map((m) => noSlash(municipalityPath(l, m.slug)))));
  assert.ok(!paths.some((p) => caEsTowns.has(p)), "no ca/es holiday town page");
  assert.ok(!paths.some((p) => hubs.has(`${p}/`)), "no fair hub");

  // Every calculator path is a route folder of the app.
  for (const locale of CALC_LOCALES) {
    for (const id of CALCULATOR_IDS) {
      const slug = calcPath(id, locale).split("/").filter(Boolean).pop()!;
      assert.ok(existsSync(new URL(`../src/app/(public)/[locale]/${CALCULATORS_ROOT[locale]}/${slug}/page.tsx`, import.meta.url)), `${locale} ${id}`);
    }
  }

  // Small: ~350 URLs, purged by URL. With the markets (every night) and room
  // for the day-dependent content pages and the homes, 23 Dec and 1 Jan stay
  // under the purge-everything threshold (9 Dec and 7 Jan already pass it:
  // the ca/es town pages after the 8 Dec and 6 Jan holidays).
  console.info(`seasonal refresh: ${paths.length} URLs a switch night (dates ${dates.length}, calculators ${calculators.length}, fair towns ${fairs.length}, English towns ${english.length})`);
  assert.ok(paths.length + weeklyMarketsRefreshPaths().length + holidayRefreshPaths("2027-01-01").length <= PURGE_EVERYTHING_ABOVE - 150, `${paths.length} URLs`);
});

test("the ca/es holiday town pages are rebuilt by the holiday refresh within three nights of each switch", () => {
  const all = municipalities().length * MUNI_LOCALES.length;
  for (const night of NIGHTS) {
    const within = [0, 1, 2, 3].map((n) => addDays(night, n)).find((day) => holidayRefreshPaths(day).length === all);
    assert.ok(within, `${night}: no full town refresh within three nights`);
  }
  // Same night for the bridge and Reis switches (after the 8 Dec and 6 Jan holidays).
  assert.equal(holidayRefreshPaths("2026-12-09").length, all);
  assert.equal(holidayRefreshPaths("2027-01-07").length, all);
});

test("the seasonal link of every listed template changes only on a switch night (so one rebuild a switch night is enough)", () => {
  const english = englishTowns().map((m) => {
    const self = municipalityPath("en", m.slug);
    return {
      slug: m.slug,
      locale: "en" as const,
      step: townNextStep(m.slug, enName(m), "en", self),
      hub: townHub(m.slug, "en", "holidays", familyLastChecked()),
      guides: ["holidayToday", "workCalendar", "localHolidays", "shops", "metroHours", "strikes", "decemberBridge", "school"] as const,
    };
  });
  // A fair town page's links do not depend on the day (its step and hub are dated by the town's last read): its guides list and hub.
  const FAIR_GUIDES = ["christmas", "christmasBarcelona", "decemberBridge", "pessebres", "reis", "christmasTraditions", "shops", "barcelonaDecember"] as const;
  const fair = (locale: "ca" | "es" | "en", today: string) =>
    townFamilyOnward({
      self: `/${locale}/fair-probe/`,
      locale,
      today,
      steps: [],
      hub: null,
      links: [...FAIR_GUIDES.map((key) => ({ href: b2href(key, locale) })), { href: fairsHubPath(locale) }],
      markdown: [],
    })?.seasonal?.href ?? "none";
  const snapshot = (today: string): string[] => [
    ...DATE_LOCALES.flatMap((l) => DATE_PAGES.map((iso) => dateOnward(iso, l, today)?.seasonal?.href ?? "none")),
    ...CALC_LOCALES.flatMap((l) => CALCULATOR_IDS.map((id) => calculatorSeasonal(id, l, today)?.href ?? "none")),
    ...english.map((input) => townOnward({ ...input, guides: [...input.guides], today })?.seasonal?.href ?? "none"),
    ...FAIRS_LOCALES.map((l) => fair(l, today)),
  ];
  let previous = snapshot("2026-11-27");
  const changed: string[] = [];
  for (const day of days("2026-11-28", "2027-01-20")) {
    const current = snapshot(day);
    if (current.some((href, i) => href !== previous[i])) changed.push(day);
    previous = current;
  }
  assert.ok(changed.every((day) => NIGHTS.includes(day)), `changes on ${changed.join(", ")}`);
  assert.deepEqual(changed, NIGHTS, "every switch night changes some page");
});

test("the cron revalidates the seasonal list with the Madrid day, before the database step, and reports it", () => {
  const cron = read("src/app/api/cron/publish-scheduled/route.ts");
  assert.match(cron, /const seasonalPaths = seasonalRefreshPaths\(todayInCatalonia\(\)\);\s*for \(const path of seasonalPaths\) revalidate\(path\);/);
  assert.ok(cron.indexOf("seasonalRefreshPaths(") < cron.indexOf("const db = getDb()"), "before the database step");
  assert.match(cron, /seasonalPagesRefreshed: seasonalPaths\.length,/);
  // The other groups as they were.
  assert.match(cron, /const holidayPaths = holidayRefreshPaths\(todayInCatalonia\(\)\);/);
  assert.match(cron, /const weekendPaths = weekendRefreshPaths\(todayInCatalonia\(\)\);/);
  assert.match(cron, /const marketPaths = weeklyMarketsRefreshPaths\(\);/);
  // The templates read the Madrid day for the seasonal link (what the rebuild refreshes).
  assert.match(read("src/components/programmatic/holidays/DatePage.tsx"), /dateOnward\(iso, locale, todayInCatalonia\(\)\)/);
  assert.match(read("src/components/programmatic/calculators/MoreCalculators.tsx"), /calculatorSeasonal\(current, locale, todayInCatalonia\(\)\)/);
  assert.match(read("src/components/programmatic/holidays/EnglishTownPage.tsx"), /townOnward\(\{[^}]*today: todayInCatalonia\(\),\s*\}\)/);
  assert.match(read("src/components/programmatic/christmas-fairs/TownPage.tsx"), /townFamilyOnward\(\{\s*self: townPath\(locale, town\.slug\),\s*locale,\s*today: todayInCatalonia\(\),/);
});
