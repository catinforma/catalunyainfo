import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { SHOPS, TOWNS_NOV_DEC, closedOn } from "../src/lib/content/batch02/shops.ts";
import { isSourceRef, publicSourceRef } from "../src/lib/content/source-ref.ts";
import { CHRISTMAS_SOURCES } from "../src/lib/content/batch02/shops-christmas.ts";
import { CATALONIA_DEPENDS, CATALONIA_NO_8_DEC, CATALONIA_TOWNS, SHOPS_SPAIN_DECEMBER, townSearchHref } from "../src/lib/content/batch02/shops-spain-december.ts";
import { closedOn as closedOnShared, extraOn, TOWNS_NOV_DEC as sharedTowns } from "../src/lib/content/batch02/shops-towns-nov-dec.ts";
import { formatDateNumeric } from "../src/lib/format.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import ca from "../src/lib/i18n/messages/ca.ts";
import en from "../src/lib/i18n/messages/en.ts";
import es from "../src/lib/i18n/messages/es.ts";

/**
 * 25 Nov 2026 (audit): the Catalan shops guide printed "DOGC 25 nov 2026" for
 * orders published in 2025 and May 2026, because the source list showed the
 * read date (`entry_sources.accessed_at`) bare next to the publisher. The
 * template now prints the bulletin reference apart ("DOGC núm. 9551,
 * 27.11.2025") and labels the read date ("consultat el 25/11/2026").
 */
const article = readFileSync(new URL("../src/components/pages/EntryArticle.tsx", import.meta.url), "utf8");

test("the sources list labels the read date and prints the bulletin reference apart", () => {
  const block = article.slice(article.indexOf('id="ci-sources-heading"'));
  const list = block.slice(0, block.indexOf("</ol>"));
  assert.match(list, /t\.meta\.accessedOn/, "the read date carries its label");
  assert.match(list, /formatDateNumeric\(source\.accessedAt, locale\)/);
  assert.match(list, /source\.note/, "the reference (bulletin number, publication date) is printed");
  assert.doesNotMatch(list, /formatDate\(source\.accessedAt/, "no bare short date after the publisher");
  assert.equal(es.meta.accessedOn, "consultado el");
  assert.equal(ca.meta.accessedOn, "consultat el");
  assert.equal(en.meta.accessedOn, "accessed on");
});

test("the read date prints as dd/mm/yyyy in every language", () => {
  const d = new Date("2026-11-25T12:00:00+01:00");
  for (const locale of LOCALES) assert.equal(formatDateNumeric(d, locale), "25/11/2026", locale);
});

test("the Catalan shops guide gives each DOGC source its bulletin number and publication date", () => {
  const byDoc = (id: string) => SHOPS.sources.find((s) => s.url.includes(`documentId=${id}`));
  // Read in the footer of each DOGC PDF on 25 Nov 2026 ("Núm. 9551 - 27.11.2025").
  assert.equal(byDoc("1015009")?.ref, "núm. 9421, 27.5.2025");
  assert.equal(byDoc("1030324")?.ref, "núm. 9551, 27.11.2025");
  assert.equal(byDoc("1045357")?.ref, "núm. 9674, 28.5.2026");
  assert.equal(byDoc("1013204")?.ref, "núm. 9406, 6.5.2025");
  assert.equal(byDoc("1040896")?.ref, "núm. 9637, 1.4.2026");
  for (const s of SHOPS.sources.filter((x) => x.publisher === "DOGC")) {
    assert.match(s.ref ?? "", /^núm\. \d{4}, \d{1,2}\.\d{1,2}\.\d{4}$/, s.name);
  }
  // The same numbers and dates as the in-page citations (shops-christmas.ts: "DOGC núm. 9551, de 27.11.2025").
  const pairs: [string, keyof typeof CHRISTMAS_SOURCES][] = [
    ["1015009", "order2026"],
    ["1030324", "resolution2026"],
    ["1045357", "order2027"],
    ["1013204", "holidays2026"],
    ["1040896", "holidays2027"],
  ];
  for (const [id, key] of pairs) {
    const ref = byDoc(id)!.ref!;
    assert.equal(`DOGC ${ref.replace(", ", ", de ")}`, CHRISTMAS_SOURCES[key].ref, key);
  }
});

test("every batch02 source that states a reference states it in the same form", async () => {
  const dir = join(import.meta.dirname, "..", "src", "lib", "content", "batch02");
  let withRef = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "publish.ts")) {
    const mod: Record<string, unknown> = await import(pathToFileURL(join(dir, file)).href);
    for (const value of Object.values(mod)) {
      if (!value || typeof value !== "object" || !("entryKey" in value) || !("sources" in value)) continue;
      for (const s of (value as { sources: { name: string; ref?: string | null }[] }).sources) {
        if (!s.ref) continue;
        withRef++;
        assert.match(s.ref, /^núm\. \d{3,5}, \d{1,2}\.\d{1,2}\.\d{4}$/, `${file}: ${s.name}`);
      }
    }
  }
  assert.ok(withRef >= 5);
});

