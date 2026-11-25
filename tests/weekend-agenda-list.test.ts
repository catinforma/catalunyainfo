/**
 * The server-rendered weekend lists (`programmatic/weekend/agenda-*`): the
 * two official reads, the timetable rules, the day/type grouping, the
 * fallback rule (never another weekend's list) and the English pages.
 * Fixtures are cut from the real answers of 18 Nov 2026 (weekend 20-22 Nov).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { addDays } from "../src/lib/content/holidays/calendar.ts";
import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { englishBarcelonaMeta, englishHubMeta, stamp } from "../src/lib/programmatic/weekend/agenda-copy.ts";
import {
  buildView,
  checkRead,
  daysFromCell,
  daysFromSchedule,
  freeFromPrice,
  mergeBarcelona,
  pickRead,
  truncate,
  windowDays,
  type AgendaItem,
  type SourceRead,
} from "../src/lib/programmatic/weekend/agenda-list.ts";
import { bcnItems, bcnSql, gencatItems, readBcn, readGencat, type BcnRow } from "../src/lib/programmatic/weekend/agenda-upstream.ts";
import { christmasFairsThisWeekend } from "../src/lib/programmatic/weekend/christmas-weekend.ts";
import { SNAPSHOT, shippedZones } from "../src/lib/programmatic/weekend/data.ts";
import { zoneFilter } from "../src/lib/programmatic/weekend/zones.ts";

const ROOT = join(import.meta.dirname, "..");
const FIXTURES = join(import.meta.dirname, "fixtures", "weekend-agenda");
const WINDOW = { from: "2026-11-20", to: "2026-11-22", long: false };
const DAYS = windowDays(WINDOW);

const bcnBody = JSON.parse(readFileSync(join(FIXTURES, "bcn-2026-11-18.json"), "utf8")) as { result: { records: BcnRow[] } };
const gencatRows = JSON.parse(readFileSync(join(FIXTURES, "gencat-2026-11-18.json"), "utf8")) as Record<string, string | undefined>[];
const BCN = bcnItems(bcnBody.result.records, WINDOW);
const GENCAT = gencatItems(gencatRows, WINDOW, SNAPSHOT);
const byTitle = (items: readonly AgendaItem[], start: string) => items.find((i) => i.title.startsWith(start));

/* -------------------------------------------------------------------------- */
/* Timetable rules                                                            */
/* -------------------------------------------------------------------------- */

test("timetable day cells: weekdays, ranges, dates and exceptions, as the Ajuntament writes them", () => {
  const cases: [string, string[] | null][] = [
    ["Dissabte i diumenge", ["2026-11-21", "2026-11-22"]],
    ["dissabtes i diumenges", ["2026-11-21", "2026-11-22"]],
    ["De dilluns a divendres", ["2026-11-20"]],
    ["Diumenge excepte 15 novembre", ["2026-11-22"]],
    ["Diumenge excepte 22 novembre", []],
    ["De dimarts a dijous TANCAT: dilluns no festius", []],
    ["Divendres excepte festius", ["2026-11-20"]],
    ["Cada dia", DAYS],
    ["7 novembre i 28 novembre", []],
    ["20 novembre", ["2026-11-20"]],
    ["del 20 al 22 de novembre", DAYS],
    ["Dissabte i 8 novembre", ["2026-11-21"]],
    ["Dilluns, dimarts, dimecres i divendres", ["2026-11-20"]],
    ["Consulteu dates al web", null],
    ["", null],
  ];
  for (const [cell, expected] of cases) assert.deepEqual(daysFromCell(cell, DAYS), expected, cell);
  // "març" ends in a letter a regex \b does not see as one.
  const feb = windowDays({ from: "2027-02-26", to: "2027-02-28" });
  assert.deepEqual(daysFromCell("1 de març", feb), []);
  assert.deepEqual(daysFromCell("26 de febrer i 1 de març", feb), ["2027-02-26"]);
});

