/**
 * Low-emission zones city by city (22 Nov 2026): /es/zbe/, /ca/zbe/,
 * /en/low-emission-zones/ and one page per zone.
 *
 * What these tests hold:
 *  - the DGT snapshot: the parser on a fixture, the committed file, its age;
 *  - the answer by label never says a bare "yes" the council did not write,
 *    and a rule with a condition answers "depends";
 *  - "does it apply today?": weekday, weekend, public holiday, and the hours;
 *  - every statement of every city points at an official source it quotes;
 *  - paths, locales, sitemap, publish group and body-date wiring.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

import { TRAFFIC_LAW, zbeCities, zbeCityBySlug } from "../src/lib/programmatic/zbe/cities.ts";
import { answerCell, cityAnswers, cityCopy, cityFaq, cityLead, cityMeta, hubCopy, hubFaq, hubMeta, ofCity, plain } from "../src/lib/programmatic/zbe/copy.ts";
import {
  DGT_ZBE_DATASET,
  DGT_ZBE_INDEX,
  DGT_ZBE_LICENCE,
  ZBE_SNAPSHOT_MAX_AGE_DAYS,
  dgtHolidays,
  dgtWorkingHours,
  parseControlledZones,
  parseIndex,
} from "../src/lib/programmatic/zbe/datex.ts";
import { zbeHolidays } from "../src/lib/programmatic/zbe/holidays.ts";
import { dayStatus, labelAnswer, madridClock, mainRestriction, type Clock } from "../src/lib/programmatic/zbe/logic.ts";
import { zbeCityPath, zbeCityTranslations, zbeHubPath, zbeHubTranslations } from "../src/lib/programmatic/zbe/paths.ts";
import { resolveZbeCity, zbeHubStaticParams, zbeLocaleFor, zbeStaticParams } from "../src/lib/programmatic/zbe/routing.ts";
import { nowText, offText, scheduleText } from "../src/lib/programmatic/zbe/schedule-text.ts";
import { zbeFamilyPaths, zbeSitemapEntries } from "../src/lib/programmatic/zbe/sitemap.ts";
import { DGT_PLACE, ZBE_SNAPSHOT, dgtFileCount, dgtPlacesNotPublished, dgtZoneFor, dgtZoneInCatalonia } from "../src/lib/programmatic/zbe/snapshot.ts";
import { LABELS, ZBE_LOCALES, type Label, type Schedule, type ZbeCity } from "../src/lib/programmatic/zbe/types.ts";

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const city = (slug: string): ZbeCity => {
  const found = zbeCityBySlug(slug);
  assert.ok(found, `${slug} is not a published city`);
  return found;
};
const kinds = (slug: string): Record<Label, string> => Object.fromEntries(LABELS.map((label) => [label, labelAnswer(city(slug), label).kind])) as Record<Label, string>;

/* -------------------------------------------------------------------------- */
/* DGT snapshot                                                               */
/* -------------------------------------------------------------------------- */

/** One zone as the DGT writes it (Tarragona.xml, cut to two polygon corners). */
const FIXTURE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<payload xsi:type="conz:ControlledZoneTablePublication">
  <conz:controlledZoneTable>
    <conz:controlledZone id="43148_ZBE Tarragona">
      <conz:name><com:values><com:value lang="ES">ZBE Tarragona</com:value></com:values></conz:name>
      <conz:controlledZoneDescription><com:values><com:value lang="ES">Restricciones de acceso a veh&#237;culos sin etiqueta, de lunes a viernes laborables de 7 h a 19 h.</com:value></com:values></conz:controlledZoneDescription>
      <conz:controlledZoneRecordVersionTime>2026-01-19T16:13:31.789Z</conz:controlledZoneRecordVersionTime>
      <conz:urlForFurtherInformation>https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe</conz:urlForFurtherInformation>
      <conz:status>active</conz:status>
      <conz:trafficRegulationOrder><tra:trafficRegulation>
        <tra:typeOfRegulation xsi:type="tra:AccessRestriction"><tra:accessRestrictionType>noEntry</tra:accessRestrictionType></tra:typeOfRegulation>
        <tra:condition xsi:type="tra:ConditionSet">
          <tra:conditions xsi:type="tra:LocationCondition"><loc:openlrPolygonCorners>
            <loc:openlrCoordinates><loc:latitude>41.120956</loc:latitude><loc:longitude>1.2514741</loc:longitude></loc:openlrCoordinates>
            <loc:openlrCoordinates><loc:latitude>41.12193</loc:latitude><loc:longitude>1.2500801</loc:longitude></loc:openlrCoordinates>
          </loc:openlrPolygonCorners></tra:conditions>
          <tra:conditions xsi:type="tra:ConditionSet">
            <tra:negate>true</tra:negate>
            <tra:conditions xsi:type="conz:NonCodableCondition">
              <conz:condition><com:values><com:value lang="ES">Sin distintivo</com:value></com:values></conz:condition>
              <conz:type>stickerCondition</conz:type>
            </tra:conditions>
          </tra:conditions>
          <tra:conditions xsi:type="tra:ValidityCondition"><com:validityTimeSpecification>
            <com:overallStartTime>2026-01-20T00:00:00.000+01:00</com:overallStartTime>
            <com:validPeriod>
              <com:periodName><com:values><com:value lang="ES">L</com:value></com:values></com:periodName>
              <com:recurringTimePeriodOfDay><com:startTimeOfPeriod>07:00:00Z</com:startTimeOfPeriod><com:endTimeOfPeriod>19:00:00Z</com:endTimeOfPeriod></com:recurringTimePeriodOfDay>
            </com:validPeriod>
          </com:validityTimeSpecification></tra:conditions>
        </tra:condition>
      </tra:trafficRegulation></conz:trafficRegulationOrder>
    </conz:controlledZone>
  </conz:controlledZoneTable>
