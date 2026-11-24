import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { B2_PATHS, B2_TITLES } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_19N_GUIDE, STRIKE_20N_GUIDE, STRIKE_DAYS_VERIFIED, calledOffOnDay, strikeDaysCheckedOn } from "../src/lib/content/batch02/strike-days-1920n.ts";
import {
  DAY2326_URLS,
  STRIKE_23N_GUIDE,
  STRIKE_26N_GUIDE,
  STRIKE_DAY_2326,
  STRIKE_DAY_2326_IDS,
  buildStrikeDay2326Body,
  catalanStrikesOn2326,
  educationEntry,
  spainStrikesOn2326,
  strikeDay2326Description,
  strikeDay2326Phase,
  strikeDay2326Sources,
  type StrikeDay2326Key,
} from "../src/lib/content/batch02/strike-days-2326n.ts";
import { dayDate } from "../src/lib/content/batch02/festive.ts";
import { buildStrikeGuideBody, guideStrikeId } from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES, STRIKES_AS_OF, STRIKES_CALLED_OFF, STRIKES_GUIDE, STRIKE_DAY_PAGES, buildStrikesBody } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_GUIDE, buildStrikesSpainBody } from "../src/lib/content/batch02/strikes-spain.ts";
import { SPAIN_NOT_HAPPENING, SPAIN_STRIKES } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { NEWS_CYCLE_ENTRY_KEYS } from "../src/lib/seo/news-cycle.ts";

/**
 * "¿Hay huelga el lunes 23 / el jueves 26 de noviembre?" (19 Nov 2026,
 * strike-days-2326n.ts), built like the 19N/20N pages. Pins: three native
 * editions at the registered paths, titles opening with the searched words;
 * the first line answers in the tense of the as-of day; every dated strike of
 * the day comes from the entries and has its section; the 23rd's Ministry
 * part and the 26th's school order are printed as pending exactly while the
 * entries say so; links in from both hubs, the Renfe and education guides and
 * the 19N/20N pages while the day is to come; the publish groups.
 */

