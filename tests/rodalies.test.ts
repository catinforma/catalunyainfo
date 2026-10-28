import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { AIRPORT } from "../src/lib/content/batch02/airport.ts";
import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { STRIKES_GUIDE } from "../src/lib/content/batch02/strikes.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import {
  FAILED_CACHE_CONTROL,
  MAX_SOURCE_AGE_MS,
  OK_CACHE_CONTROL,
  RENFE_ALERTS_URL,
  RODALIES_NOTICES_URL,
  buildAlertsResponse,
  fromRenfeFeed,
  fromRodaliesNotices,
  lineOfRoute,
  madridDateTime,
  plainText,
  type Fetcher,
} from "../src/lib/programmatic/rodalies/alerts.ts";
import { KEY_STATIONS, hubCopy, lineCopy, linesAt, siblingLinks } from "../src/lib/programmatic/rodalies/copy.ts";
import { liveLabels } from "../src/lib/programmatic/rodalies/labels.ts";
import { LINES, SNAPSHOT, lineById, siblings } from "../src/lib/programmatic/rodalies/data.ts";
import {
  alertText,
  alertsForLine,
  isStale,
  liveView,
  madridDate,
  minutesSince,
  noticeDay,
  parsePayload,
  STALE_AFTER_MS,
} from "../src/lib/programmatic/rodalies/live.ts";
import { LINE_OFFICIAL, officialUrl } from "../src/lib/programmatic/rodalies/official.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  hubMeta,
  hubMetadata,
  lineDescription,
  lineMetadata,
  lineStaticParams,
  lineTitle,
  resolveHub,
  resolveLine,
  rodaliesFamilyPaths,
  rodaliesSitemap,
} from "../src/lib/programmatic/rodalies/pages.ts";
import { hubPath, lineFromSlug, linePath, lineSlug } from "../src/lib/programmatic/rodalies/paths.ts";
import { routesFromGtfs } from "../src/lib/programmatic/rodalies/prepare.ts";
import { LINE_IDS, type AlertsOk, type AlertsPayload, type CompactAlert } from "../src/lib/programmatic/rodalies/types.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

/**
 * Rodalies live status per line (28 Oct 2026).
 *
 * Fixtures recorded on 28 Oct 2026 at about 10:37 UTC (tests/fixtures/rodalies/):
 *  - rodalies-notices: Rodalies de Catalunya's notices, the list "Estat del
 *    servei" shows on rodalies.gencat.cat, complete (6 notices);
 *  - renfe-alerts: Renfe's GTFS-RT alerts.json, trimmed to the 9 Rodalies
 *    entities plus three from other networks. Its header timestamp and
 *    Last-Modified both said 7 Oct 2026 07:32:52 UTC: three weeks old on the
 *    day it was read, and none of the 6 official notices of that day in it.
 */

const ROOT = join(import.meta.dirname, "..");
const fixture = (name: string) => JSON.parse(readFileSync(join(ROOT, "tests/fixtures/rodalies", name), "utf8")) as unknown;
const NOTICES = fixture("rodalies-notices-2026-10-28.json");
const RENFE = fixture("renfe-alerts-2026-10-28.json");
const READ_AT = new Date("2026-10-28T10:38:00Z");

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

