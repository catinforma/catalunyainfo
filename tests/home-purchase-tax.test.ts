import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS_ROOT, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { COMMUNITIES, COMMUNITIES_AS_OF, COMMUNITIES_REREAD_BY, clientCommunities } from "../src/lib/programmatic/home-purchase-tax/communities.ts";
import { CALC_COPY, EXAMPLE, HT_LOCALES, htEditions, pct, rateText, readHash, writeHash } from "../src/lib/programmatic/home-purchase-tax/copy.ts";
import { calculate, meets, taxOn } from "../src/lib/programmatic/home-purchase-tax/engine.ts";
import { htMeta, htSitemapEntries } from "../src/lib/programmatic/home-purchase-tax/page.ts";
import { NOTARY_SCALE, QUOTE, REGISTRY_CAP, STATE_DEFAULTS, STATE_RULES_AS_OF, VAT } from "../src/lib/programmatic/home-purchase-tax/rules.ts";
import type { HtInput, Rate } from "../src/lib/programmatic/home-purchase-tax/types.ts";

/**
 * The home-purchase tax calculator (lib/programmatic/home-purchase-tax):
 * spot checks of each community against the words of its law (read on
 * COMMUNITIES_AS_OF), the state rules (IVA, mortgage AJD, Ceuta/Melilla,
 * aranceles), the data's integrity, the page wiring and the date guard.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const norm = (s: string) => s.replace(/\s+/g, " ");

const base: HtInput = { community: "cataluna", price: 250_000, type: "second-hand", age: 45, largeFamily: false, disability: 0, habitual: false, firstHome: false, protected: false };
const run = (patch: Partial<HtInput>) => {
  const r = calculate({ ...base, ...patch }, COMMUNITIES);
  assert.equal(r.status, "ok", JSON.stringify(patch));
  if (r.status !== "ok") throw new Error("invalid");
  return r;
};
const itp = (patch: Partial<HtInput>) => run({ type: "second-hand", ...patch }).lines[0]!;
const newHome = (patch: Partial<HtInput>) => {
  const r = run({ type: "new", ...patch });
  return { vat: r.lines[0]!, ajd: r.lines[1]!, total: r.total };
};

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

test("engine: progressive slices, whole-value brackets, flat rates", () => {
  const prog: Rate = { kind: "scale", how: "progressive", brackets: [{ upTo: 600_000, rate: 10 }, { upTo: 900_000, rate: 11 }, { upTo: null, rate: 13 }] };
  assert.equal(taxOn(prog, 250_000), 25_000);
  assert.equal(taxOn(prog, 700_000), 71_000);
  assert.equal(taxOn(prog, 1_000_000), 60_000 + 33_000 + 13_000);
  const whole: Rate = { kind: "scale", how: "whole", brackets: [{ upTo: 300_000, rate: 8 }, { upTo: 500_000, rate: 9 }, { upTo: null, rate: 10 }] };
  assert.equal(taxOn(whole, 300_000), 24_000);
  assert.equal(taxOn(whole, 300_001), 27_000.09);
  assert.equal(taxOn(whole, 600_000), 60_000);
  assert.equal(taxOn({ kind: "flat", rate: 1.5 }, 123_456), 1851.84);
});

test("engine: conditions, invalid input, and the lowest qualifying rate wins", () => {
  assert.equal(meets({ maxAge: 35 }, { ...base, age: 35 }), true);
  assert.equal(meets({ maxAge: 35 }, { ...base, age: 36 }), false);
  assert.equal(meets({ maxValue: 240_000 }, { ...base, price: 240_000 }), true);
  assert.equal(meets({ maxValue: 240_000 }, { ...base, price: 240_000.01 }), false);
  assert.equal(meets({ disabilityMin: 65 }, { ...base, disability: 33 }), false);
  assert.equal(meets({ habitual: true, largeFamily: true }, { ...base, habitual: true }), false);
  assert.deepEqual(calculate({ ...base, price: 0 }, COMMUNITIES), { status: "invalid", reason: "price" });
  assert.deepEqual(calculate({ ...base, price: Number.NaN }, COMMUNITIES), { status: "invalid", reason: "price" });
  assert.deepEqual(calculate({ ...base, age: 17 }, COMMUNITIES), { status: "invalid", reason: "age" });
  assert.deepEqual(calculate({ ...base, community: "atlantis" }, COMMUNITIES), { status: "invalid", reason: "community" });
  // Manual benefits (rural parishes, victims…) are listed, never applied.
  const g = run({ community: "galicia", habitual: true, price: 100_000 });
  assert.equal(g.lines[0]!.amount, 7000);
  assert.ok(g.manual.some((b) => b.id === "galicia-itp-rural-deduction"));
});

test("the page's default example: Cataluña, 250.000 € second-hand home → 10 %, 25.000 € (art. 641-1.1)", () => {
  const r = calculate(EXAMPLE, COMMUNITIES);
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.lines.length, 1);
  assert.equal(r.lines[0]!.tax, "itp");
  assert.equal(r.lines[0]!.amount, 25_000);
  assert.equal(r.lines[0]!.effectiveRate, 10);
  assert.equal(r.lines[0]!.benefit, null);
  assert.equal(r.total, 25_000);
  assert.equal(EXAMPLE.age, 40, "the example buyer is over 35, so no young-buyer rate");
});

/* -------------------------------------------------------------------------- */
/* Spot checks per community (figures as the law prints them)                  */
/* -------------------------------------------------------------------------- */

