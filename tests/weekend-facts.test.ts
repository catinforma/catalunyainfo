import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { stamp } from "../src/lib/programmatic/weekend/agenda-copy.ts";
import { buildView, checkRead, pickRead, type SourceView } from "../src/lib/programmatic/weekend/agenda-list.ts";
import { SNAPSHOT, listedFairs } from "../src/lib/programmatic/weekend/data.ts";
import { datesText, hubFacts, spanText, weekendFacts, zoneAgendaItems, zoneFacts } from "../src/lib/programmatic/weekend/facts.ts";
import { weekendFaqNode } from "../src/lib/programmatic/weekend/structured.ts";
import { zoneById } from "../src/lib/programmatic/weekend/zones.ts";

const ROOT = join(import.meta.dirname, "..");

/**
 * Weekend pages, 25 Nov 2026: a key-facts table and a short FAQ built from the
 * same lists the page prints (the committed agenda snapshot of the weekend of
 * 20-22 Nov, read on 18 Nov, stands in for the live read).
 */

const raw = JSON.parse(readFileSync(join(ROOT, "src/lib/programmatic/weekend/agenda-snapshot.json"), "utf8")) as { reads: unknown[] };
const committed = Object.fromEntries(raw.reads.map((r) => [(r as { source: string }).source, checkRead(r)]));
const TODAY = "2026-11-19";
const window = weekendWindow(TODAY);
const view = (source: "gencat" | "bcn", reads = committed): SourceView => pickRead(source, window, {}, {}, reads as never);
const agendas = { window, today: TODAY, gencat: view("gencat"), bcn: view("bcn") };
const nothing = { window, today: TODAY, gencat: view("gencat", {}), bcn: view("bcn", {}) };