test("schedules by place in the month are not read as every such weekday", () => {
  assert.equal(daysFromSchedule("El primer diumenge de cada mes, d'11 a 14 h", DAYS), null);
  assert.deepEqual(daysFromSchedule("Els dijous de novembre: 19 h", DAYS), []);
  assert.deepEqual(daysFromSchedule("De dimarts a dissabtes: de 10 a 13.30 h", DAYS), ["2026-11-20", "2026-11-21"]);
  assert.equal(daysFromSchedule("20 h. Durada aproximada: 1 hora.", DAYS), null);
});

test("free entry only when the price text says so and names no amount", () => {
  assert.ok(freeFromPrice("Entrada Gratuïta"));
  assert.ok(freeFromPrice("Entrada gratuïta Cal inscripció prèvia Places limitades"));
  assert.ok(!freeFromPrice("Entrada Gratuïta / Entrada general: 24.2 €"));
  assert.ok(!freeFromPrice("Entrada general: 9.5 € Entrada menor de 3 anys: gratuïta"));
  assert.ok(!freeFromPrice(null));
});

test("truncate cuts at a word and marks the cut; short text is untouched", () => {
  assert.equal(truncate("Entrada Gratuïta", 90), "Entrada Gratuïta");
  const long = truncate("Entrada general de: 14.95 a 16.95 € (inscripció individual amb recollida presencial) Fins el 12/11/2026", 60);
  assert.ok(long.length <= 60 && long.endsWith("…"), long);
});

/* -------------------------------------------------------------------------- */
/* Open Data BCN                                                              */
/* -------------------------------------------------------------------------- */

test("Open Data BCN: one item per activity, sessions read, official Guia Barcelona link", () => {
  assert.ok(BCN.length > 20, String(BCN.length));
  assert.equal(new Set(BCN.map((i) => i.id)).size, BCN.length);
  for (const i of BCN) {
    assert.match(i.url, /^https:\/\/guia\.barcelona\.cat\/ca\/detall\/[a-z0-9-]+_\d+\.html$/, i.title);
    assert.equal(i.ine, "08019");
    assert.ok(!/^﻿/.test(i.id));
  }
  const fair = byTitle(BCN, "Fira de Nadal a la Sagrada");
  assert.ok(fair);
  assert.equal(fair.type, "fairs");
  assert.deepEqual(fair.days, ["2026-11-21", "2026-11-22"]);
  assert.equal(fair.time, "de 10:00 h a 21:00 h");
  assert.match(fair.url, /_99400017122\.html$/);

  const show = byTitle(BCN, 'Espectacle "Ilustres ignorantes"');
  assert.equal(show?.time, "dv. ds.: a les 22.30 h · dg.: a les 20.00 h");
  assert.equal(show?.free, false);
  assert.match(show?.price ?? "", /^Entrada general: 28 €/);

  assert.deepEqual(byTitle(BCN, "Renova la teva roba: Mercat")?.days, ["2026-11-20"]);
  assert.equal(byTitle(BCN, "Mercat d'artesania i comerç 'Fet al Born'")?.free, true);
  assert.equal(byTitle(BCN, '"(In)Fusión Flamenca"')?.free, false);
});

test("Open Data BCN: not on this weekend, traffic notices and term courses are left out", () => {
  assert.equal(byTitle(BCN, "Visita dinamitzada 'Indiana Stones"), undefined, "7 and 28 Nov only");
  assert.equal(byTitle(BCN, "Narració 'Contes a la mà'"), undefined, "10 and 24 Nov only");
  assert.equal(byTitle(BCN, "Alteracions de trànsit"), undefined);
  assert.equal(byTitle(BCN, "Taller 'Contact Improvisació'"), undefined);
  // The raw rows did carry them.
  assert.ok(bcnBody.result.records.some((r) => (r.name ?? "").startsWith("Visita dinamitzada 'Indiana Stones")));
});

test("Open Data BCN query: grouped by activity, window and span bounded, dates validated", () => {
  const sql = bcnSql(WINDOW);
  assert.match(sql, /GROUP BY register_id/);
  assert.match(sql, /start_date <= '2026-11-22T23:59:59' AND end_date >= '2026-11-20T00:00:00'/);
  assert.match(sql, /interval '45 days'/);
  assert.throws(() => bcnSql({ from: "2026-11-20'; DROP", to: "2026-11-22" }));
});