test("snapshot: the 19 official lines, in Rodalies' order, no R12", () => {
  assert.deepEqual(
    LINES.map((l) => l.id),
    [...LINE_IDS],
  );
  assert.equal(LINES.length, 19);
  assert.ok(!LINES.some((l) => l.name === "R12"));
  assert.match(SNAPSHOT.readOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(SNAPSHOT.readOn, "2026-10-28");
  assert.equal(LINES.filter((l) => l.service === "RODALIES").length, 8);
  assert.equal(LINES.filter((l) => l.service === "REGIONAL").length, 11);
  for (const source of Object.values(SNAPSHOT.sources)) {
    assert.match(source.url, /^https:\/\/(serveisgrs\.rodalies\.gencat\.cat|ssl\.renfe\.com)\//);
    assert.ok(source.name && source.publisher && source.terms);
  }
});

test("snapshot: every line runs from its first station to its last, with unique station codes", () => {
  for (const line of LINES) {
    assert.ok(line.stations.length >= 2, line.id);
    assert.equal(line.origin, line.stations[0]!.name, `${line.id} origin`);
    assert.equal(line.destination, line.stations.at(-1)!.name, `${line.id} destination`);
    assert.equal(new Set(line.stations.map((s) => s.id)).size, line.stations.length, `${line.id} station codes`);
    assert.ok(line.journey.includes(" - "), `${line.id} journey`);
    for (const station of line.stations) {
      assert.match(station.id, /^\d{5}$/, `${line.id}/${station.name}`);
      assert.ok(!station.lines.includes(line.id), `${line.id}/${station.name} lists itself`);
    }
  }
});

test("snapshot known answers, from the official API on 28 Oct 2026", () => {
  const r2n = lineById("R2N");
  assert.equal(r2n.name, "R2 Nord");
  assert.equal(r2n.stations[0]!.name, "Aeroport");
  assert.equal(r2n.stations.length, 21);
  const r2s = lineById("R2S");
  assert.equal(r2s.name, "R2 Sud");
  assert.equal(r2s.stations.length, 17);
  assert.ok(r2s.stations.every((s) => s.accessible), "every R2 Sud station is flagged accessible");
  assert.equal(r2s.via.ca, "per Vilanova i la Geltrú");
  assert.deepEqual(
    lineById("RT2").stations.map((s) => s.name),
    ["Tarragona", "Salou - Port Aventura"],
  );
  assert.equal(lineById("R7").stations.length, 7);
  assert.equal(lineById("RG1").stations.length, 44);
  assert.equal(lineById("R11").destination, "Cerbère");
  const sants = lineById("R1").stations.find((s) => s.name === "Barcelona-Sants");
  assert.equal(sants?.id, "71801");
  assert.deepEqual(
    linesAt("Aeroport").map((l) => l.id),
    ["R2N"],
  );
  assert.deepEqual(
    linesAt("Girona").map((l) => l.id),
    ["R11", "RG1"],
  );
  assert.deepEqual(
    linesAt("Salou - Port Aventura").map((l) => l.id),
    ["R17", "RT2"],
  );
  const plcat = lineById("R1").stations.find((s) => s.name === "Barcelona-Plaça de Catalunya");
  assert.ok(plcat?.transfers.some((t) => t.type === "METRO" && t.id === "L1"));
  assert.ok(plcat?.transfers.some((t) => t.type === "RAILWAY" && t.id === "S1"));
});

test("snapshot: Renfe route ids map to official lines, every line has some", () => {
  const routes = Object.entries(SNAPSHOT.renfeRoutes);
  assert.ok(routes.length >= 70, `${routes.length} routes`);
  for (const [routeId, line] of routes) {
    assert.match(routeId, /^51T\d{4}[A-Z0-9]+$/);
    assert.ok((LINE_IDS as readonly string[]).includes(line), routeId);
  }
  for (const id of LINE_IDS) assert.ok(routes.some(([, line]) => line === id), `${id} has a route`);
  assert.equal(SNAPSHOT.renfeRoutes["51T0003R2N"], "R2N");
  assert.equal(SNAPSHOT.renfeRoutes["51T0007R2S"], "R2S");
});

test("prepare: routes.txt is read with Renfe's padding, Rodalies only, unknown short names reported", () => {
  const txt = [
    "route_id,route_short_name,route_long_name,route_type,route_color,route_text_color   ",
    "10T0001C1  ,C1  ,Principe Pio -Aeropuerto-T4 ,2,75B6E0,FFFFFF ",
    "51T0003R2N ,R2N ,Aeroport -Maçanet-Massanes ,2,D0DF00,FFFFFF ",
    "51T0017R3a ,R3a ,La Garriga -Ripoll ,2,E54A3C,FFFFFF ",
  ].join("\r\n");
  assert.deepEqual(routesFromGtfs(txt), { routes: { "51T0003R2N": "R2N" }, unknown: ["51T0017R3a:R3a"] });
});

test("official links: every line has a page, an X account and a Devolució Xpress answer", () => {
  assert.deepEqual(Object.keys(LINE_OFFICIAL).sort(), [...LINE_IDS].sort());
  assert.equal(Object.values(LINE_OFFICIAL).filter((o) => o.group === "barcelona").length, 8);
  for (const [id, o] of Object.entries(LINE_OFFICIAL)) {
    assert.match(o.page, /^servei_(rodalia_barcelona|regionals)\/[a-z0-9-]+$/, id);
    assert.match(o.x, /^[A-Za-z0-9]+$/, id);
    if (o.pdf) assert.match(o.pdf, /^https:\/\/rodalies\.gencat\.cat\/web\/\.content\/02_Horaris\/horaris\/R[0-9G]+\.pdf$/, id);
  }
  assert.equal(LINE_OFFICIAL.RT1.dx.stations, null, "RT1 is in no Devolució Xpress list");
  assert.deepEqual(LINE_OFFICIAL.RL4.dx.stations, ["Lleida-Pirineus"]);
  assert.ok(LINE_OFFICIAL.R3.dx.barcelona && LINE_OFFICIAL.R3.dx.stations?.includes("Puigcerdà"), "R3 has both");
  assert.equal(officialUrl.status("ca"), "https://rodalies.gencat.cat/ca/alteracions_del_servei/");
  for (const locale of LOCALES) assert.match(officialUrl.status(locale), /^https:\/\/rodalies\.gencat\.cat\/(ca|es|en)\/alteracions_del_servei\/$/);
});

/* -------------------------------------------------------------------------- */
/* The route handler: mapping, with the recorded feeds                        */
/* -------------------------------------------------------------------------- */

test("Rodalies notices (fixture): six notices, lines as the official page names them", () => {
  const parsed = fromRodaliesNotices(NOTICES);
  assert.ok(parsed);
  assert.equal(parsed.alerts.length, 6);
  assert.deepEqual(parsed.unmapped, []);
  const [r1, strike, rl4, r13r14, r7, r3] = parsed.alerts;
  assert.deepEqual(r1?.lines, ["R1"]);
  assert.equal(r1?.date, "2026-10-28");
  assert.equal(r1?.time, "11:29");
  assert.match(r1!.text.ca, /^Un cop resolta la incidència/);
  assert.match(r1!.text.es, /^Una vez resuelta la incidencia/);
  assert.equal(r1?.text.en, null, "the API's 'en' is the Catalan text, so there is no English");
  assert.equal(strike?.lines.length, 19, "the 29 Oct strike notice names every line");
  assert.match(strike!.text.ca, /SEMAF el 29 d'octubre/);
  assert.match(strike!.text.ca, /\n/, "line breaks kept");
  assert.deepEqual(rl4?.lines, ["RL4"]);
  assert.deepEqual([...(r13r14?.lines ?? [])].sort(), ["R13", "R14"]);
  assert.deepEqual(r7?.lines, ["R7"]);
  assert.match(r3!.text.ca, /la Garriga i Puigcerdà\/La Tor de Querol/);
  assert.deepEqual(alertsForLine(parsed.alerts, "R3").map((a) => a.id), ["rodalies-522291", "rodalies-521823"]);
  assert.deepEqual(alertsForLine(parsed.alerts, "R2N").map((a) => a.id), ["rodalies-522291"]);
  assert.equal(fromRodaliesNotices({ nope: true }), null, "a different shape is not 'no notices'");
});

test("Renfe GTFS-RT (fixture): Rodalies alerts only, mapped by route id, Catalan and Spanish split", () => {
  const parsed = fromRenfeFeed(RENFE);
  assert.ok(parsed);
  assert.equal(parsed.updatedAt.toISOString(), "2026-10-07T07:32:52.000Z");
  assert.equal(parsed.alerts.length, 9, "the Madrid and Bilbao alerts are left out");
  assert.deepEqual(parsed.unmapped, ["51T0017R3a", "51T0018R3a"], "R3a is not an official line: reported, not guessed");
  const byId = (id: string) => parsed.alerts.find((a) => a.id === `renfe-${id}`);
  assert.deepEqual(byId("AVISO_518352")?.lines, ["R2"]);
  assert.equal(byId("AVISO_518352")?.text.ca, "Sense servei ferroviari");
  assert.equal(byId("AVISO_518352")?.text.es, "Sin servicio ferroviario.");
  assert.deepEqual(byId("AVISO_518337")?.lines, ["R3"]);
  assert.equal(byId("AVISO_518337")?.date, "2026-10-07");
  assert.equal(byId("AVISO_518337")?.time, "09:23", "07:23 UTC is 09:23 in Madrid (summer time)");
  assert.deepEqual(byId("AVISO_518345")?.lines, ["R8"]);
  const regional = byId("AVISO_518323")?.lines ?? [];
  assert.deepEqual(regional, ["R11", "R13", "R14", "R15", "R16", "R17", "RG1", "RT1", "RT2", "RL3", "RL4"]);
  const all = parsed.alerts.filter((a) => a.id === "renfe-AVISO_518187").map((a) => a.lines.length);
  assert.deepEqual(all.sort((a, b) => a - b), [1, 19]);
  assert.equal(fromRenfeFeed({ entity: [] }), null, "no header timestamp: unreadable");
});

test("route ids: the GTFS table first, then the id's own suffix if it is an official line", () => {
  assert.equal(lineOfRoute("51T0003R2N "), "R2N");
  assert.equal(lineOfRoute("51T9999R4"), "R4", "an id the static table does not have yet");
  assert.equal(lineOfRoute("51T0017R3a"), null);
  assert.equal(lineOfRoute("10T0011C4"), null);
  assert.equal(lineOfRoute("51T0001R1", {}), "R1");
});

test("plain text: tags out, entities decoded, line breaks kept, nothing reworded, long text cut", () => {
  assert.equal(plainText("<p>Circulació&nbsp;entre <b>Vic</b> i Ripoll</p><p>Servei alternatiu</p>"), "Circulació entre Vic i Ripoll\nServei alternatiu");
  assert.equal(plainText("A &amp; B &quot;C&quot; &#39;D&#39;"), `A & B "C" 'D'`);
  assert.equal(plainText("<script>alert(1)</script>ok"), "alert(1)ok", "markup never survives");
  assert.equal(plainText(undefined), "");
  const long = plainText("x".repeat(5000));
  assert.ok(long.length <= 1200 && long.endsWith("…"));
  assert.deepEqual(madridDateTime(new Date("2026-12-31T23:30:00Z")), { date: "2027-01-01", time: "00:30" });
});

function fakeFetch(map: Record<string, () => Response | Promise<Response>>): { fetcher: Fetcher; calls: string[] } {
  const calls: string[] = [];
  const fetcher: Fetcher = async (url) => {
    calls.push(url);
    const make = map[url];
    if (!make) throw new Error(`unexpected ${url}`);
    return make();
  };
  return { fetcher, calls };
}

const json = (body: unknown, status = 200) => () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("handler: Rodalies answers -> 200, one fetch, CDN-cached 120 s + 300 s stale", async () => {
  const { fetcher, calls } = fakeFetch({ [RODALIES_NOTICES_URL]: json(NOTICES) });
  const res = await buildAlertsResponse(fetcher, READ_AT);
  assert.equal(res.status, 200);
  assert.equal(res.headers["cache-control"], "public, s-maxage=120, stale-while-revalidate=300");
  assert.equal(OK_CACHE_CONTROL, res.headers["cache-control"]);
  assert.deepEqual(calls, [RODALIES_NOTICES_URL]);
  assert.ok(res.body.ok);
  assert.equal(res.body.source, "rodalies");
  assert.equal(res.body.fetchedAt, READ_AT.toISOString());
  assert.equal(res.body.sourceUpdatedAt, null);
  assert.equal(res.body.alerts.length, 6);
});

test("handler failure paths: never stale alerts as current, never an empty list on failure", async () => {
  // Rodalies down, Renfe's feed three weeks old (as on 28 Oct 2026): stale, 503, short cache.
  let res = await buildAlertsResponse(fakeFetch({ [RODALIES_NOTICES_URL]: json({}, 500), [RENFE_ALERTS_URL]: json(RENFE) }).fetcher, READ_AT);
  assert.equal(res.status, 503);
  assert.equal(res.headers["cache-control"], FAILED_CACHE_CONTROL);
  assert.deepEqual(res.body, { ok: false, error: "stale", fetchedAt: READ_AT.toISOString(), sourceUpdatedAt: "2026-10-07T07:32:52.000Z" });

  // Rodalies answers something else entirely, Renfe recent: Renfe is used.
  const fresh = new Date(Date.parse("2026-10-07T07:32:52Z") + MAX_SOURCE_AGE_MS - 1000);
  res = await buildAlertsResponse(fakeFetch({ [RODALIES_NOTICES_URL]: json({ error: "x" }), [RENFE_ALERTS_URL]: json(RENFE) }).fetcher, fresh);
  assert.equal(res.status, 200);
  assert.ok(res.body.ok && res.body.source === "renfe");
  assert.equal((res.body as AlertsOk).alerts.length, 9);
  assert.equal(res.body.sourceUpdatedAt, "2026-10-07T07:32:52.000Z");

  // One second past the limit: stale again.
  res = await buildAlertsResponse(
    fakeFetch({ [RODALIES_NOTICES_URL]: json({}, 502), [RENFE_ALERTS_URL]: json(RENFE) }).fetcher,
    new Date(Date.parse("2026-10-07T07:32:52Z") + MAX_SOURCE_AGE_MS + 1000),
  );
  assert.equal(res.status, 503);

  // Both unreachable (network error, bad JSON): unavailable.
  res = await buildAlertsResponse(
    fakeFetch({
      [RODALIES_NOTICES_URL]: () => Promise.reject(new Error("timeout")),
      [RENFE_ALERTS_URL]: () => new Response("<html>", { status: 200 }),
    }).fetcher,
    READ_AT,
  );
  assert.equal(res.status, 503);
  assert.deepEqual(res.body, { ok: false, error: "unavailable", fetchedAt: READ_AT.toISOString(), sourceUpdatedAt: null });
});

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("route file: GET relays the handler's JSON, status and cache header", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === RODALIES_NOTICES_URL) return json(NOTICES)();
    throw new Error(`unexpected ${url}`);
  }) as typeof fetch;
  const { GET, dynamic } = await import("../src/app/api/rodalies/alerts/route.ts");
  assert.equal(dynamic, "force-dynamic");
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "public, s-maxage=120, stale-while-revalidate=300");
  const body = (await response.json()) as AlertsPayload;
  assert.ok(body.ok && body.alerts.length === 6);

  globalThis.fetch = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  const failed = await GET();
  assert.equal(failed.status, 503);
  assert.equal(failed.headers.get("cache-control"), "public, s-maxage=30");
  const failedBody = (await failed.json()) as AlertsPayload;
  assert.equal(failedBody.ok, false);
  assert.equal(!failedBody.ok && failedBody.error, "unavailable");
  assert.equal(failedBody.sourceUpdatedAt, null);
  const source = readFileSync(join(ROOT, "src/app/api/rodalies/alerts/route.ts"), "utf8");
  assert.doesNotMatch(source, /export const revalidate/, "no ISR on the live route");
});

