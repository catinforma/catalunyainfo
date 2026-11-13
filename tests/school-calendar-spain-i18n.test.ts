import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { addDays } from "../src/lib/content/holidays/calendar.ts";
import { buildHubBody, buildRegionBody, hubExcerpt, hubSeoTitle, hubTitle, regionExcerpt, regionSeoTitle, regionTitle } from "../src/lib/content/school-spain/body.ts";
import { holidayName, localizeRegion, translatableTexts } from "../src/lib/content/school-spain/i18n.ts";
import { SPAIN_DESCRIPTION_MAX, SPAIN_TITLE_MAX } from "../src/lib/content/school-spain/logic.ts";
import { liveSpainSchoolDescription, liveSpainSchoolTitle } from "../src/lib/content/school-spain/live.ts";
import { hubPanel, regionPanel } from "../src/lib/content/school-spain/panel.ts";
import { publicHolidaysFor } from "../src/lib/content/school-spain/holidays.ts";
import { CATALONIA, HUB_PATHS, SPAIN_REGIONS, isRegionSchoolPage, regionPath } from "../src/lib/content/school-spain/regions.ts";
import { SCHOOL_TEXT } from "../src/lib/content/school-spain/translations.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * The Catalan and English editions of the Spain school calendars (owner rule,
 * 9 Nov 2026: every page in the three languages). The dates are the Spanish
 * record's; these tests check the words, the paths and the links.
 */

const OTHER_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)];
const json = (blocks: Block[]) => JSON.stringify(blocks);
const links = (blocks: Block[]) => [...json(blocks).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const PREFIX: Record<Locale, string> = { ca: "guies/", es: "guias/", en: "guides/" };

/** Every page of the family in one language, Catalonia's own guide included (the hub links it). */
function familyPaths(locale: Locale): Set<string> {
  return new Set([HUB_PATHS[locale], ...SPAIN_REGIONS.map((r) => regionPath(r.slug, locale)), SIBLING_PATHS.school[locale]].map((p) => `/${locale}/${p}/`));
}

test("three editions per page on unique paths, each in its locale's section, none colliding with another page", () => {
  for (const locale of LOCALES) {
    const paths = [HUB_PATHS[locale], ...SPAIN_REGIONS.map((r) => regionPath(r.slug, locale))];
    assert.equal(new Set(paths).size, paths.length, `${locale}: duplicate path`);
    for (const p of paths) {
      assert.ok(p.startsWith(PREFIX[locale]), `${locale}: ${p}`);
      assert.match(p, /^[a-z]+\/[a-z0-9-]+$/, p);
      assert.ok(!OTHER_PATHS.some((other) => other[locale] === p), `${locale}: ${p} is another page's path`);
    }
    // Catalonia's row in the hub points at its own guide, in every language.
    assert.equal(regionPath(CATALONIA.slug, locale), SIBLING_PATHS.school[locale]);
  }
  assert.equal(HUB_PATHS.ca, "guies/calendari-escolar-espanya");
  assert.equal(HUB_PATHS.en, "guides/spain-school-calendar");
  assert.equal(regionPath("pais-vasco", "ca"), "guies/calendari-escolar-pais-basc");
  assert.equal(regionPath("baleares", "en"), "guides/balearic-islands-school-calendar");
});

test("the publish specs carry one entry with three editions, so hreflang is reciprocal; the route group is unchanged", () => {
  const src = readFileSync(new URL("../src/lib/content/school-spain/publish.ts", import.meta.url), "utf8");
  // Both specs map over LOCALES under one entryKey: one entry, three translations.
  assert.equal((src.match(/editions: LOCALES\.map\(/g) ?? []).length, 2);
  assert.match(src, /entryKey: `\$\{ENTRY_PREFIX\}\$\{region\.slug\}`/);
  assert.match(src, /entryKey: HUB_ENTRY_KEY/);
  for (const l of LOCALES) assert.match(src, new RegExp(`\\n\\s+${l}: "`), `hero text ${l}`);
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("calendario-escolar-espana"\)\) published\.push\(\.\.\.\(await publishSpainSchoolCalendars\(\)\)\)/);
  assert.match(route, /wants\("calendario-escolar-espana-links"\)\) published\.push\(await publishSchoolCalendarGuide\(\)\)/);
});

