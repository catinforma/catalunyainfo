import assert from "node:assert/strict";
import { test } from "node:test";

import { birthSpans, byContributionCopy, byContributionRows, cellLines, ordinaryAt65 } from "../src/lib/programmatic/retirement-age/by-contributions.ts";
import { ym, toMonths } from "../src/lib/programmatic/retirement-age/rules.ts";

/**
 * Batch 8R (27 Nov 2026, ci-edicio): the "age by years contributed at 65"
 * table applies the DT 7ª row of the year in which the age is REACHED (LGSS
 * art. 205.1.a + DT 7ª, BOE consolidated text "Última actualización
 * publicada el 25/11/2026", re-read 27 Nov 2026), not the year of the 65th
 * birthday. Engine cases for a birth late in 1961 and one in 1962.
 */

test("engine: 38 years at 65, born 1 Mar 1961 -> 65 y 3 m on 1 Jun 2026 under the 2026 row (38 y 3 m)", () => {
  const o = ordinaryAt65("1961-03-01", ym(38));
  assert.equal(o.date, "2026-06-01");
  assert.deepEqual(o.age, ym(65, 3));
  assert.equal(o.row.year, 2026);
  assert.equal(o.via, "65");
});

test("engine: 38 years at 65, born 1 Dec 1961 (turns 65 in Dec 2026) -> 38 y 3 m only on 1 Mar 2027, so the 2027 row: 65 y 6 m on 1 Jun 2027", () => {
  const o = ordinaryAt65("1961-12-01", ym(38));
  assert.equal(o.date, "2027-06-01");
  assert.deepEqual(o.age, ym(65, 6));
  assert.equal(o.row.year, 2027);
  assert.equal(o.contributed, toMonths(ym(38, 6)));
  // The last birth day still inside 2026 and the first one pushed into 2027.
  assert.equal(ordinaryAt65("1961-09-30", ym(38)).date, "2026-12-30");
  // Born 1 Oct 1961: 38 y 3 m would arrive on 1 Jan 2027, when 38 y 6 m are asked; those arrive on 1 Apr 2027.
  assert.equal(ordinaryAt65("1961-10-01", ym(38)).date, "2027-04-01");
  assert.equal(ordinaryAt65("1961-10-01", ym(38)).row.year, 2027);
});

test("engine: born 15 Dec 1962 -> always the final row (38 y 3 m at 65 -> 65 y 3 m; 38 y 6 m -> 65; 35 -> 67)", () => {
  const a = ordinaryAt65("1962-12-15", ym(38, 3));
  assert.equal(a.date, "2028-03-15");
  assert.deepEqual(a.age, ym(65, 3));
  assert.equal(a.row.year, 2027);
  assert.deepEqual(ordinaryAt65("1962-12-15", ym(38, 6)).age, ym(65));
  assert.deepEqual(ordinaryAt65("1962-12-15", ym(35)).age, ym(67));
  // A whole birth year after 1961 never splits.
  for (const at65 of [ym(35), ym(37), ym(38), ym(38, 3), ym(38, 6), ym(39), ym(40)]) assert.equal(birthSpans(1962, at65).length, 1);
});

test("table: the 38-year row splits on 1 Oct 1961 and every cell names its row, in ca/es/en", () => {
  const r38 = byContributionRows().find((r) => toMonths(r.at65) === toMonths(ym(38)))!;
  assert.deepEqual(
    r38.y2026.map((s) => [s.from, s.to]),
    [
      ["1961-01-01", "1961-09-30"],
      ["1961-10-01", "1961-12-31"],
    ],
  );
  assert.deepEqual(cellLines(r38.y2026, "es"), [
    "Nacidos del 1 de enero de 1961 al 30 de septiembre de 1961: 65 años y 3 meses, fila 2026 (la alcanzas en 2026)",
    "Nacidos del 1 de octubre de 1961 al 31 de diciembre de 1961: 65 años y 6 meses, fila «a partir del año 2027» (la alcanzas en 2027 o después)",
  ]);
  assert.deepEqual(cellLines(r38.y2026, "ca"), [
    "Nascuts de l'1 de gener de 1961 al 30 de setembre de 1961: 65 anys i 3 mesos, fila 2026 (l'assoleixes el 2026)",
    "Nascuts de l'1 d'octubre de 1961 al 31 de desembre de 1961: 65 anys i 6 mesos, fila «a partir de l'any 2027» (l'assoleixes el 2027 o després)",
  ]);
  assert.match(cellLines(r38.y2027, "en")[0]!, /^65 years and 6 months, "from 2027" row \(reached in 2027 or later\)$/);
  for (const l of ["es", "ca", "en"] as const) {
    for (const r of byContributionRows()) for (const line of [...cellLines(r.y2026, l), ...cellLines(r.y2027, l)]) assert.match(line, /2026|2027/);
  }
  assert.match(byContributionCopy("es").intro, /quien nació hasta el 30 de septiembre de 1961 se jubila a los 65 años y 3 meses dentro de 2026, pero quien nació desde el 1 de octubre de 1961 solo completaría 38 años y 3 meses en 2027, cuando ya se piden 38 años y 6 meses, y se jubila a los 65 años y 6 meses\./);
  assert.match(byContributionCopy("ca").intro, /qui va néixer fins al 30 de setembre de 1961 .* des de l'1 d'octubre de 1961/);
  assert.match(byContributionCopy("en").intro, /someone born from 1 October 1961 would only complete 38 years and 3 months in 2027/);
  assert.match(byContributionCopy("es").cols[1], /nacidos en 1961/);
});
