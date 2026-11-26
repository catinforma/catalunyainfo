import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { PARKING } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CARNIVAL_GUIDE } from "../src/lib/content/batch02/carnival.ts";
import { EASTER_2027 } from "../src/lib/content/batch02/easter-2027.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 26 Nov 2026, low-CTR pages whose title and description are inside their
 * 28-day window: FAQ questions in the searchers' own words (GSC 28 d), body
 * only. Green-zone hours (AREA "Tipos de plazas: Área Verde", read 26 Nov),
 * the day of the mona (Mercats de Barcelona; the Easter Monday holiday of
 * Ordre EMT/52/2026, read 26 Nov), and "Carnestoltes" / "Dijous Llarder"
 * in the carnival questions.
 */

type Faq = { question: string; answer: string };

function faqs(blocks: Block[]): Faq[] {
  return blocks.flatMap((b) => ((b as { type: string }).type === "faq" ? ((b as unknown as { items: Faq[] }).items ?? []) : []));
}

test("parking: a green-zone hours question in each language, with AREA's 8:00-20:00 / 8:00-22:00 hours and no Sunday charge", () => {
  const q = { ca: /horari de la zona verda/, es: /horario de la zona verde/, en: /green zone hours/ } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(PARKING.editions[locale].blocks);
    assert.match(text, q[locale], locale);
    const item = faqs(PARKING.editions[locale].blocks).find((f) => q[locale].test(f.question));
    assert.ok(item, `${locale}: FAQ item`);
    assert.match(item.answer, /8[.:]00 (a|to) 20[.:]00/, locale);
    assert.match(item.answer, /8[.:]00 (a|to) 22[.:]00/, locale);
    assert.match(item.answer, /(diumenge|domingo|Sundays).*(platja|playa|beach)/, `${locale}: Sunday line hedged to away from the beach`);
  }
});

test("Easter 2027: 'when is mona day' is answered with Easter Monday, 29 March, in each language", () => {
  const q = { ca: /dia de la mona/, es: /día de la mona/, en: /mona day/ } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(EASTER_2027.editions[locale].blocks);
    const line = text.split("\n").find((l) => q[locale].test(l) && /\?/.test(l));
    assert.ok(line, `${locale}: question present`);
    const item = faqs(EASTER_2027.editions[locale].blocks).find((f) => q[locale].test(f.question));
    const answer = item?.answer ?? text.slice(text.indexOf(line!), text.indexOf(line!) + 600);
    assert.match(answer, /29 (de )?(març|marzo|March)|March 29/, `${locale}: the answer itself gives 29 March`);
    assert.match(answer, /Mercats de Barcelona/, `${locale}: the answer cites Mercats de Barcelona`);
  }
});

test("Carnival 2027: the questions use the Catalan searchers' word, Carnestoltes, and Dijous Llarder", () => {
  const q = { ca: /Quan és el Carnestoltes \(Carnaval\) 2027\?/, es: /¿Cuándo es el Carnaval \(Carnestoltes\) 2027\?/, en: /When is Carnival \(Carnestoltes\) 2027 in Catalonia\?/ } as const;
  for (const locale of LOCALES) assert.match(bodyToPlainText(CARNIVAL_GUIDE.editions[locale].blocks), q[locale], locale);
  assert.match(bodyToPlainText(CARNIVAL_GUIDE.editions.ca.blocks), /Quan és el Dijous Gras \(Dijous Llarder\) 2027\?/);
});
