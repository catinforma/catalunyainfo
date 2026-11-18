import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { slugifyAnchor } from "../src/lib/content/blocks.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { electionDayBlock, electionPhase, madridClock, type ElectionDayBlock } from "../src/lib/programmatic/elections/election-day.ts";
import { buildElectionPage, townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { electionPath } from "../src/lib/programmatic/elections/paths.ts";
import { INE_MESA_URL } from "../src/lib/programmatic/elections/polling.ts";
import { ELECTION_NIGHT_RESULTS_URL } from "../src/lib/programmatic/elections/results-night.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import { madridDate } from "../src/lib/programmatic/elections/today.ts";

/**
 * The 29N election-day layer (18 Nov 2026, docs/SEO_EXPERIMENTS.md): the
 * phase is a pure function of an instant, computed on the server at render
 * time; these pin the eve (28 Nov), polling-day morning (29 Nov), the night
 * and the day after (30 Nov), in all three languages, and that the routes
 * regenerate often enough for each phase to reach the cache.
 */

const at = (iso: string) => new Date(iso);
const SAT_28 = at("2026-11-28T10:00:00Z"); // 11:00 Madrid
const SUN_29_MORNING = at("2026-11-29T09:30:00Z"); // 10:30 Madrid
const SUN_29_NIGHT = at("2026-11-29T19:30:00Z"); // 20:30 Madrid
const MON_30 = at("2026-11-30T08:00:00Z"); // 09:00 Madrid
const FAKE_SITE = "https://resultados.example.gob.es/";
const text = (b: ElectionDayBlock | null) => (b ? [b.title, ...b.md, b.cta?.label ?? ""].join("\n") : "");
const salou = () => {
  const m = SNAPSHOT.municipalities.find((x) => x.slug === "salou");
  assert.ok(m, "salou is in the snapshot");
  return m;
};

test("phases flip at midnight and at 20:00 in Madrid, whatever the server's time zone", () => {
  const cases: [string, string][] = [
    ["2026-11-18T12:00:00Z", "before"],
    ["2026-11-27T22:59:59Z", "before"], // 23:59:59 on Fri 27
    ["2026-11-27T23:00:00Z", "eve"], // 00:00 on Sat 28
    [SAT_28.toISOString(), "eve"],
    ["2026-11-28T23:00:00Z", "polling"], // 00:00 on Sun 29
    ["2026-11-29T08:00:00Z", "polling"], // 09:00, polls open
    [SUN_29_MORNING.toISOString(), "polling"],
    ["2026-11-29T18:59:59Z", "polling"], // 19:59:59
    ["2026-11-29T19:00:00Z", "count"], // 20:00, polls close in Catalonia
    [SUN_29_NIGHT.toISOString(), "count"],
    ["2026-11-29T22:59:59Z", "count"],
    ["2026-11-29T23:00:00Z", "after"], // 00:00 on Mon 30
    [MON_30.toISOString(), "after"],
    ["2026-12-07T22:59:59Z", "after"], // last day of the general count
    ["2026-12-07T23:00:00Z", "over"],
  ];
  for (const [iso, phase] of cases) assert.equal(electionPhase(at(iso)), phase, iso);
  assert.deepEqual(madridClock(at("2026-11-29T19:00:00Z")), { date: "2026-11-29", minutes: 20 * 60 });
  assert.equal(madridClock(at("2026-11-28T23:30:00Z")).date, madridDate(at("2026-11-28T23:30:00Z")));
});

test("no block before the eve or after the general count", () => {
  for (const locale of LOCALES) {
    assert.equal(electionDayBlock(locale, electionPhase(at("2026-11-27T12:00:00Z"))), null, locale);
    assert.equal(electionDayBlock(locale, electionPhase(at("2026-12-08T12:00:00Z"))), null, locale);
  }
});

const TOMORROW: Record<Locale, RegExp> = { ca: /^Demà es vota/, es: /^Mañana se vota/, en: /tomorrow/ };
const TODAY: Record<Locale, RegExp> = { ca: /^Avui es vota/, es: /^Hoy se vota/, en: /today/ };
const REFLECTION: Record<Locale, RegExp> = { ca: /jornada de reflexió/, es: /jornada de reflexión/, en: /day of reflection/ };
const PENDING: Record<Locale, RegExp> = {
  ca: /comprovat el 18 de novembre de 2026/,
  es: /comprobado el 18 de noviembre de 2026/,
  en: /checked on 18 November 2026/,
};

test("28 Nov (eve): tomorrow's hours, ID, where to vote, the help line and the reflection day; no results button", () => {
  for (const locale of LOCALES) {
    const block = electionDayBlock(locale, electionPhase(SAT_28), { resultsUrl: FAKE_SITE });
    assert.ok(block, locale);
    assert.equal(block.phase, "eve");
    assert.match(block.title, TOMORROW[locale], `${locale}: title says tomorrow`);
    const all = text(block);
    assert.match(all, /9:00/);
    assert.match(all, /20:00/);
    assert.match(all, /MiDNI/);
    assert.ok(all.includes(`](${INE_MESA_URL})`), `${locale}: links the INE lookup`);
    assert.match(all, /900 343 232/);
    assert.match(all, REFLECTION[locale]);
    assert.equal(block.cta, null, `${locale}: no button before polls close`);
    assert.doesNotMatch(all, TODAY[locale]);
  }
});

test("29 Nov morning: today's essentials lead, results promised from 20:00, the site link only once announced", () => {
  for (const locale of LOCALES) {
    const off = electionDayBlock(locale, electionPhase(SUN_29_MORNING), { resultsUrl: null });
    assert.ok(off, locale);
    assert.equal(off.phase, "polling");
    assert.equal(off.tone, "warning");
    assert.match(off.title, TODAY[locale], `${locale}: title says today`);
    const all = text(off);
    assert.match(off.md[0]!, /9:00.*20:00/, `${locale}: hours first`);
    assert.match(off.md[1]!, /DNI/, `${locale}: then what to bring`);
    assert.ok(off.md[2]!.includes(INE_MESA_URL), `${locale}: then where (INE lookup)`);
    assert.match(all, /8:00 (a|to) 20:00/, `${locale}: help line hours on the day`);
    assert.match(all, /21:00/, `${locale}: Canary Islands`);
    assert.match(all, PENDING[locale], `${locale}: says the site is not announced yet, with the date checked`);
    assert.doesNotMatch(all, REFLECTION[locale]);
    assert.equal(off.cta, null);
    const on = electionDayBlock(locale, "polling", { resultsUrl: FAKE_SITE });
    assert.ok(on && text(on).includes(`](${FAKE_SITE})`), `${locale}: the announced site is linked in the results line`);
    assert.equal(on.cta, null, `${locale}: no button until 20:00`);
    assert.doesNotMatch(text(on), PENDING[locale]);
  }
});

test("29 Nov from 20:00: the official results site is the first thing, as a button, once announced", () => {
  for (const locale of LOCALES) {
    const on = electionDayBlock(locale, electionPhase(SUN_29_NIGHT), { resultsUrl: FAKE_SITE });
    assert.ok(on, locale);
    assert.equal(on.phase, "count");
    assert.deepEqual(on.cta?.href, FAKE_SITE);
    assert.match(on.cta!.label, /Interior/);
    assert.match(text(on), /BOE/);
    assert.match(text(on), /\b4\b.*\b7\b/);
    const off = electionDayBlock(locale, "count", { resultsUrl: null });
    assert.equal(off?.cta, null, `${locale}: no button without an announced site`);
    assert.match(text(off), PENDING[locale]);
  }
  // The live switch: a button on the night exactly when results-night.ts is set.
  assert.equal(electionDayBlock("es", "count")?.cta?.href ?? null, ELECTION_NIGHT_RESULTS_URL);
});

test("30 Nov: provisional vs official, the 4-7 Dec count, mesa members' five hours, the town's results line", () => {
  const m = salou();
  for (const locale of LOCALES) {
    const block = townElectionDay(m, locale, electionPhase(MON_30));
    assert.ok(block, locale);
    assert.equal(block.phase, "after");
    assert.equal(block.tone, "info");
    const all = text(block);
    assert.match(all, /BOE/);
    assert.match(all, /\b4\b.*\b7\b/);
    assert.match(all, /\b5\b|cinc|cinco|five/);
    assert.match(all, /30/);
    if (SNAPSHOT.general2026) assert.doesNotMatch(all, /(apareixeran|aparecerán|will appear)/, `${locale}: no promise once the file is in`);
    else assert.match(all, /(apareixeran|aparecerán|will appear)/, `${locale}: the town's results will appear here`);
  }
});

test("town pages: the block links the page's own polling-places section, with the BOP counts", () => {
  const m = salou();
  for (const locale of LOCALES) {
    const polling = buildElectionPage(m, locale).polling;
    const block = townElectionDay(m, locale, "polling", polling);
    assert.ok(block);
    const anchor = `${electionPath(locale, m.slug)}#${slugifyAnchor(polling.title)}`;
    assert.ok(block.md.some((line) => line.includes(`](${anchor})`)), `${locale}: links ${anchor}`);
    if (polling.totals) assert.ok(block.md.some((line) => line.includes(String(polling.totals!.tables))), `${locale}: table count`);
  }
});

test("the layer stays neutral: no polls, forecasts, parties or percentages; links stay in their language", () => {
  const phases = ["eve", "polling", "count", "after"] as const;
  for (const locale of LOCALES) {
    for (const phase of phases) {
      for (const url of [null, FAKE_SITE]) {
        const all = text(electionDayBlock(locale, phase, { resultsUrl: url }));
        assert.doesNotMatch(all.replace(/\]\([^)]*\)/g, "]"), /enquest|sondeig|encuesta|sondeo|\bpolls?\b(?! (open|close))|previsi|pronòstic|pronóstico|forecast|projecci|proyecci|projection|%/i, `${locale} ${phase}`);
        for (const [, href] of all.matchAll(/\]\((\/[^)]+)\)/g)) assert.ok(href!.startsWith(`/${locale}/`), `${locale} ${phase}: ${href}`);
      }
    }
  }
});

