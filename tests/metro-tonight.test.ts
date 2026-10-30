import assert from "node:assert/strict";
import { test } from "node:test";

import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { metroDay, metroLines } from "../src/lib/content/metro/tonight.ts";

// Barcelona's two local days in 2026 (Generalitat open data b4eh-r8up).
const BCN_2026 = ["2026-05-25", "2026-09-24"];

test("weekday rules follow TMB: midnight, Friday 2:00, Saturday all night, Sunday continues", () => {
  assert.deepEqual(metroDay("2026-10-22"), { date: "2026-10-22", opensAtFive: true, close: "midnight" }); // Thursday
  assert.equal(metroDay("2026-10-23").close, "two"); // Friday
  assert.equal(metroDay("2026-10-24").close, "allNight"); // Saturday
  const sunday = metroDay("2026-10-25");
  assert.equal(sunday.opensAtFive, false);
  assert.equal(sunday.close, "midnight");
  assert.equal(metroDay("2026-10-26").opensAtFive, true);
});

test("the night before a public holiday closes at 2:00, the holiday itself at midnight", () => {
  // Tuesday 8 Dec 2026 is the Immaculate Conception; Monday 7 Dec is its eve.
  assert.equal(metroDay("2026-12-07").close, "two");
  assert.equal(metroDay("2026-12-08").close, "midnight");
  // Sunday 24 May 2026 is the eve of Barcelona's local Whit Monday.
  assert.equal(metroDay("2026-05-24", BCN_2026).close, "two");
  assert.equal(metroDay("2026-05-24").close, "midnight");
});

test("special nights: all night on 23 Jun, 23 Sep and 31 Dec; 23:00 on 24 Dec", () => {
  assert.equal(metroDay("2026-06-23").close, "allNight");
  assert.equal(metroDay("2026-09-23", BCN_2026).close, "allNight");
  assert.equal(metroDay("2026-12-31").close, "allNight");
  assert.equal(metroDay("2027-01-01").opensAtFive, false);
  assert.equal(metroDay("2026-12-24").close, "eleven");
});

test("the printed lines name the day and the hour in each language", () => {
  const ca = metroLines("2026-10-23", "ca");
  assert.match(ca.today, /^Avui, divendres, 23 d'octubre de 2026, el metro obre a les 5:00 i tanca a les 2:00/);
  assert.match(ca.tomorrow, /^Demà, dissabte, .*no tanca en tota la nit\.$/);
  assert.match(metroLines("2026-10-25", "es").today, /sin parar desde la noche anterior y cierra a medianoche/);
  assert.match(metroLines("2026-10-22", "en").today, /^Today, Thursday 22 October 2026, the metro opens at 5:00 and closes at midnight\.$/);
});

/**
 * Metro guide, 28 Oct 2026 (TMB hours page and tram.cat): the metro does not
 * "open at 5:00 every day" - on Sunday it has been running since Saturday
 * night - and the guide answers the tram and Montjuïc funicular timetables
 * with their validity dates.
 */
test("the metro guide never says it opens at 5:00 every day, and gives tram and funicular hours", async () => {
  const { bodyToPlainText } = await import("../src/lib/content/blocks.ts");
  const everyDay = { ca: /5:00\*{0,2} cada dia|5:00 cada dia/, es: /5:00\*{0,2} todos los días/, en: /5:00\*{0,2} every day/ };
  const funicular = { ca: /26 d'octubre de 2026 al 28 de març de 2027/, es: /26 de octubre de 2026 al 28 de marzo de 2027/, en: /26 October 2026 to 28 March 2027/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = HOURS.editions[locale].blocks as { type: string; rows?: string[][] }[];
    const text = bodyToPlainText(HOURS.editions[locale].blocks);
    assert.doesNotMatch(text, everyDay[locale], `${locale}: "opens at 5:00 every day"`);
    assert.match(text, funicular[locale], `${locale}: funicular winter dates`);
    assert.match(text, /22:30/, `${locale}: tram on 24 December`);
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 2, `${locale}: metro + tram tables`);
    // Six day types, plus TMB's seven outer L9 Sud / L10 Sud stations (5:00-24:00 every day, re-read 30 Oct 2026).
    assert.equal(tables[0]?.rows?.length, 7, `${locale}: six day types and the outer stations`);
    assert.match(tables[0]?.rows?.[6]?.[0] ?? "", /Mas Blau.*La Factoria/, `${locale}: outer stations row`);
    assert.match(tables[0]?.rows?.[6]?.[2] ?? "", /24 (December|de diciembre|de desembre)/, `${locale}: 23:00 on 24 December`);
    assert.equal(tables[1]?.rows?.length, 4, `${locale}: four tram rows`);
    assert.doesNotMatch(text, /Aerob[uú]s[^.]*24 (hores|horas|hours)/, `${locale}: the airport bus is not said to run 24 hours`);
  }
});

test("the metro guide carries the block right after its lead, and the cron refreshes it", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("metroTonight"));
  for (const locale of ["ca", "es", "en"] as const) {
    const body = HOURS.editions[locale].blocks;
    assert.equal(body[1]?.type, "metroTonight", locale);
  }
});

/**
 * Top-3 push, 30 Oct 2026: the EN snippet answers the three closing times
 * (Saturday all night was missing from the title), the first line of every
 * edition names the last metro, and the "last metro" question has its own H2.
 */
test("metro hours: the EN snippet and every lead give the last-metro answer first", async () => {
  const { bodyToPlainText } = await import("../src/lib/content/blocks.ts");
  const en = HOURS.editions.en;
  assert.ok(en.seoTitle.length <= 60, en.seoTitle);
  assert.ok(en.seoDescription.length <= 155, String(en.seoDescription.length));
  assert.match(en.seoTitle, /all night Sat/);
  assert.match(en.seoDescription, /midnight.*2:00.*Saturdays it runs all night/);
  assert.match(bodyToPlainText(en.blocks).slice(0, 120), /last Barcelona metro leaves at midnight/);
  const lastTrain = { ca: "A quina hora passa l'últim metro?", es: "¿A qué hora pasa el último metro?", en: "What time is the last metro in Barcelona?" };
  for (const locale of ["ca", "es", "en"] as const) {
    const headings = (HOURS.editions[locale].blocks as { type: string; text?: string }[]).filter((b) => b.type === "heading").map((b) => b.text);
    assert.ok(headings.includes(lastTrain[locale]), `${locale}: last-metro H2`);
    assert.doesNotMatch(bodyToPlainText(HOURS.editions[locale].blocks), /every 20 minutes on every line|cada 20 minutos en todas las líneas|cada 20 minuts a totes les línies/, `${locale}: NitBus frequency is not claimed for every line`);
  }
  assert.equal(HOURS.verifiedAt, "2026-10-30");
});
