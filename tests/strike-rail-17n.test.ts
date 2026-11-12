import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { buildStrike11nBody } from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKE_11N_CITIES_AS_OF } from "../src/lib/content/batch02/strike-11n-cities-data.ts";
import { buildSpainBody } from "../src/lib/content/batch02/strike-11n-spain.ts";
import { buildStrikeGuideBody } from "../src/lib/content/batch02/strike-guides.ts";
import {
  CERCANIAS_NETWORKS,
  RAIL_17N_GUIDE,
  RAIL_17N_ID,
  RAIL_17N_VERIFIED,
  buildRail17nBody,
  rail17nDays,
  rail17nDescription,
  rail17nPhase,
  rail17nSources,
} from "../src/lib/content/batch02/strike-rail-17n.ts";
import { STRIKES, STRIKES_AS_OF, STRIKES_VERIFIED, STRIKE_URLS } from "../src/lib/content/batch02/strikes.ts";
import { SPAIN_STRIKES, STRIKES_SPAIN_VERIFIED } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { NEWS_CYCLE_ENTRY_KEYS } from "../src/lib/seo/news-cycle.ts";

/**
 * "Huelga de trenes del 17 de noviembre en España" (13 Nov 2026,
 * strike-rail-17n.ts). Pins: three native editions at the registered paths;
 * every strike fact read from the Spain and Catalan entries (nothing typed);
 * the 10 Nov precedent printed only while the Ministry's resolution is not
 * out and always named as the 10 Nov strike's; no figure for a network whose
 * minimum services are pending; before / during / after from the as-of date
 * only; the links in from the Renfe guide and the 11N pages for the rest of
 * Spain; the publish groups.
 */

const edition = (locale: Locale) => RAIL_17N_GUIDE.editions[locale];
const json = (blocks: Block[]) => JSON.stringify(blocks);
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const externalHrefs = (source: string) => [...source.matchAll(/\]\((https?:[^)]*)\)/g)].map((m) => m[1] ?? "");
const internalHrefs = (source: string) => [...source.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
const spain = () => SPAIN_STRIKES.find((s) => s.id === RAIL_17N_ID.spain)!;
const catalan = () => STRIKES.find((s) => s.id === RAIL_17N_ID.catalan)!;

const PRESS_HOSTS = /(^|\.)(elpais|elmundo|abc|larazon|lavanguardia|elperiodico|eldiario|20minutos|europapress|rtve|cadenaser|que|cronista|okdiario|bolsamania|democrata|alicanteplaza|diaridetarragona)\.(es|com|cat)$/;

test("three editions at the registered paths, valid, substantial, with the date in the path and the title", () => {
  assert.deepEqual(Object.keys(RAIL_17N_GUIDE.editions).sort(), ["ca", "en", "es"]);
  assert.equal(RAIL_17N_GUIDE.key, "railStrike17n");
  assert.equal(edition("es").path, "guias/huelga-trenes-17-noviembre");
  assert.equal(edition("ca").path, "guies/vaga-trens-17-novembre");
  assert.equal(edition("en").path, "guides/spain-rail-strike-17-november");
  for (const locale of LOCALES) {
    const e = edition(locale);
    assert.equal(e.path, B2_PATHS.railStrike17n[locale]);
    assert.ok(bodySchema.safeParse(e.blocks).success, locale);
    assert.ok(wordCount(text(e.blocks)) > 600, `${locale}: ${wordCount(text(e.blocks))} words`);
    assert.ok(e.seoTitle.length <= 60 && /17/.test(e.seoTitle), `${locale}: ${e.seoTitle}`);
    assert.ok(e.seoDescription.length > 60 && e.seoDescription.length <= 155, `${locale}: ${e.seoDescription.length}`);
    assert.ok(e.title.length <= 120 && e.excerpt.length <= 200, locale);
    assert.ok(!/undefined|\{checked\}|\[object/.test(json(e.blocks)), locale);
  }
  const all = Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => paths[l]));
  for (const locale of LOCALES) assert.equal(all.filter((p) => p === B2_PATHS.railStrike17n[locale]).length, 1, locale);
  assert.ok(NEWS_CYCLE_ENTRY_KEYS.has(RAIL_17N_GUIDE.entryKey), "NewsArticle like the other strike pages");
});

