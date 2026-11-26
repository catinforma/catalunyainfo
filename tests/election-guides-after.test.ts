import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, bodySchema, parseBody, tableOfContents, type Body } from "../src/lib/content/blocks.ts";
import { CONGRESS_RESULTS } from "../src/lib/content/batch02/election-results.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { NIGHT_AFTER, resultsAfterLine } from "../src/lib/content/batch02/election-after.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { PHASE_DEPENDENT_BLOCKS, DAY_DEPENDENT_PATTERN, PHASE_DEPENDENT_PATTERN, REVALIDATE_NIGHTLY_PATTERN } from "../src/lib/content/day-dependent.ts";
import { electionVariant, guidePhaseStart, resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { faqSchema } from "../src/lib/seo/jsonld.ts";
import { contentLastModified } from "../src/lib/seo/body-dates.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { electionPhase } from "../src/lib/programmatic/elections/election-day.ts";
import { INFOELECTORAL, OFFICIAL_ELECTION_SITE } from "../src/lib/programmatic/elections/results-night.ts";

/**
 * The 29N guides after the vote (24 Nov 2026, docs/SEO_EXPERIMENTS.md, "26 Nov
 * 2026 — 29N guides after the vote"): the election-night guide, the Congress
 * results guide and the how-to-vote guide wrap what changes in `electionPhased`
 * blocks; the page resolves them with the render time, so Mon 30 Nov reads in
 * the past with nobody editing anything, and Tue 8 Dec reads as the law's
 * schedule that has run its course.
 */

const NIGHT_BEFORE = new Date("2026-11-29T22:59:00Z"); // 23:59 Madrid, Sun 29 Nov
const MON_30_START = new Date("2026-11-29T23:00:00Z"); // 00:00 Madrid, Mon 30 Nov
const OVER_START = new Date("2026-12-07T23:00:00Z"); // 00:00 Madrid, Tue 8 Dec
const JUST_BEFORE_OVER = new Date("2026-12-07T22:59:00Z");

const GUIDES = { "election-night": ELECTION_NIGHT, "election-results": CONGRESS_RESULTS, voting: VOTING } as const;

function edition(key: keyof typeof GUIDES, locale: Locale): Body {
  return parseBody(GUIDES[key].editions[locale].blocks);
}
const text = (body: Body) => bodyToPlainText(body);
const json = (body: Body) => JSON.stringify(body);

/** What each language's guides said while the vote was ahead and must not say once it is past. */
const STALE: Record<Locale, RegExp> = {
  ca: /encara no (ho )?ha (fet|anunciat)|anunciï|pendent d'anunci|apareixeran|Per al 29N encara|properes eleccions són les generals/i,
  es: /todavía no (lo )?ha|aún no ha|anuncie|pendiente de anuncio|aparecerán|Para el 29N todavía/i,
  en: /has not (yet )?announced|not yet announced|pending announcement|when it announces|will appear here/i,
};

test("the phase switches at 00:00 Madrid on 30 Nov and 8 Dec, to the second", () => {
  assert.equal(electionPhase(NIGHT_BEFORE), "count");
  assert.equal(electionVariant(electionPhase(NIGHT_BEFORE)), "pre");
  assert.equal(electionVariant(electionPhase(MON_30_START)), "after");
  assert.equal(electionVariant(electionPhase(JUST_BEFORE_OVER)), "after");
  assert.equal(electionVariant(electionPhase(OVER_START)), "over");
  assert.equal(electionVariant(electionPhase(new Date("2026-11-20T10:00:00Z"))), "pre");
  assert.equal(electionVariant(electionPhase(new Date("2026-11-29T10:00:00Z"))), "pre", "polling morning");
});

test("the three guides carry electionPhased blocks in every language, and every variant is a valid body", () => {
  for (const key of Object.keys(GUIDES) as (keyof typeof GUIDES)[]) {
    for (const locale of LOCALES) {
      const body = edition(key, locale);
      const blocks = body.filter((b) => b.type === "electionPhased");
      assert.ok(blocks.length >= 2, `${key}/${locale}: phased stretches`);
      assert.ok(bodySchema.safeParse(body).success, `${key}/${locale}: stored body parses`);
      for (const block of blocks) {
        assert.equal(block.type, "electionPhased");
        if (block.type !== "electionPhased") continue;
        for (const variant of [block.pre, block.after, block.over ?? []]) {
          assert.equal(parseBody(variant).length, variant.length, `${key}/${locale}: every variant block is valid`);
        }
      }
    }
  }
  assert.deepEqual(PHASE_DEPENDENT_BLOCKS, ["electionPhased"]);
});

test("until 23:59 on 29 Nov each guide reads exactly as it did before (the pre text), with no phased block left", () => {
  for (const key of Object.keys(GUIDES) as (keyof typeof GUIDES)[]) {
    for (const locale of LOCALES) {
      const stored = edition(key, locale);
      const resolved = resolveElectionPhased(stored, NIGHT_BEFORE);
      assert.ok(!resolved.some((b) => b.type === "electionPhased"), `${key}/${locale}`);
      // The reading before the vote is the stored pre variants in place; from Thu 26 Nov 14:00 a block with a `handin` variant reads that one.
      const expected = stored.flatMap((b) => (b.type === "electionPhased" ? parseBody(b.pre) : [b]));
      const expectedHandin = stored.flatMap((b) => (b.type === "electionPhased" ? parseBody(b.handin ?? b.pre) : [b]));
      assert.deepEqual(resolved, expectedHandin, `${key}/${locale}: pre (handin variant where there is one)`);
      assert.deepEqual(resolveElectionPhased(stored, new Date("2026-11-24T10:00:00Z")), expected, `${key}/${locale}: 24 Nov`);
      assert.deepEqual(resolveElectionPhased(stored, new Date("2026-11-26T12:59:59Z")), expected, `${key}/${locale}: 26 Nov 13:59`);
      assert.deepEqual(resolveElectionPhased(stored, new Date("2026-11-26T13:00:00Z")), expectedHandin, `${key}/${locale}: 26 Nov 14:00`);
    }
  }
  // The election-night guide still says what it said: the pending results site and the announcement promise.
  assert.match(text(resolveElectionPhased(edition("election-night", "en"), NIGHT_BEFORE)), STALE.en);
});

test("from 00:00 on 30 Nov and from 00:00 on 8 Dec nothing promises a future that has passed", () => {
  for (const key of Object.keys(GUIDES) as (keyof typeof GUIDES)[]) {
    for (const locale of LOCALES) {
      for (const [label, at] of [["30 Nov", MON_30_START], ["3 Dec", new Date("2026-12-03T12:00:00Z")], ["8 Dec", OVER_START], ["20 Dec", new Date("2026-12-20T12:00:00Z")]] as const) {
        const body = resolveElectionPhased(edition(key, locale), at);
        assert.ok(!body.some((b) => b.type === "electionPhased"), `${key}/${locale}/${label}`);
        const printed = text(body) + " " + json(body.filter((b) => b.type === "faq"));
        assert.doesNotMatch(printed, STALE[locale], `${key}/${locale}/${label}: ${printed.match(STALE[locale])?.[0]}`);
      }
    }
  }
});

test("the election-night guide after the vote: provisional (art. 98.2), the law's schedule, proclamation, BOE within forty days", () => {
  for (const locale of LOCALES) {
    const after = resolveElectionPhased(edition("election-night", locale), MON_30_START);
    const over = resolveElectionPhased(edition("election-night", locale), OVER_START);
    for (const [label, body] of [["after", after], ["over", over]] as const) {
      const printed = json(body);
      assert.match(printed, /anoventayocho/, `${locale}/${label}: art. 98.2 linked`);
      assert.match(printed, /acientotres/, `${locale}/${label}: art. 103 linked`);
      assert.match(printed, /acientosiete/, `${locale}/${label}: art. 107 linked`);
      assert.match(printed, /acientoocho/, `${locale}/${label}: art. 108 linked`);
      assert.match(text(body), /BOE/, `${locale}/${label}`);
    }
    const status = (b: Body) => {
      const callout = b.find((x) => x.type === "callout" && /29/.test(x.title ?? ""));
      assert.ok(callout && callout.type === "callout", `${locale}: status callout`);
      return callout.text;
    };
    const re = {
      ca: { after: /comença el 4 de desembre/, over: /havia de començar el 4 de desembre/, forty: /quaranta dies/ },
      es: { after: /empieza el 4 de diciembre/, over: /debía empezar el 4 de diciembre/, forty: /cuarenta días/ },
      en: { after: /schedules to begin on 4 December/, over: /scheduled to begin on 4 December/, forty: /within forty days/ },
    }[locale];
    assert.match(status(after), re.after, `${locale}: 30 Nov-7 Dec states the schedule as the law's`);
    assert.match(status(over), re.over, `${locale}: from 8 Dec it is past, still the law's schedule`);
    assert.match(status(after), re.forty);
    assert.match(status(over), re.forty);
    assert.doesNotMatch(status(over), re.after, `${locale}: the 8 Dec wording is not the 30 Nov one`);
    // No figures, no polls, no party: the added wording carries no percentage or thousands separator.
    assert.doesNotMatch(NIGHT_AFTER[locale].status("after", null), /%|\d{1,3}[.,]\d{3}/);
  }
});

test("official links are named for what they are: the election site and the data portal, never 'results' unless a results site is set", () => {
  const link = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const locale of LOCALES) {
    const printedByPhase = [MON_30_START, OVER_START].map((at) => ["election-night", "election-results"].map((key) => json(resolveElectionPhased(edition(key as keyof typeof GUIDES, locale), at))).join(" "));
    for (const printed of printedByPhase) {
      let found = 0;
      for (const m of NIGHT_AFTER[locale].status("after", null).matchAll(link)) {
        if (m[2] === OFFICIAL_ELECTION_SITE || m[2] === INFOELECTORAL) {
          found += 1;
          assert.doesNotMatch(m[1] ?? "", /result/i, `${locale}: "${m[1]}" is not a results site`);
        }
      }
      assert.equal(found, 2, `${locale}: election site and Infoelectoral`);
      assert.match(printed, new RegExp(OFFICIAL_ELECTION_SITE.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")));
    }
    // With a results site set, the line says so with that link and its own words.
    const withSite = NIGHT_AFTER[locale].status("after", "https://resultados.example.gob.es/");
    assert.match(withSite, /\(https:\/\/resultados\.example\.gob\.es\/\)/);
    assert.match(resultsAfterLine(locale, "after", "https://resultados.example.gob.es/", ""), /resultados\.example\.gob\.es/);
    assert.doesNotMatch(NIGHT_AFTER[locale].status("after", null), /resultados\.example/);
  }
});

test("the FAQ structured data follows the phase", () => {
  for (const locale of LOCALES) {
    for (const key of ["election-night", "voting"] as const) {
      const pre = faqSchema(resolveElectionPhased(edition(key, locale), NIGHT_BEFORE)) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      const after = faqSchema(resolveElectionPhased(edition(key, locale), MON_30_START)) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      assert.ok(pre && after, `${key}/${locale}: FAQ present both sides`);
      const preAnswers = pre.mainEntity.map((q) => q.acceptedAnswer.text).join(" ");
      const afterAnswers = after.mainEntity.map((q) => q.acceptedAnswer.text).join(" ");
      assert.notEqual(preAnswers, afterAnswers, `${key}/${locale}: answers change`);
      assert.doesNotMatch(afterAnswers, STALE[locale]);
    }
  }
  // Voting: the after FAQ drops the what-to-do questions and keeps the evergreen ones, in every language.
  const counts = LOCALES.map((l) => (faqSchema(resolveElectionPhased(edition("voting", l), MON_30_START)) as { mainEntity: unknown[] }).mainEntity.length);
  assert.deepEqual(counts, [7, 7, 9]);
});

test("the how-to-vote guide after the vote: the what-to-do sections are gone, the municipal elections are next, the table of contents follows", () => {
  for (const locale of LOCALES) {
    const before = tableOfContents(resolveElectionPhased(edition("voting", locale), NIGHT_BEFORE));
    const after = tableOfContents(resolveElectionPhased(edition("voting", locale), MON_30_START));
    const dropped = before.filter((h) => !after.some((a) => a.text === h.text));
    // Where do I vote, hours and ID, paid time off, postal vote, overseas vote, plus the "next elections" heading that is reworded.
    assert.ok(dropped.length >= 5, `${locale}: ${dropped.map((h) => h.text).join(" | ")}`);
    assert.ok(after.length >= 6, `${locale}: still a structured page (${before.length} -> ${after.length})`);
    const printed = text(resolveElectionPhased(edition("voting", locale), MON_30_START));
    assert.match(printed, /2027/, `${locale}: looks to May 2027`);
    assert.doesNotMatch(printed, /26 de novembre, com a molt|26 de noviembre, como mucho|by Thursday 26 November/i, `${locale}: no hand-in instruction`);
  }
});

test("the Congress-results guide: the 29N paragraph is past tense, the 'next one' section is the 29 Nov election", () => {
  for (const locale of LOCALES) {
    const pre = text(resolveElectionPhased(edition("election-results", locale), NIGHT_BEFORE));
    const after = text(resolveElectionPhased(edition("election-results", locale), MON_30_START));
    assert.notEqual(pre, after);
    assert.match(after, /98\.2/);
    const next = { ca: /Les eleccions generals del 29 de novembre de 2026/, es: /Las elecciones generales del 29 de noviembre de 2026/, en: /The 29 November 2026 general election/ }[locale];
    assert.match(after, next);
    assert.doesNotMatch(after, /Les properes: 29|Las próximas: 29|The next one: 29/);
    assert.match(pre, /Les properes: 29|Las próximas: 29|The next one: 29/);
  }
});

test("search text reads the page as it is until polling day", () => {
  for (const locale of LOCALES) {
    const stored = edition("election-night", locale);
    assert.equal(bodyToPlainText(stored), bodyToPlainText(resolveElectionPhased(stored, NIGHT_BEFORE)));
  }
});

test("the nightly cron re-renders pages with the block, and the sitemap dates them at the phase start, not every night", () => {
  const stored = JSON.stringify(edition("voting", "en"));
  const jsonbText = stored.replace(/"type":"/g, '"type": "');
  assert.match(jsonbText, new RegExp(REVALIDATE_NIGHTLY_PATTERN));
  assert.match(jsonbText, new RegExp(PHASE_DEPENDENT_PATTERN));
  assert.doesNotMatch(jsonbText, new RegExp(DAY_DEPENDENT_PATTERN), "not 'changes daily' in the sitemap");

  const today = new Date("2026-12-02T23:00:00Z");
  const row = { updatedAt: new Date("2026-11-03T10:00:00Z"), contentChangedAt: new Date("2026-11-26T10:00:00Z"), dayDependent: false, dataBlocks: [] };
  const start = guidePhaseStart(new Date("2026-12-02T12:00:00Z"));
  assert.equal(start?.toISOString(), "2026-11-29T23:00:00.000Z");
  assert.equal(contentLastModified({ ...row, phaseStart: start }, today).toISOString(), "2026-11-29T23:00:00.000Z", "30 Nov 00:00 Madrid");
  assert.equal(contentLastModified({ ...row, phaseStart: null }, today).toISOString(), "2026-11-26T10:00:00.000Z", "before the phase it is the last publish");
  assert.equal(guidePhaseStart(new Date("2026-12-09T12:00:00Z"))?.toISOString(), "2026-12-07T23:00:00.000Z", "8 Dec");
  // The election-day layer's earlier phases change nothing on these pages: no lastmod from them.
  for (const iso of ["2026-11-24T10:00:00Z", "2026-11-28T10:00:00Z", "2026-11-28T23:30:00Z", "2026-11-29T10:00:00Z", "2026-11-29T20:30:00Z" /* 21:30 Madrid */, "2026-11-29T22:59:00Z"]) {
    assert.equal(guidePhaseStart(new Date(iso)), null, iso);
  }
  assert.equal(guidePhaseStart(new Date("2026-11-29T23:00:00Z"))?.toISOString(), "2026-11-29T23:00:00.000Z", "30 Nov 00:00 Madrid");
  assert.equal(
    contentLastModified({ ...row, phaseStart: guidePhaseStart(new Date("2026-11-29T20:30:00Z")) }, new Date("2026-11-29T23:00:00Z")).toISOString(),
    "2026-11-26T10:00:00.000Z",
    "29 Nov 21:30: still the last publish",
  );
});

test("the after copy states the law's rule, not observed events, and gives no proclamation dates it could not re-read", () => {
  for (const locale of LOCALES) {
    for (const at of [MON_30_START, OVER_START]) {
      const body = resolveElectionPhased(edition("election-night", locale), at);
      const printed = text(body) + " " + text(resolveElectionPhased(edition("election-results", locale), at));
      assert.doesNotMatch(printed, /8 al 16|8 y el 16|8 (to|and) 16|40 dies|40 días|40 days following|following 40/i, `${locale}: no JEC proclamation window, no "40 days following"`);
      assert.match(printed, /108\.6/, `${locale}: forty days is art. 108.6`);
      assert.match(printed, /108\.4/, `${locale}: proclamation is art. 108.4`);
      assert.doesNotMatch(printed, /live results|resultats en directe|resultados en directo/i, `${locale}: no "unofficial sites" warning after the vote`);
      assert.doesNotMatch(printed, /va facilitar l'escrutini|facilitó el escrutinio|Government provided the provisional/i, `${locale}: the Government's count is the law's rule`);
    }
  }
});

test("the how-to-vote lead: only the 'next election is 29 Nov' clause changes from 30 Nov; nothing else of lead, title or description", () => {
  for (const locale of LOCALES) {
    const stored = edition("voting", locale);
    const first = stored[0];
    assert.ok(first && first.type === "electionPhased", `${locale}: lead is phased`);
    if (!first || first.type !== "electionPhased") continue;
    const pre = parseBody(first.pre)[0];
    const after = parseBody(first.after)[0];
    assert.ok(pre?.type === "paragraph" && after?.type === "paragraph" && pre.lead && after.lead);
    if (pre?.type !== "paragraph" || after?.type !== "paragraph") continue;
    assert.match(pre.text, { ca: /^Les properes eleccions a Catalunya són les \*\*generals/, es: /^Las próximas elecciones en Cataluña son las \*\*generales/, en: /^Spain's general election is on \*\*Sunday 29 November 2026\*\*/ }[locale], `${locale}: pre lead is the lead as it was`);
    assert.notEqual(after.text, pre.text);
    // Everything after the first sentence-length clause is byte for byte the same.
    const tailOf = (t: string) => t.slice(t.indexOf("Key dates") >= 0 ? t.indexOf("Key dates") : t.indexOf("Se vota") >= 0 ? t.indexOf("Se vota") : t.indexOf("Es vota"));
    // 26 Nov 2026: from the hand-in (26 Nov 14:00) the lead's postal deadlines read in the past (voting.ts HANDIN_LEAD);
    // from 30 Nov the tail is that hand-in lead's, byte for byte.
    const handin = parseBody(first.handin ?? [])[0];
    assert.ok(handin?.type === "paragraph" && handin.lead, `${locale}: hand-in lead`);
    if (handin?.type !== "paragraph") continue;
    assert.equal(tailOf(after.text), tailOf(handin.text), `${locale}: only the opening clause moves`);
    assert.equal(handin.text.slice(0, 120), pre.text.slice(0, 120), `${locale}: the hand-in lead opens as before`);
    assert.doesNotMatch(after.text, /next election is|Les properes eleccions a Catalunya són les \*\*generals|Las próximas elecciones en Cataluña son las \*\*generales|general election is on/i, `${locale}`);
    assert.match(after.text, /was held|van ser|fueron/, `${locale}: past tense`);
    assert.equal(VOTING.editions[locale].seoTitle.length > 0, true);
  }
  // Title and description are the stored ones (owner decision), in every language.
  assert.match(VOTING.editions.ca.seoTitle, /Quan són les properes eleccions a Catalunya\? 29N i on votar/);
  assert.match(VOTING.editions.es.seoTitle, /¿Cuándo son las elecciones en Cataluña\? Generales 29N y próximas/);
  assert.match(VOTING.editions.en.seoTitle, /2026 Spain general election dates, how to vote and register/);
  assert.match(VOTING.editions.en.seoDescription, /^Sunday 29 Nov, 9:00-20:00/);
});

test("the register section no longer says 'just check where you vote' after the vote", () => {
  const en = text(resolveElectionPhased(edition("voting", "en"), MON_30_START));
  assert.doesNotMatch(en, /just check where you vote/);
  assert.match(text(resolveElectionPhased(edition("voting", "en"), NIGHT_BEFORE)), /just check where you vote/);
});

test("a phased block without an `over` variant falls back to `after`", () => {
  const body = parseBody([{ type: "electionPhased", pre: [{ type: "paragraph", text: "pre" }], after: [{ type: "paragraph", text: "after" }] }]);
  assert.equal(text(resolveElectionPhased(body, NIGHT_BEFORE)), "pre");
  assert.equal(text(resolveElectionPhased(body, MON_30_START)), "after");
  assert.equal(text(resolveElectionPhased(body, OVER_START)), "after");
  const withOver = parseBody([{ type: "electionPhased", pre: [], after: [{ type: "paragraph", text: "after" }], over: [{ type: "paragraph", text: "over" }] }]);
  assert.equal(text(resolveElectionPhased(withOver, OVER_START)), "over");
  assert.equal(text(resolveElectionPhased(withOver, NIGHT_BEFORE)), "");
});
