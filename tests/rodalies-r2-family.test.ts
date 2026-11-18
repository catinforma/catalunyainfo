import assert from "node:assert/strict";
import { test } from "node:test";

import { LINES } from "../src/lib/programmatic/rodalies/data.ts";
import { R2_FAMILY, R2_WORKS, hubCopy, lineCopy, r2FamilyNote, r2SharedStations } from "../src/lib/programmatic/rodalies/copy.ts";
import { linePath } from "../src/lib/programmatic/rodalies/paths.ts";

/*
 * 18 Nov 2026 (position-loss diagnosis, docs/SEO_EXPERIMENTS.md): the three
 * R2 pages say which R2 they are and link the other two; the works notice
 * (Rodalies, Gavà-Castelldefels, 12 Nov-14 Dec 2026) must leave the pages
 * once it ends.
 */

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

test("R2 works notice: remove it (R2_WORKS and r2WorksLine) once the works end", () => {
  assert.ok(
    today <= R2_WORKS.until,
    `The Gavà-Castelldefels works ended on ${R2_WORKS.until}: re-read rodalies.gencat.cat and drop or update the works sentence in r2FamilyNote.`,
  );
});

test("each R2 line page links the other two R2 lines, in its own language", () => {
  for (const locale of ["ca", "es"] as const) {
    for (const id of R2_FAMILY) {
      const line = LINES.find((l) => l.id === id)!;
      const note = lineCopy(line, locale).familyNote;
      assert.ok(note, `${id} ${locale}: no family note`);
      for (const other of R2_FAMILY.filter((x) => x !== id)) {
        assert.ok(note.includes(`](${linePath(locale, other)})`), `${id} ${locale}: no link to ${other}`);
      }
      assert.ok(!note.includes(`](${linePath(locale, id)})`), `${id} ${locale}: links itself`);
      assert.ok(note.includes(R2_WORKS.url[locale]), `${id} ${locale}: works notice not linked in its language`);
    }
  }
});

test("other lines carry no R2 note; the English hub does", () => {
  const r1 = LINES.find((l) => l.id === "R1")!;
  assert.equal(lineCopy(r1, "es").familyNote, null);
  assert.equal(r2FamilyNote("R1", "ca"), null);
  const en = hubCopy("en").visitor.join("\n");
  assert.ok(en.includes("R2, R2 Nord or R2 Sud?"));
  assert.ok(!/\]\(\/(?:ca|es)\/rodalies\//.test(r2FamilyNote(null, "en")!), "the English note must not send readers to another edition");
});

test("the stations shared by the three R2 lines come from the snapshot", () => {
  const shared = r2SharedStations();
  assert.ok(shared.includes("Barcelona-Sants") && shared.includes("Barcelona-Passeig de Gràcia"), shared.join(", "));
  for (const id of R2_FAMILY) {
    const names = LINES.find((l) => l.id === id)!.stations.map((s) => s.name);
    for (const s of shared) assert.ok(names.includes(s), `${s} not on ${id}`);
  }
});
