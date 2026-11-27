import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { RELATED_LINK_CONTEXTS } from "../src/lib/analytics/events.ts";
import { CANDIDATES } from "../src/lib/content/batch02/candidates.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { GROSSA_DRAW_DATE } from "../src/lib/content/batch02/grossa.ts";
import { NADAL_DRAW_DATE } from "../src/lib/content/batch02/loteria-nadal.ts";
import { REIS_DAY } from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, b2href, type B2Article, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { STRIKE_20N_GUIDE } from "../src/lib/content/batch02/strike-days-1920n.ts";
import { STRIKE_26N_GUIDE } from "../src/lib/content/batch02/strike-days-2326n.ts";
import { STRIKE_EDUCATION_GUIDE } from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES_GUIDE } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_GUIDE } from "../src/lib/content/batch02/strikes-spain.ts";
import { WINTER_SALES } from "../src/lib/content/batch02/winter-sales.ts";
import { MOST_READ } from "../src/lib/content/most-read.ts";
import { HUB_PATHS as SCHOOL_SPAIN_HUB_PATHS } from "../src/lib/content/school-spain/regions.ts";
import {
  CONTINUE_MAX_LINKS,
  CONTINUE_TOPICAL_MAX,
  SEASON,
  continuePaths,
  continueReading,
  isPastEventPage,
  itemPaths,
  seasonalCandidates,
  storedRelated,
  type ContinueReading,
} from "../src/lib/engagement/continue-reading.ts";
import { DECEMBER_BRIDGE_LAST_DAY } from "../src/lib/engagement/next-step.ts";
import { pathOnly } from "../src/lib/engagement/next-step-core.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubPath as electionsHubPath } from "../src/lib/programmatic/elections/paths.ts";
import { DATE_PAGES, datePath } from "../src/lib/programmatic/holidays/paths.ts";
import { hubEditions as spain2027HubEditions } from "../src/lib/programmatic/spain-2027/editions.ts";
import { answerFirstEnabled, answerFirstLayout } from "../src/lib/layout/answer-first.ts";

