import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { calcEditions, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { COMMUNITIES } from "../src/lib/programmatic/home-purchase-tax/communities.ts";
import { calculate as taxCalculate } from "../src/lib/programmatic/home-purchase-tax/engine.ts";
import * as HT_RULES from "../src/lib/programmatic/home-purchase-tax/rules.ts";
import { CALC_COPY, EXAMPLE, PC_LOCALES, lawEuros, pcEditions, readHash, taxDetailHref, writeHash } from "../src/lib/programmatic/purchase-costs/copy.ts";
import { calculate, feeRegime, scaleFee, taxInput, type PcInput } from "../src/lib/programmatic/purchase-costs/engine.ts";
import { EXAMPLES, exampleResults, feeTable, pcFaq, pcMeta, pcSitemapEntries } from "../src/lib/programmatic/purchase-costs/page.ts";
import {
  ARANCEL_REBATE,
  EXTRAS,
  FEES_VAT,
  MATRIX_PER_SIDE,
  NOTARY_COPY_PER_FOLIO,
  NOTARY_FREE_ABOVE,
  NOTARY_OPTIONAL_DISCOUNT_MAX,
  NOTARY_SCALE,
  PRO_INDIVISO_MAX_PCT,
  QUOTE,
  REGISTRY_CAP,
  REGISTRY_HOME_SALE_CUT,
  REGISTRY_PRESENTATION,
  REGISTRY_SCALE,
  RULES_AS_OF,
  RULES_UNTIL,
  SIMPLE_COPY_PER_FOLIO,
  SOURCES,
  VPO_FIRST_CUT,
  VPO_FIXED,
  VPO_FIXED_ANNEX,
  VPO_RESALE_CUT,
} from "../src/lib/programmatic/purchase-costs/rules.ts";

/**
 * Home-buying costs (lib/programmatic/purchase-costs): the notary's and the
 * Land Registry's official scales as the BOE prints them, the engine on
 * hand-checked cases, who pays, the taxes taken from the home-purchase tax
 * engine (never re-typed), and the yearly re-read guard.
 */

const today = () => new Date().toISOString().slice(0, 10);
const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
/** "6.010,12" / "90,151816": a figure as the BOE's Spanish prints it. */
const es = (n: number, decimals?: number) => {
  const [int, frac] = (decimals === undefined ? String(n) : n.toFixed(decimals)).split(".");
  return `${int!.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${frac ? `,${frac}` : ""}`;
};
const ok = (input: Partial<PcInput>) => {
  const r = calculate({ ...EXAMPLE, ...input }, COMMUNITIES);
  assert.equal(r.status, "ok", JSON.stringify(r));
  return r as Extract<typeof r, { status: "ok" }>;
};

/* -------------------------------------------------------------- Guard --- */

test(`date guard: the aranceles and the rules around them are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Home-buying costs: re-read in the BOE the consolidated RD 1426/1989 and RD 1427/1989 (última actualización, every número used), RDL 6/2000 arts. 35-36, RDL 8/2010 DA 8ª, Ley 41/1980 art. 8, Código Civil art. 1455, Ley 5/2019 art. 14.1.e, LIVA art. 90 and TRLITP arts. 8 and 29; search the BOE for any new decree on aranceles notariales or registrales; update rules.ts (QUOTE, SOURCES and their dates), then move RULES_AS_OF and RULES_UNTIL.",
  );
  for (const s of Object.values(SOURCES)) {
    assert.match(s.url, /^https:\/\/www\.boe\.es\/buscar\/(act|doc)\.php\?id=BOE-A-\d{4}-\d+$/, s.id);
    assert.ok(s.url.endsWith(s.id), s.id);
    assert.equal(s.read, RULES_AS_OF, s.id);
    if (s.consolidated) assert.ok(s.consolidated <= RULES_AS_OF, s.id);
  }
});

/* ------------------------------------------------------- The BOE's words --- */

test("the scales are the home-purchase tax module's own (one copy), and every figure is in the BOE's words", () => {
  assert.equal(NOTARY_SCALE, HT_RULES.NOTARY_SCALE);
  assert.equal(REGISTRY_SCALE, HT_RULES.REGISTRY_SCALE);
  assert.equal(REGISTRY_CAP, HT_RULES.REGISTRY_CAP);
  for (const [scale, lines] of [
    [NOTARY_SCALE, QUOTE.notaryScale],
    [REGISTRY_SCALE, QUOTE.registryScale],
  ] as const) {
    assert.equal(lines.length, scale.length);
    scale.forEach((s, i) => {
      const line = lines[i]!;
      if (s.fixed !== undefined) assert.ok(line.includes(es(s.fixed)), `${line} ∌ ${s.fixed}`);
      else assert.ok(line.includes(`${es(s.perMille!)} por`) || line.includes(`${es(s.perMille!)}0 por`), `${line} ∌ ${s.perMille}`);
      if (s.to !== null) assert.ok(line.includes(es(s.to, 2)), `${line} ∌ ${s.to}`);
      else assert.ok(line.includes(es(s.from, 2)), `${line} ∌ ${s.from}`);
    });
  }
  assert.ok(QUOTE.notaryFree.includes(es(NOTARY_FREE_ABOVE, 2)));
  assert.ok(QUOTE.notaryScale.at(-1)!.includes(es(NOTARY_FREE_ABOVE, 2)));
  assert.ok(QUOTE.registryCap.includes(es(REGISTRY_CAP.max)) && QUOTE.registryCap.includes(es(REGISTRY_CAP.min)));
  for (const q of [QUOTE.notaryRebate, QUOTE.registryRebate]) assert.ok(q.includes(`${ARANCEL_REBATE} por 100`));
  assert.ok(QUOTE.da8Notary.includes(`${ARANCEL_REBATE}%`));
  assert.ok(QUOTE.notaryCopies.includes(es(NOTARY_COPY_PER_FOLIO)) && QUOTE.notaryCopies.includes("duodécimo"));
  assert.ok(QUOTE.notarySimpleCopies.includes(es(SIMPLE_COPY_PER_FOLIO)));
  assert.ok(QUOTE.notaryMatrixFolios.includes(es(MATRIX_PER_SIDE)) && QUOTE.notaryMatrixFolios.includes("quinto folio"));
  assert.ok(QUOTE.registryPresentation.includes(es(REGISTRY_PRESENTATION)));
  assert.ok(QUOTE.registryHomeSale.includes(`${REGISTRY_HOME_SALE_CUT} por 100`) && QUOTE.registryHomeSale.includes("compraventa de viviendas"));
  assert.ok(QUOTE.notaryDiscount.includes(`${NOTARY_OPTIONAL_DISCOUNT_MAX} por 100`));
  assert.ok(QUOTE.notaryHalfLead.includes(`${VPO_RESALE_CUT} por 100`) && QUOTE.registryHalfLead.includes(`${VPO_RESALE_CUT} por 100`));
  assert.ok(QUOTE.vpoFirst.includes(`${VPO_FIRST_CUT} por 100`) && QUOTE.vpoFirstSale.includes("noventa metros cuadrados") && QUOTE.vpoFirstSale.includes("única vivienda"));
  assert.ok(QUOTE.vpoEurosNotary.includes(es(VPO_FIXED.notary)) && QUOTE.vpoEurosRegistry.includes(es(VPO_FIXED.registry)));
  assert.equal(VPO_FIXED.maxUsefulArea, 90);
  assert.deepEqual(VPO_FIXED_ANNEX, { notary: { parking: 9.015182, storeroom: 6.010121 }, registry: { parking: 6.010121, storeroom: 3.005061 } });
  assert.ok(QUOTE.registryProIndiviso.includes(`${PRO_INDIVISO_MAX_PCT} por 100`));
  assert.ok(QUOTE.registryAffection.includes(es(EXTRAS.affectionNote)) && QUOTE.registryNotaSimple.includes(es(EXTRAS.notaSimple)));
  assert.ok(QUOTE.notaryCancellation.includes(es(EXTRAS.cancellationNotary)) && QUOTE.registryCancellation.includes(`${EXTRAS.cancellationRegistryBaseCut} por 100`));
  assert.ok(QUOTE.vatGeneral.includes(`${FEES_VAT} por ciento`));
  assert.match(QUOTE.civilCode1455, /vendedor.*primera copia.*comprador, salvo pacto en contrario/);
  assert.match(QUOTE.ley5Notary, /prestamista asumirá el coste de los aranceles notariales/);
  assert.match(QUOTE.ley5Registry, /corresponderán al prestamista/);
  assert.match(QUOTE.ley5Valuation, /tasación del inmueble corresponderán a prestatario y los de gestoría al prestamista/);
  assert.match(QUOTE.mortgageAjdLender, /sujeto pasivo al prestamista/);
  assert.match(QUOTE.taxBuyer, /cualesquiera que sean las estipulaciones/);
  // Every quote is a sentence of the law, not a paraphrase of ours.
  for (const [k, v] of Object.entries(QUOTE)) for (const q of Array.isArray(v) ? v : [v]) assert.ok(norm(q).length > 30, k);
});

/* --------------------------------------------------------------- Engine --- */

test("scales by hand: 250.000 € → notary 383,435226 €, registry 201,212548 €; floor and top", () => {
  assert.equal(Math.round(scaleFee(NOTARY_SCALE, 250_000) * 1e6) / 1e6, 383.435226);
  assert.equal(Math.round(scaleFee(REGISTRY_SCALE, 250_000) * 1e6) / 1e6, 201.212548);
  // The first slice is a flat amount; at 6.010.121,04 € the notary scale reaches what the registry may never exceed.
  assert.equal(scaleFee(NOTARY_SCALE, 5_000), 90.151816);
  assert.equal(scaleFee(REGISTRY_SCALE, 5_000), 24.040484);
  assert.equal(Math.round(scaleFee(NOTARY_SCALE, NOTARY_FREE_ABOVE) * 100) / 100, 2181.67);
  assert.ok(scaleFee(REGISTRY_SCALE, NOTARY_FREE_ABOVE) < REGISTRY_CAP.max, "the registry cap never binds below the notary's free limit");
});

test("the example: 250.000 € second-hand in Catalonia, 20 folios, one simple copy, the legal split", () => {
  const r = ok({});
  const n = r.fees.notary;
  assert.deepEqual([n.scale, n.rebate, n.deedScale, n.matrixFolios, n.deed, n.firstCopy, n.simpleCopies, n.total], [383.44, 19.17, 364.26, 96.16, 460.42, 46.58, 12.02, 519.02]);
  const g = r.fees.registry;
  assert.deepEqual([g.scale, g.rebate, g.homeSaleCut, g.registration, g.presentation, g.total], [201.21, 10.06, 9.56, 181.59, 6.01, 187.6]);
  assert.deepEqual([r.fees.buyer, r.fees.seller], [246.2, 460.42]);
  assert.deepEqual(r.fees.vat, { rate: 21, buyer: 51.7, seller: 96.69 });
  // The taxes are the home-purchase tax engine's own answer for the same home.
  assert.deepEqual(r.taxes, taxCalculate(taxInput(EXAMPLE), COMMUNITIES));
  assert.equal(r.taxes.status === "ok" ? r.taxes.total : null, 25_000);
  assert.equal(r.buyerFees, 297.9);
  assert.equal(r.sellerFees, 557.11);
  assert.equal(r.buyerTotal, 25_297.9);
});

test("copies and folios: half price from the 12th folio, matrix folios from the 5th on both sides", () => {
  assert.equal(ok({ folios: 4 }).fees.notary.matrixFolios, 0);
  assert.equal(ok({ folios: 5 }).fees.notary.matrixFolios, 6.01);
  assert.equal(ok({ folios: 11 }).fees.notary.firstCopy, 33.06);
  assert.equal(ok({ folios: 12 }).fees.notary.firstCopy, 34.56);
  assert.equal(ok({ simpleCopies: 0 }).fees.notary.simpleCopies, 0);
  assert.equal(ok({ simpleCopies: 3, folios: 10 }).fees.notary.simpleCopies, 18.03);
});

test("who pays: the deed is the seller's unless agreed; the taxes always the buyer's", () => {
  const legal = ok({});
  const agreed = ok({ buyerPaysDeed: true });
  assert.equal(agreed.fees.seller, 0);
  assert.equal(agreed.sellerFees, 0);
  assert.equal(agreed.fees.buyer, Math.round((legal.fees.notary.total + legal.fees.registry.total) * 100) / 100);
  assert.equal(agreed.buyerTotal, 25_855.01);
  assert.equal(agreed.taxes.status === "ok" && agreed.taxes.total, 25_000);
});

test("pro indiviso: the scale on each share, never above 1 % of the value; spouses in community property are one base", () => {
  const two = ok({ price: 300_000, owners: 2 }).fees.registry;
  assert.equal(two.shareBase, 150_000);
  assert.equal(two.scale, 342.2);
  assert.equal(two.registration, 308.83);
  assert.ok(two.registration > ok({ price: 300_000 }).fees.registry.registration);
  const tiny = ok({ price: 8_000, owners: 4 }).fees.registry;
  assert.equal(tiny.capped, true);
  assert.equal(tiny.scale, 80);
  // The notary's scale is on the whole price whoever buys.
  assert.equal(ok({ price: 300_000, owners: 2 }).fees.notary.scale, ok({ price: 300_000 }).fees.notary.scale);
});

test("protected housing: 50 % on resales; the developer's sale only for the buyer's only home, fixed up to 90 m²", () => {
  assert.equal(feeRegime({ protected: false, type: "new", smallHome: true, onlyHome: true }), "general");
  assert.equal(feeRegime({ protected: true, type: "second-hand", smallHome: false, onlyHome: false }), "vpo-resale");
  assert.equal(feeRegime({ protected: true, type: "new", smallHome: true, onlyHome: false }), "general");
  assert.equal(feeRegime({ protected: true, type: "new", smallHome: false, onlyHome: true }), "vpo-first");
  assert.equal(feeRegime({ protected: true, type: "new", smallHome: true, onlyHome: true }), "vpo-fixed");

  const resale = ok({ price: 150_000, protected: true });
  assert.equal(resale.fees.notary.cutPct, 50);
  assert.equal(resale.fees.notary.deedScale, 158.32);
  // Número 2.2.e reduces the scale only: the copy is full price.
  assert.equal(resale.fees.notary.firstCopy, ok({ price: 150_000 }).fees.notary.firstCopy);
  assert.equal(resale.fees.registry.registration, 77.21);

  const first = ok({ community: "andalucia", price: 160_000, type: "new", protected: true, onlyHome: true });
  assert.equal(first.fees.regime, "vpo-first");
  assert.equal(first.fees.notary.firstCopy, 23.29);
  assert.equal(first.fees.registry.registration, 78.61);

  const fixed = ok({ community: "andalucia", price: 120_000, type: "new", protected: true, onlyHome: true, smallHome: true });
  assert.equal(fixed.fees.notary.total, 60.05);
  assert.equal(fixed.fees.registry.total, 24.02);
  assert.equal(fixed.fees.seller, 0);
  assert.equal(fixed.fees.vat?.buyer, 17.65);
});

test("IVA on the fees: 21 %, foral territories included; IGIC or IPSI (not computed) in the Canaries, Ceuta and Melilla", () => {
  for (const id of ["canarias", "ceuta", "melilla"]) {
    const r = ok({ community: id });
    assert.equal(r.fees.vat, null, id);
    assert.equal(r.buyerTotal, null, id);
    assert.equal(r.buyerFees, r.fees.buyer, id);
  }
  for (const id of ["navarra", "bizkaia", "madrid"]) assert.equal(ok({ community: id }).fees.vat?.rate, 21, id);
});

test("invalid input: price, the notary's free limit, folios, copies, owners, region; the tax's own age check", () => {
  const bad = (input: Partial<PcInput>) => calculate({ ...EXAMPLE, ...input }, COMMUNITIES);
  assert.deepEqual(bad({ price: 0 }), { status: "invalid", reason: "price" });
  assert.deepEqual(bad({ price: Number.NaN }), { status: "invalid", reason: "price" });
  assert.deepEqual(bad({ price: NOTARY_FREE_ABOVE + 1 }), { status: "invalid", reason: "above-free" });
  assert.equal(bad({ price: NOTARY_FREE_ABOVE }).status, "ok");
  for (const folios of [0, 201, 2.5, Number.NaN]) assert.deepEqual(bad({ folios }), { status: "invalid", reason: "folios" });
  for (const simpleCopies of [-1, 11, 1.5]) assert.deepEqual(bad({ simpleCopies }), { status: "invalid", reason: "copies" });
  assert.deepEqual(bad({ owners: 5 as 1 }), { status: "invalid", reason: "owners" });
  assert.deepEqual(bad({ community: "x" }), { status: "invalid", reason: "community" });
  const noAge = bad({ age: 10 });
  assert.equal(noAge.status === "ok" && noAge.taxes.status, "invalid");
  assert.equal(noAge.status === "ok" && noAge.buyerTotal, null);
});

/* ---------------------------------------------------------- Copy & hash --- */

test("hash: a calculation round-trips; junk falls back to the example", () => {
  const s: PcInput = { ...EXAMPLE, community: "madrid", price: 312_500, type: "new", age: 29, largeFamily: true, disability: 33, habitual: false, firstHome: true, protected: true, smallHome: true, onlyHome: true, folios: 31, simpleCopies: 2, owners: 3, buyerPaysDeed: true, mortgage: true };
  const ids = COMMUNITIES.map((c) => c.id);
  assert.deepEqual(readHash(writeHash(s), EXAMPLE, ids), s);
  assert.deepEqual(readHash("", EXAMPLE, ids), EXAMPLE);
  assert.deepEqual(readHash("#c=nowhere&p=-5&f=999&cs=x&w=9&e=7", EXAMPLE, ids), { ...EXAMPLE, habitual: EXAMPLE.habitual });
  // "See the tax in detail" opens the tax calculator on the same home.
  assert.match(taxDetailHref(s, "es"), /^\/es\/calculadoras\/impuestos-compra-vivienda\/#c=madrid&p=312500&t=n&e=29&fn=1&d=33&h=0&pv=1&vpo=1$/);
});

test("copy: every language complete; folios explained as an estimate, never an average; gestoría never priced", () => {
  const keys = Object.keys(CALC_COPY.es).sort();
  for (const l of PC_LOCALES) {
    const t = CALC_COPY[l];
    assert.deepEqual(Object.keys(t).sort(), keys, l);
    for (const [k, v] of Object.entries(t)) {
      if (typeof v === "string") assert.ok(v.trim().length > 0, `${l}.${k}`);
      if (Array.isArray(v)) assert.ok(v.length > 0, `${l}.${k}`);
    }
    for (const reason of ["price", "above-free", "folios", "copies", "owners", "community"] as const) assert.ok(t.invalid[reason].trim(), `${l} ${reason}`);
    assert.match(t.foliosHint, /20/);
    assert.match(t.foliosHint, /media|mitjana|average/);
    assert.ok(t.notIncludedItems.some((x) => /gestor/i.test(x) && /libre|lliure|free/.test(x)), l);
    assert.equal(t.mortgageItems.length, 5, l);
  }
  assert.equal(lawEuros(3.005061, "es"), "3,005061 €");
  assert.equal(lawEuros(2181.673939, "es"), "2.181,673939 €");
  assert.equal(lawEuros(6.01, "en"), "€6.01");
});

test("page: titles and descriptions fit, FAQ answers carry the engine's figures, tables and examples are complete", () => {
  for (const l of PC_LOCALES) {
    const m = pcMeta(l);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}`);
    assert.ok(m.description.length >= 70 && m.description.length <= 165, `${l} description ${m.description.length}`);
    assert.ok(m.h1.length > 20 && m.breadcrumb.length > 5);
    const faq = pcFaq(l);
    assert.equal(faq.length, 8, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const figure of l === "en" ? ["€383.44", "€364.26", "€519.02", "€201.21", "€181.59", "€308.83", "€195.13"] : ["383,44 €", "364,26 €", "519,02 €", "201,21 €", "181,59 €", "308,83 €", "195,13 €"]) assert.ok(all.includes(figure), `${l}: ${figure}`);
  }
  const rows = feeTable();
  assert.equal(rows.length, 10);
  assert.deepEqual(rows.find((r) => r.price === 250_000), { price: 250_000, notaryScale: 383.44, notaryDeed: 364.26, registryScale: 201.21, registration: 181.59 });
  assert.deepEqual(rows.find((r) => r.price === 100_000), { price: 100_000, notaryScale: 283.31, notaryDeed: 269.14, registryScale: 133.6, registration: 120.57 });
  assert.equal(exampleResults().length, EXAMPLES.length);
  assert.deepEqual(
    exampleResults().map((x) => x.result.buyerTotal),
    [25_297.9, 21_631.53, 30_451.86, 10_671.6, 4_901.72],
  );
  const sm = pcSitemapEntries();
  assert.equal(sm.length, 3);
  for (const e of sm) assert.equal(Object.keys(e.alternates?.languages ?? {}).length, 4);
});