</payload>`;

test("DGT file: one zone parsed as the file writes it (name, INE, URL, sticker, hours, start, bounding box)", () => {
  const zones = parseControlledZones(FIXTURE, "Tarragona.xml", "2026-07-08T12:24");
  assert.equal(zones.length, 1);
  const zone = zones[0]!;
  assert.equal(zone.id, "43148_ZBE Tarragona");
  assert.equal(zone.ine, "43148");
  assert.equal(zone.name, "ZBE Tarragona");
  assert.equal(zone.description, "Restricciones de acceso a vehículos sin etiqueta, de lunes a viernes laborables de 7 h a 19 h.");
  assert.equal(zone.url, "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe");
  assert.equal(zone.status, "active");
  assert.equal(zone.regulation, "noEntry");
  assert.deepEqual(zone.stickers, ["Sin distintivo"]);
  assert.equal(zone.negated, true);
  assert.equal(zone.start, "2026-01-20");
  assert.deepEqual(zone.periods, [{ name: "L", from: "07:00", to: "19:00", holiday: false }]);
  assert.deepEqual(dgtWorkingHours(zone), { from: "07:00", to: "19:00" });
  assert.equal(dgtHolidays(zone), false);
  assert.equal(zone.polygons, 1);
  assert.equal(zone.corners, 2);
  assert.deepEqual(zone.bbox, [41.12096, 1.25008, 41.12193, 1.25147]);
  assert.equal(zone.modified, "2026-07-08T12:24");
});

test("DGT file: a file without a zone stops the snapshot instead of writing an empty one", () => {
  assert.throws(() => parseControlledZones("<payload></payload>", "Nueva.xml"), /no conz:controlledZone/);
});

test("DGT directory listing: the .xml files with their listing date, percent-encoded names decoded", () => {
  const html = `<a href="../">../</a>\n<a href="ACoru%C3%B1a.xml">ACoruña.xml</a>  08-Jul-2026 12:24  37352\n<a href="Valencia.xml">Valencia.xml</a>  31-Jul-2026 09:02  1200\n<a href="readme.txt">readme.txt</a>`;
  assert.deepEqual(parseIndex(html), [
    { href: "ACoru%C3%B1a.xml", file: "ACoruña.xml", modified: "2026-07-08T12:24" },
    { href: "Valencia.xml", file: "Valencia.xml", modified: "2026-07-31T09:02" },
  ]);
});

test("committed snapshot: the DGT directory of 22 Nov 2026, attributed, every file with a municipality name", () => {
  assert.match(ZBE_SNAPSHOT.builtOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(ZBE_SNAPSHOT.index, DGT_ZBE_INDEX);
  assert.equal(ZBE_SNAPSHOT.dataset, DGT_ZBE_DATASET);
  assert.equal(ZBE_SNAPSHOT.licence, DGT_ZBE_LICENCE);
  assert.match(ZBE_SNAPSHOT.licence, /creativecommons\.org\/licenses\/by\/4\.0/);
  assert.match(ZBE_SNAPSHOT.publisher, /Dirección General de Tráfico/);
  assert.ok(ZBE_SNAPSHOT.zones.length >= 40, `only ${ZBE_SNAPSHOT.zones.length} zones`);
  assert.ok(dgtFileCount() >= 30, `only ${dgtFileCount()} files`);
  for (const zone of ZBE_SNAPSHOT.zones) {
    assert.ok(zone.id && zone.name, `${zone.file}: a zone without id or name`);
    assert.ok(DGT_PLACE[zone.file], `${zone.file} has no municipality name in DGT_PLACE (snapshot.ts): the hub would print the file name`);
  }
});

test("date guard: the committed DGT snapshot is at most 30 days old (npm run zbe:snapshot -- build)", () => {
  assert.equal(ZBE_SNAPSHOT_MAX_AGE_DAYS, 30);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const age = Math.round((Date.parse(today) - Date.parse(ZBE_SNAPSHOT.builtOn)) / 86_400_000);
  assert.ok(
    age <= ZBE_SNAPSHOT_MAX_AGE_DAYS,
    `DGT ZBE snapshot from ${ZBE_SNAPSHOT.builtOn} (${age} days): run \`npm run zbe:snapshot -- build\`, read the diff (a new zone, or changed hours, start date or URL, means re-reading that council's page) and commit it.`,
  );
});

