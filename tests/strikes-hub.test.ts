import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { HOURS } from "../src/lib/content/batch02/hours.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import {
  STRIKES,
  STRIKES_AS_OF,
  STRIKES_GUIDE,
  STRIKES_META,
  STRIKES_VERIFIED,
  STRIKE_URLS,
  buildStrikesBody,
  isUpcoming,
  lastDay,
  madridDate,
  pastStrikes,
  staleStrikes,
  strikeDays,
  strikesDescription,
  upcomingStrikes,
  type Strike,
} from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubPath as rodaliesHubPath } from "../src/lib/programmatic/rodalies/paths.ts";

/**
 * The strikes hub (27 Oct 2026): one evergreen page per language, a dated
 * section per strike, upcoming vs past decided by STRIKES_AS_OF only.
 *
 * Besides the structural checks every B2 page gets, this pins what the page
 * must say (the official figures read on 27 Oct 2026) and what it must never
 * say (press-only claims, an 11N percentage nobody has published), and it
 * fails the day after a listed strike if the module was not brought up to date.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const json = (locale: Locale) => JSON.stringify(STRIKES_GUIDE.editions[locale].blocks);
const byId = (id: string) => {
  const strike = STRIKES.find((s) => s.id === id);
  assert.ok(strike, id);
  return strike;
};

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  // The Rodalies hub is a code route (app/(public)/[locale]/rodalies), served in all three languages.
  ...LOCALES.map((locale) => rodaliesHubPath(locale)),
]);

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the evergreen registry paths", () => {
  for (const locale of LOCALES) {
    const edition = STRIKES_GUIDE.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1000, `${locale} is thin`);
    assert.equal(edition.path, B2_PATHS.strikes[locale]);
    assert.equal(edition.path, STRIKES_META[locale].path);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
  assert.deepEqual(B2_PATHS.strikes, {
    ca: "guies/vaga-avui-catalunya",
    es: "guias/huelga-hoy-cataluna",
    en: "guides/strike-barcelona-catalonia-today",
  });
});

test("the paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === B2_PATHS.strikes[locale]).length, 1, locale);
  }
});

test("titles fit in 60 characters in the searched words; descriptions fit in 155 and name the next strikes", () => {
  const words: Record<Locale, RegExp> = {
    ca: /^Vaga avui a Catalunya: què funciona/,
    es: /^Huelga hoy en Cataluña: qué funciona/,
    en: /^Strike in Barcelona and Catalonia today: what runs/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = STRIKES_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200);
    assert.match(seoTitle, words[locale]);
    assert.match(title, words[locale]);
    assert.equal(seoDescription, strikesDescription(locale));
    // The general strike is upcoming on STRIKES_AS_OF, so it must be named.
    const general = upcomingStrikes(STRIKES_AS_OF).find((s) => s.scope === "general");
    if (general) assert.ok(seoDescription.includes(general.label[locale]), `${locale}: ${seoDescription}`);
  }
});

test("the description stays within 155 characters on every day the list can be in", () => {
  const days = new Set<string>(["2026-01-01", "2030-01-01"]);
  for (const strike of STRIKES) {
    for (const day of strike.dates) days.add(day);
    const after = new Date(`${lastDay(strike)}T12:00:00Z`);
    after.setUTCDate(after.getUTCDate() + 1);
    days.add(after.toISOString().slice(0, 10));
  }
  for (const day of days) {
    for (const locale of LOCALES) {
      const description = strikesDescription(locale, day);
      assert.ok(description.length > 60 && description.length <= 155, `${day}/${locale}: ${description.length} ${description}`);
    }
  }
  // With nothing upcoming it falls back to the evergreen line.
  assert.doesNotMatch(strikesDescription("ca", "2030-01-01"), /Properes vagues/);
});

test("sources are https, untracked and cover every strike; the reader sees the check date", () => {
  const urls = STRIKES_GUIDE.sources.map((source) => source.url);
  assert.ok(STRIKES_GUIDE.sources.length >= 15, `${STRIKES_GUIDE.sources.length} sources`);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
    assert.ok(!/aerobusbcn/i.test(url), url);
  }
  for (const strike of STRIKES) {
    assert.ok(strike.sources.length > 0, strike.id);
    for (const source of strike.sources) assert.ok(urls.includes(source.url), `${strike.id}: ${source.url} not in the article's sources`);
  }
  // The legal basis is cited from the BOE and the DOGC only.
  for (const url of [STRIKE_URLS.constitution, STRIKE_URLS.rdl17]) assert.match(url, /^https:\/\/www\.boe\.es\//);
  for (const url of [STRIKE_URLS.emt201, STRIKE_URLS.emt38, STRIKE_URLS.decret120]) assert.match(url, /^https:\/\/portaljuridic\.gencat\.cat\/eli\//);
  assert.equal(STRIKES_GUIDE.verifiedAt, STRIKES_VERIFIED);
  const checked: Record<Locale, RegExp> = { ca: /27 d'octubre de 2026/, es: /27 de octubre de 2026/, en: /27 October 2026/ };
  for (const locale of LOCALES) {
    assert.match(text(STRIKES_GUIDE.editions[locale].blocks), checked[locale], locale);
    assert.match(text(STRIKES_GUIDE.editions[locale].blocks), /verificaci|verified/i, locale);
  }
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    const body = json(locale);
    assert.ok(!/aerobusbcn/i.test(body));
    let internal = 0;
    for (const match of body.matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
      internal += 1;
    }
    assert.ok(internal >= 6, `${locale}: only ${internal} internal links`);
    for (const match of body.matchAll(/\]\((https?:[^)]*)\)/g)) assert.match(match[1] ?? "", /^https:\/\//);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = STRIKES_GUIDE.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("no new photograph: the hero is the trains feature's file with its exact alt and caption", () => {
  assert.ok(STRIKES_GUIDE.heroKey && IMAGE_BY_KEY.has(STRIKES_GUIDE.heroKey));
  assert.equal(STRIKES_GUIDE.heroKey, TRAINS.heroKey);
  assert.deepEqual(STRIKES_GUIDE.heroAlt, TRAINS.heroAlt, "alt differs from the existing media row");
  assert.deepEqual(STRIKES_GUIDE.heroCaption, TRAINS.heroCaption, "caption differs from the existing media row");
  assert.equal(STRIKES_GUIDE.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!STRIKES_GUIDE.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* The data model                                                             */
