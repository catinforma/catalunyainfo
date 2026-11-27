import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  RAIL_NEXT_HEADING,
  RAIL_NEXT_MAX_AGE_DAYS,
  railCalledOff,
  railHistory,
  railIsStale,
  railStandingAnswer,
  railState,
  railStrikeNextLines,
  railStrikes,
  railVerified,
  type RailStrike,
} from "../src/lib/content/batch02/rail-strike-next.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { RENFE_STANDING_META_FROM, STRIKE_RENFE_GUIDE, buildStrikeGuideBody, strikeGuideDescription, strikeGuideMeta } from "../src/lib/content/batch02/strike-guides.ts";
import type { SpainStrike } from "../src/lib/content/batch02/strikes-spain-model.ts";
import { RAIL_17N_GUIDE, buildRail17nBody } from "../src/lib/content/batch02/strike-rail-17n.ts";
import { RENFE_STANDING_ANCHOR, STRIKES, STRIKES_GUIDE, STRIKES_VERIFIED, madridDate } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_GUIDE } from "../src/lib/content/batch02/strikes-spain.ts";
import { SPAIN_STRIKES, STRIKES_SPAIN_VERIFIED } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { blockSchema, bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/** 25 Nov 2026: the stamp moves with each re-read (STRIKES_VERIFIED), so the tests read it instead of pinning a day. */
// 27 Nov 2026: the stamp is the earlier of the two hubs' re-reads (railVerified), which may differ for a day.
const RAIL_STAMP = STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED;
const STAMPED_RE = new RegExp(`^(A|As of) ${Number(RAIL_STAMP.slice(8))} (de )?(novembre|noviembre|November) (de )?2026`);

/**
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Renfe guide as the standing 'is there
 * a Renfe strike now?' page"): "huelga renfe", "vaga renfe", "huelga trenes"
 * asked every week and landed on a page dated to one strike. The Renfe guide
 * now answers "is there one now, and when is the next" from the rail strikes in
 * the strike data (`railStrikeNext`, day-dependent), with the strikes that are
 * over in a short history. Nothing is invented: a date is printed only if an
 * entry in strikes.ts or strikes-spain-data.ts has it, and "no strike" always
 * carries the date the sources were last re-read.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);

/** A made-up strike for logic tests only (shape, never a real date or figure). */
const FUTURE: RailStrike = {
  id: "test-futura",
  dates: ["2026-12-14", "2026-12-15"],
  title: { ca: "vaga de prova", es: "huelga de prueba", en: "test strike" },
  days: { ca: "dilluns 14 i dimarts 15 de desembre de 2026", es: "lunes 14 y martes 15 de diciembre de 2026", en: "Monday 14 and Tuesday 15 December 2026" },
  scope: { ca: "Personal de prova, fora de Catalunya.", es: "Personal de prueba, fuera de Cataluña.", en: "Test staff, outside Catalonia." },
  ms: { ca: "Serveis mínims de prova", es: "Servicios mínimos de prueba", en: "Test minimum services" },
  sources: [{ name: "Font de prova", url: "https://example.org/prova", publisher: "Prova" }],
};

test("the rail strikes come from the two data files, once each, and only rail", () => {
  const ids = railStrikes().map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "a strike listed twice");
  // Catalan entries first (the Spain-wide twin of the 17 Nov strike is not repeated).
  assert.ok(ids.includes("vaga-ferroviaria-2026-11-17"));
  assert.ok(!ids.includes("huelga-ferroviaria-2026-11-17"));
  assert.ok(ids.includes("vaga-renfe-2026-11-10"));
  assert.ok(ids.includes("vaga-renfe-2026-10-29"));
  for (const notRail of ["vaga-educacio-2026-11-26", "vaga-metges-2026-10-28", "vaga-metges-smu-2026-11-16"]) assert.ok(!ids.includes(notRail), notRail);
  const dates = railStrikes().map((s) => s.dates[0]);
  assert.deepEqual(dates, [...dates].sort());
  // Every rail strike has days, a title and at least one official source in each language.
  for (const strike of railStrikes()) {
    assert.ok(strike.sources.length > 0, strike.id);
    for (const locale of LOCALES) {
      assert.ok(strike.days[locale].length > 5 && strike.title[locale].length > 5, `${strike.id}/${locale}`);
    }
  }
});

