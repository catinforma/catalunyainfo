import assert from "node:assert/strict";
import { test } from "node:test";

import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { christmasFairsThisWeekend } from "../src/lib/programmatic/weekend/christmas-weekend.ts";
import { electionWeekendNote } from "../src/lib/programmatic/weekend/election-note.ts";
import { listedFairs } from "../src/lib/programmatic/weekend/data.ts";

/**
 * Weekend of Fri 27 - Sun 29 Nov 2026 (24 Nov re-read by 1 Dec): Sunday 29 is
 * the general election, so the weekend pages carry a notice linking the
 * election guide; the window is the same from Thu 26 to Sun 29, the Christmas
 * fairs of Canyelles and Maçanet are listed, and the notice is gone the
 * weekend after.
 */

test("window and notice are the same on 26, 27, 28 and 29 Nov", () => {
  for (const today of ["2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]) {
    const w = weekendWindow(today);
    assert.deepEqual([w.from, w.to, w.long], ["2026-11-27", "2026-11-29", false], today);
    for (const locale of ["ca", "es", "en"] as const) {
      const note = electionWeekendNote(w, locale);
      assert.ok(note, `${today} ${locale}`);
      assert.match(note.text, /29/);
      assert.match(note.text, /9[.:]00/);
      assert.doesNotMatch(note.text + note.linkLabel, /undefined|null|NaN/);
    }
  }
  assert.equal(electionWeekendNote(weekendWindow("2026-11-26"), "ca")?.href, "/ca/eleccions/");
  assert.equal(electionWeekendNote(weekendWindow("2026-11-26"), "es")?.href, "/es/elecciones/");
  assert.equal(electionWeekendNote(weekendWindow("2026-11-26"), "en")?.href, "/en/elections/");
});

test("no election notice on the weekends before and after", () => {
  assert.equal(electionWeekendNote(weekendWindow("2026-11-20"), "ca"), null);
  assert.equal(electionWeekendNote(weekendWindow("2026-12-04"), "es"), null);
  assert.equal(electionWeekendNote(weekendWindow("2026-12-05"), "en"), null);
});

test("Canyelles and Maçanet Christmas fairs are listed on 28 and 29 Nov", () => {
  for (const today of ["2026-11-27", "2026-11-28", "2026-11-29"]) {
    const w = weekendWindow(today);
    const towns = christmasFairsThisWeekend(w, today, "ca").map((t) => t.town);
    assert.ok(towns.some((t) => /Canyelles/.test(t)), `${today}: Canyelles in ${towns.join(", ")}`);
    assert.ok(towns.some((t) => /Maçanet/.test(t)), `${today}: Maçanet`);
  }
  assert.ok(listedFairs(null, weekendWindow("2026-11-28")).now.length > 0);
});
