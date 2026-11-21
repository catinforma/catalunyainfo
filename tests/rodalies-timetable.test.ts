/**
 * Rodalies timetable summary (21 Nov 2026): Renfe's GTFS -> timetable.json
 * -> the line pages and the hub, in ca, es and en.
 *
 * The date guard fails TIMETABLE_MAX_AGE_DAYS after the build, or the day
 * after the last day of Renfe's file, whichever comes first. Then:
 *   npm run rodalies-timetable:snapshot -- build
 * review the diff, run this file, commit, deploy.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

import { LOCALES } from "../src/lib/i18n/config.ts";
import { LINES, lineById } from "../src/lib/programmatic/rodalies/data.ts";
import { linePath } from "../src/lib/programmatic/rodalies/paths.ts";
import {
  BANDS,
  DAY_TYPES,
  LIST_UP_TO,
  MAIN_STATIONS,
  TIMETABLE_MAX_AGE_DAYS,
  buildLineTimetable,
  clock,
  dayTypeOf,
  duration,
  gaps,
  gtfsMinutes,
  runsWithin,
  serviceMinutes,
  type FeedTrip,
} from "../src/lib/programmatic/rodalies/timetable.ts";
import {
  TIMETABLE,
  attribution,
  bandCell,
  hubTimetable,
  runText,
  timetableFaq,
  timetableLinks,
  timetableView,
} from "../src/lib/programmatic/rodalies/timetable-copy.ts";
import { LINE_IDS } from "../src/lib/programmatic/rodalies/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* -------------------------------------------------------------------------- */
/* Date guard                                                                 */
/* -------------------------------------------------------------------------- */

test(`date guard: the timetable snapshot is at most ${TIMETABLE_MAX_AGE_DAYS} days old and Renfe's file has not ended (npm run rodalies-timetable:snapshot -- build)`, () => {
  const now = today();
  assert.ok(
    daysBetween(TIMETABLE.builtOn, now) <= TIMETABLE_MAX_AGE_DAYS,
    `timetable.json built ${TIMETABLE.builtOn}: run \`npm run rodalies-timetable:snapshot -- build\`, review, commit and deploy.`,
  );
  assert.ok(now <= TIMETABLE.feed.to, `Renfe's file in timetable.json ends ${TIMETABLE.feed.to}: the pages now hide the summary; rebuild it.`);
});

test("snapshot: dated, from the CC BY 4.0 dataset, a feed that runs ahead of the build", () => {
  assert.match(TIMETABLE.builtOn, ISO);
  assert.match(TIMETABLE.feed.from, ISO);
  assert.match(TIMETABLE.feed.to, ISO);
  assert.ok(TIMETABLE.feed.to > TIMETABLE.builtOn, "nothing ahead of the build");
  assert.ok(TIMETABLE.feed.from <= TIMETABLE.feed.to);
  for (const [a, b] of TIMETABLE.feed.gaps) assert.ok(TIMETABLE.feed.from < a && a <= b && b < TIMETABLE.feed.to);
  assert.equal(TIMETABLE.source.licenceId, "CC-BY-4.0");
  assert.equal(TIMETABLE.source.publisher, "Renfe Operadora");
  assert.equal(TIMETABLE.source.attribution, "Origen de los datos: Renfe Operadora");
  assert.equal(TIMETABLE.source.terms, "https://data.renfe.com/legal");
  assert.match(TIMETABLE.source.updated, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "the file's last update, which the terms ask us to give");
  assert.deepEqual(Object.keys(TIMETABLE.lines).sort(), [...LINE_IDS].sort(), "one entry per official line");
  const size = readFileSync(join(ROOT, "src/lib/programmatic/rodalies/timetable.json")).length;
  assert.ok(size < 400_000, `timetable.json is ${size} bytes: the summary only, never the feed`);
});

/* -------------------------------------------------------------------------- */
/* The figures                                                                */
/* -------------------------------------------------------------------------- */

