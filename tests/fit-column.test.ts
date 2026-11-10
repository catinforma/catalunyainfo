import assert from "node:assert/strict";
import { test } from "node:test";

import { fitColumn } from "../src/lib/content/fit-column.ts";

test("fitColumn keeps short values and cuts long ones to the varchar(240) limit at a word", () => {
  assert.equal(fitColumn("BOE-A-2026-21254"), "BOE-A-2026-21254");
  const long =
    "Resolución de 17 de marzo de 2026, por la que se establece el calendario escolar y se dictan instrucciones para la organización y desarrollo de las actividades de comienzo y finalización del curso 2026-2027, para los centros de enseñanzas no universitarias de la Comunidad Autónoma de Canarias";
  const out = fitColumn(long);
  assert.ok(out.length <= 240, `length ${out.length}`);
  assert.ok(out.endsWith("…"));
  assert.ok(long.startsWith(out.slice(0, -1)));
  assert.ok(!/[\s,]…$/.test(out));
});
