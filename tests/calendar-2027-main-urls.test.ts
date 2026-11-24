import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BOE_2027_ROWS, REGIONS, type Region } from "../src/lib/programmatic/holidays/boe-2027.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { COMMON_DATES, commonWorkingDays, communityWorkingDays, monthRows, variableDates, workingDaysByMonth } from "../src/lib/programmatic/spain-2027/calendar.ts";
import { names } from "../src/lib/programmatic/spain-2027/communities.ts";
import { communityDescription, communityH1, communityTitle, hubFaq, substitutionDates, workingDayFigures } from "../src/lib/programmatic/spain-2027/copy.ts";
import { communityH1Intl, communityTitleIntl, hubFaqIntl } from "../src/lib/programmatic/spain-2027/copy-intl.ts";
import { editionHubPath, editionNames } from "../src/lib/programmatic/spain-2027/editions.ts";
import { SPAIN_MAIN, mainElsewhere, regionsWithMainElsewhere } from "../src/lib/programmatic/spain-2027/main-urls.ts";
import { spainHubPath } from "../src/lib/programmatic/spain-2027/paths.ts";
import { BOE_REF } from "../src/lib/programmatic/spain-2027/sources.ts";

/**
 * "Calendario laboral 2027", 24 Nov 2026 (docs/SEO_EXPERIMENTS.md): the three
 * hubs answer more (official PDF, month by month, working days, questions)
 * and every page of the family links the main page of its search
 * (src/lib/programmatic/spain-2027/main-urls.ts).
 */

const src = (path: string) => readFileSync(join(import.meta.dirname, "..", path), "utf8");

/** Monday to Friday of 2027 outside `off`, counted here with Date, not with the site's helpers. */
function weekdaysOf2027(off: readonly string[] = []): number[] {
  const out = Array.from({ length: 12 }, () => 0);
  const skip = new Set(off);
  for (let d = new Date(Date.UTC(2027, 0, 1)); d.getUTCFullYear() === 2027; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6 || skip.has(iso)) continue;
    out[d.getUTCMonth()]!++;
  }
  return out;
}
const sum = (n: readonly number[]) => n.reduce((a, b) => a + b, 0);
/** A territory's column of the BOE table. */
const datesOf = (r: Region) => [...new Set(BOE_2027_ROWS.filter((row) => row.marks[r]).map((row) => row.date))];

test("main URLs: Spain's is the hub of each language; Catalonia's, the guide, with the head anchor", () => {
  assert.equal(SPAIN_MAIN.es, spainHubPath());
  assert.equal(SPAIN_MAIN.ca, editionHubPath("ca"));
  assert.equal(SPAIN_MAIN.en, editionHubPath("en"));
  assert.deepEqual(regionsWithMainElsewhere(), ["CT"]);
  for (const locale of ["ca", "es", "en"] as const) {
    assert.equal(mainElsewhere("CT", locale)!.href, GUIDES.workCalendar[locale]);
    assert.match(mainElsewhere("CT", locale)!.anchor, /2027/);
    for (const r of REGIONS) if (r !== "CT") assert.equal(mainElsewhere(r, locale), null, r);
  }
  assert.equal(mainElsewhere("CT", "es")!.anchor, "calendario laboral 2027 de Cataluña");
  assert.equal(mainElsewhere("CT", "ca")!.anchor, "calendari laboral 2027 de Catalunya");
});

test("Catalonia's community page keeps its title, H1 and description (live 7 Nov; not touched before 5 Dec)", () => {
  // A retitle is a candidate for after 5 Dec 2026, logged in docs/SEO_EXPERIMENTS.md. Change these lines with it.
  const c = names("CT");
  assert.equal(communityTitle(c), "Festivos 2027 en Cataluña: 12 días, puentes y fechas");
  assert.equal(communityH1(c), "Calendario laboral 2027 de Cataluña: festivos y puentes");
  assert.match(communityDescription(c), /^Cataluña tiene 12 festivos en 2027 \(BOE\): /);
  assert.equal(communityTitleIntl(editionNames("CT", "ca"), "ca"), "Festius 2027 a Catalunya: 12 dies, ponts i dates");
  assert.equal(communityH1Intl(editionNames("CT", "ca"), "ca"), "Calendari laboral 2027 de Catalunya: festius i ponts");
  assert.equal(communityTitleIntl(editionNames("CT", "en"), "en"), "Catalonia public holidays 2027: 12 days, long weekends");
  assert.equal(communityH1Intl(editionNames("CT", "en"), "en"), "Public holidays 2027 in Catalonia: work calendar and long weekends");
});

