import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { GROSSA } from "../src/lib/content/batch02/grossa.ts";
import {
  BILLETE_PRICE,
  DECIMO_PRICE,
  DRAW_TIME_2026,
  EUROS_PER_SERIES,
  ISSUE,
  LOTERIA_NADAL,
  NADAL_AS_OF,
  NADAL_DRAW_DATE,
  NADAL_META,
  NADAL_URLS,
  NADAL_VERIFIED,
  NUMBERS,
  PRIZE_POOL,
  PRIZES_PER_SERIES,
  PROGRAMME,
  PROVINCES,
  RESULTS_2025,
  RESULTS_2026,
  SERIES,
  SERIES_2025,
  TIME_HOSTS,
  buildNadalArticle,
  buildNadalBody,
  drawTimeProblems,
  isStale,
  nadalDescription,
  nadalSeoTitle,
  nadalSources,
  perDecimo,
  prizePageUrl,
  resultsProblems,
  salesStale,
  topNumbers,
  townsLine,
  type CatalanSale,
  type DrawTime,
  type NadalResults,
} from "../src/lib/content/batch02/loteria-nadal.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { SNAPSHOT as ELECTIONS } from "../src/lib/programmatic/elections/snapshot.ts";

/**
 * The Spanish Christmas lottery 2026 (31 Oct 2026): one page per language, one
 * results slot the lead fills on 22 December.
 *
 * Pins what the page must say (SELAE's 2026 calendar and prize programme,
 * SELAE's help pages, its 2025 dossier and results, RTVE's 2025 broadcast and
 * the IRPF levy, all read on 31 Oct 2026), what it must never say (a 2026
 * time nobody has announced, a computed claim deadline, last year's numbers
 * as this year's, a town that is not a Catalan municipality), how it changes
 * when the slot is filled, and fails once 23 December 2026 arrives with the
 * slot still empty.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const json = (locale: Locale) => JSON.stringify(LOTERIA_NADAL.editions[locale].blocks);
const body = (locale: Locale) => text(LOTERIA_NADAL.editions[locale].blocks);
const sentences = (plain: string) => plain.split(/\n|(?<=[.!?])\s+/);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));

/** A made-up result (not real numbers), with every kind of Catalan line. */
const FAKE: NadalResults = {
  first: "45678",
  second: "00417",
  third: "51230",
  fourth: ["08802", "63145"],
  fifth: ["00001", "11111", "22222", "33333", "44444", "55555", "66666", "99998"],
  soldInCatalonia: {
    first: [
      { town: "Tremp", province: "Lleida" },
      { town: "Reus", province: "Tarragona" },
    ],
    second: [],
    third: null,
    fourth: [{ town: "l'Hospitalet de Llobregat", province: "Barcelona" }],
  },
  source: {
    name: "Lotería Nacional: premios mayores del sorteo del 22 de diciembre de 2026 (prova)",
    url: "https://www.loteriasyapuestas.es/es/loteria-nacional/resultados/loteria-nacional-premios-mayores-del-sorteo-del-22-de-diciembre-de-2026",
    publisher: "SELAE",
  },
};

const FAKE_TIME: DrawTime = {
  time: "8:30",
  source: { name: "Dossier de prensa de prova", url: "https://www.selae.es/prova-dossier-navidad-2026.pdf", publisher: "SELAE" },
};

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the registry paths", () => {
  assert.deepEqual(B2_PATHS.loteriaNadal, {
    ca: "guies/loteria-de-nadal",
    es: "guias/loteria-de-navidad",
    en: "guides/spanish-christmas-lottery",
  });
  for (const locale of LOCALES) {
    const edition = LOTERIA_NADAL.editions[locale];
    for (const blocks of [edition.blocks, buildNadalBody(locale, FAKE, FAKE_TIME, "2026-12-22")]) {
      const parsed = bodySchema.safeParse(blocks);
      assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    }
    assert.ok(wordCount(body(locale)) > 1500, `${locale} is thin: ${wordCount(body(locale))}`);
    assert.equal(edition.path, B2_PATHS.loteriaNadal[locale]);
    assert.equal(edition.path, NADAL_META[locale].path);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
});

test("the paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = ALL_PATHS.map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === B2_PATHS.loteriaNadal[locale]).length, 1, locale);
  }
});

