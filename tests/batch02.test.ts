import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import { SHOPS, TOWNS_NOV_DEC } from "../src/lib/content/batch02/shops.ts";
import { parseShopResolution } from "../src/lib/programmatic/holidays/dogc.ts";
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

/**
 * Transport EN and ES snippets, 30 Oct 2026 (top-3 push): TMB's table re-read;
 * the EN page gets the zone table, the Hola vs T-casual sums and an FAQ it
 * lacked, and both snippets carry the T-casual price.
 */
test("transport: EN zone table and FAQ, prices in the EN and ES snippets", () => {
  const en = TRANSPORT.editions.en;
  const blocks = en.blocks as { type: string; rows?: string[][] }[];
  const zones = blocks.find((b) => b.type === "table" && (b.rows?.length ?? 0) === 7);
  assert.deepEqual(zones?.rows?.[0], ["1", "€2.90", "€13.00", "€12.00", "€22.80"], "EN zone 1 row");
  assert.deepEqual(zones?.rows?.[1], ["2", "€4.15", "€25.50", "€18.30", "€30.55"], "EN zone 2 row");
  const text = bodyToPlainText(en.blocks);
  assert.match(text.slice(0, 200), /T-casual.*€13.*T-dia.*€12/, "EN answer first");
  assert.match(text, /€24\.80/, "EN: T-casual plus two airport tickets");
  assert.match(text, /T-familiar[^.]*€11\.50/, "EN: T-familiar fare");
  assert.match(text, /2027 fares had not been announced/);
  assert.ok(blocks.some((b) => b.type === "faq"), "EN FAQ");
  assert.ok(JSON.stringify(en.blocks).includes(`](/en/${B2_PATHS.hours.en}/)`), "EN links the metro hours page");
  for (const locale of ["es", "en"] as const) {
    const { seoTitle, seoDescription } = TRANSPORT.editions[locale];
    assert.ok(seoTitle.length <= 60, `${locale}: ${seoTitle.length}`);
    assert.ok(seoDescription.length <= 155, `${locale}: ${seoDescription.length}`);
    assert.match(seoTitle, /T-casual.*13/, `${locale}: T-casual price in the title`);
  }
  assert.equal(TRANSPORT.verifiedAt, "2026-10-30");
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
    // 30 Oct 2026: the towns table now sits between the 2026 and 2027 tables.
    const table2027 = SHOPS.editions[locale].blocks.filter((b) => b.type === "table" && /2027/.test((b as { caption?: string }).caption ?? ""))[0] as { rows: string[][] };
    assert.equal(table2027.rows.length, 10, `${locale}: 8 general + 2 default municipal days in 2027`);
    assert.doesNotMatch(text, /black friday/i);
    assert.doesNotMatch(text, /(rebaixes|rebajas|sales)[^.]*3 (de )?(gener|enero|January)/i);
  }
});

/**
 * Shops, 30 Oct 2026 (top-3 push): the towns whose November-December days
 * differ from the default are transcribed by hand in TOWNS_NOV_DEC. They must
 * be exactly what the holiday engine's parser reads from the same DOGC
 * resolution (tests/fixtures/holidays/resolucio-emt-4342-2025.txt), so a
 * transcription slip cannot reach the page. The 300 m² exemptions (art.
 * 37.1.j/k, restored by Llei 3/2023) are on the "always open" list.
 */
