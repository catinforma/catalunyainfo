import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { RELATED_LINK_CONTEXTS } from "../src/lib/analytics/events.ts";
import { HOME_CALCULATORS, HOME_CALCULATOR_LABEL, homeCalculatorLinks } from "../src/lib/content/home-tools.ts";
import { b2href, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { CALCULATORS, EXTRA_PAY_LINE_UNTIL, GUIDE_LINES, LINK_LABEL, calculatorLineFor, dateCalculatorLine, entryCalculatorLine } from "../src/lib/engagement/calculator-line.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { hubCards } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, CALCULATOR_IDS, CALC_LOCALES, calcPath, calculatorSlugs, type CalculatorId } from "../src/lib/programmatic/calculators/paths.ts";
import {
  CALCULATOR_TOPICS,
  HUB_QUESTIONS,
  HUB_QUESTION_COUNT,
  PINNED,
  POPULARITY,
  RANKING_REREAD_BY,
  RELATED_MAX,
  RELATED_MIN,
  byPopularity,
  hubQuestions,
  relatedCalculators,
  relatedKeys,
} from "../src/lib/programmatic/calculators/related.ts";

/**
 * The calculators' cross-linking layer (26 Nov 2026, batch 6C): the "related
 * calculators" block on every calculator page (calculators/related.ts,
 * MoreCalculators.tsx), the hub's most-searched questions, the one-line
 * calculator link on guides and date pages (engagement/calculator-line.ts)
 * and the homepage's most-used calculators line (content/home-tools.ts).
 * REREAD_BY 2026-12-24 (RANKING_REREAD_BY): re-read the popularity order.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const nextKeys = (id: CalculatorId): readonly string[] => (id === "lottery-tax" ? [] : (CALCULATOR_NEXT[id] ?? []));

/** A calculator path of this locale with its route file. */
function calculatorRouteExists(href: string, locale: (typeof CALC_LOCALES)[number]): boolean {
  const id = CALCULATOR_IDS.find((c) => calcPath(c, locale) === href);
  return id !== undefined && existsSync(join(APP, CALCULATORS_ROOT[locale], calculatorSlugs(id)[locale], "page.tsx"));
}

test("date guard: re-read the calculators' popularity order (snapshot.py pages 28 6000) by RANKING_REREAD_BY", () => {
  assert.ok(
    todayInCatalonia() < RANKING_REREAD_BY,
    "Re-read GSC (`snapshot.py pages 28 6000`), update POPULARITY in calculators/related.ts and HOME_CALCULATORS in content/home-tools.ts, then move RANKING_REREAD_BY four weeks on.",
  );
});

test("popularity: every calculator exactly once; topics for every calculator", () => {
  assert.deepEqual([...POPULARITY].sort(), [...CALCULATOR_IDS].sort());
  assert.equal(new Set(POPULARITY).size, POPULARITY.length);
  for (const id of CALCULATOR_IDS) assert.ok(CALCULATOR_TOPICS[id]?.[0], id);
  assert.deepEqual(byPopularity(["ipc", "lottery-tax", "pay-dates", "mortgage"]), ["lottery-tax", "ipc", "mortgage", "pay-dates"]);
});

test("related: every calculator gets 3 or 4 links in each language, never itself, same locale, trailing slash, existing pages, no repeats", () => {
  const hrefs = new Set(hubCards().flatMap((card) => CALC_LOCALES.map((l) => card.href[l])));
  for (const id of CALCULATOR_IDS) {
    for (const locale of CALC_LOCALES) {
      const links = relatedCalculators(id, locale, nextKeys(id));
      assert.ok(links.length >= RELATED_MIN && links.length <= RELATED_MAX, `${id} ${locale}: ${links.length}`);
      assert.equal(new Set(links.map((l) => l.href)).size, links.length, `${id} ${locale}: a link twice`);
      for (const link of links) {
        assert.notEqual(link.href, calcPath(id, locale), `${id} ${locale}: links itself`);
        assert.ok(link.href.startsWith(`/${locale}/`), `${id} ${locale}: ${link.href} is not in the page's language`);
        assert.ok(link.href.endsWith("/"), `${id} ${locale}: ${link.href} has no trailing slash`);
        assert.ok(hrefs.has(link.href), `${id} ${locale}: ${link.href} is no hub card`);
        if (CALCULATOR_IDS.includes(link.key as CalculatorId)) assert.ok(calculatorRouteExists(link.href, locale), `${id} ${locale}: no route for ${link.href}`);
        assert.ok(link.label.length > 0 && link.note.length > 0, `${id} ${locale}: empty words`);
      }
    }
  }
});

test("related: the next-step box's links come back only when the topic leaves fewer than three others", () => {
  for (const id of CALCULATOR_IDS) {
    const avoid = nextKeys(id);
    const keys = relatedKeys(id, "es", avoid);
    if (keys.some((key) => avoid.includes(key))) assert.equal(keys.length, RELATED_MIN, `${id}: ${keys.join(", ")}`);
  }
});

test("related: topic picks that matter (same region first, pins first, the dole gets the dismissal)", () => {
  assert.deepEqual(relatedKeys("inheritance-tax-madrid", "es", nextKeys("inheritance-tax-madrid")).slice(0, 2), ["inheritance-tax-by-region", "gift-tax-madrid"]);
  assert.deepEqual(relatedKeys("gift-tax-catalonia", "ca", nextKeys("gift-tax-catalonia")).slice(0, 2), ["inheritance-tax-by-region", "inheritance-tax"]);
  assert.ok(relatedKeys("unemployment", "es", nextKeys("unemployment")).includes("dismissal"));
  assert.deepEqual(relatedKeys("lottery-tax", "es").slice(0, 2), ["extra-pay", "treasury-bills"]);
  assert.ok(relatedKeys("itv", "en", nextKeys("itv")).includes("working-days"));
  for (const [id, pins] of Object.entries(PINNED)) for (const pin of pins) assert.ok(hubCards().some((c) => c.key === pin), `${id}: pin ${pin} has no hub card`);
});

test("related: rendered in MoreCalculators (on every calculator page) with its own placement, no repeat in the full list", () => {
  const block = read("src/components/programmatic/calculators/MoreCalculators.tsx");
  assert.match(block, /data-ci-placement="related_calculators"/);
  assert.match(block, /<RelatedCalculators current=\{current\} locale=\{locale\} \/>/);
  assert.match(block, /\.filter\(\(id\) => !related\.has\(id\)\)/);
  assert.doesNotMatch(block, /^"use client"/);
});

test("analytics: the three new boxes are related_content_click with their link_context", () => {
  for (const placement of ["related_calculators", "calculator_line", "home_calculators"] as const) {
    assert.ok(RELATED_LINK_CONTEXTS.includes(placement), placement);
    assert.deepEqual(
      classifyLinkClick({
        href: "https://www.catalunyainfo.com/es/calculadoras/paro/?x=1#a",
        siteHost: "www.catalunyainfo.com",
        locale: "es",
        channelUrl: "https://whatsapp.com/channel/x",
        inSources: false,
        inCalculator: false,
        placement,
      }),
      { name: "related_content_click", params: { link_context: placement, link_url: "/es/calculadoras/paro/", locale: "es" } },
    );
  }
  const docs = read("docs/ANALYTICS.md");
  for (const placement of ["related_calculators", "calculator_line", "home_calculators"]) assert.match(docs, new RegExp(`\`${placement}\``), placement);
});

test("hub: the ten most-searched questions first, each a link to its tool in the hub's language", () => {
  for (const locale of CALC_LOCALES) {
    const qs = hubQuestions(locale);
    assert.equal(qs.length, HUB_QUESTION_COUNT);
    assert.deepEqual(
      qs.map((q) => q.id),
      POPULARITY.filter((id) => HUB_QUESTIONS[id]).slice(0, HUB_QUESTION_COUNT),
    );
    for (const q of qs) {
      assert.ok(calculatorRouteExists(q.href, locale), `${locale}: ${q.href}`);
      assert.match(q.question, locale === "en" ? /\?$/ : /\?$/, q.question);
      if (locale === "es") assert.match(q.question, /^¿/, q.question);
    }
  }
  const hub = read("src/components/programmatic/calculators/CalculatorsHub.tsx");
  assert.match(hub, /hubQuestions\(locale\)/);
  assert.match(hub, /byPopularity\(group\.cards\.map/);
});

test("calculator line: the guides that carry it, the strike pages that do not", () => {
  for (const locale of CALC_LOCALES) {
    const vote = entryCalculatorLine({ href: b2href("voting", locale), locale, body: [] }, null, "2026-11-27");
    assert.ok(vote);
    assert.equal(vote.links[0]!.href, calcPath("paid-leave", locale));
    assert.match(vote.text, /37\.3\.d/);
    const bridge = entryCalculatorLine({ href: b2href("decemberBridge", locale), locale, body: [] }, null, "2026-11-27");
    assert.equal(bridge?.links[0]!.href, calcPath("working-days", locale));
    for (const strike of ["strikes", "strike26n", "strikesSpain", "strikeRenfe"] as B2Key[]) {
      assert.equal(entryCalculatorLine({ href: b2href(strike, locale), locale, body: [] }, null, "2026-11-27"), null, strike);
    }
  }
});

test("calculator line: never a calculator the body or the next-step box already links; the extra pay line ends with the year", () => {
  const path = calcPath("working-days", "es");
  assert.equal(calculatorLineFor("deadline", "es", { body: [{ type: "paragraph", text: `[x](${path}?lugar=barcelona)` }], today: "2026-11-27" }), null);
  assert.equal(calculatorLineFor("deadline", "es", { step: { family: "holidays", links: [{ href: path, label: "x" }] }, today: "2026-11-27" }), null);
  const payDates = calculatorLineFor("payDates", "es", { body: [{ type: "paragraph", text: `[x](${calcPath("unemployment", "es")})` }], today: "2026-11-27" });
  assert.deepEqual(payDates?.links.map((l) => l.href), [calcPath("pensions-2027", "es")]);
  assert.ok(calculatorLineFor("christmas", "ca", { today: EXTRA_PAY_LINE_UNTIL }));
  assert.equal(calculatorLineFor("christmas", "ca", { today: "2027-01-01" }), null);
  assert.equal(dateCalculatorLine("en", null, "2026-11-27")?.links[0]!.href, calcPath("working-days", "en"));
});

test("calculator line: every guide key resolves, every link is a calculator route in the page's language, rendered by both templates", () => {
  for (const key of Object.keys(GUIDE_LINES) as B2Key[]) for (const locale of CALC_LOCALES) assert.ok(b2href(key, locale).startsWith(`/${locale}/`), key);
  for (const ids of Object.values(CALCULATORS)) {
    for (const id of ids) {
      for (const locale of CALC_LOCALES) {
        assert.ok(calculatorRouteExists(calcPath(id, locale), locale), `${id} ${locale}`);
        assert.ok(LINK_LABEL[id][locale].length > 0, `${id} ${locale}`);
      }
    }
  }
  assert.match(read("src/components/pages/EntryArticle.tsx"), /<CalculatorLine line=\{calculatorLine\}/);
  assert.match(read("src/components/programmatic/holidays/DatePage.tsx"), /<CalculatorLine line=\{dateCalculatorLine\(locale, step, todayInCatalonia\(\)\)\}/);
  assert.match(read("src/components/CalculatorLine.tsx"), /data-ci-placement="calculator_line"/);
});

test("homepage: five calculators per edition, each with its route, then the hub, rendered under the search", () => {
  for (const locale of CALC_LOCALES) {
    assert.equal(HOME_CALCULATORS[locale].length, 5, locale);
    for (const link of homeCalculatorLinks(locale)) assert.ok(calculatorRouteExists(link.href, locale), `${locale}: ${link.href}`);
  }
  for (const labels of Object.values(HOME_CALCULATOR_LABEL)) for (const locale of CALC_LOCALES) assert.ok(labels[locale].length > 0);
  assert.match(read("src/components/HomeTools.tsx"), /data-ci-placement="home_calculators"/);
  assert.match(read("src/app/(public)/[locale]/page.tsx"), /<SearchBox locale=\{locale\} size="hero" \/>\s*<\/div>\s*\{\/\*[^*]*\*\/\}\s*<HomeCalculators locale=\{locale\} \/>/);
});
