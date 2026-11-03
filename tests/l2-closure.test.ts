import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { mock, test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { L2_WORKS } from "../src/lib/content/batch02/barcelona-december.ts";
import { CARDS } from "../src/lib/content/batch02/cards.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import {
  CLOSED_STATIONS,
  H10_CANCELLED_NAMED,
  L2_CLOSURE,
  L2_CLOSURE_AS_OF,
  L2_CLOSURE_GUIDE,
  L2_CLOSURE_META,
  L2_CLOSURE_VERIFIED,
  L2_REOPENED,
  L2_URLS,
  OFFICIAL_HOSTS,
  SHUTTLE,
  TRAM_LINES,
  TUSGSAL_LINES,
  buildL2Body,
  isStale,
  l2ClosureMention,
  l2Description,
  l2Meta,
  l2Phase,
  l2SeoTitle,
  l2Sources,
  reopeningProblems,
  type L2Reopening,
} from "../src/lib/content/batch02/l2-closure.ts";
import { B2_PATHS, B2_TITLES, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N_DATE } from "../src/lib/content/batch02/strike-11n.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { addDays, shortDate, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { hubPath as rodaliesHubPath, linePath } from "../src/lib/programmatic/rodalies/paths.ts";

/**
 * Metro L2 closed between La Pau and Gorg (3 Nov 2026): one page per
 * language, every fact from TMB's notice, TMB's status alert and the two
 * identical press notes (TMB's and the City Council's) of 29 Oct 2026.
 *
 * What it must never do: print a time, a stop or a frequency TMB has not
 * published, call the shuttle free (TMB only says no validation), give the
 * press's cause, disagree with Barcelona in December on the dates, render
 * differently depending on the day, or still say "closed" once the trains
 * are back.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(L2_CLOSURE_GUIDE.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(L2_CLOSURE_GUIDE.editions[locale].blocks);
const ROOT = new URL("..", import.meta.url);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set([
  ...ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...christmasFairsPaths().map((p) => p.path),
  // The Rodalies hub (ca, es, en) and its line pages (ca, es) are code routes.
  ...LOCALES.map((locale) => rodaliesHubPath(locale)),
  linePath("ca", "R1"),
  linePath("es", "R1"),
]);

/** A plausible reopening (never real data): TMB's service notices page, read that morning. */
const BACK: L2Reopening = { date: L2_CLOSURE.back, url: L2_URLS.serviceNotices.ca, read: L2_CLOSURE.back };

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths, closed and reopened", () => {
  const expected: Record<Locale, string> = { ca: "guies/l2-metro-tall-la-pau-gorg", es: "guias/l2-metro-cortada-la-pau-gorg", en: "guides/barcelona-metro-l2-closure" };
  for (const locale of LOCALES) {
    const edition = L2_CLOSURE_GUIDE.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1000, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.l2Closure[locale]);
    assert.equal(edition.path, L2_CLOSURE_META[locale].path);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    const reopened = buildL2Body(locale, BACK);
    assert.ok(bodySchema.safeParse(reopened).success, `${locale}: reopened body`);
    assert.ok(wordCount(text(reopened)) > 200, `${locale}: reopened body is thin`);
  }
  assert.equal(L2_CLOSURE_GUIDE.key, "l2Closure");
  assert.ok(B2_TITLES.l2Closure, "a related-rail title");
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.l2Closure[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
    assert.ok(!christmasFairsPaths().some((p) => p.path === `/${locale}/${path}/`), path);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.l2Closure[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155, front-load the searched words and the end date, closed and reopened", () => {
  const words: Record<Locale, RegExp> = { ca: /^L2 tallada La Pau–Gorg fins al /, es: /^L2 metro cortada La Pau–Gorg hasta el /, en: /^Barcelona metro L2 closed La Pau–Gorg until / };
  const back: Record<Locale, RegExp> = { ca: /^L2 La Pau–Gorg reoberta el /, es: /^L2 La Pau–Gorg reabierta el /, en: /reopened on / };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = L2_CLOSURE_GUIDE.editions[locale];
    for (const slot of [null, BACK]) {
      const t = l2SeoTitle(locale, slot);
      const d = l2Description(locale, slot);
      assert.ok(t.length > 20 && t.length <= 60, `${locale} title ${t.length}: ${t}`);
      assert.ok(d.length > 80 && d.length <= 155, `${locale} description ${d.length}: ${d}`);
      for (const station of CLOSED_STATIONS) assert.ok(d.includes(station), `${locale}: ${station} in the description`);
      const m = l2Meta(locale, slot);
      assert.ok(m.excerpt.length > 30 && m.excerpt.length <= 200, `${locale} excerpt ${m.excerpt.length}`);
    }
    assert.match(seoTitle, words[locale]);
    assert.ok(seoTitle.includes(shortDate(L2_CLOSURE.until, locale)), `${locale}: the last day in the title`);
    assert.ok(seoDescription.includes(shortDate(L2_CLOSURE.until, locale)), `${locale}: the last day in the description`);
    // The answer in the snippet: until when, which stations, and how to get round.
    assert.match(seoDescription, /3-5 min/);
    assert.match(seoDescription, /L10 Nord/);
    assert.match(l2SeoTitle(locale, BACK), back[locale]);
    assert.ok(l2SeoTitle(locale, BACK).includes(shortDate(BACK.date, locale)), `${locale}: the reopening day in the title`);
    assert.equal(seoTitle, l2SeoTitle(locale, L2_REOPENED));
    assert.equal(seoDescription, l2Description(locale, L2_REOPENED));
    assert.ok(title.length > seoTitle.length, `${locale}: the H1 says more than the title`);
    assert.ok(excerpt.length <= 200);
  }
});

