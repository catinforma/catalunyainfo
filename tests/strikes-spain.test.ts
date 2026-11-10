import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N } from "../src/lib/content/batch02/strike-11n.ts";
import { CITY_HERO } from "../src/lib/content/batch02/strike-11n-cities.ts";
import { STRIKE_11N_SPAIN } from "../src/lib/content/batch02/strike-11n-spain.ts";
import { STRIKES, STRIKES_GUIDE, madridDate } from "../src/lib/content/batch02/strikes.ts";
import {
  DESCRIPTION_LIMIT,
  RECENT_LIMIT,
  SEO_TITLE_LIMIT,
  STATUS_LABEL,
  STRIKES_SPAIN_AS_OF,
  STRIKES_SPAIN_GUIDE,
  STRIKES_SPAIN_MAX_AGE_DAYS,
  buildStrikesSpainBody,
  catalanOnlyStrikes,
  daysBetween,
  expiredOpenStrikes,
  isHubStale,
  isWeekOver,
  lastDay,
  listedSpainStrikes,
  recentSpainStrikes,
  spainDays,
  strikesOn,
  strikesSpainDescription,
  strikesSpainSeoTitle,
  strikesSpainSources,
  strikesSpainTitle,
  weekOf,
  weekRows,
} from "../src/lib/content/batch02/strikes-spain.ts";
import {
  SPAIN_FRAMEWORK_SOURCES,
  SPAIN_NOT_HAPPENING,
  SPAIN_OPEN_STRIKES,
  SPAIN_STRIKES,
  SPAIN_URLS,
  STRIKES_SPAIN_VERIFIED,
} from "../src/lib/content/batch02/strikes-spain-data.ts";
import type { L, SpainStrike } from "../src/lib/content/batch02/strikes-spain-model.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { NEWS_CYCLE_ENTRY_KEYS } from "../src/lib/seo/news-cycle.ts";

/**
 * "Huelgas en España" (10 Nov 2026): the Spain-wide strikes calendar, one
 * evergreen URL in three languages, rendered from strikes-spain-data.ts.
 *
 * Pins the structure and SEO (three native editions, the searched words and
 * the month in the title), the sourcing discipline (organisers and official
 * sources only, every external link a listed source, "confirmed" only with a
 * registered call or an official order), the date logic (the week, the
 * calendar and "recent" from STRIKES_SPAIN_AS_OF only, no "tomorrow"), the
 * agreement with the Catalan hub, the cross-links and the publish groups.
 *
 * Four tests read the clock, on purpose, and start failing by themselves:
 *  - 4 days after STRIKES_SPAIN_AS_OF (the sources were not re-read);
 *  - on the Monday after its week (the "this week" table is last week's);
 *  - the day after an airport strike's cited resolution ends (msValidUntil);
 *  - if STRIKES_SPAIN_AS_OF is ever set in the future.
 * The fix is always in strikes-spain-data.ts, then `?only=huelgas-espana`.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const edition = (locale: Locale) => STRIKES_SPAIN_GUIDE.editions[locale];
const json = (locale: Locale) => JSON.stringify(edition(locale).blocks);
const body = (locale: Locale) => text(edition(locale).blocks);
const internalHrefs = (source: string) => [...source.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
const externalHrefs = (source: string) => [...source.matchAll(/\]\((https?:[^)]*)\)/g)].map((m) => m[1] ?? "");

/** The one Spanish-only page the Spanish edition may link: the 11N strike in the rest of Spain. */
const SPANISH_ONLY = `/es/${STRIKE_11N_SPAIN.editions.es.path}/`;
const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  SPANISH_ONLY,
]);

/** News sites: facts are read on the organisers' and the official pages, never on these. */
const PRESS_HOSTS =
  /(^|\.)(elpais|elmundo|abc|larazon|lavanguardia|elperiodico|eldiario|elconfidencial|publico|20minutos|europapress|efe|rtve|cadenaser|ondacero|cope|antena3|telecinco|lasexta|huffingtonpost|que|cronista|elespanol|vozpopuli|libertaddigital|niusdiario|newtral|ara|naciodigital|elnacional|lavozdegalicia|heraldo|diariodesevilla|ideal|lasprovincias|levante-emv|elcorreo|diariovasco|lne|elcomercio|eldebate|okdiario|infobae|bolsamania|expansion|cincodias|eleconomista|hosteltur|alicanteplaza|ondavasca|democrata|diaridetarragona|diariodeleon|vivirediciones)\.(es|com|cat|net|info)$/;

