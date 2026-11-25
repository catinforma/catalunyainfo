import assert from "node:assert/strict";
import { test } from "node:test";

import { blockSchema } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { christmasSundaysParagraph, SHOPS_SPAIN_DECEMBER } from "../src/lib/content/batch02/shops-spain-december.ts";
import { cataloniaSundaysParagraph, christmasOpeningDays, daysPhrase, shopsSundaysBlocks, spainRestParagraph } from "../src/lib/content/batch02/shops-sundays.ts";

/**
 * 25 Nov 2026 (docs/SEO_EXPERIMENTS.md, "first Christmas Sunday"): the answer
 * under "When do shops start opening on Sundays for Christmas?" is worked out
 * for today from Barcelona's DOGC days (Resolució EMT/4342/2025: "29 de
 * novembre. 6, 8, 13, 20 i 27 de desembre.") and the Ministry calendar, with
 * the verb in the tense of the date.
 */

const LOCALES = ["ca", "es", "en"] as const;

test("Barcelona's opening days are the DOGC resolution's, and the phrase groups the runs of one weekday", () => {
  assert.deepEqual(christmasOpeningDays(), ["2026-11-29", "2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"]);
  assert.equal(daysPhrase(["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"], "es"), "el domingo 6, el martes 8 y los domingos 13, 20 y 27 de diciembre");
  assert.equal(daysPhrase(["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"], "ca"), "el diumenge 6, el dimarts 8 i els diumenges 13, 20 i 27 de desembre");
  assert.equal(daysPhrase(["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"], "en"), "Sunday 6, Tuesday 8 and Sundays 13, 20 and 27 December");
});

test("DATE GUARD: Catalonia's answer changes tense on 28 Nov, 29 Nov, 7 Dec and 28 Dec", () => {
  const OPEN = { es: /pueden abrir/, ca: /poden obrir/, en: /may open/ } as const;
  const PAST = { es: /pudieron abrir/, ca: /van poder obrir/, en: /could open/ } as const;
  const FIRST = {
    es: { before: /Navidad es el \*\*29 de noviembre de 2026\*\*/, today: /\*\*es hoy, domingo 29 de noviembre de 2026\*\*/, after: /\*\*fue el 29 de noviembre de 2026\*\*/ },
    ca: { before: /Nadal és el \*\*29 de novembre del 2026\*\*/, today: /\*\*és avui, diumenge 29 de novembre del 2026\*\*/, after: /\*\*va ser el 29 de novembre del 2026\*\*/ },
    en: { before: /season is \*\*29 November 2026\*\*/, today: /\*\*today, Sunday 29 November 2026\*\*/, after: /\*\*was 29 November 2026\*\*/ },
  } as const;
  for (const locale of LOCALES) {
    const sat = cataloniaSundaysParagraph("2026-11-28", locale);
    assert.match(sat, FIRST[locale].before, `${locale} 28 Nov`);
    assert.match(sat, OPEN[locale], `${locale} 28 Nov: December days still ahead`);
    assert.doesNotMatch(sat, PAST[locale], `${locale} 28 Nov`);
    assert.match(cataloniaSundaysParagraph("2026-11-29", locale), FIRST[locale].today, `${locale} 29 Nov`);
    const mon = cataloniaSundaysParagraph("2026-12-07", locale);
    assert.match(mon, FIRST[locale].after, `${locale} 7 Dec`);
    // 7 Dec: Sunday 6 is gone, Tuesday 8 and later are ahead.
    assert.match(mon, PAST[locale], `${locale} 7 Dec`);
    assert.match(mon, OPEN[locale], `${locale} 7 Dec`);
    const end = cataloniaSundaysParagraph("2026-12-28", locale);
    assert.match(end, FIRST[locale].after, `${locale} 28 Dec`);
    assert.match(end, PAST[locale], `${locale} 28 Dec`);
    // The closing sentence is the yearly rule ("només poden obrir deu diumenges"), not a day.
    assert.doesNotMatch(end.split(/ (Les botigues amb horari|Las tiendas con horario|Shops on the general)/)[0]!, OPEN[locale], `${locale} 28 Dec: nothing is "may open" after 27 Dec`);
    // The towns that do not open on 29 Nov are named in every state (per-town table).
    for (const text of [sat, mon, end]) assert.match(text, /Gironella/, locale);
    // 3 Jan 2027 stays a fact of the general calendar; its verb is past from 4 Jan.
    assert.match(sat, /3 (de )?(gener|enero)|January/, locale);
  }
  assert.match(cataloniaSundaysParagraph("2026-12-07", "es"), /pudieron abrir el domingo 6 de diciembre; pueden abrir el martes 8 y los domingos 13, 20 y 27 de diciembre/);
  assert.match(cataloniaSundaysParagraph("2026-12-28", "es"), /el primero de 2027 es el domingo 3 de enero/);
  assert.match(cataloniaSundaysParagraph("2027-01-04", "es"), /el primero de 2027 fue el domingo 3 de enero/);
});

