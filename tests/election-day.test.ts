import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { slugifyAnchor } from "../src/lib/content/blocks.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { ELECTION_DAY, canaryStillVoting, electionDayBlock, electionPhase, electionPhaseStart, madridClock, type ElectionDayBlock } from "../src/lib/programmatic/elections/election-day.ts";
import { ELECTION_DATE_29N, POLLS_CLOSE_29N } from "../src/lib/programmatic/elections/live/render.ts";
import { BLACKOUT_END } from "../src/lib/programmatic/polls/window.ts";
import { homeLeadKey } from "../src/lib/content/home-lead.ts";
import { buildElectionPage, townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { electionPath } from "../src/lib/programmatic/elections/paths.ts";
import { INE_MESA_URL } from "../src/lib/programmatic/elections/polling.ts";
import { hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import { ELECTION_NIGHT_RESULTS_URL, INFOELECTORAL, OFFICIAL_ELECTION_SITE, RESULTS_SITE_CHECKED, checkedDay, resultsNightLine } from "../src/lib/programmatic/elections/results-night.ts";
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
  ca: new RegExp(`comprovat el ${checkedDay("ca", RESULTS_SITE_CHECKED)}`),
  es: new RegExp(`comprobado el ${checkedDay("es", RESULTS_SITE_CHECKED)}`),
  en: new RegExp(`checked on ${checkedDay("en", RESULTS_SITE_CHECKED)}`),
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

/** First day of the "over" phase (Madrid): the routes go back to static. */
const ELECTION_LAYER_END = "2026-12-08";

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

test("the hubs, comarca and town routes regenerate every minute through 7 Dec; from 8 Dec 00:00 Madrid they must be back to `false`", () => {
  // `revalidate` must be a static literal (route segment config: "needs to be statically analyzable"), so it cannot follow the
  // clock: this guard does. It passes until 7 Dec and FAILS on 8 Dec until `node scripts/election-layer-end.mjs` is run and merged.
  const today = madridDate(new Date());
  for (const route of ROUTES) {
    const source = readFileSync(new URL(`../${route}`, import.meta.url), "utf8");
    const value = /export const revalidate = (\w+);/.exec(source)?.[1];
    if (today < ELECTION_LAYER_END) assert.equal(value, "60", `${route}: each phase must reach the cache within a minute (300 left the first visitor on the old phase for up to five)`);
    else assert.equal(value, "false", `${route}: the election-day layer is over (${ELECTION_LAYER_END}); run \`node scripts/election-layer-end.mjs\` to set revalidate back to false`);
  }
});

test("the 8 Dec reset: the guard's date is the 'over' phase's first day, and the reset script rewrites exactly the eight routes", () => {
  const start = new Date(`${ELECTION_LAYER_END}T00:00:00+01:00`);
  assert.equal(electionPhase(start), "over");
  assert.equal(electionPhase(new Date(start.getTime() - 1)), "after");
  const script = readFileSync(new URL("../scripts/election-layer-end.mjs", import.meta.url), "utf8");
  for (const route of ROUTES) assert.ok(script.includes(`"${route}"`), `the reset script lists ${route}`);
  assert.equal((script.match(/^ {2}"src\/app\//gm) ?? []).length, ROUTES.length, "and no other route");
  assert.match(script, /export const revalidate = false;/);
});

test("the pages compute the phase on the server, and the callout has no client code", () => {
  const callout = readFileSync(new URL("../src/components/programmatic/ElectionDayCallout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(callout, /^["']use client["']/m);
  for (const file of ["ElectionResultsPage", "ElectionsHubPage", "ElectionsComarcaPage"]) {
    const source = readFileSync(new URL(`../src/components/programmatic/${file}.tsx`, import.meta.url), "utf8");
    assert.match(source, /electionPhase\(now\)/, file);
    assert.match(source, /<ElectionDayCallout block=\{day\} \/>/, file);
    assert.doesNotMatch(source, /^["']use client["']/m, file);
  }
});

test("no announced site: the night says 'pending' and still links the official election site and Infoelectoral, in every language", () => {
  const PENDING_WORD: Record<Locale, RegExp> = { ca: /pendent/, es: /pendiente/, en: /pending/ };
  for (const locale of LOCALES) {
    for (const phase of ["count", "after"] as const) {
      const off = electionDayBlock(locale, phase, { resultsUrl: null });
      assert.ok(off, `${locale} ${phase}`);
      const all = text(off);
      assert.match(all, PENDING_WORD[locale], `${locale} ${phase}: says the site is pending`);
      assert.ok(all.includes(`](${OFFICIAL_ELECTION_SITE})`), `${locale} ${phase}: links the ministry's election site`);
      assert.ok(all.includes(`](${INFOELECTORAL})`), `${locale} ${phase}: links Infoelectoral`);
      assert.equal(off.cta, null, `${locale} ${phase}: no results button for a site that is not announced`);
      // Once the site is announced, the pending line and the stopgap links go.
      const on = text(electionDayBlock(locale, phase, { resultsUrl: FAKE_SITE }));
      // From 30 Nov the "pending" is the final official result (the general count), not the site: it stays once the site is announced.
      if (phase === "count") assert.doesNotMatch(on, PENDING_WORD[locale], `${locale} ${phase}: no 'pending' once announced`);
      else assert.match(on, PENDING_WORD[locale], `${locale} ${phase}: the final result is still pending`);
      assert.ok(!on.includes(INFOELECTORAL), `${locale} ${phase}: no stopgap link once announced`);
    }
  }
});

test("everything time-based on the night flips by the clock alone: one set of instants, no deploy", () => {
  // The election-day layer, the live-results prototype and the polls blackout agree on 20:00 / 21:00 Madrid on 29 Nov.
  assert.equal(ELECTION_DATE_29N, ELECTION_DAY.day);
  assert.equal(new Date(POLLS_CLOSE_29N).getTime(), electionPhaseStart(new Date("2026-11-29T19:30:00Z"))!.getTime(), "polls close = start of the count phase");
  assert.equal(electionPhase(new Date(new Date(POLLS_CLOSE_29N).getTime() - 1)), "polling");
  assert.equal(electionPhase(new Date(POLLS_CLOSE_29N)), "count");
  assert.equal(BLACKOUT_END.getTime() - new Date(POLLS_CLOSE_29N).getTime(), 60 * 60_000, "poll figures stay off one hour longer: the Canary Islands close at 21:00 Madrid");
  // The count phase runs through the Canary hour and the night; the next day is "after".
  assert.equal(electionPhase(new Date("2026-11-29T20:00:00Z")), "count"); // 21:00 Madrid
  assert.equal(electionPhase(new Date("2026-11-29T22:59:59Z")), "count"); // 23:59:59 Madrid
  // The home page lead switches on the Madrid date: the voting guide to 28 Nov, the election-night guide from 29 Nov.
  assert.equal(homeLeadKey("2026-11-28"), "voting");
  assert.equal(homeLeadKey("2026-11-29"), "electionNight");
  assert.equal(homeLeadKey("2026-11-30"), "electionNight");
  // The constants' fixed +01:00 offset is Madrid's on that date (CET since 25 Oct 2026).
  assert.equal(madridClock(new Date(POLLS_CLOSE_29N)).minutes, 20 * 60);
  assert.equal(madridClock(BLACKOUT_END).minutes, 21 * 60);
});

test("count phase title is true for the Canary hour: 'polls closed' only from 21:00 Madrid (boundaries 20:30 and 21:00)", () => {
  const CLOSED_EVERYWHERE: Record<Locale, RegExp> = { ca: /^Urnes tancades/, es: /^Urnas cerradas/, en: /^Polls closed:/ };
  const CANARY: Record<Locale, RegExp> = { ca: /excepte a les Canàries.*21:00/, es: /salvo en Canarias.*21:00/, en: /except in the Canary Islands.*21:00/ };
  const at2030 = at("2026-11-29T19:30:00Z"); // 20:30 Madrid
  const at2059 = at("2026-11-29T19:59:59Z"); // 20:59:59 Madrid
  const at2100 = at("2026-11-29T20:00:00Z"); // 21:00 Madrid
  assert.equal(canaryStillVoting(at("2026-11-29T18:59:59Z")), false, "19:59:59: polling, not the count");
  assert.equal(canaryStillVoting(at("2026-11-29T19:00:00Z")), true, "20:00");
  assert.equal(canaryStillVoting(at2059), true);
  assert.equal(canaryStillVoting(at2100), false);
  assert.equal(canaryStillVoting(at("2026-11-30T19:30:00Z")), false, "the next evening is not the Canary hour");
  for (const locale of LOCALES) {
    for (const url of [null, FAKE_SITE]) {
      for (const now of [at2030, at2059]) {
        const block = electionDayBlock(locale, electionPhase(now), { resultsUrl: url, now });
        assert.ok(block);
        assert.doesNotMatch(block.title, CLOSED_EVERYWHERE[locale], `${locale}: not "closed" at ${now.toISOString()}`);
        assert.match(block.title, CANARY[locale], `${locale}: says the Canary Islands still vote`);
      }
      const late = electionDayBlock(locale, electionPhase(at2100), { resultsUrl: url, now: at2100 });
      assert.match(late!.title, CLOSED_EVERYWHERE[locale], `${locale}: closed everywhere from 21:00`);
    }
    // No clock given (static callers, the other phases): the 21:00 title, and polling/after unchanged.
    assert.match(electionDayBlock(locale, "count")!.title, CLOSED_EVERYWHERE[locale]);
    assert.equal(electionDayBlock(locale, "after", { now: at2030 })!.title, electionDayBlock(locale, "after")!.title);
    // Town pages pass the clock through.
    const town = townElectionDay(salou(), locale, "count", undefined, undefined, at2030);
    assert.match(town!.title, CANARY[locale]);
  }
});

test("no announced site: one pending line per language, no second 'not announced' sentence, no mixed tenses", () => {
  const checkedWord: Record<Locale, RegExp> = { ca: /comprovat el/g, es: /comprobado el/g, en: /checked on/g };
  const notAnnounced: Record<Locale, RegExp> = { ca: /havia anunciat|no ha anunciat/, es: /había anunciado|no ha anunciado/, en: /had not announced|has not announced|not yet announced/ };
  for (const locale of LOCALES) {
    for (const phase of ["count", "after"] as const) {
      const all = text(electionDayBlock(locale, phase, { resultsUrl: null }));
      // The night's "checked on 24 Nov" belongs to the night; the day after it would be a stale claim.
      assert.equal((all.match(checkedWord[locale]) ?? []).length, phase === "count" ? 1 : 0, `${locale} ${phase}: the check date is said once on the night and never after it`);
      assert.doesNotMatch(all, notAnnounced[locale], `${locale} ${phase}: the pending line says it, nothing repeats it`);
    }
  }
});

/* ---- after the night (24 Nov 2026): past tense, final result pending, then "over" ---- */

const LOREG_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
// Madrid instants at the edges the ticket names.
const MON_30_0000 = at("2026-11-30T00:00:00+01:00");
const WED_2 = at("2026-12-02T12:00:00+01:00");
const MON_7_2359 = at("2026-12-07T23:59:00+01:00");
const TUE_8_0000 = at("2026-12-08T00:00:00+01:00");
// A promise or a night-time scene, false once the night is over.
const NIGHT_PROMISE: Record<Locale, RegExp> = {
  ca: /aquella mateixa nit|aquesta nit|avui es vota|demà es vota|publicarà|hi enllaçarem|pendent d'anunci/i,
  es: /esa misma noche|esta noche|hoy se vota|mañana se vota|publicará|enlazaremos|pendiente de anuncio/i,
  en: /the same night|tonight|polling day is (today|tomorrow)|we will link|pending announcement|comes in/i,
};
const COUNT_DATES: Record<Locale, RegExp> = { ca: /4 de desembre.*7/s, es: /4 de diciembre.*7/s, en: /4 December.*7 December/s };
const PENDING_WORD_AFTER: RegExp = /pendent|pendiente|pending/;

test("boundaries: Mon 30 Nov 00:00 starts 'after'; Wed 2 Dec and Mon 7 Dec 23:59 are still 'after'; Tue 8 Dec 00:00 is 'over' (Madrid)", () => {
  assert.equal(electionPhase(new Date(MON_30_0000.getTime() - 1)), "count");
  assert.equal(electionPhase(MON_30_0000), "after");
  assert.equal(electionPhase(WED_2), "after");
  assert.equal(electionPhase(MON_7_2359), "after");
  assert.equal(electionPhase(TUE_8_0000), "over");
  assert.equal(electionPhaseStart(WED_2)?.toISOString(), MON_30_0000.toISOString());
  assert.equal(electionPhaseStart(TUE_8_0000)?.toISOString(), TUE_8_0000.toISOString());
});

test("after the night: past tense about the night, the count dated by the law, the final result pending, in ca/es/en", () => {
  const town = salou();
  for (const locale of LOCALES) {
    for (const now of [MON_30_0000, WED_2, MON_7_2359]) {
      const phase = electionPhase(now);
      for (const block of [electionDayBlock(locale, phase, { resultsUrl: null, now }), townElectionDay(town, locale, phase, undefined, undefined, now)]) {
        assert.ok(block, `${locale} ${now.toISOString()}`);
        assert.equal(block.phase, "after");
        const all = text(block);
        assert.doesNotMatch(all, NIGHT_PROMISE[locale], `${locale} ${now.toISOString()}: no promise or night-time tense`);
        assert.match(all, COUNT_DATES[locale], `${locale}: the count, 4 to 7 December`);
        assert.match(all, PENDING_WORD_AFTER, `${locale}: the final result is pending`);
        for (const article of ["103", "107", "108"]) assert.match(all, new RegExp(`\\b${article}\\b`), `${locale}: art. ${article}`);
        assert.match(all, /BOE/);
        assert.ok(all.includes(`](${LOREG_URL})`), `${locale}: links the LOREG on the BOE`);
        assert.ok(all.includes(`](${OFFICIAL_ELECTION_SITE})`) && all.includes(`](${INFOELECTORAL})`), `${locale}: the official links while pending`);
        assert.doesNotMatch(all.replace(/\]\([^)]*\)/g, "]"), /\d\s*%|\d{1,3}[.,]\d{3}\s+(vots|votos|votes)|enquest|sondeo|encuesta|\bpolls?\b/i, `${locale}: no figure, no poll`);
      }
    }
  }
});

test("after the night the callout title names the pending official result", () => {
  const title: Record<Locale, RegExp> = { ca: /resultat oficial pendent/, es: /resultado oficial pendiente/, en: /official result pending/ };
  for (const locale of LOCALES) assert.match(electionDayBlock(locale, "after")!.title, title[locale]);
});

test("the results line by phase: after and over are past; over has no promise, no pending and no results-page link", () => {
  for (const locale of LOCALES) {
    const before = resultsNightLine(locale, null);
    assert.match(before, /20:00/);
    assert.equal(resultsNightLine(locale, null, "before"), before, "the default phase is the one the static guides use: unchanged");
    for (const phase of ["after", "over"] as const) {
      const line = resultsNightLine(locale, null, phase);
      assert.doesNotMatch(line, NIGHT_PROMISE[locale], `${locale} ${phase}`);
      assert.doesNotMatch(line, /comprov|comprob|checked on/, `${locale} ${phase}: no stale check date`);
      for (const article of ["103", "107", "108"]) assert.match(line, new RegExp(`\\b${article}\\b`), `${locale} ${phase}: art. ${article}`);
      assert.match(line, /BOE/);
      assert.doesNotMatch(line, /\d\s*%/);
    }
    const after = resultsNightLine(locale, null, "after");
    assert.match(after, PENDING_WORD_AFTER);
    assert.match(after, COUNT_DATES[locale]);
    assert.doesNotMatch(after, /\]\(/, `${locale}: the line carries no link; the callout above it does`);
    const over = resultsNightLine(locale, null, "over");
    assert.doesNotMatch(over, PENDING_WORD_AFTER, `${locale}: over is not pending`);
    assert.match(over, { ca: /havia de començar el 4 de desembre i acabar/s, es: /debía empezar el 4 de diciembre y concluir/s, en: /was due to begin on 4 December and to finish/s }[locale], `${locale}: the count is stated as the law's schedule, not as a fact`);
    assert.ok(over.includes(`](${OFFICIAL_ELECTION_SITE})`) && over.includes(`](${INFOELECTORAL})`), `${locale}: where the official information is`);
    // A set switch is linked once on the days after the vote, and never on 8 Dec onwards.
    assert.equal(resultsNightLine(locale, FAKE_SITE, "after").split(`](${FAKE_SITE})`).length - 1, 1, `${locale}: one link`);
    assert.ok(!resultsNightLine(locale, FAKE_SITE, "over").includes(FAKE_SITE), `${locale}: no results-site link from 8 Dec`);
  }
});

test("town pages and the hub print the line of their phase; the 'if you have to vote' guides leave once the vote is over", () => {
  const m = salou();
  for (const locale of LOCALES) {
    const votingLead: Record<Locale, RegExp> = { ca: /Si has de votar/, es: /Si tienes que votar/, en: /Voting on 29 November\?|If you are voting/ };
    if (SNAPSHOT.general2026) continue;
    assert.match(buildElectionPage(m, locale).slot.md.join("\n"), votingLead[locale], `${locale}: before the vote the guides are there`);
    assert.match(hubCopy(locale).intro.join("\n"), votingLead[locale], `${locale}: hub before the vote`);
    for (const [phase, now] of [["after", WED_2], ["over", TUE_8_0000]] as const) {
      assert.equal(electionPhase(now), phase);
      const md = buildElectionPage(m, locale, undefined, phase).slot.md.join("\n");
      const intro = hubCopy(locale, phase).intro.join("\n");
      const line = resultsNightLine(locale, undefined, phase);
      assert.ok(md.includes(line), `${locale} ${phase}: town slot`);
      assert.ok(intro.includes(line), `${locale} ${phase}: hub`);
      assert.doesNotMatch(md, votingLead[locale], `${locale} ${phase}: town slot`);
      assert.doesNotMatch(intro, votingLead[locale], `${locale} ${phase}: hub`);
    }
  }
});
