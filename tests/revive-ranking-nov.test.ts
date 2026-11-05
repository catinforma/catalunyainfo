import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { addDays, holidayOn } from "../src/lib/content/holidays/calendar.ts";
import { buildBody as workBody, workingDays, workingDaysByMonth } from "../src/lib/content/holidays/publish.ts";
import { buildBody as todayBody, tomorrowEves } from "../src/lib/content/holidays/today-publish.ts";
import { buildBody as schoolBody } from "../src/lib/content/school/publish.ts";
import { SKI } from "../src/lib/content/batch02/ski.ts";
import { toolsFor } from "../src/lib/content/home-tools.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/*
 * 5 Nov 2026, ranking push before the Nov-Jan peaks (docs/SEO_EXPERIMENTS.md):
 * work calendar month table, "is tomorrow a holiday" answered in the body,
 * the ES school Christmas callout, Vall de Núria's opening, ski on the homepage.
 */

type B = { type: string; text?: string; level?: number; caption?: string; rows?: string[][]; items?: unknown[] };

test("work calendar: 2027 month by month, right after the key facts, adding up to the year's working days", () => {
  const months = workingDaysByMonth();
  assert.equal(months.length, 12);
  assert.equal(months.reduce((a, b) => a + b, 0), workingDays().working);
  const title = { ca: /^Calendari 2027 mes a mes/, es: /^Calendario 2027 mes a mes/, en: /^2027 month by month/ } as const;
  for (const locale of LOCALES) {
    const body = workBody(locale) as B[];
    assert.ok(bodySchema.safeParse(body).success, locale);
    const at = body.findIndex((b) => b.type === "heading" && title[locale].test(b.text ?? ""));
    assert.ok(at > 0, `${locale}: month heading`);
    assert.equal(body[at - 1]?.type, "keyFacts", `${locale}: follows the key facts`);
    const table = body.slice(at).find((b) => b.type === "table");
    assert.equal(table?.rows?.length, 12, `${locale}: twelve months`);
    assert.deepEqual(table?.rows?.map((r) => Number(r[2])), months, `${locale}: working days per month`);
    // Every one of the twelve holidays is linked to its date page.
    assert.equal(JSON.stringify(table?.rows).match(/\]\(\//g)?.length, 12, `${locale}: twelve linked dates`);
  }
});

test("is today a holiday: 'is tomorrow a holiday' is a heading with dated eves, and the FAQ answers it", () => {
  const today = "2026-11-05";
  for (const locale of LOCALES) {
    const eves = tomorrowEves(locale, today, "faq");
    assert.equal(eves.length, 4, locale);
    assert.match(eves[0]!, /7 (de )?(desembre|diciembre|December) 2026|7 de (desembre|diciembre) de 2026/, `${locale}: first eve is 7 Dec`);
    const body = todayBody(locale) as B[];
    assert.ok(bodySchema.safeParse(body).success, locale);
    const h = body.findIndex((b) => b.type === "heading" && /^(Demà és festiu|¿Mañana es festivo|Is tomorrow a holiday)/.test(b.text ?? ""));
    const firstH2 = body.findIndex((b) => b.type === "heading");
    assert.equal(h, firstH2, `${locale}: the first heading of the body`);
    assert.equal(body[h + 2]?.type, "list", `${locale}: the eves as a list`);
    const faq = JSON.stringify(body.find((b) => b.type === "faq"));
    assert.doesNotMatch(faq, /Lo dice la línea|Ho diu la línia|line in the box says/, `${locale}: no answer that only points at the box`);
  }
  // Every listed eve is the day before a Catalonia-wide holiday, for every day to the end of 2027.
  for (let iso = "2026-01-01"; iso <= "2027-12-24"; iso = addDays(iso, 7)) {
    for (const item of tomorrowEves("en", iso, "faq")) {
      const m = item.match(/(\d+) (\w+) (\d{4})/);
      assert.ok(m, item);
      const date = new Date(`${m[1]} ${m[2]} ${m[3]} 12:00 UTC`).toISOString().slice(0, 10);
      assert.ok(date >= iso, `${iso}: ${item} is not in the past`);
      assert.ok(holidayOn(addDays(date, 1)), `${iso}: ${item} is an eve`);
    }
  }
});

test("school calendar (es): the Christmas callout uses the searchers' words", () => {
  const body = schoolBody("es") as { type: string; title?: string }[];
  assert.match(body.find((b) => b.type === "callout")?.title ?? "", /^Vacaciones de Navidad \d{4}-\d{4} en los colegios de Cataluña$/);
});

test("ski: Vall de Núria's 2026-27 calendar (read 5 Nov 2026), Baqueira's season pass after 1 Nov, homepage from 1 Nov", () => {
  const faq = { ca: /^Quan obre la Vall de Núria/, es: /^¿Cuándo abre la Vall de Núria/, en: /^When does Vall de Núria open/ } as const;
  for (const locale of LOCALES) {
    const blocks = SKI.editions[locale].blocks as B[];
    const items = (blocks.find((b) => b.type === "faq")?.items ?? []) as { question: string }[];
    assert.ok(items.some((q) => faq[locale].test(q.question)), `${locale}: Núria FAQ`);
    const text = bodyToPlainText(SKI.editions[locale].blocks);
    assert.doesNotMatch(text, /1\.300 € (fins|hasta)|€1,300 until/, `${locale}: Baqueira's early price is over`);
  }
  assert.ok(toolsFor("es", "2026-11-05").includes("ski"));
  assert.ok(!toolsFor("es", "2026-10-31").includes("ski"));
});