/** Hosts whose pages are an official record: the state gazette and the Ministry of Transport. */
const OFFICIAL_HOSTS = /(^|\.)(boe\.es|transportes\.gob\.es)$/;

const texts = (value: L | undefined) => (value ? LOCALES.map((locale) => value[locale]) : []);
const strikeTexts = (strike: SpainStrike) => [strike.scope, strike.hours, strike.calledBy, strike.basis, strike.minimumServices.text].flatMap(texts);

const strike = (id: string): SpainStrike => {
  const found = SPAIN_STRIKES.find((s) => s.id === id);
  assert.ok(found, id);
  return found;
};

/** The list block under the H3 of one strike. */
function detailItems(blocks: Block[], id: string): string[] {
  const index = blocks.findIndex((block) => block.type === "heading" && (block as { id?: string }).id === id);
  assert.ok(index >= 0, `no section ${id}`);
  const next = blocks[index + 1] as { type: string; items?: string[] };
  assert.equal(next.type, "list", id);
  return next.items ?? [];
}

const tables = (blocks: Block[]) => blocks.filter((block) => block.type === "table") as unknown as { caption?: string; headers: string[]; rows: string[][] }[];

/** A made-up strike, to test the wording without depending on today's list. */
const sample = (over: Partial<SpainStrike>): SpainStrike => ({
  ...strike("huelga-ferroviaria-2026-11-17"),
  id: "huelga-prueba",
  catalanEntry: undefined,
  guides: undefined,
  ...over,
});

/* -------------------------------------------------------------------------- */
/* Structure, SEO, photo                                                      */
/* -------------------------------------------------------------------------- */

test("three native editions at the registered paths, valid and substantial", () => {
  assert.deepEqual(Object.keys(STRIKES_SPAIN_GUIDE.editions).sort(), ["ca", "en", "es"]);
  assert.equal(edition("es").path, "guias/huelgas-espana");
  assert.equal(edition("ca").path, "guies/vagues-espanya");
  assert.equal(edition("en").path, "guides/strikes-spain");
  for (const locale of LOCALES) {
    assert.equal(edition(locale).path, B2_PATHS.strikesSpain[locale], locale);
    assert.ok(!/\d{4}/.test(edition(locale).path), "no year in the path: the URL serves every strike");
    const parsed = bodySchema.safeParse(edition(locale).blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > 800, `${locale} thin: ${wordCount(body(locale))} words`);
    assert.ok(edition(locale).excerpt.length > 30 && edition(locale).excerpt.length <= 200, locale);
    assert.ok(!/\{checked\}|undefined|\[object/.test(json(locale)), `${locale}: an unfilled placeholder`);
  }
  assert.equal(STRIKES_SPAIN_GUIDE.key, "strikesSpain");
  assert.equal(STRIKES_SPAIN_GUIDE.entryKey, "guide-strikes-spain");
  assert.ok(NEWS_CYCLE_ENTRY_KEYS.has(STRIKES_SPAIN_GUIDE.entryKey), "marked up as NewsArticle, like the other strike pages");
  assert.equal(STRIKES_SPAIN_GUIDE.verifiedAt, STRIKES_SPAIN_VERIFIED);
  assert.equal(STRIKES_SPAIN_VERIFIED, STRIKES_SPAIN_AS_OF);
});

test("the three editions have the same shape: same block types in the same order, same sections, same table sizes", () => {
  const shape = (locale: Locale) => edition(locale).blocks.map((block) => block.type);
  assert.deepEqual(shape("ca"), shape("es"));
  assert.deepEqual(shape("en"), shape("es"));
  const sizes = (locale: Locale) => tables(edition(locale).blocks).map((table) => [table.headers.length, table.rows.length]);
  assert.deepEqual(sizes("ca"), sizes("es"));
  assert.deepEqual(sizes("en"), sizes("es"));
  for (const locale of LOCALES) {
    const h2 = edition(locale).blocks.filter((block) => block.type === "heading" && (block as { level: number }).level === 2);
    assert.ok(h2.length >= 3, `${locale}: the read-next box needs three H2s`);
    const ids = edition(locale).blocks.flatMap((block) => (block.type === "heading" && (block as { id?: string }).id ? [(block as { id?: string }).id] : []));
    assert.equal(new Set(ids).size, ids.length, `${locale}: an anchor twice`);
  }
});

test("each path is registered once and collides with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === B2_PATHS.strikesSpain[locale]).length, 1, locale);
  }
});

