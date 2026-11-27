import assert from "node:assert/strict";
import { test } from "node:test";

import { parseBody, type Body } from "../src/lib/content/blocks.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { MESA } from "../src/lib/content/batch02/mesa.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { buildBody } from "../src/lib/content/tourist-tax/publish.ts";
import { EXEMPT_AGE_AT_OR_BELOW } from "../src/lib/content/tourist-tax/rates.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { faqSchema } from "../src/lib/seo/jsonld.ts";

/**
 * 27 Nov 2026, English editions batch (docs/SEO_EXPERIMENTS.md): one FAQ each, in the words
 * English searchers use, on four of the ten English pages with most impressions, in ca/es/en.
 * Body only. Sources re-read that day: LOREG arts. 2.1 and 26.2 (BOE-A-1985-11672), TMB's hours
 * page (24 Dec 5:00-23:00, 31 Dec all night), the ATC's IEET page (four exemptions, none for
 * residence). The election-night answer is time-zone arithmetic on times the page already sources.
 */

type Faq = { type: "faq"; items: { question: string; answer: string }[] };

function faqs(body: unknown[]): Faq["items"] {
  return (body as { type: string; items?: Faq["items"] }[]).flatMap((b) => (b.type === "faq" ? (b.items ?? []) : []));
}
function find(items: Faq["items"], q: RegExp, label: string) {
  const hit = items.find((i) => q.test(i.question));
  assert.ok(hit, `${label}: question ${q}`);
  return hit!;
}

const MESA_Q: Record<Locale, RegExp> = {
  ca: /estranger resident/,
  es: /extranjero residente/,
  en: /^Can a foreign resident be called for polling-station duty\?$/,
};

test("polling-station duty: foreign residents cannot be drawn in a general election (LOREG 26.2 and 2)", () => {
  for (const locale of LOCALES) {
    const item = find(faqs(MESA.editions[locale].blocks), MESA_Q[locale], locale);
    assert.match(item.answer, /26\.2/, locale);
    assert.match(item.answer, /NIE/, locale);
    assert.match(item.answer, /(general election|generales|generals)/, locale);
  }
});

test("metro hours: Christmas Eve and New Year's Eve, TMB's standing rule, in every edition", () => {
  const Q: Record<Locale, [RegExp, RegExp]> = {
    ca: [/nit de Nadal\?$/, /Cap d'Any\?$/],
    es: [/Nochebuena\?$/, /Nochevieja\?$/],
    en: [/Christmas Eve\?$/, /New Year's Eve\?$/],
  };
  for (const locale of LOCALES) {
    const items = faqs(HOURS.editions[locale].blocks);
    assert.match(find(items, Q[locale][0], locale).answer, /5:00 (a|to) 23:00/, `${locale}: 24 Dec`);
    assert.match(find(items, Q[locale][1], locale).answer, /31 (de )?(desembre|diciembre|December)/, `${locale}: 31 Dec`);
    const text = JSON.stringify(HOURS.editions[locale].blocks);
    assert.doesNotMatch(text, /has run all night in recent years|los últimos años la Nochevieja|els últims anys la nit de Cap d'Any/, `${locale}: no hedged NYE line`);
  }
});

test("tourist tax: residents of Spain pay too; the four ATC exemptions, the age from rates.ts", () => {
  const Q: Record<Locale, RegExp> = { ca: /Si visc a Catalunya/, es: /Si vivo en Cataluña/, en: /^Do I pay the tourist tax if I live in Spain\?$/ };
  for (const locale of LOCALES) {
    const item = find(faqs(buildBody(locale) as unknown[]), Q[locale], locale);
    assert.match(item.answer, /^(Sí|Yes)\./, locale);
    assert.ok(item.answer.includes(String(EXEMPT_AGE_AT_OR_BELOW)), `${locale}: exempt age filled`);
    assert.doesNotMatch(item.answer, /\{age\}/, locale);
  }
});

test("election night: results in UK/Canaries time, future before the vote and past tense from Mon 30 Nov", () => {
  const BEFORE = new Date("2026-11-28T12:00:00Z");
  const AFTER = new Date("2026-11-30T09:00:00Z");
  const Q: Record<Locale, RegExp> = { ca: /Canàries, Portugal o el Regne Unit\?$/, es: /Canarias, Portugal o el Reino Unido\?$/, en: /^What time are the Spanish election results in UK time\?$/ };
  for (const locale of LOCALES) {
    const stored = parseBody(ELECTION_NIGHT.editions[locale].blocks) as Body;
    const before = find(faqs(resolveElectionPhased(stored, BEFORE)), Q[locale], `${locale} before`);
    const after = find(faqs(resolveElectionPhased(stored, AFTER)), Q[locale], `${locale} after`);
    assert.match(before.answer, /19[:.]00/, `${locale}: 20:00 mainland is 19:00 in London`);
    assert.match(before.answer, /21[:.]00/, locale);
    assert.match(after.answer, /(closed|van tancar|cerraron)/, `${locale}: past tense after the vote`);
    assert.doesNotMatch(after.answer, /\b(close at|tanquen a|cierran a)\b/, `${locale}: no future after the vote`);
    const schema = faqSchema(resolveElectionPhased(stored, AFTER)) as { mainEntity: { name: string }[] };
    assert.ok(schema.mainEntity.some((q) => Q[locale].test(q.name)), `${locale}: in the FAQPage`);
  }
});
