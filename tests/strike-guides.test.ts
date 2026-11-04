import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, B2_TITLES, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N, buildStrike11nBody } from "../src/lib/content/batch02/strike-11n.ts";
import {
  STRIKE_EDUCATION_GUIDE,
  STRIKE_GUIDE_SPECS,
  STRIKE_RENFE_GUIDE,
  buildStrikeGuideBody,
  compactDays,
  nearbyStrikes,
  splitFact,
  strikeGuideDescription,
  strikeGuideMeta,
  strikeGuideSources,
  strikeWhoWhen,
  type StrikeGuideKey,
} from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES, STRIKES_AS_OF, STRIKES_GUIDE, STRIKES_VERIFIED, STRIKE_URLS, isUpcoming, type Strike } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { schoolStatusOn } from "../src/lib/content/school/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubPath as rodaliesHubPath, linePath } from "../src/lib/programmatic/rodalies/paths.ts";
import { LINE_IDS } from "../src/lib/programmatic/rodalies/types.ts";

/**
 * The strike guides (4 Nov 2026): one page per language for each called
 * strike people search by name (Renfe 10 and 12 Nov, education 26 Nov),
 * rendered from its entry in strikes.ts.
 *
 * What these pin: the titles and descriptions follow the entry's dates and
 * status (a day called off, minimum services out) with no edit here; every
 * fact on the page is the entry's; the answer comes first; the hub and the
 * 11N page link both ways; and nothing is printed that no official source
 * gave (hours, percentages, a "registered" call).
 */

const GUIDES: { key: StrikeGuideKey; article: typeof STRIKE_RENFE_GUIDE; strikeId: string }[] = [
  { key: "strikeRenfe", article: STRIKE_RENFE_GUIDE, strikeId: "vaga-renfe-2026-11-10" },
  { key: "strikeEducation", article: STRIKE_EDUCATION_GUIDE, strikeId: "vaga-educacio-2026-11-26" },
];

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const entry = (id: string): Strike => {
  const strike = STRIKES.find((s) => s.id === id);
  assert.ok(strike, id);
  return strike;
};
const withEntry = (id: string, change: (s: Strike) => Strike): Strike[] => STRIKES.map((s) => (s.id === id ? change(s) : s));

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([
  ...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  // The Rodalies hub (ca, es, en) and its line pages (ca, es) are code routes.
  ...LOCALES.map((locale) => rodaliesHubPath(locale)),
  ...LINE_IDS.flatMap((id) => [linePath("ca", id), linePath("es", id)]),
]);

/** A plausible "minimum services out" record (shape only, never real figures). */
const PUBLISHED_MS: Strike["minimumServices"] = {
  status: "published",
  msShort: { ca: "Serveis mínims publicats: prova", es: "Servicios mínimos publicados: prueba", en: "Minimum services published: test" },
  text: {
    ca: "El 99% del servei, segons [l'ordre de prova](https://example.org/ordre-prova)",
    es: "El 99% del servicio, según [la orden de prueba](https://example.org/ordre-prova)",
    en: "99% of normal service, under [the test order](https://example.org/ordre-prova)",
  },
};

/* -------------------------------------------------------------------------- */
/* Structure, paths, titles                                                   */
/* -------------------------------------------------------------------------- */

test("each guide has three valid, substantial editions on its registry paths, with no day or year in the path", () => {
  assert.deepEqual(B2_PATHS.strikeRenfe, {
    ca: "guies/vaga-renfe-rodalies-novembre",
    es: "guias/huelga-renfe-rodalies-noviembre",
    en: "guides/renfe-rodalies-strike-november",
  });
  assert.deepEqual(B2_PATHS.strikeEducation, {
    ca: "guies/vaga-educacio-novembre",
    es: "guias/huelga-educacion-noviembre",
    en: "guides/catalonia-teachers-strike-november",
  });
  for (const { key, article } of GUIDES) {
    assert.equal(article.key, key);
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${key}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(edition.blocks)) > 600, `${key}/${locale} is thin`);
      assert.equal(edition.path, B2_PATHS[key][locale]);
      assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
      assert.ok(!/\d/.test(edition.path), `${edition.path}: the days live in strikes.ts, not in the URL`);
    }
  }
});