test("Cataluña (DLeg 1/2024, arts. 641-1 to 641-5, 642-6): 10/11/12/13 % slices, 5 % young ≤ 35, 7 % VPO, AJD 1,5 % with a 100 % young rebate", () => {
  assert.equal(itp({ price: 700_000 }).amount, 71_000);
  assert.equal(itp({ age: 35, habitual: true }).amount, 12_500);
  assert.equal(itp({ age: 36, habitual: true }).amount, 25_000);
  assert.equal(itp({ protected: true }).amount, 17_500);
  const n = newHome({});
  assert.equal(n.vat.amount, 25_000);
  assert.equal(n.ajd.amount, 3750);
  assert.equal(newHome({ age: 30, habitual: true }).ajd.amount, 0);
});

test("Galicia (DLeg 1/2011, arts. 14-15): 8 %; 7 % habitual ≤ 240.000 €; 3 % under 36; AJD 1,5 / 1 / 0,5 %", () => {
  assert.equal(itp({ community: "galicia", price: 200_000 }).amount, 16_000);
  assert.equal(itp({ community: "galicia", price: 200_000, habitual: true }).amount, 14_000);
  assert.equal(itp({ community: "galicia", price: 250_000, habitual: true }).amount, 20_000);
  assert.equal(itp({ community: "galicia", price: 200_000, habitual: true, age: 35 }).amount, 6000);
  assert.equal(itp({ community: "galicia", price: 200_000, habitual: true, age: 36 }).amount, 14_000);
  assert.equal(itp({ community: "galicia", price: 300_000, habitual: true, largeFamily: true }).amount, 9000);
  assert.equal(newHome({ community: "galicia", price: 200_000 }).ajd.amount, 3000);
  assert.equal(newHome({ community: "galicia", price: 200_000, habitual: true }).ajd.amount, 2000);
});

test("Asturias (DLeg 2/2014, arts. 26, 32 bis, 34): 8/9/10 % on the whole value; 4 % / 6 % for buyers ≤ 35; AJD 1,2 %", () => {
  assert.equal(itp({ community: "asturias", price: 250_000 }).amount, 20_000);
  assert.equal(itp({ community: "asturias", price: 350_000 }).amount, 31_500);
  assert.equal(itp({ community: "asturias", price: 140_000, habitual: true, age: 35 }).amount, 5600);
  assert.equal(itp({ community: "asturias", price: 200_000, habitual: true, age: 35 }).amount, 12_000);
  assert.equal(newHome({ community: "asturias", price: 200_000 }).ajd.amount, 2400);
});

test("Cantabria (DLeg 62/2008, arts. 9 and 13, Ley 5/2026): 9 %; habitual 7 % up to 300.000 € then 9 %; under 40 4 %", () => {
  assert.equal(itp({ community: "cantabria", price: 200_000 }).amount, 18_000);
  assert.equal(itp({ community: "cantabria", price: 400_000, habitual: true }).amount, 30_000);
  assert.equal(itp({ community: "cantabria", price: 400_000, habitual: true, age: 39 }).amount, 21_000);
  assert.equal(itp({ community: "cantabria", price: 400_000, habitual: true, age: 40 }).amount, 30_000);
  assert.equal(newHome({ community: "cantabria", price: 200_000, habitual: true }).ajd.amount, 2000);
});

