import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, RELATED_HEADING } from "../src/lib/content/batch02/shared.ts";
import { NEXT_DATES_HEADING, NEXT_DATES_ID, STRIKE_11N, STRIKE_11N_META, buildStrike11nBody } from "../src/lib/content/batch02/strike-11n.ts";
import { CITIES, STATE_SERVICES, STRIKE_11N_CITIES_AS_OF, STRIKE_11N_CITIES_VERIFIED } from "../src/lib/content/batch02/strike-11n-cities-data.ts";
import type { StateService, Strike11nCity } from "../src/lib/content/batch02/strike-11n-cities-model.ts";
import {
  CITY_HERO,
  CITY_HERO_CITIES,
  STRIKE_11N_CITY_ARTICLES,
  buildCityBody,
  cityDescription,
  cityMsState,
  citySeoTitle,
  citySources,
  isCityPagesStale,
  localizeCity,
  localizeState,
} from "../src/lib/content/batch02/strike-11n-cities.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { CITY_TR, STATE_TR } from "../src/lib/content/batch02/strike-11n-cities-i18n/index.ts";
import { STRIKE_11N_SPAIN, STRIKE_11N_SPAIN_PATHS, buildSpainBody } from "../src/lib/content/batch02/strike-11n-spain.ts";
import { STRIKES_GUIDE, madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { HUB_PATHS as SCHOOL_HUB_PATHS, SPAIN_REGIONS as SCHOOL_REGIONS, regionPath } from "../src/lib/content/school-spain/regions.ts";
import { leaveEditions } from "../src/lib/programmatic/leave-2027/copy.ts";
import { plannerData, plannerPlace } from "../src/lib/programmatic/leave-2027/places.ts";
import { cityBySlug } from "../src/lib/programmatic/spain-2027/cities.ts";
import { editionPaths } from "../src/lib/programmatic/spain-2027/editions.ts";
import { spainPaths } from "../src/lib/programmatic/spain-2027/paths.ts";
import { AFTER_STRIKE_ID, STRIKE_11N_CITY_PLACES, cityNextLinks, spainNextLinks } from "../src/lib/content/batch02/strike-11n-next.ts";
/**
 * The 11N general strike city by city (6 Nov 2026): one Spanish-only page per
 * large city outside Catalonia, rendered from strike-11n-cities-data.ts.
 *
 * Pins the structure (ca, es and en since 10 Nov 2026, registry paths, titles in the searched
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

/**
 * Every path these pages may link in one language: the guide registries, the
 * 11N city and Spain pages, and (13 Nov 2026, the "Y ahora" block) the pages
 * other families build: the school calendar of each community and its hub
 * (school-spain/publish.ts), the 2027 calendar's hub, communities and cities
 * (the sitemap helpers spainPaths / editionPaths) and the leave planner.
 */
function knownPaths(locale: (typeof LOCALES)[number]): Set<string> {
  return new Set([
    ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].map((paths) => `/${locale}/${paths[locale]}/`),
    ...STRIKE_11N_CITY_REFS.map((ref) => strike11nCityHref(ref.key, locale)),
    `/${locale}/${STRIKE_11N_SPAIN_PATHS[locale]}/`,
    ...SCHOOL_REGIONS.map((region) => `/${locale}/${regionPath(region.slug, locale)}/`),
    `/${locale}/${SCHOOL_HUB_PATHS[locale]}/`,
    ...(locale === "es" ? spainPaths() : editionPaths(locale)),
    leaveEditions()[locale],
  ]);
}
const PUBLISHED_ES = knownPaths("es");
/** "/es/festivos/2027/aprovechar-vacaciones/#p=andalucia/sevilla&d=5" → its path, which must end in a slash. */
const pathOf = (href: string) => href.split("#")[0]!;

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

test("one page per city in the registry, in ca, es and en, valid and substantial", () => {
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
    assert.deepEqual(Object.keys(article.editions).sort(), ["ca", "en", "es"], `${city.key}: ca, es and en`);
    const edition = article.editions.es;
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${city.key}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(city)) > 900, `${city.key} is thin (${wordCount(body(city))} words)`);
    assert.match(edition.path, /^guias\/huelga-general-11-noviembre-[a-z-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.equal(article.verifiedAt, STRIKE_11N_CITIES_VERIFIED);
  }
});