test("the dates follow the entries, which agree with each other; weekdays are right", () => {
  assert.deepEqual(rail17nDays(), catalan().dates);
  assert.deepEqual(rail17nDays(), ["2026-11-17", "2026-11-19"]);
  assert.equal(weekdayIndex("2026-11-17"), 2); // Tuesday
  assert.equal(weekdayIndex("2026-11-19"), 4); // Thursday
  assert.equal(weekdayIndex("2026-11-23"), 1); // Monday
  assert.equal(RAIL_17N_VERIFIED, STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED);
  assert.equal(RAIL_17N_GUIDE.verifiedAt, RAIL_17N_VERIFIED);
});

test("single source of truth: who calls it, the scope and both minimum-services texts come from the entries", () => {
  for (const locale of LOCALES) {
    const body = json(edition(locale).blocks);
    const has = (s: string) => body.includes(JSON.stringify(s).slice(1, -1));
    assert.ok(has(spain().calledBy[locale]), `${locale}: calledBy`);
    assert.ok(has(spain().scope[locale]), `${locale}: scope`);
    assert.ok(has(catalan().minimumServices.text[locale]), `${locale}: Rodalies text`);
    // The Spain entry's text with {checked} filled in.
    const head = spain().minimumServices.text[locale].split("{checked}")[0] ?? "";
    assert.ok(head.length > 5 && has(head), `${locale}: Ministry text`);
  }
});