test("shops: the November-December towns table is the DOGC resolution's, town by town", () => {
  const raw = readFileSync(join(import.meta.dirname, "fixtures/holidays/resolucio-emt-4342-2025.txt"), "utf8");
  const resolution = parseShopResolution(raw);
  const restOfYear = (dates: string[]) => dates.filter((d) => d >= "2026-11-01");
  const defaults = restOfYear(resolution.defaults);
  const expected = resolution.councils
    .map((c) => ({ town: c.name, closed: defaults.filter((d) => !c.dates.includes(d)), extra: restOfYear(c.dates).filter((d) => !defaults.includes(d)) }))
    .filter((c) => c.closed.length > 0 || c.extra.length > 0);
  const key = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  assert.deepEqual(
    TOWNS_NOV_DEC.map((t) => ({ ...t, town: key(t.town) })).sort((a, b) => a.town.localeCompare(b.town)),
    expected.map((t) => ({ ...t, town: key(t.town) })).sort((a, b) => a.town.localeCompare(b.town)),
  );
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(SHOPS.editions[locale].blocks);
    assert.match(text, /300 m²/, `${locale}: art. 37.1.j/k exemptions`);
    assert.match(text, /3\/2023/, `${locale}: Llei 3/2023`);
    const towns = SHOPS.editions[locale].blocks.filter((b) => b.type === "table")[1] as { rows: string[][] };
    assert.equal(towns.rows.length, TOWNS_NOV_DEC.length, `${locale}: towns table`);
    assert.ok(SHOPS.editions[locale].seoDescription.length <= 155, `${locale}: description budget`);
    assert.ok(SHOPS.editions[locale].seoTitle.length <= 60, `${locale}: title budget`);
  }
  // The leads count the towns that do not open on 8 December in words.
  const no8 = TOWNS_NOV_DEC.filter((t) => t.closed.includes("2026-12-08")).length;
  for (const locale of ["ca", "es", "en"] as const) {
    const first = SHOPS.editions[locale].blocks.find((b) => b.type === "paragraph") as { text: string };
    assert.ok(first.text.includes(` ${no8} `), `${locale}: lead says ${no8} towns`);
    assert.ok(SHOPS.editions[locale].seoDescription.includes(` ${TOWNS_NOV_DEC.length} `), `${locale}: description count`);
  }
  assert.equal(SHOPS.editions.es.seoTitle, "Domingos y festivos de apertura 2026 en Cataluña y Barcelona");
  assert.equal(SHOPS.verifiedAt, "2026-10-30");
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

test("election night EN: the snippet and lead answer 'what time' with the polling hours (30 Oct)", () => {
  const en = ELECTION_NIGHT.editions.en;
  assert.ok(en.seoTitle.length <= 60 && en.seoDescription.length <= 155, en.seoTitle);
  assert.match(en.seoTitle, /Spain general election results 2026/);
  assert.match(en.seoDescription, /9:00-20:00/);
  const text = bodyToPlainText(en.blocks);
  assert.match(text.slice(0, 400), /20:00/);
  assert.match(text.slice(0, 400), /9:00/);
  assert.match(text, /not yet announced its results site/);
  for (const locale of ["ca", "es", "en"] as const) {
    const body = bodyToPlainText(ELECTION_NIGHT.editions[locale].blocks);
    assert.match(body, /29 (de )?(novembre|noviembre|November), 9[.:]00/, `${locale}: polls-open row`);
  }
  assert.ok(ELECTION_NIGHT.sources.some((s) => s.url.includes("29neleccionesgenerales.es")));
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
    // 30 Oct 2026: a day-by-day table joined the summary, blue and green ones.
    assert.equal(tables.length, 4, `${locale}: summary + days + blue + green tables`);
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
 * Parking, 30 Oct 2026 (top-3 push): AREA's blue tables carry their own
 * limits ("Tarifa A (màx. 1h o 2h)", "Tarifa B (màx. 2h)"); Zone 36 in
 * Trinitat Vella goes live on 9 Nov 2026 with 632 green spaces and a 2-hour
 * limit for non-residents (AREA news, 22.9.2026); AREA's indicative map is
 * linked in the first step; a day-by-day table answers "horario". The
 * search title states the price range in CA and the query words in ES.
 */
test("parking: per-rate limits, Trinitat Vella zone 36, the AREA map and a day-by-day table", () => {
  const limits = { ca: /1 o 2 hores a la tarifa A i 2 hores a la tarifa B/, es: /1 o 2 horas en tarifa A y 2 horas en tarifa B/, en: /1 or 2 hours on Rate A and 2 hours on Rate B/ };
  const map = { ca: "https://areaverda.cat/ca/planol", es: "https://areaverda.cat/es/plano", en: "https://areaverda.cat/es/plano" };
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = PARKING.editions[locale].blocks as { type: string; rows?: string[][]; items?: { text: string }[] }[];
    const text = bodyToPlainText(PARKING.editions[locale].blocks);
    assert.match(text, limits[locale], `${locale}: per-rate limits`);
    assert.match(text, /632/, `${locale}: zone 36 spaces`);
    assert.match(text, /9 (de )?(novembre|noviembre|November) (de )?2026/, `${locale}: zone 36 start`);
    assert.ok(JSON.stringify(blocks).includes(map[locale]), `${locale}: AREA map link`);
    const days = blocks.filter((b) => b.type === "table")[1];
    assert.equal(days?.rows?.length, 3, `${locale}: weekdays, Saturday, Sunday`);
    const edition = PARKING.editions[locale];
    assert.ok(edition.seoTitle.length <= 60, `${locale}: title budget`);
    assert.ok(edition.seoDescription.length <= 155, `${locale}: description budget`);
  }
  assert.match(PARKING.editions.ca.seoTitle, /^Preu zona blava i verda Barcelona: 1,15-4,25 €\/h/);
  assert.match(PARKING.editions.es.seoTitle, /^Zona azul y verde Barcelona: cómo funciona, horario y precio$/);
  // EN, 30 Oct (CTR sweep: 186 impressions at 6.0, 0.5 %): the zone words of
  // its queries in the title, the visitor answer in the description.
  assert.match(PARKING.editions.en.seoTitle, /^Barcelona blue and green zone parking/);
  assert.match(PARKING.editions.en.seoDescription, /9:00–20:00.*visitors may park 1–2 h/);
  assert.equal(PARKING.verifiedAt, "2026-10-30");
  assert.ok(PARKING.sources.some((s) => s.url === "https://areaverda.cat/es/plano"));
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
 * Zoo EN, 30 Oct 2026 (top-3 push): both venues' prices re-read; the title
 * names both tickets, the description and the first line give the adult,
 * child and family-pack prices, and the "family ticket" and "cheaper online"
 * questions have answers. The Aquarium's companion rule (65 %) is new.
 */
test("zoo EN: both prices in the snippet and the first line, family pack and online questions", () => {
  const en = ZOO_AQUARIUM.editions.en;
  assert.ok(en.seoTitle.length <= 60 && en.seoDescription.length <= 155, `${en.seoTitle.length}/${en.seoDescription.length}`);
  assert.match(en.seoTitle, /Zoo & Aquarium tickets 2026: Zoo €23, Aquarium €30/);
  assert.match(en.seoDescription, /€13\.90.*€30.*€23.*€88/);
  const text = bodyToPlainText(en.blocks);
  assert.match(text.slice(0, 260), /Zoo tickets cost €23.*€13\.90.*Aquarium tickets cost €30.*€23.*€88/, "answer first");
  assert.doesNotMatch(text.slice(0, 700), /until 1 November/, "the lead no longer leads with hours that end on 1 November");
  assert.match(text, /Is there a family ticket for the Barcelona Aquarium\?/);
  assert.match(text, /Is it cheaper to buy Barcelona Zoo tickets online\?/);
  for (const locale of ["ca", "es", "en"] as const) {
    assert.match(bodyToPlainText(ZOO_AQUARIUM.editions[locale].blocks), /65 %|65%/, `${locale}: Aquarium companion rule`);
  }
  assert.equal(ZOO_AQUARIUM.verifiedAt, "2026-10-30");
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

/**
 * Cards, 28 Oct 2026: holabarcelona.com renders "Desde 12,50 € 11,25 €" and
 * says the voucher is swapped at a metro ticket machine within 180 days;
 * thisisbarcelona.com's terms say the Barcelona Card runs for "consecutive
 * days, not for 24-hour periods"; the Picasso's free slot is Thursday
 * 16:00-19:00 (no "in winter" on its page).
 */
test("cards: Hola online price and collection, Barcelona Card days rule, museum free slots", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const text = bodyToPlainText(CARDS.editions[locale].blocks);
    assert.match(text, /11[,.]25/, `${locale}: 24 h Hola online price`);
    assert.match(text, /180/, `${locale}: voucher valid 180 days`);
    assert.match(text, /(consecutive days|días consecutivos|dies consecutius)/, `${locale}: terms count days`);
    assert.match(text, /16:00/, `${locale}: Picasso free Thursday slot`);
    assert.doesNotMatch(text, /(in winter|en invierno|a l'hivern)/, `${locale}: no seasonal Picasso claim`);
    assert.match(JSON.stringify(CARDS.editions[locale].blocks), /\]\(\/[a-z]{2}\/[^)]*sagrada-familia[^)]*\/\)/, `${locale}: links the monuments guide`);
  }
  assert.match(CARDS.editions.es.seoTitle, /^Hola Barcelona Travel Card/);
});

/**
 * Climate, 28 Oct 2026: AEMET's normals page still says "Periodo: 1981-2010"
 * and its help page names 1981-2010 as the reference period; Meteocat says its
 * 1991-2020 climatologies are still in preparation. Monthly records read one
 * month at a time from AEMET's extremes page (updated 30 Sep 2026).
 */
test("climate: 1981-2010 table with the year row, city-centre table, a section per month with its records", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = CLIMATE.editions[locale].blocks as { type: string; level?: number; text?: string; caption?: string; rows?: string[][] }[];
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 2, `${locale}: airport and city-centre tables`);
    assert.match(tables[0]?.caption ?? "", /1981-2010/, `${locale}: AEMET period`);
    assert.match(tables[1]?.caption ?? "", /2010-2025/, `${locale}: Meteocat period`);
    assert.equal(tables[0]?.rows?.length, 13, `${locale}: 12 months and the year`);
    assert.equal(tables[1]?.rows?.length, 13, `${locale}: 12 months and the year`);
    assert.ok(!tables.some((t) => /1991-2020/.test(t.caption ?? "")), `${locale}: no table claims 1991-2020`);
    assert.equal(blocks.filter((b) => b.type === "heading" && b.level === 3).length, 12, `${locale}: one section per month`);
    const text = bodyToPlainText(CLIMATE.editions[locale].blocks);
    assert.match(text, /23[,.]8 °C/, `${locale}: January record high`);
    assert.match(text, /-7[,.]2 °C/, `${locale}: January record low`);
    assert.match(text, /16[,.]1/, `${locale}: annual mean`);
  }
  const ca = bodyToPlainText(CLIMATE.editions.ca.blocks);
  assert.match(ca, /l'1 de març del 1988/, "Catalan elides the article before 1");
  assert.doesNotMatch(ca, /el 1 de|el 11 de/, "no 'el 1 de' in Catalan");
});

/**
 * Climate EN, 30 Oct 2026 (top-3 push): the AEMET 0076 table re-read, humidity
 * (column H) added in every locale, °F beside °C in English, and the snippet
 * names the coldest and warmest months with their figures.
 */
test("climate: humidity column from AEMET, °F in English, the answer in the EN snippet and lead", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = CLIMATE.editions[locale].blocks as { type: string; headers?: string[]; rows?: string[][] }[];
    const airport = blocks.find((b) => b.type === "table");
    assert.equal(airport?.headers?.length, 8, `${locale}: humidity column`);
    assert.equal(airport?.rows?.[9]?.[6], "73 %", `${locale}: October humidity 73 %`);
    assert.equal(airport?.rows?.[12]?.[6], "69 %", `${locale}: annual humidity 69 %`);
  }
  const en = CLIMATE.editions.en;
  const airport = (en.blocks as { type: string; rows?: string[][] }[]).find((b) => b.type === "table");
  assert.equal(airport?.rows?.[0]?.[2], "13.6 (56)", "January high in °C (°F)");
  assert.equal(airport?.rows?.[7]?.[2], "28.5 (83)", "August high in °C (°F)");
  assert.ok(en.seoTitle.length <= 60 && en.seoDescription.length <= 155);
  assert.match(en.seoTitle, /weather and temperature by month/);
  assert.match(en.seoDescription, /January.*13\.6 °C \(56 °F\).*August.*28\.5 °C \(83 °F\).*October.*91 mm/);
  const first = bodyToPlainText(en.blocks).slice(0, 220);
  assert.match(first, /January.*coldest.*13\.6 °C \(56 °F\)/, "answer in the first lines");
  assert.equal(CLIMATE.verifiedAt, "2026-10-30");
});