test("the paths collide with no other published path and with each other", () => {
  const others = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => paths[locale]),
  );
  const mine = [...STRIKE_11N_CITY_REFS.flatMap((ref) => LOCALES.map((locale) => ref.paths[locale])), ...LOCALES.map((locale) => STRIKE_11N_SPAIN_PATHS[locale])];
  assert.equal(new Set(mine).size, mine.length);
  for (const path of mine) assert.ok(!others.includes(path), `${path} is already published`);
  for (const ref of STRIKE_11N_CITY_REFS) {
    assert.equal(ref.paths.es, ref.path, ref.key);
    assert.equal(ref.names.es, ref.name, ref.key);
    assert.match(ref.paths.ca, /^guies\/vaga-general-11-novembre-[a-z-]+$/, ref.key);
    assert.match(ref.paths.en, /^guides\/general-strike-11-november-[a-z-]+$/, ref.key);
  }
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
    assert.match(seoDescription, STRIKE_11N_CITIES_AS_OF > "2026-11-11" ? /^La huelga general del 11 de noviembre de 2026 en / : /^Huelga general el miércoles 11 de noviembre de 2026 en /, city.key);
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
      assert.ok(pathOf(href).endsWith("/"), href);
      assert.ok(PUBLISHED_ES.has(pathOf(href)), `${city.key}: ${href} is not a published path`);
    }
    assert.ok(hrefs.includes(`/es/${B2_PATHS.strike11n.es}/`), `${city.key}: no link to the 11N page`);
    // Since 13 Nov 2026 the Spain strikes hub, not the Catalan one (these readers live elsewhere).
    assert.ok(hrefs.includes(`/es/${B2_PATHS.strikesSpain.es}/`), `${city.key}: no link to the strikes hub`);
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
    const madrid = article.entryKey.endsWith("-madrid");
    // The Madrid photograph only on the Madrid page; elsewhere no photo (and a written reason), never a wrong city.
    assert.equal(article.heroKey, madrid ? CITY_HERO.key : undefined, article.entryKey);
    assert.equal(Boolean(article.noPhotoReason), !madrid, article.entryKey);
    assert.ok(!article.editions.es.blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
  assert.deepEqual([...CITY_HERO_CITIES], ["madrid"]);
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
      assert.match(plain, STRIKE_11N_CITIES_AS_OF > "2026-11-11" ? /Sin convocatoria localizada con hora y lugar en / : /Aún sin convocatoria con hora y lugar en /, city.key);
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
    // 12 Nov 2026: an order not found by the last check (STRIKE_11N_CITIES_VERIFIED) is said as such, with no promise to add it.
    for (const city of CITIES) {
      for (const locale of LOCALES) {
        const t = JSON.stringify(buildCityBody(city, STRIKE_11N_CITIES_AS_OF, STATE_SERVICES, locale));
        assert.doesNotMatch(t, /aún no (se han )?publicad|encara no (s'han )?publicat|not published yet|añadiremos|pondremos|afegirem|posarem|we will add/i, `${city.key}/${locale}`);
      }
    }
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

test("the publish route has a strike-11n-cities group (and two halves for a retry) that publishes every edition, ca, es and en, with the Spain page", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKE_11N_CITY_ARTICLES \} from "@\/lib\/content\/batch02\/strike-11n-cities";/);
  assert.match(route, /wants\("strike-11n-cities"\)\) \{\s+for \(const article of STRIKE_11N_CITY_ARTICLES\) published\.push\(await publishB2UnkeyedArticle\(article\)\);[^}]*publishB2UnkeyedArticle\(STRIKE_11N_SPAIN\)/);
  assert.match(route, /wants\("strike-11n-cities-a"\)/);
  assert.match(route, /wants\("strike-11n-cities-b"\)/);
  assert.doesNotMatch(route, /publishB2SpanishArticle\((article|STRIKE_11N_SPAIN)\)/, "a city or the Spain page would go out in Spanish only");
  const publisher = readFileSync(new URL("../src/lib/content/batch02/publish.ts", import.meta.url), "utf8");
  assert.match(publisher, /export async function publishB2UnkeyedArticle\(article: B2UnkeyedArticle\)/);
  assert.match(publisher, /const edition = article\.editions\[locale\];\s+return edition \? \[\[locale, edition\]\] : \[\];/);
  assert.deepEqual(Object.keys(STRIKE_11N_SPAIN.editions).sort(), ["ca", "en", "es"]);
});