test("title and description: within the limits on any date, with the searched words and the month", () => {
  const starts: Record<Locale, RegExp> = { ca: /^Vagues a Espanya/, es: /^Huelgas en España/, en: /^Strikes in Spain/ };
  for (const locale of LOCALES) {
    assert.equal(edition(locale).title, strikesSpainTitle(locale));
    assert.equal(edition(locale).seoTitle, strikesSpainSeoTitle(locale));
    assert.equal(edition(locale).seoDescription, strikesSpainDescription(locale));
    for (const asOf of [STRIKES_SPAIN_AS_OF, "2026-11-11", "2026-11-16", "2026-12-07", "2027-01-01", "2027-09-25", "2027-02-27"]) {
      const title = strikesSpainSeoTitle(locale, asOf);
      assert.ok(title.length <= SEO_TITLE_LIMIT, `${locale} ${asOf}: ${title.length} "${title}"`);
      assert.match(title, starts[locale], title);
      assert.ok(title.includes(asOf.slice(0, 4)), title);
      const description = strikesSpainDescription(locale, asOf);
      assert.ok(description.length > 60 && description.length <= DESCRIPTION_LIMIT, `${locale} ${asOf}: ${description.length} ${description}`);
      assert.match(description, starts[locale], description);
      // With no strike at all the description still says what the page is.
      const empty = strikesSpainDescription(locale, asOf, []);
      assert.ok(empty.length > 60 && empty.length <= DESCRIPTION_LIMIT, `${locale} ${asOf} (empty): ${empty.length}`);
    }
  }
  assert.equal(strikesSpainSeoTitle("es", "2026-11-10"), "Huelgas en España hoy y esta semana: noviembre 2026");
  assert.equal(strikesSpainSeoTitle("ca", "2026-11-10"), "Vagues a Espanya avui i aquesta setmana: novembre 2026");
  assert.equal(strikesSpainSeoTitle("en", "2026-11-10"), "Strikes in Spain today and this week: November 2026");
  // A long month drops "hoy" before it breaks the limit.
  assert.ok(strikesSpainSeoTitle("es", "2027-09-25").includes("septiembre 2027"));
});

