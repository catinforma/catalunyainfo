import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N, STRIKE_11N_META } from "../src/lib/content/batch02/strike-11n.ts";
import { CITIES, STATE_SERVICES, STRIKE_11N_CITIES_AS_OF } from "../src/lib/content/batch02/strike-11n-cities-data.ts";
import type { StateService, Strike11nCity } from "../src/lib/content/batch02/strike-11n-cities-model.ts";
import {
  CITY_HERO,
  STRIKE_11N_CITY_ARTICLES,
  buildCityBody,
  cityDescription,
  cityMsState,
  citySeoTitle,
  citySources,
  isCityPagesStale,
} from "../src/lib/content/batch02/strike-11n-cities.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { STRIKES_GUIDE, madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The 11N general strike city by city (6 Nov 2026): one Spanish-only page per
 * large city outside Catalonia, rendered from strike-11n-cities-data.ts.
 *
 * Pins the structure (Spanish only, registry paths, titles in the searched
 * words), the sourcing discipline (every external link a listed source, no
 * percentage, hour or place that no order or organiser published), how the
 * pages change as the strike watch fills the slots, and fails once the strike
 * is over (from 13 Nov) until the pages are brought up to date.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const sentences = (plain: string) => plain.split(/\n|(?<=[.!?»])\s+/);
const articleFor = (city: Strike11nCity) => {
  const article = STRIKE_11N_CITY_ARTICLES.find((a) => a.editions.es.path === city.path);
  assert.ok(article, city.key);
  return article;
};
const json = (city: Strike11nCity) => JSON.stringify(articleFor(city).editions.es.blocks);
const body = (city: Strike11nCity) => text(articleFor(city).editions.es.blocks);

const CITY_HREFS = STRIKE_11N_CITY_REFS.map((ref) => strike11nCityHref(ref.key));
const PUBLISHED_ES = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].map((paths) => `/es/${paths.es}/`),
  ...CITY_HREFS,
]);

/** Every slot published with a test figure (shape only; not real figures). */
function filledCity(city: Strike11nCity): Strike11nCity {
  return {
    ...city,
    msSummary: city.msSummary ?? "el 99% del servicio, según [la orden de prueba](https://example.org/orden-resumen)",
    services: city.services.map((service) => ({
      ...service,
      status: "published" as const,
      text: `El 99% del servicio, según [la orden de prueba](https://example.org/orden-${service.id})`,
      source: { name: `Orden de prueba ${service.id}`, url: `https://example.org/orden-${service.id}`, publisher: "Boletín" },
    })),
  };
}
/** Every city slot pending, as on the first day. */
function noneCity(city: Strike11nCity): Strike11nCity {
  return { ...city, msSummary: null, services: city.services.map((s) => ({ ...s, status: "pending" as const, text: null, source: null })) };
}
function filledState(): Record<string, StateService> {
  return Object.fromEntries(
    Object.entries(STATE_SERVICES).map(([key, slot]) => [
      key,
      { ...slot, status: "published" as const, text: `El 98% de los trenes, según [la resolución de prueba](https://example.org/res-${key})`, source: { name: `Resolución ${key}`, url: `https://example.org/res-${key}`, publisher: "Ministerio" } },
    ]),
  );
}

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("one Spanish-only page per city in the registry, valid and substantial", () => {
  assert.deepEqual(
    CITIES.map((city) => city.key).sort(),
    STRIKE_11N_CITY_REFS.map((ref) => ref.key).sort(),
    "every city in strike-11n-city-paths.ts needs its facts in strike-11n-cities-data.ts (and the other way round)",
  );
  assert.equal(STRIKE_11N_CITY_ARTICLES.length, STRIKE_11N_CITY_REFS.length);
  assert.ok(CITIES.length >= 8, `only ${CITIES.length} cities`);
  const entryKeys = new Set(STRIKE_11N_CITY_ARTICLES.map((a) => a.entryKey));
  assert.equal(entryKeys.size, STRIKE_11N_CITY_ARTICLES.length, "an entry key is used twice");
  for (const city of CITIES) {
    const ref = STRIKE_11N_CITY_REFS.find((r) => r.key === city.key)!;
    assert.equal(city.name, ref.name);
    assert.equal(city.path, ref.path);
    const article = articleFor(city);
    assert.deepEqual(Object.keys(article.editions), ["es"], `${city.key}: Spanish only`);
    const edition = article.editions.es;
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${city.key}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(city)) > 900, `${city.key} is thin (${wordCount(body(city))} words)`);
    assert.match(edition.path, /^guias\/huelga-general-11-noviembre-[a-z-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.equal(article.verifiedAt, STRIKE_11N_CITIES_AS_OF);
  }
});