test("the paths collide with no other published path", () => {
  for (const { key } of GUIDES) {
    for (const locale of LOCALES) {
      assert.equal(ALL_PATHS.filter((paths) => paths[locale] === B2_PATHS[key][locale]).length, 1, `${key}/${locale}`);
    }
  }
});

test("titles fit in 60 characters with the searched words first; descriptions fit in 155 and answer first", () => {
  const seo: Record<StrikeGuideKey, Record<Locale, string>> = {
    strikeRenfe: {
      ca: "Vaga Renfe 10 i 12 novembre 2026: Rodalies i serveis mínims",
      es: "Huelga Renfe 10 y 12 noviembre: Rodalies y servicios mínimos",
      en: "Renfe strike 10 and 12 November 2026: Rodalies and what runs",
    },
    strikeEducation: {
      ca: "Vaga educació 26 novembre 2026: escoles i serveis mínims",
      es: "Huelga educación Cataluña 26 de noviembre: servicios mínimos",
      en: "Catalonia teachers' strike 26 November: are schools open?",
    },
  };
  for (const { key, article, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, excerpt, title } = article.editions[locale];
      assert.equal(seoTitle, seo[key][locale], `${key}/${locale}`);
      assert.ok(seoTitle.length <= 60, `${key}/${locale} title ${seoTitle.length}`);
      assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${key}/${locale} description ${seoDescription.length}: ${seoDescription}`);
      assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${key}/${locale} excerpt ${excerpt.length}`);
      assert.ok(title.length > seoTitle.length - 10 && title.length <= 120, `${key}/${locale} H1 ${title.length}`);
      assert.equal(seoDescription, strikeGuideDescription(key, locale));
      // Answer first: the description opens with the strike's days and carries where minimum services stand.
      assert.match(seoDescription, /^(\p{Lu}\p{Ll}+ )?\d{1,2}\b/u, `${key}/${locale}: ${seoDescription}`);
      assert.ok(seoDescription.includes(strike.minimumServices.msShort[locale]), `${key}/${locale}: ${seoDescription}`);
    }
  }
});

