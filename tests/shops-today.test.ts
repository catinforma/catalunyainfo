import { preVote } from "./pre-vote.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { blockSchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { MALL_AREA_TOWNS, SHOPS, TOWNS_NOV_DEC, closedOn, mallsAreaRows } from "../src/lib/content/batch02/shops.ts";
import { christmasTownRows } from "../src/lib/content/batch02/shops-christmas-towns.ts";
import { compactDays } from "../src/lib/content/batch02/shops-christmas.ts";
import {
  CANARY_ISLANDS,
  DECEMBER_2026,
  NOVEMBER_29_2026,
  SHOPS_SPAIN_AS_OF,
  SHOPS_SPAIN_DECEMBER,
  christmasSundays,
  christmasSundaysParagraph,
} from "../src/lib/content/batch02/shops-spain-december.ts";
import { SHOPS_TODAY_AFTER, barcelonaShopsDay, cataloniaDiff, decemberLine, nextOpeningAfter, shopsTodayLines } from "../src/lib/content/batch02/shops-today.ts";
import { shopsSundaysBlocks } from "../src/lib/content/batch02/shops-sundays.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";

/**
 * 23 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Shops open on Sundays: today and
 * this Sunday"): the shops guide answers "¿abren hoy / este domingo las
 * tiendas en Barcelona?" from today's date, the rest of Spain's first
 * Christmas Sunday from the Ministry calendar, and the Barcelona-area towns
 * where the large shopping centres are. Every answer comes from the official
 * texts already on the page; nothing here knows a shop's own timetable.
 */

const LOCALES = ["ca", "es", "en"] as const;

test("Barcelona, date by date: the DOGC resolution's ten days, the law's closing days, 3 Jan 2027 pending", () => {
  // Resolució EMT/4342/2025, Barcelona: "29 de novembre. 6, 8, 13, 20 i 27 de desembre."
  for (const iso of ["2026-11-29", "2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"]) assert.equal(barcelonaShopsDay(iso), "open", iso);
  // Llei 18/2017, art. 36.2.d.
  for (const iso of ["2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06"]) assert.equal(barcelonaShopsDay(iso), "lawClosed", iso);
  // Sundays that are not one of Barcelona's days.
  for (const iso of ["2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22"]) assert.equal(barcelonaShopsDay(iso), "closed", iso);
  // Ordre EMT/89/2026, art. 1: general day; the council's 2027 swaps are not published.
  assert.equal(barcelonaShopsDay("2027-01-03"), "pending2027");
  // Working days people ask about (Ordre EMT/66/2025, EMT/52/2026), Saturdays, and 7 Dec (a working day in Barcelona).
  for (const iso of ["2026-11-23", "2026-11-28", "2026-12-07", "2026-12-24", "2026-12-31", "2027-01-02", "2027-01-05"]) assert.equal(barcelonaShopsDay(iso), "working", iso);
  assert.equal(nextOpeningAfter("2026-11-23"), "2026-11-29");
  assert.equal(nextOpeningAfter("2026-12-06"), "2026-12-08");
  assert.equal(nextOpeningAfter("2026-12-27"), "2027-01-03");
  assert.equal(nextOpeningAfter("2027-01-03"), null, "10 Jan 2027 is not Barcelona's until the council or the DOGC says so");
});

test("the rest of Catalonia is read from the 947-town table, so Gironella counts on 29 Nov", () => {
  assert.equal(christmasTownRows().length, 947);
  assert.deepEqual(cataloniaDiff("2026-11-29").notOpen.sort(), ["Gironella", "Martorell", "Salt"]);
  assert.deepEqual(cataloniaDiff("2026-12-08").notOpen.length, closedOn("2026-12-08").length);
  assert.deepEqual(cataloniaDiff("2026-12-06").notOpen.sort(), ["Riells i Viabrea", "Terrassa"]);
  assert.deepEqual(cataloniaDiff("2026-12-13").notOpen, ["Olot"]);
  assert.ok(cataloniaDiff("2026-12-07").alsoOpen.includes("Sant Boi de Llobregat"));
});