test("Catalonia on 8 December: the Spain guide's cell is computed from the Catalan guide's town table", () => {
  assert.equal(sharedTowns, TOWNS_NOV_DEC, "one table");
  assert.equal(closedOnShared, closedOn);
  // Resolució EMT/4342/2025 (DOGC 9551), re-read 25 Nov 2026: 21 listed towns do not have the 8th.
  assert.equal(CATALONIA_NO_8_DEC, 21);
  assert.equal(CATALONIA_NO_8_DEC, closedOn("2026-12-08").length);
  assert.ok(!closedOn("2026-12-08").includes("Barcelona"), "Barcelona may open on 8 December (Resolució EMT/4342/2025)");
  const cell = {
    es: `Sí, salvo en ${CATALONIA_NO_8_DEC} municipios`,
    ca: `Sí, excepte a ${CATALONIA_NO_8_DEC} municipis`,
    en: `Yes, except in ${CATALONIA_NO_8_DEC} towns`,
  } as const;
  for (const locale of LOCALES) {
    const blocks = SHOPS_SPAIN_DECEMBER.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[];
    const row = blocks.find((b) => b.type === "table")!.rows!.find((r) => /^(Cataluña|Catalunya|Catalonia)$/.test(r[0]!))!;
    // 25 Nov 2026: the answer is "depends on the town" with the link to the town search; the count is the secondary part.
    assert.equal(row[3], `[${CATALONIA_DEPENDS[locale]}](${townSearchHref(locale)}) (${cell[locale]})`, `${locale}: Catalonia, Tue 8`);
    // The lead names Catalonia among the places where shops may open on the 8th.
    const lead = JSON.stringify(blocks[0]);
    assert.match(lead, /(Cataluña \(en Barcelona|Catalunya \(a Barcelona|Catalonia \(in Barcelona)/, `${locale}: lead`);
  }
  // The Catalan guide says the same number in its lead, in the three languages.
  for (const locale of LOCALES) assert.ok(JSON.stringify(SHOPS.editions[locale].blocks[0]).includes(`${CATALONIA_NO_8_DEC} `), locale);
});

test("only a bulletin reference written by the pipeline is printed; free-text admin notes stay private", () => {
  // The pipeline's form, with or without the bulletin's initials.
  assert.equal(publicSourceRef("núm. 9551, 27.11.2025"), "núm. 9551, 27.11.2025");
  assert.equal(publicSourceRef("DOGC núm. 9551, 27.11.2025"), "DOGC núm. 9551, 27.11.2025");
  assert.equal(publicSourceRef("BOE núm. 123, 1.2.2026"), "BOE núm. 123, 1.2.2026");
  // Anything else an editor can type in the admin "note" field.
  for (const note of [
    "revisar abans de publicar",
    "internal: ask legal about art. 36",
    "núm. 9551",
    "núm. 9551, 27.11.2025 <script>alert(1)</script>",
    "núm. 9551, 27.11.2025. Contacta amb algú",
    "see DOGC núm. 9551, 27.11.2025 and more",
    "https://example.com núm. 1, 1.1.2026",
    "",
    "   ",
  ]) assert.equal(publicSourceRef(note), null, JSON.stringify(note));
  assert.equal(publicSourceRef(null), null);
  assert.equal(publicSourceRef(undefined), null);
  // The component goes through the guard and never prints the raw note.
  const block = article.slice(article.indexOf('id="ci-sources-heading"'));
  const list = block.slice(0, block.indexOf("</ol>"));
  assert.match(list, /publicSourceRef\(source\.note\)/);
  assert.doesNotMatch(list, /\{source\.note\}/);
  // The pipeline never rejects a ref (a throw would turn a publish into a 500): it writes the note and the guard decides.
  const pipeline = readFileSync(new URL("../src/lib/content/publish-article.ts", import.meta.url), "utf8");
  assert.doesNotMatch(pipeline, /throw[^\n]*ref/i);
  assert.doesNotMatch(pipeline, /isSourceRef/);
  assert.match(pipeline, /note: sourceRefs\[index\]/);
  for (const ref of ["núm. 9551, 27.11.2025", "núm. 9406, 6.5.2025", "DOGC núm. 9674, de 28.5.2026"]) assert.ok(isSourceRef(ref), ref);
  assert.ok(!isSourceRef("Les notes internes"));
});

/**
 * Every `ref` string literal in src/lib/content, and whether the public page would print it.
 * Only the `ref` of a B2Source (batch02) reaches `publishArticle` (batch02/publish.ts copies it
 * into the spec); the other `ref` fields below are in-page citation objects that are never
 * written to `entry_sources.note`, listed so a new one is classified on purpose.
 */
const PRINTS: Record<string, boolean> = {
  "núm. 7426, 3.8.2017": true,
  "núm. 9421, 27.5.2025": true,
  "núm. 9551, 27.11.2025": true,
  "núm. 9674, 28.5.2026": true,
  "núm. 9406, 6.5.2025": true,
  "núm. 9637, 1.4.2026": true,
  // 26 Nov 2026: Ordre EMT/208/2025 (local holidays 2026) in the shops guide, for the Monday 7 December row.
  "núm. 9565, 17.12.2025": true,
  "DOGC núm. 9421, de 27.5.2025": true,
  "DOGC núm. 9551, de 27.11.2025": true,
  "DOGC núm. 9406, de 6.5.2025": true,
  "DOGC núm. 9637, de 1.4.2026": true,
  "DOGC núm. 9674, de 28.5.2026": true,
  "BOE-A-2025-21667, BOE de 28.10.2025": true,
  "BOE-A-2017-11320, última actualització 31.12.2025": true,
  "BOE, Revista de Jurisprudencia Laboral, núm. 6/2026": false,
  "Ajuntament de Barcelona": false,
};

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : []));
}