test("sources are https, untracked, TMB's or the City Council's, listed once; every external link is a source; the reader sees the check date", () => {
  const urls = new Set<string>();
  for (const source of L2_CLOSURE_GUIDE.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_|app_key|app_id/.test(source.url), source.url);
    assert.ok(!urls.has(source.url), `duplicate source ${source.url}`);
    urls.add(source.url);
    assert.match(new URL(source.url).host, OFFICIAL_HOSTS, `${source.url} is not an official source`);
  }
  for (const url of [...Object.values(L2_URLS.notice), L2_URLS.metroStatus, L2_URLS.tmbPress, L2_URLS.council, L2_URLS.shuttleLine, L2_URLS.busStatus]) {
    assert.ok(urls.has(url), `${url} is a source`);
  }
  for (const locale of LOCALES) {
    for (const [, href] of json(locale).matchAll(/\]\((https?:[^)]+)\)/g)) assert.ok(urls.has(href!), `${locale}: ${href} is not a listed source`);
    assert.ok(json(locale).includes(L2_URLS.notice[locale]), `${locale}: links TMB's notice in its own language`);
    assert.ok(body(locale).includes(`${shortDate(L2_CLOSURE_AS_OF, locale)}`), `${locale}: the check date`);
  }
  assert.equal(L2_CLOSURE_GUIDE.verifiedAt, L2_CLOSURE_AS_OF);
  assert.equal(L2_CLOSURE_VERIFIED, L2_CLOSURE_AS_OF);
  // A filled reopening's page goes in first.
  assert.equal(l2Sources({ ...BACK, url: "https://www.tmb.cat/ca/-/l2-servei-restablert" })[0]?.url, "https://www.tmb.cat/ca/-/l2-servei-restablert");
});

