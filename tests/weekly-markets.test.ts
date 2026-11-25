import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { holidayOn } from "../src/lib/content/holidays/calendar.ts";
import { currentOption } from "../src/lib/programmatic/weekly-markets/answer.ts";
import { answerSentence, answerZones, hubView, marketsTownH1, townView } from "../src/lib/programmatic/weekly-markets/copy.ts";
import { MATARO, TOWNS, VIC, WEEKLY_MARKETS_AS_OF, WEEKLY_MARKETS_REREAD_BY, holidayNameFor, marketTownBySlug } from "../src/lib/programmatic/weekly-markets/data.ts";
import {
  STALE_AFTER_DAYS,
  activeExceptions,
  addDays,
  madridClock,
  needsConfirmation,
  nextSession,
  sessionsOn,
  upcomingSessions,
  validUntil,
  type Clock,
} from "../src/lib/programmatic/weekly-markets/logic.ts";
import { MARKETS_LOCALES, MARKETS_ROUTE, MARKET_TOWN_SLUGS, hasMarketsPage, marketsHubPath, marketsTownPath } from "../src/lib/programmatic/weekly-markets/paths.ts";
import { marketsHubAllowed, marketsTownStaticParams, resolveMarketTown, weeklyMarketsRefreshPaths } from "../src/lib/programmatic/weekly-markets/routing.ts";
import { weeklyMarketsPaths } from "../src/lib/programmatic/weekly-markets/sitemap.ts";
import type { MarketTown, MkLocale } from "../src/lib/programmatic/weekly-markets/types.ts";
import { townHub } from "../src/lib/engagement/town-hub.ts";

