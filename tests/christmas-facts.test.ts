import assert from "node:assert/strict";
import { test } from "node:test";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { factsSources, hoursOf, townFacts, townFaq, hubFaq, plain } from "../src/lib/programmatic/christmas-fairs/facts.ts";
import { FAIRS, SNAPSHOT, hasEnglish, linesFor, towns } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { FAQ_SLUGS, TOP_SLUGS, faqNode, factsContextFor, hubFaqItems, hubTopRows, townFaqFor } from "../src/lib/programmatic/christmas-fairs/page-facts.ts";
import { FAIRS_LOCALES, type FairsLocale } from "../src/lib/programmatic/christmas-fairs/paths.ts";

const BAD = /undefined|\bnull\b|NaN|\[object|\{|\}|\[[^\]]*\]\(/;

/** Every town page in every locale it exists in. */
const pages = towns().flatMap((town) =>
  FAIRS_LOCALES.filter((l) => l !== "en" || hasEnglish(town)).map((locale) => ({ town, locale: locale as FairsLocale })),
);

test("fact table: every page has a dates row, no placeholder text, and only rows its data has", () => {
  assert.ok(pages.length > 100);
  for (const { town, locale } of pages) {
    const ctx = factsContextFor(town);
    const tables = townFacts(town.fairs, ctx, locale);
    assert.equal(tables.length, town.fairs.length);
    tables.forEach((table, i) => {
      const fair = town.fairs[i]!;
      const keys = table.rows.map((r) => r.key);
      assert.equal(keys[0], "dates", `${town.slug}/${locale}`);
      for (const row of table.rows) {
        assert.ok(row.value.trim().length > 1, `${town.slug}/${locale}/${row.key} is empty`);
        assert.doesNotMatch(row.value, BAD, `${town.slug}/${locale}/${row.key}: ${row.value}`);
        assert.doesNotMatch(row.label, BAD);
      }
      // A row exists only when its field does.
      assert.equal(keys.includes("hours"), hoursOf(fair, locale) !== null, `${town.slug}/${locale} hours`);
      assert.equal(keys.includes("place"), Boolean(fair.place), `${town.slug}/${locale} place`);
      assert.equal(keys.includes("entry"), Boolean(fair.details?.tickets), `${town.slug}/${locale} entry`);
      assert.equal(keys.includes("getThere"), (ctx.lines.length > 0 && ctx.lines.length <= 3) || Boolean(fair.details?.access?.length), `${town.slug}/${locale} getThere`);
      if (fair.place) assert.equal(table.rows.find((r) => r.key === "place")!.value, fair.place);
    });
  }
});

test("fact table: a fair with no published hours gets no hours row (Mataró says so in its hours text)", () => {
  const mataro = towns().find((t) => t.slug === "mataro")!;
  for (const locale of FAIRS_LOCALES.filter((l) => l !== "en")) {
    assert.equal(hoursOf(mataro.fairs[0]!, locale), null);
    assert.ok(!townFacts(mataro.fairs, factsContextFor(mataro), locale)[0]!.rows.some((r) => r.key === "hours"));
  }
});

test("fact table: Vic carries the organiser's hours and a pointer to its directions (which already name R3, so no second train line)", () => {
  const vic = towns().find((t) => t.slug === "vic")!;
  const rows = townFacts(vic.fairs, factsContextFor(vic), "en")[0]!.rows;
  assert.match(rows.find((r) => r.key === "hours")!.value, /10:00 to 21:00/);
  const got = rows.find((r) => r.key === "getThere")!;
  assert.equal(got.seeDirections, true);
  assert.doesNotMatch(got.value, /By train/);
});

test("fact table: a town with up to three lines and no organiser directions names its line; a city with more (Barcelona: 14) lists none", () => {
  const arboc = towns().find((t) => t.slug === "l-arboc")!;
  const got = townFacts(arboc.fairs, factsContextFor(arboc), "ca")[0]!.rows.find((r) => r.key === "getThere")!;
  assert.match(got.value, /R4/);
  assert.equal(got.seeDirections, false);
  const bcn = towns().find((t) => t.slug === "barcelona")!;
  const ctx = factsContextFor(bcn);
  assert.ok(ctx.lines.length > 3, "fixture: Barcelona has more than three lines");
  for (const locale of FAIRS_LOCALES) {
    for (const table of townFacts(bcn.fairs, ctx, locale)) {
      for (const row of table.rows.filter((r) => r.key === "getThere")) {
        assert.doesNotMatch(row.value, /R2 Nord|RG1|R17/, `${locale}: ${row.value}`);
        assert.equal(row.seeDirections, true);
      }
    }
    for (const item of townFaq(bcn, ctx, locale)) assert.doesNotMatch(item.answer, /R2 Nord|RG1|R17/, `${locale}: ${item.question}`);
  }
  // Without the organiser's directions (Sagrada Família, Nadal al Port) there is no "how to get there" row at all.
  const tables = townFacts(bcn.fairs, ctx, "en");
  assert.ok(tables.some((t) => !t.rows.some((r) => r.key === "getThere")));
  // With several fairs, a directions answer says which fair each line is for.
  const how = townFaq(bcn, ctx, "en").find((i) => /get to/.test(i.question))!;
  assert.match(how.answer, /^Fira de Santa Llúcia: /);
});

test("place: when the organiser names none and the calendar's place is shown, the calendar and its reading day are the place's source", () => {
  const fromDataset = FAIRS.filter((f) => f.placeFromDataset);
  assert.ok(fromDataset.length >= 10);
  assert.ok(fromDataset.every((f) => f.place && f.checked), "an organiser's page was read, the place is the calendar's");
  for (const slug of ["cardedeu", "arbucies", "l-arboc"]) {
    const town = towns().find((t) => t.slug === slug)!;
    const ctx = factsContextFor(town);
    for (const locale of FAIRS_LOCALES.filter((l) => l !== "en")) {
      const place = townFaq(town, ctx, locale).find((i) => /^(On |¿Dónde)/.test(i.question));
      if (!place) continue;
      const fair = town.fairs[0]!;
      if (!fair.placeFromDataset) continue;
      assert.match(place.answer, /(calendari oficial de fires|calendario oficial de ferias)/, `${slug}/${locale}: ${place.answer}`);
      assert.ok(!place.answer.includes(fair.checked!.publisher), `${slug}/${locale} cites the organiser for the place: ${place.answer}`);
    }
  }
  // Cardedeu (organiser page read, place from the calendar): the table's source line names both, the place's marked.
  const cardedeu = towns().find((t) => t.slug === "cardedeu")!;
  assert.ok(cardedeu.fairs[0]!.placeFromDataset);
  const line = factsSources(cardedeu.fairs, factsContextFor(cardedeu), "ca");
  assert.match(line, /per al lloc: calendari oficial de fires/);
  assert.match(line, new RegExp(cardedeu.fairs[0]!.checked!.publisher.replace(/[()]/g, ".")));
  // A place the organiser's page gives keeps the organiser as its source.
  const vic = towns().find((t) => t.slug === "vic")!;
  assert.ok(!vic.fairs[0]!.placeFromDataset);
  assert.doesNotMatch(factsSources(vic.fairs, factsContextFor(vic), "ca"), /per al lloc/);
});

test("wording: no nested brackets in any cell or answer; Tarragona's hours carry no editorial note; Olot's place is lowercase inside brackets", () => {
  const nested = /\([^()]*\([^()]*\)[^()]*\)/;
  for (const { town, locale } of pages) {
    const ctx = factsContextFor(town);
    for (const table of townFacts(town.fairs, ctx, locale)) for (const row of table.rows) assert.doesNotMatch(row.value, nested, `${town.slug}/${locale}/${row.key}: ${row.value}`);
    for (const item of townFaq(town, ctx, locale)) assert.doesNotMatch(item.answer, nested, `${town.slug}/${locale}: ${item.answer}`);
  }
  for (const locale of FAIRS_LOCALES) for (const item of hubFaqItems(locale)) assert.doesNotMatch(item.answer, nested, `hub/${locale}: ${item.answer}`);
  const tarragona = towns().find((t) => t.slug === "tarragona")!;
  for (const locale of FAIRS_LOCALES) {
    const all = townFaq(tarragona, factsContextFor(tarragona), locale).map((i) => i.answer).join(" ") + tarragona.fairs.map((f) => hoursOf(f, locale)).join(" ");
    assert.doesNotMatch(all, /també diu|también dice|also says|línia de durada|línea de duración|duration line/);
  }
  assert.match(townFaq(tarragona, factsContextFor(tarragona), "ca")[0]!.answer, /Rambla Nova \(tram Balc/);
  assert.doesNotMatch(townFaq(tarragona, factsContextFor(tarragona), "ca")[0]!.answer, /\(Rambla Nova/);
  const olot = towns().find((t) => t.slug === "olot")!;
  const dates = townFaq(olot, factsContextFor(olot), "ca")[0]!.answer;
  assert.match(dates, /\(del carrer de Sant Esteve a la plaça del Carme\)/);
  // Proper names keep their capital.
  const granollers = towns().find((t) => t.slug === "granollers")!;
  assert.match(townFaq(granollers, factsContextFor(granollers), "ca")[0]!.answer, /Roca Umbert/);
});

test("the fact table's CSS wraps long unbroken cells, and does not reuse the definition list's .ci-facts", () => {
  const css = readFileSync(join(import.meta.dirname, "..", "src/app/globals.css"), "utf8");
  assert.match(css, /\.ci-fair-facts td \{[^}]*overflow-wrap: anywhere/);
  const tsx = readFileSync(join(import.meta.dirname, "..", "src/components/programmatic/christmas-fairs/facts-parts.tsx"), "utf8");
  assert.match(tsx, /className="ci-fair-facts"/);
  assert.doesNotMatch(tsx, /className="ci-facts"/);
});

test("fact table: an unconfirmed fair says so next to its dates", () => {
  const arboc = towns().find((t) => t.slug === "l-arboc")!;
  for (const locale of ["ca", "es", "en"] as const) {
    const dates = townFacts(arboc.fairs, factsContextFor(arboc), locale)[0]!.rows[0]!.value;
    assert.match(dates, /2026/);
    assert.match(dates, /\(.*2026.*\)$/);
  }
});

test("FAQ: always the dates; other questions only when the page has the data; empty below two answers", () => {
  let withFaq = 0;
  for (const { town, locale } of pages) {
    const ctx = factsContextFor(town);
    const faq = townFaq(town, ctx, locale);
    const hours = town.fairs.some((f) => hoursOf(f, locale));
    const place = town.fairs.some((f) => f.place);
    const how = (ctx.lines.length > 0 && ctx.lines.length <= 3) || town.fairs.some((f) => f.details?.access?.length);
    const entry = town.fairs.some((f) => f.details?.tickets);
    const expected = 1 + Number(hours) + Number(place) + Number(how) + Number(entry);
    if (expected < 2) {
      assert.deepEqual(faq, [], `${town.slug}/${locale} should have no FAQ`);
      continue;
    }
    withFaq++;
    assert.equal(faq.length, expected, `${town.slug}/${locale}`);
    assert.match(faq[0]!.question, /2026/);
    for (const item of faq) {
      assert.ok(item.question.endsWith("?"));
      assert.ok(item.answer.length > 10);
      assert.doesNotMatch(item.question + item.answer, BAD, `${town.slug}/${locale}: ${item.answer}`);
      assert.equal(item.answer, plain(item.answer), "answers carry no Markdown");
    }
    // Every answer names where and when it was read.
    assert.match(faq[0]!.answer, /2026/);
  }
  assert.ok(withFaq > 100);
});

test("FAQ: the dates answer states the dates the page shows, and the read date", () => {
  const canyelles = towns().find((t) => t.slug === "canyelles")!;
  const faq = townFaqFor(canyelles, "es");
  assert.match(faq[0]!.question, /Canyelles/);
  // 25 Nov 2026: the answer lists both of Canyelles' fairs (the Petita Llúcia is its own entry).
  assert.match(faq[0]!.answer, /Feria de Santa Llúcia: 21 y 22 de noviembre.*Petita Llúcia: 28 y 29 de noviembre/);
  assert.match(faq[0]!.answer, /leído el \d+ de noviembre de 2026/);
  const hours = faq.find((i) => /A qué hora/.test(i.question))!;
  assert.match(hours.answer, /9 a 21 h/);
});

test("FAQPage JSON-LD is the visible FAQ, question by question", () => {
  for (const { town, locale } of pages) {
    const items = townFaqFor(town, locale);
    const node = faqNode(items) as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | null;
    if (items.length === 0) {
      assert.equal(node, null);
      continue;
    }
    assert.equal(node!["@type"], "FAQPage");
    assert.deepEqual(
      node!.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
      items.map((i) => [i.question, i.answer]),
      `${town.slug}/${locale}`,
    );
  }
});

test("hub: the top-fairs table lists real fairs with their data, English only for towns with an English page", () => {
  for (const locale of FAIRS_LOCALES) {
    const rows = hubTopRows(locale);
    assert.ok(rows.length >= 4, locale);
    for (const r of rows) {
      assert.ok(r.slug && r.name && r.dates && r.town);
      assert.doesNotMatch(`${r.name} ${r.town} ${r.dates} ${r.hours ?? ""} ${r.place ?? ""}`, BAD);
      if (locale === "en") assert.ok(hasEnglish(towns().find((t) => t.slug === r.slug)!));
    }
    const starts = rows.map((r) => r.start);
    assert.deepEqual(starts, [...starts].sort());
  }
  assert.ok(TOP_SLUGS.includes("barcelona"));
});

test("hub: FAQ answers the count and the headline towns from the same data as their pages", () => {
  for (const locale of FAIRS_LOCALES) {
    const faq = hubFaqItems(locale);
    assert.ok(faq.length >= 3, locale);
    assert.match(faq[0]!.answer, new RegExp(String(FAIRS.length)));
    for (const item of faq) assert.doesNotMatch(item.question + item.answer, BAD, `${locale}: ${item.answer}`);
    const barcelona = townFaqFor(towns().find((t) => t.slug === "barcelona")!, locale);
    assert.ok(faq.some((i) => i.question === barcelona[0]!.question && i.answer.startsWith(barcelona[0]!.answer)));
    const node = faqNode(faq) as { mainEntity: { name: string }[] };
    assert.equal(node.mainEntity.length, faq.length);
  }
  assert.ok(FAQ_SLUGS.every((s) => towns().some((t) => t.slug === s)));
});

test("hub FAQ is empty with fewer than two answerable questions", () => {
  assert.deepEqual(hubFaq([], 0, [], SNAPSHOT.readOn, "ca", () => ""), []);
  const town = towns()[0]!;
  assert.deepEqual(hubFaq([], 0, [{ town, ctx: { lines: linesFor(town), calendarReadOn: SNAPSHOT.readOn } }], SNAPSHOT.readOn, "ca", () => ""), []);
});

test("hub FAQ: the count does not claim every fair has an official date; it says how many are unconfirmed (ca/es/en)", () => {
  const unconfirmed = FAIRS.filter((f) => f.unconfirmed || f.toConfirm).length;
  assert.ok(unconfirmed > 0, "fixture: some fairs are unconfirmed");
  for (const locale of FAIRS_LOCALES) {
    const answer = hubFaqItems(locale)[0]!.answer;
    assert.doesNotMatch(answer, /amb data oficial|con fecha oficial|with official dates/, `${locale}: ${answer}`);
    assert.match(answer, new RegExp(`${FAIRS.length} `));
    assert.match(answer, new RegExp(`${unconfirmed} (d'aquestes|de ellas|of them)`), `${locale}: ${answer}`);
    assert.match(answer, /calendari oficial|calendario oficial|official calendar/);
  }
});
