import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { GROSSA_DRAW_DATE, LEVY_EXEMPT, LEVY_RATE, PRIZES as GROSSA_PRIZES, TICKET_PRICE as GROSSA_TICKET } from "../src/lib/content/batch02/grossa.ts";
import { DECIMO_PRICE, NADAL_DRAW_DATE, perDecimo } from "../src/lib/content/batch02/loteria-nadal.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { hubBlocks, hubFaq } from "../src/lib/programmatic/gordo/copy.ts";
import { CALC_COPY, LT_LOCALES, PRESET_LABEL, lotteryTaxEditions, money } from "../src/lib/programmatic/lottery-tax/copy.ts";
import { MAX_TICKETS, breakdown, calculate, calculateOk, exemptForStake } from "../src/lib/programmatic/lottery-tax/engine.ts";
import { examples, headline, lotteryTaxFaq, lotteryTaxMeta, lotteryTaxSitemapEntries, presetInput, prizeTable } from "../src/lib/programmatic/lottery-tax/page.ts";
import { DRAWS, EXEMPT_PER_TICKET, MIN_STAKE_FULL_EXEMPTION, PRESETS, QUOTE, RATE, RULES_AS_OF, RULES_UNTIL, SELAE_READ, SOURCES } from "../src/lib/programmatic/lottery-tax/rules.ts";

/**
 * "Premios de lotería: cuánto se queda Hacienda" (lib/programmatic/lottery-tax/):
 * the special levy of Ley 35/2006, DA 33ª, per décimo and per share, the
 * presets against the lottery guides' own figures, the page, and the date
 * from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const total = (input: Parameters<typeof calculate>[0]) => calculateOk(input).total;

/* ------------------------------------------------------------------ rules */

test("the rule is the BOE's: 40,000 € exempt per décimo, 20 %, the 0.50 € stake, shared prizes split by share", () => {
  assert.equal(EXEMPT_PER_TICKET, 40_000);
  assert.equal(RATE, 0.2);
  assert.equal(MIN_STAKE_FULL_EXEMPTION, 0.5);
  assert.match(QUOTE.exempt, /igual o inferior a 40\.000 euros/);
  assert.match(QUOTE.rate, /será el 20 por ciento/);
  assert.match(QUOTE.minStake, /al menos 0,50 euros/);
  assert.match(QUOTE.perTicket, /de forma independiente respecto de cada décimo/);
  assert.match(QUOTE.shared, /se prorrateará entre los cotitulares/);
  assert.match(QUOTE.scope, /entidades de las Comunidades Autónomas/);
  // The AEAT's own example, word for word, is what the engine gives.
  assert.match(QUOTE.example, /retención de 12\.000 € y se percibirían 88\.000 €/);
  assert.deepEqual(total({ prize: 100_000, price: 20, played: 20, tickets: 1 }), { gross: 100_000, exempt: 40_000, base: 60_000, withholding: 12_000, net: 88_000 });
  // The lottery guides apply the same two numbers.
  assert.equal(LEVY_EXEMPT, EXEMPT_PER_TICKET);
  assert.equal(LEVY_RATE, RATE);
});

