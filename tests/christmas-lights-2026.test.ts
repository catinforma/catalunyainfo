import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { CHRISTMAS_LIGHTS } from "../src/lib/content/batch02/christmas-lights.ts";
import { LIGHTS_TOWNS, LIGHTS_TOWNS_AS_OF, LIGHTS_TOWNS_NOT_REREAD, switchOnProblems } from "../src/lib/content/batch02/christmas-lights-towns.ts";
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
  assert.equal(LIGHTS_SWITCH_ON_CHECKED, "2026-11-20");
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

test("twelve towns published their 2026 switch-on on their own sites (read 12 and 20 Nov 2026)", () => {
  const dated = Object.fromEntries(LIGHTS_TOWNS.filter((t) => t.y2026).map((t) => [t.key, `${t.y2026!.date} ${t.y2026!.time ?? "-"} ${t.y2026!.place ?? "-"}`]));
  assert.deepEqual(dated, {
    terrassa: "2026-11-28 18:00 Raval de Montserrat",
    badalona: "2026-11-20 18:00 -",
    rubi: "2026-11-27 - -",
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
  });
  for (const t of LIGHTS_TOWNS) assert.deepEqual(switchOnProblems(t, 2026), [], t.key);
  assert.equal(LIGHTS_TOWNS_AS_OF, "2026-11-20");
  // The councils whose sites did not answer keep their last check, printed under the table.
  assert.deepEqual(LIGHTS_TOWNS_NOT_REREAD.map((u) => `${u.key} ${u.read}`), ["sabadell 2026-11-12", "reus 2026-11-12", "santa-coloma 2026-11-04"]);
  for (const u of LIGHTS_TOWNS_NOT_REREAD) assert.equal(LIGHTS_TOWNS.find((t) => t.key === u.key)?.y2026, null, u.key);
  const note: Record<Locale, RegExp> = {
    ca: /Sabadell i Reus \(12 de novembre\); Santa Coloma de Gramenet \(4 de novembre\)/,
    es: /Sabadell y Reus \(12 de noviembre\); Santa Coloma de Gramenet \(4 de noviembre\)/,
    en: /Sabadell and Reus \(12 November\); Santa Coloma de Gramenet \(4 November\)/,
  };
  for (const locale of LOCALES) assert.match(JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks), note[locale], locale);
});

/** Date guard: the 2026 mobility paragraph speaks of the days before and on 26 Nov; after the switch-on it must go or turn past. */
test("date guard: Barcelona's 2026 mobility paragraph is removed or rewritten after the switch-on", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(today <= "2026-11-26", "26 Nov is past: drop MOBILITY_2026 from showParagraphs (christmas-lights.ts) or rewrite it in the past tense, deploy, publish llums-nadal");
  for (const locale of LOCALES) assert.ok(JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks).includes(MOBILITY_2026.url), locale);
});
