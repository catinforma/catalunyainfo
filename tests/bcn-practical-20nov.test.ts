import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Body } from "../src/lib/content/blocks.ts";
import { PARKING, TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { SITGES, TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { LAST_VERIFIED } from "../src/lib/content/tourist-tax/rates.ts";
import { buildBody } from "../src/lib/content/tourist-tax/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Barcelona practical evergreen guides, 20 Nov 2026 (body only; titles,
 * descriptions and leads untouched: they are in the windows logged in
 * docs/SEO_EXPERIMENTS.md). Every figure below was re-read that day on the
 * official source: AREA + Ordenança fiscal 3.12 (BOPB 2-2-2026), TMB/ATM,
 * the ATC tariff page, the Rodalies planner and R2 timetable.
 */

type B = { type: string; text?: string; rows?: string[][]; items?: unknown[]; caption?: string };
const json = (blocks: unknown) => JSON.stringify(blocks);

test("parking: the 2026 rates are dated to the ordinance and decomposed from the label tables", () => {
  const date = { ca: /2 de febrer de 2026/, es: /2 de febrero de 2026/, en: /2 February 2026/ } as const;
  const supplement = { ca: /C \+0,75 €, B \+1,00 € i sense distintiu \+1,25 €/, es: /C \+0,75 €, B \+1,00 € y sin distintivo \+1,25 €/, en: /C \+€0\.75, B \+€1\.00 and no label \+€1\.25/ } as const;
  const base = { ca: /blava A 2,50 €, blava B 2,25 €, verda A 3,00 €, verda B 2,75 €/, es: /azul A 2,50 €, azul B 2,25 €, verde A 3,00 €, verde B 2,75 €/, en: /blue A €2\.50, blue B €2\.25, green A €3\.00, green B €2\.75/ } as const;
  const until = { ca: /Fins a quina hora es paga la zona blava/, es: /Hasta qué hora se paga la zona azul/, en: /Until what time do you pay for blue zone parking/ } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(PARKING.editions[locale].blocks);
    assert.match(text, date[locale], `${locale}: ordinance publication date`);
    assert.match(text, base[locale], `${locale}: base per zone = the ECO row`);
    assert.match(text, supplement[locale], `${locale}: label supplements`);
    assert.match(text, /\+?2 €|€2 more/, `${locale}: pollution-episode surcharge`);
    assert.match(text, /136/, `${locale}: Zone 36 overlap with Zone 20`);
    assert.match(text, /36 (zones|zonas|resident zones)/, `${locale}: 36 resident zones`);
    assert.match(text, until[locale], `${locale}: "hasta qué hora" FAQ`);
    assert.doesNotMatch(text, /S'activa el 9|Se activa el 9|goes live on 9/, `${locale}: Zone 36 is live, not upcoming`);
  }
  assert.ok(PARKING.sources.some((s) => s.url.endsWith("/2026-11/3.12-taxa-estacionament-regulat-vehicles.pdf")));
  assert.ok(!PARKING.sources.some((s) => s.url.includes("/2021-01/3.12")), "the 2021 ordinance PDF is gone");
});

test("transport: where to buy, the airport by train or bus, Sitges zones, and the 20 Nov as-of", () => {
  const buy = { ca: "On es compra la T-casual?", es: "¿Dónde se compra la T-casual?", en: "Where to buy a T-casual" } as const;
  const asOf = { ca: /a 20 de novembre de 2026/, es: /a 20 de noviembre de 2026/, en: /as of 20 November 2026/ } as const;
  for (const locale of LOCALES) {
    const blocks = TRANSPORT.editions[locale].blocks as B[];
    const text = bodyToPlainText(blocks as unknown as Body);
    assert.ok(blocks.some((b) => b.type === "heading" && b.text === buy[locale]), `${locale}: where-to-buy H2`);
    assert.match(text, asOf[locale], `${locale}: as-of date`);
    assert.match(text, /Rodalies/, `${locale}: airport by Rodalies`);
    assert.ok(json(blocks).includes(b2href("sitges", locale)), `${locale}: link to Sitges`);
    assert.ok(json(blocks).includes(b2href("touristTax", locale)), `${locale}: link to the tourist tax`);
  }
  assert.ok(bodyToPlainText(TRANSPORT.editions.es.blocks).includes("¿Se puede compartir la T-casual?"));
});

test("tourist tax: re-read 20 Nov, three FAQs in the searchers' words, links to the practical guides", () => {
  assert.equal(LAST_VERIFIED, "2026-11-20");
  const q = {
    ca: ["Què és la taxa turística de Barcelona?", "La taxa turística va inclosa en el preu de l'hotel?", "Es paga taxa turística a Sitges, Girona o Tarragona?"],
    es: ["¿Qué es la tasa turística de Barcelona?", "¿La tasa turística está incluida en el precio del hotel?", "¿Se paga tasa turística en Sitges, Girona o Tarragona?"],
    en: ["What is the city tax in Barcelona?", "Is the city tax included in the hotel price?", "Is there a tourist tax in Sitges, Girona or Tarragona?"],
  } as const;
  for (const locale of LOCALES) {
    const blocks = buildBody(locale);
    const text = bodyToPlainText(blocks as unknown as Body);
    for (const question of q[locale]) assert.ok(text.includes(question), `${locale}: ${question}`);
    assert.doesNotMatch(text, /\{[a-zA-Z0-9]+\}/, `${locale}: every placeholder filled`);
    for (const key of ["transport", "airport", "sitges"] as const) {
      assert.ok(json(blocks).includes(b2href(key, locale)), `${locale}: link to ${key}`);
    }
  }
});

test("sitges: every train by direction and day type, re-read 20 Nov; Tarragona keeps its own date", () => {
  assert.equal(SITGES.verifiedAt, "2026-11-20");
  assert.equal(TARRAGONA.verifiedAt, "2026-10-28", "Tarragona was not re-read");
  const how = { ca: "Com anar de Barcelona a Sitges?", es: "¿Cómo ir de Barcelona a Sitges?", en: "How do I get from Barcelona to Sitges?" } as const;
  for (const locale of LOCALES) {
    const blocks = SITGES.editions[locale].blocks as B[];
    const text = bodyToPlainText(blocks as unknown as Body);
    const all = blocks.find((b) => b.type === "table" && (b.rows?.length ?? 0) === 7);
    assert.ok(all, `${locale}: the all-trains table`);
    assert.equal(all?.rows?.[0]?.[1], "5:45", `${locale}: first train from Sants`);
    assert.match(all?.rows?.[2]?.[1] ?? "", /0:06/, `${locale}: last train from Sants`);
    assert.match(all?.rows?.[6]?.[1] ?? "", /22:22/, `${locale}: last train back`);
    assert.ok(text.includes(how[locale]), `${locale}: "barcelona to sitges" FAQ`);
    assert.ok(json(blocks).includes(b2href("touristTax", locale)), `${locale}: link to the tourist tax`);
    assert.ok(json(blocks).includes(b2href("transport", locale)), `${locale}: link to the transport passes`);
  }
});

test("Barcelona hub links the tourist tax guide in every language", () => {
  for (const locale of LOCALES) {
    assert.ok(json(BARCELONA_HUB.editions[locale].blocks).includes(b2href("touristTax", locale)), locale);
  }
});