test("La Rioja (Ley 10/2017, arts. 44, 45, 48, 49): 7 %; 4 % under 40 first habitual home; AJD 1 %", () => {
  assert.equal(itp({ community: "la-rioja", price: 200_000 }).amount, 14_000);
  assert.equal(itp({ community: "la-rioja", price: 200_000, habitual: true, firstHome: true, age: 39 }).amount, 8000);
  assert.equal(itp({ community: "la-rioja", price: 200_000, habitual: true, age: 39 }).amount, 14_000);
  assert.equal(newHome({ community: "la-rioja", price: 200_000 }).ajd.amount, 2000);
});

test("Madrid (DLeg 1/2010, arts. 28, 29, 30 bis, 32, 38 bis): 6 %; 10 % rebate ≤ 250.000 €; large family 4 %; AJD 0,4/0,5/0,75 %", () => {
  assert.equal(itp({ community: "madrid", price: 200_000 }).amount, 12_000);
  assert.equal(itp({ community: "madrid", price: 200_000, habitual: true }).amount, 10_800);
  assert.equal(itp({ community: "madrid", price: 300_000, habitual: true }).amount, 18_000);
  assert.equal(itp({ community: "madrid", price: 200_000, habitual: true, largeFamily: true }).amount, 8000);
  assert.equal(newHome({ community: "madrid", price: 100_000 }).ajd.amount, 400);
  assert.equal(newHome({ community: "madrid", price: 200_000 }).ajd.amount, 1500);
  assert.equal(newHome({ community: "madrid", price: 200_000, habitual: true }).ajd.amount, 1350);
});

test("Castilla-La Mancha (Ley 8/2013, arts. 19 and 21, Ley 1/2026): 9 %; 6 % first habitual ≤ 240.000 €; 3 % under 36", () => {
  assert.equal(itp({ community: "castilla-la-mancha", price: 200_000 }).amount, 18_000);
  assert.equal(itp({ community: "castilla-la-mancha", price: 200_000, habitual: true, firstHome: true }).amount, 12_000);
  assert.equal(itp({ community: "castilla-la-mancha", price: 200_000, habitual: true, firstHome: true, age: 35 }).amount, 6000);
  assert.equal(newHome({ community: "castilla-la-mancha", price: 200_000, habitual: true, firstHome: true, age: 35 }).ajd.amount, 500);
});

test("Castilla y León (DLeg 1/2013, arts. 24-26): 8 % to 250.000 € then 10 %; 4 % reduced; AJD 1,5 %", () => {
  assert.equal(itp({ community: "castilla-y-leon", price: 300_000 }).amount, 25_000);
  assert.equal(itp({ community: "castilla-y-leon", price: 200_000, habitual: true, firstHome: true, age: 30 }).amount, 8000);
  assert.equal(newHome({ community: "castilla-y-leon", price: 200_000 }).ajd.amount, 3000);
});

test("Extremadura (DLeg 1/2018, arts. 36, 40, 41, 46, 47; Ley 2/2026): 8/10/11 % slices; 7 % habitual ≤ 200.000 €; 4 % under 36", () => {
  assert.equal(itp({ community: "extremadura", price: 400_000 }).amount, 32_800);
  assert.equal(itp({ community: "extremadura", price: 150_000, habitual: true }).amount, 10_500);
  assert.equal(itp({ community: "extremadura", price: 150_000, habitual: true, age: 30 }).amount, 6000);
  assert.equal(newHome({ community: "extremadura", price: 150_000, habitual: true }).ajd.amount, 750);
});

test("Comunitat Valenciana (Ley 13/1997, arts. 13-14, Leyes 5/2025 and 5/2026): 9 %, 11 % over 1 M €; AJD 1,4 %, 0,1 % habitual", () => {
  assert.equal(itp({ community: "valencia", price: 250_000 }).amount, 22_500);
  assert.equal(itp({ community: "valencia", price: 1_200_000 }).amount, 132_000);
  assert.equal(itp({ community: "valencia", price: 150_000, habitual: true, firstHome: true, age: 34 }).amount, 9000);
  assert.equal(itp({ community: "valencia", price: 200_000, habitual: true, firstHome: true, age: 34 }).amount, 16_000);
  assert.equal(newHome({ community: "valencia", price: 200_000 }).ajd.amount, 2800);
  assert.equal(newHome({ community: "valencia", price: 200_000, habitual: true }).ajd.amount, 200);
});

