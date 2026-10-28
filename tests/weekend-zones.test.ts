import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { addDays } from "../src/lib/content/holidays/calendar.ts";
import { weekendRange, weekendTitle } from "../src/lib/content/live-title.ts";
import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { SLUG_PATTERN } from "../src/lib/programmatic/holidays/slug.ts";
import { agendaUrl, buildLookup, cleanWeb, compactEvents, municipalityNames } from "../src/lib/programmatic/weekend/compact.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  dayRange,
  hubMeta,
  longWeekendNote,
  rangeLong,
  widerPhrase,
  zoneDescription,
  zoneH1,
  zoneTitle,
} from "../src/lib/programmatic/weekend/copy.ts";
import {
  SNAPSHOT,
  comarquesIn,
  fairsAfter,
  fairsIn,
  fairsInWindow,
  linesIn,
  meteocatUrl,
  municipalitiesIn,
  municipality,
  shippedZones,
  stationMunicipality,
  weatherTowns,
  widerZone,
} from "../src/lib/programmatic/weekend/data.ts";
import {
  MAX_AGE_HOURS,
  dayLabel,
  group,
  inZone,
  parsePayload,
  payloadIsCurrent,
  placeRow,
  todayInMadrid,
  zoneView,
  type LiveEvent,
  type WeekendPayload,
} from "../src/lib/programmatic/weekend/live.ts";
import { WEEKEND_ROUTE, hubTranslations, weekendHubPath, zonePath, zoneTranslations } from "../src/lib/programmatic/weekend/paths.ts";
import { weekendRefreshDue, windowStartedOn } from "../src/lib/programmatic/weekend/refresh.ts";
import { hubAllowed, refreshNights, resolveZone, weekendRefreshPaths, zoneStaticParams } from "../src/lib/programmatic/weekend/routing.ts";
import { weekendFamilyPaths, weekendLastModified, weekendSitemapEntries } from "../src/lib/programmatic/weekend/sitemap.ts";
import { FAILURE_CACHE, SUCCESS_CACHE, loadWeekendPayload } from "../src/lib/programmatic/weekend/upstream.ts";
import { MIN_EVENTS, WEEKEND_LOCALES, ZONES, zoneById, zoneBySlug, zoneFilter, type WeekendLocale } from "../src/lib/programmatic/weekend/zones.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

const ROOT = join(import.meta.dirname, "..");
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Unedited rows of the Generalitat's cultural agenda (`rhpv-yr4f`) for the
 * weekend of 30 Oct - 1 Nov 2026, read on 28 Oct 2026 with the route's own
 * query (`tests/fixtures/weekend/agenda-2026-10-28.json`, 29 of the 522 rows).
 */
const FIXTURE = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/weekend/agenda-2026-10-28.json"), "utf8")) as {
  readAt: string;
  query: string;
  rows: Record<string, string>[];
};
const WINDOW = { from: "2026-10-30", to: "2026-11-01", long: false };
const LOOKUP = buildLookup(SNAPSHOT);
const NAMES = municipalityNames(SNAPSHOT);
const EVENTS = compactEvents(FIXTURE.rows, WINDOW, LOOKUP, NAMES);

/* -------------------------------------------------------------------------- */
/* Snapshot shape and invariants                                              */
/* -------------------------------------------------------------------------- */