/* --------------------------------------------------------------- Wiring --- */

test("wiring: registry slugs, hub card next to the purchase taxes, next steps, links from the tax and mortgage pages", () => {
  assert.deepEqual(calcEditions("home-purchase-costs"), { ca: "/ca/calculadores/despeses-compravenda-habitatge/", es: "/es/calculadoras/gastos-compraventa-vivienda/", en: "/en/calculators/spain-home-buying-costs/" });
  assert.deepEqual(pcEditions(), { es: calcPath("home-purchase-costs", "es"), ca: calcPath("home-purchase-costs", "ca"), en: calcPath("home-purchase-costs", "en") });
  const housing = HUB_GROUPS.find((g) => g.id === "housing")!.cards.map((c) => c.key);
  assert.equal(housing.indexOf("home-purchase-costs"), housing.indexOf("home-purchase-tax") + 1);
  assert.deepEqual(CALCULATOR_NEXT["home-purchase-costs"], ["home-purchase-tax", "mortgage"]);
  assert.ok(CALCULATOR_NEXT["home-purchase-tax"]?.includes("home-purchase-costs"));
  assert.ok(CALCULATOR_NEXT.mortgage?.includes("home-purchase-costs"));
  for (const file of ["src/components/programmatic/home-purchase-tax/HomeTaxPage.tsx", "src/components/programmatic/mortgage/MortgagePage.tsx"]) assert.match(read(file), /calcPath\("home-purchase-costs", locale\)/, file);
  const page = read("src/components/programmatic/purchase-costs/PurchaseCostsPage.tsx");
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /<PurchaseCostsCalculator locale=\{locale\} options=\{communityOptions\(locale\)\} initial=\{clientCommunity\(EXAMPLE\.community\)\} dataUrl=\{HT_DATA_PATH\} \/>/);
  // The engine computes the taxes with the tax module's engine, never its own rates.
  const engine = read("src/lib/programmatic/purchase-costs/engine.ts");
  assert.match(engine, /from "@\/lib\/programmatic\/home-purchase-tax\/engine"/);
  assert.doesNotMatch(engine, /kind: "flat"|brackets:/);
});