test("photo: the 11N city pages' Commons file, with their exact alt text and caption in each language", () => {
  const image = IMAGE_BY_KEY.get(CITY_HERO.key);
  assert.ok(image, "not in the image manifest");
  assert.match(image.license ?? "", /^CC (BY|BY-SA|0)|^PD|GFDL/);
  assert.equal(STRIKES_SPAIN_GUIDE.heroKey, CITY_HERO.key);
  assert.deepEqual(STRIKES_SPAIN_GUIDE.heroAlt, CITY_HERO.alt);
  assert.deepEqual(STRIKES_SPAIN_GUIDE.heroCaption, CITY_HERO.caption);
  for (const locale of LOCALES) assert.ok(!edition(locale).blocks.some((b) => b.type === "image" || b.type === "gallery"), locale);
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

test("internal links stay in the reader's language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    const hrefs = internalHrefs(json(locale));
    assert.ok(hrefs.length >= 4, locale);
    for (const href of hrefs) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale} edition links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${href} is not a published path`);
      assert.notEqual(href, b2href("strikesSpain", locale), "links to itself");
    }
    for (const key of ["strike11n", "strikes", "strikeRenfe", "strikeEducation"] as const) {
      assert.ok(hrefs.includes(b2href(key, locale)), `${locale}: no link to ${key}`);
    }
    // The Spanish-only 11N page is linked from the Spanish edition and from no other.
    assert.equal(hrefs.includes(SPANISH_ONLY), locale === "es" && listedSpainStrikes().some((s) => s.id === "huelga-general-2026-11-11"), locale);
  }
});

test("external links are https and every one is a listed source; no press, no tracking, the law from the BOE", () => {
  const urls = STRIKES_SPAIN_GUIDE.sources.map((s) => s.url);
  assert.deepEqual(urls, strikesSpainSources().map((s) => s.url));
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  for (const source of STRIKES_SPAIN_GUIDE.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.ok(!/tauler\.seu-e\.cat\/detall/.test(source.url), `${source.url}: an e-Tauler notice expires`);
    assert.ok(!PRESS_HOSTS.test(new URL(source.url).host), `${source.url}: press, not an organiser or an official source`);
    assert.ok(source.name.trim().length > 10, source.url);
    assert.ok((source.publisher ?? "").trim().length > 1, `${source.url}: no publisher`);
  }
  for (const locale of LOCALES) {
    const linked = externalHrefs(json(locale));
    assert.ok(linked.length > 15, locale);
    for (const href of linked) {
      assert.match(href, /^https:\/\//, href);
      assert.ok(urls.includes(href), `${locale}: ${href} is linked but not in the sources`);
    }
  }
  // The same official links in every language.
  assert.deepEqual([...new Set(externalHrefs(json("ca")))].sort(), [...new Set(externalHrefs(json("es")))].sort());
  assert.deepEqual([...new Set(externalHrefs(json("en")))].sort(), [...new Set(externalHrefs(json("es")))].sort());
  for (const url of [SPAIN_URLS.constitution, SPAIN_URLS.rdl17]) {
    assert.match(url, /^https:\/\/www\.boe\.es\//);
    assert.ok(urls.includes(url), url);
    assert.ok(SPAIN_FRAMEWORK_SOURCES.some((s) => s.url === url), url);
  }
});

/* -------------------------------------------------------------------------- */
/* Data discipline                                                            */
/* -------------------------------------------------------------------------- */

test("every strike: ISO days in order, three languages, the notices it cites listed as its sources, no press", () => {
  const ids = new Set<string>();
  for (const s of SPAIN_STRIKES) {
    assert.ok(!ids.has(s.id), `${s.id} twice`);
    ids.add(s.id);
    assert.match(s.id, /^[a-z0-9-]+$/, s.id);
    assert.ok(s.dates.length > 0, s.id);
    for (const iso of s.dates) assert.match(iso, /^\d{4}-\d{2}-\d{2}$/, s.id);
    assert.deepEqual([...s.dates].sort(), s.dates, `${s.id}: days out of order`);
    assert.equal(new Set(s.dates).size, s.dates.length, `${s.id}: a day twice`);
    for (const value of [s.title, s.label, s.scope, s.calledBy, s.basis, s.minimumServices.short, s.minimumServices.text, ...(s.hours ? [s.hours] : [])]) {
      for (const locale of LOCALES) assert.ok(value[locale] && value[locale].trim() === value[locale] && value[locale].length > 3, `${s.id}/${locale}: empty text`);
    }
    for (const locale of LOCALES) {
      assert.ok(!/\]\(/.test(s.minimumServices.short[locale] + s.title[locale] + s.label[locale]), `${s.id}/${locale}: no links in table cells`);
      assert.ok(s.minimumServices.short[locale].length <= 90, `${s.id}/${locale}: the table line is too long`);
    }
    assert.ok(s.sources.length > 0, s.id);
    const own = s.sources.map((src) => src.url);
    for (const piece of strikeTexts(s)) {
      for (const href of externalHrefs(piece)) assert.ok(own.includes(href), `${s.id}: ${href} is cited but not in its sources`);
      assert.equal(internalHrefs(piece).length, 0, `${s.id}: internal links go in guides, by key`);
    }
    // Who calls it is read on a linked notice or on the linked order.
    for (const locale of LOCALES) assert.ok(externalHrefs(s.calledBy[locale] + s.basis[locale] + s.minimumServices.text[locale]).length > 0, `${s.id}/${locale}: nothing linked`);
    for (const src of s.sources) assert.ok(!PRESS_HOSTS.test(new URL(src.url).host), `${s.id}: ${src.url} is press`);
  }
  for (const item of [...SPAIN_OPEN_STRIKES, ...SPAIN_NOT_HAPPENING]) {
    assert.ok(!ids.has(item.id), `${item.id} twice`);
    ids.add(item.id);
    const own = item.sources.map((src) => src.url);
    assert.ok(own.length > 0, item.id);
    for (const locale of LOCALES) {
      assert.ok(item.title[locale].length > 3 && item.text[locale].length > 20, `${item.id}/${locale}`);
      const linked = externalHrefs(item.text[locale]);
      assert.ok(linked.length > 0, `${item.id}/${locale}: nothing linked`);
      for (const href of linked) assert.ok(own.includes(href), `${item.id}: ${href} is cited but not in its sources`);
    }
    for (const src of item.sources) assert.ok(!PRESS_HOSTS.test(new URL(src.url).host), `${item.id}: ${src.url} is press`);
  }
});

test("'confirmed' only with an official record: a BOE or Ministry of Transport source, linked in the status or minimum-services line", () => {
  for (const s of SPAIN_STRIKES) {
    const official = s.sources.filter((src) => OFFICIAL_HOSTS.test(new URL(src.url).host)).map((src) => src.url);
    if (s.status === "official") {
      assert.ok(official.length > 0, `${s.id}: "official" without a BOE or Ministry source`);
      assert.equal(s.minimumServices.status, "published", `${s.id}: an official strike cites its published minimum services`);
      for (const locale of LOCALES) {
        const linked = externalHrefs(s.basis[locale] + s.minimumServices.text[locale]);
        assert.ok(linked.some((href) => official.includes(href)), `${s.id}/${locale}: the official record is not linked`);
      }
    } else {
      assert.notEqual(s.minimumServices.status, "published", `${s.id}: minimum services are published, so the strike is "official"`);
    }
  }
});

test("a called strike is never printed as confirmed: status cell, status line, and no figure while minimum services are pending", () => {
  for (const locale of LOCALES) {
    const blocks = edition(locale).blocks;
    const confirmedCell = STATUS_LABEL.official[locale];
    const calledCell = STATUS_LABEL.called[locale];
    assert.notEqual(confirmedCell, calledCell);
    for (const s of listedSpainStrikes()) {
      const title = s.title[locale].charAt(0).toUpperCase() + s.title[locale].slice(1);
      const rows = tables(blocks).flatMap((table) => table.rows.filter((row) => row[1] === title));
      assert.ok(rows.length > 0, `${locale}: ${s.id} is in no table`);
      for (const row of rows) assert.equal(row[2], s.status === "official" ? confirmedCell : calledCell, `${locale}: ${s.id}`);
      const items = detailItems(blocks, s.id);
      const line = new RegExp(`^\\*\\*[^*]+:\\*\\* ${(s.status === "official" ? confirmedCell : calledCell).toLowerCase()}\\. `);
      const status = items.filter((item) => line.test(item));
      assert.equal(status.length, 1, `${locale}: ${s.id} has no status line`);
      if (s.status === "called") assert.doesNotMatch(status[0] ?? "", /confirmad|confirmed/i, `${locale}: ${s.id}`);
    }
  }
  for (const s of SPAIN_STRIKES) {
    if (s.minimumServices.status === "published") continue;
    for (const piece of [...texts(s.minimumServices.short), ...texts(s.minimumServices.text)]) assert.doesNotMatch(piece, /\d\s?%/, `${s.id}: a figure nobody published`);
    if (s.minimumServices.status === "pending") {
      for (const locale of LOCALES) {
        assert.match(s.minimumServices.short[locale], /confirmar|confirmed/i, `${s.id}/${locale}: say "to be confirmed"`);
        assert.match(s.minimumServices.text[locale], /^(Por confirmar|Per confirmar|To be confirmed)\./, `${s.id}/${locale}`);
      }
    }
  }
  // A made-up called strike with pending minimum services, in every language.
  const made = sample({ dates: [STRIKES_SPAIN_AS_OF], status: "called" });
  for (const locale of LOCALES) {
    const rows = weekRows(locale, STRIKES_SPAIN_AS_OF, [made]);
    const row = rows.find((r) => r[2] !== "—");
    assert.ok(row, locale);
    assert.equal(row[2], STATUS_LABEL.called[locale]);
    assert.match(row[3] ?? "", /confirmar|confirmed/i);
  }
});

/* -------------------------------------------------------------------------- */
/* Date logic: the as-of constant only                                        */
/* -------------------------------------------------------------------------- */

test("the week runs Monday to Sunday and the table has every day of it, strike or not", () => {
  assert.deepEqual(weekOf("2026-11-10"), { from: "2026-11-09", to: "2026-11-15", days: ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"] });
  assert.equal(weekOf("2026-11-09").from, "2026-11-09");
  assert.equal(weekOf("2026-11-15").from, "2026-11-09");
  assert.equal(weekOf("2026-11-16").from, "2026-11-16");
  assert.equal(weekOf("2026-12-31").to, "2027-01-03");
  const a = sample({ id: "a", dates: ["2026-11-10", "2026-11-12"] });
  const b = sample({ id: "b", dates: ["2026-11-10"], status: "official" });
  for (const locale of LOCALES) {
    const rows = weekRows(locale, "2026-11-11", [a, b]);
    // Tuesday twice (two strikes), Thursday once, the other five days once each with no strike.
    assert.equal(rows.length, 8, locale);
    assert.equal(rows.filter((row) => row[2] === "—").length, 5, locale);
    assert.equal(new Set(rows.map((row) => row[0])).size, 7, locale);
    for (const row of rows) assert.equal(row.length, 4);
  }
  assert.deepEqual(strikesOn("2026-11-10", [a, b]).map((s) => s.id).sort(), ["a", "b"]);
  assert.deepEqual(strikesOn("2026-11-11", [a, b]), []);
});

test("a strike stays in the calendar until its week ends, then moves to 'recent'; the page is the same all week", () => {
  const first = sample({ id: "first", dates: ["2026-11-09"] });
  const next = sample({ id: "next", dates: ["2026-11-17", "2026-11-19"] });
  for (const day of weekOf("2026-11-10").days) {
    assert.deepEqual(listedSpainStrikes(day, [next, first]).map((s) => s.id), ["first", "next"], day);
    assert.deepEqual(recentSpainStrikes(day, [next, first]), [], day);
  }
  assert.deepEqual(listedSpainStrikes("2026-11-16", [next, first]).map((s) => s.id), ["next"]);
  assert.deepEqual(recentSpainStrikes("2026-11-16", [next, first]).map((s) => s.id), ["first"]);
  assert.deepEqual(recentSpainStrikes("2026-11-23", [next, first]).map((s) => s.id), ["next", "first"], "latest first");
  const many = Array.from({ length: RECENT_LIMIT + 3 }, (_, i) => sample({ id: `old-${i}`, dates: [`2026-10-${String(i + 1).padStart(2, "0")}`] }));
  assert.equal(recentSpainStrikes("2026-11-10", many).length, RECENT_LIMIT);
  // Every strike in the data is printed exactly once: listed or recent.
  for (const day of [STRIKES_SPAIN_AS_OF, "2026-11-11", "2026-11-16", "2026-11-23"]) {
    const listed = listedSpainStrikes(day).map((s) => s.id);
    const recent = recentSpainStrikes(day).map((s) => s.id);
    assert.equal(listed.filter((id) => recent.includes(id)).length, 0, day);
    if (SPAIN_STRIKES.length - listed.length <= RECENT_LIMIT) assert.equal(listed.length + recent.length, SPAIN_STRIKES.length, day);
  }
  assert.equal(lastDay(next), "2026-11-19");
});

test("the page is valid on the strike day, the week after and with nothing called; it never says 'tomorrow' or 'yesterday'", () => {
  const relative = /\b(mañana|pasado mañana|ayer|anteayer|demà|ahir|tomorrow|yesterday)\b/i;
  for (const locale of LOCALES) {
    for (const asOf of [STRIKES_SPAIN_AS_OF, "2026-11-11", "2026-11-12", "2026-11-16", "2026-11-23", "2026-12-07"]) {
      const blocks = buildStrikesSpainBody(locale, asOf);
      const parsed = bodySchema.safeParse(blocks);
      assert.ok(parsed.success, `${locale} ${asOf}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      const plain = text(blocks);
      assert.doesNotMatch(plain, relative, `${locale} ${asOf}`);
      assert.ok(!/\{checked\}|undefined/.test(JSON.stringify(blocks)), `${locale} ${asOf}`);
      // Every strike with a day in that week is in the day-by-day table; every external link is a source of that day's page.
      const week = weekOf(asOf);
      const expected = SPAIN_STRIKES.reduce((sum, s) => sum + s.dates.filter((iso) => week.days.includes(iso)).length, 0);
      const table = tables(blocks)[0];
      assert.ok(table, `${locale} ${asOf}`);
      assert.equal(table.rows.filter((row) => row[2] !== "—").length, expected, `${locale} ${asOf}`);
      const urls = strikesSpainSources(asOf).map((s) => s.url);
      for (const href of externalHrefs(JSON.stringify(blocks))) assert.ok(urls.includes(href), `${locale} ${asOf}: ${href}`);
    }
    // Nothing called at all: the table still has its seven days and the page says so.
    const empty = buildStrikesSpainBody(locale, "2026-12-07", { strikes: [], open: [], notHappening: [], catalan: [] });
    assert.ok(bodySchema.safeParse(empty).success, locale);
    assert.equal(tables(empty).length, 1, locale);
    assert.equal(tables(empty)[0]?.rows.length, 7, locale);
  }
});

