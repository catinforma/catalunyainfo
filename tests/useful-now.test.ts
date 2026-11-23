import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { B2_PATHS, B2_TITLES, b2href, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { cityNextLinks, spainNextLinks } from "../src/lib/content/batch02/strike-11n-next.ts";
import { HUB_PATHS as SCHOOL_SPAIN_HUB_PATHS } from "../src/lib/content/school-spain/regions.ts";
import {
  CATALONIA_STRIKE_KEYS,
  SPAIN_STRIKE_KEYS,
  STRIKE_11N_SPAIN_KEY_PREFIX,
  entryNextStep,
  pathOnly,
} from "../src/lib/engagement/next-step.ts";
import {
  SPAIN_2027_LABEL,
  SPAIN_DECEMBER_LABELS,
  SPAIN_SCHOOL_LABEL,
  USEFUL_NOW_MAX_LINKS,
  USEFUL_NOW_MIN_LINKS,
  USEFUL_NOW_TITLE,
  ZBE_BARCELONA_LABEL,
  ZBE_HUB_LABEL,
  ZONA_AZUL_HUB_LABEL,
  usefulNow,
  usefulNowScope,
  type UsefulNow,
} from "../src/lib/engagement/useful-now.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";
import { hubEditions as spain2027HubEditions } from "../src/lib/programmatic/spain-2027/editions.ts";
import { cityMeta as zbeCityMeta, hubMeta as zbeHubMeta } from "../src/lib/programmatic/zbe/copy.ts";
import { zbeCityBySlug } from "../src/lib/programmatic/zbe/cities.ts";
import { zbeHubPath } from "../src/lib/programmatic/zbe/paths.ts";
import { zbeFamilyPaths } from "../src/lib/programmatic/zbe/sitemap.ts";
import { hubView as zonaAzulHubView } from "../src/lib/programmatic/zona-azul/copy.ts";
import { zaHubPath } from "../src/lib/programmatic/zona-azul/paths.ts";
import { zonaAzulPaths } from "../src/lib/programmatic/zona-azul/sitemap.ts";

/**
 * "Útil ahora" (23 Nov 2026, lib/engagement/useful-now.ts): the strike pages'
 * list of evergreen pages. Every link a page the site builds and indexes, in
 * the page's language, 3 to 5 links, never the page itself nor a link of the
 * page's "next useful step" box, anchors that are the target's own title,
 * December links gone once the bridge is past, and clicks measured.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const AS_OF = "2026-11-23";

function knownPaths(locale: Locale): Set<string> {
  return new Set([
    ...Object.values(B2_PATHS).map((paths) => `/${locale}/${paths[locale]}/`),
    ...zbeFamilyPaths().map((p) => p.path),
    ...zonaAzulPaths().map((p) => p.path),
    `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`,
    spain2027HubEditions()[locale],
  ]);
}
const KNOWN = Object.fromEntries(LOCALES.map((locale) => [locale, knownPaths(locale)])) as Record<Locale, Set<string>>;

function assertList(data: UsefulNow | null, locale: Locale, self: string, what: string, today = AS_OF) {
  assert.ok(data, `${what}: no list`);
  assert.ok(data.links.length >= USEFUL_NOW_MIN_LINKS && data.links.length <= USEFUL_NOW_MAX_LINKS, `${what}: ${data.links.length} links`);
  const paths = data.links.map((link) => pathOnly(link.href));
  assert.equal(new Set(paths).size, paths.length, `${what}: a link twice`);
  for (const link of data.links) {
    const path = pathOnly(link.href);
    assert.ok(path.startsWith(`/${locale}/`) && path.endsWith("/"), `${what}: ${link.href} is not a ${locale} page path`);
    assert.ok(KNOWN[locale].has(path), `${what}: ${link.href} is not a page the site builds`);
    assert.ok(!isLowDemandPath(path, today), `${what}: ${link.href} is noindex (low-demand.ts)`);
    assert.notEqual(path, pathOnly(self), `${what}: links itself`);
    assert.ok(!/strike|huelga|vaga/i.test(path), `${what}: ${link.href} is a strike page, not an evergreen one`);
    assert.ok(link.label.trim().length >= 12 && !/^(aquí|here|click|clic|más|more|leer)/i.test(link.label), `${what}: anchor "${link.label}"`);
  }
}

const STRIKE_KEYS: readonly B2Key[] = [...CATALONIA_STRIKE_KEYS, ...SPAIN_STRIKE_KEYS];

test("every strike page of Catalonia and Spain gets the list in ca, es and en, without the links of its next-step box", () => {
  for (const key of STRIKE_KEYS) {
    for (const locale of LOCALES) {
      const href = b2href(key, locale);
      const entry = { href, key: null, locale };
      const step = entryNextStep(entry, AS_OF);
      const data = usefulNow(entry, step, AS_OF);
      assertList(data, locale, href, `${key}/${locale}`);
      const stepPaths = new Set((step?.links ?? []).map((l) => pathOnly(l.href)));
      for (const link of data!.links) assert.ok(!stepPaths.has(pathOnly(link.href)), `${key}/${locale}: ${link.href} already in the next-step box`);
      assert.equal(data!.scope, CATALONIA_STRIKE_KEYS.includes(key) ? "catalonia" : "spain");
    }
  }
});

test("off the strike families, and on the 11N pages for the rest of Spain (their 'Y ahora en' section), there is no list", () => {
  for (const locale of LOCALES) {
    for (const key of ["decemberBridge", "shops", "workCalendar", "parking", "museums", "voting"] as B2Key[]) {
      assert.equal(usefulNowScope({ href: b2href(key, locale), key: null }), null, `${key}/${locale}`);
    }
    for (const ref of STRIKE_11N_CITY_REFS) {
      const href = strike11nCityHref(ref.key, locale);
      assert.equal(usefulNow({ href, key: `${STRIKE_11N_SPAIN_KEY_PREFIX}${ref.key}`, locale }, null, AS_OF), null, `11N ${ref.key}/${locale}`);
    }
  }
  assert.equal(usefulNowScope({ href: "/es/guias/no-existe/", key: null }), null);
});

test("Catalonia: the December bridge, shops, the 2027 work calendar, Barcelona parking and the Barcelona ZBE, in that order", () => {
  for (const locale of LOCALES) {
    const href = b2href("strikeEducation", locale);
    const data = usefulNow({ href, key: null, locale }, null, AS_OF)!;
    assert.deepEqual(
      data.links.map((l) => l.href),
      [b2href("decemberBridge", locale), b2href("shops", locale), b2href("workCalendar", locale), b2href("parking", locale), `/${locale}/${locale === "en" ? "low-emission-zones" : "zbe"}/barcelona/`],
    );
    for (const key of ["decemberBridge", "shops", "workCalendar", "parking"] as B2Key[]) {
      assert.ok(data.links.some((l) => l.label === B2_TITLES[key][locale]), `${locale}: ${key} anchor is not the page's title`);
    }
  }
});

test("Spain: the December bridge and shops by community, school holidays, zona azul and ZBE hubs", () => {
  for (const locale of LOCALES) {
    const data = usefulNow({ href: b2href("strike20n", locale), key: null, locale }, null, AS_OF)!;
    assert.deepEqual(
      data.links.map((l) => l.href),
      [b2href("decemberBridgeSpain", locale), b2href("shopsSpainDecember", locale), `/${locale}/${SCHOOL_SPAIN_HUB_PATHS[locale]}/`, zaHubPath(locale), zbeHubPath(locale)],
    );
    assert.ok(data.links.every((l) => !l.href.includes("/rodalies/")), `${locale}: Rodalies on a page for the rest of Spain`);
  }
});

test("the seasonal links move with the strikes as-of date and never point at a past December", () => {
  for (const locale of LOCALES) {
    const cat = (asOf: string) => usefulNow({ href: b2href("strikes", locale), key: null, locale }, null, asOf)!.links[0]!.href;
    assert.equal(cat("2026-12-08"), b2href("decemberBridge", locale));
    assert.equal(cat("2026-12-09"), b2href("christmasTransport", locale));
    assert.equal(cat("2027-01-07"), b2href("christmasTransport", locale));
    assert.equal(cat("2027-01-08"), b2href("bridges2027", locale));

    for (const asOf of ["2026-12-09", "2027-01-08", "2027-03-01"]) {
      const spain = usefulNow({ href: b2href("strikesSpain", locale), key: null, locale }, null, asOf);
      assertList(spain, locale, b2href("strikesSpain", locale), `spain ${asOf}/${locale}`, asOf);
      const paths = spain!.links.map((l) => l.href);
      assert.ok(!paths.includes(b2href("decemberBridgeSpain", locale)) && !paths.includes(b2href("shopsSpainDecember", locale)), `${asOf}: December link after the bridge`);
    }
  }
});

test("anchors are the targets' own titles, or the sentence the 11N pages already link them with", () => {
  const zbeBarcelona = zbeCityBySlug("barcelona");
  assert.ok(zbeBarcelona, "no Barcelona ZBE page");
  for (const locale of LOCALES) {
    assert.equal(ZONA_AZUL_HUB_LABEL[locale], zonaAzulHubView(locale).title, `${locale}: zona azul hub title`);
    assert.equal(ZBE_HUB_LABEL[locale], zbeHubMeta(locale).title, `${locale}: ZBE hub title`);
    assert.equal(ZBE_BARCELONA_LABEL[locale], zbeCityMeta(zbeBarcelona, locale).title, `${locale}: Barcelona ZBE title`);
    const spain = spainNextLinks(locale).join("\n");
    for (const label of [SPAIN_SCHOOL_LABEL[locale], SPAIN_2027_LABEL[locale], SPAIN_DECEMBER_LABELS.bridge[locale], SPAIN_DECEMBER_LABELS.shops[locale]]) {
      assert.ok(spain.includes(`[${label}](`), `${locale}: "${label}" is not the 11N Spain page's anchor`);
    }
    // The city pages link the same December pages with the same words.
    assert.ok(cityNextLinks("sevilla", "Sevilla", locale).join("\n").includes(`[${SPAIN_DECEMBER_LABELS.bridge[locale]}](`));
    assert.ok(USEFUL_NOW_TITLE[locale].length > 0);
  }
});

test("the template renders the list after the body, and a click in it is related_content_click with link_context useful_now", () => {
  const article = read("src/components/pages/EntryArticle.tsx");
  const list = article.indexOf("<UsefulNow data={useful}");
  assert.ok(list > 0, "EntryArticle does not render UsefulNow");
  assert.ok(list > article.indexOf("<BlockRenderer body={body}") && list < article.indexOf("{entry.sources.length > 0 ? ("), "the list is not between the body and the sources");
  const component = read("src/components/UsefulNow.tsx");
  assert.match(component, /data-ci-placement="useful_now"/);
  assert.match(component, /IntentLink/);

  const base = { siteHost: "www.catalunyainfo.com", locale: "es", channelUrl: "https://whatsapp.com/channel/x", inSources: false, inCalculator: false };
  assert.deepEqual(
    classifyLinkClick({ ...base, href: "https://www.catalunyainfo.com/es/zona-azul/?x=1#madrid", placement: "useful_now" }),
    { name: "related_content_click", params: { link_context: "useful_now", link_url: "/es/zona-azul/", locale: "es" } },
  );
});
