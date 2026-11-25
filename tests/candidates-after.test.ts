import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, parseBody } from "../src/lib/content/blocks.ts";
import { CANDIDATES } from "../src/lib/content/batch02/candidates.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { PHASE_DEPENDENT_PATTERN } from "../src/lib/content/day-dependent.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubPath } from "../src/lib/programmatic/elections/paths.ts";

/**
 * The candidates guide after the vote (25 Nov 2026, docs/SEO_EXPERIMENTS.md, "29N readiness round 2, item 3"):
 * the most visited 29N page gets a past-tense callout from Mon 30 Nov 00:00 Madrid, the way the night, results
 * and how-to-vote guides do (`electionPhased`, election-after.ts). Until 29 Nov 23:59:59 it reads as before.
 */

const stored = (locale: Locale) => parseBody(CANDIDATES.editions[locale].blocks);
const at = (locale: Locale, iso: string) => resolveElectionPhased(stored(locale), new Date(iso));
const callouts = (locale: Locale, iso: string) => at(locale, iso).filter((b) => b.type === "callout" && b.tone === "info" && /^(Les eleccions del 29|Las elecciones del 29|The 29 November election)/.test(b.title ?? ""));

test("the stored body parses, carries one phased block right under the lead, and the page is nightly-revalidated", () => {
  for (const locale of LOCALES) {
    const body = stored(locale);
    assert.ok(bodySchema.safeParse(body).success, locale);
    assert.equal(body.filter((b) => b.type === "electionPhased").length, 1, locale);
    const index = body.findIndex((b) => b.type === "electionPhased");
    assert.equal(body[index - 1]?.type, "paragraph", `${locale}: after the lead`);
    assert.equal(body[index + 1]?.type, "candidateLists", `${locale}: before the lists`);
    assert.match(JSON.stringify(CANDIDATES.editions[locale].blocks), new RegExp(PHASE_DEPENDENT_PATTERN.replace(/\\\\/g, "\\")), locale);
  }
});

test("nothing changes until 29 Nov 23:59:59; the callout appears at 30 Nov 00:00 Madrid, in ca, es and en", () => {
  for (const locale of LOCALES) {
    const before = at(locale, "2026-11-29T23:59:59+01:00");
    assert.ok(!before.some((b) => b.type === "electionPhased"), locale);
    assert.equal(callouts(locale, "2026-11-29T23:59:59+01:00").length, 0, `${locale}: 23:59:59`);
    assert.equal(callouts(locale, "2026-11-26T14:00:00+01:00").length, 0, `${locale}: the 26 Nov hand-in variant is not used here`);
    assert.equal(callouts(locale, "2026-11-30T00:00:00+01:00").length, 1, `${locale}: 30 Nov`);
    assert.equal(callouts(locale, "2026-12-03T10:00:00+01:00").length, 1, `${locale}: 3 Dec`);
    assert.equal(callouts(locale, "2026-12-08T00:00:00+01:00").length, 1, `${locale}: 8 Dec (over reads after)`);
    assert.equal(bodyToPlainText(before), bodyToPlainText(resolveElectionPhased(stored(locale), new Date("2026-11-20T10:00:00+01:00"))), `${locale}: identical before the vote`);
  }
});

test("the callout is past tense, gives the law's schedule and links the night guide, the results guide and the hub", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/La votació va ser el diumenge 29 de novembre/, /divendres 4 de desembre/, /dilluns 7/, /quaranta dies/],
    es: [/La votación fue el domingo 29 de noviembre/, /viernes 4 de diciembre/, /lunes 7/, /cuarenta días/],
    en: [/Voting took place on Sunday 29 November/, /Friday 4 December/, /Monday 7 December/, /forty days/],
  };
  for (const locale of LOCALES) {
    const [callout] = callouts(locale, "2026-11-30T10:00:00+01:00");
    assert.ok(callout && callout.type === "callout", locale);
    for (const re of must[locale]) assert.match(callout.text, re, `${locale}: ${re}`);
    assert.ok(callout.text.includes(`](${b2href("electionNight", locale)})`), `${locale}: night guide`);
    assert.ok(callout.text.includes(`](${b2href("congressResults", locale)})`), `${locale}: results guide`);
    assert.ok(callout.text.includes(`](${hubPath(locale)})`), `${locale}: results by municipality`);
    assert.ok(callout.text.includes("boe.es/buscar/act.php?id=BOE-A-1985-11672#"), `${locale}: LOREG anchors`);
    assert.doesNotMatch(callout.text, /\b(\d+[,.]\d+ ?%|escons|escaños|seats) (per|for|de)\b/, `${locale}: no figure`);
  }
});