test("date wording: the month said once, ranges of three or more days, two months, in three languages", () => {
  assert.equal(spainDays(["2026-11-10", "2026-11-12"], "es"), "martes 10 y jueves 12 de noviembre de 2026");
  assert.equal(spainDays(["2026-11-10", "2026-11-12"], "ca"), "dimarts 10 i dijous 12 de novembre de 2026");
  assert.equal(spainDays(["2026-11-10", "2026-11-12"], "en"), "Tuesday 10 and Thursday 12 November 2026");
  assert.equal(spainDays(["2026-11-11"], "es"), "miércoles 11 de noviembre de 2026");
  assert.equal(spainDays(["2026-11-11"], "es", false), "miércoles 11 de noviembre");
  assert.equal(spainDays(["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"], "es"), "del 9 al 13 de noviembre de 2026");
  assert.equal(spainDays(["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"], "en"), "9 to 13 November 2026");
  assert.equal(spainDays(["2026-10-30", "2026-11-02"], "es"), "viernes 30 de octubre y lunes 2 de noviembre de 2026");
  assert.equal(spainDays(["2026-10-30", "2026-11-02"], "ca"), "divendres 30 d'octubre i dilluns 2 de novembre de 2026");
  assert.equal(spainDays(["2026-10-30", "2026-11-02"], "en"), "Friday 30 October and Monday 2 November 2026");
  assert.equal(daysBetween("2026-11-10", "2026-11-14"), 4);
  assert.equal(daysBetween("2026-10-24", "2026-10-26"), 2, "across the clock change");
});