test("times are HH:MM, first before last (after midnight counts as the same night), counts add up", () => {
  for (const id of LINE_IDS) {
    const t = TIMETABLE.lines[id];
    for (const d of t.directions) {
      for (const s of d.stations) {
        assert.ok(MAIN_STATIONS[id].includes(s.id), `${id}: ${s.name} is not a main station`);
        for (const type of DAY_TYPES) {
          const day = s.days[type];
          if (!day) continue;
          assert.match(day.first, HHMM, `${id} ${s.name} ${type}`);
          assert.match(day.last, HHMM, `${id} ${s.name} ${type}`);
          assert.ok(serviceMinutes(day.first) <= serviceMinutes(day.last), `${id} ${s.name} ${type}: ${day.first} after ${day.last}`);
          assert.ok(day.trains >= 1);
          if (day.trains === 1) assert.equal(day.first, day.last);
        }
      }
      for (const type of DAY_TYPES) {
        const bands = d.bands[type];
        if (!bands) continue;
        assert.equal(bands.length, BANDS.length);
        const at = d.stations.find((s) => s.id === d.frequencyAt?.id)?.days[type];
        const total = bands.reduce((n, b) => n + b.trains, 0);
        assert.equal(total, at?.trains ?? 0, `${id} → ${d.towards} ${type}: bands add up to the station's trains`);
        for (const b of bands) {
          if (b.gap !== null) assert.ok(b.trains >= 2 && b.gap > 0);
          if (b.perHour !== null) assert.ok(b.perHour >= 0);
        }
      }
      if (d.listed) {
        for (const type of DAY_TYPES) {
          const times: string[] | null = d.listed.days[type];
          if (!times) continue;
          assert.ok(times.length <= LIST_UP_TO);
          for (const time of times) assert.match(time, HHMM);
          for (let i = 1; i < times.length; i++) assert.ok(serviceMinutes(times[i - 1]!) <= serviceMinutes(times[i]!), `${id} listed ${type} out of order`);
          const station = d.stations.find((s) => s.id === d.listed!.id)?.days[type];
          assert.equal(times[0], station?.first);
          assert.equal(times[times.length - 1], station?.last);
        }
      }
      for (const leg of d.journeys?.legs ?? []) assert.ok(leg.minutes > 0 && leg.minutes < 600 && leg.trips >= 1, `${id} ${leg.name}`);
      const legs = d.journeys?.legs.map((l) => l.minutes) ?? [];
      for (let i = 1; i < legs.length; i++) assert.ok(legs[i - 1]! <= legs[i]!, `${id} → ${d.towards}: journey times grow along the line`);
    }
  }
});

test("reference days: in the file, after the build, of their own type; weekdays never a holiday", () => {
  const holidays = new Set(TIMETABLE.lines.R1.holidays.map((h) => h.date));
  for (const id of LINE_IDS) {
    const t = TIMETABLE.lines[id];
    for (const type of DAY_TYPES) {
      const day = t.days[type];
      if (!day) continue;
      assert.ok(day.date > TIMETABLE.builtOn && day.date <= TIMETABLE.feed.to, `${id} ${type} ${day.date}`);
      assert.equal(dayTypeOf(day.date, holidays), type, `${id} ${type} ${day.date}`);
      assert.ok(day.trains > 0);
      assert.ok(day.span[0] <= day.date && day.date <= day.span[1]);
      for (const [a, b] of day.differentOn) assert.ok(day.date < a && a <= b && b <= day.span[1], `${id} ${type} differs ${a}–${b}`);
    }
  }
});