test("snapshot helpers: each published city finds its DGT zone; Catalonia by INE province; the hub's remainder has no published city", () => {
  for (const c of zbeCities()) assert.ok(dgtZoneFor(c), `${c.slug}: no zone for ${c.dgtFile} in the snapshot`);
  assert.equal(dgtZoneFor({ dgtFile: "NoSuch.xml" }), null);
  assert.equal(dgtZoneInCatalonia({ ine: "43148" }), true);
  assert.equal(dgtZoneInCatalonia({ ine: "8019" }), true, "a four-digit INE code is province 08");
  assert.equal(dgtZoneInCatalonia({ ine: "28079" }), false);
  assert.equal(dgtZoneInCatalonia({ ine: null }), false);
  const rest = dgtPlacesNotPublished(zbeCities());
  const published = new Set(zbeCities().map((c) => DGT_PLACE[c.dgtFile]));
  for (const place of rest) assert.ok(!published.has(place.place), `${place.place} is published and also listed as not published`);
  assert.equal(new Set(rest.map((p) => p.place)).size, rest.length, "a municipality listed twice");
});

/* -------------------------------------------------------------------------- */
/* The answer by label                                                        */
/* -------------------------------------------------------------------------- */

test("answer by label: Tarragona, Girona and Barcelona restrict only vehicles with no label; Reus depends for B and no label", () => {
  for (const slug of ["tarragona", "girona", "barcelona"]) {
    assert.deepEqual(kinds(slug), { "0": "yes", ECO: "yes", C: "yes", B: "yes", none: "no" }, slug);
  }
  assert.deepEqual(kinds("reus"), { "0": "yes", ECO: "yes", C: "yes", B: "depends", none: "depends" });
});

test("answer by label: three different rules in the hours too (Tarragona 7-19, Barcelona and Girona 7-20, working weekdays)", () => {
  assert.deepEqual(mainRestriction(city("tarragona")).schedule, { days: "working-weekdays", from: "07:00", to: "19:00" });
  assert.deepEqual(mainRestriction(city("barcelona")).schedule, { days: "working-weekdays", from: "07:00", to: "20:00" });
  assert.deepEqual(mainRestriction(city("girona")).schedule, { days: "working-weekdays", from: "07:00", to: "20:00" });
});

test("answer by label: 'yes' only for a label the council names; silence is 'depends', a condition is 'depends', never a bare yes", () => {
  const base = city("tarragona");
  const silent = { restrictions: base.restrictions, allowed: { ...base.allowed, labels: ["0", "ECO"] as Label[] } };
  assert.equal(labelAnswer(silent, "C").kind, "depends", "a label the council's page does not mention");
  assert.equal(labelAnswer(silent, "0").kind, "yes");
  assert.equal(labelAnswer(silent, "none").kind, "no");
  const conditional = {
    restrictions: [{ ...base.restrictions[0]!, labels: ["B"] as Label[], condition: { es: "Solo en episodios de contaminación", ca: "Només en episodis de contaminació", en: "Only during pollution episodes" } }],
    allowed: { ...base.allowed, labels: ["0", "ECO", "C", "B"] as Label[] },
  };
  assert.equal(labelAnswer(conditional, "B").kind, "depends", "a restricted label is never 'yes', even if the allowed list names it");
  const cell = answerCell({ authority: "Ajuntament" }, labelAnswer(conditional, "B"), "en");
  assert.equal(cell.verdict, "It depends");
  assert.equal(cell.detail, "Only during pollution episodes.");
  const unknown = answerCell({ authority: "Ajuntament de Prova" }, labelAnswer(silent, "C"), "es");
  assert.equal(unknown.verdict, "Depende");
  assert.match(unknown.detail, /no dice si esta etiqueta puede entrar.*Ajuntament de Prova/);
});

