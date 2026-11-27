import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { NURIA } from "../src/lib/content/batch02/nuria.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Núria, 27 Nov 2026 (batch 8V): FGC's winter 2026-27 leaflet ("vigents fins a
 * 30 de novembre de 2027") replaces the 2026 fares from 1 Dec; the 2026 ones
 * stay in the note until they lapse. Low-season winter timetable = autumn rows
 * + the 8.35 that runs only when the ski area is open; December calendar (high
 * 5-8 and 26-31, special 25); "Despertem els tions" on 5, 29 and 30 Dec.
 */

type B = { type: string; caption?: string; rows?: string[][]; note?: string; title?: string; text?: string };
const blocks = (locale: (typeof LOCALES)[number]) => NURIA.editions[locale].blocks as B[];

test("Núria: winter 2026-27 fares in the fares table, 2026 fares kept in its note", () => {
  assert.equal(NURIA.verifiedAt, "2026-11-27");
  const adult = { ca: ["35,50 €", "32,50 €", "24,50 €", "22,50 €"], es: ["35,50 €", "32,50 €", "24,50 €", "22,50 €"], en: ["€35.50", "€32.50", "€24.50", "€22.50"] } as const;
  for (const locale of LOCALES) {
    const t = blocks(locale).find((b) => b.type === "table" && /2026-2027|2026-27/.test(b.caption ?? "") && b.rows!.length === 4)!;
    assert.ok(t, `${locale}: winter fares table`);
    assert.deepEqual(t.rows![0]!.slice(1), [...adult[locale]], `${locale}: adult row`);
    assert.match(t.note!, /2027/, `${locale}: validity printed`);
    assert.match(t.note!, /34/, `${locale}: 2026 fare until 30 Nov`);
  }
});

test("Núria: winter low-season timetable adds the 8.35 ski-day train; Friday trains skip 25 Dec", () => {
  for (const locale of LOCALES) {
    const up = blocks(locale).find((b) => b.type === "table" && b.rows!.some((r) => r[0] === "7.30*"))!;
    const ski = up.rows!.find((r) => r[0]!.startsWith("8.35"));
    assert.ok(ski, `${locale}: 8.35 row`);
    assert.equal(ski![1], "9.14");
    assert.match(ski![0]!, /esquí|ski/, `${locale}: 8.35 is ski-days only`);
    assert.ok(up.rows!.some((r) => r[0]!.startsWith("18.05") && /25/.test(r[0]!)), `${locale}: Friday rows exclude 25 Dec`);
    assert.match(up.note!, /27/, `${locale}: read date`);
  }
});

test("Núria: December section (calendar, ski opening, Despertem els tions) in ca/es/en", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(NURIA.editions[locale].blocks);
    assert.match(text, /5 (al|to) 8 (i|y|and) (del |from )?26 (al|to) 31/, `${locale}: December high season`);
    assert.match(text, /4 (de )?(desembre|diciembre|December) (del |de )?2026/, `${locale}: ski opening`);
    assert.match(text, /Despertem els tions/, `${locale}: tions`);
    assert.match(text, /(18 €|€18)/, `${locale}: tions price`);
    assert.doesNotMatch(text, /només divendres|solo viernes|Fridays only/, `${locale}: stale Friday label`);
    assert.doesNotMatch(text, /primavera-estiu-tardor 2026, llegit|primavera-verano-otoño 2026, leído|spring-summer-autumn 2026 leaflet, read/, `${locale}: stale leaflet note`);
    assert.ok(NURIA.editions[locale].seoDescription.length <= 155, `${locale}: description fits`);
  }
});
