import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { PARKING, TRANSPORT, ZBE } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CERDANYA, GIRONA, MONTSERRAT_FREE } from "../src/lib/content/batch02/day-trips.ts";
import { RIPOLLES, SETCASES, SNOW } from "../src/lib/content/batch02/pyrenees.ts";
import { B2_PATHS, type B2Article } from "../src/lib/content/batch02/shared.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import {
  TICKETS,
  cheapest,
  compareTickets,
} from "../src/lib/content/transport-cards/rates.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

const ARTICLES: B2Article[] = [
  TRANSPORT,
  ZBE,
  GIRONA,
  MONTSERRAT_FREE,
  RIPOLLES,
  SETCASES,
  CERDANYA,
  PARKING,
  SNOW,
];

const IMAGE_KEYS = new Set(IMAGES.map((image) => image.key));

/* -------------------------------------------------------------------------- */
/* Structure                                                                  */
/* -------------------------------------------------------------------------- */

test("nine articles, three editions each", () => {
  assert.equal(ARTICLES.length, 9);
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      assert.ok(article.editions[locale], `${article.key} is missing ${locale}`);
    }
  }
});

test("every edition validates and is substantial", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(
        parsed.success,
        `${article.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`,
      );
      const words = wordCount(bodyToPlainText(edition.blocks));
      assert.ok(words > 200, `${article.key}/${locale} has only ${words} words`);
    }
  }
});

test("paths match the registry and are evergreen", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      assert.equal(edition.path, B2_PATHS[article.key][locale], `${article.key}/${locale}`);
      assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
      assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  }
});

test("all 27 paths are distinct within their locale", () => {
  for (const locale of LOCALES) {
    const paths = ARTICLES.map((article) => article.editions[locale].path);
    assert.equal(new Set(paths).size, paths.length, `duplicate path in ${locale}`);
  }
});

test("SEO fields are present and within the lengths Google renders", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, excerpt, title } = article.editions[locale];
      assert.ok(title.length > 10, `${article.key}/${locale} title`);
      assert.ok(seoTitle.length > 10 && seoTitle.length <= 65, `${article.key}/${locale}: ${seoTitle.length}`);
      assert.ok(
        seoDescription.length > 60 && seoDescription.length <= 165,
        `${article.key}/${locale}: ${seoDescription.length}`,
      );
      assert.ok(excerpt.length > 30);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Sources, images, links                                                     */
/* -------------------------------------------------------------------------- */

test("every source is https and free of tracking parameters", () => {
  for (const article of ARTICLES) {
    assert.ok(article.sources.length > 0, `${article.key} has no sources`);
    for (const source of article.sources) {
      assert.match(source.url, /^https:\/\//, `${article.key}: ${source.url}`);
      assert.ok(!/[?&]utm_/.test(source.url), `${article.key}: ${source.url}`);
    }
  }
});

test("every article carries a verification date", () => {
  for (const article of ARTICLES) {
    assert.match(article.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, article.key);
    const text = bodyToPlainText(article.editions.ca.blocks);
    assert.match(text, /verificaci/i, `${article.key} does not show a verified date to the reader`);
  }
});

test("hero images exist in the manifest and have alt text in all three languages", () => {
  for (const article of ARTICLES) {
    assert.ok(article.heroKey, `${article.key} has no hero`);
    assert.ok(IMAGE_KEYS.has(article.heroKey ?? ""), `${article.key}: ${article.heroKey} not imported`);
    for (const locale of LOCALES) {
      assert.ok((article.heroAlt?.[locale] ?? "").length > 15, `${article.key}/${locale} alt`);
      assert.ok((article.heroCaption?.[locale] ?? "").length > 15, `${article.key}/${locale} caption`);
    }
  }
});

test("internal links stay inside their own language", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(article.editions[locale].blocks);
      for (const match of text.matchAll(/\]\((\/[a-z]{2})\//g)) {
        assert.equal(match[1], `/${locale}`, `${article.key}/${locale} links to ${match[1]}`);
      }
    }
  }
});

test("every internal link ends in a trailing slash", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(article.editions[locale].blocks);
      for (const match of text.matchAll(/\]\((\/[a-z]{2}\/[^)]*)\)/g)) {
        assert.match(match[1] ?? "", /\/$/, `${article.key}/${locale}: ${match[1]}`);
      }
    }
  }
});

/* -------------------------------------------------------------------------- */
/* What these pages must not claim                                            */
/* -------------------------------------------------------------------------- */