test("titles and descriptions stay in sync with the entry's dates and status in strikes.ts", () => {
  const dayNumbers = (s: string) => [...s.matchAll(/\b(\d{1,2})\b/g)].map((m) => Number(m[1]));
  for (const { key, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    const days = strike.dates.map((iso) => Number(iso.slice(8, 10)));
    for (const locale of LOCALES) {
      const meta = strikeGuideMeta(key, locale);
      // Exactly the entry's days, in its order, in the title and the H1.
      assert.deepEqual(dayNumbers(meta.seoTitle), days, `${key}/${locale}: ${meta.seoTitle}`);
      assert.deepEqual(dayNumbers(meta.title), days, `${key}/${locale}: ${meta.title}`);
      // The related-rail label names no day the entry does not list.
      for (const n of dayNumbers(B2_TITLES[key][locale])) assert.ok(days.includes(n), `${key}/${locale}: B2_TITLES says ${n}`);
    }
  }
  // A day called off: the watch removes it from `dates` and every title follows.
  const tenOnly = withEntry("vaga-renfe-2026-11-10", (s) => ({ ...s, dates: ["2026-11-10"] }));
  assert.equal(strikeGuideMeta("strikeRenfe", "ca", tenOnly).seoTitle, "Vaga Renfe 10 novembre 2026: Rodalies i serveis mínims");
  assert.equal(strikeGuideMeta("strikeRenfe", "es", tenOnly).seoTitle, "Huelga Renfe 10 de noviembre: Rodalies y servicios mínimos");
  assert.equal(strikeGuideMeta("strikeRenfe", "en", tenOnly).seoTitle, "Renfe strike 10 November 2026: Rodalies and what runs");
  // A strike moved to another day: the education titles follow too.
  const moved = withEntry("vaga-educacio-2026-11-26", (s) => ({ ...s, dates: ["2026-12-03"] }));
  assert.equal(strikeGuideMeta("strikeEducation", "ca", moved).seoTitle, "Vaga educació 3 desembre 2026: escoles i serveis mínims");
  // Minimum services out: the description says so, within 155 characters, in every language.
  for (const { key, strikeId } of GUIDES) {
    const out = withEntry(strikeId, (s) => ({ ...s, minimumServices: PUBLISHED_MS }));
    for (const locale of LOCALES) {
      const description = strikeGuideDescription(key, locale, STRIKES_AS_OF, out);
      assert.ok(description.length <= 155, `${key}/${locale}: ${description.length}`);
      assert.ok(description.includes(PUBLISHED_MS.msShort[locale]), `${key}/${locale}: ${description}`);
      // The longest real msShort so far (Renfe, 29 Oct) still fits, falling back to a shorter line.
      const long = withEntry(strikeId, (s) => ({ ...s, minimumServices: { ...PUBLISHED_MS, msShort: entry("vaga-renfe-2026-10-29").minimumServices.msShort } }));
      assert.ok(strikeGuideDescription(key, locale, STRIKES_AS_OF, long).length <= 155, `${key}/${locale}: long msShort`);
      // After the strike: past wording.
      const past = strikeGuideDescription(key, locale, "2026-12-31", withEntry(strikeId, (s) => ({ ...s, minimumServices: { ...PUBLISHED_MS, status: "none" } })));
      assert.ok(past.length > 30 && past.length <= 155, `${key}/${locale}: ${past}`);
      assert.match(past, /es va|se fijaron|se anunció|were set|was announced/, `${key}/${locale}: ${past}`);
    }
  }
});

test("compact dates: same month, across months, bare and with weekdays", () => {
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "ca"), "10 i 12 de novembre");
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "ca", { bare: true }), "10 i 12 novembre");
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "es"), "10 y 12 de noviembre");
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "en"), "10 and 12 November");
  assert.equal(compactDays(["2026-10-30", "2026-11-02"], "ca"), "30 d'octubre i 2 de novembre");
  assert.equal(compactDays(["2026-10-30", "2026-11-02"], "ca", { bare: true }), "30 octubre i 2 novembre");
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "ca", { weekdays: true }), "dimarts 10 i dijous 12 de novembre");
  assert.equal(compactDays(["2026-11-10", "2026-11-12"], "en", { weekdays: true }), "Tuesday 10 and Thursday 12 November");
  assert.equal(compactDays(["2026-11-06", "2026-11-09", "2026-12-04"], "es"), "6 y 9 de noviembre y 4 de diciembre");
});

/* -------------------------------------------------------------------------- */
/* One source of truth                                                        */
/* -------------------------------------------------------------------------- */

test("each guide belongs to one entry in strikes.ts, which points back at it", () => {
  for (const spec of STRIKE_GUIDE_SPECS) assert.equal(entry(spec.strikeId).guide, spec.key, spec.key);
  for (const strike of STRIKES.filter((s) => s.guide)) {
    assert.ok(
      STRIKE_GUIDE_SPECS.some((spec) => spec.key === strike.guide && spec.strikeId === strike.id),
      `${strike.id}: guide ${strike.guide} has no spec`,
    );
  }
  assert.deepEqual(GUIDES.map((g) => g.key).sort(), STRIKE_GUIDE_SPECS.map((s) => s.key).sort());
});

test("every fact on the page is the entry's: facts, minimum services and advice appear verbatim", () => {
  for (const { key, article, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    for (const locale of LOCALES) {
      const body = JSON.stringify(article.editions[locale].blocks);
      for (const fact of strike.facts[locale]) {
        const { value } = splitFact(fact);
        assert.ok(body.includes(JSON.stringify(value).slice(1, -1)), `${key}/${locale}: fact missing: ${fact.slice(0, 60)}`);
      }
      assert.ok(body.includes(JSON.stringify(strike.minimumServices.text[locale]).slice(1, -1)), `${key}/${locale}: minimum services text`);
      assert.ok(body.includes(JSON.stringify(strike.short[locale]).slice(1, -1)), `${key}/${locale}: short`);
      if (isUpcoming(strike, STRIKES_AS_OF)) {
        for (const advice of strike.advice[locale]) assert.ok(body.includes(JSON.stringify(advice).slice(1, -1)), `${key}/${locale}: advice`);
      }
    }
  }
  // The module restates no fact about the strikes themselves: who calls them is only in strikes.ts.
  const source = readFileSync(new URL("../src/lib/content/batch02/strike-guides.ts", import.meta.url), "utf8");
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const word of ["SEMAF", "USTEC", "CGT Ensenyament", "paro total", "aturada total", "paros parciales", "21 de novembre", "26 de novembre", "10 de novembre"]) {
    assert.ok(!code.includes(word), `strike-guides.ts restates "${word}": read it from the entry`);
  }
});