test("titles fit in 60 characters and descriptions in 155, before and after the draw, and answer first", () => {
  const pendingAnswer: Record<Locale, RegExp> = {
    ca: /^La loteria de Nadal 2026 se sorteja el dimarts 22 de desembre: dècim de 20 € i 400\.000 € de Gordo per dècim/,
    es: /^La Lotería de Navidad 2026 se sortea el martes 22 de diciembre: décimo de 20 € y 400\.000 € de Gordo por décimo/,
    en: /^The Spanish Christmas Lottery 2026 is drawn on Tuesday 22 December: €20 a décimo, €400,000 El Gordo per décimo/,
  };
  const searched: Record<Locale, { pending: RegExp; results: RegExp }> = {
    ca: { pending: /^Loteria de Nadal 2026: quan és, premis i on toca a Catalunya$/, results: /on ha tocat el Gordo a Catalunya$/ },
    es: { pending: /^Lotería de Navidad 2026 en Cataluña: fecha, hora y premios$/, results: /dónde ha tocado el Gordo en Cataluña$/ },
    en: { pending: /^Spanish Christmas Lottery 2026: El Gordo date, prizes, tax$/, results: /results: El Gordo number$/ },
  };
  const h1: Record<Locale, RegExp> = { ca: /^Loteria de Nadal 2026/, es: /^Lotería de Navidad 2026/, en: /^Spanish Christmas Lottery 2026/ };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = LOTERIA_NADAL.editions[locale];
    assert.match(title, h1[locale]);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    for (const results of [null, FAKE, RESULTS_2026]) {
      const t = nadalSeoTitle(locale, results);
      const d = nadalDescription(locale, results);
      assert.ok(t.length > 10 && t.length <= 60, `${locale} title ${t.length}: ${t}`);
      assert.ok(d.length > 60 && d.length <= 155, `${locale} description ${d.length}: ${d}`);
      assert.match(t, /2026/);
    }
    assert.equal(seoTitle, nadalSeoTitle(locale));
    assert.equal(seoDescription, nadalDescription(locale));
    if (!RESULTS_2026) {
      assert.match(seoTitle, searched[locale].pending);
      assert.match(seoDescription, pendingAnswer[locale]);
    }
    // With results, the title answers "on ha tocat" and the description leads with El Gordo.
    assert.match(nadalSeoTitle(locale, FAKE), searched[locale].results);
    const withResults = nadalDescription(locale, FAKE);
    assert.ok(withResults.indexOf(FAKE.first) > 0 && withResults.indexOf(FAKE.first) < 60, `${locale}: El Gordo is not in the first line`);
    for (const number of [FAKE.first, FAKE.second, FAKE.third]) assert.ok(withResults.includes(number), `${locale}: ${number}`);
  }
});

