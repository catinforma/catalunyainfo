import assert from "node:assert/strict";
import { test } from "node:test";

import { FAIRS as CHRISTMAS_FAIRS } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { ORGANISER_FAIRS } from "../src/lib/programmatic/christmas-fairs/organisers.ts";
import { attribution, correctionNote } from "../src/lib/programmatic/weekend/copy.ts";
import { FAIR_CORRECTIONS, applyFairCorrections, type CalendarCorrection } from "../src/lib/programmatic/weekend/corrections.ts";
import { FAIRS, SNAPSHOT, fairsIn, fairsInWindow, listedFairs } from "../src/lib/programmatic/weekend/data.ts";
import { fairEvents } from "../src/lib/programmatic/weekend/structured.ts";
import type { SnapshotFair } from "../src/lib/programmatic/weekend/types.ts";
import { zoneById } from "../src/lib/programmatic/weekend/zones.ts";

const CANYELLES = "24033377";
const CANYELLES_PAGE = "https://www.canyelles.cat/promocio-economica-i-turisme/la-fira-de-santa-llucia";

const fair = (id: string, start: string, end: string, name = `Fira ${id}`): SnapshotFair => ({
  id,
  name,
  town: "Canyelles",
  ine: "08043",
  comarca: "17",
  province: "08",
  start,
  end,
  sector: "Artesania",
  sectorEs: "Artesanía",
  web: "https://www.canyelles.cat/",
  toConfirm: false,
});

const correction = (id: string, start: string, end: string): CalendarCorrection => ({
  id,
  start,
  end,
  url: "https://example.cat/fira",
  publisher: "Ajuntament d'Exemple",
  readOn: "2026-10-30",
  quote: "La fira se celebra…",
});

test("applyFairCorrections: the organiser's dates win, the calendar's are kept, the list is re-sorted", () => {
  const fairs = [fair("a", "2026-11-14", "2026-11-15"), fair("b", "2026-11-28", "2026-11-29"), fair("c", "2026-12-05", "2026-12-06")];
  const out = applyFairCorrections(fairs, [correction("b", "2026-11-07", "2026-11-08")], "2026-10-28");
  assert.deepEqual(
    out.map((f) => f.id),
    ["b", "a", "c"],
  );
  const b = out[0]!;
  assert.equal(b.start, "2026-11-07");
  assert.equal(b.end, "2026-11-08");
  assert.equal(b.web, "https://example.cat/fira");
  assert.deepEqual(b.corrected, {
    start: "2026-11-28",
    end: "2026-11-29",
    url: "https://example.cat/fira",
    publisher: "Ajuntament d'Exemple",
    readOn: "2026-10-30",
    quote: "La fira se celebra…",
  });
  // Rows without a correction are returned untouched.
  assert.equal(out[1], fairs[0]);
  // The input is not mutated.
  assert.equal(fairs[1]!.start, "2026-11-28");
});

test("applyFairCorrections: a correction the calendar already agrees with is a no-op; one moved into the past drops out", () => {
  const fairs = [fair("a", "2026-11-14", "2026-11-15")];
  const same = applyFairCorrections(fairs, [correction("a", "2026-11-14", "2026-11-15")], "2026-10-28");
  assert.equal(same[0], fairs[0]);
  assert.equal(same[0]!.corrected, undefined);
  assert.deepEqual(applyFairCorrections(fairs, [correction("a", "2026-10-20", "2026-10-21")], "2026-10-28"), []);
  // A correction for a row the calendar no longer carries changes nothing.
  assert.deepEqual(applyFairCorrections(fairs, [correction("zzz", "2026-11-01", "2026-11-01")], "2026-10-28"), fairs);
});

