import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { headingId } from "../src/lib/content/blocks.ts";
import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import {
  ELECTION_LINE_REMOVE_BY,
  SHOPS_29N_HEADING,
  dateElectionLine,
  electionLineFor,
  electionLineScope,
  entryElectionLine,
} from "../src/lib/engagement/election-line.ts";
import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { censusFactAndFaq } from "../src/lib/programmatic/elections/model.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

/**
 * 29N election line (lib/engagement/election-line.ts, 26 Nov 2026, batch 5A)
 * and the census fact + FAQ on the town election pages (model.ts
 * censusFactAndFaq). REREAD_BY 2026-12-08: the line is over from then.
 */

const LOCALES = ["ca", "es", "en"] as const;
const at = (iso: string) => new Date(iso);
const BEFORE = at("2026-11-27T12:00:00+01:00");
const POLLING = at("2026-11-29T12:00:00+01:00");
const COUNT = at("2026-11-29T21:00:00+01:00");
const AFTER = at("2026-12-02T12:00:00+01:00");
const OVER = at("2026-12-08T00:00:00+01:00");

test("date guard: remove the election line and its two call sites from 8 Dec 2026", () => {
  assert.ok(
    todayInCatalonia() < ELECTION_LINE_REMOVE_BY,
    "From 8 Dec 2026 the line renders nothing: delete lib/engagement/election-line.ts, components/ElectionLine.tsx, their uses in EntryArticle.tsx and holidays/DatePage.tsx, this test, and `election_line` from RELATED_LINK_CONTEXTS.",
  );
});

test("scope: strike pages and the December bridge guide, not the shops guide nor the 11N Spain pages", () => {
  assert.equal(electionLineScope({ href: b2href("strike26n", "es") }), "strike");
  assert.equal(electionLineScope({ href: "/es/guias/huelga-26-noviembre/" }), "strike");
  assert.equal(electionLineScope({ href: "/ca/guies/vaga-26-novembre/" }), "strike");
  assert.equal(electionLineScope({ href: "/es/guias/huelga-hoy-cataluna/" }), "strike");
  assert.equal(electionLineScope({ href: b2href("strikes", "en") }), "strike");
  assert.equal(electionLineScope({ href: "/es/guias/puente-diciembre-cataluna/" }), "holiday");
  assert.equal(electionLineScope({ href: b2href("decemberBridge", "ca") }), "holiday");
  assert.equal(electionLineScope({ href: b2href("shops", "es") }), null);
  assert.equal(electionLineScope({ href: b2href("voting", "es") }), null);
  assert.equal(electionLineScope({ href: "/es/guias/huelga-general-11-noviembre-2026-sevilla/", key: "guide-general-strike-11-november-2026-sevilla" }), null);
});

test("before the polls close: hours, the town finder and how to vote; the shops' Sunday 29 section on holiday pages", () => {
  for (const now of [BEFORE, POLLING]) {
    for (const locale of LOCALES) {
      const strike = entryElectionLine({ href: b2href("strikes", locale), locale }, now);
      assert.ok(strike, locale);
      assert.match(strike.text, /29/);
      assert.match(strike.text, /9[.:]00/);
      assert.match(strike.text, /20[.:]00/);
      assert.equal(strike.links.length, 2);
      assert.equal(strike.links[0]!.href, { ca: "/ca/eleccions/", es: "/es/elecciones/", en: "/en/elections/" }[locale]);
      assert.ok(strike.links[1]!.href.startsWith(`${b2href("voting", locale)}#`), strike.links[1]!.href);
      const bridge = entryElectionLine({ href: b2href("decemberBridge", locale), locale }, now);
      assert.equal(bridge?.links.length, 3);
      assert.ok(bridge!.links[2]!.href.startsWith(`${b2href("shops", locale)}#`));
      for (const link of [...strike.links, ...bridge!.links]) {
        assert.match(link.href.split("#")[0]!, /^\/(ca|es|en)\/.*\/$/, "same-language path with a trailing slash");
        assert.ok(link.href.startsWith(`/${locale}/`));
        assert.doesNotMatch(link.label, /undefined|null|NaN/);
      }
    }
  }
});