/**
 * Weekly street markets of Vic and Mataró (pilot of 25 Nov 2026). The data
 * file is the only place with facts; these tests hold its shape, the day
 * logic behind "next market" (a normal day, the Vic session moved from
 * Saturday 26 to Thursday 24 December 2026, the midnight rollover, an
 * exception that lapses) and the wiring.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const at = (iso: string, hhmm = "09:00"): Clock => ({ iso, hhmm });
const holidays = holidayNameFor;
const next = (town: MarketTown, clock: Clock) => nextSession(town, clock, holidays(town.slug));
const vicSentence = (clock: Clock, locale: MkLocale = "ca") => answerSentence(answerZones(VIC, clock, locale)[0]!, clock, locale);
const mataroSentence = (clock: Clock, locale: MkLocale = "ca") => answerSentence(answerZones(MATARO, clock, locale)[0]!, clock, locale);

test("data: every source, market and exception points at something that exists", () => {
  for (const town of TOWNS) {
    assert.match(town.checked, ISO);
    assert.ok(town.checked <= WEEKLY_MARKETS_AS_OF);
    const sourceIds = new Set(town.sources.map((s) => s.id));
    assert.equal(sourceIds.size, town.sources.length, `${town.slug}: source ids unique`);
    for (const s of town.sources) {
      assert.match(s.readOn, ISO);
      assert.ok(s.url.startsWith("https://"), s.url);
      assert.ok(s.quotes.length > 0 && s.quotes.every((q) => q.length > 10), `${s.id}: quotes`);
    }
    const marketIds = new Set(town.markets.map((m) => m.id));
    assert.equal(marketIds.size, town.markets.length);
    for (const m of town.markets) {
      assert.ok(m.src.length > 0 && m.src.every((id) => sourceIds.has(id)), `${m.id}: sources`);
      assert.ok(m.days.length > 0 && m.days.every((d) => d >= 0 && d <= 6));
      if (m.hours) assert.ok(HHMM.test(m.hours[0]) && HHMM.test(m.hours[1]) && m.hours[0] < m.hours[1], m.id);
      else assert.ok(m.hoursNote, `${m.id}: no hours needs the note that says why`);
      for (const locale of MARKETS_LOCALES) assert.ok(m.place[locale] && m.name[locale] && m.goods[locale], `${m.id} ${locale}`);
    }
    for (const ex of town.exceptions) {
      assert.match(ex.date, ISO);
      assert.ok(sourceIds.has(ex.src), ex.id);
      assert.ok(ex.markets.every((id) => marketIds.has(id)), ex.id);
      assert.equal(ex.kind === "moved", Boolean(ex.movedTo), `${ex.id}: only a move has a target`);
      if (ex.movedTo) assert.match(ex.movedTo, ISO);
    }
    assert.ok(town.noticeUrl.startsWith("https://"));
  }
  assert.deepEqual(TOWNS.map((t) => t.slug).sort(), [...MARKET_TOWN_SLUGS].sort());
});

test("data: Vic's published calendar covers every 2026 Tuesday and Saturday holiday (so nothing is guessed in 2026)", () => {
  const listed = new Set(VIC.exceptions.map((e) => e.date));
  for (let day = "2026-01-01"; day <= "2026-12-31"; day = addDays(day, 1)) {
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    if (holidayOn(day) && (weekday === 2 || weekday === 6)) assert.ok(listed.has(day), `${day} (${holidayOn(day)!.name.ca}) has no Vic exception`);
  }
  // The council's list, as read: 6 Jan and 5 Jul cancelled (5 Jul is a Sunday), 15 Aug and 8 Dec normal, 26 Dec moved.
  const move = VIC.exceptions.find((e) => e.date === "2026-12-26")!;
  assert.equal(move.kind, "moved");
  assert.equal(move.movedTo, "2026-12-24");
  assert.equal(move.documentRead, false, "the council agreement (seuelectronica id 6234) answered 404 on 25 Nov 2026: not claimed as read");
});

test("normal day: Wednesday 25 Nov 2026 -> Saturday 28 November at the Plaça Major, 'horari de matí' (the council gives no hours)", () => {
  const session = next(VIC, at("2026-11-25", "16:42"))!;
  assert.equal(session.date, "2026-11-28");
  assert.equal(session.marketId, "vic-placa-major");
  assert.equal(session.from, null);
  assert.equal(vicSentence(at("2026-11-25", "16:42")), "Pròxim mercat a Vic: dissabte 28 de novembre, plaça Major i rambles, horari de matí.");
  assert.match(vicSentence(at("2026-11-25", "16:42"), "es"), /^Próximo mercado en Vic: sábado 28 de noviembre, plaza Mayor y ramblas, horario de mañana\.$/);
  assert.match(vicSentence(at("2026-11-25", "16:42"), "en"), /^Next market in Vic: Saturday 28 November, Plaça Major and the ramblas, morning hours\.$/);
  // Tuesday 24 Nov has passed; Sunday 29 is the one after, with the Sunday hours.
  const after = upcomingSessions(VIC, at("2026-11-25"), holidays("vic"), { limit: 3 });
  assert.deepEqual(after.map((s) => s.date), ["2026-11-28", "2026-11-29", "2026-12-01"]);
  assert.equal(after[1]!.from, "09:00");
  assert.equal(after[1]!.to, "14:00");
});

test("the moved session: 24 Dec 2026 (Thursday) is a Vic market day and Saturday 26 is not", () => {
  assert.equal(sessionsOn(VIC, "2026-12-24", holidays("vic")).map((s) => s.marketId).join(), "vic-placa-major");
  assert.equal(sessionsOn(VIC, "2026-12-24", holidays("vic"))[0]!.movedFrom, "2026-12-26");
  assert.equal(sessionsOn(VIC, "2026-12-26", holidays("vic")).length, 0, "no Tuesday/Saturday market on 26 Dec");
  // Before: Tuesday 22 is an ordinary market, then Thursday 24 worded as a move.
  assert.match(vicSentence(at("2026-12-22", "10:00")), /^Pròxim mercat a Vic: avui, dimarts 22 de desembre, plaça Major i rambles, horari de matí\.$/);
  const wed = vicSentence(at("2026-12-23", "10:00"));
  assert.match(wed, /^Pròxim mercat a Vic: demà, dijous 24 de desembre, plaça Major i rambles, horari de matí\. \(trasllat del dissabte 26 de desembre\)$/);
  assert.match(vicSentence(at("2026-12-24", "08:00")), /^Pròxim mercat a Vic: avui, dijous 24 de desembre/);
  // When the 25th arrives: Christmas Day has no market, the next one is the Sunday market, never the 26th.
  assert.equal(vicSentence(at("2026-12-25", "09:00")), "Pròxim mercat a Vic: diumenge 27 de desembre, passeig de la Generalitat, barri del Remei-Estadi, 9–14 h.");
  assert.equal(next(VIC, at("2026-12-25"))!.date, "2026-12-27");
  assert.equal(next(VIC, at("2026-12-26", "10:00"))!.date, "2026-12-27");
  // The Sunday market is over at 14:00; then Tuesday 29 Dec.
  assert.equal(next(VIC, at("2026-12-27", "14:00"))!.date, "2026-12-29");
  // 8 December (Tuesday, a holiday) is a normal market, said by the council.
  const eight = sessionsOn(VIC, "2026-12-08", holidays("vic"));
  assert.equal(eight.length, 1);
  assert.equal(eight[0]!.status, "exception");
});

test("midnight rollover: Madrid's date, hours only where the council gives them", () => {
  // 23:59 on Saturday 28 Nov (CET): still the Saturday market, with unknown closing time the day lasts until midnight.
  assert.deepEqual(madridClock(new Date("2026-11-28T22:59:00Z")), { iso: "2026-11-28", hhmm: "23:59" });
  assert.deepEqual(madridClock(new Date("2026-11-28T23:00:00Z")), { iso: "2026-11-29", hhmm: "00:00" });
  assert.match(vicSentence(madridClock(new Date("2026-11-28T22:59:00Z"))), /^Pròxim mercat a Vic: avui, dissabte 28 de novembre/);
  assert.match(vicSentence(madridClock(new Date("2026-11-28T23:00:00Z"))), /^Pròxim mercat a Vic: avui, diumenge 29 de novembre, passeig de la Generalitat/);
  // A UTC instant that is already tomorrow in UTC but not in Madrid summer time: 22:30Z on 1 Jul is 00:30 on 2 Jul in Madrid.
  assert.deepEqual(madridClock(new Date("2026-07-01T22:30:00Z")), { iso: "2026-07-02", hhmm: "00:30" });
  // Mataró's hours are known: the Thursday session is over at 14:00 and the answer moves to Friday.
  assert.equal(next(MATARO, at("2026-11-26", "13:59"))!.date, "2026-11-26");
  assert.equal(next(MATARO, at("2026-11-26", "14:00"))!.date, "2026-11-27");
  // One day's options hold today's session even if over: a tab left open skips it (currentOption).
  const zone = answerZones(MATARO, at("2026-11-26", "08:00"), "ca")[0]!;
  assert.equal(currentOption(zone.options, "2026-11-26", "08:00")!.date, "2026-11-26");
  assert.equal(currentOption(zone.options, "2026-11-26", "14:00")!.date, "2026-11-27");
  assert.equal(currentOption(zone.options, "2026-11-27", "10:00")!.date, "2026-11-27");
  // Saturday: Plaça Gran and the five others; Sunday: none.
  assert.equal(sessionsOn(MATARO, "2026-11-28", holidays("mataro")).length, 6);
  assert.equal(sessionsOn(MATARO, "2026-11-29", holidays("mataro")).length, 0);
  assert.equal(next(MATARO, at("2026-11-28", "14:00"))!.date, "2026-11-30");
});

test("an exception lapses after its date; one only listed (not read in the council's act) asks for confirmation", () => {
  assert.equal(validUntil(VIC.exceptions.find((e) => e.date === "2026-12-26")!), "2026-12-26");
  const active = (iso: string) => activeExceptions(VIC, iso).map((e) => e.date);
  assert.deepEqual(active("2026-11-25"), ["2026-12-08", "2026-12-26"]);
  assert.deepEqual(active("2026-12-09"), ["2026-12-26"]);
  assert.deepEqual(active("2026-12-26"), ["2026-12-26"], "still shown on the day itself");
  assert.deepEqual(active("2026-12-27"), [], "gone the day after");
  const move = VIC.exceptions.find((e) => e.date === "2026-12-26")!;
  assert.equal(needsConfirmation(VIC, move, "2026-12-01"), true, "only a listing was read");
  assert.equal(needsConfirmation(VIC, move, "2026-12-27"), false, "lapsed");
  const read = { ...move, documentRead: true };
  const fresh = { ...VIC, sources: VIC.sources.map((s) => (s.id === move.src ? { ...s, readOn: "2026-12-01" } : s)) };
  assert.equal(needsConfirmation(fresh, read, addDays("2026-12-01", STALE_AFTER_DAYS)), false);
  assert.equal(needsConfirmation(fresh, read, addDays("2026-12-01", STALE_AFTER_DAYS + 1)), true, "a source not re-read for two weeks is flagged");
  // The pages follow: the FAQ about the move exists until the 26th and is gone on the 27th, in the three languages.
  for (const locale of MARKETS_LOCALES) {
    const during = townView(VIC, at("2026-12-25"), locale);
    assert.ok(during.faq.some((f) => /26/.test(f.q) && /24/.test(f.a)), `${locale}: move question on 25 Dec`);
    assert.equal(during.exceptions.length, 1);
    assert.equal(during.exceptions[0]!.needsConfirmation, true);
    const after = townView(VIC, at("2026-12-27"), locale);
    assert.ok(!after.faq.some((f) => /26/.test(f.q)), `${locale}: no move question on 27 Dec`);
    assert.equal(after.exceptions.length, 0);
  }
});

test("after the council's calendar (2026) the usual day is shown as pending, never as confirmed", () => {
  const saturday = sessionsOn(VIC, "2027-01-02", holidays("vic"));
  assert.equal(saturday.length, 1);
  assert.equal(saturday[0]!.status, "calendar-pending");
  assert.match(vicSentence(at("2026-12-30", "09:00")), /^Pròxim mercat a Vic: diumenge 3 de gener de 2027|^Pròxim mercat a Vic: dissabte 2 de gener/);
  assert.match(vicSentence(at("2026-12-31", "12:00")), /calendari de festius de 2027/);
});

test("Mataró: a holiday session is 'horari habitual' and sends to the council's page; nothing is invented", () => {
  const stephen = sessionsOn(MATARO, "2026-12-26", holidays("mataro"));
  assert.equal(stephen.length, 6);
  assert.ok(stephen.every((s) => s.status === "holiday-unconfirmed"));
  assert.match(mataroSentence(at("2026-12-25", "10:00")), /avui, divendres 25 de desembre, plaça Gran, 7–14 h\. Dia festiu \(Nadal\)/, "Christmas Day: the daily Plaça Gran market, flagged");
  const sentence = mataroSentence(at("2026-12-26", "08:00"));
  assert.match(sentence, /^Pròxim mercat a Mataró: avui, dissabte 26 de desembre, Plaça de Cuba, Plaça Gran, Cirera – Molins, L'Escorxador i Cerdanyola, 7–14 h; Pla d'en Boet, 9–14 h\. Dia festiu/);
  assert.match(sentence, /Dia festiu \(Sant Esteve\): és l'horari habitual, l'Ajuntament no n'ha publicat cap canvi\.$/);
  const zones = answerZones(MATARO, at("2026-12-26", "08:00"), "ca");
  assert.equal(currentOption(zones[0]!.options, "2026-12-26", "08:00")!.notice, true);
  assert.equal(MATARO.exceptions.length, 0);
  // An ordinary day carries no caveat.
  assert.equal(currentOption(answerZones(MATARO, at("2026-11-25"), "ca")[0]!.options, "2026-11-25", "10:00")!.notice, false);
  // Thursday: Plaça Gran and Plaça de Cuba together; the Cuba Thursday hours are 9-14.
  const thursday = sessionsOn(MATARO, "2026-11-26", holidays("mataro"));
  assert.deepEqual(thursday.map((s) => s.marketId).sort(), ["mataro-cuba-dijous", "mataro-placa-gran"]);
  assert.match(mataroSentence(at("2026-11-25", "16:42")), /^Pròxim mercat a Mataró: demà, dijous 26 de novembre, plaça Gran, 7–14 h; entorns de la plaça de Cuba, 9–14 h\.$/);
  // The picker: one zone per square, Cuba holding Saturday and Thursday.
  const picks = answerZones(MATARO, at("2026-11-25"), "ca");
  assert.deepEqual(picks.map((z) => z.id), ["all", "placa-de-cuba", "placa-gran", "pla-d-en-boet", "cirera-molins", "l-escorxador", "cerdanyola"]);
  assert.match(answerSentence(picks[1]!, at("2026-11-25", "16:42"), "ca"), /^Pròxim mercat · Plaça de Cuba: demà, dijous 26 de novembre, entorns de la plaça de Cuba, 9–14 h\.$/);
  assert.match(answerSentence(picks[6]!, at("2026-11-25", "16:42"), "ca"), /^Pròxim mercat · Cerdanyola: dissabte 28 de novembre, passeig de Ramon Berenguer III/);
});

test("Mercat Medieval: its own block while it is near, never merged with the weekly sessions, gone after 8 December", () => {
  for (const locale of MARKETS_LOCALES) {
    const inWindow = townView(VIC, at("2026-11-25"), locale);
    assert.equal(inWindow.related.length, 1, locale);
    assert.equal(inWindow.related[0]!.url, "https://www.vicfires.cat/mercat-medieval-vic-2026");
    assert.match(inWindow.related[0]!.hours, /10/);
    assert.match(inWindow.related[0]!.hours, /20/);
    assert.ok(inWindow.faq.some((f) => /Medieval/.test(f.q)), `${locale}: the question people search is answered`);
    assert.ok(!/Medieval/i.test(inWindow.lead), `${locale}: the next-session line is the weekly market's only`);
    assert.equal(townView(VIC, at("2026-12-08"), locale).related.length, 1, "last day still shown");
    assert.equal(townView(VIC, at("2026-12-09"), locale).related.length, 0);
    assert.equal(townView(VIC, at("2026-10-01"), locale).related.length, 0, "not shown months ahead");
  }
});

test("copy: titles and descriptions fit, no holes, three languages, no date in the cached head", () => {
  const clock = at("2026-11-25", "16:42");
  for (const town of TOWNS) {
    for (const locale of MARKETS_LOCALES) {
      const v = townView(town, clock, locale);
      assert.ok(v.title.length <= 62, `${town.slug} ${locale}: ${v.title.length}`);
      assert.ok(v.description.length <= 165 && v.description.length >= 90, `${town.slug} ${locale}: ${v.description.length}`);
      assert.doesNotMatch(`${v.title} ${v.description}`, /\d{1,2} (de |d')?(novembre|desembre|noviembre|diciembre|November|December)/);
      assert.equal(marketsTownH1(town.slug, locale), v.h1);
      JSON.stringify(v, (_k, x) => {
        if (typeof x === "string") assert.ok(!/undefined|NaN|\bnull\b|\[object/.test(x), `${town.slug} ${locale}: ${x}`);
        return x;
      });
      assert.ok(v.faq.length >= 3);
      assert.equal(v.rows.length, town.markets.length);
    }
  }
  for (const locale of MARKETS_LOCALES) {
    const hub = hubView(clock, locale);
    assert.ok(hub.title.length <= 62 && hub.description.length <= 165);
    assert.equal(hub.towns.length, 2);
    assert.match(hub.lead, /560/);
    assert.match(hub.lead, /466/);
  }
});

test("routes: one stable URL per town and language; unknown towns and other languages 404", () => {
  assert.equal(marketsHubPath("ca"), "/ca/mercats-setmanals/");
  assert.equal(marketsTownPath("es", "mataro"), "/es/mercados-semanales/mataro/");
  assert.equal(marketsTownPath("en", "vic"), "/en/weekly-markets/vic/");
  assert.ok(hasMarketsPage("vic") && hasMarketsPage("mataro") && !hasMarketsPage("manresa"));
  assert.equal(resolveMarketTown("ca", "ca", "vic")?.slug, "vic");
  assert.equal(resolveMarketTown("ca", "es", "vic"), null);
  assert.equal(resolveMarketTown("ca", "ca", "manresa"), null);
  assert.equal(marketsHubAllowed("en", "ca"), false);
  assert.equal(marketTownBySlug("mataro")?.ine, "08121");
  assert.deepEqual(marketsTownStaticParams("ca", "municipi"), [
    { locale: "ca", municipi: "vic" },
    { locale: "ca", municipi: "mataro" },
  ]);
  const paths = weeklyMarketsPaths().map((p) => p.path);
  assert.equal(paths.length, 9);
  assert.equal(new Set(paths).size, 9);
  for (const p of paths) assert.ok(Object.values(MARKETS_ROUTE).some((r) => p.includes(`/${r}/`)), p);
  assert.ok(weeklyMarketsRefreshPaths().every((p) => !p.endsWith("/")));
  for (const slug of MARKET_TOWN_SLUGS) {
    assert.match(marketsTownPath("ca", slug), /^\/ca\/mercats-setmanals\/[a-z-]+\/$/);
  }
});

test("wiring: sitemap, publish group, nightly refresh, selector event and the town links", () => {
  assert.match(read("src/app/sitemap.ts"), /dated\("mercats-setmanals", \[\.\.\.weeklyMarketsSitemapEntries\(\)\]\)/);
  assert.match(read("src/app/api/admin/publish/route.ts"), /wants\("mercats-setmanals"\)\) codePaths\.push\(\.\.\.weeklyMarketsPaths\(\)/);
  assert.match(read("src/app/api/cron/publish-scheduled/route.ts"), /weeklyMarketsRefreshPaths\(\)/);
  for (const route of ["mercats-setmanals", "mercados-semanales", "weekly-markets"]) {
    const hub = read(`src/app/(public)/[locale]/${route}/page.tsx`);
    assert.match(hub, /export const revalidate = 3600;/);
    assert.match(hub, /export const dynamicParams = true;/);
  }
  const picker = read("src/components/programmatic/weekly-markets/NextMarket.tsx");
  assert.ok(picker.includes('track({ name: "town_select", params: { tool: "market_square", locale } })'));
  assert.doesNotMatch(picker, /router|searchParams|history\.|location\./, "the choice never reaches the URL");
  // The holiday, fair and market pages of a town link each other.
  for (const slug of MARKET_TOWN_SLUGS) {
    for (const locale of MARKETS_LOCALES) {
      const fromHoliday = townHub(slug, locale, "holidays", "2026-11-25");
      assert.ok(fromHoliday?.links.some((l) => l.href === marketsTownPath(locale, slug) && l.family === "markets"), `${slug} ${locale}: holiday page links the market page`);
      const fromMarkets = townHub(slug, locale, "markets", "2026-11-25");
      assert.ok(!fromMarkets?.links.some((l) => l.family === "markets"), "the market page does not link itself");
    }
  }
  const fromFair = townHub("vic", "ca", "fair", "2026-11-25");
  assert.ok(fromFair?.links.some((l) => l.family === "markets"));
});

test("date guard: the council pages must be read again before 21 Dec 2026 (the 24 Dec move, the 2027 calendar)", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(WEEKLY_MARKETS_REREAD_BY > WEEKLY_MARKETS_AS_OF);
  assert.ok(
    today < WEEKLY_MARKETS_REREAD_BY || WEEKLY_MARKETS_AS_OF >= WEEKLY_MARKETS_REREAD_BY,
    `weekly markets: read ${WEEKLY_MARKETS_AS_OF}, re-read due ${WEEKLY_MARKETS_REREAD_BY}: re-read vic.cat / victurisme.cat / mataro.cat (scripts/check-weekly-markets.ts), move WEEKLY_MARKETS_AS_OF and the sources' readOn, then set the next date`,
  );
});
