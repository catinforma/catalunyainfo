import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import {
  SMU_MARCHES_19N,
  STUDENT_DEMOS_20N,
  STRIKE_19N_GUIDE,
  STRIKE_20N_GUIDE,
  STRIKE_DAY,
  STRIKE_DAY_IDS,
  STRIKE_DAYS_VERIFIED,
  buildStrikeDayBody,
  calledOffOnDay,
  catalanStrikesOnDay,
  spainStrikesOnDay,
  strikeDayDescription,
  strikeDayPhase,
  strikeDaySources,
  strikeDaysCheckedOn,
  type StrikeDayKey,
} from "../src/lib/content/batch02/strike-days-1920n.ts";
import { dayDate } from "../src/lib/content/batch02/festive.ts";
import { buildStrikeGuideBody } from "../src/lib/content/batch02/strike-guides.ts";
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
 * strike of the day comes from the Spain entries and is named; no rail strike
 * on the 19th (18 Nov 2026: SCF called off Adif's, SCFCOM 38) or the 20th;
 * the day pages are linked from both hubs and the 17N page while their day is
 * to come; "Fuentes revisadas" prints the verification date; the publish
 * groups.
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
      // 17 Nov 2026: the H1 and the title open with the searched words ("huelga 20 noviembre 2026").
      const searched = { ca: `Vaga ${n} de novembre de 2026: `, es: `Huelga ${n} de noviembre de 2026: `, en: `${n} November 2026: ` }[locale];
      if (locale === "en") assert.ok(e.title.includes(searched) && e.seoTitle.includes(searched), `${key}/en: ${e.title} | ${e.seoTitle}`);
      else assert.ok(e.title.startsWith(searched) && e.seoTitle.startsWith(searched), `${key}/${locale}: ${e.title} | ${e.seoTitle}`);
      for (const asOf of ["2026-11-17", `2026-11-${Number(n) - 1}`, STRIKE_DAY[key], "2026-11-23"]) {
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
  assert.equal(strikeDayPhase("strike19n", "2026-11-17"), "before");
  assert.equal(strikeDayPhase("strike19n", "2026-11-18"), "eve");
  assert.equal(strikeDayPhase("strike19n", "2026-11-19"), "today");
  assert.equal(strikeDayPhase("strike19n", "2026-11-20"), "after");
  assert.equal(strikeDayPhase("strike20n", "2026-11-19"), "eve");
  // 17 Nov 2026: the eve says "mañana" with the day and the check date in the same lead; the first FAQ asks in those words.
  assert.match(first("strike19n", "es", "2026-11-18"), /^Mañana, jueves 19 de noviembre, hay huelga, pero no general: .*Fuentes revisadas el miércoles 18 de noviembre de 2026\.$/);
  assert.match(first("strike19n", "ca", "2026-11-18"), /^Demà, dijous 19 de novembre, hi ha vaga, però no general: .*Fonts revisades el dimecres 18 de novembre de 2026\.$/);
  assert.match(first("strike20n", "es", "2026-11-19"), /^Mañana, viernes 20 de noviembre, hay huelga de estudiantes/);
  // 18 Nov 2026: the check date is the day the sources were re-read (STRIKE_DAYS_VERIFIED), never a later as-of day.
  const checked19 = dayDate(strikeDaysCheckedOn("2026-11-19"), "en");
  assert.ok(first("strike20n", "en", "2026-11-19").startsWith("Tomorrow, Friday 20 November, there is a students' strike"));
  assert.ok(first("strike20n", "en", "2026-11-19").endsWith(`Sources checked on ${checked19}.`), first("strike20n", "en", "2026-11-19").slice(-80));
  assert.equal(strikeDaysCheckedOn("2026-11-30"), STRIKE_DAYS_VERIFIED < "2026-11-30" ? STRIKE_DAYS_VERIFIED : "2026-11-30");
  assert.ok(first("strike20n", "es", "2026-11-19").endsWith(`Fuentes revisadas el ${dayDate(strikeDaysCheckedOn("2026-11-19"), "es")}.`));
  const faqOf = (key: StrikeDayKey, locale: Locale, asOf: string) =>
    (buildStrikeDayBody(key, locale, asOf).find((b) => b.type === "faq") as unknown as { items: { question: string }[] }).items[0]?.question;
  assert.equal(faqOf("strike19n", "es", "2026-11-18"), "¿Hay huelga mañana, jueves 19 de noviembre de 2026?");
  assert.equal(faqOf("strike20n", "es", "2026-11-20"), "¿Hay huelga hoy, viernes 20 de noviembre de 2026?");
  assert.equal(faqOf("strike20n", "es", "2026-11-17"), "¿Hay huelga el viernes 20 de noviembre de 2026?");
  for (const key of KEYS) for (const locale of LOCALES) assert.match(strikeDayDescription(key, locale, `2026-11-${Number(STRIKE_DAY[key].slice(-2)) - 1}`), /^(Mañana|Demà|Tomorrow)/, `${key}/${locale}`);
  // No relative day that goes wrong overnight: two days before, none.
  for (const key of KEYS) for (const locale of LOCALES) assert.doesNotMatch(first(key, locale, "2026-11-17"), /\b(mañana|demà|tomorrow|ayer|ahir|yesterday)\b/i, `${key}/${locale}`);
  // Once past, the FAQ stays, in the past tense (25 Nov 2026; tests/strike-citable.test.ts has the full check).
  for (const locale of LOCALES) {
    const faqs = buildStrikeDayBody("strike19n", locale, "2026-11-21").filter((b) => b.type === "faq") as unknown as { items: { question: string }[] }[];
    assert.equal(faqs.length, 1, locale);
    assert.match(faqs[0]!.items[0]!.question, /^(¿Hubo |Hi va haver |Va haver-hi |Was there )/, locale);
  }
});