test("every existing ref string in content: which print and which stay private; none can make a publish fail", () => {
  const root = join(import.meta.dirname, "..", "src", "lib", "content");
  const seen = new Map<string, string[]>();
  for (const file of walk(root)) {
    for (const m of readFileSync(file, "utf8").matchAll(/\bref: "([^"\n]{1,120})"/g)) {
      const list = seen.get(m[1]!) ?? [];
      list.push(file.slice(root.length + 1));
      seen.set(m[1]!, list);
    }
  }
  assert.ok(seen.size >= 10, `only ${seen.size} refs found`);
  for (const [ref, files] of seen) {
    if (/^(Per a|Para la|For the) /.test(ref)) continue; // strike pages: long prose in a different structure
    assert.ok(ref in PRINTS, `new ref ${JSON.stringify(ref)} in ${files.join(", ")}: add it to PRINTS and say whether it prints`);
    assert.equal(publicSourceRef(ref) !== null, PRINTS[ref], ref);
  }
});

test("publishing never throws on a ref: every article that goes through publishArticle", async () => {
  const root = join(import.meta.dirname, "..", "src", "lib", "content");
  // Publishers that build SourceSpec by hand copy name, url, publisher and type only: none passes a `ref`.
  for (const file of walk(root).filter((f) => /publish\.ts$/.test(f) && !f.includes(`${"batch02"}/publish.ts`))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /sources[^\n]*\n[^\n]*\bref\b|\bsource\.ref\b|\bs\.ref\b/, file);
  }
  const b2 = readFileSync(join(root, "batch02", "publish.ts"), "utf8");
  assert.match(b2, /ref: source\.ref \?\? null/);
  // The batch02 articles, as batch02/publish.ts maps them: every ref is written as a note and none throws.
  const dir = join(root, "batch02");
  const printed: string[] = [];
  const hidden: string[] = [];
  let articles = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "publish.ts")) {
    const mod: Record<string, unknown> = await import(pathToFileURL(join(dir, file)).href);
    for (const value of Object.values(mod)) {
      if (!value || typeof value !== "object" || !("entryKey" in value) || !("sources" in value)) continue;
      articles++;
      for (const s of (value as { sources: { url: string; ref?: string | null }[] }).sources) {
        const spec = { ref: s.ref ?? null };
        assert.doesNotThrow(() => (spec.ref ? publicSourceRef(spec.ref) : null), s.url);
        if (spec.ref) (publicSourceRef(spec.ref) ? printed : hidden).push(spec.ref);
      }
    }
  }
  assert.ok(articles > 40);
  assert.ok(printed.length >= 5, "the shops guide's DOGC references print");
  assert.deepEqual(hidden, [], `batch02 sources whose ref would stay private: ${hidden.join("; ")}`);
});

test("Catalonia on Sunday 6 and Monday 7: the cells come from the same town table as the 8th", () => {
  // Resolució EMT/4342/2025, read 25 Nov 2026: Terrassa and Riells i Viabrea "8, 13, 20 i 27 de desembre"
  // (no 6th); Sant Boi de Llobregat "6, 7, 8, 13, 20 i 27 de desembre" (adds the 7th).
  assert.deepEqual(closedOn("2026-12-06"), ["Riells i Viabrea", "Terrassa"]);
  assert.deepEqual(extraOn("2026-12-07"), ["Sant Boi de Llobregat"]);
  assert.equal(CATALONIA_TOWNS.closed[6], 2);
  assert.equal(CATALONIA_TOWNS.extra[7], 1);
  const expected = {
    es: ["Sí, salvo en 2 municipios", "No, salvo en 1 municipio", "Sí, salvo en 21 municipios"],
    ca: ["Sí, excepte a 2 municipis", "No, excepte a 1 municipi", "Sí, excepte a 21 municipis"],
    en: ["Yes, except in 2 towns", "No, except in 1 town", "Yes, except in 21 towns"],
  } as const;
  for (const locale of LOCALES) {
    const blocks = SHOPS_SPAIN_DECEMBER.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[];
    const row = blocks.find((b) => b.type === "table")!.rows!.find((r) => /^(Cataluña|Catalunya|Catalonia)$/.test(r[0]!))!;
    assert.deepEqual(
      row.slice(1, 4),
      expected[locale].map((detail) => `[${CATALONIA_DEPENDS[locale]}](${townSearchHref(locale)}) (${detail})`),
      locale,
    );
  }
});
