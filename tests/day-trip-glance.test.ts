import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { ANDORRA } from "../src/lib/content/batch02/andorra.ts";
import { GLANCE_READ, GLANCE_REREAD_BY, type GlanceKey } from "../src/lib/content/batch02/day-trip-glance.ts";
import { GIRONA } from "../src/lib/content/batch02/day-trips.ts";
import { FIGUERES } from "../src/lib/content/batch02/figueres.ts";
import { NURIA } from "../src/lib/content/batch02/nuria.ts";
import { PORTAVENTURA } from "../src/lib/content/batch02/portaventura.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Day-trip guides, 25 Nov 2026: the dated transport re-read line sits under the
 * first callout near the top, Núria and PortAventura carry a compact
 * "how / journey / fare / source" table, and the PortAventura calendar follows
 * the feed (hours for 2027 now published; the closure ends on 18 Feb).
 * Facts read that day: Rodalies' journey planner, Renfe's open GTFS, FGC
 * Turistren, PortAventura World's calendar feed and tickets page, the Dalí
 * Foundation, tarragona.cat, Andbus and Direct Bus (see day-trip-glance.ts).
 */

type B = { type: string; lead?: boolean; tone?: string; title?: string; text?: string; caption?: string; headers?: string[]; rows?: string[][]; note?: string; items?: { question: string; answer: string }[] };
type Article = { editions: Record<string, { blocks: unknown; seoTitle: string; seoDescription: string }> };
const blocks = (a: Article, locale: string) => a.editions[locale]!.blocks as B[];

const ARTICLES: Record<GlanceKey, Article> = { girona: GIRONA, figueres: FIGUERES, tarragona: TARRAGONA, andorra: ANDORRA, portaventura: PORTAVENTURA, nuria: NURIA };
const DATE = { ca: "25 de novembre de 2026", es: "25 de noviembre de 2026", en: "25 November 2026" } as const;

test("every guide says, near the top, that its transport was re-read on 25 Nov 2026", () => {
  assert.equal(GLANCE_READ, "2026-11-25");
  for (const [key, article] of Object.entries(ARTICLES)) {
    for (const locale of LOCALES) {
      const bl = blocks(article, locale);
      const leadAt = bl.findIndex((b) => b.type === "paragraph" && b.lead);
      assert.ok(leadAt >= 0, `${key}/${locale}: lead`);
      const callouts = bl.slice(leadAt + 1, leadAt + 5).filter((b) => b.type === "callout" && b.tone === "official");
      assert.ok(callouts.length >= 1, `${key}/${locale}: official callout within four blocks of the lead`);
      assert.ok(callouts.some((c) => c.text!.includes(DATE[locale])), `${key}/${locale}: callout carries ${DATE[locale]}`);
    }
  }
});

test("the lead, title and description are untouched by the glance (only the PortAventura correction moves them)", () => {
  for (const [key, article] of Object.entries(ARTICLES)) {
    if (key === "portaventura") continue;
    for (const locale of LOCALES) {
      const lead = blocks(article, locale).find((b) => b.type === "paragraph" && b.lead)!;
      assert.ok(!lead.text!.includes("25 de novembre") && !lead.text!.includes("25 de noviembre") && !lead.text!.includes("25 November"), `${key}/${locale}: lead unchanged`);
    }
  }
});