test("the day's strikes come from the Spain entries and every one is named and has its section", () => {
  // 18 Nov 2026: SCF called off the 19th at Adif (SCFCOM 38), so the rail entry is no longer on that day.
  // 19 Nov 2026: the Basque Government's orders of 17 Nov add Bizkaia's care homes (19th) and Gipuzkoa's private care homes (20th).
  assert.deepEqual(spainStrikesOnDay("strike19n").map((s) => s.id).sort(), ["huelga-limpieza-bizkaia-2026-11-17", "huelga-medicos-smu-2026-11-16", "huelga-residencias-bizkaia-2026-11-19"]);
  assert.deepEqual(spainStrikesOnDay("strike20n").map((s) => s.id).sort(), ["huelga-estudiantil-2026-11-20", "huelga-limpieza-bizkaia-2026-11-17", "huelga-medicos-smu-2026-11-16", "huelga-residencias-gipuzkoa-2026-11-20"]);
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

test("no rail strike on the 19th (Adif's called off) or the 20th, the doctors and their marches", () => {
  const rail = SPAIN_STRIKES.find((s) => s.id === STRIKE_DAY_IDS.rail)!;
  // 18 Nov 2026: SCF called off the 19th (SCFCOM 38, 17 Nov); the page says so from SPAIN_NOT_HAPPENING, linked.
  assert.ok(!rail.dates.includes("2026-11-19") && !rail.dates.includes("2026-11-20"));
  assert.ok(!SPAIN_STRIKES.some((s) => s.sector === "rail" && s.dates.includes("2026-11-19")), "a rail strike on the 19th: rewrite the 19N page");
  assert.ok(!SPAIN_STRIKES.some((s) => s.sector === "rail" && s.dates.includes("2026-11-20")), "a rail strike on the 20th: rewrite the 20N page");
  const calledOff = calledOffOnDay("strike19n");
  assert.equal(calledOff.length, 1);
  assert.ok(calledOff[0]!.sources.some((s) => s.url === "https://www.scf.es/com38/"));
  assert.ok(strikeDaySources("strike19n").some((s) => s.url === "https://www.scf.es/com38/"));
  assert.deepEqual(calledOffOnDay("strike20n"), []);
  for (const locale of LOCALES) {
    const page = text(STRIKE_19N_GUIDE.editions[locale].blocks);
    assert.ok(page.includes(calledOff[0]!.title[locale]), `${locale}: the call-off is printed`);
    assert.match(page, /SCF ha acordado la desconvocatoria para el día 19/, locale);
    assert.match(STRIKE_19N_GUIDE.editions[locale].seoTitle, /desconvocada|called off/, locale);
  }
  // 27 Nov 2026: past the day, the same line in the past tense (PAST_SECTIONS).
  assert.match(text(STRIKE_19N_GUIDE.editions.es.blocks), /No (hay|hubo) huelga general ni de trenes/);
  // Said before and on the day (20 Nov 2026: the published page is past by now, so built as of the 18th).
  assert.match(text(buildStrikeDayBody("strike19n", "es", "2026-11-18")), /Renfe no estaba convocada/);
  // 21 Nov 2026: the published 20N page is past too (its lead is in the past tense), so the present-tense line is checked as of the day.
  assert.match(text(buildStrikeDayBody("strike20n", "es", "2026-11-20")), /No hay huelga general ni de trenes/);
  assert.match(text(STRIKE_20N_GUIDE.editions.es.blocks), /No fue una huelga general/);
  // The Rodalies figures of the 17th are never printed as the 19th's.
  for (const locale of LOCALES) {
    const catalonia = text(buildStrikeDayBody("strike19n", locale)).split(/\n/).filter((line) => /66 ?%/.test(line));
    for (const line of catalonia) assert.match(line, /17/, `${locale}: "${line.slice(0, 100)}"`);
  }
  const smu = SPAIN_STRIKES.find((s) => s.id === STRIKE_DAY_IDS.smu)!;
  assert.equal(smu.dates[0], "2026-11-16");
  // 26 Nov 2026: the 28th is listed too (until 08:00, the notice's first phase).
  assert.equal(smu.dates.at(-1), "2026-11-28");
  assert.equal(smu.dates.length, 13);
  // 19 Nov 2026: the SMU's page no longer lists Zaragoza (20 → 19).
  assert.equal(SMU_MARCHES_19N.length, 19);
  assert.ok(!SMU_MARCHES_19N.some((m) => m.city === "Zaragoza"));
  assert.ok(SMU_MARCHES_19N.some((m) => m.city === "Barcelona" && m.start === "Plaça de les Drassanes"));
  for (const locale of LOCALES) {
    const tables = STRIKE_19N_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { rows: string[][] }[];
    assert.equal(tables[0]?.rows.length, SMU_MARCHES_19N.length, locale);
    // 17 Nov 2026: the 20th has its own table, the students' mobilisations at 12:00 (Sindicato de Estudiantes' page), not the doctors' marches.
    const tables20 = STRIKE_20N_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { caption?: string; rows: string[][] }[];
    assert.equal(tables20.length, 1, locale);
    assert.equal(tables20[0]?.rows.length, STUDENT_DEMOS_20N.length, locale);
    assert.match(tables20[0]?.caption ?? "", /Sindicato de Estudiantes/, locale);
    assert.ok(!tables20[0]?.rows.some((row) => row[1] === "Plaça de les Drassanes"), `${locale}: the doctors' marches are the 19th's`);
  }
  // 19 Nov 2026: the students' page adds Donostia, Zamora, Zaragoza and Teruel (24 → 28).
  assert.equal(STUDENT_DEMOS_20N.length, 28);
  assert.ok(STUDENT_DEMOS_20N.some((d) => d.city === "Teruel" && d.place === "Plaza del Torico"));
  assert.ok(STUDENT_DEMOS_20N.some((d) => d.city === "Barcelona" && d.place === "Plaça Universitat"));
  assert.ok(STUDENT_DEMOS_20N.some((d) => d.city === "Madrid" && d.place === "Sol"));
  // Catalonia on the 19th: both doctors' strikes (18 Nov 2026: the rail strike's 19th was called off).
  assert.deepEqual(catalanStrikesOnDay("strike19n").map((s) => s.id).sort(), ["vaga-metges-2026-10-28", "vaga-metges-smu-2026-11-16"]);
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
      // 20 Nov 2026: built as of the 18th, when both days were still to come (the published hubs are past the 19th by now).
      assert.ok(json(buildStrikesSpainBody(locale, "2026-11-18")).includes(target), `${locale}: Spain hub → ${key}`);
      assert.ok(json(buildStrikesBody(locale, "2026-11-18")).includes(target), `${locale}: Catalan hub → ${key}`);
      assert.ok(json(buildRail17nBody(locale, "2026-11-17")).includes(target), `${locale}: 17N page → ${key}`);
      assert.ok(!json(buildStrikesSpainBody(locale, "2026-11-23")).includes(target), `${locale}: Spain hub still links ${key} the week after`);
      assert.ok(!json(buildStrikesBody(locale, "2026-11-23")).includes(target), `${locale}: Catalan hub still links ${key} after the day`);
    }
    // 17 Nov 2026: on the Spain hub, the day pages sit right under the week summary (second paragraph), and each day's
    // entries link their page from their own section.
    const spain = buildStrikesSpainBody(locale, "2026-11-17");
    const dayLine = json([spain[3]!]); // lead, sources line (25 Nov 2026), week summary, then the day line
    for (const key of KEYS) assert.ok(dayLine.includes(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale}: day pages under the week summary`);
    const section = (id: string) => json([spain[spain.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === id) + 1]!]);
    assert.ok(section(STRIKE_DAY_IDS.rail).includes(`](/${locale}/${B2_PATHS.strike19n[locale]}/)`), `${locale}: rail section → 19N`);
    assert.ok(section(STRIKE_DAY_IDS.students).includes(`](/${locale}/${B2_PATHS.strike20n[locale]}/)`), `${locale}: students section → 20N`);
    // The Renfe guide (covering 17 Nov) links both days, the 19th with an anchor in the query's words.
    const renfe = json(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-17"));
    assert.match(renfe, new RegExp(`\\[[^\\]]*Renfe[^\\]]*19[^\\]]*\\]\\(/${locale}/${B2_PATHS.strike19n[locale]}/\\)`), `${locale}: Renfe guide → 19N`);
    assert.ok(renfe.includes(`](/${locale}/${B2_PATHS.strike20n[locale]}/)`), `${locale}: Renfe guide → 20N`);
    assert.ok(!json(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-20")).includes(`](/${locale}/${B2_PATHS.strike19n[locale]}/)`), `${locale}: Renfe guide after the 19th`);
    // 18 Nov 2026: the 19th was called off, so on the 18th neither the Catalan hub nor the Renfe guide announces a rail strike
    // for "tomorrow", and the Renfe guide has moved on to the 23rd.
    for (const blocks of [buildStrikesBody(locale, "2026-11-18"), buildStrikeGuideBody("strikeRenfe", locale, "2026-11-18")]) {
      const opening = text([blocks[0]!]);
      assert.doesNotMatch(opening, /^(Mañana|Demà|Tomorrow), (jueves|dijous|Thursday) 19/, `${locale}: ${opening.slice(0, 80)}`);
    }
    // 20 Nov 2026: SEMAF called off the 23rd; from that day the Renfe guide's answer opens with the call-off.
    assert.match(text([buildStrikeGuideBody("strikeRenfe", locale, "2026-11-20")[0]!]), /23/, locale);
  }
});

test("as-of discipline: both hubs verified on their as-of day", () => {
  // 27 Nov 2026: the as-of day may run one day ahead of the last full re-read (a cited source unreadable that day: ELA, bot check), never more.
  assert.ok(STRIKES_SPAIN_VERIFIED <= STRIKES_SPAIN_AS_OF, "verified after the as-of day");
  assert.ok(Date.parse(STRIKES_SPAIN_AS_OF) - Date.parse(STRIKES_SPAIN_VERIFIED) <= 86_400_000, `Spain hub as of ${STRIKES_SPAIN_AS_OF}, last fully re-read ${STRIKES_SPAIN_VERIFIED}: re-read`);
  assert.ok(STRIKE_DAYS_VERIFIED <= STRIKES_VERIFIED && STRIKE_DAYS_VERIFIED <= STRIKES_SPAIN_VERIFIED);
});

test("publish route: in the strikes and huelgas-espana groups and on their own", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("strikes"\)\) \{[^}]*publishB2Article\(STRIKE_19N_GUIDE\),\s*await publishB2Article\(STRIKE_20N_GUIDE\)/);
  assert.match(route, /wants\("huelgas-espana"\)\) published\.push\([^;]*STRIKE_19N_GUIDE[^;]*STRIKE_20N_GUIDE/);
  assert.match(route, /wants\("huelga-19-20n"\)\) published\.push\(await publishB2Article\(STRIKE_19N_GUIDE\), await publishB2Article\(STRIKE_20N_GUIDE\)\)/);
});