test("corrections: reused from the Christmas family's organiser list, one per calendar row, all from an organiser's page", () => {
  const fromChristmas = ORGANISER_FAIRS.filter((o) => o.replaces?.startsWith("vm32:"));
  assert.ok(fromChristmas.length >= 1);
  for (const o of fromChristmas) {
    const c = FAIR_CORRECTIONS.find((x) => x.id === o.replaces!.slice(5));
    assert.ok(c, o.id);
    assert.equal(c.start, o.start);
    assert.equal(c.end, o.end);
    assert.equal(c.url, o.url);
  }
  assert.equal(new Set(FAIR_CORRECTIONS.map((c) => c.id)).size, FAIR_CORRECTIONS.length, "one correction per row");
  for (const c of FAIR_CORRECTIONS) {
    assert.match(c.id, /^\d+$/);
    assert.match(c.url, /^https:\/\//);
    assert.match(c.readOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(c.start <= c.end);
    assert.ok(c.quote.length > 20, "the sentence that gives the dates");
  }
});

test("Canyelles: the calendar says 28-29 Nov, the council 21-22 Nov 2026; the weekend pages show the council's", () => {
  const raw = SNAPSHOT.fairs.find((f) => f.id === CANYELLES);
  assert.ok(raw, "row 24033377 is in the weekend snapshot");
  assert.equal(raw.start, "2026-11-28");
  assert.equal(raw.end, "2026-11-29");

  const shown = FAIRS.find((f) => f.id === CANYELLES);
  assert.ok(shown);
  assert.equal(shown.start, "2026-11-21");
  assert.equal(shown.end, "2026-11-22");
  assert.equal(shown.web, CANYELLES_PAGE);
  assert.equal(shown.corrected?.start, "2026-11-28");
  assert.equal(shown.corrected?.publisher, "Ajuntament de Canyelles");

  // Same dates as the Christmas fairs family.
  const christmas = CHRISTMAS_FAIRS.find((f) => f.id === `vm32:${CANYELLES}`);
  assert.equal(christmas?.start, shown.start);
  assert.equal(christmas?.end, shown.end);

  // Still in date order after the move.
  for (let i = 1; i < FAIRS.length; i++) assert.ok(FAIRS[i - 1]!.start <= FAIRS[i]!.start, `${FAIRS[i]!.name} out of order`);

  // On the weekend of 20-22 Nov it is listed; on 27-29 Nov it is not.
  const barcelona = fairsIn(zoneById("provincia-barcelona"));
  assert.ok(fairsInWindow(barcelona, { from: "2026-11-20", to: "2026-11-22" }).some((f) => f.id === CANYELLES));
  assert.ok(!fairsInWindow(barcelona, { from: "2026-11-27", to: "2026-11-29" }).some((f) => f.id === CANYELLES));
});

test("Canyelles: the Event markup carries the council's dates and page", () => {
  const listed = listedFairs(null, { from: "2026-11-20", to: "2026-11-22" });
  assert.ok(listed.now.some((f) => f.id === CANYELLES));
  const event = fairEvents(listed, "/ca/cap-de-setmana/", "ca").find((e) => String(e["@id"]).endsWith(`#event-${CANYELLES}`));
  assert.ok(event, "Canyelles is marked up");
  assert.equal(event.startDate, "2026-11-21");
  assert.equal(event.endDate, "2026-11-22");
  assert.equal(event.url, CANYELLES_PAGE);
  // Not listed the weekend the calendar gives, so no Event there.
  const later = listedFairs(null, { from: "2026-11-27", to: "2026-11-29" });
  assert.ok(!later.now.some((f) => f.id === CANYELLES));
});

test("the corrected fair says whose dates it shows and what the calendar gives; the attribution says so too", () => {
  const shown = FAIRS.find((f) => f.id === CANYELLES)!;
  assert.equal(
    correctionNote(shown, "ca"),
    "Dates del web de l'organitzador (Ajuntament de Canyelles); el calendari de fires de la Generalitat diu 28 de novembre – 29 de novembre.",
  );
  assert.equal(
    correctionNote(shown, "es"),
    "Fechas de la web del organizador (Ajuntament de Canyelles); el calendario de ferias de la Generalitat dice 28 de noviembre – 29 de noviembre.",
  );
  assert.equal(correctionNote(fair("x", "2026-11-01", "2026-11-01"), "ca"), null);
  assert.match(attribution("ca", { agenda: "1", fairs: "2" }), /tret de quan el web oficial de l'organitzador dona unes altres dates/);
  assert.match(attribution("es", { agenda: "1", fairs: "2" }), /salvo cuando la web oficial del organizador da otras fechas/);
});