/**
 * Climate CA/ES, 30 Oct 2026 (CTR far below the site's curve at 4.6 and 8.6):
 * the snippet gives November and December, the months people are about to
 * live, then the coldest and wettest; the lead opens with the range and
 * points "el temps d'avui" searchers at the official forecast.
 */
test("climate CA/ES: November and December in the snippet and lead, official forecast linked", () => {
  const forecast = { ca: "https://www.meteo.cat/prediccio/municipal/080193", es: "https://www.aemet.es/es/eltiempo/prediccion/municipios/barcelona-id08019" };
  for (const locale of ["ca", "es"] as const) {
    const edition = CLIMATE.editions[locale];
    assert.ok(edition.seoTitle.length <= 60 && edition.seoDescription.length <= 155, edition.seoDescription);
    assert.match(edition.seoDescription, /^(Novembre|Noviembre): (màximes|máximas) de 17,3 °C.*8,6 °C.*14,3 (i|y) 5,7 °C/);
    const first = bodyToPlainText(edition.blocks).slice(0, 320);
    assert.match(first, /13,6 °C.*28,5 °C.*91 mm/, `${locale}: range in the first lines`);
    assert.match(first, /17,3 °C/, `${locale}: November in the lead`);
    assert.ok(JSON.stringify(edition.blocks).includes(forecast[locale]), `${locale}: official forecast link`);
  }
  assert.match(CLIMATE.editions.ca.seoTitle, /^Temps a Barcelona mes a mes/);
});