test("the lines name the date, answer in each language, and the Sunday carries its own Catalonia line", () => {
  const mon = shopsTodayLines("2026-11-23", "es")!;
  assert.match(mon.today, /^Hoy, lunes, 23 de noviembre de 2026, no es domingo ni festivo en Barcelona/);
  assert.equal(mon.catalonia, null, "a weekday has no Catalonia line of its own");
  assert.equal(mon.sundayLabel, "Este domingo, 29 de noviembre");
  assert.match(mon.sundayValue, /^Sí, las tiendas pueden abrir en Barcelona\. En el resto de Cataluña, también, salvo en Gironella, Martorell y Salt\.$/);
  assert.equal(mon.nextValue, "Domingo, 29 de noviembre de 2026");

  const sun = shopsTodayLines("2026-11-29", "ca")!;
  assert.match(sun.today, /^Avui, diumenge, 29 de novembre de 2026, les botigues poden obrir a Barcelona/);
  assert.match(sun.catalonia!, /excepte a Gironella, Martorell i Salt/);
  assert.match(sun.sundayLabel, /^El diumenge vinent, 6 de desembre$/);

  const xmas = shopsTodayLines("2026-12-25", "en")!;
  assert.match(xmas.today, /^Today, Friday 25 December 2026 \([^)]+\), shops on the general timetable must close all over Catalonia \(Llei 18\/2017, art\. 36\.2\.d\)/);
  assert.equal(xmas.catalonia, null);
  assert.match(xmas.sundayValue, /^Yes, shops may open in Barcelona\. In the rest of Catalonia too, except in Gironella\.$/);

  const imm = shopsTodayLines("2026-12-08", "es")!;
  assert.match(imm.today, /\(la Inmaculada\), las tiendas pueden abrir en Barcelona/);
  assert.match(imm.catalonia!, new RegExp(`salvo ${closedOn("2026-12-08").length} municipios`));

  const jan3 = shopsTodayLines("2027-01-03", "es")!;
  assert.match(jan3.today, /Orden EMT\/89\/2026/);
  assert.match(jan3.today, /aún no ha publicado/);
  assert.match(jan3.nextValue, /Aún no publicado/);
  for (const locale of LOCALES) {
    for (const iso of ["2026-11-23", "2026-11-29", "2026-12-08", "2026-12-26", "2027-01-03"]) {
      const lines = shopsTodayLines(iso, locale)!;
      assert.ok(lines, `${locale} ${iso}`);
      assert.match(lines.note, /EMT\/4342\/2025/, `${locale}: names its source`);
    }
    // After Reis the 2027 municipal list is needed: no verdict.
    assert.equal(shopsTodayLines("2027-01-07", locale), null);
    assert.equal(shopsTodayLines("2026-10-31", locale), null);
    assert.match(SHOPS_TODAY_AFTER[locale], /25 (de )?(novembre|noviembre|November) (de )?2026/);
  }
});

test("shopsToday is a configuration-free, day-dependent block, rendered on the server", () => {
  assert.ok(blockSchema.safeParse({ type: "shopsToday" }).success);
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("shopsToday"), "the nightly cron must rebuild the page");
  const renderer = readFileSync(join(import.meta.dirname, "../src/components/blocks/BlockRenderer.tsx"), "utf8");
  assert.match(renderer, /case "shopsToday":\s*\n\s*\/\/[^\n]*\n\s*return <ShopsToday locale=\{context\.locale\} \/>;/);
  const component = readFileSync(join(import.meta.dirname, "../src/components/blocks/ShopsToday.tsx"), "utf8");
  assert.doesNotMatch(component, /"use client"/, "the answer has to be in the HTML");
});

test("guide: Sundays first (16 Nov H2 kept), then today, then the date table; titles and leads untouched", () => {
  for (const locale of LOCALES) {
    const blocks = preVote(SHOPS.editions[locale].blocks);
    const h2 = blocks.filter((b) => b.type === "heading") as { text: string }[];
    assert.match(h2[0]!.text, /diumenges per Nadal|domingos en Navidad|Sundays for Christmas/, locale);
    // 27 Nov 2026: the general "when are shops open on Sundays" section sits between the Christmas Sundays and today.
    assert.match(h2[1]!.text, /^(Quan obren les botigues els diumenges\?|¿Cuándo abren las tiendas los domingos\?|When are shops open on Sundays\?)/, locale);
    assert.match(h2[2]!.text, /^(Obren avui les botigues a Barcelona\?|¿Abren hoy las tiendas en Barcelona\?|Are shops open today in Barcelona\?)/, locale);
    const today = blocks.findIndex((b) => b.type === "shopsToday");
    const firstTable = blocks.findIndex((b) => b.type === "table");
    assert.ok(today > 0 && today < firstTable, `${locale}: the today block sits before the date table`);
    assert.equal(blocks.filter((b) => b.type === "shopsToday").length, 1);
    // The Spain-wide answer, in the Sundays section, with the Spain page link.
    // 25 Nov 2026: the Sundays answer is the day-dependent `shopsSundays` block (shops-sundays.ts), drawn on render.
    const text = bodyToPlainText(blocks);
    const spain = (shopsSundaysBlocks("2026-11-26", locale, "spainRest")[0] as { text: string }).text;
    assert.match(spain, /Castilla y León|Castella i Lleó|Castile and León/, `${locale}: rest of Spain answered`);
    assert.ok(spain.includes(`](${b2href("shopsSpainDecember", locale)})`), `${locale}: links the Spain page`);
    // The DOGC 2027 list and Barcelona's 2027 days, re-checked on 25 Nov 2026 and again on 27 Nov.
    assert.doesNotMatch(text, /(a|As of) 5 (de )?(novembre|noviembre|November)/, `${locale}: stale "as of 5 Nov"`);
    assert.match(text, /27 (de )?(novembre|noviembre|November)/, locale);
  }
});

