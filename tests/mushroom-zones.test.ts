import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, blockSchema } from "../src/lib/content/blocks.ts";
import { assertZoneSafe, ZoneGuardError } from "../src/lib/content/mushroom-zones/guard.ts";
import { MUSHROOM_ZONES, zonesFor } from "../src/lib/content/mushroom-zones/registry.ts";
import type { MushroomZone, ZoneEdition } from "../src/lib/content/mushroom-zones/types.ts";

/**
 * The guard is the only thing standing between a well-meaning editorial
 * package and a page that sends strangers to a specific patch of someone's
 * woodland. These tests are what keep it able to say no.
 *
 * Each case is a sentence somebody would plausibly write in good faith.
 */

const MASTER = {
  ca: "natura/bolets-catalunya-condicions",
  es: "naturaleza/setas-cataluna-condiciones",
  en: "nature/mushroom-season-catalonia",
};

function edition(overrides: Partial<ZoneEdition> = {}): ZoneEdition {
  return {
    path: "natura/bolets-vall-den-bas",
    title: "Bolets a la Vall d'en Bas",
    seoTitle: "Bolets a la Vall d'en Bas: condicions",
    seoDescription: "Condicions per als bolets a la Vall d'en Bas.",
    excerpt: "Com estan les condicions a la Vall d'en Bas.",
    lead: ["Les condicions d'aquesta setmana a la Vall d'en Bas."],
    situationHeading: "Situació",
    situation: ["Les pluges recents han deixat el sòl humit."],
    weatherHeading: "Meteorologia",
    weather: ["Pluja acumulada dels darrers quinze dies segons el servei oficial."],
    habitatHeading: "Hàbitat",
    habitat: ["Fagedes i pinedes entre 500 i 1.200 metres."],
    rulesHeading: "Normativa",
    rules: ["Consulteu les ordenances municipals abans d'anar-hi."],
    safetyHeading: "Seguretat",
    safety: ["No consumiu res sense identificació d'un professional."],
    territoryHeading: "El territori",
    territory: ["La vall se situa a la Garrotxa."],
    masterLinkLine: `Consulteu el [part general de Catalunya](/ca/${MASTER.ca}/).`,
    ...overrides,
  };
}

