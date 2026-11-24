import assert from "node:assert/strict";
import { test } from "node:test";

import { CLOCK_CHANGE } from "../src/lib/content/batch02/clock-change.ts";
import { EASTER_2027 } from "../src/lib/content/batch02/easter-2027.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CURRENT_FARES } from "../src/lib/content/transport-cards/rates.ts";
import { dateContent2027 } from "../src/lib/programmatic/holidays/dates-2027.ts";

// 24 Nov 2026, position 8-20 push: each page answers, under a heading in the
// searcher's own words, a question it used to answer only in passing.

type Blocks = { type: string; level?: number; text?: string }[];

/** The paragraph(s) under the H2 whose text is `heading`, up to the next heading. */
function under(blocks: Blocks, heading: string): string {
  const i = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === heading);
  assert.notEqual(i, -1, `missing H2 "${heading}"`);
  const out: string[] = [];
  for (const b of blocks.slice(i + 1)) {
    if (b.type === "heading") break;
    if (b.text) out.push(b.text);
  }
  return out.join(" ");
}

test("Easter Monday 2027 date page says when Easter is, in all three languages, and the FAQ repeats it", () => {
  // Order EMT/52/2026 (treball.gencat.cat, read 24 Nov 2026): 26 March Friday and 29 March Monday are holidays.
  const expect = {
    ca: { title: "Quan és Pasqua el 2027?", sunday: "diumenge 28 de març", rams: "21 de març" },
    es: { title: "¿Cuándo es Pascua en 2027?", sunday: "domingo 28 de marzo", rams: "21 de marzo" },
    en: { title: "When is Easter in 2027?", sunday: "Sunday 28 March", rams: "21 March" },
  } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const page = dateContent2027("2027-03-29", locale);
    const section = page.sections.find((s) => s.title === expect[locale].title);
    assert.ok(section, `${locale}: no Easter section`);
    const text = section.paragraphs.join(" ");
    assert.ok(text.includes(expect[locale].sunday), `${locale}: ${text}`);
    assert.ok(text.includes(expect[locale].rams), `${locale}: ${text}`);
    assert.equal(page.sections[0], section, `${locale}: the Easter section comes first`);
    const faq = page.faq?.find((f) => f.question === expect[locale].title);
    assert.ok(faq, `${locale}: no FAQ item`);
    assert.equal(faq.answer, text);
  }
});

test("only the Easter Monday page gets the Easter section", () => {
  for (const iso of ["2027-03-26", "2027-03-25", "2027-05-17"]) {
    const page = dateContent2027(iso, "es");
    assert.ok(!page.sections.some((s) => s.title.includes("Pascua en 2027")), iso);
  }
});

test("the Easter 2027 guide links the Easter Monday date page in the query's words", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = JSON.stringify(EASTER_2027.editions[locale].blocks);
    assert.ok(/29-marc-2027|29-marzo-2027|29-march-2027/.test(text), `${locale}: no link to the date page`);
  }
  const ca = JSON.stringify(EASTER_2027.editions.ca.blocks);
  assert.ok(ca.includes("Pasqua 2027, dia a dia"));
});

test("metro hours: 'what time does the metro open' and 'close today' have their own H2", () => {
  // TMB, read 24 Nov 2026: Mon-Thu and midweek holidays 05:00-midnight; Fridays and nights before holidays 05:00-02:00;
  // Saturdays "continuous service throughout Saturday to Sunday night"; Sundays until midnight.
  const want = {
    en: { open: "What time does the Barcelona metro open?", today: "What time does the metro close today?" },
    es: { open: "¿A qué hora abre el metro de Barcelona?", today: "¿A qué hora cierra el metro hoy?" },
    ca: { open: "A quina hora obre el metro de Barcelona?", today: "A quina hora tanca el metro avui?" },
  } as const;
  for (const locale of ["en", "es", "ca"] as const) {
    const blocks = HOURS.editions[locale].blocks as Blocks;
    const open = under(blocks, want[locale].open);
    assert.ok(open.includes("5:00"), `${locale}: ${open}`);
    assert.ok(open.includes("Mas Blau"), `${locale}: the L9/L10 Sud stations`);
    const today = under(blocks, want[locale].today);
    assert.ok(today.includes("2:00") && today.includes("**midnight**".replace("midnight", locale === "en" ? "midnight" : locale === "es" ? "medianoche" : "mitjanit")), `${locale}: ${today}`);
  }
});

test("transport passes: 'how much is the metro card' is answered from the dated fare table", () => {
  // TMB, 2026 table "in force from 15 January 2026", read 24 Nov 2026: single 2,90 / T-casual 13,00 / T-dia 12,00 / T-usual 22,80 (1 zone).
  const z = CURRENT_FARES.zones["1"];
  assert.deepEqual([z.single, z.tCasual, z.tDia, z.tUsual], [2.9, 13, 12, 22.8]);
  const heads = {
    ca: "Quant costa la targeta de metro de Barcelona?",
    es: "¿Cuánto cuesta la tarjeta de metro de Barcelona?",
    en: "How much is a Barcelona metro ticket or card in 2026?",
  } as const;
  const figures = {
    ca: ["2,90 €", "13,00 €", "12,00 €", "22,80 €"],
    es: ["2,90 €", "13,00 €", "12,00 €", "22,80 €"],
    en: ["€2.90", "€13.00", "€12.00", "€22.80"],
  } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const text = under(TRANSPORT.editions[locale].blocks as Blocks, heads[locale]);
    assert.ok(text.includes("T-casual"), locale);
    for (const f of figures[locale]) assert.ok(text.includes(f), `${locale}: ${f} in ${text}`);
  }
});

test("clock change: 'do the clocks change in Spain' has an H2 with the rule and no date that can go stale", () => {
  const heads = {
    ca: "Canvia l'hora a Espanya?",
    es: "¿Cambia la hora en España?",
    en: "Do the clocks change in Spain?",
  } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const text = under(CLOCK_CHANGE.editions[locale].blocks as Blocks, heads[locale]);
    assert.ok(text.includes("236/2002"), locale);
    assert.ok(text.includes("02:00") && text.includes("03:00"), locale);
    assert.ok(!/20(2[6-9]|3\d)/.test(text.replace("236/2002", "")), `${locale}: a dated claim would go stale: ${text}`);
  }
});