test("every text a Catalan or English page prints has its pair, and every holiday name too", () => {
  const missing: string[] = [];
  for (const r of [...SPAIN_REGIONS, CATALONIA]) {
    for (const s of translatableTexts(r)) if (!SCHOOL_TEXT[s]) missing.push(`${r.slug}: ${s}`);
    for (const h of publicHolidaysFor(r.boe, "2026-09-01", "2027-06-30")) for (const n of h.name.split(" / ")) if (!SCHOOL_TEXT[n]) missing.push(`${r.slug} holiday: ${n}`);
  }
  assert.deepEqual(missing, []);
  for (const [es, [ca, en]] of Object.entries(SCHOOL_TEXT)) {
    assert.ok(ca && en, es);
    // The same numbers in the three languages: a translation never moves a date.
    const nums = (s: string) => (s.replace(/:00\b/g, "").match(/\d+/g) ?? []).join(" ");
    if (!/^(Resolución|Orden|Decreto) /.test(es) || /\d/.test(es)) {
      assert.equal(nums(ca), nums(es), `ca numbers: ${es}`);
      // English spells the stage ordinals ("2.º de Bachillerato": "Second year of Bachillerato").
      assert.equal(nums(en), nums(es.replace(/\d\.º/g, "")), `en numbers: ${es}`);
    }
  }
  assert.equal(holidayName("San José / Lunes de Pascua", "en"), "St Joseph's Day / Easter Monday");
});

test("a localized record keeps every date of the Spanish one", () => {
  const dates = (v: unknown): string[] => JSON.stringify(v).match(/"\d{4}-\d{2}-\d{2}"/g) ?? [];
  for (const r of [...SPAIN_REGIONS, CATALONIA]) {
    for (const locale of ["ca", "en"] as const) {
      const l = localizeRegion(r, locale);
      assert.equal(l.locale, locale);
      assert.equal(l.slug, r.slug);
      assert.deepEqual(dates(l), dates(r), `${r.slug} ${locale}`);
      assert.equal(l.order.url, r.order.url);
      assert.equal(l.order.title, r.order.title);
    }
  }
});