test("internal links stay in their language, end in a slash and point at a published path; La Grossa is linked in the body", () => {
  for (const locale of LOCALES) {
    for (const blocks of [json(locale), JSON.stringify(buildNadalBody(locale, FAKE, FAKE_TIME))]) {
      const hrefs = [...blocks.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
      for (const href of hrefs) {
        assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
        assert.ok(href.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
      }
      assert.ok(hrefs.length >= 8, `${locale}: only ${hrefs.length} internal links`);
      const grossa = `/${locale}/${B2_PATHS.grossa[locale]}/`;
      assert.ok(hrefs.filter((href) => href === grossa).length >= 2, `${locale}: no body link to La Grossa`);
    }
  }
});

test("La Grossa, New Year's Eve and Christmas in Barcelona each link here exactly once", () => {
  for (const locale of LOCALES) {
    const here = `](/${locale}/${B2_PATHS.loteriaNadal[locale]}/)`;
    for (const [name, article] of [["grossa", GROSSA], ["nye", NEW_YEAR], ["christmas-bcn", CHRISTMAS_BARCELONA]] as const) {
      assert.equal(JSON.stringify(article.editions[locale].blocks).split(here).length - 1, 1, `${name}/${locale} links here exactly once`);
    }
  }
});

test("external links are https, official, and every one is a listed source", () => {
  const urls = LOTERIA_NADAL.sources.map((source) => source.url);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  const allowed = new Set(["www.loteriasyapuestas.es", "www.selae.es", "www.rtve.es", "www.boe.es", "sede.agenciatributaria.gob.es"]);
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
    // No reseller, lottery shop or press cutting: SELAE, RTVE, the BOE and the tax agency only.
    assert.ok(allowed.has(new URL(url).host), `${url} is not an official source`);
  }
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((https?:[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.match(href, /^https:\/\//, href);
      assert.ok(urls.includes(href), `${locale}: ${href} is linked but not in the sources`);
    }
    // With results and a time, their sources and the 2026 per-prize pages join.
    const filled = buildNadalArticle(FAKE, FAKE_TIME);
    const filledUrls = filled.sources.map((s) => s.url);
    for (const match of JSON.stringify(filled.editions[locale].blocks).matchAll(/\]\((https?:[^)]*)\)/g)) {
      assert.ok(filledUrls.includes(match[1] ?? ""), `${locale}: ${match[1]} is linked but not in the sources`);
    }
  }
  for (const host of ["www.loteriasyapuestas.es", "www.selae.es", "www.rtve.es", "www.boe.es", "sede.agenciatributaria.gob.es"]) {
    assert.ok(urls.some((url) => new URL(url).host === host), `no source on ${host}`);
  }
  assert.equal(LOTERIA_NADAL.verifiedAt, NADAL_VERIFIED);
});

test("the read-next box only repeats links from the related rail, and La Grossa comes first", () => {
  for (const locale of LOCALES) {
    const before = LOTERIA_NADAL.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    assert.ok(related.items?.[0]?.includes(`(/${locale}/${B2_PATHS.grossa[locale]}/)`), locale);
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("no new photograph: the hero is the shops guide's hero with its exact alt and caption", () => {
  assert.ok(LOTERIA_NADAL.heroKey && IMAGE_BY_KEY.has(LOTERIA_NADAL.heroKey));
  assert.equal(LOTERIA_NADAL.heroKey, SHOPS.heroKey);
  assert.deepEqual(LOTERIA_NADAL.heroAlt, SHOPS.heroAlt, "alt differs from the existing media row");
  assert.deepEqual(LOTERIA_NADAL.heroCaption, SHOPS.heroCaption, "caption differs from the existing media row");
  assert.equal(LOTERIA_NADAL.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!LOTERIA_NADAL.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* Known answers read on 31 Oct 2026                                          */
/* -------------------------------------------------------------------------- */

test("known answers: the date, the place, the issue and the online sales close (SELAE)", () => {
  assert.equal(NADAL_DRAW_DATE, "2026-12-22");
  assert.equal(weekdayIndex(NADAL_DRAW_DATE), 2); // Tuesday
  assert.equal(holidayOn(NADAL_DRAW_DATE), null, "22 December is a working day");
  assert.equal(weekdayIndex("2026-12-21"), 1); // Monday, the online close
  assert.equal(weekdayIndex("2027-01-06"), 3); // Wednesday, El Niño
  const leadWords: Record<Locale, RegExp[]> = {
    ca: [/^La loteria de Nadal 2026 se sorteja el dimarts 22 de desembre al Teatro Real de Madrid, i el primer premi, el Gordo, és de 400\.000 € per dècim de 20 €/, /encara no s'ha anunciat/, /2025/],
    es: [/^La Lotería de Navidad 2026 se sortea el martes 22 de diciembre en el Teatro Real de Madrid, y el primer premio, el Gordo, es de 400\.000 € por décimo de 20 €/, /aún no se ha anunciado/, /2025/],
    en: [/^The Spanish Christmas Lottery 2026 is drawn on Tuesday 22 December at the Teatro Real in Madrid, and the first prize, El Gordo, is €400,000 per €20 décimo/, /not been announced yet/, /2025/],
  };
  const facts: Record<Locale, RegExp[]> = {
    ca: [/205 sèries de 100\.000 números/, /00000 al 99999/, /4\.100 milions d'euros/, /2\.870 milions/, /20 € el dècim; 200 € el bitllet/, /23:45 del (dilluns )?21 de desembre/, /Tres mesos/, /set més que el 2025/],
    es: [/205 series de 100\.000 números/, /00000 al 99999/, /4\.100 millones de euros/, /2\.870 millones/, /20 € el décimo; 200 € el billete/, /23:45 del (lunes )?21 de diciembre/, /Tres meses/, /siete más que en 2025/],
    en: [/205 series of 100,000 numbers/, /00000 to 99999/, /€4\.1 billion/, /€2\.87 billion/, /€20 a décimo/, /23:45 on (Monday )?21 December/, /Three months/, /seven more than in 2025/],
  };
  for (const locale of LOCALES) {
    const blocks = LOTERIA_NADAL.editions[locale].blocks;
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    assert.equal(blocks[1]?.type, "keyFacts");
    if (!RESULTS_2026 && !DRAW_TIME_2026) for (const pattern of leadWords[locale]) assert.match(text(blocks.slice(0, 1)), pattern, `${locale} lead`);
    const all = body(locale);
    for (const pattern of facts[locale]) assert.match(all, pattern, `${locale}: ${pattern}`);
    for (const url of [NADAL_URLS.calendar, NADAL_URLS.programme, NADAL_URLS.lnac, NADAL_URLS.nowOn, NADAL_URLS.tv2025]) {
      assert.ok(json(locale).includes(`](${url})`), `${locale}: no link to ${url}`);
    }
  }
  assert.equal(SERIES - SERIES_2025, 7);
});

test("known answers: the prize programme is SELAE's of 26 January 2026, row by row, and adds up", () => {
  assert.deepEqual(
    PROGRAMME.map((row) => [row.key, row.count, row.perBillete]),
    [
      ["first", 1, 4_000_000],
      ["second", 1, 1_250_000],
      ["third", 1, 500_000],
      ["fourth", 2, 200_000],
      ["fifth", 8, 60_000],
      ["pedrea", 1_794, 1_000],
      ["approxFirst", 2, 20_000],
      ["approxSecond", 2, 12_500],
      ["approxThird", 2, 9_600],
      ["hundreds", 495, 1_000],
      ["lastTwo", 2_997, 1_000],
      ["reintegro", 9_999, 200],
    ],
  );
  // The programme's own totals: 15,304 prizes and 14 million euros per series.
  assert.equal(PROGRAMME.reduce((sum, row) => sum + row.count, 0), PRIZES_PER_SERIES);
  assert.equal(PROGRAMME.reduce((sum, row) => sum + row.count * row.perBillete, 0), EUROS_PER_SERIES);
  // The balls of the prize drum are the drawn prizes: 1,807, as in 2025.
  assert.equal(PROGRAMME.filter((row) => ["first", "second", "third", "fourth", "fifth", "pedrea"].includes(row.key)).reduce((sum, row) => sum + row.count, 0), 1_807);
  assert.equal(ISSUE, SERIES * NUMBERS * BILLETE_PRICE);
  assert.equal(PRIZE_POOL, SERIES * EUROS_PER_SERIES);
  assert.equal(PRIZE_POOL, ISSUE * 0.7);
  assert.equal(BILLETE_PRICE, DECIMO_PRICE * 10);
  assert.equal(perDecimo("first"), 400_000);
  assert.equal(perDecimo("second"), 125_000);
  assert.equal(perDecimo("third"), 50_000);
  assert.equal(perDecimo("fourth"), 20_000);
  assert.equal(perDecimo("fifth"), 6_000);
  assert.equal(perDecimo("pedrea"), 100);
  assert.equal(perDecimo("reintegro"), DECIMO_PRICE);
  for (const locale of LOCALES) {
    const tables = LOTERIA_NADAL.editions[locale].blocks.filter((b) => b.type === "table") as { rows: string[][] }[];
    const programme = tables.find((t) => t.rows.length === PROGRAMME.length);
    assert.ok(programme, `${locale}: no programme table`);
    const sep = locale === "en" ? "," : ".";
    assert.equal(programme.rows[0]?.[2], locale === "en" ? "€4,000,000" : `4${sep}000${sep}000 €`, locale);
    assert.equal(programme.rows[0]?.[3], locale === "en" ? "€400,000" : `400${sep}000 €`, locale);
    assert.equal(programme.rows[5]?.[1], `1${sep}794`, locale);
    assert.equal(programme.rows[11]?.[3], locale === "en" ? "€20" : "20 €", locale);
  }
});

test("known answers: the levy is 20% of each décimo's prize above €40,000 (Ley 35/2006, DA 33ª)", () => {
  const net: Record<Locale, RegExp[]> = {
    ca: [/72\.000 €/, /328\.000 €/, /17\.000 €/, /108\.000 €/, /48\.000 €/, /disposició addicional 33a/],
    es: [/72\.000 €/, /328\.000 €/, /17\.000 €/, /108\.000 €/, /48\.000 €/, /disposición adicional 33\.ª/],
    en: [/€72,000/, /€328,000/, /€17,000/, /€108,000/, /€48,000/, /additional provision 33/],
  };
  for (const locale of LOCALES) {
    const all = body(locale);
    for (const pattern of net[locale]) assert.match(all, pattern, locale);
    for (const url of [NADAL_URLS.irpf, NADAL_URLS.aeatNonResidents, NADAL_URLS.tax]) {
      assert.ok(json(locale).includes(`](${url})`), `${locale}: no link to ${url}`);
    }
  }
  assert.match(NADAL_URLS.irpf, /^https:\/\/www\.boe\.es\/buscar\/act\.php\?id=BOE-A-2006-20764/);
});

test("known answers: where to buy, check and collect, from SELAE's pages", () => {
  const claims: Record<Locale, RegExp[]> = {
    ca: [/gairebé 11\.000/, /d'1 a 10 dècims/, /Menys de 2\.000 € per dècim/, /BBVA i de CaixaBank/, /No cal ser-ne client/, /cita prèvia/, /davant notari/, /400 €/, /Bizum/, /23 de març de 2026/, /menors de 18 anys/, /\(a\).*\(c\).*\(t\)|una a\), les centenes \(c\) i les terminacions \(t\)/],
    es: [/casi 11\.000/, /de 1 a 10 décimos/, /Menos de 2\.000 € por décimo/, /BBVA y de CaixaBank/, /No hace falta ser cliente/, /cita previa/, /ante notario/, /400 €/, /Bizum/, /23 de marzo de 2026/, /menores de 18 años/, /una a\), las centenas \(c\) y las terminaciones \(t\)/],
    en: [/almost 11,000/, /1 to 10 décimos/, /Under €2,000 per décimo/, /BBVA and CaixaBank/, /do not need to be a customer/, /appointment/, /before a notary/, /€400/, /Bizum/, /23 March 2026/, /under-18s/, /\(marked a\), the hundreds \(c\) and the endings \(t\)/],
  };
  for (const locale of LOCALES) {
    const all = body(locale);
    for (const pattern of claims[locale]) assert.match(all, pattern, `${locale}: ${pattern}`);
    for (const url of [NADAL_URLS.collect, NADAL_URLS.online, NADAL_URLS.play, NADAL_URLS.minors, NADAL_URLS.list2025]) {
      assert.ok(json(locale).includes(`](${url})`), `${locale}: no link to ${url}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The Catalan angle                                                          */
/* -------------------------------------------------------------------------- */

const MUNICIPALITIES = new Map(ELECTIONS.municipalities.map((m) => [m.name, m.province]));

test("every town printed as a Catalan point of sale is a Catalan municipality, in its province", () => {
  assert.equal(MUNICIPALITIES.size, 947);
  const lists = (r: NadalResults) => Object.values(r.soldInCatalonia).filter((sales): sales is CatalanSale[] => sales !== null);
  for (const results of [RESULTS_2025, ...(RESULTS_2026 ? [RESULTS_2026] : []), FAKE]) {
    for (const sales of lists(results)) {
      for (const sale of sales) {
        assert.ok(PROVINCES.includes(sale.province), sale.province);
        assert.equal(MUNICIPALITIES.get(sale.town), sale.province, `"${sale.town}" is not a municipality of ${sale.province} as Idescat names it`);
      }
    }
  }
});

test("the 2025 Catalan points of sale are SELAE's: no Gordo or second prize, nine towns for the third, six for the fourths", () => {
  const sold = RESULTS_2025.soldInCatalonia;
  assert.deepEqual(sold.first, []);
  assert.deepEqual(sold.second, []);
  assert.deepEqual(
    sold.third?.map((s) => s.town),
    ["Barcelona", "el Prat de Llobregat", "Monistrol de Montserrat", "Sant Boi de Llobregat", "Terrassa", "Cadaqués", "Girona", "Sant Joan de les Abadesses", "Vielha e Mijaran"],
  );
  assert.deepEqual(sold.fourth?.map((s) => s.town), ["Arenys de Mar", "Badalona", "Barcelona", "Sant Boi de Llobregat", "Olot", "Sort"]);
  assert.deepEqual(topNumbers(RESULTS_2025), ["79432", "70048", "90693", "25508", "78477", "18669", "23112", "25412", "41716", "60649", "61366", "77715", "94273"]);
  assert.equal(townsLine(sold.third!.slice(0, 2), "ca"), "Barcelona i el Prat de Llobregat (Barcelona)");
  assert.equal(townsLine([{ town: "Olot", province: "Girona" }, { town: "Sort", province: "Lleida" }], "en"), "Olot (Girona province); Sort (Lleida province)");
  const words: Record<Locale, RegExp[]> = {
    ca: [/ni el Gordo \(79432\) ni el segon premi \(70048\) es van vendre a Catalunya/, /Sant Joan de les Abadesses/, /Vielha e Mijaran \(Lleida\)/, /53,55 € per habitant/, /73,00 €/, /108,44 €/, /1938/],
    es: [/ni el Gordo \(79432\) ni el segundo premio \(70048\) se vendieron en Cataluña/, /Sant Joan de les Abadesses/, /Vielha e Mijaran \(Lleida\)/, /53,55 € por habitante/, /73,00 €/, /108,44 €/, /1938/],
    en: [/neither El Gordo \(79432\) nor the second prize \(70048\) was sold in Catalonia/, /Sant Joan de les Abadesses/, /Vielha e Mijaran \(Lleida province\)/, /€53\.55 per inhabitant/, /€73\.00/, /€108\.44/, /1938/],
  };
  for (const locale of LOCALES) {
    if (RESULTS_2026) break;
    const all = body(locale);
    for (const pattern of words[locale]) assert.match(all, pattern, `${locale}: ${pattern}`);
    for (const url of [NADAL_URLS.first2025, NADAL_URLS.second2025, NADAL_URLS.third2025, NADAL_URLS.fourth2025, NADAL_URLS.dossier2025]) {
      assert.ok(json(locale).includes(`](${url})`), `${locale}: no link to ${url}`);
    }
  }
});

test("SELAE's per-prize pages follow one address pattern (the 2025 ones were read on 31 Oct 2026)", () => {
  assert.equal(
    prizePageUrl("primer", 2025),
    "https://www.loteriasyapuestas.es/es/premios/primer-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-2025",
  );
  assert.equal(NADAL_URLS.third2025, prizePageUrl("tercer", 2025));
  // No 2026 per-prize page is linked before the results are in: it does not exist yet.
  for (const locale of LOCALES) assert.ok(!json(locale).includes("22-de-diciembre-de-2026"), locale);
});

/* -------------------------------------------------------------------------- */
/* FAQ and dates                                                              */
/* -------------------------------------------------------------------------- */

test("the FAQ asks in the searched words and answers in plain text", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Quan és el sorteig de la loteria de Nadal 2026?", "On ha tocat la loteria de Nadal a Catalunya?", "Quin és el número del Gordo de la loteria de Nadal 2026?", "On es cobren els premis de la loteria de Nadal?", "Fins quan es pot cobrar la loteria de Nadal?"],
    es: ["¿Cuándo es el sorteo de la Lotería de Navidad 2026?", "¿Dónde ha tocado el Gordo en Cataluña?", "¿Cuál es el número del Gordo de la Lotería de Navidad 2026?", "¿Dónde se cobran los premios de la Lotería de Navidad?", "¿Hasta cuándo se puede cobrar la Lotería de Navidad?"],
    en: ["When is the Spanish Christmas Lottery draw in 2026?", "Where did El Gordo fall in Catalonia?", "What is the 2026 El Gordo number?", "Where do I collect a Christmas Lottery prize?", "How long do I have to claim a Christmas Lottery prize?"],
  };
  for (const locale of LOCALES) {
    for (const blocks of [LOTERIA_NADAL.editions[locale].blocks, buildNadalBody(locale, FAKE)]) {
      const block = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
      assert.ok(block, locale);
      const asked = block.items.map((item) => item.question);
      for (const question of questions[locale]) assert.ok(asked.includes(question), `${locale}: missing "${question}"`);
      for (const item of block.items) assert.doesNotMatch(item.answer, /\*\*|\]\(/, `${locale}: markdown in "${item.question}"`);
    }
  }
});

test("every weekday printed next to a date matches that date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  };
  let checked = 0;
  for (const locale of LOCALES) {
    for (const plain of [body(locale), text(buildNadalBody(locale, FAKE, FAKE_TIME))]) {
      const all = plain.toLowerCase();
      const pattern = new RegExp(`(${weekdays[locale].join("|")}),? (\\d{1,2}) (?:d'|de )?(${months[locale].join("|")})`, "gu");
      for (const match of all.matchAll(pattern)) {
        const month = months[locale].indexOf(match[3]!) + 1;
        const iso = `${month === 1 ? 2027 : 2026}-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
        checked += 1;
      }
    }
  }
  assert.ok(checked >= 12, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* What must never be printed                                                 */
/* -------------------------------------------------------------------------- */

test("no 2026 draw time while none is announced: every clock time is 2025's or the 23:45 online close", () => {
  if (DRAW_TIME_2026) return;
  for (const locale of LOCALES) {
    for (const piece of sentences(body(locale))) {
      for (const match of piece.matchAll(/\b(\d{1,2}):(\d{2})\b/g)) {
        const time = match[0];
        if (time === "23:45") {
          assert.match(piece, /21 de desembre|21 de diciembre|21 December/, `${locale}: 23:45 without its day in "${piece}"`);
          continue;
        }
        assert.match(piece, /2025/, `${locale}: ${time} without its year in "${piece}"`);
      }
    }
  }
});

test("press-only, outdated and computed claims are never printed", () => {
  for (const locale of LOCALES) {
    for (const plain of [body(locale), text(buildNadalBody(locale, FAKE, FAKE_TIME))]) {
      // The 2026 deadline is the rule (three months), never a computed date.
      assert.doesNotMatch(plain, /(22|23) (de març|de marzo|March) (de )?2027/i, locale);
      // SELAE's evergreen page still says 195 series of 85,000: not this year's.
      assert.doesNotMatch(plain, /\b195 (sèries|series)\b|85\.000 (bitllets|billetes)|85,000 tickets/i, locale);
      // No shop names, no press tallies.
      assert.doesNotMatch(plain, /Bruja de Oro|Bruixa d'Or|Doña Manolita|12,5 milions|12,5 millones|12\.5 million/i, locale);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The results slot                                                           */
/* -------------------------------------------------------------------------- */

test("the results slot is empty or publishable, and resultsProblems refuses bad input", () => {
  if (RESULTS_2026) assert.deepEqual(resultsProblems(RESULTS_2026), [], "RESULTS_2026 cannot be published as it is");
  assert.deepEqual(resultsProblems(FAKE), []);
  const bad = (patch: Partial<NadalResults>) => resultsProblems({ ...FAKE, ...patch });
  assert.ok(bad({ first: "4567" }).some((p) => /five digits/.test(p)), "four digits");
  assert.ok(bad({ first: "456780" }).some((p) => /five digits/.test(p)), "six digits");
  assert.ok(bad({ second: "51230" }).some((p) => /twice/.test(p)), "a repeat");
  assert.ok(bad({ fifth: FAKE.fifth.slice(0, 7) }).some((p) => /8 fifth/.test(p)), "seven fifth prizes");
  assert.ok(bad({ fourth: ["08802"] }).some((p) => /2 fourth/.test(p)), "one fourth prize");
  assert.ok(bad({ ...RESULTS_2025, source: FAKE.source }).some((p) => /2025/.test(p)), "last year's numbers");
  assert.ok(bad({ first: RESULTS_2025.first }).some((p) => /2025/.test(p)), "last year's Gordo");
  assert.ok(bad({ source: { name: "x", url: "https://www.example.com/loteria", publisher: "x" } }).some((p) => /not an official source/.test(p)));
  assert.ok(bad({ source: { name: "x", url: "http://www.loteriasyapuestas.es/es/loteria-nacional", publisher: "x" } }).some((p) => /https/.test(p)));
  assert.ok(bad({ source: { name: "x", url: "https://www.rtve.es/loterias/", publisher: "RTVE" } }).some((p) => /not an official source/.test(p)), "the broadcaster is not a results source");
  const sold = (patch: Partial<NadalResults["soldInCatalonia"]>) => bad({ soldInCatalonia: { ...FAKE.soldInCatalonia, ...patch } });
  assert.ok(sold({ first: [{ town: " Tremp", province: "Lleida" }] }).some((p) => /stray spaces/.test(p)));
  assert.ok(sold({ first: [{ town: "Tremp", province: "Lleida" }, { town: "Tremp", province: "Lleida" }] }).some((p) => /twice/.test(p)));
  assert.ok(sold({ first: [{ town: "Madrid", province: "Madrid" as never }] }).some((p) => /not a Catalan province/.test(p)));
});

test("drawTimeProblems accepts a 24-hour time from SELAE or RTVE and nothing else", () => {
  assert.deepEqual(drawTimeProblems(FAKE_TIME), []);
  assert.deepEqual(drawTimeProblems({ ...FAKE_TIME, source: { name: "x", url: "https://www.rtve.es/rtve/2026/x.shtml", publisher: "RTVE" } }), []);
  assert.ok(drawTimeProblems({ ...FAKE_TIME, time: "8.30" }).length > 0);
  assert.ok(drawTimeProblems({ ...FAKE_TIME, time: "25:00" }).length > 0);
  assert.ok(drawTimeProblems({ ...FAKE_TIME, source: { name: "x", url: "https://www.elperiodico.com/x", publisher: "x" } }).length > 0);
  assert.ok(TIME_HOSTS.includes("www.rtve.es"));
  if (DRAW_TIME_2026) assert.deepEqual(drawTimeProblems(DRAW_TIME_2026), []);
});

test("filling the slot switches the lead, the key facts, the results table, the Catalan lines, the FAQ and the sources", () => {
  const filled = buildNadalArticle(FAKE, null, "2026-12-22");
  const leadWords: Record<Locale, RegExp> = {
    ca: /^El 45678 és el Gordo de la loteria de Nadal 2026: 400\.000 € per dècim de 20 €/,
    es: /^El 45678 es el Gordo de la Lotería de Navidad 2026: 400\.000 € por décimo de 20 €/,
    en: /^45678 is El Gordo of the 2026 Spanish Christmas Lottery: €400,000 per €20 décimo/,
  };
  const lines: Record<Locale, RegExp[]> = {
    ca: [/El Gordo \(45678\): Tremp \(Lleida\); Reus \(Tarragona\)\./, /El segon premi \(00417\): SELAE no hi llista cap punt de venda a Catalunya\./, /El tercer premi \(51230\): SELAE encara no ha publicat on s'ha venut\./, /Els quarts premis \(08802 i 63145\): l'Hospitalet de Llobregat \(Barcelona\)\./],
    es: [/El Gordo \(45678\): Tremp \(Lleida\); Reus \(Tarragona\)\./, /El segundo premio \(00417\): SELAE no lista ningún punto de venta en Cataluña\./, /El tercer premio \(51230\): SELAE aún no ha publicado dónde se ha vendido\./, /Los cuartos premios \(08802 y 63145\): l'Hospitalet de Llobregat \(Barcelona\)\./],
    en: [/El Gordo \(45678\): Tremp \(Lleida province\); Reus \(Tarragona province\)\./, /The second prize \(00417\): SELAE lists no point of sale in Catalonia\./, /The third prize \(51230\): SELAE has not yet published where it was sold\./, /The fourth prizes \(08802 and 63145\): l'Hospitalet de Llobregat \(Barcelona province\)\./],
  };
  for (const locale of LOCALES) {
    const blocks = filled.editions[locale].blocks;
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    const leadText = text(blocks.slice(0, 1));
    assert.match(leadText, leadWords[locale], locale);
    for (const number of topNumbers(FAKE)) assert.ok(leadText.includes(number), `${locale}: ${number} not in the lead`);
    assert.doesNotMatch(leadText, /encara no|aún no|not been announced/, locale);
    // Key facts open with El Gordo.
    const facts = blocks[1] as { items: { label: string; value: string }[] };
    assert.match(facts.items[0]?.value ?? "", /^45678/, locale);
    // The results table: thirteen rows in prize order.
    const tables = blocks.filter((b) => b.type === "table") as { rows: string[][] }[];
    const results = tables.find((t) => t.rows.length === 13);
    assert.ok(results, `${locale}: no results table`);
    assert.deepEqual(results.rows.map((row) => row[1]), topNumbers(FAKE).map((n) => `**${n}**`));
    assert.equal(results.rows[0]?.[2], locale === "en" ? "€400,000" : "400.000 €");
    assert.equal(results.rows[12]?.[2], locale === "en" ? "€6,000" : "6.000 €");
    const plain = text(blocks);
    // Neighbours, hundred and endings of El Gordo, computed.
    assert.match(plain, /45677 (i el|y el|and) 45679/, locale);
    assert.match(plain, /45600 (al|to) 45699/, locale);
    // The Catalan lines, one per prize, with each state.
    for (const pattern of lines[locale]) assert.match(plain, pattern, `${locale}: ${pattern}`);
    // The pending lines and the 2025 reference are gone.
    assert.doesNotMatch(plain, /aquí hi posarem|aquí pondremos|We will add|will be listed here/, locale);
    assert.doesNotMatch(plain, /79432/, locale);
    assert.doesNotMatch(plain, /encara no s'ha anunciat|aún no se ha anunciado|not been announced|Encara no anunciada|Aún no anunciada|Not announced yet/, locale);
    assert.match(plain, /El sorteig es va fer el dimarts 22 de desembre de 2026|El sorteo se celebró el martes 22 de diciembre de 2026|The draw took place on Tuesday 22 December 2026/, locale);
    // The FAQ answers with the numbers and the towns.
    const faqBlock = blocks.find((b) => b.type === "faq") as { items: { answer: string }[] };
    assert.ok(faqBlock.items.some((item) => item.answer.includes("45678") && item.answer.includes("Tremp")), locale);
    assert.equal(filled.editions[locale].seoTitle, nadalSeoTitle(locale, FAKE));
    assert.equal(filled.editions[locale].seoDescription, nadalDescription(locale, FAKE));
  }
  const urls = filled.sources.map((s) => s.url);
  assert.ok(urls.includes(FAKE.source.url), "the results source joins the sources");
  assert.ok(urls.includes(prizePageUrl("primer", 2026)) && urls.includes(prizePageUrl("segundo", 2026)) && urls.includes(prizePageUrl("cuarto", 2026)), "the per-prize pages read join");
  assert.ok(!urls.includes(prizePageUrl("tercer", 2026)), "a prize whose list is not out yet adds no source");
  assert.ok(nadalSources(FAKE, FAKE_TIME).some((s) => s.url === FAKE_TIME.source.url), "the time source joins the sources");
  assert.equal(filled.verifiedAt, "2026-12-22");
});

test("an announced start time replaces the 'not announced' lines everywhere", () => {
  for (const locale of LOCALES) {
    const plain = text(buildNadalBody(locale, null, FAKE_TIME));
    assert.doesNotMatch(plain, /encara no s'ha anunciat|aún no se ha anunciado|not been announced|Encara no anunciada|Aún no anunciada|Not announced yet|encara no n'ha anunciat|aún no ha anunciado|has not announced/, locale);
    assert.match(text(buildNadalBody(locale, null, FAKE_TIME).slice(0, 1)), /8:30/, locale);
  }
});

test("staleness: the page is stale from 23 December 2026 while the slot is empty, and from 24 December while the Catalan lists are", () => {
  assert.equal(isStale("2026-12-21", null), false);
  assert.equal(isStale("2026-12-22", null), false);
  assert.equal(isStale("2026-12-23", null), true);
  assert.equal(isStale("2026-12-23", FAKE), false);
  assert.equal(salesStale("2026-12-23", FAKE), false);
  assert.equal(salesStale("2026-12-24", FAKE), true, "the third prize's list is still null");
  assert.equal(salesStale("2026-12-24", { ...FAKE, soldInCatalonia: { ...FAKE.soldInCatalonia, third: [] } }), false);
  assert.equal(salesStale("2026-12-24", null), false);
});

test("the results are in after the draw (fill RESULTS_2026 and its Catalan lists, set NADAL_AS_OF, republish ?only=loteria-nadal)", () => {
  const today = madridDate(new Date());
  assert.ok(NADAL_AS_OF <= today, `NADAL_AS_OF (${NADAL_AS_OF}) is in the future`);
  assert.equal(
    isStale(today),
    false,
    `On ${today} the Christmas lottery has been drawn but RESULTS_2026 is still null. Fill it in src/lib/content/batch02/loteria-nadal.ts from SELAE (${NADAL_URLS.lnac}), set NADAL_AS_OF, and publish ?only=loteria-nadal.`,
  );
  assert.equal(
    salesStale(today),
    false,
    `On ${today} RESULTS_2026.soldInCatalonia still has a null for El Gordo, the second or the third prize. Fill it from SELAE's per-prize pages (${prizePageUrl("primer", 2026)}), [] when none is Catalan, and publish ?only=loteria-nadal.`,
  );
  if (RESULTS_2026) {
    assert.ok(NADAL_AS_OF >= NADAL_DRAW_DATE, `RESULTS_2026 is filled but NADAL_AS_OF (${NADAL_AS_OF}) is before the draw: move it to the day you filled it`);
  }
});

test("the page is deterministic: no clock in the module, same output on every call", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/loteria-nadal.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock");
  for (const locale of LOCALES) {
    assert.equal(JSON.stringify(buildNadalBody(locale)), json(locale), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* The publish route                                                          */
/* -------------------------------------------------------------------------- */

test("the publish route has a loteria-nadal group and a links group for the three pages that link here", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ LOTERIA_NADAL \} from "@\/lib\/content\/batch02\/loteria-nadal";/);
  assert.match(route, /wants\("loteria-nadal"\)\) published\.push\(await publishB2Article\(LOTERIA_NADAL\)\)/);
  assert.match(
    route,
    /wants\("loteria-nadal-links"\)\) \{\s*published\.push\(await publishB2Article\(GROSSA\), await publishB2Article\(NEW_YEAR\), await publishB2Article\(CHRISTMAS_BARCELONA\)\);/,
  );
});