/* -------------------------------------------------------------------------- */
/* Catalan and English editions (10 Nov 2026)                                 */
/* -------------------------------------------------------------------------- */

const TR_LOCALES = ["ca", "en"] as const;
type TrLoc = (typeof TR_LOCALES)[number];
const editionOf = (city: Strike11nCity, locale: TrLoc) => {
  const edition = articleFor(city).editions[locale];
  assert.ok(edition, `${city.key}: no ${locale} edition`);
  return edition;
};
const trJson = (city: Strike11nCity, locale: TrLoc) => JSON.stringify(editionOf(city, locale).blocks);
const trBody = (city: Strike11nCity, locale: TrLoc) => text(editionOf(city, locale).blocks);

const urlsOf = (s: string) => [...s.matchAll(/\]\((https?:[^)]+|\/[^)]*)\)/g)].map((m) => m[1]).sort();
const digitsOf = (s: string) => (s.match(/\d+/g) ?? []).sort();

/** Walks the Spanish words and the translated ones side by side: same shape, same links, same figures in every string. */
function sameFacts(es: unknown, tr: unknown, path: string, problems: string[]): void {
  if (es == null || tr == null) {
    if ((es == null) !== (tr == null)) problems.push(`${path}: ${es == null ? "the Spanish is empty" : "no translation"}`);
    return;
  }
  if (typeof es === "string") {
    if (typeof tr !== "string") return void problems.push(`${path}: not a string`);
    if (JSON.stringify(urlsOf(es)) !== JSON.stringify(urlsOf(tr))) problems.push(`${path}: links differ from the Spanish`);
    if (JSON.stringify(digitsOf(es)) !== JSON.stringify(digitsOf(tr))) problems.push(`${path}: figures differ from the Spanish (${digitsOf(es)} / ${digitsOf(tr)})`);
    return;
  }
  if (Array.isArray(es)) {
    if (!Array.isArray(tr) || tr.length !== es.length) return void problems.push(`${path}: ${es.length} items in Spanish`);
    es.forEach((item, i) => sameFacts(item, tr[i], `${path}[${i}]`, problems));
    return;
  }
  if (typeof es === "object") {
    for (const key of new Set([...Object.keys(es as object), ...Object.keys(tr as object)])) {
      sameFacts((es as Record<string, unknown>)[key], (tr as Record<string, unknown>)[key], `${path}.${key}`, problems);
    }
  }
}

/** The text fields of a city as the translation files hold them. */
function cityWords(city: Strike11nCity) {
  return {
    titleTransport: city.titleTransport,
    transportShort: city.transportShort,
    authority: city.authority,
    authorityShort: city.authorityShort,
    bulletin: city.bulletin,
    cercanias: city.cercanias,
    airport: city.airport,
    ...(city.airNotes ? { airNotes: city.airNotes } : {}),
    msSummary: city.msSummary,
    msNotes: city.msNotes,
    railNotes: city.railNotes,
    school: city.school,
    schoolShort: city.schoolShort,
    demos: city.demos,
    demoShort: city.demoShort,
    demoWhere: city.demoWhere,
    callNotes: city.callNotes,
    services: Object.fromEntries(
      city.services.map((s) => [
        s.id,
        { name: s.name, setBy: s.setBy, pending: s.pending, where: s.where, text: s.status === "published" ? s.text : null, ...(s.question ? { question: s.question } : {}), ...(s.notes ? { notes: s.notes } : {}) },
      ]),
    ),
  };
}

