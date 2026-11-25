import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import type { Block } from "../src/lib/content/blocks.ts";
import { CANDIDATES } from "../src/lib/content/batch02/candidates.ts";
import { DECEMBER_BRIDGE, outsideCataloniaCallout } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { B2_PATHS, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { buildBody as workCalendarBody } from "../src/lib/content/holidays/publish.ts";
import { buildBody as reservoirGuideBody } from "../src/lib/content/reservoirs/publish.ts";
import { dateContent } from "../src/lib/programmatic/holidays/dates.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { datePath, sameDayIn2026 } from "../src/lib/programmatic/holidays/paths.ts";
import { dateQuestion } from "../src/lib/programmatic/holidays/question.ts";
import { hubAnswer, relatedLinks } from "../src/lib/programmatic/reservoirs/copy.ts";
import { snapshotReadings } from "../src/lib/programmatic/reservoirs/data.ts";
import { reservoirHubPath } from "../src/lib/programmatic/reservoirs/paths.ts";
import { SPAIN_MAIN, mainElsewhere } from "../src/lib/programmatic/spain-2027/main-urls.ts";
import { todayLinks } from "../src/lib/programmatic/today/data.ts";

/**
 * 25 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Cannibalisation pass", 7 clusters):
 * where two pages of one language share a query, the non-owner page already
 * links the owner with the query's words. This file holds those links at the
 * source that builds them (the article blocks, the date-page content, the
 * view components), so an edit cannot drop one without this test failing.
 * Nothing here checks wording that is free to change: anchors are matched by
 * the query's own words only.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");
const b2 = (key: B2Key, locale: (typeof LOCALES)[number]) => `/${locale}/${B2_PATHS[key][locale]}/`;

/** The text of every markdown link `[label](path)` in the blocks (the label never holds brackets). */
function anchorsTo(blocks: unknown, path: string): string[] {
  const escaped = path.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return [...JSON.stringify(blocks).matchAll(new RegExp(`\\[([^\\[\\]]+)\\]\\(${escaped}\\)`, "g"))].map((m) => m[1]!);
}

function assertLinks(blocks: unknown, path: string, words: RegExp, what: string) {
  const anchors = anchorsTo(blocks, path);
  assert.ok(anchors.length > 0, `${what}: no link to ${path}`);
  assert.ok(
    anchors.some((a) => words.test(a)),
    `${what}: no anchor to ${path} with ${words} (anchors: ${anchors.join(" | ")})`,
  );
}

/* ------------------------------------------------------------------ 1 */
/* "festivos puente diciembre": Spain page owns it; Cataluña page links it, and back. */

test("1. Catalonia December bridge links the Spain page in 'los festivos del puente de diciembre 2026 en cada comunidad'", () => {
  const words = {
    ca: /festius del pont de desembre 2026 a cada comunitat/,
    es: /festivos del puente de diciembre 2026 en cada comunidad/,
    en: /December 2026 bridge holidays in every region/,
  };
  for (const locale of LOCALES) {
    const target = b2("decemberBridgeSpain", locale);
    // The builder of the callout, and the article that shows it.
    assertLinks(outsideCataloniaCallout(locale), target, words[locale], `outsideCataloniaCallout ${locale}`);
    assertLinks(DECEMBER_BRIDGE.editions[locale].blocks, target, words[locale], `DECEMBER_BRIDGE ${locale}`);
  }
});

test("1. Spain December bridge links the Catalonia page ('solo es festivo el martes 8') in the key facts and the related list", () => {
  const words = { ca: /només és festiu el dimarts 8/, es: /solo es festivo el martes 8/, en: /only Tuesday the 8th is a holiday/ };
  for (const locale of LOCALES) {
    const blocks = DECEMBER_BRIDGE_SPAIN.editions[locale].blocks as Block[];
    const target = b2("decemberBridge", locale);
    assertLinks(blocks, target, words[locale], `DECEMBER_BRIDGE_SPAIN ${locale}`);
    // A link in a key-facts row AND the related list: two separate placements.
    const facts = blocks.filter((b) => b.type === "keyFacts");
    assert.ok(JSON.stringify(facts).includes(target), `${locale}: key facts link the Catalonia page`);
    const related = blocks.findIndex((b) => b.type === "list" && JSON.stringify(b).includes(target));
    assert.ok(related > 0, `${locale}: related list links the Catalonia page`);
  }
});

/* ------------------------------------------------------------------ 2 */
/* "el 7 de diciembre de 2026 es festivo": Spain page owns "donde"; the date page links it twice. */

test("2. The 7 and 8 December 2026 date pages link the Spain bridge page (restOfSpain line and guides list)", () => {
  const words = {
    "2026-12-07": {
      ca: /dilluns 7 de desembre de 2026, comunitat per comunitat/,
      es: /Dónde es festivo el lunes 7 de diciembre de 2026, comunidad por comunidad/,
      en: /Monday 7 December 2026 is a public holiday, region by region/,
    },
    "2026-12-08": {
      ca: /pont de desembre 2026 a cada comunitat/,
      es: /puente de diciembre 2026 en cada comunidad/,
      en: /December 2026 bridge holidays in every region/,
    },
  } as const;
  for (const iso of ["2026-12-07", "2026-12-08"] as const) {
    for (const locale of LOCALES) {
      const content = dateContent(iso, locale);
      const target = GUIDES.decemberBridgeSpain[locale];
      assert.equal(target, b2("decemberBridgeSpain", locale), "the date pages' guide table points at the published article");
      assert.equal(content.restOfSpain?.href, target, `${iso} ${locale}: restOfSpain href`);
      assert.match(content.restOfSpain?.label ?? "", words[iso][locale], `${iso} ${locale}: restOfSpain label`);
      assert.ok(content.guides.includes("decemberBridgeSpain"), `${iso} ${locale}: guides list`);
    }
  }
  // The view component prints restOfSpain and the guides (the two places the link is drawn).
  const view = read("src/components/programmatic/holidays/DatePage.tsx");
  assert.match(view, /content\.restOfSpain\.href/);
  assert.match(view, /content\.guides|GuideLinks/);
});

test("2. The Spain bridge page links the 7 and 8 December 2026 date pages", () => {
  for (const locale of LOCALES) {
    for (const iso of ["2026-12-07", "2026-12-08"]) {
      assert.ok(
        anchorsTo(DECEMBER_BRIDGE_SPAIN.editions[locale].blocks, datePath(locale, iso)).length > 0,
        `${locale}: no link to the ${iso} date page`,
      );
    }
  }
});

/* ------------------------------------------------------------------ 3 */
/* "el 7 de diciembre es festivo en cataluña": the 2027 date page links the 2026 one with the query's words. */

test("3. A 2027 date page links the same day of 2026 with the question '¿Es festivo el 7 de diciembre de 2026 en Cataluña?'", () => {
  assert.equal(sameDayIn2026("2027-12-07"), "2026-12-07");
  assert.equal(sameDayIn2026("2027-12-08"), "2026-12-08");
  assert.equal(dateQuestion("2026-12-07", "es"), "¿Es festivo el 7 de diciembre de 2026 en Cataluña?");
  assert.match(dateQuestion("2026-12-08", "es"), /^¿Es festivo el 8 de diciembre de 2026 en Cataluña\?$/);
  assert.match(dateQuestion("2026-12-07", "ca"), /festiu el 7 de desembre de 2026 a Catalunya/);
  assert.match(dateQuestion("2026-12-07", "en"), /7 December 2026 a public holiday in Catalonia/);
  const view = read("src/components/programmatic/holidays/DatePage.tsx");
  // The link is the sameDayIn2026 twin's page, labelled with its own question (the H1 of that page).
  assert.match(view, /<Link href=\{datePath\(locale, sameDay2026\)\}>\{dateQuestion\(sameDay2026, locale\)\}<\/Link>/);
});

/* ------------------------------------------------------------------ 4 */
/* "hoy es festivo en cataluña": the daily guide owns it; Barcelona, date pages, hub, work calendar and /hoy link it. */

test("4. Everything that should send 'es festivo hoy' readers to the daily guide still does", () => {
  const target = (l: (typeof LOCALES)[number]) => b2("holidayToday", l);
  for (const locale of LOCALES) {
    assert.equal(GUIDES.holidayToday[locale], target(locale), `${locale}: guide table = published article`);
    // Date pages: 1 Nov 2026 (the past-date page that took the query), 8 Dec 2026 and the 2027 pages.
    for (const iso of ["2026-11-01", "2026-12-08", "2027-12-07", "2027-12-08"]) {
      assert.ok(dateContent(iso, locale).guides.includes("holidayToday"), `${iso} ${locale}: guides list`);
    }
    // The work calendar (public holidays guide).
    assert.ok(anchorsTo(workCalendarBody(locale), target(locale)).length > 0, `${locale}: work calendar links the daily guide`);
    // The /hoy page's holiday block.
    assert.equal(todayLinks(locale).holidays.today, target(locale), `${locale}: /hoy holiday link`);
  }
  // The views that draw the "related guides" list lead with it (first key), in the query's words.
  const labels = read("src/components/programmatic/holidays/parts.tsx");
  assert.match(labels, /holidayToday: \{ ca: "És festiu avui a Catalunya\?", es: "¿Es festivo hoy en Cataluña\?", en: "Is today a public holiday in Catalonia\?" \}/);
  for (const file of [
    "src/components/programmatic/holidays/HubPage.tsx",
    "src/components/programmatic/holidays/EnglishHubPage.tsx",
    "src/components/programmatic/holidays/MunicipalityPage.tsx",
    "src/components/programmatic/holidays/ComarcaPage.tsx",
  ]) {
    assert.match(read(file), /keys=\{\[\s*"holidayToday"/, `${file}: GuideLinks lists the daily guide first`);
  }
  assert.match(read("src/components/programmatic/holidays/EnglishTownPage.tsx"), /"holidayToday"/);
  assert.match(read("src/components/programmatic/today/TodayPage.tsx"), /\{ label: w\.holidayToday!, href: l\.holidays\.today \}/);
});

/* ------------------------------------------------------------------ 5 */
/* "embalses cataluña": the hub owns the bare name; the guide owns "hoy". Each links the other. */

test("5. Reservoir hub links the guide ('los embalses de Cataluña hoy') and the guide links the hub", () => {
  const guidePath = { ca: "/ca/guies/embassaments-catalunya-avui/", es: "/es/guias/embalses-cataluna-hoy/", en: "/en/guides/catalonia-reservoir-levels/" };
  const readings = snapshotReadings();
  for (const locale of LOCALES) {
    // Hub to guide: the first line of the hub (with the total) and the related list.
    const answer = hubAnswer(locale, readings, 78.1);
    assert.ok(answer.includes(`](${guidePath[locale]})`), `${locale}: hub first line links the guide`);
    assert.equal(hubAnswer(locale, readings, null).includes("]("), false, "no total, no link");
    assert.ok(relatedLinks(locale).some((l) => l.href === guidePath[locale]), `${locale}: hub related list`);
    // Guide to hub: the sentence about each reservoir's own page.
    assert.ok(anchorsTo(reservoirGuideBody(locale), reservoirHubPath(locale)).length > 0, `${locale}: guide links the hub`);
  }
  assert.match(hubAnswer("es", readings, 78.1), /\[los embalses de Cataluña hoy\]/);
  assert.ok(anchorsTo(reservoirGuideBody("es"), reservoirHubPath("es")).some((a) => /su página/.test(a)));
});

/* ------------------------------------------------------------------ 6 */
/* General election: how-to-vote guide owns dates and polling stations; candidates and night guides link it. */

test("6. Candidates and election-night guides link the how-to-vote guide; it links both back", () => {
  const vote = /(cómo votar|com votar|how to vote)/i;
  for (const locale of LOCALES) {
    const voting = b2("voting", locale);
    assertLinks(CANDIDATES.editions[locale].blocks, voting, vote, `CANDIDATES ${locale}`);
    assertLinks(ELECTION_NIGHT.editions[locale].blocks, voting, vote, `ELECTION_NIGHT ${locale}`);
    assert.ok(anchorsTo(VOTING.editions[locale].blocks, b2("electionNight", locale)).length > 0, `${locale}: voting links the night guide`);
    assert.ok(anchorsTo(VOTING.editions[locale].blocks, b2("candidates", locale)).length > 0, `${locale}: voting links the candidates guide`);
  }
  // English: the night guide uses the query's words ("2026 Spain general election dates and how to vote").
  assert.ok(anchorsTo(ELECTION_NIGHT.editions.en.blocks, b2("voting", "en")).some((a) => /2026 Spain general election dates and how to vote/.test(a)));
});

/* ------------------------------------------------------------------ 7 */
/* "festividades", "calendario laboral 2027": hub, work calendar and the 2027 Spain page link each other. */

test("7. Work calendar links the 2027 Spain calendar and the daily guide; the 2027 Spain page links the work calendar in its words; the hub lists it", () => {
  const anchor2027 = {
    ca: /calendari laboral 2027 a Espanya per comunitat/,
    es: /calendario laboral 2027 en España por comunidad/,
    en: /Spain public holidays 2027 calendar/,
  };
  for (const locale of LOCALES) {
    assertLinks(workCalendarBody(locale), SPAIN_MAIN[locale], anchor2027[locale], `work calendar ${locale}`);
    const main = mainElsewhere("CT", locale);
    assert.equal(main?.href, GUIDES.workCalendar[locale], `${locale}: the 2027 pages' link to Catalonia is the work calendar`);
    assert.equal(GUIDES.workCalendar[locale], b2("workCalendar", locale), `${locale}: guide table = published article`);
  }
  assert.equal(mainElsewhere("CT", "es")?.anchor, "calendario laboral 2027 de Cataluña");
  assert.equal(mainElsewhere("CT", "ca")?.anchor, "calendari laboral 2027 de Catalunya");
  // Where the anchors are drawn.
  assert.match(read("src/components/programmatic/spain-2027/pages.tsx"), /mainElsewhere\("CT", "es"\)!\.href/);
  assert.match(read("src/components/programmatic/spain-2027/pages-intl.tsx"), /mainElsewhere\("CT", "ca"\)!\.href/);
  // The holiday hubs list the work calendar among their guides (ca/es hub and the English hub).
  for (const file of ["src/components/programmatic/holidays/HubPage.tsx", "src/components/programmatic/holidays/EnglishHubPage.tsx"]) {
    assert.match(read(file), /keys=\{\[[^\]]*"workCalendar"/, file);
  }
});
