import assert from "node:assert/strict";
import { test } from "node:test";

import { LOCALES } from "../src/lib/i18n/config.ts";
import { buildElectionPage } from "../src/lib/programmatic/elections/model.ts";
import { DESCRIPTION_LIMIT, TITLE_LIMIT, electionDescription, electionTitle, municipalitiesFor } from "../src/lib/programmatic/elections/pages.ts";
import { INE_MESA_URL, POLLING, buildPolling, pollingFor, sectionRanges, tableCount } from "../src/lib/programmatic/elections/polling.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

const bySlug = (slug: string) => SNAPSHOT.municipalities.find((m) => m.slug === slug)!;
const iso = (d: string) => d;

/**
 * What the four provincial lists contain, counted by `scripts/elections-polling-places.py`
 * and cross-checked on 3 Nov 2026 by a second, independent count of the PDFs: the
 * bulletins print no totals. Barcelona: 6,514 eight-digit polling-place codes, one
 * per table (BOPB 12 Oct). Girona: 894 INE codes in the 27 Oct republication.
 * Lleida: 562 postcodes (BOPL 12 Oct). Tarragona: 1,072 province-43 rows (BOPT 12 Oct;
 * the 23 Oct notice replaces Albinyana and Tivissa with the same number of tables).
 */
const BOP_TOTALS = {
  "08": { municipalities: 311, places: 1636, sections: 3661, tables: 6514 },
  "17": { municipalities: 221, places: 386, sections: 545, tables: 894 },
  "25": { municipalities: 231, places: 313, sections: 388, tables: 562 },
  "43": { municipalities: 184, places: 360, sections: 570, tables: 1072 },
} as const;

test("every entry resolves to a real municipality and every municipality has an entry", () => {
  const codes = new Set(SNAPSHOT.municipalities.map((m) => m.code));
  assert.equal(codes.size, 947);
  for (const code of Object.keys(POLLING.municipalities)) assert.ok(codes.has(code), `${code} is not a municipality of the election snapshot`);
  for (const code of codes) assert.ok(pollingFor(code), `${code} has no polling places`);
  assert.deepEqual(POLLING.gaps, []);
});

