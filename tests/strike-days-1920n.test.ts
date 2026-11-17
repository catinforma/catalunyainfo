import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import {
  SMU_MARCHES_19N,
  STRIKE_19N_GUIDE,
  STRIKE_20N_GUIDE,
  STRIKE_DAY,
  STRIKE_DAY_IDS,
  STRIKE_DAYS_VERIFIED,
  buildStrikeDayBody,
  catalanStrikesOnDay,
  spainStrikesOnDay,
  strikeDayDescription,
  strikeDayPhase,
  strikeDaySources,
  type StrikeDayKey,
} from "../src/lib/content/batch02/strike-days-1920n.ts";
import { buildRail17nBody } from "../src/lib/content/batch02/strike-rail-17n.ts";
import { STRIKES_GUIDE, STRIKES_VERIFIED, buildStrikesBody } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_GUIDE, buildStrikesSpainBody } from "../src/lib/content/batch02/strikes-spain.ts";
import { SPAIN_STRIKES, STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { NEWS_CYCLE_ENTRY_KEYS } from "../src/lib/seo/news-cycle.ts";

/**
 * "¿Hay huelga el jueves 19 / el viernes 20 de noviembre?" (17 Nov 2026,
 * strike-days-1920n.ts). Pins: three native editions of each page at the
 * registered paths; the first line answers the searched question; every dated
 * strike of the day comes from the Spain entries and is named; no Renfe call
 * on the 19th, no rail strike on the 20th; the day pages are linked from both
 * hubs and the 17N page while their day is to come; the publish groups.
 */

const KEYS: StrikeDayKey[] = ["strike19n", "strike20n"];
const GUIDES = { strike19n: STRIKE_19N_GUIDE, strike20n: STRIKE_20N_GUIDE } as const;
const json = (blocks: Block[]) => JSON.stringify(blocks);
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const externalHrefs = (source: string) => [...source.matchAll(/\]\((https?:[^)]*)\)/g)].map((m) => m[1] ?? "");
const internalHrefs = (source: string) => [...source.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
const PRESS_HOSTS = /(^|\.)(elpais|elmundo|abc|larazon|lavanguardia|elperiodico|eldiario|20minutos|europapress|rtve|cadenaser|que|cronista|okdiario|democrata|redaccionmedica|infosalus|elsaltodiario)\.(es|com|cat)$/;

test("two pages, three native editions each, at the registered paths with the day in the path and the title", () => {
  assert.equal(weekdayIndex(STRIKE_DAY.strike19n), 4); // Thursday
  assert.equal(weekdayIndex(STRIKE_DAY.strike20n), 5); // Friday
  assert.equal(B2_PATHS.strike19n.es, "guias/huelga-19-noviembre");
  assert.equal(B2_PATHS.strike20n.es, "guias/huelga-20-noviembre");
  const all = Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => paths[l]));
  for (const key of KEYS) {
    const guide = GUIDES[key];
    assert.equal(guide.key, key);
    assert.ok(NEWS_CYCLE_ENTRY_KEYS.has(guide.entryKey), `${key}: NewsArticle like the other strike pages`);
    assert.equal(guide.verifiedAt, STRIKE_DAYS_VERIFIED);
    const n = key === "strike19n" ? "19" : "20";
    for (const locale of LOCALES) {
      const e = guide.editions[locale];
      assert.equal(e.path, B2_PATHS[key][locale]);
      assert.equal(all.filter((p) => p === e.path).length, 1, `${key}/${locale}: path collides`);
      assert.ok(e.path.includes(n), e.path);
      assert.ok(bodySchema.safeParse(e.blocks).success, `${key}/${locale}: ${JSON.stringify(bodySchema.safeParse(e.blocks).error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(e.blocks)) > 700, `${key}/${locale}: ${wordCount(text(e.blocks))} words`);
      assert.ok(e.seoTitle.length <= 60 && e.seoTitle.includes(n), `${key}/${locale}: ${e.seoTitle}`);
      assert.ok(e.title.length <= 120 && e.excerpt.length <= 200, `${key}/${locale}`);
      for (const asOf of ["2026-11-17", STRIKE_DAY[key], "2026-11-23"]) {
        const d = strikeDayDescription(key, locale, asOf);
        assert.ok(d.length > 60 && d.length <= 155, `${key}/${locale}/${asOf}: ${d.length}`);
        assert.ok(bodySchema.safeParse(buildStrikeDayBody(key, locale, asOf)).success, `${key}/${locale}/${asOf}`);
      }
      assert.ok(!/undefined|\{checked\}|\[object/.test(json(e.blocks)), `${key}/${locale}`);
    }
  }
});

test("the first line answers the question, in the tense of the as-of date", () => {
  const first = (key: StrikeDayKey, locale: Locale, asOf: string) => text([buildStrikeDayBody(key, locale, asOf)[0]!]);
  assert.match(first("strike19n", "es", "2026-11-17"), /^Sí: el jueves 19 de noviembre de 2026 hay huelga, pero no general/);
  assert.match(first("strike19n", "es", "2026-11-19"), /^Hoy, jueves 19 de noviembre, hay huelga/);
  assert.match(first("strike19n", "es", "2026-11-20"), /^El jueves 19 de noviembre de 2026 hubo huelga/);
  assert.match(first("strike20n", "es", "2026-11-17"), /^Sí: el viernes 20 de noviembre de 2026 hay huelga de estudiantes/);
  assert.match(first("strike20n", "es", "2026-11-20"), /^Hoy, viernes 20 de noviembre, hay huelga de estudiantes/);
  assert.match(first("strike20n", "ca", "2026-11-17"), /^Sí: el divendres 20 de novembre de 2026 hi ha vaga d'estudiants/);
  assert.match(first("strike19n", "ca", "2026-11-17"), /^Sí: el dijous 19 de novembre de 2026 hi ha vaga/);
  assert.match(first("strike19n", "en", "2026-11-17"), /^Yes: on Thursday 19 November 2026 there are strikes/);
  assert.match(first("strike20n", "en", "2026-11-17"), /^Yes: on Friday 20 November 2026 there is a students' strike/);
  assert.equal(strikeDayPhase("strike19n", "2026-11-18"), "before");
  assert.equal(strikeDayPhase("strike19n", "2026-11-19"), "today");
  assert.equal(strikeDayPhase("strike19n", "2026-11-20"), "after");
  // No relative day that goes wrong overnight.
  for (const key of KEYS) for (const locale of LOCALES) assert.doesNotMatch(first(key, locale, "2026-11-17"), /\b(mañana|demà|tomorrow|ayer|ahir|yesterday)\b/i, `${key}/${locale}`);
  // Once past, no present-tense FAQ.
  for (const locale of LOCALES) assert.ok(!buildStrikeDayBody("strike19n", locale, "2026-11-21").some((b) => b.type === "faq"), locale);
});

test("the day's strikes come from the Spain entries and every one is named and has its section", () => {
  assert.deepEqual(spainStrikesOnDay("strike19n").map((s) => s.id).sort(), ["huelga-ferroviaria-2026-11-17", "huelga-limpieza-bizkaia-2026-11-17", "huelga-medicos-smu-2026-11-16"]);
  assert.deepEqual(spainStrikesOnDay("strike20n").map((s) => s.id).sort(), ["huelga-estudiantil-2026-11-20", "huelga-limpieza-bizkaia-2026-11-17", "huelga-medicos-smu-2026-11-16"]);
  for (const id of Object.values(STRIKE_DAY_IDS)) assert.ok(SPAIN_STRIKES.some((s) => s.id === id), id);
  for (const key of KEYS) {
    for (const locale of LOCALES) {
      const blocks = GUIDES[key].editions[locale].blocks;
      const headings = blocks.filter((b) => b.type === "heading").map((b) => b as unknown as { id?: string; text: string });
      for (const strike of spainStrikesOnDay(key)) {
        assert.ok(headings.some((h) => h.id === strike.id), `${key}/${locale}: no section for ${strike.id}`);
        assert.ok(json(blocks).includes(JSON.stringify(strike.calledBy[locale]).slice(1, -1)), `${key}/${locale}: ${strike.id} calledBy not from the entry`);
      }
      const facts = blocks.find((b) => b.type === "keyFacts") as unknown as { items: { label: string }[] };
      assert.equal(facts.items.length, spainStrikesOnDay(key).length + 1, `${key}/${locale}: one fact per strike plus Madrid`);
    }
  }
});

test("no Renfe call on the 19th, no rail strike on the 20th, the doctors and their marches", () => {
  const rail = SPAIN_STRIKES.find((s) => s.id === STRIKE_DAY_IDS.rail)!;
  assert.ok(rail.dates.includes("2026-11-19") && !rail.dates.includes("2026-11-20"));
  assert.ok(!SPAIN_STRIKES.some((s) => s.sector === "rail" && s.dates.includes("2026-11-20")), "a rail strike on the 20th: rewrite the 20N page");
  assert.match(text(STRIKE_19N_GUIDE.editions.es.blocks), /Renfe no está convocada/);
  assert.match(text(STRIKE_20N_GUIDE.editions.es.blocks), /No hay huelga general ni de trenes/);
  // The Rodalies figures of the 17th are never printed as the 19th's.
  for (const locale of LOCALES) {
    const catalonia = text(buildStrikeDayBody("strike19n", locale)).split(/\n/).filter((line) => /66 ?%/.test(line));
    for (const line of catalonia) assert.match(line, /17/, `${locale}: "${line.slice(0, 100)}"`);
  }
  const smu = SPAIN_STRIKES.find((s) => s.id === STRIKE_DAY_IDS.smu)!;
  assert.equal(smu.dates[0], "2026-11-16");
  assert.equal(smu.dates.at(-1), "2026-11-27");
  assert.equal(smu.dates.length, 12);
  assert.equal(SMU_MARCHES_19N.length, 20);
  assert.ok(SMU_MARCHES_19N.some((m) => m.city === "Barcelona" && m.start === "Plaça de les Drassanes"));
  for (const locale of LOCALES) {
    const tables = STRIKE_19N_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { rows: string[][] }[];
    assert.equal(tables[0]?.rows.length, 20, locale);
    assert.ok(!STRIKE_20N_GUIDE.editions[locale].blocks.some((b) => b.type === "table"), `${locale}: the marches are the 19th's`);
  }
  // Catalonia on the 19th: both doctors' strikes and the rail strike.
  assert.deepEqual(catalanStrikesOnDay("strike19n").map((s) => s.id).sort(), ["vaga-ferroviaria-2026-11-17", "vaga-metges-2026-10-28", "vaga-metges-smu-2026-11-16"]);
});

test("links: external ones are named https non-press sources; internal ones are registered paths in the page's language", () => {
  const registered = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => `/${l}/${paths[l]}/`)));
  for (const key of KEYS) {
    const urls = strikeDaySources(key).map((s) => s.url);
    assert.deepEqual(GUIDES[key].sources.map((s) => s.url), urls);
    assert.equal(new Set(urls).size, urls.length);
    for (const source of GUIDES[key].sources) {
      assert.match(source.url, /^https:\/\//);
      assert.ok(!PRESS_HOSTS.test(new URL(source.url).host), source.url);
      assert.ok(source.name.length > 4 && (source.publisher ?? "").length > 1, source.url);
    }
    for (const locale of LOCALES) {
      const body = json(GUIDES[key].editions[locale].blocks);
      for (const href of externalHrefs(body)) assert.ok(urls.includes(href), `${key}/${locale}: ${href} not a source`);
      for (const href of internalHrefs(body)) {
        assert.ok(href.startsWith(`/${locale}/`), `${key}/${locale}: ${href}`);
        assert.ok(registered.has(href), `${key}/${locale}: ${href}`);
      }
      const other = key === "strike19n" ? "strike20n" : "strike19n";
      assert.ok(body.includes(`](/${locale}/${B2_PATHS[other][locale]}/)`), `${key}/${locale}: links the other day`);
    }
  }
});