test("the paths collide with no other published path and with each other", () => {
  const others = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => paths[locale]),
  );
  const mine = STRIKE_11N_CITY_REFS.map((ref) => ref.path);
  assert.equal(new Set(mine).size, mine.length);
  for (const path of mine) assert.ok(!others.includes(path), `${path} is already published`);
});

test("titles fit in 60 characters in the searched words; descriptions fit in 155 and answer first, in every state", () => {
  for (const city of CITIES) {
    const { seoTitle, seoDescription, title, excerpt } = articleFor(city).editions.es;
    assert.ok(seoTitle.length <= 60, `${city.key}: title ${seoTitle.length} "${seoTitle}"`);
    assert.match(seoTitle, new RegExp(`^Huelga 11(N| noviembre| de noviembre en) ${city.name}: servicios mínimos`), city.key);
    assert.equal(seoTitle, citySeoTitle(city));
    assert.equal(title, `Huelga general del 11 de noviembre en ${city.name}: servicios mínimos y qué funciona`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${city.key}: excerpt ${excerpt.length}`);
    assert.equal(seoDescription, cityDescription(city));
    assert.match(seoDescription, /^Huelga general el miércoles 11 de noviembre de 2026 en /, city.key);
    for (const [asOf, c, state] of [
      [STRIKE_11N_CITIES_AS_OF, city, STATE_SERVICES],
      ["2026-11-09", filledCity(city), STATE_SERVICES],
      ["2026-11-09", filledCity(city), filledState()],
      ["2026-11-11", filledCity(city), filledState()],
      ["2026-11-12", filledCity(city), filledState()],
    ] as const) {
      const description = cityDescription(c, asOf, state);
      assert.ok(description.length > 60 && description.length <= 155, `${city.key}/${asOf}: ${description.length} ${description}`);
      assert.ok(description.includes(city.name), `${city.key}/${asOf}: ${description}`);
    }
    // The description follows the city's own (regional and local) orders; trains and flights are in the table.
    assert.match(cityDescription(filledCity(city), "2026-11-09", filledState()), /ya publicados/);
    assert.match(cityDescription(filledCity(city), "2026-11-09", STATE_SERVICES), /ya publicados/);
    assert.match(cityDescription(noneCity(city), "2026-11-09", filledState()), /aún no publicados/);
    assert.match(cityDescription(city, "2026-11-12"), /^La huelga general del 11 de noviembre de 2026 en /);
  }
});

test("internal links stay in Spanish, end in a slash and point at a published path; every other city and the 11N page are linked", () => {
  for (const city of CITIES) {
    const hrefs = [...json(city).matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
    for (const href of hrefs) {
      assert.ok(href.startsWith("/es/"), `${city.key} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED_ES.has(href), `${city.key}: ${href} is not a published path`);
    }
    assert.ok(hrefs.includes(`/es/${B2_PATHS.strike11n.es}/`), `${city.key}: no link to the 11N page`);
    assert.ok(hrefs.includes(`/es/${B2_PATHS.strikes.es}/`), `${city.key}: no link to the strikes hub`);
    for (const other of CITY_HREFS) {
      if (other === strike11nCityHref(city.key)) assert.ok(!hrefs.includes(other), `${city.key} links to itself`);
      else assert.ok(hrefs.includes(other), `${city.key}: no link to ${other}`);
    }
  }
});