test("Girona: the new callout is right after the lead and holds no clock time (clock times live in tables only)", () => {
  for (const locale of LOCALES) {
    const bl = blocks(GIRONA, locale);
    const leadAt = bl.findIndex((b) => b.type === "paragraph" && b.lead);
    assert.equal(bl[leadAt + 1]!.type, "callout", `${locale}: callout after the lead`);
    const text = bodyToPlainText([bl[leadAt + 1]] as never);
    assert.doesNotMatch(text, /(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: no clock time`);
    assert.match(text, /23/, `${locale}: 23 R11 trains`);
    assert.match(text, /39/, `${locale}: 39 minutes`);
    assert.match(text, /8[.,]95/, `${locale}: R11 fare`);
  }
});

test("Núria and PortAventura: compact transport table with four columns and a read date", () => {
  for (const [article, caption] of [[NURIA, /Núria/], [PORTAVENTURA, /PortAventura/]] as const) {
    for (const locale of LOCALES) {
      const bl = blocks(article, locale);
      const leadAt = bl.findIndex((b) => b.type === "paragraph" && b.lead);
      const t = bl.slice(leadAt + 1, leadAt + 4).find((b) => b.type === "table");
      assert.ok(t, `${locale}: table within three blocks of the lead`);
      assert.equal(t!.headers!.length, 4, `${locale}: four columns`);
      assert.match(t!.caption!, caption);
      assert.ok(t!.rows!.every((r) => r.length === 4), `${locale}: rectangular`);
      assert.ok(t!.rows!.every((r) => /\]\(https:\/\//.test(r[3]!)), `${locale}: every row names and links its source`);
      assert.match(t!.note!, /25/, `${locale}: read date`);
    }
  }
  const nuria = JSON.stringify(blocks(NURIA, "en").find((b) => b.type === "table" && b.headers!.length === 4)!.rows);
  for (const fact of ["€34", "€31", "40 minutes", "30 November 2026", "Sant Martí de Centelles", "50%"]) assert.ok(nuria.includes(fact), `Núria: ${fact}`);
  const pa = JSON.stringify(blocks(PORTAVENTURA, "en").find((b) => b.type === "table" && b.headers!.length === 4)!.rows);
  for (const fact of ["1 h 24", "8:33", "10:33", "12:33", "€9.35", "69 min + 13 min", "€2.70", "From €43", "€37 online"]) assert.ok(pa.includes(fact), `PortAventura: ${fact}`);
});

test("no source link in a glance table points off the operators' own pages", () => {
  const allowed = /^\]?\(https:\/\/(rodalies\.gencat\.cat|turistren\.cat|www\.portaventuraworld\.com)\//;
  for (const article of [NURIA, PORTAVENTURA]) {
    for (const locale of LOCALES) {
      const t = blocks(article, locale).find((b) => b.type === "table" && b.headers!.length === 4)!;
      for (const row of t.rows!) {
        const url = row[3]!.slice(row[3]!.indexOf("]") + 1);
        assert.match(url, allowed, `${locale}: ${row[3]}`);
      }
    }
  }
});

test("PortAventura calendar: closed to 18 Feb, reopens 19 Feb with Friday evenings and weekends, daily from 18 Mar; hours no longer 'not yet published'", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(PORTAVENTURA.editions[locale].blocks);
    assert.doesNotMatch(text, /hours not yet published|horario aún no publicado|horari encara no publicat|aún sin horario|encara sense horari/, `${locale}: stale 'no hours' wording`);
    assert.doesNotMatch(text, /closed from 7 January to 19 February|cerrado del 7 de enero al 19 de febrero|tancat del 7 de gener al 19 de febrer|cierra del 7 de enero al 19 de febrero|tanca del 7 de gener al 19 de febrer/i, `${locale}: closure ends on 18 Feb`);
    const cal = blocks(PORTAVENTURA, locale).find((b) => b.type === "table" && /10:30/.test(JSON.stringify(b.rows)) && b.headers!.length === 2)!;
    const rows = JSON.stringify(cal.rows);
    assert.match(rows, /16:00(–| a )21:00/);
    assert.match(rows, /18 (Feb|feb|febr) 2027/);
    assert.match(rows, /10:30/);
    assert.match(cal.note!, /25/);
  }
  assert.ok(PORTAVENTURA.editions.en.seoDescription.length <= 155);
  assert.ok(PORTAVENTURA.editions.es.seoDescription.length <= 155);
  assert.ok(PORTAVENTURA.editions.ca.seoDescription.length <= 155);
});

test("date guard: each guide's figures are re-read by its date (Núria's fares end on 30 Nov 2026)", () => {
  for (const [key, by] of Object.entries(GLANCE_REREAD_BY)) {
    assert.ok(
      Date.now() < Date.parse(`${by}T00:00:00Z`),
      `${key}: transport, fares and (PortAventura) calendar were last read on ${GLANCE_READ}. Re-read them (Rodalies planner, Renfe GTFS, FGC Turistren, PortAventura feed, operators), update day-trip-glance.ts NOTE/TABLES and move GLANCE_REREAD_BY.${key}.`,
    );
  }
  assert.ok(GLANCE_REREAD_BY.nuria > "2026-11-30", "Núria's fares are valid until 30 Nov 2026");
});
