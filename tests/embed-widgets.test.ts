import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_EMBED_LOCALES, netSalaryEmbedPath, workingDaysEmbedPath } from "../src/lib/programmatic/embed-calc/paths.ts";
import { netSalaryInput, renderNetSalaryEmbed } from "../src/lib/programmatic/embed-calc/net-salary.ts";
import { monthlyWorkingDays, renderWorkingDaysEmbed, workingDaysPlace, workingDaysPlaceIds, workingDaysQuery } from "../src/lib/programmatic/embed-calc/working-days.ts";
import { calcEmbedResponse } from "../src/lib/programmatic/embed-calc/response.ts";
import { EMBED_LOCALES, attributionPath, embedPath, embedTownPath, pickerGroups, resolveEmbedTown, type EmbedPlace } from "../src/lib/programmatic/embed-2027/places.ts";
import { embedModel, esc, renderEmbed } from "../src/lib/programmatic/embed-2027/render.ts";
import { iframeSnippet, linkSnippet } from "../src/lib/programmatic/embed-2027/snippet.ts";
import { SNAPSHOT, municipalities, unlistedTowns, yearRows } from "../src/lib/programmatic/holidays/data.ts";
import { CSV_COLUMNS, CSV_PATH, cataloniaPopulation, easterSunday, nextYearReport, nextYearTowns, reportCsv, thisYearReport, whitMonday } from "../src/lib/programmatic/holidays/report.ts";
import { REPORT_COPY, REPORT_SLUG, reportPath, reportSitemapEntries } from "../src/lib/programmatic/holidays/report-copy.ts";
import { calculateNetSalary, DEFAULT_INPUT } from "../src/lib/programmatic/net-salary/engine.ts";
import { money, netSalaryPath, writeHash } from "../src/lib/programmatic/net-salary/copy.ts";
import { countWorkingDays, deadline } from "../src/lib/programmatic/working-days/engine.ts";
import { NATIONAL_ID, dateText, workingDaysPath } from "../src/lib/programmatic/working-days/copy.ts";
import { calendarFor, pageFigures } from "../src/lib/programmatic/working-days/page.ts";
import { workingDaysData } from "../src/lib/programmatic/working-days/places.ts";
import { EMBED_CALC_SOURCE, EMBED_SOURCE } from "../src/lib/security-headers.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";
import { absoluteUrl } from "../src/lib/site.ts";

/**
 * The link-earning widgets of 18 Nov 2026: the 2026 holiday calendar for
 * Catalan towns, the embeddable calculators (lib/programmatic/embed-calc/),
 * the shared paste code (snippet.ts) and the local-holiday data report with
 * its CSV (lib/programmatic/holidays/report.ts).
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

/* -------------------------------------------------------------------------- */
/* Headers                                                                    */
/* -------------------------------------------------------------------------- */

type HeaderRule = { source: string; missing?: { type: string; value: string }[]; headers: { key: string; value: string }[] };
const require = createRequire(import.meta.url);
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match.js") as {
  getPathMatch: (source: string, options: object) => (path: string) => false | object;
};
const { modifyRouteRegex } = require("next/dist/lib/redirect-status.js") as { modifyRouteRegex: (regex: string) => string };
const matches = (source: string, path: string) =>
  Boolean(getPathMatch(source, { strict: true, removeUnnamedParams: true, regexModifier: (r: string) => modifyRouteRegex(r) })(path));

function effectiveHeaders(rules: HeaderRule[], path: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rule of rules) {
    if (!matches(rule.source, path)) continue;
    if (rule.missing?.some((m) => m.type === "host" && new RegExp(`^${m.value}$`).test("www.catalunyainfo.com"))) continue;
    for (const h of rule.headers) out.set(h.key.toLowerCase(), h.value);
  }
  return out;
}