test("the Catalan and English words match the Spanish facts: same fields, same links, same figures (strike-11n-cities-i18n/)", () => {
  const problems: string[] = [];
  for (const city of CITIES) {
    const tr = CITY_TR[city.key];
    if (!tr) {
      problems.push(`${city.key}: no strike-11n-cities-i18n/${city.key}.ts`);
      continue;
    }
    for (const locale of TR_LOCALES) sameFacts(cityWords(city), tr[locale], `${city.key}/${locale}`, problems);
  }
  for (const locale of TR_LOCALES) {
    for (const [key, slot] of Object.entries(STATE_SERVICES)) {
      const t = STATE_TR[locale][key as "rail" | "air"];
      sameFacts({ text: slot.status === "published" ? slot.text : null, pending: slot.pending, setBy: slot.setBy }, t, `state/${key}/${locale}`, problems);
    }
  }
  assert.deepEqual(problems, [], "write the Spanish sentence in Catalan and English, with the same links and figures");
});

test("ca and en: valid, substantial, in the page's language, titles ≤60 and descriptions ≤155 in every state", () => {
  const title = { ca: /^Vaga (11N|11 novembre|11 de novembre a) .*serveis mínims/, en: /(strike 11 November|General strike 11 November in|11N strike in).*minimum services/ };
  for (const city of CITIES) {
    for (const locale of TR_LOCALES) {
      const edition = editionOf(city, locale);
      const ref = STRIKE_11N_CITY_REFS.find((r) => r.key === city.key)!;
      assert.equal(edition.path, ref.paths[locale]);
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${city.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(trBody(city, locale)) > 900, `${city.key}/${locale} is thin (${wordCount(trBody(city, locale))} words)`);
      assert.ok(edition.seoTitle.length <= 60, `${city.key}/${locale}: title ${edition.seoTitle.length} "${edition.seoTitle}"`);
      assert.match(edition.seoTitle, title[locale], `${city.key}/${locale}: ${edition.seoTitle}`);
      assert.ok(edition.seoTitle.includes(ref.names[locale]), edition.seoTitle);
      assert.ok(edition.excerpt.length > 30 && edition.excerpt.length <= 200, `${city.key}/${locale}: excerpt ${edition.excerpt.length}`);
      assert.ok(edition.seoDescription.length > 60 && edition.seoDescription.length <= 155, `${city.key}/${locale}: ${edition.seoDescription}`);
      const lc = localizeCity(city, locale);
      for (const [asOf, c] of [
        ["2026-11-09", localizeCity(filledCity(city), locale)],
        ["2026-11-11", lc],
        ["2026-11-12", lc],
      ] as const) {
        const description = cityDescription(c, asOf, STATE_SERVICES, locale);
        assert.ok(description.length > 60 && description.length <= 155, `${city.key}/${locale}/${asOf}: ${description.length} ${description}`);
      }
      // No Spanish template words left in the page.
      assert.doesNotMatch(trBody(city, locale), /Servicios mínimos:|Aún no publicados|Sigue leyendo|Quién los fija/, `${city.key}/${locale}`);
    }
  }
});

test("ca and en: internal links stay in the page's language, point at a published path, and reach every other city, the 11N page and the strikes hub", () => {
  for (const locale of TR_LOCALES) {
    const published = knownPaths(locale);
    for (const city of CITIES) {
      const hrefs = [...trJson(city, locale).matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
      for (const href of hrefs) {
        assert.ok(href.startsWith(`/${locale}/`), `${city.key}/${locale} links to ${href}`);
        assert.ok(published.has(pathOf(href)), `${city.key}/${locale}: ${href} is not a published path`);
      }
      assert.ok(hrefs.includes(`/${locale}/${B2_PATHS.strike11n[locale]}/`), `${city.key}/${locale}: no link to the 11N page`);
      assert.ok(hrefs.includes(`/${locale}/${B2_PATHS.strikesSpain[locale]}/`), `${city.key}/${locale}: no link to the strikes hub`);
      for (const ref of STRIKE_11N_CITY_REFS) {
        const other = strike11nCityHref(ref.key, locale);
        if (ref.key === city.key) assert.ok(!hrefs.includes(other), `${city.key}/${locale} links to itself`);
        else assert.ok(hrefs.includes(other), `${city.key}/${locale}: no link to ${other}`);
      }
    }
    // The Spain page: every city in this language, nothing in another.
    const spain = JSON.stringify(STRIKE_11N_SPAIN.editions[locale]!.blocks);
    for (const href of [...spain.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "")) assert.ok(href.startsWith(`/${locale}/`) && published.has(pathOf(href)), `Spain/${locale}: ${href}`);
    for (const ref of STRIKE_11N_CITY_REFS) assert.ok(spain.includes(`](${strike11nCityHref(ref.key, locale)})`), `Spain/${locale}: no ${ref.key}`);
  }
});

test("ca and en: every external link is a listed source, and every listed city source is linked", () => {
  for (const city of CITIES) {
    const urls = articleFor(city).sources.map((s) => s.url);
    for (const locale of TR_LOCALES) {
      for (const match of trJson(city, locale).matchAll(/\]\((https?:[^)]*)\)/g)) assert.ok(urls.includes(match[1] ?? ""), `${city.key}/${locale}: ${match[1]} is linked but not in the sources`);
      for (const source of city.sources) assert.ok(trJson(city, locale).includes(`](${source.url})`), `${city.key}/${locale}: ${source.url} is never linked`);
    }
  }
});

