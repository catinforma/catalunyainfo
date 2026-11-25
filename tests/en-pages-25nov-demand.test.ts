import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { ZBE } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CRUISEPORT } from "../src/lib/content/batch02/cruiseport.ts";
import { PARLIAMENT_NEXT_REREAD_BY, PARLIAMENT_RESULTS } from "../src/lib/content/batch02/election-results.ts";

// 25 Nov 2026, English pages at positions 8-12 (second pass): the Catalan
// Parliament page answers "next catalan election" with dates, the cruise port
// page answers the shuttle and journey-time questions, the LEZ page answers
// rental cars and tourists. Sources in the code comments of each file.

type Faq = { question: string; answer: string };
function faqOf(blocks: unknown[]): Faq[] {
  const f = (blocks as { type: string; items?: Faq[]; questions?: Faq[] }[]).find((b) => b.type === "faq");
  assert.ok(f, "no FAQ block");
  return (f.items ?? f.questions) as Faq[];
}
const today = () => new Date().toISOString().slice(0, 10);
const LOCALES = ["ca", "es", "en"] as const;

test("date guard: 'no Catalan election has been called' is re-read before the guard date", () => {
  assert.ok(today() < PARLIAMENT_NEXT_REREAD_BY, `From ${PARLIAMENT_NEXT_REREAD_BY}: check eleccions.gencat.cat and the DOGC for a Parliament election call, update election-results.ts, then move PARLIAMENT_NEXT_REREAD_BY.`);
});

test("Catalan Parliament: Sunday 11 June 2028 follows LOREG art. 42.2 (25 days, 54th day), in ca/es/en", () => {
  // Statute 2006, art. 66: the term ends four years after the election date. LOREG art. 42.2 (applied to regional
  // parliaments by additional provision 1.2): decree issued the 25th day before the term ends, published the next
  // day, election on the 54th day after publication. Catalonia 2010 followed the same count (published 5 Oct, vote 28 Nov).
  const DAY = 86400000;
  const end = Date.UTC(2028, 4, 12);
  const issued = end - 25 * DAY;
  const published = issued + DAY;
  const vote = new Date(published + 54 * DAY);
  assert.deepEqual([new Date(issued).getUTCMonth(), new Date(issued).getUTCDate()], [3, 17]);
  assert.deepEqual([vote.getUTCFullYear(), vote.getUTCMonth(), vote.getUTCDate(), vote.getUTCDay()], [2028, 5, 11, 0], "Sunday 11 June 2028");
  assert.equal((Date.UTC(2010, 10, 28) - Date.UTC(2010, 9, 5)) / DAY, 54, "2010 precedent: 54 days after publication");
  const expect = {
    en: /12 May 2028[\s\S]*Sunday 11 June 2028[\s\S]*17 April[\s\S]*54th day[\s\S]*42\.2/,
    es: /12 de mayo de 2028[\s\S]*domingo 11 de junio de 2028[\s\S]*17 de abril[\s\S]*día 54[\s\S]*42\.2/,
    ca: /12 de maig de 2028[\s\S]*diumenge 11 de juny de 2028[\s\S]*17 d'abril[\s\S]*dia 54[\s\S]*42\.2/,
  } as const;
  const heading = { en: "When is the next Catalan election?", es: "¿Cuándo son las próximas elecciones catalanas?", ca: "Quan són les properes eleccions catalanes?" } as const;
  for (const locale of LOCALES) {
    const blocks = PARLIAMENT_RESULTS.editions[locale].blocks as { type: string; level?: number; text?: string }[];
    const i = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === heading[locale]);
    assert.notEqual(i, -1, `${locale}: H2`);
    const section = bodyToPlainText(blocks.slice(i, i + 2) as never);
    assert.match(section, expect[locale], locale);
    assert.match(section, /67\.3/, locale);
    const faq = faqOf(blocks);
    const q = faq.find((f) => /11 (June|de junio|de juny) (de )?2028/.test(f.answer) && /17 (April|de abril|d'abril)/.test(f.answer));
    assert.ok(q, `${locale}: FAQ with the date`);
    assert.doesNotMatch(section + JSON.stringify(faq), /26 (June|de junio|de juny)|15 (days|días|dies)|quince|quinze|fifteen/i, `${locale}: the old window and the 15-day claim are gone`);
    assert.ok(faq.some((f) => /2017/.test(f.answer) && /2021/.test(f.answer) && /2024/.test(f.answer)), `${locale}: how often`);
  }
});

test("Cruise port: shuttle and journey-time answers, operator wording, ca/es/en", () => {
  for (const locale of LOCALES) {
    const blocks = CRUISEPORT.editions[locale].blocks;
    const faq = faqOf(blocks);
    const shuttle = faq.find((f) => /3,50|3\.50/.test(f.answer) && /Plaça de Catalunya|plaza de Catalunya|plaça de Catalunya/.test(f.answer));
    assert.ok(shuttle, `${locale}: shuttle FAQ`);
    assert.ok(faq.some((f) => /5 (minutes|minutos|minuts)/.test(f.answer)), `${locale}: journey-time FAQ`);
    const text = bodyToPlainText(blocks);
    assert.match(text, /\/(guides|guies|guias)\/.*(sagrada|free-museums|museus|museos)|Sagrada Fam/i, locale);
  }
});

test("Barcelona LEZ: rental cars and tourists FAQ without inventing an AMB rule, ca/es/en", () => {
  for (const locale of LOCALES) {
    const faq = faqOf(ZBE.editions[locale].blocks);
    const rental = faq.find((f) => /(rental|alquiler|lloguer)/i.test(f.question));
    assert.ok(rental, `${locale}: rental question`);
    assert.match(rental.answer, /0, ECO, C/, locale);
    assert.match(rental.answer, /(foreign|extranjera|estrangera)/, locale);
    const tourists = faq.find((f) => /(tourists|turistas|turistes)/i.test(f.question));
    assert.ok(tourists, `${locale}: tourists question`);
    assert.match(tourists.answer, /7[:.]00|7:00/, locale);
    assert.match(tourists.answer, /24/, locale);
  }
});