test("every line has a summary in ca, es and en, with the query-worded questions", () => {
  const day = TIMETABLE.builtOn;
  for (const line of LINES) {
    for (const locale of LOCALES) {
      const view = timetableView(line, locale, day);
      assert.ok(view, `${line.id} ${locale}: no summary`);
      assert.ok(view.title.includes(line.name), `${line.id} ${locale}: ${view.title}`);
      assert.ok(view.directions.length >= 1);
      for (const d of view.directions) {
        assert.equal(d.headers.length, d.dates.length + 1);
        for (const s of d.stations) assert.equal(s.cells.length, d.dates.length);
      }
      const text = JSON.stringify(view);
      assert.doesNotMatch(text, /undefined|NaN|\$\{|\[object|"null"| null[ .,)]/, `${line.id} ${locale}`);
      assert.ok(view.attribution.includes(locale === "en" ? "Data origin: Renfe Operadora" : locale === "ca" ? "Origen de les dades: Renfe Operadora" : "Origen de los datos: Renfe Operadora"));
      const faq = timetableFaq(line, locale, day);
      assert.ok(faq.length >= 2, `${line.id} ${locale}: FAQ`);
      for (const item of faq) assert.doesNotMatch(item.question + item.answer, /undefined|NaN|\$\{|null/);
    }
  }
  const r2s = lineById("R2S");
  const questions = (locale: "ca" | "es" | "en") => timetableFaq(r2s, locale, day).map((f) => f.question);
  assert.ok(questions("es").includes("¿A qué hora pasa el primer tren de la R2 Sud?"));
  assert.ok(questions("es").includes("¿A qué hora sale el último tren de la R2 Sud?"));
  assert.ok(questions("ca").includes("A quina hora passa el primer tren de l'R2 Sud?"));
  assert.ok(questions("en").includes("What time is the first R2 Sud train?"));
  assert.ok(timetableFaq(lineById("R1"), "es", day).some((f) => f.question === "¿Cada cuánto pasa la R1?"));
  assert.equal(timetableView(r2s, "es", day)!.title, "Horarios de la R2 Sud: primer y último tren y cada cuánto pasa");
});

test("the answers quote the snapshot's own times", () => {
  const day = TIMETABLE.builtOn;
  for (const line of LINES) {
    const t = TIMETABLE.lines[line.id];
    const faq = timetableFaq(line, "es", day);
    const first = faq.find((f) => f.question.startsWith("¿A qué hora pasa el primer tren"));
    if (!first || !t.days.weekday) continue;
    const times = t.directions.flatMap((d) => d.stations.map((s) => s.days.weekday?.first)).filter(Boolean) as string[];
    const quoted = [...first.answer.matchAll(/(\d{2}:\d{2})/g)].map((m) => m[1]!);
    assert.ok(quoted.length > 0);
    for (const time of quoted.slice(0, t.directions.length)) assert.ok(times.includes(time), `${line.id}: ${time} is not a weekday first train in the snapshot`);
  }
});

test("past the end of Renfe's file the pages print no timetable", () => {
  const after = "2099-01-01";
  for (const locale of LOCALES) {
    assert.equal(timetableView(lineById("R1"), locale, after), null);
    assert.deepEqual(timetableFaq(lineById("R1"), locale, after), []);
    assert.equal(hubTimetable(LINES, locale, after), null);
  }
});

test("hub: one linked row per line with weekday trains, in the three languages", () => {
  for (const locale of LOCALES) {
    const hub = hubTimetable(LINES, locale, TIMETABLE.builtOn)!;
    assert.ok(hub);
    const withTrains = LINES.filter((l) => TIMETABLE.lines[l.id].days.weekday && TIMETABLE.lines[l.id].directions.length);
    assert.equal(hub.rows.length, withTrains.length);
    for (const row of hub.rows) {
      assert.equal(row.href, `${linePath(locale, row.id)}#horari`);
      assert.match(row.times, /^\d{2}:\d{2} – \d{2}:\d{2}/);
    }
    assert.ok(hub.attribution.includes("Renfe Operadora"));
  }
  assert.equal(hubTimetable(LINES, "es", TIMETABLE.builtOn)!.rows[0]!.label, "Horarios R1");
});

test("line-to-line links: every other line's timetable, in the searched words", () => {
  for (const locale of LOCALES) {
    for (const line of LINES) {
      const links = timetableLinks(LINES, line.id, locale);
      assert.equal(links.length, LINES.length - 1);
      assert.ok(links.every((l) => l.href.startsWith(`/${locale}/rodalies/`) && l.href.endsWith("/#horari") && !l.href.startsWith(linePath(locale, line.id))));
    }
  }
  assert.deepEqual(timetableLinks(LINES, "R1", "es")[0], { label: "Horarios R2", href: "/es/rodalies/r2/#horari" });
  assert.deepEqual(timetableLinks(LINES, "R1", "ca")[2], { label: "Horaris R2 Sud", href: "/ca/rodalies/r2-sud/#horari" });
  assert.deepEqual(timetableLinks(LINES, "R1", "en")[1], { label: "R2 Nord timetable", href: "/en/rodalies/r2-nord/#horari" });
});

/* -------------------------------------------------------------------------- */
/* Wiring                                                                     */
/* -------------------------------------------------------------------------- */

test("pages render the summary on the server from the committed snapshot; the live notices are wired as before", () => {
  const line = readFileSync(join(ROOT, "src/components/programmatic/rodalies/LinePage.tsx"), "utf8");
  assert.match(line, /<TimetableSection view=\{timetable\} \/>/);
  assert.match(line, /timetableFaq\(line, locale, today\)/);
  assert.match(line, /timetableLinks\(LINES, line\.id, locale\)/);
  const hub = readFileSync(join(ROOT, "src/components/programmatic/rodalies/HubPage.tsx"), "utf8");
  assert.match(hub, /<HubTimetableSection table=\{timetable\}/);
  for (const file of ["page.tsx", "[linia]/page.tsx"]) {
    const route = readFileSync(join(ROOT, "src/app/(public)/[locale]/rodalies", file), "utf8");
    assert.match(route, /loadServerAlerts\(\)/, `${file}: the notices are read exactly as before`);
    assert.match(route, /today=\{renderDate\(\)\}/, file);
  }
  const section = readFileSync(join(ROOT, "src/components/programmatic/rodalies/Timetable.tsx"), "utf8");
  assert.doesNotMatch(section, /^"use client"/m, "server component");
  assert.doesNotMatch(section, /fetch\(/, "never fetched per request");
  const copy = readFileSync(join(ROOT, "src/lib/programmatic/rodalies/timetable-copy.ts"), "utf8");
  assert.doesNotMatch(copy, /fetch\(|renfe\.com\/ftransit/, "the pages read the snapshot only");
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts["rodalies-timetable:snapshot"] ?? "", /scripts\/rodalies-timetable\.ts/);
});

test("main stations are on their line, in line order", () => {
  for (const line of LINES) {
    const order = line.stations.map((s) => s.id);
    const main = MAIN_STATIONS[line.id];
    assert.ok(main.length >= 2);
    for (const id of main) assert.ok(order.includes(id), `${line.id}: ${id}`);
    for (let i = 1; i < main.length; i++) assert.ok(order.indexOf(main[i - 1]!) < order.indexOf(main[i]!), `${line.id}: ${main[i]} out of order`);
  }
});

/* -------------------------------------------------------------------------- */
/* The builder, on a small fixture                                            */
/* -------------------------------------------------------------------------- */

test("helpers: GTFS times, clock, service order, runs and gaps", () => {
  assert.equal(gtfsMinutes("25:09:00"), 1509);
  assert.equal(gtfsMinutes(" 07:05:00"), 425);
  assert.equal(clock(1509), "01:09");
  assert.equal(clock(425), "07:05");
  assert.ok(serviceMinutes("00:10") > serviceMinutes("23:50"));
  assert.throws(() => serviceMinutes("24:10"));
  assert.deepEqual(gaps(["2026-11-28", "2026-11-29", "2026-12-05"]), [["2026-11-30", "2026-12-04"]]);
  const all = ["2026-11-23", "2026-11-24", "2026-11-27", "2026-12-07", "2026-12-09"];
  assert.deepEqual(runsWithin(["2026-11-24", "2026-11-27", "2026-12-09"], all), [["2026-11-24", "2026-11-27"], ["2026-12-09", "2026-12-09"]]);
  assert.equal(duration(79), "1 h 19 min");
  assert.equal(duration(60), "1 h");
  assert.equal(duration(5), "5 min");
  assert.equal(runText(["2026-12-07", "2026-12-18"], "es"), "del 7 al 18 de diciembre");
  assert.equal(runText(["2026-11-27", "2026-12-18"], "ca"), "del 27 de novembre al 18 de desembre");
  assert.equal(runText(["2026-12-01", "2026-12-11"], "ca"), "de l'1 a l'11 de desembre");
  assert.equal(runText(["2026-12-13", "2026-12-13"], "en"), "on 13 December");
  assert.equal(bandCell({ trains: 12, perHour: 4, gap: 15 }, "es"), "4 trenes/h · cada 15 min");
  assert.equal(bandCell({ trains: 3, perHour: 1, gap: 30 }, "ca"), "1 tren/h · cada 30 min");
  assert.equal(bandCell({ trains: 0, perHour: 0, gap: null }, "en"), "—");
  assert.equal(attribution("es").startsWith("Origen de los datos: Renfe Operadora"), true);
});

test("builder: directions, first and last, bands, list, journeys, holidays and the days that differ", () => {
  const line = lineById("R17"); // Estació de França, Sants, Tarragona, Salou - Port Aventura are its main stations
  const trip = (dates: string[], start: number, bus = false): FeedTrip => ({
    line: "R17",
    bus,
    dates,
    stops: [
      { station: "79400", arrival: start, departure: start },
      { station: "71801", arrival: start + 15, departure: start + 16 },
      { station: "71500", arrival: start + 90, departure: start + 91 },
      { station: "65411", arrival: start + 100, departure: start + 100 },
    ],
  });
  const back = (dates: string[], start: number): FeedTrip => ({
    line: "R17",
    bus: false,
    dates,
    stops: [
      { station: "65411", arrival: start, departure: start },
      { station: "71500", arrival: start + 10, departure: start + 11 },
      { station: "71801", arrival: start + 85, departure: start + 86 },
      { station: "79400", arrival: start + 100, departure: start + 100 },
    ],
  });
  const weekdays = ["2026-12-01", "2026-12-02", "2026-12-09"];
  const trips: FeedTrip[] = [
    ...[420, 450, 480, 1450].map((t) => trip(weekdays, t)), // 07:00, 07:30, 08:00 and 00:10 after midnight
    trip(["2026-12-09"], 600), // one more on the 9th: that day differs
    back(weekdays, 1080),
    trip(["2026-12-06", "2026-12-08"], 540), // Sunday and the 8 Dec holiday alike
    trip(["2026-12-01"], 700, true), // a replacement bus: never counted as a train
    { ...trip(["2026-12-01"], 800), line: "R16" }, // another line
  ];
  const t = buildLineTimetable(line, trips, {
    after: "2026-11-30",
    holidays: ["2026-12-08"],
    feedDates: ["2026-12-01", "2026-12-02", "2026-12-05", "2026-12-06", "2026-12-08", "2026-12-09"],
  });
  assert.equal(t.days.weekday?.date, "2026-12-01");
  assert.equal(t.days.weekday?.trains, 5);
  assert.equal(t.days.weekday?.buses, 1);
  assert.deepEqual(t.days.weekday?.differentOn, [["2026-12-09", "2026-12-09"]]);
  assert.equal(t.days.saturday, null);
  assert.deepEqual(t.noTrains.saturday, [["2026-12-05", "2026-12-05"]]);
  assert.equal(t.days.sunday?.date, "2026-12-06");
  assert.deepEqual(t.holidays, [{ date: "2026-12-08", sameAsSunday: true }]);
  assert.equal(t.saturdayIsSunday, false);
  assert.equal(t.journeyDay, "weekday");

  const [forward, reverse] = t.directions;
  assert.equal(forward!.towards, "Salou - Port Aventura");
  assert.equal(reverse!.towards, "Barcelona-Estació de França");
  const franca = forward!.stations.find((s) => s.id === "79400")!;
  assert.deepEqual(franca.days.weekday, { first: "07:00", last: "00:10", trains: 4 });
  assert.deepEqual(franca.days.sunday, { first: "09:00", last: "09:00", trains: 1 });
  assert.ok(!forward!.stations.some((s) => s.id === "65411"), "no departure from where the direction ends");
  assert.equal(forward!.frequencyAt?.name, "Barcelona-Sants", "a tie goes to the bigger interchange");
  const bands = forward!.bands.weekday!;
  assert.deepEqual(bands[1], { trains: 3, perHour: 1, gap: 30 });
  assert.equal(bands[5]!.trains, 1, "the 00:10 train counts from 23:00");
  assert.deepEqual(forward!.listed?.days.weekday, ["07:00", "07:30", "08:00", "00:10"]);
  assert.equal(forward!.listed?.days.saturday, null);
  assert.deepEqual(
    forward!.journeys?.legs.map((l) => [l.name, l.minutes]),
    [
      ["Barcelona-Sants", 15],
      ["Tarragona", 90],
      ["Salou - Port Aventura", 100],
    ],
  );
  assert.equal(reverse!.journeys?.from, "Salou - Port Aventura");
  assert.deepEqual(reverse!.stations.map((s) => s.name), ["Salou - Port Aventura", "Tarragona", "Barcelona-Sants"]);
  assert.deepEqual(t.buses, { span: ["2026-12-01", "2026-12-01"], trips: 1, stops: ["Barcelona-Estació de França", "Salou - Port Aventura"] });
});