test("snapshot: dated, with its four official sources", () => {
  assert.match(SNAPSHOT.readOn, ISO);
  for (const source of Object.values(SNAPSHOT.sources)) {
    assert.match(source.url, /^https:\/\/(analisi\.transparenciacatalunya\.cat|www\.idescat\.cat)\//);
    assert.match(source.api, /^https:\/\//);
    if (source.updated) assert.match(source.updated, ISO);
  }
  assert.equal(SNAPSHOT.sources.agenda.api, "https://analisi.transparenciacatalunya.cat/resource/rhpv-yr4f.json");
  assert.equal(SNAPSHOT.sources.fairs.api, "https://analisi.transparenciacatalunya.cat/resource/vm32-przc.json");
  assert.equal(SNAPSHOT.sources.register.api, "https://analisi.transparenciacatalunya.cat/resource/wpyq-we8x.json");
});

test("snapshot: every municipality of Catalonia, with consistent codes", () => {
  const ines = new Set<string>();
  for (const m of SNAPSHOT.municipalities) {
    assert.match(m.ine, /^\d{5}$/);
    assert.match(m.idescat, /^\d{6}$/);
    assert.equal(m.idescat.slice(0, 5), m.ine);
    assert.equal(m.ine.slice(0, 2), m.province);
    assert.ok(SNAPSHOT.comarques[m.comarca], `${m.name}: comarca ${m.comarca}`);
    assert.ok(!ines.has(m.ine), `duplicate ${m.ine}`);
    ines.add(m.ine);
  }
  assert.ok(SNAPSHOT.municipalities.length >= 947, "947 municipalities in the register on 28 Oct 2026");
  assert.equal(Object.keys(SNAPSHOT.comarques).length, 43, "42 comarques and Aran");
});

test("snapshot: Idescat's tourism brands, as read on 28 Oct 2026", () => {
  assert.equal(SNAPSHOT.brands.MT02?.name, "Costa Brava");
  assert.deepEqual(SNAPSHOT.brands.MT02?.comarques, ["02", "10", "20", "28", "34"]);
  assert.equal(SNAPSHOT.brands.MT05?.name, "Costa Daurada");
  assert.deepEqual(SNAPSHOT.brands.MT05?.comarques, ["01", "08", "12", "16", "29", "36"]);
  assert.equal(SNAPSHOT.brands.MT01?.name, "Pirineus");
  assert.deepEqual(SNAPSHOT.brands.MT01?.comarques, ["04", "05", "14", "15", "19", "25", "26", "31", "35"]);
  assert.deepEqual(SNAPSHOT.brands.MT10?.comarques, ["39"]);
  // Every comarca belongs to exactly one brand.
  const all = Object.values(SNAPSHOT.brands).flatMap((b) => b.comarques);
  assert.equal(all.length, 43);
  assert.equal(new Set(all).size, 43);
});

test("zones built from brands list exactly the brands' comarques", () => {
  for (const zone of ZONES.filter((z) => z.brands)) {
    const fromIdescat = zone.brands!.flatMap((b) => SNAPSHOT.brands[b]?.comarques ?? []).sort();
    assert.deepEqual([...(zone.comarques ?? [])].sort(), fromIdescat, zone.id);
  }
});

test("snapshot: fairs from the official calendar, still to come, in date order", () => {
  assert.ok(SNAPSHOT.fairs.length > 50, "95 fairs left in 2026 on 28 Oct");
  let previous = "";
  for (const f of SNAPSHOT.fairs) {
    assert.match(f.start, ISO);
    assert.match(f.end, ISO);
    assert.ok(f.start <= f.end, f.name);
    assert.ok(f.end >= SNAPSHOT.readOn, `${f.name} ended before the snapshot`);
    assert.ok(f.start >= previous, "sorted by start");
    previous = f.start;
    assert.ok(f.name && f.town && f.sector, f.id);
    assert.ok(["08", "17", "25", "43"].includes(f.province));
    assert.ok(SNAPSHOT.comarques[f.comarca], `${f.name}: comarca ${f.comarca}`);
    if (f.ine) assert.equal(municipality(f.ine)?.province, f.province);
    if (f.web) assert.match(f.web, /^https:\/\/[^\s/]+\.[^\s]+$/);
  }
});

test("snapshot: renamed agenda slugs point at the register's current names", () => {
  assert.equal(municipality(SNAPSHOT.agendaAliases.calonge!)?.name, "Calonge i Sant Antoni");
  assert.equal(municipality(SNAPSHOT.agendaAliases["castell-platja-d-aro"]!)?.name, "Castell d'Aro, Platja d'Aro i s'Agaró");
  assert.equal(municipality(SNAPSHOT.agendaAliases["sant-carles-de-la-rapita"]!)?.name, "la Ràpita");
});

test("snapshot: a year of weekend volume for every zone", () => {
  for (const zone of ZONES) {
    const v = SNAPSHOT.volume[zone.id];
    assert.ok(v, zone.id);
    assert.equal(v.weekends, 52);
    assert.match(v.from, ISO);
    assert.ok(v.to < SNAPSHOT.readOn);
    assert.ok(v.min <= v.p25 && v.p25 <= v.median, zone.id);
  }
});

/* -------------------------------------------------------------------------- */
/* Known answers from the official source                                     */
/* -------------------------------------------------------------------------- */

test("fixture: only activities in Catalonia, placed in official codes", () => {
  assert.equal(FIXTURE.rows.length, 29);
  assert.equal(EVENTS.length, 24);
  // León and the French competition are not Catalonia; a months-long exhibition is not a weekend plan.
  for (const title of ["Cicle de concerts", "Concours international de piano", "La veu de la pedra"]) {
    assert.ok(!EVENTS.some((e) => e.t.includes(title)), title);
  }
  const codony = EVENTS.find((e) => e.t === "Fira del Codony");
  assert.deepEqual(
    codony && { m: codony.m, ine: codony.ine, c: codony.c, p: codony.p, s: codony.s, e: codony.e, n: codony.n },
    { m: "Tremp", ine: "25234", c: "25", p: "25", s: "2026-10-31", e: "2026-11-01", n: true },
  );
  const mostres = EVENTS.find((e) => e.t === "La Fira de Mostres");
  assert.equal(mostres?.ine, "17079");
  assert.equal(mostres?.k, "fairs");
  // A bare municipality slug ("manresa") is placed through the register.
  assert.equal(EVENTS.find((e) => e.t.includes("De claror i de cor"))?.ine, "08113");
  for (const e of EVENTS) {
    assert.ok(e.p && ["08", "17", "25", "43"].includes(e.p));
    if (e.u) assert.match(e.u, /^https:\/\//);
  }
});

test("fixture: a renamed town and an outside location", () => {
  const renamed = FIXTURE.rows.find((r) => (r.comarca_i_municipi ?? "").endsWith("/castell-platja-d-aro"));
  assert.ok(renamed);
  assert.deepEqual(placeRow(renamed, LOOKUP), { ine: "17048", name: "Castell d'Aro, Platja d'Aro i s'Agaró", comarca: "10", province: "17" });
  const outside = FIXTURE.rows.find((r) => (r.comarca_i_municipi ?? "").includes("fora-de-catalunya"));
  assert.ok(outside);
  assert.equal(placeRow(outside, LOOKUP), null);
  // The agenda files the Lluçanès under Osona; the register, under the Lluçanès (43).
  assert.equal(placeRow({ comarca_i_municipi: "agenda:ubicacions/barcelona/osona/olost" }, LOOKUP)?.comarca, "43");
  // A town missing from the register keeps its comarca from the path.
  assert.deepEqual(placeRow({ comarca_i_municipi: "agenda:ubicacions/girona/girones/medinya" }, LOOKUP), { ine: "", name: "", comarca: "20", province: "17" });
});

test("fixture: the zones pick out their own activities", () => {
  const ids = (zone: string) => EVENTS.filter((e) => inZone(e, zoneFilter(zoneById(zone as never)))).map((e) => e.t);
  assert.ok(ids("pirineu").includes("Fira del Codony"));
  assert.ok(ids("pirineu").includes("Visions"));
  assert.ok(ids("costa-brava").includes("La Dharma a un pam"));
  assert.ok(!ids("costa-brava").includes("Fira del Codony"));
  assert.deepEqual(ids("maresme").sort(), ['Exposició "Transicions"', "Octubre a les Cases de la Música"]);
  assert.equal(ids("barcelona").length, 6);
});

test("fairs calendar: the weekend of 30 Oct - 1 Nov 2026 per zone", () => {
  const names = (zone: string) => fairsInWindow(fairsIn(zoneById(zone as never)), WINDOW).map((f) => `${f.name} (${f.town})`);
  assert.ok(names("girona").includes("Fira Industrial, Agrícola i Comercial. Fira de Mostres (Girona)"));
  assert.ok(names("pirineu").includes("Fira del Codony (Tremp)"));
  assert.ok(names("pirineu").includes("Fira de Tots Sants (Bagà)"));
  assert.ok(names("tarragona").includes("Fira del Vi de Gandesa (Gandesa)"));
  assert.deepEqual(names("maresme"), []);
  // The next fairs start after the window, earliest first.
  const next = fairsAfter(fairsIn(null), WINDOW, 5);
  assert.ok(next.every((f) => f.start > WINDOW.to));
  assert.equal(next[0]?.start, "2026-11-02");
});

test("the route's query is the Catalonia page's query", () => {
  const url = agendaUrl(WINDOW);
  assert.equal(url, FIXTURE.query);
});

test("route handler: one payload for Catalonia, with its window; never throws", async () => {
  const fake = (async () => new Response(JSON.stringify(FIXTURE.rows), { status: 200 })) as unknown as typeof fetch;
  const ok = await loadWeekendPayload(fake, new Date("2026-10-28T12:00:00Z"));
  assert.ok(ok.ok);
  assert.deepEqual(ok.payload.window, WINDOW);
  assert.equal(ok.payload.events.length, 24);
  assert.equal(ok.payload.fetchedAt, "2026-10-28T12:00:00.000Z");
  assert.ok(parsePayload(JSON.parse(JSON.stringify(ok.payload))));

  const down = await loadWeekendPayload((async () => new Response("", { status: 503 })) as unknown as typeof fetch);
  assert.deepEqual(down, { ok: false, error: "HTTP 503" });
  const broken = await loadWeekendPayload((async () => {
    throw new TypeError("network");
  }) as unknown as typeof fetch);
  assert.equal(broken.ok, false);
  assert.match(SUCCESS_CACHE, /s-maxage=1800/);
  assert.match(FAILURE_CACHE, /s-maxage=60/);
});

/* -------------------------------------------------------------------------- */
/* Doorway guardrail                                                          */
/* -------------------------------------------------------------------------- */

test("guardrail: a zone ships only when 3 weekends in 4 had MIN_EVENTS activities", () => {
  const shipped = shippedZones();
  for (const zone of ZONES) {
    const ships = (SNAPSHOT.volume[zone.id]?.p25 ?? 0) >= MIN_EVENTS;
    assert.equal(shipped.includes(zone), ships, zone.id);
  }
  // As measured on 28 Oct 2026: the Alt Empordà (p25 4) waits; the other eleven ship.
  assert.deepEqual(
    shipped.map((z) => z.id),
    ["barcelona", "provincia-barcelona", "girona", "lleida", "tarragona", "costa-brava", "costa-daurada", "maresme", "pirineu", "baix-emporda", "valles-occidental"],
  );
  assert.equal(resolveZone("ca", "ca", "alt-emporda"), null);
});

test("guardrail: every zone has places, a wider area that contains it, and weather towns inside it", () => {
  const outside: string[] = [];
  for (const zone of ZONES) {
    assert.ok(municipalitiesIn(zone).length > 0, zone.id);
    const wider = widerZone(zone);
    if (wider) {
      assert.ok(shippedZones().includes(wider), `${zone.id}: wider ${wider.id} has a page`);
      const inside = new Set(municipalitiesIn(wider).map((m) => m.ine));
      for (const m of municipalitiesIn(zone)) if (!inside.has(m.ine)) outside.push(`${zone.id}: ${m.name}`);
    }
    const towns = weatherTowns(zone);
    assert.equal(towns.length, zone.weather.length, `${zone.id}: weather towns resolve`);
    const own = new Set(municipalitiesIn(zone).map((m) => m.ine));
    for (const m of towns) {
      assert.ok(own.has(m.ine), `${zone.id}: ${m.name}`);
      assert.match(meteocatUrl(m), /^https:\/\/www\.meteo\.cat\/prediccio\/municipal\/\d{6}$/);
    }
    if (zone.capital) assert.ok(own.has(zone.capital));
  }
  // The Selva has one municipality in the province of Barcelona.
  assert.deepEqual(outside, ["costa-brava: Fogars de la Selva"]);
  assert.equal(meteocatUrl(municipality("17079")!), "https://www.meteo.cat/prediccio/municipal/170792");
});

test("the browser view: short weekends show the wider area and say so", () => {
  const ev = (id: string, over: Partial<LiveEvent>): LiveEvent => ({ id, t: id, v: "", m: "", ine: "", c: "", p: "17", s: "2026-10-31", e: "2026-10-31", k: "music", f: false, u: null, n: true, ...over });
  const payload: WeekendPayload = {
    window: WINDOW,
    fetchedAt: "2026-10-30T08:00:00Z",
    events: [ev("a", { c: "10" }), ev("b", { c: "10", f: true }), ev("c", { c: "20", ine: "17079" }), ev("d", { c: "31" }), ev("e", { p: "08", c: "13" })],
  };
  const baix = zoneById("baix-emporda");
  const short = zoneView(payload, { filter: zoneFilter(baix), wider: zoneFilter(widerZone(baix)!), fairs: 0 });
  assert.equal(short.zoneEvents.length, 2);
  assert.equal(short.short, true);
  assert.deepEqual(short.widerEvents?.map((e) => e.id), ["c", "d"]);
  // Fairs from the calendar count towards the minimum.
  assert.equal(zoneView(payload, { filter: zoneFilter(baix), wider: null, fairs: 3 }).short, false);
  // The province page lists its capital first.
  const girona = zoneView(payload, { filter: zoneFilter(zoneById("girona")), wider: null, fairs: 5, capital: "17079" });
  assert.equal(girona.groups[0]?.key, "capital");
  assert.deepEqual(girona.groups[0]?.events.map((e) => e.id), ["c"]);
  // The hub keeps one category.
  const fairs = zoneView({ ...payload, events: [...payload.events, ev("f", { k: "fairs", p: "25" })] }, { filter: {}, wider: null, fairs: 0, category: "fairs" });
  assert.deepEqual(fairs.zoneEvents.map((e) => e.id), ["f"]);
  assert.deepEqual(group([ev("x", { n: false, s: "2026-10-01" }), ev("y", {})]).flatMap((g) => g.events.map((e) => e.id)), ["y", "x"]);
});

/* -------------------------------------------------------------------------- */
/* "This weekend" in the browser: Europe/Madrid and the day after              */
/* -------------------------------------------------------------------------- */

test("client: today is Madrid's date, whatever the device's zone", () => {
  assert.equal(todayInMadrid(new Date("2026-11-01T22:30:00Z")), "2026-11-01"); // 23:30 CET
  assert.equal(todayInMadrid(new Date("2026-11-01T23:30:00Z")), "2026-11-02"); // 00:30 CET
  assert.equal(todayInMadrid(new Date("2027-06-27T22:30:00Z")), "2027-06-28"); // 00:30 CEST
});

test("client: a list is shown until its last day ends in Madrid, never the day after", () => {
  const payload: WeekendPayload = { window: WINDOW, fetchedAt: "2026-11-01T20:00:00Z", events: [] };
  assert.equal(payloadIsCurrent(payload, new Date("2026-11-01T22:59:00Z")), true); // Sunday 23:59 in Madrid
  assert.equal(payloadIsCurrent(payload, new Date("2026-11-01T23:00:00Z")), false); // Monday 00:00 in Madrid, still Sunday in UTC
  const summer: WeekendPayload = { window: { from: "2027-06-25", to: "2027-06-27", long: false }, fetchedAt: "2027-06-27T20:00:00Z", events: [] };
  assert.equal(payloadIsCurrent(summer, new Date("2027-06-27T21:59:00Z")), true);
  assert.equal(payloadIsCurrent(summer, new Date("2027-06-27T22:00:00Z")), false);
  // An answer older than a day is not this weekend's, even inside the window.
  const old: WeekendPayload = { window: WINDOW, fetchedAt: "2026-10-30T07:00:00Z", events: [] };
  assert.equal(payloadIsCurrent(old, new Date(Date.parse(old.fetchedAt) + (MAX_AGE_HOURS + 1) * 3_600_000)), false);
  assert.equal(parsePayload({ window: { from: "x" }, events: [] }), null);
  assert.equal(parsePayload(null), null);
});

test("client: dates as the titles write them", () => {
  assert.equal(dayLabel("2026-10-31", "2026-10-31", "ca"), "31 oct");
  assert.equal(dayLabel("2026-10-30", "2026-11-01", "es"), "30 oct–1 nov");
  assert.equal(weekendRange("ca", WINDOW), "30 oct–1 nov");
});

/* -------------------------------------------------------------------------- */
/* Paths and routing                                                          */
/* -------------------------------------------------------------------------- */

test("paths: one route folder per locale, slugs per locale", () => {
  assert.equal(weekendHubPath("ca"), "/ca/cap-de-setmana/");
  assert.equal(weekendHubPath("es"), "/es/fin-de-semana/");
  assert.equal(zonePath("ca", zoneById("pirineu")), "/ca/cap-de-setmana/pirineu/");
  assert.equal(zonePath("es", zoneById("pirineu")), "/es/fin-de-semana/pirineo/");
  assert.equal(zonePath("es", zoneById("costa-daurada")), "/es/fin-de-semana/costa-dorada/");
  assert.deepEqual(zoneTranslations(zoneById("girona")), { ca: "/ca/cap-de-setmana/girona/", es: "/es/fin-de-semana/girona/" });
  assert.deepEqual(hubTranslations(), { ca: "/ca/cap-de-setmana/", es: "/es/fin-de-semana/" });
  for (const locale of WEEKEND_LOCALES) {
    const slugs = ZONES.map((z) => z.slug[locale]);
    assert.equal(new Set(slugs).size, slugs.length, `${locale}: unique slugs`);
    for (const slug of slugs) assert.match(slug, SLUG_PATTERN);
  }
  assert.deepEqual(WEEKEND_ROUTE, { ca: "cap-de-setmana", es: "fin-de-semana" });
});

test("routing: each route answers its own locale only (else 404)", () => {
  assert.ok(hubAllowed("ca", "ca"));
  assert.ok(!hubAllowed("ca", "es"));
  assert.ok(!hubAllowed("es", "en"));
  assert.equal(resolveZone("ca", "ca", "girona")?.id, "girona");
  assert.equal(resolveZone("ca", "es", "girona"), null);
  assert.equal(resolveZone("es", "en", "girona"), null);
  assert.equal(resolveZone("es", "es", "pirineo")?.id, "pirineu");
  assert.equal(resolveZone("es", "es", "pirineu"), null);
  assert.equal(resolveZone("ca", "ca", "pirineo"), null);
  assert.equal(resolveZone("ca", "ca", "manresa"), null);
  assert.equal(zoneBySlug("ca", "costa-daurada")?.id, "costa-daurada");
  for (const locale of WEEKEND_LOCALES) {
    const params = zoneStaticParams(locale);
    assert.equal(params.length, shippedZones().length);
    assert.ok(params.every((p) => p.locale === locale && resolveZone(locale, locale, p.zona)));
  }
});

test("the route files exist, are static and 404 other locales", () => {
  for (const [dir, locale] of [["cap-de-setmana", "ca"], ["fin-de-semana", "es"]] as const) {
    const hub = readFileSync(join(ROOT, `src/app/(public)/[locale]/${dir}/page.tsx`), "utf8");
    const zone = readFileSync(join(ROOT, `src/app/(public)/[locale]/${dir}/[zona]/page.tsx`), "utf8");
    for (const source of [hub, zone]) {
      assert.match(source, /export const revalidate = false;/);
      assert.match(source, /notFound\(\)/);
      assert.ok(source.includes(`"${locale}"`));
    }
    assert.match(zone, /export const dynamicParams = true;/);
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/** Every distinct weekend window from today to the end of 2027. */
function allWindows(): { from: string; to: string; long: boolean }[] {
  const seen = new Map<string, { from: string; to: string; long: boolean }>();
  for (let d = "2026-10-28"; d <= "2027-12-31"; d = addDays(d, 1)) {
    const w = weekendWindow(d);
    seen.set(`${w.from}|${w.to}`, w);
  }
  return [...seen.values()];
}

test("metadata: titles <= 60 with the weekend's dates, descriptions <= 155, for every weekend to 2027", () => {
  const windows = allWindows();
  assert.ok(windows.length > 60);
  for (const window of windows) {
    for (const locale of WEEKEND_LOCALES) {
      for (const zone of ZONES) {
        const title = zoneTitle(zone, locale, window);
        const description = zoneDescription(zone, locale, window);
        assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
        assert.ok(description.length <= DESCRIPTION_LIMIT, `${description} (${description.length})`);
        assert.ok(title.includes(`(${weekendRange(locale, window)})`), title);
        assert.ok(title.includes(zone.name[locale].replace(/^Província/, "província").replace(/^Provincia/, "provincia")), title);
      }
      const hub = hubMeta(locale, window);
      assert.ok(hub.title.length <= TITLE_LIMIT, hub.title);
      assert.ok(hub.description.length <= DESCRIPTION_LIMIT, hub.description);
      assert.ok(hub.title.includes(weekendRange(locale, window)));
    }
  }
});

test("metadata: the query's words, and the same window as the Catalonia page", () => {
  const w = { from: "2026-11-06", to: "2026-11-08", long: false };
  assert.equal(zoneTitle(zoneById("girona"), "ca", w), "Què fer aquest cap de setmana a Girona (6–8 nov)");
  assert.equal(zoneTitle(zoneById("girona"), "es", w), "Qué hacer este fin de semana en Girona (6–8 nov)");
  assert.equal(zoneTitle(zoneById("costa-brava"), "es", w), "Qué hacer este fin de semana en la Costa Brava (6–8 nov)");
  assert.equal(hubMeta("ca", w).title, "Fires i mercats aquest cap de setmana (6–8 nov)");
  assert.equal(zoneH1(zoneById("girona"), "es"), "Qué hacer este fin de semana en Girona y provincia");
  // The Catalonia page's title is unchanged by the shared range helper.
  assert.equal(weekendTitle("ca", WINDOW), "Què fer aquest cap de setmana a Catalunya (30 oct–1 nov)");
  assert.equal(weekendTitle("es", { from: "2026-12-25", to: "2026-12-27", long: true }), "Qué hacer este fin de semana en Cataluña (25–27 dic)");
});

test("metadata: canonical and hreflang between the two editions, x-default to Catalan", () => {
  const zone = zoneById("costa-daurada");
  const meta = buildMetadata({ locale: "es", path: zonePath("es", zone), title: "t", translations: zoneTranslations(zone) });
  const alternates = meta.alternates as { canonical: string; languages: Record<string, string> };
  assert.equal(alternates.canonical, absoluteUrl("/es/fin-de-semana/costa-dorada/"));
  assert.ok(Object.values(alternates.languages).includes(absoluteUrl("/ca/cap-de-setmana/costa-daurada/")));
  assert.equal(alternates.languages["x-default"], absoluteUrl("/ca/cap-de-setmana/costa-daurada/"));
  assert.equal(Object.keys(alternates.languages).length, 3, "ca, es and x-default only");
});

test("page text: dates, long weekends and the wider area in words", () => {
  assert.equal(rangeLong(WINDOW, "ca"), "Del divendres 30 d'octubre al diumenge 1 de novembre de 2026");
  assert.equal(rangeLong(WINDOW, "es"), "Del viernes 30 de octubre al domingo 1 de noviembre de 2026");
  assert.equal(longWeekendNote(WINDOW, "ca"), null);
  const christmas = weekendWindow("2026-12-23");
  assert.match(longWeekendNote(christmas, "ca") ?? "", /^És pont: Nadal \(divendres 25 de desembre\) i Sant Esteve \(dissabte 26 de desembre\) són festius a tot Catalunya/);
  assert.equal(dayRange("2026-10-30", "2026-11-01", "es"), "30 de octubre – 1 de noviembre");
  assert.equal(widerPhrase(zoneById("girona"), "ca"), "de tota la província de Girona");
  assert.equal(widerPhrase(zoneById("provincia-barcelona"), "es"), "de toda la provincia de Barcelona");
});

/* -------------------------------------------------------------------------- */
/* Guidance data: trains, comarques                                           */
/* -------------------------------------------------------------------------- */

test("stations are placed only when their name starts with a municipality's", () => {
  assert.equal(stationMunicipality("Sabadell Sud")?.name, "Sabadell");
  assert.equal(stationMunicipality("Lleida-Pirineus")?.name, "Lleida");
  assert.equal(stationMunicipality("Cabrera de Mar-Vilassar de Mar")?.name, "Cabrera de Mar");
  assert.equal(stationMunicipality("Salou - Port Aventura")?.name, "Salou");
  assert.equal(stationMunicipality("Les Franqueses-Granollers Nord"), undefined, "not Les, in Aran");
  assert.equal(stationMunicipality("Sant Vicenç de Calders"), undefined);
  assert.equal(stationMunicipality("Aeroport"), undefined);
});

test("rail lines per zone, from the Rodalies snapshot", () => {
  const lines = (zone: string) => Object.fromEntries(linesIn(zoneById(zone as never)).map((l) => [l.id, l.stations]));
  assert.ok(lines("costa-brava").R11?.includes("Figueres"));
  assert.ok(lines("costa-brava").R11?.includes("Girona"));
  assert.ok(lines("maresme").R1?.includes("Mataró"));
  assert.ok(lines("pirineu").R3?.includes("Puigcerdà"));
  assert.deepEqual(Object.keys(lines("pirineu")), ["R3"]);
  assert.deepEqual(Object.keys(lines("baix-emporda")), [], "no station in the Baix Empordà");
  assert.ok(lines("valles-occidental").R4?.includes("Terrassa Est"));
});

test("comarques of each zone", () => {
  assert.deepEqual(comarquesIn(zoneById("costa-brava")).map((c) => SNAPSHOT.comarques[c]), ["Alt Empordà", "Baix Empordà", "Gironès", "Pla de l'Estany", "Selva"]);
  assert.equal(municipalitiesIn(zoneById("maresme")).length, 30);
  assert.equal(municipalitiesIn(zoneById("barcelona")).length, 1);
});

test("fair websites are normalised to one https address", () => {
  assert.equal(cleanWeb("www.firagirona.com"), "https://www.firagirona.com/");
  assert.equal(cleanWeb("www.turismemonistrol.cat / www.monistrodemontserrat.cat"), "https://www.turismemonistrol.cat/");
  assert.equal(cleanWeb("http://olost.cat"), "https://olost.cat/");
  assert.equal(cleanWeb(""), null);
  assert.equal(cleanWeb("telefon"), null);
});

/* -------------------------------------------------------------------------- */
/* Revalidation by the nightly cron                                           */
/* -------------------------------------------------------------------------- */

test("cron: the pages are rebuilt the night the weekend changes and the night after", () => {
  // Monday 2 Nov 2026: the weekend of 30 Oct - 1 Nov is over.
  assert.equal(weekendRefreshDue("2026-11-02"), true);
  assert.equal(weekendRefreshDue("2026-11-03"), true);
  for (const day of ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]) assert.equal(weekendRefreshDue(day), false, day);
  assert.deepEqual(refreshNights("2026-11-02", 28), ["2026-11-02", "2026-11-03", "2026-11-09", "2026-11-10", "2026-11-16", "2026-11-17", "2026-11-23", "2026-11-24"]);
  // Easter Monday 2027 belongs to the weekend before it: the change is on Tuesday.
  assert.equal(weekendRefreshDue("2027-03-29"), false);
  assert.equal(weekendRefreshDue("2027-03-30"), true);
  assert.equal(windowStartedOn("2026-11-05"), "2026-11-02");
});

test("cron: every family path on refresh nights, none on the others", () => {
  const paths = weekendRefreshPaths("2026-11-02");
  assert.equal(paths.length, weekendFamilyPaths().length);
  assert.ok(paths.includes("/ca/cap-de-setmana/girona"));
  assert.ok(paths.includes("/es/fin-de-semana"));
  assert.ok(paths.every((p) => !p.endsWith("/")));
  assert.deepEqual(weekendRefreshPaths("2026-11-05"), []);
  const cron = readFileSync(join(ROOT, "src/app/api/cron/publish-scheduled/route.ts"), "utf8");
  assert.match(cron, /weekendRefreshPaths\(todayInCatalonia\(\)\)/);
  assert.ok(cron.indexOf("weekendRefreshPaths(") < cron.indexOf("getDb()"), "before the database step");
});

/* -------------------------------------------------------------------------- */
/* Sitemap and links                                                          */
/* -------------------------------------------------------------------------- */

test("sitemap: hubs and shipped zones in both locales, nothing when indexing is off", () => {
  const paths = weekendFamilyPaths();
  assert.equal(paths.length, 2 * (1 + shippedZones().length));
  assert.equal(paths[0]?.path, "/ca/cap-de-setmana/");
  assert.equal(new Set(paths.map((p) => p.path)).size, paths.length);
  assert.ok(!paths.some((p) => p.path.includes("alt-emporda")));
  for (const p of paths) assert.ok(p.path === p.translations.ca || p.path === p.translations.es);
  assert.deepEqual(weekendSitemapEntries("2026-11-05"), []);
  assert.equal(weekendLastModified("2026-11-05"), "2026-11-02");
  assert.equal(weekendLastModified("2026-10-28"), SNAPSHOT.readOn);
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.weekendSitemapEntries\(\)/);
});

test("links: the Catalonia weekend block and the Christmas markets guide point at the hub", () => {
  const block = readFileSync(join(ROOT, "src/components/blocks/WeekendAgenda.tsx"), "utf8");
  assert.match(block, /weekendHubPath\(locale\)/);
  const christmas = readFileSync(join(ROOT, "src/lib/content/batch02/christmas.ts"), "utf8");
  for (const locale of ["ca", "es"] as WeekendLocale[]) assert.ok(christmas.includes(`weekendHubPath("${locale}")`), locale);
});
