import assert from "node:assert/strict";
import { test } from "node:test";

import { relatedTerms } from "../src/lib/content/related-terms.ts";

test("keeps the subject words and drops what every page shares", () => {
  assert.deepEqual(
    relatedTerms("Horarios del metro de Barcelona: a qué hora abre y cierra en 2026"),
    ["horarios", "metro", "hora", "abre", "cierra"],
  );
});

test("title words come before excerpt words, without repeats, and stop at twelve", () => {
  const terms = relatedTerms("Tren a Sitges", "Sitges, trenes R2 Sud cada media hora desde Sants y Passeig de Gràcia, precio y horarios de vuelta");
  assert.equal(terms[0], "tren");
  assert.equal(terms[1], "sitges");
  assert.equal(terms.filter((t) => t === "sitges").length, 1);
  assert.ok(terms.length <= 12);
});

test("only letters and digits reach the tsquery", () => {
  for (const term of relatedTerms("L'Aeri de Montserrat | horaris & preus (2026) d'hivern!")) {
    assert.match(term, /^[\p{L}\p{N}]+$/u);
  }
  assert.deepEqual(relatedTerms(null, undefined, ""), []);
});