/* -------------------------------------------------------------------------- */
/* Client logic                                                               */
/* -------------------------------------------------------------------------- */

const okPayload = (fetchedAt: string, alerts: CompactAlert[] = []): AlertsOk => ({ ok: true, source: "rodalies", fetchedAt, sourceUpdatedAt: null, alerts, unmapped: [] });

test("client: Madrid's date across midnight, both offsets and the clock change; today, yesterday, earlier", () => {
  assert.equal(madridDate(new Date("2026-10-28T22:59:59Z")), "2026-10-28");
  assert.equal(madridDate(new Date("2026-10-28T23:00:00Z")), "2026-10-29", "winter: UTC+1");
  assert.equal(madridDate(new Date("2026-07-01T21:59:59Z")), "2026-07-01");
  assert.equal(madridDate(new Date("2026-07-01T22:00:00Z")), "2026-07-02", "summer: UTC+2");
  // 25 Oct 2026, the night the clocks went back.
  assert.equal(madridDate(new Date("2026-10-24T22:30:00Z")), "2026-10-25");
  const lateNight = new Date("2026-10-28T23:30:00Z"); // 00:30 on the 29th in Madrid
  assert.equal(noticeDay("2026-10-29", lateNight), "today");
  assert.equal(noticeDay("2026-10-28", lateNight), "yesterday");
  assert.equal(noticeDay("2026-10-27", lateNight), "earlier", "the day after yesterday is no longer 'yesterday'");
  assert.equal(noticeDay("2026-11-01", new Date("2026-11-01T10:00:00Z")), "today");
  assert.equal(noticeDay("2026-10-31", new Date("2026-11-01T10:00:00Z")), "yesterday", "across a month end");
  assert.equal(noticeDay(null, lateNight), "unknown");
});

