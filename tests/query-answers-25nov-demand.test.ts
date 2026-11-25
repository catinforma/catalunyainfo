import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRegionBody, spainChristmasLine } from "../src/lib/content/school-spain/body.ts";
import { SPAIN_REGIONS } from "../src/lib/content/school-spain/regions.ts";

// 25 Nov 2026, striking-distance body fixes (ci-demanda): each page answers,
// in the body, the query it ranked 7-10 for without answering it directly.

test("every community school page answers 'when are the Christmas holidays 2026' for all of Spain, with the day computed", () => {
  const es = spainChristmasLine("es");
  const ca = spainChristmasLine("ca");
  const en = spainChristmasLine("en");
  assert.match(es, /el último día de clase antes de Navidad es el .+, según la comunidad, y se vuelve /);
  assert.match(es, /vacaciones de Navidad 2026 por comunidades/);
  assert.match(ca, /vacances de Nadal 2026 per comunitats/);
  assert.match(en, /Christmas 2026 school holidays by region/);
  const opener = /^(¿Y en otras comunidades\?|I a les altres comunitats\?|What about other regions\?) /;
  let checked = 0;
  for (const region of SPAIN_REGIONS) {
    const blocks = buildRegionBody(region) as { type: string; text?: string }[];
    const paragraph = blocks.find((b) => b.type === "paragraph" && opener.test(b.text ?? "") && /vacaciones de Navidad|vacances de Nadal|Christmas 2026/.test(b.text ?? ""));
    assert.ok(paragraph, `${region.slug}: no Spain-wide Christmas answer`);
    assert.ok(/ 20\d\d/.test(paragraph.text ?? ""), region.slug);
    checked++;
  }
  assert.ok(checked >= 17, `only ${checked} communities`);
});

test("the Easter 2027 guide says, under a heading in the query's words, when Holy Week is (ca/es/en)", async () => {
  const { EASTER_2027 } = await import("../src/lib/content/batch02/easter-2027.ts");
  // Ordre EMT/52/2026 (treball.gencat.cat 2027 calendar, read 20 Nov 2026): Good Friday 26 March, Easter Monday 29 March.
  const expect = {
    ca: { h2: "Quan és la Setmana Santa del 2027?", first: "Quins dies són festius per Setmana Santa del 2027 a Catalunya?", rams: "21 de març", sunday: "28 de març", friday: "26 de març", monday: "29 de març" },
    es: { h2: "¿Cuándo es la Semana Santa de 2027 en Cataluña?", first: "¿Qué días son festivos en Semana Santa de 2027 en Cataluña?", rams: "21 de marzo", sunday: "28 de marzo", friday: "26 de marzo", monday: "29 de marzo" },
    en: { h2: "When is Holy Week 2027 in Catalonia?", first: "Which days are public holidays over Easter 2027 in Catalonia?", rams: "21 March", sunday: "28 March", friday: "26 March", monday: "29 March" },
  } as const;
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = EASTER_2027.editions[locale].blocks as { type: string; level?: number; text?: string }[];
    const at = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === expect[locale].h2);
    assert.notEqual(at, -1, `${locale}: no H2`);
    const next = blocks.findIndex((b, i) => i > at && b.type === "heading");
    assert.equal(blocks[next]?.text, expect[locale].first, `${locale}: sits right before the holidays H2`);
    const text = blocks.slice(at + 1, next).map((b) => b.text).join(" ");
    for (const k of ["rams", "sunday", "friday", "monday"] as const) assert.ok(text.includes(expect[locale][k]), `${locale}: ${k} in ${text}`);
  }
});