test("internal links stay in their language, end in a slash and point at a published path; none is bold", () => {
  for (const locale of LOCALES) {
    for (const blocks of [L2_CLOSURE_GUIDE.editions[locale].blocks, buildL2Body(locale, BACK)]) {
      const raw = JSON.stringify(blocks);
      for (const [, href] of raw.matchAll(/\]\((\/[^)]*)\)/g)) {
        assert.ok(href!.startsWith(`/${locale}/`), `${locale} links to ${href}`);
        assert.ok(href!.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href!), `${locale}: ${href} is not a published path`);
      }
      assert.doesNotMatch(raw, /\*\*\[[^\]]+\]\([^)]+\)\*\*/, locale);
    }
    for (const key of ["hours", "transport", "strike11n"] as const) {
      assert.ok(json(locale).includes(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale}: links ${key}`);
    }
    const r1 = locale === "en" ? rodaliesHubPath("en") : linePath(locale, "R1");
    assert.ok(json(locale).includes(`](${r1})`), `${locale}: links the R1 status`);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = L2_CLOSURE_GUIDE.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("no new photograph: the hero is the metro hours guide's file with its exact alt and caption", () => {
  assert.equal(L2_CLOSURE_GUIDE.heroKey, HOURS.heroKey);
  assert.ok(L2_CLOSURE_GUIDE.heroKey && IMAGE_BY_KEY.has(L2_CLOSURE_GUIDE.heroKey));
  assert.deepEqual(L2_CLOSURE_GUIDE.heroAlt, HOURS.heroAlt);
  assert.deepEqual(L2_CLOSURE_GUIDE.heroCaption, HOURS.heroCaption);
  assert.equal(L2_CLOSURE_GUIDE.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!L2_CLOSURE_GUIDE.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("an FAQ in the searchers' words, answered in plain text", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Fins quan està tallada l'L2?", "Quines estacions de l'L2 estan tancades?", "Cada quant passa el bus llançadora de l'L2?", "Cal validar el bitllet al bus llançadora?", "Quina alternativa hi ha a l'L2 a Verneda, Artigues i Sant Roc?"],
    es: ["¿Hasta cuándo está cortada la L2?", "¿Qué estaciones de la L2 están cerradas?", "¿Cada cuánto pasa el bus lanzadera de la L2?", "¿Hay que validar el billete en el bus lanzadera?", "¿Qué alternativa hay a la L2 en Verneda, Artigues y Sant Roc?"],
    en: ["When does the L2 reopen between La Pau and Gorg?", "Which L2 stations are closed?", "Is the Barcelona metro L2 running?", "How often does the L2 shuttle bus run?", "What is the alternative to the L2 at Verneda, Artigues and Sant Roc?"],
  };
  for (const locale of LOCALES) {
    const block = L2_CLOSURE_GUIDE.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    for (const question of questions[locale]) assert.ok(block.items.some((item) => item.question === question), `${locale}: ${question}`);
    for (const item of block.items) {
      assert.ok(item.answer.length > 20, `${locale}: ${item.question} has an empty answer`);
      assert.doesNotMatch(item.answer, /\]\(|\*\*/, `${locale}: ${item.question} carries markdown`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Known answers: what TMB and the City Council published                     */
/* -------------------------------------------------------------------------- */

test("the dates: from Monday 2 November to the end of service on Thursday 3 December, trains back Friday 4 December at 5:00", () => {
  assert.deepEqual([L2_CLOSURE.from, L2_CLOSURE.until, L2_CLOSURE.back, L2_CLOSURE.backTime], ["2026-11-02", "2026-12-03", "2026-12-04", "5:00"]);
  assert.equal(weekdayIndex(L2_CLOSURE.from), 1);
  assert.equal(weekdayIndex(L2_CLOSURE.until), 4);
  assert.equal(L2_CLOSURE.back, addDays(L2_CLOSURE.until, 1), "the return is the day after the last closed day");
  const lead: Record<Locale, RegExp[]> = {
    ca: [/dilluns 2 de novembre/, /final del servei del \*\*dijous 3 de desembre de 2026\*\*/, /divendres 4 de desembre a les 5:00/],
    es: [/lunes 2 de noviembre/, /final del servicio del \*\*jueves 3 de diciembre de 2026\*\*/, /viernes 4 de diciembre a las 5:00/],
    en: [/Monday 2 November/, /end of service on \*\*Thursday 3 December 2026\*\*/, /Friday 4 December at 5:00/],
  };
  for (const locale of LOCALES) {
    const first = (L2_CLOSURE_GUIDE.editions[locale].blocks[0] as { text: string }).text;
    for (const pattern of lead[locale]) assert.match(first, pattern, locale);
  }
});

test("Barcelona in December says the same days and cites the same council note", () => {
  assert.equal(L2_WORKS.until, L2_CLOSURE.until, "barcelona-december.ts L2_WORKS.until and l2-closure.ts disagree: move both");
  assert.equal(L2_WORKS.back, L2_CLOSURE.back, "barcelona-december.ts L2_WORKS.back and l2-closure.ts disagree: move both");
  assert.equal(L2_WORKS.url, L2_URLS.council);
  assert.equal(L2_WORKS.published, L2_CLOSURE.announced);
});

test("the stations, the shuttle stops and the intervals are TMB's notice's", () => {
  assert.deepEqual([...CLOSED_STATIONS], ["Verneda", "Artigues | Sant Adrià", "Sant Roc"]);
  assert.deepEqual(SHUTTLE.towardsGorg.map((s) => `${s.station}: ${s.code} - ${s.name}`), [
    "La Pau: 3343 - Metro La Pau",
    "Verneda: 3945 - Arc de Sant Adrià - Tanatori",
    "Artigues | Sant Adrià: 3340 - Sant Adrià Centre",
    "Sant Roc: 8411 - Marques de Montroig, 221",
    "Gorg: 8691 - Metro Gorg",
  ]);
  assert.deepEqual(SHUTTLE.towardsLaPau.map((s) => `${s.station}: ${s.code} - ${s.name}`), [
    "Gorg: 8691 - Metro Gorg",
    "Sant Roc: 8689 - Sant Roc",
    "Artigues | Sant Adrià: 329 - Sant Adrià Centre",
    "Verneda: 3944 - La Verneda - Arc de Sant Adrià - Tanatori",
    "La Pau: 9363 - La Pau",
  ]);
  assert.deepEqual(SHUTTLE.minutes, { weekdays: [3, 5], saturdays: [5, 9], holidays: [7, 11] });
  assert.equal(SHUTTLE.line, "M2");
  for (const locale of LOCALES) {
    const tables = L2_CLOSURE_GUIDE.editions[locale].blocks.filter((b) => b.type === "table") as { rows: string[][] }[];
    assert.equal(tables.length, 2, `${locale}: stops and intervals`);
    const stops = tables[0]!.rows;
    assert.deepEqual(stops.map((r) => r[0]), SHUTTLE.towardsGorg.map((s) => s.station), locale);
    for (const s of [...SHUTTLE.towardsGorg, ...SHUTTLE.towardsLaPau]) assert.ok(stops.flat().some((cell) => cell.includes(`${s.code} - ${s.name}`)), `${locale}: stop ${s.code}`);
    assert.deepEqual(tables[1]!.rows.map((r) => r[1]!.match(/\d+/g)?.join("-")), ["3-5", "5-9", "7-11"], locale);
  }
});

test("the shuttle: the metro's timetable and no validation, never 'free'", () => {
  const said: Record<Locale, RegExp[]> = {
    ca: [/mateix horari que el metro/, /No cal validar el bitllet/],
    es: [/mismo horario que el metro/, /No hace falta validar el billete/],
    en: [/same timetable as the metro/, /do not need to validate your ticket/],
  };
  for (const locale of LOCALES) {
    for (const pattern of said[locale]) assert.match(body(locale), pattern, locale);
    assert.doesNotMatch(body(locale), /gratu[iï]t|gratis|\bfree\b|sense cost|sin coste/i, `${locale}: TMB says "no validation", not "free"`);
  }
});

test("the alternatives are the ones TMB and the City Council name", () => {
  assert.deepEqual([...TUSGSAL_LINES], ["B25", "M26", "M30", "N11"]);
  assert.deepEqual([...TRAM_LINES], ["T4", "T5", "T6"]);
  assert.deepEqual([...H10_CANCELLED_NAMED], ["Barri Artigues", "La Salut / Congrés"]);
  for (const locale of LOCALES) {
    const b = body(locale);
    for (const name of ["L10 Nord", "La Sagrera", "L1", "L5", "Clot", "L4", "H10", "R1", "Badalona Pompeu Fabra", ...TUSGSAL_LINES, ...TRAM_LINES, ...H10_CANCELLED_NAMED, "Alfons XIII"]) {
      assert.ok(b.includes(name), `${locale}: ${name}`);
    }
    // Lines no official text proposes for this closure.
    assert.doesNotMatch(b, /\bL9\b|\bL3\b|\bR2\b|\bV27\b|Aerobús/, `${locale}: an alternative no notice gives`);
  }
});

test("the 3-or-4-December section quotes TMB and the council, and says they agree", () => {
  const said: Record<Locale, RegExp[]> = {
    ca: [/«fins a la finalització del servei del 3 de desembre de 2026»/, /«fins al 3 de desembre inclòs»/, /«Es preveu la normalització de la circulació de trens el divendres 4 de desembre a les 5 de la matinada»/, /no es contradiuen/],
    es: [/«hasta la finalización del servicio del 3 de diciembre de 2026»/, /«hasta el 3 de diciembre incluido»/, /no se contradicen/],
    en: [/"until the end of service on December 3, 2026"/, /"through December 3, inclusive"/, /do not contradict each other/],
  };
  for (const locale of LOCALES) {
    for (const pattern of said[locale]) assert.match(body(locale), pattern, locale);
    for (const url of [L2_URLS.notice[locale], L2_URLS.metroStatus, L2_URLS.tmbPress, L2_URLS.council]) assert.ok(json(locale).includes(url), `${locale}: ${url}`);
  }
});

test("press-only and unpublished claims are never printed", () => {
  for (const locale of LOCALES) {
    const b = body(locale);
    // The press's cause (a crack under the Besòs) is in no official text.
    assert.doesNotMatch(b, /esquerda|fissura|grieta|fisura|crack|Besòs|filtraci/i, `${locale}: the press's cause`);
    // The only clock time any source gives is the return at 5:00.
    for (const [time] of b.matchAll(/\b\d{1,2}[:.]\d{2}\b/g)) assert.equal(time, "5:00", `${locale}: ${time} is not a published time`);
    // TMB's phone hours differ between its own language versions: none printed.
    assert.doesNotMatch(b, /de 8 a 21|de 7 a 21|7 to 21|8 to 21/, `${locale}: phone hours`);
    assert.ok(b.includes("900 701 149"), `${locale}: TMB's information line`);
    // No journey times, no accessibility claim.
    assert.doesNotMatch(b, /\d+ minuts? de trajecte|\d+ minutos de trayecto|\d+-minute (?:ride|journey)|accessib|adaptad/i, locale);
  }
});