const ROUTES = [
  "src/app/(public)/[locale]/eleccions/page.tsx",
  "src/app/(public)/[locale]/elecciones/page.tsx",
  "src/app/(public)/[locale]/elections/page.tsx",
  "src/app/(public)/[locale]/eleccions/[municipi]/page.tsx",
  "src/app/(public)/[locale]/elecciones/[municipi]/page.tsx",
  "src/app/(public)/[locale]/elections/[municipi]/page.tsx",
  "src/app/(public)/[locale]/eleccions/comarca/[comarca]/page.tsx",
  "src/app/(public)/[locale]/elecciones/comarca/[comarca]/page.tsx",
];

test("the hubs, comarca and town routes regenerate every 5 minutes through 7 Dec, then go back to static", () => {
  const today = madridDate(new Date());
  for (const route of ROUTES) {
    const source = readFileSync(new URL(`../${route}`, import.meta.url), "utf8");
    const value = /export const revalidate = (\w+);/.exec(source)?.[1];
    if (today <= "2026-12-08") assert.equal(value, "300", `${route}: each phase must reach the cache within minutes`);
    else assert.equal(value, "false", `${route}: the election-day layer is over; set revalidate back to false`);
  }
});

test("the pages compute the phase on the server, and the callout has no client code", () => {
  const callout = readFileSync(new URL("../src/components/programmatic/ElectionDayCallout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(callout, /^["']use client["']/m);
  for (const file of ["ElectionResultsPage", "ElectionsHubPage", "ElectionsComarcaPage"]) {
    const source = readFileSync(new URL(`../src/components/programmatic/${file}.tsx`, import.meta.url), "utf8");
    assert.match(source, /electionPhase\(new Date\(\)\)/, file);
    assert.match(source, /<ElectionDayCallout block=\{day\} \/>/, file);
    assert.doesNotMatch(source, /^["']use client["']/m, file);
  }
});