/* -------------------------------------------------------------------------- */

test("every strike entry is complete in three languages, with ascending real dates", () => {
  const ids = STRIKES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id");
  for (const strike of STRIKES) {
    assert.match(strike.id, /^[a-z0-9-]+$/);
    assert.ok(strike.dates.length > 0, strike.id);
    for (const day of strike.dates) {
      assert.match(day, /^\d{4}-\d{2}-\d{2}$/, `${strike.id}: ${day}`);
      assert.equal(new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10), day, `${strike.id}: ${day} is not a date`);
    }
    assert.deepEqual([...strike.dates].sort(), strike.dates, `${strike.id}: dates out of order`);
    assert.equal(new Set(strike.dates).size, strike.dates.length, `${strike.id}: repeated date`);
    for (const locale of LOCALES) {
      for (const field of [strike.title, strike.short, strike.label, strike.minimumServices.msShort, strike.minimumServices.text]) {
        assert.ok((field[locale] ?? "").length > 5, `${strike.id}/${locale}`);
      }
      assert.ok(strike.facts[locale].length >= 2, `${strike.id}/${locale}: facts`);
      assert.ok(Array.isArray(strike.advice[locale]), `${strike.id}/${locale}: advice`);
    }
    for (const source of strike.sources) assert.ok(source.name && source.publisher, strike.id);
  }
});

test("a strike can only be 'pending' while it is upcoming", () => {
  for (const strike of pastStrikes(STRIKES_AS_OF)) {
    assert.notEqual(
      strike.minimumServices.status,
      "pending",
      `${strike.id} is past on ${STRIKES_AS_OF} but its minimum services are still 'pending': record what was published, or set "none" and say why`,
    );
  }
});