test("state: no strike today, one under way, one next, and the last one that ended", () => {
  const list = [...railStrikes(), FUTURE];
  const none = railState("2026-11-24", railStrikes(), "2026-11-24");
  assert.equal(none.now.length, 0);
  assert.equal(none.next.length, 0);
  assert.equal(none.last?.id, "vaga-ferroviaria-2026-11-17");
  const eve = railState("2026-11-16", railStrikes(), "2026-11-16");
  assert.deepEqual(eve.next.map((s) => s.id), ["vaga-ferroviaria-2026-11-17"]);
  const on = railState("2026-11-17", railStrikes(), "2026-11-17");
  assert.deepEqual(on.now.map((s) => s.id), ["vaga-ferroviaria-2026-11-17"]);
  // A multi-day strike under way on a day it skips is still "next", from its next day.
  const gap = railState("2026-12-14", list, "2026-12-14");
  assert.deepEqual(gap.now.map((s) => s.id), ["test-futura"]);
  const between = railState("2026-12-10", list, "2026-12-10");
  assert.deepEqual(between.next.map((s) => s.id), ["test-futura"]);
  assert.equal(between.last?.id, "vaga-ferroviaria-2026-11-17");
  const after = railState("2026-12-16", list, "2026-12-16");
  assert.equal(after.last?.id, "test-futura");
  assert.equal(after.next.length, 0);
});

test("the answer names what the data has, in the day's words, with the re-read date; it never invents a strike", () => {
  for (const locale of LOCALES) {
    const none = railStrikeNextLines("2026-11-24", locale, railStrikes(), "2026-11-24");
    assert.equal(none.kind, "none");
    assert.ok(!none.stale);
    assert.match(none.detail, /24 (de )?(novembre|noviembre|November) (de )?2026/, locale);
    assert.ok(none.facts.some((f) => /17 (de )?(novembre|noviembre|November)/.test(f.value)), `${locale}: the last strike is the 17th`);
    assert.doesNotMatch(none.headline + none.detail, /test|prova|prueba/i);
    // Official places to look today: Rodalies, Renfe, the Ministry's list, Treball's list.
    assert.ok(none.links.some((l) => l.href.includes("rodalies.gencat.cat")), locale);
    assert.ok(none.links.some((l) => l.href.includes("renfe.com")), locale);
    assert.ok(none.links.some((l) => l.href.includes("transportes.gob.es")), locale);
    assert.ok(none.links.some((l) => l.href.includes("treball.gencat.cat")), locale);
    assert.match(none.note, /2026/);

    const list = [...railStrikes(), FUTURE];
    const next = railStrikeNextLines("2026-12-10", locale, list, "2026-12-10");
    assert.equal(next.kind, "next");
    assert.ok(next.headline.includes(FUTURE.days[locale]), `${locale}: ${next.headline}`);
    assert.ok(next.detail.includes(FUTURE.title[locale]) && next.detail.includes(FUTURE.ms[locale]), `${locale}: ${next.detail}`);
    // A strike outside Catalonia says where it applies, never just "train strike".
    assert.ok(next.detail.includes(FUTURE.scope[locale]), `${locale}: scope missing: ${next.detail}`);
    assert.ok(next.links.some((l) => l.href === "https://example.org/prova"), `${locale}: the strike's own source`);

    const now = railStrikeNextLines("2026-12-14", locale, list, "2026-12-14");
    assert.equal(now.kind, "today");
    assert.ok(now.detail.toLowerCase().includes(FUTURE.title[locale]), locale);
    assert.ok(now.detail.includes(FUTURE.scope[locale]), `${locale}: scope missing: ${now.detail}`);
  }
});

test("stale re-read: after RAIL_NEXT_MAX_AGE_DAYS the block says what the last re-read found, never 'today, no strike'", () => {
  assert.equal(RAIL_NEXT_MAX_AGE_DAYS, 4);
  assert.ok(!railIsStale("2026-11-28", "2026-11-24"));
  assert.ok(railIsStale("2026-11-29", "2026-11-24"));
  for (const locale of LOCALES) {
    const stale = railStrikeNextLines("2026-12-05", locale, railStrikes(), "2026-11-24");
    assert.ok(stale.stale, locale);
    assert.match(stale.headline, /24 (de )?(novembre|noviembre|November) (de )?2026/, `${locale}: ${stale.headline}`);
    assert.doesNotMatch(stale.headline, /^(Avui|Hoy|Today)/, locale);
    assert.match(stale.detail, /5 (de )?(desembre|diciembre|December)/, `${locale}: names today only to say it was not re-read`);
    // A strike that fell between the re-read and today is not claimed to be over or on.
    const gap = railStrikeNextLines("2026-12-14", locale, [...railStrikes(), FUTURE], "2026-12-01");
    assert.ok(gap.stale && gap.kind === "next", locale);
  }
});