const BAD = /undefined|null|NaN|\[object|\*\*|\]\(/;

test("the snapshot stands for the weekend the test asks about", () => {
  assert.equal(window.from, "2026-11-20");
  assert.equal(window.to, "2026-11-22");
  assert.equal(agendas.gencat.status, "snapshot");
  assert.equal(nothing.gencat.status, "unavailable");
});

test("Barcelona, ca / es / en: dates, counts from the list the page prints, sources and the read time", () => {
  const barcelona = zoneById("barcelona");
  const { items } = zoneAgendaItems(barcelona, agendas);
  const counts = buildView(items, window, TODAY).counts;
  assert.ok(counts.all > 50, "the snapshot has Barcelona activities");
  for (const [locale, where] of [["ca", "a Barcelona"], ["es", "en Barcelona"], ["en", "in Barcelona"]] as const) {
    const facts = zoneFacts(barcelona, locale, agendas, where);
    const by = Object.fromEntries(facts.rows.map((r) => [r.key, r]));
    assert.deepEqual(facts.rows.map((r) => r.key).slice(0, 3), ["dates", "agenda", "fairs"], locale);
    assert.equal(by.dates!.value, datesText(window, locale));
    assert.ok(by.agenda!.value.startsWith(`${counts.all} (`), `${locale}: ${by.agenda!.value}`);
    assert.ok(by.agenda!.value.includes(String(counts.free)) && by.agenda!.value.includes(String(counts.music)), locale);
    const newest = [agendas.gencat, agendas.bcn].map((s) => s.read!.fetchedAt).sort().at(-1)!;
    assert.ok(by.read!.value.includes(stamp(newest, locale)), `${locale}: read time ${stamp(newest, locale)}`);
    assert.ok(by.read!.value.includes(stamp(SNAPSHOT.readOn, locale)), `${locale}: fairs calendar read date`);
    assert.equal(by.sources!.links!.length, 3, `${locale}: Guia Barcelona, the Generalitat's agenda and the fairs calendar`);
    assert.ok(by.sources!.links!.every((l) => /^https:\/\//.test(l.href)), locale);
    assert.ok(by.sources!.links!.some((l) => /Guia Barcelona/.test(l.label)), locale);
    for (const row of facts.rows) assert.doesNotMatch(row.value + row.label, BAD, `${locale}/${row.key}`);
    assert.doesNotMatch(JSON.stringify(facts.faq), BAD, locale);
  }
});

test("a snapshot read is written as the last read, not as live", () => {
  const facts = zoneFacts(zoneById("barcelona"), "en", agendas, "in Barcelona");
  assert.match(facts.rows.find((r) => r.key === "read")!.value, /last read on/);
  assert.match(zoneFacts(zoneById("barcelona"), "ca", agendas, "a Barcelona").rows.find((r) => r.key === "read")!.value, /darrera lectura/);
  assert.match(zoneFacts(zoneById("barcelona"), "es", agendas, "en Barcelona").rows.find((r) => r.key === "read")!.value, /última lectura/);
});

test("an unread agenda is said to be unread, never empty, and no activity count or activity question appears", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const facts = hubFacts(locale, nothing, "x");
    const agenda = facts.rows.find((r) => r.key === "agenda")!.value;
    assert.match(agenda, /No hem pogut|No hemos podido|We cannot read/, locale);
    assert.doesNotMatch(agenda, /\d+ \(/, locale);
    assert.match(facts.rows.find((r) => r.key === "read")!.value, /sense lectura|sin lectura|no read/, locale);
    assert.ok(facts.faq.length >= 2, `${locale}: fairs and sources are answerable`);
    assert.ok(!facts.faq.some((f) => /activitats|actividades|activities|What is on/.test(f.question)), `${locale}: no activities question`);
  }
});

test("hub FAQ: fairs named exactly as the calendar lists them, at most three, with the count", () => {
  const { now } = listedFairs(null, window);
  for (const locale of ["ca", "es", "en"] as const) {
    const facts = hubFacts(locale, agendas, locale === "en" ? "in Catalonia" : locale === "es" ? "en Cataluña" : "a Catalunya");
    const fairs = facts.faq.find((f) => /fires|ferias|fairs/i.test(f.question))!;
    assert.ok(fairs, locale);
    if (now.length === 0) {
      assert.match(fairs.answer, /no en té cap|no tiene ninguna|has none/, locale);
    } else {
      assert.ok(fairs.answer.includes(String(now.length)), locale);
      for (const f of now.slice(0, 3)) assert.ok(fairs.answer.includes(f.name), `${locale}: ${f.name}`);
      if (now.length > 3) assert.ok(!fairs.answer.includes(now[3]!.name), `${locale}: capped at three`);
    }
    assert.ok(fairs.answer.includes(stamp(SNAPSHOT.readOn, locale)), `${locale}: fairs read date`);
  }
});

test("the activities answer carries the count, the span of dates and the read time of the page's own list", () => {
  const items = agendas.gencat.read!.items;
  const counts = buildView(items, window, TODAY).counts;
  for (const locale of ["ca", "es", "en"] as const) {
    const facts = hubFacts(locale, agendas, "x");
    const answer = facts.faq[0]!.answer;
    assert.ok(answer.includes(`${counts.all} `), locale);
    assert.ok(answer.includes(spanText(window, locale)), locale);
    assert.ok(answer.includes(stamp(agendas.gencat.read!.fetchedAt, locale)), locale);
  }
  assert.match(spanText(window, "ca"), /^entre el divendres 20 de novembre i el diumenge 22 de novembre de 2026$/);
  assert.match(spanText(window, "en"), /^from Friday 20 November to Sunday 22 November 2026$/);
});

test("FAQPage JSON-LD is the visible FAQ, question by question, and absent below two questions", () => {
  const facts = hubFacts("es", agendas, "en Cataluña");
  const node = weekendFaqNode(facts.faq) as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  assert.equal(node["@type"], "FAQPage");
  assert.deepEqual(
    node.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
    facts.faq.map((f) => [f.question, f.answer]),
  );
  assert.equal(weekendFaqNode([]), null);
  const one = weekendFacts({ locale: "ca", where: "x", window, today: TODAY, sources: [], items: [], fairs: [], christmasTowns: 0 });
  assert.ok(one.faq.length >= 2 || one.faq.length === 0);
});

test("a long weekend says so in the heading and the questions", () => {
  const long = { ...window, long: true };
  const facts = hubFacts("en", { ...agendas, window: long }, "in Catalonia");
  assert.equal(facts.heading, "Key facts for this long weekend");
  assert.match(facts.faq[0]!.question, /long weekend/);
  assert.match(facts.faq.find((f) => /fairs/.test(f.question))!.question, /long weekend/);
  assert.equal(hubFacts("ca", { ...agendas, window: long }, "x").heading, "Dades clau del pont");
});

test("pages: one facts table and one FAQ per page, JSON-LD from the same items, no second FAQ source", () => {
  const dir = join(ROOT, "src/components/programmatic/weekend");
  for (const file of ["HubPage.tsx", "ZonePage.tsx", "EnglishWeekend.tsx"]) {
    const source = readFileSync(join(dir, file), "utf8");
    const tables = source.match(/<WeekendFactsTable\b/g) ?? [];
    const faqs = source.match(/<WeekendFaq\b/g) ?? [];
    const expected = file === "EnglishWeekend.tsx" ? 2 : 1;
    assert.equal(tables.length, expected, `${file}: facts tables`);
    assert.equal(faqs.length, expected, `${file}: FAQs`);
  }
  const routes = readFileSync(join(dir, "routes.tsx"), "utf8");
  assert.equal((routes.match(/weekendFaqNode\(/g) ?? []).length, 2, "hub and zone JSON-LD");
  assert.equal((readFileSync(join(dir, "EnglishWeekend.tsx"), "utf8").match(/weekendFaqNode\(facts\.faq\)/g) ?? []).length, 2, "English hub and Barcelona JSON-LD");
  assert.ok(!/faq/i.test(readFileSync(join(dir, "AgendaList.tsx"), "utf8")), "no other FAQ in the agenda list");
});

test("sources FAQ: says the page keeps the last read when the source does not answer, and refreshes hourly only when live", () => {
  const live = { ...agendas, gencat: { ...agendas.gencat, status: "live" as const }, bcn: { ...agendas.bcn, status: "live" as const } };
  const heldRe = { ca: /la font no respon ara i la pàgina en manté aquesta lectura/, es: /la fuente no responde ahora y la página mantiene esa lectura/, en: /the source is not answering now, so the page keeps that read/ };
  const liveRe = { ca: /l'actualitza cada hora/, es: /la actualiza cada hora/, en: /refreshes it every hour/ };
  const question = { ca: "D'on surt aquesta informació i quan s'ha llegit?", es: "¿De dónde sale esta información y cuándo se ha leído?", en: "Where does this information come from and when was it read?" };
  const answer = (locale: "ca" | "es" | "en", a: typeof agendas) => hubFacts(locale, a, "x").faq.find((f) => f.question === question[locale])?.answer ?? "";
  for (const locale of ["ca", "es", "en"] as const) {
    const h = answer(locale, agendas);
    assert.match(h, heldRe[locale], `${locale}: held`);
    assert.match(h, /(?:cada hora|every hour)/, `${locale}: still says it retries hourly`);
    assert.doesNotMatch(h, liveRe[locale], `${locale}: a held read is not "refreshed every hour"`);
    const l = answer(locale, live);
    assert.match(l, liveRe[locale], `${locale}: live`);
    assert.doesNotMatch(l, heldRe[locale], `${locale}: live`);
  }
});
