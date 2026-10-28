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

/**
 * ZBE, 28 Oct 2026 (zbe.barcelona vehicles-afectats, zberegistre): who may
 * enter, by fuel and Euro level, with the registration years the AMB gives
 * ("2005 o 2006" for diesel), and an FAQ in the words of the EN queries.
 */
test("ZBE: who-can-enter table from the AMB, FAQ, fine only for the official case", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = ZBE.editions[locale].blocks as { type: string; rows?: string[][] }[];
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 1, `${locale}: one who-can-enter table`);
    assert.equal(tables[0]?.rows?.length, 4, `${locale}: petrol, diesel, motorbike, electric`);
    assert.match(JSON.stringify(tables[0]?.rows), /2005 (o|or) 2006/, `${locale}: diesel years as the AMB gives them`);
    assert.ok(blocks.some((b) => b.type === "faq"), `${locale}: FAQ`);
    const text = bodyToPlainText(ZBE.editions[locale].blocks);
    assert.match(text, /1 (d'abril de|de abril de|April) 2021/, `${locale}: vans since April 2021`);
    for (const match of text.matchAll(/(\d{2,3}) ?(€|euros)|€(\d{2,3})/g)) {
      assert.equal(match[1] ?? match[3], "200", `${locale}: only the official 200 euro fine`);
    }
  }
});

/**
 * Airport, 28 Oct 2026: the page answers the specific transport queries from
 * official pages only (Aena, AMB, TMB, ATM, Rodalies, DOGC). The airport
 * express bus is named as Aena and the AMB name it, with no fare, frequency
 * or link to its operator; the night buses carry the AMB's 15-minute
 * timetable, not the old "midnight to 05:00, every 20-30 min".
 */
test("airport: official figures only, no operator link or fare for the express bus", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const json = JSON.stringify(AIRPORT.editions[locale].blocks);
    const text = bodyToPlainText(AIRPORT.editions[locale].blocks);
    assert.doesNotMatch(json, /aerobus(bcn|barcelona)\./i, `${locale}: no operator domain`);
    assert.doesNotMatch(text, /7[,.]75|13[,.]30|28[,.]65/, `${locale}: no express-bus fare`);
    assert.doesNotMatch(text, /20[–-]30 min/, `${locale}: no stale night-bus frequency`);
    for (const figure of [/5:40/, /23:38/, /5[,.]90/, /2[,.]90/, /21:55/, /0:05/, /21 ?€|€21/]) assert.match(text, figure, `${locale}: ${figure}`);
    const tables = (AIRPORT.editions[locale].blocks as { type: string }[]).filter((b) => b.type === "table");
    assert.equal(tables.length, 3, `${locale}: overview, night buses, R2 first and last`);
  }
  assert.ok(AIRPORT.sources.every((s) => !/aerobus/i.test(s.url)), "no operator source");
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

/**
 * Transport passes, 28 Oct 2026: TMB's 2026 fare table ("in force from 15
 * January 2026") gives every zone for the single ticket, T-casual, T-dia and
 * T-usual. ATM's T-casual page still shows the 2025 fares lower down; none of
 * them may appear. The ca/es pages answer "hola barcelona vs t casual" with
 * figures computed from the fare table.
 */
