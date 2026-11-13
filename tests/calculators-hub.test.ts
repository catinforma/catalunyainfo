import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_COPY, HUB_GROUPS, hubCards, hubCrumb } from "../src/lib/programmatic/calculators/hub.ts";
import {
  CALCULATORS,
  CALCULATORS_ROOT,
  CALCULATOR_IDS,
  CALC_LOCALES,
  calcEditions,
  calcPath,
  calculatorSlugs,
  calculatorsHubEditions,
  calculatorsHubPath,
} from "../src/lib/programmatic/calculators/paths.ts";
import { calculatorsHubSitemapEntries } from "../src/lib/programmatic/calculators/sitemap.ts";
import { MENU_PATHS, PRIMARY_ORDER } from "../src/lib/nav/menu.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * The calculators hub (/es/calculadoras/, /ca/calculadores/, /en/calculators/)
 * and the registry it lists (lib/programmatic/calculators/paths.ts).
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

test("registry: every calculator has a unique path per language, under the family root, with its route file", () => {
  const all = CALCULATORS.flatMap((c) => CALC_LOCALES.map((l) => calcPath(c.id, l)));
  assert.equal(new Set(all).size, CALCULATORS.length * 3);
  assert.equal(new Set(CALCULATOR_IDS).size, CALCULATOR_IDS.length);
  for (const id of CALCULATOR_IDS) {
    for (const l of CALC_LOCALES) {
      assert.equal(calcPath(id, l), `/${l}/${CALCULATORS_ROOT[l]}/${calculatorSlugs(id)[l]}/`);
      assert.ok(existsSync(join(APP, CALCULATORS_ROOT[l], calculatorSlugs(id)[l], "page.tsx")), `${id} (${l}): no route file`);
    }
  }
});

test("registry: the live URLs did not move (13 Nov 2026)", () => {
  assert.deepEqual(calcEditions("net-salary"), { ca: "/ca/calculadores/sou-net/", es: "/es/calculadoras/sueldo-neto/", en: "/en/calculators/net-salary-spain/" });
  assert.deepEqual(calcEditions("self-employed"), { ca: "/ca/calculadores/quota-autonoms/", es: "/es/calculadoras/cuota-autonomos/", en: "/en/calculators/spain-self-employed-contributions/" });
  assert.deepEqual(calcEditions("dismissal"), { ca: "/ca/calculadores/indemnitzacio-acomiadament/", es: "/es/calculadoras/indemnizacion-despido/", en: "/en/calculators/severance-pay-spain/" });
  assert.deepEqual(calcEditions("settlement"), { ca: "/ca/calculadores/quitanca-finiquito/", es: "/es/calculadoras/finiquito/", en: "/en/calculators/final-settlement-spain/" });
  assert.deepEqual(calcEditions("unemployment"), { ca: "/ca/calculadores/atur/", es: "/es/calculadoras/paro/", en: "/en/calculators/unemployment-benefit-spain/" });
  assert.deepEqual(calcEditions("unemployment-subsidy"), { ca: "/ca/calculadores/subsidi-atur/", es: "/es/calculadoras/subsidio-desempleo/", en: "/en/calculators/spain-unemployment-subsidy/" });
  assert.deepEqual(calcEditions("sick-leave"), { ca: "/ca/calculadores/baixa-laboral/", es: "/es/calculadoras/baja-laboral/", en: "/en/calculators/sick-leave-pay-spain/" });
  assert.deepEqual(calcEditions("rent-update"), { ca: "/ca/calculadores/actualitzar-lloguer/", es: "/es/calculadoras/actualizar-alquiler/", en: "/en/calculators/rent-increase-spain/" });
  assert.deepEqual(calcEditions("smi-2027"), { ca: "/ca/calculadores/salari-minim-2027/", es: "/es/calculadoras/salario-minimo-2027/", en: "/en/calculators/spain-minimum-wage-2027/" });
  assert.deepEqual(calcEditions("ipc"), { ca: "/ca/calculadores/ipc/", es: "/es/calculadoras/ipc/", en: "/en/calculators/spain-inflation-cpi/" });
  assert.deepEqual(calcEditions("treasury-bills"), { ca: "/ca/calculadores/lletres-del-tresor/", es: "/es/calculadoras/letras-del-tesoro/", en: "/en/calculators/spain-treasury-bills/" });
  assert.deepEqual(calcEditions("itv"), { ca: "/ca/calculadores/itv/", es: "/es/calculadoras/itv/", en: "/en/calculators/itv-spain/" });
  assert.deepEqual(calcEditions("home-purchase-tax"), { ca: "/ca/calculadores/impostos-compra-habitatge/", es: "/es/calculadoras/impuestos-compra-vivienda/", en: "/en/calculators/spain-home-purchase-taxes/" });
  assert.deepEqual(calcEditions("euribor"), { ca: "/ca/calculadores/euribor-avui/", es: "/es/calculadoras/euribor-hoy/", en: "/en/calculators/euribor-today/" });
  assert.deepEqual(calcEditions("mortgage"), { ca: "/ca/calculadores/hipoteca/", es: "/es/calculadoras/hipoteca/", en: "/en/calculators/mortgage-calculator-spain/" });
});