test("'as of' lines carry the as-of date, and Catalan elides before 1 and 11 (\"L'11 de novembre\")", () => {
  const pending = sample({ dates: ["2026-11-17"] });
  const onDay = (locale: Locale, asOf: string) => text(buildStrikesSpainBody(locale, asOf, { strikes: [pending] }));
  assert.ok(onDay("es", "2026-11-10").includes("El 10 de noviembre de 2026"));
  assert.ok(onDay("es", "2026-11-11").includes("El 11 de noviembre de 2026"));
  assert.ok(onDay("en", "2026-11-11").includes("On 11 November 2026"));
  assert.ok(onDay("ca", "2026-11-10").includes("El 10 de novembre de 2026"));
  assert.ok(onDay("ca", "2026-11-11").includes("L'11 de novembre de 2026"));
  assert.ok(!/\bEl 11 de novembre/i.test(onDay("ca", "2026-11-11")));
  assert.ok(onDay("ca", "2026-12-01").includes("L'1 de desembre de 2026"));
});

/* -------------------------------------------------------------------------- */
/* Staleness: these read the clock                                            */
/* -------------------------------------------------------------------------- */

test("staleness helpers: 4 days after the as-of date, the Monday after its week, the day after a resolution ends", () => {
  assert.equal(STRIKES_SPAIN_MAX_AGE_DAYS, 4);
  assert.equal(isHubStale("2026-11-13", "2026-11-10"), false);
  assert.equal(isHubStale("2026-11-14", "2026-11-10"), true);
  assert.equal(isWeekOver("2026-11-15", "2026-11-10"), false);
  assert.equal(isWeekOver("2026-11-16", "2026-11-10"), true);
  const open = [{ ...SPAIN_OPEN_STRIKES[0]!, id: "x", msValidUntil: "2026-11-30" }];
  assert.deepEqual(expiredOpenStrikes("2026-11-30", open), []);
  assert.deepEqual(expiredOpenStrikes("2026-12-01", open).map((s) => s.id), ["x"]);
  for (const s of SPAIN_OPEN_STRIKES) assert.match(s.msValidUntil, /^\d{4}-\d{2}-\d{2}$/, s.id);
});