test("date guard: the rail strike data was re-read in the last 4 days (re-read the sources, move STRIKES_VERIFIED and STRIKES_SPAIN_VERIFIED, publish ?only=strikes)", () => {
  const today = madridDate(new Date());
  assert.equal(railVerified(), STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED);
  assert.ok(
    !railIsStale(today),
    `On ${today} the Renfe guide's "no rail strike called" answer was last read on ${railVerified()}, more than ${RAIL_NEXT_MAX_AGE_DAYS - 1} days ago. Re-read SEMAF, SCF, CCOO and UGT rail, ALFERRO, the Ministry's rail list, Treball's list and Rodalies' alterations, then move STRIKES_VERIFIED and STRIKES_SPAIN_VERIFIED and publish ?only=strikes.`,
  );
});

test("railStrikeNext is a configuration-free, day-dependent block, rendered on the server", () => {
  assert.ok(blockSchema.safeParse({ type: "railStrikeNext" }).success);
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("railStrikeNext"), "the nightly cron must rebuild the page");
  const renderer = readFileSync(join(import.meta.dirname, "../src/components/blocks/BlockRenderer.tsx"), "utf8");
  assert.match(renderer, /case "railStrikeNext":\s*\n\s*\/\/[^\n]*\n\s*return <RailStrikeNext locale=\{context\.locale\} \/>;/);
  const component = readFileSync(join(import.meta.dirname, "../src/components/blocks/RailStrikeNext.tsx"), "utf8");
  assert.doesNotMatch(component, /"use client"/, "the answer has to be in the HTML");
  const module = readFileSync(join(import.meta.dirname, "../src/lib/content/batch02/rail-strike-next.ts"), "utf8");
  assert.doesNotMatch(module, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock: only the component passes today");
});

test("guide: while no rail strike is to come, the lead of the last strike stays, then the day-dependent answer, minimum services, history and FAQ", () => {
  for (const locale of LOCALES) {
    const blocks = STRIKE_RENFE_GUIDE.editions[locale].blocks;
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    assert.equal(blocks.filter((b) => b.type === "railStrikeNext").length, 1, locale);
    const at = blocks.findIndex((b) => b.type === "railStrikeNext");
    const h = blocks[at - 1] as { type: string; text: string; level: number };
    assert.equal(h.type, "heading");
    assert.equal(h.level, 2);
    assert.equal(h.text, RAIL_NEXT_HEADING[locale]);
    assert.equal(at, 3, `${locale}: right under the lead and its sources line`);
    const headings = blocks.filter((b) => b.type === "heading").map((b) => (b as { id?: string }).id);
    assert.ok(headings.includes("serveis-minims") && headings.includes("vagues-anteriors"), locale);
    assert.ok(!headings.includes("que-afecta"), `${locale}: the past strike's service table is not the standing page's`);
    // History: every rail strike that is over, from the data, newest first.
    const list = blocks[blocks.findIndex((b) => (b as { id?: string }).id === "vagues-anteriors") + 2] as { type: string; items: string[] };
    assert.equal(list.type, "list");
    const past = railHistory("2026-11-24");
    assert.equal(list.items.length, past.length, locale);
    past.forEach((strike, i) => assert.ok(list.items[i]!.includes(strike.days[locale].charAt(0).toUpperCase() + strike.days[locale].slice(1)), `${locale}: ${strike.id}`));
    assert.ok(past.length >= 4, "29 Oct, 30 Oct, 10 Nov, 17 Nov");
    // The 17 Nov strike links its own page; the called-off ones are named with the Spain calendar linked.
    assert.ok(JSON.stringify(blocks).includes(`](/${locale}/${B2_PATHS.railStrike17n[locale]}/)`), locale);
    assert.ok(railCalledOff(locale).length >= 3);
    for (const title of railCalledOff(locale)) assert.ok(text(blocks).includes(title), `${locale}: ${title}`);
    // The FAQ opens with the date-stamped answer ("A 25 de novembre": the last re-read, STRIKES_VERIFIED), never "hoy".
    const faq = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    assert.match(faq.items[0]!.answer, STAMPED_RE, locale);
    assert.equal(faq.items[0]!.answer, railStandingAnswer(STRIKES_VERIFIED, locale));
    assert.doesNotMatch(faq.items[0]!.answer, /\b(avui|hoy|today)\b/i, locale);
  }
});