test("transport: 2026 fares for every zone, no 2025 fares, Hola vs T-casual computed", () => {
  for (const locale of ["ca", "es"] as const) {
    const blocks = TRANSPORT.editions[locale].blocks as { type: string; rows?: string[][]; headers?: string[] }[];
    const zones = blocks.find((b) => b.type === "table" && (b.rows?.length ?? 0) === 7);
    assert.deepEqual(zones?.rows?.[0], ["1", "2,90 €", "13,00 €", "12,00 €", "22,80 €"], `${locale}: zone 1 row`);
    assert.deepEqual(zones?.rows?.[2], ["3", "5,40 €", "34,70 €", "22,95 €", "42,70 €"], `${locale}: zone 3 row`);
    const text = bodyToPlainText(TRANSPORT.editions[locale].blocks);
    for (const old of ["12,55", "24,65", "33,55", "43,15"]) assert.ok(!text.includes(old), `${locale}: 2025 fare ${old}`);
    assert.match(text, /15 (de gener|de enero) de 2026|15 (de gener|de enero)\)/, `${locale}: date the fares took effect`);
    assert.match(text, /24,80 €/, `${locale}: T-casual plus two airport tickets`);
    assert.match(text, /T-familiar[^.]*11,50 €/, `${locale}: T-familiar fare`);
    assert.ok(blocks.some((b) => b.type === "faq"), `${locale}: FAQ`);
  }
  assert.match(bodyToPlainText(TRANSPORT.editions.ca.blocks), /Ocata[^.]*zona 2/);
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

/**
 * Parking, 24 Oct 2026: the ES page's top query is "como funciona la zona
 * verde en barcelona". The lead now answers it, a zone-by-zone table follows,
 * and the "which is cheaper" answer is computed from AREA's rate tables.
 */
test("parking: zone summary table and a blue-vs-green answer that matches the rates", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = PARKING.editions[locale].blocks as { type: string; rows?: string[][]; text?: string }[];
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 3, `${locale}: summary + blue + green tables`);
    assert.equal(tables[0]?.rows?.length, 5, `${locale}: five kinds of space in the summary`);
    const lead = blocks.find((b) => b.type === "paragraph")?.text ?? "";
    assert.match(lead, /1[,.]40/, `${locale}: the lead gives the green non-resident price`);
  }
  const es = bodyToPlainText(PARKING.editions.es.blocks);
  assert.match(es, /3,25 €\W* la hora en azul y \W*3,75 €/);
});

/**
 * Parking, 28 Oct 2026: AREA's own "tipos de plazas" pages state that the
 * resident rate runs January to December including August, that Rate A covers
 * high-demand areas such as the Eixample and Ciutat Vella, and the count of
 * blue (about 5,400) and green (about 57,000) spaces. Each edition says so,
 * walks a visitor through parking in four steps, and never invents an August
 * exemption or a colour for the road markings.
 */
test("parking: August answered from AREA, Rate A areas, four steps, no invented markings", () => {
  const august = { ca: /agost inclòs/, es: /incluido el mes de agosto/, en: /including August/ };
  const rateA = { ca: /l'Eixample i Ciutat Vella/, es: /el Eixample y Ciutat Vella/, en: /the Eixample and Ciutat Vella/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = PARKING.editions[locale].blocks as { type: string; items?: unknown[] }[];
    const text = bodyToPlainText(PARKING.editions[locale].blocks);
    assert.match(text, august[locale], `${locale}: August`);
    assert.match(text, rateA[locale], `${locale}: Rate A areas`);
    assert.match(text, /5[.,]400/, `${locale}: blue space count`);
    assert.match(text, /57[.,]000/, `${locale}: green space count`);
    assert.equal(blocks.find((b) => b.type === "steps")?.items?.length, 4, `${locale}: four steps`);
    assert.doesNotMatch(text, /(gratis|gratuïta|free)[^.]*(agost|agosto|August)/i, `${locale}: no August exemption`);
    assert.doesNotMatch(text, /l[ií]neas? (azul|verde)|línies (blav|verd)|(blue|green) lines/i, `${locale}: no unverified markings`);
  }
});

/**
 * Zoo and markets, re-checked 24 Oct 2026; Zoo hours updated 26 Oct 2026,
 * after the clock change. The Zoo says visitors enter only through the
 * Ciutadella entrance. Since 26 Oct it closes at 16:30 on weekdays (17:30 at
 * weekends), per its own daily line and the City Council's winter table; its
 * tickets page states it is open every day and closes on Christmas afternoon.
 * The Aquarium calendar is published to 31 Jan 2027.
 */
