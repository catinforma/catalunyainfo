import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Body } from "../src/lib/content/blocks.ts";
import { SITGES, SITGES_QUICK_READ } from "../src/lib/content/batch02/coast-trips.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Barcelona-Sitges train guide: "Quick answer" block and the searchers' H2s,
 * read on 25 Nov 2026 from Rodalies de Catalunya (line page, journey planner,
 * fare page) and ATM. H1 and lead are untouched; the search title and
 * description were rewritten on 27 Nov 2026 (last test; see
 * docs/SEO_EXPERIMENTS.md).
 */

type B = { type: string; title?: string; items?: { label?: string; value?: string; question?: string; answer?: string }[]; text?: string; level?: number };

/** The Rodalies fares change on 1 Jan 2027 and the monthly pass sale ends on 31 Dec 2026. */
const REREAD_BY = "2027-01-02";

test("sitges: quick-answer block is near the top and carries line, stations, journey, fare, last train and the dated source", () => {
  const first = { ca: /R2 Sud/, es: /R2 Sud/, en: /R2 Sud/ };
  const stations = { ca: /Sants.*Passeig de Gràcia.*Estació de França/, es: /Sants.*Passeig de Gràcia.*Estació de França/, en: /Sants.*Passeig de Gràcia.*Estació de França/ };
  const read = { ca: /25 de novembre de 2026/, es: /25 de noviembre de 2026/, en: /25 November 2026/ };
  for (const locale of LOCALES) {
    const blocks = SITGES.editions[locale].blocks as unknown as B[];
    const idx = blocks.findIndex((b) => b.type === "keyFacts");
    assert.ok(idx >= 0 && idx <= 2, `${locale}: key facts within the first three blocks`);
    const facts = blocks[idx]!;
    assert.match(facts.title ?? "", /^(Quick answer|Respuesta rápida|Resposta ràpida)/, `${locale}: titled as the quick answer`);
    const text = JSON.stringify(facts.items);
    assert.match(text, first[locale], `${locale}: line`);
    assert.match(text, stations[locale], `${locale}: stations`);
    assert.match(text, /31–37/, `${locale}: journey range`);
    assert.match(text, /5,50|5\.50/, `${locale}: single fare`);
    assert.match(text, /34,70|34\.70/, `${locale}: T-casual`);
    assert.match(text, /22:22/, `${locale}: last train back`);
    assert.match(text, read[locale], `${locale}: read date`);
  }
});

test("sitges: H2s in the searchers' words, each followed by the fact", () => {
  const how = { ca: "Quant triga el tren de Barcelona a Sitges?", es: "¿Cuánto tarda el tren de Barcelona a Sitges?", en: "How long is the train from Barcelona to Sitges?" } as const;
  const much = { ca: "Quant costa el tren de Barcelona a Sitges?", es: "¿Cuánto cuesta el tren de Barcelona a Sitges?", en: "How much is the train from Barcelona to Sitges?" } as const;
  for (const locale of LOCALES) {
    const blocks = SITGES.editions[locale].blocks as unknown as B[];
    const h2s = blocks.filter((b) => b.type === "heading" && b.level === 2).map((b) => b.text);
    assert.ok(h2s.includes(how[locale]), `${locale}: how long H2 (${h2s.join(" | ")})`);
    assert.ok(h2s.includes(much[locale]), `${locale}: how much H2`);
    const at = blocks.findIndex((b) => b.type === "heading" && b.text === how[locale]);
    const para = blocks[at + 1]?.text ?? "";
    assert.match(para, /31 /, `${locale}: 31 minutes`);
    assert.match(para, /37 /, `${locale}: 37 minutes`);
    assert.match(para, /49/, `${locale}: Estació de França`);
  }
});

test("sitges: FAQ answers repeat the figures of the quick answer", () => {
  for (const locale of LOCALES) {
    const blocks = SITGES.editions[locale].blocks as unknown as B[];
    const faq = blocks.find((b) => b.type === "faq");
    const all = JSON.stringify(faq?.items);
    assert.match(all, /31/, `${locale}: journey`);
    assert.match(all, /22:22/, `${locale}: last train`);
    assert.match(all, /5,50|5\.50/, `${locale}: fare`);
    assert.ok(bodyToPlainText(blocks as unknown as Body).length > 0);
  }
});

test("sitges: quick-answer facts need a re-read after the 1 Jan 2027 fare change", () => {
  assert.equal(SITGES_QUICK_READ, "2026-11-25");
  const today = new Date().toISOString().slice(0, 10);
  if (today > REREAD_BY) {
    assert.ok(SITGES_QUICK_READ >= "2027-01-01", `re-read the Rodalies line page, planner, fare page and ATM T-casual, then update SITGES_QUICK_READ (read ${SITGES_QUICK_READ})`);
  }
});

/**
 * 27 Nov 2026 snippet rewrite (ci-analitica, batch 8H; review 25 Dec 2026):
 * titles in the searched order with the fare, descriptions with the last
 * train each way. The figures must be the body's own, so a fare change on
 * 1 Jan 2027 that updates the quick answer breaks this test until the
 * snippet follows (same REREAD_BY as above).
 */
test("sitges: search title and description lead with the query and repeat the body's fare and last trains", () => {
  const start = { ca: /^Tren Barcelona-Sitges: horaris/, es: /^Tren Barcelona-Sitges: horarios/, en: /^Barcelona to Sitges train: schedule/ } as const;
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, blocks } = SITGES.editions[locale];
    assert.ok(seoTitle.length <= 60, `${locale}: title ${seoTitle.length} chars`);
    assert.ok(seoDescription.length <= 155, `${locale}: description ${seoDescription.length} chars`);
    assert.match(seoTitle, start[locale], `${locale}: query first`);
    const body = JSON.stringify(blocks);
    const fare = locale === "en" ? "€5.50" : "5,50 €";
    assert.ok(seoTitle.includes(fare) && body.includes(fare), `${locale}: title fare is the body's`);
    for (const time of ["0:06", "22:22"]) {
      assert.ok(seoDescription.includes(time) && body.includes(time), `${locale}: ${time} in description and body`);
    }
  }
});