test("the Spain calendar was re-read in the last 4 days (re-check the sources, move STRIKES_SPAIN_AS_OF, publish ?only=huelgas-espana)", () => {
  const today = madridDate(new Date());
  assert.ok(STRIKES_SPAIN_AS_OF <= today, `STRIKES_SPAIN_AS_OF (${STRIKES_SPAIN_AS_OF}) is in the future`);
  assert.ok(
    !isHubStale(today),
    `On ${today} /es/guias/huelgas-espana/ was last checked on ${STRIKES_SPAIN_AS_OF}, more than ${STRIKES_SPAIN_MAX_AGE_DAYS - 1} days ago. Re-read every source in src/lib/content/batch02/strikes-spain-data.ts, move STRIKES_SPAIN_AS_OF and publish ?only=huelgas-espana.`,
  );
});

test("the 'this week' table is this week's (move STRIKES_SPAIN_AS_OF into the current week and publish ?only=huelgas-espana)", () => {
  const today = madridDate(new Date());
  const week = weekOf(STRIKES_SPAIN_AS_OF);
  assert.ok(
    !isWeekOver(today),
    `On ${today} the page still prints the week of ${week.from} to ${week.to} as "this week". Re-read the sources, move STRIKES_SPAIN_AS_OF in src/lib/content/batch02/strikes-spain-data.ts and publish ?only=huelgas-espana.`,
  );
});

test("no airport strike is listed past the last day of the resolution it cites (cite the new one or remove it, then publish ?only=huelgas-espana)", () => {
  const today = madridDate(new Date());
  const expired = expiredOpenStrikes(today);
  assert.deepEqual(
    expired.map((s) => s.id),
    [],
    `On ${today} these open-ended strikes cite a minimum-services resolution that ended: ${expired.map((s) => `${s.id} (${s.msValidUntil})`).join(", ")}. Read the Ministry of Transport's air list, cite the new resolution or remove the strike in src/lib/content/batch02/strikes-spain-data.ts.`,
  );
  // The as-of day itself must be inside every cited resolution.
  assert.deepEqual(expiredOpenStrikes(STRIKES_SPAIN_AS_OF), []);
});

