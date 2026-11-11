import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";

import { widgetCopy } from "../src/lib/programmatic/embed-2027/copy.ts";
import {
  EMBED_LOCALES,
  WIDGET_SLUG,
  attributionPath,
  indexableHubPath,
  embedCityPath,
  embedCityStaticParams,
  embedId,
  embedPath,
  embedTownPath,
  embedTownStaticParams,
  fullPagePath,
  pickerGroups,
  resolveEmbedCity,
  resolveEmbedTown,
  widgetEditions,
  widgetLinkFor,
  widgetPagePath,
  widgetSitemapEntries,
  type EmbedPlace,
} from "../src/lib/programmatic/embed-2027/places.ts";
import { embedModel, esc, renderEmbed } from "../src/lib/programmatic/embed-2027/render.ts";
import { councilApproved2027, municipalities, nextYearFor } from "../src/lib/programmatic/holidays/data.ts";
import { hasEnglishPage } from "../src/lib/programmatic/holidays/english.ts";
import { holidaySitemapEntries, municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { CITIES, commonLocalDays, localDays } from "../src/lib/programmatic/spain-2027/cities.ts";
import { COMMUNITIES } from "../src/lib/programmatic/spain-2027/communities.ts";
import { editionCommunities, editionPaths, editionSitemapEntries } from "../src/lib/programmatic/spain-2027/editions.ts";
import { spainDaySitemapEntries, spainPaths, spainSitemapEntries } from "../src/lib/programmatic/spain-2027/paths.ts";
import { EMBED_SOURCE, NOT_EMBED_SOURCE } from "../src/lib/security-headers.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";
import { absoluteUrl } from "../src/lib/site.ts";

/**
 * The embeddable 2027 work calendar (lib/programmatic/embed-2027/,
 * src/app/embed/) and the page that hands out its code.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const PUBLIC = join(ROOT, "src", "app", "(public)", "[locale]");

const towns: EmbedPlace[] = municipalities().map((m) => ({ kind: "town", m }));
const cities: EmbedPlace[] = CITIES.map((c) => ({ kind: "city", c }));
const places = [...towns, ...cities];

/* -------------------------------------------------------------------------- */
/* Headers: framing only on /embed/, the rest of the site keeps DENY          */
/* -------------------------------------------------------------------------- */

type HeaderRule = { source: string; has?: unknown[]; missing?: { type: string; value: string }[]; headers: { key: string; value: string }[] };

// Next's own matcher for `headers()` sources (server/lib/router-utils/filesystem.js), trailing slash included.
const require = createRequire(import.meta.url);
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match.js") as {
  getPathMatch: (source: string, options: object) => (path: string) => false | object;
};
const { modifyRouteRegex } = require("next/dist/lib/redirect-status.js") as { modifyRouteRegex: (regex: string) => string };

function matches(source: string, path: string): boolean {
  return Boolean(getPathMatch(source, { strict: true, removeUnnamedParams: true, regexModifier: (r: string) => modifyRouteRegex(r) })(path));
}

/** The headers a path gets on the canonical host: every matching rule in order, the later one winning per key. */
function effectiveHeaders(rules: HeaderRule[], path: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rule of rules) {
    if (!matches(rule.source, path)) continue;
    if (rule.missing?.some((m) => m.type === "host" && new RegExp(`^${m.value}$`).test("www.catalunyainfo.com"))) continue;
    for (const h of rule.headers) out.set(h.key.toLowerCase(), h.value);
  }
  return out;
}

