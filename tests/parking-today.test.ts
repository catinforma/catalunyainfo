import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PARKING } from "../src/lib/content/batch02/barcelona-practical.ts";
import {
  PARKING_TODAY_AS_OF,
  PARKING_TODAY_REREAD_BY,
  parkingDayKind,
  parkingPriceRanges,
  parkingTodayLines,
} from "../src/lib/content/batch02/parking-today.ts";
import { blockSchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";

/**
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Barcelona blue/green parking: a
 * date-driven answer"): the parking guide answers "do I pay today, where, how
 * much, how long, and on Sundays, holidays and in August" from today's date,
 * using only what AREA's own pages state (quotes in parking-today.ts). Where
 * AREA is silent (weekday public holidays outside the beach zone) the block
 * says so instead of choosing.
 */

const LOCALES = ["ca", "es", "en"] as const;
const today = () => new Date().toISOString().slice(0, 10);

test("date guard: AREA's pages, the beach-zone news and Zone 36 are re-read by PARKING_TODAY_REREAD_BY", () => {
  assert.ok(PARKING_TODAY_AS_OF <= today(), "PARKING_TODAY_AS_OF in the future");
  assert.ok(PARKING_TODAY_REREAD_BY > PARKING_TODAY_AS_OF);
  assert.ok(
    today() < PARKING_TODAY_REREAD_BY,
    `From ${PARKING_TODAY_REREAD_BY}: re-read areaverda.cat (azul, verde, exclusivas, beach-zone news, Zone 36), the quotes in batch02/parking-today.ts, then move PARKING_TODAY_AS_OF, PARKING_TODAY_REREAD_BY and the note's "24 de noviembre de 2026" in the three languages.`,
  );
});

test("day kinds: the weekday words match the date (24 Nov 2026 is a Tuesday)", () => {
  assert.equal(weekdayIndex("2026-11-24"), 2);
  assert.equal(parkingDayKind("2026-11-24"), "weekday");
  assert.equal(parkingDayKind("2026-11-27"), "weekday");
  assert.equal(parkingDayKind("2026-11-28"), "saturday");
  assert.equal(parkingDayKind("2026-11-29"), "sunday");
});

test("a working weekday: both zones are charged on AREA's general hours, in every language, naming the date", () => {
  const head = {
    ca: /^Avui, dimarts, 24 de novembre de 2026, sí que es paga: la zona blava de 9\.00 a 20\.00 h i la zona verda de no residents de 8\.00 a 20\.00 h o fins a les 22\.00 h/,
    es: /^Hoy, martes, 24 de noviembre de 2026, sí se paga: la zona azul de 9:00 a 20:00 y la zona verde de no residentes de 8:00 a 20:00 o hasta las 22:00/,
    en: /^Today, Tuesday 24 November 2026, you pay: blue zone from 9:00 to 20:00 and non-resident green zone from 8:00 to 20:00 or until 22:00/,
  } as const;
  for (const locale of LOCALES) {
    const lines = parkingTodayLines("2026-11-24", locale);
    assert.equal(lines.kind, "weekday");
    assert.equal(lines.holiday, null);
    assert.equal(lines.free, false);
    assert.match(lines.headline, head[locale], locale);
    assert.equal(lines.facts.length, 5, `${locale}: blue, green, resident-only, maximum stay, price`);
    assert.match(lines.facts[4]!.value, locale === "en" ? /€1\.15–€3\.75.*€1\.40–€4\.25/ : /1,15 €–3,75 €.*1,40 €–4,25 €/, `${locale}: price ranges`);
    assert.match(lines.note, /24 (de )?(novembre|noviembre|November) (de )?2026/, `${locale}: read date`);
  }
});

test("Saturday and Sunday: Saturday only in the centre / Monday-to-Saturday zones; Sunday free except the beach zone", () => {
  const sat = parkingTodayLines("2026-11-28", "es");
  // Reviewer 24 Nov: AREA's beach news keeps the 142 Av. Litoral blue spaces Monday to Sunday, so Saturday is not "centre only".
  assert.match(sat.headline, /^Hoy, sábado, 28 de noviembre de 2026, la zona azul se paga en el centro de la ciudad y en el tramo de la avenida Litoral, y la zona verde solo donde funciona de lunes a sábado/);
  assert.match(sat.facts[0]!.value, /en el resto no, salvo en la zona de playa\. En la zona de playa, desde el 1 de octubre de 2026 solo el tramo de la avenida Litoral entre Joan Miró y la Jonquera \(142 plazas\) se paga de lunes a domingo/);
  assert.match(parkingTodayLines("2026-11-28", "ca").headline, /al centre de la ciutat i al tram de l'avinguda Litoral/);
  assert.match(parkingTodayLines("2026-11-28", "en").headline, /in the city centre and on the Avinguda Litoral stretch/);
  for (const locale of LOCALES) assert.doesNotMatch(parkingTodayLines("2026-11-28", locale).headline, /solo se paga en el centro|només es paga al centre|only in the city centre/i, locale);
  assert.equal(sat.free, false);
  const sun = parkingTodayLines("2026-11-29", "es");
  assert.match(sun.headline, /^Hoy, domingo, 29 de noviembre de 2026, no se paga ni la zona azul ni la verde de no residentes, salvo en la zona de playa/);
  assert.equal(sun.free, true);
  assert.match(sun.facts[0]!.value, /avenida Litoral entre Joan Miró y la Jonquera \(142 plazas\)/);
  assert.match(parkingTodayLines("2026-11-29", "ca").headline, /^Avui, diumenge, 29 de novembre de 2026, no es paga ni la zona blava ni la verda/);
  assert.match(parkingTodayLines("2026-11-29", "en").headline, /^Today, Sunday 29 November 2026, neither the blue zone nor the non-resident green zone is charged, except in the beach zone/);
});

test("a weekday public holiday: no verdict is invented, the sign decides; a holiday on a Saturday keeps the Saturday rule plus the same caveat", () => {
  assert.ok(holidayOn("2026-12-08"), "8 Dec 2026 is a Catalonia-wide holiday");
  for (const locale of LOCALES) {
    const lines = parkingTodayLines("2026-12-08", locale);
    assert.ok(lines.holiday, locale);
    assert.equal(lines.free, false);
    assert.doesNotMatch(lines.headline, /sí se paga|sí que es paga|you pay:|no se paga|no es paga|neither/i, `${locale}: no verdict on a weekday holiday`);
    assert.match(lines.headline, /AREA/, locale);
    assert.match(lines.facts[0]!.value, /AREA/, locale);
    assert.match(lines.facts[1]!.value, /AREA/, locale);
  }
  assert.match(parkingTodayLines("2026-12-08", "es").headline, /^Hoy, martes, 8 de diciembre de 2026 \(la Inmaculada\), es festivo entre semana y AREA no publica ninguna regla general/);
  assert.ok(holidayOn("2026-12-26") && parkingDayKind("2026-12-26") === "saturday");
  const sat = parkingTodayLines("2026-12-26", "es");
  assert.match(sat.headline, /la zona azul se paga en el centro de la ciudad y en el tramo de la avenida Litoral/);
  assert.match(sat.headline, /Es festivo, pero AREA no publica ninguna regla general/);
});

test("the beach-zone rule is the 2026 one until the re-read date, then a neutral line: no 2027 beach rule is stated", () => {
  assert.equal(parkingDayKind("2027-03-21"), "sunday");
  assert.equal(parkingDayKind("2027-03-28"), "sunday");
  assert.ok("2027-03-21" < PARKING_TODAY_REREAD_BY && "2027-03-28" >= PARKING_TODAY_REREAD_BY);
  assert.match(parkingTodayLines("2027-03-21", "es").facts[0]!.value, /desde el 1 de octubre de 2026 solo el tramo/);
  for (const locale of LOCALES) {
    const after = parkingTodayLines("2027-03-28", locale);
    const text = [after.headline, ...after.facts.map((f) => f.value)].join(" ");
    assert.doesNotMatch(text, /1 de octubre|1 d'octubre|1 October|Litoral|domingos y festivos|diumenges i festius|Sundays and public holidays/, `${locale}: no beach rule after the re-read date`);
    assert.match(after.facts[0]!.value, /2027/, locale);
  }
  const far = parkingTodayLines("2028-03-01", "en");
  assert.equal(far.holiday, null);
  assert.equal(far.kind, "weekday");
});

test("August: the note says AREA states no exception for non-residents, and no day invents one", () => {
  const note = { ca: /agost/, es: /agosto/, en: /August/ } as const;
  for (const locale of LOCALES) {
    for (const iso of ["2027-08-03", "2027-08-14", "2027-08-15"]) {
      const lines = parkingTodayLines(iso, locale);
      assert.match(lines.note, note[locale], `${locale} ${iso}`);
      assert.doesNotMatch([lines.headline, ...lines.facts.map((f) => f.value)].join(" "), /(gratis|gratu|free)[^.]*(agost|agosto|August)/i);
    }
  }
});

test("prices come from the page's own rate tables: 1.15-3.75 blue, 1.40-4.25 green, as in the lead", () => {
  assert.deepEqual(parkingPriceRanges(), { blue: [1.15, 3.75], green: [1.4, 4.25] });
  const lead = bodyToPlainText(PARKING.editions.es.blocks.slice(0, 1));
  assert.match(lead, /1,15 a 3,75 €/);
  assert.match(lead, /1,40 a 4,25 €/);
});

test("parkingToday is a configuration-free, day-dependent block, rendered on the server", () => {
  assert.ok(blockSchema.safeParse({ type: "parkingToday" }).success);
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("parkingToday"), "the nightly cron must rebuild the page");
  const renderer = readFileSync(join(import.meta.dirname, "../src/components/blocks/BlockRenderer.tsx"), "utf8");
  assert.match(renderer, /case "parkingToday":\s*\n\s*\/\/[^\n]*\n\s*return <ParkingToday locale=\{context\.locale\} \/>;/);
  const component = readFileSync(join(import.meta.dirname, "../src/components/blocks/ParkingToday.tsx"), "utf8");
  assert.doesNotMatch(component, /"use client"/, "the answer has to be in the HTML");
});

test("guide: the lead, then the today H2 and block, then the zone table; title, description and lead untouched; days table has holiday and August rows", () => {
  const h2 = {
    ca: "Es paga avui la zona blava i la zona verda a Barcelona?",
    es: "¿Se paga hoy la zona azul y la zona verde en Barcelona?",
    en: "Do you have to pay for blue and green zone parking in Barcelona today?",
  } as const;
  for (const locale of LOCALES) {
    const blocks = PARKING.editions[locale].blocks;
    assert.equal(blocks[0]!.type, "paragraph", `${locale}: the lead is first`);
    assert.equal((blocks[1] as { text?: string }).text, h2[locale], `${locale}: H2 in the searchers' words`);
    assert.equal(blocks[2]!.type, "parkingToday", locale);
    assert.equal(blocks.filter((b) => b.type === "parkingToday").length, 1, locale);
    const firstTable = blocks.findIndex((b) => b.type === "table");
    assert.ok(firstTable > 2, `${locale}: the answer comes before the tables`);
    assert.ok(JSON.stringify(blocks.slice(0, 5)).includes("/zona-azul/") || JSON.stringify(blocks.slice(0, 5)).includes("zona-blava") || JSON.stringify(blocks.slice(0, 5)).includes("blue-zone"), `${locale}: hub link under the block`);
    const days = blocks.filter((b) => b.type === "table")[1] as { rows: string[][] };
    assert.equal(days.rows.length, 5, `${locale}: weekdays, Saturday, Sunday, weekday holiday, August`);
    assert.match(days.rows[3]![0]!, /Festiu|Festivo|holiday/, locale);
    assert.match(days.rows[4]![0]!, /Agost|Agosto|August/, locale);
    // Only the Av. Litoral stretch is charged on holidays and Sundays since 1 Oct 2026 (AREA news 14.9.2026); Icària and Espriu are Mon-Fri.
    for (const row of [days.rows[1]!, days.rows[2]!, days.rows[3]!]) assert.match(row[1]!, /Litoral/, `${locale}: ${row[0]}`);
    assert.doesNotMatch(days.rows[3]![1]!, /beach zone|zona de playa|zona de platja/i, `${locale}: holiday row is not "the beach zone"`);
  }
  // The windows: nothing of title, description or lead moved (ES 3 Nov, CA 6 Nov, EN 30 Oct).
  assert.equal(PARKING.editions.es.seoTitle, "Horario zona azul y verde Barcelona: cuándo se paga y precio");
  assert.equal(PARKING.editions.ca.seoTitle, "Zona blava i verda Barcelona 2026: horari, dissabte i preu");
  assert.equal(PARKING.editions.en.seoTitle, "Barcelona blue and green zone parking: hours, prices, rules");
});
