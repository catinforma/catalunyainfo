import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { COPY, IMAGES, SOURCES, ZONES } from "../src/lib/content/autumn/payload.ts";
import { buildBody } from "../src/lib/content/autumn/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The autumn guide publishes timing, and timing is exactly where a guide like
 * this usually starts inventing. These tests hold the two editorial rules the
 * piece was written under: it never claims the forests are at peak colour
 * today, and it never states a peak date that no park or tourism board has
 * published.
 */

test("every edition is a valid body and substantial", () => {
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const parsed = bodySchema.safeParse(body);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.[0])}`);
    const words = wordCount(bodyToPlainText(body));
    assert.ok(words > 700, `${locale} is too thin: ${words} words`);
  }
});

test("the guide never claims the forests are at peak colour now", () => {
  // Affirmative present-tense claims only; the article is allowed - and
  // required - to say the opposite.
  const forbidden = [
    /els boscos (ja )?(estan|són) en el seu màxim/i,
    /ja (estan|són) en (el seu )?màxim/i,
    /los bosques (ya )?están en su máximo/i,
    /(are|is) (now )?at (their|its) peak/i,
    /peak colou?r (is|has) (now |already )?(arrived|here)/i,
  ];
  for (const locale of LOCALES) {
    const text = bodyToPlainText(buildBody(locale));
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${locale} claims present peak colour`);
    }
  }
});

test("each edition says explicitly that it is still early", () => {
  const marker = {
    ca: /encara és aviat/i,
    es: /todavía es pronto/i,
    en: /still early/i,
  };
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(buildBody(locale)), marker[locale], `${locale} lost the status`);
  }
});

test("no exact peak date is promised", () => {
  // A day-and-month pair is only allowed where it names a published event -
  // the national park's 17 October activity, Montseny's 11 October walk - or
  // the publication date itself.
  const dayMonth =
    /\b\d{1,2}\s+(?:d'|de\s+)?(gener|febrer|març|abril|maig|juny|juliol|agost|setembre|octubre|novembre|desembre|enero|marzo|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/gi;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(buildBody(locale));
    for (const hit of text.match(dayMonth) ?? []) {
      assert.match(
        hit,
        /\b(1[17] d'octubre|1[17] de octubre|15 de setembre|15 de septiembre)\b/i,
        `${locale} states an unsourced date: ${hit}`,
      );
    }
  }
});

test("unofficial windows are labelled as editorial guidance", () => {
  const unofficial = ZONES.filter((zone) => !zone.official);
  assert.ok(unofficial.length >= 2, "Fageda and Montseny have no official forecast");
  for (const zone of unofficial) {
    assert.equal(zone.windowNote, undefined, `${zone.id} presents guidance as official`);
    for (const locale of LOCALES) {
      assert.match(
        zone.window[locale] ?? "",
        /orientatiu|orientativo|guidance/i,
        `${zone.id}: ${locale} window is not marked as orientation`,
      );
    }
  }
  // And the table itself must say which rows are which.
  for (const locale of LOCALES) {
    assert.match(COPY[locale].tableNote, /Fageda/);
    assert.match(COPY[locale].tableNote, /Montseny/);
  }
});

test("every zone carries a window and a name in all three languages", () => {
  assert.ok(ZONES.length >= 8);
  for (const zone of ZONES) {
    for (const locale of LOCALES) {
      assert.ok(zone.name[locale]?.length, `${zone.id}: missing ${locale} name`);
      assert.ok(zone.window[locale]?.length, `${zone.id}: missing ${locale} window`);
      assert.ok(zone.highlight[locale]?.length, `${zone.id}: missing ${locale} highlight`);
      // A section is optional (the first row is an altitude band, not a
      // destination), but a section that exists must have prose.
      if (zone.heading[locale]) {
        assert.ok(zone.body[locale]?.length, `${zone.id}: ${locale} heading without body`);
      }
    }
  }
});

test("autumn URLs are evergreen and carry no year", () => {
  const expected = {
    ca: "natura/colors-tardor-catalunya",
    es: "naturaleza/colores-otono-cataluna",
    en: "nature/fall-colors-catalonia",
  };
  for (const locale of LOCALES) {
    assert.equal(COPY[locale].path, expected[locale]);
    assert.doesNotMatch(COPY[locale].path, /\d/, `${locale} path carries a number`);
  }
});

test("every illustration is disclosed as generated, in every language", () => {
  assert.ok(IMAGES.length >= 5);
  assert.equal(IMAGES.filter((image) => image.isHero).length, 1);
  for (const image of IMAGES) {
    for (const locale of LOCALES) {
      assert.ok(image.alt[locale]?.length, `${image.key}: missing ${locale} alt`);
      assert.match(
        image.caption[locale] ?? "",
        /intel·ligència artificial|inteligencia artificial|artificial intelligence/,
        `${image.key}: ${locale} caption does not disclose generation`,
      );
      // Nor may it present the image as a photograph of the exact place.
      assert.doesNotMatch(
        image.caption[locale] ?? "",
        /fotografia real|fotografía real|real photograph/i,
        `${image.key}: ${locale} caption claims a real photograph`,
      );
    }
  }
});

test("autumn sources are official, https and untracked", () => {
  for (const source of SOURCES) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.doesNotMatch(source.url, /utm_|chatgpt\.com/, source.url);
  }
  const official = SOURCES.filter((s) =>
    /gencat\.cat|meteo\.cat|diba\.cat|visitvaldaran\.com/.test(s.url),
  );
  assert.ok(official.length >= 7, "the guide must rest on official sources");
});

test("the autumn and mushroom guides link to each other in every language", async () => {
  const mushrooms = await import("../src/lib/content/mushrooms/publish.ts");

  const toMushrooms = {
    ca: "/ca/natura/bolets-catalunya-condicions/",
    es: "/es/naturaleza/setas-cataluna-condiciones/",
    en: "/en/nature/mushroom-season-catalonia/",
  };
  const toAutumn = {
    ca: "/ca/natura/colors-tardor-catalunya/",
    es: "/es/naturaleza/colores-otono-cataluna/",
    en: "/en/nature/fall-colors-catalonia/",
  };

  for (const locale of LOCALES) {
    assert.ok(
      JSON.stringify(buildBody(locale)).includes(toMushrooms[locale]),
      `${locale}: autumn guide does not link to the mushroom report`,
    );
    assert.ok(
      JSON.stringify(mushrooms.buildBody(locale)).includes(toAutumn[locale]),
      `${locale}: mushroom report does not link to the autumn guide`,
    );
  }
});

test("no tracking parameters leak into the prose", () => {
  for (const locale of LOCALES) {
    const text = JSON.stringify(buildBody(locale));
    assert.doesNotMatch(text, /utm_source|chatgpt\.com/, `${locale} carries a tracking parameter`);
  }
});