test("guide: title, description and lead keep following the last strike until 22 Dec (28-day window), then take the standing wording", () => {
  assert.equal(RENFE_STANDING_META_FROM, "2026-12-22");
  const before = { ca: "Vaga Renfe i Adif 17 novembre: Rodalies i mínims", es: "Huelga Renfe y Adif 17 noviembre: Rodalies y mínimos", en: "Renfe and Adif strike 17 November 2026: what runs" } as const;
  const standing = {
    ca: "Vaga Renfe i Rodalies avui: hi ha vaga? Propera data",
    es: "Huelga Renfe y Rodalies hoy: ¿hay huelga? Próxima fecha",
    en: "Renfe and Rodalies strike today: is there one? Next date",
  } as const;
  for (const locale of LOCALES) {
    assert.equal(strikeGuideMeta("strikeRenfe", locale, STRIKES, "2026-12-21").seoTitle, before[locale]);
    assert.equal(STRIKE_RENFE_GUIDE.editions[locale].seoTitle, before[locale], "today's published title is untouched");
    const meta = strikeGuideMeta("strikeRenfe", locale, STRIKES, "2026-12-22");
    assert.equal(meta.seoTitle, standing[locale]);
    assert.ok(meta.seoTitle.length <= 60 && meta.title.length <= 120 && meta.excerpt.length <= 200, locale);
    assert.match(meta.seoTitle + meta.title, /Renfe/);
    const description = strikeGuideDescription("strikeRenfe", locale, "2026-12-22", STRIKES);
    assert.ok(description.length > 60 && description.length <= 155, `${locale}: ${description}`);
    assert.match(description, STAMPED_RE, locale);
    // Lead: the last strike's until 22 Dec, the dated answer from then.
    const leadBefore = text(buildStrikeGuideBody("strikeRenfe", locale, "2026-12-21").slice(0, 1));
    const leadAfter = text(buildStrikeGuideBody("strikeRenfe", locale, "2026-12-22").slice(0, 1));
    assert.match(leadBefore, /17 (de )?(novembre|noviembre|November)/);
    assert.match(leadAfter, STAMPED_RE, locale);
    assert.ok(leadAfter.length > 120, locale);
  }
});

test("guide: when a rail strike is called, the guide is that strike's page again (no standing sections)", () => {
  const called = STRIKES.map((s) => (s.id === "vaga-ferroviaria-2026-11-17" ? { ...s, dates: ["2026-12-21"] } : s));
  for (const locale of LOCALES) {
    const blocks = buildStrikeGuideBody("strikeRenfe", locale, "2026-12-19", called);
    assert.ok(blocks.every((b) => b.type !== "railStrikeNext"), locale);
    assert.equal(blocks[2]?.type, "keyFacts", locale); // lead, sources line (25 Nov 2026), key facts
    assert.doesNotMatch(strikeGuideMeta("strikeRenfe", locale, called, "2026-12-19").seoTitle, /hoy|avui|today/i);
  }
});

test("the hubs and the 17 Nov page link the guide with the 'huelga Renfe' anchor, in every language", () => {
  assert.deepEqual(RENFE_STANDING_ANCHOR, {
    ca: "Vaga Renfe i Rodalies: hi ha vaga ara? La propera vaga de trens",
    es: "Huelga Renfe y Rodalies: ¿hay huelga ahora? La próxima huelga de trenes",
    en: "Renfe and Rodalies strike: is there one now? The next train strike",
  });
  for (const locale of LOCALES as readonly Locale[]) {
    const link = `[${RENFE_STANDING_ANCHOR[locale]}](/${locale}/${B2_PATHS.strikeRenfe[locale]}/)`;
    assert.ok(JSON.stringify(STRIKES_GUIDE.editions[locale].blocks).includes(link), `Catalan hub/${locale}`);
    assert.ok(JSON.stringify(STRIKES_SPAIN_GUIDE.editions[locale].blocks).includes(link), `Spain hub/${locale}`);
    assert.ok(JSON.stringify(RAIL_17N_GUIDE.editions[locale].blocks).includes(link), `17N page/${locale}`);
    // On the strike's own days the 17 Nov page is the answer: no pointer before it is over.
    assert.ok(!JSON.stringify(buildRail17nBody(locale, "2026-11-16")).includes(link), `17N page before the strike/${locale}`);
  }
});