test("working days: counted from the BOE table, month by month", () => {
  assert.equal(sum(weekdaysOf2027()), 261);
  assert.deepEqual(workingDaysByMonth(COMMON_DATES), weekdaysOf2027(COMMON_DATES));
  assert.deepEqual(workingDaysByMonth(COMMON_DATES), [19, 20, 22, 22, 21, 22, 22, 22, 22, 20, 21, 21]);
  assert.equal(commonWorkingDays(), 254);
  const rows = monthRows();
  assert.equal(rows.length, 12);
  assert.equal(sum(rows.map((m) => m.workingDays)), commonWorkingDays());
  // Every BOE date sits in exactly one month row.
  assert.equal(sum(rows.map((m) => m.common.length)), COMMON_DATES.length);
  assert.equal(sum(rows.map((m) => m.variable.length)), variableDates().length);
  for (const m of rows) for (const r of m.common) assert.equal(Number(r.date.slice(5, 7)), m.month);

  const perRegion = REGIONS.map((r) => communityWorkingDays(r));
  for (const r of REGIONS) assert.equal(communityWorkingDays(r), sum(weekdaysOf2027(datesOf(r))), r);
  const w = workingDayFigures();
  assert.deepEqual(w, { weekdays: 261, common: 254, min: Math.min(...perRegion), max: Math.max(...perRegion) });
  assert.ok(w.min >= 261 - 12 && w.max <= w.common);
});

test("hub questions: seven per language, each answered from the data", () => {
  const es = hubFaq();
  assert.equal(es.length, 7);
  for (const locale of ["ca", "en"] as const) assert.equal(hubFaqIntl(locale).length, es.length, locale);
  for (const f of [...es, ...hubFaqIntl("ca"), ...hubFaqIntl("en")]) {
    assert.ok(f.question.endsWith("?"), f.question);
    assert.ok(f.answer.length > 80, f.question);
    assert.doesNotMatch(f.answer, /undefined|NaN|\$\{/, f.question);
  }
  // Article 37.2 of the Workers' Statute (BOE-A-2015-11430): "no podrán exceder de catorce al año, de las cuales dos serán locales".
  assert.match(es[0]!.answer, /14 como máximo, el tope del artículo 37\.2 del Estatuto de los Trabajadores/);
  // The official text, by its BOE id.
  assert.ok(es[1]!.answer.includes(BOE_REF.ref));
  assert.match(BOE_REF.pdf, /^https:\/\/www\.boe\.es\/boe\/dias\/2026\/10\/13\/pdfs\/BOE-A-2026-21254\.pdf$/);
});

test("15 August 2027 is a Sunday, absent from the BOE table; the Monday and Extremadura's 11 October replace it", () => {
  assert.equal(new Date(Date.UTC(2027, 7, 15)).getUTCDay(), 0);
  for (const r of REGIONS) assert.ok(!datesOf(r).includes("2027-08-15"), r);
  const subs = substitutionDates();
  assert.deepEqual(
    subs.map((s) => s.date),
    ["2027-08-16", "2027-10-11"],
  );
  // BOE-A-2026-21254: "16 Lunes siguiente a asunción de la Virgen" in six columns, "11 Sustitución 15 de agosto" in one.
  assert.deepEqual(subs[0]!.regions, ["AN", "AR", "AS", "CN", "CL", "MD"]);
  assert.deepEqual(subs[1]!.regions, ["EX"]);
  const answer = hubFaq().find((f) => f.question.includes("15 de agosto"))!.answer;
  for (const name of ["Andalucía", "Aragón", "Asturias", "Canarias", "Castilla y León", "Madrid", "Extremadura"]) assert.ok(answer.includes(name), name);
});

test("pages: the three hubs print the month table, the PDF and the questions; lists and day pages link the main pages", () => {
  const es = src("src/components/programmatic/spain-2027/pages.tsx");
  const intl = src("src/components/programmatic/spain-2027/pages-intl.tsx");
  for (const [page, ids] of [
    [es, ["meses", "preguntas"]],
    [intl, ["mesos", "preguntes"]],
  ] as const) {
    for (const id of ids) {
      assert.ok(page.includes(`<h2 id="${id}">`), id);
      assert.ok(page.includes(`href="#${id}"`), id);
    }
    assert.ok(page.includes("href={BOE_REF.pdf}"));
    assert.ok(page.includes("regionsWithMainElsewhere().map"));
    assert.ok(page.includes("communityWorkingDays(c.region)"));
  }
  // FAQ markup only where the questions are printed.
  assert.match(src("src/components/programmatic/spain-2027/routes.tsx"), /faqSchema\(\[\{ type: "faq", items: hubFaq\(\) \}\]\)/);
  assert.match(src("src/components/programmatic/spain-2027/routes-intl.tsx"), /hubFaqIntl\(/);
  // Day pages: breadcrumb and footer go to the year's hub in their language.
  const days = src("src/components/programmatic/spain-2027/days.tsx");
  assert.ok(days.includes("href: SPAIN_MAIN[locale]"));
  assert.ok(days.includes("editionCommunityPath(locale, r)"));
  // The Catalonia guide links the Spain hub in the three languages.
  const guide = src("src/lib/content/holidays/copy.ts");
  for (const href of Object.values(SPAIN_MAIN)) assert.ok(guide.includes(`](${href})`), href);
});