async function rules(env: Record<string, string | undefined>): Promise<HeaderRule[]> {
  const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  Object.assign(process.env, env);
  try {
    const url = `${new URL("../next.config.ts", import.meta.url).href}?embed=${encodeURIComponent(JSON.stringify(env))}`;
    const { default: config } = await import(url);
    return (await config.headers()) as HeaderRule[];
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const SITE_PATHS = ["/", "/ca/", "/es/festivos/2027/", "/ca/festius/barcelona/", "/ca/festius/2027/al-teu-web/", "/en/guides/x/", "/admin/", "/api/contact/", "/embedded/", "/ca/embed/"];
const EMBED_PATHS = ["/embed/ca/2027/barcelona/", "/embed/es/2027/andalucia/sevilla/", "/embed/en/2027/l-hospitalet-de-llobregat/", "/embed/", "/embed"];

test("headers: X-Frame-Options DENY and frame-ancestors 'none' everywhere but /embed/", async () => {
  for (const env of [
    { VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" },
    { VERCEL_ENV: undefined, SITE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" },
    { VERCEL_ENV: "preview", NEXT_PUBLIC_ALLOW_INDEXING: undefined },
  ]) {
    const all = await rules(env);
    for (const path of SITE_PATHS) {
      const h = effectiveHeaders(all, path);
      assert.equal(h.get("x-frame-options"), "DENY", `${path} ${JSON.stringify(env)}`);
      assert.match(h.get("content-security-policy") ?? "", /frame-ancestors 'none'/, path);
      assert.doesNotMatch(h.get("content-security-policy") ?? "", /frame-ancestors \*/, path);
      assert.equal(h.get("strict-transport-security"), "max-age=63072000; includeSubDomains; preload", path);
    }
    for (const path of EMBED_PATHS) {
      const h = effectiveHeaders(all, path);
      assert.equal(h.get("x-frame-options"), undefined, `${path}: no X-Frame-Options`);
      const csp = h.get("content-security-policy") ?? "";
      assert.match(csp, /frame-ancestors \*/, path);
      assert.doesNotMatch(csp, /frame-ancestors 'none'/, path);
      // Nothing to load: no script source at all, so default-src 'none' covers it.
      assert.match(csp, /default-src 'none'/, path);
      assert.doesNotMatch(csp, /script-src|googletagmanager|google-analytics/, path);
      assert.match(h.get("x-robots-tag") ?? "", /\bnoindex\b/, `${path}: noindex`);
      assert.doesNotMatch(h.get("x-robots-tag") ?? "", /nofollow/, `${path}: the attribution link stays followed`);
      // The rest of the security set still applies.
      assert.equal(h.get("x-content-type-options"), "nosniff", path);
      assert.equal(h.get("referrer-policy"), "strict-origin-when-cross-origin", path);
    }
  }
  // The source patterns themselves, with Next's matcher.
  assert.ok(matches(EMBED_SOURCE, "/embed/ca/2027/barcelona/"));
  assert.ok(!matches(EMBED_SOURCE, "/embedded/"));
  assert.ok(matches(NOT_EMBED_SOURCE, "/"));
  assert.ok(matches(NOT_EMBED_SOURCE, "/embedded/"));
  assert.ok(!matches(NOT_EMBED_SOURCE, "/embed/es/2027/madrid/madrid/"));
});

test("headers: the proxy never sees /embed/, and keeps DENY on what it answers", () => {
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /matcher: \["\/", "\/admin\/:path\*", "\/article\/:path\*"\]/);
  const security = read("src/lib/security-headers.ts");
  assert.match(security, /"X-Frame-Options": "DENY"/);
  assert.match(security, /`frame-ancestors 'none'`/);
});

/* -------------------------------------------------------------------------- */
/* The widget document                                                        */
/* -------------------------------------------------------------------------- */

test("widget: noindex, no script, no tracking, no request to anyone", () => {
  for (const locale of EMBED_LOCALES) {
    for (const place of [towns[0]!, cities[0]!]) {
      const html = renderEmbed(locale, place);
      assert.match(html, /^<!doctype html>/);
      assert.match(html, new RegExp(`<html lang="${locale}">`));
      assert.match(html, /<meta name="robots" content="noindex[^"]*">/);
      assert.doesNotMatch(html, /<script|<iframe|<img|<link |@import|url\(|cookie|gtag|googletagmanager|analytics/i);
      // No canonical: a noindex document does not point Google anywhere else.
      assert.doesNotMatch(html, /rel="canonical"/);
    }
  }
});

const LEAD = { ca: "Font:", es: "Fuente:", en: "Source:" } as const;
const attribution = (locale: (typeof EMBED_LOCALES)[number], path: string) =>
  `${LEAD[locale]} <a href="${esc(absoluteUrl(path))}" target="_blank" rel="noopener">CatalunyaInfo</a>`;
const HUB_2027 = { ca: "/ca/festius/2027/", es: "/es/festivos/2027/", en: "/en/holidays/2027/" } as const;

test("widget: every place carries the attribution link, plain and followed, to an indexed page", () => {
  let toHub = 0;
  for (const locale of EMBED_LOCALES) {
    for (const place of places) {
      const html = renderEmbed(locale, place);
      const full = fullPagePath(locale, place);
      // The full page, unless it is kept out of the index: then the language's 2027 hub.
      const expected = isLowDemandPath(full) ? HUB_2027[locale] : full;
      if (expected !== full) toHub += 1;
      assert.equal(attributionPath(locale, place), expected);
      assert.ok(!isLowDemandPath(expected), `${locale} ${embedId(place)}: lands on an indexed page`);
      assert.ok(html.includes(attribution(locale, expected)), `${locale} ${embedId(place)}`);
      // Official sources are nofollow, the attribution never is.
      const footer = html.slice(html.indexOf("<footer>"));
      assert.doesNotMatch(footer, /nofollow|sponsored|ugc/, `${locale} ${embedId(place)}`);
    }
  }
  assert.ok(toHub > 0, "the low-demand fallback is exercised");
});

test("widget: a low-demand town links the 2027 hub, an indexable town its own page", () => {
  const listed = municipalities().find((m) => isLowDemandPath(municipalityPath("ca", m.slug)) && isLowDemandPath(municipalityPath("es", m.slug)))!;
  assert.ok(listed, "a town on the low-demand list");
  for (const locale of ["ca", "es"] as const) {
    const html = renderEmbed(locale, { kind: "town", m: listed });
    assert.ok(html.includes(attribution(locale, HUB_2027[locale])), `${listed.slug} ${locale}`);
    assert.ok(!html.includes(`href="${esc(absoluteUrl(municipalityPath(locale, listed.slug)))}"`), `${listed.slug} ${locale}: never its noindex page`);
  }
  const indexable = resolveEmbedTown("ca", "barcelona")!;
  assert.ok(!isLowDemandPath("/ca/festius/barcelona/") && !isLowDemandPath("/es/festivos/barcelona/"));
  assert.ok(renderEmbed("ca", indexable).includes(attribution("ca", "/ca/festius/barcelona/")));
  assert.ok(renderEmbed("es", indexable).includes(attribution("es", "/es/festivos/barcelona/")));
  for (const locale of EMBED_LOCALES) assert.equal(indexableHubPath(locale), HUB_2027[locale]);
});

test("widget: the full page it links to exists in that language (or the town's Catalan page)", () => {
  const codePages = new Set([...spainPaths(), ...editionPaths()]);
  for (const place of towns) {
    if (place.kind !== "town") continue;
    assert.equal(fullPagePath("ca", place), municipalityPath("ca", place.m.slug));
    assert.equal(fullPagePath("es", place), municipalityPath("es", place.m.slug));
    assert.equal(fullPagePath("en", place), hasEnglishPage(place.m.slug) ? municipalityPath("en", place.m.slug) : municipalityPath("ca", place.m.slug));
  }
  for (const place of cities) {
    for (const locale of EMBED_LOCALES) assert.ok(codePages.has(fullPagePath(locale, place)), `${locale} ${embedId(place)}`);
  }
  assert.ok(!JSON.stringify(places.map((p) => EMBED_LOCALES.map((l) => fullPagePath(l, p)))).includes("aerobusbcn"));
});

test("widget: Catalan towns show 2027 local days only from the DOGC order or the council's approval, labelled as the town pages do", () => {
  let council = 0;
  let pending = 0;
  for (const locale of EMBED_LOCALES) {
    for (const place of towns) {
      if (place.kind !== "town") continue;
      const model = embedModel(locale, place);
      const local = model.rows.filter((r) => r.local);
      const dogc = nextYearFor(place.m.slug);
      const approved = councilApproved2027(place.m.slug);
      const html = renderEmbed(locale, place);
      if (dogc) {
        assert.deepEqual([...new Set(local.map((r) => r.date))].sort(), [...new Set([...dogc.local, ...(dogc.local.length ? [] : dogc.nuclei.flatMap((n) => n.dates))])].sort());
      } else if (approved) {
        council += 1;
        assert.deepEqual(local.map((r) => r.date), [...approved.local], place.m.slug);
        const label = { ca: "pendent del DOGC", es: "pendiente del DOGC", en: "pending the DOGC order" }[locale];
        for (const r of local) assert.ok(r.notes.some((n) => n.includes(label)), `${locale} ${place.m.slug}: ${r.date} labelled pending`);
        // The council's own act is the source, with its read date.
        assert.ok(html.includes(esc(approved.source.url)), place.m.slug);
      } else {
        pending += 1;
        assert.equal(local.length, 0, `${locale} ${place.m.slug}: no local day before the order or the council`);
        assert.match(html, { ca: /encara no s&#39;han publicat/, es: /todavía no se han publicado/, en: /not out yet/ }[locale], place.m.slug);
      }
      // The Catalonia-wide days are always there, with Ordre EMT/52/2026.
      assert.ok(model.rows.filter((r) => !r.local).length >= 12, place.m.slug);
      assert.match(html, /Ordre EMT\/52\/2026/);
    }
  }
  assert.ok(council > 0 && pending > 0, "both cases are exercised");
});

test("widget: Spanish cities show 2027 local days only where the city's list is published", () => {
  let published = 0;
  let notYet = 0;
  for (const locale of EMBED_LOCALES) {
    for (const place of cities) {
      if (place.kind !== "city") continue;
      const { c } = place;
      const local = embedModel(locale, place).rows.filter((r) => r.local).map((r) => r.date).sort();
      const html = renderEmbed(locale, place);
      if (c.status2027 === "published") {
        published += 1;
        assert.deepEqual(local, localDays(c).map((d) => d.date).sort(), c.slug);
        assert.ok(html.includes(esc(c.local2027!.source.url)), c.slug);
      } else {
        notYet += 1;
        // Only a day the community fixed for all its towns (Navarra's 3 December); never the 2026 list.
        assert.deepEqual(local, commonLocalDays(c).map((d) => d.date).sort(), c.slug);
        for (const d of c.local2026?.days ?? []) {
          if (!commonLocalDays(c).some((x) => x.date === d.date)) assert.ok(!local.includes(d.date), `${c.slug}: 2026 day ${d.date}`);
        }
        assert.doesNotMatch(html, /2026<\/time><\/td>/);
      }
      assert.match(html, /BOE-A-2026-21254/);
    }
  }
  assert.ok(published > 0 && notYet > 0, "both cases are exercised");
});

test("widget: every string from the data is escaped", () => {
  assert.equal(esc(`<a href="x">l'Hospitalet & co</a>`), "&lt;a href=&quot;x&quot;&gt;l&#39;Hospitalet &amp; co&lt;/a&gt;");
  const html = renderEmbed("ca", resolveEmbedTown("ca", "l-hospitalet-de-llobregat")!);
  assert.match(html, /<title>Calendari laboral 2027 de l&#39;Hospitalet de Llobregat<\/title>/);
});

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

test("routes: rendered on demand (dynamicParams = true, force-static), a handful built at deploy, 404 for the rest", async () => {
  for (const file of ["src/app/embed/[locale]/2027/[place]/route.ts", "src/app/embed/[locale]/2027/[place]/[city]/route.ts"]) {
    const source = read(file);
    assert.match(source, /^export const dynamic = "force-static";$/m, file);
    assert.match(source, /^export const revalidate = false;$/m, file);
    assert.match(source, /^export const dynamicParams = true;$/m, file);
    assert.match(source, /export function generateStaticParams/, file);
  }
  assert.ok(embedTownStaticParams().length <= 3 && embedCityStaticParams().length <= 3);

  const town = await import("../src/app/embed/[locale]/2027/[place]/route.ts");
  const city = await import("../src/app/embed/[locale]/2027/[place]/[city]/route.ts");
  const req = new Request("http://localhost/");
  const ok = await town.GET(req, { params: Promise.resolve({ locale: "es", place: "barcelona" }) });
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-type") ?? "", /^text\/html/);
  assert.match(await ok.text(), /Calendario laboral 2027 de Barcelona/);
  for (const params of [{ locale: "fr", place: "barcelona" }, { locale: "ca", place: "atlantis" }]) {
    assert.equal((await town.GET(req, { params: Promise.resolve(params) })).status, 404, JSON.stringify(params));
  }
  const sevilla = await city.GET(req, { params: Promise.resolve({ locale: "en", place: "andalucia", city: "sevilla" }) });
  assert.equal(sevilla.status, 200);
  assert.match(await sevilla.text(), /Seville \(Andalusia\) public holidays 2027/);
  for (const params of [{ locale: "en", place: "andalusia", city: "sevilla" }, { locale: "ca", place: "andalucia", city: "barcelona" }]) {
    assert.equal((await city.GET(req, { params: Promise.resolve(params) })).status, 404, JSON.stringify(params));
  }

  assert.equal(embedTownPath("ca", "girona"), "/embed/ca/2027/girona/");
  assert.equal(embedCityPath("en", CITIES.find((c) => c.slug === "sevilla")!), "/embed/en/2027/andalucia/sevilla/");
  for (const place of places) {
    for (const locale of EMBED_LOCALES) {
      const [, , l, , a, b] = embedPath(locale, place).split("/");
      const found = b ? resolveEmbedCity(l!, a!, b) : resolveEmbedTown(l!, a!);
      assert.equal(found && embedId(found), embedId(place));
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Sitemap: the widget page, never the widgets                                */
/* -------------------------------------------------------------------------- */

test("sitemap: no /embed/ URL in any family; the widget page in three languages with reciprocal hreflang", () => {
  const urls = [...holidaySitemapEntries(), ...spainSitemapEntries(), ...spainDaySitemapEntries(), ...editionSitemapEntries(), ...widgetSitemapEntries()].map((e) => e.url);
  assert.deepEqual(urls.filter((u) => u.includes("/embed/")), []);
  const sitemap = read("src/app/sitemap.ts");
  assert.match(sitemap, /\.\.\.widgetSitemapEntries\(\)/);
  assert.doesNotMatch(sitemap, /embed-2027\/(render|response)|embedPath|embedTownPath|embedCityPath/);
  const entries = widgetSitemapEntries();
  assert.deepEqual(entries.map((e) => e.url), EMBED_LOCALES.map((l) => absoluteUrl(widgetPagePath(l))));
  for (const e of entries) {
    const langs = e.alternates?.languages as Record<string, string>;
    assert.deepEqual(Object.keys(langs).sort(), ["ca", "en", "es", "x-default"]);
    for (const l of EMBED_LOCALES) assert.equal(langs[l], absoluteUrl(widgetEditions()[l]));
  }
  // robots.txt keeps /embed/ crawlable, so crawlers see the noindex.
  assert.doesNotMatch(read("src/lib/seo/robots-rules.ts"), /\/embed/);
});

/* -------------------------------------------------------------------------- */
/* The page that hands out the code                                           */
/* -------------------------------------------------------------------------- */

test("widget page: three editions, static folders that no community slug takes, one locale each", () => {
  assert.equal(widgetPagePath("ca"), "/ca/festius/2027/al-teu-web/");
  assert.equal(widgetPagePath("es"), "/es/festivos/2027/en-tu-web/");
  assert.equal(widgetPagePath("en"), "/en/holidays/2027/for-your-website/");
  assert.ok(!COMMUNITIES.some((c) => c.slug === WIDGET_SLUG.es));
  for (const l of ["ca", "en"] as const) assert.ok(!editionCommunities(l).some((c) => c.slug === WIDGET_SLUG[l]));
  assert.ok(!municipalities().some((m) => Object.values(WIDGET_SLUG).includes(m.slug)));
  const folder = { ca: "festius/2027/al-teu-web", es: "festivos/2027/en-tu-web", en: "holidays/2027/for-your-website" } as const;
  for (const locale of EMBED_LOCALES) {
    const file = join(PUBLIC, folder[locale], "page.tsx");
    assert.ok(existsSync(file), file);
    const source = readFileSync(file, "utf8");
    assert.match(source, /^export const dynamicParams = true;$/m);
    assert.match(source, /^export const revalidate = false;$/m);
    assert.match(source, new RegExp(`if \\(locale !== "${locale}"\\) notFound\\(\\);`));
    assert.match(source, new RegExp(`<WidgetRoute locale="${locale}" />`));
    const t = widgetCopy(locale);
    assert.ok(t.title.length <= 60, t.title);
  }
  assert.equal(widgetCopy("ca").h1, "Posa el calendari laboral 2027 al teu web");
  assert.equal(widgetCopy("es").h1, "Pon el calendario laboral 2027 en tu web");
  assert.equal(widgetCopy("en").h1, "Add the 2027 holiday calendar to your website");
});

test("widget page: the picker lists every town and city once, and the browser builds the same URLs as the server", () => {
  for (const locale of EMBED_LOCALES) {
    const groups = pickerGroups(locale);
    const seen = new Map<string, { embed: string; page: string }>();
    for (const g of groups) {
      for (const [value, , flag] of g.items) {
        assert.ok(!seen.has(value), `${locale} ${value} twice`);
        const slug = value.split("/").at(-1)!;
        // Exactly what EmbedBuilder.tsx computes.
        const page = flag === 2 ? g.hubPath : `${flag === 1 && g.altPagePrefix ? g.altPagePrefix : g.pagePrefix}${slug}/`;
        seen.set(value, { embed: `${g.embedPrefix}${value}/`, page });
      }
    }
    assert.equal(seen.size, places.length, locale);
    for (const place of places) {
      const got = seen.get(embedId(place));
      assert.ok(got, `${locale} ${embedId(place)} missing`);
      assert.equal(got.embed, embedPath(locale, place));
      // The code's plain link goes where the widget's attribution goes: never to a noindex page.
      assert.equal(got.page, attributionPath(locale, place));
      assert.ok(!isLowDemandPath(got.page), `${locale} ${embedId(place)}`);
    }
    assert.ok(seen.has("barcelona"), "the server-rendered default");
  }
  const builder = read("src/components/programmatic/embed-2027/EmbedBuilder.tsx");
  assert.match(builder, /^"use client";/);
  assert.match(builder, /\$\{g\.embedPrefix\}\$\{value\}\//);
  assert.match(builder, /flag === 2 \? g\.hubPath : `\$\{flag === 1 && g\.altPagePrefix \? g\.altPagePrefix : g\.pagePrefix\}\$\{slug\}\/`/);
  // The pasted code: the iframe, then a plain link to the full page (the one that earns the link), and the link-only alternative.
  assert.match(builder, /<iframe src=/);
  assert.match(builder, /<p><a href="\$\{attr\(origin \+ choice\.page\)\}">/);
  assert.match(builder, /const linkCode = `<a href=/);
  assert.doesNotMatch(builder, /nofollow/);
});

test("links: the three 2027 hubs, every town page and every city page link the widget page", () => {
  assert.match(read("src/components/programmatic/spain-2027/pages.tsx"), /<WidgetHubLink locale="es" \/>/);
  assert.match(read("src/components/programmatic/spain-2027/pages-intl.tsx"), /<WidgetHubLink locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/holidays/MunicipalityPage.tsx"), /<WidgetPlaceLink locale=\{locale\} place=\{\{ kind: "town", m \}\} \/>/);
  assert.match(read("src/components/programmatic/holidays/EnglishTownPage.tsx"), /<WidgetPlaceLink locale="en" place=\{\{ kind: "town", m \}\} \/>/);
  assert.match(read("src/components/programmatic/spain-2027/city-page.tsx"), /<WidgetPlaceLink locale="es" place=\{\{ kind: "city", c \}\} \/>/);
  assert.match(read("src/components/programmatic/spain-2027/city-page-intl.tsx"), /<WidgetPlaceLink locale=\{locale\} place=\{\{ kind: "city", c \}\} \/>/);
  // The town link picks the town: its hash is a picker value.
  const values = new Set(pickerGroups("ca").flatMap((g) => g.items.map(([v]) => v)));
  for (const place of places) {
    const [path, hash] = widgetLinkFor("ca", place).split("#");
    assert.equal(path, widgetPagePath("ca"));
    assert.ok(values.has(hash!), hash);
  }
  assert.equal(widgetCopy("ca").ctaPlace("l'Hospitalet de Llobregat"), "Posa el calendari laboral 2027 de l'Hospitalet de Llobregat al teu web");
  assert.equal(widgetCopy("ca").ctaPlace("el Vendrell"), "Posa el calendari laboral 2027 del Vendrell al teu web");
});

test("publish group calendari-2027-widget: the widget pages and the hubs, never the /embed/ widgets", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /if \(wants\("calendari-2027-widget"\)\) codePaths\.push\(\.\.\.Object\.values\(widgetEditions\(\)\), spainHubPath\(\), editionHubPath\("ca"\), editionHubPath\("en"\)\);/);
  assert.ok(Object.values(widgetEditions()).every((p) => !p.startsWith("/embed")));
});