test("hub: the housing group holds the rent, mortgage, Euribor and home-purchase tax tools", () => {
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "housing")?.cards.map((c) => c.key), ["rent-update", "mortgage", "euribor", "home-purchase-tax"]);
});

test("hub: lists every calculator of the registry exactly once, linking its own editions", () => {
  const cards = hubCards().filter((c) => c.calculator);
  assert.deepEqual(cards.map((c) => c.key).sort(), [...CALCULATOR_IDS].sort());
  for (const card of cards) assert.deepEqual(card.href, calcEditions(card.key as (typeof CALCULATOR_IDS)[number]), card.key);
  const keys = hubCards().map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length, "a card appears twice");
});

test("hub: the six groups, each card complete in ca, es and en, linking indexable pages", () => {
  assert.deepEqual(HUB_GROUPS.map((g) => g.id), ["work", "housing", "official", "vehicle", "holidays", "live"]);
  // The vehicles group: the ITV calculator (lib/programmatic/itv).
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "vehicle")?.cards.map((c) => c.key), ["itv"]);
  // The official-figures group: the SMI, the CPI and the Letras del Tesoro reference pages.
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "official")?.cards.map((c) => c.key), ["smi-2027", "ipc", "treasury-bills"]);
  for (const g of HUB_GROUPS) {
    assert.ok(g.cards.length > 0, g.id);
    for (const l of CALC_LOCALES) assert.ok(g.title[l].trim(), `${g.id} (${l})`);
  }
  for (const card of hubCards()) {
    for (const l of CALC_LOCALES) {
      for (const field of [card.title, card.answers, card.basis]) assert.ok(field[l].trim().length > 0, `${card.key} (${l})`);
      const href = card.href[l];
      const lang = card.hrefLang?.[l] ?? l;
      assert.ok(href.startsWith(`/${lang}/`) && href.endsWith("/"), `${card.key} (${l}): ${href}`);
      assert.ok(!isLowDemandPath(href), `${card.key} (${l}): ${href} is noindex`);
    }
  }
  // The electricity price tool (lib/programmatic/pvpc) opens the live-data group.
  assert.equal(HUB_GROUPS.find((g) => g.id === "live")?.cards[0]?.key, "pvpc");
});

test("hub: one static route per language, a 404 in the others, never dynamicParams = false", () => {
  for (const l of CALC_LOCALES) {
    assert.equal(calculatorsHubPath(l), `/${l}/${CALCULATORS_ROOT[l]}/`);
    const src = readFileSync(join(APP, CALCULATORS_ROOT[l], "page.tsx"), "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<CalculatorsHubRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
});

test("hub: titles and descriptions fit the snippet, in every language", () => {
  for (const l of CALC_LOCALES) {
    const c = HUB_COPY[l];
    assert.ok(c.title.length <= 60, `${l} title: ${c.title.length}`);
    assert.ok(c.description.length <= 165, `${l} description: ${c.description.length}`);
    assert.equal(hubCrumb(l).href, calculatorsHubPath(l));
  }
});

test("sitemap and menu carry the hub", () => {
  const entries = calculatorsHubSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.calculatorsHubSitemapEntries\(\)/);
  assert.deepEqual(MENU_PATHS.calculators, calculatorsHubEditions());
  for (const l of CALC_LOCALES) assert.ok(PRIMARY_ORDER[l].includes("calculators"), l);
  assert.match(read("src/components/SiteFooter.tsx"), /MENU_PATHS\.calculators\[locale\]/);
});

test("every calculator page ends with 'More calculators', which skips the page itself and links the hub", () => {
  assert.match(read("src/components/programmatic/net-salary/NetSalaryPage.tsx"), /<MoreCalculators current="net-salary" locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/rent-update/RentPage.tsx"), /<MoreCalculators current="rent-update" locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/employment/CalcLayout.tsx"), /<MoreCalculators\s+current=\{calcKey\}/);
  const block = read("src/components/programmatic/calculators/MoreCalculators.tsx");
  assert.match(block, /CALCULATOR_IDS\.filter\(\(id\) => id !== current\)/);
  assert.match(block, /calculatorsHubPath\(locale\)/);
  // The breadcrumb runs Home > Calculators > tool on every calculator.
  for (const f of ["src/components/programmatic/net-salary/NetSalaryPage.tsx", "src/components/programmatic/rent-update/RentPage.tsx", "src/components/programmatic/employment/CalcLayout.tsx"]) {
    assert.match(read(f), /hubCrumb\(locale\),/, f);
  }
});
