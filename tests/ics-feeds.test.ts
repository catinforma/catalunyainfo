import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";

import { councilApproved2027, municipalities, municipalityBySlug, NEXT, nextYearPublished, regionalDays, isAran, YEAR, yearRows } from "../src/lib/programmatic/holidays/data.ts";
import {
  FEED_LOCALES,
  cityFeed,
  cityFeedPath,
  feedPath,
  googleCalendarUrl,
  renderFeed,
  slugFromFile,
  subscribeBlock,
  townFeed,
  townFeedPath,
  webcalUrl,
  type FeedModel,
} from "../src/lib/programmatic/ics/feeds.ts";
import { escapeText, foldLine, icsStamp, nextDay, serializeCalendar } from "../src/lib/programmatic/ics/serialize.ts";
import { CITIES, cityCalendar, local2027 } from "../src/lib/programmatic/spain-2027/cities.ts";
import { ALWAYS_NOINDEX_SOURCES } from "../src/lib/security-headers.ts";

/**
 * The holiday calendar feeds (.ics): lib/programmatic/ics/, src/app/ics/,
 * and the "add to your calendar" block on the town and city pages.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const octets = (s: string) => Buffer.byteLength(s, "utf8");

/** RFC 5545 3.1 unfolding: CRLF followed by one space or tab is removed. */
function unfold(text: string): string[] {
  return text.replace(/\r\n[ \t]/g, "").split("\r\n");
}

function unescapeText(value: string): string {
  return value.replace(/\\([\\;,nN])/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c));
}

interface ParsedEvent {
  uid: string;
  start: string;
  end: string;
  summary: string;
  stamp: string;
  categories: string;
}

function parse(text: string): { props: Map<string, string>; events: ParsedEvent[] } {
  const lines = unfold(text);
  assert.equal(lines.at(-1), "", "the text ends in CRLF");
  lines.pop();
  const props = new Map<string, string>();
  const events: ParsedEvent[] = [];
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    const colon = line.indexOf(":");
    assert.ok(colon > 0, `content line: ${line}`);
    const name = line.slice(0, colon);
    const value = line.slice(colon + 1);
    if (line === "BEGIN:VEVENT") {
      assert.equal(current, null, "VEVENTs are not nested");
      current = {};
    } else if (line === "END:VEVENT") {
      assert.ok(current);
      events.push({
        uid: current.UID!,
        start: current["DTSTART;VALUE=DATE"]!,
        end: current["DTEND;VALUE=DATE"]!,
        summary: unescapeText(current.SUMMARY!),
        stamp: current.DTSTAMP!,
        categories: current.CATEGORIES ?? "",
      });
      current = null;
    } else if (current) {
      current[name] = value;
    } else {
      props.set(name, value);
    }
  }
  assert.equal(current, null);
  return { props, events };
}

const iso = (ics: string) => `${ics.slice(0, 4)}-${ics.slice(4, 6)}-${ics.slice(6, 8)}`;