function zone(overrides: Partial<MushroomZone> = {}): MushroomZone {
  return {
    key: "vall-den-bas",
    entryKey: "mushroom-zone-vall-den-bas",
    areaName: "Vall d'en Bas",
    comarca: "Garrotxa",
    categoryKey: "nature",
    sources: [
      { name: "Servei Meteorològic de Catalunya", url: "https://www.meteo.cat/", publisher: "Meteocat" },
    ],
    verifiedAt: "2026-09-29",
    publishedAt: "2026-09-29T10:00:00+02:00",
    editions: { ca: edition() },
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* The registry ships empty                                                   */
/* -------------------------------------------------------------------------- */

test("the zone registry is empty until an editorial package fills it", () => {
  // Architecture, not content. A stub URL here would be a thin page in the
  // sitemap, which is the exact failure that got version 1 rejected.
  assert.equal(MUSHROOM_ZONES.length, 0);
  assert.deepEqual(zonesFor("ca"), []);
});

/* -------------------------------------------------------------------------- */
/* What the guard refuses                                                     */
/* -------------------------------------------------------------------------- */

test("a valid zone passes", () => {
  assert.doesNotThrow(() => assertZoneSafe(zone(), MASTER));
});

test("coordinates are refused, in every notation", () => {
  for (const text of [
    "El punt és a 42.1234, 2.4567.",
    "Coordenades: 42° 07' N.",
    "Referència 4658123 N.",
    "Mira-ho a https://maps.app.goo.gl/abc123",
  ]) {
    assert.throws(
      () => assertZoneSafe(zone({ editions: { ca: edition({ territory: [text] }) } }), MASTER),
      ZoneGuardError,
      text,
    );
  }
});

test("claiming mushrooms are present is refused", () => {
  for (const text of [
    "Aquesta setmana hi ha bolets a la vall.",
    "Esta semana hay setas en el valle.",
    "There are mushrooms in the beech woods.",
  ]) {
    assert.throws(
      () => assertZoneSafe(zone({ editions: { ca: edition({ situation: [text] }) } }), MASTER),
      ZoneGuardError,
      text,
    );
  }
});

test("promising a result is refused", () => {
  for (const text of [
    "Hi trobaràs rovellons després de la pluja.",
    "Encontrarás níscalos en la zona alta.",
    "You will find plenty after the rain.",
    "Resultat garantit.",
  ]) {
    assert.throws(
      () => assertZoneSafe(zone({ editions: { ca: edition({ lead: [text] }) } }), MASTER),
      ZoneGuardError,
      text,
    );
  }
});

test("picking directions and secret spots are refused", () => {
  for (const text of [
    "El millor lloc per collir és passat el pont.",
    "Un punt secret conegut pels locals.",
    "Donde recoger sin gente.",
  ]) {
    assert.throws(
      () => assertZoneSafe(zone({ editions: { ca: edition({ habitat: [text] }) } }), MASTER),
      ZoneGuardError,
      text,
    );
  }
});

test("accents and casing do not smuggle a banned phrase through", () => {
  assert.throws(
    () =>
      assertZoneSafe(
        zone({ editions: { ca: edition({ situation: ["HI HA BOLETS a la solana."] }) } }),
        MASTER,
      ),
    ZoneGuardError,
  );
});

test("describing conditions rather than presence is allowed", () => {
  assert.doesNotThrow(() =>
    assertZoneSafe(
      zone({
        editions: {
          ca: edition({
            situation: [
              "Les condicions són favorables: humitat al sòl i temperatures suaus.",
              "Això no vol dir que hi hagi fructificació.",
            ],
          }),
        },
      }),
      MASTER,
    ),
  );
});

/* -------------------------------------------------------------------------- */
/* Structural requirements                                                    */
/* -------------------------------------------------------------------------- */

test("a zone with no sources is refused", () => {
  assert.throws(() => assertZoneSafe(zone({ sources: [] }), MASTER), ZoneGuardError);
});

test("a source that is not https is refused", () => {
  assert.throws(
    () =>
      assertZoneSafe(
        zone({ sources: [{ name: "x", url: "http://example.com/" }] }),
        MASTER,
      ),
    ZoneGuardError,
  );
});

test("a missing or malformed verification date is refused", () => {
  assert.throws(() => assertZoneSafe(zone({ verifiedAt: "setembre 2026" }), MASTER), ZoneGuardError);
});

test("an edition that does not link back to the master is refused", () => {
  assert.throws(
    () =>
      assertZoneSafe(
        zone({ editions: { ca: edition({ masterLinkLine: "Consulteu el part general." }) } }),
        MASTER,
      ),
    ZoneGuardError,
  );
});

test("a year in the slug is refused: zone URLs are evergreen", () => {
  assert.throws(
    () =>
      assertZoneSafe(
        zone({ editions: { ca: edition({ path: "natura/bolets-vall-den-bas-2026" }) } }),
        MASTER,
      ),
    ZoneGuardError,
  );
});

test("a locale with no master report is refused, so no zone is orphaned", () => {
  assert.throws(
    () => assertZoneSafe(zone({ editions: { ca: edition() } }), { es: MASTER.es }),
    ZoneGuardError,
  );
});

/* -------------------------------------------------------------------------- */
/* The conditions block cannot carry a location                               */
/* -------------------------------------------------------------------------- */

test("the conditions block validates with named areas and a source", () => {
  const block = {
    type: "conditionsMap" as const,
    title: "Condicions per comarques",
    legend: [
      { level: "favourable" as const, label: "Favorables" },
      { level: "limiting" as const, label: "Limitants" },
    ],
    areas: [
      { name: "Garrotxa", level: "favourable" as const, note: "42 mm en quinze dies" },
      { name: "Segrià", level: "limiting" as const },
    ],
    source: { name: "Meteocat", url: "https://www.meteo.cat/" },
    verifiedAt: "2026-09-29",
  };
  assert.ok(blockSchema.safeParse(block).success);
  assert.ok(bodySchema.safeParse([block]).success);
});

test("the conditions block rejects an unknown condition level", () => {
  const block = {
    type: "conditionsMap",
    title: "x",
    legend: [
      { level: "favourable", label: "a" },
      { level: "limiting", label: "b" },
    ],
    // "abundant" would be a claim about mushrooms, not about conditions.
    areas: [{ name: "Garrotxa", level: "abundant" }],
    source: { name: "Meteocat", url: "https://www.meteo.cat/" },
    verifiedAt: "2026-09-29",
  };
  assert.equal(blockSchema.safeParse(block).success, false);
});

test("the conditions block requires a source and a verification date", () => {
  const base = {
    type: "conditionsMap",
    title: "x",
    legend: [
      { level: "favourable", label: "a" },
      { level: "limiting", label: "b" },
    ],
    areas: [{ name: "Garrotxa", level: "favourable" }],
  };
  assert.equal(blockSchema.safeParse(base).success, false);
  assert.equal(
    blockSchema.safeParse({ ...base, source: { name: "m", url: "https://www.meteo.cat/" } }).success,
    false,
  );
});

test("an area link must be a site path, not an arbitrary URL", () => {
  const withExternal = {
    type: "conditionsMap",
    title: "x",
    legend: [
      { level: "favourable", label: "a" },
      { level: "limiting", label: "b" },
    ],
    areas: [
      { name: "Garrotxa", level: "favourable", href: "https://maps.google.com/?q=42.1,2.4" },
    ],
    source: { name: "m", url: "https://www.meteo.cat/" },
    verifiedAt: "2026-09-29",
  };
  assert.equal(blockSchema.safeParse(withExternal).success, false);
});
