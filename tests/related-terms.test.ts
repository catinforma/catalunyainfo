import assert from "node:assert/strict";
import { test } from "node:test";

import { relatedTerms } from "../src/lib/content/related-terms.ts";

test("keeps the subject words and drops what every page shares", () => {
  assert.deepEqual(
    relatedTerms("Horarios del metro de Barcelona: a qué hora abre y cierra en 2026"),
    ["metro"],
  );
});

test("what the reader asks (hours, prices, tickets) is not a subject", () => {
  assert.deepEqual(relatedTerms("Ski resorts in Catalonia 2026-27: lift passes and runs"), ["ski", "resorts", "lift", "runs"]);
  assert.deepEqual(relatedTerms("Zoo y Aquarium de Barcelona: horario y precio de entradas"), ["zoo", "aquarium"]);
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

test("Catalan three-letter function words never become terms", () => {
  assert.deepEqual(relatedTerms("Cap d'Any a Barcelona: com arribar-hi i què fer"), []);
  assert.deepEqual(relatedTerms("Revetlla de Cap d'Any", "Com i des d'on veure-la, pel centre i als barris"), ["revetlla", "veure", "centre", "barris"]);
});