test("Illes Balears (DLeg 1/2014, arts. 10, 14 quater, 15, 17): 8/9/10/12/13 % slices; 4 % / 2 %; 100 % rebate under 30", () => {
  assert.equal(itp({ community: "baleares", price: 250_000 }).amount, 20_000);
  assert.equal(itp({ community: "baleares", price: 500_000 }).amount, 41_000);
  assert.equal(itp({ community: "baleares", price: 250_000, habitual: true, firstHome: true }).amount, 10_000);
  assert.equal(itp({ community: "baleares", price: 250_000, habitual: true, firstHome: true, age: 35 }).amount, 5000);
  assert.equal(itp({ community: "baleares", price: 250_000, habitual: true, firstHome: true, age: 29 }).amount, 0);
  assert.equal(newHome({ community: "baleares", price: 250_000 }).ajd.amount, 3750);
});

test("Aragón (DLeg 1/2005, arts. 121-1, 121-4, 122-1): 8 % to 400.000 €; 12,5 % rebate under 35 up to 100.000 €; AJD 1,5 %", () => {
  assert.equal(itp({ community: "aragon", price: 250_000 }).amount, 20_000);
  assert.equal(itp({ community: "aragon", price: 450_000 }).amount, 36_250);
  assert.equal(itp({ community: "aragon", price: 90_000, habitual: true, age: 34 }).amount, 6300);
  assert.equal(itp({ community: "aragon", price: 110_000, habitual: true, age: 34 }).amount, 8800);
});

test("Navarra (DFLeg 129/1999, arts. 8 and 22) and the Basque territories (4 %, AJD exempt on a first delivery)", () => {
  assert.equal(itp({ community: "navarra", price: 250_000 }).amount, 15_000);
  const nav = newHome({ community: "navarra", price: 250_000 });
  assert.equal(nav.vat.amount, 25_000);
  assert.equal(nav.ajd.amount, 1250);
  for (const id of ["alava", "bizkaia", "gipuzkoa"]) {
    assert.equal(itp({ community: id, price: 250_000 }).amount, 10_000, id);
    assert.equal(itp({ community: id, price: 250_000, habitual: true, largeFamily: true }).amount, 6250, id);
    const n = newHome({ community: id, price: 250_000 });
    assert.equal(n.vat.amount, 25_000, id);
    assert.equal(n.ajd.amount, 0, id);
  }
});

test("Andalucía (Ley 5/2021, arts. 41, 43, 49, 50): 7 %; 6 % habitual ≤ 150.000 €; 3,5 % under 35; AJD 1,2 %", () => {
  assert.equal(itp({ community: "andalucia", price: 200_000 }).amount, 14_000);
  assert.equal(itp({ community: "andalucia", price: 140_000, habitual: true }).amount, 8400);
  assert.equal(itp({ community: "andalucia", price: 140_000, habitual: true, age: 34 }).amount, 4900);
  assert.equal(itp({ community: "andalucia", price: 140_000, habitual: true, age: 35 }).amount, 8400);
  assert.equal(itp({ community: "andalucia", price: 240_000, habitual: true, largeFamily: true }).amount, 8400);
  assert.equal(newHome({ community: "andalucia", price: 200_000 }).ajd.amount, 2400);
});

test("Región de Murcia (DLeg 1/2010, arts. 6 and 7; Ley 3/2025): 7,75 %; 3 % aged 40 or under; AJD 1,5 % / 0,1 %", () => {
  assert.equal(itp({ community: "murcia", price: 200_000 }).amount, 15_500);
  assert.equal(itp({ community: "murcia", price: 200_000, habitual: true, age: 40 }).amount, 6000);
  assert.equal(itp({ community: "murcia", price: 200_000, habitual: true, age: 41 }).amount, 15_500);
  assert.equal(newHome({ community: "murcia", price: 200_000, habitual: true, age: 40 }).ajd.amount, 200);
});