test("sources: official hosts over https, read on or before the as-of day; SELAE dated on its own read", () => {
  const hosts = new Set(["www.boe.es", "sede.agenciatributaria.gob.es", "www.loteriasyapuestas.es", "dogc.gencat.cat"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.ok(s.read <= RULES_AS_OF, key);
    if (url.host === "www.loteriasyapuestas.es") assert.equal(s.read, SELAE_READ, key);
    else assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.lirpf.url, /BOE-A-2006-20764#datrigesimatercera$/);
});

test(`date guard: the levy and the draws' programmes are re-read before ${RULES_UNTIL}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Lottery prize tax: re-read Ley 35/2006 DA 33ª on boe.es (any 2027 change to the 40,000 € or the 20 %), the AEAT pages in SOURCES, SELAE's 2027 programmes (El Niño 6 Jan 2027, Christmas 2027) and the DOGC for La Grossa; update rules.ts, then move RULES_AS_OF, SELAE_READ and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("one whole décimo: El Gordo 400,000 € pays 72,000 € and leaves 328,000 €; second, third", () => {
  assert.deepEqual(total(presetInput("gordo")), { gross: 400_000, exempt: 40_000, base: 360_000, withholding: 72_000, net: 328_000 });
  assert.deepEqual(total(presetInput("segundo")), { gross: 125_000, exempt: 40_000, base: 85_000, withholding: 17_000, net: 108_000 });
  assert.deepEqual(total(presetInput("tercero")), { gross: 50_000, exempt: 40_000, base: 10_000, withholding: 2_000, net: 48_000 });
  assert.equal(calculateOk(presetInput("gordo")).effectiveRate, 0.18);
});

test("up to 40,000 € per décimo pays nothing: fourth, fifth, pedrea, reintegro, exactly 40,000 €", () => {
  for (const id of ["cuarto", "quinto", "pedrea", "reintegro", "grossa-tercer"] as const) {
    const t = total(presetInput(id));
    assert.equal(t.withholding, 0, id);
    assert.equal(t.net, t.gross, id);
    assert.equal(t.exempt, t.gross, id);
  }
  assert.equal(total({ prize: 40_000, price: 20, played: 20, tickets: 1 }).withholding, 0);
  assert.equal(total({ prize: 40_000.5, price: 20, played: 20, tickets: 1 }).withholding, 0.1);
});

test("shared décimos and participaciones: the prize, the exempt part and the levy split by the same share", () => {
  // 5 € of a 20 € Gordo décimo = a quarter (the lottery guide's example too).
  const q = calculateOk(presetInput("gordo", 5));
  assert.equal(q.share, 0.25);
  assert.deepEqual(q.total, { gross: 100_000, exempt: 10_000, base: 90_000, withholding: 18_000, net: 82_000 });
  // Half a second-prize décimo each.
  assert.deepEqual(total(presetInput("segundo", 10)), { gross: 62_500, exempt: 20_000, base: 42_500, withholding: 8_500, net: 54_000 });
  // The sum of the shares is the whole décimo.
  const shares = [5, 5, 10].map((p) => total(presetInput("gordo", p)));
  assert.equal(shares.reduce((a, b) => a + b.withholding, 0), 72_000);
  // A share of a small prize: still nothing to pay.
  assert.equal(total(presetInput("quinto", 2)).withholding, 0);
  // Odd shares round to the cent.
  assert.deepEqual(total(presetInput("gordo", 3)), { gross: 60_000, exempt: 6_000, base: 54_000, withholding: 10_800, net: 49_200 });
});

test("several décimos: each one keeps its own 40,000 €, so ten décimos (a whole billete) of El Gordo leave 3,280,000 €", () => {
  assert.deepEqual(total(presetInput("gordo", 20, 2)), { gross: 800_000, exempt: 80_000, base: 720_000, withholding: 144_000, net: 656_000 });
  assert.equal(total(presetInput("gordo", 20, 10)).net, 3_280_000);
  const r = calculateOk(presetInput("gordo", 5, 3));
  assert.equal(r.total.net, 3 * r.perTicket.net);
});

test("a stake under 0.50 € keeps only a proportional exempt part (DA 33ª.2)", () => {
  assert.equal(exemptForStake(20), 40_000);
  assert.equal(exemptForStake(0.5), 40_000);
  assert.equal(exemptForStake(0.25), 20_000);
  assert.deepEqual(breakdown(100_000, 0.25, 1), { gross: 100_000, exempt: 20_000, base: 80_000, withholding: 16_000, net: 84_000 });
});

test("invalid input: no prize, no price, no stake, a stake above the price, a bad number of décimos", () => {
  assert.deepEqual(calculate({ prize: 0, price: 20, played: 20, tickets: 1 }), { status: "invalid", reason: "prize" });
  assert.deepEqual(calculate({ prize: 400_000, price: 0, played: 20, tickets: 1 }), { status: "invalid", reason: "price" });
  assert.deepEqual(calculate({ prize: 400_000, price: 20, played: 0, tickets: 1 }), { status: "invalid", reason: "played" });
  assert.deepEqual(calculate({ prize: 400_000, price: 20, played: 25, tickets: 1 }), { status: "invalid", reason: "played-above-price" });
  for (const tickets of [0, 1.5, MAX_TICKETS + 1, Number.NaN]) assert.deepEqual(calculate({ prize: 400_000, price: 20, played: 20, tickets }), { status: "invalid", reason: "tickets" });
  assert.equal(calculate({ prize: Number.POSITIVE_INFINITY, price: 20, played: 20, tickets: 1 }).status, "invalid");
});

/* ---------------------------------------------------------------- presets */

test("presets: Christmas 2026 = the lottery guide's SELAE programme per décimo; La Grossa = DOGC 9640 annex 3", () => {
  const byId = Object.fromEntries(PRESETS.map((p) => [p.id, p.prize]));
  assert.equal(byId.gordo, perDecimo("first"));
  assert.equal(byId.segundo, perDecimo("second"));
  assert.equal(byId.tercero, perDecimo("third"));
  assert.equal(byId.cuarto, perDecimo("fourth"));
  assert.equal(byId.quinto, perDecimo("fifth"));
  assert.equal(byId.pedrea, perDecimo("pedrea"));
  assert.equal(byId.reintegro, perDecimo("reintegro"));
  assert.equal(byId["grossa-primer"], GROSSA_PRIZES.first.five);
  assert.equal(byId["grossa-segon"], GROSSA_PRIZES.second.five);
  assert.equal(byId["grossa-tercer"], GROSSA_PRIZES.third.five);
  // El Niño: "2.000.000 € a la serie", ten décimos per billete.
  assert.equal(byId["nino-primero"], 200_000);
  assert.equal(DRAWS["navidad-2026"].price, DECIMO_PRICE);
  assert.equal(DRAWS["navidad-2026"].date, NADAL_DRAW_DATE);
  assert.equal(DRAWS["grossa-2026"].price, GROSSA_TICKET);
  assert.equal(DRAWS["grossa-2026"].date, GROSSA_DRAW_DATE);
  assert.equal(DRAWS["nino-2027"].date, "2027-01-06");
  // Every preset has a label in each language and sits in the server-rendered table.
  for (const p of PRESETS) for (const l of LT_LOCALES) assert.ok(PRESET_LABEL[p.id][l].trim(), `${p.id} (${l})`);
  assert.equal(prizeTable().length, PRESETS.length);
  // La Grossa's first prize: 200,000 € per 10 € ticket → 32,000 € withheld.
  assert.deepEqual(total(presetInput("grossa-primer")), { gross: 200_000, exempt: 40_000, base: 160_000, withholding: 32_000, net: 168_000 });
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry the Gordo figures; three editions with hreflang", () => {
  for (const l of LT_LOCALES) {
    const m = lotteryTaxMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length}`);
    assert.ok(m.description.includes(money(328_000, l)) && m.description.includes(money(72_000, l)), l);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
  }
  assert.deepEqual(lotteryTaxEditions(), { ca: "/ca/calculadores/premis-loteria/", es: "/es/calculadoras/premios-loteria/", en: "/en/calculators/spain-lottery-prize-tax/" });
  const entries = lotteryTaxSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.lotteryTaxSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: lotteryTaxEditions\(\)/);
});

