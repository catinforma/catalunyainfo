import assert from "node:assert/strict";
import { test } from "node:test";

import { NEXT, YEAR, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { HUB_FAQ_TITLE, hubFaq } from "../src/lib/programmatic/holidays/hub-faq.ts";
import { town2027Days } from "../src/lib/programmatic/holidays/town-2027.ts";
import { faqSchema } from "../src/lib/seo/jsonld.ts";

/**
 * 27 Nov 2026: the questions on the three holiday hubs (lib/programmatic/holidays/hub-faq.ts),
 * every answer built from the data the hub prints. Nothing typed: the 6 and 26 December answers
 * follow the two Catalonia-wide orders, Barcelona's line follows town2027Days.
 */

const LOCALES = ["ca", "es", "en"] as const;

test("five questions per hub, unique, with titles, and the same items in the FAQPage", () => {
  for (const locale of LOCALES) {
    const items = hubFaq(locale);
    assert.equal(items.length, 5, locale);
    assert.equal(new Set(items.map((i) => i.question)).size, 5, `${locale}: unique questions`);
    assert.ok(HUB_FAQ_TITLE[locale].length > 0);
    for (const item of items) {
      assert.doesNotMatch(item.answer, /undefined|NaN|\(\)|  /, `${locale}: ${item.question}`);
      assert.match(item.answer, /[.]$/, `${locale}: ends with a full stop`);
    }
    const schema = faqSchema([{ type: "faq", items }]) as { mainEntity: { name: string }[] };
    assert.deepEqual(
      schema.mainEntity.map((q) => q.name),
      items.map((i) => i.question),
    );
  }
});

test("English questions are in searchers' words", () => {
  const q = hubFaq("en").map((i) => i.question);
  assert.ok(q.includes(`What are the public holidays in Barcelona in ${NEXT}?`));
  assert.ok(q.includes("Is 6 December a public holiday in Catalonia?"));
  assert.ok(q.includes("Is Boxing Day (26 December) a public holiday in Barcelona?"));
  assert.ok(q.includes("Is Easter Monday a public holiday in Catalonia?"));
});

test("6 and 26 December answers follow the orders of both years", () => {
  for (const [monthDay, index] of [["12-06", 1], ["12-26", 2]] as const) {
    const answer = hubFaq("en")[index]!.answer;
    for (const year of [YEAR, NEXT]) {
      const listed = regionalDays(year).some((d) => d.date === `${year}-${monthDay}`);
      assert.match(answer, new RegExp(`in ${year}, ${listed ? "yes" : "no"}`, "i"), `${monthDay} ${year}`);
    }
  }
  // As of the 2026 and 2027 orders: 6 Dec only in 2027, 26 Dec only in 2026.
  if (YEAR === 2026) {
    assert.match(hubFaq("en")[1]!.answer, /In 2026, no: it falls on a Sunday.*in 2027, yes: Monday 6 December, Constitution Day/);    assert.match(hubFaq("en")[2]!.answer, /in 2026, yes: Saturday 26 December, Saint Stephen's Day.*in 2027, no: it falls on a Sunday/i);
    assert.match(hubFaq("es")[1]!.answer, /En 2026, no: cae en domingo.*en 2027, sí: el lunes 6 de diciembre/);
    assert.match(hubFaq("ca")[2]!.answer, /El 2026, sí: el dissabte 26 de desembre.*el 2027, no: cau en diumenge/);
  }
});

test("Barcelona's next-year line: every Catalonia-wide day and the town's own days in its current state", () => {
  const t = town2027Days({ slug: "barcelona" });
  for (const locale of LOCALES) {
    const answer = hubFaq(locale)[0]!.answer;
    for (const d of regionalDays(NEXT)) assert.ok(answer.includes(d.name[locale]), `${locale}: ${d.name[locale]}`);
    if (t.state === "council") {
      assert.match(answer, locale === "en" ? /Monday 17 May \(Whit Monday\) and Friday 24 September \(La Mercè\)/ : /17/, locale);
      assert.match(answer, /City Council|Ayuntamiento|Ajuntament/, `${locale}: says who approved them`);
    }
    if (t.state === "pending") assert.match(answer, /not been published|no se han publicado|no s'han publicat/, locale);
    if (t.state === "dogc") assert.doesNotMatch(answer, /City Council|Ayuntamiento|Ajuntament/, `${locale}: no council wording once the order is in`);
  }
});

test("Easter Monday answer names both years' dates from the data", () => {
  const answer = hubFaq("en")[3]!.answer;
  for (const year of [YEAR, NEXT]) {
    const d = regionalDays(year).find((x) => /Easter Monday/.test(x.name.en));
    if (d) assert.ok(answer.includes(year.toString()), `${year}`);
  }
  if (YEAR === 2026) assert.match(answer, /Monday 6 April 2026 and Monday 29 March 2027/);
});