test("answer cells: a 'no' carries days and hours, a 'yes' says only 'no restriction by label', in the three languages", () => {
  const tarragona = city("tarragona");
  const no = labelAnswer(tarragona, "none");
  assert.equal(answerCell(tarragona, no, "es").verdict, "No, de lunes a viernes laborables, de 7 a 19 h");
  assert.equal(answerCell(tarragona, no, "ca").verdict, "No, de dilluns a divendres feiners, de 7 a 19 h");
  assert.equal(answerCell(tarragona, no, "en").verdict, "No, Monday to Friday except public holidays, 7:00 to 19:00");
  assert.match(answerCell(tarragona, no, "es").detail, /Salvo autorización/);
  assert.match(answerCell(tarragona, no, "es").detail, /sábados, domingos y festivos/);
  const yes = labelAnswer(tarragona, "C");
  assert.deepEqual(answerCell(tarragona, yes, "es"), { verdict: "Sí", detail: "Sin restricción de acceso por etiqueta ambiental." });
  assert.deepEqual(answerCell(tarragona, yes, "en"), { verdict: "Yes", detail: "No access restriction by environmental label." });
  for (const c of zbeCities()) {
    for (const locale of ZBE_LOCALES) {
      for (const answer of cityAnswers(c)) {
        const cell = answerCell(c, answer, locale);
        assert.ok(cell.verdict.length > 0 && cell.detail.length > 10, `${c.slug} ${locale} ${answer.label}: an empty answer`);
        if (answer.kind !== "yes") assert.ok(!/^(Sí|Yes)\b/.test(cell.verdict), `${c.slug} ${answer.label}: a yes for a ${answer.kind}`);
      }
    }
  }
});

test("Reus: the two conditional rules print their condition, not a yes or a no", () => {
  const reus = city("reus");
  for (const label of ["B", "none"] as const) {
    const cell = answerCell(reus, labelAnswer(reus, label), "es");
    assert.equal(cell.verdict, "Depende");
    assert.ok(cell.detail.length > 80, `${label}: the condition is not spelled out`);
  }
  assert.match(cityLead(reus, "es"), /depende de condiciones/);
  assert.doesNotMatch(cityLead(reus, "es"), /no pueden entrar/);
});

/* -------------------------------------------------------------------------- */
/* Does it apply today?                                                       */
/* -------------------------------------------------------------------------- */

const WORKING: Schedule = { days: "working-weekdays", from: "07:00", to: "19:00" };
const ALWAYS: Schedule = { days: "every-day", from: "00:00", to: "24:00" };
const at = (iso: string, weekday: number, time: string): Clock => {
  const [h, m] = time.split(":").map(Number);
  return { iso, weekday, minutes: h! * 60 + m! };
};

test("today: a working weekday applies, before / during / after the hours", () => {
  // Monday 23 Nov 2026.
  assert.deepEqual(dayStatus(WORKING, at("2026-11-23", 1, "06:59"), []), { applies: true, reason: "working-day", phase: "before" });
  assert.deepEqual(dayStatus(WORKING, at("2026-11-23", 1, "07:00"), []), { applies: true, reason: "working-day", phase: "active" });
  assert.deepEqual(dayStatus(WORKING, at("2026-11-23", 1, "18:59"), []), { applies: true, reason: "working-day", phase: "active" });
  assert.deepEqual(dayStatus(WORKING, at("2026-11-23", 1, "19:00"), []), { applies: true, reason: "working-day", phase: "after" });
});

test("today: Saturday and Sunday do not apply, whatever the hour", () => {
  assert.deepEqual(dayStatus(WORKING, at("2026-11-21", 6, "10:00"), []), { applies: false, reason: "weekend", phase: "off" });
  assert.deepEqual(dayStatus(WORKING, at("2026-11-22", 0, "10:00"), []), { applies: false, reason: "weekend", phase: "off" });
});