test("external links are https and every one is a listed source; the State's and the city's official sources are cited", () => {
  for (const city of CITIES) {
    const article = articleFor(city);
    const urls = article.sources.map((source) => source.url);
    assert.equal(new Set(urls).size, urls.length, `${city.key}: a source is listed twice`);
    for (const url of urls) {
      assert.match(url, /^https:\/\//, url);
      assert.ok(!/[?&]utm_/.test(url), url);
    }
    for (const match of json(city).matchAll(/\]\((https?:[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.match(href, /^https:\/\//, href);
      assert.ok(urls.includes(href), `${city.key}: ${href} is linked but not in the sources`);
    }
    for (const host of ["www.boe.es", "www.ccoo.es", "www.ugt.es", "www.transportes.gob.es"]) {
      assert.ok(urls.some((url) => new URL(url).host === host), `${city.key}: no source on ${host}`);
    }
    // Each city cites its own sources (bulletin, government, operators), all linked from the page.
    assert.ok(city.sources.length >= 4, `${city.key}: only ${city.sources.length} sources of its own`);
    for (const source of city.sources) assert.ok(json(city).includes(`](${source.url})`), `${city.key}: ${source.url} is listed but never linked`);
  }
});

test("photo: one Commons file for every city, in the manifest with its licence and author", () => {
  const image = IMAGE_BY_KEY.get(CITY_HERO.key);
  assert.ok(image, "the hero is not in the image manifest");
  assert.match(image.license ?? "", /^CC BY-SA 2\.0$/);
  assert.equal(image.credit, "Israel Hergón");
  assert.match(image.creditUrl ?? "", /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  for (const article of STRIKE_11N_CITY_ARTICLES) {
    assert.equal(article.heroKey, CITY_HERO.key);
    assert.ok(!article.editions.es.blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* Sourcing discipline                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Text whose figures and hours were read on an official page: every published
 * slot (the order's own words), the demonstrations as the organisers published
 * them, the BOE's private-security resolution and UGT's minimum-wage demand.
 */
function allowedFigures(city: Strike11nCity, state: Record<string, StateService> = STATE_SERVICES): string[] {
  return [
    ...[...city.services, ...Object.values(state)].flatMap((slot) => (slot.status === "published" && slot.text ? [slot.text] : [])),
    ...(city.msSummary ? [city.msSummary] : []),
    ...city.demos,
    ...(city.demoShort ? [city.demoShort] : []),
    city.demoWhere,
    ...city.callNotes,
    ...city.msNotes,
    ...city.railNotes,
    ...(city.airNotes ?? []),
    ...city.services.flatMap((service) => service.notes ?? []),
  ]
    .map((t) => text([{ type: "paragraph", text: t } as Block]))
    .flatMap((t) => [t, t.charAt(0).toUpperCase() + t.slice(1)]);
}

test("no percentage or hour that nobody published: each comes from a published order, the organisers, the BOE or UGT", () => {
  for (const city of CITIES) {
    let plain = body(city);
    for (const allowed of allowedFigures(city)) plain = plain.split(allowed).join(" ");
    for (const piece of sentences(plain)) {
      for (const pct of piece.match(/\d+(?:,\d+)?\s?%/g) ?? []) {
        const ok =
          (pct.replace(/\s/, "") === "90%" && /seguridad privada|personal de seguridad/.test(piece)) ||
          (pct === "7%" && /SMI/.test(piece));
        assert.ok(ok, `${city.key}: ${pct} in "${piece}"`);
      }
      // Clock times ("17.30 h", "a las 12:00"): none outside what an order or the organisers published.
      // "0 h" and "24 h" (the strike's own start and end, from the BOE) are not clock times of anything else.
      assert.doesNotMatch(piece, /\b\d{1,2}[.:]\d{2}\b|\ba las (?:[1-9]|1\d|2[0-3])\b|\b(?:[1-9]|1\d|2[0-3]) h\b/, `${city.key}: "${piece}"`);
    }
  }
});

test("demonstrations: only as the organisers published them, with the link; otherwise the page says none is published", () => {
  for (const city of CITIES) {
    const plain = body(city);
    if (city.demos.length === 0) {
      assert.equal(city.demoShort, null, city.key);
      assert.match(plain, /Aún sin convocatoria con hora y lugar en /, city.key);
      assert.match(plain, /Sin hora y lugar publicados por los convocantes/, city.key);
      assert.match(city.demoWhere, /\]\(https:\/\//, `${city.key}: say where the organisers will announce it`);
    } else {
      assert.ok(city.demoShort, `${city.key}: key facts need the demonstration`);
      for (const demo of city.demos) {
        const href = demo.match(/\]\((https:[^)]+)\)/)?.[1];
        assert.ok(href && city.sources.some((s) => s.url === href), `${city.key}: "${demo}" links no listed source`);
      }
    }
  }
});

test("every slot is consistent with its status; a pending one says who sets it and where it will appear", () => {
  for (const city of CITIES) {
    const urls = citySources(city).map((s) => s.url);
    const ids = city.services.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${city.key}: a service id is used twice`);
    for (const group of ["transport", "health", "schools"] as const) {
      assert.ok(city.services.some((s) => s.group === group), `${city.key}: no ${group} service`);
    }
    for (const slot of [...city.services, ...Object.values(STATE_SERVICES)]) {
      const name = `${city.key}/${"id" in slot ? slot.id : slot.key}`;
      assert.match(slot.pending, /\]\(https:\/\//, `${name}: the pending line must link where the order will appear`);
      if (slot.status === "pending") {
        assert.equal(slot.text, null, `${name}: pending with text`);
        assert.equal(slot.source, null, `${name}: pending with a source`);
        continue;
      }
      assert.ok(slot.text && slot.source, `${name}: published without text or source`);
      assert.match(slot.source.url, /^https:\/\//);
      assert.ok(urls.includes(slot.source.url), `${name}: source not in the page's sources`);
      assert.match(slot.text, /\]\(https:\/\//, `${name}: no link to the order or notice`);
    }
    for (const service of city.services) assert.match(service.where, /\]\(https:\/\//, `${city.key}/${service.id}: where has no link`);
  }
});

test("filling the slots changes the page without touching the template", () => {
  for (const city of CITIES) {
    const pending = buildCityBody(city);
    if (cityMsState(city) === "pending") {
      assert.match(text(pending.slice(0, 1)), new RegExp(`Servicios mínimos en ${city.name}: aún no publicados`), city.key);
    }
    const full = buildCityBody(filledCity(city), "2026-11-09", filledState());
    assert.ok(bodySchema.safeParse(full).success, city.key);
    assert.equal(cityMsState(filledCity(city), filledState()), "published");
    assert.match(text(full.slice(0, 1)), /ya se han publicado/, city.key);
    const tableBlock = full.find((b) => b.type === "table") as { rows: string[][] };
    for (const row of tableBlock.rows) assert.doesNotMatch(row[2] ?? "", /Aún no publicados/, `${city.key}: ${row[0]}`);
    assert.ok(citySources(filledCity(city), filledState()).some((s) => s.url === "https://example.org/res-rail"));
    // Only the State's slots published: partial, and the lead says the city's are still out.
    const partial = buildCityBody(noneCity(city), "2026-11-09", filledState());
    assert.match(text(partial.slice(0, 1)), /aún no se han publicado/, city.key);
  }
});

test("the lead follows the as-of date: before, on and after the day", () => {
  for (const city of CITIES) {
    assert.match(text(buildCityBody(city, "2026-11-06").slice(0, 1)), new RegExp(`^El miércoles 11 de noviembre de 2026 hay huelga general de 24 horas en toda España, también en ${city.name}`));
    assert.match(text(buildCityBody(filledCity(city), "2026-11-11", filledState()).slice(0, 1)), /^Hoy, miércoles 11 de noviembre/);
    const after = buildCityBody(filledCity(city), "2026-11-12", filledState());
    assert.ok(bodySchema.safeParse(after).success, city.key);
    assert.match(text(after.slice(0, 1)), /hubo huelga general/);
    // The SEMAF line about 10 and 12 November goes once those days are past.
    assert.doesNotMatch(text(buildCityBody(filledCity(city), "2026-11-13", filledState())), /El 10 y el 12 de noviembre también hay huelga en Renfe/, city.key);
  }
});

test("every weekday printed next to a date matches that date", () => {
  const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  let checked = 0;
  for (const city of CITIES) {
    const all = `${body(city)} ${articleFor(city).editions.es.seoDescription}`.toLowerCase();
    for (const match of all.matchAll(new RegExp(`(${weekdays.join("|")}),? (\\d{1,2}) de (${months.join("|")})`, "gu"))) {
      const iso = `2026-${String(months.indexOf(match[3]!) + 1).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[weekdayIndex(iso)], match[1], `${city.key}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked >= CITIES.length * 2, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

test("staleness: the pages are stale from 13 November until the as-of date moves past the strike", () => {
  assert.equal(isCityPagesStale("2026-11-12", "2026-11-06"), false);
  assert.equal(isCityPagesStale("2026-11-13", "2026-11-06"), true);
  assert.equal(isCityPagesStale("2026-11-13", "2026-11-11"), true);
  assert.equal(isCityPagesStale("2026-11-13", "2026-11-12"), false);
});

test("the city pages are brought up to date after the strike (move STRIKE_11N_CITIES_AS_OF, publish ?only=strike-11n-cities)", () => {
  const today = madridDate(new Date());
  assert.ok(STRIKE_11N_CITIES_AS_OF <= today, `STRIKE_11N_CITIES_AS_OF (${STRIKE_11N_CITIES_AS_OF}) is in the future`);
  assert.equal(
    isCityPagesStale(today),
    false,
    `On ${today} the 11 November strike is over but the city pages still speak from ${STRIKE_11N_CITIES_AS_OF}. Re-read every regional order, record what was set in src/lib/content/batch02/strike-11n-cities-data.ts, move STRIKE_11N_CITIES_AS_OF and publish ?only=strike-11n-cities.`,
  );
  if (STRIKE_11N_CITIES_AS_OF > "2026-11-11") {
    const pending = [...CITIES.flatMap((c) => c.services.filter((s) => s.status === "pending").map((s) => `${c.key}/${s.id}`)), ...Object.values(STATE_SERVICES).filter((s) => s.status === "pending").map((s) => s.key)];
    assert.deepEqual(pending, [], `the strike is past on ${STRIKE_11N_CITIES_AS_OF} but these are still 'pending': record what was published`);
  }
});

test("the pages are deterministic: no clock in the modules, same output on every call", () => {
  for (const file of ["strike-11n-cities.ts", "strike-11n-cities-data.ts", "strike-11n-city-paths.ts", "strike-11n-cities-model.ts"]) {
    const source = readFileSync(new URL(`../src/lib/content/batch02/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, `${file} reads the clock`);
  }
  for (const city of CITIES) assert.equal(JSON.stringify(buildCityBody(city)), json(city), city.key);
});

/* -------------------------------------------------------------------------- */
/* The 11N page, the strikes hub and the publish route                        */
/* -------------------------------------------------------------------------- */

test("the Spanish 11N page links every city page once, under the answer; its title and lead are untouched; ca and en have no city links", () => {
  const es = STRIKE_11N.editions.es;
  assert.equal(es.seoTitle, "Huelga 11 noviembre: servicios mínimos y manifestación");
  assert.equal(es.title, STRIKE_11N_META.es.title);
  assert.equal(es.blocks[0]?.type, "paragraph");
  assert.doesNotMatch(text(es.blocks.slice(0, 1)), /Madrid|otras ciudades/, "the lead changed");
  const box = es.blocks[4] as { type: string; tone?: string; title?: string; text?: string };
  assert.equal(box.type, "callout");
  assert.equal(box.title, "En otras ciudades");
  const all = JSON.stringify(es.blocks);
  for (const href of CITY_HREFS) assert.equal(all.split(`](${href})`).length - 1, 1, href);
  for (const locale of ["ca", "en"] as const) {
    const other = JSON.stringify(STRIKE_11N.editions[locale].blocks);
    assert.ok(!CITY_HREFS.some((href) => other.includes(href)), `${locale} links a Spanish city page`);
  }
});

test("the Spanish strikes hub lists every city page in the 11N card; ca and en do not", () => {
  const es = JSON.stringify(STRIKES_GUIDE.editions.es.blocks);
  for (const href of CITY_HREFS) assert.equal(es.split(`](${href})`).length - 1, 1, href);
  for (const locale of ["ca", "en"] as const) {
    const other = JSON.stringify(STRIKES_GUIDE.editions[locale].blocks);
    assert.ok(!CITY_HREFS.some((href) => other.includes(href)), `${locale} links a Spanish city page`);
  }
});

test("the publish route has a strike-11n-cities group (and two halves for a retry) that publishes the Spanish editions only", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKE_11N_CITY_ARTICLES \} from "@\/lib\/content\/batch02\/strike-11n-cities";/);
  assert.match(route, /wants\("strike-11n-cities"\)\) \{\s+for \(const article of STRIKE_11N_CITY_ARTICLES\) published\.push\(await publishB2SpanishArticle\(article\)\);/);
  assert.match(route, /wants\("strike-11n-cities-a"\)/);
  assert.match(route, /wants\("strike-11n-cities-b"\)/);
  const publisher = readFileSync(new URL("../src/lib/content/batch02/publish.ts", import.meta.url), "utf8");
  assert.match(publisher, /export async function publishB2SpanishArticle\(article: B2SpanishArticle\)/);
  assert.match(publisher, /return publishEditions\(article, \[\["es", article\.editions\.es\]\]\);/);
});