test("zoo: Ciutadella-only entrance, winter zoo hours table, aquarium calendar", () => {
  const entrance = { ca: /únicament per l'entrada situada a l'interior del parc de la Ciutadella/, es: /solo se accede por la entrada situada en el interior del parque de la Ciutadella/, en: /only get into the Zoo through the entrance inside the Parc de la Ciutadella/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(ZOO_AQUARIUM.editions[locale].blocks);
    assert.match(text, entrance[locale], `${locale}: entrance`);
    assert.match(text, /16:30/, `${locale}: weekday winter closing time`);
    assert.match(text, /17:30/, `${locale}: weekend winter closing time`);
    assert.doesNotMatch(text, /17:00/, `${locale}: no stale 24 Oct last-entry time`);
    const tables = (ZOO_AQUARIUM.editions[locale].blocks as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");
    assert.equal(tables.length, 3, `${locale}: prices + zoo hours + aquarium hours`);
    assert.equal(tables[1]?.rows?.length, 3, `${locale}: zoo winter date ranges to 28 Feb 2027`);
    assert.equal(tables[2]?.rows?.length, 6, `${locale}: aquarium date ranges to 31 Jan 2027`);
  }
});

/**
 * Zoo, Aquarium and markets, 28 Oct 2026: the Aquarium's online Flexiticket
 * (90 days) and the Zoo Club are on the official price pages; the Zoo itself
 * says only "closed in the afternoon" on Christmas Day, so the 14:00 is
 * attributed to the City Council. The Boqueria's Sunday and holiday openings
 * are announced by the market (2025-26: 6, 21, 28 Dec and 4 Jan); 2026-27 is
 * not published, so no 2026-27 date may appear.
 */
test("zoo and markets: Flexiticket, Christmas attribution, Boqueria holidays from the market", () => {
  const council = { ca: /14:00, segons l'Ajuntament/, es: /14:00, según el Ayuntamiento/, en: /14:00, according to the City Council/ };
  const holidays = { ca: /4 de gener/, es: /4 de enero/, en: /4 January/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const zoo = bodyToPlainText(ZOO_AQUARIUM.editions[locale].blocks);
    assert.match(zoo, /Flexiticket/, `${locale}: Flexiticket`);
    assert.match(zoo, /90 (days|días|dies)/, `${locale}: Flexiticket validity`);
    assert.match(zoo, council[locale], `${locale}: Christmas closing attributed`);
    const markets = bodyToPlainText(MARKETS.editions[locale].blocks);
    assert.match(markets, holidays[locale], `${locale}: last season's holiday openings`);
    assert.match(markets, /2026-27/, `${locale}: says the 2026-27 dates are not out`);
    assert.doesNotMatch(markets, /(Sundays before Christmas that the City Council|domingos antes de Navidad que el Ayuntamiento|diumenges abans de Nadal que l'Ajuntament)/, `${locale}: openings are the market's, not the council's`);
  }
});

/**
 * Free museums, 28 Oct 2026: the Museu del Disseny's own page says Sunday
 * afternoons and the first Sunday (the earlier copy grouped it with the CCCB
 * as Sunday-afternoon only). The page answers "museos gratis hoy" with a
 * day-by-day table and "cuándo es gratis el MNAC" with its own section.
 */
test("museums: day-by-day table, MNAC section, Disseny's first Sunday", () => {
  const disseny = { ca: /Museu del Disseny\*\* és gratis els diumenges a la tarda \(15:00–20:00\) i el primer diumenge/, es: /Museu del Disseny\*\* es gratis los domingos por la tarde \(15:00–20:00\) y el primer domingo/, en: /Museu del Disseny\*\* is free on Sunday afternoons \(15:00–20:00\) and on the first Sunday/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = MUSEUMS.editions[locale].blocks as { type: string; rows?: string[][]; text?: string }[];
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables[0]?.rows?.length, 7, `${locale}: Monday to Sunday plus first Sunday`);
    assert.ok(blocks.some((b) => b.type === "heading" && /MNAC/.test(b.text ?? "")), `${locale}: MNAC heading`);
    assert.match(JSON.stringify(blocks), disseny[locale], `${locale}: Disseny first Sunday`);
    const text = bodyToPlainText(MUSEUMS.editions[locale].blocks);
    assert.doesNotMatch(text, /CCCB\*{0,2} (and|y|i) (the |el )?\*{0,2}Museu del Disseny/, `${locale}: Disseny no longer grouped with the CCCB`);
    assert.match(text, /22 (November|de noviembre|de novembre) (de )?2026/, `${locale}: next Música open day`);
  }
});

/**
 * Tibidabo, 28 Oct 2026: tibidabo.cat's rates page says the €3.95 funicular
 * fare is for "+60 years"; the schedules page gives the opening days by month
 * and the Cuca de Llum's 10:00-14:00 on 25 and 26 December and 1 January.
 */
test("tibidabo: over-60 funicular fare, opening-days table, Christmas funicular hours", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(TIBIDABO.editions[locale].blocks);
    assert.doesNotMatch(text, /3[,.]95 €?[^.]*(65)|€3\.95[^.]*65/, `${locale}: €3.95 is not for over-65s`);
    assert.match(text, /(majors de |mayores de |over-)60/i, `${locale}: over-60s`);
    assert.match(text, /10:00 (a|to) 14:00/, `${locale}: funicular on 25-26 Dec and 1 Jan`);
    const tables = (TIBIDABO.editions[locale].blocks as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");
    assert.equal(tables[0]?.rows?.length, 4, `${locale}: opening days by month`);
  }
});

test("cards: the price table's online column is 10% off and the difference is card minus Hola", () => {
  const num = (cell: string) => Number(cell.replace(/[€\s]/g, "").replace(",", "."));
  for (const locale of ["ca", "es", "en"] as const) {
    const table = (CARDS.editions[locale].blocks as { type: string; rows?: string[][] }[]).find((b) => b.type === "table");
    assert.ok(table?.rows, `${locale}: price table`);
    for (const [, hola, card, online, diff] of table.rows.slice(1)) {
      assert.equal(Math.round(num(card!) * 0.9 * 100) / 100, num(online!), `${locale}: online = 90% of ${card}`);
      assert.equal(Math.round((num(card!) - num(hola!)) * 100) / 100, num(diff!), `${locale}: difference for ${card}`);
    }
    assert.match(CARDS.editions[locale].blocks.map((b) => JSON.stringify(b)).join(" "), /12[,.]50/, `${locale}: 24 h Hola price`);
  }
});

test("cruise port: terminal table with transport, Port's April 2026 note, terminal C closed, Cruise Bus fares", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(CRUISEPORT.editions[locale].blocks);
    assert.match(text, /3[,.]50/, `${locale}: one-way fare`);
    assert.match(text, /15 (April|de abril|d'abril) (de )?2026/, `${locale}: dated Port note`);
    assert.doesNotMatch(text, /terminal G|2028/i, `${locale}: no plan dates the Port note does not give`);
    assert.doesNotMatch(text, /A, B, C|C, D|\bE (and|y|i) H\b/, `${locale}: terminal C not offered, no Cruise Bus stop at H`);
    const table = (CRUISEPORT.editions[locale].blocks as { type: string; rows?: string[][] }[]).find((b) => b.type === "table");
    assert.equal(table?.rows?.length, 5);
    assert.ok(table?.rows?.every((row) => row.length === 4), `${locale}: four columns`);
    assert.ok(!table?.rows?.some((row) => /^C\b|, C\b/.test(row[0] ?? "")), `${locale}: no terminal C row`);
    // 28 Oct 2026: the Port's MSC page lists "Shuttle bus and taxi rank" but
    // the Cruise Bus names only terminals A-E, so the row says taxi and sends
    // the reader to the cruise line instead of promising the shuttle.
    const msc = table?.rows?.find((row) => (row[0] ?? "").startsWith("MSC"))?.[3] ?? "";
    assert.match(msc, /^Taxi; /, `${locale}: MSC is taxi, shuttle to be asked`);
    assert.match(msc, /cruise line|naviera|naviliera/, `${locale}: MSC row sends the reader to the cruise line`);
    assert.match(text, /30 (October|de octubre|d'octubre)/, `${locale}: terminal C's last cruise, from the 23 Jul 2026 note`);
    assert.doesNotMatch(text, /Portbus[^.]*(formerly|antes se llamaba|abans es deia)|(formerly|antes se llamaba|abans es deia)[^.]*Portbus/i, `${locale}: no unverified rename`);
    assert.doesNotMatch(text, /Drassanes/, `${locale}: no unverified metro stop`);
  }
});

test("markets: hours answered first, Sunday question answered, no unverified group cap", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = MARKETS.editions[locale].blocks as { type: string; text?: string }[];
    const lead = blocks.find((b) => b.type === "paragraph")?.text ?? "";
    assert.match(lead, /8:00/, `${locale}: lead gives the Boqueria hours`);
    const text = bodyToPlainText(MARKETS.editions[locale].blocks);
    assert.match(text, /8:30/, `${locale}: Sunday book market hours`);
    assert.doesNotMatch(text, /\b20 (people|personas|persones)\b/);
  }
});