test("Canarias (DLeg 1/2009 and the IGIC DLeg 1/2025): ITP 6,5 %, 5 % habitual ≤ 200.000 €, 20 % off for ≤ 40; new home IGIC 7 % / 3 % + AJD 1 %", () => {
  assert.equal(itp({ community: "canarias", price: 200_000 }).amount, 13_000);
  assert.equal(itp({ community: "canarias", price: 200_000, habitual: true }).amount, 10_000);
  assert.equal(itp({ community: "canarias", price: 200_000, habitual: true, firstHome: true, age: 40 }).amount, 8000);
  const n = newHome({ community: "canarias", price: 200_000 });
  assert.equal(n.vat.amount, 14_000);
  assert.equal(n.ajd.amount, 2000);
  const y = newHome({ community: "canarias", price: 200_000, habitual: true, firstHome: true, age: 40 });
  assert.equal(y.vat.amount, 6000);
  assert.equal(y.ajd.amount, 800);
  assert.equal(newHome({ community: "canarias", price: 200_000, protected: true }).vat.amount, 0);
});

test("Ceuta and Melilla (TRLITP arts. 11, 31.2, 57 bis): ITP 6 % and AJD 0,5 % less 50 %; IPSI 0,5 % in Ceuta (new homes), 4 % in Melilla", () => {
  for (const id of ["ceuta", "melilla"]) {
    assert.equal(itp({ community: id, price: 200_000 }).amount, 6000, id);
    assert.equal(itp({ community: id, price: 200_000, age: 25, habitual: true, largeFamily: true }).amount, 6000, id);
  }
  const m = newHome({ community: "melilla", price: 200_000 });
  assert.equal(m.vat.amount, 8000);
  assert.equal(m.ajd.amount, 500);
  assert.equal(m.total, 8500);
  const c = newHome({ community: "ceuta", price: 200_000 });
  assert.equal(c.vat.amount, 1000);
  assert.equal(c.ajd.amount, 500);
  assert.equal(c.total, 1500);
  const ceuta = COMMUNITIES.find((x) => x.id === "ceuta")!;
  assert.match(ceuta.newHome.quote, /0\.5 %/);
  assert.match(ceuta.newHome.agency!.url, /ceuta\.es/);
  // A territory whose new-home tax were unverified would print no figure and no total.
  const unverified = COMMUNITIES.map((x) => (x.id === "ceuta" ? { ...x, newHome: { ...x.newHome, general: null } } : x));
  const u = calculate({ ...base, community: "ceuta", type: "new" }, unverified);
  assert.ok(u.status === "ok" && u.lines[0]!.amount === null && u.total === null);
});

test("state rule: the deed of a VPO's first transfer pays no AJD in the common regime (TRLITP art. 45.I.B.12.c)", () => {
  const n = newHome({ community: "galicia", price: 200_000, protected: true });
  assert.equal(n.ajd.amount, 0);
  assert.equal(n.ajd.benefit?.id, "galicia-ajd-vpo-state");
  assert.ok(n.ajd.benefit?.extra?.es.includes("calificación definitiva"));
  assert.match(QUOTE.vpoDeed, /primera transmisión de viviendas de protección oficial/);
});

test("new home: IVA 10 % (4 % for special-regime VPO), never ITP", () => {
  const n = newHome({ community: "galicia", price: 200_000, protected: true });
  assert.equal(n.vat.amount, 8000);
  assert.equal(n.vat.effectiveRate, VAT.protected);
  assert.equal(newHome({ community: "galicia", price: 200_000 }).vat.amount, 20_000);
});

/* -------------------------------------------------------------------------- */
/* State rules                                                                */
/* -------------------------------------------------------------------------- */

test("state rules carry the BOE's words: IVA art. 91, the lender pays the mortgage AJD, fall-back rates, aranceles", () => {
  assert.match(QUOTE.vat10Lead, /10 por ciento/);
  assert.match(QUOTE.vat4Lead, /4 por ciento/);
  assert.match(QUOTE.vat4, /régimen especial o de promoción pública/);
  assert.match(QUOTE.mortgageLender, /sujeto pasivo al prestamista/);
  assert.match(QUOTE.itpDefault, new RegExp(`${STATE_DEFAULTS.itp} por 100`));
  assert.match(QUOTE.ajdDefault, /0,50 por 100/);
  assert.match(QUOTE.ceutaMelillaItp, new RegExp(`${STATE_DEFAULTS.ceutaMelillaBonus} por 100`));
  assert.match(QUOTE.registryCap, /2\.181,673939/);
  assert.equal(REGISTRY_CAP.max, 2181.673939);
  assert.equal(NOTARY_SCALE[0]!.fixed, 90.151816);
  assert.ok(STATE_RULES_AS_OF <= today());
});