/* -------------------------------------------------------------------------- */
/* Agreement with the Catalan hub and the other strike pages                  */
/* -------------------------------------------------------------------------- */

test("a strike that is also in the Catalan hub has the same days there", () => {
  const mirrored = SPAIN_STRIKES.filter((s) => s.catalanEntry);
  assert.ok(mirrored.length > 0);
  for (const s of mirrored) {
    const catalan = STRIKES.find((c) => c.id === s.catalanEntry);
    assert.ok(catalan, `${s.id}: ${s.catalanEntry} is not in strikes.ts`);
    assert.deepEqual(s.dates, catalan.dates, `${s.id} and ${catalan.id} disagree on the days`);
  }
  assert.equal(new Set(mirrored.map((s) => s.catalanEntry)).size, mirrored.length, "two entries mirror the same Catalan strike");
});

test("Catalonia: the section lists the Catalan hub's Catalonia-only strikes, not the shared ones, and links the hub", () => {
  const only = catalanOnlyStrikes();
  const mirrored = new Set(SPAIN_STRIKES.map((s) => s.catalanEntry));
  for (const s of only) assert.ok(!mirrored.has(s.id), s.id);
  for (const locale of LOCALES) {
    const plain = body(locale);
    for (const s of only) assert.ok(plain.includes(s.title[locale]), `${locale}: ${s.id} is missing`);
    assert.ok(internalHrefs(json(locale)).includes(b2href("strikes", locale)), locale);
    // With no Catalonia-only strike the section still links the hub.
    const none = buildStrikesSpainBody(locale, STRIKES_SPAIN_AS_OF, { catalan: [] });
    assert.ok(internalHrefs(JSON.stringify(none)).includes(b2href("strikes", locale)), locale);
  }
});

test("FAQ: today, trains, who sets minimum services, notice, pay and doctors; plain text, no links", () => {
  for (const locale of LOCALES) {
    const block = edition(locale).blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
    assert.ok(block, locale);
    assert.ok(block.items.length >= 5, locale);
    for (const item of block.items) {
      assert.ok(item.question.length > 10 && item.answer.length > 40, `${locale}: ${item.question}`);
      assert.ok(!/\]\(|\*\*/.test(item.answer), `${locale}: markup in "${item.question}"`);
    }
  }
  const es = (edition("es").blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
  assert.match(es[0]?.question ?? "", /huelgas? .*hoy/i);
  assert.ok(es.some((item) => /médicos/i.test(item.question)));
  assert.ok(es.some((item) => /tren|Renfe/i.test(item.question)));
});

test("the Catalan strikes hub links the calendar in each language; the 11N page in Spanish only", () => {
  for (const locale of LOCALES) {
    assert.ok(internalHrefs(JSON.stringify(STRIKES_GUIDE.editions[locale].blocks)).includes(b2href("strikesSpain", locale)), `strikes hub/${locale}`);
    assert.equal(internalHrefs(JSON.stringify(STRIKE_11N.editions[locale].blocks)).includes(b2href("strikesSpain", locale)), locale === "es", `11N/${locale}`);
  }
});

test("the publish route: huelgas-espana (three languages), huelgas-espana-links, and the strikes groups republish the calendar", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKES_SPAIN_GUIDE \} from "@\/lib\/content\/batch02\/strikes-spain";/);
  assert.match(route, /wants\("huelgas-espana"\)\) published\.push\(await publishB2Article\(STRIKES_SPAIN_GUIDE\)\);/);
  assert.match(route, /wants\("huelgas-espana-links"\)\) published\.push\(await publishB2Article\(STRIKES_GUIDE\), await publishB2Article\(STRIKE_11N\)\);/);
  assert.doesNotMatch(route, /publishB2SpanishArticle\(STRIKES_SPAIN_GUIDE\)/, "the calendar has three editions");
  const strikes = route.slice(route.indexOf('if (wants("strikes"))'), route.indexOf('if (wants("strike-renfe"))'));
  assert.match(strikes, /publishB2Article\(STRIKES_SPAIN_GUIDE\)/);
  assert.match(route, /wants\("strike-11n"\)\) published\.push\([^;]*publishB2Article\(STRIKES_SPAIN_GUIDE\)\)/);
});