test("Spain's first Christmas Sunday: same words without a date, past tense once a region's first Sunday is gone", () => {
  // Undated (FAQ answer): unchanged year-long present.
  for (const locale of LOCALES) assert.equal(christmasSundaysParagraph(locale), christmasSundaysParagraph(locale, true, undefined));
  assert.match(christmasSundaysParagraph("es", true, "2026-11-28"), /^El \*\*domingo 29 de noviembre\*\* es el primer domingo de apertura de la Navidad en Andalucía/);
  assert.match(christmasSundaysParagraph("es", true, "2026-11-29"), /\*\*domingo 29 de noviembre\*\* es el primer/);
  assert.match(christmasSundaysParagraph("es", true, "2026-11-30"), /\*\*domingo 29 de noviembre\*\* fue el primer/);
  assert.match(christmasSundaysParagraph("ca", true, "2026-11-30"), /\*\*diumenge 29 de novembre\*\* va ser el primer/);
  assert.match(christmasSundaysParagraph("en", true, "2026-11-30"), /\*\*Sunday 29 November\*\* was the first/);
  // 8 Dec: El Hierro and La Gomera (6 Dec) are past, Castilla y León (13 Dec) still ahead.
  assert.match(christmasSundaysParagraph("es", true, "2026-12-08"), /En Castilla y León, el primero es el domingo 13 de diciembre/);
  assert.match(christmasSundaysParagraph("es", true, "2026-12-08"), /el primero fue el 6 de diciembre en El Hierro y La Gomera, y es el 13 de diciembre en Fuerteventura/);
  assert.match(christmasSundaysParagraph("en", true, "2026-12-08"), /the first was 6 December on El Hierro and La Gomera, and is 13 December on/);
  // 28 Dec: everything past.
  for (const locale of LOCALES) assert.doesNotMatch(christmasSundaysParagraph(locale, true, "2026-12-28"), /\b(es|és|is) (el|the) (primer|primero|first)|el primer(o)? (és|es) /, locale);
  assert.match(christmasSundaysParagraph("es", true, "2026-12-28"), /En Castilla y León, el primero fue el domingo 13 de diciembre; en Navarra y La Rioja, el 20\./);
  assert.match(spainRestParagraph("2026-11-28", "es"), /^\*\*¿Y en el resto de España\?\*\*/);
  assert.doesNotMatch(spainRestParagraph("2026-11-28", "es"), /Cataluña,/, "the Catalan guide's Spain paragraph leaves Catalonia out");
  assert.match(spainRestParagraph("2026-11-28", "ca"), /\(\/ca\/guies\/botigues-obertes-desembre-espanya\/\)/);
});

test("the shops guide and the Spain guide carry the day-dependent block under the first H2, in ca/es/en", () => {
  assert.ok(blockSchema.safeParse({ type: "shopsSundays", scope: "catalonia" }).success);
  assert.ok(!blockSchema.safeParse({ type: "shopsSundays", scope: "nowhere" }).success);
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("shopsSundays"), "the nightly cron rebuilds the pages carrying it");
  for (const locale of LOCALES) {
    const blocks = SHOPS.editions[locale].blocks;
    const h = blocks.findIndex((b) => b.type === "heading");
    assert.deepEqual(blocks[h + 1], { type: "shopsSundays", scope: "catalonia" }, `${locale}: Catalonia answer right under the first H2`);
    assert.deepEqual(blocks[h + 2], { type: "shopsSundays", scope: "spainRest" }, `${locale}: rest of Spain after it`);
    const spain = SHOPS_SPAIN_DECEMBER.editions[locale].blocks;
    const sh = spain.findIndex((b) => b.type === "heading");
    assert.deepEqual(spain[sh + 1], { type: "shopsSundays", scope: "spain" }, `${locale}: Spain guide`);
    assert.equal((shopsSundaysBlocks("2026-11-28", locale, "catalonia")[0] as { type: string }).type, "paragraph");
  }
});
