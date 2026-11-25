import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHubBody, buildRegionBody, christmasWhenSentence } from "../src/lib/content/school-spain/body.ts";
import { SPAIN_REGIONS, hubRegions, pendingRegions } from "../src/lib/content/school-spain/regions.ts";
import { alternatives, breakDaysAll, weekdayDay } from "../src/lib/content/school-spain/logic.ts";
import { faqSchema } from "../src/lib/seo/jsonld.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026: the hub owns "cuando dan / son / empiezan las vacaciones de
 * navidad 2026". Its first screen carries a sentence and a compact table
 * computed from the records of data.ts; every cell is recomputed here from
 * the records, none is a typed date.
 */

type Box = { type: string; level?: number; text?: string; headers?: string[]; rows?: string[][]; items?: { question: string; answer: string }[] };

const LOCALES: Locale[] = ["es", "ca", "en"];

test("hub first screen: H2, one sentence with the earliest and latest last day, compact table, before the live panel", () => {
  const h2Text = {
    es: /^¿Cuándo dan las vacaciones de Navidad 2026 en España\?$/,
    ca: /^Quan són les vacances de Nadal 2026/,
    en: /^When do the 2026 Christmas school holidays start in Spain\?$/,
  };
  for (const locale of LOCALES) {
    const hub = buildHubBody(locale) as Box[];
    const h2 = hub.findIndex((b) => b.type === "heading" && b.level === 2);
    assert.equal(h2, 1, `${locale}: H2 right after the lead`);
    assert.match(hub[h2]!.text!, h2Text[locale]);
    assert.equal(hub[h2 + 1]!.text, christmasWhenSentence(hubRegions(locale)));
    assert.equal(hub[h2 + 2]!.type, "table");
    assert.ok(h2 + 2 < hub.findIndex((b) => b.type === "spainSchoolCalendar"), `${locale}: before the live panel`);

    const regions = hubRegions(locale);
    const lasts = regions.flatMap((r) => breakDaysAll(r, "christmas").map((x) => x.days.last)).sort();
    const backs = regions.flatMap((r) => breakDaysAll(r, "christmas").map((x) => x.days.back)).sort();
    const sentence = hub[h2 + 1]!.text!;
    assert.ok(sentence.includes(weekdayDay(lasts[0]!, locale)), `${locale}: earliest last day in the sentence`);
    assert.ok(sentence.includes(weekdayDay(lasts.at(-1)!, locale)), `${locale}: latest last day in the sentence`);
    assert.ok(sentence.includes(String(Number(backs[0]!.slice(8)))), `${locale}: first day back`);
    assert.ok(sentence.includes(weekdayDay(backs.at(-1)!, locale).replace(/^\S+ /, "")), `${locale}: last day back`);
  }
});

test("hub compact table is pinned to the records: every community, province alternatives, nothing typed", () => {
  for (const locale of LOCALES) {
    const hub = buildHubBody(locale) as Box[];
    const table = hub.find((b) => b.type === "table")!;
    assert.equal(table.headers!.length, 3);
    assert.equal(table.rows!.length, hubRegions(locale).length + pendingRegions(locale).length);
    for (const r of hubRegions(locale)) {
      const row = table.rows!.find((x) => x[0]!.startsWith(`[${r.short}](`));
      assert.ok(row, `${locale} ${r.slug}: row`);
      const all = breakDaysAll(r, "christmas");
      assert.ok(row[1]!.startsWith(alternatives(all.map((x) => x.days.last), locale)), `${locale} ${r.slug}: last day`);
      assert.ok(row[2]!.startsWith(alternatives(all.map((x) => x.days.back), locale)), `${locale} ${r.slug}: back`);
    }
    // Rows run from the earliest last day to the latest.
    const key = (row: string[]) => {
      const r = hubRegions(locale).find((x) => row[0]!.startsWith(`[${x.short}](`));
      return r ? breakDaysAll(r, "christmas").map((x) => x.days.last).sort()[0]! : "9999";
    };
    const keys = table.rows!.map(key);
    assert.deepEqual(keys, [...keys].sort(), locale);
  }
  // Andalucía's provinces differ: last day and return are alternatives by province.
  const es = (buildHubBody("es") as Box[]).find((b) => b.type === "table")!;
  const andalucia = es.rows!.find((r) => r[0]!.includes("calendario-escolar-andalucia"))!;
  assert.match(andalucia[1]!, /\(según la provincia\)$/);
  assert.match(andalucia[2]!, /\(según la provincia\)$/);
  assert.ok(es.rows!.every((r) => r.every((c) => c.length > 0)));
});

test("hub: exactly one visible FAQ block, so one FAQPage whose questions are the ones printed", () => {
  for (const locale of LOCALES) {
    const hub = buildHubBody(locale) as Box[];
    const faqs = hub.filter((b) => b.type === "faq");
    assert.equal(faqs.length, 1, locale);
    const schema = faqSchema(hub as never) as unknown as { "@type": string; mainEntity: { name: string }[] };
    assert.equal(schema["@type"], "FAQPage");
    assert.deepEqual(schema.mainEntity.map((q) => q.name), faqs[0]!.items!.map((i) => i.question));
  }
});

test("every community page's Spain-wide line links the hub with the query words", () => {
  const link = "[vacaciones de Navidad 2026 en toda España](/es/guias/calendario-escolar-espana/)";
  for (const r of SPAIN_REGIONS) assert.ok(JSON.stringify(buildRegionBody(r)).includes(link), r.slug);
});
