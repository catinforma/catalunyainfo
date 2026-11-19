import assert from "node:assert/strict";
import { test } from "node:test";

import { anyWordTsQuery } from "../src/lib/content/search-query.ts";
import { allShortcutHrefs, calculatorShortcutIds, normalise, searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CALCULATOR_IDS } from "../src/lib/programmatic/calculators/paths.ts";
import { checkPath } from "../src/lib/programmatic/lottery-check/paths.ts";

/**
 * The site search's direct pages (17 Nov 2026), from the queries visitors
 * typed in the 28 days before (GA4 site search). Each case: the first link
 * the visitor sees.
 */

const first = (locale: "ca" | "es" | "en", q: string) => searchShortcuts(locale, q)[0]?.href;

test("town holiday queries open the town's page, including towns without 2026 days", () => {
  assert.equal(first("ca", "festiu local de monistrol de montserrat 2027"), "/ca/festius/monistrol-de-montserrat/");
  assert.equal(first("ca", "monistrol de montserrat"), "/ca/festius/monistrol-de-montserrat/");
  assert.equal(first("es", "festivos adicionales Tona"), "/es/festivos/tona/");
  assert.equal(first("ca", "Terrassa"), "/ca/festius/terrassa/");
  assert.equal(first("es", "festivos girona 2027"), "/es/festivos/girona/");
  // "montserrat" alone is the mountain, not Monistrol.
  assert.equal(first("ca", "Montserrat"), "/ca/escapades/montserrat-per-lliure-des-barcelona/");
  // A short name only matches when it is all the query says.
  assert.ok(!searchShortcuts("ca", "festes de les Santes").some((s) => s.href === "/ca/festius/les/"));
  assert.equal(first("ca", "festius les"), "/ca/festius/les/");
});

test("networks and transport: the operator's page first", () => {
  assert.equal(first("ca", "metro barcelona"), "/ca/guies/horaris-metro-barcelona/");
  assert.equal(first("es", "metro barcelona"), "/es/guias/horarios-metro-barcelona/");
  assert.equal(first("ca", "tmb"), "/ca/guies/horaris-metro-barcelona/");
  assert.equal(first("ca", "FGC"), "/ca/guies/targetes-transport-barcelona/");
  assert.equal(first("ca", "rodalies demà"), "/ca/rodalies/");
  assert.equal(first("es", "rodalies mañana"), "/es/rodalies/");
  assert.equal(first("en", "rodalies"), "/en/rodalies/");
});

test("places: the holiday page, then the day trip and the weekend page", () => {
  const sitges = searchShortcuts("ca", "sitges").map((s) => s.href);
  assert.deepEqual(sitges.slice(0, 2), ["/ca/festius/sitges/", "/ca/escapades/sitges-des-de-barcelona-tren/"]);
  const girona = searchShortcuts("es", "girona").map((s) => s.href);
  assert.ok(girona.includes("/es/escapadas/girona-desde-barcelona-tren/"), girona.join());
  assert.ok(girona.includes("/es/fin-de-semana/girona/"), girona.join());
  // Spain 2027 cities.
  assert.equal(first("es", "Cádiz"), "/es/festivos/2027/andalucia/cadiz/");
});

test("farmers' markets: the official-list guide", () => {
  assert.equal(first("ca", "mercats de pagès de Catalunya"), "/ca/guies/mercats-de-pages-venda-proximitat/");
  assert.equal(first("ca", "mercats agraris de Catalunya"), "/ca/guies/mercats-de-pages-venda-proximitat/");
  assert.equal(first("es", "venta directa"), "/es/guias/mercados-payeses-venta-proximidad-cataluna/");
});

test("calculators by name", () => {
  assert.equal(first("es", "sueldo neto"), "/es/calculadoras/sueldo-neto/");
  assert.equal(first("ca", "euríbor"), "/ca/calculadores/euribor-avui/");
  assert.equal(first("es", "finiquito"), "/es/calculadoras/finiquito/");
  assert.equal(first("es", "subsidio de paro"), "/es/calculadoras/subsidio-desempleo/");
  assert.equal(first("ca", "baixa laboral"), "/ca/calculadores/baixa-laboral/");
  assert.equal(first("es", "ITP"), "/es/calculadoras/impuestos-compra-vivienda/");
  assert.ok(searchShortcuts("es", "hacienda lotería").some((s) => s.href === "/es/calculadoras/premios-loteria/"));
});

test("every calculator of the registry can be found by name (19 Nov 2026: seven were missing)", () => {
  assert.deepEqual(calculatorShortcutIds().sort(), [...CALCULATOR_IDS].sort());
});

test("lottery queries open the Christmas lottery checker first", () => {
  assert.equal(first("es", "comprobar lotería"), checkPath("es"));
  assert.equal(first("ca", "loteria de Nadal"), checkPath("ca"));
  assert.equal(first("en", "christmas lottery"), checkPath("en"));
  assert.ok(searchShortcuts("es", "décimo").some((s) => s.href === "/es/calculadoras/premios-loteria/"));
});

test("nothing for empty or unrelated queries", () => {
  assert.deepEqual(searchShortcuts("ca", ""), []);
  assert.deepEqual(searchShortcuts("ca", "x"), []);
  assert.deepEqual(searchShortcuts("es", "donde dormir"), []);
});

test("curated paths are site paths in their own locale", () => {
  for (const href of allShortcutHrefs()) {
    assert.match(href, /^\/(ca|es|en)\/[a-z0-9/-]+\/$/, href);
  }
});

test("normalise and the any-word fallback", () => {
  assert.equal(normalise("  Festiu local de Monistrol! "), "festiu local de monistrol");
  assert.equal(normalise("L'Hospitalet"), "l hospitalet");
  assert.equal(anyWordTsQuery("mercats agraris de Catalunya"), "mercats | agraris | de | catalunya");
  assert.equal(anyWordTsQuery("Cádiz"), "cádiz");
  assert.equal(anyWordTsQuery("'); drop table x; --"), "drop | table");
  assert.equal(anyWordTsQuery("!!"), null);
});
