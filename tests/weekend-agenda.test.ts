import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { normaliseEvent, slugify, weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { EVERGREEN, buildEvergreenBody } from "../src/lib/content/weekend/evergreen.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The weekend page failed by showing a past weekend for three weeks. These
 * tests are about the two ways that can happen again: the window computed for
 * the wrong days, or a date creeping back into text that is meant to be
 * evergreen.
 */

/* -------------------------------------------------------------------------- */
/* The window                                                                 */
/* -------------------------------------------------------------------------- */

test("midweek, the window is the coming Friday to Sunday", () => {
  // Wednesday 21 October 2026.
  assert.deepEqual(weekendWindow("2026-10-21"), { from: "2026-10-23", to: "2026-10-25", long: false });
});

test("during the weekend, the window is the weekend you are in", () => {
  assert.equal(weekendWindow("2026-10-24").from, "2026-10-23"); // Saturday
  assert.equal(weekendWindow("2026-10-25").from, "2026-10-23"); // Sunday
  assert.equal(weekendWindow("2026-10-23").from, "2026-10-23"); // Friday
});

test("a Monday public holiday makes it a long weekend", () => {
  // 12 October 2026 is a Monday and a Catalonia-wide holiday.
  assert.deepEqual(weekendWindow("2026-10-07"), { from: "2026-10-09", to: "2026-10-12", long: true });
  // And on the holiday itself, the reader is still in that weekend.
  assert.equal(weekendWindow("2026-10-12").from, "2026-10-09");
});

test("an ordinary Monday looks ahead to the next weekend", () => {
  assert.equal(weekendWindow("2026-10-19").from, "2026-10-23");
});

test("a Friday public holiday is included", () => {
  // 25 December 2026 is a Friday.
  const window = weekendWindow("2026-12-23");
  assert.equal(window.from, "2026-12-25");
  assert.equal(window.long, true);
});

/* -------------------------------------------------------------------------- */
/* Normalising the source                                                     */
/* -------------------------------------------------------------------------- */

const WINDOW = { from: "2026-10-09", to: "2026-10-12", long: true };
const NAMES = new Map([["sant-cugat-del-valles", "Sant Cugat del Vallès"]]);

function row(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    codi: "1",
    denominaci: "Fira de la Tardor",
    espai: "Plaça Major",
    comarca_i_municipi: "agenda:ubicacions/barcelona/valles-occidental/sant-cugat-del-valles",
    comarca: "agenda:ubicacions/barcelona/valles-occidental",
    data_inici: "2026-10-10T00:00:00.000",
    data_fi: "2026-10-11T00:00:00.000",
    tags_categor_es: "agenda:categories/fires-i-mercats",
    gratuita: "Sí",
    url: "http://www.example.cat/fira",
    ...overrides,
  };
}

test("a well-formed row normalises with accented municipality and https link", () => {
  const event = normaliseEvent(row(), WINDOW, NAMES);
  assert.ok(event);
  assert.equal(event.municipality, "Sant Cugat del Vallès");
  assert.equal(event.category, "fairs");
  assert.equal(event.free, true);
  assert.equal(event.url, "https://www.example.cat/fira");
  assert.equal(event.startsThisWeekend, true);
});

test("a months-long exhibition is not presented as a weekend plan", () => {
  const event = normaliseEvent(
    row({ data_inici: "2026-09-18T00:00:00.000", data_fi: "2027-02-28T00:00:00.000" }),
    WINDOW,
    NAMES,
  );
  assert.equal(event, null);
});

test("an organiser link that is not a web address is dropped, not printed", () => {
  const event = normaliseEvent(row({ url: "info@example.cat", linkbotoentrades: "" }), WINDOW, NAMES);
  assert.equal(event?.url, null);
});

test("a row with no name is skipped", () => {
  assert.equal(normaliseEvent(row({ denominaci: "  " }), WINDOW, NAMES), null);
});

test("children's tag wins over the art form it is tagged with", () => {
  const event = normaliseEvent(
    row({ tags_categor_es: "agenda:categories/teatre,agenda:categories/infantil" }),
    WINDOW,
    NAMES,
  );
  assert.equal(event?.category, "family");
});

test("slugify matches the agenda's municipality slugs", () => {
  assert.equal(slugify("Sant Cugat del Vallès"), "sant-cugat-del-valles");
  assert.equal(slugify("L'Hospitalet de Llobregat"), "l-hospitalet-de-llobregat");
  assert.equal(slugify("Sant Feliu de Guíxols"), "sant-feliu-de-guixols");
});

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

for (const locale of LOCALES) {
  test(`${locale}: the evergreen page carries no date that can go stale`, () => {
    const copy = EVERGREEN[locale];
    const fixed = [copy.title, copy.seoTitle, copy.seoDescription, copy.excerpt].join(" ");
    assert.ok(!/\b20\d\d\b/.test(fixed), `${locale}: a year in the title or description`);
    assert.ok(
      !/setembre|septiembre|september|octubre|october|\b\d{1,2}\s*(i|y|and|–|-)\s*\d{1,2}\b/i.test(fixed),
      `${locale}: a specific date in the title or description`,
    );
    const text = bodyToPlainText(buildEvergreenBody(locale));
    assert.ok(!/\b20\d\d\b/.test(text), `${locale}: a year in the body`);
  });

  test(`${locale}: the live listing comes before any heading`, () => {
    const body = buildEvergreenBody(locale);
    assert.ok(bodySchema.safeParse(body).success);
    const agenda = body.findIndex((block) => block.type === "weekendAgenda");
    const heading = body.findIndex((block) => block.type === "heading");
    assert.ok(agenda >= 0 && agenda < heading);
  });

  test(`${locale}: the path is unchanged, so the page keeps its history`, () => {
    const expected = {
      ca: "agenda/que-fer-aquest-cap-de-setmana-catalunya",
      es: "agenda/que-hacer-este-fin-de-semana-cataluna",
      en: "agenda/things-to-do-catalonia-this-weekend",
    };
    assert.equal(EVERGREEN[locale].path, expected[locale]);
  });

  test(`${locale}: every guidance section has text`, () => {
    const body = buildEvergreenBody(locale);
    for (let index = 0; index < body.length; index += 1) {
      if (body[index]?.type !== "heading") continue;
      assert.equal(body[index + 1]?.type, "paragraph", `${locale}: empty section at ${index}`);
    }
  });
}