test("ca and en: no percentage or hour that nobody published", () => {
  const security = { ca: /seguretat privada|personal de seguretat/, en: /security staff|private security/ };
  const clock = {
    ca: /\b\d{1,2}[.:]\d{2}\b|\ba les (?:[1-9]|1\d|2[0-3])\b|\b(?:[1-9]|1\d|2[0-3]) h\b/,
    en: /\b\d{1,2}[.:]\d{2}\b|\bat (?:[1-9]|1\d|2[0-3])\b|\b(?:[1-9]|1\d|2[0-3]) ?(?:h|am|pm)\b/,
  };
  for (const city of CITIES) {
    for (const locale of TR_LOCALES) {
      let plain = trBody(city, locale);
      for (const allowed of allowedFigures(localizeCity(city, locale), localizeState(STATE_SERVICES, locale))) plain = plain.split(allowed).join(" ");
      for (const piece of sentences(plain)) {
        for (const pct of piece.match(/\d+(?:[.,]\d+)?\s?%/g) ?? []) {
          const ok = (pct.replace(/\s/, "") === "90%" && security[locale].test(piece)) || (pct === "7%" && /SMI/.test(piece));
          assert.ok(ok, `${city.key}/${locale}: ${pct} in "${piece}"`);
        }
        assert.doesNotMatch(piece, clock[locale], `${city.key}/${locale}: "${piece}"`);
      }
    }
  }
});

test("ca and en: the lead and the minimum-services status follow the slots and the as-of date", () => {
  const re = {
    ca: { before: /^El dimecres 11 de novembre de 2026 hi ha vaga general de 24 hores a tot Espanya, també a /, today: /^Avui, dimecres 11 de novembre/, past: /hi va haver vaga general/, full: /ja s'han publicat/, partial: /encara no s'han publicat/, pending: /encara no publicats/, noDemo: /Encara sense convocatòria amb hora i lloc a / },
    en: { before: /^On Wednesday 11 November 2026 there is a 24-hour general strike across Spain, including /, today: /^Today, Wednesday 11 November/, past: /there was a 24-hour general strike/, full: /have been published/, partial: /have not been published yet/, pending: /not published yet/, noDemo: /No demonstration with a time and place in / },
  };
  const pendingState = Object.fromEntries(Object.entries(STATE_SERVICES).map(([k, s]) => [k, { ...s, status: "pending" as const, text: null, source: null }]));
  for (const city of CITIES) {
    for (const locale of TR_LOCALES) {
      const r = re[locale];
      const lead0 = (blocks: Block[]) => text(blocks.slice(0, 1));
      assert.match(lead0(buildCityBody(city, "2026-11-06", STATE_SERVICES, locale)), r.before, city.key);
      assert.match(lead0(buildCityBody(filledCity(city), "2026-11-11", filledState(), locale)), r.today, city.key);
      const after = buildCityBody(filledCity(city), "2026-11-12", filledState(), locale);
      assert.ok(bodySchema.safeParse(after).success, city.key);
      assert.match(lead0(after), r.past, city.key);
      assert.match(lead0(buildCityBody(filledCity(city), "2026-11-09", filledState(), locale)), r.full, `${city.key}/${locale}`);
      assert.match(lead0(buildCityBody(noneCity(city), "2026-11-09", filledState(), locale)), r.partial, `${city.key}/${locale}`);
      const allPending = buildCityBody(noneCity(city), "2026-11-09", pendingState, locale);
      assert.ok(bodySchema.safeParse(allPending).success, city.key);
      assert.match(lead0(allPending), r.pending, `${city.key}/${locale}`);
      if (city.demos.length === 0 && STRIKE_11N_CITIES_AS_OF <= "2026-11-11") assert.match(trBody(city, locale), r.noDemo, `${city.key}/${locale}`);
      if (city.demos.length === 0 && STRIKE_11N_CITIES_AS_OF > "2026-11-11") assert.match(trBody(city, locale), /Sense convocatòria localitzada amb hora i lloc a |No demonstration with a time and place found in /, `${city.key}/${locale}`);
      assert.equal(JSON.stringify(buildCityBody(city, STRIKE_11N_CITIES_AS_OF, STATE_SERVICES, locale)), trJson(city, locale), `${city.key}/${locale}: not deterministic`);
    }
  }
});