test("upcoming and past are decided by the as-of date: on the last day it is upcoming, the day after it is past", () => {
  const renfe = byId("vaga-renfe-2026-10-29");
  const ouigo = byId("vaga-ouigo-2026-10-30");
  const general = byId("vaga-general-2026-11-11");
  assert.equal(isUpcoming(renfe, "2026-10-28"), true);
  assert.equal(isUpcoming(renfe, "2026-10-29"), true);
  assert.equal(isUpcoming(renfe, "2026-10-30"), false);
  // A strike over two separate days stays upcoming between them.
  assert.equal(isUpcoming(ouigo, "2026-10-31"), true);
  assert.equal(isUpcoming(ouigo, "2026-11-02"), true);
  assert.equal(isUpcoming(ouigo, "2026-11-03"), false);
  assert.equal(isUpcoming(general, "2026-11-11"), true);
  assert.equal(isUpcoming(general, "2026-11-12"), false);
  assert.deepEqual(upcomingStrikes("2026-10-27").map((s) => s.id), ["vaga-renfe-2026-10-29", "vaga-ouigo-2026-10-30", "vaga-general-2026-11-11"]);
  assert.deepEqual(upcomingStrikes("2026-10-30").map((s) => s.id), ["vaga-ouigo-2026-10-30", "vaga-general-2026-11-11"]);
  assert.deepEqual(pastStrikes("2026-11-12").map((s) => s.id), ["vaga-general-2026-11-11", "vaga-ouigo-2026-10-30", "vaga-renfe-2026-10-29"]);
  for (const day of ["2026-10-27", "2026-11-05", "2026-12-01"]) {
    assert.equal(upcomingStrikes(day).length + pastStrikes(day).length, STRIKES.length, day);
  }
});

test("'today' is the civil date in Catalonia, across midnight and both clock offsets", () => {
  // CET (+1) after 25 Oct 2026.
  assert.equal(madridDate(new Date("2026-10-29T22:59:00Z")), "2026-10-29");
  assert.equal(madridDate(new Date("2026-10-29T23:00:00Z")), "2026-10-30");
  // CEST (+2) in summer.
  assert.equal(madridDate(new Date("2026-07-01T21:59:00Z")), "2026-07-01");
  assert.equal(madridDate(new Date("2026-07-01T22:00:00Z")), "2026-07-02");
  // The night the clocks went back.
  assert.equal(madridDate(new Date("2026-10-24T22:30:00Z")), "2026-10-25");
});

test("staleness: a strike shown as upcoming is stale only from the day after its last day", () => {
  assert.deepEqual(staleStrikes("2026-10-29", "2026-10-27").map((s) => s.id), []);
  assert.deepEqual(staleStrikes("2026-10-30", "2026-10-27").map((s) => s.id), ["vaga-renfe-2026-10-29"]);
  assert.deepEqual(staleStrikes("2026-11-03", "2026-10-27").map((s) => s.id), ["vaga-renfe-2026-10-29", "vaga-ouigo-2026-10-30"]);
  // Moving the as-of date clears it.
  assert.deepEqual(staleStrikes("2026-10-30", "2026-10-30").map((s) => s.id), []);
});

test("no listed strike is shown as upcoming after its last day (move STRIKES_AS_OF and republish ?only=strikes)", () => {
  const today = madridDate(new Date());
  assert.ok(STRIKES_AS_OF <= today, `STRIKES_AS_OF (${STRIKES_AS_OF}) is in the future`);
  const stale = staleStrikes(today);
  assert.deepEqual(
    stale.map((s) => s.id),
    [],
    `On ${today} these strikes are over but the page still lists them as upcoming: ${stale.map((s) => `${s.id} (last day ${lastDay(s)})`).join(", ")}. Update src/lib/content/batch02/strikes.ts (STRIKES_AS_OF, the minimum-services record) and publish ?only=strikes.`,
  );
});