test("client: minutes ago, and nothing older than 15 minutes is current", () => {
  const p = okPayload("2026-10-28T10:00:00.000Z");
  assert.equal(minutesSince(p.fetchedAt, new Date("2026-10-28T10:00:59Z")), 0);
  assert.equal(minutesSince(p.fetchedAt, new Date("2026-10-28T10:07:00Z")), 7);
  assert.equal(minutesSince(p.fetchedAt, new Date("2026-10-28T09:59:00Z")), 0, "a fast client clock is not negative");
  assert.equal(isStale(p, new Date(Date.parse(p.fetchedAt) + STALE_AFTER_MS)), false);
  assert.equal(isStale(p, new Date(Date.parse(p.fetchedAt) + STALE_AFTER_MS + 60_000)), true);
  // Renfe: the age is the feed's own, not the fetch's.
  const renfe: AlertsOk = { ...p, source: "renfe", sourceUpdatedAt: "2026-10-07T07:32:52.000Z" };
  assert.equal(isStale(renfe, new Date("2026-10-28T10:01:00Z")), true);
});

test("client: the view is failed, stale, none or the notices, for a line or for all", () => {
  const parsed = fromRodaliesNotices(NOTICES)!;
  const payload = okPayload(READ_AT.toISOString(), parsed.alerts);
  const soon = new Date(READ_AT.getTime() + 3 * 60_000);
  assert.deepEqual(liveView(null, soon, "R1"), { kind: "failed" });
  assert.deepEqual(liveView({ ok: false, error: "stale", fetchedAt: READ_AT.toISOString(), sourceUpdatedAt: "2026-10-07T07:32:52.000Z" }, soon, "R1"), { kind: "stale" });
  assert.deepEqual(liveView({ ok: false, error: "unavailable", fetchedAt: READ_AT.toISOString(), sourceUpdatedAt: null }, soon, null), { kind: "failed" });
  assert.deepEqual(liveView(payload, new Date(READ_AT.getTime() + 20 * 60_000), "R1"), { kind: "stale" }, "a tab left open");
  const r1 = liveView(payload, soon, "R1");
  assert.equal(r1.kind, "ok");
  assert.equal(r1.kind === "ok" && r1.minutes, 3);
  assert.deepEqual(r1.kind === "ok" && r1.alerts.map((a) => a.id), ["rodalies-522443", "rodalies-522291"]);
  const hub = liveView(payload, soon, null);
  assert.equal(hub.kind === "ok" && hub.alerts.length, 6);
  const empty = liveView(okPayload(READ_AT.toISOString(), []), soon, "RT1");
  assert.deepEqual(empty, { kind: "ok", source: "rodalies", minutes: 3, alerts: [] });
});

