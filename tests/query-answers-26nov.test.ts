import assert from "node:assert/strict";
import { test } from "node:test";

import { slugifyAnchor, type Block } from "../src/lib/content/blocks.ts";
import { DECEMBER_BRIDGE_SPAIN, MONDAY_7, WHERE_MONDAY_7_TITLE } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { MARATO_GUIDE, MARATO_WHEN_TITLE } from "../src/lib/content/batch02/marato.ts";
import { SHOPS, SUNDAYS_YEAR_TITLE } from "../src/lib/content/batch02/shops.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { dateContent2027 } from "../src/lib/programmatic/holidays/dates-2027.ts";
import { datePath } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * 26 Nov 2026 (ci-demanda, batch 5B; docs/SEO_EXPERIMENTS.md): striking-distance
 * queries get a heading in their own words with the answer right under it.
 * - "donde es festivo el 7 de diciembre de 2026" -> Spain bridge page;
 * - "cuando abren las tiendas los domingos" -> shops guide;
 * - "marató tv3 2026 data" -> La Marató guide;
 * - "pasqua 2027" -> Easter Monday 2027 date page (section above the towns).
 */

const today = new Date().toISOString().slice(0, 10);

type B = Block & { type: string; text?: string; level?: number; items?: string[] };

function after(blocks: Block[], heading: string): B[] {
  const i = blocks.findIndex((b) => b.type === "heading" && (b as B).text === heading);
  assert.notEqual(i, -1, `missing heading "${heading}"`);
  const out: B[] = [];
  for (const b of blocks.slice(i + 1)) {
    if (b.type === "heading") break;
    out.push(b as B);
  }
  return out;
}

const anchors = (blocks: Block[]) => new Set(blocks.filter((b) => b.type === "heading").map((b) => slugifyAnchor((b as B).text ?? "")));

test("Spain bridge: '¿Dónde es festivo el 7 de diciembre de 2026?' opens with the list of places, then where it is not", () => {
  // BOE-A-2025-21667, row "7 Lunes siguiente al Día de la Constitución Española.", "**" columns (re-read 26 Nov 2026).
  assert.deepEqual([...MONDAY_7], ["AN", "AR", "AS", "CB", "CL", "EX", "MD", "MC", "RI", "ML"]);
  const names = {
    es: ["Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla y León", "Extremadura", "Madrid", "Murcia", "La Rioja", "Melilla"],
    ca: ["Andalusia", "Aragó", "Astúries", "Cantàbria", "Castella i Lleó", "Extremadura", "Madrid", "Múrcia", "La Rioja", "Melilla"],
    en: ["Andalusia", "Aragon", "Asturias", "Cantabria", "Castile and León", "Extremadura", "Madrid", "Murcia", "La Rioja", "Melilla"],
  } as const;
  assert.match(WHERE_MONDAY_7_TITLE.es, /^¿Dónde es festivo el 7 de diciembre de 2026\?/);
  for (const locale of LOCALES) {
    const blocks = DECEMBER_BRIDGE_SPAIN.editions[locale].blocks;
    const section = after(blocks, WHERE_MONDAY_7_TITLE[locale]);
    assert.equal(section[0]!.type, "paragraph");
    assert.match(section[0]!.text!, /^\*\*.*7.*:\*\*$/, `${locale}: intro line`);
    assert.equal(section[1]!.type, "list", `${locale}: the list comes right under the intro`);
    const items = section[1]!.items!;
    for (const name of names[locale]) assert.ok(items.some((i) => i.startsWith(name)), `${locale}: ${name}`);
    assert.equal(items.length, 10, `${locale}: nine communities and Melilla`);
    assert.ok(!items.some((i) => /Catalu|Catalonia/.test(i)), `${locale}: Catalonia is not in the list`);
    const not = section[2]!.text!;
    assert.match(not, /Catalu|Catalonia/, `${locale}: says where it is not`);
    assert.ok(not.includes(`](${datePath(locale, "2026-12-07")})`), `${locale}: links the 7 Dec date page`);
    assert.ok(section.some((b) => b.type === "table"), `${locale}: the region table stays in the section`);
  }
});