test("the page is deterministic: no clock in the module, same output on every call", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/strikes.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock");
  for (const locale of LOCALES) {
    assert.equal(JSON.stringify(buildStrikesBody(locale)), json(locale), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

const headings = (blocks: Block[]) =>
  blocks.filter((b) => b.type === "heading") as { type: "heading"; level: number; text: string; id?: string }[];

test("upcoming strikes come first, answer first: the lead names each one and each has a dated section", () => {
  for (const locale of LOCALES) {
    const blocks = STRIKES_GUIDE.editions[locale].blocks;
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    assert.equal(blocks[1]?.type, "keyFacts");
    const leadText = text(blocks.slice(0, 1));
    const h2 = headings(blocks).filter((h) => h.level === 2);
    for (const strike of upcomingStrikes(STRIKES_AS_OF)) {
      const days = strikeDays(strike, locale);
      assert.ok(leadText.includes(days), `${locale}: lead misses ${days}`);
      const section = h2.find((h) => h.id === strike.id);
      assert.ok(section, `${locale}: no section for ${strike.id}`);
      assert.ok(section.text.toLowerCase().startsWith(days.toLowerCase()), `${locale}: ${section.text}`);
    }
    // Any upcoming strike still waiting for minimum services is flagged in the lead.
    const waiting = upcomingStrikes(STRIKES_AS_OF).some((s) => s.minimumServices.status === "pending");
    assert.equal(/encara no s'han publicat|aún no se han publicado|not been published yet/.test(leadText), waiting, locale);
    // Dated sections come before the evergreen guidance.
    const firstStrike = h2.findIndex((h) => h.id === upcomingStrikes(STRIKES_AS_OF)[0]?.id);
    const how = h2.findIndex((h) => /serveis mínims a Catalunya|servicios mínimos en Cataluña|minimum services work/.test(h.text));
    assert.ok(firstStrike >= 0 && firstStrike < how, locale);
    // A "past strikes" section exists exactly when some listed strike has ended.
    const anyPast = pastStrikes(STRIKES_AS_OF).length > 0;
    assert.equal(h2.some((h) => /Vagues anteriors|Huelgas anteriores|Past strikes/.test(h.text)), anyPast, `${locale}: past section`);
  }
});

test("after the last strike the page renders every strike as past, with a 'none upcoming' lead", () => {
  for (const locale of LOCALES) {
    const blocks = buildStrikesBody(locale, "2026-12-01");
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    assert.match(text(blocks.slice(0, 1)), /No hi ha cap vaga anunciada|No hay ninguna huelga anunciada|No strike affecting Catalonia/, locale);
    assert.ok(!blocks.some((b) => b.type === "keyFacts"), locale);
    const all = headings(blocks);
    const past = all.findIndex((h) => h.level === 2 && /Vagues anteriors|Huelgas anteriores|Past strikes/.test(h.text));
    assert.ok(past >= 0, locale);
    const pastIds = all.filter((h) => h.level === 3 && h.id).map((h) => h.id);
    assert.deepEqual(pastIds, ["vaga-general-2026-11-11", "vaga-ouigo-2026-10-30", "vaga-renfe-2026-10-29"], locale);
    // Past strikes carry no advice for the day.
    assert.ok(!all.some((h) => /Què cal fer el|Qué hacer el|What to do on/.test(h.text)), locale);
  }
  // Half way: Renfe past, the other two upcoming.
  const mid = buildStrikesBody("en", "2026-10-30");
  assert.ok(headings(mid).some((h) => h.level === 3 && h.id === "vaga-renfe-2026-10-29"));
  assert.ok(headings(mid).some((h) => h.level === 2 && h.id === "vaga-general-2026-11-11"));
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
    for (const asOf of [STRIKES_AS_OF, "2026-12-01"]) {
      const body = text(buildStrikesBody(locale, asOf)).toLowerCase();
      const pattern = new RegExp(`(${weekdays[locale].join("|")}),? (\\d{1,2}) (?:d'|de )?(${months[locale].join("|")})`, "gu");
      for (const match of body.matchAll(pattern)) {
        const year = body.slice(match.index, match.index + 80).match(/\b(20\d{2})\b/)?.[1] ?? STRIKES_AS_OF.slice(0, 4);
        const month = months[locale].indexOf(match[3]!) + 1;
        const iso = `${year}-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}" (${iso})`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 40, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* Known answers read on 27 Oct 2026, and what must never be printed          */
/* -------------------------------------------------------------------------- */

test("known answers: the dates and the official figures read on 27 October 2026", () => {
  const renfe = byId("vaga-renfe-2026-10-29");
  const ouigo = byId("vaga-ouigo-2026-10-30");
  const general = byId("vaga-general-2026-11-11");
  assert.deepEqual(renfe.dates, ["2026-10-29"]);
  assert.equal(weekdayIndex("2026-10-29"), 4); // Thursday
  assert.deepEqual(ouigo.dates, ["2026-10-30", "2026-11-02"]);
  assert.deepEqual(ouigo.dates.map(weekdayIndex), [5, 1]); // Friday, Monday
  assert.deepEqual(general.dates, ["2026-11-11"]);
  assert.equal(weekdayIndex("2026-11-11"), 3); // Wednesday
  assert.equal(general.scope, "general");
  assert.equal(renfe.minimumServices.status, "published");
  assert.equal(ouigo.minimumServices.status, "published");
  for (const locale of LOCALES) {
    // Rodalies' notice: 66% peak, 33% rest of day; SEMAF: 00:01 to 23:59.
    assert.match(renfe.minimumServices.text[locale], /66%[^.]*33%/, locale);
    assert.ok(renfe.minimumServices.text[locale].includes(`](${STRIKE_URLS.rodalies29})`), locale);
    assert.match(renfe.facts[locale].join(" "), /00[.:]01[^.]*23[.:]59/, locale);
    assert.match(renfe.facts[locale].join(" "), /16 (d'octubre|de octubre|October) (de )?2026/, locale);
    // Ouigo: 71% approved by the Ministry, 55 of 77 trains.
    assert.match(ouigo.minimumServices.text[locale], /71%/, locale);
    assert.match(ouigo.minimumServices.text[locale], /55[^.]*77/, locale);
    assert.match(ouigo.minimumServices.text[locale], /Minist/, locale);
    // 11N: CCOO and UGT, registered per CCOO on 19 Oct, 24 hours from 0 h.
    const facts = general.facts[locale].join(" ");
    for (const name of ["CCOO", "UGT", "CGT", "CNT", "USTEC·STEs", "CCOO de Catalunya", "UGT de Catalunya", "CGT Catalunya"]) assert.ok(facts.includes(name), `${locale}: ${name}`);
    assert.match(facts, /19 (d'octubre|de octubre|October) (de )?2026/, locale);
    assert.match(facts, /24 (hores|horas|hours)/, locale);
  }
});

test("minimum-services text matches its status: 'pending' says so, 'published' gives figures and the official link", () => {
  for (const strike of STRIKES) {
    for (const locale of LOCALES) {
      const ms = strike.minimumServices.text[locale];
      if (strike.minimumServices.status === "pending") {
        assert.match(ms, /Encara no s'han publicat|Aún no se han publicado|Not published yet/, `${strike.id}/${locale}`);
        assert.doesNotMatch(ms, /\d+\s?%/, `${strike.id}/${locale}: a pending strike carries a percentage`);
      }
      if (strike.minimumServices.status === "published") {
        assert.match(ms, /\d+\s?%|plantilla|staff|servei habitual|servicio habitual|usual service/, `${strike.id}/${locale}: no figure`);
        assert.match(ms, /\]\(https:\/\//, `${strike.id}/${locale}: no link to the order or the operator's notice`);
        assert.doesNotMatch(ms, /Encara no s'han publicat|Aún no se han publicado|Not published yet/, `${strike.id}/${locale}`);
      }
    }
  }
});

test("the page never prints press-only claims or an 11 November percentage nobody has published", () => {
  // Once the 11N order is out and recorded as "published", its figures are
  // allowed; until then no sentence about 11 November may carry a percentage.
  const generalPending = byId("vaga-general-2026-11-11").minimumServices.status === "pending";
  for (const locale of LOCALES) {
    for (const asOf of [STRIKES_AS_OF, "2026-12-01"]) {
      const body = text(buildStrikesBody(locale, asOf));
      // Demonstration place and time were reported by the press only.
      assert.doesNotMatch(body, /Jardinets|17[.:]30/i, locale);
      // Rodalies' peak-hour bands were reported by the press only.
      assert.doesNotMatch(body, /6[.:]00 (a|to) 9[.:]30|17[.:]00 (a|to) 20[.:]30/, locale);
      // Further Ouigo dates (6 and 9 Nov, December) are press-only.
      assert.doesNotMatch(body, /\b(6|9) (de )?(novembre|noviembre|November)\b/, locale);
      // Never a minimum-service figure for the 11N strike.
      let about11 = 0;
      for (const piece of body.split(/\n|(?<=[.!?])\s+/)) {
        if (/\b11 (de |d')?(novembre|noviembre|November)\b|l'11\b|del 11\b|the 11th|11N/.test(piece)) {
          if (generalPending) assert.doesNotMatch(piece, /\d+\s?%/, `${locale}: "${piece}"`);
          about11 += 1;
        }
      }
      assert.ok(about11 >= 5, `${locale}/${asOf}: only ${about11} sentences about 11 November checked`);
      assert.doesNotMatch(body, /desconvocad|called off|cancel·lada la vaga|huelga cancelada/i, locale);
    }
  }
});

test("the 2024 figures are printed as last year's reference, with the order's own caveat", () => {
  const caveat = "altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català";
  for (const locale of LOCALES) {
    const body = text(STRIKES_GUIDE.editions[locale].blocks);
    assert.ok(body.includes(caveat), `${locale}: the DOGC wording is quoted`);
    assert.match(body, /EMT\/201\/2024/, locale);
    assert.match(body, /EMT\/38\/2024/, locale);
    assert.match(body, /Decret 120\/1995|Decree 120\/1995/, locale);
    assert.match(body, /28\.2/, locale);
    assert.match(body, /10\.2/, locale);
    // In the evergreen guidance (not the dated strike sections), every 85% is
    // the 2024 order's and says so.
    const blocks = STRIKES_GUIDE.editions[locale].blocks;
    const from = blocks.findIndex((b) => b.type === "heading" && /serveis mínims a Catalunya|servicios mínimos en Cataluña|minimum services work/.test((b as { text: string }).text));
    const to = blocks.findIndex((b) => b.type === "faq");
    assert.ok(from > 0 && to > from, locale);
    const evergreen = text(blocks.slice(from, to));
    const with85 = evergreen.split(/\n|(?<=[.!?])\s+/).filter((p) => /85\s?%/.test(p));
    assert.ok(with85.length >= 1, locale);
    for (const piece of with85) assert.match(piece, /2024/, `${locale}: "${piece}" gives 85% without saying it was 2024`);
  }
});

/* -------------------------------------------------------------------------- */
/* Links from the pages that already rank                                     */
/* -------------------------------------------------------------------------- */

test("the metro-hours and transport-passes guides gain exactly one body link each, titles untouched", () => {
  for (const locale of LOCALES) {
    const target = `](/${locale}/${B2_PATHS.strikes[locale]}/)`;
    assert.equal(JSON.stringify(HOURS.editions[locale].blocks).split(target).length - 1, 1, `hours/${locale}`);
    assert.equal(JSON.stringify(TRANSPORT.editions[locale].blocks).split(target).length - 1, 1, `transport/${locale}`);
  }
  // Frozen titles (docs/SEO_EXPERIMENTS.md): transport EN to 16 Nov. The metro
  // hours ca/es freeze was lifted by the owner on 28 Oct 2026 (page-1 push).
  assert.equal(HOURS.editions.ca.seoTitle, "Horari metro Barcelona avui: a quina hora obre i tanca");
  assert.equal(HOURS.editions.es.seoTitle, "Horario metro Barcelona hoy: a qué hora abre y cierra");
  // EN retitled in the 30 Oct top-3 push (the Saturday all-night answer was missing).
  assert.equal(HOURS.editions.en.seoTitle, "Barcelona metro hours: closes 12am, 2am Fri, all night Sat");
  assert.equal(TRANSPORT.editions.en.seoTitle, "Barcelona transport pass 2026: T-casual €13, 1 to 5 days"); // retitled 30 Oct (top-3 push)
});

test("the publish route has a strikes group and a one-off group for the two linking pages", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("strikes"\)\) published\.push\(await publishB2Article\(STRIKES_GUIDE\)\)/);
  assert.match(route, /wants\("strikes-links"\)\) published\.push\(await publishB2Article\(HOURS\), await publishB2Article\(TRANSPORT\)\)/);
});

test("a strike added by the lead renders without touching the template", () => {
  const extra: Strike = {
    id: "vaga-prova-2026-11-20",
    dates: ["2026-11-20"],
    scope: "education",
    title: { ca: "vaga d'educació", es: "huelga de educación", en: "education strike" },
    short: { ca: "vaga d'educació", es: "huelga de educación", en: "education strike" },
    label: { ca: "educació el 20 de novembre", es: "educación el 20 de noviembre", en: "education on 20 November" },
    facts: { ca: ["**A:** b.", "**C:** d."], es: ["**A:** b.", "**C:** d."], en: ["**A:** b.", "**C:** d."] },
    minimumServices: {
      status: "pending",
      msShort: { ca: "Pendents", es: "Pendientes", en: "Pending" },
      text: { ca: "Encara no.", es: "Aún no.", en: "Not yet." },
    },
    advice: { ca: [], es: [], en: [] },
    sources: [{ name: "x", url: "https://example.org/", publisher: "x" }],
  };
  const list = [...STRIKES, extra];
  for (const locale of LOCALES) {
    const blocks = buildStrikesBody(locale, STRIKES_AS_OF, list);
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    assert.ok(headings(blocks).some((h) => h.id === extra.id), locale);
    const description = strikesDescription(locale, STRIKES_AS_OF, list);
    assert.ok(description.length <= 155, `${locale}: ${description.length}`);
  }
});