test("links in: both hubs and the 17N page, while the day is to come", () => {
  for (const locale of LOCALES) {
    for (const key of KEYS) {
      const target = `](/${locale}/${B2_PATHS[key][locale]}/)`;
      assert.ok(json(STRIKES_SPAIN_GUIDE.editions[locale].blocks).includes(target), `${locale}: Spain hub → ${key}`);
      assert.ok(json(STRIKES_GUIDE.editions[locale].blocks).includes(target), `${locale}: Catalan hub → ${key}`);
      assert.ok(json(buildRail17nBody(locale, "2026-11-17")).includes(target), `${locale}: 17N page → ${key}`);
      assert.ok(!json(buildStrikesSpainBody(locale, "2026-11-23")).includes(target), `${locale}: Spain hub still links ${key} the week after`);
      assert.ok(!json(buildStrikesBody(locale, "2026-11-23")).includes(target), `${locale}: Catalan hub still links ${key} after the day`);
    }
  }
});

test("as-of discipline: both hubs verified on their as-of day", () => {
  assert.equal(STRIKES_SPAIN_VERIFIED, STRIKES_SPAIN_AS_OF);
  assert.ok(STRIKE_DAYS_VERIFIED <= STRIKES_VERIFIED && STRIKE_DAYS_VERIFIED <= STRIKES_SPAIN_VERIFIED);
});

test("publish route: in the strikes and huelgas-espana groups and on their own", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("strikes"\)\) \{[^}]*publishB2Article\(STRIKE_19N_GUIDE\),\s*await publishB2Article\(STRIKE_20N_GUIDE\)/);
  assert.match(route, /wants\("huelgas-espana"\)\) published\.push\([^;]*STRIKE_19N_GUIDE[^;]*STRIKE_20N_GUIDE/);
  assert.match(route, /wants\("huelga-19-20n"\)\) published\.push\(await publishB2Article\(STRIKE_19N_GUIDE\), await publishB2Article\(STRIKE_20N_GUIDE\)\)/);
});