test("ca and en: every weekday printed next to a date matches that date", () => {
  const weekdays = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  };
  let checked = 0;
  for (const locale of TR_LOCALES) {
    const pattern =
      locale === "ca"
        ? new RegExp(`(${weekdays.ca.join("|")}),? (\\d{1,2}) (?:de |d')(${months.ca.join("|")})`, "gu")
        : new RegExp(`(${weekdays.en.join("|")}),? (\\d{1,2}) (${months.en.join("|")})`, "gu");
    for (const city of CITIES) {
      const all = `${trBody(city, locale)} ${editionOf(city, locale).seoDescription}`.toLowerCase();
      for (const match of all.matchAll(pattern)) {
        const iso = `2026-${String(months[locale].indexOf(match[3]!) + 1).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${city.key}/${locale}: "${match[0]}"`);
        checked += 1;
      }
    }
  }
  assert.ok(checked >= CITIES.length * 2, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* What comes next (11 Nov 2026)                                              */
/* -------------------------------------------------------------------------- */

test("upcoming strikes and dates: the 11N page, every city and the Spain page link the next events once, in their own language, before, on and after the day", () => {
  const block = (blocks: Block[], locale: (typeof LOCALES)[number]) => {
    const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === NEXT_DATES_ID[locale]);
    assert.ok(at > 0, `${locale}: no upcoming block`);
    assert.equal((blocks[at] as { text?: string }).text, NEXT_DATES_HEADING[locale]);
    assert.equal(blocks.filter((b) => b.type === "heading" && (b as { id?: string }).id === NEXT_DATES_ID[locale]).length, 1, locale);
    // Under the answer: before the first section about 11 November itself.
    const firstH2 = blocks.findIndex((b) => b.type === "heading" && (b as { level?: number }).level === 2);
    assert.equal(at, firstH2, `${locale}: the block is the first section`);
    const list = blocks[at + 1] as { type: string; items: string[] };
    assert.equal(list.type, "list", locale);
    return list.items.join(" ");
  };
  const expectLinks = (items: string, locale: (typeof LOCALES)[number], hub: "strikes" | "strikesSpain", where: string) => {
    for (const key of ["strikeRenfe", "strikeEducation", "voting", hub] as const) {
      const target = `](/${locale}/${B2_PATHS[key][locale]}/)`;
      assert.equal(items.split(target).length - 1, 1, `${where}/${locale}: ${key} once`);
    }
    // Every link in the block stays in the page's language.
    for (const match of items.matchAll(/\]\((\/[^)]+)\)/g)) assert.ok(match[1]!.startsWith(`/${locale}/`), `${where}/${locale}: ${match[1]}`);
    // The days, never "today" or "tomorrow": the same words in every state.
    assert.doesNotMatch(items.replace(/\]\([^)]+\)/g, "]"), /\b(avui|demà|hoy|mañana|today|tomorrow)\b/i, `${where}/${locale}`);
  };
  for (const locale of LOCALES) {
    const seen = new Set<string>();
    for (const asOf of ["2026-11-10", "2026-11-11", "2026-11-12"]) {
      const main = block(buildStrike11nBody(locale, asOf), locale);
      expectLinks(main, locale, "strikes", `11N ${asOf}`);
      seen.add(main);
      expectLinks(block(buildSpainBody(asOf, locale), locale), locale, "strikesSpain", `spain ${asOf}`);
      for (const city of CITIES) expectLinks(block(buildCityBody(city, asOf, STATE_SERVICES, locale), locale), locale, "strikesSpain", `${city.key} ${asOf}`);
    }
    assert.equal(seen.size, 1, `${locale}: the block reads the same in the upcoming, day and past states`);
    // The published editions carry it too.
    block(STRIKE_11N.editions[locale].blocks, locale);
    block(STRIKE_11N_SPAIN.editions[locale]?.blocks ?? [], locale);
  }
});