test("today: a public holiday on a weekday does not apply; a date missing from the list counts as a working day", () => {
  const holidays = zbeHolidays(city("tarragona")).days;
  // Tuesday 8 Dec 2026 (Immaculada), Friday 25 Dec 2026, Friday 1 Jan 2027: national.
  for (const [iso, weekday] of [["2026-12-08", 2], ["2026-12-25", 5], ["2027-01-01", 5]] as const) {
    assert.deepEqual(dayStatus(WORKING, at(iso, weekday, "10:00"), holidays), { applies: false, reason: "holiday", phase: "off" }, iso);
  }
  // Wednesday 23 Sep 2026, Santa Tecla: local holiday of Tarragona only.
  assert.equal(dayStatus(WORKING, at("2026-09-23", 3, "10:00"), holidays).reason, "holiday");
  assert.equal(dayStatus(WORKING, at("2026-09-23", 3, "10:00"), zbeHolidays(city("girona")).days).reason, "working-day");
  // Wednesday 9 Dec 2026: an ordinary working day.
  assert.deepEqual(dayStatus(WORKING, at("2026-12-09", 3, "10:00"), holidays), { applies: true, reason: "working-day", phase: "active" });
  assert.deepEqual(dayStatus(WORKING, at("2026-12-08", 2, "10:00"), []), { applies: true, reason: "working-day", phase: "active" }, "unknown holiday = working day (strict side)");
});

test("today: holidays known per city (national and Catalan for 2026 and 2027; local only where the site has them)", () => {
  const tarragona = zbeHolidays(city("tarragona"));
  for (const day of ["2026-09-11", "2026-12-26", "2026-12-25", "2027-01-01", "2027-01-06"]) assert.ok(tarragona.days.includes(day), day);
  assert.equal(tarragona.localThrough, "2026-12-31");
  assert.equal(tarragona.through, "2027-12-31");
  const rondes = zbeHolidays(city("barcelona"));
  assert.equal(rondes.localThrough, null, "the Rondes zone spans five municipalities: no local holidays are assumed");
  assert.ok(!rondes.days.includes("2026-09-24"), "La Mercè is Barcelona's own holiday, not the zone's");
  assert.ok(rondes.days.includes("2026-09-11"));
});

test("today: a zone that applies every day at every hour is always active", () => {
  assert.deepEqual(dayStatus(ALWAYS, at("2026-11-22", 0, "03:00"), ["2026-11-22"]), { applies: true, reason: "every-day", phase: "active" });
});

test("today: the Madrid clock, across the UTC date line and the summer hour", () => {
  assert.deepEqual(madridClock(new Date("2026-11-22T23:30:00Z")), { iso: "2026-11-23", weekday: 1, minutes: 30 });
  assert.deepEqual(madridClock(new Date("2026-07-01T05:00:00Z")), { iso: "2026-07-01", weekday: 3, minutes: 7 * 60 });
  assert.deepEqual(madridClock(new Date("2026-11-22T11:15:00Z")), { iso: "2026-11-22", weekday: 0, minutes: 12 * 60 + 15 });
});

test("today: the sentence the page prints says the day, whether it applies and why", () => {
  const sunday = at("2026-11-22", 0, "12:00");
  const text = nowText(dayStatus(WORKING, sunday, []), WORKING, sunday, "es");
  assert.match(text.day, /domingo 22 de noviembre/);
  assert.match(text.day, /no se aplica/);
  assert.match(text.day, /fin de semana/);
  const monday = at("2026-11-23", 1, "08:00");
  const active = nowText(dayStatus(WORKING, monday, []), WORKING, monday, "en");
  assert.match(active.day, /Monday 23 November/);
  assert.match(active.day, /7:00 to 19:00/);
  assert.match(active.hour, /in force/i);
  const holiday = at("2026-12-08", 2, "08:00");
  assert.match(nowText(dayStatus(WORKING, holiday, ["2026-12-08"]), WORKING, holiday, "ca").day, /festiu/);
  assert.equal(scheduleText(WORKING, "es"), "de lunes a viernes laborables, de 7 a 19 h");
  assert.match(offText(WORKING, "es"), /sábados, domingos y festivos/);
});

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

