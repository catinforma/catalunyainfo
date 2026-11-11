import assert from "node:assert/strict";
import { test } from "node:test";

import { placesPhrase } from "../src/lib/programmatic/holidays/places.ts";
import type { DatePlace } from "../src/lib/programmatic/holidays/types.ts";

const town = (name: string): DatePlace => ({ name, parent: null, slug: name }) as DatePlace;
const village = (name: string, parent: string): DatePlace => ({ name, parent, slug: parent }) as DatePlace;

test("the date pages never count zero towns ('0 municipis i 1 nucli', 5 January 2027)", () => {
  const onlyVillage = [village("Vistabella", "la Secuita")];
  assert.equal(placesPhrase(onlyVillage, "ca"), "1 nucli");
  assert.equal(placesPhrase(onlyVillage, "es"), "1 núcleo");
  assert.equal(placesPhrase(onlyVillage, "en"), "1 village");
  const mixed = [town("Reus"), town("Valls"), village("Vistabella", "la Secuita")];
  assert.equal(placesPhrase(mixed, "ca"), "2 municipis i 1 nucli");
  assert.equal(placesPhrase(mixed, "es"), "2 municipios y 1 núcleo");
  assert.equal(placesPhrase(mixed, "en"), "2 towns and 1 village");
  assert.equal(placesPhrase([town("Reus")], "ca"), "1 municipi");
});