/* -------------------------------------------------------------------------- */
/* Data integrity                                                             */
/* -------------------------------------------------------------------------- */

/** "1,5" / "10" as Spanish legal texts print a rate. */
const esNum = (n: number) => String(n).replace(".", ",");

function rateNumbers(r: Rate): number[] {
  return r.kind === "flat" ? [r.rate] : r.brackets.map((b) => b.rate);
}

test("every territory: complete names, a tax agency link, and either a law or 'no verificado'", () => {
  const ids = COMMUNITIES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const must of ["cataluna", "madrid", "galicia", "navarra", "alava", "bizkaia", "gipuzkoa"]) assert.ok(ids.includes(must), must);
  for (const c of COMMUNITIES) {
    for (const l of HT_LOCALES) assert.ok(c.name[l].trim(), `${c.id} name ${l}`);
    assert.match(c.taxAgency.url, /^https:\/\//, c.id);
    if (c.status === "unverified") {
      assert.equal(c.itp, null, c.id);
      assert.equal(c.ajd, null, c.id);
      continue;
    }
    assert.ok(c.law, c.id);
    assert.match(c.law!.url, /^https:\/\//, c.id);
    assert.equal(c.law!.readOn, COMMUNITIES_AS_OF, c.id);
    if (c.law!.consolidatedAsOf) assert.ok(c.law!.consolidatedAsOf <= COMMUNITIES_AS_OF, c.id);
    assert.ok(c.itp && c.ajd, c.id);
  }
});

test("every general rate and every reduced rate appears in the words of its law", () => {
  for (const c of COMMUNITIES) {
    for (const rule of [c.itp, c.ajd]) {
      if (!rule) continue;
      const q = norm(rule.quote);
      assert.ok(q.length > 20, `${c.id} ${rule.article}`);
      if (rule.general.kind === "flat") assert.ok(q.includes(esNum(rule.general.rate)), `${c.id} ${rule.article}: ${rule.general.rate} not in «${q.slice(0, 120)}»`);
      // A scale is a table in the law (the BOE prints each figure in its own cell): the quote introduces it.
      else assert.ok(q.includes(esNum(Math.min(...rateNumbers(rule.general)))) || /tarifa|escala|exceda|Entre 0/i.test(q), `${c.id} ${rule.article}`);
    }
    for (const b of c.benefits) {
      const q = norm(b.quote);
      for (const l of HT_LOCALES) {
        assert.ok(b.label[l].trim(), `${b.id} label ${l}`);
        if (b.extra) assert.ok(b.extra[l].trim(), `${b.id} extra ${l}`);
      }
      assert.ok(b.article.trim(), b.id);
      assert.ok(b.rate || b.bonusPercent !== undefined, b.id);
      if (b.bonusPercent !== undefined) assert.ok(q.includes(esNum(b.bonusPercent)), `${b.id}: ${b.bonusPercent} % not in its quote`);
      if (b.rate) {
        const lowest = Math.min(...rateNumbers(b.rate));
        // An exemption's lead-in ("Estarán exentas…") sits far above the item: the label must say so.
        if (lowest === 0) assert.match(b.label.es, /exenta|0 %/i, b.id);
        else if (b.rate.kind === "flat" || q.includes(esNum(lowest))) assert.ok(q.includes(esNum(lowest)), `${b.id}: ${lowest} not in «${q.slice(0, 160)}»`);
        else assert.match(q, /tarifa|escala|valor del inmueble|Entre 0|Hasta/i, `${b.id}: a scale without its table`);
      }
      if (b.conditions.maxAge !== undefined) assert.ok(b.conditions.maxAge >= 25 && b.conditions.maxAge <= 40, b.id);
      if (b.conditions.maxValue !== undefined) assert.ok(q.includes(String(b.conditions.maxValue).replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(\d{1,2})$/, ",$1")) || b.extra || b.manual, `${b.id}: value cap`);
    }
  }
});