test("client: the endpoint's JSON is checked before anything is shown from it", () => {
  const good = okPayload(READ_AT.toISOString(), fromRodaliesNotices(NOTICES)!.alerts);
  assert.deepEqual(parsePayload(JSON.parse(JSON.stringify(good))), good);
  assert.equal(parsePayload(null), null);
  assert.equal(parsePayload({ ok: true }), null);
  assert.equal(parsePayload({ ...good, fetchedAt: "yesterday" }), null);
  assert.equal(parsePayload({ ...good, alerts: [{ ...good.alerts[0], lines: ["R99"] }] }), null);
  assert.equal(parsePayload({ ...good, source: "twitter" }), null);
  assert.equal(parsePayload({ ok: false, error: "boom", fetchedAt: good.fetchedAt, sourceUpdatedAt: null }), null);
  assert.ok(parsePayload({ ok: false, error: "stale", fetchedAt: good.fetchedAt, sourceUpdatedAt: "2026-10-07T07:32:52.000Z" }));
  const strike = good.alerts[1]!;
  assert.match(alertText(strike, "ca"), /^Amb motiu/);
  assert.match(alertText(strike, "es"), /^Con motivo/);
  assert.match(alertText(strike, "en"), /^Con motivo/, "English readers get the Spanish text, as published");
});

/* -------------------------------------------------------------------------- */
/* Routing, pages, metadata                                                   */
/* -------------------------------------------------------------------------- */

