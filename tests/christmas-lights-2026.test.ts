import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { CHRISTMAS_LIGHTS, LIGHTS_PAST_FROM, lightsDescription, lightsEdition, lightsPast, lightsSources, barcelonaLead, isHeld, of } from "../src/lib/content/batch02/christmas-lights.ts";
import { LIGHTS_TOWNS, LIGHTS_TOWNS_AS_OF, LIGHTS_TOWNS_NOT_REREAD, announcedTowns, switchOnProblems } from "../src/lib/content/batch02/christmas-lights-towns.ts";
import { B2_TITLES } from "../src/lib/content/batch02/shared.ts";
import { ANNOUNCED_2026, LIGHTS_SWITCH_ON_CHECKED, MOBILITY_2025, MOBILITY_2026, announcementProblems, dayDate, placePhrase } from "../src/lib/content/batch02/festive.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/**
 * 12 Nov 2026: Barcelona's switch-on (City Council note of 9 Nov 2026) and four
 * towns' 2026 dates (Badalona, Igualada, Rubí, Terrassa), read on the
 * councils' own pages. These tests pin what those pages say.
 */

const LOCALES: Locale[] = ["ca", "es", "en"];
/** The day itself, 18:30 Madrid: the page still reads in the future tense. */
const PRE = new Date("2026-11-26T18:30:00+01:00");
const text = (blocks: Block[]) => bodyToPlainText(blocks);