test("no figure for a network whose minimum services are pending; the precedent only while pending, named as 10 November's", () => {
  const pending = spain().minimumServices.status !== "published";
  for (const locale of LOCALES) {
    const blocks = edition(locale).blocks;
    const tbl = blocks.find((b) => b.type === "table") as unknown as { rows: string[][] };
    assert.equal(tbl.rows.length, CERCANIAS_NETWORKS.length + 1);
    for (const row of tbl.rows.slice(0, -1)) {
      if (pending) assert.doesNotMatch(row[2] ?? "", /\d/, `${locale}: ${row[0]}`);
    }
    const rodalies = tbl.rows.at(-1)!;
    assert.equal(rodalies[0], "Rodalies de Catalunya");
    if (catalan().minimumServices.status === "published") assert.match(rodalies[2] ?? "", /66 ?%.*33 ?%/);
    const paragraphs = blocks.filter((b) => b.type === "paragraph").map((b) => (b as unknown as { text: string }).text);
    const precedent = paragraphs.filter((p) => /75 ?%/.test(p));
    assert.equal(precedent.length, pending ? 1 : 0, locale);
    for (const p of precedent) {
      assert.match(p, /10 (de )?(noviembre|novembre|November)/, locale);
      assert.match(p, /no son los del 17|no són els del 17|not the 17th's/, locale);
      assert.ok(p.includes(`](${STRIKE_URLS.renfeSemaf1012})`), locale);
    }
    // Every percentage on the page sits in the Rodalies text, the Rodalies cell, the precedent or a published Ministry text.
    for (const piece of [...paragraphs, ...(blocks.find((b) => b.type === "keyFacts") as unknown as { items: { value: string }[] }).items.map((i) => i.value)]) {
      if (!/\d ?%/.test(piece)) continue;
      assert.ok(/66 ?%/.test(piece) || precedent.includes(piece) || !pending, `${locale}: "${piece.slice(0, 80)}"`);
    }
  }
});

test("before, during and after, from the as-of date only", () => {
  assert.equal(rail17nPhase("2026-11-13"), "before");
  assert.equal(rail17nPhase("2026-11-17"), "during");
  assert.equal(rail17nPhase("2026-11-19"), "during");
  assert.equal(rail17nPhase("2026-11-20"), "after");
  assert.equal(rail17nPhase(STRIKES_AS_OF), STRIKES_AS_OF < "2026-11-17" ? "before" : STRIKES_AS_OF > "2026-11-19" ? "after" : "during");
  const lead = (locale: Locale, asOf: string) => text([buildRail17nBody(locale, asOf)[0]!]);
  assert.match(lead("es", "2026-11-13"), /hay huelga de trenes/);
  assert.match(lead("es", "2026-11-20"), /hubo huelga de trenes/);
  assert.doesNotMatch(lead("es", "2026-11-20"), /\bhay huelga|aún no/);
  assert.match(lead("ca", "2026-11-20"), /hi va haver vaga/);
  assert.match(lead("en", "2026-11-20"), /there was a rail strike/);
  for (const locale of LOCALES) {
    assert.doesNotMatch(lead(locale, "2026-11-18"), /\b(hay|hubo) huelga|hi ha vaga|there is a/, `${locale}: tense-neutral while the days run`);
    assert.notEqual(rail17nDescription(locale, "2026-11-13"), rail17nDescription(locale, "2026-11-20"));
    for (const asOf of ["2026-11-13", "2026-11-17", "2026-11-20"]) assert.ok(bodySchema.safeParse(buildRail17nBody(locale, asOf)).success, `${locale} ${asOf}`);
  }
});

test("links: every external one is a named, https, non-press source; internal ones are registered paths in the page's language", () => {
  const urls = rail17nSources().map((s) => s.url);
  assert.deepEqual(RAIL_17N_GUIDE.sources.map((s) => s.url), urls);
  assert.equal(new Set(urls).size, urls.length);
  for (const source of RAIL_17N_GUIDE.sources) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(!PRESS_HOSTS.test(new URL(source.url).host), source.url);
    assert.ok(source.name.length > 4 && (source.publisher ?? "").length > 1, source.url);
  }
  const registered = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => `/${l}/${paths[l]}/`)));
  for (const locale of LOCALES) {
    const body = json(edition(locale).blocks);
    for (const href of externalHrefs(body)) assert.ok(urls.includes(href), `${locale}: ${href} not a source`);
    for (const href of internalHrefs(body)) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href}`);
      assert.ok(registered.has(href), `${locale}: ${href}`);
    }
    assert.ok(body.includes(`](/${locale}/${B2_PATHS.strikeRenfe[locale]}/)`), `${locale}: links the Rodalies guide`);
  }
});

test("links in: the Renfe guide while it covers 17 Nov, and the 11N pages for the rest of Spain (not the Catalan one)", () => {
  for (const locale of LOCALES) {
    const target = `](/${locale}/${B2_PATHS.railStrike17n[locale]}/)`;
    assert.ok(json(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-13")).includes(target), `${locale}: Renfe guide on 13 Nov`);
    assert.ok(!json(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-20")).includes(target), `${locale}: Renfe guide covering 23 Nov`);
    assert.ok(json(buildSpainBody(STRIKE_11N_CITIES_AS_OF, locale)).includes(target), `${locale}: 11N Spain page`);
    const catalanPage = json(buildStrike11nBody(locale));
    assert.ok(!catalanPage.includes(target), `${locale}: the Catalan 11N page keeps the Rodalies guide`);
    assert.ok(catalanPage.includes(`](/${locale}/${B2_PATHS.strikeRenfe[locale]}/)`), locale);
  }
});

test("publish route: in the strikes group and on its own", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("strikes"\)\) \{[^}]*publishB2Article\(RAIL_17N_GUIDE\)/);
  assert.match(route, /wants\("huelga-trenes-17n"\)\) published\.push\(await publishB2Article\(RAIL_17N_GUIDE\)\)/);
});