const KEYS: StrikeDay2326Key[] = ["strike23n", "strike26n"];
const GUIDES = { strike23n: STRIKE_23N_GUIDE, strike26n: STRIKE_26N_GUIDE } as const;
const json = (blocks: Block[]) => JSON.stringify(blocks);
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const externalHrefs = (source: string) => [...source.matchAll(/\]\((https?:[^)]*)\)/g)].map((m) => m[1] ?? "");
const internalHrefs = (source: string) => [...source.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
const PRESS_HOSTS = /(^|\.)(elpais|elmundo|abc|larazon|lavanguardia|elperiodico|eldiario|20minutos|europapress|rtve|cadenaser|que|cronista|okdiario|democrata|redaccionmedica|infosalus|elsaltodiario|ara|naciodigital|ccma|3cat)\.(es|com|cat)$/;
const dayOf = (key: StrikeDay2326Key) => Number(STRIKE_DAY_2326[key].slice(-2));
const iso = (day: number) => `2026-11-${String(day).padStart(2, "0")}`;

test("two pages, three native editions each, at the registered paths with the day in the path and the title", () => {
  assert.equal(weekdayIndex(STRIKE_DAY_2326.strike23n), 1); // Monday
  assert.equal(weekdayIndex(STRIKE_DAY_2326.strike26n), 4); // Thursday
  assert.equal(B2_PATHS.strike23n.es, "guias/huelga-23-noviembre");
  assert.equal(B2_PATHS.strike26n.es, "guias/huelga-26-noviembre");
  assert.equal(B2_PATHS.strike23n.ca, "guies/vaga-23-novembre");
  assert.equal(B2_PATHS.strike26n.ca, "guies/vaga-26-novembre");
  const all = Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => paths[l]));
  for (const key of KEYS) {
    const guide = GUIDES[key];
    assert.equal(guide.key, key);
    assert.ok(NEWS_CYCLE_ENTRY_KEYS.has(guide.entryKey), `${key}: NewsArticle like the other strike pages`);
    assert.equal(guide.verifiedAt, STRIKE_DAYS_VERIFIED);
    assert.ok(STRIKE_DAY_PAGES.some((p) => p.key === key && p.day === STRIKE_DAY_2326[key]), `${key}: in STRIKE_DAY_PAGES`);
    const n = String(dayOf(key));
    for (const locale of LOCALES) {
      const e = guide.editions[locale];
      assert.equal(e.path, B2_PATHS[key][locale]);
      assert.equal(all.filter((p) => p === e.path).length, 1, `${key}/${locale}: path collides`);
      assert.ok(e.path.includes(n), e.path);
      assert.ok(bodySchema.safeParse(e.blocks).success, `${key}/${locale}: ${JSON.stringify(bodySchema.safeParse(e.blocks).error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(e.blocks)) > 700, `${key}/${locale}: ${wordCount(text(e.blocks))} words`);
      assert.ok(e.seoTitle.length <= 60 && e.seoTitle.includes(n), `${key}/${locale}: ${e.seoTitle}`);
      assert.ok(e.title.length <= 120 && e.excerpt.length <= 200, `${key}/${locale}`);
      // The H1 and the title open with the searched words ("huelga 23 noviembre 2026", "vaga 26 novembre").
      const searched = { ca: `Vaga ${n} de novembre de 2026: `, es: `Huelga ${n} de noviembre de 2026: `, en: `${n} November 2026: ` }[locale];
      if (locale === "en") assert.ok(e.title.includes(searched) && e.seoTitle.includes(searched), `${key}/en: ${e.title} | ${e.seoTitle}`);
      else assert.ok(e.title.startsWith(searched) && e.seoTitle.startsWith(searched), `${key}/${locale}: ${e.title} | ${e.seoTitle}`);
      for (const asOf of ["2026-11-19", iso(dayOf(key) - 1), STRIKE_DAY_2326[key], "2026-11-30"]) {
        const d = strikeDay2326Description(key, locale, asOf);
        assert.ok(d.length > 60 && d.length <= 155, `${key}/${locale}/${asOf}: ${d.length}`);
        assert.ok(bodySchema.safeParse(buildStrikeDay2326Body(key, locale, asOf)).success, `${key}/${locale}/${asOf}`);
      }
      assert.ok(!/undefined|\{checked\}|\[object/.test(json(e.blocks)), `${key}/${locale}`);
    }
  }
  // The searched words of the 23rd's rail queries are in its titles: "huelga renfe 23 noviembre", "vaga rodalies 23 novembre".
  // 20 Nov 2026: with the call-off ("desconvocada", "called off") right after them.
  for (const locale of LOCALES) assert.match(STRIKE_23N_GUIDE.editions[locale].seoTitle, /desconvocada|called off/, locale);
  assert.match(STRIKE_23N_GUIDE.editions.es.seoTitle, /Renfe/);
  assert.match(STRIKE_23N_GUIDE.editions.ca.seoTitle, /Rodalies/);
  assert.match(STRIKE_26N_GUIDE.editions.es.seoTitle, /educación/);
  assert.match(STRIKE_26N_GUIDE.editions.ca.seoTitle, /educació/);
});

test("the first line answers the question, in the tense of the as-of date", () => {
  const first = (key: StrikeDay2326Key, locale: Locale, asOf: string) => text([buildStrikeDay2326Body(key, locale, asOf)[0]!]);
  // 20 Nov 2026: SEMAF called off the 23rd (nº 2026-38): the first thing the page says.
  assert.match(first("strike23n", "es", "2026-11-20"), /^No: la huelga de maquinistas de Renfe del lunes 23 de noviembre de 2026 está desconvocada\./);
  assert.match(first("strike23n", "es", "2026-11-22"), /^Mañana, lunes 23 de noviembre, no hay huelga de Renfe ni de Rodalies\./);
  assert.match(first("strike23n", "es", "2026-11-23"), /^Hoy, lunes 23 de noviembre, no hay huelga de Renfe/);
  assert.match(first("strike23n", "es", "2026-11-24"), /^El lunes 23 de noviembre de 2026 no hubo huelga de Renfe/);
  assert.match(first("strike23n", "ca", "2026-11-20"), /^No: la vaga de maquinistes de Renfe del dilluns 23 de novembre de 2026 està desconvocada\./);
  assert.match(first("strike23n", "en", "2026-11-20"), /^No: the Renfe train drivers' strike on Monday 23 November 2026 is called off\./);
  assert.match(first("strike26n", "es", "2026-11-19"), /^Sí: el jueves 26 de noviembre de 2026 hay huelga en la educación en toda Cataluña/);
  assert.match(first("strike26n", "es", "2026-11-25"), /^Mañana, jueves 26 de noviembre, hay huelga en la educación/);
  assert.match(first("strike26n", "ca", "2026-11-26"), /^Avui, dijous 26 de novembre, hi ha vaga a l'educació/);
  assert.match(first("strike26n", "en", "2026-11-27"), /^On Thursday 26 November 2026 there was an education strike in Catalonia/);
  assert.equal(strikeDay2326Phase("strike23n", "2026-11-21"), "before");
  assert.equal(strikeDay2326Phase("strike23n", "2026-11-22"), "eve");
  assert.equal(strikeDay2326Phase("strike23n", "2026-11-23"), "today");
  assert.equal(strikeDay2326Phase("strike23n", "2026-11-24"), "after");
  assert.equal(strikeDay2326Phase("strike26n", "2026-11-25"), "eve");
  // The lead says who called it off and what still happens (Correos, doctors); the 26th's, the pending school order.
  for (const locale of LOCALES) {
    assert.match(first("strike23n", locale, "2026-11-20"), /SEMAF.*(desconvoc|called it off).*(Correos|Correus)/, locale);
    assert.match(first("strike23n", locale, "2026-11-20"), /(salvo aviso de Renfe|llevat que Renfe avisi del contrari|unless Renfe says otherwise)/, locale);
    assert.doesNotMatch(first("strike23n", locale, "2026-11-20"), /66%/, `${locale}: no minimum-service figure for a strike that is off`);
    assert.match(first("strike26n", locale, "2026-11-19"), /(pendent|publicad|publicat|published)/, locale);
  }
  // The check date is the day the sources were re-read, never a later as-of day.
  const checked = dayDate(strikeDaysCheckedOn("2026-11-22"), "es");
  assert.ok(first("strike23n", "es", "2026-11-22").includes(`en las fuentes revisadas el ${checked}`), first("strike23n", "es", "2026-11-22"));
  const faqOf = (key: StrikeDay2326Key, locale: Locale, asOf: string) =>
    (buildStrikeDay2326Body(key, locale, asOf).find((b) => b.type === "faq") as unknown as { items: { question: string }[] }).items[0]?.question;
  assert.equal(faqOf("strike23n", "es", "2026-11-22"), "¿Hay huelga mañana, lunes 23 de noviembre de 2026?");
  assert.equal(faqOf("strike26n", "es", "2026-11-26"), "¿Hay huelga hoy, jueves 26 de noviembre de 2026?");
  assert.equal(faqOf("strike26n", "ca", "2026-11-19"), "Hi ha vaga el dijous 26 de novembre de 2026?");
  for (const key of KEYS) for (const locale of LOCALES) assert.match(strikeDay2326Description(key, locale, iso(dayOf(key) - 1)), /^(Mañana|Demà|Tomorrow)/, `${key}/${locale}`);
  // No relative day that goes wrong overnight: two days before, none.
  for (const key of KEYS) for (const locale of LOCALES) assert.doesNotMatch(first(key, locale, iso(dayOf(key) - 2)), /\b(mañana|demà|tomorrow|ayer|ahir|yesterday)\b/i, `${key}/${locale}`);
  // Once past, no present-tense FAQ.
  for (const key of KEYS) for (const locale of LOCALES) assert.ok(!buildStrikeDay2326Body(key, locale, iso(dayOf(key) + 1)).some((b) => b.type === "faq"), `${key}/${locale}`);
});

test("the day's strikes come from the entries and every one is named and has its section", () => {
  // 20 Nov 2026: SEMAF's strike of the 23rd is called off: not in the entries, in SPAIN_NOT_HAPPENING and STRIKES_CALLED_OFF.
  assert.deepEqual(spainStrikesOn2326("strike23n").map((s) => s.id).sort(), [STRIKE_DAY_2326_IDS.correos, STRIKE_DAY_2326_IDS.smu].sort());
  // 25 Nov 2026: and CSIF's partial stoppages in the Community of Madrid's public schools (26th is one of its days; BOCM Orden 4252/2026).
  assert.deepEqual(
    spainStrikesOn2326("strike26n").map((s) => s.id).sort(),
    [STRIKE_DAY_2326_IDS.correos, STRIKE_DAY_2326_IDS.smu, "huelga-madrid-colegios-csif-2026-11-26"].sort(),
  );
  assert.ok(!SPAIN_STRIKES.some((s) => s.id === "huelga-renfe-2026-11-23"));
  assert.ok(!STRIKES.some((s) => s.id === "vaga-renfe-2026-11-23"));
  assert.ok(SPAIN_NOT_HAPPENING.some((s) => s.id === STRIKE_DAY_2326_IDS.renfeCalledOff));
  assert.equal(STRIKES_CALLED_OFF.find((s) => s.id === STRIKE_DAY_2326_IDS.renfeCalledOffCatalan)?.day, STRIKE_DAY_2326.strike23n);
  assert.deepEqual(calledOffOnDay("strike23n").map((s) => s.id), [STRIKE_DAY_2326_IDS.renfeCalledOff]);
  assert.deepEqual(calledOffOnDay("strike26n"), []);
  assert.ok(catalanStrikesOn2326("strike26n").some((s) => s.id === STRIKE_DAY_2326_IDS.education));
  for (const id of [STRIKE_DAY_2326_IDS.correos, STRIKE_DAY_2326_IDS.smu]) assert.ok(SPAIN_STRIKES.some((s) => s.id === id), id);
  assert.equal(educationEntry().dates[0], STRIKE_DAY_2326.strike26n);
  for (const key of KEYS) {
    for (const locale of LOCALES) {
      const blocks = GUIDES[key].editions[locale].blocks;
      const headings = blocks.filter((b) => b.type === "heading").map((b) => b as unknown as { id?: string; text: string });
      for (const strike of spainStrikesOn2326(key)) {
        assert.ok(headings.some((h) => h.id === strike.id), `${key}/${locale}: no section for ${strike.id}`);
        assert.ok(json(blocks).includes(JSON.stringify(strike.calledBy[locale]).slice(1, -1)), `${key}/${locale}: ${strike.id} calledBy not from the entry`);
      }
      for (const strike of catalanStrikesOn2326(key)) assert.ok(text(blocks).includes(strike.minimumServices.msShort[locale]), `${key}/${locale}: ${strike.id} not in the Catalonia list`);
      const facts = blocks.find((b) => b.type === "keyFacts") as unknown as { items: { label: string }[] };
      assert.equal(facts.items.length, spainStrikesOn2326(key).length + 1 + (key === "strike26n" ? 1 : 0) + calledOffOnDay(key).length, `${key}/${locale}: one fact per strike plus Madrid (plus education on the 26th, the call-off on the 23rd)`);
    }
  }
  // The 26th: the education entry's own facts and minimum services, as on the Catalan hub.
  for (const locale of LOCALES) {
    const blocks = STRIKE_26N_GUIDE.editions[locale].blocks;
    assert.ok(blocks.some((b) => b.type === "heading" && (b as { id?: string }).id === STRIKE_DAY_2326_IDS.education), locale);
    assert.ok(json(blocks).includes(JSON.stringify(educationEntry().minimumServices.text[locale]).slice(1, -1)), `${locale}: the education entry's minimum services`);
  }
});

test("the 23rd: called off, said from SEMAF's notice; the 26th's school order pending exactly while the entry says so; no rail strike either day", () => {
  // 20 Nov 2026: SEMAF nº 2026-38 is quoted and linked, on the page and in its sources.
  assert.ok(strikeDay2326Sources("strike23n").some((s) => s.url === DAY2326_URLS.semaf38));
  assert.ok(strikeDay2326Sources("strike23n").some((s) => s.url === DAY2326_URLS.semaf39));
  for (const locale of LOCALES) {
    const page = text(STRIKE_23N_GUIDE.editions[locale].blocks);
    assert.match(page, /SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre/, locale);
    assert.ok(page.includes(calledOffOnDay("strike23n")[0]!.title[locale]), `${locale}: the call-off is printed under "what is not on that day"`);
    assert.match(strikeDay2326Description("strike23n", locale, "2026-11-20"), /SEMAF/, locale);
    assert.doesNotMatch(page, /Pendents de publicar|Pendientes de publicar|Not published yet/, `${locale}: nothing pending for a strike that is off`);
  }
  const education = educationEntry();
  assert.equal(education.minimumServices.status === "pending", /pendientes/.test(strikeDay2326Description("strike26n", "es", "2026-11-19")), "the 26N entry and the day page disagree on the school order: rewrite strike-days-2326n.ts");
  // The trains of the 23rd: usual timetable, and the Generalitat's 66 % / 33 % named as this strike's, in the table.
  for (const locale of LOCALES) {
    const tables = STRIKE_23N_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { rows: string[][] }[];
    assert.equal(tables.length, 1, locale);
    assert.match(tables[0]!.rows[0]![1]!, /habitual|usual/i, locale);
    assert.match(tables[0]!.rows[0]![2]!, /66%.*33%/, locale);
    const tables26 = STRIKE_26N_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { rows: string[][] }[];
    assert.equal(tables26.length, 1, locale);
  }
  // No rail strike left on the 23rd, none on the 26th.
  for (const day of [STRIKE_DAY_2326.strike23n, STRIKE_DAY_2326.strike26n]) {
    assert.ok(!SPAIN_STRIKES.some((s) => s.sector === "rail" && s.dates.includes(day)), `a rail strike on ${day}: rewrite the day page`);
    assert.ok(!STRIKES.some((s) => s.scope === "rail" && s.dates.includes(day)), `a Catalan rail strike on ${day}: rewrite the day page`);
  }
  assert.match(text(STRIKE_26N_GUIDE.editions.es.blocks), /No hay huelga general ni de trenes/);
  assert.match(text(STRIKE_23N_GUIDE.editions.es.blocks), /No es una huelga general ni de trenes/);
});

test("links: external ones are named https non-press sources; internal ones are registered paths in the page's language", () => {
  const registered = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((l) => `/${l}/${paths[l]}/`)));
  for (const key of KEYS) {
    const urls = strikeDay2326Sources(key).map((s) => s.url);
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
      const other = key === "strike23n" ? "strike26n" : "strike23n";
      // 24 Nov 2026: while the other day is to come (the 26th's page drops the 23rd once it has passed).
      assert.equal(body.includes(`](/${locale}/${B2_PATHS[other][locale]}/)`), STRIKE_DAY_2326[other] >= STRIKES_AS_OF, `${key}/${locale}: links the other day`);
      for (const asOf of ["2026-11-20", "2026-11-23"]) assert.ok(json(buildStrikeDay2326Body(key, locale, asOf)).includes(`](/${locale}/${B2_PATHS[other][locale]}/)`), `${key}/${locale}/${asOf}: links the other day`);
      // The Renfe guide from the 23rd, the education guide from the 26th.
      const own = key === "strike23n" ? "strikeRenfe" : "strikeEducation";
      assert.ok(body.includes(`](/${locale}/${B2_PATHS[own][locale]}/)`), `${key}/${locale}: links ${own}`);
      // The 19th's marches are not this page's business.
      assert.ok(!body.includes(`](/${locale}/${B2_PATHS.strike19n[locale]}/)`), `${key}/${locale}: links the 19N page`);
    }
  }
});