/**
 * The clearer "Continua llegint" box (27 Nov 2026, batch 8S,
 * lib/engagement/continue-reading.ts): never the page itself, same language,
 * paths the site builds, at most three topical links and one seasonal link,
 * never a path another onward box of the page links, every stored link still
 * on the page, the seasonal switch on the owning modules' dates.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const at = (iso: string) => new Date(iso);
const BEFORE_VOTE = at("2026-11-27T12:00:00+01:00");
const AFTER_COUNT = at("2026-11-30T12:00:00+01:00");

function known(locale: Locale): Set<string> {
  return new Set([
    ...Object.values(B2_PATHS).map((paths) => `/${locale}/${paths[locale]}/`),
    ...DATE_PAGES.map((iso) => datePath(locale, iso)),
    electionsHubPath(locale),
    `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`,
    spain2027HubEditions()[locale],
    ...MOST_READ.items[locale].map((item) => item.path),
  ]);
}
const KNOWN = Object.fromEntries(LOCALES.map((locale) => [locale, known(locale)])) as Record<Locale, Set<string>>;

const ARTICLES: B2Article[] = [STRIKE_26N_GUIDE, STRIKE_20N_GUIDE, STRIKES_SPAIN_GUIDE, STRIKE_EDUCATION_GUIDE, STRIKES_GUIDE, CANDIDATES, ELECTION_NIGHT, DECEMBER_BRIDGE, SHOPS];
const DAYS = ["2026-11-27", "2026-11-30", "2026-12-08", "2026-12-09", "2026-12-22", "2026-12-23", "2026-12-31", "2027-01-01", "2027-01-06", "2027-01-08", "2027-03-01"];

function storedFor(article: B2Article, locale: Locale) {
  const body = answerFirstEnabled(article.entryKey) ? answerFirstLayout(article.editions[locale].blocks, locale).body : article.editions[locale].blocks;
  return storedRelated(body, locale);
}

function assertBox(box: ContinueReading | null, locale: Locale, self: string, exclude: readonly string[], stored: readonly string[], what: string) {
  assert.ok(box, `${what}: no box`);
  assert.ok(box.topical.length <= CONTINUE_TOPICAL_MAX, `${what}: ${box.topical.length} topical`);
  const boxed = [...box.topical.map((l) => pathOnly(l.href)), ...(box.seasonal ? [pathOnly(box.seasonal.href)] : [])];
  assert.ok(boxed.length >= 1 && boxed.length <= CONTINUE_MAX_LINKS, `${what}: ${boxed.length} links`);
  assert.equal(new Set(boxed).size, boxed.length, `${what}: a link twice in the box`);
  for (const path of boxed) {
    assert.notEqual(path, pathOnly(self), `${what}: links itself`);
    assert.ok(path.startsWith(`/${locale}/`), `${what}: ${path} is not in ${locale}`);
    assert.ok(KNOWN[locale].has(path), `${what}: ${path} is not a page the site builds`);
    assert.ok(!exclude.map(pathOnly).includes(path), `${what}: ${path} is already in another box`);
  }
  for (const link of [...box.topical, ...(box.seasonal ? [box.seasonal] : [])]) assert.doesNotMatch(link.label, /undefined|null|NaN|^\s*$/, what);
  // Every stored link stays on the page: in the box, in the rest, or in another box.
  const onPage = new Set([...continuePaths(box), ...exclude.map(pathOnly), pathOnly(self)]);
  for (const item of stored) for (const path of itemPaths(item)) assert.ok(onPage.has(path), `${what}: stored link ${path} left the page`);
}

test("every top landing page, every language, every day of the season: the box keeps its rules", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const related = storedFor(article, locale);
      assert.ok(related, `${article.key}/${locale}: stored "Continua llegint" list`);
      const self = `/${locale}/${article.editions[locale].path}/`;
      for (const today of DAYS) {
        for (const now of [BEFORE_VOTE, AFTER_COUNT]) {
          const exclude = [b2href("strikesSpain", locale), `${b2href("voting", locale)}#x`];
          const mostRead = MOST_READ.items[locale].map((item) => ({ href: item.path, label: item.title }));
          const box = continueReading({ entry: { href: self, key: article.entryKey, locale }, stored: related.items, exclude, mostRead, today, now });
          assertBox(box, locale, self, exclude, related.items, `${article.key}/${locale}/${today}`);
        }
      }
    }
  }
});

test("seasonal switch: the bridge to 8 Dec, the Christmas lottery to 22 Dec, New Year to 31 Dec, Reis to 6 Jan, then the sales and the 2027 long weekends", () => {
  const first = (scope: "catalonia" | "spain", day: string) => pathOnly(seasonalCandidates(scope, "es", day)[0]!.href);
  assert.equal(DECEMBER_BRIDGE_LAST_DAY, "2026-12-08");
  assert.equal(first("catalonia", "2026-11-27"), b2href("decemberBridge", "es"));
  assert.equal(first("catalonia", DECEMBER_BRIDGE_LAST_DAY), b2href("decemberBridge", "es"));
  assert.equal(first("catalonia", "2026-12-09"), b2href("loteriaNadal", "es"));
  assert.equal(first("catalonia", NADAL_DRAW_DATE), b2href("loteriaNadal", "es"));
  assert.equal(first("catalonia", "2026-12-23"), b2href("newYear", "es"));
  assert.equal(first("catalonia", GROSSA_DRAW_DATE), b2href("newYear", "es"));
  assert.equal(first("catalonia", "2027-01-01"), b2href("reis", "es"));
  assert.equal(first("catalonia", REIS_DAY), b2href("reis", "es"));
  assert.equal(pathOnly(seasonalCandidates("catalonia", "es", REIS_DAY)[1]!.href), b2href("winterSales", "es"));
  assert.ok(WINTER_SALES.firstSunday <= REIS_DAY, "the sales guide's first Sunday falls in the Reis window");
  assert.equal(first("catalonia", "2027-01-07"), b2href("bridges2027", "es"));
  assert.equal(first("catalonia", "2027-03-01"), b2href("bridges2027", "es"));
  assert.equal(first("spain", "2026-11-27"), b2href("decemberBridgeSpain", "es"));
  assert.equal(first("spain", "2026-12-09"), b2href("loteriaNadal", "es"));
  assert.equal(first("spain", "2027-03-01"), spain2027HubEditions().es);
  // The windows run in date order and every candidate is a page in its language.
  for (let i = 1; i < SEASON.length; i += 1) assert.ok(SEASON[i - 1]!.until <= SEASON[i]!.until, `window ${i} out of order`);
  for (const locale of LOCALES) {
    for (const day of DAYS) {
      for (const scope of ["catalonia", "spain"] as const) {
        for (const link of seasonalCandidates(scope, locale, day)) assert.ok(KNOWN[locale].has(pathOnly(link.href)), `${scope}/${locale}/${day}: ${link.href}`);
      }
    }
  }
});

test("the December bridge guide offers the 7 and 8 December pages and the Christmas calendar before the bridge, never itself", () => {
  for (const locale of LOCALES) {
    const related = storedFor(DECEMBER_BRIDGE, locale)!;
    const self = b2href("decemberBridge", locale);
    const box = continueReading({ entry: { href: self, key: DECEMBER_BRIDGE.entryKey, locale }, stored: related.items, exclude: [], today: "2026-11-27", now: BEFORE_VOTE })!;
    const paths = box.topical.map((l) => pathOnly(l.href));
    assert.equal(paths[0], datePath(locale, "2026-12-07"), locale);
    assert.ok(paths.includes(b2href("shops", locale)), `${locale}: shops`);
    assert.equal(pathOnly(box.seasonal!.href), b2href("christmas", locale), `${locale}: the Christmas calendar hub as the seasonal link`);
    // After the bridge: no date page of the bridge.
    const later = continueReading({ entry: { href: self, key: DECEMBER_BRIDGE.entryKey, locale }, stored: related.items, exclude: [], today: "2026-12-09", now: AFTER_COUNT })!;
    assert.ok(!continuePaths(later).slice(0, CONTINUE_MAX_LINKS).includes(datePath(locale, "2026-12-07")), `${locale}: 7 Dec after the bridge`);
  }
});

test("election guides: where to vote before the polls close, the results after; strike pages never offer a past strike day", () => {
  for (const locale of LOCALES) {
    const related = storedFor(CANDIDATES, locale)!;
    const self = b2href("candidates", locale);
    const before = continueReading({ entry: { href: self, key: CANDIDATES.entryKey, locale }, stored: related.items, exclude: [], today: "2026-11-27", now: BEFORE_VOTE })!;
    assert.ok(before.topical[0]!.href.startsWith(`${b2href("voting", locale)}#`), `${locale}: ${before.topical[0]!.href}`);
    const after = continueReading({ entry: { href: self, key: CANDIDATES.entryKey, locale }, stored: related.items, exclude: [], today: "2026-11-30", now: AFTER_COUNT })!;
    assert.equal(pathOnly(after.topical[0]!.href), electionsHubPath(locale));

    const strike = storedFor(STRIKE_26N_GUIDE, locale)!;
    const box = continueReading({
      entry: { href: b2href("strike26n", locale), key: STRIKE_26N_GUIDE.entryKey, locale },
      stored: strike.items,
      exclude: [],
      mostRead: MOST_READ.items[locale].map((item) => ({ href: item.path, label: item.title })),
      today: "2026-11-27",
      now: BEFORE_VOTE,
    })!;
    for (const link of box.topical) assert.ok(!isPastEventPage(link.href, "2026-11-27"), `${locale}: past page ${link.href}`);
  }
  assert.equal(isPastEventPage(b2href("strike26n", "es"), "2026-11-26"), false, "the strike day itself is not past");
  assert.equal(isPastEventPage(b2href("strike26n", "es"), "2026-11-27"), true);
  assert.equal(isPastEventPage(b2href("strike11n", "ca"), "2026-11-27"), true);
  assert.equal(isPastEventPage(b2href("postalVote", "en"), "2026-11-27"), true);
  assert.equal(isPastEventPage(b2href("decemberBridge", "es"), "2026-11-27"), false);
});

test("exclude, self and language: nothing another box links, never the page, never another language", () => {
  const keys = Object.keys(B2_PATHS) as B2Key[];
  for (const locale of LOCALES) {
    for (const key of keys) {
      const self = b2href(key, locale);
      const other = LOCALES.find((l) => l !== locale)!;
      const stored = [`[x](${b2href("shops", other)})`, `[self](${self})`, `[y](${b2href("holidayToday", locale)}): gloss.`];
      const exclude = [b2href("holidayToday", locale)];
      const box = continueReading({ entry: { href: self, locale }, stored, exclude, today: "2026-11-27", now: BEFORE_VOTE });
      if (!box) continue;
      for (const path of continuePaths(box).slice(0, box.topical.length + (box.seasonal ? 1 : 0))) {
        assert.notEqual(path, pathOnly(self), `${key}/${locale}`);
        assert.ok(path.startsWith(`/${locale}/`), `${key}/${locale}: ${path}`);
        assert.notEqual(path, b2href("holidayToday", locale), `${key}/${locale}: excluded path`);
      }
    }
  }
});

test("the template renders it in the place of the stored list, server-side, and a click is related_content_click", () => {
  const entry = read("src/components/pages/EntryArticle.tsx");
  assert.match(entry, /storedRelated\(body, locale\)/);
  assert.match(entry, /replace: true, node: <ContinueReading /);
  assert.match(entry, /insert=\{\[bodyInsert, onwardInsert\]\}/);
  // The foot "next useful step" box never repeats the "keep it" block or the election line.
  assert.match(entry, /withoutPaths\(step, \[\.\.\.ret\.links/);
  const component = read("src/components/ContinueReading.tsx");
  assert.doesNotMatch(component, /"use client"/);
  assert.match(component, /data-ci-placement="continue_reading"/);
  assert.match(component, /data-ci-placement="seasonal_next"/);
  for (const context of ["continue_reading", "seasonal_next"] as const) {
    assert.ok(RELATED_LINK_CONTEXTS.includes(context));
    assert.deepEqual(
      classifyLinkClick({ href: "https://www.catalunyainfo.com/es/guias/loteria-de-navidad/", siteHost: "www.catalunyainfo.com", locale: "es", channelUrl: "https://whatsapp.com/channel/x", inSources: false, inCalculator: false, placement: context }),
      { name: "related_content_click", params: { link_context: context, link_url: "/es/guias/loteria-de-navidad/", locale: "es" } },
    );
  }
  assert.match(read("docs/ANALYTICS.md"), /continue_reading/);
  assert.match(read("docs/ANALYTICS.md"), /seasonal_next/);
});