/* -------------------------------------------------------------------------- */
/* "Y ahora en <ciudad>" (13 Nov 2026, strike-11n-next.ts)                    */
/* -------------------------------------------------------------------------- */

test("after the strike: every city and the Spain page hand on to 5-6 real evergreen pages for their own city and community, in ca, es and en", () => {
  const LINK = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  const blockOf = (blocks: Block[], locale: (typeof LOCALES)[number]) => {
    const at = blocks.findIndex((b) => b.type === "heading" && (b as { id?: string }).id === AFTER_STRIKE_ID[locale]);
    if (at < 0) return null;
    const list = blocks[at + 1] as { type: string; items: string[] };
    assert.equal(list.type, "list", locale);
    return list.items;
  };
  const check = (items: string[], locale: (typeof LOCALES)[number], where: string) => {
    const known = knownPaths(locale);
    const links = items.flatMap((item) => [...item.matchAll(LINK)].map((m) => ({ label: m[1]!, href: m[2]! })));
    assert.ok(links.length >= 5 && links.length <= 6, `${where}/${locale}: ${links.length} links`);
    assert.equal(new Set(links.map((l) => pathOf(l.href))).size, links.length, `${where}/${locale}: a target twice`);
    for (const { label, href } of links) {
      assert.ok(href.startsWith(`/${locale}/`), `${where}/${locale}: ${href}`);
      assert.ok(known.has(pathOf(href)), `${where}/${locale}: ${href} is not a path the site builds`);
      // Descriptive anchors, no Catalan-only target, no urgency.
      assert.ok(label.length >= 25, `${where}/${locale}: anchor "${label}"`);
      assert.doesNotMatch(href, /catalun|cataluna|catalonia/, `${where}/${locale}: Catalan page ${href}`);
      assert.doesNotMatch(label, /!|¡|ya mismo|ahora mismo|última hora|right now|urgent|corre/i, `${where}/${locale}: "${label}"`);
    }
    return links;
  };

  for (const locale of LOCALES) {
    const data = plannerData(locale);
    for (const city of CITIES) {
      const name = localizeCity(city, locale).name;
      // Only once the strike is past.
      assert.equal(blockOf(buildCityBody(city, "2026-11-10", STATE_SERVICES, locale), locale), null, `${city.key}/${locale}: block before the strike`);
      assert.equal(blockOf(buildCityBody(city, "2026-11-11", STATE_SERVICES, locale), locale), null, `${city.key}/${locale}: block on the day`);
      const items = blockOf(buildCityBody(city, "2026-11-12", STATE_SERVICES, locale), locale);
      assert.ok(items, `${city.key}/${locale}: no block after the strike`);
      assert.deepEqual(items, cityNextLinks(city.key, name, locale));
      const links = check(items, locale, city.key);
      const hrefs = links.map((l) => l.href);
      // The city's own community and city, not somewhere else.
      const { region, slug } = STRIKE_11N_CITY_PLACES[city.key];
      assert.ok(cityBySlug(region, slug), `${city.key}: no 2027 page ${region}/${slug}`);
      const schoolSlug = SCHOOL_REGIONS.find((r) => r.boe === region)?.slug;
      assert.ok(schoolSlug, `${city.key}: no school calendar for ${region}`);
      assert.ok(hrefs.includes(`/${locale}/${regionPath(schoolSlug, locale)}/`), `${city.key}/${locale}: not its community's school calendar`);
      const holidays = hrefs.find((h) => h.includes("/2027/") && h.endsWith(`/${slug}/`));
      assert.ok(holidays, `${city.key}/${locale}: not its 2027 holidays page`);
      // The leave planner opens with this city picked (an id the picker knows, whose page is that one) and 5 days.
      const leave = hrefs.find((h) => pathOf(h) === leaveEditions()[locale]);
      assert.ok(leave, `${city.key}/${locale}: no leave planner`);
      const params = new URLSearchParams(leave.split("#")[1]);
      assert.equal(params.get("d"), "5");
      const picked = plannerPlace(data, params.get("p") ?? "");
      assert.ok(picked, `${city.key}/${locale}: planner id ${params.get("p")} unknown`);
      assert.equal(picked.item[2], holidays, `${city.key}/${locale}: planner id ${params.get("p")} is another place`);
      // The anchors name the city; the same number of targets in every language.
      assert.ok(links.filter((l) => l.label.includes(name)).length >= 2, `${city.key}/${locale}: anchors do not name ${name}`);
      assert.equal(links.length, cityNextLinks(city.key, city.name, "es").length);
    }
    // The published editions carry it (the pages are past since 12 Nov).
    for (const article of STRIKE_11N_CITY_ARTICLES) assert.ok(blockOf(article.editions[locale]!.blocks, locale), `${article.entryKey}/${locale}: not published with the block`);

    // The Spain page: the Spain-wide editions of the same targets.
    assert.equal(blockOf(buildSpainBody("2026-11-10", locale), locale), null, `spain/${locale}: block before the strike`);
    const spain = blockOf(buildSpainBody("2026-11-12", locale), locale);
    assert.ok(spain, `spain/${locale}: no block`);
    assert.deepEqual(spain, spainNextLinks(locale));
    const spainHrefs = check(spain, locale, "spain").map((l) => l.href);
    assert.ok(spainHrefs.includes(`/${locale}/${SCHOOL_HUB_PATHS[locale]}/`), `spain/${locale}: no school hub`);
    assert.ok(blockOf(STRIKE_11N_SPAIN.editions[locale]!.blocks, locale), `spain/${locale}: not published with the block`);
  }
});