/**
 * Monuments, 28 Oct 2026: sagradafamilia.org prices grid and April-September
 * hours; parkguell.barcelona prices-and-times and how-to-get-there; Casa
 * Batlló's ticket office closes at 21:00. The night-visit price ("until
 * 15 Nov") stays out.
 */
test("monuments: Sagrada Família price grid and summer hours, Park Güell prices and resident hours, no dated night price", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const blocks = MONUMENTS.editions[locale].blocks as { type: string; rows?: string[][] }[];
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 4, `${locale}: summary, Sagrada Família prices and hours, Park Güell prices`);
    assert.deepEqual(tables[1]?.rows?.map((r) => r.slice(1, 4).join("|").replace(/[€\s]/g, "")), ["26|24|21", "30|28|23", "36|34|28", "40|38|32"], `${locale}: price grid`);
    assert.equal(tables[2]?.rows?.length, 4, `${locale}: three seasons and the holidays`);
    assert.match(JSON.stringify(tables[2]), /9:00–20:00/, `${locale}: April-September weekdays`);
    const text = bodyToPlainText(MONUMENTS.editions[locale].blocks);
    assert.match(text, /13[,.]50/, `${locale}: Park Güell reduced price`);
    assert.match(text, /18:00/, `${locale}: resident evening hours`);
    assert.match(text, /21:00/, `${locale}: Casa Batlló ticket office`);
    assert.match(text, /L3/, `${locale}: Park Güell metro`);
    assert.doesNotMatch(text, /(€25|25 €)/, `${locale}: no dated night-visit price`);
  }
  assert.match(MONUMENTS.editions.en.seoTitle, /^Sagrada Familia tickets price 2026/);
});