test("every polling place has a name, an address and a listed BOP source", () => {
  const ids = new Set(POLLING.sources.map((s) => s.id));
  for (const s of POLLING.sources) {
    assert.match(s.url, /^https:\/\//, s.id);
    assert.match(s.pdf, /^https:\/\//, s.id);
    assert.match(s.date, /^2026-\d\d-\d\d$/, s.id);
    assert.match(s.sha256, /^[0-9a-f]{64}$/, s.id);
    assert.ok(s.title && s.ref && s.publisher, s.id);
  }
  for (const [code, m] of Object.entries(POLLING.municipalities)) {
    assert.ok(ids.has(m.source), `${code}: source ${m.source}`);
    assert.equal(POLLING.sources.find((s) => s.id === m.source)!.province, code.slice(0, 2), `${code}: source of its own province`);
    assert.ok(m.places.length > 0, code);
    for (const p of m.places) {
      assert.ok(p.name.trim() && p.address.trim(), `${code}: ${p.name}`);
      assert.ok(p.tables.length > 0, `${code}: ${p.name}`);
    }
  }
});

test("counts per province match the lists as parsed and as counted independently", () => {
  for (const [prov, expected] of Object.entries(BOP_TOTALS)) {
    const entries = Object.entries(POLLING.municipalities).filter(([code]) => code.startsWith(prov));
    assert.equal(entries.length, expected.municipalities, `${prov} municipalities`);
    assert.equal(
      entries.reduce((n, [, m]) => n + m.places.length, 0),
      expected.places,
      `${prov} places`,
    );
    assert.equal(
      entries.reduce((n, [, m]) => n + m.sections, 0),
      expected.sections,
      `${prov} sections`,
    );
    assert.equal(
      entries.reduce((n, [, m]) => n + tableCount(m), 0),
      expected.tables,
      `${prov} tables`,
    );
  }
});

test("each section's tables run A, B, C... and cover the surnames from A to Z without gaps", () => {
  for (const [code, m] of Object.entries(POLLING.municipalities)) {
    const sections = new Map<string, { table: string; from: string; to: string }[]>();
    for (const p of m.places) for (const t of p.tables) sections.set(`${t.district}-${t.section}`, [...(sections.get(`${t.district}-${t.section}`) ?? []), t]);
    assert.equal(sections.size, m.sections, `${code}: sections`);
    for (const [key, tables] of sections) {
      const letters = tables.map((t) => t.table).sort();
      assert.ok(letters.join("") === "U" || letters.every((l, i) => l === String.fromCharCode(65 + i)), `${code} ${key}: tables ${letters.join("")}`);
      // A section split in two parts restarts at A: the chain closes at Z one or more times.
      const ordered = [...tables].sort((a, b) => a.table.localeCompare(b.table));
      let expect = "A";
      for (const t of ordered) {
        if (t.from !== expect) expect = "A";
        assert.equal(t.from, expect, `${code} ${key} table ${t.table}`);
        expect = String.fromCharCode(t.to.charCodeAt(0) + 1);
        if (expect === "[") expect = "A";
      }
      assert.equal(expect, "A", `${code} ${key}: ends at Z`);
    }
  }
});

test("a table is listed once per municipality", () => {
  for (const [code, m] of Object.entries(POLLING.municipalities)) {
    const keys = m.places.flatMap((p) => p.tables.map((t) => `${t.district}-${t.section}-${t.table}`));
    assert.equal(new Set(keys).size, keys.length, code);
  }
});

test("Barcelona, a Lleida town and an Aran town, checked against the bulletins' text", () => {
  // Read from the PDFs on 3 Nov 2026.
  const bcn = pollingFor("08019")!;
  assert.equal(bcn.places.length, 299);
  assert.equal(bcn.sections, 1068);
  assert.equal(tableCount(bcn), 1688);
  const lleida = pollingFor("25120")!;
  assert.equal(lleida.places.length, 41);
  assert.equal(lleida.sections, 81);
  assert.equal(tableCount(lleida), 144);
  const roda = pollingFor("08183")!;
  assert.equal(roda.places[0]!.name, "VESTÍBUL TEATRE ELISEU");
  assert.equal(roda.places[0]!.address, "C BAC DE RODA 1 B, 08510 RODA DE TER, BARCELONA");
});

test("the page model: source cited, official lookup linked, no pending town, nothing invented", () => {
  for (const locale of LOCALES) {
    for (const m of municipalitiesFor(locale)) {
      const model = buildPolling(m, locale, iso);
      const entry = pollingFor(m.code)!;
      assert.equal(model.pending, null, `${locale}/${m.slug}`);
      assert.ok(model.source!.includes(POLLING.sources.find((s) => s.id === entry.source)!.url), `${locale}/${m.slug}: source link`);
      assert.ok(model.find.includes(INE_MESA_URL), `${locale}/${m.slug}: INE lookup`);
      assert.match(model.find, /tarjeta|targeta|census card/i);
      const places = model.groups!.flatMap((g) => g.places);
      // Every polling place is on the page once per group it is in, with its address.
      assert.ok(places.length >= entry.places.length, `${locale}/${m.slug}`);
      // The bulletin's address, untouched (Lleida's postcode column is appended).
      const shown = new Set(places.map((p) => p.address));
      for (const p of entry.places) assert.ok([...shown].some((a) => a === p.address || a === `${p.address}, ${p.postcode}`), `${locale}/${m.slug}: ${p.address}`);
      const page = buildElectionPage(m, locale);
      assert.equal(page.polling.title, model.title);
      assert.ok(page.faq.some((f) => f.question === model.faq.question));
    }
  }
});

test("big towns fold into one block per district; small ones are a plain list", () => {
  const bcn = buildPolling(bySlug("barcelona"), "ca", iso);
  assert.equal(bcn.groups!.length, 10, "ten districts");
  assert.ok(bcn.groups!.every((g) => g.label!.startsWith("Districte ")));
  assert.match(bcn.legend!, /intervals/);
  const small = buildPolling(bySlug("matadepera"), "es", iso);
  assert.equal(small.groups!.length, 1);
  assert.equal(small.groups![0]!.label, null);
  assert.match(small.legend!, /apellidos/);
  // Girona's list was republished on 27 Oct: the page says it replaces the 12 Oct one.
  assert.match(buildPolling(bySlug("girona"), "ca", iso).source!, /substitueix la relació publicada el 2026-10-12/);
  assert.doesNotMatch(buildPolling(bySlug("barcelona"), "ca", iso).source!, /substitueix/);
});

test("section ranges collapse contiguous runs only", () => {
  assert.equal(sectionRanges(["001", "002", "003", "007", "009", "010"]), "001–003, 007, 009–010");
  assert.equal(sectionRanges(["004"]), "004");
  assert.equal(sectionRanges(["010", "002", "001", "001"]), "001–002, 010");
});

test("titles and descriptions keep their limits and promise only what every town has", () => {
  for (const locale of LOCALES) {
    for (const m of municipalitiesFor(locale)) {
      assert.ok(electionTitle(locale, m).length <= TITLE_LIMIT, `${locale}/${m.slug}`);
      assert.ok(electionDescription(locale, m).length <= DESCRIPTION_LIMIT, `${locale}/${m.slug}`);
    }
  }
  assert.equal(electionTitle("es", bySlug("matadepera")), "Elecciones Matadepera: dónde votar el 29N y resultados 2023");
});