test("every city: an official source for every statement, the council's own words quoted, a check date", () => {
  assert.ok(zbeCities().length >= 4);
  assert.equal(new Set(zbeCities().map((c) => c.slug)).size, zbeCities().length, "a slug used twice");
  for (const c of zbeCities()) {
    assert.match(c.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, c.slug);
    assert.match(c.checked, /^2026-\d{2}-\d{2}$|^2027-\d{2}-\d{2}$/, `${c.slug}: checked`);
    assert.ok(c.sources.length >= 2, `${c.slug}: fewer than two sources`);
    for (const source of c.sources) {
      assert.match(source.url, /^https:\/\//, `${c.slug}: ${source.url}`);
      assert.ok(source.title.length > 5 && source.publisher.length > 2, `${c.slug}: a source without title or publisher`);
    }
    assert.match(c.mapUrl, /^https:\/\//, `${c.slug}: mapUrl`);
    assert.match(c.officialUrl, /^https:\/\//, `${c.slug}: officialUrl`);
    const proofs = [...c.restrictions, c.allowed, ...c.facts];
    for (const proof of proofs) {
      assert.ok(Number.isInteger(proof.source) && proof.source >= 0 && proof.source < c.sources.length, `${c.slug}: a statement points at source ${proof.source}`);
      assert.ok(proof.quote.trim().length >= 10, `${c.slug}: a statement without the official words it rests on`);
    }
    assert.ok(c.restrictions.length >= 1, `${c.slug}: no access rule`);
    for (const r of c.restrictions) {
      assert.ok(r.labels.length > 0, `${c.slug}: a restriction for no label`);
      assert.match(r.schedule.from, /^\d{2}:\d{2}$/);
      assert.match(r.schedule.to, /^\d{2}:\d{2}$/);
      assert.match(r.since, /^\d{4}-\d{2}-\d{2}$/);
      for (const locale of ZBE_LOCALES) {
        assert.ok(r.vehicles[locale].length > 5, `${c.slug} ${locale}: vehicles`);
        if (r.condition) assert.ok(r.condition[locale].length > 20, `${c.slug} ${locale}: a condition must be spelled out`);
        if (r.unless) assert.ok(r.unless[locale].length > 10, `${c.slug} ${locale}: unless`);
      }
    }
    for (const label of c.allowed.labels) assert.ok(!c.restrictions.some((r) => r.labels.includes(label) && !r.condition), `${c.slug}: ${label} is both allowed and restricted`);
    for (const fact of c.facts) for (const locale of ZBE_LOCALES) assert.ok(fact.text[locale].length > 20, `${c.slug} ${locale}: an empty ${fact.kind} fact`);
    for (const kind of ["area", "since"] as const) assert.ok(c.facts.some((f) => f.kind === kind), `${c.slug}: no "${kind}" fact`);
    for (const locale of ZBE_LOCALES) {
      assert.ok(c.name[locale] && c.zoneName[locale], `${c.slug} ${locale}: name`);
      for (const note of c.notPublished) assert.ok(note[locale].length > 10, `${c.slug} ${locale}: notPublished`);
      if (c.dgtDifference) assert.ok(c.dgtDifference[locale].length > 20, `${c.slug} ${locale}: dgtDifference`);
    }
  }
});

test("a fine amount is printed only with the page it was read on; where the council gives none, the traffic act's 200 euros with its article", () => {
  for (const c of zbeCities()) {
    const fines = c.facts.filter((f) => f.kind === "fine");
    assert.ok(fines.length >= 1, `${c.slug}: no fine fact`);
    for (const fine of fines) {
      assert.match(fine.quote, /\d|euro|multa|sanci/i, `${c.slug}: the fine's quote names no amount or sanction`);
      if (c.sources[fine.source]!.url === TRAFFIC_LAW.url) assert.match(fine.text.es, /200 euros/);
    }
  }
  assert.match(TRAFFIC_LAW.url, /^https:\/\/www\.boe\.es\/buscar\/act\.php\?id=BOE-A-2015-11722$/);
});

test("no page of the family links aerobusbcn.com, and every outbound URL of a city is https", () => {
  const files = ["cities.ts", "copy.ts", "snapshot.ts", "datex.ts", "schedule-text.ts"].map((f) => read(`src/lib/programmatic/zbe/${f}`));
  files.push(read("src/components/programmatic/zbe/ZbePages.tsx"), read("src/components/programmatic/zbe/routes.tsx"));
  for (const text of files) {
    assert.doesNotMatch(text, /aerobusbcn/i);
    assert.doesNotMatch(text, /http:\/\//, "a non-https URL");
  }
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("titles fit 60 characters and descriptions 155, for the hub and every city, in the three languages", () => {
  for (const locale of ZBE_LOCALES) {
    const hub = hubMeta(locale);
    assert.ok(hub.title.length <= 60, `${locale} hub title: ${hub.title.length}`);
    assert.ok(hub.description.length >= 110 && hub.description.length <= 155, `${locale} hub description: ${hub.description.length}`);
    for (const c of zbeCities()) {
      const meta = cityMeta(c, locale);
      assert.ok(meta.title.length <= 60, `${locale} ${c.slug} title: ${meta.title.length}`);
      assert.ok(meta.description.length >= 110 && meta.description.length <= 155, `${locale} ${c.slug} description: ${meta.description.length}`);
      assert.ok(meta.h1.includes(c.name[locale]), `${locale} ${c.slug}: h1`);
      assert.ok(cityLead(c, locale).length > 60, `${locale} ${c.slug}: lead`);
    }
  }
  assert.equal(hubMeta("es").h1, "ZBE en España: ciudades, etiquetas y horarios");
  assert.equal(cityMeta(city("tarragona"), "es").h1, "ZBE de Tarragona: ¿puedo entrar con mi coche?");
});

test("Catalan elides 'de' before a vowel or h; Spanish and English never do", () => {
  assert.equal(ofCity("Oviedo", "ca"), "d'Oviedo");
  assert.equal(ofCity("Alacant", "ca"), "d'Alacant");
  assert.equal(ofCity("Tarragona", "ca"), "de Tarragona");
  assert.equal(ofCity("Oviedo", "es"), "de Oviedo");
});

test("FAQ: the questions people type (mapa, etiqueta B, hoy, the year, cámaras, multa), answered from the city's own facts", () => {
  for (const c of zbeCities()) {
    for (const locale of ZBE_LOCALES) {
      const faq = cityFaq(c, locale);
      assert.ok(faq.length >= 6, `${c.slug} ${locale}: ${faq.length} questions`);
      assert.equal(new Set(faq.map((item) => item.q)).size, faq.length, `${c.slug} ${locale}: a question twice`);
      for (const item of faq) {
        assert.ok(item.q.endsWith("?"), item.q);
        assert.ok(item.a.length > 30, `${c.slug} ${locale}: "${item.q}" has no answer`);
        assert.doesNotMatch(plain(item.a), /\]\(/, "markdown left in a plain answer");
      }
    }
    const questions = cityFaq(c, "es").map((item) => item.q.toLowerCase()).join(" | ");
    for (const word of ["mapa", "etiqueta b", "hoy", c.checked.slice(0, 4), "cámaras", "multa"]) assert.ok(questions.includes(word), `${c.slug}: no question with "${word}"`);
  }
  const counts = { cities: zbeCities().length, zones: ZBE_SNAPSHOT.zones.length, files: dgtFileCount(), builtOn: ZBE_SNAPSHOT.builtOn };
  for (const locale of ZBE_LOCALES) {
    const faq = hubFaq(locale, { ...counts, index: DGT_ZBE_INDEX, lawUrl: TRAFFIC_LAW.url });
    assert.ok(faq.length >= 3, `${locale}: hub FAQ`);
    for (const item of faq) assert.ok(item.q.endsWith("?") && item.a.length > 30, item.q);
    assert.ok(hubCopy(locale, counts).lead.length > 80);
    for (const c of zbeCities()) assert.ok(cityCopy(c, locale).tableCaption.length > 10);
  }
});

/* -------------------------------------------------------------------------- */
/* Routes, sitemap, publish group                                             */
/* -------------------------------------------------------------------------- */

test("paths: /es/zbe/<ciudad>/, /ca/zbe/<ciutat>/, /en/low-emission-zones/<city>/, hubs at the base path", () => {
  assert.equal(zbeHubPath("es"), "/es/zbe/");
  assert.equal(zbeHubPath("ca"), "/ca/zbe/");
  assert.equal(zbeHubPath("en"), "/en/low-emission-zones/");
  assert.equal(zbeCityPath("es", "tarragona"), "/es/zbe/tarragona/");
  assert.equal(zbeCityPath("ca", "tarragona"), "/ca/zbe/tarragona/");
  assert.equal(zbeCityPath("en", "tarragona"), "/en/low-emission-zones/tarragona/");
  assert.deepEqual(zbeHubTranslations(), { es: "/es/zbe/", ca: "/ca/zbe/", en: "/en/low-emission-zones/" });
  assert.deepEqual(zbeCityTranslations("reus"), { es: "/es/zbe/reus/", ca: "/ca/zbe/reus/", en: "/en/low-emission-zones/reus/" });
});

test("routing: each folder answers only its own locales and only published cities", () => {
  assert.equal(zbeLocaleFor("zbe", "es"), "es");
  assert.equal(zbeLocaleFor("zbe", "ca"), "ca");
  assert.equal(zbeLocaleFor("zbe", "en"), null);
  assert.equal(zbeLocaleFor("low-emission-zones", "en"), "en");
  assert.equal(zbeLocaleFor("low-emission-zones", "es"), null);
  assert.equal(resolveZbeCity("zbe", "es", "tarragona")?.city.slug, "tarragona");
  assert.equal(resolveZbeCity("zbe", "en", "tarragona"), null);
  assert.equal(resolveZbeCity("low-emission-zones", "en", "tarragona")?.locale, "en");
  assert.equal(resolveZbeCity("low-emission-zones", "ca", "tarragona"), null);
  assert.equal(resolveZbeCity("zbe", "es", "no-such-city"), null);
  assert.equal(resolveZbeCity("zbe", "es", "Tarragona"), null, "slugs are lower case: no second URL for one page");
  assert.deepEqual(zbeHubStaticParams("zbe"), [{ locale: "es" }, { locale: "ca" }]);
  assert.deepEqual(zbeHubStaticParams("low-emission-zones"), [{ locale: "en" }]);
  assert.equal(zbeStaticParams("zbe", "ciudad").length, 2 * zbeCities().length);
  assert.equal(zbeStaticParams("low-emission-zones", "city").length, zbeCities().length);
  assert.ok(zbeStaticParams("zbe", "ciudad").some((p) => p.locale === "ca" && p.ciudad === "girona"));
});

test("route files: static, revalidated by the publish group, params awaited, unknown pages 404", () => {
  const files = ["zbe/page.tsx", "zbe/[ciudad]/page.tsx", "low-emission-zones/page.tsx", "low-emission-zones/[city]/page.tsx"];
  for (const file of files) {
    const source = read(`src/app/(public)/[locale]/${file}`);
    assert.match(source, /^export const revalidate = false;$/m, file);
    assert.match(source, /^export const dynamicParams = true;$/m, file);
    assert.match(source, /export function generateStaticParams\(\)/, file);
    assert.match(source, /await params/, file);
    assert.match(source, /notFound\(\)/, file);
    assert.match(source, /NOT_FOUND_METADATA/, file);
    assert.doesNotMatch(source, /fetch\(/, `${file}: nothing is fetched at request time`);
  }
});

test("family paths: three hubs first, then every city in the three languages, each with its translations", () => {
  const paths = zbeFamilyPaths();
  assert.deepEqual(paths.slice(0, 3).map((p) => p.path), ["/es/zbe/", "/ca/zbe/", "/en/low-emission-zones/"]);
  assert.equal(paths.length, 3 + 3 * zbeCities().length);
  assert.equal(new Set(paths.map((p) => p.path)).size, paths.length);
  for (const p of paths) {
    assert.match(p.path, /^\/(es|ca)\/zbe\/([a-z0-9-]+\/)?$|^\/en\/low-emission-zones\/([a-z0-9-]+\/)?$/);
    assert.ok(Object.values(p.translations).includes(p.path), `${p.path} is not among its own translations`);
    assert.ok(p.checked >= ZBE_SNAPSHOT.builtOn, `${p.path}: dated before the snapshot`);
  }
});

test("sitemap: one entry per URL with ca, es, en and x-default (English); nothing on a deployment that must not be indexed", () => {
  const entries = zbeSitemapEntries();
  assert.equal(entries.length, zbeFamilyPaths().length);
  const hub = entries.find((e) => e.url.endsWith("/es/zbe/"));
  assert.ok(hub);
  const languages = hub.alternates?.languages as Record<string, string>;
  assert.ok(languages.ca!.endsWith("/ca/zbe/"));
  assert.ok(languages.en!.endsWith("/en/low-emission-zones/"));
  assert.equal(languages["x-default"], languages.en);
  for (const entry of entries) {
    assert.ok(entry.lastModified instanceof Date && !Number.isNaN(entry.lastModified.valueOf()), entry.url);
    assert.ok(entry.lastModified.valueOf() <= Date.now(), `${entry.url}: lastmod in the future`);
  }
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "false";
  try {
    assert.deepEqual(zbeSitemapEntries(), []);
  } finally {
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  }
});

test("wiring: sitemap.ts, the body-date generator and the publish group `zbe` all name the family", () => {
  assert.match(read("src/app/sitemap.ts"), /\.\.\.dated\("zbe", \[\.\.\.zbeSitemapEntries\(\)\]\)/);
  assert.match(read("scripts/lib/body-families.ts"), /^ {2}zbe: urls\(\(\) => zbeSitemapEntries\(\)\),$/m);
  assert.match(read("src/app/api/admin/publish/route.ts"), /if \(wants\("zbe"\)\) codePaths\.push\(\.\.\.zbeFamilyPaths\(\)\.map\(\(entry\) => entry\.path\)\);/);
  const dates = JSON.parse(read("src/lib/seo/body-dates.json")) as { families: Record<string, unknown> };
  assert.ok(dates.families.zbe, "run `npm run seo:body-dates`: the family has no body date");
  assert.match(read("package.json"), /"zbe:snapshot": /);
});