test("Barcelona 2026: Thursday 26 November, show 18:00, lights 18:30, Passeig de Gràcia, until 6 January, from the 9 Nov note", () => {
  const a = ANNOUNCED_2026.lightsSwitchOn;
  assert.ok(a, "the switch-on is announced");
  assert.deepEqual(announcementProblems(a), []);
  assert.equal(a.date, "2026-11-26");
  assert.equal(a.time, "18:00");
  assert.equal(a.lightsOn, "18:30");
  assert.equal(a.until, "2027-01-06");
  assert.equal(a.km, 140);
  assert.equal(a.who, undefined, "the note names nobody");
  assert.match(a.url, /^https:\/\/ajuntament\.barcelona\.cat\/premsa\/2026\/11\/09\//);
  // 27 Nov 2026: the City Council's note of 26 Nov (the switch-on took place) was read the next day.
  assert.equal(LIGHTS_SWITCH_ON_CHECKED, "2026-11-27");
  assert.equal(dayDate(a.date, "ca"), "dijous 26 de novembre de 2026");
  for (const locale of LOCALES) {
    assert.match(placePhrase(a, locale), /^(al passeig|en el paseo|on Passeig) de Gràcia/, locale);
    assert.match(a.hours![locale], /17:30/, locale);
  }
});

test("the validator refuses a lights-on time before the show and a bad length", () => {
  const base = { date: "2026-11-26", time: "18:00", url: "https://ajuntament.barcelona.cat/premsa/x/" };
  assert.deepEqual(announcementProblems({ ...base, lightsOn: "18:30", km: 140 }), []);
  assert.ok(announcementProblems({ ...base, lightsOn: "17:30" }).length > 0, "lights before the show");
  assert.ok(announcementProblems({ ...base, lightsOn: "6.30" }).length > 0, "not HH:MM");
  assert.ok(announcementProblems({ ...base, km: 0 }).length > 0, "no length");
});

test("the lights page and the Christmas hub give the date in title, snippet and first paragraph, in every language", () => {
  const a = ANNOUNCED_2026.lightsSwitchOn!;
  const day: Record<Locale, string> = { ca: "26 de novembre", es: "26 de noviembre", en: "26 November" };
  for (const article of [CHRISTMAS_LIGHTS, CHRISTMAS_BARCELONA]) {
    for (const locale of LOCALES) {
      const e = article.editions[locale];
      assert.ok(e.seoTitle.includes(day[locale]), `${article.key}/${locale}: ${e.seoTitle}`);
      assert.doesNotMatch(e.seoTitle, /per confirmar|por confirmar|TBC/, `${article.key}/${locale}`);
      assert.ok(e.seoDescription.includes(dayDate(a.date, locale)) && e.seoDescription.includes(a.lightsOn!), `${article.key}/${locale}: ${e.seoDescription}`);
      const first = text(e.blocks.slice(0, 1) as Block[]);
      assert.ok(first.includes(dayDate(a.date, locale)), `${article.key}/${locale}: ${first}`);
      // Nothing says the date is still pending.
      assert.doesNotMatch(first, /encara no ha anunciat|aún no ha anunciado|has not announced/, `${article.key}/${locale}`);
    }
  }
  // Catalan contracts "a + el passeig": never "a passeig" / "a el passeig".
  for (const article of [CHRISTMAS_LIGHTS, CHRISTMAS_BARCELONA]) assert.doesNotMatch(text(article.editions.ca.blocks as Block[]), /\ba (el )?passeig de Gràcia, entre el carrer de Rosselló/);
});

test("twenty-three of the 27 towns published their 2026 switch-on on their own sites (read 12, 20, 25 and 27 Nov 2026)", () => {
  const dated = Object.fromEntries(LIGHTS_TOWNS.filter((t) => t.y2026).map((t) => [t.key, `${t.y2026!.date} ${t.y2026!.time ?? "-"} ${t.y2026!.place ?? "-"}`]));
  assert.deepEqual(dated, {
    terrassa: "2026-11-28 18:00 Raval de Montserrat",
    badalona: "2026-11-20 18:00 -",
    // Rubí: the programme note of 18 Nov gave the time and the place (the 20 Oct note had only the day).
    rubi: "2026-11-27 18:00 plaça de Pere Aguilera",
    igualada: "2026-11-27 - plaça de l'Ajuntament",
    // 20 Nov 2026 (each council's own page or document, the sentence grepped).
    girona: "2026-11-27 - plaça de Catalunya",
    olot: "2026-11-28 18:30 plaça Major",
    granollers: "2026-11-27 18:30 plaça de la Porxada",
    hospitalet: "2026-11-26 18:00 plaça de l'Ajuntament",
    "el-prat": "2026-11-21 18:30 plaça de Catalunya",
    mataro: "2026-11-27 18:30 Espai Firal del Nou Parc Central",
    manresa: "2026-11-27 17:30 Plaça de Nadal",
    castelldefels: "2026-11-21 18:00 plaça de l'Església",
    // 25 Nov 2026: six more councils, and two towns of the 30 largest that were not in the table.
    figueres: "2026-11-27 17:45 la Rambla",
    vic: "2026-11-27 18:00 plaça Major",
    "sant-cugat": "2026-11-27 18:30 plaça d'Octavià",
    sabadell: "2026-11-27 18:00 passeig de la Plaça Major",
    reus: "2026-11-26 - -",
    tortosa: "2026-12-04 17:30 plaça de l'Ajuntament",
    "sant-boi": "2026-11-20 18:00 plaça de l'Ajuntament",
    cerdanyola: "2026-11-27 17:30 plaça de Francesc Layret, plaça d'Abat Oliba",
    // 27 Nov 2026: three more councils (note of 25 Nov, note of 26 Nov, municipal agenda).
    tarragona: "2026-12-03 18:30 plaça de la Font",
    lleida: "2026-11-27 18:30 plaça de la Paeria",
    sitges: "2026-11-27 17:30 Cap de la Vila",
  });
  assert.equal(LIGHTS_TOWNS.length, 27);
  for (const t of LIGHTS_TOWNS) assert.deepEqual(switchOnProblems(t, 2026), [], t.key);
  assert.equal(LIGHTS_TOWNS_AS_OF, "2026-11-27");
  // The ones with no 2026 switch-on on their news pages or agendas on 27 Nov.
  for (const key of ["blanes", "cornella", "vilanova", "santa-coloma"]) assert.equal(LIGHTS_TOWNS.find((t) => t.key === key)?.y2026, null, key);
  // Only Santa Coloma's site (403) could not be read: it keeps its last reading, printed under the table.
  assert.deepEqual(LIGHTS_TOWNS_NOT_REREAD.map((u) => `${u.key} ${u.read}`), ["santa-coloma 2026-11-04"]);
  for (const u of LIGHTS_TOWNS_NOT_REREAD) assert.equal(LIGHTS_TOWNS.find((t) => t.key === u.key)?.y2026, null, u.key);
  const note: Record<Locale, RegExp> = {
    ca: /Santa Coloma de Gramenet \(4 de novembre\)/,
    es: /Santa Coloma de Gramenet \(4 de noviembre\)/,
    en: /Santa Coloma de Gramenet \(4 November\)/,
  };
  for (const locale of LOCALES) assert.match(JSON.stringify(lightsEdition(locale, PRE).blocks), note[locale], locale);
});

test("Sant Boi and Cerdanyola (two of the 30 largest towns) are in the table with their council's date, time and place; the count follows the data", () => {
  const santBoi = LIGHTS_TOWNS.find((t) => t.key === "sant-boi")!;
  assert.equal(santBoi.y2025?.date, "2025-11-28");
  assert.equal(santBoi.y2025?.time, "18:00");
  assert.match(santBoi.y2026!.url, /^https:\/\/www\.santboi\.cat\/agenda\//);
  const cerdanyola = LIGHTS_TOWNS.find((t) => t.key === "cerdanyola")!;
  assert.equal(cerdanyola.y2025, null, "no 2025 page was read: the row says so");
  assert.match(cerdanyola.y2026!.url, /^https:\/\/www\.cerdanyola\.cat\/actualitat\//);
  // 25 Nov: Gavà (home page: 27 Nov, nothing else), Viladecans (403), Sant Feliu (no answer), Esplugues and Mollet (no 2026 page) have no council page with date, time and place.
  for (const name of ["Gavà", "Viladecans", "Sant Feliu de Llobregat", "Esplugues de Llobregat", "Mollet del Vallès"]) assert.ok(!LIGHTS_TOWNS.some((t) => t.name === name), name);
  for (const locale of LOCALES) assert.match(B2_TITLES.christmasLights[locale], new RegExp(`\\b${LIGHTS_TOWNS.length}\\b`), `${locale}: the rail title counts the towns`);
  for (const locale of LOCALES) assert.match(lightsEdition(locale, PRE).excerpt, new RegExp(`\\b${LIGHTS_TOWNS.length}\\b`), `${locale}: the excerpt counts the towns`);
});

test("the lead gives the count and the span of dates, not twenty-three names; the table keeps every town", () => {
  const dated = announcedTowns();
  const first = dated[0]!;
  const last = dated[dated.length - 1]!;
  assert.equal(first.key, "badalona");
  assert.equal(last.key, "tortosa");
  const lead: Record<Locale, RegExp> = {
    ca: /23 dels 27 municipis d'aquesta guia ja han publicat la data del 2026: de Badalona \(20 de novembre\) a Tortosa \(4 de desembre\)/,
    es: /23 de los 27 municipios de esta guía ya han publicado la fecha de 2026: de Badalona \(20 de noviembre\) a Tortosa \(4 de diciembre\)/,
    en: /23 of the 27 towns in this guide have already published their 2026 date: from Badalona \(20 November\) to Tortosa \(4 December\)/,
  };
  for (const locale of LOCALES) {
    const blocks = lightsEdition(locale, PRE).blocks as Block[];
    assert.match((blocks[0] as { text: string }).text, lead[locale], locale);
    assert.ok((blocks[0] as { text: string }).text.length < 1100, `${locale}: the lead stays short`);
    const table = blocks.filter((b) => b.type === "table").pop() as unknown as { rows: string[][] };
    assert.equal(table.rows.length, LIGHTS_TOWNS.length + 1, locale);
  }
});

test("FAQ: the towns people search have their own question; a day before the reading date is told in the past tense", () => {
  const past: Record<Locale, RegExp> = { ca: /va encendre els llums de Nadal el/, es: /encendió las luces de Navidad el/, en: /switched the Christmas lights on on/ };
  const future: Record<Locale, RegExp> = { ca: /l'ha anunciada per al/, es: /lo ha anunciado para el/, en: /has announced it for/ };
  const asked: Record<Locale, RegExp[]> = {
    ca: [/de l'Hospitalet 2026\?$/, /de Terrassa 2026\?$/, /del Prat 2026\?$/, /de Cornellà de Llobregat 2026\?$/, /de Santa Coloma 2026\?$/, /de Manresa 2026\?$/],
    es: [/de L'Hospitalet 2026\?$/, /de Terrassa 2026\?$/, /del Prat 2026\?$/, /de Cornellà de Llobregat 2026\?$/, /de Santa Coloma 2026\?$/, /de Manresa 2026\?$/],
    en: [/in L'Hospitalet in 2026\?$/, /in Terrassa in 2026\?$/, /in El Prat in 2026\?$/, /in Cornellà de Llobregat in 2026\?$/, /in Santa Coloma in 2026\?$/, /in Manresa in 2026\?$/],
  };
  for (const locale of LOCALES) {
    const faq = (lightsEdition(locale, PRE).blocks as Block[]).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    for (const pattern of asked[locale]) assert.ok(faq.items.some((i) => pattern.test(i.question)), `${locale}: ${pattern}`);
    // El Prat switched on on 21 Nov and L'Hospitalet on the 26th, both before the reading date of 27 Nov; Terrassa is on the 28th.
    for (const town of [/Prat/, /Hospitalet/]) {
      const item = faq.items.find((i) => town.test(i.question))!;
      assert.match(item.answer, past[locale], `${locale}: ${town}`);
      assert.doesNotMatch(item.answer, future[locale], `${locale}: ${town}`);
    }
    const terrassa = faq.items.find((i) => /Terrassa/.test(i.question))!;
    assert.match(terrassa.answer, future[locale], locale);
    assert.doesNotMatch(terrassa.answer, past[locale], locale);
  }
  assert.equal(of("L'Hospitalet", "ca"), "de l'Hospitalet");
  assert.equal(of("El Prat", "ca"), "del Prat");
  assert.equal(of("El Prat", "es"), "del Prat");
  assert.equal(of("Olot", "ca"), "d'Olot");
  assert.equal(of("Girona", "ca"), "de Girona");
  assert.equal(of("Girona", "en"), "Girona");
  assert.equal(isHeld({ date: "2026-11-24" }, PRE), true);
  // 27 Nov 2026: a day before LIGHTS_TOWNS_AS_OF is past whatever the clock; the reading day itself is not.
  assert.equal(isHeld({ date: "2026-11-26" }, PRE), true, "before the reading date");
  assert.equal(isHeld({ date: LIGHTS_TOWNS_AS_OF }, PRE), false, "the reading day itself is not yet past");
});

/**
 * The phase switch (LIGHTS_PAST_FROM, 00:00 Madrid on 27 Nov): everything below is date-driven, so none of it needs a
 * flip on 27 Nov; the page just has to be published (`publish.sh llums-nadal`) on or after that instant.
 */
const BEFORE_EVE = new Date("2026-11-26T23:59:59+01:00");
const POST = new Date("2026-11-27T00:00:00+01:00");
const LATER = new Date("2026-11-28T10:00:00+01:00");

test("phase switch: 26 Nov 18:00 and 23:59:59 are still the future tense; 27 Nov 00:00 and 28 Nov are past", () => {
  assert.equal(LIGHTS_PAST_FROM, "2026-11-27T00:00:00+01:00");
  assert.equal(lightsPast(PRE), false);
  assert.equal(lightsPast(BEFORE_EVE), false);
  assert.equal(lightsPast(POST), true);
  assert.equal(lightsPast(LATER), true);
  // The default (real clock) agrees with whichever side today is on.
  assert.equal(lightsPast(), Date.now() >= Date.parse(LIGHTS_PAST_FROM));
});

test("before the switch: lead and snippet in the future tense, the mobility paragraph and its source in", () => {
  const lead: Record<Locale, RegExp> = {
    ca: /^\*\*Barcelona encén els llums de Nadal el dijous 26 de novembre de 2026/,
    es: /^\*\*Barcelona enciende las luces de Navidad el jueves 26 de noviembre de 2026/,
    en: /^\*\*Barcelona switches on its Christmas lights on Thursday 26 November 2026/,
  };
  for (const locale of LOCALES) {
    assert.match(barcelonaLead(locale, ANNOUNCED_2026, BEFORE_EVE), lead[locale], locale);
    assert.ok(JSON.stringify(lightsEdition(locale, BEFORE_EVE).blocks).includes(MOBILITY_2026.url), `${locale}: mobility paragraph`);
    assert.match(lightsDescription(locale, ANNOUNCED_2026, LIGHTS_TOWNS, BEFORE_EVE), /^Barcelona (encén|enciende|switches on)/, locale);
  }
  assert.ok(lightsSources(ANNOUNCED_2026, LIGHTS_TOWNS, BEFORE_EVE).some((s) => s.url === MOBILITY_2026.url));
});

test("after the switch: Barcelona's lead, snippet, switch-on section and FAQ are in the past tense; the mobility paragraph and its source are gone", () => {
  const lead: Record<Locale, RegExp> = {
    ca: /^\*\*Els llums de Nadal de Barcelona es van encendre el dijous 26 de novembre de 2026, al passeig de Gràcia/,
    es: /^\*\*Las luces de Navidad de Barcelona se encendieron el jueves 26 de noviembre de 2026, en el paseo de Gràcia/,
    en: /^\*\*Barcelona's Christmas lights were switched on Thursday 26 November 2026, on Passeig de Gràcia/,
  };
  const futureWords: Record<Locale, RegExp> = {
    ca: /\bencén\b|\bs'encén|és l'encesa|\bcomença\b|\bse celebrarà/,
    es: /\benciende\b|\bse encienden\b|\bempieza\b/,
    en: /\bswitches on\b|\bwill be\b|\bcome on at\b|\bstarts at\b/,
  };
  const pastQ: Record<Locale, RegExp> = {
    ca: /^Quan va ser l'encesa de llums de Nadal de Barcelona 2026\?/,
    es: /^¿Cuándo fue el encendido de luces de Navidad de Barcelona 2026\?/,
    en: /^When were Barcelona's Christmas lights switched on in 2026\?/,
  };
  const wentOn: Record<Locale, RegExp> = { ca: /va encendre els llums de Nadal el/, es: /encendió las luces de Navidad el/, en: /switched the Christmas lights on on/ };
  for (const now of [POST, LATER]) {
    for (const locale of LOCALES) {
      const e = lightsEdition(locale, now);
      assert.match((e.blocks[0] as { text: string }).text, lead[locale], locale);
      assert.match(lightsDescription(locale, ANNOUNCED_2026, LIGHTS_TOWNS, now), /^Barcelona (va encendre|encendió|switched on)/, locale);
      const json = JSON.stringify(e.blocks);
      assert.ok(!json.includes(MOBILITY_2026.url), `${locale}: no mobility paragraph`);
      assert.ok(json.includes(MOBILITY_2025.url), `${locale}: the 2025 closure stays as history`);
      assert.ok(!lightsSources(ANNOUNCED_2026, LIGHTS_TOWNS, now).some((s) => s.url === MOBILITY_2026.url));
      const faq = (e.blocks as Block[]).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
      assert.ok(faq.items.some((i) => pastQ[locale].test(i.question)), `${locale}: past question`);
      for (const item of faq.items.slice(0, 4)) assert.doesNotMatch(item.answer, futureWords[locale], `${locale}: ${item.question}`);
      const hospitalet = faq.items.find((i) => /Hospitalet/.test(i.question))!;
      assert.match(hospitalet.answer, wentOn[locale], `${locale}: L'Hospitalet went on 26 Nov`);
      assert.match(hospitalet.question, /^(Quan va ser|¿Cuándo fue|When was)/, locale);
    }
  }
});

test("towns: a 26 Nov row (L'Hospitalet, Reus) is past on 27 Nov; a 27 Nov row only from 28 Nov", () => {
  assert.equal(isHeld({ date: "2026-11-26" }, POST), true);
  assert.equal(isHeld({ date: "2026-11-27" }, POST), false);
  assert.equal(isHeld({ date: "2026-11-27" }, LATER), true);
});

/**
 * Date guard (kept on purpose): the page turns past by itself at 00:00 on 27 Nov, but the councils and the City
 * Council's own wrap-up note must be read again after the day, so "went on" is a fact and not an assumption (a
 * postponed switch-on would be wrong). It fails on 27 Nov (L'Hospitalet and Reus, 26 Nov; Barcelona, 26 Nov) until
 * LIGHTS_TOWNS_AS_OF and LIGHTS_SWITCH_ON_CHECKED are moved to the day of that re-read.
 */
test("date guard: a switch-on day has passed, so the councils must have been read after it", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const stale = LIGHTS_TOWNS.filter((t) => t.y2026 && t.y2026.date < today && t.y2026.date >= LIGHTS_TOWNS_AS_OF).map((t) => `${t.name} ${t.y2026!.date}`);
  assert.deepEqual(stale, [], `re-read the councils (${stale.join(", ")}), move LIGHTS_TOWNS_AS_OF (${LIGHTS_TOWNS_AS_OF}) to the day of the re-read, publish llums-nadal`);
  const a = ANNOUNCED_2026.lightsSwitchOn!;
  assert.ok(!(a.date < today && LIGHTS_SWITCH_ON_CHECKED <= a.date), `${a.date} has passed: re-read the City Council's note of the day and move LIGHTS_SWITCH_ON_CHECKED past it, then publish llums-nadal (the past-tense text is already in place)`);
});

/** The 2026 mobility paragraph is date-driven: present until LIGHTS_PAST_FROM, never published after it (festive.ts keeps the constant). */
test("the 2026 mobility paragraph goes with the phase switch, whatever today is", () => {
  const live = JSON.stringify(CHRISTMAS_LIGHTS.editions.ca.blocks).includes(MOBILITY_2026.url);
  assert.equal(live, !lightsPast());
});