test("the shops anchor is the id of the shops guide's own Sunday 29 heading", () => {
  for (const locale of LOCALES) {
    const heading = SHOPS.editions[locale].blocks.find((block) => block.type === "heading" && block.text === SHOPS_29N_HEADING[locale]);
    assert.ok(heading && heading.type === "heading", `${locale}: heading "${SHOPS_29N_HEADING[locale]}" in the shops guide`);
    const line = electionLineFor(locale, "before", { shops: true })!;
    assert.equal(line.links[2]!.href, `${b2href("shops", locale)}#${headingId(heading)}`);
  }
});

test("from the close of the polls to 7 Dec: results by town and the election-night guide; nothing from 8 Dec", () => {
  for (const now of [COUNT, AFTER]) {
    for (const locale of LOCALES) {
      const line = entryElectionLine({ href: b2href("strike26n", locale), locale }, now)!;
      assert.doesNotMatch(line.text, /9[.:]00/);
      assert.deepEqual(
        line.links.map((l) => l.href),
        [{ ca: "/ca/eleccions/", es: "/es/elecciones/", en: "/en/elections/" }[locale], b2href("electionNight", locale)],
      );
      // No shops link once Sunday 29 is past.
      assert.equal(entryElectionLine({ href: b2href("decemberBridge", locale), locale }, now)!.links.length, 2);
    }
  }
  for (const locale of LOCALES) {
    assert.equal(entryElectionLine({ href: b2href("strikes", locale), locale }, OVER), null);
    assert.equal(dateElectionLine("2026-12-07", locale, OVER), null);
  }
});

test("date pages: 27 Nov to 8 Dec 2026 only", () => {
  assert.ok(dateElectionLine("2026-12-07", "es", BEFORE));
  assert.ok(dateElectionLine("2026-11-29", "ca", BEFORE));
  assert.ok(dateElectionLine("2026-12-08", "en", BEFORE));
  assert.equal(dateElectionLine("2026-11-01", "es", BEFORE), null);
  assert.equal(dateElectionLine("2026-12-25", "es", BEFORE), null);
  assert.equal(dateElectionLine("2027-12-07", "es", BEFORE), null);
});

test("the templates render it, and a click is related_content_click with link_context election_line", () => {
  const entry = readFileSync(new URL("../src/components/pages/EntryArticle.tsx", import.meta.url), "utf8");
  const date = readFileSync(new URL("../src/components/programmatic/holidays/DatePage.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../src/components/ElectionLine.tsx", import.meta.url), "utf8");
  assert.match(entry, /entryElectionLine\(/);
  assert.match(date, /dateElectionLine\(iso, locale\)/);
  assert.match(component, /data-ci-placement="election_line"/);
  assert.deepEqual(
    classifyLinkClick({
      href: "https://www.catalunyainfo.com/es/elecciones/?x=1#a",
      siteHost: "www.catalunyainfo.com",
      locale: "es",
      channelUrl: "https://whatsapp.com/channel/x",
      inSources: false,
      inCalculator: false,
      placement: "election_line",
    }),
    { name: "related_content_click", params: { link_context: "election_line", link_url: "/es/elecciones/", locale: "es" } },
  );
});

test("town pages: the census figure in the facts and a census FAQ, official contacts only", () => {
  const m = SNAPSHOT.municipalities.find((town) => town.slug === "mataro") ?? SNAPSHOT.municipalities[0]!;
  for (const locale of LOCALES) {
    const before = censusFactAndFaq(m, locale, SNAPSHOT, "before");
    const digits = before.fact.value.replace(/\D/g, "");
    assert.ok(digits.startsWith(String(m.congress.electorate)), `${locale}: ${before.fact.value}`);
    assert.match(before.faq.answer, /Cl@ve/);
    assert.match(before.faq.answer, /900 343 232/);
    assert.match(before.faq.answer, /8[.:]00/);
    assert.match(before.faq.question, /\?$/);
    const after = censusFactAndFaq(m, locale, SNAPSHOT, "after");
    assert.doesNotMatch(after.faq.answer, /8[.:]00/, "the polling-day phone hours go once the polls close");
    assert.match(after.faq.answer, /900 343 232/);
    for (const text of [before.fact.value, before.faq.question, before.faq.answer]) assert.doesNotMatch(text, /undefined|null|NaN/);
  }
});