test("the browser gets the rates without the law's words", () => {
  const client = clientCommunities();
  assert.equal(client.length, COMMUNITIES.length);
  for (const c of client) {
    assert.ok(c.benefits.every((b) => b.quote === ""));
    assert.equal(c.itp?.quote ?? "", "");
  }
  // Same results with the slim data.
  assert.deepEqual(calculate(EXAMPLE, client).status, "ok");
  const a = calculate({ ...base, community: "madrid", habitual: true, price: 200_000 }, client);
  const b = calculate({ ...base, community: "madrid", habitual: true, price: 200_000 }, COMMUNITIES);
  assert.equal(a.status === "ok" && a.total, b.status === "ok" && b.total);
});

test("copy: rate words, URL hash round trip", () => {
  assert.equal(pct(0.5, "es"), "0,5 %");
  assert.equal(pct(10, "en"), "10%");
  assert.equal(rateText({ kind: "scale", how: "progressive", brackets: [{ upTo: 300_000, rate: 7 }, { upTo: null, rate: 9 }] }, "es"), "por tramos: 7 % hasta 300.000 €; 9 % en lo que exceda de 300.000 €");
  const s: HtInput = { community: "madrid", price: 312_500, type: "new", age: 33, largeFamily: true, disability: 65, habitual: true, firstHome: true, protected: false };
  assert.deepEqual(readHash(writeHash(s), EXAMPLE, COMMUNITIES.map((c) => c.id)), s);
  assert.deepEqual(readHash("", EXAMPLE, ["cataluna"]), EXAMPLE);
  assert.equal(readHash("#c=atlantis&p=-5", EXAMPLE, ["cataluna"]).community, "cataluna");
  for (const l of HT_LOCALES) assert.ok(CALC_COPY[l].mortgage.includes("17/2018"), l);
});

/* -------------------------------------------------------------------------- */
/* Page wiring                                                                */
/* -------------------------------------------------------------------------- */

test("routes, metadata, sitemap, llms.txt and the hub card (housing group)", () => {
  assert.deepEqual(htEditions(), { es: "/es/calculadoras/impuestos-compra-vivienda/", ca: "/ca/calculadores/impostos-compra-habitatge/", en: "/en/calculators/spain-home-purchase-taxes/" });
  for (const l of HT_LOCALES) {
    const file = join(APP, CALCULATORS_ROOT[l], calculatorSlugs("home-purchase-tax")[l], "page.tsx");
    assert.ok(existsSync(file), l);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    const m = htMeta(l);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}`);
  }
  const entries = htSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.htSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: htEditions\(\)/);
  assert.ok(HUB_GROUPS.find((g) => g.id === "housing")!.cards.some((c) => c.key === "home-purchase-tax"));
  const page = read("src/components/programmatic/home-purchase-tax/HomeTaxPage.tsx");
  assert.match(page, /<MoreCalculators current="home-purchase-tax" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /clientCommunities\(\)/);
  // No new dependency: the calculator only imports the project's modules and React.
  const calc = read("src/components/programmatic/home-purchase-tax/HomeTaxCalculator.tsx");
  for (const m of calc.matchAll(/from "([^"]+)"/g)) assert.ok(m[1] === "react" || m[1]!.startsWith("@/"), m[1]);
});

/* -------------------------------------------------------------------------- */
/* Date guard                                                                 */
/* -------------------------------------------------------------------------- */

test(`date guard: every community's ITP/AJD law is re-read for 2027 by ${COMMUNITIES_REREAD_BY}`, () => {
  assert.ok(COMMUNITIES_AS_OF <= today());
  assert.ok(
    today() < COMMUNITIES_REREAD_BY,
    "January budget and fiscal-measures laws often change ITP/AJD from 1 January. Re-read each community's consolidated tax law (BOE / bulletin; law.url in communities-data.ts) and the 2027 laws that amend it, the LIVA art. 91 and TRLITP arts. 29, 31, 57 bis; update communities-data.ts and rules.ts, then move COMMUNITIES_AS_OF and COMMUNITIES_REREAD_BY (as-of.ts).",
  );
});