test("malls: the Barcelona-area towns with their days from the per-town table, no centre named", () => {
  for (const locale of LOCALES) {
    const rows = mallsAreaRows(locale);
    assert.equal(rows.length, MALL_AREA_TOWNS.length);
    // Each row is the per-town table's row for that municipality (947 towns, DOGC names).
    const table = christmasTownRows();
    for (const town of MALL_AREA_TOWNS) {
      const row = table.find((r) => r.name === town);
      assert.ok(row, `${town}: not a DOGC name in the per-town table`);
      const [, open, swapped] = rows[MALL_AREA_TOWNS.indexOf(town)]!;
      assert.equal(open, compactDays(row!.open, locale), `${locale} ${town}`);
      assert.equal(swapped, compactDays(row!.swapped, locale), `${locale} ${town}`);
    }
    const tables = SHOPS.editions[locale].blocks.filter((b) => b.type === "table") as { rows: string[][]; caption: string }[];
    // Tables 0 (dates) and 1 (the 30 towns) keep their places for the older tests.
    assert.equal(tables[1]!.rows.length, TOWNS_NOV_DEC.length);
    const area = tables.find((t) => t.rows.length === MALL_AREA_TOWNS.length && /Barcelona/.test(t.caption))!;
    assert.ok(area, locale);
    assert.doesNotMatch(area.caption, /2027/);
    const no = (name: RegExp) => area.rows.find((r) => name.test(r[0]!))![2];
    assert.match(no(/^Badalona$/)!, /^8 /, `${locale}: Badalona does not open on 8 Dec`);
    assert.match(no(/^Terrassa$/)!, /^6 /, `${locale}: Terrassa does not open on 6 Dec`);
    assert.equal(no(/^Barcelona$/), "—");
    assert.doesNotMatch(JSON.stringify(SHOPS.editions[locale].blocks), /Westfield|Maquinista|Màgic|La Roca Village|Maremagnum|Centre comercial Diagonal Mar/, `${locale}: no shopping centre's own timetable`);
  }
});

test("Spain: Sunday 29 November from the Ministry calendar, and the first Christmas Sunday in each region", () => {
  assert.equal(SHOPS_SPAIN_AS_OF, "2026-11-23");
  const known = new Set([...DECEMBER_2026, ...CANARY_ISLANDS].map((r) => r.name));
  for (const name of NOVEMBER_29_2026) assert.ok(known.has(name), name);
  for (const name of ["Castilla y León", "Navarra", "La Rioja", "Madrid", "País Vasco"]) assert.ok(!NOVEMBER_29_2026.has(name), name);
  const first = (name: string) => christmasSundays([...DECEMBER_2026, ...CANARY_ISLANDS].find((r) => r.name === name)!)[0];
  assert.equal(first("Andalucía"), 29);
  assert.equal(first("Castilla y León"), 13);
  assert.equal(first("Navarra"), 20);
  assert.equal(first("La Rioja"), 20);
  assert.equal(first("El Hierro"), 6);
  assert.equal(first("Lanzarote"), 13);
  assert.equal(first("Madrid"), undefined);
  assert.match(christmasSundaysParagraph("es"), /^El \*\*domingo 29 de noviembre\*\* es el primer domingo de apertura de la Navidad en Andalucía, Aragón, Asturias, Baleares, Cantabria, Castilla-La Mancha, Cataluña,/);
  assert.doesNotMatch(christmasSundaysParagraph("es", false), /Cataluña/);
  for (const locale of LOCALES) {
    const blocks = SHOPS_SPAIN_DECEMBER.editions[locale].blocks;
    const h2 = blocks.filter((b) => b.type === "heading") as { text: string }[];
    assert.match(h2[0]!.text, /Navidad|Nadal|Christmas/, `${locale}: the Sundays question is the first section`);
    const faqBlock = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    assert.match(faqBlock.items[0]!.question, /domingos|diumenges|Sundays/);
    assert.doesNotMatch(faqBlock.items[0]!.answer, /\*\*/, "FAQ answers are plain text");
  }
});