test("routes: the hub in ca, es and en; line pages in ca and es only; anything else is a 404", () => {
  assert.equal(resolveHub("ca"), "ca");
  assert.equal(resolveHub("en"), "en");
  assert.equal(resolveHub("fr"), null);
  assert.equal(resolveLine("ca", "r2-sud")?.line.id, "R2S");
  assert.equal(resolveLine("es", "r2-sud")?.line.id, "R2S");
  assert.equal(resolveLine("es", "r2-nord")?.locale, "es");
  assert.equal(resolveLine("en", "r2-sud"), null, "/en/rodalies/r2-sud/ is a 404");
  assert.equal(resolveLine("fr", "r1"), null);
  assert.equal(resolveLine("ca", "r12"), null, "no R12 today");
  assert.equal(resolveLine("ca", "r2n"), null, "one spelling per line");
  assert.equal(resolveLine("ca", "R1"), null);
  assert.equal(resolveLine("ca", "../r1"), null);
  assert.equal(lineSlug("R2N"), "r2-nord");
  assert.equal(lineSlug("RG1"), "rg1");
  for (const id of LINE_IDS) assert.equal(lineFromSlug(lineSlug(id)), id);
  assert.equal(linePath("es", "R2S"), "/es/rodalies/r2-sud/");
  assert.equal(hubPath("en"), "/en/rodalies/");
});

test("routes: every line prerendered in both languages, each param complete", () => {
  const params = lineStaticParams();
  assert.equal(params.length, 38);
  for (const p of params) assert.ok(resolveLine(p.locale, p.linia), `${p.locale}/${p.linia}`);
});