test("the related rail of the city pages points at the Spain-wide pages, not the Catalan ones; the Catalan 11N page has no such block", () => {
  for (const locale of LOCALES) {
    for (const article of STRIKE_11N_CITY_ARTICLES) {
      const blocks = article.editions[locale]!.blocks;
      const at = blocks.findIndex((b) => b.type === "heading" && (b as { text?: string }).text === RELATED_HEADING[locale]);
      assert.ok(at > 0, `${article.entryKey}/${locale}: no related rail`);
      const items = (blocks[at + 1] as { items: string[] }).items.join(" ");
      assert.ok(items.includes(`](/${locale}/${STRIKE_11N_SPAIN_PATHS[locale]}/)`), `${article.entryKey}/${locale}: no Spain 11N page`);
      assert.ok(items.includes(`](/${locale}/${B2_PATHS.strikesSpain[locale]}/)`), `${article.entryKey}/${locale}: no Spain strikes hub`);
      assert.ok(!items.includes(`](/${locale}/${B2_PATHS.strikes[locale]}/)`), `${article.entryKey}/${locale}: Catalan strikes hub in the rail`);
      assert.ok(!items.includes(`](/${locale}/${B2_PATHS.strike11n[locale]}/)`), `${article.entryKey}/${locale}: Catalan 11N page in the rail`);
    }
    // The Catalan 11N page (strike-11n.ts) keeps its own links: no block of this kind.
    assert.ok(!JSON.stringify(STRIKE_11N.editions[locale].blocks).includes(`"id":"${AFTER_STRIKE_ID[locale]}"`), `11N/${locale}`);
  }
});
