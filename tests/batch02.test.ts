import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { PARKING, TRANSPORT, ZBE } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CERDANYA, GIRONA, MONTSERRAT_FREE } from "../src/lib/content/batch02/day-trips.ts";
import { RIPOLLES, SETCASES, SNOW } from "../src/lib/content/batch02/pyrenees.ts";
import { AIRPORT } from "../src/lib/content/batch02/airport.ts";
import { MONUMENTS } from "../src/lib/content/batch02/monuments.ts";
import { SKI } from "../src/lib/content/batch02/ski.ts";
import { MUSEUMS } from "../src/lib/content/batch02/museums.ts";
import { CARDS } from "../src/lib/content/batch02/cards.ts";
import { CAMPNOU } from "../src/lib/content/batch02/campnou.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { SITGES, TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { FIGUERES } from "../src/lib/content/batch02/figueres.ts";
import { ANDORRA } from "../src/lib/content/batch02/andorra.ts";
import { MONTJUIC, TIBIDABO } from "../src/lib/content/batch02/hills.ts";
import { CRUISEPORT } from "../src/lib/content/batch02/cruiseport.ts";
import { PORTAVENTURA } from "../src/lib/content/batch02/portaventura.ts";
import { MARKETS, ZOO_AQUARIUM } from "../src/lib/content/batch02/family-markets.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { CLOCK_CHANGE } from "../src/lib/content/batch02/clock-change.ts";
import { NURIA } from "../src/lib/content/batch02/nuria.ts";
import { BEACHES_GUIDE } from "../src/lib/content/batch02/beaches.ts";
import { MESA } from "../src/lib/content/batch02/mesa.ts";
import { MUNICIPAL_RESULTS } from "../src/lib/content/batch02/municipal-results.ts";
import { CLIMATE } from "../src/lib/content/batch02/climate.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { CONGRESS_RESULTS, PARLIAMENT_RESULTS } from "../src/lib/content/batch02/election-results.ts";
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
  AIRPORT,
  MONUMENTS,
  SKI,
  MUSEUMS,
  CARDS,
  CAMPNOU,
  HOURS,
  SITGES,
  TARRAGONA,
  VOTING,
  FIGUERES,
  ANDORRA,
  MONTJUIC,
  TIBIDABO,
  CRUISEPORT,
  PORTAVENTURA,
  ZOO_AQUARIUM,
  MARKETS,
  BARCELONA_HUB,
  CLOCK_CHANGE,
  NURIA,
  BEACHES_GUIDE,
  MESA,
  MUNICIPAL_RESULTS,
  CLIMATE,
  SHOPS,
  ELECTION_NIGHT,
  CONGRESS_RESULTS,
  PARLIAMENT_RESULTS,
  SNOW,
];

const IMAGE_KEYS = new Set(IMAGES.map((image) => image.key));

/* -------------------------------------------------------------------------- */
/* Structure                                                                  */
/* -------------------------------------------------------------------------- */