/* -------------------------------------------------------------------------- */
/* Generalitat                                                                */
/* -------------------------------------------------------------------------- */

test("Generalitat: Catalonia only, one item per activity, official agenda page, schedule-aware", () => {
  assert.ok(GENCAT.length > 10, String(GENCAT.length));
  assert.equal(new Set(GENCAT.map((i) => i.id)).size, GENCAT.length);
  for (const i of GENCAT) {
    assert.ok(["08", "17", "25", "43"].includes(i.province), `${i.title}: ${i.province}`);
    assert.match(i.url, /^https:\/\//);
  }
  assert.ok(GENCAT.some((i) => /^https:\/\/agenda\.cultura\.gencat\.cat\/ca\/activitat\.html\/\d+$/.test(i.url)));
  // "Els dijous de novembre": in the rows, not on the weekend.
  const thursdays = gencatRows.filter((r) => (r.horari ?? "").startsWith("Els dijous") && r.data_inici !== r.data_fi).map((r) => `gencat:${r.codi}`);
  for (const id of thursdays) assert.ok(!GENCAT.some((i) => i.id === id), id);
});

test("Barcelona merges the Ajuntament's list with the Generalitat's Barcelona items it lacks", () => {
  const gencatBcn = GENCAT.filter((i) => i.ine === "08019");
  const merged = mergeBarcelona(BCN, gencatBcn);
  assert.equal(merged.slice(0, BCN.length).length, BCN.length);
  assert.ok(merged.length >= BCN.length && merged.length <= BCN.length + gencatBcn.length);
  const dup = { ...gencatBcn[0]!, id: "gencat:dup", title: BCN[0]!.title, start: BCN[0]!.start };
  assert.equal(mergeBarcelona(BCN, [dup]).length, BCN.length);
});

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

test("view: by day then type, capped, past days dropped", () => {
  const view = buildView(BCN, WINDOW, "2026-11-18");
  assert.deepEqual(
    view.days.map((d) => d.key),
    DAYS.filter((d) => view.days.some((b) => b.key === d)),
  );
  for (const bucket of [...view.days, ...(view.multi ? [view.multi] : [])]) {
    for (const g of bucket.groups) assert.ok(g.items.length <= (bucket.key === "multi" ? 3 : 4) && g.items.length <= g.total);
  }
  assert.equal(view.counts.all, view.items.length);
  const saturday = buildView(BCN, WINDOW, "2026-11-21");
  assert.ok(!saturday.days.some((d) => d.key === "2026-11-20"), "Friday gone on Saturday");
  assert.ok(saturday.counts.all < view.counts.all);
  const monday = buildView(BCN, WINDOW, "2026-11-23");
  assert.equal(monday.counts.all, 0);
});

/* -------------------------------------------------------------------------- */
/* Fallback                                                                   */
/* -------------------------------------------------------------------------- */

const read = (source: "gencat" | "bcn", window: { from: string; to: string }): SourceRead => ({ source, window, fetchedAt: "2026-11-18T17:00:00.000Z", updated: null, items: [] });

test("fallback: live, then kept, then committed, and never another weekend's list", () => {
  const now = { from: "2026-11-20", to: "2026-11-22" };
  const past = { from: "2026-11-13", to: "2026-11-15" };
  assert.equal(pickRead("bcn", now, { bcn: read("bcn", now) }, {}, {}).status, "live");
  assert.equal(pickRead("bcn", now, {}, { bcn: read("bcn", now) }, {}).status, "kept");
  assert.equal(pickRead("bcn", now, {}, {}, { bcn: read("bcn", now) }).status, "snapshot");
  assert.equal(pickRead("bcn", now, { bcn: read("bcn", past) }, { bcn: read("bcn", past) }, { bcn: read("bcn", past) }).status, "unavailable");
  assert.equal(pickRead("gencat", now, { bcn: read("bcn", now) }, {}, {}).read, null);
});

test("the committed snapshot is well formed and only for the weekend it was read for", () => {
  const raw = JSON.parse(readFileSync(join(ROOT, "src/lib/programmatic/weekend/agenda-snapshot.json"), "utf8")) as { readOn: string; reads: unknown[] };
  const reads = raw.reads.map(checkRead);
  assert.deepEqual(reads.map((r) => r?.source).sort(), ["bcn", "gencat"]);
  for (const r of reads) {
    assert.ok(r && r.items.length > 0);
    assert.deepEqual(r.window, { from: weekendWindow(raw.readOn).from, to: weekendWindow(raw.readOn).to });
    assert.equal(pickRead(r.source, { from: addDays(r.window.from, 7), to: addDays(r.window.to, 7) }, {}, {}, { [r.source]: r }).status, "unavailable");
  }
  assert.equal(checkRead({ source: "bcn", window: { from: "x", to: "y" }, fetchedAt: "z", items: [] }), null);
});

test("reads return null rather than a partial list", async () => {
  const fail = async () => new Response("nope", { status: 503 });
  assert.equal(await readBcn(fail, WINDOW, Date.now()), null);
  assert.equal(await readGencat(fail, WINDOW, SNAPSHOT, Date.now()), null);
  const odd = async () => new Response(JSON.stringify({ success: false }), { status: 200 });
  assert.equal(await readBcn(odd, WINDOW, Date.now()), null);
  const ok = async () => new Response(JSON.stringify(bcnBody), { status: 200, headers: { date: "Wed, 18 Nov 2026 17:41:54 GMT" } });
  const r = await readBcn(ok, WINDOW, Date.parse("2026-11-18T17:42:00Z"));
  assert.equal(r?.fetchedAt, "2026-11-18T17:41:54.000Z");
  assert.equal(r?.items.length, BCN.length);
  assert.match(r?.updated ?? "", /^2026-11-\d\dT/);
});

/* -------------------------------------------------------------------------- */
/* Christmas fairs, copy, routes                                              */
/* -------------------------------------------------------------------------- */

test("Christmas fairs this weekend link our own town pages, in every edition", () => {
  const ca = christmasFairsThisWeekend(WINDOW, "2026-11-18", "ca");
  const bcn = ca.find((t) => t.ine === "08019");
  assert.equal(bcn?.href, "/ca/fires-de-nadal/barcelona/");
  assert.ok(bcn?.fairs.some((f) => /Sagrada Fam/.test(f.name)));
  assert.equal(christmasFairsThisWeekend(WINDOW, "2026-11-18", "en").find((t) => t.ine === "08019")?.href, "/en/christmas-markets/barcelona/");
  assert.ok(christmasFairsThisWeekend(WINDOW, "2026-11-18", "es").every((t) => t.href.startsWith("/es/mercados-navidad/")));
  assert.ok(christmasFairsThisWeekend(WINDOW, "2026-11-18", "ca", { ines: ["17079"] }).every((t) => t.ine === "17079"));
  assert.deepEqual(christmasFairsThisWeekend(weekendWindow("2027-01-20"), "2027-01-20", "ca"), []);
});

test("stamps: Madrid time for instants, the publisher's own clock for local timestamps", () => {
  assert.equal(stamp("2026-11-18T17:30:04.000Z", "ca"), "18 de novembre de 2026 a les 18.30");
  assert.equal(stamp("2026-11-16T13:07:36", "es"), "16 de noviembre de 2026 a las 13:07");
  assert.equal(stamp("2026-11-18T17:30:04.000Z", "en"), "18 November 2026, 18:30");
});

test("English titles <= 60 with the weekend's dates and descriptions <= 155, for every weekend to 2027", () => {
  const seen = new Set<string>();
  for (let d = "2026-11-18"; d <= "2027-12-31"; d = addDays(d, 1)) {
    const w = weekendWindow(d);
    if (seen.has(w.from)) continue;
    seen.add(w.from);
    for (const meta of [englishHubMeta(w), englishBarcelonaMeta(w)]) {
      assert.ok(meta.title.length <= 60, meta.title);
      assert.ok(meta.description.length <= 155, meta.description);
      assert.ok(meta.title.includes(String(Number(w.to.slice(8, 10)))), meta.title);
    }
  }
});

test("routes: every weekend page regenerates hourly, the literal matching the loader", () => {
  const server = readFileSync(join(ROOT, "src/lib/programmatic/weekend/agenda-server.ts"), "utf8");
  const seconds = /export const SERVER_REVALIDATE_SECONDS = (\d+);/.exec(server)?.[1];
  assert.equal(seconds, "3600");
  const app = join(ROOT, "src/app/(public)/[locale]");
  for (const file of ["cap-de-setmana/page.tsx", "fin-de-semana/page.tsx", "cap-de-setmana/[zona]/page.tsx", "fin-de-semana/[zona]/page.tsx", "weekend/page.tsx", "weekend/barcelona/page.tsx"]) {
    const source = readFileSync(join(app, file), "utf8");
    assert.match(source, new RegExp(`export const revalidate = ${seconds};`), file);
    assert.match(source, /export const dynamicParams = true;/, file);
    assert.match(source, /notFound\(\)/, file);
  }
  for (const file of ["weekend/page.tsx", "weekend/barcelona/page.tsx"]) assert.match(readFileSync(join(app, file), "utf8"), /locale (!|=)== "en"/, file);
});

test("pages: the agenda is server-rendered on the hubs, the zones and the English pages, with its attribution", () => {
  const dir = join(ROOT, "src/components/programmatic/weekend");
  for (const file of ["HubPage.tsx", "ZonePage.tsx", "EnglishWeekend.tsx"]) {
    const source = readFileSync(join(dir, file), "utf8");
    assert.match(source, /<AgendaList\b/, file);
    assert.match(source, /<AgendaSources\b/, file);
    assert.match(source, /<ChristmasThisWeekend\b/, file);
    assert.ok(!source.includes("WeekendLive"), file);
  }
  const list = readFileSync(join(dir, "AgendaList.tsx"), "utf8");
  assert.ok(!/dangerouslySetInnerHTML|<img\b/.test(list), "no markup or images from the sources");
});

/**
 * Canyelles' Petita Llúcia (28-29 Nov 2026, council news read 25 Nov 2026): the fair itself
 * is 21-22 Nov, the exhibitions stay open the next weekend. It is its own organiser entry, so
 * the agenda hub, the weekend hub and the zone pages list Canyelles on 26-29 Nov and not after.
 */
test("Canyelles' Petita Llúcia is in this weekend's Christmas fairs on 26-29 Nov, and gone on 30 Nov", () => {
  for (const today of ["2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]) {
    for (const locale of ["ca", "es", "en"] as const) {
      const list = christmasFairsThisWeekend(weekendWindow(today), today, locale);
      const canyelles = list.find((t) => t.ine === "08043");
      assert.ok(canyelles, `${today} ${locale}`);
      assert.deepEqual(canyelles.fairs, [{ name: "Petita Llúcia", start: "2026-11-28", end: "2026-11-29" }], `${today} ${locale}`);
      assert.equal(canyelles.href, locale === "ca" ? "/ca/fires-de-nadal/canyelles/" : locale === "es" ? "/es/mercados-navidad/canyelles/" : "/en/christmas-markets/");
    }
    // The zone page of its province lists it too.
    const zones = shippedZones().filter((z) => christmasFairsThisWeekend(weekendWindow(today), today, "ca", zoneFilter(z)).some((t) => t.ine === "08043"));
    assert.ok(zones.length > 0, `${today}: a zone page lists Canyelles`);
  }
  // Sunday 29 Nov: still listed (the last day); Monday 30 Nov: the window is 4-6 Dec and the exhibitions are over.
  assert.ok(!christmasFairsThisWeekend(weekendWindow("2026-11-30"), "2026-11-30", "ca").some((t) => t.ine === "08043"));
  assert.ok(!christmasFairsThisWeekend(weekendWindow("2026-12-02"), "2026-12-02", "es").some((t) => t.ine === "08043"));
  // The 21-22 Nov fair is not listed for the 28-29 Nov weekend.
  const list = christmasFairsThisWeekend(weekendWindow("2026-11-27"), "2026-11-27", "ca");
  assert.ok(list.find((t) => t.ine === "08043")!.fairs.every((f) => f.start === "2026-11-28"));
});