test("links in: both hubs, the Renfe and education guides and the 19N/20N pages, while the day is to come", () => {
  for (const locale of LOCALES) {
    for (const key of KEYS) {
      const target = `](/${locale}/${B2_PATHS[key][locale]}/)`;
      // 24 Nov 2026: on the day itself and before, whatever today's as-of is.
      const toCome = STRIKE_DAY_2326[key] >= STRIKES_AS_OF;
      assert.equal(json(STRIKES_SPAIN_GUIDE.editions[locale].blocks).includes(target), toCome, `${locale}: Spain hub → ${key}`);
      assert.equal(json(STRIKES_GUIDE.editions[locale].blocks).includes(target), toCome, `${locale}: Catalan hub → ${key}`);
      assert.ok(json(buildStrikesSpainBody(locale, STRIKE_DAY_2326[key])).includes(target), `${locale}: Spain hub → ${key} on the day`);
      assert.ok(json(buildStrikesBody(locale, STRIKE_DAY_2326[key])).includes(target), `${locale}: Catalan hub → ${key} on the day`);
      const after = iso(dayOf(key) + 1);
      assert.ok(!json(buildStrikesSpainBody(locale, after)).includes(target), `${locale}: Spain hub still links ${key} after the day`);
      assert.ok(!json(buildStrikesBody(locale, after)).includes(target), `${locale}: Catalan hub still links ${key} after the day`);
      // On the Spain hub, in the "Día a día" line right under the week summary (as the 19N/20N pages).
      assert.ok(json([buildStrikesSpainBody(locale, "2026-11-19")[2]!]).includes(target), `${locale}: ${key} under the week summary`);
    }
    // The 19N and 20N pages (which rank for "huelga 20 noviembre") hand on to the 23rd.
    for (const guide of [STRIKE_19N_GUIDE, STRIKE_20N_GUIDE]) assert.ok(json(guide.editions[locale].blocks).includes(`](/${locale}/${B2_PATHS.strike23n[locale]}/)`), `${guide.key}/${locale} → 23N`);
    // 20 Nov 2026: the Spain hub lists the 23rd's Renfe strike as called off.
    const spain = text(buildStrikesSpainBody(locale, "2026-11-20"));
    assert.ok(spain.includes(calledOffOnDay("strike23n")[0]!.title[locale]), `${locale}: Spain hub → the call-off`);
    // The Renfe guide (its 23 Nov strike called off) links the day page right under the answer, with "Renfe" and "23" in the anchor; the education guide the 26th's.
    assert.equal(guideStrikeId("strikeRenfe", "2026-11-20"), "vaga-ferroviaria-2026-11-17");
    const renfe = buildStrikeGuideBody("strikeRenfe", locale, "2026-11-20");
    assert.match(json([renfe[4]!]), new RegExp(`\\[[^\\]]*Renfe[^\\]]*23[^\\]]*\\]\\(/${locale}/${B2_PATHS.strike23n[locale]}/\\)`), `${locale}: Renfe guide → 23N`);
    assert.equal(guideStrikeId("strikeEducation", "2026-11-19"), STRIKE_DAY_2326_IDS.education);
    const education = buildStrikeGuideBody("strikeEducation", locale, "2026-11-19");
    assert.match(json([education[4]!]), new RegExp(`\\[[^\\]]*26[^\\]]*\\]\\(/${locale}/${B2_PATHS.strike26n[locale]}/\\)`), `${locale}: education guide → 26N`);
    assert.ok(!json(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-24")).includes(`](/${locale}/${B2_PATHS.strike23n[locale]}/)`), `${locale}: Renfe guide after the 23rd`);
    assert.ok(!json(buildStrikeGuideBody("strikeEducation", locale, "2026-11-27")).includes(`](/${locale}/${B2_PATHS.strike26n[locale]}/)`), `${locale}: education guide after the 26th`);
    // Anchors in the searched words.
    assert.match(B2_TITLES.strike23n[locale], /23/);
    assert.match(B2_TITLES.strike26n[locale], /26/);
  }
});

test("as-of discipline: the pages never claim a re-read later than both hubs'", () => {
  assert.ok(strikeDaysCheckedOn("2026-11-30") <= STRIKE_DAYS_VERIFIED);
  for (const key of KEYS) for (const locale of LOCALES) assert.ok(text(GUIDES[key].editions[locale].blocks).includes(dayDate(STRIKE_DAYS_VERIFIED, locale).replace(/^\S+ /, "")), `${key}/${locale}`);
});

test("publish route: in the strikes and huelgas-espana groups and on their own", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("strikes"\)\) \{[^}]*publishB2Article\(STRIKE_23N_GUIDE\),\s*await publishB2Article\(STRIKE_26N_GUIDE\)/);
  assert.match(route, /wants\("huelgas-espana"\)\) published\.push\([^;]*STRIKE_23N_GUIDE[^;]*STRIKE_26N_GUIDE/);
  assert.match(route, /wants\("huelga-23-26n"\)\) published\.push\(await publishB2Article\(STRIKE_23N_GUIDE\), await publishB2Article\(STRIKE_26N_GUIDE\)\)/);
});