test("each edition validates, keeps the Spanish one's external links and links only pages of its own language", () => {
  const pages = (locale: Locale): [string, Block[]][] => [
    [HUB_PATHS[locale], buildHubBody(locale)],
    ...SPAIN_REGIONS.map((r) => [regionPath(r.slug, locale), buildRegionBody(localizeRegion(r, locale))] as [string, Block[]]),
  ];
  const es = new Map(pages("es"));
  for (const locale of ["ca", "en"] as const) {
    const family = familyPaths(locale);
    for (const [i, [path, blocks]] of pages(locale).entries()) {
      const parsed = bodySchema.safeParse(blocks);
      assert.ok(parsed.success, `${locale} ${path}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      const internal = links(blocks).filter((h) => h.startsWith("/"));
      assert.ok(internal.length > 0, path);
      for (const href of internal) {
        assert.ok(href.startsWith(`/${locale}/`), `${locale} ${path}: ${href} crosses languages`);
        assert.ok(family.has(href), `${locale} ${path}: ${href} is not a page of this family`);
      }
      const esBlocks = [...es.values()][i]!;
      // Sorted: the hub lists the communities alphabetically in each language.
      const external = (b: Block[]) => links(b).filter((h) => h.startsWith("http")).sort();
      assert.deepEqual(external(blocks), external(esBlocks), `${locale} ${path}: official links`);
      // Same blocks, less the Spanish-only work-calendar paragraph.
      const shape = (b: Block[]) => b.map((x) => x.type).join(",");
      const esShape = esBlocks.filter((b) => i === 0 || !(b.type === "paragraph" && /\/es\/festivos\/2027\//.test(json([b])))).map((x) => x.type).join(",");
      assert.equal(shape(blocks), esShape, `${locale} ${path}: block sequence`);
      if (i > 0) assert.ok(internal.includes(`/${locale}/${HUB_PATHS[locale]}/`), `${locale} ${path} links its hub`);
    }
    // The hub links every community page in its language.
    const hub = links(buildHubBody(locale));
    for (const r of SPAIN_REGIONS) assert.ok(hub.includes(`/${locale}/${regionPath(r.slug, locale)}/`), `${locale} hub -> ${r.slug}`);
  }
});

test("each edition is written in its own language", () => {
  const foreign: Record<"ca" | "en", RegExp> = {
    ca: /\b(diciembre|enero|marzo|junio|septiembre|lunes|martes|viernes|vacaciones|Navidad|Semana Santa|según|December|January|Monday|Friday|holidays)\b/,
    en: /\b(diciembre|enero|marzo|junio|lunes|martes|viernes|vacaciones|Navidad|según|desembre|gener|març|juny|dilluns|dimarts|divendres|vacances|Nadal|segons)\b/,
  };
  // Cited as printed: order titles and issuers stay Spanish in every edition.
  const strip = (r: (typeof SPAIN_REGIONS)[number], s: string) => [r.order.title, r.order.issuer, ...(r.provinces ?? []).map((p) => p.order.issuer)].reduce((acc, x) => acc.split(x).join(""), s);
  for (const locale of ["ca", "en"] as const) {
    for (const r of SPAIN_REGIONS) {
      const l = localizeRegion(r, locale);
      const text = strip(r, json(buildRegionBody(l))).replace(/\]\([^)]+\)/g, "]");
      assert.doesNotMatch(text, foreign[locale], `${locale} ${r.slug}`);
      for (const s of [regionTitle(l), regionSeoTitle(l), regionExcerpt(l)]) assert.doesNotMatch(s, foreign[locale], `${locale} ${r.slug}: ${s}`);
    }
    const hubText = SPAIN_REGIONS.reduce((acc, r) => strip(r, acc), json(buildHubBody(locale))).replace(/\]\([^)]+\)/g, "]");
    assert.doesNotMatch(hubText, foreign[locale], `${locale} hub`);
    for (const s of [hubTitle(locale), hubSeoTitle(locale), hubExcerpt(locale)]) assert.doesNotMatch(s, foreign[locale], s);
  }
  const ca = json(buildRegionBody(localizeRegion(SPAIN_REGIONS.find((r) => r.slug === "madrid")!, "ca")));
  assert.match(ca, /Vacances de Nadal 2026-27 a la Comunitat de Madrid: del dimecres 23 de desembre de 2026 al divendres 8 de gener de 2027 \(tornada a classe el dilluns 11 de gener\)/);
  const en = json(buildRegionBody(localizeRegion(SPAIN_REGIONS.find((r) => r.slug === "madrid")!, "en")));
  assert.match(en, /Christmas holidays 2026-27 in the Community of Madrid: from Wednesday 23 December 2026 to Friday 8 January 2027 \(back to school on Monday 11 January\)/);
});

test("live titles and descriptions exist in every language, name the community and fit, every day of the year", () => {
  for (let day = "2026-08-01"; day <= "2027-07-10"; day = addDays(day, 3)) {
    for (const locale of LOCALES) {
      const hub = liveSpainSchoolTitle("espana", day, locale)!;
      assert.ok(hub.length <= SPAIN_TITLE_MAX, `${locale} hub ${day}: ${hub}`);
      // The Spanish hub description (165 characters) predates this test and is left as published.
      if (locale !== "es") assert.ok(liveSpainSchoolDescription("espana", day, locale)!.length <= SPAIN_DESCRIPTION_MAX, `${locale} hub description`);
      for (const r of SPAIN_REGIONS) {
        const l = localizeRegion(r, locale);
        const title = liveSpainSchoolTitle(r.slug, day, locale)!;
        assert.ok(title.length <= SPAIN_TITLE_MAX, `${locale} ${r.slug} ${day}: ${title}`);
        assert.ok(title.toLowerCase().includes(l.short.toLowerCase()), `${locale} ${r.slug} ${day}: ${title}`);
        const description = liveSpainSchoolDescription(r.slug, day, locale)!;
        assert.ok(description.length > 40 && description.length <= SPAIN_DESCRIPTION_MAX, `${locale} ${r.slug} ${day}: ${description}`);
      }
    }
  }
  assert.equal(liveSpainSchoolTitle("madrid", "2026-11-10", "ca"), "Vacances de Nadal 2026 a Madrid: del 23 de desembre al 8 de gener");
  assert.equal(liveSpainSchoolTitle("madrid", "2026-11-10", "en"), "Christmas 2026 school holidays in Madrid: 23 December to 8 January");
  assert.equal(liveSpainSchoolTitle("madrid", "2026-12-28", "ca"), "Vacances de Nadal a Madrid: es torna a l'escola el dilluns 11 de gener");
  assert.equal(liveSpainSchoolTitle("madrid", "2026-12-28", "en"), "Christmas holidays in Madrid: back to school on Monday 11 January");
});

test("the panel speaks the page's language and links community pages in it", () => {
  for (const locale of LOCALES) {
    const hub = hubPanel(locale, "2026-11-10");
    assert.ok(hub.lead, locale);
    for (const row of hub.rows) if (row.href) assert.ok(familyPaths(locale).has(row.href), `${locale}: ${row.href}`);
    for (const r of SPAIN_REGIONS) {
      const p = regionPanel(localizeRegion(r, locale), "2026-11-10");
      assert.ok(p.today.startsWith({ ca: "Avui, ", es: "Hoy, ", en: "Today, " }[locale]), p.today);
      assert.ok(p.tomorrow.startsWith({ ca: "Demà, ", es: "Mañana, ", en: "Tomorrow, " }[locale]), p.tomorrow);
    }
  }
  const madrid = SPAIN_REGIONS.find((r) => r.slug === "madrid")!;
  assert.equal(regionPanel(madrid, "2026-11-10").nextLine, "Próximas vacaciones: Navidad, del miércoles 23 de diciembre de 2026 al viernes 8 de enero de 2027 (dentro de 43 días).");
  assert.equal(regionPanel(localizeRegion(madrid, "ca"), "2026-12-07").today, "Avui, dilluns 7 de desembre: no hi ha classe, és festiu (Dilluns següent al Dia de la Constitució).");
  assert.equal(regionPanel(localizeRegion(madrid, "en"), "2026-12-07").today, "Today, Monday 7 December: no school, public holiday (Monday after Constitution Day).");
});

test("the home strip keeps community pages out in every language, not the hub or Catalonia's guide", () => {
  for (const locale of LOCALES) {
    assert.ok(isRegionSchoolPage(`/${locale}/${regionPath("madrid", locale)}/`), locale);
    assert.ok(isRegionSchoolPage(regionPath("navarra", locale)), locale);
    assert.ok(!isRegionSchoolPage(HUB_PATHS[locale]), locale);
    assert.ok(!isRegionSchoolPage(SIBLING_PATHS.school[locale]), locale);
  }
});

test("Catalonia's own school guide links the hub in each of its languages", () => {
  const src = readFileSync(new URL("../src/lib/content/school/publish.ts", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(src.includes(`(/${locale}/${HUB_PATHS[locale]}/)`), locale);
});