/**
 * Camp Nou, 28 Oct 2026: the club's tickets page (eight products with "from"
 * prices) and timetable (3 Nov until 21:00, 17 Nov until 17:00).
 */
test("campnou: product table from the club, November special hours, ES title for the museum queries", () => {
  for (const locale of ["ca", "es", "en"] as const) {
    const table = (CAMPNOU.editions[locale].blocks as { type: string; rows?: string[][] }[]).find((b) => b.type === "table");
    assert.deepEqual(table?.rows?.map((r) => Number((r[1] ?? "").replace(/[€\s]/g, ""))), [28, 38, 52, 59, 69, 99, 149, 214], `${locale}: products`);
    const text = bodyToPlainText(CAMPNOU.editions[locale].blocks);
    assert.match(text, /21:00/, `${locale}: 3 November late opening`);
    assert.match(text, /17:00/, `${locale}: 17 November early close`);
    assert.match(text, /\b113\b/, `${locale}: bus lines`);
  }
  assert.match(CAMPNOU.editions.es.seoTitle, /^Museo del Barça/);
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

test("ski: opening in the title, official snow-report links, FGC early birds, child prices; snow guide in the query's words", () => {
  const opening = { ca: /obertura/, es: /apertura/, en: /opening/ } as const;
  const winter = { ca: /^Rutes d'hivern a Catalunya/, es: /^Dónde ver nieve en Cataluña/, en: /^Snow in Catalonia/ } as const;
  for (const locale of LOCALES) {
    const edition = SKI.editions[locale];
    assert.match(edition.seoTitle, opening[locale], `${locale}: opening in the title`);
    assert.ok(edition.seoTitle.length <= 60, `${locale}: title budget`);
    const json = JSON.stringify(edition.blocks);
    assert.match(json, /pirineu365\.cat\/infoneu-pirineu365\//, `${locale}: FGC snow report linked`);
    const text = bodyToPlainText(edition.blocks);
    assert.match(text, /600/, `${locale}: La Molina early-bird season pass`);
    assert.match(text, /36 €|€36/, `${locale}: child day price`);
    assert.doesNotMatch(text, /12[,.]6 km/, `${locale}: Tavascan's page says twelve kilometres`);
    assert.match(SNOW.editions[locale].seoTitle, winter[locale], `${locale}: snow guide title`);
  }
});

test("sitges and tarragona: corrected first pattern train, T-casual zones, last train back, open days not free days", () => {
  const back = { ca: /Horaris del tren de Sitges a Barcelona/, es: /Horarios del tren de Sitges a Barcelona/, en: /Sitges to Barcelona train times/ } as const;
  for (const locale of LOCALES) {
    const sitges = bodyToPlainText(SITGES.editions[locale].blocks);
    assert.match(sitges, /6:06 (a|to) 21:45/, `${locale}: the :06/:15/:36/:45 pattern starts at 6:06`);
    assert.doesNotMatch(sitges, /6:36 (a|to) 21:45/, `${locale}: old start time gone`);
    assert.match(sitges, /34,70 €|€34\.70/, `${locale}: 3-zone T-casual`);
    assert.match(sitges, back[locale], `${locale}: return-direction section`);
    const tarragona = TARRAGONA.editions[locale];
    assert.doesNotMatch(tarragona.seoDescription, /gratis|free/i, `${locale}: no unconfirmed free days in the snippet`);
    const text = bodyToPlainText(tarragona.blocks);
    assert.match(text, /22:26/, `${locale}: last train back from 2 Nov`);
    assert.doesNotMatch(text, /21:56 (els caps de setmana|los fines de semana|at weekends)/, `${locale}: no weekday/weekend split`);
  }
});

test("figueres: walk from Figueres-Vilafant, 10:30 opening dated 1 Oct-22 Mar, bus and car, nothing 'under an hour'", () => {
  const walk = { ca: /25 minuts a peu/, es: /25 minutos a pie/, en: /25 minutes on foot/ } as const;
  for (const locale of LOCALES) {
    const blocks = FIGUERES.editions[locale].blocks as { type: string; lead?: boolean; text?: string }[];
    const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
    assert.match(lead, walk[locale], `${locale}: walk from the high-speed station`);
    assert.match(lead, /22 (de )?(març|marzo|March)/, `${locale}: winter hours dated`);
    const text = bodyToPlainText(FIGUERES.editions[locale].blocks);
    assert.doesNotMatch(text, /menys d'una hora|menos de una hora|under an hour/, `${locale}: high-speed is about an hour`);
    assert.match(text, /140 km/, `${locale}: distance by car`);
    assert.match(text, /44[.,]50/, `${locale}: Dalí + La Pedrera combined ticket`);
    assert.ok(FIGUERES.editions[locale].seoTitle.length <= 60, `${locale}: title budget`);
  }
});

test("montserrat: the Aeri table covers 1 Nov and 7 Dec, the free question and the Monistrol station are answered", () => {
  const free = { ca: /és gratis per a algú/, es: /Es gratis el cremallera/, en: /free for anyone/ } as const;
  for (const locale of LOCALES) {
    const blocks = MONTSERRAT_FREE.editions[locale].blocks as { type: string; rows?: string[][] }[];
    const aeri = blocks.find((b) => b.type === "table" && (b.rows ?? []).some((row) => row[1] === "9:30–17:15"));
    const rows = JSON.stringify(aeri?.rows ?? []);
    assert.match(rows, /1 (de )?(novembre|noviembre|November)/, `${locale}: 1 Nov keeps October hours`);
    assert.match(rows, /7 (de )?(desembre|diciembre|December)/, `${locale}: 7 Dec has holiday hours`);
    const text = bodyToPlainText(MONTSERRAT_FREE.editions[locale].blocks);
    assert.match(text, free[locale], `${locale}: answers "cremallera gratis"`);
    assert.match(text, /Monistrol-Vila/, `${locale}: which station`);
    assert.ok(MONTSERRAT_FREE.editions[locale].seoTitle.length <= 60, `${locale}: title budget`);
  }
});

test("portaventura: the standard price leads, the Halloween price is labelled, the winter closure and the walk are stated", () => {
  const walk = { ca: /10 minuts a peu/, es: /10 minutos a pie/, en: /10-minute walk/ } as const;
  for (const locale of LOCALES) {
    const edition = PORTAVENTURA.editions[locale];
    assert.match(edition.seoDescription, /43/, `${locale}: description gives the standard price`);
    assert.doesNotMatch(edition.seoDescription, /37/, `${locale}: no promotional price in the snippet`);
    const blocks = edition.blocks as { type: string; lead?: boolean; text?: string }[];
    const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
    assert.match(lead, /43/, `${locale}: lead gives the standard price`);
    assert.match(lead, /Halloween/, `${locale}: the 37 EUR price is tied to the promotion`);
    assert.match(lead, /19 (de )?(febrer|febrero|February)/, `${locale}: winter closure`);
    assert.match(bodyToPlainText(edition.blocks), walk[locale], `${locale}: walk from the station`);
    assert.ok(edition.seoTitle.length <= 60, `${locale}: title budget`);
  }
});

test("portaventura EN: the snippet leads with the 2026-27 opening dates (feed re-read 30 Oct)", () => {
  const en = PORTAVENTURA.editions.en;
  assert.match(en.seoTitle, /^PortAventura opening dates 2026-27/);
  assert.ok(en.seoDescription.length <= 155, en.seoDescription);
  assert.match(en.seoDescription, /6 Jan.*7 Jan-19 Feb 2027.*20 Feb.*18 Mar/);
  assert.match(JSON.stringify(en.blocks), /Is PortAventura open in January 2027\?/);
});

test("ripolles: the comarca in Idescat's figures and a villages table; setcases answers what to do", () => {
  const villages = { ca: "Pobles bonics a prop de Ripoll", es: "Pueblos bonitos cerca de Ripoll", en: "Pretty villages near Ripoll" } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(RIPOLLES.editions[locale].blocks);
    assert.match(text, /19 (municipis|municipios|municipalities)/, `${locale}: municipality count`);
    assert.match(text, /956[.,]6 km²/, `${locale}: area`);
    assert.match(text, /25[.,]914/, `${locale}: population`);
    const blocks = RIPOLLES.editions[locale].blocks as { type: string; caption?: string; rows?: string[][] }[];
    const table = blocks.find((b) => b.type === "table" && b.caption === villages[locale]);
    assert.ok(table && (table.rows?.length ?? 0) >= 5, `${locale}: villages table`);
    const faqs = JSON.stringify(SETCASES.editions[locale].blocks.filter((b) => b.type === "faq"));
    assert.match(faqs, /Què fer a Setcases|Qué hacer en Setcases|to do in Setcases/, `${locale}: setcases what-to-do FAQ`);
  }
});

test("nuria: the lead answers the price; free travel, November and the ski pass are answered from FGC", () => {
  const fare = { ca: /34 € anada i tornada/, es: /34 € ida y vuelta/, en: /€34 return/ } as const;
  const free = { ca: /0 a 3 anys/, es: /0 a 3 años/, en: /under 4/ } as const;
  for (const locale of LOCALES) {
    const blocks = NURIA.editions[locale].blocks as { type: string; lead?: boolean; text?: string }[];
    const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
    assert.match(lead, fare[locale], `${locale}: lead gives the return fare`);
    assert.match(lead, /30 de novembre|30 de noviembre|30 November/, `${locale}: lead dates the fares`);
    const text = bodyToPlainText(NURIA.editions[locale].blocks);
    assert.match(text, free[locale], `${locale}: says who rides free`);
    assert.match(text, /104/, `${locale}: annual season ticket`);
    assert.match(text, /2026-2027|2026-27/, `${locale}: ski-pass status for the coming season`);
    assert.match(text, /3 (al|to) 30 (de )?(novembre|noviembre|November)/, `${locale}: last November's weekday closure`);
    assert.ok(NURIA.editions[locale].seoTitle.length <= 60, `${locale}: seoTitle fits`);
    assert.ok(NURIA.editions[locale].seoDescription.length <= 155, `${locale}: description fits`);
  }
});
