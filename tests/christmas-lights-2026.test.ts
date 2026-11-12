import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { CHRISTMAS_LIGHTS } from "../src/lib/content/batch02/christmas-lights.ts";
import { LIGHTS_TOWNS, LIGHTS_TOWNS_AS_OF, LIGHTS_TOWNS_NOT_REREAD, switchOnProblems } from "../src/lib/content/batch02/christmas-lights-towns.ts";
import { ANNOUNCED_2026, LIGHTS_SWITCH_ON_CHECKED, announcementProblems, dayDate, placePhrase } from "../src/lib/content/batch02/festive.ts";
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
  assert.equal(LIGHTS_SWITCH_ON_CHECKED, "2026-11-12");
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

test("four towns published their 2026 switch-on on their own sites (read 12 Nov 2026)", () => {
  const dated = Object.fromEntries(LIGHTS_TOWNS.filter((t) => t.y2026).map((t) => [t.key, `${t.y2026!.date} ${t.y2026!.time ?? "-"} ${t.y2026!.place ?? "-"}`]));
  assert.deepEqual(dated, {
    terrassa: "2026-11-28 18:00 Raval de Montserrat",
    badalona: "2026-11-20 18:00 -",
    rubi: "2026-11-27 - -",
    igualada: "2026-11-27 - plaça de l'Ajuntament",
  });
  for (const t of LIGHTS_TOWNS) assert.deepEqual(switchOnProblems(t, 2026), [], t.key);
  assert.equal(LIGHTS_TOWNS_AS_OF, "2026-11-12");
  // The two councils whose sites did not answer keep their 4 Nov check, printed under the table.
  assert.deepEqual(LIGHTS_TOWNS_NOT_REREAD.map((u) => `${u.key} ${u.read}`), ["santa-coloma 2026-11-04", "vilanova 2026-11-04"]);
  for (const u of LIGHTS_TOWNS_NOT_REREAD) assert.equal(LIGHTS_TOWNS.find((t) => t.key === u.key)?.y2026, null, u.key);
  const note: Record<Locale, RegExp> = {
    ca: /Santa Coloma de Gramenet i Vilanova i la Geltrú: comprovat el 4 de novembre de 2026/,
    es: /Santa Coloma de Gramenet y Vilanova i la Geltrú: comprobado el 4 de noviembre de 2026/,
    en: /Santa Coloma de Gramenet and Vilanova i la Geltrú: checked on 4 November 2026/,
  };
  for (const locale of LOCALES) assert.match(JSON.stringify(CHRISTMAS_LIGHTS.editions[locale].blocks), note[locale], locale);
});