test("page: one static route per language, a 404 in the others, server-rendered calculator, FAQ and YMYL pieces", () => {
  const routes = { es: "calculadoras/premios-loteria", ca: "calculadores/premis-loteria", en: "calculators/spain-lottery-prize-tax" } as const;
  for (const l of LT_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<LotteryTaxRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/lottery-tax/LotteryTaxPage.tsx");
  assert.match(page, /<MoreCalculators current="lottery-tax" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<LotteryTaxCalculator locale=\{locale\} initial=\{DEFAULT_PRESET\} \/>/);
  // The answer is in the HTML: the prize table and the examples render on the server from the engine.
  assert.match(page, /prizeTable\(\)\.map/);
  assert.match(page, /examples\(\)\.map/);
  // YMYL: the disclaimer, the AEAT link, the rules date, the FAQ schema, the link back to the results hub.
  assert.match(page, /SOURCES\.aeatNotice\.url/);
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /gordoHubPath\(locale\)/);
  const calc = read("src/components/programmatic/lottery-tax/LotteryTaxCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("lottery-tax"/);
  // Worked examples are the documented ones.
  assert.deepEqual(examples().map((e) => e.id), ["one-gordo", "share-5", "half-second", "two-gordo", "third", "grossa", "aeat"]);
  const h = headline();
  assert.equal(h.share5.total.net, 82_000);
});

test("FAQ: eight questions per language, the real queries, every figure from the engine", () => {
  const es = lotteryTaxFaq("es");
  assert.deepEqual(es.map((f) => f.q).slice(0, 3), ["¿Cuánto se queda Hacienda del Gordo?", "¿Cuánto cobra un décimo del Gordo?", "¿Cuánto paga a Hacienda una participación de 5 €?"]);
  // 20 Nov 2026: El Niño (6 Jan), from the nino-primero preset: 200,000 € a décimo, 32,000 € withheld.
  assert.equal(es[7]!.q, "¿Cuánto se queda Hacienda del Niño?");
  assert.match(es[7]!.a, /200\.000 € por décimo de 20 €, paga 32\.000 € y deja 168\.000 €/);
  for (const l of LT_LOCALES) {
    const faq = lotteryTaxFaq(l);
    assert.equal(faq.length, 8, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 8, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const n of [72_000, 328_000, 82_000, 3_280_000, 656_000, 168_000]) assert.ok(all.includes(money(n, l)), `${l}: ${n}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
  }
});

test("the Christmas lottery hub links the calculator in ca, es and en, with the net Gordo figure", () => {
  for (const l of LT_LOCALES) {
    const json = JSON.stringify(hubBlocks(l, null));
    assert.ok(json.includes(`](${calcPath("lottery-tax", l)})`), `${l}: the hub does not link the calculator`);
    assert.ok(json.includes(money(328_000, l)), `${l}: the hub does not give the net Gordo`);
    assert.ok(hubFaq(l, null).some((f) => f.answer.includes(money(328_000, l))), l);
  }
  // Province and municipality pages (from the 22 Dec snapshot) point there too.
  const copy = read("src/lib/programmatic/gordo/copy.ts");
  assert.equal((copy.match(/taxCalc\("(ca|es|en)"/g) ?? []).length, 9);
});