test("the snow guide never promises snow", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SNOW.editions[locale].blocks).toLowerCase();
    for (const phrase of ["hi haurà neu", "habrá nieve", "there will be snow", "garantit", "guaranteed"]) {
      assert.ok(!text.includes(phrase), `snow/${locale} contains "${phrase}"`);
    }
    // And it says explicitly that it is not a snow report.
    assert.match(
      text,
      /part de neu|parte de nieve|snow report/i,
      `snow/${locale} does not disclaim being a snow report`,
    );
  }
});

test("no train or bus timetable is hard-coded into the day trips", () => {
  for (const article of [GIRONA, MONTSERRAT_FREE, CERDANYA]) {
    for (const locale of LOCALES) {
      const text = bodyToPlainText(article.editions[locale].blocks);
      // A clock time would be a departure we cannot keep current.
      assert.ok(
        !/\b([01]?\d|2[0-3])[:.][0-5]\d\b/.test(text),
        `${article.key}/${locale} contains what looks like a departure time`,
      );
    }
  }
});

test("the Montserrat page does not repeat the unverified height gain", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(MONTSERRAT_FREE.editions[locale].blocks);
    assert.ok(!/600\s*m/i.test(text), `montserrat/${locale} still claims 600 m`);
  }
});

test("the ZBE page states working days, not calendar days", () => {
  assert.match(bodyToPlainText(ZBE.editions.ca.blocks), /15 dies hàbils/);
  assert.match(bodyToPlainText(ZBE.editions.es.blocks), /15 días hábiles/);
  assert.match(bodyToPlainText(ZBE.editions.en.blocks), /15 working days/);
});

/* -------------------------------------------------------------------------- */
/* The transport comparison                                                   */
/* -------------------------------------------------------------------------- */

test("fares match what TMB publishes", () => {
  const price = (key: string) =>
    TICKETS.find((ticket) => ticket.key === key)?.fares.find((fare) => fare.zone === "1")?.price;
  assert.equal(price("t-casual"), 13);
  assert.equal(price("t-dia"), 12);
  assert.equal(price("t-usual"), 22.8);
  assert.equal(price("senzill"), 2.9);
});

test("the Hola Barcelona card carries no invented price", () => {
  const hola = TICKETS.find((ticket) => ticket.key === "hola-barcelona");
  assert.ok(hola);
  assert.equal(hola.fares.length, 0);
});

test("ten journeys over three days: one T-casual per traveller", () => {
  const priced = compareTickets({
    days: 3,
    journeysPerDay: 3,
    travellers: 2,
    zone: "1",
    usesAirport: false,
  });
  const casual = priced.find((item) => item.ticket.key === "t-casual");
  assert.equal(casual?.unitsPerTraveller, 1);
  // Nine journeys each, so one ten-journey ticket each - never one shared.
  assert.equal(casual?.total, 26);
});

test("the T-casual is refused, not priced, when the trip uses the airport metro", () => {
  const priced = compareTickets({
    days: 2,
    journeysPerDay: 2,
    travellers: 1,
    zone: "1",
    usesAirport: true,
  });
  const casual = priced.find((item) => item.ticket.key === "t-casual");
  assert.equal(casual?.total, null);
  assert.equal(casual?.blocked, "airport");
  // And it can never be the recommendation in that case.
  assert.notEqual(cheapest(priced)?.ticket.key, "t-casual");
});

test("a long stay is priced with one T-usual, not thirty T-dies", () => {
  const priced = compareTickets({
    days: 25,
    journeysPerDay: 4,
    travellers: 1,
    zone: "1",
    usesAirport: false,
  });
  const usual = priced.find((item) => item.ticket.key === "t-usual");
  assert.equal(usual?.unitsPerTraveller, 1);
  assert.equal(usual?.total, 22.8);
  assert.equal(cheapest(priced)?.ticket.key, "t-usual");
});

test("every priced ticket is multiplied by the number of travellers", () => {
  const one = compareTickets({ days: 1, journeysPerDay: 6, travellers: 1, zone: "1", usesAirport: false });
  const four = compareTickets({ days: 1, journeysPerDay: 6, travellers: 4, zone: "1", usesAirport: false });
  for (const item of one) {
    const many = four.find((other) => other.ticket.key === item.ticket.key);
    if (item.total === null) {
      assert.equal(many?.total, null);
      continue;
    }
    assert.equal(many?.total, Math.round(item.total * 4 * 100) / 100, item.ticket.key);
  }
});

test("the selector block is placed on the transport article in every language", () => {
  for (const locale of LOCALES) {
    const count = TRANSPORT.editions[locale].blocks.filter(
      (block) => block.type === "transportPasses",
    ).length;
    assert.equal(count, 1, locale);
  }
});