test("the general strike day the tips mention falls inside the closure", () => {
  assert.ok(L2_CLOSURE.from <= STRIKE_11N_DATE && STRIKE_11N_DATE <= L2_CLOSURE.until, "the 11N tip is no longer true: drop it");
});

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, Record<string, string>> = {
    ca: { octubre: "10", novembre: "11", desembre: "12" },
    es: { octubre: "10", noviembre: "11", diciembre: "12" },
    en: { october: "10", november: "11", december: "12" },
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const texts = [body(locale), text(buildL2Body(locale, BACK)), l2ClosureMention(locale, "hours"), l2ClosureMention(locale, "tickets"), l2ClosureMention(locale, "hours", BACK)];
    for (const b of texts.map((t) => t.toLowerCase())) {
      const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (\\d{1,2})(?![\\d:])(?: de | d'| )(${Object.keys(months[locale]).join("|")})`, "gu");
      for (const match of b.matchAll(pattern)) {
        const iso = `2026-${months[locale][match[3]!]!}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 40, `only ${checked} weekday mentions checked`);
});

test("the server HTML does not depend on the clock: no clock read, same body on any day", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/l2-closure.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia\(/, "the module reads the clock");
  const stored = Object.fromEntries(LOCALES.map((l) => [l, JSON.stringify(L2_CLOSURE_GUIDE.editions[l].blocks)]));
  for (const now of ["2026-11-02T04:00:00Z", "2026-12-04T05:00:00Z", "2027-06-01T10:00:00Z"]) {
    mock.timers.enable({ apis: ["Date"], now: Date.parse(now) });
    try {
      for (const locale of LOCALES) {
        assert.equal(JSON.stringify(buildL2Body(locale)), stored[locale], `${locale} at ${now}`);
        assert.equal(l2SeoTitle(locale), L2_CLOSURE_GUIDE.editions[locale].seoTitle, `${locale} title at ${now}`);
      }
    } finally {
      mock.timers.reset();
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The dated state                                                            */
/* -------------------------------------------------------------------------- */

test("filling L2_REOPENED switches the title, description, lead, FAQ and the other guides' sentence", () => {
  assert.equal(l2Phase(null), "closed");
  assert.equal(l2Phase(BACK), "reopened");
  const back: Record<Locale, RegExp> = { ca: /torna a circular entre \*\*La Pau i Gorg\*\* des del \*\*divendres 4 de desembre de 2026\*\*/, es: /vuelve a circular entre \*\*La Pau y Gorg\*\* desde el \*\*viernes 4 de diciembre de 2026\*\*/, en: /running again between \*\*La Pau and Gorg\*\* from \*\*Friday 4 December 2026\*\*/ };
  const stillClosed: Record<Locale, RegExp> = {
    ca: /no circula|es queden sense metro|Fins quan està|preveu que/i,
    es: /no circula|se quedan sin metro|Hasta cuándo está|prevé que/i,
    en: /is not running|have no metro|When does the L2 reopen|expects trains/i,
  };
  for (const locale of LOCALES) {
    const blocks = buildL2Body(locale, BACK);
    assert.match((blocks[0] as { text: string }).text, back[locale], locale);
    assert.doesNotMatch(text(blocks), stillClosed[locale], `${locale}: the reopened page still speaks of the closure as current`);
    assert.ok(JSON.stringify(blocks).includes(BACK.url), `${locale}: the reopening is sourced`);
    assert.doesNotMatch(l2ClosureMention(locale, "hours", BACK), /no hi ha metro|no hay metro|there are no trains/, locale);
    assert.notEqual(l2ClosureMention(locale, "tickets", BACK), l2ClosureMention(locale, "tickets"), locale);
    const faqBlock = blocks.find((b) => b.type === "faq") as { items: { question: string }[] };
    assert.ok(faqBlock.items.length >= 3, locale);
  }
  // An early reopening: the closure is said to end the day before.
  const early: L2Reopening = { ...BACK, date: "2026-12-01", read: "2026-12-01" };
  assert.match(text(buildL2Body("en", early)), /to Monday 30 November 2026/);
});

test("reopeningProblems accepts an official page and refuses bad dates, other hosts and tracking", () => {
  assert.deepEqual(reopeningProblems(BACK), []);
  assert.deepEqual(reopeningProblems({ ...BACK, url: L2_URLS.council }), []);
  assert.ok(reopeningProblems({ ...BACK, url: "https://www.lavanguardia.com/l2" }).some((p) => p.includes("not TMB's")));
  assert.ok(reopeningProblems({ ...BACK, url: "http://www.tmb.cat/x" }).some((p) => p.includes("https")));
  assert.ok(reopeningProblems({ ...BACK, url: "https://www.tmb.cat/x?utm_source=a" }).some((p) => p.includes("tracking")));
  assert.ok(reopeningProblems({ ...BACK, date: "2026-02-31" }).length > 0);
  assert.ok(reopeningProblems({ ...BACK, date: "2026-10-30" }).some((p) => p.includes("not after")));
  assert.ok(reopeningProblems({ ...BACK, read: "2026-12-01" }).some((p) => p.includes("before the reopening")));
});

test("staleness: the page is stale from the expected return day while L2_REOPENED is empty", () => {
  assert.equal(isStale("2026-11-03", null), false);
  assert.equal(isStale(L2_CLOSURE.until, null), false);
  assert.equal(isStale(L2_CLOSURE.back, null), true);
  assert.equal(isStale("2027-01-10", null), true);
  assert.equal(isStale(L2_CLOSURE.back, BACK), false);
  // An extension moves the day the page goes stale.
  assert.equal(isStale(L2_CLOSURE.back, null, { back: "2026-12-12" }), false);
});

test("the page says the L2 is back once the closure is over (fill L2_REOPENED from TMB, move L2_CLOSURE_AS_OF, publish ?only=l2-closure, ?only=hours, ?only=cards)", () => {
  const today = madridDate(new Date());
  assert.ok(L2_CLOSURE_AS_OF <= today, `L2_CLOSURE_AS_OF (${L2_CLOSURE_AS_OF}) is in the future`);
  assert.equal(
    isStale(today),
    false,
    `On ${today} the L2 closure was due to end (last day ${L2_CLOSURE.until}) but L2_REOPENED is still null. Check TMB (${L2_URLS.notice.ca}, ${L2_URLS.metroStatus}): if the trains are back, fill L2_REOPENED in src/lib/content/batch02/l2-closure.ts with the day, the official URL and the read date; if TMB extended the works, move L2_CLOSURE and barcelona-december.ts L2_WORKS. Then move L2_CLOSURE_AS_OF and publish ?only=l2-closure, ?only=hours and ?only=cards.`,
  );
  if (L2_REOPENED) {
    assert.deepEqual(reopeningProblems(L2_REOPENED), []);
    assert.ok(L2_CLOSURE_AS_OF >= L2_REOPENED.read, "move L2_CLOSURE_AS_OF to the day the reopening was read");
  }
});

/* -------------------------------------------------------------------------- */
/* Links into the page and the publish route                                  */
/* -------------------------------------------------------------------------- */

test("the metro hours guide and the transport cards guide each carry the sentence once, in the body", () => {
  for (const locale of LOCALES) {
    const here = `](/${locale}/${B2_PATHS.l2Closure[locale]}/)`;
    const hours = HOURS.editions[locale].blocks;
    const sentence = l2ClosureMention(locale, "hours");
    const tips = hours.filter((b) => b.type === "list").map((b) => (b as { items: string[] }).items);
    assert.equal(tips.flat().filter((item) => item === sentence).length, 1, `hours/${locale}: the sentence`);
    // Once in the tips and once in the related rail.
    assert.equal(JSON.stringify(hours).split(here).length - 1, 2, `hours/${locale}`);
    const related = hours[hours.length - 1] as { items: string[] };
    assert.ok(related.items.some((item) => item.includes(here)), `hours/${locale}: the related rail`);
    const cards = CARDS.editions[locale].blocks;
    assert.equal(JSON.stringify(cards).split(here).length - 1, 1, `cards/${locale}`);
    assert.ok(cards.some((b) => b.type === "paragraph" && (b as { text: string }).text === l2ClosureMention(locale, "tickets")), `cards/${locale}: the sentence`);
    // Body only: titles and snippets are not touched.
    for (const edition of [HOURS.editions[locale], CARDS.editions[locale]]) {
      for (const field of [edition.title, edition.seoTitle, edition.seoDescription, edition.excerpt]) assert.ok(!/La Pau|Gorg/.test(field), `${locale}: ${field}`);
    }
    // The sentence carries the dates of the closure.
    assert.ok(sentence.includes(shortDate(L2_CLOSURE.until, locale)), `${locale}: the last day in the hours sentence`);
  }
});

test("the publish route has an l2-closure group, after the last dated group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ L2_CLOSURE_GUIDE \} from "@\/lib\/content\/batch02\/l2-closure";/);
  assert.match(route, /wants\("l2-closure"\)\) published\.push\(await publishB2Article\(L2_CLOSURE_GUIDE\)\)/);
  assert.ok(route.indexOf('wants("l2-closure")') > route.indexOf('wants("reis-2027-links")'));
  // The hours and cards groups exist for the two pages that gained the sentence.
  assert.match(route, /wants\("hours"\)\) published\.push\(await publishB2Article\(HOURS\)\)/);
  assert.match(route, /wants\("cards"\)\) published\.push\(await publishB2Article\(CARDS\)\)/);
});
