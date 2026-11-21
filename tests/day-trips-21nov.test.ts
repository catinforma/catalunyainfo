import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { SITGES, TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { GIRONA, MONTSERRAT_FREE } from "../src/lib/content/batch02/day-trips.ts";
import { FIGUERES } from "../src/lib/content/batch02/figueres.ts";
import { B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Day trips from Barcelona, 21 Nov 2026 (body only: titles, descriptions,
 * leads and H1s are in the 28 Oct / 13 Nov windows of docs/SEO_EXPERIMENTS.md).
 * Facts re-read that day: FGC GTFS (feed 2026-11-20), Turistren, the Aeri's
 * 2026 fares and calendar, FGC's shop, TMB's 2026 fare table, Montserrat
 * Visita, salvador-dali.org, the Rodalies planner API and Renfe's GTFS.
 */

type B = { type: string; text?: string; caption?: string; headers?: string[]; rows?: string[][]; items?: { question: string; answer: string }[] };
const blocks = (a: { editions: Record<string, { blocks: unknown }> }, locale: string) => a.editions[locale]!.blocks as B[];
const tables = (a: { editions: Record<string, { blocks: unknown }> }, locale: string) => blocks(a, locale).filter((b) => b.type === "table");
const faqText = (a: { editions: Record<string, { blocks: unknown }> }, locale: string) => JSON.stringify(blocks(a, locale).filter((b) => b.type === "faq"));
const json = (x: unknown) => JSON.stringify(x);

test("montserrat: the last R5 back is 21:41 from Monistrol and 21:45 from the Aeri (not 22:41 / 22:45)", () => {
  for (const locale of LOCALES) {
    const train = tables(MONTSERRAT_FREE, locale).find((t) => (t.rows ?? []).some((r) => r[0] === "Montserrat-Aeri → Plaça Espanya"));
    assert.ok(train, `${locale}: R5 table`);
    const rows = json(train!.rows);
    assert.match(rows, /21:41/, `${locale}: last from Monistrol`);
    assert.match(rows, /21:45/, `${locale}: last from the Aeri`);
    assert.doesNotMatch(rows, /22:41/, `${locale}: 22:41 is the Manresa-bound train`);
    assert.match(rows, /22:45/, `${locale}: 22:45 only as the arrival time`);
  }
});

test("montserrat: which-ticket table, funiculars, best time and a timed day, in all three languages", () => {
  const santaCova = { ca: /fora de servei per manteniment fins a nou avís/, es: /fuera de servicio por mantenimiento hasta nuevo aviso/, en: /out of service for maintenance until further notice/ } as const;
  for (const locale of LOCALES) {
    const t = tables(MONTSERRAT_FREE, locale);
    const tickets = t.find((x) => x.headers?.length === 5);
    assert.ok(tickets, `${locale}: tickets table`);
    const all = json(tickets!.rows);
    for (const fare of [/15[.,]90/, /28[.,]80/, /6[.,]90/, /44[.,]65/, /24[.,]25/, /35[.,]75/, /45[.,]75/, /71[.,]50/, /M-Museu/, /Monistrol-Vila/]) {
      assert.match(all, fare, `${locale}: ${fare}`);
    }
    const plan = t.find((x) => (x.rows ?? []).some((r) => r[0] === "8:36"));
    assert.ok(plan, `${locale}: timed day`);
    assert.ok(plan!.rows!.some((r) => r[0] === "14:41"), `${locale}: R5 back at 14:41`);
    const text = bodyToPlainText(MONTSERRAT_FREE.editions[locale].blocks);
    assert.match(text, santaCova[locale], `${locale}: Santa Cova funicular closed`);
    assert.match(text, /17[.,]50/, `${locale}: Sant Joan return`);
    assert.match(text, /21[.,]20/, `${locale}: separate tickets vs Trans Montserrat`);
    assert.doesNotMatch(text, /Montserrat Expr[eé]s/i, `${locale}: no unverified ticket name`);
  }
  assert.match(bodyToPlainText(MONTSERRAT_FREE.editions.en.blocks), /cogwheel train/);
  assert.match(bodyToPlainText(MONTSERRAT_FREE.editions.en.blocks), /gondola/);
});

test("montserrat: new FAQs in the searched words", () => {
  const q = {
    ca: [/Funciona el funicular de Montserrat/, /Quin bitllet he de comprar a Plaça Espanya/, /Serveix la T-casual/, /últim tren de Montserrat a Barcelona/],
    es: [/Funciona el funicular de Montserrat/, /Qué billete hay que comprar en Plaça Espanya/, /Sirve la T-casual/, /último tren de Montserrat a Barcelona/],
    en: [/Is the Montserrat funicular open/, /Which ticket do I buy at Plaça Espanya/, /Can I use the T-casual/, /last train from Montserrat to Barcelona/, /cogwheel train/],
  } as const;
  for (const locale of LOCALES) for (const re of q[locale]) assert.match(faqText(MONTSERRAT_FREE, locale), re, `${locale}: ${re}`);
});

test("figueres: price table, high-speed 53-65 min (Renfe data, 21 Nov), visit length and bag rules", () => {
  const visit = { ca: /d'una hora i mitja a dues hores/, es: /de hora y media a dos horas/, en: /one and a half to two hours/ } as const;
  const price = { ca: /Quant costa l'entrada al Museu Dalí de Figueres/, es: /Cuánto cuesta la entrada al Museo Dalí de Figueres/, en: /How much is a ticket to the Dalí Museum in Figueres/ } as const;
  for (const locale of LOCALES) {
    const t = tables(FIGUERES, locale);
    const prices = t.find((x) => (x.rows ?? []).some((r) => /Portlligat/.test(r[0] ?? "")));
    assert.ok(prices, `${locale}: price table`);
    const rows = json(prices!.rows);
    for (const fare of [/18[.,]50/, /15[.,]00/, /26[.,]50/, /44[.,]50/, /15[.,]50/, /10 €|€10/]) assert.match(rows, fare, `${locale}: ${fare}`);
    const text = bodyToPlainText(FIGUERES.editions[locale].blocks);
    assert.match(text, /53 min/, `${locale}: high-speed from 53 minutes`);
    assert.doesNotMatch(text, /42 min/, `${locale}: the 42-minute train is not in Renfe's current data`);
    assert.match(text, visit[locale], `${locale}: the Foundation's visit length`);
    assert.match(text, /35 × 35 × 25 cm/, `${locale}: bag size`);
    assert.match(faqText(FIGUERES, locale), price[locale], `${locale}: price FAQ in the query words`);
    assert.ok(json(FIGUERES.editions[locale].blocks).includes(`](${b2href("montserratFree", locale)})`), `${locale}: links Montserrat`);
  }
  assert.equal(FIGUERES.verifiedAt, "2026-11-21");
});

test("girona: every AVE/Avant departure both ways, and an FAQ", () => {
  for (const locale of LOCALES) {
    const hs = tables(GIRONA, locale).find((x) => (x.rows ?? []).some((r) => r[0] === "Girona → Barcelona-Sants"));
    assert.ok(hs, `${locale}: high-speed timetable`);
    const weekday = hs!.rows![0]![1]!.split(", ");
    assert.equal(weekday.length, 15, `${locale}: 15 departures Monday to Thursday`);
    assert.equal(weekday.at(-1), "23:05");
    assert.equal(hs!.rows![1]![1]!.split(", ").at(-1), "19:52", `${locale}: last back on weekdays`);
    const summary = json(tables(GIRONA, locale)[0]!.rows);
    assert.doesNotMatch(summary, /23:20|26 min/, `${locale}: old figures gone`);
    assert.ok(blocks(GIRONA, locale).some((b) => b.type === "faq"), `${locale}: FAQ`);
  }
  assert.match(faqText(GIRONA, "es"), /Cuánto tarda el AVE de Barcelona a Girona/);
  assert.match(faqText(GIRONA, "ca"), /Quant triga l'AVE de Barcelona a Girona/);
});

test("cluster links: rail labels in the searched words, hub, transport passes and Tarragona", () => {
  assert.equal(B2_TITLES.montserratFree.en, "Montserrat cable car or rack railway: times and fares");
  assert.match(B2_TITLES.girona.es, /AVE/);
  assert.match(B2_TITLES.figueres.es, /Museo Dalí/);
  for (const locale of LOCALES) {
    const hub = json(BARCELONA_HUB.editions[locale].blocks);
    assert.ok(hub.includes(b2href("nuria", locale)), `${locale}: hub links Núria`);
    assert.doesNotMatch(hub, /under an hour by high-speed|menos de una en alta|menys d'una en alta/, `${locale}: high-speed to Figueres is about an hour`);
    assert.ok(json(TRANSPORT.editions[locale].blocks).includes(b2href("montserratFree", locale)), `${locale}: transport passes link Montserrat`);
    assert.ok(json(TARRAGONA.editions[locale].blocks).includes(b2href("montserratFree", locale)), `${locale}: Tarragona links Montserrat`);
    assert.ok(json(SITGES.editions[locale].blocks).includes(b2href("montserratFree", locale)), `${locale}: Sitges already links Montserrat`);
  }
});