test("every article has three editions", () => {
  assert.equal(ARTICLES.length, 38);
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

test("the body image is never the hero image", () => {
  // Both were the same file in the first version of this batch, so every page
  // rendered one photograph twice: once in the header the template draws, and
  // again six blocks down.
  for (const article of ARTICLES) {
    assert.ok(article.secondaryKey, `${article.key} has no second image`);
    assert.notEqual(article.secondaryKey, article.heroKey, article.key);
    assert.ok(
      IMAGE_KEYS.has(article.secondaryKey ?? ""),
      `${article.key}: ${article.secondaryKey} not imported`,
    );
    for (const locale of LOCALES) {
      assert.ok((article.secondaryAlt?.[locale] ?? "").length > 15, `${article.key}/${locale} alt`);
      assert.ok(
        (article.secondaryCaption?.[locale] ?? "").length > 15,
        `${article.key}/${locale} caption`,
      );
    }
  }
});

test("every photograph on the site is used by exactly one article", () => {
  const used = ARTICLES.flatMap((article) => [article.heroKey, article.secondaryKey]);
  assert.equal(new Set(used).size, used.length, "an image is reused across articles");
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
      // Opening hours of sights live in a dated table and are not departures;
      // every other block is checked.
      const text = bodyToPlainText(article.editions[locale].blocks.filter((block) => block.type !== "table"));
      // A clock time would be a departure we cannot keep current.
      assert.ok(
        // Prices such as "€11.40" are not times: skip figures right after €.
        !/(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/.test(text),
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

test("the Hola Barcelona fares are TMB's, one per length, and the stay picks the shortest that covers it", () => {
  const hola = TICKETS.find((ticket) => ticket.key === "hola-barcelona");
  assert.ok(hola);
  assert.deepEqual(
    hola.fares.map((fare) => [fare.days, fare.price]),
    [[1, 12.5], [2, 18.7], [3, 27.3], [4, 35.6], [5, 43.6]],
  );
  const price = (days: number, travellers = 1) =>
    compareTickets({ days, journeysPerDay: 4, travellers, zone: "1", usesAirport: false }).find(
      (item) => item.ticket.key === "hola-barcelona",
    );
  assert.equal(price(3)?.total, 27.3);
  assert.equal(price(2, 2)?.total, 37.4);
  assert.equal(price(6)?.total, null);
  assert.equal(price(6)?.blocked, "too-long");
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

test("the read-next box sits mid-article and only repeats related links", async () => {
  const { withReadNext } = await import("../src/lib/content/batch02/shared.ts");
  for (const article of ARTICLES) {
    for (const locale of ["ca", "es", "en"] as const) {
      const before = article.editions[locale].blocks;
      const after = withReadNext([...before], locale);
      const added = after.length - before.length;
      assert.ok(added === 0 || added === 1, `${article.key}/${locale}`);
      if (added === 1) {
        const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip" && /\]\(\//.test((b as { text?: string }).text ?? ""));
        assert.ok(box, `${article.key}/${locale}: box missing`);
        const related = before[before.length - 1] as { items?: string[] };
        for (const link of ((box as { text: string }).text.match(/\]\(([^)]+)\)/g) ?? [])) {
          assert.ok(related.items?.some((item) => item.includes(link)), `${article.key}/${locale}: ${link} not in related rail`);
        }
      }
    }
  }
});

/**
 * Shop opening days come from the DOGC (Ordre EMT/77/2025, Resolució
 * EMT/4342/2025, Ordre EMT/89/2026). The press labels 28 Nov 2027 "Black
 * Friday" (it is the Sunday after) and some pages present 3 Jan 2027 as the
 * start of the sales; the orders say neither.
 */
test("shops: the DOGC dates are all there and nothing the orders do not say", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(SHOPS.editions[locale].blocks);
    const days2026 = locale === "en" ? ["29 November", "6 December", "8 December", "13 December", "20 December", "27 December"] : locale === "es" ? ["29 de noviembre", "6 de diciembre", "8 de diciembre", "13 de diciembre", "20 de diciembre", "27 de diciembre"] : ["29 de novembre", "6 de desembre", "8 de desembre", "13 de desembre", "20 de desembre", "27 de desembre"];
    for (const day of days2026) assert.ok(text.includes(day), `${locale}: ${day}`);
    const table2027 = SHOPS.editions[locale].blocks.filter((b) => b.type === "table")[1] as { rows: string[][] };
    assert.equal(table2027.rows.length, 10, `${locale}: 8 general + 2 default municipal days in 2027`);
    assert.doesNotMatch(text, /black friday/i);
    assert.doesNotMatch(text, /(rebaixes|rebajas|sales)[^.]*3 (de )?(gener|enero|January)/i);
  }
});

/**
 * How to vote: the calendar is the one in RD 806/2026, the JEC and the INE
 * (checked 24 Oct 2026). The JEC suspended the MiDNI app on 26 Mar 2026
 * (Acuerdo 94/2026), so the page must never present it as valid ID again,
 * and the braille phone number had no 2026 source.
 */
test("voting: dated calendar from the decree, MiDNI not presented as valid", () => {
  const dates: Record<string, string[]> = {
    ca: ["31 d'octubre", "2 de novembre", "19 de novembre", "25 de novembre", "4–7 de desembre", "23 de desembre"],
    es: ["31 de octubre", "2 de noviembre", "19 de noviembre", "25 de noviembre", "4–7 de diciembre", "23 de diciembre"],
    en: ["31 October", "2 November", "19 November", "25 November", "4–7 December", "23 December"],
  };
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(VOTING.editions[locale].blocks);
    assert.match(text, /806\/2026/, `${locale}: decree`);
    for (const day of dates[locale]!) assert.ok(text.includes(day), `${locale}: ${day}`);
    assert.match(text, /Acuerdo 94\/2026|Acord 94\/2026/, `${locale}: MiDNI suspension cited`);
    assert.doesNotMatch(text, /MiDNI[^.]*(también es válido|també és vàlid|is valid too)/i, `${locale}: MiDNI valid`);
    assert.doesNotMatch(text, /900 150 000/, `${locale}: unsourced braille phone`);
  }
});

/**
 * Election night carries no figures until Interior publishes a documented,
 * licensed source (research_notes/blog-batch-03/election_night_29n.md):
 * no percentages other than the worked "30 %" example, no seat forecasts,
 * and every edition says the count is provisional and leaves out CERA.
 */
test("election night: provisional, no CERA, no forecasts, no invented site", () => {
  const words: Record<string, RegExp[]> = {
    ca: [/escrutini provisional/, /CERA/, /BOE/, /24 al 28 de novembre/],
    es: [/escrutinio provisional/, /CERA/, /BOE/, /24 al 28 de noviembre/],
    en: [/provisional count/, /CERA/, /BOE/, /24 to 28 November/],
  };
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(ELECTION_NIGHT.editions[locale].blocks);
    for (const pattern of words[locale]!) assert.match(text, pattern, `${locale}: ${pattern}`);
    assert.deepEqual(text.match(/\d+(,\d+)? ?%/g), ["30 %"], `${locale}: only the worked example is a percentage`);
    assert.doesNotMatch(text, /sondeig a peu d'urna|sondeo a pie de urna|exit poll|majoria absoluta|mayoría absoluta|absolute majority|guanyador|ganador|winner|is winning/i);
    assert.doesNotMatch(text, /resultados\.[a-z]|generales\d+j?\.es|https?:\/\/resultados/i);
  }
  assert.ok(ELECTION_NIGHT.sources.every((s) => !/resultados\.[a-z]/.test(s.url)), "no guessed results-site domain");
});

/**
 * Parking: three errors found on 18 Oct 2026 against AREA's own pages
 * (research_notes/blog-batch-03/parking_area_verda_blava.md). The blue
 * schedule was given as the only one, the meter was said to print a
 * windscreen ticket, and resident-only spaces were never mentioned.
 */
test("parking: green hours, no windscreen ticket, resident-only spaces, no invented fine", () => {
  const green = { ca: /de 8\.00 a 20\.00 h o fins a les 22\.00/, es: /de 8:00 a 20:00 o hasta las 22:00/, en: /from 8:00 to 20:00 or to 22:00/ };
  const residentOnly = { ca: /exclusives per a residents/, es: /exclusivas para residentes/, en: /resident-only spaces/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(PARKING.editions[locale].blocks);
    assert.match(text, green[locale], `${locale}: green hours`);
    assert.match(text, residentOnly[locale], `${locale}: resident-only spaces`);
    assert.doesNotMatch(text, /windscreen|parabrisas|parabrises/i);
    // Only the AREA cancellation fee is official; no fine amount is.
    assert.deepEqual([...new Set(text.match(/(?<![\d,.])\d{2,3} ?€|€\d{2,3}(?![\d,.])/g) ?? [])].sort(), [], `${locale}: no fine amounts`);
  }
});