test("route files: revalidate=false, notFound(), their own resolver, no database", () => {
  const app = join(ROOT, "src/app/(public)/[locale]/rodalies");
  for (const [file, resolver] of [
    ["page.tsx", /resolveHub\(/],
    ["[linia]/page.tsx", /resolveLine\(/],
  ] as const) {
    const source = readFileSync(join(app, file), "utf8");
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, resolver, file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/, `${file} reads no database`);
  }
  assert.match(readFileSync(join(app, "[linia]/page.tsx"), "utf8"), /export const dynamicParams = true;/);
});

test("metadata: titles <= 60 in the searched words, descriptions <= 155, unique", () => {
  for (const locale of ["ca", "es"] as const) {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const line of LINES) {
      const title = lineTitle(line, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${locale}/${line.id}: ${title.length}`);
      assert.ok(title.startsWith(`Rodalies ${line.name} `), title);
      assert.match(title, locale === "ca" ? / avui: incidències/ : / hoy: incidencias/);
      const rendered = composeTitle(title, linePath(locale, line.id), "2026-10-28");
      const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
      assert.ok(shown.length <= 60, `${locale}/${line.id} rendered ${shown.length}`);
      const description = lineDescription(line, locale);
      assert.ok(description.length <= DESCRIPTION_LIMIT && description.length >= 70, `${locale}/${line.id}: ${description.length}`);
      titles.add(title);
      descriptions.add(description);
    }
    assert.equal(titles.size, 19);
    assert.equal(descriptions.size, 19);
  }
  assert.equal(lineTitle(lineById("R2S"), "ca"), "Rodalies R2 Sud avui: incidències i avisos en directe");
  assert.equal(lineTitle(lineById("R2S"), "es"), "Rodalies R2 Sud hoy: incidencias y avisos en directo");
  for (const locale of LOCALES) {
    const meta = hubMeta(locale);
    assert.ok(meta.title.length <= TITLE_LIMIT, `${locale} hub title`);
    assert.ok(meta.description.length <= DESCRIPTION_LIMIT, `${locale} hub description ${meta.description.length}`);
  }
  assert.match(hubMeta("en").title, /^Rodalies trains today: disruptions/);
});

test("metadata: canonical and hreflang between the editions that exist, x-default as elsewhere", () => {
  const line = lineMetadata(lineById("R11"), "es");
  assert.equal(line.alternates?.canonical, absoluteUrl("/es/rodalies/r11/"));
  assert.deepEqual(line.alternates?.languages, {
    ca: absoluteUrl("/ca/rodalies/r11/"),
    es: absoluteUrl("/es/rodalies/r11/"),
    "x-default": absoluteUrl("/ca/rodalies/r11/"),
  });
  assert.deepEqual(line.title, { absolute: "Rodalies R11 hoy: incidencias y avisos en directo" }, "too long for the brand suffix: shown as is");
  const hub = hubMetadata("ca");
  assert.equal(hub.alternates?.canonical, absoluteUrl("/ca/rodalies/"));
  assert.deepEqual(hub.alternates?.languages, {
    ca: absoluteUrl("/ca/rodalies/"),
    es: absoluteUrl("/es/rodalies/"),
    en: absoluteUrl("/en/rodalies/"),
    "x-default": absoluteUrl("/en/rodalies/"),
  });
});

test("sitemap: 41 URLs, unique, dated with the snapshot, with their alternates", () => {
  const entries = rodaliesFamilyPaths();
  assert.equal(entries.length, 3 + 19 * 2);
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.path, /^\/(ca|es|en)\/rodalies\/([a-z0-9-]+\/)?$/);
    assert.equal(entry.lastModified, SNAPSHOT.readOn);
    assert.ok(Object.values(entry.translations).includes(entry.path), `${entry.path} lists itself`);
  }
  assert.ok(!entries.some((e) => e.path.startsWith("/en/rodalies/r")), "no English line pages");
  assert.deepEqual(entries.find((e) => e.path === "/es/rodalies/rg1/")?.translations, { ca: "/ca/rodalies/rg1/", es: "/es/rodalies/rg1/" });
  assert.deepEqual(rodaliesSitemap(), [], "nothing on a deployment that may not be indexed");
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.rodaliesSitemap\(\)/);
});

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const NO_INCIDENTS =
  /cap avís|cap incidència|sense incidències|sense avisos|funciona amb normalitat|ningún aviso|ninguna incidencia|sin incidencias|sin avisos|funciona con normalidad|no (active )?notices?|no disruptions?|running normally/i;

test("the server HTML never says a line has no incidents (that is the browser's answer)", () => {
  for (const locale of ["ca", "es"] as const) {
    for (const line of LINES) {
      const text = JSON.stringify(lineCopy(line, locale));
      assert.doesNotMatch(text, NO_INCIDENTS, `${locale}/${line.id}`);
      assert.doesNotMatch(liveLabels(locale, line.name).fallback, NO_INCIDENTS);
      assert.match(liveLabels(locale, line.name).none, NO_INCIDENTS, "the 'none' words exist, for the browser only");
    }
  }
  for (const locale of LOCALES) {
    assert.doesNotMatch(JSON.stringify(hubCopy(locale)), NO_INCIDENTS, `${locale} hub`);
    assert.doesNotMatch(liveLabels(locale, null).fallback, NO_INCIDENTS);
    assert.match(liveLabels(locale, null).fallback, /\]\(https:\/\/rodalies\.gencat\.cat\/(ca|es|en)\/alteracions_del_servei\/\)/, "the official page is always linked");
  }
});

test("each line page carries its own data and the original guidance", () => {
  const r2s = lineCopy(lineById("R2S"), "ca");
  assert.equal(r2s.h1, "Rodalies R2 Sud avui: incidències i avisos");
  assert.match(r2s.lead, /^L'R2 Sud circula entre Sant Vicenç de Calders i Barcelona-Estació de França, per Vilanova i la Geltrú, amb 17 estacions\./);
  assert.ok(r2s.facts.some((f) => f.value === "@rod2sudcat"));
  assert.ok(r2s.official.join(" ").includes("02_Horaris/horaris/R2.pdf"), "R2 Sud uses the R2 timetable PDF");
  assert.match(r2s.compensation.where.join(" "), /estació on acabes el viatge/);
  const r11 = lineCopy(lineById("R11"), "es");
  assert.match(r11.compensation.where.join(" "), /Girona, Flaçà, Figueres, Llançà, Portbou/);
  assert.ok(!r11.official.join(" ").includes(".pdf") || LINE_OFFICIAL.R11.pdf);
  const rt1 = lineCopy(lineById("RT1"), "ca");
  assert.match(rt1.compensation.where.join(" "), /no inclou l'RT1/);
  assert.ok(!rt1.official.join(" ").includes(".pdf"), "no guessed PDF");
  const r3 = lineCopy(lineById("R3"), "ca");
  assert.equal(r3.compensation.where.length, 2, "R3: Barcelona service and regional stations");
  assert.deepEqual(lineCopy(lineById("R2N"), "ca").related.at(-1)?.href, `/ca/${B2_PATHS.airport.ca}/`);
  // Compensation figures from condition 13.
  const rows = JSON.stringify(r2s.compensation.rows);
  for (const fact of ["15 minuts", "30 dies", "30 minuts", "50%", "1 hora", "100%"]) assert.ok(rows.includes(fact), fact);
  // Deterministic.
  assert.deepEqual(lineCopy(lineById("R4"), "es"), lineCopy(lineById("R4"), "es"));
});

test("siblings: lines sharing stations first, then the rest of the group; the hub lists every line", () => {
  const r2s = siblings("R2S");
  assert.ok(r2s.shared.length > 0);
  assert.ok(!r2s.shared.some((s) => s.line.id === "R2S"));
  for (let i = 1; i < r2s.shared.length; i++) assert.ok(r2s.shared[i - 1]!.stations >= r2s.shared[i]!.stations);
  for (const id of LINE_IDS) {
    const links = siblingLinks(id, "ca");
    assert.ok(links.shared.length + links.group.length >= 3, `${id} links to other lines`);
    assert.ok([...links.shared, ...links.group].every((l) => l.href.startsWith("/ca/rodalies/") && l.href !== linePath("ca", id)));
  }
  for (const locale of ["ca", "es"] as const) {
    const listed = hubCopy(locale).groups.flatMap((g) => g.lines.map((l) => l.href));
    assert.deepEqual([...listed].sort(), LINE_IDS.map((id) => linePath(locale, id)).sort(), `${locale} hub links every line`);
  }
  assert.ok(hubCopy("en").groups.every((g) => g.lines.every((l) => l.href === null)), "English hub: no links to ca/es pages");
  assert.ok(KEY_STATIONS.every((name) => linesAt(name).length > 0), "every key station is on a line");
});

test("links: published guides only, every internal link in its own language with a trailing slash; no template leaks", () => {
  const published = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => `/${l}/${paths[l]}/`)));
  const check = (locale: string, value: unknown) => {
    const text = JSON.stringify(value);
    assert.doesNotMatch(text, /\$\{|undefined|NaN|\[object|aerobusbcn/i, locale);
    for (const m of text.matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = m[1]!;
      assert.ok(href.startsWith(`/${locale}/`) && href.endsWith("/"), href);
      assert.ok(published.has(href) || href.startsWith(`/${locale}/rodalies/`), `${href} is not published`);
    }
    for (const m of text.matchAll(/"href":"([^"]+)"/g)) assert.ok(published.has(m[1]!) || m[1]!.startsWith(`/${locale}/rodalies/`), m[1]);
    for (const m of text.matchAll(/\]\((https?:[^)]*)\)/g)) assert.match(m[1]!, /^https:\/\/(rodalies\.gencat\.cat|x\.com|whatsapp\.com|data\.renfe\.com)\//);
  };
  for (const locale of ["ca", "es"] as const) for (const line of LINES) check(locale, lineCopy(line, locale));
  for (const locale of LOCALES) check(locale, hubCopy(locale));
});

test("server output carries no clock; the live block is a client component reading after mount", () => {
  const files = [
    "src/lib/programmatic/rodalies/copy.ts",
    "src/lib/programmatic/rodalies/data.ts",
    "src/lib/programmatic/rodalies/pages.ts",
    "src/lib/programmatic/rodalies/paths.ts",
    "src/lib/programmatic/rodalies/official.ts",
    "src/components/programmatic/rodalies/LinePage.tsx",
    "src/components/programmatic/rodalies/HubPage.tsx",
    "src/components/programmatic/rodalies/parts.tsx",
    "src/app/(public)/[locale]/rodalies/page.tsx",
    "src/app/(public)/[locale]/rodalies/[linia]/page.tsx",
  ];
  for (const file of files) assert.doesNotMatch(readFileSync(join(ROOT, file), "utf8"), /new Date\(\)|Date\.now\(/, file);
  const client = readFileSync(join(ROOT, "src/components/programmatic/rodalies/RodaliesLive.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(/);
  assert.doesNotMatch(client, /dangerouslySetInnerHTML/);
  // Type-only imports are erased; a value import of these would ship the snapshot to the browser.
  assert.doesNotMatch(client, /^import (?!type )[^;]*from "@\/lib\/programmatic\/rodalies\/(copy|data|pages|alerts|official)";/m, "no snapshot in the browser bundle");
  const live = readFileSync(join(ROOT, "src/lib/programmatic/rodalies/live.ts"), "utf8");
  assert.doesNotMatch(live, /from "\.\/(snapshot\.json|data|alerts|copy|pages|official)"/, "the client helpers do not import the snapshot");
  const labels = readFileSync(join(ROOT, "src/lib/programmatic/rodalies/labels.ts"), "utf8");
  assert.doesNotMatch(labels, /from "\.\/(snapshot\.json|data|alerts|copy|pages)"/);
  // The "none" words are built in the browser bundle, never passed down as page props.
  for (const page of ["LinePage.tsx", "HubPage.tsx"]) {
    assert.doesNotMatch(readFileSync(join(ROOT, "src/components/programmatic/rodalies", page), "utf8"), /liveLabels|labels=/, page);
  }
});

/* -------------------------------------------------------------------------- */
/* Links from the pages that already rank                                     */
/* -------------------------------------------------------------------------- */

test("transport passes, metro hours, airport and strikes guides gain exactly one body link each, titles untouched", () => {
  for (const locale of LOCALES) {
    const hub = `](${hubPath(locale)})`;
    const count = (blocks: unknown, target: string) => JSON.stringify(blocks).split(target).length - 1;
    assert.equal(count(TRANSPORT.editions[locale].blocks, hub), 1, `transport/${locale}`);
    assert.equal(count(HOURS.editions[locale].blocks, hub), 1, `hours/${locale}`);
    assert.equal(count(STRIKES_GUIDE.editions[locale].blocks, hub), 1, `strikes/${locale}`);
    const airportTarget = locale === "en" ? hub : `](${linePath(locale, "R2N")})`;
    assert.equal(count(AIRPORT.editions[locale].blocks, airportTarget), 1, `airport/${locale}`);
    assert.ok(!JSON.stringify(AIRPORT.editions[locale].blocks).includes("aerobusbcn"));
  }
  // Titles as the 28 Oct page-1 push left them (docs/SEO_EXPERIMENTS.md).
  assert.equal(HOURS.editions.ca.seoTitle, "Horari metro Barcelona avui: a quina hora obre i tanca");
  assert.equal(TRANSPORT.editions.en.seoTitle, "Barcelona transport pass for 1 to 5 days: 2026 prices");
  const route = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(route, /wants\("rodalies-links"\)/);
  for (const article of ["TRANSPORT", "HOURS", "AIRPORT", "STRIKES_GUIDE"]) {
    assert.match(route.slice(route.indexOf('wants("rodalies-links")')), new RegExp(`publishB2Article\\(${article}\\)`), article);
  }
});