test("only official calls count: a strike only an organiser's notice calls is never the next strike, in any list or history", () => {
  const spainTwin = SPAIN_STRIKES.find((s) => s.id === "huelga-ferroviaria-2026-11-17")!;
  const spainOnly = (status: "official" | "called"): SpainStrike => ({ ...spainTwin, id: "test-solo-espana", catalanEntry: undefined, status, dates: ["2026-12-14"] });
  assert.ok(railStrikes(STRIKES, [...SPAIN_STRIKES, spainOnly("official")]).some((s) => s.id === "test-solo-espana"));
  assert.ok(!railStrikes(STRIKES, [...SPAIN_STRIKES, spainOnly("called")]).some((s) => s.id === "test-solo-espana"));
  // A Catalan entry whose Spain-wide twin is only "called" is left out too.
  const notOfficial = SPAIN_STRIKES.map((s) => (s.id === "huelga-ferroviaria-2026-11-17" ? { ...s, status: "called" as const } : s));
  assert.ok(!railStrikes(STRIKES, notOfficial).some((s) => s.id === "vaga-ferroviaria-2026-11-17"));
  // The real data: nothing printed is unofficial.
  for (const strike of SPAIN_STRIKES.filter((s) => s.sector === "rail" && s.status !== "official")) {
    assert.ok(!railStrikes().some((s) => s.id === strike.id), strike.id);
  }
  for (const locale of LOCALES) {
    const lines = railStrikeNextLines("2026-12-10", locale, railStrikes(STRIKES, [...SPAIN_STRIKES, spainOnly("called")]), "2026-12-10");
    assert.equal(lines.kind, "none", locale);
  }
});

test("the history lists the five strikes in the data that touched Rodalies or long distance, the 11 Nov general strike included", () => {
  const ids = railHistory("2026-11-24").map((s) => s.id);
  assert.deepEqual(ids, ["vaga-ferroviaria-2026-11-17", "vaga-general-2026-11-11", "vaga-renfe-2026-11-10", "vaga-ouigo-2026-10-30", "vaga-renfe-2026-10-29"]);
  for (const locale of LOCALES) {
    const blocks = STRIKE_RENFE_GUIDE.editions[locale].blocks;
    const at = blocks.findIndex((b) => (b as { id?: string }).id === "vagues-anteriors");
    assert.equal((blocks[at + 2] as { items: string[] }).items.length, 5, locale);
  }
});

test("a rail strike only in the Spain calendar takes the guide off the standing page: no 'this strike is over' lead above a 'next strike' block", () => {
  const list = [...railStrikes(), { ...FUTURE, dates: ["2026-12-28"] }];
  for (const locale of LOCALES) {
    // Before the queued switch: the old past page (its lead says the strike is over), without the day-dependent block.
    const early = buildStrikeGuideBody("strikeRenfe", locale, "2026-12-10", STRIKES, list);
    assert.ok(early.every((b) => b.type !== "railStrikeNext"), locale);
    assert.match(text(early.slice(0, 1)), /ja ha passat|ya ha pasado|is over/, locale);
    // After it: the title does not turn into "today, is there one?" while a strike is on the calendar.
    const late = strikeGuideMeta("strikeRenfe", locale, STRIKES, "2026-12-23", list);
    assert.doesNotMatch(late.seoTitle, /hoy|avui|today/i, locale);
    assert.ok(buildStrikeGuideBody("strikeRenfe", locale, "2026-12-23", STRIKES, list).every((b) => b.type !== "railStrikeNext"), locale);
    assert.doesNotMatch(strikeGuideDescription("strikeRenfe", locale, "2026-12-23", STRIKES, list), /^(A|As of) 24/, locale);
    // Without it the same day is the standing page.
    assert.ok(buildStrikeGuideBody("strikeRenfe", locale, "2026-12-23", STRIKES, railStrikes()).some((b) => b.type === "railStrikeNext"), locale);
  }
});

test("the standing page talks about rail strikes in general: no 'this strike' wording, no 'when minimum services come out'", () => {
  const banned = /d'aquesta vaga|aquesta vaga|esta huelga|de esta huelga|this strike|surtin els serveis|salgan los servicios|minimum services come out/i;
  for (const locale of LOCALES) {
    const blocks = STRIKE_RENFE_GUIDE.editions[locale].blocks;
    // The visible text of every block except the lead (the last strike's, until 22 Dec) and the "what to do" tip that names the 29 Oct strike on purpose.
    const rest = text(blocks.slice(1));
    assert.doesNotMatch(rest.replace(/[^.]*29 d'octubre[^.]*\.|[^.]*29 de octubre[^.]*\.|[^.]*29 October[^.]*\./g, ""), banned, locale);
    const table = blocks.find((b) => b.type === "table") as { caption?: string };
    assert.doesNotMatch(table.caption ?? "", /aquesta|esta|this strike/i, locale);
    const callout = blocks.find((b) => b.type === "callout") as { text?: string; body?: string };
    assert.doesNotMatch(JSON.stringify(callout), /surtin|salgan|come out/i, locale);
  }
});