test("headers: the calculators may be framed and submit to this origin only; the calendar may not submit; the site stays DENY", async () => {
  const saved = { VERCEL_ENV: process.env.VERCEL_ENV, NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING };
  Object.assign(process.env, { VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" });
  try {
    const { default: config } = await import(`${new URL("../next.config.ts", import.meta.url).href}?widgets`);
    const rules = (await config.headers()) as HeaderRule[];
    const calc = ["/embed/ca/calc/net-salary/", "/embed/es/calc/working-days/", "/embed/en/calc/working-days/madrid/madrid/"];
    for (const path of calc) {
      const h = effectiveHeaders(rules, path);
      const csp = h.get("content-security-policy") ?? "";
      assert.equal(h.get("x-frame-options"), undefined, path);
      assert.match(csp, /frame-ancestors \*/, path);
      assert.match(csp, /form-action 'self'/, path);
      assert.match(csp, /default-src 'none'/, path);
      assert.doesNotMatch(csp, /script-src|googletagmanager|google-analytics|connect-src/, `${path}: no script, no beacon`);
      assert.match(h.get("x-robots-tag") ?? "", /^noindex, indexifembedded$/, path);
    }
    for (const path of ["/embed/ca/2026/barcelona/", "/embed/es/2027/barcelona/"]) {
      assert.match(effectiveHeaders(rules, path).get("content-security-policy") ?? "", /form-action 'none'/, path);
    }
    for (const path of ["/ca/calculadores/sou-net/", "/es/calculadoras/dias-habiles/", "/ca/festius/dades-festius-locals/", CSV_PATH, "/ca/calc/net-salary/"]) {
      const h = effectiveHeaders(rules, path);
      assert.equal(h.get("x-frame-options"), "DENY", path);
      assert.match(h.get("content-security-policy") ?? "", /frame-ancestors 'none'/, path);
    }
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
  assert.ok(matches(EMBED_CALC_SOURCE, "/embed/ca/calc/working-days/barcelona/"));
  assert.ok(!matches(EMBED_CALC_SOURCE, "/embed/ca/2027/barcelona/"));
  assert.ok(matches(EMBED_SOURCE, "/embed/ca/calc/net-salary/"), "the calculators get the widget's headers first");
});

/* -------------------------------------------------------------------------- */
/* Paste code                                                                 */
/* -------------------------------------------------------------------------- */

test("snippet: an iframe, and outside it a plain followed link to the source page; both escaped", () => {
  const s = { origin: "https://www.catalunyainfo.com", embed: "/embed/ca/2027/barcelona/", page: "/ca/festius/barcelona/", title: 'Calendari "laboral" <2027>', height: 640 };
  const code = iframeSnippet(s);
  const [frame, link] = code.split("\n");
  assert.match(frame!, /^<iframe src="https:\/\/www\.catalunyainfo\.com\/embed\/ca\/2027\/barcelona\/" title="Calendari &quot;laboral&quot; &lt;2027&gt;" width="100%" height="640" style="border:0;max-width:520px" loading="lazy"><\/iframe>$/);
  // The link is after the closing </iframe>: in the host page's own HTML.
  assert.equal(link, '<p><a href="https://www.catalunyainfo.com/ca/festius/barcelona/">Calendari &quot;laboral&quot; &lt;2027&gt;</a> · CatalunyaInfo</p>');
  assert.equal(linkSnippet(s), '<a href="https://www.catalunyainfo.com/ca/festius/barcelona/">Calendari &quot;laboral&quot; &lt;2027&gt;</a>');
  assert.doesNotMatch(code, /nofollow|sponsored|ugc|sandbox/);
});

test("embed boxes: every town and city page carries the code inline, the calculators carry theirs", () => {
  const link = read("src/components/programmatic/embed-2027/WidgetLink.tsx");
  assert.match(link, /<details className="ci-embed-box/);
  assert.match(link, /iframeSnippet\(\{\s+origin: siteOrigin\(\),\s+embed: embedPath\(locale, place\),\s+page: attributionPath\(locale, place\)/);
  assert.match(link, /<Link href=\{widgetLinkFor\(locale, place\)\}>\{t\.boxMore\}<\/Link>/);
  assert.match(read("src/components/programmatic/net-salary/NetSalaryPage.tsx"), /<NetSalaryEmbedBox locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/working-days/WorkingDaysPage.tsx"), /<WorkingDaysEmbedPicker locale=\{locale\} data=\{data\} origin=\{siteOrigin\(\)\} \/>/);
  const box = read("src/components/programmatic/embed-calc/CalcEmbedBox.tsx");
  assert.match(box, /embed: netSalaryEmbedPath\(locale\), page: netSalaryPath\(locale\)/);
  const picker = read("src/components/programmatic/embed-calc/WorkingDaysEmbedPicker.tsx");
  assert.match(picker, /embed: workingDaysEmbedPath\(locale, value === NATIONAL_ID \? null : value\),\s+page: workingDaysPath\(locale\)/);
});

/* -------------------------------------------------------------------------- */
/* The 2026 holiday calendar                                                  */
/* -------------------------------------------------------------------------- */

test("2026 widget: every Catalan town, the DOGC order's days, no canonical, attribution to its page", () => {
  for (const locale of EMBED_LOCALES) {
    for (const m of municipalities()) {
      const place: EmbedPlace = { kind: "town", m };
      const model = embedModel(locale, place, 2026);
      assert.deepEqual(
        model.rows.map((r) => r.date),
        yearRows(m, 2026, locale).map((r) => r.date),
        `${locale} ${m.slug}`,
      );
      assert.ok(model.rows.every((r) => r.date.startsWith("2026-")), m.slug);
      assert.equal(model.page, attributionPath(locale, place));
      assert.ok(!isLowDemandPath(model.page), `${locale} ${m.slug}: lands on an indexed page`);
    }
  }
  const html = renderEmbed("ca", resolveEmbedTown("ca", "castelldefels")!, 2026);
  assert.match(html, /<title>Calendari laboral 2026 de Castelldefels<\/title>/);
  assert.ok(html.includes(SNAPSHOT.sources.localOrder.url), "the 2026 order");
  assert.ok(html.includes(SNAPSHOT.sources.localAmendments[0]!.url), "Castelldefels: corrected by Ordre EMT/3/2026");
  assert.ok(!html.includes(`rel="canonical"`));
  assert.doesNotMatch(html, /<script|<form|cookie|analytics/i);
  assert.equal(embedTownPath("es", "girona", 2026), "/embed/es/2026/girona/");
  // The picker offers 2026 for the Catalan towns' group only.
  for (const locale of EMBED_LOCALES) {
    const groups = pickerGroups(locale);
    assert.equal(groups.filter((g) => g.embedPrefix2026).length, 1, locale);
    assert.equal(groups[0]!.embedPrefix2026, `/embed/${locale}/2026/`);
  }
  assert.ok(existsSync(join(ROOT, "src/app/embed/[locale]/2026/[place]/route.ts")));
  assert.ok(!existsSync(join(ROOT, "src/app/embed/[locale]/2026/[place]/[city]")), "no 2026 city widget: the site lacks some cities' 2026 local days");
  assert.equal(embedPath("ca", { kind: "town", m: municipalities()[0]! }, 2026), `/embed/ca/2026/${municipalities()[0]!.slug}/`);
});

/* -------------------------------------------------------------------------- */
/* Net salary widget                                                          */
/* -------------------------------------------------------------------------- */

test("net salary widget: the page's engine, the full calculator's field names, every figure escaped", () => {
  // No query: the page's own example.
  assert.deepEqual(netSalaryInput(new URLSearchParams("")), calculateNetSalary(DEFAULT_INPUT).input);
  // The form's names are writeHash's: a round trip gives the same input back.
  const custom = { ...DEFAULT_INPUT, gross: 42000, payments: 12 as const, region: "madrid", children: 2, childrenUnder3: 1, family: 2 as const, contract: "fixed-term" as const, age: "65to74" as const };
  assert.deepEqual(netSalaryInput(new URLSearchParams(writeHash(custom).slice(1))), calculateNetSalary(custom).input);
  // What people type.
  assert.equal(netSalaryInput(new URLSearchParams("b=30.000")).gross, 30000);
  assert.equal(netSalaryInput(new URLSearchParams("b=30 000 €")).gross, 30000);
  for (const locale of CALC_EMBED_LOCALES) {
    const html = renderNetSalaryEmbed(locale, new URLSearchParams("b=30000&n=14&r=cataluna"));
    const r = calculateNetSalary(DEFAULT_INPUT);
    assert.match(html, new RegExp(`<form method="get" action="${netSalaryEmbedPath(locale)}">`));
    for (const name of ["b", "n", "r", "c", "f", "h", "u", "a"]) assert.match(html, new RegExp(`name="${name}"`), `${locale}: field ${name}`);
    assert.ok(!html.includes(`rel="canonical"`), locale);
    assert.ok(html.includes(`<footer>${{ ca: "Font:", es: "Fuente:", en: "Source:" }[locale]} <a href="${esc(absoluteUrl(netSalaryPath(locale)))}" target="_blank" rel="noopener">CatalunyaInfo</a></footer>`), locale);
    assert.ok(html.includes(`<strong>${esc(money(r.net.annual, locale))}</strong>`), `${locale}: net annual`);
    assert.ok(html.includes(`<strong>${esc(money(r.net.perPayment, locale))}</strong>`), `${locale}: net per payment`);
    assert.match(html, /sede\.agenciatributaria\.gob\.es/, `${locale}: the official service`);
    assert.doesNotMatch(html, /<script|<iframe|<img|cookie|gtag|analytics/i);
  }
  // Nothing typed reaches the page raw.
  const hostile = renderNetSalaryEmbed("es", new URLSearchParams('b=<script>alert(1)</script>&r="><img src=x>&n=<b>'));
  assert.doesNotMatch(hostile, /<script|<img src=x|"><img/);
  // Navarre and the Basque Country: not computed, their official pages instead.
  const foral = renderNetSalaryEmbed("ca", new URLSearchParams("b=30000&r=navarra"));
  assert.match(foral, /navarra\.es/);
  assert.doesNotMatch(foral, /<table aria-labelledby="res">/);
});

/* -------------------------------------------------------------------------- */
/* Working-days widget                                                        */
/* -------------------------------------------------------------------------- */

test("working-days widget: every place of the calculator, the same engine and the same counts", () => {
  for (const locale of CALC_EMBED_LOCALES) {
    const ids = workingDaysPlaceIds(locale);
    const data = workingDaysData(locale);
    assert.equal(ids.length, data.groups.reduce((a, g) => a + g.items.length, 0));
    assert.equal(workingDaysPlace(locale, undefined)?.[0], NATIONAL_ID);
    assert.equal(workingDaysPlace(locale, ["madrid", "madrid"])?.[0], "madrid/madrid");
    assert.equal(workingDaysPlace(locale, ["no-such-place"]), null);
    // The month table for all of Spain is the calculator page's own.
    const f = pageFigures(data, locale);
    const months = monthlyWorkingDays(calendarFor(data, NATIONAL_ID));
    assert.deepEqual(months.map((m) => [m.y2026, m.y2027]), f.monthly.map((m) => [m.y2026, m.y2027]), locale);
    // The page's worked example, through the widget's form.
    const q = new URLSearchParams(`m=deadline&d=${"2026-11-30"}&n=10&u=working&r=admin`);
    const html = renderWorkingDaysEmbed(locale, workingDaysPlace(locale, f.place.split("/"))!, q);
    const expected = deadline("2026-11-30", 10, "working", calendarFor(data, f.place), { rules: "admin" });
    assert.ok(expected.ok);
    assert.equal(expected.last, f.example.last, `${locale}: same as the page`);
    assert.ok(html.includes(`<strong>${esc(dateText(expected.last, locale))}</strong>`), `${locale}: the last day`);
    assert.ok(!html.includes(`rel="canonical"`), locale);
    assert.match(html, new RegExp(`action="${workingDaysEmbedPath(locale, f.place)}"`));
    assert.doesNotMatch(html, /<script|<iframe|<img|cookie|gtag|analytics/i);
  }
  // Count mode, and its errors.
  const data = workingDaysData("es");
  const count = countWorkingDays("2027-01-01", "2027-12-31", calendarFor(data, NATIONAL_ID), { rules: "general" });
  assert.ok(count.ok);
  assert.match(renderWorkingDaysEmbed("es", workingDaysPlace("es", undefined)!, new URLSearchParams("m=count&from=2027-01-01&to=2027-12-31")), new RegExp(`Días hábiles: ${count.working}</h2>`));
  assert.match(renderWorkingDaysEmbed("es", workingDaysPlace("es", undefined)!, new URLSearchParams("m=count&from=2025-01-01&to=2027-12-31")), /role="alert"/);
  // Unreadable fields fall back; nothing typed reaches the page.
  assert.equal(workingDaysQuery(new URLSearchParams("from=<x>&r=evil&n=99999")).rules, "general");
  const hostile = renderWorkingDaysEmbed("ca", workingDaysPlace("ca", ["barcelona"])!, new URLSearchParams('m=count&from="><script>&to=2027-01-31'));
  assert.doesNotMatch(hostile, /<script|"><script/);
  assert.match(hostile, /name="from" type="date" [^>]*value="2027-01-01"/, "an unreadable date falls back to the default");
});

test("calculator widgets: a result is never stored by a shared cache, the default view may be", () => {
  assert.equal(calcEmbedResponse("x", true).headers.get("cache-control"), "private, no-store");
  assert.match(calcEmbedResponse("x", false).headers.get("cache-control") ?? "", /^public, max-age=0, s-maxage=86400/);
  for (const route of ["src/app/embed/[locale]/calc/net-salary/route.ts", "src/app/embed/[locale]/calc/working-days/[[...place]]/route.ts"]) {
    const src = read(route);
    assert.match(src, /export const dynamic = "force-dynamic";/, route);
    assert.match(src, /search\.size > 0/, route);
  }
});

/* -------------------------------------------------------------------------- */
/* The data report                                                            */
/* -------------------------------------------------------------------------- */

test("report: Easter and Whit Monday from the computus", () => {
  assert.equal(easterSunday(2026), "2026-04-05");
  assert.equal(easterSunday(2027), "2027-03-28");
  assert.equal(easterSunday(2024), "2024-03-31");
  assert.equal(whitMonday(2026), "2026-05-25");
  assert.equal(whitMonday(2027), "2027-05-17");
});

test("report: every figure recomputed from the snapshot, by brute force", () => {
  const r = thisYearReport();
  const ms = municipalities();
  assert.equal(r.towns, ms.length);
  assert.equal(r.ownDays, ms.reduce((a, m) => a + m.local.length, 0));
  assert.ok(ms.every((m) => m.local.length === 0 || m.local.length === 2), "two own local days or none (ET art. 37.2)");
  const counts = new Map<string, number>();
  for (const m of ms) for (const d of m.local) counts.set(d, (counts.get(d) ?? 0) + 1);
  assert.equal(r.distinctDates, counts.size);
  const max = Math.max(...counts.values());
  assert.equal(r.top[0]!.towns, max);
  assert.equal(counts.get(r.top[0]!.date), max);
  for (let i = 1; i < r.top.length; i++) assert.ok(r.top[i - 1]!.towns >= r.top[i]!.towns, "sorted");
  for (const s of r.top) {
    const towns = ms.filter((m) => m.local.includes(s.date));
    assert.equal(s.towns, towns.length, s.date);
    assert.equal(s.population, towns.reduce((a, m) => a + m.population, 0), s.date);
  }
  assert.equal(r.byMonth.reduce((a, m) => a + m.days, 0), r.ownDays);
  assert.equal(r.byWeekday.reduce((a, m) => a + m.days, 0), r.ownDays);
  assert.equal(r.longWeekend + r.bridge + r.weekend + r.byWeekday.find((w) => w.weekday === 3)!.days, r.ownDays);
  assert.equal(r.excluded, SNAPSHOT.excluded.length);
  assert.equal(cataloniaPopulation(), r.population + r.excludedPopulation);
  // The figures the copy prints (snapshot of 30 Oct 2026): a change of data fails here so the words get re-read.
  assert.deepEqual([r.towns, r.ownDays, r.distinctDates, r.top[0]!.date, r.top[0]!.towns], [917, 1772, 201, "2026-05-25", 139]);
});

test("report: 2027 from the councils until the DOGC order, and the share of the population they cover", () => {
  const n = nextYearReport();
  const { status, towns } = nextYearTowns();
  assert.equal(n.status, status);
  assert.equal(n.towns, towns.length);
  assert.ok(towns.every((t) => t.local.length === 2 && t.local.every((d) => d.startsWith("2027-"))));
  assert.equal(n.population, towns.reduce((a, t) => a + t.population, 0));
  assert.ok(n.populationShare > 0 && n.populationShare <= 100);
  if (status === "council") {
    // The councils' own days include the towns the 2026 order listed without days.
    const unlisted = new Set(unlistedTowns().map((u) => u.slug));
    assert.ok(towns.some((t) => unlisted.has(t.slug)));
    for (const s of n.top) assert.ok((s.nameCount ?? 0) <= s.towns, s.date);
  }
});

test("report: the CSV has one row per local day, its columns, and every row's official source", () => {
  const csv = reportCsv();
  assert.ok(csv.startsWith("﻿"), "UTF-8 BOM for spreadsheets");
  const lines = csv.slice(1).trimEnd().split("\r\n");
  assert.equal(lines[0], CSV_COLUMNS.join(","));
  const rows = lines.slice(1);
  const ms = municipalities();
  const nucleusDays = ms.reduce((a, m) => a + m.nuclei.reduce((b, nu) => b + nu.dates.length, 0), 0);
  const y2026 = rows.filter((l) => l.startsWith("2026,"));
  assert.equal(y2026.length, thisYearReport().ownDays + nucleusDays);
  const next = nextYearTowns();
  const y2027 = rows.filter((l) => l.startsWith("2027,"));
  assert.equal(y2027.length, next.towns.reduce((a, t) => a + t.local.length + t.nuclei.reduce((b, nu) => b + nu.dates.length, 0), 0));
  assert.equal(rows.length, y2026.length + y2027.length);
  for (const line of rows) {
    assert.match(line, /,(dogc|council-approved),/, line);
    // The last field is the source URL, quoted when it holds a comma (RFC 4180).
    assert.match(line, /,(https:\/\/[^,"]+|"https:\/\/[^"]+")$/, `${line}: the source URL`);
    assert.match(line, /^\d{4},\d{5},/, `${line}: year and INE code`);
  }
  assert.ok(existsSync(join(ROOT, "src/app/data/festius-locals-catalunya-2026-2027.csv/route.ts")));
  assert.equal(CSV_PATH, "/data/festius-locals-catalunya-2026-2027.csv");
});

test("report pages: three editions, static folders no town takes, titles and descriptions that fit, in the sitemap", () => {
  const slugs = new Set([...municipalities().map((m) => m.slug), ...SNAPSHOT.excluded.map((e) => e.name)]);
  for (const locale of ["ca", "es", "en"] as const) {
    assert.ok(!slugs.has(REPORT_SLUG[locale]), REPORT_SLUG[locale]);
    const folder = { ca: "festius", es: "festivos", en: "holidays" }[locale];
    assert.ok(existsSync(join(ROOT, `src/app/(public)/[locale]/${folder}/${REPORT_SLUG[locale]}/page.tsx`)), locale);
    const t = REPORT_COPY[locale];
    assert.ok(t.title.length <= 62, t.title);
    const d = t.description(thisYearReport());
    assert.ok(d.length >= 70 && d.length <= 165, `${locale}: ${d.length}`);
    assert.ok(!isLowDemandPath(reportPath(locale)));
  }
  const entries = reportSitemapEntries("2026-11-18");
  assert.deepEqual(entries.map((e) => e.url), ["ca", "es", "en"].map((l) => absoluteUrl(reportPath(l as "ca"))));
  assert.match(read("src/app/sitemap.ts"), /\.\.\.reportSitemapEntries\(/);
  // The hubs and the widget page link it; the publish group never revalidates the dynamicParams = false hubs.
  assert.match(read("src/components/programmatic/holidays/HubPage.tsx"), /<Link href=\{reportPath\(locale\)\}>/);
  assert.match(read("src/components/programmatic/holidays/EnglishHubPage.tsx"), /<Link href=\{reportPath\("en"\)\}>/);
  assert.match(read("src/app/api/admin/publish/route.ts"), /if \(wants\("festius-locals-dades"\)\) codePaths\.push\(\.\.\.Object\.values\(reportEditions\(\)\)\);/);
});