test("editing the entry changes the guide without touching the template", () => {
  for (const { key, strikeId } of GUIDES) {
    const out = withEntry(strikeId, (s) => ({ ...s, minimumServices: PUBLISHED_MS }));
    for (const locale of LOCALES) {
      const blocks = buildStrikeGuideBody(key, locale, STRIKES_AS_OF, out);
      assert.ok(bodySchema.safeParse(blocks).success, `${key}/${locale}`);
      const leadText = text(blocks.slice(0, 1));
      assert.ok(leadText.includes(PUBLISHED_MS.msShort[locale]), `${key}/${locale}: ${leadText}`);
      assert.doesNotMatch(leadText, /no publicats|no publicados|not published/, `${key}/${locale}`);
      assert.match(text(blocks), /99%/, `${key}/${locale}`);
      // The order joins the sources.
      assert.ok(strikeGuideSources(key, [blocks], out).some((s) => s.url === "https://example.org/ordre-prova"), `${key}/${locale}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Answer first                                                               */
/* -------------------------------------------------------------------------- */

test("answer first: the lead gives the days, the strike, what it touches and where minimum services stand; key facts give who and when", () => {
  const authorities: Record<StrikeGuideKey, Record<Locale, RegExp[]>> = {
    strikeRenfe: {
      ca: [/Generalitat, per ordre al DOGC \(Rodalies i regionals\)/, /Ministeri de Transports, per resolució \(alta velocitat i llarga distància\)/],
      es: [/Generalitat, por orden en el DOGC \(Rodalies y regionales\)/, /Ministerio de Transportes, por resolución \(alta velocidad y larga distancia\)/],
      en: [/Generalitat sets them in an order in the DOGC \(Rodalies and regional trains\)/, /Ministry of Transport in a resolution \(high-speed and long-distance trains\)/],
    },
    strikeEducation: {
      ca: [/els fixa la Generalitat, per ordre al DOGC \(escoles i instituts\)/],
      es: [/los fija la Generalitat, por orden en el DOGC \(colegios e institutos\)/],
      en: [/the Generalitat sets them in an order in the DOGC \(schools\)/],
    },
  };
  for (const { key, article, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks;
      assert.equal(blocks[0]?.type, "paragraph");
      assert.equal((blocks[0] as { lead?: boolean }).lead, true);
      const leadText = text(blocks.slice(0, 1));
      assert.ok(leadText.includes(strip(strike.short[locale])), `${key}/${locale}: lead misses the entry's short line`);
      assert.ok(leadText.includes(strike.minimumServices.msShort[locale]), `${key}/${locale}: lead misses msShort`);
      if (strike.minimumServices.status === "pending") for (const pattern of authorities[key][locale]) assert.match(leadText, pattern, `${key}/${locale}`);
      // Key facts: who calls it and its days and hours, from the entry's own facts.
      assert.equal(blocks[1]?.type, "keyFacts");
      const facts = (blocks[1] as { items: { label: string; value: string }[] }).items;
      const { who, when } = strikeWhoWhen(strike, locale);
      assert.ok(who && when, `${key}/${locale}: the entry's facts lost their "Convocatòria"/"Dies" labels`);
      assert.equal(facts[0]?.value, who, `${key}/${locale}`);
      assert.equal(facts[1]?.value, when, `${key}/${locale}`);
      assert.ok(facts.some((f) => f.value.startsWith(strike.minimumServices.msShort[locale])), `${key}/${locale}: key facts miss minimum services`);
      // Then the language line and the sources note, as on the hub and the 11N page.
      assert.equal(blocks[2]?.type, "languageLinks", `${key}/${locale}`);
      assert.equal((blocks[3] as { tone?: string }).tone, "official", `${key}/${locale}`);
      assert.match(text(blocks.slice(3, 4)), new RegExp(STRIKES_VERIFIED.slice(0, 4)), `${key}/${locale}`);
    }
  }
});

test("minimum services: the section has the entry's text and says who sets them and where they are published", () => {
  const where: Record<StrikeGuideKey, string[]> = {
    strikeRenfe: [STRIKE_URLS.treballMs, STRIKE_URLS.dogc, STRIKE_URLS.rodaliesStatus, STRIKE_URLS.ministryRail, STRIKE_URLS.renfe],
    strikeEducation: [STRIKE_URLS.treballMs, STRIKE_URLS.dogc],
  };
  for (const { key, article, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks;
      const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === "serveis-minims");
      assert.ok(at > 3, `${key}/${locale}: no minimum-services section`);
      assert.equal((blocks[at + 1] as { text?: string }).text, strike.minimumServices.text[locale]);
      const tableBlock = blocks.slice(at).find((b) => b.type === "table") as { rows: string[][] };
      assert.equal(tableBlock.rows.length, strike.affects.length, `${key}/${locale}`);
      const tableJson = JSON.stringify(tableBlock.rows);
      for (const url of where[key]) assert.ok(tableJson.includes(`](${url})`), `${key}/${locale}: no link to ${url}`);
      // While pending, the entry's text says when the order came out last time (the precedent).
      if (strike.minimumServices.status === "pending") {
        assert.match(strike.minimumServices.text[locale], /Encara no s'han publicat|Aún no se han publicado|Not published yet/);
        assert.match(strike.minimumServices.text[locale], /(setembre|septiembre|September|octubre|October)/, `${key}/${locale}: no precedent date`);
      }
    }
  }
});

test("what it touches: one row per service, from `affects`; Rodalies lines link their live pages", () => {
  for (const { key, article, strikeId } of GUIDES) {
    const strike = entry(strikeId);
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks;
      const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === "que-afecta");
      const tableBlock = blocks[at + 1] as { type: string; rows: string[][] };
      assert.equal(tableBlock.type, "table");
      assert.equal(tableBlock.rows.length, 6);
      assert.equal(tableBlock.rows.filter((r) => /^(Sí|Yes)$/.test(r[1] ?? "")).length, strike.affects.length, `${key}/${locale}`);
    }
  }
  const renfe = (locale: Locale) => JSON.stringify(STRIKE_RENFE_GUIDE.editions[locale].blocks);
  for (const locale of ["ca", "es"] as const) {
    for (const id of LINE_IDS) assert.ok(renfe(locale).includes(`](${linePath(locale, id)})`), `${locale}: no link to ${id}`);
  }
  assert.ok(renfe("en").includes(`](${rodaliesHubPath("en")})`));
  // Rodalies is a Grupo Renfe service in the words of the 29 Oct order's title (DOGC núm. 9780, read 4 Nov 2026).
  for (const locale of LOCALES) {
    assert.ok(renfe(locale).includes("servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe"), locale);
    assert.ok(renfe(locale).includes(`](${STRIKE_URLS.ordreRenfe29})`), locale);
  }
});