/** Every structural rule the clients rely on, on one rendered feed. */
function assertWellFormed(text: string, label: string): ReturnType<typeof parse> {
  assert.ok(text.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"), label);
  assert.ok(text.endsWith("END:VCALENDAR\r\n"), label);
  assert.doesNotMatch(text.replace(/\r\n/g, ""), /[\r\n]/, `${label}: no bare CR or LF`);
  for (const line of text.split("\r\n")) assert.ok(octets(line) <= 75, `${label}: ${octets(line)} octets: ${line}`);
  const parsed = parse(text);
  for (const key of ["PRODID", "X-WR-CALNAME", "NAME", "REFRESH-INTERVAL;VALUE=DURATION", "X-PUBLISHED-TTL"]) assert.ok(parsed.props.get(key), `${label}: ${key}`);
  assert.equal(parsed.props.get("REFRESH-INTERVAL;VALUE=DURATION"), "P1D");
  assert.equal(parsed.props.get("X-PUBLISHED-TTL"), "P1D");
  const uids = new Set<string>();
  for (const e of parsed.events) {
    assert.match(e.uid, /^[a-z0-9-]+@catalunyainfo\.com$/, label);
    assert.ok(!uids.has(e.uid), `${label}: duplicate UID ${e.uid}`);
    uids.add(e.uid);
    assert.match(e.stamp, /^\d{8}T\d{6}Z$/, label);
    assert.match(e.start, /^\d{8}$/, label);
    assert.equal(e.end, nextDay(iso(e.start)).replace(/-/g, ""), `${label}: DTEND is the day after DTSTART`);
  }
  return parsed;
}

/* -------------------------------------------------------------------------- */
/* The serializer                                                             */
/* -------------------------------------------------------------------------- */

test("serializer: TEXT escaping (backslash, semicolon, comma, newline)", () => {
  assert.equal(escapeText("a\\b;c,d\ne\r\nf"), "a\\\\b\\;c\\,d\\ne\\nf");
  assert.equal(escapeText("Cap d'Any · Catalunya: \"ok\""), "Cap d'Any · Catalunya: \"ok\"");
  assert.equal(unescapeText(escapeText("x;y,z\\w\nv")), "x;y,z\\w\nv");
});

test("serializer: lines folded at 75 octets, continuation starts with a space, UTF-8 never cut", () => {
  assert.equal(foldLine("A".repeat(75)), "A".repeat(75));
  const ascii = foldLine("B".repeat(200));
  const parts = ascii.split("\r\n");
  assert.equal(octets(parts[0]!), 75);
  for (const p of parts.slice(1)) {
    assert.ok(p.startsWith(" "));
    assert.ok(octets(p) <= 75);
  }
  assert.equal(parts.map((p, i) => (i ? p.slice(1) : p)).join(""), "B".repeat(200));
  assert.equal(octets(parts[1]!), 75, "a full continuation line is 75 octets, the space included");

  // Two-byte (à) and three-byte (·) characters straddling the limit.
  for (const text of ["SUMMARY:" + "à".repeat(80), "DESCRIPTION:" + "x".repeat(62) + "·".repeat(30), "X:" + "€😀".repeat(40)]) {
    const folded = foldLine(text);
    for (const line of folded.split("\r\n")) assert.ok(octets(line) <= 75, `${octets(line)}: ${line}`);
    assert.equal(folded.replace(/\r\n /g, ""), text, "unfolds to the original");
    assert.doesNotMatch(folded, /�/);
  }
});

test("serializer: CRLF everywhere, all-day events, DTSTAMP, duplicate UIDs refused", () => {
  const cal = {
    prodId: "-//Test//Test//CA",
    name: "Festius, prova; amb \\ caràcters",
    description: "Línia 1\nLínia 2",
    url: "https://www.catalunyainfo.com/ca/festius/barcelona/",
    refresh: "P1D",
    stamp: "2026-10-30",
    events: [
      { uid: "a@catalunyainfo.com", date: "2026-12-31", summary: "Prova, amb; coma", categories: ["Festa local", "x,y"] },
      { uid: "b@catalunyainfo.com", date: "2027-02-28", summary: "Últim de febrer" },
    ],
  };
  const text = serializeCalendar(cal);
  const parsed = assertWellFormed(text, "fixture");
  assert.match(text, /\r\nX-WR-CALNAME:Festius\\, prova\\; amb \\\\ caràcters\r\n/);
  assert.match(text, /\r\nX-WR-CALDESC:Línia 1\\nLínia 2\r\n/);
  assert.match(text, /\r\nCATEGORIES:Festa local,x\\,y\r\n/);
  assert.deepEqual(parsed.events.map((e) => [e.start, e.end]), [["20261231", "20270101"], ["20270228", "20270301"]]);
  assert.equal(parsed.events[0]!.summary, "Prova, amb; coma");
  assert.equal(parsed.events[0]!.stamp, "20261030T000000Z");
  assert.equal(icsStamp("2026-11-13T10:20:30.456Z"), "20261113T102030Z");
  assert.throws(() => serializeCalendar({ ...cal, events: [cal.events[0]!, cal.events[0]!] }), /duplicate UID/);
  assert.throws(() => serializeCalendar({ ...cal, events: [{ uid: "c@x", date: "2026-1-1", summary: "x" }] }), /ISO date/);
});

/* -------------------------------------------------------------------------- */
/* Catalan towns: what the page states as confirmed, and nothing else         */
/* -------------------------------------------------------------------------- */

const eventKey = (e: { date: string; uid: string }) => `${e.date}:${e.uid.split("-").at(-1)!.split("@")[0]}`;

test("towns: every event is a confirmed row of the page (2026 and 2027), well formed, in ca/es/en", () => {
  for (const m of municipalities()) {
    for (const locale of FEED_LOCALES) {
      const model = townFeed(locale, m);
      // The page's rows: 2026 as the page prints it; 2027 without the council's days pending the DOGC.
      const expected = [YEAR, NEXT].flatMap((year) => yearRows(m, year, locale, { council: true }).filter((r) => !r.pending).map((r) => `${r.date}:${r.kind}`));
      const got = model.calendar.events.map((e) => `${e.date}:${e.uid.replace(/@.*$/, "").split("-").slice(-1)[0]}`);
      assert.deepEqual(got, expected, `${m.slug} ${locale}`);
      for (const e of model.calendar.events) {
        assert.equal(e.scope, e.uid.includes("-local@") ? "local" : "regional");
        assert.ok(e.summary.length > 0);
      }
      // Regional days of 2027 are the Catalonia-wide order (with Aran's swap).
      assert.deepEqual(
        model.calendar.events.filter((e) => e.date.startsWith(String(NEXT)) && e.scope === "regional").map((e) => e.date),
        regionalDays(NEXT, isAran(m)).map((d) => d.date),
        m.slug,
      );
      if (locale === "ca" && m.rank <= 40) {
        const parsed = assertWellFormed(renderFeed(model), `${m.slug} ${locale}`);
        assert.deepEqual(parsed.events.map((e) => iso(e.start)), model.calendar.events.map((e) => e.date));
      }
    }
  }
});

test("towns: a council-approved day still pending the DOGC never reaches the feed", () => {
  let checked = 0;
  for (const m of municipalities()) {
    const council = councilApproved2027(m.slug);
    if (!council) continue;
    const local2027 = townFeed("ca", m).calendar.events.filter((e) => e.scope === "local" && e.date.startsWith(String(NEXT)));
    assert.deepEqual(local2027, [], m.slug);
    checked += 1;
  }
  if (!nextYearPublished()) assert.ok(checked > 0, "some councils have approved 2027 days");
});

test("towns: the 2026 local days are the DOGC ones, labelled local; Barcelona's by hand", () => {
  const bcn = townFeed("ca", municipalityBySlug("barcelona")!);
  const local = bcn.calendar.events.filter((e) => e.scope === "local").map((e) => e.date);
  assert.deepEqual(local, ["2026-05-25", "2026-09-24"]);
  const text = renderFeed(bcn);
  assert.match(text, /\r\nSUMMARY:Festa local · Barcelona\r\n/);
  assert.match(text, /\r\nSUMMARY:Nadal · Catalunya\r\n/);
  assert.match(text, /\r\nCATEGORIES:Festa local\r\n/);
  assert.match(text, /\r\nCATEGORIES:Festiu de Catalunya\r\n/);
  assert.match(text, /\r\nX-WR-CALNAME:Festius de Barcelona · CatalunyaInfo\r\n/);
  assert.deepEqual(bcn.years, [2026, 2027]);
  // Stable: the same text on every render (DTSTAMP is the data's date, not the clock).
  assert.equal(renderFeed(townFeed("ca", municipalityBySlug("barcelona")!)), text);
});

/* -------------------------------------------------------------------------- */
/* Spanish cities                                                             */
/* -------------------------------------------------------------------------- */

test("cities: every event is a row of the 2027 page (cityCalendar), local days only where published", () => {
  for (const c of CITIES) {
    for (const locale of FEED_LOCALES) {
      const model: FeedModel = cityFeed(locale, c);
      assert.deepEqual(
        model.calendar.events.map((e) => eventKey(e)),
        cityCalendar(c).map((d) => `${d.date}:${d.kind === "national-kept" ? "kept" : d.kind}`),
        `${c.slug} ${locale}`,
      );
      assert.ok(model.calendar.events.every((e) => e.date.startsWith("2027-")));
      if (!local2027(c)) {
        // Only a day an official text fixed for the whole community (Navarra's 3 December) can be local here.
        for (const e of model.calendar.events.filter((x) => x.scope === "local")) assert.equal(c.region, "NC", `${c.slug} ${e.date}`);
      }
      assert.equal(model.localPending, c.status2027 === "pending");
      if (locale === "es") {
        const parsed = assertWellFormed(renderFeed(model), `${c.slug} ${locale}`);
        assert.deepEqual(parsed.events.map((e) => iso(e.start)), model.calendar.events.map((e) => e.date));
      }
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Routes and headers                                                         */
/* -------------------------------------------------------------------------- */

const TOWN_ROUTE = "src/app/ics/[locale]/[file]/route.ts";
const CITY_ROUTE = "src/app/ics/[locale]/2027/[comunidad]/[file]/route.ts";

test("routes: force-static, revalidated daily, on demand; text/calendar; unknown town or city → 404", async () => {
  for (const file of [TOWN_ROUTE, CITY_ROUTE]) {
    const source = read(file);
    assert.match(source, /^export const dynamic = "force-static";$/m, file);
    assert.match(source, /^export const revalidate = 86400;$/m, file);
    assert.match(source, /^export const dynamicParams = true;$/m, file);
    assert.doesNotMatch(source, /@\/lib\/db|repository/, `${file}: no database`);
  }
  const town = await import("../src/app/ics/[locale]/[file]/route.ts");
  const city = await import("../src/app/ics/[locale]/2027/[comunidad]/[file]/route.ts");
  const req = new Request("http://localhost/");

  const ok = await town.GET(req, { params: Promise.resolve({ locale: "ca", file: "barcelona.ics" }) });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("content-type"), "text/calendar; charset=utf-8");
  const body = await ok.text();
  assertWellFormed(body, "route barcelona");
  assert.equal(body, renderFeed(townFeed("ca", municipalityBySlug("barcelona")!)));

  for (const params of [
    { locale: "ca", file: "atlantis.ics" },
    { locale: "fr", file: "barcelona.ics" },
    { locale: "ca", file: "barcelona" },
    { locale: "ca", file: "barcelona.ics.bak" },
    { locale: "ca", file: "../barcelona.ics" },
    { locale: "ca", file: "Barcelona.ics" },
  ]) {
    const res = await town.GET(req, { params: Promise.resolve(params) });
    assert.equal(res.status, 404, JSON.stringify(params));
  }

  const sevilla = await city.GET(req, { params: Promise.resolve({ locale: "en", comunidad: "andalucia", file: "sevilla.ics" }) });
  assert.equal(sevilla.status, 200);
  assert.equal(sevilla.headers.get("content-type"), "text/calendar; charset=utf-8");
  assert.match(await sevilla.text(), /X-WR-CALNAME:Seville public holidays 2027/);
  for (const params of [
    { locale: "es", comunidad: "andalucia", file: "atlantis.ics" },
    { locale: "es", comunidad: "andalusia", file: "sevilla.ics" },
    { locale: "es", comunidad: "aragon", file: "sevilla.ics" },
    { locale: "de", comunidad: "andalucia", file: "sevilla.ics" },
  ]) {
    assert.equal((await city.GET(req, { params: Promise.resolve(params) })).status, 404, JSON.stringify(params));
  }

  assert.equal(slugFromFile("sant-cugat-del-valles.ics"), "sant-cugat-del-valles");
  assert.equal(slugFromFile("sant-cugat-del-valles"), null);
});

// Next's own matcher for `headers()` sources, as tests/embed-2027.test.ts uses it.
const require = createRequire(import.meta.url);
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match.js") as {
  getPathMatch: (source: string, options: object) => (path: string) => false | object;
};
const { modifyRouteRegex } = require("next/dist/lib/redirect-status.js") as { modifyRouteRegex: (regex: string) => string };
const matches = (source: string, path: string) =>
  Boolean(getPathMatch(source, { strict: true, removeUnnamedParams: true, regexModifier: (r: string) => modifyRouteRegex(r) })(path));

test("headers: X-Robots-Tag noindex on every feed, on the canonical production host too", async () => {
  assert.ok(ALWAYS_NOINDEX_SOURCES.includes("/ics/:path*"));
  const saved = { VERCEL_ENV: process.env.VERCEL_ENV, NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING };
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  try {
    const { default: config } = await import(`${new URL("../next.config.ts", import.meta.url).href}?ics=1`);
    const rules = (await config.headers()) as { source: string; missing?: { type: string; value: string }[]; headers: { key: string; value: string }[] }[];
    for (const path of ["/ics/ca/barcelona.ics", "/ics/es/2027/andalucia/sevilla.ics", "/ics/en/girona.ics"]) {
      const robots = rules
        .filter((r) => matches(r.source, path) && !r.missing?.some((m) => m.type === "host" && new RegExp(`^${m.value}$`).test("www.catalunyainfo.com")))
        .flatMap((r) => r.headers)
        .filter((h) => h.key.toLowerCase() === "x-robots-tag");
      assert.ok(robots.length > 0 && robots.every((h) => /noindex/.test(h.value)), path);
    }
    // And a town page itself stays indexable.
    assert.ok(!rules.some((r) => matches(r.source, "/ca/festius/barcelona/") && !r.missing && r.headers.some((h) => h.key === "X-Robots-Tag")));
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

test("sitemap: the feeds are never listed", () => {
  assert.doesNotMatch(read("src/app/sitemap.ts"), /\/ics\/|ics\/feeds/);
});

/* -------------------------------------------------------------------------- */
/* The block on the pages                                                     */
/* -------------------------------------------------------------------------- */

test("block: webcal, Google Calendar and download links for the place's feed, in ca/es/en", () => {
  const m = municipalityBySlug("girona")!;
  const sevilla = CITIES.find((c) => c.slug === "sevilla")!;
  assert.equal(townFeedPath("ca", "girona"), "/ics/ca/girona.ics");
  assert.equal(cityFeedPath("es", sevilla), "/ics/es/2027/andalucia/sevilla.ics");
  assert.equal(webcalUrl("https://www.catalunyainfo.com/ics/ca/girona.ics"), "webcal://www.catalunyainfo.com/ics/ca/girona.ics");
  assert.equal(
    googleCalendarUrl("https://www.catalunyainfo.com/ics/ca/girona.ics"),
    "https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Fwww.catalunyainfo.com%2Fics%2Fca%2Fgirona.ics",
  );
  const titles = { ca: "Afegeix al teu calendari", es: "Añádelo a tu calendario", en: "Add to your calendar" };
  for (const locale of FEED_LOCALES) {
    for (const place of [{ kind: "town" as const, m }, { kind: "city" as const, c: sevilla }]) {
      const b = subscribeBlock(locale, place);
      const path = feedPath(locale, place);
      assert.equal(b.title, titles[locale]);
      assert.equal(b.links.length, 3);
      assert.ok(b.url.endsWith(path));
      assert.equal(b.links[0]!.href, webcalUrl(b.url));
      assert.equal(b.links[1]!.href, googleCalendarUrl(b.url));
      assert.equal(b.links[2]!.href, path);
      assert.equal(b.links[2]!.type, "text/calendar");
      assert.match(b.lead, place.kind === "town" ? /2026/ : /2027/);
    }
  }
  const lead = subscribeBlock("ca", { kind: "town", m }).lead;
  if (!nextYearPublished()) assert.match(lead, /festius locals del 2027 s'hi afegiran/);
});

test("block: rendered on the Catalan town pages (ca, es, en) and the Spain 2027 city pages (es, ca, en)", () => {
  const component = read("src/components/programmatic/ics/CalendarSubscribe.tsx");
  assert.doesNotMatch(component, /^"use client"/m, "no client JS");
  assert.match(component, /className="ci-subscribe"/);
  assert.match(component, /aria-labelledby/);
  for (const [file, call] of [
    ["src/components/programmatic/holidays/MunicipalityPage.tsx", '<CalendarSubscribe locale={locale} place={{ kind: "town", m }} />'],
    ["src/components/programmatic/holidays/EnglishTownPage.tsx", '<CalendarSubscribe locale="en" place={{ kind: "town", m }} />'],
    ["src/components/programmatic/spain-2027/city-page.tsx", '<CalendarSubscribe locale="es" place={{ kind: "city", c }} />'],
    ["src/components/programmatic/spain-2027/city-page-intl.tsx", '<CalendarSubscribe locale={locale} place={{ kind: "city", c }} />'],
  ] as const) {
    assert.ok(read(file).includes(call), file);
  }
  assert.match(read("src/app/globals.css"), /\.ci-subscribe \{/);
});