test("the 7 and 8 December date pages link the Spain-wide shops page", () => {
  for (const locale of LOCALES) assert.equal(GUIDES.shopsSpainDecember[locale], b2href("shopsSpainDecember", locale));
  const dates = readFileSync(join(import.meta.dirname, "../src/lib/programmatic/holidays/dates.ts"), "utf8");
  assert.equal(dates.match(/"shops", "shopsSpainDecember"/g)?.length, 2);
});

test("25 Nov 2026: 'mañana' and the December line, with the dates already gone in the past tense", () => {
  // "tiendas abiertas mañana en barcelona 2026" (96 impressions at 7.7, 27 Oct-23 Nov).
  const wed = shopsTodayLines("2026-11-25", "es")!;
  assert.equal(wed.tomorrowLabel, "Mañana, jueves, 26 de noviembre de 2026");
  assert.equal(wed.tomorrowValue, "Es laborable: cada tienda abre con su horario.");
  // Tomorrow is the Sunday: the Sunday row says so and there is no duplicate row.
  const sat = shopsTodayLines("2026-11-28", "es")!;
  assert.equal(sat.tomorrowLabel, null);
  assert.equal(sat.sundayLabel, "Mañana, domingo, 29 de noviembre");
  assert.equal(shopsTodayLines("2026-11-28", "ca")!.sundayLabel, "Demà, diumenge, 29 de novembre");
  assert.equal(shopsTodayLines("2026-11-28", "en")!.sundayLabel, "Tomorrow, Sunday, 29 November");
  // Reis: tomorrow is outside the window, no verdict.
  assert.equal(shopsTodayLines("2027-01-06", "es")!.tomorrowLabel, null);
  // Barcelona's days are Resolució EMT/4342/2025 (6, 8, 13, 20, 27 Dec); 25 and 26 Dec are Llei 18/2017, art. 36.2.d.
  assert.equal(
    decemberLine("2026-11-25", "es"),
    "Diciembre de 2026 en Barcelona: las tiendas pueden abrir el domingo 6, el martes 8, el domingo 13, el domingo 20 y el domingo 27 de diciembre; deben cerrar el viernes 25 y el sábado 26 de diciembre. En el resto de Cataluña, los mismos días, con las excepciones de la tabla de más abajo.",
  );
  // DATE GUARD: after each date the verb is past ("pudieron", "van poder", "could"), before it present.
  const PAST = { es: /pudieron abrir el domingo 6 y el martes 8 de diciembre; pueden abrir el domingo 13/, ca: /van poder obrir el diumenge 6 i el dimarts 8 de desembre; poden obrir el diumenge 13/, en: /could open on Sunday 6 and Tuesday 8 December; may open on Sunday 13/ };
  for (const locale of LOCALES) {
    assert.match(decemberLine("2026-12-09", locale), PAST[locale], locale);
    assert.doesNotMatch(decemberLine("2026-12-28", locale), /(pueden|poden|may) (abrir|obrir|open)/, `${locale}: nothing is "may open" after 27 Dec`);
    assert.doesNotMatch(decemberLine("2026-12-28", locale), /(deben cerrar|han de tancar|must close)/, `${locale}: closings are past after 26 Dec`);
    assert.match(decemberLine("2026-12-26", locale), /(deben cerrar|han de tancar|must close)/, locale);
    assert.match(decemberLine("2026-12-27", locale), /(tuvieron que cerrar|van haver de tancar|had to close)/, locale);
    // The block carries the line until 31 Dec and no longer after.
    assert.ok(shopsTodayLines("2026-12-31", locale)!.decemberValue);
    assert.equal(shopsTodayLines("2027-01-02", locale)!.decemberValue, null);
  }
});

test("the shops guide names Barcelona's 2026 mall days and the eight 2027 general days in plain sentences", () => {
  const sentences = {
    ca: [/centres comercials poden obrir els deu diumenges i festius del 2026[^"]*29 de novembre i 6, 8, 13, 20 i 27 de desembre/, /El 2027, les botigues poden obrir el 3 de gener, el 27 de juny, l'1 de novembre, el 28 de novembre i el 6, 8, 12 i 19 de desembre/],
    es: [/centros comerciales pueden abrir los diez domingos y festivos de 2026[^"]*29 de noviembre y 6, 8, 13, 20 y 27 de diciembre/, /En 2027, las tiendas pueden abrir el 3 de enero, el 27 de junio, el 1 de noviembre, el 28 de noviembre y el 6, 8, 12 y 19 de diciembre/],
    en: [/shopping centres may open on the city's ten Sundays and holidays of 2026[^"]*29 November and 6, 8, 13, 20 and 27 December/, /In 2027, shops may open on 3 January, 27 June, 1 November, 28 November and 6, 8, 12 and 19 December/],
  } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SHOPS.editions[locale].blocks);
    for (const re of sentences[locale]) assert.match(text, re, locale);
  }
});