test("the education guide: 26 November is a school day; families and staff get the entry's advice", () => {
  const strike = entry("vaga-educacio-2026-11-26");
  for (const day of strike.dates) assert.equal(schoolStatusOn(day).kind, "term", day);
  const line: Record<Locale, RegExp> = {
    ca: /El dijous 26 de novembre és dia lectiu al calendari escolar 2026-2027/,
    es: /El jueves 26 de noviembre es día lectivo en el calendario escolar 2026-2027/,
    en: /Thursday 26 November is a school day in the 2026-2027 school calendar/,
  };
  for (const locale of LOCALES) {
    const body = text(STRIKE_EDUCATION_GUIDE.editions[locale].blocks);
    assert.match(body, line[locale], locale);
    assert.ok(JSON.stringify(STRIKE_EDUCATION_GUIDE.editions[locale].blocks).includes(`](/${locale}/${TOOL_PATHS.school[locale]}/)`), locale);
    // The call is the unions' own: never "registered" or formally notified, which no source says yet.
    assert.doesNotMatch(body, /registrad|registered|registre|formalment|formalmente|formally/i, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Links, sources, photo                                                      */
/* -------------------------------------------------------------------------- */

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const { key, article } of GUIDES) {
    for (const locale of LOCALES) {
      const hrefs = [...JSON.stringify(article.editions[locale].blocks).matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
      assert.ok(hrefs.length >= 5, `${key}/${locale}: only ${hrefs.length} internal links`);
      for (const href of hrefs) {
        assert.ok(href.startsWith(`/${locale}/`), `${key}/${locale} links to ${href}`);
        assert.ok(href.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href), `${key}/${locale}: ${href} is not a published path`);
      }
      // Back to the hub and on to the 11N page.
      assert.ok(hrefs.includes(`/${locale}/${B2_PATHS.strikes[locale]}/`), `${key}/${locale}: no link to the hub`);
      assert.ok(hrefs.includes(`/${locale}/${B2_PATHS.strike11n[locale]}/`), `${key}/${locale}: no link to the 11N page`);
    }
  }
});

test("external links are https and every one is a named source; sources are unique and include the entry's", () => {
  for (const { key, article, strikeId } of GUIDES) {
    const urls = article.sources.map((s) => s.url);
    assert.equal(new Set(urls).size, urls.length, `${key}: a source is listed twice`);
    for (const source of article.sources) {
      assert.match(source.url, /^https:\/\//, source.url);
      assert.notEqual(source.name, new URL(source.url).host, `${key}: ${source.url} is linked but has no name (add it to KNOWN_SOURCES)`);
      assert.ok(source.publisher, source.url);
    }
    for (const source of entry(strikeId).sources) assert.ok(urls.includes(source.url), `${key}: entry source ${source.url} missing`);
    for (const locale of LOCALES) {
      for (const match of JSON.stringify(article.editions[locale].blocks).matchAll(/\]\((https?:[^)]*)\)/g)) {
        const href = match[1] ?? "";
        assert.match(href, /^https:\/\//, href);
        assert.ok(urls.includes(href), `${key}/${locale}: ${href} is linked but not in the sources`);
      }
    }
    assert.equal(article.verifiedAt, STRIKES_VERIFIED);
  }
});

test("photos: Renfe reuses the trains feature's file; education the school calendar's, both with their exact alt and caption", () => {
  assert.equal(STRIKE_RENFE_GUIDE.heroKey, TRAINS.heroKey);
  assert.deepEqual(STRIKE_RENFE_GUIDE.heroAlt, TRAINS.heroAlt);
  assert.deepEqual(STRIKE_RENFE_GUIDE.heroCaption, TRAINS.heroCaption);
  const school = readFileSync(new URL("../src/lib/content/school/publish.ts", import.meta.url), "utf8");
  assert.ok(school.includes(`const HERO_KEY = "${STRIKE_EDUCATION_GUIDE.heroKey}"`));
  for (const locale of LOCALES) {
    assert.ok(school.includes(`heroAlt: ${JSON.stringify(STRIKE_EDUCATION_GUIDE.heroAlt?.[locale])}`), `alt/${locale} differs from the media row`);
    assert.ok(school.includes(`heroCaption: ${JSON.stringify(STRIKE_EDUCATION_GUIDE.heroCaption?.[locale])}`), `caption/${locale} differs from the media row`);
  }
  for (const { article } of GUIDES) {
    assert.ok(article.heroKey && IMAGE_BY_KEY.has(article.heroKey), article.key);
    assert.equal(article.secondaryKey, undefined);
    for (const locale of LOCALES) assert.ok(!article.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

test("the read-next box only repeats links from the related rail, and the hub comes first", () => {
  for (const { key, article } of GUIDES) {
    for (const locale of LOCALES) {
      const before = article.editions[locale].blocks;
      const after = withReadNext([...before], locale);
      assert.equal(after.length - before.length, 1, `${key}/${locale}: long enough for a box`);
      const related = before[before.length - 1] as { items?: string[] };
      assert.ok(related.items?.[0]?.includes(`(/${locale}/${B2_PATHS.strikes[locale]}/)`), `${key}/${locale}`);
      const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
      for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${key}/${locale}: ${link}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Links from the hub and the 11N page                                        */
/* -------------------------------------------------------------------------- */

test("the hub's card for each strike links its guide once per language; the hub's titles are untouched", () => {
  for (const { key, strikeId } of GUIDES) {
    for (const locale of LOCALES) {
      const target = `](/${locale}/${B2_PATHS[key][locale]}/)`;
      const blocks = STRIKES_GUIDE.editions[locale].blocks;
      assert.equal(JSON.stringify(blocks).split(target).length - 1, 1, `hub/${key}/${locale}`);
      // Inside that strike's own section, as the last item of its facts.
      const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === strikeId);
      const list = blocks[at + 1] as { type: string; items: string[] };
      assert.equal(list.type, "list", `${key}/${locale}`);
      assert.ok(list.items[list.items.length - 1]?.includes(target), `${key}/${locale}`);
    }
  }
  // Frozen (retitled 3 Nov 2026): body links only.
  assert.equal(STRIKES_GUIDE.editions.ca.seoTitle, "Vaga avui i demà a Catalunya: què funciona i serveis mínims");
  assert.equal(STRIKES_GUIDE.editions.es.seoTitle, "Huelga hoy y mañana en Cataluña: qué funciona y calendario");
  assert.equal(STRIKES_GUIDE.editions.en.seoTitle, "Barcelona strike today: trains, metro and what runs");
});

test("the 11N page links both guides in its body and follows the Renfe entry's status; its titles are untouched", () => {
  const renfe = entry("vaga-renfe-2026-11-10");
  const pending: Record<Locale, string> = {
    ca: "sense hores ni serveis mínims publicats encara",
    es: "sin horas ni servicios mínimos publicados todavía",
    en: "with no hours or minimum services published yet",
  };
  for (const locale of LOCALES) {
    const blocks = STRIKE_11N.editions[locale].blocks;
    const body = JSON.stringify(blocks);
    for (const key of ["strikeRenfe", "strikeEducation"] as const) {
      const target = `](/${locale}/${B2_PATHS[key][locale]}/)`;
      // Once in the text, once in the related rail.
      assert.equal(body.split(target).length - 1, 2, `11N/${key}/${locale}`);
    }
    assert.equal(text(blocks).includes(pending[locale]), renfe.minimumServices.status === "pending", locale);
    // The education strike is mentioned with the entry's day while it is still to come.
    assert.match(text(blocks), /dijous 26 de novembre de 2026|jueves 26 de noviembre de 2026|Thursday 26 November 2026/, locale);
    assert.doesNotMatch(text(buildStrike11nBody(locale, "2026-11-27")), /dijous 26 de novembre de 2026|jueves 26 de noviembre de 2026|Thursday 26 November 2026/, locale);
  }
  assert.equal(STRIKE_11N.editions.ca.seoTitle, "Vaga general 11 novembre 2026: serveis mínims i què funciona");
  assert.equal(STRIKE_11N.editions.es.seoTitle, "Huelga general 11 de noviembre 2026: servicios mínimos");
  assert.equal(STRIKE_11N.editions.en.seoTitle, "General strike 11 November 2026 in Spain: what runs");
});

test("the Renfe guide lists the general strike between its two days and links its page", () => {
  const others = nearbyStrikes(entry("vaga-renfe-2026-11-10")).map((s) => s.id);
  assert.ok(others.includes("vaga-general-2026-11-11"));
  assert.ok(!others.includes("vaga-renfe-2026-11-10"));
  assert.ok(!others.includes("vaga-educacio-2026-11-26"), "26 Nov is not near 10-12 Nov");
  for (const locale of LOCALES) {
    const blocks = STRIKE_RENFE_GUIDE.editions[locale].blocks;
    const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === "altres-vagues");
    assert.ok(at > 0, locale);
    const list = blocks[at + 2] as { items: string[] };
    assert.ok(list.items.some((item) => item.includes(`](/${locale}/${B2_PATHS.strike11n[locale]}/)`)), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Phases, determinism, what must never be printed                            */
/* -------------------------------------------------------------------------- */

test("on a strike day the lead says so; after it, the page speaks of the past and drops the advice", () => {
  const today: Record<Locale, RegExp> = {
    ca: /^Avui, dimarts 10 de novembre de 2026, és dia de vaga\./,
    es: /^Hoy, martes 10 de noviembre de 2026, es día de huelga\./,
    en: /^Today, Tuesday 10 November 2026, is a strike day\./,
  };
  for (const locale of LOCALES) {
    const onDay = buildStrikeGuideBody("strikeRenfe", locale, "2026-11-10");
    assert.ok(bodySchema.safeParse(onDay).success, locale);
    assert.match(text(onDay.slice(0, 1)), today[locale], locale);
    assert.doesNotMatch(text(buildStrikeGuideBody("strikeRenfe", locale, "2026-11-11").slice(0, 1)), /Avui|Hoy|Today/, locale);
    for (const { key, strikeId } of GUIDES) {
      const over = withEntry(strikeId, (s) => ({ ...s, minimumServices: { ...PUBLISHED_MS, status: "none" } }));
      const after = buildStrikeGuideBody(key, locale, "2026-12-31", over);
      assert.ok(bodySchema.safeParse(after).success, `${key}/${locale}`);
      assert.match(text(after.slice(0, 1)), /ja ha passat|ya ha pasado|is over/, `${key}/${locale}`);
      assert.ok(!after.some((b) => b.type === "heading" && (b as { id?: string }).id === "que-fer"), `${key}/${locale}: advice after the strike`);
    }
  }
});

test("the guides are deterministic: no clock in the module, same output on every call", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/strike-guides.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock");
  for (const { key, article } of GUIDES) {
    for (const locale of LOCALES) assert.equal(JSON.stringify(buildStrikeGuideBody(key, locale)), JSON.stringify(article.editions[locale].blocks), `${key}/${locale}`);
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
  for (const { article } of GUIDES) {
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const body = `${text(edition.blocks)} ${edition.seoDescription}`.toLowerCase();
      const pattern = new RegExp(`(${weekdays[locale].join("|")}),? (\\d{1,2}) (?:d'|de )?(${months[locale].join("|")})`, "gu");
      for (const match of body.matchAll(pattern)) {
        const month = months[locale].indexOf(match[3]!) + 1;
        const iso = `2026-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}" (${iso})`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 20, `only ${checked} weekday mentions checked`);
});

test("nothing no official source gave: no hours, percentages or other operators while minimum services are pending", () => {
  for (const { key, article, strikeId } of GUIDES) {
    if (entry(strikeId).minimumServices.status !== "pending") continue;
    for (const locale of LOCALES) {
      const body = `${text(article.editions[locale].blocks)} ${article.editions[locale].seoDescription}`;
      assert.doesNotMatch(body, /\d+\s?%/, `${key}/${locale}: a percentage while pending`);
      assert.doesNotMatch(body, /\b\d{1,2}[.:]\d{2}\s?h?\b(?! de)/, `${key}/${locale}: a clock time`);
      assert.doesNotMatch(body, /\bIryo\b|\bAVE\b|\bAvlo\b|\bAlvia\b/, `${key}/${locale}: names an operator or service no source gave`);
      assert.doesNotMatch(body, /desconvocad|called off|cancel·lada|cancelada/i, `${key}/${locale}`);
    }
  }
});

test("the publish route republishes both guides with the hub, and has a group for each", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKE_EDUCATION_GUIDE, STRIKE_RENFE_GUIDE \} from "@\/lib\/content\/batch02\/strike-guides";/);
  const strikes = route.slice(route.indexOf('if (wants("strikes"))'), route.indexOf('if (wants("strike-renfe"))'));
  for (const name of ["STRIKES_GUIDE", "STRIKE_RENFE_GUIDE", "STRIKE_EDUCATION_GUIDE"]) assert.match(strikes, new RegExp(`publishB2Article\\(${name}\\)`), name);
  assert.match(route, /wants\("strike-renfe"\)\) published\.push\(await publishB2Article\(STRIKE_RENFE_GUIDE\)\)/);
  assert.match(route, /wants\("strike-educacio"\)\) published\.push\(await publishB2Article\(STRIKE_EDUCATION_GUIDE\)\)/);
});

function strip(value: string): string {
  return value.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
