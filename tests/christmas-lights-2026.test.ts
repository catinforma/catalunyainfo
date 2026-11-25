import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { CHRISTMAS_LIGHTS, isHeld, of } from "../src/lib/content/batch02/christmas-lights.ts";
import { LIGHTS_TOWNS, LIGHTS_TOWNS_AS_OF, LIGHTS_TOWNS_NOT_REREAD, announcedTowns, switchOnProblems } from "../src/lib/content/batch02/christmas-lights-towns.ts";
import { B2_TITLES } from "../src/lib/content/batch02/shared.ts";
import { ANNOUNCED_2026, LIGHTS_SWITCH_ON_CHECKED, MOBILITY_2026, announcementProblems, dayDate, placePhrase } from "../src/lib/content/batch02/festive.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/**
 * 12 Nov 2026: Barcelona's switch-on (City Council note of 9 Nov 2026) and four
 * towns' 2026 dates (Badalona, Igualada, Rubí, Terrassa), read on the
 * councils' own pages. These tests pin what those pages say.
 */

const LOCALES: Locale[] = ["ca", "es", "en"];
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
  assert.equal(LIGHTS_SWITCH_ON_CHECKED, "2026-11-25");
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

test("twenty of the 27 towns published their 2026 switch-on on their own sites (read 12, 20 and 25 Nov 2026)", () => {
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
  });
  assert.equal(LIGHTS_TOWNS.length, 27);
  for (const t of LIGHTS_TOWNS) assert.deepEqual(switchOnProblems(t, 2026), [], t.key);
  assert.equal(LIGHTS_TOWNS_AS_OF, "2026-11-25");
  // The ones with no 2026 switch-on on their news pages or agendas on 25 Nov.
  for (const key of ["blanes", "tarragona", "lleida", "sitges", "cornella", "vilanova", "santa-coloma"]) assert.equal(LIGHTS_TOWNS.find((t) => t.key === key)?.y2026, null, key);
  // Only Santa Coloma's site (403) could not be read: it keeps its last reading, printed under the table.
  assert.deepEqual(LIGHTS_TOWNS_NOT_REREAD.map((u) => `${u.key} ${u.read}`), ["santa-coloma 2026-11-04"]);
  for (const u of LIGHTS_TOWNS_NOT_REREAD) assert.equal(LIGHTS_TOWNS.find((t) => t.key === u.key)?.y2026, null, u.key);
  const note: Record<Locale, RegExp> = {
    ca: /Santa Coloma de Gramenet \(4 de novembre\)/,
    es: /Santa Coloma de Gramenet \(4 de noviembre\)/,
    en: /Santa Coloma de Gramenet \(4 November\)/,
  };
  for (const locale of LOCALES) assert.match(JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks), note[locale], locale);
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
  for (const locale of LOCALES) assert.match(CHRISTMAS_LIGHTS.editions[locale].excerpt, new RegExp(`\\b${LIGHTS_TOWNS.length}\\b`), `${locale}: the excerpt counts the towns`);
});

test("the lead gives the count and the span of dates, not twenty names; the table keeps every town", () => {
  const dated = announcedTowns();
  const first = dated[0]!;
  const last = dated[dated.length - 1]!;
  assert.equal(first.key, "badalona");
  assert.equal(last.key, "tortosa");
  const lead: Record<Locale, RegExp> = {
    ca: /20 dels 27 municipis d'aquesta guia ja han publicat la data del 2026: de Badalona \(20 de novembre\) a Tortosa \(4 de desembre\)/,
    es: /20 de los 27 municipios de esta guía ya han publicado la fecha de 2026: de Badalona \(20 de noviembre\) a Tortosa \(4 de diciembre\)/,
    en: /20 of the 27 towns in this guide have already published their 2026 date: from Badalona \(20 November\) to Tortosa \(4 December\)/,
  };
  for (const locale of LOCALES) {
    const blocks = CHRISTMAS_LIGHTS.editions[locale].blocks as Block[];
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
    const faq = (CHRISTMAS_LIGHTS.editions[locale].blocks as Block[]).find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    for (const pattern of asked[locale]) assert.ok(faq.items.some((i) => pattern.test(i.question)), `${locale}: ${pattern}`);
    // El Prat switched on on 21 Nov, before the reading date of 25 Nov; L'Hospitalet is on the 26th.
    const prat = faq.items.find((i) => /Prat/.test(i.question))!;
    assert.match(prat.answer, past[locale], locale);
    assert.doesNotMatch(prat.answer, future[locale], locale);
    const hospitalet = faq.items.find((i) => /Hospitalet/.test(i.question))!;
    assert.match(hospitalet.answer, future[locale], locale);
    assert.doesNotMatch(hospitalet.answer, past[locale], locale);
  }
  assert.equal(of("L'Hospitalet", "ca"), "de l'Hospitalet");
  assert.equal(of("El Prat", "ca"), "del Prat");
  assert.equal(of("El Prat", "es"), "del Prat");
  assert.equal(of("Olot", "ca"), "d'Olot");
  assert.equal(of("Girona", "ca"), "de Girona");
  assert.equal(of("Girona", "en"), "Girona");
  assert.equal(isHeld({ date: "2026-11-24" }), true);
  assert.equal(isHeld({ date: LIGHTS_TOWNS_AS_OF }), false, "the day of the reading is not yet past");
});

/**
 * Date guard (25 Nov 2026): the day after a town's switch-on the page must read in the past tense. The FAQ turns past
 * on its own once LIGHTS_TOWNS_AS_OF is after the date (`isHeld`), so the guard is: no 2026 date may be before today
 * unless the towns were read after it. It fails on 27 Nov (L'Hospitalet and Reus, 26 Nov) until the councils are read
 * again, LIGHTS_TOWNS_AS_OF moves, the page is deployed and `llums-nadal` is published.
 */
test("date guard: a town's switch-on day has passed, so the councils must have been read after it (the page then reads in the past tense)", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const stale = LIGHTS_TOWNS.filter((t) => t.y2026 && t.y2026.date < today && t.y2026.date >= LIGHTS_TOWNS_AS_OF).map((t) => `${t.name} ${t.y2026!.date}`);
  assert.deepEqual(stale, [], `re-read the councils, move LIGHTS_TOWNS_AS_OF (${LIGHTS_TOWNS_AS_OF}) past these days, deploy and publish llums-nadal so the FAQ and the table read in the past tense: ${stale.join(", ")}`);
  // Barcelona's own day (26 Nov): after it the lead, description and key facts (festive.ts) must be rewritten in the past tense and the check date moved past it.
  const a = ANNOUNCED_2026.lightsSwitchOn!;
  assert.ok(!(a.date < today && LIGHTS_SWITCH_ON_CHECKED <= a.date), `${a.date} has passed: rewrite Barcelona's lead, snippet and key facts in the past tense (christmas-lights.ts), move LIGHTS_SWITCH_ON_CHECKED, deploy, publish llums-nadal`);
});

/** Date guard: the 2026 mobility paragraph speaks of the days before and on 26 Nov; after the switch-on it must go or turn past. */
test("date guard: Barcelona's 2026 mobility paragraph is removed or rewritten after the switch-on", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today <= "2026-11-26", "26 Nov is past: drop MOBILITY_2026 from showParagraphs (christmas-lights.ts) or rewrite it in the past tense, deploy, publish llums-nadal");
  for (const locale of LOCALES) assert.ok(JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks).includes(MOBILITY_2026.url), locale);
});