test("shops: '¿Cuándo abren las tiendas los domingos?' lists every 2026 and 2027 opening day, right after the Christmas Sundays answer", () => {
  // Ordre EMT/89/2026 art. 1 and 5, Resolució EMT/4342/2025 (Barcelona): read 26 Nov 2026 in the DOGC PDFs.
  const want = {
    es: ["4 y 11 ene. · 15 ago. · 12 oct. · 29 nov. · 6, 8, 13, 20 y 27 dic.", "3 ene. · 27 jun. · 1 y 28 nov. · 6, 8, 12 y 19 dic.", "10 ene. · 5 dic."],
  } as const;
  for (const locale of LOCALES) {
    const blocks = SHOPS.editions[locale].blocks;
    const title = SUNDAYS_YEAR_TITLE[locale];
    const at = blocks.findIndex((b) => b.type === "heading" && (b as B).text === title);
    // 27 Nov 2026 (ci-numero1): moved up from after the 947-town selector to right after the Christmas Sundays answer.
    const sundays = blocks.map((b) => b.type).lastIndexOf("shopsSundays");
    assert.ok(sundays > 0 && at === sundays + 1, `${locale}: right after the Christmas Sundays answer`);
    assert.ok(at < blocks.findIndex((b) => b.type === "shopsChristmas"), `${locale}: before the town selector`);
    const section = after(blocks, title);
    assert.match(section[0]!.text!, /\*\*(deu|diez|ten) /, `${locale}: the ten-days rule`);
    const items = section.find((b) => b.type === "list")!.items!;
    assert.equal(items.length, 3, locale);
    assert.match(items[0]!, /^\*\*2026, Barcelona:\*\*/);
    // 27 Nov 2026: the jumps carry the page's own path ("(#x)" printed raw markdown).
    const jumps = section.at(-1)!.text!.match(/\(\/[^)#]+\/#[^)]+\)/g) ?? [];
    assert.equal(jumps.length, 2, `${locale}: two jumps`);
    for (const link of jumps) {
      assert.ok(link.startsWith(`(/${locale}/`), `${locale}: ${link}`);
      assert.ok(anchors(blocks).has(link.slice(link.indexOf("#") + 1, -1)), `${locale}: ${link}`);
    }
    assert.doesNotMatch(section.at(-1)!.text!, /\]\(#/, `${locale}: no bare #anchor link`);
  }
  const es = after(SHOPS.editions.es.blocks, SUNDAYS_YEAR_TITLE.es).find((b) => b.type === "list")!.items!;
  want.es.forEach((days, i) => assert.ok(es[i]!.includes(days), es[i]));
  assert.match(SUNDAYS_YEAR_TITLE.es, /^¿Cuándo abren las tiendas los domingos\?/);
});

test("date guard: the shops '2026 and 2027' list loses its 2026 row on 1 January 2027", () => {
  assert.ok(
    today < "2027-01-01",
    "From 1 Jan 2027 the 2026 row of SUNDAYS_YEAR_TITLE's list is the past: drop it, retitle the H2 '... de 2027' and, once the DOGC resolution with each town's 2027 days is out, add Barcelona's 2027 pair (shops.ts, sundaysYearBlocks).",
  );
});

test("La Marató: the first H2 says 'data / fecha / date' and answers 13 December", () => {
  const day = { ca: /diumenge 13 de desembre/, es: /domingo 13 de diciembre/, en: /Sunday 13 December/ } as const;
  for (const locale of LOCALES) {
    const blocks = MARATO_GUIDE.editions[locale].blocks;
    const first = blocks.find((b) => b.type === "heading") as B;
    assert.equal(first.text, MARATO_WHEN_TITLE[locale]);
    assert.match(first.text!, /Data|Fecha|date/);
    assert.match(after(blocks, MARATO_WHEN_TITLE[locale]).map((b) => b.text ?? "").join(" "), day[locale], locale);
  }
});

// La Marató's own date guard is MARATO_REREAD_BY (14 Dec 2026, tests/december-pages.test.ts).

test("Easter Monday 2027: 'Quan és Pasqua el 2027?' prints above the local-holiday list, only on that page", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const page = dateContent2027("2027-03-29", locale);
    assert.equal(page.sectionsBeforeLocal, 1, locale);
    assert.match(page.sections[0]!.title, /Pasqua el 2027|Pascua en 2027|Easter in 2027/);
    assert.match(page.sections[0]!.paragraphs[0]!, /28/);
  }
  for (const iso of ["2027-03-26", "2027-12-08"]) assert.equal(dateContent2027(iso, "ca").sectionsBeforeLocal, undefined, iso);
  // 27 Nov 2026 (batch 10G): Pasqua Granada's own "when is it" sits there on 17 May, not Easter's.
  assert.equal(dateContent2027("2027-05-17", "ca").sectionsBeforeLocal, 1);
  assert.equal(dateContent2027("2027-05-17", "ca").sections[0]!.title, "Quan és la Pasqua Granada el 2027?");
});
